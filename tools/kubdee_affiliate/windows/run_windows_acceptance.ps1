param(
    [string]$ProjectRoot = "C:\kubdee-affiliate",
    [string]$Python = "",
    [string]$Theme = "rainy",
    [string]$Campaign = "acceptance-$(Get-Date -Format 'yyyy-MM')",
    [string]$ProfileName = $env:KUBDEE_PROFILE_NAME,
    [int]$Limit = 5,
    [switch]$RunKubdeeReview,
    [switch]$Strict
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
    throw "Project root not found: $ProjectRoot. Unzip the worker package there or pass -ProjectRoot."
}

Set-Location $ProjectRoot

$ScriptDir = Join-Path $ProjectRoot "tools\kubdee_affiliate\windows"
. (Join-Path $ScriptDir "kubdee_worker_common.ps1")
$ResolvedPython = Resolve-KubdeePython -Python $Python

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputDir = Join-Path $ProjectRoot "outputs"
$logDir = Join-Path $ProjectRoot "logs"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$reportPath = Join-Path $outputDir "windows-acceptance-$timestamp.json"
$summaryTextPath = Join-Path $outputDir "windows-acceptance-$timestamp.txt"
$doctorPath = Join-Path $outputDir "acceptance-doctor-$timestamp.json"
$transcriptPath = Join-Path $logDir "acceptance-$timestamp.log"
$workflowPath = Join-Path $ProjectRoot "tools\kubdee_affiliate\windows\run_affiliate_workflow.ps1"

$results = New-Object System.Collections.ArrayList
$doctorReadiness = [ordered]@{}
$inputReadiness = [ordered]@{}

function Add-Result {
    param(
        [string]$Name,
        [string]$Status,
        [string]$Message = "",
        [object]$Data = $null
    )

    [void]$script:results.Add([ordered]@{
        name = $Name
        status = $Status
        message = $Message
        data = $Data
    })
}

function Invoke-AcceptanceStep {
    param(
        [string]$Name,
        [scriptblock]$Action
    )

    Write-Host "Acceptance checkpoint: $Name"
    try {
        $data = & $Action
        Add-Result -Name $Name -Status "passed" -Data $data
    } catch {
        Add-Result -Name $Name -Status "failed" -Message $_.Exception.Message
        Write-Warning "$Name failed: $($_.Exception.Message)"
    }
}

$transcriptStarted = $false
try {
    Start-Transcript -Path $transcriptPath -Append | Out-Null
    $transcriptStarted = $true
} catch {
    Write-Warning "Could not start acceptance transcript: $($_.Exception.Message)"
}

try {
    Invoke-AcceptanceStep -Name "package_files" -Action {
        $required = @(
            "PACKAGE_MANIFEST.json",
            "README_FIRST.md",
            "tools\kubdee_affiliate\smoke_test.py",
            "tools\kubdee_affiliate\kubdee_affiliate_doctor.py",
            "tools\kubdee_affiliate\windows\kubdee_worker_common.ps1",
            "tools\kubdee_affiliate\windows\run_affiliate_workflow.ps1"
        )
        $missing = $required | Where-Object { -not (Test-Path (Join-Path $ProjectRoot $_)) }
        if (@($missing).Count -gt 0) {
            throw "Missing required files: $($missing -join ', ')"
        }
        [ordered]@{ required = $required }
    }

    Invoke-AcceptanceStep -Name "python" -Action {
        $version = & $ResolvedPython --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Python version check failed with exit code $LASTEXITCODE"
        }
        [ordered]@{ command = $ResolvedPython; version = "$version" }
    }

    Invoke-AcceptanceStep -Name "smoke_test" -Action {
        & $ResolvedPython tools\kubdee_affiliate\smoke_test.py
        if ($LASTEXITCODE -ne 0) {
            throw "Smoke test failed with exit code $LASTEXITCODE"
        }
        [ordered]@{ command = "tools\kubdee_affiliate\smoke_test.py" }
    }

    Invoke-AcceptanceStep -Name "doctor" -Action {
        & $ResolvedPython tools\kubdee_affiliate\kubdee_affiliate_doctor.py `
            --project-root $ProjectRoot `
            --output $doctorPath
        if ($LASTEXITCODE -ne 0) {
            throw "Doctor failed with exit code $LASTEXITCODE"
        }
        $doctor = Get-Content $doctorPath -Raw | ConvertFrom-Json
        $script:doctorReadiness = [ordered]@{
            report = $doctorPath
            ok = [bool]$doctor.ok
            readyForCandidateScoring = [bool]$doctor.readyForCandidateScoring
            readyForKubdeeImport = [bool]$doctor.readyForKubdeeImport
            readyForKubdeePipelineApply = [bool]$doctor.readyForKubdeePipelineApply
            readyForFacebookDraft = [bool]$doctor.readyForFacebookDraft
        }
        $script:doctorReadiness
    }

    Invoke-AcceptanceStep -Name "input_files" -Action {
        $feed = Join-Path $ProjectRoot "data\product-feed.csv"
        $offersText = Join-Path $ProjectRoot "data\shopee-offers.txt"
        $offersJson = Join-Path $ProjectRoot "data\offers.json"
        $script:inputReadiness = [ordered]@{
            feedExists = Test-Path $feed
            offersTextExists = Test-Path $offersText
            offersJsonExists = Test-Path $offersJson
            readyForRealReview = (Test-Path $feed) -and ((Test-Path $offersText) -or (Test-Path $offersJson))
        }
        $script:inputReadiness
    }

    if ($RunKubdeeReview) {
        Invoke-AcceptanceStep -Name "kubdee_review_dry_run" -Action {
            & powershell -ExecutionPolicy Bypass -File $workflowPath `
                -ProjectRoot $ProjectRoot `
                -Python $ResolvedPython `
                -Stage "Review" `
                -Theme $Theme `
                -Campaign $Campaign `
                -ProfileName $ProfileName `
                -Limit $Limit `
                -JitterMinutes 0 `
                -NoTranscript
            if ($LASTEXITCODE -ne 0) {
                throw "Kubdee review dry-run failed with exit code $LASTEXITCODE"
            }
            [ordered]@{ stage = "Review"; campaign = $Campaign; limit = $Limit }
        }
    } else {
        Add-Result -Name "kubdee_review_dry_run" -Status "skipped" -Message "Pass -RunKubdeeReview after Kubdee setup and real input files are ready."
    }
} finally {
    if ($transcriptStarted) {
        Stop-Transcript | Out-Null
    }
}

$failed = @($results | Where-Object { $_.status -eq "failed" })
$reviewStep = $results | Where-Object { $_.name -eq "kubdee_review_dry_run" } | Select-Object -First 1
$reviewDryRunOk = [bool]($RunKubdeeReview -and $reviewStep -and $reviewStep.status -eq "passed")
$basicOk = $failed.Count -eq 0
$readyForReviewWorkflow = (
    $basicOk `
    -and [bool]$inputReadiness.readyForRealReview `
    -and [bool]$doctorReadiness.readyForKubdeeImport `
    -and (-not $RunKubdeeReview -or $reviewDryRunOk)
)
$readyForKubdeePipelineApply = $basicOk -and [bool]$doctorReadiness.readyForKubdeePipelineApply
$readyForFacebookDraft = $basicOk -and [bool]$doctorReadiness.readyForFacebookDraft
$strictOk = $basicOk -and $readyForReviewWorkflow

Add-Result -Name "readiness_summary" -Status "passed" -Data ([ordered]@{
    basicOk = $basicOk
    readyForReviewWorkflow = $readyForReviewWorkflow
    readyForKubdeePipelineApply = $readyForKubdeePipelineApply
    readyForFacebookDraft = $readyForFacebookDraft
    reviewDryRunOk = $reviewDryRunOk
})

$report = [ordered]@{
    createdAt = $timestamp
    projectRoot = $ProjectRoot
    python = $ResolvedPython
    transcript = $transcriptPath
    strict = [bool]$Strict
    runKubdeeReview = [bool]$RunKubdeeReview
    ok = $basicOk
    basicOk = $basicOk
    readyForReviewWorkflow = $readyForReviewWorkflow
    readyForKubdeePipelineApply = $readyForKubdeePipelineApply
    readyForFacebookDraft = $readyForFacebookDraft
    strictOk = $strictOk
    summary = $summaryTextPath
    results = $results
}

$report | ConvertTo-Json -Depth 8 | Set-Content -Path $reportPath -Encoding UTF8

$nextStep = if (-not $basicOk) {
    "Run 08_collect_support_bundle.cmd and send the generated outputs\support-bundle-*.zip for debugging."
} elseif (-not $readyForReviewWorkflow) {
    "Add real data\product-feed.csv plus data\shopee-offers.txt or data\offers.json, then rerun 10_full_acceptance_strict.cmd."
} elseif (-not $readyForKubdeePipelineApply) {
    "Kubdee import review is ready. Keep review-only until Kubdee pipeline apply readiness is confirmed."
} elseif (-not $readyForFacebookDraft) {
    "Kubdee pipeline readiness is OK. Prepare Chrome/Facebook login before Facebook draft automation."
} else {
    "Ready for review-gated workflow. Keep manual review before publish until repeated runs are stable."
}

$summaryLines = @(
    "Kubdee Affiliate Windows Acceptance Summary",
    "CreatedAt: $timestamp",
    "ProjectRoot: $ProjectRoot",
    "ReportJson: $reportPath",
    "Transcript: $transcriptPath",
    "Strict: $Strict",
    "RunKubdeeReview: $RunKubdeeReview",
    "",
    "Readiness:",
    "basicOk=$basicOk",
    "readyForReviewWorkflow=$readyForReviewWorkflow",
    "readyForKubdeePipelineApply=$readyForKubdeePipelineApply",
    "readyForFacebookDraft=$readyForFacebookDraft",
    "strictOk=$strictOk",
    "",
    "NextStep: $nextStep",
    "",
    "Checkpoints:"
)

foreach ($result in $results) {
    $line = "- $($result.name): $($result.status)"
    if ($result.message) {
        $line = "$line - $($result.message)"
    }
    $summaryLines += $line
}

$summaryLines | Set-Content -Path $summaryTextPath -Encoding UTF8

Write-Host "Acceptance report: $reportPath"
Write-Host "Acceptance summary: $summaryTextPath"
if ($failed.Count -gt 0) {
    Write-Warning "Acceptance check found $($failed.Count) failed checkpoint(s)."
}

if ($Strict -and -not $strictOk) {
    Write-Warning "Strict acceptance failed. Review readyForReviewWorkflow and failed checkpoints in the report."
    exit 1
}
