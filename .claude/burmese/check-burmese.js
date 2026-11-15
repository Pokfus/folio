#!/usr/bin/env node
/* The Burmese decks' own check: node .claude/burmese/check-burmese.js
   Reads every decks/Burmese-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a headword that is not plain Myanmar script (or carries a Zawgyi-only code point,
   U+1060–U+1097), a card with no reading or a reading in the Myanmar script, a card defined by a pointer rather
   than English ("alternative form of …"), a forms label the generator does not write, a literary spelling shown
   as another form of a spoken word's (the fault Wiktionary's tagged alternatives produced), a speaker button (few
   devices have a Burmese voice — the Hausa rule), unbalanced HTML, an id out of sequence, and two notes sharing an
   English side (the reverse card would have two answers). The Alphabet deck is checked for its own: a unique
   letter side and a unique sound side. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["counted with", "possessive", "other forms"]);
const POINTER = /^(?:alternative form of|alternative spelling of|form of|synonym of|abbreviation of|short for|contraction of)\b/i;
const MY = /^[က-ၟ]+$/;
const ZAWGYI = /[ၠ-႗]/;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Burmese-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Burmese deck in decks/");
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
  for (const t of Object.values(d.meta.types))
    for (const c of t.cards) if (/uc-tts/.test(c.front + c.back)) bad(f + ": template " + c.name + " has a speaker button");
  const sides = new Map(), letters = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (abc) {
      if (sides.has(F.Sound)) bad(f + ": card " + (i + 1) + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, i + 1);
      if (letters.has(F.Letter)) bad(f + ": card " + (i + 1) + " shares its letter side with " + letters.get(F.Letter));
      letters.set(F.Letter, i + 1);
      for (const k of ["Letter", "Row", "Sound", "Example"]) balanced(f, "card " + (i + 1), k, F[k]);
      return;
    }
    const w = F.Word;
    if (!MY.test(w || "") || ZAWGYI.test(w)) bad(f + ": card " + (i + 1) + " Word is not plain Myanmar script: " + w);
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.Roman || /[က-႟]/.test(F.Roman)) bad(f + ": " + w + " has no Latin reading: " + F.Roman);
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of text(F.English).split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    if (ZAWGYI.test(F.Forms + F.Examples)) bad(f + ": " + w + " has a Zawgyi code point in its forms or sentences");
    for (const k of ["Burmese", "English", "Forms", "Examples"]) balanced(f, w, k, F[k]);
    if (sides.has(F.English)) bad(f + ": " + w + " shares its English side with " + sides.get(F.English));
    sides.set(F.English, w);
  });
  console.log("ok    " + f + ": " + d.cards.length + " notes" + (abc ? "" : ", " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
