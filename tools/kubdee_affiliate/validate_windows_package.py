#!/usr/bin/env python3
"""Validate a Kubdee affiliate Windows worker zip artifact."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path


REQUIRED_ENTRIES = (
    "README_FIRST.md",
    "START_HERE.cmd",
    "SETUP.cmd",
    "00_check_prerequisites.cmd",
    "00_prepare_sample_data.cmd",
    "01_setup_env.cmd",
    "02_doctor.cmd",
    "03_smoke_test.cmd",
    "04_daily_review.cmd",
    "05_install_daily_schedule.cmd",
    "06_start_kubdee_debug.cmd",
    "07_start_chrome_debug.cmd",
    "08_collect_support_bundle.cmd",
    "09_windows_acceptance.cmd",
    "10_full_acceptance_strict.cmd",
    "11_run_configured_workflow.cmd",
    "12_install_configured_schedule.cmd",
    "13_show_worker_status.cmd",
    "14_first_run_diagnostics.cmd",
    "PACKAGE_MANIFEST.json",
    "WINDOWS_TEST_RESULT_TEMPLATE.md",
    "WINDOWS_TEST_HANDOFF.md",
    "data/",
    "config/",
    "logs/",
    "outputs/",
    "config/worker.config.example.json",
    "docs/kubdee-affiliate/GITHUB_HANDOFF.md",
    "docs/kubdee-affiliate/WINDOWS_TEST_RESULT_TEMPLATE.md",
    "docs/kubdee-affiliate/WINDOWS_TEST_HANDOFF.md",
    "docs/kubdee-affiliate/WINDOWS_QUICKSTART.md",
    "tools/kubdee_affiliate/smoke_test.py",
    "tools/kubdee_affiliate/collect_support_bundle.py",
    "tools/kubdee_affiliate/prepare_github_release.py",
    "tools/kubdee_affiliate/validate_repo_hygiene.py",
    "tools/kubdee_affiliate/summarize_windows_support_bundle.py",
    "tools/kubdee_affiliate/test_summarize_windows_support_bundle.py",
    "tools/kubdee_affiliate/windows/check_windows_prerequisites.ps1",
    "tools/kubdee_affiliate/windows/collect_support_bundle.ps1",
    "tools/kubdee_affiliate/windows/install_configured_scheduled_task.ps1",
    "tools/kubdee_affiliate/windows/kubdee_worker_common.ps1",
    "tools/kubdee_affiliate/windows/run_affiliate_workflow.ps1",
    "tools/kubdee_affiliate/windows/run_configured_workflow.ps1",
    "tools/kubdee_affiliate/windows/run_first_run_diagnostics.ps1",
    "tools/kubdee_affiliate/windows/run_windows_acceptance.ps1",
    "tools/kubdee_affiliate/windows/show_worker_status.ps1",
)

REQUIRED_ENTRYPOINTS = {
    "windowsTestHandoff": "docs/kubdee-affiliate/WINDOWS_TEST_HANDOFF.md",
    "windowsTestResultTemplate": "docs/kubdee-affiliate/WINDOWS_TEST_RESULT_TEMPLATE.md",
    "startHere": "START_HERE.cmd",
    "prerequisites": "tools/kubdee_affiliate/windows/check_windows_prerequisites.ps1",
    "workflow": "tools/kubdee_affiliate/windows/run_affiliate_workflow.ps1",
    "configuredWorkflow": "tools/kubdee_affiliate/windows/run_configured_workflow.ps1",
    "configuredScheduler": "tools/kubdee_affiliate/windows/install_configured_scheduled_task.ps1",
    "acceptance": "tools/kubdee_affiliate/windows/run_windows_acceptance.ps1",
    "status": "tools/kubdee_affiliate/windows/show_worker_status.ps1",
    "firstRunDiagnostics": "tools/kubdee_affiliate/windows/run_first_run_diagnostics.ps1",
}

FORBIDDEN_ENTRIES = {
    "config/worker.config.json",
    "data/affiliate.db",
    "data/product-feed.csv",
    "data/shopee-offers.txt",
    "data/offers.json",
}

LAUNCHER_ROOT_FALLBACK = '..\\..\\..\\..\\tools\\kubdee_affiliate'

FIRST_RUN_DIAGNOSTICS_PATH = "tools/kubdee_affiliate/windows/run_first_run_diagnostics.ps1"
FIRST_RUN_LAUNCHER_PATH = "14_first_run_diagnostics.cmd"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate Kubdee affiliate Windows package")
    parser.add_argument("--package", required=True, type=Path)
    parser.add_argument("--checksum", type=Path)
    parser.add_argument("--skip-smoke", action="store_true")
    return parser.parse_args()


def validate_manifest(manifest: dict[str, object], names: set[str]) -> None:
    entrypoints = manifest.get("entrypoints", {})
    if not isinstance(entrypoints, dict):
        raise RuntimeError("manifest entrypoints must be an object")
    mismatches = {
        key: {"expected": expected, "actual": entrypoints.get(key)}
        for key, expected in REQUIRED_ENTRYPOINTS.items()
        if entrypoints.get(key) != expected
    }
    if mismatches:
        raise RuntimeError(f"manifest entrypoint mismatch: {json.dumps(mismatches, indent=2)}")
    missing_entrypoint_files = [path for path in REQUIRED_ENTRYPOINTS.values() if path not in names]
    if missing_entrypoint_files:
        raise RuntimeError(f"manifest entrypoint files missing from package: {missing_entrypoint_files}")


def validate_config_template(archive: zipfile.ZipFile) -> None:
    config = json.loads(archive.read("config/worker.config.example.json"))
    jobs = config.get("jobs")
    if not isinstance(jobs, list) or not jobs:
        raise RuntimeError("config/worker.config.example.json must contain a non-empty jobs array")
    first_job = jobs[0]
    if first_job.get("stage") != "Review" or first_job.get("commitImport") is not False:
        raise RuntimeError("config example must default to review-only and commitImport=false")


def validate_cmd_launchers(archive: zipfile.ZipFile, names: set[str]) -> None:
    cmd_entries = sorted(name for name in names if name.endswith(".cmd"))
    bad_launchers = []
    for name in cmd_entries:
        text = archive.read(name).decode("utf-8")
        if LAUNCHER_ROOT_FALLBACK not in text:
            bad_launchers.append(name)
    if bad_launchers:
        raise RuntimeError(f"cmd launchers missing root fallback: {bad_launchers}")


def read_archive_text(archive: zipfile.ZipFile, name: str) -> str:
    return archive.read(name).decode("utf-8")


def extract_powershell_params(text: str) -> set[str]:
    match = re.search(r"(?is)^\s*param\s*\(", text)
    if not match:
        return set()
    start = match.end()
    depth = 1
    index = start
    while index < len(text) and depth > 0:
        char = text[index]
        if char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
        index += 1
    if depth != 0:
        raise RuntimeError("unterminated PowerShell param block")
    param_block = text[start : index - 1]
    return {param.lower() for param in re.findall(r"\[.*?\]\s*\$([A-Za-z_][A-Za-z0-9_]*)", param_block)}


def validate_first_run_diagnostics(archive: zipfile.ZipFile) -> None:
    diagnostics = read_archive_text(archive, FIRST_RUN_DIAGNOSTICS_PATH)
    launcher = read_archive_text(archive, FIRST_RUN_LAUNCHER_PATH)
    support = read_archive_text(archive, "tools/kubdee_affiliate/collect_support_bundle.py")
    status = read_archive_text(archive, "tools/kubdee_affiliate/windows/show_worker_status.ps1")
    readme = read_archive_text(archive, "README_FIRST.md")
    quickstart = read_archive_text(archive, "docs/kubdee-affiliate/WINDOWS_QUICKSTART.md")
    github_handoff = read_archive_text(archive, "docs/kubdee-affiliate/GITHUB_HANDOFF.md")
    handoff = read_archive_text(archive, "WINDOWS_TEST_HANDOFF.md")
    test_result_template = read_archive_text(archive, "WINDOWS_TEST_RESULT_TEMPLATE.md")
    start_here = read_archive_text(archive, "START_HERE.cmd")

    required_fragments = {
        FIRST_RUN_LAUNCHER_PATH: [
            'cd /d "%~dp0"',
            LAUNCHER_ROOT_FALLBACK,
            "run_first_run_diagnostics.ps1",
            '-ProjectRoot "%CD%"',
        ],
        FIRST_RUN_DIAGNOSTICS_PATH: [
            "check_windows_prerequisites.ps1",
            "run_windows_acceptance.ps1",
            "show_worker_status.ps1",
            "collect_support_bundle.ps1",
            "first-run-diagnostics-$timestamp.json",
            "first-run-diagnostics-$timestamp.txt",
            "first-run-prerequisites-$timestamp.json",
            'Invoke-WorkerPowerShell -ScriptPath $script -ExtraArgs @("-Output", $prerequisiteReport)',
            "Invoke-WorkerPowerShell -ScriptPath $script -IncludePython",
        ],
        "tools/kubdee_affiliate/collect_support_bundle.py": [
            "outputs/first-run-diagnostics-*.json",
            "outputs/first-run-diagnostics-*.txt",
            "outputs/first-run-prerequisites-*.json",
            "outputs/worker-status-*.json",
        ],
        "tools/kubdee_affiliate/windows/show_worker_status.ps1": [
            "firstRunDiagnostics",
            "outputs\\first-run-diagnostics-*.json",
            "failedSteps",
        ],
        "README_FIRST.md": [
            "14_first_run_diagnostics.cmd",
            "outputs\\first-run-diagnostics-*.txt",
            "outputs\\support-bundle-*.zip",
            "WINDOWS_TEST_RESULT_TEMPLATE.md",
        ],
        "docs/kubdee-affiliate/WINDOWS_QUICKSTART.md": [
            "run_first_run_diagnostics.ps1",
            "14_first_run_diagnostics.cmd",
            "outputs\\first-run-diagnostics-*.txt",
            "outputs\\support-bundle-*.zip",
        ],
        "docs/kubdee-affiliate/GITHUB_HANDOFF.md": [
            "prepare_github_release.py",
            "summarize_windows_support_bundle.py",
            "test_summarize_windows_support_bundle.py",
            "validate_repo_hygiene.py",
            "GitHub Releases",
            ".gitattributes",
            "WINDOWS_TEST_RESULT_TEMPLATE.md",
            "dist\\github-release-assets.json",
            "dist\\github-release-notes.md",
            "dist\\",
            "config\\worker.config.json",
        ],
        "WINDOWS_TEST_HANDOFF.md": [
            "kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip",
            "kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip.sha256",
            "kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip.verify.cmd",
            "14_first_run_diagnostics.cmd",
            "outputs\\first-run-diagnostics-*.txt",
            "outputs\\support-bundle-*.zip",
            "diagnostics JSON is included in the support bundle",
        ],
        "WINDOWS_TEST_RESULT_TEMPLATE.md": [
            "Windows version:",
            "Transfer bundle verifier result:",
            "14_first_run_diagnostics.cmd completed:",
            "outputs\\first-run-diagnostics-*.txt path:",
            "outputs\\support-bundle-*.zip path:",
            "Attached support bundle zip:",
        ],
        "START_HERE.cmd": [
            "WINDOWS_TEST_HANDOFF.md",
        ],
    }
    texts = {
        FIRST_RUN_LAUNCHER_PATH: launcher,
        FIRST_RUN_DIAGNOSTICS_PATH: diagnostics,
        "tools/kubdee_affiliate/collect_support_bundle.py": support,
        "tools/kubdee_affiliate/windows/show_worker_status.ps1": status,
        "README_FIRST.md": readme,
        "docs/kubdee-affiliate/WINDOWS_QUICKSTART.md": quickstart,
        "docs/kubdee-affiliate/GITHUB_HANDOFF.md": github_handoff,
        "WINDOWS_TEST_HANDOFF.md": handoff,
        "WINDOWS_TEST_RESULT_TEMPLATE.md": test_result_template,
        "START_HERE.cmd": start_here,
    }
    missing_fragments = {
        name: [fragment for fragment in fragments if fragment not in texts[name]]
        for name, fragments in required_fragments.items()
    }
    missing_fragments = {name: fragments for name, fragments in missing_fragments.items() if fragments}
    if missing_fragments:
        raise RuntimeError(f"first-run diagnostics wiring missing fragments: {missing_fragments}")

    child_params = {
        "tools/kubdee_affiliate/windows/check_windows_prerequisites.ps1": {"projectroot", "kubdeedatadir", "output"},
        "tools/kubdee_affiliate/windows/run_windows_acceptance.ps1": {
            "projectroot",
            "python",
            "theme",
            "campaign",
            "profilename",
            "limit",
            "runkubdeereview",
            "strict",
        },
        "tools/kubdee_affiliate/windows/show_worker_status.ps1": {"projectroot"},
        "tools/kubdee_affiliate/windows/collect_support_bundle.ps1": {"projectroot", "python", "includepayloads"},
    }
    param_mismatches = {
        name: {"expected": sorted(expected), "actual": sorted(extract_powershell_params(read_archive_text(archive, name)))}
        for name, expected in child_params.items()
        if not expected.issubset(extract_powershell_params(read_archive_text(archive, name)))
    }
    if param_mismatches:
        raise RuntimeError(f"first-run diagnostics child parameter mismatch: {param_mismatches}")

    step_names = ("prerequisites", "acceptance", "status", "support_bundle")
    step_blocks = {
        name: re.search(
            rf'(?s)Invoke-DiagnosticStep -Name "{name}" -Action \{{(.*?)(?=\nInvoke-DiagnosticStep -Name |\n\$failed =)',
            diagnostics,
        )
        for name in step_names
    }
    missing_step_blocks = [name for name, match in step_blocks.items() if not match]
    if missing_step_blocks:
        raise RuntimeError(f"first-run diagnostics missing step blocks: {missing_step_blocks}")

    block_text = {name: match.group(1) for name, match in step_blocks.items() if match}
    if "-IncludePython" in block_text["prerequisites"] or "-IncludePython" in block_text["status"]:
        raise RuntimeError("first-run diagnostics must not pass -Python to prerequisites/status scripts")
    if "-IncludePython" not in block_text["acceptance"] or "-IncludePython" not in block_text["support_bundle"]:
        raise RuntimeError("first-run diagnostics must pass -Python to acceptance/support scripts when configured")
    if '-ExtraArgs @("-Output", $prerequisiteReport)' not in block_text["prerequisites"]:
        raise RuntimeError("first-run diagnostics prerequisites step must write first-run prerequisite report")


def validate_release_report_portability(report_path: Path, package_name: str) -> None:
    if not report_path.exists():
        raise RuntimeError(f"release report missing: {report_path}")

    report_text = report_path.read_text(encoding="utf-8")
    forbidden_fragments = ["/Users/", "\\Users\\", str(Path.home())]
    leaked_fragments = [fragment for fragment in forbidden_fragments if fragment and fragment in report_text]
    if leaked_fragments:
        raise RuntimeError(f"release report contains local absolute path fragments: {leaked_fragments}")

    report = json.loads(report_text)
    if report.get("packageName") != package_name:
        raise RuntimeError(
            f"release report packageName mismatch: expected {package_name}, got {report.get('packageName')}"
        )
    if report.get("windowsTestHandoff") != "docs/kubdee-affiliate/WINDOWS_TEST_HANDOFF.md":
        raise RuntimeError("release report windowsTestHandoff must be the package-relative docs path")
    if report.get("windowsTestHandoffBundleEntry") != "WINDOWS_TEST_HANDOFF.md":
        raise RuntimeError("release report windowsTestHandoffBundleEntry must match transfer bundle entry")
    if report.get("windowsTestResultTemplate") != "docs/kubdee-affiliate/WINDOWS_TEST_RESULT_TEMPLATE.md":
        raise RuntimeError("release report windowsTestResultTemplate must be the package-relative docs path")
    if report.get("windowsTestResultTemplateBundleEntry") != "WINDOWS_TEST_RESULT_TEMPLATE.md":
        raise RuntimeError("release report windowsTestResultTemplateBundleEntry must match transfer bundle entry")


def main() -> int:
    args = parse_args()
    if not args.package.exists():
        raise FileNotFoundError(f"package not found: {args.package}")
    checksum_path = args.checksum or args.package.with_suffix(args.package.suffix + ".sha256")
    checksum_ok = None
    verifier_ok = None
    transfer_guide_ok = None
    transfer_bundle_ok = None
    transfer_bundle_checksum_ok = None
    transfer_bundle_verifier_ok = None
    if checksum_path.exists():
        expected = checksum_path.read_text(encoding="utf-8").split()[0].strip().lower()
        actual = hashlib.sha256(args.package.read_bytes()).hexdigest()
        checksum_ok = expected == actual
        if not checksum_ok:
            raise RuntimeError(f"checksum mismatch: expected {expected}, got {actual}")
        verifier_path = args.package.with_suffix(args.package.suffix + ".verify.cmd")
        if not verifier_path.exists():
            raise RuntimeError(f"checksum verifier missing: {verifier_path}")
        verifier_text = verifier_path.read_text(encoding="utf-8")
        verifier_ok = args.package.name in verifier_text and checksum_path.name in verifier_text
        if not verifier_ok:
            raise RuntimeError(f"checksum verifier does not reference package/checksum names: {verifier_path}")
        transfer_guide_path = args.package.with_suffix(args.package.suffix + ".transfer.txt")
        if not transfer_guide_path.exists():
            raise RuntimeError(f"transfer guide missing: {transfer_guide_path}")
        transfer_guide_text = transfer_guide_path.read_text(encoding="utf-8")
        release_report_path = args.package.with_suffix(args.package.suffix + ".release.json")
        transfer_bundle_path = args.package.with_suffix(args.package.suffix + ".transfer-bundle.zip")
        transfer_bundle_checksum_path = transfer_bundle_path.with_suffix(transfer_bundle_path.suffix + ".sha256")
        transfer_bundle_verifier_path = transfer_bundle_path.with_suffix(
            transfer_bundle_path.suffix + ".verify.cmd"
        )
        required_transfer_mentions = [
            args.package.name,
            checksum_path.name,
            verifier_path.name,
            transfer_guide_path.name,
            release_report_path.name,
            "WINDOWS_TEST_HANDOFF.md",
            "WINDOWS_TEST_RESULT_TEMPLATE.md",
            transfer_bundle_path.name,
            transfer_bundle_checksum_path.name,
            transfer_bundle_verifier_path.name,
            "START_HERE.cmd",
            "00_check_prerequisites.cmd",
        ]
        missing_transfer_mentions = [
            item for item in required_transfer_mentions if item not in transfer_guide_text
        ]
        if missing_transfer_mentions:
            raise RuntimeError(
                f"transfer guide missing required mentions: {missing_transfer_mentions}"
            )
        transfer_guide_ok = True
        validate_release_report_portability(release_report_path, args.package.name)
        if not transfer_bundle_path.exists():
            raise RuntimeError(f"transfer bundle missing: {transfer_bundle_path}")
        if not transfer_bundle_checksum_path.exists():
            raise RuntimeError(f"transfer bundle checksum missing: {transfer_bundle_checksum_path}")
        if not transfer_bundle_verifier_path.exists():
            raise RuntimeError(f"transfer bundle verifier missing: {transfer_bundle_verifier_path}")
        transfer_bundle_verifier_text = transfer_bundle_verifier_path.read_text(encoding="utf-8")
        transfer_bundle_verifier_ok = (
            transfer_bundle_path.name in transfer_bundle_verifier_text
            and transfer_bundle_checksum_path.name in transfer_bundle_verifier_text
        )
        if not transfer_bundle_verifier_ok:
            raise RuntimeError(
                "transfer bundle verifier does not reference bundle/checksum names: "
                f"{transfer_bundle_verifier_path}"
            )
        expected_bundle_checksum = (
            transfer_bundle_checksum_path.read_text(encoding="utf-8").split()[0].strip().lower()
        )
        actual_bundle_checksum = hashlib.sha256(transfer_bundle_path.read_bytes()).hexdigest()
        transfer_bundle_checksum_ok = expected_bundle_checksum == actual_bundle_checksum
        if not transfer_bundle_checksum_ok:
            raise RuntimeError(
                "transfer bundle checksum mismatch: "
                f"expected {expected_bundle_checksum}, got {actual_bundle_checksum}"
            )
        expected_bundle_entries = {
            args.package.name,
            checksum_path.name,
            verifier_path.name,
            transfer_guide_path.name,
            release_report_path.name,
            "WINDOWS_TEST_HANDOFF.md",
            "WINDOWS_TEST_RESULT_TEMPLATE.md",
        }
        with zipfile.ZipFile(transfer_bundle_path) as transfer_bundle:
            bundle_entries = set(transfer_bundle.namelist())
        missing_bundle_entries = sorted(expected_bundle_entries - bundle_entries)
        if missing_bundle_entries:
            raise RuntimeError(
                f"transfer bundle missing required entries: {missing_bundle_entries}"
            )
        transfer_bundle_ok = True

    with zipfile.ZipFile(args.package) as archive:
        names = set(archive.namelist())
        missing = [name for name in REQUIRED_ENTRIES if name not in names]
        if missing:
            raise RuntimeError(f"missing package entries: {missing}")
        forbidden = sorted(FORBIDDEN_ENTRIES.intersection(names))
        if forbidden:
            raise RuntimeError(f"forbidden local data/config entries found in package: {forbidden}")
        manifest = json.loads(archive.read("PACKAGE_MANIFEST.json"))
        validate_manifest(manifest, names)
        validate_config_template(archive)
        validate_cmd_launchers(archive, names)
        validate_first_run_diagnostics(archive)

        if not args.skip_smoke:
            with tempfile.TemporaryDirectory(prefix="kubdee-package-validate-") as tmp:
                archive.extractall(tmp)
                result = subprocess.run(
                    [sys.executable, "tools/kubdee_affiliate/smoke_test.py"],
                    cwd=tmp,
                    text=True,
                    capture_output=True,
                )
                if result.returncode != 0:
                    raise RuntimeError(
                        json.dumps(
                            {
                                "smokeReturnCode": result.returncode,
                                "stdout": result.stdout,
                                "stderr": result.stderr,
                            },
                            ensure_ascii=False,
                            indent=2,
                        )
                    )
                shutil.rmtree(tmp, ignore_errors=True)

    checks = {
        "entries": len(REQUIRED_ENTRIES),
        "entrypoints": len(REQUIRED_ENTRYPOINTS),
        "forbiddenEntries": len(FORBIDDEN_ENTRIES),
        "firstRunDiagnostics": 1,
    }
    print(
        json.dumps(
            {
                "ok": True,
                "package": str(args.package),
                "entriesChecked": len(REQUIRED_ENTRIES),
                "checks": checks,
                "checksum": checksum_ok,
                "verifier": verifier_ok,
                "transferGuide": transfer_guide_ok,
                "transferBundle": transfer_bundle_ok,
                "transferBundleChecksum": transfer_bundle_checksum_ok,
                "transferBundleVerifier": transfer_bundle_verifier_ok,
                "smoke": not args.skip_smoke,
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
