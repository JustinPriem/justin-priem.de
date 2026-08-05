function elevationSpark(elevationM) {
  // Kleine, generierte Zick-Zack-Linie als Platzhalter für ein Höhenprofil
  const pts = [];
  const steps = 8;
  let y = 24;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    y = 24 - Math.sin(i * 1.3 + elevationM) * 10 - (i / steps) * 6;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

function embedBlock(tour) {
  if (tour.stravaEmbed) {
    return `<iframe class="embed" src="${tour.stravaEmbed}" height="220" frameborder="0" scrolling="no" loading="lazy" title="Strava Aktivität: ${tour.title}"></iframe>`;
  }
  if (tour.komootEmbed) {
    return `<iframe class="embed" src="${tour.komootEmbed}" height="220" frameborder="0" loading="lazy" title="Komoot Tour: ${tour.title}"></iframe>`;
  }
  return `
    <div class="embed embed--empty">
      <span>Noch kein Strava-/Komoot-Embed hinterlegt</span>
      <div class="embed-links">
        <a href="${tour.stravaUrl}" target="_blank" rel="noopener">Auf Strava ansehen ↗</a>
        <a href="${tour.komootUrl}" target="_blank" rel="noopener">Auf Komoot ansehen ↗</a>
      </div>
    </div>`;
}

function cardTemplate(tour) {
  const cover = tour.image
    ? `<img src="${tour.image}" alt="Foto von ${tour.title}">`
    : `<svg class="route-spark" viewBox="0 0 100 30" preserveAspectRatio="none"><polyline points="${elevationSpark(tour.elevationM)}" /></svg>`;

  return `
  <article class="tour-card tour-card--${tour.type}">
    <div class="tour-cover">${cover}<span class="tour-type">${tour.type === "tour" ? `${tour.days} Tage` : "Tagestour"}</span></div>
    <div class="tour-body">
      <p class="tour-route">${tour.route}</p>
      <h3>${tour.title}</h3>
      <p class="tour-date">${tour.date}</p>

      <div class="tour-stats">
        <div><span class="value">${tour.distanceKm.toLocaleString("de-DE")}</span><span class="unit">km</span></div>
        <div><span class="value">${tour.elevationM.toLocaleString("de-DE")}</span><span class="unit">Hm</span></div>
        <div><span class="value">${tour.days}</span><span class="unit">${tour.days === 1 ? "Tag" : "Tage"}</span></div>
      </div>

      <p class="tour-desc">${tour.description}</p>

      ${embedBlock(tour)}
    </div>
  </article>`;
}

function render(tours) {
  document.getElementById("tour-list").innerHTML = tours.map(cardTemplate).join("");
}

function setupControls() {
  const buttons = document.querySelectorAll(".cy-filter");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const type = btn.dataset.type;
      render(type === "all" ? TOURS : TOURS.filter((t) => t.type === type));
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const totalKm = TOURS.reduce((sum, t) => sum + t.distanceKm, 0);
  const totalHm = TOURS.reduce((sum, t) => sum + t.elevationM, 0);
  document.getElementById("total-km").textContent = totalKm.toLocaleString("de-DE");
  document.getElementById("total-hm").textContent = totalHm.toLocaleString("de-DE");
  document.getElementById("total-tours").textContent = TOURS.length;
  render(TOURS);
  setupControls();
});
