#!/bin/bash
set -e

#####################################################################
# Quantum Pi Forge - Unified Production Deployment Script
# Deploys all components: Frontend (Vercel), Backend (Railway), Contracts (Pi Network)
#####################################################################

echo "🌌 Quantum Pi Forge - Unified Production Deployment"
echo "====================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Deployment options
DEPLOY_FRONTEND=false
DEPLOY_BACKEND=false
DEPLOY_CONTRACTS=false
DEPLOY_ALL=false
SKIP_TESTS=false
ENVIRONMENT="production"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --frontend)
            DEPLOY_FRONTEND=true
            shift
            ;;
        --backend)
            DEPLOY_BACKEND=true
            shift
            ;;
        --contracts)
            DEPLOY_CONTRACTS=true
            shift
            ;;
        --all)
            DEPLOY_ALL=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --frontend         Deploy frontend to Vercel"
            echo "  --backend          Deploy backend to Railway"
            echo "  --contracts        Deploy smart contracts to Pi Network"
            echo "  --all              Deploy all components"
            echo "  --skip-tests       Skip pre-deployment tests"
            echo "  --environment ENV  Set environment (default: production)"
            echo "  --help             Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --all                    # Deploy everything"
            echo "  $0 --frontend --backend     # Deploy frontend and backend only"
            echo "  $0 --contracts --skip-tests # Deploy contracts without tests"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# If no specific component selected, show help
if [ "$DEPLOY_ALL" = false ] && [ "$DEPLOY_FRONTEND" = false ] && [ "$DEPLOY_BACKEND" = false ] && [ "$DEPLOY_CONTRACTS" = false ]; then
    echo -e "${YELLOW}⚠️  No deployment target specified${NC}"
    echo ""
    echo "Choose what to deploy:"
    echo "  --all         Deploy all components"
    echo "  --frontend    Deploy frontend only"
    echo "  --backend     Deploy backend only"
    echo "  --contracts   Deploy contracts only"
    echo ""
    echo "Use --help for more options"
    exit 1
fi

# Set flags for --all option
if [ "$DEPLOY_ALL" = true ]; then
    DEPLOY_FRONTEND=true
    DEPLOY_BACKEND=true
    DEPLOY_CONTRACTS=true
fi

echo -e "${BLUE}Deployment Configuration:${NC}"
echo "  Environment: $ENVIRONMENT"
echo "  Frontend:    $([ "$DEPLOY_FRONTEND" = true ] && echo "✓" || echo "✗")"
echo "  Backend:     $([ "$DEPLOY_BACKEND" = true ] && echo "✓" || echo "✗")"
echo "  Contracts:   $([ "$DEPLOY_CONTRACTS" = true ] && echo "✓" || echo "✗")"
echo "  Skip Tests:  $([ "$SKIP_TESTS" = true ] && echo "Yes" || echo "No")"
echo ""

# Confirmation for production
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}⚠️  WARNING: You are deploying to PRODUCTION${NC}"
    echo ""
    read -p "Are you sure you want to continue? (yes/no) " -r
    echo
    if [ "$REPLY" != "yes" ]; then
        echo "Deployment cancelled"
        exit 0
    fi
fi

# Track deployment status
FRONTEND_STATUS="⏭️  Skipped"
BACKEND_STATUS="⏭️  Skipped"
CONTRACTS_STATUS="⏭️  Skipped"

#####################################################################
# PRE-DEPLOYMENT CHECKS
#####################################################################

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Pre-Deployment Checks${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo ""

# Check Git status
echo "Checking Git status..."
cd "$PROJECT_ROOT"

if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    git status --short
    echo ""
    read -p "Continue with uncommitted changes? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please commit your changes first"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Git working directory is clean${NC}"
fi

# Check for required CLI tools
echo ""
echo "Checking required CLI tools..."

MISSING_TOOLS=false

if [ "$DEPLOY_FRONTEND" = true ]; then
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI not found${NC}"
        MISSING_TOOLS=true
    else
        echo -e "${GREEN}✅ Vercel CLI found${NC}"
    fi
fi

if [ "$DEPLOY_BACKEND" = true ]; then
    if ! command -v railway &> /dev/null; then
        echo -e "${RED}❌ Railway CLI not found${NC}"
        MISSING_TOOLS=true
    else
        echo -e "${GREEN}✅ Railway CLI found${NC}"
    fi
fi

if [ "$DEPLOY_CONTRACTS" = true ]; then
    if ! command -v soroban &> /dev/null; then
        echo -e "${RED}❌ Soroban CLI not found${NC}"
        MISSING_TOOLS=true
    else
        echo -e "${GREEN}✅ Soroban CLI found${NC}"
    fi
    
    if ! command -v cargo &> /dev/null; then
        echo -e "${RED}❌ Rust/Cargo not found${NC}"
        MISSING_TOOLS=true
    else
        echo -e "${GREEN}✅ Rust/Cargo found${NC}"
    fi
fi

if [ "$MISSING_TOOLS" = true ]; then
    echo ""
    echo -e "${RED}❌ Missing required tools. Please install them first.${NC}"
    exit 1
fi

# Run tests if not skipped
if [ "$SKIP_TESTS" = false ]; then
    echo ""
    echo "Running pre-deployment tests..."
    
    if [ "$DEPLOY_FRONTEND" = true ] || [ "$DEPLOY_BACKEND" = true ]; then
        echo "Installing dependencies..."
        npm ci --legacy-peer-deps > /dev/null 2>&1
        
        echo "Running tests..."
        if npm test > /tmp/quantum-pi-forge-test.log 2>&1; then
            echo -e "${GREEN}✅ Tests passed${NC}"
        else
            echo -e "${YELLOW}⚠️  Some tests failed (check /tmp/quantum-pi-forge-test.log)${NC}"
            read -p "Continue anyway? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Skipping tests (--skip-tests flag)${NC}"
fi

#####################################################################
# DEPLOY SMART CONTRACTS (PI NETWORK)
#####################################################################

if [ "$DEPLOY_CONTRACTS" = true ]; then
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Deploying Smart Contracts to Pi Network${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo ""
    
    if [ -x "$SCRIPT_DIR/deploy-pi-network.sh" ]; then
        if bash "$SCRIPT_DIR/deploy-pi-network.sh"; then
            CONTRACTS_STATUS="${GREEN}✅ Success${NC}"
        else
            CONTRACTS_STATUS="${RED}❌ Failed${NC}"
            echo -e "${RED}Contract deployment failed. Continuing with other deployments...${NC}"
        fi
    else
        echo -e "${RED}❌ deploy-pi-network.sh not found or not executable${NC}"
        CONTRACTS_STATUS="${RED}❌ Script Missing${NC}"
    fi
fi

#####################################################################
# DEPLOY BACKEND (RAILWAY)
#####################################################################

if [ "$DEPLOY_BACKEND" = true ]; then
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Deploying Backend API to Railway${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo ""
    
    if [ -x "$SCRIPT_DIR/deploy-railway.sh" ]; then
        if bash "$SCRIPT_DIR/deploy-railway.sh"; then
            BACKEND_STATUS="${GREEN}✅ Success${NC}"
        else
            BACKEND_STATUS="${RED}❌ Failed${NC}"
            echo -e "${RED}Backend deployment failed. Continuing with other deployments...${NC}"
        fi
    else
        echo -e "${RED}❌ deploy-railway.sh not found or not executable${NC}"
        BACKEND_STATUS="${RED}❌ Script Missing${NC}"
    fi
fi

#####################################################################
# DEPLOY FRONTEND (VERCEL)
#####################################################################

if [ "$DEPLOY_FRONTEND" = true ]; then
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Deploying Frontend to Vercel${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo ""
    
    if [ -x "$SCRIPT_DIR/deploy-vercel.sh" ]; then
        if bash "$SCRIPT_DIR/deploy-vercel.sh" "$ENVIRONMENT"; then
            FRONTEND_STATUS="${GREEN}✅ Success${NC}"
        else
            FRONTEND_STATUS="${RED}❌ Failed${NC}"
            echo -e "${RED}Frontend deployment failed.${NC}"
        fi
    else
        echo -e "${RED}❌ deploy-vercel.sh not found or not executable${NC}"
        FRONTEND_STATUS="${RED}❌ Script Missing${NC}"
    fi
fi

#####################################################################
# DEPLOYMENT SUMMARY
#####################################################################

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Deployment Summary${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo ""

echo "Component         Status"
echo "─────────────────────────────────────────────"
echo -e "Smart Contracts   $CONTRACTS_STATUS"
echo -e "Backend API       $BACKEND_STATUS"
echo -e "Frontend          $FRONTEND_STATUS"
echo ""

# Determine overall success
OVERALL_SUCCESS=true
if [[ "$CONTRACTS_STATUS" == *"Failed"* ]] || [[ "$BACKEND_STATUS" == *"Failed"* ]] || [[ "$FRONTEND_STATUS" == *"Failed"* ]]; then
    OVERALL_SUCCESS=false
fi

if [ "$OVERALL_SUCCESS" = true ]; then
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo "🔗 Production URLs:"
    echo "   Frontend: https://quantumpiforge.com"
    echo "   Backend:  https://api.quantumpiforge.com"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Verify all services are responding"
    echo "   2. Run smoke tests on production"
    echo "   3. Monitor logs for errors"
    echo "   4. Announce deployment to team"
else
    echo -e "${RED}❌ Some deployments failed${NC}"
    echo ""
    echo "📋 Troubleshooting:"
    echo "   1. Check logs for failed components"
    echo "   2. Verify environment variables are set"
    echo "   3. Check platform status pages"
    echo "   4. Consider rolling back if critical"
fi

echo ""
echo "📚 Useful Commands:"
echo "   Check status: ./scripts/health-check.sh"
echo "   View logs:    ./scripts/view-logs.sh"
echo "   Rollback:     ./scripts/rollback.sh"
echo ""
