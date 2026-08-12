/**
 * GAMING SHOWPIECE — Datenlogik
 * -----------------------------------------------------------
 * Liest GAMES aus gaming-data.js NUR LESEND. Keine eigene
 * Datenhaltung — der Admin-Bereich bleibt einzige Quelle der
 * Wahrheit für Spiele-Inhalte.
 */

function getTopGames(games, n) {
  return [...games].sort((a, b) => b.hours - a.hours).slice(0, n);
}

function getAggregateStats(games) {
  return {
    count: games.length,
    totalHours: games.reduce((sum, g) => sum + g.hours, 0),
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getTopGames, getAggregateStats };
}
