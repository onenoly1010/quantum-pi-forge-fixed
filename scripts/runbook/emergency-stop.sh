#!/usr/bin/env bash
# Emergency stop script for AI Agent Autonomous Runbook
# Usage: ./emergency-stop.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}🚨 EMERGENCY STOP INITIATED${NC}"
echo "=============================="
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "Initiated by: ${GITHUB_ACTOR:-$(whoami)}"
echo ""

# Stop all running services
echo -e "${YELLOW}Stopping services...${NC}"

# Check and stop processes on specific ports
for port in 8000 5000 7860; do
    pids=$(lsof -ti:$port 2>/dev/null || echo "")
    if [ -n "$pids" ]; then
        echo "Stopping service(s) on port $port..."
        # Iterate over each PID using while read for robustness
        while IFS= read -r pid; do
            [ -z "$pid" ] && continue
            echo "  Stopping PID: $pid..."
            kill -TERM "$pid" 2>/dev/null || true
            sleep 1
            # Force kill if still running
            if ps -p "$pid" > /dev/null 2>&1; then
                echo "  Force stopping PID $pid..."
                kill -KILL "$pid" 2>/dev/null || true
            fi
        done <<< "$pids"
        echo "✓ Service(s) on port $port stopped"
    else
        echo "No service running on port $port"
    fi
done

# Stop any node/python processes related to the project
echo ""
echo "Checking for project-related processes..."

# Get the repository name or project identifier
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REPO_NAME="$(basename "$REPO_DIR")"

# Look for processes running from this repository directory
# This is safer than broad pattern matching
echo "Searching for processes in $REPO_DIR..."

# Find and stop Next.js processes for this project
if pgrep -f "node.*next.*$REPO_DIR" > /dev/null 2>&1; then
    pkill -f "node.*next.*$REPO_DIR" 2>/dev/null && echo "✓ Stopped Next.js dev server" || echo "Failed to stop Next.js"
else
    echo "No Next.js dev server running for this project"
fi

# Note: More specific patterns should be used in production
# For now, we'll warn instead of blindly killing processes
echo ""
echo "⚠️  For production use, configure specific service identifiers"
echo "⚠️  Current implementation targets only processes in: $REPO_NAME"

echo ""
echo -e "${GREEN}✅ Emergency stop completed${NC}"
echo ""
echo "All services have been stopped."
echo "To restart services, run the appropriate startup scripts."
echo ""
echo -e "${YELLOW}⚠️  Please investigate the cause of the emergency stop before restarting.${NC}"
