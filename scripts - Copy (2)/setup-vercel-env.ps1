# Quantum Pi Forge - Vercel Environment Setup (PowerShell)
# Automates setting environment variables on Vercel

Write-Host "🔐 Quantum Pi Forge - Vercel Environment Setup" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host ""

# Check if vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Login to Vercel
Write-Host "📝 Logging in to Vercel..." -ForegroundColor Yellow
vercel login

# Link to project
Write-Host "🔗 Linking to Vercel project..." -ForegroundColor Yellow
vercel link --yes

Write-Host ""
Write-Host "🔐 Setting up production environment variables..." -ForegroundColor Cyan
Write-Host "⚠️  You will be prompted to enter each secret value." -ForegroundColor Yellow
Write-Host ""

# Function to add environment variable
function Add-VercelEnv {
    param(
        [string]$Key,
        [string]$Description,
        [string]$DefaultValue = ""
    )
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "Setting: $Key" -ForegroundColor White
    Write-Host "Description: $Description" -ForegroundColor Gray
    
    if ($DefaultValue) {
        Write-Host "Default: $DefaultValue" -ForegroundColor DarkGray
    }
    
    Write-Host ""
    
    # Check if already exists
    $existing = vercel env ls production 2>&1 | Select-String $Key
    if ($existing) {
        Write-Host "⚠️  $Key already exists. Skipping..." -ForegroundColor Yellow
        Write-Host ""
    } else {
        if ($DefaultValue) {
            # Use default value
            $DefaultValue | vercel env add $Key production
        } else {
            # Prompt user
            vercel env add $Key production
        }
        Write-Host "✅ $Key added" -ForegroundColor Green
        Write-Host ""
    }
}

# Required secrets
Write-Host "1️⃣  Blockchain & Smart Contract Variables" -ForegroundColor Magenta
Add-VercelEnv -Key "SPONSOR_PRIVATE_KEY" -Description "Private key for gasless transaction sponsor wallet"
Add-VercelEnv -Key "DEPLOYER_PRIVATE_KEY" -Description "Deployer wallet private key for smart contracts"
Add-VercelEnv -Key "POLYGON_RPC_URL" -Description "Polygon RPC URL" -DefaultValue "https://polygon-rpc.com"
Add-VercelEnv -Key "OINIO_TOKEN_ADDRESS" -Description "OINIO Token Contract Address" -DefaultValue "0x07f43E5B1A8a0928B364E40d5885f81A543B05C7"

Write-Host ""
Write-Host "2️⃣  AI Service Variables" -ForegroundColor Magenta
Add-VercelEnv -Key "DEEPSEEK_API_KEY" -Description "DeepSeek AI API Key"
Add-VercelEnv -Key "OPENAI_API_KEY" -Description "OpenAI API Key"
Add-VercelEnv -Key "XAI_API_KEY" -Description "X.AI (Grok) API Key (optional)"

Write-Host ""
Write-Host "3️⃣  Database & Auth Variables" -ForegroundColor Magenta
Add-VercelEnv -Key "SUPABASE_URL" -Description "Supabase Project URL"
Add-VercelEnv -Key "SUPABASE_SERVICE_ROLE_KEY" -Description "Supabase Service Role Key"
Add-VercelEnv -Key "SUPABASE_ANON_KEY" -Description "Supabase Anonymous Key"

Write-Host ""
Write-Host "4️⃣  Authentication Variables" -ForegroundColor Magenta

# Generate NEXTAUTH_SECRET if not exists
$nextauthSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
Write-Host "💡 Generated NEXTAUTH_SECRET: $nextauthSecret" -ForegroundColor Cyan
Write-Host ""

Add-VercelEnv -Key "NEXTAUTH_SECRET" -Description "NextAuth.js secret (auto-generated)" -DefaultValue $nextauthSecret
Add-VercelEnv -Key "NEXTAUTH_URL" -Description "NextAuth.js canonical URL" -DefaultValue "https://quantumpiforget.com"

Write-Host ""
Write-Host "5️⃣  Optional: Pi Network Variables" -ForegroundColor Magenta
$piResponse = Read-Host "Do you use Pi Network integration? (y/n)"
if ($piResponse -eq 'y') {
    Add-VercelEnv -Key "PI_API_KEY" -Description "Pi Network API Key"
    Add-VercelEnv -Key "PI_NETWORK_API_KEY" -Description "Pi Network API Key (alternative)"
    Add-VercelEnv -Key "PI_NETWORK_APP_ID" -Description "Pi Network App ID"
}

Write-Host ""
Write-Host "6️⃣  Optional: GitHub OAuth Variables" -ForegroundColor Magenta
$githubResponse = Read-Host "Do you use GitHub OAuth? (y/n)"
if ($githubResponse -eq 'y') {
    Add-VercelEnv -Key "GITHUB_CLIENT_ID" -Description "GitHub OAuth Client ID"
    Add-VercelEnv -Key "GITHUB_CLIENT_SECRET" -Description "GitHub OAuth Client Secret"
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ Environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify variables: vercel env ls production"
Write-Host "2. Deploy to preview: vercel"
Write-Host "3. Test preview deployment"
Write-Host "4. Deploy to production: vercel --prod"
Write-Host ""
Write-Host "💡 To pull secrets for local development:" -ForegroundColor Yellow
Write-Host "   vercel env pull .env.local"
Write-Host ""
