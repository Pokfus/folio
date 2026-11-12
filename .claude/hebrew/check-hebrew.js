#!/usr/bin/env node
/* The Hebrew decks' own check: node .claude/hebrew/check-hebrew.js
   Reads every decks/Hebrew-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a pointed word taught twice (on one level or two), a card defined by a pointer rather than English
   ("defective spelling of …", "plural of …"), a headword not in the Hebrew script or carrying vowel points
   (the headword is the UNPOINTED spelling; the points belong in `Pointed`), a `Pointed` with no points, a
   level card with no romanisation or one in a Biblical or scholarly system (ʕ ā ḥ q …), a Hebrew run with no
   dir="rtl", a forms label the generator does not write, unbalanced HTML, an id out of sequence, two notes
   sharing an English side (the reverse card would have two answers). */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["plural", "infinitive", "present", "future", "binyan", "feminine", "fem. plural"]);
const POINTER = /^(?:alternative|obsolete|dated|rare|defective|plene|pausal|misspelling|dialectal) (?:form|spelling) of |^(?:inflection|synonym|plural|bare infinitive|to-infinitive) of [^;]*$/i;
const HEBREW = /^[א-ת׳' "-]+$/;
const POINTS = /[֑-ׇ]/;
const SCHOLARLY = /[ʕʿʾāēīōūăĕŏəɔḥṭṣšq]/;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const text = (h) => (h || "").replace(/<[^>]+>/g, "");
const files = fs.readdirSync(DIR).filter((f) => /^Hebrew-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Hebrew deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const alphabet = /Alphabet/.test(d.meta.title);
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (alphabet) {
      const front = F.Sound + F.Clue;
      if (sides.has(front)) bad(f + ": " + w + " shares its sound side with " + sides.get(front));
      sides.set(front, w);
      if (!/dir="rtl"/.test(F.Letter)) bad(f + ": " + w + " letter is not marked right to left");
      return;
    }
    if (!HEBREW.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not unpointed Hebrew: " + w);
    if (POINTS.test(w || "")) bad(f + ": " + w + " Word carries vowel points");
    const p = text(F.Pointed);
    if (F.Pointed && !POINTS.test(p)) bad(f + ": " + w + " Pointed has no points: " + p);
    const k = w + "|" + p;
    if (seen.has(k)) bad(f + ": " + w + " " + p + " is already taught in " + seen.get(k));
    seen.set(k, f);
    if (!F.Roman) bad(f + ": " + w + " has no romanisation");
    if (SCHOLARLY.test(F.Roman)) bad(f + ": " + w + " romanisation is not the modern one: " + F.Roman);
    if (!F.English) bad(f + ": " + w + " has no English");
    if (!/dir="rtl"/.test(F.Hebrew)) bad(f + ": " + w + " headword is not marked right to left");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const k2 of ["Hebrew", "Pointed", "English", "Forms", "Table", "Examples"]) {
      const h = F[k2];
      for (const t of ["div", "span", "b", "ol", "li"]) {
        const open = (h.match(new RegExp("<" + t + "[ >]", "g")) || []).length;
        const close = (h.match(new RegExp("</" + t + ">", "g")) || []).length;
        if (open !== close) bad(f + ": " + w + " " + k2 + " has " + open + " <" + t + "> and " + close + " closes");
      }
    }
    if (sides.has(F.English)) bad(f + ": " + w + " shares its English side with " + sides.get(F.English));
    sides.set(F.English, w);
  });
  console.log("ok    " + f + ": " + d.cards.length + " notes" + (alphabet ? "" : ", " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Table).length + " with tables, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
