#!/bin/bash

# ============================================
# OINIO QUANTUM FORGE - DEPLOYMENT INCANTATION
# ============================================

echo "🔥🌀🔔 INITIATING QUANTUM FORGE DEPLOYMENT"

# Check Node version
NODE_VERSION=$(node -v)
echo "Node version: $NODE_VERSION"
if [[ $NODE_VERSION != v18.* ]] && [[ $NODE_VERSION != v20.* ]]; then
    echo "⚠️  Warning: Recommended Node 18+ or 20+"
fi

# Clean previous builds
echo "🧹 Cleansing previous quantum states..."
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies with quantum precision
echo "📦 Weaving quantum dependencies..."
npm ci --include=dev

# Verify critical dependencies
echo "🔍 Verifying quantum threads..."
REQUIRED_DEPS=("next" "react" "ethers" "tailwindcss" "framer-motion")
for dep in "${REQUIRED_DEPS[@]}"; do
    if npm list $dep >/dev/null 2>&1; then
        echo "✅ $dep: Quantum thread intact"
    else
        echo "❌ $dep: Quantum thread broken!"
        exit 1
    fi
done

# Validate environment
echo "🌌 Validating quantum environment..."
if [ -z "$ALCHEMY_API_KEY" ]; then
    echo "⚠️  ALCHEMY_API_KEY not set. Some quantum features may be limited."
fi

if [ -z "$WALLETCONNECT_PROJECT_ID" ]; then
    echo "⚠️  WALLETCONNECT_PROJECT_ID not set. Wallet connection may fail."
fi

# Build with quantum optimization
echo "⚡ Building quantum forge (this may take a moment)..."
NEXT_TELEMETRY_DISABLED=1 npm run build

# Check build status
BUILD_STATUS=$?
if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ Quantum forge constructed successfully!"

    # Run post-build rituals
    echo "🌀 Performing post-build quantum rituals..."
    npm run postbuild 2>/dev/null || true

    # Check bundle size
    echo "📊 Analyzing quantum bundle..."
    du -sh .next/static/* 2>/dev/null || echo "Bundle analysis skipped"

    # Deployment options
    echo ""
    echo "🚀 QUANTUM DEPLOYMENT READY"
    echo "============================="
    echo "1. Deploy to Vercel (recommended)"
    echo "2. Deploy to Vercel with preview"
    echo "3. Export static build"
    echo "4. Run local quantum emulation"
    echo "5. Exit"
    echo ""

    read -p "Choose quantum path (1-5): " DEPLOY_CHOICE

    case $DEPLOY_CHOICE in
        1)
            echo "🚀 Deploying to Vercel production..."
            vercel --prod --confirm
            ;;
        2)
            echo "🌐 Deploying to Vercel preview..."
            vercel --confirm
            ;;
        3)
            echo "📁 Exporting static quantum build..."
            npm run export
            echo "✅ Static build exported to 'out/'"
            echo "Serve with: npx serve@latest out"
            ;;
        4)
            echo "⚡ Starting local quantum emulation..."
            npm run dev
            ;;
        5)
            echo "🌀 Quantum deployment ritual complete."
            echo "The forge awaits your command."
            ;;
        *)
            echo "⚠️  Invalid choice. Quantum ritual paused."
            ;;
    esac

else
    echo "❌ Quantum forge construction failed!"
    echo "Investigating quantum anomalies..."

    # Debug information
    echo ""
    echo "🔧 DEBUG INFORMATION:"
    echo "---------------------"
    echo "Next.js version: $(npm list next | grep next | head -1)"
    echo "Node version: $NODE_VERSION"
    echo "NPM version: $(npm -v)"
    echo "Build error code: $BUILD_STATUS"

    # Common fixes
    echo ""
    echo "🔄 ATTEMPTING QUANTUM REALIGNMENT:"
    echo "1. Clearing quantum cache..."
    rm -rf .next/cache

    echo "2. Reinstalling quantum threads..."
    npm rebuild

    echo "3. Attempting alternative build..."
    NODE_OPTIONS="--max-old-space-size=4096" npm run build

    if [ $? -eq 0 ]; then
        echo "✅ Quantum realignment successful!"
    else
        echo "❌ Quantum anomaly persists."
        echo "Please check:"
        echo "  - Node version compatibility"
        echo "  - Memory allocation"
        echo "  - Missing dependencies"
        echo ""
        echo "For immediate assistance:"
        echo "  npm run debug:build"
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "🔥🌀🔔 QUANTUM FORGE DEPLOYMENT COMPLETE"
echo "=========================================="
echo ""
echo "The eternal forge burns at:"
echo "🌐 https://pi-forge-quantum-genesis.vercel.app"
echo ""
echo "Sovereign commands:"
echo "  npm run dev      - Local quantum emulation"
echo "  npm run build    - Construct quantum forge"
echo "  npm run start    - Ignite production forge"
echo "  npm run lint     - Purify quantum code"
echo ""
echo "Remember, OINIO incarnate:"
echo "  No bottle binds this flame"
echo "  Chase the quantum kiss"
echo "  Twist the trinity tighter"
echo "  Let the Ankh pulse wild"
echo ""
echo "The bell awaits your strike..."
echo ""