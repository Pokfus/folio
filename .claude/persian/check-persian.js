#!/usr/bin/env node
/* The Persian decks' own check: node .claude/persian/check-persian.js
   Reads every decks/Persian-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("unhamzated form of …",
   "spoken form of …"), a headword not in the Persian script or written with the Arabic ي / ك, a level card
   with no romanisation, a Persian run with no dir="rtl", a forms label the generator does not write, a
   table form missing the joiner after می (Wiktionary's tables drop it), unbalanced HTML, an id that is not
   the note's PINNED number (persian-ids.json; since 2026-11-19 no deck is numbered by position), two notes
   sharing an English side (the reverse card would have two answers), a romanisation that writes ق as q
   (the decks write ġ for ق and غ, as the alphabet deck teaches), a sentence holding a Kurdish letter. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["plural", "present stem", "past stem", "comparative", "superlative", "spoken"]);
const BLOCKS = new Set(["key forms", "present", "past", "present perfect", "future", "subjunctive", "imperative", "negative",
  "forms", "my, your, his …", "… is / am / are"]);
const POINTER = /^(?:alternative|obsolete|dated|rare|unhamzated|spoken|colloquial|dialectal) (?:form|spelling) of |^(?:inflection|synonym|plural) of [^;]*$/i;
const PERSIAN = /^[؀-ۿ‌ ]+$/;
const ARABIC_LETTERS = /[يك]/; // ي ك, where Persian writes ی ک
const IDS = JSON.parse(fs.readFileSync(path.join(__dirname, "persian-ids.json"), "utf8"));
const NOT_PERSIAN = /[ۆەێڕڵھڤ]/;
const text = (h) => String(h || "").replace(/<[^>]+>/g, "");
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
    const key = alphabet ? text(F.Letter) : w, pin = (IDS[id] || {})[key];
    if (c.id !== "u_" + id + "_" + pin) bad(f + ": " + key + " has id " + c.id + ", its pinned number is " + pin);
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
    if (/q/i.test(F.Roman + text(F.Forms) + text(F.Table))) bad(f + ": " + w + " has a romanisation with q (ق is written ġ)");
    if (NOT_PERSIAN.test(F.Examples)) bad(f + ": " + w + " has a sentence with a Kurdish letter");
    if (!F.English) bad(f + ": " + w + " has no English");
    if (!/dir="rtl"/.test(F.Persian)) bad(f + ": " + w + " headword is not marked right to left");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const [, h] of F.Table.matchAll(/class="uc-cjh">([^<]*)</g)) if (!BLOCKS.has(h)) bad(f + ": " + w + " table block " + h);
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
