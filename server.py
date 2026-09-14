"""Minimal standalone server for MoranMini HOUSE.

Replicates, as-is, the housewarming routing block from Issue-Shorts'
service/app.py (commit 989e8f5f3fc59489ed4fb31b978d68863b4ae767):
  - GET /m, /m/          -> 307 redirect to /housewarming/
  - GET /housewarming     -> 307 redirect to /housewarming/
  - /housewarming/*       -> StaticFiles(html=True) serving housewarming/

No HOUSE HTML/CSS/JS/assets are modified. This file only reproduces the
server-side routing that Issue-Shorts used to expose the same paths.
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parent

app = FastAPI(title="MoranMini HOUSE")

housewarming_root = ROOT / "housewarming"
if housewarming_root.is_dir():

    @app.get("/m", include_in_schema=False)
    @app.get("/m/", include_in_schema=False)
    def moranmini_qr_entry() -> RedirectResponse:
        """Short QR entry — redirects to the housewarming invite."""
        return RedirectResponse(url="/housewarming/", status_code=307)

    @app.get("/housewarming", include_in_schema=False)
    def housewarming_redirect() -> RedirectResponse:
        return RedirectResponse(url="/housewarming/", status_code=307)

    app.mount(
        "/housewarming",
        StaticFiles(directory=str(housewarming_root), html=True),
        name="housewarming",
    )


@app.get("/health", include_in_schema=False)
def health() -> dict:
    return {"status": "ok"}
