# Issue-Shorts `/housewarming/` 통합

MoranMini HOUSE를 `https://issue-shorts-o7r2bqr5fq-du.a.run.app/housewarming/` 에서 서비스하려면 Issue-Shorts FastAPI 앱에 아래 라우트를 추가한 뒤 Cloud Run을 재배포하세요.

## 1. 파일 복사

MoranMini 저장소에서 Issue-Shorts 저장소 루트로 복사:

- `housewarming/` (전체 디렉터리)
- `integrations/issue_shorts/housewarming_router.py`

Issue-Shorts 쪽 권장 위치:

```text
issue-shorts/
  housewarming/
  app/routes/housewarming.py   # housewarming_router.py 내용
```

`housewarming_router.py`의 `ROOT`/`HOUSEWARMING_DIR` 경로는 Issue-Shorts 레이아웃에 맞게 조정하세요. 예:

```python
ROOT = Path(__file__).resolve().parents[2]  # repo root
HOUSEWARMING_DIR = ROOT / "housewarming"
```

## 2. FastAPI 앱에 라우터 등록

`main.py` 또는 라우터를 모으는 모듈에 추가:

```python
from app.routes.housewarming import create_housewarming_router

app.include_router(create_housewarming_router())
```

기존 `/` 루트 HTML 라우트와 충돌하지 않습니다. MoranMini 전용 루트 리다이렉트(`/ → /housewarming/`)는 Issue-Shorts 메인 UI를 덮어쓰므로 **등록하지 않습니다**.

## 3. 배포 후 확인

```bash
curl -I "https://issue-shorts-o7r2bqr5fq-du.a.run.app/housewarming/"
curl -I "https://issue-shorts-o7r2bqr5fq-du.a.run.app/m"
curl -I "https://issue-shorts-o7r2bqr5fq-du.a.run.app/housewarming/static/css/style.css"
```

모두 `200` 또는 `/m`은 `302` → `/housewarming/` 이어야 합니다.

## 4. QR 코드

`housewarming/static/images/qr-moranmini-house.png` 는 아래 URL을 가리키도록 생성되어 있습니다.

`https://issue-shorts-o7r2bqr5fq-du.a.run.app/housewarming/`

재생성:

```bash
python scripts/generate_housewarming_qr.py
```
