#!/usr/bin/env python3
"""Prepare Kubdee AI Desktop Auto Pipeline from imported catalog products.

This is intentionally review-gated. It writes selected products into Kubdee's
Auto Pipeline localStorage through the Electron remote-debugging endpoint, but
it does not click Start or trigger generation.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import random
import socket
import sqlite3
import ssl
import struct
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

from import_kubdee_catalog import DEFAULT_MAC_DB, get_profile_id, iter_rows, normalize_product_id


DEFAULT_CDP_URL = "http://127.0.0.1:19222"

THEME_SYSTEM_PROMPTS: dict[str, str] = {
    "rainy": "ทำคอนเทนต์ Reels แนวแก้ปัญหาช่วงฤดูฝน เห็นสินค้าใช้งานจริง เข้าใจง่าย และชวนกดดูรายละเอียด",
    "christmas": "ทำคอนเทนต์ Reels แนวของขวัญและของตกแต่ง Christmas โทนอุ่น สนุก และเหมาะกับการแชร์",
    "new_year": "ทำคอนเทนต์ Reels แนวของขวัญปีใหม่ เน้นความคุ้มค่า ใช้ได้จริง และเหมาะกับซื้อฝาก",
    "valentine": "ทำคอนเทนต์ Reels แนวของขวัญวันวาเลนไทน์ อบอุ่น น่ารัก และดูตั้งใจเลือก",
}


def now_ms() -> int:
    return int(time.time() * 1000)


def open_db(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    return conn


def read_candidates(path: Path, limit: int) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for row in iter_rows(path):
        rows.append(row)
        if len(rows) >= limit:
            break
    return rows


def fetch_json(url: str) -> Any:
    with urllib.request.urlopen(url, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def kubdee_page_ws(cdp_url: str) -> str:
    pages = fetch_json(urllib.parse.urljoin(cdp_url.rstrip("/") + "/", "json/list"))
    for page in pages:
        if page.get("type") == "page" and page.get("title") == "Kubdee AI":
            return str(page["webSocketDebuggerUrl"])
    raise RuntimeError(f"Kubdee AI page not found at {cdp_url}")


class DevToolsWebSocket:
    def __init__(self, ws_url: str) -> None:
        parsed = urllib.parse.urlparse(ws_url)
        if parsed.scheme not in {"ws", "wss"}:
            raise ValueError(f"unsupported websocket scheme: {parsed.scheme}")
        self.host = parsed.hostname or "127.0.0.1"
        self.port = parsed.port or (443 if parsed.scheme == "wss" else 80)
        self.path = parsed.path + (f"?{parsed.query}" if parsed.query else "")
        raw_sock = socket.create_connection((self.host, self.port), timeout=10)
        self.sock = ssl.create_default_context().wrap_socket(raw_sock, server_hostname=self.host) if parsed.scheme == "wss" else raw_sock
        self._next_id = 0
        self._handshake()

    def _handshake(self) -> None:
        key = base64.b64encode(os.urandom(16)).decode("ascii")
        request = (
            f"GET {self.path} HTTP/1.1\r\n"
            f"Host: {self.host}:{self.port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n"
            "\r\n"
        )
        self.sock.sendall(request.encode("ascii"))
        response = self._recv_until(b"\r\n\r\n")
        if b" 101 " not in response.split(b"\r\n", 1)[0]:
            raise RuntimeError(f"websocket handshake failed: {response[:200]!r}")

    def _recv_until(self, marker: bytes) -> bytes:
        chunks = bytearray()
        while marker not in chunks:
            chunk = self.sock.recv(4096)
            if not chunk:
                break
            chunks.extend(chunk)
        return bytes(chunks)

    def close(self) -> None:
        try:
            self.sock.close()
        except OSError:
            pass

    def call(self, method: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        self._next_id += 1
        message_id = self._next_id
        self._send_json({"id": message_id, "method": method, "params": params or {}})
        while True:
            message = self._recv_json()
            if message.get("id") == message_id:
                if "error" in message:
                    raise RuntimeError(json.dumps(message["error"], ensure_ascii=False))
                return message

    def _send_json(self, payload: dict[str, Any]) -> None:
        data = json.dumps(payload).encode("utf-8")
        header = bytearray([0x81])
        length = len(data)
        if length < 126:
            header.append(0x80 | length)
        elif length < 65536:
            header.append(0x80 | 126)
            header.extend(struct.pack("!H", length))
        else:
            header.append(0x80 | 127)
            header.extend(struct.pack("!Q", length))
        mask = os.urandom(4)
        header.extend(mask)
        masked = bytes(byte ^ mask[index % 4] for index, byte in enumerate(data))
        self.sock.sendall(bytes(header) + masked)

    def _recv_json(self) -> dict[str, Any]:
        while True:
            opcode, payload = self._recv_frame()
            if opcode == 0x1:
                return json.loads(payload.decode("utf-8"))
            if opcode == 0x8:
                raise RuntimeError("websocket closed")
            if opcode == 0x9:
                self._send_pong(payload)

    def _recv_frame(self) -> tuple[int, bytes]:
        header = self._recv_exact(2)
        opcode = header[0] & 0x0F
        length = header[1] & 0x7F
        if length == 126:
            length = struct.unpack("!H", self._recv_exact(2))[0]
        elif length == 127:
            length = struct.unpack("!Q", self._recv_exact(8))[0]
        masked = bool(header[1] & 0x80)
        mask = self._recv_exact(4) if masked else b""
        payload = self._recv_exact(length)
        if masked:
            payload = bytes(byte ^ mask[index % 4] for index, byte in enumerate(payload))
        return opcode, payload

    def _recv_exact(self, length: int) -> bytes:
        chunks = bytearray()
        while len(chunks) < length:
            chunk = self.sock.recv(length - len(chunks))
            if not chunk:
                raise RuntimeError("socket closed")
            chunks.extend(chunk)
        return bytes(chunks)

    def _send_pong(self, payload: bytes) -> None:
        self.sock.sendall(bytes([0x8A, len(payload)]) + payload)


def file_uri(path: str | None) -> str:
    if not path:
        return ""
    try:
        return Path(path).resolve().as_uri()
    except ValueError:
        return ""


def pipeline_settings(theme: str) -> dict[str, Any]:
    system_prompt = THEME_SYSTEM_PROMPTS.get(theme, "")
    return {
        "image": {
            "imageModel": "nano_banana_pro",
            "aspectRatio": "9:16",
            "outputCount": "1",
            "characterMode": "auto",
            "selectedCharacterId": "",
            "customCharacterPreview": "",
            "characterDescription": "",
            "promptMode": "auto",
            "customPrompt": "",
            "styleMode": "preset",
            "presetStyle": "auto",
            "presetStyleCustom": "",
            "presetSubTab": "core",
            "viralStyle": "",
            "viralStyleCustom": "",
            "viralSubTab": "survival",
            "locationMode": "preset",
            "selectedLocationId": "",
            "customLocationPreview": "",
            "locationDescription": "",
            "background": "auto",
            "backgroundCustom": "",
            "lighting": "auto",
            "lightingCustom": "",
            "frame": "auto",
            "frameCustom": "",
            "characterOutfit": "",
            "characterOutfitCustom": "",
            "textOverlay": "",
            "textOverlayCustom": "",
            "systemPrompt": system_prompt,
        },
        "video": {
            "videoModel": "veo_31_lite_lower",
            "videoDuration": 8,
            "aspectRatio": "9:16",
            "outputCount": "1",
            "videoMethod": "extend",
            "multiSceneAngleMode": "same_angle",
            "multiSceneAiScriptEnabled": True,
            "multiSceneSendImagesToAi": False,
            "promptMode": "auto",
            "customPrompt": "",
            "styleMode": "preset",
            "presetStyle": "",
            "presetStyleCustom": "",
            "presetSubTab": "core",
            "sceneCount": "1",
            "voiceCharacter": "",
            "voiceCharacterCustom": "",
            "cameraMotion": "",
            "cameraMotionCustom": "",
            "musicStyle": "",
            "dialogueMode": "auto",
            "scriptStyle": "",
            "scriptStyleCustom": "",
            "dialogue": "",
            "dialogueList": [],
            "dialogueListOrder": "sequential",
            "musicSfxMode": "auto",
            "musicSfxCustom": "",
            "systemPrompt": system_prompt,
        },
    }


def pipeline_id(product_id: str) -> str:
    digest = hashlib.sha1(f"{product_id}:{now_ms()}:{random.random()}".encode("utf-8")).hexdigest()[:6]
    return f"prod_{now_ms()}_{digest}"


def build_pipeline_products(
    conn: sqlite3.Connection,
    profile_id: str,
    candidate_rows: list[dict[str, Any]],
    theme: str,
) -> tuple[list[dict[str, Any]], list[str]]:
    products: list[dict[str, Any]] = []
    missing: list[str] = []
    for row in candidate_rows:
        product_id = normalize_product_id(row)
        if not product_id:
            missing.append(str(row.get("title") or row.get("name") or "missing_product_id"))
            continue
        product = conn.execute(
            """
            SELECT id, name, productId, productUrl, price, stock, caption, hashtags, cta, imagePath
            FROM products
            WHERE productId = ? AND profileId = ? AND COALESCE(platform, '') = 'shopee'
            """,
            (product_id, profile_id),
        ).fetchone()
        if not product:
            missing.append(product_id)
            continue
        product_dict = dict(product)
        products.append(
            {
                "id": pipeline_id(product_id),
                "name": product_dict["name"],
                "productId": product_dict["productId"],
                "productUrl": product_dict.get("productUrl") or "",
                "hashtags": product_dict.get("hashtags") or "",
                "cta": product_dict.get("cta") or "",
                "caption": product_dict.get("caption") or "",
                "settings": pipeline_settings(theme),
                "catalogId": product_dict["id"],
                "preview": file_uri(product_dict.get("imagePath")),
            }
        )
    return products, missing


def apply_to_kubdee(cdp_url: str, products: list[dict[str, Any]], steps: list[str]) -> dict[str, Any]:
    ws = DevToolsWebSocket(kubdee_page_ws(cdp_url))
    try:
        expression = f"""
        (() => {{
          const products = {json.dumps(products, ensure_ascii=False)};
          const steps = {json.dumps(steps, ensure_ascii=False)};
          localStorage.setItem('kubdee-auto-pipeline-products', JSON.stringify(products));
          localStorage.setItem('kubdee-auto-pipeline-steps', JSON.stringify(steps));
          localStorage.setItem('kubdee-app-mode', 'oneclick');
          window.dispatchEvent(new StorageEvent('storage', {{key: 'kubdee-auto-pipeline-products'}}));
          return {{
            title: document.title,
            productCount: products.length,
            steps,
            activeProfile: localStorage.getItem('activeProfile')
          }};
        }})()
        """
        response = ws.call(
            "Runtime.evaluate",
            {
                "expression": expression,
                "returnByValue": True,
                "awaitPromise": True,
            },
        )
        return response["result"]["result"].get("value", {})
    finally:
        ws.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare Kubdee Auto Pipeline from imported Shopee catalog products")
    parser.add_argument("--input", required=True, type=Path, help="Candidate JSON/CSV already imported into Kubdee catalog")
    parser.add_argument("--theme", required=True, choices=sorted(THEME_SYSTEM_PROMPTS))
    parser.add_argument("--db-path", type=Path, default=Path(os.environ.get("KUBDEE_DB_PATH", DEFAULT_MAC_DB)))
    parser.add_argument("--profile-id")
    parser.add_argument("--profile-name", default=os.environ.get("KUBDEE_PROFILE_NAME"))
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--steps", default="image,video", help="Comma-separated Kubdee pipeline steps")
    parser.add_argument("--cdp-url", default=os.environ.get("KUBDEE_CDP_URL", DEFAULT_CDP_URL))
    parser.add_argument("--apply", action="store_true", help="Write products into Kubdee Desktop localStorage")
    parser.add_argument("--output-preview", type=Path, help="Optional JSON preview path")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.input.exists():
        print(f"input not found: {args.input}", file=sys.stderr)
        return 2
    if not args.db_path.exists():
        print(f"Kubdee DB not found: {args.db_path}", file=sys.stderr)
        return 2

    candidates = read_candidates(args.input, args.limit)
    with open_db(args.db_path) as conn:
        profile_id = get_profile_id(conn, args.profile_id, args.profile_name)
        products, missing = build_pipeline_products(conn, profile_id, candidates, args.theme)

    steps = [step.strip() for step in args.steps.split(",") if step.strip()]
    report: dict[str, Any] = {
        "profileId": profile_id,
        "theme": args.theme,
        "inputRows": len(candidates),
        "prepared": len(products),
        "missingCatalogProducts": missing,
        "applied": False,
        "products": products,
    }
    if args.apply:
        report["kubdee"] = apply_to_kubdee(args.cdp_url, products, steps)
        report["applied"] = True

    if args.output_preview:
        args.output_preview.parent.mkdir(parents=True, exist_ok=True)
        args.output_preview.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if products else 1


if __name__ == "__main__":
    raise SystemExit(main())
