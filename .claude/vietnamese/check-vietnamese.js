#!/usr/bin/env node
/* The Vietnamese decks' own check: node .claude/vietnamese/check-vietnamese.js
   Reads every decks/Vietnamese-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("alternative form of …",
   "synonym of …"), a headword that is not Vietnamese in the Latin alphabet, a tones line that disagrees with the
   headword's own marks, a Sino-Vietnamese line whose characters do not match the word's syllables, unbalanced HTML,
   an id out of sequence, two notes sharing an English side (the reverse card would have two answers). */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const POINTER = /^(?:alternative|obsolete|variant|traditional tone placement)[^;]* (?:form|spelling) of |^synonym of |^The name of the Latin script letter|^Used other than figuratively/i;
const VIET = /^[a-zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ ]+$/i;
const TONE = { "̀": "huyền", "́": "sắc", "̉": "hỏi", "̃": "ngã", "̣": "nặng" };
const toneOf = (syl) => { for (const ch of syl.normalize("NFD")) if (TONE[ch]) return TONE[ch]; return "ngang"; };
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Vietnamese-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Vietnamese deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const alphabet = /Alphabet/.test(d.meta.title);
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!VIET.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not Vietnamese: " + w);
    if (alphabet) {
      if (sides.has(F.Sound)) bad(f + ": " + F.Letter + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, F.Letter);
      return;
    }
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.English) bad(f + ": " + w + " has no English");
    const want = w.split(" ").map(toneOf).join(" · ");
    if (F.Tones !== want) bad(f + ": " + w + " tones " + F.Tones + " but its marks say " + want);
    const han = /lang="zh-Hant">([^<]*)</.exec(F.Notes);
    if (han && [...han[1]].length !== w.split(" ").length) bad(f + ": " + w + " has characters " + han[1] + " for " + w.split(" ").length + " syllables");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const k of ["Vietnamese", "English", "Notes", "Sound", "Examples"]) {
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
    d.cards.filter((c) => />classifier</.test(c.fields.Notes)).length + " with a classifier, " +
    d.cards.filter((c) => /zh-Hant/.test(c.fields.Notes)).length + " with characters, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
