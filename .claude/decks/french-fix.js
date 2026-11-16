#!/usr/bin/env node
"use strict";
/*
  french-fix.js — THE ONE WAY A FRENCH (DELF / DALF) DECK IS HAND-EDITED, ORDERED AND NUMBERED (Nov 2026, the
  French beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/french-fix.js --seed-ids   # write french-ids.json from the decks (refused once it exists)
    node .claude/decks/french-fix.js [--check] [--verbose]

  WHY IT EXISTS. The seven French decks CAN be rebuilt (`.claude/delf/`, Python, ~760 MB of live corpora),
  and a rebuild refreshes every gloss and sentence of the level it builds and numbers the cards by position.
  So an edit made straight into a deck file lasts until the next `run.py`, and a rebuilt deck hands every
  reader's schedule to another word (the Update press merges progress by card id). This is `spanish-fix.js`'s
  answer, for French: a record that is re-applied after a rebuild, an order, and a pin that is APPLIED.

  HOW IT SITS BESIDE `paradigm-fix.js`. That script and `paradigm-fixes.json` stay the record of the FOLDS
  (le, la; mon, ma; ce, cette …), shared with Italian and Portuguese, and run FIRST: they delete notes and
  rename survivors. This one runs after it and holds everything else. After a rebuild:
      paradigm-fix.js → french-fix.js → french-order.js (only if the order is to be recomputed) →
      french-fix.js → build-french-sounds.js → ../build-lang-decks.js
  It was not folded into paradigm-fix.js because that file's one job is three languages' paradigms, and
  neither an order nor a pin belongs to Italian or Portuguese.

  WHICH DECKS. Every deck in `decks/` whose file name has "French" in it and whose card type is `delf` —
  by CARD TYPE, so the phrases deck is covered and the sounds deck (`frsound`, written by
  build-french-sounds.js) is not edited here and is still held to its pinned ids.

  THE RECORD: `french-fixes.json`.
    `decks.<id>`   `subtitle` (set outright), `descSub` ([find, replace] pairs over the description, checked
                   together: a pair is satisfied if it matched or if its replacement stands in the finished
                   text), and `dropDup` ({headword: lowerDeckId} — DELETE this deck's card for a word a lower
                   deck now carries; checked against that deck's headwords, so it can never take away a word
                   nothing else teaches; a card already gone is normal).
    `notes`        keyed `<deck id>/<headword>`: `senses` ([[pos, [gloss, …]], …], the English field rebuilt),
                   `forms` ([[label, value], …], the Forms field rebuilt). A key matching no note is an ERROR.
    `hints`        `<deck id>/<headword>` → the other headword: ", not X" on the first part-of-speech line,
                   the generator's own way of telling two cards with one English apart. Replaced, never stacked.
    `gender`       `<deck id>/<headword>` → { dict, as }. The generator printed `la` on every noun the
                   dictionary gives as "m or f" (la bus, la légume, la touriste). `dict` is the dictionary's own
                   head line, quoted; `as` is how it is carded: "by sense" (a person, le or la by who is meant:
                   the masculine first, as the dictionary prints it, and both in the Forms row), "m or f"
                   (masculine first, both under un/une where the article elides) or "m" (masculine; the
                   feminine the head line gives is regional). The headword is renamed (la bus → le bus) and
                   the pin's key is renamed with it, the number staying.
    `insert`       `<deck id>` → a list. Each entry has an `id` above every number the generator can mint,
                   the headword it stands `after`, and EITHER `note` (a card MOVED from another deck, its
                   fields verbatim; `moved` names where from) OR `word`, `ipa`, `senses`, `forms`, `ex`
                   ([[french, english], …]) and, for a noun, `art` ("m" / "f"). Every entry's `why` names its
                   sources. Idempotent on the id.

  `french-order.json`  `{ <deck id>: { why, order: [headword, …] } }`, written by french-order.js and applied
      LAST: the notes are put in that order and nothing else about them moves. A list that is not exactly
      the deck's headwords is refused. A deck with no entry keeps the order it has.

  `french-ids.json`  `{ <deck id>: { <headword>: N } }` for the id `u_<deck id>_N` (and the note's `num`),
      seeded from the decks as shipped on 2026-11-16. DELF A1 (433 notes, highest 446) and B2 (1,653, highest
      1,654) were already not positional: paradigm-fix.js had folded notes away before any pin existed, so
      those thirteen and one numbers are below the highest and are never dealt again (a new note takes a
      number ABOVE the highest ever used). A row is never deleted: a note this record removes (`dropDup`)
      moves to `_retired`. A pinned note missing for any other reason fails the run.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const FIXES = path.join(__dirname, "french-fixes.json"), ORDER_FILE = path.join(__dirname, "french-order.json"), IDS_FILE = path.join(__dirname, "french-ids.json");
const argv = process.argv.slice(2), CHECK = argv.includes("--check"), VERBOSE = argv.includes("--verbose"), SEED = argv.includes("--seed-ids");
const fail = (m) => { console.error("\n  FAIL  " + m); process.exit(1); };
const LEVELS = ["delfa1", "delfa2", "delfb1", "delfb2", "dalfc1", "dalfc2", "frphrases"];

const ALL = fs.readdirSync(DIR).filter((x) => /French/.test(x) && /\.folio-deck\.json$/.test(x)).sort().map((f) => {
  const text = fs.readFileSync(path.join(DIR, f), "utf8");
  return { f, text, d: JSON.parse(text) };
});
const isDelf = (d) => !!(d.meta && d.meta.types && d.meta.types.delf);
const DELF = new Map(ALL.filter((x) => isDelf(x.d)).map((x) => [x.d.meta.id, x]));
for (const id of LEVELS) if (!DELF.has(id)) fail("no deck " + id + " (card type delf) in decks/");

const writePin = (pin) => fs.writeFileSync(IDS_FILE, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n");
if (SEED) {
  if (fs.existsSync(IDS_FILE)) fail("french-ids.json exists — a pin is seeded once and never re-seeded");
  const out = { _: "french-ids.json — the number in each French card's id, pinned to its note: <deck id> → <headword> (the Word field; a sounds-deck row's key) → N, for the id u_<deck id>_N. Seeded from the decks as shipped on 2026-11-16 by french-fix.js --seed-ids, before anything moved. Never delete or renumber a row: the Update press merges a reader's progress by card id. A note the record removes moves to _retired; a rename renames the key. DELF A1 (highest 446 for 433 notes) and B2 (1,654 for 1,653) had notes folded away by paradigm-fix.js before this file existed; those numbers have no row and are never dealt again, a new note taking a number above the highest." };
  for (const id of LEVELS) {
    const pin = {};
    for (const c of DELF.get(id).d.cards) {
      const m = /^u_[a-z0-9]+_(\d+)$/.exec(c.id), k = c.fields.Word;
      if (!m || c.id !== "u_" + id + "_" + m[1]) fail(id + ": unexpected card id " + c.id);
      if (k in pin) fail(id + ": two notes share the headword " + k);
      pin[k] = Number(m[1]);
    }
    out[id] = pin;
  }
  out._retired = {};
  writePin(out);
  console.log("seeded french-ids.json: " + LEVELS.map((id) => id + " " + DELF.get(id).d.cards.length).join(", "));
  process.exit(0);
}

const REC = fs.existsSync(FIXES) ? JSON.parse(fs.readFileSync(FIXES, "utf8")) : {};
const ORD = fs.existsSync(ORDER_FILE) ? JSON.parse(fs.readFileSync(ORDER_FILE, "utf8")) : {};
if (!fs.existsSync(IDS_FILE)) fail("no french-ids.json — run --seed-ids first");
const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8")), PIN_BEFORE = JSON.stringify(PIN);

/* ---------- the generator's own markup (emit.py): text escaped for & < >, a raw apostrophe ---------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => esc(s).replace(/"/g, "&quot;");
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const renderSenses = (senses) => senses.map(([pos, gls]) => '<div class="uc-sense">' + (pos ? '<div class="uc-pos">' + esc(pos) + "</div>" : "") +
  (gls.length === 1 ? '<div class="uc-gl">' + esc(gls[0]) + "</div>" : '<ul class="uc-gls">' + gls.map((g) => "<li>" + esc(g) + "</li>").join("") + "</ul>") + "</div>").join("");
const renderForms = (forms) => !forms || !forms.length ? "" : '<div class="uc-forms">' + forms.map(([l, v]) =>
  '<span class="uc-fi"><span class="uc-fl">' + esc(l) + "</span>" + esc(v) + "</span>").join("") + "</div>";
const genderGrid = (m, f) => '<div class="uc-gt uc-gt2"><div class="uc-gth">masculine</div><div class="uc-gth">feminine</div><div class="uc-gtc">' + esc(m) + '</div><div class="uc-gtc">' + esc(f) + "</div></div>";
const artHTML = (art, g, bare) => '<span class="uc-art uc-' + g + '">' + art + "</span>" + (art === "l'" ? "" : " ") + esc(bare);
const VOWEL = /^[aàâeéèêëiîïoôuùûüyœæh]/i;
const RXSAFE = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function boldSentence(sent, words) {
  const alts = [...words].sort((a, b) => b.length - a.length).map((w) => RXSAFE(w) + "(?![\\p{L}\\p{M}])");
  const re = new RegExp("(?<![\\p{L}\\p{M}])(?:" + alts.join("|") + ")", "giu");
  let out = "", at = 0, m, hits = 0;
  while ((m = re.exec(sent))) { out += esc(sent.slice(at, m.index)) + "<b>" + esc(m[0]) + "</b>"; at = m.index + m[0].length; hits++; }
  return { html: out + esc(sent.slice(at)), hits };
}
const flatGlosses = (senses) => senses.flatMap((s) => s[1]).slice(0, 3).join("; ");

const errors = [], notes = [], removed = new Set(), renamed = new Map();
const keyed = (obj) => { const m = new Map(); for (const [k, v] of Object.entries(obj || {})) { const i = k.indexOf("/"), id = k.slice(0, i); if (!m.has(id)) m.set(id, []); m.get(id).push([k.slice(i + 1), v, k]); } return m; };
const NOTES = keyed(REC.notes), HINTS = keyed(REC.hints), GENDER = keyed(REC.gender);
for (const m of [NOTES, HINTS, GENDER]) for (const id of m.keys()) if (!DELF.has(id)) errors.push("the record names a deck that is not here: " + id);
for (const id of Object.keys(REC.insert || {}).concat(Object.keys(REC.decks || {}))) if (!DELF.has(id)) errors.push("the record names a deck that is not here: " + id);

let ordered = 0, pinned = 0, files = 0;
for (const id of LEVELS) {
  const { f, text, d } = DELF.get(id);
  const category = d.cards[0] && d.cards[0].category;
  const byWord = () => new Map(d.cards.map((c) => [c.fields.Word, c]));
  const dm = (REC.decks || {})[id];

  if (dm) {
    if (dm.subtitle !== undefined) d.meta.subtitle = dm.subtitle;
    const pend = [];
    (dm.descSub || []).forEach(([from, to]) => { if (String(d.meta.desc).indexOf(from) >= 0) d.meta.desc = d.meta.desc.split(from).join(to); else pend.push([from, to]); });
    pend.forEach(([from, to]) => { if (String(d.meta.desc).indexOf(to) < 0) errors.push(id + ": descSub matches neither the old text nor the new: " + from.slice(0, 70)); });
  }

  /* A WORD A LOWER DECK NOW CARRIES. The lower deck is read as this run has left it (in memory, levels in
     order), so the claim that justifies the deletion is tested against what will be written. */
  for (const [head, lower] of Object.entries((dm && dm.dropDup) || {})) {
    const low = DELF.get(lower);
    if (!low || LEVELS.indexOf(lower) >= LEVELS.indexOf(id) || !low.d.cards.some((c) => c.fields.Word === head)) { errors.push(id + " → dropDup " + head + ": " + lower + " does not carry it"); continue; }
    const n = d.cards.length;
    d.cards = d.cards.filter((c) => c.fields.Word !== head);
    removed.add(id + "/" + head);
    if (d.cards.length === n && VERBOSE) notes.push(id + " → dropDup " + head + ": already gone");
  }

  /* THE GENDER THE DICTIONARY GIVES. See the header: masculine first, as its head line prints it. */
  for (const [old, g, key] of GENDER.get(id) || []) {
    const m = /^(la |le |l')(.+)$/.exec(old);
    if (!m || !/^(by sense|m or f|m)$/.test(g.as) || !g.dict) { errors.push(key + ": a gender entry needs an article on its key, `dict` and `as`"); continue; }
    const bare = m[2], elided = m[1] === "l'", word = elided ? old : "le " + bare;
    const c = byWord().get(old) || byWord().get(word);
    if (!c) { errors.push(key + ": no note carries " + old + " or " + word); continue; }
    if (word !== old) renamed.set(id + "/" + old, word);
    c.fields.Word = word; c.question = word;
    c.fields.French = artHTML(elided ? "l'" : "le", "m", bare);
    const label = g.as === "m" ? "noun, masculine" : "noun, masculine or feminine";
    c.fields.English = c.fields.English.replace(/(<div class="uc-pos">)noun, (?:feminine or masculine|masculine or feminine|masculine)(?=[,<])/g, "$1" + label);
    let forms = String(c.fields.Forms || "");
    if (elided) {
      const un = g.as === "m" ? "un " + bare : "un " + bare + ", une " + bare;
      if (!/<span class="uc-fl">with un\/une<\/span>/.test(forms)) forms = renderForms([["with un/une", un]]) + forms;
      else forms = forms.replace(/(<span class="uc-fl">with un\/une<\/span>)[^<]*/, "$1" + esc(un));
    } else if (g.as === "by sense") {
      const grid = genderGrid("le " + bare, "la " + bare);
      forms = grid + forms.split(grid).join("");
    }
    c.fields.Forms = forms;
  }

  /* SENSES AND FORMS, rebuilt from the record. */
  for (const [head, fix, key] of NOTES.get(id) || []) {
    const c = byWord().get(head);
    if (!c) { errors.push(key + ": no note carries that headword"); continue; }
    if (fix.senses) { c.fields.English = renderSenses(fix.senses); c.answer = c.answerText = flatGlosses(fix.senses); }
    if (fix.forms) c.fields.Forms = renderForms(fix.forms);
  }

  /* NEW CARDS, keyed on the id. A moved card is its old note, verbatim, under a number of this deck. */
  for (const ins of (REC.insert || {})[id] || []) {
    if (!/^u_[a-z0-9]+_\d+$/.test(ins.id) || ins.id.indexOf("u_" + id + "_") !== 0) { errors.push(id + ": insert with a bad id " + ins.id); continue; }
    if (d.cards.some((c) => c.id === ins.id)) continue;
    const num = ins.id.split("_").pop();
    let card;
    if (ins.note) card = Object.assign({}, ins.note, { id: ins.id, num, category, fields: Object.assign({}, ins.note.fields) });
    else {
      const bare = ins.word, art = ins.art ? (VOWEL.test(bare) ? "l'" : ins.art === "m" ? "le" : "la") : "";
      const word = art ? art + (art === "l'" ? "" : " ") + bare : bare;
      const targets = ins.bold || [bare];
      const ex = (ins.ex || []).map(([fr, en]) => {
        const b = boldSentence(fr, targets);
        if (!b.hits) errors.push(id + "/" + word + " (insert): the example does not contain the word: " + fr);
        if (!en || !String(en).trim()) errors.push(id + "/" + word + " (insert): an example without a translation");
        return '<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="' + escAttr(fr) + '"></span>' + b.html + '</div><div class="uc-exe">' + esc(en) + "</div></div>";
      }).join("");
      const ans = flatGlosses(ins.senses || []);
      card = { id: ins.id, num, category, sub: "", question: word, answer: ans, answerDate: "", traditional: "", hanzi: "", pinyin: "",
        translations: "", abstract: "", citation: "", answerText: ans, type: "delf",
        fields: { French: art ? artHTML(art, ins.art, bare) : esc(word), Word: word, Ipa: ins.ipa || "", English: renderSenses(ins.senses || []),
          Forms: renderForms(ins.forms), Conjugation: "", Examples: ex } };
    }
    if (byWord().has(card.fields.Word)) { errors.push(id + ": insert " + card.fields.Word + " — the deck already has a note with that headword"); continue; }
    const at = d.cards.findIndex((c) => c.fields.Word === ins.after);
    if (at < 0) { errors.push(id + " → insert " + card.fields.Word + ": no card '" + ins.after + "' to sit after"); continue; }
    d.cards.splice(at + 1, 0, card);
  }

  /* THE REVERSE-CARD HINTS, after the inserts so that an inserted card can carry one. */
  for (const [head, other, key] of HINTS.get(id) || []) {
    const c = byWord().get(head);
    if (!c) { errors.push(key + " (hint): no note carries that headword"); continue; }
    if (!byWord().has(other)) { errors.push(key + " (hint): the deck has no " + other); continue; }
    if (!/<div class="uc-pos">/.test(c.fields.English)) { errors.push(key + " (hint): the card has no part-of-speech line"); continue; }
    c.fields.English = c.fields.English.replace(/(<div class="uc-pos">)([^<]*?)(?:, not [^<]*)?(<\/div>)/, (_, a, pos, z) => a + pos + ", not " + esc(other) + z);
  }

  /* THE ORDER, LAST of the content steps: only the position of a note changes. */
  let refused = false;
  const ord = ORD[id];
  if (ord && Array.isArray(ord.order)) {
    const map = byWord(), list = ord.order, uniq = new Set(list);
    if (map.size !== d.cards.length) { errors.push(id + ": two notes share a headword"); refused = true; }
    else if (uniq.size !== list.length || list.length !== d.cards.length || list.some((h) => !map.has(h))) {
      const lack = d.cards.map((c) => c.fields.Word).filter((h) => !uniq.has(h)), extra = list.filter((h) => !map.has(h));
      errors.push(id + ": french-order.json has " + list.length + " headwords, the deck " + d.cards.length +
        (lack.length ? "; not in the order: " + lack.slice(0, 8).join(", ") : "") + (extra.length ? "; not in the deck: " + extra.slice(0, 8).join(", ") : ""));
      refused = true;
    } else { d.cards = list.map((h) => map.get(h)); ordered++; }
  }

  /* THE PINNED IDS, APPLIED: a rebuilt deck comes back numbered by position, and this hands every note the
     number a reader's progress is filed under. */
  if (!refused) {
    const pin = PIN[id] || (PIN[id] = {}), ret = (PIN._retired = PIN._retired || {});
    for (const [k, to] of renamed) { const i = k.indexOf("/"); if (k.slice(0, i) === id && k.slice(i + 1) in pin && !(to in pin)) { pin[to] = pin[k.slice(i + 1)]; delete pin[k.slice(i + 1)]; } }
    const here = new Set(d.cards.map((c) => c.fields.Word));
    if (here.size !== d.cards.length) errors.push(id + ": two notes share a headword, so a headword cannot key an id");
    for (const k of Object.keys(pin)) if (!here.has(k)) {
      if (removed.has(id + "/" + k)) { (ret[id] = ret[id] || {})[k] = pin[k]; delete pin[k]; }
      else errors.push(id + "/" + k + ": pinned as " + pin[k] + ", not in the deck");
    }
    const used = () => Math.max(0, ...Object.values(pin), ...Object.values(ret[id] || {}));
    const floor = used(), seen = new Map();
    for (const c of d.cards) {
      const k = c.fields.Word;
      if (!(k in pin)) {
        const own = /^u_[a-z0-9]+_(\d+)$/.exec(String(c.id)), n = own ? Number(own[1]) : 0;
        pin[k] = n > floor && !new Set(Object.values(pin)).has(n) ? n : used() + 1;
      }
      if (seen.has(pin[k])) errors.push(id + ": " + k + " and " + seen.get(pin[k]) + " are both pinned to " + pin[k]);
      seen.set(pin[k], k);
      c.id = "u_" + id + "_" + pin[k]; c.num = String(pin[k]);
    }
    pinned++;
  }

  const after = JSON.stringify(d);
  DELF.get(id).after = after;
  if (after !== text) { files++; if (VERBOSE || CHECK) console.log((CHECK ? "  WOULD CHANGE " : "  updated ") + f + "  (" + d.cards.length + " notes)"); }
  else if (VERBOSE) console.log("  unchanged " + f);
}

/* A French deck this record does not edit (the sounds deck) is still held to its pinned ids. */
for (const { f, d } of ALL) {
  if (isDelf(d)) continue;
  const id = d.meta && d.meta.id, pin = PIN[id];
  if (!pin) { errors.push(id + " (" + f + "): no rows in french-ids.json"); continue; }
  for (const c of d.cards) {
    if (!(c.key in pin)) errors.push(id + "/" + c.key + ": not pinned (" + c.id + ")");
    else if (c.id !== "u_" + id + "_" + pin[c.key]) errors.push(id + "/" + c.key + ": id " + c.id + ", pinned u_" + id + "_" + pin[c.key]);
  }
}

notes.forEach((n) => console.log("  " + n));
if (errors.length) { console.log("\n  FAIL  " + errors.length + " problem(s); nothing written:"); errors.slice(0, 60).forEach((e) => console.log("        " + e)); process.exit(1); }
const pinChanged = JSON.stringify(PIN) !== PIN_BEFORE;
console.log("  " + Object.keys(REC.notes || {}).length + " note fixes, " + Object.keys(REC.hints || {}).length + " hints, " + Object.keys(REC.gender || {}).length +
  " genders, " + Object.values(REC.insert || {}).reduce((a, b) => a + b.length, 0) + " inserts; " + ordered + " deck(s) held to french-order.json, " + pinned + " numbered from french-ids.json");
if (CHECK) {
  if (pinChanged) fail("a note has no pinned id, or a removed note's row is not retired — run without --check");
  if (files) fail("the decks do not carry their fixes — run without --check");
  console.log("  ok    every French deck already carries its fixes, its order and its pinned ids");
} else {
  for (const id of LEVELS) { const x = DELF.get(id); if (x.after !== x.text) fs.writeFileSync(path.join(DIR, x.f), x.after); }
  if (pinChanged) writePin(PIN);
  console.log(files ? "  " + files + " file(s) written" + (pinChanged ? "; french-ids.json: rows added, renamed or retired" : "") + " — now run node .claude/build-lang-decks.js" : "  nothing to do");
}
