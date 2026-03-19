# Environment & Secrets (Quantum Pi Forge) 🔐

This document explains where to store environment variables and secrets, and how to validate them before deploy.

## Local development

- Copy `.env.example` → `.env.local` and fill in values.
- **Never commit** `.env.local` to source control.
- Use placeholders in `.env.example` to show required variables.

## Recommended required variables (examples)

- SPONSOR_PRIVATE_KEY — sponsor wallet (sensitive)
- DEPLOYER_PRIVATE_KEY — for automated contract deploys
- POLYGON_RPC_URL, ZERO_G_RPC_URL — RPC endpoints
- MONGODB_URI — DB connection
- NEXTAUTH_SECRET — authentication secret
- OPENAI_API_KEY — AI provider key

## CI / Deployment

- Set production secrets in the deployment provider (Vercel) or GitHub repository secrets.
- Do not store production secrets in the repository.

## Automated checks

- Run the env validator locally or in CI:
  - Development check: `node scripts/validation/env-validator.js --env=development`
  - Production check: `node scripts/validation/env-validator.js --env=production`
- A GitHub Action (`.github/workflows/env-check.yml`) will run on PRs and pushes to check that required repository secrets exist.
- **Pre-deploy funding check**: The deployment gate workflow (`.github/workflows/deployment-gate.yml`) runs `npm run verify-funding` to validate the deployer/sponsor wallet balance and gas conditions before approving DEX deployments. The verification script prefers `.env.production` in CI and will derive `DEPLOYER_ADDRESS` from `DEPLOYER_PRIVATE_KEY` or `SPONSOR_PRIVATE_KEY` if the address is not explicitly provided.

- **Deployment notifications**: You can set `DEPLOYMENT_NOTIFICATION_WEBHOOK` as a GitHub repository secret (Discord/Slack webhook URL). If present, the deployment gate will notify the webhook when funding verification fails or when gas prices are elevated.

- **Port handling & Uvicorn**: The FastAPI server reads `PORT` from the environment and falls back to `8000`. Ensure deployment providers set `PORT` as an integer. Example in Python: `PORT = int(os.getenv('PORT', '8000'))`.

- **Lockfile & dependency harmony**: We added `overrides` to `package.json` for `picomatch` and `ws`. After updating overrides locally, run `npm install` to regenerate `package-lock.json`, then commit the updated lockfile. The CI pipeline includes `node scripts/validation/validate-locks.js` to ensure `package-lock.json` contains the expected versions and to fail CI with a clear remediation message if not.

## Helpful scripts

- `npm run validate:env` — run the env validator (added to `package.json`)
- `npm run setup:secrets` — helper script to guide creating GitHub secrets (`scripts/setup-github-secrets.sh`)

## Best practices

- Rotate private keys regularly.
- Use separate credentials for staging and production.
- Keep the sponsor wallet funded with MATIC and OINIO before automated runs.
- Document any new environment variables in this file.

If you'd like, I can also add a balance check step in CI to ensure the sponsor wallet is funded before automated deployments. ⚠️ (This requires adding an RPC secret and a read-only wallet address to CI.)
