# Kubdee Affiliate Importer Runbook

This runbook covers the first durable workflow step:

```text
Shopee candidate products -> theme scoring -> Kubdee AI Desktop catalog
```

The importer is intentionally small and dependency-free so it can be moved to a
Windows worker later.

## Files

- `tools/kubdee_affiliate/affiliate_pipeline.py`
- `tools/kubdee_affiliate/export_shopee_offers.py`
- `tools/kubdee_affiliate/export_facebook_reel_queue.py`
- `tools/kubdee_affiliate/facebook_reels_draft.py`
- `tools/kubdee_affiliate/browser/shopee_offers_console_export.js`
- `tools/kubdee_affiliate/import_kubdee_catalog.py`
- `tools/kubdee_affiliate/prepare_kubdee_pipeline.py`
- `tools/kubdee_affiliate/sample_feed.csv`
- `tools/kubdee_affiliate/sample_shop_offers.txt`
- `tools/kubdee_affiliate/sample_products.json`

## Kubdee Paths

Mac defaults:

```text
KUBDEE_DB_PATH=/Users/mtra/Library/Application Support/Kubdee AI/data/kubdee.db
KUBDEE_DATA_DIR=/Users/mtra/Library/Application Support/Kubdee AI/data
```

Windows example:

```text
KUBDEE_DB_PATH=C:\Users\<user>\AppData\Roaming\Kubdee AI\data\kubdee.db
KUBDEE_DATA_DIR=C:\Users\<user>\AppData\Roaming\Kubdee AI\data
```

Set these environment variables on Windows instead of editing the script.

## Dry Run

Dry-run reads and scores products but does not write Kubdee's DB or image folder.

```bash
python3 tools/kubdee_affiliate/import_kubdee_catalog.py \
  --input tools/kubdee_affiliate/sample_products.json \
  --theme rainy \
  --profile-name "Reel promote shopee" \
  --dry-run
```

## Central Affiliate DB

Use `affiliate_pipeline.py` before importing to Kubdee. It creates a local DB,
loads product feed rows, loads offer/commission rows, scores candidates, and
exports JSON for the Kubdee importer.

Initialize a local DB:

```bash
python3 tools/kubdee_affiliate/affiliate_pipeline.py \
  --db data/affiliate.db \
  init-db
```

Ingest a product feed. During testing, always use `--scan-limit`.

```bash
python3 tools/kubdee_affiliate/affiliate_pipeline.py \
  --db data/affiliate.db \
  ingest-feed \
  --feed tools/kubdee_affiliate/sample_feed.csv \
  --feed-date 2026-06-30 \
  --scan-limit 1000
```

Export offer/commission rows copied from Shopee Affiliate:

```bash
python3 tools/kubdee_affiliate/export_shopee_offers.py \
  --input tools/kubdee_affiliate/sample_shop_offers.txt \
  --output data/offers.json \
  --min-commission 8
```

If the offer page is open in Chrome, you can also paste
`tools/kubdee_affiliate/browser/shopee_offers_console_export.js` into DevTools
Console and save the downloaded JSON as `data/offers.json`.

Ingest normalized offer/commission rows. Product offers match by product id.
Shop offers match by `shopid`, then by `shop_name`.

```bash
python3 tools/kubdee_affiliate/affiliate_pipeline.py \
  --db data/affiliate.db \
  ingest-offers \
  --input data/offers.json \
  --source shopee-dashboard
```

Export shortlisted candidates. For production use, prefer `--require-offer` so
products without commission are excluded.

```bash
python3 tools/kubdee_affiliate/affiliate_pipeline.py \
  --db data/affiliate.db \
  export \
  --campaign rainy-2026-07 \
  --theme rainy \
  --require-offer \
  --min-commission 8 \
  --min-sold 10 \
  --min-rating 4.5 \
  --min-stock 1 \
  --min-score 30 \
  --limit 20 \
  --output outputs/rainy-2026-07-candidates.json
```

Then dry-run Kubdee import:

```bash
python3 tools/kubdee_affiliate/import_kubdee_catalog.py \
  --input outputs/rainy-2026-07-candidates.json \
  --theme rainy \
  --profile-name "Reel promote shopee" \
  --dry-run
```

After a real import, prepare Kubdee Auto Pipeline without starting generation:

```bash
python3 tools/kubdee_affiliate/prepare_kubdee_pipeline.py \
  --input outputs/rainy-2026-07-candidates.json \
  --theme rainy \
  --profile-name "Reel promote shopee" \
  --apply
```

## Import

The importer backs up `kubdee.db` before writing unless `--no-backup` is passed.

```bash
python3 tools/kubdee_affiliate/import_kubdee_catalog.py \
  --input tools/kubdee_affiliate/sample_products.json \
  --theme rainy \
  --profile-name "Reel promote shopee" \
  --min-score 30 \
  --limit 10
```

After import, open Kubdee AI Desktop:

1. Select the matching profile.
2. Open `จากคลัง`.
3. Confirm products show under `สินค้า`.
4. Select products and click `นำเข้าโหมด Auto`.

## Input Fields

The importer accepts JSON arrays or CSV files. It maps common Shopee feed fields:

| Canonical field | Accepted aliases |
| --- | --- |
| `itemid` | `itemid`, `item_id`, `externalProductId` |
| `shopid` | `shopid`, `shop_id` |
| `name` | `name`, `title`, `productName` |
| `price` | `sale_price`, `price` |
| `stock` | `stock` |
| `sold` | `item_sold`, `sold` |
| `rating` | `item_rating`, `rating` |
| `commission_rate` | `commission_rate`, `commissionRate`, `commission`, `commission_percent` |
| `image` | `image_link`, `imageUrl`, `image_url`, `imagePath`, `image_path` |
| `product_url` | `product_short link`, `product_short_link`, `productUrl`, `product_link`, `url` |
| `caption` | `caption` |
| `hashtags` | `hashtags` |
| `cta` | `cta` |

## Themes

Current built-in themes:

- `rainy`
- `christmas`
- `new_year`
- `valentine`

Scoring currently uses theme keywords, category fit, price band, sold count,
rating, optional commission, image presence, product URL presence, and basic
risk penalties.

By default, products must contain at least one theme keyword in the product name.
Use `--allow-loose-theme` only when you want broader category-based discovery.

## Safety Notes

- Start with `--dry-run`.
- Keep Kubdee closed for larger imports. For small imports, Kubdee can be open,
  but refresh the catalog after import.
- Do not import the full 3.7 GB feed into Kubdee. Import only shortlisted
  campaign candidates.
- Keep `productId` stable. The importer uses `shopee:<shopid>:<itemid>` when
  possible and upserts by `productId + profileId + platform`.

## Scheduler Notes

For Windows setup, use `docs/kubdee-affiliate/windows-worker-runbook.md`.

For Hermes, Codex Schedule, cron, or Windows Task Scheduler, split jobs:

1. Shopee Product Feed download/update job.
2. Shopee offer/commission export job.
3. Candidate scoring job.
4. Kubdee import job.
5. Kubdee generation worker.
6. Publisher worker.

Only the Kubdee generation worker needs Kubdee Desktop, Google Flow login, and
browser state. The scraper/scorer can run on a separate machine if it writes to a
shared DB or exports candidate JSON.
