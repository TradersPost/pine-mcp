import { readFile, writeFile, stat } from "fs/promises";
import { resolve } from "path";
import type { DocChunk, DocEntry, Index } from "./types.js";
import { PACKAGE_ROOT, MANUAL_PATH, DOCS_PATH, REFERENCE_JSON_PATH } from "./paths.js";

const CACHE_PATH = resolve(PACKAGE_ROOT, "data", ".index-cache.json");

interface SerializedIndex {
  version: number;
  sourceMtime: number;
  chunks: DocChunk[];
  invertedIndex: [string, [number, number][]][];
  functionLookup: [string, DocEntry][];
  guideTopics: [string, DocChunk[]][];
  idf: [string, number][];
  avgChunkLength: number;
}

const CACHE_VERSION = 1;

async function getSourceMtime(): Promise<number> {
  let maxMtime = 0;
  for (const path of [MANUAL_PATH, DOCS_PATH, REFERENCE_JSON_PATH]) {
    try {
      const s = await stat(path);
      if (s.mtimeMs > maxMtime) maxMtime = s.mtimeMs;
    } catch {
      // path may not exist
    }
  }
  return maxMtime;
}

export async function loadCachedIndex(): Promise<Index | null> {
  try {
    const raw = await readFile(CACHE_PATH, "utf-8");
    const data: SerializedIndex = JSON.parse(raw);

    if (data.version !== CACHE_VERSION) return null;

    // Check if source data has changed
    const currentMtime = await getSourceMtime();
    if (currentMtime > data.sourceMtime) return null;

    return {
      chunks: data.chunks,
      invertedIndex: new Map(
        data.invertedIndex.map(([token, entries]) => [token, new Map(entries)])
      ),
      functionLookup: new Map(data.functionLookup),
      guideTopics: new Map(data.guideTopics),
      idf: new Map(data.idf),
      avgChunkLength: data.avgChunkLength,
    };
  } catch {
    return null;
  }
}

export async function saveCachedIndex(index: Index): Promise<void> {
  try {
    const sourceMtime = await getSourceMtime();
    const data: SerializedIndex = {
      version: CACHE_VERSION,
      sourceMtime,
      chunks: index.chunks,
      invertedIndex: Array.from(index.invertedIndex.entries()).map(
        ([token, chunkMap]) => [token, Array.from(chunkMap.entries())]
      ),
      functionLookup: Array.from(index.functionLookup.entries()),
      guideTopics: Array.from(index.guideTopics.entries()),
      idf: Array.from(index.idf.entries()),
      avgChunkLength: index.avgChunkLength,
    };
    await writeFile(CACHE_PATH, JSON.stringify(data));
  } catch {
    // Cache write failure is non-fatal
  }
}
