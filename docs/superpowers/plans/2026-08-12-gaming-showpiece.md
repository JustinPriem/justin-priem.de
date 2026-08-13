# Gaming Showpiece Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Baue `gaming-intro.html` neu — ein 10-Sekunden-Film als scroll-gescrubbte WebP-Framesequenz auf einem Canvas, gefolgt von sechs Kapiteln, die vollständig aus Code entstehen.

**Architecture:** Statische Seite ohne Build-Schritt. **Genau ein Video auf der ganzen Seite** (der Film); jedes Kapitel darunter wird aus Code erzeugt — Canvas-Partikel, Laufbänder, Scramble-Text, gepinnter Querlauf. Der Film wird über ein ImageBitmap-Schiebefenster gezeichnet, gesteuert vom Scroll-Fortschritt eines hohen Treibers mit `position: sticky`-Bühne. Die Seite ist **progressive enhancement**: das Gerüst aus Task 5 ist bereits ohne jedes JavaScript vollständig lesbar, womit der Reduced-Motion-Fall kein Sonderweg, sondern der Grundzustand ist.

**Tech Stack:** Vanilla HTML/CSS/JS · GSAP 3 + ScrollTrigger + Lenis (CDN) · Canvas 2D (**kein WebGL**) · Seedance 2.0 über Magnific MCP für den Film · Seedream 5 Pro für Keyframes · ffmpeg über `imageio-ffmpeg` (reines Build-Werkzeug) · `node:test` für die Datenlogik.

## Global Constraints

- **KEIN `git push`.** Jeder Task committet ausschließlich lokal. Erst nach ausdrücklicher Freigabe des Nutzers in Task 9 darf gepusht werden. Bewusste Abweichung vom sonstigen Auto-Push-Workflow dieses Repos.
- Vor jeder Code-Änderung: `git fetch origin && git log HEAD..origin/main --oneline`. Bei neuen Commits erst `git pull`, nichts überschreiben — der Admin-Bereich committet parallel per GitHub-API auf `main`.
- **Unangetastet:** `gaming.html`, `css/gaming.css`, `js/gaming.js`, `js/gaming-data.js`, der gesamte `admin/`-Ordner.
- `js/gaming-data.js` wird **nur lesend** eingebunden. Kein Spielname, kein Stundenwert wird fest verdrahtet.
- **Genau ein Video auf der gesamten Seite.** Keine weiteren `.mp4`-Dateien, keine weiteren Bilddateien außer den Framesätzen und dem Poster. Jedes Kapitel unterhalb des Films entsteht aus Code.
- **Kein WebGL.** Alle Effekte laufen über CSS, GSAP oder Canvas 2D — was nicht existiert, kann nicht ausfallen.
- **Gewicht ist ein hartes Kriterium:** Desktop-Framesatz ≤ 6 MB, Mobile-Framesatz ≤ 2 MB. Bei Überschreitung wird **die Breite reduziert, niemals die Framezahl**.
- Frames als **WebP** (`-c:v libwebp`), Desktop 960 px `-quality 72`, Mobile 480 px `-quality 65`, native 24 fps ohne Dezimierung.
- **Kein Ton** in keiner Form (`withSoundEffects: false` bei jeder Generierung, `-an` bei jedem ffmpeg-Lauf).
- Kein Build-Schritt, kein Bundler, keine neue Laufzeit-Abhängigkeit.
- Vor jeder kostenpflichtigen Generierung Guthaben mit `account_balance` prüfen. Budget gesamt ~10.200 Credits von 137.514.
- **Verifikation ausschließlich über den echten HTTP-Server** (`mcp__Claude_Browser__preview_start` mit `{"name":"gaming-intro"}`, dann `http://localhost:8843/gaming-intro.html`). **`file:///`-Navigation ist verboten** — Pfade unterhalb `.claude/worktrees/` rendern im Browser-Pane als totes Standbild ohne CSS/JS/Bilder; im vorherigen Build ist dadurch ein echter Bug durch zwei Reviews gerutscht.
- Magnific-Tools haben das Präfix `mcp__005f386f-d0ef-4495-857a-fffbb268d873__`. Frische Subagents laden sie per `ToolSearch` mit `select:<name>,<name>` nach.

### Farb- und Schriftsystem (verbindlich)

```
--void:    #05060A    Grundschwarz
--chrome:  #EAEEF5    Silberweiß, Fließtext
--cyan:    #22E0D6    Akzent Welt 1 (Chrome)
--magenta: #FF3DAF    Akzent Welt 2 (Korridor)
--amber:   #FFA43D    Akzent Welt 3 (Kern)
--dim:     #7A8697    Nebentext
```

Display-Schrift **Anton**, UI-/Monoschrift **JetBrains Mono**, beide von Google Fonts. Anton ist keine Geschmacksfrage: Kapitel 2 zeigt Film *durch* Buchstabenformen, und das funktioniert nur bei sehr fetten, geschlossenen Formen — eine leichte Schrift bietet zu wenig Fläche, um Bewegung lesbar zu machen.

---

### Task 1: Werkzeugkette, Aufräumen, Datenmodul

**Files:**
- Create: `js/gaming-intro-data.js`, `js/gaming-intro-data.test.js`
- Delete: `js/gaming-intro.js`, `js/gaming-intro.test.js`
- Delete: `assets/gaming-intro/surface.jpg`, `depth-1-cyan.jpg`, `depth-2-magenta.jpg`, `depth-3-violet.jpg`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `getTopGames(games, n)` → neues Array, absteigend nach `hours`, Länge `min(n, games.length)`, mutiert `games` nicht. `getAggregateStats(games)` → `{ count: number, totalHours: number }`. Beide über `module.exports`, wenn `module` existiert (Doppelnutzung Browser-Global / Node-`require`).
- Produces: ffmpeg-Binärpfad über `python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"` — Tasks 3 und 4 brauchen ihn.

**Zwischenzustand:** Danach ist `gaming-intro.html` kaputt (lädt gelöschtes JS, zeigt auf gelöschte Bilder). Beabsichtigt — Task 5 schreibt Seite und CSS vollständig neu. Auf einem Feature-Branch ohne Live-Bezug harmlos und ehrlicher, als tote Dateien mitzuschleppen.

- [ ] **Step 1: Upstream prüfen**

```bash
git fetch origin && git log HEAD..origin/main --oneline
```
Leere Ausgabe = weiter. Sonst erst `git pull origin main`.

- [ ] **Step 2: ffmpeg beschaffen**

```bash
python -m pip install imageio-ffmpeg
python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"
```
Erwartet: Pfad auf eine `ffmpeg*.exe`. In den Report schreiben. Es wird **nichts** am System oder am PATH verändert.

- [ ] **Step 3: WebP-Fähigkeit prüfen**

```bash
FFMPEG=$(python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
"$FFMPEG" -hide_banner -encoders 2>&1 | grep -i webp
```
Erwartet: eine Zeile mit `libwebp`. Fehlt sie → STOP und melden, der Framesatz wäre nicht wie geplant erzeugbar.

- [ ] **Step 4: Testdatei schreiben**

```js
// js/gaming-intro-data.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { getTopGames, getAggregateStats } = require("./gaming-intro-data.js");

const FIXTURE = [
  { title: "Warframe", hours: 1425 },
  { title: "Delta Force", hours: 801 },
  { title: "Apex Legends", hours: 640 },
  { title: "Minecraft", hours: 12 },
];

test("getTopGames sortiert absteigend nach hours und begrenzt auf n", () => {
  const top = getTopGames(FIXTURE, 3);
  assert.deepEqual(top.map((g) => g.title), ["Warframe", "Delta Force", "Apex Legends"]);
});

test("getTopGames verändert das Original-Array nicht", () => {
  const before = FIXTURE.map((g) => g.title);
  getTopGames(FIXTURE, 3);
  assert.deepEqual(FIXTURE.map((g) => g.title), before);
});

test("getTopGames funktioniert mit weniger als n Spielen", () => {
  const top = getTopGames(FIXTURE.slice(0, 2), 3);
  assert.equal(top.length, 2);
});

test("getAggregateStats zählt Spiele und summiert Stunden", () => {
  const stats = getAggregateStats(FIXTURE);
  assert.equal(stats.count, 4);
  assert.equal(stats.totalHours, 1425 + 801 + 640 + 12);
});
```

- [ ] **Step 5: Test laufen lassen, Fehlschlag bestätigen**

Run: `node --test js/gaming-intro-data.test.js`
Erwartet: FAIL mit `Cannot find module './gaming-intro-data.js'`.

- [ ] **Step 6: Datenmodul anlegen**

```js
// js/gaming-intro-data.js
/**
 * GAMING SHOWPIECE — Datenlogik
 * -----------------------------------------------------------
 * Liest GAMES aus gaming-data.js NUR LESEND. Keine eigene
 * Datenhaltung — der Admin-Bereich bleibt einzige Quelle der
 * Wahrheit für Spiele-Inhalte.
 */

function getTopGames(games, n) {
  return [...games].sort((a, b) => b.hours - a.hours).slice(0, n);
}

function getAggregateStats(games) {
  return {
    count: games.length,
    totalHours: games.reduce((sum, g) => sum + g.hours, 0),
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getTopGames, getAggregateStats };
}
```

- [ ] **Step 7: Test grün bestätigen**

Run: `node --test js/gaming-intro-data.test.js`
Erwartet: PASS, 4/4, keine Warnungen.

- [ ] **Step 8: Alte Dateien löschen**

```bash
git rm js/gaming-intro.js js/gaming-intro.test.js
git rm assets/gaming-intro/surface.jpg assets/gaming-intro/depth-1-cyan.jpg assets/gaming-intro/depth-2-magenta.jpg assets/gaming-intro/depth-3-violet.jpg
```

- [ ] **Step 9: Build- und Werkzeugordner ignorieren**

`.gitignore` um zwei Zeilen ergänzen (bestehende Zeilen behalten):

```
.claude/
.build/
```

`.build/` hält Keyframes und Rohclips als Build-Zwischenstände aus dem
Repository heraus.

`.claude/` ist **nicht optional**: Der Arbeits-Worktree liegt selbst unter
`.claude/worktrees/`, und Schritt 10 dieses Tasks führt `git add -A` aus. Ohne
diesen Eintrag würde genau dieser Befehl beginnen, den Arbeitsordner und die
lokale `launch.json` in ihr eigenes Repository aufzunehmen.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Datenmodul herauslösen, alten Build abräumen, ffmpeg-Werkzeug bereitstellen"
```

---

### Task 2: Drei Keyframes

**Files:**
- Create: `.build/keyframes/kf1-chrome.jpg`, `kf2-schwelle.jpg`, `kf3-kern.jpg`

**Interfaces:**
- Produces: drei Bilddateien **und** ihre Magnific-Creation-Identifier. Die Identifier gehören in den Report — Tasks 3 und 4 setzen sie direkt als `keyframes.start.url` / `keyframes.end.url` ein, ohne erneuten Upload.

**Werkzeuge nachladen:**
```
ToolSearch: select:mcp__005f386f-d0ef-4495-857a-fffbb268d873__account_balance,mcp__005f386f-d0ef-4495-857a-fffbb268d873__images_generate,mcp__005f386f-d0ef-4495-857a-fffbb268d873__creations_wait,mcp__005f386f-d0ef-4495-857a-fffbb268d873__creations_get
```

- [ ] **Step 1: Guthaben prüfen**

`account_balance`. Erwartet ≥ 1.000 Credits. Darunter → STOP.

- [ ] **Step 2: KF1 — Chrom im Void**

`images_generate`:
```json
{
  "prompt": "Cinematic opening frame of a premium title sequence. Pitch black void. A colossal mass of liquid chrome churning slowly, mercury-like mirror surface catching a razor-sharp white rim light along its edges. Fine luminous dust drifting through hard backlight. Immense scale and depth, shallow depth of field, subtle anamorphic lens flare. Palette almost entirely black and polished silver with a single acid cyan glow deep in the background. Flawless photorealistic render, rich film grain, deep true blacks. No text, no logos, no watermark, no people. 16:9 cinematic widescreen.",
  "mode": "seedream-5-pro", "aspectRatio": "16:9", "resolution": "2k", "count": 1
}
```

- [ ] **Step 3: KF2 — das Schwellenbild**

Das wichtigste Bild des Films: Es muss **beide Welten gleichzeitig** enthalten, damit kein Clip die Verwandlung erfinden muss.

```json
{
  "prompt": "Cinematic frame of a premium title sequence. A colossal mass of liquid chrome has parted and reformed into the mouth of a corridor: mirror-bright chrome walls curving inward like an aperture, framing a dark rectangular opening at the center. Beyond the opening, faint cyan and magenta neon light and volumetric haze are already visible, receding into depth. The chrome is still unmistakably liquid metal; the space beyond is unmistakably an architectural corridor. Hard rim light on the chrome edges, fine dust in the beam, shallow depth of field, anamorphic lens flare. Deep true blacks, rich film grain, flawless photorealistic render. No text, no logos, no watermark, no people. 16:9 cinematic widescreen.",
  "mode": "seedream-5-pro", "aspectRatio": "16:9", "resolution": "2k", "count": 1
}
```

- [ ] **Step 4: KF3 — der Kern**

```json
{
  "prompt": "Cinematic final frame of a premium title sequence. A colossal molten energy core suspended in absolute darkness, filling most of the frame, arcs of white-hot plasma curling around it. Molten amber and incandescent gold against deep violet shadow. Swirling embers and particulate caught in god rays. Overwhelming scale, the camera dwarfed by it. Shallow depth of field, anamorphic lens flare, rich film grain, deep blacks, flawless photorealistic render. No text, no logos, no watermark, no people. 16:9 cinematic widescreen.",
  "mode": "seedream-5-pro", "aspectRatio": "16:9", "resolution": "2k", "count": 1
}
```

- [ ] **Step 5: Warten und herunterladen**

`creations_wait` mit allen drei Identifiern (bei `allTerminal: false` erneut aufrufen), dann `creations_get` je Identifier für die `url`:

```bash
mkdir -p .build/keyframes
curl -sL -A "Mozilla/5.0" "<url-kf1>" -o .build/keyframes/kf1-chrome.jpg
curl -sL -A "Mozilla/5.0" "<url-kf2>" -o .build/keyframes/kf2-schwelle.jpg
curl -sL -A "Mozilla/5.0" "<url-kf3>" -o .build/keyframes/kf3-kern.jpg
ls -la .build/keyframes/
```
Erwartet: drei Dateien, jede > 50 KB.

- [ ] **Step 6: Bilder ansehen und beurteilen**

Alle drei mit `Read` öffnen und tatsächlich anschauen:
- KF1: schwarzer Raum, flüssiges Chrom, kein Text/Wasserzeichen
- **KF2: enthält es wirklich beides?** Chromwände *und* dahinterliegender Korridor mit Neon. Zeigt es nur eins von beidem, ist der Zweck verfehlt → einmal neu generieren (Puffer eingeplant), Prompt um „the chrome forms the *frame* around a visible corridor opening" schärfen.
- KF3: glühender Kern, füllt das Bild

Beurteilung in den Report, nicht nur „sieht gut aus".

- [ ] **Step 7: Nichts committen**

```bash
git status --short
```
Erwartet: keine Änderungen (`.build/` ist ignoriert). Ergebnis dieses Tasks sind die drei **Creation-Identifier** im Report.

---

### Task 3: Probelauf und Nahtstellen-Prüfung (Kosten-Gate)

**Files:**
- Create: `.build/draft/clip1.mp4`, `clip2.mp4`, `clip1-last.png`, `clip2-first.png`

**Interfaces:**
- Consumes: die drei Creation-Identifier aus Task 2.
- Produces: die Ja/Nein-Antwort auf die einzige Frage, die über 7.000 Credits entscheidet — **hält Seedance den Start-Pin?**

Dieser Task existiert allein, um Geld zu schützen. Das Modell verspricht, auf exakt den gepinnten Pixeln zu starten; ob es das tut, ist providerabhängig und muss gemessen werden (playbook §2b). Gemessen wird am billigsten Modell, weil die Frage nicht von der Qualitätsstufe abhängt.

**Werkzeuge nachladen:**
```
ToolSearch: select:mcp__005f386f-d0ef-4495-857a-fffbb268d873__account_balance,mcp__005f386f-d0ef-4495-857a-fffbb268d873__video_generate,mcp__005f386f-d0ef-4495-857a-fffbb268d873__creations_wait,mcp__005f386f-d0ef-4495-857a-fffbb268d873__creations_get,mcp__005f386f-d0ef-4495-857a-fffbb268d873__creations_upload_image
```

- [ ] **Step 1: Guthaben prüfen**

`account_balance`. Erwartet ≥ 2.000 Credits.

- [ ] **Step 2: Probe-Clip 1 (720p Mini)**

`<KF1>`/`<KF2>` sind die Identifier aus Task 2:
```json
{
  "video": { "clips": [{
    "slug": "bytedance-seedance-mini-2.0",
    "prompt": "One unbroken forward push, no cuts. The camera drives steadily deeper into the churning liquid chrome, closing the distance; the chrome mass parts ahead of it and reforms into the mouth of a corridor, and the camera continues straight toward that opening as neon light beyond it grows brighter. The camera only ever moves forward and inward, never back, never sideways.",
    "duration": 5, "aspectRatio": "16:9", "resolution": "720p",
    "cameraMotion": "superDollyIn", "withSoundEffects": false,
    "keyframes": { "start": { "type": "image", "url": "<KF1>" }, "end": { "type": "image", "url": "<KF2>" } }
  }] }
}
```
`creations_wait`, `creations_get`, herunterladen nach `.build/draft/clip1.mp4`.

- [ ] **Step 3: Letzten Frame extrahieren**

```bash
FFMPEG=$(python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
mkdir -p .build/draft
"$FFMPEG" -y -v error -sseof -0.05 -i .build/draft/clip1.mp4 -update 1 -q:v 1 .build/draft/clip1-last.png
ls -la .build/draft/clip1-last.png
```

- [ ] **Step 4: Frame hochladen**

`creations_upload_image` mit `.build/draft/clip1-last.png`. Identifier festhalten. Magnific akzeptiert nur Creation-Identifier oder Asset-URLs, **niemals `webUrl`** — und eine lokale Datei hat keine URL.

- [ ] **Step 5: Probe-Clip 2, gestartet auf dem echten letzten Frame**

```json
{
  "video": { "clips": [{
    "slug": "bytedance-seedance-mini-2.0",
    "prompt": "One unbroken forward push, no cuts, continuing the exact same move from the reference frame with identical framing and identical colour grade. The camera flies straight down the rain-slicked neon corridor, wet floor reflecting the passing lights, neon strips streaking past on both sides; the corridor opens out into vast darkness and a colossal molten core comes into view ahead, growing until it dominates the frame. The camera only ever moves forward and inward, never back, never sideways.",
    "duration": 5, "aspectRatio": "16:9", "resolution": "720p",
    "cameraMotion": "pushIn", "withSoundEffects": false,
    "keyframes": { "start": { "type": "image", "url": "<UPLOAD-ID aus Step 4>" }, "end": { "type": "image", "url": "<KF3>" } }
  }] }
}
```
Herunterladen nach `.build/draft/clip2.mp4`.

- [ ] **Step 6: Ersten Frame von Clip 2 extrahieren**

```bash
FFMPEG=$(python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
"$FFMPEG" -y -v error -i .build/draft/clip2.mp4 -frames:v 1 -q:v 1 .build/draft/clip2-first.png
```

- [ ] **Step 7: Nahtstelle messen**

```bash
FFMPEG=$(python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
"$FFMPEG" -hide_banner -i .build/draft/clip1-last.png -i .build/draft/clip2-first.png -lavfi ssim -f null - 2>&1 | grep -i "All"
```
Bewertung nach playbook §3:
- **SSIM ≥ 0,88 → bestanden**
- 0,80–0,88 → beide PNGs ansehen und entscheiden: gleiche Komposition, gleiche Lichtstimmung, gleiche Objekte = bestanden
- < 0,80 oder sichtbar andere Szene → **nicht bestanden**

- [ ] **Step 8: Beide Frames ansehen**

`clip1-last.png` und `clip2-first.png` mit `Read` öffnen und vergleichen. Die Zahl sagt, *wo* man hinschauen soll; entschieden wird am Bild. Beurteilung in den Report.

- [ ] **Step 9: Das Gate**

- **Bestanden** → in den Report: „Start-Pin hält, SSIM `<Wert>`, Verkettung freigegeben", weiter mit Task 4.
- **Nicht bestanden** → **STOP, Status BLOCKED, nicht mastern.** Das Modell erfindet den Startframe neu; dann ist Verkettung zu keinem Preis sauber. Messung in den Report und die Entscheidung dem Controller überlassen (Alternative wäre ein einzelner 10-s-Take ohne Verkettung — das ist eine Planänderung, keine Implementierungsentscheidung).

- [ ] **Step 10: Verbrauch festhalten**

`account_balance` erneut aufrufen, tatsächlichen Verbrauch in den Report. Nichts zu committen.

---

### Task 4: Master-Film, Kopfbeschnitt, Framesätze

**Files:**
- Create: `.build/master/clip1.mp4`, `clip2.mp4`, `master.mp4`, `trimmed.mp4`
- Create: `assets/gaming-intro/frames/f_0001.webp` … (Desktop)
- Create: `assets/gaming-intro/frames-sm/f_0001.webp` … (Mobile)
- Create: `assets/gaming-intro/poster.jpg`
- Create: `js/gaming-intro-frames.js`

**Interfaces:**
- Consumes: Keyframe-Identifier aus Task 2, bestandenes Gate aus Task 3.
- Produces: `window.GS_FRAME_COUNT` (Zahl) in `js/gaming-intro-frames.js`; Verzeichnisse `assets/gaming-intro/frames/` und `frames-sm/` mit Dateinamen `f_%04d.webp` ab `f_0001.webp`. Task 6 liest beides.

Die Framezahl wird bewusst in eine eigene winzige Datei geschrieben statt in die Engine: Der Kopfbeschnitt ändert sie, und ein Wert, der in zwei Tasks gepflegt werden müsste, ist die häufigste Ursache dafür, dass ein beschnittener Film am Scrollende ins Leere läuft.

- [ ] **Step 1: Guthaben prüfen**

`account_balance`. Erwartet ≥ 8.000 Credits.

- [ ] **Step 2: Master-Clip 1 (1080p Pro)**

Exakt dieselben Prompts, Keyframes und `cameraMotion` wie im Probelauf — nur `slug` und `resolution` ändern sich. Alles andere zu ändern würde das Gate aus Task 3 entwerten.

```json
{
  "video": { "clips": [{
    "slug": "bytedance-seedance-pro-2.0",
    "prompt": "One unbroken forward push, no cuts. The camera drives steadily deeper into the churning liquid chrome, closing the distance; the chrome mass parts ahead of it and reforms into the mouth of a corridor, and the camera continues straight toward that opening as neon light beyond it grows brighter. The camera only ever moves forward and inward, never back, never sideways.",
    "duration": 5, "aspectRatio": "16:9", "resolution": "1080p",
    "cameraMotion": "superDollyIn", "withSoundEffects": false,
    "keyframes": { "start": { "type": "image", "url": "<KF1>" }, "end": { "type": "image", "url": "<KF2>" } }
  }] }
}
```
Herunterladen nach `.build/master/clip1.mp4`.

- [ ] **Step 3: Letzten Frame extrahieren und hochladen**

```bash
FFMPEG=$(python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
mkdir -p .build/master
"$FFMPEG" -y -v error -sseof -0.05 -i .build/master/clip1.mp4 -update 1 -q:v 1 .build/master/clip1-last.png
```
Danach `creations_upload_image`, Identifier festhalten.

- [ ] **Step 4: Master-Clip 2**

Wie Task 3 Step 5, aber `"slug": "bytedance-seedance-pro-2.0"`, `"resolution": "1080p"`, `keyframes.start.url` = Upload aus Step 3, `keyframes.end.url` = `<KF3>`. Herunterladen nach `.build/master/clip2.mp4`.

**Sequenziell:** Clip 2 darf erst starten, wenn Clip 1 heruntergeladen und sein letzter Frame extrahiert ist. Niemals parallel.

- [ ] **Step 5: Zusammenfügen, doppelten Nahtframe verwerfen**

```bash
FFMPEG=$(python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
cd .build/master
"$FFMPEG" -y -v error -i clip1.mp4 -i clip2.mp4 \
  -filter_complex "[1:v]select='gte(n,1)',setpts=N/FRAME_RATE/TB[b];[0:v][b]concat=n=2:v=1:a=0[out]" \
  -map "[out]" -an -fps_mode vfr -c:v libx264 -crf 16 -pix_fmt yuv420p master.mp4
cd ../..
```
`select='gte(n,1)'` verwirft Clip 2s ersten Frame — er ist derselbe wie Clip 1s letzter, und ein doppelter Frame liest sich beim Scrubben als kurzer Stillstand. `-fps_mode vfr` verhindert, dass die Standard-Synchronisierung weitere Duplikate an der Naht einfügt.

- [ ] **Step 6: Kopf des Films Frame für Frame ansehen**

```bash
FFMPEG=$(python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
mkdir -p .build/head
"$FFMPEG" -y -v error -i .build/master/master.mp4 -vf "select='lt(n,49)',scale=320:-1" -vsync 0 .build/head/h_%03d.jpg
```
Mindestens `h_001`, `h_012`, `h_024`, `h_036`, `h_048` mit `Read` ansehen. Gesucht: der erste Frame, der **bereits in der Bewegung** liegt. Generierte Filme öffnen häufig auf einem noch stehenden Bild, und das liest sich als Schnitt in den eigenen Film hinein (`finishing.md` §1).

- [ ] **Step 7: Kopf beschneiden**

Gefundenen Startzeitpunkt einsetzen (`0.0`, wenn der Film sofort in Bewegung ist — Schritt trotzdem ausführen, damit alle folgenden Schritte dieselbe Datei nutzen):

```bash
FFMPEG=$(python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
"$FFMPEG" -y -v error -ss <SEKUNDEN> -i .build/master/master.mp4 -an -fps_mode vfr -c:v libx264 -crf 16 -pix_fmt yuv420p .build/master/trimmed.mp4
```

- [ ] **Step 8: Desktop-Framesatz**

```bash
FFMPEG=$(python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
rm -rf assets/gaming-intro/frames && mkdir -p assets/gaming-intro/frames
"$FFMPEG" -y -v error -i .build/master/trimmed.mp4 -vf "fps=24,scale=960:-2" -c:v libwebp -quality 72 -compression_level 5 assets/gaming-intro/frames/f_%04d.webp
ls assets/gaming-intro/frames | wc -l
du -sh assets/gaming-intro/frames
```

- [ ] **Step 9: Desktop-Budget prüfen**

Ziel **≤ 6 MB.** Bei Überschreitung Step 8 wiederholen mit `scale=832:-2`, dann `scale=768:-2`. **Niemals `fps=` senken, niemals Frames löschen** — die Framezahl bestimmt die Scrub-Bildrate, die Breite nur die Schärfe, und Schärfe ist auf einem bewegten, körnigen Bild das, was zuerst geopfert werden darf. Tatsächliche Größe und gewählte Breite in den Report.

- [ ] **Step 10: Mobile-Framesatz**

```bash
FFMPEG=$(python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
rm -rf assets/gaming-intro/frames-sm && mkdir -p assets/gaming-intro/frames-sm
"$FFMPEG" -y -v error -i .build/master/trimmed.mp4 -vf "fps=24,scale=480:-2" -c:v libwebp -quality 65 -compression_level 5 assets/gaming-intro/frames-sm/f_%04d.webp
ls assets/gaming-intro/frames-sm | wc -l
du -sh assets/gaming-intro/frames-sm
```
Ziel **≤ 2 MB.** Bei Überschreitung `scale=416:-2`. Die Dateianzahl **muss identisch** zur Desktop-Anzahl sein — die Engine bildet beide Sätze auf denselben Playhead ab.

- [ ] **Step 11: Poster**

```bash
FFMPEG=$(python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
"$FFMPEG" -y -v error -i .build/master/trimmed.mp4 -frames:v 1 -vf "scale=1280:-2" -q:v 4 assets/gaming-intro/poster.jpg
ls -la assets/gaming-intro/poster.jpg
```
Das Poster steht sofort, bevor ein einziges WebP geladen ist, und ist zugleich das Standbild für Reduced Motion.

- [ ] **Step 12: Framezahl-Datei**

Zahl aus Step 8 einsetzen:

```js
// js/gaming-intro-frames.js
// Wird von der Asset-Pipeline erzeugt (Plan-Task 4). Nicht von Hand ändern:
// Der Wert muss exakt der Anzahl der Dateien in assets/gaming-intro/frames/
// entsprechen, sonst fordert die Engine Frames an, die es nicht gibt.
window.GS_FRAME_COUNT = <ANZAHL>;
```

- [ ] **Step 13: Film sichten, bevor er ins Repository wandert**

Fünf Frames verteilt ansehen — erster, 25 %, 50 %, 75 %, letzter. Prüfen:
- Bewegt sich die Kamera durchgehend vorwärts, ohne Richtungswechsel?
- Sind alle drei Welten zu sehen (Chrom, Korridor, Kern)?
- Gibt es einen sichtbaren Sprung, an dem die Szene wechselt statt zu reisen?

Bei sichtbarem Sprung: Status DONE_WITH_CONCERNS mit genauer Frame-Nummer — nicht stillschweigend committen.

- [ ] **Step 14: Commit**

```bash
git add assets/gaming-intro/frames assets/gaming-intro/frames-sm assets/gaming-intro/poster.jpg js/gaming-intro-frames.js
git commit -m "Filmsequenz erzeugen: WebP-Framesätze, Poster, Framezahl"
```

---

### Task 5: Seitengerüst und CSS (ohne JS vollständig lesbar)

**Files:**
- Rewrite: `gaming-intro.html`, `css/gaming-intro.css`
- Create: `js/gaming-intro.js`

**Interfaces:**
- Consumes: `assets/gaming-intro/poster.jpg` (Task 4); `getTopGames`/`getAggregateStats` (Task 1).
- Produces die IDs: `film`, `film-canvas`, `poster`, `loader`, `loader-bar`, `chapter-name`, `chapter-bar`, `cursor`, `total-hours`, `total-games`, `type-canvas`, `run-track`, `ch-run`, `field-canvas`, `field-text`, `ticker-1`, `ticker-2`, `ticker-3`, `portal-btn`; die Klassen `gs-beat` (mit `data-in`/`data-peak`/`data-out`) und `gs-ch` (mit `data-chapter`). Tasks 6–8 sprechen genau diese an.
- Produces: `renderData()` in `js/gaming-intro.js`.

**Leitprinzip:** Das Ergebnis muss **ohne jedes JavaScript** vollständig lesbar und bedienbar sein. Damit ist der geforderte Reduced-Motion-Zustand kein nachgerüsteter Sonderfall, sondern der Grundzustand.

- [ ] **Step 1: Upstream prüfen**

```bash
git fetch origin && git log HEAD..origin/main --oneline
```

- [ ] **Step 2: `gaming-intro.html` schreiben**

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gaming — Justin Priem</title>
<meta name="description" content="Ein filmischer Sinkflug durch Justin Priems Gaming-Geschichte.">
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
<link rel="shortcut icon" href="assets/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/gaming-intro.css">
</head>
<body>

<div class="gs-loader" id="loader" aria-hidden="true"><i id="loader-bar"></i></div>
<div class="gs-cursor" id="cursor" aria-hidden="true"></div>
<div class="gs-grain" aria-hidden="true"></div>

<header class="gs-head">
  <a class="gs-back" href="index.html">justin-priem.de</a>
  <div class="gs-readout" aria-hidden="true">
    <span id="chapter-name">CHROME</span>
    <span class="gs-progress"><i id="chapter-bar"></i></span>
  </div>
</header>

<main>

  <section class="gs-film" id="film">
    <div class="gs-stage">
      <canvas id="film-canvas" aria-hidden="true"></canvas>
      <img class="gs-poster" id="poster" src="assets/gaming-intro/poster.jpg" alt="">
      <div class="gs-beat" data-in="-0.1" data-peak="0" data-out="0.22">
        <h1>JUSTIN<br>PRIEM</h1>
        <p class="gs-kicker">Gaming Log</p>
        <span class="gs-cue">scrollen</span>
      </div>
      <div class="gs-beat gs-beat--mid" data-in="0.55" data-peak="0.68" data-out="0.82">
        <p class="gs-line">Alles, was einen Save-State hinterlassen hat.</p>
      </div>
      <div class="gs-stage-fade" aria-hidden="true"></div>
    </div>
  </section>

  <section class="gs-ch gs-ch--number" id="ch-number" data-chapter="BILANZ">
    <div class="gs-wrap">
      <p class="gs-eyebrow">Bilanz</p>
      <div class="gs-huge" id="total-hours">0</div>
      <p class="gs-under">Stunden. In <span id="total-games">0</span> Welten.</p>
    </div>
  </section>

  <section class="gs-ch gs-ch--type" id="ch-type" data-chapter="GAMING">
    <canvas class="gs-type-canvas" id="type-canvas" aria-hidden="true"></canvas>
    <div class="gs-type-knock"><span>GAMING</span></div>
  </section>

  <section class="gs-ch gs-ch--run" id="ch-run" data-chapter="ARCHIV">
    <div class="gs-run-track" id="run-track"></div>
  </section>

  <section class="gs-ch gs-ch--field" id="ch-field" data-chapter="SIGNAL">
    <canvas class="gs-field-canvas" id="field-canvas" aria-hidden="true"></canvas>
    <div class="gs-wrap">
      <h2 class="gs-field-text" id="field-text" data-text="Kein Ende. Nur der nächste Start.">Kein Ende. Nur der nächste Start.</h2>
    </div>
  </section>

  <section class="gs-ch gs-ch--ticker" id="ch-ticker" data-chapter="BESTAND">
    <div class="gs-ticker-row"><div class="gs-ticker-inner" id="ticker-1"></div></div>
    <div class="gs-ticker-row gs-ticker-row--alt"><div class="gs-ticker-inner" id="ticker-2"></div></div>
    <div class="gs-ticker-row"><div class="gs-ticker-inner" id="ticker-3"></div></div>
  </section>

  <section class="gs-ch gs-ch--portal" id="ch-portal" data-chapter="PORTAL">
    <div class="gs-wrap">
      <p class="gs-eyebrow">Vollständige Historie</p>
      <a class="gs-portal" href="gaming.html" id="portal-btn"><span>Archiv betreten</span></a>
    </div>
  </section>

</main>

<footer id="site-footer"></footer>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="js/socials.js"></script>
<script src="js/gaming-data.js"></script>
<script src="js/gaming-intro-data.js"></script>
<script src="js/gaming-intro-frames.js"></script>
<script src="js/gaming-intro-film.js"></script>
<script src="js/gaming-intro-chapters.js"></script>
<script src="js/gaming-intro.js"></script>
</body>
</html>
```

`js/gaming-intro-film.js` und `js/gaming-intro-chapters.js` entstehen erst in Tasks 6 und 7. Ein fehlendes Skript erzeugt einen 404 in der Konsole, hält die Seite aber nicht auf — das ist für diesen Task ein **erwarteter** Befund, kein Fehler.

- [ ] **Step 3: `css/gaming-intro.css` schreiben**

```css
:root {
  --void: #05060A;
  --chrome: #EAEEF5;
  --cyan: #22E0D6;
  --magenta: #FF3DAF;
  --amber: #FFA43D;
  --dim: #7A8697;
  --footer-line: rgba(234,238,245,.14);
  --ease: cubic-bezier(.16,1,.3,1);
}

body {
  background: var(--void);
  color: var(--chrome);
  font-family: "JetBrains Mono", monospace;
  overflow-x: hidden;
}

/* ---------- Dauerhafte Ebenen ---------- */

.gs-loader {
  position: fixed; left: 0; top: 0; right: 0; height: 2px; z-index: 90;
  background: rgba(234,238,245,.08); opacity: 1; transition: opacity .6s ease;
}
.gs-loader.is-done { opacity: 0; }
.gs-loader i { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, var(--cyan), var(--magenta)); }

.gs-cursor {
  position: fixed; left: 0; top: 0; z-index: 95;
  width: 26px; height: 26px; margin: -13px 0 0 -13px;
  border: 1px solid rgba(234,238,245,.5); border-radius: 50%;
  pointer-events: none; opacity: 0;
  transition: opacity .3s ease, transform .18s var(--ease), background-color .18s ease;
}
.gs-cursor.is-live { opacity: 1; }
.gs-cursor.is-hot { transform: scale(1.9); background: rgba(34,224,214,.14); }
@media (hover: none) { .gs-cursor { display: none; } }

.gs-grain {
  position: fixed; inset: 0; z-index: 80; pointer-events: none;
  opacity: .16; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E");
}
.gs-grain::after {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,.6));
}

.gs-head {
  position: fixed; top: 0; left: 0; right: 0; z-index: 85;
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.4rem 1.6rem; font-size: .72rem; letter-spacing: .08em;
  color: #fff; text-shadow: 0 1px 18px rgba(0,0,0,.6); pointer-events: none;
}
.gs-head::before {
  content: ""; position: absolute; inset: 0 0 auto 0; height: 320%; z-index: -1;
  background: linear-gradient(to bottom, rgba(5,6,10,.7), rgba(5,6,10,0));
}
.gs-back { pointer-events: auto; color: currentColor; }
.gs-back:hover { color: var(--cyan); }
.gs-readout { display: flex; align-items: center; gap: .7rem; }
.gs-progress { display: block; width: 84px; height: 1px; background: rgba(234,238,245,.25); }
.gs-progress i { display: block; height: 100%; width: 0%; background: var(--cyan); }
body.on-light .gs-head { color: #05060A; text-shadow: 0 1px 18px rgba(255,255,255,.5); }
body.on-light .gs-progress { background: rgba(5,6,10,.3); }

/* ---------- Der Film ---------- */

.gs-film { position: relative; height: 420vh; }
.gs-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; background: var(--void); }
#film-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.gs-poster { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 1; transition: opacity .8s ease; }
.gs-poster.is-hidden { opacity: 0; }
.gs-stage-fade { position: absolute; inset: auto 0 0 0; height: 30vh; opacity: 0; background: linear-gradient(to bottom, transparent, var(--void)); }

.gs-beat { position: absolute; z-index: 3; left: 8vw; top: 50%; transform: translateY(-50%); max-width: 44rem; }
.gs-beat::before {
  content: ""; position: absolute; z-index: -1; inset: -70% -24% -70% -14%;
  background: radial-gradient(60% 58% at 24% 50%, rgba(5,6,10,.78), rgba(5,6,10,.4) 45%, transparent 78%);
}
.gs-beat h1 {
  font-family: "Anton", sans-serif; font-weight: 400;
  font-size: clamp(3rem, 11vw, 9rem); line-height: .88;
  margin: 0 0 1.2rem; letter-spacing: .01em; color: #fff;
  text-shadow: 0 2px 40px rgba(0,0,0,.5);
}
.gs-kicker { margin: 0 0 2rem; font-size: .8rem; letter-spacing: .3em; color: var(--cyan); }
.gs-cue { font-size: .72rem; letter-spacing: .2em; color: var(--dim); }
.gs-beat--mid { left: auto; right: 8vw; text-align: right; max-width: 30rem; }
.gs-beat--mid::before { inset: -70% -14% -70% -24%; background: radial-gradient(60% 58% at 76% 50%, rgba(5,6,10,.78), rgba(5,6,10,.4) 45%, transparent 78%); }
.gs-line { font-size: clamp(1.1rem, 2.4vw, 1.9rem); line-height: 1.4; margin: 0; }

/* ---------- Kapitel, gemeinsam ---------- */

.gs-ch { position: relative; min-height: min(96vh, 940px); display: flex; align-items: center; overflow: hidden; }
.gs-wrap { position: relative; z-index: 3; width: 100%; max-width: 1100px; margin: 0 auto; padding: 5rem 1.6rem; }
.gs-eyebrow { font-size: .72rem; letter-spacing: .3em; color: var(--cyan); margin: 0 0 1.4rem; }

/* Kapitel 1 — Die Zahl */
.gs-ch--number { background: var(--void); text-align: center; }
.gs-huge {
  font-family: "Anton", sans-serif;
  font-size: clamp(5rem, 24vw, 22rem); line-height: .82;
  color: #fff; letter-spacing: -.02em;
  text-shadow: 0 0 90px rgba(255,164,61,.28);
  font-variant-numeric: tabular-nums;
}
.gs-under { font-size: clamp(.9rem, 1.6vw, 1.2rem); color: var(--dim); margin: 1.6rem 0 0; }
.gs-under span { color: var(--amber); }

/* Kapitel 2 — Der Name.
   Der schwarze Block liegt über dem Canvas und wird per multiply gemischt:
   Schwarz bleibt schwarz und deckt ab, Weiß lässt den Film durch. Dadurch
   läuft der Film exakt in den Buchstaben. */
.gs-ch--type { background: #000; isolation: isolate; padding: 0; }
.gs-type-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.gs-ch--type::before {
  /* Rückfallebene, wenn kein Filmframe gezeichnet werden kann: animiertes Chrom */
  content: ""; position: absolute; inset: 0;
  background: conic-gradient(from 0deg, #0b0d14, #6a7488, #EAEEF5, #6a7488, #0b0d14, #2a3040, #EAEEF5, #0b0d14);
  animation: gs-spin 14s linear infinite;
}
/* WICHTIG: hier NICHT display:none verwenden. Das Canvas muss von Anfang an
   eine Größe haben, sonst ist clientWidth 0, es kann nichts gezeichnet werden,
   die Klasse gs-filmtext wird nie gesetzt — und das Canvas bliebe für immer
   versteckt. Ein klassischer Verklemmungsfehler. */
body:not(.gs-filmtext) .gs-type-canvas { opacity: 0; }
body.gs-filmtext .gs-type-canvas { opacity: 1; transition: opacity .5s ease; }
body.gs-filmtext .gs-ch--type::before { display: none; }
@keyframes gs-spin { to { transform: rotate(1turn) scale(1.6); } }

.gs-type-knock {
  position: absolute; inset: 0; z-index: 3;
  display: grid; place-items: center;
  background: #000; mix-blend-mode: multiply;
}
.gs-type-knock span {
  font-family: "Anton", sans-serif; color: #fff;
  font-size: clamp(4rem, 21vw, 20rem); line-height: 1; letter-spacing: .02em;
}

/* Kapitel 3 — Querlauf */
.gs-ch--run { background: var(--void); }
.gs-run-track { display: flex; gap: 2.4rem; align-items: center; padding: 0 8vw; width: max-content; }
.gs-plate {
  position: relative; flex: 0 0 auto;
  width: clamp(220px, 26vw, 380px); aspect-ratio: 3 / 4;
  border: 1px solid rgba(234,238,245,.14); border-radius: 6px;
  overflow: hidden; background: #0A0C12;
  display: flex; flex-direction: column; justify-content: flex-end; padding: 1.4rem;
  transform-style: preserve-3d; will-change: transform;
}
.gs-plate::before {
  content: ""; position: absolute; inset: 0; z-index: 0;
  background: radial-gradient(90% 70% at 50% 12%, var(--accent), transparent 70%);
  opacity: .34;
}
.gs-plate img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .5; }
.gs-plate-mono {
  position: absolute; left: 0; right: 0; top: 15%; z-index: 1; text-align: center;
  font-family: "Anton", sans-serif; font-size: clamp(3rem, 7vw, 5.6rem);
  color: var(--accent); opacity: .9; line-height: 1;
}
.gs-plate-body { position: relative; z-index: 2; }
.gs-plate h3 { margin: 0 0 .4rem; font-size: 1.05rem; font-weight: 600; }
.gs-plate p { margin: 0; font-size: .74rem; color: var(--dim); }
.gs-plate b { color: var(--accent); font-weight: 600; }

/* Kapitel 4 — Das Feld */
.gs-ch--field { background: var(--void); }
.gs-field-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.gs-field-text {
  font-family: "Anton", sans-serif; font-weight: 400;
  font-size: clamp(2rem, 6.5vw, 5.4rem); line-height: 1.02; margin: 0;
  max-width: 18ch; text-shadow: 0 2px 50px rgba(5,6,10,.9);
}

/* Kapitel 5 — Der Ticker */
.gs-ch--ticker { background: var(--void); flex-direction: column; justify-content: center; gap: 1.2rem; padding: 6rem 0; }
.gs-ticker-row { width: 100%; overflow: hidden; will-change: transform; }
.gs-ticker-inner { display: flex; width: max-content; gap: 3rem; }
.gs-ticker-inner span {
  font-family: "Anton", sans-serif; font-size: clamp(2rem, 6vw, 5rem);
  line-height: 1.1; color: transparent;
  -webkit-text-stroke: 1px rgba(234,238,245,.34);
  white-space: nowrap;
}
.gs-ticker-row--alt .gs-ticker-inner span { color: rgba(234,238,245,.1); -webkit-text-stroke: 0; }

/* Kapitel 6 — Das Portal */
.gs-ch--portal { background: var(--void); text-align: center; }
.gs-ch--portal::before {
  content: ""; position: absolute; inset: -40%;
  background: conic-gradient(from 0deg, transparent, rgba(34,224,214,.16), transparent 40%, rgba(255,164,61,.16), transparent 70%);
  animation: gs-spin 22s linear infinite;
}
.gs-portal {
  position: relative; display: inline-block; overflow: hidden;
  padding: 1.3rem 3rem; border-radius: 999px;
  font-size: 1rem; font-weight: 600; letter-spacing: .06em; color: var(--void);
  background: linear-gradient(90deg, var(--cyan), var(--amber));
  box-shadow: 0 0 60px rgba(34,224,214,.3);
  transition: box-shadow .25s ease; will-change: transform;
}
.gs-portal span { position: relative; z-index: 2; }
.gs-portal::after {
  content: ""; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,.75), transparent);
  transform: skewX(-18deg); transition: left .7s var(--ease);
}
.gs-portal:hover::after { left: 120%; }
.gs-portal:hover { box-shadow: 0 0 80px rgba(255,164,61,.45); }

.footer-name { color: var(--chrome); }
.footer-tag, .social-link { color: var(--dim); }
.social-link:hover { color: var(--cyan); border-color: var(--cyan); }

/* ---------- Ruhezustand ----------
   Greift bei prefers-reduced-motion und wenn GSAP fehlt (Klasse gs-still). */
@media (prefers-reduced-motion: reduce) {
  .gs-film { height: auto; }
  .gs-stage { position: relative; height: auto; min-height: 80vh; }
  .gs-beat { position: relative; left: auto; right: auto; top: auto; transform: none; padding: 4rem 8vw; max-width: none; text-align: left; }
  .gs-beat--mid { text-align: left; }
  #film-canvas, .gs-grain, .gs-field-canvas { display: none; }
  .gs-ch--type::before, .gs-ch--portal::before { animation: none; }
}
body.gs-still .gs-film { height: auto; }
body.gs-still .gs-stage { position: relative; height: auto; min-height: 80vh; }
body.gs-still .gs-beat { position: relative; left: auto; right: auto; top: auto; transform: none; opacity: 1 !important; visibility: visible !important; padding: 4rem 8vw; max-width: none; text-align: left; }
body.gs-still #film-canvas, body.gs-still .gs-field-canvas { display: none; }
body.gs-still .gs-run-track { flex-wrap: wrap; width: auto; justify-content: center; }
body.gs-still .gs-ticker-inner { flex-wrap: wrap; width: auto; justify-content: center; }
body.gs-still .gs-loader { display: none; }

@media (max-width: 760px) {
  .gs-beat { left: 6vw; right: 6vw; max-width: none; }
  .gs-beat--mid { text-align: left; }
  .gs-run-track { padding: 0 6vw; }
}
```

- [ ] **Step 4: `js/gaming-intro.js` schreiben (Boot und Datenrendering)**

```js
// js/gaming-intro.js
/**
 * GAMING SHOWPIECE — Boot
 * -----------------------------------------------------------
 * Rendert die Daten und entscheidet, ob die Seite animiert oder
 * im Ruhezustand läuft. Reihenfolge ist bindend: erst Film
 * (gepinnt), dann Kapitel — ScrollTrigger werden in der
 * Reihenfolge ihrer Erzeugung aktualisiert.
 */
(function () {
  "use strict";

  function monogram(title) {
    return title.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 3).toUpperCase();
  }

  function plateHtml(game) {
    var cover = game.cover
      ? '<img src="' + game.cover + '" alt="">'
      : '<div class="gs-plate-mono">' + monogram(game.title) + "</div>";
    return (
      '<article class="gs-plate" style="--accent:' + game.accent + '">' + cover +
      '<div class="gs-plate-body"><h3>' + game.title + "</h3>" +
      "<p><b>" + game.hours.toLocaleString("de-DE") + " h</b> · " + game.genre + "</p>" +
      "</div></article>"
    );
  }

  function renderData() {
    var stats = getAggregateStats(GAMES);
    var hours = document.getElementById("total-hours");
    var games = document.getElementById("total-games");
    if (hours) {
      hours.textContent = stats.totalHours.toLocaleString("de-DE");
      hours.setAttribute("data-target", String(stats.totalHours));
    }
    if (games) games.textContent = String(stats.count);

    var track = document.getElementById("run-track");
    if (track) track.innerHTML = getTopGames(GAMES, 8).map(plateHtml).join("");

    // Ticker: alle Titel, dreimal aufgeteilt, je Zeile verdoppelt,
    // damit das Band nahtlos umlaufen kann.
    var titles = GAMES.map(function (g) { return g.title; });
    for (var r = 1; r <= 3; r++) {
      var row = document.getElementById("ticker-" + r);
      if (!row) continue;
      var slice = titles.filter(function (_, i) { return i % 3 === r - 1; });
      if (!slice.length) slice = titles;
      var html = slice.map(function (t) { return "<span>" + t + "</span>"; }).join("");
      row.innerHTML = html + html;
    }
  }

  function librariesPresent() {
    return typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && typeof Lenis !== "undefined";
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderData();

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !librariesPresent()) {
      document.body.classList.add("gs-still");
      window.__ready = true;
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.GS_LENIS = lenis;

    // Reihenfolge-Gesetz: gepinnte Szenen zuerst, Ambientes danach.
    if (window.GS_FILM && window.GS_FILM.init) window.GS_FILM.init();
    if (window.GS_CHAPTERS && window.GS_CHAPTERS.init) window.GS_CHAPTERS.init();

    ScrollTrigger.refresh();
    window.__ready = true;
  });

  window.GS_BOOT = { renderData: renderData };
})();
```

- [ ] **Step 5: Server starten und Seite prüfen**

`mcp__Claude_Browser__preview_start` mit `{"name":"gaming-intro"}`, dann den Tab auf `http://localhost:8843/gaming-intro.html` navigieren. **Kein `file:///`.**

Screenshot und prüfen:
- Poster füllt den ersten Bildschirm, „JUSTIN PRIEM" und „scrollen" **ohne Scrollen** sichtbar
- Kapitel 1 zeigt die echte Stundenzahl; Kapitel 2 zeigt „GAMING" vor dem rotierenden Chromverlauf
- Kapitel 3 zeigt acht Platten; Kapitel 4 den Satz; Kapitel 5 drei Zeilen Spieltitel; Kapitel 6 den Button

- [ ] **Step 6: Netzwerk prüfen**

`mcp__Claude_Browser__read_network_requests` — `200`/`304` für `poster.jpg`, beide CSS, `gaming-data.js`, `gaming-intro-data.js`, `gaming-intro-frames.js`, `gaming-intro.js`. **Erwartete 404:** `gaming-intro-film.js`, `gaming-intro-chapters.js`. Jeder andere 404 ist ein Fehler.

- [ ] **Step 7: Zahlen gegenprüfen**

```bash
node -e "
const fs=require('fs');
eval(fs.readFileSync('js/gaming-data.js','utf8').replace('const GAMES','global.GAMES'));
console.log('Stunden:', GAMES.reduce((s,g)=>s+g.hours,0), '| Spiele:', GAMES.length);
console.log('Top 8:', GAMES.slice().sort((a,b)=>b.hours-a.hours).slice(0,8).map(g=>g.title).join(', '));
"
```
Muss exakt dem entsprechen, was die Seite zeigt.

- [ ] **Step 8: Commit**

```bash
git add gaming-intro.html css/gaming-intro.css js/gaming-intro.js
git commit -m "Seitengerüst und CSS neu aufbauen, ohne JS vollständig lesbar"
```

---

### Task 6: Scrub-Engine

**Files:**
- Create: `js/gaming-intro-film.js`

**Interfaces:**
- Consumes: `window.GS_FRAME_COUNT` (Task 4); `#film`, `#film-canvas`, `#poster`, `#loader`, `#loader-bar`, `.gs-beat`, `.gs-stage-fade` (Task 5).
- Produces: `window.GS_FILM.init()`; `window.GS_FILM.progress()` → 0–1; `window.GS_FILM.topLuma()` → 0–255 oder `null`; **`window.GS_FILM.paintTo(targetCtx, w, h, frameIndex)` → `true`, wenn gezeichnet wurde, sonst `false`.** Task 7 nutzt `paintTo` für den Film in der Schrift, Task 8 nutzt `progress` und `topLuma`.

- [ ] **Step 1: Engine schreiben**

```js
// js/gaming-intro-film.js
/**
 * GAMING SHOWPIECE — Scrub-Engine
 * -----------------------------------------------------------
 * Zeichnet eine WebP-Framesequenz auf ein Canvas, gesteuert vom
 * Scroll-Fortschritt. Kern gegen Ruckeln ist das
 * ImageBitmap-Schiebefenster: createImageBitmap dekodiert
 * außerhalb des Hauptthreads, sodass jedes Zeichnen ein reiner
 * GPU-Blit ist. drawImage auf ein HTMLImageElement würde
 * stattdessen eine synchrone Dekodierung im Hauptthread
 * erzwingen — genau das erzeugt das ruckelige Gefühl.
 */
(function () {
  "use strict";

  var DIR_LG = "assets/gaming-intro/frames/";
  var DIR_SM = "assets/gaming-intro/frames-sm/";
  var MQ_SM = "(max-width: 760px)";
  var FPS = 24;
  var AHEAD = Math.round(FPS * 2.0);
  var BEHIND = Math.round(FPS * 1.3);
  var MAX_CROP = 0.22;
  var PUMP = 10;
  var LERP = 0.14;
  var WARM = 40;

  var count = 0, dir = DIR_LG;
  var images = [], loaded = 0, queue = [], inFlight = 0;
  var bitmaps = new Map(), decoding = new Set(), bmpCenter = -9999;
  var canvas, ctx, film, poster, loaderEl, loaderBar, fadeEl, beats;
  var current = 0, target = 0, displayed = -1, lastLuma = null, started = false;

  function pad(n) { return ("0000" + n).slice(-4); }
  function frameUrl(i) { return dir + "f_" + pad(i + 1) + ".webp"; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---- Laden ---- */

  function pump() {
    while (inFlight < PUMP && queue.length) {
      var i = queue.shift();
      if (images[i]) continue;
      inFlight++;
      (function (idx) {
        var img = new Image();
        img.decoding = "async";
        img.onload = function () {
          images[idx] = img; loaded++; inFlight--;
          if (loaderBar) loaderBar.style.width = ((loaded / count) * 100).toFixed(1) + "%";
          if (loaded === WARM || loaded === count) reveal();
          if (loaded >= count && loaderEl) loaderEl.classList.add("is-done");
          pump();
        };
        img.onerror = function () { inFlight--; loaded++; pump(); };
        img.src = frameUrl(idx);
      })(i);
    }
  }

  function enqueueAll() {
    queue = [];
    var i;
    for (i = 0; i < Math.min(WARM, count); i++) queue.push(i);
    for (i = WARM; i < count; i++) queue.push(i);
    pump();
  }

  function reveal() {
    if (started) return;
    started = true;
    draw(Math.round(current), true);
    if (poster) poster.classList.add("is-hidden");
  }

  /* ---- Dekodier-Schiebefenster ---- */

  function ensureBitmaps(center) {
    if (Math.abs(center - bmpCenter) < 3) return;
    bmpCenter = center;
    var lo = Math.max(0, center - BEHIND), hi = Math.min(count - 1, center + AHEAD);
    for (var i = lo; i <= hi; i++) {
      if (bitmaps.has(i) || decoding.has(i) || !images[i]) continue;
      decoding.add(i);
      (function (idx) {
        createImageBitmap(images[idx]).then(function (b) {
          decoding.delete(idx);
          if (Math.abs(idx - bmpCenter) > AHEAD + BEHIND) { b.close(); return; }
          bitmaps.set(idx, b);
          if (idx === displayed) draw(idx, true);
        }).catch(function () { decoding.delete(idx); });
      })(i);
    }
    bitmaps.forEach(function (b, k) {
      if (k < center - BEHIND * 2 || k > center + AHEAD * 2) { b.close(); bitmaps.delete(k); }
    });
  }

  function nearest(idx) {
    for (var d = 0; d < count; d++) {
      if (bitmaps.has(idx - d)) return idx - d;
      if (bitmaps.has(idx + d)) return idx + d;
      if (images[idx - d]) return idx - d;
      if (images[idx + d]) return idx + d;
    }
    return -1;
  }

  function sourceAt(i) { return bitmaps.get(i) || images[i] || null; }

  /* ---- Zeichnen ---- */

  function fit(w, h, cw, ch) {
    var cover = Math.max(cw / w, ch / h);
    var crop = 1 - Math.min(cw / (w * cover), ch / (h * cover));
    // Bei starkem Beschnitt lieber Letterbox: ein 16:9-Bild in einem
    // Hochkant-Viewport behielte sonst nur die Mitte und verlöre die Komposition.
    var s = crop > MAX_CROP ? Math.min(cw / w, ch / h) : cover;
    return { w: w * s, h: h * s };
  }

  function draw(idx, force) {
    if (!ctx || !count) return;
    var use = bitmaps.has(idx) ? idx : nearest(idx);
    if (use < 0) return;
    if (!force && use === displayed) return;
    var src = sourceAt(use);
    if (!src) return;
    var w = src.width || src.naturalWidth, h = src.height || src.naturalHeight;
    if (!w || !h) return;
    var box = fit(w, h, canvas.width, canvas.height);
    ctx.fillStyle = "#05060A";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(src, (canvas.width - box.w) / 2, (canvas.height - box.h) / 2, box.w, box.h);
    displayed = use; lastLuma = null;
  }

  function resize() {
    if (!canvas) return;
    // DPR bewusst auf 1: Die Quelle ist 960 px breit; mehr Gerätepixel
    // vergrößern nur die Hochskalierung und machen das Bild weicher, nicht schärfer.
    canvas.width = Math.round(canvas.clientWidth);
    canvas.height = Math.round(canvas.clientHeight);
    draw(displayed >= 0 ? displayed : 0, true);
  }

  /* ---- Fortschritt und Takt ---- */

  function progress() {
    if (!film) return 0;
    var r = film.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    if (span <= 0) return 0;
    return clamp(-r.top / span, 0, 1);
  }

  function beatAlpha(b, p) {
    var i = parseFloat(b.getAttribute("data-in"));
    var pk = parseFloat(b.getAttribute("data-peak"));
    var o = parseFloat(b.getAttribute("data-out"));
    if (p < i || p > o) return 0;
    if (p < pk) return (p - i) / Math.max(1e-4, pk - i);
    return 1 - (p - pk) / Math.max(1e-4, o - pk);
  }

  function tick() {
    var p = progress();
    target = p * (count - 1);
    current += (target - current) * LERP;
    var idx = Math.round(current);
    ensureBitmaps(idx);
    draw(idx, false);

    for (var i = 0; i < beats.length; i++) {
      var a = beatAlpha(beats[i], p);
      beats[i].style.opacity = a;
      beats[i].style.transform = "translateY(" + (-50 + (1 - a) * 4) + "%)";
    }
    if (fadeEl) fadeEl.style.opacity = clamp((p - 0.9) / 0.1, 0, 1);

    requestAnimationFrame(tick);
  }

  /* ---- Öffentliche Schnittstelle ---- */

  function topLuma() {
    if (!ctx || displayed < 0) return null;
    if (lastLuma !== null) return lastLuma;
    try {
      var d = ctx.getImageData(0, 0, canvas.width, Math.max(1, Math.round(canvas.height * 0.12))).data;
      var sum = 0, n = 0;
      for (var i = 0; i < d.length; i += 4 * 64) {
        sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; n++;
      }
      lastLuma = n ? sum / n : null;
    } catch (e) { lastLuma = null; }
    return lastLuma;
  }

  // Zeichnet einen beliebigen Frame formatfüllend in ein fremdes Canvas.
  // Wird von Kapitel 2 genutzt, damit der Film in den Buchstaben läuft —
  // ohne eine einzige zusätzliche Datei.
  function paintTo(tctx, w, h, frameIndex) {
    if (!count || !tctx || !w || !h) return false;
    var i = ((frameIndex % count) + count) % count;
    var src = sourceAt(i);
    if (!src) { var f = nearest(i); if (f < 0) return false; src = sourceAt(f); }
    if (!src) return false;
    var sw = src.width || src.naturalWidth, sh = src.height || src.naturalHeight;
    if (!sw || !sh) return false;
    var s = Math.max(w / sw, h / sh);
    tctx.drawImage(src, (w - sw * s) / 2, (h - sh * s) / 2, sw * s, sh * s);
    return true;
  }

  function switchSet(useSmall) {
    var next = useSmall ? DIR_SM : DIR_LG;
    if (next === dir) return;
    dir = next;
    // Alte Bitmaps schließen — sonst leckt bei jedem Wechsel GPU-Speicher.
    bitmaps.forEach(function (b) { b.close(); });
    bitmaps.clear(); decoding.clear();
    bmpCenter = -9999; images = []; loaded = 0; displayed = -1;
    enqueueAll();
  }

  function init() {
    film = document.getElementById("film");
    canvas = document.getElementById("film-canvas");
    poster = document.getElementById("poster");
    loaderEl = document.getElementById("loader");
    loaderBar = document.getElementById("loader-bar");
    fadeEl = document.querySelector(".gs-stage-fade");
    beats = document.querySelectorAll(".gs-beat");
    if (!film || !canvas) return;

    count = window.GS_FRAME_COUNT || 0;
    if (!count) return;

    ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    var mq = window.matchMedia(MQ_SM);
    dir = mq.matches ? DIR_SM : DIR_LG;
    if (mq.addEventListener) mq.addEventListener("change", function (e) { switchSet(e.matches); });

    resize();
    window.addEventListener("resize", resize);
    enqueueAll();
    requestAnimationFrame(tick);
  }

  window.GS_FILM = { init: init, progress: progress, topLuma: topLuma, paintTo: paintTo };
})();
```

- [ ] **Step 2: Scrubben beweisen**

Über den Server laden, dann per `mcp__Claude_Browser__javascript_tool` die Canvas-Mitte an drei Scrollpositionen auslesen — **das ist der Beweis, dass der Film wirklich scrubbt und nicht bloß ein Standbild zeigt:**

```js
(function(){
  const c = document.getElementById('film-canvas');
  const x = c.getContext('2d');
  const film = document.getElementById('film');
  const span = film.getBoundingClientRect().height - innerHeight;
  const out = [];
  [0.15, 0.5, 0.85].forEach(f => {
    window.scrollTo(0, film.offsetTop + span * f);
    const d = x.getImageData(c.width>>1, c.height>>1, 1, 1).data;
    out.push(f + ': rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')');
  });
  return out.join(' | ');
})()
```
Erwartet: **drei deutlich verschiedene Farben.** Dreimal dieselbe Farbe heißt, der Film scrubbt nicht — dann nicht weitermachen, sondern Ursache suchen.

Hinweis: Das Skript scrollt sofort, die Engine lerpt aber. Zwischen den Läufen ~600 ms warten und den **zweiten** Lauf werten, sonst misst man den Nachlauf statt das Ziel.

- [ ] **Step 3: Ruckeln messen**

```js
(function(){
  window.__d = []; let last = performance.now();
  function f(t){ window.__d.push(t-last); last=t; if(window.__d.length<180) requestAnimationFrame(f); }
  requestAnimationFrame(f); return 'messe 3s';
})()
```
Währenddessen durch den Film scrollen, danach auslesen:
```js
(function(){
  const d = window.__d.slice().sort((a,b)=>a-b);
  return 'p95: ' + d[Math.floor(d.length*0.95)].toFixed(1) + 'ms | max: ' + d[d.length-1].toFixed(1) + 'ms';
})()
```
Ziel: **max unter 50 ms.** Bewertet wird p95/Maximum, nicht der Durchschnitt — ein 60-fps-Mittel verdeckt 80-ms-Aussetzer vollständig.

- [ ] **Step 4: Screenshots über den Film**

Bei 0 %, 25 %, 50 %, 75 %, 100 % des Filmabschnitts. Bei 0 % müssen Titel und „scrollen" sichtbar sein. Kein Screenshot darf ein leeres schwarzes Canvas zeigen.

- [ ] **Step 5: Commit**

```bash
git add js/gaming-intro-film.js
git commit -m "Scrub-Engine: Framesequenz auf Canvas mit ImageBitmap-Schiebefenster"
```

---

### Task 7: Kapitel-Choreografie

**Files:**
- Create: `js/gaming-intro-chapters.js`

**Interfaces:**
- Consumes: `window.GS_FILM.paintTo` (Task 6); `#total-hours` (mit `data-target`), `#type-canvas`, `#run-track`, `#ch-run`, `#field-canvas`, `#field-text`, `#ticker-1..3`, `#portal-btn`, `.gs-ch` (Task 5); `gsap`, `ScrollTrigger`.
- Produces: `window.GS_CHAPTERS.init()` — aufgerufen von `js/gaming-intro.js` **nach** `GS_FILM.init()`.

- [ ] **Step 1: Choreografie schreiben**

```js
// js/gaming-intro-chapters.js
/**
 * GAMING SHOWPIECE — Kapitel
 * -----------------------------------------------------------
 * Wird NACH der Film-Engine initialisiert. ScrollTrigger werden
 * in der Reihenfolge ihrer Erzeugung aktualisiert: entstünde ein
 * Trigger vor dem Pin-Spacer des Films, berechnete er seine
 * Position gegen ein Layout, das es noch nicht gibt.
 *
 * Auf dieser Seite gibt es genau ein Video (den Film). Jedes
 * Kapitel hier erzeugt seine Bewegung aus Code.
 */
(function () {
  "use strict";

  var GLYPHS = "0123456789#%&@*+=<>/\\";

  /* --- Kapitel 1: Zähler mit Scramble-Auflösung --- */
  function counter() {
    var el = document.getElementById("total-hours");
    if (!el) return;
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var full = target.toLocaleString("de-DE");
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, ease: "none",
      scrollTrigger: { trigger: "#ch-number", start: "top 80%", end: "center 55%", scrub: 0.6 },
      onUpdate: function () {
        // Ziffern rasten von links nach rechts ein; alles rechts davon flackert.
        var p = target ? obj.v / target : 1;
        var settled = Math.floor(p * full.length);
        var out = "";
        for (var i = 0; i < full.length; i++) {
          if (i < settled || full[i] === "." || full[i] === " ") out += full[i];
          else out += String(Math.floor(Math.random() * 10));
        }
        el.textContent = out;
      },
      onComplete: function () { el.textContent = full; }
    });
  }

  /* --- Kapitel 2: Der Film läuft in den Buchstaben --- */
  function filmInType() {
    var c = document.getElementById("type-canvas");
    if (!c || !window.GS_FILM || !window.GS_FILM.paintTo) return;
    var ctx = c.getContext("2d");
    if (!ctx) return;

    function resize() { c.width = c.clientWidth; c.height = c.clientHeight; }
    resize();
    window.addEventListener("resize", resize);

    var i = 0, last = 0, ok = false;
    function loop(t) {
      // ~12 Bilder/Sek. reichen: Die Schrift zeigt nur Ausschnitte, und ein
      // langsamerer Takt hält die Dekodierlast neben dem Film selbst klein.
      if (t - last > 80) {
        var drawn = window.GS_FILM.paintTo(ctx, c.width, c.height, i);
        if (drawn && !ok) { ok = true; document.body.classList.add("gs-filmtext"); }
        i += 2;
        last = t;
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* --- Kapitel 3: Querlauf --- */
  function horizontalRun() {
    var track = document.getElementById("run-track");
    var section = document.getElementById("ch-run");
    if (!track || !section || !track.children.length) return;

    var distance = function () { return track.scrollWidth - window.innerWidth; };
    if (distance() <= 0) return;

    var run = gsap.to(track, {
      x: function () { return -distance(); }, ease: "none",
      scrollTrigger: {
        trigger: section, start: "top top",
        end: function () { return "+=" + distance(); },
        pin: true, scrub: true, invalidateOnRefresh: true
      }
    });

    gsap.utils.toArray(".gs-plate").forEach(function (plate, i) {
      gsap.fromTo(plate, { y: i % 2 ? 40 : -40 }, {
        y: i % 2 ? -40 : 40, ease: "none",
        scrollTrigger: { trigger: plate, containerAnimation: run, start: "left right", end: "right left", scrub: true }
      });

      plate.addEventListener("mousemove", function (e) {
        var r = plate.getBoundingClientRect();
        gsap.to(plate, {
          rotateY: ((e.clientX - r.left) / r.width - 0.5) * 14,
          rotateX: ((e.clientY - r.top) / r.height - 0.5) * -14,
          duration: 0.4, ease: "power2.out", transformPerspective: 800
        });
      });
      plate.addEventListener("mouseleave", function () {
        gsap.to(plate, { rotateY: 0, rotateX: 0, duration: 0.7, ease: "power3.out" });
      });
    });

    // Scherung nach Scrollgeschwindigkeit: schneller Lauf kippt die Platten,
    // im Stillstand stehen sie wieder gerade.
    var skew = { v: 0 };
    ScrollTrigger.create({
      trigger: section, start: "top bottom", end: "bottom top",
      onUpdate: function (self) {
        var v = gsap.utils.clamp(-14, 14, self.getVelocity() / 260);
        if (Math.abs(v) > Math.abs(skew.v)) {
          skew.v = v;
          gsap.to(skew, {
            v: 0, duration: 0.7, ease: "power3", overwrite: true,
            onUpdate: function () { gsap.set(".gs-plate", { skewY: skew.v }); }
          });
        }
      }
    });
  }

  /* --- Kapitel 4: Partikelfeld --- */
  function field() {
    var c = document.getElementById("field-canvas");
    if (!c) return;
    var ctx = c.getContext("2d");
    if (!ctx) return;

    var pts = [], N = 90, LINK = 130;
    var mouse = { x: -9999, y: -9999 };
    var stretch = { v: 0 };
    var running = false;

    function resize() {
      c.width = c.clientWidth; c.height = c.clientHeight;
      pts = [];
      for (var i = 0; i < N; i++) {
        pts.push({
          x: Math.random() * c.width, y: Math.random() * c.height,
          vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28
        });
      }
    }
    resize();
    window.addEventListener("resize", resize);

    c.addEventListener("mousemove", function (e) {
      var r = c.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    c.addEventListener("mouseleave", function () { mouse.x = -9999; mouse.y = -9999; });

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, c.width, c.height);
      var i, j, a, b, dx, dy, d;

      for (i = 0; i < pts.length; i++) {
        a = pts[i];
        a.x += a.vx; a.y += a.vy * (1 + stretch.v);
        if (a.x < 0) a.x = c.width; if (a.x > c.width) a.x = 0;
        if (a.y < 0) a.y = c.height; if (a.y > c.height) a.y = 0;

        dx = a.x - mouse.x; dy = a.y - mouse.y; d = Math.hypot(dx, dy);
        if (d < 120 && d > 0.01) { a.x += (dx / d) * 1.6; a.y += (dy / d) * 1.6; }
      }

      ctx.strokeStyle = "rgba(34,224,214,.5)";
      for (i = 0; i < pts.length; i++) {
        a = pts[i];
        for (j = i + 1; j < pts.length; j++) {
          b = pts[j];
          dx = a.x - b.x; dy = a.y - b.y; d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.globalAlpha = (1 - d / LINK) * 0.34;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(234,238,245,.7)";
      for (i = 0; i < pts.length; i++) {
        ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, 1.4, 0, 6.284); ctx.fill();
      }
      requestAnimationFrame(frame);
    }

    function start() { if (running) return; running = true; requestAnimationFrame(frame); }
    function stop() { running = false; }

    // Nur rendern, solange die Sektion sichtbar ist — ein dauerhaft laufendes
    // Partikelfeld würde auch dann Rechenzeit fressen, wenn es niemand sieht.
    // onToggle statt onEnter/onLeave: Es deckt auch den Fall ab, dass die Seite
    // bereits mitten in dieser Sektion geladen wird, und die Sperre in start()
    // verhindert, dass mehrere rAF-Schleifen parallel laufen.
    ScrollTrigger.create({
      trigger: "#ch-field", start: "top bottom", end: "bottom top",
      onToggle: function (self) { if (self.isActive) start(); else stop(); },
      onUpdate: function (self) {
        var v = gsap.utils.clamp(0, 2.4, Math.abs(self.getVelocity()) / 900);
        if (v > stretch.v) {
          stretch.v = v;
          gsap.to(stretch, { v: 0, duration: 1, ease: "power2", overwrite: true });
        }
      }
    });
  }

  /* --- Kapitel 4: Text rastet aus Zufallszeichen ein --- */
  function scrambleText() {
    var el = document.getElementById("field-text");
    if (!el) return;
    var full = el.getAttribute("data-text") || el.textContent;
    var obj = { p: 0 };
    ScrollTrigger.create({
      trigger: "#ch-field", start: "top 65%", once: true,
      onEnter: function () {
        gsap.to(obj, {
          p: 1, duration: 1.5, ease: "power2.out",
          onUpdate: function () {
            var settled = Math.floor(obj.p * full.length);
            var out = "";
            for (var i = 0; i < full.length; i++) {
              if (i < settled || full[i] === " ") out += full[i];
              else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }
            el.textContent = out;
          },
          onComplete: function () { el.textContent = full; }
        });
      }
    });
  }

  /* --- Kapitel 5: Laufbänder --- */
  function tickers() {
    var rows = [
      { id: "ticker-1", dur: 26, dir: -1 },
      { id: "ticker-2", dur: 34, dir: 1 },
      { id: "ticker-3", dur: 30, dir: -1 }
    ];
    rows.forEach(function (r) {
      var el = document.getElementById(r.id);
      if (!el || !el.children.length) return;
      // Der Inhalt liegt doppelt vor; eine Verschiebung um -50 % läuft
      // deshalb exakt auf den Anfang zurück und wirkt endlos.
      gsap.set(el, { xPercent: r.dir < 0 ? 0 : -50 });
      gsap.to(el, {
        xPercent: r.dir < 0 ? -50 : 0,
        duration: r.dur, ease: "none", repeat: -1
      });
    });

    var skew = { v: 0 };
    ScrollTrigger.create({
      trigger: "#ch-ticker", start: "top bottom", end: "bottom top",
      onUpdate: function (self) {
        var v = gsap.utils.clamp(-9, 9, self.getVelocity() / 320);
        if (Math.abs(v) > Math.abs(skew.v)) {
          skew.v = v;
          gsap.to(skew, {
            v: 0, duration: 0.8, ease: "power3", overwrite: true,
            onUpdate: function () { gsap.set(".gs-ticker-row", { skewY: skew.v }); }
          });
        }
      }
    });
  }

  /* --- Einblendungen und magnetischer Button --- */
  function arrivals() {
    gsap.utils.toArray(".gs-ch").forEach(function (sec) {
      var kids = sec.querySelectorAll(".gs-wrap > *");
      if (!kids.length) return;
      gsap.from(kids, {
        opacity: 0, y: 26, duration: 0.9, stagger: 0.09, ease: "power3.out",
        scrollTrigger: { trigger: sec, start: "top 78%", once: true }
      });
    });
  }

  function magneticPortal() {
    var btn = document.getElementById("portal-btn");
    if (!btn || window.matchMedia("(hover: none)").matches) return;
    var area = btn.parentElement;
    area.addEventListener("mousemove", function (e) {
      var r = btn.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < 260) gsap.to(btn, { x: dx * 0.28, y: dy * 0.28, duration: 0.5, ease: "power3.out" });
      else gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.4)" });
    });
    area.addEventListener("mouseleave", function () {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.4)" });
    });
  }

  function init() {
    horizontalRun();   // gepinnt: zuerst
    counter();
    filmInType();
    field();
    scrambleText();
    tickers();
    arrivals();
    magneticPortal();
  }

  window.GS_CHAPTERS = { init: init };
})();
```

- [ ] **Step 2: Jedes Kapitel einzeln prüfen**

Über den Server laden, langsam durchscrollen, an jedem Kapitel einen Screenshot:
- **Bilanz:** Ziffern flackern und rasten von links nach rechts ein, Endwert exakt der aus `gaming-data.js`
- **GAMING:** der **Film** läuft sichtbar innerhalb der Buchstaben (nicht der CSS-Chromverlauf). Prüfen mit `document.body.classList.contains('gs-filmtext')` → muss `true` sein
- **Archiv:** Sektion friert ein, Platten wandern seitwärts, kippen in 3D beim Überfahren, scheren beim schnellen Scrollen
- **Signal:** Punkte driften und sind durch Linien verbunden, weichen dem Mauszeiger aus; der Satz rastet aus Zufallszeichen ein
- **Bestand:** drei Laufbänder in unterschiedlicher Richtung und Geschwindigkeit, scheren beim Scrollen
- **Portal:** Button folgt dem Mauszeiger, Lichtstreif bei Hover, Verlauf rotiert

- [ ] **Step 3: Konsole prüfen**

`mcp__Claude_Browser__read_console_messages` mit `onlyErrors: true`. Erwartet: keine Fehler. Ein `favicon`-404 ist bekannt und unkritisch.

- [ ] **Step 4: Commit**

```bash
git add js/gaming-intro-chapters.js
git commit -m "Kapitel aus Code: Zähler, Film-in-Schrift, Querlauf, Partikelfeld, Laufbänder, Portal"
```

---

### Task 8: Dauerhafte Ebenen

**Files:**
- Modify: `js/gaming-intro.js`

**Interfaces:**
- Consumes: `window.GS_FILM.progress()` und `window.GS_FILM.topLuma()` (Task 6); `#cursor`, `#chapter-name`, `#chapter-bar`, `.gs-ch[data-chapter]` (Task 5).

- [ ] **Step 1: Ebenen ergänzen**

In `js/gaming-intro.js` **vor** der Zeile `window.GS_BOOT = ...` einfügen:

```js
  /* ---- Mauszeiger ---- */
  function initCursor() {
    var el = document.getElementById("cursor");
    if (!el || window.matchMedia("(hover: none)").matches) return;
    // Erst bei der ersten echten Mausbewegung einblenden — sonst klebt der
    // Ring bei jedem Screenshot in der linken oberen Ecke im Bild.
    var live = false;
    window.addEventListener("mousemove", function (e) {
      if (!live) { live = true; el.classList.add("is-live"); }
      el.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
    });
    document.addEventListener("mouseover", function (e) {
      var hot = e.target.closest && e.target.closest("a, button");
      el.classList.toggle("is-hot", !!hot);
    });
  }

  /* ---- Kapitelanzeige und Fortschritt ---- */
  function initReadout() {
    var nameEl = document.getElementById("chapter-name");
    var barEl = document.getElementById("chapter-bar");
    var sections = Array.prototype.slice.call(document.querySelectorAll(".gs-ch[data-chapter]"));
    if (!nameEl || !barEl) return;

    function frame() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      barEl.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0).toFixed(1) + "%";

      var name = "CHROME";
      if (window.GS_FILM) {
        var p = window.GS_FILM.progress();
        if (p > 0.66) name = "KERN";
        else if (p > 0.33) name = "KORRIDOR";
      }
      for (var i = 0; i < sections.length; i++) {
        var r = sections[i].getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.5 && r.bottom >= window.innerHeight * 0.5) {
          name = sections[i].getAttribute("data-chapter");
          break;
        }
      }
      if (nameEl.textContent !== name) nameEl.textContent = name;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---- Kopfzeile über wechselndem Bild ---- */
  function initAdaptiveHead() {
    setInterval(function () {
      if (!window.GS_FILM) return;
      var l = window.GS_FILM.topLuma();
      if (l === null) return;
      document.body.classList.toggle("on-light", l > 138);
    }, 180);
  }
```

Und im `DOMContentLoaded`-Block **nach** `ScrollTrigger.refresh();` ergänzen:

```js
    initCursor();
    initReadout();
    initAdaptiveHead();
```

- [ ] **Step 2: Prüfen**

Über den Server laden:
- Screenshot **ohne** vorherige Mausbewegung: der Cursor-Ring darf **nicht** sichtbar sein
- Maus bewegen, über den Portal-Button fahren: Ring wird größer
- Beim Scrollen: Fortschrittslinie füllt sich, Kapitelname wechselt CHROME → KORRIDOR → KERN → BILANZ → GAMING → ARCHIV → SIGNAL → BESTAND → PORTAL
- Über hellen Filmstellen: Kopfzeile kippt auf dunkle Schrift

- [ ] **Step 3: Commit**

```bash
git add js/gaming-intro.js
git commit -m "Dauerhafte Ebenen: Mauszeiger, Kapitelanzeige, adaptive Kopfzeile"
```

---

### Task 9: Schlussprüfung und Freigabe (STOP-Punkt)

**Files:** keine Änderungen — reine Verifikation.

- [ ] **Step 1: Upstream prüfen**

```bash
git fetch origin && git log HEAD..origin/main --oneline
```
Bei neuen Commits `git pull origin main` und die Zahlen erneut gegenprüfen — der Admin-Bereich könnte während des Baus Spiele hinzugefügt haben.

- [ ] **Step 2: Gewicht messen**

```bash
du -sh assets/gaming-intro/frames assets/gaming-intro/frames-sm
ls -la assets/gaming-intro/poster.jpg
find assets/gaming-intro -name "*.mp4" | wc -l
du -sh assets/
```
Erwartet: Desktop-Frames ≤ 6 MB, Mobile ≤ 2 MB, **null MP4-Dateien** (die Seite hat genau ein Video, und das liegt als Framesequenz vor), `assets/` gesamt ≤ 13 MB. Überschreitung → melden, nicht stillschweigend akzeptieren.

- [ ] **Step 3: Desktop-Durchgang**

Server starten, Desktop-Größe, `http://localhost:8843/gaming-intro.html`. Screenshots bei 0 %, 15 %, 30 %, 45 %, 60 %, 75 %, 90 %, 100 % des Gesamt-Scrollwegs. Bei 0 % müssen Titel und „scrollen" **ohne jedes Scrollen** sichtbar sein.

- [ ] **Step 4: Netzwerk prüfen**

`mcp__Claude_Browser__read_network_requests`: **kein einziger 404** außer ggf. `favicon.ico`. Insbesondere `gaming-intro-film.js` und `gaming-intro-chapters.js` müssen jetzt `200` liefern.

- [ ] **Step 5: Scrubben beweisen**

Das `getImageData`-Skript aus Task 6 Step 2 erneut ausführen. Erwartet: drei deutlich verschiedene Farben.

- [ ] **Step 6: Effekt-Inventar abhaken**

Jeden Punkt tatsächlich am Bildschirm bestätigen, nicht aus dem Code erschließen:
Scroll-Scrubbing · Beat-Einblendungen · Hochzähler · Scramble bei Ziffern **und** Buchstaben · Film-in-Schrift (`document.body.classList.contains('gs-filmtext')` muss `true` sein) · gepinnter Querlauf · Parallax in Ebenen · Scherung nach Scrollgeschwindigkeit · 3D-Kippung bei Hover · Partikelfeld mit Verbindungslinien · Mauszeiger-Abstoßung · drei Laufbänder · magnetischer Button · Lichtstreif · rotierender Verlauf · Filmkorn · Vignette · eigener Mauszeiger · Fortschrittslinie · umschlagende Kopfzeilenfarbe.

- [ ] **Step 7: Ruckeln messen**

Das Messskript aus Task 6 Step 3, einmal über den Film und einmal über das Partikelfeld. Ziel: max < 50 ms an beiden Stellen. Das Partikelfeld ist der zweite Kandidat für Aussetzer, weil es pro Bild rund 4.000 Punktpaare prüft.

- [ ] **Step 8: Mobil-Durchgang**

`mcp__Claude_Browser__resize_window` auf `375×812`, Seite **neu laden** (damit die Mobile-Weiche beim Start greift), durchscrollen, screenshotten.

```js
JSON.stringify({ bodyScrollWidth: document.body.scrollWidth, innerWidth: window.innerWidth })
```
Beide Werte müssen gleich sein — sonst läuft die Seite seitlich über.

- [ ] **Step 9: Ruhezustand tatsächlich auslösen**

Beides wirklich testen, nicht aus dem Code erschließen:
1. Reduced Motion in den Entwicklerwerkzeugen erzwingen, neu laden → keine Pins, alles sichtbar und lesbar, CTA erreichbar.
2. Die drei CDN-`<script>`-Zeilen in `gaming-intro.html` **vorübergehend** auskommentieren, neu laden → `body` trägt `gs-still`, alle Inhalte sichtbar, keine Konsolenfehler. **Danach wieder einkommentieren** und mit `git diff gaming-intro.html` bestätigen, dass die Datei unverändert ist.

- [ ] **Step 10: Zahlen gegenprüfen**

```bash
node -e "
const fs=require('fs');
eval(fs.readFileSync('js/gaming-data.js','utf8').replace('const GAMES','global.GAMES'));
console.log('Stunden:', GAMES.reduce((s,g)=>s+g.hours,0), '| Spiele:', GAMES.length);
console.log('Top 8:', GAMES.slice().sort((a,b)=>b.hours-a.hours).slice(0,8).map(g=>g.title).join(', '));
"
```
Muss exakt dem entsprechen, was Kapitel 1, 3 und 5 anzeigen.

- [ ] **Step 11: Tests laufen lassen**

```bash
node --test js/gaming-intro-data.test.js
```
Erwartet: 4/4 grün.

- [ ] **Step 12: Credits berichten**

`account_balance`. Tatsächlichen Gesamtverbrauch gegen die geplanten ~10.200 stellen.

- [ ] **Step 13: STOP — dem Nutzer vorlegen**

Screenshots (Desktop und Mobil) und die Messwerte zusammenstellen und dem Nutzer präsentieren. **`git push` ist an dieser Stelle verboten.** Ausdrücklich fragen, ob live gehen darf.

Erst nach einem klaren Ja:

```bash
git push
```
