#!/bin/bash
# Quantum Pi Forge - Deployment Verification Script
# Purpose: Verify that Vercel production deployment is live and functional

set -e

echo "🔍 Quantum Pi Forge - Deployment Verification"
echo "=============================================="
echo ""

# Configuration - Can be overridden by environment variables
PRODUCTION_URL="${PRODUCTION_URL:-https://quantum-pi-forge-fixed.vercel.app}"
DASHBOARD_URL="${PRODUCTION_URL}/dashboard"
API_HEALTH_URL="${PRODUCTION_URL}/api/health"
API_SHIELDS_URL="${PRODUCTION_URL}/api/health-shields"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0
TOTAL=0

# Function to test HTTP endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_code="${3:-200}"
    
    TOTAL=$((TOTAL + 1))
    echo -n "Testing ${name}... "
    
    # Get HTTP status code with timeout
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    
    if [ "$status_code" = "$expected_code" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (HTTP ${status_code})"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (Expected HTTP ${expected_code}, got ${status_code})"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Function to test JSON response
test_json_endpoint() {
    local name="$1"
    local url="$2"
    
    TOTAL=$((TOTAL + 1))
    echo -n "Testing ${name}... "
    
    # Get response with timeout
    response=$(curl -s --max-time 10 "$url" 2>/dev/null || echo "")
    
    if [ -n "$response" ] && echo "$response" | grep -q "{"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        echo "   Response: ${response:0:100}..."
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (No valid JSON response)"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "📍 Target: ${PRODUCTION_URL}"
echo ""

# Test 1: Landing Page
echo "1️⃣  Landing Page Test"
test_endpoint "Landing page" "$PRODUCTION_URL" "200"
echo ""

# Test 2: Dashboard
echo "2️⃣  Dashboard Test"
test_endpoint "Dashboard page" "$DASHBOARD_URL" "200"
echo ""

# Test 3: API Health Check
echo "3️⃣  API Health Check"
test_json_endpoint "Health endpoint" "$API_HEALTH_URL"
echo ""

# Test 4: Health Shields (GitHub Badge)
echo "4️⃣  Health Shields Test"
test_json_endpoint "Shields endpoint" "$API_SHIELDS_URL"
echo ""

# Test 5: Check for common issues
echo "5️⃣  Additional Checks"
TOTAL=$((TOTAL + 1))
echo -n "Checking for 404 errors... "
landing_content=$(curl -s --max-time 10 "$PRODUCTION_URL" 2>/dev/null || echo "")
if echo "$landing_content" | grep -qi "404"; then
    echo -e "${RED}❌ FAILED${NC} (404 error detected)"
    FAILED=$((FAILED + 1))
else
    echo -e "${GREEN}✅ PASSED${NC}"
    PASSED=$((PASSED + 1))
fi
echo ""

# Summary
echo "=============================================="
echo "📊 Test Results Summary"
echo "=============================================="
echo "Total Tests:  ${TOTAL}"
echo -e "Passed:       ${GREEN}${PASSED}${NC}"
echo -e "Failed:       ${RED}${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All deployment tests passed!${NC}"
    echo ""
    echo "🎉 Your Vercel deployment is live and functional!"
    echo ""
    echo "📍 URLs:"
    echo "   - Dashboard: ${DASHBOARD_URL}"
    echo "   - Landing:   ${PRODUCTION_URL}"
    echo "   - API:       ${API_HEALTH_URL}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some deployment tests failed.${NC}"
    echo ""
    echo "🔧 Troubleshooting steps:"
    echo "   1. Check Vercel dashboard: https://vercel.com/onenoly1010/quantum-pi-forge-fixed"
    echo "   2. Review build logs for errors"
    echo "   3. Verify environment variables are set"
    echo "   4. Try redeploying: git push origin main"
    echo ""
    exit 1
fi
