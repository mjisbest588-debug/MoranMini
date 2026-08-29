/**
 * MoranMini HOUSE — client flow & audio timing.
 * Timing values are centralized here for parity with deployed Issue-Shorts build.
 */
const AUDIO = {
  doorbellVolume: 0.9,
  doorOpenVolume: 0.85,
  bgmVolume: 0.35,
  bgmLoop: true,
  dingdongDelayMs: 120,
  doorBeforeDelayMs: 900,
  knockAnimMs: 500,
  doorOpenDelayMs: 200,
  invitationDelayMs: 950,
  knockEarlyMs: 1000,
};

const SCENES = [
  "scene-main",
  "scene-tshirts",
  "scene-doorbell",
  "scene-dingdong",
  "scene-door-before",
  "scene-door-open",
  "scene-invitation",
];

const state = {
  tshirtTaps: new Set(),
  scene: "scene-main",
  bgmEnabled: true,
  menuPopupShown: false,
  knockHandled: false,
  doorOpenAudioStarted: false,
};

const els = {
  scenes: Object.fromEntries(SCENES.map((id) => [id, document.getElementById(id)])),
  btnStart: document.getElementById("btn-start"),
  tshirt1: document.getElementById("tshirt-1"),
  tshirt2: document.getElementById("tshirt-2"),
  btnDoorbell: document.getElementById("btn-doorbell"),
  dingdongText: document.getElementById("dingdong-text"),
  btnKnock: document.getElementById("btn-knock"),
  btnMusic: document.getElementById("btn-music"),
  menuList: document.getElementById("menu-list"),
  menuPopup: document.getElementById("menu-popup"),
  btnPopupClose: document.getElementById("btn-popup-close"),
  doorbell: document.getElementById("audio-doorbell"),
  doorOpen: document.getElementById("audio-door-open"),
  bgm: document.getElementById("audio-bgm"),
};

function showScene(id) {
  SCENES.forEach((sceneId) => {
    els.scenes[sceneId].classList.toggle("scene--active", sceneId === id);
  });
  state.scene = id;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function playAudio(audio, volume) {
  if (!audio) return Promise.resolve();
  audio.volume = volume;
  audio.currentTime = 0;
  const playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {});
  }
  return new Promise((resolve) => {
    const done = () => {
      audio.removeEventListener("ended", done);
      resolve();
    };
    if (audio.duration && Number.isFinite(audio.duration)) {
      audio.addEventListener("ended", done, { once: true });
    } else {
      setTimeout(done, 800);
    }
  });
}

async function startBgm() {
  if (!state.bgmEnabled || !els.bgm) return;
  els.bgm.volume = AUDIO.bgmVolume;
  els.bgm.loop = AUDIO.bgmLoop;
  try {
    await els.bgm.play();
  } catch (_) {
    /* autoplay may be blocked until user gesture */
  }
}

function stopBgm() {
  if (!els.bgm) return;
  els.bgm.pause();
  els.bgm.currentTime = 0;
}

function toggleBgm() {
  state.bgmEnabled = !state.bgmEnabled;
  els.btnMusic.setAttribute("aria-pressed", String(state.bgmEnabled));
  if (state.bgmEnabled) {
    startBgm();
  } else {
    stopBgm();
  }
}

async function onTshirtTap(id, button) {
  button.classList.add("is-tapped");
  state.tshirtTaps.add(id);
  if (state.tshirtTaps.size >= 2) {
    await wait(350);
    showScene("scene-doorbell");
  }
}

function waitForAudioEnd(audio) {
  if (!audio) return Promise.resolve();
  return new Promise((resolve) => {
    if (audio.ended) {
      resolve();
      return;
    }
    audio.addEventListener("ended", () => resolve(), { once: true });
  });
}

async function startDoorOpenAudio() {
  if (state.doorOpenAudioStarted || !els.doorOpen) return;
  state.doorOpenAudioStarted = true;
  els.doorOpen.volume = AUDIO.doorOpenVolume;
  els.doorOpen.currentTime = 0;
  const playPromise = els.doorOpen.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {});
  }
}

async function onDoorbell() {
  els.btnDoorbell.classList.add("is-ringing");
  els.btnDoorbell.disabled = true;
  await playAudio(els.doorbell, AUDIO.doorbellVolume);
  await wait(AUDIO.dingdongDelayMs);
  showScene("scene-dingdong");
  const knockAudioLeadMs =
    AUDIO.doorBeforeDelayMs + AUDIO.knockAnimMs + AUDIO.doorOpenDelayMs - AUDIO.knockEarlyMs;
  setTimeout(() => {
    startDoorOpenAudio();
  }, knockAudioLeadMs);
  await wait(AUDIO.doorBeforeDelayMs);
  showScene("scene-door-before");
  onKnock();
}

async function onKnock() {
  if (state.knockHandled) return;
  state.knockHandled = true;
  els.btnKnock.disabled = true;
  els.btnKnock.textContent = "똑똑";
  await wait(AUDIO.knockAnimMs);
  showScene("scene-door-open");
  await wait(AUDIO.doorOpenDelayMs);
  if (!state.doorOpenAudioStarted) {
    await playAudio(els.doorOpen, AUDIO.doorOpenVolume);
  } else {
    await waitForAudioEnd(els.doorOpen);
  }
  await wait(AUDIO.invitationDelayMs + AUDIO.knockEarlyMs);
  showScene("scene-invitation");
  startBgm();
}

function onMenuChange(event) {
  const target = event.target;
  if (target.type !== "checkbox" || !target.checked || state.menuPopupShown) return;
  state.menuPopupShown = true;
  els.menuPopup.hidden = false;
}

function closeMenuPopup() {
  els.menuPopup.hidden = true;
}

function bindEvents() {
  els.btnStart.addEventListener("click", () => showScene("scene-tshirts"));
  els.tshirt1.addEventListener("click", () => onTshirtTap("tshirt-1", els.tshirt1));
  els.tshirt2.addEventListener("click", () => onTshirtTap("tshirt-2", els.tshirt2));
  els.btnDoorbell.addEventListener("click", onDoorbell);
  els.btnKnock.addEventListener("click", onKnock);
  els.btnMusic.addEventListener("click", toggleBgm);
  els.menuList.addEventListener("change", onMenuChange);
  els.btnPopupClose.addEventListener("click", closeMenuPopup);

  document.querySelectorAll(".btn--rsvp").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.add("is-tapped");
      btn.textContent = "기다릴게요!";
    });
  });
}

bindEvents();
