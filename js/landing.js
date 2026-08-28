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

function fillProjectsTeaser(PROJECTS) {
  document.getElementById("projects-stats").innerHTML = statBlock(PROJECTS.length, "Live-Projekte");

  document.getElementById("projects-grid").innerHTML = PROJECTS.map((p, i) => {
    const host = new URL(p.url).host;
    // thum.io rendert synchron beim ersten Aufruf (kein "generating"-Platzhalter
    // wie bei mshots), danach cacht der Dienst das Bild selbst.
    const shotSrc = `https://image.thum.io/get/width/700/crop/460/noanimate/${p.url}`;
    return `
      <a class="project-card" style="--i:${i}" href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="${p.name} öffnen (neuer Tab)">
        <span class="project-chrome" aria-hidden="true">
          <span class="project-dots"><span></span><span></span><span></span></span>
          <span class="project-url">${host}</span>
        </span>
        <span class="project-shot">
          <img src="${shotSrc}" alt="Vorschau von ${p.name}" loading="lazy" onerror="this.style.display='none'">
        </span>
        <span class="project-meta">
          <span class="project-name">${p.name}</span>
          <span class="project-tag">${p.tag}</span>
        </span>
        <span class="project-visit" aria-hidden="true">Website öffnen <i>→</i></span>
      </a>`;
  }).join("");
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
  projects: "#4FC9B0",
  cycling: "#D45A22",
  raya: "#C98572",
  unbesiegbar: "#ffc94a",
};

function triggerThemePulse(theme) {
  const pulse = document.getElementById("theme-pulse");
  if (!pulse) return;
  pulse.style.setProperty("--pulse-color", THEME_PULSE_COLORS[theme] || "#33E7FF");
  pulse.classList.remove("is-pulsing");
  void pulse.offsetWidth; // Reflow erzwingen, damit die Animation bei erneutem Zufügen neu startet
  pulse.classList.add("is-pulsing");
}

// ---------- Partikelfeld je Sektion ----------
// Nur in #hero, #gaming und #unbesiegbar (Nutzerentscheidung) — jede Instanz liegt IN
// ihrer Sektion (position: absolute, siehe .section-particles) und scrollt dadurch mit
// der Seite mit, statt als Bildschirm-Overlay stehen zu bleiben.

const SECTION_PARTICLE_CONFIG = [
  { id: "hero-particles-canvas", colors: ["#33E7FF", "#C264FF", "#ff3ea5"] },
  { id: "gaming-particles-canvas", colors: ["#33E7FF", "#C264FF", "#ff3ea5"] },
  { id: "unbesiegbar-particles-canvas", colors: ["#ffc94a", "#ff3ea5", "#fff8ec"] },
];

function setupSectionParticles() {
  if (typeof createParticleField !== "function") return;
  SECTION_PARTICLE_CONFIG.forEach(({ id, colors }) => {
    const container = document.getElementById(id);
    if (!container) return;
    createParticleField(container, { colors, interactive: true });
  });
}

// ---------- Side-Nav-"Walze": Kapitel liegen auf einer gedachten liegenden Walze ----------
// Jeder Link bekommt anhand seines Index-Abstands zum aktiven Kapitel eine Position
// entlang eines Kreisbogens (Sinus für die Höhe, Kosinus für Skalierung/Blässe/Rückzug
// nach links) verpasst — reines 2D-Trigonometrie-Layout statt echtem 3D-Transform,
// damit der Text lesbar bleibt statt perspektivisch verzerrt zu werden.
const SIDE_WHEEL_ORDER = ["hero", "gaming", "projects", "cycling", "raya", "unbesiegbar"];
const SIDE_WHEEL_ANGLE_STEP = 30; // Grad pro Kapitel-Abstand
const SIDE_WHEEL_RADIUS = 56; // px, steuert den vertikalen Abstand der Einträge

function updateSideWheel(theme) {
  const sideLinks = document.querySelectorAll(".side-nav a");
  if (!sideLinks.length) return;
  const activeIndex = SIDE_WHEEL_ORDER.indexOf(theme);

  sideLinks.forEach((link) => {
    const index = SIDE_WHEEL_ORDER.indexOf(link.dataset.section);
    const d = index - activeIndex;
    const angleRad = (d * SIDE_WHEEL_ANGLE_STEP * Math.PI) / 180;
    const y = Math.sin(angleRad) * SIDE_WHEEL_RADIUS * 1.9;
    const scale = Math.cos(angleRad);
    const visible = Math.abs(d) <= 2;
    // Zurückweichen nach links, je kleiner (=weiter weg auf der Walze) ein Eintrag wird
    const x = (1 - Math.max(scale, 0)) * -34;
    const opacity = visible ? Math.max(0, scale) : 0;

    link.style.transform = `translate(${x.toFixed(1)}px, calc(-50% + ${y.toFixed(1)}px)) scale(${Math.max(scale, 0.001).toFixed(3)})`;
    link.style.opacity = opacity.toFixed(2);
    link.style.zIndex = String(100 - Math.abs(d));
    link.style.pointerEvents = visible ? "auto" : "none";
    link.classList.toggle("is-active", d === 0);
    link.setAttribute("aria-current", d === 0 ? "true" : "false");
  });
}

// ---------- Scroll-Story: Reveal, Zähler, Quicknav-Theme ----------

function setupScrollStory() {
  const nav = document.getElementById("quicknav");
  const sideNav = document.getElementById("side-nav");
  const sections = document.querySelectorAll(".story");
  const navLinks = document.querySelectorAll(".qn-links a");
  let lastTheme = null;

  const themeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const theme = entry.target.dataset.theme;
        nav.dataset.theme = theme;
        if (sideNav) sideNav.dataset.theme = theme;
        navLinks.forEach((link) =>
          link.classList.toggle("is-active", link.dataset.section === theme)
        );
        updateSideWheel(theme);
        // Nicht beim ersten Laden pulsieren, nur bei einem echten Kapitelwechsel
        if (lastTheme !== null && theme !== lastTheme) triggerThemePulse(theme);
        lastTheme = theme;
      });
    },
    // Löst aus, sobald die Sektion die Viewport-Mitte kreuzt — funktioniert unabhängig
    // von der Sektionshöhe (wichtig für die Projekte-Sektion, die auf schmalen
    // Bildschirmen durch die einspaltige Kartenliste deutlich höher als 100svh wird
    // und mit einem flächenbasierten Schwellwert wie 0.55 nie "sichtbar genug" wäre).
    { threshold: 0, rootMargin: "-45% 0px -45% 0px" }
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
    // threshold 0 + rootMargin statt eines Flächen-Schwellwerts: löst zuverlässig aus,
    // sobald der obere Teil des Elements in Sicht kommt — auch bei sehr hohen
    // .story-inner-Elementen (z.B. die Projekte-Karten-Liste einspaltig auf Mobile),
    // die mit einem Flächen-Schwellwert wie 0.3 nie ausreichend sichtbar wären.
    { threshold: 0, rootMargin: "0px 0px -15% 0px" }
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
  projects: "🔗",
  cycling: "🚲",
  raya: "🐾",
  unbesiegbar: "👑",
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
  fillProjectsTeaser(PROJECTS);
  fillCyclingTeaser(TOURS);
  fillRayaTeaser(RAYA_PHOTOS);
  setupSectionParticles();
  setupScrollStory();
  setupProgressBar();
  setupParallax();
  setupMagnetic(".story-cta", 0.25, 8);
  setupCursorTrails();
});
