#!/bin/bash

echo "🚀 Deploying Pi Forge Quantum Genesis to Vercel..."

# Check for required files
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build project
echo "🔨 Building project..."
npm run build

# Check build status
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"

    # Deploy to Vercel
    echo "🚀 Deploying to Vercel..."

    # If using Vercel CLI
    if command -v vercel &> /dev/null; then
        vercel --prod
    else
        echo "📤 Push to GitHub to trigger Vercel deployment:"
        echo ""
        echo "git add ."
        echo 'git commit -m "Launch Pi Forge Quantum Genesis v2.0"'
        echo "git push origin main"
    fi
else
    echo "❌ Build failed!"
    exit 1
fi