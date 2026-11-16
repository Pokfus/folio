#!/usr/bin/env node
"use strict";
/*
  portuguese-order.js — THE ORDER THE PORTUGUESE DECKS ARE DEALT IN (Nov 2026, the Portuguese beginner pass —
  docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site. `italian-order.js`'s model.

    node .claude/decks/portuguese-order.js              # recompute and write portuguese-order.json
    node .claude/decks/portuguese-order.js --report     # print each order's head and its measurements, write nothing

  WHY IT EXISTS. The app deals a deck in file order (its cards carry no difficulty rating), and CAPLE A1's
  file order was a subtitle frequency list's. Measured on 2026-11-16 on the deck as shipped: day one was
  não, de, um / uma, para and eu; no greeting was in the deck at all (olá and obrigado were the ninth and
  tenth cards of B2, day 400; bom dia was in the phrases, day 1,023); zero to ten ran from note 3 to note
  423, eleven to nineteen from 460 to 487; ser was note 22, estar 61, poder 135, haver 208, querer 209 and
  chamar-se 230, the list counting the infinitive and not quero. Over the first fifty notes 41% of the
  words in a card's example sentences had been met when the card arrived and 1 of the 148 sentences could
  be read whole.

  IT WRITES A RECORD, AND `portuguese-fix.js` APPLIES IT. `portuguese-order.json` is `{ <deck id>: { why,
  order: [headword, …] } }`, a full permutation of the deck's notes. The applier moves each note with its
  id and refuses a list that is not exactly the deck's headwords. The record is the authority and may be
  edited by hand; this script is how it was computed and how it is recomputed on purpose.

  THE BASE ORDER IS THE PINNED ID, not the file. The generator numbers a deck's cards by frequency, so
  `u_caplea1_N` is about the N-th commonest word of the level; the file's own order cannot be the input,
  because after the first run the file IS this script's output. A card the record inserts has a number
  above the level's and no place by frequency: every one of them is named in the head or in a set below,
  and one that is not fails the run rather than falling to the end of the deck.

  THE RULES.
  · CAPLE A1 has a HEAD written by hand (`HEAD` below): the courtesies, the words of a first exchange with
    the commonest function words, the subject pronouns, ten verbs, the question words, zero to ten, and a
    handful of function words. It is a judgement, not a measurement.
  · THE CLOSED SETS ARE DEALT TOGETHER (`SETS`), each in its own order. Three are PLACED BY HAND at a note
    number (`at`), because the level's frequency scattered their members to its end or lacked them: the
    days of the week (from note 121, day 25 at five words a day), the numbers above ten (from note 201,
    day 41) and the months and the seasons (from note 301, day 61). The ordinals stand where the earliest
    of them stood by frequency.
  · LOOK-ALIKES ARE KEPT FORTY NOTES APART: two notes that name each other in a `not X` hint, that share
    their first English gloss (lembrar-se / lembrar, tomar / tirar), or whose headwords differ only by a
    written accent (nós / nos). The later of the two is moved down. A pair inside one closed set, or both
    in the head, is left (`--report` lists any pair that is closer).
  · Everything else keeps the base order.
  · THE PHRASES KEEP THEIR TWO SUBDECKS (the app shows them as two decks of the language and deals them in
    parallel, a day apart; check-caple.js holds the deck to them), Expressions first in the file. Inside
    each, the notes are tiered by the lowest level whose headwords and listed forms (plurals, feminines,
    the forms a preposition takes with the article, the conjugation tables) spell every word of the
    phrase — A1 first, then A2 to C2 — and keep the base order (how often Tatoeba has the phrase) inside
    a tier. A phrase no level spells comes last.
  · CAPLE A2 to C2 ARE NOT RE-ORDERED: by the same measurement 77% to 88% of a card's example words have
    been met on arrival. They have no entry in the record and stay in the order of their pinned numbers.

  Never as a side effect: re-run it when the head, the sets or the record's inserts change, then
  `portuguese-fix.js`, then `build-portuguese-sounds.js`, then `.claude/build-lang-decks.js`.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const ORDER_FILE = path.join(__dirname, "portuguese-order.json"), IDS_FILE = path.join(__dirname, "portuguese-ids.json");
const FIXES = path.join(__dirname, "portuguese-fixes.json");
const REPORT = process.argv.includes("--report");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };

const decks = {};
for (const f of fs.readdirSync(DIR).filter((x) => /Portuguese/.test(x) && /\.folio-deck\.json$/.test(x)).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  if (d.meta && d.meta.types && d.meta.types.caple) decks[d.meta.id] = d;
}
const LEVELS = ["caplea1", "caplea2", "capleb1", "capleb2", "caplec1", "caplec2"];
const LEVEL_NAMES = ["A1", "A2", "B1", "B2", "C1", "C2"];
for (const id of LEVELS.concat("ptphrase")) if (!decks[id]) fail("no deck " + id + " in decks/");
if (!fs.existsSync(IDS_FILE)) fail("no portuguese-ids.json — run portuguese-fix.js --seed-ids first");
const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8"));
const REC = fs.existsSync(FIXES) ? JSON.parse(fs.readFileSync(FIXES, "utf8")) : {};

/* ---------- reading a card ---------- */
const strip = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
/* the words of a string: lower case; a hyphen ends a word (segunda-feira, chamo-me) */
const toks = (s) => (String(s).toLowerCase().match(/[a-zà-ÿ]+/g) || []);
const firstGloss = (c) => { const m = /<(?:div class="uc-gl"|li)>([\s\S]*?)<\/(?:div|li)>/.exec(c.fields.English); return m ? strip(m[1]).trim().toLowerCase() : ""; };
const hintOf = (c) => { const m = /<div class="uc-pos">[^<]*?, not ([^<]+)<\/div>/.exec(c.fields.English); return m ? strip(m[1]).replace(/' /g, "'").trim() : ""; };
const examplesOf = (c) => [...String(c.fields.Examples).matchAll(/<div class="uc-exz">([\s\S]*?)<\/div><div class="uc-exe">/g)].map((m) => strip(m[1]));
/* every written form a card shows: the headword, its Forms values, every cell of its conjugation */
function formsOf(c) {
  const out = new Set(), add = (s) => toks(s).forEach((t) => out.add(t));
  add(c.fields.Word);
  /* a Forms value up to its first colon or dash: what follows is an example or an English note (dele, dela — his, hers) */
  for (const m of String(c.fields.Forms).matchAll(/<span class="uc-fl">[^<]*<\/span>([^<]*)/g)) add(strip(m[1]).split(/:| — /)[0]);
  for (const m of String(c.fields.Conjugation).matchAll(/<span class="uc-cj-f">([\s\S]*?)<\/span><\/div>/g)) add(strip(m[1]));
  for (const m of String(c.fields.Conjugation).matchAll(/<span class="uc-cj-nfi"><i>[^<]*<\/i><b>([\s\S]*?)<\/b>/g)) add(strip(m[1]));
  return out;
}

/* ---------- the base order: the pinned number ---------- */
function baseOrder(id) {
  const pin = PIN[id] || fail("no pin for " + id), heads = decks[id].cards.map((c) => c.fields.Word);
  const lack = heads.filter((h) => !(h in pin));
  if (lack.length) fail(id + ": not pinned — run portuguese-fix.js first: " + lack.slice(0, 6).join(", "));
  return heads.slice().sort((a, b) => pin[a] - pin[b]);
}

/* ---------- CAPLE A1 ---------- */
const HEAD = [
  // the courtesies
  "olá", "bom dia", "boa tarde", "boa noite", "adeus", "até logo", "obrigado", "obrigada", "de nada", "por favor",
  "desculpar", "com licença", "sim", "não", "tudo bem", "muito prazer",
  // a first exchange: eu sou …, como te chamas?, chamo-me …, como estás?, bem, obrigado, e tu? — and the
  // commonest function words with it, since every sentence on these cards is built of them
  "eu", "ser", "tu", "chamar-se", "como", "estar", "bem", "muito", "e", "o, a", "um, uma", "de", "em", "a", "que",
  "com", "para", "por", "me", "mas", "ou",
  // the other subject pronouns
  "você", "ele, ela", "nós", "vocês", "eles, elas", "o senhor, a senhora",
  // ten verbs
  "ter", "ir", "fazer", "querer", "poder", "haver", "gostar", "falar", "saber", "dizer",
  // the other question words
  "quem", "onde", "quando", "quanto", "quantos", "qual", "porquê", "porque",
  // zero to ten (one is the card um, uma above)
  "zero", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez",
  // more function words
  "meu, minha", "também", "mais", "aqui", "este, esta", "isto", "se", "te",
];
const SETS = [
  { name: "the days of the week", at: 121, of: ["a segunda-feira", "a terça-feira", "a quarta-feira", "a quinta-feira", "a sexta-feira", "o sábado", "o domingo"] },
  { name: "the numbers above ten", at: 201, of: ["onze", "doze", "treze", "catorze", "quinze", "dezasseis", "dezassete", "dezoito", "dezanove",
    "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa", "cem", "mil", "o milhão"] },
  { name: "the months", at: 301, of: ["o janeiro", "o fevereiro", "o março", "o abril", "o maio", "o junho", "o julho", "o agosto", "o setembro", "o outubro", "o novembro", "o dezembro"] },
  { name: "the seasons", after: "the months", of: ["a primavera", "o verão", "o outono", "o inverno"] },
  { name: "the ordinals", of: ["primeiro, primeira", "segundo, segunda", "terceiro, terceira"] },
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
  const id = "caplea1", base = baseOrder(id), have = new Set(base);
  for (const h of HEAD) if (!have.has(h)) fail("the head names " + h + ", which CAPLE A1 does not card");
  if (new Set(HEAD).size !== HEAD.length) fail("the head names a note twice");
  const inHead = new Set(HEAD), setOf = new Map();
  for (const s of SETS) for (const h of s.of) {
    if (!have.has(h)) fail(s.name + " names " + h + ", which CAPLE A1 does not card");
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

/* ---------- the phrases: tiered by the level that can read them, inside each subdeck ---------- */
const SUBS = ["Expressions", "Proverbs"];
function orderPhrases() {
  const id = "ptphrase", base = baseOrder(id), known = [], acc = new Set();
  for (const lv of LEVELS) { for (const c of decks[lv].cards) formsOf(c).forEach((f) => acc.add(f)); known.push(new Set(acc)); }
  const byHead = new Map(decks[id].cards.map((c) => [c.fields.Word, c]));
  for (const c of decks[id].cards) if (!SUBS.includes(c.sub)) fail(id + ": " + c.fields.Word + " is in the subdeck “" + c.sub + "”");
  const tier = (h) => { const t = toks(byHead.get(h).fields.Word); const k = known.findIndex((s) => t.every((x) => s.has(x))); return k < 0 ? LEVELS.length : k; };
  const rows = base.map((h, i) => [h, SUBS.indexOf(byHead.get(h).sub), tier(h), i]);
  const list = rows.slice().sort((a, b) => a[1] - b[1] || a[2] - b[2] || a[3] - b[3]).map((x) => x[0]);
  const count = SUBS.map((_, s) => LEVELS.concat("none").map((_, k) => rows.filter((r) => r[1] === s && r[2] === k).length));
  const size = SUBS.map((_, s) => rows.filter((r) => r[1] === s).length);
  const lacking = new Map();   // the words no level spells, for --report
  for (const h of base) for (const x of toks(byHead.get(h).fields.Word)) if (!acc.has(x)) lacking.set(x, (lacking.get(x) || 0) + 1);
  return { id, list, base, count, size, lacking: [...lacking.entries()].sort((a, b) => b[1] - a[1]) };
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
const NUM = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
const out = {
  _: "portuguese-order.json — the order each Portuguese deck is dealt in, as a full list of its headwords. Written by portuguese-order.js (the rules are in its header), applied by portuguese-fix.js, which moves a note with its id and never changes one. It may be edited by hand: a list that is not exactly the deck's headwords is refused. A deck with no entry is dealt in the order of its pinned numbers.",
  caplea1: { why: "CAPLE A1 was dealt by a subtitle frequency list: day one was não, de, um / uma, para and eu, no greeting was in the deck, ser was note 22, estar 61, querer 209 and chamar-se 230, and eleven to nineteen ran from note 460 to 487. Now a head of " + HEAD.length + " notes written by hand (the courtesies, a first exchange, the subject pronouns, ten verbs, the question words, zero to ten, function words), then the frequency order with the closed sets together (the days from note " + pos(A.list, SETS[0].of[0]) + ", the numbers above ten from " + pos(A.list, SETS[1].of[0]) + ", the months and the seasons from " + pos(A.list, SETS[2].of[0]) + ") and look-alikes forty notes apart.", order: A.list },
  ptphrase: { why: "Each subdeck was dealt by how often Tatoeba has the phrase, the " + "ones it has not got alphabetically after them. Now, inside each subdeck, tiered by the lowest level whose headwords and listed forms spell the whole phrase (Expressions: " + P.count[0].map((n, k) => n + " " + (LEVEL_NAMES[k] || "no level")).join(", ") + "; Proverbs: " + P.count[1].map((n, k) => n + " " + (LEVEL_NAMES[k] || "no level")).join(", ") + "), in the same order inside a tier.", order: P.list },
};

/* THE FIGURES THE DESCRIPTIONS STATE ARE THE RECORD'S, TYPED BY HAND (portuguese-fixes.json, `descSub`), so they
   are held to this file's: an order that changes them fails here until the record says the new ones. */
const COURTESIES = HEAD.indexOf("eu");
const WANT = [
  ["caplea1", "The first " + HEAD.length + " cards are"],
  ["caplea1", "the days of the week from card " + pos(A.list, SETS[0].of[0]) + ", the numbers above ten from " + pos(A.list, SETS[1].of[0]) + ", the months and the seasons from " + pos(A.list, SETS[2].of[0])],
  ["caplea1", "the courtesies take " + NUM[day(COURTESIES)] + " days, the first " + HEAD.length + " cards " + NUM[day(HEAD.length)] + ","],
  ["caplea1", "the whole deck takes " + day(A.list.length) + " days"],
  ["ptphrase", "first the " + P.count[0][0] + " expressions spelled entirely with words and forms CAPLE A1 shows, then those that need A2 (" + P.count[0][1] + "), B1 (" + P.count[0][2] + "), B2 (" + P.count[0][3] + "), C1 (" + P.count[0][4] + ") and C2 (" + P.count[0][5] + "), and last the " + P.count[0][6] + " that use"],
  ["ptphrase", "of the proverbs " + P.count[1][0] + " are spelled with A1's words"],
  ["ptphrase", "the A1 step takes " + day(P.count[0][0]) + " days"],
];
if (!REPORT) for (const [id, text] of WANT) {
  const subs = (((REC.decks || {})[id] || {}).descSub || []).map((x) => x[1]).join(" ");
  if (!subs.includes(text)) fail("portuguese-fixes.json, decks." + id + ".descSub does not say “" + text + "” — the order has changed what the description states");
}
console.log("CAPLE A1 — " + A.list.length + " notes, head " + HEAD.length);
console.log("  first sixty: " + A.list.slice(0, 60).join(" · "));
console.log("  after the head: " + A.list.slice(HEAD.length, HEAD.length + 30).join(" · "));
for (const s of SETS) console.log("  " + s.name + ": notes " + span(A.list, s.of) + " (day " + day(pos(A.list, s.of[0])) + ")");
console.log("  moved down to stand forty apart: " + (A.moved.join(", ") || "none"));
console.log("  look-alike pairs still closer than " + APART + ": " + (A.close.map((x) => x[0] + " / " + x[1] + " (" + x[3] + ", " + x[2] + ")").join("; ") || "none"));
for (const n of [50, 100, 200, A.list.length]) console.log("  example words met on arrival, first " + n + " notes: " + arrival("caplea1", A.list, n) + "  (base order: " + arrival("caplea1", A.base, n) + ")");
console.log("Phrases — " + P.list.length + " notes; Expressions by level " + P.count[0].join(" / ") + "; Proverbs " + P.count[1].join(" / "));
console.log("  first thirty: " + P.list.slice(0, 30).join(" · "));
console.log("  words no level spells, commonest first: " + P.lacking.slice(0, 30).map((x) => x[0] + " " + x[1]).join(", "));
if (REPORT) console.log("  the descriptions must say:\n    " + WANT.map((w) => w[0] + ": " + w[1]).join("\n    "));
if (!REPORT) {
  const text = "{\n" + Object.keys(out).map((k) => JSON.stringify(k) + ":" + JSON.stringify(out[k])).join(",\n") + "\n}\n";
  if (fs.existsSync(ORDER_FILE) && fs.readFileSync(ORDER_FILE, "utf8") === text) console.log("portuguese-order.json unchanged");
  else { fs.writeFileSync(ORDER_FILE, text); console.log("wrote portuguese-order.json"); }
}
