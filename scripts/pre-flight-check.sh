#!/bin/bash

#####################################################################
# Quantum Pi Forge - Pre-Flight Check
# Validates that everything is ready for production deployment
#####################################################################

echo "🚀 Quantum Pi Forge - Pre-Flight Deployment Check"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall readiness
ALL_CHECKS_PASSED=true

#####################################################################
# CHECK 1: Required CLI Tools
#####################################################################

echo -e "${BLUE}1. Checking Required CLI Tools${NC}"
echo "================================="

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "✅ Node.js:      $NODE_VERSION"
    
    # Check version
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo "   ✓ Version acceptable (requires >=18.x)"
    else
        echo -e "   ${RED}✗ Version too old (requires >=18.x)${NC}"
        ALL_CHECKS_PASSED=false
    fi
else
    echo -e "${RED}❌ Node.js:      Not found${NC}"
    ALL_CHECKS_PASSED=false
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "✅ npm:          $NPM_VERSION"
else
    echo -e "${RED}❌ npm:          Not found${NC}"
    ALL_CHECKS_PASSED=false
fi

# Vercel CLI (optional but recommended)
if command -v vercel &> /dev/null; then
    VERCEL_VERSION=$(vercel --version)
    echo -e "✅ Vercel CLI:   $VERCEL_VERSION"
else
    echo -e "${YELLOW}⚠️  Vercel CLI:   Not found (install: npm i -g vercel)${NC}"
fi

# Railway CLI (optional but recommended)
if command -v railway &> /dev/null; then
    echo -e "✅ Railway CLI:  Installed"
else
    echo -e "${YELLOW}⚠️  Railway CLI:  Not found (install: npm i -g @railway/cli)${NC}"
fi

# Soroban CLI (for Pi Network contracts)
if command -v soroban &> /dev/null; then
    echo -e "✅ Soroban CLI:  Installed"
else
    echo -e "${YELLOW}⚠️  Soroban CLI:  Not found (install: cargo install soroban-cli)${NC}"
fi

# Rust/Cargo (for Pi Network contracts)
if command -v cargo &> /dev/null; then
    CARGO_VERSION=$(cargo --version)
    echo -e "✅ Rust/Cargo:   $CARGO_VERSION"
else
    echo -e "${YELLOW}⚠️  Rust/Cargo:   Not found (needed for Pi Network contracts)${NC}"
fi

echo ""

#####################################################################
# CHECK 2: Project Dependencies
#####################################################################

echo -e "${BLUE}2. Checking Project Dependencies${NC}"
echo "=================================="

cd "$(dirname "$0")/.."

if [ -f "package.json" ]; then
    echo -e "✅ package.json: Found"
    
    if [ -d "node_modules" ]; then
        echo -e "✅ node_modules: Installed"
        
        # Check if dependencies are up to date
        if npm outdated --json > /tmp/npm-outdated.json 2>&1; then
            echo "   ✓ Dependencies appear up to date"
        else
            OUTDATED_COUNT=$(cat /tmp/npm-outdated.json | jq 'length' 2>/dev/null || echo "0")
            if [ "$OUTDATED_COUNT" -gt 0 ]; then
                echo -e "   ${YELLOW}⚠️  Some dependencies may be outdated${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  node_modules: Not found (run: npm install)${NC}"
    fi
else
    echo -e "${RED}❌ package.json: Not found${NC}"
    ALL_CHECKS_PASSED=false
fi

echo ""

#####################################################################
# CHECK 3: Environment Configuration
#####################################################################

echo -e "${BLUE}3. Checking Environment Configuration${NC}"
echo "======================================="

# Check if example files exist
if [ -f ".env.vercel.example" ]; then
    echo -e "✅ .env.vercel.example:    Found"
else
    echo -e "${RED}❌ .env.vercel.example:    Missing${NC}"
    ALL_CHECKS_PASSED=false
fi

if [ -f ".env.railway.example" ]; then
    echo -e "✅ .env.railway.example:   Found"
else
    echo -e "${RED}❌ .env.railway.example:   Missing${NC}"
    ALL_CHECKS_PASSED=false
fi

if [ -f ".env.production.template" ]; then
    echo -e "✅ .env.production.template: Found"
else
    echo -e "${RED}❌ .env.production.template: Missing${NC}"
    ALL_CHECKS_PASSED=false
fi

if [ -f "pi-network/.soroban-env.example" ]; then
    echo -e "✅ Pi Network env example: Found"
else
    echo -e "${RED}❌ Pi Network env example: Missing${NC}"
    ALL_CHECKS_PASSED=false
fi

echo ""

#####################################################################
# CHECK 4: Configuration Files
#####################################################################

echo -e "${BLUE}4. Checking Configuration Files${NC}"
echo "=================================="

# Vercel config
if [ -f "vercel.json" ]; then
    echo -e "✅ vercel.json:          Found"
    
    # Validate JSON
    if cat vercel.json | jq empty 2>/dev/null; then
        echo "   ✓ Valid JSON syntax"
    else
        echo -e "   ${RED}✗ Invalid JSON syntax${NC}"
        ALL_CHECKS_PASSED=false
    fi
else
    echo -e "${RED}❌ vercel.json:          Missing${NC}"
    ALL_CHECKS_PASSED=false
fi

# Railway config
if [ -f "railway.toml" ]; then
    echo -e "✅ railway.toml:         Found"
else
    echo -e "${RED}❌ railway.toml:         Missing${NC}"
    ALL_CHECKS_PASSED=false
fi

# Soroban config
if [ -f "pi-network/soroban-config.toml" ]; then
    echo -e "✅ soroban-config.toml:  Found"
else
    echo -e "${RED}❌ soroban-config.toml:  Missing${NC}"
    ALL_CHECKS_PASSED=false
fi

echo ""

#####################################################################
# CHECK 5: Deployment Scripts
#####################################################################

echo -e "${BLUE}5. Checking Deployment Scripts${NC}"
echo "================================"

SCRIPTS=(
    "scripts/deploy-production.sh"
    "scripts/deploy-vercel.sh"
    "scripts/deploy-railway.sh"
    "scripts/deploy-pi-network.sh"
    "scripts/health-check.sh"
    "scripts/rollback.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo -e "✅ $(basename $script): Found and executable"
        else
            echo -e "${YELLOW}⚠️  $(basename $script): Found but not executable${NC}"
            echo "   Run: chmod +x $script"
        fi
    else
        echo -e "${RED}❌ $(basename $script): Missing${NC}"
        ALL_CHECKS_PASSED=false
    fi
done

echo ""

#####################################################################
# CHECK 6: Git Repository Status
#####################################################################

echo -e "${BLUE}6. Checking Git Repository Status${NC}"
echo "===================================="

if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "✅ Git repository:       Initialized"
    
    # Check for uncommitted changes
    if git diff-index --quiet HEAD --; then
        echo "   ✓ Working directory clean"
    else
        echo -e "   ${YELLOW}⚠️  Uncommitted changes detected${NC}"
        git status --short | head -10
    fi
    
    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current)
    echo "   Current branch: $CURRENT_BRANCH"
    
    # Check remote
    if git remote -v | grep -q origin; then
        echo "   ✓ Remote 'origin' configured"
    else
        echo -e "   ${YELLOW}⚠️  Remote 'origin' not configured${NC}"
    fi
else
    echo -e "${RED}❌ Git repository:       Not initialized${NC}"
    ALL_CHECKS_PASSED=false
fi

echo ""

#####################################################################
# CHECK 7: Build Test
#####################################################################

echo -e "${BLUE}7. Testing Build Process${NC}"
echo "========================="

echo "Running build test (this may take a minute)..."
if npm run build > /tmp/build-test.log 2>&1; then
    echo -e "✅ Build test:           Passed"
    echo "   ✓ Project builds successfully"
else
    echo -e "${RED}❌ Build test:           Failed${NC}"
    echo "   Check /tmp/build-test.log for errors"
    ALL_CHECKS_PASSED=false
    
    # Show last few lines of error
    echo "   Last 5 lines of error:"
    tail -5 /tmp/build-test.log | sed 's/^/     /'
fi

echo ""

#####################################################################
# CHECK 8: Security Checks
#####################################################################

echo -e "${BLUE}8. Security Checks${NC}"
echo "==================="

# Check .gitignore
if [ -f ".gitignore" ]; then
    echo -e "✅ .gitignore:           Found"
    
    # Check for critical entries
    CRITICAL_PATTERNS=(
        ".env"
        "PRIVATE_KEY"
        ".soroban-env"
    )
    
    MISSING_PATTERNS=()
    for pattern in "${CRITICAL_PATTERNS[@]}"; do
        if grep -q "$pattern" .gitignore; then
            echo "   ✓ Ignores $pattern files"
        else
            MISSING_PATTERNS+=("$pattern")
        fi
    done
    
    if [ ${#MISSING_PATTERNS[@]} -gt 0 ]; then
        echo -e "   ${YELLOW}⚠️  Missing patterns in .gitignore:${NC}"
        for pattern in "${MISSING_PATTERNS[@]}"; do
            echo "      - $pattern"
        done
    fi
else
    echo -e "${RED}❌ .gitignore:           Missing${NC}"
    ALL_CHECKS_PASSED=false
fi

# Check for accidentally committed secrets
echo ""
echo "Checking for accidentally committed secrets..."

SENSITIVE_FILES=(
    ".env.local"
    ".env.railway"
    ".env.vercel"
    "pi-network/.soroban-env"
)

# Note: .env.production.template and *.example files are intentionally tracked
FOUND_SENSITIVE=false
for file in "${SENSITIVE_FILES[@]}"; do
    if git ls-files | grep -q "^$file$"; then
        echo -e "${RED}❌ WARNING: $file is tracked by Git!${NC}"
        FOUND_SENSITIVE=true
    fi
done

if [ "$FOUND_SENSITIVE" = false ]; then
    echo "✅ No sensitive files found in Git"
    echo "   (Template and .example files are intentionally tracked)"
fi

echo ""

#####################################################################
# SUMMARY
#####################################################################

echo "═══════════════════════════════════════════════"
echo "Pre-Flight Check Summary"
echo "═══════════════════════════════════════════════"
echo ""

if [ "$ALL_CHECKS_PASSED" = true ] && [ "$FOUND_SENSITIVE" = false ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Your environment is ready for deployment."
    echo ""
    echo "Next steps:"
    echo "1. Set up environment variables on deployment platforms"
    echo "2. Configure custom domains"
    echo "3. Fund sponsor wallet"
    echo "4. Run: ./scripts/deploy-production.sh --all"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some checks failed${NC}"
    echo ""
    echo "Please address the issues above before deploying."
    echo ""
    echo "Common fixes:"
    echo "- Install missing CLI tools"
    echo "- Run 'npm install' to install dependencies"
    echo "- Fix build errors"
    echo "- Update .gitignore to exclude sensitive files"
    echo "- Remove sensitive files from Git if accidentally committed"
    echo ""
    exit 1
fi
