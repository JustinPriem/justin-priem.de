# justin-priem.de

Eine statische Website (reines HTML/CSS/JS, kein Build-Prozess nötig) mit vier Seiten:

- `index.html` — Hub mit den drei Bereichen
- `gaming.html` — Gaming History (futuristisches HUD-Theme)
- `cycling.html` — Radtouren (Strava/Komoot-inspiriertes Theme)
- `raya.html` — Foto-Galerie, nach Datum sortierbar (schlicht & clean)

Alle Inhalte sind aktuell **Platzhalter** — die Seite ist voll funktionsfähig,
und lässt sich entweder über die Daten-Dateien (siehe unten) oder bequem über
einen eigenen **Admin-Bereich im Browser** befüllen.

## 🔐 Admin-Bereich zum Verwalten der Inhalte

Unter `admin/` gibt es einen passwortgeschützten Bereich, in dem du Games,
Radtouren und Raya-Fotos direkt im Browser hinzufügen, bearbeiten und löschen
kannst (inkl. Bild-Upload) — ohne Code anzufassen. **Kein externer
Backend-Dienst nötig:** Änderungen werden direkt per GitHub-API als Commit
in dieses Repo geschrieben (in genau die Dateien, die unten unter „Inhalte
anpassen" beschrieben sind) — die Website bleibt komplett statisch und läuft
unverändert auf GitHub Pages.

**Einmalige Einrichtung (~5–10 Min.): siehe [`ADMIN-SETUP.md`](ADMIN-SETUP.md).**

Der Schutz besteht aus zwei Teilen: einem Passwort (rein clientseitig — bei
einer statischen Seite ohne Server technisch nicht anders lösbar, also eher
ein Türsteher als ein Tresor) und deinem persönlichen GitHub-Zugriffstoken,
das die eigentlichen Schreibrechte gibt und nur in deinem eigenen Browser
liegt, nie im Code.

Solange der Admin-Bereich noch nicht eingerichtet ist, funktioniert die
Website ganz normal weiter — du pflegst die Inhalte dann wie unten
beschrieben direkt in den Daten-Dateien.

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

**Am einfachsten über den [Admin-Bereich](#-admin-bereich-zum-verwalten-der-inhalte)**
(Login im Browser, Formulare, Bild-Upload — siehe `ADMIN-SETUP.md`). Der
schreibt automatisch in genau die Dateien, die unten beschrieben sind.

Du kannst dieselben Dateien aber auch jederzeit direkt von Hand bearbeiten
— sie sind gut kommentiert, du musst nirgends HTML anfassen:

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
Ein Eintrag pro Tour: Strecke, Datum, Kilometer, Höhenmeter. `summary` ist
der kurze Vorschautext auf der Kartenübersicht (`cycling.html`), `description`
der ausführliche Text — der erscheint nur auf der eigenen Detailseite
(`tour.html?id=…`, verlinkt von jeder Karte). Fotos optional unter
`assets/cycling/` ablegen und im Feld `image` verlinken.

**Mehrere Aktivitäten pro Tour:** Ist eine Tour über mehrere Strava-/Komoot-
Aktivitäten verteilt hochgeladen, trägst du im Feld `embeds` einfach mehrere
Einträge ein (Liste von `{ type, label, code }`) — alle werden nacheinander
auf der Detailseite angezeigt. Am einfachsten geht das über den
[Admin-Bereich](#-admin-bereich-zum-verwalten-der-inhalte), der dafür ein
„+ Einbettung hinzufügen"-Formular hat.

**Strava einbetten:** Öffne deine Aktivität auf strava.com → „Teilen" →
„Auf Website einbetten" (nur bei öffentlichen Aktivitäten verfügbar). Den
kompletten Code (das `<div class="strava-embed-placeholder">`) fügst du als
`code` eines Embed-Eintrags ein.

**Komoot einbetten:** Auf deiner Komoot-Tour → „Teilen" → „Einbetten" →
den `<iframe>`-Code als `code` eines Embed-Eintrags einfügen.

Ist bei einer Tour noch kein Embed hinterlegt, zeigt die Detailseite
stattdessen nur die Buttons „Auf Strava/Komoot ansehen" (aus `stravaUrl`/
`komootUrl`, falls gesetzt).

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
cycling.html         Radfahren-Sektion (Kartenübersicht)
tour.html            Tour-Detailseite (?id=…, verlinkt von jeder Karte)
raya.html            Raya-Sektion
css/
  base.css            gemeinsamer Reset + Footer-Grundgerüst
  landing.css          Theme für index.html
  gaming.css           Theme für gaming.html
  cycling.css          Theme für cycling.html + tour.html
  raya.css             Theme für raya.html
js/
  socials.js          zentrale Social-Links + Footer-Rendering
  gaming-data.js / gaming.js     (GAMES + Render-Logik)
  cycling-data.js / cycling.js   (TOURS + Karten-Render-Logik)
  route-spark.js       geteiltes Höhenprofil-Icon (cycling.js + tour.js)
  tour.js              Render-Logik der Tour-Detailseite
  raya-data.js / raya.js         (RAYA_PHOTOS + Render-Logik)
admin/
  index.html           Login (Passwort + GitHub-Token)
  dashboard.html        Admin-Oberfläche (Games/Touren/Raya verwalten)
  css/admin.css
  js/admin-config.js   dein GitHub-Repo + Passwort-Hash
  js/github-api.js     Helfer für die GitHub Contents API
  js/admin-login.js / admin-dashboard.js
assets/
  games/ cycling/ raya/    Bilder (manuell oder über den Admin-Bereich hochgeladen)
ADMIN-SETUP.md        Schritt-für-Schritt-Anleitung für den Admin-Bereich
```
