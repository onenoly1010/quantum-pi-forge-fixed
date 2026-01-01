#!/bin/bash
# Quantum Pi Forge - Phase 1 Status Check
# Purpose: Check all Phase 1 completion criteria

set -e

echo "📋 Quantum Pi Forge - Phase 1 Status Check"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
COMPLETED=0
PENDING=0
BLOCKED=0

echo "Checking Phase 1 completion criteria..."
echo ""

# 1. Build Status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  BUILD VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
    echo -e "   Dependencies: ${GREEN}✅ Installed${NC}"
    COMPLETED=$((COMPLETED + 1))
else
    echo -e "   Dependencies: ${RED}❌ Not installed${NC}"
    echo "   Run: npm ci --legacy-peer-deps"
    BLOCKED=$((BLOCKED + 1))
fi

# Test build
echo -n "   Testing build... "
if npm run build > /tmp/build-test.log 2>&1; then
    echo -e "${GREEN}✅ Passes${NC}"
    COMPLETED=$((COMPLETED + 1))
else
    echo -e "${RED}❌ Fails${NC}"
    echo "   Check /tmp/build-test.log for errors"
    BLOCKED=$((BLOCKED + 1))
fi
echo ""

# 2. Deployment Status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  VERCEL DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PRODUCTION_URL="https://quantum-pi-forge-fixed.vercel.app"

# Test main URL
echo -n "   Dashboard accessible... "
dashboard_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${PRODUCTION_URL}/dashboard" 2>/dev/null || echo "000")

if [ "$dashboard_status" = "200" ]; then
    echo -e "${GREEN}✅ Live${NC}"
    COMPLETED=$((COMPLETED + 1))
    
    # Test API if dashboard is live
    echo -n "   API health check... "
    api_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${PRODUCTION_URL}/api/health" 2>/dev/null || echo "000")
    
    if [ "$api_status" = "200" ]; then
        echo -e "${GREEN}✅ Responding${NC}"
        COMPLETED=$((COMPLETED + 1))
    else
        echo -e "${RED}❌ Not responding${NC}"
        PENDING=$((PENDING + 1))
    fi
else
    echo -e "${YELLOW}⏳ Not deployed${NC}"
    echo "   URL: ${PRODUCTION_URL}/dashboard"
    echo "   Deploy via: git push origin main (or Vercel dashboard)"
    PENDING=$((PENDING + 2))
fi
echo ""

# 3. Sponsor Wallet
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  SPONSOR WALLET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$SPONSOR_PRIVATE_KEY" ]; then
    echo -e "   Private key set: ${GREEN}✅ Yes${NC}"
    
    # Try to check balance if script exists
    if [ -f "scripts/verify-sponsor-wallet.sh" ]; then
        echo "   Running balance check..."
        if bash scripts/verify-sponsor-wallet.sh > /tmp/wallet-check.log 2>&1; then
            echo -e "   Wallet balance: ${GREEN}✅ Sufficient${NC}"
            COMPLETED=$((COMPLETED + 2))
        else
            echo -e "   Wallet balance: ${RED}❌ Insufficient${NC}"
            echo "   Check /tmp/wallet-check.log for details"
            BLOCKED=$((BLOCKED + 1))
        fi
    else
        echo -e "   Wallet balance: ${YELLOW}⏳ Cannot verify (script not found)${NC}"
        PENDING=$((PENDING + 1))
    fi
else
    echo -e "   Private key set: ${YELLOW}⏳ Not configured${NC}"
    echo "   Set: export SPONSOR_PRIVATE_KEY='your_key'"
    PENDING=$((PENDING + 2))
fi
echo ""

# 4. Community Announcement
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  COMMUNITY ANNOUNCEMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "scripts/templates/launch-announcement.md" ]; then
    echo -e "   Template ready: ${GREEN}✅ Yes${NC}"
    COMPLETED=$((COMPLETED + 1))
else
    echo -e "   Template ready: ${RED}❌ Missing${NC}"
    BLOCKED=$((BLOCKED + 1))
fi

echo -e "   Announcement posted: ${YELLOW}⏳ Manual step${NC}"
echo "   (After deployment and wallet verification)"
PENDING=$((PENDING + 1))
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 PHASE 1 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL=$((COMPLETED + PENDING + BLOCKED))
echo "Total Items:     $TOTAL"
echo -e "Completed:       ${GREEN}$COMPLETED${NC}"
echo -e "Pending:         ${YELLOW}$PENDING${NC}"
echo -e "Blocked:         ${RED}$BLOCKED${NC}"
echo ""

# Calculate percentage
if [ $TOTAL -gt 0 ]; then
    PERCENT=$((COMPLETED * 100 / TOTAL))
    echo "Progress: ${PERCENT}%"
    echo ""
fi

# Status determination
if [ $BLOCKED -gt 0 ]; then
    echo -e "${RED}❌ PHASE 1 STATUS: BLOCKED${NC}"
    echo "Action required: Fix blocked items before proceeding"
    exit 1
elif [ $PENDING -gt 0 ]; then
    echo -e "${YELLOW}⏳ PHASE 1 STATUS: IN PROGRESS${NC}"
    echo "Action required: Complete pending items"
    exit 0
else
    echo -e "${GREEN}✅ PHASE 1 STATUS: COMPLETE!${NC}"
    echo "🎉 Ready for Phase 2!"
    exit 0
fi
