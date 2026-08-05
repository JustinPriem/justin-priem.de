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
  <figure class="photo-card">
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
});
