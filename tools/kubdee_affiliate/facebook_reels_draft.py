#!/usr/bin/env python3
"""Upload Facebook Reels drafts from a Kubdee export queue.

Default mode is dry-run. Draft mode uses an existing Chrome session exposed via
remote debugging. It uploads the video and fills caption text, but does not
publish unless explicitly requested with a confirmation phrase.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

from prepare_kubdee_pipeline import DevToolsWebSocket, fetch_json


DEFAULT_CHROME_CDP_URL = "http://127.0.0.1:9222"
DEFAULT_COMPOSER_URL = "https://www.facebook.com/reels/create/"

PUBLISH_TEXTS = ("publish", "post", "เผยแพร่", "โพสต์")
NEXT_TEXTS = ("next", "ถัดไป")


def load_queue(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    items = data.get("items") if isinstance(data, dict) else data
    if not isinstance(items, list):
        raise ValueError("queue input must be a list or an object with items")
    return [item for item in items if isinstance(item, dict)]


def item_video_path(item: dict[str, Any]) -> Path:
    return Path(str(item.get("video", {}).get("path") or ""))


def item_caption(item: dict[str, Any]) -> str:
    post = item.get("post") or {}
    return str(post.get("caption") or "").strip()


def item_id(item: dict[str, Any]) -> str:
    return str(item.get("queue_id") or item.get("video", {}).get("id") or "")


def chrome_pages(cdp_url: str) -> list[dict[str, Any]]:
    return fetch_json(urllib.parse.urljoin(cdp_url.rstrip("/") + "/", "json/list"))


def open_chrome_target(cdp_url: str, url: str) -> str:
    endpoint = urllib.parse.urljoin(cdp_url.rstrip("/") + "/", "json/new")
    request = urllib.request.Request(f"{endpoint}?{urllib.parse.quote(url, safe=':/?&=%')}", method="PUT")
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            page = json.loads(response.read().decode("utf-8"))
            return str(page["webSocketDebuggerUrl"])
    except Exception:
        pages = chrome_pages(cdp_url)
        for page in pages:
            if page.get("type") == "page" and "facebook.com" in str(page.get("url") or ""):
                return str(page["webSocketDebuggerUrl"])
        raise RuntimeError(f"could not open Chrome target at {cdp_url}")


def active_facebook_target(cdp_url: str) -> str:
    pages = chrome_pages(cdp_url)
    for page in pages:
        if page.get("type") == "page" and "facebook.com" in str(page.get("url") or ""):
            return str(page["webSocketDebuggerUrl"])
    raise RuntimeError("no Facebook page found in Chrome debug target list")


def evaluate(ws: DevToolsWebSocket, expression: str) -> Any:
    response = ws.call(
        "Runtime.evaluate",
        {
            "expression": expression,
            "returnByValue": True,
            "awaitPromise": True,
        },
    )
    result = response.get("result", {}).get("result", {})
    if "exceptionDetails" in response.get("result", {}):
        raise RuntimeError(json.dumps(response["result"]["exceptionDetails"], ensure_ascii=False))
    return result.get("value")


def wait_for_ready(ws: DevToolsWebSocket, timeout: int) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        state = evaluate(ws, "document.readyState")
        if state in {"interactive", "complete"}:
            return
        time.sleep(0.5)
    raise TimeoutError("page did not become ready")


def find_file_input(ws: DevToolsWebSocket, timeout: int) -> int:
    deadline = time.time() + timeout
    while time.time() < deadline:
        root = ws.call("DOM.getDocument", {"depth": -1, "pierce": True})["result"]["root"]["nodeId"]
        result = ws.call("DOM.querySelector", {"nodeId": root, "selector": "input[type=file]"})
        node_id = int(result["result"].get("nodeId") or 0)
        if node_id:
            return node_id
        time.sleep(1)
    raise TimeoutError("file input not found; open the Reel upload dialog manually and retry with --use-active-tab")


def set_file_input(ws: DevToolsWebSocket, file_path: Path, timeout: int) -> None:
    node_id = find_file_input(ws, timeout)
    ws.call("DOM.setFileInputFiles", {"nodeId": node_id, "files": [str(file_path)]})


def fill_caption(ws: DevToolsWebSocket, caption: str) -> bool:
    expression = f"""
    (() => {{
      const caption = {json.dumps(caption, ensure_ascii=False)};
      const candidates = [
        ...document.querySelectorAll('textarea'),
        ...document.querySelectorAll('[contenteditable="true"]'),
        ...document.querySelectorAll('[role="textbox"]')
      ];
      const visible = candidates.filter((el) => {{
        const rect = el.getBoundingClientRect();
        return rect.width > 20 && rect.height > 10;
      }});
      const scored = visible.map((el) => {{
        const label = [
          el.getAttribute('aria-label') || '',
          el.getAttribute('placeholder') || '',
          el.innerText || '',
          el.textContent || ''
        ].join(' ').toLowerCase();
        let score = 0;
        if (/caption|description|say something|เขียน|คำบรรยาย|แคปชั่น|รายละเอียด/.test(label)) score += 10;
        if (el.tagName.toLowerCase() === 'textarea') score += 3;
        return {{el, score}};
      }}).sort((a, b) => b.score - a.score);
      const target = scored[0]?.el;
      if (!target) return false;
      target.focus();
      if ('value' in target) {{
        target.value = caption;
        target.dispatchEvent(new Event('input', {{bubbles: true}}));
        target.dispatchEvent(new Event('change', {{bubbles: true}}));
      }} else {{
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, caption);
        target.dispatchEvent(new InputEvent('input', {{bubbles: true, inputType: 'insertText', data: caption}}));
      }}
      return true;
    }})()
    """
    return bool(evaluate(ws, expression))


def click_by_text(ws: DevToolsWebSocket, texts: tuple[str, ...]) -> bool:
    expression = f"""
    (() => {{
      const texts = {json.dumps([text.lower() for text in texts])};
      const candidates = [...document.querySelectorAll('div[role="button"], button, a[role="button"]')];
      const target = candidates.find((el) => {{
        const rect = el.getBoundingClientRect();
        if (rect.width <= 10 || rect.height <= 10) return false;
        const text = (el.innerText || el.textContent || el.getAttribute('aria-label') || '').trim().toLowerCase();
        return texts.some((needle) => text === needle || text.includes(needle));
      }});
      if (!target) return false;
      target.click();
      return true;
    }})()
    """
    return bool(evaluate(ws, expression))


def draft_item(args: argparse.Namespace, item: dict[str, Any]) -> dict[str, Any]:
    status = str(item.get("status") or "")
    if status != "ready_for_draft":
        return {"queue_id": item_id(item), "status": "skipped", "reason": f"unsupported_status:{status}"}
    video_path = item_video_path(item)
    caption = item_caption(item)
    if not video_path.exists():
        return {"queue_id": item_id(item), "status": "error", "error": f"video not found: {video_path}"}
    if not caption:
        return {"queue_id": item_id(item), "status": "error", "error": "missing caption"}

    if args.mode == "dry-run":
        return {"queue_id": item_id(item), "status": "dry_run_ok", "video": str(video_path), "captionLength": len(caption)}

    ws_url = active_facebook_target(args.cdp_url) if args.use_active_tab else open_chrome_target(args.cdp_url, args.composer_url)
    ws = DevToolsWebSocket(ws_url)
    try:
        wait_for_ready(ws, args.timeout)
        if args.upload:
            set_file_input(ws, video_path, args.timeout)
            time.sleep(args.after_upload_wait)
        caption_filled = fill_caption(ws, caption) if args.fill_caption else False
        for _ in range(args.click_next):
            clicked = click_by_text(ws, NEXT_TEXTS)
            if not clicked:
                break
            time.sleep(args.after_click_wait)
        published = False
        if args.mode == "publish":
            if args.confirm_publish != "PUBLISH":
                raise RuntimeError("publish mode requires --confirm-publish PUBLISH")
            published = click_by_text(ws, PUBLISH_TEXTS)
        return {
            "queue_id": item_id(item),
            "status": "published" if published else "draft_prepared",
            "video": str(video_path),
            "captionFilled": caption_filled,
            "published": published,
        }
    finally:
        ws.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare Facebook Reels drafts from a queue JSON")
    parser.add_argument("--queue", required=True, type=Path)
    parser.add_argument("--output-report", required=True, type=Path)
    parser.add_argument("--cdp-url", default=DEFAULT_CHROME_CDP_URL)
    parser.add_argument("--composer-url", default=DEFAULT_COMPOSER_URL)
    parser.add_argument("--mode", choices=("dry-run", "draft", "publish"), default="dry-run")
    parser.add_argument("--confirm-publish", default="")
    parser.add_argument("--limit", type=int, default=1)
    parser.add_argument("--timeout", type=int, default=45)
    parser.add_argument("--after-upload-wait", type=int, default=8)
    parser.add_argument("--after-click-wait", type=int, default=3)
    parser.add_argument("--click-next", type=int, default=0)
    parser.add_argument("--use-active-tab", action="store_true")
    parser.add_argument("--no-upload", dest="upload", action="store_false")
    parser.add_argument("--no-caption", dest="fill_caption", action="store_false")
    parser.set_defaults(upload=True, fill_caption=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.queue.exists():
        print(f"queue not found: {args.queue}", file=sys.stderr)
        return 2

    items = load_queue(args.queue)[: args.limit]
    results = [draft_item(args, item) for item in items]
    report = {
        "mode": args.mode,
        "queue": str(args.queue),
        "itemsSeen": len(items),
        "results": results,
    }
    args.output_report.parent.mkdir(parents=True, exist_ok=True)
    args.output_report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({**report, "results": f"{len(results)} written"}, ensure_ascii=False, indent=2))
    return 0 if all(item["status"] not in {"error"} for item in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
