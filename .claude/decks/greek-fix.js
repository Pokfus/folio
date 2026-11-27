#!/usr/bin/env node
"use strict";
/*
  greek-fix.js — THE ONE WAY A GREEK DECK IS HAND-EDITED, ORDERED AND NUMBERED (Nov 2026, the Greek beginner
  pass — docs/lang-decks.md, "The Greek beginner pass"). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/greek-fix.js [--check] [--verbose]
    node .claude/decks/greek-fix.js --seed-ids     # write greek-ids.json from the decks as they stand (refused once it exists)

  WHY IT EXISTS. The Greek decks ARE rebuilt by a generator (`.claude/greek/run.py`, `alphabet.py`), and a
  re-run is byte-identical (proved 2026-11-27 on a fresh fetch, before this pass and after it) — but the
  generator deals a level from a frequency list and numbers every card by its position, so a card added or
  re-ordered by hand had nowhere to be recorded and would have changed the id of every card after it. A
  reader's progress is keyed by card id. So: what the GENERATOR can do (a table it reads wrongly, a form it
  leaves out) is fixed in the generator, and what is a decision about ONE card or ONE order is here.

  THE ORDER OF A REBUILD:   python3 .claude/greek/run.py [--level a1]  →  python3 .claude/greek/alphabet.py  →
  python3 .claude/greek/inserts.py  (rebuilds the fields of the cards the record ADDS, with the generator's
  own code)  →  node .claude/decks/greek-fix.js  →  node .claude/decks/greek-order.js  →
  node .claude/decks/greek-fix.js  →  node .claude/build-lang-decks.js.

  WHICH DECKS. Every deck in `decks/` whose card type is `greek` or `el-abc` — by CARD TYPE, never by file
  name: the alphabet (with its reading rules, card type `el-read`) and A1.

  THREE FILES.

  `greek-fixes.json`, the record.
    `add`   `{ <deck id>: [row, …] }` — a card the generator did not deal to that deck: `word` (the headword,
        the pin's key), `id` (the number in its card id, above every number the generator deals to that deck,
        so a rebuild cannot mint it), `why`, `fields` (the card's nine fields) and `src`, where every part
        came from. `python3 .claude/greek/inserts.py` writes `fields` with the generator's own code, from the
        same cache; nothing in them is typed by hand.
    `decks` `{ <deck id>: { subtitle?, descSub?, tail? } }`. `subtitle` is a template. `descSub` is
        `[find, replace]` pairs over the generator's description, each satisfied if it matched or if its
        replacement already stands. `tail` is a paragraph that ENDS the description, beginning with the
        words THE BEGINNER PASS: on every run whatever stands from those words on is cut and the tail is
        written again, so its figures are always recounted. Placeholders, in `subtitle` and `tail`:
        {notes} {cards} {days} (the deck, at five notes a day; the alphabet's reading rules are one card
        each, so its {cards} is not twice its notes), {from} {to} (the days it occupies when the shelf is
        taken in order: alphabet, A1), {shelfNotes} {shelfDays}, {<deck id>.notes|days|from|to}, and
        {fact.<name>}, a figure `greek-order.js` computed and wrote into `greek-order.json` (`facts`).

  `greek-ids.json`, the pin: deck id → key → the number in the note's id (`u_<deck id>_<number>`; the
    second card of a note is that id plus `~2`, which the app adds). The key is the headword (`Word`), for
    a letter of the alphabet the letter as its card prints it, for a reading rule its `Key`. NEVER DELETE OR
    RENUMBER A ROW. A note that leaves a deck has its row moved to `_retired` by hand. APPLIED: a deck the
    generator has just numbered by position is numbered back.

  `greek-order.json`, the order: deck id → `order` (every key, in the order the deck is dealt) and `facts`.
    Written by `greek-order.js`; a list that is not exactly the deck's keys is refused. A deck with no entry
    keeps the order the generator wrote, with the record's added cards after it.

  --check changes nothing and exits 1 if a deck is not what the record, the pin and the order make of it,
  or if the pin would change. It is a CI step.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const REC_FILE = path.join(__dirname, "greek-fixes.json");
const IDS_FILE = path.join(__dirname, "greek-ids.json");
const ORD_FILE = path.join(__dirname, "greek-order.json");
const CHECK = process.argv.includes("--check"), VERBOSE = process.argv.includes("--verbose"), SEED = process.argv.includes("--seed-ids");
const TYPES = ["greek", "el-abc"];
const SHELF = ["elabc", "greeka1"];
const TAIL = "THE BEGINNER PASS";
const PER_DAY = 5; // LIMIT_DEFAULTS.lang is ten new CARDS a day, both directions together

let failed = 0;
const fail = (m) => { failed++; console.log("FAIL  " + m); };
const die = (m) => { console.log("FAIL  " + m); process.exit(1); };

/* The generator writes its files with Python's json.dump(ensure_ascii=False): ", " and ": " between items.
   The same bytes are written here, so a deck this script has nothing to say about is not rewritten at all. */
function py(v) {
  if (v === null) return "null";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return "[" + v.map(py).join(", ") + "]";
  return "{" + Object.keys(v).map((k) => JSON.stringify(k) + ": " + py(v[k])).join(", ") + "}";
}
const strip = (h) => String(h || "").replace(/<[^>]+>/g, "");
const keyOf = (c) => (c.type === "el-abc" ? strip(c.fields.Letter) : c.type === "el-read" ? c.fields.Key : c.fields.Word);

function findDecks() {
  const out = {};
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".folio-deck.json")).sort()) {
    const p = path.join(DIR, f);
    // the card types sit in `meta`, at the head of the file: read that much before parsing a megabyte
    const fd = fs.openSync(p, "r"), buf = Buffer.alloc(24000), n = fs.readSync(fd, buf, 0, 24000, 0);
    fs.closeSync(fd);
    const head = buf.toString("utf8", 0, n);
    if (!TYPES.some((t) => head.includes('"types": {"' + t + '"') || head.includes('"types":{"' + t + '"'))) continue;
    const text = fs.readFileSync(p, "utf8"), deck = JSON.parse(text);
    if (!TYPES.some((t) => deck.meta.types && deck.meta.types[t])) continue;
    out[deck.meta.id] = { file: f, text, deck };
  }
  return out;
}

const D = findDecks();
for (const id of SHELF) if (!D[id]) die("no deck with id " + id + " and a Greek card type in decks/");
for (const id of Object.keys(D)) if (!SHELF.includes(id)) die(D[id].file + ": a Greek deck this script does not know (" + id + "): add it to SHELF");

const writePin = (pin) => fs.writeFileSync(IDS_FILE, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ": " + JSON.stringify(pin[k])).join(",\n") + "\n}\n");

if (SEED) {
  if (fs.existsSync(IDS_FILE)) die("greek-ids.json exists: a pin is seeded once and never again");
  const pin = {};
  for (const id of SHELF) {
    pin[id] = {};
    for (const c of D[id].deck.cards) {
      const m = /^u_(.+)_(\d+)$/.exec(c.id || ""), k = keyOf(c);
      if (!m || m[1] !== id) die(D[id].file + ": " + k + " has id " + c.id);
      if (pin[id][k]) die(D[id].file + ": two notes with the key " + k);
      pin[id][k] = +m[2];
    }
  }
  pin._retired = {};
  writePin(pin);
  console.log("seeded greek-ids.json: " + SHELF.map((id) => id + " " + Object.keys(pin[id]).length).join(", "));
  process.exit(0);
}

const REC = JSON.parse(fs.readFileSync(REC_FILE, "utf8"));
if (!fs.existsSync(IDS_FILE)) die("greek-ids.json is missing (seed it once, from the decks as shipped: --seed-ids)");
const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8")), PIN_BEFORE = JSON.stringify(PIN);
const ORD = fs.existsSync(ORD_FILE) ? JSON.parse(fs.readFileSync(ORD_FILE, "utf8")) : {};
PIN._retired = PIN._retired || {};

// ---- 1. the record's added cards: moves and inserts ------------------------------------------------------
const FIELDS = ["Greek", "Roman", "IPA", "Word", "Say", "English", "Forms", "Table", "Examples"];
let inserted = 0;
const addedTo = {};
for (const target of Object.keys(REC.add || {})) {
  if (!D[target] || !D[target].deck.meta.types.greek) die("add: " + target + " is not a Greek word deck");
  const T = D[target].deck.cards;
  const seenIds = new Set();
  for (const row of REC.add[target]) {
    if (!row.word || !row.id || !row.why) die("add " + target + ": a row needs word, id and why (" + JSON.stringify(row).slice(0, 80) + ")");
    if (seenIds.has(row.id)) die("add " + target + ": id " + row.id + " given twice");
    seenIds.add(row.id);
    (addedTo[target] = addedTo[target] || new Set()).add(row.word);
    const at = T.findIndex((c) => c.fields.Word === row.word);
    let note = null;
    {
      if (!row.fields || !row.src) die("add " + target + "/" + row.word + ": an insert needs fields and src (python3 .claude/greek/inserts.py writes them)");
      for (const k of FIELDS) if (typeof row.fields[k] !== "string") die("add " + target + "/" + row.word + ": fields." + k + " is missing");
      if (row.fields.Word !== row.word) die("add " + target + "/" + row.word + ": fields.Word is " + row.fields.Word);
      const fields = {};
      for (const k of FIELDS) fields[k] = row.fields[k];
      note = { sub: "", fields, id: "", type: "greek" };
      inserted++;
    }
    if (note) {
      note.sub = row.sub || "";
      if (at >= 0) T[at] = note; else T.push(note);
    }
    const have = PIN[target][row.word];
    if (have && have !== row.id) die("add " + target + "/" + row.word + ": the pin says " + have + ", the record " + row.id);
    PIN[target][row.word] = row.id;
  }
}

// ---- 2. no word on two decks ----------------------------------------------------------------------------
const where = new Map();
for (const id of SHELF) {
  if (id === "elabc") continue;
  for (const c of D[id].deck.cards) {
    if (where.has(c.fields.Word)) fail(c.fields.Word + " is a card of " + where.get(c.fields.Word) + " and of " + id);
    where.set(c.fields.Word, id);
  }
}

// ---- 3. the pinned ids ----------------------------------------------------------------------------------
for (const id of SHELF) {
  const pin = PIN[id] || die("greek-ids.json has no entry for " + id), used = new Map(), keys = new Set();
  const retired = new Set(Object.values(PIN._retired[id] || {}));
  for (const c of D[id].deck.cards) {
    const k = keyOf(c), n = pin[k];
    keys.add(k);
    if (!n) { fail(D[id].file + ": " + k + " has no pinned number — a new card needs a row in greek-fixes.json (add) or, for the alphabet, in greek-ids.json"); continue; }
    if (used.has(n)) fail(D[id].file + ": " + k + " and " + used.get(n) + " are both pinned to " + n);
    if (retired.has(n)) fail(D[id].file + ": " + k + " is pinned to " + n + ", a retired number");
    used.set(n, k);
    c.id = "u_" + id + "_" + n;
  }
  for (const k of Object.keys(pin)) if (!keys.has(k)) fail("greek-ids.json: " + id + "/" + k + " (" + pin[k] + ") is pinned but not in the deck — a note that left moves to _retired, by a record row");
}

// ---- 4. the order ---------------------------------------------------------------------------------------
for (const id of SHELF) {
  const cards = D[id].deck.cards, want = ORD[id] && ORD[id].order;
  if (!want) continue;
  const by = new Map(cards.map((c) => [keyOf(c), c]));
  const missing = want.filter((k) => !by.has(k)), extra = cards.filter((c) => !want.includes(keyOf(c))).map(keyOf);
  if (missing.length || extra.length || new Set(want).size !== want.length) {
    fail("greek-order.json: " + id + " is not exactly the deck's keys (not in the deck: " + missing.slice(0, 5).join(" ") + "; not in the order: " + extra.slice(0, 5).join(" ") + ") — run greek-order.js");
    continue;
  }
  D[id].deck.cards = want.map((k) => by.get(k));
}

// ---- 5. subtitles and descriptions, recounted ------------------------------------------------------------
const count = {};
let before = 0, shelfNotes = 0;
const PER_DAY_CARDS = 2 * PER_DAY; // a reading rule is one card, a letter or a word two
for (const id of SHELF) {
  const n = D[id].deck.cards.length;
  const cards = D[id].deck.cards.reduce((a, c) => a + D[id].deck.meta.types[c.type].cards.length, 0);
  count[id] = { notes: n, cards, days: Math.ceil(cards / PER_DAY_CARDS), from: Math.floor(before / PER_DAY_CARDS) + 1, to: Math.ceil((before + cards) / PER_DAY_CARDS) };
  before += cards; shelfNotes += n;
}
const shelf = { shelfNotes, shelfCards: before, shelfDays: Math.ceil(before / PER_DAY_CARDS) };
const num = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
function render(t, id) {
  const v = Object.assign({}, shelf, count[id]);
  for (const other of SHELF) {
    for (const k of ["notes", "cards", "days", "from", "to"]) v[other + "." + k] = count[other][k];
    const facts = (ORD[other] && ORD[other].facts) || {};
    for (const k of Object.keys(facts)) v["fact." + k] = facts[k];
  }
  return t.replace(/\{([\w.]+)\}/g, (m, k) => {
    if (!(k in v)) die("decks." + id + ": unknown placeholder " + m);
    return typeof v[k] === "number" ? num(v[k]) : v[k];
  });
}
for (const id of Object.keys(REC.decks || {})) {
  if (!D[id]) die("decks: no Greek deck " + id);
  const r = REC.decks[id], meta = D[id].deck.meta;
  if (r.subtitle) meta.subtitle = render(r.subtitle, id);
  let desc = meta.desc;
  const cut = desc.indexOf(TAIL);
  if (cut >= 0) desc = desc.slice(0, cut).trimEnd();
  for (const [find, rep] of r.descSub || []) {
    if (desc.includes(find)) desc = desc.split(find).join(rep);
    else if (!desc.includes(rep)) fail("decks." + id + ".descSub: neither the text nor its replacement stands: " + find.slice(0, 70));
  }
  if (r.tail) {
    if (!r.tail.startsWith(TAIL)) die("decks." + id + ".tail must begin with the words " + TAIL);
    desc += " " + render(r.tail, id);
  }
  meta.desc = desc;
}

// ---- 6. write, or compare -------------------------------------------------------------------------------
let changed = 0;
for (const id of SHELF) {
  const out = py(D[id].deck);
  if (out === D[id].text) continue;
  changed++;
  if (CHECK) fail(D[id].file + " is not what the record, the pin and the order make of it — run node .claude/decks/greek-fix.js");
  else if (!failed) fs.writeFileSync(path.join(DIR, D[id].file), out);
}
if (JSON.stringify(PIN) !== PIN_BEFORE) {
  if (CHECK) fail("greek-ids.json would change — run node .claude/decks/greek-fix.js");
  else if (!failed) writePin(PIN);
}
if (VERBOSE || !CHECK) {
  console.log(SHELF.map((id) => id + " " + count[id].notes + " (days " + count[id].from + "–" + count[id].to + ")").join(" · "));
  console.log("shelf: " + shelf.shelfNotes + " notes, " + shelf.shelfCards + " cards, " + shelf.shelfDays + " days · inserts " + inserted + " · retired " + Object.values(PIN._retired).reduce((a, o) => a + Object.keys(o).length, 0));
}
if (failed) { console.log(failed + " failure(s)" + (CHECK ? "" : " — nothing written")); process.exit(1); }
console.log(CHECK ? "greek-fix --check: the Greek decks are what the record, the pin and the order make of them" : "greek-fix: " + changed + " deck file(s) written");
