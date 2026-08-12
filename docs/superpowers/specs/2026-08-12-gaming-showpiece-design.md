# Gaming Showpiece — Design

## Context

Ein erster Versuch einer filmischen Gaming-Landingpage (`gaming-intro.html`, Spec
`2026-08-12-gaming-deep-dive-landing-design.md`) wurde gebaut und vom Nutzer
verworfen: das Ergebnis war faktisch eine Diashow aus vier Standbildern mit
dezentem Zoom — kein Scroll-Film. Der Nutzer will stattdessen eine moderne,
hochwertige Seite, dicht gepackt mit Animationen und echtem generierten Video,
bei der das Scrollen selbst das Erlebnis ist. Ausdrücklich: **mehr Show als
Inhalt.** Das Konzept durfte neu gedacht werden.

Zwei Fähigkeiten machen das jetzt möglich, die beim ersten Versuch nicht genutzt
wurden:

- **Seedance 2.0 Pro** (`bytedance-seedance-pro-2.0`) über den Magnific-Connector:
  Bild-zu-Video mit **Pinning an beiden Enden** (`keyframes.start` *und*
  `keyframes.end`), 52 benannte Kamerafahrten, 4–15 Sek. pro Clip. Das ist die
  Voraussetzung für sauber verkettete Clips (siehe `scroll-film-studio`
  `references/playbook.md` §2).
- **ffmpeg** über `pip install imageio-ffmpeg` — eine portable Binary im
  Python-site-packages-Verzeichnis, **ohne Systeminstallation und ohne
  PATH-Änderung**. Damit ist Frame-Extraktion und damit Canvas-Scrubbing möglich.

Vom Nutzer in der Konzeptphase entschieden: Kino-Opening plus dichte Kapitel ·
Bildwelt als Reise durch alle drei Stilproben (Chrome → Korridor → Kern) ·
**kein Ton** · Umfang ~15 Sek. Film plus 2 Kapitel-Videos.

## Der Film

Der scroll-gescrubbte Hero-Film trägt die ersten ~40 % des Scrollwegs.

**Der eine Vektor (verbindlich für alle Clips): Die Kamera fährt ausschließlich
vorwärts und tiefer hinein. Niemals zurück, niemals seitlich heraus.** Jeder
Clip-Prompt muss diese Bewegung fortsetzen, nicht nur seinen Inhalt beschreiben
(playbook §2b: der Prompt beschreibt die *Reise* vom Start-Pin zum End-Pin, nie
den Zustand eines Endes).

| Akt | Inhalt | Kamera | Dauer |
|---|---|---|---|
| 1 — CHROME | Schwarzer Void, kolossale Masse flüssigen Chroms wälzt sich; die Kamera schiebt darauf zu, das Chrom öffnet sich blendenartig | `superDollyIn` | 5 s |
| 2 — KORRIDOR | Dieselbe Vorwärtsbewegung, jetzt innerhalb: aus der Blende ist ein regennasser Neon-Korridor geworden, Neonstreifen rasen vorbei | `pushIn` | 5 s |
| 3 — KERN | Der Korridor öffnet sich ins Weite, das Glühen am Ende wird zum geschmolzenen Plasmakern, die Kamera schiebt darauf zu | `pushIn` | 5 s |

Farb- und Temperaturbogen: kalt/monochrom → elektrisch/neon → heiß/glühend.
Raumbogen: geschlossen → gerichtet → weit.

### Das Schwellenbild (die riskanteste Stelle)

Der Übergang Akt 1 → Akt 2 ändert Material *und* Raum gleichzeitig — genau die
Konstellation, bei der ein i2v-Modell laut playbook mitten im Clip schneidet
statt zu reisen. Gegenmaßnahme: **Keyframe 2 wird gezielt als Schwellenbild
generiert, das beide Welten bereits enthält** — Chromwände, die sich zu einem
Korridor-Maul formen. Damit muss kein Clip die Verwandlung erfinden; Akt 1 fährt
auf das Schwellenbild zu, Akt 2 fährt von ihm weg.

### Keyframes und Verkettung

Vier Keyframes (Seedream 5 Pro, 2k, 16:9):

- **KF1** — Chrom-Masse im schwarzen Void (Eröffnung; Stil bereits validiert durch
  die Stilprobe `A-chrome`)
- **KF2** — Schwellenbild: Chrom formt ein Korridor-Maul
- **KF3** — Korridor-Ende, Glühen baut sich auf (Stil validiert durch `B-neon`)
- **KF4** — Plasmakern füllt das Bild (Stil validiert durch `C-plasma`)

Verkettung nach playbook §2 — **Clip N startet auf dem per ffmpeg extrahierten
echten letzten Frame von Clip N−1, nicht auf dem Keyframe:**

| Clip | `keyframes.start` | `keyframes.end` |
|---|---|---|
| 1 | KF1 | KF2 |
| 2 | letzter Frame Clip 1 (hochgeladen) | KF3 |
| 3 | letzter Frame Clip 2 (hochgeladen) | KF4 |

Die Extraktion erzeugt eine lokale PNG-Datei; Magnific braucht eine
Creation-Referenz, deshalb wird jeder extrahierte Frame vor Verwendung über
`creations_upload_image` hochgeladen. Die Kette ist damit **zwingend sequenziell**
— Clip N muss fertig gerendert sein, bevor Clip N+1 startet. Clips niemals
parallel generieren.

### Ausgabeformat

16:9, 1080p, Seedance 2.0 Pro. Ton aus (`withSoundEffects: false`) — die Seite
ist stumm, und Audio würde die Kosten vervielfachen ohne jeden Nutzen.

## Die Kapitel

Nach dem Film, jedes Kapitel mit einem eigenen visuellen Prinzip; kein Prinzip
wiederholt sich.

1. **DIE ZAHL** — Die Gesamtstundenzahl aus `GAMES` füllt bildschirmfüllend das
   Bild und zählt beim Scrollen hoch. Der letzte Filmframe (Kern) steht als
   langsam driftendes Standbild dahinter. Darunter klein: Anzahl der Spiele.
2. **SCHRIFT MIT VIDEO DARIN** — Das Wort `GAMING` in maximaler Größe; innerhalb
   der Buchstabenformen läuft Kapitel-Video 1. Umsetzung über
   `background-clip: text` mit dem Video als Hintergrundebene (Fallback: SVG-Maske).
3. **QUERLAUF** — Die Sektion wird gepinnt und horizontal durchgescrollt. Die
   **acht** Spiele mit den meisten Stunden fliegen als große Platten mit
   Cover-Art vorbei, Ebenen mit unterschiedlicher Geschwindigkeit
   (`containerAnimation`-Parallax), Neigung abhängig von der
   Scroll-Geschwindigkeit (`ScrollTrigger.getVelocity()`, geklammert). Acht ist
   genug für einen Lauf, der Tempo aufbaut, ohne dass die Sektion zur Liste wird;
   hat `GAMES` weniger Einträge, werden entsprechend weniger Platten gerendert.
4. **DIE VERZERRUNG** — Kapitel-Video 2 mit scroll-abhängiger Verzerrung:
   Farbkanal-Spreizung und Versatz, die mit der Scroll-Geschwindigkeit wachsen
   und im Stillstand auf null zurückgehen. Umsetzung als WebGL-Displacement-Shader;
   **verbindlicher Fallback**, wenn kein WebGL-Kontext verfügbar ist: dieselbe
   Sektion mit CSS-`filter`-Verschiebung statt Shader.
5. **DAS PORTAL** — Der Kern kehrt als pulsierender Hintergrund zurück. Davor der
   CTA ins vollständige Archiv (`gaming.html`): Lichtstreif wandert bei Hover
   darüber, der Button zieht den Mauszeiger magnetisch an. Dies muss das
   selbstbewussteste Element der Seite sein (`finishing.md` §3).

### Kapitel-Videos

Zwei Clips, je 4 Sek., 720p, Seedance 2.0 Pro, als `<video autoplay loop muted
playsinline>` eingebunden — **nicht** gescrubbt, deshalb kleine Dateien und keine
Frame-Extraktion nötig.

- **Video 1** (für Kapitel 2, läuft in der Schrift): Nahaufnahme fließenden
  Chroms, hoher Kontrast, deutliche Bewegung — durch Buchstabenformen muss auf
  kleiner Fläche sofort Bewegung lesbar sein.
- **Video 2** (für Kapitel 4, wird verzerrt): Plasma-/Energieoberfläche, gleichmäßig
  gefüllt, ohne dominantes Einzelmotiv.

**Nahtlose Schleife:** Beide Clips werden mit `keyframes.start` *und*
`keyframes.end` auf **dasselbe Bild** gepinnt. Der Clip kehrt damit
konstruktionsbedingt zu seinem Anfang zurück und läuft ohne sichtbaren Sprung in
der Schleife.

## Dauerhafte Ebenen

Über der gesamten Seite, unabhängig vom Kapitel:

- Eigener Mauszeiger: kleiner Ring, der über klickbaren Elementen aufgeht.
  **Bis zur ersten echten Mausbewegung ausgeblendet**, sonst steht er bei
  Screenshots auf (0,0) im Bild (`engine.md`, Dev-Contract).
- Filmkorn und Vignette als Overlay.
- Dünne Fortschrittslinie mit Kapitelnamen.
- Kopfzeile mit adaptiver Farbe: Luminanz des oberen Bildstreifens wird alle
  ~180 ms in ein 16×4-Offscreen-Canvas gesampelt; überschreitet sie den
  Schwellwert, schaltet eine Klasse alle Chrome-Farben um (`engine.md`).
- Lenis-Trägheitsscrollen, in den GSAP-Ticker eingehängt.

## Architektur

```
gaming-intro.html            komplett neu geschrieben (ersetzt die alte Fassung)
css/gaming-intro.css         komplett neu
js/gaming-intro-data.js      getTopGames / getAggregateStats (aus dem alten Build übernommen)
js/gaming-intro-film.js      Canvas-Scrub-Engine
js/gaming-intro-chapters.js  Kapitel-Choreografie
js/gaming-intro.js           Boot: Datenrendering, Reduced-Motion-Weiche, Reihenfolge
assets/gaming-intro/frames/      Desktop-Framesatz
assets/gaming-intro/frames-sm/   Mobile-Framesatz
assets/gaming-intro/chapter-1.mp4, chapter-2.mp4
assets/gaming-intro/poster.jpg   erster Filmframe, für sofortiges Bild und als Fallback
```

Vier JS-Dateien mit je einer klaren Aufgabe statt einer großen — die
Scrub-Engine und die Kapitel-Choreografie sind unabhängig voneinander verständlich
und einzeln testbar.

**Nicht angefasst:** `gaming.html`, `css/gaming.css`, `js/gaming.js`,
`js/gaming-data.js`, der gesamte `admin/`-Bereich. Die vier Void-Bilder des alten
Builds (`assets/gaming-intro/surface.jpg`, `depth-1-cyan.jpg`,
`depth-2-magenta.jpg`, `depth-3-violet.jpg`) werden gelöscht — die Bildwelt ist
eine andere.

## Datenfluss

`js/gaming-data.js` wird wie bisher **nur lesend** eingebunden. Aus `GAMES`
werden zur Laufzeit berechnet:

- Gesamtstunden und Anzahl der Spiele → Kapitel 1
- Top-Spiele nach `hours` absteigend → Kapitel 3 (Querlauf)

Damit zieht die Seite automatisch nach, wenn im Admin-Bereich Spiele hinzukommen
oder sich ändern. Kein Spielname und kein Stundenwert wird irgendwo fest
verdrahtet.

Die beiden Funktionen `getTopGames(games, n)` und `getAggregateStats(games)`
werden **unverändert im Verhalten** aus dem alten Build übernommen: Sie ziehen von
`js/gaming-intro.js` nach `js/gaming-intro-data.js` um, die zugehörige Testdatei
zieht von `js/gaming-intro.test.js` nach `js/gaming-intro-data.test.js` um und
importiert das neue Modul. Die Testfälle selbst bleiben inhaltlich unverändert und
müssen nach dem Umzug unverändert grün laufen — sie sind der Beweis, dass beim
Umbau nichts verlorengegangen ist.

## Asset-Pipeline

1. Vier Keyframes generieren (Seedream 5 Pro, 2k, 16:9).
2. **Probelauf:** Clip 1 und Clip 2 in 720p mit Seedance 2.0 Mini erzeugen und die
   Nahtstelle prüfen — hält das Modell den Start-Pin? Erst wenn ja, wird gemastert
   (playbook §2b: die Verkettung auf der *ersten* Nahtstelle verifizieren, bevor
   das Budget des ganzen Films darauf gesetzt wird).
3. Master: drei Clips sequenziell in 1080p, jeweils mit dem extrahierten letzten
   Frame des Vorgängers als Start-Pin.
4. Zusammenfügen zu `master.mp4`.
5. **Kopf beschneiden:** Die ersten ~2 Sek. Frame für Frame ansehen und so weit
   kürzen, bis der erste Frame bereits *innerhalb* der Bewegung liegt
   (`finishing.md` §1 — generierte Filme öffnen sehr häufig auf einem noch
   stehenden Bild, was wie ein Schnitt in den eigenen Film wirkt). Danach die
   Framezahl im Code auf den beschnittenen Wert setzen.
6. Frames extrahieren, **bei nativen 24 fps, ohne jede Dezimierung.**

### Payload-Budget (verbindlich)

| Satz | Breite | Qualität | Frames | Ziel |
|---|---|---|---|---|
| Desktop | 1280 px | `-q:v 6` | alle (~360) | ≤ 20 MB |
| Mobile | 640 px | `-q:v 7` | alle (~360) | ≤ 8 MB |

**Wird ein Budget überschritten, wird die Breite reduziert — niemals die
Framezahl.** Zeitliche Glätte ist auf einem bewegten Bild deutlich sichtbarer als
Schärfe im Einzelbild (`engine.md`, „Frame payload"). Der Mobile-Satz behält
deshalb die volle Framezahl bei kleinerer Auflösung, statt jeden zweiten Frame
wegzuwerfen — ein halbierter Framesatz halbiert die Scrub-Bildrate und ist der
schnellste Weg, einen sauber gedrehten Film billig aussehen zu lassen.

**Bewusst in Kauf genommen:** Damit liegen rund 720 Einzelbilder (~28 MB) dauerhaft
im Repository. Bei GitHub Pages führt daran kein Weg vorbei — ausgeliefert wird,
was im Repo liegt. Das Repository wächst dadurch von derzeit ~5 MB auf ~35 MB, und
da Git-Historie nichts vergisst, bleibt eine später ersetzte Framesequenz für immer
im Verlauf. Deshalb wird der Framesatz **erst nach dem Kopfbeschnitt und erst nach
bestandener Sichtprüfung des Films** committet, nicht schon als Zwischenstand.

## Scrub-Engine

Nach `engine.md` §Scrub-engine:

- Hoher Scroll-Treiber mit `position: sticky`-Bühne und Vollbild-`<canvas>`;
  Fortschritt aus `getBoundingClientRect()`.
- **Gelerpter Playhead** (`current += (target - current) * 0.14`) — direkte
  Zuordnung fühlt sich mechanisch an.
- **ImageBitmap-Schiebefenster** als Kern gegen Ruckeln: `createImageBitmap`
  dekodiert außerhalb des Hauptthreads, ein Fenster dekodierter Bitmaps wandert
  mit dem Playhead mit, ältere werden geschlossen. `drawImage` auf ein
  `HTMLImageElement` erzwingt dagegen eine synchrone JPEG-Dekodierung im
  Hauptthread — genau das erzeugt das ruckelige Gefühl.
- Fenstergröße **in Sekunden Film** bemessen, nicht in Frames: ~2 s voraus, ~1,3 s
  zurück.
- Ladepumpe mit begrenzter Parallelität (~10 gleichzeitig), Ladebalken,
  `nearestFrame()`-Rückfall, damit ein fehlender Frame das Canvas nie leert.
- **Nicht blind `cover`:** Überschreitet der Beschnitt 22 %, wird auf `contain`
  umgeschaltet und mit Letterbox gezeichnet. Ein 16:9-Film in einem
  Hochkant-Viewport behielte sonst nur die mittleren ~26 % jedes Frames.
- DPR auf 1.0 begrenzt und die Canvas-Breite an der Quellbreite orientiert;
  ein 1280-px-Frame in ein 2268-px-Canvas gezeichnet wirkt pixelig, und mehr
  Gerätepixel machen es schlimmer, nicht besser.
- Umschaltung Desktop/Mobile über `matchMedia`; beim Wechsel **werden die alten
  ImageBitmaps geschlossen**, sonst leckt bei jeder Drehung GPU-Speicher
  (`finishing.md` §5).

### Reihenfolge-Gesetz

ScrollTrigger werden in Erstellungsreihenfolge aktualisiert. **Alle gepinnten
Szenen müssen vor allen Hintergrund-/Ambient-Triggern erzeugt werden** — sonst
werden Positionen berechnet, bevor die Pin-Spacer existieren, und alles danach
sitzt still und falsch (`engine.md`, „Ordering law").

## Randfälle und Rückfallebenen

- **`prefers-reduced-motion: reduce`** — kein Pinning, kein Scrub, keine
  Verzerrung. Das Poster-Standbild steht, alle Kapitel liegen im normalen
  Dokumentfluss, sämtliche Inhalte und der CTA sind sichtbar und erreichbar.
- **GSAP/Lenis laden nicht** (CDN blockiert oder offline) — dieselbe statische
  Fassung wie bei Reduced Motion. Geprüft wird auf das tatsächliche Vorhandensein
  der Globals, nicht auf ein Ladeereignis.
- **Kein WebGL** — Kapitel 4 nutzt die CSS-Filter-Variante.
- **Frames laden langsam** — Poster-Standbild steht sofort, Ladebalken zeigt den
  Fortschritt, die Seite wartet nie auf den vollständigen Satz.
- **`GAMES` hat weniger Einträge als erwartet** — Kapitel 3 rendert so viele
  Platten wie vorhanden; keine leeren Platzhalter. Die Logik darf nicht auf eine
  feste Anzahl angewiesen sein.

## Verifikation

Die Seite wird **ausschließlich über einen echten lokalen HTTP-Server** geprüft.
Ein `file:///`-Aufruf einer Datei unterhalb von `.claude/worktrees/` rendert im
Browser-Pane als totes Standbild ohne CSS, JS und Bilder — im vorherigen Build
hat genau das einen echten Bug (falsche Bildpfade) durchrutschen lassen, weil
eine kaputte und eine funktionierende Seite in diesem Modus identisch aussehen.

Zu prüfen:

- Scrollen von 0 % bis 100 % mit Screenshots an jedem Kapitel; bei Scrollposition
  0 müssen Titel und Scroll-Hinweis **ohne jedes Scrollen** sichtbar sein.
- Netzwerkprotokoll: kein 404 auf Frames, Videos, CSS oder JS.
- Canvas beweisen, nicht vermuten: `getImageData` an der Bildmitte für drei
  verschiedene Scrollpositionen muss drei verschiedene Farben liefern — sonst
  scrubbt der Film nicht wirklich (`finishing.md` §6).
- Ruckel-Messung über rAF-Abstände, bewertet nach p95/Maximum, **nicht** nach
  durchschnittlichen fps: ein 60-fps-Mittel verdeckt 80-ms-Aussetzer perfekt.
  Ziel: Maximum unter 50 ms.
- Beide Breakpoints (Desktop und 375×812), jedes Mal.
- Reduced-Motion und „GSAP fehlt" tatsächlich auslösen, nicht aus dem Code
  erschließen.
- Zahlen gegen `js/gaming-data.js` gegenprüfen: Gesamtstunden und Top-Spiele
  müssen exakt den Werten aus der Datei entsprechen.

## Kosten

| Posten | Credits |
|---|---|
| 4 Keyframes (Seedream 5 Pro, 2k) | 400 |
| Probelauf Clip 1+2, 720p Mini | 1.400 |
| Film: 3 × 5 s, 1080p Pro | 10.500 |
| 2 Kapitel-Videos, 4 s, 720p Pro | 2.240 |
| Puffer für eine Neugenerierung | 1.500 |
| **Summe** | **~16.000** |

Guthaben zum Zeitpunkt der Planung: 137.514 Credits. Vor jeder kostenpflichtigen
Generierung wird der Stand geprüft; nach dem Film wird der tatsächliche Verbrauch
berichtet.

## Nicht-Ziele

- Kein Ton, in keiner Form.
- Keine Laufzeit-Generierung — alle Videos und Bilder werden einmalig erzeugt und
  als statische Dateien ausgeliefert.
- Kein Build-Schritt, kein Bundler, keine neue Laufzeit-Abhängigkeit. Die Seite
  bleibt reines HTML/CSS/JS auf GitHub Pages. (`imageio-ffmpeg` ist reines
  Build-Werkzeug und wird nicht ausgeliefert.)
- Keine Änderung an `gaming.html` oder am Admin-Bereich; Spielinhalte werden
  weiterhin ausschließlich dort gepflegt.
- Kein separater 9:16-Film für Mobilgeräte. Mobil läuft derselbe Film mit
  Letterbox statt Mittenbeschnitt; ein eigener Hochkant-Durchlauf würde die
  Videokosten verdoppeln und ist für diesen Umfang nicht vorgesehen.
