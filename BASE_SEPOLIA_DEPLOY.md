# Deploy OINIO to Base Sepolia with Foundry

## Prerequisites
1. Install Foundry: `curl -L https://foundry.paradox.xyz | bash && foundryup`
2. Get Base Sepolia test ETH: https://www.alchemy.com/faucets/base-sepolia
3. Get Basescan API key: https://sepolia.basescan.org/myapikey

## Environment Setup
Create `.env` file:
```
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
BASESCAN_API_KEY=YOUR_API_KEY
```

## Deploy Command
```bash
forge script script/DeployOINIO.s.sol \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify \
  --verifier basescan \
  --verifier-url https://api-sepolia.basescan.org/api \
  --etherscan-api-key $BASESCAN_API_KEY
```

## Expected Output
- Contract address on Base Sepolia
- Verification on Basescan
- Ready for gasless staking tests

## Troubleshooting
- RPC issues: Use Alchemy RPC instead
- Verification fails: Check API key and constructor args
- No funds: Get test ETH from faucet