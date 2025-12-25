#!/bin/bash
set -e

# Pi Forge Deployment Verification Script
# Checks Railway backend, Vercel frontend, and Pi Network integration

echo "╔════════════════════════════════════════════════════╗"
echo "║  QUANTUM PI FORGE - DEPLOYMENT VERIFICATION        ║"
echo "║  $(date -u +%Y-%m-%d\ %H:%M:%SZ)                        ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

passed=0
failed=0

test_endpoint() {
  local name=$1
  local url=$2
  local expected_code=${3:-200}
  
  echo -n "Testing: $name ... "
  
  response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$url" 2>/dev/null || echo "000")
  http_code="${response: -3}"
  
  if [ "$http_code" = "$expected_code" ]; then
    echo -e "${GREEN}✓ OK${NC} (HTTP $http_code)"
    ((passed++))
    cat /tmp/response.json 2>/dev/null | jq . 2>/dev/null || echo ""
  else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code, expected $expected_code)"
    ((failed++))
  fi
}

echo "🔍 BACKEND TESTS (Railway)"
echo "────────────────────────────────────────────────────"
test_endpoint "Railway Health" "https://pi-forge-quantum-genesis-production-4fc8.up.railway.app/health" 200
test_endpoint "Pi Network Status" "https://pi-forge-quantum-genesis-production-4fc8.up.railway.app/api/pi-network/status" 200

echo ""
echo "🔍 FRONTEND TESTS (Vercel)"
echo "────────────────────────────────────────────────────"
test_endpoint "Vercel Frontend" "https://quantumpiforge.com/" 200
test_endpoint "Frontend Health Proxy" "https://quantumpiforge.com/health" 200

echo ""
echo "🔍 INTEGRATION TESTS"
echo "────────────────────────────────────────────────────"
test_endpoint "Supabase Connection" "https://pi-forge-quantum-genesis-production-4fc8.up.railway.app/api/db/status" 200

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║  VERIFICATION SUMMARY                              ║"
echo "├────────────────────────────────────────────────────┤"
echo "│ Passed: ${GREEN}$passed${NC}                                      │"
echo "│ Failed: ${RED}$failed${NC}                                      │"
echo "╚════════════════════════════════════════════════════╝"
echo ""

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}✓ All systems operational!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed. Review logs above.${NC}"
  exit 1
fi
