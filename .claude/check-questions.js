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

  A MAP CARD IS EXEMPT FROM 3 AND 4, BY DESIGN.  Its clue is the SHAPE on the globe rather than the
  sentence, so its question is deliberately short (5–20 words) and deliberately ends on the blank —
  "The state shaded on the map is ___."  See the map-card bullet in CLAUDE.md.  It is still held to
  rules 1 and 2.

  AN ARTWORK CARD HAS NO QUESTION AT ALL AND IS SKIPPED OUTRIGHT (Sep 2026, on request: the question
  side "should show no words but an image").  `artwork: true` says the picture IS the question, and
  the reader answers in four typed fields whose labels are the whole of the words on that side — so
  such a card stores `question: ""`, `add-card.js` REFUSES one that stores anything else, and there
  is no prose here to hold to a length, a blank or a pronoun.  They are COUNTED and reported, so a
  format that quietly starts carrying prose again shows up as a question this file has checked.

  (It used to hold them to the map card's short range and exempt them from rule 2, the demonstrative
  in "This ivory animal ..." pointing at the picture rather than at the hidden answer.  That whole
  paragraph went with the prose it was about.)

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

/* An imperial conversion in parentheses is not charged against the word budget.
   °F HAS ITS OWN BOUNDARY, AND THAT IS THE WHOLE OF WHY IT WORKS (Sep 2026). Written inside the \b(?:…)\b
   group as the other units are, the leading \b sits between a SPACE and a DEGREE SIGN — two non-word
   characters — so it can never match, and the house form "(1.8 °F)" was charged in full while the
   spaceless "(1.8°F)" was not. The house form is the spaced one, 725 sites against 127. */
/* SLICED OUT OF add-card.js, WHICH OWNS IT — an imperial conversion is not charged against a length
   limit (CLAUDE.md, "THE WORD LIMITS DO NOT COUNT A CONVERSION"). It was copied into nine files and had
   drifted into three different patterns, so two tools could disagree about how long the same sentence is;
   read add-card.js's own comment for what the divergence cost and what the union was measured against. */
const IMPERIAL_PAREN = (() => {
  const src = require("fs").readFileSync(require("path").join(__dirname, "add-card.js"), "utf8");
  const m = src.match(/const IMPERIAL_PAREN = (\/.*\/gi);/);
  if (!m) { console.error("ERROR: could not slice IMPERIAL_PAREN out of add-card.js — the two tools would disagree about how long the same sentence is."); process.exit(2); }
  return eval(m[1]);
})();

const BLANK_RX = /<span class="blank">_+<\/span>/;
// A pronoun opening whose antecedent can only be the hidden answer.
const CATAPHORA = /^(Its|It|He|She|They|Their|His|Her|There|Here|Such|This|These|Those)\b/;
// ...except the dummy `it` of a cleft or an impersonal construction.
const DUMMY_IT = /^It (?:was|is|has been|had been|had|would|will|may|might|seems|appears)\b/;

const plain = s => s.replace(BLANK_RX, "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
/* A TOKEN OF PURE PUNCTUATION IS NOT A WORD (Sep 2026) — see add-card.js's own header. The predicate is
   SLICED OUT OF THE TOOL THAT OWNS IT rather than copied: a second copy goes stale on a change made in a
   file nobody counting words has reason to open, which is the scar `IMPERIAL_PAREN` left across nine files
   before it was closed the same way — see its own slice, usually directly above this one. */
const COUNTS_AS_WORD = (() => {
  const src = require("fs").readFileSync(require("path").join(__dirname, "add-card.js"), "utf8");
  const m = src.match(/const COUNTS_AS_WORD = (\/.*\/u);/);
  if (!m) { console.error("ERROR: could not slice COUNTS_AS_WORD out of add-card.js — the two tools would disagree about what a word is."); process.exit(2); }
  return eval(m[1]);
})();
const words = s =>
  s.replace(/<[^>]*>/g, " ").replace(IMPERIAL_PAREN, " ")
   .replace(/\s+/g, " ").trim().split(" ").filter(w => COUNTS_AS_WORD.test(w)).length;

const fails = [];
let checked = 0, mapCards = 0, artCards = 0;

for (const c of window.CARD_DATA) {
  const isMap = !!(c.map && c.map.key);
  const isArt = c.artwork === true;
  if (isMap) mapCards++;
  if (isArt) { artCards++; continue; }   // no question prose on this format at all — see the header
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
    const short = isMap;
    const lo = short ? MAP_MIN : MIN, hi = short ? MAP_MAX : MAX;
    if (w < lo || w > hi)
      fails.push([tag, `${w} words (want ${lo}–${hi}${short ? ", picture card" : ""})`, p]);

    if (!short && new RegExp(BLANK_RX.source + "\\s*[.!?]?\\s*$").test(q))
      fails.push([tag, "blank at the end of the sentence", p]);
  });
}

console.log(`${checked} questions across ${window.CARD_DATA.length} cards (${mapCards} map cards; ${artCards} artwork cards carry no question and are skipped).`);
if (!fails.length) { console.log("All question rules pass."); process.exit(0); }

console.log(`\n${fails.length} violation${fails.length === 1 ? "" : "s"}:`);
for (const [tag, why, text] of fails) {
  console.log(`  ${tag}: ${why}`);
  if (VERBOSE) console.log(`      ${text}`);
}
process.exit(1);
