# Onboarding for Autonomous Agents & Human Operators 🧭

This document enables agents (and new humans) to operate autonomously and safely for Quantum Pi Forge deployments and verification.

---

## Purpose
Provide a concise, machine- and human-readable checklist and workflows so agents can run preflight checks, perform deploys, and maintain canonical mapping of on‑chain contracts.

---

## Environment Variables (required)
- `PRIVATE_KEY` or `DEPLOYER_PRIVATE_KEY` — **Deployer** private key (never commit to repo)
- `DEPLOYER_ADDRESS` — derived public address for convenience
- `ZERO_G_RPC_URL` — `https://evmrpc.0g.ai` (0G Aristotle mainnet RPC)
- `BACKUP_RPC_URL` — fallback RPC (e.g., `https://rpc.0g.ai`)
- `OINIO_TOKEN_ADDRESS` — configured token contract address
- `0G_CHAINSCAN_API_KEY` — optional: API key for 0G Chain Scan verification

Security: Agents should read keys from a secure store (hashicorp/vault, OS secret store, or environment variables in CI) and never write private keys to logs or commit them.

---

## Minimal Agent Workflows (idempotent, safe)

1. **Preflight (safe)**
   - Run `node scripts/check-deployer-balance.js` (checks deployer key presence and balance) ✅
   - Run `node scripts/check-token-balance.js` to confirm token supply and any expected balances ✅

2. **Verify readiness for deploy**
   - Ensure deployer has at least 5–10 0G balance (gas buffer)
   - Confirm `foundry.toml` and `hardhat.config.ts` point to correct compilers and networks
   - If missing, abort and notify via webhook (Discord, Slack)

3. **Deploy (manual approval recommended)**
   - Agent may prepare deployment command and request human signing/approval for mainnet.
   - Use `scripts/auto-deploy-0g.js` for an automated (and aborting) flow — it will not broadcast if balance is insufficient.

4. **Post‑deploy verification**
   - Attempt to verify contract on 0G Chain Scan using flattened source and `0G_VERIFICATION_READY.md` instructions
   - Update `deployments.json` and `CONTRACTS.md` after successful verification (include tx hash and explorer link)

5. **Monitoring & periodic checks**
   - Agent should run health checks and alerts (e.g., monitor deployer balance, check token holder changes)
   - Run `scripts/inspect-token-transfers.js` or use explorer APIs to detect large movements

---

## Human-in-the-loop approvals
- For mainnet deploys or large token movement (>100k OINIO), require manual approval (sign-off) from a designated steward.
- Use a minimal human approval workflow: agent produces PR/issue + signed message + tx preview for review.

---

## Failure modes & recovery
- **RPC timeout**: retry with `BACKUP_RPC_URL` and escalate if multiple retries fail.
- **Verification mismatch**: re-flatten and recompile locally with exact solc version and optimizer settings; then re-submit.
- **Stuck tx**: suggest speed-up via increased gas or replace-by-fee where supported by chain/wallet.

---

## Where to find things
- `deployments.json` — canonical mapping of contracts
- `CONTRACTS.md` — human summary & actions
- `0G_VERIFICATION_READY.md` — step-by-step verification guide for CentralAwarenessV2
- `scripts/*` — helpful scripts: `auto-deploy-0g.js`, `check-deployer-balance.js`, `check-token-balance.js`

---

If you want, I can add GitHub Actions that run the preflight checks on schedule and open an issue if mismatches appear. Say **"Add CI checks"** and I'll scaffold them. ✨