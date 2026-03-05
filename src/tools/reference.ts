import { z } from "zod";
import type { Index } from "../types.js";
import { search } from "../indexer.js";

export const referenceSchema = z.object({
  name: z
    .string()
    .describe(
      'Function, variable, or type name (e.g., "ta.sma", "strategy.entry", "close")'
    ),
});

export function handleReference(
  index: Index,
  params: z.infer<typeof referenceSchema>
): string {
  const name = params.name.toLowerCase().replace(/\(\)$/, "");

  // Direct lookup
  const entry = index.functionLookup.get(name);
  if (entry) {
    let result = `# ${entry.name}\n\n`;
    if (entry.signature) result += `\`${entry.signature}\`\n\n`;
    if (entry.type && !entry.signature) result += `Type: \`${entry.type}\`\n\n`;
    if (entry.params) result += `## Parameters\n${entry.params}\n\n`;
    if (entry.description) result += `## Description\n${entry.description}\n\n`;
    if (entry.examples) result += `## Example\n${entry.examples}\n\n`;
    if (entry.seeAlso && entry.seeAlso.length > 0) {
      result += `## See Also\n${entry.seeAlso.join(", ")}\n\n`;
    }
    return result;
  }

  // Fallback: search for it
  const results = search(index, name, "all", 3);
  if (results.length > 0) {
    return (
      `No exact match for "${params.name}". Closest results:\n\n` +
      results
        .map((r) => {
          const truncated =
            r.chunk.content.length > 600
              ? r.chunk.content.slice(0, 600) + "\n..."
              : r.chunk.content;
          return `**${r.chunk.heading}** — _${r.chunk.filePath}_\n\n${truncated}`;
        })
        .join("\n\n---\n\n")
    );
  }

  return `No documentation found for "${params.name}"`;
}
