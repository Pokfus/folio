#!/usr/bin/env node
/* The Greek decks' own check: node .claude/greek/check-greek.js
   Reads every decks/Greek-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("inflection of …",
   "nominative plural of …", "see: …", "synonym of …"), a headword that is not Greek, a level card with no
   romanisation, a noun with no article, a forms label the generator does not write, unbalanced HTML, an id
   out of sequence, two notes sharing an English side (the reverse card would have two answers), and on the
   alphabet deck two notes sharing a sound side. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["genitive", "plural", "feminine", "neuter", "past", "future"]);
// a gloss that IS a pointer, anchored at its start
const POINTER = /^(?:alternative|obsolete|dated|rare|polytonic|Katharevousa) (?:form|spelling) of |^(?:inflection|synonym) of |^\*?\s*see:|^(?:nominative|genitive|accusative|vocative|first|second|third)[^;]* of \S+(?: \([^)]*\))?$/i;
const GREEK = /^[Ͱ-Ͽἀ-῿ ]+$/;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Greek-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Greek deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const alphabet = /Alphabet/.test(d.meta.title);
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!GREEK.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not Greek: " + w);
    if (alphabet) {
      if (sides.has(F.Sound)) bad(f + ": " + w + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, w);
      return;
    }
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.Roman) bad(f + ": " + w + " has no romanisation");
    if (!F.English) bad(f + ": " + w + " has no English");
    if (/>noun/.test(F.English) && F.English.indexOf('class="uc-pos">noun') === F.English.indexOf('class="uc-pos">') &&
        !/uc-art/.test(F.Greek)) bad(f + ": " + w + " is a noun with no article");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const k of ["Greek", "English", "Forms", "Table", "Examples"]) {
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
