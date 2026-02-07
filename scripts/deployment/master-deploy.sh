#!/bin/bash
# Master deployment orchestration script

set -e

PHASE=${1:-"phase1"}

echo "🌐 Quantum Pi Forge - Master Deployment"
echo "========================================"
echo "Phase: $PHASE"
echo ""

case $PHASE in
    "phase1")
        echo "⚠️  Phase 1 is already deployed:"
        echo "  - Backend API (Railway): https://pi-forge-quantum-genesis.railway.app"
        echo "  - Public Site (GitHub Pages): Auto-deployed"
        echo ""
        echo "Use 'phase2' to deploy application layer"
        ;;
    "phase2")
        echo "🚀 Deploying Phase 2: Application Layer"
        
        # Deploy Resonance Engine
        echo ""
        echo "1. Deploying Resonance Engine..."
        echo "   Note: Auto-deploys via Vercel on push to quantum-resonance-clean"
        
        # Deploy Frontend Dashboard
        echo ""
        echo "2. Deploying Frontend Dashboard..."
        bash scripts/deployment/deploy-frontend.sh
        ;;
    "phase3")
        echo "🔐 Deploying Phase 3: Smart Contracts"
        
        # Deploy OINIO Token (if not already deployed)
        echo ""
        echo "1. OINIO Token (Polygon): Already deployed"
        echo "   Address: 0x07f43E5B1A8a0928B364E40d5885f81A543B05C7"
        
        # Deploy Pi Contracts
        echo ""
        echo "2. Deploying Pi Network Contracts..."
        bash scripts/deployment/deploy-contracts.sh pi-mainnet
        
        # Deploy 0G DEX
        echo ""
        echo "3. Deploying 0G DEX Contracts..."
        bash scripts/deployment/deploy-contracts.sh 0g-testnet
        ;;
    "all")
        echo "🚀 Full ecosystem deployment"
        bash scripts/deployment/master-deploy.sh phase2
        bash scripts/deployment/master-deploy.sh phase3
        ;;
    *)
        echo "❌ Unknown phase: $PHASE"
        echo "Valid options: phase1, phase2, phase3, all"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment phase completed"
