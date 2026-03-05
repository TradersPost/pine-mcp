import type { DocChunk, DocEntry, Index } from "./types.js";
import { tokenize } from "./loader.js";

const SYNONYMS: Record<string, string[]> = {
  // Technical analysis
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
  wma: ["ta.wma"],
  dema: ["ta.dema"],
  tema: ["ta.tema"],
  cci: ["ta.cci"],
  mfi: ["ta.mfi"],
  obv: ["ta.obv"],
  dmi: ["ta.dmi"],
  supertrend: ["ta.supertrend"],
  pivothigh: ["ta.pivothigh"],
  pivotlow: ["ta.pivotlow"],
  // Natural language aliases
  "moving average": ["ta.sma"],
  "simple moving average": ["ta.sma"],
  "exponential moving average": ["ta.ema"],
  ma: ["ta.sma"],
  bollinger: ["ta.bb"],
  "bollinger bands": ["ta.bb"],
  "relative strength": ["ta.rsi"],
  stochastic: ["ta.stoch"],
  "average true range": ["ta.atr"],
  momentum: ["ta.mom"],
  // Strategy
  entry: ["strategy.entry"],
  exit: ["strategy.exit"],
  close: ["strategy.close"],
  order: ["strategy.order"],
  cancel: ["strategy.cancel"],
  backtest: ["strategy"],
  trade: ["strategy.entry"],
  "stop loss": ["strategy.exit"],
  "take profit": ["strategy.exit"],
  // Request / Data
  security: ["request.security"],
  earnings: ["request.earnings"],
  dividends: ["request.dividends"],
  security_lower_tf: ["request.security_lower_tf"],
  htf: ["request.security"],
  "higher timeframe": ["request.security"],
  "lower timeframe": ["request.security_lower_tf"],
  tf: ["timeframe.period"],
  timeframe: ["timeframe.period"],
  // Drawing
  label: ["label.new"],
  line: ["line.new"],
  box: ["box.new"],
  table: ["table.new"],
  drawing: ["line.new", "box.new", "label.new"],
  polyline: ["polyline.new"],
  // Plotting
  arrow: ["plotarrow"],
  candle: ["plotcandle"],
  histogram: ["plotbar"],
  shape: ["plotshape"],
  // Input
  input: ["input.float", "input.int", "input.bool", "input.string", "input.color"],
  // Built-in variables
  ohlc: ["open", "high", "low", "close"],
  volume: ["volume"],
  // Alerts
  alert: ["alert", "alertcondition"],
  notification: ["alert"],
  // Colors
  bgcolor: ["bgcolor"],
  barcolor: ["barcolor"],
  // Types
  bool: ["bool"],
  int: ["int"],
  float: ["float"],
  str: ["str"],
  // Math
  abs: ["math.abs"],
  round: ["math.round"],
  max: ["math.max"],
  min: ["math.min"],
  log: ["math.log"],
  sqrt: ["math.sqrt"],
  pow: ["math.pow"],
  avg: ["math.avg"],
};

// BM25 parameters
const BM25_K1 = 1.5;
const BM25_B = 0.75;

// Field weight constants
const WEIGHT_NAME = 3.0;
const WEIGHT_HEADING = 2.0;
const WEIGHT_PARAMS = 1.5;
const WEIGHT_CONTENT = 1.0;

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  if (Math.abs(a.length - b.length) > 2) return 3; // early exit

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i][j - 1] + 1,
        matrix[i - 1][j] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

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

function addToIndex(
  invertedIndex: Map<string, Map<number, number>>,
  token: string,
  chunkIdx: number,
  weight: number
): void {
  if (!invertedIndex.has(token)) {
    invertedIndex.set(token, new Map());
  }
  const existing = invertedIndex.get(token)!;
  existing.set(chunkIdx, Math.max(existing.get(chunkIdx) || 0, weight));
}

export function buildIndex(
  chunks: DocChunk[],
  jsonEntries?: Map<string, DocEntry>
): Index {
  const invertedIndex = new Map<string, Map<number, number>>();
  const functionLookup = new Map<string, DocEntry>();
  const guideTopics = new Map<string, DocChunk[]>();

  // Populate function lookup from JSON reference first (primary source)
  if (jsonEntries) {
    for (const [key, entry] of jsonEntries) {
      functionLookup.set(key, entry);
    }
  }

  let totalTokens = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    totalTokens += chunk.tokens.length;

    // Build inverted index with field-weighted scoring
    const headingTokens = new Set(tokenize(chunk.heading));
    const uniqueTokens = new Set(chunk.tokens);

    for (const token of uniqueTokens) {
      const weight = headingTokens.has(token) ? WEIGHT_HEADING : WEIGHT_CONTENT;
      addToIndex(invertedIndex, token, i, weight);
    }

    // Index heading tokens with higher weight
    for (const token of headingTokens) {
      addToIndex(invertedIndex, token, i, WEIGHT_HEADING);
    }

    // Merge markdown reference data with JSON entries
    if (
      chunk.source === "manual" &&
      (chunk.filePath.includes("reference/") ||
        chunk.filePath.includes("complete_reference"))
    ) {
      const mdEntry = parseFunctionEntry(chunk);
      if (mdEntry) {
        // Index function name tokens with highest weight
        const nameTokens = tokenize(mdEntry.name);
        for (const token of nameTokens) {
          addToIndex(invertedIndex, token, i, WEIGHT_NAME);
        }

        // Index param tokens with medium weight
        if (mdEntry.params) {
          for (const token of new Set(tokenize(mdEntry.params))) {
            addToIndex(invertedIndex, token, i, WEIGHT_PARAMS);
          }
        }

        // If no examples found, look at subsequent chunks with same heading
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

  // Also index function names from JSON reference with high weight
  if (jsonEntries) {
    for (const [, entry] of jsonEntries) {
      const nameTokens = tokenize(entry.name);
      // Find chunks that mention this function and boost them
      for (const token of nameTokens) {
        const existing = invertedIndex.get(token);
        if (existing) {
          for (const [idx, weight] of existing) {
            if (weight < WEIGHT_NAME) {
              const chunk = chunks[idx];
              if (chunk && chunk.content.includes(entry.name)) {
                existing.set(idx, WEIGHT_NAME);
              }
            }
          }
        }
      }
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

  // Compute IDF for BM25
  const N = chunks.length;
  const idf = new Map<string, number>();
  for (const [token, chunkMap] of invertedIndex) {
    const df = chunkMap.size;
    // Standard BM25 IDF: log((N - df + 0.5) / (df + 0.5) + 1)
    idf.set(token, Math.log((N - df + 0.5) / (df + 0.5) + 1));
  }

  const avgChunkLength = N > 0 ? totalTokens / N : 1;

  return { chunks, invertedIndex, functionLookup, guideTopics, idf, avgChunkLength };
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
    const tokenIdf = index.idf.get(token) ?? 0;

    // Exact match with BM25 + field weighting
    const matches = index.invertedIndex.get(token);
    if (matches) {
      for (const [chunkIdx, fieldWeight] of matches) {
        const chunk = index.chunks[chunkIdx];
        const dl = chunk.tokens.length;
        // Count term frequency in this chunk
        const tf = chunk.tokens.filter((t) => t === token).length;
        // BM25 term score
        const bm25 =
          tokenIdf *
          ((tf * (BM25_K1 + 1)) /
            (tf + BM25_K1 * (1 - BM25_B + BM25_B * (dl / index.avgChunkLength))));
        scores.set(chunkIdx, (scores.get(chunkIdx) || 0) + bm25 * fieldWeight);
      }
    }

    // Partial match for longer tokens (substring containment)
    if (token.length >= 3) {
      for (const [indexedToken, chunkMap] of index.invertedIndex) {
        if (indexedToken !== token && indexedToken.includes(token)) {
          const partialIdf = index.idf.get(indexedToken) ?? 0;
          for (const [chunkIdx, fieldWeight] of chunkMap) {
            scores.set(
              chunkIdx,
              (scores.get(chunkIdx) || 0) + partialIdf * 0.3 * fieldWeight
            );
          }
        }
      }
    }

    // Fuzzy match for tokens >= 4 chars (Levenshtein distance <= 2)
    if (token.length >= 4 && !matches) {
      for (const [indexedToken, chunkMap] of index.invertedIndex) {
        if (indexedToken === token) continue;
        const dist = levenshtein(token, indexedToken);
        if (dist > 0 && dist <= 2) {
          const fuzzyIdf = index.idf.get(indexedToken) ?? 0;
          const fuzzyWeight = 1 - dist / Math.max(token.length, indexedToken.length);
          for (const [chunkIdx, fieldWeight] of chunkMap) {
            scores.set(
              chunkIdx,
              (scores.get(chunkIdx) || 0) + fuzzyIdf * fuzzyWeight * 0.2 * fieldWeight
            );
          }
        }
      }
    }
  }

  // Heading boost: if query tokens appear in heading, add extra score
  for (const [idx] of scores) {
    const heading = index.chunks[idx].heading.toLowerCase();
    for (const token of queryTokens) {
      if (heading.includes(token)) {
        scores.set(idx, (scores.get(idx) || 0) + 2);
      }
    }
  }

  const sorted = Array.from(scores.entries())
    .map(([idx, score]) => {
      const chunk = index.chunks[idx];
      const sizePenalty = chunk.content.length > 5000 ? 0.8 : 1.0;
      return { chunk, score: score * sizePenalty };
    })
    .filter(
      (r) => source === undefined || source === "all" || r.chunk.source === source
    )
    .sort((a, b) => b.score - a.score);

  // Deduplicate: skip chunks with very similar content
  const results: typeof sorted = [];
  const seenHeadings = new Set<string>();
  for (const r of sorted) {
    if (results.length >= limit) break;
    const key = r.chunk.heading.toLowerCase();
    const contentSig = r.chunk.content.slice(0, 200).replace(/\s+/g, " ").trim();
    const dedupKey = `${key}::${contentSig.slice(0, 80)}`;
    if (seenHeadings.has(dedupKey)) continue;
    seenHeadings.add(dedupKey);
    results.push(r);
  }

  return results;
}
