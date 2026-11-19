#!/usr/bin/env node
"use strict";
/*
  indonesian-fix.js — THE ONE WAY AN INDONESIAN (`ukbi`) DECK IS HAND-EDITED, ORDERED AND NUMBERED (Nov 2026,
  the Indonesian beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/indonesian-fix.js [--check] [--verbose]
    node .claude/decks/indonesian-fix.js --seed-ids      # write indonesian-ids.json (refused once it exists)

  WHY IT EXISTS. `.claude/ukbi/run.py` builds one level per run from five LIVE sources (the English Wiktionary
  via kaikki.org, Tatoeba, a subtitle frequency list, Global Voices), and a re-run is NOT byte for byte the
  shipped deck: on 2026-11-19, with everything fetched fresh (178 MB), level 1 came back with the same 500
  headwords, 29 of them in another position, 76 with other sentences, 14 with other meanings and 3 with
  another Forms row. Until this pass an edit to an Indonesian deck was an edit to the generator, and every
  note id was the note's position in the file. So every hand edit is here, and the ids are pinned.

  THE ORDER OF A REBUILD:   python3 .claude/ukbi/run.py --level N   →   node .claude/decks/indonesian-fix.js
  →   node .claude/decks/build-indonesian-sounds.js   →   node .claude/build-lang-decks.js.
  A LEVEL READS THE SHIPPED DECKS BELOW IT (`ukbi_level.words_below`), so a word this record adds to UKBI 1
  would be refused by a rebuild of every level above — and a word it moves down is still chosen by the level
  it left until that level is rebuilt. Rebuild a level only on purpose, read the diff, and run this after;
  never rebuild a higher level as a side effect of a change to a lower one. The pin makes a rebuilt level's
  notes keep their numbers; a headword the rebuild no longer chooses fails this script until its row is
  moved to `_retired` by a `dropDup` or by hand.

  WHICH DECKS. Every deck in `decks/` whose card type is `ukbi` — by CARD TYPE, never by file name: the seven
  UKBI levels and the phrases deck. The combined one-file deck (`ukbiall`, gitignored, written by
  `.claude/ukbi/combine.py`) is skipped: it is an artefact of the eight and takes their cards as they stand.
  An Indonesian deck of another type (the sounds deck `build-indonesian-sounds.js` writes) is not edited
  here and is still held to its pinned ids.

  THE FILE IS THE RECORD: `indonesian-fixes.json`.

  `insert`  `{ <deck id>: [entry, …] }` — a card the deck's word list has not got. An entry carries `word`
      (the headword, the pin's key), `id` (the number in its note id, above every number the generator has
      dealt so a rebuild cannot mint it) and a `why` that names where every part came from. Its content is
      one of two things:
        · `fields`, the five fields of a card MOVED from another deck, copied byte for byte on the day of
          the move (`from` names the deck and headword). The moved card is taken out of its old deck by
          that deck's `dropDup`, and its old number goes to `_retired`.
        · `senses` / `forms` / `ex`, for a card nothing carded: the meanings are the English Wiktionary's
          (kaikki.org), each sentence a Tatoeba sentence named by id in its `src`.
      Both may be given: `senses`, `forms` and `ex` then replace that field of the moved card.
      `senses` is `[[pos, [gloss, …]], …]`, `forms` `[[label, value], …]`, `ex` `[[indonesian, english, src,
      [bold, …]], …]`; every word in the bold list (default: the headword and the forms its row shows, each
      with or without -ku, -mu, -nya, -lah, -kah) is bolded on letter boundaries, and a sentence in which
      none is found is an error.

  `notes`  `{ "<deck id>/<headword>": { senses?, forms?, ex?, exDrop?, exAdd?, hint?, why } }` — the same
      fields, rebuilt on a card the deck already has. A note that matches nothing is an ERROR.
      `exDrop` is a list of sentences (their exact Indonesian text) to take off the card; `exAdd` a list of
      `ex` rows to put on it, FIRST, in the order given. `hint` is another headword of the same deck whose
      first meaning is the same: the part of speech of the first sense then reads `…, not <hint>`, which is
      what the generator itself writes when two English sides are identical (`.claude/dedupe-glosses.py`).

  `decks`  `{ <deck id>: { dropDup?, subtitle?, lead?, descSub? } }`.
      `dropDup` is `{ headword: "<lower deck id>/<its headword>" }`: DELETE this deck's card for a word a
      lower deck carries. The claim is CHECKED — the named note must exist in a deck lower on the shelf —
      so this can never delete a word nothing else teaches. A card already gone is normal.
      `subtitle` is set outright (its tokens filled). `descSub` is `[find, replace]` pairs over the
      description, each satisfied if its replacement already stands in the text or if it matched; one
      satisfied by neither is an error.
      `lead` is a paragraph put BEFORE the generator's own description, re-written on every run: whatever
      stands before the generator's opening words is replaced by it. Its figures are TOKENS, never typed:
        {notes} {days}            this deck's notes, and its days at five words a day (ten new cards)
        {first} {last}            the shelf days this deck begins and ends on, studied in the shelf's order
        {shelfNotes} {shelfDays} {shelfYears}   the eight decks together
        {start:<deck id>}         the shelf day another deck begins on
        {day:<headword>}          the day of THIS deck on which a headword's first card is dealt
        {inserted}                how many notes this record's `insert` gives the deck
        {n:<subdeck>}             how many of this deck's notes are filed in a subdeck
        {l1}                      how many of this deck's notes are written only with UKBI 1's words and forms
      A token that cannot be filled is an error.

  THE COUNTS IN A DESCRIPTION ARE RECOUNTED, not carried: how many words, how many show an affix family and
  a passive, how many are phrases and which four come first, how many carry sentences — by the formulas
  `.claude/ukbi/emit.py` and `emit_phrases.py` use, written into the sentences those files compose. A deck
  this record does not touch is still recounted: on 2026-11-19 every one of the eight overstated its cards
  with three sentences (UKBI 1 said 494 and had 434), a pass over the shelf having taken repeated sentences
  off the cards after the generator wrote the figure.

  `indonesian-order.json`  `{ <deck id>: { why, order: [headword, …] } }`, written by indonesian-order.js
      (its header has the rules) and applied LAST: the notes are put in that order and nothing else about
      them moves. A list that is not exactly the deck's headwords is refused. A deck with no entry is put in
      the order of its pinned numbers, which is the order it shipped in.

  `indonesian-ids.json`  `{ <deck id>: { <headword>: N } }` for the note id `u_<deck id>_N`, seeded on
      2026-11-19 from the eight decks as shipped. A NOTE HERE IS ONE NOTE WITH TWO CARD TEMPLATES, so both
      of a word's cards hang off this one id (the English → Indonesian card is `<id>~2`) and pinning the
      note pins both schedules. THE PIN IS APPLIED, NOT ONLY CHECKED: the generator numbers a deck by
      position and the Update press merges a reader's progress by id, so after a rebuild every note is given
      back the number its headword is pinned to. A note with no row takes its insert's `id`, or failing
      that the next free number, and gains a row (under `--check` that is a failure). A row is never
      deleted: a note this record removes (`dropDup`) moves to `_retired`, so its number is never dealt to
      another word. A pinned note that is missing for any other reason fails the run.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const FIXES = path.join(HERE, "indonesian-fixes.json"), IDS_FILE = path.join(HERE, "indonesian-ids.json");
const ORDER_FILE = path.join(HERE, "indonesian-order.json");
const argv = process.argv.slice(2);
const CHECK = argv.includes("--check"), VERBOSE = argv.includes("--verbose"), SEED = argv.includes("--seed-ids");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const writePin = (pin) => fs.writeFileSync(IDS_FILE, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n");

/* THE INDONESIAN DECKS. The file name only narrows what is parsed (decks/ holds 180 MB); what makes a deck
   this record's is the `ukbi` type its cards are written in. The shipped files are compact JSON, so
   "unchanged" is judged against the compact form of what was read (a file straight out of emit.py is not). */
const COMBINED = "ukbiall";
const INDO = fs.readdirSync(DIR).filter((x) => /UKBI|Indonesian/.test(x) && /\.folio-deck\.json$/.test(x)).sort()
  .map((f) => { const text = fs.readFileSync(path.join(DIR, f), "utf8"); return { f, text, d: JSON.parse(text) }; })
  .filter((x) => x.d.meta && x.d.meta.id !== COMBINED);
const isUkbi = (d) => !!(d.meta && d.meta.types && d.meta.types.ukbi);
const DECKS = INDO.filter((x) => isUkbi(x.d));
const byId = new Map(DECKS.map((x) => [x.d.meta.id, x]));
const numOf = (c, id) => { const m = /^u_([a-z0-9]+)_(\d+)$/.exec(c.id); return m && m[1] === id ? Number(m[2]) : NaN; };

if (SEED) {
  if (fs.existsSync(IDS_FILE)) fail("indonesian-ids.json exists — a pin is seeded once and never re-seeded");
  const out = { _: "indonesian-ids.json — the number in each Indonesian note's id, pinned to its note: <deck id> → <headword> (a sounds-deck row's key) → N, for the id u_<deck id>_N. A note of these decks is one note with two card templates, so both of a word's cards hang off this id (the English → Indonesian card is <id>~2). Seeded on 2026-11-19 from the eight decks as shipped; applied and extended by indonesian-fix.js and build-indonesian-sounds.js. NEVER delete or renumber a row: a removed note's row moves to _retired, a rename renames the key." };
  for (const { d } of DECKS) {
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
  console.log("seeded indonesian-ids.json: " + DECKS.map(({ d }) => d.meta.id + " " + d.cards.length).join(", "));
  process.exit(0);
}

if (!fs.existsSync(IDS_FILE)) fail("no indonesian-ids.json — run --seed-ids first");
const PIN = readJson(IDS_FILE), PIN_BEFORE = JSON.stringify(PIN);
const REC = fs.existsSync(FIXES) ? readJson(FIXES) : {};
const ORD = fs.existsSync(ORDER_FILE) ? readJson(ORDER_FILE) : {};
const errors = [], said = [];

/* ---------- the generator's own markup (build_deck.py: html.escape, so an apostrophe is &#x27;) ---------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
const unesc = (s) => String(s).replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const strip = (s) => unesc(String(s || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const glossHtml = (gls) => gls.length === 1 ? '<div class="uc-gl">' + esc(gls[0]) + "</div>"
  : '<ol class="uc-gls">' + gls.map((g) => "<li>" + esc(g) + "</li>").join("") + "</ol>";
const renderSenses = (senses) => senses.map(([pos, gls]) => '<div class="uc-sense"><div class="uc-pos">' + esc(pos) + "</div>" + glossHtml(gls) + "</div>").join("");
const renderWord = (w) => '<div class="uc-word">' + esc(w) + '<span class="uc-tts uc-say" data-say="' + esc(w) + '"></span></div>';
const renderForms = (forms, head) => !forms.length ? "" : '<div class="uc-forms">' + forms.map(([l, v]) =>
  '<span class="uc-fi' + (v === head ? " uc-fhead" : "") + '"><span class="uc-fl">' + esc(l) + "</span><b>" + esc(v) + "</b></span>").join("") + "</div>";
const formsOf = (c) => [...String(c.fields.Forms).matchAll(/<span class="uc-fl">([^<]*)<\/span><b>([^<]*)<\/b>/g)].map((m) => [unesc(m[1]), unesc(m[2])]);
const CLITIC = "(?:ku|mu|nya|lah|kah)?";
function boldSentence(sent, words) {
  const alts = [...words].sort((a, b) => b.length - a.length).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp("(?<![\\p{L}\\p{M}-])(?:" + alts.join("|") + ")" + CLITIC + "(?![\\p{L}\\p{M}-])", "giu");
  let out = "", at = 0, m, hits = 0;
  while ((m = re.exec(sent))) { out += esc(sent.slice(at, m.index)) + "<b>" + esc(m[0]) + "</b>"; at = m.index + m[0].length; hits++; }
  return { html: out + esc(sent.slice(at)), hits };
}
function renderEx(ex, card, key) {
  const own = [card.fields.Word].concat(formsOf(card).map((f) => f[1]));
  return ex.map(([id, en, src, bold]) => {
    if (!src || !String(src).trim()) errors.push(key + ": the sentence “" + id + "” names no source");
    if (!en || !String(en).trim()) errors.push(key + ": the sentence “" + id + "” has no translation");
    const b = boldSentence(id, bold && bold.length ? bold : own);
    if (!b.hits) errors.push(key + ": no form of the headword in the sentence “" + id + "”");
    return '<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="' + esc(id) + '"></span>'
      + b.html + '</div><div class="uc-exe">' + esc(en) + "</div></div>";
  });
}
const exUnits = (html) => String(html).match(/<div class="uc-exi">[\s\S]*?<\/div><\/div>/g) || [];
const sayOf = (unit) => unesc((/data-say="([^"]*)"/.exec(unit) || [])[1] || "");
const FIELDS = ["Indonesian", "Word", "English", "Forms", "Examples"];
const findNote = (ref) => { const i = String(ref).indexOf("/"), x = byId.get(String(ref).slice(0, i)); return x && x.d.cards.find((c) => c.fields.Word === String(ref).slice(i + 1)); };
function applyFields(card, e, key) {
  const f = card.fields;
  if (e.senses) f.English = renderSenses(e.senses);
  if (e.forms) f.Forms = renderForms(e.forms, f.Word);
  if (e.ex) f.Examples = renderEx(e.ex, card, key).join("");
  if (e.exDrop || e.exAdd) {
    let units = exUnits(f.Examples);
    const drop = new Set(e.exDrop || []), addSay = new Set((e.exAdd || []).map((x) => x[0]));
    units = units.filter((u) => !drop.has(sayOf(u)) && !addSay.has(sayOf(u)));
    f.Examples = renderEx(e.exAdd || [], card, key).concat(units).join("");
  }
  if (e.hint) {
    if (!findNote(key.split("/")[0] + "/" + e.hint)) errors.push(key + ": hint names " + e.hint + ", which the deck does not card");
    f.English = f.English.replace(/<div class="uc-pos">([^<]*)<\/div>/, (all, pos) => /, not /.test(pos) ? all : '<div class="uc-pos">' + pos + ", not " + esc(e.hint) + "</div>");
  }
}

/* ---------- the counts a description states, by emit.py's and emit_phrases.py's formulas ---------- */
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
function recount(d) {
  const cards = d.cards, n = cards.length, m = d.meta;
  const fams = cards.filter((c) => c.fields.Forms).length;
  const passives = cards.filter((c) => c.fields.Forms.includes(">passive<")).length;
  const phrases = cards.filter((c) => c.fields.Word.includes(" "));
  const exN = (c) => exUnits(c.fields.Examples).length;
  const ex3 = cards.filter((c) => exN(c) === 3).length, ex0 = cards.filter((c) => exN(c) === 0).length;
  const sub = (re, to) => { m.desc = m.desc.replace(re, to); };
  if (m.id === "idphrase") {
    const k = (s) => cards.filter((c) => c.sub === s).length;
    m.subtitle = m.subtitle.replace(/^\d+ expressions · \d+ everyday, \d+ idioms, \d+ proverbs/, String(n) + " expressions · " + k("Phrases") + " everyday, " + k("Idioms") + " idioms, " + k("Proverbs") + " proverbs");
    sub(/\d+ Indonesian phrases, idioms and proverbs, in three subdecks: \d+ everyday expressions, \d+ idioms and \d+ proverbs\./,
      String(n) + " Indonesian phrases, idioms and proverbs, in three subdecks: " + k("Phrases") + " everyday expressions, " + k("Idioms") + " idioms and " + k("Proverbs") + " proverbs.");
    sub(/Real example sentences come with \d+ of the \d+ expressions, three apiece for \d+ of them/, "Real example sentences come with " + String(n - ex0) + " of the " + String(n) + " expressions, three apiece for " + String(ex3) + " of them");
    return;
  }
  m.subtitle = m.subtitle.replace(/^\d+(?= words\b)/, String(n));
  sub(/\d+(?= words for [A-Z][A-Za-z ]+, a predicate of the UKBI)/, String(n));
  sub(/\d+ of the words show their relatives labelled( — [^—]* — )and \d+ of them show a passive/, (all, mid) => String(fams) + " of the words show their relatives labelled" + mid + "and " + String(passives) + " of them show a passive");
  sub(/\d+ of the entries are phrases rather than single words — [^—]* —/, () => String(phrases.length) + " of the entries are phrases rather than single words — " + phrases.slice(0, 4).map((c) => c.fields.Word).join(", ") + " —");
  sub(/Real example sentences come with \d+ of the \d+ words, three apiece for \d+ of them; the sentence corpus has nothing at all for the other \d+/,
    "Real example sentences come with " + String(n - ex0) + " of the " + String(n) + " words, three apiece for " + String(ex3) + " of them; the sentence corpus has nothing at all for the other " + String(ex0));
}

/* ---------- apply ---------- */
const SHELF = ["ukbi1", "ukbi2", "ukbi3", "ukbi4", "ukbi5", "ukbi6", "ukbi7", "idphrase"];
const order = SHELF.filter((id) => byId.has(id)).concat([...byId.keys()].filter((id) => !SHELF.includes(id)));
const noteFix = new Map(), seenNote = new Set();
for (const [k, fix] of Object.entries(REC.notes || {})) {
  const i = k.indexOf("/"), id = k.slice(0, i);
  if (!byId.has(id)) { errors.push(k + ": no ukbi deck has the id " + id); continue; }
  (noteFix.get(id) || noteFix.set(id, []).get(id)).push([k.slice(i + 1), fix, k]);
}
for (const id of Object.keys(REC.insert || {})) if (!byId.has(id)) errors.push("insert: no ukbi deck has the id " + id);
for (const id of Object.keys(REC.decks || {})) if (!byId.has(id)) errors.push("decks: no ukbi deck has the id " + id);

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
    if (!card) { card = { fields: {}, id: cid, type: "ukbi" }; if (e.sub) card.sub = e.sub; d.cards.push(card); }
    if (e.fields) { for (const f of FIELDS) if (typeof e.fields[f] !== "string") errors.push(key + ": fields lacks " + f); card.fields = Object.assign({}, e.fields); }
    else card.fields = { Indonesian: renderWord(e.word), Word: e.word, English: "", Forms: "", Examples: "" };
    if (card.fields.Word !== e.word) errors.push(key + ": fields.Word is " + card.fields.Word);
    applyFields(card, e, id + "/" + e.word);
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
  // 4. the deck's own words about itself (the lead is written last of all, when every deck is settled)
  for (const [find, to] of dm.descSub || []) {
    if (d.meta.desc.includes(to)) continue;   // first, since a replacement may begin with the text it replaces
    if (d.meta.desc.includes(find)) d.meta.desc = d.meta.desc.split(find).join(to);
    else errors.push(id + " → descSub: neither “" + find.slice(0, 60) + "…” nor its replacement is in the description");
  }
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
  // 6. the order: the record's, else the pinned numbers (the order the deck shipped in)
  const byHead = new Map(d.cards.map((c) => [c.fields.Word, c]));
  if (ORD[id]) {
    const list = ORD[id].order || [];
    const extra = list.filter((h) => !byHead.has(h)), lack = [...byHead.keys()].filter((h) => !list.includes(h));
    if (extra.length || lack.length || new Set(list).size !== list.length)
      errors.push(id + ": indonesian-order.json is not exactly the deck's headwords (not in the deck: " + (extra.slice(0, 5).join(", ") || "none")
        + "; not in the list: " + (lack.slice(0, 5).join(", ") || "none") + ") — run indonesian-order.js");
    else d.cards = list.map((h) => byHead.get(h));
  } else {
    d.cards = d.cards.map((c, i) => [c, i]).sort((a, b) => pin[a[0].fields.Word] - pin[b[0].fields.Word] || a[1] - b[1]).map((x) => x[0]);
  }
  recount(d);
}
for (const [, list] of noteFix) for (const [, , key] of list) if (!seenNote.has(key) && !errors.some((e) => e.startsWith(key))) errors.push(key + ": not applied");

/* ---------- the leads, when every deck has its notes and its order: the pace is arithmetic over the shelf ---------- */
const PER_DAY = 5;   // LIMIT_DEFAULTS.lang in app.js: ten new cards a day, and a word is two cards
const ANCHOR = { idphrase: /[\d,]+ Indonesian phrases, idioms and proverbs, in three subdecks/ };
const LEVEL_ANCHOR = /Both study directions in one deck:/;
const toks = (s) => String(s).toLowerCase().match(/[a-zé]+(?:-[a-zé]+)*/g) || [];
const shown1 = new Set();
if (byId.has("ukbi1")) for (const c of byId.get("ukbi1").d.cards) { toks(c.fields.Word).forEach((t) => shown1.add(t)); formsOf(c).forEach((f) => toks(f[1]).forEach((t) => shown1.add(t))); }
const span = new Map(); let day = 0, shelfNotes = 0;
for (const id of order) { const n = byId.get(id).d.cards.length, days = Math.ceil(n / PER_DAY); span.set(id, { n, days, first: day + 1, last: day + days }); day += days; shelfNotes += n; }
for (const id of order) {
  const { d } = byId.get(id), dm = (REC.decks || {})[id] || {}, s = span.get(id);
  const fill = (text) => String(text).replace(/\{([a-zA-Z0-9]+)(?::([^}]*))?\}/g, (all, k, arg) => {
    if (k === "notes") return fmt(s.n);
    if (k === "days") return fmt(s.days);
    if (k === "first") return fmt(s.first);
    if (k === "last") return fmt(s.last);
    if (k === "shelfNotes") return fmt(shelfNotes);
    if (k === "shelfDays") return fmt(day);
    if (k === "shelfYears") return (day / 365).toFixed(1);
    if (k === "start" && span.has(arg)) return fmt(span.get(arg).first);
    if (k === "day") { const i = d.cards.findIndex((c) => c.fields.Word === arg); if (i >= 0) return fmt(Math.ceil((i + 1) / PER_DAY)); }
    if (k === "inserted") return fmt(((REC.insert || {})[id] || []).length);
    if (k === "n") return fmt(d.cards.filter((c) => c.sub === arg).length);
    if (k === "l1") return fmt(d.cards.filter((c) => toks(c.fields.Word).every((t) => shown1.has(t))).length);
    errors.push(id + ": the token " + all + " cannot be filled");
    return all;
  });
  if (dm.subtitle !== undefined) d.meta.subtitle = fill(dm.subtitle);
  if (dm.lead === undefined) continue;
  const m = (ANCHOR[id] || LEVEL_ANCHOR).exec(d.meta.desc);
  if (!m) { errors.push(id + ": the generator's opening words are not in the description, so the lead has no place"); continue; }
  d.meta.desc = fill(dm.lead) + " " + d.meta.desc.slice(m.index);
}

/* ---------- an Indonesian deck of another type is held to its pinned ids and nothing else ---------- */
for (const { f, d } of INDO) {
  if (isUkbi(d)) continue;
  const id = d.meta.id, pin = PIN[id];
  if (!pin) { errors.push(f + ": no rows in indonesian-ids.json for " + id); continue; }
  for (const c of d.cards) if (c.id !== "u_" + id + "_" + pin[c.key]) errors.push(f + ": " + c.id + " is not the id its key “" + c.key + "” is pinned to");
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
if (pinChanged) { console.log(CHECK ? "indonesian-ids.json WOULD CHANGE" : "indonesian-ids.json: rows written"); if (!CHECK) writePin(PIN); }
said.forEach((s) => console.log("  " + s));
const nIns = Object.values(REC.insert || {}).reduce((a, b) => a + b.length, 0);
console.log(nIns + " inserts, " + Object.keys(REC.notes || {}).length + " note fixes, " + Object.keys(ORD).filter((k) => k !== "_").length + " orders, "
  + Object.keys(PIN).filter((k) => !k.startsWith("_")).reduce((a, k) => a + Object.keys(PIN[k]).length, 0) + " pinned ids, "
  + Object.values(PIN._retired || {}).reduce((a, b) => a + Object.keys(b).length, 0) + " retired; the shelf is "
  + fmt(shelfNotes) + " notes, " + fmt(day) + " days at " + PER_DAY + " words a day");
if (changed || pinChanged) {
  if (CHECK) { console.log("\nFAIL  the Indonesian decks are out of step with the record — run node .claude/decks/indonesian-fix.js"); process.exit(1); }
  console.log("now run node .claude/decks/build-indonesian-sounds.js and node .claude/build-lang-decks.js");
} else console.log("all Indonesian decks match the record, the order and the pinned ids");
