Param(
  [int]$Port = 3000,
  [string]$HealthPath = '/api/health',
  [int]$MaxWaitSeconds = 120
)

$logDir = '.logs'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$logFile = Join-Path $logDir 'startup.log'

Write-Output "Starting dev server (logs -> $logFile)"
$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = 'cmd.exe'
$startInfo.Arguments = '/c npm run dev -- --port ' + $Port
$startInfo.RedirectStandardOutput = $true
$startInfo.RedirectStandardError = $true
$startInfo.UseShellExecute = $false
$startInfo.CreateNoWindow = $true

$proc = New-Object System.Diagnostics.Process
$proc.StartInfo = $startInfo
$proc.Start() | Out-Null

# Async read to file
$stdOut = $proc.StandardOutput
$stdErr = $proc.StandardError
Start-Job -ScriptBlock {
  param($out, $err, $file)
  while (-not $out.EndOfStream -or -not $err.EndOfStream) {
    if (-not $out.EndOfStream) { $line = $out.ReadLine(); Add-Content -Path $file -Value $line }
    if (-not $err.EndOfStream) { $line = $err.ReadLine(); Add-Content -Path $file -Value $line }
    Start-Sleep -Milliseconds 100
  }
} -ArgumentList $stdOut, $stdErr, (Resolve-Path $logFile)

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
Write-Output "Server ready after $([int]$startupMs)ms"
if (Test-Path $logFile) { Write-Output "--- Log tail (last 50 lines) ---"; Get-Content $logFile -Tail 50 }
# Wait on process
$proc.WaitForExit()
