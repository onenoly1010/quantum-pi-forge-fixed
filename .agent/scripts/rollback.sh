#!/bin/bash
set -e

# Quantum Pi Forge Rollback Script
# Triggered by agent on deployment failure or manual request
# Requires approval before execution

echo "[AGENT] ========== ROLLBACK START =========="
echo "[AGENT] Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "[AGENT] Initiating rollback sequence..."

# Source notification service
source .agent/scripts/notify.sh

# Step 1: Load last successful deployment
if [ ! -f .agent/logs/last_deployment.json ]; then
  echo "[ERROR] No deployment history found. Cannot rollback."
  exit 1
fi

LAST_COMMIT=$(jq -r '.commit' .agent/logs/last_deployment.json)
echo "[AGENT] Last successful commit: $LAST_COMMIT"

# Step 2: Check for emergency rollback script
if [ -f emergency/rollback.sh ]; then
  echo "[AGENT] Executing emergency rollback script..."
  chmod +x emergency/rollback.sh
  bash emergency/rollback.sh || {
    echo "[ERROR] Emergency rollback failed. Manual intervention required."
    exit 1
  }
else
  echo "[AGENT] No emergency rollback script. Attempting git revert..."
  git revert --no-edit HEAD || {
    echo "[ERROR] Git revert failed. Manual intervention required."
    exit 1
  }
fi

# Step 3: Re-validate
echo "[AGENT] Running post-rollback validation..."
npm ci || true
npm test || {
  echo "[ERROR] Post-rollback validation failed."
  exit 1
}

# Step 4: Log rollback
mkdir -p .agent/logs
cat > .agent/logs/last_rollback.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "success",
  "reverted_to": "$LAST_COMMIT",
  "triggered_by": "${GITHUB_ACTOR:-automated}"
}
EOF

# Send rollback notification
send_slack_notification "⚠️ Rollback Executed" "Repository rolled back to $LAST_COMMIT" "warning"
send_teams_notification "⚠️ Rollback Executed" "Repository rolled back to $LAST_COMMIT" "warning"

echo "[AGENT] ========== ROLLBACK COMPLETE =========="
exit 0
