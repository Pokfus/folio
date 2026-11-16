#!/usr/bin/env node
/* The Mongolian decks' own check: node .claude/mongolian/check-mongolian.js
   Reads every decks/Mongolian-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a headword that is not plain Cyrillic, a card defined by a pointer rather than
   English ("alternative form of …", "past participle in -сан of …", "dative-locative singular of …"), a forms
   label the generator does not write, a form in another script, a speaker button (few devices have a Mongolian
   voice — the Hausa rule), a romanisation line (the level decks carry none: the Russian precedent), an example
   with no word picked out, unbalanced HTML, an id out of sequence, and two notes sharing an English side (the
   reverse card would have two answers). The alphabet deck is checked for its own: 36 notes, a unique sound
   side, every letter of the 35. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["plural", "of …", "in, at …", "from …", "causative", "passive", "also spelt"]);
const POINTER = /^(?:alternative form of|alternative spelling of|form of|synonym of|plural of)\b|\b(?:participle|converb|tense|voice|singular|plural|genitive|dative|ablative|comitative|possessive)\b.* of [А-Яа-яЁёӨөҮү]/i;
const CYR = /^[А-Яа-яЁёӨөҮү]+(?:[ -][А-Яа-яЁёӨөҮү]+)*$/;
const ABC = "АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ";
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Mongolian-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Mongolian deck in decks/");
const seen = new Map();
const text = (h) => h.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "");
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
  for (const t of Object.values(d.meta.types))
    for (const c of t.cards) {
      if (/uc-tts/.test(c.front + c.back)) bad(f + ": template " + c.name + " has a speaker button");
      if (!abc && /Roman|uc-rom/.test(c.front + c.back)) bad(f + ": template " + c.name + " has a romanisation line");
    }
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (abc) {
      if (sides.has(F.Sound)) bad(f + ": card " + (i + 1) + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, i + 1);
      for (const k of ["Letter", "Name", "Sound", "Ipa", "Example"]) balanced(f, "card " + (i + 1), k, F[k]);
      return;
    }
    const w = F.Word;
    if (!CYR.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not plain Cyrillic: " + w);
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of text(F.English).split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    if (/[᠀-᢯]/.test(F.Forms + F.English)) bad(f + ": " + w + " carries the traditional script");
    for (const ex of F.Examples.split('<div class="uc-exi">').slice(1))
      if (!/<b>/.test(ex)) bad(f + ": " + w + " has an example with no word picked out");
    for (const k of ["Mongolian", "English", "Forms", "Examples"]) balanced(f, w, k, F[k]);
    if (sides.has(F.English)) bad(f + ": " + w + " shares its English side with " + sides.get(F.English));
    sides.set(F.English, w);
  });
  if (abc) {
    if (d.cards.length !== 36) bad(f + ": " + d.cards.length + " notes, not 36");
    const got = new Set(d.cards.map((c) => c.fields.Letter[0]));
    for (const ch of ABC) if (!got.has(ch)) bad(f + ": no note for " + ch);
  }
  console.log("ok    " + f + ": " + d.cards.length + " notes" + (abc ? "" : ", " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
