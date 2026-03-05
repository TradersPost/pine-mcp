export function formatNoResults(
  query: string,
  toolName: string,
  suggestions?: string[]
): string {
  const defaults: Record<string, string[]> = {
    pine_search: [
      "Try shorter or broader keywords (e.g., \"moving average\" instead of \"exponential moving average crossover\")",
      "Use `pine_reference` with the exact function name (e.g., \"ta.sma\")",
      "Use `pine_categories` to browse all available functions",
      "Use `pine_guide` for conceptual topics (e.g., \"strategies\", \"execution model\")",
    ],
    pine_reference: [
      "Check the spelling — Pine Script uses dotted names like \"ta.sma\", \"strategy.entry\"",
      "Try the short name (e.g., \"sma\" instead of \"ta.sma\") or vice versa",
      "Use `pine_search` for a broader keyword search",
      "Use `pine_categories` to browse available functions by namespace",
    ],
    pine_guide: [
      "Use `pine_guide` with `listTopics: true` to see all available topics",
      "Try a shorter keyword (e.g., \"strategy\" instead of \"strategy backtesting options\")",
      "Use `pine_search` to find content across all documentation",
    ],
    pine_examples: [
      "Try a more specific function name (e.g., \"ta.sma\" instead of \"average\")",
      "Use `pine_reference` to get the official example for a specific function",
      "Use `pine_search` for broader documentation results",
    ],
    pine_categories: [
      "Use `pine_categories` without a category to list all available categories",
      "Common categories: ta, strategy, request, math, str, array, matrix, map, color",
      "Use `pine_search` for a keyword search across all documentation",
    ],
  };

  const tips = suggestions ?? defaults[toolName] ?? [
    "Try `pine_search` for a broad keyword search",
    "Try `pine_categories` to browse available functions",
  ];

  let result = `No results found for "${query}".\n\n`;
  result += `**Suggestions:**\n`;
  for (const tip of tips) {
    result += `- ${tip}\n`;
  }
  return result;
}
