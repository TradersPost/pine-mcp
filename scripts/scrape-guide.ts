import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const DOCS_DIR = join(REPO_ROOT, "data", "docs");
const BASE_URL = "https://www.tradingview.com/pine-script-docs";
const SITEMAP_URL =
  "https://www.tradingview.com/pine-script-docs/sitemap-0.xml";

const DELAY_MS = parseInt(process.env.SCRAPE_DELAY || "200", 10);

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) PineScriptMCP/1.0",
    },
  });
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  return res.text();
}

async function discoverPages(): Promise<string[]> {
  try {
    const xml = await fetchText(SITEMAP_URL);
    const $ = cheerio.load(xml, { xml: true });
    const urls: string[] = [];
    $("url > loc").each((_, el) => {
      const loc = $(el).text().trim();
      if (loc.includes("/pine-script-docs")) {
        urls.push(loc);
      }
    });
    // Filter out legacy version pages (v3, v4, v5) — the loader skips them
    const filtered = urls.filter(
      (u) => !/\/pine-script-docs\/(v[345])\b/.test(u)
    );
    if (filtered.length > 0) {
      console.log(`Found ${filtered.length} pages from sitemap (${urls.length - filtered.length} legacy skipped)`);
      return filtered;
    }
  } catch (e) {
    console.log("Sitemap not available, trying HTML discovery...");
  }

  // Fallback: discover from sidebar links on main page
  const html = await fetchText(BASE_URL);
  const $ = cheerio.load(html);
  const urls = new Set<string>();
  urls.add(BASE_URL);

  $('a[href*="/pine-script-docs"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      const full = href.startsWith("http")
        ? href
        : `https://www.tradingview.com${href}`;
      if (
        full.includes("/pine-script-docs") &&
        !full.includes("#") &&
        !full.includes("?")
      ) {
        urls.add(full.replace(/\/$/, ""));
      }
    }
  });

  console.log(`Discovered ${urls.size} pages from HTML`);
  return Array.from(urls);
}

function htmlToMarkdown(
  $: cheerio.CheerioAPI,
  el: cheerio.Cheerio<cheerio.Element>
): string {
  let md = "";

  el.contents().each((_, node) => {
    if (node.type === "text") {
      md += $(node).text();
      return;
    }

    const $node = $(node);
    const tag = (node as cheerio.Element).tagName?.toLowerCase();

    if (!tag) return;

    if (tag.match(/^h[1-6]$/)) {
      const level = parseInt(tag[1]);
      const prefix = "#".repeat(level);
      md += `\n\n${prefix} ${$node.text().trim()}\n\n`;
    } else if (tag === "p") {
      md += `\n\n${htmlToMarkdown($, $node).trim()}\n`;
    } else if (tag === "pre" || tag === "code") {
      if (tag === "pre") {
        const code = $node.find("code").length
          ? $node.find("code").text()
          : $node.text();
        md += `\n\n\`\`\`pinescript\n${code.trim()}\n\`\`\`\n`;
      } else if (!$node.parent("pre").length) {
        md += `\`${$node.text()}\``;
      }
    } else if (tag === "ul" || tag === "ol") {
      md += "\n";
      $node.children("li").each((i, li) => {
        const prefix = tag === "ol" ? `${i + 1}. ` : "- ";
        md += `${prefix}${htmlToMarkdown($, $(li)).trim()}\n`;
      });
    } else if (tag === "table") {
      const rows: string[][] = [];
      $node.find("tr").each((_, tr) => {
        const cells: string[] = [];
        $(tr)
          .find("th, td")
          .each((_, cell) => {
            cells.push($(cell).text().trim());
          });
        rows.push(cells);
      });
      if (rows.length > 0) {
        const colCount = Math.max(...rows.map((r) => r.length));
        md += "\n\n";
        md += `| ${rows[0].join(" | ")} |\n`;
        md += `| ${Array(colCount).fill("---").join(" | ")} |\n`;
        for (let i = 1; i < rows.length; i++) {
          md += `| ${rows[i].join(" | ")} |\n`;
        }
      }
    } else if (tag === "a") {
      const href = $node.attr("href") || "";
      const text = $node.text().trim();
      if (href && text) {
        md += `[${text}](${href})`;
      } else {
        md += text;
      }
    } else if (tag === "strong" || tag === "b") {
      md += `**${$node.text().trim()}**`;
    } else if (tag === "em" || tag === "i") {
      md += `*${$node.text().trim()}*`;
    } else if (tag === "br") {
      md += "\n";
    } else if (tag === "div" || tag === "section" || tag === "article") {
      md += htmlToMarkdown($, $node);
    } else {
      md += $node.text();
    }
  });

  return md;
}

// Pine Script code line detection
const PINE_START_PATTERNS = [
  /^\/\/@version=\d/,
  /^indicator\s*\(/,
  /^strategy\s*\(/,
  /^library\s*\(/,
  /^\/\/@(function|variable|description|param|returns)/,
];

const PINE_CONTINUATION_PATTERNS = [
  /^\/\//, // comments
  /^\s/, // indented lines
  /^(float|int|bool|string|color|var|varip)\s/,
  /^(if|else|for|while|switch|import|export|method|type)\b/,
  /^[a-zA-Z_][a-zA-Z0-9_.]*\s*[=(]/, // assignment or function call
  /^[a-zA-Z_][a-zA-Z0-9_.]*\s*:=/, // reassignment
  /^\s*$/, // blank lines within code
  /^plot[a-z]*\s*\(/,
  /^label\.|^line\.|^box\.|^table\./,
  /^strategy\.|^ta\.|^math\.|^str\.|^array\.|^map\./,
  /^\[/, // tuple destructuring
  /^=>$/, // arrow functions
];

function isInsideCodeFence(lines: string[]): boolean {
  let fenceCount = 0;
  for (const line of lines) {
    if (line.trim().startsWith("```")) fenceCount++;
  }
  return fenceCount % 2 === 1;
}

function cleanGuideMarkdown(content: string): string {
  let lines = content.split("\n");

  // Strip breadcrumb lines
  lines = lines.filter(
    (line) => !/^User Manual\s+\//.test(line.trim())
  );

  // Strip trailing nav artifacts
  const navIdx = lines.findIndex((line) =>
    /^Previous\s+.*\s+Next\s+/.test(line.trim())
  );
  if (navIdx !== -1) {
    lines = lines.slice(0, navIdx);
  }

  // Strip "On this page" TOC at the end
  const tocIdx = lines.findLastIndex((line) =>
    /^On this page$/.test(line.trim())
  );
  if (tocIdx !== -1 && tocIdx > lines.length * 0.7) {
    lines = lines.slice(0, tocIdx);
  }

  // Fix admonitions
  lines = lines.map((line) =>
    line
      .replace(
        /^(Note)(This|The|A |An |In |If |When |For |Pine|Scripts?|User)/g,
        "**Note:** $2"
      )
      .replace(
        /^(Warning)(This|The|A |An |In |If |When |For |Pine|Scripts?)/g,
        "**Warning:** $2"
      )
      .replace(
        /^(Tip)(This|The|A |An |In |If |When |For |Pine|Scripts?)/g,
        "**Tip:** $2"
      )
  );

  // Detect and fence code blocks
  const result: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (
      PINE_START_PATTERNS.some((p) => p.test(trimmed)) &&
      !isInsideCodeFence(result)
    ) {
      result.push("```pinescript");
      result.push(line);
      i++;

      while (i < lines.length) {
        const nextTrimmed = lines[i].trim();
        if (
          nextTrimmed !== "" &&
          !PINE_CONTINUATION_PATTERNS.some((p) => p.test(nextTrimmed)) &&
          !PINE_START_PATTERNS.some((p) => p.test(nextTrimmed))
        ) {
          break;
        }
        if (
          nextTrimmed === "" &&
          i + 1 < lines.length &&
          lines[i + 1].trim() === "" &&
          i + 2 < lines.length &&
          /^[A-Z]/.test(lines[i + 2].trim())
        ) {
          break;
        }
        result.push(lines[i]);
        i++;
      }

      while (result.length > 0 && result[result.length - 1].trim() === "") {
        result.pop();
      }
      result.push("```");
    } else {
      result.push(line);
      i++;
    }
  }

  return result.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function urlToFilePath(url: string): string {
  let path = url
    .replace("https://www.tradingview.com/pine-script-docs", "")
    .replace(/^\//, "")
    .replace(/\/$/, "");

  if (!path) path = "index";

  return path.replace(/\//g, "/") + ".md";
}

async function scrapePage(
  url: string
): Promise<{ path: string; content: string } | null> {
  try {
    const html = await fetchText(url);
    const $ = cheerio.load(html);

    let mainContent =
      $("main").first().length ? $("main").first() :
      $('[class*="content"]').first().length ? $('[class*="content"]').first() :
      $("article").first().length ? $("article").first() :
      $("body");

    // Remove nav, sidebar, footer
    mainContent
      .find("nav, footer, [class*='sidebar'], [class*='nav'], script, style")
      .remove();

    const title =
      $("h1").first().text().trim() ||
      $("title").text().trim().replace(" | TradingView", "");
    const markdown = htmlToMarkdown($, mainContent);
    const cleaned = markdown.replace(/\n{3,}/g, "\n\n").trim();

    if (cleaned.length < 50) return null;

    const filePath = urlToFilePath(url);
    const content = cleanGuideMarkdown(`# ${title}\n\n${cleaned}`);

    return { path: filePath, content };
  } catch (e) {
    console.error(`Failed to scrape ${url}: ${e}`);
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("Scraping Pine Script user guide...");
  console.log(`Delay between batches: ${DELAY_MS}ms`);

  const pages = await discoverPages();

  let scraped = 0;
  let failed = 0;

  // Process in batches of 5
  for (let i = 0; i < pages.length; i += 5) {
    const batch = pages.slice(i, i + 5);
    const results = await Promise.all(batch.map(scrapePage));

    for (const result of results) {
      if (!result) {
        failed++;
        continue;
      }

      const fullPath = join(DOCS_DIR, result.path);
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, result.content, "utf-8");
      scraped++;
    }

    if (i % 20 === 0 && i > 0) {
      console.log(`  Scraped ${scraped}/${pages.length} pages...`);
    }

    // Rate limiting
    if (DELAY_MS > 0 && i + 5 < pages.length) {
      await sleep(DELAY_MS);
    }
  }

  const failRate = failed / pages.length;
  console.log(
    `\nDone! Scraped ${scraped} pages, ${failed} failed (${(failRate * 100).toFixed(1)}%)`
  );

  if (failRate > 0.2) {
    console.error(
      `ERROR: ${(failRate * 100).toFixed(0)}% failure rate exceeds 20% threshold. Data may be incomplete.`
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
