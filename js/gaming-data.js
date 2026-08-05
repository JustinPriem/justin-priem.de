/**
 * GAMING HISTORY — Daten
 * -----------------------------------------------------------
 * Wird über den Admin-Bereich (admin/) gepflegt — kann aber auch
 * direkt von Hand angepasst werden. Felder:
 *  id        eindeutiger Schlüssel
 *  title     Spielname
 *  cover     Pfad zu einem Cover-Bild, z.B. "assets/games/apex.jpg" (leer = Monogramm)
 *  accent    Hex-Farbe fürs Kartenglow
 *  genre     kurzer Tag, z.B. "Battle Royale"
 *  status    "active" | "retired"
 *  hours     Spielstunden (Zahl)
 *  rank      Rang als Text
 *  rankPct   0–100, wie weit der Rang-Balken gefüllt ist
 *  since     Jahr, seit dem gespielt wird
 *  highlight kurzer Highlight-Satz
 */
const GAMES = [
  {
    "id": "warframe",
    "title": "Warframe",
    "cover": "",
    "accent": "#8FA6C2",
    "genre": "Looter-Shooter",
    "status": "active",
    "hours": 940,
    "rank": "MR 24",
    "rankPct": 85,
    "since": "2019",
    "highlight": "Über 900 Stunden im Origin System. Lieblings-Warframe hier ergänzen."
  },
  {
    "id": "deltaforce",
    "title": "Delta Force",
    "cover": "",
    "accent": "#C99A45",
    "genre": "Tactical Shooter",
    "status": "active",
    "hours": 210,
    "rank": "Gold II",
    "rankPct": 55,
    "since": "2024",
    "highlight": "Platzhalter-Stat — echten Rang & Lieblingsmodus ergänzen."
  },
  {
    "id": "deadlock",
    "title": "Deadlock",
    "cover": "",
    "accent": "#9B4DFF",
    "genre": "Hero Shooter / MOBA",
    "status": "active",
    "hours": 150,
    "rank": "Ascendant",
    "rankPct": 68,
    "since": "2024",
    "highlight": "Early-Access-Main. Lieblingscharakter hier eintragen."
  },
  {
    "id": "765e3f50-ba5d-4512-91c9-0d3d3d7a17c8",
    "title": "Apex Legends",
    "genre": "Battle Royal",
    "status": "retired",
    "hours": 2045,
    "since": "",
    "rank": "Master",
    "rankPct": 90,
    "accent": "#ff0000",
    "highlight": "Einer meiner absoluten Lieblingsspiele - 1968 Spielstunden über EA, weiter laufend auf Steam. Ich war mehrere Seasons Master.",
    "cover": "assets/games/1785960721930-apex-rank.png"
  }
];
