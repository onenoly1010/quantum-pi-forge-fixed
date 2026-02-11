#!/bin/bash

#####################################################################
# Quantum Pi Forge - Production Health Check Script
# Monitors all production services and reports their status
#####################################################################

echo "🏥 Quantum Pi Forge - Health Check"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service URLs
FRONTEND_URL="${FRONTEND_URL:-https://quantumpiforge.com}"
BACKEND_URL="${BACKEND_URL:-https://api.quantumpiforge.com}"
FRONTEND_HEALTH="$FRONTEND_URL/api/health"
BACKEND_HEALTH="$BACKEND_URL/api/health"

# Timeout for health checks (seconds)
TIMEOUT=10

# Track overall health
ALL_HEALTHY=true

echo -e "${BLUE}Checking services...${NC}"
echo ""

#####################################################################
# CHECK FRONTEND (VERCEL)
#####################################################################

echo "1. Frontend (Vercel)"
echo "   URL: $FRONTEND_URL"

# Check main page
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$FRONTEND_URL" 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "   Main Page:    ${GREEN}✅ Healthy${NC} (HTTP $HTTP_STATUS)"
else
    echo -e "   Main Page:    ${RED}❌ Unhealthy${NC} (HTTP $HTTP_STATUS)"
    ALL_HEALTHY=false
fi

# Check health endpoint
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$FRONTEND_HEALTH" 2>/dev/null || echo "000")

if [ "$HEALTH_STATUS" = "200" ]; then
    echo -e "   Health API:   ${GREEN}✅ Healthy${NC} (HTTP $HEALTH_STATUS)"
    
    # Get health details
    HEALTH_DATA=$(curl -s --max-time $TIMEOUT "$FRONTEND_HEALTH" 2>/dev/null || echo "{}")
    if echo "$HEALTH_DATA" | jq -e . >/dev/null 2>&1; then
        HEALTH_STATUS_TEXT=$(echo "$HEALTH_DATA" | jq -r '.status // "unknown"')
        echo "   Status:       $HEALTH_STATUS_TEXT"
    fi
else
    echo -e "   Health API:   ${YELLOW}⚠️  No response${NC} (HTTP $HEALTH_STATUS)"
fi

# Check dashboard
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$FRONTEND_URL/dashboard" 2>/dev/null || echo "000")

if [ "$DASHBOARD_STATUS" = "200" ]; then
    echo -e "   Dashboard:    ${GREEN}✅ Accessible${NC}"
else
    echo -e "   Dashboard:    ${RED}❌ Not accessible${NC} (HTTP $DASHBOARD_STATUS)"
    ALL_HEALTHY=false
fi

echo ""

#####################################################################
# CHECK BACKEND (RAILWAY)
#####################################################################

echo "2. Backend API (Railway)"
echo "   URL: $BACKEND_URL"

# Check backend health endpoint
BACKEND_HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BACKEND_HEALTH" 2>/dev/null || echo "000")

if [ "$BACKEND_HEALTH_STATUS" = "200" ]; then
    echo -e "   Health API:   ${GREEN}✅ Healthy${NC} (HTTP $BACKEND_HEALTH_STATUS)"
    
    # Get health details
    BACKEND_HEALTH_DATA=$(curl -s --max-time $TIMEOUT "$BACKEND_HEALTH" 2>/dev/null || echo "{}")
    if echo "$BACKEND_HEALTH_DATA" | jq -e . >/dev/null 2>&1; then
        API_STATUS=$(echo "$BACKEND_HEALTH_DATA" | jq -r '.status // "unknown"')
        API_UPTIME=$(echo "$BACKEND_HEALTH_DATA" | jq -r '.uptime // "unknown"')
        echo "   Status:       $API_STATUS"
        echo "   Uptime:       $API_UPTIME seconds"
    fi
else
    echo -e "   Health API:   ${RED}❌ Unhealthy${NC} (HTTP $BACKEND_HEALTH_STATUS)"
    ALL_HEALTHY=false
fi

echo ""

#####################################################################
# CHECK PI NETWORK CONTRACTS
#####################################################################

echo "3. Pi Network Smart Contracts"

# Check if contract ID is set
if [ -n "$PI_FORGE_CONTRACT_ID" ]; then
    echo "   Contract ID:  $PI_FORGE_CONTRACT_ID"
    
    # Try to query contract (requires soroban CLI and proper configuration)
    if command -v soroban &> /dev/null; then
        if [ -n "$PI_NETWORK_RPC_URL" ] && [ -n "$PI_NETWORK_PASSPHRASE" ]; then
            echo "   Checking contract status..."
            
            # This is a sample query - adjust based on actual contract methods
            CONTRACT_STATUS=$(soroban contract invoke \
                --id "$PI_FORGE_CONTRACT_ID" \
                --rpc-url "$PI_NETWORK_RPC_URL" \
                --network-passphrase "$PI_NETWORK_PASSPHRASE" \
                -- \
                get_total_staked 2>&1 || echo "error")
            
            if [ "$CONTRACT_STATUS" != "error" ]; then
                echo -e "   Contract:     ${GREEN}✅ Responding${NC}"
                echo "   Total Staked: $CONTRACT_STATUS"
            else
                echo -e "   Contract:     ${YELLOW}⚠️  Query failed${NC}"
            fi
        else
            echo -e "   Status:       ${YELLOW}⚠️  Missing RPC URL or passphrase${NC}"
        fi
    else
        echo -e "   Status:       ${YELLOW}⚠️  Soroban CLI not available${NC}"
    fi
else
    echo -e "   Status:       ${YELLOW}⚠️  Contract ID not set${NC}"
fi

echo ""

#####################################################################
# CHECK BLOCKCHAIN CONNECTIVITY
#####################################################################

echo "4. Blockchain Connectivity"

# Check Polygon RPC
if [ -n "$POLYGON_RPC_URL" ]; then
    echo "   Polygon RPC:  $POLYGON_RPC_URL"
    
    # Try to get latest block number
    BLOCK_RESPONSE=$(curl -s --max-time $TIMEOUT -X POST "$POLYGON_RPC_URL" \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' 2>/dev/null || echo "{}")
    
    if echo "$BLOCK_RESPONSE" | jq -e '.result' >/dev/null 2>&1; then
        BLOCK_HEX=$(echo "$BLOCK_RESPONSE" | jq -r '.result')
        BLOCK_NUM=$((16#${BLOCK_HEX#0x}))
        echo -e "   Status:       ${GREEN}✅ Connected${NC}"
        echo "   Latest Block: $BLOCK_NUM"
    else
        echo -e "   Status:       ${RED}❌ Connection failed${NC}"
        ALL_HEALTHY=false
    fi
else
    echo -e "   Status:       ${YELLOW}⚠️  RPC URL not set${NC}"
fi

echo ""

#####################################################################
# CHECK SPONSOR WALLET BALANCE
#####################################################################

echo "5. Sponsor Wallet Status"

if [ -n "$SPONSOR_PRIVATE_KEY" ] && [ -n "$POLYGON_RPC_URL" ]; then
    echo "   Checking wallet balance..."
    
    # This would require ethers.js or web3.js to check actual balance
    # For now, just indicate the check is available
    echo -e "   Status:       ${YELLOW}⚠️  Balance check requires Web3 tools${NC}"
    echo "   Note:         Use 'npm run check-balance' for detailed balance info"
else
    echo -e "   Status:       ${YELLOW}⚠️  Wallet credentials not available${NC}"
fi

echo ""

#####################################################################
# SUMMARY
#####################################################################

echo "═══════════════════════════════════════════════"
if [ "$ALL_HEALTHY" = true ]; then
    echo -e "${GREEN}✅ All critical services are healthy${NC}"
    echo ""
    echo "System Status: OPERATIONAL"
    exit 0
else
    echo -e "${RED}❌ Some services are experiencing issues${NC}"
    echo ""
    echo "System Status: DEGRADED"
    echo ""
    echo "Recommended Actions:"
    echo "1. Check service logs for errors"
    echo "2. Verify environment variables are set correctly"
    echo "3. Check platform status pages:"
    echo "   - Vercel: https://www.vercel-status.com/"
    echo "   - Railway: https://status.railway.app/"
    echo "   - Polygon: https://polygon.technology/system-status"
    echo "4. Consider rolling back if issues persist"
    exit 1
fi
