#!/usr/bin/env node
/* The Cantonese decks' own check: node .claude/cantonese/check-cantonese.js
   Reads every decks/Cantonese-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught twice in one reading (on two levels, or twice in one), a headword that is not Han characters,
   a level card whose Jyutping is not Jyutping (CC-Canto's "seng4 yat6" carried Yale's y) or does not give one
   syllable per character, a gloss that is a pointer ("variant of", "see also", "Mandarin equivalent") or names
   the slang the extraction is meant to drop, unbalanced HTML, an id out of sequence, two notes sharing an
   English side (the reverse card would have two answers), an example with no word picked out, and on the
   sounds deck two notes sharing a sound side or a spelling side. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const HAN = /^[㐀-䶿一-鿿\u{20000}-\u{3134f}豈-﫿]+$/u;
const SYL = /^(?:(?:b|p|m|f|d|t|n|l|gw|kw|g|k|ng|h|w|z|c|s|j)?(?:aa(?:i|u|m|n|ng|p|t|k)?|a(?:i|u|m|n|ng|p|t|k)|e(?:i|u|m|n|ng|p|t|k)?|i(?:u|m|n|ng|p|t|k)?|o(?:i|u|n|ng|t|k)?|oe(?:ng|k)?|eo(?:i|n|t)|u(?:i|n|ng|t|k)?|yu(?:n|t)?)|m|ng)[1-6]$/;
const POINTER = /^(?:variant of|old variant|see also|see |used in|Mandarin equivalent|abbr\. for)/i;
const SLANG = /penis|prick|shithead|屄|lewd|pornographic|heroin|euphemis/i;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Cantonese-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Cantonese deck in decks/");
const seen = new Map();
const text = (h) => h.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const sounds = /Jyutping/.test(d.meta.title);
  const sides = new Map(), fronts = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!HAN.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not Han characters: " + w);
    if (sounds) {
      if (sides.has(F.Sound)) bad(f + ": " + F.Spelling + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, F.Spelling);
      if (fronts.has(F.Spelling)) bad(f + ": two notes are spelt " + F.Spelling);
      fronts.set(F.Spelling, 1);
      return;
    }
    const jp = F.Jyutping || "";
    const syl = jp.split(" ");
    if (!jp) bad(f + ": " + w + " has no Jyutping");
    else if (!syl.every((s) => SYL.test(s))) bad(f + ": " + w + " Jyutping is not Jyutping: " + jp);
    else if (syl.length !== [...w].length) bad(f + ": " + w + " has " + [...w].length + " characters and " + syl.length + " syllables: " + jp);
    const key = w + "|" + jp;
    if (seen.has(key)) bad(f + ": " + key + " is already taught in " + seen.get(key));
    seen.set(key, f);
    if (F.Simplified === w) bad(f + ": " + w + " prints a simplified form identical to the headword");
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of text(F.English).split("\n")) {
      const t = g.trim();
      if (POINTER.test(t)) bad(f + ": " + w + " is defined by a pointer: " + t);
      if (SLANG.test(t)) bad(f + ": " + w + " shows a sense the extraction drops: " + t);
    }
    for (const k of ["Cantonese", "English", "Examples"]) {
      const h = F[k];
      for (const t of ["div", "span", "b", "ol", "li"]) {
        const open = (h.match(new RegExp("<" + t + "[ >]", "g")) || []).length;
        const close = (h.match(new RegExp("</" + t + ">", "g")) || []).length;
        if (open !== close) bad(f + ": " + w + " " + k + " has " + open + " <" + t + "> and " + close + " closes");
      }
    }
    for (const ex of F.Examples.split('<div class="uc-exi">').slice(1))
      if (!/<b>/.test(ex)) bad(f + ": " + w + " has an example with no word picked out");
    if (sides.has(F.English)) bad(f + ": " + w + " shares its English side with " + sides.get(F.English));
    sides.set(F.English, w);
  });
  console.log("ok    " + f + ": " + d.cards.length + " notes" + (sounds ? "" : ", " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences, " +
    d.cards.filter((c) => c.fields.Simplified).length + " with a simplified form"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
