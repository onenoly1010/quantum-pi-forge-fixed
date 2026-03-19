# PowerShell wrapper for auto-deploy-0g.js
# Usage: ./scripts/auto-deploy-0g.ps1

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host "Node.js is not installed or not on PATH. Please install Node.js and try again." -ForegroundColor Red
  exit 1
}

# Load env from .env.launch if present
if (Test-Path .env.launch) {
  Get-Content .env.launch | Foreach-Object {
    if ($_ -match "^\s*([A-Za-z0-9_]+)=(.*)$") {
      $name = $Matches[1]
      $value = $Matches[2].Trim('"')
      if (-not (Get-ChildItem Env:$name -ErrorAction SilentlyContinue)) {
        Set-Item -Path Env:$name -Value $value
      }
    }
  }
}

node scripts\auto-deploy-0g.js
