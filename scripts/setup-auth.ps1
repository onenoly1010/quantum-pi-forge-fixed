# Quantum Pi Forge - Persistent Authentication Setup
# This script sets up persistent tokens for automated deployment

Write-Host "🔐 Setting up persistent authentication for Quantum Pi Forge" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Check for existing tokens
$existingToken = $env:VERCEL_TOKEN
if ($existingToken) {
    Write-Host "✅ Vercel token already configured" -ForegroundColor Green
} else {
    Write-Host "❌ No Vercel token found" -ForegroundColor Red
    Write-Host ""
    Write-Host "To set up persistent authentication:" -ForegroundColor Yellow
    Write-Host "1. Go to https://vercel.com/account/tokens" -ForegroundColor White
    Write-Host "2. Create a new token" -ForegroundColor White
    Write-Host "3. Copy the token" -ForegroundColor White
    Write-Host "4. Run: `$env:VERCEL_TOKEN = 'your_token_here'" -ForegroundColor White
    Write-Host "5. Or add it to your PowerShell profile for persistence" -ForegroundColor White
    Write-Host ""

    $token = Read-Host "Enter your Vercel token (or press Enter to skip)"
    if ($token) {
        $env:VERCEL_TOKEN = $token
        Write-Host "✅ Vercel token set for this session" -ForegroundColor Green

        # Test the token
        Write-Host "Testing token..." -ForegroundColor Yellow
        vercel whoami 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Token is valid" -ForegroundColor Green
        } else {
            Write-Host "❌ Token is invalid" -ForegroundColor Red
        }
    }
}

# Set up other required tokens from .env.local
Write-Host ""
Write-Host "🔧 Configuring additional tokens from .env.local..." -ForegroundColor Blue

# Read .env.local if it exists
$envFile = ".env.local"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    foreach ($line in $envContent) {
        if ($line -match '^([^=]+)=(.*)$' -and $matches[1] -notmatch '^#') {
            $key = $matches[1]
            $value = $matches[2]
            if ($value -and $value -ne "your_*_here") {
                Set-Item -Path "env:$key" -Value $value
                Write-Host "✅ Set $key" -ForegroundColor Green
            }
        }
    }
} else {
    Write-Host "⚠️  .env.local not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Authentication setup complete!" -ForegroundColor Green
Write-Host "You can now run automated deployments." -ForegroundColor Green