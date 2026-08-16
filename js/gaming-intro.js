// js/gaming-intro.js
/**
 * GAMING SHOWPIECE — Boot
 * -----------------------------------------------------------
 * Rendert die Daten und entscheidet, ob die Seite animiert oder
 * im Ruhezustand läuft. Reihenfolge ist bindend: erst Film
 * (gepinnt), dann Kapitel — ScrollTrigger werden in der
 * Reihenfolge ihrer Erzeugung aktualisiert.
 */
(function () {
  "use strict";

  function monogram(title) {
    return title.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 3).toUpperCase();
  }

  function hasArt(game) {
    return typeof gameArtSources === "function" && gameArtSources(game).length > 0;
  }

  function plateHtml(game, index) {
    // Das eigentliche Bild setzt wireArtFallback() nach dem Rendern — dort läuft
    // die Kette artwork -> Steam (siehe js/games-art.js) mit Fallback.
    var cover = hasArt(game) ? '<img alt="' + game.title + ' Cover" data-art-index="' + index + '">' : "";
    var rankValue = game.rank || "—";
    return (
      '<article class="gs-plate" style="--accent:' + game.accent + '">' + cover +
      '<span class="gs-plate-mark">' + monogram(game.title) + "</span>" +
      '<div class="gs-plate-body"><h3>' + game.title + "</h3>" +
      '<div class="gs-plate-stats">' +
      '<div><span class="gs-plate-label">Spielzeit</span><span class="gs-plate-value">' +
      game.hours.toLocaleString("de-DE") + ' h</span></div>' +
      '<div><span class="gs-plate-label">Rang</span><span class="gs-plate-value">' +
      rankValue + "</span></div>" +
      "</div></div></article>"
    );
  }

  function renderData() {
    var stats = getAggregateStats(GAMES);
    var hours = document.getElementById("total-hours");
    var games = document.getElementById("total-games");
    if (hours) {
      hours.textContent = stats.totalHours.toLocaleString("de-DE");
      hours.setAttribute("data-target", String(stats.totalHours));
    }
    if (games) games.textContent = String(stats.count);

    var track = document.getElementById("run-track");
    var topGames = getTopGames(GAMES, 8);
    if (track) {
      track.innerHTML = topGames.map(plateHtml).join("");
      wireArtFallback(track, topGames);
    }

    // Ticker: alle Titel, dreimal aufgeteilt, je Zeile verdoppelt,
    // damit das Band nahtlos umlaufen kann.
    var titles = GAMES.map(function (g) { return g.title; });
    for (var r = 1; r <= 3; r++) {
      var row = document.getElementById("ticker-" + r);
      if (!row) continue;
      var slice = titles.filter(function (_, i) { return i % 3 === r - 1; });
      if (!slice.length) slice = titles;
      var html = slice.map(function (t) { return "<span>" + t + "</span>"; }).join("");
      row.innerHTML = html + html;
    }
  }

  // Nicht jede Bildquelle liefert für jedes Spiel ein Ergebnis — Steam hat z.B.
  // nicht zu jeder App-ID eine capsule. setGameImage() arbeitet die Kandidaten
  // der Reihe nach ab; bleibt keiner übrig, springt die Karte aufs Monogramm.
  function wireArtFallback(track, games) {
    if (typeof setGameImage !== "function") return;
    track.querySelectorAll("img[data-art-index]").forEach(function (img) {
      var game = games[Number(img.dataset.artIndex)];
      setGameImage(img, gameArtSources(game), function () {
        img.remove();
      });
    });
  }

  function librariesPresent() {
    return typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && typeof Lenis !== "undefined";
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderData();

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !librariesPresent()) {
      document.body.classList.add("gs-still");
      window.__ready = true;
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Auf Handys aendert das Ein- und Ausblenden der Adressleiste die Fensterhoehe
    // mitten im Scrollen. Ohne diese Zeile rechnet ScrollTrigger daraufhin alle
    // Positionen neu, und der gepinnte Querlauf springt sichtbar an eine andere
    // Stelle.
    ScrollTrigger.config({ ignoreMobileResize: true });

    var lenis = new Lenis({ lerp: 0.35, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.GS_LENIS = lenis;

    // Reihenfolge-Gesetz: gepinnte Szenen zuerst, Ambientes danach.
    if (window.GS_FILM && window.GS_FILM.init) window.GS_FILM.init();
    if (window.GS_CHAPTERS && window.GS_CHAPTERS.init) window.GS_CHAPTERS.init();

    initCursor();
    // initReadout() gibt recompute() zurueck, damit der Positions-Cache der
    // Kapitelanzeige an denselben drei Stellen aufgefrischt wird wie
    // ScrollTrigger selbst (initial, Schriften bereit, vollstaendig geladen).
    var recomputeReadout = initReadout();
    initAdaptiveHead();

    ScrollTrigger.refresh();
    if (recomputeReadout) recomputeReadout();
    // Die Kartenbreiten haengen an der Display-Schrift. Laedt sie erst nach dem
    // ersten Auffrischen, waere die Laufdistanz des Querlaufs zu kurz berechnet.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        ScrollTrigger.refresh();
        if (recomputeReadout) recomputeReadout();
      });
    }
    // Spaet ladende Bilder und Schriftarten verschieben das Layout nach dem ersten
    // Auffrischen; ohne einen dritten Auffrisch wird die gepinnte Laufdistanz falsch
    // berechnet.
    if (document.readyState === "complete") {
      ScrollTrigger.refresh();
      if (recomputeReadout) recomputeReadout();
    } else {
      window.addEventListener("load", function () {
        ScrollTrigger.refresh();
        if (recomputeReadout) recomputeReadout();
      });
    }
    window.__ready = true;
  });

  /* ---- Mauszeiger ---- */
  function initCursor() {
    var el = document.getElementById("cursor");
    if (!el || window.matchMedia("(hover: none)").matches) return;
    // Erst bei der ersten echten Mausbewegung einblenden — sonst klebt der
    // Ring bei jedem Screenshot in der linken oberen Ecke im Bild.
    var live = false;
    window.addEventListener("mousemove", function (e) {
      if (!live) { live = true; el.classList.add("is-live"); }
      el.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
    });
    document.addEventListener("mouseover", function (e) {
      var hot = e.target.closest && e.target.closest("a, button");
      el.classList.toggle("is-hot", !!hot);
    });
  }

  /* ---- Kapitelanzeige und Fortschritt ---- */
  function initReadout() {
    var nameEl = document.getElementById("chapter-name");
    var barEl = document.getElementById("chapter-bar");
    var sections = Array.prototype.slice.call(document.querySelectorAll(".gs-ch[data-chapter]"));
    var filmEl = document.getElementById("film");
    if (!nameEl || !barEl) return;

    var name = "CHROME";
    var filmBottom = 0;
    var cache = [];

    // Positionen werden hier EINMALIG gelesen, nicht im Takt — der Takt selbst
    // vergleicht nur noch scrollY gegen zwischengespeicherte Zahlen. Das nimmt
    // acht getBoundingClientRect()-Aufrufe pro Frame aus der heissen Schleife,
    // die sich sonst mit den Zeichenschritten der Film-Engine ungluecklich
    // verzahnen und erzwungenes Layout ausloesen koennen.
    function recompute() {
      filmBottom = filmEl ? filmEl.offsetTop + filmEl.offsetHeight : 0;
      cache = sections.map(function (s) {
        return { top: s.offsetTop, bottom: s.offsetTop + s.offsetHeight, name: s.getAttribute("data-chapter") };
      });
    }

    function frame() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      barEl.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0).toFixed(1) + "%";

      var mid = window.scrollY + window.innerHeight * 0.5;

      // Die Film-Namen gelten nur, solange die Film-Sektion noch im Bild ist.
      // progress() bleibt nach dem Durchscrollen dauerhaft bei 1 — ohne diese
      // Prüfung stünde in jeder Lücke zwischen zwei Kapiteln faelschlich "KERN".
      var filmVisible = !filmEl || filmBottom > mid;
      if (filmVisible && window.GS_FILM) {
        var p = window.GS_FILM.progress();
        if (p > 0.66) name = "KERN";
        else if (p > 0.33) name = "KORRIDOR";
        else name = "CHROME";
      }
      for (var i = 0; i < cache.length; i++) {
        if (cache[i].top <= mid && cache[i].bottom >= mid) { name = cache[i].name; break; }
      }
      if (nameEl.textContent !== name) nameEl.textContent = name;
      requestAnimationFrame(frame);
    }

    recompute();
    window.addEventListener("resize", recompute);
    requestAnimationFrame(frame);
    return recompute;
  }

  /* ---- Kopfzeile über wechselndem Bild ---- */
  function initAdaptiveHead() {
    setInterval(function () {
      if (!window.GS_FILM) return;
      var l = window.GS_FILM.topLuma();
      if (l === null) return;
      document.body.classList.toggle("on-light", l > 138);
    }, 180);
  }

  window.GS_BOOT = { renderData: renderData };
})();
