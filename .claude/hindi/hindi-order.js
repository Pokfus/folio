#!/usr/bin/env node
"use strict";
/*
  hindi-order.js — COMPUTES `hindi-order.json`, the order three Hindi decks are dealt in (Nov 2026, the Hindi
  beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/hindi/hindi-order.js            # write hindi-order.json
    node .claude/hindi/hindi-order.js --check    # fail if the file is not what these rules give
    node .claude/hindi/hindi-order.js --report   # the measurements (before / after) and nothing written

  `hindi-fix.js` APPLIES the file; this script only writes it. Run it after the record or the generator has
  changed which notes a deck holds, then run hindi-fix.js. It reads the decks for their NOTES and the pin
  (`hindi-ids.json`) for their NUMBERS, never the order the file happens to be in, so it gives the same
  list from a fresh build and from the committed decks.

  WHAT A NUMBER IS. The generator deals a level by lemma frequency, the commonest first, and numbers the
  notes 1 … N in that order; the pin keeps those numbers. So a note's pinned number IS its frequency rank,
  and "by frequency" below means "by pinned number". A note the record inserted has a number above the
  generator's and no rank: it must be named in the head or in a set, or this script fails.

  HINDI A1 (`hindia1`).
    1. THE HEAD, by hand (`HEAD`): what a learner needs before a frequency list would deal it. Day one was
       होना · मैं · करना · कि · नहीं; नमस्ते was note 372 (day 75 of the deck). Eight groups: the courtesies,
       a first exchange, the pronouns and possessives, the postpositions, twelve verbs, the question words,
       zero to ten, twelve function words.
    2. THE REST BY FREQUENCY, with three CLOSED SETS each kept together and placed at a note number
       (`SETS`): the days of the week (they were notes 454 to 495, eight other words between any two),
       the colours (419 to 469), the numbers above ten (474 to 494, and thirteen to nineteen in A2).
       A set stands at its place, not at its commonest member's: a subtitle count ranks Saturday at 454.
  HINDI A2 (`hindia2`). By frequency, with the twelve months together where the first of them stood
       (they were notes 609 to 743).
  THE PHRASES (`hiphrase`). Inside each subdeck, by READING LEVEL: the lowest level whose headwords and
       shown forms (Forms row, All forms) spell every word of the expression — A1, A2, B1, B2, C1, then
       those no level spells — and inside a level by pinned number (the generator's Tatoeba count).
       Subdecks are dealt in parallel by the app, so the sequence is an order inside each list.

  `facts` are the figures a description states (`{head}`, `{days}` … in hindi-fixes.json's `descSub`):
  hindi-fix.js writes them into the text, so no figure is typed.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const IDS_FILE = path.join(HERE, "hindi-ids.json"), ORDER_FILE = path.join(HERE, "hindi-order.json"), FIXES = path.join(HERE, "hindi-fixes.json");
const argv = process.argv.slice(2), CHECK = argv.includes("--check"), REPORT = argv.includes("--report");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8")), R = JSON.parse(fs.readFileSync(FIXES, "utf8"));
const fold = (s) => s.normalize("NFD").replace(/़/g, "").replace(/ँ/g, "ं").normalize("NFC");
const toks = (s) => (String(s).replace(/<[^>]+>/g, " ").match(/[ऀ-ॣ०-ॿ‌‍]+/g) || []).map(fold);

const D = {};
for (const f of fs.readdirSync(DIR).filter((x) => /^Hindi-.*\.folio-deck\.json$/.test(x))) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  if (d.meta.types && d.meta.types.hindi) D[d.meta.id] = d;
}
// the notes a deck WILL hold once the record is applied: its own, plus the inserts, minus the drops
function notesOf(id) {
  const m = new Map(D[id].cards.map((c) => [c.fields.Word, c]));
  for (const e of (R.insert || {})[id] || []) if (!m.has(e.word)) m.set(e.word, { fields: e.fields || { Word: e.word, Forms: "", Table: "", Examples: "" }, sub: e.sub || "" });
  for (const w of Object.keys(((R.decks || {})[id] || {}).dropDup || {})) m.delete(w);
  return m;
}
const numOf = (id, w) => { const n = (PIN[id] || {})[w]; if (n !== undefined) return n; const e = ((R.insert || {})[id] || []).find((e) => e.word === w); return e ? e.id : fail(id + ": " + w + " has no pinned number"); };
// a headword the generator respells keeps its number under the old key until hindi-fix.js renames it
const num = (id, w) => { const p = PIN[id] || {}; if (w in p) return p[w]; const o = Object.keys(p).find((k) => fold(k) === fold(w)); return o ? p[o] : numOf(id, w); };

/* ---- Hindi A1 ---------------------------------------------------------------------------------------- */
const HEAD = [
  // the courtesies: three days
  "नमस्ते", "धन्यवाद", "हाँ", "नहीं", "कृपया",
  "नमस्कार", "शुक्रिया", "जी", "जी हाँ", "जी नहीं",
  "माफ़ कीजिए", "कोई बात नहीं", "अलविदा", "स्वागत", "ठीक",
  // a first exchange
  "आप", "कैसा", "आप कैसे हैं", "मैं", "होना", "मैं ठीक हूँ", "अच्छा", "और", "नाम", "क्या", "मेरा", "मेरा नाम ... है", "आपका", "आपका नाम क्या है",
  // the pronouns and the possessives
  "तुम", "तू", "वह", "यह", "हम", "वे", "ये", "तुम्हारा", "उसका", "हमारा", "उनका", "इसका", "अपना",
  // the postpositions
  "का", "को", "से", "में", "पर", "तक", "ने", "के लिए", "के साथ",
  // twelve verbs
  "करना", "जाना", "आना", "रहना", "देना", "लेना", "सकना", "चाहना", "चाहिए", "खाना", "पीना", "बोलना",
  // the question words
  "कौन", "कहाँ", "कब", "कैसे", "क्यों", "कितना", "कौनसा", "किधर",
  // zero to ten
  "शून्य", "एक", "दो", "तीन", "चार", "पाँच", "छह", "सात", "आठ", "नौ", "दस",
  // twelve words every sentence leans on
  "कि", "भी", "ही", "तो", "या", "लेकिन", "न", "मत", "बहुत", "कुछ", "कोई", "सब",
];
const COURTESIES = 15;
const SETS = [ // [name, the note number its first member takes, members in their own order]
  ["days", 151, ["सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार", "रविवार"]],
  ["colours", 201, ["रंग", "लाल", "नीला", "पीला", "हरा", "काला", "सफ़ेद"]],
  ["numbers", 251, ["ग्यारह", "बारह", "तेरह", "चौदह", "पंद्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस", "बीस", "तीस", "चालीस", "पचास", "साठ", "सत्तर", "अस्सी", "नब्बे", "सौ", "हज़ार"]],
];
function orderA1() {
  const notes = notesOf("hindia1"), id = "hindia1";
  const placed = new Set();
  const need = (w, where) => { if (!notes.has(w)) fail("hindia1: " + where + " names " + w + ", which is not a note of the deck"); if (placed.has(w)) fail("hindia1: " + w + " is placed twice"); placed.add(w); };
  HEAD.forEach((w) => need(w, "the head")); SETS.forEach(([n, , ws]) => ws.forEach((w) => need(w, "the set " + n)));
  const gen = Math.max(0, ...Object.values(PIN[id] || {}));
  const rest = [...notes.keys()].filter((w) => !placed.has(w));
  for (const w of rest) if (((R.insert || {})[id] || []).some((e) => e.word === w)) fail("hindia1: the inserted note " + w + " has no frequency rank: name it in HEAD or in a set");
  rest.sort((a, b) => num(id, a) - num(id, b));
  const order = HEAD.concat(rest), facts = { head: HEAD.length, courtesyDays: COURTESIES / 5 };
  for (const [name, at, ws] of SETS) { if (at - 1 > order.length || at <= HEAD.length) fail("hindia1: the set " + name + " cannot stand at " + at); order.splice(at - 1, 0, ...ws); facts[name + "At"] = at; }
  facts.days = Math.ceil(order.length * 2 / 10);
  void gen;
  return { why: "The head by hand, then by frequency (the pinned number) with the days, the colours and the numbers above ten each together: hindi-order.js.", facts, order };
}

/* ---- Hindi A2 ---------------------------------------------------------------------------------------- */
const MONTHS = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
function orderA2() {
  const id = "hindia2", notes = notesOf(id);
  const key = new Map([...notes.keys()].map((w) => [fold(w), w]));
  const months = MONTHS.map((m) => key.get(fold(m)) || fail("hindia2: no note for the month " + m));
  const rest = [...notes.keys()].filter((w) => !months.includes(w)).sort((a, b) => num(id, a) - num(id, b));
  const first = Math.min(...months.map((w) => num(id, w)));
  const at = rest.filter((w) => num(id, w) < first).length;
  rest.splice(at, 0, ...months);
  return { why: "By frequency (the pinned number), with the twelve months together where the first of them stood: hindi-order.js.", facts: { monthsAt: at + 1 }, order: rest };
}

/* ---- the phrases ------------------------------------------------------------------------------------- */
const LEVELS = ["hindia1", "hindia2", "hindib1", "hindib2", "hindic1"];
function shownForms(c) {
  const s = new Set(toks(c.fields.Word));
  for (const m of String(c.fields.Forms || "").matchAll(/<\/span>([^<]+)<span class="uc-fr">/g)) toks(m[1]).forEach((t) => s.add(t));
  for (const m of String(c.fields.Table || "").matchAll(/<span class="uc-cj-[pf]">([^<]+)</g)) toks(m[1]).forEach((t) => s.add(t));
  return s;
}
function tiers() {
  const acc = new Set(), out = [];
  for (const id of LEVELS) { for (const c of notesOf(id).values()) for (const t of shownForms(c)) acc.add(t); out.push(new Set(acc)); }
  return out;
}
function orderPhrases() {
  const id = "hiphrase", notes = notesOf(id), T = tiers();
  const tierOf = (w) => { const ts = toks(w); const i = T.findIndex((s) => ts.every((t) => s.has(t))); return i < 0 ? LEVELS.length : i; };
  const subs = []; for (const c of D[id].cards) if (!subs.includes(c.sub)) subs.push(c.sub);
  const SUBS = ["Phrases", "Idioms", "Proverbs"].filter((s) => subs.includes(s)).concat(subs.filter((s) => !["Phrases", "Idioms", "Proverbs"].includes(s)));
  const rows = [...notes.entries()].map(([w, c]) => ({ w, sub: SUBS.indexOf(c.sub), tier: tierOf(w), n: num(id, w) }));
  rows.sort((a, b) => a.sub - b.sub || a.tier - b.tier || a.n - b.n);
  const count = (t, sub) => rows.filter((r) => r.tier === t && (sub === undefined || SUBS[r.sub] === sub)).length;
  const facts = { a1: count(0), a2: count(1), b1: count(2), b2: count(3), c1: count(4), none: count(5), phrasesA1: count(0, "Phrases"), phrases: rows.filter((r) => SUBS[r.sub] === "Phrases").length,
    proverbsA1: count(0, "Proverbs"), cards: rows.length * 2, days: Math.ceil(rows.length * 2 / 10) };
  if (facts.proverbsA1 !== 0) fail("hiphrase: the description says no proverb is spelled by A1 alone, and " + facts.proverbsA1 + " are");
  return { why: "Inside each subdeck by reading level (the lowest level deck whose headwords and shown forms spell the expression), then by pinned number: hindi-order.js.", facts, order: rows.map((r) => r.w) };
}

/* ---- how much of a card's sentences a reader has met when the card arrives ------------------------------ */
function readability(id, order, lower) {
  const notes = notesOf(id), met = new Set(lower);
  let tok = 0, ok = 0, whole = 0, sents = 0, t50 = 0, o50 = 0, w50 = 0, s50 = 0;
  order.forEach((w, i) => {
    const c = notes.get(w); for (const t of shownForms(c)) met.add(t);
    for (const m of String(c.fields.Examples || "").matchAll(/data-say="([^"]*)"/g)) {
      const ts = toks(m[1]), k = ts.filter((t) => met.has(t)).length;
      sents++; tok += ts.length; ok += k; if (k === ts.length) whole++;
      if (i < 50) { s50++; t50 += ts.length; o50 += k; if (k === ts.length) w50++; }
    }
  });
  return "first 50 notes " + (100 * o50 / t50).toFixed(1) + "% of words met, " + w50 + " of " + s50 + " sentences whole; the deck " + (100 * ok / tok).toFixed(1) + "%, " + whole + " of " + sents;
}

const out = { _: "hindi-order.json — the order hindi-fix.js deals three Hindi decks in, written by hindi-order.js (its header has the rules); `facts` are the figures the descriptions state. May be edited by hand; a list that is not exactly the deck's notes is refused.", hindia1: orderA1(), hindia2: orderA2(), hiphrase: orderPhrases() };
if (REPORT) {
  const a1 = notesOf("hindia1"), byNum = [...a1.keys()].filter((w) => w in (PIN.hindia1 || {}) || Object.keys(PIN.hindia1).some((k) => fold(k) === fold(w))).sort((a, b) => num("hindia1", a) - num("hindia1", b));
  console.log("Hindi A1 by frequency (as shipped): " + readability("hindia1", byNum, []));
  console.log("Hindi A1 in this order:             " + readability("hindia1", out.hindia1.order, []));
  for (const k of ["hindia1", "hindia2", "hiphrase"]) console.log(k + " facts " + JSON.stringify(out[k].facts) + "\n  first 20: " + out[k].order.slice(0, 20).join(" · "));
  process.exit(0);
}
const text = "{\n" + Object.keys(out).map((k) => JSON.stringify(k) + ":" + JSON.stringify(out[k])).join(",\n") + "\n}\n";
if (CHECK) {
  if (!fs.existsSync(ORDER_FILE) || fs.readFileSync(ORDER_FILE, "utf8") !== text) fail("hindi-order.json is not what hindi-order.js gives (run it, then hindi-fix.js)");
  console.log("ok    hindi-order.json: " + ["hindia1", "hindia2", "hiphrase"].map((k) => k + " " + out[k].order.length).join(", "));
} else { fs.writeFileSync(ORDER_FILE, text); console.log("wrote hindi-order.json: " + ["hindia1", "hindia2", "hiphrase"].map((k) => k + " " + out[k].order.length).join(", ")); }
