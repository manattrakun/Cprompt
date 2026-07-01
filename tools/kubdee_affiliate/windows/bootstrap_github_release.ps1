param(
    [string]$Repo = "manattrakun/Cprompt",
    [string]$Tag = "latest",
    [string]$Destination = "C:\kubdee-affiliate-downloads",
    [string]$ExtractRoot = "C:\kubdee-affiliate",
    [string]$Token = $env:GITHUB_TOKEN,
    [int]$MinFreeMB = 500,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
} catch {
    Write-Host "Could not force TLS 1.2; continuing with system defaults."
}

function New-DirectoryIfMissing {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

function Assert-WritableDirectory {
    param([string]$Path)

    New-DirectoryIfMissing -Path $Path
    $probePath = Join-Path $Path ".kubdee-write-test-$([guid]::NewGuid().ToString('N')).tmp"
    try {
        "write-test" | Set-Content -LiteralPath $probePath -Encoding ASCII
        Remove-Item -LiteralPath $probePath -Force
    } catch {
        throw "Directory is not writable: $Path. Run PowerShell as a user that can write there, choose another -Destination/-ExtractRoot, or use -Force only after backing up existing files. Details: $($_.Exception.Message)"
    }
}

function Assert-MinFreeSpace {
    param(
        [string]$Path,
        [int]$RequiredMB
    )

    $root = [System.IO.Path]::GetPathRoot((Resolve-Path -LiteralPath $Path).Path)
    $driveName = $root.Substring(0, 1)
    $drive = Get-PSDrive -Name $driveName -ErrorAction Stop
    $freeMB = [math]::Floor($drive.Free / 1MB)
    if ($freeMB -lt $RequiredMB) {
        throw "Not enough free space on $root. Required at least $RequiredMB MB, found $freeMB MB."
    }
}

function Get-GitHubHeaders {
    $headers = @{
        "Accept" = "application/vnd.github+json"
        "User-Agent" = "kubdee-affiliate-bootstrap"
        "X-GitHub-Api-Version" = "2022-11-28"
    }
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    return $headers
}

function Invoke-GitHubJson {
    param([string]$Uri)
    try {
        Invoke-RestMethod -Uri $Uri -Headers (Get-GitHubHeaders)
    } catch {
        throw "Failed to read GitHub release API. If the repository is private, pass -Token or set GITHUB_TOKEN. Details: $($_.Exception.Message)"
    }
}

function Save-GitHubAsset {
    param(
        [object]$Asset,
        [string]$OutputPath
    )

    $headers = Get-GitHubHeaders
    $headers["Accept"] = "application/octet-stream"
    Invoke-WebRequest -Uri $Asset.url -Headers $headers -OutFile $OutputPath -UseBasicParsing
}

function Assert-FileSha256 {
    param(
        [string]$FilePath,
        [string]$ChecksumPath
    )

    $expected = ((Get-Content -Raw -LiteralPath $ChecksumPath).Trim().Split()[0]).ToLowerInvariant()
    $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $FilePath).Hash.ToLowerInvariant()
    Write-Host "Expected: $expected"
    Write-Host "Actual:   $actual"
    if ($actual -ne $expected) {
        throw "Checksum mismatch for $FilePath"
    }
}

function Expand-ZipCleanly {
    param(
        [string]$ZipPath,
        [string]$TargetPath
    )

    if ((Test-Path -LiteralPath $TargetPath) -and $Force) {
        Remove-Item -LiteralPath $TargetPath -Recurse -Force
    }
    New-DirectoryIfMissing -Path $TargetPath
    Expand-Archive -LiteralPath $ZipPath -DestinationPath $TargetPath -Force
}

$releaseUri = if ($Tag -eq "latest") {
    "https://api.github.com/repos/$Repo/releases/latest"
} else {
    "https://api.github.com/repos/$Repo/releases/tags/$Tag"
}

Write-Host "PowerShell execution policy: $(Get-ExecutionPolicy)"
Assert-WritableDirectory -Path $Destination
Assert-WritableDirectory -Path $ExtractRoot
Assert-MinFreeSpace -Path $Destination -RequiredMB $MinFreeMB
Assert-MinFreeSpace -Path $ExtractRoot -RequiredMB $MinFreeMB

Write-Host "Reading GitHub release: $Repo / $Tag"
$release = Invoke-GitHubJson -Uri $releaseUri
$assetNames = @(
    "kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip",
    "kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip.sha256",
    "kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip.verify.cmd"
)

$assetsByName = @{}
foreach ($asset in $release.assets) {
    $assetsByName[$asset.name] = $asset
}

$missingAssets = @($assetNames | Where-Object { -not $assetsByName.ContainsKey($_) })
if ($missingAssets.Count -gt 0) {
    throw "Release is missing required assets: $($missingAssets -join ', ')"
}

foreach ($name in $assetNames) {
    $outputPath = Join-Path $Destination $name
    Write-Host "Downloading $name"
    Save-GitHubAsset -Asset $assetsByName[$name] -OutputPath $outputPath
}

$bundleZip = Join-Path $Destination $assetNames[0]
$bundleSha = Join-Path $Destination $assetNames[1]
$bundleExtract = Join-Path $Destination "transfer-bundle"

Write-Host "Verifying transfer bundle checksum"
Assert-FileSha256 -FilePath $bundleZip -ChecksumPath $bundleSha

Write-Host "Extracting transfer bundle to $bundleExtract"
Expand-ZipCleanly -ZipPath $bundleZip -TargetPath $bundleExtract

$packageZip = Join-Path $bundleExtract "kubdee-affiliate-windows-worker-latest.zip"
$packageSha = Join-Path $bundleExtract "kubdee-affiliate-windows-worker-latest.zip.sha256"
if (-not (Test-Path -LiteralPath $packageZip)) {
    throw "Package zip missing after transfer bundle extraction: $packageZip"
}
if (-not (Test-Path -LiteralPath $packageSha)) {
    throw "Package checksum missing after transfer bundle extraction: $packageSha"
}

Write-Host "Verifying package checksum"
Assert-FileSha256 -FilePath $packageZip -ChecksumPath $packageSha

Write-Host "Extracting worker package to $ExtractRoot"
Expand-ZipCleanly -ZipPath $packageZip -TargetPath $ExtractRoot

$report = [ordered]@{
    ok = $true
    repo = $Repo
    tag = $Tag
    releaseTag = $release.tag_name
    releaseUrl = $release.html_url
    destination = $Destination
    transferBundle = $bundleZip
    transferBundleChecksum = $bundleSha
    packageZip = $packageZip
    packageChecksum = $packageSha
    extractRoot = $ExtractRoot
    completedAt = (Get-Date).ToString("o")
}
$reportPath = Join-Path $Destination "bootstrap-result.json"
$report | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $reportPath -Encoding UTF8
$workerOutputDir = Join-Path $ExtractRoot "outputs"
New-DirectoryIfMissing -Path $workerOutputDir
$workerReportPath = Join-Path $workerOutputDir "bootstrap-result.json"
$report | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $workerReportPath -Encoding UTF8

Write-Host ""
Write-Host "Bootstrap complete."
Write-Host "Worker path: $ExtractRoot"
Write-Host "Bootstrap report: $reportPath"
Write-Host "Worker bootstrap report: $workerReportPath"
Write-Host "Next step: double-click START_HERE.cmd or 14_first_run_diagnostics.cmd in $ExtractRoot"
