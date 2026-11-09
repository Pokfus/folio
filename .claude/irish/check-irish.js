#!/usr/bin/env node
/* The Irish decks' own check: node .claude/irish/check-irish.js
   Reads every decks/Irish-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("inflection of …",
   "first-person singular present indicative of …"), a forms label the generator does not write, an IPA
   string that is not a transcription, unbalanced HTML, an id out of sequence, two notes sharing an
   English side (the reverse card would have two answers). */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["genitive", "plural", "the", "comparative", "past", "verbal noun", "future"]);
const POINTER = /^(?:alternative|obsolete|dated|rare) (?:form|spelling) of |^inflection of [^;]*$|^(?:(?:first|second|third)-person |singular |plural |present |past |future |conditional |imperative |indicative |subjunctive |habitual |genitive |vocative |dative |analytic |autonomous |dependent |independent |relative |\/)+of \S+$/i;
const IPA = /^\/[^()/;]+\/(?: ~ \/[^()/;]+\/)*$/;
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
    if (!w) bad(f + ": card " + (i + 1) + " has no Word");
    const k = (w || "").toLowerCase();
    if (seen.has(k)) bad(f + ": " + w + " is already taught in " + seen.get(k));
    seen.set(k, f);
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const [, t] of F.IPA.matchAll(/class="uc-ip">([^<]*)</g)) if (!IPA.test(t.replace(/&#x27;/g, "'"))) bad(f + ": " + w + " IPA " + t);
    for (const key of ["Irish", "IPA", "English", "Forms", "Table", "Examples"]) {
      const h = F[key];
      for (const t of ["div", "span", "b", "ol", "li"]) {
        const open = (h.match(new RegExp("<" + t + "[ >]", "g")) || []).length;
        const close = (h.match(new RegExp("</" + t + ">", "g")) || []).length;
        if (open !== close) bad(f + ": " + w + " " + key + " has " + open + " <" + t + "> and " + close + " closes");
      }
    }
    if (sides.has(F.English)) bad(f + ": " + w + " shares its English side with " + sides.get(F.English));
    sides.set(F.English, w);
  });
  console.log("ok    " + f + ": " + d.cards.length + " notes, " +
    d.cards.filter((c) => c.fields.IPA).length + " with IPA, " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Table).length + " with tables, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences");
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
