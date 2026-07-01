#!/usr/bin/env python3
"""Run local smoke tests for the Kubdee affiliate workflow."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def run(command: list[str]) -> None:
    result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
    if result.returncode != 0:
        raise RuntimeError(
            json.dumps(
                {
                    "command": command,
                    "returncode": result.returncode,
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                },
                ensure_ascii=False,
                indent=2,
            )
        )


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="kubdee-affiliate-smoke-") as tmp:
        tmp_path = Path(tmp)
        db = tmp_path / "affiliate.db"
        offers = tmp_path / "offers.json"
        candidates = tmp_path / "candidates.json"
        facebook_queue = tmp_path / "facebook-queue.json"
        facebook_draft_report = tmp_path / "facebook-draft-report.json"
        dummy_video = tmp_path / "sample.mp4"
        dummy_video.write_bytes(b"not a real video; dry-run only")

        run([sys.executable, "tools/kubdee_affiliate/export_shopee_offers.py", "--input", "tools/kubdee_affiliate/sample_shop_offers.txt", "--output", str(offers), "--min-commission", "8"])
        run([sys.executable, "tools/kubdee_affiliate/affiliate_pipeline.py", "--db", str(db), "init-db"])
        run([sys.executable, "tools/kubdee_affiliate/affiliate_pipeline.py", "--db", str(db), "ingest-feed", "--feed", "tools/kubdee_affiliate/sample_feed.csv", "--feed-date", "2026-06-30"])
        run([sys.executable, "tools/kubdee_affiliate/affiliate_pipeline.py", "--db", str(db), "ingest-offers", "--input", str(offers), "--source", "smoke-test"])
        run([
            sys.executable,
            "tools/kubdee_affiliate/affiliate_pipeline.py",
            "--db",
            str(db),
            "export",
            "--campaign",
            "smoke-rainy",
            "--theme",
            "rainy",
            "--require-offer",
            "--min-commission",
            "8",
            "--min-sold",
            "10",
            "--min-rating",
            "4.5",
            "--min-stock",
            "1",
            "--min-score",
            "30",
            "--limit",
            "10",
            "--output",
            str(candidates),
        ])

        exported = json.loads(candidates.read_text(encoding="utf-8"))
        if len(exported) != 1 or exported[0].get("commission_rate") != 12.0:
            raise RuntimeError(f"unexpected candidate export: {exported}")

        kubdee_db = ROOT / "tools/kubdee_affiliate/nonexistent-kubdee.db"
        result = subprocess.run(
            [
                sys.executable,
                "tools/kubdee_affiliate/import_kubdee_catalog.py",
                "--db-path",
                str(kubdee_db),
                "--input",
                str(candidates),
                "--theme",
                "rainy",
                "--dry-run",
            ],
            cwd=ROOT,
            text=True,
            capture_output=True,
        )
        if result.returncode != 2 or "Kubdee DB not found" not in result.stderr:
            raise RuntimeError("expected missing Kubdee DB guard to fail clearly")

        facebook_queue.write_text(
            json.dumps(
                {
                    "items": [
                        {
                            "queue_id": "smoke:1",
                            "status": "ready_for_draft",
                            "video": {"path": str(dummy_video)},
                            "post": {"caption": "smoke caption"},
                        }
                    ]
                },
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        run([sys.executable, "tools/kubdee_affiliate/facebook_reels_draft.py", "--queue", str(facebook_queue), "--output-report", str(facebook_draft_report), "--mode", "dry-run"])

        report = json.loads(facebook_draft_report.read_text(encoding="utf-8"))
        if report["results"][0]["status"] != "dry_run_ok":
            raise RuntimeError(f"unexpected Facebook dry-run report: {report}")

    print(json.dumps({"ok": True, "tests": "smoke"}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
