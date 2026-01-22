Param(
  [int]$Port = 3000,
  [string]$HealthPath = '/api/health',
  [int]$MaxWaitSeconds = 120
)

$logDir = '.logs'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$logFile = Join-Path $logDir 'startup.log'
# Ensure the log file exists so Resolve-Path succeeds when passing it to the background job
if (-not (Test-Path $logFile)) { New-Item -ItemType File -Path $logFile | Out-Null }

Write-Output "Starting dev server (logs -> $logFile)"
# Start npm dev server and redirect stdout/stderr to the log file (works across PowerShell sessions)
$proc = Start-Process -FilePath 'npm' -ArgumentList @('run','dev','--','--port',$Port) -RedirectStandardOutput $logFile -RedirectStandardError $logFile -NoNewWindow -PassThru

$startTime = Get-Date
Write-Output "Waiting for server to respond at http://localhost:$Port$HealthPath"
$deadline = $startTime.AddSeconds($MaxWaitSeconds)
$ok = $false
while ((Get-Date) -lt $deadline) {
  try {
    $resp = Invoke-WebRequest -UseBasicParsing -TimeoutSec 5 -Uri "http://localhost:$Port$HealthPath" -ErrorAction Stop
    if ($resp.StatusCode -eq 200 -or $resp.StatusCode -eq 302) { $ok = $true; break }
  } catch {
    # ignore
  }
  Start-Sleep -Seconds 1
}

if (-not $ok) {
  Write-Output "Timeout waiting for server after $MaxWaitSeconds seconds"
  if (Test-Path $logFile) { Get-Content $logFile -Tail 200 }
  try { $proc.Kill() } catch {}
  exit 1
}

$readyTime = Get-Date
$startupMs = ($readyTime - $startTime).TotalMilliseconds
$thresholdMs = [int]($env:STARTUP_THRESHOLD_MS -as [int])
if (-not $thresholdMs) { $thresholdMs = 30000 }
Write-Output "Server ready after $([int]$startupMs)ms"
if ($startupMs -gt $thresholdMs) {
  Write-Output "ERROR: Startup time $([int]$startupMs)ms exceeded threshold ${thresholdMs}ms"
  if (Test-Path $logFile) { Get-Content $logFile -Tail 200 }
  try { $proc.Kill() } catch {}
  exit 2
}
if (Test-Path $logFile) { Write-Output "--- Log tail (last 50 lines) ---"; Get-Content $logFile -Tail 50 }
# Wait on process
$proc.WaitForExit()
