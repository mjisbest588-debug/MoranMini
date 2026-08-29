# MoranMini HOUSE

MoranMini HOUSE는 **독립 실행** 집들이 초대장 웹앱입니다. Issue-Shorts의 worker/API/이슈한입 UI에 의존하지 않습니다.

## 실행

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/generate_asset_stubs.py   # 최초 1회 (이미지/오디오 스텁)
python app.py
```

브라우저에서 확인:

- http://localhost:8080/housewarming/
- http://localhost:8080/m (→ `/housewarming/` 리다이렉트)
- http://localhost:8080/housewarming/qr-preview

## 테스트

```bash
pip install -r requirements.txt
python scripts/generate_asset_stubs.py
pytest -q
python -m py_compile app.py
```

## 에셋

실제 배포용 이미지·사운드는 Issue-Shorts `/housewarming/` 최종 파일을 `housewarming/static/` 아래에 그대로 교체하세요.

- `static/images/tshirt-1.png`, `tshirt-2.png`, `door-before.png`, `qr-moranmini-house.png`
- `static/audio/doorbell.mp3`, `door-open.mp3`, `러브하우스 브금 - KER FLU-trimmed.mp3`

## 구조

```
app.py                 # 최소 Flask 서버
housewarming/
  index.html           # 초대장 UI
  qr-preview.html      # QR 미리보기
  static/css/style.css
  static/js/app.js
  static/images/
  static/audio/
tests/test_app.py
```
