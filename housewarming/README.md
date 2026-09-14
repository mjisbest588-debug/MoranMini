# MoranMini HOUSE

메인 웹 UI와 **분리된** 모바일 집들이 QR 초대장입니다.

## QR

집들이 전용 짧은 진입 주소:

```
https://issue-shorts-o7r2bqr5fq-du.a.run.app/m
```

스캔하면 `/housewarming/` 초대장으로 바로 연결됩니다. Issue Shorts `/` UI는 거치지 않습니다.

QR PNG: `assets/qr-moranmini-house.png`  
미리보기/다운로드: `/housewarming/qr.html`

## 여는 방법

같은 FastAPI 서비스에서:

```
http://127.0.0.1:8080/housewarming/
```

정적 파일만 따로 올려도 됩니다 (`index.html`이 진입점).

```bash
cd housewarming
python3 -m http.server 4173
# → http://127.0.0.1:4173/
```

이미지 교체는 [`assets/README.md`](assets/README.md)를 보세요.
