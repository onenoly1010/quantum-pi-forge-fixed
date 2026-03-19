#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Deploying backend to Railway"
if [ -z "${RAILWAY_TOKEN:-}" ]; then
  echo "ERROR: RAILWAY_TOKEN is not set"
  exit 1
fi

cd backend || exit 1
railway up --detach
