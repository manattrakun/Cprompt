#!/usr/bin/env python3
"""Validate that private/generated worker files are not tracked by git."""

from __future__ import annotations

import fnmatch
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]

FORBIDDEN_PATTERNS = (
    ".DS_Store",
    "**/.DS_Store",
    ".codex/**",
    "dist/**",
    "build/**",
    "cache/**",
    "graphify-out/**",
    "data/**",
    "db/**",
    "real/**",
    "media/**",
    "logs/**",
    "outputs/**",
    "config/worker.config.json",
    "*.db",
    "*.sqlite",
    "*.sqlite3",
    "*.mp4",
    "*.mov",
    "*.webm",
    "*.csv",
    "*.log",
    "*.cache",
    "*.tmp",
    "*.bak",
)

ALLOWED_PATTERNS = (
    "tools/kubdee_affiliate/sample_feed.csv",
)

REQUIRED_GITATTRIBUTES = (
    "*.cmd text eol=crlf",
    "*.ps1 text eol=crlf",
    "*.py text eol=lf",
    "*.md text eol=lf",
    "*.json text eol=lf",
    "*.zip binary",
)

WORKFLOW_PATH = ROOT / ".github/workflows/kubdee-worker-static.yml"
REQUIRED_WORKFLOW_FRAGMENTS = (
    "actions/checkout@v4",
    "actions/setup-python@v5",
    "python3 tools/kubdee_affiliate/prepare_github_release.py",
    "actions/upload-artifact@v4",
    "dist/kubdee-affiliate-windows-worker-latest.zip.transfer-bundle.zip",
    "dist/github-release-assets.json",
    "dist/github-release-notes.md",
)


def run_git_ls_files() -> list[str]:
    result = subprocess.run(
        ["git", "ls-files"],
        cwd=ROOT,
        check=True,
        text=True,
        capture_output=True,
    )
    return [line.strip() for line in result.stdout.splitlines() if line.strip()]


def matches_any(path: str, patterns: tuple[str, ...]) -> bool:
    return any(fnmatch.fnmatch(path, pattern) for pattern in patterns)


def main() -> int:
    tracked_files = run_git_ls_files()
    gitattributes = ROOT / ".gitattributes"
    gitattributes_text = gitattributes.read_text(encoding="utf-8") if gitattributes.exists() else ""
    missing_gitattributes = [
        rule for rule in REQUIRED_GITATTRIBUTES if rule not in gitattributes_text
    ]
    workflow_text = WORKFLOW_PATH.read_text(encoding="utf-8") if WORKFLOW_PATH.exists() else ""
    missing_workflow_fragments = [
        fragment for fragment in REQUIRED_WORKFLOW_FRAGMENTS if fragment not in workflow_text
    ]
    forbidden = sorted(
        path
        for path in tracked_files
        if matches_any(path, FORBIDDEN_PATTERNS) and not matches_any(path, ALLOWED_PATTERNS)
    )
    report = {
        "ok": not forbidden and not missing_gitattributes and not missing_workflow_fragments,
        "forbiddenTrackedFiles": forbidden,
        "forbiddenPatterns": list(FORBIDDEN_PATTERNS),
        "allowedPatterns": list(ALLOWED_PATTERNS),
        "missingGitattributes": missing_gitattributes,
        "missingWorkflowFragments": missing_workflow_fragments,
    }
    print(json.dumps(report, indent=2))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
