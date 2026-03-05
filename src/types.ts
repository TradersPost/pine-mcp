export interface DocChunk {
  id: string;
  source: "manual" | "docs";
  filePath: string;
  heading: string;
  content: string;
  tokens: string[];
}

export interface DocEntry {
  name: string;
  signature?: string;
  description: string;
  params?: string;
  returns?: string;
  examples?: string;
  fullContent: string;
  source: "manual" | "docs" | "reference-json";
  filePath: string;
  seeAlso?: string[];
  category?: string;
  type?: string;
}

export interface SearchResult {
  chunk: DocChunk;
  score: number;
}

export interface Index {
  chunks: DocChunk[];
  invertedIndex: Map<string, Set<number>>;
  functionLookup: Map<string, DocEntry>;
  guideTopics: Map<string, DocChunk[]>;
}
