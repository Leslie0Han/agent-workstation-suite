param(
  [int]$IntervalSeconds = 60,
  [int]$ProxyPort = 7897,
  [switch]$TagEachSnapshot
)

$ErrorActionPreference = "Stop"
$syncScript = Join-Path $PSScriptRoot "sync-suite.ps1"

Write-Host "Watching workstation sources. Press Ctrl+C to stop."
Write-Host "Interval: $IntervalSeconds seconds"

while ($true) {
  try {
    if ($TagEachSnapshot) {
      & $syncScript -ProxyPort $ProxyPort -Tag
    }
    else {
      & $syncScript -ProxyPort $ProxyPort
    }
  }
  catch {
    Write-Warning $_.Exception.Message
  }

  Start-Sleep -Seconds $IntervalSeconds
}
