# Gaming Deep-Dive Landing — Design

## Context

`gaming.html` (Gaming History) ist heute eine funktionale, aber nüchterne Seite:
ein kurzer HUD-Hero (Titel + zwei Kennzahlen) gefolgt direkt vom filterbaren
Spiele-Grid, das aus `js/gaming-data.js` gerendert wird. Der Nutzer möchte
davor eine eigenständige, wirklich beeindruckende Sci-Fi-Landingpage — "richtig
episch, futuristisch" — die als filmisches Intro dient, bevor man ins normale
Archiv (`gaming.html`) wechselt. Zwei kürzlich installierte Fähigkeiten sollen
das tragen: die `scroll-film-studio`-Skill (scroll-gescrubbte Ein-Kamerafahrt-
Websites) und ein Magnific-MCP-Connector (echte generierte Bilder statt reinem
Code).

Wichtige Rahmenbedingung: Spiele werden ausschließlich über den
Admin-Bereich gepflegt (siehe `js/gaming-data.js`, aktuell 45 Einträge und
wachsend). Die neue Seite darf diesen Datenfluss nicht umgehen oder duplizieren
— sie muss automatisch aktuell bleiben, ohne dass nach jeder Admin-Änderung
Code angefasst werden muss.

## Gewähltes Konzept: „Deep Dive"

Ein vertikaler Sinkflug durch den Void, gebaut mit der `scroll-film-studio`-
Skill (Lane B: Magnific-generierte Void-Artworks + GSAP/Lenis-Scroll-Scrub).
5 Akte, alle scroll-gesteuert:

1. **Oberfläche** — Titel „JUSTIN PRIEM // GAMING LOG" im Sternfeld, leichter
   Parallax, keine Interaktion nötig um den Einstieg zu verstehen.
2. **Tiefe 01–03** — die drei Spiele mit den meisten Stunden aus
   `GAMES` (siehe Datenfluss unten) erscheinen nacheinander als
   Sonar-Ping/HUD-Karte (Titel, Genre, Stunden, Rang), mit je einem
   Magnific-generierten Void-Hintergrund. Die Kamera "sinkt" optisch tiefer,
   Farbverlauf wandert Cyan-Void → Magenta-Void → tieferes Violett
   (Anlehnung an die bestehende `--cyan`/`--magenta`/`--amber`-Palette aus
   `css/gaming.css`).
3. **Kern** — kurze Verdichtung der Gesamtwerte (Anzahl Spiele, Stunden
   gesamt — dieselben Kennzahlen, die heute schon im `gaming.html`-Hero
   stehen).
4. **Portal** — CTA-Button „Vollständiges Archiv betreten" verlinkt auf
   `gaming.html`.

## Architektur

Neue, eigenständige Seite `gaming-intro.html` (Arbeitstitel), analog zu
`unbesiegbar.html` als weitgehend in sich geschlossenes Erlebnis, aber mit
gemeinsamem Footer/Socials wie die anderen Seiten:

```
gaming-intro.html      neue Seite, verlinkt von index.html + als Sci-Fi-Intro
css/gaming-intro.css    eigenes Theme (baut auf gaming.css-Palette auf)
js/gaming-intro.js      Scroll-Choreografie (GSAP/Lenis), liest GAMES read-only
assets/gaming-intro/    von Magnific generierte Void-Artworks (statisch
                        exportiert, nicht zur Laufzeit generiert)
```

`gaming.html` selbst bleibt unverändert — die neue Seite ist ein vorgelagertes
Erlebnis, kein Ersatz. `index.html` bekommt einen aktualisierten Link/Button
im Gaming-Kapitel, der auf `gaming-intro.html` statt direkt auf `gaming.html`
zeigt (Details/genauer Ort dieses Links folgen im Implementierungsplan).

## Datenfluss

`gaming-intro.html` bindet `js/gaming-data.js` genauso ein wie `gaming.html`
(`<script src="js/gaming-data.js">`), read-only. `js/gaming-intro.js`:

- sortiert `GAMES` nach `hours` absteigend, nimmt die Top 3 für die drei
  „Tiefen"
- berechnet dieselben Kennzahlen wie `gaming.js` heute (`GAMES.length`,
  Summe `hours`) für den „Kern"-Akt
- macht **keine** Schreibzugriffe und verändert `gaming-data.js` nirgends

Damit zieht die Intro-Seite automatisch nach, wenn im Admin-Bereich neue
Spiele hinzukommen oder sich Stunden ändern — kein manuelles Nachpflegen.

## Bildwelt (Magnific / Lane B)

Drei bis vier Hero-Artworks werden einmalig über den Magnific-Connector
generiert und als statische Bilddateien unter `assets/gaming-intro/`
abgelegt (nicht zur Laufzeit nachgeneriert — Ladezeit und Kosten bleiben
vorhersehbar):

- 1× Oberfläche/Titel-Void
- 1× pro Tiefen-Akt (3×), Farbverlauf wie oben beschrieben
- optional 1× Kern/Portal-Moment

Generierung, Sichtung und Auswahl der Bilder passiert im Implementierungs-
schritt, nicht in diesem Dokument.

## Bewegungsdesign

Umgesetzt über die `scroll-film-studio`-Skill-Patterns (GSAP ScrollTrigger +
Lenis Smooth-Scroll):

- Ein durchgehender Scroll-Track über die ganze Seite, kein Klick zum
  Weiterblättern nötig
- Pro Akt: Hintergrundbild faded/parallaxt ein, HUD-Karte scrubt mit
  Scroll-Fortschritt ein (Opacity/Translate), kein Autoplay unabhängig vom
  Scroll
- Letzter Akt: Portal-Button erscheint fixiert/zentriert, klar erkennbar als
  Ausstieg zu `gaming.html`

## Fehler- & Randfälle

- **Kein JavaScript / reduced motion:** Seite muss ohne GSAP nutzbar
  bleiben — mindestens Titel, die drei Top-Spiele und der Portal-Link
  müssen auch ganz ohne Animation lesbar/erreichbar sein (progressive
  enhancement, `prefers-reduced-motion` beachtet).
- **Weniger als 3 Spiele in `GAMES`:** Layout muss mit 1–2 Tiefen-Akten
  funktionieren, ohne leere/kaputte Sektionen zu zeigen (aktuell irrelevant,
  da 45 Spiele vorhanden, aber die Logik darf nicht hart auf „genau 3"
  angewiesen sein).
- **Fehlendes/verzögert ladendes Bild:** Fallback auf reinen Void-
  Farbverlauf (CSS-Gradient aus der bestehenden Palette), Seite darf nicht
  auf ein Bild „warten".

## Testing/Verifikation

- Lokal im Browser öffnen (`gaming-intro.html` direkt, kein Server nötig,
  wie der Rest der Seite)
- Scroll-Verhalten in Chrome/Edge/Firefox prüfen, inkl. Mobile-Breite
  (Devtools-Emulation)
- `prefers-reduced-motion: reduce` in den Devtools simulieren und prüfen,
  dass Inhalt weiterhin lesbar ist
- Stichprobe: Admin-Bereich testweise ein neues Spiel mit sehr hohen Stunden
  hinzufügen (oder `GAMES` lokal temporär ändern) und prüfen, dass es in
  den Top-3-Tiefen erscheint, ohne Code in `gaming-intro.js` anzufassen

## Nicht-Ziele

- Keine Änderungen an `gaming.html`, `gaming.css`, `gaming.js` oder
  `gaming-data.js` selbst
- Keine Laufzeit-Bildgenerierung (Magnific wird einmalig beim Bauen genutzt,
  nicht bei jedem Seitenaufruf)
- Kein Ersatz für den Admin-Bereich — Inhalte bleiben dort gepflegt
