#!/usr/bin/env node
/* The Irish decks' own check: node .claude/irish/check-irish.js
   Reads every decks/Irish-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("genitive singular of …",
   "past … of …", "see: …", "synonym of …"), a card with no English (`ba` printed none until its gloss was
   written), an English side made only of a dedupe label, a headword that is not Irish, a noun with no gender
   in its label, a forms label the generator does not write, unbalanced HTML, an id out of sequence, and two
   notes sharing an English side (the reverse card would have two answers). */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["with the article", "genitive", "plural", "comparative", "present", "past", "future", "verbal noun", "emphatic"]);
// a gloss that IS a pointer, anchored at its start
const POINTER = /^(?:alternative|obsolete|dated|rare|pronunciation) (?:form|spelling) of |^(?:inflection|synonym) of |^\*?\s*see:|^(?:genitive|vocative|dative|nominative|plural|present|past|future|conditional|imperative|comparative|superlative|verbal noun)[^;]* of \S+(?: \([^)]*\))?$/i;
const SWEDISH = /^[a-zA-ZáéíóúÁÉÍÓÚ][a-zA-ZáéíóúÁÉÍÓÚ \-]*$/;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Irish-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Irish deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!SWEDISH.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not Irish: " + w);
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.English) bad(f + ": " + w + " has no English");
    const firstPos = (F.English.match(/class="uc-pos">([^<]*)</) || [])[1] || "";
    if (/^noun/.test(firstPos) && /genitive/.test(F.Forms) && !/ /.test(w) && !/masculine|feminine|plural only/.test(firstPos)) bad(f + ": " + w + " is a noun with no gender");
    if (!F.English.replace(/<[^>]+>/g, " ").replace(/\(not [^)]*\)|, not \S+/g, "").replace(/noun|verb|adjective|adverb|pronoun|preposition|determiner|conjunction|particle|interjection|number|phrase|article|masculine|feminine|transitive|intransitive|,/g, "").trim()) bad(f + ": " + w + " has an English side of labels only");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const k of ["Irish", "English", "Forms", "Table", "Examples"]) {
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
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences");
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
