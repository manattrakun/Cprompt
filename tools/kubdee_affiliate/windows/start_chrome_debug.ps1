param(
    [string]$ChromeExe = "",
    [int]$DebugPort = 9222,
    [string]$UserDataDir = "$env:LOCALAPPDATA\Google\Chrome\User Data"
)

$ErrorActionPreference = "Stop"

if (-not $ChromeExe) {
    $candidates = @(
        "$env:PROGRAMFILES\Google\Chrome\Application\chrome.exe",
        "${env:PROGRAMFILES(X86)}\Google\Chrome\Application\chrome.exe",
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
    )
    $ChromeExe = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}

if (-not $ChromeExe -or -not (Test-Path $ChromeExe)) {
    throw "Chrome executable not found. Install Google Chrome or pass -ChromeExe explicitly."
}

Start-Process -FilePath $ChromeExe -ArgumentList @(
    "--remote-debugging-port=$DebugPort",
    "--user-data-dir=$UserDataDir",
    "https://www.facebook.com/reels/create/"
)
Write-Host "Started Chrome with remote debugging port $DebugPort"
