#!/usr/bin/env python3
"""Collect troubleshooting files without bundling local DB/feed/video data."""

from __future__ import annotations

import argparse
import json
import platform
import sys
import time
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]

DEFAULT_PATTERNS = (
    "logs/*.log",
    "outputs/bootstrap-result.json",
    "outputs/prerequisites-*.json",
    "outputs/first-run-diagnostics-*.json",
    "outputs/first-run-diagnostics-*.txt",
    "outputs/first-run-prerequisites-*.json",
    "outputs/doctor-*.json",
    "outputs/acceptance-doctor-*.json",
    "outputs/windows-acceptance-*.json",
    "outputs/windows-acceptance-*.txt",
    "outputs/configured-workflow-*.json",
    "outputs/worker-status-*.json",
    "PACKAGE_MANIFEST.json",
    "README_FIRST.md",
    "*.release.json",
    "*.sha256",
    "config/*.example.json",
    "docs/kubdee-affiliate/*.md",
    "*.cmd",
    "tools/kubdee_affiliate/windows/*.ps1",
    "tools/kubdee_affiliate/windows/launchers/*.cmd",
)

PAYLOAD_PATTERNS = (
    "outputs/*.json",
    "outputs/*.txt",
)

EXCLUDE_PARTS = {"data", "__pycache__"}
EXCLUDE_SUFFIXES = {".db", ".sqlite", ".mp4", ".mov", ".png", ".jpg", ".jpeg", ".webp", ".csv"}


def should_include(root: Path, path: Path) -> bool:
    relative_path = path.relative_to(root)
    if any(part in EXCLUDE_PARTS for part in relative_path.parts):
        return False
    if path.suffix.lower() in EXCLUDE_SUFFIXES:
        return False
    return path.exists() and path.is_file()


def collect_files(root: Path, patterns: tuple[str, ...]) -> list[Path]:
    files: list[Path] = []
    for pattern in patterns:
        files.extend(path for path in root.glob(pattern) if should_include(root, path))
    return sorted(set(files))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Collect Kubdee affiliate support bundle")
    parser.add_argument("--project-root", type=Path, default=Path.cwd())
    parser.add_argument("--output", type=Path)
    parser.add_argument(
        "--include-payloads",
        action="store_true",
        help="Include outputs/*.json and outputs/*.txt. These files can contain product, page, or queue data.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = args.project_root.resolve()
    stamp = time.strftime("%Y%m%d-%H%M%S")
    output = args.output or root / "outputs" / f"support-bundle-{stamp}.zip"
    output.parent.mkdir(parents=True, exist_ok=True)

    patterns = DEFAULT_PATTERNS + (PAYLOAD_PATTERNS if args.include_payloads else ())
    files = collect_files(root, patterns)

    manifest = {
        "createdAt": stamp,
        "projectRoot": str(root),
        "platform": platform.platform(),
        "python": {
            "executable": sys.executable,
            "version": platform.python_version(),
        },
        "includePayloads": args.include_payloads,
        "files": sorted(str(path.relative_to(root)) for path in files),
        "excluded": {
            "directories": sorted(EXCLUDE_PARTS),
            "suffixes": sorted(EXCLUDE_SUFFIXES),
            "payloadsByDefault": sorted(PAYLOAD_PATTERNS),
        },
    }

    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("SUPPORT_BUNDLE_MANIFEST.json", json.dumps(manifest, ensure_ascii=False, indent=2))
        for path in sorted(set(files)):
            archive.write(path, str(path.relative_to(root)))

    print(json.dumps({"bundle": str(output), "files": len(set(files))}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
