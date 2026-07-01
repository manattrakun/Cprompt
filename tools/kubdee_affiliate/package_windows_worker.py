#!/usr/bin/env python3
"""Build a portable Windows worker zip for the Kubdee affiliate workflow."""

from __future__ import annotations

import argparse
import hashlib
import json
import time
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]

INCLUDE_FILES = (
    "docs/kubdee-affiliate/README_FIRST.md",
    "docs/kubdee-affiliate/GITHUB_HANDOFF.md",
    "docs/kubdee-affiliate/WINDOWS_TEST_RESULT_TEMPLATE.md",
    "docs/kubdee-affiliate/WINDOWS_TEST_HANDOFF.md",
    "docs/kubdee-affiliate/WINDOWS_QUICKSTART.md",
    "docs/kubdee-affiliate/importer-runbook.md",
    "docs/kubdee-affiliate/windows-worker-runbook.md",
    "config/worker.config.example.json",
    "tools/kubdee_affiliate/affiliate_pipeline.py",
    "tools/kubdee_affiliate/browser/shopee_offers_console_export.js",
    "tools/kubdee_affiliate/collect_support_bundle.py",
    "tools/kubdee_affiliate/export_facebook_reel_queue.py",
    "tools/kubdee_affiliate/export_shopee_offers.py",
    "tools/kubdee_affiliate/facebook_reels_draft.py",
    "tools/kubdee_affiliate/import_kubdee_catalog.py",
    "tools/kubdee_affiliate/kubdee_affiliate_doctor.py",
    "tools/kubdee_affiliate/package_windows_worker.py",
    "tools/kubdee_affiliate/prepare_github_release.py",
    "tools/kubdee_affiliate/prepare_kubdee_pipeline.py",
    "tools/kubdee_affiliate/sample_feed.csv",
    "tools/kubdee_affiliate/sample_products.json",
    "tools/kubdee_affiliate/sample_shop_offers.txt",
    "tools/kubdee_affiliate/smoke_test.py",
    "tools/kubdee_affiliate/summarize_windows_support_bundle.py",
    "tools/kubdee_affiliate/test_summarize_windows_support_bundle.py",
    "tools/kubdee_affiliate/validate_repo_hygiene.py",
    "tools/kubdee_affiliate/validate_windows_package.py",
    "tools/kubdee_affiliate/windows/check_windows_prerequisites.ps1",
    "tools/kubdee_affiliate/windows/export_facebook_queue.ps1",
    "tools/kubdee_affiliate/windows/collect_support_bundle.ps1",
    "tools/kubdee_affiliate/windows/install_configured_scheduled_task.ps1",
    "tools/kubdee_affiliate/windows/install_scheduled_task.ps1",
    "tools/kubdee_affiliate/windows/kubdee_worker_common.ps1",
    "tools/kubdee_affiliate/windows/launchers/START_HERE.cmd",
    "tools/kubdee_affiliate/windows/launchers/SETUP.cmd",
    "tools/kubdee_affiliate/windows/launchers/00_check_prerequisites.cmd",
    "tools/kubdee_affiliate/windows/launchers/00_prepare_sample_data.cmd",
    "tools/kubdee_affiliate/windows/launchers/01_setup_env.cmd",
    "tools/kubdee_affiliate/windows/launchers/02_doctor.cmd",
    "tools/kubdee_affiliate/windows/launchers/03_smoke_test.cmd",
    "tools/kubdee_affiliate/windows/launchers/04_daily_review.cmd",
    "tools/kubdee_affiliate/windows/launchers/05_install_daily_schedule.cmd",
    "tools/kubdee_affiliate/windows/launchers/06_start_kubdee_debug.cmd",
    "tools/kubdee_affiliate/windows/launchers/07_start_chrome_debug.cmd",
    "tools/kubdee_affiliate/windows/launchers/08_collect_support_bundle.cmd",
    "tools/kubdee_affiliate/windows/launchers/09_windows_acceptance.cmd",
    "tools/kubdee_affiliate/windows/launchers/10_full_acceptance_strict.cmd",
    "tools/kubdee_affiliate/windows/launchers/11_run_configured_workflow.cmd",
    "tools/kubdee_affiliate/windows/launchers/12_install_configured_schedule.cmd",
    "tools/kubdee_affiliate/windows/launchers/13_show_worker_status.cmd",
    "tools/kubdee_affiliate/windows/launchers/14_first_run_diagnostics.cmd",
    "tools/kubdee_affiliate/windows/run_affiliate_pipeline.ps1",
    "tools/kubdee_affiliate/windows/run_affiliate_workflow.ps1",
    "tools/kubdee_affiliate/windows/run_configured_workflow.ps1",
    "tools/kubdee_affiliate/windows/run_doctor.ps1",
    "tools/kubdee_affiliate/windows/run_facebook_reels_draft.ps1",
    "tools/kubdee_affiliate/windows/run_first_run_diagnostics.ps1",
    "tools/kubdee_affiliate/windows/run_kubdee_import_review.ps1",
    "tools/kubdee_affiliate/windows/run_windows_acceptance.ps1",
    "tools/kubdee_affiliate/windows/setup_worker_env.ps1",
    "tools/kubdee_affiliate/windows/show_worker_status.ps1",
    "tools/kubdee_affiliate/windows/start_chrome_debug.ps1",
    "tools/kubdee_affiliate/windows/start_kubdee_debug.ps1",
)

EMPTY_DIRS = (
    "data/",
    "config/",
    "logs/",
    "outputs/",
)

ROOT_COPIES = {
    "README_FIRST.md": "docs/kubdee-affiliate/README_FIRST.md",
    "WINDOWS_TEST_RESULT_TEMPLATE.md": "docs/kubdee-affiliate/WINDOWS_TEST_RESULT_TEMPLATE.md",
    "WINDOWS_TEST_HANDOFF.md": "docs/kubdee-affiliate/WINDOWS_TEST_HANDOFF.md",
    "START_HERE.cmd": "tools/kubdee_affiliate/windows/launchers/START_HERE.cmd",
    "SETUP.cmd": "tools/kubdee_affiliate/windows/launchers/SETUP.cmd",
    "00_check_prerequisites.cmd": "tools/kubdee_affiliate/windows/launchers/00_check_prerequisites.cmd",
    "00_prepare_sample_data.cmd": "tools/kubdee_affiliate/windows/launchers/00_prepare_sample_data.cmd",
    "01_setup_env.cmd": "tools/kubdee_affiliate/windows/launchers/01_setup_env.cmd",
    "02_doctor.cmd": "tools/kubdee_affiliate/windows/launchers/02_doctor.cmd",
    "03_smoke_test.cmd": "tools/kubdee_affiliate/windows/launchers/03_smoke_test.cmd",
    "04_daily_review.cmd": "tools/kubdee_affiliate/windows/launchers/04_daily_review.cmd",
    "05_install_daily_schedule.cmd": "tools/kubdee_affiliate/windows/launchers/05_install_daily_schedule.cmd",
    "06_start_kubdee_debug.cmd": "tools/kubdee_affiliate/windows/launchers/06_start_kubdee_debug.cmd",
    "07_start_chrome_debug.cmd": "tools/kubdee_affiliate/windows/launchers/07_start_chrome_debug.cmd",
    "08_collect_support_bundle.cmd": "tools/kubdee_affiliate/windows/launchers/08_collect_support_bundle.cmd",
    "09_windows_acceptance.cmd": "tools/kubdee_affiliate/windows/launchers/09_windows_acceptance.cmd",
    "10_full_acceptance_strict.cmd": "tools/kubdee_affiliate/windows/launchers/10_full_acceptance_strict.cmd",
    "11_run_configured_workflow.cmd": "tools/kubdee_affiliate/windows/launchers/11_run_configured_workflow.cmd",
    "12_install_configured_schedule.cmd": "tools/kubdee_affiliate/windows/launchers/12_install_configured_schedule.cmd",
    "13_show_worker_status.cmd": "tools/kubdee_affiliate/windows/launchers/13_show_worker_status.cmd",
    "14_first_run_diagnostics.cmd": "tools/kubdee_affiliate/windows/launchers/14_first_run_diagnostics.cmd",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build Kubdee affiliate Windows worker package")
    parser.add_argument("--output", type=Path, default=ROOT / "dist")
    parser.add_argument("--name", default="")
    parser.add_argument("--no-checksum", action="store_true")
    return parser.parse_args()


def portable_path(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(ROOT))
    except ValueError:
        return str(path)


def main() -> int:
    args = parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    package_name = args.name or f"kubdee-affiliate-windows-worker-{stamp}.zip"
    package_path = args.output / package_name

    manifest = {
        "createdAt": stamp,
        "files": list(INCLUDE_FILES),
        "rootCopies": ROOT_COPIES,
        "emptyDirs": list(EMPTY_DIRS),
        "entrypoints": {
            "quickstart": "docs/kubdee-affiliate/WINDOWS_QUICKSTART.md",
            "windowsTestHandoff": "docs/kubdee-affiliate/WINDOWS_TEST_HANDOFF.md",
            "windowsTestResultTemplate": "docs/kubdee-affiliate/WINDOWS_TEST_RESULT_TEMPLATE.md",
            "startHere": "START_HERE.cmd",
            "prerequisites": "tools/kubdee_affiliate/windows/check_windows_prerequisites.ps1",
            "setup": "tools/kubdee_affiliate/windows/setup_worker_env.ps1",
            "doctor": "tools/kubdee_affiliate/windows/run_doctor.ps1",
            "workflow": "tools/kubdee_affiliate/windows/run_affiliate_workflow.ps1",
            "configuredWorkflow": "tools/kubdee_affiliate/windows/run_configured_workflow.ps1",
            "configuredScheduler": "tools/kubdee_affiliate/windows/install_configured_scheduled_task.ps1",
            "scheduler": "tools/kubdee_affiliate/windows/install_scheduled_task.ps1",
            "smokeTest": "tools/kubdee_affiliate/smoke_test.py",
            "status": "tools/kubdee_affiliate/windows/show_worker_status.ps1",
            "acceptance": "tools/kubdee_affiliate/windows/run_windows_acceptance.ps1",
            "firstRunDiagnostics": "tools/kubdee_affiliate/windows/run_first_run_diagnostics.ps1",
        },
    }

    missing = [path for path in INCLUDE_FILES if not (ROOT / path).exists()]
    missing.extend(source for source in ROOT_COPIES.values() if not (ROOT / source).exists())
    if missing:
        raise FileNotFoundError(f"missing package files: {missing}")

    with zipfile.ZipFile(package_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for directory in EMPTY_DIRS:
            archive.writestr(directory, "")
        for path in INCLUDE_FILES:
            archive.write(ROOT / path, path)
        for target, source in ROOT_COPIES.items():
            archive.write(ROOT / source, target)
        archive.writestr("PACKAGE_MANIFEST.json", json.dumps(manifest, ensure_ascii=False, indent=2))

    checksum_path = None
    checksum = None
    verifier_path = None
    transfer_guide_path = None
    transfer_bundle_path = None
    transfer_bundle_checksum_path = None
    transfer_bundle_verifier_path = None
    windows_test_handoff_path = ROOT / "docs/kubdee-affiliate/WINDOWS_TEST_HANDOFF.md"
    windows_test_result_template_path = ROOT / "docs/kubdee-affiliate/WINDOWS_TEST_RESULT_TEMPLATE.md"
    windows_test_handoff_manifest_path = "docs/kubdee-affiliate/WINDOWS_TEST_HANDOFF.md"
    windows_test_result_template_manifest_path = "docs/kubdee-affiliate/WINDOWS_TEST_RESULT_TEMPLATE.md"
    release_report_path = package_path.with_suffix(package_path.suffix + ".release.json")
    if not args.no_checksum:
        checksum = hashlib.sha256(package_path.read_bytes()).hexdigest()
        checksum_path = package_path.with_suffix(package_path.suffix + ".sha256")
        checksum_path.write_text(f"{checksum}  {package_path.name}\n", encoding="utf-8")
        verifier_path = package_path.with_suffix(package_path.suffix + ".verify.cmd")
        verifier_path.write_text(
            "\n".join(
                [
                    "@echo off",
                    "setlocal",
                    f'set "ZIP=%~dp0{package_path.name}"',
                    f'set "SHA=%~dp0{checksum_path.name}"',
                    'if not exist "%ZIP%" (',
                    '  echo Missing package: "%ZIP%"',
                    "  pause",
                    "  exit /b 1",
                    ")",
                    'if not exist "%SHA%" (',
                    '  echo Missing checksum: "%SHA%"',
                    "  pause",
                    "  exit /b 1",
                    ")",
                    'powershell -NoProfile -ExecutionPolicy Bypass -Command "$expected=(Get-Content -Raw $env:SHA).Trim().Split()[0].ToLowerInvariant(); $actual=(Get-FileHash -Algorithm SHA256 $env:ZIP).Hash.ToLowerInvariant(); Write-Host (\'Expected: \' + $expected); Write-Host (\'Actual:   \' + $actual); if ($actual -ne $expected) { Write-Error \'Checksum mismatch\'; exit 1 }"',
                    "if errorlevel 1 (",
                    "  pause",
                    "  exit /b 1",
                    ")",
                    "echo Checksum OK.",
                    "pause",
                    "",
                ]
            ),
            encoding="utf-8",
        )
        transfer_guide_path = package_path.with_suffix(package_path.suffix + ".transfer.txt")
        transfer_bundle_path = package_path.with_suffix(package_path.suffix + ".transfer-bundle.zip")
        transfer_bundle_checksum_path = transfer_bundle_path.with_suffix(transfer_bundle_path.suffix + ".sha256")
        transfer_bundle_verifier_path = transfer_bundle_path.with_suffix(
            transfer_bundle_path.suffix + ".verify.cmd"
        )
        transfer_guide_path.write_text(
            "\n".join(
                [
                    "Kubdee Affiliate Windows Worker Transfer Checklist",
                    "",
                    "Option A: copy these transfer bundle files to Windows together:",
                    f"- {transfer_bundle_path.name}",
                    f"- {transfer_bundle_checksum_path.name}",
                    f"- {transfer_bundle_verifier_path.name}",
                    "",
                    f"Then double-click {transfer_bundle_verifier_path.name} before unzipping the bundle.",
                    "",
                    "Option B: copy these files to the Windows machine together:",
                    f"- {package_path.name}",
                    f"- {checksum_path.name}",
                    f"- {verifier_path.name}",
                    f"- {transfer_guide_path.name}",
                    f"- {release_report_path.name}",
                    f"- {windows_test_handoff_path.name}",
                    f"- {windows_test_result_template_path.name}",
                    "",
                    "On Windows:",
                    f"1. Double-click {verifier_path.name}.",
                    "2. Continue only if it prints: Checksum OK.",
                    "3. Unzip the package to C:\\kubdee-affiliate.",
                    "4. Double-click START_HERE.cmd inside C:\\kubdee-affiliate.",
                    "5. Run 00_check_prerequisites.cmd first.",
                    "",
                    f"Expected SHA256: {checksum}",
                    "",
                ]
            ),
            encoding="utf-8",
        )

    release_report = {
        "package": portable_path(package_path),
        "packageName": package_path.name,
        "sha256": checksum,
        "checksum": portable_path(checksum_path) if checksum_path else None,
        "verifier": portable_path(verifier_path) if verifier_path else None,
        "transferGuide": portable_path(transfer_guide_path) if transfer_guide_path else None,
        "transferBundle": portable_path(transfer_bundle_path) if transfer_bundle_path else None,
        "transferBundleChecksum": portable_path(transfer_bundle_checksum_path) if transfer_bundle_checksum_path else None,
        "transferBundleVerifier": portable_path(transfer_bundle_verifier_path) if transfer_bundle_verifier_path else None,
        "windowsTestHandoff": windows_test_handoff_manifest_path,
        "windowsTestHandoffBundleEntry": windows_test_handoff_path.name,
        "windowsTestResultTemplate": windows_test_result_template_manifest_path,
        "windowsTestResultTemplateBundleEntry": windows_test_result_template_path.name,
        "manifest": manifest,
    }
    release_report_path.write_text(json.dumps(release_report, ensure_ascii=False, indent=2), encoding="utf-8")

    if transfer_bundle_path and checksum_path and verifier_path and transfer_guide_path:
        with zipfile.ZipFile(transfer_bundle_path, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
            for artifact in (
                package_path,
                checksum_path,
                verifier_path,
                transfer_guide_path,
                release_report_path,
                windows_test_handoff_path,
                windows_test_result_template_path,
            ):
                bundle.write(artifact, artifact.name)
        if transfer_bundle_checksum_path:
            transfer_bundle_checksum = hashlib.sha256(transfer_bundle_path.read_bytes()).hexdigest()
            transfer_bundle_checksum_path.write_text(
                f"{transfer_bundle_checksum}  {transfer_bundle_path.name}\n",
                encoding="utf-8",
            )
            if transfer_bundle_verifier_path:
                transfer_bundle_verifier_path.write_text(
                    "\n".join(
                        [
                            "@echo off",
                            "setlocal",
                            f'set "ZIP=%~dp0{transfer_bundle_path.name}"',
                            f'set "SHA=%~dp0{transfer_bundle_checksum_path.name}"',
                            'if not exist "%ZIP%" (',
                            '  echo Missing transfer bundle: "%ZIP%"',
                            "  pause",
                            "  exit /b 1",
                            ")",
                            'if not exist "%SHA%" (',
                            '  echo Missing transfer bundle checksum: "%SHA%"',
                            "  pause",
                            "  exit /b 1",
                            ")",
                            'powershell -NoProfile -ExecutionPolicy Bypass -Command "$expected=(Get-Content -Raw $env:SHA).Trim().Split()[0].ToLowerInvariant(); $actual=(Get-FileHash -Algorithm SHA256 $env:ZIP).Hash.ToLowerInvariant(); Write-Host (\'Expected: \' + $expected); Write-Host (\'Actual:   \' + $actual); if ($actual -ne $expected) { Write-Error \'Transfer bundle checksum mismatch\'; exit 1 }"',
                            "if errorlevel 1 (",
                            "  pause",
                            "  exit /b 1",
                            ")",
                            "echo Transfer bundle checksum OK.",
                            "pause",
                            "",
                        ]
                    ),
                    encoding="utf-8",
                )

    print(
        json.dumps(
            {
                "package": portable_path(package_path),
                "sha256": checksum,
                "checksum": portable_path(checksum_path) if checksum_path else None,
                "verifier": portable_path(verifier_path) if verifier_path else None,
                "transferGuide": portable_path(transfer_guide_path) if transfer_guide_path else None,
                "transferBundle": portable_path(transfer_bundle_path) if transfer_bundle_path else None,
                "transferBundleChecksum": portable_path(transfer_bundle_checksum_path) if transfer_bundle_checksum_path else None,
                "transferBundleVerifier": portable_path(transfer_bundle_verifier_path) if transfer_bundle_verifier_path else None,
                "windowsTestHandoff": windows_test_handoff_manifest_path,
                "windowsTestHandoffBundleEntry": windows_test_handoff_path.name,
                "windowsTestResultTemplate": windows_test_result_template_manifest_path,
                "windowsTestResultTemplateBundleEntry": windows_test_result_template_path.name,
                "releaseReport": portable_path(release_report_path),
                "files": len(INCLUDE_FILES),
                "rootCopies": len(ROOT_COPIES),
                "emptyDirs": len(EMPTY_DIRS),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
