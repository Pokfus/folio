/* .claude/book-audit.js — WHAT CANNOT BE RIGHT IN A SHIPPED BOOK, WHATEVER ITS SOURCE.
   node .claude/book-audit.js

   The third scanner, beside book-scan.js (probable transcription slips) and book-vary.js (one name
   written two ways), and it asks a different question from both: not "is this word right?" but "is
   this a thing a finished book should contain at all?" — a replacement character, a double-escaped
   entity, an unresolved [Greek: ] marker, a Gutenberg sentinel, an empty paragraph, an unbalanced
   tag, a page number sitting in the run of prose. It reads the shipped `books/*.js` rather than a
   cache, so it measures what a reader actually gets, and it needs no network and no dictionary.

   IT PRODUCES EVIDENCE, NEVER A VERDICT, like its two siblings. Several of its checks fire on things
   that are perfectly correct: Marco Polo's seven bare ampersands are all `&c.` for *et cetera*, which
   is what Yule prints; the Summa's one page reference is inside a note that is citing a page. Read
   the finding before repairing it.

   ITS FIRST RUN (Sep 2026, batch E33) FOUND DON QUIXOTE'S 86 ITALIC PASSAGES SHIPPING AS LITERAL
   UNDERSCORES — a fault nothing else on the shelf could see, because every word in the book is
   spelled correctly and every tag is balanced. That is the argument for a check written against the
   FORM of a finished text rather than against its words.

   Not part of the site. */

const fs = require("fs"), path = require("path");
const DIR = "/home/user/folio/books";
global.window = { FOLIO_BOOKS_IN: [], FOLIO_BOOK_ORIG_IN: [] };
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".js"));
for (const f of files) require(path.join(DIR, f));
const en = window.FOLIO_BOOKS_IN, or = window.FOLIO_BOOK_ORIG_IN;
console.log(en.length + " English books, " + or.length + " originals\n");

const CHECKS = [
  ["U+FFFD replacement character", /�/g],
  ["a double-escaped entity", /&amp;(?:amp|lt|gt|quot|#\d+|nbsp);/g],
  ["a raw ampersand that is not an entity", /&(?!amp;|lt;|gt;|quot;|#\d+;|#x[0-9a-f]+;|nbsp;|mdash;|hellip;)/gi],
  ["an unresolved beta-code Greek marker", /\[Greek:/g],
  ["a Gutenberg illustration sentinel", /\[Illustration/gi],
  ["a Gutenberg transcriber sentinel", /\[Transcriber/gi],
  ["a control character", /[\x00-\x08\x0B\x0C\x0E-\x1F]/g],
  /* THE DOUBLED SPACE IS GONE FROM THIS TABLE (Sep 2026, batch E55), and the reason is not that its
     nineteen findings were benign — it is that IT CANNOT HAVE A REAL ONE. A book's prose is rendered
     as HTML inside `.bk-page`, nothing on that path sets `white-space`, and HTML collapses a run of
     spaces to one: a doubled space in a chapter is invisible to every reader of the site, so a check
     that names it is reporting a fault the medium has already fixed. What WOULD show is a run of
     `&nbsp;`, which does not collapse — measured over all 80 files, there are none.

     ITS NINETEEN FINDINGS WERE ALSO ALL LEGITIMATE, which is the second reason and the sharper one.
     Every one is a wider space after a sentence, which is how both those transcriptions set their
     text: the Latin Boethius has nine ("blanditias.  Postremo"), the Middle English Chaucer ten, and
     all ten of Chaucer's are the rubric between a tale's parts — "Explicit prima Pars.  Sequitur
     pars secunda." So the row cost two books a permanent finding apiece for something no reader can
     see, and E53 is what that leads to: nineteen entries nobody had a reason to read hid the Latin
     Seneca's cruces in the same report for twenty batches. A SCANNER WHOSE FINDINGS NOBODY READS HAS
     STOPPED WORKING, so a check that can only ever cry wolf is worse than no check at all. */
  ["an empty paragraph", /<p[^>]*>\s*<\/p>/g],
  ["an empty emphasis", /<(i|b|em|strong)>\s*<\/\1>/g],
  ["a stray closing tag with no text", /<\/(p|i|b)>\s*<\/\1>/g],
  ["a page-number artefact inside prose", /\s\[?p{1,2}\.?\s?\d{1,4}\]?\s/g],
  ["an OCR sentinel run of punctuation", /[~^_]{1,}[A-Za-z]|[A-Za-z][~^_]{1,}[A-Za-z]/g],
  /* MARKUP THE SOURCE ESCAPED, WHICH THE READER SEES AS CHARACTERS (Sep 2026, batch E45). Eight of
     these shipped for months — `<poem>` opening two laisses of the Song of Roland, `<poem>` and a
     mangled `<§/poem>` round a quotation of Horace in the City of God's Latin, and a raw
     `<A HREF="errata.htm#0">…</A>` around a word of two Rigveda hymns — and no check here could see
     one: every word is spelled correctly, every tag balances, and the chapter is the right length.
     `fetch-book.js` drops them now, at the write; this is what says whether any remain.

     THE THREE TESTS ARE THE EXTRACTOR'S OWN, and they are narrow for a reason that matters more than
     the check: a critical text supplies words the manuscripts lack INSIDE ANGLE BRACKETS. Godley's
     Herodotus writes "the <Pisidians> had little shields", Ross's Aristotle "<are not wicked>", the
     Latin Seneca does it about ninety times — including "<a>", which is a preposition AND a tag
     name. 166 such passages stand on the shelf and every one of them is the edition. So: a CLOSING
     tag (an editor writes a word, never `</word>`), a tag carrying an ATTRIBUTE (an editor supplies
     words, never `name="value"`), or a MediaWiki extension tag from a DECLARED list — nothing else. */
  ["an escaped closing tag printed as characters", /&lt;[^a-zA-Z&<>]{0,3}\/\s*[a-zA-Z][a-zA-Z0-9]{0,14}\s*&gt;/g],
  ["an escaped tag with an attribute, printed as characters",
   /&lt;\/?[a-zA-Z][a-zA-Z0-9]{0,14}\s+[a-zA-Z][a-zA-Z0-9-]{0,20}\s*=\s*"[^"&]{0,200}"[^&<>]{0,40}&gt;/g],
  ["an escaped MediaWiki extension tag, printed as characters",
   /&lt;\s*(?:poem|nowiki|pre|ref|references|gallery|math|score|syntaxhighlight|timeline|includeonly|noinclude|onlyinclude)\s*\/?\s*&gt;/gi],
];

/* A PARAGRAPH THE BOOK CARRIES TWICE IN ONE CHAPTER (Sep 2026, batch E35). Nothing else here can see
   it: every word is spelled right, the tags balance, the chapter is the right length, and what the
   reader gets is a passage printed twice. It found three articles of the Summa that Wikisource sets
   under their neighbour's number — each of which meant an article of Aquinas MISSING from the book,
   not merely repeated. Long paragraphs only, because a short one may honestly recur (a refrain, a
   formula, a stage direction). */
function repeatedParas(book, strip) {
  let n = 0, first = "";
  for (const c of book.chapters || []) {
    const ps = (c.html.match(/<p[^>]*>[\s\S]*?<\/p>/g) || []).map(strip).filter((t) => t.length > 120);
    const seen = new Set();
    for (const t of ps) { if (seen.has(t)) { n++; if (!first) first = "ch" + c.n + ": " + t.slice(0, 70); } seen.add(t); }
  }
  return { n: n, first: first };
}

function tagsBalanced(html) {
  const VOID = new Set(["br", "hr", "img", "input", "meta", "link"]);
  const stack = [];
  const rx = /<(\/?)([a-z][a-z0-9]*)\b[^>]*?(\/?)>/gi;
  let m;
  while ((m = rx.exec(html))) {
    const close = m[1] === "/", tag = m[2].toLowerCase(), self = m[3] === "/";
    if (VOID.has(tag) || self) continue;
    if (!close) stack.push(tag);
    else { if (!stack.length) return "closes </" + tag + "> with nothing open"; const t = stack.pop(); if (t !== tag) return "closes </" + tag + "> over an open <" + t + ">"; }
  }
  return stack.length ? "leaves <" + stack.join("><") + "> open" : null;
}

/* WHAT HAS BEEN READ AND IS THE BOOK (Sep 2026, batch E55). Every standing finding on the shelf was
   read through in this batch, and eleven of them are not faults at all — they are the printing doing
   its job. Left in the report they are permanent noise, and E53 is the standing proof of what that
   costs: nineteen doubled spaces and nineteen Latin cruces between them hid the sixteen findings
   nobody had a reason to look past, for twenty batches. So an adjudicated finding is DECLARED here,
   with the reason, and the report becomes a list of what nobody has judged yet — which is the only
   kind of list worth reading.

   A ROW MATCHES ONLY WHEN THE BOOK, THE CHECK AND THE MATCHED TEXT ALL AGREE, which is
   `check-citations.js`'s `CROSSREF_WRONG` rule and is what keeps this from becoming an off switch: a
   NEW page-number artefact in the Journey still reports, because it will not be one of these two
   strings. Add a row only after reading the passage and satisfying yourself it is the edition. */
const ADJUDICATED = [
  /* Richard's own cross-references, in his own translation — the first to the plates of the
     Ox-headed Demon earlier in the volume, the second to a work he cites in a note on the
     Resurrection. Both are references a reader can follow, not scan furniture. */
  ["journey-to-the-west", "a page-number artefact inside prose", /^\s*pp\. 199\s*$/],
  ["journey-to-the-west", "a page-number artefact inside prose", /^\s*p\. 190\s*$/],
  /* The translators' own citation of the Phaedo and the Timaeus, inside their note. */
  ["summa-theologica", "a page-number artefact inside prose", /^\s*p\. 218\]\s*$/],
  /* `&c.` is Yule's abbreviation for et cetera and he sets it throughout — "The people are
     Idolaters, &c." — so all seven of these are the printing. It is a bare ampersand in the markup
     and that is worth knowing, but `&c` is not an entity name and browsers render it as written;
     the check stays for the case that matters, which is a run that IS an entity name. */
  ["marco-polo", "a raw ampersand that is not an entity", /^&$/],
  /* Gregory's dating formula at the foot of two of his letters, both written on 22 June 601 — so
     the Latin repeats it because the letters do, and the English column repeats it too. */
  ["bede-history", "a paragraph the chapter carries twice", /Kalendarum Iuliarum/],
  /* THE GREEK BOETHIUS QUOTES, ROMANISED BY HIS TRANSCRIBER (Sep 2026, batch E56). Twelve of them —
     Homer four times, Euripides, Parmenides, the Pythagorean `hepou theoi` — and this book's own
     front matter has explained them since the day it was imported: the transcription romanises every
     one, and turning a romanisation back into Greek "would be composing a text rather than reading
     one". MEASURED while adjudicating it, which is what settles it: Project Gutenberg's edition 13316
     carries 152 of these markers and ZERO Greek characters, in the plain text, the UTF-8 text and the
     HTML alike. There is nothing in the source to restore, so the choice is between the transcriber's
     brackets and another edition's Greek, and the second is not this book. */
  ["boethius-consolation", "an unresolved beta-code Greek marker", /^\[Greek:$/],
  /* THE CHINESE RICHARD SETS THAT HIS SCANNER CANNOT READ (Sep 2026, batch E56). Six runs of marks,
     and every one is a place the printing sets Chinese characters: the eighteen-line table of the
     Mind-formulae in chapter 58, the catalogue of scriptures in chapter 98, and two names in chapter
     11. Only one transcription of this book has ever been made — checked against archive.org while
     adjudicating this, where the Canterbury Tales turned out to have eight — so there is no witness
     to recover them from, and the book's front matter now says so.

     THE LIMIT IS STATED RATHER THAN HIDDEN: what this check matches is two or three characters, so
     declaring the six by their own text also masks a future run that happens to read `^e` or `^f`
     somewhere else in this book. That is a real hole and it is accepted here for one reason — the
     book's front matter declares its letter-level OCR uncorrected and there is no second copy to
     correct it from, so on THIS book and THIS check there is no finding that could be acted on. It
     would not be acceptable anywhere else. */
  ["journey-to-the-west", "an OCR sentinel run of punctuation", /^f\^T$/],
  ["journey-to-the-west", "an OCR sentinel run of punctuation", /^\^e$/],
  ["journey-to-the-west", "an OCR sentinel run of punctuation", /^\^\^i$/],
  ["journey-to-the-west", "an OCR sentinel run of punctuation", /^\^f$/],
  ["journey-to-the-west", "an OCR sentinel run of punctuation", /^i\^C$/],
  ["journey-to-the-west", "an OCR sentinel run of punctuation", /^\^a$/],
];
function adjudicated(id, name, text) {
  return ADJUDICATED.some((r) => r[0] === id && r[1] === name && r[2].test(text));
}

const rows = [];
for (const [side, list] of [["en", en], ["or", or]]) {
  for (const b of list) {
    const hits = {};
    let chars = 0, badTags = [];
    for (const c of b.chapters || []) {
      const html = c.html || "";
      chars += html.length;
      /* A CRUX IS NOT OCR DAMAGE (Sep 2026, batch E53). The Latin Seneca prints 19 passages between
         TILDES, which is how its transcription renders the daggers a critical edition puts round text
         the manuscripts hand down corrupt — `~servitus~`, `~aitarens malitia et ea agitata~`. The
         sentinel check below had been reporting all 19 as scan damage since E33, which is 21 of the
         37 hits it produces shelf-wide and the reason nobody had read the other 16.
         MASKED BY SHAPE, NOT BY BOOK: a crux wraps WHOLE WORDS between a pair of tildes, where the
         damage this check is for sits INSIDE a word — `jatave~as` for Jatavedas, `Trce-fed`. So the
         mask is a tilde pair whose ends are both at a word boundary, and it leaves every real finding
         standing. */
      const masked = html.replace(/(^|[\s>(\[])~[^~<>]{1,120}~(?=[\s<).,;:!?\]]|$)/g, "$1 ");
      for (const [name, rx] of CHECKS) {
        const r = new RegExp(rx.source, rx.flags);
        let found = (name === "an OCR sentinel run of punctuation" ? masked : html).match(r);
        if (found) found = found.filter((t) => !adjudicated(b.id, name, t));
        if (found && found.length) { hits[name] = (hits[name] || 0) + found.length; if (!hits["_ex" + name]) hits["_ex" + name] = found[0]; }
      }
      const bal = tagsBalanced(html);
      if (bal) badTags.push(c.n + ": " + bal);
    }
    if (b.intro && b.intro.html) { const bal = tagsBalanced(b.intro.html); if (bal) badTags.push("intro: " + bal); }
    const named = Object.keys(hits).filter((k) => !k.startsWith("_ex"));
      const rep = repeatedParas(b, (h) => h.replace(/<[^>]*>/g, " ").replace(/&[a-z]+;|&#\d+;/g, " ").replace(/\s+/g, " ").trim());
    if (rep.n && !adjudicated(b.id, "a paragraph the chapter carries twice", rep.first)) {
      hits["a paragraph the chapter carries twice"] = rep.n;
      hits["_exa paragraph the chapter carries twice"] = rep.first;
      named.push("a paragraph the chapter carries twice");
    }
    /* A FOOTNOTE MARKER IN A COLUMN THAT HAS NO FOOTNOTES (Sep 2026, batch E47). Folio's reader folds
       notes under the TRANSLATION alone, so an original's notes are dropped by the importer — and for
       months their MARKERS were not dropped with them: 483 in the Old English Beowulf and 84 in the
       Greek Herodotus, against zero notes on either side. app.js does not ignore them. `wireFootnotes`
       takes its list from the first `.src-note` on the page, which is the TRANSLATION's, then walks
       every marker in document order; any whose number is at or under that count is made a CONTROL
       pointing at that note. 369 of the 567 became clickable, offering a note about the English on a
       word of the Old English. Nothing else here could see it: the prose is whole, the tags balance,
       and both note lists are correct in themselves.
       It is checked on the ORIGINAL side only, because on the translation side a marker pointing at
       the book's own note is the apparatus working. */
    if (side === "or") {
      let fn = 0, ex = "";
      for (const c of b.chapters || []) {
        const m = (c.html || "").match(/<sup class="fn"[^>]*><\/sup>/g);
        if (m) { fn += m.length; if (!ex) ex = "ch" + c.n + ": " + m[0]; }
      }
      if (fn) { hits["a footnote marker in a column that carries no notes"] = fn;
        hits["_exa footnote marker in a column that carries no notes"] = ex;
        named.push("a footnote marker in a column that carries no notes"); }
    }
    /* AND THE MIRROR OF IT: A NOTE IN THE FOLD THAT NO MARKER POINTS AT (Sep 2026, batch E48).
       app.js is graceful about this — `wireFootnotes` gives such an entry a plain number rather than
       a jump to nowhere — so it never looks broken; what the reader gets is a line standing at the
       head of the apparatus that no sentence in the chapter opens. It fires ONCE on the whole shelf,
       which is the argument for a permanent check rather than a batch: Perseus's Lysis carries the
       Loeb's one-line argument of the dialogue as a `type="Com"` note before the first paragraph,
       and the extractor's paragraph sweep threw its marker away and kept its text.
       Read against the numbers a marker actually carries. Every one of the shelf's 16,006 markers is
       explicit, so reading order does not enter into it — a chapter carrying a BARE marker is
       reported as such instead, since there the count is app.js's to settle and not this file's. */
    {
      let orphan = 0, ex = "", bare = 0;
      for (const c of b.chapters || []) {
        const html = c.html || "", n = (c.notes || []).length;
        const loose = (html.match(/<sup class="fn"(?![^>]*data-fn)/g) || []).length;
        if (loose) { bare += loose; continue; }
        if (!n) continue;
        const at = new Set([...html.matchAll(/<sup class="fn"[^>]*data-fn="(\d+)"/g)].map((m) => +m[1]));
        for (let i = 1; i <= n; i++)
          if (!at.has(i)) { orphan++; if (!ex) ex = "ch" + c.n + " note " + i + ": " + String(c.notes[i - 1]).slice(0, 60); }
      }
      if (orphan) { hits["a note in the fold that no marker points at"] = orphan;
        hits["_exa note in the fold that no marker points at"] = ex;
        named.push("a note in the fold that no marker points at"); }
      if (bare) { hits["a footnote marker carrying no target"] = bare;
        hits["_exa footnote marker carrying no target"] = "numbered by reading order at render";
        named.push("a footnote marker carrying no target"); }
    }
  if (named.length || badTags.length) rows.push([side, b.id, chars, hits, named, badTags]);
  }
}
for (const [side, id, chars, hits, named, badTags] of rows) {
  console.log("== " + id + (side === "or" ? "  (original)" : "") + "   " + (chars / 1024).toFixed(0) + " KB");
  for (const n of named) console.log("     " + String(hits[n]).padStart(6) + "  " + n + "   e.g. " + JSON.stringify(hits["_ex" + n]).slice(0, 90));
  for (const t of badTags.slice(0, 4)) console.log("     TAGS  " + t);
  if (badTags.length > 4) console.log("     TAGS  … and " + (badTags.length - 4) + " more");
}
console.log("\n" + rows.length + " of " + (en.length + or.length) + " files have at least one finding");
