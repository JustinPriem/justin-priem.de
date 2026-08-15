// js/gaming-intro-film.js
/**
 * GAMING SHOWPIECE — Scrub-Engine
 * -----------------------------------------------------------
 * Zeichnet eine WebP-Framesequenz auf ein Canvas, gesteuert vom
 * Scroll-Fortschritt. Kern gegen Ruckeln ist das
 * ImageBitmap-Schiebefenster: createImageBitmap dekodiert
 * außerhalb des Hauptthreads, sodass jedes Zeichnen ein reiner
 * GPU-Blit ist. drawImage auf ein HTMLImageElement würde
 * stattdessen eine synchrone Dekodierung im Hauptthread
 * erzwingen — genau das erzeugt das ruckelige Gefühl.
 */
(function () {
  "use strict";

  var DIR_LG = "assets/gaming-intro/frames/";
  var DIR_SM = "assets/gaming-intro/frames-sm/";
  var MQ_SM = "(max-width: 760px) and (orientation: portrait)";
  var FPS = 24;
  // Speicherbudget fuer dekodierte Bitmaps im Schiebefenster. Das Fenster darf
  // NICHT fest sein: Speicher pro Bild (w * h * 4 Byte) mal Fenstergroesse muss
  // unter diesem Budget bleiben, sonst haelt die Engine bei grossen Framesaetzen
  // (z.B. 1920 px nativ) hunderte Megabyte Bitmaps gleichzeitig im Speicher und
  // bringt schwache Rechner zum Absturz. Also: Fenstergroesse aus Budget und
  // tatsaechlicher Bildgroesse errechnen, nicht als Konstante eintragen.
  var MEM_BUDGET = 180 * 1024 * 1024;
  var AHEAD = Math.round(FPS * 2.0);
  var BEHIND = Math.round(FPS * 1.3);
  var windowSized = false;
  var MAX_CROP = 0.22;
  var PUMP = 10;
  var LERP = 0.14;
  var WARM = 40;

  var count = 0, dir = DIR_LG;
  var images = [], loaded = 0, queue = [], inFlight = 0;
  var bitmaps = new Map(), decoding = new Set(), bmpCenter = -9999;
  var canvas, ctx, film, poster, loaderEl, loaderBar, beats;
  var current = 0, target = 0, displayed = -1, lastLuma = null, started = false;

  function pad(n) { return ("0000" + n).slice(-4); }
  function frameUrl(i) { return dir + "f_" + pad(i + 1) + ".webp"; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---- Laden ---- */

  function pump() {
    while (inFlight < PUMP && queue.length) {
      var i = queue.shift();
      if (images[i]) continue;
      inFlight++;
      (function (idx) {
        var img = new Image();
        img.decoding = "async";
        img.onload = function () {
          images[idx] = img; loaded++; inFlight--;
          if (loaderBar) loaderBar.style.width = ((loaded / count) * 100).toFixed(1) + "%";
          if (loaded === WARM || loaded === count) reveal();
          if (loaded >= count && loaderEl) loaderEl.classList.add("is-done");
          pump();
        };
        img.onerror = function () { inFlight--; loaded++; pump(); };
        img.src = frameUrl(idx);
      })(i);
    }
  }

  function enqueueAll() {
    queue = [];
    var i;
    for (i = 0; i < Math.min(WARM, count); i++) queue.push(i);
    for (i = WARM; i < count; i++) queue.push(i);
    pump();
  }

  function reveal() {
    if (started) return;
    started = true;
    draw(Math.round(current), true);
    if (poster) poster.classList.add("is-hidden");
  }

  /* ---- Dekodier-Schiebefenster ---- */

  // Errechnet AHEAD/BEHIND aus dem tatsächlichen Speicherbudget, sobald die
  // erste Bitmap-Größe bekannt ist. Läuft nur einmal pro Framesatz (Flag
  // windowSized) — switchSet() setzt das Flag zurück, weil sich die
  // Bildgröße dort gerade ändert.
  function sizeWindow(b) {
    if (windowSized) return;
    windowSized = true;
    var bytesProBild = (b.width || 1) * (b.height || 1) * 4;
    var total = Math.floor(MEM_BUDGET / bytesProBild);
    total = clamp(total, 18, 79);
    AHEAD = Math.round(total * 0.6);
    BEHIND = total - AHEAD;
  }

  function ensureBitmaps(center) {
    if (Math.abs(center - bmpCenter) < 3) return;
    bmpCenter = center;
    var lo = Math.max(0, center - BEHIND), hi = Math.min(count - 1, center + AHEAD);
    for (var i = lo; i <= hi; i++) {
      if (bitmaps.has(i) || decoding.has(i) || !images[i]) continue;
      decoding.add(i);
      (function (idx) {
        createImageBitmap(images[idx]).then(function (b) {
          decoding.delete(idx);
          sizeWindow(b);
          if (Math.abs(idx - bmpCenter) > AHEAD + BEHIND) { b.close(); return; }
          bitmaps.set(idx, b);
          if (idx === displayed) draw(idx, true);
        }).catch(function () { decoding.delete(idx); });
      })(i);
    }
    // Räumung strenger als das Fenster selbst (Faktor 1.5 statt 2), damit der
    // tatsächlich gehaltene Bitmap-Satz das Speicherbudget nicht durch
    // Nachzügler am Fensterrand überschreiten kann.
    bitmaps.forEach(function (b, k) {
      if (k < center - BEHIND * 1.5 || k > center + AHEAD * 1.5) { b.close(); bitmaps.delete(k); }
    });
  }

  function nearest(idx) {
    for (var d = 0; d < count; d++) {
      if (bitmaps.has(idx - d)) return idx - d;
      if (bitmaps.has(idx + d)) return idx + d;
      if (images[idx - d]) return idx - d;
      if (images[idx + d]) return idx + d;
    }
    return -1;
  }

  function sourceAt(i) { return bitmaps.get(i) || images[i] || null; }

  // Sucht ausschliesslich unter bereits dekodierten Bitmaps — kein Fallback auf
  // rohe <img>-Elemente. Wird im Zeichentakt benutzt, um synchrones Dekodieren
  // (den eigentlichen Ruckel-Verursacher bei schnellem Scrollen) zu vermeiden.
  function nearestBitmap(idx) {
    for (var d = 0; d < count; d++) {
      if (bitmaps.has(idx - d)) return idx - d;
      if (bitmaps.has(idx + d)) return idx + d;
    }
    return -1;
  }

  /* ---- Zeichnen ---- */

  function fit(w, h, cw, ch) {
    var cover = Math.max(cw / w, ch / h);
    var crop = 1 - Math.min(cw / (w * cover), ch / (h * cover));
    // Bei starkem Beschnitt lieber Letterbox: ein 16:9-Bild in einem
    // Hochkant-Viewport behielte sonst nur die Mitte und verlöre die Komposition.
    var s = crop > MAX_CROP ? Math.min(cw / w, ch / h) : cover;
    return { w: w * s, h: h * s };
  }

  function draw(idx, force) {
    if (!ctx || !count) return;
    var use = bitmaps.has(idx) ? idx : nearestBitmap(idx);
    var src = use >= 0 ? bitmaps.get(use) : null;

    if (!src) {
      // Keine dekodierte Bitmap in Reichweite. Beim allerersten Zeichnen (force,
      // noch nie etwas dargestellt) wird notgedrungen ein rohes Bild gezeichnet,
      // damit die Seite nicht leer bleibt — sonst bleibt einfach das zuletzt
      // gezeichnete Bild stehen, statt jeden Frame neu synchron zu dekodieren.
      if (!force && displayed >= 0) return;
      use = nearest(idx);
      src = use >= 0 ? sourceAt(use) : null;
      if (!src) return;
    }

    if (!force && use === displayed) return;
    var w = src.width || src.naturalWidth, h = src.height || src.naturalHeight;
    if (!w || !h) return;
    var box = fit(w, h, canvas.width, canvas.height);
    ctx.fillStyle = "#05060A";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(src, (canvas.width - box.w) / 2, (canvas.height - box.h) / 2, box.w, box.h);
    displayed = use; lastLuma = null;
  }

  function resize() {
    if (!canvas) return;
    // DPR bewusst auf 1: Die Quelle ist 960 px breit; mehr Gerätepixel
    // vergrößern nur die Hochskalierung und machen das Bild weicher, nicht schärfer.
    canvas.width = Math.round(canvas.clientWidth);
    canvas.height = Math.round(canvas.clientHeight);
    draw(displayed >= 0 ? displayed : 0, true);
  }

  /* ---- Fortschritt und Takt ---- */

  function progress() {
    if (!film) return 0;
    var r = film.getBoundingClientRect();
    // Die letzte halbe Bildschirmhoehe ist Haltezone: Der Film steht dort bereits
    // auf 100 %, damit der Kern einen Moment wirken kann, bevor das erste Kapitel
    // nachrueckt.
    var hold = window.innerHeight * 0.5;
    var span = r.height - window.innerHeight - hold;
    if (span <= 0) return 0;
    return clamp(-r.top / span, 0, 1);
  }

  function beatAlpha(b, p) {
    var i = parseFloat(b.getAttribute("data-in"));
    var pk = parseFloat(b.getAttribute("data-peak"));
    var o = parseFloat(b.getAttribute("data-out"));
    if (p < i || p > o) return 0;
    if (p < pk) return (p - i) / Math.max(1e-4, pk - i);
    return 1 - (p - pk) / Math.max(1e-4, o - pk);
  }

  function tick() {
    var p = progress();
    target = p * (count - 1);
    current += (target - current) * LERP;
    var idx = Math.round(current);
    ensureBitmaps(idx);
    draw(idx, false);

    for (var i = 0; i < beats.length; i++) {
      var a = beatAlpha(beats[i], p);
      beats[i].style.opacity = a;
      beats[i].style.transform = "translateY(" + (-50 + (1 - a) * 4) + "%)";
    }

    requestAnimationFrame(tick);
  }

  /* ---- Öffentliche Schnittstelle ---- */

  function topLuma() {
    if (!ctx || displayed < 0) return null;
    if (lastLuma !== null) return lastLuma;
    try {
      var d = ctx.getImageData(0, 0, canvas.width, Math.max(1, Math.round(canvas.height * 0.12))).data;
      var sum = 0, n = 0;
      for (var i = 0; i < d.length; i += 4 * 64) {
        sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; n++;
      }
      lastLuma = n ? sum / n : null;
    } catch (e) { lastLuma = null; }
    return lastLuma;
  }

  // Zeichnet einen beliebigen Frame formatfüllend in ein fremdes Canvas.
  // Wird von Kapitel 2 genutzt, damit der Film in den Buchstaben läuft —
  // ohne eine einzige zusätzliche Datei.
  function paintTo(tctx, w, h, frameIndex) {
    if (!count || !tctx || !w || !h) return false;
    var i = ((frameIndex % count) + count) % count;
    var src = sourceAt(i);
    if (!src) { var f = nearest(i); if (f < 0) return false; src = sourceAt(f); }
    if (!src) return false;
    var sw = src.width || src.naturalWidth, sh = src.height || src.naturalHeight;
    if (!sw || !sh) return false;
    var s = Math.max(w / sw, h / sh);
    tctx.drawImage(src, (w - sw * s) / 2, (h - sh * s) / 2, sw * s, sh * s);
    return true;
  }

  function switchSet(useSmall) {
    var next = useSmall ? DIR_SM : DIR_LG;
    if (next === dir) return;
    dir = next;
    // Alte Bitmaps schließen — sonst leckt bei jedem Wechsel GPU-Speicher.
    bitmaps.forEach(function (b) { b.close(); });
    bitmaps.clear(); decoding.clear();
    bmpCenter = -9999; images = []; loaded = 0; displayed = -1;
    // Bildgröße ändert sich mit dem Framesatz — Fenster muss neu berechnet werden.
    windowSized = false;
    enqueueAll();
  }

  function init() {
    film = document.getElementById("film");
    canvas = document.getElementById("film-canvas");
    poster = document.getElementById("poster");
    loaderEl = document.getElementById("loader");
    loaderBar = document.getElementById("loader-bar");
    beats = document.querySelectorAll(".gs-beat");
    if (!film || !canvas) return;

    count = window.GS_FRAME_COUNT || 0;
    if (!count) return;

    ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    var mq = window.matchMedia(MQ_SM);
    dir = mq.matches ? DIR_SM : DIR_LG;
    if (mq.addEventListener) mq.addEventListener("change", function (e) { switchSet(e.matches); });

    resize();
    window.addEventListener("resize", resize);
    enqueueAll();
    requestAnimationFrame(tick);
  }

  window.GS_FILM = { init: init, progress: progress, topLuma: topLuma, paintTo: paintTo };
})();
