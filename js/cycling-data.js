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
    "distanceKm": 380,
    "elevationM": 3200,
    "image": "",
    "description": "Mehrtägige Tour über die Grenze bis in die tschechische Hauptstadt. Eigentlich war Camping geplant, aber wir haben dann doch bei Vincenzo übernachtet, da wir am ersten Tag viel zu lang unterwegs waren.",
    "stravaUrl": "https://www.strava.com/athletes/128212099",
    "stravaEmbed": "",
    "komootUrl": "https://www.komoot.com/de-de/user/758104319088",
    "komootEmbed": ""
  },
  {
    "id": "amsterdam",
    "title": "Weimar nach Amsterdam",
    "type": "tour",
    "route": "Weimar → Amsterdam",
    "date": "Sommer 2024",
    "distanceKm": 650,
    "elevationM": 2800,
    "days": 6,
    "image": "",
    "description": "Die bisher längste Tour, quer durch Deutschland bis in die Niederlande. Hier Highlights, Übernachtungsorte und Eindrücke ergänzen.",
    "stravaUrl": "https://www.strava.com/athletes/128212099",
    "stravaEmbed": "",
    "komootUrl": "https://www.komoot.com/de-de/user/758104319088",
    "komootEmbed": ""
  },
  {
    "id": "tagestour-1",
    "title": "Tagestour Beispiel",
    "type": "day",
    "route": "Weimar-Runde",
    "date": "2024",
    "distanceKm": 85,
    "elevationM": 650,
    "days": 1,
    "image": "",
    "description": "Platzhalter für eine deiner Tagestouren — Titel, Strecke und Beschreibung anpassen.",
    "stravaUrl": "https://www.strava.com/athletes/128212099",
    "stravaEmbed": "",
    "komootUrl": "https://www.komoot.com/de-de/user/758104319088",
    "komootEmbed": ""
  }
];
