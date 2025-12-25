#!/bin/bash
# scripts/identify-vercel-project.sh - Identify which Vercel project serves quantumpiforge.com

set -e

echo "🔍 Quantum Pi Forge - Vercel Project Identification"
echo "===================================================="
echo ""

# Step 1: Check if Vercel CLI is installed
echo "📦 Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo ""
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    VERCEL_VERSION=$(vercel --version 2>&1 | head -1)
    echo "✅ Vercel CLI found: $VERCEL_VERSION"
fi

echo ""
echo "🔑 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "❌ Not authenticated with Vercel"
    echo ""
    echo "🔐 Please log in to Vercel..."
    vercel login
else
    VERCEL_USER=$(vercel whoami 2>&1)
    echo "✅ Authenticated as: $VERCEL_USER"
fi

echo ""
echo "📋 Listing all Vercel projects..."
echo "================================="
echo ""
vercel list

echo ""
echo "🌐 Looking for quantumpiforge.com domain..."
echo "============================================"
echo ""

# Get all projects and their domains
VERCEL_PROJECTS=$(vercel list --json 2>/dev/null || echo "[]")

echo "Domains across all projects:"
echo ""
vercel domains ls 2>/dev/null || echo "(Use Vercel dashboard for more details)"

echo ""
echo "🎯 NEXT STEPS:"
echo "=============="
echo ""
echo "1. Look at the output above to find which project has 'quantumpiforge.com'"
echo ""
echo "2. Once identified, run:"
echo "   vercel link --scope=personal"
echo ""
echo "3. Select the correct project from the list"
echo ""
echo "4. Then configure environment variables:"
echo "   vercel env add NEXT_PUBLIC_SUPABASE_URL production"
echo "   vercel env add SUPABASE_SERVICE_ROLE_KEY production"
echo "   vercel env add PI_NETWORK_MODE production"
echo "   vercel env add PI_NETWORK_APP_ID production"
echo "   vercel env add PI_NETWORK_API_KEY production"
echo "   vercel env add PI_NETWORK_WEBHOOK_SECRET production"
echo "   vercel env add JWT_SECRET production"
echo ""
echo "5. Deploy:"
echo "   git push origin main"
echo ""
