import { z } from "zod";
import type { Index } from "../types.js";
import { tokenize } from "../loader.js";
import { formatNoResults } from "./errors.js";

export const examplesSchema = z.object({
  query: z.string().describe("Search query for code examples"),
  limit: z.number().optional().default(5).describe("Maximum results"),
});

export function handleExamples(
  index: Index,
  params: z.infer<typeof examplesSchema>
): string {
  const queryTokens = tokenize(params.query);

  // Find chunks that contain code blocks
  const codeChunks = index.chunks.filter((c) => c.content.includes("```"));

  // Score by query token matches
  const scored = codeChunks
    .map((chunk) => {
      const score = queryTokens.filter((t) =>
        chunk.tokens.includes(t)
      ).length;
      return { chunk, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, params.limit);

  if (scored.length === 0) {
    return formatNoResults(params.query, "pine_examples");
  }

  // Deduplicate by code content
  const seen = new Set<string>();
  const unique = scored.filter((r) => {
    const sig = r.chunk.content.slice(0, 150).replace(/\s+/g, " ");
    if (seen.has(sig)) return false;
    seen.add(sig);
    return true;
  });

  return unique
    .map((r, i) => {
      // Extract code blocks with 1 line of context before each
      const codeBlocks = r.chunk.content.match(
        /(?:^|\n)([^\n]*\n)?```[\s\S]*?```/g
      );
      let code = codeBlocks ? codeBlocks.join("\n\n") : r.chunk.content;
      // Strip noisy markdown headers from within examples
      code = code.replace(/^### (Code Example|Example)\s*\n/gm, "");
      const truncated =
        code.length > 1200 ? code.slice(0, 1200) + "\n..." : code;
      return `### Example ${i + 1} — ${r.chunk.heading} (_${r.chunk.filePath}_)\n\n${truncated}`;
    })
    .join("\n\n---\n\n");
}
