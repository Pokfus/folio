#!/usr/bin/env node
"use strict";
/*
  check-say-reading.js — WHICH MANDARIN CARDS A SPEECH ENGINE WILL READ WITH THE WRONG READING
  (Sep 2026, on a bug report: "the card '了' tts pronounces it as liao instead of le. '差' reads chà but
  pronounces chā"). Standalone Node helper, zero deps, report-only. Not part of the site.

    node .claude/decks/check-say-reading.js [--all]

  A Mandarin card's speaker is handed the card's own CHARACTERS (`data-say="{{Simplified}}"`), which is
  right — a Mandarin voice given "bēizi" reads the romanisation — and is the whole of the problem on a
  card whose word is ONE polyphonic character. A lone 了 or 差 carries no context, so the engine falls
  back to the character's commonest reading, and for these two that is not the reading the card teaches.

  THERE IS NO POLYPHONE DICTIONARY HERE, SO THE MEASURE IS THE CORPUS'S OWN. The Mandarin decks carry
  11,000-odd multi-character words with their pinyin written syllable by syllable, so where a word's
  character count and syllable count agree the reading of each character is readable straight off. That
  gives every character a reading DISTRIBUTION, and "the reading a speech engine will guess" is very well
  approximated by "the reading this corpus uses most". A single-character card whose own reading is a
  MINORITY reading of its character is a card the engine is likely to get wrong.

  IT IS A PROXY AND IS REPORT-ONLY, exactly as check-senses.js is. Two kinds of entry are listed and are
  not faults: a card whose Pinyin field teaches BOTH readings ("重 chóng / zhòng"), where whichever the
  engine picks is one the card names; and a character whose two readings are a few cards apart in a
  corpus this size, where the "majority" is noise. Read the list; do not sweep it.

  THE REPAIR IS A `Say` FIELD, not a change to the pinyin or the characters. The card type's templates
  read `{{#Say}}{{Say}}{{/Say}}{{^Say}}{{Simplified}}{{/Say}}`, so a card that carries one has its own
  value spoken and every other card is untouched. What goes in it is the shortest ORDINARY word that pins
  the reading — 了 is spoken as 好了 and 差 as 还差 — because a lone polyphone has no reading for an engine
  to pick and a substituted homophone would be a different character with its own risk of being read
  wrong. The reader hears one syllable of context and then the card's own, which is what a dictionary's
  audio does with a particle.
*/
const fs = require("fs"), path = require("path");
const DECKS = path.join(__dirname, "..", "..", "decks");
const files = fs.readdirSync(DECKS).filter((f) => /^Mandarin.*\.folio-deck\.json$/.test(f));
if (!files.length) { console.error("no Mandarin decks in " + DECKS); process.exit(1); }

const HAN = /^[㐀-鿿豈-﫿]+$/;
const dist = new Map();     // character -> { reading: count }
const singles = [];
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DECKS, f), "utf8"));
  for (const c of d.cards || []) {
    const fl = c.fields || {};
    const s = String(fl.Simplified || "");
    const chars = [...s], syls = String(fl.Pinyin || "").trim().split(/\s+/).filter(Boolean);
    if (!HAN.test(s)) continue;
    if (chars.length === 1) { singles.push({ f, id: c.id, ch: chars[0], pinyin: String(fl.Pinyin || ""), say: String(fl.Say || "") }); continue; }
    // only a word whose syllables line up with its characters can say what each character was read as
    if (chars.length !== syls.length) continue;
    chars.forEach((ch, i) => {
      let m = dist.get(ch); if (!m) { m = new Map(); dist.set(ch, m); }
      const k = syls[i].toLowerCase();
      m.set(k, (m.get(k) || 0) + 1);
    });
  }
}

const all = process.argv.includes("--all");
const rows = [];
for (const r of singles) {
  const m = dist.get(r.ch);
  if (!m || m.size < 2) continue;
  const ent = [...m.entries()].sort((a, b) => b[1] - a[1]);
  // a card teaching both readings names them with a slash; whichever the engine picks, the card said it
  const taught = r.pinyin.toLowerCase().split("/").map((x) => x.trim()).filter(Boolean);
  if (taught.includes(ent[0][0])) continue;
  rows.push({ r, ent, both: taught.length > 1, margin: ent[0][1] - (Math.max(...taught.map((t) => m.get(t) || 0)) || 0) });
}
rows.sort((a, b) => b.margin - a.margin);

const fixed = rows.filter((x) => x.r.say), open = rows.filter((x) => !x.r.say);
console.log(singles.length + " single-character Mandarin cards; " + rows.length + " read a MINORITY reading of their own character");
console.log("  " + fixed.length + " already carry a `Say` override, " + open.length + " do not\n");
for (const x of (all ? rows : open)) {
  const d = x.ent.slice(0, 4).map((e) => e[0] + ":" + e[1]).join("  ");
  console.log("  " + x.r.ch + "  card says " + JSON.stringify(x.r.pinyin) +
    (x.both ? " (teaches both)" : "") + (x.r.say ? "  Say=" + x.r.say : "") +
    "\n      corpus " + d + "   [" + x.r.id + "]");
}
console.log("\nreport only — read each one before writing a `Say`; see this file's header");
