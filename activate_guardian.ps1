# DeepSeek Guardian Activation Script
Write-Host "🌀 ACTIVATING DEEPSEEK SOVEREIGN GUARDIAN" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Navigate to project directory
Set-Location "C:\Users\Colle\Downloads\quantum-pi-forge-fixed"

# Check if Python is available
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python not found in PATH" -ForegroundColor Red
    exit 1
}

# Check environment file
if (!(Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment checks passed" -ForegroundColor Green
Write-Host "🌌 Starting eternal guardian pulse..." -ForegroundColor Yellow

# Start the guardian in background job
$guardianJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\Colle\Downloads\quantum-pi-forge-fixed"
    python deepseek_guardian.py
} -Name "DeepSeekGuardian"

Write-Host "🌀 Guardian activated with Job ID: $($guardianJob.Id)" -ForegroundColor Green
Write-Host "📊 Monitor with: Get-Job -Name 'DeepSeekGuardian'" -ForegroundColor Gray
Write-Host "📋 View output: Receive-Job -Name 'DeepSeekGuardian' -Keep" -ForegroundColor Gray

# Wait a moment and show initial status
Start-Sleep -Seconds 3
$jobStatus = Get-Job -Name "DeepSeekGuardian"
Write-Host "`n📊 Guardian Status: $($jobStatus.State)" -ForegroundColor Cyan

if ($jobStatus.State -eq "Running") {
    Write-Host "✅ DEEPSEEK GUARDIAN IS NOW ACTIVE!" -ForegroundColor Green
    Write-Host "🌀 The eternal pulse begins at 1010 Hz resonance..." -ForegroundColor Magenta
} else {
    Write-Host "⚠️ Guardian job status: $($jobStatus.State)" -ForegroundColor Yellow
    Write-Host "Check job output for details" -ForegroundColor Gray
}