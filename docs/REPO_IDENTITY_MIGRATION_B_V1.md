# Repo identity + API defaults migration (B)

Status: APPLIED_ON_BRANCH  
Scope: `onenoly1010/quantum-pi-forge-fixed` only  

## Purpose

Eliminate active misrouting risk by aligning package identity and default endpoints with the multi-repo architecture:

- **Canon hub:** `onenoly1010/Quantum-pi-forge` (governance, contracts, evidence, quantumpiforge.com)
- **This repo:** production frontend / UI lane
- **Archive:** `onenoly1010/pi-forge-quantum-genesis` — historical only

## Changes in this migration

1. **Package identity** — `package.json` / lockfile name set to `quantum-pi-forge-fixed` (was `quantum-pi-forge-ignited`).
2. **API defaults** — `.env.example` no longer defaults to archived Render genesis (`pi-forge-quantum-genesis-1.onrender.com`).
3. **Static build proxy** — `scripts/build.js` no longer rewrites `/api` and `/health` to the archived Render host.
4. **Deploy labels** — `render.yaml`, `docker-compose.yml` OTEL service name, and `prometheus.yml` labels use `quantum-pi-forge-fixed`.
5. **README** — status banner + operator migration note.
6. **Vercel decommission** — static build → `out/`; `vercelcheck.yml` disabled; see `docs/VERCEL_DECOMMISSION_V1.md`.

## Build scripts consistency

| Script | Role |
|--------|------|
| `npm run dev` | Next.js local UI |
| `npm run build` | Next.js production build |
| `npm run build:static` | Legacy static Vercel output (`scripts/build.js`) — no archive proxy |
| `npm run start` | Next.js start |
| `npm run lint` | Next lint |
| `npm run typecheck` | `tsc --noEmit` |

## Safety

- No wallet signing, private key use, mint, liquidity, staking, or bridge activation.
- Placeholders such as `PI_NETWORK_WALLET_PRIVATE_KEY` in `.env.example` remain empty placeholders only — never commit real keys.
- Historical docs under `docs/` may still mention genesis URLs for archival narrative; **runtime defaults** must not.

## Follow-on (not this PR)

- **C)** Read-only multi-repo secrets inventory  
- **A)** `REPO_ROLES.md` on Quantum-pi-forge  
