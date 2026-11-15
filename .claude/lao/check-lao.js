#!/usr/bin/env node
/* The Lao decks' own check: node .claude/lao/check-lao.js
   Reads every decks/Lao-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("alternative form of …"),
   a gloss that is a Lao sentence (an example the extraction filed as a sense), a headword that is not Lao
   script, a level card with no romanisation (or one holding Lao script), a forms label
   the generator does not write, unbalanced HTML, an id out of sequence, two notes sharing an English side
   (the reverse card would have two answers), and on the alphabet two notes sharing a sound side. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
// (a part-of-speech label may name the Lao word it is told apart from -- "pronoun, not ເຂົາເຈົ້າ",
// the shelf-wide dedupe -- so labels are not read as glosses)
const LABELS = new Set(["classifier", "classifiers"]);
const POINTER = /^(?:alternative|obsolete|dated|rare|archaic) (?:form|spelling) of |^(?:synonym|abbreviation) of [^;]*$/i;
const LAO = /^[\u0E80-\u0EFF ]+$/;
const LAO_CH = /[\u0E81-\u0ECD]/g;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Lao-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Lao deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const alphabet = /Alphabet/.test(d.meta.title);
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!LAO.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not Lao script: " + w);
    if (alphabet) {
      if (sides.has(F.Sound)) bad(f + ": " + w + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, w);
      return;
    }
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.Roman) bad(f + ": " + w + " has no romanisation");
    else if (/[\u0E80-\u0EFF]/.test(F.Roman)) bad(f + ": " + w + " romanisation holds Lao script: " + F.Roman);
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of F.English.replace(/<div class="uc-pos">[^<]*<\/div>/g, "").replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n")) {
      const t = g.trim();
      if (POINTER.test(t)) bad(f + ": " + w + " is defined by a pointer: " + t);
      const letters = t.replace(/[^\p{L}]/gu, "");
      if (letters && (t.match(LAO_CH) || []).length * 2 > letters.length) bad(f + ": " + w + " has a Lao sentence for a gloss: " + t);
    }
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const k of ["Lao", "English", "Forms", "Examples"]) {
      const h = F[k];
      for (const t of ["div", "span", "b", "ol", "li"]) {
        const open = (h.match(new RegExp("<" + t + "[ >]", "g")) || []).length;
        const close = (h.match(new RegExp("</" + t + ">", "g")) || []).length;
        if (open !== close) bad(f + ": " + w + " " + k + " has " + open + " <" + t + "> and " + close + " closes");
      }
    }
    // every example names the word it illustrates (the bolded span), or it was matched by mistake
    for (const ex of F.Examples.split('<div class="uc-exi">').slice(1))
      if (!/<b>/.test(ex)) bad(f + ": " + w + " has an example with no word picked out");
    if (sides.has(F.English)) bad(f + ": " + w + " shares its English side with " + sides.get(F.English));
    sides.set(F.English, w);
  });
  console.log("ok    " + f + ": " + d.cards.length + " notes" + (alphabet ? "" : ", " +
    d.cards.filter((c) => c.fields.Forms).length + " with a classifier, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
