function cardTemplate(tour) {
  const cover = tour.image
    ? `<img src="${tour.image}" alt="Foto von ${tour.title}">`
    : `<svg class="route-spark" viewBox="0 0 100 30" preserveAspectRatio="none"><polyline points="${elevationSpark(tour.elevationM)}" /></svg>`;

  return `
  <a class="tour-card tour-card--${tour.type}" href="tour.html?id=${encodeURIComponent(tour.id)}">
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

      <p class="tour-desc">${tour.summary || tour.description || ""}</p>

      <span class="tour-details-link">Details &amp; Strecke ansehen <i aria-hidden="true">→</i></span>
    </div>
  </a>`;
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
