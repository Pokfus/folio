#!/usr/bin/env node
/* The Navajo decks' own check: node .claude/navajo/check-navajo.js
   Reads every decks/Navajo-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a headword that is not Navajo spelling (letters, tone and nasal marks, the
   glottal stop ʼ — never a straight apostrophe), a card defined by a grammatical pointer rather than a
   meaning ("simple passive form of …", "first-person singular imperfective of …"), a forms label the
   generator does not write, a speaker button (no device has a Navajo voice), unbalanced HTML, an id out of
   sequence, two notes sharing an English side (the reverse card would have two answers). The alphabet deck
   is checked for a unique sound side and an example word on every card. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["my", "his/her", "plural", "I", "you"]);
const POINTER = /^(?:simple passive|reciprocal of)|\b(?:im)?perfective of\b|\bfuture (?:form )?of\b|^(?:alternative form|plural) of\b/i;
// Navajo letters (base forms), the glottal stop, a space; combining acute (U+0301) and ogonek (U+0328)
const PLAIN = /^[abcdeghijklmnostwxyzłʼ̨́ ]+$/i;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Navajo-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Navajo deck in decks/");
const seen = new Map();
const text = (h) => h.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
const balanced = (f, w, k, h) => {
  for (const t of ["div", "span", "b", "ol", "li", "details", "summary"]) {
    const open = (h.match(new RegExp("<" + t + "[ >]", "g")) || []).length;
    const close = (h.match(new RegExp("</" + t + ">", "g")) || []).length;
    if (open !== close) bad(f + ": " + w + " " + k + " has " + open + " <" + t + "> and " + close + " closes");
  }
};
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const abc = /Alphabet/.test(d.meta.title);
  const sides = new Map();
  for (const ty of Object.values(d.meta.types))
    for (const c of ty.cards) if (/speak|uc-say|\{\{tts/i.test(c.front + c.back)) bad(f + ": template " + c.name + " has a speaker button");
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (abc) {
      if (sides.has(F.Sound)) bad(f + ": " + w + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, w);
      if (!F.Example) bad(f + ": " + w + " has no example word");
      return;
    }
    const nw = (w || "").normalize("NFD");
    if (!PLAIN.test(nw)) bad(f + ": card " + (i + 1) + " Word is not Navajo spelling: " + w);
    const key = (w || "").normalize("NFC").toLowerCase();
    if (seen.has(key)) bad(f + ": " + w + " is already taught in " + seen.get(key));
    seen.set(key, f);
    if (!text(F.English).trim()) bad(f + ": " + w + " has no English");
    for (const g of text(F.English).split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const k of ["Navajo", "English", "Forms", "Examples"]) balanced(f, w, k, F[k]);
    if (sides.has(F.English)) bad(f + ": " + w + " shares its English side with " + sides.get(F.English));
    sides.set(F.English, w);
  });
  console.log("ok    " + f + ": " + d.cards.length + " notes" + (abc ? "" : ", " +
    d.cards.filter((c) => c.fields.Say).length + " with IPA, " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
