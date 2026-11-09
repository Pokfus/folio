#!/usr/bin/env node
/* The Persian decks' own check: node .claude/persian/check-persian.js
   Reads every decks/Persian-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("unhamzated form of …",
   "spoken form of …"), a headword not in the Persian script or written with the Arabic ي / ك, a level card
   with no romanisation, a Persian run with no dir="rtl", a forms label the generator does not write, a
   table form missing the joiner after می (Wiktionary's tables drop it), unbalanced HTML, an id out of
   sequence, two notes sharing an English side (the reverse card would have two answers). */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["plural", "present stem", "past stem", "comparative", "superlative", "spoken"]);
const POINTER = /^(?:alternative|obsolete|dated|rare|unhamzated|spoken|colloquial|dialectal) (?:form|spelling) of |^(?:inflection|synonym|plural) of [^;]*$/i;
const PERSIAN = /^[؀-ۿ‌ ]+$/;
const ARABIC_LETTERS = /[يك]/; // ي ك, where Persian writes ی ک
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Persian-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Persian deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const alphabet = /Alphabet/.test(d.meta.title);
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!PERSIAN.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not Persian script: " + w);
    if (ARABIC_LETTERS.test(w || "")) bad(f + ": " + w + " is written with an Arabic ي or ك");
    if (alphabet) {
      const front = F.Sound + F.Clue;
      if (sides.has(front)) bad(f + ": " + w + " shares its sound side with " + sides.get(front));
      sides.set(front, w);
      return;
    }
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.Roman) bad(f + ": " + w + " has no romanisation");
    if (!F.English) bad(f + ": " + w + " has no English");
    if (!/dir="rtl"/.test(F.Persian)) bad(f + ": " + w + " headword is not marked right to left");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    // a table row whose romanisation has the prefix (mi-ravam) must have the joiner after می
    for (const [, x, r] of F.Table.matchAll(/lang="fa">([^<]*)<\/span><span class="uc-fr">([^<]*)</g))
      if (/(^| )(ne|na)?m[i\u00ED]-/.test(r) && !/(^| )\u0646?\u0645\u06CC\u200C/.test(x)) bad(f + ": " + w + " form without the joiner after می: " + x);
    for (const k of ["Persian", "English", "Forms", "Table", "Examples"]) {
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
