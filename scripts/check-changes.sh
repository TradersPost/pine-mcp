#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$SCRIPT_DIR/.update-result.env"

cd "$REPO_ROOT"

# Check for actual content changes in data/
DIFF_STAT=$(git diff --stat -- data/docs/ data/reference/ 2>/dev/null || echo "")

if [ -z "$DIFF_STAT" ]; then
  echo "No changes detected in data/"
  echo "CHANGES=false" > "$ENV_FILE"
  echo "CHANGE_SUMMARY=" >> "$ENV_FILE"
  exit 0
fi

echo "Changes detected:"
echo "$DIFF_STAT"

# Build a summary
SUMMARY=""

# Count changed files by directory
DOCS_CHANGED=$(git diff --name-only -- data/docs/ 2>/dev/null | wc -l | tr -d ' ')
REF_CHANGED=$(git diff --name-only -- data/reference/ 2>/dev/null | wc -l | tr -d ' ')

if [ "$DOCS_CHANGED" -gt 0 ]; then
  SUMMARY="${SUMMARY}${DOCS_CHANGED} doc files changed. "
fi

if [ "$REF_CHANGED" -gt 0 ]; then
  # Compare function/variable counts if reference changed
  OLD_FUNCS=$(git show HEAD:data/reference/language-reference.json 2>/dev/null | node -e "
    let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
      try{const j=JSON.parse(d);console.log(Object.keys(j.functions||{}).length)}
      catch{console.log(0)}
    })" 2>/dev/null || echo "0")
  NEW_FUNCS=$(node -e "
    const d=require('$REPO_ROOT/data/reference/language-reference.json');
    console.log(Object.keys(d.functions||{}).length)" 2>/dev/null || echo "0")

  if [ "$OLD_FUNCS" != "$NEW_FUNCS" ]; then
    SUMMARY="${SUMMARY}Functions: ${OLD_FUNCS} → ${NEW_FUNCS}. "
  else
    SUMMARY="${SUMMARY}Reference updated (${NEW_FUNCS} functions). "
  fi
fi

# Check for new files
NEW_FILES=$(git ls-files --others --exclude-standard -- data/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$NEW_FILES" -gt 0 ]; then
  SUMMARY="${SUMMARY}${NEW_FILES} new files. "
fi

if [ -z "$SUMMARY" ]; then
  SUMMARY="Data files updated."
fi

echo ""
echo "Summary: $SUMMARY"

echo "CHANGES=true" > "$ENV_FILE"
echo "CHANGE_SUMMARY=$SUMMARY" >> "$ENV_FILE"
