#!/usr/bin/env node
/* The Tamil decks' own check: node .claude/tamil/check-tamil.js
   Reads every decks/Tamil-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("sociative of …",
   "inflection of …"), a headword that is not Tamil script, a level card with no romanisation, a forms label
   the generator does not write, unbalanced HTML, an id out of sequence, two notes sharing an English side
   (the reverse card would have two answers). */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["plural", "accusative", "locative", "dative", "past (நான்)", "infinitive", "having …"]);
// a gloss that IS a pointer, anchored at its start: "instrumental case of அது" alone defines nothing
const POINTER = /^(?:alternative|obsolete|dated|rare|colloquial) (?:form|spelling) of |^(?:inflection|synonym) of [^;]*$|^(?:nominative|accusative|dative|genitive|locative|sociative|instrumental|ablative|vocative|benefactive)[^;]* of \S+(?: \([^)]*\))?$/i;
const TAMIL = /^[\u0B80-\u0BFF\u200C\u200D ]+$/;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Tamil-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Tamil deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const alphabet = /Alphabet/.test(d.meta.title);
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!TAMIL.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not Tamil script: " + w);
    if (alphabet) {
      if (sides.has(F.Sound)) bad(f + ": " + w + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, w);
      return;
    }
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.Roman) bad(f + ": " + w + " has no romanisation");
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const k of ["Tamil", "English", "Forms", "Table", "Examples"]) {
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
