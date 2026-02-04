#!/bin/bash
set -e

#####################################################################
# Quantum Pi Forge - Production Rollback Script
# Rolls back deployments to previous versions in case of issues
#####################################################################

echo "⏪ Quantum Pi Forge - Rollback Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
COMPONENT=""
VERSION=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --component)
            COMPONENT="$2"
            shift 2
            ;;
        --version)
            VERSION="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 --component COMPONENT [--version VERSION]"
            echo ""
            echo "Components:"
            echo "  frontend    Rollback Vercel frontend deployment"
            echo "  backend     Rollback Railway backend deployment"
            echo "  all         Rollback all components"
            echo ""
            echo "Options:"
            echo "  --version   Specific version to rollback to (optional)"
            echo "              If not specified, rolls back to previous deployment"
            echo ""
            echo "Examples:"
            echo "  $0 --component frontend"
            echo "  $0 --component backend --version v1.2.3"
            echo "  $0 --component all"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Validate component
if [ -z "$COMPONENT" ]; then
    echo -e "${RED}❌ Error: Component not specified${NC}"
    echo "Use --component [frontend|backend|all]"
    exit 1
fi

# Confirmation
echo -e "${YELLOW}⚠️  WARNING: You are about to rollback $COMPONENT${NC}"
if [ -n "$VERSION" ]; then
    echo "   Target version: $VERSION"
else
    echo "   Target: Previous deployment"
fi
echo ""
read -p "Are you sure you want to continue? (yes/no) " -r
echo

if [ "$REPLY" != "yes" ]; then
    echo "Rollback cancelled"
    exit 0
fi

#####################################################################
# ROLLBACK FRONTEND (VERCEL)
#####################################################################

rollback_frontend() {
    echo ""
    echo -e "${BLUE}Rolling back Frontend (Vercel)...${NC}"
    echo ""
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI not found${NC}"
        return 1
    fi
    
    if [ -n "$VERSION" ]; then
        echo "Rolling back to version: $VERSION"
        # Vercel doesn't support direct version rollback via CLI
        # You need to use the dashboard or re-deploy a specific commit
        echo -e "${YELLOW}⚠️  Manual action required:${NC}"
        echo "1. Go to Vercel dashboard"
        echo "2. Find deployment: $VERSION"
        echo "3. Click 'Promote to Production'"
        echo ""
        echo "Or re-deploy from Git:"
        echo "   git checkout $VERSION"
        echo "   vercel --prod"
    else
        echo "Rolling back to previous deployment..."
        echo -e "${YELLOW}⚠️  Manual action required:${NC}"
        echo "1. Go to: https://vercel.com/[your-team]/quantum-pi-forge-fixed/deployments"
        echo "2. Find the previous successful deployment"
        echo "3. Click 'Promote to Production'"
        echo ""
        echo "Alternatively, use: vercel rollback"
    fi
    
    echo ""
    read -p "Have you completed the rollback in Vercel dashboard? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}✅ Frontend rollback completed${NC}"
        return 0
    else
        echo -e "${RED}❌ Frontend rollback not completed${NC}"
        return 1
    fi
}

#####################################################################
# ROLLBACK BACKEND (RAILWAY)
#####################################################################

rollback_backend() {
    echo ""
    echo -e "${BLUE}Rolling back Backend (Railway)...${NC}"
    echo ""
    
    if ! command -v railway &> /dev/null; then
        echo -e "${RED}❌ Railway CLI not found${NC}"
        return 1
    fi
    
    if [ -n "$VERSION" ]; then
        echo "Rolling back to version: $VERSION"
        echo -e "${YELLOW}⚠️  Manual action required:${NC}"
        echo "1. Go to Railway dashboard"
        echo "2. Select your service"
        echo "3. Go to 'Deployments' tab"
        echo "4. Find deployment: $VERSION"
        echo "5. Click 'Redeploy'"
    else
        echo "Rolling back to previous deployment..."
        echo -e "${YELLOW}⚠️  Manual action required:${NC}"
        echo "1. Go to: https://railway.app/project/[your-project]"
        echo "2. Select your service"
        echo "3. Go to 'Deployments' tab"
        echo "4. Find the previous successful deployment"
        echo "5. Click 'Redeploy'"
        echo ""
        echo "Or use Railway CLI:"
        echo "   railway redeploy [deployment-id]"
    fi
    
    echo ""
    read -p "Have you completed the rollback in Railway dashboard? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}✅ Backend rollback completed${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend rollback not completed${NC}"
        return 1
    fi
}

#####################################################################
# EXECUTE ROLLBACK
#####################################################################

FRONTEND_SUCCESS=true
BACKEND_SUCCESS=true

if [ "$COMPONENT" = "frontend" ] || [ "$COMPONENT" = "all" ]; then
    if ! rollback_frontend; then
        FRONTEND_SUCCESS=false
    fi
fi

if [ "$COMPONENT" = "backend" ] || [ "$COMPONENT" = "all" ]; then
    if ! rollback_backend; then
        BACKEND_SUCCESS=false
    fi
fi

#####################################################################
# VERIFY ROLLBACK
#####################################################################

echo ""
echo -e "${BLUE}Verifying rollback...${NC}"
echo ""

# Wait a bit for deployments to stabilize
sleep 10

# Run health checks
if [ -x "$(dirname "$0")/health-check.sh" ]; then
    bash "$(dirname "$0")/health-check.sh"
else
    echo -e "${YELLOW}⚠️  Health check script not found${NC}"
    echo "Manually verify services are working:"
    echo "  - Frontend: https://quantumpiforge.com"
    echo "  - Backend:  https://api.quantumpiforge.com/api/health"
fi

#####################################################################
# SUMMARY
#####################################################################

echo ""
echo "═══════════════════════════════════════════════"
echo "Rollback Summary"
echo "═══════════════════════════════════════════════"
echo ""

if [ "$FRONTEND_SUCCESS" = true ] && [ "$BACKEND_SUCCESS" = true ]; then
    echo -e "${GREEN}✅ Rollback completed successfully${NC}"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Monitor services for stability"
    echo "2. Investigate what caused the rollback"
    echo "3. Fix issues before attempting re-deployment"
    echo "4. Update team on rollback status"
else
    echo -e "${RED}❌ Rollback encountered issues${NC}"
    echo ""
    echo "📋 Immediate Actions:"
    echo "1. Check platform dashboards for errors"
    echo "2. Verify services are responding"
    echo "3. Consider further rollback if needed"
    echo "4. Contact platform support if issues persist"
fi

echo ""
