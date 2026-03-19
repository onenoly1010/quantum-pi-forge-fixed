# Contracts & Deployments — Canonical Summary ✅

## Purpose
This file summarizes canonical contract addresses, where they appear in the codebase, and the immediate actions to finalize consolidation and verification across networks.

---

## Canonical Contracts (discovered locally)

- **OINIO** (0G Aristotle mainnet)
  - Address: `0xbEbC1A40A18632CeE19D220647E7aD296A1A5F37`
  - Source refs: `.env.launch`, `scripts/check-token-balance.js`
  - On-chain state: Holds ~962,839,002.79598073 OINIO (of 1,000,000,000 total)
  - Action: Verify token on 0G Chain Scan (if not verified), and confirm distribution recipients for the ~37M difference.

- **OINIO** (Polygon mainnet)
  - Address: `0x07f43E5B1A8a0928B364E40d5885f81A543B05C7`
  - Source refs: `.env.launch`
  - Action: Confirm it is the canonical Polygon token; add to `deployments.json` as Polygon instance.

- **Deployer** (wallet)
  - Address: `0x353663cd664bB3e034Dc0f308D8896C0a242e4cd`
  - Source refs: `.env.launch`, `script/DeployOINIO_0G.s.sol`
  - Action: Fund with 5–10 0G for deployments; `scripts/check-deployer-balance.js` and `scripts/auto-deploy-0g.js` will assert readiness.

- **W0G / WETH / WGAS** (Wrapped native)
  - Address: `0x1Cd0690fF9a693f5EF2dD976660a8dAFc81A109c`
  - Action: Confirm wrapper contract verification and usages by DEX contracts.

- **DEX Router & Factory**
  - Router: `0x0ff65f38fa43f0aac51901381acd7a8908ae2537`
  - Factory: `0x307bFaA937768a073D41a2EbFBD952Be8E38BF91`
  - Action: Validate that pairs exist and that the router/factory are the intended versions (Uniswap V2 parity).

---

## Recommendations & Action Plan (priority order)

1. **Verify contracts on explorers**
   - 0G Chain Scan: verify `OINIO` and DEX contracts (compiler: `0.8.24`, optimization `Yes`, runs `200`, EVM `cancun`).
   - Polygon Scan: verify Polygon `OINIO` if not already verified.

2. **Canonicalize deployments file**
   - Keep `deployments.json` updated with source refs and verification status. Use it as the single source of truth for scripts and UIs.

3. **Archive legacy contracts**
   - Move older or forked contract sources to `contracts/legacy/` with a short note referencing the canonical entry.

4. **Automate audits**
   - Add a periodic GitHub Action to validate `deployments.json` vs onchain addresses and to alert if verification or balance mismatches occur.

5. **Onboarding document for agents & humans**
   - Add `ONBOARDING_AGENTS.md` with env var expectations, safe key storage, and operator runbooks (deploy, verify, fund wallets).

---

## Notes
- Many addresses are referenced across scripts and env files — this draft uses the authoritative values in `.env.launch`. If you prefer another canonical source, we can switch the mapping.
- The deployer key in `.env.launch` is currently present locally — this is a convenience for local automation but must remain protected and rotated for production usage.

---

If you want, I can commit these changes to a branch and open a PR with a checklist of items to complete (verify, fund, archive legacy). Say **"PR please"** and I will prepare it. ✨