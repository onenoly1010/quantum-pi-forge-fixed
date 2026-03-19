#!/usr/bin/env bash
set -euo pipefail

SERVICES=(
  "https://quantumpiforge.com"
  "https://api.quantumpiforge.com/health"
  "https://app.quantumpiforge.com"
  "https://staking.quantumpiforge.com"
  "https://vr.quantumpiforge.com"
  "https://leaderboard.quantumpiforge.com"
  "https://docs.quantumpiforge.com"
)

echo "🔄 Running Quantum Forge Health Checks..."

for service in "${SERVICES[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$service" || echo "000")
  if [ "$code" = "200" ] || [ "$code" = "302" ]; then
    echo "✅ $service is UP (Status: $code)"
  else
    echo "❌ $service is DOWN (Status: $code)"
  fi
done

# DB & Redis checks (optional)
if [ -n "${DB_HOST:-}" ] && [ -n "${DB_PORT:-}" ]; then
  if pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; then
    echo "✅ Database connection OK"
  else
    echo "❌ Database connection FAILED"
  fi
fi

if [ -n "${REDIS_HOST:-}" ] && [ -n "${REDIS_PORT:-}" ]; then
  if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping >/dev/null 2>&1; then
    echo "✅ Redis connection OK"
  else
    echo "❌ Redis connection FAILED"
  fi
fi
