#!/usr/bin/env node
/* ============================================================
   fetch-book.js — import a PUBLIC DOMAIN book into books/<id>.js

     node .claude/fetch-book.js seneca-letters
     node .claude/fetch-book.js seneca-letters --from=1 --to=20
     node .claude/fetch-book.js seneca-letters --force        (ignore the cache)

   Standalone Node helper, run manually — NOT part of the site, and not loaded by it.
   Zero dependencies (Node's own fetch), resumable, and safe to re-run: every chapter is
   cached under .claude/book-cache/<id>/ so a second run costs nothing and a rate-limited
   run picks up where it stopped rather than starting again.

   THE LICENCE RULE, and it is the whole reason this script is narrow.
   Folio hosts the text itself, so only a work whose copyright has EXPIRED may be imported —
   never a modern translation. For a classical author that distinction is the entire question:
   the Latin is two thousand years old and free, and the ENGLISH is a 20th-century work with
   its own separate copyright. Seneca's letters are widely read in Robin Campbell's Penguin
   translation of 1969, which is still in copyright and must NOT be used; what is imported here
   is Richard Mott Gummere's Loeb Classical Library translation (volumes 1917 / 1920 / 1925),
   published before 1929 and therefore public domain in the United States. Wikisource carries
   the explicit PD tag. Each entry in BOOKS below records that reasoning in `rights`, which is
   printed on the book's own page — a reader (and the next person to add a book) can see on what
   grounds the text is being served.

   WHAT IT WRITES
   books/<id>.js pushes onto window.FOLIO_BOOKS_IN rather than assigning a global, exactly as
   the i18n bundles do: the file is LAZY (bundle "book:<id>" in app.js) and may land before or
   after the reader opens the page, so the ingest hook drains a queue instead of racing a slot.
   ============================================================ */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const UA = "FolioStudySite/1.0 (public-domain text import; https://github.com/pokfus/folio)";

/* ---------- the books this script knows how to fetch ----------
   `source` is a Wikisource page-title pattern; `chapters` the numbers to walk. Adding a book
   means adding an entry here — the extractor below is generic over Wikisource's page layout. */
const BOOKS = {
  "seneca-letters": {
    title: "Letters from a Stoic",
    subtitle: "Moral Letters to Lucilius",
    author: "Seneca",
    translator: "Richard Mott Gummere",
    edition: "Loeb Classical Library, 1917–1925",
    written: "c. 62–65 CE",
    rights:
      "Public domain in the United States: Gummere's translation was published in 1917, 1920 and 1925, " +
      "all before 1929, so its copyright has expired. (The widely-read Penguin translation by Robin " +
      "Campbell, 1969, is still in copyright and is not used here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/Moral_letters_to_Lucilius",
    /* THE FRONT MATTER — the book's own opening chapter, written by hand and emitted as `intro` into
       books/<id>.js (Aug 2026, on request: "add a chapter at the start with information about the book
       itself and the used translation").

       It lives HERE, in the generator, rather than in app.js's BOOKS registry, for two reasons that
       point the same way. That registry is EAGER — it is loaded by every visitor to the site so the
       shelf can paint without fetching a word — and a page of prose nobody reads until they open the
       book has no business in it. And books/<id>.js is generated and never hand-edited, so an intro
       written straight into that file would be destroyed by the next run of this script. Written into
       the generator, it is authored once and survives every refetch.

       The book's LICENCE half is not here: app.js builds that from its own `rights` / `edition` /
       `sourceUrl` fields, which is where the reader-facing statement has always come from, and it needs
       a real link. This is the essay; that is the paperwork.

       Every claim below is the standard account of the letters and is not to be embroidered. Where the
       scholarship is divided — whether these were letters actually posted — it says so. */
    about: [
      "<b>Letters from a Stoic</b> is a collection of 124 letters written by the Roman statesman and " +
        "philosopher Lucius Annaeus Seneca to his friend Lucilius Junior, then serving as an imperial " +
        "official in Sicily. Seneca calls them <i>Epistulae Morales ad Lucilium</i> — moral letters — and " +
        "that is what they are: short essays on how to live, each opening on some small occasion and " +
        "working outwards from it. A noisy bathhouse below his window becomes a letter on concentration; " +
        "a journey down the coast, one on travel as a cure for unhappiness; the death of a friend, one on " +
        "grief.",
      "Seneca was among the richest and most powerful men of his age, and the letters were written at the " +
        "end of it. Born in Spain around the beginning of the first century, he made his name in Rome as " +
        "an orator and writer, was exiled to Corsica by the emperor Claudius, recalled to tutor the young " +
        "Nero, and then spent years as the most senior adviser to Nero's court. He withdrew from public " +
        "life around 62 CE, and it is from that retirement that these letters date. In 65 CE, implicated " +
        "in a conspiracy against the emperor, he was ordered to take his own life and did.",
      "Whether they were letters in the ordinary sense — sealed, carried, answered — has been argued over " +
        "for a long time, and no answer commands agreement. They address a real man, they refer to real " +
        "journeys and real weather, and they read as though sent; they are also carefully shaped, and " +
        "Seneca plainly expected them to be read by more people than Lucilius. What survives is 124 " +
        "letters in twenty books, and there were once more: the later Roman writer Aulus Gellius quotes a " +
        "book of them numbered beyond any we still have.",
      "They are the most approachable Stoic writing to come down to us, and the least doctrinaire. Seneca " +
        "is not building a system — Stoic physics and logic barely appear — but arguing with a friend, " +
        "and with himself, about time, fear, friendship, money, illness, crowds, old age and death. He is " +
        "also, by his own admission, not a good Stoic: the letters return again and again to the distance " +
        "between what he knows he should want and what he finds he does want, and he writes as a patient " +
        "rather than as a physician.",
      "The letters are numbered here as they have always been numbered, and the small raised figures " +
        "running through each one are its section numbers, by which any passage is cited. The numbered " +
        "notes folded under each letter are the translator's own.",
    ],
    // Gummere's three Loeb volumes, as Wikisource's own transclusions divide them
    parts: [
      { n: 1, label: "Volume I", from: 1, to: 65 },
      { n: 2, label: "Volume II", from: 66, to: 92 },
      { n: 3, label: "Volume III", from: 93, to: 124 },
    ],
    chapterWord: "Letter",
    page: (n) => "Moral letters to Lucilius/Letter " + n,
    indexPage: "Moral letters to Lucilius",
    chapters: Array.from({ length: 124 }, (_, i) => i + 1),
  },
};

/* ---------- args ---------- */
const argv = process.argv.slice(2);
const id = argv.find((a) => !a.startsWith("--"));
const flag = (name, dflt) => {
  const hit = argv.find((a) => a.startsWith("--" + name + "="));
  return hit ? hit.slice(name.length + 3) : dflt;
};
const FORCE = argv.includes("--force");
if (!id || !BOOKS[id]) {
  console.error("usage: node .claude/fetch-book.js <" + Object.keys(BOOKS).join("|") + "> [--from=N] [--to=N] [--force]");
  process.exit(1);
}
const BOOK = BOOKS[id];
const FROM = parseInt(flag("from", BOOK.chapters[0]), 10);
const TO = parseInt(flag("to", BOOK.chapters[BOOK.chapters.length - 1]), 10);

const CACHE = path.join(__dirname, "book-cache", id);
fs.mkdirSync(CACHE, { recursive: true });

/* ---------- fetch with backoff ----------
   Wikisource rate-limits a fast walk and answers with an HTML error page rather than JSON, which
   is why this retries on a PARSE failure and not only on a bad status. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(page) {
  const url =
    "https://en.wikisource.org/w/api.php?action=parse&page=" +
    encodeURIComponent(page) + "&prop=text&formatversion=2&format=json";
  let last = "";
  for (let a = 0; a < 6; a++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
      const txt = await r.text();
      const d = JSON.parse(txt);
      if (d.error) throw new Error(d.error.info || "api error");
      return d.parse.text;
    } catch (e) {
      last = e.message;
      await sleep(2500 + a * 4000);
    }
  }
  throw new Error("could not fetch " + page + ": " + last);
}

/* ---------- extract the prose ----------
   Wikisource renders a transcluded scan: the letter's body sits in .prp-pages-output, wrapped in
   page-number markers, per-page style links and a footnote list. Everything below reduces that to
   the small tag set Folio's reader understands, with a STACK rather than regex pairs so a dropped
   opening tag drops its closer with it (a lone </span> otherwise leaks into the page and closes
   something it does not own). */
const ALLOWED = new Set(["p", "i", "b", "em", "strong", "br", "blockquote", "sup", "span", "q", "cite"]);

function stripTags(b) {
  const out = [];
  const stack = [];
  let pos = 0;
  const rx = /<(\/?)([a-zA-Z0-9]+)([^>]*?)\/?>/g;
  let m;
  while ((m = rx.exec(b))) {
    out.push(b.slice(pos, m.index));
    pos = rx.lastIndex;
    const closing = !!m[1], name = m[2].toLowerCase(), attrs = m[3] || "";
    if (name === "br") { if (!closing) out.push("<br>"); continue; }
    if (closing) {
      if (stack.length && stack[stack.length - 1].name === name) {
        const kept = stack.pop().kept;
        if (kept) out.push("</" + name + ">");
      }
      continue;
    }
    if (!ALLOWED.has(name)) { stack.push({ name, kept: false }); continue; }
    if (name === "span") {
      // the only span we keep is the section number we made below
      const keep = /bk-n/.test(attrs);
      stack.push({ name, kept: keep });
      if (keep) out.push('<span class="bk-n">');
      continue;
    }
    if (name === "sup") {
      // the marker's data-fn is which NOTE it points at, resolved in cleanBody — carry it through, or
      // a reused note's marker silently reverts to its reading-order number
      if (/class="fn"/.test(attrs)) {
        const fn = attrs.match(/data-fn="(\d+)"/);
        out.push('<sup class="fn"' + (fn ? ' data-fn="' + fn[1] + '"' : "") + "></sup>");
        stack.push({ name, kept: false });
      }
      else { out.push("<sup>"); stack.push({ name, kept: true }); }
      continue;
    }
    out.push("<" + name + ">");
    stack.push({ name, kept: true });
  }
  out.push(b.slice(pos));
  return out.join("");
}

function cleanBody(h, noteIds) {
  let b = h.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  const i = b.indexOf('<div class="prp-pages-output"');
  if (i < 0) throw new Error("no body");
  b = b.slice(i);
  /* Drop the WRAPPER's own opening tag before the generic div→blockquote pass below, which would
     otherwise turn the container that holds the whole letter into a quotation of the whole letter —
     every paragraph indented behind a rule and set in italic, which is not what Seneca is doing. Its
     closing </div> becomes an unmatched </blockquote> and stripTags discards it (a closer whose opener
     was never pushed is dropped, which is exactly what that stack is for). Wikisource's markup has
     moved under us once already, so this is asserted rather than assumed: whether the wrapper's closer
     falls inside the slice is a property of THEIR page, not of ours. */
  b = b.replace(/^<div class="prp-pages-output"[^>]*>/, "");
  b = b.split(/<div class="reflist"|<hr class="wst-rule"/)[0];
  b = b.replace(/<span><span class="pagenum[\s\S]*?<\/span><\/span>/g, "");
  b = b.replace(/<span class="pagenum[\s\S]*?<\/span>/g, "");
  b = b.replace(/<link[^>]*\/?>/g, "");
  // the scan's own centred running head — the reader gets our chapter title instead
  b = b.replace(/<div class="wst-center[^"]*"[^>]*>\s*<p>\s*[IVXLC]+\.[^<]*<\/p>\s*<\/div>/g, "");
  // Gummere's section numbers, which are how this text is cited — keep them, as our own marker
  b = b.replace(
    /<span class="wst-verse[^"]*"[^>]*>\s*<sup>\s*<b>\s*(\d+)\.?\s*<\/b>\s*<\/sup>\s*<\/span>/g,
    '<span class="bk-n">$1</span>'
  );
  /* A footnote reference becomes Folio's own marker, and it carries the note it actually points at.
     wireFootnotes still writes the DIGIT — the number in the prose can never disagree with the list —
     but which entry a marker resolves to is decided here, from the href MediaWiki put on it.

     A bare marker takes the next number in reading order, which is right only while every note is
     cited exactly once. Wikisource REUSES a note wherever the translator repeats himself: letter 114
     cites one note four times and another three times, so its 21 notes carry 26 markers. Numbered by
     reading order, every marker after the first repeat points one entry too far, and the five that
     run past the end of the list are DELETED by wireFootnotes — so the letter silently loses the
     markers on its last five annotated claims and mis-points the twenty before them. Six of the
     letters added here do this (80, 82, 85, 94, 95, 114); none of the first 65 does, which is why it
     went unnoticed, and it is invisible to every count: the notes are all present and correct, the
     prose is intact, and nothing throws.

     Resolving the target keeps the two apart — repeats render as a repeated number, which is what a
     note cited twice should look like, and nothing is dropped. Note the id attribute escapes its
     underscore as &#95; while the href does not, so only the note ids need normalising. A marker
     whose target is missing falls back to the bare form rather than inventing a number. */
  b = b.replace(/<sup id="cite[^"]*" class="reference">\s*<a href="#([^"]*)"[\s\S]*?<\/sup>/g, (m, tgt) => {
    const i = noteIds ? noteIds.indexOf(tgt.replace(/&#95;/g, "_")) : -1;
    return i < 0 ? '<sup class="fn"></sup>' : '<sup class="fn" data-fn="' + (i + 1) + '"></sup>';
  });
  b = b.replace(/<sup id="cite[^"]*" class="reference">[\s\S]*?<\/sup>/g, '<sup class="fn"></sup>');
  b = b.replace(/<div class="(?:poem|wst-block-center|wst-center)[^"]*"[^>]*>/g, "<blockquote>");
  b = b.replace(/<\/div>/g, "</blockquote>").replace(/<div[^>]*>/g, "<blockquote>");
  b = stripTags(b);
  b = b.replace(/&#160;|&nbsp;/g, " ").replace(/&#32;/g, " ");
  b = b.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n");
  b = b.replace(/<blockquote>\s*<p>\s*THE EPISTLES OF SENECA\s*<\/p>\s*<\/blockquote>/gi, "");
  b = b.replace(/<blockquote>\s*<p>(Greetings from Seneca[^<]*)<\/p>\s*<\/blockquote>/g, '<p class="bk-salut">$1</p>');
  for (let k = 0; k < 6; k++) {
    b = b.replace(/<blockquote>\s*<\/blockquote>/g, "").replace(/<p>\s*<\/p>/g, "");
    b = b.replace(/<blockquote>\s*(<blockquote>[\s\S]*?<\/blockquote>)\s*<\/blockquote>/g, "$1");
  }
  b = b.replace(/\s+<\/p>/g, "</p>").replace(/<p>\s+/g, "<p>").replace(/\n{2,}/g, "\n").trim();
  return b;
}

/* The translator's own footnotes — these are the explanatory notes the reader gets.

   The <style> BLOCK is stripped BEFORE the tags are, and that order is the whole of it. Wikisource
   ships each note's font templates as an inline <style> element — the Greek face for a quotation, the
   small caps for A.D./B.C., the no-wrap rule for an ellipsis — and dropping tags first leaves the tags
   gone and the CSS TEXT behind, so a note read
     "A reference to the murder of Caligula, on the Palatine, .mw-parser-output .wst-asc{font-variant:
      all-small-caps}…{padding-left:0}A.D. 41."
   with a paragraph of stylesheet sitting mid-sentence. It shipped in 24 of Seneca's 335 notes, and it
   is invisible to every check here — the note is a non-empty string of the right shape, and only a
   reader opening the fold ever sees it. cleanBody has always stripped <style> first for the prose;
   this is the same guard on the same page's other half.

   The .mw-parser-output sweep after it is belt and braces: MediaWiki also serves these rules through
   TemplateStyles link elements whose CSS the parser may inline without a <style> wrapper, and a rule
   set is recognisable — it starts at that class and runs through balanced { } blocks. */
function stripWikiCSS(s) {
  return s
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/\.mw-parser-output(?:[^{}]*\{[^{}]*\})+/g, "");
}
/* Returns the notes AND their ids, in list order. The ids are what cleanBody resolves each marker's
   href against, so the two must be read from the SAME pass — a note list and a marker map derived
   separately are one Wikisource layout change away from disagreeing with each other.

   Pairing the id with its text in one match also avoids a trap worth writing down: the notes cannot
   be split on "<li", because MediaWiki serves its font templates as <link rel="mw-deduplicated-inline-
   style"> elements INSIDE a note, and "<link" starts with "<li". */
function notesOf(h) {
  const m = h.match(/<ol class="references">([\s\S]*?)<\/ol>/);
  if (!m) return { notes: [], ids: [] };
  const notes = [], ids = [];
  const rx = /<li id="(cite[^"]*)"[\s\S]*?<span class="reference-text">([\s\S]*?)<\/span>\s*<\/li>/g;
  let x;
  while ((x = rx.exec(m[1]))) {
    ids.push(x[1].replace(/&#95;/g, "_"));
    notes.push(
      stripWikiCSS(x[2])
        .replace(/<(?!\/?(i|b|em|strong)\b)[^>]*>/g, "")
        .replace(/&#160;|&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    );
  }
  return { notes, ids };
}

/* ---------- the chapter titles, from the book's own contents page ---------- */
/* ---------- the chapter titles, from the book's own contents page ----------
   Read ROW BY ROW, pairing the numeral cell with the title cell beside it, rather than trusting the
   href on each link. The contents page is a table — a numeral column, a title column, a page column —
   and both cells of a row link to the same letter, so keying off the href looks equivalent and is
   cheaper. It is not: on the CIII row Wikisource's own markup hyperlinks the TITLE cell to Letter
   104 while the numeral beside it correctly links to Letter 103. Keyed by href, letter 103's title is
   filed under 104 and then discarded (104's own title, later in the document, overwrites it), and 103
   is left with nothing but a bare numeral — which the guard below drops, so it falls back to the
   generic "Letter 103" while every other letter in the book is titled.

   The row is the structure the page actually means, and it is also the more robust reading: it needs
   the numeral's href alone, and survives the title link being wrong, absent or pointed anywhere. */
async function chapterTitles() {
  const h = await api(BOOK.indexPage);
  const txt = h.replace(/<style[\s\S]*?<\/style>/g, "");
  const d = {};
  for (const row of txt.split(/<tr[^>]*>/).slice(1)) {
    let n = null, title = null;
    for (const cell of row.split(/<td[^>]*>/).slice(1)) {
      const a = cell.match(/<a href="\/wiki\/[^"]*\/Letter_(\d+)"[^>]*>([^<]*)<\/a>/);
      if (!a) continue;
      const t = a[2].trim();
      if (/^[IVXLC]+\.$/.test(t)) { if (n === null) n = +a[1]; }   // the numeral column
      else if (title === null) title = t;                          // the title column
    }
    if (n !== null && title) d[n] = titleCase(title);
  }
  return d;
}
// the contents page shouts its titles in capitals; the page sets them in small caps instead
function titleCase(s) {
  const small = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "of", "on", "or", "the", "to", "with"]);
  return s
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((w, i) => {
      if (/^\s+$|^-$/.test(w)) return w;
      if (i > 0 && small.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join("");
}

/* ---------- serialize ---------- */
function esc(s) { return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n"); }
function partOf(n) {
  const p = (BOOK.parts || []).find((x) => n >= x.from && n <= x.to);
  return p ? p.n : 1;
}

async function main() {
  console.log("Fetching " + BOOK.title + " (" + BOOK.translator + ") — chapters " + FROM + "–" + TO);
  const titles = await chapterTitles();
  const chapters = [];
  for (const n of BOOK.chapters) {
    if (n < FROM || n > TO) continue;
    const cf = path.join(CACHE, n + ".json");
    if (!FORCE && fs.existsSync(cf)) {
      // the cache holds the extracted prose only — the title and the part are re-derived on every
      // run, so re-titling or re-dividing a book costs no refetch
      const c = JSON.parse(fs.readFileSync(cf, "utf8"));
      chapters.push({ n, t: titles[n] || c.t || BOOK.chapterWord + " " + n, p: partOf(n), html: c.html, notes: c.notes || [] });
      continue;
    }
    const h = await api(BOOK.page(n));
    const { notes, ids } = notesOf(h);
    const html = cleanBody(h, ids);
    if (html.length < 200) throw new Error("chapter " + n + " came back short (" + html.length + " chars)");
    const rec = { n, t: titles[n] || BOOK.chapterWord + " " + n, p: partOf(n), html, notes };
    fs.writeFileSync(cf, JSON.stringify(rec));
    chapters.push(rec);
    console.log("  " + BOOK.chapterWord + " " + n + " — " + rec.t + " (" + html.length + " chars, " + notes.length + " notes)");
    await sleep(700);
  }
  chapters.sort((a, b) => a.n - b.n);

  const outDir = path.join(ROOT, "books");
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, id + ".js");
  const lines = [];
  lines.push("/* " + BOOK.title + " — " + BOOK.author + ", translated by " + BOOK.translator + ".");
  lines.push("   " + BOOK.edition + ". " + BOOK.rights);
  lines.push("   Source: " + BOOK.sourceName + " — " + BOOK.sourceUrl);
  lines.push("");
  lines.push("   GENERATED by .claude/fetch-book.js — do not edit by hand; re-run the script instead.");
  lines.push("   LAZY: bundle \"book:" + id + "\" in app.js. It pushes onto window.FOLIO_BOOKS_IN rather than");
  lines.push("   assigning a global, so a file that lands before its ingest hook is not lost. */");
  lines.push("window.FOLIO_BOOKS_IN = window.FOLIO_BOOKS_IN || [];");
  lines.push("window.FOLIO_BOOKS_IN.push({");
  lines.push('  id: "' + id + '",');
  /* The front matter, as ONE html string in the same shape a chapter's is — so the reader page can
     treat it as a chapter and needs no second renderer for it. Written before `chapters` because it
     reads first. */
  if (BOOK.about && BOOK.about.length) {
    lines.push('  intro: "' + esc(BOOK.about.map((p) => "<p>" + p + "</p>").join("\n")) + '",');
  }
  lines.push("  chapters: [");
  chapters.forEach((c) => {
    lines.push(
      "    { n: " + c.n + ', p: ' + c.p + ', t: "' + esc(c.t) + '", html: "' + esc(c.html) + '"' +
      (c.notes.length ? ", notes: [" + c.notes.map((x) => '"' + esc(x) + '"').join(", ") + "]" : "") +
      " },"
    );
  });
  lines.push("  ],");
  lines.push("});");
  const text = lines.join("\n") + "\n";
  fs.writeFileSync(out, text);

  // re-parse, exactly as the other content helpers do, so a broken escape can't ship
  global.window = {};
  delete require.cache[require.resolve(out)];
  require(out);
  const got = global.window.FOLIO_BOOKS_IN[0];
  console.log(
    "\nWrote books/" + id + ".js — " + got.chapters.length + " chapters, " +
    (text.length / 1024).toFixed(0) + " KB, " +
    got.chapters.reduce((a, c) => a + (c.notes ? c.notes.length : 0), 0) + " notes. Re-parsed OK."
  );
}

main().catch((e) => { console.error("\n" + e.message); process.exit(1); });
