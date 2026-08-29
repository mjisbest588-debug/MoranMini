"""Tests for the Issue-Shorts FastAPI housewarming router."""

from __future__ import annotations

from pathlib import Path

import pytest

fastapi = pytest.importorskip("fastapi")
httpx = pytest.importorskip("httpx")
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from integrations.issue_shorts.housewarming_router import create_housewarming_router  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(create_housewarming_router())
    with TestClient(app) as test_client:
        yield test_client


def test_mobile_redirect(client):
    response = client.get("/m", follow_redirects=False)
    assert response.status_code == 302
    assert response.headers["location"] == "/housewarming/"


def test_housewarming_index(client):
    response = client.get("/housewarming/")
    assert response.status_code == 200
    assert "MoranMini" in response.text
    assert "아구찜" in response.text


def test_qr_preview(client):
    response = client.get("/housewarming/qr-preview")
    assert response.status_code == 200
    assert "qr-moranmini-house.png" in response.text


def test_static_assets(client):
    assets = [
        "/housewarming/static/css/style.css",
        "/housewarming/static/js/app.js",
        "/housewarming/static/images/tshirt-1.jpg",
        "/housewarming/static/audio/doorbell.mp3",
    ]
    for path in assets:
        response = client.get(path)
        assert response.status_code == 200, path


def test_path_traversal_is_blocked(client):
    response = client.get("/housewarming/../app.py")
    assert response.status_code in {404, 400}
