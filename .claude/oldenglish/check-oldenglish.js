#!/usr/bin/env node
/* The Old English decks' own check: node .claude/oldenglish/check-oldenglish.js
   Reads every decks/Old-English-*.folio-deck.json and fails on the faults this pipeline has had or could
   have: a word taught on two levels, a card defined by a pointer rather than English ("alternative form of
   …", "synonym of …"), a sense that names a rune or a letter, a headword that is not Old English letters, a
   forms label the generator does not write, unbalanced HTML, an id that is not the note's PINNED number
   (`.claude/decks/oldenglish-ids.json` — a reader's progress is keyed by it), two notes sharing an
   English side (the reverse card would have two answers), and a speaker control (no voice reads Old
   English, so a deck that offered one would offer silence).  Since the beginner pass (Nov 2026) also: a
   sentence with no reference (Ælfric by Thorpe's page, Tatoeba by id), an English side that prints the
   card's own Old English outside `.uc-eg` (it is the QUESTION of the English → Old English card), a
   reading rule with no quotation or source, and an alphabet note with no example word. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["genitive", "plural", "declension", "past", "past plural", "participle", "comparative", "superlative", "also in the texts"]);
const PIN = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "decks", "oldenglish-ids.json"), "utf8"));
const strip = (h) => String(h || "").replace(/<[^>]+>/g, "");
const dec = (s) => String(s || "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const fold = (s) => s.toLowerCase().normalize("NFD").replace(/\p{Mn}/gu, "").normalize("NFC").replace(/ð/g, "þ").replace(/ƿ/g, "w").replace(/y/g, "i").replace(/-/g, "").replace(/ie/g, "i");
const REF = /^(?:Ælfric, Catholic Homilies I, ed\. Thorpe \(1844\), p\. \d+|Tatoeba \d+)$/;
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
    const key = c.type === "oe-abc" ? strip(F.Letter) : c.type === "oe-read" ? F.Key : F.Word;
    const n = (PIN[id] || {})[key];
    if (!n) bad(f + ": " + key + " has no pinned number");
    else if (c.id !== "u_" + id + "_" + n) bad(f + ": " + key + " has id " + c.id + ", pinned to " + n);
    if (c.type === "oe-read") {
      if (!F.Quote || !/Wikipedia, "[^"]+", revision \d+/.test(dec(F.Source))) bad(f + ": " + key + " has no quotation or no source");
      if (!F.Example) bad(f + ": " + key + " has no example");
      return;
    }
    if (alphabet) {
      if (sides.has(F.Sound)) bad(f + ": " + w + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, w);
      if (!F.Example) bad(f + ": " + w + " has no example word");
      return;
    }
    if (!OE.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not Old English letters: " + w);
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    // the English side is the question of the English → Old English card: outside .uc-eg it may not print the answer
    const asked = dec(strip(F.English.replace(/<span class="uc-eg">.*?<\/span>/g, "")));
    if (/[þðæǣāēīōūȳċġ]/.test(w) && (asked.match(/\p{L}+/gu) || []).some((t) => /[þðæǣāēīōūȳċġ]/.test(t) && fold(t) === fold(w))) bad(f + ": " + w + " is printed on its own English side");
    const refs = [...F.Examples.matchAll(/<div class="uc-exsrc">([^<]*)<\/div>/g)].map((m) => dec(m[1]));
    if (refs.length !== (F.Examples.match(/class="uc-exi"/g) || []).length) bad(f + ": " + w + " has a sentence with no reference");
    for (const r of refs) if (!REF.test(r)) bad(f + ": " + w + " has the reference " + r);
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
