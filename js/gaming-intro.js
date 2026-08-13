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

  function plateHtml(game) {
    var cover = game.cover ? '<img src="' + game.cover + '" alt="">' : "";
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
    if (track) track.innerHTML = getTopGames(GAMES, 8).map(plateHtml).join("");

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

    var lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.GS_LENIS = lenis;

    // Reihenfolge-Gesetz: gepinnte Szenen zuerst, Ambientes danach.
    if (window.GS_FILM && window.GS_FILM.init) window.GS_FILM.init();
    if (window.GS_CHAPTERS && window.GS_CHAPTERS.init) window.GS_CHAPTERS.init();

    ScrollTrigger.refresh();
    // Die Kartenbreiten haengen an der Display-Schrift. Laedt sie erst nach dem
    // ersten Auffrischen, waere die Laufdistanz des Querlaufs zu kurz berechnet.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    // Spaet ladende Bilder und Schriftarten verschieben das Layout nach dem ersten
    // Auffrischen; ohne einen dritten Auffrisch wird die gepinnte Laufdistanz falsch
    // berechnet.
    if (document.readyState === "complete") {
      ScrollTrigger.refresh();
    } else {
      window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    }
    initCursor();
    initReadout();
    initAdaptiveHead();
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

    function frame() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      barEl.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0).toFixed(1) + "%";

      // Die Film-Namen gelten nur, solange die Film-Sektion noch im Bild ist.
      // progress() bleibt nach dem Durchscrollen dauerhaft bei 1 — ohne diese
      // Prüfung stünde in jeder Lücke zwischen zwei Kapiteln faelschlich "KERN".
      var filmVisible = !filmEl || filmEl.getBoundingClientRect().bottom > window.innerHeight * 0.5;
      if (filmVisible && window.GS_FILM) {
        var p = window.GS_FILM.progress();
        if (p > 0.66) name = "KERN";
        else if (p > 0.33) name = "KORRIDOR";
        else name = "CHROME";
      }
      for (var i = 0; i < sections.length; i++) {
        var r = sections[i].getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.5 && r.bottom >= window.innerHeight * 0.5) {
          name = sections[i].getAttribute("data-chapter");
          break;
        }
      }
      if (nameEl.textContent !== name) nameEl.textContent = name;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
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
