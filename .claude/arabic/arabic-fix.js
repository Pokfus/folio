#!/usr/bin/env node
"use strict";
/*
  arabic-fix.js — THE ONE WAY AN ARABIC DECK IS HAND-EDITED, ORDERED AND NUMBERED (Nov 2026, the Arabic
  beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/arabic/arabic-fix.js [--check] [--verbose]
    node .claude/arabic/arabic-fix.js --seed-ids      # write arabic-ids.json (refused once it exists)

  WHY IT EXISTS. `run.py` and `phrases.py` number a deck by POSITION (u_arabica1_1 … u_arabica1_N), and the
  Update press merges a reader's progress by id. A word here is ONE NOTE WITH TWO CARD TEMPLATES (Arabic →
  English is the note's id, English → Arabic is `<id>~2`), so a note that moves in the file took two
  schedules to another word. Until this pass nothing could move. Now every note id is pinned to its
  headword, the order is a record, and a card the generator has not got is a record too.

  THE ORDER OF A REBUILD:   python3 .claude/arabic/run.py --level <lv>  (every level, then phrases.py)   →
  node .claude/arabic/arabic-fix.js   →   node .claude/arabic/build-arabic-alphabet.js   →
  node .claude/build-lang-decks.js.   The generator's output is this file's INPUT: with the corpus pinned
  (`examples.TATOEBA_MAX`) a rebuild from a fresh fetch followed by this script leaves `git status` clean.

  WHICH DECKS. Every deck in `decks/` whose card type is `arabic` — by CARD TYPE, never by file name: the five
  levels and the phrases. The alphabet deck (card type `ar-abc`, written by build-arabic-alphabet.js) is not
  edited here and is still held to its pinned ids.

  THE FILE IS THE RECORD: `arabic-fixes.json`.

  `insert`  `{ <deck id>: [entry, …] }` — a note the deck's generator has not got. An entry carries `word`
      (the vowelled headword, the pin's key), `id` (the number in its note id, above every number the
      generator has dealt so a rebuild cannot mint it), a `why` that names where every part came from, and
      `fields`, the seven fields of the card. The fields are never typed: they are either
        · a card MOVED from another Arabic deck, copied byte for byte on the day of the move (`from` names
          the deck and headword; that deck's `dropDup` takes it out there and its old number goes to
          `_retired`), or
        · written by `python3 .claude/arabic/arabic_insert.py`, which reads the vowelled form, the
          romanisation, the gender and the plural from the English Wiktionary (kaikki.org, the generator's
          own cache), takes each sentence from Tatoeba by the id the entry names in `src`, and renders the
          card with build_deck.py's own functions.

  `notes`  `{ "<deck id>/<headword>": { fields: { <Field>: "<html>" }, why } }` — fields replaced on a card the
      deck already has. A note that matches nothing is an ERROR.

  `decks`  `{ <deck id>: { dropDup?, subtitle?, descSub? } }`.
      `dropDup` is `{ headword: "<lower deck id>/<its headword>" }`: DELETE this deck's card for an expression
      a deck lower on the shelf now carries. The claim is CHECKED — the named note must exist there — so this
      can never delete a word nothing else teaches. A card already gone is normal.
      `subtitle` is set outright. `descSub` is `[find, replace]` pairs over the description, each satisfied if
      its replacement already stands in the text or if it matched; one satisfied by neither is an error. To
      reword a replacement that has shipped, add a pair after it whose `find` is the old replacement.

  THE COUNTS IN A DESCRIPTION ARE RECOUNTED, not carried (`recount`): how many words, nouns with a plural,
  adjectives, verbs, cards with sentences, the phrases' three subdecks, and the days a deck takes at the
  default pace (ten new cards a day, both directions together: five notes a day).

  `arabic-order.json`  `{ <deck id>: { why, order: [headword, …] } }`, written by arabic-order.js (its header
      has the rules) and applied LAST: the notes are put in that order and nothing else about them moves. A
      list that is not exactly the deck's headwords is refused. A deck with no entry is put in the order of
      its pinned numbers, which is the order it shipped in.

  `arabic-ids.json`  `{ <deck id>: { <headword>: N } }` for the note id `u_<deck id>_N`, seeded on 2026-11-19
      from the seven decks as shipped (the alphabet's key is the letter). THE PIN IS APPLIED, NOT ONLY CHECKED:
      after a rebuild every note is given back the number its headword is pinned to. A note with no row
      takes its insert's `id`, or failing that the next free number, and gains a row (under `--check` that is
      a failure). A row is never deleted: a note this record removes (`dropDup`) moves to `_retired`, so its
      number is never dealt to another word. A pinned note that is missing for any other reason fails the run.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const FIXES = path.join(HERE, "arabic-fixes.json"), IDS_FILE = path.join(HERE, "arabic-ids.json");
const ORDER_FILE = path.join(HERE, "arabic-order.json");
const argv = process.argv.slice(2);
const CHECK = argv.includes("--check"), VERBOSE = argv.includes("--verbose"), SEED = argv.includes("--seed-ids");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const writePin = (pin) => fs.writeFileSync(IDS_FILE, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n");

/* THE ARABIC DECKS. The file name only narrows what is parsed (decks/ holds 180 MB); what makes a deck this
   record's is the `arabic` type its cards are written in. A file straight out of build_deck.py is not compact
   JSON, so "unchanged" is judged against the compact form of what was read. */
const ALL = fs.readdirSync(DIR).filter((x) => /^Arabic/.test(x) && /\.folio-deck\.json$/.test(x)).sort()
  .map((f) => { const text = fs.readFileSync(path.join(DIR, f), "utf8"); return { f, text, d: JSON.parse(text) }; });
const isArabic = (d) => !!(d.meta && d.meta.types && d.meta.types.arabic);
const isAbc = (d) => !!(d.meta && d.meta.types && d.meta.types["ar-abc"]);
const DECKS = ALL.filter((x) => isArabic(x.d));
const byId = new Map(DECKS.map((x) => [x.d.meta.id, x]));
const numOf = (c, id) => { const m = /^u_([a-z0-9]+)_(\d+)$/.exec(c.id); return m && m[1] === id ? Number(m[2]) : NaN; };
const abcKey = (c) => c.key || c.fields.Letter;

if (SEED) {
  if (fs.existsSync(IDS_FILE)) fail("arabic-ids.json exists — a pin is seeded once and never re-seeded");
  const out = { _: "arabic-ids.json — the number in each Arabic note's id, pinned to its note: <deck id> → <vowelled headword> (the alphabet deck: the row's key, a letter or a sign) → N, for the id u_<deck id>_N. A note of these decks is one note with two card templates, so both of a word's cards hang off this number (the second card is <id>~2). Seeded on 2026-11-19 from the seven decks as shipped, which run.py, phrases.py and alphabet.py had numbered by position, and APPLIED by arabic-fix.js and build-arabic-alphabet.js: a rebuilt deck is numbered back. NEVER delete or renumber a row — the Update press merges a reader's progress by id. A note the record removes moves to _retired; a new note takes the next free number; a rename renames the key." };
  for (const { d } of ALL) {
    const id = d.meta.id, pin = {};
    for (const c of d.cards) {
      const n = numOf(c, id), k = isAbc(d) ? abcKey(c) : c.fields.Word;
      if (!Number.isFinite(n)) fail(id + ": unexpected card id " + c.id);
      if (k in pin) fail(id + ": two notes share the key " + k);
      pin[k] = n;
    }
    out[id] = pin;
  }
  out._retired = {};
  writePin(out);
  console.log("seeded arabic-ids.json: " + ALL.map(({ d }) => d.meta.id + " " + d.cards.length).join(", "));
  process.exit(0);
}

if (!fs.existsSync(IDS_FILE)) fail("no arabic-ids.json — run --seed-ids first");
const PIN = readJson(IDS_FILE), PIN_BEFORE = JSON.stringify(PIN);
const REC = fs.existsSync(FIXES) ? readJson(FIXES) : {};
const ORD = fs.existsSync(ORDER_FILE) ? readJson(ORDER_FILE) : {};
const errors = [], said = [];
const FIELDS = ["Arabic", "Word", "Roman", "English", "Forms", "Table", "Examples"];
const findNote = (ref) => { const i = String(ref).indexOf("/"), x = byId.get(String(ref).slice(0, i)); return x && x.d.cards.find((c) => c.fields.Word === String(ref).slice(i + 1)); };
const posOf = (c) => (/class="uc-pos">([^<]*)</.exec(c.fields.English) || [])[1] || "";
const C = (n) => n.toLocaleString("en-US");

/* ---------- the counts a description states, by ar_level.py's and phrases.py's formulas ---------- */
const PACE = 5;   // notes a day: LIMIT_DEFAULTS.lang.newPerDay is ten cards, and a note is two cards
function recount(d) {
  const cards = d.cards, n = cards.length, m = d.meta;
  const ex = (c) => (c.fields.Examples.match(/uc-exi/g) || []).length;
  const withEx = cards.filter((c) => ex(c) > 0).length, ex3 = cards.filter((c) => ex(c) === 3).length;
  const sub = (re, to) => { m.desc = m.desc.replace(re, to); };
  if (cards.some((c) => c.sub)) {   // the phrases deck
    const by = (s) => cards.filter((c) => c.sub === s).length, p = by("Phrases"), i = by("Idioms"), v = by("Proverbs");
    m.subtitle = C(n) + " expressions · " + p + " everyday, " + i + " idioms, " + v + " proverbs · both directions";
    sub(/^[\d,]+ Arabic set phrases, idioms and proverbs of Modern Standard Arabic, in three subdecks: \d+ everyday phrases, \d+ idioms and \d+ proverbs/,
      C(n) + " Arabic set phrases, idioms and proverbs of Modern Standard Arabic, in three subdecks: " + p + " everyday phrases, " + i + " idioms and " + v + " proverbs");
    sub(/Real example sentences come with \d+ of the [\d,]+,/, "Real example sentences come with " + withEx + " of the " + C(n) + ",");
    // three subdecks are dealt side by side, so the deck lasts as long as its longest subdeck
    sub(/(the deck takes about )\d+( days)/, "$1" + Math.ceil(Math.max(p, i, v) / PACE) + "$2");
  } else {
    const nounPl = cards.filter((c) => posOf(c) === "noun" && c.fields.Forms.includes('uc-fl">plural')).length;
    const adjs = cards.filter((c) => posOf(c) === "adjective").length, verbs = cards.filter((c) => c.fields.Table).length;
    m.subtitle = m.subtitle.replace(/^[\d,]+(?= words\b)/, C(n));
    sub(/\b[\d,]+(?= words of Modern Standard Arabic — the written)/, C(n));
    sub(/\b\d+(?= of the nouns show their plural)/, String(nounPl));
    sub(/(the )\d+(?= adjectives show their feminine)/, "$1" + adjs);
    sub(/(the )\d+(?= verbs are named)/, "$1" + verbs);
    sub(/Real example sentences come with [\d,]+ of the [\d,]+ words, three apiece for [\d,]+/,
      "Real example sentences come with " + C(withEx) + " of the " + C(n) + " words, three apiece for " + C(ex3));
    sub(/(five words a day, this deck takes )\d+( days)/, "$1" + Math.ceil(n / PACE) + "$2");
  }
}

/* ---------- apply ---------- */
const SHELF = ["arabica1", "arabica2", "arabicb1", "arabicb2", "arabicc1", "arabicphrase"];
const order = SHELF.filter((id) => byId.has(id)).concat([...byId.keys()].filter((id) => !SHELF.includes(id)));
const noteFix = new Map(), seenNote = new Set();
for (const [k, fix] of Object.entries(REC.notes || {})) {
  const i = k.indexOf("/"), id = k.slice(0, i);
  if (!byId.has(id)) { errors.push(k + ": no arabic deck has the id " + id); continue; }
  (noteFix.get(id) || noteFix.set(id, []).get(id)).push([k.slice(i + 1), fix, k]);
}
for (const id of Object.keys(REC.insert || {})) if (!byId.has(id)) errors.push("insert: no arabic deck has the id " + id);
for (const id of Object.keys(REC.decks || {})) if (!byId.has(id)) errors.push("decks: no arabic deck has the id " + id);

for (const id of order) {
  const { d } = byId.get(id), dm = (REC.decks || {})[id] || {};
  // 1. inserts, so that a higher deck's dropDup can see what this one now carries
  for (const e of (REC.insert || {})[id] || []) {
    const key = id + "/" + e.word + " (insert)";
    if (!e.word || !Number.isInteger(e.id) || !e.why || !e.fields) { errors.push(key + ": an insert needs word, id, why and fields"); continue; }
    for (const f of FIELDS) if (typeof e.fields[f] !== "string") errors.push(key + ": fields lacks " + f);
    if (e.fields.Word !== e.word) errors.push(key + ": fields.Word is " + e.fields.Word);
    if (!e.fields.English) errors.push(key + ": no meaning");
    if (e.fields.Examples && !e.from && !(e.src && e.src.length)) errors.push(key + ": sentences with no Tatoeba ids in src");
    const cid = "u_" + id + "_" + e.id;
    let card = d.cards.find((c) => c.fields.Word === e.word);
    if (card && card.id !== cid && numOf(card, id) !== (PIN[id] || {})[e.word]) { errors.push(key + ": the deck already cards that headword as " + card.id); continue; }
    if (!card) { card = { sub: e.sub || "", fields: {}, id: cid, type: "arabic" }; d.cards.push(card); }
    card.fields = {}; for (const f of FIELDS) card.fields[f] = e.fields[f];
    card.sub = e.sub || "";
  }
  // 2. cards a lower deck carries
  const lost = new Set();
  for (const [head, by] of Object.entries(dm.dropDup || {})) {
    const i = String(by).indexOf("/"), lower = String(by).slice(0, i);
    if (!byId.has(lower) || order.indexOf(lower) >= order.indexOf(id)) { errors.push(id + " → dropDup " + head + ": " + lower + " is not a lower deck"); continue; }
    if (!findNote(by)) { errors.push(id + " → dropDup " + head + ": no note " + by); continue; }
    lost.add(head);
    const before = d.cards.length;
    d.cards = d.cards.filter((c) => c.fields.Word !== head);
    if (before === d.cards.length && VERBOSE) said.push(id + " → dropDup " + head + ": already gone");
  }
  // 3. fields replaced on a card the deck already has
  for (const [head, fix, key] of noteFix.get(id) || []) {
    const card = d.cards.find((c) => c.fields.Word === head);
    if (!card) { errors.push(key + ": no note carries that headword"); continue; }
    if (!fix.why) errors.push(key + ": no why");
    seenNote.add(key);
    for (const [f, v] of Object.entries(fix.fields || {})) {
      if (!FIELDS.includes(f) || f === "Word" || typeof v !== "string") { errors.push(key + ": cannot set the field " + f); continue; }
      card.fields[f] = v;
    }
  }
  // 4. the deck's own words about itself
  if (dm.subtitle !== undefined) d.meta.subtitle = dm.subtitle;
  for (const [find, to] of dm.descSub || []) {
    if (d.meta.desc.includes(to)) continue;   // first, since a replacement may begin with the text it replaces
    if (d.meta.desc.includes(find)) d.meta.desc = d.meta.desc.split(find).join(to);
    else errors.push(id + " → descSub: neither “" + find.slice(0, 60) + "…” nor its replacement is in the description");
  }
  recount(d);
  // 5. the pinned ids
  const pin = PIN[id] || (PIN[id] = {}), ret = (PIN._retired = PIN._retired || {}), retired = ret[id] || {};
  const have = new Set(d.cards.map((c) => c.fields.Word));
  for (const head of Object.keys(pin)) {
    if (have.has(head)) continue;
    if (lost.has(head)) { (ret[id] = retired)[head] = pin[head]; delete pin[head]; }
    else errors.push(id + ": the pinned note “" + head + "” (" + pin[head] + ") is not in the deck and no record removes it");
  }
  const used = new Set(Object.values(pin).concat(Object.values(retired)));
  const insId = new Map(((REC.insert || {})[id] || []).map((e) => [e.word, e.id]));
  const heads = d.cards.map((c) => c.fields.Word);
  if (new Set(heads).size !== heads.length) errors.push(id + ": two notes share a headword (" + heads.filter((h, i) => heads.indexOf(h) !== i).slice(0, 4).join(", ") + ")");
  for (const c of d.cards) {
    const head = c.fields.Word;
    if (!(head in pin)) {
      let n = insId.get(head);
      if (n === undefined) { n = Math.max(0, ...used) + 1; if (VERBOSE || CHECK) said.push(id + ": “" + head + "” was not pinned — it takes " + n); }
      else if (used.has(n)) { errors.push(id + ": the insert “" + head + "” asks for the number " + n + ", which is taken"); continue; }
      pin[head] = n; used.add(n);
    }
    c.id = "u_" + id + "_" + pin[head];
  }
  const ids = d.cards.map((c) => c.id);
  if (new Set(ids).size !== ids.length) errors.push(id + ": two notes share an id");
  // 6. the order, last: the record's, else the pinned numbers (the order the deck shipped in)
  const byHead = new Map(d.cards.map((c) => [c.fields.Word, c]));
  if (ORD[id]) {
    const list = ORD[id].order || [];
    const extra = list.filter((h) => !byHead.has(h)), lack = [...byHead.keys()].filter((h) => !list.includes(h));
    if (extra.length || lack.length || new Set(list).size !== list.length)
      errors.push(id + ": arabic-order.json is not exactly the deck's headwords (not in the deck: " + (extra.slice(0, 5).join(", ") || "none")
        + "; not in the list: " + (lack.slice(0, 5).join(", ") || "none") + ") — run arabic-order.js");
    else d.cards = list.map((h) => byHead.get(h));
  } else {
    d.cards = d.cards.map((c, i) => [c, i]).sort((a, b) => pin[a[0].fields.Word] - pin[b[0].fields.Word] || a[1] - b[1]).map((x) => x[0]);
  }
}
for (const [, list] of noteFix) for (const [, , key] of list) if (!seenNote.has(key) && !errors.some((e) => e.startsWith(key))) errors.push(key + ": not applied");

/* ---------- the alphabet deck (card type ar-abc) is held to its pinned ids and nothing else ---------- */
for (const { f, d } of ALL) {
  if (isArabic(d)) continue;
  const id = d.meta.id, pin = PIN[id];
  if (!pin) { errors.push(f + ": no rows in arabic-ids.json for " + id); continue; }
  for (const c of d.cards) if (c.id !== "u_" + id + "_" + pin[abcKey(c)]) errors.push(f + ": " + c.id + " is not the id its key “" + abcKey(c) + "” is pinned to");
}

if (errors.length) { errors.forEach((e) => console.error("ERROR " + e)); process.exit(1); }
let changed = 0;
for (const { f, text, d } of DECKS) {
  const out = JSON.stringify(d);
  if (out === text) continue;
  changed++;
  console.log((CHECK ? "WOULD CHANGE " : "wrote ") + f + "  " + JSON.parse(text).cards.length + " → " + d.cards.length + " notes");
  if (!CHECK) fs.writeFileSync(path.join(DIR, f), out);
}
const pinChanged = JSON.stringify(PIN) !== PIN_BEFORE;
if (pinChanged) { console.log(CHECK ? "arabic-ids.json WOULD CHANGE" : "arabic-ids.json: rows written"); if (!CHECK) writePin(PIN); }
said.forEach((s) => console.log("  " + s));
const nIns = Object.values(REC.insert || {}).reduce((a, b) => a + b.length, 0);
console.log(nIns + " inserts, " + Object.keys(REC.notes || {}).length + " note fixes, " + Object.keys(ORD).filter((k) => k !== "_").length + " orders, "
  + Object.keys(PIN).filter((k) => !k.startsWith("_")).reduce((a, k) => a + Object.keys(PIN[k]).length, 0) + " pinned ids, "
  + Object.values(PIN._retired || {}).reduce((a, b) => a + Object.keys(b).length, 0) + " retired");
if (changed || pinChanged) {
  if (CHECK) { console.log("\nFAIL  the Arabic decks are out of step with the record — run node .claude/arabic/arabic-fix.js"); process.exit(1); }
  console.log("now run node .claude/arabic/build-arabic-alphabet.js and node .claude/build-lang-decks.js");
} else console.log("all Arabic decks match the record, the order and the pinned ids");
