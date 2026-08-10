#!/usr/bin/env node
// Set the DIFFICULTY of cards already in ../data.js, in batches.
//
//   node .claude/add-card-difficulty.js <batch.json> [--quiet]
//
// <batch.json>  { "cards": { "wh-001": 1, "gr-080": 5, … } }  — an id and a rating, 1 to 5.
//
// WHAT THE NUMBER MEANS (the scale is in CLAUDE.md; keep the two in step):
//
//   1  household name        — almost any adult would recognise it (Stone Age, Homer, Sparta)
//   2  generally familiar    — an ordinary secondary education reaches it (Neolithic, Knossos, phalanx)
//   3  known to the interested — a reader who follows history (Linear B, hoplite, helots)
//   4  specialist            — mostly met inside the subject (Gravettian, megaron, bucchero)
//   5  highly obscure        — named in the scholarship and almost nowhere else (qa-si-re-u, Nichoria)
//
// It rates the TERM's fame, not the card's writing and not how hard the card is to answer. The two come
// apart constantly: a card about `Homer` may make a subtle point and is still a 1, and a beautifully
// clear card about `qa-si-re-u` is still a 5, because a reader who has never met the word cannot be
// eased into recognising it by prose. So rate the word a stranger would be shown, nothing else.
//
// WHY IT EXISTS: the daily minigames deal a term cold — four options, a crossword square, a picture, a
// year — with no background to read first, so a pool that includes `qa-si-re-u` and `Howiesons Poort` is
// a pool that deals unanswerable rounds. `GAME_MAX_DIFFICULTY` in app.js is the bar they draw under; a
// card the games may use is one at or below it. Study is unaffected — every card is studiable, and the
// hard ones are the point of studying.
//
// This is the BATCH tool for cards already shipped. A NEW card carries its own `difficulty` and
// add-card.js refuses one without it, exactly as it refuses one without citations — so the corpus can
// never quietly regrow an unrated tail. Not part of the site.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const dataPath = path.join(ROOT, "data.js");

const MIN = 1, MAX = 5;
/* Read the games' bar out of app.js rather than restating it, so this tool's coverage report and the
   site's own filter can never come to disagree about which cards a game may deal. */
const GAME_MAX = (() => {
  const m = /const GAME_MAX_DIFFICULTY = (\d+);/.exec(fs.readFileSync(path.join(ROOT, "app.js"), "utf8"));
  return m ? +m[1] : 2;
})();

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }

const batchFile = process.argv[2];
const quiet = process.argv.includes("--quiet");
if (!batchFile) { console.error('usage: node .claude/add-card-difficulty.js <batch.json>\n  { "cards": { "wh-001": 1, … } }  — ratings 1 (household name) to 5 (highly obscure)'); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(batchFile, "utf8"));
const want = batch.cards || batch;
if (!want || typeof want !== "object" || Array.isArray(want)) { console.error('ERROR: the batch needs a `cards` object of id -> rating.'); process.exit(1); }

const win = loadWindow(dataPath), cards = win.CARD_DATA;
const byId = new Map(cards.map((c) => [c.id, c]));

// ---- validate the WHOLE batch before writing anything: a half-applied batch is worse than a refused one
const bad = [];
for (const [id, v] of Object.entries(want)) {
  if (!byId.has(id)) { bad.push(id + ": no such card"); continue; }
  if (typeof v !== "number" || !Number.isInteger(v) || v < MIN || v > MAX) {
    bad.push(id + ": " + JSON.stringify(v) + " is not an integer " + MIN + "–" + MAX);
  }
}
if (bad.length) {
  console.error("ERROR: the batch was not applied — " + bad.length + " bad entr" + (bad.length === 1 ? "y" : "ies") + ":");
  bad.slice(0, 12).forEach((b) => console.error("  " + b));
  if (bad.length > 12) console.error("  … +" + (bad.length - 12) + " more");
  process.exit(1);
}

let set = 0, changed = 0;
for (const [id, v] of Object.entries(want)) {
  const c = byId.get(id);
  if (c.difficulty !== v) changed++;
  c.difficulty = v;
  set++;
}

const out =
  "/* Card data. Add cards one at a time with `node .claude/add-card.js <card.json> [deckId]` (see CLAUDE.md). */\n" +
  "window.CARD_DATA = [\n" + cards.map((c) => JSON.stringify(c)).join(",\n") + "\n];\n\n" +
  "/* Collection -> deck -> sub-deck tree. Leaf decks carry a `cardIds` array. */\n" +
  "window.COLLECTION_TREE = " + JSON.stringify(win.COLLECTION_TREE, null, 2) + ";\n";
fs.writeFileSync(dataPath, out);
loadWindow(dataPath);   // re-parse to confirm the written file is valid JS

if (quiet) process.exit(0);

// ---- coverage, reported on every run, exactly as add-sources.js reports the citation bar ----
const rated = cards.filter((c) => typeof c.difficulty === "number");
const unrated = cards.filter((c) => typeof c.difficulty !== "number");
const dist = {}; for (let i = MIN; i <= MAX; i++) dist[i] = 0;
rated.forEach((c) => { dist[c.difficulty]++; });
console.log("set " + set + " rating" + (set === 1 ? "" : "s") + " (" + changed + " changed) | rated " + rated.length + " / " + cards.length + " cards");
console.log("  " + Object.entries(dist).map(([k, n]) => k + ":" + n).join("  "));
const pool = rated.filter((c) => c.difficulty <= GAME_MAX).length;
console.log("  minigame pool (difficulty <= " + GAME_MAX + "): " + pool + " card" + (pool === 1 ? "" : "s"));
if (unrated.length) {
  console.log("  UNRATED (invisible to the games, studiable as ever): " +
    unrated.slice(0, 10).map((c) => c.id).join(", ") + (unrated.length > 10 ? " … +" + (unrated.length - 10) : ""));
}
