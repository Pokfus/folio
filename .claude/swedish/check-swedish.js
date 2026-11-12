#!/usr/bin/env node
/* The Swedish decks' own check: node .claude/swedish/check-swedish.js
   Reads every decks/Swedish-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("inflection of …",
   "definite singular of …", "see: …", "synonym of …"), a card with no English, a headword that is not
   Swedish, a noun with a table but no article (a language's name and a plural-only noun excepted), a forms
   label the generator does not write, unbalanced HTML, an id out of sequence, and two notes sharing an
   English side (the reverse card would have two answers). */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["definite", "plural", "neuter", "present", "past", "supine"]);
// a gloss that IS a pointer, anchored at its start
const POINTER = /^(?:alternative|obsolete|dated|rare|pronunciation) (?:form|spelling) of |^(?:inflection|synonym) of |^\*?\s*see:|^(?:indefinite|definite|genitive|neuter|plural|present|past|preterite|supine|imperative|comparative|superlative)[^;]* of \S+(?: \([^)]*\))?$/i;
const SWEDISH = /^[a-zA-ZåäöÅÄÖéÉüÜàÀèÈ][a-zA-ZåäöÅÄÖéÉüÜàÀèÈ \-]*$/;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Swedish-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Swedish deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!SWEDISH.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not Swedish: " + w);
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.English) bad(f + ": " + w + " has no English");
    const firstPos = (F.English.match(/class="uc-pos">([^<]*)</) || [])[1] || "";
    if (/^noun/.test(firstPos) && F.Table && !/plural only/.test(firstPos) && !/uc-art/.test(F.Swedish) &&
        !["svenska", "engelska", "franska", "ryska", "spanska", "japanska", "italienska", "kinesiska"].includes(w)) bad(f + ": " + w + " is a noun with no article");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const k of ["Swedish", "English", "Forms", "Table", "Examples"]) {
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
