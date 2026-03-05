import { z } from "zod";
import type { Index } from "../types.js";
import { search } from "../indexer.js";
import { formatNoResults } from "./errors.js";

export const referenceSchema = z.object({
  name: z
    .string()
    .describe(
      'Function, variable, or type name (e.g., "ta.sma", "strategy.entry", "close")'
    ),
  format: z
    .enum(["full", "signature", "examples"])
    .optional()
    .default("full")
    .describe(
      "Output format: full (all details), signature (name + syntax + type only), examples (name + code examples only)"
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
    let result = "";

    // Synonym transparency: show when alias resolved to a different name
    if (name !== entry.name.toLowerCase()) {
      result += `_"${params.name}" resolves to **${entry.name}**_\n\n`;
    }

    if (params.format === "signature") {
      result += `# ${entry.name}\n\n`;
      if (entry.signature) result += `\`${entry.signature}\`\n\n`;
      if (entry.type) result += `Type: \`${entry.type}\`\n\n`;
      if (entry.description) result += `${entry.description.slice(0, 200)}\n`;
      return result;
    }

    if (params.format === "examples") {
      result += `# ${entry.name}\n\n`;
      if (entry.examples) {
        result += `## Example\n${entry.examples}\n\n`;
      } else {
        result += `_No code examples available for this entry._\n\n`;
        result += `Try \`pine_examples\` with query "${entry.name}" for broader example search.\n`;
      }
      return result;
    }

    // Full format (default)
    result += `# ${entry.name}\n\n`;
    if (entry.signature) result += `\`${entry.signature}\`\n\n`;
    if (entry.type && !entry.signature) result += `Type: \`${entry.type}\`\n\n`;
    if (entry.params) result += `## Parameters\n${entry.params}\n\n`;
    if (entry.description) result += `## Description\n${entry.description}\n\n`;
    if (entry.examples) result += `## Example\n${entry.examples}\n\n`;
    if (entry.seeAlso && entry.seeAlso.length > 0) {
      result += `## See Also\n`;
      for (const related of entry.seeAlso) {
        const relatedEntry = index.functionLookup.get(related);
        if (relatedEntry?.description) {
          result += `- **${related}**: ${relatedEntry.description.slice(0, 100)}\n`;
        } else {
          result += `- ${related}\n`;
        }
      }
      result += "\n";
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

  return formatNoResults(params.name, "pine_reference");
}
