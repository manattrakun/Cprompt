param(
    [string]$ProjectRoot = "C:\kubdee-affiliate",
    [string]$Python = "",
    [string]$AffiliateDb = "data\affiliate.db",
    [string]$FeedPath = "data\product-feed.csv",
    [string]$OffersInputPath = "data\shopee-offers.txt",
    [string]$OffersPath = "data\offers.json",
    [string]$FeedDate = (Get-Date -Format "yyyy-MM-dd"),
    [string]$Campaign = "rainy-$(Get-Date -Format 'yyyy-MM')",
    [string]$Theme = "rainy",
    [int]$Limit = 20,
    [double]$MinCommission = 8,
    [int]$MinSold = 10,
    [double]$MinRating = 4.5,
    [int]$MinStock = 1,
    [double]$MinScore = 30,
    [int]$JitterMinutes = 0
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $PSCommandPath
. (Join-Path $ScriptDir "kubdee_worker_common.ps1")
$ResolvedPython = Resolve-KubdeePython -Python $Python

Set-Location $ProjectRoot

if ($JitterMinutes -gt 0) {
    $maxSeconds = [Math]::Max(1, $JitterMinutes * 60)
    $sleepSeconds = Get-Random -Minimum 0 -Maximum $maxSeconds
    Write-Host "Jitter sleep: $sleepSeconds seconds"
    Start-Sleep -Seconds $sleepSeconds
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputDir = Join-Path $ProjectRoot "outputs"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$candidateOutput = Join-Path $outputDir "$Campaign-$timestamp-candidates.json"

& $ResolvedPython tools\kubdee_affiliate\affiliate_pipeline.py --db $AffiliateDb init-db

& $ResolvedPython tools\kubdee_affiliate\affiliate_pipeline.py --db $AffiliateDb ingest-feed `
    --feed $FeedPath `
    --feed-date $FeedDate `
    --mark-inactive

if (Test-Path $OffersInputPath) {
    & $ResolvedPython tools\kubdee_affiliate\export_shopee_offers.py `
        --input $OffersInputPath `
        --output $OffersPath `
        --source shopee-dashboard `
        --min-commission $MinCommission
} elseif (-not (Test-Path $OffersPath)) {
    throw "Missing offers input. Provide $OffersInputPath or normalized $OffersPath."
}

& $ResolvedPython tools\kubdee_affiliate\affiliate_pipeline.py --db $AffiliateDb ingest-offers `
    --input $OffersPath `
    --source shopee-dashboard

& $ResolvedPython tools\kubdee_affiliate\affiliate_pipeline.py --db $AffiliateDb export `
    --campaign $Campaign `
    --theme $Theme `
    --require-offer `
    --min-commission $MinCommission `
    --min-sold $MinSold `
    --min-rating $MinRating `
    --min-stock $MinStock `
    --min-score $MinScore `
    --limit $Limit `
    --output $candidateOutput

Write-Host "Candidate output: $candidateOutput"
