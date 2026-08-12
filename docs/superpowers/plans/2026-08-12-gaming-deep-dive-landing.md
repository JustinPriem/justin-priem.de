# Gaming Deep-Dive Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `gaming-intro.html`, a new scroll-scrubbed Sci-Fi "Deep Dive" landing page that sits in front of the existing `gaming.html` archive, using Magnific-generated Void artwork and GSAP/Lenis scroll choreography, driven read-only by the existing `GAMES` data.

**Architecture:** A single new static page (`gaming-intro.html` + `css/gaming-intro.css` + `js/gaming-intro.js`) following the same no-build vanilla HTML/CSS/JS pattern as the rest of the site. Five pinned full-viewport "acts" (Surface → 3× Depth → Core → Portal), each a GSAP ScrollTrigger pin/scrub scene over a static Magnific-generated background image. `js/gaming-intro.js` reads `GAMES` from the existing `js/gaming-data.js`, computes the top-3-by-hours and aggregate stats with pure functions, and renders them into the HUD cards. `gaming.html`/`css/gaming.css`/`js/gaming.js`/`js/gaming-data.js` are not touched.

**Tech Stack:** Vanilla HTML/CSS/JS (no bundler, matches the rest of the repo), GSAP 3 + ScrollTrigger + Lenis via CDN `<script>` tags (Lane A pure-code technique from the `scroll-film-studio` skill), Magnific MCP (`images_generate`, model `seedream-5-pro`) for the four static background artworks, Node's built-in `node:test`/`node:assert` for the pure-logic unit tests (no new dependency, no `package.json`).

## Global Constraints

- `gaming.html`, `css/gaming.css`, `js/gaming.js`, `js/gaming-data.js` stay unmodified — verify with `git diff --stat` before every commit in this plan.
- `js/gaming-intro.js` reads `GAMES` **read-only**. It never writes to `gaming-data.js` and never duplicates game content into `gaming-intro.html`/`.js` by hand.
- The three "Tiefen" acts are always the current top-3 games by `hours`, computed at page-load time — never hardcode game names/titles anywhere in `gaming-intro.*`.
- No runtime image generation. The four Magnific artworks are generated once (Task 2), saved as static files under `assets/gaming-intro/`, and referenced by fixed filename from then on.
- Respect `prefers-reduced-motion` and a GSAP/CDN-load failure: page must still show the title, the top-3 games and the portal link without any pin/scrub animation (see Task 5). This site has no no-JS fallback anywhere else (`gaming.html` also requires JS to render), so "works without GSAP" — not "works without JavaScript at all" — is the actual bar here.
- Before any code change in this repo: `git fetch origin && git log HEAD..origin/main --oneline` — the admin panel commits directly to `main` via the GitHub API, so pull first and never overwrite a content commit that landed while this plan was being executed.
- **Every task below ends with a local `git commit`, but `git push` is forbidden until the user has reviewed the finished page locally and explicitly approved going live** (Task 7). This overrides the usual "commit and push immediately" habit for this feature only.
- No `npm install` / build step anywhere in this plan — plain files only, same as the rest of the site.

---

### Task 1: Data logic — top-3 games and aggregate stats

**Files:**
- Create: `js/gaming-intro.js` (pure-logic section only for this task)
- Test: `js/gaming-intro.test.js`

**Interfaces:**
- Produces: `getTopGames(games, n)` → new array, sorted by `hours` descending, length `min(n, games.length)`, does not mutate `games`.
- Produces: `getAggregateStats(games)` → `{ count: number, totalHours: number }`.
- Both exported via `module.exports` when `module` exists (dual browser-global / Node-requireable, same pattern the rest of the site does not need to follow elsewhere but is required here so the logic is unit-testable without a bundler).

- [ ] **Step 1: Write the failing test**

```js
// js/gaming-intro.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { getTopGames, getAggregateStats } = require("./gaming-intro.js");

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test js/gaming-intro.test.js`
Expected: FAIL — `Cannot find module './gaming-intro.js'` (file doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

```js
// js/gaming-intro.js
/**
 * GAMING INTRO — Deep-Dive-Landing
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test js/gaming-intro.test.js`
Expected: PASS — 4 tests, 0 failures.

- [ ] **Step 5: Commit (local only, do not push)**

```bash
git add js/gaming-intro.js js/gaming-intro.test.js
git commit -m "Add gaming-intro data logic (top-3 games, aggregate stats)"
```

---

### Task 2: Generate the four Magnific Void artworks

**Files:**
- Create: `assets/gaming-intro/surface.jpg`
- Create: `assets/gaming-intro/depth-1-cyan.jpg`
- Create: `assets/gaming-intro/depth-2-magenta.jpg`
- Create: `assets/gaming-intro/depth-3-violet.jpg`

**Interfaces:**
- Produces: four static JPEG files at these exact paths — Task 3's CSS references them by these exact filenames.

This task is asset generation via the Magnific MCP tools, not code — verification is file existence + size, not a unit test.

- [ ] **Step 1: Confirm credits before spending**

Call `account_balance`. Confirm `credits.available` covers 4 generations at ~100 credits each (seedream-5-pro, 2k) — i.e. at least ~400 credits available. Do not proceed if the balance is insufficient; tell the user instead of silently switching models.

- [ ] **Step 2: Generate `surface.jpg`**

Call `images_generate` with:
```json
{
  "prompt": "Cinematic ultra-wide deep-space void, vast dark starfield with faint cyan and violet nebula wisps, extremely minimal composition, huge empty negative space center-left for a text overlay, a few tiny distant floating geometric HUD fragments, moody sci-fi atmosphere, near-black navy background, thin cyan light rim glowing far in the distance, photorealistic space render, no text, no logos, no watermark, 16:9 cinematic widescreen",
  "mode": "seedream-5-pro",
  "aspectRatio": "16:9",
  "resolution": "2k",
  "count": 1
}
```
Poll with `creations_wait` until terminal, then `creations_get` for the full-res `url`. Download it (e.g. `curl -L "<url>" -o assets/gaming-intro/surface.jpg` or `Invoke-WebRequest -Uri "<url>" -OutFile assets\gaming-intro\surface.jpg`).

- [ ] **Step 3: Generate `depth-1-cyan.jpg`**

```json
{
  "prompt": "Cinematic deep-space void scene, descending into a vast dark trench of stars, glowing cyan energy currents drifting through the darkness, a small distant glowing artifact silhouette suspended in the void, faint sonar-ping light rings expanding outward, dark navy background, atmospheric haze, empty negative space on the RIGHT side of frame for a HUD card overlay, photorealistic sci-fi render, no text, no logos, no watermark, 16:9 cinematic widescreen",
  "mode": "seedream-5-pro",
  "aspectRatio": "16:9",
  "resolution": "2k",
  "count": 1
}
```
Same wait/get/download flow → `assets/gaming-intro/depth-1-cyan.jpg`.

- [ ] **Step 4: Generate `depth-2-magenta.jpg`**

```json
{
  "prompt": "Cinematic deep-space void scene, sinking further into an even darker trench of stars, glowing magenta energy currents and drifting embers, a small distant glowing artifact silhouette suspended in the void, faint sonar-ping light rings, deep near-black background, empty negative space on the LEFT side of frame for a HUD card overlay, photorealistic sci-fi render, no text, no logos, no watermark, 16:9 cinematic widescreen",
  "mode": "seedream-5-pro",
  "aspectRatio": "16:9",
  "resolution": "2k",
  "count": 1
}
```
Same flow → `assets/gaming-intro/depth-2-magenta.jpg`.

- [ ] **Step 5: Generate `depth-3-violet.jpg`**

```json
{
  "prompt": "Cinematic deep-space void scene, the deepest point of the descent, dark violet and deep purple energy currents converging toward a bright glowing point at the center like a reactor core, radial symmetric composition, empty negative space on the RIGHT side of frame for a HUD card overlay, photorealistic sci-fi render, no text, no logos, no watermark, 16:9 cinematic widescreen",
  "mode": "seedream-5-pro",
  "aspectRatio": "16:9",
  "resolution": "2k",
  "count": 1
}
```
Same flow → `assets/gaming-intro/depth-3-violet.jpg`. (This image is reused for the Core act with a darker CSS filter — no fifth image needed.)

- [ ] **Step 6: Verify all four files**

```bash
ls -la assets/gaming-intro/
```
Expected: all four `.jpg` files present, each larger than ~50KB (a 2k JPEG should not be near-empty). If any file is 0 bytes or missing, the download failed — retry the download step, do not retry the generation (don't spend credits twice for a download bug).

- [ ] **Step 7: Commit (local only, do not push)**

```bash
git add assets/gaming-intro/
git commit -m "Add Magnific-generated Void artwork for gaming-intro"
```

---

### Task 3: Page skeleton and CSS theme

**Files:**
- Create: `gaming-intro.html`
- Create: `css/gaming-intro.css`

**Interfaces:**
- Produces: the exact section IDs `act-surface`, `act-depth-1`, `act-depth-2`, `act-depth-3`, `act-core`, `act-portal`, and mount points `depth-card-1`, `depth-card-2`, `depth-card-3`, `core-stats` — Task 4's render functions and Task 5's ScrollTrigger setup target these by ID.
- Consumes: `assets/gaming-intro/{surface,depth-1-cyan,depth-2-magenta,depth-3-violet}.jpg` from Task 2.

- [ ] **Step 1: Write `gaming-intro.html`**

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gaming — Deep Dive — Justin Priem</title>
<meta name="description" content="Ein filmischer Sinkflug durch Justin Priems Gaming-Geschichte, bevor es ins vollständige Archiv geht.">
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
<link rel="shortcut icon" href="assets/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/gaming-intro.css">
</head>
<body>

<a class="gi-back" href="index.html">← justin-priem.de</a>

<div class="gi-track" id="gi-track">

  <section class="gi-act gi-act--surface" id="act-surface">
    <div class="gi-bg" aria-hidden="true"></div>
    <div class="gi-content">
      <p class="gi-eyebrow">// TIEFENSCAN GESTARTET</p>
      <h1><span class="gi-word">JUSTIN PRIEM</span><br><span class="gi-word">GAMING LOG</span></h1>
      <span class="gi-scroll-cue" aria-hidden="true">scrollen zum Sinkflug</span>
    </div>
  </section>

  <section class="gi-act gi-act--depth gi-act--side-right" id="act-depth-1">
    <div class="gi-bg" aria-hidden="true"></div>
    <div class="gi-hud-card" id="depth-card-1"></div>
  </section>

  <section class="gi-act gi-act--depth gi-act--side-left" id="act-depth-2">
    <div class="gi-bg" aria-hidden="true"></div>
    <div class="gi-hud-card" id="depth-card-2"></div>
  </section>

  <section class="gi-act gi-act--depth gi-act--side-right" id="act-depth-3">
    <div class="gi-bg" aria-hidden="true"></div>
    <div class="gi-hud-card" id="depth-card-3"></div>
  </section>

  <section class="gi-act gi-act--core" id="act-core">
    <div class="gi-bg" aria-hidden="true"></div>
    <div class="gi-content">
      <p class="gi-eyebrow">// KERN ERREICHT</p>
      <div class="gi-core-stats" id="core-stats"></div>
    </div>
  </section>

  <section class="gi-act gi-act--portal" id="act-portal">
    <div class="gi-bg" aria-hidden="true"></div>
    <div class="gi-content">
      <a class="gi-portal-btn" href="gaming.html">Vollständiges Archiv betreten <i aria-hidden="true">→</i></a>
    </div>
  </section>

</div>

<footer id="site-footer"></footer>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="js/socials.js"></script>
<script src="js/gaming-data.js"></script>
<script src="js/gaming-intro.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write `css/gaming-intro.css`**

```css
:root {
  --gi-bg: #05060c;
  --gi-cyan: #33E7FF;
  --gi-magenta: #C264FF;
  --gi-violet: #6C2BD9;
  --gi-amber: #FFB020;
  --gi-text: #E8F6FF;
  --gi-text-dim: #8895A8;
  --footer-line: rgba(51, 231, 255, .14);
}

body {
  background: var(--gi-bg);
  color: var(--gi-text);
  font-family: "Chakra Petch", sans-serif;
}

.gi-back {
  position: fixed; top: 1.6rem; left: 1.6rem; z-index: 20;
  font-family: "JetBrains Mono", monospace;
  font-size: .78rem;
  color: var(--gi-text-dim);
  letter-spacing: .03em;
  transition: color .2s ease;
}
.gi-back:hover { color: var(--gi-cyan); }

.gi-act {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: var(--gi-bg);
}

.gi-bg {
  position: absolute; inset: 0;
  background-size: cover;
  background-position: center;
  filter: saturate(1.05);
}
.gi-bg::after {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(5,6,12,.5), rgba(5,6,12,.78));
}

/* Jede Regel listet das Foto UND einen Void-Gradient-Fallback in einem
   background-image (kommasepariert) — lädt das Bild nicht/verzögert,
   bleibt sofort ein passend eingefärbter Void-Hintergrund sichtbar,
   kein Warten, kein blankes Feld. */
#act-surface .gi-bg { background-image: url("assets/gaming-intro/surface.jpg"), radial-gradient(60% 60% at 30% 40%, rgba(51,231,255,.12), var(--gi-bg) 70%); }
#act-depth-1 .gi-bg { background-image: url("assets/gaming-intro/depth-1-cyan.jpg"), radial-gradient(60% 60% at 70% 50%, rgba(51,231,255,.16), var(--gi-bg) 70%); }
#act-depth-2 .gi-bg { background-image: url("assets/gaming-intro/depth-2-magenta.jpg"), radial-gradient(60% 60% at 30% 50%, rgba(194,100,255,.16), var(--gi-bg) 70%); }
#act-depth-3 .gi-bg { background-image: url("assets/gaming-intro/depth-3-violet.jpg"), radial-gradient(60% 60% at 70% 50%, rgba(108,43,217,.2), var(--gi-bg) 70%); }
#act-core .gi-bg { background-image: url("assets/gaming-intro/depth-3-violet.jpg"), radial-gradient(50% 50% at 50% 50%, rgba(108,43,217,.22), var(--gi-bg) 70%); filter: brightness(.55) saturate(1.2); }
#act-portal .gi-bg { background: radial-gradient(circle at 50% 50%, rgba(51,231,255,.16), transparent 70%), var(--gi-bg); }
#act-portal .gi-bg::after { display: none; }

.gi-content {
  position: relative; z-index: 2;
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
  padding: 0 1.6rem;
}

.gi-eyebrow {
  font-family: "JetBrains Mono", monospace;
  font-size: .78rem;
  color: var(--gi-cyan);
  letter-spacing: .1em;
  margin: 0 0 1rem;
}

.gi-act--surface h1 {
  font-size: clamp(2.2rem, 7vw, 4.2rem);
  font-weight: 700;
  line-height: 1.15;
  margin: 0 0 1.4rem;
  text-shadow: 0 0 30px rgba(51,231,255,.3);
}
.gi-word { display: inline-block; }

.gi-scroll-cue {
  display: inline-block;
  font-family: "JetBrains Mono", monospace;
  font-size: .75rem;
  color: var(--gi-text-dim);
  letter-spacing: .06em;
}

.gi-hud-card {
  position: relative; z-index: 2;
  max-width: 400px;
  padding: 1.6rem 1.8rem;
  background: rgba(6,8,16,.6);
  border: 1px solid rgba(51,231,255,.25);
  border-radius: 14px;
  backdrop-filter: blur(6px);
}
.gi-act--side-right .gi-hud-card { margin-left: auto; margin-right: 8vw; }
.gi-act--side-left .gi-hud-card { margin-right: auto; margin-left: 8vw; }

.gi-card-eyebrow {
  font-family: "JetBrains Mono", monospace;
  font-size: .68rem;
  color: var(--gi-cyan);
  letter-spacing: .08em;
  margin: 0 0 .6rem;
}
.gi-hud-card h2 { margin: 0 0 1rem; font-size: 1.5rem; }
.gi-card-stats { display: flex; gap: 1.6rem; }
.gi-card-label {
  display: block;
  font-family: "JetBrains Mono", monospace;
  font-size: .68rem;
  color: var(--gi-text-dim);
}
.gi-card-value {
  display: block;
  font-family: "JetBrains Mono", monospace;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gi-amber);
}

.gi-core-stats { display: flex; gap: 3rem; justify-content: center; }
.gi-core-stat { display: flex; flex-direction: column; align-items: center; }
.gi-core-value {
  font-family: "JetBrains Mono", monospace;
  font-size: 2.6rem;
  font-weight: 600;
  color: var(--gi-cyan);
}
.gi-core-label {
  font-family: "JetBrains Mono", monospace;
  font-size: .72rem;
  color: var(--gi-text-dim);
  letter-spacing: .05em;
}

.gi-portal-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: .6rem;
  padding: 1.1rem 2.2rem;
  border-radius: 999px;
  font-family: "JetBrains Mono", monospace;
  font-size: .95rem;
  font-weight: 600;
  color: var(--gi-bg);
  background: linear-gradient(90deg, var(--gi-cyan), var(--gi-magenta));
  box-shadow: 0 0 40px rgba(51,231,255,.35);
  transition: transform .2s ease, box-shadow .2s ease;
}
.gi-portal-btn:hover { transform: translateY(-2px); box-shadow: 0 0 55px rgba(51,231,255,.5); }

/* Reduced-motion / GSAP-unavailable fallback: acts stack normally, nothing stays pinned or hidden */
.gi-static .gi-act { min-height: auto; padding: 6rem 1.6rem; }
.gi-static .gi-content,
.gi-static .gi-hud-card { opacity: 1 !important; transform: none !important; }

/* Footer im Dark-HUD-Look, wie gaming.css */
.footer-name { color: var(--gi-text); font-family: "Chakra Petch", sans-serif; }
.footer-tag, .social-link { color: var(--gi-text-dim); font-family: "JetBrains Mono", monospace; }
.social-link:hover { color: var(--gi-cyan); border-color: var(--gi-cyan); }

@media (max-width: 720px) {
  .gi-act--side-right .gi-hud-card,
  .gi-act--side-left .gi-hud-card { margin-left: auto; margin-right: auto; }
  .gi-core-stats { gap: 1.6rem; }
}
```

- [ ] **Step 3: Manual verification**

Open `gaming-intro.html` directly in a browser (double-click, or via the `mcp__Claude_Browser` tool with a `file:///` URL). Confirm: the surface act shows the title over the surface artwork, the three depth acts show their artwork with an empty HUD card outline (content comes in Task 4), the core act shows the reused violet artwork darker, the portal act shows the gradient + CTA button linking to `gaming.html`. No console errors about missing files.

- [ ] **Step 4: Commit (local only, do not push)**

```bash
git add gaming-intro.html css/gaming-intro.css
git commit -m "Add gaming-intro page skeleton and CSS theme"
```

---

### Task 4: Render top-3 HUD cards and core stats

**Files:**
- Modify: `js/gaming-intro.js` (append render functions + boot code)

**Interfaces:**
- Consumes: `getTopGames(games, n)`, `getAggregateStats(games)` from Task 1; `GAMES` global from `js/gaming-data.js`; DOM IDs from Task 3 (`depth-card-1/2/3`, `core-stats`, `act-depth-1/2/3`).
- Produces: `renderDepthCards(topGames)`, `renderCoreStats(stats)`, `hideUnusedDepthActs(topGamesCount)` — Task 5 calls these (via the shared boot function) before setting up ScrollTrigger, so no pin gets created for a removed act.

- [ ] **Step 1: Append render logic to `js/gaming-intro.js`**

```js
function monogram(title) {
  return title.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();
}

function depthCardTemplate(game) {
  return `
    <p class="gi-card-eyebrow">// SIGNAL ERFASST — ${monogram(game.title)}</p>
    <h2>${game.title}</h2>
    <div class="gi-card-stats">
      <div>
        <span class="gi-card-label">Spielzeit</span>
        <span class="gi-card-value">${game.hours.toLocaleString("de-DE")} h</span>
      </div>
      <div>
        <span class="gi-card-label">Rang</span>
        <span class="gi-card-value">${game.rank}</span>
      </div>
    </div>
  `;
}

function renderDepthCards(topGames) {
  topGames.forEach((game, i) => {
    const mount = document.getElementById(`depth-card-${i + 1}`);
    if (mount) mount.innerHTML = depthCardTemplate(game);
  });
}

function renderCoreStats(stats) {
  const mount = document.getElementById("core-stats");
  if (!mount) return;
  mount.innerHTML = `
    <div class="gi-core-stat">
      <span class="gi-core-value">${stats.count}</span>
      <span class="gi-core-label">Spiele erfasst</span>
    </div>
    <div class="gi-core-stat">
      <span class="gi-core-value">${stats.totalHours.toLocaleString("de-DE")}</span>
      <span class="gi-core-label">Stunden gesamt</span>
    </div>
  `;
}

function hideUnusedDepthActs(topGamesCount) {
  for (let i = topGamesCount + 1; i <= 3; i++) {
    const act = document.getElementById(`act-depth-${i}`);
    if (act) act.remove();
  }
}

function renderApp() {
  const topGames = getTopGames(GAMES, 3);
  hideUnusedDepthActs(topGames.length);
  renderDepthCards(topGames);
  renderCoreStats(getAggregateStats(GAMES));
}
```

(`renderApp()` is not called yet — Task 5 wires it into `DOMContentLoaded` alongside the choreography setup, so both land in one coherent boot sequence.)

- [ ] **Step 2: Manual verification**

Open `gaming-intro.html` in a browser. Confirm the three depth HUD cards show the actual top-3 games from `js/gaming-data.js` by `hours` (cross-check against `gaming.html` sorted by "Spielzeit" — the top 3 there must match exactly), and the core act shows the same total game count and total hours as the `gaming.html` hero stats (`total-games`/`total-hours`). This is not callable yet from the page (`renderApp()` isn't wired to `DOMContentLoaded` until Task 5) — call `renderApp()` once from the browser devtools console to check the render output now, or proceed straight to Task 5 and verify there instead.

- [ ] **Step 3: Commit (local only, do not push)**

```bash
git add js/gaming-intro.js
git commit -m "Render top-3 HUD cards and core stats in gaming-intro"
```

---

### Task 5: Scroll choreography (GSAP/Lenis) with reduced-motion fallback

**Files:**
- Modify: `js/gaming-intro.js` (append choreography + boot code)
- Modify: `css/gaming-intro.css:` add `.gi-static` support if any gap is found in Task 3's rules (should already be covered — verify, don't duplicate)

**Interfaces:**
- Consumes: `renderApp()` from Task 4; `.gi-act`, `.gi-bg`, `.gi-content`/`.gi-hud-card` from Task 3; global `gsap`, `ScrollTrigger`, `Lenis` from the CDN scripts in `gaming-intro.html`.
- Produces: nothing consumed by later tasks — this is the final behavioral piece.

- [ ] **Step 1: Append choreography logic to `js/gaming-intro.js`**

```js
function initScrollChoreography() {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  const acts = gsap.utils.toArray(".gi-act");

  acts.forEach((act, i) => {
    const isLast = i === acts.length - 1;
    const bg = act.querySelector(".gi-bg");
    const reveal = act.querySelector(".gi-content, .gi-hud-card");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: act,
        start: "top top",
        end: "+=100%",
        scrub: true,
        pin: true,
      },
    });

    if (bg) tl.fromTo(bg, { scale: 1.1 }, { scale: 1, ease: "none" }, 0);

    if (reveal) {
      tl.fromTo(
        reveal,
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.35 },
        0
      );
      if (!isLast) {
        tl.to(reveal, { autoAlpha: 0, y: -30, ease: "power2.in", duration: 0.25 }, 0.75);
      }
    }
  });
}

function initStaticFallback() {
  document.body.classList.add("gi-static");
}

document.addEventListener("DOMContentLoaded", () => {
  renderApp();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsapAvailable =
    typeof gsap !== "undefined" &&
    typeof ScrollTrigger !== "undefined" &&
    typeof Lenis !== "undefined";

  if (reduceMotion || !gsapAvailable) {
    initStaticFallback();
  } else {
    initScrollChoreography();
  }
});
```

- [ ] **Step 2: Manual verification — normal motion**

Open `gaming-intro.html` in a browser with default settings (motion not reduced). Scroll from top to bottom: each act should pin briefly, its background should do a subtle zoom-out, and its content/HUD card should fade+slide in then out (except the portal act, which stays visible). No act should ever be blank or show another act's background bleeding through.

- [ ] **Step 3: Manual verification — reduced motion / no GSAP**

Simulate `prefers-reduced-motion: reduce` (OS accessibility setting, or the browser devtools rendering emulation panel) and reload. Confirm: no pinning, all acts stacked in normal document flow, title/HUD cards/portal link all immediately visible and readable, no console errors. Then temporarily comment out the three CDN `<script>` tags in `gaming-intro.html`, reload, and confirm the same static fallback appears (proves the `gsapAvailable` check works when a CDN script fails to load) — then uncomment them again.

- [ ] **Step 4: Commit (local only, do not push)**

```bash
git add js/gaming-intro.js css/gaming-intro.css
git commit -m "Add scroll choreography with reduced-motion fallback to gaming-intro"
```

---

### Task 6: Wire the site's Gaming entry point to the new intro

**Files:**
- Modify: `index.html:26`

**Interfaces:** none (leaf change).

The quicknav "Gaming" link is the primary front door into the gaming section and is what should now open the cinematic intro. The hub's own gaming chapter (`index.html:59`, "Ganze Gaming-History ansehen") already sets up the stats/story inline and its CTA promises the full archive — that one stays pointing straight at `gaming.html`, unchanged, so a visitor who already read the chapter isn't sent through another cinematic intro before reaching the archive they were promised.

- [ ] **Step 1: Update the quicknav link**

In `index.html`, change line 26 from:
```html
<a href="gaming.html" data-section="gaming" aria-label="Zur Gaming-Seite"><span class="qn-dot"></span>Gaming</a>
```
to:
```html
<a href="gaming-intro.html" data-section="gaming" aria-label="Zur Gaming-Seite"><span class="qn-dot"></span>Gaming</a>
```

- [ ] **Step 2: Manual verification**

Open `index.html`, click "Gaming" in the fixed quicknav at the top — it must land on `gaming-intro.html`. Scroll to the Gaming chapter further down the same hub page and click "Ganze Gaming-History ansehen" — it must still land on `gaming.html` directly (unchanged).

- [ ] **Step 3: Commit (local only, do not push)**

```bash
git add index.html
git commit -m "Point quicknav Gaming link to the new gaming-intro landing"
```

---

### Task 7: Local verification pass and user sign-off (STOP before deploy)

**Files:** none created/modified — verification only.

**Interfaces:** none.

- [ ] **Step 1: Re-check for upstream admin-panel commits**

```bash
git fetch origin && git log HEAD..origin/main --oneline
```
If there are new commits (e.g. a new game added mid-implementation), `git pull` before continuing — the top-3 in `gaming-intro.html` should reflect the current `gaming-data.js`, not a stale local copy.

- [ ] **Step 2: Desktop screenshot pass**

Using the `mcp__Claude_Browser` tool: navigate to the local `gaming-intro.html` (`file:///…/gaming-intro.html`), resize to desktop (1280×800), and screenshot each act (top, and after scrolling roughly 20/40/60/80/100% of the track). Confirm no layout breakage, no missing images (broken-image icon), no console errors.

- [ ] **Step 3: Mobile screenshot pass**

Resize the browser pane to the mobile preset (375×812), reload, and repeat the scroll + screenshot pass. Confirm the HUD cards center correctly (per the `@media (max-width: 720px)` rule in Task 3) and text stays legible over the artwork at every act.

- [ ] **Step 4: Data accuracy check**

Confirm the three depth acts show the same top-3 games (by hours) and the core act shows the same totals as `gaming.html`'s own hero stats, using the currently-pulled `js/gaming-data.js`.

- [ ] **Step 5: Present to the user — STOP HERE**

Show the user the screenshots (and/or point them at the local file to open themselves) and summarize what was built. **Do not run `git push`.** Ask explicitly whether it's approved to go live. Only after an explicit yes: run `git push` (this publishes to GitHub Pages immediately, per the site's normal deploy — see `github-push-workflow` — but only from this point on, not before).
