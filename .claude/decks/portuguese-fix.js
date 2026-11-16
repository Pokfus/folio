#!/usr/bin/env node
"use strict";
/*
  portuguese-fix.js — THE ONE WAY A PORTUGUESE (CAPLE) DECK IS HAND-EDITED, ORDERED AND NUMBERED (Nov 2026,
  the Portuguese beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/portuguese-fix.js [--check] [--verbose]
    node .claude/decks/portuguese-fix.js --seed-ids      # write portuguese-ids.json (refused once it exists)

  WHY IT EXISTS BESIDE `paradigm-fix.js`. The Portuguese decks can be rebuilt (`.claude/caple/`, Python,
  about 750 MB of live corpora), so a hand edit made in a deck file lasts until the next `run.py`. Until
  this pass the only record they had was `paradigm-fixes.json`, which they share with the French and
  Italian decks and which does one thing: fold the forms of an article, a possessive or a pronoun into one
  card. It has no notion of a card the word list lacks, of a card that belongs in a lower deck, of an
  order, or of a pinned id. This is `italian-fix.js`'s model, for the card type `caple`.

  THE ORDER OF A REBUILD:   run.py --level <x>   →   paradigm-fix.js   →   portuguese-fix.js   →
  build-portuguese-sounds.js   →   .claude/build-lang-decks.js.   This file runs AFTER paradigm-fix.js and
  keys every note by the headword that file leaves (`ele, ela`, not `ela`). It never rebuilds a field
  paradigm-fixes.json rebuilds: the run fails if the two records name one note's field. IT NEVER WRITES
  paradigm-fixes.json OR paradigm-fix.js, which the French and Italian decks share.

  WHICH DECKS. Every deck in `decks/` whose file name has "Portuguese" in it and whose card type is `caple`
  — by CARD TYPE, never by a file-name prefix: the six CAPLE levels and the phrases. A Portuguese deck of
  another type (the sounds deck `build-portuguese-sounds.js` writes) is not edited here and is still held
  to its pinned ids.

  THE FILE IS THE RECORD: `portuguese-fixes.json`.

  `insert`  `{ <deck id>: [entry, …] }` — a card the deck's word list has not got. An entry carries `word`
      (the headword, the pin's key), `id` (the number in its note id, above every number the generator has
      dealt so a rebuild cannot mint it) and a `why` that names where every part came from. Its content is
      one of two things:
        · `fields`, the six fields of a card MOVED from another deck, copied byte for byte on the day of
          the move (`from` names the deck and headword). The moved card is taken out of its old deck by
          that deck's `dropDup`, and its old number goes to `_retired`.
        · `portuguese` / `senses` / `forms` / `ex`, for a card nothing carded: the meanings are the English
          Wiktionary's (kaikki.org), each sentence a Tatoeba sentence named by id in `src`.
      Both may be given: `senses`, `forms` and `ex` then replace that field of the moved card.
      `senses` is `[[pos, [gloss, …]], …]`, `forms` `[[label, value], …]`, `ex` `[[portuguese, english,
      src, [bold, …]], …]`; every word in the bold list (default: the headword's own words) is bolded on
      boundaries that understand accents, and a sentence in which none is found is an error. `src` names
      the Tatoeba sentence and, after "·", how it was judged European (see portuguese-fixes.json's `_`).

  `notes`  `{ "<deck id>/<headword>": { senses?, forms?, ex?, exDrop?, exAdd?, why } }` — fields rebuilt on
      a card the generator wrote. A note that matches nothing is an ERROR. `exDrop` is a list of sentences
      (the Portuguese text, exactly) taken off the card: a sentence already gone is normal. `exAdd` is `ex`
      rows appended (put first with `exFirst`) unless the card already carries that sentence. `word` (with `portuguese`, the
      headword's markup) RENAMES the note: it is then found by its key or by its new headword, and the
      pin's key is renamed with it, the number staying as it is.

  `decks`  `{ <deck id>: { dropDup?, dropForm?, subtitle?, descSub? } }`.
      `dropDup` is `{ headword: lowerDeckId }`: DELETE this deck's card for a word a lower deck now
      carries. The claim is CHECKED — the named deck must hold a card whose headword names that word.
      `dropForm` is `{ headword: "<deck id>/<headword>" }`: DELETE this deck's card for a word that is only
      a FORM of the card named, in this deck or a lower one — `a senhora` beside `o senhor, a senhora`. The
      claim is CHECKED: the named card must show the word in its headword or in its Forms row.
      `subtitle` is set outright. `descSub` is `[find, replace]` pairs over the description, each satisfied
      if its replacement already stands in the text or if it matched; one satisfied by neither is an error.
      To reword a replacement that has shipped, add a pair after it whose `find` is the old replacement.

  THE COUNTS IN A DESCRIPTION ARE RECOUNTED, not carried: how many words, how many the levels come to
  together, nouns with an article, pairs, verbs, reflexives and cards with sentences, by the formulas
  `.claude/caple/emit.py` uses, written into the sentences that file composes.

  `portuguese-order.json`  `{ <deck id>: { why, order: [headword, …] } }`, written by portuguese-order.js
      and applied LAST: the notes are put in that order and nothing else about them moves. A list that is
      not exactly the deck's headwords is refused. A deck with no entry is put in the order of its pinned
      numbers, which is the order the generator dealt it in.

  `portuguese-ids.json`  `{ <deck id>: { <headword>: N } }` for the note id `u_<deck id>_N`, seeded from the
      decks as shipped on 2026-11-16. A NOTE HERE IS ONE NOTE WITH TWO CARD TEMPLATES, so both of a word's
      cards hang off this one id (the English → Portuguese card is the id plus `~2`) and pinning the note
      pins both schedules. THE PIN IS APPLIED, NOT ONLY CHECKED: the generator numbers a deck by position
      and the Update press merges a reader's progress by id, so after a rebuild every note is given back
      the number its headword is pinned to. A note with no row takes its insert's `id`, or failing that
      the next free number, and gains a row (under `--check` that is a failure). A row is never deleted: a
      note a record removes (`dropDup` or `dropForm` here, a `fold` in paradigm-fixes.json) moves to
      `_retired`, so its number is never dealt to another word. A pinned note that is missing for any
      other reason fails the run.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const FIXES = path.join(HERE, "portuguese-fixes.json"), IDS_FILE = path.join(HERE, "portuguese-ids.json");
const ORDER_FILE = path.join(HERE, "portuguese-order.json"), PARADIGM = path.join(HERE, "paradigm-fixes.json");
const argv = process.argv.slice(2);
const CHECK = argv.includes("--check"), VERBOSE = argv.includes("--verbose"), SEED = argv.includes("--seed-ids");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const writePin = (pin) => fs.writeFileSync(IDS_FILE, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n");

/* THE PORTUGUESE DECKS. The file name only narrows what is parsed (decks/ holds 180 MB); what makes a deck
   this record's is the `caple` type its cards are written in. */
const PORTUGUESE = fs.readdirSync(DIR).filter((x) => /Portuguese/.test(x) && /\.folio-deck\.json$/.test(x)).sort()
  .map((f) => { const text = fs.readFileSync(path.join(DIR, f), "utf8"); return { f, text, d: JSON.parse(text) }; });
const isCaple = (d) => !!(d.meta && d.meta.types && d.meta.types.caple);
const CAPLE = PORTUGUESE.filter((x) => isCaple(x.d));
const byId = new Map(CAPLE.map((x) => [x.d.meta.id, x]));
const numOf = (c, id) => { const m = /^u_([a-z0-9]+)_(\d+)$/.exec(c.id); return m && m[1] === id ? Number(m[2]) : NaN; };

if (SEED) {
  if (fs.existsSync(IDS_FILE)) fail("portuguese-ids.json exists — a pin is seeded once and never re-seeded");
  const out = { _: "portuguese-ids.json — the number in each Portuguese note's id, pinned to its note: <deck id> → <headword> (a sounds-deck row's key) → N, for the id u_<deck id>_N. A note of these decks is one note with two card templates, so both of a word's cards hang off this number. Seeded from the decks as shipped on 2026-11-16 and APPLIED by portuguese-fix.js: a rebuilt deck, which the generator numbers by position, is numbered back. NEVER delete or renumber a row — the Update press merges a reader's progress by id. A note a record removes moves to _retired; a new note takes the next free number; a rename renames the key." };
  for (const { d } of CAPLE) {
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
  console.log("seeded portuguese-ids.json: " + CAPLE.map(({ d }) => d.meta.id + " " + d.cards.length).join(", "));
  process.exit(0);
}

if (!fs.existsSync(IDS_FILE)) fail("no portuguese-ids.json — run --seed-ids first");
const PIN = readJson(IDS_FILE), PIN_BEFORE = JSON.stringify(PIN);
const REC = fs.existsSync(FIXES) ? readJson(FIXES) : {};
const ORD = fs.existsSync(ORDER_FILE) ? readJson(ORDER_FILE) : {};
const PAR = fs.existsSync(PARADIGM) ? readJson(PARADIGM) : {};
const errors = [], said = [];

/* ---------- the generator's own markup (build_deck.py, emit.py): apostrophes are &#x27; ---------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#x27;");
const escAttr = (s) => esc(s).replace(/"/g, "&quot;");
const strip = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const glossHtml = (gls) => gls.length === 1 ? '<div class="uc-gl">' + esc(gls[0]) + "</div>"
  : '<ul class="uc-gls">' + gls.map((g) => "<li>" + esc(g) + "</li>").join("") + "</ul>";
/* every sense in its own `uc-sense`, one or several: the caple generator's shape */
const renderSenses = (senses) => senses.map(([pos, gls]) =>
  '<div class="uc-sense"><div class="uc-pos">' + esc(pos) + "</div>" + glossHtml(gls) + "</div>").join("");
const renderForms = (forms) => !forms.length ? "" : '<div class="uc-forms">' + forms.map(([l, v]) =>
  '<span class="uc-fi"><span class="uc-fl">' + esc(l) + "</span>" + esc(v) + "</span>").join("") + "</div>";
function boldSentence(sent, words) {
  const alts = [...words].sort((a, b) => b.length - a.length).map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![\\p{L}\\p{M}])");
  const re = new RegExp("(?<![\\p{L}\\p{M}])(?:" + alts.join("|") + ")", "giu");
  let out = "", at = 0, m, hits = 0;
  while ((m = re.exec(sent))) { out += esc(sent.slice(at, m.index)) + "<b>" + esc(m[0]) + "</b>"; at = m.index + m[0].length; hits++; }
  return { html: out + esc(sent.slice(at)), hits };
}
const ART = /^(?:o\/a|os|as|o|a)\s+/i;
const bare = (w) => w.replace(ART, "").toLowerCase();
function renderEx(ex, head, key) {
  const own = head.split(/,\s*/).map((w) => w.replace(ART, ""));
  return ex.map(([pt, en, src, bold]) => {
    if (!src || !String(src).trim()) errors.push(key + ": the sentence “" + pt + "” names no source");
    if (!en || !String(en).trim()) errors.push(key + ": the sentence “" + pt + "” has no translation");
    const b = boldSentence(pt, bold && bold.length ? bold : own);
    if (!b.hits) errors.push(key + ": no form of the headword in the sentence “" + pt + "”");
    return '<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="' + escAttr(pt) + '"></span>'
      + b.html + '</div><div class="uc-exe">' + esc(en) + "</div></div>";
  }).join("");
}
const EX_RE = /<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="([^"]*)"><\/span>.*?<\/div><div class="uc-exe">.*?<\/div><\/div>/g;
const FIELDS = ["Portuguese", "Word", "English", "Forms", "Conjugation", "Examples"];
function applyFields(card, e, key) {
  const f = card.fields;
  if (e.portuguese !== undefined) f.Portuguese = e.portuguese;
  if (e.senses) f.English = renderSenses(e.senses);
  if (e.forms) f.Forms = renderForms(e.forms);
  if (e.ex) f.Examples = renderEx(e.ex, f.Word, key);
  if (e.exDrop) {
    const gone = new Set(e.exDrop.map(escAttr));
    f.Examples = f.Examples.replace(EX_RE, (all, say) => gone.has(say) ? "" : all);
  }
  if (e.exAdd) {
    const have = new Set([...f.Examples.matchAll(EX_RE)].map((m) => m[1]));
    const added = renderEx(e.exAdd.filter((x) => !have.has(escAttr(x[0]))), f.Word, key);
    f.Examples = e.exFirst ? added + f.Examples : f.Examples + added;
  }
  /* the plain keys the generator writes beside the fields (build_deck.py: `question`, and `answer` =
     the first sense's first three meanings) follow a field this record rebuilt */
  if (e.senses) card.answer = card.answerText = e.senses[0][1].slice(0, 3).join("; ");
  card.question = f.Word;
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
const LEVELS = ["caplea1", "caplea2", "capleb1", "capleb2", "caplec1", "caplec2"];
const grp = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const COUNT = { 2: "two", 3: "three", 4: "four", 5: "five", 6: "six" };
function recount(d) {
  const cards = d.cards, n = cards.length, m = d.meta, phr = !LEVELS.includes(m.id);
  const sub = (re, to) => { m.desc = m.desc.replace(re, to); };
  m.subtitle = m.subtitle.replace(/^[\d,]+(?= (?:words|expressions)\b)/, grp(n));
  const ex3 = cards.filter((c) => (c.fields.Examples.match(/uc-exi/g) || []).length === 3).length;
  const ex0 = cards.filter((c) => !c.fields.Examples).length;
  if (phr) {
    const subs = {}; for (const c of cards) subs[c.sub] = (subs[c.sub] || 0) + 1;
    sub(/[\d,]+(?= set expressions of European Portuguese)/, grp(n));
    sub(/Expressions \([\d,]+\) and Proverbs \([\d,]+\)/, "Expressions (" + grp(subs.Expressions || 0) + ") and Proverbs (" + grp(subs.Proverbs || 0) + ")");
    sub(/(Real example sentences come with )[\d,]+ of the [\d,]+ expressions, three apiece for [\d,]+ of them/,
      "$1" + grp(n - ex0) + " of the " + grp(n) + " expressions, three apiece for " + grp(ex3) + " of them");
    return;
  }
  const lv = LEVELS.indexOf(m.id);
  const arts = cards.filter((c) => c.fields.Portuguese.includes("uc-art")).length;
  const pairs = cards.filter((c) => strip(c.fields.Portuguese).includes(", ")).length;
  const verbs = cards.filter((c) => c.fields.Conjugation.includes("Conjuntivo")).length;
  const refl = cards.filter((c) => c.fields.Word.endsWith("-se")).length;
  sub(/[\d,]+(?= words for level )/, grp(n));
  if (lv > 0) {
    const total = LEVELS.slice(0, lv + 1).reduce((a, id) => a + (byId.has(id) ? byId.get(id).d.cards.length : 0), 0);
    sub(new RegExp("(so the " + COUNT[lv + 1] + " together come to )[\\d,]+(?= words)"), "$1" + grp(total));
  }
  sub(/(the gender is learnt with the word \()\d+(?= of them\))/, "$1" + arts);
  sub(/(taught as a pair rather than as two words \()\d+(?= of them\))/, "$1" + pairs);
  sub(/(Each of the )\d+(?= verbs carries)/, "$1" + verbs);
  sub(/(The )\d+(?= reflexive verbs are conjugated)/, "$1" + refl);
  const exNote = ex3 === n ? "Every word also carries three real example sentences"
    : ex0 ? "Real example sentences come with " + (n - ex0) + " of the " + n + " words, three apiece for " + ex3 + " of them and one or two for the rest; the sentence corpus has nothing at all for the remaining " + ex0 + ", which are kept because the word list is set by the reference inventory and not by the corpus"
      : "Every word also carries real example sentences, three of them for " + ex3 + " of the " + n;
  sub(/(?:Every word also carries three real example sentences|Every word also carries real example sentences, three of them for \d+ of the \d+|Real example sentences come with \d+ of the \d+ words, three apiece for \d+ of them and one or two for the rest(?:; the sentence corpus has nothing at all for the remaining \d+, which are kept because the word list is set by the reference inventory and not by the corpus)?)/, exNote);
}

/* ---------- apply ---------- */
const order = LEVELS.concat(["ptphrase"]).filter((id) => byId.has(id)).concat([...byId.keys()].filter((id) => !LEVELS.includes(id) && id !== "ptphrase"));
const noteFix = new Map(), seenNote = new Set();
for (const [k, fix] of Object.entries(REC.notes || {})) {
  const i = k.indexOf("/"), id = k.slice(0, i);
  if (!byId.has(id)) { errors.push(k + ": no caple deck has the id " + id); continue; }
  const owns = parOwns.get(k) || new Set();
  for (const fld of ["senses", "forms", "ex"]) if (fix[fld] && owns.has(fld)) errors.push(k + ": paradigm-fixes.json rebuilds this note's " + fld + " — edit it there");
  if (owns.has("ex") && (fix.exDrop || fix.exAdd)) errors.push(k + ": paradigm-fixes.json rebuilds this note's ex — edit it there");
  (noteFix.get(id) || noteFix.set(id, []).get(id)).push([k.slice(i + 1), fix, k]);
}
for (const id of Object.keys(REC.insert || {})) if (!byId.has(id)) errors.push("insert: no caple deck has the id " + id);
for (const id of Object.keys(REC.decks || {})) if (!byId.has(id)) errors.push("decks: no caple deck has the id " + id);
const teaches = (d, head) => { const want = bare(head); return d.cards.some((c) => c.fields.Word.split(/,\s*/).some((w) => bare(w) === want)); };

for (const id of order) {
  const { d } = byId.get(id), dm = (REC.decks || {})[id] || {};
  const category = (d.cards[0] || {}).category || "";
  // 1. inserts, so that a higher deck's dropDup can see what this one now carries
  for (const e of (REC.insert || {})[id] || []) {
    const key = id + "/" + e.word + " (insert)";
    if (!e.word || !Number.isInteger(e.id) || !e.why) { errors.push(key + ": an insert needs word, id and why"); continue; }
    const cid = "u_" + id + "_" + e.id;
    const clash = d.cards.find((c) => c.fields.Word === e.word && c.id !== cid && numOf(c, id) !== (PIN[id] || {})[e.word]);
    if (clash) { errors.push(key + ": the deck already cards that headword as " + clash.id); continue; }
    let card = d.cards.find((c) => c.fields.Word === e.word);
    if (!card) {
      card = { id: cid, num: String(e.id), category, sub: e.sub || "", question: e.word, answer: "", answerDate: "", traditional: "", hanzi: "",
        pinyin: "", translations: "", abstract: "", citation: "", answerText: "", type: "caple", fields: {} };
      d.cards.push(card);
    }
    if (e.fields) { for (const f of FIELDS) if (typeof e.fields[f] !== "string") errors.push(key + ": fields lacks " + f); card.fields = Object.assign({}, e.fields); }
    else card.fields = { Portuguese: e.portuguese || esc(e.word), Word: e.word, English: "", Forms: "", Conjugation: "", Examples: "" };
    if (card.fields.Word !== e.word) errors.push(key + ": fields.Word is " + card.fields.Word);
    if (e.answer !== undefined) card.answer = card.answerText = e.answer;
    applyFields(card, e, key);
    if (!card.fields.English) errors.push(key + ": no meaning");
    if (!card.answer) errors.push(key + ": no plain answer (give senses, or answer with fields)");
  }
  // 2. cards a lower deck now carries, and cards that are only a form of another card
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
    const shown = (t.fields.Word + " " + strip(t.fields.Forms)).toLowerCase().split(/[\s,;:\/]+/);
    if (!bare(head).split(/\s+/).every((w) => shown.includes(w))) { errors.push(id + " → dropForm " + head + ": " + by + " does not show it in its headword or Forms"); continue; }
    if (head === tHead && tDeck === id) { errors.push(id + " → dropForm " + head + ": a note cannot be a form of itself"); continue; }
    lost.add(head);
    const before = d.cards.length;
    d.cards = d.cards.filter((c) => c.fields.Word !== head);
    if (before === d.cards.length && VERBOSE) said.push(id + " → dropForm " + head + ": already gone");
  }
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
    if (!card.fields.Examples && (fix.exDrop || fix.ex) && !fix.mayBeBare) errors.push(key + ": the fix leaves the card with no sentence");
  }
  // 4. the deck's own words about itself
  if (dm.subtitle !== undefined) d.meta.subtitle = dm.subtitle;
  for (const [find, to] of dm.descSub || []) {
    if (d.meta.desc.includes(to)) continue;   // first, since a replacement may begin with the text it replaces
    if (d.meta.desc.includes(find)) d.meta.desc = d.meta.desc.split(find).join(to);
    else errors.push(id + " → descSub: neither “" + find.slice(0, 60) + "…” nor its replacement is in the description");
  }
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
    c.id = "u_" + id + "_" + pin[head]; c.num = String(pin[head]);
  }
  const ids = d.cards.map((c) => c.id);
  if (new Set(ids).size !== ids.length) errors.push(id + ": two notes share an id");
  // 6. the order, last: the record's, else the pinned numbers (the order the generator dealt)
  const byHead = new Map(d.cards.map((c) => [c.fields.Word, c]));
  if (ORD[id]) {
    const list = ORD[id].order || [];
    const extra = list.filter((h) => !byHead.has(h)), inList = new Set(list), lack = [...byHead.keys()].filter((h) => !inList.has(h));
    if (extra.length || lack.length || inList.size !== list.length)
      errors.push(id + ": portuguese-order.json is not exactly the deck's headwords (not in the deck: " + (extra.slice(0, 5).join(", ") || "none")
        + "; not in the list: " + (lack.slice(0, 5).join(", ") || "none") + ") — run portuguese-order.js");
    else d.cards = list.map((h) => byHead.get(h));
  } else {
    d.cards = d.cards.map((c, i) => [c, i]).sort((a, b) => pin[a[0].fields.Word] - pin[b[0].fields.Word] || a[1] - b[1]).map((x) => x[0]);
  }
}
/* the counts, once every deck has its final cards (a level states what the levels below it come to) */
for (const id of order) recount(byId.get(id).d);
for (const [id, list] of noteFix) for (const [, , key] of list) if (!seenNote.has(key) && !errors.some((e) => e.startsWith(key))) errors.push(key + ": not applied");

/* ---------- a Portuguese deck of another type is held to its pinned ids and nothing else ---------- */
for (const { f, d } of PORTUGUESE) {
  if (isCaple(d)) continue;
  const id = d.meta.id, pin = PIN[id];
  if (!pin) { errors.push(f + ": no rows in portuguese-ids.json for " + id); continue; }
  for (const c of d.cards) if (c.id !== "u_" + id + "_" + pin[c.key]) errors.push(f + ": " + c.id + " is not the id its key “" + c.key + "” is pinned to");
}

if (errors.length) { errors.forEach((e) => console.error("ERROR " + e)); process.exit(1); }
let changed = 0;
for (const { f, text, d } of CAPLE) {
  const out = JSON.stringify(d);
  if (out === text) continue;
  changed++;
  console.log((CHECK ? "WOULD CHANGE " : "wrote ") + f + "  " + JSON.parse(text).cards.length + " → " + d.cards.length + " notes");
  if (!CHECK) fs.writeFileSync(path.join(DIR, f), out);
}
const pinChanged = JSON.stringify(PIN) !== PIN_BEFORE;
if (pinChanged) { console.log(CHECK ? "portuguese-ids.json WOULD CHANGE" : "portuguese-ids.json: rows written"); if (!CHECK) writePin(PIN); }
said.forEach((s) => console.log("  " + s));
const nIns = Object.values(REC.insert || {}).reduce((a, b) => a + b.length, 0);
console.log(nIns + " inserts, " + Object.keys(REC.notes || {}).length + " note fixes, " + Object.keys(ORD).filter((k) => k !== "_").length + " orders, "
  + Object.keys(PIN).filter((k) => !k.startsWith("_")).reduce((a, k) => a + Object.keys(PIN[k]).length, 0) + " pinned ids, "
  + Object.values(PIN._retired || {}).reduce((a, b) => a + Object.keys(b).length, 0) + " retired");
if (changed || pinChanged) {
  if (CHECK) { console.log("\nFAIL  the Portuguese decks are out of step with the record — run node .claude/decks/portuguese-fix.js"); process.exit(1); }
  console.log("now run node .claude/decks/build-portuguese-sounds.js and node .claude/build-lang-decks.js");
} else console.log("all Portuguese decks match the record, the order and the pinned ids");
