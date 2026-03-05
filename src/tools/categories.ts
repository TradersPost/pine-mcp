import { z } from "zod";
import type { Index } from "../types.js";
import { formatNoResults } from "./errors.js";

export const categoriesSchema = z.object({
  category: z
    .string()
    .optional()
    .describe(
      "Category to browse (e.g., 'ta', 'strategy', 'request', 'drawing'). Omit to list all categories."
    ),
});

export function handleCategories(
  index: Index,
  params: z.infer<typeof categoriesSchema>
): string {
  if (!params.category) {
    // List top-level categories (only real namespaces with 2+ entries)
    const categories = new Map<string, number>();
    for (const [name, entry] of index.functionLookup) {
      if (name.includes(".") && name === entry.name) {
        const cat = name.split(".")[0];
        categories.set(cat, (categories.get(cat) || 0) + 1);
      }
    }

    const guideTopics = Array.from(index.guideTopics.keys())
      .filter((k) => !k.startsWith("v3") && !k.startsWith("v4") && !k.startsWith("v5"))
      .sort();

    let result = "# Reference Categories\n\n";
    for (const [cat, count] of Array.from(categories.entries()).sort()) {
      if (count < 2) continue;
      result += `- **${cat}** (${count} entries)\n`;
    }

    if (guideTopics.length > 0) {
      result += "\n# Guide Topics\n\n";
      for (const topic of guideTopics) {
        result += `- ${topic}\n`;
      }
    }

    return result;
  }

  // List items in category
  const cat = params.category.toLowerCase();
  const entries = Array.from(index.functionLookup.entries())
    .filter(([name]) => {
      if (name.includes(".")) {
        return name.split(".")[0] === cat;
      }
      return false;
    })
    .map(([name, entry]) => ({
      name,
      desc: entry.description.slice(0, 100),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Deduplicate (remove short-name aliases)
  const seen = new Set<string>();
  const unique = entries.filter((e) => {
    if (seen.has(e.name)) return false;
    seen.add(e.name);
    return true;
  });

  if (unique.length === 0) {
    return formatNoResults(params.category, "pine_categories");
  }

  return (
    `# ${params.category} (${unique.length} entries)\n\n` +
    unique.map((e) => `- **${e.name}**: ${e.desc}`).join("\n")
  );
}
