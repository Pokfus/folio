#!/usr/bin/env node
/* The Tagalog decks' own check: node .claude/tagalog/check-tagalog.js
   Reads every decks/Tagalog-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("alternative form of …",
   "progressive aspect of …"), a headword with a stress mark (the marks belong in the Marked field, ordinary
   writing leaves them out) or a letter outside Tagalog's alphabet, a Marked spelling that is not the headword
   with marks, a forms label the generator does not write, an English side that is a letter's name, unbalanced
   HTML, an id out of sequence, two notes sharing an English side (the reverse card would have two answers). */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["completed", "ongoing", "contemplated", "plural", "root"]);
const POINTER = /^(?:[\w,\- ]*\b)?(?:form|spelling|aspect|contraction|clipping|inflection) of \S+$/i;
const PLAIN = /^[A-Za-zÑñ' -]+$/;
const unmark = (s) => s.normalize("NFD").replace(/[̀́̂]/g, "").normalize("NFC");
// the Marked field is HTML-escaped (an apostrophe in ano'ng, buto't is &#x27;); compare the text
const unescape = (s) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Tagalog-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Tagalog deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!PLAIN.test(w || "")) bad(f + ": card " + (i + 1) + " Word has a mark or a letter Tagalog does not write: " + w);
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (F.Marked && unmark(unescape(F.Marked)).toLowerCase() !== w.toLowerCase()) bad(f + ": " + w + " has a marked spelling of another word: " + F.Marked);
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n")) {
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
      if (/\bletter\b/.test(g) && /\b(alphabet|script)\b/.test(g)) bad(f + ": " + w + " is defined as a letter: " + g.trim());
    }
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const k of ["Tagalog", "English", "Forms", "Examples"]) {
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
  console.log("ok    " + f + ": " + d.cards.length + " notes, " +
    d.cards.filter((c) => c.fields.IPA).length + " with IPA, " +
    d.cards.filter((c) => c.fields.Marked).length + " with a marked spelling, " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences");
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
