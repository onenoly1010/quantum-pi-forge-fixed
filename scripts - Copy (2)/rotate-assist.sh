#!/usr/bin/env bash
set -euo pipefail

# Assisted secret rotation helper
# Usage:
#   bash scripts/rotate-assist.sh --scan   # generates reports and instructions
#   GH_TOKEN=<token> bash scripts/rotate-assist.sh --apply  # interactive rotation using GH CLI where possible

REPORT="secrets_report.json"

if [ "$1" = "--scan" ] || [ "$#" -eq 0 ]; then
  echo "[1/3] Running secrets scan..."
  bash scripts/scan-secrets.sh || true
  echo "[2/3] Generating provider-specific rotation checklist..."
  mkdir -p tmp
  python - <<'PY'
import json
import re
r=json.load(open('secrets_report.json'))
found=set()
for item in r.get('results',[]):
    t=item.get('type')
    p=item.get('pattern','')
    if 'OPENAI' in p or 'openai' in p.lower(): found.add('openai')
    if 'XAI' in p or 'xai' in p.lower(): found.add('xai')
    if 'ALCHEMY' in p or 'alchemy' in p.lower(): found.add('alchemy')
    if 'SPONSOR' in p or 'SPONSOR_PRIVATE_KEY' in p: found.add('sponsor_private_key')
    if 'RAILWAY' in p or 'RAILWAY_TOKEN' in p: found.add('railway')
    if 'VERCEL' in p or 'VERCEL_TOKEN' in p: found.add('vercel')
    if 'PRIVATE_KEY' in p: found.add('private_key')
open('tmp/rotation_checklist.md','w').write('# Rotation Checklist\n\n')
if not found:
    open('tmp/rotation_checklist.md','a').write('No direct secret patterns found in working tree, but check commit history and `.env.local` presence.\n')
else:
    for f in sorted(found):
        if f=='openai':
            open('tmp/rotation_checklist.md','a').write('## OpenAI (manual)\nVisit https://platform.openai.com/account/api-keys to revoke existing keys and create new ones. Update any deployment secrets (Vercel/Railway/GitHub) with the new key.\n\n')
        if f=='xai':
            open('tmp/rotation_checklist.md','a').write('## xAI / Other providers\nVisit the provider dashboard to rotate API keys. If they have an API, you can script rotation by supplying an admin token via env var.\n\n')
        if f=='alchemy':
            open('tmp/rotation_checklist.md','a').write('## Alchemy\nUse Alchemy Dashboard (https://dashboard.alchemy.com) to rotate keys. Optionally use their REST API if you have a management key.\n\n')
        if f=='sponsor_private_key':
            open('tmp/rotation_checklist.md','a').write('## Sponsor Private Key\nThis is a high-risk secret. Create a new wallet, transfer needed funds, update the sponsor key in all deployments (Vercel/Railway/GH Secrets), and revoke/remove old key locally.\n\n')
        if f=='railway':
            open('tmp/rotation_checklist.md','a').write('## Railway\nUse `railway login` and `railway env set` to update environment variables, or use Railway REST API if available.\n\n')
        if f=='vercel':
            open('tmp/rotation_checklist.md','a').write('## Vercel\nUse Vercel Dashboard to rotate tokens or Vercel API (requires existing management token). After rotation, update the VERCEL_TOKEN used by CI/CD.\n\n')
    open('tmp/rotation_checklist.md','a').write('\n**After rotating**, run `bash scripts/scan-secrets.sh` and then proceed with history purge.\n')
print('Checklist written to tmp/rotation_checklist.md')
PY
  echo "[3/3] Report & checklist generated: tmp/rotation_checklist.md"
  exit 0
fi

if [ "$1" = "--apply" ]; then
  if [ -z "${GH_TOKEN:-}" ]; then
    echo "ERROR: GH_TOKEN env var must be set to apply rotations for GitHub secrets via 'gh' CLI"
    exit 1
  fi
  echo "Interactive apply mode. This will not auto-rotate provider keys unless provider-specific admin tokens are present in env vars." 
  echo "Please follow tmp/rotation_checklist.md to rotate keys in provider dashboards."
  echo "If you want me to automate setting new GitHub Secrets, set GH_TOKEN and run 'gh auth login' locally and provide the secret via env var like NEW_OPENAI_KEY and run: GH_TOKEN=<token> bash scripts/rotate-assist.sh --apply-set-github" 
  exit 0
fi

if [ "$1" = "--apply-set-github" ]; then
  if [ -z "${GH_TOKEN:-}" ]; then
    echo "ERROR: GH_TOKEN env var must be set"
    exit 1
  fi
  if ! command -v gh >/dev/null 2>&1; then
    echo "ERROR: 'gh' CLI not found. Install GitHub CLI to set secrets programmatically."
    exit 1
  fi

  # Example: set GitHub repo secrets from env vars if present
  if [ -n "${NEW_OPENAI_KEY:-}" ]; then
    echo "Setting NEW_OPENAI_KEY as repo secret..."
    echo "$NEW_OPENAI_KEY" | gh secret set OPENAI_API_KEY -R "$(git config --get remote.origin.url | sed -e 's/^.*:\/\///' -e 's/\.git$//' )"
  fi
  if [ -n "${NEW_VERZEL_TOKEN:-}" ]; then
    echo "(example) set NEW_VERCEL_TOKEN as secret..."
  fi
  echo "Done. Verify secrets in repository settings."
  exit 0
fi

echo "Unknown command. Usage: --scan | --apply | --apply-set-github"
exit 1
