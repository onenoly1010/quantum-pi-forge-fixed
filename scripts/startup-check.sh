#!/usr/bin/env bash
set -euo pipefail

PORT=${1:-3000}
HEALTH_PATH=${2:-/api/health}
RPC_URL=${POLYGON_RPC_URL:-https://polygon-rpc.com}

start_time=$(date +%s)

echo "Starting dev server in background (logs -> .logs/startup.log)..."
mkdir -p .logs
LOGFILE=.logs/startup.log
# Start Next dev in background, redirect stdout/stderr to log
npm run dev -- --port "$PORT" > "$LOGFILE" 2>&1 &
DEV_PID=$!

# Wait for server to respond
echo "Waiting for server to respond at http://localhost:$PORT$HEALTH_PATH"
start_wait=$(date +%s)
max_wait=120
while :; do
  if curl -s -f http://localhost:$PORT$HEALTH_PATH >/dev/null 2>&1; then
    break
  fi
  now=$(date +%s)
  if [ $((now - start_wait)) -gt $max_wait ]; then
    echo "Timeout waiting for server after $max_wait seconds"
    echo "--- Last 200 lines of logs ---"
    tail -n 200 "$LOGFILE" || true
    echo "--- End logs ---"
    kill $DEV_PID || true
    exit 1
  fi
  sleep 1
done

ready_time=$(date +%s)
startup_ms=$(( (ready_time - start_time) * 1000 ))

echo "Server ready after ${startup_ms}ms"
echo "Tail of log (last 50 lines):"
tail -n 50 "$LOGFILE" || true

# Optional: run a quick RPC test
if command -v curl >/dev/null 2>&1; then
  echo "Checking RPC endpoint: $RPC_URL"
  if curl -s -f "$RPC_URL" >/dev/null 2>&1; then
    echo "RPC responsive"
  else
    echo "RPC not responsive or blocked"
  fi
fi

# Keep dev server running in foreground for developer convenience
wait $DEV_PID
