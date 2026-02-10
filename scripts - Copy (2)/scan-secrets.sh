#!/usr/bin/env bash
set -euo pipefail

OUTFILE="secrets_report.json"
PATTERNS=("OPENAI_API_KEY" "XAI_API_KEY" "ALCHEMY_API_KEY" "SPONSOR_PRIVATE_KEY" "PRIVATE_KEY" "VERCEL_TOKEN" "RAILWAY_TOKEN" "API_KEY" "SECRET_KEY" "TOKEN=" "--api-key" "xai" "openai")

echo "{\"results\": [" > "$OUTFILE"
first=true

# Search working tree files
for p in "${PATTERNS[@]}"; do
  while IFS= read -r line; do
    file="$(echo "$line" | cut -d: -f1)"
    lineno="$(echo "$line" | cut -d: -f2)"
    text="$(echo "$line" | cut -d: -f3- | sed 's/\\"/\\\\"/g')"
    if [ "$first" = true ]; then first=false; else echo "," >> "$OUTFILE"; fi
    echo "{\"type\": \"working_tree\", \"pattern\": \"$p\", \"file\": \"$file\", \"line\": $lineno, \"snippet\": \"$text\"}" >> "$OUTFILE"
  done < <(grep -RIn --line-number --exclude-dir=.git --exclude="*.lock" --exclude="node_modules" --exclude=".next" -e "$p" || true)
done

# Search commits for PATTERNS (git log -S)
for p in "${PATTERNS[@]}"; do
  git log --all -S"$p" --pretty=format:'%H %an %ad' --name-only | awk 'NF' | while read -r commit rest; do
    # get files changed in commit
    files=$(git show --pretty="" --name-only "$commit")
    if [ "$first" = true ]; then first=false; else echo "," >> "$OUTFILE"; fi
    echo "{\"type\": \"commit\", \"pattern\": \"$p\", \"commit\": \"$commit\", \"files\": \"$(echo $files | sed 's/\\"/\\\\"/g')\"}" >> "$OUTFILE"
  done || true
done

# Close JSON
echo "]}" >> "$OUTFILE"

echo "Secret scan complete. Report saved to $OUTFILE"
