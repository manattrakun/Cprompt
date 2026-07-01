param(
    [string]$ProjectRoot = "C:\kubdee-affiliate",
    [string]$TaskName = "KubdeeAffiliateDailyReview",
    [string]$Python = "",
    [ValidateSet("Review", "Commit", "Pipeline", "Queue", "FacebookDryRun", "FacebookDraft", "All")]
    [string]$Stage = "Review",
    [string]$Theme = "rainy",
    [string]$Campaign = "rainy-$(Get-Date -Format 'yyyy-MM')",
    [string]$ProfileName = $env:KUBDEE_PROFILE_NAME,
    [string]$PageName = "",
    [int]$Limit = 20,
    [int]$JitterMinutes = 15,
    [string]$DailyAt = "09:00",
    [switch]$Replace,
    [switch]$RunWhenLoggedOnOnly
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
    throw "Project root not found: $ProjectRoot. Unzip the worker package there or pass -ProjectRoot."
}

$workflow = Join-Path $ProjectRoot "tools\kubdee_affiliate\windows\run_affiliate_workflow.ps1"
if (-not (Test-Path $workflow)) {
    throw "Workflow script not found: $workflow"
}

$common = Join-Path $ProjectRoot "tools\kubdee_affiliate\windows\kubdee_worker_common.ps1"
if (-not (Test-Path $common)) {
    throw "Common helper not found: $common"
}
. $common
$ResolvedPython = Resolve-KubdeePython -Python $Python

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing -and -not $Replace) {
    throw "Scheduled task '$TaskName' already exists. Pass -Replace to overwrite."
}
if ($existing -and $Replace) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

$arguments = @(
    "-ExecutionPolicy", "Bypass",
    "-File", "`"$workflow`"",
    "-ProjectRoot", "`"$ProjectRoot`"",
    "-Python", "`"$ResolvedPython`"",
    "-Stage", "`"$Stage`"",
    "-Theme", "`"$Theme`"",
    "-Campaign", "`"$Campaign`"",
    "-Limit", "$Limit",
    "-JitterMinutes", "$JitterMinutes"
)

if ($ProfileName) {
    $arguments += @("-ProfileName", "`"$ProfileName`"")
}
if ($PageName) {
    $arguments += @("-PageName", "`"$PageName`"")
}

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

$principal = if ($RunWhenLoggedOnOnly) {
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
    -Description "Kubdee affiliate workflow ($Stage) from $ProjectRoot" | Out-Null

Write-Host "Installed scheduled task: $TaskName"
Write-Host "Stage: $Stage"
Write-Host "DailyAt: $DailyAt"
Write-Host "ProjectRoot: $ProjectRoot"
Write-Host "Run manually: Start-ScheduledTask -TaskName `"$TaskName`""
