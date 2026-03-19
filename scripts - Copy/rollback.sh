#!/usr/bin/env bash
set -euo pipefail

echo "🚨 Emergency rollback initiated"

# Rollback frontend (Vercel)
if command -v vercel >/dev/null 2>&1; then
  vercel rollback --prod --yes || echo "Vercel rollback failed or not applicable"
fi

# Rollback backend (Railway)
if command -v railway >/dev/null 2>&1; then
  railway rollback || echo "Railway rollback failed or not applicable"
fi

# Restore latest DB backup if available
if [ -f backup/latest.sql ]; then
  echo "Restoring database from backup/latest.sql"
  psql "$DATABASE_URL" < backup/latest.sql || echo "DB restore failed"
fi

echo "✅ Rollback script completed"
