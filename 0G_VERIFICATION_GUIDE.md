# 0G Chain Verification Helper
# Use this to verify your CentralAwarenessV2 contract on 0G Chain Scan

## Step 1: Flatten the Contract
Since 0G Chain Scan only supports single-file verification, you need to flatten your contract.

### Option A: Online Flattener (Recommended)
1. Go to: https://www.tools.smithii.io/flattener/solidity
2. Paste your contract code (CentralAwarenessV2.sol)
3. Click "Flatten"
4. Copy the flattened output

### Option B: Manual Flatten
If online tools fail, combine the files manually:
1. Start with your contract
2. Replace imports with the actual OpenZeppelin code
3. Remove duplicate SPDX licenses

## Step 2: Verify on 0G Chain Scan
1. Go to: https://chainscan.0g.ai/
2. Search for your contract: 0x3536633... (full address)
3. Click "Verify & Publish"
4. Fill the form:
   - Contract Address: 0x3536633[full hex]
   - Contract Name: CentralAwarenessV2
   - Compiler: v0.8.24
   - License: MIT
   - Optimization: Yes
   - Runs: 200
   - EVM Version: cancun
   - Source Code: [paste flattened code]

## Step 3: Handle Constructor Arguments
If verification fails due to constructor args:
- The constructor takes: `address initialOwner`
- You may need to redeploy without constructor args, or use an initializer pattern

## Troubleshooting
- Ensure compiler version matches exactly (0.8.24)
- Check optimization settings match your deployment
- If still failing, try EVM version "london" or "paris"

Would you like me to help with the flattening process or provide the exact verification parameters?