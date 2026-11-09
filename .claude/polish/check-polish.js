#!/usr/bin/env node
/* The Polish decks' own check: node .claude/polish/check-polish.js
   Reads every decks/Polish-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("genitive of kto",
   "synonym of …", a letter's name), a forms label the generator does not write, unbalanced HTML, an id out
   of sequence, two notes sharing an English side (the reverse card would have two answers). */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["gender", "genitive", "locative", "instrumental", "plural", "gen. plural",
  "dative", "accusative", "aspect", "perfective", "imperfective", "determinate", "indeterminate",
  "ja", "on", "oni", "past", "comparative", "superlative"]);
// a gloss that IS a pointer, anchored at its start: "sides (Arabized plural of taraf)" is English with a note
const POINTER = /^(?:(?:first|second|third)-person|singular|plural|nominative|genitive|dative|accusative|instrumental|locative|vocative|inflection|imperative|diminutive|augmentative)\b[^;]* of \S+$|^(?:synonym|alternative form) of \S+$|Latin(?:-script)? (?:script )?letter|^letter of the \w+ alphabet/i;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Polish-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Polish deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const eng = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    for (const k of ["Polish", "English", "Forms", "Examples"]) {
      const h = F[k];
      for (const t of ["div", "span", "b", "ol", "li"]) {
        const open = (h.match(new RegExp("<" + t + "[ >]", "g")) || []).length;
        const close = (h.match(new RegExp("</" + t + ">", "g")) || []).length;
        if (open !== close) bad(f + ": " + w + " " + k + " has " + open + " <" + t + "> and " + close + " closes");
      }
    }
    if (eng.has(F.English)) bad(f + ": " + w + " shares its English side with " + eng.get(F.English));
    eng.set(F.English, w);
  });
  console.log("ok    " + f + ": " + d.cards.length + " notes, " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences");
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
