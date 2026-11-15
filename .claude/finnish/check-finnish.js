#!/usr/bin/env node
/* The Finnish decks' own check: node .claude/finnish/check-finnish.js
   Reads every decks/Finnish-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English or with no meaning at all ("synonym of …", "see: …",
   "first-person … of …"), a headword that is not Finnish, a forms label the generator does not write, a verb
   whose "I" form or past is missing while its table has them, unbalanced HTML, an id out of sequence, two notes
   sharing an English side (the reverse card would have two answers), a swear word in an example, and on the
   alphabet deck two notes sharing a sound side or a letter count other than 29. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["plural", "genitive", "partitive", "plural partitive", "comparative", "I", "he/she", "past", "perfect"]);
// "See …" only with its capital: "see you later" is näkemiin's meaning, not a pointer
const POINTER = { test: (g) => /^(?:alternative|obsolete|dated|rare) (?:form|spelling) of |^(?:inflection|synonym) of |^\*?\s*see:|^(?:first|second|third)-person .* of \S+$|^(?:comparative|superlative) degree of /i.test(g) || /^See /.test(g) };
const FI = /^[a-zA-ZåäöÅÄÖšžŠŽéÉüÜ '-]+$/;
// by WHOLE WORD, as `examples.clean` reads it (JavaScript's \b is not Unicode-aware)
const SWEAR_W = /^(vittu|vitun|vitu|perkele|saatana|helvet|paska|huora|kyrp|perse|pillu|mulkku|runkk|runkat|kusipää|jumalaut|narttu)/;
const SWEAR = { test: (t) => t.toLowerCase().match(/\p{L}+/gu)?.some((w) => SWEAR_W.test(w)) ?? false };
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Finnish-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Finnish deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const alphabet = /Alphabet/.test(d.meta.title);
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!FI.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not Finnish: " + w);
    if (alphabet) {
      if (sides.has(F.Sound)) bad(f + ": " + w + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, w);
      return;
    }
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.English) bad(f + ": " + w + " has no English");
    else if (!/class="uc-pos"/.test(F.English)) bad(f + ": " + w + " has no meaning, only " + F.English.replace(/<[^>]+>/g, " ").trim());
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    if (/class="uc-cjh">past</.test(F.Table) && !/uc-fl">past</.test(F.Forms)) bad(f + ": " + w + " has a past table but no past form");
    if (SWEAR.test(F.Examples.replace(/<[^>]+>/g, ""))) bad(f + ": " + w + " has a swear word in an example");
    if (/\b(fuck|shit|bitch|asshole|cunt|cock\b|dick\b|pussy)/i.test(F.Examples.replace(/<[^>]+>/g, ""))) bad(f + ": " + w + " has a swear word in an example's English");
    for (const k of ["Finnish", "English", "Forms", "Table", "Examples"]) {
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
  if (alphabet && d.cards.filter((c) => c.fields.Called).length !== 29) bad(f + ": not 29 letters");
  console.log("ok    " + f + ": " + d.cards.length + " notes" + (alphabet ? "" : ", " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Table).length + " with tables, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
