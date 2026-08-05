function monogram(title) {
  return title
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function cardTemplate(game) {
  const coverInner = game.cover
    ? `<img src="${game.cover}" alt="${game.title} Cover">`
    : `<span class="mono">${monogram(game.title)}</span>`;

  return `
  <article class="game-card" style="--accent:${game.accent}">
    <div class="game-cover">
      ${coverInner}
      <span class="status status--${game.status}">${game.status === "active" ? "Aktiv" : "Beendet"}</span>
    </div>
    <div class="game-body">
      <div class="game-heading">
        <h3>${game.title}</h3>
        <span class="genre">${game.genre}</span>
      </div>

      <div class="stat-row">
        <div class="stat">
          <span class="stat-label">Spielzeit</span>
          <span class="stat-value">${game.hours.toLocaleString("de-DE")} h</span>
        </div>
        <div class="stat">
          <span class="stat-label">Seit</span>
          <span class="stat-value">${game.since}</span>
        </div>
      </div>

      <div class="rank-block">
        <div class="rank-label">
          <span>Rang</span>
          <span class="rank-value">${game.rank}</span>
        </div>
        <div class="rank-bar"><span style="width:${game.rankPct}%"></span></div>
      </div>

      <p class="highlight">${game.highlight}</p>
    </div>
  </article>`;
}

function render(games) {
  const grid = document.getElementById("game-grid");
  grid.innerHTML = games.map(cardTemplate).join("");
}

function setupControls() {
  const sortSelect = document.getElementById("sort-select");
  const statusButtons = document.querySelectorAll(".filter-pill");
  let activeStatus = "all";

  function apply() {
    let list = [...GAMES];
    if (activeStatus !== "all") {
      list = list.filter((g) => g.status === activeStatus);
    }
    const sortBy = sortSelect.value;
    if (sortBy === "hours") list.sort((a, b) => b.hours - a.hours);
    if (sortBy === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "since") list.sort((a, b) => a.since.localeCompare(b.since));
    render(list);
  }

  sortSelect.addEventListener("change", apply);
  statusButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      statusButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeStatus = btn.dataset.status;
      apply();
    });
  });

  apply();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("total-games").textContent = GAMES.length;
  document.getElementById("total-hours").textContent = GAMES.reduce((sum, g) => sum + g.hours, 0).toLocaleString("de-DE");
  setupControls();
});
