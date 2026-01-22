# 🌀 0G Aristotle - Uniswap V2 Sovereign DEX

**PR #138 - Phase 1 Complete, Phase 2 Ready**

## 📋 Verified Addresses

| Contract | Address | Status |
|----------|---------|--------|
| **W0G (Wrapped 0G)** | `0x1Cd0690fF9a693f5EF2dD976660a8dAFc81A109c` | ✅ VERIFIED |
| UniswapV2Factory | TBD | ⏳ Deploy |
| UniswapV2Router02 | TBD | ⏳ Deploy |

## 🔍 W0G Verification

```bash
bash contracts/0g-uniswap-v2/scripts/verify-w0g-address.sh
```

**Result**: CANONICAL (100% WETH9 parity)

## 🚀 Deployment

```bash
# Set environment
export DEPLOYER_PRIVATE_KEY="your_key"
export FACTORY_ADDRESS="0x..."  # After factory deployment
export ZERO_G_RPC_URL="https://evmrpc.0g.ai"

# Deploy
cd contracts/0g-uniswap-v2
forge script script/DeployRouter.s.sol --rpc-url $ZERO_G_RPC_URL --broadcast
```

## 📊 Network

- **Network**: 0G Aristotle Mainnet
- **Chain ID**: 16661
- **RPC**: https://evmrpc.0g.ai
- **Explorer**: https://chainscan.0g.ai
