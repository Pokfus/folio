#!/usr/bin/env node
"use strict";
/*
  german-order.js — THE ORDER THE GERMAN DECKS ARE DEALT IN (Nov 2026, the German beginner pass —
  docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/german-order.js              # recompute and write german-order.json
    node .claude/decks/german-order.js --report     # print each order's head and its measurements, write nothing

  WHY IT EXISTS. The app deals a deck in file order (its cards carry no difficulty rating), and Goethe A1's
  file order was a subtitle frequency list's, taken off each headword's own surface form. Measured on
  2026-11-16 on the deck as shipped: day one was ich, sie, Sie, nicht and es; hallo was note 93 (day 19),
  danke 66, bitte 58, tschüss 338 (day 68) and no other greeting was in the deck; sein stood at note 40,
  between five phrases ranked by its count (an sein, auf sein, aus sein, weg sein, zu sein, notes 37 to
  42); the numbers one to ten ran from note 94 to 387, the days from 459 to 757, the months from 527 to
  649; a noun stood next to the word spelled like it (bitte 58 and die Bitte 59, leben and das Leben,
  morgen and der Morgen), because the list is written without capitals. Over the first fifty notes 44% of
  the words in a card's example sentences had been met when the card arrived and 2 of 147 sentences could
  be read whole.

  IT WRITES A RECORD, AND `german-fix.js` APPLIES IT. `german-order.json` is `{ <deck id>: { why, order:
  [headword, …] } }`, a full permutation of the deck's notes. The applier moves each note with its id and
  refuses a list that is not exactly the deck's headwords. The record is the authority and may be edited
  by hand; this script is how it was computed and how it is recomputed on purpose.

  THE BASE ORDER IS THE PINNED ID, not the file. The decks were numbered by frequency, so `u_goethea1_N`
  is the N-th commonest word of the list; the file's own order cannot be the input, because after the
  first run the file IS this script's output. A card the record inserts has a number above the list's and
  no place by frequency: every one of them is named in the head or in a set below, and one that is not
  fails the run rather than falling to the end of the deck.

  THE RULES.
  · Goethe A1 has a HEAD written by hand (`HEAD` below): the courtesies, the words of a first exchange,
    the subject pronouns, ten verbs, the question words, zero to ten, and a handful of function words. It
    is a judgement, not a measurement.
  · THE CLOSED SETS ARE DEALT TOGETHER (`SETS`), each in its own order. Five are PLACED BY HAND at a note
    number (`at`), because the frequency order scattered their members: the days of the week (from note
    151, day 31 at five words a day), the colours (201), the numbers above ten (251), the five phrases
    built on sein (301) and the months and the seasons (351). The ordinals and the compass points stand
    where the earliest of them stood by frequency.
  · LOOK-ALIKES ARE KEPT FORTY NOTES APART: two notes that name each other in a `not X` hint, that share
    their first English gloss, or whose headwords are the same letters once the article and the capital
    are taken off (das Essen / essen, sie / Sie). The later of the two is moved down. A pair inside one
    closed set, or both in the head, is left (the head is laid out by hand; `--report` lists any pair
    that is closer).
  · Everything else keeps the base order.
  · THE PHRASES are tiered by the lowest deck whose headwords and listed forms (plurals, feminines,
    comparatives, the declension and conjugation tables) spell every word of the phrase — A1 first, then
    A2, B1, B2, C1 and C2 — and keep the base order (how often Tatoeba has the phrase) inside a tier. A
    phrase no deck spells comes last.
  · A2, B1, B2, C1 AND C2 ARE NOT RE-ORDERED. They have no entry in the record and stay in the order of
    their pinned numbers, which is a frequency order.

  Never as a side effect: re-run it when the head, the sets or the record's inserts change, then
  `german-fix.js`, then `build-german-sounds.js`, then `.claude/build-lang-decks.js`.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const ORDER_FILE = path.join(__dirname, "german-order.json"), IDS_FILE = path.join(__dirname, "german-ids.json");
const FIXES = path.join(__dirname, "german-fixes.json");
const REPORT = process.argv.includes("--report");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };

const decks = {};
for (const f of fs.readdirSync(DIR).filter((x) => /German|Goethe/.test(x) && /\.folio-deck\.json$/.test(x)).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  if (d.meta && d.meta.types && d.meta.types.goethe) decks[d.meta.id] = d;
}
const LEVELS = ["goethea1", "goethea2", "goetheb1", "germanb2", "germanc1", "germanc2"];
const LEVEL_NAMES = ["A1", "A2", "B1", "B2", "C1", "C2"];
const PHRASES = "germanphr";
for (const id of LEVELS.concat(PHRASES)) if (!decks[id]) fail("no deck " + id + " in decks/");
if (!fs.existsSync(IDS_FILE)) fail("no german-ids.json — run german-fix.js --seed-ids first");
const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8"));
const REC = fs.existsSync(FIXES) ? JSON.parse(fs.readFileSync(FIXES, "utf8")) : {};

/* ---------- reading a card ---------- */
const unesc = (s) => String(s).replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&#x2014;/g, "—").replace(/&amp;/g, "&");
const strip = (s) => unesc(String(s || "").replace(/<[^>]+>/g, " "));
const toks = (s) => String(s).toLowerCase().match(/[a-zäöüßàáâéèêëíîïñóôúûç]+/g) || [];
const firstGloss = (c) => { const m = /<(?:div class="uc-gl"|li)>([\s\S]*?)<\/(?:div|li)>/.exec(c.fields.English); return m ? strip(m[1]).trim().toLowerCase() : ""; };
const hintOf = (c) => { const m = /<div class="uc-pos">[^<]*?, not ([^<]+)<\/div>/.exec(c.fields.English); return m ? strip(m[1]).trim() : ""; };
const examplesOf = (c) => [...String(c.fields.Examples).matchAll(/<div class="uc-exz">([\s\S]*?)<\/div><div class="uc-exe">/g)].map((m) => strip(m[1]));
/* every written form a card shows: the headword, its Forms row, every cell of its All-forms panel */
function formsOf(c) {
  const out = new Set(), add = (s) => toks(s).forEach((t) => out.add(t));
  add(c.fields.Word.replace(/[()]/g, " ")); add(strip(c.fields.Forms));
  for (const m of String(c.fields.Conjugation).matchAll(/<span class="uc-(?:cj-f|dtc)">([\s\S]*?)<\/span>(?=<\/div>|<span class="uc-dtc">)/g)) add(unesc(m[1].replace(/<[^>]+>/g, "")));
  for (const m of String(c.fields.Conjugation).matchAll(/<span class="uc-cj-nfi"><i>[^<]*<\/i><b>([\s\S]*?)<\/b><\/span>/g)) add(unesc(m[1].replace(/<[^>]+>/g, "")));
  return out;
}

/* ---------- the base order: the pinned number ---------- */
function baseOrder(id) {
  const pin = PIN[id] || fail("no pin for " + id), heads = decks[id].cards.map((c) => c.fields.Word);
  const lack = heads.filter((h) => !(h in pin));
  if (lack.length) fail(id + ": not pinned — run german-fix.js first: " + lack.slice(0, 6).join(", "));
  return heads.slice().sort((a, b) => pin[a] - pin[b]);
}

/* ---------- Goethe A1 ---------- */
const HEAD = [
  // the courtesies
  "hallo", "guten Morgen", "guten Tag", "guten Abend", "gute Nacht", "tschüss", "auf Wiedersehen",
  "danke", "vielen Dank", "bitte", "die Entschuldigung", "es tut mir leid", "ja", "nein",
  // a first exchange: ich bin …, wie heißt du?, ich heiße …, wie geht's?, gut, und du? woher kommst du? —
  // and the commonest function words with it, since every sentence on these cards is built of them
  "ich", "sein", "du", "heißen", "ich heiße", "wie", "wie heißt du", "wie geht's", "gut", "und", "nicht", "auch",
  "der, die, das", "ein-", "kommen", "woher", "aus", "wohnen", "wo", "in", "sprechen", "was", "mit",
  // the other subject pronouns
  "er", "sie", "es", "wir", "ihr", "Sie",
  // ten verbs
  "haben", "werden", "können", "müssen", "wollen", "möchten", "gehen", "machen", "wissen", "verstehen",
  // the other question words
  "wer", "wann", "warum", "wohin", "welch-", "wie viel",
  // zero to ten
  "null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn",
  // more function words
  "kein", "mein", "dein-", "aber", "oder", "zu", "auf", "für", "von", "an", "hier", "da", "jetzt", "heute", "sehr", "noch", "nur",
];
const SETS = [
  { name: "the days of the week", at: 151, of: ["der Montag", "der Dienstag", "der Mittwoch", "der Donnerstag", "der Freitag", "der Samstag", "der Sonnabend", "der Sonntag"] },
  { name: "the colours", at: 201, of: ["rot", "blau", "grün", "gelb", "schwarz", "weiß", "grau", "braun"] },
  { name: "the numbers above ten", at: 251, of: ["elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn",
    "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig", "hundert", "tausend", "die Million"] },
  { name: "the phrases built on sein", at: 301, of: ["an sein", "aus sein", "auf sein", "zu sein", "weg sein"] },
  { name: "the months", at: 351, of: ["der Januar", "der Februar", "der März", "der April", "der Mai", "der Juni", "der Juli", "der August", "der September", "der Oktober", "der November", "der Dezember"] },
  { name: "the seasons", after: "the months", of: ["der Frühling", "das Frühjahr", "der Sommer", "der Herbst", "der Winter"] },
  { name: "the ordinals", of: ["erste", "zweite", "dritte", "vierte"] },
  { name: "the compass points", of: ["der Norden", "der Süden", "der Osten", "der Westen"] },
];
const APART = 40;
const letters = (h) => h.replace(/^(?:der|die|das|sich)\s+/, "").toLowerCase();

function lookAlikes(id) {
  const cards = decks[id].cards, pairs = new Map(), add = (a, b, why) => { if (a !== b) pairs.set([a, b].sort().join("\u0001"), why); };
  const heads = new Set(cards.map((c) => c.fields.Word));
  for (const c of cards) for (const h of hintOf(c).split(/,\s*/)) if (h && heads.has(h)) add(c.fields.Word, h, "a `not X` hint");
  const group = (key, why) => {
    const g = new Map();
    for (const c of cards) { const k = key(c); if (k) (g.get(k) || g.set(k, []).get(k)).push(c.fields.Word); }
    for (const v of g.values()) for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) add(v[i], v[j], why);
  };
  group(firstGloss, "the same first gloss");
  group((c) => letters(c.fields.Word), "the same letters but for the article or the capital");
  return [...pairs.entries()].map(([k, why]) => k.split("\u0001").concat(why));
}

function orderA1() {
  const id = "goethea1", base = baseOrder(id), have = new Set(base);
  for (const h of HEAD) if (!have.has(h)) fail("the head names " + h + ", which Goethe A1 does not card");
  if (new Set(HEAD).size !== HEAD.length) fail("the head names a note twice");
  const inHead = new Set(HEAD), setOf = new Map();
  for (const s of SETS) for (const h of s.of) {
    if (!have.has(h)) fail(s.name + " names " + h + ", which Goethe A1 does not card");
    if (inHead.has(h)) fail(s.name + ": " + h + " is in the head");
    if (setOf.has(h)) fail(h + " is in two sets");
    setOf.set(h, s);
  }
  for (const e of (REC.insert || {})[id] || []) if (have.has(e.word) && !inHead.has(e.word) && !setOf.has(e.word))
    fail("the inserted card " + e.word + " has no place by frequency: name it in the head or in a set");
  // the tail in base order; a set with no `at` stands where its earliest member stood
  const tail = [], placed = new Set();
  for (const h of base) {
    if (inHead.has(h)) continue;
    const s = setOf.get(h);
    if (!s) tail.push(h);
    else if (!s.at && !s.after && !placed.has(s)) { placed.add(s); tail.push(...s.of); }
  }
  let list = HEAD.concat(tail);
  // look-alikes forty apart, BEFORE the hand-placed sets go in, so that those start exactly where they are put
  const pairs = lookAlikes(id), movable = (h) => !inHead.has(h) && !setOf.has(h);
  const moved = [];
  for (let pass = 0; pass < 20; pass++) {
    let changed = false;
    for (const [a, b] of pairs) {
      const i = list.indexOf(a), j = list.indexOf(b);
      if (i < 0 || j < 0) continue;
      const lo = Math.min(i, j), hi = Math.max(i, j);
      if (hi - lo >= APART) continue;
      const late = list[hi];
      if (!movable(late)) continue;
      list.splice(hi, 1);
      list.splice(Math.min(list.length, lo + APART), 0, late);
      moved.push(late); changed = true;
    }
    if (!changed) break;
  }
  // the hand-placed sets, in the order of their note numbers; one named `after` another follows it
  for (const s of SETS.filter((x) => x.at).sort((a, b) => a.at - b.at)) {
    if (s.at - 1 < HEAD.length || s.at - 1 > list.length) fail(s.name + ": note " + s.at + " is not in the tail");
    const block = s.of.concat(...SETS.filter((x) => x.after === s.name).map((x) => x.of));
    list.splice(s.at - 1, 0, ...block);
    placed.add(s); SETS.filter((x) => x.after === s.name).forEach((x) => placed.add(x));
  }
  for (const s of SETS) if (!placed.has(s)) fail(s.name + " was not placed");
  if (list.length !== base.length || new Set(list).size !== list.length) fail("the A1 order is not a permutation of the deck");
  const close = pairs.map(([a, b, why]) => [a, b, why, Math.abs(list.indexOf(a) - list.indexOf(b))]).filter((x) => x[3] < APART);
  return { id, list, base, close, moved: [...new Set(moved)] };
}

/* ---------- the phrases: tiered by the deck that can read them ---------- */
function orderPhrases() {
  const id = PHRASES, base = baseOrder(id), known = [], acc = new Set();
  for (const lv of LEVELS) { for (const c of decks[lv].cards) formsOf(c).forEach((f) => acc.add(f)); known.push(new Set(acc)); }
  const byHead = new Map(decks[id].cards.map((c) => [c.fields.Word, c]));
  const tier = (h) => { const t = toks(byHead.get(h).fields.Word); const k = known.findIndex((s) => t.every((x) => s.has(x))); return k < 0 ? LEVELS.length : k; };
  const tiers = base.map(tier), list = base.map((h, i) => [h, tiers[i], i]).sort((a, b) => a[1] - b[1] || a[2] - b[2]).map((x) => x[0]);
  const count = LEVELS.concat("none").map((_, k) => tiers.filter((t) => t === k).length);
  const lacking = new Map();   // the words no deck spells, for --report
  for (const h of base) for (const x of toks(byHead.get(h).fields.Word)) if (!acc.has(x)) lacking.set(x, (lacking.get(x) || 0) + 1);
  return { id, list, base, count, lacking: [...lacking.entries()].sort((a, b) => b[1] - a[1]) };
}

/* ---------- how readable a card's sentences are when it arrives ---------- */
function arrival(id, list, upTo, below) {
  const byHead = new Map(decks[id].cards.map((c) => [c.fields.Word, c])), met = new Set();
  for (const b of below || []) for (const c of decks[b].cards) formsOf(c).forEach((f) => met.add(f));
  let tk = 0, kn = 0, n = 0, full = 0;
  list.forEach((h, i) => {
    const c = byHead.get(h);
    formsOf(c).forEach((f) => met.add(f));
    if (i >= upTo) return;
    for (const e of examplesOf(c)) { const t = toks(e), k = t.filter((x) => met.has(x)).length; tk += t.length; kn += k; n++; if (k === t.length) full++; }
  });
  return Math.round(100 * kn / tk) + "% of the words, " + full + " of " + n + " sentences whole";
}

const A = orderA1(), P = orderPhrases();
const pos = (list, h) => list.indexOf(h) + 1;
const span = (list, hs) => { const p = hs.map((h) => pos(list, h)).filter(Boolean); return Math.min(...p) + "–" + Math.max(...p); };
const day = (n) => Math.ceil(n / 5);
const setNamed = (n) => SETS.find((s) => s.name === n);
const out = {
  _: "german-order.json — the order each German deck is dealt in, as a full list of its headwords. Written by german-order.js (the rules are in its header), applied by german-fix.js, which moves a note with its id and never changes one. It may be edited by hand: a list that is not exactly the deck's headwords is refused. A deck with no entry is dealt in the order of its pinned numbers.",
  goethea1: { why: "Goethe A1 was dealt by a subtitle frequency list: day one was ich, sie, Sie, nicht and es, hallo was note 93, tschüss 338, sein 40 among five phrases ranked by its count, and the days ran from note 459 to 757. Now a head of " + HEAD.length + " notes written by hand (the courtesies, a first exchange, the subject pronouns, ten verbs, the question words, zero to ten, function words), then the frequency order with each closed set together (the days at notes " + span(A.list, setNamed("the days of the week").of) + ", the colours at " + span(A.list, setNamed("the colours").of) + ", the numbers above ten at " + span(A.list, setNamed("the numbers above ten").of) + ", the months and the seasons at " + span(A.list, setNamed("the months").of.concat(setNamed("the seasons").of)) + ") and look-alikes forty notes apart.", order: A.list },
  [PHRASES]: { why: "The phrases were dealt by how often Tatoeba has them. Now tiered by the lowest deck whose headwords and listed forms spell the whole phrase (" + P.count.map((n, k) => n + " " + (LEVEL_NAMES[k] || "no deck")).join(", ") + "), in the same order inside a tier.", order: P.list },
};

/* THE FIGURES THE DESCRIPTIONS STATE ARE THE RECORD'S, TYPED BY HAND (german-fixes.json, `descSub`), so they are
   held to this file's: an order that changes them fails here until the record says the new ones. */
const NUM = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twenty-one", "twenty-two", "twenty-three", "twenty-four", "twenty-five"];
const WANT = [
  ["goethea1", "The first " + HEAD.length + " cards are"],
  ["goethea1", "the days of the week from card " + pos(A.list, setNamed("the days of the week").of[0]) + ", the colours from " + pos(A.list, setNamed("the colours").of[0]) + ", the numbers above ten from " + pos(A.list, setNamed("the numbers above ten").of[0]) + ", the months and the seasons from " + pos(A.list, setNamed("the months").of[0])],
  ["goethea1", "the first " + HEAD.length + " cards take " + NUM[day(HEAD.length)] + " days"],
  ["goethea1", "the whole deck takes " + day(A.list.length) + " days"],
  ["goethea2", "the deck takes " + day(decks.goethea2.cards.length) + " days"],
  [PHRASES, "first the " + P.count[0] + " expressions spelled entirely with words and forms Goethe A1 shows, then those that need A2 (" + P.count[1] + "), B1 (" + P.count[2] + "), B2 (" + P.count[3] + "), C1 (" + P.count[4] + ") and C2 (" + P.count[5] + "), and last the " + P.count[6] + " that use"],
  [PHRASES, "they take " + day(P.count[0]) + " days and the whole deck " + day(P.list.length)],
];
const missing = [];
for (const [id, text] of WANT) {
  const subs = (((REC.decks || {})[id] || {}).descSub || []).map((x) => x[1]).join(" ");
  if (!subs.includes(text)) missing.push("decks." + id + ".descSub does not say “" + text + "”");
}
console.log("Goethe A1 — " + A.list.length + " notes, head " + HEAD.length);
console.log("  first sixty: " + A.list.slice(0, 60).join(" · "));
console.log("  after the head: " + A.list.slice(HEAD.length, HEAD.length + 30).join(" · "));
for (const s of SETS) console.log("  " + s.name + ": notes " + span(A.list, s.of) + " (day " + day(pos(A.list, s.of[0])) + "; by the pinned numbers alone " + span(A.base, s.of) + ")");
console.log("  moved down to stand forty apart: " + (A.moved.join(", ") || "none"));
console.log("  look-alike pairs still closer than " + APART + ": " + (A.close.map((x) => x[0] + " / " + x[1] + " (" + x[3] + ", " + x[2] + ")").join("; ") || "none"));
for (const n of [50, 100, 200, 500, A.list.length]) console.log("  example words met on arrival, first " + n + " notes: " + arrival("goethea1", A.list, n) + "  (base order: " + arrival("goethea1", A.base, n) + ")");
LEVELS.slice(1).forEach((id, k) => { const b = baseOrder(id); console.log("  " + LEVEL_NAMES[k + 1] + " (" + b.length + " notes, not re-ordered), example words met on arrival: " + arrival(id, b, b.length, LEVELS.slice(0, k + 1))); });
console.log("Phrases — " + P.list.length + " notes; by deck " + P.count.join(" / "));
console.log("  first thirty: " + P.list.slice(0, 30).join(" · "));
console.log("  words no deck spells, commonest first: " + P.lacking.slice(0, 40).map((x) => x[0] + " " + x[1]).join(", "));
if (missing.length) { if (REPORT) missing.forEach((m) => console.log("  NOT STATED: " + m)); else fail("german-fixes.json, " + missing[0] + " — the order has changed what the description states"); }
if (!REPORT) {
  const text = "{\n" + Object.keys(out).map((k) => JSON.stringify(k) + ":" + JSON.stringify(out[k])).join(",\n") + "\n}\n";
  if (fs.existsSync(ORDER_FILE) && fs.readFileSync(ORDER_FILE, "utf8") === text) console.log("german-order.json unchanged");
  else { fs.writeFileSync(ORDER_FILE, text); console.log("wrote german-order.json"); }
}
