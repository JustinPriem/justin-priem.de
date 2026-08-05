/**
 * RADTOUREN — Daten
 * -----------------------------------------------------------
 * Wird jetzt am bequemsten über den Admin-Bereich (admin/) gepflegt — der
 * schreibt Änderungen automatisch als Commit in genau diese Datei. Du
 * kannst die Werte aber weiterhin auch direkt hier von Hand anpassen.
 *
 * Felder:
 *  id            eindeutiger Schlüssel
 *  title         Name der Tour
 *  type          "tour" (mehrtägig) | "day" (Tagestour)
 *  route         z.B. "Weimar → Prag"
 *  date          Datum/Zeitraum als Text, z.B. "Juni 2023"
 *  distanceKm    Gesamtstrecke in km (Zahl)
 *  elevationM    Höhenmeter (Zahl)
 *  days          Anzahl Tage (Zahl)
 *  image         Pfad zu einem Foto, z.B. "assets/cycling/prag-01.jpg" (leer = Platzhalter)
 *  summary       kurzer Vorschautext für die Kartenübersicht (cycling.html)
 *  description   ausführlicher Text — wird nur auf der Detailseite (tour.html) gezeigt
 *  stravaUrl     Link zur Strava-Aktivität (Fallback-Button auf der Detailseite)
 *  komootUrl     Link zur Komoot-Tour (Fallback-Button auf der Detailseite)
 *  embeds        Liste von Einbettungen, nur auf der Detailseite sichtbar. Beliebig
 *                 viele Einträge (z.B. wenn eine Tour über mehrere Strava-Aktivitäten
 *                 verteilt hochgeladen wurde). Jeder Eintrag:
 *                   type   "strava" | "komoot"
 *                   label  optionale Beschriftung, z.B. "Etappe 1"
 *                   code   der komplette Embed-Code von Strava/Komoot. Bei Strava
 *                          reicht der <div class="strava-embed-placeholder">-Teil,
 *                          das Lade-Script bindet die Detailseite selbst einmal ein.
 */
const TOURS = [
  {
    id: "prag",
    title: "Radtour Prag",
    route: "Bad Berka→ Prag",
    type: "tour",
    date: "Sommer 2025",
    days: 2,
    distanceKm: 340,
    elevationM: 3827,
    image: "assets/cycling/1785961653822-Prag.png",
    summary: "Mehrtägige Tour über die Grenze bis in die tschechische Hauptstadt.",
    description: "Mehrtägige Tour über die Grenze bis in die tschechische Hauptstadt. Eigentlich war Camping geplant, aber wir haben dann doch bei Vincenzo übernachtet, da wir am ersten Tag viel zu lang unterwegs waren.",
    stravaUrl: "https://www.strava.com/activities/15262735608",
    komootUrl: "https://www.komoot.com/de-de/tour/2444066877",
    embeds: [],
  },
  {
    id: "amsterdam",
    title: "Radtour Amsterdam",
    route: "Bad Berka → Amsterdam",
    type: "tour",
    date: "Sommer 2026",
    days: 3,
    distanceKm: 606,
    elevationM: 2908,
    image: "assets/cycling/1785961975338-Amsterdam.png",
    summary: "Die bisher längste Tour, quer durch Deutschland bis in die Niederlande.",
    description: "Die bisher längste Tour, quer durch Deutschland bis in die Niederlande. Erster Tag auf dem FKK Camping Platz, zweiter Notgedrungen im Hotel aufgrund eines Unwetters und anschließend im Hotel in Prag geschlafen. Am letzten Tag 260km von Deutschland über die Grenze bis nach Amsterdam.",
    stravaUrl: "https://www.strava.com/activities/18723116349",
    komootUrl: "https://www.komoot.com/de-de/tour/3002629882",
    embeds: [],
  },
  {
    id: "tagestour-1",
    title: "Bleilochtalsperre",
    route: "Bad Berka → Bleilochtalsperre",
    type: "day",
    date: "2026",
    days: 1,
    distanceKm: 85,
    elevationM: 650,
    image: "assets/cycling/1785962088464-Bleilochtalsperre.png",
    summary: "Tagestour zur Bleilochtalsperre.",
    description: "Platzhalter für eine deiner Tagestouren — Titel, Strecke und Beschreibung anpassen.",
    stravaUrl: "https://www.strava.com/activities/18349931780",
    komootUrl: "https://www.komoot.com/de-de/tour/2934625578",
    embeds: [],
  },

  // Neue Tour? Objekt kopieren und hier einfügen.
];
