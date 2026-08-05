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
    "genre": "Tactical Shooter",
    "status": "active",
    "hours": 801,
    "since": "2024",
    "rank": "DF Pinnacle",
    "rankPct": 100,
    "accent": "#c99a45",
    "highlight": "Platzhalter-Stat — echten Rang & Lieblingsmodus ergänzen.",
    "cover": ""
  },
  {
    "id": "deadlock",
    "title": "Deadlock",
    "genre": "Hero Shooter",
    "status": "active",
    "hours": 1075,
    "since": "2024",
    "rank": "Eternus I",
    "rankPct": 90,
    "accent": "#6edcf7",
    "highlight": "Maximaler Rang in der Beta vor dem Ranked Season Release: Eternus 1",
    "cover": "assets/games/1785960959171-deadlock-rank.png"
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
