# Kubdee Affiliate Windows Quickstart

This package is review-gated by default. It can score Shopee candidates, import
reviewed products into Kubdee, prepare Kubdee Auto Pipeline, export generated
videos into a Facebook Reels queue, and prepare Facebook draft uploads.

## 0. Prerequisites

Install and open these before running `SETUP.cmd`:

- Python 3.9+ available from Command Prompt or PowerShell as `py` or `python`
- Kubdee AI Desktop installed, logged in, and opened at least once so
  `%APPDATA%\Kubdee AI\data\kubdee.db` exists
- Google Chrome installed and logged into Facebook if you will use the
  Facebook queue/draft stages

The `.cmd` launchers now accept either `py` or `python`. If both commands are
missing, install Python and reopen Command Prompt or PowerShell.

## 1. Copy Files

Recommended GitHub Release path:

1. Download `bootstrap_github_release.ps1` from the release assets.
2. Open PowerShell in the download folder.
3. Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\bootstrap_github_release.ps1 `
  -Repo "manattrakun/Cprompt" `
  -Tag "latest" `
  -Destination "C:\kubdee-affiliate-downloads" `
  -ExtractRoot "C:\kubdee-affiliate"
```

For a private GitHub repository, pass `-Token "github_pat_..."` or set
`$env:GITHUB_TOKEN` before running the script. The bootstrap downloads the
transfer bundle, verifies both checksums, and extracts the worker package to:

```text
C:\kubdee-affiliate
```

It also writes `C:\kubdee-affiliate-downloads\bootstrap-result.json` for
handoff/debugging.

If bootstrap fails:

- `Failed to read GitHub release API`: check the repo/tag and pass `-Token` or
  set `$env:GITHUB_TOKEN` for a private repository.
- `Release is missing required assets`: use the latest GitHub Release or ask
  for a new release; the bootstrap depends on the exact transfer bundle asset
  names.
- `Checksum mismatch`: delete `C:\kubdee-affiliate-downloads`, download again,
  and do not continue with the extracted files.
- `Directory is not writable` or `Not enough free space`: rerun with another
  `-Destination` / `-ExtractRoot`, free disk space, or use a Windows account
  with write permission.

Then double-click `START_HERE.cmd` in the package root.

Manual fallback:

Keep the `.zip` and `.zip.sha256` files together until after transfer. The
checksum file is used to verify the package before use.
If `kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip` is present,
copy it with `kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip.sha256`
and `kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip.verify.cmd`
to Windows, double-click the transfer bundle verifier, unzip the transfer
bundle only after it passes, then run the verifier inside.
If `kubdee-affiliate-windows-worker-latest.zip.verify.cmd` is present beside the
zip, double-click it on Windows before unzipping.

On the source machine, validate before copying:

```powershell
python3 tools\kubdee_affiliate\validate_windows_package.py --package dist\kubdee-affiliate-windows-worker-latest.zip
```

On Windows after copying, keep the `.zip`, `.zip.sha256`, `.zip.verify.cmd`,
`.zip.transfer.txt`, `.zip.release.json`, `.zip.transfer-bundle.zip`, and
`.zip.transfer-bundle.zip.sha256`, and `.zip.transfer-bundle.zip.verify.cmd`
together as transfer evidence.

Create or copy:

```text
C:\kubdee-affiliate\data\product-feed.csv
C:\kubdee-affiliate\data\shopee-offers.txt
```

`shopee-offers.txt` can be copied text from Shopee Affiliate offer pages. You
can also place a normalized `data\offers.json` instead.

For a sample-only test, double-click `00_prepare_sample_data.cmd`. Replace the
sample files before production runs. The sample launcher will not overwrite
existing `data\product-feed.csv` or `data\shopee-offers.txt` unless
`KUBDEE_SAMPLE_FORCE=1` is set.

## 2. First Run Setup

You can double-click the numbered `.cmd` launchers in the package root, or use
PowerShell commands manually.

Keep the launchers in the extracted package root. They use relative paths to the
`tools\` and `docs\` folders.

Run the PowerShell-only prerequisite check first:

```powershell
cd C:\kubdee-affiliate
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\check_windows_prerequisites.ps1 `
  -ProjectRoot "C:\kubdee-affiliate"
```

This writes `outputs\prerequisites-*.json` and can report missing Python before
Python-based checks run. You can also double-click
`00_check_prerequisites.cmd`.

Open PowerShell:

```powershell
cd C:\kubdee-affiliate
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\setup_worker_env.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -ProfileName "Reel promote shopee"
```

Restart PowerShell after setup.

If first setup is unclear, run the one-pass diagnostics helper:

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\run_first_run_diagnostics.ps1 `
  -ProjectRoot "C:\kubdee-affiliate"
```

You can also double-click `14_first_run_diagnostics.cmd`. It runs prerequisite,
acceptance, status, and support-bundle collection checks, then writes:

```text
outputs\first-run-diagnostics-*.json
outputs\first-run-diagnostics-*.txt
outputs\support-bundle-*.zip
```

Send the `.txt` summary and latest support bundle when debugging a Windows
setup run. The diagnostics JSON is included in the support bundle by default.
Use `WINDOWS_TEST_RESULT_TEMPLATE.md` when reporting Windows test results.

## 3. Preflight

```powershell
cd C:\kubdee-affiliate
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\run_doctor.ps1 `
  -ProjectRoot "C:\kubdee-affiliate"

py tools\kubdee_affiliate\smoke_test.py

powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\run_windows_acceptance.ps1 `
  -ProjectRoot "C:\kubdee-affiliate"
```

If `py` is not available but `python` is, run:

```powershell
python tools\kubdee_affiliate\smoke_test.py
```

The acceptance check writes:

```text
outputs\windows-acceptance-*.json
outputs\windows-acceptance-*.txt
logs\acceptance-*.log
```

The `.txt` summary is the quickest file to send back for debugging. The JSON
report includes `basicOk`, `readyForReviewWorkflow`,
`readyForKubdeePipelineApply`, and `readyForFacebookDraft`. It does not publish,
commit imports, or click Facebook.

To summarize the latest reports at any time:

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\show_worker_status.ps1 `
  -ProjectRoot "C:\kubdee-affiliate"
```

You can also double-click `13_show_worker_status.cmd`.
It prints the latest diagnostics/acceptance summary paths and the first failed
steps or checkpoints, if any, so you do not have to open JSON reports first.

After real Shopee input files and Kubdee setup are ready, run a stricter
review-only acceptance pass:

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\run_windows_acceptance.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -RunKubdeeReview `
  -Strict
```

You can also double-click `10_full_acceptance_strict.cmd`.

## 4. Daily Review Run

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\run_affiliate_workflow.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -Stage "Review" `
  -Theme "rainy" `
  -Campaign "rainy-2026-07" `
  -ProfileName "Reel promote shopee" `
  -Limit 20 `
  -JitterMinutes 15
```

This creates candidate output and runs Kubdee import in dry-run mode.
Logs are written to `logs\workflow-*.log`.
If troubleshooting is needed, run `08_collect_support_bundle.cmd`. It creates a
safe bundle under `outputs\` without including `data\`, DB files, videos, or
images. Product and queue payload reports are also excluded by default.

If the product/queue output itself needs review, create an expanded bundle:

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\collect_support_bundle.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -IncludePayloads
```

Optional: install the daily review run into Windows Task Scheduler:

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\install_scheduled_task.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -TaskName "KubdeeAffiliateDailyReview" `
  -Stage "Review" `
  -Theme "rainy" `
  -Campaign "rainy-2026-07" `
  -ProfileName "Reel promote shopee" `
  -DailyAt "09:00" `
  -JitterMinutes 15
```

The default scheduled task is review-only. Use `-Stage "Commit"` or later
stages only after manual runs are stable.

## 5. Multi-Job Config Mode

For several themes, profiles, or Pages on the same Windows machine, copy:

```text
config\worker.config.example.json
```

to:

```text
config\worker.config.json
```

Edit the `jobs` array, then run:

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\run_configured_workflow.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -ConfigPath "config\worker.config.json"
```

You can also double-click `11_run_configured_workflow.cmd`. If
`config\worker.config.json` does not exist yet, the launcher creates it from
the example and stops so you can edit it first.

To install the configured workflow as a daily Windows scheduled task:

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\install_configured_scheduled_task.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -ConfigPath "config\worker.config.json" `
  -TaskName "KubdeeAffiliateConfiguredWorkflow" `
  -DailyAt "09:00"
```

You can also double-click `12_install_configured_schedule.cmd`.
The configured schedule defaults to running only while the Windows user is
logged on. Use that mode for Kubdee/Chrome stages because desktop apps and
browser sessions need an interactive login.

Each enabled job maps to `run_affiliate_workflow.ps1` parameters such as
`stage`, `theme`, `campaign`, `profileName`, `pageName`, `limit`,
`jitterMinutes`, `commitImport`, `preparePipeline`, `applyPipeline`,
`exportFacebookQueue`, and `facebookMode`.

## 6. Commit Reviewed Import

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\run_affiliate_workflow.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -Stage "Commit" `
  -Theme "rainy" `
  -Campaign "rainy-2026-07" `
  -ProfileName "Reel promote shopee" `
  -Limit 20
```

## 7. Prepare Kubdee Pipeline

Start Kubdee with debugging:

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\start_kubdee_debug.ps1
```

Then run:

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\run_affiliate_workflow.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -Stage "Pipeline" `
  -Theme "rainy" `
  -ProfileName "Reel promote shopee" `
  -Limit 20
```

This fills Kubdee Auto Pipeline for review. It does not click Start.

## 8. Facebook Draft

After Kubdee has generated videos, export a queue:

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\run_affiliate_workflow.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -Stage "Queue" `
  -ProfileName "Reel promote shopee" `
  -PageName "Your Facebook Page"
```

Start Chrome with debugging and make sure Facebook is logged in:

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\start_chrome_debug.ps1
```

Dry-run:

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\run_affiliate_workflow.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -Stage "FacebookDryRun"
```

Prepare draft without publishing:

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\run_facebook_reels_draft.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -Mode "draft" `
  -Limit 1
```

Publishing requires an explicit phrase:

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\run_facebook_reels_draft.ps1 `
  -ProjectRoot "C:\kubdee-affiliate" `
  -Mode "publish" `
  -ConfirmPublish "PUBLISH" `
  -Limit 1
```
