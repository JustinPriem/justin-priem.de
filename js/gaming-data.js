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
    "genre": "Looter-Shooter",
    "status": "retired",
    "hours": 1425,
    "since": "2013",
    "rank": "MR 25",
    "rankPct": 100,
    "accent": "#0049a3",
    "highlight": "Die schönste Fantasie Welt die man erschaffen konnte. Es war schön sich darin zu vertiefen und die komplexen Systeme zu erkunden. Warframe war eine ganze Zeit mein absolutes Top-Game. Ich habe ca. 1400h Spielzeit und bin Mastery Rank 25 (damaliges maximum). Es hat mich in der Zeit von 2014 bis 2018 begleitet.",
    "cover": "assets/games/1785961240376-warframe-rank.jpg"
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
  },
  {
    "id": "73b6a225-73cd-4550-8957-2070f7f27f01",
    "title": "Planetside 2",
    "genre": "MMO Shooter",
    "status": "retired",
    "hours": 1845,
    "since": "2012",
    "rank": "BR120",
    "rankPct": 100,
    "accent": "#9900ff",
    "highlight": "Damit hat alles so richtig begonnen - Planetside 2. Mit insgesamt 1845h Spielzeit eines meiner meist gespieltesten und vor allem vielleicht sogar mein Overall Lieblingsspiel. Vanu - BR103 / TR - BR45 / NC - BR120",
    "cover": ""
  }
];
