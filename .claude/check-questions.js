#!/usr/bin/env node
/*
  check-questions.js — the card QUESTION house rules, measured over the shipped data.js.

    node .claude/check-questions.js [--verbose]

  Exit 1 on any violation, so it can guard a batch the way check-style.js does.

  THE RULES IT CHECKS, and why each one is here rather than left to the eye:

  1. ONE SENTENCE.  A question is a single clue; a second sentence is a background
     paragraph that has crept into the question box.  Counted on the text with the
     tags off, so a decimal point or an abbreviation cannot be read as a stop.

  2. UNDERSTANDABLE ON ITS OWN.  A question may not OPEN on a pronoun whose only
     antecedent is the hidden answer — "Its oldest tools come from Gona, so the ___
     may have been knapped by …".  A reader meets three words that say nothing until
     they have read past the blank.  The DUMMY `it` of a cleft ("It was Homo erectus
     who carried …") is exempt and must stay exempt: that `it` refers to nothing at
     all and the sentence is self-contained.

  3. 20–34 WORDS, the blank counted as one word and an imperial conversion in
     parentheses NOT counted (the same allowance add-card.js makes, so the prose
     budget is unchanged by the units rule).

  4. THE BLANK IS MID-SENTENCE, never at the end: the clue must keep going after it.

  MAP CARDS ARE EXEMPT FROM 3 AND 4, BY DESIGN.  A map card's clue is the SHAPE on
  the globe rather than the sentence, so its question is deliberately short (5–20
  words) and deliberately ends on the blank — "The state shaded on the map is ___."
  See the map-card bullet in CLAUDE.md.  They are still held to rules 1 and 2.

  It does NOT check that a question describes its topic's most important aspect.
  That is a judgement no checker can make; it is stated in CLAUDE.md and read by eye.
*/
"use strict";
const path = require("path");
const ROOT = path.join(__dirname, "..");
global.window = {};
require(path.join(ROOT, "data.js"));

const VERBOSE = process.argv.includes("--verbose");
const MIN = 20, MAX = 34;
const MAP_MIN = 5, MAP_MAX = 20;

// An imperial conversion in parentheses is not charged against the word budget.
const IMPERIAL_PAREN =
  /\s*\((?=[^)]*\d)[^)]*\b(?:inch|inches|in|foot|feet|ft|yard|yards|yd|mile|miles|mi|pound|pounds|lb|lbs|ounce|ounces|oz|acre|acres|gallon|gallons|pint|pints|quart|quarts|sq\s*(?:mi|ft|in|yd))\b[^)]*\)/gi;

const BLANK_RX = /<span class="blank">_+<\/span>/;
// A pronoun opening whose antecedent can only be the hidden answer.
const CATAPHORA = /^(Its|It|He|She|They|Their|His|Her|There|Here|Such|This|These|Those)\b/;
// ...except the dummy `it` of a cleft or an impersonal construction.
const DUMMY_IT = /^It (?:was|is|has been|had been|had|would|will|may|might|seems|appears)\b/;

const plain = s => s.replace(BLANK_RX, "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const words = s =>
  s.replace(/<[^>]*>/g, " ").replace(IMPERIAL_PAREN, " ")
   .replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;

const fails = [];
let checked = 0, mapCards = 0;

for (const c of window.CARD_DATA) {
  const isMap = !!(c.map && c.map.key);
  if (isMap) mapCards++;
  const all = [c.question, ...(c.questions || [])];
  all.forEach((q, i) => {
    if (typeof q !== "string" || !q.trim()) return;
    checked++;
    const tag = `${c.id} q${i}`;
    const p = plain(q);

    if (!BLANK_RX.test(q)) fails.push([tag, "no blank", p]);

    const stops = (p.match(/[.!?](?:\s|$)/g) || []).length;
    if (stops > 1) fails.push([tag, "more than one sentence", p]);
    if (stops < 1) fails.push([tag, "no closing stop", p]);

    if (CATAPHORA.test(p) && !DUMMY_IT.test(p))
      fails.push([tag, "opens on a pronoun that only the answer can resolve", p]);

    const w = words(q);
    const lo = isMap ? MAP_MIN : MIN, hi = isMap ? MAP_MAX : MAX;
    if (w < lo || w > hi)
      fails.push([tag, `${w} words (want ${lo}–${hi}${isMap ? ", map card" : ""})`, p]);

    if (!isMap && new RegExp(BLANK_RX.source + "\\s*[.!?]?\\s*$").test(q))
      fails.push([tag, "blank at the end of the sentence", p]);
  });
}

console.log(`${checked} questions across ${window.CARD_DATA.length} cards (${mapCards} map cards).`);
if (!fails.length) { console.log("All question rules pass."); process.exit(0); }

console.log(`\n${fails.length} violation${fails.length === 1 ? "" : "s"}:`);
for (const [tag, why, text] of fails) {
  console.log(`  ${tag}: ${why}`);
  if (VERBOSE) console.log(`      ${text}`);
}
process.exit(1);
