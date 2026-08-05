function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
}

function photoTemplate(photo) {
  const media = photo.src
    ? `<img src="${photo.src}" alt="${photo.caption || 'Foto von Raya'}" loading="lazy">`
    : `<div class="photo-placeholder" aria-hidden="true">
         <svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="30" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="14" r="5" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="9" r="5" stroke="currentColor" stroke-width="2"/><circle cx="36" cy="14" r="5" stroke="currentColor" stroke-width="2"/></svg>
       </div>`;

  return `
  <figure class="photo-card"${photo.src ? ` data-src="${photo.src}" data-caption="${(photo.caption || "").replace(/"/g, "&quot;")}" tabindex="0" role="button" aria-label="Foto vergrößern"` : ""}>
    ${media}
    <figcaption>
      <span class="photo-date">${formatDate(photo.date)}</span>
      ${photo.caption ? `<span class="photo-caption">${photo.caption}</span>` : ""}
    </figcaption>
  </figure>`;
}

function render(photos) {
  document.getElementById("raya-grid").innerHTML = photos.map(photoTemplate).join("");
}

// ---------- Lightbox: Foto beim Antippen vergrößert anzeigen ----------

function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  const caption = document.getElementById("lightbox-caption");
  const closeBtn = document.getElementById("lightbox-close");

  function open(src, captionText) {
    img.src = src;
    img.alt = captionText || "Foto von Raya";
    caption.textContent = captionText || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function close() {
    lightbox.hidden = true;
    img.src = "";
    document.body.style.overflow = "";
  }

  document.getElementById("raya-grid").addEventListener("click", (e) => {
    const card = e.target.closest(".photo-card[data-src]");
    if (!card) return;
    open(card.dataset.src, card.dataset.caption);
  });
  document.getElementById("raya-grid").addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".photo-card[data-src]");
    if (!card) return;
    e.preventDefault();
    open(card.dataset.src, card.dataset.caption);
  });

  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.hidden) close();
  });
}

// ---------- Spalten pro Reihe (nur auf schmalen Bildschirmen relevant) ----------

function setupColumnControl() {
  const buttons = document.querySelectorAll(".ry-col-btn");
  const grid = document.getElementById("raya-grid");
  const stored = localStorage.getItem("raya-cols") || "2";

  function apply(cols) {
    grid.style.setProperty("--mobile-cols", cols);
    buttons.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.cols === cols));
  }

  apply(stored);
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem("raya-cols", btn.dataset.cols);
      apply(btn.dataset.cols);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("total-photos").textContent = RAYA_PHOTOS.length;

  const sortSelect = document.getElementById("raya-sort");
  function apply() {
    const sorted = [...RAYA_PHOTOS].sort((a, b) =>
      sortSelect.value === "newest" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
    );
    render(sorted);
  }
  sortSelect.addEventListener("change", apply);
  apply();
  setupLightbox();
  setupColumnControl();
});
