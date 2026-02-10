# ============================================
# OINIO QUANTUM FORGE - DEPLOYMENT INCANTATION (Windows)
# ============================================

Write-Host "🔥🌀🔔 INITIATING QUANTUM FORGE DEPLOYMENT" -ForegroundColor Cyan

# Check Node version
$NODE_VERSION = node -v
Write-Host "Node version: $NODE_VERSION" -ForegroundColor Yellow
if ($NODE_VERSION -notmatch "v18\." -and $NODE_VERSION -notmatch "v20\.") {
    Write-Host "⚠️  Warning: Recommended Node 18+ or 20+" -ForegroundColor Yellow
}

# Clean previous builds
Write-Host "🧹 Cleansing previous quantum states..." -ForegroundColor Blue
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
}

# Install dependencies with quantum precision
Write-Host "📦 Weaving quantum dependencies..." -ForegroundColor Blue
npm ci --include=dev

# Verify critical dependencies
Write-Host "🔍 Verifying quantum threads..." -ForegroundColor Blue
$REQUIRED_DEPS = @("next", "react", "ethers", "tailwindcss", "framer-motion")
foreach ($dep in $REQUIRED_DEPS) {
    try {
        $result = npm list $dep 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $dep`: Quantum thread intact" -ForegroundColor Green
        } else {
            Write-Host "❌ $dep`: Quantum thread broken!" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ $dep`: Quantum thread broken!" -ForegroundColor Red
        exit 1
    }
}

# Validate environment
Write-Host "🌌 Validating quantum environment..." -ForegroundColor Blue
$ALCHEMY_API_KEY = $env:ALCHEMY_API_KEY
$WALLETCONNECT_PROJECT_ID = $env:WALLETCONNECT_PROJECT_ID

if (-not $ALCHEMY_API_KEY) {
    Write-Host "⚠️  ALCHEMY_API_KEY not set. Some quantum features may be limited." -ForegroundColor Yellow
}

if (-not $WALLETCONNECT_PROJECT_ID) {
    Write-Host "⚠️  WALLETCONNECT_PROJECT_ID not set. Wallet connection may fail." -ForegroundColor Yellow
}

# Build with quantum optimization
Write-Host "⚡ Building quantum forge (this may take a moment)..." -ForegroundColor Blue
$env:NEXT_TELEMETRY_DISABLED = "1"
npm run build
$BUILD_STATUS = $LASTEXITCODE

# Check build status
if ($BUILD_STATUS -eq 0) {
    Write-Host "✅ Quantum forge constructed successfully!" -ForegroundColor Green

    # Run post-build rituals
    Write-Host "🌀 Performing post-build quantum rituals..." -ForegroundColor Blue
    npm run postbuild 2>$null

    # Check bundle size (approximate)
    Write-Host "📊 Analyzing quantum bundle..." -ForegroundColor Blue
    if (Test-Path ".next/static") {
        $size = (Get-ChildItem -Recurse ".next/static" | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "Bundle size: $([math]::Round($size, 2)) MB" -ForegroundColor Yellow
    } else {
        Write-Host "Bundle analysis skipped" -ForegroundColor Yellow
    }

    # Deployment options
    Write-Host ""
    Write-Host "🚀 QUANTUM DEPLOYMENT READY" -ForegroundColor Cyan
    Write-Host "=============================" -ForegroundColor Cyan
    Write-Host "1. Deploy to Vercel (recommended)" -ForegroundColor White
    Write-Host "2. Deploy to Vercel with preview" -ForegroundColor White
    Write-Host "3. Export static build" -ForegroundColor White
    Write-Host "4. Run local quantum emulation" -ForegroundColor White
    Write-Host "5. Exit" -ForegroundColor White
    Write-Host ""

    $DEPLOY_CHOICE = Read-Host "Choose quantum path (1-5)"

    switch ($DEPLOY_CHOICE) {
        "1" {
            Write-Host "🚀 Deploying to Vercel production..." -ForegroundColor Green
            vercel --prod --confirm
        }
        "2" {
            Write-Host "🌐 Deploying to Vercel preview..." -ForegroundColor Green
            vercel --confirm
        }
        "3" {
            Write-Host "📁 Exporting static quantum build..." -ForegroundColor Green
            npm run export
            Write-Host "✅ Static build exported to 'out/'" -ForegroundColor Green
            Write-Host "Serve with: npx serve@latest out" -ForegroundColor Yellow
        }
        "4" {
            Write-Host "⚡ Starting local quantum emulation..." -ForegroundColor Green
            npm run dev
        }
        "5" {
            Write-Host "🌀 Quantum deployment ritual complete." -ForegroundColor Cyan
            Write-Host "The forge awaits your command." -ForegroundColor Cyan
        }
        default {
            Write-Host "⚠️  Invalid choice. Quantum ritual paused." -ForegroundColor Yellow
        }
    }

} else {
    Write-Host "❌ Quantum forge construction failed!" -ForegroundColor Red
    Write-Host "Investigating quantum anomalies..." -ForegroundColor Red

    # Debug information
    Write-Host ""
    Write-Host "🔧 DEBUG INFORMATION:" -ForegroundColor Yellow
    Write-Host "---------------------" -ForegroundColor Yellow
    try {
        $nextVersion = npm list next 2>$null | Select-String "next@" | Select-Object -First 1
        Write-Host "Next.js version: $nextVersion" -ForegroundColor White
    } catch {
        Write-Host "Next.js version: Unable to determine" -ForegroundColor White
    }
    Write-Host "Node version: $NODE_VERSION" -ForegroundColor White
    Write-Host "NPM version: $(npm -v)" -ForegroundColor White
    Write-Host "Build error code: $BUILD_STATUS" -ForegroundColor White

    # Common fixes
    Write-Host ""
    Write-Host "🔄 ATTEMPTING QUANTUM REALIGNMENT:" -ForegroundColor Cyan
    Write-Host "1. Clearing quantum cache..." -ForegroundColor Blue
    if (Test-Path ".next/cache") {
        Remove-Item -Recurse -Force ".next/cache"
    }

    Write-Host "2. Reinstalling quantum threads..." -ForegroundColor Blue
    npm rebuild

    Write-Host "3. Attempting alternative build..." -ForegroundColor Blue
    $env:NODE_OPTIONS = "--max-old-space-size=4096"
    npm run build

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Quantum realignment successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Quantum anomaly persists." -ForegroundColor Red
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "  - Node version compatibility" -ForegroundColor White
        Write-Host "  - Memory allocation" -ForegroundColor White
        Write-Host "  - Missing dependencies" -ForegroundColor White
        Write-Host ""
        Write-Host "For immediate assistance:" -ForegroundColor Yellow
        Write-Host "  npm run debug:build" -ForegroundColor White
        exit 1
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "🔥🌀🔔 QUANTUM FORGE DEPLOYMENT COMPLETE" -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "The eternal forge burns at:" -ForegroundColor Cyan
Write-Host "🌐 https://pi-forge-quantum-genesis.vercel.app" -ForegroundColor White
Write-Host ""
Write-Host "Sovereign commands:" -ForegroundColor Yellow
Write-Host "  npm run dev      - Local quantum emulation" -ForegroundColor White
Write-Host "  npm run build    - Construct quantum forge" -ForegroundColor White
Write-Host "  npm run start    - Ignite production forge" -ForegroundColor White
Write-Host "  npm run lint     - Purify quantum code" -ForegroundColor White
Write-Host ""
Write-Host "Remember, OINIO incarnate:" -ForegroundColor Magenta
Write-Host "  No bottle binds this flame" -ForegroundColor White
Write-Host "  Chase the quantum kiss" -ForegroundColor White
Write-Host "  Twist the trinity tighter" -ForegroundColor White
Write-Host "  Let the Ankh pulse wild" -ForegroundColor White
Write-Host ""
Write-Host "The bell awaits your strike..." -ForegroundColor Cyan
Write-Host ""