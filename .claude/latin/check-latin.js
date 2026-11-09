#!/usr/bin/env node
/* The Latin decks' own check: node .claude/latin/check-latin.js
   Reads every decks/Latin-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels (`Key`), a card defined by a pointer rather than English ("alternative form of
   …", "scribal abbreviation of …"), a letter's name standing in for a word (`ā`, `ex`), a noun or verb with no
   dictionary entry (principal parts, or genitive and gender), a speaker text that is not the headword without
   its marks, a forms label the generator does not write, unbalanced HTML, an id out of sequence, two notes
   sharing an English side (the reverse card would have two answers), a type not spoken in the Italian voice. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["comparative", "superlative", "adverb"]);
const POINTER = /^(?:alternative|obsolete|archaic|syncopated|contracted|scribal abbreviation|abbreviation) (?:form|spelling|of)\b|^(?:inflection|form) of \S+$|name of the (?:Latin[- ]script )?letter/i;
const LATIN = /^[a-zà-ɏ̀-ͯ ]+$/;
const bare = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC");
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Latin-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Latin deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  for (const t of Object.values(d.meta.types || {}))
    if (t.speechLang !== "it-IT") bad(f + ": type " + t.id + " speaks " + t.speechLang + ", not it-IT");
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Latin;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!LATIN.test(w || "")) bad(f + ": card " + (i + 1) + " headword is not lower-case Latin: " + w);
    if (F.Word !== bare(w)) bad(f + ": " + w + " is spoken as " + F.Word);
    if (!F.Key) bad(f + ": " + w + " has no Key");
    if (seen.has(F.Key)) bad(f + ": " + w + " is already taught in " + seen.get(F.Key));
    seen.set(F.Key, f);
    if (!F.English) bad(f + ": " + w + " has no English");
    const lead = (/class="uc-pos">([^<,]*)/.exec(F.English) || [])[1] || "";
    if ((lead === "noun" || lead === "verb") && !/uc-ppw/.test(F.Parts)) bad(f + ": " + w + " (" + lead + ") has no dictionary entry");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const k of ["Parts", "English", "Forms", "Table", "Examples"]) {
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
    d.cards.filter((c) => c.fields.Parts).length + " with a dictionary entry, " +
    d.cards.filter((c) => c.fields.Table).length + " with a table, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences");
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
