#!/bin/bash
# Comprehensive health check for all services

BACKEND_URL="https://pi-forge-quantum-genesis.railway.app"
PUBLIC_SITE_URL="https://onenoly1010.github.io/quantum-pi-forge-site"
FRONTEND_URL="https://quantumpiforge.com"
RESONANCE_URL="https://quantum-resonance-clean.vercel.app"

echo "🩺 Quantum Pi Forge - Health Check"
echo "==================================="
echo ""

# Check Backend API
echo "🔧 Backend API (Railway):"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/deployment/health")
if [ "$BACKEND_STATUS" == "200" ]; then
    echo "   ✅ Online (Status: $BACKEND_STATUS)"
else
    echo "   ❌ Offline (Status: $BACKEND_STATUS)"
fi

# Check Public Site
echo ""
echo "🌐 Public Site (GitHub Pages):"
PUBLIC_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PUBLIC_SITE_URL")
if [ "$PUBLIC_STATUS" == "200" ]; then
    echo "   ✅ Online (Status: $PUBLIC_STATUS)"
else
    echo "   ❌ Offline (Status: $PUBLIC_STATUS)"
fi

# Check Frontend Dashboard
echo ""
echo "🚀 Frontend Dashboard (Vercel):"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_STATUS" == "200" ]; then
    echo "   ✅ Online (Status: $FRONTEND_STATUS)"
else
    echo "   ❌ Offline (Status: $FRONTEND_STATUS)"
fi

# Check Resonance Engine
echo ""
echo "🎵 Resonance Engine (Vercel):"
RESONANCE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$RESONANCE_URL")
if [ "$RESONANCE_STATUS" == "200" ]; then
    echo "   ✅ Online (Status: $RESONANCE_STATUS)"
else
    echo "   ❌ Offline (Status: $RESONANCE_STATUS)"
fi

echo ""
echo "==================================="
