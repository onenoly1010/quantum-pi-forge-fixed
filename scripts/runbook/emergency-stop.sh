#!/bin/bash
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
    pid=$(lsof -ti:$port 2>/dev/null || echo "")
    if [ -n "$pid" ]; then
        echo "Stopping service on port $port (PID: $pid)..."
        kill -TERM $pid 2>/dev/null || true
        sleep 2
        # Force kill if still running
        if ps -p $pid > /dev/null 2>&1; then
            echo "Force stopping PID $pid..."
            kill -KILL $pid 2>/dev/null || true
        fi
        echo "✓ Service on port $port stopped"
    else
        echo "No service running on port $port"
    fi
done

# Stop any node/python processes related to the project
echo ""
echo "Checking for project-related processes..."

# Look for common process patterns
pkill -f "next.*dev" 2>/dev/null && echo "✓ Stopped Next.js dev server" || echo "No Next.js dev server running"
pkill -f "fastapi" 2>/dev/null && echo "✓ Stopped FastAPI services" || echo "No FastAPI services running"
pkill -f "flask.*run" 2>/dev/null && echo "✓ Stopped Flask services" || echo "No Flask services running"
pkill -f "gradio" 2>/dev/null && echo "✓ Stopped Gradio services" || echo "No Gradio services running"

echo ""
echo -e "${GREEN}✅ Emergency stop completed${NC}"
echo ""
echo "All services have been stopped."
echo "To restart services, run the appropriate startup scripts."
echo ""
echo -e "${YELLOW}⚠️  Please investigate the cause of the emergency stop before restarting.${NC}"
