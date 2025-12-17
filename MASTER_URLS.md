# 🔗 MASTER URL DIRECTORY
**Genesis Launch - December 17, 2025**

## 🎯 PRIMARY ENDPOINTS

### User-Facing
- **Main Dashboard**: https://quantum-pi-forge-fixed.vercel.app/dashboard
- **Landing Page**: https://onenoly1010.github.io/quantum-pi-forge-site/
- **Countdown Timer**: [Pending - Copilot Agent PR]
- **Staking Interface**: Integrated in dashboard
- **Leaderboard**: Integrated in dashboard

### Blockchain
- **0G Aristotle RPC**: https://evmrpc.0g.ai
- **0G Scan Explorer**: https://scan.0g.ai
- **Chain ID**: 16661
- **OINIO Token**: 0x07f43E5B1A8a0928B364E40d5885f81A543B05C7

## 📊 ADMIN/MONITORING

### Deployment Platforms
- **Vercel**: https://vercel.com/onenoly1010/quantum-pi-forge-fixed
- **GitHub Repo**: https://github.com/onenoly1010/quantum-pi-forge-fixed
- **GitHub Actions**: https://github.com/onenoly1010/quantum-pi-forge-fixed/actions

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
**Status**: 🟡 Dashboard deploying • ✅ Checklist ready • ⚠️ DEX pending
