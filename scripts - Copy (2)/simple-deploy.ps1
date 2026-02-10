# Simple Quantum Pi Forge Deployment Script
# Windows-compatible automated deployment

Write-Host "QUANTUM FORGE DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Build the application
Write-Host "Building quantum forge..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green

    # Deploy to Vercel
    Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
    vercel --prod --yes

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Deployment successful!" -ForegroundColor Green
        Write-Host "https://pi-forge-quantum-genesis.vercel.app" -ForegroundColor White
    } else {
        Write-Host "Deployment failed" -ForegroundColor Red
    }
} else {
    Write-Host "Build failed" -ForegroundColor Red
}