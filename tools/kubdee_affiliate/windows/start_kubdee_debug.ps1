param(
    [string]$KubdeeExe = "",
    [int]$DebugPort = 19222
)

$ErrorActionPreference = "Stop"

if (-not $KubdeeExe) {
    $candidates = @(
        "$env:LOCALAPPDATA\Programs\Kubdee AI\Kubdee AI.exe",
        "$env:PROGRAMFILES\Kubdee AI\Kubdee AI.exe",
        "${env:PROGRAMFILES(X86)}\Kubdee AI\Kubdee AI.exe"
    )
    $KubdeeExe = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}

if (-not $KubdeeExe -or -not (Test-Path $KubdeeExe)) {
    throw "Kubdee AI executable not found. Install Kubdee AI Desktop or pass -KubdeeExe explicitly."
}

Start-Process -FilePath $KubdeeExe -ArgumentList "--remote-debugging-port=$DebugPort"
Write-Host "Started Kubdee AI with remote debugging port $DebugPort"
