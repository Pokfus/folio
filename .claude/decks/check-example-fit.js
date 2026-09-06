#!/usr/bin/env node
/* check-example-fit.js — AN EXAMPLE THAT DOES NOT ACTUALLY SHOW ITS OWN WORD.

     node .claude/decks/check-example-fit.js [--deck=<substring>] [--top=N] [--all]

   WHY IT EXISTS. An example sentence is chosen by finding the headword in it, and a substring match is
   not a word match: 久病 was illustrated by 不久病人还是死了, where the two characters straddle 不久 and
   病人 and mean nothing together; 何在 by 如何在客服岗位上生存, where they straddle 如何 and 在. The
   sentence is real, the translation is right, the bold text sits exactly where the headword is spelt —
   and the card is teaching a word the sentence does not contain. Found by eye while topping the
   Everyday Phrases deck up to three examples, which is the only way it could have been found.

   HOW IT DECIDES. Chinese is not spaced, so "is this a word here?" has no general answer — but the nine
   decks between them list 11,532 words, which is a serviceable lexicon. At the position where the
   headword occurs, the sentence is re-segmented LONGEST MATCH FIRST over that lexicon; if the segmenter
   never lands on the headword itself, some other word owns those characters and the example does not
   show the word the card teaches. It is the same guard the Tatoeba harvest applies before ACCEPTING a
   sentence, run backwards over the sentences the decks already shipped with.

   IT IS A PROXY AND EXITS 0. Longest-match segmentation is wrong sometimes, and a real compound the
   lexicon happens to hold can swallow a legitimate occurrence. Read each finding; do not sweep them.
   A card whose example is genuinely wrong is repaired with `dropEx` plus an `ex` in mandarin-fixes.json,
   which is the only way these decks may be edited at all. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const args = process.argv.slice(2);
const arg = (n) => { const a = args.find((x) => x.indexOf("--" + n + "=") === 0); return a ? a.slice(n.length + 3) : null; };
const TOP = Number(arg("top") || 40);
const ALL = args.includes("--all");
const DECK = arg("deck");

const files = fs.readdirSync(path.join(ROOT, "decks")).filter((f) => /^Mandarin.*\.folio-deck\.json$/.test(f)).sort();
const decks = files.map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "decks", f), "utf8")));

/* THE LEXICON IS EVERY DECK'S WORDS, not just the deck under test: a Level 1 sentence may be swallowed
   by a Levels 7–9 compound, and a lexicon scoped to one deck would miss exactly that. */
const LEX = new Set();
let MAXW = 1;
decks.forEach((d) => d.cards.forEach((c) => {
  const w = String((c.fields || {}).Simplified || "");
  if (w) { LEX.add(w); if (w.length > MAXW) MAXW = w.length; }
}));

// longest match first from `i`; returns the token that owns position i, or the single character
function tokenAt(s, i) {
  for (let L = Math.min(MAXW, s.length - i); L >= 2; L--) {
    const c = s.substr(i, L);
    if (LEX.has(c)) return c;
  }
  return s[i];
}
/* THE TEST IS WHETHER THE HEADWORD STRADDLES A TOKEN BOUNDARY, and narrowing it to that is what makes
   this readable. Segmenting and asking "did we land on the headword?" reports 514 sentences of which
   almost all are Chinese working normally: 国 is inside 国家 and 点 inside 几点, and a character is
   MEANT to live inside compounds — reporting that is reporting the language. What is a fault is the
   headword's characters being split BETWEEN two words, as 久病 is between 不久 and 病人 and 何在 between
   如何 and 在: there the characters are adjacent by accident and mean nothing together.
   A SINGLE-CHARACTER HEADWORD IS SKIPPED ENTIRELY, since one character cannot straddle anything. */
function straddles(s, word) {
  const bounds = new Set([0]);
  for (let i = 0; i < s.length;) { const t = tokenAt(s, i); i += t.length; bounds.add(i); }
  for (let at = s.indexOf(word); at >= 0; at = s.indexOf(word, at + 1)) {
    // an occurrence is sound if some token starts at it and the word ends on a boundary too, OR if a
    // single token contains it whole (a compound built ON the word: 不好意思 for 好意思)
    let inside = false;
    for (let i = 0; i < s.length;) {
      const t = tokenAt(s, i);
      if (i <= at && at + word.length <= i + t.length) { inside = true; break; }
      i += t.length;
    }
    if (inside) return false;
    if (bounds.has(at) && bounds.has(at + word.length)) return false;
  }
  return true;
}

/* HOW OFTEN EACH WORD IS ACTUALLY USED, over every example sentence in all nine decks. It is what ranks
   the findings, and ranking is the whole difference between a list that gets read and one that does not:
   greedy segmentation cannot tell 如何|在 (a real fault — 何在 is not in that sentence) from 十分|钟 (not
   one — 分钟 is), because the two have exactly the same SHAPE. What separates them is how the words are
   used: 如何 is common and 何在 rare, while 分钟 is common and 十分 much less so. So a finding is ranked by
   how much more the competing word is used than the headword, and the top of the list is where the real
   faults are. It is a ranking, not a verdict — there is no cut-off, and the tail is read too. */
const FREQ = new Map();
decks.forEach((d) => d.cards.forEach((c) => {
  const zs = [...String((c.fields || {}).Examples || "").matchAll(/<div class="uc-exz">([\s\S]*?)<\/div>/g)]
    .map((m) => m[1].replace(/<[^>]+>/g, ""));
  zs.forEach((z) => {
    for (let i = 0; i < z.length;) { const t = tokenAt(z, i); FREQ.set(t, (FREQ.get(t) || 0) + 1); i += t.length; }
  });
}));
const freq = (w) => FREQ.get(w) || 0;

let checked = 0, hits = [];
decks.forEach((d) => {
  if (DECK && d.meta.id.indexOf(DECK) < 0) return;
  d.cards.forEach((c) => {
    const fl = c.fields || {};
    const w = String(fl.Simplified || "");
    if (!w) return;
    const zs = [...String(fl.Examples || "").matchAll(/<div class="uc-exz">([\s\S]*?)<\/div>/g)]
      .map((m) => m[1].replace(/<[^>]+>/g, ""));
    zs.forEach((z, i) => {
      checked++;
      if (z.indexOf(w) < 0) { hits.push({ id: d.meta.id, w, z, i, why: "does not contain it at all" }); return; }
      if (w.length > 1 && straddles(z, w)) {
        // name the two words the characters were split between, which is what makes a finding readable
        const parts = [];
        for (let k = 0; k < z.length;) { const t = tokenAt(z, k); parts.push([k, t]); k += t.length; }
        const at = z.indexOf(w);
        const spanned = parts.filter(([k, t]) => k < at + w.length && k + t.length > at).map(([, t]) => t);
        const rival = spanned.reduce((a, b) => (freq(b) > freq(a) ? b : a), spanned[0] || "");
        hits.push({ id: d.meta.id, w, z, i, rank: (freq(rival) + 1) / (freq(w) + 1),
                    why: spanned.length > 1 ? "the characters are split between " + spanned.join(" and ") : "the characters do not form a word here" });
      }
    });
  });
});

console.log("\nMandarin example sentences that may not show their own word");
console.log("  " + checked.toLocaleString() + " sentences over " + LEX.size.toLocaleString() + " known words\n");
hits.sort((a, b) => (b.rank || 0) - (a.rank || 0));
console.log("  findings, most likely first: " + hits.length + "  (" + ((hits.length / Math.max(1, checked)) * 100).toFixed(2) + "% of sentences)");
(ALL ? hits : hits.slice(0, TOP)).forEach((h) => {
  console.log("   " + h.w + "  [" + h.id + ", example " + (h.i + 1) + "]  — " + h.why);
  console.log("      " + h.z);
});
if (!ALL && hits.length > TOP) console.log("   … " + (hits.length - TOP) + " more (--top=N, --all)");
console.log("\nreport only — longest-match segmentation is a proxy. Repair with `dropEx` + `ex`.\n");
