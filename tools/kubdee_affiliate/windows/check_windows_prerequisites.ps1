param(
    [string]$ProjectRoot = "C:\kubdee-affiliate",
    [string]$KubdeeDataDir = "$env:APPDATA\Kubdee AI\data",
    [string]$Output = ""
)

$ErrorActionPreference = "Stop"

function Test-CommandAvailable {
    param([string]$Name)
    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if ($command) {
        return [ordered]@{
            ok = $true
            command = $Name
            path = $command.Source
        }
    }
    return [ordered]@{
        ok = $false
        command = $Name
        path = ""
    }
}

function Find-FirstExistingPath {
    param([string[]]$Candidates)
    foreach ($candidate in $Candidates) {
        if ($candidate -and (Test-Path $candidate)) {
            return $candidate
        }
    }
    return ""
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$projectRootExists = Test-Path $ProjectRoot
if (-not $Output) {
    $outputRoot = if ($projectRootExists) { $ProjectRoot } else { (Get-Location).Path }
    $outputDir = Join-Path $outputRoot "outputs"
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
    $Output = Join-Path $outputDir "prerequisites-$timestamp.json"
}

$pythonPy = Test-CommandAvailable -Name "py"
$pythonExe = Test-CommandAvailable -Name "python"
$pythonOk = [bool]($pythonPy.ok -or $pythonExe.ok)

$chromeExe = Find-FirstExistingPath -Candidates @(
    "$env:PROGRAMFILES\Google\Chrome\Application\chrome.exe",
    "${env:PROGRAMFILES(X86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$kubdeeExe = Find-FirstExistingPath -Candidates @(
    "$env:LOCALAPPDATA\Programs\Kubdee AI\Kubdee AI.exe",
    "$env:PROGRAMFILES\Kubdee AI\Kubdee AI.exe",
    "${env:PROGRAMFILES(X86)}\Kubdee AI\Kubdee AI.exe"
)
$kubdeeDb = Join-Path $KubdeeDataDir "kubdee.db"
$kubdeeDataDirOk = Test-Path $KubdeeDataDir
$kubdeeDbOk = Test-Path $kubdeeDb
$prerequisitesOk = [bool](
    $projectRootExists `
    -and $pythonOk `
    -and $kubdeeDataDirOk `
    -and $kubdeeDbOk
)
$readyForFacebookDraft = [bool]($prerequisitesOk -and $chromeExe)

$report = [ordered]@{
    createdAt = $timestamp
    projectRoot = $ProjectRoot
    ok = $prerequisitesOk
    readyForFacebookDraft = $readyForFacebookDraft
    checks = [ordered]@{
        powershell = [ordered]@{
            ok = $true
            version = $PSVersionTable.PSVersion.ToString()
            edition = $PSVersionTable.PSEdition
        }
        python = [ordered]@{
            ok = $pythonOk
            py = $pythonPy
            python = $pythonExe
            action = if ($pythonOk) { "" } else { "Install Python 3.9+ and enable the py launcher or add python.exe to PATH." }
        }
        kubdee = [ordered]@{
            executableOk = [bool]$kubdeeExe
            executable = $kubdeeExe
            dataDirOk = $kubdeeDataDirOk
            dataDir = $KubdeeDataDir
            dbOk = $kubdeeDbOk
            db = $kubdeeDb
            action = if ($kubdeeDataDirOk -and $kubdeeDbOk) { "" } else { "Install/open Kubdee AI Desktop once, log in, and confirm the profile exists." }
        }
        chrome = [ordered]@{
            ok = [bool]$chromeExe
            executable = $chromeExe
            action = if ($chromeExe) { "" } else { "Install Google Chrome before using Facebook draft/upload stages." }
        }
        projectRoot = [ordered]@{
            ok = $projectRootExists
            path = $ProjectRoot
            action = if ($projectRootExists) { "" } else { "Unzip the worker package to C:\kubdee-affiliate or pass -ProjectRoot." }
        }
    }
}

$report | ConvertTo-Json -Depth 8 | Set-Content -Path $Output -Encoding UTF8

Write-Host "Prerequisite report: $Output"
if (-not $prerequisitesOk) {
    Write-Warning "Prerequisites incomplete. Open the report and follow the action fields."
}
