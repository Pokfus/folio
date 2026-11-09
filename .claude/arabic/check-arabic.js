#!/usr/bin/env node
/* The Arabic decks' own check: node .claude/arabic/check-arabic.js
   Reads every decks/Arabic-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   an id out of sequence, a word taught twice, two notes sharing an English side (the reverse card would have
   two answers), an Arabic run without dir="rtl" (it would lay out left to right among the English), a
   headword with anything but Arabic letters and marks in it (kaikki carries `قَبْلَ Audio:`), a headword
   printed without its short vowels, a forms label the generator does not write, unbalanced HTML, and an
   example sentence whose highlighted word is not in it. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["gender", "plural", "feminine", "more", "present", "verbal noun", "form"]);
const ARABIC = /^[ء-ٰٟٱـ ]+$/;
const MARK = /[ً-ْ]/;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const balanced = (where, h) => {
  for (const t of ["div", "span", "b", "details"]) {
    const open = (h.match(new RegExp("<" + t + "[ >]", "g")) || []).length;
    const close = (h.match(new RegExp("</" + t + ">", "g")) || []).length;
    if (open !== close) bad(where + " has " + open + " <" + t + "> and " + close + " closes");
  }
};
// every Arabic letter must sit inside an element that says dir="rtl" (or inside the alphabet's shapes row,
// which says it once for the row): a tiny tag walker, the stack carrying whether each level is right to left
const rtlRuns = (where, h) => {
  const stack = [false];
  const re = /<(\/?)(\w+)([^>]*)>|([^<]+)/g;
  const VOID = new Set(["br", "hr", "img"]);
  let m;
  while ((m = re.exec(h))) {
    if (m[4] !== undefined) {
      if (/[\u0621-\u064A]/.test(m[4]) && !stack[stack.length - 1]) bad(where + ": Arabic text outside dir=rtl: " + m[4].slice(0, 30));
    } else if (m[1]) stack.pop();
    else if (!VOID.has(m[2])) stack.push(stack[stack.length - 1] || /dir="rtl"/.test(m[3]));
  }
};
const files = fs.readdirSync(DIR).filter((f) => /^Arabic-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Arabic deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const abc = /Alphabet/.test(f);
  const eng = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    for (const k of Object.keys(F)) if (k !== "Word") balanced(f + ": " + (F.Word || i) + " " + k, F[k]);
    if (abc) {
      if (!F.Letter || !F.Name || !F.Sound || !F.Example) bad(f + ": letter " + (i + 1) + " is missing a field");
      // Name goes into the speaker's data-say attribute as well as onto the card, so it must be plain text
      if (/[<>"]/.test(F.Name)) bad(f + ": letter " + (i + 1) + " has markup in its Name");
      for (const k of ["Example", "Shapes"]) rtlRuns(f + ": " + F.Word + " " + k, F[k]);
      return;
    }
    const w = F.Word;
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!ARABIC.test(w)) bad(f + ": headword " + JSON.stringify(w) + " is not clean Arabic");
    if (!MARK.test(w)) bad(f + ": headword " + w + " has no short vowels");
    if (!F.Roman) bad(f + ": " + w + " has no romanisation");
    if (!F.English) bad(f + ": " + w + " has no English");
    if (eng.has(F.English)) bad(f + ": " + w + " shares its English side with " + eng.get(F.English));
    eng.set(F.English, w);
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const k of ["Arabic", "Forms", "Table", "Examples"]) rtlRuns(f + ": " + w + " " + k, F[k]);
    for (const [, s] of F.Examples.matchAll(/class="uc-exz"[^>]*>(.*?)<\/div>/g))
      if (!/<b>[^<]+<\/b>/.test(s)) bad(f + ": " + w + " has a sentence with no highlighted word");
  });
  const n = d.cards.length;
  console.log("ok    " + f + ": " + n + " notes" + (abc ? "" : ", " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Table).length + " with tables, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
