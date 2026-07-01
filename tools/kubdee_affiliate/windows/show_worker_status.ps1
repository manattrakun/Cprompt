param(
    [string]$ProjectRoot = "C:\kubdee-affiliate"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
    throw "Project root not found: $ProjectRoot. Unzip the worker package there or pass -ProjectRoot."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputDir = Join-Path $ProjectRoot "outputs"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$summaryPath = Join-Path $outputDir "worker-status-$timestamp.json"

function Get-LatestReport {
    param([string]$Pattern)

    $path = Join-Path $ProjectRoot $Pattern
    Get-ChildItem -Path $path -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
}

function Read-LatestJsonReport {
    param(
        [string]$Name,
        [string]$Pattern
    )

    $file = Get-LatestReport -Pattern $Pattern
    if (-not $file) {
        return [ordered]@{
            name = $Name
            exists = $false
            path = ""
            ok = $null
            data = $null
        }
    }

    try {
        $data = Get-Content $file.FullName -Raw | ConvertFrom-Json
        $ok = if ($null -ne $data.ok) { [bool]$data.ok } else { $null }
        return [ordered]@{
            name = $Name
            exists = $true
            path = $file.FullName
            ok = $ok
            data = $data
        }
    } catch {
        return [ordered]@{
            name = $Name
            exists = $true
            path = $file.FullName
            ok = $false
            error = $_.Exception.Message
            data = $null
        }
    }
}

$reports = @(
    (Read-LatestJsonReport -Name "prerequisites" -Pattern "outputs\prerequisites-*.json"),
    (Read-LatestJsonReport -Name "firstRunDiagnostics" -Pattern "outputs\first-run-diagnostics-*.json"),
    (Read-LatestJsonReport -Name "doctor" -Pattern "outputs\doctor-*.json"),
    (Read-LatestJsonReport -Name "acceptance" -Pattern "outputs\windows-acceptance-*.json"),
    (Read-LatestJsonReport -Name "configuredWorkflow" -Pattern "outputs\configured-workflow-*.json")
)

$summary = [ordered]@{
    createdAt = $timestamp
    projectRoot = $ProjectRoot
    reports = $reports
}

$summary | ConvertTo-Json -Depth 10 | Set-Content -Path $summaryPath -Encoding UTF8

Write-Host "Kubdee Affiliate Worker Status"
Write-Host "ProjectRoot: $ProjectRoot"
Write-Host "Summary report: $summaryPath"
Write-Host ""

foreach ($report in $reports) {
    if (-not $report.exists) {
        Write-Host "$($report.name): missing"
        continue
    }

    $status = if ($null -eq $report.ok) { "unknown" } elseif ($report.ok) { "ok" } else { "not-ready" }
    Write-Host "$($report.name): $status"
    Write-Host "  $($report.path)"

    if ($report.name -eq "acceptance" -and $report.data) {
        Write-Host "  basicOk=$($report.data.basicOk) readyForReviewWorkflow=$($report.data.readyForReviewWorkflow) readyForKubdeePipelineApply=$($report.data.readyForKubdeePipelineApply) readyForFacebookDraft=$($report.data.readyForFacebookDraft)"
        if ($report.data.summary) {
            Write-Host "  summary=$($report.data.summary)"
        }

        $failedCheckpoints = @($report.data.results | Where-Object { $_.status -eq "failed" })
        if ($failedCheckpoints.Count -gt 0) {
            Write-Host "  failedCheckpoints:"
            foreach ($checkpoint in $failedCheckpoints | Select-Object -First 5) {
                $message = if ($checkpoint.message) { " - $($checkpoint.message)" } else { "" }
                Write-Host "    - $($checkpoint.name)$message"
            }
        }
    }

    if ($report.name -eq "firstRunDiagnostics" -and $report.data) {
        Write-Host "  nextStep=$($report.data.nextStep)"
        if ($report.data.summary) {
            Write-Host "  summary=$($report.data.summary)"
        }

        $failedSteps = @($report.data.steps | Where-Object { $_.status -eq "failed" })
        if ($failedSteps.Count -gt 0) {
            Write-Host "  failedSteps:"
            foreach ($step in $failedSteps | Select-Object -First 5) {
                $message = if ($step.message) { " - $($step.message)" } else { "" }
                Write-Host "    - $($step.name)$message"
            }
        }
    }

    if ($report.name -eq "configuredWorkflow" -and $report.data) {
        Write-Host "  jobCount=$($report.data.jobCount) failedCount=$($report.data.failedCount)"
    }
}
