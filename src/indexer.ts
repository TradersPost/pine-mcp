import type { DocChunk, DocEntry, Index } from "./types.js";
import { tokenize } from "./loader.js";

const SYNONYMS: Record<string, string[]> = {
  sma: ["ta.sma"],
  ema: ["ta.ema"],
  rsi: ["ta.rsi"],
  macd: ["ta.macd"],
  atr: ["ta.atr"],
  vwap: ["ta.vwap"],
  bb: ["ta.bb"],
  stoch: ["ta.stoch"],
  cross: ["ta.cross"],
  crossover: ["ta.crossover"],
  crossunder: ["ta.crossunder"],
  highest: ["ta.highest"],
  lowest: ["ta.lowest"],
  entry: ["strategy.entry"],
  exit: ["strategy.exit"],
  close: ["strategy.close"],
  order: ["strategy.order"],
  cancel: ["strategy.cancel"],
  security: ["request.security"],
  earnings: ["request.earnings"],
  dividends: ["request.dividends"],
  "security_lower_tf": ["request.security_lower_tf"],
  label: ["label.new"],
  line: ["line.new"],
  box: ["box.new"],
  table: ["table.new"],
};

function parseFunctionEntry(chunk: DocChunk): DocEntry | null {
  const content = chunk.content;

  // Match patterns like "### ta.sma" or "## strategy.entry"
  const nameMatch = content.match(
    /^#{2,4}\s+([a-z_][a-z0-9_.]*(?:\(\))?)/im
  );
  if (!nameMatch) return null;

  const name = nameMatch[1].replace(/\(\)$/, "");

  // Must look like a function/variable reference (has a dot or is a known keyword)
  if (!name.includes(".") && !name.startsWith("var") && !name.startsWith("type"))
    return null;

  const sigMatch = content.match(/```[^\n]*\n([\s\S]*?)```/);
  const signature = sigMatch ? sigMatch[1].trim() : undefined;

  const descMatch = content.match(
    /(?:^|\n)(?:#{2,4}\s+.*\n+)([\s\S]*?)(?=\n#{2,4}\s|\n```|\n\*\*Parameters|\n\*\*Returns|$)/
  );
  const description = descMatch ? descMatch[1].trim().slice(0, 500) : "";

  const paramsMatch = content.match(
    /\*\*Parameters?\*\*[\s\S]*?(?=\n\*\*Returns|\n\*\*Example|\n#{2,4}\s|$)/i
  );
  const params = paramsMatch ? paramsMatch[0].trim() : undefined;

  const returnsMatch = content.match(
    /\*\*Returns?\*\*[\s\S]*?(?=\n\*\*Example|\n#{2,4}\s|$)/i
  );
  const returns = returnsMatch ? returnsMatch[0].trim() : undefined;

  // Match "**Example**", "### Code Example", or "### Example" followed by a code block
  const examplesMatch = content.match(
    /(?:\*\*Example\*\*|### Code Example|### Example)\s*\n```[\s\S]*?```/i
  );
  const examples = examplesMatch
    ? examplesMatch[0].replace(/^(?:\*\*Example\*\*|### Code Example|### Example)\s*\n/, "").trim()
    : undefined;

  return {
    name,
    signature,
    description,
    params,
    returns,
    examples,
    fullContent: content,
    source: chunk.source,
    filePath: chunk.filePath,
  };
}

export function buildIndex(
  chunks: DocChunk[],
  jsonEntries?: Map<string, DocEntry>
): Index {
  const invertedIndex = new Map<string, Set<number>>();
  const functionLookup = new Map<string, DocEntry>();
  const guideTopics = new Map<string, DocChunk[]>();

  // Populate function lookup from JSON reference first (primary source)
  if (jsonEntries) {
    for (const [key, entry] of jsonEntries) {
      functionLookup.set(key, entry);
    }
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    // Build inverted index
    const uniqueTokens = new Set(chunk.tokens);
    for (const token of uniqueTokens) {
      if (!invertedIndex.has(token)) {
        invertedIndex.set(token, new Set());
      }
      invertedIndex.get(token)!.add(i);
    }

    // Merge markdown reference data with JSON entries
    if (
      chunk.source === "manual" &&
      (chunk.filePath.includes("reference/") ||
        chunk.filePath.includes("complete_reference"))
    ) {
      const mdEntry = parseFunctionEntry(chunk);
      if (mdEntry) {
        // If no examples found, look at subsequent chunks with same heading
        // (large sections get sub-split, code blocks may span multiple chunks)
        if (!mdEntry.examples) {
          let combined = "";
          for (let j = i + 1; j < chunks.length && j <= i + 8; j++) {
            const next = chunks[j];
            if (next.filePath !== chunk.filePath || next.heading !== chunk.heading) break;
            combined += "\n" + next.content;
          }
          if (combined) {
            const exMatch = combined.match(
              /(?:### Code Example|### Example)\s*\n```[\s\S]*?```/i
            );
            if (exMatch) {
              mdEntry.examples = exMatch[0]
                .replace(/^(?:### Code Example|### Example)\s*\n/, "")
                .trim();
            }
          }
        }

        const existing = functionLookup.get(mdEntry.name);
        if (existing && existing.source === "reference-json") {
          // Merge: keep JSON signature/params, use markdown's code examples
          if (mdEntry.examples) existing.examples = mdEntry.examples;
        } else if (!existing) {
          // No JSON entry — use markdown entry as fallback
          functionLookup.set(mdEntry.name, mdEntry);
          const parts = mdEntry.name.split(".");
          if (parts.length > 1) {
            const shortName = parts[parts.length - 1];
            if (!functionLookup.has(shortName)) {
              functionLookup.set(shortName, mdEntry);
            }
          }
        }
      }
    }

    // Build guide topics from docs and manual concepts
    const isGuideTopic =
      chunk.source === "docs" ||
      (chunk.source === "manual" &&
        (chunk.filePath.includes("concepts/") ||
          chunk.filePath.includes("writing_scripts/") ||
          chunk.filePath.includes("visuals/")));

    if (isGuideTopic) {
      // Normalize: underscores to hyphens, "writing_scripts" to "writing"
      const topicKey = chunk.filePath
        .replace(/\.md$/, "")
        .replace(/\//g, " > ")
        .replace(/_/g, "-")
        .replace("writing-scripts", "writing");
      if (!guideTopics.has(topicKey)) {
        guideTopics.set(topicKey, []);
      }
      guideTopics.get(topicKey)!.push(chunk);
    }
  }

  // Add synonym mappings (only if not already present from JSON)
  for (const [alias, targets] of Object.entries(SYNONYMS)) {
    for (const target of targets) {
      const entry = functionLookup.get(target);
      if (entry && !functionLookup.has(alias)) {
        functionLookup.set(alias, entry);
      }
    }
  }

  return { chunks, invertedIndex, functionLookup, guideTopics };
}

export function search(
  index: Index,
  query: string,
  source?: "manual" | "docs" | "all",
  limit = 10
): { chunk: DocChunk; score: number }[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scores = new Map<number, number>();

  for (const token of queryTokens) {
    const matches = index.invertedIndex.get(token);
    if (matches) {
      for (const chunkIdx of matches) {
        scores.set(chunkIdx, (scores.get(chunkIdx) || 0) + 1);
      }
    }
    // Partial match for longer tokens
    if (token.length >= 3) {
      for (const [indexedToken, chunkSet] of index.invertedIndex) {
        if (indexedToken !== token && indexedToken.includes(token)) {
          for (const chunkIdx of chunkSet) {
            scores.set(chunkIdx, (scores.get(chunkIdx) || 0) + 0.5);
          }
        }
      }
    }
  }

  // Heading boost: if query tokens appear in heading, add extra score
  const headingLower = new Map<number, string>();
  for (const [idx] of scores) {
    headingLower.set(idx, index.chunks[idx].heading.toLowerCase());
  }
  for (const token of queryTokens) {
    for (const [idx, heading] of headingLower) {
      if (heading.includes(token)) {
        scores.set(idx, (scores.get(idx) || 0) + 2);
      }
    }
  }

  const sorted = Array.from(scores.entries())
    .map(([idx, score]) => {
      const chunk = index.chunks[idx];
      // Slight penalty for very large chunks (they match many tokens but are noisy)
      const sizePenalty = chunk.content.length > 5000 ? 0.8 : 1.0;
      return {
        chunk,
        score: (score / queryTokens.length) * sizePenalty,
      };
    })
    .filter(
      (r) => source === undefined || source === "all" || r.chunk.source === source
    )
    .sort((a, b) => b.score - a.score);

  // Deduplicate: skip chunks with very similar content (e.g., v5 vs v6 of same page)
  const results: typeof sorted = [];
  const seenHeadings = new Set<string>();
  for (const r of sorted) {
    if (results.length >= limit) break;
    const key = r.chunk.heading.toLowerCase();
    // Allow same heading from different files, but not identical heading+similar content
    const contentSig = r.chunk.content.slice(0, 200).replace(/\s+/g, " ").trim();
    const dedupKey = `${key}::${contentSig.slice(0, 80)}`;
    if (seenHeadings.has(dedupKey)) continue;
    seenHeadings.add(dedupKey);
    results.push(r);
  }

  return results;
}
