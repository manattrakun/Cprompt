param(
    [string]$ProjectRoot = "C:\kubdee-affiliate",
    [string]$ConfigPath = "config\worker.config.json",
    [string]$Python = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
    throw "Project root not found: $ProjectRoot. Unzip the worker package there or pass -ProjectRoot."
}

Set-Location $ProjectRoot

$ScriptDir = Join-Path $ProjectRoot "tools\kubdee_affiliate\windows"
. (Join-Path $ScriptDir "kubdee_worker_common.ps1")
$ResolvedPython = Resolve-KubdeePython -Python $Python

$resolvedConfigPath = if ([System.IO.Path]::IsPathRooted($ConfigPath)) {
    $ConfigPath
} else {
    Join-Path $ProjectRoot $ConfigPath
}

if (-not (Test-Path $resolvedConfigPath)) {
    throw "Config not found: $resolvedConfigPath. Copy config\worker.config.example.json to config\worker.config.json and edit jobs."
}

$workflow = Join-Path $ProjectRoot "tools\kubdee_affiliate\windows\run_affiliate_workflow.ps1"
if (-not (Test-Path $workflow)) {
    throw "Workflow script not found: $workflow"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputDir = Join-Path $ProjectRoot "outputs"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$reportPath = Join-Path $outputDir "configured-workflow-$timestamp.json"
$results = New-Object System.Collections.ArrayList
$failedJob = $null

function Add-ConfiguredJobResult {
    param(
        [string]$Name,
        [string]$Status,
        [string]$Stage = "",
        [string]$Theme = "",
        [string]$Campaign = "",
        [int]$Limit = 0,
        [string]$Message = ""
    )

    [void]$script:results.Add([ordered]@{
        name = $Name
        status = $Status
        stage = $Stage
        theme = $Theme
        campaign = $Campaign
        limit = $Limit
        message = $Message
    })
}

$config = Get-Content $resolvedConfigPath -Raw | ConvertFrom-Json
if (-not $config.jobs) {
    throw "Config must contain a jobs array: $resolvedConfigPath"
}

foreach ($job in @($config.jobs)) {
    $jobName = if ($job.name) { $job.name } else { "unnamed-job" }
    if ($null -ne $job.enabled -and -not [bool]$job.enabled) {
        Write-Host "Skipping disabled job: $jobName"
        Add-ConfiguredJobResult -Name $jobName -Status "skipped" -Message "disabled"
        continue
    }

    $theme = if ($job.theme) { $job.theme } else { "rainy" }
    $campaign = if ($job.campaign) { $job.campaign } else { "$theme-$(Get-Date -Format 'yyyy-MM')" }
    $stage = if ($job.stage) { $job.stage } else { "Review" }
    $limit = if ($job.limit) { [int]$job.limit } else { 20 }
    $jitterMinutes = if ($job.jitterMinutes) { [int]$job.jitterMinutes } else { 0 }
    $facebookMode = if ($job.facebookMode) { $job.facebookMode } else { "skip" }

    Write-Host "Configured workflow job: $jobName"

    $argsList = @(
        "-ExecutionPolicy", "Bypass",
        "-File", $workflow,
        "-ProjectRoot", $ProjectRoot,
        "-Python", $ResolvedPython,
        "-Stage", $stage,
        "-Theme", $theme,
        "-Campaign", $campaign,
        "-Limit", "$limit",
        "-JitterMinutes", "$jitterMinutes",
        "-FacebookMode", $facebookMode
    )

    if ($job.profileName) {
        $argsList += @("-ProfileName", $job.profileName)
    }
    if ($job.pageName) {
        $argsList += @("-PageName", $job.pageName)
    }
    if ($job.commitImport) {
        $argsList += "-CommitImport"
    }
    if ($job.preparePipeline) {
        $argsList += "-PreparePipeline"
    }
    if ($job.applyPipeline) {
        $argsList += "-ApplyPipeline"
    }
    if ($job.exportFacebookQueue) {
        $argsList += "-ExportFacebookQueue"
    }

    try {
        & powershell @argsList
        if ($LASTEXITCODE -ne 0) {
            $message = "exit code $LASTEXITCODE"
            Add-ConfiguredJobResult -Name $jobName -Status "failed" -Stage $stage -Theme $theme -Campaign $campaign -Limit $limit -Message $message
            $failedJob = "$jobName ($message)"
            break
        }
        Add-ConfiguredJobResult -Name $jobName -Status "passed" -Stage $stage -Theme $theme -Campaign $campaign -Limit $limit
    } catch {
        $message = $_.Exception.Message
        Add-ConfiguredJobResult -Name $jobName -Status "failed" -Stage $stage -Theme $theme -Campaign $campaign -Limit $limit -Message $message
        $failedJob = "$jobName ($message)"
        break
    }
}

$failedCount = @($results | Where-Object { $_.status -eq "failed" }).Count
$report = [ordered]@{
    createdAt = $timestamp
    projectRoot = $ProjectRoot
    configPath = $resolvedConfigPath
    ok = $failedCount -eq 0
    failedCount = $failedCount
    jobCount = @($results).Count
    results = $results
}

$report | ConvertTo-Json -Depth 8 | Set-Content -Path $reportPath -Encoding UTF8
Write-Host "Configured workflow report: $reportPath"

if ($failedJob) {
    throw "Configured workflow failed at job: $failedJob. Report: $reportPath"
}
