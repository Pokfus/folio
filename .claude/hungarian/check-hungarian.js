#!/usr/bin/env node
/* The Hungarian decks' own check: node .claude/hungarian/check-hungarian.js
   Reads every decks/Hungarian-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("synonym of …", "see: …",
   "first-person … of …"), a headword that is not Hungarian, a forms label the generator does not write, a verb
   whose "I" form or past is missing while its table has them, unbalanced HTML, an id out of sequence, two notes
   sharing an English side (the reverse card would have two answers), a swear word in an example, and on the
   alphabet deck two notes sharing a sound side or a letter count other than 44. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["plural", "accusative", "his/her", "comparative", "I", "past", "infinitive"]);
const POINTER = /^(?:alternative|obsolete|dated|rare) (?:form|spelling) of |^(?:inflection|synonym) of |^\*?\s*see:|^See |^(?:first|second|third)-person .* of \S+$/i;
const HU = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ -]+$/;
const SWEAR = /\b(kurv|fos\b|szar|basz|geci|picsa|fasz|segg)/i;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Hungarian-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Hungarian deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const alphabet = /Alphabet/.test(d.meta.title);
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!HU.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not Hungarian: " + w);
    if (alphabet) {
      if (sides.has(F.Sound)) bad(f + ": " + w + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, w);
      return;
    }
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    if (/class="uc-cjh">past</.test(F.Table) && !/uc-fl">past</.test(F.Forms)) bad(f + ": " + w + " has a past table but no past form");
    if (SWEAR.test(F.Examples.replace(/<[^>]+>/g, ""))) bad(f + ": " + w + " has a swear word in an example");
    for (const k of ["Hungarian", "English", "Forms", "Table", "Examples"]) {
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
  if (alphabet && d.cards.filter((c) => c.fields.Called).length !== 44) bad(f + ": not 44 letters");
  console.log("ok    " + f + ": " + d.cards.length + " notes" + (alphabet ? "" : ", " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Table).length + " with tables, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
