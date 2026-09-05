#!/usr/bin/env node
"use strict";
/*
  mandarin-fix.js — THE ONE WAY A MANDARIN DECK IS HAND-EDITED (Sep 2026). Standalone Node helper, zero
  deps. Not part of the site.

    node .claude/decks/mandarin-fix.js [--check] [--verbose]

  WHY IT EXISTS. The Mandarin decks' generator inputs (`w26-*.json`) are NOT in this repo, so unlike the
  DELE, DELF, CAPLE, Goethe and UKBI decks these nine cannot be regenerated: every correction to them is
  a hand edit on top of an artefact nobody can rebuild. Done directly, that leaves no record of WHICH of
  a deck's 11,532 notes were touched or why — and the next session, finding a card that disagrees with
  its generator, cannot tell a deliberate repair from a bug.

  SO THE EDITS LIVE IN `mandarin-fixes.json` AND THIS APPLIES THEM. The file is the record: one entry per
  note, keyed by deck id and headword (readable, and stable across a renumbering where a card id is not),
  each carrying the fields it overrides and a `why`. Running it is IDEMPOTENT — a deck already carrying
  the fixes is left byte-identical — so it is safe to re-run, and `--check` asserts exactly that without
  writing, which is what CI can hold.

  IT REWRITES THE LEGACY MIRRORS TOO. A note carries its reading three times over — `fields.Pinyin`, the
  top-level `pinyin`, and the head of `answer` — and its senses twice, in `fields.English` and again in
  `answer` in an abbreviated form (`(v.)` for `verb`). An edit that moved one and not the others is the
  shape that produced the reported `蛋糕` fault's siblings, so `answer` is REBUILT from the fields rather
  than patched: there is one source for it and it cannot drift.

  `hints` IS A SECOND, SEPARATE MAP, AND IT IS SEPARATE BECAUSE IT IS MECHANICAL. The English → Chinese
  card's front is the gloss and nothing else, so two notes sharing a gloss are one question with two
  right answers. The decks already answer that for 104 pairs, with a `not <other word>` block above the
  senses; `hints` completes it for the 251 pairs that were missing one. It is a map rather than an entry
  per note because there is no judgement in it — the other member of the pair is a fact about the corpus —
  and 502 `why` lines all saying the same thing would bury the 57 that are real editorial decisions.
  A group of THREE OR MORE is deliberately NOT hinted: naming four of five answers on the front of the
  card is worse than the ambiguity, so those are given distinguishing glosses in `notes` instead.

  SENSES ARE WRITTEN COMPACTLY AND EXPANDED HERE. `[["yàn","verb","to swallow"],["yān","noun","throat"]]`
  becomes the two `uc-sense` divs the card type renders, with the reading prefix only where a note
  teaches more than one — which is the shape 过, 花, 空 and 重 already use and the shape this pass gave
  the polyphones that were missing their second reading.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const FIXES = path.join(__dirname, "mandarin-fixes.json");
const CHECK = process.argv.includes("--check"), VERBOSE = process.argv.includes("--verbose");

// the abbreviations `answer` uses, derived from the 11,532 notes that already agree on them
const ABBR = {
  adjective: "adj.", adverb: "adv.", conjunction: "conj.", idiom: "idiom.", interjection: "interj.",
  "measure word": "mw.", noun: "n.", numeral: "num.", onomatopoeia: "onom.", particle: "part.",
  phrase: "phr.", prefix: "pref.", preposition: "prep.", pronoun: "pron.", suffix: "suf.", verb: "v.",
};
const abbr = (pos) => pos.split("/").map((p) => ABBR[p.trim()] || p.trim()).join("/");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* senses → the two fields that must agree. `multi` is decided by the sense list rather than passed in,
   so a note that gains a second reading gains its prefixes in both fields in the same pass. */
function renderSenses(senses) {
  const multi = senses.length > 1 && senses.every((s) => s.length === 3);
  const html = senses.map((s) => {
    const [rd, pos, gloss] = s.length === 3 ? s : [null, s[0], s[1]];
    return '<div class="uc-sense">' + (multi && rd ? esc(rd) + " — " : "") +
      '<i class="uc-pos">' + esc(pos) + "</i>" + esc(gloss) + "</div>";
  }).join("");
  const ans = senses.map((s) => {
    const [rd, pos, gloss] = s.length === 3 ? s : [null, s[0], s[1]];
    return (multi && rd ? rd + " — " : "") + "(" + abbr(pos) + ") " + gloss;
  }).join("; ");
  return { html, ans };
}

const fixes = JSON.parse(fs.readFileSync(FIXES, "utf8"));
const entries = Object.entries(fixes.notes || {});
const seen = new Set();
let changed = 0, files = 0, missing = [], badGloss = [];

const hints = Object.entries(fixes.hints || {});
const hintsByDeck = new Map();
const seenHint = new Set();
for (const [key, other] of hints) {
  const i = key.indexOf("/");
  const deck = key.slice(0, i), word = key.slice(i + 1);
  if (!hintsByDeck.has(deck)) hintsByDeck.set(deck, new Map());
  hintsByDeck.get(deck).set(word, { key, other });
}

const byDeck = new Map();
for (const [key, fix] of entries) {
  const i = key.indexOf("/");
  const deck = key.slice(0, i), word = key.slice(i + 1);
  if (!byDeck.has(deck)) byDeck.set(deck, new Map());
  byDeck.get(deck).set(word, { key, fix });
}

for (const f of fs.readdirSync(DIR).filter((x) => /^Mandarin-.*\.folio-deck\.json$/.test(x)).sort()) {
  const p = path.join(DIR, f);
  const before = fs.readFileSync(p, "utf8");
  const d = JSON.parse(before);
  const want = byDeck.get(d.meta && d.meta.id);
  const wantHint = hintsByDeck.get(d.meta && d.meta.id);
  if (!want && !wantHint) continue;
  let hits = 0;
  for (const c of d.cards || []) {
    const fl = c.fields || {};
    /* THE HINT IS APPLIED FIRST AND INDEPENDENTLY, so a note may take a hint and a sense rewrite in one
       pass. It is written as the card type's own `not X` block above the senses — the shape the 104
       pairs the decks already carry use — and is REPLACED rather than appended, so re-running cannot
       stack two of them. */
    const h = wantHint && wantHint.get(fl.Simplified);
    if (h) {
      seenHint.add(h.key);
      const body = String(fl.English || "").replace(/^<div class="uc-pos">not [^<]*<\/div>/, "");
      fl.English = '<div class="uc-pos">not ' + esc(h.other) + "</div>" + body;
      hits++;
    }
    const w = want && want.get(fl.Simplified);
    if (!w) continue;
    seen.add(w.key);
    let fix = w.fix;
    for (const k of ["Pinyin", "Bopomofo", "Say", "Measure word", "Literally", "Examples"]) {
      if (fix[k] !== undefined) fl[k] = fix[k];
    }
    /* `gloss` is `senses` for the common case: ONE sense whose wording changes and whose part of speech
       does not. It exists because the disambiguation pass rewrites 857 glosses and nothing else about
       those cards, and restating each one's part of speech in the record would be 857 chances to get it
       wrong — the card already knows it. A note with several senses must use `senses`, and asking for
       `gloss` on one is refused rather than silently flattening it. */
    if (fix.gloss !== undefined) {
      const ss = String(fl.English || "").match(/<div class="uc-sense">[\s\S]*?<\/div>/g) || [];
      const m = /<i class="uc-pos">([^<]*)<\/i>/.exec(ss[0] || "");
      if (ss.length !== 1 || !m) { badGloss.push(w.key + " (" + ss.length + " senses)"); continue; }
      fix = Object.assign({}, fix, { senses: [[m[1], fix.gloss]] });
    }
    if (fix.senses) {
      const r = renderSenses(fix.senses);
      /* A NOTE GIVEN ITS OWN DISTINGUISHING GLOSS NO LONGER NEEDS A HINT, so the `not X` block goes with
         the gloss it was compensating for. Leaving it would point at a word that no longer shares this
         note's meaning — a disambiguator disambiguating nothing, which is worse than none, since a
         reader reads it as a real distinction. `hints` is regenerated from the finished decks, so a
         note that still collides gets its block back on the next pass. */
      fl.English = r.html;
      c.answerText = r.ans;
    }
    /* THE MIRRORS ARE REBUILT, NEVER PATCHED — see the header. `answer` is "<pinyin> — <senses>" and
       `answerText` the senses alone, which is what the 11,532 untouched notes already are. */
    const gl = c.answerText || "";
    c.pinyin = fl.Pinyin;
    c.answer = fl.Pinyin + " — " + gl;
    c.question = fl.Traditional && fl.Traditional !== fl.Simplified
      ? fl.Simplified + " / " + fl.Traditional : fl.Simplified;
    c.traditional = fl.Traditional || "";
    c.hanzi = fl.Simplified;
    hits++;
  }
  const after = JSON.stringify(d);
  if (after !== before) {
    if (!CHECK) fs.writeFileSync(p, after);
    changed += hits; files++;
    if (VERBOSE || CHECK) console.log((CHECK ? "  WOULD CHANGE " : "  updated ") + f + "  (" + hits + " notes matched)");
  } else if (VERBOSE) console.log("  unchanged " + f + "  (" + hits + " notes already at the fix)");
}
for (const [key] of entries) if (!seen.has(key)) missing.push(key);
for (const [key] of hints) if (!seenHint.has(key)) missing.push(key + " (hint)");

console.log("\n" + entries.length + " fixes and " + hints.length + " reverse-card hints in mandarin-fixes.json, "
  + (seen.size + seenHint.size) + " matched a note");
/* A FIX THAT MATCHES NOTHING IS AN ERROR, NOT A NO-OP. It means the headword was mistyped or the deck id
   is wrong, and the correction the record claims to have made has simply not been made — which reads,
   from the file, exactly like one that has. */
/* A `gloss` on a multi-sense note would have to guess which sense it replaces, so it is refused. */
if (badGloss.length) {
  console.log("\n  FAIL  " + badGloss.length + " `gloss` fix(es) on a note that has not exactly one sense — use `senses`:");
  badGloss.forEach((k) => console.log("        " + k));
  process.exit(1);
}
if (missing.length) {
  console.log("\n  FAIL  " + missing.length + " fix(es) matched no note:");
  missing.forEach((k) => console.log("        " + k));
  process.exit(1);
}
if (CHECK) {
  if (files) { console.log("\n  FAIL  the decks do not carry their fixes — run without --check"); process.exit(1); }
  console.log("  ok    every deck already carries its fixes");
} else console.log(files ? "  " + changed + " notes written across " + files + " file(s)" : "  nothing to do");
