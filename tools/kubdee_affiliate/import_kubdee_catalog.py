#!/usr/bin/env python3
"""Import scored affiliate products into Kubdee AI Desktop's product catalog.

The importer accepts CSV or JSON input, applies a lightweight theme score, copies
or downloads product images into the selected Kubdee profile folder, then upserts
rows into Kubdee's local SQLite catalog.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import shutil
import sqlite3
import sys
import time
import urllib.parse
import urllib.request
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


DEFAULT_MAC_DB = Path.home() / "Library/Application Support/Kubdee AI/data/kubdee.db"
DEFAULT_MAC_DATA_DIR = Path.home() / "Library/Application Support/Kubdee AI/data"

THEMES: dict[str, dict[str, Any]] = {
    "rainy": {
        "label": "ฤดูฝน",
        "keywords": [
            "ร่มพับ",
            "ร่มกันฝน",
            "umbrella",
            "กันฝน",
            "เสื้อกันฝน",
            "รองเท้าบูท",
            "กันน้ำ",
            "waterproof",
            "rain",
            "dehumidifier",
            "เครื่องดูดความชื้น",
            "ผ้าเช็ดตัว",
            "กระเป๋ากันน้ำ",
        ],
        "categories": ["Home & Living", "Sports & Outdoors", "Automobiles", "Home Appliances"],
        "content_angle": "แก้ปัญหาหน้าฝน ใช้งานจริง ป้องกันความเปียกและความชื้น",
    },
    "christmas": {
        "label": "Christmas",
        "keywords": [
            "christmas",
            "xmas",
            "คริสต์มาส",
            "ของขวัญ",
            "ไฟตกแต่ง",
            "ต้นคริสต์มาส",
            "gift",
            "party",
            "ตกแต่ง",
        ],
        "categories": ["Home & Living", "Toys", "Fashion Accessories", "Beauty"],
        "content_angle": "ของขวัญและของตกแต่งเทศกาล โทนอุ่น สนุก เหมาะกับการซื้อให้คนอื่น",
    },
    "new_year": {
        "label": "ของขวัญปีใหม่",
        "keywords": [
            "ปีใหม่",
            "new year",
            "ของขวัญ",
            "gift",
            "เซ็ต",
            "แพ็ค",
            "premium",
            "party",
            "travel",
        ],
        "categories": ["Beauty", "Home & Living", "Food & Beverages", "Fashion Accessories"],
        "content_angle": "ของขวัญปีใหม่ ใช้ได้จริง ดูคุ้มค่า เหมาะกับการซื้อฝาก",
    },
    "valentine": {
        "label": "Valentine",
        "keywords": [
            "valentine",
            "วาเลนไทน์",
            "หัวใจ",
            "แฟน",
            "คู่รัก",
            "ของขวัญ",
            "gift",
            "rose",
            "love",
            "น้ำหอม",
            "เครื่องประดับ",
        ],
        "categories": ["Beauty", "Fashion Accessories", "Women Clothes", "Men Clothes"],
        "content_angle": "ของขวัญให้คนรัก โทนอบอุ่น น่ารัก ดูตั้งใจเลือก",
    },
}

FIELD_ALIASES: dict[str, tuple[str, ...]] = {
    "itemid": ("itemid", "item_id", "externalProductId"),
    "shopid": ("shopid", "shop_id"),
    "name": ("name", "title", "productName"),
    "price": ("sale_price", "price"),
    "stock": ("stock",),
    "sold": ("item_sold", "sold"),
    "rating": ("item_rating", "rating"),
    "commission_rate": ("commission_rate", "commissionRate", "commission", "commission_percent"),
    "image": ("image_link", "imageUrl", "image_url", "imagePath", "image_path"),
    "product_url": ("product_short link", "product_short_link", "productUrl", "product_link", "url"),
    "category1": ("global_category1", "category1"),
    "category2": ("global_category2", "category2"),
    "category3": ("global_category3", "category3"),
    "caption": ("caption",),
    "hashtags": ("hashtags",),
    "cta": ("cta",),
}


@dataclass(frozen=True)
class Candidate:
    raw: dict[str, Any]
    name: str
    product_id: str
    product_url: str
    image: str
    price: str | None
    stock: int | None
    caption: str
    hashtags: str
    cta: str
    score: float
    score_reasons: list[str]


def value(row: dict[str, Any], key: str, default: str = "") -> str:
    for alias in FIELD_ALIASES[key]:
        item = row.get(alias)
        if item is not None and str(item).strip():
            return str(item).strip()
    return default


def parse_float(raw: Any) -> float | None:
    text = str(raw or "").strip().replace(",", "")
    if not text:
        return None
    if text.endswith("%"):
        text = text[:-1]
    try:
        return float(text)
    except ValueError:
        return None


def parse_int(raw: Any) -> int | None:
    number = parse_float(raw)
    if number is None:
        return None
    return int(number)


def normalize_product_id(row: dict[str, Any]) -> str:
    explicit = value(row, "itemid")
    shopid = value(row, "shopid")
    if explicit and shopid:
        return f"shopee:{shopid}:{explicit}"
    if explicit and explicit.startswith("shopee:"):
        return explicit
    url = value(row, "product_url")
    parsed = extract_shopee_ids_from_url(url)
    if parsed:
        return f"shopee:{parsed[0]}:{parsed[1]}"
    if explicit:
        return f"shopee:{explicit}"
    return ""


def extract_shopee_ids_from_url(url: str) -> tuple[str, str] | None:
    if not url:
        return None
    parsed = urllib.parse.urlparse(url)
    qs = urllib.parse.parse_qs(parsed.query)
    shopid = (qs.get("shopid") or qs.get("shop_id") or qs.get("shopId") or [""])[0]
    itemid = (qs.get("itemid") or qs.get("item_id") or qs.get("itemId") or [""])[0]
    if shopid.isdigit() and itemid.isdigit():
        return shopid, itemid
    parts = [part for part in parsed.path.split("/") if part]
    if len(parts) >= 3 and parts[-3] == "product" and parts[-2].isdigit() and parts[-1].isdigit():
        return parts[-2], parts[-1]
    return None


def score_row(row: dict[str, Any], theme_key: str) -> tuple[float, list[str]]:
    theme = THEMES[theme_key]
    name = value(row, "name").lower()
    categories = " ".join(value(row, key) for key in ("category1", "category2", "category3")).lower()
    score = 0.0
    reasons: list[str] = []

    keyword_hits = [kw for kw in theme["keywords"] if keyword_matches(name, kw)]
    if keyword_hits:
        score += min(35.0, 12.0 * len(keyword_hits))
        reasons.append(f"theme_keywords={','.join(keyword_hits[:4])}")

    category_hits = [cat for cat in theme["categories"] if cat.lower() in categories]
    if category_hits:
        score += 12.0
        reasons.append(f"category={category_hits[0]}")

    price = parse_float(value(row, "price"))
    if price:
        if 80 <= price <= 899:
            score += 14.0
            reasons.append("ad_friendly_price")
        elif price < 80:
            score += 4.0
            reasons.append("low_price")
        else:
            score += 2.0
            reasons.append("high_price")

    sold = parse_int(value(row, "sold"))
    if sold is not None:
        if sold >= 100:
            score += 16.0
            reasons.append("sold>=100")
        elif sold >= 20:
            score += 8.0
            reasons.append("sold>=20")
        elif sold > 0:
            score += 3.0
            reasons.append("has_sales")

    rating = parse_float(value(row, "rating"))
    if rating is not None:
        if rating >= 4.8:
            score += 8.0
            reasons.append("rating>=4.8")
        elif rating >= 4.5:
            score += 4.0
            reasons.append("rating>=4.5")

    commission_rate = parse_float(value(row, "commission_rate"))
    if commission_rate is not None:
        if commission_rate >= 15:
            score += 18.0
            reasons.append("commission>=15")
        elif commission_rate >= 8:
            score += 10.0
            reasons.append("commission>=8")
        elif commission_rate > 0:
            score += 4.0
            reasons.append("commission>0")

    if value(row, "image"):
        score += 7.0
        reasons.append("has_image")
    if value(row, "product_url"):
        score += 5.0
        reasons.append("has_product_url")

    blocked = ["ยา", "รักษา", "ลดน้ำหนัก", "ขาวใส", "สิว", "ฝ้า", "กู้เงิน", "พนัน"]
    blocked_hits = [word for word in blocked if word in name]
    if blocked_hits:
        score -= 25.0
        reasons.append(f"risk={','.join(blocked_hits[:3])}")

    return max(0.0, round(score, 2)), reasons


def keyword_matches(text: str, keyword: str) -> bool:
    needle = keyword.lower().strip()
    if not needle:
        return False
    if re.fullmatch(r"[a-z0-9][a-z0-9 -]*", needle):
        pattern = r"(?<![a-z0-9])" + re.escape(needle).replace(r"\ ", r"\s+") + r"(?![a-z0-9])"
        return re.search(pattern, text, flags=re.IGNORECASE) is not None
    return needle in text


def has_theme_keyword(row: dict[str, Any], theme_key: str) -> bool:
    name = value(row, "name").lower()
    return any(keyword_matches(name, kw) for kw in THEMES[theme_key]["keywords"])


def build_candidate(row: dict[str, Any], theme_key: str) -> Candidate | None:
    name = value(row, "name")
    product_id = normalize_product_id(row)
    product_url = value(row, "product_url")
    image = value(row, "image")
    if not name or not product_id or not image:
        return None

    score, reasons = score_row(row, theme_key)
    theme = THEMES[theme_key]
    caption = value(row, "caption") or f"{theme['label']}: {name}"
    hashtags = value(row, "hashtags") or f"#ShopeeAffiliate #{theme['label'].replace(' ', '')}"
    cta = value(row, "cta") or "กดดูรายละเอียดสินค้าและเช็กรุ่น/เงื่อนไขก่อนสั่งซื้อ"

    return Candidate(
        raw=row,
        name=name,
        product_id=product_id,
        product_url=product_url,
        image=image,
        price=value(row, "price") or None,
        stock=parse_int(value(row, "stock")),
        caption=caption,
        hashtags=hashtags,
        cta=cta,
        score=score,
        score_reasons=reasons,
    )


def iter_rows(input_path: Path) -> Iterable[dict[str, Any]]:
    suffix = input_path.suffix.lower()
    if suffix == ".json":
        data = json.loads(input_path.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            data = data.get("products") or data.get("items") or []
        if not isinstance(data, list):
            raise ValueError("JSON input must be a list or an object with products/items")
        for item in data:
            if isinstance(item, dict):
                yield item
        return

    with input_path.open("r", encoding="utf-8-sig", errors="replace", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            yield dict(row)


def kubdee_products_dir(data_dir: Path, profile_id: str) -> Path:
    return data_dir / "profiles" / profile_id / "products"


def get_profile_id(conn: sqlite3.Connection, profile_id: str | None, profile_name: str | None) -> str:
    if profile_id:
        row = conn.execute("SELECT id FROM profiles WHERE id = ?", (profile_id,)).fetchone()
        if not row:
            raise ValueError(f"Kubdee profile id not found: {profile_id}")
        return profile_id
    if profile_name:
        rows = conn.execute("SELECT id, name FROM profiles WHERE name = ?", (profile_name,)).fetchall()
        if not rows:
            raise ValueError(f"Kubdee profile name not found: {profile_name}")
        if len(rows) > 1:
            raise ValueError(f"Multiple Kubdee profiles named {profile_name!r}; pass --profile-id")
        return str(rows[0][0])
    rows = conn.execute("SELECT id, name FROM profiles ORDER BY createdAt DESC").fetchall()
    if len(rows) == 1:
        return str(rows[0][0])
    raise ValueError("Pass --profile-id or --profile-name")


def backup_db(db_path: Path) -> Path:
    stamp = time.strftime("%Y%m%d-%H%M%S")
    backup = db_path.with_name(f"{db_path.name}.backup-{stamp}")
    shutil.copy2(db_path, backup)
    return backup


def image_extension(source: str) -> str:
    path = urllib.parse.urlparse(source).path
    ext = Path(path).suffix.lower().strip(".")
    if ext in {"jpg", "jpeg", "png", "webp", "gif"}:
        return "jpg" if ext == "jpeg" else ext
    return "jpg"


def materialize_image(source: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if source.startswith("http://") or source.startswith("https://"):
        request = urllib.request.Request(source, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(request, timeout=30) as response:
            dest.write_bytes(response.read())
        return
    src_path = Path(source.replace("file://", ""))
    if not src_path.exists():
        raise FileNotFoundError(f"image not found: {source}")
    shutil.copy2(src_path, dest)


def upsert_candidate(
    conn: sqlite3.Connection,
    profile_id: str,
    products_dir: Path,
    candidate: Candidate,
    dry_run: bool,
) -> dict[str, Any]:
    existing = conn.execute(
        "SELECT id, imagePath FROM products WHERE productId = ? AND profileId = ? AND COALESCE(platform, '') = ?",
        (candidate.product_id, profile_id, "shopee"),
    ).fetchone()
    product_db_id = str(existing[0]) if existing else str(uuid.uuid4())
    image_path = Path(str(existing[1])) if existing and existing[1] else products_dir / f"{product_db_id}.{image_extension(candidate.image)}"

    now_ms = int(time.time() * 1000)
    action = "update" if existing else "insert"

    if dry_run:
        return {
            "action": f"dry_run_{action}",
            "id": product_db_id,
            "name": candidate.name,
            "score": candidate.score,
            "reasons": candidate.score_reasons,
            "imagePath": str(image_path),
        }

    materialize_image(candidate.image, image_path)
    if existing:
        conn.execute(
            """
            UPDATE products
            SET name = ?, productUrl = ?, price = ?, stock = ?, caption = ?, hashtags = ?,
                cta = ?, imagePath = ?, platform = ?, status = ?, scrapedAt = ?, profileId = ?
            WHERE id = ?
            """,
            (
                candidate.name,
                candidate.product_url or None,
                candidate.price,
                candidate.stock,
                candidate.caption,
                candidate.hashtags,
                candidate.cta,
                str(image_path),
                "shopee",
                "candidate_import",
                now_ms,
                profile_id,
                product_db_id,
            ),
        )
    else:
        conn.execute(
            """
            INSERT INTO products (
                id, profileId, name, productId, productUrl, price, stock, caption, hashtags,
                cta, imagePath, platform, status, isFavorite, scrapedAt, createdAt
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                product_db_id,
                profile_id,
                candidate.name,
                candidate.product_id,
                candidate.product_url or None,
                candidate.price,
                candidate.stock,
                candidate.caption,
                candidate.hashtags,
                candidate.cta,
                str(image_path),
                "shopee",
                "candidate_import",
                0,
                now_ms,
                now_ms,
            ),
        )
    return {
        "action": action,
        "id": product_db_id,
        "name": candidate.name,
        "score": candidate.score,
        "reasons": candidate.score_reasons,
        "imagePath": str(image_path),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Score affiliate products and import them into Kubdee AI Desktop")
    parser.add_argument("--input", required=True, type=Path, help="CSV or JSON candidate product file")
    parser.add_argument("--theme", required=True, choices=sorted(THEMES), help="Campaign theme to score against")
    parser.add_argument("--db-path", type=Path, default=Path(os.environ.get("KUBDEE_DB_PATH", DEFAULT_MAC_DB)))
    parser.add_argument("--data-dir", type=Path, default=Path(os.environ.get("KUBDEE_DATA_DIR", DEFAULT_MAC_DATA_DIR)))
    parser.add_argument("--profile-id")
    parser.add_argument("--profile-name", default=os.environ.get("KUBDEE_PROFILE_NAME"))
    parser.add_argument("--min-score", type=float, default=30.0)
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--scan-limit", type=int, help="Stop reading after this many input rows")
    parser.add_argument(
        "--allow-loose-theme",
        action="store_true",
        help="Allow category-only matches. Default requires at least one theme keyword in the product name.",
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-backup", action="store_true", help="Skip DB backup for non-dry-run imports")
    parser.add_argument("--output-report", type=Path, help="Optional JSON report path")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.input.exists():
        print(f"input not found: {args.input}", file=sys.stderr)
        return 2
    if not args.db_path.exists():
        print(f"Kubdee DB not found: {args.db_path}", file=sys.stderr)
        return 2

    rows_seen = 0
    candidates: list[Candidate] = []
    for row in iter_rows(args.input):
        rows_seen += 1
        if not args.allow_loose_theme and not has_theme_keyword(row, args.theme):
            if args.scan_limit and rows_seen >= args.scan_limit:
                break
            continue
        candidate = build_candidate(row, args.theme)
        if candidate and candidate.score >= args.min_score:
            candidates.append(candidate)
        if args.scan_limit and rows_seen >= args.scan_limit:
            break

    candidates.sort(key=lambda item: item.score, reverse=True)
    selected = candidates[: args.limit]

    conn = sqlite3.connect(args.db_path)
    try:
        profile_id = get_profile_id(conn, args.profile_id, args.profile_name)
        products_dir = kubdee_products_dir(args.data_dir, profile_id)
        backup = None
        if not args.dry_run and not args.no_backup:
            backup = backup_db(args.db_path)

        results: list[dict[str, Any]] = []
        with conn:
            for candidate in selected:
                results.append(upsert_candidate(conn, profile_id, products_dir, candidate, args.dry_run))

        report = {
            "theme": args.theme,
            "themeLabel": THEMES[args.theme]["label"],
            "rowsSeen": rows_seen,
            "matchedCandidates": len(candidates),
            "selected": len(selected),
            "profileId": profile_id,
            "dryRun": args.dry_run,
            "backup": str(backup) if backup else None,
            "results": results,
        }
        if args.output_report:
            args.output_report.parent.mkdir(parents=True, exist_ok=True)
            args.output_report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
