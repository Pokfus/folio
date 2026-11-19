#!/usr/bin/env node
"use strict";
/*
  persian-order.js — THE ORDER THE PERSIAN DECKS ARE DEALT IN (Nov 2026, the Persian beginner pass —
  docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/persian/persian-order.js [--check] [--report]

  Writes `persian-order.json`, which `persian-fix.js` applies last. Run it AFTER a `persian-fix.js` that
  has put the inserts in, and run `persian-fix.js` again after it.

  WHY. The generator deals a level by subtitle frequency, so A1's first day was کردن · بودن · که · من · به
  and سلام was note 83; the days of the week ran from note 439 to 498 in no order, the numbers from note 7
  (one) to 477 (eleven) and on into A2, and a beginner met خداحافظ on day 83. A deck cannot set its own
  daily limit, and the app deals a deck in file order, so the order is baked into the file.

  EVERY ORDER IS COMPUTED FROM THE PINNED NUMBER (`persian-ids.json`: for a word the generator dealt, its
  frequency rank in its level) and never from the file's own order — so running this twice gives the same
  list, and a rebuilt deck is put back.

  A1.  `HEAD` first, by hand: the courtesies, a first exchange, the pronouns, twelve verbs, the function
       words, the question words, zero to ten. Then every other word by its pinned number, with three
       CLOSED SETS each dealt whole and in their own order from a fixed note (`SETS`): the days from
       Saturday, the Iranian week's first; the numbers above ten; the colours. A word added by the record
       (a number above 500) has no frequency rank, so it must stand in HEAD or in a set: one that does not
       is an error here, never a silent tail.
  A2.  By pinned number, with the four seasons and the twelve solar months each dealt whole, in the
       calendar's order.
  THE PHRASES.  Inside each subdeck (the app deals the three side by side), by READING LEVEL: an
       expression every word of which is a headword, or a form shown on a card, of A1 comes before one that
       needs A2, and so on; then by pinned number.
  THE ALPHABET.  The alphabet's order, each of the four added notes after the letter it explains.
  B1, B2, C1 have no entry: `persian-fix.js` deals them by pinned number, as they shipped.
*/
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..", "..");
const F = (n) => path.join(__dirname, n);
const args = process.argv.slice(2);
const die = (m) => { console.error("persian-order: " + m); process.exit(1); };
const W = (s) => s.trim().split(/\s+/).map((w) => w.replace(/_/g, " "));

const HEAD = [
  // the courtesies
  ...W("سلام خداحافظ بله نه آره ممنون مرسی متشکرم لطفا ببخشید خواهش_می‌کنم بفرمایید صبح_بخیر شب_بخیر خوش_آمدید"),
  // a first exchange
  ...W("من تو شما اسم چیست اسم_شما_چیست بودن هست خوب حال چطور و هم این آن آقا خانم"),
  // the other pronouns
  ...W("او ما آن‌ها ایشان خود"),
  // twelve verbs, and the one sentence a beginner says most
  ...W("داشتن کردن شدن رفتن آمدن خواستن دادن گفتن دیدن خوردن دانستن نمی‌دانم توانستن"),
  // the words a sentence is built out of
  ...W("را به از با در برای تا که یک یا اما ولی"),
  // the question words
  ...W("چه چی کی کجا چرا چند چقدر کدام آیا"),
  // zero to ten (one is above; nine is on the card of نه)
  ...W("صفر دو سه چهار پنج شش هفت هشت ده"),
];
/* [first note of the set, its members in order] */
const SETS = {
  persiana1: [
    [121, W("شنبه یک‌شنبه دوشنبه سه‌شنبه چهارشنبه پنج‌شنبه جمعه")],
    [151, W("یازده دوازده سیزده چهارده پانزده شانزده هفده هجده نوزده بیست سی چهل پنجاه شصت هفتاد هشتاد نود صد هزار")],
    [201, W("رنگ قرمز آبی زرد سبز سیاه سفید قهوه‌ای")],
  ],
  persiana2: [
    [101, W("بهار تابستان پاییز زمستان")],
    [151, W("فروردین اردیبهشت خرداد تیر مرداد شهریور مهر آبان آذر دی بهمن اسفند")],
  ],
};
const ABC = [...Array(30).keys()].map((i) => i + 1).concat([41, 31, 40, 32, 42, 33, 34, 35, 36, 37, 38, 39, 43]);
const LEVELS = ["persiana1", "persiana2", "persianb1", "persianb2", "persianc1"];

const ids = JSON.parse(fs.readFileSync(F("persian-ids.json"), "utf8"));
const decks = {};
for (const f of fs.readdirSync(path.join(ROOT, "decks")).filter((x) => /^Persian-.*\.folio-deck\.json$/.test(x))) {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, "decks", f), "utf8"));
  decks[d.meta.id] = d;
}
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "");
const keyOf = (c) => (c.type === "fa-abc" ? strip(c.fields.Letter) : c.fields.Word);
const fold = (s) => {
  let o = "";
  for (const ch of String(s).normalize("NFD")) {
    const cp = ch.codePointAt(0);
    if (cp === 0x653) { o += ch; continue; }
    if ((cp >= 0x64b && cp <= 0x65f) || cp === 0x670 || cp === 0x640 || cp === 0x200c || cp === 0x200d) continue;
    o += ch === "ي" || ch === "ى" ? "ی" : ch === "ك" ? "ک" : ch;
  }
  return o.normalize("NFC");
};
const byNum = (id) => (a, b) => ids[id][a] - ids[id][b];

function withSets(id, head) {
  const keys = decks[id].cards.map(keyOf), have = new Set(keys);
  const sets = SETS[id] || [];
  const placed = new Set(head);
  for (const w of head) if (!have.has(w)) die(`${id}: the head names "${w}", which is not a headword of the deck`);
  if (new Set(head).size !== head.length) die(`${id}: a word stands twice in the head`);
  for (const [, ws] of sets) for (const w of ws) {
    if (!have.has(w)) die(`${id}: a set names "${w}", which is not a headword of the deck`);
    if (placed.has(w)) die(`${id}: "${w}" is placed twice`);
    placed.add(w);
  }
  const rest = keys.filter((k) => !placed.has(k)).sort(byNum(id));
  const generated = { persiana1: 500, persiana2: 750 }[id];
  const stray = rest.filter((k) => ids[id][k] > generated);
  if (stray.length) die(`${id}: added by the record and given no place (name it in HEAD or in a set): ${stray.join(" ")}`);
  const out = head.concat(rest);
  for (const [at, ws] of sets.slice().sort((a, b) => a[0] - b[0])) {
    if (at - 1 > out.length) die(`${id}: a set is placed at note ${at}, past the end`);
    out.splice(at - 1, 0, ...ws);
  }
  return out;
}

/* what a learner who has finished a level can read: its headwords and every form its cards show */
function shown(id) {
  const s = new Set();
  for (const c of decks[id].cards) {
    for (const w of c.fields.Word.split(/\s+/)) s.add(fold(w));
    for (const fld of [c.fields.Forms, c.fields.Table]) for (const m of String(fld || "").matchAll(/<span class="uc-fa"[^>]*>(.*?)<\/span>/g)) for (const w of m[1].split(/[\s،]+/)) s.add(fold(w));
  }
  return s;
}
const tiers = [];
{ const acc = new Set(); for (const id of LEVELS) { for (const w of shown(id)) acc.add(w); tiers.push(new Set(acc)); } }
const tierOf = (expr) => {
  const ws = expr.replace(/[،؟!.]/g, " ").split(/\s+/).filter(Boolean).map(fold);
  const i = tiers.findIndex((t) => ws.every((w) => t.has(w)));
  return i < 0 ? tiers.length : i;
};

const out = {};
out.faabc = {
  why: "the alphabet's order; the silent و after و, the final ه after ه, the final ی after ی, the half-space last",
  order: (() => { const byN = new Map(decks.faabc.cards.map((c) => [ids.faabc[keyOf(c)], keyOf(c)])); if (byN.size !== ABC.length || ABC.some((n) => !byN.has(n))) die("faabc: the alphabet's notes are not the " + ABC.length + " this file orders"); return ABC.map((n) => byN.get(n)); })(),
};
out.persiana1 = {
  why: `${HEAD.length} notes by hand (the courtesies, a first exchange, the pronouns, twelve verbs, the function words, the question words, zero to ten), then the frequency order; the days from note 121, the numbers above ten from 151, the colours from 201`,
  head: HEAD.length, sets: SETS.persiana1.map((x) => x[0]),
  order: withSets("persiana1", HEAD),
};
out.persiana2 = {
  why: "the frequency order; the four seasons from note 101 and the twelve solar months from note 151, each in the calendar's order",
  head: 0, sets: SETS.persiana2.map((x) => x[0]),
  order: withSets("persiana2", []),
};
{
  const subs = [];
  for (const c of decks.faphrase.cards) if (!subs.includes(c.sub)) subs.push(c.sub);
  const order = [], count = {};
  for (const sub of subs) {
    const ks = decks.faphrase.cards.filter((c) => c.sub === sub).map(keyOf);
    ks.sort((a, b) => tierOf(a) - tierOf(b) || ids.faphrase[a] - ids.faphrase[b]);
    count[sub] = [0, 1, 2, 3, 4, 5].map((t) => ks.filter((k) => tierOf(k) === t).length);
    order.push(...ks);
  }
  out.faphrase = { why: "inside each subdeck by reading level (every word a headword or a shown form of A1, then of A2, B1, B2, C1, then of no level), then by pinned number", tiers: count, order };
}

const text = JSON.stringify(out, null, 0).replace(/^\{/, "{\n").replace(/\},"(faabc|persiana1|persiana2|faphrase)"/g, '},\n"$1"').replace(/\}$/, "\n}") + "\n";
if (args.includes("--report")) {
  const a1 = out.persiana1.order, pos = (w) => a1.indexOf(w) + 1, day = (n) => Math.ceil(n / 5);
  console.log(`A1: ${a1.length} notes, head ${HEAD.length}. Day one: ${a1.slice(0, 5).join(" · ")}`);
  for (const w of ["سلام", "خداحافظ", "ممنون", "من", "بودن", "او", "داشتن", "را", "چه", "صفر", "ده", "شنبه", "جمعه", "یازده", "هزار", "رنگ", "قهوه‌ای"]) console.log(`   ${w}: note ${pos(w)}, day ${day(pos(w))}`);
  console.log("phrases, by reading level (A1, A2, B1, B2, C1, none):", JSON.stringify(out.faphrase.tiers));
}
const cur = fs.existsSync(F("persian-order.json")) ? fs.readFileSync(F("persian-order.json"), "utf8") : "";
if (args.includes("--check")) {
  if (cur !== text) die("persian-order.json is not what this script computes — run node .claude/persian/persian-order.js, then persian-fix.js");
  console.log("persian-order: ok — " + Object.entries(out).map(([k, v]) => k + " " + v.order.length).join(", "));
} else {
  if (cur !== text) fs.writeFileSync(F("persian-order.json"), text);
  console.log("persian-order: " + (cur === text ? "unchanged" : "wrote persian-order.json") + " — " + Object.entries(out).map(([k, v]) => k + " " + v.order.length).join(", "));
}
