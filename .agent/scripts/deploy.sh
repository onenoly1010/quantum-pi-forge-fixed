#!/bin/bash
set -e

# Quantum Pi Forge Deploy Script
# Invoked by agent or manual workflow dispatch

echo "[AGENT] ========== DEPLOY START =========="
echo "[AGENT] Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "[AGENT] Branch: ${GITHUB_REF##*/}"

# Source notification service
source .agent/scripts/notify.sh

# Step 1: Validate environment
if [ -z "$GITHUB_TOKEN" ]; then
  echo "[ERROR] GITHUB_TOKEN not set. Aborting."
  send_slack_notification "Deploy Failed" "GITHUB_TOKEN not set" "critical"
  send_teams_notification "Deploy Failed" "GITHUB_TOKEN not set" "critical"
  exit 1
fi

# Step 2: Install dependencies
echo "[AGENT] Installing dependencies..."
npm ci || {
  echo "[ERROR] npm ci failed"
  exit 1
}

# Step 3: Build
echo "[AGENT] Building application..."
npm run build || {
  echo "[ERROR] Build failed"
  exit 1
}

# Step 4: Run tests
echo "[AGENT] Running validation tests..."
npm test || {
  echo "[ERROR] Tests failed. Halting deployment."
  exit 1
}

# Step 5: Check for custom deploy script
if [ -f ./deploy_quantum_pi_forge.sh ]; then
  echo "[AGENT] Found custom deploy script. Executing..."
  chmod +x ./deploy_quantum_pi_forge.sh
  ./deploy_quantum_pi_forge.sh --network piMainnet --confirm || {
    echo "[ERROR] Custom deploy script failed"
    exit 1
  }
else
  echo "[AGENT] No custom deploy script found. Skipping application deploy."
fi

# Step 6: Log deployment
mkdir -p .agent/logs
cat > .agent/logs/last_deployment.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "success",
  "branch": "${GITHUB_REF##*/}",
  "commit": "${GITHUB_SHA:0:8}",
  "actor": "${GITHUB_ACTOR}"
}
EOF

# Send success notification
send_slack_notification "✅ Deployment Successful" "Quantum Pi Forge deployed successfully to ${GITHUB_REF##*/}" "success"
send_teams_notification "✅ Deployment Successful" "Quantum Pi Forge deployed successfully to ${GITHUB_REF##*/}" "success"

echo "[AGENT] ========== DEPLOY SUCCESS =========="
exit 0
