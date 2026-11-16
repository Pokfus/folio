#!/usr/bin/env node
/* The Yoruba decks' own check: node .claude/yoruba/check-yoruba.js
   Reads every decks/Yoruba-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a headword with a letter outside the Yoruba alphabet or a mark other than the
   tones and the dot (Yoruba has no c, q, v, x or z; a vertical line under a vowel is written as the dot), a
   card defined by a pointer rather than English ("alternative form of …"), a forms label the
   generator does not write, an "also spelt" form with other letters than its headword (Wiktionary files a
   dialect's forms as plain alternatives: mo / mi) unless it is the inventory's own word that a Wiktionary
   pointer led to another headword (`POINTED`: tàbí, filed as an alternative of àbí), a speaker button (no device it would help has a Yoruba
   voice — the Hausa rule), unbalanced HTML, an id out of sequence, and two notes sharing an English side
   (the reverse card would have two answers). The Alphabet deck is checked for its own: a unique sound side.
   The phrases deck for what applies to a phrase or a sentence: its five subdecks, no phrase a level teaches,
   a Tatoeba number on every sentence, balanced HTML, a unique English side. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["also spelt"]);
const POINTED = new Set(["tàbí"]);
const SUBS = ["Greetings and wishes", "Everyday phrases", "Idioms and similes", "Proverbs", "Sentences"];
const POINTER = /^(?:alternative form of|alternative spelling of|form of|synonym of|contraction of|plural of)\b/i;
// after NFD: the alphabet's letters, the acute, the grave and the dot below, a space, a hyphen, an apostrophe
const YO = /^[abdefghijklmnoprstuwỵ́̀ '\-]+$/i;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Yoruba-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Yoruba deck in decks/");
const seen = new Map();
const text = (h) => h.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "");
const letters = (w) => w.normalize("NFD").replace(/[́̀]/g, "").replace(/[ \-']/g, "").toLowerCase();
const balanced = (f, w, k, h) => {
  for (const t of ["div", "span", "b", "ol", "li"]) {
    const open = (h.match(new RegExp("<" + t + "[ >]", "g")) || []).length;
    const close = (h.match(new RegExp("</" + t + ">", "g")) || []).length;
    if (open !== close) bad(f + ": " + w + " " + k + " has " + open + " <" + t + "> and " + close + " closes");
  }
};
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const abc = /Alphabet/.test(d.meta.title);
  const phr = /Phrases/.test(d.meta.title);
  for (const t of Object.values(d.meta.types))
    for (const c of t.cards) if (/uc-tts/.test(c.front + c.back)) bad(f + ": template " + c.name + " has a speaker button");
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (abc) {
      if (sides.has(F.Sound)) bad(f + ": card " + (i + 1) + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, i + 1);
      for (const k of ["Letter", "Sound", "Example"]) balanced(f, "card " + (i + 1), k, F[k]);
      return;
    }
    const w = F.Word;
    if (phr) {
      if (!SUBS.includes(c.sub)) bad(f + ": " + w + " is in subdeck " + c.sub);
      if (seen.has((w || "").toLowerCase())) bad(f + ": " + w + " is already taught in " + seen.get(w.toLowerCase()));
      if (c.sub === "Sentences" && !/Tatoeba #\d+/.test(F.English)) bad(f + ": sentence " + w + " has no Tatoeba number");
      if (c.sub !== "Sentences" && !YO.test(w.normalize("NFD").replace(/,/g, ""))) bad(f + ": phrase " + w + " is not Yoruba spelling");
      for (const k of ["Yoruba", "English", "Examples"]) balanced(f, w, k, F[k]);
      if (sides.has(F.English)) bad(f + ": " + w + " shares its English side with " + sides.get(F.English));
      sides.set(F.English, w);
      return;
    }
    if (!YO.test((w || "").normalize("NFD"))) bad(f + ": card " + (i + 1) + " Word is not Yoruba spelling: " + w);
    if (w !== w.normalize("NFC")) bad(f + ": " + w + " is not NFC");
    if (seen.has(w.toLowerCase())) bad(f + ": " + w + " is already taught in " + seen.get(w.toLowerCase()));
    seen.set(w.toLowerCase(), f);
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of text(F.English).split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const [, s] of F.Forms.matchAll(/<\/span>([^<]*)<\/span>/g))
      for (const a of s.split(" · "))
        if (letters(a) !== letters(w) && !POINTED.has(a)) bad(f + ": " + w + " is also spelt with other letters: " + a);
    for (const k of ["Yoruba", "English", "Forms", "Examples"]) balanced(f, w, k, F[k]);
    if (sides.has(F.English)) bad(f + ": " + w + " shares its English side with " + sides.get(F.English));
    sides.set(F.English, w);
  });
  console.log("ok    " + f + ": " + d.cards.length + " notes" + (abc || phr ? "" : ", " +
    d.cards.filter((c) => c.fields.Forms).length + " with other spellings, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
