param(
    [string]$ProjectRoot = "C:\kubdee-affiliate",
    [string]$TaskName = "KubdeeAffiliateConfiguredWorkflow",
    [string]$ConfigPath = "config\worker.config.json",
    [string]$Python = "",
    [string]$DailyAt = "09:00",
    [switch]$Replace,
    [switch]$RunWhenLoggedOnOnly,
    [switch]$RunWhetherUserIsLoggedOff
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
    throw "Project root not found: $ProjectRoot. Unzip the worker package there or pass -ProjectRoot."
}

$runner = Join-Path $ProjectRoot "tools\kubdee_affiliate\windows\run_configured_workflow.ps1"
if (-not (Test-Path $runner)) {
    throw "Configured workflow runner not found: $runner"
}

$resolvedConfigPath = if ([System.IO.Path]::IsPathRooted($ConfigPath)) {
    $ConfigPath
} else {
    Join-Path $ProjectRoot $ConfigPath
}
if (-not (Test-Path $resolvedConfigPath)) {
    throw "Config not found: $resolvedConfigPath. Copy config\worker.config.example.json to config\worker.config.json and edit jobs."
}

$common = Join-Path $ProjectRoot "tools\kubdee_affiliate\windows\kubdee_worker_common.ps1"
if (-not (Test-Path $common)) {
    throw "Common helper not found: $common"
}
. $common
$ResolvedPython = Resolve-KubdeePython -Python $Python

if ($RunWhenLoggedOnOnly -and $RunWhetherUserIsLoggedOff) {
    throw "Choose only one logon mode: -RunWhenLoggedOnOnly or -RunWhetherUserIsLoggedOff."
}

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing -and -not $Replace) {
    throw "Scheduled task '$TaskName' already exists. Pass -Replace to overwrite."
}
if ($existing -and $Replace) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

$arguments = @(
    "-ExecutionPolicy", "Bypass",
    "-File", "`"$runner`"",
    "-ProjectRoot", "`"$ProjectRoot`"",
    "-ConfigPath", "`"$resolvedConfigPath`"",
    "-Python", "`"$ResolvedPython`""
)

$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument ($arguments -join " ") `
    -WorkingDirectory $ProjectRoot

$trigger = New-ScheduledTaskTrigger -Daily -At ([DateTime]::Parse($DailyAt))
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew

$useInteractiveLogon = $RunWhenLoggedOnOnly -or -not $RunWhetherUserIsLoggedOff
$principal = if ($useInteractiveLogon) {
    New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel LeastPrivilege
} else {
    New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType S4U -RunLevel LeastPrivilege
}

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Kubdee affiliate configured workflow from $resolvedConfigPath" | Out-Null

Write-Host "Installed scheduled task: $TaskName"
Write-Host "ConfigPath: $resolvedConfigPath"
Write-Host "DailyAt: $DailyAt"
Write-Host "ProjectRoot: $ProjectRoot"
Write-Host "LogonType: $($principal.LogonType)"
Write-Host "Run manually: Start-ScheduledTask -TaskName `"$TaskName`""
