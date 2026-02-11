#!/bin/bash
# Deploy Frontend Dashboard to Vercel

set -e

echo "🚀 Starting Frontend Deployment..."

# Check if backend is healthy
BACKEND_URL="https://pi-forge-quantum-genesis.railway.app"
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/deployment/health")

if [ "$HEALTH_STATUS" != "200" ]; then
    echo "❌ Backend health check failed (Status: $HEALTH_STATUS)"
    echo "Frontend deployment requires backend to be healthy first."
    exit 1
fi

echo "✅ Backend health check passed"

# Build frontend
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend build successful"

# Deploy to Vercel
echo "☁️  Deploying to Vercel..."
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo "✅ Frontend deployed successfully to Vercel"
    echo "🌐 URL: https://quantumpiforge.com"
else
    echo "❌ Vercel deployment failed"
    exit 1
fi

# Verify deployment
sleep 10
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://quantumpiforge.com")

if [ "$FRONTEND_STATUS" == "200" ]; then
    echo "✅ Frontend deployment verified"
else
    echo "⚠️  Frontend deployment verification returned status: $FRONTEND_STATUS"
fi
