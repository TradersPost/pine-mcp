import { readFile } from "fs/promises";
import { REFERENCE_JSON_PATH as DATA_PATH } from "./paths.js";
import type { DocEntry } from "./types.js";

interface JsonArgument {
  name: string;
  type: string;
  description: string;
}

interface JsonEntry {
  id: string;
  name: string;
  description: string;
  syntax: string;
  arguments: JsonArgument[];
  examples: string[];
  type: string;
  seeAlso?: { name: string; href: string }[];
}

interface LanguageReference {
  functions: Record<string, JsonEntry>;
  variables: Record<string, JsonEntry>;
  metadata?: Record<string, unknown>;
}

function formatParams(args: JsonArgument[]): string {
  if (args.length === 0) return "";
  return args
    .map((a) => `- **${a.name}** (${a.type})`)
    .join("\n");
}

function categoryFromId(id: string): string {
  if (id.startsWith("fun_")) return "function";
  if (id.startsWith("var_")) return "variable";
  if (id.startsWith("const_")) return "constant";
  if (id.startsWith("type_")) return "type";
  if (id.startsWith("kw_")) return "keyword";
  if (id.startsWith("enum_")) return "enum";
  if (id.startsWith("annotation_")) return "annotation";
  return "other";
}

function jsonEntryToDocEntry(entry: JsonEntry): DocEntry {
  const seeAlso = entry.seeAlso?.map((s) => s.name) ?? [];
  const params = formatParams(entry.arguments);
  const description = entry.description
    .replace(/\s+/g, " ")
    .trim();

  // Build a compact fullContent for search indexing
  let fullContent = `# ${entry.name}\n`;
  if (entry.syntax) fullContent += `\`${entry.syntax}\`\n`;
  fullContent += `\n${description}\n`;
  if (params) fullContent += `\n## Parameters\n${params}\n`;
  if (entry.type) fullContent += `\nType: ${entry.type}\n`;

  return {
    name: entry.name,
    signature: entry.syntax || undefined,
    description,
    params: params || undefined,
    returns: entry.type || undefined,
    examples: undefined, // JSON examples lack newlines; prefer markdown examples
    fullContent,
    source: "reference-json",
    filePath: "language-reference.json",
    seeAlso: seeAlso.length > 0 ? seeAlso : undefined,
    category: categoryFromId(entry.id),
    type: entry.type || undefined,
  };
}

export async function loadJsonReference(): Promise<Map<string, DocEntry>> {
  const entries = new Map<string, DocEntry>();

  let raw: string;
  try {
    raw = await readFile(DATA_PATH, "utf-8");
  } catch {
    console.error(
      "Pine Script MCP: language-reference.json not found. Run: npm run download-reference"
    );
    return entries;
  }

  const data: LanguageReference = JSON.parse(raw);

  // Process functions
  for (const entry of Object.values(data.functions)) {
    const docEntry = jsonEntryToDocEntry(entry);
    entries.set(docEntry.name, docEntry);

    // Add short-name alias (e.g., "sma" for "ta.sma")
    if (docEntry.name.includes(".")) {
      const parts = docEntry.name.split(".");
      const shortName = parts[parts.length - 1];
      if (!entries.has(shortName)) {
        entries.set(shortName, docEntry);
      }
    }
  }

  // Process variables
  for (const entry of Object.values(data.variables)) {
    const docEntry = jsonEntryToDocEntry(entry);
    entries.set(docEntry.name, docEntry);

    // Short-name alias for dotted variables (e.g., "isfirst" for "barstate.isfirst")
    if (docEntry.name.includes(".")) {
      const parts = docEntry.name.split(".");
      const shortName = parts[parts.length - 1];
      if (!entries.has(shortName)) {
        entries.set(shortName, docEntry);
      }
    }
  }

  console.error(
    `Pine Script MCP: loaded ${Object.keys(data.functions).length} functions + ${Object.keys(data.variables).length} variables from JSON reference`
  );

  return entries;
}
