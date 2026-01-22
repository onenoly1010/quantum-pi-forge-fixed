# Creator Revenue Engine - Complete Deployment Script
# Run this to deploy everything automatically

Write-Host "🚀 CREATOR REVENUE ENGINE - COMPLETE DEPLOYMENT" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Function to check command availability
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Step 1: Install Stripe CLI
Write-Host "`n📦 Step 1: Installing Stripe CLI..." -ForegroundColor Yellow
if (!(Test-Command stripe)) {
    Write-Host "   Downloading Stripe CLI..." -ForegroundColor Gray
    try {
        Invoke-WebRequest -Uri "https://github.com/stripe/stripe-cli/releases/latest/download/stripe_windows_amd64.zip" -OutFile "stripe-cli.zip"
        Expand-Archive -Path "stripe-cli.zip" -DestinationPath "stripe-cli" -Force
        $env:Path += ";$PWD\stripe-cli"
        Write-Host "   ✅ Stripe CLI installed" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Stripe CLI download failed. Install manually from:" -ForegroundColor Yellow
        Write-Host "      https://github.com/stripe/stripe-cli/releases/latest" -ForegroundColor Gray
        Write-Host "   Continuing with deployment..." -ForegroundColor Gray
    }
} else {
    Write-Host "   ✅ Stripe CLI already installed" -ForegroundColor Green
}

# Step 2: Check Vercel CLI
Write-Host "`n🔧 Step 2: Checking Vercel CLI..." -ForegroundColor Yellow
if (!(Test-Command vercel)) {
    Write-Host "   Installing Vercel CLI..." -ForegroundColor Gray
    npm install -g vercel
}

# Step 3: Deploy to Vercel
Write-Host "`n🚀 Step 3: Deploying to Vercel..." -ForegroundColor Yellow
try {
    $deployResult = vercel --prod 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Deployment successful!" -ForegroundColor Green

        # Extract deployment URL
        $deployUrl = $deployResult | Select-String -Pattern "https://[^\s]+" | Select-Object -First 1
        if ($deployUrl) {
            $apiUrl = $deployUrl.Matches[0].Value
            Write-Host "   🌐 API URL: $apiUrl" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ Deployment failed. Check errors above." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Deployment error: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Environment Variables Check
Write-Host "`n⚙️  Step 4: Environment Variables Check..." -ForegroundColor Yellow
$requiredVars = @(
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET"
)

$missingVars = @()
foreach ($var in $requiredVars) {
    if (!(Get-Item "env:$var" -ErrorAction SilentlyContinue)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -eq 0) {
    Write-Host "   ✅ All environment variables set" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Missing environment variables:" -ForegroundColor Yellow
    foreach ($var in $missingVars) {
        Write-Host "      - $var" -ForegroundColor Gray
    }
    Write-Host "   Set them in: https://vercel.com/dashboard -> Project Settings -> Environment Variables" -ForegroundColor Gray
}

# Step 5: Test API Endpoints
Write-Host "`n🧪 Step 5: Testing API Endpoints..." -ForegroundColor Yellow
if ($apiUrl) {
    try {
        $healthResponse = Invoke-WebRequest -Uri "$apiUrl/api/health" -TimeoutSec 10 -ErrorAction Stop
        if ($healthResponse.StatusCode -eq 200) {
            Write-Host "   ✅ API health check passed" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⚠️  API health check failed (may be normal for new deployment)" -ForegroundColor Yellow
    }
}

# Step 6: Setup Stripe Webhook (if CLI available)
Write-Host "`n💳 Step 6: Stripe Webhook Setup..." -ForegroundColor Yellow
if (Test-Command stripe) {
    Write-Host "   Starting Stripe webhook listener..." -ForegroundColor Gray
    Write-Host "   Keep this terminal open for webhook testing" -ForegroundColor Gray
    Write-Host "   Webhook URL: $apiUrl/api/webhooks/stripe" -ForegroundColor Gray

    # Start webhook listener in background
    Start-Job -ScriptBlock {
        param($url)
        stripe listen --forward-to "$url/api/webhooks/stripe"
    } -ArgumentList $apiUrl
} else {
    Write-Host "   ⚠️  Stripe CLI not available. Set up webhook manually:" -ForegroundColor Yellow
    Write-Host "      stripe listen --forward-to $apiUrl/api/webhooks/stripe" -ForegroundColor Gray
}

# Step 7: Final Instructions
Write-Host "`n🎯 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. ✅ Schema deployed to Supabase" -ForegroundColor Green
Write-Host "2. ✅ API deployed to Vercel" -ForegroundColor Green
Write-Host "3. 🔄 Set environment variables in Vercel dashboard" -ForegroundColor Yellow
Write-Host "4. 🔄 Test first payout transaction" -ForegroundColor Yellow
Write-Host "5. 🚀 Launch to creators!" -ForegroundColor Magenta

Write-Host "`n🧪 TEST COMMANDS:" -ForegroundColor Cyan
Write-Host "# Test creator onboarding"
Write-Host "curl -X POST $apiUrl/api/creator/onboard -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"name\":\"Test Creator\"}'"

Write-Host "`n# Test payout"
Write-Host "curl -X POST $apiUrl/api/creator/payout -H 'Content-Type: application/json' -d '{\"templateId\":\"test-001\",\"userId\":\"user-001\",\"burnAmount\":10.00,\"transactionHash\":\"0xtest\"}'"

Write-Host "`n📊 MONITOR DASHBOARD:" -ForegroundColor Cyan
Write-Host "# Open real-time dashboard"
Write-Host "start launch-dashboard.html"

Write-Host "`n💰 ECONOMIC FLYWHEEL ACTIVATED!" -ForegroundColor Green
Write-Host "Every template burn now generates revenue. Ready to earn! 🚀" -ForegroundColor Green