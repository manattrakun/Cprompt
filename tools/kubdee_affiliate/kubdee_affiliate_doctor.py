#!/usr/bin/env python3
"""Environment checker for the Kubdee affiliate workflow."""

from __future__ import annotations

import argparse
import json
import os
import platform
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

from import_kubdee_catalog import DEFAULT_MAC_DB, DEFAULT_MAC_DATA_DIR


REQUIRED_FILES = (
    "tools/kubdee_affiliate/affiliate_pipeline.py",
    "tools/kubdee_affiliate/export_shopee_offers.py",
    "tools/kubdee_affiliate/import_kubdee_catalog.py",
    "tools/kubdee_affiliate/prepare_kubdee_pipeline.py",
    "tools/kubdee_affiliate/export_facebook_reel_queue.py",
    "tools/kubdee_affiliate/facebook_reels_draft.py",
)

WINDOWS_FILES = (
    "tools/kubdee_affiliate/windows/setup_worker_env.ps1",
    "tools/kubdee_affiliate/windows/check_windows_prerequisites.ps1",
    "tools/kubdee_affiliate/windows/kubdee_worker_common.ps1",
    "tools/kubdee_affiliate/windows/run_doctor.ps1",
    "tools/kubdee_affiliate/windows/run_affiliate_workflow.ps1",
    "tools/kubdee_affiliate/windows/run_affiliate_pipeline.ps1",
    "tools/kubdee_affiliate/windows/run_kubdee_import_review.ps1",
    "tools/kubdee_affiliate/windows/run_configured_workflow.ps1",
    "tools/kubdee_affiliate/windows/start_kubdee_debug.ps1",
    "tools/kubdee_affiliate/windows/export_facebook_queue.ps1",
    "tools/kubdee_affiliate/windows/start_chrome_debug.ps1",
    "tools/kubdee_affiliate/windows/run_facebook_reels_draft.ps1",
    "tools/kubdee_affiliate/windows/install_configured_scheduled_task.ps1",
    "tools/kubdee_affiliate/windows/run_windows_acceptance.ps1",
    "tools/kubdee_affiliate/windows/show_worker_status.ps1",
)


def check_file(path: Path, required: bool) -> dict[str, Any]:
    exists = path.exists()
    return {
        "path": str(path),
        "exists": exists,
        "required": required,
        "ok": exists or not required,
    }


def check_cdp(url: str) -> dict[str, Any]:
    endpoint = urllib.parse.urljoin(url.rstrip("/") + "/", "json/version")
    try:
        with urllib.request.urlopen(endpoint, timeout=3) as response:
            data = json.loads(response.read().decode("utf-8"))
        return {
            "url": url,
            "ok": True,
            "browser": data.get("Browser"),
            "userAgent": data.get("User-Agent"),
        }
    except (OSError, urllib.error.URLError, json.JSONDecodeError) as exc:
        return {
            "url": url,
            "ok": False,
            "error": str(exc),
        }


def default_windows_db() -> Path:
    appdata = os.environ.get("APPDATA")
    if appdata:
        return Path(appdata) / "Kubdee AI/data/kubdee.db"
    return DEFAULT_MAC_DB


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Check Kubdee affiliate workflow readiness")
    parser.add_argument("--project-root", type=Path, default=Path.cwd())
    parser.add_argument("--feed", type=Path, default=Path("data/product-feed.csv"))
    parser.add_argument("--offers-input", type=Path, default=Path("data/shopee-offers.txt"))
    parser.add_argument("--offers", type=Path, default=Path("data/offers.json"))
    parser.add_argument("--kubdee-db", type=Path, default=Path(os.environ.get("KUBDEE_DB_PATH", default_windows_db())))
    parser.add_argument("--kubdee-data-dir", type=Path, default=Path(os.environ.get("KUBDEE_DATA_DIR", DEFAULT_MAC_DATA_DIR)))
    parser.add_argument("--kubdee-cdp-url", default=os.environ.get("KUBDEE_CDP_URL", "http://127.0.0.1:19222"))
    parser.add_argument("--chrome-cdp-url", default=os.environ.get("CHROME_CDP_URL", "http://127.0.0.1:9222"))
    parser.add_argument("--strict", action="store_true", help="Exit non-zero when required checks fail")
    parser.add_argument("--output", type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = args.project_root.resolve()
    checks: dict[str, Any] = {
        "python": {
            "ok": sys.version_info >= (3, 9),
            "version": sys.version,
            "executable": sys.executable,
            "platform": platform.platform(),
        },
        "projectFiles": [check_file(root / path, True) for path in REQUIRED_FILES],
        "windowsFiles": [check_file(root / path, True) for path in WINDOWS_FILES],
        "inputs": {
            "feed": check_file(root / args.feed, False),
            "offersInput": check_file(root / args.offers_input, False),
            "offers": check_file(root / args.offers, False),
        },
        "kubdee": {
            "db": check_file(args.kubdee_db, True),
            "dataDir": check_file(args.kubdee_data_dir, True),
            "cdp": check_cdp(args.kubdee_cdp_url),
        },
        "chrome": {
            "cdp": check_cdp(args.chrome_cdp_url),
        },
    }
    checks["inputs"]["hasOfferSource"] = checks["inputs"]["offersInput"]["exists"] or checks["inputs"]["offers"]["exists"]

    required_ok = (
        checks["python"]["ok"]
        and all(item["ok"] for item in checks["projectFiles"])
        and all(item["ok"] for item in checks["windowsFiles"])
        and checks["kubdee"]["db"]["ok"]
        and checks["kubdee"]["dataDir"]["ok"]
    )
    checks["ok"] = bool(required_ok)
    checks["readyForCandidateScoring"] = checks["python"]["ok"] and all(item["ok"] for item in checks["projectFiles"])
    checks["readyForKubdeeImport"] = checks["ok"]
    checks["readyForKubdeePipelineApply"] = checks["ok"] and checks["kubdee"]["cdp"]["ok"]
    checks["readyForFacebookDraft"] = checks["chrome"]["cdp"]["ok"]

    text = json.dumps(checks, ensure_ascii=False, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
    print(text)
    return 1 if args.strict and not checks["ok"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
