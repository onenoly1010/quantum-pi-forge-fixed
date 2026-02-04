#!/bin/bash
set -e

#####################################################################
# Quantum Pi Forge - Vercel Frontend Deployment Script
# Deploys the Next.js frontend to Vercel with production settings
#####################################################################

echo "▲ Quantum Pi Forge - Vercel Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Error: Vercel CLI is not installed${NC}"
    echo "Install it with: npm install -g vercel"
    echo "Or visit: https://vercel.com/cli"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI found${NC}"

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo "Please login first:"
    vercel login
fi

# Determine deployment type
PRODUCTION=${1:-false}
if [ "$PRODUCTION" = "production" ] || [ "$PRODUCTION" = "prod" ] || [ "$PRODUCTION" = "--prod" ]; then
    PRODUCTION_FLAG="--prod"
    ENVIRONMENT="production"
    echo -e "${BLUE}🚀 Deploying to PRODUCTION${NC}"
else
    PRODUCTION_FLAG=""
    ENVIRONMENT="preview"
    echo -e "${BLUE}🔍 Deploying to PREVIEW${NC}"
fi

# Navigate to project root
cd "$(dirname "$0")/.."

echo ""
echo "Step 1: Pre-deployment validation..."
echo "===================================="

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm ci --legacy-peer-deps
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Run build locally to catch errors early
echo "Testing build locally..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Local build successful${NC}"
else
    echo -e "${RED}❌ Local build failed${NC}"
    echo "Fix build errors before deploying"
    exit 1
fi

echo ""
echo "Step 2: Environment variable check..."
echo "===================================="

if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}⚠️  PRODUCTION DEPLOYMENT${NC}"
    echo "Make sure these environment variables are set in Vercel:"
    echo ""
    echo "Public Variables:"
    echo "   - NEXT_PUBLIC_APP_URL"
    echo "   - NEXT_PUBLIC_API_URL"
    echo "   - NEXT_PUBLIC_POLYGON_RPC_URL"
    echo "   - NEXT_PUBLIC_OINIO_TOKEN_ADDRESS"
    echo ""
    echo "Private Variables (Server-side):"
    echo "   - SPONSOR_PRIVATE_KEY"
    echo "   - POLYGON_RPC_URL"
    echo "   - OINIO_TOKEN_ADDRESS"
    echo "   - OPENAI_API_KEY (if using AI features)"
    echo ""
    
    read -p "Have you set all required environment variables in Vercel dashboard? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}⚠️  Please set environment variables first${NC}"
        echo "Visit: https://vercel.com/[your-team]/quantum-pi-forge-fixed/settings/environment-variables"
        exit 1
    fi
fi

echo ""
echo "Step 3: Deploying to Vercel..."
echo "===================================="

# Deploy to Vercel
echo "Starting deployment..."
if [ -n "$PRODUCTION_FLAG" ]; then
    # Production deployment
    vercel --prod --yes
else
    # Preview deployment
    vercel --yes
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo ""
echo "Step 4: Retrieving deployment URL..."
echo "===================================="

# Get the deployment URL
if [ -n "$PRODUCTION_FLAG" ]; then
    DEPLOYMENT_URL="https://quantumpiforge.com"
    echo -e "${GREEN}🌐 Production URL: $DEPLOYMENT_URL${NC}"
else
    # For preview deployments, Vercel outputs the URL
    echo -e "${GREEN}🌐 Preview URL shown above${NC}"
fi

echo ""
echo "Step 5: Post-deployment checks..."
echo "===================================="

if [ -n "$PRODUCTION_FLAG" ]; then
    echo "Waiting for deployment to be live..."
    sleep 15
    
    # Test main page
    echo "Testing main page..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Main page is live!${NC}"
    else
        echo -e "${YELLOW}⚠️  Main page returned status: $HTTP_STATUS${NC}"
    fi
    
    # Test dashboard
    echo "Testing dashboard..."
    DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/dashboard" || echo "000")
    
    if [ "$DASHBOARD_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Dashboard is live!${NC}"
    else
        echo -e "${YELLOW}⚠️  Dashboard returned status: $DASHBOARD_STATUS${NC}"
    fi
    
    # Test health check API
    echo "Testing health check API..."
    HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/api/health" || echo "000")
    
    if [ "$HEALTH_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Health check API is live!${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check returned status: $HEALTH_STATUS${NC}"
    fi
fi

echo ""
echo "Step 6: Deployment summary..."
echo "===================================="
echo -e "${GREEN}🎉 Vercel Deployment Complete!${NC}"
echo ""
echo "📋 Deployment Details:"
echo "   Environment: $ENVIRONMENT"
if [ -n "$PRODUCTION_FLAG" ]; then
    echo "   URL: $DEPLOYMENT_URL"
else
    echo "   URL: Check output above"
fi
echo ""
echo "📚 Useful Commands:"
echo "   View deployments: vercel ls"
echo "   View logs:        vercel logs"
echo "   View project:     vercel inspect"
echo "   Rollback:         vercel rollback"
echo ""
echo "🔍 Next Steps:"
if [ -n "$PRODUCTION_FLAG" ]; then
    echo "1. Test wallet connection at $DEPLOYMENT_URL/dashboard"
    echo "2. Test gasless staking functionality"
    echo "3. Verify custom domain is working (quantumpiforge.com)"
    echo "4. Set up monitoring and alerts"
    echo "5. Announce deployment to community"
else
    echo "1. Test the preview deployment"
    echo "2. Verify all functionality works"
    echo "3. Deploy to production when ready: ./scripts/deploy-vercel.sh production"
fi
echo ""
echo "⚠️  Important:"
echo "- Custom domain setup: https://vercel.com/docs/concepts/projects/domains"
echo "- Configure www redirect: www.quantumpiforge.com -> quantumpiforge.com"
echo "- Enable Web Analytics in Vercel dashboard"
echo "- Set up error monitoring (Sentry integration)"
echo ""
