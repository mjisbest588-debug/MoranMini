"""Independent tests for MoranMini HOUSE server."""

from __future__ import annotations

import importlib.util
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture
def client():
    spec = importlib.util.spec_from_file_location("moranmini_app", ROOT / "app.py")
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    module.app.config["TESTING"] = True
    with module.app.test_client() as test_client:
        yield test_client


def test_root_redirects_to_housewarming(client):
    response = client.get("/")
    assert response.status_code == 302
    assert response.headers["Location"].endswith("/housewarming/")


def test_mobile_qr_redirect(client):
    response = client.get("/m")
    assert response.status_code == 302
    assert "/housewarming/" in response.headers["Location"]


def test_housewarming_index(client):
    response = client.get("/housewarming/")
    assert response.status_code == 200
    body = response.get_data(as_text=True)
    assert "MoranMini" in body
    assert "INVITATION" in body
    assert "TODAY'S MENU" in body
    assert "아구찜" in body
    assert "주차는 바로 앞 경비실에서" in body


def test_qr_preview(client):
    response = client.get("/housewarming/qr-preview")
    assert response.status_code == 200
    body = response.get_data(as_text=True)
    assert "qr-moranmini-house.png" in body


def test_static_assets(client):
    assets = [
        "/housewarming/static/css/style.css",
        "/housewarming/static/js/app.js",
        "/housewarming/static/images/tshirt-1.png",
        "/housewarming/static/images/door-before.png",
        "/housewarming/static/audio/doorbell.mp3",
    ]
    for path in assets:
        response = client.get(path)
        assert response.status_code == 200, path


def test_py_compile_app():
    result = subprocess.run(
        [sys.executable, "-m", "py_compile", str(ROOT / "app.py")],
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stderr
