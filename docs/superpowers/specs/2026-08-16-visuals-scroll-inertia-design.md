# Visuals — Scroll-Trägheit am Desktop straffen

## Context

Der Nutzer meldete nach dem Live-Gang der Visuals-Seite: „läuft mobil
reibungslos, hängt am Desktop beim Scrollen immer ein bisschen hinterher."

Die Diagnose ergab **keinen Performance-Fehler**. Ein direkter Test des
Nutzers (Scrollleiste ziehen vs. Mausrad) hat das belegt: Beim Ziehen der
Scrollleiste ist die Seite smooth, beim Mausrad/Trackpad träge. Wäre die
Filmdarstellung selbst der Flaschenhals, wäre auch das Scrollleisten-Ziehen
träge gewesen.

Ursache ist eine bewusste, seit dem allerersten Entwurf der Seite eingebaute
Design-Entscheidung: `js/gaming-intro.js` bindet Lenis mit
`new Lenis({ lerp: 0.09, smoothWheel: true })` ein. `smoothWheel: true` fängt
jede Mausrad-/Trackpad-Eingabe ab und lässt die Seite dem Ziel nur mit `lerp`
Prozent der Reststrecke pro Bild folgen — das war als „filmische Trägheit"
gewollt, wirkt beim tatsächlichen Live-Test aber wie ein Fehler. Auf dem
Handy greift dieselbe Bremse laut Lenis' eigener Voreinstellung gar nicht
(`smoothTouch` bleibt aus), daher der Unterschied zum Desktop.

Durchgerechnet (Zeit bis die Seite zu 95 % am Ziel ist, bei 60 Bildern/Sekunde,
exponentielle Annäherung `current += (target - current) * lerp` pro Bild):

| lerp | erster Ausschlag nach einer Radumdrehung | Zeit bis „eingeholt" |
|---|---|---|
| 0,09 (bisher) | 9 % | ~530 ms |
| 0,35 (neu) | 35 % | ~115 ms |
| kein Lenis am Rad | 100 % | 0 ms — wie der Scrollleisten-Test |

Der Nutzer hat sich nach Vorlage dieser Zahlen für **0,35** entschieden: die
Trägheit bleibt spürbar filmisch, ist aber kaum noch als Verzögerung
wahrnehmbar.

## Änderung

Eine einzige Konstante in `js/gaming-intro.js`:

```js
var lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
```
wird zu
```js
var lenis = new Lenis({ lerp: 0.35, smoothWheel: true });
```

Sonst ändert sich nichts — `smoothWheel: true` bleibt, `smoothTouch` bleibt
unangetastet (Lenis-Standard, mobil weiterhin nativ), keine andere Datei ist
betroffen.

## Nicht-Ziele

- Keine Änderung an der Film-Engine, den Kapiteln oder dem mobilen Verhalten.
- Kein Wechsel auf `smoothWheel: false` — die filmische Trägheit soll spürbar
  bleiben, nur straffer sein.

## Verifikation

Nur über den echten lokalen Server (`mcp__Claude_Browser__preview_start` mit
`{"name":"gaming-intro"}`, dann `http://localhost:8843/visuals.html`, niemals
`file:///`). Prüfbar in dieser Umgebung: `window.GS_LENIS` existiert nach dem
Laden und sein internes `options.lerp` (bzw. der im Quelltext committete Wert)
ist `0.35`; keine JavaScript-Ausnahmen; `gaming.html` bleibt unberührt.

**Das eigentliche Ergebnis — wie sich das Scrollen anfühlt — kann nur der
Nutzer auf einem echten Desktop-Gerät beurteilen**, da diese Umgebung keine
Scroll-Bewegung darstellen kann.
