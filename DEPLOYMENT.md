# **GitHub Agent Deployment Instructions: Quantum Forge Ecosystem**

## **📋 Deployment Overview**
Deploy the complete Quantum Forge ecosystem from `quantumpiforge.com` as the central hub to all linked platforms. This ensures unified branding, consistent UX, and proper interconnections.

## **🚀 Core Deployment Sequence**

### **Phase 1: Central Hub Configuration**
```bash
# 1. Clone main repository
git clone https://github.com/onenoly1010/quantum-pi-forge-fixed.git
cd quantum-pi-forge-fixed

# 2. Set up central configuration
cp .env.production.example .env.production

# 3. Configure central hub (quantumpiforge.com)
echo "
# Quantum Forge Central Configuration
PRIMARY_DOMAIN=quantumpiforge.com
BACKEND_API=https://api.quantumpiforge.com
FRONTEND_APPS=https://app.quantumpiforge.com
STAKING_APP=https://staking.quantumpiforge.com
VR_PORTAL=https://vr.quantumpiforge.com
LEADERBOARD=https://leaderboard.quantumpiforge.com
DOCS=https://docs.quantumpiforge.com
" > .env.production