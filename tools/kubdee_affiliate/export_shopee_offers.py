#!/usr/bin/env python3
"""Normalize Shopee Affiliate offer rows into JSON for affiliate_pipeline.py.

This handles the practical no-API path:

- CSV/JSON exported from a browser snippet or copied table data.
- Plain text copied from the Shopee Affiliate offer page.

The output can be fed to:

    affiliate_pipeline.py ingest-offers --input data/offers.json
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import urllib.parse
from pathlib import Path
from typing import Any, Iterable


COMMISSION_ALIASES = (
    "commission_rate",
    "commissionRate",
    "commission",
    "commission_percent",
    "rate",
    "อัตราค่าคอมมิชชั่น",
    "ค่าคอมมิชชั่น",
    "คอมมิชชั่น",
)

SHOP_NAME_ALIASES = (
    "shop_name",
    "shopName",
    "store_name",
    "storeName",
    "seller_name",
    "sellerName",
    "ชื่อร้านค้า",
    "ร้านค้า",
)

URL_ALIASES = (
    "affiliate_url",
    "affiliateUrl",
    "offer_link",
    "offerLink",
    "product_link",
    "productUrl",
    "product_url",
    "url",
    "link",
    "ลิงก์",
)


def row_get(row: dict[str, Any], aliases: Iterable[str]) -> str:
    lower_map = {str(key).strip().lower(): value for key, value in row.items()}
    for alias in aliases:
        value = row.get(alias)
        if value is None:
            value = lower_map.get(alias.lower())
        if value is not None and str(value).strip():
            return str(value).strip()
    return ""


def parse_commission(value: Any) -> float | None:
    text = str(value or "").replace(",", "").strip()
    if not text:
        return None
    matches = re.findall(r"(\d+(?:\.\d+)?)\s*%", text)
    if not matches:
        matches = re.findall(r"(\d+(?:\.\d+)?)", text)
    if not matches:
        return None
    numbers = [float(item) for item in matches]
    plausible = [number for number in numbers if 0 < number <= 100]
    if not plausible:
        return None
    return max(plausible)


def parse_shopee_ids(value: str) -> tuple[str | None, str | None]:
    if not value:
        return None, None
    if value.startswith("shopee:"):
        parts = value.split(":")
        if len(parts) == 3:
            return parts[1], parts[2]
        if len(parts) == 2:
            return None, parts[1]

    try:
        parsed = urllib.parse.urlparse(value)
    except ValueError:
        return None, None

    params = urllib.parse.parse_qs(parsed.query)
    shopid = first_value(params, "shopid", "shop_id", "shopId")
    itemid = first_value(params, "itemid", "item_id", "itemId")
    if shopid and itemid:
        return shopid, itemid

    path = urllib.parse.unquote(parsed.path or "")
    patterns = (
        r"/product/(\d{4,})/(\d{4,})(?:$|[/?#])",
        r"(?:^|/)i\.(\d{4,})\.(\d{4,})(?:$|[/?#])",
        r"(?:^|/)(\d{4,})/(\d{4,})(?:$|[/?#])",
    )
    haystack = f"{path}/"
    for pattern in patterns:
        match = re.search(pattern, haystack, flags=re.IGNORECASE)
        if match:
            return match.group(1), match.group(2)

    shop_match = re.search(r"(?:shopid|shop_id|shopId)[=/](\d{4,})", value)
    return (shop_match.group(1), None) if shop_match else (None, None)


def first_value(params: dict[str, list[str]], *keys: str) -> str | None:
    for key in keys:
        values = params.get(key)
        if values and values[0].strip():
            return values[0].strip()
    return None


def normalize_offer(row: dict[str, Any], source: str, min_commission: float) -> dict[str, Any] | None:
    raw_url = row_get(row, URL_ALIASES)
    raw_product_id = row_get(row, ("product_id", "productId", "externalProductId", "itemid", "item_id"))
    shopid_from_url, itemid_from_url = parse_shopee_ids(raw_url or raw_product_id)

    shopid = row_get(row, ("shopid", "shop_id")) or shopid_from_url or ""
    itemid = row_get(row, ("itemid", "item_id", "externalProductId")) or itemid_from_url or ""
    shop_name = row_get(row, SHOP_NAME_ALIASES)
    commission = parse_commission(row_get(row, COMMISSION_ALIASES))

    if commission is None or commission < min_commission:
        return None
    if not itemid and not shopid and not shop_name:
        return None

    output: dict[str, Any] = {
        "commission_rate": commission,
        "source": source,
    }
    if shopid:
        output["shopid"] = shopid
    if itemid:
        output["itemid"] = itemid
    if shop_name:
        output["shop_name"] = shop_name
    if raw_url:
        output["affiliate_url"] = raw_url
    output["offer_type"] = "product" if itemid else "shop"
    return output


def read_json(path: Path) -> Iterable[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, dict):
        data = data.get("products") or data.get("items") or data.get("offers") or data.get("data") or []
    if not isinstance(data, list):
        raise ValueError("JSON input must be a list or an object with products/items/offers/data")
    for item in data:
        if isinstance(item, dict):
            yield item


def read_csv(path: Path) -> Iterable[dict[str, Any]]:
    with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            yield dict(row)


def read_text_blocks(path: Path) -> Iterable[dict[str, Any]]:
    text = path.read_text(encoding="utf-8-sig", errors="replace")
    blocks = [block for block in re.split(r"\n\s*\n", text) if block.strip()]
    if len(blocks) == 1:
        blocks = text.splitlines()
    for block in blocks:
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        if not lines:
            continue
        joined = "\n".join(lines)
        urls = re.findall(r"https?://\S+", joined)
        commission = parse_commission(joined)
        shop_name = first_shop_name_line(lines)
        yield {
            "shop_name": shop_name,
            "commission_rate": commission,
            "affiliate_url": urls[0] if urls else "",
        }


def first_shop_name_line(lines: list[str]) -> str:
    blocked = (
        "สูงสุด",
        "คอมมิชชั่น",
        "commission",
        "วันเริ่มต้น",
        "วันสิ้นสุด",
        "ดูรายละเอียด",
        "เอาลิงก์",
        "เลือกร้านค้า",
    )
    for line in lines:
        lower = line.lower()
        if any(word in lower for word in blocked):
            continue
        if re.search(r"\d+(?:\.\d+)?\s*%", line):
            continue
        if line.startswith("http"):
            continue
        return line
    return ""


def iter_input_rows(path: Path) -> Iterable[dict[str, Any]]:
    suffix = path.suffix.lower()
    if suffix == ".json":
        yield from read_json(path)
    elif suffix in {".csv", ".tsv"}:
        yield from read_csv(path)
    else:
        yield from read_text_blocks(path)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Export normalized Shopee Affiliate offers")
    parser.add_argument("--input", required=True, type=Path, help="CSV, JSON, or copied text from Shopee Affiliate offers")
    parser.add_argument("--output", required=True, type=Path, help="JSON file for affiliate_pipeline.py ingest-offers")
    parser.add_argument("--source", default="shopee-dashboard")
    parser.add_argument("--min-commission", type=float, default=0.0)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.input.exists():
        print(f"input not found: {args.input}", file=sys.stderr)
        return 2

    rows_seen = 0
    offers: list[dict[str, Any]] = []
    for row in iter_input_rows(args.input):
        rows_seen += 1
        offer = normalize_offer(row, args.source, args.min_commission)
        if offer:
            offers.append(offer)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(offers, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        json.dumps(
            {
                "rowsSeen": rows_seen,
                "offersExported": len(offers),
                "output": str(args.output),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
