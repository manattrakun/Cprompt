param(
    [string]$ProjectRoot = "C:\kubdee-affiliate",
    [string]$Python = ""
)

$ErrorActionPreference = "Stop"

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$rootForOutput = if (Test-Path $ProjectRoot) { $ProjectRoot } else { (Get-Location).Path }
$outputDir = Join-Path $rootForOutput "outputs"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$reportPath = Join-Path $outputDir "first-run-diagnostics-$timestamp.json"
$summaryPath = Join-Path $outputDir "first-run-diagnostics-$timestamp.txt"

$steps = New-Object System.Collections.ArrayList

function Add-DiagnosticStep {
    param(
        [string]$Name,
        [string]$Status,
        [int]$ExitCode = 0,
        [string]$Message = "",
        [object]$Data = $null
    )

    [void]$script:steps.Add([ordered]@{
        name = $Name
        status = $Status
        exitCode = $ExitCode
        message = $Message
        data = $Data
    })
}

function Invoke-DiagnosticStep {
    param(
        [string]$Name,
        [scriptblock]$Action
    )

    Write-Host "First-run diagnostic: $Name"
    try {
        $data = & $Action
        $exitCode = if ($null -ne $data -and $null -ne $data.exitCode) { [int]$data.exitCode } else { 0 }
        $status = if ($exitCode -eq 0) { "passed" } else { "failed" }
        $message = if ($null -ne $data -and $data.message) { [string]$data.message } else { "" }
        Add-DiagnosticStep -Name $Name -Status $status -ExitCode $exitCode -Message $message -Data $data
    } catch {
        Add-DiagnosticStep -Name $Name -Status "failed" -ExitCode 1 -Message $_.Exception.Message
        Write-Warning "$Name failed: $($_.Exception.Message)"
    }
}

function Invoke-WorkerPowerShell {
    param(
        [string]$ScriptPath,
        [switch]$IncludePython,
        [string[]]$ExtraArgs = @()
    )

    if (-not (Test-Path $ScriptPath)) {
        return [ordered]@{
            exitCode = 1
            message = "Missing script: $ScriptPath"
        }
    }

    $arguments = @(
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $ScriptPath,
        "-ProjectRoot",
        $ProjectRoot
    )

    if ($IncludePython -and $Python) {
        $arguments += @("-Python", $Python)
    }

    $arguments += $ExtraArgs
    & powershell @arguments 2>&1 | ForEach-Object { Write-Host $_ }
    return [ordered]@{
        exitCode = $LASTEXITCODE
        command = "powershell $($arguments -join ' ')"
    }
}

$scriptDir = Join-Path $ProjectRoot "tools\kubdee_affiliate\windows"

Invoke-DiagnosticStep -Name "project_root" -Action {
    if (-not (Test-Path $ProjectRoot)) {
        return [ordered]@{
            exitCode = 1
            message = "Project root not found. Unzip the worker package to C:\kubdee-affiliate or pass -ProjectRoot."
            projectRoot = $ProjectRoot
        }
    }

    Set-Location $ProjectRoot
    [ordered]@{
        exitCode = 0
        projectRoot = $ProjectRoot
    }
}

Invoke-DiagnosticStep -Name "prerequisites" -Action {
    $script = Join-Path $scriptDir "check_windows_prerequisites.ps1"
    $prerequisiteReport = Join-Path $outputDir "first-run-prerequisites-$timestamp.json"
    $result = Invoke-WorkerPowerShell -ScriptPath $script -ExtraArgs @("-Output", $prerequisiteReport)
    if ($result.exitCode -ne 0 -or -not (Test-Path $prerequisiteReport)) {
        return $result
    }

    $prerequisites = Get-Content $prerequisiteReport -Raw | ConvertFrom-Json
    [ordered]@{
        exitCode = if ($prerequisites.ok) { 0 } else { 1 }
        message = if ($prerequisites.ok) { "" } else { "Prerequisites incomplete. Open $prerequisiteReport and follow action fields." }
        report = $prerequisiteReport
        ok = [bool]$prerequisites.ok
        readyForFacebookDraft = [bool]$prerequisites.readyForFacebookDraft
        command = $result.command
    }
}

Invoke-DiagnosticStep -Name "acceptance" -Action {
    $script = Join-Path $scriptDir "run_windows_acceptance.ps1"
    Invoke-WorkerPowerShell -ScriptPath $script -IncludePython
}

Invoke-DiagnosticStep -Name "status" -Action {
    $script = Join-Path $scriptDir "show_worker_status.ps1"
    Invoke-WorkerPowerShell -ScriptPath $script
}

Invoke-DiagnosticStep -Name "support_bundle" -Action {
    $script = Join-Path $scriptDir "collect_support_bundle.ps1"
    Invoke-WorkerPowerShell -ScriptPath $script -IncludePython
}

$failed = @($steps | Where-Object { $_.status -eq "failed" })
$ok = $failed.Count -eq 0
$nextStep = if ($ok) {
    "Open 13_show_worker_status.cmd, then continue with 04_daily_review.cmd in review-only mode."
} else {
    "Send this diagnostics text file and the latest outputs\support-bundle-*.zip for debugging."
}

$report = [ordered]@{
    createdAt = $timestamp
    projectRoot = $ProjectRoot
    ok = $ok
    summary = $summaryPath
    nextStep = $nextStep
    steps = $steps
}

$report | ConvertTo-Json -Depth 8 | Set-Content -Path $reportPath -Encoding UTF8

$summaryLines = @(
    "Kubdee Affiliate First-Run Diagnostics",
    "CreatedAt: $timestamp",
    "ProjectRoot: $ProjectRoot",
    "ReportJson: $reportPath",
    "Ok: $ok",
    "NextStep: $nextStep",
    "",
    "Steps:"
)

foreach ($step in $steps) {
    $line = "- $($step.name): $($step.status)"
    if ($step.exitCode -ne 0) {
        $line = "$line exitCode=$($step.exitCode)"
    }
    if ($step.message) {
        $line = "$line - $($step.message)"
    }
    $summaryLines += $line
}

$summaryLines | Set-Content -Path $summaryPath -Encoding UTF8

Write-Host "First-run diagnostics report: $reportPath"
Write-Host "First-run diagnostics summary: $summaryPath"
if (-not $ok) {
    Write-Warning "First-run diagnostics found $($failed.Count) failed step(s)."
}
