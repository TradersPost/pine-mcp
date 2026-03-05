import { readdir, readFile } from "fs/promises";
import { join, relative } from "path";
import type { DocChunk } from "./types.js";

async function findMarkdownFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await findMarkdownFiles(full)));
    } else if (entry.name.endsWith(".md")) {
      results.push(full);
    }
  }
  return results;
}

const MAX_CHUNK_SIZE = 3000;
const MIN_CHUNK_SIZE = 100;

function subSplitLargeSection(section: string): string[] {
  if (section.length <= MAX_CHUNK_SIZE) return [section];

  // Try splitting on ### headings first
  const subSections = section.split(/^(?=### )/gm);
  if (subSections.length > 1) {
    return subSections.flatMap((s) =>
      s.length > MAX_CHUNK_SIZE ? splitOnParagraphs(s) : [s]
    );
  }

  return splitOnParagraphs(section);
}

function splitOnParagraphs(text: string): string[] {
  const paragraphs = text.split(/\n\n+/);
  const result: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if (current.length + para.length > MAX_CHUNK_SIZE && current.length > MIN_CHUNK_SIZE) {
      result.push(current.trim());
      current = para;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

function splitIntoChunks(
  content: string,
  filePath: string,
  source: "manual" | "docs",
  basePath: string
): DocChunk[] {
  const relPath = relative(basePath, filePath);
  const sections = content.split(/^(?=## )/gm);
  const chunks: DocChunk[] = [];
  let chunkIdx = 0;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (!section) continue;

    const headingMatch = section.match(/^#{1,4}\s+(.+)/);
    const heading = headingMatch ? headingMatch[1].trim() : relPath;

    // Sub-split large sections
    const subParts = subSplitLargeSection(section);
    for (const part of subParts) {
      if (part.length < MIN_CHUNK_SIZE && chunks.length > 0) {
        // Merge tiny chunks with the previous one
        const prev = chunks[chunks.length - 1];
        prev.content += "\n\n" + part;
        prev.tokens = tokenize(prev.content);
        continue;
      }

      chunks.push({
        id: `${relPath}#${chunkIdx++}`,
        source,
        filePath: relPath,
        heading,
        content: part,
        tokens: tokenize(part),
      });
    }
  }

  return chunks;
}

export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  const raw = text
    // Split camelCase/PascalCase boundaries: "plotArrow" → "plot Arrow"
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);

  for (const token of raw) {
    tokens.push(token);
    // For compound tokens without dots, also emit sub-parts
    // e.g., "plotarrow" → also emit "plot", "arrow" if splittable
    if (!token.includes(".") && token.length >= 6) {
      // Try splitting on common Pine Script prefixes
      const prefixes = ["plot", "bar", "line", "box", "fill", "input", "label", "table", "math", "str", "array", "matrix", "map"];
      for (const prefix of prefixes) {
        if (token.startsWith(prefix) && token.length > prefix.length + 1) {
          const rest = token.slice(prefix.length);
          if (!tokens.includes(prefix)) tokens.push(prefix);
          if (rest.length > 1 && !tokens.includes(rest)) tokens.push(rest);
          break;
        }
      }
    }
  }

  return tokens;
}

export async function loadDocs(
  manualPath: string,
  docsPath: string
): Promise<DocChunk[]> {
  const chunks: DocChunk[] = [];

  for (const [dir, source] of [
    [manualPath, "manual"],
    [docsPath, "docs"],
  ] as const) {
    try {
      const files = await findMarkdownFiles(dir);
      for (const file of files) {
        // Skip legacy v3/v4/v5 docs — duplicate content that pollutes search
        if (/\/v[345]\//.test(file)) continue;
        // Skip repo README and INDEX files — not Pine Script content
        if (/\/(README|INDEX)\.md$/.test(file)) continue;
        const content = await readFile(file, "utf-8");
        chunks.push(...splitIntoChunks(content, file, source, dir));
      }
    } catch {
      // Directory may not exist yet (e.g., docs not scraped)
    }
  }

  return chunks;
}
