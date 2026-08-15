/**
 * ADMIN-DASHBOARD
 * -----------------------------------------------------------
 * Auth-Guard + Tabs + CRUD für Games / Touren / Raya-Fotos.
 * Liest/schreibt direkt die js/*-data.js-Dateien im Repo über die
 * GitHub Contents API — jede Änderung wird ein eigener Commit.
 */

const FILE_PATHS = {
  games: "js/gaming-data.js",
  tours: "js/cycling-data.js",
  raya: "js/raya-data.js",
};

const HEADERS = {
  games: `/**
 * GAMING HISTORY — Daten
 * -----------------------------------------------------------
 * Wird über den Admin-Bereich (admin/) gepflegt — kann aber auch
 * direkt von Hand angepasst werden. Felder:
 *  id         eindeutiger Schlüssel
 *  title      Spielname
 *  cover      eigener Upload, z.B. "assets/games/apex.jpg" (leer = automatisches Artwork)
 *  artwork    hinterlegtes Bild unter assets/games/ — für Spiele ohne Steam-Release
 *             und für Titel, bei denen Steam nur ein graues Platzhalterbild liefert
 *  steamAppId Steam-App-ID — lädt das Bild vom Steam-CDN (leer = nicht auf Steam)
 *  accent     Hex-Farbe fürs Kartenglow
 *  genre      kurzer Tag, z.B. "Battle Royale"
 *  status     "active" | "retired"
 *  hours      Spielstunden (Zahl)
 *  rank       Rang als Text
 *  rankPct    0–100, wie weit der Rang-Balken gefüllt ist
 *  since      Jahr, seit dem gespielt wird
 *  highlight  kurzer Highlight-Satz
 *
 * Bildreihenfolge auf der Karte: cover → artwork → steamAppId → Monogramm
 */`,
  tours: `/**
 * RADTOUREN — Daten
 * -----------------------------------------------------------
 * Wird über den Admin-Bereich (admin/) gepflegt — kann aber auch
 * direkt von Hand angepasst werden. Felder:
 *  id            eindeutiger Schlüssel
 *  title         Name der Tour
 *  type          "tour" (mehrtägig) | "day" (Tagestour)
 *  route         z.B. "Weimar → Prag"
 *  date          Datum/Zeitraum als Text
 *  distanceKm    Gesamtstrecke in km
 *  elevationM    Höhenmeter
 *  days          Anzahl Tage
 *  image         Pfad zu einem Foto (leer = generiertes Höhenprofil)
 *  summary       kurzer Vorschautext für die Kartenübersicht
 *  description   ausführlicher Text, nur auf der Detailseite (tour.html) sichtbar
 *  stravaUrl / komootUrl   Fallback-Links, nur auf der Detailseite
 *  embeds        Liste von { type: "strava"|"komoot", label, code }, nur auf
 *                 der Detailseite sichtbar
 */`,
  raya: `/**
 * RAYA — Foto-Daten
 * -----------------------------------------------------------
 * Wird über den Admin-Bereich (admin/) gepflegt — kann aber auch
 * direkt von Hand angepasst werden. Felder:
 *  id        eindeutiger Schlüssel
 *  src       Pfad zum Bild, z.B. "assets/raya/2024-05-12.jpg"
 *  date      Datum im Format "YYYY-MM-DD" (wichtig fürs Sortieren!)
 *  caption   kurze Bildunterschrift (optional)
 */`,
};

const VAR_NAMES = { games: "GAMES", tours: "TOURS", raya: "RAYA_PHOTOS" };

// In-Memory-Zustand: Daten-Array + der GitHub-"sha" der Datei (nötig zum Überschreiben)
const state = {
  games: { items: [], sha: null },
  tours: { items: [], sha: null },
  raya: { items: [], sha: null },
};

function makeId() {
  if (window.crypto && crypto.randomUUID) {
    try { return crypto.randomUUID(); } catch (e) { /* fällt unten durch */ }
  }
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function extractArray(fileText, varName) {
  const re = new RegExp(`const\\s+${varName}\\s*=\\s*(\\[[\\s\\S]*\\]);`);
  const match = fileText.match(re);
  if (!match) throw new Error(`Konnte ${varName} nicht in der Datei finden.`);
  return new Function(`"use strict"; return (${match[1]});`)();
}

function buildFileText(kind, items) {
  return `${HEADERS[kind]}\nconst ${VAR_NAMES[kind]} = ${JSON.stringify(items, null, 2)};\n`;
}

async function loadEntity(kind) {
  const { text, sha } = await ghGetFile(FILE_PATHS[kind]);
  state[kind].items = text ? extractArray(text, VAR_NAMES[kind]) : [];
  state[kind].sha = sha;
}

async function saveEntity(kind, commitMessage) {
  const text = buildFileText(kind, state[kind].items);
  const result = await ghPutTextFile(FILE_PATHS[kind], text, state[kind].sha, commitMessage);
  state[kind].sha = result.content.sha;
}

function rawUrl(path) {
  if (!path) return "";
  const branch = window.GITHUB_BRANCH || "main";
  return `https://raw.githubusercontent.com/${window.GITHUB_REPO}/${branch}/${path}?t=${Date.now()}`;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function setStatus(el, msg, kind) {
  el.textContent = msg;
  el.classList.remove("is-success", "is-pending");
  if (kind) el.classList.add(kind);
}

// ---------- Auth-Guard ----------

function showGuardMessage(msg) {
  const box = document.getElementById("guard-msg");
  box.textContent = msg;
  box.hidden = false;
  document.querySelectorAll(".admin-tabs, .admin-main").forEach((section) => (section.style.display = "none"));
}

async function requireAuth() {
  if (!window.GITHUB_REPO || window.GITHUB_REPO.includes("DEIN-USERNAME")) {
    showGuardMessage("Admin-Bereich ist noch nicht eingerichtet (admin/js/admin-config.js). Siehe ADMIN-SETUP.md.");
    return false;
  }
  if (sessionStorage.getItem("gh_admin_authed") !== "1" || !getGithubToken()) {
    window.location.href = "index.html";
    return false;
  }

  try {
    await ghCheckAccess();
  } catch (err) {
    showGuardMessage(err.message + " Bitte neu einloggen.");
    sessionStorage.removeItem("gh_admin_authed");
    sessionStorage.removeItem("gh_admin_token");
    return false;
  }

  document.getElementById("admin-repo-label").textContent = window.GITHUB_REPO;
  document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem("gh_admin_authed");
    sessionStorage.removeItem("gh_admin_token");
    window.location.href = "index.html";
  });

  return true;
}

// ---------- Tabs ----------

function setupTabs() {
  const tabs = document.querySelectorAll(".admin-tab");
  const panels = document.querySelectorAll(".admin-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      panels.forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add("is-active");
    });
  });
}

// ---------- Bild-Vorschau ----------

function previewFile(fileInput, imgEl) {
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      imgEl.src = reader.result;
      imgEl.hidden = false;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadIfNeeded(fileInput, folder, existingPath) {
  const file = fileInput.files[0];
  if (!file) return existingPath || "";
  return ghUploadImage(file, folder);
}

// =============================================================
// GAMES
// =============================================================

function gamesForm() {
  return {
    id: document.getElementById("games-id"),
    title: document.getElementById("games-title"),
    genre: document.getElementById("games-genre"),
    status: document.getElementById("games-status"),
    hours: document.getElementById("games-hours"),
    since: document.getElementById("games-since"),
    rank: document.getElementById("games-rank"),
    rankPct: document.getElementById("games-rankpct"),
    accent: document.getElementById("games-accent"),
    highlight: document.getElementById("games-highlight"),
    appId: document.getElementById("games-appid"),
    appIdPreview: document.getElementById("games-appid-preview"),
    appIdHint: document.getElementById("games-appid-hint"),
    appIdSearch: document.getElementById("games-appid-search"),
    coverFile: document.getElementById("games-cover-file"),
    coverUrl: document.getElementById("games-cover-url"),
    coverPreview: document.getElementById("games-cover-preview"),
    coverHint: document.getElementById("games-cover-hint"),
    coverRemove: document.getElementById("games-cover-remove"),
    artwork: document.getElementById("games-artwork"),
    submitBtn: document.getElementById("games-submit"),
    cancelBtn: document.getElementById("games-cancel"),
    error: document.getElementById("games-error"),
    formTitle: document.getElementById("games-form-title"),
    form: document.getElementById("games-form"),
  };
}

// Zeigt das Steam-Artwork zur eingetragenen AppID. Steam lässt sich aus dem
// Browser nicht durchsuchen (keine CORS-Header), die Bild-URLs vom CDN
// funktionieren aber — lädt keine davon, ist die AppID falsch.
function updateAppIdPreview() {
  const f = gamesForm();
  const id = f.appId.value.trim();
  const search = f.appIdSearch;
  search.href = `https://store.steampowered.com/search/?term=${encodeURIComponent(f.title.value.trim())}`;

  f.appIdPreview.hidden = true;
  f.appIdPreview.onload = null;

  if (!id) {
    f.appIdPreview.onerror = null;
    f.appIdPreview.removeAttribute("src");
    f.appIdHint.textContent = f.artwork.value
      ? "Nicht auf Steam — die Karte nutzt das hinterlegte Standardbild."
      : "Noch keine AppID eingetragen.";
    return;
  }

  f.appIdHint.textContent = "Lade Steam-Artwork …";
  f.appIdPreview.onload = () => {
    f.appIdPreview.hidden = false;
    f.appIdHint.textContent = f.artwork.value
      ? `Steam-Artwork für AppID ${id} — die Karte zeigt aber das hinterlegte Bild, weil Steam hier kein brauchbares Artwork liefert.`
      : `Steam-Artwork für AppID ${id}.`;
  };
  setGameImage(f.appIdPreview, gameArtSources({ steamAppId: id }), () => {
    f.appIdHint.textContent = `Kein Steam-Artwork für AppID ${id} gefunden.`;
  });
}

// Der Entfernen-Schalter erscheint nur, wenn überhaupt ein eigenes Bild
// gesetzt ist — sonst gibt es nichts zu entfernen.
function updateCoverControls() {
  const f = gamesForm();
  const hasCover = Boolean(f.coverUrl.value) || Boolean(f.coverFile.files[0]);
  f.coverHint.hidden = !hasCover;
}

function resetGamesForm() {
  const f = gamesForm();
  f.form.reset();
  f.id.value = "";
  f.coverUrl.value = "";
  f.artwork.value = "";
  f.coverPreview.hidden = true;
  f.accent.value = "#33e7ff";
  f.submitBtn.textContent = "Hinzufügen";
  f.cancelBtn.hidden = true;
  f.formTitle.textContent = "Neues Spiel hinzufügen";
  updateCoverControls();
  updateAppIdPreview();
  setStatus(f.error, "");
}

function fillGamesForm(game) {
  const f = gamesForm();
  f.id.value = game.id;
  f.title.value = game.title;
  f.genre.value = game.genre || "";
  f.status.value = game.status;
  f.hours.value = game.hours;
  f.since.value = game.since || "";
  f.rank.value = game.rank || "";
  f.rankPct.value = game.rankPct;
  f.accent.value = game.accent || "#33e7ff";
  f.highlight.value = game.highlight || "";
  f.appId.value = game.steamAppId || "";
  f.artwork.value = game.artwork || "";
  f.coverUrl.value = game.cover || "";
  f.coverFile.value = "";
  f.coverPreview.hidden = !game.cover;
  // rawUrl(): die Pfade sind relativ zum Repo-Wurzelverzeichnis, das Dashboard
  // liegt aber unter /admin/ — direkt eingesetzt liefen sie ins Leere.
  if (game.cover) f.coverPreview.src = rawUrl(game.cover);
  f.submitBtn.textContent = "Speichern";
  f.cancelBtn.hidden = false;
  f.formTitle.textContent = `„${game.title}" bearbeiten`;
  updateCoverControls();
  updateAppIdPreview();
  setStatus(f.error, "");
}

// Vorschaubild in der Liste — dieselbe Reihenfolge wie auf der Website, damit
// das Backend zeigt, was der Besucher später sieht. Bilder aus dem Repo
// brauchen rawUrl(), Steam-URLs sind bereits absolut.
function gamesThumb(game) {
  const sources = typeof gameArtSources === "function" ? gameArtSources(game) : [];
  if (!sources.length) {
    return `<span>${escapeHtml(game.title.slice(0, 2).toUpperCase())}</span>`;
  }
  const first = sources[0].url;
  const src = /^https?:\/\//.test(first) ? first : rawUrl(first);
  return `<img src="${escapeHtml(src)}" alt="">`;
}

function renderGamesList() {
  const items = state.games.items;
  document.getElementById("games-count").textContent = items.length;
  const list = document.getElementById("games-list");
  if (!items.length) {
    list.innerHTML = `<p class="admin-empty">Noch keine Spiele eingetragen.</p>`;
    return;
  }
  list.innerHTML = items
    .map(
      (g) => `
    <div class="admin-item" data-id="${g.id}">
      <div class="admin-item-thumb" style="--accent:${g.accent}">
        ${gamesThumb(g)}
      </div>
      <div class="admin-item-body">
        <strong>${escapeHtml(g.title)}</strong>
        <span>${escapeHtml(g.genre || "—")} · ${Number(g.hours).toLocaleString("de-DE")}h · ${g.status === "active" ? "Aktiv" : "Beendet"}</span>
      </div>
      <div class="admin-item-actions">
        <button type="button" class="icon-btn" data-action="edit" title="Bearbeiten">✏️</button>
        <button type="button" class="icon-btn" data-action="delete" title="Löschen">🗑️</button>
      </div>
    </div>`
    )
    .join("");
}

function setupGames() {
  const f = gamesForm();
  previewFile(f.coverFile, f.coverPreview);
  f.cancelBtn.addEventListener("click", resetGamesForm);

  let appIdTimer;
  const scheduleAppIdPreview = () => {
    clearTimeout(appIdTimer);
    appIdTimer = setTimeout(updateAppIdPreview, 300);
  };
  f.appId.addEventListener("input", scheduleAppIdPreview);
  // Der Suchlink trägt den Titel als Suchbegriff — mittippen lassen.
  f.title.addEventListener("input", scheduleAppIdPreview);

  f.coverFile.addEventListener("change", updateCoverControls);
  f.coverRemove.addEventListener("click", () => {
    // Nur die Zuordnung lösen: die Datei bleibt im Repo und lässt sich
    // jederzeit wieder eintragen. Wirksam wird es beim Speichern.
    f.coverUrl.value = "";
    f.coverFile.value = "";
    f.coverPreview.hidden = true;
    f.coverPreview.removeAttribute("src");
    updateCoverControls();
    setStatus(f.error, "Bild entfernt — zum Übernehmen speichern.", "is-pending");
  });

  document.getElementById("games-list").addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.closest(".admin-item").dataset.id;
    const game = state.games.items.find((g) => g.id === id);

    if (btn.dataset.action === "edit") {
      fillGamesForm(game);
      f.form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (btn.dataset.action === "delete") {
      if (!confirm(`„${game.title}" wirklich löschen? Das wird als Commit ins Repo geschrieben.`)) return;
      setStatus(f.error, "Lösche …", "is-pending");
      try {
        state.games.items = state.games.items.filter((g) => g.id !== id);
        await saveEntity("games", `Admin: Spiel "${game.title}" gelöscht`);
        renderGamesList();
        setStatus(f.error, "Gelöscht ✓", "is-success");
      } catch (err) {
        setStatus(f.error, err.message || String(err));
      }
    }
  });

  f.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus(f.error, "Speichere …", "is-pending");
    f.submitBtn.disabled = true;

    try {
      const cover = await uploadIfNeeded(f.coverFile, "games", f.coverUrl.value);
      const editingId = f.id.value;
      // Vorhandenes Objekt als Basis übernehmen: Felder, die dieses Formular
      // nicht kennt, bleiben so erhalten. Ohne das löscht eine ältere (z.B.
      // aus dem Browser-Cache geladene) Version des Dashboards beim Speichern
      // stillschweigend alle Felder, die sie noch nicht kennt.
      const existing = editingId ? state.games.items.find((g) => g.id === editingId) : null;
      const entry = {
        ...(existing || {}),
        id: editingId || makeId(),
        title: f.title.value.trim(),
        genre: f.genre.value.trim(),
        status: f.status.value,
        hours: Number(f.hours.value) || 0,
        since: f.since.value.trim(),
        rank: f.rank.value.trim(),
        rankPct: Math.min(100, Math.max(0, Number(f.rankPct.value) || 0)),
        accent: f.accent.value,
        highlight: f.highlight.value.trim(),
        cover,
        steamAppId: /^\d+$/.test(f.appId.value.trim()) ? Number(f.appId.value.trim()) : "",
        // artwork hat kein Eingabefeld, muss aber mitwandern — sonst verlöre
        // ein Spiel ohne Steam-Release beim Bearbeiten sein Standardbild.
        artwork: f.artwork.value,
      };

      if (editingId) {
        state.games.items = state.games.items.map((g) => (g.id === editingId ? entry : g));
      } else {
        state.games.items = [...state.games.items, entry];
      }

      await saveEntity("games", `Admin: Spiel "${entry.title}" ${editingId ? "aktualisiert" : "hinzugefügt"}`);
      resetGamesForm();
      renderGamesList();
      setStatus(gamesForm().error, "Gespeichert ✓ (Commit auf GitHub)", "is-success");
    } catch (err) {
      setStatus(f.error, err.message || String(err));
    } finally {
      f.submitBtn.disabled = false;
    }
  });
}

// =============================================================
// TOUREN
// =============================================================

function toursForm() {
  return {
    id: document.getElementById("tours-id"),
    title: document.getElementById("tours-title"),
    route: document.getElementById("tours-route"),
    type: document.getElementById("tours-type"),
    date: document.getElementById("tours-date"),
    days: document.getElementById("tours-days"),
    distance: document.getElementById("tours-distance"),
    elevation: document.getElementById("tours-elevation"),
    summary: document.getElementById("tours-summary"),
    description: document.getElementById("tours-description"),
    stravaUrl: document.getElementById("tours-strava-url"),
    komootUrl: document.getElementById("tours-komoot-url"),
    embedsList: document.getElementById("tours-embeds-list"),
    imageFile: document.getElementById("tours-image-file"),
    imageUrl: document.getElementById("tours-image-url"),
    imagePreview: document.getElementById("tours-image-preview"),
    submitBtn: document.getElementById("tours-submit"),
    cancelBtn: document.getElementById("tours-cancel"),
    error: document.getElementById("tours-error"),
    formTitle: document.getElementById("tours-form-title"),
    form: document.getElementById("tours-form"),
  };
}

// ---------- Wiederholbare Einbettungs-Zeilen (Strava/Komoot, beliebig viele) ----------

function stripScriptTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").trim();
}

function embedRowEl(embed = {}) {
  const row = document.createElement("div");
  row.className = "embed-row";
  row.innerHTML = `
    <div class="field-row">
      <label class="field"><span>Typ</span>
        <select class="embed-type">
          <option value="strava">Strava</option>
          <option value="komoot">Komoot</option>
        </select>
      </label>
      <label class="field"><span>Label (optional)</span><input type="text" class="embed-label" placeholder="z.B. Etappe 1"></label>
    </div>
    <label class="field"><span>Embed-Code</span><textarea class="embed-code" rows="3" placeholder="Kompletten Code von Strava/Komoot hier einfügen"></textarea></label>
    <button type="button" class="icon-btn embed-remove" title="Einbettung entfernen">🗑️</button>
  `;
  row.querySelector(".embed-type").value = embed.type === "komoot" ? "komoot" : "strava";
  row.querySelector(".embed-label").value = embed.label || "";
  row.querySelector(".embed-code").value = embed.code || "";
  row.querySelector(".embed-remove").addEventListener("click", () => row.remove());
  return row;
}

function addEmbedRow(embed) {
  document.getElementById("tours-embeds-list").appendChild(embedRowEl(embed));
}

function collectEmbeds() {
  return [...document.querySelectorAll("#tours-embeds-list .embed-row")]
    .map((row) => ({
      type: row.querySelector(".embed-type").value,
      label: row.querySelector(".embed-label").value.trim(),
      code: stripScriptTags(row.querySelector(".embed-code").value),
    }))
    .filter((embed) => embed.code);
}

function resetToursForm() {
  const f = toursForm();
  f.form.reset();
  f.id.value = "";
  f.imageUrl.value = "";
  f.imagePreview.hidden = true;
  f.days.value = 1;
  f.distance.value = 0;
  f.elevation.value = 0;
  f.embedsList.innerHTML = "";
  f.submitBtn.textContent = "Hinzufügen";
  f.cancelBtn.hidden = true;
  f.formTitle.textContent = "Neue Tour hinzufügen";
  setStatus(f.error, "");
}

function fillToursForm(tour) {
  const f = toursForm();
  f.id.value = tour.id;
  f.title.value = tour.title;
  f.route.value = tour.route || "";
  f.type.value = tour.type;
  f.date.value = tour.date || "";
  f.days.value = tour.days;
  f.distance.value = tour.distanceKm;
  f.elevation.value = tour.elevationM;
  f.summary.value = tour.summary || "";
  f.description.value = tour.description || "";
  f.stravaUrl.value = tour.stravaUrl || "";
  f.komootUrl.value = tour.komootUrl || "";
  f.imageUrl.value = tour.image || "";
  f.imagePreview.hidden = !tour.image;
  if (tour.image) f.imagePreview.src = tour.image;
  f.embedsList.innerHTML = "";
  (tour.embeds || []).forEach(addEmbedRow);
  f.submitBtn.textContent = "Speichern";
  f.cancelBtn.hidden = false;
  f.formTitle.textContent = `„${tour.title}" bearbeiten`;
  setStatus(f.error, "");
}

function renderToursList() {
  const items = state.tours.items;
  document.getElementById("tours-count").textContent = items.length;
  const list = document.getElementById("tours-list");
  if (!items.length) {
    list.innerHTML = `<p class="admin-empty">Noch keine Touren eingetragen.</p>`;
    return;
  }
  list.innerHTML = items
    .map(
      (t) => `
    <div class="admin-item" data-id="${t.id}">
      <div class="admin-item-thumb">
        ${t.image ? `<img src="${rawUrl(t.image)}" alt="">` : `<span>🚴</span>`}
      </div>
      <div class="admin-item-body">
        <strong>${escapeHtml(t.title)}</strong>
        <span>${escapeHtml(t.route || "—")} · ${Number(t.distanceKm).toLocaleString("de-DE")} km · ${t.type === "tour" ? `${t.days} Tage` : "Tagestour"}${(t.embeds && t.embeds.length) ? ` · 🔗 ${t.embeds.length}` : ""}</span>
      </div>
      <div class="admin-item-actions">
        <button type="button" class="icon-btn" data-action="edit" title="Bearbeiten">✏️</button>
        <button type="button" class="icon-btn" data-action="delete" title="Löschen">🗑️</button>
      </div>
    </div>`
    )
    .join("");
}

function setupTours() {
  const f = toursForm();
  previewFile(f.imageFile, f.imagePreview);
  f.cancelBtn.addEventListener("click", resetToursForm);
  document.getElementById("tours-embed-add").addEventListener("click", () => addEmbedRow());

  document.getElementById("tours-list").addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.closest(".admin-item").dataset.id;
    const tour = state.tours.items.find((t) => t.id === id);

    if (btn.dataset.action === "edit") {
      fillToursForm(tour);
      f.form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (btn.dataset.action === "delete") {
      if (!confirm(`„${tour.title}" wirklich löschen? Das wird als Commit ins Repo geschrieben.`)) return;
      setStatus(f.error, "Lösche …", "is-pending");
      try {
        state.tours.items = state.tours.items.filter((t) => t.id !== id);
        await saveEntity("tours", `Admin: Tour "${tour.title}" gelöscht`);
        renderToursList();
        setStatus(f.error, "Gelöscht ✓", "is-success");
      } catch (err) {
        setStatus(f.error, err.message || String(err));
      }
    }
  });

  f.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus(f.error, "Speichere …", "is-pending");
    f.submitBtn.disabled = true;

    try {
      const image = await uploadIfNeeded(f.imageFile, "cycling", f.imageUrl.value);
      const editingId = f.id.value;
      const entry = {
        id: editingId || makeId(),
        title: f.title.value.trim(),
        route: f.route.value.trim(),
        type: f.type.value,
        date: f.date.value.trim(),
        days: Number(f.days.value) || 1,
        distanceKm: Number(f.distance.value) || 0,
        elevationM: Number(f.elevation.value) || 0,
        image,
        summary: f.summary.value.trim(),
        description: f.description.value.trim(),
        stravaUrl: f.stravaUrl.value.trim(),
        komootUrl: f.komootUrl.value.trim(),
        embeds: collectEmbeds(),
      };

      if (editingId) {
        state.tours.items = state.tours.items.map((t) => (t.id === editingId ? entry : t));
      } else {
        state.tours.items = [...state.tours.items, entry];
      }

      await saveEntity("tours", `Admin: Tour "${entry.title}" ${editingId ? "aktualisiert" : "hinzugefügt"}`);
      resetToursForm();
      renderToursList();
      setStatus(toursForm().error, "Gespeichert ✓ (Commit auf GitHub)", "is-success");
    } catch (err) {
      setStatus(f.error, err.message || String(err));
    } finally {
      f.submitBtn.disabled = false;
    }
  });
}

// =============================================================
// RAYA-FOTOS
// =============================================================

function rayaForm() {
  return {
    id: document.getElementById("raya-id"),
    date: document.getElementById("raya-date"),
    caption: document.getElementById("raya-caption"),
    srcFile: document.getElementById("raya-src-file"),
    srcUrl: document.getElementById("raya-src-url"),
    srcPreview: document.getElementById("raya-src-preview"),
    submitBtn: document.getElementById("raya-submit"),
    cancelBtn: document.getElementById("raya-cancel"),
    error: document.getElementById("raya-error"),
    formTitle: document.getElementById("raya-form-title"),
    form: document.getElementById("raya-form"),
  };
}

function resetRayaForm() {
  const f = rayaForm();
  f.form.reset();
  f.id.value = "";
  f.srcUrl.value = "";
  f.srcPreview.hidden = true;
  f.submitBtn.textContent = "Hinzufügen";
  f.cancelBtn.hidden = true;
  f.formTitle.textContent = "Neues Foto hinzufügen";
  setStatus(f.error, "");
}

function fillRayaForm(photo) {
  const f = rayaForm();
  f.id.value = photo.id;
  f.date.value = photo.date;
  f.caption.value = photo.caption || "";
  f.srcUrl.value = photo.src || "";
  f.srcPreview.hidden = !photo.src;
  if (photo.src) f.srcPreview.src = photo.src;
  f.submitBtn.textContent = "Speichern";
  f.cancelBtn.hidden = false;
  f.formTitle.textContent = "Foto bearbeiten";
  setStatus(f.error, "");
}

function renderRayaList() {
  const items = state.raya.items;
  document.getElementById("raya-count").textContent = items.length;
  const list = document.getElementById("raya-list");
  if (!items.length) {
    list.innerHTML = `<p class="admin-empty">Noch keine Fotos hochgeladen.</p>`;
    return;
  }
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
  list.innerHTML = sorted
    .map(
      (p) => `
    <div class="admin-item admin-item--tile" data-id="${p.id}">
      <div class="admin-item-thumb admin-item-thumb--tile">
        ${p.src ? `<img src="${rawUrl(p.src)}" alt="">` : `<span>🐾</span>`}
      </div>
      <div class="admin-item-body">
        <strong>${p.date}</strong>
        <span>${escapeHtml(p.caption || "—")}</span>
      </div>
      <div class="admin-item-actions">
        <button type="button" class="icon-btn" data-action="edit" title="Bearbeiten">✏️</button>
        <button type="button" class="icon-btn" data-action="delete" title="Löschen">🗑️</button>
      </div>
    </div>`
    )
    .join("");
}

function setupRaya() {
  const f = rayaForm();
  previewFile(f.srcFile, f.srcPreview);
  f.cancelBtn.addEventListener("click", resetRayaForm);

  document.getElementById("raya-list").addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.closest(".admin-item").dataset.id;
    const photo = state.raya.items.find((p) => p.id === id);

    if (btn.dataset.action === "edit") {
      fillRayaForm(photo);
      f.form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (btn.dataset.action === "delete") {
      if (!confirm(`Foto vom ${photo.date} wirklich löschen? Das wird als Commit ins Repo geschrieben.`)) return;
      setStatus(f.error, "Lösche …", "is-pending");
      try {
        state.raya.items = state.raya.items.filter((p) => p.id !== id);
        await saveEntity("raya", `Admin: Raya-Foto vom ${photo.date} gelöscht`);
        renderRayaList();
        setStatus(f.error, "Gelöscht ✓", "is-success");
      } catch (err) {
        setStatus(f.error, err.message || String(err));
      }
    }
  });

  f.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus(f.error, "");

    const editingId = f.id.value;
    if (!editingId && !f.srcFile.files[0]) {
      setStatus(f.error, "Bitte ein Foto auswählen.");
      return;
    }

    setStatus(f.error, "Speichere …", "is-pending");
    f.submitBtn.disabled = true;
    try {
      const src = await uploadIfNeeded(f.srcFile, "raya", f.srcUrl.value);
      const entry = {
        id: editingId || makeId(),
        date: f.date.value,
        caption: f.caption.value.trim(),
        src,
      };

      if (editingId) {
        state.raya.items = state.raya.items.map((p) => (p.id === editingId ? entry : p));
      } else {
        state.raya.items = [...state.raya.items, entry];
      }

      await saveEntity("raya", `Admin: Raya-Foto vom ${entry.date} ${editingId ? "aktualisiert" : "hinzugefügt"}`);
      resetRayaForm();
      renderRayaList();
      setStatus(rayaForm().error, "Gespeichert ✓ (Commit auf GitHub)", "is-success");
    } catch (err) {
      setStatus(f.error, err.message || String(err));
    } finally {
      f.submitBtn.disabled = false;
    }
  });
}

// ---------- Init ----------

document.addEventListener("DOMContentLoaded", async () => {
  const ok = await requireAuth();
  if (!ok) return;

  setupTabs();
  setupGames();
  setupTours();
  setupRaya();

  try {
    await Promise.all([loadEntity("games"), loadEntity("tours"), loadEntity("raya")]);
    renderGamesList();
    renderToursList();
    renderRayaList();
  } catch (err) {
    showGuardMessage("Konnte Daten nicht von GitHub laden: " + (err.message || err));
  }
});
