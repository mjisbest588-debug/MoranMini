"""Minimal server for MoranMini HOUSE (standalone)."""

from __future__ import annotations

from pathlib import Path

from flask import Flask, redirect, send_from_directory

ROOT = Path(__file__).resolve().parent
HOUSEWARMING_DIR = ROOT / "housewarming"

app = Flask(__name__, static_folder=None)


@app.get("/")
def root() -> str:
    return redirect("/housewarming/", code=302)


@app.get("/m")
def mobile_qr_entry() -> str:
    return redirect("/housewarming/", code=302)


@app.get("/housewarming/")
@app.get("/housewarming")
def housewarming_index() -> str:
    return send_from_directory(HOUSEWARMING_DIR, "index.html")


@app.get("/housewarming/qr-preview")
@app.get("/housewarming/qr-preview/")
def qr_preview() -> str:
    return send_from_directory(HOUSEWARMING_DIR, "qr-preview.html")


@app.get("/housewarming/<path:filename>")
def housewarming_static(filename: str):
    return send_from_directory(HOUSEWARMING_DIR, filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(__import__("os").environ.get("PORT", "8080")))
