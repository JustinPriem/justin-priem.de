# Hero-Partikelfeld — Design

## Hintergrund

Recherche der Shopify-Editions-Seite (Frühjahr 2026, `shopify.com/de/editions/spring2026`) zeigte, dass deren Hero-Sektion ein
react-three-fiber/Theatre.js-Setup mit eigenem GPU-Fluid-Solver, SDF-Rendering und GLTF-Assets ist — für eine
statische, buildlose Seite ohne Framework unangemessen aufwendig. Diese Spec beschreibt stattdessen einen
leichtgewichtigen, selbstgeschriebenen Canvas-Partikeleffekt im "Spirit" des Originals (mausreaktiv, organisch),
der zur bestehenden Codebase passt.

Betroffene Seite: `index.html`, Sektion `#hero` mit dem Container `.hero-particles`, der heute nur einen statischen
CSS-Radial-Gradient mit sechs fest positionierten Punkten enthält (`css/landing.css:229`).

## Architektur

Neues Modul **`js/particles.js`**, unabhängig von `landing.js`, exportiert eine Fabrik-Funktion:

```
createParticleField(container, options)
```

- `container`: DOM-Element, das den `<canvas>` aufnimmt (z. B. `.hero-particles`)
- `options`:
  - `colors`: Array von Hex-Farben für die Partikel
  - `density`: grobe Ziel-Partikelzahl relativ zur Container-Fläche (gedeckelt)
  - `interactive`: ob Pointer-Anziehung aktiviert werden soll (wird zusätzlich durch `hasFineCursor` gegatet)

Jeder Aufruf von `createParticleField` erzeugt eine unabhängige Instanz (eigener Canvas, eigene
`requestAnimationFrame`-Schleife, eigener `IntersectionObserver`). Das macht das Modul wiederverwendbar für
spätere Sektionen (z. B. Raya, Unbesiegbar) mit jeweils eigener Farbpalette, ohne Kopplung an "Hero" im Modulcode.

`index.html` bindet `js/particles.js` per `<script>`-Tag vor `js/landing.js` ein. Die Initialisierung für den Hero
erfolgt entweder direkt in `particles.js` (Self-Init über ein Daten-Attribut, z. B.
`data-particle-colors="#33E7FF,#C264FF,#ECEAE3"` auf `.hero-particles`) oder per explizitem Aufruf aus
`landing.js` — Details dazu in der Implementierungsplanung.

## Visuelles Verhalten

Kein echter Fluid-Solver, sondern zwei überlagerte Bewegungskomponenten pro Partikel:

1. **Ambiente Drift** — langsame, individuelle Sinus-Wanderung (Phase und Frequenz pro Partikel zufällig versetzt),
   damit sich das Feld organisch statt synchron bewegt. Ersetzt die heutige starre `drift`-Keyframe-Animation.
2. **Cursor-Anziehung** (nur bei `hasFineCursor`) — Partikel innerhalb eines Anziehungsradius um die Cursor-Position
   werden sanft in Richtung Cursor gezogen, mit einem Mindestabstand, damit sie nicht übereinander stapeln. Verlässt
   der Cursor den Radius bzw. bewegt er sich weiter, federn die Partikel gedämpft zurück in ihre Drift-Bahn.

Größe, Farbe (aus der übergebenen `colors`-Palette) und Deckkraft sind pro Partikel leicht randomisiert.
Für den Hero: `#33E7FF` (Cyan), `#C264FF` (Magenta), `#ECEAE3` (Off-White) — identisch zur heutigen Palette in
`css/landing.css`.

Dichte: an die Container-Fläche gekoppelt, aber gedeckelt auf ca. 40–70 Partikel im Hero, um GPU-Last und visuelle
Unruhe zu begrenzen. Auf Geräten ohne feinen Zeiger (Touch) läuft nur die ambiente Drift, keine Pointer-Logik wird
gebunden.

## Integration & Fallbacks

- `.hero-particles` bleibt als Container bestehen; der heutige CSS-Radial-Gradient-Hintergrund bleibt als
  **No-JS-/Reduced-Motion-Fallback** unverändert im CSS.
- `createParticleField` fügt einen `<canvas>` in den Container ein und setzt eine Klasse (z. B.
  `.has-canvas-particles`) auf den Container, sobald der Canvas tatsächlich aktiv gestartet ist — nur dann wird der
  CSS-Gradient per Selektor ausgeblendet.
- Respektiert bestehende Konventionen aus `js/landing.js`:
  - `prefers-reduced-motion: reduce` → Canvas wird gar nicht gestartet, statische CSS-Variante bleibt sichtbar.
  - `hover: hover` and `pointer: fine` (`hasFineCursor`) → steuert nur, ob Pointer-Events gebunden werden; der
    Canvas selbst läuft unabhängig davon (ambient) weiter.
- **Performance:**
  - `IntersectionObserver` auf den Container pausiert die `requestAnimationFrame`-Schleife, sobald die Sektion den
    Viewport verlässt, und setzt sie beim Wiedereintritt fort.
  - Canvas-Auflösung an `devicePixelRatio` gekoppelt, gedeckelt auf 2x.
  - `resize`-Listener mit `ticking`-Flag-Pattern (wie andernorts in `landing.js`) hält Canvas-Größe und
    Partikelverteilung bei Fenstergrößenänderung konsistent.

## Testing

Keine automatisierte Test-Suite auf dieser Seite (reines HTML/CSS/JS, bisher ausschließlich visuell in der
Browser-Preview verifiziert — z. B. der magnetische CTA-Button, der Theme-Pulse). Verifikation manuell:

1. **Sichtprüfung:** Hero lädt, Partikel erscheinen und driften ambient.
2. **Maus-Interaktion:** Cursor über den Hero bewegen → Partikel werden sanft angezogen, federn beim Wegbewegen
   zurück in ihre Drift-Bahn.
3. **Reduced Motion:** `prefers-reduced-motion: reduce` in den DevTools simulieren → Canvas startet nicht,
   CSS-Gradient-Fallback bleibt sichtbar.
4. **Touch/kein feiner Zeiger:** Viewport auf ein Mobile-Preset stellen → Partikel driften ambient, keine
   Pointer-Bindung.
5. **Viewport-Pausierung:** Aus dem Hero herausscrollen und prüfen (z. B. via Performance-Panel oder
   Debug-Zähler), dass die Animationsschleife pausiert; beim Zurückscrollen läuft sie wieder an.
6. **Resize:** Fenstergröße ändern → Canvas und Partikelverteilung bleiben stimmig, keine verzerrte/abgeschnittene
   Fläche.

## Out of Scope

- Wiederverwendung des Moduls in weiteren Sektionen (Raya, Unbesiegbar, …) — das Modul wird dafür vorbereitet
  (konfigurierbare Farben/Dichte), aber in dieser Runde nur für `#hero` verdrahtet.
- Echte Fluid-Simulation, WebGL/Three.js, GLTF-Assets oder Post-Processing-Effekte wie im Shopify-Original.
