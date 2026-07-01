#!/usr/bin/env python3
"""Export generated Kubdee videos into a Facebook Reels draft queue."""

from __future__ import annotations

import argparse
import json
import os
import sqlite3
import sys
from pathlib import Path
from typing import Any

from import_kubdee_catalog import DEFAULT_MAC_DB, get_profile_id


def open_db(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    return conn


def parse_bindings(raw: str | None) -> list[dict[str, Any]]:
    if not raw:
        return []
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return []
    return [item for item in data if isinstance(item, dict)] if isinstance(data, list) else []


def build_caption(binding: dict[str, Any]) -> str:
    parts = [
        str(binding.get("caption") or "").strip(),
        str(binding.get("cta") or "").strip(),
        str(binding.get("productUrl") or "").strip(),
        str(binding.get("hashtag") or binding.get("hashtags") or "").strip(),
    ]
    return "\n\n".join(part for part in parts if part)


def export_queue(args: argparse.Namespace) -> dict[str, Any]:
    with open_db(args.db_path) as conn:
        profile_id = get_profile_id(conn, args.profile_id, args.profile_name)
        rows = conn.execute(
            """
            SELECT id, profileId, filePath, name, width, height, duration, resolution,
                   aspectRatio, format, codec, frameRate, fileSize, platformBindings,
                   createdAt
            FROM gallery_videos
            WHERE profileId = ?
              AND createdAt >= ?
              AND aspectRatio = ?
            ORDER BY createdAt DESC
            LIMIT ?
            """,
            (profile_id, args.since_ms, args.aspect_ratio, args.scan_limit),
        ).fetchall()

    items: list[dict[str, Any]] = []
    skipped = 0
    seen_keys: set[str] = set()
    for row in rows:
        row_dict = dict(row)
        file_path = Path(str(row_dict["filePath"]))
        if args.require_file and not file_path.exists():
            skipped += 1
            continue
        for binding in parse_bindings(row_dict.get("platformBindings")):
            if args.platform and str(binding.get("platform") or "").lower() != args.platform.lower():
                continue
            product_id = str(binding.get("productId") or "")
            key = f"{row_dict['id']}:{product_id}"
            if key in seen_keys:
                continue
            seen_keys.add(key)
            items.append(
                {
                    "queue_id": key,
                    "status": "ready_for_draft",
                    "target": {
                        "platform": "facebook_reels",
                        "page": args.page_name,
                    },
                    "video": {
                        "id": row_dict["id"],
                        "path": str(file_path),
                        "name": row_dict["name"],
                        "duration": row_dict["duration"],
                        "resolution": row_dict["resolution"],
                        "aspect_ratio": row_dict["aspectRatio"],
                        "file_size": row_dict["fileSize"],
                        "created_at": row_dict["createdAt"],
                    },
                    "product": {
                        "platform": binding.get("platform"),
                        "product_id": product_id,
                        "name": binding.get("productName"),
                        "url": binding.get("productUrl"),
                    },
                    "post": {
                        "caption": build_caption(binding),
                        "caption_raw": binding.get("caption"),
                        "hashtags": binding.get("hashtag") or binding.get("hashtags"),
                        "cta": binding.get("cta"),
                    },
                }
            )
            if len(items) >= args.limit:
                break
        if len(items) >= args.limit:
            break

    report = {
        "profileId": profile_id,
        "rowsScanned": len(rows),
        "itemsExported": len(items),
        "skipped": skipped,
        "items": items,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    return report


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Export Kubdee generated videos into a Facebook Reels draft queue")
    parser.add_argument("--db-path", type=Path, default=Path(os.environ.get("KUBDEE_DB_PATH", DEFAULT_MAC_DB)))
    parser.add_argument("--profile-id")
    parser.add_argument("--profile-name", default=os.environ.get("KUBDEE_PROFILE_NAME"))
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--page-name", default="")
    parser.add_argument("--platform", default="shopee")
    parser.add_argument("--aspect-ratio", default="9:16")
    parser.add_argument("--since-ms", type=int, default=0)
    parser.add_argument("--scan-limit", type=int, default=200)
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--require-file", action="store_true", default=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.db_path.exists():
        print(f"Kubdee DB not found: {args.db_path}", file=sys.stderr)
        return 2
    report = export_queue(args)
    print(json.dumps({k: v for k, v in report.items() if k != "items"}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
