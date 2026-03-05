import { z } from "zod";
import type { Index } from "../types.js";

export const guideSchema = z.object({
  topic: z
    .string()
    .describe(
      'Topic to look up (e.g., "execution model", "strategies", "plots", "tables")'
    ),
});

export function handleGuide(
  index: Index,
  params: z.infer<typeof guideSchema>
): string {
  const query = params.topic.toLowerCase();
  const topics = Array.from(index.guideTopics.entries());

  // Exact match
  const exact = topics.find(([key]) => key.toLowerCase().includes(query));
  if (exact) {
    const [topicKey, chunks] = exact;
    return (
      `# ${topicKey}\n\n` + chunks.map((c) => c.content).join("\n\n---\n\n")
    );
  }

  // Fuzzy match: score each topic by how many query words appear in the key
  const queryWords = query.split(/\s+/);
  const scored = topics
    .map(([key, chunks]) => {
      const keyLower = key.toLowerCase();
      const score = queryWords.filter((w) => keyLower.includes(w)).length;
      return { key, chunks, score };
    })
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    const best = scored[0];
    if (scored.length > 1) {
      const otherTopics = scored
        .slice(1, 6)
        .map((t) => `- ${t.key}`)
        .join("\n");
      return (
        `# ${best.key}\n\n` +
        best.chunks.map((c) => c.content).join("\n\n---\n\n") +
        `\n\n---\n\n**Other matching topics:**\n${otherTopics}`
      );
    }
    return (
      `# ${best.key}\n\n` +
      best.chunks.map((c) => c.content).join("\n\n---\n\n")
    );
  }

  // List available topics
  const available = topics
    .map(([key]) => `- ${key}`)
    .slice(0, 20)
    .join("\n");
  return `No topic found matching "${params.topic}".\n\nAvailable topics:\n${available}`;
}
