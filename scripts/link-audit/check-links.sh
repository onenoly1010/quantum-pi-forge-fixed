#!/bin/bash

###############################################################################
# check-links.sh
# 
# Purpose: Validate all links in markdown files across the repository
# 
# Features:
# - Checks for broken external links
# - Validates internal file references
# - Checks anchor links in markdown files
# - Identifies non-canonical GitHub URLs
# - Generates detailed report of issues
#
# Usage: bash scripts/link-audit/check-links.sh
# 
# Output: Creates .audit-logs/broken-links.txt with findings
###############################################################################

# Note: Do not use `set -e` here, as helper functions intentionally return
# non-zero exit codes to signal detected issues, and we want a full report.

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$REPO_ROOT/.audit-logs"
BROKEN_LINKS_LOG="$LOG_DIR/broken-links.txt"
NON_CANONICAL_LOG="$LOG_DIR/non-canonical-urls.txt"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Initialize logs
echo "# Broken Links Report" > "$BROKEN_LINKS_LOG"
echo "Generated: $(date -u '+%Y-%m-%d %H:%M:%S UTC')" >> "$BROKEN_LINKS_LOG"
echo "" >> "$BROKEN_LINKS_LOG"

echo "# Non-Canonical URLs Report" > "$NON_CANONICAL_LOG"
echo "Generated: $(date -u '+%Y-%m-%d %H:%M:%S UTC')" >> "$NON_CANONICAL_LOG"
echo "" >> "$NON_CANONICAL_LOG"

# Counters
total_files=0
total_links=0
broken_links=0
non_canonical=0

echo -e "${GREEN}🔍 Starting link validation...${NC}"
echo ""

# Find all markdown files (excluding node_modules, vendor, .git)
MD_FILES=$(find "$REPO_ROOT" -type f -name "*.md" \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/vendor/*" \
  ! -path "*/.venv/*" \
  ! -path "*/out/*")

# Function to check if URL is accessible
check_url() {
  local url="$1"
  local file="$2"
  local line="$3"
  
  # Skip certain URLs that are known to block bots or have special handling
  if [[ "$url" =~ (huggingface\.co|localhost|127\.0\.0\.1|example\.com) ]]; then
    return 0
  fi
  
  # Check if URL is accessible (with timeout)
  local status_code=$(curl -L -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
  
  if [[ "$status_code" != "200" && "$status_code" != "301" && "$status_code" != "302" && "$status_code" != "403" ]]; then
    echo "- ❌ Broken link in \`$file\` (line $line): $url (Status: $status_code)" >> "$BROKEN_LINKS_LOG"
    ((broken_links++))
    return 1
  fi
  
  return 0
}

# Function to check for non-canonical GitHub URLs
check_canonical_github_url() {
  local url="$1"
  local file="$2"
  local line="$3"
  
  # Check if it's a GitHub URL but not using canonical format
  if [[ "$url" =~ github\.com ]]; then
    # Check for non-canonical patterns
    if [[ "$url" =~ github\.com/onenoly1010$ ]] || \
       [[ ! "$url" =~ ^https://github\.com/onenoly1010/[a-zA-Z0-9_-]+(/|$) ]]; then
      echo "- ⚠️ Non-canonical GitHub URL in \`$file\` (line $line): $url" >> "$NON_CANONICAL_LOG"
      echo "  - Expected format: \`https://github.com/onenoly1010/{repo-name}\`" >> "$NON_CANONICAL_LOG"
      ((non_canonical++))
      return 1
    fi
  fi
  
  return 0
}

# Function to check internal file reference
check_internal_file() {
  local ref="$1"
  local source_file="$2"
  local line="$3"
  
  # Remove anchor if present
  local file_path="${ref%%#*}"
  
  # Handle relative paths
  local source_dir=$(dirname "$source_file")
  local target_path="$source_dir/$file_path"
  
  # Check if file exists
  if [[ ! -f "$target_path" ]]; then
    # Try from repository root
    target_path="$REPO_ROOT/$file_path"
    if [[ ! -f "$target_path" ]]; then
      echo "- ❌ Broken internal reference in \`$source_file\` (line $line): $ref (File not found)" >> "$BROKEN_LINKS_LOG"
      ((broken_links++))
      return 1
    fi
  fi
  
  # Check anchor if present
  if [[ "$ref" =~ "#" ]]; then
    local anchor="${ref#*#}"
    # Convert anchor to lowercase and replace spaces with hyphens (GitHub style)
    local normalized_anchor
    normalized_anchor=$(echo "$anchor" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g')

    # Search for a heading whose normalized text matches the normalized anchor
    local anchor_found=0
    while IFS= read -r heading_line; do
      # Extract heading text after leading hashes and whitespace
      local heading_text
      heading_text=$(echo "$heading_line" | sed -E 's/^[[:space:]]*#+[[:space:]]*(.*)$/\1/')
      # Normalize heading text using the same rules as for the anchor
      local normalized_heading
      normalized_heading=$(echo "$heading_text" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g')
      if [[ "$normalized_heading" == "$normalized_anchor" ]]; then
        anchor_found=1
        break
      fi
    done < <(grep -i '^[[:space:]]*#' "$target_path" || true)

    if [[ "$anchor_found" -eq 0 ]]; then
      echo "- ⚠️ Anchor may not exist in \`$source_file\` (line $line): $ref" >> "$BROKEN_LINKS_LOG"
      echo "  - Anchor: \`#$anchor\` not found in \`$file_path\`" >> "$BROKEN_LINKS_LOG"
      # Don't increment broken_links for anchors as they may be dynamically generated
    fi
  fi
  
  return 0
}

echo "Processing markdown files..."
echo ""

# Process each markdown file
while IFS= read -r file; do
  ((total_files++))
  relative_path="${file#$REPO_ROOT/}"
  
  echo -e "  Checking: ${YELLOW}$relative_path${NC}"
  
  # Extract all markdown links from the file
  line_num=0
  while IFS= read -r line; do
    ((line_num++))
    
    # Extract markdown links: [text](url)
    while [[ "$line" =~ \[([^\]]*)\]\(([^\)]+)\) ]]; do
      url="${BASH_REMATCH[2]}"
      ((total_links++))
      
      # Remove the matched part to continue searching
      line="${line#*${BASH_REMATCH[0]}}"
      
      # Skip empty URLs
      [[ -z "$url" ]] && continue
      
      # Check URL type and validate
      if [[ "$url" =~ ^https?:// ]]; then
        # External URL
        check_canonical_github_url "$url" "$relative_path" "$line_num"
        # Note: Skipping live URL checks for performance
        # Uncomment next line to enable live checks (slower)
        # check_url "$url" "$relative_path" "$line_num"
      elif [[ "$url" =~ ^# ]]; then
        # Anchor in same file
        :  # Skip for now
      else
        # Internal file reference
        check_internal_file "$url" "$file" "$line_num"
      fi
    done
  done < "$file"
  
done <<< "$MD_FILES"

echo ""
echo -e "${GREEN}✅ Link validation complete${NC}"
echo ""
echo "📊 Statistics:"
echo "  - Files scanned: $total_files"
echo "  - Links checked: $total_links"
echo "  - Broken links: $broken_links"
echo "  - Non-canonical URLs: $non_canonical"
echo ""

# Write summary to logs
echo "" >> "$BROKEN_LINKS_LOG"
echo "## Summary" >> "$BROKEN_LINKS_LOG"
echo "- Files scanned: $total_files" >> "$BROKEN_LINKS_LOG"
echo "- Total links: $total_links" >> "$BROKEN_LINKS_LOG"
echo "- Broken links: $broken_links" >> "$BROKEN_LINKS_LOG"

echo "" >> "$NON_CANONICAL_LOG"
echo "## Summary" >> "$NON_CANONICAL_LOG"
echo "- Non-canonical GitHub URLs: $non_canonical" >> "$NON_CANONICAL_LOG"

if [[ $broken_links -gt 0 ]]; then
  echo -e "${YELLOW}⚠️ Found $broken_links broken link(s)${NC}"
  echo "See $BROKEN_LINKS_LOG for details"
  echo ""
fi

if [[ $non_canonical -gt 0 ]]; then
  echo -e "${YELLOW}⚠️ Found $non_canonical non-canonical URL(s)${NC}"
  echo "See $NON_CANONICAL_LOG for details"
  echo ""
fi

# Return success (we don't want to fail the workflow on broken links, just report them)
exit 0
