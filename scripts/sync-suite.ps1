param(
  [string]$Message = "",
  [string]$Version = "",
  [switch]$Tag,
  [switch]$NoPush,
  [int]$ProxyPort = 7897
)

$ErrorActionPreference = "Stop"

$SuiteRoot = Split-Path -Parent $PSScriptRoot
$ProjectsRoot = Split-Path -Parent $SuiteRoot

$AgentSource = Get-ChildItem -LiteralPath $ProjectsRoot -Directory |
  Where-Object {
    $_.FullName -ne $SuiteRoot -and
    (Test-Path -LiteralPath (Join-Path $_.FullName "workstation.js")) -and
    (Test-Path -LiteralPath (Join-Path $_.FullName "server.mjs"))
  } |
  Select-Object -First 1 -ExpandProperty FullName

$ImageSource = Get-ChildItem -LiteralPath $ProjectsRoot -Directory |
  Where-Object {
    $_.FullName -ne $SuiteRoot -and
    (Test-Path -LiteralPath (Join-Path $_.FullName "app.js")) -and
    (Test-Path -LiteralPath (Join-Path $_.FullName "desktop-build\ImageWorkbenchLauncher.cs"))
  } |
  Select-Object -First 1 -ExpandProperty FullName

if (-not $AgentSource) {
  throw "Could not find the live agent workstation source directory."
}
if (-not $ImageSource) {
  throw "Could not find the live image workbench source directory."
}

$AgentFiles = @(
  ".gitignore",
  "README.md",
  "index.html",
  "server.mjs",
  "styles.css",
  "workstation.js",
  "desktop-build\AgentWorkstationLauncher.cs",
  "desktop-build\build-agent-workstation.ps1"
)

$ImageFiles = @(
  ".gitignore",
  "README.md",
  "index.html",
  "styles.css",
  "app.js",
  "server.mjs",
  "verify-workbench.mjs",
  "desktop-build\ImageWorkbenchLauncher.cs"
)

function Copy-ProjectFiles {
  param(
    [string]$SourceRoot,
    [string]$TargetRoot,
    [string[]]$Files
  )

  foreach ($file in $Files) {
    $source = Join-Path $SourceRoot $file
    $target = Join-Path $TargetRoot $file
    if (-not (Test-Path -LiteralPath $source)) {
      Write-Warning "Missing source file: $source"
      continue
    }
    $targetDir = Split-Path -Parent $target
    if (-not (Test-Path -LiteralPath $targetDir)) {
      New-Item -ItemType Directory -Path $targetDir | Out-Null
    }
    Copy-Item -LiteralPath $source -Destination $target -Force
  }
}

Copy-ProjectFiles -SourceRoot $AgentSource -TargetRoot (Join-Path $SuiteRoot "agent-workstation") -Files $AgentFiles
Copy-ProjectFiles -SourceRoot $ImageSource -TargetRoot (Join-Path $SuiteRoot "image-workbench") -Files $ImageFiles

Push-Location $SuiteRoot
try {
  $changes = git status --porcelain
  if (-not $changes) {
    Write-Host "No source changes to sync."
    exit 0
  }

  git add --all

  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  if (-not $Message) {
    $Message = "Sync workstation snapshot $stamp"
  }

  git commit -m $Message

  if ($Tag) {
    if (-not $Version) {
      $Version = "v" + (Get-Date -Format "yyyy.MM.dd-HHmm")
    }
    git tag -a $Version -m "Version $Version"
  }

  if (-not $NoPush) {
    $proxy = "http://127.0.0.1:$ProxyPort"
    git -c http.proxy=$proxy -c https.proxy=$proxy push origin main
    if ($Tag) {
      git -c http.proxy=$proxy -c https.proxy=$proxy push origin $Version
    }
  }
}
finally {
  Pop-Location
}
