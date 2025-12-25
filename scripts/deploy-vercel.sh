#!/bin/bash
# scripts/deploy-vercel.sh - Deploy Vercel serverless migration

set -e

echo "🚀 Quantum Pi Forge - Vercel Serverless Deployment"
echo "=================================================="

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Validate environment
echo -e "${BLUE}[1/5]${NC} Validating environment..."
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Install with: npm install -g pnpm"
    exit 1
fi
echo -e "${GREEN}✓${NC} pnpm installed"

# Step 2: Install dependencies
echo -e "${BLUE}[2/5]${NC} Installing dependencies..."
pnpm install --frozen-lockfile
echo -e "${GREEN}✓${NC} Dependencies installed"

# Step 3: Type-check
echo -e "${BLUE}[3/5]${NC} Type-checking TypeScript..."
pnpm exec tsc --noEmit
echo -e "${GREEN}✓${NC} Type-check passed"

# Step 4: Build
echo -e "${BLUE}[4/5]${NC} Building Next.js application..."
pnpm build
echo -e "${GREEN}✓${NC} Build successful"

# Step 5: Instructions
echo -e "${BLUE}[5/5]${NC} Deployment ready!"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Configure environment variables in Vercel dashboard:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - PI_NETWORK_MODE=mainnet"
echo "   - PI_NETWORK_API_ENDPOINT"
echo "   - PI_NETWORK_APP_ID"
echo "   - PI_NETWORK_API_KEY"
echo "   - PI_NETWORK_WEBHOOK_SECRET"
echo "   - JWT_SECRET"
echo "   - NEXT_PUBLIC_CORS_ORIGINS"
echo ""
echo "2. Commit and push:"
echo "   git add ."
echo "   git commit -m 'feat: Migrate backend to Vercel serverless'"
echo "   git push origin main"
echo ""
echo "3. Monitor deployment:"
echo "   - Vercel dashboard: https://vercel.com/dashboard"
echo "   - View logs after push"
echo ""
echo "4. Test endpoints:"
echo "   curl https://quantumpiforge.com/api/health"
echo "   curl https://quantumpiforge.com/api/pi-network/status"
echo "   curl https://quantumpiforge.com/api/supabase/status"
echo ""
echo -e "${GREEN}✅ Ready to deploy!${NC}"
