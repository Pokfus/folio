#!/usr/bin/env node
/* A CARD'S SPEAKER SAYS WHAT THE CARD SHOWS (Aug 2026, on a bug report: "TTS in some languages doesn't
   read out noun articles").

   Every language deck draws its headword as `<div class="uc-word">{{Lang}}<span class="uc-tts uc-say"
   data-say="{{Word}}"></span></div>` — the DISPLAYED word comes from one field and the SPOKEN one from
   another, which is what lets them disagree. Measured over the shipped decks when this was written, they
   disagreed in exactly one language: French said `été` where the card showed `l'été`, on all 3,640 of its
   noun cards across six levels, while German said `die Bitte`, Portuguese `a casa` and Italian `l'ora`.

   THE RULE THIS ASSERTS IS THE NARROW ONE: where the displayed headword carries ONE article — a single
   `<span class="uc-art">` — the spoken form must carry it too. It deliberately does NOT require the two
   fields to be equal in general: a display may carry markup, a gender colour or a bracketed hint that has
   no business being read aloud, and several decks legitimately differ that way.

   A COMMON-GENDER NOUN IS EXEMPT, AND THAT EXEMPTION IS THE ONE WORTH UNDERSTANDING. Italian writes
   `il/la complice` as THREE article spans — `il`, `/`, `la` — because the noun takes either gender, and
   there is no way to say that aloud: a speaker reading it would pronounce the slash, and picking one of
   the two would assert a gender the card is deliberately declining to. So the bare noun is the least
   wrong thing to say there and those cards are left alone. Being in scope is therefore EXACTLY ONE
   article span, which is a literal test rather than a guess at what the display means: 73 Italian nouns
   whose article merely elides to `l'` (`l'assistente`, `l'erede`) ARE speakable and were being dropped
   with the rest, and this is what tells them from the 100-odd that are not.

   IT EXISTS BECAUSE THE DECKS CANNOT BE REGENERATED. The French pipeline's word list is a third party's
   ordinary web page, and that page's markup has changed since the deck was built: re-running
   `.claude/delf/run.py` today reads 41 words off it against the ~384 it was built from, and produces a
   deck of 103 notes against the shipped 446. So the generator fix (build_deck.py) cannot be proved by
   re-running, and the shipped files are repaired in place instead — a FIELD edit, which touches no card
   id and so moves nobody's schedule. This is the same position the Mandarin decks are in, and the same
   answer: a committed checker is what keeps a file nobody can rebuild honest.

       node .claude/decks/check-say.js            report, exit 1 on any finding
       node .claude/decks/check-say.js --fix      repair the spoken form in place

   `--fix` sets the spoken field to the DISPLAYED one with its tags stripped and its entities decoded,
   which is what makes the elision right for free: the markup closes `l'` up against the word and puts a
   space after `le`, so the result is `l'été` and `le père` exactly as they are read off the screen.
   Not part of the site. */
"use strict";
const fs = require("fs");
const path = require("path");

const DECKS = path.join(__dirname, "..", "..", "decks");
const FIX = process.argv.includes("--fix");

const stripTags = (s) => String(s == null ? "" : s).replace(/<[^>]+>/g, "");
const decode = (s) =>
  String(s == null ? "" : s)
    .replace(/&#x27;/gi, "'").replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"').replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
const shown = (s) => decode(stripTags(s)).replace(/\s+/g, " ").trim();

/* The two fields are read OFF THE TEMPLATE rather than guessed at: the display field is whichever one
   `.uc-word` interpolates and the spoken one is whatever `data-say` names, so a deck that spells them
   differently is read correctly and a deck with no speaker at all is skipped rather than reported. */
function fieldsOf(deck) {
  const types = (deck.meta && deck.meta.types) || {};
  for (const t of Object.values(types)) {
    for (const c of (t && t.cards) || []) {
      const front = String((c && c.front) || "");
      const disp = /<div class="uc-word">\{\{(\w+)\}\}/.exec(front);
      const say = /class="[^"]*uc-say[^"]*"\s+data-say="\{\{(\w+)\}\}"/.exec(front);
      if (disp && say) return { disp: disp[1], say: say[1] };
    }
  }
  return null;
}

let files = 0, checked = 0, bad = 0, fixed = 0;
const byFile = [];
for (const name of fs.readdirSync(DECKS).sort()) {
  if (!name.endsWith(".folio-deck.json")) continue;
  const p = path.join(DECKS, name);
  let deck;
  try { deck = JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { console.log("SKIP  " + name + " — unreadable"); continue; }
  const f = fieldsOf(deck);
  if (!f) continue;
  files++;
  let hits = 0, sample = null;
  for (const card of deck.cards || []) {
    const fl = card.fields;
    if (!fl || !fl[f.disp]) continue;
    // exactly ONE article span: no article at all is out of scope, and several means a common-gender
    // noun written `il/la complice`, which cannot be spoken as written (see the header)
    const arts = (String(fl[f.disp]).match(/<span class="uc-art/g) || []).length;
    if (arts !== 1) continue;
    checked++;
    const want = shown(fl[f.disp]);
    const have = shown(fl[f.say]);
    if (want === have) continue;
    hits++;
    if (!sample) sample = { shown: want, said: have };
    if (FIX) { fl[f.say] = want; fixed++; }
  }
  if (hits) {
    bad += hits;
    byFile.push({ name, hits, sample });
    if (FIX) fs.writeFileSync(p, JSON.stringify(deck));
  }
}

byFile.forEach((r) => {
  console.log((FIX ? "fixed " : "FAIL  ") + r.name + " — " + r.hits + " card" + (r.hits === 1 ? "" : "s") +
    " show an article the speaker does not say");
  console.log("        e.g. shows " + JSON.stringify(r.sample.shown) + ", says " + JSON.stringify(r.sample.said));
});
console.log("\n" + files + " decks with a speaker, " + checked + " headwords carrying an article, " +
  (FIX ? fixed + " repaired." : bad + " where the speaker drops it."));
if (!FIX && bad) { console.log("\nRun with --fix to repair, then re-run to confirm."); process.exit(1); }
process.exit(0);
