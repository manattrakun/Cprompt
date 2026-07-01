# Kubdee Affiliate Windows Worker Runbook

This is the first Windows-ready worker shape. It prepares candidates only; keep
Kubdee import and Facebook publishing as review-gated jobs until the flow is
stable.

## Folder Layout

Example:

```text
C:\kubdee-affiliate\
  data\
    affiliate.db
    product-feed.csv
    shopee-offers.txt
    offers.json
  outputs\
  tools\
  docs\
```

Copy this project folder to the Windows machine, then place the daily Shopee
Product Feed at `data\product-feed.csv`.

To build a portable zip from the current repo:

```bash
python3 tools/kubdee_affiliate/package_windows_worker.py --output dist
```

Unzip the package on Windows to `C:\kubdee-affiliate`, then open
`docs\kubdee-affiliate\WINDOWS_QUICKSTART.md`.

For commissions, use either:

- `data\shopee-offers.txt`: text copied from Shopee Affiliate offer pages.
- `data\offers.json`: already-normalized offer rows.

Optional browser-assisted path:

1. Open Shopee Affiliate offer page in Chrome.
2. Open DevTools Console.
3. Paste `tools\kubdee_affiliate\browser\shopee_offers_console_export.js`.
4. Move the downloaded JSON to `data\offers.json`.

## Kubdee Environment

Run the setup helper on the machine that imports into Kubdee:

```powershell
powershell -ExecutionPolicy Bypass -File C:\kubdee-affiliate\tools\kubdee_affiliate\windows\setup_worker_env.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -ProfileName "Reel promote shopee"
```

Restart PowerShell after setup.

Run preflight any time the worker machine changes:

```powershell
powershell -ExecutionPolicy Bypass -File C:\kubdee-affiliate\tools\kubdee_affiliate\windows\run_doctor.ps1 `
  -ProjectRoot "C:\kubdee-affiliate"
```

Run a local smoke test after copying the project:

```powershell
py tools\kubdee_affiliate\smoke_test.py
```

For Auto Pipeline preparation, start Kubdee with the local debugging port:

```powershell
powershell -ExecutionPolicy Bypass -File C:\kubdee-affiliate\tools\kubdee_affiliate\windows\start_kubdee_debug.ps1
```

This is local to the machine and is used by `prepare_kubdee_pipeline.py` to fill
Kubdee Auto Pipeline for review. It does not click Start or trigger generation.

For Facebook draft upload, start Chrome with the local debugging port and make
sure the target Facebook account/Page is already logged in:

```powershell
powershell -ExecutionPolicy Bypass -File C:\kubdee-affiliate\tools\kubdee_affiliate\windows\start_chrome_debug.ps1
```

## Candidate Job

For a single review-gated daily command:

```powershell
powershell -ExecutionPolicy Bypass -File C:\kubdee-affiliate\tools\kubdee_affiliate\windows\run_affiliate_workflow.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -Theme "rainy" `
  -Campaign "rainy-2026-07" `
  -ProfileName "Reel promote shopee" `
  -Limit 20 `
  -JitterMinutes 15
```

That command scores candidates and runs Kubdee import in dry-run review mode.
Add explicit switches only after review:

```powershell
  -CommitImport -PreparePipeline -ApplyPipeline -ExportFacebookQueue
```

Run once manually:

```powershell
powershell -ExecutionPolicy Bypass -File C:\kubdee-affiliate\tools\kubdee_affiliate\windows\run_affiliate_pipeline.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -FeedPath "data\product-feed.csv" `
  -OffersInputPath "data\shopee-offers.txt" `
  -OffersPath "data\offers.json" `
  -Theme "rainy" `
  -Campaign "rainy-2026-07" `
  -JitterMinutes 15
```

The script writes shortlisted candidates to `outputs\*-candidates.json`.

## Import Dry Run

Use the review wrapper. It defaults to dry-run and writes a JSON report.

```powershell
powershell -ExecutionPolicy Bypass -File C:\kubdee-affiliate\tools\kubdee_affiliate\windows\run_kubdee_import_review.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -Theme "rainy" `
  -ProfileName "Reel promote shopee"
```

Commit import only after reviewing the report:

```powershell
powershell -ExecutionPolicy Bypass -File C:\kubdee-affiliate\tools\kubdee_affiliate\windows\run_kubdee_import_review.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -Theme "rainy" `
  -ProfileName "Reel promote shopee" `
  -CommitImport
```

To also prepare Kubdee Auto Pipeline after import, keep Kubdee AI Desktop open
with remote debugging enabled and add:

```powershell
  -PreparePipeline -ApplyPipeline
```

## Windows Task Scheduler

Install a basic daily review task:

```powershell
powershell -ExecutionPolicy Bypass -File C:\kubdee-affiliate\tools\kubdee_affiliate\windows\install_scheduled_task.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -TaskName "KubdeeAffiliateDailyReview" `
  -Stage "Review" `
  -Theme "rainy" `
  -ProfileName "Reel promote shopee" `
  -DailyAt "09:00" `
  -JitterMinutes 15
```

Use `-JitterMinutes 15` or similar when several profiles/pages will run on the
same machine.

For multiple jobs in one config file, copy
`config\worker.config.example.json` to `config\worker.config.json`, edit the
`jobs` array, then run:

```powershell
powershell -ExecutionPolicy Bypass -File C:\kubdee-affiliate\tools\kubdee_affiliate\windows\run_configured_workflow.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -ConfigPath "config\worker.config.json"
```

To install that config as a daily scheduled task:

```powershell
powershell -ExecutionPolicy Bypass -File C:\kubdee-affiliate\tools\kubdee_affiliate\windows\install_configured_scheduled_task.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -ConfigPath "config\worker.config.json" `
  -TaskName "KubdeeAffiliateConfiguredWorkflow" `
  -DailyAt "09:00"
```

The configured scheduled task defaults to interactive logon mode. Keep that
default for Kubdee/Chrome stages. Use `-RunWhetherUserIsLoggedOff` only for jobs
that do not need desktop apps or browser sessions.

Use separate tasks for:

1. Download or update Product Feed.
2. Scrape/update offer and commission rows.
3. Score/export candidates.
4. Import reviewed candidates into Kubdee. Keep this manual at first by running
   the review command above, then adding `-CommitImport` after review.
5. Generate content in Kubdee.
6. Export Facebook Reels draft queue:

```powershell
powershell -ExecutionPolicy Bypass -File C:\kubdee-affiliate\tools\kubdee_affiliate\windows\export_facebook_queue.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -ProfileName "Reel promote shopee" `
  -PageName "Your Facebook Page"
```

7. Dry-run Facebook draft automation:

```powershell
powershell -ExecutionPolicy Bypass -File C:\kubdee-affiliate\tools\kubdee_affiliate\windows\run_facebook_reels_draft.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -Mode "dry-run" `
  -Limit 1
```

8. Upload and fill draft, without publishing:

```powershell
powershell -ExecutionPolicy Bypass -File C:\kubdee-affiliate\tools\kubdee_affiliate\windows\run_facebook_reels_draft.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -Mode "draft" `
  -Limit 1
```

Publishing is intentionally locked behind an explicit confirmation phrase:

```powershell
powershell -ExecutionPolicy Bypass -File C:\kubdee-affiliate\tools\kubdee_affiliate\windows\run_facebook_reels_draft.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -Mode "publish" `
  -ConfirmPublish "PUBLISH" `
  -Limit 1
```

Production publishing should stay disabled until draft/upload has been reviewed
over multiple successful runs.
