# Production Deployment Guide - Quantum Pi Forge

## Overview

This document provides comprehensive instructions for deploying Quantum Pi Forge to production across three platforms:

- **Vercel**: Frontend (Next.js application)
- **Railway**: Backend API (Express.js)
- **Pi Network**: Smart Contracts (Soroban)

## Prerequisites

### Required Tools

1. **Node.js** (v20.x)
   ```bash
   node --version  # Should be 20.x
   ```

2. **CLI Tools**
   ```bash
   # Vercel CLI
   npm install -g vercel
   
   # Railway CLI
   npm install -g @railway/cli
   
   # Soroban CLI (for Pi Network contracts)
   cargo install --locked soroban-cli
   ```

3. **Authentication**
   ```bash
   # Login to Vercel
   vercel login
   
   # Login to Railway
   railway login
   ```

### Required Accounts

- [x] Vercel account with project created
- [x] Railway account with project created
- [x] Pi Network developer account
- [x] Domain registrar account (for quantumpiforge.com)

## Environment Variables Setup

### 1. Vercel (Frontend)

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

#### Public Variables (accessible in browser)
```bash
NEXT_PUBLIC_APP_URL=https://quantumpiforge.com
NEXT_PUBLIC_API_URL=https://api.quantumpiforge.com
NEXT_PUBLIC_POLYGON_CHAIN_ID=137
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_OINIO_TOKEN_ADDRESS=0x07f43E5B1A8a0928B364E40d5885f81A543B05C7
NEXT_PUBLIC_ENABLE_GASLESS_STAKING=true
NEXT_PUBLIC_ENABLE_DEX=true
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

#### Server-Side Variables (NOT accessible in browser)
```bash
SPONSOR_PRIVATE_KEY=<your-sponsor-wallet-private-key>
POLYGON_RPC_URL=https://polygon-rpc.com
OINIO_TOKEN_ADDRESS=0x07f43E5B1A8a0928B364E40d5885f81A543B05C7
OPENAI_API_KEY=<your-openai-api-key>
DATABASE_URL=<optional>
SENTRY_DSN=<optional>
```

⚠️ **CRITICAL**: Never commit `SPONSOR_PRIVATE_KEY` to version control!

### 2. Railway (Backend API)

Go to Railway Dashboard → Your Service → Variables

```bash
NODE_ENV=production
PORT=3001
API_VERSION=v1

# CORS & Security
CORS_ORIGIN=https://quantumpiforge.com,https://www.quantumpiforge.com

# Blockchain
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_CHAIN_ID=137
OINIO_TOKEN_ADDRESS=0x07f43E5B1A8a0928B364E40d5885f81A543B05C7
SPONSOR_PRIVATE_KEY=<your-sponsor-wallet-private-key>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional
OPENAI_API_KEY=<your-openai-api-key>
DATABASE_URL=<postgresql-url>
SENTRY_DSN=<your-sentry-dsn>
LOG_LEVEL=info
```

### 3. Pi Network (Soroban Contracts)

Create `pi-network/.soroban-env` file (never commit this!):

```bash
PI_NETWORK_RPC_URL=https://api.testnet.minepi.com/v1/soroban/rpc
PI_NETWORK_PASSPHRASE=Pi Testnet; February 2024
PI_NETWORK_MODE=testnet
PI_DEPLOYER_SECRET_KEY=<your-stellar-secret-key>
PI_FORGE_CONTRACT_ID=<set-after-first-deployment>
```

## Deployment Steps

### Quick Deployment (All Components)

```bash
# Deploy everything at once
./scripts/deploy-production.sh --all

# Or deploy specific components
./scripts/deploy-production.sh --frontend --backend
./scripts/deploy-production.sh --contracts
```

### Manual Deployment (Step-by-Step)

#### Step 1: Deploy Pi Network Smart Contracts

```bash
# 1. Navigate to pi-network directory
cd pi-network

# 2. Build the contract
cargo build --target wasm32-unknown-unknown --release

# 3. Deploy using script
cd ..
./scripts/deploy-pi-network.sh
```

Expected output:
```
✅ Contract installed successfully!
📝 Contract ID: CA...XYZ
```

**Important**: Save the Contract ID! Add it to:
- `pi-network/.soroban-env` as `PI_FORGE_CONTRACT_ID`
- Frontend environment as `NEXT_PUBLIC_PI_CONTRACT_ID`

#### Step 2: Deploy Backend to Railway

```bash
# 1. Ensure Railway CLI is logged in
railway whoami

# 2. Deploy using script
./scripts/deploy-railway.sh

# 3. Verify deployment
curl https://api.quantumpiforge.com/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45
}
```

#### Step 3: Deploy Frontend to Vercel

```bash
# 1. Ensure Vercel CLI is logged in
vercel whoami

# 2. Deploy to production
./scripts/deploy-vercel.sh production

# 3. Verify deployment
curl https://quantumpiforge.com/api/health
```

## Domain Configuration

### Vercel (Frontend)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add custom domain:
   - Primary: `quantumpiforge.com`
   - www: `www.quantumpiforge.com` (redirect to primary)
3. Update DNS records at your domain registrar:
   ```
   Type    Name    Value
   A       @       76.76.21.21
   CNAME   www     cname.vercel-dns.com
   ```
4. Wait for DNS propagation (can take up to 48 hours)

### Railway (Backend API)

1. Go to Railway Dashboard → Your Service → Settings
2. Add custom domain: `api.quantumpiforge.com`
3. Update DNS records:
   ```
   Type    Name    Value
   CNAME   api     <your-service>.railway.app
   ```

## Post-Deployment Verification

### 1. Run Health Checks

```bash
./scripts/health-check.sh
```

Expected output:
```
✅ All critical services are healthy
System Status: OPERATIONAL
```

### 2. Manual Testing

**Frontend Tests:**
1. Visit https://quantumpiforge.com
2. Click "Connect MetaMask" - should prompt for wallet connection
3. Navigate to dashboard - should load without errors
4. Check browser console - should have no errors

**Backend Tests:**
1. Test health endpoint:
   ```bash
   curl https://api.quantumpiforge.com/api/health
   ```
2. Test CORS (from browser console on quantumpiforge.com):
   ```javascript
   fetch('https://api.quantumpiforge.com/api/health')
     .then(r => r.json())
     .then(console.log)
   ```

**Smart Contract Tests:**
1. Query contract:
   ```bash
   soroban contract invoke \
     --id $PI_FORGE_CONTRACT_ID \
     --rpc-url $PI_NETWORK_RPC_URL \
     --network-passphrase "$PI_NETWORK_PASSPHRASE" \
     -- \
     get_total_staked
   ```

### 3. End-to-End Testing

Test the complete user flow:

1. **Wallet Connection**
   - Connect MetaMask to Polygon Mainnet
   - Verify wallet address displays correctly

2. **Token Balance**
   - Check OINIO balance displays
   - Balance should match MetaMask

3. **Gasless Staking**
   - Enter stake amount (0.01-10000 OINIO)
   - Click "Stake with Gasless Transaction"
   - Transaction should complete without gas payment
   - Verify transaction on Polygonscan

## Monitoring & Maintenance

### Continuous Monitoring

**Automated Health Checks:**
```bash
# Run health checks every 5 minutes
*/5 * * * * /path/to/quantum-pi-forge-fixed/scripts/health-check.sh
```

**Platform Monitoring:**
- Vercel Analytics: https://vercel.com/[your-team]/quantum-pi-forge-fixed/analytics
- Railway Metrics: https://railway.app/project/[your-project]/metrics
- Polygon Network Status: https://polygon.technology/system-status

### Log Viewing

**Vercel Logs:**
```bash
vercel logs quantum-pi-forge-fixed --follow
```

**Railway Logs:**
```bash
railway logs --follow
```

**Application Logs:**
- Check browser console for frontend errors
- Check Vercel/Railway logs for backend errors
- Use Sentry dashboard for error tracking (if configured)

### Alerts Setup

Configure alerts for:
- [ ] Service downtime (use UptimeRobot or Pingdom)
- [ ] Error rate spikes (Sentry alerts)
- [ ] Low sponsor wallet balance
- [ ] Unusual traffic patterns
- [ ] SSL certificate expiration

## Rollback Procedures

### Quick Rollback

```bash
# Rollback frontend
./scripts/rollback.sh --component frontend

# Rollback backend
./scripts/rollback.sh --component backend

# Rollback everything
./scripts/rollback.sh --component all
```

### Manual Rollback

**Vercel:**
1. Go to Deployments page
2. Find previous successful deployment
3. Click "Promote to Production"

**Railway:**
1. Go to Deployments tab
2. Find previous successful deployment
3. Click "Redeploy"

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Symptom**: Deployment fails during build
**Solution**:
```bash
# Test build locally
npm ci --legacy-peer-deps
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Clear cache and retry
rm -rf node_modules .next
npm install
npm run build
```

#### 2. Environment Variables Not Loading

**Symptom**: Application errors about missing env vars
**Solution**:
- Verify all required variables are set in platform dashboard
- Check variable names match exactly (case-sensitive)
- Restart service after adding variables
- For Vercel: Redeploy after adding variables

#### 3. CORS Errors

**Symptom**: Browser console shows CORS errors
**Solution**:
- Verify CORS_ORIGIN is set correctly in Railway
- Should include: `https://quantumpiforge.com,https://www.quantumpiforge.com`
- Check that URLs don't have trailing slashes
- Restart Railway service after changes

#### 4. Sponsor Wallet Issues

**Symptom**: Gasless transactions fail
**Solution**:
```bash
# Check wallet balance
npm run check-balance

# Ensure wallet has:
# - Minimum 1 MATIC for gas fees
# - Sufficient OINIO tokens to sponsor transactions
```

#### 5. Custom Domain Not Working

**Symptom**: Domain shows "This site can't be reached"
**Solution**:
- Verify DNS records are configured correctly
- Wait for DNS propagation (up to 48 hours)
- Check domain status in platform dashboard
- Verify SSL certificate is valid

## Security Checklist

Before going live:
- [ ] All private keys are stored in platform secret managers
- [ ] `.env.local` and `.soroban-env` are in `.gitignore`
- [ ] CORS origins are restricted to production domains
- [ ] Rate limiting is enabled and configured
- [ ] HTTPS is enforced on all endpoints
- [ ] Security headers are configured (X-Frame-Options, CSP, etc.)
- [ ] Sponsor wallet has monitoring alerts set up
- [ ] 2FA is enabled on all platform accounts
- [ ] Error messages don't leak sensitive information
- [ ] API endpoints have proper authentication where needed

## Support Contacts

### Platform Support
- **Vercel**: https://vercel.com/support
- **Railway**: https://railway.app/help
- **Pi Network**: https://developers.minepi.com/support

### Emergency Procedures
1. If critical issue detected:
   - Run immediate rollback: `./scripts/rollback.sh --component all`
   - Enable maintenance mode
   - Investigate issue
   - Fix and redeploy

2. If sponsor wallet compromised:
   - Generate new wallet immediately
   - Update environment variables on all platforms
   - Redeploy all services
   - Monitor for unauthorized transactions

## Deployment Checklist

Use this checklist for each production deployment:

### Pre-Deployment
- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Environment variables documented
- [ ] Sponsor wallet funded (MATIC + OINIO)
- [ ] DNS records configured
- [ ] SSL certificates valid
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented
- [ ] Team notified of deployment window

### During Deployment
- [ ] Run unified deployment script or deploy components individually
- [ ] Monitor deployment logs for errors
- [ ] Wait for all services to be live
- [ ] Run health checks
- [ ] Verify DNS resolution
- [ ] Test SSL certificates

### Post-Deployment
- [ ] Run automated health checks
- [ ] Test critical user flows
- [ ] Verify wallet connection works
- [ ] Test gasless staking transaction
- [ ] Check browser console for errors
- [ ] Verify API endpoints respond correctly
- [ ] Monitor error tracking dashboard
- [ ] Announce deployment completion to team

### 24-Hour Post-Deployment
- [ ] Monitor error rates
- [ ] Check application performance metrics
- [ ] Verify no unusual traffic patterns
- [ ] Confirm sponsor wallet balance is normal
- [ ] Review user feedback if any
- [ ] Document any issues encountered

## Conclusion

This deployment guide covers the complete production deployment process for Quantum Pi Forge. Follow these procedures carefully to ensure a smooth and secure deployment.

For questions or issues not covered in this guide, consult the platform-specific documentation or contact the development team.

---

**Last Updated**: 2024-02-04  
**Version**: 1.0.0  
**Maintained By**: DevOps Team
