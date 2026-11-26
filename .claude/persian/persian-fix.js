#!/usr/bin/env node
"use strict";
/*
  persian-fix.js — THE ONE WAY A PERSIAN DECK IS HAND-EDITED, ORDERED AND NUMBERED (Nov 2026, the Persian
  beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/persian/persian-fix.js [--check] [--verbose]
    node .claude/persian/persian-fix.js --refresh          # after `run.py --level x1`: re-read A1's additions
    node .claude/persian/persian-fix.js --seed-ids <dir>   # write persian-ids.json (refused once it exists)

  WHY IT EXISTS. The generator (`run.py`, `alphabet.py`) CAN rebuild every Persian deck byte for byte — that
  was proved on 2026-11-19, once its sentence pool was pinned (`examples.py`, `PINNED`) — so a fault of the
  generator is fixed IN the generator and every level is rebuilt. This file holds only what the generator
  cannot say: which number a note has for ever, which words moved to a lower deck, what was added to A1,
  the order a deck is dealt in, and the sentences of a description that state a count.

  THE ORDER OF A REBUILD:   python3 .claude/persian/run.py --level <x>  (each of a1 a2 b1 b2 c1, then phr,
  then x1)   →   python3 .claude/persian/alphabet.py   →   node .claude/persian/persian-fix.js --refresh
  →   node .claude/persian/persian-order.js   →   node .claude/persian/persian-fix.js   →
  node .claude/build-lang-decks.js.   The generator numbers a deck by position and knows nothing of this
  record; this file numbers it back, so a deck straight from the generator is never shipped.

  WHICH DECKS. Every deck in `decks/` whose card type is `persian` (the five levels and the phrases) or
  `fa-abc` (the alphabet) — by CARD TYPE, never by file name.

  THE FILE IS THE RECORD: `persian-fixes.json`.

  `insert`  `{ <deck id>: [entry, …] }` — a card the deck's word list has not got. An entry carries `word`
      (the headword, the pin's key), `id` (the number in its note id, above every number the generator
      deals), `from`, `why` and `fields`, the card's seven fields. `from` is where the fields came from:
        · `"<deck id>/<headword>"`, a card MOVED down from a higher deck, byte for byte. That deck's
          `dropDup` takes it out there and its old number goes to `_retired`. While the source deck still
          holds the card (a fresh rebuild) the entry's `fields` are re-read from it, so a moved card
          follows the generator; once it is dropped the record is the only copy.
        · `"x1/<headword>"`, a card BUILT FOR A1 by the generator's own stages (`run.py --level x1`,
          `inventory.X1`): meanings and forms from the English Wiktionary via kaikki.org, sentences from
          Tatoeba, their ids in `src`. `--refresh` re-reads it from the cache; nothing is typed here.
  `notes`   `{ "<deck id>/<headword>": { leadSense, why } }` — `leadSense` is `[pos, [gloss, …]]`, put
      before the card's own meanings. A note that matches nothing is an ERROR.
  `decks`   `{ <deck id>: { dropDup?, subtitle?, descSub? } }`.
      `dropDup` is `{ headword: "<lower deck id>/<its headword>" }`: DELETE this deck's card for a word a
      lower deck now carries. The claim is CHECKED — the named note must exist in a deck lower on the
      shelf. A card already gone is normal; its number must then be in `_retired`.
      `subtitle` and `descSub` (`[regex, replacement]` pairs over the description) may use the tokens
      {N} notes, {CARDS} cards, {DAYS} days at ten new cards a day, {EX} notes with a sentence, {EX3} notes
      with three, {ADDED} inserts, {MOVED} inserts moved from another deck, {NEW} inserts built for the
      deck, {SUB1} {SUB2} {SUB3} the notes of each subdeck, and from `persian-order.json` {HEAD} the
      hand-ordered head, {SET1} {SET2} {SET3} the note a closed set starts at and {A1PHRASES} {A1IDIOMS}
      {A1PROVERBS} the expressions readable with A1 — RECOUNTED on every run, never typed. A pair is satisfied if its replacement already stands
      in the text or if its regex matched; one satisfied by neither is an error.

  `persian-order.json`  `{ <deck id>: { why, order: [headword, …] } }`, written by persian-order.js and
      applied LAST: the notes are put in that order and nothing else about them moves. A list that is not
      exactly the deck's headwords is refused. A deck with no entry is dealt in the order of its pinned
      numbers, which is the order it shipped in.

  `persian-ids.json`  `{ <deck id>: { <headword>: N } }` for the note id `u_<deck id>_N`, seeded on
      2026-11-19 from the seven decks as shipped. A NOTE IS ONE NOTE WITH TWO CARD TEMPLATES, so both of a
      word's cards hang off this one id (English → Persian is `<id>~2`) and pinning the note pins both
      schedules. THE PIN IS APPLIED: a deck numbered by position is numbered back. Never delete or
      renumber a row; a removed note's row moves to `_retired`, and no number is ever dealt twice.

  --check  exits 1 if any deck is not exactly what this file would write. In CI (checks.yml).
*/
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DECKS = path.join(ROOT, "decks");
const F = (n) => path.join(__dirname, n);
const SHELF = ["faabc", "persiana1", "persiana2", "persianb1", "persianb2", "persianc1", "faphrase"];
const TYPES = new Set(["persian", "fa-abc"]);
const X1 = path.join(ROOT, ".claude", "persian-cache", "additions-x1.folio-deck.json");
const X1_IDS = path.join(ROOT, ".claude", "persian-cache", "example-ids-x1.json");

const args = process.argv.slice(2);
const CHECK = args.includes("--check"), VERBOSE = args.includes("--verbose"), REFRESH = args.includes("--refresh");
const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const die = (m) => { console.error("persian-fix: " + m); process.exit(1); };
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "");
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
/* A note's key: the headword of a word card, the letter of an alphabet card. */
const keyOf = (c) => (c.type === "fa-abc" ? strip(c.fields.Letter) : c.fields.Word);
const numOf = (c, deck) => { const m = /^u_(.+)_(\d+)$/.exec(c.id || ""); return m && m[1] === deck ? +m[2] : null; };

function loadDecks(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".folio-deck.json")).sort()) {
    const p = path.join(dir, f);
    const raw = fs.readFileSync(p, "utf8");
    if (!/"(persian|fa-abc)"/.test(raw)) continue;
    const d = JSON.parse(raw);
    if (!Object.keys(d.meta.types || {}).some((t) => TYPES.has(t))) continue;
    out[d.meta.id] = { file: f, path: p, raw, deck: d };
  }
  for (const id of Object.keys(out)) if (!SHELF.includes(id)) die(`a Persian deck this file does not know: ${id} (${out[id].file})`);
  return out;
}

if (args.includes("--seed-ids")) {
  if (fs.existsSync(F("persian-ids.json"))) die("persian-ids.json exists; it is never re-seeded");
  const dir = args[args.indexOf("--seed-ids") + 1];
  if (!dir) die("--seed-ids <directory of the decks as shipped>");
  const ids = {};
  const src = loadDecks(dir);
  for (const id of SHELF) {
    if (!src[id]) die("no deck " + id + " in " + dir);
    ids[id] = {};
    for (const c of src[id].deck.cards) {
      const k = keyOf(c), n = numOf(c, id);
      if (n == null) die(`${id}: an id that is not u_${id}_N: ${c.id}`);
      if (k in ids[id]) die(`${id}: two notes with the key ${k}`);
      ids[id][k] = n;
    }
  }
  ids._retired = {};
  fs.writeFileSync(F("persian-ids.json"), JSON.stringify(ids, null, 0).replace(/^\{/, "{\n").replace(/\},"/g, '},\n"').replace(/\}$/, "\n}") + "\n");
  console.log("seeded persian-ids.json:", SHELF.map((id) => id + " " + Object.keys(ids[id]).length).join(", "));
  process.exit(0);
}

const fixes = readJSON(F("persian-fixes.json"));
const ids = readJSON(F("persian-ids.json"));
const order = fs.existsSync(F("persian-order.json")) ? readJSON(F("persian-order.json")) : {};
const fixes0 = JSON.stringify(fixes), ids0 = JSON.stringify(ids);
ids._retired = ids._retired || {};
const all = loadDecks(DECKS);
for (const id of SHELF) if (!all[id]) die("deck missing from decks/: " + id);
const log = [];
const say = (m) => { log.push(m); if (VERBOSE) console.log("  " + m); };
const byKey = (id) => new Map(all[id].deck.cards.map((c) => [keyOf(c), c]));

/* ---- --refresh: A1's additions, from the generator's cache --------------------------------------- */
if (REFRESH) {
  if (!fs.existsSync(X1)) die("no " + path.relative(ROOT, X1) + ": run `python3 .claude/persian/run.py --level x1 --no-fetch` first");
  const x1 = new Map(readJSON(X1).cards.map((c) => [c.fields.Word, c]));
  const xi = fs.existsSync(X1_IDS) ? readJSON(X1_IDS) : {};
  for (const list of Object.values(fixes.insert || {})) for (const e of list) {
    if (!/^x1\//.test(e.from || "")) continue;
    const c = x1.get(e.from.slice(3));
    if (!c) die("an x1 insert the cache does not hold: " + e.from);
    e.fields = c.fields;
    e.src = (xi[fold(e.word)] || xi[e.word] || []).map((n) => "Tatoeba #" + n);
  }
}

/* ---- 1. the pin, on every deck as it stands -------------------------------------------------------- */
const insertOf = {};
for (const [id, list] of Object.entries(fixes.insert || {})) {
  if (!all[id]) die("insert into a deck that is not Persian: " + id);
  insertOf[id] = new Map(list.map((e) => [e.word, e]));
}
for (const id of SHELF) {
  const pin = ids[id] || die("no pin for " + id);
  const retired = (ids._retired[id] = ids._retired[id] || {});
  for (const c of all[id].deck.cards) {
    const k = keyOf(c);
    const ins = insertOf[id] && insertOf[id].get(k);
    if (ins && !(k in pin)) pin[k] = ins.id;
    if (!(k in pin)) {
      // the generator may print a word a higher deck's dropDup removed: it is dropped again below
      if (retired[k] != null && (fixes.decks[id] || {}).dropDup && k in fixes.decks[id].dropDup) { c.id = `u_${id}_${retired[k]}`; continue; }
      die(`${id}: no pinned number for "${k}" — a new note needs a row in persian-ids.json (the next free number) and a place in persian-order.js`);
    }
    c.id = `u_${id}_${pin[k]}`;
  }
}

/* ---- 2. inserts and drops, lowest deck first ------------------------------------------------------- */
for (const id of SHELF) {
  const D = all[id].deck, rec = (fixes.decks || {})[id] || {};
  const pin = ids[id], retired = ids._retired[id];
  for (const e of (fixes.insert || {})[id] || []) {
    if (!e.word || !e.id || !e.why || !e.from) die(`${id}: an insert needs word, id, from and why (${e.word})`);
    const [srcId, srcWord] = [e.from.slice(0, e.from.indexOf("/")), e.from.slice(e.from.indexOf("/") + 1)];
    if (srcId !== "x1") {
      if (SHELF.indexOf(srcId) <= SHELF.indexOf(id)) die(`${id}: ${e.word} is moved from ${srcId}, which is not a higher deck`);
      const there = byKey(srcId).get(srcWord);
      if (there) { e.fields = there.fields; say(`${id}: ${e.word} re-read from ${srcId}`); }
      if (!((fixes.decks[srcId] || {}).dropDup || {})[srcWord]) die(`${id}: ${e.word} is moved from ${srcId} but ${srcId} has no dropDup for it — it would be carded twice`);
    }
    if (!e.fields || !e.fields.Word) die(`${id}: the insert ${e.word} has no fields yet (run --refresh, or rebuild its source deck)`);
    if (e.fields.Word !== e.word) die(`${id}: the insert ${e.word} carries the fields of ${e.fields.Word}`);
    if (pin[e.word] != null && pin[e.word] !== e.id) die(`${id}: ${e.word} is pinned to ${pin[e.word]}, its insert says ${e.id}`);
    pin[e.word] = e.id;
    const have = byKey(id).get(e.word);
    if (have) have.fields = e.fields;
    else { D.cards.push({ sub: "", fields: e.fields, id: `u_${id}_${e.id}`, type: "persian" }); say(`${id}: + ${e.word} (${e.from})`); }
  }
  for (const [w, claim] of Object.entries(rec.dropDup || {})) {
    const [lowId, lowWord] = [claim.slice(0, claim.indexOf("/")), claim.slice(claim.indexOf("/") + 1)];
    if (SHELF.indexOf(lowId) < 0 || SHELF.indexOf(lowId) >= SHELF.indexOf(id)) die(`${id}: dropDup ${w} names ${lowId}, which is not a lower deck`);
    if (!byKey(lowId).has(lowWord)) die(`${id}: dropDup ${w} claims ${claim}, and that deck has no such note — nothing else would teach it`);
    const i = D.cards.findIndex((c) => keyOf(c) === w);
    if (i >= 0) {
      const n = numOf(D.cards[i], id);
      D.cards.splice(i, 1);
      delete pin[w];
      retired[w] = n;
      say(`${id}: − ${w} (now ${claim}); number ${n} retired`);
    } else if (retired[w] == null) die(`${id}: dropDup ${w} is gone from the deck and has no row in _retired`);
  }
}

/* ---- 3. the notes rebuilt -------------------------------------------------------------------------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
for (const [ref, n] of Object.entries(fixes.notes || {})) {
  const id = ref.slice(0, ref.indexOf("/")), w = ref.slice(ref.indexOf("/") + 1);
  const c = all[id] && byKey(id).get(w);
  if (!c) die(`notes: ${ref} matches no note`);
  if (!n.why) die(`notes: ${ref} has no why`);
  if (n.leadSense) {
    const [pos, gl] = n.leadSense;
    const body = gl.length === 1 ? `<div class="uc-gl">${esc(gl[0])}</div>` : `<ol class="uc-gls">${gl.map((g) => `<li>${esc(g)}</li>`).join("")}</ol>`;
    const html = `<div class="uc-sense"><div class="uc-pos">${esc(pos)}</div>${body}</div>`;
    if (!c.fields.English.startsWith(html)) { c.fields.English = html + c.fields.English; say(`${ref}: lead sense`); }
  }
}

/* ---- 4. numbers: unique, pinned, never a retired one ------------------------------------------------ */
for (const id of SHELF) {
  const pin = ids[id], retired = ids._retired[id], seen = new Map();
  const live = new Set(all[id].deck.cards.map(keyOf));
  for (const [k, n] of Object.entries(pin)) {
    if (!live.has(k)) die(`${id}: "${k}" is pinned (${n}) and not in the deck — a removed note's row moves to _retired`);
    if (seen.has(n)) die(`${id}: number ${n} is pinned to both "${seen.get(n)}" and "${k}"`);
    seen.set(n, k);
  }
  for (const [k, n] of Object.entries(retired)) if (seen.has(n)) die(`${id}: retired number ${n} ("${k}") is dealt again to "${seen.get(n)}"`);
  for (const c of all[id].deck.cards) if (c.id !== `u_${id}_${pin[keyOf(c)]}`) die(`${id}: ${keyOf(c)} has id ${c.id}, its pin says ${pin[keyOf(c)]}`);
}

/* ---- 5. the order ---------------------------------------------------------------------------------- */
for (const id of SHELF) {
  const D = all[id].deck, pin = ids[id];
  const o = order[id];
  if (!o) { D.cards.sort((a, b) => pin[keyOf(a)] - pin[keyOf(b)]); continue; }
  const m = byKey(id);
  if (o.order.length !== D.cards.length || new Set(o.order).size !== o.order.length || o.order.some((k) => !m.has(k)))
    die(`${id}: persian-order.json is not exactly the deck's ${D.cards.length} headwords (${o.order.length} listed; missing ${[...m.keys()].filter((k) => !o.order.includes(k)).slice(0, 5).join(" ")}; unknown ${o.order.filter((k) => !m.has(k)).slice(0, 5).join(" ")}) — run persian-order.js`);
  D.cards = o.order.map((k) => m.get(k));
}

/* ---- 6. the counts a description states, recounted -------------------------------------------------- */
for (const id of SHELF) {
  const D = all[id].deck, rec = (fixes.decks || {})[id] || {};
  const n = D.cards.length, ins = (fixes.insert || {})[id] || [];
  const exs = D.cards.map((c) => (String(c.fields.Examples || "").match(/class="uc-exi"/g) || []).length);
  const T = { N: n, CARDS: 2 * n, DAYS: Math.ceil((2 * n) / 10), EX: exs.filter((x) => x > 0).length, EX3: exs.filter((x) => x === 3).length,
    ADDED: ins.length, MOVED: ins.filter((e) => !/^x1\//.test(e.from)).length, NEW: ins.filter((e) => /^x1\//.test(e.from)).length };
  const subs = []; for (const c of D.cards) if (!subs.includes(c.sub)) subs.push(c.sub);
  subs.forEach((sb, i) => { T["SUB" + (i + 1)] = D.cards.filter((c) => c.sub === sb).length; });
  const o = order[id] || {};
  if (o.head != null) T.HEAD = o.head;
  (o.sets || []).forEach((at, i) => { T["SET" + (i + 1)] = at; });
  if (o.tiers) for (const [sb, t] of Object.entries(o.tiers)) T["A1" + sb.toUpperCase()] = t[0];
  const fill = (s) => s.replace(/\{([A-Z0-9]+)\}/g, (m0, k) => (k in T ? String(T[k]).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : die(`${id}: unknown token ${m0}`)));
  if (rec.subtitle) D.meta.subtitle = fill(rec.subtitle);
  for (const [find, repl] of rec.descSub || []) {
    const to = fill(repl), re = new RegExp(find);
    if (D.meta.desc.includes(to)) continue;        // already there: a replacement may contain its own find
    if (re.test(D.meta.desc)) D.meta.desc = D.meta.desc.replace(re, () => to);
    else die(`${id}: descSub matched nothing and its replacement is not in the description: ${find}`);
  }
}

/* ---- write, or compare ----------------------------------------------------------------------------- */
let dirty = 0;
for (const id of SHELF) {
  const out = JSON.stringify(all[id].deck);
  if (out === all[id].raw) continue;
  dirty++;
  if (CHECK) console.error(`persian-fix: ${all[id].file} is not what the record, the order and the pin give — run node .claude/persian/persian-fix.js`);
  else { fs.writeFileSync(all[id].path, out); console.log("  wrote " + all[id].file + " (" + all[id].deck.cards.length + " notes)"); }
}
const fixesOut = JSON.stringify(fixes), idsOut = JSON.stringify(ids);
if (fixesOut !== fixes0) { if (CHECK) { console.error("persian-fix: persian-fixes.json would change (a moved card differs from its source deck)"); dirty++; } else fs.writeFileSync(F("persian-fixes.json"), JSON.stringify(fixes, null, 1) + "\n"); }
if (idsOut !== ids0) {
  if (CHECK) { console.error("persian-fix: persian-ids.json would change"); dirty++; }
  else fs.writeFileSync(F("persian-ids.json"), "{\n" + Object.keys(ids).map((k) => JSON.stringify(k) + ":" + JSON.stringify(ids[k])).join(",\n") + "\n}\n");
}
const retiredN = Object.values(ids._retired).reduce((a, r) => a + Object.keys(r).length, 0);
if (CHECK && dirty) process.exit(1);
console.log(`persian-fix: ${CHECK ? "ok" : "done"} — ${SHELF.map((id) => all[id].deck.cards.length).join(" + ")} notes, ${retiredN} retired numbers` + (CHECK ? "" : `, ${log.length} changes`));
