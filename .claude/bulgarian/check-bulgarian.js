#!/usr/bin/env node
/* The Bulgarian decks' own check: node .claude/bulgarian/check-bulgarian.js
   Reads every decks/Bulgarian-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("inflection of …",
   "synonym of …", a letter's name), a headword that is not Bulgarian Cyrillic or carries a letter Bulgarian
   lacks (ы э ё і ї є ґ, the Serbian ј, the pre-1945 ѣ ѫ), a word of two or more syllables with no stress mark
   or with two, a speaker field carrying a stress mark, a forms label the generator does not write, unbalanced
   HTML, an id out of sequence, two notes sharing an English side (the reverse card would have two answers).
   ѝ ("her") carries a grave as its spelling, not as a stress mark, and is allowed. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["the", "plural", "after a number", "feminine", "neuter", "ти", "past", "perfective", "imperfective", "pair"]);
const POINTER = /^(?:alternative|obsolete|dated|rare) (?:form|spelling) of |^(?:inflection|synonym) of |^The name of the |letter of the Bulgarian alphabet|^only used in |^see |\bparticiple of |^in idioms$/i;
const BG = /^[А-ЩЪЬЮЯа-щъьюяѝ́ \-]+$/;
const NOT_BG = /[ыэёєіїґўјљњћџѓќѕѣѫѭЫЭЁЄІЇҐЈЉЊЋЏЃЌЅѢѪ]/;
const VOWELS = /[аеиоуъюяАЕИОУЪЮЯ]/g;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Bulgarian-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Bulgarian deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const alphabet = /Alphabet/.test(d.meta.title);
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!BG.test(w || "") || NOT_BG.test(w)) bad(f + ": card " + (i + 1) + " Word is not Bulgarian: " + w);
    if (/́/.test(w)) bad(f + ": card " + (i + 1) + " Word carries a stress mark (the speaker reads it): " + w);
    if (alphabet) {
      if (sides.has(F.Sound)) bad(f + ": " + w + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, w);
      return;
    }
    const key = w.toLowerCase();
    if (seen.has(key)) bad(f + ": " + w + " is already taught in " + seen.get(key));
    seen.set(key, f);
    for (const part of F.Bulgarian.split(/[ \-]/)) {
      if (part === "ѝ") continue;
      const n = (part.match(VOWELS) || []).length, s = (part.match(/́/g) || []).length;
      if (n >= 2 && s !== 1) bad(f + ": " + F.Bulgarian + " has " + s + " stress marks on a word of " + n + " syllables");
      if (n < 2 && s) bad(f + ": " + F.Bulgarian + " marks the stress of a one-syllable word");
    }
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const k of ["English", "Forms", "Table", "Examples"]) {
      const h = F[k];
      for (const t of ["div", "span", "b", "ol", "li"]) {
        const open = (h.match(new RegExp("<" + t + "[ >]", "g")) || []).length;
        const close = (h.match(new RegExp("</" + t + ">", "g")) || []).length;
        if (open !== close) bad(f + ": " + w + " " + k + " has " + open + " <" + t + "> and " + close + " closes");
      }
    }
    if (sides.has(F.English)) bad(f + ": " + w + " shares its English side with " + sides.get(F.English));
    sides.set(F.English, w);
  });
  console.log("ok    " + f + ": " + d.cards.length + " notes" + (alphabet ? "" : ", " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
