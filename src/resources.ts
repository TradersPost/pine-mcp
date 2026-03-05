import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Index } from "./types.js";

export function registerResources(server: McpServer, index: Index): void {
  server.resource(
    "manifest",
    "pinescript://manifest",
    { description: "Overview of all available Pine Script documentation: categories, function counts, and guide topics" },
    async () => {
      // Gather categories
      const categories = new Map<string, number>();
      for (const [name, entry] of index.functionLookup) {
        if (name.includes(".") && name === entry.name) {
          const cat = name.split(".")[0];
          categories.set(cat, (categories.get(cat) || 0) + 1);
        }
      }

      const funcCount = new Set(
        Array.from(index.functionLookup.values()).map((e) => e.name)
      ).size;

      // Gather guide topics grouped by category
      const guideGroups = new Map<string, string[]>();
      for (const key of index.guideTopics.keys()) {
        const parts = key.split(" > ");
        const group = parts[0] || "other";
        if (!guideGroups.has(group)) guideGroups.set(group, []);
        guideGroups.get(group)!.push(key);
      }

      let text = `# Pine Script v6 Documentation Manifest\n\n`;
      text += `- **Total functions/variables indexed**: ${funcCount}\n`;
      text += `- **Documentation chunks**: ${index.chunks.length}\n`;
      text += `- **Guide topics**: ${index.guideTopics.size}\n\n`;

      text += `## Reference Categories\n\n`;
      for (const [cat, count] of Array.from(categories.entries()).sort()) {
        if (count < 2) continue;
        text += `- **${cat}**: ${count} entries\n`;
      }

      text += `\n## Guide Topics by Section\n\n`;
      for (const [group, topics] of Array.from(guideGroups.entries()).sort()) {
        text += `### ${group} (${topics.length})\n`;
        for (const topic of topics.sort()) {
          text += `- ${topic}\n`;
        }
        text += "\n";
      }

      return {
        contents: [
          {
            uri: "pinescript://manifest",
            mimeType: "text/markdown",
            text,
          },
        ],
      };
    }
  );

  server.resource(
    "cheatsheet",
    "pinescript://cheatsheet",
    { description: "Pine Script v6 quick reference cheatsheet with common syntax patterns" },
    async () => {
      const text = `# Pine Script v6 Cheatsheet

## Script Structure
\`\`\`pine
//@version=6
indicator("My Indicator", overlay=true)
// or
strategy("My Strategy", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=100)
\`\`\`

## Inputs
\`\`\`pine
length = input.int(14, "Length", minval=1)
source = input.source(close, "Source")
mult   = input.float(2.0, "Multiplier", step=0.1)
show   = input.bool(true, "Show Signal")
col    = input.color(color.blue, "Color")
method = input.string("SMA", "Method", options=["SMA", "EMA", "WMA"])
\`\`\`

## Common Technical Indicators
\`\`\`pine
sma_val  = ta.sma(close, length)
ema_val  = ta.ema(close, length)
rsi_val  = ta.rsi(close, 14)
[macdLine, signalLine, hist] = ta.macd(close, 12, 26, 9)
[middle, upper, lower] = ta.bb(close, 20, 2)
atr_val  = ta.atr(14)
vwap_val = ta.vwap(hlc3)
\`\`\`

## Crossovers & Conditions
\`\`\`pine
bullish = ta.crossover(fast, slow)
bearish = ta.crossunder(fast, slow)
rising  = ta.rising(close, 3)
falling = ta.falling(close, 3)
highest = ta.highest(high, 20)
lowest  = ta.lowest(low, 20)
\`\`\`

## Plotting
\`\`\`pine
plot(sma_val, "SMA", color=color.blue, linewidth=2)
plotshape(bullish, style=shape.triangleup, location=location.belowbar, color=color.green)
plotarrow(direction, colorup=color.green, colordown=color.red)
bgcolor(condition ? color.new(color.green, 90) : na)
barcolor(close > open ? color.green : color.red)
hline(70, "Overbought", color=color.red, linestyle=hline.style_dashed)
\`\`\`

## Strategy Orders
\`\`\`pine
if bullish
    strategy.entry("Long", strategy.long)
if bearish
    strategy.close("Long")

// With stop loss and take profit
strategy.entry("Long", strategy.long)
strategy.exit("Exit", "Long", stop=stopPrice, limit=targetPrice)
\`\`\`

## Multi-Timeframe Data
\`\`\`pine
htf_close = request.security(syminfo.tickerid, "D", close)
htf_sma   = request.security(syminfo.tickerid, "W", ta.sma(close, 20))
\`\`\`

## Drawing Objects
\`\`\`pine
lbl = label.new(bar_index, high, "Signal", style=label.style_label_down, color=color.green)
ln  = line.new(bar_index[10], high[10], bar_index, high, color=color.blue)
bx  = box.new(bar_index[10], high, bar_index, low, bgcolor=color.new(color.blue, 80))
\`\`\`

## Alerts
\`\`\`pine
alertcondition(bullish, "Buy Signal", "Price crossed above SMA")
// or in v6:
if bullish
    alert("Buy signal at " + str.tostring(close), alert.freq_once_per_bar)
\`\`\`

## Useful Built-in Variables
| Variable | Description |
|----------|------------|
| \`open, high, low, close\` | OHLC prices |
| \`volume\` | Bar volume |
| \`bar_index\` | Current bar number |
| \`time\` | Bar open time (UNIX ms) |
| \`syminfo.tickerid\` | Current symbol |
| \`timeframe.period\` | Current timeframe |
| \`barstate.islast\` | Is last bar |
| \`barstate.isconfirmed\` | Bar is closed |
| \`strategy.position_size\` | Current position size |
| \`strategy.equity\` | Current equity |
`;

      return {
        contents: [
          {
            uri: "pinescript://cheatsheet",
            mimeType: "text/markdown",
            text,
          },
        ],
      };
    }
  );
}
