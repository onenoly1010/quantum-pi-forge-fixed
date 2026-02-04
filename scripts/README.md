# Deployment Scripts - Quantum Pi Forge

This directory contains all production deployment and operations scripts for the Quantum Pi Forge platform.

## 📜 Available Scripts

### Deployment Scripts

#### `deploy-production.sh` - Unified Deployment
**Purpose**: Deploy all components or selected components to production.

**Usage**:
```bash
# Deploy everything
./scripts/deploy-production.sh --all

# Deploy specific components
./scripts/deploy-production.sh --frontend --backend
./scripts/deploy-production.sh --contracts

# Skip tests (faster but riskier)
./scripts/deploy-production.sh --all --skip-tests

# Deploy to different environment
./scripts/deploy-production.sh --all --environment staging
```

**Features**:
- Pre-deployment validation
- Git status checks
- Automated testing (unless skipped)
- CLI tool verification
- Progress tracking
- Error handling

---

#### `deploy-vercel.sh` - Frontend Deployment
**Purpose**: Deploy Next.js frontend to Vercel.

**Usage**:
```bash
# Deploy to production
./scripts/deploy-vercel.sh production

# Deploy to preview
./scripts/deploy-vercel.sh preview
```

**What it does**:
- Installs dependencies
- Runs local build test
- Checks environment variables
- Deploys to Vercel
- Runs post-deployment health checks

---

#### `deploy-railway.sh` - Backend API Deployment
**Purpose**: Deploy Express backend API to Railway.

**Usage**:
```bash
./scripts/deploy-railway.sh
```

**What it does**:
- Validates backend code
- Checks environment variables
- Deploys to Railway
- Tests health check endpoint
- Provides deployment URL

---

#### `deploy-pi-network.sh` - Smart Contract Deployment
**Purpose**: Deploy Soroban smart contracts to Pi Network.

**Usage**:
```bash
./scripts/deploy-pi-network.sh
```

**What it does**:
- Builds Rust/Soroban contract
- Optimizes WASM file
- Deploys to Pi Network Testnet/Mainnet
- Initializes contract
- Verifies deployment

**Environment Variables Required**:
- `PI_NETWORK_RPC_URL`
- `PI_NETWORK_PASSPHRASE`
- `PI_DEPLOYER_SECRET_KEY`
- `PI_FACTORY_ADDRESS` (optional)
- `PI_ROUTER_ADDRESS` (optional)

---

### Operations Scripts

#### `pre-flight-check.sh` - Deployment Readiness
**Purpose**: Validate environment is ready for deployment.

**Usage**:
```bash
./scripts/pre-flight-check.sh
```

**Checks**:
- ✅ Required CLI tools installed
- ✅ Dependencies up to date
- ✅ Configuration files valid
- ✅ Scripts executable
- ✅ Git repository clean
- ✅ Build test passes
- ✅ No secrets in Git

---

#### `health-check.sh` - Service Monitoring
**Purpose**: Monitor all production services health.

**Usage**:
```bash
# Check all services
./scripts/health-check.sh

# With environment variables for testing
FRONTEND_URL=https://test.example.com ./scripts/health-check.sh
```

**Checks**:
- Frontend main page
- Frontend health API
- Frontend dashboard
- Backend health API
- Pi Network contract status
- Blockchain connectivity
- Sponsor wallet status

**Exit Codes**:
- `0`: All services healthy
- `1`: One or more services degraded

---

#### `rollback.sh` - Emergency Rollback
**Purpose**: Rollback to previous deployment in case of issues.

**Usage**:
```bash
# Rollback all components
./scripts/rollback.sh --component all

# Rollback specific component
./scripts/rollback.sh --component frontend
./scripts/rollback.sh --component backend

# Rollback to specific version
./scripts/rollback.sh --component frontend --version v1.2.3
```

**What it does**:
- Guides through platform-specific rollback
- Verifies rollback with health checks
- Provides troubleshooting steps

---

## 🔧 Prerequisites

### Required Tools

1. **Node.js** (v20.x or higher)
   ```bash
   node --version
   ```

2. **CLI Tools** (install as needed):
   ```bash
   # Vercel CLI (for frontend deployment)
   npm install -g vercel
   
   # Railway CLI (for backend deployment)
   npm install -g @railway/cli
   
   # Soroban CLI (for Pi Network contracts)
   cargo install --locked soroban-cli
   ```

3. **Authentication**:
   ```bash
   vercel login
   railway login
   ```

### Environment Setup

Before deploying, ensure environment variables are set:

- **Vercel**: Dashboard → Settings → Environment Variables
- **Railway**: Dashboard → Service → Variables
- **Pi Network**: `pi-network/.soroban-env` file

See `docs/PRODUCTION_DEPLOYMENT.md` for complete list.

---

## 📋 Typical Deployment Workflow

### 1. Pre-Deployment
```bash
# Run pre-flight checks
./scripts/pre-flight-check.sh

# Fix any issues identified
```

### 2. Deploy
```bash
# Deploy all components
./scripts/deploy-production.sh --all

# Or deploy individually
./scripts/deploy-pi-network.sh      # Smart contracts first
./scripts/deploy-railway.sh         # Then backend
./scripts/deploy-vercel.sh prod     # Finally frontend
```

### 3. Verify
```bash
# Run health checks
./scripts/health-check.sh

# Manual testing
# - Visit https://quantumpiforge.com
# - Connect wallet
# - Test gasless staking
```

### 4. Monitor
```bash
# Continuously monitor (can be added to cron)
watch -n 300 ./scripts/health-check.sh
```

### 5. Rollback (if needed)
```bash
./scripts/rollback.sh --component all
```

---

## 🔒 Security Notes

### Script Permissions
All deployment scripts should be executable:
```bash
chmod +x scripts/*.sh
```

### Environment Variables
- **NEVER** commit real credentials
- Use `.env.*.example` files as templates
- Set actual values in platform dashboards
- Rotate secrets regularly

### Git Pre-commit
Before committing:
```bash
# Check for sensitive files
git status | grep -E "\.env\.|PRIVATE_KEY"

# Should return nothing
```

---

## 🐛 Troubleshooting

### Script Won't Execute
```bash
# Make script executable
chmod +x scripts/[script-name].sh

# Check for Windows line endings
dos2unix scripts/[script-name].sh
```

### CLI Not Found
```bash
# Install missing CLI
npm install -g vercel @railway/cli

# Or for Soroban
cargo install --locked soroban-cli
```

### Deployment Fails
1. Check script output for specific error
2. Verify environment variables are set
3. Check platform status pages:
   - Vercel: https://www.vercel-status.com/
   - Railway: https://status.railway.app/
4. Run pre-flight checks
5. Try deploying components individually

### Health Check Fails
1. Verify services are actually deployed
2. Check environment variables
3. Verify custom domains configured
4. Check SSL certificates
5. Review platform logs

---

## 📚 Additional Documentation

- **Complete Deployment Guide**: `docs/PRODUCTION_DEPLOYMENT.md`
- **Quick Reference**: `docs/DEPLOYMENT_QUICK_REF.md`
- **Environment Variables**: `.env.production.template`

---

## 🆘 Support

If you encounter issues:

1. Check script help: `./scripts/[script-name].sh --help`
2. Review documentation in `docs/`
3. Check platform documentation:
   - [Vercel Docs](https://vercel.com/docs)
   - [Railway Docs](https://docs.railway.app)
   - [Soroban Docs](https://soroban.stellar.org/docs)
4. Contact platform support if needed

---

**Last Updated**: 2024-02-04  
**Version**: 1.0.0
