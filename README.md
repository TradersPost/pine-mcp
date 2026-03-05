# Pine Script MCP Server

[![npm version](https://img.shields.io/npm/v/pinescript-mcp-server)](https://www.npmjs.com/package/pinescript-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

**Give your AI assistant expert-level Pine Script knowledge.**

This project lets AI tools like Claude look up any Pine Script function, search TradingView documentation, find code examples, and browse guides — all in real time while you chat. No more hallucinated functions or outdated v5 syntax.

### What does that actually mean?

When you ask Claude to help you write a TradingView indicator or strategy, it doesn't always know the correct Pine Script v6 syntax. This server plugs directly into Claude and gives it access to the **complete Pine Script v6 reference** — 457 functions, 427 variables, and the full user guide — so it can look things up instead of guessing.

It uses something called [MCP (Model Context Protocol)](https://modelcontextprotocol.io), which is a standard way to give AI assistants access to external tools and data. You don't need to understand MCP to use this — just follow the install steps below.

---

## Prerequisites

You need **Node.js version 18 or higher** installed on your computer.

**Don't have Node.js?** Download it from [nodejs.org](https://nodejs.org) — grab the LTS (Long Term Support) version. The installer will walk you through it.

To check if you already have it, open a terminal and type:

```bash
node --version
```

If you see `v18.0.0` or higher, you're good to go.

---

## Installation

Pick the method that matches how you use Claude:

### Option A: Claude Code (one command)

If you use [Claude Code](https://docs.anthropic.com/en/docs/claude-code) in your terminal, just run:

```bash
claude mcp add pinescript -- npx -y pinescript-mcp-server
```

That's it. Next time you start a Claude Code session, it will have Pine Script tools available.

### Option B: Claude Desktop App

1. Open the Claude desktop app
2. Go to **Settings** (click Claude in the menu bar > Settings)
3. Click the **Developer** tab
4. Click **Edit Config**
5. This opens a JSON file. Add the following (if the file is empty, paste the whole thing; if it already has content, add the `pinescript` entry inside the existing `mcpServers` object):

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

6. Save the file
7. **Completely quit and restart** Claude Desktop (not just close the window — fully quit from the menu bar)

When it restarts, you should see a small tool icon in the chat input area. Click it to confirm the Pine Script tools are listed.

### Option C: Any Other MCP-Compatible Tool

If you're using another tool that supports MCP servers (like Cursor, Windsurf, etc.), point it at:

```bash
npx -y pinescript-mcp-server
```

using the stdio transport. Check your tool's documentation for how to add MCP servers.

---

## What Can It Do?

Once installed, just chat with Claude normally. It will automatically use the Pine Script tools when relevant. Here are some things you can ask:

**"What does ta.sma do?"**
Claude will look up the exact function signature, parameters, description, and a code example.

**"Help me write an RSI indicator with overbought/oversold zones"**
Claude will search the docs for RSI, look up `ta.rsi`, `hline`, `bgcolor`, and write correct v6 code.

**"How do I add a stop loss to my strategy?"**
Claude will look up `strategy.exit`, find examples, and show you the right syntax.

**"What's the difference between plot and plotshape?"**
Claude will pull up both references and compare them.

**"Show me how request.security works"**
Claude will retrieve the guide topic on multi-timeframe data and find relevant code examples.

**"Migrate this v5 script to v6"**
Claude can use the migration guide prompt to walk you through every change needed.

---

## Built-In Prompt Templates

These are guided workflows you can trigger. In Claude Code, type the prompt name; in Claude Desktop, they appear in the tool menu.

| Prompt | What It Does |
|--------|-------------|
| `write_indicator` | Walks you through creating a new Pine Script indicator step by step |
| `debug_strategy` | Gives you a systematic checklist for finding bugs in your strategy |
| `migrate_script` | Helps you convert a script from v1–v5 to the latest v6 syntax |

---

## Quick Reference: All Available Tools

These are the tools Claude has access to behind the scenes. You don't need to call them directly — Claude picks the right one automatically based on your question.

| Tool | What It Does |
|------|-------------|
| `pine_search` | Searches all Pine Script documentation by keyword |
| `pine_reference` | Looks up a specific function or variable by exact name |
| `pine_guide` | Retrieves user guide topics (strategies, execution model, plotting, etc.) |
| `pine_examples` | Finds code examples from the documentation |
| `pine_categories` | Lists all function categories or shows all functions in a category |

---

## Quick Reference: Resources

These are static reference pages Claude can pull up:

| Resource | What It Is |
|----------|-----------|
| `pinescript://manifest` | A directory of everything indexed — all categories, function counts, and guide topics |
| `pinescript://cheatsheet` | A quick-reference card with the most common Pine Script v6 patterns |

---

## Troubleshooting

### "command not found: node" or "npx is not recognized"

Node.js isn't installed. Download it from [nodejs.org](https://nodejs.org) and run the installer. After installing, close and reopen your terminal, then try again.

### Claude doesn't seem to have Pine Script tools

- **Claude Code**: Run `claude mcp list` to check if `pinescript` appears. If not, run the install command again.
- **Claude Desktop**: Make sure you fully quit and restarted the app (not just closed the window). Click the tool icon in the chat input to verify the tools are listed.

### Search returns no results

- Try shorter keywords: `"sma"` instead of `"simple moving average calculation"`
- Common names work: `"bollinger"` finds `ta.bb`, `"macd"` finds `ta.macd`
- Ask Claude to use `pine_categories` to browse what's available

### Something else?

Run this command to verify the server is working:

```bash
npx pinescript-mcp-server --check
```

You should see output like:

```
Health check passed.
  Chunks: 2822
  Functions: 899
  Guide topics: 82
```

If that works, the server is fine — the issue is likely in how your AI tool connects to it. Check the config steps above.

Still stuck? [Open an issue on GitHub](https://github.com/TradersPost/pine-mcp/issues).

---

## What's Inside

This package bundles the complete Pine Script v6 documentation so Claude doesn't need to fetch anything from the internet:

- **457 functions** and **427 variables** from the official language reference
- Full user guide covering strategies, indicators, plots, drawings, and more
- Migration guides for upgrading from older Pine Script versions
- Smart search with fuzzy matching (handles typos) and synonym support

---

## For Developers

If you want to contribute or run this locally:

```bash
git clone https://github.com/TradersPost/pine-mcp.git
cd pine-mcp
npm install
npm run build
npm start
```

Other useful commands:

```bash
npm run dev                    # Run in development mode (auto-reloads)
node dist/index.js --check     # Verify everything loads correctly
node dist/index.js --help      # See all CLI options
```

---

## License

MIT — free to use, modify, and distribute.
