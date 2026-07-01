#!/usr/bin/env python3
"""Summarize a returned Windows support bundle."""

from __future__ import annotations

import argparse
import json
import zipfile
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Summarize Kubdee affiliate Windows support bundle")
    parser.add_argument("bundle", type=Path)
    return parser.parse_args()


def read_json(archive: zipfile.ZipFile, name: str) -> dict[str, Any] | None:
    try:
        return json.loads(archive.read(name).decode("utf-8-sig"))
    except KeyError:
        return None


def latest_name(names: list[str], prefix: str, suffix: str = ".json") -> str | None:
    matches = sorted(name for name in names if name.startswith(prefix) and name.endswith(suffix))
    return matches[-1] if matches else None


def items_by_status(items: Any, status: str) -> list[dict[str, Any]]:
    if not isinstance(items, list):
        return []
    matches = []
    for item in items:
        if not isinstance(item, dict) or item.get("status") != status:
            continue
        matches.append(
            {
                "name": item.get("name", ""),
                "message": item.get("message", ""),
                "exitCode": item.get("exitCode"),
                "data": item.get("data") if status != "passed" else None,
            }
        )
    return matches


def result_data(results: Any, name: str) -> Any:
    if not isinstance(results, list):
        return None
    for item in results:
        if isinstance(item, dict) and item.get("name") == name:
            return item.get("data")
    return None


def summarize(bundle: Path) -> dict[str, Any]:
    if not bundle.exists():
        raise FileNotFoundError(f"support bundle not found: {bundle}")

    with zipfile.ZipFile(bundle) as archive:
        names = archive.namelist()
        manifest = read_json(archive, "SUPPORT_BUNDLE_MANIFEST.json") or {}
        bootstrap_name = "outputs/bootstrap-result.json" if "outputs/bootstrap-result.json" in names else None
        first_run_name = latest_name(names, "outputs/first-run-diagnostics-")
        acceptance_name = latest_name(names, "outputs/windows-acceptance-")
        worker_status_name = latest_name(names, "outputs/worker-status-")
        prerequisites_name = latest_name(names, "outputs/first-run-prerequisites-") or latest_name(
            names, "outputs/prerequisites-"
        )

        bootstrap = read_json(archive, bootstrap_name) if bootstrap_name else None
        first_run = read_json(archive, first_run_name) if first_run_name else None
        acceptance = read_json(archive, acceptance_name) if acceptance_name else None
        worker_status = read_json(archive, worker_status_name) if worker_status_name else None
        prerequisites = read_json(archive, prerequisites_name) if prerequisites_name else None

    first_run_steps = first_run.get("steps") if first_run else []
    acceptance_results = acceptance.get("results") if acceptance else []
    first_run_failures = items_by_status(first_run_steps, "failed")
    acceptance_failures = items_by_status(acceptance_results, "failed")
    acceptance_skipped = items_by_status(acceptance_results, "skipped")
    doctor_readiness = result_data(acceptance_results, "doctor")
    input_readiness = result_data(acceptance_results, "input_files")
    next_step = ""
    if first_run and first_run.get("nextStep"):
        next_step = str(first_run["nextStep"])
    elif acceptance and not acceptance.get("readyForReviewWorkflow", False):
        next_step = "Review acceptance readiness and failed checkpoints."

    return {
        "ok": bool(first_run.get("ok")) if first_run else bool(acceptance.get("ok")) if acceptance else False,
        "bundle": str(bundle),
        "manifest": {
            "createdAt": manifest.get("createdAt"),
            "platform": manifest.get("platform"),
            "includePayloads": manifest.get("includePayloads"),
            "fileCount": len(manifest.get("files", [])) if isinstance(manifest.get("files"), list) else None,
        },
        "reports": {
            "bootstrap": bootstrap_name,
            "firstRunDiagnostics": first_run_name,
            "acceptance": acceptance_name,
            "workerStatus": worker_status_name,
            "prerequisites": prerequisites_name,
        },
        "readiness": {
            "bootstrapOk": bootstrap.get("ok") if bootstrap else None,
            "bootstrapReleaseTag": bootstrap.get("releaseTag") if bootstrap else None,
            "bootstrapExtractRoot": bootstrap.get("extractRoot") if bootstrap else None,
            "firstRunOk": first_run.get("ok") if first_run else None,
            "acceptanceOk": acceptance.get("ok") if acceptance else None,
            "basicOk": acceptance.get("basicOk") if acceptance else None,
            "readyForReviewWorkflow": acceptance.get("readyForReviewWorkflow") if acceptance else None,
            "readyForKubdeePipelineApply": acceptance.get("readyForKubdeePipelineApply") if acceptance else None,
            "readyForFacebookDraft": acceptance.get("readyForFacebookDraft") if acceptance else None,
            "prerequisitesOk": prerequisites.get("ok") if prerequisites else None,
            "doctor": doctor_readiness,
            "inputFiles": input_readiness,
        },
        "failures": {
            "firstRunSteps": first_run_failures,
            "acceptanceCheckpoints": acceptance_failures,
        },
        "skipped": {
            "acceptanceCheckpoints": acceptance_skipped,
        },
        "nextStep": next_step,
        "workerStatusReportCount": len(worker_status.get("reports", []))
        if isinstance(worker_status, dict) and isinstance(worker_status.get("reports"), list)
        else None,
    }


def main() -> int:
    args = parse_args()
    print(json.dumps(summarize(args.bundle), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
