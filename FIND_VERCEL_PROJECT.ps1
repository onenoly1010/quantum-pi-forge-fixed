#!/usr/bin/env pwsh
# Find which Vercel project serves quantumpiforge.com

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     IDENTIFYING YOUR VERCEL PROJECT                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 We need to identify which of your 6 Vercel projects serves:" -ForegroundColor Blue
Write-Host "   quantumpiforge.com" -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 YOUR LIKELY VERCEL PROJECTS:" -ForegroundColor Green
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Green
Write-Host "  1. pi-forge-quantum-genesis          (main repository)" -ForegroundColor White
Write-Host "  2. quantum-pi-forge-fixed            (fixed version)" -ForegroundColor White
Write-Host "  3. quantum-resonance-clean           (clean fork)" -ForegroundColor White
Write-Host "  4. pi-forge-quantum-genesis-OPEN    (open source)" -ForegroundColor White
Write-Host "  5. quantum-pi-forge-ignited          (ignited version)" -ForegroundColor White
Write-Host "  6. Ai-forge-                         (AI builder)" -ForegroundColor White
Write-Host ""

Write-Host "🌐 HOW TO IDENTIFY (Step-by-step):" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Go to: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2️⃣  Look at the list of projects on the left" -ForegroundColor White
Write-Host "3️⃣  For EACH project:" -ForegroundColor White
Write-Host "   • Click on the project name" -ForegroundColor Gray
Write-Host "   • Look in the DOMAINS section" -ForegroundColor Gray
Write-Host "   • Check if 'quantumpiforge.com' is listed" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣  When you find it, note:" -ForegroundColor White
Write-Host "   • Project Name: _________________________" -ForegroundColor Yellow
Write-Host "   • Domain: quantumpiforge.com ✅" -ForegroundColor Yellow
Write-Host "   • Repository: usually shown in Settings → Git" -ForegroundColor Yellow
Write-Host ""

Write-Host "💡 ALTERNATIVE: Check via Browser" -ForegroundColor Blue
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Blue
Write-Host ""
Write-Host "Open in your browser:" -ForegroundColor White
Write-Host "  https://quantumpiforge.com/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Look at the page header/footer for project info." -ForegroundColor Gray
Write-Host ""

Write-Host "⏱️  EXPECTED RESULT:" -ForegroundColor Magenta
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Magenta
Write-Host ""
Write-Host "You should find something like:" -ForegroundColor White
Write-Host ""
Write-Host "  Project Name: pi-forge-quantum-genesis" -ForegroundColor Green
Write-Host "  Domain: quantumpiforge.com" -ForegroundColor Green
Write-Host "  Repository: onenoly1010/pi-forge-quantum-genesis" -ForegroundColor Green
Write-Host "  Status: Production Ready" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Yellow
Write-Host ""
Write-Host "Once you identify the project, tell me:" -ForegroundColor White
Write-Host ""
Write-Host "  Q1: What is the PROJECT NAME?" -ForegroundColor Cyan
Write-Host "  A1: _________________________________" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Q2: What is the GITHUB REPOSITORY?" -ForegroundColor Cyan
Write-Host "  A2: onenoly1010/________________" -ForegroundColor Yellow
Write-Host ""
Write-Host "Then I'll help you deploy! 🚀" -ForegroundColor Green
Write-Host ""
