#!/bin/bash

# ===================================
# OINIO LAUNCH DASHBOARD
# ===================================
# Real-time monitoring dashboard during launch

set -e

# Load environment
if [ ! -f ".env.launch" ]; then
    echo "❌ .env.launch not found"
    exit 1
fi

source .env.launch

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Clear screen and hide cursor
clear
tput civis

# Cleanup on exit
cleanup() {
    tput cnorm  # Show cursor
    clear
    exit 0
}

trap cleanup EXIT INT TERM

# Display header
display_header() {
    clear
    cat << 'EOF'
╔════════════════════════════════════════════════════════════════════╗
║                   🚀 OINIO LAUNCH DASHBOARD 🚀                    ║
║                  Real-Time Monitoring & Status                     ║
╚════════════════════════════════════════════════════════════════════╝
EOF
}

# Check system status
check_system_status() {
    echo ""
    echo -e "${CYAN}📊 SYSTEM STATUS${NC}"
    echo "─────────────────────────────────────────────────────────────"
    
    # Check backend connectivity
    if curl -s -m 2 "$NEXT_PUBLIC_BACKEND_URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend API${NC} - Connected"
    else
        echo -e "${RED}❌ Backend API${NC} - Disconnected"
    fi
    
    # Check RPC connectivity
    local rpc_status
    rpc_status=$(curl -s -m 2 -X POST "$0G_RPC_URL" \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' | grep -o '"result"' || echo "failed")
    
    if [ "$rpc_status" = '"result"' ]; then
        echo -e "${GREEN}✅ 0G RPC${NC} - Connected"
    else
        echo -e "${RED}❌ 0G RPC${NC} - Disconnected"
    fi
    
    # Check disk space
    local available
    available=$(df . | tail -1 | awk '{print $4}')
    if [ "$available" -gt 1000000 ]; then
        echo -e "${GREEN}✅ Disk Space${NC} - $(numfmt --to=iec-i --suffix=B $((available * 1024)) 2>/dev/null || echo "${available}KB")"
    else
        echo -e "${YELLOW}⚠️  Disk Space${NC} - Low"
    fi
}

# Grant status
check_grant() {
    echo ""
    echo -e "${CYAN}🎖️  GRANT STATUS${NC}"
    echo "─────────────────────────────────────────────────────────────"
    echo "Grant ID: $0G_GRANT_ID"
    
    # Try to get actual status
    local status
    status=$(curl -s -m 5 -X GET "https://api.guild.0g.ai/grants/$0G_GRANT_ID" \
        -H "Authorization: Bearer $GUILD_API_KEY" 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
    
    case "$status" in
        approved)
            echo -e "${GREEN}✅ Status: APPROVED${NC}"
            echo -e "${YELLOW}⚠️  READY FOR FLASH LAUNCH${NC}"
            ;;
        pending)
            echo -e "${YELLOW}⏳ Status: PENDING${NC}"
            echo "Waiting for Guild approval..."
            ;;
        rejected)
            echo -e "${RED}❌ Status: REJECTED${NC}"
            ;;
        *)
            echo -e "${BLUE}❓ Status: $status${NC}"
            ;;
    esac
}

# Configuration check
check_configuration() {
    echo ""
    echo -e "${CYAN}⚙️  CONFIGURATION${NC}"
    echo "─────────────────────────────────────────────────────────────"
    
    local issues=0
    
    # Check required vars
    local required_vars=(
        "GUILD_API_KEY"
        "0G_GRANT_ID"
        "DEPLOYER_PRIVATE_KEY"
        "0G_RPC_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}❌${NC} $var not configured"
            issues=$((issues + 1))
        else
            # Show masked value
            local value="${!var}"
            local masked="${value:0:4}...${value: -4}"
            echo -e "${GREEN}✅${NC} $var: $masked"
        fi
    done
    
    if [ $issues -eq 0 ]; then
        echo -e "${GREEN}All required configurations present${NC}"
    else
        echo -e "${RED}⚠️  $issues configuration issues found${NC}"
    fi
}

# Deployment readiness
check_readiness() {
    echo ""
    echo -e "${CYAN}🎯 DEPLOYMENT READINESS${NC}"
    echo "─────────────────────────────────────────────────────────────"
    
    local ready=true
    
    # Check deploy script
    if [ -f "scripts/deploy.sh" ]; then
        echo -e "${GREEN}✅ Deploy script exists${NC}"
    else
        echo -e "${RED}❌ Deploy script missing${NC}"
        ready=false
    fi
    
    # Check environment file
    if [ -f ".env.launch" ]; then
        echo -e "${GREEN}✅ Launch environment configured${NC}"
    else
        echo -e "${RED}❌ Launch environment not found${NC}"
        ready=false
    fi
    
    # Check monitor script
    if [ -f "scripts/monitor-grant.sh" ]; then
        echo -e "${GREEN}✅ Monitor script ready${NC}"
    else
        echo -e "${RED}❌ Monitor script missing${NC}"
        ready=false
    fi
    
    echo ""
    if [ "$ready" = true ]; then
        echo -e "${GREEN}✅ SYSTEM READY FOR LAUNCH${NC}"
    else
        echo -e "${RED}❌ System not ready for launch${NC}"
    fi
}

# Quick actions
display_actions() {
    echo ""
    echo -e "${CYAN}⚡ QUICK ACTIONS${NC}"
    echo "─────────────────────────────────────────────────────────────"
    cat << 'EOF'
1. Start Grant Monitor:
   source .env.launch && bash scripts/monitor-grant.sh &

2. Check Grant Status:
   curl -H "Authorization: Bearer $GUILD_API_KEY" \
     "https://api.guild.0g.ai/grants/$0G_GRANT_ID"

3. View Logs:
   tail -f logs/launch.log

4. Manual Deploy:
   bash scripts/deploy.sh

5. Test RPC Connection:
   curl -X POST "$0G_RPC_URL" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
EOF
}

# Footer
display_footer() {
    echo ""
    echo "─────────────────────────────────────────────────────────────"
    echo "Last updated: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Press Ctrl+C to exit"
}

# Main loop
main() {
    while true; do
        display_header
        check_system_status
        check_grant
        check_configuration
        check_readiness
        display_actions
        display_footer
        
        # Refresh every 30 seconds
        sleep 30
    done
}

# Run
main
