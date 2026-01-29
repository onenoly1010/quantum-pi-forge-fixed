#!/bin/bash

###############################################################################
# fix-links.sh
# 
# Purpose: Automatically fix common link and documentation issues
# 
# Features:
# - Standardizes GitHub repository URLs
# - Adds missing "Related Repositories" sections
# - Adds missing "Return to Hub" links
# - Fixes common markdown formatting issues
#
# Usage: bash scripts/link-audit/fix-links.sh
# 
# Output: Creates .audit-logs/fixed-issues.txt with changes made
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$REPO_ROOT/.audit-logs"
FIXED_ISSUES_LOG="$LOG_DIR/fixed-issues.txt"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Initialize log
echo "# Fixed Issues Report" > "$FIXED_ISSUES_LOG"
echo "Generated: $(date -u '+%Y-%m-%d %H:%M:%S UTC')" >> "$FIXED_ISSUES_LOG"
echo "" >> "$FIXED_ISSUES_LOG"

# Counters
files_modified=0
links_fixed=0
sections_added=0

echo -e "${GREEN}🔧 Starting automated fixes...${NC}"
echo ""

###############################################################################
# Function: Standardize GitHub URLs
###############################################################################
standardize_github_urls() {
  local file="$1"
  local modified=false
  
  # Pattern 1: Fix github.com/onenoly1010 without repo name
  if grep -q "github\.com/onenoly1010[^/a-zA-Z0-9-]" "$file" 2>/dev/null; then
    # This is a generic org link, likely should be specific repo
    # We'll flag it but not auto-fix as we don't know which repo
    echo "  ⚠️ Found generic org link in $(basename $file) - needs manual review" >> "$FIXED_ISSUES_LOG"
  fi
  
  # Pattern 2: Ensure https:// prefix for GitHub URLs
  if grep -qE "github\.com/onenoly1010/[a-zA-Z0-9_-]+" "$file" 2>/dev/null; then
    # Check if any are missing https://
    if grep -qE "[^:]//github\.com/onenoly1010" "$file" || \
       grep -qE "^github\.com/onenoly1010" "$file" || \
       grep -qE "[^/]github\.com/onenoly1010" "$file"; then
      sed -i 's|\([^:]\)//github\.com/onenoly1010|\1https://github.com/onenoly1010|g' "$file"
      sed -i 's|^github\.com/onenoly1010|https://github.com/onenoly1010|g' "$file"
      sed -i 's|\([^/]\)github\.com/onenoly1010|\1https://github.com/onenoly1010|g' "$file"
      modified=true
      ((links_fixed++))
      echo "  ✅ Fixed GitHub URL formatting in $(basename $file)" >> "$FIXED_ISSUES_LOG"
    fi
  fi
  
  if [ "$modified" = true ]; then
    return 0
  else
    return 1
  fi
}

###############################################################################
# Function: Add Related Repositories section to main docs
###############################################################################
add_related_repos_section() {
  local file="$1"
  local filename=$(basename "$file")
  
  # Check if file already has section
  if grep -qi "related repositories" "$file" || \
     grep -qi "related projects" "$file" || \
     grep -qi "ecosystem" "$file"; then
    return 1
  fi
  
  # Only add to specific main documentation files
  case "$filename" in
    README.md|IDENTITY.md|INDEX.md|MASTER_URLS.md)
      echo "" >> "$file"
      echo "---" >> "$file"
      echo "" >> "$file"
      echo "## 🌐 Related Repositories" >> "$file"
      echo "" >> "$file"
      echo "This repository is part of the Quantum Pi Forge constellation. See [CONSTELLATION_MAP.md](CONSTELLATION_MAP.md) for the complete ecosystem overview." >> "$file"
      echo "" >> "$file"
      echo "### Core Repositories" >> "$file"
      echo "" >> "$file"
      echo "| Repository | Description | Status |" >> "$file"
      echo "|------------|-------------|--------|" >> "$file"
      echo "| [quantum-pi-forge-fixed](https://github.com/onenoly1010/quantum-pi-forge-fixed) | Main production codebase | ✅ Active |" >> "$file"
      echo "| [quantum-pi-forge-site](https://github.com/onenoly1010/quantum-pi-forge-site) | Marketing and landing pages | ✅ Active |" >> "$file"
      echo "| [pi-forge-quantum-genesis](https://github.com/onenoly1010/pi-forge-quantum-genesis) | Legacy code archive | 📦 Archived |" >> "$file"
      echo "" >> "$file"
      
      ((sections_added++))
      ((files_modified++))
      echo "  ✅ Added 'Related Repositories' section to $filename" >> "$FIXED_ISSUES_LOG"
      return 0
      ;;
  esac
  
  return 1
}

###############################################################################
# Function: Add Return to Hub link to subdirectory READMEs
###############################################################################
add_return_to_hub_link() {
  local file="$1"
  local relative_path="${file#$REPO_ROOT/}"
  
  # Check if file already has return link
  if grep -qi "return to.*main repository" "$file" || \
     grep -qi "return to.*hub" "$file" || \
     grep -qi "back to.*main repository" "$file"; then
    return 1
  fi
  
  # Calculate relative path to root
  local depth=$(echo "$relative_path" | grep -o "/" | wc -l)
  local dots=""
  for ((i=1; i<$depth; i++)); do
    dots+="../"
  done
  
  # Add return link at the top of the file
  local temp_file=$(mktemp)
  echo "> 🏠 **[Return to Main Repository](${dots}README.md)** | [View on GitHub](https://github.com/onenoly1010/quantum-pi-forge-fixed)" > "$temp_file"
  echo "" >> "$temp_file"
  cat "$file" >> "$temp_file"
  mv "$temp_file" "$file"
  
  ((sections_added++))
  ((files_modified++))
  echo "  ✅ Added 'Return to Hub' link to $relative_path" >> "$FIXED_ISSUES_LOG"
  return 0
}

###############################################################################
# Main execution
###############################################################################

echo "📝 Scanning files for common issues..."
echo ""

# Find all markdown files
MD_FILES=$(find "$REPO_ROOT" -type f -name "*.md" \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/vendor/*" \
  ! -path "*/.venv/*" \
  ! -path "*/out/*")

# Process each file
while IFS= read -r file; do
  relative_path="${file#$REPO_ROOT/}"
  
  # Skip if this is an auto-generated file
  if [[ "$relative_path" == "CONSTELLATION_MAP.md" ]]; then
    continue
  fi
  
  # Standardize GitHub URLs in all files
  if standardize_github_urls "$file"; then
    ((files_modified++))
  fi
  
  # Add Related Repositories sections to main docs
  filename=$(basename "$file")
  case "$filename" in
    README.md|IDENTITY.md|INDEX.md|MASTER_URLS.md)
      if [[ "$file" == "$REPO_ROOT/$filename" ]]; then
        add_related_repos_section "$file"
      fi
      ;;
  esac
  
  # Add Return to Hub links to subdirectory READMEs
  if [[ "$filename" == "README.md" && "$file" != "$REPO_ROOT/README.md" ]]; then
    # Check if it's in a subdirectory we care about
    if [[ "$relative_path" =~ ^(backend|fastapi|contracts|pi-network|scripts|evaluation|spaces|docs)/ ]]; then
      add_return_to_hub_link "$file"
    fi
  fi
  
done <<< "$MD_FILES"

echo ""
echo -e "${GREEN}✅ Automated fixes complete${NC}"
echo ""
echo "📊 Statistics:"
echo "  - Files modified: $files_modified"
echo "  - Links fixed: $links_fixed"
echo "  - Sections added: $sections_added"
echo ""

# Write summary to log
echo "" >> "$FIXED_ISSUES_LOG"
echo "## Summary" >> "$FIXED_ISSUES_LOG"
echo "- Files modified: $files_modified" >> "$FIXED_ISSUES_LOG"
echo "- Links fixed: $links_fixed" >> "$FIXED_ISSUES_LOG"
echo "- Sections added: $sections_added" >> "$FIXED_ISSUES_LOG"

if [[ $files_modified -gt 0 ]]; then
  echo -e "${BLUE}ℹ️ $files_modified file(s) were modified${NC}"
  echo "See $FIXED_ISSUES_LOG for details"
else
  echo -e "${GREEN}✨ No fixes needed - all files are up to date!${NC}"
fi

echo ""

# Return success
exit 0
