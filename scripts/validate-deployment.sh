#!/bin/bash

# Quantum Pi Forge - Deployment Validation Script
# Validates that all components are properly configured for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if file exists and is not empty
check_file() {
    local file="$1"
    local description="$2"

    if [[ -f "$file" && -s "$file" ]]; then
        print_success "$description found: $file"
        return 0
    else
        print_error "$description missing: $file"
        return 1
    fi
}

# Check if environment variable is set
check_env_var() {
    local var_name="$1"
    local description="$2"

    if [[ -n "${!var_name}" ]]; then
        print_success "$description set"
        return 0
    else
        print_warning "$description not set"
        return 1
    fi
}

# Validate Next.js configuration
validate_frontend() {
    print_header "Frontend Validation (Next.js)"

    # Check package.json
    check_file "package.json" "Package configuration"

    # Check Next.js config
    check_file "next.config.mjs" "Next.js configuration"

    # Check environment variables
    if [[ -f ".env.local" ]]; then
        print_success "Local environment file found"
    else
        print_warning "Local environment file not found (.env.local)"
    fi

    # Check Vercel configuration
    check_file "vercel.json" "Vercel deployment configuration"

    # Check GitHub workflows
    check_file ".github/workflows/vercel-deploy.yml" "Vercel deployment workflow"

    print_success "Frontend validation completed"
}

# Validate backend configuration
validate_backend() {
    print_header "Backend Validation (FastAPI)"

    # Check FastAPI files
    check_file "fastapi/main.py" "FastAPI application"
    check_file "fastapi/requirements.txt" "Python dependencies"
    check_file "fastapi/Dockerfile" "Docker configuration"

    # Check Render configuration
    check_file "render.yaml" "Render deployment configuration"

    # Check GitHub workflow
    check_file ".github/workflows/render-deploy.yml" "Render deployment workflow"

    print_success "Backend validation completed"
}

# Validate database configuration
validate_database() {
    print_header "Database Validation (Supabase)"

    # Check Supabase migration
    check_file "supabase/migrations/001_initial_schema.sql" "Database schema"

    # Check GitHub workflow
    check_file ".github/workflows/supabase-migrate.yml" "Database migration workflow"

    print_success "Database validation completed"
}

# Validate CI/CD configuration
validate_cicd() {
    print_header "CI/CD Validation"

    # Check workflow files
    check_file ".github/workflows/vercel-deploy.yml" "Vercel deployment workflow"
    check_file ".github/workflows/render-deploy.yml" "Render deployment workflow"
    check_file ".github/workflows/supabase-migrate.yml" "Supabase migration workflow"

    print_success "CI/CD validation completed"
}

# Validate secrets and security
validate_secrets() {
    print_header "Secrets & Security Validation"

    # Check setup script
    check_file "scripts/setup-secrets.sh" "Secrets setup script"

    # Check if script is executable
    if [[ -x "scripts/setup-secrets.sh" ]]; then
        print_success "Secrets setup script is executable"
    else
        print_warning "Secrets setup script is not executable"
    fi

    # Check documentation
    check_file "docs/PRODUCTION_DEPLOYMENT.md" "Production deployment documentation"

    print_success "Secrets validation completed"
}

# Check environment variables (if .env.local exists)
check_environment_variables() {
    print_header "Environment Variables Check"

    if [[ ! -f ".env.local" ]]; then
        print_warning "No .env.local file found - skipping environment check"
        return
    fi

    # Source the environment file
    set -a
    source .env.local
    set +a

    # Check critical variables
    local critical_vars=(
        "NEXTAUTH_SECRET"
        "SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_URL"
        "OPENAI_API_KEY"
        "PI_NETWORK_API_KEY"
        "POLYGON_RPC_URL"
        "SPONSOR_PRIVATE_KEY"
    )

    local missing_count=0
    for var in "${critical_vars[@]}"; do
        if ! check_env_var "$var" "$var"; then
            ((missing_count++))
        fi
    done

    if [[ $missing_count -eq 0 ]]; then
        print_success "All critical environment variables are set"
    else
        print_warning "$missing_count critical environment variables are missing"
    fi
}

# Generate deployment checklist
generate_checklist() {
    print_header "Deployment Readiness Checklist"

    cat << 'EOF'
🔥 QUANTUM PI FORGE - DEPLOYMENT CHECKLIST
==========================================

PRE-DEPLOYMENT TASKS:
□ Obtain all required API keys and tokens
□ Create Vercel account and project
□ Create Render account and service
□ Create Supabase project and database
□ Configure GitHub repository secrets
□ Test local development environment
□ Run database migrations locally
□ Verify all environment variables are set

VERCEL FRONTEND DEPLOYMENT:
□ Repository connected to Vercel
□ All environment variables configured in Vercel
□ Build settings verified (Node.js 20, npm ci --legacy-peer-deps)
□ Domain configured (optional)
□ Preview deployments enabled

RENDER BACKEND DEPLOYMENT:
□ Repository connected to Render
□ Build command configured: pip install -r requirements.txt
□ Start command configured: uvicorn main:app --host 0.0.0.0 --port $PORT
□ Environment variables configured in Render dashboard
□ Service plan selected (Starter/Free tier for initial deployment)

SUPABASE DATABASE:
□ Project created in Supabase
□ Database migrations applied
□ Authentication configured
□ Row Level Security policies set
□ API keys obtained (anon key, service role key)

GITHUB ACTIONS CI/CD:
□ Repository secrets configured
□ Vercel deployment workflow active
□ Render deployment workflow active
□ Supabase migration workflow active
□ Workflows have necessary permissions

SECURITY & MONITORING:
□ All secrets stored securely (not in code)
□ API keys have appropriate permissions
□ Rate limiting configured where needed
□ Error monitoring set up (optional)
□ Logging configured

POST-DEPLOYMENT VERIFICATION:
□ Frontend accessible at Vercel URL
□ Backend API responding at Render URL
□ Database connections working
□ Authentication flow functional
□ Web3 wallet integration working
□ AI features operational
□ All API endpoints responding correctly

PERFORMANCE & OPTIMIZATION:
□ Build times acceptable (<5 minutes)
□ Cold start times reasonable (<10 seconds)
□ Database queries optimized
□ Static assets properly cached
□ CDN configured (Vercel handles this)

MONITORING & MAINTENANCE:
□ Error tracking configured
□ Performance monitoring active
□ Backup procedures documented
□ Update procedures established
□ Support contact information available

EOF

    print_success "Deployment checklist generated above"
}

# Main execution
main() {
    print_header "Quantum Pi Forge - Deployment Validation"

    echo "🔮 Validating production deployment configuration..."
    echo ""

    # Run all validation checks
    validate_frontend
    echo ""
    validate_backend
    echo ""
    validate_database
    echo ""
    validate_cicd
    echo ""
    validate_secrets
    echo ""
    check_environment_variables
    echo ""

    # Generate checklist
    generate_checklist

    echo ""
    print_header "Validation Complete"

    cat << 'EOF'
🎉 VALIDATION SUMMARY
====================

If all checks passed, your Quantum Pi Forge project is ready for production deployment!

Next steps:
1. Run ./scripts/setup-secrets.sh to generate setup commands
2. Obtain all required API keys and tokens
3. Execute the setup commands for each platform
4. Deploy to Vercel, Render, and Supabase
5. Verify all integrations work correctly
6. Monitor and maintain your production deployment

For detailed setup instructions, see: docs/PRODUCTION_DEPLOYMENT.md

🔮 May the Quantum Pi Forge bring prosperity to all sovereign souls!

EOF
}

# Run main function
main "$@"