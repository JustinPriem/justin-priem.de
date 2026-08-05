/**
 * RAYA — Foto-Daten
 * -----------------------------------------------------------
 * Wird jetzt am bequemsten über den Admin-Bereich (admin/) gepflegt — der
 * lädt Fotos hoch nach assets/raya/ und schreibt den Eintrag automatisch
 * als Commit in genau diese Datei. Du kannst die Werte aber weiterhin auch
 * direkt hier von Hand anpassen.
 *
 * Felder:
 *  id        eindeutiger Schlüssel
 *  src       Pfad zum Bild, z.B. "assets/raya/2024-05-12.jpg" (leer = Platzhalter-Kachel)
 *  date      Datum im Format "YYYY-MM-DD" (wichtig fürs Sortieren!)
 *  caption   kurze Bildunterschrift (optional, kann leer sein "")
 */
const RAYA_PHOTOS = [
  { id: "r1", src: "", date: "2024-03-02", caption: "Erster Spaziergang im Frühling" },
  { id: "r2", src: "", date: "2024-05-18", caption: "" },
  { id: "r3", src: "", date: "2024-07-09", caption: "Abkühlung am See" },
  { id: "r4", src: "", date: "2024-09-21", caption: "" },
  { id: "r5", src: "", date: "2024-12-24", caption: "Weihnachten" },
  { id: "r6", src: "", date: "2025-02-14", caption: "" },
  { id: "r7", src: "", date: "2025-06-03", caption: "Radtour-Begleitung" },
  { id: "r8", src: "", date: "2025-08-01", caption: "" },
];
