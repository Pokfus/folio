#!/usr/bin/env node
/*
  check-cards.js — the card-level faults NOTHING else in the pipeline can see.

    node .claude/check-cards.js [--prefix=gr-] [--verbose] [--report]

  Exit 1 on a violation, so it guards a batch the way check-style.js and
  check-questions.js do.  `--report` never exits 1: it prints the same findings as
  a work list, which is how a content pass is planned rather than gated.

  WHY THIS FILE EXISTS.  Every check here was written after a real fault reached the
  shipped collection and no tool reported it:

  1. AN AUTHOR CITED IN MORE THAN TWO OF ONE CARD'S SOURCES.  `add-card.js` checks a
     citation ends in a URL, `source-audit.js` counts them and `check-citations.js`
     checks the names against Crossref — all of them pass a card whose whole apparatus
     is one work.  gr-056 cited a single Dartmouth course website eight times out of ten
     and every existing check called it fully sourced.  ANCIENT AUTHORS ARE COUNTED
     SEPARATELY: Herodotus cited six times is six passages of one witness, which is a
     different fault from six pages of one modern scholar, and the two are reported
     under their own headings so neither hides the other.

  2. A MODERN SCHOLAR NAMED IN A QUESTION.  `card-focus.js` already reports this and
     CANNOT SEE MOST OF IT: it takes the names it looks for from the AUTHOR POSITIONS of
     the card's own citations, so a scholar named in a question but not cited on that
     card is invisible to it.  It reported one card for the Greece collection; an
     independent sweep found thirteen.  This one works the other way round — it reads the
     question for the SHAPE of an attribution ("X argues", "X's graph", "according to X")
     and asks only afterwards whether the name is an ancient witness.

  3. ONE PICTURE ON TWO CARDS.  Compared on the Commons FILE NAME with the size prefix
     stripped, because the same file at two widths is two different `src` strings and a
     plain comparison misses it: gr-267 and gr-379 carried the same map for weeks at
     1920px and 1280px.

  4. A PICTURE DESCRIPTION THAT NAMES ITS OWN SOURCE.  The credit line under a picture
     already carries the file URL, so a description ending "…, CC BY 3.0, via Wikimedia
     Commons" prints the attribution twice and spends the caption on it.  276 of the
     Greece collection's 411 descriptions did this.

  5. A CARD WITH NO PICTURE AND NO REASON.  Reported, never failed — plenty of terms
     cannot be depicted and an empty frame is the right answer for them.  It is a work
     list, not a rule.

  6. MORE THAN ONE SOURCE IN THE SAME NON-ENGLISH LANGUAGE.  English is preferred where
     it serves equally well, and a card resting on two French excavation reports is one
     most readers cannot check.  Detected from the journal and publisher names, so it is
     a proxy: read the card before acting on it.

  7. A QUOTATION THAT IS NOT IN THE BOOK IT NAMES.  `card.quote` puts a passage of a shelved
     Library book on the card and a button through to it, and `test-card-quote.js` asserts the
     placement and the address — neither of them the WORDS.  So a quotation can be silently
     re-punctuated, re-worded or elided across a gap and still render perfectly under a link to
     the real text: gr-467 joined two passages 200 words apart with no ellipsis, opened on an
     editorial "He" where Thucydides names Pericles, and set the translator's `--` as an em dash.
     Every passage is checked against the generated `books/<id>.js` it names, an explicit ` … `
     marking a gap and each side of it checked on its own.  A book that is not on disk is skipped
     rather than failed.

  WHAT IT REPORTS TODAY, so a run is not read as a regression.  Over the whole corpus it
  finds a large standing backlog of 1 and 6 — the Ancient Greece collection's early decks
  rest heavily on one Dartmouth course site and on the French excavation reports, because
  the substitutes are not reachable from this sandbox (the seven measured routes are in
  `docs/greece-audit-2026-09.md`).  Those are recorded rather than papered over, so it is a
  REPORT TOOL run by hand and is deliberately NOT in the CI fast gate.  Run it with
  `--prefix=` over the cards a batch touches and leave the backlog alone.

  WHAT IT DELIBERATELY DOES NOT CHECK.  Whether a question names its topic's most
  important aspect, and whether a picture is really of its subject.  Both are judgements
  no regular expression can make; the first is stated in check-questions.js's own header
  and the second is why `.claude/contact-sheet.py` exists.
*/
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
const VERBOSE = args.includes("--verbose");
const REPORT  = args.includes("--report");
const PREFIX  = (args.find(a => a.startsWith("--prefix=")) || "").slice(9);

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
const win = loadWindow(path.join(ROOT, "data.js"));

/* THE GLOSSARY IS THE DISCRIMINATOR FOR RULE 2, and it is the right one because it is the
   collection's own register of what its words NAME.  "Athenian Constitution" and "White Castle"
   match the shape of an attribution and are a work and a place; both are glossary surfaces, and
   most modern scholars are not.  Read through gloss-io.js, which loads BOTH glossary files —
   glossary.js alone yields empty tables.

   BUT A MODERN SCHOLAR CAN BE A GLOSSARY TERM, AND THAT IS EXACTLY THE CASE THE RULE IS FOR.
   The pairing rule gives every card's answer its own entry, so an excavator who is herself a
   card's subject has one — `Harriet_Boyd_Hawes`, with "Harriet Boyd" as an alias — and a flat
   glossary exemption therefore SUPPRESSED the one real finding it was meant to leave standing
   (gr-014 Q3, "Harriet Boyd excavated …").  A term is withheld from the exemption when it is
   tagged `person` and its date line begins after 1500: that is the site's own record of a modern
   figure, made where the term was written rather than guessed at from the name. */
const MODERN_FROM = 1500;
const GL = (() => {
  try {
    const g = require("./gloss-io.js").loadGlossary();
    const tags = g.GLOSSARY_TAGS || {}, dates = g.GLOSSARY_DATES || {};
    const modern = (k) => {
      if (!(tags[k] || []).includes("person")) return false;
      const y = String(dates[k] || "").match(/\d{3,4}/);
      return !!y && +y[0] >= MODERN_FROM;
    };
    const set = new Set();
    for (const k of Object.keys(g.GLOSSARY || {})) {
      if (modern(k)) continue;
      set.add(k.replace(/_/g, " ").toLowerCase());
      for (const a of g.GLOSSARY_ALIASES[k] || []) set.add(String(a).toLowerCase());
    }
    return set;
  } catch { return new Set(); }
})();
const cards = (win.CARD_DATA || []).filter(c => !PREFIX || String(c.id).startsWith(PREFIX));

const plain = s => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

/* ---------- 1. one author across a card's sources ---------- */

/* An ancient author is a WITNESS, not a researcher (the same distinction card-focus.js
   draws), so the two are counted apart.  The list is of authors the collections actually
   cite; add to it rather than loosening the pattern. */
const ANCIENT = /^(herodotus|thucydides|aristotle|plutarch|pausanias|strabo|aeschylus|diodorus|xenophon|homer|hesiod|plato|isocrates|demosthenes|lysias|andocides|pindar|polybius|vitruvius|athenaeus|apollodorus|arrian|nepos|justin|aelian|suda|pliny|cicero|livy|ovid|virgil|tacitus|suetonius|josephus|sima qian|ban gu)\b/i;

/* The author field of a Chicago note is what stands before the first quoted title.  A
   work with no author (a museum record, an institutional page) falls back to the text
   before the first full stop, which is that body's name. */
function authorOf(src) {
  const t = plain(src);
  /* A citation that OPENS on its title has no author — an anonymous museum or institutional
     record.  Reading the title as the author gave gr-333 an author called “Athens”, and three
     records of one museum then looked like one scholar cited three times. */
  if (/^[“"]/.test(t)) return "";
  const m = t.match(/^(.*?),\s*[“"]/);
  if (m) return m[1].trim();
  /* THE COMMA, NOT THE FULL STOP, IS WHAT ENDS AN AUTHOR FIELD.  A book's title is italicised
     rather than quoted, so the pattern above cannot see it — and a full-stop fallback then reads
     an INITIAL as the whole name: “H. B. Walters, History of Ancient Pottery …” gave an author
     called “H”, so the same three citations of one book were filed under a scholar named for a
     letter.  Chicago note form puts the given name first, so nothing before the first comma is
     ever part of a title. */
  const m2 = t.match(/^([^,]{2,80}),\s/);
  if (m2) return m2[1].trim();
  const m3 = t.match(/^(.*?)\.\s/);
  return (m3 ? m3[1] : t.slice(0, 60)).trim();
}
const surnameKey = a => a.split(",")[0].trim().toLowerCase();

/* ---------- 2. a modern scholar named in a question ---------- */

const ATTRIB = new RegExp(
  "\\b([A-Z][a-zA-Z\\u00C0-\\u024F.'-]+(?:\\s+[A-Z][a-zA-Z\\u00C0-\\u024F.'-]+){0,2})" +
  "(?:'s\\s+(?:graph|count|chronology|reading|case|dating|view|argument|edition|excavation)" +
  "|\\s+(?:argues?|argued|reads?|has read|holds?|held|proposes?|proposed|showed|shows?|suggests?|suggested|" +
  "identifies|identified|maintains?|denies|denied|concludes?|concluded|counted|thought|calls|called|" +
  "puts?|sets? out|takes? it|took it|finds?|found))\\b", "g");

/* Words that open a sentence and are not names.  A capitalised place or period followed
   by "puts"/"shows" is the prose doing its job, not an attribution. */
/* A DECLARED LIST BEATS A LOOSER PATTERN, and it is kept short with a reason beside each entry.
   The shapes above separate a modern scholar from an ancient name well enough that what is left
   over is a handful of English-named PLACES the prose really does put in front of a verb of
   agency.  Widening the pattern to catch them would start excusing real findings; naming them
   cannot.  Add one only after reading the card. */
const NOT_A_SCHOLAR = new Set([
  "White Castle",   // gr-478: the Persian citadel of Memphis, which "held them"
]);

const NOT_A_NAME = /^(The|A|An|This|That|It|Its|His|Her|Their|One|Some|Most|Many|Others|Both|Each|What|When|Where|Who|Nothing|Modern|Ancient|Later|Recent|Tradition|Scholars|Evidence|Radiocarbon|Excavation|Survey|Analysis|Work|Study|Studies|Research|Pottery|Linear|Greek|Greeks|Athens|Sparta|Rome|Egypt|Crete|Cyprus|Sicily|Italy|Troy|Delphi|Olympia|Asia|Europe|Africa|Bronze|Iron|Early|Middle|Late|Old|New|North|South|East|West|Upper|Lower|First|Second|Third|Fourth|Fifth)\b/;

/* ---------- 6. a non-English source, by the name of the work it appears in ---------- */

const LANGS = [
  ["French",     /\b(revue|études|étude|bulletin de correspondance|persée|française d'Athènes|comptes rendus|chronique|cahiers|mélanges|l'antiquité)\b/i],
  ["German",     /\b(zeitschrift|jahrbuch|mitteilungen|archäolog|untersuchungen|beiträge|forschungen|athenische)\b/i],
  ["Italian",    /\b(rivista|annuario|della scuola|bollettino|quaderni|ricerche)\b/i],
  ["Spanish",    /\b(revista|estudios|boletín|cuadernos|anales de)\b/i],
  ["Greek",      /[Α-Ωα-ω]{4,}/],
  ["Portuguese", /\b(revista brasileira|cadernos de)\b/i],
];

/* ---------- run ---------- */

const fails = [], notes = [];
const imgByFile = new Map();

for (const c of cards) {
  const id = c.id, srcs = c.sources || [];

  // 1
  const modern = {}, ancient = {};
  for (const s of srcs) {
    const a = authorOf(s), k = surnameKey(a);
    if (!k) continue;
    (ANCIENT.test(a) ? ancient : modern)[k] = ((ANCIENT.test(a) ? ancient : modern)[k] || 0) + 1;
  }
  for (const [k, n] of Object.entries(modern))
    if (n > 2) fails.push(["over-cited", `${id}: ${k} in ${n} of ${srcs.length} sources`, id]);
  for (const [k, n] of Object.entries(ancient))
    if (n > 2 && n / srcs.length >= 0.5)
      notes.push(["one-witness", `${id}: ${k} carries ${n} of ${srcs.length} sources`, id]);

  // 2
  for (const [qi, q] of [c.question, ...(c.questions || [])].entries()) {
    const t = plain(q);
    for (const m of t.matchAll(ATTRIB)) {
      const nm = m[1].trim();
      if (ANCIENT.test(nm) || NOT_A_NAME.test(nm)) continue;
      /* A MODERN SCHOLAR IS WRITTEN GIVEN + SURNAME, AND ALMOST NOTHING ELSE IN THIS PROSE IS.
         An ancient figure is a single name (Lichas, Gobryas, Androtion, Themistocles), a place is
         a single name (Miletus, Ephesus, Munich), and a king carries a regnal numeral (Agis IV).
         Requiring two capitalised words and refusing those two shapes is what separates "Harriet
         Boyd excavated" from "Gobryas advised", which the verb alone cannot. */
      if (!/\s/.test(nm)) continue;                          // one word: an ancient name or a place
      if (/\b[IVXLC]+$/.test(nm)) continue;                   // a regnal numeral: an ancient ruler
      if (/^(While|When|Where|After|Before|Since|Though|Although|Because|If)\b/.test(nm)) continue;
      if (GL.has(nm.toLowerCase())) continue;                 // a glossary surface: a work, a place, a people
      if (/^(Archaic|Classical|Hellenistic|Athenian|Spartan|Persian|Greek|Roman|Minoan|Mycenaean|Cretan|Ionian|Dorian|Aeolian|Corinthian|Lydian|Egyptian|Phoenician)\b/.test(nm)) continue;
      if (NOT_A_SCHOLAR.has(nm)) continue;
      fails.push(["scholar-in-question", `${id} Q${qi + 1}: “${nm}”`, t]);
    }
  }

  // 3 + 4 + 5
  if (c.image && c.image.src) {
    /* THE KEY IS THE SOURCE FILE, NOT THE THUMBNAIL'S NAME. A thumb URL is
       …/thumb/<a>/<ab>/<FILE>/<width>px-<FILE>, so the last segment normally carries the file name with a
       width prefix — but Commons TRUNCATES a long one to the literal "1920px-thumbnail.jpg", and stripping
       the prefix then leaves every such picture keyed "thumbnail.jpg". Two entirely different pictures
       compare equal, which reported the Hopewell mica face and a 1930s Senate hearing as one photograph.
       The segment BEFORE the width is the real file name and is never truncated; fall back to the last
       segment for a URL that is not a thumb. */
    const parts = String(c.image.src).split("/");
    const wIdx = parts.findIndex((p) => /^\d+px-/.test(p));
    const file = decodeURIComponent(wIdx > 0 ? parts[wIdx - 1] : parts[parts.length - 1])
      .replace(/^\d+px-/, "").toLowerCase();
    if (!imgByFile.has(file)) imgByFile.set(file, []);
    imgByFile.get(file).push(id);
    if (/via wikimedia commons|public domain,|\bCC[ -]?BY\b|\bCC0\b/i.test(String(c.image.desc || "")))
      fails.push(["source-in-caption", `${id}: the description carries its own credit`, String(c.image.desc).slice(0, 120)]);
  } else if (!c.video) {
    notes.push(["no-picture", `${id}: ${c.answerText || ""}`, id]);
  }

  // 6
  const per = {};
  for (const s of srcs) { const t = plain(s); for (const [n, rx] of LANGS) if (rx.test(t)) { per[n] = (per[n] || 0) + 1; break; } }
  for (const [n, k] of Object.entries(per))
    if (k > 1) fails.push(["same-language", `${id}: ${k} sources in ${n}`, id]);
}

for (const [file, ids] of imgByFile)
  if (ids.length > 1) fails.push(["duplicate-image", `${ids.join(", ")} share one picture`, file]);

/* ---------- 7. a quotation against the book it names ---------- */

const BOOKS = {};
function shelved(id) {
  if (id in BOOKS) return BOOKS[id];
  const f = path.join(ROOT, "books", id + ".js");
  if (!fs.existsSync(f)) return (BOOKS[id] = null);
  const win = { FOLIO_BOOKS_IN: [] };
  new Function("window", fs.readFileSync(f, "utf8"))(win);
  return (BOOKS[id] = win.FOLIO_BOOKS_IN.find(b => b.id === id) || null);
}
for (const c of cards) {
  const q = c.quote;
  if (!q || !q.book) continue;
  const b = shelved(q.book);
  if (!b) { fails.push(["quote-book-missing", `${c.id}: no books/${q.book}.js on disk`, q.book]); continue; }
  const ch = (b.chapters || []).find(x => String(x.n) === String(q.n));
  if (!ch) { fails.push(["quote-section-missing", `${c.id}: ${q.book} has no section ${q.n}`, q.cite || ""]); continue; }
  /* A BARE NUMBER IS THE EDITION'S APPARATUS, NOT THE TEXT.  Several shelved editions run their
     section and verse numbers inline — Herodotus' chapter numbers, the Rigveda's verse numbers —
     and a quotation rightly leaves them out, so comparing the raw strings fails on every
     verse-numbered book.  Both sides drop tokens that are purely digits before matching. */
  const norm = t => " " + String(t).replace(/<[^>]*>/g, " ").split(/\s+/)
    .filter(w => w && !/^\d+$/.test(w)).join(" ") + " ";
  const flat = norm(ch.html);
  const said = norm(q.text).trim();
  /* ` … ` is the author saying a gap was cut.  Anything else must be there word for word. */
  for (const part of said.split(" … "))
    if (part && flat.indexOf(part) < 0)
      fails.push(["quote-not-verbatim", `${c.id} (${q.cite || q.book + " " + q.n}): a passage is not in the book`, part.slice(0, 90)]);
}

/* ---------- print ---------- */

const group = rows => {
  const by = {};
  for (const [tag, why, extra] of rows) (by[tag] = by[tag] || []).push([why, extra]);
  return by;
};
const show = (by, head) => {
  for (const [tag, rows] of Object.entries(by)) {
    console.log(`\n${head} ${tag} — ${rows.length}`);
    for (const [why, extra] of rows) { console.log(`  ${why}`); if (VERBOSE) console.log(`      ${extra}`); }
  }
};

console.log(`${cards.length} cards checked${PREFIX ? ` (prefix ${PREFIX})` : ""}.`);
show(group(notes), "note:");
if (!fails.length) { console.log("\nAll card rules pass."); process.exit(0); }
show(group(fails), "FAIL:");
console.log(`\n${fails.length} violation${fails.length === 1 ? "" : "s"}.`);
process.exit(REPORT ? 0 : 1);
