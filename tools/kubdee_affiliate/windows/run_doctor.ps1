param(
    [string]$ProjectRoot = "C:\kubdee-affiliate",
    [string]$Python = "",
    [switch]$Strict
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $PSCommandPath
. (Join-Path $ScriptDir "kubdee_worker_common.ps1")
$ResolvedPython = Resolve-KubdeePython -Python $Python

Set-Location $ProjectRoot

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputDir = Join-Path $ProjectRoot "outputs"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$report = Join-Path $outputDir "doctor-$timestamp.json"

$argsList = @(
    "tools\kubdee_affiliate\kubdee_affiliate_doctor.py",
    "--project-root", $ProjectRoot,
    "--output", $report
)

if ($Strict) {
    $argsList += "--strict"
}

& $ResolvedPython @argsList
if ($LASTEXITCODE -ne 0) {
    throw "Doctor failed with exit code $LASTEXITCODE. Report: $report"
}

Write-Host "Doctor report: $report"
