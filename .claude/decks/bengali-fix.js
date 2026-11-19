#!/usr/bin/env node
"use strict";
/*
  bengali-fix.js — HOW A BENGALI DECK IS NUMBERED, ORDERED AND DESCRIBED (Nov 2026, the Bengali beginner
  pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/bengali-fix.js            # apply the pin, the order and the computed sentences
    node .claude/decks/bengali-fix.js --pin      # only give new notes a number (before bengali-order.js)
    node .claude/decks/bengali-fix.js --check    # exit 1 unless the shipped decks already carry all three

  WHY IT EXISTS. `.claude/bengali/run.py` can rebuild every Bengali deck byte for byte, so a change to a
  card's CONTENT belongs in the generator (the pronunciation line, the verb tables, the words A1 gained
  are all there). Three things do not belong there, and they are this script's:

  1. THE PINNED IDS (bengali-ids.json). The generator numbers a deck by position (u_<deck>_1 … N), and a
     note is ONE NOTE WITH TWO CARD TEMPLATES, so a reader's progress hangs off that number twice
     (`u_x_7` and `u_x_7~2`). The Update press merges progress by id; a deck renumbered because a word
     was added, moved or re-ordered would hand every schedule to another word, in silence. So every note's
     number is pinned to its key (`Word`; an alphabet row's `Key`) and APPLIED here: the generator's
     positional numbers are overwritten. A note with no row takes the next free number (never one a
     retired note held); a row whose note is gone moves to `_retired` and its number is never dealt
     again; a note that comes back takes its old number back. `--check` never writes a row.
  2. THE ORDER (bengali-order.json, computed by bengali-order.js). A deck with an entry is dealt in that
     order; a deck with none in the order of its pinned numbers — the generator's own frequency order
     for every note it had on the day of the seed, a later note after them. A note moves WITH its id.
  3. THE SENTENCES OF A DESCRIPTION THAT STATE AN ORDER OR A PACE. They are computed here from the deck
     as ordered, never typed: which day the first greeting falls on, where the days and the numbers
     stand, how many days the deck takes at the app's default of ten new cards a day, how the phrases
     are tiered. Each replaces a sentence the generator writes (or its own earlier text), found by its
     first and last words, so applying this twice changes nothing.

  THE ORDER OF A REBUILD:
      python3 .claude/bengali/run.py --level a1   (then a2, b1, b2, c1, phr: each reads the ones before)
      node .claude/decks/bengali-fix.js --pin     (a new note gets its number)
      node .claude/decks/bengali-order.js         (the order is computed from the pinned numbers)
      node .claude/decks/bengali-fix.js
      node .claude/decks/build-bengali-alphabet.js   (its example words are A1's, in A1's order)
      node .claude/build-lang-decks.js
  A level rebuilt alone reads only the WORDS of the levels below it (`bengali_level.words_below`), so the
  order of those files does not matter to it.

  WHICH DECKS. By CARD TYPE (bengali-common.js): `bengali` decks get all three; the `bn-abc` deck is
  written whole by build-bengali-alphabet.js, which applies the same pin, and is only CHECKED here.
*/
const C = require("./bengali-common.js");
const CHECK = process.argv.includes("--check"), PIN_ONLY = process.argv.includes("--pin");

const problems = [];
const bad = (m) => problems.push(m);

const decks = C.loadDecks();
const ids = C.readJSON(C.IDS, null);
if (!ids) { console.error("bengali-fix: bengali-ids.json is missing"); process.exit(1); }
const order = C.readJSON(C.ORDER, {});
ids._retired = ids._retired || {};
let idsChanged = false;

// ---- 1. the pin ---------------------------------------------------------------------------------
function pin(id, d) {
  const live = (ids[id] = ids[id] || {}), gone = (ids._retired[id] = ids._retired[id] || {});
  const keys = new Set();
  for (const c of d.deck.cards) {
    const k = C.keyOf(c);
    if (!k) { bad(id + ": a note has no key"); continue; }
    if (keys.has(k)) { bad(id + ": two notes share the key " + k); continue; }
    keys.add(k);
    if (!(k in live)) {
      if (CHECK) { bad(id + ": " + k + " has no pinned number (run bengali-fix.js)"); continue; }
      if (k in gone) { live[k] = gone[k]; delete gone[k]; }
      else live[k] = Math.max(0, ...Object.values(live), ...Object.values(gone)) + 1;
      idsChanged = true;
    }
    const want = "u_" + id + "_" + live[k];
    if (c.id !== want) {
      if (CHECK) bad(id + ": " + k + " has id " + c.id + ", pinned " + want);
      c.id = want;
    }
  }
  for (const k of Object.keys(live)) if (!keys.has(k)) {
    if (CHECK) { bad(id + ": " + k + " is pinned (" + live[k] + ") but the deck has no such note; its row belongs in _retired"); continue; }
    gone[k] = live[k]; delete live[k]; idsChanged = true;
  }
  const nums = Object.values(live).concat(Object.values(gone));
  if (new Set(nums).size !== nums.length) bad(id + ": a number is pinned twice");
  if (!Object.keys(gone).length) delete ids._retired[id];
}

// ---- 2. the order -------------------------------------------------------------------------------
function reorder(id, d) {
  const cards = d.deck.cards, by = new Map(cards.map((c) => [C.keyOf(c), c]));
  let want = order[id];
  if (want) {
    const miss = want.filter((k) => !by.has(k)), extra = [...by.keys()].filter((k) => !want.includes(k));
    if (miss.length || extra.length || want.length !== cards.length) {
      bad(id + ": bengali-order.json is not this deck's headwords" + (miss.length ? "; not in the deck: " + miss.slice(0, 6).join(", ") : "") +
        (extra.length ? "; not in the list: " + extra.slice(0, 6).join(", ") : "") + " (run bengali-order.js)");
      return;
    }
  } else want = [...by.keys()].sort((a, b) => ids[id][a] - ids[id][b]);
  if (CHECK && cards.some((c, i) => C.keyOf(c) !== want[i])) bad(id + ": the cards are not in the recorded order");
  d.deck.cards = want.map((k) => by.get(k));
}

// ---- 3. the computed sentences ------------------------------------------------------------------
const dayOf = (i) => Math.ceil(((i + 1) * 2) / C.NEW_PER_DAY);       // the day note i (0-based) is first seen
const span = (o, words) => { const p = words.map((w) => o.indexOf(w) + 1); return [Math.min(...p), Math.max(...p)]; };

function between(desc, startRe, endMark, text, id) {
  // replace everything from the first match of startRe up to (not including) endMark
  const m = startRe.exec(desc);
  const e = m ? desc.indexOf(endMark, m.index) : -1;
  if (!m || e < 0) { bad(id + ": the description has no sentence to replace (" + startRe + " … " + endMark + ")"); return desc; }
  return desc.slice(0, m.index) + text + desc.slice(e);
}

function paceSentence(d, what) {
  const n = d.deck.cards.length;
  return "At Folio's default of ten new cards a day — which is five " + what + " a day, each being two cards — this deck takes " +
    dayOf(n - 1).toLocaleString("en-GB") + " days. ";
}

function describe(id, d) {
  const O = require("./bengali-order.js");
  const o = d.deck.cards.map(C.keyOf);
  let desc = d.deck.meta.desc;
  const SRC = "Sources. ";
  // the pace, before the sources: its own earlier text is removed first
  const p0 = desc.indexOf("At Folio's default of ten new cards a day");
  if (p0 >= 0) desc = desc.slice(0, p0) + desc.slice(desc.indexOf(SRC, p0));
  const at = desc.lastIndexOf(SRC);
  if (at < 0) bad(id + ": the description has no Sources sentence");
  else desc = desc.slice(0, at) + paceSentence(d, id === "bnphrase" ? "expressions" : "words") + desc.slice(at);

  const START = /The cards are dealt /, END = "The deck teaches the standard colloquial";
  if (id === "bengalia1") {
    const head = O.HEADS.bengalia1, sets = O.SETS.bengalia1, S = (i) => span(o, sets[i].words);
    // "x and y on day 1, z on day 2": the words named, grouped by the day they are first dealt
    const byDay = (words) => {
      const g = new Map();
      for (const w of words) { if (o.indexOf(w) < 0) bad(id + ": the description names " + w + ", which is not a card"); const d = dayOf(o.indexOf(w)); g.set(d, (g.get(d) || []).concat(w)); }
      return [...g.entries()].sort((a, b) => a[0] - b[0]).map(([d, ws]) => (ws.length > 1 ? ws.slice(0, -1).join(", ") + " and " + ws[ws.length - 1] : ws[0]) + " on day " + d).join(", ");
    };
    const [n0, n10] = span(o, ["শূন্য", "দশ"]);
    desc = between(desc, START, END,
      "The cards are dealt in a teaching order, not by frequency alone. The first " + head.length + " are chosen by hand: " +
      "the courtesies of both communities (" + byDay(["নমস্কার", "আসসালামু আলাইকুম", "হ্যাঁ", "না", "ধন্যবাদ", "দয়া করে", "দুঃখিত"]) +
      "), a first exchange (আপনি কেমন আছেন, আপনার নাম কি), the pronouns with their three levels " +
      "of address, the sixteen commonest verbs, the question words, zero to ten (notes " + n0 + " to " + n10 + ") and the small words " +
      "sentences are joined with. After them the words come by that frequency, the commonest first, with the closed sets kept " +
      "together: the days of the week (notes " + S(0).join(" to ") + "), the colours (" + S(1).join(" to ") +
      "), the numbers above ten (" + S(2).join(" to ") + "), the parts of the day, the words for where a thing is and the family. ", id);
  } else if (id === "bengalia2") {
    const sets = O.SETS.bengalia2, S = (i) => span(o, sets[i].words);
    desc = between(desc, START, END,
      "The cards are dealt by that frequency, so the words you meet most often come first, with three closed sets kept together: " +
      "the numbers from thirteen to a hundred thousand (notes " + S(0).join(" to ") + "), the twelve months (" + S(1).join(" to ") +
      ") and the seasons. ", id);
  } else if (id === "bnphrase") {
    const lvl = O.readingLevels(decks), tier = {};
    for (const k of o) { const l = lvl(k); tier[l] = (tier[l] || 0) + 1; }
    const parts = C.LEVELS.map((x, i) => [C.LEVEL_NAME[x], tier[i] || 0]).filter((x) => x[1]);
    desc = between(desc, /Within each subdeck /, "Every expression is printed",
      "Within each subdeck the expressions stand in the order a learner can read them: first those whose every word a card of Bengali " +
      "A1 shows, as a headword or among its forms, then those that need A2, and so on (" +
      parts.map((x) => x[1] + " at " + x[0]).join(", ") + (tier[C.LEVELS.length] ? ", and " + tier[C.LEVELS.length] + " with a word no level teaches" : "") +
      "); among expressions of one level the commonest come first, by a frequency list built from film and television subtitles. " +
      "The app deals the three subdecks side by side. ", id);
  }
  if (CHECK && desc !== d.deck.meta.desc) bad(id + ": the description's computed sentences are stale");
  d.deck.meta.desc = desc;
}

// ---- run ----------------------------------------------------------------------------------------
for (const id of C.SHELF) if (!decks[id]) bad("no deck with the id " + id + " among the Bengali card types");
for (const id of Object.keys(decks)) {
  const d = decks[id];
  // the alphabet's rows are build-bengali-alphabet.js's to write; here they are only checked
  if (d.type === C.WORD_TYPE || CHECK) pin(id, d);
  if (PIN_ONLY || d.type !== C.WORD_TYPE || problems.length) continue;
  reorder(id, d);
  if (!problems.length) describe(id, d);
}
// a word is carded once on the shelf of levels and phrases
const seen = new Map();
for (const id of C.SHELF) if (decks[id] && decks[id].type === C.WORD_TYPE) for (const c of decks[id].deck.cards) {
  const k = C.fold(c.fields.Word);
  if (seen.has(k)) bad(id + ": " + c.fields.Word + " is also a card of " + seen.get(k));
  seen.set(k, id);
}

const say = () => { for (const p of problems.slice(0, 15)) console.error("FAIL  " + p); if (problems.length > 15) console.error("      … and " + (problems.length - 15) + " more"); };
if (problems.length && !CHECK) {
  say();
  if (!(idsChanged && PIN_ONLY)) process.exit(1);   // a pin-only run still saves the numbers it gave
}
if (!CHECK) {
  if (idsChanged) { C.writeByDeck(C.IDS, ids); console.log("bengali-fix: bengali-ids.json updated"); }
  if (!PIN_ONLY) for (const id of Object.keys(decks)) {
    const d = decks[id];
    if (d.type !== C.WORD_TYPE) continue;
    const out = JSON.stringify(d.deck);
    if (out !== d.raw) { C.fs.writeFileSync(d.file, out); console.log("bengali-fix: wrote " + d.name); }
  }
} else {
  for (const id of Object.keys(decks)) if (decks[id].type === C.WORD_TYPE && JSON.stringify(decks[id].deck) !== decks[id].raw)
    bad(id + ": " + decks[id].name + " is not byte for byte what bengali-fix.js writes");
  if (problems.length) { say(); process.exit(1); }
}
const retired = Object.values(ids._retired || {}).reduce((a, m) => a + Object.keys(m).length, 0);
console.log("bengali-fix: " + (CHECK ? "ok — " : "") + Object.keys(decks).length + " decks, " +
  Object.keys(decks).reduce((a, id) => a + decks[id].deck.cards.length, 0) + " notes pinned, " + retired + " retired");
