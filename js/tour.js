function getTourFromQuery() {
  const id = new URLSearchParams(window.location.search).get("id");
  return TOURS.find((t) => t.id === id);
}

function embedBlockTemplate(embed, index) {
  const label = embed.label || `${embed.type === "strava" ? "Strava" : "Komoot"}-Aktivität ${index + 1}`;
  return `
    <div class="embed-block">
      <p class="embed-label">${label}</p>
      <div class="embed-media embed-media--${embed.type}">${embed.code}</div>
    </div>`;
}

function loadStravaEmbedScript() {
  // Strava hydriert alle .strava-embed-placeholder-Elemente, die im Moment der
  // Script-Ausführung im DOM stehen — deshalb erst NACH dem Einfügen der Embeds laden.
  const script = document.createElement("script");
  script.src = "https://strava-embeds.com/embed.js";
  document.body.appendChild(script);
}

function renderNotFound() {
  document.getElementById("td-main").innerHTML = `
    <p class="td-notfound">Diese Tour wurde nicht gefunden. <a href="cycling.html">Zurück zur Übersicht</a></p>`;
}

function renderTour(tour) {
  document.title = `${tour.title} — Radfahren — Justin Priem`;

  document.getElementById("td-cover").innerHTML = tour.image
    ? `<img src="${tour.image}" alt="Foto von ${tour.title}">`
    : `<svg class="route-spark" viewBox="0 0 100 30" preserveAspectRatio="none"><polyline points="${elevationSpark(tour.elevationM)}" /></svg>`;

  document.getElementById("td-route").textContent = tour.route || "";
  document.getElementById("td-title").textContent = tour.title;
  document.getElementById("td-date").textContent =
    `${tour.date} · ${tour.type === "tour" ? `${tour.days} ${tour.days === 1 ? "Tag" : "Tage"}` : "Tagestour"}`;

  document.getElementById("td-stats").innerHTML = `
    <div><span class="value">${tour.distanceKm.toLocaleString("de-DE")}</span><span class="unit">km</span></div>
    <div><span class="value">${tour.elevationM.toLocaleString("de-DE")}</span><span class="unit">Hm</span></div>
    <div><span class="value">${tour.days}</span><span class="unit">${tour.days === 1 ? "Tag" : "Tage"}</span></div>
  `;

  document.getElementById("td-desc").textContent = tour.description || tour.summary || "";

  const links = [];
  if (tour.stravaUrl) links.push(`<a href="${tour.stravaUrl}" target="_blank" rel="noopener">Auf Strava ansehen ↗</a>`);
  if (tour.komootUrl) links.push(`<a href="${tour.komootUrl}" target="_blank" rel="noopener">Auf Komoot ansehen ↗</a>`);
  document.getElementById("td-links").innerHTML = links.join("");

  const embeds = tour.embeds || [];
  const embedsEl = document.getElementById("td-embeds");
  if (!embeds.length) {
    embedsEl.innerHTML = `<p class="td-embeds-empty">Noch keine Strecken-Einbettung hinterlegt.</p>`;
  } else {
    embedsEl.innerHTML = embeds.map(embedBlockTemplate).join("");
    if (embeds.some((e) => e.type === "strava")) loadStravaEmbedScript();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const tour = getTourFromQuery();
  if (!tour) {
    renderNotFound();
    return;
  }
  renderTour(tour);
});
