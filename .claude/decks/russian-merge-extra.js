#!/usr/bin/env node
"use strict";
/*
  russian-merge-extra.js — copy the cards `.claude/torfl/extra.py` built into the record (Nov 2026, the
  Russian beginner pass). Standalone Node helper, zero deps. Not part of the site, not a CI step.

    python3 .claude/torfl/extra.py && node .claude/decks/russian-merge-extra.js && node .claude/decks/russian-fix.js

  `extra.py` writes `.claude/torfl-cache/extra-cards.json` (gitignored, like everything the generator
  caches): cards for named words, built by the generator's own stages from the English Wiktionary and
  Tatoeba. This copies each into `russian-fixes.json`, which is where it lives from then on:
    · a card → an `insert` of TORFL A1 with its six fields and the Tatoeba ids of its sentences (`src`).
      A word already inserted keeps its `id` and its `why`; a new one takes the next number above 500
      (the generator dealt A1 the numbers 1 to 500) and above every insert there.
    · re-chosen sentences → `notes["torfla1/<word>"].ex`;  an All-forms panel → `.table`.
  Re-running it with an unchanged cache changes nothing.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, FIXES = path.join(HERE, "russian-fixes.json");
const EXTRA = path.join(HERE, "..", "torfl-cache", "extra-cards.json");
if (!fs.existsSync(EXTRA)) { console.error("no extra-cards.json — run python3 .claude/torfl/extra.py first"); process.exit(1); }
const X = JSON.parse(fs.readFileSync(EXTRA, "utf8")), REC = JSON.parse(fs.readFileSync(FIXES, "utf8"));
const before = JSON.stringify(REC), DECK = "torfla1";
const ins = ((REC.insert = REC.insert || {})[DECK] = REC.insert[DECK] || []), notes = (REC.notes = REC.notes || {});
let next = Math.max(500, ...ins.map((e) => e.id)) + 1;
const WHY = "Built by .claude/torfl/extra.py (the generator's own stages) on 2026-11-19: meanings, forms and stress from the English Wiktionary via kaikki.org, each sentence the Tatoeba sentence `src` names, in order.";
for (const c of X.cards) {
  let e = ins.find((x) => x.word === c.word);
  if (!e) { e = { word: c.word, id: next++, why: WHY }; ins.push(e); }
  e.fields = c.fields; e.src = c.src.map((n) => "Tatoeba " + n).join(", ") || "no sentence: Tatoeba has none short enough with an English translation";
}
const unesc = (s) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
for (const [w, rows] of Object.entries(X.ex)) (notes[DECK + "/" + w] = notes[DECK + "/" + w] || { why: "" }).ex = rows;
for (const [w, html] of Object.entries(X.tables)) {
  const table = [...html.matchAll(/<div class="uc-cj"><div class="uc-cjh">([^<]*)<\/div>([\s\S]*?)<\/div>(?=<div class="uc-cj">|<\/div>$)/g)].map((m) =>
    [unesc(m[1]), [...m[2].matchAll(/<span class="uc-cj-p">([^<]*)<\/span><span class="uc-cj-f">([^<]*)<\/span>/g)].map((r) => [unesc(r[1]), unesc(r[2])])]);
  if (!table.length || table.some((b) => !b[1].length)) { console.error("could not read the table of " + w); process.exit(1); }
  (notes[DECK + "/" + w] = notes[DECK + "/" + w] || { why: "" }).table = table;
}
const out = JSON.stringify(REC, null, 1) + "\n";
if (JSON.stringify(REC) === before) console.log("russian-fixes.json already carries these " + X.cards.length + " cards");
else { fs.writeFileSync(FIXES, out); console.log("russian-fixes.json: " + X.cards.length + " cards, " + Object.keys(X.ex).length + " re-sentenced, " + Object.keys(X.tables).length + " tables — now run russian-fix.js"); }
