#!/usr/bin/env node
"use strict";
/*
  paradigm-fix.js — ONE CARD PER PARADIGM in the French, Italian and Portuguese decks (Oct 2026). Standalone
  Node helper, zero deps. Not part of the site.

    node .claude/decks/paradigm-fix.js [--check] [--verbose]

  WHAT IT IS FOR. The request (item 36 of 2026-08-27, picked up again Oct 2026): "an article or a personal
  pronoun should be one card listing all its forms rather than a card per variant". The generators filed
  every form of a closed-class word as a headword of its own, so DELF A1 taught `le`, `la` and `les` as
  three words, `mon`, `ma` and `mes` as three more, and CAPLE A1 `meu` and `minha` as two — while the
  generator's own Forms row on `mon` already listed `ma` and `mes` beside the cards that duplicated it.
  Spanish was folded in Sep 2026 through `spanish-fixes.json` (`el, la, un, una`, `ellos, ellas`); this is
  the same rule for the three languages that have no hand-edit record of their own.

  WHY A RECORD AND NOT A GENERATOR CHANGE. `docs/refinements-2026-08-27.md` §4 H says it: the French word
  list no longer exists in the form the deck was built from, and the Italian and Portuguese inputs are
  hundreds of megabytes of dumps outside the repo. The decks are what ships, so the record edits the decks,
  idempotently, and a rebuild re-runs it as its last step — `spanish-fix.js`'s model.

  WHY THE OLD OBJECTION NO LONGER HOLDS. "Merging notes changes card ids, and a card id is a reader's
  schedule." The survivor keeps the LOWEST id of its group (the earliest, most frequent slot), so the
  schedule on that id carries on; and `langDeckUpdate` merges by id and NEVER deletes, so a reader who
  already holds the deck keeps every folded note and its history. Only a fresh download meets one card.

  THE FILE IS THE RECORD: `paradigm-fixes.json`.
    `notes`  keyed `<deck id>/<headword>` — the headword the note carries BEFORE the fix (its `head` after
             it is matched too, so a second run finds it). Fields, each optional:
      `head`    the new headword, written into Word and into the language field (inside its wrapper).
      `ipa`     the Ipa field (French only).
      `fold`    headwords this note absorbs. Those notes are DELETED. A fold naming a note that is not
                there is normal after the first run and is listed under --verbose.
      `senses`  the English field, rebuilt: `[[pos, [gloss, ...]], ...]`, rendered as the generators do.
      `forms`   the Forms field, rebuilt: `[[label, value], ...]`. The paradigm belongs here.
      `ex`      the Examples field, rebuilt: `[[sentence, translation], ...]`. Every word in `bold` (or,
                without it, every form named in `head`, `forms` and `fold`) is bolded on whole-word
                boundaries that understand accents — JS's `\b` does not.
    `drop`   keyed `<deck id>/<headword>`: a note in ANOTHER deck that is only a form of a paradigm a
             note named by `taughtBy` now teaches (Italian Core's `lo` and `i`, beside CILS A1's article).
             The taughtBy note must exist and name the dropped word in its headword or Forms, or the
             run fails — a drop must never take away a word nothing else teaches.

  A note that matches nothing is an ERROR, as in `spanish-fix.js`. The deck's own word count in its
  subtitle and description is moved with it (only the exact old count, before "words"). `--check` writes
  nothing and exits 1 when a deck would change. Re-run `node .claude/build-lang-decks.js` after a write.
*/
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "..", "decks");
const REC = path.join(__dirname, "paradigm-fixes.json");
const CHECK = process.argv.includes("--check");
const VERBOSE = process.argv.includes("--verbose");

const rec = JSON.parse(fs.readFileSync(REC, "utf8"));
const errors = [];
const notes = [];

const escAttr = (s, apos) => {
  let r = String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return apos ? r.replace(/'/g, "&#x27;") : r;
};
const escText = (s, apos) => {
  let r = String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return apos ? r.replace(/'/g, "&#x27;") : r;
};

function renderSenses(senses, apos) {
  return senses.map(([pos, gls]) => '<div class="uc-sense"><div class="uc-pos">' + escText(pos, apos) + "</div>" +
    (gls.length === 1 ? '<div class="uc-gl">' + escText(gls[0], apos) + "</div>"
      : '<ul class="uc-gls">' + gls.map((g) => "<li>" + escText(g, apos) + "</li>").join("") + "</ul>") + "</div>").join("");
}

function renderForms(forms, apos) {
  return '<div class="uc-forms">' + forms.map(([l, v]) =>
    '<span class="uc-fi"><span class="uc-fl">' + escText(l, apos) + "</span>" + escText(v, apos) + "</span>").join("") + "</div>";
}

/* The words a note's sentences bold: what the record names, else the forms the note itself teaches. */
function boldList(fix, head) {
  if (fix.bold) return fix.bold;
  const out = new Set();
  const add = (s) => String(s).split(/[,;:]/).forEach((w) => { w = w.trim(); if (w && !/\s/.test(w)) out.add(w); });
  add(head);
  (fix.fold || []).forEach(add);
  (fix.forms || []).forEach(([, v]) => add(v));
  return [...out];
}

function boldSentence(sent, words, apos) {
  const alts = [...words].sort((a, b) => b.length - a.length).map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + (/['’]$/.test(w) ? "" : "(?![\\p{L}\\p{M}])"));
  const re = new RegExp("(?<![\\p{L}\\p{M}])(?:" + alts.join("|") + ")", "giu");
  let out = "", at = 0, m, hits = 0;
  while ((m = re.exec(sent))) {
    out += escText(sent.slice(at, m.index), apos) + "<b>" + escText(m[0], apos) + "</b>";
    at = m.index + m[0].length;
    hits++;
  }
  return { html: out + escText(sent.slice(at), apos), hits };
}

function renderEx(ex, words, apos, key) {
  return ex.map(([s, e]) => {
    const b = boldSentence(s, words, apos);
    if (!b.hits) errors.push(key + ": no form of the paradigm in the example \"" + s + "\"");
    return '<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="' + escAttr(s, apos) +
      '"></span>' + b.html + '</div><div class="uc-exe">' + escText(e, apos) + "</div></div>";
  }).join("");
}

function setHead(card, langField, oldHead, head) {
  const f = card.fields;
  if (f[langField] === oldHead) f[langField] = head;
  else if (f[langField].includes(">" + oldHead + "<")) f[langField] = f[langField].replace(">" + oldHead + "<", ">" + head + "<");
  else errors.push(card.id + ": cannot place the new headword in " + langField + " (" + f[langField] + ")");
  f.Word = head;
}

const byDeck = new Map();
const keyed = (obj, kind) => Object.entries(obj || {}).forEach(([k, v]) => {
  const i = k.indexOf("/");
  const deck = k.slice(0, i);
  if (!byDeck.has(deck)) byDeck.set(deck, { notes: [], drop: [] });
  byDeck.get(deck)[kind].push([k.slice(i + 1), v, k]);
});
keyed(rec.notes, "notes");
keyed(rec.drop, "drop");

/* A deck a drop's `taughtBy` names is read too, and written only if the record also edits it. */
const wanted = new Set([...byDeck.keys(), ...Object.values(rec.drop || {}).map((x) => x.taughtBy.split("/")[0])]);
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".folio-deck.json")).sort();
const loaded = new Map();
for (const f of files) {
  const p = path.join(DIR, f);
  const text = fs.readFileSync(p, "utf8");
  const d = JSON.parse(text);
  if (d.meta && wanted.has(d.meta.id)) loaded.set(d.meta.id, { p, f, text, d });
}
for (const id of loaded.keys()) if (!byDeck.has(id)) byDeck.set(id, { notes: [], drop: [] });
for (const id of byDeck.keys()) if (!loaded.has(id)) errors.push("no deck file has the id " + id);

/* Notes first, in every deck, so a drop can test the note that now teaches its word. */
for (const [id, { d, text }] of loaded) {
  const apos = /&#x27;/.test(text);
  const type = d.meta.types[Object.keys(d.meta.types)[0]];
  const langField = type.fields[0];
  for (const [oldHead, fix, key] of byDeck.get(id).notes) {
    const head = fix.head || oldHead;
    const card = d.cards.find((c) => c.fields.Word === oldHead) || d.cards.find((c) => c.fields.Word === head);
    if (!card) { errors.push(key + ": no note carries that headword or " + head); continue; }
    for (const w of fix.fold || []) {
      const gone = d.cards.filter((c) => c !== card && c.fields.Word === w);
      if (!gone.length) { if (VERBOSE) notes.push(key + ": fold " + w + " — already gone"); continue; }
      const lower = gone.find((c) => +c.id.split("_").pop() < +card.id.split("_").pop());
      if (lower) errors.push(key + ": the survivor " + card.id + " is not the lowest id of its group (" + lower.id + ")");
      d.cards = d.cards.filter((c) => !gone.includes(c));
    }
    if (card.fields.Word !== head) setHead(card, langField, card.fields.Word, head);
    if (fix.ipa !== undefined && "Ipa" in card.fields) card.fields.Ipa = fix.ipa;
    if (fix.senses) card.fields.English = renderSenses(fix.senses, apos);
    if (fix.forms) card.fields.Forms = renderForms(fix.forms, apos);
    if (fix.ex) card.fields.Examples = renderEx(fix.ex, boldList(fix, head), apos, key);
  }
}
for (const [id, { d }] of loaded) {
  for (const [w, drop, key] of byDeck.get(id).drop) {
    const [tDeck, ...rest] = drop.taughtBy.split("/");
    const tHead = rest.join("/");
    const t = loaded.get(tDeck) && loaded.get(tDeck).d.cards.find((c) => c.fields.Word === tHead);
    if (!t) { errors.push(key + ": taughtBy " + drop.taughtBy + " names no note"); continue; }
    const taught = (t.fields.Word + " " + t.fields.Forms.replace(/<[^>]+>/g, " ")).split(/[\s,;:]+/);
    if (!taught.includes(w)) { errors.push(key + ": " + drop.taughtBy + " does not name " + w + " in its headword or Forms"); continue; }
    const before = d.cards.length;
    d.cards = d.cards.filter((c) => c.fields.Word !== w);
    if (before === d.cards.length && VERBOSE) notes.push(key + ": already dropped");
  }
}

let changed = 0;
for (const [, { p, f, text, d }] of loaded) {
  const old = JSON.parse(text).cards.length, now = d.cards.length;
  if (old !== now) {
    const fmt = (n) => [String(n), n.toLocaleString("en-GB")];
    const [o1, o2] = fmt(old), [n1, n2] = fmt(now);
    const move = (s) => s.replace(new RegExp("\\b(" + o1 + "|" + o2.replace(",", "\\,") + ")(?= (?:[A-Z][a-z]+ )?words)", "g"),
      (m) => (m.includes(",") ? n2 : n1));
    d.meta.subtitle = move(d.meta.subtitle);
    d.meta.desc = move(d.meta.desc);
  }
  const out = JSON.stringify(d);
  if (out !== text) {
    changed++;
    console.log((CHECK ? "WOULD CHANGE " : "wrote ") + f + "  " + old + " → " + now + " notes");
    if (!CHECK) fs.writeFileSync(p, out);
  }
}
notes.forEach((n) => console.log("  " + n));
if (errors.length) { errors.forEach((e) => console.error("ERROR " + e)); process.exit(1); }
console.log(changed ? (CHECK ? changed + " deck(s) out of step with the record" : changed + " deck(s) written — now run node .claude/build-lang-decks.js")
  : "all decks match the record");
if (CHECK && changed) process.exit(1);
