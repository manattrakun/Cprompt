# Windows Test Result Template

Fill this after running `14_first_run_diagnostics.cmd` on the Windows machine.
Do not paste product feed rows, local databases, Facebook cookies, or secrets.

## Machine

```text
Windows version:
Python command tested: py / python / other:
Kubdee AI installed: yes / no
Kubdee AI opened and logged in: yes / no
Chrome installed: yes / no
Facebook logged in on Chrome: yes / no / not tested
```

## Package Transfer

```text
Bootstrap script result: passed / failed / not used
Bootstrap result JSON path: C:\kubdee-affiliate-downloads\bootstrap-result.json / outputs\bootstrap-result.json / other:
Transfer bundle verifier result: passed / failed
Main zip verifier result: passed / failed
Installed path: C:\kubdee-affiliate / other:
```

## First-Run Diagnostics

```text
14_first_run_diagnostics.cmd completed: yes / no
outputs\first-run-diagnostics-*.txt path:
outputs\support-bundle-*.zip path:
Latest failed step or checkpoint:
```

## Result Summary

```text
Overall setup result: passed / blocked
Main blocker:
Next action already tried:
```

## Files To Send Back

Attach these files:

```text
outputs\first-run-diagnostics-*.txt
outputs\support-bundle-*.zip
C:\kubdee-affiliate-downloads\bootstrap-result.json
outputs\bootstrap-result.json
```

The diagnostics JSON is already included in the support bundle by default.

```text
Attached diagnostics txt: yes / no
Attached support bundle zip: yes / no
Attached bootstrap result JSON: yes / no / not used
Attached screenshot if useful: yes / no
```

## Optional Environment Details

```text
PowerShell execution policy:
Windows user context: local admin / standard user / remote session
Actual install path:
Run timestamp:
```

## Notes

```text
What happened on screen:
Any command window error text:
Anything installed or changed before retrying:
```
