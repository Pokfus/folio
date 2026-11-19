#!/usr/bin/env node
"use strict";
/*
  russian-order.js — THE ORDER THE RUSSIAN DECKS ARE DEALT IN (Nov 2026, the Russian beginner pass —
  docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/russian-order.js              # recompute and write russian-order.json
    node .claude/decks/russian-order.js --report     # print each order's head and its measurements, write nothing

  WHY IT EXISTS. The app deals a deck in file order, and TORFL A1's file order was the generator's lemma
  frequency. Measured on 2026-11-19 on the deck as shipped: day one was что, ты, я, не and он; привет was
  note 497 of 500 (day 100 at five words a day), здравствуйте 341, до свидания 493, доброе утро 494, добрый
  день 495, спасибо 55, да 72; one to ten ran from note 44 to 416 and thirteen to ninety were the last cards
  of A2; the days ran from 415 to 465 and the months from 429 to 492; мочь, "can", was note 489, because the
  frequency list gives может and могу to other entries. Over the first fifty notes 62% of the words in a
  card's example sentences had been met when the card arrived and 8 of 150 sentences could be read whole.

  IT WRITES A RECORD, AND `russian-fix.js` APPLIES IT. `russian-order.json` is `{ <deck id>: { why, order:
  [Word, …] } }`, a full permutation of the deck's notes. The applier moves each note with its id and
  refuses a list that is not exactly the deck's headwords. The record is the authority and may be edited by
  hand; this script is how it was computed and how it is recomputed on purpose.

  THE BASE ORDER IS THE PINNED ID, not the file: `u_torfla1_N` is the N-th note the generator dealt, by
  frequency; the file's own order cannot be the input, because after the first run the file IS this
  script's output. A card the record inserts has a number above 500 and no place by frequency: every one
  is named in the head or in a set below, and one that is not fails the run.

  THE RULES.
  · TORFL A1 has a HEAD written by hand (`HEAD`): the courtesies, a first exchange, the personal pronouns,
    the verbs a first sentence needs, the question words, zero to ten, the commonest function words, and
    then the common words the frequency fill had turned away (`extra.py`). A judgement, not a measurement.
  · THE CLOSED SETS ARE DEALT TOGETHER (`SETS`), each in its own order and each PLACED at a note number
    (`at`): the days of the week, the numbers above ten, the colours, the months and the seasons.
  · LOOK-ALIKES ARE KEPT FORTY NOTES APART: two notes that name each other in a `not X` hint or share
    their first English gloss (идти and ходить, ехать and ездить, здесь and тут). The later is moved down.
    A pair inside one set, or both in the head, is left; `--report` lists any pair that is closer.
  · Everything else keeps the base order.
  · THE PHRASES are tiered by the lowest deck whose headwords and listed forms spell every word of the
    phrase — A1 first, then A2, B1, B2, C1 and C2 — and keep the base order (how often Tatoeba has the
    phrase) inside a tier. A phrase no deck spells comes last.
  · A2 TO C2 ARE NOT RE-ORDERED: they stay in the order of their pinned numbers.

  IT HOLDS THE DESCRIPTIONS TO THE ORDER: every `note N` a `descSub` of the record states for a set must
  be where that set begins, and the head's length the one stated; a stale figure fails the run.

  Never as a side effect: re-run it when the head, the sets or the record's inserts change, then
  `russian-fix.js`, then `build-russian-sounds.js`, then `.claude/build-lang-decks.js`.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const ORDER_FILE = path.join(__dirname, "russian-order.json"), IDS_FILE = path.join(__dirname, "russian-ids.json");
const FIXES = path.join(__dirname, "russian-fixes.json");
const REPORT = process.argv.includes("--report");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8")), REC = JSON.parse(fs.readFileSync(FIXES, "utf8"));
const decks = new Map();
for (const f of fs.readdirSync(DIR).filter((x) => /Russian/.test(x) && /\.folio-deck\.json$/.test(x))) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  if (d.meta.types.torfl) decks.set(d.meta.id, d);
}
const SHELF = ["torfla1", "torfla2", "torflb1", "torflb2", "torflc1", "torflc2"];
const bare = (s) => String(s).replace(/[́̀]/g, ""), fold = (s) => bare(s).toLowerCase().replace(/ё/g, "е");
const toks = (s) => fold(s).match(/[а-я]+(?:-[а-я]+)*/g) || [];
const strip = (s) => String(s).replace(/<[^>]+>/g, " ");
const formsOf = (c) => new Set(toks(c.fields.Word).concat(toks(strip(c.fields.Russian + " " + c.fields.Forms + " " + c.fields.Table))));
const firstGloss = (c) => { const m = /<(?:div class="uc-gl"|li)>([\s\S]*?)<\/(?:div|li)>/.exec(c.fields.English); return m ? strip(m[1]).replace(/\s*\([^)]*\)/g, "").trim().toLowerCase() : ""; };
const hintOf = (c) => { const m = /<div class="uc-pos">[^<]*?, not ([^<]+)<\/div>/.exec(c.fields.English); return m ? m[1].split(/,\s*/).map((x) => bare(x).trim()) : []; };

/* ---------- TORFL A1 ---------- */
const HEAD = [
  // the courtesies
  "привет", "здравствуйте", "спасибо", "пожалуйста", "да",
  "нет", "здравствуй", "пока", "до свидания", "извинять, извинить",
  "доброе утро", "добрый день", "добрый вечер", "спокойной ночи", "большое спасибо",
  // a first exchange
  "как дела", "хорошо", "плохо", "меня зовут", "как вас зовут",
  "как тебя зовут", "очень приятно", "я", "ты", "вы",
  "он", "она", "оно", "мы", "они",
  "это", "не", "и", "быть", "что",
  "кто", "этот", "мой", "твой", "я не понимаю",
  "говорить, сказать", "русский", "английский", "вы говорите по-английски", "я не говорю по-русски",
  // the verbs a first sentence needs
  "знать", "хотеть", "мочь", "понимать, понять", "делать, сделать",
  "идти, пойти", "жить", "любить", "думать, подумать", "видеть, увидеть",
  // the question words
  "где", "куда", "откуда", "когда", "как",
  "почему", "сколько", "какой", "чей", "сколько это стоит",
  // zero to ten
  "ноль", "один", "два", "три", "четыре",
  "пять", "шесть", "семь", "восемь", "девять",
  "десять", "в", "на", "у", "с",
  // the commonest function words
  "к", "о", "из", "по", "за",
  "для", "без", "от", "до", "а",
  "но", "или", "наш", "ваш", "его",
  "её", "их", "свой", "тот", "весь",
  "так", "такой", "себя", "очень", "тоже",
  "здесь", "там", "сейчас", "ещё", "уже",
  "можно", "нужно", "конечно", "ладно", "не за что",
  "до встречи", "до завтра", "где туалет", "добро пожаловать", "приятного аппетита",
  // the common words the frequency fill had turned away
  "просто", "чем", "раз", "правда", "ну",
  "больше", "лучше", "парень", "возможно", "может быть",
  "жаль", "действительно", "раньше", "более", "быстро",
  "при",
];
const SETS = [
  { name: "the days of the week", at: 151, words: ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"] },
  { name: "the numbers above ten", at: 201, words: ["одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать",
    "девятнадцать", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто", "сто", "тысяча"] },
  { name: "the colours", at: 251, words: ["белый", "чёрный", "красный", "синий", "зелёный", "жёлтый"] },
  { name: "the months and the seasons", at: 301, words: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
    "зима", "весна", "лето", "осень"] },
];
const GAP = 40;

function orderA1(d) {
  const pin = PIN.torfla1, by = new Map(d.cards.map((c) => [c.fields.Word, c]));
  const named = new Set(HEAD);
  for (const h of HEAD) if (!by.has(h)) fail("the head names “" + h + "”, which TORFL A1 does not card");
  if (named.size !== HEAD.length) fail("the head names a word twice: " + HEAD.filter((h, i) => HEAD.indexOf(h) !== i).join(", "));
  const setOf = new Map();
  for (const s of SETS) for (const w of s.words) {
    if (!by.has(w)) fail(s.name + " names “" + w + "”, which TORFL A1 does not card");
    if (named.has(w) || setOf.has(w)) fail("“" + w + "” is placed twice"); setOf.set(w, s);
  }
  for (const e of (REC.insert || {}).torfla1 || []) if (!named.has(e.word) && !setOf.has(e.word)) fail("the insert “" + e.word + "” has no place: name it in HEAD or in a set");
  const rest = d.cards.map((c) => c.fields.Word).filter((w) => !named.has(w) && !setOf.has(w)).sort((a, b) => pin[a] - pin[b]);
  const list = HEAD.concat(rest);
  // look-alikes forty apart — BEFORE the sets are placed, so that placing them can only widen a gap
  const pairs = [], fg = new Map();
  for (const c of d.cards) { const g = firstGloss(c); if (g) (fg.get(g) || fg.set(g, []).get(g)).push(c.fields.Word); }
  for (const ws of fg.values()) for (let i = 0; i < ws.length; i++) for (let j = i + 1; j < ws.length; j++) pairs.push([ws[i], ws[j]]);
  for (const c of d.cards) for (const h of hintOf(c)) { const o = d.cards.find((x) => x.fields.Word === h || x.fields.Word.split(", ").includes(h)); if (o) pairs.push([c.fields.Word, o.fields.Word]); }
  const free = (w) => !named.has(w) && !setOf.has(w);
  const close = [];
  for (let pass = 0; pass < 4; pass++) for (const [a, b] of pairs) {
    const ia = list.indexOf(a), ib = list.indexOf(b), [lo, hi] = ia < ib ? [a, b] : [b, a];
    const il = Math.min(ia, ib), ih = Math.max(ia, ib);
    if (ih - il >= GAP || (setOf.get(a) && setOf.get(a) === setOf.get(b))) continue;
    if (!free(hi)) { if (pass === 3 && !close.some((x) => x[0] === lo && x[1] === hi)) close.push([lo, hi, ih - il]); continue; }
    // move the later one down, past the gap, never into a placed set
    list.splice(ih, 1);
    list.splice(Math.min(list.length, il + GAP), 0, hi);
  }
  for (const s of [...SETS].sort((a, b) => a.at - b.at)) {
    if (s.at - 1 < HEAD.length || s.at - 1 > list.length) fail(s.name + " cannot begin at note " + s.at);
    list.splice(s.at - 1, 0, ...s.words);
  }
  return { list, close };
}

/* ---------- the phrases ---------- */
function tierOf(c, cum) {
  const ws = toks(c.fields.Word);
  for (let i = 0; i < SHELF.length; i++) if (ws.every((w) => cum[i].has(w))) return i;
  return SHELF.length;
}
function orderPhrases(d) {
  const cum = []; let acc = new Set();
  for (const id of SHELF) { const x = decks.get(id); acc = new Set(acc); for (const c of x.cards) for (const f of formsOf(c)) acc.add(f); cum.push(acc); }
  const pin = PIN.ruphrase, tiers = new Array(SHELF.length + 1).fill(0);
  const rows = d.cards.map((c) => { const t = tierOf(c, cum); tiers[t]++; return [c.fields.Word, t, pin[c.fields.Word]]; });
  rows.sort((a, b) => a[1] - b[1] || a[2] - b[2]);
  return { list: rows.map((r) => r[0]), tiers };
}

/* ---------- measurements ---------- */
function measure(d, list) {
  const by = new Map(d.cards.map((c) => [c.fields.Word, c])), met = new Set();
  let tot = 0, hit = 0, sents = 0, whole = 0, h50 = [0, 0, 0, 0];
  list.forEach((w, i) => {
    const c = by.get(w); for (const f of formsOf(c)) met.add(f);
    for (const m of c.fields.Examples.matchAll(/<div class="uc-exz">([\s\S]*?)<\/div><div class="uc-exe">/g)) {
      const t = toks(strip(m[1])), k = t.filter((x) => met.has(x)).length;
      tot += t.length; hit += k; sents++; if (k === t.length) whole++;
      if (i < 50) { h50[0] += t.length; h50[1] += k; h50[2]++; if (k === t.length) h50[3]++; }
    }
  });
  return "words met on arrival " + (100 * hit / tot).toFixed(1) + "% · whole sentences " + whole + " of " + sents + " · first fifty notes " + (100 * h50[1] / h50[0]).toFixed(0) + "%, " + h50[3] + " of " + h50[2];
}

const out = { _: "russian-order.json — the order each Russian deck is dealt in, written by russian-order.js (its header has the rules) and applied by russian-fix.js. deck id → { why, order: [Word field, …] }, a full permutation of the deck's notes. May be edited by hand; a list that is not exactly the deck's headwords is refused." };
const a1 = decks.get("torfla1"), ph = decks.get("ruphrase");
const A = orderA1(a1), P = orderPhrases(ph);
out.torfla1 = { why: "A head of " + HEAD.length + " notes written by hand (the courtesies, a first exchange, the pronouns, ten verbs, the question words, zero to ten, the commonest function words, then the common words the frequency fill had turned away); the closed sets together, each placed at a note number (" + SETS.map((s) => s.name + " " + s.at).join(", ") + "); look-alikes " + GAP + " notes apart; everything else by its pinned number, which is the generator's frequency order.", order: A.list };
out.ruphrase = { why: "Tiered by the lowest deck whose headwords and listed forms spell every word of the phrase (" + P.tiers.slice(0, 6).map((n, i) => SHELF[i].slice(5).toUpperCase() + " " + n).join(", ") + "; " + P.tiers[6] + " that no deck spells, last); inside a tier the order of the pinned numbers, which is how often Tatoeba has the phrase.", order: P.list };

/* the figures a description states */
const descA1 = (((REC.decks || {}).torfla1 || {}).descSub || []).map((p) => p[1]).join(" ");
if (descA1) {
  for (const s of SETS) if (!descA1.includes("note " + s.at)) fail("the A1 description does not say that " + s.name + " begin at note " + s.at);
  if (!descA1.includes(HEAD.length + " ")) fail("the A1 description does not state the head's " + HEAD.length + " notes");
}
const descPh = (((REC.decks || {}).ruphrase || {}).descSub || []).map((p) => p[1]).join(" ");
if (descPh) P.tiers.forEach((n, i) => { if (!descPh.includes(String(n))) fail("the phrases description does not state the " + n + " of tier " + (SHELF[i] || "none")); });

if (REPORT) {
  const day = (w) => Math.ceil((A.list.indexOf(w) + 1) / 5);
  console.log("TORFL A1 — " + A.list.length + " notes, " + Math.ceil(A.list.length / 5) + " days at five words a day; head " + HEAD.length);
  console.log("  as shipped (pinned order, the notes it had): " + measure(a1, a1.cards.map((c) => c.fields.Word).filter((w) => PIN.torfla1[w] <= 500).sort((x, y) => PIN.torfla1[x] - PIN.torfla1[y])));
  console.log("  this order:                                  " + measure(a1, A.list));
  console.log("  days: " + ["привет", "спасибо", "да", "я", "быть", "мочь", "один", "десять", "в", "весь", "понедельник", "одиннадцать", "белый", "январь"].map((w) => w + " " + day(w)).join(", "));
  console.log("  look-alikes closer than " + GAP + " (left: in the head or a set): " + (A.close.map((x) => x[0] + " / " + x[1] + " (" + x[2] + ")").join("; ") || "none"));
  console.log("Phrases — tiers " + P.tiers.join(" / ") + "; first ten: " + P.list.slice(0, 10).join(" · "));
  process.exit(0);
}
const text = "{\n" + Object.keys(out).map((k) => JSON.stringify(k) + ": " + JSON.stringify(out[k])).join(",\n") + "\n}\n";
if (fs.existsSync(ORDER_FILE) && fs.readFileSync(ORDER_FILE, "utf8") === text) console.log("russian-order.json is unchanged");
else { fs.writeFileSync(ORDER_FILE, text); console.log("wrote russian-order.json — now run node .claude/decks/russian-fix.js"); }
