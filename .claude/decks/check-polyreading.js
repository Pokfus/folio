#!/usr/bin/env node
"use strict";
/*
  check-polyreading.js — A SINGLE-CHARACTER CARD GLOSSED FROM A READING IT DOES NOT TEACH (Sep 2026,
  batch 101). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/check-polyreading.js [--deck=<substring>] [--all]

  WHY IT EXISTS. 哦 was glossed *softly chant*. CC-CEDICT holds three readings of that character — é
  *to chant*, ó *oh (doubt or surprise)* and ò *oh (on learning something)* — and the card's pinyin is
  ò, with all three of its sentences that or the softening sentence-final particle. So a reader met the
  right character, the right reading, and a definition belonging to a reading the card never mentions.

  NOTHING ELSE HERE CAN SEE IT, AND THE REASON IS THE POINT. `check-pinyin.js` compares a card's pinyin
  against its own bopomofo, and both said ㄛˋ — they agree, and they are both right. `check-say-reading.js`
  asks which reading a speech engine will GUESS, which is a question about the corpus rather than about
  the gloss. And `check-gloss-source.js` compares the gloss against the dictionary entry for the WORD —
  and a polyphone's entry holds every reading's senses at once, so *chant* is in it and the gloss matches.
  **A polyphone's dictionary entry launders a gloss taken from the wrong reading.**

  WHAT IT ASKS. For every single-character note whose pinyin names ONE reading, of a character CC-CEDICT
  gives two or more: does the gloss share a content word with the senses of the reading the card teaches?
  A card that shares none, and shares one with ANOTHER reading's senses, is reported.

  IT IS A PROXY AND REPORT-ONLY, exit 0. Two things make it one. A gloss may be a correct paraphrase
  that happens to use none of the dictionary's words — which is `check-gloss-source.js`'s own stated
  noise — and a card may legitimately teach a reading whose senses OVERLAP another's. The findings are
  few enough to read: over the nine decks it returns single figures, and on its first run seven of nine
  were real and two were the same false positive twice (an interjection card whose gloss is a good one).

  READ EACH FINDING AND THEN READ THE CARD'S SENTENCES, because they decide which half is wrong. On 搁
  and 溜 every sentence used the reading the card names, so the GLOSS was corrected. On 揣 and 豁 the
  sentences used both readings, so the card was given both — the shape 系, 划 and 精神 already use.

  The part of speech is stripped before the comparison: a card glossed "interjection | hmm" otherwise
  matches any reading whose dictionary sense says "interjection", which is how 嗯 and 唉 were reported
  on their first run for nothing.
*/
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const CEDICT = path.join(ROOT, ".claude", ".cedict.txt");

const args = process.argv.slice(2);
const deckArg = (args.find((a) => a.startsWith("--deck=")) || "").slice(7);
const showAll = args.includes("--all");

if (!fs.existsSync(CEDICT)) {
  console.log("no .claude/.cedict.txt — run check-gloss-source.js once to fetch it");
  process.exit(0);
}

/* CC-CEDICT, indexed by single simplified character → one entry per reading. */
const byChar = new Map();
for (const line of fs.readFileSync(CEDICT, "utf8").split(/\r?\n/)) {
  if (!line || line[0] === "#") continue;
  const m = line.match(/^(\S+) (\S+) \[([^\]]+)\] \/(.*)\/$/);
  if (!m) continue;
  const simp = m[2];
  if ([...simp].length !== 1) continue;
  const py = m[3].toLowerCase().replace(/\s+/g, "");
  if (!byChar.has(simp)) byChar.set(simp, new Map());
  const r = byChar.get(simp);
  if (!r.has(py)) r.set(py, []);
  r.get(py).push(...m[4].split("/"));
}

/* A card writes its reading with diacritics; CC-CEDICT writes it with a trailing tone digit. */
const VOWEL = { "ā": "a1", "á": "a2", "ǎ": "a3", "à": "a4", "ē": "e1", "é": "e2", "ě": "e3", "è": "e4",
  "ī": "i1", "í": "i2", "ǐ": "i3", "ì": "i4", "ō": "o1", "ó": "o2", "ǒ": "o3", "ò": "o4",
  "ū": "u1", "ú": "u2", "ǔ": "u3", "ù": "u4", "ǖ": "v1", "ǘ": "v2", "ǚ": "v3", "ǜ": "v4", "ü": "v" };
function toCedict(p) {
  let out = "", tone = "";
  for (const ch of String(p).toLowerCase()) {
    if (VOWEL[ch]) { out += VOWEL[ch][0]; if (VOWEL[ch][1]) tone = VOWEL[ch][1]; }
    else if (/[a-z]/.test(ch)) out += ch;
  }
  return out ? out + (tone || "5") : "";
}

/* Content words only. The stop list is deliberately short — this is a shared-word test, not a parse. */
const STOP = new Set(["to","a","the","of","or","and","in","on","for","sth","sb","etc","one","used","as",
  "with","be","is","it","an","by","that","this","from","into","out","up","at","not","its","his","her"]);
function words(s) {
  return String(s).toLowerCase().replace(/\([^)]*\)/g, " ").split(/[^a-z]+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

const decks = fs.readdirSync(path.join(ROOT, "decks"))
  .filter((f) => /Mandarin.*\.folio-deck\.json$/.test(f))
  .filter((f) => !deckArg || f.toLowerCase().includes(deckArg.toLowerCase()));

let cards = 0, checked = 0;
const found = [];
for (const f of decks) {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, "decks", f), "utf8"));
  const id = (d.meta && d.meta.id) || f;
  for (const c of d.notes || d.cards || []) {
    const fl = c.fields || {};
    const s = fl.Simplified || "";
    if ([...s].length !== 1) continue;
    cards++;
    const readings = byChar.get(s);
    if (!readings || readings.size < 2) continue;
    const py = String(fl.Pinyin || "");
    if (!py || py.includes("/")) continue;            // the card teaches both readings already
    const key = toCedict(py);
    if (!readings.has(key)) continue;                 // a reading the dictionary has not got: not this check
    checked++;
    /* The part of speech is the card's own label, not a definition — strip it. */
    const gloss = String(fl.English || "").replace(/<i class="uc-pos">[^<]*<\/i>/g, " ")
      .replace(/<[^>]+>/g, " ");
    const gw = new Set(words(gloss));
    if (!gw.size) continue;
    const mine = new Set();
    readings.get(key).forEach((x) => words(x).forEach((w) => mine.add(w)));
    const other = new Set();
    for (const [k, list] of readings) if (k !== key) list.forEach((x) => words(x).forEach((w) => other.add(w)));
    const shared = [...gw].filter((w) => mine.has(w));
    const onlyOther = [...gw].filter((w) => other.has(w) && !mine.has(w));
    if (shared.length || !onlyOther.length) continue;
    found.push({
      key: id + "/" + s, py,
      gloss: gloss.replace(/\s+/g, " ").trim(),
      onlyOther,
      mine: key + ": " + readings.get(key).join("; "),
      others: [...readings.entries()].filter(([k]) => k !== key).map(([k, v]) => k + ": " + v.join("; ")),
    });
  }
}

console.log("\nMandarin single-character cards glossed from a reading they do not teach");
console.log("  " + cards.toLocaleString() + " single-character notes, " + checked +
  " of them a polyphone whose card names ONE reading");
console.log("\n  findings: " + found.length + "\n");
const show = showAll ? found : found.slice(0, 20);
for (const x of show) {
  console.log("   " + x.key + "  [" + x.py + "]");
  console.log("      card  : " + x.gloss);
  console.log("      taught: " + x.mine);
  x.others.forEach((o) => console.log("      other : " + o));
  console.log("      words only in another reading: " + x.onlyOther.join(", ") + "\n");
}
if (!showAll && found.length > show.length) console.log("   … " + (found.length - show.length) + " more (--all)");
console.log("report only — a gloss may paraphrase correctly in words the dictionary does not use.");
console.log("Read the finding, then read the card's SENTENCES: they decide whether the gloss is wrong");
console.log("or the card should teach both readings. See this file's header.");
