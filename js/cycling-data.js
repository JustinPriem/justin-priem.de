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
 *  summary       kurzer Vorschautext für die Kartenübersicht
 *  description   ausführlicher Text, nur auf der Detailseite (tour.html) sichtbar
 *  stravaUrl / komootUrl   Fallback-Links, nur auf der Detailseite
 *  embeds        Liste von { type: "strava"|"komoot", label, code }, nur auf
 *                 der Detailseite sichtbar
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
    "summary": "Mehrtägige Tour über die Grenze bis in die tschechische Hauptstadt.",
    "description": "Mehrtägige Tour über die Grenze bis in die tschechische Hauptstadt. Eigentlich war Camping geplant, aber wir haben dann doch bei Vincenzo übernachtet, da wir am ersten Tag viel zu lang unterwegs waren.",
    "stravaUrl": "https://www.strava.com/activities/15262735608",
    "komootUrl": "https://www.komoot.com/de-de/tour/2444066877",
    "embeds": [
      {
        "type": "strava",
        "label": "Tag 1",
        "code": "<div class=\"strava-embed-placeholder\" data-embed-type=\"activity\" data-embed-id=\"15262735608\" data-style=\"standard\" data-from-embed=\"false\" data-token=\"QDMWjLrTFt8Ch598gYbmjIgmkvuGSjABbOGuRwmfct0\"></div>"
      },
      {
        "type": "strava",
        "label": "Tag 2",
        "code": "<div class=\"strava-embed-placeholder\" data-embed-type=\"activity\" data-embed-id=\"15245411532\" data-style=\"standard\" data-from-embed=\"false\" data-token=\"Fnkp8MYEtboHl9paow2l2hBRT2NQdr4IvGHZVLDee-o\"></div>"
      }
    ]
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
    "summary": "Die bisher längste Tour, quer durch Deutschland bis in die Niederlande.",
    "description": "Die bisher längste Tour, quer durch Deutschland bis in die Niederlande. Erster Tag auf dem FKK Camping Platz, zweiter Notgedrungen im Hotel aufgrund eines Unwetters und anschließend im Hotel in Prag geschlafen. Am letzten Tag 260km von Deutschland über die Grenze bis nach Amsterdam.",
    "stravaUrl": "https://www.strava.com/activities/18723116349",
    "komootUrl": "https://www.komoot.com/de-de/tour/3002629882",
    "embeds": [
      {
        "type": "strava",
        "label": "Tag 1",
        "code": "<div class=\"strava-embed-placeholder\" data-embed-type=\"activity\" data-embed-id=\"18693817681\" data-style=\"standard\" data-from-embed=\"false\" data-token=\"KvyYK0dCEliFFD0oJT710swkuT1DAvnxup3VQWj2oCU\"></div>"
      },
      {
        "type": "strava",
        "label": "Tag 2",
        "code": "<div class=\"strava-embed-placeholder\" data-embed-type=\"activity\" data-embed-id=\"18781711374\" data-style=\"standard\" data-from-embed=\"false\" data-token=\"MUSrJKOBW_fuGJwsgttbKNXmjcfu37q1aueC28EOzxo\"></div>"
      },
      {
        "type": "strava",
        "label": "Tag 3",
        "code": "<div class=\"strava-embed-placeholder\" data-embed-type=\"activity\" data-embed-id=\"18723116349\" data-style=\"standard\" data-from-embed=\"false\" data-token=\"g_cH0X_7i1CC8kwMdLqWRGfZNx2FNsbtxGTEtTP4jsY\"></div>"
      }
    ]
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
    "summary": "Tagestour zur Bleilochtalsperre.",
    "description": "Platzhalter für eine deiner Tagestouren — Titel, Strecke und Beschreibung anpassen.",
    "stravaUrl": "https://www.strava.com/activities/18349931780",
    "komootUrl": "https://www.komoot.com/de-de/tour/2934625578",
    "embeds": [
      {
        "type": "strava",
        "label": "",
        "code": "<div class=\"strava-embed-placeholder\" data-embed-type=\"activity\" data-embed-id=\"18349931780\" data-style=\"standard\" data-from-embed=\"false\" data-token=\"yaHNpV-7D_VTIIfkR37qaa0sltZYjewXyPGYbW9XmyY\"></div>"
      }
    ]
  }
];
