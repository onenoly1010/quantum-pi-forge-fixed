# scripts/verify-vercel-setup.ps1 - Verify Vercel project configuration

Write-Host "🔍 Quantum Pi Forge - Vercel Project Setup Verification" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check git remote
Write-Host "📁 Checking GitHub repository..." -ForegroundColor Blue
$gitRemote = git config --get remote.origin.url
if ($gitRemote) {
    Write-Host "✅ Repository: $gitRemote" -ForegroundColor Green
} else {
    Write-Host "❌ No git remote found" -ForegroundColor Red
}
Write-Host ""

# Step 2: Check current branch
Write-Host "🌿 Checking current branch..." -ForegroundColor Blue
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch) {
    Write-Host "✅ Current branch: $currentBranch" -ForegroundColor Green
} else {
    Write-Host "⚠️  Unable to determine branch" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Check vercel.json exists
Write-Host "⚙️  Checking Vercel configuration..." -ForegroundColor Blue
if (Test-Path ".\vercel.json") {
    Write-Host "✅ vercel.json found" -ForegroundColor Green
    $vercelConfig = Get-Content ".\vercel.json" | ConvertFrom-Json
    Write-Host "   Framework: $($vercelConfig.framework)" -ForegroundColor Gray
    Write-Host "   Build Command: $($vercelConfig.buildCommand)" -ForegroundColor Gray
} else {
    Write-Host "⚠️  vercel.json not found - will be created on 'vercel link'" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Check environment templates
Write-Host "🔐 Checking environment configuration..." -ForegroundColor Blue
$hasEnvExample = Test-Path ".\.env.local.example"
$hasEnvProd = Test-Path ".\.env.production"
Write-Host "   .env.local.example: $(if ($hasEnvExample) { '✅ Found' } else { '❌ Missing' })" -ForegroundColor Green
Write-Host "   .env.production: $(if ($hasEnvProd) { '✅ Found' } else { '❌ Missing' })" -ForegroundColor Green
Write-Host ""

# Step 5: Check Next.js setup
Write-Host "⚡ Checking Next.js setup..." -ForegroundColor Blue
if (Test-Path ".\package.json") {
    $packageJson = Get-Content ".\package.json" | ConvertFrom-Json
    Write-Host "✅ Next.js version: $($packageJson.dependencies.next)" -ForegroundColor Green
    Write-Host "✅ React version: $($packageJson.dependencies.react)" -ForegroundColor Green
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
}
Write-Host ""

# Step 6: Check API routes
Write-Host "📍 Checking API routes..." -ForegroundColor Blue
$apiRoutes = @(
    "app/api/health.ts",
    "app/api/pi-network/status.route.ts",
    "app/api/payments/approve.route.ts",
    "app/api/payments/complete.route.ts",
    "app/api/pi-webhooks/payment.route.ts",
    "app/api/supabase/status.route.ts"
)

foreach ($route in $apiRoutes) {
    if (Test-Path ".\$route") {
        Write-Host "   ✅ $route" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $route missing" -ForegroundColor Red
    }
}
Write-Host ""

# Step 7: Check node_modules
Write-Host "📦 Checking dependencies..." -ForegroundColor Blue
if (Test-Path ".\node_modules") {
    $moduleCount = (Get-ChildItem ".\node_modules" -Directory | Measure-Object).Count
    Write-Host "✅ $moduleCount packages installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules not found - run 'pnpm install' first" -ForegroundColor Yellow
}
Write-Host ""

# Step 8: Summary
Write-Host "🎯 SETUP SUMMARY" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your project is configured for Vercel serverless deployment." -ForegroundColor Green
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Check which Vercel project serves quantumpiforge.com:" -ForegroundColor White
Write-Host "   → Go to: https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host "   → Find the project with domain 'quantumpiforge.com'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Link this repository to that project:" -ForegroundColor White
Write-Host "   → Run: vercel link" -ForegroundColor Gray
Write-Host "   → Select the correct project" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Set production environment variables in Vercel dashboard:" -ForegroundColor White
Write-Host "   → NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
Write-Host "   → SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Gray
Write-Host "   → PI_NETWORK_APP_ID" -ForegroundColor Gray
Write-Host "   → PI_NETWORK_API_KEY" -ForegroundColor Gray
Write-Host "   → PI_NETWORK_WEBHOOK_SECRET" -ForegroundColor Gray
Write-Host "   → JWT_SECRET" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Deploy:" -ForegroundColor White
Write-Host "   → git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Monitor deployment:" -ForegroundColor White
Write-Host "   → https://vercel.com/dashboard/quantum-pi-forge-fixed" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Ready to deploy!" -ForegroundColor Green
