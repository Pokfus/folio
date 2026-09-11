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
/* `cardSpanYears` comes with it for section 4: it is declared BELOW the marker above, so the slice runs
   to the end of its body rather than stopping at `b`. It is sliced rather than reimplemented for this
   file's whole reason — a second copy of the rule cannot fail when app.js's changes. */
const sp = src.indexOf("function cardSpanYears(");
if (sp < 0) { console.error("could not find cardSpanYears in app.js"); process.exit(1); }
let d = 0, spEnd = src.indexOf("{", sp);
for (let k = spEnd; k < src.length; k++) { if (src[k] === "{") d++; else if (src[k] === "}") { d--; if (!d) { spEnd = k + 1; break; } } }
const { cardYears, cardSpanYears } = new Function(
  src.slice(a, b) + "\n" + src.slice(sp, spEnd) + "\nreturn { cardYears, cardSpanYears };")();

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
   a 19th-century idea (`wh-002` the three-age system, `gr-007` Arthur Evans) has no
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

/* ---- 4. a polity's area is drawn for as long as the polity stood ----------------------------------
   Sep 2026, after the Etruscan civilisation turned out to be on the personal atlas for exactly one year.
   That globe draws a `culture`, `people`, `state`, `dynasty` or `empire` card's authored `area` in the
   years its card's own date line names — and unlike a DOT, which is drawn from its earliest date and
   never taken away, BOTH ENDS of that span bind: the Liangzhu culture ends where Yinxu does not. So a
   date line yielding a single year draws the shape in that one year and in no other, which is a shape
   nobody will ever see.
   IT LOOKS LIKE NOTHING AT ALL FROM EVERY OTHER ANGLE. The card is correct, its window is correct, its
   sort year is correct, `isDateList` passes, and the only symptom is an area that never appears on a
   globe most readers reach by accident. All three that had it were Rome cards whose only readable year
   was a single one, the rest of the line being written in CENTURIES, which `cardYears` deliberately
   cannot read (teaching it to would move the sort year of 52 shipped cards). The fix is the one this
   file's own rule 2 prescribes: write the span the century MEANS. */
console.log("\n-- a polity's area lasts as long as it did --");
const POLITY = new Set(["culture", "people", "state", "dynasty", "empire", "civilisation"]);
const areaCards = CARDS.filter((c) => c.locator && c.locator.area && POLITY.has((c.tags || [])[0]));
const oneYear = areaCards.filter((c) => {
  const y = cardSpanYears(c);
  return y && y.length && Math.min(...y) === Math.max(...y);
});
ok(!oneYear.length, "no polity's area is drawn in a single year only",
  oneYear.length ? oneYear.map((c) => c.id + " (" + Math.min(...cardSpanYears(c)) + ")").join(", ")
    : areaCards.length + " cards carry a polity area");
// …and the set is read off app.js rather than restated, so a kind added there is covered here
const declared = /const MINE_POLITY = new Set\(\[([^\]]*)\]\)/.exec(src);
ok(!!declared && declared[1].split(",").map((t) => t.trim().replace(/^["']|["']$/g, "")).filter(Boolean)
  .every((k) => POLITY.has(k)),
  "…and this file knows every kind the personal atlas treats as a polity",
  declared ? declared[1].replace(/\s+/g, " ").trim() : "MINE_POLITY not found");

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
