#!/usr/bin/env node
/* check-timeline-clues.js — the Timeline game's clue table (`timeline-clues.js`, Nov 2026, on request:
   "every answer term should have a 1 to 5 word description below it, describing what the answer term is").

     node .claude/check-timeline-clues.js [--verbose] [--strict]

   FAILS (exit 1) when a clue
     · is not 1–5 words (a hyphenated word counts as one), or ends in a full stop, or carries quotation marks;
     · contains a digit — a year, a century or an ordinal number would give the puzzle's order away;
     · repeats a distinctive word of its own term (the clue says WHAT the term is, it must not name it) —
       generic nouns such as "battle", "river" or "dynasty" are allowed, see GENERIC;
     · belongs to an id that is not a card.
   REPORTS (and with --strict fails) a datable card with no clue: the game then falls back to the card's kind
   tag and collection (chronoClue in app.js), so a new card is never bare, but the table should catch up.

   To add or correct a clue, edit its line in timeline-clues.js (one `"id": "clue",` per line) and re-run. */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const verbose = process.argv.includes("--verbose"), strict = process.argv.includes("--strict");

global.window = {};
require(path.join(ROOT, "data.js"));
new Function("window", fs.readFileSync(path.join(ROOT, "timeline-clues.js"), "utf8"))(global.window);
const CARDS = window.CARD_DATA || [];
const CLUES = window.TIMELINE_CLUES || {};
const byId = new Map(CARDS.map((c) => [c.id, c]));

// words of a term that a clue may share with it: kinds of thing, not names
const GENERIC = new Set(("battle battles siege war wars dynasty empire kingdom river lake sea mount mountain mountains range " +
  "treaty peace revolution rebellion revolt uprising temple tomb palace wall great canal bridge city state states island " +
  "islands church cathedral act law code age period era culture people civil world first second third new old ancient " +
  "republic union league council party movement school order university museum tower castle fort gate road railway " +
  "crisis incident affair massacre conference congress pact plan operation campaign expedition voyage reform reforms " +
  "rule system dynasty's emperor king queen prince princess pope saint bay gulf strait desert plateau valley ocean " +
  "national north south east west northern southern eastern western central upper lower greater lesser grand holy " +
  "royal imperial federal general art style theory principle doctrine policy declaration constitution charter " +
  "inscription text book poem play novel epic statue sculpture painting mosque shrine monastery abbey basilica " +
  "festival games olympic stone bronze iron golden house hall square park garden forest coast cape harbour port").split(/\s+/));

const words = (s) => String(s || "").replace(/<[^>]+>/g, " ").toLowerCase().match(/[\p{L}][\p{L}'’-]*/gu) || [];
let fails = 0, missing = 0;
const fail = (id, why, clue) => { fails++; console.log("FAIL  " + id + "  " + why + "  — " + JSON.stringify(clue)); };

for (const [id, clue] of Object.entries(CLUES)) {
  const c = byId.get(id);
  if (!c) { fail(id, "no such card", clue); continue; }
  if (typeof clue !== "string" || !clue.trim()) { fail(id, "empty", clue); continue; }
  const n = clue.trim().split(/\s+/).length;
  if (n < 1 || n > 5) fail(id, n + " words (1–5)", clue);
  if (/\d/.test(clue)) fail(id, "contains a digit", clue);
  if (/[.]$/.test(clue.trim())) fail(id, "ends in a full stop", clue);
  if (/["“”]/.test(clue)) fail(id, "quotation marks", clue);
  const own = new Set(words(c.answerText || c.answer).filter((w) => w.length > 3 && !GENERIC.has(w)));
  const shared = words(clue).filter((w) => own.has(w));
  if (shared.length) fail(id, "repeats its own term (" + shared.join(", ") + ")", clue);
}
for (const c of CARDS) {
  if (c.undatable || CLUES[c.id]) continue;
  missing++;
  if (verbose) console.log("MISS  " + c.id + "  " + (c.answerText || ""));
}
console.log("timeline-clues.js: " + Object.keys(CLUES).length + " clues, " + fails + " failing, " + missing +
  " datable cards without one (they fall back to kind · collection)");
process.exit(fails || (strict && missing) ? 1 : 0);
