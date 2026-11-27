#!/usr/bin/env node
"use strict";
/*
  swahili-fix.js — THE ONE WAY A TURKISH DECK IS HAND-EDITED, ORDERED AND NUMBERED (Nov 2026, the Swahili
  beginner pass — docs/lang-decks.md, "The Swahili beginner pass"). Standalone Node helper, zero deps. Not
  part of the site. The Urdu model (urdu-fix.js), which it was copied from.

    node .claude/decks/swahili-fix.js [--check] [--verbose]
    node .claude/decks/swahili-fix.js --seed-ids   # write swahili-ids.json from the decks as they stand (refused once it exists)

  WHY IT EXISTS. The six Swahili word decks ARE rebuilt by a generator (`.claude/swahili/run.py`), and a
  re-run reproduces them — proved on 2026-11-26 with every source fetched fresh: three sentences and eleven
  positions of 4,776 notes differed, each traced to Tatoeba's export having moved. But the generator deals a
  level by frequency and numbers every card by its position, so a card that is moved, added or re-ordered
  by hand had nowhere to be recorded and would have changed the id of every card after it. A reader's
  progress is keyed by card id. So: what the GENERATOR can do (a forms row it did not read, a sentence
  matched to the wrong word) is fixed in the generator, and what is a decision about ONE card or ONE order
  is here, applied after it.

  THE ORDER OF A REBUILD:   python3 .claude/swahili/run.py --level <a1|a2|b1|b2|c1|phr>  (each level that
  changed; after a change to the generator, all six, in that order)  →  python3 .claude/swahili/inserts.py
  (rebuilds the fields of the cards the record ADDS, with the generator's own code)  →
  node .claude/decks/swahili-fix.js  →  node .claude/decks/swahili-order.js  →
  node .claude/decks/swahili-fix.js  →  node .claude/decks/build-swahili-sounds.js  →
  node .claude/decks/swahili-fix.js  →  node .claude/build-lang-decks.js.   The generator reads the record
  too (`tr.words_below`, `phrases.taught`), so a level rebuilt alone is dealt the same list it was dealt
  before a card was moved out of it.

  WHICH DECKS. Every deck in `decks/` whose card type is `swahili` (A1, A2, B1, B2, C1 and the phrases) or
  `swsound` (the sounds deck, which `build-swahili-sounds.js` writes: held to its pin and counted on the
  shelf here, never edited) — by CARD TYPE, never by file name.

  THREE FILES.

  `swahili-fixes.json`, the record.
    `add`   `{ <deck id>: [row, …] }` — a card the generator did not deal to that deck. A row carries `word`
        (the headword, the pin's key), `id` (the number in its card id: above every number the generator has
        dealt to that deck, so a rebuild cannot mint it) and `why`. It is one of two things:
          · a MOVE, with `from` (the deck id the generator deals it to). The note is taken out of that deck
            as the generator wrote it and put here, whole — never copied into this file, so a generator fix
            reaches it. Its old number goes to `_retired` in the pin: a reader who already holds the old
            card keeps it, with its schedule, and meets the word again here.
          · an INSERT, with `fields` (the card's five fields) and `src`, where every part came from.
            `python3 .claude/swahili/inserts.py` writes `fields` with the generator's own code, from the
            same cache; nothing in them is typed by hand.
    `decks` `{ <deck id>: { subtitle?, descSub?, tail? } }`. `subtitle` is a template. `descSub` is
        `[find, replace]` pairs over the generator's description, each satisfied if it matched or if its
        replacement already stands. `hints` is `{ word: other word }`: the label `not <other word>` on the
        first part-of-speech line of a card's English side (the generator's own label for two notes of one
        deck with the same English, for cards the record brought together). `tail` is a paragraph that ENDS the description, beginning with the
        words THE BEGINNER PASS: on every run whatever stands from those words on is cut and the tail is
        written again, so its figures are always recounted. Placeholders, in `subtitle` and `tail`:
        {notes} {cards} {days} (the deck, at five notes a day), {from} {to} (the days it occupies when the
        shelf is taken in order: sounds, A1, A2, B1, B2, C1, phrases), {shelfNotes} {shelfDays}
        {shelfYears}, {<deck id>.notes|days|from|to} for another deck, {n:<headword>} and {day:<headword>}
        (where a card stands in THIS deck and the day of the deck it arrives on), {added} {left} (the
        record's cards this deck gained and lost), and for the phrases {phrases} {idioms} {proverbs}.

  `swahili-ids.json`, the pin: deck id → key → the number in the note's id (`u_<deck id>_<number>`; the
    English → Swahili card is that id plus `~2`, which the app adds). The key is the headword (`Word`), and
    for the sounds deck the row's `key`. NEVER DELETE OR RENUMBER A ROW. A note that leaves a deck has its
    row moved to `_retired`. APPLIED: a deck the generator has just numbered by position is numbered back.

  `swahili-order.json`, the order: deck id → every key, in the order the deck is dealt. Written by
    `swahili-order.js`; a list that is not exactly the deck's keys is refused. A deck with no entry keeps
    the order of its PINNED NUMBERS (the generator's frequency order as first shipped — Tatoeba's counts
    move, and the phrases' own order with them), with the record's added cards after it.

  --check changes nothing and exits 1 if a deck is not what the record, the pin and the order make of it,
  or if the pin would change. It is a CI step.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const REC_FILE = path.join(__dirname, "swahili-fixes.json");
const IDS_FILE = path.join(__dirname, "swahili-ids.json");
const ORD_FILE = path.join(__dirname, "swahili-order.json");
const CHECK = process.argv.includes("--check"), VERBOSE = process.argv.includes("--verbose"), SEED = process.argv.includes("--seed-ids");
const TYPES = ["swahili", "swsound"];
const SOUNDS = "swsounds";
const SHELF = [SOUNDS, "swahilia1", "swahilia2", "swahilib1", "swahilib2", "swahilic1", "swahiliphr"];
const TAIL = "THE BEGINNER PASS";
const PER_DAY = 5; // LIMIT_DEFAULTS.lang is ten new CARDS a day, both directions together: five words
const perDay = (id) => (id === SOUNDS ? 10 : PER_DAY); // a sounds note is one card

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
const keyOf = (c) => (c.type === "swsound" ? c.key : c.fields.Word);

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
if (!D[SOUNDS] && (SEED || !CHECK)) SHELF.shift(); // before build-swahili-sounds.js has first run; --check wants it
for (const id of SHELF) if (!D[id]) die("no deck with id " + id + " and a Swahili card type in decks/");
for (const id of Object.keys(D)) if (!SHELF.includes(id)) die(D[id].file + ": a Swahili deck this script does not know (" + id + "): add it to SHELF");

const writePin = (pin) => fs.writeFileSync(IDS_FILE, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ": " + JSON.stringify(pin[k])).join(",\n") + "\n}\n");

if (SEED) {
  if (fs.existsSync(IDS_FILE)) die("swahili-ids.json exists: a pin is seeded once and never again");
  const pin = {};
  for (const id of SHELF) {
    pin[id] = {};
    for (const c of D[id].deck.cards) {
      const m = /^u_(.+)_(\d+)$/.exec(c.id || ""), k = keyOf(c);
      if (c.type !== "swahili") die(D[id].file + ": " + k + " is of type " + c.type);
      if (!m || m[1] !== id) die(D[id].file + ": " + k + " has id " + c.id);
      if (pin[id][k]) die(D[id].file + ": two notes with the key " + k);
      pin[id][k] = +m[2];
    }
  }
  pin._retired = {};
  writePin(pin);
  console.log("seeded swahili-ids.json: " + SHELF.map((id) => id + " " + Object.keys(pin[id]).length).join(", "));
  process.exit(0);
}

const REC = JSON.parse(fs.readFileSync(REC_FILE, "utf8"));
if (!fs.existsSync(IDS_FILE)) die("swahili-ids.json is missing (seed it once, from the decks as shipped: --seed-ids)");
const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8")), PIN_BEFORE = JSON.stringify(PIN);
const ORD = fs.existsSync(ORD_FILE) ? JSON.parse(fs.readFileSync(ORD_FILE, "utf8")) : {};
PIN._retired = PIN._retired || {};

// ---- 1. the record's added cards: moves and inserts ------------------------------------------------------
const FIELDS = ["Swahili", "Word", "English", "Forms", "Examples"];
let moved = 0, inserted = 0;
const addedTo = {}, leftFrom = {};
for (const target of Object.keys(REC.add || {})) {
  if (!D[target] || !D[target].deck.meta.types.swahili) die("add: " + target + " is not a Swahili word deck");
  const T = D[target].deck.cards;
  const seenIds = new Set();
  for (const row of REC.add[target]) {
    if (!row.word || !row.id || !row.why) die("add " + target + ": a row needs word, id and why (" + JSON.stringify(row).slice(0, 80) + ")");
    if (seenIds.has(row.id)) die("add " + target + ": id " + row.id + " given twice");
    seenIds.add(row.id);
    (addedTo[target] = addedTo[target] || new Set()).add(row.word);
    const at = T.findIndex((c) => c.fields.Word === row.word);
    let note = null;
    if (row.from) {
      if (!D[row.from]) die("add " + target + "/" + row.word + ": no deck " + row.from);
      (leftFrom[row.from] = leftFrom[row.from] || new Set()).add(row.word);
      const S = D[row.from].deck.cards, si = S.findIndex((c) => c.fields.Word === row.word);
      if (si >= 0) {
        note = S.splice(si, 1)[0]; moved++;
        // the generator labelled it against its neighbours in the deck it left (`interjection, not habari yako`):
        // they are not its neighbours here, and `hints` says who is
        note.fields.English = note.fields.English.replace(/(<div class="uc-pos">[^<]*?), not [^<]*<\/div>/, "$1</div>");
      }
      else if (at < 0) { fail("add " + target + "/" + row.word + ": in neither " + row.from + " nor " + target + " — rebuild " + row.from + " with the generator first"); continue; }
      // its old number is retired, never reused
      const old = PIN[row.from] && PIN[row.from][row.word];
      if (old) { (PIN._retired[row.from] = PIN._retired[row.from] || {})[row.word] = old; delete PIN[row.from][row.word]; }
      if (!(PIN._retired[row.from] && PIN._retired[row.from][row.word])) fail("add " + target + "/" + row.word + ": " + row.from + " has no pinned number for it, live or retired");
    } else {
      if (!row.fields || !row.src) die("add " + target + "/" + row.word + ": an insert needs fields and src (python3 .claude/swahili/inserts.py writes them)");
      for (const k of FIELDS) if (typeof row.fields[k] !== "string") die("add " + target + "/" + row.word + ": fields." + k + " is missing");
      if (row.fields.Word !== row.word) die("add " + target + "/" + row.word + ": fields.Word is " + row.fields.Word);
      const fields = {};
      for (const k of FIELDS) fields[k] = row.fields[k];
      note = { fields, id: "", type: "swahili" };
      inserted++;
    }
    if (note) {
      // the generator's own key order: sub, fields, id, type (`sub` is empty on every Swahili deck)
      const n = { sub: note.sub || "", fields: note.fields, id: note.id, type: note.type };
      if (at >= 0) T[at] = n; else T.push(n);
    }
    const have = PIN[target][row.word];
    if (have && have !== row.id) die("add " + target + "/" + row.word + ": the pin says " + have + ", the record " + row.id);
    PIN[target][row.word] = row.id;
  }
}

// ---- 1b. the record's dropped notes: a note the generator no longer deals -----------------------------------
/* `drop` is `{ <deck id>: [{ word, why, see }] }`: the note has left the deck (a generator fix took it out) and
   its number is retired, never reused. A reader who holds the card keeps it, with its schedule. `see` names
   the deck and headword that teaches it now, and must be a card there. */
for (const id of Object.keys(REC.drop || {})) {
  if (!D[id]) die("drop: no Swahili deck " + id);
  for (const row of REC.drop[id]) {
    if (!row.word || !row.why || !row.see) die("drop " + id + ": a row needs word, why and see");
    const cut = row.see.indexOf("/"), sd = row.see.slice(0, cut), sw = row.see.slice(cut + 1);
    if (!D[sd] || !D[sd].deck.cards.some((c) => keyOf(c) === sw)) fail("drop " + id + "/" + row.word + ": " + row.see + " is not a card");
    (leftFrom[id] = leftFrom[id] || new Set()).add(row.word);
    if (D[id].deck.cards.some((c) => keyOf(c) === row.word)) fail("drop " + id + "/" + row.word + ": the generator still deals it — a drop records a generator fix (select.EXCLUDE), it does not make one");
    const old = PIN[id] && PIN[id][row.word];
    if (old) { (PIN._retired[id] = PIN._retired[id] || {})[row.word] = old; delete PIN[id][row.word]; }
    if (!(PIN._retired[id] && PIN._retired[id][row.word])) fail("drop " + id + "/" + row.word + ": " + id + " has no pinned number for it, live or retired");
  }
}

// ---- 2. no word on two decks ----------------------------------------------------------------------------
const where = new Map();
for (const id of SHELF) {
  if (id === SOUNDS) continue;
  for (const c of D[id].deck.cards) {
    if (where.has(c.fields.Word)) fail(c.fields.Word + " is a card of " + where.get(c.fields.Word) + " and of " + id);
    where.set(c.fields.Word, id);
  }
}

// ---- 3. the pinned ids ----------------------------------------------------------------------------------
for (const id of SHELF) {
  const pin = PIN[id] || die("swahili-ids.json has no entry for " + id), used = new Map(), keys = new Set();
  const retired = new Set(Object.values(PIN._retired[id] || {}));
  for (const c of D[id].deck.cards) {
    const k = keyOf(c), n = pin[k];
    keys.add(k);
    if (!n) { fail(D[id].file + ": " + k + " has no pinned number — a new card needs a row in swahili-fixes.json (add); a sounds row gets its number from build-swahili-sounds.js"); continue; }
    if (used.has(n)) fail(D[id].file + ": " + k + " and " + used.get(n) + " are both pinned to " + n);
    if (retired.has(n)) fail(D[id].file + ": " + k + " is pinned to " + n + ", a retired number");
    used.set(n, k);
    if (id === SOUNDS) { if (c.id !== "u_" + id + "_" + n) fail(D[id].file + ": " + k + " has id " + c.id + ", pinned to " + n + " — run build-swahili-sounds.js"); }
    else c.id = "u_" + id + "_" + n;
  }
  for (const k of Object.keys(pin)) if (!keys.has(k)) fail("swahili-ids.json: " + id + "/" + k + " (" + pin[k] + ") is pinned but not in the deck — a note that left moves to _retired, by a record row");
}

// ---- 4. the order ---------------------------------------------------------------------------------------
for (const id of SHELF) {
  const cards = D[id].deck.cards, want = ORD[id];
  if (!want) {
    // no entry: the order of the pinned numbers, which is the order the deck was first shipped in
    if (id !== SOUNDS) cards.sort((a, b) => PIN[id][keyOf(a)] - PIN[id][keyOf(b)]);
    continue;
  }
  const by = new Map(cards.map((c) => [keyOf(c), c]));
  const missing = want.filter((k) => !by.has(k)), extra = cards.filter((c) => !want.includes(keyOf(c))).map(keyOf);
  if (missing.length || extra.length || new Set(want).size !== want.length) {
    fail("swahili-order.json: " + id + " is not exactly the deck's keys (not in the deck: " + missing.slice(0, 5).join(" ") + "; not in the order: " + extra.slice(0, 5).join(" ") + ") — run swahili-order.js");
    continue;
  }
  D[id].deck.cards = want.map((k) => by.get(k));
}

// ---- 4b. hints: the generator's own `not <word>` label, on two cards the record brought together ------------
/* The generator ends by labelling the notes of a deck that share an English side (`.claude/dedupe-glosses.py`:
   "pronoun, not orası"), but it deals each deck alone: a card moved in from another deck, or built by
   inserts.py, was never compared with its new neighbours. `hints` names those, `{ word: other word }`, and
   the same label is put in the same place — the FIRST part-of-speech line of the English side, which is the
   front of the English → Swahili card. Idempotent: a line that already carries the label is left. */
for (const id of Object.keys(REC.decks || {})) {
  const hints = REC.decks[id].hints || {};
  for (const w of Object.keys(hints)) {
    const c = D[id].deck.cards.find((x) => x.fields.Word === w), o = D[id].deck.cards.find((x) => x.fields.Word === hints[w]);
    if (!c || !o) { fail("decks." + id + ".hints: " + w + " or " + hints[w] + " is not a card of the deck"); continue; }
    const label = ", not " + hints[w];
    c.fields.English = c.fields.English.replace(/<div class="uc-pos">([^<]*)<\/div>/, (m, pos) => (pos.endsWith(label) ? m : '<div class="uc-pos">' + pos + label + "</div>"));
  }
}

// ---- 5. subtitles and descriptions, recounted ------------------------------------------------------------
const count = {};
let before = 0;
for (const id of SHELF) {
  const n = D[id].deck.cards.length;
  // `before` is in DAYS: the sounds deck is one card a note (ten a day), a word deck two (five a day)
  const days = Math.ceil(n / perDay(id));
  count[id] = { notes: n, cards: (id === SOUNDS ? 1 : 2) * n, days, from: before + 1, to: before + days };
  before += days;
}
const shelfNotes = SHELF.reduce((a, id) => a + count[id].notes, 0);
const shelf = { shelfNotes, shelfDays: before, shelfYears: (before / 365).toFixed(1) };
const num = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
function render(t, id) {
  const v = Object.assign({}, shelf, count[id]);
  for (const other of SHELF) for (const k of ["notes", "days", "from", "to"]) v[other + "." + k] = count[other][k];
  v.added = (addedTo[id] || new Set()).size; v.left = (leftFrom[id] || new Set()).size;
  const at = (w) => { const i = D[id].deck.cards.findIndex((c) => keyOf(c) === w); if (i < 0) die("decks." + id + ": the description names " + w + ", which is not a card of the deck"); return i + 1; };
  return t.replace(/\{(n|day):([^}]+)\}/g, (m, what, w) => num(what === "n" ? at(w) : Math.ceil(at(w) / PER_DAY)))
    .replace(/\{([\w.]+)\}/g, (m, k) => {
      if (!(k in v)) die("decks." + id + ": unknown placeholder " + m);
      return typeof v[k] === "number" ? num(v[k]) : v[k];
    });
}
for (const id of Object.keys(REC.decks || {})) {
  if (!D[id]) die("decks: no Swahili deck " + id);
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
  if (id === SOUNDS) continue; // written by build-swahili-sounds.js alone
  const out = py(D[id].deck);
  if (out === D[id].text) continue;
  changed++;
  if (CHECK) fail(D[id].file + " is not what the record, the pin and the order make of it — run node .claude/decks/swahili-fix.js");
  else if (!failed) fs.writeFileSync(path.join(DIR, D[id].file), out);
}
if (JSON.stringify(PIN) !== PIN_BEFORE) {
  if (CHECK) fail("swahili-ids.json would change — run node .claude/decks/swahili-fix.js");
  else if (!failed) writePin(PIN);
}
if (VERBOSE || !CHECK) {
  console.log(SHELF.map((id) => id + " " + count[id].notes + " (days " + count[id].from + "–" + count[id].to + ")").join(" · "));
  console.log("shelf: " + shelf.shelfNotes + " notes, " + shelf.shelfDays + " days, " + shelf.shelfYears + " years · moved this run " + moved + " · inserts " + inserted + " · retired " + Object.values(PIN._retired).reduce((a, o) => a + Object.keys(o).length, 0));
}
if (failed) { console.log(failed + " failure(s)" + (CHECK ? "" : " — nothing written")); process.exit(1); }
console.log(CHECK ? "swahili-fix --check: the Swahili decks are what the record, the pin and the order make of them" : "swahili-fix: " + changed + " deck file(s) written");
