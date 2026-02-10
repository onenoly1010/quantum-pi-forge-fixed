# CentralAwarenessV2 Verification on 0G Chain Scan

## Contract Details
- **Address**: 0x3536633... (use full address from deployment)
- **Name**: CentralAwarenessV2
- **License**: MIT
- **Compiler**: v0.8.24+commit.e11b9ed9
- **Optimization**: Yes
- **Runs**: 200
- **EVM Version**: cancun

## Verification Steps

1. **Flatten the Contract**:
   - Use Remix IDE: https://remix.ethereum.org
   - Load `contracts/CentralAwarenessV2_NoArgs.sol`
   - Go to Solidity Compiler → Flatten
   - Copy the flattened code

2. **Submit to 0G Chain Scan**:
   - Go to: https://chainscan.0g.ai/
   - Search for your contract address
   - Click "Verify & Publish"
   - Fill form with parameters above
   - Paste flattened source code
   - Leave constructor arguments blank
   - Submit

## Post-Verification
After successful verification:
1. Call `initialize()` with your owner address
2. Update README with verified contract link
3. Add to sovereign audit documentation

## Alternative: Use Online Flattener
If Remix doesn't work, use: https://www.tools.smithii.io/flattener/solidity

## OINIO Balance Note
The OINIO balance shown on 0G Chain Scan is separate from Polygon OINIO. This is normal for multi-chain deployments - each chain has its own token instances.