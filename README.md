# justin-priem.de

Eine statische Website (reines HTML/CSS/JS, kein Build-Prozess nötig) mit vier Seiten:

- `index.html` — Hub mit den drei Bereichen
- `gaming.html` — Gaming History (futuristisches HUD-Theme)
- `cycling.html` — Radtouren (Strava/Komoot-inspiriertes Theme)
- `raya.html` — Foto-Galerie, nach Datum sortierbar (schlicht & clean)

Alle Inhalte sind aktuell **Platzhalter** — die Seite ist voll funktionsfähig,
du musst nur die Daten-Dateien mit echten Inhalten befüllen.

`index.html` ist als **Scrollytelling-Seite** gebaut: Beim Runterscrollen
wandert man durch drei Kapitel (Gaming → Radfahren → Raya), jedes im eigenen
Theme, mit Live-Statistiken aus den jeweiligen Daten-Dateien. Oben bleibt ein
Schnellzugriff (Quicknav) fixiert, der zum passenden Kapitel springt und sich
farblich an das aktuelle Kapitel anpasst. Jedes Kapitel hat außerdem einen
Button zur vollständigen Unterseite.

---

## 1. Lokal ansehen

Einfach `index.html` doppelklicken und im Browser öffnen. Es ist kein
Server nötig, alles läuft rein clientseitig.

---

## 2. Inhalte anpassen

Alle Inhalte liegen in eigenen, gut kommentierten Dateien — du musst nirgends
HTML anfassen.

### Socials (Footer, auf allen Seiten)
→ `js/socials.js`
Trag dort deine echten Profil-Links ein (Instagram, Discord, Twitch, Steam,
Strava, …). Diese Datei wird auf jeder Seite eingebunden.

### Gaming
→ `js/gaming-data.js`
Ein Eintrag pro Spiel: Titel, Genre, Spielstunden, Rang, seit wann, ein
Highlight-Satz. Cover-Bild optional unter `assets/games/` ablegen und den
Pfad im Feld `cover` eintragen — ohne Bild wird automatisch ein Monogramm
angezeigt.

### Radfahren
→ `js/cycling-data.js`
Ein Eintrag pro Tour: Strecke, Datum, Kilometer, Höhenmeter, Beschreibung.
Fotos optional unter `assets/cycling/` ablegen und im Feld `image` verlinken.

**Strava einbetten:** Öffne deine Aktivität auf strava.com → „Teilen" →
„Auf Website einbetten" (nur bei öffentlichen Aktivitäten verfügbar). Den
kompletten `<iframe src="...">`-Link kopierst du in das Feld `stravaEmbed`
des jeweiligen Tour-Eintrags.

**Komoot einbetten:** Auf deiner Komoot-Tour → „Teilen" → „Einbetten" →
die angezeigte Embed-URL in `komootEmbed` eintragen.

Ist bei einer Tour kein Embed hinterlegt, zeigt die Karte automatisch nur
Buttons zu Strava/Komoot an.

### Raya
→ `js/raya-data.js`
Ein Eintrag pro Foto mit Datum (`YYYY-MM-DD`, wichtig für die Sortierung)
und optionaler Bildunterschrift. Fotos unter `assets/raya/` ablegen und im
Feld `src` verlinken.

---

## 3. Eigene Bilder einbinden

Lege Bilder einfach in die passenden Ordner:

```
assets/games/     z.B. apex.jpg, warframe.jpg …
assets/cycling/   z.B. prag-01.jpg, amsterdam-tag3.jpg …
assets/raya/      z.B. 2024-05-18.jpg …
```

und trage den relativen Pfad (z.B. `assets/raya/2024-05-18.jpg`) im
jeweiligen `src`- bzw. `cover`- bzw. `image`-Feld ein.

Für gute Ladezeiten: Fotos vorher auf ca. 1600px lange Kante komprimieren
(z.B. mit squoosh.app).

---

## 4. Auf justin-priem.de veröffentlichen

Du hast zwei einfache Optionen:

**Option A — klassisches Webhosting (z.B. IONOS, All-Inkl, Strato):**
Den kompletten Inhalt dieses Ordners per FTP/SFTP oder File-Manager in das
Wurzelverzeichnis (oft `httpdocs`, `public_html` oder `htdocs`) deines
Hosting-Pakets hochladen. Fertig — `justin-priem.de` zeigt direkt auf
`index.html`.

**Option B — kostenloses Hosting mit eigener Domain (z.B. Netlify, Vercel,
GitHub Pages):**
1. Ordner in ein Git-Repository legen (z.B. auf GitHub) oder bei Netlify
   per Drag & Drop hochladen.
2. Im Hosting-Dashboard unter „Custom domain" `justin-priem.de` eintragen.
3. Bei deinem Domain-Registrar die dort angezeigten DNS-Einträge (meist ein
   `A`-Record oder `CNAME`) setzen.
4. Nach der DNS-Ausbreitung (bis zu 24h) ist die Seite unter deiner Domain
   erreichbar — meist inklusive kostenlosem SSL-Zertifikat.

---

## 5. Struktur im Überblick

```
index.html          Hub-Seite
gaming.html          Gaming-Sektion
cycling.html         Radfahren-Sektion
raya.html            Raya-Sektion
css/
  base.css            gemeinsamer Reset + Footer-Grundgerüst
  landing.css          Theme für index.html
  gaming.css           Theme für gaming.html
  cycling.css          Theme für cycling.html
  raya.css             Theme für raya.html
js/
  socials.js          zentrale Social-Links + Footer-Rendering
  gaming-data.js / gaming.js
  cycling-data.js / cycling.js
  raya-data.js / raya.js
assets/
  games/ cycling/ raya/    eigene Bilder hier ablegen
```
