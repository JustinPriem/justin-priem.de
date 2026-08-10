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
  },
  {
    "id": "f108159f-4608-4c0b-a3c7-fc4697349865",
    "title": "Battlefield Heroes",
    "genre": "Shooter",
    "status": "retired",
    "hours": 350,
    "since": "2010",
    "rank": "",
    "rankPct": 50,
    "accent": "#0b5c00",
    "highlight": "Mein erstes Speil in welchem ich wahrscheinlich mehrere hundert Spielstunden habe. Es müssten ca. 350 Spielstunden auf dem Laptop gewesen sein. Keine Ahnung wie ich damals das Top Leaderboard mit Mousepad erreicht habe^^",
    "cover": ""
  },
  {
    "id": "20762b66-727a-46dc-902f-a86810b5815d",
    "title": "CSGO",
    "genre": "Tactic Shooter",
    "status": "retired",
    "hours": 1078,
    "since": "2014",
    "rank": "LEM",
    "rankPct": 75,
    "accent": "#fbff00",
    "highlight": "",
    "cover": ""
  },
  {
    "id": "b1b12ff3-3f9f-43de-a2d8-ad2afa9d331f",
    "title": "Destiny 2",
    "genre": "Loot Shooter",
    "status": "retired",
    "hours": 729,
    "since": "2021",
    "rank": "Ascendant",
    "rankPct": 100,
    "accent": "#ffffff",
    "highlight": "Wunderschönes Spiel, Nächte langer Grind, viel Spaß in einer wunderschönen Fantasie-Welt.",
    "cover": ""
  },
  {
    "id": "e9b2525b-4a5e-45b6-9bf6-028d589918f0",
    "title": "COD-BO2",
    "genre": "Shooter",
    "status": "retired",
    "hours": 419,
    "since": "2014",
    "rank": "Nuklear",
    "rankPct": 100,
    "accent": "#ff6600",
    "highlight": "",
    "cover": ""
  },
  {
    "id": "aa348f3d-99de-46f8-9897-55b1acd3ad04",
    "title": "Brawlhalla",
    "genre": "Fighting Game",
    "status": "retired",
    "hours": 246,
    "since": "2020",
    "rank": "Gold Duo",
    "rankPct": 60,
    "accent": "#7dc733",
    "highlight": "",
    "cover": ""
  },
  {
    "id": "75b7cabd-8b37-4e9d-803b-a3caf6107ea6",
    "title": "Battlefield 6",
    "genre": "Shooter",
    "status": "retired",
    "hours": 137,
    "since": "2025",
    "rank": "100",
    "rankPct": 100,
    "accent": "#b30000",
    "highlight": "",
    "cover": ""
  },
  {
    "id": "3f23ca4a-59e3-4e0e-b526-1382dd07a40d",
    "title": "DC Universe Online",
    "genre": "MMORPG",
    "status": "retired",
    "hours": 60,
    "since": "2014",
    "rank": "",
    "rankPct": 0,
    "accent": "#878787",
    "highlight": "",
    "cover": ""
  },
  {
    "id": "55e61829-88be-451f-a4b1-d3f23982893b",
    "title": "THE FINALS",
    "genre": "Shooter",
    "status": "retired",
    "hours": 77,
    "since": "2024",
    "rank": "Diamond",
    "rankPct": 80,
    "accent": "#ff0000",
    "highlight": "",
    "cover": ""
  },
  {
    "id": "60efe423-a47f-4abc-9730-0644160582a8",
    "title": "Saints Row IV",
    "genre": "Coop",
    "status": "retired",
    "hours": 53,
    "since": "2016",
    "rank": "",
    "rankPct": 0,
    "accent": "#7300ff",
    "highlight": "",
    "cover": ""
  },
  {
    "id": "97deb5ee-6435-4502-9a70-35f220a7122f",
    "title": "Starbound",
    "genre": "Coop",
    "status": "retired",
    "hours": 49,
    "since": "2018",
    "rank": "",
    "rankPct": 0,
    "accent": "#832525",
    "highlight": "",
    "cover": ""
  },
  {
    "id": "ad930cfc-5c62-45e6-b0b0-83df30d77df6",
    "title": "Saints Row The Third",
    "genre": "Coop",
    "status": "retired",
    "hours": 42,
    "since": "2015",
    "rank": "",
    "rankPct": 0,
    "accent": "#4c00ff",
    "highlight": "",
    "cover": ""
  },
  {
    "id": "9fa37015-09cb-4bbe-a35a-457deff5b621",
    "title": "Garrys Mod",
    "genre": "Coop",
    "status": "retired",
    "hours": 37,
    "since": "2025",
    "rank": "",
    "rankPct": 0,
    "accent": "#ff8585",
    "highlight": "",
    "cover": ""
  },
  {
    "id": "3186bbed-f41b-4df4-99f6-bad40d56ecdf",
    "title": "Minecraft",
    "genre": "Craft Build",
    "status": "retired",
    "hours": 0,
    "since": "2012",
    "rank": "",
    "rankPct": 0,
    "accent": "#33ff5c",
    "highlight": "",
    "cover": ""
  },
  {
    "id": "130d2315-fad3-4228-8037-9bf4bad95882",
    "title": "Battlefield 1",
    "genre": "Shooter",
    "status": "retired",
    "hours": 56,
    "since": "2016",
    "rank": "",
    "rankPct": 0,
    "accent": "#949494",
    "highlight": "",
    "cover": ""
  },
  {
    "id": "9defe7db-0bdb-48ef-8ff4-dc52fbd324ca",
    "title": "Battlefield 2042",
    "genre": "Shooter",
    "status": "retired",
    "hours": 276,
    "since": "2021",
    "rank": "",
    "rankPct": 0,
    "accent": "#33e7ff",
    "highlight": "",
    "cover": ""
  },
  {
    "id": "043ef372-9b20-421f-bcb0-2abb8336293b",
    "title": "Fortnite",
    "genre": "Battle Royal",
    "status": "retired",
    "hours": 260,
    "since": "2018",
    "rank": "",
    "rankPct": 0,
    "accent": "#d3ff33",
    "highlight": "",
    "cover": ""
  },
  {
    "id": "fa555654-d07c-4e07-86f5-07acb6e2ba75",
    "title": "Paladins",
    "genre": "Hero Shooter",
    "status": "retired",
    "hours": 659,
    "since": "2016",
    "rank": "Master",
    "rankPct": 90,
    "accent": "#80f0ff",
    "highlight": "",
    "cover": ""
  }
];
