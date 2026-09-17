#!/usr/bin/env node
/*
  check-spelling-corpus.js — is Folio's own prose authored BRITISH?

    node .claude/check-spelling-corpus.js [--borrowed] [--all]

  WHY THIS EXISTS. `applySpelling` returns at once under en-GB — the authored system — and converts to
  American only for a reader who asks, so the transform is ONE-WAY and an American spelling sitting in the
  data is never corrected for anybody: it is simply what BOTH readers see. Nothing in the pipeline asks
  this of a card, a glossary term or an artefact. `check-style.js` has four rules and spelling is not one
  of them; `check-truefalse.js` asks it, but only of the 220 statements in `truefalse.js`. So the corpus
  has never been swept, and the one figure that matters came out at 38 to 90 the WRONG way: measured over
  the cards' own prose, `Palaeolith`/`Paleolith` runs 38 British to 90 American, which means a BRITISH
  reader meets both spellings of the same term across the prehistory decks while an American meets one.
  (Everything else leans the other way and hard: `centre`/`center` 641 to 3, `colonis`/`coloniz` 128 to 2,
  `civilisation`/`civilization` 112 to 0.) RUN IT rather than quoting any of that.

  THREE THINGS IT SEPARATES, because otherwise the residue is unreadable.

    1. FOLIO'S OWN PROSE against BORROWED TEXT. A citation names a published work and a picture's caption
       and credit are Wikimedia Commons's words; neither may be rewritten — it is the same mask
       `check-style.js` puts over the citations before its own `--fix`, and the one time that mask was
       missing it renamed six real works. Borrowed text is counted apart and printed only under
       `--borrowed`.
    2. A PROPER NAME IS NOT A SPELLING. `Secretary of Labor`, the `Indian Reorganization Act`, the
       `Medal of Honor`, `Pearl Harbor`, the `National Association for the Advancement of Colored People`
       and the fur trader `Robert Gray` are names, and rewriting one invents an institution that does not
       exist. They are DECLARED, with the reason beside each, never pattern-matched: a rule clever enough
       to tell a name from a word would eventually excuse a real one. Add a row only after READING the
       site it excuses.
    3. A GLOSSARY KEY IS A WIKIPEDIA SLUG and is never a fault. `Paleolithic`, `Periodization`,
       `Saber-toothed_cat` and `Indian_Reorganization_Act` are the article titles the house rule asks
       for, and each carries the British form as an ALIAS already, so the auto-link fires either way. What
       is reported here is the PROSE, and whether a term's own description should spell the term the
       British way is a judgement about that term — which is why this reports and never fixes.

  IT IS A REPORT TOOL, RUN BY HAND, AND EXITS 0. There is a standing residue and most of it is the
  `palaeo-` family, which is a house-style decision rather than drift. Not part of the site.
*/
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const ARGS = process.argv.slice(2);
const SHOW_BORROWED = ARGS.includes("--borrowed") || ARGS.includes("--all");

/* THE ENGINE IS app.js's OWN, SLICED BY TEXT, AND THE RUN STOPS IF THE SLICE FAILS — `check-truefalse.js`'s
   rule. A second copy of a 148-row table goes stale on a change made in a file nobody here has reason to
   open, and would then answer differently on exactly the words this is meant to find. */
const APP = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const a = APP.indexOf("  const SPELLINGS ="), b = a < 0 ? -1 : APP.indexOf("  function setSpelling(", a);
if (a < 0 || b < 0) { console.error("ERROR: could not slice the spelling engine out of app.js — the anchors moved."); process.exit(2); }
const SP = new Function("S", APP.slice(a, b) + "\nreturn { spellText: spellText };")({ settings: { spelling: "en-GB" } });

/* DECLARED, WITH A REASON EACH. */
const NAMES = [
  [/\bOrganization (?:of|for)\b[^,.;<]*/g, "an organisation's own name — the Oglala Sioux Civil Rights Organization, the Organization of American States"],
  [/\b(?:World Health|International Labou?r|Educational, Scientific and Cultural|Food and Agriculture|North Atlantic Treaty|World Trade|World Meteorological|International Maritime|International Civil Aviation|International Standards?|Treaty|Aviation)\s+Organization\b/gi, "ditto, written the other way round"],
  [/\bNational Centers for Environmental Information\b/g, "NOAA's own name for itself"],
  [/\bInternational Trade Organization\b/g, "the body the Havana Charter of 1948 failed to create"],
  [/\bOglala Sioux Civil Rights Organization\b/g, "the organisation's own name"],
  [/\bElisha Gray\b/g, "the telephone claimant \u2014 the standing row in check-truefalse.js's own table"],
  [/'civilized'/g, "a word quoted AS a word, in a card explaining why the name fell out of use"],
  [/\bIndian Reorganization Act\b/g, "a statute of 1934"],
  [/\bSecretary of Labor\b/g, "a United States cabinet office"],
  [/\bIndian Manual Labor Training School\b/g, "an institution's own name"],
  [/\bMedal of Honor\b/g, "the decoration's own name"],
  [/\bNational Association for the Advancement of Colored People\b/g, "the association's own name, and the phrase is of its period"],
  [/\bFive Civilized Tribes\b/g, "a historical phrase the card itself flags as one"],
  [/\bPearl Harbor\b|\bBar Harbor\b|\bHarbor (?:Branch|Island|Springs)\b/g, "place names"],
  [/\bRobert Gray\b|\bGrays Harbor\b/g, "the fur trader who found the Columbia, and the harbour named after him"],
  [/\bthe Armory\b|\bArmory\b(?=<|\s*opened|\s+Building|\s+Show)/g, "the University of Wisconsin building, known as the Armory \u2014 including as a bare date-line label"],
  [/\bPaleo-?(?:Indian|Eskimo|Arctic|Aleut)[a-z]*\b/gi, "the culture's established name in the literature, and a glossary key with the British form aliased"],
];
const mask = (t) => NAMES.reduce((s, [rx]) => s.replace(rx, (m) => "@".repeat(m.length)), t);

/* JUDGED AND LEFT AS THEY ARE. `CROSSREF_WRONG`'s rule: a row matches only when the ITEM and the WORD
   both agree, so a different American spelling creeping into an excused item still reports. Add a row
   only after reading the item, and write the reason. */
const KEPT = {
  "bio-048|fetus": "the form modern British scientific and medical writing uses; `foetus` is the older general spelling and an etymological error besides, the Latin being fetus",
  "gloss:Saber-toothed_cat|Saber": "the term's own name \u2014 the key is the Wikipedia slug and the machairodont literature writes it this way",
  "gloss:Saber-toothed_cat|saber": "ditto, mid-sentence",
  "gloss:Smilodon|saber": "the same animal's name, in the term that defines the genus",
  "gloss:Periodization|Periodization": "the term naming itself; the key is the Wikipedia slug",
  "gloss:Periodization|periodization": "ditto, mid-sentence",
  "gloss:Functional_specialization_(brain)|specialization": "the term naming itself; its own next clause already writes `localisation`, which is the house spelling for everything that is not the term",
};
let keptHits = 0;

global.window = {};
const { loadCards } = require(path.join(ROOT, ".claude/card-io.js"));
const { loadGlossary } = require(path.join(ROOT, ".claude/gloss-io.js"));
const { loadArtefacts } = require(path.join(ROOT, ".claude/artefact-io.js"));

const own = new Map(), borrowed = new Map();
const note = (bag, key, where) => { if (!bag.has(key)) bag.set(key, new Set()); bag.get(key).add(where); };
const look = (bag, where, txt) => {
  if (typeof txt !== "string" || !txt) return;
  const plain = mask(txt);
  const gb = SP.spellText(plain, false);
  if (gb === plain) return;
  const x = plain.split(/(\W+)/), y = gb.split(/(\W+)/);
  for (let k = 0; k < x.length && k < y.length; k++) {
    if (x[k] === y[k]) continue;
    if (KEPT[where + "|" + x[k]]) { keptHits++; continue; }
    note(bag, x[k] + " \u2192 " + y[k], where);
  }
};

const { cards } = loadCards();
cards.forEach((c) => {
  ["question", "answer", "answerDate", "abstract", "answerText"].forEach((f) => look(own, c.id, c[f]));
  (c.questions || []).forEach((q) => look(own, c.id, q));
  (c.why || []).forEach((w) => { look(own, c.id, w.q); look(own, c.id, w.a); });
  (c.facts || []).forEach((r) => { look(own, c.id, r[0]); look(own, c.id, r[1]); });
  if (c.quote) look(borrowed, c.id, c.quote.text);
  if (c.image) ["title", "desc", "alt", "credit"].forEach((f) => look(borrowed, c.id, c.image[f]));
  (c.sources || []).forEach((s) => look(borrowed, c.id, s));
});
const G = loadGlossary();
Object.keys(G.GLOSSARY || {}).forEach((k) => look(own, "gloss:" + k, G.GLOSSARY[k]));
Object.keys(G.GLOSSARY_SOURCES || {}).forEach((k) => (G.GLOSSARY_SOURCES[k] || []).forEach((s) => look(borrowed, "gloss:" + k, s)));
Object.keys(G.GLOSSARY_IMAGES || {}).forEach((k) => { const im = G.GLOSSARY_IMAGES[k] || {}; ["title", "desc", "alt", "credit"].forEach((f) => look(borrowed, "gloss:" + k, im[f])); });
const arte = loadArtefacts();
(arte.artefacts || arte || []).forEach((x) => {
  look(own, "art:" + x.id, x.desc);
  (x.sources || []).forEach((s) => look(borrowed, "art:" + x.id, s));
  if (x.image) ["desc", "alt", "credit"].forEach((f) => look(borrowed, "art:" + x.id, x.image[f]));
});
require(path.join(ROOT, "truefalse.js"));
(window.TRUEFALSE || []).forEach((s, i) => { look(own, "tf:#" + i, s.q); look(own, "tf:#" + i, s.why); (s.src || []).forEach((c) => look(borrowed, "tf:#" + i, c)); });

function report(title, bag, note2) {
  const rows = [...bag.entries()].sort((p, q) => q[1].size - p[1].size);
  const all = new Set(); rows.forEach(([, s]) => s.forEach((x) => all.add(x)));
  console.log("\n" + title + ": " + rows.length + " distinct spellings over " + all.size + " items");
  if (note2) console.log("  " + note2);
  rows.forEach(([k, s]) => console.log(String(s.size).padStart(5) + "  " + k + "   " + [...s].slice(0, 6).join(", ") + (s.size > 6 ? ", \u2026" : "")));
}
report("FOLIO'S OWN PROSE", own, "each of these is shown to a BRITISH reader exactly as it is stored");
if (SHOW_BORROWED) report("BORROWED (citations, captions, credits, quoted passages)", borrowed, "not a fault: a published title and a Commons caption are somebody else's words");
else console.log("\nborrowed text (citations, captions, credits) is counted apart and hidden \u2014 pass --borrowed to see it: " + borrowed.size + " distinct");
console.log("\n" + NAMES.length + " declared proper-name rows masked before the compare, and " + Object.keys(KEPT).length +
  " judged spellings kept (" + keptHits + " matched). Report only; nothing written.");
