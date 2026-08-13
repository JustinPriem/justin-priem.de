/* ===========================================================================
   games-art.js  –  Artwork-Quellen für die Game Cards
   ---------------------------------------------------------------------------
   Alle Bilder kommen vom offiziellen Steam-CDN (Publisher-Assets).
   Verfügbare Varianten pro Spiel:
     hero    1920x620  – breites Card-Background, erste Wahl
     capsule  616x353  – kompakter, gutes Fallback
     header   460x215  – existiert IMMER, letzter Fallback
     poster   600x900  – hochkant, falls du irgendwo Portrait-Cards willst

   Wird nur verwendet, wenn ein Spiel in gaming-data.js KEIN eigenes "cover"
   gesetzt hat — eigene Screenshots/Uploads haben immer Vorrang.
   =========================================================================== */

const STEAM_CDN = "https://cdn.cloudflare.steamstatic.com/steam/apps";

function steamArt(appid) {
  return {
    appid,
    hero:    `${STEAM_CDN}/${appid}/library_hero.jpg`,
    capsule: `${STEAM_CDN}/${appid}/capsule_616x353.jpg`,
    header:  `${STEAM_CDN}/${appid}/header.jpg`,
    poster:  `${STEAM_CDN}/${appid}/library_600x900.jpg`,
    store:   `https://store.steampowered.com/app/${appid}/`,
  };
}

/* ---------------------------------------------------------------------------
   Schlüssel = Spieltitel aus gaming-data.js, kleingeschrieben und
   geschlagen auf [a-z0-9]+ getrennt durch "-" (siehe slugifyTitle()).
   --------------------------------------------------------------------------- */

const GAME_ART = {
  "warframe":              steamArt(230410),
  "delta-force":           steamArt(2507950),
  "deadlock":              steamArt(1422450),
  "apex-legends":          steamArt(1172470),
  "planetside-2":          steamArt(218230),
  "csgo":                  steamArt(730),      // Achtung: App 730 zeigt heute CS2-Artwork
  "destiny-2":             steamArt(1085660),
  "cod-bo2":               steamArt(202970),
  "brawlhalla":            steamArt(291550),
  "battlefield-6":         steamArt(2807960),
  "dc-universe-online":    steamArt(24200),
  "the-finals":            steamArt(2073850),
  "saints-row-iv":         steamArt(206420),
  "starbound":             steamArt(211820),
  "saints-row-the-third":  steamArt(55230),
  "garrys-mod":            steamArt(4000),
  "battlefield-1":         steamArt(1238840),
  "battlefield-2042":      steamArt(1517290),
  "paladins":              steamArt(444090),
  "overwatch-2":           steamArt(2357570),

  /* -------------------------------------------------------------------------
     Spiele OHNE Steam-Release – hier musst du das Bild selbst hinterlegen.
     Leg die Datei unter assets/games/ ab, der Pfad ist schon vorbereitet.
     ------------------------------------------------------------------------- */
  "battlefield-heroes":    { hero: "assets/games/battlefield-heroes.jpg" },
  "minecraft":             { hero: "assets/games/minecraft.jpg" },
  "fortnite":              { hero: "assets/games/fortnite.jpg" },
  "starcraft-ii":          { hero: "assets/games/starcraft-ii.jpg" },
  "heroes-of-the-storm":   { hero: "assets/games/heroes-of-the-storm.jpg" },
};

/* Titel -> Schlüssel, z.B. "StarCraft II" -> "starcraft-ii" ---------------- */

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ---------------------------------------------------------------------------
   Helper: setzt das Bild mit automatischem Fallback,
   falls library_hero.jpg für einen Titel nicht existiert.
   Verwendung:  setGameImage(imgElement, GAME_ART["warframe"]);
   --------------------------------------------------------------------------- */

function setGameImage(el, art) {
  if (!el || !art) return;
  const candidates = [art.hero, art.capsule, art.header].filter(Boolean);
  let i = 0;

  const tryNext = () => {
    if (i >= candidates.length) {
      el.removeAttribute("src");
      el.closest(".game-card")?.classList.add("game-card--no-art");
      return;
    }
    el.src = candidates[i++];
  };

  el.onerror = tryNext;
  el.onload = () => { el.onerror = null; };
  tryNext();
}

/* Variante für CSS-Backgrounds statt <img> ---------------------------------- */

function setGameBackground(node, art) {
  if (!node || !art) return;
  const probe = new Image();
  const candidates = [art.hero, art.capsule, art.header].filter(Boolean);
  let i = 0;

  const tryNext = () => {
    if (i >= candidates.length) {
      node.classList.add("game-card--no-art");
      return;
    }
    const url = candidates[i++];
    probe.onload = () => { node.style.backgroundImage = `url("${url}")`; };
    probe.onerror = tryNext;
    probe.src = url;
  };

  tryNext();
}
