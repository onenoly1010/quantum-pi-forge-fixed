#!/bin/bash
set -e

#####################################################################
# Quantum Pi Forge - Railway Backend API Deployment Script
# Deploys the Express backend API to Railway
#####################################################################

echo "🚂 Quantum Pi Forge - Railway Deployment Script"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Error: Railway CLI is not installed${NC}"
    echo "Install it with: npm install -g @railway/cli"
    echo "Or visit: https://docs.railway.app/develop/cli"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI found${NC}"

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
    echo "Please login first:"
    railway login
fi

ENVIRONMENT=${1:-production}
echo -e "${GREEN}📡 Deploying to environment: $ENVIRONMENT${NC}"

# Navigate to backend directory
cd "$(dirname "$0")/../backend"

echo ""
echo "Step 1: Validating backend code..."
echo "===================================="
# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found in backend directory${NC}"
    exit 1
fi

# Install dependencies for validation
echo "Installing dependencies..."
npm ci
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Run linter if configured
if grep -q "\"lint\"" package.json; then
    echo "Running linter..."
    npm run lint || echo -e "${YELLOW}⚠️  Linting warnings found${NC}"
fi

# Run tests if configured
if grep -q "\"test\"" package.json; then
    echo "Running tests..."
    npm test || echo -e "${YELLOW}⚠️  Some tests failed${NC}"
fi

echo ""
echo "Step 2: Environment variable check..."
echo "===================================="
# Check critical environment variables in Railway
echo "Checking Railway environment variables..."

REQUIRED_VARS=(
    "SPONSOR_PRIVATE_KEY"
    "POLYGON_RPC_URL"
    "OINIO_TOKEN_ADDRESS"
)

echo "⚠️  Make sure these variables are set in Railway dashboard:"
for var in "${REQUIRED_VARS[@]}"; do
    echo "   - $var"
done

read -p "Have you set all required environment variables in Railway? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please set environment variables in Railway dashboard first${NC}"
    echo "Visit: https://railway.app/project/[your-project]/[your-service]/variables"
    exit 1
fi

echo ""
echo "Step 3: Deploying to Railway..."
echo "===================================="

# Link to Railway project if not already linked
if [ ! -f ".railway" ]; then
    echo "Linking to Railway project..."
    railway link
fi

# Deploy to Railway
echo "Starting deployment..."
railway up --environment "$ENVIRONMENT"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo ""
echo "Step 4: Verifying deployment..."
echo "===================================="

# Get the deployment URL
DEPLOYMENT_URL=$(railway domain)

if [ -n "$DEPLOYMENT_URL" ]; then
    echo -e "${GREEN}🌐 Deployment URL: $DEPLOYMENT_URL${NC}"
    
    # Wait a bit for the service to start
    echo "Waiting for service to start..."
    sleep 10
    
    # Test health check endpoint
    echo "Testing health check endpoint..."
    HEALTH_CHECK_URL="$DEPLOYMENT_URL/api/health"
    
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL" || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
        echo "API is live and responding"
    else
        echo -e "${YELLOW}⚠️  Health check returned status: $HTTP_STATUS${NC}"
        echo "The API might still be starting up. Check Railway logs:"
        echo "railway logs"
    fi
else
    echo -e "${YELLOW}⚠️  Could not retrieve deployment URL${NC}"
    echo "Check Railway dashboard for deployment status"
fi

echo ""
echo "Step 5: Deployment summary..."
echo "===================================="
echo -e "${GREEN}🎉 Railway Deployment Complete!${NC}"
echo ""
echo "📋 Deployment Details:"
echo "   Environment: $ENVIRONMENT"
echo "   URL: ${DEPLOYMENT_URL:-Check Railway dashboard}"
echo ""
echo "📚 Useful Commands:"
echo "   View logs:    railway logs"
echo "   Open dashboard: railway open"
echo "   View status:  railway status"
echo "   Restart:      railway restart"
echo ""
echo "🔍 Next Steps:"
echo "1. Verify the API is responding at $DEPLOYMENT_URL/api/health"
echo "2. Test gasless transaction endpoint"
echo "3. Configure custom domain (api.quantumpiforge.com)"
echo "4. Set up monitoring and alerts"
echo "5. Update frontend environment variables with API URL"
echo ""
echo "⚠️  Important:"
echo "- Monitor Railway logs for any errors: railway logs"
echo "- Ensure sponsor wallet has sufficient MATIC and OINIO tokens"
echo "- Set up custom domain in Railway dashboard"
echo ""
