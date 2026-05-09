param()

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ProjectsRoot = Split-Path -Parent $ProjectRoot
$ImageWorkbenchRoot = Get-ChildItem -LiteralPath $ProjectsRoot -Directory |
  Where-Object {
    (Test-Path -LiteralPath (Join-Path $_.FullName "app.js")) -and
    (Test-Path -LiteralPath (Join-Path $_.FullName "desktop-build\ImageWorkbenchLauncher.cs"))
  } |
  Select-Object -First 1 -ExpandProperty FullName

if (-not $ImageWorkbenchRoot) {
  throw "Could not find image workbench root."
}

$DistRoot = Join-Path $ProjectRoot "dist\AgentWorkstation"
$ReleaseRoot = Join-Path $ProjectRoot "release"
$PackageRoot = Join-Path $ReleaseRoot "AgentWorkstation"
$WebViewPackage = Join-Path $ImageWorkbenchRoot "desktop-build\packages\Microsoft.Web.WebView2.1.0.3124.44"
$WebViewLib = Join-Path $WebViewPackage "lib\net462"
$WebViewRuntime = Join-Path $WebViewPackage "runtimes\win-x64\native"
$ImageDist = Join-Path $ImageWorkbenchRoot "dist\ImageWorkbench"
$NodeSource = Join-Path $ImageDist "runtime\node.exe"

$csc = Get-Command csc.exe -ErrorAction SilentlyContinue
if (-not $csc) {
  $csc = Get-ChildItem "C:\Windows\Microsoft.NET\Framework64" -Recurse -Filter csc.exe -ErrorAction SilentlyContinue |
    Sort-Object FullName -Descending |
    Select-Object -First 1
}
if (-not $csc) {
  throw "Could not find csc.exe. Install .NET Framework developer tools or Visual Studio Build Tools."
}

if (-not (Test-Path -LiteralPath $WebViewLib)) {
  throw "Missing WebView2 package: $WebViewLib"
}
if (-not (Test-Path -LiteralPath $NodeSource)) {
  throw "Missing bundled Node runtime: $NodeSource"
}

if (Test-Path -LiteralPath $DistRoot) {
  Remove-Item -LiteralPath $DistRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $DistRoot | Out-Null
New-Item -ItemType Directory -Path (Join-Path $DistRoot "runtime") | Out-Null
New-Item -ItemType Directory -Path $ReleaseRoot -Force | Out-Null

$exePath = Join-Path $DistRoot "AgentWorkstation.exe"
$webViewCoreRef = Join-Path $WebViewLib "Microsoft.Web.WebView2.Core.dll"
$webViewWinFormsRef = Join-Path $WebViewLib "Microsoft.Web.WebView2.WinForms.dll"
$launcherSource = Join-Path $PSScriptRoot "AgentWorkstationLauncher.cs"

& $csc.FullName `
  "/target:winexe" `
  "/platform:x64" `
  "/out:$exePath" `
  "/reference:$webViewCoreRef" `
  "/reference:$webViewWinFormsRef" `
  "/reference:System.Windows.Forms.dll" `
  "/reference:System.Drawing.dll" `
  "$launcherSource"

if ($LASTEXITCODE -ne 0) {
  throw "C# compilation failed with exit code $LASTEXITCODE."
}

Copy-Item -LiteralPath (Join-Path $ProjectRoot "index.html") -Destination $DistRoot -Force
Copy-Item -LiteralPath (Join-Path $ProjectRoot "styles.css") -Destination $DistRoot -Force
Copy-Item -LiteralPath (Join-Path $ProjectRoot "workstation.js") -Destination $DistRoot -Force
Copy-Item -LiteralPath (Join-Path $ProjectRoot "server.mjs") -Destination $DistRoot -Force
Copy-Item -LiteralPath (Join-Path $ProjectRoot "README.md") -Destination $DistRoot -Force
Copy-Item -LiteralPath $NodeSource -Destination (Join-Path $DistRoot "runtime\node.exe") -Force
Copy-Item -LiteralPath (Join-Path $WebViewLib "Microsoft.Web.WebView2.Core.dll") -Destination $DistRoot -Force
Copy-Item -LiteralPath (Join-Path $WebViewLib "Microsoft.Web.WebView2.WinForms.dll") -Destination $DistRoot -Force
Copy-Item -LiteralPath (Join-Path $WebViewRuntime "WebView2Loader.dll") -Destination $DistRoot -Force

@"
Agent Workstation

Double-click AgentWorkstation.exe to start.
The app starts a local Node service and opens the workstation in its own window.

Microsoft Edge WebView2 Runtime is required. Windows 11 usually includes it.
"@ | Set-Content -LiteralPath (Join-Path $DistRoot "Install.txt") -Encoding UTF8

if (Test-Path -LiteralPath $PackageRoot) {
  Remove-Item -LiteralPath $PackageRoot -Recurse -Force
}
Copy-Item -LiteralPath $DistRoot -Destination $PackageRoot -Recurse -Force

$zipPath = Join-Path $ReleaseRoot "AgentWorkstation-Setup.zip"
if (Test-Path -LiteralPath $zipPath) {
  $backup = $zipPath + ".bak-" + (Get-Date -Format "yyyyMMdd-HHmmss")
  Move-Item -LiteralPath $zipPath -Destination $backup -Force
}
Compress-Archive -Path (Join-Path $PackageRoot "*") -DestinationPath $zipPath -Force

Write-Host "Built: $DistRoot"
Write-Host "Packaged: $zipPath"
