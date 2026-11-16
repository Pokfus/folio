#!/usr/bin/env node
"use strict";
/*
  italian-order.js — THE ORDER THE ITALIAN DECKS ARE DEALT IN (Nov 2026, the Italian beginner pass —
  docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/italian-order.js              # recompute and write italian-order.json
    node .claude/decks/italian-order.js --report     # print each order's head and its measurements, write nothing

  WHY IT EXISTS. The app deals a deck in file order (its cards carry no difficulty rating), and CILS A1's
  file order was a subtitle frequency list's. Measured on 2026-11-16 on the deck as shipped: day one was e,
  non, che, di and the article; ciao was note 87 and no other greeting was in the deck; the numbers one to
  ten that the band has stood at notes 25 to 275 (sei at 25, because the list counts "you are"), essere at
  34, avere at 116, potere at 313, dovere at 504 and volere at 572, the list counting the infinitive and
  not voglio; the twelve months ran from note 665 to 803. Over the first fifty notes 42% of the words in a
  card's example sentences had been met when the card arrived and none of the 152 sentences could be read
  whole.

  IT WRITES A RECORD, AND `italian-fix.js` APPLIES IT. `italian-order.json` is `{ <deck id>: { why, order:
  [headword, …] } }`, a full permutation of the deck's notes. The applier moves each note with its id and
  refuses a list that is not exactly the deck's headwords. The record is the authority and may be edited
  by hand; this script is how it was computed and how it is recomputed on purpose.

  THE BASE ORDER IS THE PINNED ID, not the file. The generator numbers a deck's cards by frequency, so
  `u_cilsa1_N` is the N-th commonest word of the band; the file's own order cannot be the input, because
  after the first run the file IS this script's output. A card the record inserts has a number above the
  band's and no place by frequency: every one of them is named in the head or in a set below, and one
  that is not fails the run rather than falling to the end of the deck.

  THE RULES.
  · CILS A1 has a HEAD written by hand (`HEAD` below): the courtesies, the words of a first exchange, the
    subject pronouns, ten verbs, the question words, zero to ten, and a handful of function words. It is
    a judgement, not a measurement.
  · THE CLOSED SETS ARE DEALT TOGETHER (`SETS`), each in its own order. Three are PLACED BY HAND at a
    note number (`at`), because the band's frequency either lacked their members or scattered them to
    its end: the days of the week (from note 151, day 31 at five words a day), the numbers above ten
    (from note 251, day 51) and the months and the seasons (from note 351, day 71). The ordinals stand
    where the earliest of them stood by frequency.
  · LOOK-ALIKES ARE KEPT FORTY NOTES APART: two notes that name each other in a `not X` hint, that share
    their first English gloss, or whose headwords differ only by a written accent (si / sì, e / è). The
    later of the two is moved down. A pair inside one closed set, or both in the head, is left (the head
    is laid out by hand to respect it; `--report` lists any pair that is closer).
  · Everything else keeps the base order.
  · THE PHRASES are tiered by the lowest deck whose headwords and listed forms (plurals, feminines, the
    forms a preposition takes with the article, the conjugation tables) spell every word of the phrase
    — A1 first, then A2 to C2, then the core vocabulary — and keep the base order (how often Tatoeba has
    the phrase) inside a tier. A phrase no deck spells comes last. A single letter before an apostrophe
    (d', l', c', m', t', s', n', v') is the elided form of a word and is not counted.
  · CILS A2 to C2 AND THE CORE VOCABULARY ARE NOT RE-ORDERED: by the same measurement 84% to 91% of a
    card's example words have been met on arrival. They have no entry in the record and stay in the order
    of their pinned numbers. (The core vocabulary's head is ordered by counts it borrows from other
    words — its own description says so — and nothing here has a count to put in their place.)

  Never as a side effect: re-run it when the head, the sets or the record's inserts change, then
  `italian-fix.js`, then `build-italian-sounds.js`, then `.claude/build-lang-decks.js`.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const ORDER_FILE = path.join(__dirname, "italian-order.json"), IDS_FILE = path.join(__dirname, "italian-ids.json");
const FIXES = path.join(__dirname, "italian-fixes.json");
const REPORT = process.argv.includes("--report");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };

const decks = {};
for (const f of fs.readdirSync(DIR).filter((x) => /Italian/.test(x) && /\.folio-deck\.json$/.test(x)).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  if (d.meta && d.meta.types && d.meta.types.cils) decks[d.meta.id] = d;
}
const LEVELS = ["cilsa1", "cilsa2", "cilsb1", "cilsb2", "cilsc1", "cilsc2", "itcore"];
const LEVEL_NAMES = ["A1", "A2", "B1", "B2", "C1", "C2", "the core vocabulary"];
for (const id of LEVELS.concat("itphrase")) if (!decks[id]) fail("no deck " + id + " in decks/");
if (!fs.existsSync(IDS_FILE)) fail("no italian-ids.json — run italian-fix.js --seed-ids first");
const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8"));
const REC = fs.existsSync(FIXES) ? JSON.parse(fs.readFileSync(FIXES, "utf8")) : {};

/* ---------- reading a card ---------- */
const strip = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
/* the words of a string: lower case, an apostrophe ends a word, and a single letter before one is dropped */
const toks = (s) => (String(s).toLowerCase().replace(/[’`]/g, "'").match(/[a-zà-ÿ]+'?/g) || [])
  .filter((t) => !/^[a-zà-ÿ]'$/.test(t)).map((t) => t.replace(/'$/, ""));
const firstGloss = (c) => { const m = /<(?:div class="uc-gl"|li)>([\s\S]*?)<\/(?:div|li)>/.exec(c.fields.English); return m ? strip(m[1]).trim().toLowerCase() : ""; };
const hintOf = (c) => { const m = /<div class="uc-pos">[^<]*?, not ([^<]+)<\/div>/.exec(c.fields.English); return m ? strip(m[1]).replace(/' /g, "'").trim() : ""; };
const examplesOf = (c) => [...String(c.fields.Examples).matchAll(/<div class="uc-exz">([\s\S]*?)<\/div><div class="uc-exe">/g)].map((m) => strip(m[1]));
/* every written form a card shows: the headword, its Forms values, every cell of its conjugation */
function formsOf(c) {
  const out = new Set(), add = (s) => toks(s).forEach((t) => out.add(t));
  add(c.fields.Word);
  for (const m of String(c.fields.Forms).matchAll(/<span class="uc-fl">[^<]*<\/span>([^<]*)/g)) add(strip(m[1]));
  for (const m of String(c.fields.Forms).matchAll(/<div class="uc-gtc[^"]*">([^<]*)<\/div>/g)) add(strip(m[1]));
  for (const m of String(c.fields.Conjugation).matchAll(/<span class="uc-cj-f">([\s\S]*?)<\/span><\/div>/g)) add(strip(m[1]).replace(/ /g, ""));
  for (const m of String(c.fields.Conjugation).matchAll(/<span class="uc-cj-f">([\s\S]*?)<\/span><\/div>/g)) add(strip(m[1].replace(/<[^>]+>/g, "")));
  return out;
}

/* ---------- the base order: the pinned number ---------- */
function baseOrder(id) {
  const pin = PIN[id] || fail("no pin for " + id), heads = decks[id].cards.map((c) => c.fields.Word);
  const lack = heads.filter((h) => !(h in pin));
  if (lack.length) fail(id + ": not pinned — run italian-fix.js first: " + lack.slice(0, 6).join(", "));
  return heads.slice().sort((a, b) => pin[a] - pin[b]);
}

/* ---------- CILS A1 ---------- */
const HEAD = [
  // the courtesies
  "ciao", "buongiorno", "buonasera", "buonanotte", "arrivederci", "salve", "grazie", "prego", "per favore",
  "scusa, scusi", "permesso", "sì", "no",
  // a first exchange: io sono …, come ti chiami?, mi chiamo …, come stai?, bene, grazie, e tu? — and the
  // commonest function words with it, since every sentence on these cards is built of them
  "io", "essere", "tu", "mi chiamo", "come", "come stai", "bene", "molto", "e", "non", "va bene",
  "il, la", "un, una", "di", "a", "che", "la cosa", "in", "con", "per", "da", "mi", "ma", "o",
  // the other subject pronouns
  "lui, lei", "noi", "voi", "loro",
  // ten verbs
  "avere", "andare", "fare", "volere", "potere", "dovere", "piacere", "parlare", "capire", "sapere",
  // the other question words
  "chi", "dove", "quando", "quanto", "quale", "perché",
  // zero to ten
  "zero", "uno", "due", "tre", "quattro", "cinque", "sei", "sette", "otto", "nove", "dieci",
  // more function words, and stare forty notes after essere
  "mio", "anche", "più", "qui", "questo", "ci", "se", "stare",
];
const SETS = [
  { name: "the days of the week", at: 151, of: ["il lunedì", "il martedì", "il mercoledì", "il giovedì", "il venerdì", "il sabato", "la domenica"] },
  { name: "the numbers above ten", at: 251, of: ["undici", "dodici", "tredici", "quattordici", "quindici", "sedici", "diciassette", "diciotto", "diciannove",
    "venti", "trenta", "quaranta", "cinquanta", "sessanta", "settanta", "ottanta", "novanta", "cento", "mille", "milione"] },
  { name: "the months", at: 351, of: ["il gennaio", "il febbraio", "il marzo", "l'aprile", "il maggio", "il giugno", "il luglio", "l'agosto", "il settembre", "l'ottobre", "il novembre", "il dicembre"] },
  { name: "the seasons", after: "the months", of: ["la primavera", "l'estate", "l'autunno", "l'inverno"] },
  { name: "the ordinals", of: ["primo", "secondo", "terzo"] },
];
const APART = 40;
const noAccent = (s) => s.normalize("NFD").replace(/[̀́]/g, "").normalize("NFC");

function lookAlikes(id) {
  const cards = decks[id].cards, pairs = new Map(), add = (a, b, why) => { if (a !== b) pairs.set([a, b].sort().join("\u0001"), why); };
  const heads = new Set(cards.map((c) => c.fields.Word));
  for (const c of cards) { const h = hintOf(c); if (h && heads.has(h)) add(c.fields.Word, h, "a `not X` hint"); }
  const group = (key, why) => {
    const g = new Map();
    for (const c of cards) { const k = key(c); if (k) (g.get(k) || g.set(k, []).get(k)).push(c.fields.Word); }
    for (const v of g.values()) for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) add(v[i], v[j], why);
  };
  group(firstGloss, "the same first gloss");
  group((c) => noAccent(c.fields.Word.toLowerCase()), "the same letters but for an accent");
  return [...pairs.entries()].map(([k, why]) => k.split("\u0001").concat(why));
}

function orderA1() {
  const id = "cilsa1", base = baseOrder(id), have = new Set(base);
  for (const h of HEAD) if (!have.has(h)) fail("the head names " + h + ", which CILS A1 does not card");
  if (new Set(HEAD).size !== HEAD.length) fail("the head names a note twice");
  const inHead = new Set(HEAD), setOf = new Map();
  for (const s of SETS) for (const h of s.of) {
    if (!have.has(h)) fail(s.name + " names " + h + ", which CILS A1 does not card");
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
  const id = "itphrase", base = baseOrder(id), known = [], acc = new Set();
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
function arrival(id, list, upTo) {
  const byHead = new Map(decks[id].cards.map((c) => [c.fields.Word, c])), met = new Set();
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
const out = {
  _: "italian-order.json — the order each Italian deck is dealt in, as a full list of its headwords. Written by italian-order.js (the rules are in its header), applied by italian-fix.js, which moves a note with its id and never changes one. It may be edited by hand: a list that is not exactly the deck's headwords is refused. A deck with no entry is dealt in the order of its pinned numbers.",
  cilsa1: { why: "CILS A1 was dealt by a subtitle frequency list: day one was e, non, che, di and the article, ciao was note 87 and the only greeting, essere note 34, avere 116, volere 572, and the months ran from note 665 to 803. Now a head of " + HEAD.length + " notes written by hand (the courtesies, a first exchange, the subject pronouns, ten verbs, the question words, zero to ten, function words), then the frequency order with each closed set together (the days at notes " + span(A.list, SETS[0].of) + ", the numbers above ten at " + span(A.list, SETS[1].of) + ", the months and the seasons at " + span(A.list, SETS[2].of.concat(SETS[3].of)) + ") and look-alikes forty notes apart.", order: A.list },
  itphrase: { why: "The phrases were dealt by how often Tatoeba has them. Now tiered by the lowest deck whose headwords and listed forms spell the whole phrase (" + P.count.map((n, k) => n + " " + (LEVEL_NAMES[k] || "no deck")).join(", ") + "), in the same order inside a tier.", order: P.list },
};

/* THE FIGURES THE DESCRIPTIONS STATE ARE THE RECORD'S, TYPED BY HAND (italian-fixes.json, `descSub`), so they are
   held to this file's: an order that changes them fails here until the record says the new ones. */
{
  const want = [
    ["cilsa1", "The first " + HEAD.length + " cards are"],
    ["cilsa1", "the days of the week from card " + pos(A.list, SETS[0].of[0]) + ", the numbers above ten from " + pos(A.list, SETS[1].of[0]) + ", the months and the seasons from " + pos(A.list, SETS[2].of[0])],
    ["cilsa1", "the first " + HEAD.length + " cards " + ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"][day(HEAD.length)] + ","],
    ["cilsa1", "the whole deck takes " + day(A.list.length) + " days"],
    ["itphrase", "first the " + P.count[0] + " expressions spelled entirely with words and forms CILS A1 shows, then those that need A2 (" + P.count[1] + "), B1 (" + P.count[2] + "), B2 (" + P.count[3] + "), C1 (" + P.count[4] + "), C2 (" + P.count[5] + ") and the core vocabulary (" + P.count[6] + "), and last the " + P.count[7] + " that use"],
    ["itphrase", "they take " + day(P.count[0]) + " days and the whole deck " + day(P.list.length)],
  ];
  for (const [id, text] of want) {
    const subs = (((REC.decks || {})[id] || {}).descSub || []).map((x) => x[1]).join(" ");
    if (!subs.includes(text)) fail("italian-fixes.json, decks." + id + ".descSub does not say “" + text + "” — the order has changed what the description states");
  }
}
console.log("CILS A1 — " + A.list.length + " notes, head " + HEAD.length);
console.log("  first sixty: " + A.list.slice(0, 60).join(" · "));
console.log("  after the head: " + A.list.slice(HEAD.length, HEAD.length + 30).join(" · "));
for (const s of SETS) console.log("  " + s.name + ": notes " + span(A.list, s.of) + " (day " + day(pos(A.list, s.of[0])) + "; by the pinned numbers alone " + span(A.base, s.of) + ")");
console.log("  moved down to stand forty apart: " + (A.moved.join(", ") || "none"));
console.log("  look-alike pairs still closer than " + APART + ": " + (A.close.map((x) => x[0] + " / " + x[1] + " (" + x[3] + ", " + x[2] + ")").join("; ") || "none"));
for (const n of [50, 100, 200, 500, A.list.length]) console.log("  example words met on arrival, first " + n + " notes: " + arrival("cilsa1", A.list, n) + "  (base order: " + arrival("cilsa1", A.base, n) + ")");
console.log("Phrases — " + P.list.length + " notes; by deck " + P.count.join(" / "));
console.log("  first thirty: " + P.list.slice(0, 30).join(" · "));
console.log("  words no deck spells, commonest first: " + P.lacking.slice(0, 40).map((x) => x[0] + " " + x[1]).join(", "));
if (!REPORT) {
  const text = "{\n" + Object.keys(out).map((k) => JSON.stringify(k) + ":" + JSON.stringify(out[k])).join(",\n") + "\n}\n";
  if (fs.existsSync(ORDER_FILE) && fs.readFileSync(ORDER_FILE, "utf8") === text) console.log("italian-order.json unchanged");
  else { fs.writeFileSync(ORDER_FILE, text); console.log("wrote italian-order.json"); }
}
