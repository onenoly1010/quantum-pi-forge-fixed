# 🚀 Phase 1 Launch - Quick Reference

**Status**: 37% Complete (3/8 items)  
**Blockers**: Deployment + Wallet Funding

---

## ⚡ Quick Commands

### Check Status
```bash
# Overall Phase 1 progress
bash scripts/phase1-status.sh

# Test deployment (after deploying)
bash scripts/verify-deployment.sh

# Check wallet balance (requires SPONSOR_PRIVATE_KEY)
bash scripts/verify-sponsor-wallet.sh
```

---

## ✅ What's Done

1. ✅ Build verification passing
2. ✅ Dependencies installed  
3. ✅ Tracking documentation created
4. ✅ Verification scripts created
5. ✅ Announcement template ready

---

## ⏳ What's Needed

### 1. Deploy to Vercel
```bash
# Push to main triggers auto-deploy
git push origin main
```

**OR** deploy via Vercel dashboard:
- Go to: https://vercel.com/onenoly1010/quantum-pi-forge-fixed
- Click "Deploy"

**Verify**:
```bash
bash scripts/verify-deployment.sh
```

### 2. Fund Sponsor Wallet

**Requirements**:
- Minimum 5 MATIC (recommended: 10+)
- Minimum 10,000 OINIO (recommended: 50,000+)
- Network: Polygon Mainnet (Chain ID: 137)

**Set in Vercel**:
- Go to: Settings → Environment Variables
- Add: `SPONSOR_PRIVATE_KEY=your_key_here`
- Add: `POLYGON_RPC_URL=https://polygon-rpc.com`
- Add: `OINIO_TOKEN_ADDRESS=0x07f43E5B1A8a0928B364E40d5885f81A543B05C7`

**Verify** (locally with env var):
```bash
export SPONSOR_PRIVATE_KEY="your_key"
bash scripts/verify-sponsor-wallet.sh
```

### 3. Announce Launch

**After deployment + wallet verified**:

Use template:
```bash
cat scripts/templates/launch-announcement.md
```

**Post to**:
- [ ] GitHub README (update live URLs)
- [ ] Discord server
- [ ] Twitter/X
- [ ] Telegram group
- [ ] Pi Network community

---

## 🎯 Success Criteria

| Item | Status |
|------|--------|
| Build passes | ✅ |
| Vercel live | ⏳ |
| Dashboard loads | ⏳ |
| API responds | ⏳ |
| MATIC funded | ⏳ |
| OINIO funded | ⏳ |
| Transaction works | ⏳ |
| Announced | ⏳ |

---

## 🆘 Troubleshooting

### Build fails
```bash
rm -rf .next node_modules
npm ci --legacy-peer-deps
npm run build
```

### Deployment 404
- Check Vercel build logs
- Verify environment variables
- Try manual deploy: `vercel --prod`

### Wallet insufficient
- Visit: https://polygonscan.com/address/YOUR_ADDRESS
- Get MATIC: https://wallet.polygon.technology/
- Check token balance via script

---

## 📚 Full Documentation

- `PHASE_1_COMPLETION.md` - Complete tracking
- `CANON.md` - Project source of truth
- `scripts/README.md` - Script details

---

**Last Updated**: 2026-01-01  
**Next Milestone**: Phase 2 Stabilization (after Phase 1 complete)
