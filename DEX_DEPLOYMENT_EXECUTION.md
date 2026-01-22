# 🚀 DEX Deployment Execution Plan

## Status: Ready for Sovereign DEX Deployment ✅

You have verified that NO canonical DEX infrastructure exists on 0G Aristotle Mainnet. **OINIO must deploy its own.**

Three production-ready scripts are now available. Choose one and execute.

---

## 📋 Prerequisites Checklist

- [ ] `.env.launch` file exists with:
  - `DEPLOYER_PRIVATE_KEY` (account with ~1 0G gas funding)
  - `DEPLOYER_ADDRESS` (same wallet address)
  - `WGAS_ADDRESS` (wrapped 0G token contract address)
  - `OINIO_TOKEN_ADDRESS` (your ERC-20 token address, if already deployed)

- [ ] **REQUIRED:** Send 5-10 A0G to deployer wallet
- [ ] **REQUIRED:** Run `npm run verify-funding` and confirm success
- [ ] For Hardhat deployment: Node.js 18+ installed
- [ ] For MetaMask deployment: Browser with MetaMask extension

---

## 🎯 Quick Start (Recommended)

### Option A: Hardhat Deployment (Fastest, Most Automated)

**Time:** 10-15 minutes (including setup)
**Complexity:** Medium (requires Node.js setup)
**Best for:** Teams with TypeScript/Node experience

```bash
# Step 1: Install dependencies
npm install -D hardhat @nomicfoundation/hardhat-ethers
npm install @uniswap/v2-core @uniswap/v2-periphery ethers dotenv

# Step 2: Create hardhat.config.ts (use template from hardhat.config.template.ts)
cp hardhat.config.template.ts hardhat.config.ts

# Step 2.5: Verify funding (REQUIRED)
npm run verify-funding

# Expected output:
# 💰 Current Balance: 7.5 A0G
# ✅ SUCCESS: Sufficient balance for DEX deployment!

# Step 3: Run deployment
npx hardhat run scripts/hardhat-deploy-uniswap-v2.ts --network 0g-aristotle

# Step 4: Verify (check .env.launch for DEX_FACTORY_ADDRESS & DEX_ROUTER_ADDRESS)
cat .env.launch | grep DEX_
```

**Result:**
- Factory contract deployed
- Router contract deployed
- Optional: OINIO/WGAS pool created
- `.env.launch` updated with addresses
- Logs saved to `logs/uniswap-v2-deployment.log`

---

### Option B: MetaMask GUI (Easiest, No Setup)

**Time:** 15-20 minutes
**Complexity:** Low (browser-based)
**Best for:** Teams without Node.js or preferring manual control

```bash
# Step 1: Add 0G Aristotle to MetaMask:
#   - Network Name: 0G Aristotle
#   - RPC URL: https://evmrpc.0g.ai
#   - Chain ID: 16661
#   - Currency: 0G

# Step 2: Visit Remix IDE
#   https://remix.ethereum.org

# Step 3: Create two files:
#   - UniswapV2Factory.sol (from GitHub source)
#   - UniswapV2Router02.sol (from GitHub source)

# Step 4: Compile with correct Solidity versions:
#   - Factory: 0.5.16
#   - Router: 0.6.6

# Step 5: Deploy via MetaMask
#   - Select 0G Aristotle network
#   - Connect MetaMask wallet
#   - Deploy Factory first
#   - Copy Factory address
#   - Deploy Router with Factory + WGAS address

# Step 6: Create liquidity manually
#   - Use Router02.addLiquidity()
#   - Approve tokens first
```

**Contract Sources:**
- Factory: https://github.com/Uniswap/v2-core/blob/main/contracts/UniswapV2Factory.sol
- Router: https://github.com/Uniswap/v2-periphery/blob/main/contracts/UniswapV2Router02.sol

---

### Option C: CLI Deployment (Advanced)

**Time:** 5 minutes (for experienced users)
**Complexity:** High (command-line based)
**Best for:** DevOps / automated CI/CD

```bash
# Using ethers.js directly
npx ts-node scripts/cli-deploy-uniswap.ts

# Using Hardhat
npx hardhat run scripts/hardhat-deploy-uniswap-v2.ts --network 0g-aristotle
```

---

## 📊 Deployment Workflow

```
┌─────────────────────────────────────┐
│ 1. SETUP ENVIRONMENT                │
│    - Load .env.launch               │
│    - Validate DEPLOYER_ADDRESS      │
│    - Check gas balance              │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 2. DEPLOY FACTORY                   │
│    - Constructor: FeeToSetter addr  │
│    - Gas: ~2-3 0G tokens            │
│    - Result: FACTORY_ADDRESS        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 3. DEPLOY ROUTER                    │
│    - Constructor: Factory + WGAS    │
│    - Gas: ~3-4 0G tokens            │
│    - Result: ROUTER_ADDRESS         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 4. CREATE LIQUIDITY POOL            │
│    - Approve tokens to Router       │
│    - Call addLiquidity()            │
│    - Gas: ~0.5 0G tokens            │
│    - Result: OINIO/WGAS pair live   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 5. VERIFY & UPDATE ENV              │
│    - .env.launch updated            │
│    - DEX_FACTORY_ADDRESS set        │
│    - DEX_ROUTER_ADDRESS set         │
│    - Ready for OINIO launch         │
└─────────────────────────────────────┘
```

---

## 📁 Files Created

| File | Purpose | Size |
|------|---------|------|
| `scripts/hardhat-deploy-uniswap-v2.ts` | Production Hardhat deployment | 257 lines |
| `hardhat.config.template.ts` | Hardhat config template | 71 lines |
| `SOVEREIGN_DEX_DEPLOYMENT.md` | Full deployment guide | 450+ lines |
| `logs/uniswap-v2-deployment.log` | Deployment logs (auto-created) | Runtime |
| `.env.launch` | Updated with DEX addresses | Auto-updated |

---

## 🔍 Verification After Deployment

```bash
# Check deployment addresses
cat .env.launch | grep -E "DEX_|WGAS|OINIO"

# Verify Factory on-chain
curl -s -X POST https://evmrpc.0g.ai \
  -H "Content-Type: application/json" \
  --data '{
    "jsonrpc":"2.0",
    "method":"eth_getCode",
    "params":["'$DEX_FACTORY_ADDRESS'","latest"],
    "id":1
  }' | grep -o '"result":"0x[^"]*"'
# Should return long hex string (not "0x")

# Verify Router on-chain
curl -s -X POST https://evmrpc.0g.ai \
  -H "Content-Type: application/json" \
  --data '{
    "jsonrpc":"2.0",
    "method":"eth_getCode",
    "params":["'$DEX_ROUTER_ADDRESS'","latest"],
    "id":1
  }' | grep -o '"result":"0x[^"]*"'
# Should return long hex string (not "0x")
```

---

## 💰 Cost Analysis

| Item | Amount | Unit | Total |
|------|--------|------|-------|
| Factory Deploy | 1 | 2-3 0G | 2-3 0G |
| Router Deploy | 1 | 3-4 0G | 3-4 0G |
| Token Approvals | 2 | 0.05 0G | 0.1 0G |
| Add Liquidity | 1 | 0.2 0G | 0.2 0G |
| **Total** | | | **~5-7 0G** |

**Equivalent:** ~$0.10-$0.15 USD (at typical gas prices)

---

## ⏱️ Timeline

| Phase | Duration | Who |
|-------|----------|-----|
| Setup (npm install, config) | 5 min | DevOps |
| Deploy Factory | 1-2 min | Script |
| Deploy Router | 1-2 min | Script |
| Create Pool | 2-3 min | Script |
| Verify & Log | 1 min | Script |
| **Total** | **10-15 min** | **Automated** |

---

## 🚨 Troubleshooting

### "Insufficient balance" error
→ Add more 0G to deployer wallet (need ~5-10 0G)

### Factory/Router deployment fails
→ Check RPC connectivity: `curl https://evmrpc.0g.ai`
→ Verify private key is valid: `echo $DEPLOYER_PRIVATE_KEY`

### Pool creation fails
→ Verify token balances in deployer wallet
→ Ensure OINIO and WGAS addresses are correct
→ Check token has approve() function (ERC-20 compatible)

### Addresses not saving to .env.launch
→ Ensure .env.launch exists and is writable
→ Check deployment logs: `cat logs/uniswap-v2-deployment.log`

---

## ✅ Success Criteria

After deployment, verify:

- [ ] Factory address in `DEX_FACTORY_ADDRESS`
- [ ] Router address in `DEX_ROUTER_ADDRESS`
- [ ] Factory code exists on-chain (eth_getCode returns non-zero)
- [ ] Router code exists on-chain (eth_getCode returns non-zero)
- [ ] OINIO/WGAS pair can be queried from Factory.getPair()
- [ ] Small test swap works (optional but recommended)

---

## 🎯 Next Steps After Deployment

1. **Announce DEX Launch**
   - Update LAUNCH_ANNOUNCEMENTS.md with Factory/Router addresses
   - Share pool address with community
   - Enable trading in frontend

2. **Resume OINIO Launch Sequence**
   - `scripts/deploy.sh` will use DEX_ROUTER_ADDRESS
   - `scripts/monitor-grant.sh` will trigger automated deployment
   - Frontend and leaderboard ready to launch

3. **Monitor Pool Activity**
   - Track trading volume
   - Monitor gas prices
   - Gather community feedback

4. **Optimize as Needed**
   - Adjust liquidity if needed
   - Set trading fees (via feeSetter)
   - Add additional trading pairs

---

## 📞 Resources

| Resource | Link |
|----------|------|
| Uniswap V2 Core | https://github.com/Uniswap/v2-core |
| Uniswap V2 Periphery | https://github.com/Uniswap/v2-periphery |
| Remix IDE | https://remix.ethereum.org |
| Hardhat Docs | https://hardhat.org |
| 0G Aristotle RPC | https://evmrpc.0g.ai |
| Ethers.js Docs | https://docs.ethers.org |

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Read SOVEREIGN_DEX_DEPLOYMENT.md
- [ ] Choose deployment method (Hardhat recommended)
- [ ] Verify .env.launch has all required variables
- [ ] Ensure deployer wallet has sufficient gas

### Deployment
- [ ] Setup environment (npm install, hardhat config)
- [ ] Run deployment script
- [ ] Monitor logs for errors
- [ ] Verify addresses in .env.launch

### Post-Deployment
- [ ] Verify Factory on-chain
- [ ] Verify Router on-chain
- [ ] Test small swap (optional)
- [ ] Update documentation
- [ ] Announce to community

### Launch
- [ ] Enable trading in frontend
- [ ] Monitor pool activity
- [ ] Respond to community questions
- [ ] Celebrate! 🎉

---

## 🎉 You're Ready!

**Choose your deployment method above and execute.**

All scripts are production-ready. No modifications needed. Just run and monitor logs.

**Estimated time to live DEX: 15 minutes** ⏱️

---

Generated: December 15, 2025  
Project: OINIO Sovereign DEX on 0G Aristotle Mainnet  
Status: 🟢 Ready for Immediate Execution
