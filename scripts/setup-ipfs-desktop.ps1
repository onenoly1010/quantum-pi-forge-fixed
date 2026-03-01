# IPFS Desktop Setup Helper for Windows
# This script helps configure IPFS Desktop for Quantum Pi Forge

Write-Host "🔧 IPFS Desktop Setup Helper" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if IPFS Desktop is running
Write-Host "Checking IPFS Desktop status..." -ForegroundColor Yellow
$ipfsProcess = Get-Process -Name "ipfs-desktop" -ErrorAction SilentlyContinue
if ($ipfsProcess) {
    Write-Host "✅ IPFS Desktop is running" -ForegroundColor Green
} else {
    Write-Host "❌ IPFS Desktop is not running" -ForegroundColor Red
    Write-Host "Please start IPFS Desktop first, then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 MANUAL CONFIGURATION REQUIRED:" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "1. Open IPFS Desktop application" -ForegroundColor White
Write-Host "2. Click the Settings gear icon (⚙️)" -ForegroundColor White
Write-Host "3. Go to 'Config' or 'Settings' tab" -ForegroundColor White
Write-Host ""
Write-Host "4. ENABLE API SERVER:" -ForegroundColor Yellow
Write-Host "   - Find 'API' section" -ForegroundColor White
Write-Host "   - Enable 'Enable API Server'" -ForegroundColor White
Write-Host "   - Set API address to: http://127.0.0.1:5001" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. ENABLE GATEWAY:" -ForegroundColor Yellow
Write-Host "   - Find 'Gateway' section" -ForegroundColor White
Write-Host "   - Enable 'Enable Gateway'" -ForegroundColor White
Write-Host "   - Set Gateway address to: http://127.0.0.1:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "6. CONFIGURE CORS (Advanced Settings):" -ForegroundColor Yellow
Write-Host "   - Go to Advanced Settings" -ForegroundColor White
Write-Host "   - Add CORS headers:" -ForegroundColor White
Write-Host "     Access-Control-Allow-Origin: *" -ForegroundColor Cyan
Write-Host "     Access-Control-Allow-Methods: GET, POST, PUT" -ForegroundColor Cyan
Write-Host "     Access-Control-Allow-Headers: Authorization, Content-Type" -ForegroundColor Cyan
Write-Host ""
Write-Host "7. RESTART IPFS Desktop after making changes" -ForegroundColor Red
Write-Host ""

# Test connection after user configures
Write-Host "🔄 After configuring IPFS Desktop:" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "Run the diagnostic script again:" -ForegroundColor White
Write-Host "  node scripts\diagnose-ipfs.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or test the deployment:" -ForegroundColor White
Write-Host "  npm run deploy:quantum" -ForegroundColor Cyan
Write-Host ""

# Alternative: Direct IPFS CLI setup (if available)
Write-Host "💡 ALTERNATIVE: Using IPFS CLI" -ForegroundColor Magenta
Write-Host "===============================" -ForegroundColor Magenta
Write-Host "If you prefer using IPFS CLI instead of Desktop:" -ForegroundColor White
Write-Host ""
Write-Host "1. Install IPFS CLI: choco install ipfs" -ForegroundColor White
Write-Host "2. Initialize: ipfs init" -ForegroundColor White
Write-Host "3. Start daemon: ipfs daemon" -ForegroundColor White
Write-Host "4. Configure CORS: ipfs config --json API.HTTPHeaders '{\"Access-Control-Allow-Origin\": [\"*\"], \"Access-Control-Allow-Methods\": [\"GET\", \"POST\", \"PUT\"], \"Access-Control-Allow-Headers\": [\"Authorization\", \"Content-Type\"]}'" -ForegroundColor White
Write-Host ""

Write-Host "📖 For more help, visit: https://docs.ipfs.tech/install/ipfs-desktop/" -ForegroundColor Blue
Write-Host ""
Write-Host "Press Enter to exit..." -ForegroundColor Gray
Read-Host

pm audit
npm update