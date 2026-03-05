# Pine Script MCP Server

[![npm version](https://img.shields.io/npm/v/pinescript-mcp-server)](https://www.npmjs.com/package/pinescript-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

An MCP (Model Context Protocol) server that provides Pine Script v6 documentation as searchable tools. Enables AI assistants like Claude to look up Pine Script functions, search documentation, browse guides, and find code examples — without hallucinating outdated syntax.

## Installation

### Claude Code

```bash
claude mcp add pinescript -- npx -y pinescript-mcp-server
```

### Claude Desktop

Edit your config file at:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pinescript": {
      "command": "npx",
      "args": ["-y", "pinescript-mcp-server"]
    }
  }
}
```

Restart Claude Desktop after saving.

### Other MCP Clients

Run the server via stdio transport:

```bash
npx -y pinescript-mcp-server
```

## Tools

| Tool | Description |
|------|-------------|
| `pine_search` | Full-text BM25 search across all Pine Script documentation. Use for general queries when you don't know the exact function name. |
| `pine_reference` | Look up a specific function, variable, or type by name. Supports `format` parameter: `full`, `signature`, or `examples`. |
| `pine_guide` | Browse user guide topics (execution model, strategies, plots, etc.). Set `listTopics: true` to see all available topics. |
| `pine_examples` | Find Pine Script code examples by keyword. Extracts and deduplicates code blocks. |
| `pine_categories` | Browse function categories (ta, strategy, request, etc.). Omit category to list all. |

## Prompts

| Prompt | Description |
|--------|-------------|
| `write_indicator` | Step-by-step guidance for writing a Pine Script v6 indicator with best practices |
| `debug_strategy` | Systematic debugging checklist for Pine Script strategy issues |
| `migrate_script` | Guide for migrating a script from an older version (v1-v5) to v6 |

## Resources

| URI | Description |
|-----|-------------|
| `pinescript://manifest` | Overview of all indexed documentation: categories, counts, and topics |
| `pinescript://cheatsheet` | Pine Script v6 quick syntax reference with common patterns |

## Example Usage

**Look up a function:**
> "What's the signature for ta.sma?"
> → Uses `pine_reference` with name `ta.sma`

**Search for a concept:**
> "How do I create a moving average crossover strategy?"
> → Uses `pine_search` with query "moving average crossover strategy"

**Browse what's available:**
> "What strategy functions exist?"
> → Uses `pine_categories` with category `strategy`

**Find examples:**
> "Show me examples of plotshape"
> → Uses `pine_examples` with query "plotshape"

**Discover guide topics:**
> "What topics can I learn about?"
> → Uses `pine_guide` with `listTopics: true`

## What's Included

- Complete Pine Script v6 language reference (457 functions, 427 variables)
- LLM-optimized reference manual and TradingView user guide
- BM25 full-text search with fuzzy matching, synonym expansion, and field-weighted scoring
- Index caching for fast startup (~250ms cached vs ~700ms fresh)

## Troubleshooting

**No results for a search?**
- Try shorter keywords (e.g., "sma" instead of "simple moving average calculation")
- Use `pine_categories` to discover available functions by namespace
- Common aliases work: "bollinger" finds `ta.bb`, "macd" finds `ta.macd`

**Server won't start?**
- Ensure Node.js 18+ is installed: `node --version`
- Run health check: `npx pinescript-mcp-server --check`

**Slow startup?**
- First run builds the search index (~700ms). Subsequent runs use cache (~250ms).
- The cache auto-invalidates when documentation data changes.

## CLI

```bash
pinescript-mcp-server           # Start MCP server (stdio)
pinescript-mcp-server --check   # Health check — verify data loads correctly
pinescript-mcp-server --version # Print version
pinescript-mcp-server --help    # Show help
```

## Compatibility

| Pine Script Version | Support |
|---------------------|---------|
| v6 | Full reference, guides, and examples |
| v5 | Migration guides and legacy docs |
| v1-v4 | Migration guides only |

## Development

```bash
npm install          # Install dependencies
npm run dev          # Run with tsx (development)
npm run build        # Compile TypeScript
npm start            # Run compiled build
node dist/index.js --check  # Verify build works
```

## License

MIT
