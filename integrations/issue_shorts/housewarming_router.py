"""FastAPI routes for MoranMini HOUSE on Issue-Shorts.

Copy `housewarming/` and this module into the Issue-Shorts repo, then mount the
router from the main FastAPI app. See INTEGRATION.md for exact wiring steps.
"""

from __future__ import annotations

import mimetypes
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, RedirectResponse

ROOT = Path(__file__).resolve().parents[2]
HOUSEWARMING_DIR = ROOT / "housewarming"


def _resolve_housewarming_path(filename: str) -> Path:
    base = HOUSEWARMING_DIR.resolve()
    target = (base / filename).resolve()
    if not str(target).startswith(str(base)):
        raise HTTPException(status_code=404, detail="Not Found")
    if not target.is_file():
        raise HTTPException(status_code=404, detail="Not Found")
    return target


def create_housewarming_router(*, include_mobile_redirect: bool = True) -> APIRouter:
    router = APIRouter(include_in_schema=True)

    if include_mobile_redirect:

        @router.get("/m", include_in_schema=True)
        def housewarming_mobile_redirect() -> RedirectResponse:
            return RedirectResponse(url="/housewarming/", status_code=302)

    @router.get("/housewarming", include_in_schema=True)
    @router.get("/housewarming/", include_in_schema=True)
    def housewarming_index() -> FileResponse:
        return FileResponse(HOUSEWARMING_DIR / "index.html", media_type="text/html; charset=utf-8")

    @router.get("/housewarming/qr-preview", include_in_schema=True)
    @router.get("/housewarming/qr-preview/", include_in_schema=True)
    def housewarming_qr_preview() -> FileResponse:
        return FileResponse(HOUSEWARMING_DIR / "qr-preview.html", media_type="text/html; charset=utf-8")

    @router.get("/housewarming/{filename:path}", include_in_schema=True)
    def housewarming_static(filename: str) -> FileResponse:
        target = _resolve_housewarming_path(filename)
        media_type, _ = mimetypes.guess_type(str(target))
        return FileResponse(target, media_type=media_type)

    return router
