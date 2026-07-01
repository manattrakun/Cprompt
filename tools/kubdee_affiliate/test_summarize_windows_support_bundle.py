#!/usr/bin/env python3
"""Synthetic checks for summarize_windows_support_bundle.py."""

from __future__ import annotations

import json
import tempfile
import zipfile
from pathlib import Path

from summarize_windows_support_bundle import items_by_status, summarize


def write_json(archive: zipfile.ZipFile, name: str, payload: dict[str, object]) -> None:
    archive.writestr(name, json.dumps(payload, indent=2))


def main() -> int:
    try:
        summarize(Path("missing-support-bundle.zip"))
    except FileNotFoundError:
        pass
    else:
        raise AssertionError("missing bundle must raise FileNotFoundError")

    assert items_by_status("not-list", "failed") == []
    assert items_by_status([{"status": "passed", "data": {"ignored": True}}, "bad"], "passed") == [
        {"name": "", "message": "", "exitCode": None, "data": None}
    ]

    with tempfile.TemporaryDirectory(prefix="kubdee-support-summary-") as tmp:
        bundle = Path(tmp) / "support-bundle.zip"
        with zipfile.ZipFile(bundle, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            write_json(
                archive,
                "SUPPORT_BUNDLE_MANIFEST.json",
                {
                    "createdAt": "20260701-120000",
                    "platform": "Windows-10",
                    "includePayloads": False,
                    "files": [
                        "outputs/bootstrap-result.json",
                        "outputs/first-run-diagnostics-20260701-120000.json",
                        "outputs/windows-acceptance-20260701-120000.json",
                        "outputs/worker-status-20260701-120000.json",
                    ],
                },
            )
            write_json(
                archive,
                "outputs/bootstrap-result.json",
                {
                    "ok": True,
                    "releaseTag": "kubdee-affiliate-worker-2026-07-01-bootstrap-hardened",
                    "extractRoot": "C:\\kubdee-affiliate",
                },
            )
            write_json(
                archive,
                "outputs/first-run-diagnostics-20260630-120000.json",
                {
                    "ok": True,
                    "nextStep": "Old report should not win.",
                    "steps": [],
                },
            )
            write_json(
                archive,
                "outputs/first-run-diagnostics-20260701-120000.json",
                {
                    "ok": False,
                    "nextStep": "Send support bundle.",
                    "steps": [
                        {"name": "project_root", "status": "passed", "exitCode": 0},
                        {"name": "acceptance", "status": "failed", "exitCode": 1, "message": "Doctor failed"},
                    ],
                },
            )
            write_json(
                archive,
                "outputs/first-run-prerequisites-20260701-120000.json",
                {"ok": True, "readyForFacebookDraft": False},
            )
            write_json(
                archive,
                "outputs/windows-acceptance-20260701-120000.json",
                {
                    "ok": False,
                    "basicOk": False,
                    "readyForReviewWorkflow": False,
                    "readyForKubdeePipelineApply": False,
                    "readyForFacebookDraft": False,
                    "results": [
                        {
                            "name": "doctor",
                            "status": "passed",
                            "data": {"readyForKubdeeImport": False},
                        },
                        {
                            "name": "input_files",
                            "status": "passed",
                            "data": {"feedExists": True, "readyForRealReview": False},
                        },
                        {"name": "kubdee_review_dry_run", "status": "skipped", "message": "Not ready"},
                    ],
                },
            )
            write_json(
                archive,
                "outputs/worker-status-20260701-120000.json",
                {"reports": [{"name": "acceptance", "exists": True, "ok": False}]},
            )

        summary = summarize(bundle)
        assert summary["ok"] is False
        assert summary["manifest"]["fileCount"] == 4
        assert summary["reports"]["bootstrap"] == "outputs/bootstrap-result.json"
        assert summary["readiness"]["bootstrapOk"] is True
        assert summary["readiness"]["bootstrapReleaseTag"] == "kubdee-affiliate-worker-2026-07-01-bootstrap-hardened"
        assert summary["readiness"]["bootstrapExtractRoot"] == "C:\\kubdee-affiliate"
        assert summary["readiness"]["prerequisitesOk"] is True
        assert summary["readiness"]["doctor"]["readyForKubdeeImport"] is False
        assert summary["readiness"]["inputFiles"]["feedExists"] is True
        assert summary["failures"]["firstRunSteps"][0]["name"] == "acceptance"
        assert summary["skipped"]["acceptanceCheckpoints"][0]["name"] == "kubdee_review_dry_run"
        assert summary["nextStep"] == "Send support bundle."
        assert summary["workerStatusReportCount"] == 1

        acceptance_only = Path(tmp) / "acceptance-only.zip"
        with zipfile.ZipFile(acceptance_only, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            archive.writestr(
                "SUPPORT_BUNDLE_MANIFEST.json",
                "\ufeff" + json.dumps({"createdAt": "20260701-130000", "files": "not-list"}),
            )
            write_json(
                archive,
                "outputs/windows-acceptance-20260701-130000.json",
                {
                    "ok": True,
                    "readyForReviewWorkflow": False,
                    "results": "not-list",
                },
            )
            write_json(
                archive,
                "outputs/worker-status-20260701-130000.json",
                {"reports": "not-list"},
            )

        acceptance_summary = summarize(acceptance_only)
        assert acceptance_summary["ok"] is True
        assert acceptance_summary["manifest"]["fileCount"] is None
        assert acceptance_summary["failures"]["acceptanceCheckpoints"] == []
        assert acceptance_summary["nextStep"] == "Review acceptance readiness and failed checkpoints."
        assert acceptance_summary["workerStatusReportCount"] is None

        missing_manifest = Path(tmp) / "missing-manifest.zip"
        with zipfile.ZipFile(missing_manifest, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            write_json(archive, "outputs/windows-acceptance-20260701-140000.json", {"ok": False, "results": []})
        missing_manifest_summary = summarize(missing_manifest)
        assert missing_manifest_summary["manifest"]["createdAt"] is None

    print(json.dumps({"ok": True, "test": "summarize_windows_support_bundle"}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
