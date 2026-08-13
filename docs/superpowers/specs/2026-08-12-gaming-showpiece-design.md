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
**kein Ton** · Umfang ~10 Sek. Film.

Nachträglich vom Nutzer verschärft, nachdem eine erste Fassung dieser Spec ein
~35 MB großes Repository ergeben hätte: **Ladezeit im Frontend und Repo-Größe sind
harte Kriterien.** Die Zahlen unten (10 statt 15 Sek. Film, WebP statt JPEG,
960 statt 1280 px) sind das Ergebnis dieser Vorgabe.

Danach ein zweites Mal nachgeschärft: **exakt ein Video auf der gesamten Seite,
dafür deutlich mehr Effekte und Animation.** Die ursprünglich geplanten zwei
Kapitel-Videos entfallen ersatzlos; die Kapitel entstehen jetzt vollständig aus
Code und wurden von fünf auf sechs erweitert. Das senkt Gewicht und Kosten und
macht die Seite gleichzeitig reaktiver, weil Code auf Scrollgeschwindigkeit und
Mauszeiger reagieren kann und ein abgespieltes Video nicht.

## Der Film

Der scroll-gescrubbte Hero-Film trägt die ersten ~40 % des Scrollwegs.

**Der eine Vektor (verbindlich für alle Clips): Die Kamera fährt ausschließlich
vorwärts und tiefer hinein. Niemals zurück, niemals seitlich heraus.** Jeder
Clip-Prompt muss diese Bewegung fortsetzen, nicht nur seinen Inhalt beschreiben
(playbook §2b: der Prompt beschreibt die *Reise* vom Start-Pin zum End-Pin, nie
den Zustand eines Endes).

**Zwei Clips à 5 Sek., drei Welten.** Die Weltwechsel liegen bewusst *innerhalb*
der Clips, nicht an der Nahtstelle — so gibt es nur eine einzige Verkettungsstelle,
die sichtbar werden könnte, statt zweier.

| Clip | Inhalt | Kamera | Dauer |
|---|---|---|---|
| 1 — CHROME → SCHWELLE | Schwarzer Void, kolossale Masse flüssigen Chroms wälzt sich; die Kamera schiebt darauf zu, das Chrom öffnet sich blendenartig zu einem Korridor-Maul | `superDollyIn` | 5 s |
| 2 — KORRIDOR → KERN | Dieselbe Vorwärtsbewegung, jetzt innerhalb: ein regennasser Neon-Korridor, Neonstreifen rasen vorbei, am Ende öffnet er sich ins Weite auf den geschmolzenen Plasmakern | `pushIn` | 5 s |

Farb- und Temperaturbogen: kalt/monochrom → elektrisch/neon → heiß/glühend.
Raumbogen: geschlossen → gerichtet → weit.

### Das Schwellenbild (die riskanteste Stelle)

Der Wechsel Chrome → Korridor ändert Material *und* Raum gleichzeitig — genau die
Konstellation, bei der ein i2v-Modell laut playbook mitten im Clip schneidet
statt zu reisen. Gegenmaßnahme: **Das Schwellenbild wird gezielt als Keyframe
generiert und enthält beide Welten bereits** — Chromwände, die sich zu einem
Korridor-Maul formen. Damit muss kein Clip die Verwandlung erfinden: Clip 1 fährt
auf das Schwellenbild zu, Clip 2 fährt von ihm weg. Genau deshalb liegt die
Nahtstelle an dieser Stelle — sie ist durch das Schwellenbild an beiden Seiten
festgenagelt.

### Keyframes und Verkettung

Drei Keyframes (Seedream 5 Pro, 2k, 16:9):

- **KF1** — Chrom-Masse im schwarzen Void (Eröffnung; Stil bereits validiert durch
  die Stilprobe `A-chrome`)
- **KF2** — Schwellenbild: Chrom formt ein Korridor-Maul, Neon schimmert schon
  dahinter (verbindet die Stilproben `A-chrome` und `B-neon`)
- **KF3** — Plasmakern füllt das Bild (Stil validiert durch `C-plasma`)

Verkettung nach playbook §2 — **Clip 2 startet auf dem per ffmpeg extrahierten
echten letzten Frame von Clip 1, nicht auf dem Keyframe:**

| Clip | `keyframes.start` | `keyframes.end` |
|---|---|---|
| 1 | KF1 | KF2 |
| 2 | letzter Frame Clip 1 (hochgeladen) | KF3 |

Die Extraktion erzeugt eine lokale PNG-Datei; Magnific braucht eine
Creation-Referenz, deshalb wird der extrahierte Frame vor Verwendung über
`creations_upload_image` hochgeladen. Die Kette ist damit **zwingend sequenziell**
— Clip 1 muss fertig gerendert sein, bevor Clip 2 startet. Die beiden Clips
niemals parallel generieren.

### Ausgabeformat

16:9, 1080p, Seedance 2.0 Pro. Ton aus (`withSoundEffects: false`) — die Seite
ist stumm, und Audio würde die Kosten vervielfachen ohne jeden Nutzen.

## Die Kapitel

**Ausdrückliche Vorgabe des Nutzers: exakt ein Video auf der ganzen Seite.** Der
Scroll-Film ist dieses eine Video. Alle Kapitel danach werden vollständig aus
Code erzeugt — keine weiteren Videodateien, keine weiteren Bilddateien. Die
Begründung ist nicht nur Gewicht: Effekte aus Code laden in Nullzeit, lassen sich
beliebig dicht stapeln und reagieren auf Scrollgeschwindigkeit und Mauszeiger,
was ein abgespieltes Video prinzipiell nicht kann.

Sechs Kapitel, jedes mit einem eigenen Bewegungsprinzip; kein Prinzip wiederholt
sich.

1. **DIE ZAHL** — Die Gesamtstundenzahl aus `GAMES` füllt bildschirmfüllend das
   Bild. Beim Scrollen zählt sie hoch, wobei die noch nicht erreichten Stellen als
   zufällige Ziffern flackern und sich von links nach rechts festsetzen
   (Scramble-Auflösung). Darunter klein: Anzahl der Spiele.
2. **DER NAME** — Das Wort `GAMING` in maximaler Größe, und **innerhalb der
   Buchstabenformen läuft der Film selbst**. Technisch: ein Canvas zeichnet
   Frames aus der bereits geladenen Sequenz, darüber liegt ein schwarzer Block
   mit weißer Schrift und `mix-blend-mode: multiply` — Schwarz deckt ab, Weiß
   lässt durch. **Das kostet kein einziges zusätzliches Byte**, weil die Frames
   ohnehin im Speicher liegen, und es bindet die Seite an ihre eigene Bildwelt
   zurück. Rückfallebene ohne Frames (Reduced Motion): ein animierter
   Chrom-Verlauf aus reinem CSS.
3. **QUERLAUF** — Die Sektion wird gepinnt und horizontal durchgescrollt. Die
   **acht** Spiele mit den meisten Stunden fliegen als große Platten vorbei, in
   Ebenen unterschiedlicher Geschwindigkeit (`containerAnimation`-Parallax),
   Neigung abhängig von der Scroll-Geschwindigkeit (`ScrollTrigger.getVelocity()`,
   geklammert), Kippung in 3D beim Überfahren mit der Maus. Acht ist genug für
   einen Lauf, der Tempo aufbaut, ohne dass die Sektion zur Liste wird; hat
   `GAMES` weniger Einträge, werden entsprechend weniger Platten gerendert.
   **Wichtig für das Design: nur 3 von 25 Spielen haben überhaupt ein
   Cover-Bild.** Die Platten dürfen sich deshalb nicht auf Bildmaterial stützen —
   sie tragen über Typografie und die `accent`-Farbe des jeweiligen Spiels, mit
   dem Cover als Zugabe, wo es existiert.
4. **DAS FELD** — Ein bildschirmfüllendes Canvas-Partikelfeld: Punkte driften,
   benachbarte werden durch dünne Linien verbunden, der Mauszeiger stößt sie ab,
   und die Scrollgeschwindigkeit dehnt das ganze Feld. Darüber ein Satz, dessen
   Buchstaben aus zufälligen Zeichen einrasten.
5. **DER TICKER** — Drei endlose Laufbänder mit den Titeln **aller** Spiele,
   unterschiedliche Geschwindigkeit und Richtung pro Zeile, das ganze Band nach
   der Scrollgeschwindigkeit geschert. Dies ist das einzige Kapitel, das den
   vollen Bestand zeigt statt einer Auswahl — Masse ist hier der Effekt.
6. **DAS PORTAL** — Ein langsam rotierender Chrom-Verlauf aus CSS als Hintergrund.
   Davor der CTA ins vollständige Archiv (`gaming.html`): Lichtstreif wandert bei
   Hover darüber, der Button zieht den Mauszeiger magnetisch an. Dies muss das
   selbstbewussteste Element der Seite sein (`finishing.md` §3).

### Effekt-Inventar

Damit die Dichte nachprüfbar ist statt behauptet — diese Effekte müssen am Ende
tatsächlich auf der Seite laufen: Scroll-Scrubbing des Films · Beat-Einblendungen
über dem Film · Hochzähler · Scramble-Auflösung von Ziffern und Buchstaben ·
Film-in-Schrift · gepinnter Querlauf · Parallax in Ebenen ·
Scherung nach Scrollgeschwindigkeit · 3D-Kippung bei Hover · Partikelfeld mit
Verbindungslinien · Mauszeiger-Abstoßung · Endlos-Laufbänder ·
magnetischer Button · Lichtstreif · rotierender Chrom-Verlauf · Filmkorn ·
Vignette · eigener Mauszeiger · Fortschrittslinie mit Kapitelanzeige ·
Kopfzeile mit umschlagender Farbe.

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
assets/gaming-intro/poster.jpg   erster Filmframe, für sofortiges Bild und als Fallback
```

Das sind **alle** Mediendateien der Seite. Es gibt keine weiteren Videos und keine
weiteren Bilder; jedes Kapitel unterhalb des Films entsteht vollständig aus Code.

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

1. Drei Keyframes generieren (Seedream 5 Pro, 2k, 16:9).
2. **Probelauf:** Beide Clips in 720p mit Seedance 2.0 Mini erzeugen und die
   Nahtstelle prüfen — hält das Modell den Start-Pin? Erst wenn ja, wird gemastert
   (playbook §2b: die Verkettung verifizieren, bevor das Budget des ganzen Films
   darauf gesetzt wird).
3. Master: zwei Clips sequenziell in 1080p; Clip 2 mit dem extrahierten letzten
   Frame von Clip 1 als Start-Pin.
4. Zusammenfügen zu `master.mp4`.
5. **Kopf beschneiden:** Die ersten ~2 Sek. Frame für Frame ansehen und so weit
   kürzen, bis der erste Frame bereits *innerhalb* der Bewegung liegt
   (`finishing.md` §1 — generierte Filme öffnen sehr häufig auf einem noch
   stehenden Bild, was wie ein Schnitt in den eigenen Film wirkt). Danach die
   Framezahl im Code auf den beschnittenen Wert setzen.
6. Frames extrahieren, **bei nativen 24 fps, ohne jede Dezimierung** — 10 Sek.
   ergeben ~240 Frames, nach Kopfbeschnitt entsprechend weniger.

### Payload-Budget (verbindlich)

Ausgabeformat der Frames ist **WebP, nicht JPEG** (`-c:v libwebp`). WebP ist bei
gleicher wahrgenommener Qualität rund 35 % kleiner, wird von allen Zielbrowsern
unterstützt, und `createImageBitmap` dekodiert es genauso schnell — für eine
Engine, die im Sekundentakt Bilder dekodiert, ist das die entscheidende
Eigenschaft.

| Satz | Breite | Qualität | Frames | Ziel |
|---|---|---|---|---|
| Desktop | 960 px | `-quality 72` | alle (~240) | ≤ 6 MB |
| Mobile | 480 px | `-quality 65` | alle (~240) | ≤ 2 MB |

**Wird ein Budget überschritten, wird die Breite reduziert — niemals die
Framezahl.** Zeitliche Glätte ist auf einem bewegten Bild deutlich sichtbarer als
Schärfe im Einzelbild (`engine.md`, „Frame payload"). Der Mobile-Satz behält
deshalb die volle Framezahl bei kleinerer Auflösung, statt jeden zweiten Frame
wegzuwerfen — ein halbierter Framesatz halbiert die Scrub-Bildrate und ist der
schnellste Weg, einen sauber gedrehten Film billig aussehen zu lassen.

Die 960 px sind bewusst niedriger als die typische Canvas-Breite. Bei einem
dunklen, körnigen, permanent bewegten Bild ist die Hochskalierung praktisch
unsichtbar — die Filmkorn-Ebene, die ohnehin darüberliegt, kaschiert sie
zusätzlich.

**Ausdrückliche Vorgabe des Nutzers: Gewicht ist ein hartes Kriterium, kein
Nebenaspekt.** Ladezeit im Frontend und Repo-Größe wurden explizit begrenzt.
Damit liegen rund 480 Einzelbilder (~8 MB) dauerhaft im Repository; bei GitHub
Pages führt daran kein Weg vorbei, weil ausgeliefert wird, was im Repo liegt. Das
Repository wächst von derzeit ~5 MB auf **~11 MB**. Ein Desktop-Besucher lädt über
den gesamten Scrollweg ~6 MB, ein Handy-Besucher ~1,7 MB — und beides
**progressiv**: nach den ersten ~40 Frames (~0,8 MB) ist die Seite bedienbar, der
Rest strömt beim Scrollen nach. Wer nach wenigen Sekunden abspringt, hat nie mehr
als ~1 MB geladen.

Da Git-Historie nichts vergisst, bleibt eine später ersetzte Framesequenz für
immer im Verlauf. Deshalb wird der Framesatz **erst nach dem Kopfbeschnitt und
erst nach bestandener Sichtprüfung des Films** committet, nicht schon als
Zwischenstand.

## Scrub-Engine

Nach `engine.md` §Scrub-engine:

- Hoher Scroll-Treiber mit `position: sticky`-Bühne und Vollbild-`<canvas>`;
  Fortschritt aus `getBoundingClientRect()`.
- **Gelerpter Playhead** (`current += (target - current) * 0.14`) — direkte
  Zuordnung fühlt sich mechanisch an.
- **ImageBitmap-Schiebefenster** als Kern gegen Ruckeln: `createImageBitmap`
  dekodiert außerhalb des Hauptthreads, ein Fenster dekodierter Bitmaps wandert
  mit dem Playhead mit, ältere werden geschlossen. `drawImage` auf ein
  `HTMLImageElement` erzwingt dagegen eine synchrone Bild-Dekodierung im
  Hauptthread — genau das erzeugt das ruckelige Gefühl.
- Fenstergröße **in Sekunden Film** bemessen, nicht in Frames: ~2 s voraus, ~1,3 s
  zurück.
- Ladepumpe mit begrenzter Parallelität (~10 gleichzeitig), Ladebalken,
  `nearestFrame()`-Rückfall, damit ein fehlender Frame das Canvas nie leert.
- **Nicht blind `cover`:** Überschreitet der Beschnitt 22 %, wird auf `contain`
  umgeschaltet und mit Letterbox gezeichnet. Ein 16:9-Film in einem
  Hochkant-Viewport behielte sonst nur die mittleren ~26 % jedes Frames.
- **DPR auf 1.0 begrenzt.** Ein 960-px-Frame in ein 2268-px-Canvas gezeichnet
  (1512 CSS-px × 1.5 DPR) wäre eine 2,4-fache Hochskalierung und liest sich als
  pixelig — woraufhin der Reflex wäre, die DPR zu *erhöhen*, was es verschlimmert.
  Schärfe beim Scrubben kommt daher, dass Quelle und Canvas nahe beieinander
  liegen, nicht von mehr Gerätepixeln.
- Umschaltung Desktop/Mobile über `matchMedia`; beim Wechsel **werden die alten
  ImageBitmaps geschlossen**, sonst leckt bei jeder Drehung GPU-Speicher
  (`finishing.md` §5).

### Reihenfolge-Gesetz

ScrollTrigger werden in Erstellungsreihenfolge aktualisiert. **Alle gepinnten
Szenen müssen vor allen Hintergrund-/Ambient-Triggern erzeugt werden** — sonst
werden Positionen berechnet, bevor die Pin-Spacer existieren, und alles danach
sitzt still und falsch (`engine.md`, „Ordering law").

## Randfälle und Rückfallebenen

- **`prefers-reduced-motion: reduce`** — kein Pinning, kein Scrub, kein
  Partikelfeld, keine Laufbänder. Das Poster-Standbild steht, alle Kapitel liegen
  im normalen Dokumentfluss, sämtliche Inhalte und der CTA sind sichtbar und
  erreichbar. Kapitel 2 zeigt statt des Films den CSS-Chromverlauf in der Schrift.
- **GSAP/Lenis laden nicht** (CDN blockiert oder offline) — dieselbe statische
  Fassung wie bei Reduced Motion. Geprüft wird auf das tatsächliche Vorhandensein
  der Globals, nicht auf ein Ladeereignis.
- **JavaScript vollständig deaktiviert** — hier gibt die Seite bewusst **keine**
  Garantie ab, und das ist eine Architekturentscheidung, keine Lücke. Die gesamte
  Website rendert ihre Inhalte aus den Daten-Dateien heraus: `gaming.html` baut
  sein Spiele-Raster per JS aus `gaming-data.js`, `index.html` seine Kapitel
  ebenso. Diese Seite ohne JS lesbar zu machen hieße, Spieltitel und Stundenwerte
  fest ins HTML zu schreiben — und damit gegen die höherrangige Regel zu
  verstoßen, dass der Admin-Bereich die einzige Quelle der Wahrheit für Inhalte
  bleibt. Von zwei unvereinbaren Anforderungen gewinnt die Admin-Regel.
  Die belastbare Zusage lautet deshalb: **die Seite funktioniert ohne GSAP, ohne
  Lenis und unter Reduced Motion** — nicht ohne JavaScript überhaupt.
- **Kein Canvas-2D-Kontext** (extrem selten, aber möglich) — Kapitel 4 blendet sein
  Partikelfeld aus und zeigt nur Text auf dem Grundschwarz. Kein Kapitel darf leer
  wirken, wenn seine Effektebene ausfällt. **WebGL wird nirgends verwendet**, damit
  es auch nirgends ausfallen kann.
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
| 3 Keyframes (Seedream 5 Pro, 2k) | 300 |
| Probelauf beider Clips, 720p Mini | 1.400 |
| Film: 2 × 5 s, 1080p Pro | 7.000 |
| Puffer für eine Neugenerierung | 1.500 |
| **Summe** | **~10.200** |

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
