param(
    [string]$ProjectRoot = "C:\kubdee-affiliate",
    [string]$Python = "",
    [string]$QueuePath = "",
    [string]$QueuePattern = "outputs\facebook-reels-queue-*.json",
    [string]$Mode = "dry-run",
    [int]$Limit = 1,
    [string]$CdpUrl = "http://127.0.0.1:9222",
    [switch]$UseActiveTab,
    [int]$ClickNext = 0,
    [string]$ConfirmPublish = ""
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $PSCommandPath
. (Join-Path $ScriptDir "kubdee_worker_common.ps1")
$ResolvedPython = Resolve-KubdeePython -Python $Python

Set-Location $ProjectRoot

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputDir = Join-Path $ProjectRoot "outputs"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

if ($QueuePath) {
    $queue = Get-Item $QueuePath
} else {
    $queue = Get-ChildItem $QueuePattern |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
}

if (-not $queue) {
    throw "No Facebook queue file found. Pass -QueuePath or check -QueuePattern."
}

$report = Join-Path $outputDir "facebook-reels-draft-$timestamp.json"
$argsList = @(
    "tools\kubdee_affiliate\facebook_reels_draft.py",
    "--queue", $queue.FullName,
    "--output-report", $report,
    "--mode", $Mode,
    "--limit", "$Limit",
    "--cdp-url", $CdpUrl,
    "--click-next", "$ClickNext"
)

if ($UseActiveTab) {
    $argsList += "--use-active-tab"
}

if ($ConfirmPublish) {
    $argsList += @("--confirm-publish", $ConfirmPublish)
}

& $ResolvedPython @argsList
if ($LASTEXITCODE -ne 0) {
    throw "Facebook Reels draft command failed with exit code $LASTEXITCODE"
}

Write-Host "Facebook draft report: $report"
