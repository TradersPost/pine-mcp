#!/usr/bin/env node

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MANUAL_PATH, DOCS_PATH } from "./paths.js";
import { loadDocs } from "./loader.js";
import { buildIndex } from "./indexer.js";
import { loadJsonReference } from "./reference-loader.js";
import { loadCachedIndex, saveCachedIndex } from "./cache.js";
import { registerPrompts } from "./prompts.js";
import { registerResources } from "./resources.js";
import { searchSchema, handleSearch } from "./tools/search.js";
import { referenceSchema, handleReference } from "./tools/reference.js";
import { guideSchema, handleGuide } from "./tools/guide.js";
import { examplesSchema, handleExamples } from "./tools/examples.js";
import { categoriesSchema, handleCategories } from "./tools/categories.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(resolve(__dirname, "..", "package.json"), "utf-8")
    );
    return pkg.version;
  } catch {
    return "unknown";
  }
}

// CLI flags
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`pinescript-mcp-server v${getVersion()}

Pine Script v6 documentation MCP server.
Provides search, reference lookup, guides, examples, and category browsing.

Usage:
  pinescript-mcp-server          Start the MCP server (stdio transport)
  pinescript-mcp-server --check  Verify data loads correctly and exit
  pinescript-mcp-server --version
  pinescript-mcp-server --help

MCP Tools:
  pine_search       Full-text search across all documentation
  pine_reference    Look up a function/variable by exact name
  pine_guide        Browse user guide topics
  pine_examples     Find code examples
  pine_categories   Browse function categories

MCP Prompts:
  write_indicator   Guided indicator development
  debug_strategy    Strategy debugging checklist
  migrate_script    Version migration guide

MCP Resources:
  pinescript://manifest     Documentation overview and stats
  pinescript://cheatsheet   Quick syntax reference`);
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  console.log(getVersion());
  process.exit(0);
}

async function main() {
  const startTime = Date.now();

  // Try loading from cache first
  let index = await loadCachedIndex();
  let fromCache = false;

  if (index) {
    fromCache = true;
  } else {
    // Build fresh index
    const jsonEntries = await loadJsonReference();
    const chunks = await loadDocs(MANUAL_PATH, DOCS_PATH);
    index = buildIndex(chunks, jsonEntries);
    // Save cache for next startup
    await saveCachedIndex(index);
  }

  const funcCount = new Set(
    Array.from(index.functionLookup.values()).map((e) => e.name)
  ).size;

  const elapsed = Date.now() - startTime;
  console.error(
    `Pine Script MCP: loaded ${index.chunks.length} chunks, ${funcCount} functions indexed (${elapsed}ms${fromCache ? ", cached" : ""})`
  );

  // Health check mode
  if (args.includes("--check")) {
    console.log(`Health check passed.`);
    console.log(`  Chunks: ${index.chunks.length}`);
    console.log(`  Functions: ${funcCount}`);
    console.log(`  Guide topics: ${index.guideTopics.size}`);
    console.log(`  Index tokens: ${index.invertedIndex.size}`);
    console.log(`  Load time: ${elapsed}ms`);
    process.exit(0);
  }

  const version = getVersion();
  const server = new McpServer({
    name: "pinescript",
    version,
  });

  // --- Tools ---

  server.tool(
    "pine_search",
    "Full-text search across all Pine Script v6 documentation. Use this for general queries about concepts, patterns, or topics when you don't know the exact function name. Returns ranked results from both the reference manual and user guide. Prefer pine_reference for known function/variable names, and pine_guide for conceptual topics like 'execution model' or 'strategies'.",
    searchSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: handleSearch(index, params) }],
    })
  );

  server.tool(
    "pine_reference",
    "Look up a specific Pine Script v6 function, variable, or type by exact name. Returns the full signature, parameters, description, and code examples. This should be your FIRST choice when you know the function name (e.g., 'ta.sma', 'strategy.entry', 'close', 'request.security'). Supports short names like 'sma' which auto-resolve to 'ta.sma'. Use the format parameter to get just the signature or just examples.",
    referenceSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: handleReference(index, params) }],
    })
  );

  server.tool(
    "pine_guide",
    "Retrieve conceptual guide topics from the Pine Script user guide. Use for learning how something works — execution model, strategies, plotting, timeframes, etc. NOT for function lookups (use pine_reference instead). Set listTopics=true to discover all available topics before searching.",
    guideSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: handleGuide(index, params) }],
    })
  );

  server.tool(
    "pine_examples",
    "Search for Pine Script code examples by keyword. Extracts and deduplicates code blocks from documentation. Use when you need executable code patterns rather than documentation text. For the official example of a specific function, prefer pine_reference with format='examples'.",
    examplesSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: handleExamples(index, params) }],
    })
  );

  server.tool(
    "pine_categories",
    "Discover what's available in Pine Script by browsing categories. Call without arguments to list all categories (ta, strategy, request, math, etc.) and their entry counts. Provide a category name to see all functions/variables in that category with descriptions. Great for exploration when you're not sure what functions exist.",
    categoriesSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: handleCategories(index, params) }],
    })
  );

  // --- Prompts & Resources ---
  registerPrompts(server);
  registerResources(server, index);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
