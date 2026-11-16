#!/usr/bin/env node
"use strict";
/*
  french-order.js — THE ORDER THE FRENCH DECKS ARE DEALT IN (Nov 2026, the French beginner pass —
  docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site. `spanish-order.js`'s model.

    node .claude/decks/french-order.js            # recompute and write french-order.json
    node .claude/decks/french-order.js --report   # print each order's head and its measurements, write nothing

  WHY IT EXISTS. The app deals a deck in file order, and DELF A1's file order was a subtitle frequency
  list's. Measured on 2026-11-16: day one was de, je, pas, the articles and que; bonjour was note 102 (day
  21 at five words a day), au revoir 349 (day 70); two to ten ran from note 67 to 292, the days of the week
  from 324 to 374, the months from 360 to 413; l'été was note 62 because the list counts été, the participle
  of être; pouvoir, vouloir and devoir were in A2 and mettre in B1.

  IT WRITES A RECORD, AND `french-fix.js` APPLIES IT. `french-order.json` is `{ <deck id>: { why, order:
  [headword, …] } }`, a full permutation of the deck's notes. The applier moves each note with its id and
  refuses a list that is not exactly the deck's headwords. The record may be edited by hand.

  THE BASE ORDER IS THE PINNED ID, not the file: the generator numbers a deck by frequency, so
  `u_delfa1_N` is roughly the N-th commonest word, and after the first run the file IS this script's output.
  A card the record inserts (`french-fixes.json`, `insert`) stands after the headword its entry names.

  THE RULES.
  · DELF A1 has a HEAD written by hand (`HEAD`): the courtesies, a first exchange, the subject pronouns,
    nine verbs, the negation and the question words, zero to ten, and the commonest function words. It is
    a judgement, not a measurement, and it is the only one here.
  · THE CLOSED SETS ARE DEALT TOGETHER (`SETS`), each in its own order, AFTER THE NOTE IT NAMES: the days
    after le jour, the numbers above ten after l'heure, the months after le mois, the seasons after
    l'année, the compass points after là-bas; the colours stand where the earliest of them stood. (Spanish
    left its days and months where their earliest member stood, days 81 and 93; here they are named a place.)
  · LOOK-ALIKES ARE KEPT FORTY NOTES APART: two notes that name each other in a `not X` hint, that share
    their first English gloss, or whose headwords differ only by an accent (ou / où, la / là). The later of
    the two is moved down. A pair inside one set or both in the head is left; `--report` lists any closer.
  · Everything else keeps the base order.
  · THE PHRASES are tiered by the lowest level whose headwords and listed forms (plurals, feminines, the
    conjugation tables) spell every word of the phrase — A1 first — and keep the base order (how often
    Tatoeba has the phrase) inside a tier. An elided word is read as the word it elides (j' as je, d' as
    de, qu' as que). A phrase no level spells comes last.
  · DELF A2 to DALF C2 are NOT re-ordered: 82% to 91% of a card's example words have been met on arrival.

  Never as a side effect: re-run it when the head, the sets or the record's inserts change, then
  `french-fix.js`, `build-french-sounds.js` and `.claude/build-lang-decks.js`.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const ORDER_FILE = path.join(__dirname, "french-order.json"), IDS_FILE = path.join(__dirname, "french-ids.json");
const FIXES = path.join(__dirname, "french-fixes.json");
const REPORT = process.argv.includes("--report");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };

const decks = {};
for (const f of fs.readdirSync(DIR).filter((x) => /French/.test(x) && /\.folio-deck\.json$/.test(x)).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  if (d.meta && d.meta.types && d.meta.types.delf) decks[d.meta.id] = d;
}
const LEVELS = ["delfa1", "delfa2", "delfb1", "delfb2", "dalfc1", "dalfc2"];
for (const id of LEVELS.concat("frphrases")) if (!decks[id]) fail("no deck " + id + " in decks/");
if (!fs.existsSync(IDS_FILE)) fail("no french-ids.json — run french-fix.js --seed-ids first");
const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8"));
const REC = JSON.parse(fs.readFileSync(FIXES, "utf8"));

/* ---------- reading a card ---------- */
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
/* a word of running French: an elided clitic is the word it elides, a hyphen joins a compound */
const ELIDED = { j: "je", l: "le", d: "de", n: "ne", m: "me", t: "te", s: "se", c: "ce", qu: "que", jusqu: "jusque", lorsqu: "lorsque", puisqu: "puisque" };
const toks = (s) => (String(s).toLowerCase().replace(/’/g, "'").match(/[a-zàâäçéèêëîïôöùûüÿœæ]+(?:-[a-zàâäçéèêëîïôöùûüÿœæ]+)*'?/g) || [])
  .reduce((out, t) => {   // aujourd'hui and quelqu'un are one word: only a clitic is cut at its apostrophe
    const prev = out[out.length - 1];
    if (prev && prev.endsWith("'")) out[out.length - 1] = prev + t; else out.push(t);
    if (t.endsWith("'") && ELIDED[t.slice(0, -1)] && !(prev && prev.endsWith("'"))) out[out.length - 1] = ELIDED[t.slice(0, -1)];
    return out;
  }, []);
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
  add(c.fields.Word);
  for (const m of String(c.fields.Forms).matchAll(/<span class="uc-fl">[^<]*<\/span>([^<]*)/g)) add(strip(m[1]));
  for (const m of String(c.fields.Forms).matchAll(/<div class="uc-gtc">([^<]*)<\/div>/g)) add(strip(m[1]));
  for (const m of String(c.fields.Conjugation).matchAll(/<span class="uc-cj-f">([\s\S]*?)<\/span><\/div>/g)) add(strip(m[1]));
  for (const m of String(c.fields.Conjugation).matchAll(/<span class="uc-cj-nfi"><i>[^<]*<\/i><b>([\s\S]*?)<\/b>/g)) add(strip(m[1]));
  return out;
}

/* ---------- the base order: the pinned number, an inserted card after the headword it names ---------- */
const insWord = (x) => x.note ? x.note.fields.Word : x.art ? (/^[aàâeéèêëiîïoôuùûüyœæh]/i.test(x.word) ? "l'" : x.art === "m" ? "le " : "la ") + x.word : x.word;
function baseOrder(id) {
  const pin = PIN[id] || fail("no pin for " + id), heads = decks[id].cards.map((c) => c.fields.Word);
  const list = (REC.insert || {})[id] || [], ins = new Set(list.map(insWord));
  const lack = heads.filter((h) => !(h in pin));
  if (lack.length) fail(id + ": not pinned — run french-fix.js first: " + lack.slice(0, 6).join(", "));
  const out = heads.filter((h) => !ins.has(h)).sort((a, b) => pin[a] - pin[b]);
  for (const x of list) {   // in the order the record lists them, so one may name another
    const w = insWord(x);
    if (!heads.includes(w)) continue;
    const at = out.indexOf(x.after);
    if (at < 0) fail(id + ": insert " + w + " names " + x.after + ", which is not in the deck");
    out.splice(at + 1, 0, w);
  }
  return out;
}

/* ---------- DELF A1 ---------- */
const HEAD = [
  // the courtesies
  "bonjour", "salut", "bonsoir", "au revoir", "merci", "de rien", "s'il vous plaît", "oui", "non",
  "pardon", "excusez-moi", "désolé", "d'accord", "à bientôt",
  // a first exchange: je m'appelle …, comment allez-vous ? ça va, très bien, et vous ? enchanté
  "je", "être", "je m'appelle", "tu", "vous", "comment", "ça va", "comment allez-vous", "comment ça va",
  "bien", "très", "et", "enchanté", "le monsieur", "la madame", "le, la", "un, une", "de", "à",
  // the other subject pronouns
  "il, elle", "on", "nous", "ils, elles",
  // nine verbs
  "avoir", "il y a", "aller", "faire", "pouvoir", "vouloir", "parler", "habiter", "aimer",
  // the negation and the question words
  "ne", "pas", "est-ce que", "qui", "que", "quoi", "où", "quand", "pourquoi", "parce que", "combien", "quel",
  // zero to ten (one is un, une, above)
  "zéro", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
  // function words, and the farewells
  "dans", "avec", "pour", "mais", "ou", "mon, ma", "aussi", "ici", "ça", "ce, cette", "en", "du", "au",
  "s'il te plaît", "aujourd'hui", "bonne journée", "bonne nuit", "à demain",
];
const SETS = [
  { name: "the days of the week", after: "le jour", of: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"] },
  { name: "the numbers above ten", after: "l'heure", of: ["onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf",
    "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix", "cent", "mille"] },
  { name: "the months", after: "le mois", of: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"] },
  { name: "the seasons", after: "l'année", of: ["le printemps", "l'été", "l'automne", "l'hiver"] },
  { name: "the compass points", after: "là-bas", of: ["le nord", "le sud", "l'est", "l'ouest"] },
  { name: "the colours", of: ["noir", "blanc", "rouge", "bleu", "vert", "jaune", "gris", "rose", "orange"] },
];
const APART = 40;
const noAccent = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC");

function lookAlikes(id) {
  const cards = decks[id].cards, pairs = new Map(), add = (a, b, why) => { if (a !== b) pairs.set([a, b].sort().join("\u0001"), why); };
  const heads = new Set(cards.map((c) => c.fields.Word));
  for (const [k, other] of Object.entries(REC.hints || {})) {
    const i = k.indexOf("/");
    if (k.slice(0, i) === id && heads.has(k.slice(i + 1)) && heads.has(other)) add(k.slice(i + 1), other, "a `not X` hint");
  }
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
  const id = "delfa1", base = baseOrder(id), have = new Set(base);
  for (const h of HEAD) if (!have.has(h)) fail("the head names " + h + ", which DELF A1 does not card");
  if (new Set(HEAD).size !== HEAD.length) fail("the head names a note twice");
  const inHead = new Set(HEAD), setOf = new Map();
  for (const s of SETS) for (const h of s.of) {
    if (!have.has(h)) fail(s.name + " names " + h + ", which DELF A1 does not card");
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
      let at = Math.min(list.length, lo + APART);
      while (at > 0 && at < list.length && setOf.has(list[at - 1]) && setOf.get(list[at - 1]) === setOf.get(list[at])) at++;   // never inside a set
      list.splice(at, 0, late);
      moved.push(late); changed = true;
    }
    if (!changed) break;
  }
  const close = pairs.map(([a, b, why]) => [a, b, why, Math.abs(list.indexOf(a) - list.indexOf(b))]).filter((x) => x[3] < APART);
  return { id, list, base, close, moved: [...new Set(moved)] };
}

/* ---------- the phrases: tiered by the level that can read them ---------- */
function orderPhrases() {
  const id = "frphrases", base = baseOrder(id), known = [], acc = new Set();
  for (const lv of LEVELS) { for (const c of decks[lv].cards) formsOf(c).forEach((f) => acc.add(f)); known.push(new Set(acc)); }
  const byHead = new Map(decks[id].cards.map((c) => [c.fields.Word, c]));
  /* a word a level spells: a form it lists, or one a rule gives (the decks do not list a plural or a
     feminine where French simply adds -s, -x, -e or -es), or the parts of an inversion (est-il, moment-là) */
  const spelled = (x, s) => s.has(x) || (x.includes("-") && x.split("-").every((y) => spelled(y, s))) ||
    ["es", "s", "x", "e"].some((e) => x.length > e.length + 1 && x.endsWith(e) && s.has(x.slice(0, -e.length)));
  const tier = (h) => { const t = toks(byHead.get(h).fields.Word); const k = known.findIndex((s) => t.every((x) => spelled(x, s))); return k < 0 ? LEVELS.length : k; };
  const tiers = base.map(tier), list = base.map((h, i) => [h, tiers[i], i]).sort((a, b) => a[1] - b[1] || a[2] - b[2]).map((x) => x[0]);
  const count = LEVELS.concat("none").map((_, k) => tiers.filter((t) => t === k).length);
  if (process.argv.includes("--unspelled")) base.forEach((h, i) => { if (tiers[i] === LEVELS.length) console.log("  no level spells: " + h + "  [" + toks(byHead.get(h).fields.Word).filter((x) => !spelled(x, acc)).join(", ") + "]"); });
  return { id, list, base, count };
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
const out = {
  _: "french-order.json — the order each French deck is dealt in, as a full list of its headwords. Written by french-order.js (the rules are in its header), applied by french-fix.js, which moves a note with its id and never renumbers. May be edited by hand; a list that is not exactly the deck's headwords is refused. A deck with no entry keeps the order it has.",
  delfa1: { why: "DELF A1 was dealt by a subtitle frequency list: day one was de, je, pas, the articles and que, bonjour was note 102 and au revoir 349, two to ten ran from note 67 to 292, the days from 324 to 374, the months from 360 to 413. Now a head of " + HEAD.length + " notes written by hand (the courtesies, a first exchange, the subject pronouns, nine verbs, the negation and the question words, zero to ten, the commonest function words), then the frequency order with each closed set together after the note that introduces it and look-alikes forty notes apart.", order: A.list },
  frphrases: { why: "The phrases were dealt by how often Tatoeba has them. Now tiered by the lowest level whose headwords and listed forms spell the whole phrase (" + P.count.map((n, k) => n + " " + (["A1", "A2", "B1", "B2", "C1", "C2", "none"][k])).join(", ") + "), the same count deciding the order inside a tier.", order: P.list },
};

console.log("DELF A1 — " + A.list.length + " notes, head " + HEAD.length);
console.log("  first sixty: " + A.list.slice(0, 60).join(" · "));
console.log("  after the head: " + A.list.slice(HEAD.length, HEAD.length + 30).join(" · "));
for (const s of SETS) console.log("  " + s.name + ": notes " + span(A.list, s.of) + " (were " + span(A.base, s.of) + ")");
console.log("  moved down to stand forty apart: " + (A.moved.join(", ") || "none"));
console.log("  look-alike pairs still closer than " + APART + ": " + (A.close.map((x) => x[0] + " / " + x[1] + " (" + x[3] + ", " + x[2] + ")").join("; ") || "none"));
for (const n of [50, A.list.length]) console.log("  example words met on arrival, first " + n + " notes: " + arrival("delfa1", A.list, n) + "  (base order: " + arrival("delfa1", A.base, n) + ")");
console.log("Phrases — " + P.list.length + " notes; by level " + P.count.join(" / "));
console.log("  first thirty: " + P.list.slice(0, 30).join(" · "));
if (!REPORT) {
  const text = "{\n" + Object.keys(out).map((k) => JSON.stringify(k) + ":" + JSON.stringify(out[k])).join(",\n") + "\n}\n";
  if (fs.existsSync(ORDER_FILE) && fs.readFileSync(ORDER_FILE, "utf8") === text) console.log("french-order.json unchanged");
  else { fs.writeFileSync(ORDER_FILE, text); console.log("wrote french-order.json"); }
}
