import { z } from "zod";
import type { Index } from "../types.js";
import { search } from "../indexer.js";
import { formatNoResults } from "./errors.js";

export const searchSchema = z.object({
  query: z.string().describe("Search query"),
  source: z
    .enum(["manual", "docs", "all"])
    .optional()
    .default("all")
    .describe("Filter by source: manual (reference), docs (user guide), or all"),
  limit: z
    .number()
    .optional()
    .default(10)
    .describe("Maximum results to return"),
});

function smartTruncate(content: string, maxLen: number): string {
  if (content.length <= maxLen) return content;

  // Try to cut at end of a code block
  const codeBlockEnd = content.lastIndexOf("```", maxLen);
  if (codeBlockEnd > maxLen * 0.4) {
    // Find the newline after the closing fence
    const afterFence = content.indexOf("\n", codeBlockEnd + 3);
    if (afterFence !== -1 && afterFence <= maxLen * 1.3) {
      return content.slice(0, afterFence).trim() + "\n...";
    }
  }

  // Try to cut at a paragraph boundary
  const lastParagraph = content.lastIndexOf("\n\n", maxLen);
  if (lastParagraph > maxLen * 0.5) {
    return content.slice(0, lastParagraph).trim() + "\n...";
  }

  return content.slice(0, maxLen).trim() + "\n...";
}

export function handleSearch(
  index: Index,
  params: z.infer<typeof searchSchema>
): string {
  const results = search(index, params.query, params.source, params.limit);

  if (results.length === 0) {
    return formatNoResults(params.query, "pine_search");
  }

  return results
    .map((r, i) => {
      const truncated = smartTruncate(r.chunk.content, 800);
      return `### Result ${i + 1} (score: ${r.score.toFixed(2)}, source: ${r.chunk.source})\n**${r.chunk.heading}** — _${r.chunk.filePath}_\n\n${truncated}`;
    })
    .join("\n\n---\n\n");
}
