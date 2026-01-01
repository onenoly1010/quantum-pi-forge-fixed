# 📜 Quantum Pi Forge - Scripts Directory

This directory contains utility scripts for verifying and managing the Quantum Pi Forge deployment.

---

## 🎯 Phase 1 Completion Scripts

These scripts help track and verify Phase 1 launch blockers as defined in `CANON.md`.

### phase1-status.sh
**Purpose**: Check overall Phase 1 completion status

**Usage**:
```bash
bash scripts/phase1-status.sh
```

**What it checks**:
- ✅ Build passes locally
- ✅ Dependencies installed
- ✅ Vercel deployment live
- ✅ API endpoints responding
- ✅ Sponsor wallet configured
- ✅ Announcement template ready

**Exit Codes**:
- `0` - In progress or complete
- `1` - Blocked (action required)

---

### verify-deployment.sh
**Purpose**: Verify Vercel production deployment is live and functional

**Usage**:
```bash
bash scripts/verify-deployment.sh
```

**Tests performed**:
1. Landing page accessibility (HTTP 200)
2. Dashboard page accessibility (HTTP 200)
3. API health endpoint responding
4. Health shields endpoint (GitHub badge)
5. No 404 errors on main pages

**Exit Codes**:
- `0` - All tests passed
- `1` - One or more tests failed

**Example output**:
```
🔍 Quantum Pi Forge - Deployment Verification
==============================================

📍 Target: https://quantum-pi-forge-fixed.vercel.app

1️⃣  Landing Page Test
Testing Landing page... ✅ PASSED (HTTP 200)

2️⃣  Dashboard Test
Testing Dashboard page... ✅ PASSED (HTTP 200)

...

✅ All deployment tests passed!
```

---

### verify-sponsor-wallet.sh
**Purpose**: Verify sponsor wallet has sufficient MATIC and OINIO for gasless transactions

**Prerequisites**:
- Node.js installed
- ethers.js package available
- Environment variables set:
  - `SPONSOR_PRIVATE_KEY` (required)
  - `POLYGON_RPC_URL` (optional, defaults to https://polygon-rpc.com)
  - `OINIO_TOKEN_ADDRESS` (optional, defaults to OINIO mainnet address)

**Usage**:
```bash
export SPONSOR_PRIVATE_KEY="your_private_key_here"
bash scripts/verify-sponsor-wallet.sh
```

**⚠️ SECURITY WARNING**: 
Never commit the `SPONSOR_PRIVATE_KEY` to git! Only set it as an environment variable.

**Checks performed**:
- ✅ Wallet address derived from private key
- ✅ MATIC balance (minimum 5 MATIC, recommended 10+)
- ✅ OINIO token balance (minimum 10,000 OINIO, recommended 50,000+)

**Exit Codes**:
- `0` - Wallet properly funded
- `1` - Insufficient balance or error

**Example output**:
```
💰 Quantum Pi Forge - Sponsor Wallet Verification
==================================================

📍 Network: Polygon Mainnet (Chain ID: 137)
🔍 Checking wallet balances...

Wallet Address: 0x1234...5678
MATIC Balance: 15.5 MATIC
OINIO Balance: 75000 OINIO

==================================================
📊 Balance Summary
==================================================
MATIC Balance: 15.5 MATIC - ✅ SUFFICIENT
OINIO Balance: 75000 OINIO - ✅ SUFFICIENT

✅ Sponsor wallet is properly funded!
```

---

## 📁 Templates Directory

### templates/launch-announcement.md
**Purpose**: Pre-formatted launch announcement for community channels

**Usage**:
```bash
# View the template
cat scripts/templates/launch-announcement.md

# Copy and customize for your channel
cp scripts/templates/launch-announcement.md announcement-discord.md
# Edit announcement-discord.md with channel-specific details
```

**Customization needed**:
- Replace `[Date of Launch]` with actual launch date
- Add your Discord/Telegram/Twitter links
- Update contact information
- Adjust messaging for platform (Discord vs Twitter, etc.)

---

## 🔧 Troubleshooting

### Script fails with "command not found"
**Solution**: Make sure scripts are executable
```bash
chmod +x scripts/*.sh
```

### "SPONSOR_PRIVATE_KEY not set" error
**Solution**: Export the environment variable
```bash
export SPONSOR_PRIVATE_KEY="your_private_key_here"
# Or set in .env.local (never commit!)
```

### "curl: command not found"
**Solution**: Install curl
```bash
# Ubuntu/Debian
sudo apt-get install curl

# macOS (should be pre-installed)
# If not: brew install curl
```

### Node.js script fails
**Solution**: Ensure dependencies are installed
```bash
npm ci --legacy-peer-deps
```

### Deployment tests fail with timeout
**Solution**: Check your internet connection and Vercel status
```bash
# Test connectivity
curl -I https://vercel.com

# Check Vercel status
open https://www.vercel-status.com/
```

---

## 🔐 Security Best Practices

### Never Commit Private Keys
```bash
# Add to .gitignore (already configured)
.env.local
.env*.local
```

### Use Environment Variables
```bash
# For local testing only
export SPONSOR_PRIVATE_KEY="..."

# For Vercel production
# Set in Vercel dashboard: Settings → Environment Variables
```

### Protect Script Output
```bash
# Don't share logs that contain:
# - Private keys
# - Wallet addresses (in production)
# - Full balance information

# Sanitize before sharing
bash scripts/verify-sponsor-wallet.sh | grep -v "Private\|Wallet Address"
```

---

## 📊 Integration with CI/CD

These scripts can be integrated into GitHub Actions or other CI/CD pipelines:

```yaml
# Example: .github/workflows/phase1-check.yml
name: Phase 1 Status Check

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  check-phase1:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci --legacy-peer-deps
      - run: bash scripts/phase1-status.sh
      - name: Verify deployment
        if: github.ref == 'refs/heads/main'
        run: bash scripts/verify-deployment.sh
```

---

## 🆘 Getting Help

If scripts are not working as expected:

1. **Check documentation**: Re-read this README and `PHASE_1_COMPLETION.md`
2. **Review CANON.md**: Ensure you understand Phase 1 requirements
3. **Test manually**: Try the verification steps manually using curl/node
4. **Open an issue**: https://github.com/onenoly1010/quantum-pi-forge-fixed/issues

---

## 📚 Related Documentation

- `PHASE_1_COMPLETION.md` - Complete Phase 1 tracking document
- `CANON.md` - Single source of truth for the project
- `.github/copilot-instructions.md` - Development guidelines
- `README.md` - Main project documentation

---

**Last Updated**: 2026-01-01  
**Maintained By**: Quantum Pi Forge Team
