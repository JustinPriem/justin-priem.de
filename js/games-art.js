/* ===========================================================================
   games-art.js  –  Bildquellen für die Game Cards
   ---------------------------------------------------------------------------
   Wird von der Gaming-Seite UND vom Admin-Bereich eingebunden, damit die
   Vorschau im Backend exakt dasselbe Bild zeigt wie später die Website.

   Reihenfolge, in der ein Bild gesucht wird:
     1. game.cover     eigener Upload (Rang-Screenshot o.ä.) — hat Vorrang,
                       lässt sich im Admin-Bereich wieder entfernen
     2. game.artwork   bewusst hinterlegtes Bild unter assets/games/, für
                       Spiele ohne Steam-Release UND für Titel, bei denen
                       Steam nur einen Platzhalter liefert
     3. game.steamAppId  Artwork vom offiziellen Steam-CDN, in drei Varianten:
                       capsule 616x353  – Steams Grid-Vorschaubild, passt vom
                                          Seitenverhältnis am besten
                       header  460x215  – existiert praktisch immer
                       hero   1920x620  – sehr breites Banner als letzte Reserve
     4. sonst          Monogramm (macht die aufrufende Seite selbst)

   artwork steht bewusst VOR Steam: Steam liefert für manche (meist neuere)
   Titel ein einfarbig graues Platzhalterbild mit HTTP 200 aus — das lädt
   erfolgreich, der Fallback würde also nie greifen. Battlefield 6 ist so ein
   Fall: das echte Artwork liegt dort nur unter einem gehashten Pfad, den man
   ohne Store-API nicht kennt.

   Warum eine feste AppID statt einer Suche? Die Seite läuft rein statisch auf
   GitHub Pages. Weder Steam (store/appdetails/SearchApps) noch SteamGridDB
   oder RAWG senden CORS-Header, es lässt sich also aus dem Browser heraus
   nichts nachschlagen. Bild-URLs vom Steam-CDN funktionieren dagegen als
   ganz normales <img> — die AppID wird deshalb als Datenfeld gepflegt.
   =========================================================================== */

const STEAM_CDN = "https://cdn.cloudflare.steamstatic.com/steam/apps";

function steamArt(appId) {
  return {
    appId,
    capsule: `${STEAM_CDN}/${appId}/capsule_616x353.jpg`,
    header: `${STEAM_CDN}/${appId}/header.jpg`,
    hero: `${STEAM_CDN}/${appId}/library_hero.jpg`,
    poster: `${STEAM_CDN}/${appId}/library_600x900.jpg`,
    store: `https://store.steampowered.com/app/${appId}/`,
  };
}

/* Steam-Bildvarianten zu einer AppID, beste zuerst. Leere/ungültige Eingaben
   liefern eine leere Liste — nicht jedes Spiel ist auf Steam. */
function steamArtCandidates(appId) {
  const id = String(appId ?? "").trim();
  if (!/^\d+$/.test(id)) return [];
  const art = steamArt(id);
  return [art.capsule, art.header, art.hero];
}

/* Alle Bildkandidaten eines Spiels in Prioritätsreihenfolge.
   kind unterscheidet den eigenen Upload vom automatisch geladenen Artwork —
   danach richtet sich die Darstellung (contain mit Rand vs. randfüllend). */
function gameArtSources(game) {
  if (!game) return [];
  const sources = [];
  if (game.cover) sources.push({ url: String(game.cover), kind: "cover" });
  if (game.artwork) sources.push({ url: String(game.artwork), kind: "auto" });
  steamArtCandidates(game.steamAppId).forEach((url) => sources.push({ url, kind: "auto" }));
  return sources;
}

/* Hängt die Fallback-Kette an ein <img>: schlägt eine Quelle fehl, wird die
   nächste versucht. Sind alle durch, läuft onExhausted() — dort entscheidet
   die aufrufende Seite, was stattdessen passiert (Monogramm, Hinweistext …). */
function setGameImage(img, sources, onExhausted) {
  if (!img) return;
  const list = Array.isArray(sources) ? sources.filter(Boolean) : [];
  let i = 0;

  const tryNext = () => {
    if (i >= list.length) {
      img.removeAttribute("src");
      if (typeof onExhausted === "function") onExhausted();
      return;
    }
    const source = list[i++];
    img.dataset.artKind = source.kind || "auto";
    img.src = source.url;
  };

  img.onerror = tryNext;
  tryNext();
}
