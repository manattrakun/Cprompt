#!/usr/bin/env python3
"""Run static release gates and print GitHub Release assets."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_PACKAGE_NAME = "kubdee-affiliate-windows-worker-latest.zip"
BOOTSTRAP_SCRIPT = ROOT / "tools/kubdee_affiliate/windows/bootstrap_github_release.ps1"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare Kubdee affiliate GitHub Release assets")
    parser.add_argument("--output", type=Path, default=ROOT / "dist")
    parser.add_argument("--name", default=DEFAULT_PACKAGE_NAME)
    return parser.parse_args()


def run_step(command: list[str]) -> None:
    print(f"$ {' '.join(command)}")
    subprocess.run(command, cwd=ROOT, check=True)


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def portable_path(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(ROOT))
    except ValueError:
        return str(path)


def main() -> int:
    args = parse_args()
    package_path = args.output / args.name
    transfer_bundle_path = package_path.with_suffix(package_path.suffix + ".transfer-bundle.zip")
    transfer_bundle_checksum_path = transfer_bundle_path.with_suffix(transfer_bundle_path.suffix + ".sha256")
    transfer_bundle_verifier_path = transfer_bundle_path.with_suffix(transfer_bundle_path.suffix + ".verify.cmd")

    run_step([sys.executable, "tools/kubdee_affiliate/validate_repo_hygiene.py"])
    run_step([sys.executable, "tools/kubdee_affiliate/test_summarize_windows_support_bundle.py"])
    run_step(
        [
            sys.executable,
            "tools/kubdee_affiliate/package_windows_worker.py",
            "--output",
            str(args.output),
            "--name",
            args.name,
        ]
    )
    run_step(
        [
            sys.executable,
            "tools/kubdee_affiliate/validate_windows_package.py",
            "--package",
            str(package_path),
            "--skip-smoke",
        ]
    )

    required_assets = (
        BOOTSTRAP_SCRIPT,
        transfer_bundle_path,
        transfer_bundle_checksum_path,
        transfer_bundle_verifier_path,
    )
    missing_assets = [str(path) for path in required_assets if not path.exists()]
    if missing_assets:
        raise FileNotFoundError(f"missing release assets: {missing_assets}")

    release_manifest = {
        "ok": True,
        "package": portable_path(package_path),
        "assets": [
            {
                "path": portable_path(path),
                "name": path.name,
                "sha256": sha256_file(path),
                "bytes": path.stat().st_size,
            }
            for path in required_assets
        ],
        "validation": {
            "repoHygiene": "tools/kubdee_affiliate/validate_repo_hygiene.py",
            "supportBundleSummaryTest": "tools/kubdee_affiliate/test_summarize_windows_support_bundle.py",
            "packageValidation": "tools/kubdee_affiliate/validate_windows_package.py --skip-smoke",
            "runtimeTesting": "Run on Windows with 14_first_run_diagnostics.cmd",
        },
    }

    manifest_path = args.output / "github-release-assets.json"
    notes_path = args.output / "github-release-notes.md"
    manifest_path.write_text(json.dumps(release_manifest, indent=2), encoding="utf-8")
    notes_path.write_text(
        "\n".join(
            [
                "# Kubdee Affiliate Windows Worker",
                "",
                "Upload these release assets:",
                "",
                *[f"- `{asset['name']}` SHA256 `{asset['sha256']}`" for asset in release_manifest["assets"]],
                "",
                "Windows test flow:",
                "",
                "Recommended bootstrap flow:",
                "",
                "1. Download `bootstrap_github_release.ps1`.",
                "2. Run it in PowerShell. For a private repository, pass `-Token` or set `GITHUB_TOKEN`.",
                "3. Open `C:\\kubdee-affiliate`.",
                "4. Follow `WINDOWS_TEST_HANDOFF.md`.",
                "5. Run `14_first_run_diagnostics.cmd` on Windows.",
                "",
                "Manual fallback flow:",
                "",
                "1. Download the three transfer bundle assets.",
                "2. Run the transfer bundle verifier.",
                "3. Unzip the transfer bundle.",
                "4. Run the package verifier.",
                "5. Unzip the package to `C:\\kubdee-affiliate`.",
                "",
                "This release was statically validated only. Runtime testing belongs on the Windows machine.",
                "",
            ]
        ),
        encoding="utf-8",
    )

    print(json.dumps({"releaseManifest": str(manifest_path), "releaseNotes": str(notes_path)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
