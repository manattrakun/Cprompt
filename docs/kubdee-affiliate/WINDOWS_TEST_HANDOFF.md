# Windows Test Handoff

Use this when moving the Kubdee Affiliate worker package to a Windows machine.

## Copy To Windows

Copy these three files together:

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
outputs\first-run-diagnostics-*.txt
outputs\support-bundle-*.zip
```

Fill `WINDOWS_TEST_RESULT_TEMPLATE.md` and send it with those files if possible.

The diagnostics JSON is included in the support bundle by default, so it does
not need to be sent separately unless requested.

If the `.txt` summary says prerequisites are incomplete, fix the listed action
items first, then run `14_first_run_diagnostics.cmd` again.
