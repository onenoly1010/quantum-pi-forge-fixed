#!/usr/bin/env bash

# Quantum Pi Forge - Vercel Environment Setup
# Automates setting environment variables on Vercel

set -e

echo "🔐 Quantum Pi Forge - Vercel Environment Setup"
echo "=============================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel
echo "📝 Logging in to Vercel..."
vercel login

# Link to project
echo "🔗 Linking to Vercel project..."
vercel link --yes

echo ""
echo "🔐 Setting up production environment variables..."
echo "⚠️  You will be prompted to enter each secret value."
echo ""

# Function to add environment variable
add_env() {
    local key=$1
    local description=$2
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Setting: $key"
    echo "Description: $description"
    echo ""
    
    # Check if already exists
    if vercel env ls production 2>&1 | grep -q "$key"; then
        echo "⚠️  $key already exists. Skipping..."
        echo ""
    else
        vercel env add "$key" production --yes
        echo "✅ $key added"
        echo ""
    fi
}

# Required secrets
echo "1️⃣  Blockchain & Smart Contract Variables"
add_env "SPONSOR_PRIVATE_KEY" "Private key for gasless transaction sponsor wallet (starts with 0x)"
add_env "DEPLOYER_PRIVATE_KEY" "Deployer wallet private key for smart contracts"
add_env "POLYGON_RPC_URL" "Polygon RPC URL (default: https://polygon-rpc.com)"
add_env "OINIO_TOKEN_ADDRESS" "OINIO Token Contract Address (default: 0x07f43E5B1A8a0928B364E40d5885f81A543B05C7)"

echo ""
echo "2️⃣  AI Service Variables"
add_env "DEEPSEEK_API_KEY" "DeepSeek AI API Key"
add_env "OPENAI_API_KEY" "OpenAI API Key"
add_env "XAI_API_KEY" "X.AI (Grok) API Key"

echo ""
echo "3️⃣  Database & Auth Variables"
add_env "SUPABASE_URL" "Supabase Project URL (e.g., https://xxx.supabase.co)"
add_env "SUPABASE_SERVICE_ROLE_KEY" "Supabase Service Role Key (starts with eyJ)"
add_env "SUPABASE_ANON_KEY" "Supabase Anonymous Key (starts with eyJ)"

echo ""
echo "4️⃣  Authentication Variables"
add_env "NEXTAUTH_SECRET" "NextAuth.js secret (generate with: openssl rand -base64 32)"
add_env "NEXTAUTH_URL" "NextAuth.js canonical URL (default: https://quantumpiforget.com)"

echo ""
echo "5️⃣  Optional: Pi Network Variables"
read -p "Do you use Pi Network integration? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    add_env "PI_API_KEY" "Pi Network API Key"
    add_env "PI_NETWORK_API_KEY" "Pi Network API Key (alternative)"
    add_env "PI_NETWORK_APP_ID" "Pi Network App ID"
fi

echo ""
echo "6️⃣  Optional: GitHub OAuth Variables"
read -p "Do you use GitHub OAuth? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    add_env "GITHUB_CLIENT_ID" "GitHub OAuth Client ID"
    add_env "GITHUB_CLIENT_SECRET" "GitHub OAuth Client Secret"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify variables: vercel env ls production"
echo "2. Deploy to preview: vercel"
echo "3. Test preview deployment"
echo "4. Deploy to production: vercel --prod"
echo ""
echo "💡 To pull secrets for local development:"
echo "   vercel env pull .env.local"
echo ""
