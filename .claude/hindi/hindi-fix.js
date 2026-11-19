#!/usr/bin/env node
"use strict";
/*
  hindi-fix.js — THE ONE WAY A HINDI DECK IS HAND-EDITED, ORDERED AND NUMBERED (Nov 2026, the Hindi beginner
  pass — docs/lang-decks.md, "The Hindi beginner pass"). Standalone Node helper, zero deps. Not part of the site.

    node .claude/hindi/hindi-fix.js [--check] [--verbose]
    node .claude/hindi/hindi-fix.js --seed-ids       # write hindi-ids.json (refused once it exists)

  WHY IT EXISTS. `.claude/hindi/run.py` CAN rebuild every Hindi deck byte for byte (proved on 2026-11-19: all
  seven files, 280 MB fetched), so a fault that is the generator's is repaired THERE (build_deck.py,
  extract.py, alphabet.py). What is left is what a generator cannot know: which card a beginner should meet
  first, which card belongs a deck lower, which sentence is of another word. That is this record, applied
  AFTER the generator, and it is idempotent: applied to a fresh build or to the committed decks it gives the
  same files, which is what `--check` asserts (the committed decks are what the record gives).

  THE ORDER OF A REBUILD:
      python3 .claude/hindi/run.py --level a1   (then a2, b1, b2, c1, phr — any level, alone or all)
      python3 .claude/hindi/alphabet.py
      node .claude/hindi/hindi-order.js          (only if a headword, the head or a set changed)
      node .claude/hindi/hindi-fix.js
      node .claude/build-lang-decks.js
  A level may be rebuilt ALONE on top of the committed decks: `hindi_level.words_below` reads this record and
  counts a card it moved as still taught where the generator dealt it.

  WHICH DECKS. Every deck in `decks/` whose card type is `hindi` (the five levels and the phrases) or
  `hi-abc` (the alphabet) — by CARD TYPE, never by file name.

  THE FILE IS THE RECORD: `hindi-fixes.json`.

  `insert`  `{ <deck id>: [entry, …] }` — a card the generator does not deal into that deck. An entry carries
      `word` (the headword, the pin's key), `id` (the number in its note id, above every number the generator
      deals) and a `why` naming where every part came from. Its content is one of:
        · `fields`, the seven fields of a card MOVED from another deck, copied byte for byte on the day of
          the move (`from` is "<deck id>/<headword>"). The moved card is taken out of its old deck by that
          deck's `dropDup`, and its old number goes to `_retired`.
        · `roman` / `senses` / `forms` / `ex`, for a card nothing carded: the meaning and the romanisation
          are the English Wiktionary's (kaikki.org), each sentence a Tatoeba sentence named by id in `src`.
      Both may be given: `senses`, `forms`, `ex` then replace that field of the moved card.
      `senses` is `[[pos, [gloss, …]], …]`, `forms` `[[label, form, roman], …]`, `ex` `[[hindi, english,
      src, [bold, …]], …]` (bold defaults to the headword's own words; a sentence with none is an error).

  `notes`  `{ "<deck id>/<headword>": { exDrop?, exOnly?, hint?, why } }` — an edit to a card the deck has.
      `exDrop` is a list of Hindi sentences taken off the card (a sentence of another word); `exOnly` a list
      of the sentences KEPT, in that order; `hint` is appended to the card's first part-of-speech label
      (", not शुक्रिया"), which is what the English → Hindi card shows to tell two words apart — the
      generator's own device (`.claude/dedupe-glosses.py`). A note that matches nothing is an ERROR; a
      sentence already gone is normal.

  `decks`  `{ <deck id>: { dropDup?, descSub? } }`.
      `dropDup` is `{ headword: "<lower deck id>/<its headword>" }`: DELETE this deck's card for a word a
      lower deck carries. CHECKED — the named note must exist in a deck lower on the shelf — so it can
      never delete a word nothing else teaches. A card already gone is normal.
      `descSub` is `[find, replace]` pairs over the description, each satisfied if its replacement already
      stands in the text or if it matched; one satisfied by neither is an error. A replacement may name
      `{n}` (the deck's size), `{added}` (its inserts) and any of the order's `facts` (`{head}`, `{days}` …),
      so no figure a description states is typed. To reword a replacement that has shipped, add a pair
      after it whose `find` is the old replacement.

  THE COUNTS A DESCRIPTION STATES ARE RECOUNTED on every run, by the formulas build_deck.py uses: how many
  words, nouns, verbs, cards with sentences and with three; the phrases' own figures. (The alphabet's
  subtitle and description are alphabet.py's, whole.)

  `hindi-order.json`  `{ <deck id>: { why, order: [key, …] } }`, written by hindi-order.js (its header has the
      rules) and applied LAST: the notes are put in that order and nothing else about them moves. A list
      that is not exactly the deck's keys is refused. A deck with no entry is dealt in the order of its
      pinned numbers, which is the order the generator deals.

  `hindi-ids.json`  `{ <deck id>: { <key>: N } }` for the note id `u_<deck id>_N`; the key is a word card's
      `Word`, a letter's `Letter`, a reading rule's `Key`. Seeded on 2026-11-19 from the seven decks as
      shipped. A NOTE HERE IS ONE NOTE WITH TWO CARD TEMPLATES, so both of a word's cards hang off this one
      id (the English → Hindi card is `<id>~2`). THE PIN IS APPLIED, NOT ONLY CHECKED: the generator numbers
      a deck by position and the Update press merges a reader's progress by id, so every note is given back
      the number its key is pinned to. A note with no row takes its insert's `id`, or failing that the next
      free number, and gains a row (under `--check` that is a failure). A headword the generator now spells
      another way (सफेद → सफ़ेद, the same word through `hi.fold`) has its key RENAMED, the number staying.
      A row is never deleted: a note this record removes moves to `_retired`. A pinned note that is missing
      for any other reason fails the run.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const FIXES = path.join(HERE, "hindi-fixes.json"), IDS_FILE = path.join(HERE, "hindi-ids.json");
const ORDER_FILE = path.join(HERE, "hindi-order.json");
const argv = process.argv.slice(2);
const CHECK = argv.includes("--check"), VERBOSE = argv.includes("--verbose"), SEED = argv.includes("--seed-ids");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const writePin = (pin) => fs.writeFileSync(IDS_FILE, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n");
const E = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
// hi.fold: the nukta dropped, chandrabindu read as anusvara — the generator's own equality of spellings
const fold = (s) => s.normalize("NFD").replace(/़/g, "").replace(/ँ/g, "ं").normalize("NFC");

const SHELF = ["hiabc", "hindia1", "hindia2", "hindib1", "hindib2", "hindic1", "hiphrase"];
const ALL = fs.readdirSync(DIR).filter((x) => /^Hindi-.*\.folio-deck\.json$/.test(x)).sort()
  .map((f) => { const text = fs.readFileSync(path.join(DIR, f), "utf8"); return { f, text, d: JSON.parse(text) }; });
const isOurs = (d) => !!(d.meta && d.meta.types && (d.meta.types.hindi || d.meta.types["hi-abc"]));
const DECKS = ALL.filter((x) => isOurs(x.d)).sort((a, b) => SHELF.indexOf(a.d.meta.id) - SHELF.indexOf(b.d.meta.id));
for (const x of DECKS) if (!SHELF.includes(x.d.meta.id)) fail(x.f + ": deck id " + x.d.meta.id + " is not on the Hindi shelf this script knows");
const byId = new Map(DECKS.map((x) => [x.d.meta.id, x]));
const keyOf = (c) => (c.type === "hindi" ? c.fields.Word : c.fields.Key || c.fields.Letter);
const numOf = (c, id) => { const m = /^u_([a-z0-9]+)_(\d+)$/.exec(c.id || ""); return m && m[1] === id ? Number(m[2]) : NaN; };

if (SEED) {
  if (fs.existsSync(IDS_FILE)) fail("hindi-ids.json exists — a pin is seeded once and never re-seeded");
  const out = { _: "hindi-ids.json — the number in each Hindi note's id, pinned to its note: <deck id> → <key> → N, for the id u_<deck id>_N. The key is a word card's Word, a letter's Letter, a reading rule's Key. A note of these decks is one note with two card templates, so both of a word's cards hang off this number (the English → Hindi card is <id>~2). Seeded on 2026-11-19 from the seven decks as shipped and APPLIED by hindi-fix.js: a rebuilt deck, which the generator numbers by position, is numbered back. NEVER delete or renumber a row — the Update press merges a reader's progress by id. A note the record removes moves to _retired; a new note takes the next free number; a respelling renames the key." };
  for (const { d } of DECKS) {
    const id = d.meta.id, pin = {};
    for (const c of d.cards) {
      const n = numOf(c, id), k = keyOf(c);
      if (!Number.isFinite(n)) fail(id + ": unexpected card id " + c.id);
      if (k in pin) fail(id + ": two notes share the key " + k);
      pin[k] = n;
    }
    out[id] = pin;
  }
  out._retired = {};
  writePin(out);
  console.log("seeded hindi-ids.json: " + DECKS.map((x) => x.d.meta.id + " " + x.d.cards.length).join(", "));
  process.exit(0);
}

const R = readJson(FIXES), PIN = readJson(IDS_FILE), ORDER = fs.existsSync(ORDER_FILE) ? readJson(ORDER_FILE) : {};
PIN._retired = PIN._retired || {};
const log = [];
const say = (m) => { log.push(m); if (VERBOSE) console.log("  " + m); };

/* ---- building a card's fields ---------------------------------------------------------------------- */
const sensesHtml = (senses) => senses.map(([pos, gl]) => '<div class="uc-sense"><div class="uc-pos">' + E(pos) + "</div>" +
  (gl.length === 1 ? '<div class="uc-gl">' + E(gl[0]) + "</div>" : '<ol class="uc-gls">' + gl.map((g) => "<li>" + E(g) + "</li>").join("") + "</ol>") + "</div>").join("");
const formsHtml = (forms) => (forms && forms.length ? '<div class="uc-forms">' + forms.map(([l, f, r]) =>
  '<span class="uc-fi"><span class="uc-fl">' + E(l) + "</span>" + E(f) + '<span class="uc-fr">' + E(r || "") + "</span></span>").join("") + "</div>" : "");
// build_deck.mark: a run of Devanagari is bolded when its fold is one of the hits
function exHtml(ex, word, where) {
  return ex.map(([hi, en, src, bold]) => {
    if (!src) fail(where + ": a sentence with no source: " + hi);
    const hits = new Set((bold || word.split(/\s+/)).map(fold));
    let any = false;
    const marked = hi.split(/([ऀ-ॣ०-ॿ‌‍]+)/).map((p) => {
      if (p && hits.has(fold(p))) { any = true; return "<b>" + E(p) + "</b>"; }
      return E(p);
    }).join("");
    if (!any) fail(where + ": none of " + [...hits].join(", ") + " stands in: " + hi);
    return '<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="' + E(hi) + '"></span>' + marked +
      '</div><div class="uc-exe">' + E(en) + "</div></div>";
  }).join("");
}
const EX_ITEM = /<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="([^"]*)"><\/span>.*?<\/div><div class="uc-exe">.*?<\/div><\/div>/g;
const unE = (s) => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const FIELDS = ["Hindi", "Roman", "Word", "English", "Forms", "Table", "Examples"];

function insertFields(e, where) {
  let F;
  if (e.fields) {
    F = {};
    for (const k of FIELDS) { if (typeof e.fields[k] !== "string") fail(where + ": a moved card needs the field " + k); F[k] = e.fields[k]; }
    if (F.Word !== e.word) fail(where + ": fields.Word is " + F.Word);
  } else {
    if (!e.roman || !e.senses) fail(where + ": a new card needs roman and senses");
    F = { Hindi: '<div class="uc-word">' + E(e.show || e.word) + "</div>", Roman: E(e.roman), Word: e.word, English: "", Forms: "", Table: "", Examples: "" };
  }
  if (e.senses) F.English = sensesHtml(e.senses);
  if (e.forms) F.Forms = formsHtml(e.forms);
  if (e.ex) F.Examples = exHtml(e.ex, e.word, where);
  if (!e.why) fail(where + ": no why");
  return F;
}

/* ---- 1. inserts ------------------------------------------------------------------------------------ */
const inserted = new Map(); // deck id -> Map(word -> id number)
for (const [id, list] of Object.entries(R.insert || {})) {
  const x = byId.get(id); if (!x) fail("insert: no deck " + id);
  const have = new Map(x.d.cards.map((c) => [keyOf(c), c]));
  const m = new Map(); inserted.set(id, m);
  for (const e of list) {
    const where = "insert " + id + "/" + e.word, F = insertFields(e, where);
    if (!Number.isInteger(e.id)) fail(where + ": no id");
    m.set(e.word, e.id);
    let c = have.get(e.word);
    if (!c) { c = { sub: e.sub || "", fields: F, id: "u_" + id + "_" + e.id, type: "hindi" }; x.d.cards.push(c); have.set(e.word, c); say(id + ": + " + e.word); }
    else c.fields = F;
  }
}

/* ---- 2. edits to cards a deck has ------------------------------------------------------------------- */
for (const [key, n] of Object.entries(R.notes || {})) {
  const at = key.indexOf("/"), id = key.slice(0, at), w = key.slice(at + 1), x = byId.get(id);
  if (!x) fail("notes: no deck " + id);
  const c = x.d.cards.find((c) => keyOf(c) === w);
  if (!c) fail("notes: " + key + " matches no card");
  if (!n.why) fail("notes: " + key + " has no why");
  if (n.exDrop || n.exOnly) {
    const items = c.fields.Examples.match(EX_ITEM) || [];
    const text = (it) => unE(/data-say="([^"]*)"/.exec(it)[1]);
    let keep;
    if (n.exOnly) {
      keep = n.exOnly.map((s) => items.find((it) => text(it) === s)).filter(Boolean);
      if (!keep.length) fail("notes: " + key + " exOnly keeps no sentence the card has");
    } else keep = items.filter((it) => !n.exDrop.includes(text(it)));
    const html = keep.join("");
    if (html !== c.fields.Examples) { c.fields.Examples = html; say(key + ": sentences " + items.length + " → " + keep.length); }
  }
  if (n.hint) {
    const m = /^<div class="uc-sense"><div class="uc-pos">([^<]*)<\/div>/.exec(c.fields.English);
    if (!m) fail("notes: " + key + " has no part-of-speech label to hint");
    const tail = ", " + E(n.hint);
    if (!m[1].endsWith(tail)) {
      if (/, not /.test(m[1])) fail("notes: " + key + " is already hinted: " + m[1]);
      c.fields.English = c.fields.English.replace(m[0], '<div class="uc-sense"><div class="uc-pos">' + m[1] + tail + "</div>"); say(key + ": hint" + tail);
    }
  }
}

/* ---- 3. drops --------------------------------------------------------------------------------------- */
const dropped = new Map(); // deck id -> Set(word)
for (const [id, spec] of Object.entries(R.decks || {})) {
  const x = byId.get(id); if (!x) fail("decks: no deck " + id);
  const set = new Set(); dropped.set(id, set);
  for (const [w, target] of Object.entries(spec.dropDup || {})) {
    const at = target.indexOf("/"), tid = target.slice(0, at), tw = target.slice(at + 1), t = byId.get(tid);
    if (!t || SHELF.indexOf(tid) >= SHELF.indexOf(id)) fail(id + ": dropDup " + w + " names " + tid + ", which is not a lower deck");
    if (!t.d.cards.some((c) => keyOf(c) === tw)) fail(id + ": dropDup " + w + " names " + target + ", which is not a card");
    set.add(w);
    const i = x.d.cards.findIndex((c) => keyOf(c) === w);
    if (i >= 0) { x.d.cards.splice(i, 1); say(id + ": − " + w + " (" + target + ")"); }
  }
}

/* ---- 4. the pin ------------------------------------------------------------------------------------- */
let pinChanged = false;
for (const x of DECKS) {
  const id = x.d.meta.id, ret = PIN._retired[id] || {};
  if (!PIN[id]) PIN[id] = {};
  const keys = new Set(x.d.cards.map(keyOf));
  if (keys.size !== x.d.cards.length) fail(id + ": two notes share a key");
  // a respelling: the row whose key is the same word through the fold
  for (const k of keys) if (!(k in PIN[id])) {
    const cur = PIN[id], old = Object.keys(cur).find((o) => !keys.has(o) && fold(o) === fold(k));
    if (old) { const fresh = {}; for (const o of Object.keys(cur)) fresh[o === old ? k : o] = cur[o]; PIN[id] = fresh; pinChanged = true; say(id + ": pin key " + old + " → " + k); }
  }
  const p = PIN[id];
  // a row whose note the record removed goes to _retired; any other missing note is a failure
  for (const k of Object.keys(p)) if (!keys.has(k)) {
    if (!(dropped.get(id) || new Set()).has(k)) fail(id + ": the pinned note " + k + " (" + p[k] + ") is missing and no dropDup names it");
    ret[k] = p[k]; delete p[k]; PIN._retired[id] = ret; pinChanged = true; say(id + ": retired " + k + " (" + ret[k] + ")");
  }
  const used = new Set([...Object.values(p), ...Object.values(ret)]);
  let next = Math.max(0, ...used) + 1;
  for (const c of x.d.cards) {
    const k = keyOf(c);
    if (!(k in p)) {
      let n = (inserted.get(id) || new Map()).get(k);
      if (n === undefined) n = next;
      if (used.has(n)) fail(id + ": " + k + " wants the number " + n + ", which is taken");
      p[k] = n; used.add(n); next = Math.max(next, n + 1); pinChanged = true; say(id + ": new row " + k + " = " + n);
    }
    c.id = "u_" + id + "_" + p[k];
  }
  const seen = new Set(); for (const c of x.d.cards) { if (seen.has(c.id)) fail(id + ": the id " + c.id + " is dealt twice"); seen.add(c.id); }
}

/* ---- 5. the order ----------------------------------------------------------------------------------- */
for (const x of DECKS) {
  const id = x.d.meta.id, p = PIN[id];
  const o = ORDER[id];
  if (o) {
    const want = o.order, have = new Map(x.d.cards.map((c) => [keyOf(c), c]));
    if (want.length !== have.size || new Set(want).size !== want.length || want.some((k) => !have.has(k)))
      fail(id + ": hindi-order.json does not list exactly this deck's notes (run hindi-order.js): " +
        want.filter((k) => !have.has(k)).concat([...have.keys()].filter((k) => !want.includes(k))).slice(0, 8).join(", "));
    x.d.cards = want.map((k) => have.get(k));
  } else if (x.d.meta.types.hindi) x.d.cards.sort((a, b) => p[keyOf(a)] - p[keyOf(b)]);
}

/* ---- 6. descriptions: the record's sentences, then every stated count -------------------------------- */
const count = (cards, re) => cards.filter((c) => re.test(c.fields.English)).length;
for (const x of DECKS) {
  const id = x.d.meta.id, m = x.d.meta, cards = x.d.cards, n = cards.length;
  // `{n}`, `{added}` and the order's `facts` ({head}, {days} …) are written into a replacement: no figure is typed
  const facts = Object.assign({ n, added: ((R.insert || {})[id] || []).length }, (ORDER[id] || {}).facts || {});
  for (const [find, rep0] of ((R.decks || {})[id] || {}).descSub || []) {
    const rep = rep0.replace(/\{([A-Za-z0-9]+)\}/g, (s, k) => (k in facts ? facts[k] : fail(id + ": descSub names the fact {" + k + "}, which hindi-order.json does not give")));
    if (m.desc.includes(rep)) continue;
    if (!m.desc.includes(find)) fail(id + ": descSub finds neither its text nor its replacement: " + find.slice(0, 70));
    m.desc = m.desc.replace(find, rep);
  }
  const sub = (re, fn, what) => { if (!re.test(m.desc)) fail(id + ": the description no longer states " + what); m.desc = m.desc.replace(re, fn); };
  if (id === "hiabc") {
    // alphabet.py writes this deck's subtitle and description whole, counts and pace included
  } else if (id === "hiphrase") {
    const by = (s) => cards.filter((c) => c.sub === s).length, ex = (k) => cards.filter((c) => (c.fields.Examples.match(EX_ITEM) || []).length >= k).length;
    m.subtitle = n + " expressions · " + by("Phrases") + " everyday, " + by("Idioms") + " idioms, " + by("Proverbs") + " proverbs · both directions";
    sub(/^\d+ Hindi set phrases, idioms and proverbs, in three subdecks: \d+ everyday phrases, \d+ idioms and \d+ proverbs/,
      n + " Hindi set phrases, idioms and proverbs, in three subdecks: " + by("Phrases") + " everyday phrases, " + by("Idioms") + " idioms and " + by("Proverbs") + " proverbs", "its three counts");
    sub(/Real example sentences come with \d+ of the \d+ expressions, three apiece for \d+/, "Real example sentences come with " + ex(1) + " of the " + n + " expressions, three apiece for " + ex(3), "its sentences");
  } else {
    const ex = (k) => cards.filter((c) => (c.fields.Examples.match(EX_ITEM) || []).length >= k).length;
    const first = (c) => (/^<div class="uc-sense"><div class="uc-pos">([^<]*)</.exec(c.fields.English) || [])[1] || "";
    const nouns = cards.filter((c) => /^noun/.test(first(c))).length, verbs = cards.filter((c) => /^verb/.test(first(c))).length;
    m.subtitle = n + " words · both directions, as two cards per word";
    sub(/\b\d+ words for (a|an) /, (s, a) => n + " words for " + a + " ", "its size");
    sub(/The \d+ nouns show/, "The " + nouns + " nouns show", "its nouns");
    sub(/the \d+ verbs show/, "the " + verbs + " verbs show", "its verbs");
    if (ex(3) === n) { if (!/Every word carries three real example sentences/.test(m.desc)) fail(id + ": sentence count"); }
    else sub(/Real example sentences come with \d+ of the \d+ words, three apiece for \d+ of them/, "Real example sentences come with " + ex(1) + " of the " + n + " words, three apiece for " + ex(3) + " of them", "its sentences");
    // "X of the N come from a vocabulary … and the other Y are …": the two must make the deck, with what the record adds
    const sp = /(\d+) of the (\d+) come from a vocabulary written for the level's scope[^]*? and the other (\d+) are the commonest remaining words/.exec(m.desc);
    const added = /and (\d+) more were added in November 2026/.exec(m.desc);
    if (!sp || Number(sp[1]) + Number(sp[3]) + (added ? Number(added[1]) : 0) !== n || Number(sp[2]) !== n)
      fail(id + ": the description's inventory and frequency counts do not make " + n + " (edit its descSub)");
  }
}

/* ---- write, or check -------------------------------------------------------------------------------- */
let changed = 0;
for (const x of DECKS) {
  const out = JSON.stringify(x.d);
  if (out === JSON.stringify(JSON.parse(x.text))) continue;
  changed++;
  if (CHECK) console.error("FAIL  " + x.f + " is not what the record, the order and the pin give (run hindi-fix.js)");
  else { fs.writeFileSync(path.join(DIR, x.f), out); console.log("wrote " + x.f + " (" + x.d.cards.length + " notes)"); }
}
if (pinChanged) { if (CHECK) { console.error("FAIL  hindi-ids.json lacks rows the decks need"); changed++; } else writePin(PIN); }
const rows = DECKS.reduce((a, x) => a + Object.keys(PIN[x.d.meta.id]).length, 0), ret = Object.values(PIN._retired).reduce((a, o) => a + Object.keys(o).length, 0);
if (CHECK && changed) process.exit(1);
console.log((CHECK ? "ok    " : "") + "hindi-fix: " + DECKS.length + " decks, " + rows + " pinned notes, " + ret + " retired" + (CHECK ? "" : ", " + changed + " file(s) written, " + log.length + " change(s)"));
