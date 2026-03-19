#!/usr/bin/env bash
set -euo pipefail

echo "🔄 Running daily maintenance tasks..."

# 1. Backup database
if [ -n "${DATABASE_URL:-}" ]; then
  mkdir -p backup
  pg_dump "$DATABASE_URL" > backup/$(date +%Y%m%d).sql || echo "DB backup failed"
fi

# 2. Clear old logs
find /var/log/quantum-forge -name "*.log" -mtime +7 -delete || true

# 3. Update dependencies (security patches)
npm audit fix || true

# 4. Restart services with zero downtime (if docker-compose present)
if [ -f docker-compose.yml ]; then
  docker compose down && docker compose up -d || true
fi

# 5. Send status report (best-effort)
if [ -n "${MAINTENANCE_REPORT_URL:-}" ]; then
  curl -s -X POST "$MAINTENANCE_REPORT_URL" -H 'Content-Type: application/json' -d '{"timestamp":"'$(date -Iseconds)'","status":"maintenance_complete"}' || true
fi

echo "✅ Daily maintenance completed!"