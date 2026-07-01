#!/usr/bin/env python3
"""Local affiliate product database and candidate export pipeline.

This CLI is the durable layer before Kubdee import:

1. Ingest selected Shopee Product Feed columns into a local SQLite DB.
2. Ingest offer/commission rows scraped from Shopee Affiliate.
3. Score products for a campaign theme.
4. Export shortlisted candidates as JSON for `import_kubdee_catalog.py`.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sqlite3
import sys
import time
from pathlib import Path
from typing import Any, Iterable

from import_kubdee_catalog import THEMES, build_candidate, iter_rows, normalize_product_id


DEFAULT_DB = Path("data/affiliate.db")

SCHEMA = """
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS product_feed (
    product_id TEXT PRIMARY KEY,
    shopid TEXT,
    itemid TEXT,
    title TEXT NOT NULL,
    price REAL,
    sale_price REAL,
    stock INTEGER,
    sold INTEGER,
    rating REAL,
    image_link TEXT,
    product_link TEXT,
    product_short_link TEXT,
    category1 TEXT,
    category2 TEXT,
    category3 TEXT,
    shop_name TEXT,
    feed_date TEXT NOT NULL,
    first_seen_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS affiliate_offer (
    product_id TEXT PRIMARY KEY,
    shopid TEXT,
    itemid TEXT,
    commission_rate REAL,
    affiliate_url TEXT,
    source TEXT NOT NULL,
    scraped_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS affiliate_shop_offer (
    offer_key TEXT PRIMARY KEY,
    shopid TEXT,
    shop_name TEXT,
    commission_rate REAL NOT NULL,
    affiliate_url TEXT,
    source TEXT NOT NULL,
    scraped_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS campaign_candidate (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_key TEXT NOT NULL,
    theme TEXT NOT NULL,
    product_id TEXT NOT NULL,
    score REAL NOT NULL,
    score_reasons TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'shortlisted',
    created_at INTEGER NOT NULL,
    UNIQUE(campaign_key, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_feed_active ON product_feed(active);
CREATE INDEX IF NOT EXISTS idx_affiliate_shop_offer_shopid ON affiliate_shop_offer(shopid);
CREATE INDEX IF NOT EXISTS idx_affiliate_shop_offer_name ON affiliate_shop_offer(shop_name);
CREATE INDEX IF NOT EXISTS idx_campaign_candidate_campaign ON campaign_candidate(campaign_key, score DESC);
"""


def now_ms() -> int:
    return int(time.time() * 1000)


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


def open_db(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    return conn


def cmd_init_db(args: argparse.Namespace) -> int:
    with open_db(args.db) as conn:
        conn.executescript(SCHEMA)
    print(json.dumps({"db": str(args.db), "status": "initialized"}, indent=2))
    return 0


def row_get(row: dict[str, Any], *names: str) -> str:
    for name in names:
        value = row.get(name)
        if value is not None and str(value).strip():
            return str(value).strip()
    return ""


def iter_csv_rows(path: Path) -> Iterable[dict[str, Any]]:
    with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            yield dict(row)


def feed_product_id(row: dict[str, Any]) -> str:
    itemid = row_get(row, "itemid", "item_id")
    shopid = row_get(row, "shopid", "shop_id")
    if shopid and itemid:
        return f"shopee:{shopid}:{itemid}"
    return normalize_product_id(row)


def cmd_ingest_feed(args: argparse.Namespace) -> int:
    if not args.feed.exists():
        print(f"feed not found: {args.feed}", file=sys.stderr)
        return 2

    stamp = now_ms()
    rows_seen = 0
    rows_upserted = 0
    seen_ids: set[str] = set()

    with open_db(args.db) as conn:
        conn.executescript(SCHEMA)
        with conn:
            for row in iter_csv_rows(args.feed):
                rows_seen += 1
                product_id = feed_product_id(row)
                title = row_get(row, "title", "name")
                image_link = row_get(row, "image_link", "imageUrl", "image_url")
                if not product_id or not title or not image_link:
                    if args.scan_limit and rows_seen >= args.scan_limit:
                        break
                    continue

                seen_ids.add(product_id)
                conn.execute(
                    """
                    INSERT INTO product_feed (
                        product_id, shopid, itemid, title, price, sale_price, stock, sold,
                        rating, image_link, product_link, product_short_link, category1,
                        category2, category3, shop_name, feed_date, first_seen_at,
                        last_seen_at, active
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                    ON CONFLICT(product_id) DO UPDATE SET
                        title = excluded.title,
                        price = excluded.price,
                        sale_price = excluded.sale_price,
                        stock = excluded.stock,
                        sold = excluded.sold,
                        rating = excluded.rating,
                        image_link = excluded.image_link,
                        product_link = excluded.product_link,
                        product_short_link = excluded.product_short_link,
                        category1 = excluded.category1,
                        category2 = excluded.category2,
                        category3 = excluded.category3,
                        shop_name = excluded.shop_name,
                        feed_date = excluded.feed_date,
                        last_seen_at = excluded.last_seen_at,
                        active = 1
                    """,
                    (
                        product_id,
                        row_get(row, "shopid", "shop_id"),
                        row_get(row, "itemid", "item_id"),
                        title,
                        parse_float(row_get(row, "price")),
                        parse_float(row_get(row, "sale_price", "price")),
                        parse_int(row_get(row, "stock")),
                        parse_int(row_get(row, "item_sold", "sold")),
                        parse_float(row_get(row, "item_rating", "rating")),
                        image_link,
                        row_get(row, "product_link", "productUrl", "url"),
                        row_get(row, "product_short link", "product_short_link"),
                        row_get(row, "global_category1", "category1"),
                        row_get(row, "global_category2", "category2"),
                        row_get(row, "global_category3", "category3"),
                        row_get(row, "shop_name"),
                        args.feed_date,
                        stamp,
                        stamp,
                    ),
                )
                rows_upserted += 1
                if args.scan_limit and rows_seen >= args.scan_limit:
                    break

            if args.mark_inactive and not args.scan_limit:
                conn.execute(
                    "UPDATE product_feed SET active = 0 WHERE feed_date <> ?",
                    (args.feed_date,),
                )

    print(json.dumps({"rowsSeen": rows_seen, "rowsUpserted": rows_upserted, "db": str(args.db)}, indent=2))
    return 0


def offer_product_id(row: dict[str, Any]) -> str:
    product_id = normalize_product_id(row)
    if product_id:
        return product_id
    itemid = row_get(row, "itemid", "item_id", "externalProductId")
    shopid = row_get(row, "shopid", "shop_id")
    if shopid and itemid:
        return f"shopee:{shopid}:{itemid}"
    return ""


def cmd_ingest_offers(args: argparse.Namespace) -> int:
    if not args.input.exists():
        print(f"offers input not found: {args.input}", file=sys.stderr)
        return 2

    rows_seen = 0
    product_rows_upserted = 0
    shop_rows_upserted = 0
    stamp = now_ms()
    with open_db(args.db) as conn:
        conn.executescript(SCHEMA)
        with conn:
            for row in iter_rows(args.input):
                rows_seen += 1
                product_id = offer_product_id(row)
                commission = parse_float(row_get(row, "commission_rate", "commissionRate", "commission", "commission_percent"))
                if commission is None:
                    continue
                affiliate_url = row_get(
                    row,
                    "affiliate_url",
                    "affiliateUrl",
                    "offer_link",
                    "product_short link",
                    "product_short_link",
                    "productUrl",
                    "product_link",
                ) or None

                if product_id:
                    shopid, itemid = split_product_id(product_id)
                    conn.execute(
                        """
                        INSERT INTO affiliate_offer (
                            product_id, shopid, itemid, commission_rate, affiliate_url, source, scraped_at
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(product_id) DO UPDATE SET
                            commission_rate = excluded.commission_rate,
                            affiliate_url = COALESCE(excluded.affiliate_url, affiliate_offer.affiliate_url),
                            source = excluded.source,
                            scraped_at = excluded.scraped_at
                        """,
                        (
                            product_id,
                            shopid,
                            itemid,
                            commission,
                            affiliate_url,
                            args.source,
                            stamp,
                        ),
                    )
                    product_rows_upserted += 1
                    continue

                shopid = row_get(row, "shopid", "shop_id")
                shop_name = row_get(row, "shop_name", "shopName", "store_name", "storeName", "seller_name", "sellerName")
                offer_key = shop_offer_key(shopid, shop_name)
                if not offer_key:
                    continue
                conn.execute(
                    """
                    INSERT INTO affiliate_shop_offer (
                        offer_key, shopid, shop_name, commission_rate, affiliate_url, source, scraped_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(offer_key) DO UPDATE SET
                        commission_rate = excluded.commission_rate,
                        affiliate_url = COALESCE(excluded.affiliate_url, affiliate_shop_offer.affiliate_url),
                        source = excluded.source,
                        scraped_at = excluded.scraped_at
                    """,
                    (
                        offer_key,
                        shopid or None,
                        shop_name or None,
                        commission,
                        affiliate_url,
                        args.source,
                        stamp,
                    ),
                )
                shop_rows_upserted += 1

    print(
        json.dumps(
            {
                "rowsSeen": rows_seen,
                "productRowsUpserted": product_rows_upserted,
                "shopRowsUpserted": shop_rows_upserted,
                "db": str(args.db),
            },
            indent=2,
        )
    )
    return 0


def split_product_id(product_id: str) -> tuple[str | None, str | None]:
    parts = product_id.split(":")
    if len(parts) == 3 and parts[0] == "shopee":
        return parts[1], parts[2]
    return None, parts[-1] if parts else None


def shop_offer_key(shopid: str, shop_name: str) -> str:
    if shopid:
        return f"shopee_shop:{shopid}"
    normalized = " ".join(shop_name.strip().lower().split())
    if normalized:
        return f"shopee_shop_name:{normalized}"
    return ""


def joined_candidate_rows(conn: sqlite3.Connection, require_offer: bool) -> list[dict[str, Any]]:
    offer_filter = "AND COALESCE(po.commission_rate, so.commission_rate) IS NOT NULL" if require_offer else ""
    rows = conn.execute(
        f"""
        SELECT
            pf.product_id AS normalized_product_id,
            pf.shopid,
            pf.itemid,
            pf.title,
            pf.sale_price,
            pf.price,
            pf.stock,
            pf.sold AS item_sold,
            pf.rating AS item_rating,
            pf.image_link,
            COALESCE(po.affiliate_url, pf.product_short_link, pf.product_link, so.affiliate_url) AS product_link,
            so.affiliate_url AS shop_affiliate_url,
            COALESCE(po.commission_rate, so.commission_rate) AS commission_rate,
            pf.category1 AS global_category1,
            pf.category2 AS global_category2,
            pf.category3 AS global_category3,
            pf.shop_name
        FROM product_feed pf
        LEFT JOIN affiliate_offer po ON po.product_id = pf.product_id
        LEFT JOIN affiliate_shop_offer so ON (
            (so.shopid IS NOT NULL AND so.shopid <> '' AND so.shopid = pf.shopid)
            OR (
                so.shop_name IS NOT NULL
                AND so.shop_name <> ''
                AND lower(trim(so.shop_name)) = lower(trim(pf.shop_name))
            )
        )
        WHERE pf.active = 1
        {offer_filter}
        """
    ).fetchall()
    output: list[dict[str, Any]] = []
    for row in rows:
        item = dict(row)
        item["productId"] = item.pop("normalized_product_id")
        output.append(item)
    return output


def score_candidates(args: argparse.Namespace, write_table: bool) -> dict[str, Any]:
    if args.theme not in THEMES:
        raise ValueError(f"unknown theme: {args.theme}")
    selected: list[dict[str, Any]] = []
    rows_seen = 0
    rows_matched = 0
    stamp = now_ms()

    with open_db(args.db) as conn:
        conn.executescript(SCHEMA)
        for row in joined_candidate_rows(conn, args.require_offer):
            rows_seen += 1
            if not passes_commercial_filters(row, args):
                continue
            if not args.allow_loose_theme and not theme_name_match(row, args.theme):
                continue
            candidate = build_candidate(row, args.theme)
            if not candidate or candidate.score < args.min_score:
                continue
            rows_matched += 1
            selected.append(candidate_to_export(candidate))

        selected.sort(key=lambda item: item["score"], reverse=True)
        selected = selected[: args.limit]

        if write_table:
            with conn:
                for item in selected:
                    conn.execute(
                        """
                        INSERT INTO campaign_candidate (
                            campaign_key, theme, product_id, score, score_reasons, status, created_at
                        )
                        VALUES (?, ?, ?, ?, ?, 'shortlisted', ?)
                        ON CONFLICT(campaign_key, product_id) DO UPDATE SET
                            score = excluded.score,
                            score_reasons = excluded.score_reasons,
                            status = 'shortlisted',
                            created_at = excluded.created_at
                        """,
                        (
                            args.campaign,
                            args.theme,
                            item["productId"],
                            item["score"],
                            json.dumps(item["scoreReasons"], ensure_ascii=False),
                            stamp,
                        ),
                    )

    return {
        "campaign": args.campaign,
        "theme": args.theme,
        "rowsSeen": rows_seen,
        "rowsMatched": rows_matched,
        "selected": len(selected),
        "products": selected,
    }


def passes_commercial_filters(row: dict[str, Any], args: argparse.Namespace) -> bool:
    commission = parse_float(row.get("commission_rate"))
    if args.min_commission and (commission is None or commission < args.min_commission):
        return False
    sold = parse_int(row.get("item_sold"))
    if args.min_sold and (sold is None or sold < args.min_sold):
        return False
    rating = parse_float(row.get("item_rating"))
    if args.min_rating and (rating is None or rating < args.min_rating):
        return False
    stock = parse_int(row.get("stock"))
    if args.min_stock and (stock is None or stock < args.min_stock):
        return False
    return True


def theme_name_match(row: dict[str, Any], theme: str) -> bool:
    title = str(row.get("title") or row.get("name") or "").lower()
    from import_kubdee_catalog import keyword_matches

    return any(keyword_matches(title, keyword) for keyword in THEMES[theme]["keywords"])


def candidate_to_export(candidate: Any) -> dict[str, Any]:
    price = parse_float(candidate.price)
    commission_rate = parse_float(candidate.raw.get("commission_rate"))
    estimated_commission = None
    if price is not None and commission_rate is not None:
        estimated_commission = round(price * commission_rate / 100, 2)

    return {
        "shopid": candidate.raw.get("shopid") or split_product_id(candidate.product_id)[0],
        "itemid": candidate.raw.get("itemid") or split_product_id(candidate.product_id)[1],
        "title": candidate.name,
        "price": candidate.price,
        "stock": candidate.stock,
        "item_sold": candidate.raw.get("item_sold") or candidate.raw.get("sold"),
        "item_rating": candidate.raw.get("item_rating") or candidate.raw.get("rating"),
        "commission_rate": candidate.raw.get("commission_rate"),
        "estimated_commission": estimated_commission,
        "shop_affiliate_url": candidate.raw.get("shop_affiliate_url"),
        "image_link": candidate.image,
        "product_link": candidate.product_url,
        "global_category1": candidate.raw.get("global_category1"),
        "global_category2": candidate.raw.get("global_category2"),
        "global_category3": candidate.raw.get("global_category3"),
        "shop_name": candidate.raw.get("shop_name"),
        "caption": candidate.caption,
        "hashtags": candidate.hashtags,
        "cta": candidate.cta,
        "score": candidate.score,
        "scoreReasons": candidate.score_reasons,
        "productId": candidate.product_id,
    }


def cmd_score(args: argparse.Namespace) -> int:
    report = score_candidates(args, write_table=True)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


def cmd_export(args: argparse.Namespace) -> int:
    report = score_candidates(args, write_table=False)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report["products"], ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({**report, "output": str(args.output), "products": f"{len(report['products'])} written"}, ensure_ascii=False, indent=2))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Affiliate product DB and scoring pipeline")
    parser.add_argument("--db", type=Path, default=Path(os.environ.get("AFFILIATE_DB_PATH", DEFAULT_DB)))
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("init-db").set_defaults(func=cmd_init_db)

    feed = sub.add_parser("ingest-feed")
    feed.add_argument("--feed", required=True, type=Path)
    feed.add_argument("--feed-date", required=True, help="Feed date, e.g. 2026-06-30")
    feed.add_argument("--scan-limit", type=int)
    feed.add_argument("--mark-inactive", action="store_true")
    feed.set_defaults(func=cmd_ingest_feed)

    offers = sub.add_parser("ingest-offers")
    offers.add_argument("--input", required=True, type=Path)
    offers.add_argument("--source", default="manual")
    offers.set_defaults(func=cmd_ingest_offers)

    for name, func in (("score", cmd_score), ("export", cmd_export)):
        command = sub.add_parser(name)
        command.add_argument("--campaign", required=True)
        command.add_argument("--theme", required=True, choices=sorted(THEMES))
        command.add_argument("--min-score", type=float, default=30.0)
        command.add_argument("--limit", type=int, default=20)
        command.add_argument("--require-offer", action="store_true", help="Only score products with commission rows")
        command.add_argument("--min-commission", type=float, default=0.0)
        command.add_argument("--min-sold", type=int, default=0)
        command.add_argument("--min-rating", type=float, default=0.0)
        command.add_argument("--min-stock", type=int, default=0)
        command.add_argument("--allow-loose-theme", action="store_true")
        if name == "export":
            command.add_argument("--output", required=True, type=Path)
        command.set_defaults(func=func)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
