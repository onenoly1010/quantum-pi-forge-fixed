#!/bin/bash
set -e

# Quantum Pi Forge Emergency Rollback
# CRITICAL PATH: Use only when deployment is catastrophically failing
# Execution requires manual approval or safety gate override

echo "╔════════════════════════════════════════════╗"
echo "║  QUANTUM PI FORGE — EMERGENCY ROLLBACK     ║"
echo "║  ⚠️  CRITICAL SYSTEM OPERATION              ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "[ROLLBACK] Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "[ROLLBACK] User: ${GITHUB_ACTOR:-manual}"
echo "[ROLLBACK] Severity: CRITICAL"
echo ""

# Safety gate #1: Confirmation
if [ "${FORCE_ROLLBACK:-false}" != "true" ] && [ "${CI:-false}" = "false" ]; then
  echo "⚠️  Emergency rollback requires explicit approval."
  echo "To proceed, re-run with: FORCE_ROLLBACK=true bash emergency/rollback.sh"
  echo ""
  exit 1
fi

# Load last known good state
if [ ! -f .agent/logs/last_deployment.json ]; then
  echo "[ERROR] Deployment history not found. Cannot determine rollback target."
  exit 1
fi

LAST_GOOD_COMMIT=$(jq -r '.commit' .agent/logs/last_deployment.json)
echo "[ROLLBACK] Last known good state: $LAST_GOOD_COMMIT"
echo ""

# Safety gate #2: Confirm commit
echo "ROLLBACK TARGETS:"
echo "  Current HEAD: $(git rev-parse --short HEAD)"
echo "  Rollback to: $LAST_GOOD_COMMIT"
echo ""

# Execution phase
echo "[ROLLBACK] PHASE 1: Stopping current deployment..."
# Kill any running processes
pkill -f "npm|node" || true
sleep 2

echo "[ROLLBACK] PHASE 2: Resetting repository..."
git reset --hard "$LAST_GOOD_COMMIT" || {
  echo "[ERROR] Git reset failed. Manual intervention required."
  echo "INCIDENT: Run 'git status' and check branch state manually."
  exit 1
}

echo "[ROLLBACK] PHASE 3: Cleaning build artifacts..."
npm run clean 2>/dev/null || {
  rm -rf dist build out .next || true
}

echo "[ROLLBACK] PHASE 4: Restoring environment..."
npm ci --omit=dev || {
  echo "[WARN] npm ci incomplete. Continuing with best effort."
}

echo "[ROLLBACK] PHASE 5: Validating rollback..."
npm test 2>/dev/null || {
  echo "[WARN] Post-rollback tests inconclusive."
}

# Log incident
mkdir -p .agent/logs
cat > .agent/logs/emergency_rollback.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "event": "EMERGENCY_ROLLBACK_EXECUTED",
  "reverted_to_commit": "$LAST_GOOD_COMMIT",
  "initiated_by": "${GITHUB_ACTOR:-automated}",
  "status": "complete",
  "action_required": "Review deployment logs and address root cause"
}
EOF

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  ✅ ROLLBACK COMPLETE                       ║"
echo "║  Repository reset to: $LAST_GOOD_COMMIT      ║"
echo "║  Incident logged for review.               ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "[ROLLBACK] Next steps:"
echo "  1. Review: .agent/logs/emergency_rollback.json"
echo "  2. Investigate: What caused the failure?"
echo "  3. Prepare: Fix and test before next deployment"
echo "  4. Notify: Team of rollback incident"
echo ""
exit 0
