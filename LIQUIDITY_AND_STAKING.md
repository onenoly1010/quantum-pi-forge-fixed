# Liquidity & Staking Runbook

## Goal
Add liquidity for OINIO / W0G and deploy or configure staking contracts according to the launch plan.

## Prerequisites
- Deployer wallet funded with 5–10 0G for gas and the desired WGAS amount for liquidity.
- OINIO tokens available in the deployer address.
- Router and Factory addresses confirmed in `deployments.json` and `.env.launch`.

## Steps — Add Liquidity (Uniswap V2-style)
1. Prepare environment:
   - Set `PRIVATE_KEY` (or `DEPLOYER_PRIVATE_KEY`) in `.env.launch` (never commit keys).
   - Confirm `OINIO_TOKEN_ADDRESS` and `W0G_ADDRESS` in `.env.launch`.

2. Approve router to spend OINIO:
   - Use script or ethers call:
     - `const token = new ethers.Contract(OINIO_TOKEN_ADDRESS, ERC20_ABI, signer); await token.approve(ROUTER_ADDRESS, amount);`

3. Add liquidity (example using router):
   - `router.addLiquidity(OINIO_TOKEN_ADDRESS, W0G_ADDRESS, oinioAmount, wgasAmount, minOinio, minWgas, DEPLOYER_ADDRESS, deadline)`
   - Or `router.addLiquidityETH` if router expects ETH-like native.

4. Verify LP tokens:
   - Call `pair = factory.getPair(OINIO, W0G)` and check `balanceOf` for deployer.

5. (Optional) Lock LP tokens in a timelock or governance vault.

## Steps — Deploy Staking Contract
1. Use `scripts/deploy-sovereign-staking.ts` (exists in repo) or create a Foundry/Hardhat script to deploy the staking contract using the LP token address as the staking token.
2. Set the reward rate, reward token (e.g., OINIO), and initialize ownership.
3. Verify contract on 0G Chain Scan after deployment.

## Automation & Safety
- Prefer manual confirmation for adding initial liquidity and for transfer of >100k OINIO.
- Use the `scripts/seed-liquidity.sh` script to perform approved liquidity additions if it matches your parameters.
- Use `scripts/verify-contracts.js` and `0G_VERIFICATION_READY.md` for verification steps.

## Troubleshooting
- If addLiquidity reverts: check approvals, slippage parameters, token decimals.
- If pair is not created: ensure factory is correct and router's addLiquidity is being called correctly.

---

If you'd like, I can prepare a templated script for your exact desired OINIO/WGAS amounts and a preflight check (shows exact transaction call, gas estimate, and required approvals). Reply **"Prepare liquidity script"** and I will generate it with your parameter placeholders.