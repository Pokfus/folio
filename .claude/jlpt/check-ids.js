#!/usr/bin/env node
"use strict";
/*
  check-ids.js — every Japanese deck's card ids are the ones ids.json pins (Nov 2026). Node only, no browser,
  so it can run in CI's first job: `check-jlpt.js` asserts the same thing but only for the one deck it is
  pointed at, and only with Chromium.

    node .claude/jlpt/check-ids.js

  WHY. The Update press merges a reader's progress by card id, and the pipeline numbers a note from
  ids.json (deck id → note key → N, for the id u_<deck id>_N). A deck written by hand, or by a pipeline run
  that lost the file, would renumber in silence. The decks are found by their deck id in ids.json, never by
  file name. A note's key is its JMdict sequence number, else its kanji (the kanji deck), else its kana.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const PIN = JSON.parse(fs.readFileSync(path.join(__dirname, "ids.json"), "utf8"));
const bad = [], seen = new Set();
for (const f of fs.readdirSync(DIR).filter((x) => /Japanese/.test(x) && x.endsWith(".folio-deck.json")).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")), id = d.meta && d.meta.id, pin = PIN[id];
  if (!pin) { bad.push(f + ": deck id " + id + " has no rows in ids.json"); continue; }
  seen.add(id);
  const ids = new Set();
  for (const c of d.cards) {
    const key = c.jmdict || c.fields.Kanji || c.fields.Kana;
    if (ids.has(c.id)) bad.push(id + ": two notes share the id " + c.id);
    ids.add(c.id);
    if (!(key in pin)) bad.push(id + "/" + key + ": not pinned (" + c.id + ")");
    else if (c.id !== "u_" + id + "_" + pin[key]) bad.push(id + "/" + key + ": id " + c.id + ", pinned u_" + id + "_" + pin[key]);
  }
  console.log("  ok    " + f + "  (" + d.cards.length + " notes)");
}
for (const id of Object.keys(PIN)) if (!seen.has(id)) bad.push(id + ": pinned in ids.json, no deck in decks/");
if (bad.length) {
  console.log("\n  FAIL  " + bad.length + " card id(s) that ids.json does not pin:");
  bad.slice(0, 40).forEach((b) => console.log("        " + b)); process.exit(1);
}
console.log("  ok    every Japanese card id is the one ids.json pins");
