// ---------- Teaser-Inhalte aus den echten Daten-Dateien ----------

function statBlock(value, label) {
  // data-count = Zielwert für die Zähl-Animation, angezeigter Text kommt erst beim Reveal
  return `<div><span class="value" data-count="${value}">0</span><span class="label">${label}</span></div>`;
}

function fillGamingTeaser(GAMES) {
  const totalHours = GAMES.reduce((s, g) => s + g.hours, 0);
  document.getElementById("gaming-stats").innerHTML =
    statBlock(GAMES.length, "Spiele") + statBlock(totalHours, "Stunden");

  const top = [...GAMES].sort((a, b) => b.hours - a.hours).slice(0, 4);
  document.getElementById("gaming-chips").innerHTML = top
    .map(
      (g) => `
      <span class="chip" style="--accent:${g.accent}">
        <span class="chip-dot"></span>${g.title}
        <span class="chip-value">${g.hours.toLocaleString("de-DE")}h</span>
      </span>`
    )
    .join("");
}

function fillCyclingTeaser(TOURS) {
  const totalKm = TOURS.reduce((s, t) => s + t.distanceKm, 0);
  const totalHm = TOURS.reduce((s, t) => s + t.elevationM, 0);
  document.getElementById("cycling-stats").innerHTML =
    statBlock(TOURS.length, "Touren") +
    statBlock(totalKm, "Kilometer") +
    statBlock(totalHm, "Höhenmeter");

  document.getElementById("cycling-chips").innerHTML = TOURS.slice(0, 4)
    .map(
      (t) => `
      <span class="chip">
        ${t.title}
        <span class="chip-value">${t.distanceKm.toLocaleString("de-DE")} km</span>
      </span>`
    )
    .join("");
}

function fillRayaTeaser(RAYA_PHOTOS) {
  document.getElementById("raya-stats").innerHTML = statBlock(RAYA_PHOTOS.length, "Fotos");

  // Immer die 3 Fotos mit dem aktuellsten Datum
  const latest = [...RAYA_PHOTOS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  document.getElementById("raya-preview").innerHTML = latest
    .map((photo) =>
      photo.src
        ? `
      <div class="preview-tile" aria-hidden="true">
        <img src="${photo.src}" alt="" loading="lazy">
      </div>`
        : `
      <div class="preview-tile" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="30" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="14" r="5" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="9" r="5" stroke="currentColor" stroke-width="2"/><circle cx="36" cy="14" r="5" stroke="currentColor" stroke-width="2"/></svg>
      </div>`
    )
    .join("");
}

// ---------- Zähl-Animation für Kennzahlen ----------

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateCount(el) {
  const target = Number(el.dataset.count);
  if (Number.isNaN(target) || el.dataset.counted) return;
  el.dataset.counted = "true";

  if (prefersReducedMotion) {
    el.textContent = target.toLocaleString("de-DE");
    return;
  }

  const duration = 1100;
  const start = performance.now();
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.round(target * easeOutExpo(progress));
    el.textContent = value.toLocaleString("de-DE");
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ---------- Farb-Pulsschlag beim Kapitelwechsel ----------

const THEME_PULSE_COLORS = {
  hero: "#33E7FF",
  gaming: "#33E7FF",
  cycling: "#D45A22",
  raya: "#C98572",
};

function triggerThemePulse(theme) {
  const pulse = document.getElementById("theme-pulse");
  if (!pulse) return;
  pulse.style.setProperty("--pulse-color", THEME_PULSE_COLORS[theme] || "#33E7FF");
  pulse.classList.remove("is-pulsing");
  void pulse.offsetWidth; // Reflow erzwingen, damit die Animation bei erneutem Zufügen neu startet
  pulse.classList.add("is-pulsing");
}

// ---------- Scroll-Story: Reveal, Zähler, Quicknav-Theme ----------

function setupScrollStory() {
  const nav = document.getElementById("quicknav");
  const sections = document.querySelectorAll(".story");
  const navLinks = document.querySelectorAll(".qn-links a");
  let lastTheme = null;

  const themeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const theme = entry.target.dataset.theme;
        nav.dataset.theme = theme;
        navLinks.forEach((link) =>
          link.classList.toggle("is-active", link.dataset.section === theme)
        );
        // Nicht beim ersten Laden pulsieren, nur bei einem echten Kapitelwechsel
        if (lastTheme !== null && theme !== lastTheme) triggerThemePulse(theme);
        lastTheme = theme;
      });
    },
    { threshold: 0.55 }
  );
  sections.forEach((section) => themeObserver.observe(section));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const inner = entry.target;
        inner.classList.add("is-visible");
        inner.closest(".story")?.classList.add("is-visible");
        inner.querySelectorAll("[data-count]").forEach(animateCount);
        revealObserver.unobserve(inner);
      });
    },
    { threshold: 0.3 }
  );
  document.querySelectorAll(".story-inner").forEach((inner) => revealObserver.observe(inner));
}

// ---------- Scroll-Fortschritt in der Quicknav ----------

function setupProgressBar() {
  const nav = document.getElementById("quicknav");
  let ticking = false;

  function update() {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (scrolled / max) * 100 : 0;
    nav.style.setProperty("--progress", pct + "%");
    ticking = false;
  }

  update();
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
}

// ---------- Dezenter Parallax-Effekt auf den Kapitel-Hintergründen ----------

function setupParallax() {
  if (prefersReducedMotion) return;

  // Hero-Hintergrund hat seine eigene CSS-Animation (glow-shift) — hier ausgenommen,
  // sonst würde die Animation den per JS gesetzten transform-Wert jeden Frame überschreiben.
  const layers = Array.from(document.querySelectorAll(".story:not(.story-hero) .story-bg"));
  if (!layers.length) return;

  let ticking = false;

  function update() {
    const viewportH = window.innerHeight;
    layers.forEach((layer) => {
      const rect = layer.parentElement.getBoundingClientRect();
      // 0 = Sektion mittig im Viewport; negativ/positiv je nach Scrollrichtung
      const center = rect.top + rect.height / 2 - viewportH / 2;
      const offset = center * -0.08;
      layer.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
    ticking = false;
  }

  update();
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", update);
}

const hasFineCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ---------- Magnetischer CTA-Button: zieht sich leicht zum Cursor ----------

function setupMagnetic(selector, strength, maxOffset) {
  if (prefersReducedMotion || !hasFineCursor) return;

  document.body.addEventListener("mouseover", (e) => {
    const el = e.target.closest(selector);
    if (!el || el.dataset.magnetBound) return;
    el.dataset.magnetBound = "true";

    el.addEventListener("mousemove", (ev) => {
      const rect = el.getBoundingClientRect();
      const relX = ev.clientX - (rect.left + rect.width / 2);
      const relY = ev.clientY - (rect.top + rect.height / 2);
      const x = Math.max(-maxOffset, Math.min(maxOffset, relX * strength));
      const y = Math.max(-maxOffset, Math.min(maxOffset, relY * strength));
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

// ---------- Themen-Spur: die Maus hinterlässt in jedem Kapitel ein passendes Symbol ----------

const TRAIL_ICONS = {
  hero: "✨",
  gaming: "⚡",
  cycling: "🚲",
  raya: "🐾",
};

function setupCursorTrails() {
  if (prefersReducedMotion || !hasFineCursor) return;

  Object.entries(TRAIL_ICONS).forEach(([sectionId, icon]) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    let lastSpawn = 0;
    let flip = 1;

    section.addEventListener(
      "mousemove",
      (e) => {
        const now = performance.now();
        if (now - lastSpawn < 150) return;
        lastSpawn = now;
        flip *= -1;

        const rect = section.getBoundingClientRect();
        const mark = document.createElement("span");
        mark.className = "cursor-trail-mark";
        mark.textContent = icon;
        mark.style.left = `${e.clientX - rect.left}px`;
        mark.style.top = `${e.clientY - rect.top}px`;
        mark.style.setProperty("--flip", flip);
        mark.style.setProperty("--rot", `${(Math.random() * 20 - 10).toFixed(1)}deg`);
        section.appendChild(mark);
        mark.addEventListener("animationend", () => mark.remove());
      },
      { passive: true }
    );
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fillGamingTeaser(GAMES);
  fillCyclingTeaser(TOURS);
  fillRayaTeaser(RAYA_PHOTOS);
  setupScrollStory();
  setupProgressBar();
  setupParallax();
  setupMagnetic(".story-cta", 0.25, 8);
  setupCursorTrails();
});
