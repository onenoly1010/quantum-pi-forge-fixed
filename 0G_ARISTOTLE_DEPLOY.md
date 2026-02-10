# Deploy OINIO to 0G Aristotle with Foundry

## Prerequisites
1. Install Foundry: `curl -L https://foundry.paradox.xyz | bash && foundryup`
2. Get 0G test tokens: Use 0G faucet or bridge from other chains
3. Get 0G Chain Scan API key: https://chainscan.0g.ai/myapikey (if needed for verification)

## Environment Setup
Create `.env` file:
```
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
0G_CHAINSCAN_API_KEY=YOUR_API_KEY  # Optional for verification
```

## Deploy Command
```bash
forge script script/DeployOINIO_0G.s.sol \
  --rpc-url https://rpc.0g.ai \
  --broadcast \
  --verify \
  --verifier 0g_aristotle
```

## Expected Output
- Contract address on 0G Aristotle
- Verification on 0G Chain Scan
- Ready for sovereign consciousness anchoring

## Troubleshooting
- RPC issues: 0G RPC can be unstable, retry if fails
- Verification fails: 0G Chain Scan is young, may need manual verification
- No funds: Bridge test tokens from Polygon or use 0G faucet

## Auto-deploy helper (convenience)
A Node.js helper script will check your private key, confirm balance, and run the Foundry deploy when ready.

Usage:
1. Add your private key to `.env.launch` or set `PRIVATE_KEY` env var.
2. Install Node deps if needed: `npm i dotenv` (the repo already includes `ethers`).
3. Run: `npm run auto-deploy:0g` or `node scripts/auto-deploy-0g.js`.

The script will exit early if your deploy key isn't present or balance is too low.

## Post-Deployment
- Update sovereign documentation with OINIO address on 0G
- Ready for iNFT consciousness anchoring
- Multi-chain OINIO ecosystem complete