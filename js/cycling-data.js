/**
 * RADTOUREN — Daten
 * -----------------------------------------------------------
 * Wird über den Admin-Bereich (admin/) gepflegt — kann aber auch
 * direkt von Hand angepasst werden. Felder:
 *  id            eindeutiger Schlüssel
 *  title         Name der Tour
 *  type          "tour" (mehrtägig) | "day" (Tagestour)
 *  route         z.B. "Weimar → Prag"
 *  date          Datum/Zeitraum als Text
 *  distanceKm    Gesamtstrecke in km
 *  elevationM    Höhenmeter
 *  days          Anzahl Tage
 *  image         Pfad zu einem Foto (leer = generiertes Höhenprofil)
 *  description   kurzer Text über die Tour
 *  stravaUrl / stravaEmbed / komootUrl / komootEmbed
 */
const TOURS = [
  {
    "id": "prag",
    "title": "Radtour Prag",
    "route": "Bad Berka→ Prag",
    "type": "tour",
    "date": "Sommer 2025",
    "days": 2,
    "distanceKm": 340,
    "elevationM": 3827,
    "image": "assets/cycling/1785961653822-Prag.png",
    "description": "Mehrtägige Tour über die Grenze bis in die tschechische Hauptstadt. Eigentlich war Camping geplant, aber wir haben dann doch bei Vincenzo übernachtet, da wir am ersten Tag viel zu lang unterwegs waren.",
    "stravaUrl": "https://www.strava.com/activities/15262735608",
    "stravaEmbed": "",
    "komootUrl": "https://www.komoot.com/de-de/tour/2444066877",
    "komootEmbed": ""
  },
  {
    "id": "amsterdam",
    "title": "Radtour Amsterdam",
    "route": "Bad Berka → Amsterdam",
    "type": "tour",
    "date": "Sommer 2026",
    "days": 3,
    "distanceKm": 606,
    "elevationM": 2908,
    "image": "assets/cycling/1785961975338-Amsterdam.png",
    "description": "Die bisher längste Tour, quer durch Deutschland bis in die Niederlande. Erster Tag auf dem FKK Camping Platz, zweiter Notgedrungen im Hotel aufgrund eines Unwetters und anschließend im Hotel in Prag geschlafen. Am letzten Tag 260km von Deutschland über die Grenze bis nach Amsterdam.",
    "stravaUrl": "https://www.strava.com/activities/18723116349",
    "stravaEmbed": "",
    "komootUrl": "https://www.komoot.com/de-de/tour/3002629882",
    "komootEmbed": ""
  },
  {
    "id": "tagestour-1",
    "title": "Bleilochtalsperre",
    "route": "Bad Berka → Bleilochtalsperre",
    "type": "day",
    "date": "2026",
    "days": 1,
    "distanceKm": 85,
    "elevationM": 650,
    "image": "assets/cycling/1785962088464-Bleilochtalsperre.png",
    "description": "Platzhalter für eine deiner Tagestouren — Titel, Strecke und Beschreibung anpassen.",
    "stravaUrl": "https://www.strava.com/activities/18349931780",
    "stravaEmbed": "",
    "komootUrl": "https://www.komoot.com/de-de/tour/2934625578",
    "komootEmbed": ""
  }
];
