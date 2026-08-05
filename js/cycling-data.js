/**
 * RADTOUREN — Platzhalter-Daten
 * -----------------------------------------------------------
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
 *  description   kurzer Text über die Tour
 *  stravaUrl     Link zur Strava-Aktivität/zum Segment (für den Button)
 *  stravaEmbed   Embed-Code-URL von Strava (siehe README) — leer lassen, wenn du (noch) keinen hast
 *  komootUrl     Link zur Komoot-Tour
 *  komootEmbed   Embed-URL von Komoot — leer lassen, wenn (noch) kein Embed genutzt wird
 */
const TOURS = [
  {
    id: "prag",
    title: "Weimar nach Prag",
    type: "tour",
    route: "Weimar → Prag",
    date: "Sommer 2023",
    distanceKm: 380,
    elevationM: 3200,
    days: 4,
    image: "",
    description: "Mehrtägige Tour über die Grenze bis in die tschechische Hauptstadt. Hier Highlights, Übernachtungsorte und Eindrücke ergänzen.",
    stravaUrl: "https://www.strava.com/athletes/128212099",
    stravaEmbed: "",
    komootUrl: "https://www.komoot.com/de-de/user/758104319088",
    komootEmbed: "",
  },
  {
    id: "amsterdam",
    title: "Weimar nach Amsterdam",
    type: "tour",
    route: "Weimar → Amsterdam",
    date: "Sommer 2024",
    distanceKm: 650,
    elevationM: 2800,
    days: 6,
    image: "",
    description: "Die bisher längste Tour, quer durch Deutschland bis in die Niederlande. Hier Highlights, Übernachtungsorte und Eindrücke ergänzen.",
    stravaUrl: "https://www.strava.com/athletes/128212099",
    stravaEmbed: "",
    komootUrl: "https://www.komoot.com/de-de/user/758104319088",
    komootEmbed: "",
  },
  {
    id: "tagestour-1",
    title: "Tagestour Beispiel",
    type: "day",
    route: "Weimar-Runde",
    date: "2024",
    distanceKm: 85,
    elevationM: 650,
    days: 1,
    image: "",
    description: "Platzhalter für eine deiner Tagestouren — Titel, Strecke und Beschreibung anpassen.",
    stravaUrl: "https://www.strava.com/athletes/128212099",
    stravaEmbed: "",
    komootUrl: "https://www.komoot.com/de-de/user/758104319088",
    komootEmbed: "",
  },

  // Neue Tour? Objekt kopieren und hier einfügen.
];
