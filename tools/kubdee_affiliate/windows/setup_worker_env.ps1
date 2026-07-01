param(
    [string]$ProjectRoot = "C:\kubdee-affiliate",
    [string]$KubdeeDataDir = "$env:APPDATA\Kubdee AI\data",
    [string]$ProfileName = "Reel promote shopee"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
    throw "Project root not found: $ProjectRoot. Copy this repo folder there or pass -ProjectRoot."
}

if (-not (Test-Path $KubdeeDataDir)) {
    throw "Kubdee data dir not found: $KubdeeDataDir. Open Kubdee AI once, then retry or pass -KubdeeDataDir."
}

$kubdeeDb = Join-Path $KubdeeDataDir "kubdee.db"
if (-not (Test-Path $kubdeeDb)) {
    throw "Kubdee DB not found: $kubdeeDb. Open Kubdee AI once and confirm profile setup."
}

setx KUBDEE_DB_PATH $kubdeeDb | Out-Null
setx KUBDEE_DATA_DIR $KubdeeDataDir | Out-Null
setx KUBDEE_PROFILE_NAME $ProfileName | Out-Null

Write-Host "Set KUBDEE_DB_PATH=$kubdeeDb"
Write-Host "Set KUBDEE_DATA_DIR=$KubdeeDataDir"
Write-Host "Set KUBDEE_PROFILE_NAME=$ProfileName"
Write-Host "Restart PowerShell before running worker scripts."
