#!/usr/bin/env node
// Regression test for CARD DIFFICULTY and the minigames' pool filter (Aug 2026).
//
//   node .claude/test-difficulty.js
//
// No browser and no dependencies: the rule is arithmetic over the shipped data plus a few structural
// reads of app.js, which is the shape `test-date-line.js` and `test-scheduler.js` use. Everything below
// fails SILENTLY on the page, which is the whole reason the file exists — a wrongly-filtered game still
// deals a puzzle, still scores it and still turns the tile gold.
//
//  1. EVERY SHIPPED CARD IS RATED, 1–5. An unrated card is treated as too obscure for the games, so one
//     that arrives without a rating simply stops appearing in them — no error, no gap, nothing on screen.
//     add-card.js refuses one, and this is what says the refusal is still working over the whole corpus.
//
//  2. THE BAR IS READ FROM ONE PLACE. `GAME_MAX_DIFFICULTY` lives in app.js and `add-card-difficulty.js`
//     greps it rather than restating it; if that grep ever stops matching, the tool's coverage report and
//     the site's filter start describing different pools while both look right.
//
//  3. EVERY CARD-FED GAME GOES THROUGH `gameCardIdSet()`. This is the assertion that matters most and the
//     only one that can catch a sixth game added later reaching for `availableCardIdSet` out of habit:
//     that game would quietly deal `qa-si-re-u` and nobody would find out from a test.
//
//  4. THE FILTERED POOL CAN STILL DEAL. A filter that starves a game is the opposite failure and just as
//     quiet — the game shows its "Coming soon" placard, which looks like content that has not been written
//     rather than content that has been filtered away.
//
//  5. STUDY IS UNTOUCHED. The point of the feature is that obscure cards are still studied; if the study
//     path ever picked up the game filter, a reader's deck would silently shrink to 58 of 409 cards.
//
//  6. THE RATING SURVIVES A ROUND TRIP. `serializeCardData` is what the in-app editor's auto-save writes
//     data.js with, so a serializer that forgot `difficulty` would strip all 409 ratings from the file on
//     the next admin keystroke — every game's pool silently becoming empty.
//
//  7. THE WHAT YEAR? POOL. That game stopped drawing from the cards in Aug 2026 and has its own event
//     file; a year with fewer than five events is skipped in silence, and an entry carrying markup renders
//     its own tags because the clue list escapes.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const APP = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");

let pass = 0, fail = 0;
function ok(cond, what, detail) {
  if (cond) { pass++; console.log("ok    " + what + (detail ? "  " + detail : "")); }
  else { fail++; console.log("FAIL  " + what + (detail ? "  " + detail : "")); }
}

global.window = {};
require(path.join(ROOT, "data.js"));
require(path.join(ROOT, "whatyear.js"));
const CARDS = global.window.CARD_DATA;
const TREE = global.window.COLLECTION_TREE;
const EVENTS = global.window.WHATYEAR;

// ---- the constants, read out of app.js so this file cannot drift from the site ----
console.log("-- the scale --");
const grab = (re, what) => { const m = re.exec(APP); ok(!!m, what); return m; };
const mMin = grab(/const CARD_DIFFICULTY_MIN = (\d+), CARD_DIFFICULTY_MAX = (\d+);/, "app.js declares the 1–5 range");
const mBar = grab(/const GAME_MAX_DIFFICULTY = (\d+);/, "app.js declares GAME_MAX_DIFFICULTY");
const MIN = mMin ? +mMin[1] : 1, MAX = mMin ? +mMin[2] : 5, BAR = mBar ? +mBar[1] : 2;
ok(MIN === 1 && MAX === 5, "the scale is 1–5", MIN + "–" + MAX);
ok(BAR >= MIN && BAR < MAX, "the games' bar sits inside the scale and excludes something", "<= " + BAR);
// every rung is named, or the editor's picker and the tools' help print bare numbers
const labels = /const CARD_DIFFICULTY_LABELS = \{([^}]*)\}/.exec(APP);
ok(!!labels && [1, 2, 3, 4, 5].every((n) => new RegExp("\\b" + n + ":").test(labels[1])), "every rung of the scale is named in app.js");

// the batch tool reads the bar rather than restating it — the two can never describe different pools
const TOOL = fs.readFileSync(path.join(__dirname, "add-card-difficulty.js"), "utf8");
const toolRe = /const m = \/const GAME_MAX_DIFFICULTY = \(\\d\+\);\/\.exec/;
ok(toolRe.test(TOOL), "add-card-difficulty.js greps the bar out of app.js rather than restating it");
{
  const m = /const GAME_MAX_DIFFICULTY = (\d+);/.exec(APP);
  ok(!!m && +m[1] === BAR, "…and that grep still matches", "found " + (m ? m[1] : "nothing"));
}

// ---- 1. every shipped card is rated ----
console.log("\n-- the corpus --");
const unrated = CARDS.filter((c) => !Number.isInteger(c.difficulty));
ok(!unrated.length, "every shipped card carries a difficulty",
  unrated.length ? unrated.slice(0, 8).map((c) => c.id).join(", ") + (unrated.length > 8 ? " …+" + (unrated.length - 8) : "") : CARDS.length + " cards");
const outOfRange = CARDS.filter((c) => Number.isInteger(c.difficulty) && (c.difficulty < MIN || c.difficulty > MAX));
ok(!outOfRange.length, "no rating falls outside the scale", outOfRange.map((c) => c.id + ":" + c.difficulty).slice(0, 6).join(", "));

const dist = {}; for (let i = MIN; i <= MAX; i++) dist[i] = 0;
CARDS.forEach((c) => { if (Number.isInteger(c.difficulty)) dist[c.difficulty]++; });
console.log("      distribution  " + Object.entries(dist).map(([k, n]) => k + ":" + n).join("  "));
/* A scale on which everything is a 3 is a scale nobody used. This is deliberately loose — it is a smell
   test, not an editorial rule — but a corpus where one rung holds 95% of the cards has stopped rating. */
const most = Math.max(...Object.values(dist));
ok(most < CARDS.length * 0.9, "the scale is actually used rather than collapsed onto one rung",
  "largest rung holds " + Math.round((most / CARDS.length) * 100) + "%");
ok(Object.values(dist).filter((n) => n > 0).length >= 4, "at least four of the five rungs are in use");

// ---- 2. the pool ----
const easy = CARDS.filter((c) => Number.isInteger(c.difficulty) && c.difficulty <= BAR);
console.log("      minigame pool " + easy.length + " of " + CARDS.length + " cards");
ok(easy.every((c) => c.difficulty <= BAR), "nothing above the bar is in the pool");

// ---- 3. every card-fed game goes through gameCardIdSet ----
console.log("\n-- the wiring --");
ok(/function gameCardIdSet\(\)/.test(APP), "app.js defines gameCardIdSet()");
/* Read each game's pool function out of app.js and check which set it asks for. A game reaching for
   `availableCardIdSet` is a game dealing the whole corpus — which is exactly what every one of them did
   before this feature, so it is the regression to expect. */
function poolBody(name, endAt) {
  const i = APP.indexOf("function " + name + "(");
  if (i < 0) return null;
  const j = APP.indexOf(endAt, i);
  return j < 0 ? APP.slice(i, i + 2000) : APP.slice(i, j);
}
const FED = [
  ["buildChallengeQuestions", "return chosen.map", "Multiple Choice"],
  ["chronoPool", "function hashStr", "Timeline"],
  ["xwPool", "/* The layout search", "Crossword"],
  ["picturePool", "function dailyPictureRounds", "Picture round"],
];
for (const [fn, end, label] of FED) {
  const body = poolBody(fn, end);
  ok(!!body, label + ": " + fn + " found in app.js");
  if (!body) continue;
  ok(/gameCardIdSet\(\)/.test(body), label + " draws from gameCardIdSet()");
  ok(!/availableCardIdSet\(\)/.test(body), label + " does NOT draw the unfiltered set");
}
/* Timeline and What year? once shared `chronoPool`. What year? has its own pool now, so the assertion is
   that it no longer reaches for the cards at all — a silent reversion would bring back a game that asks
   about the same year every day. */
{
  const body = poolBody("dailyWhatYear", "PAGES.whatyear");
  ok(!!body && /wyPool\(\)/.test(body), "What year? draws from wyPool()");
  ok(!!body && !/chronoPool\(\)/.test(body), "What year? no longer draws from the cards");
}

// ---- 4. the filtered pool can still deal ----
console.log("\n-- can each game still deal? --");
const sy = (() => {
  const a = APP.indexOf("const DEEP_MAG = {"), b = APP.indexOf("// start year of a card's answer term");
  const { cardYears } = new Function(APP.slice(a, b) + "\nreturn { cardYears };")();
  return (c) => { const y = cardYears(c); return y.length ? Math.min(...y) : null; };
})();

const answers = new Set(easy.map((c) => c.answerText).filter(Boolean));
ok(answers.size >= 4, "Multiple Choice can fill a round", answers.size + " distinct answers (needs the correct one + 3 decoys)");
ok(easy.length >= 5, "Multiple Choice has five cards to ask about", easy.length + " cards");

const years = new Set(easy.map(sy).filter((y) => y != null));
ok(years.size >= 5, "Timeline can order five different years", years.size + " distinct years");

const XW_MIN = +(/const XW_MIN_LEN = (\d+), XW_MAX_LEN = (\d+);/.exec(APP) || [])[1] || 4;
const XW_MAX = +(/const XW_MIN_LEN = (\d+), XW_MAX_LEN = (\d+);/.exec(APP) || [])[2] || 11;
const XW_N = +(/const XW_ENTRIES = (\d+);/.exec(APP) || [])[1] || 9;
const xwNorm = (s) => String(s == null ? "" : s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z]/g, "");
const xwSeen = new Set();
easy.forEach((c) => {
  const raw = String(c.answerText || "").trim();
  if (!raw || /\s/.test(raw)) return;
  const w = xwNorm(raw);
  if (w.length >= XW_MIN && w.length <= XW_MAX) xwSeen.add(w);
});
/* A grid needs more candidates than it has slots or the layout search has nothing to choose between and
   the same grid comes round every few days — which is what happened when the filter first landed and the
   draw cap stopped sampling. Twice the entry count is the floor this asserts. */
ok(xwSeen.size >= XW_N * 2, "the Crossword has a real choice of entries",
  xwSeen.size + " usable words for a " + XW_N + "-entry grid");

const withImage = easy.filter((c) => c.image && c.image.src).length;
ok(withImage > 0, "the Picture round still has illustrated cards in the pool", withImage + " cards");

// ---- 5. study is untouched ----
console.log("\n-- study is untouched --");
/* The rule is that every card is studiable at every rating. `availableCardIdSet` is what the review, the
   deck rows and the card of the day all read, so the assertion is that it knows nothing about difficulty. */
// end the slice at the COMMENT above gameCardIdSet, not at the function: that comment is about the
// difficulty filter, so including it makes this assertion pass on its own explanation
const availBody = poolBody("availableCardIdSet", "/* THE CARDS A MINIGAME MAY DEAL");
ok(!!availBody && !/difficult/i.test(availBody), "availableCardIdSet knows nothing about difficulty");
const hardStudiable = CARDS.filter((c) => c.difficulty > BAR).length;
ok(hardStudiable > 0 && hardStudiable + easy.length === CARDS.length,
  "every card above the bar is still in the corpus", hardStudiable + " cards study-only");
// the tree is the study path's own source and must still hold every card, rated or not
const inTree = new Set();
(function walk(n) { (n.cardIds || []).forEach((i) => inTree.add(i)); (n.children || []).forEach(walk); })({ children: TREE.collections });
const missing = CARDS.filter((c) => !inTree.has(c.id) && c.difficulty > BAR).length;
ok(missing === 0 || inTree.size > easy.length, "the decks still carry the obscure cards", inTree.size + " ids in the tree");

// ---- 6. the rating survives a serializer round trip ----
console.log("\n-- the round trip --");
const ser = poolBody("serializeCardData", "const countIds = (node)");
ok(!!ser && /o\.difficulty = /.test(ser), "serializeCardData emits difficulty (an admin auto-save would otherwise strip every rating)");
ok(/CARD_BY_ID\[id\]\.difficulty = p\.difficulty;/.test(APP), "revertCard restores the rating with the rest of the card");

// add-card.js refuses an unrated card
const ADD = fs.readFileSync(path.join(__dirname, "add-card.js"), "utf8");
ok(/Number\.isInteger\(card\.difficulty\)/.test(ADD), "add-card.js refuses a new card with no difficulty");
{
  const m = /const DIFF_MIN = (\d+), DIFF_MAX = (\d+);/.exec(ADD);
  ok(!!m && +m[1] === MIN && +m[2] === MAX, "…on the same 1–5 scale app.js declares", m ? m[1] + "–" + m[2] : "not found");
}

/* The batch tool validates the WHOLE batch before writing anything — a half-applied batch is worse than a
   refused one — so a bad rating must leave data.js untouched. Run it for real and compare the bytes. */
const dataPath = path.join(ROOT, "data.js");
const before = fs.readFileSync(dataPath);
const tmp = path.join(require("os").tmpdir(), "folio-diff-bad-" + process.pid + ".json");
fs.writeFileSync(tmp, JSON.stringify({ cards: { [CARDS[0].id]: 2, "no-such-card-xyz": 3, [CARDS[1].id]: 9 } }));
const r = require("child_process").spawnSync(process.execPath, [path.join(__dirname, "add-card-difficulty.js"), tmp], { encoding: "utf8" });
fs.unlinkSync(tmp);
ok(r.status !== 0, "add-card-difficulty.js refuses a batch with a bad id or an out-of-range rating");
ok(/no such card/.test(r.stderr) && /not an integer/.test(r.stderr), "…and says which entries were wrong");
ok(Buffer.compare(before, fs.readFileSync(dataPath)) === 0, "…and wrote nothing at all");

// ---- 7. the What year? event pool ----
console.log("\n-- the What year? pool --");
const WY_N = +(/const WY_EVENTS = (\d+),/.exec(APP) || [])[1] || 5;
ok(Array.isArray(EVENTS) && EVENTS.length > 0, "whatyear.js ships an event pool", EVENTS.length + " events");
const shape = EVENTS.filter((x) => !x || typeof x.y !== "number" || typeof x.e !== "string" || !x.e.trim());
ok(!shape.length, "every entry is { y: <number>, e: <sentence> }", shape.length ? JSON.stringify(shape[0]) : "");
const byYear = new Map();
EVENTS.forEach((x) => { const a = byYear.get(x.y) || []; a.push(x.e); byYear.set(x.y, a); });
const usable = [...byYear.entries()].filter(([, a]) => a.length >= WY_N);
const short = [...byYear.entries()].filter(([, a]) => a.length < WY_N);
/* A year short of WY_EVENTS is dropped in silence — the game never picks it and nothing says why — so a
   half-finished year reads as a year nobody added. */
ok(!short.length, "every year in the pool has at least " + WY_N + " events",
  short.length ? short.map(([y, a]) => y + " has " + a.length).join(", ") : usable.length + " years");
ok(usable.length >= 10, "the pool covers at least ten days before a year repeats", usable.length + " years");
/* A duplicated sentence inside one year would let the day's five contain the same clue twice — the game
   draws five at random from the year and has no reason to look for it. Across years it is just as wrong:
   the same event cannot have happened twice. */
const dupe = (() => {
  const seen = new Map();
  return EVENTS.filter((x) => { const k = x.e.toLowerCase(); const had = seen.has(k); seen.set(k, 1); return had; });
})();
ok(!dupe.length, "no event appears twice in the pool", dupe.length ? dupe[0].e : "");
// the clue list renders through esc(), so markup would print as its own tags
const markup = EVENTS.filter((x) => /[<>]/.test(x.e));
ok(!markup.length, "no entry carries markup", markup.length ? markup[0].e : "");
// an entry naming its own year hands the reader the answer
const gives = EVENTS.filter((x) => new RegExp("\\b" + Math.abs(x.y) + "\\b").test(x.e));
ok(!gives.length, "no entry names the year it is asking about", gives.length ? gives[0].e : "");
// …and every entry is one sentence, since the list is one line per clue
const multi = EVENTS.filter((x) => /[.!?]\s+[A-Z]/.test(x.e.replace(/\b([A-Z])\.\s/g, "$1 ")));
ok(!multi.length, "every entry is a single sentence", multi.length ? multi[0].e : "");
const noStop = EVENTS.filter((x) => !/[.!?]$/.test(x.e.trim()));
ok(!noStop.length, "…and ends on a full stop", noStop.length ? noStop[0].e : "");
// whatyear.js is eagerly loaded, so it has to stay small
const wySize = fs.statSync(path.join(ROOT, "whatyear.js")).size;
ok(wySize < 120 * 1024, "whatyear.js is small enough for the eager path", Math.round(wySize / 1024) + " KB");
ok(/<script src="whatyear\.js"><\/script>/.test(fs.readFileSync(path.join(ROOT, "index.html"), "utf8")),
  "index.html loads whatyear.js");

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
