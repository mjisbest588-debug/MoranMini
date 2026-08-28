#!/usr/bin/env python3
"""Create minimal valid PNG/MP3 stubs so routes and tests work without Issue-Shorts access."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "housewarming" / "static" / "images"
AUDIO = ROOT / "housewarming" / "static" / "audio"

PNG_FILES = [
    "tshirt-1.png",
    "tshirt-2.png",
    "door-before.png",
    "qr-moranmini-house.png",
]

MP3_FILES = [
    "doorbell.mp3",
    "door-open.mp3",
    "러브하우스 브금 - KER FLU-trimmed.mp3",
]


def write_png(path: Path, width: int = 64, height: int = 64, rgba: tuple[int, int, int, int] = (245, 240, 230, 255)) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.stat().st_size > 200:
        return

    r, g, b, a = rgba
    row = bytes([r, g, b, a]) * width
    raw = b"".join(b"\x00" + row for _ in range(height))
    compressed = zlib.compress(raw, 9)

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", compressed) + chunk(b"IEND", b"")
    path.write_bytes(png)


def write_silent_mp3(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.stat().st_size > 200:
        return

  # Minimal MPEG frame (silence-ish stub for local dev/tests only).
    path.write_bytes(
        bytes.fromhex(
            "fff344c400000000000000000000000000000000000000000000000000000000"
            "00000000000000000000000000000000000000000000000000000000000000"
        )
    )


def main() -> None:
    for name in PNG_FILES:
        write_png(IMAGES / name)
    for name in MP3_FILES:
        write_silent_mp3(AUDIO / name)
    print("Asset stubs ready under housewarming/static/")


if __name__ == "__main__":
    main()
