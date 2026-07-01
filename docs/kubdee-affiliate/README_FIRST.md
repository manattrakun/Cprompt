# Read This First

Double-click `START_HERE.cmd`, then use the numbered `.cmd` launchers.
For moving the package to a Windows test machine, read
`WINDOWS_TEST_HANDOFF.md`.

Required before first setup:

- Python 3.9+ installed and available as `py` or `python`
- Kubdee AI Desktop installed, logged in, and opened at least once
- Google Chrome installed and logged into Facebook for Facebook draft/upload

If starting from GitHub Releases on Windows, download
`bootstrap_github_release.ps1` first. Run it in PowerShell to download, verify,
and extract the worker package to `C:\kubdee-affiliate`. For a private GitHub
repository, pass `-Token` or set `GITHUB_TOKEN` before running it.

Recommended first run:

1. Run `00_check_prerequisites.cmd`.
2. Put real `product-feed.csv` and `shopee-offers.txt` in `data\`, or run
   `00_prepare_sample_data.cmd` for a sample-only test. The sample launcher
   will not overwrite existing files unless `KUBDEE_SAMPLE_FORCE=1` is set.
3. Run `SETUP.cmd` or `01_setup_env.cmd`.
4. Restart PowerShell.
5. Run `02_doctor.cmd`.
6. Run `03_smoke_test.cmd`.
7. Run `09_windows_acceptance.cmd`.
8. After real feed/offers are ready, run `10_full_acceptance_strict.cmd`.
9. Run `04_daily_review.cmd`.
10. Optional multi-job mode: copy `config\worker.config.example.json` to
    `config\worker.config.json`, edit jobs, then run
    `11_run_configured_workflow.cmd`.
11. Optional daily multi-job schedule: run
    `12_install_configured_schedule.cmd`.
    This schedule defaults to running only while the Windows user is logged on,
    which is the right mode for Kubdee/Chrome automation.
12. Use `13_show_worker_status.cmd` to review the latest prerequisite,
    acceptance, doctor, and configured workflow reports. It also prints failed
    acceptance checkpoints when available.
13. If first setup is unclear, run `14_first_run_diagnostics.cmd` and send the
    generated `outputs\first-run-diagnostics-*.txt` plus the latest
    `outputs\support-bundle-*.zip`. The diagnostics JSON is included in the
    support bundle by default. Use `WINDOWS_TEST_RESULT_TEMPLATE.md` when
    reporting Windows test results.

The default flow is review-only. It will not publish to Facebook and will not
commit imports unless you explicitly run the commit/pipeline commands in
`docs\kubdee-affiliate\WINDOWS_QUICKSTART.md`.

Keep the `.cmd` files in the extracted package root. They use relative paths to
the `tools\` and `docs\` folders.

`00_check_prerequisites.cmd` writes `outputs\prerequisites-*.json`. It uses
PowerShell only, so it can report a missing Python install before Python-based
checks run.

`09_windows_acceptance.cmd` writes `outputs\windows-acceptance-*.json`,
`outputs\windows-acceptance-*.txt`, and `logs\acceptance-*.log`. Send the
`.txt` summary first when debugging. It checks package files, Python, smoke
tests, doctor readiness, and input-file readiness without publishing or
committing imports.
`10_full_acceptance_strict.cmd` also runs the review workflow in dry-run mode
and exits with failure if review readiness is incomplete.

Workflow and scheduled-task logs are written to `logs\`.
If a run fails, use `08_collect_support_bundle.cmd` and send the generated zip
from `outputs\`. It excludes `data\`, local databases, videos, images, and
product/queue payload reports by default.
`14_first_run_diagnostics.cmd` runs prerequisites, acceptance, status, and
support-bundle collection in one pass for first Windows setup debugging.

Only when payload review is needed, run:

```powershell
powershell -ExecutionPolicy Bypass -File tools\kubdee_affiliate\windows\collect_support_bundle.ps1 -ProjectRoot "C:\kubdee-affiliate" -IncludePayloads
```

The release zip is shipped with a `.sha256` checksum file. Keep both files
together when copying to Windows.
If a `.zip.verify.cmd` file is present beside the zip, double-click it on
Windows before unzipping.
If a `.zip.transfer.txt` file is present, keep it beside the zip as the
copy/unzip checklist.
If a `.zip.transfer-bundle.zip` file is present, it already contains the zip,
checksum, verifier, transfer checklist, and release report for copying.
Keep the matching `.zip.transfer-bundle.zip.sha256` file beside it when copying.
If a `.zip.transfer-bundle.zip.verify.cmd` file is present, double-click it on
Windows before unzipping the transfer bundle.
The `.zip.release.json` file records package metadata for audit/debugging.
`tools\kubdee_affiliate\windows\bootstrap_github_release.ps1` can recreate this
download/verify/extract flow directly from GitHub Releases.
