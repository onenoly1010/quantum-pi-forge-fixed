# QuantumPiForge Production Deployment Checklist

## 📋 PRE-DEPLOYMENT VERIFICATION

### Infrastructure
- [ ] Domains registered: quantumpiforge.com, forge.oinio.xyz
- [ ] SSL certificates provisioned (Let's Encrypt via Vercel/Railway)
- [ ] CDN configured (Vercel Edge Network)
- [ ] Backup strategy in place (daily snapshots)

### Environments
- [ ] Production environment configured
- [ ] Staging environment configured (staging.quantumpiforge.com)
- [ ] Development environment configured

### Secrets & Configuration
- [ ] All environment variables secured:
  - Pi Network API keys (production)
  - Database connection strings
  - Contract private keys (deployer)
  - IPFS API keys
  - AI/ML service tokens
- [ ] Secrets rotated from development values
- [ ] .env files excluded from git, managed via platform secrets

## 🚀 DEPLOYMENT SEQUENCE

### Step 1: Smart Contracts (Day 1)
- [ ] Deploy to Pi Network Testnet (verification)
- [ ] Deploy to TON Testnet (backup chain)
- [ ] Verify contracts on block explorers
- [ ] Update contract addresses in config

### Step 2: Backend API (Day 2)
- [ ] Deploy to Railway (production tier)
- [ ] Configure custom domain: api.quantumpiforge.com
- [ ] Set up database (MongoDB Atlas production cluster)
- [ ] Configure Redis for caching/queues
- [ ] Enable auto-scaling (2-10 instances)

### Step 3: Frontend (Day 3)
- [ ] Deploy to Vercel (production)
- [ ] Configure custom domain: quantumpiforge.com
- [ ] Set up analytics (Plausible for privacy)
- [ ] Configure WebSocket for real-time updates
- [ ] Enable image optimization

### Step 4: Monitoring (Day 4)
- [ ] Set up Sentry for error tracking
- [ ] Configure Prometheus + Grafana dashboards
- [ ] Set up health checks (uptimerobot.com)
- [ ] Configure alerting (Slack, Email, PagerDuty)

### Step 5: Guardians (Day 5)
- [ ] Deploy guardian agents (separate Railway instances)
- [ ] Configure automated backup system
- [ ] Set up rate limiting and DDoS protection
- [ ] Enable IPFS pinning service

## 🧪 POST-DEPLOYMENT VALIDATION

### Smoke Tests
- [ ] Homepage loads < 2s
- [ ] Pi wallet connection works
- [ ] Oracle reading generates in < 5s
- [ ] iNFT mint completes in < 30s
- [ ] Evolution triggers work
- [ ] All API endpoints respond correctly

### Load Tests
- [ ] 100 concurrent users simulated
- [ ] Database handles 10k records
- [ ] WebSocket connections stable at 1k users
- [ ] Pi payment callbacks handled under load

### Security Audit
- [ ] No secrets exposed in client bundles
- [ ] CORS properly configured
- [ ] SQL/NoSQL injection prevented
- [ ] Contract reentrancy protection verified

## 📈 MONITORING METRICS

### Business Metrics
- Daily Active Users (DAU) > 100 target
- iNFTs minted per day > 50 target
- Oracle readings per day > 200 target
- Pi transactions completed > 100 target

### Technical Metrics
- API response time < 200ms p95
- Uptime > 99.5%
- Error rate < 0.1%
- Memory usage < 80%

### Cost Monitoring
- Vercel hosting costs
- Railway API costs
- Database costs
- Contract gas costs

## 🔄 ROLLBACK PROCEDURE

### If contracts fail:
1. Pause frontend minting
2. Deploy patched contracts
3. Update frontend config
4. Resume operations

### If API fails:
1. Route traffic to last stable version
2. Debug production logs
3. Hotfix or rollback to previous deploy
4. Restore from backup if database issue

### If frontend fails:
1. Revert to previous Vercel deployment
2. Clear CDN cache
3. Verify API connectivity

## 📞 ON-CALL PROCEDURE

### Primary Contact: OINIO (onenoly1010)
### Secondary Contact: Forge Guardians Team
### Escalation Path:
1. Automated alerts → Slack #alerts
2. Unresolved after 15min → Phone call
3. Critical outage → Full team mobilization

---

**Last Updated:** January 22, 2026
**Next Review:** Weekly
**Deployment Lead:** OINIO