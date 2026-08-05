// ---------- Teaser-Inhalte aus den echten Daten-Dateien ----------

function fillGamingTeaser() {
  const totalHours = GAMES.reduce((s, g) => s + g.hours, 0);
  document.getElementById("gaming-stats").innerHTML = `
    <div><span class="value">${GAMES.length}</span><span class="label">Spiele</span></div>
    <div><span class="value">${totalHours.toLocaleString("de-DE")}</span><span class="label">Stunden</span></div>
  `;
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

function fillCyclingTeaser() {
  const totalKm = TOURS.reduce((s, t) => s + t.distanceKm, 0);
  const totalHm = TOURS.reduce((s, t) => s + t.elevationM, 0);
  document.getElementById("cycling-stats").innerHTML = `
    <div><span class="value">${TOURS.length}</span><span class="label">Touren</span></div>
    <div><span class="value">${totalKm.toLocaleString("de-DE")}</span><span class="label">Kilometer</span></div>
    <div><span class="value">${totalHm.toLocaleString("de-DE")}</span><span class="label">Höhenmeter</span></div>
  `;
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

function fillRayaTeaser() {
  document.getElementById("raya-stats").innerHTML = `
    <div><span class="value">${RAYA_PHOTOS.length}</span><span class="label">Fotos</span></div>
  `;
  const latest = [...RAYA_PHOTOS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  document.getElementById("raya-preview").innerHTML = latest
    .map(
      () => `
      <div class="preview-tile" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="30" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="14" r="5" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="9" r="5" stroke="currentColor" stroke-width="2"/><circle cx="36" cy="14" r="5" stroke="currentColor" stroke-width="2"/></svg>
      </div>`
    )
    .join("");
}

// ---------- Scroll-Story: Quicknav passt sich dem aktiven Kapitel an ----------

function setupScrollStory() {
  const nav = document.getElementById("quicknav");
  const sections = document.querySelectorAll(".story");
  const navLinks = document.querySelectorAll(".qn-links a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const theme = entry.target.dataset.theme;
        nav.dataset.theme = theme;
        navLinks.forEach((link) =>
          link.classList.toggle("is-active", link.dataset.section === theme)
        );
      });
    },
    { threshold: 0.55 }
  );

  sections.forEach((section) => observer.observe(section));
}

document.addEventListener("DOMContentLoaded", () => {
  fillGamingTeaser();
  fillCyclingTeaser();
  fillRayaTeaser();
  setupScrollStory();
});
