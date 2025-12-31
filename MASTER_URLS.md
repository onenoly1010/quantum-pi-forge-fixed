# 🔗 MASTER URL DIRECTORY

> Genesis Launch - December 30, 2025 (Updated Dec 27)

## 🎯 PRIMARY ENDPOINTS

### User-Facing

- **🌐 CANONICAL PLATFORM**: <https://quantum-pi-forge-fixed.vercel.app/> ✅ OFFICIAL
  - Main Dashboard: `/dashboard`
  - Staking Interface: Integrated in dashboard
  - Leaderboard: Integrated in dashboard
  
- **⚠️ DEPRECATED**: 
  - ~~quantumpiforge.com~~ (Redirect notice displayed)
  - ~~onenoly1010.github.io/quantum-pi-forge-site/~~ (Archived)

- **Health API**: <https://quantum-pi-forge-fixed.vercel.app/api/health> ✅ LIVE

### Blockchain

- **0G Aristotle RPC**: <https://evmrpc.0g.ai> ✅ VERIFIED
- **0G Chain Explorer**: <https://chainscan.0g.ai>
- **Chain ID**: 16661 (0x4115)
- **OINIO Token**: 0x07f43E5B1A8a0928B364E40d5885f81A543B05C7

## 📊 ADMIN/MONITORING

### Deployment Platforms

- **Vercel**: <https://vercel.com/onenoly1010/quantum-pi-forge-fixed>
- **GitHub Repo**: <https://github.com/onenoly1010/quantum-pi-forge-fixed>
- **GitHub Actions**: <https://github.com/onenoly1010/quantum-pi-forge-fixed/actions>

### API Endpoints

- **Sponsor Transaction**: /api/sponsor-transaction (POST)
- **Health Check**: /api/health (GET)
- **Leaderboard**: /api/leaderboard (GET)

## 🧪 TESTING URLS

### Quick Checks

```bash
# Dashboard (should return 200 when live)
curl -I https://quantum-pi-forge-fixed.vercel.app/dashboard

# RPC (should return chain ID)
curl -X POST https://evmrpc.0g.ai -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Token contract (should return bytecode)
curl -X POST https://evmrpc.0g.ai -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x07f43E5B1A8a0928B364E40d5885f81A543B05C7","latest"],"id":1}'
```

## 🚀 LAUNCH SEQUENCE

**23:50 UTC** - Social media posts go live  
**23:55 UTC** - Final system checks  
**23:59 UTC** - Countdown hits zero  
**00:00 UTC** - Genesis launch complete  

## 📞 EMERGENCY CONTACTS

**Tech**: GitHub Copilot (this session)  
**Community**: [Discord/Telegram]  
**Business**: [Primary contact]

---

**Status**: ✅ Dashboard LIVE • ✅ Landing LIVE • ✅ Health API LIVE • ✅ RPC OK • ⏳ DEX pending Dec 30
