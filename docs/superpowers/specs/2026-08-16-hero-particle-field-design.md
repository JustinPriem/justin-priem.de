# Seitenweites Partikelfeld — Design

## Hintergrund

Recherche der Shopify-Editions-Seite (Frühjahr 2026, `shopify.com/de/editions/spring2026`) zeigte, dass deren Hero-Sektion ein
react-three-fiber/Theatre.js-Setup mit eigenem GPU-Fluid-Solver, SDF-Rendering und GLTF-Assets ist — für eine
statische, buildlose Seite ohne Framework unangemessen aufwendig. Diese Spec beschreibt stattdessen einen
leichtgewichtigen, selbstgeschriebenen Canvas-Partikeleffekt im "Spirit" des Originals (mausreaktiv, organisch),
der zur bestehenden Codebase passt.

**Umfang (nach Rückmeldung angepasst):** Kein Ersatz für die bestehende `.hero-particles`-Dekoration, sondern eine
**zusätzliche, seitenweite Ebene** auf `index.html`. Nichts Bestehendes wird entfernt — der heutige CSS-Gradient im
Hero, das Herz-Feld bei Raya, das Kronen-Feld bei Unbesiegbar, die Straßen-SVG bei Radfahren bleiben alle
unverändert. Der neue Partikel-Layer kommt als eigenständige Ebene obendrauf, sichtbar über die gesamte Startseite
hinweg (Hero + alle vier Story-Sektionen).

**Revision nach erstem Deploy (Live-Feedback):** Vier Nachjustierungen — deutlich höhere Partikeldichte, ein
"cooleres" Sprite mit hellerem Kern statt flachem Farbpunkt, **Abstoßung statt Anziehung** vom Cursor, und eine
**einheitliche, feste Farbpalette statt Farbwechsel pro Sektion** (der Nutzer wollte, dass die Partikel nicht auf
die Scroll-Position reagieren). Die betroffenen Abschnitte unten sind entsprechend aktualisiert.

## Architektur

Neues Modul **`js/particles.js`**, unabhängig von `landing.js`, exportiert eine Fabrik-Funktion:

```
createParticleField(container, options)
```

- `container`: DOM-Element, das den `<canvas>` aufnimmt
- `options`:
  - `colors`: Array von Hex-Farben für die Partikel (initiale Palette)
  - `density`: grobe Ziel-Partikelzahl relativ zur Viewport-Fläche (gedeckelt)
  - `interactive`: ob Pointer-Anziehung aktiviert werden soll (zusätzlich durch `hasFineCursor` gegatet)
- Rückgabewert: ein Handle mit `setColors(colors)` — erlaubt es, die Zielpalette von außen sanft zu wechseln
  (siehe Farbverlauf unten), ohne die Instanz neu zu erzeugen.

Die Funktion selbst bleibt generisch und containerbezogen (kein Wissen über "Startseite" oder "Hero" im Modul) —
sie könnte später auch für eine einzelne Sektion instanziiert werden. Auf `index.html` wird sie aber nur **einmal**
aufgerufen, mit einem neuen, eigenen Container-Element, das direkt als Kind von `<body>` eingehängt wird (nicht in
einer der `.story`-Sektionen), und `position: fixed; inset: 0` bekommt — das macht daraus einen einzigen,
viewport-großen Layer, der unabhängig vom Scroll-Fortschritt sichtbar bleibt.

`index.html` bindet `js/particles.js` per `<script>`-Tag vor `js/landing.js` ein, da `landing.js` das Handle für
den Farbwechsel braucht (siehe Integration).

## Visuelles Verhalten

*(Rendering-Technik und Jank-Testmethode unten übernommen aus dem "Ambient hero layer"-Abschnitt des
`scroll-film-studio`-Skills — dort für Canvas-Partikel über einem Film-Standbild beschrieben, hier fürs
seitenweite Feld angewendet.)*

Kein echter Fluid-Solver, sondern zwei überlagerte Bewegungskomponenten pro Partikel:

1. **Ambiente Drift** — langsame, individuelle Sinus-Wanderung (Phase und Frequenz pro Partikel zufällig versetzt),
   damit sich das Feld organisch statt synchron bewegt.
2. **Cursor-Abstoßung** (nur bei `hasFineCursor`) — Partikel innerhalb eines Abstoßungsradius um die Cursor-Position
   werden entlang des normierten Richtungsvektors vom Cursor weg geschoben (Schub-Distanz begrenzt, damit es auch
   direkt am Cursor stabil bleibt statt numerisch zu "explodieren"). Verlässt der Cursor den Radius bzw. bewegt er
   sich weiter, federn die Partikel gedämpft zurück in ihre Drift-Bahn. Gilt über die ganze Seite hinweg, nicht nur
   im Hero.

**Tiefe statt reiner Zufallsstreuung:** Jedes Partikel bekommt beim Erzeugen einen zufälligen Tiefenwert (0–1), von
dem Größe, Drift-Geschwindigkeit und Deckkraft gemeinsam abhängen — Partikel mit niedriger Tiefe sind kleiner,
langsamer und dezenter (wirken "weiter hinten"), Partikel mit hoher Tiefe größer, etwas schneller und heller.
Ergibt ein räumlicheres Feld statt komplett unabhängig gewürfelter Werte. Zusätzlich ein leichtes Sinus-Twinkle auf
der Deckkraft pro Partikel (eigene Phase), statt konstanter Alpha.

**Rendering — vorgerendertes Sprite statt Live-Glow:** Ein einzelnes ~48px-Radial-Gradient-Sprite pro Grundfarbe
wird einmalig auf einen Offscreen-Canvas gezeichnet; jedes Partikel wird pro Frame nur noch per `drawImage()`
dieses Sprites gezeichnet (skaliert nach Tiefe/Größe), nicht per `arc()` + `fill()` + `shadowBlur`.
`shadowBlur` wird bewusst nicht verwendet — bei der hohen Partikelzahl pro Frame (siehe Dichte unten) ist das
spürbar teurer als ein simples Sprite-Blit. Für einen "coolen", glühenden Glint-Look statt flacher Farbpunkte hat
das Sprite einen dreistufigen Verlauf (aufgehelltes Zentrum → volle Grundfarbe → transparent) statt einer
einfachen Farbe-zu-transparent-Stufe.

### Feste, einheitliche Farbpalette

**Änderung nach Live-Feedback:** ursprünglich war ein Farbwechsel pro sichtbarer Sektion geplant (gekoppelt an
den bestehenden `themeObserver`). Der Nutzer wollte stattdessen ein Feld, das **nicht auf die Scroll-Position
reagiert** — die Partikel behalten durchgehend dieselbe Palette: `#33E7FF` Cyan, `#C264FF` Magenta, `#ff3ea5`
Pink (definiert als `SITE_PARTICLE_COLORS` in `js/landing.js`). Diese drei Töne sind bewusst vivide und
mittelhell gewählt, damit sie sowohl auf den dunklen Hero-/Gaming-/Unbesiegbar-Hintergründen als auch auf den
helleren Papier-Hintergründen von Radfahren/Raya noch lesbar bleiben — ein reiner Kompromiss, da ohne
Sektionskopplung keine Hintergrund-genaue Kontrastanpassung mehr möglich ist. Der `setColors()`-Mechanismus im
Modul (Cross-Fade zwischen zwei Paletten) bleibt für spätere Wiederverwendung erhalten, wird aber auf
`index.html` aktuell nicht aufgerufen.

Dichte: **deutlich erhöht** nach Live-Feedback — an die Viewport-Fläche gekoppelt, gedeckelt auf 90–260 Partikel
(vorher 40–70), um auf großen Desktop-Viewports spürbar dichter zu wirken, ohne auf kleinen Viewports zu
überladen. Auf Geräten ohne feinen Zeiger (Touch) läuft nur die ambiente Drift, keine Pointer-Logik wird
gebunden.

## Integration & Fallbacks

- Neuer Container, z. B. `<div class="site-particles" aria-hidden="true"></div>`, wird in `index.html` direkt vor
  `<main>` (oder als letztes Element vor den Skripten, siehe Implementierungsplanung) eingefügt — **kein** Eingriff
  in bestehende Sektionen oder deren Deko-Elemente.
- **Ebenen-Reihenfolge:** `.site-particles` bekommt einen `z-index`, der über den Sektions-Hintergründen/Deko
  (aktuell `z-index: 0`/`1` je Sektion) liegt, aber unter dem lesbaren Inhalt (`.story-inner`, `z-index: 2`) und
  unter der fixen Quicknav (`z-index: 100`) — Partikel schweben über allen Hintergründen, aber Überschriften/Buttons
  bleiben unbeeinträchtigt lesbar und klickbar (`pointer-events: none` auf dem Container zusätzlich zur
  z-index-Platzierung).
- `createParticleField` fügt einen `<canvas>` in `.site-particles` ein; die bestehenden Deko-Elemente pro Sektion
  bleiben komplett unangetastet — es gibt keinen Fallback-Umschalt-Mechanismus wie ursprünglich geplant, weil
  nichts ersetzt wird. Bei `prefers-reduced-motion: reduce` oder wenn JS fehlschlägt, erscheint einfach kein
  zusätzlicher Layer — die Seite sieht exakt wie heute aus (reiner Zugewinn, kein Rückschritt).
- Respektiert bestehende Konventionen aus `js/landing.js`:
  - `prefers-reduced-motion: reduce` → Canvas wird gar nicht gestartet.
  - `hover: hover` and `pointer: fine` (`hasFineCursor`) → steuert nur, ob Pointer-Events gebunden werden; der
    Canvas selbst läuft unabhängig davon (ambient) weiter.
- **Keine Kopplung an `setupScrollStory()`:** Das Partikelfeld wird einmalig mit der festen `SITE_PARTICLE_COLORS`-
  Palette initialisiert und reagiert nicht auf den `themeObserver` — bewusste Entscheidung nach Live-Feedback
  (siehe "Feste, einheitliche Farbpalette" oben).
- **Performance:**
  - Da der Layer permanent im Viewport sichtbar ist (fixed), gibt es keinen `IntersectionObserver`-Pause-Mechanismus
    für die Sichtbarkeit selbst — stattdessen pausiert die Schleife über die `visibilitychange`-API, wenn der Tab
    in den Hintergrund wechselt (Browser-Tab nicht aktiv), um unnötige CPU/GPU-Last zu vermeiden.
  - Canvas-Auflösung an `devicePixelRatio` gekoppelt, gedeckelt auf 2x.
  - `resize`-Listener mit `ticking`-Flag-Pattern (wie andernorts in `landing.js`) hält Canvas-Größe und
    Partikelverteilung bei Fenstergrößenänderung konsistent.

## Testing

Keine automatisierte Test-Suite auf dieser Seite (reines HTML/CSS/JS, bisher ausschließlich visuell in der
Browser-Preview verifiziert — z. B. der magnetische CTA-Button, der Theme-Pulse). Verifikation manuell:

1. **Sichtprüfung:** Startseite lädt, Partikel-Layer erscheint über allen Sektionen, driftet ambient.
2. **Maus-Interaktion:** Cursor über verschiedene Sektionen bewegen → Partikel werden sanft abgestoßen, federn beim
   Wegbewegen zurück in ihre Drift-Bahn.
3. **Farbe bleibt konstant:** Durch die Seite scrollen und prüfen, dass die Partikelfarbe unverändert bleibt,
   unabhängig davon, welche Sektion gerade sichtbar ist.
4. **Reduced Motion:** `prefers-reduced-motion: reduce` in den DevTools simulieren → Canvas startet nicht, Seite
   sieht exakt wie vorher aus.
5. **Touch/kein feiner Zeiger:** Viewport auf ein Mobile-Preset stellen → Partikel driften ambient, keine
   Pointer-Bindung.
6. **Lesbarkeit & Klickbarkeit:** Überschriften, CTAs und Quicknav-Links bleiben über der Partikel-Ebene scharf
   lesbar und normal klickbar (`pointer-events: none` greift).
7. **Jank-Test:** Pro-Frame-`requestAnimationFrame`-Deltas über ~5s Beobachtung mitloggen (Konsole oder ein
   Debug-Zähler), **p95/max bewerten, nie den Durchschnitts-FPS-Wert** — ein Mittelwert von 60fps kann einzelne
   80ms-Ruckler locker verstecken. Zielwert: max < 50ms, auch bei der höheren Partikeldichte (90–260) und aktiver
   Cursor-Abstoßung.
8. **Resize:** Fenstergröße ändern → Canvas und Partikelverteilung bleiben stimmig, keine verzerrte/abgeschnittene
   Fläche.

## Out of Scope

- Wiederverwendung des Moduls für weitere, eigenständige Instanzen außerhalb der Startseite — das Modul bleibt
  dafür generisch nutzbar, aber in dieser Runde nur einmal (seitenweit auf `index.html`) verdrahtet.
- Echte Fluid-Simulation, WebGL/Three.js, GLTF-Assets oder Post-Processing-Effekte wie im Shopify-Original.
- GSAP/Lenis-Kamerafahrten oder generiertes Video-Footage (Scroll-Film-Ansatz) — passt nicht zum Umfang dieser
  Ergänzung und würde einen ganz eigenen, viel größeren Aufbau bedeuten.
