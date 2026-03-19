#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Deploying frontend to Vercel"
if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "ERROR: VERCEL_TOKEN is not set"
  exit 1
fi

# Ensure build
npm run build

# Deploy
vercel --prod --confirm --token "$VERCEL_TOKEN"
