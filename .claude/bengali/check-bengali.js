#!/usr/bin/env node
/* The Bengali decks' own check: node .claude/bengali/check-bengali.js
   Reads every decks/Bengali-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("alternative form of …",
   "objective of …"), a headword that is not in the Bengali script, a level card with no romanisation, a forms label
   the generator does not write, unbalanced HTML, an id out of sequence, two notes sharing an English side
   (the reverse card would have two answers), a table cell the y-stem template botched (সময়য়ের). */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["the", "plural", "of", "present", "past", "having done", "objective", "possessive"]);
// a gloss that IS a pointer, anchored at its start: "my; genitive of আমি (ami)" carries its meaning
const POINTER = /^(?:alternative|obsolete|dated|rare|sadhu) (?:form|spelling) of |^(?:inflection|synonym) of [^;]*$|^(?:objective|genitive|possessive|locative|oblique)[^;]* of \S+(?: \([^)]*\))?$|^(?:first|second|third)-person[^;]* of /i;
const BENG = /^[\u0980-\u09FF\u200C\u200D ]+$/;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Bengali-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Bengali deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const alphabet = /Alphabet/.test(d.meta.title);
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!BENG.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not in the Bengali script: " + w);
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
    for (const k of ["Bengali", "English", "Forms", "Table", "Examples"]) {
      const h = F[k];
      for (const t of ["div", "span", "b", "ol", "li"]) {
        const open = (h.match(new RegExp("<" + t + "[ >]", "g")) || []).length;
        const close = (h.match(new RegExp("</" + t + ">", "g")) || []).length;
        if (open !== close) bad(f + ": " + w + " " + k + " has " + open + " <" + t + "> and " + close + " closes");
      }
    }
    if (/\u09AF\u09BC\u09AF\u09BC/.test(F.Forms + F.Table)) bad(f + ": " + w + " carries a doubled য় in its forms");
    if (sides.has(F.English)) bad(f + ": " + w + " shares its English side with " + sides.get(F.English));
    sides.set(F.English, w);
  });
  console.log("ok    " + f + ": " + d.cards.length + " notes" + (alphabet ? "" : ", " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
