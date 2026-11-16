#!/usr/bin/env node
"use strict";
/*
  german-fix.js — THE ONE WAY A GERMAN (`goethe`) DECK IS HAND-EDITED, ORDERED AND NUMBERED (Nov 2026, the
  German beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/german-fix.js [--check] [--verbose]
    node .claude/decks/german-fix.js --seed-ids      # write german-ids.json (refused once it exists)

  WHY IT EXISTS. Five of the seven German decks cannot be rebuilt at all — the shipped B1, B2, C1, C2 and
  the phrases were supplied ready-made — and the two `.claude/goethe/run.py` does write (A1, A2) cannot be
  rebuilt byte for byte, because the Wiktionary extraction it reads is fetched fresh. Until this pass an
  edit to a German deck was an edit to the file, with no record of it, and every card id was the card's
  position in the file. So every change is here, and the ids are pinned.

  THE ORDER OF A REBUILD:   python3 .claude/goethe/run.py --level a2   →   python3 .claude/goethe/case-order.py
  →   node .claude/decks/german-fix.js   →   node .claude/decks/build-german-sounds.js   →
  node .claude/build-lang-decks.js.   `case-order.py` runs FIRST: it moves whole rows of a freshly emitted
  table and knows nothing of this record; this file then never touches a table, so the two cannot fight
  (`case-order.py --check` is run again after it, by CI). NEVER run `run.py --level a1` or `--level b1` to
  "refresh" a deck: A1 must stay byte for byte what its record expects, and `--level b1` overwrites a deck
  the generator did not make.

  WHICH DECKS. Every deck in `decks/` whose card type is `goethe` — by CARD TYPE, never by file name: Goethe
  A1, A2 and B1, the B2, C1 and C2 vocabulary and the phrases. A German deck of another type (the sounds
  deck `build-german-sounds.js` writes) is not edited here and is still held to its pinned ids.

  THE FILE IS THE RECORD: `german-fixes.json`.

  `insert`  `{ <deck id>: [entry, …] }` — a card the deck's word list has not got. An entry carries `word`
      (the headword, the pin's key), `id` (the number in its card id, above every number the generator
      has dealt so a rebuild cannot mint it) and a `why` that names where every part came from. Its
      content is one of two things:
        · `fields`, the six fields of a card MOVED from another deck, copied byte for byte on the day of
          the move (`from` names the deck and headword). The moved card is taken out of its old deck by
          that deck's `dropDup`, and its old number goes to `_retired`.
        · `german` / `senses` / `forms` / `ex` / `conjFrom`, for a card nothing carded: the meanings are
          the English Wiktionary's (kaikki.org), each sentence a Tatoeba sentence named by id in `src`.
          `conjFrom` is `"<deck id>/<headword>"`: the All-forms panel is that note's, copied whole (the
          personal-pronoun table is the same table on every pronoun's card).
      Both may be given: `senses`, `forms` and `ex` then replace that field of the moved card.
      `senses` is `[[pos, [gloss, …]], …]`, `forms` `[[label, value], …]`, `ex` `[[german, english,
      src, [bold, …]], …]`; every word in the bold list (default: the headword's own words) is bolded on
      letter boundaries, and a sentence in which none is found is an error.

  `notes`  `{ "<deck id>/<headword>": { senses?, forms?, ex?, conjFrom?, why } }` — the same fields,
      rebuilt on a card the deck already has. A note that matches nothing is an ERROR. `word` (with
      `german`, the headword's markup) RENAMES the note: it is then found by its key or by its new
      headword, and the pin's key is renamed with it, the number staying as it is.

  `decks`  `{ <deck id>: { dropDup?, dropForm?, subtitle?, descSub? } }`.
      `dropDup` is `{ headword: "<lower deck id>/<its headword>" }`: DELETE this deck's card for a word a
      lower deck carries. The claim is CHECKED — the named note must exist in a deck lower on the shelf
      — so this can never delete a word nothing else teaches. A card already gone is normal.
      `dropForm` is `{ headword: "<deck id>/<headword>" }`: DELETE this deck's card for a word that is only
      a FORM of the card named, in this deck or a lower one (gewesen beside sein). CHECKED: the named
      card must show the word in its headword, its Forms row or its All-forms panel.
      `subtitle` is set outright. `descSub` is `[find, replace]` pairs over the description, each satisfied
      if its replacement already stands in the text or if it matched; one satisfied by neither is an error.
      To reword a replacement that has shipped, add a pair after it whose `find` is the old replacement.

  THE CARD'S OTHER KEYS. A German card also carries `question` (the headword), `answer` and `answerText`
  (its first three glosses, joined with "; "), `num` and `category`, which the generator writes and the
  browse list reads. An insert is given them; a note whose `senses` are rebuilt has its answer rebuilt;
  a rename renames `question`. Nothing else about an existing card is touched, and a card that only
  moves in the order is byte for byte the card it was.

  THE COUNTS IN A DESCRIPTION ARE RECOUNTED, not carried: how many words, nouns with an article, plurals,
  feminines, verbs, reflexive verbs, comparatives and cards with sentences, by the formulas
  `.claude/goethe/emit.py` uses, written into the sentences that file composes.

  `german-order.json`  `{ <deck id>: { why, order: [headword, …] } }`, written by german-order.js (its
      header has the rules) and applied LAST: the notes are put in that order and nothing else about them
      moves. A list that is not exactly the deck's headwords is refused. A deck with no entry is put in the
      order of its pinned numbers, which is the order it shipped in.

  `german-ids.json`  `{ <deck id>: { <headword>: N } }` for the note id `u_<deck id>_N`, seeded on
      2026-11-16 from the six decks as shipped and from A2 as the generator wrote it that day. A NOTE HERE
      IS ONE NOTE WITH TWO CARD TEMPLATES, so both of a word's cards hang off this one id (the English →
      German card is `<id>~2`) and pinning the note pins both schedules. THE PIN IS APPLIED, NOT ONLY
      CHECKED: the generator numbers a deck by position and the Update press merges a reader's progress
      by id, so after a rebuild every note is given back the number its headword is pinned to. A note
      with no row takes its insert's `id`, or failing that the next free number, and gains a row (under
      `--check` that is a failure). A row is never deleted: a note this record removes (`dropDup`,
      `dropForm`) moves to `_retired`, so its number is never dealt to another word. A pinned note that
      is missing for any other reason fails the run.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const FIXES = path.join(HERE, "german-fixes.json"), IDS_FILE = path.join(HERE, "german-ids.json");
const ORDER_FILE = path.join(HERE, "german-order.json");
const argv = process.argv.slice(2);
const CHECK = argv.includes("--check"), VERBOSE = argv.includes("--verbose"), SEED = argv.includes("--seed-ids");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const writePin = (pin) => fs.writeFileSync(IDS_FILE, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n");

/* THE GERMAN DECKS. The file name only narrows what is parsed (decks/ holds 180 MB); what makes a deck
   this record's is the `goethe` type its cards are written in. A file straight out of emit.py is not
   compact JSON, so "unchanged" is judged against the compact form of what was read. */
const GERMAN = fs.readdirSync(DIR).filter((x) => /German|Goethe/.test(x) && /\.folio-deck\.json$/.test(x)).sort()
  .map((f) => { const text = fs.readFileSync(path.join(DIR, f), "utf8"); return { f, text, d: JSON.parse(text) }; });
const isGoethe = (d) => !!(d.meta && d.meta.types && d.meta.types.goethe);
const DECKS = GERMAN.filter((x) => isGoethe(x.d));
const byId = new Map(DECKS.map((x) => [x.d.meta.id, x]));
const numOf = (c, id) => { const m = /^u_([a-z0-9]+)_(\d+)$/.exec(c.id); return m && m[1] === id ? Number(m[2]) : NaN; };

if (SEED) {
  if (fs.existsSync(IDS_FILE)) fail("german-ids.json exists — a pin is seeded once and never re-seeded");
  const out = { _: "german-ids.json — the number in each German note's id, pinned to its note: <deck id> → <headword> (a sounds-deck row's key) → N, for the id u_<deck id>_N. A note of these decks is one note with two card templates, so both of a word's cards hang off this number (the English → German card is <id>~2). Seeded on 2026-11-16 from the six decks as shipped and from Goethe A2 as .claude/goethe/run.py wrote it that day, and APPLIED by german-fix.js: a rebuilt deck, which the generator numbers by position, is numbered back. NEVER delete or renumber a row — the Update press merges a reader's progress by id. A note the record removes moves to _retired; a new note takes the next free number; a rename renames the key." };
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
  console.log("seeded german-ids.json: " + DECKS.map(({ d }) => d.meta.id + " " + d.cards.length).join(", "));
  process.exit(0);
}

if (!fs.existsSync(IDS_FILE)) fail("no german-ids.json — run --seed-ids first");
const PIN = readJson(IDS_FILE), PIN_BEFORE = JSON.stringify(PIN);
const REC = fs.existsSync(FIXES) ? readJson(FIXES) : {};
const ORD = fs.existsSync(ORDER_FILE) ? readJson(ORDER_FILE) : {};
const errors = [], said = [];

/* ---------- the generator's own markup (emit.py, build_deck.py): an apostrophe is written as itself ---------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => esc(s).replace(/"/g, "&quot;");
const unesc = (s) => String(s).replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x2014;/g, "—").replace(/&amp;/g, "&");
const strip = (s) => unesc(String(s || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const glossHtml = (gls) => gls.length === 1 ? '<div class="uc-gl">' + esc(gls[0]) + "</div>"
  : '<ul class="uc-gls">' + gls.map((g) => "<li>" + esc(g) + "</li>").join("") + "</ul>";
/* every sense is wrapped, one or several: that is how every shipped German card is written */
const renderSenses = (senses) => senses.map(([pos, gls]) => '<div class="uc-sense"><div class="uc-pos">' + esc(pos) + "</div>" + glossHtml(gls) + "</div>").join("");
const renderForms = (forms) => !forms.length ? "" : '<div class="uc-forms">' + forms.map(([l, v]) =>
  '<span class="uc-fi"><span class="uc-fl">' + esc(l) + "</span>" + esc(v) + "</span>").join("") + "</div>";
const glossesOf = (english) => [...String(english).matchAll(/<(?:div class="uc-gl"|li)>([\s\S]*?)<\/(?:div|li)>/g)].map((m) => unesc(m[1]));
const answerOf = (english) => glossesOf(english).slice(0, 3).join("; ");
function boldSentence(sent, words) {
  const alts = [...words].sort((a, b) => b.length - a.length).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp("(?<![\\p{L}\\p{M}])(?:" + alts.join("|") + ")(?![\\p{L}\\p{M}])", "giu");
  let out = "", at = 0, m, hits = 0;
  while ((m = re.exec(sent))) { out += esc(sent.slice(at, m.index)) + "<b>" + esc(m[0]) + "</b>"; at = m.index + m[0].length; hits++; }
  return { html: out + esc(sent.slice(at)), hits };
}
const ownWords = (head) => head.split(/,\s*/).map((w) => w.replace(/^(?:der|die|das|sich)\s+/i, ""));
function renderEx(ex, head, key) {
  const own = ownWords(head);
  return ex.map(([de, en, src, bold]) => {
    if (!src || !String(src).trim()) errors.push(key + ": the sentence “" + de + "” names no source");
    if (!en || !String(en).trim()) errors.push(key + ": the sentence “" + de + "” has no translation");
    const b = boldSentence(de, bold && bold.length ? bold : own);
    if (!b.hits) errors.push(key + ": no form of the headword in the sentence “" + de + "”");
    return '<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="' + escAttr(de) + '"></span>'
      + b.html + '</div><div class="uc-exe">' + esc(en) + "</div></div>";
  }).join("");
}
const FIELDS = ["German", "Word", "English", "Forms", "Conjugation", "Examples"];
const findNote = (ref) => { const i = String(ref).indexOf("/"), x = byId.get(String(ref).slice(0, i)); return x && x.d.cards.find((c) => c.fields.Word === String(ref).slice(i + 1)); };
function applyFields(card, e, key) {
  const f = card.fields;
  if (e.german !== undefined) f.German = e.german;
  if (e.senses) { f.English = renderSenses(e.senses); card.answer = card.answerText = answerOf(f.English); }
  if (e.forms) f.Forms = renderForms(e.forms);
  if (e.ex) f.Examples = renderEx(e.ex, f.Word, key);
  if (e.conjFrom) { const src = findNote(e.conjFrom); if (!src) errors.push(key + ": conjFrom names no note: " + e.conjFrom); else f.Conjugation = src.fields.Conjugation; }
}
/* every written form a card shows: its headword, its Forms row, every cell of its All-forms panel */
const toks = (s) => String(s).toLowerCase().match(/[a-zäöüßàáâéèêëíîïñóôúûç]+/g) || [];
function formsOf(c) {
  const out = new Set(), add = (s) => toks(s).forEach((t) => out.add(t));
  add(c.fields.Word.replace(/[()]/g, " ")); add(strip(c.fields.Forms));
  for (const m of String(c.fields.Conjugation).matchAll(/<span class="uc-(?:cj-f|dtc)">([\s\S]*?)<\/span>(?=<\/div>|<span class="uc-dtc">)/g)) add(unesc(m[1].replace(/<[^>]+>/g, "")));
  for (const m of String(c.fields.Conjugation).matchAll(/<span class="uc-cj-nfi"><i>[^<]*<\/i><b>([\s\S]*?)<\/b><\/span>/g)) add(unesc(m[1].replace(/<[^>]+>/g, "")));
  return out;
}

/* ---------- the counts a description states, by emit.py's formulas ---------- */
function recount(d) {
  const cards = d.cards, n = cards.length, m = d.meta;
  const arts = cards.filter((c) => c.fields.German.includes("uc-art")).length;
  const plurals = cards.filter((c) => c.fields.Forms.includes(">plural<")).length;
  const fems = cards.filter((c) => c.fields.Forms.includes(">feminine<")).length;
  const comps = cards.filter((c) => c.fields.Forms.includes(">comparative<")).length;
  const verbs = cards.filter((c) => c.fields.Conjugation.includes("Präteritum")).length;
  const refl = cards.filter((c) => /^sich /.test(c.fields.Word)).length;
  const ex3 = cards.filter((c) => (c.fields.Examples.match(/uc-exi/g) || []).length === 3).length;
  const ex0 = cards.filter((c) => !c.fields.Examples).length;
  const sub = (re, to) => { m.desc = m.desc.replace(re, to); };
  m.subtitle = m.subtitle.replace(/^\d+(?= (?:words|expressions)\b)/, String(n));
  sub(/\b\d+(?= words for (?:the Goethe-Zertifikat|reading German))/, String(n));
  sub(/\b\d+(?= expressions of the German)/, String(n));
  sub(/(which leaves the )\d+(?= here)/, "$1" + n);
  sub(/(learnt with the word \()\d+(?= of them\))/, "$1" + arts);
  sub(/(Its plural sits directly beneath it \()\d+(?= of them\))/, "$1" + plurals);
  sub(/(its feminine is given too \()\d+(?=\))/, "$1" + fems);
  sub(/(Each of the )\d+(?= verbs carries)/, "$1" + verbs);
  sub(/(and the )\d+(?= reflexive verbs carry)/, "$1" + refl);
  sub(/(comparative and superlative \()\d+(?= of them\))/, "$1" + comps);
  sub(/(Where the expression is built on a verb \()\d+(?= of them\))/, "$1" + verbs);
  sub(/Real example sentences come with \d+ of the \d+ words, three apiece for \d+ of them and one or two for the rest(; the sentence corpus has nothing at all for the other )?(\d+)?/,
    (all, tail) => "Real example sentences come with " + (n - ex0) + " of the " + n + " words, three apiece for " + ex3 + " of them and one or two for the rest" + (tail ? tail + ex0 : ""));
}

/* ---------- apply ---------- */
const SHELF = ["goethea1", "goethea2", "goetheb1", "germanb2", "germanc1", "germanc2", "germanphr"];
const order = SHELF.filter((id) => byId.has(id)).concat([...byId.keys()].filter((id) => !SHELF.includes(id)));
const noteFix = new Map(), seenNote = new Set();
for (const [k, fix] of Object.entries(REC.notes || {})) {
  const i = k.indexOf("/"), id = k.slice(0, i);
  if (!byId.has(id)) { errors.push(k + ": no goethe deck has the id " + id); continue; }
  (noteFix.get(id) || noteFix.set(id, []).get(id)).push([k.slice(i + 1), fix, k]);
}
for (const id of Object.keys(REC.insert || {})) if (!byId.has(id)) errors.push("insert: no goethe deck has the id " + id);
for (const id of Object.keys(REC.decks || {})) if (!byId.has(id)) errors.push("decks: no goethe deck has the id " + id);
const CARD_KEYS = ["id", "num", "category", "sub", "question", "answer", "answerDate", "traditional", "hanzi", "pinyin", "translations", "abstract", "citation", "answerText", "type", "fields"];

for (const id of order) {
  const { d } = byId.get(id), dm = (REC.decks || {})[id] || {};
  const category = (d.cards.find((c) => c.category) || {}).category || d.meta.title;
  // 1. inserts, so that a higher deck's dropDup can see what this one now carries
  for (const e of (REC.insert || {})[id] || []) {
    const key = id + "/" + e.word + " (insert)";
    if (!e.word || !Number.isInteger(e.id) || !e.why) { errors.push(key + ": an insert needs word, id and why"); continue; }
    const cid = "u_" + id + "_" + e.id;
    const clash = d.cards.find((c) => c.fields.Word === e.word && c.id !== cid && numOf(c, id) !== (PIN[id] || {})[e.word]);
    if (clash) { errors.push(key + ": the deck already cards that headword as " + clash.id); continue; }
    let card = d.cards.find((c) => c.fields.Word === e.word);
    if (!card) {
      card = {}; for (const k of CARD_KEYS) card[k] = "";
      Object.assign(card, { id: cid, num: String(e.id), category, question: e.word, type: "goethe", fields: {} });
      d.cards.push(card);
    }
    if (e.fields) { for (const f of FIELDS) if (typeof e.fields[f] !== "string") errors.push(key + ": fields lacks " + f); card.fields = Object.assign({}, e.fields); }
    else card.fields = { German: e.german || esc(e.word), Word: e.word, English: "", Forms: "", Conjugation: "", Examples: "" };
    if (card.fields.Word !== e.word) errors.push(key + ": fields.Word is " + card.fields.Word);
    card.answer = card.answerText = answerOf(card.fields.English);
    applyFields(card, e, key);
    if (!card.fields.English) errors.push(key + ": no meaning");
  }
  // 2. cards a lower deck carries, and cards that are only a form of another card
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
  for (const [head, by] of Object.entries(dm.dropForm || {})) {
    const i = String(by).indexOf("/"), tDeck = String(by).slice(0, i), t = findNote(by);
    if (!byId.has(tDeck) || order.indexOf(tDeck) > order.indexOf(id)) { errors.push(id + " → dropForm " + head + ": " + tDeck + " is not this deck or a lower one"); continue; }
    if (!t) { errors.push(id + " → dropForm " + head + ": " + by + " names no note"); continue; }
    if (t.fields.Word === head && tDeck === id) { errors.push(id + " → dropForm " + head + ": a note cannot be a form of itself"); continue; }
    if (!toks(head).every((x) => formsOf(t).has(x))) { errors.push(id + " → dropForm " + head + ": " + by + " does not show it in its headword, Forms or All-forms panel"); continue; }
    lost.add(head);
    const before = d.cards.length;
    d.cards = d.cards.filter((c) => c.fields.Word !== head);
    if (before === d.cards.length && VERBOSE) said.push(id + " → dropForm " + head + ": already gone");
  }
  // 3. fields rebuilt on a card the deck already has
  for (const [head, fix, key] of noteFix.get(id) || []) {
    const card = d.cards.find((c) => c.fields.Word === head) || (fix.word && d.cards.find((c) => c.fields.Word === fix.word));
    if (!card) { errors.push(key + ": no note carries that headword" + (fix.word ? " or " + fix.word : "")); continue; }
    if (!fix.why) errors.push(key + ": no why");
    seenNote.add(key);
    if (fix.word && card.fields.Word !== fix.word) {   // a RENAME: the pin's key is renamed with it, the number staying as it is
      const pin0 = PIN[id] || {};
      if (head in pin0 && fix.word in pin0) { errors.push(key + ": both " + head + " and " + fix.word + " are pinned"); continue; }
      if (head in pin0) { pin0[fix.word] = pin0[head]; delete pin0[head]; }   // else the pin was renamed on an earlier run
      card.fields.Word = fix.word; card.question = fix.word;
      if (fix.german === undefined) card.fields.German = esc(fix.word);
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
      errors.push(id + ": german-order.json is not exactly the deck's headwords (not in the deck: " + (extra.slice(0, 5).join(", ") || "none")
        + "; not in the list: " + (lack.slice(0, 5).join(", ") || "none") + ") — run german-order.js");
    else d.cards = list.map((h) => byHead.get(h));
  } else {
    d.cards = d.cards.map((c, i) => [c, i]).sort((a, b) => pin[a[0].fields.Word] - pin[b[0].fields.Word] || a[1] - b[1]).map((x) => x[0]);
  }
}
for (const [, list] of noteFix) for (const [, , key] of list) if (!seenNote.has(key) && !errors.some((e) => e.startsWith(key))) errors.push(key + ": not applied");

/* ---------- a German deck of another type is held to its pinned ids and nothing else ---------- */
for (const { f, d } of GERMAN) {
  if (isGoethe(d)) continue;
  const id = d.meta.id, pin = PIN[id];
  if (!pin) { errors.push(f + ": no rows in german-ids.json for " + id); continue; }
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
if (pinChanged) { console.log(CHECK ? "german-ids.json WOULD CHANGE" : "german-ids.json: rows written"); if (!CHECK) writePin(PIN); }
said.forEach((s) => console.log("  " + s));
const nIns = Object.values(REC.insert || {}).reduce((a, b) => a + b.length, 0);
console.log(nIns + " inserts, " + Object.keys(REC.notes || {}).length + " note fixes, " + Object.keys(ORD).filter((k) => k !== "_").length + " orders, "
  + Object.keys(PIN).filter((k) => !k.startsWith("_")).reduce((a, k) => a + Object.keys(PIN[k]).length, 0) + " pinned ids, "
  + Object.values(PIN._retired || {}).reduce((a, b) => a + Object.keys(b).length, 0) + " retired");
if (changed || pinChanged) {
  if (CHECK) { console.log("\nFAIL  the German decks are out of step with the record — run node .claude/decks/german-fix.js"); process.exit(1); }
  console.log("now run node .claude/decks/build-german-sounds.js and node .claude/build-lang-decks.js");
} else console.log("all German decks match the record, the order and the pinned ids");
