# MoranMini

MoranMini HOUSE 집들이 초대장 — Issue-Shorts 저장소의 `housewarming/`
(commit `989e8f5f3fc59489ed4fb31b978d68863b4ae767`)를 파일 그대로 복사한
독립 실행 repository입니다. HTML/CSS/JS/config/이미지/오디오는 원본에서
변경하지 않았습니다.

## 실행 방법

```bash
pip install -r requirements.txt
python3 -m uvicorn server:app --host 0.0.0.0 --port 8000
```

- `/housewarming/` — 초대장 (Issue-Shorts와 동일한 라우팅)
- `/m`, `/m/` — `/housewarming/`로 307 리다이렉트 (QR 단축 경로)
- `/housewarming` — `/housewarming/`로 307 리다이렉트

`server.py`는 Issue-Shorts `service/app.py`의 housewarming 관련 라우팅
블록만 그대로 재현한 최소 서버입니다(FastAPI `StaticFiles(html=True)` 마운트).
