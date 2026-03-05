#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MANUAL_PATH, DOCS_PATH } from "./paths.js";
import { loadDocs } from "./loader.js";
import { buildIndex } from "./indexer.js";
import { loadJsonReference } from "./reference-loader.js";
import { searchSchema, handleSearch } from "./tools/search.js";
import { referenceSchema, handleReference } from "./tools/reference.js";
import { guideSchema, handleGuide } from "./tools/guide.js";
import { examplesSchema, handleExamples } from "./tools/examples.js";
import { categoriesSchema, handleCategories } from "./tools/categories.js";

async function main() {
  // Load structured JSON reference and markdown docs
  const jsonEntries = await loadJsonReference();
  const chunks = await loadDocs(MANUAL_PATH, DOCS_PATH);
  const index = buildIndex(chunks, jsonEntries);

  const funcCount = new Set(
    Array.from(index.functionLookup.values()).map((e) => e.name)
  ).size;

  console.error(
    `Pine Script MCP: loaded ${chunks.length} chunks, ${funcCount} functions indexed`
  );

  const server = new McpServer({
    name: "pinescript",
    version: "1.0.0",
  });

  server.tool(
    "pine_search",
    "Full-text search across Pine Script documentation (reference manual and user guide)",
    searchSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: handleSearch(index, params) }],
    })
  );

  server.tool(
    "pine_reference",
    "Look up a specific Pine Script function, variable, or type with full signature, parameters, and examples",
    referenceSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: handleReference(index, params) }],
    })
  );

  server.tool(
    "pine_guide",
    "Retrieve a Pine Script user guide page by topic (e.g., execution model, strategies, plots)",
    guideSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: handleGuide(index, params) }],
    })
  );

  server.tool(
    "pine_examples",
    "Search for Pine Script code examples with surrounding context",
    examplesSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: handleExamples(index, params) }],
    })
  );

  server.tool(
    "pine_categories",
    "Browse Pine Script documentation categories or list items within a category",
    categoriesSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: handleCategories(index, params) }],
    })
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
