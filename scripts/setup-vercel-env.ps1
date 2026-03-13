# Quantum Pi Forge - Vercel Environment Setup (PowerShell)
# Automates setting environment variables on Vercel

Write-Host "Quantum Pi Forge - Vercel Environment Setup"
Write-Host "=================================================="
Write-Host ""

# Check if vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Vercel CLI not found. Installing..."
    npm install -g vercel
}

# Login to Vercel
Write-Host "Logging in to Vercel..."
vercel login

# Link to project
Write-Host "Linking to Vercel project..."
vercel link --yes

Write-Host ""
Write-Host "Setting up production environment variables..."
Write-Host "You will be prompted to enter each secret value..."
Write-Host ""

# Function to add environment variable
function Add-VercelEnv {
    param(
        [string]$Key,
        [string]$Description,
        [string]$DefaultValue = ""
    )
    
    Write-Host "---------------------------------------------"
    Write-Host "Setting: $Key"
    Write-Host "Description: $Description"
    
    if ($DefaultValue) {
        Write-Host "Default: $DefaultValue"
    }
    
    Write-Host ""
    
    # Check if already exists
    $existing = vercel env ls production 2>&1 | Select-String $Key
    if ($existing) {
        Write-Host "$Key already exists. Skipping..."
        Write-Host ""
    } else {
        if ($DefaultValue) {
            # Use default value
            $DefaultValue | vercel env add $Key production
        } else {
            # Prompt user
            vercel env add $Key production
        }
        Write-Host "$Key added"
        Write-Host ""
    }
}

# Required secrets
Write-Host "1. Blockchain & Smart Contract Variables"
Add-VercelEnv -Key "SPONSOR_PRIVATE_KEY" -Description "Private key for gasless transaction sponsor wallet"
Add-VercelEnv -Key "DEPLOYER_PRIVATE_KEY" -Description "Deployer wallet private key for smart contracts"
Add-VercelEnv -Key "POLYGON_RPC_URL" -Description "Polygon RPC URL" -DefaultValue "https://polygon-rpc.com"
Add-VercelEnv -Key "OINIO_TOKEN_ADDRESS" -Description "OINIO Token Contract Address" -DefaultValue "0x07f43E5B1A8a0928B364E40d5885f81A543B05C7"

Write-Host ""
Write-Host "2. AI Service Variables"
Add-VercelEnv -Key "DEEPSEEK_API_KEY" -Description "DeepSeek AI API Key"
Add-VercelEnv -Key "OPENAI_API_KEY" -Description "OpenAI API Key"
Add-VercelEnv -Key "XAI_API_KEY" -Description "X.AI (Grok) API Key (optional)"

Write-Host ""
Write-Host "3. Database & Auth Variables"
Add-VercelEnv -Key "SUPABASE_URL" -Description "Supabase Project URL"
Add-VercelEnv -Key "SUPABASE_SERVICE_ROLE_KEY" -Description "Supabase Service Role Key"
Add-VercelEnv -Key "SUPABASE_ANON_KEY" -Description "Supabase Anonymous Key"

Write-Host ""
Write-Host "4. Authentication Variables"

# Generate NEXTAUTH_SECRET if not exists
$nextauthSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
Write-Host "Info: Generated NEXTAUTH_SECRET: $nextauthSecret"
Write-Host ""

Add-VercelEnv -Key "NEXTAUTH_SECRET" -Description "NextAuth.js secret (auto-generated)" -DefaultValue $nextauthSecret
Add-VercelEnv -Key "NEXTAUTH_URL" -Description "NextAuth.js canonical URL" -DefaultValue "https://quantumpiforget.com"

Write-Host ""
Write-Host "5. Optional: Pi Network Variables"
$piResponse = Read-Host "Do you use Pi Network integration? (y/n)"
if ($piResponse -eq 'y') {
    Add-VercelEnv -Key "PI_API_KEY" -Description "Pi Network API Key"
    Add-VercelEnv -Key "PI_NETWORK_API_KEY" -Description "Pi Network API Key (alternative)"
    Add-VercelEnv -Key "PI_NETWORK_APP_ID" -Description "Pi Network App ID"
}

Write-Host ""
Write-Host "6. Optional: GitHub OAuth Variables"
$githubResponse = Read-Host "Do you use GitHub OAuth? (y/n)"
if ($githubResponse -eq 'y') {
    Add-VercelEnv -Key "GITHUB_CLIENT_ID" -Description "GitHub OAuth Client ID"
    Add-VercelEnv -Key "GITHUB_CLIENT_SECRET" -Description "GitHub OAuth Client Secret"
}

Write-Host ""
Write-Host "---------------------------------------------"
Write-Host "Environment setup complete!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Verify variables: vercel env ls production"
Write-Host "2. Deploy to preview: vercel"
Write-Host "3. Test preview deployment"
Write-Host "4. Deploy to production: vercel --prod"
Write-Host ""
Write-Host "Info: To pull secrets for local development:"
Write-Host "   vercel env pull .env.local"
Write-Host ""