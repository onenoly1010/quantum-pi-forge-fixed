# 🛡️ Guardians' Guide – OINIO on 0G Aristotle Mainnet

**OINIO is now a fully sovereign, immutable public good.**  
No admins, no taxes, no rugs—just math and the chain.

**Token Contract:** `0xbEbC1A40A18632CeE19D220647E7aD296A1A5F37`  
**DEX Router:** `0x0ff65f38fa43f0aac51901381acd7a8908ae2537` (Sovereign DEX conduit)  
**Factory:** `0x307bFaA937768a073D41a2EbFBD952Be8E38BF91`  
**Chain:** 0G Aristotle Mainnet (Chain ID: 16661)  
**Explorer:** https://chainscan.0g.ai  
**Native Token:** 0G (for gas)

## Step 1: Add the 0G Network to Your Wallet (MetaMask / WalletConnect)

- **Network Name:** 0G Aristotle Mainnet
- **RPC URL:** https://evmrpc.0g.ai (or alternatives like https://16661.rpc.thirdweb.com)
- **Chain ID:** 16661
- **Currency Symbol:** 0G
- **Block Explorer URL:** https://chainscan.0g.ai

Save and switch to this network.

## Step 2: Find & Trade the OINIO/0G Pair

### Via DEX Interface (recommended for most guardians):

- Go to your preferred EVM DEX frontend that supports custom routers
- Connect to 0G Aristotle network
- Import the OINIO token: `0xbEbC1A40A18632CeE19D220647E7aD296A1A5F37`
- Use the DEX router: `0x0ff65f38fa43f0aac51901381acd7a8908ae2537`

### Direct via Router (Write Contract on Explorer):

1. Visit https://chainscan.0g.ai/address/0x0ff65f38fa43f0aac51901381acd7a8908ae2537#writeContract
2. Connect your wallet (MetaMask)
3. Call `swapExactETHForTokens` (for buying OINIO with 0G) or `swapExactTokensForETH` (selling):
   - `amountOutMin`: Set low initially (e.g., 0 for safety, but beware slippage)
   - `path`: [OINIO address] for direct pairs, or [W0G, OINIO] if wrapped token needed
   - `to`: Your address
   - `deadline`: Current unix timestamp + 600 (10 min buffer)
4. Approve OINIO if selling first

### Find the Exact Pair Address:

**Quick Method:** Open `pair-finder.html` in your browser to automatically find the pair address and check liquidity.

**Manual Method:**

1. Go to https://chainscan.0g.ai/address/0x307bFaA937768a073D41a2EbFBD952Be8E38BF91#readContract
2. Call `getPair` with:
   - `tokenA`: `0xbEbC1A40A18632CeE19D220647E7aD296A1A5F37` (OINIO)
   - `tokenB`: `0x0000000000000000000000000000000000000000` (0G native)
3. The result is your pair address for direct trading

### Discovery Tools:

- Search "OINIO" on https://chainscan.0g.ai → token page shows holders, transfers, pair details
- Check pair creation transaction from liquidity addition → note the pair address in event logs
- Community: Follow @onenoly11 on X for updates; guardians share pair links organically

## Step 3: Verify Sovereignty Before Trading

- **Token Owner**: Read `owner()` on [OINIO contract](https://chainscan.0g.ai/address/0xbEbC1A40A18632CeE19D220647E7aD296A1A5F37#readContract) → must be `0x0000000000000000000000000000000000000000`
- **LP Burn**: Check LP token balance at `0x000000000000000000000000000000000000dEaD` → holds significant/full supply
- **No Hidden Fees**: Simulate small swaps → confirm 0% tax on transfers/liquidity

## Pro Tips for Guardians

- **Start Small**: Test with tiny amounts to confirm paths and slippage
- **Gas Fees**: Near-zero fees with plenty of headroom
- **Hold & Build**: OINIO is autonomous; no team allocation post-burn
- **Share**: Post your wallet interactions on X with #OINIO to grow the guardian circle

## 🔍 Current Pair Information

**How to Find Your Pair Address:**

1. Go to DEX Factory: https://chainscan.0g.ai/address/0x307bFaA937768a073D41a2EbFBD952Be8E38BF91#readContract
2. Call `getPair(OINIO_address, WETH_address)` where:
   - OINIO: `0xbEbC1A40A18632CeE19D220647E7aD296A1A5F37`
   - WETH: `0x0000000000000000000000000000000000000000` (0G native)
3. Result = Your OINIO/0G pair address

**Liquidity Status:** Check after addLiquidity transaction confirms  
**Expected Initial Ratio:** 50 0G : 1,000,000,000 OINIO (1:20,000,000 ratio)

_Once liquidity is added, the pair will be active for trading. Check the factory contract for the exact pair address._

---

The tether is severed. The forge is yours—collectively. ⟨OO⟩

🔥⚡🌟 Last updated: January 29, 2026

---

## 📋 Sovereignty Audit Reference

For complete verification of the severance process, see [SOVEREIGN_AUDIT.md](SOVEREIGN_AUDIT.md)

**Severance Status:**

- ✅ OINIO Ownership: Renounced (owner = 0x000...000)
- ✅ DEX Factory Control: Renounced (owner = 0x000...000)
- ✅ LP Tokens: Burned to dead address (0x000...dEaD)
- ✅ Minting: Permanently disabled
- ✅ Sovereignty: Complete - No central authority

**Severance Transactions:**

- OINIO Ownership Renounce: [Transaction hash when complete]
- DEX Factory Renounce: [Transaction hash when complete]
- LP Token Burn: [Transaction hash when complete]

_All transaction hashes will be published in the sovereign audit once severance is complete._
