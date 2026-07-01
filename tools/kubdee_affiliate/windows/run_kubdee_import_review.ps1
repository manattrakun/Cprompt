param(
    [string]$ProjectRoot = "C:\kubdee-affiliate",
    [string]$Python = "",
    [string]$InputPath = "",
    [string]$CandidatePattern = "outputs\*-candidates.json",
    [string]$Theme = "rainy",
    [string]$ProfileName = $env:KUBDEE_PROFILE_NAME,
    [string]$ProfileId = "",
    [int]$Limit = 20,
    [double]$MinScore = 30,
    [switch]$AllowLooseTheme,
    [switch]$CommitImport,
    [switch]$NoBackup,
    [switch]$PreparePipeline,
    [switch]$ApplyPipeline,
    [string]$Steps = "image,video",
    [string]$CdpUrl = "http://127.0.0.1:19222"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $PSCommandPath
. (Join-Path $ScriptDir "kubdee_worker_common.ps1")
$ResolvedPython = Resolve-KubdeePython -Python $Python

Set-Location $ProjectRoot

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputDir = Join-Path $ProjectRoot "outputs"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

if ($InputPath) {
    $candidate = Get-Item $InputPath
} else {
    $candidate = Get-ChildItem $CandidatePattern |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
}

if (-not $candidate) {
    throw "No candidate file found. Pass -InputPath or check -CandidatePattern."
}

$importReport = Join-Path $outputDir "kubdee-import-$timestamp.json"
$importArgs = @(
    "tools\kubdee_affiliate\import_kubdee_catalog.py",
    "--input", $candidate.FullName,
    "--theme", $Theme,
    "--min-score", "$MinScore",
    "--limit", "$Limit",
    "--output-report", $importReport
)

if ($ProfileId) {
    $importArgs += @("--profile-id", $ProfileId)
} elseif ($ProfileName) {
    $importArgs += @("--profile-name", $ProfileName)
}

if ($AllowLooseTheme) {
    $importArgs += "--allow-loose-theme"
}

if ($CommitImport) {
    if ($NoBackup) {
        $importArgs += "--no-backup"
    }
} else {
    $importArgs += "--dry-run"
}

& $ResolvedPython @importArgs
if ($LASTEXITCODE -ne 0) {
    throw "Kubdee import command failed with exit code $LASTEXITCODE"
}

Write-Host "Import report: $importReport"

if ($PreparePipeline) {
    if (-not $CommitImport) {
        Write-Warning "Skipping pipeline preparation because -CommitImport was not set."
        exit 0
    }

    $pipelineReport = Join-Path $outputDir "kubdee-pipeline-$timestamp.json"
    $pipelineArgs = @(
        "tools\kubdee_affiliate\prepare_kubdee_pipeline.py",
        "--input", $candidate.FullName,
        "--theme", $Theme,
        "--limit", "$Limit",
        "--steps", $Steps,
        "--cdp-url", $CdpUrl,
        "--output-preview", $pipelineReport
    )

    if ($ProfileId) {
        $pipelineArgs += @("--profile-id", $ProfileId)
    } elseif ($ProfileName) {
        $pipelineArgs += @("--profile-name", $ProfileName)
    }

    if ($ApplyPipeline) {
        $pipelineArgs += "--apply"
    }

    & $ResolvedPython @pipelineArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Kubdee pipeline preparation failed with exit code $LASTEXITCODE"
    }

    Write-Host "Pipeline report: $pipelineReport"
}
