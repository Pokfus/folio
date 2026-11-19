#!/usr/bin/env node
"use strict";
/*
  russian-fix.js — THE ONE WAY A RUSSIAN (`torfl`) DECK IS HAND-EDITED, ORDERED AND NUMBERED (Nov 2026, the
  Russian beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/russian-fix.js [--check] [--verbose]
    node .claude/decks/russian-fix.js --seed-ids      # write russian-ids.json (refused once it exists)

  WHY IT EXISTS. `.claude/torfl/run.py` writes the six TORFL levels and the phrases from 1.3 GB of live
  corpora, and A REBUILD IS NOT BYTE FOR BYTE: measured on 2026-11-19 with a fresh fetch, `--level a1` gave
  the same 500 words with three notes' sentences changed and FOUR NOTES IN ANOTHER POSITION — and every id
  was the note's position, so four words would have taken another word's schedule on the next Update press.
  A level is also cut against the shipped decks below it, so a change to A1 changes what a rebuild of A2
  to C2 selects. So the decks are edited HERE, and the ids are pinned. German's model (`german-fix.js`).

  NEVER run `run.py --level <x>` to "refresh" a deck. If a level is ever rebuilt on purpose:
    python3 .claude/torfl/run.py --level <x>  →  node .claude/decks/russian-fix.js  →
    node .claude/decks/russian-order.js  →  node .claude/decks/russian-fix.js  →
    node .claude/decks/build-russian-sounds.js  →  node .claude/build-lang-decks.js
  and expect the pin to FAIL on any headword the rebuild no longer chose: that is a decision, not a bug.

  WHICH DECKS. Every deck in `decks/` whose card type is `torfl` — by CARD TYPE, never by file name: the
  six levels and the phrases. A Russian deck of another type (the alphabet `ru-abc` and the sounds deck
  `rusound`, both written by `build-russian-sounds.js`) is not edited here and is still held to its pin.

  THE FILE IS THE RECORD: `russian-fixes.json`.

  `insert`  `{ <deck id>: [entry, …] }` — a card the deck's list has not got. An entry carries `word` (the
      `Word` field: the headword without stress marks, an aspect pair as `делать, сделать` — the pin's key),
      `id` (the number in its note id, above every number the generator dealt) and a `why` that names where
      every part came from. Its content is `fields`, the six fields of a card, of one of two origins:
        · MOVED from another deck, copied byte for byte on the day of the move (`from` names the deck and
          headword). The moved card is taken out of its old deck by that deck's `dropDup`, and its old
          number goes to `_retired`.
        · BUILT BY THE GENERATOR'S OWN STAGES for a named word (`python3 .claude/torfl/extra.py`, whose
          header has the rules): meanings, forms and stress the English Wiktionary's (kaikki.org), each
          sentence a Tatoeba sentence — `src` lists the Tatoeba ids, in the order of the sentences.
      `senses`, `forms`, `table`, `ex` (below) may be given too and then replace that field.

  `notes`  `{ "<deck id>/<Word>": { senses?, forms?, table?, tableFrom?, ex?, why } }` — a field rebuilt on
      a card the deck already has. A note that matches nothing is an ERROR.
        `senses`  `[[label, [gloss, …]], …]` — the English side, in the generator's own markup.
        `forms`   `[[label, value], …]` — the row beside the headword.
        `table`   `[[heading, [[label, value], …]], …]` — the All-forms panel.
        `tableFrom`  `"<deck id>/<Word>"` — the All-forms panel of that note, copied whole.
        `ex`      `[[russian, english, src, [bold, …]], …]` — every sentence names its source (a Tatoeba
                  id); each word of the bold list is bolded on letter boundaries, and a sentence in which
                  none is found is an error.
        `glossAdd`  one more line of meaning, put last in the card's first block and never twice (the
                  verbs of motion: which of the pair this is, and what the other one is).

  THE ANSWER IS NOT PRINTED ON ITS OWN QUESTION. The English side is the FRONT of the English → Russian
  card, and 21 of A1's cards printed their own Russian word in it, inside an example in brackets ("that (я
  знаю, что…, I know that…)", "since (+ genitive: с утра, since the morning)"). Every bracket of an English
  side that holds a form the card itself shows is wrapped in `<span class="uc-eg">`, and the card type's
  CSS (`EG_CSS`, kept at the end of the stylesheet) hides that span wherever the English side stands
  under "Say it in Russian"; the Russian → English card, where the bracket is the lesson, is untouched. Done on every run, to every
  `torfl` deck, and never twice.

  `decks`  `{ <deck id>: { dropDup?, subtitle?, descSub? } }`.
      `dropDup` is `{ Word: "<lower deck id>/<its Word>" }`: DELETE this deck's card for a word a lower deck
      carries. CHECKED — the named note must exist in a deck lower on the shelf — so this can never delete
      a word nothing else teaches. A card already gone is normal.
      `subtitle` is set outright. `descSub` is `[find, replace]` pairs over the description, each satisfied
      if its replacement already stands in the text or if it matched; one satisfied by neither is an error.

  THE COUNTS IN A DESCRIPTION ARE RECOUNTED, not carried: how many words, aspect pairs, nouns, set phrases
  and cards with sentences, by the formulas `.claude/torfl/emit.py` uses. A figure typed into a `descSub`
  (the pace, where a set begins) is held to the order by `russian-order.js`.

  `russian-order.json`  `{ <deck id>: { why, order: [Word, …] } }`, written by russian-order.js and applied
      LAST: the notes are put in that order and nothing else about them moves. A list that is not exactly
      the deck's headwords is refused. A deck with no entry is put in the order of its pinned numbers,
      which is the order it shipped in.

  `russian-ids.json`  `{ <deck id>: { <Word>: N } }` for the note id `u_<deck id>_N`, seeded on 2026-11-19
      from the eight decks as shipped. A NOTE IS ONE NOTE WITH TWO CARD TEMPLATES, so both of a word's cards
      hang off this one id (the English → Russian card is `<id>~2`) and pinning the note pins both
      schedules. THE PIN IS APPLIED, NOT ONLY CHECKED: after a rebuild every note is given back the number
      its headword is pinned to. A note with no row takes its insert's `id`, or failing that the next free
      number, and gains a row (under `--check` that is a failure). A row is never deleted: a note this
      record removes (`dropDup`) moves to `_retired`, so its number is never dealt to another word. A
      pinned note that is missing for any other reason fails the run.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const FIXES = path.join(HERE, "russian-fixes.json"), IDS_FILE = path.join(HERE, "russian-ids.json");
const ORDER_FILE = path.join(HERE, "russian-order.json");
const argv = process.argv.slice(2);
const CHECK = argv.includes("--check"), VERBOSE = argv.includes("--verbose"), SEED = argv.includes("--seed-ids");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const writePin = (pin) => fs.writeFileSync(IDS_FILE, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n");

/* THE RUSSIAN DECKS. The file name only narrows what is parsed (decks/ holds 180 MB); what makes a deck
   this record's is the `torfl` type its cards are written in. */
const RUSSIAN = fs.readdirSync(DIR).filter((x) => /Russian/.test(x) && /\.folio-deck\.json$/.test(x)).sort()
  .map((f) => { const text = fs.readFileSync(path.join(DIR, f), "utf8"); return { f, text, d: JSON.parse(text) }; });
const isTorfl = (d) => !!(d.meta && d.meta.types && d.meta.types.torfl);
const DECKS = RUSSIAN.filter((x) => isTorfl(x.d));
const byId = new Map(DECKS.map((x) => [x.d.meta.id, x]));
const numOf = (c, id) => { const m = /^u_([a-z0-9]+)_(\d+)$/.exec(c.id); return m && m[1] === id ? Number(m[2]) : NaN; };
/* what a note of another type is pinned by: its `key` (build-russian-sounds.js writes one), else its letter */
const keyOf = (c) => c.key || (c.fields && c.fields.Letter);

if (SEED) {
  if (fs.existsSync(IDS_FILE)) fail("russian-ids.json exists — a pin is seeded once and never re-seeded");
  const out = { _: "russian-ids.json — the number in each Russian note's id, pinned to its note: <deck id> → <Word field> (an alphabet or sounds row's key) → N, for the id u_<deck id>_N. A note of these decks is one note with two card templates (the second card is <id>~2), so this pins both schedules. APPLIED by russian-fix.js (the level decks and the phrases) and by build-russian-sounds.js (the alphabet and the sounds deck). NEVER delete or renumber a row: a removed note's row moves to _retired, a rename renames the key. Seeded 2026-11-19 from the eight decks as shipped." };
  for (const { d } of RUSSIAN) {
    const id = d.meta.id, pin = {};
    for (const c of d.cards) {
      const n = numOf(c, id), k = isTorfl(d) ? c.fields.Word : keyOf(c);
      if (!Number.isFinite(n)) fail(id + ": unexpected card id " + c.id);
      if (!k || k in pin) fail(id + ": two notes share the key " + k);
      pin[k] = n;
    }
    out[id] = pin;
  }
  out._retired = {};
  writePin(out);
  console.log("seeded russian-ids.json: " + RUSSIAN.map(({ d }) => d.meta.id + " " + d.cards.length).join(", "));
  process.exit(0);
}

if (!fs.existsSync(IDS_FILE)) fail("no russian-ids.json — run --seed-ids first");
const PIN = readJson(IDS_FILE), PIN_BEFORE = JSON.stringify(PIN);
const REC = fs.existsSync(FIXES) ? readJson(FIXES) : {};
const ORD = fs.existsSync(ORDER_FILE) ? readJson(ORDER_FILE) : {};
const errors = [], said = [];

/* ---------- the generator's own markup (build_deck.py: html.escape with quote=True) ---------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
const unesc = (s) => String(s).replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const bare = (s) => String(s).replace(/[́̀]/g, "");
const oneSense = ([lab, gl]) => '<div class="uc-pos">' + esc(lab) + "</div>" + (gl.length === 1 ? '<div class="uc-gl">' + esc(gl[0]) + "</div>"
  : '<ul class="uc-gls">' + gl.map((g) => "<li>" + esc(g) + "</li>").join("") + "</ul>");
const renderSenses = (senses) => senses.length === 1 ? oneSense(senses[0]) : senses.map((s) => '<div class="uc-sense">' + oneSense(s) + "</div>").join("");
const renderForms = (forms) => !forms.length ? "" : '<div class="uc-forms">' + forms.map(([l, v]) =>
  '<span class="uc-fi"><span class="uc-fl">' + esc(l) + "</span>" + esc(v) + "</span>").join("") + "</div>";
const renderTable = (table) => !table.length ? "" : '<div class="uc-cjg">' + table.map(([head, rows]) => '<div class="uc-cj"><div class="uc-cjh">' + esc(head) + "</div>"
  + rows.map(([p, v]) => '<div class="uc-cjr"><span class="uc-cj-p">' + esc(p) + '</span><span class="uc-cj-f">' + esc(v) + "</span></div>").join("") + "</div>").join("") + "</div>";
function boldSentence(sent, words) {
  const alts = [...words].sort((a, b) => b.length - a.length).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp("(?<![\\p{L}\\p{M}-])(?:" + alts.join("|") + ")(?![\\p{L}\\p{M}-])", "giu");
  let out = "", at = 0, m, hits = 0;
  while ((m = re.exec(sent))) { out += esc(sent.slice(at, m.index)) + "<b>" + esc(m[0]) + "</b>"; at = m.index + m[0].length; hits++; }
  return { html: (out + esc(sent.slice(at))).replace(/<\/b>(\s+)<b>/g, "$1"), hits };
}
function renderEx(ex, head, key) {
  const own = head.split(/,\s*/);
  return ex.map(([ru, en, src, bold]) => {
    if (!src || !String(src).trim()) errors.push(key + ": the sentence “" + ru + "” names no source");
    if (!en || !String(en).trim()) errors.push(key + ": the sentence “" + ru + "” has no translation");
    if (/[́̀]/.test(ru)) errors.push(key + ": a sentence is printed as it was written, without stress marks: “" + ru + "”");
    const b = boldSentence(ru, bold && bold.length ? bold : own);
    if (!b.hits) errors.push(key + ": no form of the headword in the sentence “" + ru + "”");
    return '<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="' + esc(ru) + '"></span>'
      + b.html + '</div><div class="uc-exe">' + esc(en) + "</div></div>";
  }).join("");
}
const FIELDS = ["Russian", "Word", "English", "Forms", "Table", "Examples"];
const findNote = (ref) => { const i = String(ref).indexOf("/"), x = byId.get(String(ref).slice(0, i)); return x && x.d.cards.find((c) => c.fields.Word === String(ref).slice(i + 1)); };
function applyFields(card, e, key) {
  const f = card.fields;
  if (e.russian !== undefined) {
    if (bare(e.russian) !== f.Word.replace(/, /g, " / ")) errors.push(key + ": `russian` is not the headword with its stress (" + e.russian + ")");
    f.Russian = '<div class="uc-word">' + esc(e.russian) + "</div>";
  }
  if (e.senses) f.English = renderSenses(e.senses);
  if (e.forms) f.Forms = renderForms(e.forms);
  if (e.table) f.Table = renderTable(e.table);
  if (e.tableFrom) { const src = findNote(e.tableFrom); if (!src) errors.push(key + ": tableFrom names no note: " + e.tableFrom); else f.Table = src.fields.Table; }
  if (e.ex) f.Examples = renderEx(e.ex, f.Word, key);
  if (e.glossAdd && !f.English.includes(esc(e.glossAdd))) {
    const li = "<li>" + esc(e.glossAdd) + "</li>";
    const one = /<div class="uc-gl">([\s\S]*?)<\/div>/.exec(f.English), many = f.English.indexOf("</ul>");
    if (many >= 0 && (!one || many < one.index)) f.English = f.English.slice(0, many) + li + f.English.slice(many);
    else if (one) f.English = f.English.slice(0, one.index) + '<ul class="uc-gls"><li>' + one[1] + "</li>" + li + "</ul>" + f.English.slice(one.index + one[0].length);
    else errors.push(key + ": glossAdd found no meaning to follow");
  }
}
/* every written form a card shows: its headword, its Forms row, every cell of its All-forms panel */
const fold = (s) => bare(s).toLowerCase().replace(/ё/g, "е");
const ruToks = (s) => fold(s).match(/[а-я]+(?:-[а-я]+)*/g) || [];
function formsOf(c) {
  const out = new Set();
  for (const t of ruToks(c.fields.Word)) out.add(t);
  for (const m of (c.fields.Russian + c.fields.Forms + c.fields.Table).matchAll(/>([^<>]+)</g)) for (const t of ruToks(m[1])) out.add(t);
  return out;
}
const EG_CSS = "\n/* a bracket that prints the card's own Russian word is not shown on the English → Russian card */\n.uc-ask + .uc-field .uc-eg {\n  display: none;\n}\n";
function wrapOwn(c) {
  const own = formsOf(c);
  c.fields.English = c.fields.English.replace(/(<span class="uc-eg">)?\(([^()<>]*)\)/g, (all, done, inner) =>
    done || !ruToks(unesc(inner)).some((t) => own.has(t)) ? all : '<span class="uc-eg">(' + inner + ")</span>");
}

/* ---------- the counts a description states, by emit.py's formulas ---------- */
function recount(d) {
  const cards = d.cards, n = cards.length, m = d.meta;
  const pairs = cards.filter((c) => c.fields.English.includes(">verb, imperfective / perfective<")).length;
  const nouns = cards.filter((c) => /^(?:<div class="uc-sense">)?<div class="uc-pos">(?:idiom, )?noun\b/.test(c.fields.English)).length;
  const phr = cards.filter((c) => c.fields.Word.includes(" ") && !c.fields.Russian.includes(" / ")).length;
  const exn = (c) => (c.fields.Examples.match(/uc-exi/g) || []).length;
  const ex3 = cards.filter((c) => exn(c) === 3).length, ex0 = cards.filter((c) => exn(c) === 0).length;
  const sub = (re, to) => { m.desc = m.desc.replace(re, to); };
  m.subtitle = m.subtitle.replace(/^\d+(?= (?:words|phrases)\b)/, String(n));
  sub(/\b\d+(?= words for the )/, String(n));
  sub(/\b\d+(?= Russian set phrases, idioms and proverbs)/, String(n));
  sub(/\b\d+(?= of the verbs are taught as aspect pairs)/, String(pairs));
  sub(/(The )\d+(?= nouns show their gender)/, "$1" + nouns);
  sub(/\b\d+(?= of the entries are set phrases rather than single words)/, String(phr));
  const exNote = ex3 === n ? "Every word carries three real example sentences"
    : "Real example sentences come with " + (n - ex0) + " of the " + n + " words, three apiece for " + ex3 + " of them";
  sub(/Every word carries three real example sentences|Real example sentences come with \d+ of the \d+ words, three apiece for \d+ of them/, exNote);
  sub(/Real example sentences come with \d+ of the \d+ expressions, three apiece for \d+ of them/,
    "Real example sentences come with " + (n - ex0) + " of the " + n + " expressions, three apiece for " + ex3 + " of them");
}

/* ---------- apply ---------- */
const SHELF = ["torfla1", "torfla2", "torflb1", "torflb2", "torflc1", "torflc2", "ruphrase"];
const order = SHELF.filter((id) => byId.has(id)).concat([...byId.keys()].filter((id) => !SHELF.includes(id)));
const noteFix = new Map(), seenNote = new Set();
for (const [k, fix] of Object.entries(REC.notes || {})) {
  const i = k.indexOf("/"), id = k.slice(0, i);
  if (!byId.has(id)) { errors.push(k + ": no torfl deck has the id " + id); continue; }
  (noteFix.get(id) || noteFix.set(id, []).get(id)).push([k.slice(i + 1), fix, k]);
}
for (const id of Object.keys(REC.insert || {})) if (!byId.has(id)) errors.push("insert: no torfl deck has the id " + id);
for (const id of Object.keys(REC.decks || {})) if (!byId.has(id)) errors.push("decks: no torfl deck has the id " + id);

for (const id of order) {
  const { d } = byId.get(id), dm = (REC.decks || {})[id] || {};
  // 1. inserts, so that a higher deck's dropDup can see what this one now carries
  for (const e of (REC.insert || {})[id] || []) {
    const key = id + "/" + e.word + " (insert)";
    if (!e.word || !Number.isInteger(e.id) || !e.why || !e.fields) { errors.push(key + ": an insert needs word, id, why and fields"); continue; }
    if (!e.from && !e.src) { errors.push(key + ": an insert names where it came from: `from` (a moved card) or `src` (its Tatoeba ids)"); continue; }
    const cid = "u_" + id + "_" + e.id;
    const clash = d.cards.find((c) => c.fields.Word === e.word && c.id !== cid && numOf(c, id) !== (PIN[id] || {})[e.word]);
    if (clash) { errors.push(key + ": the deck already cards that headword as " + clash.id); continue; }
    let card = d.cards.find((c) => c.fields.Word === e.word);
    if (!card) { card = { sub: "", fields: {}, id: cid, type: "torfl" }; d.cards.push(card); }
    for (const f of FIELDS) if (typeof e.fields[f] !== "string") errors.push(key + ": fields lacks " + f);
    card.fields = Object.assign({}, e.fields);
    if (card.fields.Word !== e.word) errors.push(key + ": fields.Word is " + card.fields.Word);
    applyFields(card, e, key);
    if (!card.fields.English) errors.push(key + ": no meaning");
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
  // 3. fields rebuilt on a card the deck already has
  for (const [head, fix, key] of noteFix.get(id) || []) {
    const card = d.cards.find((c) => c.fields.Word === head);
    if (!card) { errors.push(key + ": no note carries that headword"); continue; }
    if (!fix.why) errors.push(key + ": no why");
    seenNote.add(key);
    applyFields(card, fix, key);
  }
  // 4. the deck's own words about itself
  if (dm.subtitle !== undefined) d.meta.subtitle = dm.subtitle;
  for (const [find, to] of dm.descSub || []) {
    if (d.meta.desc.includes(to)) continue;   // first, since a replacement may begin with the text it replaces
    if (d.meta.desc.includes(find)) d.meta.desc = d.meta.desc.split(find).join(to);
    else errors.push(id + " → descSub: neither “" + find.slice(0, 60) + "…” nor its replacement is in the description");
  }
  recount(d);
  for (const c of d.cards) wrapOwn(c);
  d.meta.types.torfl.css = d.meta.types.torfl.css.replace(/\n\/\* a bracket that prints the card's own Russian word[\s\S]*$/, "") + EG_CSS;
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
      errors.push(id + ": russian-order.json is not exactly the deck's headwords (not in the deck: " + (extra.slice(0, 5).join(", ") || "none")
        + "; not in the list: " + (lack.slice(0, 5).join(", ") || "none") + ") — run russian-order.js");
    else d.cards = list.map((h) => byHead.get(h));
  } else {
    d.cards = d.cards.map((c, i) => [c, i]).sort((a, b) => pin[a[0].fields.Word] - pin[b[0].fields.Word] || a[1] - b[1]).map((x) => x[0]);
  }
}
for (const [, list] of noteFix) for (const [, , key] of list) if (!seenNote.has(key) && !errors.some((e) => e.startsWith(key))) errors.push(key + ": not applied");

/* ---------- a Russian deck of another type is held to its pinned ids and nothing else ---------- */
for (const { f, d } of RUSSIAN) {
  if (isTorfl(d)) continue;
  const id = d.meta.id, pin = PIN[id];
  if (!pin) { errors.push(f + ": no rows in russian-ids.json for " + id); continue; }
  for (const c of d.cards) if (c.id !== "u_" + id + "_" + pin[keyOf(c)]) errors.push(f + ": " + c.id + " is not the id its key “" + keyOf(c) + "” is pinned to");
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
if (pinChanged) { console.log(CHECK ? "russian-ids.json WOULD CHANGE" : "russian-ids.json: rows written"); if (!CHECK) writePin(PIN); }
said.forEach((s) => console.log("  " + s));
const nIns = Object.values(REC.insert || {}).reduce((a, b) => a + b.length, 0);
console.log(nIns + " inserts, " + Object.keys(REC.notes || {}).length + " note fixes, " + Object.keys(ORD).filter((k) => k !== "_").length + " orders, "
  + Object.keys(PIN).filter((k) => !k.startsWith("_")).reduce((a, k) => a + Object.keys(PIN[k]).length, 0) + " pinned ids, "
  + Object.values(PIN._retired || {}).reduce((a, b) => a + Object.keys(b).length, 0) + " retired");
if (changed || pinChanged) {
  if (CHECK) { console.log("\nFAIL  the Russian decks are out of step with the record — run node .claude/decks/russian-fix.js"); process.exit(1); }
  console.log("now run node .claude/decks/build-russian-sounds.js and node .claude/build-lang-decks.js");
} else console.log("all Russian decks match the record, the order and the pinned ids");
