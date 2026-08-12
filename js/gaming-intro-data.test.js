const test = require("node:test");
const assert = require("node:assert/strict");
const { getTopGames, getAggregateStats } = require("./gaming-intro-data.js");

const FIXTURE = [
  { title: "Warframe", hours: 1425 },
  { title: "Delta Force", hours: 801 },
  { title: "Apex Legends", hours: 640 },
  { title: "Minecraft", hours: 12 },
];

test("getTopGames sortiert absteigend nach hours und begrenzt auf n", () => {
  const top = getTopGames(FIXTURE, 3);
  assert.deepEqual(top.map((g) => g.title), ["Warframe", "Delta Force", "Apex Legends"]);
});

test("getTopGames verändert das Original-Array nicht", () => {
  const before = FIXTURE.map((g) => g.title);
  getTopGames(FIXTURE, 3);
  assert.deepEqual(FIXTURE.map((g) => g.title), before);
});

test("getTopGames funktioniert mit weniger als n Spielen", () => {
  const top = getTopGames(FIXTURE.slice(0, 2), 3);
  assert.equal(top.length, 2);
});

test("getAggregateStats zählt Spiele und summiert Stunden", () => {
  const stats = getAggregateStats(FIXTURE);
  assert.equal(stats.count, 4);
  assert.equal(stats.totalHours, 1425 + 801 + 640 + 12);
});
