window.MORANMINI = {
  assets: {
    tshirt1: "assets/tshirt-1.png",
    tshirt2: "assets/tshirt-2.png",
    doorBefore: "assets/door-before.png",
    doorbell: "assets/doorbell.mp3",
    doorOpen: "assets/door-open.mp3",
    background: "assets/러브하우스 브금 - KER FLU-trimmed.mp3",
  },
  date: "2026.09.18",
  timeFormula: "십팔시 - 2",
  timeResult: "십구시",
  timePm: "(7PM)",
  timeDisplay: "십구시 (7PM)",
  timeIso: "2026-09-18T19:00",
  address: "울산광역시 동구 안산로 50 동부아파트 113동 1403호",
  addressLines: ["울산광역시 동구 안산로 50", "동부아파트 113동 1403호"],
  search: "울산광역시 동구 안산로 50 동부아파트",
  letter: {
    lead: "우리 집에 놀러 와요",
    body: "작지만 행복만은 큰집으로\n초대합니다\n편한 차림으로 오면 돼요",
  },
  interludes: [
    { kicker: "으악", line: "벌써 집들이 날이에요" },
  ],
  menu: ["아구찜", "떡볶이", "갈비찜", "회"],
  menuPopup: "그냥 주는 대로 먹어~😁",
  rsvpPrompt: "오실 건가요?",
  houseInfo: [
    "편한 차림으로 와 주세요",
    "작은 집이라 선물은 마음만 주시면 충분해요",
    "주차는 바로 앞 경비실에서\n방문증을 발급 받아 주세요😁",
  ],
  closing: {
    title: "오늘, 우리 집에서 만나요",
    sign: "MoranMini HOUSE",
  },
};

(function preloadMainImages() {
  var assets = window.MORANMINI.assets;
  ["tshirt1", "tshirt2", "doorBefore"].forEach(function (key) {
    var link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = assets[key];
    document.head.appendChild(link);
  });
})();

function applyMoranminiAssets() {
  var assets = window.MORANMINI.assets;
  document.querySelectorAll("[data-asset]").forEach(function (el) {
    var key = el.getAttribute("data-asset");
    if (key && assets[key]) {
      el.setAttribute("src", assets[key]);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", applyMoranminiAssets);
} else {
  applyMoranminiAssets();
}
