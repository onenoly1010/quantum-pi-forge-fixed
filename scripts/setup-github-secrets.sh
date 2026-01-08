#!/bin/bash
# 🚀 GitHub Secrets Setup Helper for Quantum Pi Forge
# This script helps you set up the required GitHub secrets for CI/CD automation

set -e

echo "🔐 GitHub Secrets Setup Helper"
echo "=============================="
echo ""
echo "This script will help you configure GitHub secrets for automated deployment."
echo "You'll need to run these commands in your terminal (not in this script)."
echo ""
echo "📋 Required Secrets:"
echo ""

# Check if .env.launch exists
if [ ! -f ".env.launch" ]; then
    echo "❌ .env.launch not found. Please create it first."
    exit 1
fi

# Extract values from .env.launch
DEPLOYER_ADDRESS=$(grep "^DEPLOYER_ADDRESS=" .env.launch | cut -d'=' -f2 | tr -d ' ')
DEPLOYER_PRIVATE_KEY=$(grep "^DEPLOYER_PRIVATE_KEY=" .env.launch | cut -d'=' -f2 | tr -d ' ')

echo "1. DEPLOYER_ADDRESS"
echo "   Value: $DEPLOYER_ADDRESS"
echo "   GitHub CLI Command:"
echo "   gh secret set DEPLOYER_ADDRESS --body \"$DEPLOYER_ADDRESS\""
echo ""

if [ -n "$DEPLOYER_PRIVATE_KEY" ]; then
    echo "2. DEPLOYER_PRIVATE_KEY (for automated deployment)"
    echo "   ⚠️  WARNING: Only set this if you want automated deployment!"
    echo "   Value: [HIDDEN - ${#DEPLOYER_PRIVATE_KEY} characters]"
    echo "   GitHub CLI Command:"
    echo "   gh secret set DEPLOYER_PRIVATE_KEY --body \"$DEPLOYER_PRIVATE_KEY\""
    echo ""
else
    echo "2. DEPLOYER_PRIVATE_KEY"
    echo "   Status: Not found in .env.launch"
    echo "   Note: Manual deployment only (no automated deployment)"
    echo ""
fi

echo "📝 Setup Instructions:"
echo "1. Install GitHub CLI: https://cli.github.com/"
echo "2. Authenticate: gh auth login"
echo "3. Navigate to your repo: cd quantum-pi-forge-fixed"
echo "4. Run the commands above to set secrets"
echo ""

echo "🔍 Verification:"
echo "After setup, you can verify secrets with:"
echo "gh secret list"
echo ""

echo "✅ Next Steps:"
echo "1. Set up GitHub secrets using the commands above"
echo "2. Push to main branch to trigger the deployment gate"
echo "3. Check GitHub Actions tab for automated verification"
echo ""

echo "🎯 What happens next:"
echo "- Every push to main will run automated checks"
echo "- Funding verification will run automatically"
echo "- Deployment gate will block if wallet is underfunded"
echo "- You'll get a detailed report in the Actions summary"