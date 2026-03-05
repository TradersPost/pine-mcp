#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

echo "=== Pine Script MCP Data Update ==="
echo ""

# Step 1: Scrape language reference (Puppeteer, ~30s)
echo "--- Step 1/3: Scraping language reference ---"
npx tsx scripts/scrape-reference.ts
echo ""

# Step 2: Scrape user guide (Cheerio, ~60-90s)
echo "--- Step 2/3: Scraping user guide ---"
npx tsx scripts/scrape-guide.ts
echo ""

# Step 3: Check for changes
echo "--- Step 3/3: Checking for changes ---"
bash scripts/check-changes.sh
echo ""

# Read result
if [ -f scripts/.update-result.env ]; then
  source scripts/.update-result.env
fi

if [ "${CHANGES:-false}" = "true" ]; then
  echo "=== Changes detected — rebuilding ==="
  echo ""

  # Remove stale index cache
  rm -f data/.index-cache.json

  # Rebuild TypeScript
  npm run build

  # Health check
  node dist/index.js --check

  echo ""
  echo "=== Data update complete ==="
  echo "Summary: ${CHANGE_SUMMARY:-Data updated}"
  echo ""
  echo "To publish: npm version patch && npm publish"
else
  echo "=== No upstream changes detected ==="
fi
