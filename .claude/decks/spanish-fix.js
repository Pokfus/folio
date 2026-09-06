#!/usr/bin/env node
"use strict";
/*
  spanish-fix.js — THE ONE WAY A SPANISH (DELE) DECK IS HAND-EDITED (Sep 2026). Standalone Node helper,
  zero deps. Not part of the site.

    node .claude/decks/spanish-fix.js [--check] [--verbose]

  WHY IT EXISTS, AND WHY IT IS NOT QUITE `mandarin-fix.js`'s REASON. The Mandarin decks cannot be
  regenerated at all — their generator inputs are not in this repo — so every correction to them is a
  hand edit on an artefact nobody can rebuild. The DELE decks CAN be rebuilt, from `.claude/dele/`, and
  that is the harder case rather than the easier one: a hand edit made straight into the deck file
  survives exactly until the next `run.py`, which silently puts the fault back. So the record is what
  makes a correction durable, and re-running it after a rebuild is the last step of a rebuild.

  IT IS FOR THE EDITORIAL HALF ONLY. Two of the faults this pass found are the GENERATOR's and belong
  there rather than here: `examples.py` matches a sentence on any inflected form Wiktionary lists for the
  lemma, so a card can be illustrated by a word that is another card's headword, and the bolding can land
  on a token that is not the headword at all. What lives here is the judgement a generator cannot make —
  which senses a word actually has, which sentence shows them, and which of several cards are one word.

  THE FILE IS THE RECORD: `spanish-fixes.json`, one entry per note, keyed by `<deck id>/<headword>` (the
  headword as the GENERATOR writes it, which is stable across a renumbering where a card id is not), each
  carrying the fields it overrides and a `why`. Running it is IDEMPOTENT — a deck already carrying the
  fixes is left byte-identical — and `--check` asserts exactly that without writing.

  A FIX THAT MATCHES NO NOTE IS AN ERROR, not a no-op: it means the headword was mistyped or the deck id
  is wrong, and a correction the record claims and never made reads, from the file, exactly like one that
  was made.

  ---- what an entry may carry ----

  `spanish` / `word`  RENAME the headword and the string the speaker is handed. Used by a FOLD: four
      article cards become one, and the survivor's headword becomes `el, la`. A renamed note is matched
      by its ORIGINAL key or by its new `spanish`, so the rename is idempotent.

  `fold`  the headwords this note absorbs. Those cards are DELETED. After the first run they are gone,
      so a `fold` naming a card that is not there is reported and is not an error — the same semantics
      `dropEx` has and for the same reason: on a NEW entry it is a line to read, afterwards it is normal.
      Folding CHANGES THE DECK'S CARD COUNT, so re-run `.claude/build-lang-decks.js` after.

  `senses`  the English field, rebuilt. `[[pos, [gloss, ...]], ...]` — one `uc-sense` block per pair,
      rendered as the generator renders it: a single gloss as `uc-gl`, several as a `uc-gls` list. It is
      REBUILT rather than patched so there is one source for it and it cannot drift.

  `forms`  the Forms field, rebuilt. `[[label, value], ...]`. This is where a PARADIGM or a usage note
      belongs — never in `senses`, which is a list of TRANSLATIONS. A usage note standing among the
      translations is the fault this pass found on `de` ("used after the thing owned and before the
      owner" was rendered as if it were an English equivalent of the word).

  `ex` / `dropEx` / `maxEx`  example sentences, as `[spanish, english]` pairs. Added blocks carry
      `uc-exadd` and every block this file has ever added is STRIPPED before the record is re-applied, so
      removing an `ex` from the record removes it from the deck — without that the two drift apart in
      silence. `dropEx` names Spanish sentences to remove by substring. `maxEx` is 3 by default, the
      number the generator gives every card; raise it only where the record says why.

  `rebold`  re-bold every example on this note against the note's OWN forms, stripping whatever the
      generator bolded. This is the local repair for the second generator fault: `el`'s first example is
      "Sé que el dinero no LO es todo", where the sentence is right and the highlight is on `lo`. Bold
      targets are derived from `spanish` and `forms` — the headword with any leading article stripped,
      which is what the generator bolds on a noun — and matched with UNICODE-AWARE word boundaries,
      since JS's `\b` is ASCII-only and an accented letter reads to it as a boundary of its own.

  `hints`  a separate, mechanical map: the English → Spanish card's front is the gloss and nothing else,
      so two notes sharing a gloss are one question with two right answers. `por` and `para` both gloss
      to "for". Written as the card type's own `uc-pos` line above the senses, REPLACED rather than
      appended so a re-run cannot stack two. It is a map rather than an entry per note because there is
      no judgement in it. A group of THREE OR MORE is deliberately not hinted — naming three of four
      answers on the front is worse than the ambiguity — and is given distinguishing glosses instead.

  `decks`  the deck's own metadata. `subtitle` is set outright; `descSub` is `[find, replace]` pairs over
      the description, each of which must either match (and is replaced) or be already applied — a pair
      matching neither is an error. A FOLD changes what the deck holds, and a description that goes on
      counting the old number is the fault `check-counts.js` exists for one directory over.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const FIXES = path.join(__dirname, "spanish-fixes.json");
const CHECK = process.argv.includes("--check"), VERBOSE = process.argv.includes("--verbose");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

/* THE ENGLISH FIELD, REBUILT IN THE GENERATOR'S OWN MARKUP. One gloss renders as `uc-gl` and several as
   a `uc-gls` list — that is the shape emit.py writes, and a second shape here would be a second thing
   for the card type's CSS to keep up with. */
function renderSenses(senses) {
  return senses.map(([pos, gls]) => {
    const body = gls.length === 1
      ? '<div class="uc-gl">' + esc(gls[0]) + "</div>"
      : '<ul class="uc-gls">' + gls.map((g) => "<li>" + esc(g) + "</li>").join("") + "</ul>";
    return '<div class="uc-sense">' + (pos ? '<div class="uc-pos">' + esc(pos) + "</div>" : "") + body + "</div>";
  }).join("");
}
const renderForms = (forms) => !forms.length ? "" : '<div class="uc-forms">' + forms.map(
  ([lab, val]) => '<span class="uc-fi"><span class="uc-fl">' + esc(lab) + "</span>" + esc(val) + "</span>"
).join("") + "</div>";

/* BOLD TARGETS. The generator bolds the bare word, so a noun's leading article is stripped; a headword
   that teaches a pair or a paradigm ("el, la", "bueno, buena") contributes each member, and so does
   every value in `forms`. Longest first, so `unos` is not bolded as `un` + `os`. */
function boldTargets(fix, spanish) {
  const out = new Set();
  const add = (s) => String(s).split(/[,/·]| or /).map((x) => x.trim())
    .forEach((x) => { if (x && !/\s/.test(x)) out.add(x); });
  add(String(spanish).replace(/^(el|la|los|las)\s+/, ""));
  (fix.forms || []).forEach(([, v]) => add(v));
  return [...out].sort((a, b) => b.length - a.length);
}
const RXSAFE = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function bold(sent, targets) {
  const plain = sent.replace(/<\/?b>/g, "");
  if (!targets.length) return plain;
  // Unicode-aware boundaries: JS's \b is defined over ASCII \w, so an accented letter stands as a
  // boundary of its own and a \b-anchored pattern matches INSIDE an accented word.
  const rx = new RegExp("(?<![\\p{L}\\p{N}_])(" + targets.map(RXSAFE).join("|") +
    ")(?![\\p{L}\\p{N}_])", "giu");
  return plain.replace(rx, "<b>$1</b>");
}
const exBlock = (es, en, targets, extra) =>
  '<div class="uc-exi' + (extra || "") + '"><div class="uc-exz">' +
  '<span class="uc-tts uc-exsay" data-say="' + esc(es) + '"></span>' + bold(es, targets) + "</div>" +
  '<div class="uc-exe">' + esc(en) + "</div></div>";
const splitEx = (s) => String(s || "").split('<div class="uc-exi').filter(Boolean).map((x) => '<div class="uc-exi' + x);
const exText = (b) => (/<div class="uc-exz">(?:<span[^>]*><\/span>)?([\s\S]*?)<\/div>/.exec(b) || ["", ""])[1].replace(/<\/?b>/g, "");

const fixes = JSON.parse(fs.readFileSync(FIXES, "utf8"));
const deckMeta = fixes.decks || {};
const entries = Object.entries(fixes.notes || {});
const hints = Object.entries(fixes.hints || {});

const byDeck = new Map(), hintsByDeck = new Map();
for (const [key, fix] of entries) {
  const i = key.indexOf("/"), deck = key.slice(0, i), word = key.slice(i + 1);
  if (!byDeck.has(deck)) byDeck.set(deck, new Map());
  byDeck.get(deck).set(word, { key, word, fix });
}
for (const [key, other] of hints) {
  const i = key.indexOf("/"), deck = key.slice(0, i), word = key.slice(i + 1);
  if (!hintsByDeck.has(deck)) hintsByDeck.set(deck, new Map());
  hintsByDeck.get(deck).set(word, { key, other });
}

const seen = new Set(), seenHint = new Set();
let changed = 0, files = 0, metaHit = 0, dropped = 0;
const missing = [], badEx = [], badFold = [], badSub = [];

for (const f of fs.readdirSync(DIR).filter((x) => /^DELE-.*\.folio-deck\.json$/.test(x)).sort()) {
  const p = path.join(DIR, f);
  const before = fs.readFileSync(p, "utf8");
  const d = JSON.parse(before);
  const id = d.meta && d.meta.id;
  const dm = deckMeta[id];
  const want = byDeck.get(id), wantHint = hintsByDeck.get(id);
  if (!want && !wantHint && !dm) continue;
  let hits = 0;

  if (dm) {
    if (dm.subtitle !== undefined) d.meta.subtitle = dm.subtitle;
    (dm.descSub || []).forEach(([from, to]) => {
      if (String(d.meta.desc).indexOf(from) >= 0) d.meta.desc = d.meta.desc.split(from).join(to);
      else if (String(d.meta.desc).indexOf(to) < 0) badSub.push(id + " → " + from);
    });
    metaHit++;
  }

  /* THE FOLD RUNS FIRST. A folded-away card may itself be named in `dropEx` or reused as an example on
     the survivor, and deleting it afterwards would leave the survivor built from a card list this pass
     had already changed under it. */
  const foldAway = new Set();
  for (const w of (want ? want.values() : [])) (w.fix.fold || []).forEach((x) => foldAway.add(x));
  if (foldAway.size) {
    const n = d.cards.length;
    d.cards = d.cards.filter((c) => !foldAway.has(c.fields.Spanish));
    if (d.cards.length !== n) { dropped += n - d.cards.length; hits += n - d.cards.length; }
    const still = new Set(d.cards.map((c) => c.fields.Spanish));
    foldAway.forEach((x) => { if (still.has(x)) badFold.push(id + " → " + x + " survived the fold"); });
  }

  for (const c of d.cards || []) {
    const fl = c.fields || {};
    // this file is authoritative for the blocks it adds: strip them all, then put back what it names
    if (String(fl.Examples || "").indexOf("uc-exadd") >= 0) {
      fl.Examples = splitEx(fl.Examples).filter((x) => x.indexOf("uc-exadd") < 0).join("");
      hits++;
    }
    const h = wantHint && wantHint.get(fl.Spanish);
    if (h) {
      seenHint.add(h.key);
      const body = String(fl.English || "").replace(/^<div class="uc-pos">not [^<]*<\/div>/, "");
      fl.English = '<div class="uc-pos">not ' + esc(h.other) + "</div>" + body;
      hits++;
    }
    // matched by the ORIGINAL key, or by the new headword a rename has already written — so a fold that
    // has run once is not reported as a fix that matched nothing
    let w = want && want.get(fl.Spanish);
    if (!w && want) for (const cand of want.values()) if (cand.fix.spanish === fl.Spanish) { w = cand; break; }
    if (!w) continue;
    seen.add(w.key);
    const fix = w.fix;

    if (fix.spanish !== undefined) fl.Spanish = fix.spanish;
    if (fix.word !== undefined) fl.Word = fix.word;
    if (fix.senses) fl.English = (h ? '<div class="uc-pos">not ' + esc(h.other) + "</div>" : "") + renderSenses(fix.senses);
    if (fix.forms) fl.Forms = renderForms(fix.forms);

    const targets = boldTargets(fix, fl.Spanish);
    if (fix.ex || fix.dropEx || fix.rebold) {
      let kept = splitEx(fl.Examples);
      if (fix.dropEx) {
        fix.dropEx.forEach((z) => { if (!kept.some((b) => exText(b).indexOf(z) >= 0)) badFold.push(w.key + " → dropEx already gone: " + z); });
        kept = kept.filter((b) => !fix.dropEx.some((z) => exText(b).indexOf(z) >= 0));
      }
      if (fix.rebold) kept = kept.map((b) => {
        const t = exText(b);
        return b.replace(/(<div class="uc-exz">(?:<span[^>]*><\/span>)?)[\s\S]*?(<\/div>)/, "$1" + bold(t, targets).replace(/\$/g, "$$$$") + "$2");
      });
      /* AN EXAMPLE MUST CONTAIN THE WORD IT ILLUSTRATES. A sentence that does not renders perfectly —
         the card shows a sentence with nothing bolded in it — and no reader can tell it from a sentence
         the deck chose on purpose. */
      (fix.ex || []).forEach(([es, en]) => {
        if (!targets.some((t) => new RegExp("(?<![\\p{L}\\p{N}_])" + RXSAFE(t) + "(?![\\p{L}\\p{N}_])", "iu").test(es)))
          badEx.push(w.key + " → " + es);
        else if (!en || !String(en).trim()) badEx.push(w.key + " → no translation");
      });
      const room = Math.max(0, (fix.maxEx || 3) - kept.length);
      fl.Examples = kept.join("") + (fix.ex || []).slice(0, room)
        .map(([es, en]) => exBlock(es, en, targets, " uc-exadd")).join("");
    }
    hits++;
  }

  const after = JSON.stringify(d);
  if (after !== before) {
    if (!CHECK) fs.writeFileSync(p, after);
    changed += hits; files++;
    if (VERBOSE || CHECK) console.log((CHECK ? "  WOULD CHANGE " : "  updated ") + f + "  (" + hits + " edits)");
  } else if (VERBOSE) console.log("  unchanged " + f + "  (already at the fix)");
}

for (const [key] of entries) if (!seen.has(key)) missing.push(key);
for (const [key] of hints) if (!seenHint.has(key)) missing.push(key + " (hint)");

console.log("\n" + entries.length + " fixes, " + hints.length + " reverse-card hints and " +
  Object.keys(deckMeta).length + " deck-metadata edits in spanish-fixes.json, " +
  (seen.size + seenHint.size) + " matched a note, " + metaHit + " matched a deck" +
  (dropped ? ", " + dropped + " card(s) folded away" : ""));

if (badFold.length) {
  console.log("\n  note  " + badFold.length + " line(s) already applied (expected after the first run;" +
    " on a NEW entry, check for a typo):");
  badFold.forEach((k) => console.log("        " + k));
}
if (badSub.length) {
  console.log("\n  FAIL  " + badSub.length + " `descSub` pair(s) matching neither the old text nor the new:");
  badSub.forEach((k) => console.log("        " + k)); process.exit(1);
}
if (badEx.length) {
  console.log("\n  FAIL  " + badEx.length + " example(s) that do not contain their own headword:");
  badEx.forEach((k) => console.log("        " + k)); process.exit(1);
}
if (missing.length) {
  console.log("\n  FAIL  " + missing.length + " fix(es) matched no note:");
  missing.forEach((k) => console.log("        " + k)); process.exit(1);
}
if (CHECK) {
  if (files) { console.log("\n  FAIL  the decks do not carry their fixes — run without --check"); process.exit(1); }
  console.log("  ok    every deck already carries its fixes");
} else console.log(files ? "  " + changed + " edits written across " + files + " file(s)" : "  nothing to do");
