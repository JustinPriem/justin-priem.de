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

**Revision 1 nach erstem Deploy (Live-Feedback):** Vier Nachjustierungen — deutlich höhere Partikeldichte, ein
"cooleres" Sprite mit hellerem Kern statt flachem Farbpunkt, Abstoßung statt Anziehung vom Cursor, und eine
einheitliche, feste Farbpalette statt Farbwechsel pro Sektion.

**Revision 2 (Korrektur):** Der Wunsch "reagiert nicht auf Scroll-Position" aus Revision 1 war eine Fehl-
interpretation. Gemeint war: die Partikel sollen **mit der Seite scrollen wie ein Teil des Inhalts** (nicht als
`position: fixed`-Bildschirm-Overlay wirken, das beim Scrollen stehen bleibt und wie eine losgelöste Ebene über
allem liegt). Farbwechsel je Sektion ist wieder erlaubt/erwünscht. Zusätzlich: das Feld läuft jetzt nur noch in
**`#hero`, `#gaming` und `#unbesiegbar`** — nicht mehr bei Radfahren/Raya (Nutzerentscheidung). Architektur,
Integration und Farbabschnitt unten sind auf diesen Stand aktualisiert; frühere Formulierungen zu "seitenweit"
und "fix im Viewport" sind damit überholt.

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
  (Cross-Fade, siehe Modul-Code), ohne die Instanz neu zu erzeugen. Aktuell ungenutzt (jede Sektion bekommt eine
  eigene, feste Palette bei der Initialisierung), bleibt aber für spätere Wiederverwendung erhalten.

Die Funktion ist generisch und containerbezogen (kein Wissen über "Startseite", "Hero" o. Ä. im Modul). Auf
`index.html` wird sie **dreimal** aufgerufen — je eine Instanz für `#hero`, `#gaming` und `#unbesiegbar` — mit
einem neuen Container-`<div class="section-particles">` **innerhalb** der jeweiligen `.story`-Sektion (neben den
bestehenden Deko-Elementen wie `.hero-particles` oder `.crown-field`, die unangetastet bleiben). Der Container ist
`position: absolute; inset: 0` — also Teil des normalen Dokumentflusses seiner Sektion, kein `position: fixed`
mehr. Dadurch scrollt jede Instanz mit ihrer Sektion mit, statt als vom Scrollen losgelöste Bildschirm-Ebene zu
wirken (siehe Revision 2 oben — das war der entscheidende Punkt am Nutzer-Feedback).

`index.html` bindet `js/particles.js` per `<script>`-Tag vor `js/landing.js` ein, da `landing.js` die drei
Instanzen mit ihren jeweiligen Farben erzeugt (siehe Integration).

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
   sich weiter, federn die Partikel gedämpft zurück in ihre Drift-Bahn.

   **Koordinatenumrechnung (wichtig seit Revision 2):** Die Zeigerposition wird als Viewport-Koordinate erfasst
   (`e.clientX/clientY`), die Partikel-Ankerpositionen sind aber lokale Container-Koordinaten. Solange der
   Container `position: fixed` war (Revision 1), waren beide Koordinatenräume identisch. Jetzt, wo der Container
   mit der Seite scrollt, muss pro Frame `container.getBoundingClientRect()` abgefragt und die Differenz von der
   Zeigerposition abgezogen werden — sonst würde die Abstoßung bei gescrollter Seite an der falschen Stelle
   wirken.

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

### Drei Instanzen, je eigene feste Palette

Kein sektionsübergreifendes Cross-Fade mehr, sondern drei unabhängige `createParticleField`-Aufrufe (siehe
Architektur), jeder mit einer eigenen, fixen Palette passend zur jeweiligen Sektion — definiert als
`SECTION_PARTICLE_CONFIG` in `js/landing.js`:

| Sektion | Hintergrund | Partikel-Palette |
|---|---|---|
| `#hero` | dunkel (`#12121A`) | `#33E7FF` Cyan, `#C264FF` Magenta, `#ff3ea5` Pink |
| `#gaming` | dunkel (`#060810`) | `#33E7FF` Cyan, `#C264FF` Magenta, `#ff3ea5` Pink |
| `#unbesiegbar` | dunkel (`#1a0a2e`) | `#ffc94a` Gold, `#ff3ea5` Pink, `#fff8ec` Creme |

Radfahren und Raya bekommen bewusst kein Partikelfeld (Nutzerentscheidung) — das erspart auch die Kontrastfrage
aus Revision 1, da alle drei bespielten Sektionen dunkle Hintergründe haben und dieselbe helle, vivide Palette
überall gut sichtbar ist.

Dichte: **deutlich erhöht** nach Live-Feedback — an die Fläche der jeweiligen Sektion gekoppelt, gedeckelt auf
90–260 Partikel pro Instanz (vorher 40–70), um spürbar dichter zu wirken, ohne auf kleinen Viewports zu
überladen. Auf Geräten ohne feinen Zeiger (Touch) läuft nur die ambiente Drift, keine Pointer-Logik wird
gebunden.

## Integration & Fallbacks

- Je ein neuer Container `<div class="section-particles" id="…-particles-canvas" aria-hidden="true"></div>` wird
  in `index.html` **innerhalb** von `#hero`, `#gaming` und `#unbesiegbar` eingefügt (neben den bestehenden
  Deko-Elementen, vor `.story-inner`) — **kein** Eingriff in Radfahren/Raya oder in die bestehenden Deko-Elemente
  der drei bespielten Sektionen.
- **Ebenen-Reihenfolge:** `.section-particles` ist `position: absolute; inset: 0; z-index: 2` — liegt damit lokal
  über den Sektions-Hintergründen/Deko (`z-index: 0`/`1`), aber unter dem lesbaren Inhalt (`.story-inner`,
  `z-index: 3`) und unter der fixen Quicknav (`z-index: 100`). Da der Container jetzt ein normales Kind seiner
  `.story`-Sektion ist (nicht mehr `position: fixed` als Geschwister von `<body>`), ist diese Ebenen-Ordnung lokal
  eindeutig, ohne auf Stacking-Context-Feinheiten zwischen weit auseinanderliegenden DOM-Ästen angewiesen zu sein.
- `createParticleField` fügt pro Sektion einen eigenen `<canvas>` ein; die bestehenden Deko-Elemente bleiben
  komplett unangetastet. Bei `prefers-reduced-motion: reduce` oder wenn JS fehlschlägt, erscheint einfach kein
  zusätzlicher Layer — die Seite sieht exakt wie ohne das Feature aus (reiner Zugewinn, kein Rückschritt).
- Respektiert bestehende Konventionen aus `js/landing.js`:
  - `prefers-reduced-motion: reduce` → Canvas wird gar nicht gestartet.
  - `hover: hover` and `pointer: fine` (`hasFineCursor`) → steuert nur, ob Pointer-Events gebunden werden; der
    Canvas selbst läuft unabhängig davon (ambient) weiter.
- **Keine Kopplung an `setupScrollStory()`:** Jede der drei Instanzen wird einmalig mit ihrer festen Palette aus
  `SECTION_PARTICLE_CONFIG` initialisiert und reagiert nicht auf den `themeObserver`.
- **Performance:**
  - **`IntersectionObserver` pro Instanz** (wieder eingeführt in Revision 2) pausiert die `requestAnimationFrame`-
    Schleife, sobald die jeweilige Sektion den Viewport verlässt (mit etwas `rootMargin`-Vorlauf), und setzt sie
    beim Wiedereintritt fort — wichtig, weil die Container jetzt mit der Seite scrollen und die meiste Zeit
    außerhalb des sichtbaren Bereichs verbringen. Kombiniert mit der `visibilitychange`-Pause (Tab im Hintergrund)
    über ein gemeinsames `syncRunning()`.
  - Canvas-Auflösung an `devicePixelRatio` gekoppelt, gedeckelt auf 2x.
  - `ResizeObserver` pro Instanz hält Canvas-Größe und Partikelverteilung bei Größenänderung der jeweiligen
    Sektion konsistent.

## Testing

Keine automatisierte Test-Suite auf dieser Seite (reines HTML/CSS/JS, bisher ausschließlich visuell in der
Browser-Preview verifiziert — z. B. der magnetische CTA-Button, der Theme-Pulse). Verifikation manuell:

1. **Sichtprüfung:** Startseite lädt, Partikelfelder erscheinen in Hero, Gaming und Unbesiegbar, driften ambient;
   Radfahren und Raya bleiben unverändert ohne Partikel.
2. **Scrollt mit der Seite:** Durch eine bespielte Sektion scrollen und prüfen, dass sich das Partikelfeld wie ein
   Teil der Sektion mitbewegt (nicht wie ein auf dem Bildschirm stehen bleibendes Overlay).
3. **Maus-Interaktion inkl. gescrollter Zustand:** Cursor über eine Sektion bewegen → Partikel werden sanft
   abgestoßen und federn zurück. Zusätzlich testen, während die Seite mittig gescrollt ist (nicht nur ganz oben),
   um die Koordinatenumrechnung (siehe "Cursor-Abstoßung" oben) zu verifizieren.
4. **Farbe passend zur Sektion:** Hero/Gaming zeigen Cyan/Magenta/Pink, Unbesiegbar zeigt Gold/Pink/Creme.
5. **Reduced Motion:** `prefers-reduced-motion: reduce` in den DevTools simulieren → alle drei Canvas starten
   nicht, Seite sieht aus wie ohne das Feature.
6. **Touch/kein feiner Zeiger:** Viewport auf ein Mobile-Preset stellen → Partikel driften ambient, keine
   Pointer-Bindung.
7. **Lesbarkeit & Klickbarkeit:** Überschriften, CTAs und Quicknav-Links bleiben über der Partikel-Ebene scharf
   lesbar und normal klickbar (`pointer-events: none` greift).
8. **Pause außerhalb des Viewports:** Aus einer bespielten Sektion herausscrollen und prüfen, dass die jeweilige
   Animationsschleife pausiert (z. B. via Performance-Panel); beim Zurückscrollen läuft sie wieder an.
9. **Jank-Test:** Pro-Frame-`requestAnimationFrame`-Deltas über ~5s Beobachtung mitloggen, **p95/max bewerten,
   nie den Durchschnitts-FPS-Wert**. Zielwert: max < 50ms, auch bei der höheren Partikeldichte (90–260 pro
   Instanz) und aktiver Cursor-Abstoßung.
10. **Resize:** Fenstergröße ändern → Canvas und Partikelverteilung bleiben stimmig, keine verzerrte/abgeschnittene
    Fläche.

## Out of Scope

- Partikelfeld für Radfahren/Raya — bewusst ausgeschlossen (Nutzerentscheidung, Revision 2).
- Wiederverwendung des Moduls für weitere, eigenständige Instanzen außerhalb der Startseite — das Modul bleibt
  dafür generisch nutzbar, wird aber aktuell nur auf `index.html` verdrahtet.
- Echte Fluid-Simulation, WebGL/Three.js, GLTF-Assets oder Post-Processing-Effekte wie im Shopify-Original.
- GSAP/Lenis-Kamerafahrten oder generiertes Video-Footage (Scroll-Film-Ansatz) — passt nicht zum Umfang dieser
  Ergänzung und würde einen ganz eigenen, viel größeren Aufbau bedeuten.
