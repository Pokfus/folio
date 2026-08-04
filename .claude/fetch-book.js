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
      if (/class="fn"/.test(attrs)) { out.push('<sup class="fn"></sup>'); stack.push({ name, kept: false }); }
      else { out.push("<sup>"); stack.push({ name, kept: true }); }
      continue;
    }
    out.push("<" + name + ">");
    stack.push({ name, kept: true });
  }
  out.push(b.slice(pos));
  return out.join("");
}

function cleanBody(h) {
  let b = h.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  const i = b.indexOf('<div class="prp-pages-output"');
  if (i < 0) throw new Error("no body");
  b = b.slice(i);
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
  // a footnote reference becomes Folio's own EMPTY marker; wireFootnotes writes the digit, so the
  // number in the prose can never disagree with the list under it
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

// the translator's own footnotes — these are the explanatory notes the reader gets
function notesOf(h) {
  const m = h.match(/<ol class="references">([\s\S]*?)<\/ol>/);
  if (!m) return [];
  const out = [];
  const rx = /<span class="reference-text">([\s\S]*?)<\/span>\s*<\/li>/g;
  let x;
  while ((x = rx.exec(m[1]))) {
    out.push(
      x[1].replace(/<(?!\/?(i|b|em|strong)\b)[^>]*>/g, "").replace(/\s+/g, " ").trim()
    );
  }
  return out;
}

/* ---------- the chapter titles, from the book's own contents page ---------- */
async function chapterTitles() {
  const h = await api(BOOK.indexPage);
  const txt = h.replace(/<style[\s\S]*?<\/style>/g, "");
  const rx = /<a href="\/wiki\/[^"]*\/Letter_(\d+)"[^>]*>([^<]*)<\/a>/g;
  const d = {};
  let m;
  while ((m = rx.exec(txt))) {
    const t = m[2].trim();
    if (/^[IVXLC]+\.$/.test(t)) continue;   // the numeral column, not the title column
    d[+m[1]] = titleCase(t);
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
    const html = cleanBody(h), notes = notesOf(h);
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
