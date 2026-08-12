// js/gaming-intro.js
/**
 * GAMING INTRO — Deep-Dive-Landing
 * -----------------------------------------------------------
 * Liest GAMES aus gaming-data.js NUR LESEND. Keine eigene
 * Datenhaltung — der Admin-Bereich bleibt einzige Quelle der
 * Wahrheit für Spiele-Inhalte.
 */

function getTopGames(games, n) {
  return [...games].sort((a, b) => b.hours - a.hours).slice(0, n);
}

function getAggregateStats(games) {
  return {
    count: games.length,
    totalHours: games.reduce((sum, g) => sum + g.hours, 0),
  };
}

function monogram(title) {
  return title.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();
}

function depthCardTemplate(game) {
  return `
    <p class="gi-card-eyebrow">// SIGNAL ERFASST — ${monogram(game.title)}</p>
    <h2>${game.title}</h2>
    <div class="gi-card-stats">
      <div>
        <span class="gi-card-label">Spielzeit</span>
        <span class="gi-card-value">${game.hours.toLocaleString("de-DE")} h</span>
      </div>
      <div>
        <span class="gi-card-label">Rang</span>
        <span class="gi-card-value">${game.rank}</span>
      </div>
    </div>
  `;
}

function renderDepthCards(topGames) {
  topGames.forEach((game, i) => {
    const mount = document.getElementById(`depth-card-${i + 1}`);
    if (mount) mount.innerHTML = depthCardTemplate(game);
  });
}

function renderCoreStats(stats) {
  const mount = document.getElementById("core-stats");
  if (!mount) return;
  mount.innerHTML = `
    <div class="gi-core-stat">
      <span class="gi-core-value">${stats.count}</span>
      <span class="gi-core-label">Spiele erfasst</span>
    </div>
    <div class="gi-core-stat">
      <span class="gi-core-value">${stats.totalHours.toLocaleString("de-DE")}</span>
      <span class="gi-core-label">Stunden gesamt</span>
    </div>
  `;
}

function hideUnusedDepthActs(topGamesCount) {
  for (let i = topGamesCount + 1; i <= 3; i++) {
    const act = document.getElementById(`act-depth-${i}`);
    if (act) act.remove();
  }
}

function renderApp() {
  const topGames = getTopGames(GAMES, 3);
  hideUnusedDepthActs(topGames.length);
  renderDepthCards(topGames);
  renderCoreStats(getAggregateStats(GAMES));
}

function initScrollChoreography() {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  const acts = gsap.utils.toArray(".gi-act");

  acts.forEach((act, i) => {
    const isFirst = i === 0;
    const isLast = i === acts.length - 1;
    const bg = act.querySelector(".gi-bg");
    const reveal = act.querySelector(".gi-content, .gi-hud-card");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: act,
        start: "top top",
        end: "+=100%",
        scrub: true,
        pin: true,
      },
    });

    if (bg) tl.fromTo(bg, { scale: 1.1 }, { scale: 1, ease: "none" }, 0);

    if (reveal) {
      if (!isFirst) {
        tl.fromTo(
          reveal,
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.35 },
          0
        );
      }
      if (!isLast) {
        tl.to(reveal, { autoAlpha: 0, y: -30, ease: "power2.in", duration: 0.25 }, 0.75);
      }
    }
  });
}

function initStaticFallback() {
  document.body.classList.add("gi-static");
}

document.addEventListener("DOMContentLoaded", () => {
  renderApp();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsapAvailable =
    typeof gsap !== "undefined" &&
    typeof ScrollTrigger !== "undefined" &&
    typeof Lenis !== "undefined";

  if (reduceMotion || !gsapAvailable) {
    initStaticFallback();
  } else {
    initScrollChoreography();
  }
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getTopGames, getAggregateStats };
}
