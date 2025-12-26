#!/bin/bash
# Rollback script for AI Agent Autonomous Runbook
# Usage: ./rollback.sh [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

VERSION="${1}"

if [ -z "$VERSION" ]; then
    echo -e "${RED}Error: Version parameter is required${NC}"
    echo "Usage: $0 <version>"
    echo "Example: $0 v1.2.3"
    exit 1
fi

echo "🔄 Rollback Script"
echo "=================="
echo "Target Version: $VERSION"
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# Check if version exists
if ! git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo -e "${RED}Error: Version $VERSION not found in git history${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will rollback to version $VERSION${NC}"
echo "Current branch: $(git rev-parse --abbrev-ref HEAD)"
echo "Current commit: $(git rev-parse --short HEAD)"
echo ""

# Check if we're in a clean state
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}Error: Working directory is not clean. Please commit or stash changes first.${NC}"
    exit 1
fi

# Perform rollback
echo "Performing rollback to $VERSION..."

# Create a rollback branch if not already on one
ROLLBACK_BRANCH="rollback-to-${VERSION}-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$ROLLBACK_BRANCH"

# Reset to the target version
git reset --hard "$VERSION"

echo ""
echo -e "${GREEN}✅ Rollback completed successfully${NC}"
echo "Rollback branch: $ROLLBACK_BRANCH"
echo ""
echo "Next steps:"
echo "1. Test the rollback version"
echo "2. If satisfied, push with: git push origin $ROLLBACK_BRANCH"
echo "3. Create a PR to merge the rollback"
echo ""
echo "To undo this rollback:"
echo "  git checkout main"
echo "  git branch -D $ROLLBACK_BRANCH"
