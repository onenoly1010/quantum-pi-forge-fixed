# Phase 3 Deployment - Quick Reference

## Quick Start Commands

### Deploy Everything
```bash
./scripts/deploy-production.sh --all
```

### Deploy Individual Components
```bash
./scripts/deploy-vercel.sh production     # Frontend
./scripts/deploy-railway.sh               # Backend
./scripts/deploy-pi-network.sh           # Smart Contracts
```

### Health Checks
```bash
./scripts/health-check.sh
```

### Rollback
```bash
./scripts/rollback.sh --component all
```

## Environment Variables Quick Check

### Vercel (Frontend)
- ✅ `NEXT_PUBLIC_APP_URL`
- ✅ `NEXT_PUBLIC_API_URL`
- ✅ `SPONSOR_PRIVATE_KEY` (server-side)
- ✅ `POLYGON_RPC_URL` (server-side)
- ✅ `OINIO_TOKEN_ADDRESS` (server-side)

### Railway (Backend)
- ✅ `SPONSOR_PRIVATE_KEY`
- ✅ `POLYGON_RPC_URL`
- ✅ `CORS_ORIGIN`
- ✅ `RATE_LIMIT_MAX_REQUESTS`

### Pi Network (Soroban)
- ✅ `PI_DEPLOYER_SECRET_KEY`
- ✅ `PI_NETWORK_RPC_URL`
- ✅ `PI_NETWORK_PASSPHRASE`

## Production URLs

- **Frontend**: https://quantumpiforge.com
- **Backend API**: https://api.quantumpiforge.com
- **Health Checks**:
  - Frontend: https://quantumpiforge.com/api/health
  - Backend: https://api.quantumpiforge.com/api/health

## File Locations

### Configuration Files
- `vercel.json` - Vercel production config
- `railway.toml` - Railway deployment config
- `pi-network/soroban-config.toml` - Soroban config

### Environment Templates
- `.env.production.template` - Master template
- `.env.vercel.example` - Vercel-specific
- `.env.railway.example` - Railway-specific
- `pi-network/.soroban-env.example` - Soroban-specific

### Deployment Scripts
- `scripts/deploy-production.sh` - Unified deployment
- `scripts/deploy-vercel.sh` - Frontend only
- `scripts/deploy-railway.sh` - Backend only
- `scripts/deploy-pi-network.sh` - Contracts only

### Operations Scripts
- `scripts/health-check.sh` - Monitor all services
- `scripts/rollback.sh` - Emergency rollback

## Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Sponsor wallet funded (MATIC + OINIO)
- [ ] DNS records configured
- [ ] SSL certificates verified
- [ ] Tests passing locally
- [ ] Team notified
- [ ] Rollback plan ready

## Post-Deployment Checklist

- [ ] Health checks passing
- [ ] Frontend loads correctly
- [ ] Backend API responding
- [ ] Wallet connection works
- [ ] Gasless staking functional
- [ ] No console errors
- [ ] Monitoring alerts configured

## Emergency Contacts

- **Vercel Support**: https://vercel.com/support
- **Railway Support**: https://railway.app/help
- **Pi Network**: https://developers.minepi.com/support

## Common Commands

```bash
# View Vercel logs
vercel logs --follow

# View Railway logs
railway logs --follow

# Check sponsor wallet balance
npm run check-balance

# Test local build
npm run build

# Query Pi Network contract
soroban contract invoke --id $PI_FORGE_CONTRACT_ID -- get_total_staked
```

## Documentation

- 📚 Full Guide: `docs/PRODUCTION_DEPLOYMENT.md`
- 🔐 Security: Check `.gitignore` for sensitive files
- 🌐 Platform Docs:
  - Vercel: https://vercel.com/docs
  - Railway: https://docs.railway.app
  - Soroban: https://soroban.stellar.org/docs

---

**For detailed instructions, see `docs/PRODUCTION_DEPLOYMENT.md`**
