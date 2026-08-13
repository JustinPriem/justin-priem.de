/**
 * GAMING SHOWPIECE — Kapitel
 * -----------------------------------------------------------
 * Wird NACH der Film-Engine initialisiert. ScrollTrigger werden
 * in der Reihenfolge ihrer Erzeugung aktualisiert: entstünde ein
 * Trigger vor dem Pin-Spacer des Films, berechnete er seine
 * Position gegen ein Layout, das es noch nicht gibt.
 *
 * Auf dieser Seite gibt es genau ein Video (den Film). Jedes
 * Kapitel hier erzeugt seine Bewegung aus Code.
 */
(function () {
  "use strict";

  var GLYPHS = "0123456789#%&@*+=<>/\\";

  /* --- Kapitel 1: Zähler als Walzen-Kilometerzähler ---
     Jede Ziffer wird zu einer eigenen Walze (.gs-od > i mit den Ziffern
     0-9 untereinander, zuletzt die Zielziffer); jedes andere Zeichen (der
     Tausenderpunkt) bleibt als .gs-od-sep stehen. Der fertige Zahlentext
     im Element wird erst beim Aufbau der Walzen ersetzt — läuft kein
     Skript, steht weiterhin die reine, formatierte Zahl da. */
  function buildOdometer(el, full) {
    var frag = document.createDocumentFragment();
    var wheels = [];
    var digitIndex = 0;
    for (var c = 0; c < full.length; c++) {
      var ch = full[c];
      if (ch >= "0" && ch <= "9") {
        var i = digitIndex++;
        var reps = 2 + i;
        var wrap = document.createElement("span");
        wrap.className = "gs-od";
        var strip = document.createElement("i");
        for (var r = 0; r < reps; r++) {
          for (var d = 0; d < 10; d++) {
            var b = document.createElement("b");
            b.textContent = String(d);
            strip.appendChild(b);
          }
        }
        var last = document.createElement("b");
        last.textContent = ch;
        strip.appendChild(last);
        wrap.appendChild(strip);
        frag.appendChild(wrap);
        wheels.push({ strip: strip, L: reps * 10 + 1 });
      } else {
        var sep = document.createElement("span");
        sep.className = "gs-od-sep";
        sep.textContent = ch;
        frag.appendChild(sep);
      }
    }
    el.textContent = "";
    el.appendChild(frag);
    return wheels;
  }

  function counter() {
    var el = document.getElementById("total-hours");
    if (!el) return;
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var full = target.toLocaleString("de-DE");
    var wheels = buildOdometer(el, full);
    if (!wheels.length) return;
    var n = wheels.length;

    function place(p) {
      for (var i = 0; i < n; i++) {
        // Die linkeste Walze rastet bei 70% des Scrollwegs ein, die
        // rechteste erst bei 100% — daraus entsteht der gestaffelte
        // Kilometerzähler-Eindruck statt fünf Walzen, die gleichzeitig stoppen.
        var settleAt = 0.70 + 0.30 * (i / Math.max(1, n - 1));
        var pi = gsap.utils.clamp(0, 1, p / settleAt);
        var eased = 1 - Math.pow(1 - pi, 3); // power3.out
        var k = eased * (wheels[i].L - 1);
        wheels[i].strip.style.transform = "translateY(" + (-k) + "em)";
      }
    }

    var obj = { p: 0 };
    gsap.to(obj, {
      p: 1, ease: "none",
      scrollTrigger: { trigger: "#ch-number", start: "top 80%", end: "center 55%", scrub: 0.6 },
      onUpdate: function () { place(obj.p); },
      onComplete: function () {
        for (var i = 0; i < n; i++) {
          wheels[i].strip.style.transform = "translateY(" + (-(wheels[i].L - 1)) + "em)";
        }
      }
    });
  }

  /* --- Kapitel 2: Der Film läuft in den Buchstaben --- */
  function filmInType() {
    var c = document.getElementById("type-canvas");
    if (!c || !window.GS_FILM || !window.GS_FILM.paintTo) return;
    var ctx = c.getContext("2d");
    if (!ctx) return;

    function resize() { c.width = c.clientWidth; c.height = c.clientHeight; }
    resize();
    window.addEventListener("resize", resize);

    var i = 0, last = 0, ok = false;
    var running = false;
    function loop(t) {
      if (!running) return;
      // ~12 Bilder/Sek. reichen: Die Schrift zeigt nur Ausschnitte, und ein
      // langsamerer Takt hält die Dekodierlast neben dem Film selbst klein.
      if (t - last > 80) {
        var drawn = window.GS_FILM.paintTo(ctx, c.width, c.height, i);
        if (drawn && !ok) { ok = true; document.body.classList.add("gs-filmtext"); }
        i += 2;
        last = t;
      }
      requestAnimationFrame(loop);
    }

    function start() { if (running) return; running = true; requestAnimationFrame(loop); }
    function stop() { running = false; }

    // Nur rendern, solange die Sektion sichtbar ist — sonst blittet paintTo()
    // auch dann noch alle ~80ms, wenn längst Kapitel 3-6 gelesen werden.
    // onToggle statt onEnter/onLeave: Es deckt auch den Fall ab, dass die Seite
    // bereits mitten in dieser Sektion geladen wird, und die Sperre in start()
    // verhindert, dass mehrere rAF-Schleifen parallel laufen. Die Klasse
    // gs-filmtext bleibt nach dem ersten Treffer gesetzt, auch wenn die
    // Schleife später pausiert — sonst würde die CSS-Fallback-Gradiente
    // wieder sichtbar.
    ScrollTrigger.create({
      trigger: "#ch-type", start: "top bottom", end: "bottom top",
      onToggle: function (self) { if (self.isActive) start(); else stop(); }
    });
  }

  /* --- Kapitel 2: Der Schriftzug wächst beim Hineinscrollen an ---
     Die Skalierung liegt auf dem <span>, nicht auf .gs-type-knock selbst:
     der schwarze Block muss die volle Fläche decken, damit die
     Knockout-Mischung (mix-blend-mode: multiply) nicht gestört wird. */
  function typeGrowIn() {
    var span = document.querySelector(".gs-type-knock span");
    if (!span) return;
    gsap.fromTo(span, { scale: 0.86 }, {
      scale: 1, ease: "none",
      scrollTrigger: { trigger: "#ch-type", start: "top bottom", end: "center center", scrub: true }
    });
  }

  /* --- Kapitel 3: Querlauf --- */
  function horizontalRun() {
    var track = document.getElementById("run-track");
    var section = document.getElementById("ch-run");
    if (!track || !section || !track.children.length) return;

    var distance = function () { return track.scrollWidth - window.innerWidth; };
    if (distance() <= 0) return;

    var run = gsap.to(track, {
      x: function () { return -distance(); }, ease: "none",
      scrollTrigger: {
        trigger: section, start: "top top",
        end: function () { return "+=" + distance(); },
        pin: true, scrub: true, invalidateOnRefresh: true
      }
    });

    gsap.utils.toArray(".gs-plate").forEach(function (plate, i) {
      gsap.fromTo(plate, { y: i % 2 ? 40 : -40 }, {
        y: i % 2 ? -40 : 40, ease: "none",
        scrollTrigger: { trigger: plate, containerAnimation: run, start: "left right", end: "right left", scrub: true }
      });

      plate.addEventListener("mousemove", function (e) {
        var r = plate.getBoundingClientRect();
        gsap.to(plate, {
          rotateY: ((e.clientX - r.left) / r.width - 0.5) * 14,
          rotateX: ((e.clientY - r.top) / r.height - 0.5) * -14,
          duration: 0.4, ease: "power2.out", transformPerspective: 800
        });
      });
      plate.addEventListener("mouseleave", function () {
        gsap.to(plate, { rotateY: 0, rotateX: 0, duration: 0.7, ease: "power3.out" });
      });
    });

    // Scherung nach Scrollgeschwindigkeit: schneller Lauf kippt die Platten,
    // im Stillstand stehen sie wieder gerade.
    var skew = { v: 0 };
    ScrollTrigger.create({
      trigger: section, start: "top bottom", end: "bottom top",
      onUpdate: function (self) {
        var v = gsap.utils.clamp(-14, 14, self.getVelocity() / 260);
        if (Math.abs(v) > Math.abs(skew.v)) {
          skew.v = v;
          gsap.to(skew, {
            v: 0, duration: 0.7, ease: "power3", overwrite: true,
            onUpdate: function () { gsap.set(".gs-plate", { skewY: skew.v }); }
          });
        }
      }
    });
  }

  /* --- Kapitel 4: Partikelfeld --- */
  function field() {
    var c = document.getElementById("field-canvas");
    if (!c) return;
    var ctx = c.getContext("2d");
    if (!ctx) return;

    var pts = [], N = 140, LINK = 165;
    var CYAN_RGB = [34, 224, 214], MAGENTA_RGB = [255, 61, 175];
    var mouse = { x: -9999, y: -9999 };
    var stretch = { v: 0 };
    var running = false;

    function mixRgb(t) {
      var r = Math.round(CYAN_RGB[0] + (MAGENTA_RGB[0] - CYAN_RGB[0]) * t);
      var g = Math.round(CYAN_RGB[1] + (MAGENTA_RGB[1] - CYAN_RGB[1]) * t);
      var b = Math.round(CYAN_RGB[2] + (MAGENTA_RGB[2] - CYAN_RGB[2]) * t);
      return r + "," + g + "," + b;
    }

    function resize() {
      c.width = c.clientWidth; c.height = c.clientHeight;
      pts = [];
      for (var i = 0; i < N; i++) {
        pts.push({
          x: Math.random() * c.width, y: Math.random() * c.height,
          vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28
        });
      }
    }
    resize();
    window.addEventListener("resize", resize);

    c.addEventListener("mousemove", function (e) {
      var r = c.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    c.addEventListener("mouseleave", function () { mouse.x = -9999; mouse.y = -9999; });

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, c.width, c.height);
      var i, j, a, b, dx, dy, d;

      for (i = 0; i < pts.length; i++) {
        a = pts[i];
        a.x += a.vx; a.y += a.vy * (1 + stretch.v);
        if (a.x < 0) a.x = c.width; if (a.x > c.width) a.x = 0;
        if (a.y < 0) a.y = c.height; if (a.y > c.height) a.y = 0;

        dx = a.x - mouse.x; dy = a.y - mouse.y; d = Math.hypot(dx, dy);
        if (d < 170 && d > 0.01) { a.x += (dx / d) * 3.2; a.y += (dy / d) * 3.2; }
      }

      // Farbe nach Länge gemischt: kurze Linien in Cyan, lange in Magenta.
      for (i = 0; i < pts.length; i++) {
        a = pts[i];
        for (j = i + 1; j < pts.length; j++) {
          b = pts[j];
          dx = a.x - b.x; dy = a.y - b.y; d = Math.hypot(dx, dy);
          if (d < LINK) {
            var t = d / LINK;
            ctx.strokeStyle = "rgba(" + mixRgb(t) + "," + ((1 - t) * 0.55) + ")";
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(234,238,245,.7)";
      for (i = 0; i < pts.length; i++) {
        ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, 1.9, 0, 6.284); ctx.fill();
      }
      requestAnimationFrame(frame);
    }

    function start() { if (running) return; running = true; requestAnimationFrame(frame); }
    function stop() { running = false; }

    // Nur rendern, solange die Sektion sichtbar ist — ein dauerhaft laufendes
    // Partikelfeld würde auch dann Rechenzeit fressen, wenn es niemand sieht.
    // onToggle statt onEnter/onLeave: Es deckt auch den Fall ab, dass die Seite
    // bereits mitten in dieser Sektion geladen wird, und die Sperre in start()
    // verhindert, dass mehrere rAF-Schleifen parallel laufen.
    ScrollTrigger.create({
      trigger: "#ch-field", start: "top bottom", end: "bottom top",
      onToggle: function (self) { if (self.isActive) start(); else stop(); },
      onUpdate: function (self) {
        var v = gsap.utils.clamp(0, 2.4, Math.abs(self.getVelocity()) / 900);
        if (v > stretch.v) {
          stretch.v = v;
          gsap.to(stretch, { v: 0, duration: 1, ease: "power2", overwrite: true });
        }
      }
    });
  }

  /* --- Kapitel 4: Text rastet aus Zufallszeichen ein --- */
  function scrambleText() {
    var el = document.getElementById("field-text");
    if (!el) return;
    var full = el.getAttribute("data-text") || el.textContent;
    var obj = { p: 0 };
    ScrollTrigger.create({
      trigger: "#ch-field", start: "top 65%", once: true,
      onEnter: function () {
        gsap.to(obj, {
          p: 1, duration: 1.5, ease: "power2.out",
          onUpdate: function () {
            var settled = Math.floor(obj.p * full.length);
            var out = "";
            for (var i = 0; i < full.length; i++) {
              if (i < settled || full[i] === " ") out += full[i];
              else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }
            el.textContent = out;
          },
          onComplete: function () { el.textContent = full; }
        });
      }
    });
  }

  /* --- Kapitel 5: Laufbänder --- */
  function tickers() {
    var rows = [
      { id: "ticker-1", dur: 17, dir: -1 },
      { id: "ticker-2", dur: 23, dir: 1 },
      { id: "ticker-3", dur: 20, dir: -1 }
    ];
    rows.forEach(function (r) {
      var el = document.getElementById(r.id);
      if (!el || !el.children.length) return;
      // Der Inhalt liegt doppelt vor; eine Verschiebung um -50 % läuft
      // deshalb exakt auf den Anfang zurück und wirkt endlos.
      gsap.set(el, { xPercent: r.dir < 0 ? 0 : -50 });
      gsap.to(el, {
        xPercent: r.dir < 0 ? -50 : 0,
        duration: r.dur, ease: "none", repeat: -1
      });
    });

    var skew = { v: 0 };
    ScrollTrigger.create({
      trigger: "#ch-ticker", start: "top bottom", end: "bottom top",
      onUpdate: function (self) {
        var v = gsap.utils.clamp(-9, 9, self.getVelocity() / 320);
        if (Math.abs(v) > Math.abs(skew.v)) {
          skew.v = v;
          gsap.to(skew, {
            v: 0, duration: 0.8, ease: "power3", overwrite: true,
            onUpdate: function () { gsap.set(".gs-ticker-row", { skewY: skew.v }); }
          });
        }
      }
    });
  }

  /* --- Einblendungen und magnetischer Button --- */
  function arrivals() {
    gsap.utils.toArray(".gs-ch").forEach(function (sec) {
      var kids = sec.querySelectorAll(".gs-wrap > *");
      if (!kids.length) return;
      gsap.from(kids, {
        opacity: 0, y: 26, duration: 0.9, stagger: 0.09, ease: "power3.out",
        scrollTrigger: { trigger: sec, start: "top 78%", once: true }
      });
    });
  }

  function magneticPortal() {
    var btn = document.getElementById("portal-btn");
    if (!btn || window.matchMedia("(hover: none)").matches) return;
    var area = btn.parentElement;
    area.addEventListener("mousemove", function (e) {
      var r = btn.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < 260) gsap.to(btn, { x: dx * 0.28, y: dy * 0.28, duration: 0.5, ease: "power3.out" });
      else gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.4)" });
    });
    area.addEventListener("mouseleave", function () {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.4)" });
    });
  }

  function init() {
    horizontalRun();   // gepinnt: zuerst
    counter();
    filmInType();
    typeGrowIn();
    field();
    scrambleText();
    tickers();
    arrivals();
    magneticPortal();
  }

  window.GS_CHAPTERS = { init: init };
})();
