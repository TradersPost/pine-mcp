# Pine Script MCP Server

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

## Available Tools

| Tool | Description |
|------|-------------|
| `pine_search` | Full-text search across Pine Script documentation (reference manual and user guide) |
| `pine_reference` | Look up a specific function, variable, or type with full signature, parameters, and examples |
| `pine_guide` | Retrieve a user guide page by topic (e.g., execution model, strategies, plots) |
| `pine_examples` | Search for Pine Script code examples with surrounding context |
| `pine_categories` | Browse Pine Script documentation categories or list items within a category |

## What's Included

- Complete Pine Script v6 language reference (457 functions, 427 variables)
- LLM-optimized reference manual
- TradingView user guide documentation
- Full-text search with inverted index, synonym mapping, and heading boost scoring

## Development

```bash
# Install dependencies
npm install

# Run in development mode (with tsx)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## License

MIT
