# Discord Query Template for 0G DEX Router

## 📝 Message to Post in 0G Discord (#developer-support)

---

### **Title**: Official DEX Router for 0G Aristotle Mainnet?

**Message**:

```
Hi 0G team & community! 👋

Deploying OINIO, an intelligent NFT (ERC-7857) ecosystem on 0G Aristotle Mainnet, 
and we need a DEX router for liquidity provisioning.

Quick questions:
1. Is there an official Uniswap V2 fork deployed on 0G Aristotle?
2. If yes, what's the router address? (Checking standard 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D)
3. If not, is the community using Uniswap V2 elsewhere, or a different DEX?

We're ready to launch and can either:
- Use official router if available ✅
- Deploy our own Uniswap V2 fork ✅
- Integrate with recommended DEX ✅

Any guidance appreciated! 🙏

---
**Technical Details**:
- Mainnet: 0G Aristotle (Chain ID: 16661)
- RPC: https://evmrpc.0g.ai (verified working ✅)
- Token Standard: ERC-20 (OINIO)
- Need: AddLiquidity, Swap, GetAmountsOut functions

Thanks!
```

---

## 🔗 Links

- **0G Discord**: https://discord.gg/0g-labs
- **0G Docs**: https://docs.0g.ai/developers/contracts
- **0G GitHub**: https://github.com/0glabs
- **Uniswap V2 Core**: https://github.com/Uniswap/v2-core
- **Uniswap V2 Periphery**: https://github.com/Uniswap/v2-periphery

---

## 🎯 What to Look For in Response

**Best Case** (Official Router Exists):
- "Router address: 0x..." 
- "Liquidity already pooled for..."
- "Factory: 0x..."

**Good Case** (Community Deployed):
- "We deployed Uniswap V2 at..."
- "Use these addresses..."
- "Here's our docs..."

**Contingency Case** (No Official DEX):
- "Deploy your own V2 fork"
- "Try [alternative DEX]"
- "Community support available"

---

## ⚡ Next Actions

**Immediate** (Parallel):
1. Post this message to Discord (#developer-support)
2. Check 0G GitHub for existing router deployments
3. Continue with contingency deployment if needed

**If Official Router Found** (5 min):
- Copy address
- Update `.env.launch` → `DEX_ROUTER_ADDRESS=0x...`
- Run `bash scripts/deploy.sh` → Launch OINIO

**If No Official Router** (15 min):
- Option A: Deploy Uniswap V2 fork (see deploy-dex.sh guide)
- Option B: Use community recommendation
- Option C: Deploy alternative DEX (Curve, Balancer, etc.)

---

## 📊 Tracking

- [ ] Posted to 0G Discord
- [ ] Checked 0G GitHub for DEX contracts
- [ ] Checked 0G docs for router addresses
- [ ] Received response from community
- [ ] Router address confirmed
- [ ] .env.launch updated
- [ ] Ready for token deployment

