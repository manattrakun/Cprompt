# GitHub Handoff

Use a private GitHub repository for the worker source and GitHub Releases for
Windows transfer artifacts.

## Repository Contents

Commit source, docs, sample data, and config templates:

```text
docs/kubdee-affiliate/
tools/kubdee_affiliate/
config/worker.config.example.json
.gitignore
.gitattributes
.github/workflows/kubdee-worker-static.yml
```

Do not commit local payloads or machine state:

```text
data\
logs\
outputs\
config\worker.config.json
dist\
*.db
*.sqlite
*.csv except tools\kubdee_affiliate\sample_feed.csv
videos and generated media
```

## Release Assets

Attach these files to a GitHub Release instead of committing them:

```text
kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip
kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip.sha256
kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip.verify.cmd
```

On Windows, download the three release assets, run the verifier, unzip the
transfer bundle, then follow `WINDOWS_TEST_HANDOFF.md`.
Use `WINDOWS_TEST_RESULT_TEMPLATE.md` to report Windows diagnostics results
back after running `14_first_run_diagnostics.cmd`; it is included in the
package/transfer bundle and is not a separate release asset.

After receiving `outputs\support-bundle-*.zip` from the Windows machine, run:

```powershell
python3 tools\kubdee_affiliate\summarize_windows_support_bundle.py outputs\support-bundle-YYYYMMDD-HHMMSS.zip
```

The summarizer reads only reports in the support bundle and highlights failed
steps/checkpoints plus readiness fields.

## Local Build Commands

From the repository root:

```powershell
python3 tools\kubdee_affiliate\prepare_github_release.py
```

This runs `tools\kubdee_affiliate\validate_repo_hygiene.py`, runs
`tools\kubdee_affiliate\test_summarize_windows_support_bundle.py`, builds the
package, runs static package validation, and writes:

```text
dist\github-release-assets.json
dist\github-release-notes.md
```

The package validation is static only. Runtime testing belongs on the Windows
machine.

The repository includes `.gitattributes` so Windows `.cmd` and `.ps1` files
check out with CRLF line endings, while Python/source/docs stay LF.

## GitHub Actions

The workflow `.github/workflows/kubdee-worker-static.yml` runs the same static
release gate on pull requests, pushes to `master`/`main`, and manual dispatch.
It uploads the three transfer assets plus `github-release-assets.json` and
`github-release-notes.md` as a workflow artifact.
