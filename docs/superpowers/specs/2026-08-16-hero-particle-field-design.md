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
2. **Cursor-Anziehung** (nur bei `hasFineCursor`) — Partikel innerhalb eines Anziehungsradius um die Cursor-Position
   werden sanft in Richtung Cursor gezogen, mit einem Mindestabstand, damit sie nicht übereinander stapeln. Verlässt
   der Cursor den Radius bzw. bewegt er sich weiter, federn die Partikel gedämpft zurück in ihre Drift-Bahn. Gilt
   über die ganze Seite hinweg, nicht nur im Hero.

**Tiefe statt reiner Zufallsstreuung:** Jedes Partikel bekommt beim Erzeugen einen zufälligen Tiefenwert (0–1), von
dem Größe, Drift-Geschwindigkeit und Deckkraft gemeinsam abhängen — Partikel mit niedriger Tiefe sind kleiner,
langsamer und dezenter (wirken "weiter hinten"), Partikel mit hoher Tiefe größer, etwas schneller und heller.
Ergibt ein räumlicheres Feld statt komplett unabhängig gewürfelter Werte. Zusätzlich ein leichtes Sinus-Twinkle auf
der Deckkraft pro Partikel (eigene Phase), statt konstanter Alpha.

**Rendering — vorgerendertes Sprite statt Live-Glow:** Ein einzelnes ~32px-Radial-Gradient-Sprite pro Grundfarbe
wird einmalig auf einen Offscreen-Canvas gezeichnet; jedes Partikel wird pro Frame nur noch per `drawImage()`
dieses Sprites gezeichnet (skaliert nach Tiefe/Größe), nicht per `arc()` + `fill()` + `shadowBlur`.
`shadowBlur` wird bewusst nicht verwendet — bei 40–70 Partikeln pro Frame ist das spürbar teurer als ein simples
Sprite-Blit und bringt bei diesem Effekt keinen sichtbaren Zusatznutzen.

### Farbverlauf passend zur Sektion

Die Seite hat pro Sektion schon ein Farbthema (`THEME_PULSE_COLORS` in `js/landing.js:93`, gesteuert über den
bestehenden `themeObserver`, der beim Scrollen erkennt, welche `.story`-Sektion gerade sichtbar ist). Der
Partikel-Layer zieht mit, **inklusive Kontrastanpassung** für helle vs. dunkle Sektions-Hintergründe:

| Sektion | Hintergrund | Partikel-Palette |
|---|---|---|
| Hero / Gaming | dunkel (`#12121A`) | `#33E7FF` Cyan, `#C264FF` Magenta, `#ECEAE3` Off-White |
| Radfahren | hell (`#F6F3EC` Papier) | `#D45A22` Lehm, `#5C7A52` Moos |
| Raya | hell (`#FAF7F2` Papier) | `#C98572` Blush, `#8B8577` gedämpftes Braun |
| Unbesiegbar | dunkel (`#1a0a2e`) | `#ffc94a` Gold, `#ff3ea5` Pink, `#fff8ec` Creme |

Grund: dieselben hellen Hero-Töne wären auf den hellen Papier-Hintergründen von Radfahren/Raya kaum sichtbar —
für diese Sektionen werden stattdessen dunklere, kontrastreiche Farben aus deren eigener Palette verwendet.

Der Wechsel läuft nicht abrupt, sondern wird beim Sektionswechsel sanft über- oder ausgeblendet (kurze
Farb-Interpolation je Partikel, ähnlich der Interaktionsstärke bei bestehenden Übergängen auf der Seite).

Dichte: an die Viewport-Fläche gekoppelt, aber gedeckelt (grob 40–70 Partikel), um GPU-Last und visuelle Unruhe zu
begrenzen. Auf Geräten ohne feinen Zeiger (Touch) läuft nur die ambiente Drift, keine Pointer-Logik wird gebunden.

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
- **Kopplung an `setupScrollStory()`:** Der bestehende `themeObserver` (der heute schon `nav.dataset.theme` setzt
  und `triggerThemePulse(theme)` auslöst) ruft zusätzlich `particleField.setColors(...)` mit der zur Sektion
  passenden Palette auf.
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
2. **Maus-Interaktion:** Cursor über verschiedene Sektionen bewegen → Partikel werden sanft angezogen, federn beim
   Wegbewegen zurück in ihre Drift-Bahn.
3. **Farbwechsel:** Durch die Seite scrollen und prüfen, dass die Partikelfarbe beim Sektionswechsel sanft auf die
   jeweilige Palette umblendet (inkl. Kontrast auf den hellen Radfahren-/Raya-Hintergründen).
4. **Reduced Motion:** `prefers-reduced-motion: reduce` in den DevTools simulieren → Canvas startet nicht, Seite
   sieht exakt wie vorher aus.
5. **Touch/kein feiner Zeiger:** Viewport auf ein Mobile-Preset stellen → Partikel driften ambient, keine
   Pointer-Bindung.
6. **Lesbarkeit & Klickbarkeit:** Überschriften, CTAs und Quicknav-Links bleiben über der Partikel-Ebene scharf
   lesbar und normal klickbar (`pointer-events: none` greift).
7. **Jank-Test:** Pro-Frame-`requestAnimationFrame`-Deltas über ~5s Beobachtung mitloggen (Konsole oder ein
   Debug-Zähler), **p95/max bewerten, nie den Durchschnitts-FPS-Wert** — ein Mittelwert von 60fps kann einzelne
   80ms-Ruckler locker verstecken. Zielwert: max < 50ms, auch während Sektionswechsel/Farbüberblendung.
8. **Resize:** Fenstergröße ändern → Canvas und Partikelverteilung bleiben stimmig, keine verzerrte/abgeschnittene
   Fläche.

## Out of Scope

- Wiederverwendung des Moduls für weitere, eigenständige Instanzen außerhalb der Startseite — das Modul bleibt
  dafür generisch nutzbar, aber in dieser Runde nur einmal (seitenweit auf `index.html`) verdrahtet.
- Echte Fluid-Simulation, WebGL/Three.js, GLTF-Assets oder Post-Processing-Effekte wie im Shopify-Original.
- GSAP/Lenis-Kamerafahrten oder generiertes Video-Footage (Scroll-Film-Ansatz) — passt nicht zum Umfang dieser
  Ergänzung und würde einen ganz eigenen, viel größeren Aufbau bedeuten.
