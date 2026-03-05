import puppeteer from "puppeteer";
import { writeFile, readFile } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const OUTPUT_PATH = resolve(REPO_ROOT, "data", "reference", "language-reference.json");

const REFERENCE_URL = "https://www.tradingview.com/pine-script-reference/v6/";

interface Argument {
  name: string;
  type: string;
  description: string;
}

interface SeeAlso {
  name: string;
  href: string;
}

interface ReferenceEntry {
  id: string;
  name: string;
  description: string;
  syntax: string;
  arguments: Argument[];
  examples: string[];
  type: string;
  seeAlso: SeeAlso[];
}

interface LanguageReference {
  functions: Record<string, ReferenceEntry>;
  variables: Record<string, ReferenceEntry>;
  metadata: {
    scrapedAt: string;
    sourceUrl: string;
    totalItems: number;
  };
}

async function scrapeReference(): Promise<LanguageReference> {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) PineScriptMCP/1.0"
  );

  console.log(`Navigating to ${REFERENCE_URL}...`);
  await page.goto(REFERENCE_URL, { waitUntil: "networkidle2", timeout: 60000 });

  // Wait for reference items to render
  console.log("Waiting for reference items to render...");
  await page.waitForSelector(".tv-pine-reference-item", { timeout: 30000 });

  // Give extra time for all items to render
  await new Promise((r) => setTimeout(r, 3000));

  const itemCount = await page.$$eval(
    ".tv-pine-reference-item",
    (els) => els.length
  );
  console.log(`Found ${itemCount} reference items in DOM`);

  // Extract all items from the DOM
  const items = await page.$$eval(".tv-pine-reference-item", (elements) => {
    return elements.map((el) => {
      const id = el.id || "";

      // Name from header
      const header = el.querySelector(".tv-pine-reference-item__header");
      const name = header?.textContent?.trim() || "";

      // Collect all sub-sections by walking through content
      const contentEl = el.querySelector(".tv-pine-reference-item__content");
      if (!contentEl) return { id, name, sections: {} as Record<string, string>, seeAlsoLinks: [] as { name: string; href: string }[] };

      const sections: Record<string, string> = {};
      let currentSection = "description";
      const children = Array.from(contentEl.children);

      for (const child of children) {
        const classList = Array.from(child.classList);

        if (classList.includes("tv-pine-reference-item__sub-header")) {
          currentSection = child.textContent?.trim().toLowerCase() || "unknown";
        } else if (classList.includes("tv-pine-reference-item__header")) {
          // Skip the header, already captured
          continue;
        } else if (classList.includes("tv-pine-reference-item__see-also")) {
          // Extract see-also links
          const links = child.querySelectorAll("a[data-href]");
          sections["_seeAlsoLinks"] = JSON.stringify(
            Array.from(links).map((a) => ({
              name: a.textContent?.trim() || "",
              href: a.getAttribute("data-href") || "",
            }))
          );
        } else {
          // Accumulate text for current section
          const text = child.textContent?.trim() || "";
          if (text) {
            sections[currentSection] = (sections[currentSection] || "") + (sections[currentSection] ? "\n" : "") + text;
          }
        }
      }

      // Extract see-also from stored JSON
      let seeAlsoLinks: { name: string; href: string }[] = [];
      if (sections["_seeAlsoLinks"]) {
        try {
          seeAlsoLinks = JSON.parse(sections["_seeAlsoLinks"]);
        } catch {}
        delete sections["_seeAlsoLinks"];
      }

      return { id, name, sections, seeAlsoLinks };
    });
  });

  await browser.close();

  // Transform DOM data into the expected schema
  const functions: Record<string, ReferenceEntry> = {};
  const variables: Record<string, ReferenceEntry> = {};
  let skipped = 0;

  for (const item of items) {
    if (!item.id || !item.name) {
      skipped++;
      continue;
    }

    // Parse arguments from the "arguments" section text
    const args: Argument[] = [];
    const argsText = item.sections["arguments"] || "";
    if (argsText) {
      // Arguments typically appear as lines like "name (type) — description"
      // or "name (type) description"
      const argLines = argsText.split("\n").filter((l) => l.trim());
      for (const line of argLines) {
        // Match patterns like: "source (series int/float) Series..." or "source (series int/float) — Series..."
        const match = line.match(
          /^(\w+)\s*\(([^)]+)\)\s*[—–-]?\s*(.*)/
        );
        if (match) {
          args.push({
            name: match[1],
            type: match[2].trim(),
            description: match[3].trim().split(/\s+/).slice(0, 1).join(" ") || "",
          });
        }
      }
    }

    // Parse syntax from the "syntax" section
    const syntax = item.sections["syntax"]?.trim() || "";

    // Parse examples
    const examples: string[] = [];
    const exampleText = item.sections["example"] || item.sections["examples"] || "";
    if (exampleText.trim()) {
      examples.push(exampleText.trim());
    }

    // Clean the name: remove trailing () that the DOM includes for functions
    const cleanName = item.name.replace(/\(\)$/, "");

    // Clean the description: remove leading name echo (DOM renders "funcName() Description text")
    let description = (item.sections["description"] || "").replace(/\s+/g, " ").trim();
    // Strip leading name (with or without parens) from description
    const nameEscaped = cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    description = description.replace(new RegExp(`^${nameEscaped}\\(\\)\\s*`, "i"), "");
    description = description.replace(new RegExp(`^${nameEscaped}\\s+`, "i"), "");

    // Clean seeAlso names: remove trailing ()
    const seeAlso = (item.seeAlsoLinks || []).map((link) => ({
      name: link.name.replace(/\(\)$/, ""),
      href: link.href,
    }));

    const entry: ReferenceEntry = {
      id: item.id,
      name: cleanName,
      description,
      syntax,
      arguments: args,
      examples,
      type: item.sections["type"] || "",
      seeAlso,
    };

    // Route to functions or variables based on id prefix
    if (item.id.startsWith("fun_")) {
      functions[item.id] = entry;
    } else if (item.id.startsWith("var_")) {
      variables[item.id] = entry;
    } else {
      // Constants, types, keywords, enums, annotations — put in variables bucket
      // (matches existing behavior in reference-loader.ts)
      variables[item.id] = entry;
    }
  }

  console.log(
    `Extracted: ${Object.keys(functions).length} functions, ${Object.keys(variables).length} variables/other`
  );
  if (skipped > 0) console.log(`Skipped ${skipped} items (missing id/name)`);

  return {
    functions,
    variables,
    metadata: {
      scrapedAt: new Date().toISOString(),
      sourceUrl: REFERENCE_URL,
      totalItems: Object.keys(functions).length + Object.keys(variables).length,
    },
  };
}

async function main() {
  console.log("Scraping Pine Script v6 language reference...\n");

  const data = await scrapeReference();

  const totalItems = Object.keys(data.functions).length + Object.keys(data.variables).length;

  // Validate we got a reasonable amount of data
  if (totalItems < 100) {
    console.error(
      `ERROR: Only extracted ${totalItems} items (expected 900+). Aborting to prevent data loss.`
    );
    process.exit(1);
  }

  // Check if existing file exists for comparison
  try {
    const existing = JSON.parse(await readFile(OUTPUT_PATH, "utf-8"));
    const oldFuncs = Object.keys(existing.functions || {}).length;
    const oldVars = Object.keys(existing.variables || {}).length;
    const newFuncs = Object.keys(data.functions).length;
    const newVars = Object.keys(data.variables).length;

    if (newFuncs !== oldFuncs || newVars !== oldVars) {
      console.log(
        `\nChanges detected: functions ${oldFuncs} → ${newFuncs}, variables ${oldVars} → ${newVars}`
      );
    } else {
      console.log(`\nCounts unchanged: ${newFuncs} functions, ${newVars} variables`);
    }
  } catch {
    console.log("\nNo existing reference file — creating fresh.");
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(data, null, 2), "utf-8");
  console.log(`\nWritten to ${OUTPUT_PATH}`);
  console.log(`  Functions: ${Object.keys(data.functions).length}`);
  console.log(`  Variables/other: ${Object.keys(data.variables).length}`);
  console.log(`  Total: ${totalItems}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
