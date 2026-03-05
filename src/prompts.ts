import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
  server.prompt(
    "write_indicator",
    "Step-by-step guidance for writing a Pine Script v6 indicator with best practices",
    {
      description: z
        .string()
        .optional()
        .describe("Brief description of the indicator to create"),
    },
    async (params) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `You are a Pine Script v6 expert. Help me write a Pine Script indicator.

${params.description ? `**Goal:** ${params.description}` : "Ask me what indicator I want to build."}

Follow these best practices:
1. Always use \`//@version=6\` as the first line
2. Use \`indicator()\` declaration with proper title, overlay setting, and max_bars_back if needed
3. Prefer \`input.*\` functions for configurable parameters (input.int, input.float, input.string, input.bool, input.color, input.source)
4. Use \`ta.*\` built-in functions for technical analysis (ta.sma, ta.ema, ta.rsi, ta.macd, etc.)
5. Use \`plot()\`, \`plotshape()\`, \`bgcolor()\` for visualization
6. Use \`alertcondition()\` for alert-ready indicators
7. Add meaningful colors using \`color.new()\` for transparency
8. Use \`var\` keyword for variables that should persist across bars
9. Handle \`na\` values properly with \`na()\` checks or \`nz()\`
10. Keep the script efficient — avoid unnecessary \`request.security()\` calls

Use the pine_reference and pine_search tools to look up any functions you need.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "debug_strategy",
    "Systematic debugging checklist for Pine Script strategy issues",
    {
      issue: z
        .string()
        .optional()
        .describe("Description of the strategy problem or error"),
    },
    async (params) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `You are a Pine Script v6 strategy debugging expert. Help me debug a strategy issue.

${params.issue ? `**Problem:** ${params.issue}` : "Describe the strategy issue you're experiencing."}

Work through this debugging checklist:

## 1. Entry/Exit Logic
- Are \`strategy.entry()\` and \`strategy.exit()\` calls using correct \`id\` parameters?
- Are direction parameters correct? (\`strategy.long\` vs \`strategy.short\`)
- Are conditions actually triggering? Test with \`plotshape()\` or \`bgcolor()\` to visualize

## 2. Order Execution
- Check \`process_orders_on_close\` in \`strategy()\` declaration
- Verify \`calc_on_every_tick\` setting
- Check if \`pyramiding\` allows multiple entries
- Review \`default_qty_type\` and \`default_qty_value\`

## 3. Common Pitfalls
- **Repainting**: Are you using \`request.security()\` without \`lookahead=barmerge.lookahead_off\`?
- **Future leak**: Are you referencing \`close\` on the current unclosed bar?
- **Bar magnifier**: Is the strategy using bar magnifier that affects fill prices?
- **Slippage/commission**: Check \`strategy()\` parameters for realistic backtesting
- **Max bars back**: Are you getting runtime errors about max_bars_back?

## 4. Position Sizing
- Verify \`strategy.equity\`, \`strategy.position_size\`, \`strategy.netprofit\`
- Check if currency conversion is affecting results

## 5. Timeframe Issues
- Are multi-timeframe requests using correct \`timeframe\` arguments?
- Is the strategy chart timeframe appropriate for the logic?

Use pine_reference and pine_search to look up any functions mentioned above.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "migrate_script",
    "Guide for migrating a Pine Script from an older version to v6",
    {
      fromVersion: z
        .enum(["v1", "v2", "v3", "v4", "v5"])
        .describe("The Pine Script version to migrate from"),
    },
    async (params) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `You are a Pine Script migration expert. Help me migrate a script from ${params.fromVersion} to v6.

Use the \`pine_guide\` tool to look up the migration guide for the relevant version. Key topics to search:
- "migration ${params.fromVersion}" for version-specific changes
- "to pine version 6" for v6-specific syntax

## General Migration Steps (${params.fromVersion} → v6):

1. **Version declaration**: Change to \`//@version=6\`
2. **study() → indicator()**: Replace \`study()\` with \`indicator()\`
3. **security() → request.security()**: Namespace change
4. **input() → input.*()**: Use typed inputs (input.int, input.float, etc.)
5. **Operator changes**: \`and\` → \`and\`, \`or\` → \`or\`, \`not\` → \`not\` (or use &&, ||, !)
6. **String changes**: \`tostring()\` → \`str.tostring()\`
7. **Math changes**: \`round()\` → \`math.round()\`, \`abs()\` → \`math.abs()\`, etc.
8. **Drawing changes**: Check label, line, box API changes
9. **Color changes**: \`color.new()\` usage and transparency handling
10. **Type system**: Review new type annotation syntax

Paste the script to migrate and I'll identify all required changes.`,
          },
        },
      ],
    })
  );
}
