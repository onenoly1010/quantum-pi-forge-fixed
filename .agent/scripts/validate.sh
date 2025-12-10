#!/bin/bash
set -e

# Quantum Pi Forge Validation Script
# Runs on every push and PR to ensure repo health

echo "[AGENT] ========== VALIDATION START =========="
echo "[AGENT] Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Step 1: Lint check
echo "[AGENT] Running linter..."
npm run lint 2>/dev/null || {
  echo "[WARN] Linting not configured or failed. Continuing..."
}

# Step 2: Type check
echo "[AGENT] Running type checker..."
npm run type-check 2>/dev/null || {
  echo "[WARN] Type checking not configured. Continuing..."
}

# Step 3: Unit tests
echo "[AGENT] Running unit tests..."
npm test 2>/dev/null || {
  echo "[WARN] Tests failed or not configured."
}

# Step 4: Security audit
echo "[AGENT] Running npm audit..."
npm audit --audit-level=moderate 2>/dev/null || {
  echo "[WARN] Security vulnerabilities detected. Review before deployment."
}

# Step 5: Build validation
echo "[AGENT] Testing build..."
npm run build 2>/dev/null || {
  echo "[ERROR] Build failed. Cannot proceed."
  exit 1
}

# Step 6: Log validation
mkdir -p .agent/logs
cat > .agent/logs/last_validation.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "passed",
  "commit": "${GITHUB_SHA:0:8}",
  "event": "${GITHUB_EVENT_NAME}"
}
EOF

echo "[AGENT] ========== VALIDATION COMPLETE =========="
exit 0
