#!/usr/bin/env node
/* The Amharic decks' own check: node .claude/amharic/check-amharic.js
   Reads every decks/Amharic-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a headword that is not plain Ethiopic script, a card with no romanisation or
   one that is not Latin, a card defined by a pointer rather than English ("alternative form of …",
   "infinitive of …"), a forms label the generator does not write, a form with a character outside the
   alphabet (Wiktionary's generated tables carry a few: ፀሐዯ), a speaker button (no device it would help has
   an Amharic voice — the Hausa rule), unbalanced HTML, an id out of sequence, and two notes sharing an
   English side (the reverse card would have two answers). The Fidäl deck is checked for its own: a unique
   sound side, a romanised row. The phrases deck for what applies to a phrase or a sentence: its two
   subdecks, Ethiopic on the front, no phrase a level teaches (compared as spelt), a Tatoeba number on
   every sentence, balanced HTML, a unique English side. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["plural", "the …", "infinitive", "also spelt"]);
const POINTER = /^(?:alternative form of|alternative spelling of|form of|prothetic form of|aphetic form of|synonym of|infinitive of|plural of)\b/i;
const ETH = /^[ሀ-ፚⶀ-⷟]+(?: [ሀ-ፚⶀ-⷟]+)*$/;
const OUTSIDE = /[ዯፇፗ]/;   // a Unicode slot the Amharic table leaves empty, seen in Wiktionary's tables
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Amharic-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Amharic deck in decks/");
const seen = new Map();
const text = (h) => h.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "");
const balanced = (f, w, k, h) => {
  for (const t of ["div", "span", "b", "ol", "li"]) {
    const open = (h.match(new RegExp("<" + t + "[ >]", "g")) || []).length;
    const close = (h.match(new RegExp("</" + t + ">", "g")) || []).length;
    if (open !== close) bad(f + ": " + w + " " + k + " has " + open + " <" + t + "> and " + close + " closes");
  }
};
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const abc = /Alphabet/.test(d.meta.title);
  const phr = /Phrases/.test(d.meta.title);
  for (const t of Object.values(d.meta.types))
    for (const c of t.cards) if (/uc-tts/.test(c.front + c.back)) bad(f + ": template " + c.name + " has a speaker button");
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (abc) {
      if (sides.has(F.Sound)) bad(f + ": card " + (i + 1) + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, i + 1);
      for (const k of ["Letter", "Row", "Sound", "Example"]) balanced(f, "card " + (i + 1), k, F[k]);
      return;
    }
    const w = F.Word;
    if (phr) {
      if (!["Phrases", "Sentences"].includes(c.sub)) bad(f + ": " + w + " is in subdeck " + c.sub);
      if (!/[\u1200-\u135A]/.test(w || "")) bad(f + ": card " + (i + 1) + " has no Ethiopic: " + w);
      if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
      if (c.sub === "Phrases" && !F.Roman) bad(f + ": phrase " + w + " has no romanisation");
      if (c.sub === "Sentences" && !/Tatoeba #\d+/.test(F.English)) bad(f + ": sentence " + w + " has no Tatoeba number");
      for (const k of ["Amharic", "English"]) balanced(f, w, k, F[k]);
      if (sides.has(F.English)) bad(f + ": " + w + " shares its English side with " + sides.get(F.English));
      sides.set(F.English, w);
      return;
    }
    if (!ETH.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not plain Ethiopic: " + w);
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.Roman || /[ሀ-፿]/.test(F.Roman)) bad(f + ": " + w + " has no Latin romanisation: " + F.Roman);
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of text(F.English).split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    if (OUTSIDE.test(F.Forms)) bad(f + ": " + w + " has a form with a character outside the alphabet");
    for (const k of ["Amharic", "English", "Forms", "Examples"]) balanced(f, w, k, F[k]);
    if (sides.has(F.English)) bad(f + ": " + w + " shares its English side with " + sides.get(F.English));
    sides.set(F.English, w);
  });
  console.log("ok    " + f + ": " + d.cards.length + " notes" + (abc || phr ? "" : ", " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
