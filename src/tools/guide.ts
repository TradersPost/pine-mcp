import { z } from "zod";
import type { Index } from "../types.js";
import { formatNoResults } from "./errors.js";

export const guideSchema = z.object({
  topic: z
    .string()
    .optional()
    .describe(
      'Topic to look up (e.g., "execution model", "strategies", "plots", "tables"). Required when listTopics is false.'
    ),
  listTopics: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "If true, returns all available guide topics grouped by category instead of searching."
    ),
});

export function handleGuide(
  index: Index,
  params: z.infer<typeof guideSchema>
): string {
  const topics = Array.from(index.guideTopics.entries());

  // List all topics mode
  if (params.listTopics) {
    const grouped = new Map<string, string[]>();
    for (const [key] of topics) {
      const parts = key.split(" > ");
      const category = parts[0] || "other";
      if (!grouped.has(category)) grouped.set(category, []);
      grouped.get(category)!.push(key);
    }

    let result = `# Available Guide Topics (${topics.length} total)\n\n`;
    for (const [category, topicList] of Array.from(grouped.entries()).sort()) {
      result += `## ${category} (${topicList.length})\n`;
      for (const topic of topicList.sort()) {
        result += `- ${topic}\n`;
      }
      result += "\n";
    }
    return result;
  }

  if (!params.topic) {
    return "Please provide a `topic` to search for, or set `listTopics: true` to see all available topics.";
  }

  const query = params.topic.toLowerCase();

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

  return formatNoResults(params.topic, "pine_guide");
}
