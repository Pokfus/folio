#!/usr/bin/env node
"use strict";
/*
  italian-fix.js — THE ONE WAY AN ITALIAN (CILS) DECK IS HAND-EDITED, ORDERED AND NUMBERED (Nov 2026, the
  Italian beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/italian-fix.js [--check] [--verbose]
    node .claude/decks/italian-fix.js --seed-ids      # write italian-ids.json (refused once it exists)

  WHY IT EXISTS BESIDE `paradigm-fix.js`. The Italian decks can be rebuilt (`.claude/cils/`, Python, about
  a gigabyte of live corpora), so a hand edit made in a deck file lasts until the next `run.py`. Until this
  pass the only record the Italian decks had was `paradigm-fixes.json`, which they share with the French
  and Portuguese decks and which does one thing: fold the forms of an article, a possessive or a pronoun
  into one card. It has no notion of a card the word list lacks, of a card that belongs in a lower deck, of
  an order, or of a pinned id — and giving it those would have put two other languages' decks under rules
  nobody has measured for them. So the paradigms stay where they are, and everything else is here.

  THE ORDER OF A REBUILD:   run.py --level <x>   →   paradigm-fix.js   →   italian-fix.js   →
  build-italian-sounds.js   →   .claude/build-lang-decks.js.   This file runs AFTER paradigm-fix.js and keys
  every note by the headword that file leaves (`il, la`, not `la`). It never rebuilds a field
  paradigm-fixes.json rebuilds: the run fails if the two records name one note's field. IT NEVER WRITES
  paradigm-fixes.json OR paradigm-fix.js, which the French and Portuguese decks share: everything Italian
  that is not a folded paradigm is in this record.

  WHICH DECKS. Every deck in `decks/` whose file name has "Italian" in it and whose card type is `cils`
  — by CARD TYPE, never by a file-name prefix: the six CILS bands, the core vocabulary and the phrases.
  An Italian deck of another type (the sounds deck `build-italian-sounds.js` writes) is not edited here
  and is still held to its pinned ids.

  THE FILE IS THE RECORD: `italian-fixes.json`.

  `insert`  `{ <deck id>: [entry, …] }` — a card the deck's word list has not got. An entry carries `word`
      (the headword, the pin's key), `id` (the number in its card id, above every number the generator
      has dealt so a rebuild cannot mint it) and a `why` that names where every part came from. Its
      content is one of two things:
        · `fields`, the six fields of a card MOVED from another deck, copied byte for byte on the day of
          the move (`from` names the deck and headword). The moved card is taken out of its old deck by
          that deck's `dropDup`, and its old number goes to `_retired`.
        · `italian` / `senses` / `forms` / `ex`, for a card nothing carded: the meanings are the English
          Wiktionary's (kaikki.org), each sentence a Tatoeba sentence named by id in `src`.
      Both may be given: `senses`, `forms` and `ex` then replace that field of the moved card.
      `senses` is `[[pos, [gloss, …]], …]`, `forms` `[[label, value], …]`, `ex` `[[italian, english,
      src, [bold, …]], …]`; every word in the bold list (default: the headword's own words) is bolded on
      boundaries that understand accents, and a sentence in which none is found is an error.

  `notes`  `{ "<deck id>/<headword>": { senses?, forms?, ex?, why } }` — the same three fields, rebuilt on
      a card the generator wrote. A note that matches nothing is an ERROR. `word` (with `italian`, the
      headword's markup) RENAMES the note: it is then found by its key or by its new headword, and the
      pin's key is renamed with it, the number staying as it is.

  `decks`  `{ <deck id>: { dropDup?, subtitle?, descSub? } }`.
      `dropDup` is `{ headword: lowerDeckId }`: DELETE this deck's card for a word a lower deck now
      carries. The claim is CHECKED — the named deck must hold a card whose headword names that word —
      so this can never delete a word nothing else teaches. A card already gone is normal.
      `dropForm` is `{ headword: "<deck id>/<headword>" }`: DELETE this deck's card for a word that is only
      a FORM of the card named, in this deck or a lower one — patetica beside patetico. The claim is
      CHECKED the way paradigm-fix.js checks its own `drop`: the named card must show the word in its
      headword or in its Forms row. (It is here, and not a `drop` in paradigm-fixes.json, because that
      record is shared with the French and Portuguese decks.)
      `subtitle` is set outright. `descSub` is `[find, replace]` pairs over the description, each satisfied
      if its replacement already stands in the text or if it matched; one satisfied by neither is an error.
      To reword a replacement that has shipped, add a pair after it whose `find` is the old replacement,
      so the chain still works on a deck freshly rebuilt.

  THE COUNTS IN A DESCRIPTION ARE RECOUNTED, not carried: how many words, nouns with an article, plurals,
  feminines, verbs, verbs taking essere, adjectives with their forms and cards with sentences. They are
  counted off the cards by the formulas `.claude/cils/emit.py` uses and written into the sentences that
  file composes, so a deck that gains or loses a card goes on describing itself truly.

  `italian-order.json`  `{ <deck id>: { why, order: [headword, …] } }`, written by italian-order.js (its
      header has the rules) and applied LAST: the notes are put in that order and nothing else about them
      moves. A list that is not exactly the deck's headwords is refused. A deck with no entry is put in the
      order of its pinned numbers, which is the order the generator dealt it in.

  `italian-ids.json`  `{ <deck id>: { <headword>: N } }` for the note id `u_<deck id>_N`, seeded from the
      decks as shipped on 2026-11-16. A NOTE HERE IS ONE NOTE WITH TWO CARD TEMPLATES, so both of a word's
      cards hang off this one id and pinning the note pins both schedules. THE PIN IS APPLIED, NOT ONLY
      CHECKED: the generator numbers a deck by position and the Update press merges a reader's progress
      by id, so after a rebuild every note is given back the number its headword is pinned to. A note
      with no row takes its insert's `id`, or failing that the next free number, and gains a row (under
      `--check` that is a failure). A row is never deleted: a note a record removes (`dropDup` or `dropForm` here, a
      `fold` or `drop` in paradigm-fixes.json) moves to `_retired`, so its number is never dealt to another
      word. A pinned note that is missing for any other reason fails the run.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const FIXES = path.join(HERE, "italian-fixes.json"), IDS_FILE = path.join(HERE, "italian-ids.json");
const ORDER_FILE = path.join(HERE, "italian-order.json"), PARADIGM = path.join(HERE, "paradigm-fixes.json");
const argv = process.argv.slice(2);
const CHECK = argv.includes("--check"), VERBOSE = argv.includes("--verbose"), SEED = argv.includes("--seed-ids");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const writePin = (pin) => fs.writeFileSync(IDS_FILE, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n");

/* THE ITALIAN DECKS. The file name only narrows what is parsed (decks/ holds 180 MB); what makes a deck
   this record's is the `cils` type its cards are written in. */
const ITALIAN = fs.readdirSync(DIR).filter((x) => /Italian/.test(x) && /\.folio-deck\.json$/.test(x)).sort()
  .map((f) => { const text = fs.readFileSync(path.join(DIR, f), "utf8"); return { f, text, d: JSON.parse(text) }; });
const isCils = (d) => !!(d.meta && d.meta.types && d.meta.types.cils);
const CILS = ITALIAN.filter((x) => isCils(x.d));
const byId = new Map(CILS.map((x) => [x.d.meta.id, x]));
const numOf = (c, id) => { const m = /^u_([a-z0-9]+)_(\d+)$/.exec(c.id); return m && m[1] === id ? Number(m[2]) : NaN; };

if (SEED) {
  if (fs.existsSync(IDS_FILE)) fail("italian-ids.json exists — a pin is seeded once and never re-seeded");
  const out = { _: "italian-ids.json — the number in each Italian note's id, pinned to its note: <deck id> → <headword> (a sounds-deck row's key) → N, for the id u_<deck id>_N. A note of these decks is one note with two card templates, so both of a word's cards hang off this number. Seeded from the decks as shipped on 2026-11-16 and APPLIED by italian-fix.js: a rebuilt deck, which the generator numbers by position, is numbered back. NEVER delete or renumber a row — the Update press merges a reader's progress by id. A note a record removes moves to _retired; a new note takes the next free number; a rename renames the key." };
  for (const { d } of CILS) {
    const id = d.meta.id, pin = {};
    for (const c of d.cards) {
      const n = numOf(c, id), k = c.fields.Word;
      if (!Number.isFinite(n)) fail(id + ": unexpected card id " + c.id);
      if (k in pin) fail(id + ": two notes share the headword " + k);
      pin[k] = n;
    }
    out[id] = pin;
  }
  out._retired = {};
  writePin(out);
  console.log("seeded italian-ids.json: " + CILS.map(({ d }) => d.meta.id + " " + d.cards.length).join(", "));
  process.exit(0);
}

if (!fs.existsSync(IDS_FILE)) fail("no italian-ids.json — run --seed-ids first");
const PIN = readJson(IDS_FILE), PIN_BEFORE = JSON.stringify(PIN);
const REC = fs.existsSync(FIXES) ? readJson(FIXES) : {};
const ORD = fs.existsSync(ORDER_FILE) ? readJson(ORDER_FILE) : {};
const PAR = fs.existsSync(PARADIGM) ? readJson(PARADIGM) : {};
const errors = [], said = [];

/* ---------- the generator's own markup (emit.py, build_deck.py): apostrophes are &#x27; ---------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#x27;");
const escAttr = (s) => esc(s).replace(/"/g, "&quot;");
const strip = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const glossHtml = (gls) => gls.length === 1 ? '<div class="uc-gl">' + esc(gls[0]) + "</div>"
  : '<ul class="uc-gls">' + gls.map((g) => "<li>" + esc(g) + "</li>").join("") + "</ul>";
/* one sense as the generator writes it (no wrapper), several as paradigm-fix.js writes them (`uc-sense`) */
const renderSenses = (senses) => senses.length === 1
  ? '<div class="uc-pos">' + esc(senses[0][0]) + "</div>" + glossHtml(senses[0][1])
  : senses.map(([pos, gls]) => '<div class="uc-sense"><div class="uc-pos">' + esc(pos) + "</div>" + glossHtml(gls) + "</div>").join("");
const renderForms = (forms) => !forms.length ? "" : '<div class="uc-forms">' + forms.map(([l, v]) =>
  '<span class="uc-fi"><span class="uc-fl">' + esc(l) + "</span>" + esc(v) + "</span>").join("") + "</div>";
function boldSentence(sent, words) {
  const alts = [...words].sort((a, b) => b.length - a.length).map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + (/['’]$/.test(w) ? "" : "(?![\\p{L}\\p{M}])"));
  const re = new RegExp("(?<![\\p{L}\\p{M}])(?:" + alts.join("|") + ")", "giu");
  let out = "", at = 0, m, hits = 0;
  while ((m = re.exec(sent))) { out += esc(sent.slice(at, m.index)) + "<b>" + esc(m[0]) + "</b>"; at = m.index + m[0].length; hits++; }
  return { html: out + esc(sent.slice(at)), hits };
}
function renderEx(ex, head, key) {
  const own = head.split(/,\s*/).map((w) => w.replace(/^(?:il|lo|la|i|gli|le)\s+|^l'/i, ""));
  return ex.map(([it, en, src, bold]) => {
    if (!src || !String(src).trim()) errors.push(key + ": the sentence “" + it + "” names no source");
    if (!en || !String(en).trim()) errors.push(key + ": the sentence “" + it + "” has no translation");
    const b = boldSentence(it, bold && bold.length ? bold : own);
    if (!b.hits) errors.push(key + ": no form of the headword in the sentence “" + it + "”");
    return '<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="' + escAttr(it) + '"></span>'
      + b.html + '</div><div class="uc-exe">' + esc(en) + "</div></div>";
  }).join("");
}
const FIELDS = ["Italian", "Word", "English", "Forms", "Conjugation", "Examples"];
function applyFields(card, e, key) {
  const f = card.fields;
  if (e.italian !== undefined) f.Italian = e.italian;
  if (e.senses) f.English = renderSenses(e.senses);
  if (e.forms) f.Forms = renderForms(e.forms);
  if (e.ex) f.Examples = renderEx(e.ex, f.Word, key);
}

/* ---------- what paradigm-fixes.json removes and rebuilds, so the two records cannot fight ---------- */
const parGone = new Map(), parOwns = new Map();   // deck id → Set(headword); "<deck>/<head>" → Set(field)
const gone = (id, w) => (parGone.get(id) || parGone.set(id, new Set()).get(id)).add(w);
for (const [k, fix] of Object.entries(PAR.notes || {})) {
  const i = k.indexOf("/"), id = k.slice(0, i), old = k.slice(i + 1), head = fix.head || old;
  (fix.fold || []).forEach((w) => gone(id, w));
  if (head !== old) gone(id, old);
  const owns = new Set(); if (fix.senses) owns.add("senses"); if (fix.forms) owns.add("forms"); if (fix.ex) owns.add("ex");
  parOwns.set(id + "/" + head, owns);
}
for (const k of Object.keys(PAR.drop || {})) { const i = k.indexOf("/"); gone(k.slice(0, i), k.slice(i + 1)); }

/* ---------- the counts a description states, by emit.py's formulas ---------- */
function recount(d) {
  const cards = d.cards, n = cards.length, m = d.meta;
  const isPos = (c, name) => c.fields.English.includes('<div class="uc-pos">' + name);
  const nouns = cards.filter((c) => isPos(c, "noun")), adj = cards.filter((c) => isPos(c, "adjective"));
  const arts = cards.filter((c) => c.fields.Italian.includes("uc-art")).length;
  const plurals = nouns.filter((c) => c.fields.Forms.includes(">plural<")).length;
  const fems = nouns.filter((c) => c.fields.Forms.includes(">feminine<")).length;
  const verbs = cards.filter((c) => c.fields.Conjugation.includes("Passato prossimo")).length;
  const ess = cards.filter((c) => c.fields.Conjugation.includes('ausiliare</span><span class="uc-cj-f">essere')).length;
  const adjforms = adj.filter((c) => c.fields.Forms).length;
  const ex3 = cards.filter((c) => (c.fields.Examples.match(/uc-exi/g) || []).length >= 3).length;
  const ex0 = cards.filter((c) => !c.fields.Examples).length;
  const sub = (re, to) => { m.desc = m.desc.replace(re, to); };
  m.subtitle = m.subtitle.replace(/^\d+(?= (?:words|expressions)\b)/, String(n));
  sub(/\b\d+(?= Italian (?:words, for anyone|expressions — the layer))/, String(n));
  sub(/(learnt with the word \()\d+(?= of them\))/, "$1" + arts);
  sub(/(comes with its own article \()\d+(?= of them\))/, "$1" + plurals);
  sub(/(its feminine is shown \()\d+(?=\))/, "$1" + fems);
  sub(/(Each of the )\d+(?= verbs carries)/, "$1" + verbs);
  sub(/\(\d+(?= of them take essere\))/, "(" + ess);
  sub(/\(\d+ of the \d+(?= of them\), since an Italian adjective)/, "(" + adjforms + " of the " + adj.length);
  const exNote = ex3 === n ? "Every word also carries three real example sentences"
    : "Real example sentences come with " + (n - ex0) + " of the " + n + " words, three apiece for " + ex3 + " of them and one or two for the rest"
      + (ex0 ? "; the sentence corpus has nothing at all for the other " + ex0 + ", which are kept because the word list is what it is and not what the corpus can illustrate" : "");
  sub(/(?:Every word also carries three real example sentences|Real example sentences come with \d+ of the \d+ words, three apiece for \d+ of them and one or two for the rest(?:; the sentence corpus has nothing at all for the other \d+, which are kept because the word list is what it is and not what the corpus can illustrate)?)/, exNote);
}

/* ---------- apply ---------- */
const order = ["cilsa1", "cilsa2", "cilsb1", "cilsb2", "cilsc1", "cilsc2", "itcore", "itphrase"].filter((id) => byId.has(id))
  .concat([...byId.keys()].filter((id) => !/^(cils[abc][12]|itcore|itphrase)$/.test(id)));
const noteFix = new Map(), seenNote = new Set();
for (const [k, fix] of Object.entries(REC.notes || {})) {
  const i = k.indexOf("/"), id = k.slice(0, i);
  if (!byId.has(id)) { errors.push(k + ": no cils deck has the id " + id); continue; }
  const owns = parOwns.get(k) || new Set();
  for (const fld of ["senses", "forms", "ex"]) if (fix[fld] && owns.has(fld)) errors.push(k + ": paradigm-fixes.json rebuilds this note's " + fld + " — edit it there");
  (noteFix.get(id) || noteFix.set(id, []).get(id)).push([k.slice(i + 1), fix, k]);
}
for (const id of Object.keys(REC.insert || {})) if (!byId.has(id)) errors.push("insert: no cils deck has the id " + id);
for (const id of Object.keys(REC.decks || {})) if (!byId.has(id)) errors.push("decks: no cils deck has the id " + id);
const bare = (w) => w.replace(/^(?:il|lo|la|i|gli|le)\s+|^l'/i, "").toLowerCase();
const teaches = (d, head) => { const want = bare(head); return d.cards.some((c) => c.fields.Word.split(/,\s*/).some((w) => bare(w) === want)); };
const dropped = new Map();   // deck id → Set(headword) this record removed

for (const id of order) {
  const { d } = byId.get(id), dm = (REC.decks || {})[id] || {};
  // 1. inserts, so that a higher deck's dropDup can see what this one now carries
  for (const e of (REC.insert || {})[id] || []) {
    const key = id + "/" + e.word + " (insert)";
    if (!e.word || !Number.isInteger(e.id) || !e.why) { errors.push(key + ": an insert needs word, id and why"); continue; }
    const cid = "u_" + id + "_" + e.id;
    const clash = d.cards.find((c) => c.fields.Word === e.word && c.id !== cid && numOf(c, id) !== (PIN[id] || {})[e.word]);
    if (clash) { errors.push(key + ": the deck already cards that headword as " + clash.id); continue; }
    let card = d.cards.find((c) => c.fields.Word === e.word);
    if (!card) { card = { sub: "", fields: {}, id: cid, type: "cils" }; d.cards.push(card); }
    if (e.fields) { for (const f of FIELDS) if (typeof e.fields[f] !== "string") errors.push(key + ": fields lacks " + f); card.fields = Object.assign({}, e.fields); }
    else card.fields = { Italian: e.italian || '<div class="uc-word">' + esc(e.word) + "</div>", Word: e.word, English: "", Forms: "", Conjugation: "", Examples: "" };
    if (card.fields.Word !== e.word) errors.push(key + ": fields.Word is " + card.fields.Word);
    applyFields(card, e, key);
    if (!card.fields.English) errors.push(key + ": no meaning");
  }
  // 2. cards a lower deck now carries
  const lost = new Set();
  for (const [head, lower] of Object.entries(dm.dropDup || {})) {
    const lf = byId.get(lower);
    if (!lf || order.indexOf(lower) >= order.indexOf(id)) { errors.push(id + " → dropDup " + head + ": " + lower + " is not a lower deck"); continue; }
    if (!teaches(lf.d, head)) { errors.push(id + " → dropDup " + head + ": " + lower + " does not carry it"); continue; }
    lost.add(head);
    const before = d.cards.length;
    d.cards = d.cards.filter((c) => c.fields.Word !== head);
    if (before === d.cards.length && VERBOSE) said.push(id + " → dropDup " + head + ": already gone");
  }
  for (const [head, by] of Object.entries(dm.dropForm || {})) {
    const i = by.indexOf("/"), tDeck = by.slice(0, i), tHead = by.slice(i + 1), tf = byId.get(tDeck);
    if (!tf || order.indexOf(tDeck) > order.indexOf(id)) { errors.push(id + " → dropForm " + head + ": " + tDeck + " is not this deck or a lower one"); continue; }
    const t = tf.d.cards.find((c) => c.fields.Word === tHead);
    if (!t) { errors.push(id + " → dropForm " + head + ": " + by + " names no note"); continue; }
    if (!(t.fields.Word + " " + strip(t.fields.Forms)).split(/[\s,;:\/]+/).includes(head)) { errors.push(id + " → dropForm " + head + ": " + by + " does not show it in its headword or Forms"); continue; }
    if (head === tHead && tDeck === id) { errors.push(id + " → dropForm " + head + ": a note cannot be a form of itself"); continue; }
    lost.add(head);
    const before = d.cards.length;
    d.cards = d.cards.filter((c) => c.fields.Word !== head);
    if (before === d.cards.length && VERBOSE) said.push(id + " → dropForm " + head + ": already gone");
  }
  dropped.set(id, lost);
  // 3. fields rebuilt on a card the generator wrote
  for (const [head, fix, key] of noteFix.get(id) || []) {
    const card = d.cards.find((c) => c.fields.Word === head) || (fix.word && d.cards.find((c) => c.fields.Word === fix.word));
    if (!card) { errors.push(key + ": no note carries that headword" + (fix.word ? " or " + fix.word : "")); continue; }
    if (!fix.why) errors.push(key + ": no why");
    seenNote.add(key);
    if (fix.word && card.fields.Word !== fix.word) {   // a RENAME: the pin's key is renamed with it, the number staying as it is
      const pin0 = PIN[id] || {};
      if (head in pin0 && fix.word in pin0) { errors.push(key + ": both " + head + " and " + fix.word + " are pinned"); continue; }
      if (head in pin0) { pin0[fix.word] = pin0[head]; delete pin0[head]; }   // else the pin was renamed on an earlier run
      card.fields.Word = fix.word;
    }
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
  // 5. the pinned ids
  const pin = PIN[id] || (PIN[id] = {}), ret = (PIN._retired = PIN._retired || {}), retired = ret[id] || {};
  const have = new Set(d.cards.map((c) => c.fields.Word)), parLost = parGone.get(id) || new Set();
  for (const head of Object.keys(pin)) {
    if (have.has(head)) continue;
    if (lost.has(head) || parLost.has(head)) { (ret[id] = retired)[head] = pin[head]; delete pin[head]; }
    else errors.push(id + ": the pinned note “" + head + "” (" + pin[head] + ") is not in the deck and no record removes it");
  }
  const used = new Set(Object.values(pin).concat(Object.values(retired)));
  const insId = new Map(((REC.insert || {})[id] || []).map((e) => [e.word, e.id]));
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
  // 6. the order, last: the record's, else the pinned numbers (the order the generator dealt)
  const byHead = new Map(d.cards.map((c) => [c.fields.Word, c]));
  if (ORD[id]) {
    const list = ORD[id].order || [];
    const extra = list.filter((h) => !byHead.has(h)), lack = [...byHead.keys()].filter((h) => !list.includes(h));
    if (extra.length || lack.length || new Set(list).size !== list.length)
      errors.push(id + ": italian-order.json is not exactly the deck's headwords (not in the deck: " + (extra.slice(0, 5).join(", ") || "none")
        + "; not in the list: " + (lack.slice(0, 5).join(", ") || "none") + ") — run italian-order.js");
    else d.cards = list.map((h) => byHead.get(h));
  } else if (!(REC.keepFileOrder || []).includes(id)) {
    d.cards = d.cards.map((c, i) => [c, i]).sort((a, b) => pin[a[0].fields.Word] - pin[b[0].fields.Word] || a[1] - b[1]).map((x) => x[0]);
  }
}
for (const [id, list] of noteFix) for (const [, , key] of list) if (!seenNote.has(key) && !errors.some((e) => e.startsWith(key))) errors.push(key + ": not applied");

/* ---------- an Italian deck of another type is held to its pinned ids and nothing else ---------- */
for (const { f, d } of ITALIAN) {
  if (isCils(d)) continue;
  const id = d.meta.id, pin = PIN[id];
  if (!pin) { errors.push(f + ": no rows in italian-ids.json for " + id); continue; }
  for (const c of d.cards) if (c.id !== "u_" + id + "_" + pin[c.key]) errors.push(f + ": " + c.id + " is not the id its key “" + c.key + "” is pinned to");
}

if (errors.length) { errors.forEach((e) => console.error("ERROR " + e)); process.exit(1); }
let changed = 0;
for (const { f, text, d } of CILS) {
  const out = JSON.stringify(d);
  if (out === text) continue;
  changed++;
  console.log((CHECK ? "WOULD CHANGE " : "wrote ") + f + "  " + JSON.parse(text).cards.length + " → " + d.cards.length + " notes");
  if (!CHECK) fs.writeFileSync(path.join(DIR, f), out);
}
const pinChanged = JSON.stringify(PIN) !== PIN_BEFORE;
if (pinChanged) { console.log(CHECK ? "italian-ids.json WOULD CHANGE" : "italian-ids.json: rows written"); if (!CHECK) writePin(PIN); }
said.forEach((s) => console.log("  " + s));
const nIns = Object.values(REC.insert || {}).reduce((a, b) => a + b.length, 0);
console.log(nIns + " inserts, " + Object.keys(REC.notes || {}).length + " note fixes, " + Object.keys(ORD).filter((k) => k !== "_").length + " orders, "
  + Object.keys(PIN).filter((k) => !k.startsWith("_")).reduce((a, k) => a + Object.keys(PIN[k]).length, 0) + " pinned ids, "
  + Object.values(PIN._retired || {}).reduce((a, b) => a + Object.keys(b).length, 0) + " retired");
if (changed || pinChanged) {
  if (CHECK) { console.log("\nFAIL  the Italian decks are out of step with the record — run node .claude/decks/italian-fix.js"); process.exit(1); }
  console.log("now run node .claude/decks/build-italian-sounds.js and node .claude/build-lang-decks.js");
} else console.log("all Italian decks match the record, the order and the pinned ids");
