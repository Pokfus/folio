#!/usr/bin/env node
"use strict";
/*
  mandarin-fix.js — THE ONE WAY A MANDARIN DECK IS HAND-EDITED (Sep 2026). Standalone Node helper, zero
  deps. Not part of the site.

    node .claude/decks/mandarin-fix.js [--check] [--verbose]

  WHY IT EXISTS. The Mandarin decks' generator inputs (`w26-*.json`) are NOT in this repo, so unlike the
  DELE, DELF, CAPLE, Goethe and UKBI decks these nine cannot be regenerated: every correction to them is
  a hand edit on top of an artefact nobody can rebuild. Done directly, that leaves no record of WHICH of
  a deck's 11,532 notes were touched or why — and the next session, finding a card that disagrees with
  its generator, cannot tell a deliberate repair from a bug.

  SO THE EDITS LIVE IN `mandarin-fixes.json` AND THIS APPLIES THEM. The file is the record: one entry per
  note, keyed by deck id and headword (readable, and stable across a renumbering where a card id is not),
  each carrying the fields it overrides and a `why`. Running it is IDEMPOTENT — a deck already carrying
  the fixes is left byte-identical — so it is safe to re-run, and `--check` asserts exactly that without
  writing, which is what CI can hold.

  IT REWRITES THE LEGACY MIRRORS TOO. A note carries its reading three times over — `fields.Pinyin`, the
  top-level `pinyin`, and the head of `answer` — and its senses twice, in `fields.English` and again in
  `answer` in an abbreviated form (`(v.)` for `verb`). An edit that moved one and not the others is the
  shape that produced the reported `蛋糕` fault's siblings, so `answer` is REBUILT from the fields rather
  than patched: there is one source for it and it cannot drift.

  `hints` IS A SECOND, SEPARATE MAP, AND IT IS SEPARATE BECAUSE IT IS MECHANICAL. The English → Chinese
  card's front is the gloss and nothing else, so two notes sharing a gloss are one question with two
  right answers. The decks already answer that for 104 pairs, with a `not <other word>` block above the
  senses; `hints` completes it for the 251 pairs that were missing one. It is a map rather than an entry
  per note because there is no judgement in it — the other member of the pair is a fact about the corpus —
  and 502 `why` lines all saying the same thing would bury the 57 that are real editorial decisions.
  A group of THREE OR MORE is deliberately NOT hinted: naming four of five answers on the front of the
  card is worse than the ambiguity, so those are given distinguishing glosses in `notes` instead.

  `types` EDITS THE DECK'S CARD TYPE, which is how a new FIELD reaches the cards at all — a field the
  type does not declare is a field the template engine will not render, so `literally` below would be
  written into every note and shown on none. It is applied before the notes for that reason.

  `ex` ADDS EXAMPLE SENTENCES AS `[chinese, english]` PAIRS and builds the block here. Three things
  about them. They are APPENDED to whatever the note already has, up to the three the card type shows,
  and they carry `uc-exadd` so re-running strips its own additions first rather than stacking them —
  that class is the only thing that makes this idempotent. The headword is BOLDED wherever it appears,
  which is what the generator's own examples do. And they carry NO STRUCTURE LINE: that line is a
  part-of-speech gloss of every word of the sentence with the target's own bolded, and it cannot be
  derived for a sentence written for a different card — a wrong one would be worse than none.

  `mw` IS WRITTEN AS BARE CHARACTERS AND EXPANDED FROM THE CORPUS. A measure word renders as the
  character, its traditional form where that differs, and its pinyin — three facts the decks already
  state 1,148 times over, so `["个","位"]` is expanded from their own table rather than retyped. A
  character the corpus has never used as a measure word is refused rather than guessed at.

  SENSES ARE WRITTEN COMPACTLY AND EXPANDED HERE. `[["yàn","verb","to swallow"],["yān","noun","throat"]]`
  becomes the two `uc-sense` divs the card type renders, with the reading prefix only where a note
  teaches more than one — which is the shape 过, 花, 空 and 重 already use and the shape this pass gave
  the polyphones that were missing their second reading.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const FIXES = path.join(__dirname, "mandarin-fixes.json");
const CHECK = process.argv.includes("--check"), VERBOSE = process.argv.includes("--verbose");

// the abbreviations `answer` uses, derived from the 11,532 notes that already agree on them
const ABBR = {
  adjective: "adj.", adverb: "adv.", conjunction: "conj.", idiom: "idiom.", interjection: "interj.",
  "measure word": "mw.", noun: "n.", numeral: "num.", onomatopoeia: "onom.", particle: "part.",
  phrase: "phr.", prefix: "pref.", preposition: "prep.", pronoun: "pron.", suffix: "suf.", verb: "v.",
};
const abbr = (pos) => pos.split("/").map((p) => ABBR[p.trim()] || p.trim()).join("/");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* senses → the two fields that must agree. `multi` is decided by the sense list rather than passed in,
   so a note that gains a second reading gains its prefixes in both fields in the same pass. */
function renderSenses(senses) {
  const multi = senses.length > 1 && senses.every((s) => s.length === 3);
  const html = senses.map((s) => {
    // 3 = [reading, part of speech, gloss]; 2 = [part of speech, gloss]; 1 = the gloss alone, which is
    // what an idiom has — the decks give none of the 477 a part of speech
    const [rd, pos, gloss] = s.length === 3 ? s : s.length === 2 ? [null, s[0], s[1]] : [null, null, s[0]];
    return '<div class="uc-sense">' + (multi && rd ? esc(rd) + " — " : "") +
      (pos ? '<i class="uc-pos">' + esc(pos) + "</i>" : "") + esc(gloss) + "</div>";
  }).join("");
  const ans = senses.map((s) => {
    const [rd, pos, gloss] = s.length === 3 ? s : s.length === 2 ? [null, s[0], s[1]] : [null, null, s[0]];
    return (multi && rd ? rd + " — " : "") + (pos ? "(" + abbr(pos) + ") " : "") + gloss;
  }).join("; ");
  return { html, ans };
}

/* character → [traditional form (empty where it is the same), pinyin], read off every measure word the
   decks already carry. Derived rather than declared: the rendering has to match the 1,148 notes that
   already have one exactly, and a second copy of that table is a second thing to keep in step. */
const MW = (() => {
  const t = {};
  for (const f of fs.readdirSync(DIR).filter((x) => /^Mandarin-.*\.folio-deck\.json$/.test(x))) {
    const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
    for (const c of d.cards || []) {
      const raw = ((c.fields || {})["Measure word"] || "");
      for (const it of raw.split('<span class="uc-mwi">').slice(1)) {
        const ch = (/<span class="uc-mwc">([^<]*)<\/span>/.exec(it) || [])[1];
        const tr = (/<span class="uc-mwc uc-mwt">([^<]*)<\/span>/.exec(it) || [])[1] || "";
        const pi = (/<span class="uc-mwp">([^<]*)<\/span>/.exec(it) || [])[1];
        if (ch && pi && !t[ch]) t[ch] = [tr, pi];
      }
    }
  }
  return t;
})();

const fixes = JSON.parse(fs.readFileSync(FIXES, "utf8"));
/* `decks` edits a deck's own METADATA rather than a note — currently only the subtitle, which is what
   the Collections page prints under a deck's title. It is here rather than hand-edited into the files
   for the reason everything else is: these decks cannot be regenerated, so an edit with no record is an
   edit the next session cannot tell from a bug. */
const deckMeta = fixes.decks || {};
let metaHit = 0;
const entries = Object.entries(fixes.notes || {});
const seen = new Set();
let changed = 0, files = 0, missing = [], badGloss = [], badMW = [], badDrop = [], badEx = [], badSense = [];

const hints = Object.entries(fixes.hints || {});
const hintsByDeck = new Map();
const seenHint = new Set();
for (const [key, other] of hints) {
  const i = key.indexOf("/");
  const deck = key.slice(0, i), word = key.slice(i + 1);
  if (!hintsByDeck.has(deck)) hintsByDeck.set(deck, new Map());
  hintsByDeck.get(deck).set(word, { key, other });
}

const byDeck = new Map();
for (const [key, fix] of entries) {
  const i = key.indexOf("/");
  const deck = key.slice(0, i), word = key.slice(i + 1);
  if (!byDeck.has(deck)) byDeck.set(deck, new Map());
  byDeck.get(deck).set(word, { key, fix });
}

for (const f of fs.readdirSync(DIR).filter((x) => /^Mandarin-.*\.folio-deck\.json$/.test(x)).sort()) {
  const p = path.join(DIR, f);
  const before = fs.readFileSync(p, "utf8");
  const d = JSON.parse(before);
  const dm = deckMeta[d.meta && d.meta.id];
  if (dm) {
    Object.keys(dm).forEach((k) => { if (k !== "why" && k !== "addFields" && k !== "tpl" && k !== "css") d.meta[k] = dm[k]; });
    /* `css` APPENDS TO EVERY TYPE'S OWN SCOPED SHEET rather than setting a deck field, which is what a
       rule needs that belongs to no one field — the sense tag on an example is written into a block the
       Examples field already owns. Idempotent on the rule's first selector, like `addFields`'s. */
    if (dm.css) {
      for (const t of Object.values(d.meta.types || {})) {
        if (String(t.css || "").indexOf(dm.css.trim().split("\n")[0]) < 0) t.css = String(t.css || "") + dm.css;
      }
    }
    /* A FIELD IS ADDED IN TWO PLACES OR IN NEITHER: the type's `fields` list, and the template that
       renders it. Adding one and not the other is silent — the field is stored and never shown. */
    (dm.addFields || []).forEach((f) => {
      for (const t of Object.values(d.meta.types || {})) {
        if ((t.fields || []).indexOf(f.name) < 0) t.fields.push(f.name);
        (t.cards || []).forEach((card) => {
          if (String(card.back || "").indexOf("{{" + f.name + "}}") >= 0) return;
          card.back = String(card.back).replace(f.after, f.after + f.html);
        });
        // …and the type's own scoped CSS, or the new line renders as an unstyled paragraph
        if (f.css && String(t.css || "").indexOf(f.css.trim().split("\n")[0]) < 0) t.css = String(t.css || "") + f.css;
      }
    });
    metaHit++;
  }
  const want = byDeck.get(d.meta && d.meta.id);
  const wantHint = hintsByDeck.get(d.meta && d.meta.id);
  if (!want && !wantHint && !dm) continue;
  let hits = 0;
  for (const c of d.cards || []) {
    const fl = c.fields || {};
    /* THIS FILE IS AUTHORITATIVE FOR ADDED EXAMPLES, so every block it has ever added is stripped from
       every note FIRST and only what the record still names is put back. Without that, removing an `ex`
       from the record leaves the sentence in the deck and `--check` goes on passing: the decks and their
       own record drift apart silently, which is the one failure this file exists to prevent. It also
       makes the pass idempotent for a note whose fix has been deleted outright. */
    /* AND SO IS EVERY SENSE TAG. `exSense` writes a small label into an example block — including into
       blocks this file did not create — so it has to be stripped from every note first, or a re-run
       stacks a second label and a tag removed from the record stays on the card. Same rule as the added
       examples above and for the same reason: this file is authoritative or it is drift. */
    if (String(fl.Examples || "").indexOf("uc-exsn") >= 0) {
      fl.Examples = String(fl.Examples).replace(/<span class="uc-exsn">[^<]*<\/span>/g, "");
      hits++;
    }
    if (String(fl.Examples || "").indexOf("uc-exadd") >= 0) {
      fl.Examples = String(fl.Examples).split('<div class="uc-exi').filter(Boolean)
        .map((x) => '<div class="uc-exi' + x).filter((x) => x.indexOf("uc-exadd") < 0).join("");
      hits++;
    }
    /* THE HINT IS APPLIED FIRST AND INDEPENDENTLY, so a note may take a hint and a sense rewrite in one
       pass. It is written as the card type's own `not X` block above the senses — the shape the 104
       pairs the decks already carry use — and is REPLACED rather than appended, so re-running cannot
       stack two of them. */
    const h = wantHint && wantHint.get(fl.Simplified);
    if (h) {
      seenHint.add(h.key);
      const body = String(fl.English || "").replace(/^<div class="uc-pos">not [^<]*<\/div>/, "");
      fl.English = '<div class="uc-pos">not ' + esc(h.other) + "</div>" + body;
      hits++;
    }
    const w = want && want.get(fl.Simplified);
    if (!w) continue;
    seen.add(w.key);
    let fix = w.fix;
    /* THE FIELDS THIS RECORD MAY SET, BY NAME. A whitelist rather than "copy every key", because the
       record also carries `why`, `senses`, `mw`, `ex` and the rest, which are compact forms this file
       EXPANDS rather than values to be written through. A field added to the deck's type (see
       `decks.addFields`) has to be named here too, or the column is created and never filled. */
    for (const k of ["Pinyin", "Bopomofo", "Say", "Measure word", "Literally", "Origin", "Examples"]) {
      if (fix[k] !== undefined) fl[k] = fix[k];
    }
    if (fix.ex || fix.dropEx) {
      let kept = String(fl.Examples || "").split('<div class="uc-exi').filter(Boolean)
        .map((x) => '<div class="uc-exi' + x);
      /* `dropEx` names Chinese sentences to REMOVE. It exists for the six cards that showed two
         near-identical sentences under one English translation — the reader sees the same example
         twice, which check-senses.js catches and a comparison of the CHINESE cannot. */
      if (fix.dropEx) {
        /* A `dropEx` THAT MATCHES NOTHING IS REPORTED BUT NOT AN ERROR, and the distinction is the
           whole of why: on the FIRST run a sentence it names should be there, and a mistyped one is a
           removal the record claims and never made — 白酒's three were transcribed by hand and matched
           nothing. On every run AFTER that the sentence is legitimately gone, because a dropped
           original cannot be restored without the generator. So it is a line to read when adding one,
           not a gate; `--check` deliberately ignores it. */
        fix.dropEx.forEach((z) => { if (!kept.some((b) => b.indexOf(z) >= 0)) badDrop.push(w.key + " → " + z); });
        kept = kept.filter((b) => !fix.dropEx.some((z) => b.indexOf(z) >= 0));
      }
      /* `dropEx` FILTERS THE RECORD'S OWN EXAMPLES TOO, not just the deck's. It began as a way to remove
         a sentence the generator had shipped, so it only ever filtered `kept` — and the moment a
         HARVESTED sentence turned out to be wrong (check-example-fit.js found dozens: 上火 illustrated
         inside 赶上火车, 人情 inside 一个人情) the drop appeared to do nothing, because the strip above
         removes the block and this list puts it straight back. Silent, and it reads as a `dropEx` that
         matched nothing. */
      const dropped = (fix.ex || []).filter(([zh]) => (fix.dropEx || []).some((z) => String(zh).indexOf(z) >= 0));
      if (dropped.length) fix.ex = (fix.ex || []).filter(([zh]) => !(fix.dropEx || []).some((z) => String(zh).indexOf(z) >= 0));
      const room = Math.max(0, 3 - kept.length);
      /* AN EXAMPLE MUST CONTAIN THE HEADWORD. A sentence that does not is a typo — a wrong character,
         or a batch row filed against the wrong note — and it renders perfectly: the card shows a
         sentence with nothing bolded in it and no reader can tell it from a sentence Folio chose. */
      (fix.ex || []).forEach(([zh, en]) => {
        if (String(zh).indexOf(fl.Simplified) < 0) badEx.push(w.key + " → " + zh);
        else if (!en || !String(en).trim()) badEx.push(w.key + " → no translation");
      });
      const add = (fix.ex || []).slice(0, room).map(([zh, en]) => {
        const bold = zh.split(fl.Simplified).join("<b>" + fl.Simplified + "</b>");
        return '<div class="uc-exi uc-exadd"><div class="uc-exz">' +
          '<span class="uc-tts uc-exsay" data-say="' + esc(zh) + '"></span>' + bold + "</div>" +
          '<div class="uc-exe">' + esc(en) + "</div></div>";
      });
      fl.Examples = kept.join("") + add.join("");
    }
    if (fix.mw) {
      const bad = fix.mw.filter((ch) => !MW[ch]);
      if (bad.length) { badMW.push(w.key + " → " + bad.join(" ")); continue; }
      fl["Measure word"] = '<span class="uc-mwlab">measure word</span>' + fix.mw.map((ch) => {
        const [trad, pin] = MW[ch];
        return '<span class="uc-mwi"><span class="uc-mwc">' + ch + "</span>" +
          (trad ? '<span class="uc-mwc uc-mwt">' + trad + "</span>" : "") +
          '<span class="uc-mwp">' + pin + "</span></span>";
      }).join("");
    }
    /* `gloss` is `senses` for the common case: ONE sense whose wording changes and whose part of speech
       does not. It exists because the disambiguation pass rewrites 857 glosses and nothing else about
       those cards, and restating each one's part of speech in the record would be 857 chances to get it
       wrong — the card already knows it. A note with several senses must use `senses`, and asking for
       `gloss` on one is refused rather than silently flattening it. */
    if (fix.gloss !== undefined || fix.glossAll !== undefined) {
      const ss = String(fl.English || "").match(/<div class="uc-sense">[\s\S]*?<\/div>/g) || [];
      const m = /<i class="uc-pos">([^<]*)<\/i>/.exec(ss[0] || "");
      /* `gloss` insists on ONE sense: rewording a note that has several would have to guess which one
         it replaces. `glossAll` says outright "replace all of them with this", which is what the idiom
         pass needs — the decks split a run-on definition into four `uc-sense` divs, so "tight-lipped /
         reticent / not breathing a word" is three senses of one meaning rather than three meanings. */
      if (fix.gloss !== undefined && ss.length !== 1) { badGloss.push(w.key + " (" + ss.length + " senses)"); continue; }
      const text = fix.gloss !== undefined ? fix.gloss : fix.glossAll;
      // an idiom carries no part of speech at all, and a sense of one element renders without one
      fix = Object.assign({}, fix, { senses: [m ? [m[1], text] : [text]] });
    }
    if (fix.senses) {
      const r = renderSenses(fix.senses);
      /* A NOTE GIVEN ITS OWN DISTINGUISHING GLOSS NO LONGER NEEDS A HINT, so the `not X` block goes with
         the gloss it was compensating for. Leaving it would point at a word that no longer shares this
         note's meaning — a disambiguator disambiguating nothing, which is worse than none, since a
         reader reads it as a real distinction. `hints` is regenerated from the finished decks, so a
         note that still collides gets its block back on the next pass. */
      fl.English = r.html;
      c.answerText = r.ans;
    }
    /* ---------- WHICH SENSE AN EXAMPLE IS SHOWING (Sep 2026, on request) ----------
       A note with two real senses shows up to three sentences and never says which sense each one is
       for, so a reader meeting 天 as both "sky" and "day" has to work the mapping out themselves.
       `exSense` is a list of sense NUMBERS, one per example block in the order they are rendered, and a
       0 leaves a block untagged — which is what a sentence that shows both, or neither, gets.

       IT IS APPLIED ONLY WHERE THE SENSES ARE REALLY DIFFERENT, and that is a judgement rather than a
       rule: measured over the nine decks, 204 notes carry two or more senses AND two or more examples,
       and most of those "senses" are a dictionary's near-synonym list (没错 has five, all of them "that's
       right"). Tagging a sentence as sense 3 of 5 synonyms is noise dressed as information, so the
       record names the notes rather than the applier sweeping them.

       IT RUNS AFTER `senses`, and that ordering is load-bearing: a note whose senses this same record
       SPLITS is exactly the note worth tagging, and read before the split it counts the senses the
       deck shipped with — which is how 道's third sense tripped its own guard on the first run. */
    if (fix.exSense) {
      const blocks = String(fl.Examples || "").split('<div class="uc-exi').filter(Boolean)
        .map((x) => '<div class="uc-exi' + x);
      const senses = (String(fl.English || "").match(/<div class="uc-sense">/g) || []).length;
      fix.exSense.forEach((nsense, i) => {
        if (!nsense || !blocks[i]) return;
        if (nsense > senses) { badSense.push(w.key + " → example " + (i + 1) + " names sense " + nsense + " of " + senses); return; }
        blocks[i] = blocks[i].replace('<div class="uc-exz">',
          '<div class="uc-exz"><span class="uc-exsn">' + nsense + "</span>");
      });
      if (fix.exSense.length > blocks.length) badSense.push(w.key + " → " + fix.exSense.length + " sense tags for " + blocks.length + " examples");
      fl.Examples = blocks.join("");
      hits++;
    }
    /* THE MIRRORS ARE REBUILT, NEVER PATCHED — see the header. `answer` is "<pinyin> — <senses>" and
       `answerText` the senses alone, which is what the 11,532 untouched notes already are. */
    const gl = c.answerText || "";
    c.pinyin = fl.Pinyin;
    c.answer = fl.Pinyin + " — " + gl;
    c.question = fl.Traditional && fl.Traditional !== fl.Simplified
      ? fl.Simplified + " / " + fl.Traditional : fl.Simplified;
    c.traditional = fl.Traditional || "";
    c.hanzi = fl.Simplified;
    hits++;
  }
  const after = JSON.stringify(d);
  if (after !== before) {
    if (!CHECK) fs.writeFileSync(p, after);
    changed += hits; files++;
    if (VERBOSE || CHECK) console.log((CHECK ? "  WOULD CHANGE " : "  updated ") + f + "  (" + hits + " notes matched)");
  } else if (VERBOSE) console.log("  unchanged " + f + "  (" + hits + " notes already at the fix)");
}
for (const [key] of entries) if (!seen.has(key)) missing.push(key);
for (const [key] of hints) if (!seenHint.has(key)) missing.push(key + " (hint)");

console.log("\n" + entries.length + " fixes, " + hints.length + " reverse-card hints and " +
  (Object.keys(deckMeta).length - (deckMeta.why ? 1 : 0)) + " deck-metadata edits in mandarin-fixes.json, " +
  (seen.size + seenHint.size) + " matched a note, " + metaHit + " matched a deck");
/* A FIX THAT MATCHES NOTHING IS AN ERROR, NOT A NO-OP. It means the headword was mistyped or the deck id
   is wrong, and the correction the record claims to have made has simply not been made — which reads,
   from the file, exactly like one that has. */
if (badDrop.length && VERBOSE) {
  console.log("\n  note  " + badDrop.length + " `dropEx` sentence(s) already gone (expected after the first run;" +
    " on a NEW one, check for a typo):");
  badDrop.forEach((k) => console.log("        " + k));
}
/* A tag naming a sense the note has not got is the shape a hand pass produces when a note's senses are
   later merged or split under it — the label renders perfectly and points at nothing. */
if (badSense.length) {
  console.log("\n  FAIL  " + badSense.length + " sense tag(s) that point at a sense the note has not got:");
  badSense.forEach((k) => console.log("        " + k));
  process.exit(1);
}
if (badEx.length) {
  console.log("\n  FAIL  " + badEx.length + " example(s) that do not contain their own headword:");
  badEx.forEach((k) => console.log("        " + k));
  process.exit(1);
}
/* A measure word the decks have never used is refused rather than rendered from a guess at its pinyin. */
if (badMW.length) {
  console.log("\n  FAIL  " + badMW.length + " `mw` fix(es) naming a character the corpus has no measure word for:");
  badMW.forEach((k) => console.log("        " + k));
  process.exit(1);
}
/* A `gloss` on a multi-sense note would have to guess which sense it replaces, so it is refused. */
if (badGloss.length) {
  console.log("\n  FAIL  " + badGloss.length + " `gloss` fix(es) on a note that has not exactly one sense — use `senses`:");
  badGloss.forEach((k) => console.log("        " + k));
  process.exit(1);
}
if (missing.length) {
  console.log("\n  FAIL  " + missing.length + " fix(es) matched no note:");
  missing.forEach((k) => console.log("        " + k));
  process.exit(1);
}
if (CHECK) {
  if (files) { console.log("\n  FAIL  the decks do not carry their fixes — run without --check"); process.exit(1); }
  console.log("  ok    every deck already carries its fixes");
} else console.log(files ? "  " + changed + " notes written across " + files + " file(s)" : "  nothing to do");
