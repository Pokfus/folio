#!/usr/bin/env node
/* The Old English decks' own check: node .claude/oldenglish/check-oldenglish.js
   Reads every decks/Old-English-*.folio-deck.json and fails on the faults this pipeline has had or could
   have: a word taught on two levels, a card defined by a pointer rather than English ("alternative form of
   …", "synonym of …"), a sense that names a rune or a letter, a headword that is not Old English letters, a
   forms label the generator does not write, unbalanced HTML, an id out of sequence, two notes sharing an
   English side (the reverse card would have two answers), and a speaker control (no voice reads Old
   English, so a deck that offered one would offer silence). */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["genitive", "plural", "past", "past plural", "participle", "comparative", "superlative"]);
const POINTER = /^(?:alternative|obsolete|dated|rare|late) (?:form|spelling) of |^(?:inflection|synonym) of [^;]*$|runic character|^the letter /i;
const OE = /^[A-Za-zÆæǢǣǼǽĀāĒēĪīŌōŪūȲȳÝýĊċĠġÞþÐðƿ \-]+$/;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Old-English-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Old English deck in decks/");
const seen = new Map();
for (const f of files) {
  const raw = fs.readFileSync(path.join(DIR, f), "utf8");
  const d = JSON.parse(raw);
  const id = d.meta.id;
  const alphabet = /Alphabet/.test(d.meta.title);
  if (/uc-tts/.test(raw)) bad(f + ": carries a speaker control");
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (alphabet) {
      if (sides.has(F.Sound)) bad(f + ": " + w + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, w);
      return;
    }
    if (!OE.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not Old English letters: " + w);
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const k of ["OE", "English", "Forms", "Modern", "Table", "Examples"]) {
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
    d.cards.filter((c) => c.fields.Modern).length + " with a descendant, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
