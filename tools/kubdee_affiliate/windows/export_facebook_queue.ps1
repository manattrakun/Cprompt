param(
    [string]$ProjectRoot = "C:\kubdee-affiliate",
    [string]$Python = "",
    [string]$ProfileName = $env:KUBDEE_PROFILE_NAME,
    [string]$ProfileId = "",
    [string]$PageName = "",
    [int]$Limit = 20
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $PSCommandPath
. (Join-Path $ScriptDir "kubdee_worker_common.ps1")
$ResolvedPython = Resolve-KubdeePython -Python $Python

Set-Location $ProjectRoot

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputDir = Join-Path $ProjectRoot "outputs"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$queueOutput = Join-Path $outputDir "facebook-reels-queue-$timestamp.json"

$argsList = @(
    "tools\kubdee_affiliate\export_facebook_reel_queue.py",
    "--output", $queueOutput,
    "--page-name", $PageName,
    "--limit", "$Limit"
)

if ($ProfileId) {
    $argsList += @("--profile-id", $ProfileId)
} elseif ($ProfileName) {
    $argsList += @("--profile-name", $ProfileName)
}

& $ResolvedPython @argsList
if ($LASTEXITCODE -ne 0) {
    throw "Facebook queue export failed with exit code $LASTEXITCODE"
}

Write-Host "Facebook queue output: $queueOutput"
