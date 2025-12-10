#!/bin/bash

# Quantum Pi Forge Health Check Script
# Runs periodically to ensure agent readiness

echo "[AGENT] ========== HEALTHCHECK START =========="
echo "[AGENT] Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

STATUS="healthy"
CHECKS_PASSED=0
CHECKS_TOTAL=0

# Check 1: Repo access
((CHECKS_TOTAL++))
if [ -d .git ]; then
  echo "[✓] Git repository accessible"
  ((CHECKS_PASSED++))
else
  echo "[✗] Git repository NOT accessible"
  STATUS="unhealthy"
fi

# Check 2: Agent config presence
((CHECKS_TOTAL++))
if [ -f .agent/configs/permissions.json ]; then
  echo "[✓] Agent config present"
  ((CHECKS_PASSED++))
else
  echo "[✗] Agent config MISSING"
  STATUS="unhealthy"
fi

# Check 3: Scripts executable
((CHECKS_TOTAL++))
if [ -x .agent/scripts/deploy.sh ] && [ -x .agent/scripts/rollback.sh ]; then
  echo "[✓] Agent scripts executable"
  ((CHECKS_PASSED++))
else
  echo "[✗] Agent scripts NOT executable"
  chmod +x .agent/scripts/*.sh 2>/dev/null || true
fi

# Check 4: Dependencies available
((CHECKS_TOTAL++))
if command -v npm &> /dev/null; then
  echo "[✓] npm available"
  ((CHECKS_PASSED++))
else
  echo "[✗] npm NOT available"
  STATUS="unhealthy"
fi

# Check 5: Disk space
((CHECKS_TOTAL++))
AVAILABLE_SPACE=$(df . | awk 'NR==2 {print $4}')
if [ "$AVAILABLE_SPACE" -gt 1048576 ]; then  # > 1GB
  echo "[✓] Sufficient disk space"
  ((CHECKS_PASSED++))
else
  echo "[✗] Low disk space (${AVAILABLE_SPACE}KB available)"
  STATUS="degraded"
fi

# Log results
mkdir -p .agent/logs
cat > .agent/logs/last_healthcheck.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "$STATUS",
  "checks_passed": $CHECKS_PASSED,
  "checks_total": $CHECKS_TOTAL
}
EOF

echo ""
echo "[AGENT] Health: $STATUS ($CHECKS_PASSED/$CHECKS_TOTAL checks passed)"
echo "[AGENT] ========== HEALTHCHECK COMPLETE =========="

[ "$STATUS" = "healthy" ] && exit 0 || exit 1
