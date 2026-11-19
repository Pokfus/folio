#!/usr/bin/env node
"use strict";
/*
  indonesian-order.js — THE ORDER UKBI 1 AND THE INDONESIAN PHRASES ARE DEALT IN (Nov 2026, the Indonesian
  beginner pass — docs/lang-decks.md). Writes indonesian-order.json, which indonesian-fix.js applies.
  Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/indonesian-order.js [--check] [--report]

  WHY. A deck is dealt in the order of its file. UKBI 1 was in the order of a subtitle frequency list: day
  one was aku, yang, tidak, ini, itu; halo was note 238 (day 48 at five words a day), terima kasih 275 (day
  55), selamat pagi 441 (day 89); one to ten ran from note 56 to 438, the days of the week from 296 to 487,
  the months from 461 to 493. The phrases were in the order of how often a corpus has them, then the
  alphabet, whatever level a phrase can be read at.

  THE RULE THAT MAKES IT SAFE: the order is computed from the PINNED NUMBER of each note (indonesian-ids.json
  — the generator's frequency rank for a note it wrote), never from the file's own order, so running this
  twice, or after indonesian-fix.js has re-ordered the file, gives the same list.

  UKBI 1.
    1. THE HEAD, written by hand below: the courtesies, the parts of the day, the pronouns with their
       registers side by side, a first exchange (siapa, nama, apa kabar), here and there, the commonest verbs,
       the aspect words and the four negations, the question words, zero to ten, the first function words.
       Every word in it is a card of the deck; a name that is not fails the run.
    2. THE REST in the order of the pinned numbers (the frequency order the deck shipped in), with
    3. THE CLOSED SETS, each dealt as one run at a note number (`SETS`): the numbers above ten, the days of
       the week, the colours, the months. Subdecks would deal them in parallel, a day apart; a run inside the
       one list is a sequence.
    4. A DERIVED WORD NEVER BEFORE ITS ROOT (`AFTER`): where both are cards of the deck and the derived one
       would come first, it is moved to stand ten notes after its root.
    5. Minggu (Sunday) and minggu (week) at least forty notes apart, checked.

  THE PHRASES. Inside each of the three subdecks (the app deals subdecks in parallel), by READING LEVEL: the
  lowest UKBI level by which every word of the expression has been met as a headword or as a form a card
  shows (1 to 7; 8 when some word is on no card of the shelf), then by pinned number. An affixed form
  counts only if a card shows that form.

  indonesian-order.json may be edited by hand afterwards; indonesian-fix.js refuses a list that is not
  exactly the deck's headwords.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const OUT = path.join(HERE, "indonesian-order.json"), IDS = path.join(HERE, "indonesian-ids.json");
const argv = process.argv.slice(2), CHECK = argv.includes("--check"), REPORT = argv.includes("--report");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };

const decks = new Map();
for (const f of fs.readdirSync(DIR).filter((x) => /UKBI|Indonesian/.test(x) && x.endsWith(".folio-deck.json"))) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  if (d.meta && d.meta.types && d.meta.types.ukbi && d.meta.id !== "ukbiall") decks.set(d.meta.id, d);
}
const PIN = JSON.parse(fs.readFileSync(IDS, "utf8"));
const LEVELS = ["ukbi1", "ukbi2", "ukbi3", "ukbi4", "ukbi5", "ukbi6", "ukbi7"];
for (const id of LEVELS.concat("idphrase")) if (!decks.has(id)) fail("no deck " + id + " of card type ukbi in decks/");
const W = (c) => c.fields.Word;
const num = (id, w) => { const n = (PIN[id] || {})[w]; if (!Number.isFinite(n)) fail(id + "/" + w + " has no pinned id — run indonesian-fix.js first"); return n; };

/* ---------- UKBI 1 ---------- */
const HEAD = [
  // the courtesies
  "halo", "terima kasih", "sama-sama", "ya", "tidak",
  "selamat pagi", "selamat siang", "selamat sore", "selamat malam", "apa kabar",
  "baik", "maaf", "tidak apa-apa", "permisi", "tolong",
  // the parts of the day the greetings are made of
  "selamat", "pagi", "siang", "sore", "malam",
  // I and you, each in its two registers; a first exchange
  "saya", "aku", "Anda", "kamu", "kau",
  "siapa", "nama", "apa", "ini", "itu",
  "bukan", "dia", "ia", "beliau", "mereka",
  "kita", "kami", "kalian", "silakan", "selamat datang",
  "sampai jumpa", "selamat tinggal", "selamat jalan", "selamat makan", "hai",
  // here and there
  "di", "ke", "dari", "di mana", "ke mana",
  "dari mana", "di sini", "di sana", "ada", "adalah",
  // the commonest verbs
  "mau", "ingin", "bisa", "harus", "boleh",
  "pergi", "datang", "makan", "minum", "tahu",
  "punya", "suka", "tinggal", "mengerti", "berbicara",
  // when: the aspect words, and the four negations (tidak, bukan above; belum, jangan)
  "sudah", "belum", "sedang", "akan", "masih",
  "pernah", "tidak pernah", "jangan", "sekarang", "hari ini",
  // the question words
  "kapan", "bagaimana", "mengapa", "kenapa", "berapa",
  "yang mana", "apakah", "nol", "satu", "dua",
  "tiga", "empat", "lima", "enam", "tujuh",
  "delapan", "sembilan", "sepuluh", "dan", "atau",
  "yang", "dengan", "untuk", "orang", "sebuah",
];
/* the closed sets: [the note number the run starts at, its members in order] */
const SETS = [
  [151, ["sebelas", "dua belas", "dua puluh", "seratus", "seribu", "juta"]],
  [201, ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]],
  [251, ["warna", "merah", "putih", "hitam", "biru", "hijau", "kuning", "cokelat"]],
  [301, ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]],
];
/* derived → root, both cards of UKBI 1: the root is dealt first (the English Wiktionary's "active of", its
   affix etymologies and its reduplications; kalian, keluar, sendiri and delapan are not on the list — their
   roots are not how a learner meets them) */
const AFTER = [["melakukan", "lakukan"], ["menjadi", "jadi"], ["mendengar", "dengar"], ["dengarkan", "dengar"], ["merasa", "rasa"],
  ["makanan", "makan"], ["minuman", "minum"], ["beberapa", "berapa"], ["benar-benar", "benar"], ["hati-hati", "hati"],
  ["semuanya", "semua"], ["katakan", "kata"], ["pikirkan", "pikir"], ["mendapatkan", "dapat"], ["memberikan", "memberi"],
  ["pekerjaan", "bekerja"], ["seseorang", "orang"], ["baiklah", "baik"], ["ayolah", "ayo"], ["bantuan", "membantu"]];

function orderLevel1() {
  const d = decks.get("ukbi1"), have = new Set(d.cards.map(W));
  const need = (w, what) => { if (!have.has(w)) fail("ukbi1: " + what + " names “" + w + "”, which the deck does not card"); };
  HEAD.forEach((w) => need(w, "the head"));
  if (new Set(HEAD).size !== HEAD.length) fail("ukbi1: the head names a word twice (" + HEAD.filter((w, i) => HEAD.indexOf(w) !== i).join(", ") + ")");
  const placed = new Set(HEAD);
  for (const [, ws] of SETS) for (const w of ws) { need(w, "a set"); if (placed.has(w)) fail("ukbi1: “" + w + "” is placed twice"); placed.add(w); }
  const rest = d.cards.map(W).filter((w) => !placed.has(w)).sort((a, b) => num("ukbi1", a) - num("ukbi1", b));
  let list = HEAD.concat(rest);
  for (const [at, ws] of SETS) { if (at - 1 > list.length) fail("ukbi1: a set starts past the end of the deck"); list.splice(at - 1, 0, ...ws); }
  let moved = 0;
  for (const [der, root] of AFTER) {
    need(der, "AFTER"); need(root, "AFTER");
    const i = list.indexOf(der), j = list.indexOf(root);
    if (i > j) continue;
    list.splice(i, 1);
    const k = list.indexOf(root);
    list.splice(Math.min(list.length, k + 10), 0, der); moved++;
  }
  for (const [der, root] of AFTER) if (list.indexOf(der) < list.indexOf(root)) fail("ukbi1: " + der + " is still dealt before " + root);
  if (Math.abs(list.indexOf("Minggu") - list.indexOf("minggu")) < 40) fail("ukbi1: Minggu and minggu are fewer than forty notes apart");
  return { list, moved };
}

/* ---------- the phrases: the lowest level by which every word has been met ---------- */
const toks = (s) => String(s).toLowerCase().match(/[a-zé]+(?:-[a-zé]+)*/g) || [];
const unesc = (s) => String(s).replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const shown = LEVELS.map((id) => {
  const s = new Set();
  for (const c of decks.get(id).cards) {
    toks(W(c)).forEach((t) => s.add(t));
    for (const m of String(c.fields.Forms).matchAll(/<span class="uc-fl">[^<]*<\/span><b>([^<]*)<\/b>/g)) toks(unesc(m[1])).forEach((t) => s.add(t));
  }
  return s;
});
const tierOf = (w) => Math.max(0, ...toks(w).map((t) => { const i = shown.findIndex((s) => s.has(t)); return i < 0 ? 8 : i + 1; }));
function orderPhrases() {
  const d = decks.get("idphrase"), subs = [];
  for (const c of d.cards) if (!subs.includes(c.sub)) subs.push(c.sub);
  const list = [], tiers = {};
  for (const sub of subs) {
    const cs = d.cards.filter((c) => c.sub === sub).map((c) => ({ w: W(c), t: tierOf(W(c)), n: num("idphrase", W(c)) }));
    cs.sort((a, b) => a.t - b.t || a.n - b.n);
    tiers[sub] = cs.reduce((h, x) => { h[x.t] = (h[x.t] || 0) + 1; return h; }, {});
    cs.forEach((x) => list.push(x.w));
  }
  return { list, tiers };
}

const l1 = orderLevel1(), ph = orderPhrases();
const out = {
  _: "indonesian-order.json — the order UKBI 1 and the Indonesian phrases are dealt in: <deck id> → { why, order: [headword, …] }. Written by indonesian-order.js (its header has the rules), applied by indonesian-fix.js. May be edited by hand; a list that is not exactly the deck's headwords is refused. A deck with no entry is dealt in the order of its pinned numbers.",
  ukbi1: { why: "A head of " + HEAD.length + " notes written by hand (the courtesies, the parts of the day, the pronouns, a first exchange, here and there, the commonest verbs, the aspect words and the negations, the question words, zero to ten, the first function words), then the frequency order the deck shipped in, with the numbers above ten from note 151, the days of the week from 201, the colours from 251 and the months from 301, and no derived word before its root.", order: l1.list },
  idphrase: { why: "Inside each subdeck by reading level — the lowest UKBI level by which every word of the expression has been met as a headword or as a form a card shows, the expressions with a word on no card last — then by pinned number.", order: ph.list },
};
const text = JSON.stringify(out, null, 0).replace(/^\{/, "{\n").replace(/\}$/, "\n}\n").replace(/,"(ukbi1|idphrase)":/g, ',\n"$1":');
if (REPORT) {
  const day = (w) => Math.ceil((l1.list.indexOf(w) + 1) / 5);
  console.log("UKBI 1: " + l1.list.length + " notes, a head of " + HEAD.length + "; " + l1.moved + " derived words moved behind their roots");
  console.log("  day: " + ["halo", "terima kasih", "selamat pagi", "apa kabar", "maaf", "saya", "aku", "Anda", "kamu", "siapa", "nama", "di mana", "mau", "sudah", "belum", "jangan", "kapan", "satu", "sepuluh", "sebelas", "Senin", "merah", "Januari"].map((w) => w + " " + day(w)).join(", "));
  console.log("  first 30 after the head: " + l1.list.slice(HEAD.length, HEAD.length + 30).join(" "));
  for (const k of Object.keys(ph.tiers)) console.log("  phrases, " + k + ": " + JSON.stringify(ph.tiers[k]));
}
const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : null;
if (cur === text) { console.log("indonesian-order.json is current (" + l1.list.length + " + " + ph.list.length + " headwords)"); process.exit(0); }
if (CHECK) { console.log("FAIL  indonesian-order.json is not what indonesian-order.js gives — run it without --check, then indonesian-fix.js"); process.exit(1); }
fs.writeFileSync(OUT, text);
console.log("wrote indonesian-order.json (" + l1.list.length + " + " + ph.list.length + " headwords) — now run node .claude/decks/indonesian-fix.js");
