#!/usr/bin/env node
/* The Romanian decks' own check: node .claude/romanian/check-romanian.js
   Reads every decks/Romanian-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("inflection of …",
   "alternative form of …"), a headword with a cedilla ş / ţ (the comma-below letters are the right ones)
   or a letter outside Romanian's alphabet, a placeholder cell ("-") in the forms, a forms label the generator
   does not write, unbalanced HTML, an id out of sequence, two notes sharing an English side (the reverse
   card would have two answers). */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["plural", "the …", "feminine", "fem. plural", "I", "participle", "subjunctive"]);
const POINTER = /^(?:alternative|obsolete|dated|rare|archaic) (?:form|spelling) of |^(?:inflection|synonym|plural|feminine|definite)[^;]* of \S+$/i;
// capitals are a phrase's own (slavă Domnului, de la A la Z); a level's headwords are lowercase
const LATIN = /^[a-zăâîșțA-ZĂÂÎȘȚ' -]+$/;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Romanian-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Romanian deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!LATIN.test(w || "")) bad(f + ": card " + (i + 1) + " Word has a letter Romanian does not write (or a cedilla): " + w);
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    if (/<\/span>-<\/span>|"uc-cj-f">-</.test(F.Forms + F.Table)) bad(f + ": " + w + " prints a placeholder cell");
    if (/[şţŞŢ]/.test(F.Romanian + F.Forms + F.Table)) bad(f + ": " + w + " prints a cedilla letter");
    for (const k of ["Romanian", "English", "Forms", "Table", "Examples"]) {
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
  console.log("ok    " + f + ": " + d.cards.length + " notes, " +
    d.cards.filter((c) => c.fields.IPA).length + " with IPA, " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences");
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
