/**
 * GAMING HISTORY — Platzhalter-Daten
 * -----------------------------------------------------------
 * Jeder Eintrag = eine Karte auf gaming.html.
 * Ersetze die Werte durch deine echten Stats. Felder:
 *
 *  id        eindeutiger Schlüssel (keine Leerzeichen)
 *  title     Spielname
 *  cover     Pfad zu einem Cover-Bild, z.B. "assets/games/apex.jpg"
 *            (leer lassen "" -> es wird ein generiertes Monogramm gezeigt)
 *  accent    Hex-Farbe passend zum Spiel, fürs Kartenglow
 *  genre     kurzer Tag, z.B. "Battle Royale"
 *  status    "active" (spiele ich noch) | "retired" (früher gespielt)
 *  hours     Spielstunden (Zahl)
 *  rank      höchster/aktueller Rang als Text
 *  rankPct   0–100, wie weit der Rang-Balken gefüllt ist (grobe Einordnung)
 *  since     Jahr, seit dem gespielt wird
 *  highlight kurzer Satz: Bestleistung, Momente, o.ä.
 */
const GAMES = [
  {
    id: "apex",
    title: "Apex Legends",
    cover: "",
    accent: "#E2231A",
    genre: "Battle Royale",
    status: "active",
    hours: 620,
    rank: "Diamond III",
    rankPct: 78,
    since: "2021",
    highlight: "Höchster Rang: Diamond. Main: TBD — hier deinen Lieblings-Legend eintragen.",
  },
  {
    id: "warframe",
    title: "Warframe",
    cover: "",
    accent: "#8FA6C2",
    genre: "Looter-Shooter",
    status: "active",
    hours: 940,
    rank: "MR 24",
    rankPct: 85,
    since: "2019",
    highlight: "Über 900 Stunden im Origin System. Lieblings-Warframe hier ergänzen.",
  },
  {
    id: "deltaforce",
    title: "Delta Force",
    cover: "",
    accent: "#C99A45",
    genre: "Tactical Shooter",
    status: "active",
    hours: 210,
    rank: "Gold II",
    rankPct: 55,
    since: "2024",
    highlight: "Platzhalter-Stat — echten Rang & Lieblingsmodus ergänzen.",
  },
  {
    id: "deadlock",
    title: "Deadlock",
    cover: "",
    accent: "#9B4DFF",
    genre: "Hero Shooter / MOBA",
    status: "active",
    hours: 150,
    rank: "Ascendant",
    rankPct: 68,
    since: "2024",
    highlight: "Early-Access-Main. Lieblingscharakter hier eintragen.",
  },

  // Neues Spiel? Einfach ein Objekt nach diesem Schema kopieren
  // und hier in die Liste einfügen.
];
