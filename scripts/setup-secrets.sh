#!/bin/bash

# Quantum Pi Forge - Production Secrets Setup Script
# This script generates commands to set up all required secrets for production deployment

set -e

echo "🔮 Quantum Pi Forge - Production Secrets Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_step "Checking dependencies..."

    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed. Please install it first."
        exit 1
    fi

    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI is not installed. Some commands may not work."
    fi

    print_success "Dependencies check passed"
}

# Generate Vercel secrets setup commands
generate_vercel_commands() {
    print_step "Generating Vercel secrets setup commands..."

    cat << 'EOF'
# Vercel Secrets Setup Commands
# Run these commands in your terminal after replacing placeholder values

# Authentication & Security
vercel env add NEXTAUTH_SECRET production
vercel env add JWT_SECRET production
vercel env add ENCRYPTION_KEY production

# GitHub OAuth
vercel env add GITHUB_CLIENT_ID production
vercel env add GITHUB_CLIENT_SECRET production
vercel env add GITHUB_WEBHOOK_SECRET production

# AI Services
vercel env add OPENAI_API_KEY production
vercel env add ANTHROPIC_API_KEY production
vercel env add XAI_API_KEY production

# Supabase Database
vercel env add SUPABASE_URL production
vercel env add SUPABASE_KEY production
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Pi Network
vercel env add PI_NETWORK_API_KEY production
vercel env add PI_NETWORK_APP_ID production
vercel env add PI_NETWORK_WEBHOOK_SECRET production
vercel env add PI_NETWORK_WALLET_PRIVATE_KEY production
vercel env add PI_NETWORK_API_ENDPOINT production
vercel env add PI_NETWORK_MODE production
vercel env add PI_SANDBOX_MODE production

# Blockchain
vercel env add POLYGON_RPC_URL production
vercel env add ZERO_G_RPC_URL production
vercel env add SPONSOR_PRIVATE_KEY production
vercel env add OINIO_TOKEN_ADDRESS production
vercel env add NEXT_PUBLIC_CHAIN_ID production

# External Services
vercel env add IPFS_API_KEY production
vercel env add ARWEAVE_KEY production
vercel env add THE_GRAPH_API_KEY production
vercel env add CHAINLINK_ACCESS_KEY production
vercel env add AI_GATEWAY_API_KEY production
vercel env add AI_GATEWAY_URL production

# Monitoring & Observability
vercel env add APPLICATION_INSIGHTS_CONNECTION_STRING production
vercel env add OTEL_SERVICE_NAME production
vercel env add OTEL_TRACES_EXPORTER production
vercel env add OTEL_EXPORTER_OTLP_ENDPOINT production
vercel env add OTEL_EXPORTER_OTLP_HEADERS production

# URLs
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_BACKEND_URL production

# Vercel Project Configuration
vercel env add VERCEL_TOKEN production
vercel env add VERCEL_ORG_ID production
vercel env add VERCEL_PROJECT_ID production

EOF

    print_success "Vercel commands generated above"
}

# Generate GitHub secrets setup commands
generate_github_commands() {
    print_step "Generating GitHub secrets setup commands..."

    cat << 'EOF'
# GitHub Secrets Setup Commands
# Run these commands in your terminal (requires GitHub CLI authentication)

# Vercel Deployment
gh secret set VERCEL_TOKEN --body "your_vercel_token_here"
gh secret set VERCEL_ORG_ID --body "your_vercel_org_id_here"
gh secret set VERCEL_PROJECT_ID --body "your_vercel_project_id_here"

# Supabase
gh secret set SUPABASE_ACCESS_TOKEN --body "your_supabase_access_token_here"
gh secret set SUPABASE_PROJECT_REF --body "your_supabase_project_ref_here"

# Render Deployment
gh secret set RENDER_API_KEY --body "your_render_api_key_here"
gh secret set RENDER_SERVICE_ID --body "your_render_service_id_here"

# API Keys (GitHub CLI will prompt for values)
gh secret set GITHUB_CLIENT_SECRET
gh secret set OPENAI_API_KEY
gh secret set ANTHROPIC_API_KEY
gh secret set XAI_API_KEY
gh secret set PI_NETWORK_API_KEY
gh secret set PI_NETWORK_APP_ID
gh secret set PI_NETWORK_WEBHOOK_SECRET
gh secret set PI_NETWORK_WALLET_PRIVATE_KEY
gh secret set IPFS_API_KEY
gh secret set ARWEAVE_KEY
gh secret set THE_GRAPH_API_KEY
gh secret set CHAINLINK_ACCESS_KEY
gh secret set AI_GATEWAY_API_KEY

EOF

    print_success "GitHub commands generated above"
}

# Generate Render secrets setup commands
generate_render_commands() {
    print_step "Generating Render secrets setup commands..."

    cat << 'EOF'
# Render Secrets Setup Commands
# Set these in your Render dashboard under Environment

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres:password@db:5432/quantum_pi_forge

# AI Services
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
XAI_API_KEY=your_xai_api_key

# Pi Network
PI_NETWORK_API_KEY=your_pi_network_api_key
PI_NETWORK_APP_ID=your_pi_network_app_id
PI_NETWORK_WEBHOOK_SECRET=your_pi_webhook_secret
PI_NETWORK_WALLET_PRIVATE_KEY=your_pi_wallet_private_key
PI_NETWORK_API_ENDPOINT=https://api.minepi.com
PI_NETWORK_MODE=mainnet
PI_SANDBOX_MODE=false

# Blockchain
POLYGON_RPC_URL=https://polygon-rpc.com
ZERO_G_RPC_URL=https://rpc.0g.ai
SPONSOR_PRIVATE_KEY=your_sponsor_wallet_private_key
OINIO_TOKEN_ADDRESS=0x07f43E5B1A8a0928B364E40d5885f81A543B05C7

# External Services
IPFS_API_KEY=your_ipfs_api_key
ARWEAVE_KEY=your_arweave_key
THE_GRAPH_API_KEY=your_the_graph_api_key
CHAINLINK_ACCESS_KEY=your_chainlink_access_key
AI_GATEWAY_API_KEY=your_ai_gateway_api_key
AI_GATEWAY_URL=https://api.ai-gateway.com

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_char_encryption_key

# Monitoring
APPLICATION_INSIGHTS_CONNECTION_STRING=your_app_insights_connection_string
OTEL_SERVICE_NAME=quantum-pi-forge-backend
OTEL_TRACES_EXPORTER=otlp
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-endpoint.com
OTEL_EXPORTER_OTLP_HEADERS=your_otel_headers

EOF

    print_success "Render environment variables template generated above"
}

# Generate Supabase setup commands
generate_supabase_commands() {
    print_step "Generating Supabase setup commands..."

    cat << 'EOF'
# Supabase Setup Commands
# Run these commands to set up your Supabase project

# 1. Create a new Supabase project or use existing one
# 2. Get your project URL and anon key from Settings > API
# 3. Get your service role key from Settings > API
# 4. Run the database migration:
supabase db push

# 5. Set up authentication (optional - configure in Supabase dashboard)
# - Enable email authentication
# - Configure OAuth providers (GitHub, etc.)

# 6. Set up storage buckets if needed
# supabase storage create avatars
# supabase storage create documents

EOF

    print_success "Supabase setup commands generated above"
}

# Generate local development setup
generate_local_setup() {
    print_step "Generating local development setup..."

    cat << 'EOF'
# Local Development Setup (.env.local)
# Copy this to your .env.local file and fill in the values

# Authentication & Security
NEXTAUTH_SECRET=quantum_pi_forge_sovereign_soul_secret_2026_144
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_char_encryption_key

# GitHub OAuth (for development)
GITHUB_CLIENT_ID=Ov23liT4fA85V6b4QZW9
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret

# AI Services
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
XAI_API_KEY=your_xai_api_key

# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres:password@localhost:5432/quantum_pi_forge
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Pi Network
PI_NETWORK_API_KEY=your_pi_network_api_key
PI_NETWORK_APP_ID=your_pi_network_app_id
PI_NETWORK_WEBHOOK_SECRET=your_pi_webhook_secret
PI_NETWORK_WALLET_PRIVATE_KEY=your_pi_wallet_private_key
PI_NETWORK_API_ENDPOINT=https://api.minepi.com
PI_NETWORK_MODE=sandbox
PI_SANDBOX_MODE=true

# Blockchain
POLYGON_RPC_URL=https://polygon-rpc.com
ZERO_G_RPC_URL=https://rpc.0g.ai
SPONSOR_PRIVATE_KEY=your_sponsor_wallet_private_key
OINIO_TOKEN_ADDRESS=0x07f43E5B1A8a0928B364E40d5885f81A543B05C7
NEXT_PUBLIC_CHAIN_ID=137

# External Services
IPFS_API_KEY=your_ipfs_api_key
ARWEAVE_KEY=your_arweave_key
THE_GRAPH_API_KEY=your_the_graph_api_key
CHAINLINK_ACCESS_KEY=your_chainlink_access_key
AI_GATEWAY_API_KEY=your_ai_gateway_api_key
AI_GATEWAY_URL=https://api.ai-gateway.com

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Monitoring (optional for development)
APPLICATION_INSIGHTS_CONNECTION_STRING=
OTEL_SERVICE_NAME=quantum-pi-forge-dev
OTEL_TRACES_EXPORTER=console
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_EXPORTER_OTLP_HEADERS=

EOF

    print_success "Local development environment template generated above"
}

# Main execution
main() {
    echo "🔮 Quantum Pi Forge - Production Secrets Setup"
    echo "=============================================="
    echo ""
    echo "This script generates setup commands for all required secrets."
    echo "You'll need to obtain actual API keys from the respective services."
    echo ""

    check_dependencies

    echo ""
    echo "📋 SETUP CHECKLIST:"
    echo "==================="
    echo "1. Create accounts and obtain API keys from:"
    echo "   - Vercel (deployment)"
    echo "   - Supabase (database)"
    echo "   - Render (backend hosting)"
    echo "   - OpenAI (AI services)"
    echo "   - Anthropic (AI services)"
    echo "   - xAI (AI services)"
    echo "   - Pi Network (blockchain)"
    echo "   - GitHub (OAuth)"
    echo "   - IPFS/Arweave (storage)"
    echo "   - The Graph (blockchain data)"
    echo "   - Chainlink (oracles)"
    echo ""

    generate_vercel_commands
    echo ""
    generate_github_commands
    echo ""
    generate_render_commands
    echo ""
    generate_supabase_commands
    echo ""
    generate_local_setup

    echo ""
    print_success "Setup commands generated successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Obtain all required API keys and tokens"
    echo "2. Run the setup commands for each platform"
    echo "3. Test deployments"
    echo "4. Verify all integrations work correctly"
}

# Run main function
main "$@"