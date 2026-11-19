#!/usr/bin/env node
"use strict";
/*
  arabic-order.js — THE ORDER ARABIC A1 AND THE ARABIC PHRASES ARE DEALT IN (Nov 2026, the Arabic beginner
  pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/arabic/arabic-order.js [--report]   # write arabic-order.json
    node .claude/arabic/arabic-order.js --check      # the file is what these rules give for the decks as they stand

  It reads the shipped decks and arabic-ids.json and writes arabic-order.json; arabic-fix.js applies it. It
  moves notes and touches nothing in them. Run arabic-fix.js first (an insert must be in its deck to be
  placed), this, then arabic-fix.js again.

  EVERYTHING IS COMPUTED FROM THE PINNED NUMBER, never from the order the file happens to be in, so the script
  gives the same list however often it is run. A note's pinned number is the generator's frequency rank (1 is
  the commonest; the greetings were 1 to 11); an insert's number is above them all. And a note is NAMED HERE BY
  THAT NUMBER, never by its Arabic: a vowelled headword is not typed into a script.

  ARABIC A1.
    1. THE HEAD, by hand: what a first reader says and hears in a first exchange. The greetings with their
       replies, thanks, please and sorry, yes and no, how are you, goodbye, a first exchange of names; the
       eight subject pronouns; the demonstratives; the ten question words; six prepositions and "and"; twelve
       verbs; zero to ten. The shipped deck opened with eleven greetings and then أَنَّ "that", لَا, كَانَ: the
       subtitle list. One to ten ran from note 86 to note 422 and zero was note 475.
    2. THEN THE FREQUENCY ORDER, the pinned numbers ascending,
    3. WITH EACH CLOSED SET TOGETHER at a place named for it: the numbers above ten where the first of them
       stood; the days of the week, Sunday to Saturday, straight after يَوْم "day" (they ran from note 352 to
       488); the twelve months straight after شَهْر "month"; لَوْن "colour" and the six colours where the
       first colour stood.
    4. LOOK-ALIKES FORTY APART: two notes that are one spelling once the vowels are left off (مِنْ "from" and
       مَنْ "who"; أَنَّ and أَنْ) — which is how every example sentence writes them — are kept at least forty
       notes apart, the later one moved down. A pair the head sets side by side on purpose is left.

  THE PHRASES. Three subdecks, dealt side by side, each put in the order it can be READ: first the expressions
  spelled entirely with words and forms an Arabic A1 card shows, then A2, B1, B2, C1, and last those that use
  a word no level cards; within a level, the pinned number (how many Tatoeba sentences contain the expression,
  the order it shipped in). "Shows" is literal: a headword, a form on its Forms row or a cell of its table,
  with the clitics the generator's own count allows (و ف ب ل ك and the article) and a pronoun suffix split off.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const OUT = path.join(HERE, "arabic-order.json"), IDS = path.join(HERE, "arabic-ids.json");
const argv = process.argv.slice(2), REPORT = argv.includes("--report"), CHECK = argv.includes("--check");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const PIN = JSON.parse(fs.readFileSync(IDS, "utf8"));
const decks = new Map();
for (const f of fs.readdirSync(DIR).filter((x) => /^Arabic/.test(x) && /\.folio-deck\.json$/.test(x))) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  if (d.meta.types && d.meta.types.arabic) decks.set(d.meta.id, d);
}
const need = (id) => decks.get(id) || fail("no arabic deck has the id " + id);
const MARKS = /[ً-ٰٟـۡ]/g;
const fold = (s) => s.normalize("NFC").replace(MARKS, "").replace(/[أإآٱ]/g, "ا");
const strip = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const gloss = (c) => strip(c.fields.English.replace(/<div class="uc-pos">[^<]*<\/div>/, ""));

/* ---------- Arabic A1 ---------- */
// THE HEAD, by pinned number; the comment is the card's English. arabic-order.js prints it back with --report.
const HEAD = [
  83, 240, 2, 3, 1,          // hello · hi · peace be upon you · and upon you be peace · welcome
  4, 501, 5, 502, 78,        // good morning · its reply · good evening · its reply · thank you
  503, 399, 8, 92, 46,       // thank you very much · you're welcome; excuse me · please · sorry · yes
  13, 9, 10, 7, 504,         // no; not · how are you? · praise be to God (fine) · goodbye · goodbye, see you
  6, 18, 506, 507, 505,      // good night · I · my name is … · what is your name? · nice to meet you
  11, 43, 44, 30, 57,        // God willing · you (to a man) · you (to a woman) · he · she
  56, 224, 166, 15, 41,      // we · you (more than one) · they · this (m) · this (f)
  21, 93, 215, 20, 31,       // that (m) · that (f) · these · what? (before a noun) · what? (before a verb)
  23, 80, 203, 63, 77,       // who? · where? · when? · how? · why?
  138, 26, 51, 25, 16,       // how many? · (yes-or-no question) · which? · and · in
  27, 17, 35, 28, 55,        // to · on · with · for, to · with, by, in
  14, 32, 38, 39, 49,        // to be (was) · is not · to want · to say · to go
  196, 40, 42, 229, 235,     // to come · to know · to do · to eat · to drink
  181, 261, 128, 475, 86,    // to write · to read · to understand · zero · one
  216, 170, 266, 241, 248,   // two · three · four · five · six
  351, 375, 422, 200,        // seven · eight · nine · ten
];
// THE CLOSED SETS: members in their own order, placed `at` the first of them in the frequency order, or straight `after` a note.
const SETS = [
  { name: "the numbers above ten", ids: [280, 496, 413, 419, 465, 446, 347, 237, 281] },   // 11 12 20 30 40 50 100 1,000 1,000,000
  { name: "the days of the week", after: 98, ids: [458, 352, 476, 488, 481, 451, 427] },    // after "day": Sunday … Saturday
  { name: "the months", after: 212, ids: [508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519] },   // after "month"
  { name: "the colours", ids: [320, 276, 277, 303, 369, 397, 448] },   // colour · black white red blue green yellow
];
const APART = 40;

function a1() {
  const d = need("arabica1"), pin = PIN.arabica1, byNum = new Map();
  for (const c of d.cards) {
    const n = pin[c.fields.Word];
    if (n === undefined) fail("arabica1: “" + c.fields.Word + "” is not pinned — run arabic-fix.js first");
    byNum.set(n, c);
  }
  const want = (n, where) => byNum.get(n) || fail("arabica1: " + where + " names the note " + n + ", which the deck has not got");
  const inHead = new Set(HEAD);
  if (inHead.size !== HEAD.length) fail("arabica1: the head names a note twice");
  HEAD.forEach((n) => want(n, "the head"));
  const inSet = new Map();
  for (const s of SETS) for (const n of s.ids) {
    want(n, s.name);
    if (inHead.has(n) || inSet.has(n)) fail("arabica1: the note " + n + " is placed twice");
    inSet.set(n, s);
  }
  // the frequency order, each set dropped in whole at its place
  const rest = [...byNum.keys()].filter((n) => !inHead.has(n)).sort((a, b) => a - b);
  let tail = [];
  for (const n of rest) {
    const s = inSet.get(n);
    if (!s) { tail.push(n); if (SETS.some((x) => x.after === n)) tail = tail.concat(SETS.find((x) => x.after === n).ids); continue; }
    if (s.after === undefined && n === Math.min(...s.ids)) tail = tail.concat(s.ids);
  }
  for (const s of SETS) if (s.after !== undefined && (inHead.has(s.after) || inSet.has(s.after))) fail("arabica1: " + s.name + " is placed after a note that is itself placed");
  let list = HEAD.concat(tail);
  if (list.length !== byNum.size || new Set(list).size !== list.length) fail("arabica1: the order has " + list.length + " notes for a deck of " + byNum.size);
  // look-alikes: one bare spelling, at least APART notes apart; a member of the head or of a set never moves
  const key = (n) => fold(byNum.get(n).fields.Word), fixed = (n) => inHead.has(n) || inSet.has(n);
  let moved = 0;
  for (let guard = 0; guard < 2000; guard++) {
    let hit = false;
    const last = new Map();
    for (let i = 0; i < list.length && !hit; i++) {
      const n = list[i], k = key(n), j = last.get(k);
      if (j !== undefined && i - j < APART && !(fixed(n) && fixed(list[j]))) {
        const mv = fixed(n) ? j : i, anchor = fixed(n) ? i : j;   // move the free one down, past the fixed one
        const x = list.splice(mv, 1)[0];
        const base = mv < anchor ? anchor - 1 : anchor;
        let to = Math.min(list.length, base + APART);
        while (to < list.length && inSet.has(list[to]) && inSet.has(list[to - 1]) && inSet.get(list[to]) === inSet.get(list[to - 1])) to++;   // never into the middle of a set
        list.splice(to, 0, x);
        moved++; hit = true;
      }
      last.set(k, i);
    }
    if (!hit) break;
  }
  return { list: list.map((n) => byNum.get(n).fields.Word), nums: list, byNum, moved };
}

/* ---------- the phrases: each subdeck by the level that reads it ---------- */
const LEVELS = ["arabica1", "arabica2", "arabicb1", "arabicb2", "arabicc1"], TIER = ["A1", "A2", "B1", "B2", "C1", "no level"];
const PRE = ["", "و", "ف", "ب", "ل", "ك", "ال", "وال", "فال", "بال", "كال", "لل", "ولل", "وب", "ول", "فب", "فل"];   // ar.PREFIXES
const SUF = ["", "ي", "ني", "ك", "ه", "ها", "نا", "كم", "هم", "هن", "كما", "هما"];
function shown(d) {   // every written form a deck's cards show, folded
  const out = new Set();
  for (const c of d.cards) {
    for (const w of fold(c.fields.Word).split(/\s+/)) out.add(w.replace(/^ـ|ـ$/g, ""));
    for (const m of (c.fields.Forms + c.fields.Table).matchAll(/lang="ar">([^<]+)</g)) for (const w of fold(m[1]).split(/[\s،]+/)) if (w) out.add(w.replace(/^ـ|ـ$/g, ""));
  }
  return out;
}
function reads(tok, forms) {
  for (const p of PRE) {
    if (!tok.startsWith(p)) continue;
    const r = tok.slice(p.length);
    if (p && r.length < 2) continue;
    if (p === "لل" && (forms.has("ال" + r) || forms.has("ل" + r))) return true;
    for (const s of SUF) {
      if (s && !r.endsWith(s)) continue;
      const b = s ? r.slice(0, -s.length) : r;
      if (!b) continue;
      if (forms.has(b) || (s && (forms.has(b.replace(/ت$/, "ة")) || forms.has(b.replace(/[يا]$/, "ى")) || forms.has(b + "ا")))) return true;
    }
  }
  return false;
}
function phrases() {
  const d = need("arabicphrase"), pin = PIN.arabicphrase;
  const cum = []; let acc = new Set();
  for (const id of LEVELS) { for (const f of shown(need(id))) acc.add(f); cum.push(new Set(acc)); }
  const tierOf = (c) => { const toks = fold(c.fields.Word).split(/\s+/); const k = cum.findIndex((forms) => toks.every((t) => reads(t, forms))); return k < 0 ? 5 : k; };
  const subs = [...new Set(d.cards.map((c) => c.sub))], counts = TIER.map(() => 0), list = [];
  for (const s of ["Phrases", "Idioms", "Proverbs"].filter((x) => subs.includes(x)).concat(subs.filter((x) => !["Phrases", "Idioms", "Proverbs"].includes(x)))) {
    const cards = d.cards.filter((c) => c.sub === s).map((c) => ({ c, t: tierOf(c), n: pin[c.fields.Word] }));
    for (const x of cards) { if (x.n === undefined) fail("arabicphrase: “" + x.c.fields.Word + "” is not pinned"); counts[x.t]++; }
    cards.sort((a, b) => a.t - b.t || a.n - b.n);
    for (const x of cards) list.push(x.c.fields.Word);
  }
  return { list, counts, n: d.cards.length };
}

const A = a1(), P = phrases();
const out = {
  _: "arabic-order.json — the order Arabic A1 and the Arabic phrases are dealt in, written by arabic-order.js (its header has the rules) and applied by arabic-fix.js. One full list of headwords per deck; a list that is not exactly the deck's headwords is refused. It may be edited by hand, and is rewritten whole whenever arabic-order.js runs.",
  arabica1: { why: "the head a first exchange needs (" + HEAD.length + " notes), then the frequency order with the numbers above ten, the days, the months and the colours each together, and look-alikes " + APART + " apart", order: A.list },
  arabicphrase: { why: "each subdeck by the lowest level whose cards spell the expression, then the order it shipped in; counts is how many expressions " + TIER.join(", ") + " read, which arabic-fix.js writes into the description", counts: P.counts, order: P.list },
};
const text = JSON.stringify(out, null, 0).replace(/^\{/, "{\n").replace(/\}$/, "\n}\n").replace(/,"arabic/g, ',\n"arabic').replace(/^("_":"[^"]*"),/m, "$1,\n");

if (REPORT) {
  const at = (n) => A.nums.indexOf(n) + 1, day = (n) => Math.ceil(at(n) / 5);
  console.log("Arabic A1: " + A.list.length + " notes, " + Math.ceil(A.list.length / 5) + " days; head " + HEAD.length + " notes (" + Math.ceil(HEAD.length / 5) + " days); " + A.moved + " look-alike moves");
  console.log("  head: " + HEAD.map((n) => gloss(A.byNum.get(n))).join(" · "));
  for (const s of SETS) console.log("  " + s.name + ": notes " + at(s.ids[0]) + "–" + at(s.ids[s.ids.length - 1]) + " (day " + day(s.ids[0]) + " on)");
  for (const [label, n] of [["hello", 83], ["thank you", 78], ["please", 8], ["sorry", 92], ["yes", 46], ["no", 13], ["how are you", 9], ["my name is", 506], ["that (conjunction)", 12], ["zero", 475], ["ten", 200]])
    console.log("  " + label + ": note " + at(n) + ", day " + day(n));
  console.log("Phrases: " + TIER.map((t, i) => P.counts[i] + " " + t).join(", "));
}
if (CHECK) {
  if (!fs.existsSync(OUT) || fs.readFileSync(OUT, "utf8") !== text) { console.log("FAIL  arabic-order.json is not what arabic-order.js gives for the decks as they stand — run it, then arabic-fix.js"); process.exit(1); }
  console.log("arabic-order.json is what the rules give: Arabic A1 " + A.list.length + " notes, the phrases " + P.list.length);
} else {
  fs.writeFileSync(OUT, text);
  console.log("wrote arabic-order.json: Arabic A1 " + A.list.length + " notes (head " + HEAD.length + "), the phrases " + P.list.length + " (" + TIER.map((t, i) => P.counts[i] + " " + t).join(", ") + ")");
}
