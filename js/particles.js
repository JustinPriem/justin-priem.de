// ---------- Wiederverwendbares Canvas-Partikelfeld ----------
// Kein Fluid-Solver, sondern zwei überlagerte Bewegungen pro Partikel:
// eine ambiente Sinus-Drift plus eine gedämpfte Abstoßung vom Mauszeiger.
// Rendering per vorgerendertem Sprite (kein shadowBlur, siehe getSprite()).
//
// Nutzung: const field = createParticleField(containerEl, { colors, density, interactive });
//          field?.setColors(["#..."]);   // sanfter Farbwechsel, z. B. bei Sektionswechsel

function createParticleField(container, options = {}) {
  if (!container) return null;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return null;

  const hasFineCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const config = {
    colors: options.colors && options.colors.length ? options.colors : ["#33E7FF", "#C264FF", "#ECEAE3"],
    interactive: options.interactive !== false,
  };

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // ---- Canvas-Setup ----
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute; inset:0; display:block; width:100%; height:100%;";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const DPR_CAP = 2;
  let width = 0;
  let height = 0;

  // ---- Sprite-Vorrender: ein Radial-Gradient-Sprite pro Grundfarbe ----
  // Ersetzt Live-Glow via shadowBlur (teuer) durch einmal vorgerechnete Sprites,
  // die pro Partikel nur noch per drawImage() gezeichnet werden. Dreistufiger
  // Verlauf (aufgehelltes Zentrum → volle Farbe → transparent) statt eines flachen
  // Farbpunkts, für einen glühenden Glint-Look statt schlichter Kreise.
  const SPRITE_SIZE = 48;
  const spriteCache = new Map();

  function lighten(hexColor, amount) {
    const n = parseInt(hexColor.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    const mix = (c) => Math.round(c + (255 - c) * amount);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  }

  function getSprite(hexColor) {
    let sprite = spriteCache.get(hexColor);
    if (sprite) return sprite;
    sprite = document.createElement("canvas");
    sprite.width = SPRITE_SIZE;
    sprite.height = SPRITE_SIZE;
    const sctx = sprite.getContext("2d");
    const r = SPRITE_SIZE / 2;
    const grad = sctx.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, lighten(hexColor, 0.72));
    grad.addColorStop(0.32, hexColor);
    grad.addColorStop(1, `${hexColor}00`); // 8-stelliges Hex mit Alpha 0 = transparent
    sctx.fillStyle = grad;
    sctx.beginPath();
    sctx.arc(r, r, r, 0, Math.PI * 2);
    sctx.fill();
    spriteCache.set(hexColor, sprite);
    return sprite;
  }

  // ---- Partikel ----
  let particles = [];

  function createParticle() {
    const depth = Math.random(); // 0 = weit hinten, 1 = weit vorn
    const fx = Math.random();
    const fy = Math.random();
    return {
      fx, fy, // Ankerposition als Anteil der Fläche, für stabile Neuberechnung bei Resize
      anchorX: fx * width,
      anchorY: fy * height,
      ampX: 16 + depth * 26,
      ampY: 12 + depth * 22,
      freqX: 0.05 + Math.random() * 0.07,
      freqY: 0.045 + Math.random() * 0.08,
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      twinkleFreq: 0.5 + Math.random() * 0.7,
      twinklePhase: Math.random() * Math.PI * 2,
      size: 2.4 + depth * 4.6,
      baseAlpha: 0.35 + depth * 0.5,
      offsetX: 0,
      offsetY: 0,
      colorIdx: Math.floor(Math.random() * 8),
      x: 0,
      y: 0,
    };
  }

  function targetParticleCount() {
    return clamp(Math.round((width * height) / 7000), 90, 260);
  }

  function ensureParticleCount() {
    const target = targetParticleCount();
    while (particles.length < target) particles.push(createParticle());
    if (particles.length > target) particles.length = target;
  }

  // ---- Farbverlauf (Cross-Fade zwischen zwei Paletten) ----
  let paletteFrom = config.colors.slice();
  let paletteTo = config.colors.slice();
  let transitionStart = 0;
  const TRANSITION_MS = 900;

  function setColors(newColors) {
    if (!newColors || !newColors.length) return;
    paletteFrom = paletteTo;
    paletteTo = newColors.slice();
    transitionStart = performance.now();
  }

  // ---- Cursor-Anziehung (nur bei feinem Zeiger) ----
  const pointer = { x: 0, y: 0, active: false };
  if (hasFineCursor && config.interactive) {
    window.addEventListener(
      "pointermove",
      (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.active = true;
      },
      { passive: true }
    );
    document.addEventListener("mouseleave", () => {
      pointer.active = false;
    });
  }

  function updatePull(p, ambientX, ambientY, originX, originY) {
    if (hasFineCursor && config.interactive && pointer.active) {
      // Richtungsvektor WEG vom Zeiger (Abstoßung statt Anziehung), normiert und auf
      // eine begrenzte Schub-Distanz skaliert — bleibt auch dicht am Zeiger stabil,
      // statt bei kleinem Abstand numerisch zu "explodieren". pointer.x/y sind
      // Viewport-Koordinaten, ambientX/Y sind lokale Container-Koordinaten (der
      // Container scrollt mit der Seite mit) — über originX/Y ineinander umgerechnet.
      const dx = ambientX - (pointer.x - originX);
      const dy = ambientY - (pointer.y - originY);
      const dist = Math.hypot(dx, dy) || 1;
      const radius = 190;
      if (dist < radius) {
        const strength = 1 - dist / radius;
        const nx = dx / dist;
        const ny = dy / dist;
        const pushDistance = strength * 120;
        const targetX = nx * pushDistance;
        const targetY = ny * pushDistance;
        p.offsetX += (targetX - p.offsetX) * 0.12;
        p.offsetY += (targetY - p.offsetY) * 0.12;
        return;
      }
    }
    // Zurückfedern in die Drift-Bahn, wenn außerhalb des Radius oder kein Zeiger
    p.offsetX += (0 - p.offsetX) * 0.06;
    p.offsetY += (0 - p.offsetY) * 0.06;
  }

  function drawParticle(hex, x, y, size, alpha) {
    if (alpha <= 0.01) return;
    ctx.globalAlpha = clamp(alpha, 0, 1);
    const sprite = getSprite(hex);
    ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
  }

  // ---- Animationsschleife ----
  let rafId = null;
  let running = false;

  function frame(now) {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    // Aktuelle Bildschirmposition des Containers — ändert sich beim Scrollen, da der
    // Container jetzt IN der Seite liegt statt fix im Viewport zu stehen. Wird nur für
    // die Umrechnung der (Viewport-relativen) Zeigerposition in lokale Koordinaten
    // gebraucht; die Partikel-Positionen selbst sind bereits lokal und brauchen keine
    // Scroll-Korrektur (der Browser verschiebt den ganzen Canvas automatisch mit).
    const rect = container.getBoundingClientRect();
    const originX = rect.left;
    const originY = rect.top;

    const t = now / 1000;
    const transitionT = clamp((now - transitionStart) / TRANSITION_MS, 0, 1);
    const crossfading = transitionT < 1;

    for (const p of particles) {
      const ambientX = p.anchorX + Math.sin(t * p.freqX * Math.PI * 2 + p.phaseX) * p.ampX;
      const ambientY = p.anchorY + Math.cos(t * p.freqY * Math.PI * 2 + p.phaseY) * p.ampY;

      updatePull(p, ambientX, ambientY, originX, originY);

      p.x = ambientX + p.offsetX;
      p.y = ambientY + p.offsetY;

      const twinkle = 0.75 + 0.25 * Math.sin(t * p.twinkleFreq * Math.PI * 2 + p.twinklePhase);
      const alpha = p.baseAlpha * twinkle;

      if (crossfading) {
        const colorFrom = paletteFrom[p.colorIdx % paletteFrom.length];
        const colorTo = paletteTo[p.colorIdx % paletteTo.length];
        drawParticle(colorFrom, p.x, p.y, p.size, alpha * (1 - transitionT));
        drawParticle(colorTo, p.x, p.y, p.size, alpha * transitionT);
      } else {
        const color = paletteTo[p.colorIdx % paletteTo.length];
        drawParticle(color, p.x, p.y, p.size, alpha);
      }
    }

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  // Läuft nur, wenn die Sektion tatsächlich im Viewport ist UND der Tab aktiv ist —
  // der Container scrollt jetzt mit der Seite, verbringt also die meiste Zeit außerhalb
  // des sichtbaren Bereichs, und soll dann auch keine CPU/GPU verbrauchen.
  let sectionVisible = true;
  let tabVisible = !document.hidden;

  function syncRunning() {
    if (sectionVisible && tabVisible) start();
    else stop();
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        sectionVisible = entry.isIntersecting;
        syncRunning();
      });
    },
    { rootMargin: "25% 0px" } // etwas Vorlauf, bevor die Sektion ins Bild scrollt
  );
  sectionObserver.observe(container);

  document.addEventListener("visibilitychange", () => {
    tabVisible = !document.hidden;
    syncRunning();
  });

  // ---- Größe & Auflösung ----
  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles.forEach((p) => {
      p.anchorX = p.fx * width;
      p.anchorY = p.fy * height;
    });
    ensureParticleCount();
  }

  // ResizeObserver statt window-"resize"-Event: liefert beim Beobachtungsstart garantiert
  // die tatsächliche, fertig berechnete Größe (ein einmaliger synchroner Aufruf direkt nach
  // dem Einfügen kann bei einem fixed-Container 0x0 liefern, wenn das erste Layout noch
  // nicht abgeschlossen ist) und reagiert danach auch auf spätere Größenänderungen.
  let resizeTicking = false;
  const resizeObserver = new ResizeObserver(() => {
    if (!resizeTicking) {
      requestAnimationFrame(() => {
        resize();
        resizeTicking = false;
      });
      resizeTicking = true;
    }
  });
  resizeObserver.observe(container);

  start();

  return { setColors };
}
