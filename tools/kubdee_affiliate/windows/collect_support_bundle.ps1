param(
    [string]$ProjectRoot = "C:\kubdee-affiliate",
    [string]$Python = "",
    [switch]$IncludePayloads
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $PSCommandPath
. (Join-Path $ScriptDir "kubdee_worker_common.ps1")
$ResolvedPython = Resolve-KubdeePython -Python $Python

Set-Location $ProjectRoot

$Arguments = @(
    "tools\kubdee_affiliate\collect_support_bundle.py",
    "--project-root",
    $ProjectRoot
)

if ($IncludePayloads) {
    $Arguments += "--include-payloads"
}

& $ResolvedPython @Arguments
if ($LASTEXITCODE -ne 0) {
    throw "Support bundle collection failed with exit code $LASTEXITCODE"
}
