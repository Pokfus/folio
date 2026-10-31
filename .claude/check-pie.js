#!/usr/bin/env node
/*
  check-pie.js — What share?'s question pool (`pie.js`), held to the site's own content rules.

    node .claude/check-pie.js [--verbose]

  The game (2026-10-31, docs/minigames.md "What share?") reveals each answer with a short explanation and
  "at least 2 sources to ensure that the information is accurate" — the request's own words. This is
  check-truefalse.js with the pie's shape: the same engines sliced out of app.js, the same rules, and two
  differences.

    1. SHAPE          — `q` (a question), `a` (an INTEGER per cent, 2–98, so the slice can be dragged),
                        `why`, `cat`, `src`; no duplicate question. Refused.
    2. SPELLING       — British, by app.js's own `spellText`. Refused.
    3. MARKERS        — every marker points at a source, every source is cited by a marker. Refused.
    4. MARKUP         — only `<i>`, `<b>` and the footnote `<sup>`. Refused.
    5. UNITS          — a figure neither unit pass can convert. Reported.
    6. CITATIONS      — at least TWO DIFFERENT works per question, counted on the URL. Refused.
    7. LENGTH         — a "small explanation paragraph": over 600 characters of prose is refused.

  Zero dependencies. Not part of the site. In CI's fast gate.
*/
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const VERBOSE = process.argv.includes("--verbose");

const APP = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
function slice(a, b, what) {
  const i = APP.indexOf(a), j = i < 0 ? -1 : APP.indexOf(b, i);
  if (i < 0 || j < 0) { console.error("ERROR: could not slice " + what + " out of app.js — the anchors moved."); process.exit(2); }
  return APP.slice(i, j);
}
/* THE TWO ENGINES ARE app.js's OWN, SLICED BY TEXT, AND THE RUN STOPS IF A SLICE FAILS. A second copy of
   either would answer differently on exactly the shapes this file is meant to find, and would go stale on
   a change made in a file nobody editing a statement pool has reason to open. */
const spellSrc = slice("  const SPELLINGS =", "  function setSpelling(", "the spelling engine");
const unitSrc = slice("  const UNIT_SYSTEMS =", "  function unitizeTree", "the units engine");
const SP = new Function("S", "window", spellSrc + "\nreturn { spellText: spellText };")({ settings: { spelling: "en-GB" } }, {});   // `window`: the spelling slice publishes FolioPlaceNames on it
const UN = new Function("S", "window", unitSrc + "\nreturn { unitizeText: unitizeText };")({ settings: { units: "metric" } }, {});

const win = {};
new Function("window", fs.readFileSync(path.join(ROOT, "pie.js"), "utf8"))(win);
const POOL = win.PIE_QUESTIONS || [];

const strip = (s) => String(s || "").replace(/<[^>]*>/g, "");
const MIN_SOURCES = 2;   // different works per question (the request: "cite at least 2 sources")
const MAX_WHY = 600;    // characters of prose, markers stripped
const errs = [], notes = [];
const say = (id, msg) => errs.push("  " + id + ": " + msg);

/* A METRIC UNIT STILL STANDING AFTER THE IMPERIAL PASS. Written out rather than left to a `\w+` class,
   for `U_DENOM`'s reason one file over: a wildcard here would report every number in the pool. */
const METRIC_RX = new RegExp(
  "(?<![A-Za-z])\\d[\\d,.]*\\s?(?:" +
  "km|kilometre|kilometres|kilometer|kilometers|metre|metres|meter|meters|cm|centimetre|centimetres|" +
  "mm|millimetre|millimetres|kg|kilogram|kilograms|gram|grams|tonne|tonnes|litre|litres|liter|liters|" +
  "hectare|hectares|°C" +
  ")(?![A-Za-z])", "i");

/* …AND AN IMPERIAL UNIT STILL STANDING AFTER THE METRIC PASS, which is the same question asked the other
   way about. Written out for METRIC_RX's own reason, and `foot` is deliberately absent: "12 foot" is not a
   shape this pool writes, while "on foot" and "at the foot of" are, and the digit guard in front does not
   save a rule that would then report "Round 1 / 5 … foot". */
const IMPERIAL_RX = new RegExp(
  "(?<![A-Za-z])\\d[\\d,.]*\\s?(?:" +
  "miles?|feet|inch|inches|yards?|acres?|pounds?|ounces?|tons?|gallons?|pints?|quarts?|°F" +
  ")(?![A-Za-z])", "i");

/* A NAME IS NOT A SPELLING, AND THE AMERICAN FORM OF ONE IS THE SAFE FORM (Sep 2026). `spellText` is a
   word list, so it cannot tell Elisha Gray the inventor from the colour, and rule 2 reported his surname
   as an American spelling. Correcting it would have been the fault rather than the fix — and which way
   round that cuts is worth knowing before writing another name here:

     · the site's transform is ONE-WAY (en-GB is the authored system and it converts only towards
       American), so a name authored in the AMERICAN form is never touched by anybody's reader;
     · a name authored in the BRITISH form is rewritten for every American reader — "Lady Jane Grey"
       would reach them as "Lady Jane Gray", which is a different person's name.

   Measured over the shipped corpus at the time of writing: twelve occurrences of Grey or Gray, of which
   nine are inside citations (`.notranslate`, never swept), one is the animal — where "grey wolf" is the
   right British spelling and "gray wolf" the right American one, so the transform is doing its job — and
   two are Robert Gray the fur trader, authored American and therefore safe. No live fault, and the note
   is here because the next one might not be.

   THE MASK IS EXACT STRINGS, never a pattern: "anything capitalised" would excuse `Colour` at the head of
   a sentence, which is the one place a real spelling wears a capital. */
/* A QUOTATION IS NOT AUTHORED TEXT, SO RULE 2 DOES NOT READ INSIDE ONE (Sep 2026). A statement may
   quote a source verbatim — the pool already quotes Plutarch, a 1692 death warrant and Burckhardt — and
   the moment one of those sources writes an American spelling, rule 2 refuses the statement and the only
   ways out are to misquote or to reword. That happened on #70, where the Supreme Court's own record of
   the Coca-Cola seizure says the extracts were used "for the purpose of obtaining a flavor".

   IT IS SAFE FOR THE SAME REASON THE PROPER-NOUN MASK IS: the site's transform is ONE-WAY. `spellText`
   returns at once under en-GB, the authored system, and converts only towards American — so a quotation
   carrying an American spelling reaches every reader exactly as its source wrote it, and a quotation
   carrying a British one is the only thing at risk, which is the direction a quotation should be in
   anyway.

   THE MASK IS THE CURLY PAIR AND NOTHING ELSE. That is the house form for a quotation throughout the
   pool; a straight double quote cannot appear in this prose at all. An unbalanced opening quote matches
   nothing, deliberately — the pattern requires its closer, so a typo leaves the text checked rather than
   silently excused. What it does excuse is an authoring error inside quotation marks, which is the right
   trade: text inside a quotation is not authored. */
const QUOTED_RX = /\u201c[^\u201d]*\u201d/g;

const PROPER_NOUNS = [   // institutions' own names, which the one-way transform must not be asked to anglicise (see check-truefalse.js)
  ["World Health Organization", "the organisation's own name"],
  ["Food and Agriculture Organization", "the organisation's own name"],
  ["International Labor Organization", "an American spelling of the organisation, should one be quoted"],
  ["National Snow and Ice Data Center", "the centre's own name"],
  ["Pew Research Center", "the centre's own name"],
];

const seen = new Map();
POOL.forEach((it, i) => {
  const id = "#" + i + " “" + String(it && it.q || "").slice(0, 46) + "…”";
  if (!it || typeof it !== "object") return say(id, "not an object");
  if (typeof it.q !== "string" || !it.q.trim()) say(id, "no question");
  if (!(Number.isInteger(it.a) && it.a >= 2 && it.a <= 98)) say(id, "`a` must be a whole per cent from 2 to 98");
  if (strip(it.why).length > MAX_WHY) say(id, "the explanation is " + strip(it.why).length + " characters — a small paragraph is at most " + MAX_WHY);
  if (!/\?$/.test(String(it.q || "").trim())) say(id, "`q` is not a question");
  if (typeof it.why !== "string" || !it.why.trim()) say(id, "no explanation");
  if (typeof it.cat !== "string" || !it.cat.trim()) say(id, "no category");

  const key = strip(it.q).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (seen.has(key)) say(id, "the same question as #" + seen.get(key));
  else seen.set(key, i);

  // 2. spelling — the US→GB pass must be a no-op on authored text
  ["q", "why"].forEach((f) => {
    let txt = String(it[f] || "");
    const quotes = [];
    txt = txt.replace(QUOTED_RX, (m) => { quotes.push(m); return "\u0000QUOTE" + (quotes.length - 1) + "\u0000"; });
    PROPER_NOUNS.forEach((n, k) => { txt = txt.split(n[0]).join("\u0000NAME" + k + "\u0000"); });
    const gb = SP.spellText(txt, false);
    if (gb !== txt) {
      const a = txt.split(/\s+/), b = gb.split(/\s+/);
      const w = a.map((x, k) => (b[k] !== x ? x + " → " + b[k] : null)).filter(Boolean).slice(0, 4);
      say(id, "`" + f + "` is not British: " + (w.length ? w.join(", ") : "(reflowed)"));
    }
  });

  // 3 + 4. markers and markup
  const src = Array.isArray(it.src) ? it.src : [];
  const marks = [...String(it.why || "").matchAll(/<sup[^>]*data-fn="(\d+)"/g)].map((m) => +m[1]);
  marks.forEach((n) => { if (!(n >= 1 && n <= src.length)) say(id, "a marker points at source " + n + " and there " + (src.length ? "are only " + src.length : "are none") + " — wireFootnotes deletes it"); });
  src.forEach((s, k) => {
    if (typeof s !== "string" || !/https?:\/\/[^\s<>"']+/.test(s)) say(id, "source " + (k + 1) + " carries no URL a reader can open");
    if (marks.indexOf(k + 1) < 0) say(id, "source " + (k + 1) + " is cited by no marker — a reading list, not a footnote");
  });
  // 6. at least three DIFFERENT works (Oct 2026, on request) — counted on the URL, not the note's wording
  const works = new Set(src.map((s) => { const m = /https?:\/\/([^\s<>"']+)/.exec(String(s)); return m ? m[1].toLowerCase().replace(/#.*$/, "").replace(/\/+$/, "") : ""; }).filter(Boolean));
  if (works.size < MIN_SOURCES) say(id, "carries " + works.size + " different source" + (works.size === 1 ? "" : "s") + " — a question ships with at least " + MIN_SOURCES);
  const tags = [...String(it.why || "").matchAll(/<\/?([a-z][a-z0-9]*)/gi)].map((m) => m[1].toLowerCase());
  tags.forEach((t) => { if (["i", "b", "sup"].indexOf(t) < 0) say(id, "`<" + t + ">` in the explanation — sanitizeHTML will drop it"); });

  // 5. units — reported, in both directions
  const both = strip(it.q) + " " + strip(it.why);
  const m = UN.unitizeText(both, true).match(METRIC_RX);
  if (m) notes.push("  metric only    " + id + "  → " + m[0]);
  const mi = UN.unitizeText(both, false).match(IMPERIAL_RX);
  if (mi) notes.push("  IMPERIAL only  " + id + "  → " + mi[0]);
});

const cited = POOL.filter((x) => Array.isArray(x.src) && x.src.length).length;

console.log("What share?: " + POOL.length + " questions, " + cited + " carrying a source (" +
  (POOL.length ? Math.round((cited / POOL.length) * 100) : 0) + "%)");
const cats = {};
POOL.forEach((x) => { cats[x.cat] = (cats[x.cat] || 0) + 1; });
if (VERBOSE) Object.keys(cats).sort().forEach((k) => console.log("  " + String(cats[k]).padStart(4) + "  " + k));

if (notes.length) {
  console.log("\n" + notes.length + " figure" + (notes.length === 1 ? "" : "s") + " neither pass can convert — no bracket beside them:");
  notes.forEach((n) => console.log(n));
}
if (errs.length) {
  console.log("\n" + errs.length + " problem" + (errs.length === 1 ? "" : "s") + ":");
  errs.forEach((e) => console.log(e));
  process.exit(1);
}
console.log("\nshape, spelling, markers, markup, length and two-source rule: clean");
