#!/usr/bin/env node
"use strict";
/*
  check-mandarin-coverage.js — WHAT A MANDARIN CARD DOES NOT SAY (Sep 2026, on a review request:
  "check if every card correctly lists its most common definitions … if the card correctly lists three
  different example sentences"). Standalone Node helper, zero deps, REPORT-ONLY. Not part of the site.

    node .claude/decks/check-mandarin-coverage.js [--top=N] [--deck=<substring>] [--only=<check>]

  WHY THIS EXISTS. check-pinyin.js and check-say-reading.js both ask whether what a card SAYS is right.
  Every one of them reports the Mandarin decks clean or nearly so, and a reader can still meet a card
  that teaches one sense of a four-sense word, or a card with no example sentence at all. The faults
  here are all faults of OMISSION, which is the one shape no correctness checker can see: nothing is
  wrong on the card, there is simply less of it than the card type promises.

  FIVE CHECKS, and each one is a COUNT rather than a verdict — none of them can tell a legitimately
  single-sense word from an under-glossed one, so this ranks and never gates.

  1. EXAMPLES. The card type renders up to three, under an "In a sentence" fold. A note with none draws
     no fold at all, so the reader cannot tell a word Folio has no sentence for from one whose fold they
     forgot to open. Reported per deck, because the shortfall is not spread evenly: it tracks the level.

  2. AMBIGUOUS REVERSE CARDS. The English → Chinese card's front is `{{English}}` and nothing else, so
     two notes sharing a gloss are one question with two right answers — a learner types 再 for "again",
     is shown 又, and has no way to tell a wrong answer from a collision. This is the check with the most
     teeth, because the reader experiences it as being marked wrong for a correct answer.

  3. SENSES AGAINST PART OF SPEECH. A note whose one gloss is tagged `verb / adjective / adverb` is
     claiming more categories than it gives senses for; a note whose single gloss is three senses joined
     by semicolons has the senses and has not separated them, so nothing can be studied one at a time.
     Both are the same fault seen from two sides and both are counted.

  4. UNSPACED PINYIN. The corpus writes one space per syllable, 11,500 times over. A handful written as
     one word are not wrong, they are inconsistent — and, since check-pinyin.js pins the boundary by
     comparing against the bopomofo, a card with no bopomofo AND no spacing is the one shape neither
     checker can see. The nine that were in this state were repaired in Sep 2026.

  5. MEASURE WORDS ON NOUNS. Chinese counts nouns with a classifier and the card type has a slot for it.
     A great many noun-tagged notes are not countable at all (今天, 大家, 多少), so this is the loosest
     of the five and is reported as a figure with that caveat rather than as a list to work through.
*/

const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const args = process.argv.slice(2);
const opt = (n, d) => { const a = args.find((x) => x.startsWith("--" + n + "=")); return a ? a.slice(n.length + 3) : d; };
const TOP = Number(opt("top", 12)), ONLY = opt("only", ""), DECKQ = opt("deck", "");
const want = (n) => !ONLY || ONLY === n;

const txt = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const files = fs.readdirSync(DIR).filter((f) => /^Mandarin-.*\.folio-deck\.json$/.test(f)).sort()
  .filter((f) => !DECKQ || f.toLowerCase().includes(DECKQ.toLowerCase()));

const notes = [];
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const deck = f.replace(/\.folio-deck\.json$/, "").replace(/^Mandarin-/, "");
  for (const c of d.cards || []) {
    const fl = c.fields || {};
    notes.push({
      deck, id: c.id, w: fl.Simplified || "", pinyin: fl.Pinyin || "", bopo: fl.Bopomofo || "",
      mw: (fl["Measure word"] || "").trim(),
      senses: [...String(fl.English || "").matchAll(/<div class="uc-sense">([\s\S]*?)<\/div>/g)].map((m) => m[1]),
      /* THE DECK'S OWN DISAMBIGUATOR: a `not <other word>` block above the senses, which is what makes a
         shared gloss answerable. A collision that carries one is not a finding, and counting it as one
         would report 502 repaired notes as broken for ever. */
      hint: (/<div class="uc-pos">not ([^<]*)<\/div>/.exec(String(fl.English || "")) || [])[1] || "",
      exs: [...String(fl.Examples || "").matchAll(/<div class="uc-exz">([\s\S]*?)<\/div>/g)].map((m) => txt(m[1])),
    });
  }
}
console.log(files.length + " Mandarin decks, " + notes.length + " notes\n");
let findings = 0;

/* 1 ── example sentences */
if (want("examples")) {
  const per = new Map();
  for (const n of notes) {
    let r = per.get(n.deck); if (!r) { r = [0, 0, 0, 0]; per.set(n.deck, r); }
    r[Math.min(3, n.exs.length)]++;
  }
  const tot = [0, 0, 0, 0];
  console.log("1. EXAMPLE SENTENCES — the card type shows up to three");
  console.log("   " + "deck".padEnd(24) + "notes".padStart(7) + "none".padStart(7) + "one".padStart(6) +
    "two".padStart(6) + "three".padStart(7) + "  full set");
  for (const [d, r] of per) {
    const t = r[0] + r[1] + r[2] + r[3];
    r.forEach((v, i) => (tot[i] += v));
    console.log("   " + d.padEnd(24) + String(t).padStart(7) + String(r[0]).padStart(7) +
      String(r[1]).padStart(6) + String(r[2]).padStart(6) + String(r[3]).padStart(7) +
      ("  " + Math.round((100 * r[3]) / t) + "%").padStart(10));
  }
  const T = tot.reduce((a, b) => a + b, 0);
  console.log("   " + "ALL".padEnd(24) + String(T).padStart(7) + String(tot[0]).padStart(7) +
    String(tot[1]).padStart(6) + String(tot[2]).padStart(6) + String(tot[3]).padStart(7) +
    ("  " + Math.round((100 * tot[3]) / T) + "%").padStart(10));
  // a repeated sentence inside one note is check-senses.js's finding and must stay at nil
  const dupe = notes.filter((n) => n.exs.length > 1 && new Set(n.exs).size !== n.exs.length);
  console.log("   notes showing the SAME sentence twice: " + dupe.length + (dupe.length ? "  ← regression" : ""));
  findings += tot[0];
  console.log();
}

/* 2 ── the English → Chinese card's front is the gloss and nothing else */
if (want("reverse")) {
  const by = new Map();
  for (const n of notes) {
    const k = n.senses.map(txt).join(" ").toLowerCase();
    if (!k) continue;
    let a = by.get(k); if (!a) { a = []; by.set(k, a); }
    a.push(n);
  }
  const groups = [...by.values()].filter((a) => a.length > 1).sort((a, b) => b.length - a.length);
  const n2 = groups.reduce((a, g) => a + g.length, 0);
  /* A group is SETTLED when every member carries the hint. Partly hinted is still a finding: a pair
     where one side says "not X" and the other says nothing leaves half the collision live. */
  const open = groups.filter((g) => !g.every((x) => x.hint));
  const nOpen = open.reduce((a, g) => a + g.length, 0);
  console.log("2. AMBIGUOUS REVERSE CARDS — one English prompt, several right answers");
  console.log("   " + groups.length + " glosses shared by 2+ notes, covering " + n2 + " notes (" +
    ((100 * n2) / notes.length).toFixed(1) + "% of the deck)");
  console.log("   of those, " + (groups.length - open.length) + " groups (" + (n2 - nOpen) +
    " notes) carry the deck's own `not <other word>` disambiguator and are answerable");
  console.log("   STILL AMBIGUOUS: " + open.length + " groups, " + nOpen + " notes");
  for (const g of open.slice(0, TOP)) {
    console.log("   " + JSON.stringify(txt(g[0].senses.join(" ")).slice(0, 46)) + "  →  " +
      g.map((x) => x.w).join("  ") + "   [" + g.map((x) => x.deck.replace(/HSK-3\.0-/, "")).join(", ") + "]");
  }
  if (open.length > TOP) console.log("   … " + (open.length - TOP) + " more (--top=N)");
  findings += nOpen;
  console.log();
}

/* 3 ── senses against part of speech */
if (want("senses")) {
  const multipos = [], crammed = [];
  for (const n of notes) {
    if (n.senses.length !== 1) continue;
    const m = /<i class="uc-pos">([^<]*)<\/i>/.exec(n.senses[0]);
    const gloss = txt(n.senses[0].replace(/<i class="uc-pos">[^<]*<\/i>/, ""));
    if (m && m[1].includes("/")) multipos.push([n, m[1], gloss]);
    if (gloss.includes(";")) crammed.push([n, gloss]);
  }
  const many = notes.filter((n) => n.senses.length > 1).length;
  console.log("3. SENSES — how much of a word each note teaches");
  console.log("   notes giving MORE THAN ONE sense: " + many + " of " + notes.length +
    " (" + ((100 * many) / notes.length).toFixed(1) + "%)");
  console.log("   one sense, but the part of speech names several categories: " + multipos.length);
  for (const [n, pos, g] of multipos.slice(0, TOP)) console.log("      " + n.w + "  " + pos + " — " + g.slice(0, 54));
  console.log("   one sense that is really several, joined by \";\": " + crammed.length);
  for (const [n, g] of crammed.slice(0, TOP)) console.log("      " + n.w + "  " + g.slice(0, 62));
  findings += multipos.length + crammed.length;
  console.log();
}

/* 4 ── pinyin written as one word, and readings nothing can cross-check */
if (want("pinyin")) {
  // erhua is ONE syllable written with a trailing r (哪儿 nǎr), so a trailing 儿 does not count
  const syllables = (w) => w.replace(/\u513f$/, "").length;
  const unspaced = notes.filter((n) => syllables(n.w) > 1 && n.pinyin.trim() &&
    !/\s/.test(n.pinyin.trim()) && !n.pinyin.includes("/"));
  const nobopo = notes.filter((n) => !n.bopo.trim());
  console.log("4. PINYIN — the corpus writes one space per syllable");
  console.log("   multi-character notes whose pinyin has no space: " + unspaced.length);
  for (const n of unspaced.slice(0, TOP)) console.log("      " + n.w + "  " + JSON.stringify(n.pinyin) + "  [" + n.id + "]");
  console.log("   notes with no bopomofo, so check-pinyin.js cannot cross-check them: " + nobopo.length);
  for (const n of nobopo.slice(0, TOP)) console.log("      " + n.w + "  " + JSON.stringify(n.pinyin) + "  [" + n.id + "]");
  findings += unspaced.length;
  console.log();
}

/* 5 ── measure words */
if (want("mw")) {
  const nouns = notes.filter((n) => n.senses.some((s) => /<i class="uc-pos">[^<]*noun/.test(s)));
  const bare = nouns.filter((n) => !n.mw);
  console.log("5. MEASURE WORDS — the loosest of the five");
  console.log("   noun-tagged notes: " + nouns.length + ", of which no measure word: " + bare.length +
    " (" + Math.round((100 * bare.length) / nouns.length) + "%)");
  console.log("   many are not countable at all (今天, 大家, 多少); read before filling one in");
  console.log("   e.g. " + bare.slice(0, 16).map((n) => n.w).join("  "));
  console.log();
}

console.log("report only — every check above is a COUNT, not a verdict; see this file's header");
