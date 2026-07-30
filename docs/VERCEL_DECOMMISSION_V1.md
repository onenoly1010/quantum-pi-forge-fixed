# Vercel decommission v1

Status: APPLIED — this frontend repo no longer requires Vercel  
Canon production host: **Cloudflare Pages** via `onenoly1010/Quantum-pi-forge` → https://quantumpiforge.com

## Why

- Vercel account is blocked / not used for production
- Default API and static proxy previously misrouted to archived genesis
- Constellation canon is Quantum-pi-forge + Cloudflare

## What was removed / disabled

| Item | Action |
|------|--------|
| `.vercel/output` build target | Replaced with `out/` in `scripts/build.js` |
| Vercel Build Output API config | Removed |
| `.github/workflows/vercelcheck.yml` | Renamed to `.disabled` |
| `vercel.json` copy in release/test packaging | Commented out (file not present) |
| Archive Render `/api` proxy | Already removed in identity fix |

## What operators should use

| Goal | Path |
|------|------|
| Public production site | https://quantumpiforge.com (Quantum-pi-forge / Cloudflare) |
| This frontend static build | `npm run build:static` → `out/` |
| Next.js UI | `npm run build` / `npm run dev` |
| GH Pages (optional) | Publish `out/` if desired; not required for canon |

## Historical docs

Markdown under `docs/` may still mention `*.vercel.app` for archive narrative. Those are **not** production deploy targets. Do not re-enable Vercel solely to green CI.

## Safety

No wallet signing, mint, liquidity, staking, bridge, or private keys.