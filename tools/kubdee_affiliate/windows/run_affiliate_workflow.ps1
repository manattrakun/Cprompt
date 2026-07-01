param(
    [string]$ProjectRoot = "C:\kubdee-affiliate",
    [string]$Python = "",
    [ValidateSet("Review", "Commit", "Pipeline", "Queue", "FacebookDryRun", "FacebookDraft", "All")]
    [string]$Stage = "Review",
    [string]$Theme = "rainy",
    [string]$Campaign = "rainy-$(Get-Date -Format 'yyyy-MM')",
    [string]$ProfileName = $env:KUBDEE_PROFILE_NAME,
    [string]$PageName = "",
    [switch]$SkipDoctor,
    [switch]$CommitImport,
    [switch]$PreparePipeline,
    [switch]$ApplyPipeline,
    [switch]$ExportFacebookQueue,
    [string]$FacebookMode = "skip",
    [int]$Limit = 20,
    [int]$JitterMinutes = 0,
    [string]$LogDir = "logs",
    [switch]$NoTranscript
)

$ErrorActionPreference = "Stop"

Set-Location $ProjectRoot

$ScriptDir = Join-Path $ProjectRoot "tools\kubdee_affiliate\windows"
. (Join-Path $ScriptDir "kubdee_worker_common.ps1")
$ResolvedPython = Resolve-KubdeePython -Python $Python

$transcriptStarted = $false
if (-not $NoTranscript) {
    try {
        $resolvedLogDir = Join-Path $ProjectRoot $LogDir
        New-Item -ItemType Directory -Force -Path $resolvedLogDir | Out-Null
        $logStamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $logPath = Join-Path $resolvedLogDir "workflow-$Stage-$logStamp.log"
        Start-Transcript -Path $logPath -Append | Out-Null
        $transcriptStarted = $true
        Write-Host "Workflow log: $logPath"
    } catch {
        Write-Warning "Could not start transcript logging: $($_.Exception.Message)"
    }
}

trap {
    if ($transcriptStarted) {
        Stop-Transcript | Out-Null
    }
    throw
}

$shouldRunCandidate = $Stage -in @("Review", "Commit", "Pipeline", "All")
$shouldRunImport = $Stage -in @("Review", "Commit", "Pipeline", "All")
$shouldRunQueue = $Stage -in @("Queue", "FacebookDryRun", "FacebookDraft", "All") -or $ExportFacebookQueue
$shouldRunFacebook = $Stage -in @("FacebookDryRun", "FacebookDraft", "All") -or $FacebookMode -ne "skip"

if ($Stage -eq "Commit") {
    $CommitImport = $true
}
if ($Stage -eq "Pipeline") {
    $CommitImport = $true
    $PreparePipeline = $true
    $ApplyPipeline = $true
}
if ($Stage -eq "All") {
    $CommitImport = $true
    $PreparePipeline = $true
    $ApplyPipeline = $true
    $ExportFacebookQueue = $true
    if ($FacebookMode -eq "skip") {
        $FacebookMode = "dry-run"
    }
}
if ($Stage -eq "FacebookDryRun") {
    $FacebookMode = "dry-run"
}
if ($Stage -eq "FacebookDraft") {
    $FacebookMode = "draft"
}

if (-not $SkipDoctor) {
    Write-Host "Stage checkpoint: doctor"
    & powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\run_doctor.ps1 `
        -ProjectRoot $ProjectRoot `
        -Python $ResolvedPython
}

if ($shouldRunCandidate) {
    Write-Host "Stage checkpoint: candidate scoring/export"
    & powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\run_affiliate_pipeline.ps1 `
        -ProjectRoot $ProjectRoot `
        -Python $ResolvedPython `
        -Theme $Theme `
        -Campaign $Campaign `
        -Limit $Limit `
        -JitterMinutes $JitterMinutes
}

$importArgs = @(
    "-ExecutionPolicy", "Bypass",
    "-File", "tools\kubdee_affiliate\windows\run_kubdee_import_review.ps1",
    "-ProjectRoot", $ProjectRoot,
    "-Python", $ResolvedPython,
    "-Theme", $Theme,
    "-Limit", "$Limit"
)

if ($ProfileName) {
    $importArgs += @("-ProfileName", $ProfileName)
}
if ($CommitImport) {
    $importArgs += "-CommitImport"
}
if ($PreparePipeline) {
    $importArgs += "-PreparePipeline"
}
if ($ApplyPipeline) {
    $importArgs += "-ApplyPipeline"
}

if ($shouldRunImport) {
    Write-Host "Stage checkpoint: kubdee import review"
    & powershell @importArgs
}

if ($shouldRunQueue) {
    Write-Host "Stage checkpoint: facebook queue export"
    $queueArgs = @(
        "-ExecutionPolicy", "Bypass",
        "-File", "tools\kubdee_affiliate\windows\export_facebook_queue.ps1",
        "-ProjectRoot", $ProjectRoot,
        "-Python", $ResolvedPython,
        "-Limit", "$Limit"
    )
    if ($ProfileName) {
        $queueArgs += @("-ProfileName", $ProfileName)
    }
    if ($PageName) {
        $queueArgs += @("-PageName", $PageName)
    }
    & powershell @queueArgs
}

if ($shouldRunFacebook) {
    Write-Host "Stage checkpoint: facebook reels $FacebookMode"
    & powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\run_facebook_reels_draft.ps1 `
        -ProjectRoot $ProjectRoot `
        -Python $ResolvedPython `
        -Mode $FacebookMode `
        -Limit 1
}

if ($transcriptStarted) {
    Stop-Transcript | Out-Null
}
