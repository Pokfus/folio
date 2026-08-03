#!/usr/bin/env node
// Regression test for the DATE LINE — the `answerDate` field under a card's answer term.
//
//   node .claude/test-date-line.js
//
// What it guards, and why each rule breaks SILENTLY:
//
//  1. The date line is a LIST OF DATES, not a summary (Aug 2026, on request). It was a paragraph before
//     — on some cards three sentences under a one-word label saying what KIND of thing the answer was —
//     and it got there one card at a time with nothing checking. A card written by hand, or an editor
//     typing into the contenteditable, can put it back the same way. Nothing throws when it happens:
//     the card renders, it just stops being memorable. So every shipped card is held to the same
//     `.claude/date-line.js` shape that set-date-line.js and add-card.js enforce on the way in.
//
//  2. The date line is what the STUDY ORDER is derived from — `cardYears` reads it and nothing else
//     (bar an explicit admin override), so a deck is sorted by whatever numbers happen to be in this
//     field. That is exactly how Atapuerca, whose caves hold 1.4 million years, came to sort at
//     **1978 CE**: the old paragraph mentioned the year the dig started and that was the only number
//     the parser could see. A card whose date line states dates and yet yields NO year, or yields only
//     a recent one on a deep-time card, is the same failure returning.
//
//  3. The compact notation the date line is written in — `115,000 – 11,700 BP`, `c. 4.2 – 2 Mya` — has
//     to keep parsing. A range writes its unit ONCE, so a regex that only reads the closing number
//     silently sorts a card from the wrong end of its own era, and BP is not read at all by the rules
//     that predate it.
//
// No dependencies and no browser: cardYears is sliced out of app.js by text (the trick the Playwright
// tests use) and run against the real data.js, so neither the logic nor the content can drift from
// what ships.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const { isDateList, MAX_ROWS, LABEL_MAX, VALUE_MAX, VALUE_MAX_WORDS } = require("./date-line.js");

const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const a = src.indexOf("const DEEP_MAG = {");
const b = src.indexOf("// start year of a card's answer term");
if (a < 0 || b < 0) { console.error("could not find cardYears in app.js"); process.exit(1); }
const { cardYears } = new Function(src.slice(a, b) + "\nreturn { cardYears };")();

global.window = {};
require(path.join(ROOT, "data.js"));
const CARDS = global.window.CARD_DATA;

let pass = 0, fail = 0;
function ok(cond, what, detail) {
  if (cond) { pass++; console.log("ok    " + what + (detail ? "  " + detail : "")); }
  else { fail++; console.log("FAIL  " + what + (detail ? "  " + detail : "")); }
}
const startYear = (c) => { const y = cardYears(c); return y.length ? Math.min(...y) : null; };

// ---- 1. every shipped card's date line is a date list ----
console.log("-- the shape --");
const notLists = CARDS.filter((c) => !isDateList(c.answerDate));
ok(!notLists.length, "every card's date line is a list of dates, not a paragraph",
  notLists.length ? notLists.slice(0, 6).map((c) => c.id).join(", ") + (notLists.length > 6 ? " …+" + (notLists.length - 6) : "") : CARDS.length + " cards");

// the limits, restated here so a change to date-line.js that loosens them fails LOUDLY rather than
// letting the field creep back to a paragraph a few characters at a time
ok(MAX_ROWS <= 4 && LABEL_MAX <= 16 && VALUE_MAX <= 64 && VALUE_MAX_WORDS <= 10,
  "the limits still describe a glance", `${MAX_ROWS} rows / ${LABEL_MAX} char label / ${VALUE_MAX} char, ${VALUE_MAX_WORDS} word value`);

// a paragraph in the old shape must be REFUSED — otherwise the assertion above is vacuous
const OLD = '<div class="dt"><span class="dt-k">Site</span><span class="dt-v">A ravine on the eastern Serengeti Plain of northern Tanzania, inside the Ngorongoro Conservation Area; its deposits span roughly 2.1 million to 15,000 years ago</span></div>';
ok(!isDateList(OLD), "…and the paragraph it replaced is still recognised as one");
ok(isDateList(""), "an empty date line is a finished date line, not a failure");

// ---- 2. the date line still feeds the study order ----
console.log("\n-- the sort year --");
const undated = CARDS.filter((c) => c.answerDate && startYear(c) === null);
ok(!undated.length, "every card that states a date yields a sort year from it",
  undated.length ? undated.map((c) => c.id).join(", ") : CARDS.length + " cards");

/* A card that STATES a deep date and still sorts inside living memory is the Atapuerca failure: the
   parser found only the discovery or excavation year sitting beside it. A card whose subject really is
   a 19th-century idea (`wh-006` the three-age system, `wh-106` the Blytt–Sernander sequence) has no
   deep date to lose and belongs where it sorts — so the test is the presence of the notation, not the
   size of the year. Nothing on the page ever says which year a card sorted by. */
// "years ago" and "million years" are in the test alongside the compact notation ON PURPOSE: they are
// how the old paragraphs wrote a deep date, so this assertion fires on the shape that actually failed
// (run against the pre-conversion data.js it flags wh-029 at 1978 CE and wh-074 at 2016) rather than
// only on the shape written since.
const deep = (c) => /\d\s*(?:Mya|kya|Gya|BP)\b|\d\s*BCE\b|million years|years ago/i.test(c.answerDate);
const modern = CARDS.filter((c) => deep(c) && startYear(c) > 1000);
ok(!modern.length, "…and no card that names a deep date sorts by the year it was dug up",
  modern.length ? modern.map((c) => c.id + " (" + startYear(c) + " CE)").join(", ")
    : CARDS.filter(deep).length + " deep-time cards; " + CARDS.filter((c) => !deep(c)).map((c) => c.id).join(", ") + " are about modern ideas");

// ---- 3. the compact notation parses, from both ends ----
console.log("\n-- the notation --");
const Y = (s) => cardYears({ answerDate: s });
const eq = (s, want) => ok(JSON.stringify(Y(s)) === JSON.stringify(want), s, JSON.stringify(Y(s)));
eq("115,000 – 11,700 BP", [-115000, -11700]);
eq("c. 8,150 BP", [-8150]);
eq("11,450 – 10,150 cal BP", [-11450, -10150]);
// the unit is written ONCE and carries leftwards — reading only the closing number would sort a card
// from the wrong end of its own era
eq("c. 4.2 – 2 Mya", [-4200000, -2000000]);
eq("c. 2.6 Mya – 9700 BCE", [-2600000, -9700]);
eq("c. 12,000 – 1700 BCE", [-12000, -1700]);
ok(Math.min(...Y("Lived c. 4.2 – 2 Mya")) === -4200000, "a range sorts from its OPENING date", "4.2 Mya, not 2");

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
