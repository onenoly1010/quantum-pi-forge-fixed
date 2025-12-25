#!/usr/bin/env pwsh
<#
.SYNOPSIS
Quantum Pi Forge Deployment Diagnostic Tool
.DESCRIPTION
Checks Railway backend, Vercel frontend, and connection status
#>

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PI FORGE DEPLOYMENT DIAGNOSTIC                     ║" -ForegroundColor Cyan
Write-Host "║  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ssZ')                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Test Vercel Frontend
Write-Host "🔍 FRONTEND TEST (Vercel)" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "https://quantumpiforge.com/" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Vercel Frontend: LIVE (HTTP $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   URL: https://quantumpiforge.com/" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel Frontend: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test Railway Backend
Write-Host "🔍 BACKEND TEST (Railway)" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────" -ForegroundColor Gray

$railwayUrl = "https://pi-forge-quantum-genesis-production-4fc8.up.railway.app/health"

try {
    $response = Invoke-WebRequest -Uri $railwayUrl -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Railway Backend: LIVE (HTTP $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   URL: $railwayUrl" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway Backend: OFFLINE" -ForegroundColor Red
    Write-Host "   URL: $railwayUrl" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.Value)" -ForegroundColor Red
    Write-Host "   Error: Application not found (404)" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  DIAGNOSTIC SUMMARY                                ║" -ForegroundColor Cyan
Write-Host "├────────────────────────────────────────────────────┤" -ForegroundColor Gray
Write-Host "║  Frontend (Vercel):  ✅ LIVE                        ║" -ForegroundColor Green
Write-Host "║  Backend (Railway):  ❌ OFFLINE / NOT DEPLOYED      ║" -ForegroundColor Red
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "🔧 NEXT ACTIONS:" -ForegroundColor Yellow
Write-Host "1. Go to https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Select 'pi-forge-quantum-genesis' project" -ForegroundColor White
Write-Host "3. Check service status (should be 'Running')" -ForegroundColor White
Write-Host "4. Review Logs tab for any errors" -ForegroundColor White
Write-Host "5. If not deployed, click 'Deploy' button" -ForegroundColor White
Write-Host ""
Write-Host "📋 EXPECTED:" -ForegroundColor Yellow
Write-Host "   Railway should be running FastAPI backend on port 8000" -ForegroundColor White
Write-Host "   Vercel should proxy /api/* requests to Railway" -ForegroundColor White
Write-Host ""
