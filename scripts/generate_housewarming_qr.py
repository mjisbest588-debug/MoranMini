#!/usr/bin/env python3
"""Generate the MoranMini HOUSE QR PNG for Issue-Shorts deployment."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "housewarming" / "static" / "images" / "qr-moranmini-house.png"
TARGET_URL = "https://issue-shorts-o7r2bqr5fq-du.a.run.app/housewarming/"


def main() -> None:
    try:
        import qrcode
    except ImportError as exc:
        raise SystemExit("Install qrcode first: pip install 'qrcode[pil]'") from exc

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    qr = qrcode.QRCode(box_size=8, border=2)
    qr.add_data(TARGET_URL)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(OUTPUT)
    print(f"Wrote {OUTPUT} -> {TARGET_URL}")


if __name__ == "__main__":
    main()
