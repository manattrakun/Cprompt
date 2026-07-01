param(
    [string]$Repo = "manattrakun/Cprompt",
    [string]$Tag = "latest",
    [string]$Destination = "C:\kubdee-affiliate-downloads",
    [string]$ExtractRoot = "C:\kubdee-affiliate",
    [string]$Token = $env:GITHUB_TOKEN,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

function New-DirectoryIfMissing {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
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
    Invoke-RestMethod -Uri $Uri -Headers (Get-GitHubHeaders)
}

function Save-GitHubAsset {
    param(
        [object]$Asset,
        [string]$OutputPath
    )

    $headers = Get-GitHubHeaders
    $headers["Accept"] = "application/octet-stream"
    Invoke-WebRequest -Uri $Asset.url -Headers $headers -OutFile $OutputPath
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

New-DirectoryIfMissing -Path $Destination

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

Write-Host ""
Write-Host "Bootstrap complete."
Write-Host "Worker path: $ExtractRoot"
Write-Host "Next step: double-click START_HERE.cmd or 14_first_run_diagnostics.cmd in $ExtractRoot"
