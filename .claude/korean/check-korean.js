#!/usr/bin/env node
/* The Korean decks' own check: node .claude/korean/check-korean.js
   Reads every decks/Korean-*.folio-deck.json and fails on the faults this pipeline could have: a NIKL headword
   carded on two stages, a phrase that is also a stage headword, a card with no English or one defined only by a
   pointer ("alternative form of 것"), unbalanced HTML, an id out of sequence, two notes of one deck sharing an
   English side (the reverse card would have two answers), a forms label the generator does not write, and an
   alphabet that is not the forty letters. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["polite", "past", "formal"]);
const POINTER = /^(?:alternative form|alternative spelling|synonym|obsolete form|misspelling) of \S+$/i;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Korean-.*\.folio-deck\.json$/.test(f)).sort();
const want = ["Korean-Alphabet-Hangul.folio-deck.json", "Korean-Phrases-and-Expressions.folio-deck.json",
  "Korean-Stage-A.folio-deck.json", "Korean-Stage-B.folio-deck.json", "Korean-Stage-C.folio-deck.json"];
for (const w of want) if (files.indexOf(w) < 0) bad("missing " + w);
const nikl = new Map(), stageWords = new Set();
const decks = {};
for (const f of files) decks[f] = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
const text = (h) => h.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
for (const f of files) {
  const d = decks[f], id = d.meta.id;
  const eng = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    const tags = ["div", "span", "b", "ol", "li", "i"];
    for (const k of Object.keys(F)) {
      for (const t of tags) {
        const open = (String(F[k]).match(new RegExp("<" + t + "[ >]", "g")) || []).length;
        const close = (String(F[k]).match(new RegExp("</" + t + ">", "g")) || []).length;
        if (open !== close) bad(f + ": card " + (i + 1) + " " + k + " has " + open + " <" + t + "> and " + close + " closes");
      }
    }
    if (c.type === "hangul") return;
    const w = text(F.Word);
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of (F.Forms || "").matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    if (eng.has(F.English)) bad(f + ": " + w + " shares its English side with " + eng.get(F.English));
    eng.set(F.English, w);
    if (/Stage/.test(f)) {
      if (!c.nikl) bad(f + ": " + w + " carries no NIKL headword");
      if (nikl.has(c.nikl)) bad(f + ": " + c.nikl + " is already carded in " + nikl.get(c.nikl));
      nikl.set(c.nikl, f);
      stageWords.add(w);
    }
  });
  console.log("ok    " + f + ": " + d.cards.length + " notes, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences");
}
const ph = decks["Korean-Phrases-and-Expressions.folio-deck.json"];
if (ph) for (const c of ph.cards) if (stageWords.has(text(c.fields.Word))) bad("phrases: " + text(c.fields.Word) + " is a stage headword");
const al = decks["Korean-Alphabet-Hangul.folio-deck.json"];
if (al && al.cards.length !== 40) bad("the alphabet has " + al.cards.length + " letters, not 40");
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
