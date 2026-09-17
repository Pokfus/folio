#!/usr/bin/env node
/*
  check-truefalse.js — the True-or-False pool, held to the site's own content rules.

    node .claude/check-truefalse.js [--verbose]

  WHY THIS EXISTS. `truefalse.js` is a pool of statements a reader is shown and a `why` that explains each
  one, and until Sep 2026 the page wrote that `why` into the document with `esc()` — so it could carry no
  citation, no glossary link and no markup. The request that changed it ("'True or False' minigame
  explanations should have gloss terms, source citations and metric/imperial uk/us versions") is three
  things, and only two of them are code: the third is a CONTENT rule, because the units and the spelling
  passes are standing observers over the whole document already and can convert only what the prose
  offers them — a figure with an imperial bracket beside it, and a word the authored British spelling
  covers. Nothing else in the pipeline looks at this file at all: `check-style.js` sweeps it for BCE/CE
  and stops there.

  WHAT IT CHECKS, and which half is a refusal.

    1. SHAPE          — `q`, `a`, `why`, `cat` present and of the right type; no duplicate statement.
    2. SPELLING       — the authored text is BRITISH. `applySpelling` is ONE-WAY (en-GB is the authored
                        system and it converts only towards American), so an American spelling in here is
                        never corrected for anybody: it is simply what both readers see. The test is
                        app.js's own `spellText(txt, false)` — the US→GB direction — sliced out rather
                        than a word list of our own.
    3. MARKERS        — a `<sup class="fn" data-fn="N">` points at a source the entry actually has.
                        `wireFootnotes` REMOVES a marker with no entry behind it, so this fails silently
                        on the page: the sentence simply loses its number.
    4. MARKUP         — the `why` is rendered through `sanitizeHTML`, so a tag the allowlist drops is a
                        tag the author will never see again. Only `<i>`, `<b>` and the footnote `<sup>`
                        are expected here.

  …and REPORTED rather than refused, because each needs a judgement:

    5. UNITS          — a metric figure the imperial pass cannot convert, i.e. one with no bracket beside
                        it. The pass is `unitizeText(txt, true)`, again sliced out of app.js, and what is
                        reported is a metric unit still standing after it.
    6. CITATIONS      — how many entries carry a source. A `why` is one to three sentences, so the bar is
                        ONE work a reader can open, and it is stated here rather than enforced while the
                        pool still carries entries written before the field existed.

  Zero dependencies. Not part of the site.
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
const SP = new Function("S", spellSrc + "\nreturn { spellText: spellText };")({ settings: { spelling: "en-GB" } });
const UN = new Function("S", unitSrc + "\nreturn { unitizeText: unitizeText };")({ settings: { units: "metric" } });

const win = {};
new Function("window", fs.readFileSync(path.join(ROOT, "truefalse.js"), "utf8"))(win);
const POOL = win.TRUEFALSE || [];

const strip = (s) => String(s || "").replace(/<[^>]*>/g, "");
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
const PROPER_NOUNS = [
  ["Elisha Gray", "the inventor who filed a caveat for the telephone on the same day as Bell"],
];

const seen = new Map();
POOL.forEach((it, i) => {
  const id = "#" + i + " “" + String(it && it.q || "").slice(0, 46) + "…”";
  if (!it || typeof it !== "object") return say(id, "not an object");
  if (typeof it.q !== "string" || !it.q.trim()) say(id, "no statement");
  if (typeof it.a !== "boolean") say(id, "`a` must be true or false");
  if (typeof it.why !== "string" || !it.why.trim()) say(id, "no explanation");
  if (typeof it.cat !== "string" || !it.cat.trim()) say(id, "no category");

  const key = strip(it.q).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (seen.has(key)) say(id, "the same statement as #" + seen.get(key));
  else seen.set(key, i);

  // 2. spelling — the US→GB pass must be a no-op on authored text
  ["q", "why"].forEach((f) => {
    let txt = String(it[f] || "");
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
  const tags = [...String(it.why || "").matchAll(/<\/?([a-z][a-z0-9]*)/gi)].map((m) => m[1].toLowerCase());
  tags.forEach((t) => { if (["i", "b", "sup"].indexOf(t) < 0) say(id, "`<" + t + ">` in the explanation — sanitizeHTML will drop it"); });

  // 5. units — reported
  const both = strip(it.q) + " " + strip(it.why);
  const imp = UN.unitizeText(both, true);
  const m = imp.match(METRIC_RX);
  if (m) notes.push("  units   " + id + "  → " + m[0]);
});

const cited = POOL.filter((x) => Array.isArray(x.src) && x.src.length).length;

console.log("True or False: " + POOL.length + " statements, " + cited + " carrying a source (" +
  (POOL.length ? Math.round((cited / POOL.length) * 100) : 0) + "%)");
const cats = {};
POOL.forEach((x) => { cats[x.cat] = (cats[x.cat] || 0) + 1; });
if (VERBOSE) Object.keys(cats).sort().forEach((k) => console.log("  " + String(cats[k]).padStart(4) + "  " + k));

if (notes.length) {
  console.log("\n" + notes.length + " metric figure" + (notes.length === 1 ? "" : "s") + " the imperial pass cannot convert — no bracket beside it:");
  notes.forEach((n) => console.log(n));
}
if (errs.length) {
  console.log("\n" + errs.length + " problem" + (errs.length === 1 ? "" : "s") + ":");
  errs.forEach((e) => console.log(e));
  process.exit(1);
}
console.log("\nshape, spelling, markers and markup: clean");
