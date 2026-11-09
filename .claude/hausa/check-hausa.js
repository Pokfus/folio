#!/usr/bin/env node
/* The Hausa decks' own check: node .claude/hausa/check-hausa.js
   Reads every decks/Hausa-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("Niger standard spelling
   of …", "plural of …"), a headword that is not Boko (or still carries a tone mark — tones belong on the
   second line only), a forms label the generator does not write, a speaker button (no device it would
   help carries a Hausa voice), unbalanced HTML, an id out of sequence, two notes sharing an English side
   (the reverse card would have two answers). */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["plural", "feminine"]);
const POINTER = /^(?:(?:Niger )?standard spelling|alternative (?:letter-case )?(?:form|spelling)|plural|feminine|verbal noun) of \S+$/i;
// the ordinary spelling: Latin letters, the hooked letters, apostrophe, space, hyphen — no combining mark
const BOKO = /^[A-Za-zƁɓƊɗƘƙƳƴ' -]+$/;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Hausa-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Hausa deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const alphabet = /Alphabet/.test(d.meta.title);
  const sides = new Map();
  for (const t of Object.values(d.meta.types)) {
    if (t.speechLang !== "ha-NG") bad(f + ": type " + t.id + " speechLang is " + t.speechLang);
    if (/uc-tts|data-say/.test(JSON.stringify(t.cards))) bad(f + ": type " + t.id + " carries a speaker button");
  }
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (/uc-tts|data-say/.test(JSON.stringify(F))) bad(f + ": card " + (i + 1) + " carries a speaker button");
    if (alphabet) {
      if (sides.has(F.Sound)) bad(f + ": " + w + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, w);
      return;
    }
    if (!BOKO.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not plain Boko: " + w);
    if (seen.has(w.toLowerCase())) bad(f + ": " + w + " is already taught in " + seen.get(w.toLowerCase()));
    seen.set(w.toLowerCase(), f);
    if (F.Tone && F.Tone.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/&#x27;/g, "'").toLowerCase() !== w.toLowerCase())
      bad(f + ": " + w + " has a tone line for another word: " + F.Tone);
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const k of ["Hausa", "English", "Forms", "Examples"]) {
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
    d.cards.filter((c) => c.fields.Tone).length + " with a tone line, " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
