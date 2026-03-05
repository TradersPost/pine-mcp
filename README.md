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

- **"What does ta.sma do?"** — Claude looks up the exact function signature, parameters, and code example
- **"Help me write an RSI indicator"** — Claude searches the docs, looks up `ta.rsi`, `hline`, `bgcolor`, and writes correct v6 code
- **"How do I add a stop loss?"** — Claude finds `strategy.exit` examples with the right syntax
- **"What's the difference between plot and plotshape?"** — Claude pulls up both references and compares them
- **"Show me how request.security works"** — Claude retrieves the multi-timeframe guide topic
- **"Migrate this v5 script to v6"** — Claude uses the migration guide to walk you through every change

---

## Tools in Action

Behind the scenes, Claude has 5 tools it can call to get accurate Pine Script information. You don't call these directly — Claude picks the right one based on your question. Here's what each one does with real examples of the data they return:

### `pine_reference` — Look up any function or variable

The go-to tool. Give it a function name and get back the full signature, parameters, description, and code example. It even resolves short names automatically.

**Ask:** *"What does ta.rsi do?"*

**Claude gets back:**

```
# ta.rsi

`ta.rsi(source, length) → series float`

## Parameters
- source (series int/float)
- length (simple int)

## Description
Relative strength index. It is calculated using the ta.rma() of upward
and downward changes of source over the last length bars.

## Example
//@version=6
indicator("ta.rsi")
plot(ta.rsi(close, 7))

## See Also
- ta.rma: Moving average used in RSI. It is the exponentially weighted
  moving average with alpha = 1 / length.
```

Short names work too — asking for `"sma"` automatically resolves:

```
"sma" resolves to ta.sma

# ta.sma
`ta.sma(source, length) → series float`
```

You can also request just the signature (`format: "signature"`) or just code examples (`format: "examples"`) to save tokens.

---

### `pine_search` — Search all documentation by keyword

Full-text search across the entire reference manual and user guide. Results are ranked by relevance using BM25 scoring, with fuzzy matching for typos.

**Ask:** *"Search for bollinger bands"*

**Claude gets back:**

```
### Result 1 (score: 18.29, source: manual)
**ta.bbw()** — pinescriptv6_complete_reference.md

Bollinger Bands Width. The Bollinger Band Width is the difference between
the upper and the lower Bollinger Bands divided by the middle band.

### Code Example
//@version=6
indicator("ta.bbw")
plot(ta.bbw(close, 5, 4))

### Result 2 (score: 15.06, source: docs)
**Other timeframes and data** — concepts/other-timeframes-and-data.md
...
```

Each result includes the relevance score, source (reference manual vs. user guide), and the matching content with code blocks preserved.

---

### `pine_categories` — Browse what's available

Don't know what functions exist? This tool lists all 48 categories and their entry counts, or drills into a specific category to show every function with a description.

**Ask:** *"What categories are available?"*

**Claude gets back:**

```
# Reference Categories

- adjustment (3 entries)
- alert (3 entries)
- array (56 entries)
- color (24 entries)
- input (13 entries)
- math (28 entries)
- strategy (96 entries)
- ta (67 entries)
- table (23 entries)
... (48 categories total)
```

**Ask:** *"Show me the ta category"*

**Claude gets back:**

```
# ta (67 entries)

- ta.accdist: Accumulation/distribution index.
- ta.alma: Arnaud Legoux Moving Average.
- ta.atr: Function atr (average true range) returns the RMA of true range.
- ta.bb: Bollinger Bands. A Bollinger Band is a technical analysis tool...
- ta.cci: The CCI (commodity channel index) is calculated as the difference...
- ta.ema: Exponential moving average...
- ta.rsi: Relative strength index...
- ta.sma: The sma function returns the moving average...
... (67 entries total)
```

---

### `pine_guide` — Read user guide topics

Retrieves conceptual guides from the Pine Script user manual — execution model, strategies, plotting, timeframes, and more. These explain *how things work*, not just function signatures.

**Ask:** *"How does the execution model work?"*

**Claude gets back:**

```
# concepts > execution-model

Pine Script® relies on an event-driven, sequential execution model to
control how a script's compiled source code runs in charts, alerts,
Deep Backtesting mode, and the Pine Screener.

In contrast to the traditional execution model of most programming
languages, Pine's runtime system executes a script repeatedly on the
sequence of historical bars and realtime ticks in the dataset on which
it runs, performing separate calculations for each bar as it progresses.
...
```

Set `listTopics: true` to see all 82 available guide topics grouped by section.

---

### `pine_examples` — Find code examples

Searches specifically for code blocks across all documentation. Great when you want to see how something is used in practice, not just read about it.

**Ask:** *"Find examples of strategy stop loss"*

**Claude gets back:**

```pine
//@version=6
strategy("My strategy", overlay = true, process_orders_on_close = true)
bracketTickSizeInput = input.int(1000, "Stoploss/Take-Profit distance (in ticks)")

longCondition = ta.crossover(ta.sma(close, 14), ta.sma(close, 28))
if (longCondition)
    limitLevel = close * 1.01
    strategy.order("My Long Entry Id", strategy.long, limit = limitLevel)
    strategy.exit("Exit", "My Long Entry Id", profit = bracketTickSizeInput, loss = bracketTickSizeInput)
```

---

## Built-In Prompt Templates

These are guided workflows you can trigger. In Claude Code, type the prompt name; in Claude Desktop, they appear in the tool menu.

| Prompt | What It Does |
|--------|-------------|
| `write_indicator` | Walks you through creating a new Pine Script indicator step by step |
| `debug_strategy` | Gives you a systematic checklist for finding bugs in your strategy |
| `migrate_script` | Helps you convert a script from v1–v5 to the latest v6 syntax |

---

## Built-In Resources

These are reference pages Claude can pull up at any time for quick context:

| Resource | What It Is |
|----------|-----------|
| `pinescript://manifest` | A directory of everything indexed — all 48 categories, function counts, and 82 guide topics |
| `pinescript://cheatsheet` | A quick-reference card with the most common Pine Script v6 syntax patterns |

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
