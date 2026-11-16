#!/usr/bin/env node
"use strict";
/*
  spanish-order.js — THE ORDER THE SPANISH DECKS ARE DEALT IN (Nov 2026, the beginner pass). Standalone
  Node helper, zero deps. Not part of the site.

    node .claude/decks/spanish-order.js              # recompute and write spanish-order.json
    node .claude/decks/spanish-order.js --seed-ids   # write spanish-ids.json (refused once it exists)
    node .claude/decks/spanish-order.js --report     # print each order's head and its measurements, write nothing

  WHY IT EXISTS. The app deals a deck in file order (its cards carry no difficulty rating), and DELE A1's
  file order was a subtitle frequency list's. Measured on 2026-11-16 (docs/lang-decks.md, "The Spanish
  beginner pass"): day one was de, que, no, the articles and lo; one to ten ran from note 51 to note 309,
  the days of the week from 356 to 440, the months from 425 to 466; querer was note 339 and gustar 448,
  because the list counts the infinitive and not quiero or gusta. Over the first fifty notes 42% of the
  words in a card's example sentences had been met when the card arrived, and 1 sentence of 152 could be
  read whole.

  IT WRITES A RECORD, AND `spanish-fix.js` APPLIES IT. `spanish-order.json` is `{ <deck id>: { why, order:
  [headword, …] } }`, a full permutation of the deck's notes. The applier moves each note with its id and
  refuses a list that is not exactly the deck's headwords. The record is the authority and may be edited
  by hand; this script is how it was computed and how it is recomputed on purpose.

  THE BASE ORDER IS THE PINNED ID, not the file. The generator numbers a deck's cards by frequency, so
  `u_delea1_N` is the N-th commonest word; the file's own order cannot be the input, because after the
  first run the file IS this script's output. A card the record inserts (`spanish-fixes.json`, `insert`)
  stands after the headword its entry names. So the same pin and the same record give the same order.

  THE RULES.
  · DELE A1 has a HEAD written by hand (`HEAD` below): the courtesies, the words of a first exchange, the
    subject pronouns, eight verbs, the question words, zero to ten, and a handful of function words. It
    is a judgement, not a measurement, and it is the only one here.
  · THE CLOSED SETS ARE DEALT TOGETHER (`SETS`): the numbers above ten, the ordinals, the days, the
    months, the seasons, the compass points, left and right. A set stands where its earliest member
    stood by frequency (the ordinals after primero, which stays where it was), in its own order.
  · LOOK-ALIKES ARE KEPT FORTY NOTES APART: two notes that name each other in a `not X` hint, that share
    their first English gloss, or whose headwords differ only by a written accent (qué / que, sí / si,
    cómo / como). The later of the two is moved down. A pair inside one closed set or both in the head is
    left (the head is laid out by hand to respect it; `--report` lists any pair that is closer).
  · Everything else keeps the base order.
  · THE PHRASES are tiered by the lowest DELE level whose headwords and listed forms (plurals, feminines,
    the conjugation tables) spell every word of the phrase — A1 first — and keep the base order (how
    often Tatoeba has the phrase) inside a tier. A phrase no level spells comes last.
  · DELE A2 to C2 are NOT re-ordered: by the same measurement 86% to 92% of a card's example words have
    been met on arrival. They have no entry in the record and keep the order they have.

  Never as a side effect: re-run it when the head, the sets or the record's inserts change, then
  `spanish-fix.js`, then `.claude/build-lang-decks.js`.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const ORDER_FILE = path.join(__dirname, "spanish-order.json"), IDS_FILE = path.join(__dirname, "spanish-ids.json");
const FIXES = path.join(__dirname, "spanish-fixes.json");
const argv = process.argv.slice(2);
const SEED = argv.includes("--seed-ids"), REPORT = argv.includes("--report");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };

const decks = {};
for (const f of fs.readdirSync(DIR).filter((x) => /Spanish/.test(x) && /\.folio-deck\.json$/.test(x)).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  if (d.meta && d.meta.types && d.meta.types.dele) decks[d.meta.id] = d;
}
const LEVELS = ["delea1", "delea2", "deleb1", "deleb2", "delec1", "delec2"];
for (const id of LEVELS.concat("esphrases")) if (!decks[id]) fail("no deck " + id + " in decks/");

if (SEED) {
  if (fs.existsSync(IDS_FILE)) fail("spanish-ids.json exists — a pin is seeded once and never re-seeded");
  const out = { _: "spanish-ids.json — the number in each Spanish card's id, pinned to its note: <deck id> → <headword> (a sounds-deck row's key) → N, for the id u_<deck id>_N. Seeded from the decks as shipped on 2026-11-16 by spanish-order.js --seed-ids. Never delete or renumber a row: the Update press merges a reader's progress by id. A new note takes the next free number; a note the record removes moves to _retired, so its number is never dealt again. spanish-fix.js APPLIES this file (a rebuilt deck is renumbered back to it) and --check asserts every deck agrees with it." };
  for (const id of Object.keys(decks)) {
    const pin = {};
    for (const c of decks[id].cards) {
      const m = /^u_[a-z0-9]+_(\d+)$/.exec(c.id), k = c.fields.Spanish;
      if (!m || c.id !== "u_" + id + "_" + m[1]) fail(id + ": unexpected card id " + c.id);
      if (k in pin) fail(id + ": two notes share the headword " + k);
      pin[k] = Number(m[1]);
    }
    out[id] = pin;
  }
  out._retired = {};
  fs.writeFileSync(IDS_FILE, "{\n" + Object.keys(out).map((k) => JSON.stringify(k) + ":" + JSON.stringify(out[k])).join(",\n") + "\n}\n");
  console.log("seeded spanish-ids.json: " + Object.keys(decks).map((id) => id + " " + decks[id].cards.length).join(", "));
  process.exit(0);
}

if (!fs.existsSync(IDS_FILE)) fail("no spanish-ids.json — run --seed-ids first");
const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8"));
const REC = JSON.parse(fs.readFileSync(FIXES, "utf8"));

/* ---------- reading a card ---------- */
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const toks = (s) => String(s).toLowerCase().match(/[a-záéíóúüñ]+/g) || [];
const sensesOf = (c) => String(c.fields.English).split('<div class="uc-sense">').slice(1).map((p) => {
  const pos = strip((/<div class="uc-pos">([\s\S]*?)<\/div>/.exec(p) || ["", ""])[1]);
  const li = [...p.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => strip(m[1]));
  const one = /<div class="uc-gl">([\s\S]*?)<\/div>/.exec(p);
  return [pos, li.length ? li : one ? [strip(one[1])] : []];
});
const firstGloss = (c) => { const s = sensesOf(c)[0]; return s && s[1][0] ? s[1][0].toLowerCase() : ""; };
const examplesOf = (c) => [...String(c.fields.Examples).matchAll(/<div class="uc-exz">([\s\S]*?)<\/div>/g)].map((m) => strip(m[1]));
/* every written form a card shows: the headword, its Forms values, every cell of its conjugation */
function formsOf(c) {
  const out = new Set(), add = (s) => toks(s).forEach((t) => out.add(t));
  add(c.fields.Spanish); add(c.fields.Word);
  for (const m of String(c.fields.Forms).matchAll(/<span class="uc-fl">[^<]*<\/span>([^<]*)/g)) add(strip(m[1]));
  for (const m of String(c.fields.Conjugation).matchAll(/<span class="uc-cj-f">([\s\S]*?)<\/span><\/div>/g)) add(strip(m[1]));
  for (const m of String(c.fields.Conjugation).matchAll(/<span class="uc-cj-nfi"><i>[^<]*<\/i><b>([\s\S]*?)<\/b>/g)) add(strip(m[1]));
  return out;
}

/* ---------- the base order: the pinned number, an inserted card after the headword it names ---------- */
function baseOrder(id) {
  const pin = PIN[id] || fail("no pin for " + id), heads = decks[id].cards.map((c) => c.fields.Spanish);
  const ins = new Map(((REC.insert || {})[id] || []).map((x) => [x.spanish, x.after]));
  const lack = heads.filter((h) => !(h in pin));
  if (lack.length) fail(id + ": not pinned — run spanish-fix.js first: " + lack.slice(0, 6).join(", "));
  const out = heads.filter((h) => !ins.has(h)).sort((a, b) => pin[a] - pin[b]);
  // inserts in the order the record lists them, so one may name another
  for (const x of (REC.insert || {})[id] || []) {
    if (!heads.includes(x.spanish)) continue;
    const at = out.indexOf(x.after);
    if (at < 0) fail(id + ": insert " + x.spanish + " names " + x.after + ", which is not in the deck");
    out.splice(at + 1, 0, x.spanish);
  }
  return out;
}

/* ---------- DELE A1 ---------- */
const HEAD = [
  // the courtesies
  "hola", "adiós", "gracias", "de nada", "por favor", "perdón", "lo siento",
  "buenos días", "buenas tardes", "buenas noches", "hasta luego", "sí", "no",
  // a first exchange: yo soy …, ¿cómo te llamas?, ¿qué es?, muy bien
  "yo", "ser", "tú", "llamarse", "cómo", "qué", "y", "bien", "muy", "el, la, un, una", "de", "a",
  // the other subject pronouns
  "él", "ella", "usted", "nosotros", "vosotros", "ellos, ellas", "ustedes",
  // eight verbs
  "tener", "ir", "hacer", "querer", "poder", "gustar", "hablar", "vivir",
  // the question words
  "quién", "dónde", "cuándo", "cuánto", "cuál", "porque",
  // zero to ten
  "cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez",
  // function words, and estar forty notes after ser
  "en", "con", "pero", "o", "mi", "también", "más", "aquí", "estar",
];
const SETS = [
  { name: "the numbers above ten", of: ["once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
    "veinte", "veintiuno", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa", "cien", "ciento", "mil", "el millón"] },
  { name: "the ordinals after the first", after: "primero, primera", of: ["segundo, segunda", "tercero, tercera", "cuarto, cuarta", "quinto, quinta",
    "sexto, sexta", "séptimo, séptima", "octavo, octava", "noveno, novena", "décimo, décima"] },
  { name: "the days of the week", of: ["el lunes", "el martes", "el miércoles", "el jueves", "el viernes", "el sábado", "el domingo"] },
  { name: "the months", of: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"] },
  { name: "the seasons", of: ["la primavera", "el verano", "el otoño", "el invierno"] },
  { name: "the compass points", of: ["el norte", "el sur", "el oeste"] },
  { name: "left and right", of: ["la izquierda", "la derecha"] },
];
const APART = 40;
const noAccent = (s) => s.normalize("NFD").replace(/[́]/g, "").normalize("NFC");

function lookAlikes(id) {
  const cards = decks[id].cards, pairs = new Map(), add = (a, b, why) => { if (a !== b) pairs.set([a, b].sort().join("\u0001"), why); };
  const heads = new Set(cards.map((c) => c.fields.Spanish));
  for (const [k, other] of Object.entries(REC.hints || {})) {
    const i = k.indexOf("/");
    if (k.slice(0, i) === id && heads.has(k.slice(i + 1)) && heads.has(other)) add(k.slice(i + 1), other, "a `not X` hint");
  }
  const group = (key, why) => {
    const g = new Map();
    for (const c of cards) { const k = key(c); if (k) (g.get(k) || g.set(k, []).get(k)).push(c.fields.Spanish); }
    for (const v of g.values()) for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) add(v[i], v[j], why);
  };
  group(firstGloss, "the same first gloss");
  group((c) => noAccent(c.fields.Spanish.toLowerCase()), "the same letters but for an accent");
  return [...pairs.entries()].map(([k, why]) => k.split("\u0001").concat(why));
}

function orderA1() {
  const id = "delea1", base = baseOrder(id), have = new Set(base);
  for (const h of HEAD) if (!have.has(h)) fail("the head names " + h + ", which DELE A1 does not card");
  if (new Set(HEAD).size !== HEAD.length) fail("the head names a note twice");
  const inHead = new Set(HEAD), setOf = new Map();
  for (const s of SETS) for (const h of s.of) {
    if (!have.has(h)) fail(s.name + " names " + h + ", which DELE A1 does not card");
    if (inHead.has(h)) fail(s.name + ": " + h + " is in the head");
    setOf.set(h, s);
  }
  // the tail in base order, each set standing where its earliest member stood (or after the note it names)
  const tail = [], placed = new Set();
  const block = (s) => { if (!placed.has(s)) { placed.add(s); tail.push(...s.of); } };
  for (const h of base) {
    if (inHead.has(h)) continue;
    const s = setOf.get(h);
    if (!s) { tail.push(h); for (const t of SETS) if (t.after === h) block(t); }
    else if (!s.after) block(s);
  }
  for (const s of SETS) if (!placed.has(s)) fail(s.name + " was not placed: is " + s.after + " in the head?");
  let list = HEAD.concat(tail);
  // look-alikes forty apart: the later one moves down; a pair in one set, or both in the head, is left
  const pairs = lookAlikes(id), movable = (h) => !inHead.has(h) && !setOf.has(h);
  const moved = [];
  for (let pass = 0; pass < 20; pass++) {
    let changed = false;
    for (const [a, b] of pairs) {
      const i = list.indexOf(a), j = list.indexOf(b), lo = Math.min(i, j), hi = Math.max(i, j);
      if (hi - lo >= APART) continue;
      const late = list[hi];
      if (!movable(late)) continue;
      list.splice(hi, 1);
      list.splice(Math.min(list.length, lo + APART), 0, late);
      moved.push(late); changed = true;
    }
    if (!changed) break;
  }
  const close = pairs.map(([a, b, why]) => [a, b, why, Math.abs(list.indexOf(a) - list.indexOf(b))]).filter((x) => x[3] < APART);
  return { id, list, base, close, moved: [...new Set(moved)] };
}

/* ---------- the phrases: tiered by the level that can read them ---------- */
function orderPhrases() {
  const id = "esphrases", base = baseOrder(id), known = [], acc = new Set();
  for (const lv of LEVELS) { for (const c of decks[lv].cards) formsOf(c).forEach((f) => acc.add(f)); known.push(new Set(acc)); }
  const byHead = new Map(decks[id].cards.map((c) => [c.fields.Spanish, c]));
  const tier = (h) => { const t = toks(byHead.get(h).fields.Word); const k = known.findIndex((s) => t.every((x) => s.has(x))); return k < 0 ? LEVELS.length : k; };
  const tiers = base.map(tier), list = base.map((h, i) => [h, tiers[i], i]).sort((a, b) => a[1] - b[1] || a[2] - b[2]).map((x) => x[0]);
  const count = LEVELS.concat("none").map((_, k) => tiers.filter((t) => t === k).length);
  return { id, list, base, count };
}

/* ---------- how readable a card's sentences are when it arrives ---------- */
function arrival(id, list, upTo) {
  const byHead = new Map(decks[id].cards.map((c) => [c.fields.Spanish, c])), met = new Set();
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
const out = {
  _: "spanish-order.json — the order each Spanish deck is dealt in, as a full list of its headwords. Written by spanish-order.js (the rules are in its header), applied by spanish-fix.js, which moves a note with its id and never renumbers. May be edited by hand; a list that is not exactly the deck's headwords is refused. A deck with no entry keeps the order it has.",
  delea1: { why: "DELE A1 was dealt by a subtitle frequency list: day one was de, que, no, the articles and lo, one to ten ran from note 51 to 309, the days from 356 to 440, the months from 425 to 466, and querer was note 339. Now a head of " + HEAD.length + " notes written by hand (the courtesies, a first exchange, the subject pronouns, eight verbs, the question words, zero to ten, nine function words), then the frequency order, with each closed set dealt together and look-alikes forty notes apart.", order: A.list },
  esphrases: { why: "The phrases were dealt by how often Tatoeba has them. Now tiered by the lowest DELE level whose headwords and listed forms spell the whole phrase (" + P.count.map((n, k) => n + " " + (["A1", "A2", "B1", "B2", "C1", "C2", "none"][k])).join(", ") + "), the same count deciding the order inside a tier.", order: P.list },
};

if (REPORT || true) {
  console.log("DELE A1 — " + A.list.length + " notes, head " + HEAD.length);
  console.log("  first sixty: " + A.list.slice(0, 60).join(" · "));
  console.log("  after the head: " + A.list.slice(HEAD.length, HEAD.length + 30).join(" · "));
  for (const s of SETS) console.log("  " + s.name + ": notes " + span(A.list, s.of) + " (were " + span(A.base, s.of) + ")");
  console.log("  moved down to stand forty apart: " + (A.moved.join(", ") || "none"));
  console.log("  look-alike pairs still closer than " + APART + ": " + (A.close.map((x) => x[0] + " / " + x[1] + " (" + x[3] + ", " + x[2] + ")").join("; ") || "none"));
  for (const n of [50, A.list.length]) console.log("  example words met on arrival, first " + n + " notes: " + arrival("delea1", A.list, n) + "  (base order: " + arrival("delea1", A.base, n) + ")");
  console.log("Phrases — " + P.list.length + " notes; by level " + P.count.join(" / "));
  console.log("  first thirty: " + P.list.slice(0, 30).join(" · "));
}
if (!REPORT) {
  const text = "{\n" + Object.keys(out).map((k) => JSON.stringify(k) + ":" + JSON.stringify(out[k])).join(",\n") + "\n}\n";
  if (fs.existsSync(ORDER_FILE) && fs.readFileSync(ORDER_FILE, "utf8") === text) console.log("spanish-order.json unchanged");
  else { fs.writeFileSync(ORDER_FILE, text); console.log("wrote spanish-order.json"); }
}
