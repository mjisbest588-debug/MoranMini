(() => {
  "use strict";

  const cfg = window.MORANMINI || {};
  const ADDRESS = cfg.address || "울산광역시 동구 안산로 50 동부아파트 113동 1403호";
  const SEARCH = cfg.search || "울산광역시 동구 안산로 50 동부아파트";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const RING_MS = reduceMotion ? 220 : 420;
  const DOOR_WAIT_MS = reduceMotion ? 900 : 2300;
  const OPEN_MS = reduceMotion ? 180 : 620;
  const KNOCK_ADVANCE_MS = 1000;

  const body = document.body;
  const overlay = document.getElementById("ringOverlay");
  const bellBtn = document.getElementById("bellBtn");
  const doorHit = document.getElementById("doorHit");
  const doorHint = document.getElementById("doorHint");
  const copyAddrBtn = document.getElementById("copyAddrBtn");
  const toast = document.getElementById("toast");
  const inviteTitle = document.getElementById("inviteTitle");
  const menuPop = document.getElementById("menuPop");
  const menuPopText = document.getElementById("menuPopText");
  const menuPopOk = document.getElementById("menuPopOk");
  const MENU_POPUP = cfg.menuPopup || "그냥 주는 대로 먹어~😁";
  const BG_VOL = 0.2;
  const SFX = { doorbell: null, doorOpen: null };
  let bgAudio = null;

  const musicBtn = document.getElementById("musicBtn");

  let view = "main";
  let doorTimer = 0;
  let knockTimer = 0;
  let knockPlayed = false;
  let opening = false;
  let doorReady = false;
  let revealObs = null;
  let audioUnlocked = false;
  let musicOn = true;

  function applyCopy() {
    document.querySelectorAll("[data-field]").forEach((el) => {
      const key = el.getAttribute("data-field");
      if (key && cfg[key]) el.textContent = cfg[key];
    });

    const iso = document.getElementById("whenIso");
    if (iso && cfg.timeIso) iso.setAttribute("datetime", cfg.timeIso);

    if (Array.isArray(cfg.addressLines)) {
      const addr = document.getElementById("addressText");
      if (addr) addr.innerHTML = cfg.addressLines.map(escapeHtml).join("<br />");
    }

    const letter = cfg.letter || {};
    const lead = document.getElementById("letterLead");
    const bodyEl = document.getElementById("letterBody");
    if (lead && letter.lead) lead.textContent = letter.lead;
    if (bodyEl && letter.body) {
      bodyEl.innerHTML = escapeHtml(letter.body).replace(/\n/g, "<br />");
    }

    (cfg.interludes || []).forEach((item, i) => {
      const el = document.querySelector(`[data-interlude="${i}"]`);
      if (!el) return;
      el.innerHTML =
        `<strong class="display">${escapeHtml(item.kicker || "")}</strong>${escapeHtml(item.line || "")}`;
    });

    const rsvpPrompt = document.getElementById("rsvpPrompt");
    if (rsvpPrompt && cfg.rsvpPrompt) rsvpPrompt.textContent = cfg.rsvpPrompt;

    const closingTitle = document.getElementById("closingTitle");
    const closingSign = document.getElementById("closingSign");
    if (closingTitle && cfg.closing && cfg.closing.title) {
      closingTitle.textContent = cfg.closing.title;
    }
    if (closingSign && cfg.closing && cfg.closing.sign) {
      closingSign.textContent = cfg.closing.sign;
    }

    renderMenu();
    renderHouseInfo();
    if (menuPopText) menuPopText.textContent = MENU_POPUP;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function audioUrl(path) {
    if (!path) return path;
    const slash = path.lastIndexOf("/");
    if (slash < 0) return encodeURI(path);
    return path.slice(0, slash + 1) + encodeURIComponent(path.slice(slash + 1));
  }

  function makeAudio(src, opts) {
    const audio = new Audio();
    audio.preload = "auto";
    audio.loop = !!(opts && opts.loop);
    audio.volume = opts && opts.volume != null ? opts.volume : 1;
    audio.src = audioUrl(src);
    audio.addEventListener("error", () => {});
    return audio;
  }

  function initAudio() {
    try {
      const assets = cfg.assets || {};
      if (assets.doorbell) SFX.doorbell = makeAudio(assets.doorbell, { volume: 0.55 });
      if (assets.doorOpen) SFX.doorOpen = makeAudio(assets.doorOpen, { volume: 0.42 });
      if (assets.background) bgAudio = makeAudio(assets.background, { loop: true, volume: BG_VOL });
    } catch (_err) {}
  }

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    if (!bgAudio) return;
    try {
      bgAudio.muted = true;
      const play = bgAudio.play();
      if (play && typeof play.then === "function") {
        play
          .then(() => {
            bgAudio.pause();
            bgAudio.currentTime = 0;
            bgAudio.muted = false;
          })
          .catch(() => {
            bgAudio.muted = false;
          });
      } else {
        bgAudio.muted = false;
      }
    } catch (_err) {
      bgAudio.muted = false;
    }
  }

  function playSound(key) {
    try {
      const audio = SFX[key];
      if (!audio) return;
      audio.muted = false;
      audio.currentTime = 0;
      const play = audio.play();
      if (play && typeof play.catch === "function") play.catch(() => {});
    } catch (_err) {}
  }

  function syncMusicBtn() {
    if (!musicBtn) return;
    const on = musicOn && bgAudio && !bgAudio.paused;
    musicBtn.setAttribute("aria-pressed", on ? "true" : "false");
    musicBtn.setAttribute("aria-label", on ? "배경음악 끄기" : "배경음악 켜기");
    musicBtn.innerHTML = on
      ? '<span aria-hidden="true">🎵</span>'
      : '<span aria-hidden="true">🔇</span>';
  }

  function startBackground() {
    if (!musicOn) {
      syncMusicBtn();
      return;
    }
    try {
      if (!bgAudio) {
        syncMusicBtn();
        return;
      }
      bgAudio.loop = true;
      bgAudio.muted = false;
      bgAudio.volume = BG_VOL;
      const play = bgAudio.play();
      if (play && typeof play.then === "function") {
        play.then(syncMusicBtn).catch(syncMusicBtn);
      } else {
        syncMusicBtn();
      }
    } catch (_err) {
      syncMusicBtn();
    }
  }

  function toggleMusic() {
    musicOn = !musicOn;
    try {
      if (bgAudio) {
        if (musicOn) {
          bgAudio.volume = BG_VOL;
          const play = bgAudio.play();
          if (play && typeof play.catch === "function") play.catch(() => {});
        } else {
          bgAudio.pause();
        }
      }
    } catch (_err) {}
    syncMusicBtn();
  }

  function menuNames() {
    const raw = Array.isArray(cfg.menu) ? cfg.menu : [];
    const names = [];
    raw.forEach((row) => {
      if (typeof row === "string") names.push(row);
      else if (row && typeof row.name === "string") names.push(row.name);
      else if (row && Array.isArray(row.items)) names.push(...row.items);
    });
    return names;
  }

  function renderMenu() {
    const root = document.getElementById("menuList");
    if (!root) return;
    root.innerHTML = menuNames()
      .map(
        (name, i) => `<button type="button" class="menu-item" data-menu-item="${i}">
          <span class="menu-check" aria-hidden="true"></span>
          <span class="menu-name">${escapeHtml(name)}</span>
        </button>`
      )
      .join("");
    root.querySelectorAll("[data-menu-item]").forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.classList.add("is-on");
        btn.setAttribute("aria-pressed", "true");
        openMenuPop();
      });
    });
  }

  function openMenuPop() {
    if (!menuPop) return;
    menuPop.hidden = false;
    requestAnimationFrame(() => menuPop.classList.add("is-in"));
    if (menuPopOk) menuPopOk.focus();
  }

  function closeMenuPop() {
    if (!menuPop || menuPop.hidden) return;
    menuPop.classList.remove("is-in");
    const hide = () => {
      menuPop.hidden = true;
    };
    if (reduceMotion) hide();
    else window.setTimeout(hide, 180);
  }

  function renderHouseInfo() {
    const root = document.getElementById("houseInfoList");
    if (!root) return;
    const notes = Array.isArray(cfg.houseInfo) ? cfg.houseInfo : [];
    root.innerHTML = notes
      .map((line) => `<li>${escapeHtml(line).replace(/\n/g, "<br />")}</li>`)
      .join("");
  }

  function setupReveal() {
    const nodes = document.querySelectorAll(".screen--invite .reveal");
    if (reduceMotion) {
      nodes.forEach((el) => el.classList.add("is-in"));
      return;
    }
    if (revealObs) revealObs.disconnect();
    revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObs.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    nodes.forEach((el) => {
      el.classList.remove("is-in");
      revealObs.observe(el);
    });
  }

  function setView(name) {
    view = name;
    body.dataset.view = name;
    overlay.hidden = name !== "bell";

    document.querySelectorAll("[data-screen]").forEach((el) => {
      const screen = el.dataset.screen;
      const on =
        (screen === "main" && (name === "main" || name === "bell")) ||
        (screen === "door" && (name === "door" || name === "opening")) ||
        (screen === "invite" && name === "invite");
      el.hidden = !on;
    });

    if (name === "invite") {
      document.documentElement.style.overflowX = "hidden";
      document.documentElement.style.overflowY = "";
      body.style.overflowX = "hidden";
      body.style.overflowY = "";
      window.scrollTo(0, 0);
      setupReveal();
      if (musicBtn) musicBtn.hidden = false;
      startBackground();
      inviteTitle.focus({ preventScroll: true });
    } else {
      document.documentElement.style.overflow = "hidden";
      body.style.overflow = "hidden";
      if (musicBtn) musicBtn.hidden = true;
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      toast.hidden = true;
    }, 1800);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_err) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    }
  }

  function wireMaps() {
    const q = encodeURIComponent(SEARCH);
    document.getElementById("kakaoMap").href = `https://map.kakao.com/?q=${q}`;
    document.getElementById("naverMap").href = `https://map.naver.com/p/search/${q}`;
    document.getElementById("googleMap").href =
      `https://www.google.com/maps/search/?api=1&query=${q}`;
  }

  function scheduleKnock() {
    knockPlayed = false;
    window.clearTimeout(knockTimer);
    const knockDelay = Math.max(0, DOOR_WAIT_MS - KNOCK_ADVANCE_MS);
    knockTimer = window.setTimeout(() => {
      knockPlayed = true;
      playSound("doorOpen");
    }, knockDelay);
  }

  function enterDoor() {
    setView("door");
    doorReady = false;
    opening = false;
    doorHint.textContent = "문을 여는 중이에요";
    window.clearTimeout(doorTimer);
    scheduleKnock();
    doorTimer = window.setTimeout(() => {
      doorReady = true;
      openDoor();
    }, DOOR_WAIT_MS);
  }

  function openDoor() {
    if (!doorReady || opening || (view !== "door" && view !== "opening")) return;
    opening = true;
    window.clearTimeout(doorTimer);
    window.clearTimeout(knockTimer);
    if (!knockPlayed) playSound("doorOpen");
    setView("opening");
    doorHint.textContent = "문이 열려요";
    window.setTimeout(() => {
      setView("invite");
    }, OPEN_MS);
  }

  bellBtn.addEventListener("click", () => {
    if (view !== "main") return;
    bellBtn.disabled = true;
    unlockAudio();
    playSound("doorbell");
    setView("bell");
    window.setTimeout(enterDoor, RING_MS);
  });

  doorHit.addEventListener("click", openDoor);

  copyAddrBtn.addEventListener("click", async () => {
    const ok = await copyText(ADDRESS);
    showToast(ok ? "주소를 복사했어요" : "복사에 실패했어요");
  });

  document.querySelectorAll("[data-rsvp]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-rsvp]").forEach((el) => {
        el.classList.toggle("is-on", el === btn);
      });
    });
  });

  if (menuPop) {
    menuPop.addEventListener("click", (event) => {
      if (event.target === menuPop) closeMenuPop();
    });
  }
  if (menuPopOk) menuPopOk.addEventListener("click", closeMenuPop);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenuPop();
  });

  if (musicBtn) musicBtn.addEventListener("click", toggleMusic);

  initAudio();
  applyCopy();
  wireMaps();
  setView("main");
})();
