# Windows Test Handoff

Use this when moving the Kubdee Affiliate worker package to a Windows machine.

## Copy To Windows

Recommended GitHub Release path:

1. Download `bootstrap_github_release.ps1`.
2. Open PowerShell in the download folder.
3. Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\bootstrap_github_release.ps1 `
  -Repo "manattrakun/Cprompt" `
  -Tag "latest" `
  -Destination "C:\kubdee-affiliate-downloads" `
  -ExtractRoot "C:\kubdee-affiliate"
```

For a private repository, pass `-Token` or set `GITHUB_TOKEN`. The bootstrap
downloads the release assets, verifies the transfer bundle checksum, verifies
the package checksum, extracts the package to `C:\kubdee-affiliate`, and writes
`C:\kubdee-affiliate-downloads\bootstrap-result.json`.

If bootstrap fails, do not continue with partially extracted files. Capture the
error text and check token access, release asset names, checksum mismatch,
write permission, and free disk space.

Manual fallback: copy these three files together:

```text
kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip
kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip.sha256
kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip.verify.cmd
```

On Windows, double-click:

```text
kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip.verify.cmd
```

Continue only if it prints:

```text
Transfer bundle checksum OK.
```

## Extract

If the bootstrap completed successfully, skip this section and continue with
`First Windows Run`.

Unzip the transfer bundle. Then double-click:

```text
kubdee-affiliate-windows-worker-latest.zip.verify.cmd
```

Continue only if it prints:

```text
Checksum OK.
```

Unzip `kubdee-affiliate-windows-worker-latest.zip` to:

```text
C:\kubdee-affiliate
```

## First Windows Run

Open:

```text
C:\kubdee-affiliate
```

Double-click:

```text
14_first_run_diagnostics.cmd
```

This does not publish to Facebook and does not commit imports. It writes:

```text
outputs\first-run-diagnostics-*.txt
outputs\first-run-diagnostics-*.json
outputs\support-bundle-*.zip
```

## Send Back For Debugging

Send these files back after the first run:

```text
C:\kubdee-affiliate-downloads\bootstrap-result.json
outputs\first-run-diagnostics-*.txt
outputs\support-bundle-*.zip
```

Fill `WINDOWS_TEST_RESULT_TEMPLATE.md` and send it with those files if possible.

The diagnostics JSON is included in the support bundle by default, so it does
not need to be sent separately unless requested.

If the `.txt` summary says prerequisites are incomplete, fix the listed action
items first, then run `14_first_run_diagnostics.cmd` again.
