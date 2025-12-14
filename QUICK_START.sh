#!/bin/bash

# ===================================
# OINIO LAUNCH QUICK START
# ===================================
# Copy-paste these commands to get started

echo "🚀 OINIO Launch Quick Start"
echo "============================"
echo ""
echo "Step 1: Configure your environment"
echo "  cp .env.launch.template .env.launch"
echo "  nano .env.launch"
echo ""
echo "Step 2: Fill in these required values:"
echo "  - GUILD_API_KEY (from https://guild.0g.ai)"
echo "  - 0G_GRANT_ID (your grant ID)"
echo "  - DEPLOYER_PRIVATE_KEY (your wallet private key)"
echo "  - DEPLOYER_ADDRESS (your wallet address)"
echo "  - DEX_ROUTER_ADDRESS (from https://docs.0g.ai)"
echo ""
echo "Step 3: Start the automated monitoring"
echo "  source .env.launch"
echo "  bash scripts/monitor-grant.sh &"
echo ""
echo "Step 4: View the live dashboard (in another terminal)"
echo "  bash scripts/launch-dashboard.sh"
echo ""
echo "Step 5: Wait for grant approval"
echo "  The system will automatically deploy when approved!"
echo ""
echo "====================================="
echo "Need help? Read: LAUNCH_SETUP.md"
echo "====================================="
