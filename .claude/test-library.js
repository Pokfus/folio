#!/usr/bin/env node
/* ============================================================
   test-library.js — the Library: the shelf, one book, and the reader's place.

     NODE_PATH=<scratch>/node_modules node .claude/test-library.js

   What this guards, and why each one is here rather than left to a screenshot:

   · THE RENAME. Two pages called Library — one of them titled Collections — is how a reader ends up
     on the wrong one, and nothing throws when a label is stale. The old #decks address must still
     work (every link ever shared points at it) while calling itself Collections everywhere.
   · THE TEXT IS LAZY. A book is ~450 KB. If books/<id>.js ever reaches the eager load path the site
     gets slower for every visitor who never opens a book, and the only symptom is a slower site —
     nobody reports that. So: not requested on boot, not on the shelf, only on the book itself.
   · THE READER'S PLACE. The whole point of the feature. It has to survive a RELOAD (not just a
     re-render), come back on the same chapter, and be stored as a fraction rather than a pixel
     offset — a pixel offset silently moves the place the moment the text size or the width changes,
     which is exactly the case a phone hits and a test window does not.
   · THE APPARATUS. Gloss links must resolve inside the prose and the translator's notes must be
     numbered by the site's own footnote pass. A note marker whose number has no entry behind it is
     REMOVED by wireFootnotes, so a mis-wired book loses its markers silently.
   · THE LICENCE. The book page states the translation and the grounds it is public domain on. That
     sentence is the reason the text may be served at all; if it ever stops rendering, the site is
     hosting a book with nothing on the page saying why it may.
   ============================================================ */

const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

let pass = 0, fail = 0;
const check = (label, ok, detail) => {
  if (ok) { pass++; console.log("  ok   " + label); }
  else { fail++; console.log("  FAIL " + label + (detail ? "  → " + detail : "")); }
};

const PHONE = { width: 390, height: 844 };
const DESK = { width: 1280, height: 900 };

/* Read the SHIPPED book files and look for Wikisource's own stylesheet in them. Done in Node, over
   every chapter of every book, rather than in the page over whichever chapter happens to be open —
   the leak sat in 24 of Seneca's 335 notes and each one is only visible to a reader who opens that
   chapter's fold, so a one-chapter check is a check that passes by luck. */
function shippedBookLeaks() {
  const dir = path.join(ROOT, "books");
  const bad = { n: 0, notes: [], html: [] };
  if (!fs.existsSync(dir)) return bad;
  fs.readdirSync(dir).filter((f) => f.endsWith(".js")).forEach((f) => {
    global.window = {};
    delete require.cache[require.resolve(path.join(dir, f))];
    require(path.join(dir, f));
    (global.window.FOLIO_BOOKS_IN || []).forEach((b) => {
      (b.chapters || []).forEach((c) => {
        bad.n++;
        // a CSS rule set, however it arrived: the class MediaWiki scopes them with, a surviving
        // <style> tag, or a bare `selector{prop:value}` in what should be a sentence
        (c.notes || []).forEach((s, i) => {
          if (/\.mw-parser-output|<style|\{[^{}]*:[^{}]*\}/.test(s)) bad.notes.push(b.id + " " + c.n + "#" + (i + 1));
        });
        if (/\.mw-parser-output|<style/.test(c.html || "")) bad.html.push(b.id + " " + c.n);
      });
    });
  });
  return bad;
}

/* Both halves of one book, read off the files that shipped and measured against each other. Written
   for The City of God, whose reader serves one book and so cannot be proved inert by re-running a
   sibling — see the note at its call site. Returns null when the book is not on disk. */
function shippedPair(id) {
  const dir = path.join(ROOT, "books");
  const enF = path.join(dir, id + ".js"), laF = path.join(dir, id + ".la.js");
  if (!fs.existsSync(enF) || !fs.existsSync(laF)) return null;
  global.window = {};
  [enF, laF].forEach((f) => { delete require.cache[require.resolve(f)]; require(f); });
  const en = (global.window.FOLIO_BOOKS_IN || []).find((b) => b.id === id);
  const la = (global.window.FOLIO_BOOK_ORIG_IN || []).find((b) => b.id === id);
  if (!en || !la) return null;
  const nums = (h) => (h.match(/class="bk-n"[^>]*>(\d+)</g) || []).map((s) => +s.match(/>(\d+)</)[1]);
  const out = { en: en.chapters, la: la.chapters, secEn: 0, secLa: 0, pairs: 0, gaps: [], notSeq: [], noteFaults: [], caput: 0 };
  la.chapters.forEach((c) => { out.caput += (c.html.match(/CAPUT/g) || []).length; });
  en.chapters.forEach((c) => {
    const o = la.chapters.find((x) => x.n === c.n);
    const a = nums(c.html), b = o ? nums(o.html) : [];
    out.secEn += a.length; out.secLa += b.length;
    if (!a.every((v, i) => v === i + 1)) out.notSeq.push("en " + c.n);
    if (!b.every((v, i) => v === i + 1)) out.notSeq.push("la " + c.n);
    const sa = new Set(a), sb = new Set(b);
    const miss = a.filter((v) => !sb.has(v)), extra = b.filter((v) => !sa.has(v));
    if (a.length && !miss.length && !extra.length) out.pairs++;
    else out.gaps.push(c.n + ": en-only " + miss.join(",") + " la-only " + extra.join(","));
    const m = [...c.html.matchAll(/data-fn="(\d+)"/g)].map((x) => +x[1]);
    if (m.some((v) => v > (c.notes || []).length)) out.noteFaults.push(c.n + " marker past end of list");
    for (let i = 1; i <= (c.notes || []).length; i++) if (!m.includes(i)) { out.noteFaults.push(c.n + " note " + i + " unreferenced"); break; }
  });
  return out;
}

/* THE SUMMA, read off the one file that shipped. A single column, so shippedPair cannot serve; and
   its reader (markArticuli) is written for this book alone, so there is no sibling to diff it
   against and this sweep is what stands in for one. */
function shippedBook(id) {
  const f = path.join(ROOT, "books", id + ".js");
  if (!fs.existsSync(f)) return null;
  global.window = {};
  delete require.cache[require.resolve(f)];
  require(f);
  const b = (global.window.FOLIO_BOOKS_IN || []).find((x) => x.id === id);
  if (!b) return null;
  const o = { chapters: b.chapters.length, secs: 0, none: [], disorder: [], strayArt: 0,
              notes: 0, noteFaults: [], parts: [], intro: b.intro || "" };
  b.chapters.forEach((c) => {
    const n = (c.html.match(/class="bk-n"[^>]*>(\d+)</g) || []).map((s) => +s.match(/>(\d+)</)[1]);
    o.secs += n.length;
    o.parts[c.p - 1] = (o.parts[c.p - 1] || 0) + 1;
    if (!n.length) o.none.push(c.n);
    /* Ascending with no duplicate rather than a clean 1..N: fourteen questions are short a heading in
       the transcription and the numbering shows WHERE, which is the honest rendering — 1 and 4 on a
       page that prints its first and fourth headings and nothing between. */
    if (n.some((v, i) => i && v <= n[i - 1])) o.disorder.push(c.n + " [" + n.join(",") + "]");
    o.strayArt += (c.html.match(/<b>\s*Art\.\s*\d/g) || []).length;
    o.notes += (c.notes || []).length;
    const m = [...c.html.matchAll(/data-fn="(\d+)"/g)].map((x) => +x[1]);
    if (m.some((v) => v > (c.notes || []).length)) o.noteFaults.push(c.n + " marker past end of list");
    for (let i = 1; i <= (c.notes || []).length; i++)
      if (!m.includes(i)) { o.noteFaults.push(c.n + " note " + i + " unreferenced"); break; }
  });
  return o;
}

/* THE RIGVEDA, read off the two files that shipped. Its reader (extractSukta / suktaSanskrit) serves
   ONE book, so there is no sibling to diff it against and this sweep is what stands in for one.

   EVERY FAULT IT HUNTS IS SILENT. The transcription uses four different shapes and 1,023 of the 1,028
   hymns are plain text with no markup at all; a shape that stops being recognised does not throw and
   does not shorten the book — its hymns come through as one unnumbered block, which looks like a
   hymn. The Sanskrit pages each carry Sayana's commentary at ten times the length of the text, so a
   leak there makes a hymn longer rather than shorter. And mandala 8 numbers the Valakhilya
   differently in the two editions, which is the fault that would pair 55 hymns with hymns that are
   not their counterparts while both columns stayed complete and every count read healthy. */
function rigvedaChecks() {
  const dir = path.join(ROOT, "books");
  const enF = path.join(dir, "rigveda.js"), saF = path.join(dir, "rigveda.sa.js");
  if (!fs.existsSync(enF) || !fs.existsSync(saF)) return null;
  global.window = {};
  [enF, saF].forEach((f) => { delete require.cache[require.resolve(f)]; require(f); });
  const en = (global.window.FOLIO_BOOKS_IN || []).find((b) => b.id === "rigveda");
  const sa = (global.window.FOLIO_BOOK_ORIG_IN || []).find((b) => b.id === "rigveda");
  if (!en || !sa) return null;
  const nums = (h) => (h.match(/class="bk-n"[^>]*>(\d+)</g) || []).map((s) => +s.match(/>(\d+)</)[1]);
  const byN = {}; sa.chapters.forEach((c) => { byN[c.n] = c; });
  const o = { chapters: en.chapters.length, saChapters: sa.chapters.length, enV: 0, saV: 0,
              pairs: 0, unpaired: [], mandalas: [], empty: [], disorder: [], notes: 0,
              noteOn: [], noteFaults: [], commentary: [], titles: 0, m8pairs: 0, m8: 0,
              intro: en.intro || "" };
  en.chapters.forEach((c) => {
    const a = nums(c.html), b = byN[c.n] ? nums(byN[c.n].html) : [];
    o.enV += a.length; o.saV += b.length;
    o.mandalas[c.p - 1] = (o.mandalas[c.p - 1] || 0) + 1;
    if (!a.length) o.empty.push(c.t);
    if (a.some((v, i) => i && v <= a[i - 1])) o.disorder.push("en " + c.t);
    if (b.some((v, i) => i && v <= b[i - 1])) o.disorder.push("sa " + c.t);
    /* the tab IS the citation — "10.129", not a running number */
    if (/^\d+\.\d+$/.test(c.t)) o.titles++;
    const A = new Set(a), B = new Set(b);
    const exact = a.length && !a.filter((v) => !B.has(v)).length && !b.filter((v) => !A.has(v)).length;
    if (exact) o.pairs++; else o.unpaired.push(c.t);
    if (c.p === 8) { o.m8++; if (exact) o.m8pairs++; }
    o.notes += (c.notes || []).length;
    if ((c.notes || []).length) o.noteOn.push(c.t);
    const m = [...c.html.matchAll(/data-fn="(\d+)"/g)].map((x) => +x[1]);
    if (m.some((v) => v > (c.notes || []).length)) o.noteFaults.push(c.t + " marker past end of list");
    for (let i = 1; i <= (c.notes || []).length; i++)
      if (!m.includes(i)) { o.noteFaults.push(c.t + " note " + i + " unreferenced"); break; }
  });
  /* Sayana's bhashya is Sanskrit prose about the hymn rather than the hymn, and it names its own
     sources constantly; a leak shows up as the commentary's stock vocabulary inside the verse. */
  sa.chapters.forEach((c) => {
    if (/सायण|भाष्यम्|इत्यनुक्रमणिकाया|निरु\./.test(c.html)) o.commentary.push(c.t);
  });
  return o;
}

/* DON QUIXOTE, read off the file that shipped. It needed no new reader at all — `body: "plain"` and
   `dropHeadings` between them are the whole configuration — so unlike the Summa's and the Aeneid's
   this is not standing in for a sibling diff. What it stands in for is that those two GATES are
   still firing, and both fail silently and in opposite directions: without `dropHeadings` every one
   of the 126 chapters opens by repeating the title Folio has just printed above it, and without the
   ws-noexport rule each opens on the wiki's own bibliographic header rendered as a quotation. In
   neither case does anything throw, nothing is lost, and the chapter is LONGER rather than shorter,
   which is the shape every count reads as healthy.

   The other half is the PART SPLIT. The chapters run 1..126 straight through while the novel is
   cited by part and chapter, so page() sends 1–52 to Volume 1 and 53–126 to Volume 2 and the titles
   carry the citation; get that boundary wrong by one and the book comes back complete, in order,
   with 126 chapters of real Cervantes filed under the wrong numbers. */
function quixoteChecks() {
  const f = path.join(ROOT, "books", "don-quixote.js");
  if (!fs.existsSync(f)) return null;
  global.window = {};
  delete require.cache[require.resolve(f)];
  require(f);
  const b = (global.window.FOLIO_BOOKS_IN || []).find((x) => x.id === "don-quixote");
  if (!b) return null;
  const o = { chapters: b.chapters.length, p1: 0, p2: 0, tab53: "", cited: 0, titles: new Set(),
              heads: [], junk: [], verse: 0, quotes: 0, marks: 0, notes: 0, shortest: 1e9,
              chars: 0, open: 0, close: 0, windmills: false, front: false,
              intro: b.intro || "" };
  b.chapters.forEach((c) => {
    if (c.p === 1) o.p1++; else if (c.p === 2) o.p2++;
    if (/^(I|II)\.\d+ \S/.test(c.t)) o.cited++;
    o.titles.add(c.t);
    /* the chapter's own title left standing in the prose — what the title peel exists to prevent,
       and the one thing that fails silently on this path: the chapter is simply longer */
    if (/^\s*<(p|blockquote)>\s*(CHAPTER|[A-Z][A-Z ,'-]{20,})/.test(c.html)) o.heads.push(c.n);
    /* Gutenberg's own furniture: the Doré plate captions, its licence boilerplate, its markers */
    if (/\.jpg|Full Size|PROJECT GUTENBERG|www\.gutenberg|\*\*\*/i.test(c.html)) o.junk.push(c.n);
    if (/<blockquote/.test(c.html)) o.verse++;
    o.quotes += (c.html.match(/<blockquote/g) || []).length;
    o.open += (c.html.match(/<p(?=[ >])/g) || []).length;
    o.close += (c.html.match(/<\/p>/g) || []).length;
    o.marks += (c.html.match(/class="bk-n"/g) || []).length;
    o.notes += (c.notes || []).length;
    const len = c.html.replace(/<[^>]*>/g, "").length;
    o.chars += len;
    if (len < o.shortest) o.shortest = len;
  });
  o.tab53 = b.chapters[52] ? b.chapters[52].t : "";
  /* THE SENTENCE THIS BOOK'S WHOLE SOURCE DECISION TURNS ON. The Wikisource copy of the same
     translation reads "thirty forty windmills that there are on plain"; a fault of that kind is
     invisible to every count there is, and this is the only assertion on the shelf that can see
     one, so it is written out in full rather than matched loosely. */
  o.windmills = /thirty or forty windmills that there are on that plain/
    .test((b.chapters[7] || {}).html || "");
  /* and Part II's dedication and preface, which Gutenberg sets inside chapter 52's span */
  o.front = /DEDICATION OF VOLUME|COUNT OF LEMOS/i.test((b.chapters[51] || {}).html || "");
  return o;
}
/* THE SATYRICON, read off the two files that shipped. Its reader is the seventeenth layout and it
   serves ONE book, so like the City of God's and the Aeneid's it cannot be proved inert by re-running
   a sibling — the shipped-data sweep is what stands in for that check.

   EVERY FAULT IT HUNTS IS SILENT. The display quotations are matched BALANCED because <quote> nests
   inside <l>, and a non-greedy pair reports lines as standing outside any block; the block is closed
   and reopened at every boundary the text is cut at, and without that the Bellum Civile — one
   quotation with five section milestones inside it — comes back as five unclosed blocks that still
   render every word. The Latin's 385 notes are an apparatus and are dropped, so a leak makes a
   chapter LONGER. And the Greek is beta code, so a decoder that stopped firing would leave
   "Si/bulla, ti/ qe/leis;" in the most-quoted sentence in the book. Not one of those throws, shortens
   a chapter or disturbs the pairing. */
function satyriconChecks() {
  const dir = path.join(ROOT, "books");
  const enF = path.join(dir, "satyricon.js"), laF = path.join(dir, "satyricon.la.js");
  if (!fs.existsSync(enF) || !fs.existsSync(laF)) return null;
  global.window = {};
  [enF, laF].forEach((f) => { delete require.cache[require.resolve(f)]; require(f); });
  const en = (global.window.FOLIO_BOOKS_IN || []).find((b) => b.id === "satyricon");
  const la = (global.window.FOLIO_BOOK_ORIG_IN || []).find((b) => b.id === "satyricon");
  if (!en || !la) return null;
  const o = { en: en.chapters.length, la: la.chapters.length, intro: en.intro || "",
              enQ: 0, laQ: 0, laLines: 0, enLines: 0, notes: 0, markers: 0, dead: 0, unref: 0,
              marks: 0, apparatus: [], beta: [], greek: 0, gaps: 0, bal: [], shortest: 1e9,
              paired: 0, sentinel: false };
  const TAGS = ["p", "blockquote", "i", "b", "q", "sup"];
  const laBy = {};
  la.chapters.forEach((c) => {
    laBy[c.n] = c.html;
    o.laQ += (c.html.match(/<blockquote>/g) || []).length;
    o.laLines += (c.html.match(/<br>/g) || []).length;
    o.gaps += (c.html.match(/…/g) || []).length;
    o.greek += (c.html.match(/[Ͱ-Ͽἀ-῿]/g) || []).length;
    /* the apparatus, which would make a chapter longer rather than shorter if it leaked */
    if (/Buecheler|Heinsius|Salmasius|Tornaesius|<hi\b/.test(c.html)) o.apparatus.push(c.n);
    if (c.html.includes("@@")) o.sentinel = true;
    if (c.html.length < o.shortest) o.shortest = c.html.length;
  });
  en.chapters.forEach((c) => {
    o.enQ += (c.html.match(/<blockquote>/g) || []).length;
    o.enLines += (c.html.match(/<br>/g) || []).length;
    o.marks += (c.html.match(/class="bk-n"/g) || []).length;
    if (laBy[c.n] != null) o.paired++;
    if (c.html.includes("@@")) o.sentinel = true;
    const ns = c.notes || [];
    o.notes += ns.length;
    const ms = [...c.html.matchAll(/data-fn="(\d+)"/g)].map((m) => +m[1]);
    o.markers += ms.length;
    ms.forEach((n) => { if (n < 1 || n > ns.length) o.dead++; });
    ns.forEach((_, i) => { if (!ms.includes(i + 1)) o.unref++; });
    if (c.html.length < o.shortest) o.shortest = c.html.length;
  });
  /* beta code left standing anywhere: a letter run broken by one of its mark characters */
  [en, la].forEach((bk) => bk.chapters.forEach((c) => {
    if (/[a-z]{2,}[)(\\/\\\\=|][a-z]/.test(c.html.replace(/<[^>]*>/g, ""))) o.beta.push(c.n);
  }));
  /* tag balance over BOTH shipped columns — the sweep this repo prescribes after any stripTags- or
     extractor-adjacent change, and the only thing that can see the crossing-quotation fault */
  [["en", en], ["la", la]].forEach(([tag, bk]) => bk.chapters.forEach((c) => {
    TAGS.forEach((t) => {
      const open = (c.html.match(new RegExp("<" + t + "\\b", "g")) || []).length;
      const shut = (c.html.match(new RegExp("</" + t + ">", "g")) || []).length;
      if (open !== shut) o.bal.push(tag + " §" + c.n + " " + t + " " + open + "/" + shut);
    });
  }));
  o.sibyl = /Σίβυλλα, τί θέλεις;/.test(laBy[48] || "") && /ἀποθανεῖν θέλω/.test(laBy[48] || "");
  /* §120 sits INSIDE the Bellum Civile, so it must open on a block rather than on prose */
  o.midPoem = /^<blockquote>/.test(laBy[120] || "");
  return o;
}


/* THE MAXIMS OF PTAHHOTEP, read off the one file that shipped. Its reader serves ONE book — a Project
   Gutenberg HTML page holding three works — so it cannot be proved inert by re-running a sibling, and
   the shipped-data sweep is what stands in for that check.

   EVERY FAULT IT LOOKS FOR IS SILENT, and the first two matter most because this book has no
   short-chapter guard worth the name: one of its forty-seven sections is twenty-eight characters,
   which is the content rather than a truncation, so `minChars` is 20 and cannot catch an extraction
   that returned the page furniture instead of the text. What stands in for it is the KEY RUN — the
   marks are letters AND numbers interleaved (A, B, 1..37, C, 38..43, D), so a reader written for
   either alone loses one end of the poem entirely while the chapter count and every other figure
   still read healthy. And the volume holds three works plus an introduction whose own heading is the
   WORDS of this one's title, so a slice made on the heading takes the essay about the poem: hence an
   assertion on the text itself at both ends.

   The rest are the ordinary shipped-data sweeps. The printed page numbers survive `stripTags` as
   prose (`{42}` mid-sentence) and make a section LONGER, which no count can see; the transcriber's
   links into the note fold do the same; and a `bk-n` on the one column would change how `bookRows`
   treats a book that has none. */

/* ROMANCE OF THE THREE KINGDOMS, read off the two files that shipped. Its head reader serves one
   book and cannot be proved inert by re-running a sibling, so the shipped-data sweep stands in for
   that check — and everything it looks for is silent.

   THE TITLES ARE THE HALF THAT WOULD ROT QUIETLY. They are read off each chapter's own second
   centred block, because this edition's contents pages print them in capitals and without the
   diacritics; the reader that takes them handles TWO shapes, since two chapters of the hundred and
   twenty put the number and the title inside one block instead of two. A regression there does not
   throw, does not shorten a chapter and does not disturb the pairing — the tab simply falls back to
   the words "Chapter 14", which on a bar of a hundred and twenty tabs nobody would notice. Hence an
   assertion that every title is present, distinct, and not the generic form.

   THE FURNITURE IS THE OTHER HALF, and it fails the way this file keeps recording: a leak makes a
   chapter LONGER, so every count reads as healthy. On the English side the printed head, the
   volume's half-title, the printer's colophon and MediaWiki's own inline stylesheet all survive the
   tag strip as prose; on the Chinese side so do the navigation tables at both ends of the page and
   the wiki's public-domain banner, which some chapters carry and some do not.

   And the pairing: one marker a side per chapter, which is what makes a hundred and twenty rows out
   of a book neither edition numbers below the chapter. */
function threeKingdomsChecks() {
  const fe = path.join(ROOT, "books", "three-kingdoms.js");
  const fz = path.join(ROOT, "books", "three-kingdoms.zh.js");
  if (!fs.existsSync(fe) || !fs.existsSync(fz)) return null;
  global.window = {};
  delete require.cache[require.resolve(fe)];
  delete require.cache[require.resolve(fz)];
  require(fe); require(fz);
  const en = (global.window.FOLIO_BOOKS_IN || []).find((b) => b.id === "three-kingdoms");
  const zh = (global.window.FOLIO_BOOK_ORIG_IN || []).find((b) => b.id === "three-kingdoms");
  if (!en || !zh) return null;
  const o = { en: en.chapters.length, zh: zh.chapters.length, bal: [], marksEn: [], marksZh: [],
              notes: 0, markers: 0, dead: 0, unref: 0, titles: en.chapters.map((c) => c.t),
              enLeak: [], zhLeak: [], shortEn: 1e9, shortZh: 1e9, verseEn: 0, verseZh: 0,
              parts: [...new Set(en.chapters.map((c) => c.p))].sort().join(","),
              paired: 0, seq: en.chapters.map((c) => c.n).join(",") };
  const TAGS = ["p", "blockquote", "i", "b", "q", "sup"];
  const bal = (c, who) => TAGS.forEach((t) => {
    const open = (c.html.match(new RegExp("<" + t + "\\b", "g")) || []).length;
    const shut = (c.html.match(new RegExp("</" + t + ">", "g")) || []).length;
    if (open !== shut) o.bal.push(who + " " + c.n + " " + t + " " + open + "/" + shut);
  });
  /* The printed head and the printer's boundary marks; the transcriber's inline stylesheet, which is
     what put a paragraph of CSS in the middle of chapter 3's title on the first run; and the page
     numbers the Republic's structural rule lifts out with the colophon. */
  const EN_LEAK = /CHAPTER [IVXLCDM]+\.|end of volume|PRINTED BY KELLY|mw-parser-output|\{\d+\}/i;
  /* the wiki's navigation at both ends of the page, its back-to-top link and its licence banner */
  const ZH_LEAK = /目錄|上一回|下一回|返回頁首|公有领域|Public domain|mw-parser-output/;
  en.chapters.forEach((c) => {
    bal(c, "en");
    o.marksEn.push((c.html.match(/class="bk-n"/g) || []).length);
    if (EN_LEAK.test(c.html)) o.enLeak.push(c.n);
    if (c.html.length < o.shortEn) o.shortEn = c.html.length;
    o.verseEn += (c.html.match(/<blockquote>/g) || []).length;
    const ns = c.notes || [];
    o.notes += ns.length;
    const ms = [...c.html.matchAll(/data-fn="(\d+)"/g)].map((m) => +m[1]);
    o.markers += ms.length;
    ms.forEach((n) => { if (n < 1 || n > ns.length) o.dead++; });
    ns.forEach((_, i) => { if (!ms.includes(i + 1)) o.unref++; });
  });
  const zhBy = {};
  zh.chapters.forEach((c) => {
    bal(c, "zh");
    zhBy[c.n] = c;
    o.marksZh.push((c.html.match(/class="bk-n"/g) || []).length);
    if (ZH_LEAK.test(c.html)) o.zhLeak.push(c.n);
    if (c.html.length < o.shortZh) o.shortZh = c.html.length;
    o.verseZh += (c.html.match(/<blockquote>/g) || []).length;
  });
  en.chapters.forEach((c) => { if (zhBy[c.n]) o.paired++; });
  o.generic = o.titles.filter((t) => /^Chapter \d+$/.test(t)).length;
  o.blank = o.titles.filter((t) => !t || !t.trim()).length;
  o.distinct = new Set(o.titles).size;
  /* The Maos' own additions, which the front matter names and which are the plainest evidence a
     reader has that both columns are their recension rather than the 1522 text. */
  const one = en.chapters[0] ? en.chapters[0].html : "";
  const oneZh = zhBy[1] ? zhBy[1].html : "";
  o.divide = /Empires wax and wane; states cleave asunder and coalesce/.test(one);
  o.yangshen = /滾滾長江東逝水/.test(oneZh) && /分久必合，合久必分/.test(oneZh);
  return o;
}

/* THE CONSOLATION OF PHILOSOPHY — five books of alternating prose and verse, from two Gutenberg
   pages. Everything below is invisible from the outside and each of the assertions was written for
   a fault that had actually happened on the way in. The pairing runs on the SECTION'S POSITION IN
   ITS BOOK rather than on a printed compound citation, which neither edition carries, so the shape
   of each book is what has to be checked: a clean 0..N on the English side and 1..N on the Latin,
   the same N in both, and every numbered row facing a counterpart. The summary is numbered 0
   deliberately and draws with an empty Latin cell, so five of the eighty-three rows are English
   only and that is the correct figure rather than a gap. */
function boethiusChecks() {
  const fe = path.join(ROOT, "books", "boethius-consolation.js");
  const fl = path.join(ROOT, "books", "boethius-consolation.la.js");
  if (!fs.existsSync(fe) || !fs.existsSync(fl)) return null;
  global.window = {};
  delete require.cache[require.resolve(fe)];
  delete require.cache[require.resolve(fl)];
  require(fe); require(fl);
  const en = (global.window.FOLIO_BOOKS_IN || []).find((b) => b.id === "boethius-consolation");
  const la = (global.window.FOLIO_BOOK_ORIG_IN || []).find((b) => b.id === "boethius-consolation");
  if (!en || !la) return null;
  const WANT = [13, 16, 24, 14, 11];
  const o = { en: en.chapters.length, la: la.chapters.length, bal: [], notes: 0, markers: 0,
              dead: 0, unref: 0, enLeak: [], laLeak: [], paired: 0, enOnly: 0, laOnly: 0,
              shape: [], seqBad: [], titles: en.chapters.map((c) => c.t), laNotes: 0,
              songs: 0, chaps: 0, verseEn: 0, verseLa: 0, greekLa: 0, greekEn: 0,
              realGreekEn: 0, realGreekLa: 0, shortEn: 1e9, shortLa: 1e9, lines: 0 };
  const TAGS = ["p", "blockquote", "i", "b", "q", "sup", "span"];
  const bal = (c, who) => TAGS.forEach((t) => {
    const open = (c.html.match(new RegExp("<" + t + "(?=[ >])", "g")) || []).length;
    const shut = (c.html.match(new RegExp("</" + t + ">", "g")) || []).length;
    if (open !== shut) o.bal.push(who + " " + c.n + " " + t + " " + open + "/" + shut);
  });
  /* The transcriber's furniture on the English side — the running page anchors, the note list's own
     caption, the poem containers and the licence boilerplate — plus the bracketed romanisation this
     edition sets beside a Greek letter it has already printed. */
  const EN_LEAK = /PROJECT GUTENBERG|FOOTNOTES:|Page_\d|pginternal|fnanchor|class="poem"|class="stanza"|class="blockquot"|\[Greek:|<h[1-6]|<div|<ul|<li[ >]/i;
  /* On the Latin side, the volume's own structure: it holds four other works before the Consolation
     and Symmachus's epigram after it, and the printer's book heads duplicate the tab. */
  const LA_LEAK = /PROJECT GUTENBERG|\bLIBER [IVX]|EXPLICIT|INCIPIT|SYMMACHI|THE (FIRST|SECOND|THIRD|FOURTH|FIFTH) BOOK|<h[1-6]|<div|id="id\d|margin-left/;
  const marks = (h) => [...h.matchAll(/<span class="bk-n" data-n="(\d+)">([\s\S]*?)<\/span>/g)]
    .map((m) => ({ n: +m[1], t: m[2] }));
  const laBy = {};
  la.chapters.forEach((c) => {
    bal(c, "la");
    laBy[c.n] = c;
    if (LA_LEAK.test(c.html)) o.laLeak.push(c.n);
    if (c.html.length < o.shortLa) o.shortLa = c.html.length;
    o.verseLa += (c.html.match(/<blockquote>/g) || []).length;
    o.laNotes += (c.notes || []).length;
    o.greekLa += (c.html.match(/\[Greek:/g) || []).length;
    o.realGreekLa += (c.html.match(/[Ͱ-Ͽἀ-῿]/g) || []).length;
    /* Lines of VERSE, so counted inside the quotation blocks alone: the prose carries two line
       breaks of its own, inside the two-line Euripides quotation of III.6, which the edition sets
       as verse in the middle of a sentence and which is not a metre. */
    (c.html.match(/<blockquote>[\s\S]*?<\/blockquote>/g) || []).forEach((bq) => {
      o.lines += (bq.match(/<br>/g) || []).length + 1;
    });
  });
  en.chapters.forEach((c, i) => {
    bal(c, "en");
    if (EN_LEAK.test(c.html)) o.enLeak.push(c.n);
    if (c.html.length < o.shortEn) o.shortEn = c.html.length;
    o.verseEn += (c.html.match(/<blockquote>/g) || []).length;
    o.greekEn += (c.html.match(/\[Greek:/g) || []).length;
    o.realGreekEn += (c.html.match(/[Ͱ-Ͽἀ-῿]/g) || []).length;
    const me = marks(c.html), ml = marks((laBy[c.n] || { html: "" }).html);
    o.songs += me.filter((m) => /^Song /.test(m.t)).length;
    o.chaps += me.filter((m) => /^Ch\. /.test(m.t)).length;
    /* The English runs 0 (the summary) then 1..N; the Latin runs 1..N and has no summary of its
       own. A book short of a section, or one whose numbers repeat, would ship as a pairing gap and
       nothing else here would say so. */
    const wantEn = [0].concat(WANT[i] ? Array.from({ length: WANT[i] }, (_, k) => k + 1) : []).join(",");
    const wantLa = WANT[i] ? Array.from({ length: WANT[i] }, (_, k) => k + 1).join(",") : "";
    if (me.map((m) => m.n).join(",") !== wantEn) o.seqBad.push("en " + c.n);
    if (ml.map((m) => m.n).join(",") !== wantLa) o.seqBad.push("la " + c.n);
    o.shape.push(me.length - 1 + "/" + ml.length);
    const set = new Set(ml.map((m) => m.n));
    me.forEach((m) => { if (set.has(m.n)) o.paired++; else o.enOnly++; });
    const eset = new Set(me.map((m) => m.n));
    ml.forEach((m) => { if (!eset.has(m.n)) o.laOnly++; });
    const ns = c.notes || [];
    o.notes += ns.length;
    const ms = [...c.html.matchAll(/data-fn="(\d+)"/g)].map((m) => +m[1]);
    o.markers += ms.length;
    ms.forEach((n) => { if (n < 1 || n > ns.length) o.dead++; });
    ns.forEach((_, k) => { if (!ms.includes(k + 1)) o.unref++; });
  });
  o.shape = o.shape.join(" ");
  /* Every book opens on its own summary, and only the first opens on a poem — which is what makes
     the metre-and-prose alternation derivable on the Latin side, where nothing but the setting
     tells the two apart. */
  o.summaries = en.chapters.filter((c) => /<span class="bk-n" data-n="0">Summary<\/span>/.test(c.html)).length;
  const firstMark = (h) => (marks(h)[1] || { t: "" }).t;
  o.firstKind = en.chapters.map((c) => (/^Song /.test(firstMark(c.html)) ? "m" : "p")).join("");
  o.blankTitles = o.titles.filter((t) => !t || !t.trim() || /^Book \d+$/.test(t)).length;
  o.distinct = new Set(o.titles).size;
  /* Content at both ends and at the middle: the poem the book opens on, the prose beneath it, the
     great hymn at the centre of Book III, and the last sentence of the work. */
  const e1 = en.chapters[0] ? en.chapters[0].html : "", l1 = laBy[1] ? laBy[1].html : "";
  const e3 = en.chapters[2] ? en.chapters[2].html : "", l3 = laBy[3] ? laBy[3].html : "";
  const e5 = en.chapters[4] ? en.chapters[4].html : "", l5 = laBy[5] ? laBy[5].html : "";
  o.opens = /Who wrought my studious numbers/.test(e1) && /Carmina qui quondam studio florente peregi/.test(l1);
  o.prose1 = /a woman of a countenance exceeding venerable/.test(e1) && /Haec dum mecum tacitus ipse reputarem/.test(l1);
  o.hymn = /Maker of earth and sky, from age to age/.test(e3) && /O qui perpetua mundum ratione gubernas/.test(l3);
  o.ends = /before the eyes of a Judge who seeth all things/.test(e5) && /ante oculos agitis iudicis cuncta cernentis/.test(l5);
  /* The two Greek letters on Philosophy's gown, which are a letter NAME in the transcription and are
     decoded because a name says exactly which letter it is. The romanised quotations are not, and
     the front matter says so — so the count of what is LEFT is asserted too, in both directions. */
  o.gown = /Π Graecum/.test(l1) && /the letter θ/.test(e1);
  o.summaryCites = /Boethius' complaint \(Song I\.\)/.test(e1);
  return o;
}

/* LE MORTE D'ARTHUR — one column, 21 books, 503 of Caxton's chapters.
   Everything here fails silently. A chapter dropped from the 503 leaves twenty perfectly good books
   and a run of numbers nobody counts; a rubric lost leaves a section head that is a bare figure on a
   bar of eighty-eight; a transcriber's note leaking back in puts an unsigned collation of the
   Winchester manuscript under a book offered as the 1906 Everyman; and a chapter that is really
   Project Gutenberg's text rather than this one reads perfectly and is a different book. */
/* THE ECCLESIASTICAL HISTORY — both columns, read off the shipped files.
   The pairing here is exact by measurement rather than by construction, so what has to be asserted
   is that it STAYS exact: 140 chapters a side in 34/20/30/32/24, a clean 1..N in every book on both
   sides, and the two columns' lists identical. Every fault this book can have is silent — a mark
   that stops being recognised folds its chapter into the one before it, which shortens nothing
   visibly, and a heading whose footnote marker is flattened leaves a bare figure in a title while
   its note sits in a fold nothing points at. */
function bedeChecks() {
  const fe = path.join(ROOT, "books", "bede-history.js");
  const fl = path.join(ROOT, "books", "bede-history.la.js");
  if (!fs.existsSync(fe) || !fs.existsSync(fl)) return null;
  global.window = {};
  for (const f of [fe, fl]) { delete require.cache[require.resolve(f)]; require(f); }
  const en = (global.window.FOLIO_BOOKS_IN || []).find((b) => b.id === "bede-history");
  const la = (global.window.FOLIO_BOOK_ORIG_IN || []).find((b) => b.id === "bede-history");
  if (!en || !la) return null;
  const WANT = [34, 20, 30, 32, 24];
  const nums = (h) => (h.match(/class="bk-n"[^>]*>(\d+)</g) || []).map((s) => +s.match(/>(\d+)</)[1]);
  const o = { books: en.chapters.length, laBooks: la.chapters.length, shape: [], laShape: [],
              seqBad: [], differ: [], secs: 0, laSecs: 0, notes: 0, markers: 0, drops: 0,
              orphans: 0, titles: 0, bareNum: [], headMarks: 0, bal: [], leak: [], laLeak: [],
              lead: 0, laLead: 0, vBad: 0 };
  const TAGS = ["p", "blockquote", "i", "b", "q", "sup", "span"];
  /* The transcriber's furniture on each side: Gutenberg's TEI classes and page marks, and the wiki's
     own containers, edit links and running heads. A leak makes a chapter LONGER, so no count of
     chapters or sections can see it and the shipped file has to be swept. */
  const LEAK_EN = /tei-|pginternal|\[pg |pagenum|<h[1-6]|<div|<dl[ >]|<dt[ >]|noteref/i;
  const LEAK_LA = /mw-parser-output|mw-heading|mw-editsection|ws-noexport|titulusHeaderBox|recensere|HISTORIAE ECCLESIASTICAE|<h[1-6]|<div|<table/i;
  en.chapters.forEach((c, i) => {
    const ns = nums(c.html);
    o.secs += ns.length; o.shape.push(ns.length);
    if (!ns.every((v, k) => v === k + 1)) o.seqBad.push("EN " + c.n);
    o.notes += (c.notes || []).length;
    o.markers += (c.html.match(/<sup class="fn"/g) || []).length;
    if (LEAK_EN.test(c.html)) o.leak.push(c.n);
    /* Every marker resolves and every note is referenced — the assertion that found the heading
       markers, and the only one that can see either failure. */
    const n = (c.notes || []).length, used = new Set();
    for (const m of c.html.matchAll(/<sup class="fn" data-fn="(\d+)">/g)) {
      const v = +m[1];
      if (v < 1 || v > n) o.drops++;
      used.add(v);
    }
    for (let k = 1; k <= n; k++) if (!used.has(k)) o.orphans++;
    /* Bede's own descriptive heading beside each number, and no bare figure left in one. */
    for (const m of c.html.matchAll(/<b>([\s\S]*?)<\/b>/g)) {
      o.titles++;
      o.headMarks += (m[1].match(/<sup class="fn"/g) || []).length;
      if (/\b\d{2,4}\b\s*(\[|$)/.test(m[1].replace(/<sup[^>]*><\/sup>/g, ""))) o.bareNum.push(c.n);
    }
    TAGS.forEach((t) => {
      const open = (c.html.match(new RegExp("<" + t + "(?=[ >])", "g")) || []).length;
      const shut = (c.html.match(new RegExp("</" + t + ">", "g")) || []).length;
      if (open !== shut) o.bal.push("EN " + c.n + " " + t + " " + open + "/" + shut);
    });
    const lc = la.chapters.find((x) => x.n === c.n);
    if (!lc) { o.differ.push("no Latin for book " + c.n); return; }
    const ls = nums(lc.html);
    o.laSecs += ls.length; o.laShape.push(ls.length);
    if (!ls.every((v, k) => v === k + 1)) o.seqBad.push("LA " + c.n);
    if (LEAK_LA.test(lc.html)) o.laLeak.push(c.n);
    if (ns.join() !== ls.join()) o.differ.push("book " + c.n);
    TAGS.forEach((t) => {
      const open = (lc.html.match(new RegExp("<" + t + "(?=[ >])", "g")) || []).length;
      const shut = (lc.html.match(new RegExp("</" + t + ">", "g")) || []).length;
      if (open !== shut) o.bal.push("LA " + c.n + " " + t + " " + open + "/" + shut);
    });
  });
  o.shapeOK = o.shape.join() === WANT.join() && o.laShape.join() === WANT.join();
  /* Bede's letter to Ceolwulf opens Book I on both sides, unnumbered — the row `bookRows` pairs on
     key -1 === -1 because neither column carries a marker there. */
  const b1 = en.chapters.find((c) => c.n === 1), l1 = la.chapters.find((c) => c.n === 1);
  o.lead = b1 ? b1.html.indexOf('class="bk-n"') : -1;
  o.laLead = l1 ? l1.html.indexOf('class="bk-n"') : -1;
  o.prefaceEn = !!(b1 && /most glorious king Ceolwulf/i.test(b1.html.slice(0, o.lead)));
  o.prefaceLa = !!(l1 && /GLORIOSISSIMO REGI CEOLUULFO/.test(l1.html.slice(0, o.laLead)));
  /* Sellar's own words, at the two places a reader would notice them going: the sparrow simile she
     is quoted for, and the Old English of Bede's Death Song — which is the ONE verse block in the
     five books and would vanish silently if the line-group rule stopped firing. */
  const all = en.chapters.map((c) => c.html).join("\n");
  o.sparrow = /swift flight of a sparrow through the house wherein you sit at supper in winter, with your ealdormen and thegns/.test(all);
  o.caedmon = /Now must we praise the Maker of the heavenly kingdom/i.test(all);
  o.letters = (all.match(/<blockquote>/g) || []).length;
  /* And the Latin's own, at the opening of the work and at the last chapter of Book V. Probed on the
     text with the tags OFF, because this transcription sets a drop capital on the first word of every
     chapter — "<b>B</b>rittania" — so a pattern written against the markup matches nothing. */
  const laAll = la.chapters.map((c) => c.html).join("\n");
  const laFlat = laAll.replace(/<[^>]+>/g, "");
  o.laOpens = /Brittania Oceani insula, cui quondam Albion nomen fuit/.test(laFlat);
  o.laCloses = /dominicae autem incarnationis anno DCCXXXI/.test(laFlat);
  /* WHOSE LATIN IT IS. The transcription names Migne and prints consonantal v as u, which Migne does
     not — so the u-forms are the fingerprint, and a shelf that quietly acquired a v-orthography text
     would be a different edition under the same claim. Counted in both directions. */
  o.u = { uero: (laFlat.match(/\buero\b/g) || []).length, uita: (laFlat.match(/\buita\b/g) || []).length,
          ciuitate: (laFlat.match(/\bciuitate\b/g) || []).length };
  o.v = { vero: (laFlat.match(/\bvero\b/g) || []).length, vita: (laFlat.match(/\bvita\b/g) || []).length,
          civitate: (laFlat.match(/\bcivitate\b/g) || []).length };
  /* The Continuation is a later hand's and is deliberately not shelved; it would announce itself as
     a sixth book or as annals appended to the fifth. */
  o.noContinuation = !/BAEDAE CONTINUATIO/.test(laAll) && !/Anno DCCXXXIII/.test(laAll);
  return o;
}

/* THE TRAVELS OF MARCO POLO — one column, and that is the first thing to assert rather than the
   last. A single-column book cannot fail a PAIRING, which is what catches most faults on this
   shelf, so everything about it has to be checked directly — Malory's position, and here with an
   apparatus five times the size of his. Two things in particular are invisible any other way. The
   NOTES are the reason this edition was taken: 788 of them, one cited twice, spliced into their
   own chapters and renumbered from 1, so a marker that stops resolving leaves a superscript
   pointing at somebody else's note and the chapter reads perfectly either way. And Yule's THREE
   EDITORIAL MARKS — the brackets round what he takes from Ramusio, Cordier's —H. C. signature, and
   the ⚜ on each chapter of Book Fourth given in gist — are the edition telling the reader whose
   words they are looking at; a mark that stops being recognised is tidied away in silence and looks
   exactly like a mark that was never there. */
function poloChecks() {
  const f = path.join(ROOT, "books", "marco-polo.js");
  if (!fs.existsSync(f)) return null;
  global.window = {};
  delete require.cache[require.resolve(f)];
  require(f);
  const b = (global.window.FOLIO_BOOKS_IN || []).find((x) => x.id === "marco-polo");
  if (!b) return null;
  const CITE = [null, /^Prol\. \d+ — ./, /^I \d+ — ./, /^II \d+ — ./, /^III \d+ — ./, /^IV \d+ — ./];
  const o = { chapters: b.chapters.length, shape: [0, 0, 0, 0, 0], seq: [], titles: [], notes: 0,
              markers: 0, drops: 0, orphans: 0, repeats: 0, bkn: 0, bal: [], leak: [], ent: [],
              gist: 0, ram: 0, cordier: 0, cordierNotes: 0, verse: 0, greek: 0 };
  const TAGS = ["p", "blockquote", "i", "b", "q", "sup", "span"];
  /* Gutenberg's own furniture on this transcription: the TEI class names it wraps everything in,
     its internal links, its page marks and the headings and containers a chapter must not carry.
     A leak makes a chapter LONGER, so no count of chapters or notes can see one. `tei-` is anchored
     INSIDE a tag rather than matched loose: Polo's notes are full of Mongolian place names, and the
     Kentei-Khan, the mountain by the sources of the Onon, carries the letters in its own name. */
  const LEAK = /<[^>]*tei-|pginternal|pagenum|<div|<h[1-6]|figcenter|center-container|\[pg /i;
  b.chapters.forEach((c, i) => {
    if (c.p >= 1 && c.p <= 5) o.shape[c.p - 1]++;
    if (c.n !== i + 1) o.seq.push(c.n);
    if (!CITE[c.p] || !CITE[c.p].test(c.t)) o.titles.push(c.n + ": " + c.t);
    const notes = c.notes || [];
    o.notes += notes.length;
    o.bkn += (c.html.match(/class="bk-n"/g) || []).length;
    if (LEAK.test(c.html) || LEAK.test(notes.join(""))) o.leak.push(c.n);
    /* Every marker resolves and every note is referenced. Yule cites one note twice, which is the
       Seneca rule working: a marker carries the note it POINTS AT, never its place in the queue. */
    const used = new Set();
    let m = 0;
    for (const x of c.html.matchAll(/<sup class="fn" data-fn="(\d+)">/g)) {
      m++;
      const v = +x[1];
      if (v < 1 || v > notes.length) o.drops++;
      used.add(v);
    }
    o.markers += m;
    o.repeats += m - used.size;
    for (let k = 1; k <= notes.length; k++) if (!used.has(k)) o.orphans++;
    const hay = c.html + "\n" + notes.join("\n");
    TAGS.forEach((t) => {
      const open = (hay.match(new RegExp("<" + t + "(?=[ >])", "g")) || []).length;
      const shut = (hay.match(new RegExp("</" + t + ">", "g")) || []).length;
      if (open !== shut) o.bal.push(c.n + " " + t + " " + open + "/" + shut);
    });
    if (/&[a-zA-Z]{2,8};/.test(hay.replace(/&(amp|lt|gt|quot|#\d+);/g, ""))) o.ent.push(c.n);
    if (/⚜/.test(c.html)) o.gist++;
    o.ram += (c.html.match(/\[[^[\]]{25,}\]/g) || []).length;
    const sig = notes.join("").split("—H. C.").length - 1;
    o.cordier += sig;
    o.cordierNotes += notes.filter((n) => /—H\. C\./.test(n)).length;
    o.verse += (notes.join("").match(/<blockquote>/g) || []).length;
    o.greek += (hay.match(/[Ͱ-Ͽ]/g) || []).length;
  });
  const all = b.chapters.map((c) => c.html).join("\n");
  o.opens = /^<p>It came to pass in the year of Christ 1260, when Baldwin was reigning at Constantinople/.test(b.chapters[0].html);
  o.closes = /noble and illustrious citizen of the City of Venice, Messer Marco the son of Messer Nicolo Polo\.?<\/p>\s*$/.test(b.chapters[b.chapters.length - 1].html);
  /* The two sentences a reader opens the book for, at the two ends of it: the paper money of Cathay
     and the stones that burn. Either would go silently if a chapter were dropped from the middle. */
  o.paper = /paper.{0,40}(money|currency)/i.test(all) && /Kaan.{0,200}bark of.{0,40}(Mulberry|tree)/i.test(all);
  o.coal = /kind of black stones? existing in beds in the mountains, which they dig out and burn/i.test(all);
  return o;
}

function malloryChecks() {
  const f = path.join(ROOT, "books", "morte-darthur.js");
  if (!fs.existsSync(f)) return null;
  global.window = {};
  delete require.cache[require.resolve(f)];
  require(f);
  const en = (global.window.FOLIO_BOOKS_IN || []).find((b) => b.id === "morte-darthur");
  if (!en) return null;
  /* Caxton's own chapter counts, book by book — the figure the import is built on, restated here so
     a change to MALORY_CHAPTERS has to be made deliberately in two places. */
  const WANT = [27, 19, 15, 28, 12, 18, 35, 41, 43, 88, 14, 14, 20, 10, 6, 17, 23, 25, 13, 22, 13];
  const o = { books: en.chapters.length, secs: 0, rubrics: 0, bal: [], seqBad: [], shape: [],
              shapeBad: [], notes: 0, markers: 0, leak: [], chars: 0, kept: {} };
  const TAGS = ["p", "blockquote", "i", "b", "q", "sup", "span"];
  /* The transcriber's furniture: the wiki's own containers and classes, the scan's page anchors, the
     inline stylesheets MediaWiki deduplicates into the page, and the "Wikisource contributor note"
     template — the last being what `dropNotes` exists to keep out. */
  const LEAK = /mw-parser-output|TemplateStyles|prp-pages|ws-noexport|wst-|pagenum|pageindex|data-page-|Wikisource contributor|<h[1-6]|<div|<ul|<li[ >]|\{[a-z-]+:/i;
  en.chapters.forEach((c, i) => {
    o.chars += c.html.length;
    o.notes += (c.notes || []).length;
    o.markers += (c.html.match(/<sup class="fn"/g) || []).length;
    if (LEAK.test(c.html)) o.leak.push(c.n);
    TAGS.forEach((t) => {
      const open = (c.html.match(new RegExp("<" + t + "(?=[ >])", "g")) || []).length;
      const shut = (c.html.match(new RegExp("</" + t + ">", "g")) || []).length;
      if (open !== shut) o.bal.push(c.n + " " + t + " " + open + "/" + shut);
    });
    const nums = [...c.html.matchAll(/<span class="bk-n">(\d+)<\/span>/g)].map((m) => +m[1]);
    o.secs += nums.length;
    o.shape.push(nums.length + "/" + WANT[i]);
    if (nums.length !== WANT[i]) o.shapeBad.push(c.n + ": " + nums.length + " of " + WANT[i]);
    if (nums.some((v, k) => v !== k + 1)) o.seqBad.push(c.n);
    /* EVERY section head carries Caxton's rubric beside its number. A rubric lost is not a missing
       chapter and no count of chapters can see it — on the bar of eighty-eight that Book X is, it is
       the only thing telling one adventure from the next. */
    o.rubrics += (c.html.match(/<span class="bk-n">\d+<\/span><b>[^<]/g) || []).length;
  });
  o.shape = o.shape.join(" ");
  const one = en.chapters.find((c) => c.n === 1) || { html: "" };
  const last = en.chapters.find((c) => c.n === 21) || { html: "" };
  /* Caxton's preface stands at the head of Book I, before the first numbered chapter and claiming no
     number of its own — the printed book's own arrangement, and the reason `pageMark` returns null
     for it. Measured as the text BEFORE the first marker, so a preface filed as chapter 1 fails. */
  o.lead = one.html.slice(0, one.html.indexOf('<span class="bk-n">'));
  o.prefaceHere = /nine worthy and the best that ever were/.test(o.lead);
  o.opensOnUther = /befell in the days of Uther Pendragon/.test(one.html);
  o.colophon = /Caxton me fieri fecit/.test(last.html);
  o.epilogue = /the ninth year of the reign of\s*\n?King Edward the Fourth/.test(last.html);
  /* The chapter whose rubric this edition sets as a centred block rather than as a subsubheading —
     one page in 503, and the shape a rule written for the other 502 silently turns into a stray
     indented shout at the top of the chapter. */
  o.oddRubric = /COMMUNICATION BETWEEN SIR GAWAINE AND SIR LAUNCELOT/.test(
    (en.chapters.find((c) => c.n === 20) || { html: "" }).html);
  /* WHICH TEXT THIS IS. The other free English copy differs from this one about a thousand times and
     always the same way, so a handful of readings is a fingerprint: if the shelf ever quietly
     acquires that transcription instead, these say so, and nothing else here would.

     EVERY WORD BELOW WAS COUNTED IN BOTH COPIES BEFORE IT WAS USED, and that is not a formality —
     the first list included `advision`, which reads like a perfect discriminator and occurs 25 times
     in the other copy as well (it differs only in the rubrics of one book), and `trappings` and
     `rightwise`, which THIS edition also uses once each beside its own older forms. A negative test
     on a word both copies carry passes or fails on nothing. These eight are zero in the other copy
     and non-zero here. */
  const all = en.chapters.map((c) => c.html).join(" ");
  for (const w of ["alit", "pyght", "hool", "trappours", "jesseraunte", "stynte", "doole", "bisene"])
    o.kept[w] = (all.match(new RegExp("\\b" + w + "\\b", "gi")) || []).length;
  return o;
}

function ptahhotepChecks() {
  const f = path.join(ROOT, "books", "ptahhotep.js");
  if (!fs.existsSync(f)) return null;
  global.window = {};
  delete require.cache[require.resolve(f)];
  require(f);
  const bk = (global.window.FOLIO_BOOKS_IN || []).find((b) => b.id === "ptahhotep");
  if (!bk) return null;
  const keys = ["A", "B"];
  for (let i = 1; i <= 37; i++) keys.push(String(i));
  keys.push("C");
  for (let i = 38; i <= 43; i++) keys.push(String(i));
  keys.push("D");
  const o = { n: bk.chapters.length, intro: bk.intro || "", titles: bk.chapters.map((c) => c.t),
              want: keys.map((k) => "§ " + k), notes: 0, markers: 0, dead: 0, unref: 0,
              marks: 0, braces: 0, links: 0, bal: [], shortest: 1e9, longest: 0, ke: 0 };
  const TAGS = ["p", "blockquote", "i", "b", "q", "sup"];
  bk.chapters.forEach((c) => {
    o.marks += (c.html.match(/class="bk-n"/g) || []).length;
    o.braces += (c.html.match(/\{\d+\}/g) || []).length;
    o.links += (c.html.match(/pginternal|chap02fn/g) || []).length;
    const ns = c.notes || [];
    o.notes += ns.length;
    const ms = [...c.html.matchAll(/data-fn="(\d+)"/g)].map((m) => +m[1]);
    o.markers += ms.length;
    ms.forEach((n) => { if (n < 1 || n > ns.length) o.dead++; });
    ns.forEach((_, i) => { if (!ms.includes(i + 1)) o.unref++; });
    if (c.html.length < o.shortest) o.shortest = c.html.length;
    if (c.html.length > o.longest) o.longest = c.html.length;
    /* the two OTHER works in the same volume, neither of which is this book */
    if (/Ke'gemni|Amenemhe'et/.test(c.html)) o.ke++;
    TAGS.forEach((t) => {
      const open = (c.html.match(new RegExp("<" + t + "\\b", "g")) || []).length;
      const shut = (c.html.match(new RegExp("</" + t + ">", "g")) || []).length;
      if (open !== shut) o.bal.push(c.t + " " + t + " " + open + "/" + shut);
    });
  });
  const first = bk.chapters[0] ? bk.chapters[0].html : "";
  const last = bk.chapters[bk.chapters.length - 1] ? bk.chapters[bk.chapters.length - 1].html : "";
  /* the poem's own incipit, which stands before the first mark and is given to the section after it */
  o.incipit = /^<p>The Instruction of the Governor of his City/.test(first);
  /* the essay ABOUT the poem opens "Of the personality of Ptah-hotep" — the poem itself does not */
  o.isPoem = /'O Prince, my Lord, the end of life is at hand/.test(first);
  o.closes = /fivescore and ten years of life/.test(last);
  /* Gunn's own square-bracketed stand-in for the maxim he would not English in 1906 */
  const s32 = bk.chapters.find((c) => c.t === "§ 32");
  o.omission = !!s32 && /\[Concerning continence\]/.test(s32.html);
  return o;
}

/* THE RAMAYANA, read off the two files that shipped. Its reader serves ONE book — a Project Gutenberg
   TEI on the English side and a four-shaped wiki on the Sanskrit — so it cannot be proved inert by
   re-running a sibling, and the shipped-data sweep is what stands in for that check.

   EVERY FAULT IT LOOKS FOR IS SILENT. The pairing rests on Griffith having numbered around his own
   omissions, and on two measured places where the editions divide differently; get either wrong and
   the poem is complete, every count is healthy, and cantos sit beside passages that are not theirs.
   So the count of PAIRED cantos is asserted exactly, and the three that pair with nothing are asserted
   BY NAME — a fourth would mean a shift had moved. A `bk-n` appearing on either side would silently
   change how bookRows pairs the columns (neither edition numbers below the canto, so both must stay
   unmarked). And the Sanskrit's page furniture — the citation header and the स्रोतः credit naming the
   audio reciters — makes a sarga LONGER if it leaks, which no count of sargas or verses can see. */
function ramayanaChecks() {
  const dir = path.join(ROOT, "books");
  const enF = path.join(dir, "ramayana.js"), saF = path.join(dir, "ramayana.sa.js");
  if (!fs.existsSync(enF) || !fs.existsSync(saF)) return null;
  global.window = {};
  [enF, saF].forEach((f) => { delete require.cache[require.resolve(f)]; require(f); });
  const en = (global.window.FOLIO_BOOKS_IN || []).find((b) => b.id === "ramayana");
  const sa = (global.window.FOLIO_BOOK_ORIG_IN || []).find((b) => b.id === "ramayana");
  if (!en || !sa) return null;
  const o = { en: en.chapters.length, sa: sa.chapters.length, intro: en.intro || "",
              lines: 0, notes: 0, markers: 0, dead: 0, unref: 0, marks: 0, bal: [],
              unpaired: [], parts: {}, header: [], credit: [], danda: 0, omitNotes: 0,
              unnamed: [], shortestEn: 1e9, shortestSa: 1e9 };
  const TAGS = ["p", "blockquote", "i", "b", "q", "sup"];
  const saBy = {};
  sa.chapters.forEach((c) => {
    saBy[c.n] = c.html;
    o.danda += (c.html.match(/॥/g) || []).length;
    /* The page's own furniture, either of which would make a sarga LONGER rather than shorter, so no
       count of chapters or verses can see it. Both tests are narrower than they look, and each was
       narrowed after a false positive:
       · the OPENING citation header only. The traditional closing colophon reads the same way
         ("इत्यार्षे श्रीमद्रामायणे … सर्गः ॥१-२॥") and is TEXT the edition prints — 38 sargas carry
         one — so a test on the wording alone condemns the poem for containing itself.
       · the reciters' names and the transcription's host, NOT the word स्रोतः, which heads the credit
         block and is also the ordinary Sanskrit for a stream: it occurs mid-verse in four sargas. */
    if (/^<p>[^॥<]{0,90}सर्गः/.test(c.html)) o.header.push(c.n);
    if (/पाठकौ|sanskrit\.github\.io/.test(c.html)) o.credit.push(c.n);
    o.marks += (c.html.match(/class="bk-n"/g) || []).length;
    if (c.html.length < o.shortestSa) o.shortestSa = c.html.length;
  });
  en.chapters.forEach((c) => {
    o.lines += (c.html.match(/<br>/g) || []).length + (c.html.match(/<p>/g) || []).length;
    o.marks += (c.html.match(/class="bk-n"/g) || []).length;
    o.parts[c.p] = (o.parts[c.p] || 0) + 1;
    /* A tab reads "1.1 · Nárad" — the citation, then Griffith's own name for the canto. Both halves
       are asserted: the citation is what the pairing is measured in, and the name is content the
       edition prints that was dropped for a whole run and found only by looking at the chapter bar. */
    const cite = c.t.split(" · ")[0];
    if (!/ · \S/.test(c.t)) o.unnamed.push(c.t);
    if (saBy[c.n] == null) o.unpaired.push(cite);
    /* Griffith's bracketed statements of what he left out, kept where he printed them */
    if (/\[I (?:omit|am compelled)|Cantos? .{0,30}(?:are |is )?omitted/.test(c.html)) o.omitNotes++;
    const ns = c.notes || [];
    o.notes += ns.length;
    const ms = [...c.html.matchAll(/data-fn="(\d+)"/g)].map((m) => +m[1]);
    o.markers += ms.length;
    ms.forEach((n) => { if (n < 1 || n > ns.length) o.dead++; });
    ns.forEach((_, i) => { if (!ms.includes(i + 1)) o.unref++; });
    if (c.html.length < o.shortestEn) o.shortestEn = c.html.length;
  });
  [["en", en], ["sa", sa]].forEach(([tag, bk]) => bk.chapters.forEach((c) => {
    TAGS.forEach((t) => {
      const open = (c.html.match(new RegExp("<" + t + "\\b", "g")) || []).length;
      const shut = (c.html.match(new RegExp("</" + t + ">", "g")) || []).length;
      if (open !== shut) o.bal.push(tag + " " + c.t + " " + t + " " + open + "/" + shut);
    });
  }));
  return o;
}

/* THE AENEID, read off the two files that shipped. Its reader is `cards: "both"` plus the mid-line
   lift, and like The City of God's it serves ONE book, so it cannot be proved inert by re-running a
   sibling — the shipped-data sweep is what stands in for that check.

   Every fault it looks for is SILENT on the page. Williams marks 69 of his 396 card boundaries as
   milestones standing INSIDE a line, and slicing the book at one cuts the <l> in half: teiVerse matches
   a complete <l>…</l> pair and nothing else, so both halves vanish and one line of verse disappears at
   each of the 69 — with every book still pairing, nothing throwing, and the poem 99.5% present. Hence
   the line COUNTS, which are the only thing that can see it. The weld sweep is the second half of the
   same rule (the tag sat where the space belonged at 13 of the 69), and the <choice> sweep is a third
   fault that shipped live in Lucretius's Latin for weeks as "aeraër" for aër. */
function aeneidChecks() {
  const dir = path.join(ROOT, "books");
  const enF = path.join(dir, "virgil-aeneid.js"), laF = path.join(dir, "virgil-aeneid.la.js");
  if (!fs.existsSync(enF) || !fs.existsSync(laF)) return null;
  global.window = {};
  [enF, laF].forEach((f) => { delete require.cache[require.resolve(f)]; require(f); });
  const en = (global.window.FOLIO_BOOKS_IN || []).find((b) => b.id === "virgil-aeneid");
  const la = (global.window.FOLIO_BOOK_ORIG_IN || []).find((b) => b.id === "virgil-aeneid");
  if (!en || !la) return null;
  const nums = (h) => (h.match(/class="bk-n"[^>]*>(\d+)</g) || []).map((s) => +s.match(/>(\d+)</)[1]);
  // a line of verse is one <br> or one opening <p>; that is how teiVerse joins them
  const lines = (h) => (h.match(/<br>/g) || []).length + (h.match(/<p>/g) || []).length;
  const o = {
    enBooks: en.chapters.length, laBooks: la.chapters.length,
    enCards: 0, laCards: 0, enLines: 0, laLines: 0,
    shared: 0, enOnly: [], laOnly: [], exact: 0, disorder: [], welds: [], doubled: [],
  };
  en.chapters.forEach((c) => {
    const p = la.chapters.find((x) => x.n === c.n);
    const a = nums(c.html), b = p ? nums(p.html) : [];
    o.enCards += a.length; o.laCards += b.length;
    o.enLines += lines(c.html); o.laLines += p ? lines(p.html) : 0;
    if (!a.every((v, i) => i === 0 || v > a[i - 1])) o.disorder.push("en " + c.n);
    if (!b.every((v, i) => i === 0 || v > b[i - 1])) o.disorder.push("la " + c.n);
    if (new Set(a).size !== a.length) o.disorder.push("en dup " + c.n);
    if (new Set(b).size !== b.length) o.disorder.push("la dup " + c.n);
    const sa = new Set(a), sb = new Set(b);
    a.forEach((v) => { if (sb.has(v)) o.shared++; else o.enOnly.push(c.n + "." + v); });
    b.forEach((v) => { if (!sa.has(v)) o.laOnly.push(c.n + "." + v); });
    if (a.length && b.length && !a.filter((v) => !sb.has(v)).length && !b.filter((v) => !sa.has(v)).length) o.exact++;
  });
  // two words run together by a stripped tag — the shape the space rule exists to prevent
  [[en, "en"], [la, "la"]].forEach(([bk, tag]) => {
    bk.chapters.forEach((c) => {
      const txt = c.html.replace(/<[^>]*>/g, " ");
      for (const m of txt.matchAll(/[a-z”’][,;:.!?][“‘A-Za-z]/g)) {
        o.welds.push(tag + " " + c.n + ": " + txt.slice(Math.max(0, m.index - 24), m.index + 18).trim());
      }
    });
  });
  // a <choice> printing BOTH of its readings, which is what the resolver exists to stop
  const hay = JSON.stringify(en) + JSON.stringify(la);
  ["Pasiphae Pasiph", "PasiphaePasiph", "Deiphobus Deïph", "Aloidae Aloïd", "gesture gestare", "gesturegestare"]
    .forEach((s) => { if (hay.includes(s)) o.doubled.push(s); });
  return o;
}

(async () => {
  // every request the page makes, so "is the book lazy?" is answered by observation
  const asked = [];
  const server = http.createServer((req, res) => {
    const url = req.url.split("?")[0];
    asked.push(url);
    const file = path.join(ROOT, url === "/" ? "index.html" : decodeURIComponent(url));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end("no"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";

  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM || undefined });
  const errs = [];
  /* …and suppresses the first-visit coach marks (Aug 2026) — BOTH of them, the shelf's and the one shown
     the first time a book is opened. They are full-screen overlays on document.body, so on a fresh profile
     every click below lands on the scrim instead of the shelf and the whole file times out; the book half
     is worse, since it is over the PAGE the gesture sections swipe (that is how it announced itself when
     the card was split — one real-touch swipe, silently eaten). Set BEFORE the first navigation, hence the
     await at every call site. The cards themselves are `.claude/test-tour.js`'s section 5 — this file is
     about the shelf and the book under them. */
  const watch = async (p) => {
    p.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
    p.on("pageerror", (e) => errs.push(String(e)));
    await p.addInitScript(() => {
      try {
        localStorage.setItem("folio_library_tour_v1", "1");
        localStorage.setItem("folio_book_tour_v1", "1");
        localStorage.setItem("folio_tour_v1", "1");
      } catch (e) {}
    });
  };

  /* ================= 1. the rename ================= */
  console.log("\n1. Collections — the page that used to be called Library");
  {
    const page = await browser.newPage({ viewport: DESK });
    await watch(page);
    await page.goto(base + "#decks", { waitUntil: "load" });
    await page.waitForTimeout(900);
    const d = await page.evaluate(() => ({
      h1: (document.querySelector(".page-head h1") || {}).textContent || "",
      eyebrow: (document.querySelector(".page-head .eyebrow") || {}).textContent || "",
      title: document.title,
      // the top bar must not offer two tabs both reading "Library"
      tabs: [...document.querySelectorAll(".topbar .tab")].map((t) => ({ r: t.dataset.route, l: t.querySelector(".tab-label").textContent.trim() })),
      rows: document.querySelectorAll(".collection-row, .collection").length,
    }));
    check("the old #decks address still resolves", d.rows > 0 || /Collection/i.test(d.h1), JSON.stringify({ rows: d.rows, h1: d.h1 }));
    check("...titled Collections", /^Collections$/i.test(d.h1.trim()), d.h1);
    check("...and its eyebrow no longer says Library", !/library/i.test(d.eyebrow), d.eyebrow);
    check("...with a Collections <title>", /Collections/i.test(d.title), d.title);
    const libTabs = d.tabs.filter((t) => /^library$/i.test(t.l));
    check("exactly one tab is called Library, and it is the books one",
      libTabs.length === 1 && libTabs[0].r === "library", JSON.stringify(d.tabs));
    /* …and the DESKTOP's Collections tab sits between Home and Library (Sep 2026, on request). This
       assertion used to read the other way round — that no tab claimed the collections at all — which
       was true for the fortnight between Collections leaving both bars and coming back to the top one.
       What the rename actually needs is the pair the next two lines make: a tab pointing at `#decks`
       that is NOT called Library, and exactly one called Library which is the books page, that being
       what "two pages called Library" was ever about. The phone's bar is asserted separately in
       test-layout.js, where the five-cell bar and the page swipe are checked against each other. */
    const decksTab = d.tabs.find((t) => t.r === "decks");
    check("...the top bar's Collections tab points at #decks and sits between Home and Library",
      !!decksTab && /^Collections$/i.test(decksTab.l) &&
      d.tabs.findIndex((t) => t.r === "home") < d.tabs.indexOf(decksTab) &&
      d.tabs.indexOf(decksTab) < d.tabs.findIndex((t) => t.r === "library"), JSON.stringify(d.tabs));
    await page.close();
  }

  /* ================= 2. the shelf, and the book staying lazy ================= */
  console.log("\n2. The shelf — and the text that must not load with it");
  let bookHref = "";
  {
    asked.length = 0;
    const page = await browser.newPage({ viewport: DESK });
    await watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(1200);
    check("no book text is fetched on boot", !asked.some((u) => u.startsWith("/books/")), asked.filter((u) => u.startsWith("/books/")).join(","));

    await page.evaluate(() => { location.hash = "library"; });
    await page.waitForTimeout(700);
    const d = await page.evaluate(() => ({
      tiles: [...document.querySelectorAll(".book-tile")].map((t) => ({
        id: t.dataset.book,
        title: (t.querySelector(".bk-tile-title") || {}).textContent || "",
        author: (t.querySelector(".bk-tile-author") || {}).textContent || "",
        meta: (t.querySelector(".bk-tile-meta") || {}).textContent || "",
        when: (t.querySelector(".bk-tile-when") || {}).textContent || "",
        blurb: !!t.querySelector(".bk-tile-blurb"),
        spine: !!t.querySelector(".bk-spine"),
        h: Math.round(t.getBoundingClientRect().height),
      })),
      cols: getComputedStyle(document.querySelector(".book-grid")).gridTemplateColumns.split(" ").length,
      sortOpts: [...document.querySelectorAll("#bkSort option")].map((o) => o.value),
      sortLabels: [...document.querySelectorAll("#bkSort option")].map((o) => o.textContent),
      sortDir: (document.querySelector("#bkSortDir") || {}).textContent || "",
      note: (document.querySelector(".lib-note") || {}).textContent || "",
      blurb: (document.querySelector(".page-head p") || {}).textContent || "",
    }));
    check("the shelf shows a tile per book", d.tiles.length >= 1, JSON.stringify(d.tiles.map((t) => t.id)));
    /* WHAT A BANNER HAS TO SAY, asserted over EVERY book rather than over whichever one the shelf
       puts first. These two used to read tiles[0] and so quietly meant "Seneca", which held only
       while he led the shelf and broke when Aesop's Fables was added (Aug 2026) — reporting a
       missing Stoic on a page where nothing was wrong. Checking every banner is both order-proof
       and a stronger claim: a book added later with no author or no length now fails here, which
       is exactly the mistake this pair exists to catch. The named anchor is kept beside it, since
       a generic shape check would pass on a shelf of blanks. */
    const seneca = d.tiles.find((t) => t.id === "seneca-letters");
    const nameless = d.tiles.filter((t) => !/\S/.test(t.title) || !/\S/.test(t.author));
    check("...naming the work and its author",
      !nameless.length && seneca && /Letters from a Stoic/i.test(seneca.title) && /Seneca/i.test(seneca.author),
      JSON.stringify(nameless.length ? nameless : seneca));
    // "124 letters", "313 fables", "8 books" — a figure and the unit that book counts in
    const lengthless = d.tiles.filter((t) => !/\d+\s+\S+/.test(t.meta));
    check("...saying how long it is",
      !lengthless.length && /\d+\s+letters/i.test(seneca.meta),
      JSON.stringify(lengthless.length ? lengthless.map((t) => t.id + ":" + t.meta) : seneca.meta));
    check("...each with its coloured spine", d.tiles.every((t) => t.spine));
    /* The tile is SMALL (Aug 2026, on request), and the two halves of that are asserted separately
       because they fail in opposite ways: the blurb creeping back would make it tall again, and the
       date going missing would leave a history shelf saying nothing about when anything was written.
       The height ceiling is what a "smaller tile" actually means — it was ~200px with the blurb. */
    check("...with the year it was written, where the blurb used to be",
      /\d/.test(d.tiles[0].when) && !d.tiles.some((t) => t.blurb), JSON.stringify({ when: d.tiles[0].when, blurb: d.tiles.some((t) => t.blurb) }));
    check("...and short with it", d.tiles.every((t) => t.h <= 120), JSON.stringify(d.tiles.map((t) => t.h)));
    check("the shelf is one full-width banner per row", d.cols === 1, String(d.cols));
    check("...and can be sorted, by title, author and date as well as by reading",
      ["title", "author", "written"].every((v) => d.sortOpts.includes(v)), d.sortOpts.join(","));
    /* EVERY ORDER REVERSES, and the choice is REMEMBERED (Aug 2026, on request). Three things are asserted
       and each fails silently on its own: the select must not carry a direction in its option labels (it
       used to say "Title (A – Z)", which a reverse button turns into a control contradicting itself); the
       button must name the direction in THIS field's words rather than as a bare arrow; and the pair must
       survive a full reload, which is the whole of "the page should remember". */
    check("...the select names the FIELD, leaving the direction to the button beside it",
      d.sortLabels.every((l) => !/A – Z|Z – A|Oldest|Newest|recent first/i.test(l)) && !!d.sortDir,
      JSON.stringify({ labels: d.sortLabels, dir: d.sortDir }));
    const rev = await page.evaluate(async () => {
      const sel = document.querySelector("#bkSort");
      sel.value = "title"; sel.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 500));
      const az = [...document.querySelectorAll(".bk-tile-title")].map((t) => t.textContent);
      const azLbl = document.querySelector("#bkSortDir").textContent.trim();
      document.querySelector("#bkSortDir").click();
      await new Promise((r) => setTimeout(r, 500));
      return { az, azLbl, za: [...document.querySelectorAll(".bk-tile-title")].map((t) => t.textContent),
               zaLbl: document.querySelector("#bkSortDir").textContent.trim() };
    });
    check("...ordered A – Z, and reversed to Z – A",
      rev.za.join("|") === rev.az.slice().reverse().join("|") && /A – Z/.test(rev.azLbl) && /Z – A/.test(rev.zaLbl),
      JSON.stringify(rev));
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1200);
    const kept = await page.evaluate(() => ({
      sel: document.querySelector("#bkSort").value,
      lbl: document.querySelector("#bkSortDir").textContent.trim(),
      list: [...document.querySelectorAll(".bk-tile-title")].map((t) => t.textContent),
    }));
    check("...and the shelf opens the way it was left, after a reload",
      kept.sel === "title" && /Z – A/.test(kept.lbl) && kept.list.join("|") === rev.za.join("|"), JSON.stringify(kept));

    /* FAVOURITES (Aug 2026, on request): starred from the banner's own long-press sheet — the same gesture
       and the same shell as an added deck's row on the home page — and pinned to a section at the top. The
       assertions that matter are the ones about the SHELF rather than the sheet: a starred book must not be
       listed twice (a reader scrolling past their own favourite again has to work out which is the real
       one), and the headings must not appear at all until something is starred. */
    const sheet = await page.evaluate(async () => {
      const el = document.querySelector(".book-tile"), r = el.getBoundingClientRect();
      const x = r.left + 40, y = r.top + 20;
      const send = (t) => el.dispatchEvent(new PointerEvent(t, { pointerId: 3, pointerType: "touch", clientX: x, clientY: y, bubbles: true, cancelable: true }));
      send("pointerdown");
      await new Promise((z) => setTimeout(z, 700));
      send("pointerup");
      await new Promise((z) => setTimeout(z, 300));
      return { open: !!document.querySelector(".deck-menu"), hash: location.hash,
        acts: [...document.querySelectorAll(".deck-menu .dm-item")].map((i) => i.dataset.act) };
    });
    check("holding a banner opens its options rather than the book",
      sheet.open && sheet.hash === "#library", JSON.stringify(sheet));
    check("...offering the two things asked for: favourite and share",
      sheet.acts.join(",") === "fav,share", sheet.acts.join(","));
    const starred = await page.evaluate(async () => {
      document.querySelector('.deck-menu [data-act="fav"]').click();
      await new Promise((z) => setTimeout(z, 600));
      const titles = [...document.querySelectorAll(".bk-tile-title")].map((t) => t.textContent);
      return {
        heads: [...document.querySelectorAll(".lib-sec-head")].map((h) => h.textContent),
        first: [...document.querySelectorAll(".lib-sec")][0].querySelectorAll(".book-tile").length,
        dup: titles.length !== new Set(titles).size,
        stars: document.querySelectorAll(".bk-star").length,
        stored: Object.keys(JSON.parse(localStorage.getItem("folio_v1")).bookFavs || {}).length,
      };
    });
    check("starring puts the book in a Favourites section at the top",
      starred.heads[0] === "Favourites" && starred.first === 1, JSON.stringify(starred.heads));
    check("...with the rest below it, and no book listed twice", !starred.dup && /Everything else/i.test(starred.heads[1] || ""), JSON.stringify(starred));
    check("...the banner wearing a star, and the choice stored as progress", starred.stars === 1 && starred.stored === 1, JSON.stringify(starred));
    // …and Share hands out a link that opens the book here. navigator.share is absent in headless Chromium,
    // so this exercises the clipboard fallback — which is the desktop path either way.
    const shared = await page.evaluate(async () => {
      window.__copied = null;
      navigator.clipboard.writeText = (t) => { window.__copied = t; return Promise.resolve(); };
      const el = document.querySelector(".book-tile"), r = el.getBoundingClientRect();
      const send = (t) => el.dispatchEvent(new PointerEvent(t, { pointerId: 4, pointerType: "touch", clientX: r.left + 40, clientY: r.top + 20, bubbles: true, cancelable: true }));
      send("pointerdown");
      await new Promise((z) => setTimeout(z, 700));
      send("pointerup");
      await new Promise((z) => setTimeout(z, 300));
      document.querySelector('.deck-menu [data-act="share"]').click();
      await new Promise((z) => setTimeout(z, 400));
      return window.__copied;
    });
    check("Share hands out a #book/<id> link", /#book\/[a-z0-9-]+$/.test(shared || ""), String(shared));

    // put the shelf back the way the rest of this file expects to find it
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("folio_v1")); s.bookFavs = {};
      s.settings.bookSort = "recent"; s.settings.bookSortRev = false;
      localStorage.setItem("folio_v1", JSON.stringify(s));
    });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1000);
    /* The shelf's own licence paragraph is GONE (Aug 2026, on request) and its replacement is the
       short line under the heading. Both halves are asserted, because they fail in opposite ways: the
       paragraph creeping back would undo the request, and the line going missing would leave a page of
       public-domain books saying nothing about being free to read. The RULE that paragraph described
       has not gone anywhere — it is asserted below, in the front matter, beside the edition it is
       actually about. */
    check("the shelf says what it holds, in one line", /public domain/i.test(d.blurb) && /free to read/i.test(d.blurb), d.blurb.slice(0, 90));
    check("...and no longer carries the licence paragraph", !d.note, d.note.slice(0, 90));
    check("...and STILL no book text has been fetched", !asked.some((u) => u.startsWith("/books/")), asked.filter((u) => u.startsWith("/books/")).join(","));
    /* SECTIONS 3–6 READ SENECA SPECIFICALLY, so they name him rather than taking whatever the shelf
       happens to put first. This used to be `d.tiles[0].id`, which worked only for as long as Seneca
       led the shelf under the "recent" sort with nothing yet read — and stopped the day Aesop's
       Fables was added (Aug 2026). The failure is a confusing one rather than a useful one: every
       Seneca assertion below fails at once, reporting Gummere missing, no Latin control and four
       proper nouns nobody recognises, none of which is a fault in the book being opened. Two of
       those checks can ONLY pass on Seneca — the four common nouns that mean something else in him,
       and the original-language control, which Aesop deliberately has not got — so the target is
       pinned here in the same way lines further down already pin `#book/seneca-letters`. That the
       first tile opens at all is asserted separately, in the shelf and search sections above. */
    bookHref = "seneca-letters";
    check("...and the shelf still holds the book sections 3–6 are about",
      d.tiles.some((t) => t.id === bookHref), d.tiles.map((t) => t.id).join(","));
    /* THE SEARCH BOX (Aug 2026, on request). Three of these fail silently. A filter that quietly loses the
       favourites split, or one whose repainted banners have no listener on them, both leave a shelf that
       LOOKS right — the second only bites when a reader tries to open the book they just searched for, and
       it is a real risk here because the hold sheet is a per-element gesture rather than a delegated one.
       And re-sorting is the case the glossary record's own filter documents: two independent handlers, each
       rebuilding the list from scratch, throw away whatever the reader had typed. */
    const search = await page.evaluate(async () => {
      const box = document.querySelector("#bkFilter");
      const type = async (v) => {
        box.value = v;
        box.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise((z) => setTimeout(z, 120));
      };
      const titles = () => [...document.querySelectorAll(".bk-tile-title")].map((t) => t.textContent);
      const count = () => (document.querySelector("#bkCount") || {}).textContent || "";
      const out = { box: !!box, all: titles().length, count0: count() };
      await type("seneca");
      out.count1 = count();
      out.byAuthor = [...document.querySelectorAll(".bk-tile-author")].map((t) => t.textContent);
      await type("sun tzu");                    // the shelf spells him Tzŭ — the fold is the point
      out.folded = titles();
      await type("republic plato");             // two words, the wrong way round
      out.anyOrder = titles();
      await type("zzzz");
      out.none = { line: !!document.querySelector(".lib-none"), tiles: document.querySelectorAll(".book-tile").length };
      out.countNone = count();
      await type("");
      out.cleared = titles().length;
      out.count2 = count();
      return out;
    });
    check("the shelf has a search box", search.box);
    check("searching by author narrows the shelf",
      search.byAuthor.length === 1 && /Seneca/i.test(search.byAuthor[0]), JSON.stringify(search.byAuthor));
    check("...diacritics fold, so “Sun Tzu” finds “Sun Tzŭ”",
      search.folded.length === 1 && /Art of War/i.test(search.folded[0]), JSON.stringify(search.folded));
    check("...the words may come in any order",
      search.anyOrder.length === 1 && /Republic/i.test(search.anyOrder[0]), JSON.stringify(search.anyOrder));
    check("...nothing matching says so rather than drawing an empty shelf",
      search.none.line && search.none.tiles === 0, JSON.stringify(search.none));
    check("...and clearing it puts every book back", search.cleared === search.all, search.cleared + " of " + search.all);
    /* HOW MANY BOOKS ARE ON THE SHELF (Aug 2026, on request). It is a claim about the list, so it is read
       against the list rather than against a number written into this test — a count that has gone stale
       reads exactly like a count that is right. Filtered, it says BOTH numbers, because "1 book" over a
       narrowed shelf reads as a library of one; unfiltered it says the one, "41 of 41" being a sum nobody
       asked for; and it comes back when the box is cleared. */
    check("the shelf says how many books it holds",
      new RegExp("^" + search.all + " books?$").test(search.count0.trim()), search.count0 + " vs " + search.all + " tiles");
    check("...and how many the filter is showing, of how many",
      new RegExp("^1 of " + search.all + " books$").test(search.count1.trim()), search.count1);
    check("...saying nothing matched rather than a bare zero",
      /^0 of \d+ books$/.test(search.countNone.trim()), search.countNone);
    check("...and it goes back when the search is cleared", search.count2 === search.count0, search.count2);
    // a banner the SEARCH painted must still be a book you can open — the hold sheet is wired per element
    const afterFilter = await page.evaluate(async () => {
      const box = document.querySelector("#bkFilter");
      box.value = "meditations";
      box.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((z) => setTimeout(z, 150));
      document.querySelector(".book-tile").click();
      await new Promise((z) => setTimeout(z, 700));
      return location.hash;
    });
    check("...and a banner it painted still opens its book", /^#book\//.test(afterFilter), afterFilter);
    await page.evaluate(() => { location.hash = "#library"; });
    await page.waitForTimeout(700);
    const kept2 = await page.evaluate(async () => {
      const before = document.querySelector("#bkFilter").value;
      const sel = document.querySelector("#bkSort");
      sel.value = "title";
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((z) => setTimeout(z, 500));
      return { before: before, after: document.querySelector("#bkFilter").value,
        tiles: document.querySelectorAll(".book-tile").length };
    });
    check("the query survives leaving the page and coming back", kept2.before === "meditations", JSON.stringify(kept2));
    check("...and re-sorting keeps both the query and the narrowed shelf",
      kept2.after === "meditations" && kept2.tiles === 1, JSON.stringify(kept2));


    /* A banner spans the FULL width on a phone too (Aug 2026, on request — it was briefly two narrow
       tiles side by side, which was asked for and then asked back). The count is read off the GRID as
       well as off the banner, so this still holds the day a second book lands. */
    await page.setViewportSize(PHONE);
    await page.waitForTimeout(400);
    const ph = await page.evaluate(() => {
      const g = document.querySelector(".book-grid"), t = document.querySelector(".book-tile");
      return { cols: getComputedStyle(g).gridTemplateColumns.split(" ").length,
        w: Math.round(t.getBoundingClientRect().width), page: Math.round(g.getBoundingClientRect().width),
        h: Math.round(t.getBoundingClientRect().height) };
    });
    check("[phone] the shelf is still one banner per row", ph.cols === 1, JSON.stringify(ph));
    check("[phone] ...spanning the full width", ph.w >= ph.page - 1, JSON.stringify(ph));
    check("[phone] ...and still short, without the blurb", ph.h <= 120, JSON.stringify(ph));
    await page.close();
  }

  /* ================= 3. one book ================= */
  console.log("\n3. One book — chapters on tabs, gloss links, the translator's notes");
  {
    asked.length = 0;
    const page = await browser.newPage({ viewport: DESK });
    await watch(page);
    await page.goto(base + "#book/" + bookHref, { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const d = await page.evaluate(() => ({
      h1: (document.querySelector(".page-head h1") || {}).textContent || "",
      tabs: document.querySelectorAll(".bk-tab").length,
      on: [...document.querySelectorAll(".bk-tab.on")].map((t) => t.dataset.ch),
      chTitle: (document.querySelector(".bk-ch-t") || {}).textContent || "",
      paras: document.querySelectorAll(".bk-prose p").length,
      words: ((document.querySelector(".bk-prose") || {}).textContent || "").trim().split(/\s+/).length,
      // the bar and its contents panel are one sticky block, so it is the WRAPPER that pins
      barSticky: getComputedStyle(document.querySelector(".bk-barwrap")).position,
      barInWrap: !!document.querySelector(".bk-barwrap > .bk-bar") && !!document.querySelector(".bk-barwrap > #bkTocPanel"),
      // the lit tab in the top bar — a book belongs under the Library
      lit: [...document.querySelectorAll(".topbar .tab.active")].map((t) => t.dataset.route).join(","),
      rights: (document.querySelector(".bk-rights") || {}).textContent || "",
      // the front matter is chapter 0, and nothing else may be
      zeros: [...document.querySelectorAll(".bk-tab")].filter((t) => t.dataset.ch === "0").length,
      footRights: !!document.querySelector(".bk-page ~ .bk-rights, .bk-foot ~ .bk-rights"),
    }));
    check("the book's text was fetched, and only now", asked.some((u) => u.startsWith("/books/")), asked.filter((u) => u.startsWith("/books/")).join(","));
    check("the book opens on its own page", /Letters from a Stoic/i.test(d.h1), d.h1);
    check("...with a tab per chapter", d.tabs >= 60, String(d.tabs));
    check("...exactly one of them selected", d.on.length === 1, d.on.join(","));
    check("...showing that chapter's title", d.chTitle.trim().length > 3, d.chTitle);
    check("...and its prose, in paragraphs", d.paras >= 3 && d.words > 300, JSON.stringify({ paras: d.paras, words: d.words }));
    check("the chapter bar sticks to the top as the reader scrolls", d.barSticky === "sticky", d.barSticky);
    check("...carrying its contents panel with it", d.barInWrap, String(d.barInWrap));
    check("a book lights the Library tab", d.lit === "library", d.lit);

    /* THE FRONT MATTER (Aug 2026, on request): a real chapter 0 rather than a panel, and the "About
       this text" box that used to sit under EVERY chapter is gone with it. Both halves are checked —
       a front matter that fails to appear and a rights box that comes back at the foot of all 65
       letters are opposite failures and neither raises anything. */
    check("the book opens on its own front matter", d.on[0] === "0" && /about this book/i.test(d.chTitle),
      JSON.stringify({ on: d.on, title: d.chTitle }));
    check("...which is one chapter, numbered 0, not a second copy", d.zeros === 1, String(d.zeros));
    check("...carrying the translator and the grounds it is free on",
      /Gummere/i.test(d.rights) && /public domain/i.test(d.rights), d.rights.slice(0, 120));
    check("...and NOT repeated below every chapter, as it used to be", !d.footRights, String(d.footRights));

    // the section numbers by which this text is cited belong to the letters, not to the front matter
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "1"); t.click(); });
    await page.waitForTimeout(500);
    const l1 = await page.evaluate(() => ({
      sections: document.querySelectorAll(".bk-prose .bk-n").length,
      rights: document.querySelectorAll(".bk-rights").length,
    }));
    check("the cited section numbers are kept", l1.sections >= 3, String(l1.sections));
    check("...and a letter carries no rights box of its own", l1.rights === 0, String(l1.rights));

    // the apparatus: gloss links in the prose, and the translator's notes numbered by the site's own pass
    const ap = await page.evaluate(() => {
      // find a chapter that actually carries notes
      const tabs = [...document.querySelectorAll(".bk-tab")];
      return { tabs: tabs.length };
    });
    void ap;
    // step to a chapter with notes (letter 3 carries three)
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "3"); t.click(); });
    await page.waitForTimeout(600);
    const n = await page.evaluate(() => {
      const markers = [...document.querySelectorAll(".bk-prose sup.fn")];
      const items = document.querySelectorAll(".bk-notes .src-item").length;
      return {
        markers: markers.length,
        numbered: markers.map((m) => m.textContent.trim()),
        items,
        label: (document.querySelector(".bk-notes .src-label") || {}).textContent || "",
        shut: !!document.querySelector(".bk-notes .src-collapse.collapsed"),
        expanded: (document.querySelector(".bk-notes .src-head") || {}).getAttribute
          ? document.querySelector(".bk-notes .src-head").getAttribute("aria-expanded") : "",
        gloss: document.querySelectorAll(".bk-prose .ttip").length,
      };
    });
    check("the translator's notes render as a numbered fold", n.items >= 3, String(n.items));
    check("...labelled Notes, not Sources", /notes/i.test(n.label), n.label);
    // OPEN by default (Aug 2026, on request — it started shut). An apparatus a reader has to go looking
    // for is one they will not look at, and this is the translator's commentary rather than a works list.
    check("...open by default, not collapsed", !n.shut && n.expanded === "true",
      JSON.stringify({ shut: n.shut, ariaExpanded: n.expanded }));
    check("...with a marker in the prose for each", n.markers >= 3, String(n.markers));
    check("...numbered in reading order by the site's own footnote pass",
      n.numbered.length >= 3 && n.numbered.slice(0, 3).join(",") === "1,2,3", n.numbered.join(","));
    check("...and no marker points past the end of the list",
      n.numbered.every((x) => +x <= n.items), JSON.stringify({ markers: n.numbered, items: n.items }));

    /* NO STYLESHEET IN THE PROSE, and this is checked over the WHOLE book rather than one chapter.
       Wikisource ships each note's font templates as an inline <style> element — the Greek face for a
       quotation, the small caps for A.D./B.C. — and the importer used to drop the tags and leave the
       CSS TEXT behind, so 24 of Seneca's 335 notes read "…on the Palatine, .mw-parser-output
       .wst-asc{font-variant:all-small-caps}…A.D. 41." (reported Aug 2026, with a screenshot).

       It fails SILENTLY in every way that matters: the note is a non-empty string of the right shape,
       the count is right, the markers all resolve, and nothing anywhere throws. Only a reader opening
       the fold ever sees it — which is why this reads the shipped DATA rather than one rendered page,
       and why it also sweeps the prose, where the same leak would land if the wrapper markup moves
       again. */
    /* TAPPING A MARKER LANDS ON THE NOTE, CLEAR OF THE TAB BAR (Aug 2026, on a bug report: on a phone
       the jump "doesn't quite go far enough to see the actual note").

       Two things conspired and the assertion has to be able to catch both. scrollIntoView({block:
       "nearest"}) brings the item's bottom flush with the VIEWPORT's — and a phone has a 58px tab bar
       fixed over the foot of it, so the note arrived underneath the bar. And when the fold was shut the
       scroll was computed against a list still zero pixels tall, stopping short by its whole height.

       So the check is not "is it in the viewport" — which the old behaviour passed — but "is it above
       the tab bar", measured against the bar's own rendered box rather than a hard-coded 58. */
    {
      const phone = await browser.newPage({ viewport: PHONE });
      await watch(phone);
      await phone.goto(base + "#book/seneca-letters", { waitUntil: "networkidle" });
      await phone.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "3"); t.click(); });
      await phone.waitForTimeout(600);
      const jump = await phone.evaluate(async () => {
        const m = document.querySelector(".bk-prose sup.fn");
        m.scrollIntoView({ block: "center" });                    // start from the marker, as a reader is
        await new Promise((r) => setTimeout(r, 400));
        m.click();
        await new Promise((r) => setTimeout(r, 900));             // let the smooth scroll settle
        const n = +m.getAttribute("data-fn");
        const item = document.querySelectorAll(".bk-notes .src-item")[n - 1];
        const r = item.getBoundingClientRect();
        const bar = document.querySelector(".tabbar");
        const barTop = bar && bar.offsetHeight ? bar.getBoundingClientRect().top : window.innerHeight;
        return { top: r.top, bottom: r.bottom, barTop, h: window.innerHeight, n };
      });
      check("[phone] tapping a marker brings its note fully into view",
        jump.top >= 0 && jump.bottom <= jump.h, JSON.stringify(jump));
      check("[phone] ...clear of the tab bar, not tucked behind it",
        jump.bottom <= jump.barTop, JSON.stringify(jump));
      // …and from a fold the reader had shut, where the scroll used to be computed against a flat list
      const shutJump = await phone.evaluate(async () => {
        document.querySelector(".bk-notes .src-head").click();    // shut it
        await new Promise((r) => setTimeout(r, 600));
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 300));
        const m = document.querySelector(".bk-prose sup.fn");
        m.click();
        await new Promise((r) => setTimeout(r, 900));
        const n = +m.getAttribute("data-fn");
        const r = document.querySelectorAll(".bk-notes .src-item")[n - 1].getBoundingClientRect();
        const bar = document.querySelector(".tabbar");
        const barTop = bar && bar.offsetHeight ? bar.getBoundingClientRect().top : window.innerHeight;
        return { top: r.top, bottom: r.bottom, barTop, h: window.innerHeight };
      });
      check("[phone] ...and so does a marker that had to open the fold first",
        shutJump.top >= 0 && shutJump.bottom <= shutJump.barTop, JSON.stringify(shutJump));
      await phone.close();
    }

    const leak = shippedBookLeaks();
    check("no note carries Wikisource's own stylesheet as text",
      leak.n > 0 && !leak.notes.length, JSON.stringify({ chapters: leak.n, bad: leak.notes.slice(0, 6) }));
    check("...nor does any chapter's prose", leak.n > 0 && !leak.html.length, JSON.stringify(leak.html.slice(0, 6)));

    /* THE CAPUT READER HAS NO SIBLING TO DIFF AGAINST (Aug 2026, adding The City of God). Every other
       book on this shelf shares its extractor with at least one more, so a change to one is proved
       inert by re-running the other and comparing bytes; this reader serves one book. What stands in
       for that is a sweep of the SHIPPED data — the same argument the Gita's stream cut rests on.

       The assertion that earns its place is the last one: an unconverted CAPUT in the Latin is a
       chapter mark wearing a costume the four the pass knows about do not cover, and it is silent
       everywhere else — the prose is all present, the book is the right length, and that chapter's
       Latin simply folds into the one above it. Exactly one is expected, Book I's bracketed
       resumption, which Migne prints and which is deliberately left as printed. */
    const cog = shippedPair("city-of-god");
    if (cog) {
      check("[city of god] the two columns carry the same number of chapters",
        cog.en.length === 22 && cog.la.length === 22, `en ${cog.en.length} la ${cog.la.length}`);
      check("...and 661 chapter numbers on each side",
        cog.secEn === 661 && cog.secLa === 661, `en ${cog.secEn} la ${cog.secLa}`);
      check("...numbered a clean 1..N in every book, both sides",
        !cog.notSeq.length, JSON.stringify(cog.notSeq.slice(0, 6)));
      check("...pairing exactly, every book, in both directions",
        cog.pairs === 22, `${cog.pairs}/22 — ${JSON.stringify(cog.gaps.slice(0, 4))}`);
      check("[city of god] every footnote marker resolves and every note is pointed at",
        !cog.noteFaults.length, JSON.stringify(cog.noteFaults.slice(0, 6)));
      check("[city of god] no unconverted CAPUT beyond Book I's bracketed resumption",
        cog.caput === 1, `${cog.caput} left`);
    } else {
      check("[city of god] both halves of the book are on disk", false, "missing books/city-of-god*.js");
    }

    /* THE CONFESSIONS — the CAPUT reader's second book, so the sibling diff above is now the cheap
       first check and this is what stands beside it. Two of these earn their place.

       The chapter TOTALS are the one thing that could see a sixth costume: 278 in the Latin against
       276 in the English, and a mark the pass fails to recognise folds its chapter into the one above
       it with the prose all present, the book the right length and nothing thrown — which is exactly
       how the FIFTH was found, and it was found by the pairing warning rather than by any count of
       the Latin on its own. And the two English-only gaps are asserted BY NAME. Book I's chapters 19
       and 20 have never been transcribed at the source, so those two rows draw the Latin beside an
       empty cell; naming them is what tells a documented gap from a chapter the extractor has just
       started losing, which is the difference between the shelf's honest rendering and a silent
       truncation. */
    const conf = shippedPair("confessions");
    if (conf) {
      check("[confessions] thirteen books on each side",
        conf.en.length === 13 && conf.la.length === 13, `en ${conf.en.length} la ${conf.la.length}`);
      check("...276 chapter numbers in the English and 278 in the Latin",
        conf.secEn === 276 && conf.secLa === 278, `en ${conf.secEn} la ${conf.secLa}`);
      check("...numbered a clean 1..N in every book, both sides",
        !conf.notSeq.length, JSON.stringify(conf.notSeq.slice(0, 6)));
      check("...twelve of the thirteen pairing on every chapter number",
        conf.pairs === 12, `${conf.pairs}/13 — ${JSON.stringify(conf.gaps.slice(0, 4))}`);
      check("...the exception being Book I's two untranslated chapters, and only those",
        conf.gaps.length === 1 && /^1: en-only  la-only 19,20$/.test(conf.gaps[0]),
        JSON.stringify(conf.gaps));
      check("[confessions] every footnote marker resolves and every note is pointed at",
        !conf.noteFaults.length, JSON.stringify(conf.noteFaults.slice(0, 6)));
      check("[confessions] no unconverted CAPUT anywhere in the Latin",
        conf.caput === 0, `${conf.caput} left`);
    } else {
      check("[confessions] both halves of the book are on disk", false, "missing books/confessions*.js");
    }

    /* THE SUMMA — one column, no sibling on its reader, and by a wide margin the largest thing on the
       shelf, so the shipped data is the only check there is. Three of these earn their place.

       THE ARTICLE COUNT IS THE ONE NUMBER THAT CAN SEE A HEADING SHAPE THE PASS DOES NOT KNOW. The
       question heading is typed a dozen ways across the 614 pages — "Quesiton.", "question.",
       "Question. - 112 -", the bare title, and on three pages "Art. 1" — and a shape markArticuli
       fails to place is silent: the prose is all there, the chapter is the right length, nothing
       throws, and one section simply is not numbered. It was found by this count moving.

       NO CHAPTER MAY CARRY A LEFTOVER "Art." HEADING BEYOND THE ONE THE EDITION MISNUMBERS, which is
       the City of God's unconverted-CAPUT rule: an article heading left as bold is one the pass could
       not read, and it looks exactly like a heading that was meant to be bold.

       AND THE GAPS ARE ASSERTED BY NAME. Fourteen questions are short an article in the transcription
       and two carry no article headings at all; naming them is what tells a documented gap from a
       chapter the extractor has just started losing — the difference between the shelf's honest
       rendering and a silent truncation. */
    const summa = shippedBook("summa-theologica");
    if (summa) {
      check("[summa] all 614 questions", summa.chapters === 614, String(summa.chapters));
      check("...divided into the edition's six Parts, each the right length",
        JSON.stringify(summa.parts) === JSON.stringify([119, 114, 189, 90, 99, 3]),
        JSON.stringify(summa.parts));
      check("...3,094 articles across them", summa.secs === 3094, String(summa.secs));
      check("...every chapter's articles ascending, with no duplicate",
        !summa.disorder.length, JSON.stringify(summa.disorder.slice(0, 6)));
      check("[summa] the two questions with no article headings are the known two",
        summa.none.join(",") === "147,551", summa.none.join(","));
      check("[summa] no article heading left unread anywhere, bar the one the edition misnumbers",
        summa.strayArt === 1, String(summa.strayArt));
      check("[summa] the seven notes the translators added, and their markers resolve",
        summa.notes === 7 && !summa.noteFaults.length,
        summa.notes + " — " + JSON.stringify(summa.noteFaults.slice(0, 4)));
      /* It has no facing original and its front matter is where that is explained, so the page has to
         say so — a reader who knows the Summa will go looking for the Latin. */
      check("[summa] the front matter says why there is no Latin",
        /207 of the 611/.test(summa.intro), summa.intro.slice(0, 60));
      check("[summa] ...and what the transcription is missing",
        /Fourteen questions/.test(summa.intro), "");
    } else {
      check("[summa] the book is on disk", false, "missing books/summa-theologica.js");
    }

    /* THE RIGVEDA — the same kind of check as the Summa's and the Aeneid's, and for the same reason:
       one book on its own reader, so the shipped data is what stands in for a sibling diff. */
    const rv = rigvedaChecks();
    if (rv) {
      check("[rigveda] all 1,028 hymns on both sides",
        rv.chapters === 1028 && rv.saChapters === 1028, `en ${rv.chapters} sa ${rv.saChapters}`);
      check("...divided into the ten mandalas, each the right length",
        JSON.stringify(rv.mandalas) === JSON.stringify([191, 43, 62, 58, 87, 75, 104, 103, 114, 191]),
        JSON.stringify(rv.mandalas));
      /* THE VERSE TOTALS ARE THE ASSERTION THAT SEES A TRANSCRIPTION SHAPE GOING. Four shapes are in
         use and 1,023 of the hymns are plain text; a reader that stops recognising one returns those
         hymns as a single unnumbered block, which throws nothing, shortens nothing and looks like a
         hymn. Only the count moves. */
      check("[rigveda] 10,503 verses of Griffith and 10,542 of the Sanskrit",
        rv.enV === 10503 && rv.saV === 10542, `en ${rv.enV} sa ${rv.saV}`);
      check("...not one hymn without verse numbers", !rv.empty.length,
        JSON.stringify(rv.empty.slice(0, 6)));
      check("...every hymn's verses ascending, with no duplicate, on both sides",
        !rv.disorder.length, JSON.stringify(rv.disorder.slice(0, 6)));
      /* THE TAB IS THE CITATION and that is the whole reason the hymn is the chapter: a reader
         looking for RV 10.129 has to find a tab reading 10.129. */
      check("[rigveda] every tab is its citation, mandala.hymn", rv.titles === 1028, String(rv.titles));

      /* THE VALAKHILYA MAPPING, and it is the one fault here that no count could ever show. Griffith
         prints those eleven hymns as an appendix, so his 8.49 is the standard 8.60 and his 8.93–8.103
         are the standard 8.49–8.59. Paired on the page number instead, 55 hymns of mandala 8 would sit
         beside hymns that are not theirs — with both columns complete, every mandala the right length
         and nothing thrown. Mandala 8's own pairing rate is what sees it: 102 of its 103 hymns pair
         exactly under the right map, and a handful would under the wrong one. */
      check("[rigveda] mandala 8 pairs on 102 of its 103 hymns — the Valakhilya map holds",
        rv.m8 === 103 && rv.m8pairs === 102, `${rv.m8pairs} of ${rv.m8}`);
      check("[rigveda] 1,002 of the 1,028 hymns pair on every verse number",
        rv.pairs === 1002, String(rv.pairs));
      /* AND THE 26 THAT DO NOT ARE ASSERTED BY NAME, which is what tells a documented divergence from
         a hymn the extractor has just started losing: six are the metre whose half-verses the two
         traditions count differently, three are the passages Griffith put into Latin and this
         transcription dropped, and seventeen are a single lost numeral apiece. */
      check("...and the twenty-six that do not are the known twenty-six",
        rv.unpaired.join(" ") === "1.65 1.66 1.67 1.68 1.69 1.70 1.91 1.95 1.105 1.116 1.117 " +
          "1.128 1.174 1.179 5.44 5.55 8.93 9.7 9.73 9.89 10.42 10.48 10.61 10.86 10.97 10.132",
        rv.unpaired.join(" "));

      /* SAYANA'S COMMENTARY IS ON EVERY SANSKRIT PAGE at ten times the length of the text. A leak
         makes a hymn LONGER, so no count of verses or hymns can see it. */
      check("[rigveda] no commentary leaked into the Sanskrit", !rv.commentary.length,
        JSON.stringify(rv.commentary.slice(0, 6)));
      check("[rigveda] Griffith's 27 notes, on the three proofread hymns, and their markers resolve",
        rv.notes === 27 && rv.noteOn.join(",") === "1.1,1.32,5.1" && !rv.noteFaults.length,
        `${rv.notes} on ${rv.noteOn.join(",")} — ${JSON.stringify(rv.noteFaults.slice(0, 3))}`);
      /* The two things a reader will otherwise meet as faults, both stated on the book's own page. */
      check("[rigveda] the front matter says why three passages are missing from the English",
        /1\.179/.test(rv.intro) && /Latin/.test(rv.intro), "");
      check("[rigveda] ...and how Griffith numbers the Valakhilya",
        /Valakhilya/.test(rv.intro), "");
    } else {
      check("[rigveda] the book is on disk", false, "missing books/rigveda.js");
    }

    /* DON QUIXOTE — see quixoteChecks above. Nothing here is standing in for a sibling diff; what it
       watches is the two cleanBody gates and the part boundary, all three of which fail silently. */
    const dq = quixoteChecks();
    if (dq) {
      check("[quixote] all 126 chapters", dq.chapters === 126, String(dq.chapters));
      /* THE PART BOUNDARY. page() cuts at 52 and the citation restarts there; a boundary out by one
         returns a complete novel with every chapter filed under the wrong number. */
      check("...52 in Part I and 74 in Part II", dq.p1 === 52 && dq.p2 === 74, `${dq.p1} / ${dq.p2}`);
      check("...and tab 53 is II.1, where the second part begins",
        dq.tab53.startsWith("II.1 "), dq.tab53.slice(0, 40));
      check("[quixote] every tab opens on its citation, part.chapter", dq.cited === 126, String(dq.cited));
      /* Ormsby heads all 126 differently, so a table that had drifted would show up as a collision. */
      check("...and no two chapters share a title", dq.titles.size === 126, String(dq.titles.size));

      /* THE SENTENCE THE SOURCE DECISION TURNS ON — see quixoteChecks. A transcription that has
         quietly lost a word passes every structural check there is, so this is the assertion, and
         it is the reason this book is not on the Wikisource text that every other check preferred. */
      check("[quixote] the windmills sentence is whole — thirty OR forty, on THAT plain",
        dq.windmills, "the text has lost a word, which is why Wikisource's copy was not used");

      /* THE TWO SWEEPS, both silent: a chapter is LONGER rather than shorter when either stops
         firing, which is what every count reads as healthy. */
      check("[quixote] no chapter opens on its own title in capitals — the title peel is firing",
        !dq.heads.length, JSON.stringify(dq.heads.slice(0, 6)));
      check("...and none carries Gutenberg's plate captions or boilerplate",
        !dq.junk.length, JSON.stringify(dq.junk.slice(0, 6)));
      /* Gutenberg sets no heading between the end of Part I and Part II's dedication, so that
         dedication and the author's preface fall inside chapter 52's span — 1,992 words of front
         matter that would read as the last chapter of the first part. */
      check("...and 52 stops before Part II's dedication rather than swallowing it", !dq.front, "");

      /* THE VERSE, which is the only thing here recovered from TYPOGRAPHY rather than read off a
         tag: Cervantes scatters ballads, sonnets and epitaphs through the novel and Gutenberg marks
         them only by their line length. Lose the rule and they print as prose — nothing throws,
         nothing shortens, and this count is the one thing that can see it. */
      check("[quixote] 143 verse blocks across 41 chapters",
        dq.verse === 41 && dq.quotes === 143, `${dq.verse} chapters, ${dq.quotes} blocks`);
      check("[quixote] <p> balances", dq.open === dq.close, `${dq.open} / ${dq.close}`);

      /* MEASURED RATHER THAN ASSUMED, and this is the one edition on the shelf whose notes are
         famous: neither free transcription of it carries one. The front matter says so, and if a
         note ever appears here it means the source has changed and the front matter has stopped
         being true. There are no section numbers either — the chapter is the only unit the novel
         has. */
      check("[quixote] no notes and no section numbers anywhere",
        dq.notes === 0 && dq.marks === 0, `${dq.notes} notes, ${dq.marks} marks`);
      check("[quixote] every chapter clears the short-chapter guard, 2.13 M characters in all",
        dq.shortest > 2000 && dq.chars > 2050000 && dq.chars < 2200000,
        `shortest ${dq.shortest}, total ${dq.chars}`);
      /* The two things a reader will otherwise meet as absences, both stated on the book's own page. */
      check("[quixote] the front matter says why there is no Spanish column",
        /Spanish Wikisource/.test(dq.intro) && /names no editor/.test(dq.intro), "");
      check("[quixote] ...and that Ormsby's notes are in neither free transcription",
        /note fold/.test(dq.intro) && /footnotes/.test(dq.intro), "");
    }

    /* THE SATYRICON — see satyriconChecks above. */
    const sat = satyriconChecks();
    if (sat) {
      check("[satyricon] 141 sections in each column, all of them paired",
        sat.en === 141 && sat.la === 141 && sat.paired === 141,
        `${sat.en} / ${sat.la}, ${sat.paired} paired`);
      /* THE SECTION IS THE CHAPTER, so there is nothing below it to mark — and both columns being
         unnumbered is what makes the pairing deterministic rather than the Gallic War's luck. */
      check("...and no section markers, because the section IS the tab",
        sat.marks === 0, String(sat.marks));

      /* THE VERSE, and it is the finding this book turns on: the Latin marks 607 lines in 54
         blocks and the translator sets every one of them as prose. Break the balanced matching or
         the boundary rule and the blocks fall apart while every word stays on the page. */
      check("[satyricon] 55 display quotations in the Latin, 54 of them verse, 607 lines",
        sat.laQ === 55 && sat.laLines === 607 - 54, `${sat.laQ} blocks, ${sat.laLines} <br>`);
      check("...and 8 in the English, which renders Petronius's verse as prose",
        sat.enQ === 8 && sat.enLines === 23 - 8, `${sat.enQ} blocks, ${sat.enLines} <br>`);
      /* §120 is INSIDE one quotation spanning six sections — it must open mid-poem. */
      check("...so the Bellum Civile is cut at its boundaries, and §120 opens on a block",
        sat.midPoem, (sat.la ? "§120 opens on prose" : ""));
      /* The crossing-quotation fault is invisible except here. */
      check("[satyricon] every tag balances in both columns",
        !sat.bal.length, JSON.stringify(sat.bal.slice(0, 6)));

      /* THE GREEK. Beta code decoded where it composes and LEFT where it does not; the Sibyl is the
         most quoted sentence in the book and is the one a reader would report. */
      check("[satyricon] §48's Sibyl is in Greek, not in beta code", sat.sibyl, "");
      check("...with no beta code left standing anywhere else",
        !sat.beta.length && sat.greek > 40, JSON.stringify(sat.beta.slice(0, 6)) + ` (${sat.greek} Greek chars)`);

      /* THE APPARATUS is dropped, so a leak makes a chapter LONGER — which no count of chapters,
         sections or words reads as a fault. */
      check("[satyricon] the Latin's apparatus criticus is not in the text",
        !sat.apparatus.length, JSON.stringify(sat.apparatus.slice(0, 6)));
      check("...and no sentinel leaked into either column", !sat.sentinel, "");
      check("[satyricon] 131 notes, every marker resolving and every note referenced",
        sat.notes === 131 && sat.markers === 131 && !sat.dead && !sat.unref,
        `${sat.notes} notes, ${sat.markers} markers, ${sat.dead} dead, ${sat.unref} unreferenced`);
      /* 147 lacunae — the book is a ruin, and the mark the edition prints for that is content. */
      check("[satyricon] the 147 lacunae are marked in the Latin", sat.gaps === 147, String(sat.gaps));
      check("[satyricon] every section clears the short-chapter guard",
        sat.shortest >= 400, String(sat.shortest));

      /* The two things a reader meets as absences, both stated on the book's own first page. */
      check("[satyricon] the front matter says which sections are left in Latin",
        /left in Latin/.test(sat.intro) && /23 to 26/.test(sat.intro), "");
      check("...and that the translator sets the verse as prose",
        /renders all of it as prose|as prose/.test(sat.intro) && /607 lines/.test(sat.intro), "");
      /* the words the OTHER copy has lost, named on the page, so a reader who has met that copy
         elsewhere knows what they are looking at */
      check("[quixote] ...and which words the Wikisource copy drops, and that nothing is merged",
        /\[or\] forty windmills/.test(dq.intro) && /never existed/.test(dq.intro), "");
    } else {
      check("[quixote] the book is on disk", false, "missing books/don-quixote.js");
    }
    /* THE AENEID — the same kind of check and for the same reason: one book on its own reader, so the
       shipped data is what stands in for a sibling diff. See aeneidChecks above for why each of these
       is here; all three faults it hunts are invisible on the page. */
    const ae = aeneidChecks();
    if (ae) {
      check("[aeneid] twelve books on each side", ae.enBooks === 12 && ae.laBooks === 12,
        `en ${ae.enBooks} la ${ae.laBooks}`);
      /* THE LINE COUNTS ARE THE ASSERTION THAT MATTERS, because they are the only thing that can see the
         mid-line lift failing: 13,336 lines of Williams, and 9,843 of Greenough — the traditional 9,896
         plus book 10's split half-line 62b, less the 54 the editor brackets as spurious. Break the lift
         and the English drops by up to 69 with every other check still reading healthy. */
      check("[aeneid] all 13,336 lines of the English are present", ae.enLines === 13336, String(ae.enLines));
      check("[aeneid] ...and all 9,843 of the Latin (9,896 + one split line − 54 bracketed)",
        ae.laLines === 9843, String(ae.laLines));
      check("[aeneid] 396 English card marks and 391 Latin",
        ae.enCards === 396 && ae.laCards === 391, `en ${ae.enCards} la ${ae.laCards}`);
      check("[aeneid] every card number ascends, with no duplicate, on both sides",
        !ae.disorder.length, JSON.stringify(ae.disorder.slice(0, 6)));
      check("[aeneid] 391 numbers carry on both sides and none is Latin-only",
        ae.shared === 391 && !ae.laOnly.length, `shared ${ae.shared}, latin-only ${JSON.stringify(ae.laOnly)}`);
      /* The five English-only cards, named: four are places Williams divides and Greenough does not, and
         2.567 is the Helen episode, whose card empties when its 22 bracketed lines go. */
      check("[aeneid] exactly five English cards draw beside an empty Latin cell",
        ae.enOnly.join(" ") === "2.13 2.567 7.45 12.672 12.728", ae.enOnly.join(" "));
      check("[aeneid] nine of the twelve books pair on every card they have", ae.exact === 9, String(ae.exact));
      /* One run-together survives and it is Perseus's own OCR — book 6 line 1171 reads "the.dead employ"
         in the source verbatim, with no tag near it. Asserted as exactly one so that a regression in the
         space rule (which would return 13) fails here, and so that the survivor cannot later be read as
         that rule having broken. */
      check("[aeneid] no words welded by a stripped tag, bar the source's own 'the.dead'",
        ae.welds.length === 1 && /the\.dead/.test(ae.welds[0]), JSON.stringify(ae.welds.slice(0, 5)));
      check("[aeneid] no <choice> printing both of its readings", !ae.doubled.length, JSON.stringify(ae.doubled));
    } else {
      check("[aeneid] both halves of the book are on disk", false, "missing books/virgil-aeneid*.js");
    }
    /* THE RAMAYANA — see ramayanaChecks above for why each of these is here and what it can see. */
    const ram = ramayanaChecks();
    if (ram) {
      check("[ramayana] 493 cantos shipped", ram.en === 493, String(ram.en));
      check("[ramayana] 490 of them have a Sanskrit sarga", ram.sa === 490, String(ram.sa));
      /* The three that pair with nothing are Griffith's own extra divisions, and they are asserted BY
         NAME: a fourth, or a different three, would mean one of the two measured shifts had moved. */
      check("[ramayana] exactly III.57, VI.112 and VI.113 pair with nothing",
        ram.unpaired.length === 3 && ["3.57", "6.112", "6.113"].every((k) => ram.unpaired.includes(k)),
        JSON.stringify(ram.unpaired));
      check("[ramayana] every tab carries Griffith's own name for its canto",
        !ram.unnamed.length, JSON.stringify(ram.unnamed.slice(0, 4)));
      check("[ramayana] the six káṇḍas carry 75/119/76/67/55/101 cantos",
        JSON.stringify([1, 2, 3, 4, 5, 6].map((p) => ram.parts[p] || 0)) === "[75,119,76,67,55,101]",
        JSON.stringify(ram.parts));
      /* 52,560 lines of verse in 1,825 stanzas, plus 18 runs of prose, counted the way `teiVerse`
         joins them: one <br> per line after the first, one opening <p> per block. */
      check("[ramayana] all 52,578 lines and paragraphs of the English are present",
        ram.lines === 52578, String(ram.lines));
      /* NEITHER column may carry a section marker. Griffith numbers no verses, so the canto is the row
         and bookRows pairs the two columns on their both being unnumbered; one marker appearing on one
         side would change that silently and pair by luck instead. */
      check("[ramayana] no bk-n marker on either side", ram.marks === 0, String(ram.marks));
      check("[ramayana] every footnote marker resolves", ram.dead === 0, String(ram.dead));
      /* The assertion that caught the Rigveda's dropped heading-markers: nine of Griffith's canto
         titles carry a note, and the head is dropped, so the marker has to be carried down. */
      check("[ramayana] every note is referenced", ram.unref === 0, String(ram.unref));
      check("[ramayana] Griffith's statements of what he left out are kept",
        ram.omitNotes >= 5, String(ram.omitNotes));
      /* The Sanskrit's own furniture, either of which makes a sarga LONGER if it leaks — which no
         count of sargas or of verses can see. */
      check("[ramayana] no citation header left in the Sanskrit",
        !ram.header.length, JSON.stringify(ram.header.slice(0, 6)));
      check("[ramayana] the reciter credit did not leak into the verse",
        !ram.credit.length, JSON.stringify(ram.credit.slice(0, 6)));
      check("[ramayana] the Sanskrit keeps its printed verse numerals", ram.danda > 20000, String(ram.danda));
      check("[ramayana] tag balance is clean on both columns",
        !ram.bal.length, JSON.stringify(ram.bal.slice(0, 6)));
      check("[ramayana] no canto came back short",
        ram.shortestEn >= 120 && ram.shortestSa >= 40, `en ${ram.shortestEn} sa ${ram.shortestSa}`);
      /* The front matter has to say what is missing: a reader who knows the poem will look for the
         seventh book, and being told why it is absent is the whole of the honesty here. */
      check("[ramayana] the front matter names the missing seventh book",
        /Uttara/.test(ram.intro) && /111/.test(ram.intro), String(ram.intro.length));
    } else {
      check("[ramayana] both halves of the book are on disk", false, "missing books/ramayana*.js");
    }

    /* THE MAXIMS OF PTAHHOTEP — see ptahhotepChecks above for what each of these can see. */
    const pt = ptahhotepChecks();
    if (pt) {
      check("[ptahhotep] 47 sections shipped", pt.n === 47, String(pt.n));
      /* The key run, asserted WHOLE and in order. It is what stands in for a short-chapter guard
         this book cannot have, and the marks are letters and numbers interleaved — a reader written
         for either alone loses one end of the poem with every other figure still reading healthy. */
      /* The tab carries the translator's own citation form, not the word again — see `titleOf` in
         the importer for the two-numbers-under-one-word fault that reading the page turned up. */
      check("[ptahhotep] the tabs run § A, § B, § 1–37, § C, § 38–43, § D",
        pt.titles.join("|") === pt.want.join("|"),
        pt.titles.slice(0, 4).join(", ") + " … " + pt.titles.slice(-3).join(", "));
      /* The volume holds three works and an introduction whose own heading is the WORDS of this
         one's title, so a slice made on the heading takes the essay about the poem instead. */
      check("[ptahhotep] it opens on the poem and not on the essay about it", pt.isPoem, "");
      check("[ptahhotep] ...with the work's own title line before the first mark", pt.incipit, "");
      check("[ptahhotep] ...and closes on the vizier counting his years", pt.closes, "");
      check("[ptahhotep] neither of the volume's other two works leaked in", pt.ke === 0, String(pt.ke));
      /* Gunn's own bracketed stand-in, left exactly as he left it rather than quietly closed up.
         It is also why the shortest chapter is 28 characters and the guard is nearly inert. */
      check("[ptahhotep] the one section Gunn would not translate is kept as he printed it",
        pt.omission, "");
      check("[ptahhotep] no bk-n marker anywhere", pt.marks === 0, String(pt.marks));
      check("[ptahhotep] all 22 notes shipped", pt.notes === 22, String(pt.notes));
      check("[ptahhotep] every footnote marker resolves", pt.dead === 0, String(pt.dead));
      check("[ptahhotep] every note is referenced", pt.unref === 0, String(pt.unref));
      /* Both survive stripTags as prose and make a section LONGER, which no count can see. */
      check("[ptahhotep] no printed page number left in the text", pt.braces === 0, String(pt.braces));
      check("[ptahhotep] no transcriber's link left in the text", pt.links === 0, String(pt.links));
      check("[ptahhotep] tag balance is clean", !pt.bal.length, JSON.stringify(pt.bal.slice(0, 3)));
      check("[ptahhotep] the front matter says why there is no Egyptian column",
        /papyrus/i.test(pt.intro) && /Ke'gemni/.test(pt.intro), String(pt.intro.length));
    } else {
      check("[ptahhotep] the book is on disk", false, "missing books/ptahhotep.js");
    }

    /* ROMANCE OF THE THREE KINGDOMS — see threeKingdomsChecks above for what each of these can see. */
    const tk = threeKingdomsChecks();
    if (tk) {
      check("[three-kingdoms] 120 chapters in the English", tk.en === 120, String(tk.en));
      check("[three-kingdoms] 120 chapters in the Chinese", tk.zh === 120, String(tk.zh));
      check("[three-kingdoms] ...numbered 1 to 120 in order",
        tk.seq === Array.from({ length: 120 }, (_, i) => i + 1).join(","), tk.seq.slice(0, 40));
      /* One marker a side per chapter is the whole pairing: neither edition numbers anything inside
         a chapter, so this is what makes a hundred and twenty rows rather than one block. */
      check("[three-kingdoms] exactly one section marker per English chapter",
        tk.marksEn.every((m) => m === 1), JSON.stringify(tk.marksEn.filter((m) => m !== 1)));
      check("[three-kingdoms] ...and one per Chinese chapter",
        tk.marksZh.every((m) => m === 1), JSON.stringify(tk.marksZh.filter((m) => m !== 1)));
      check("[three-kingdoms] every chapter pairs", tk.paired === 120, String(tk.paired));
      /* The titles are read off each chapter's own printed head — the contents pages set them in
         capitals and drop the accents — and the reader has to handle both the shape that puts the
         number and the title in two centred blocks and the two chapters that put both in one. A
         regression falls back to "Chapter 14" without throwing. */
      check("[three-kingdoms] every chapter carries its own printed title",
        tk.blank === 0 && tk.generic === 0, tk.blank + " blank, " + tk.generic + " generic");
      check("[three-kingdoms] ...and all 120 are distinct", tk.distinct === 120, String(tk.distinct));
      /* Each leak below survives the tag strip as prose and makes a chapter LONGER, so no count of
         chapters, words or markers can see any of them. */
      check("[three-kingdoms] no printed head, boundary mark or stylesheet left in the English",
        !tk.enLeak.length, JSON.stringify(tk.enLeak.slice(0, 5)));
      check("[three-kingdoms] no wiki navigation or licence banner left in the Chinese",
        !tk.zhLeak.length, JSON.stringify(tk.zhLeak.slice(0, 5)));
      check("[three-kingdoms] tag balance is clean on both columns",
        !tk.bal.length, JSON.stringify(tk.bal.slice(0, 3)));
      check("[three-kingdoms] all 16 notes shipped", tk.notes === 16, String(tk.notes));
      check("[three-kingdoms] every footnote marker resolves", tk.dead === 0, String(tk.dead));
      check("[three-kingdoms] every note is referenced", tk.unref === 0, String(tk.unref));
      check("[three-kingdoms] the two volumes are the book's parts", tk.parts === "1,2", tk.parts);
      /* The novel quotes poems constantly, and they are the one thing that must not read as prose:
         set as a nested definition list in the Chinese and inside three nested divs in the English,
         either of which the tag stripper would unwrap into a run-on paragraph. */
      check("[three-kingdoms] the quoted verse is set as verse in both columns",
        tk.verseEn > 300 && tk.verseZh > 300, tk.verseEn + " / " + tk.verseZh);
      check("[three-kingdoms] no chapter came back short",
        tk.shortEn > 5000 && tk.shortZh > 1500, tk.shortEn + " / " + tk.shortZh);
      /* Both columns are the Maos' recension of 1679 rather than the 1522 text, which is what makes
         the pairing possible at all — and the plainest evidence of it is on the first page, since
         the sentence about division and union and the poem above it are both their additions. */
      check("[three-kingdoms] chapter 1 opens on the Maos' own sentence about division and union",
        tk.divide, "");
      check("[three-kingdoms] ...and the Chinese carries their added poem above it", tk.yangshen, "");
    } else {
      check("[three-kingdoms] both columns are on disk", false, "missing books/three-kingdoms*.js");
    }

    /* THE CONSOLATION OF PHILOSOPHY — see boethiusChecks above for what each of these can see. */
    const bo = boethiusChecks();
    if (bo) {
      check("[boethius] five books in the English", bo.en === 5, String(bo.en));
      check("[boethius] ...and five in the Latin", bo.la === 5, String(bo.la));
      /* The shape of each book is the whole of the pairing: the sections are matched on their
         POSITION, neither edition printing a compound citation, so a book short of a section pairs
         everything after it against the wrong passage with both columns complete and every count
         reading healthy. */
      check("[boethius] the five books hold 13, 16, 24, 14 and 11 sections, and the Latin agrees",
        bo.shape === "13/13 16/16 24/24 14/14 11/11", bo.shape);
      check("[boethius] ...numbered 0 then 1..N in the English and 1..N in the Latin",
        !bo.seqBad.length, JSON.stringify(bo.seqBad));
      check("[boethius] all 78 sections pair", bo.paired === 78, String(bo.paired));
      /* Five rows are English only and that is the right figure, not a gap: each book opens on
         James's own summary of its argument, which the Latin has no counterpart for. It is numbered
         0 so that it draws a row of its own — folded into the first numbered row, as the shelf's
         rule would otherwise do, a quarter-page of English faces the opening of the Latin poem and
         reads as a translation of it. */
      check("[boethius] ...and only the five book summaries stand alone",
        bo.enOnly === 5 && bo.laOnly === 0, bo.enOnly + " / " + bo.laOnly);
      check("[boethius] every book prints its summary", bo.summaries === 5, String(bo.summaries));
      check("[boethius] ...and the summary carries the translator's own citations", bo.summaryCites, "");
      /* 39 poems and 39 prose chapters, and only the first book opens on a poem — which is what
         makes the alternation derivable on the Latin side, where the two are told apart by nothing
         but the setting. */
      check("[boethius] 39 songs and 39 chapters, marked in the translator's own words",
        bo.songs === 39 && bo.chaps === 39, bo.songs + " / " + bo.chaps);
      check("[boethius] only the first book opens on a poem", bo.firstKind === "mpppp", bo.firstKind);
      /* Each of these survives the tag strip as prose and makes a chapter LONGER, so no count of
         books, sections or markers can see any of them. */
      check("[boethius] no page anchor, note caption or poem container left in the English",
        !bo.enLeak.length, JSON.stringify(bo.enLeak));
      check("[boethius] no book head, boundary mark or other work left in the Latin",
        !bo.laLeak.length, JSON.stringify(bo.laLeak));
      check("[boethius] tag balance is clean on both columns",
        !bo.bal.length, JSON.stringify(bo.bal.slice(0, 3)));
      check("[boethius] all 19 notes shipped", bo.notes === 19, String(bo.notes));
      check("[boethius] every footnote marker resolves", bo.dead === 0, String(bo.dead));
      check("[boethius] every note is referenced", bo.unref === 0, String(bo.unref));
      check("[boethius] the Latin carries no note fold", bo.laNotes === 0, String(bo.laNotes));
      /* The book alternates prose and verse and the verse is the half that must not read as prose:
         set as nested divs of spans in the English and as one <br>-separated paragraph in the Latin,
         either of which the tag stripper would flatten. Three English poems and six Latin metres are
         printed across a page break and would otherwise show a stanza division the edition has not
         got, so the counts are exact rather than merely positive. */
      check("[boethius] the verse is set as verse in both columns, one block per poem",
        bo.verseLa === 39 && bo.verseEn === 49, bo.verseEn + " / " + bo.verseLa);
      check("[boethius] the Latin's 39 metres come to 896 lines", bo.lines === 896, String(bo.lines));
      check("[boethius] every book carries its own printed title",
        bo.blankTitles === 0 && bo.distinct === 5, bo.blankTitles + " blank, " + bo.distinct + " distinct");
      check("[boethius] no book came back short",
        bo.shortEn > 20000 && bo.shortLa > 20000, bo.shortEn + " / " + bo.shortLa);
      check("[boethius] the work opens on its poem in both columns", bo.opens, "");
      check("[boethius] ...and the prose beneath it", bo.prose1, "");
      check("[boethius] the great hymn is at the centre of Book III", bo.hymn, "");
      check("[boethius] ...and the last sentence of the work is present in both", bo.ends, "");
      /* Boethius writes a little Greek into his Latin. A letter NAME is a closed encoding and is
         decoded; a romanised WORD is not and is left exactly as printed, so both counts are
         asserted — decoding all of it would be inventing Greek, and decoding none of it would leave
         the two letters on Philosophy's gown as the words PI and THETA. */
      check("[boethius] the two Greek letters on Philosophy's gown are decoded in both columns",
        bo.gown && bo.realGreekLa === 2, bo.realGreekLa + " Greek characters in the Latin");
      check("[boethius] ...and the romanised quotations are left as the edition prints them",
        bo.greekLa === 12 && bo.greekEn === 0, bo.greekLa + " left in the Latin, " + bo.greekEn + " in the English");
    } else {
      check("[boethius] both columns are on disk", false, "missing books/boethius-consolation*.js");
    }

    /* THE ECCLESIASTICAL HISTORY — see bedeChecks above for what each of these can see. */
    const bd = bedeChecks();
    if (bd) {
      check("[bede] five books on each side", bd.books === 5 && bd.laBooks === 5,
        bd.books + " / " + bd.laBooks);
      /* 34/20/30/32/24 is the standard division and both columns had to agree on it before a word
         was imported. A mark that stops being recognised folds its chapter into the one before it,
         which shortens nothing visibly and would pair 139 of 140 with no other symptom. */
      check("[bede] 140 chapters a side, in the 34/20/30/32/24 the edition states",
        bd.secs === 140 && bd.laSecs === 140 && bd.shapeOK,
        bd.secs + " / " + bd.laSecs + "  EN " + JSON.stringify(bd.shape) + " LA " + JSON.stringify(bd.laShape));
      check("[bede] ...numbered a clean 1..N in every book on both sides",
        !bd.seqBad.length, JSON.stringify(bd.seqBad));
      /* The pairing is the whole point of the second column, and it is exact by MEASUREMENT rather
         than by construction, so it is the thing most worth watching. */
      check("[bede] ...and the two columns' chapter lists are identical, book for book",
        !bd.differ.length, JSON.stringify(bd.differ));
      /* Bede's letter to King Ceolwulf, unnumbered on both sides, which is what makes it a row of
         its own rather than something folded into chapter 1. */
      check("[bede] Bede's preface to Ceolwulf opens Book I on both sides, unnumbered",
        bd.prefaceEn && bd.prefaceLa && bd.lead > 3000 && bd.laLead > 3000,
        bd.lead + " / " + bd.laLead + " chars before the first marker");
      /* The apparatus is why this translation was chosen over the other free one, which carries
         none — so its integrity is the assertion that justifies the choice. */
      check("[bede] Sellar's 1,050 notes, every marker resolving and every note referenced",
        bd.notes === 1050 && bd.markers === 1050 && !bd.drops && !bd.orphans,
        bd.notes + " notes, " + bd.markers + " markers, " + bd.drops + " past the end, " + bd.orphans + " unreferenced");
      /* Four headings carry a footnote marker. Flattened to text they leave a bare figure in a title
         with its note in a fold nothing points at — the Consolation's finding, and invisible to
         every count: the chapter is complete and the numbering right either way. */
      check("[bede] every chapter carries Bede's own heading, and the four notes hung on one are carried",
        bd.titles === 140 && bd.headMarks === 4 && !bd.bareNum.length,
        bd.titles + " titles, " + bd.headMarks + " markers in one, bare figures in " + JSON.stringify(bd.bareNum));
      check("[bede] no transcriber's furniture in either column",
        !bd.leak.length && !bd.laLeak.length, JSON.stringify(bd.leak) + " / " + JSON.stringify(bd.laLeak));
      check("[bede] tags balance in every book, both columns", !bd.bal.length, JSON.stringify(bd.bal));
      /* The sentence Bede is quoted for, and the display quotations the papal letters are set in —
         Sellar sets his verse as prose, so a quotation is what carries them. */
      check("[bede] the sparrow flies through the hall, with the ealdormen and thegns in it",
        bd.sparrow, "");
      check("[bede] ...and the letters are set as display quotations", bd.letters >= 5, String(bd.letters));
      check("[bede] the Latin opens on Brittania and closes in the year 731",
        bd.laOpens && bd.laCloses, "");
      /* WHOSE LATIN IT IS. The transcription names Migne and does not print what Migne prints: it
         sets consonantal v as u throughout, which is what identifies the text and what a shelf
         quietly acquiring a different edition would lose. Counted in both directions. */
      check("[bede] the Latin is the u-orthography text its header does not describe",
        bd.u.uero > 80 && bd.u.uita > 40 && bd.u.ciuitate > 20 &&
        bd.v.vero < 5 && bd.v.vita < 5 && bd.v.civitate < 5,
        JSON.stringify(bd.u) + " against " + JSON.stringify(bd.v));
      /* Not Bede's, and a tab reading Book VI over it would say the wrong thing. */
      check("[bede] the later hand's continuation is not shelved as a sixth book", bd.noContinuation, "");
    } else {
      check("[bede] both columns are on disk", false, "missing books/bede-history*.js");
    }

    /* THE TRAVELS OF MARCO POLO — see poloChecks above for what each of these can see. */
    const mp = poloChecks();
    if (mp) {
      check("[polo] 235 chapters, numbered 1..N", mp.chapters === 235 && !mp.seq.length,
        mp.chapters + JSON.stringify(mp.seq));
      /* The prologue and the four books, in the lengths Yule's own contents pages state. A chapter
         folded into its neighbour shortens nothing a reader would notice on a bar of 235 tabs. */
      check("[polo] 18/61/82/40/34 — the Prologue and Books First to Fourth",
        mp.shape.join() === [18, 61, 82, 40, 34].join(), JSON.stringify(mp.shape));
      /* The tab IS the citation, this book having no facing column to pair on: "II 76", not
         "Chapter 158". A title that stops opening on one leaves a bar nobody can navigate. */
      check("[polo] every tab opens on the citation the book is cited by",
        !mp.titles.length, JSON.stringify(mp.titles.slice(0, 4)));
      /* One column by DESIGN — the Aesop/Malory/Satyricon case, and here it is a decision rather
         than an absence: Yule's English is an eclectic composite of three texts and states no
         chapter number of the Franco-Italian, so a marker here would pair on nothing. */
      check("[polo] no section markers, there being no facing original to pair on",
        mp.bkn === 0, String(mp.bkn));
      /* The apparatus is why this edition was taken, and it is five times Malory's. One note is
         cited twice, which is the Seneca rule working rather than a fault. */
      check("[polo] 788 notes, every marker resolving and every note referenced",
        mp.notes === 788 && mp.markers === 789 && !mp.drops && !mp.orphans && mp.repeats === 1,
        mp.notes + " notes, " + mp.markers + " markers, " + mp.drops + " past the end, " +
        mp.orphans + " unreferenced, " + mp.repeats + " cited twice");
      check("[polo] tags balance in every chapter, text and notes alike",
        !mp.bal.length, JSON.stringify(mp.bal.slice(0, 4)));
      check("[polo] no transcriber's furniture and no undecoded entity",
        !mp.leak.length && !mp.ent.length, JSON.stringify(mp.leak) + " / " + JSON.stringify(mp.ent));
      /* Yule's three marks. Each says whose words the reader is looking at, and each would be tidied
         away in silence — a mark that stops being recognised looks exactly like one that was never
         there, which is why all three are counted rather than merely spot-checked. */
      check("[polo] Yule's ⚜ on the seventeen chapters of Book Fourth he gives in gist",
        mp.gist === 17, String(mp.gist));
      check("[polo] ...his brackets round what he takes from Ramusio", mp.ram > 120, String(mp.ram));
      check("[polo] ...and Cordier's —H. C., on 348 of the 788 notes",
        mp.cordier === 570 && mp.cordierNotes === 348, mp.cordier + " signatures on " + mp.cordierNotes + " notes");
      /* The verse is all inside the note fold, so it is cut off before the chapter pass ever runs —
         it went missing twice on the way in, once to a figure rule and once to that ordering. */
      check("[polo] the notes' verse survives as display quotations", mp.verse > 120, String(mp.verse));
      check("[polo] the Greek in the notes is Greek", mp.greek > 500, String(mp.greek));
      check("[polo] opens on Baldwin reigning at Constantinople and closes on Messer Marco",
        mp.opens && mp.closes, mp.opens + " / " + mp.closes);
      /* The two things a reader opens this book for, one in each half — either would go in silence
         if a chapter were dropped out of the middle. */
      check("[polo] the paper money of Cathay and the black stones that burn are both in it",
        mp.paper && mp.coal, mp.paper + " / " + mp.coal);
    } else {
      check("[polo] the book is on disk", false, "missing books/marco-polo.js");
    }

    /* LE MORTE D'ARTHUR — see malloryChecks above for what each of these can see. */
    const ml = malloryChecks();
    if (ml) {
      check("[malory] twenty-one books", ml.books === 21, String(ml.books));
      /* The count is Caxton's own and was MEASURED against two independent transcriptions before it
         was believed — four of the books end one chapter short of the figure usually quoted, which
         looks exactly like four untranscribed pages and is not. A book short of a chapter here is
         invisible to everything else: the run still reads 1..N and the prose is still continuous. */
      check("[malory] 503 of Caxton's chapters, and each book holds the number it should",
        ml.secs === 503 && !ml.shapeBad.length, ml.secs + "  " + (ml.shapeBad.join("; ") || ml.shape));
      check("[malory] ...numbered a clean 1..N in every book", !ml.seqBad.length, JSON.stringify(ml.seqBad));
      /* Caxton's rubric on every one of them. Nothing else in this suite would notice its absence —
         the chapter would be complete, the numbering right, and the head a bare figure. */
      check("[malory] every chapter carries Caxton's own rubric beside its number",
        ml.rubrics === 503, String(ml.rubrics));
      check("[malory] ...including the one the edition sets as a centred block instead", ml.oddRubric, "");
      /* Caxton's preface stands BEFORE the first numbered chapter of Book I and claims no number: it
         introduces the whole work, and nobody cites it as Malory I.0. */
      check("[malory] Caxton's preface opens Book I, unnumbered",
        ml.prefaceHere && ml.lead.length > 3000, ml.lead.length + " chars before the first marker");
      check("[malory] Book I then opens on Uther Pendragon", ml.opensOnUther, "");
      check("[malory] Book XXI closes on Malory's epilogue and Caxton's colophon",
        ml.epilogue && ml.colophon, "");
      /* The 27 notes on this transcription are a Wikisource contributor's collation against the
         Winchester manuscript, not the edition's — so the book renders with no note fold at all, and
         no marker is left pointing at one. Both halves, since they fail in opposite directions. */
      check("[malory] no transcriber's apparatus reaches the page",
        ml.notes === 0 && ml.markers === 0, ml.notes + " notes, " + ml.markers + " markers");
      check("[malory] no wiki furniture in the prose", !ml.leak.length, JSON.stringify(ml.leak));
      check("[malory] tags balance in every book", !ml.bal.length, JSON.stringify(ml.bal));
      /* WHICH TEXT IT IS. The other free English copy differs about a thousand times and always the
         same way, so these eight readings are a fingerprint: every one is zero in that copy and
         non-zero here, counted in both before it was used. A shelf that quietly acquired that
         transcription instead would pass every other check above. */
      check("[malory] the text is the one that keeps Malory's own forms",
        Object.values(ml.kept).every((n) => n > 0) && ml.kept.alit > 50, JSON.stringify(ml.kept));
    } else {
      check("[malory] the book is on disk", false, "missing books/morte-darthur.js");
    }
    /* The glossary, linked through the prose. Letter 3 deliberately is NOT the chapter to look at —
       it is about friendship and contains no glossary term at all, and an assertion pointed there
       passes or fails on nothing. Letter 9 names the Greeks, which the glossary has. */
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "9"); t.click(); });
    await page.waitForTimeout(600);
    const g = await page.evaluate(() => ({
      links: [...document.querySelectorAll(".bk-prose .ttip")].map((el) => ({ k: el.dataset.k, s: el.textContent.trim() })),
    }));
    check("the glossary is linked through the prose", g.links.length > 0, JSON.stringify(g.links));

    // a gloss link opens the popup it promises
    if (g.links.length) {
      await page.evaluate(() => document.querySelector(".bk-prose .ttip").click());
      await page.waitForTimeout(450);
      const popped = await page.evaluate(() => document.querySelectorAll(".gloss-win").length);
      check("...and one opens its glossary popup", popped > 0, String(popped));
      await page.evaluate(() => document.querySelectorAll(".gloss-win .gloss-close, .gloss-win [data-close]").forEach((b) => b.click()));
    }

    /* The proper-noun rule, and it is the assertion most worth having: Folio's glossary is a glossary of
       PREHISTORY, and run unrestricted over Roman philosophy it links `genus` (a logical category to a
       Stoic), `epoch`, `iron` and `bronze` to taxonomy, geology and the ages of the world. Those links
       look perfectly normal on the page — a glossary term, styled like every other — while telling the
       reader something untrue about the sentence they are reading. Nothing throws. So: walk the WHOLE
       book and assert no lowercase surface was ever linked.

       Reduced motion is turned on for the walk, and it is not incidental: a chapter change is a slide now
       (slideChapter), so the new chapter is not painted until the swap at the midpoint, and a loop clicking
       125 tabs a hundredth of a second apart would measure the FIRST chapter 125 times over — which reads
       as a book with almost nothing linked in it rather than as a test outrunning an animation. This sweep
       is about what the prose links, so the honest fix is to take the motion out rather than to wait it
       out three books deep. */
    await page.emulateMedia({ reducedMotion: "reduce" });
    const sweep = await page.evaluate(async () => {
      const bad = [], seen = {};
      for (const t of [...document.querySelectorAll(".bk-tab")]) {
        t.click();
        await new Promise((r) => setTimeout(r, 10));
        document.querySelectorAll(".bk-prose .ttip").forEach((el) => {
          const s = (el.textContent || "").trim();
          seen[el.dataset.k] = (seen[el.dataset.k] || 0) + 1;
          if (s && s[0] === s[0].toLowerCase()) bad.push(el.dataset.k + ":" + s);
        });
      }
      return { bad, keys: Object.keys(seen) };
    });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    check("no common noun is linked anywhere in the book", sweep.bad.length === 0, sweep.bad.slice(0, 6).join(", "));
    check("...while the proper nouns still are", sweep.keys.length >= 5, sweep.keys.join(","));
    check("...and the four that mean something else in Seneca are gone",
      !["Genus", "Geological_epoch", "Iron", "Bronze"].some((k) => sweep.keys.includes(k)), sweep.keys.join(","));
    await page.close();
  }

  /* ================= 4. the reader's place ================= */
  console.log("\n4. Where the reader left off — across a reload, not just a re-render");
  {
    const page = await browser.newPage({ viewport: DESK });
    await watch(page);
    await page.goto(base + "#book/" + bookHref, { waitUntil: "load" });
    await page.waitForTimeout(2500);

    // move to a chapter well into the book and scroll a good way down it
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "12"); t.click(); });
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight * 0.45, behavior: "auto" }));
    await page.waitForTimeout(900);

    const saved = await page.evaluate(() => {
      const S = JSON.parse(localStorage.getItem("folio_v1"));
      return S.reading && S.reading["seneca-letters"];
    });
    check("the place is recorded", !!saved, JSON.stringify(saved));
    check("...as a chapter NUMBER, not an index", saved && saved.ch === 12, JSON.stringify(saved));
    check("...and a FRACTION, so it survives a resize or a text-size change",
      saved && typeof saved.y === "number" && saved.y > 0 && saved.y <= 1, JSON.stringify(saved));

    // a real reload — the case that matters, and the one a re-render does not prove
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(2600);
    const back = await page.evaluate(() => ({
      on: [...document.querySelectorAll(".bk-tab.on")].map((t) => t.dataset.ch).join(","),
      head: (document.querySelector(".bk-ch-n") || {}).textContent || "",
      y: window.scrollY,
    }));
    check("a reload comes back on the same chapter", back.on === "12", JSON.stringify(back));
    check("...saying so in the chapter head", /12/.test(back.head), back.head);
    check("...scrolled back down to the place, not to the top", back.y > 200, String(back.y));

    // …and choosing a different chapter starts it at the top rather than mid-paragraph
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "5"); t.click(); });
    await page.waitForTimeout(800);
    const fresh = await page.evaluate(() => ({
      on: [...document.querySelectorAll(".bk-tab.on")].map((t) => t.dataset.ch).join(","),
      y: window.scrollY,
    }));
    check("a deliberate move to another chapter starts it at the top", fresh.on === "5" && fresh.y < 120, JSON.stringify(fresh));
    await page.close();
  }

  /* ================= 5. navigation ================= */
  console.log("\n5. Stepping, contents, and the phone");
  {
    const page = await browser.newPage({ viewport: DESK });
    await watch(page);
    await page.goto(base + "#book/" + bookHref, { waitUntil: "load" });
    await page.waitForTimeout(2500);
    // the first chapter is the front matter now, so that is where Previous runs out — the arrows step
    // through it like any other chapter rather than treating it as a panel beside the book
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "0"); t.click(); });
    await page.waitForTimeout(500);

    const first = await page.evaluate(() => ({
      prevDisabled: document.querySelector("#bkPrev").disabled,
      nextDisabled: document.querySelector("#bkNext").disabled,
    }));
    check("on the first chapter, Previous is disabled and Next is not",
      first.prevDisabled && !first.nextDisabled, JSON.stringify(first));

    await page.evaluate(() => document.querySelector("#bkNext").click());
    await page.waitForTimeout(500);
    check("Next steps from the front matter into the first letter",
      (await page.evaluate(() => [...document.querySelectorAll(".bk-tab.on")].map((t) => t.dataset.ch).join(","))) === "1");

    await page.evaluate(() => document.querySelector("#bkNext").click());
    await page.waitForTimeout(500);
    const stepped = await page.evaluate(() => [...document.querySelectorAll(".bk-tab.on")].map((t) => t.dataset.ch).join(","));
    check("Next steps one chapter on", stepped === "2", stepped);

    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(500);
    const keyed = await page.evaluate(() => [...document.querySelectorAll(".bk-tab.on")].map((t) => t.dataset.ch).join(","));
    check("→ steps too, as it does on any reader", keyed === "3", keyed);

    // contents
    const toc = await page.evaluate(() => {
      const before = document.querySelector("#bkTocPanel").hidden;
      document.querySelector("#bkToc").click();
      const p = document.querySelector("#bkTocPanel");
      return { before, after: p.hidden, items: p.querySelectorAll(".bk-toc-item").length, parts: p.querySelectorAll(".bk-toc-part").length };
    });
    check("Contents starts closed and opens", toc.before && !toc.after, JSON.stringify(toc));
    check("...listing every chapter", toc.items >= 60, String(toc.items));
    check("...grouped by the volume the edition itself divides it into", toc.parts >= 1, String(toc.parts));

    /* The panel TRAVELS WITH THE BAR (Aug 2026, on a bug report). The bar is sticky and the panel used to
       sit below it in the flow, so opening it a few screens into a chapter drew the contents back at the
       top of the DOCUMENT — off screen, nowhere near the button just pressed. Nothing throws when that
       happens and the panel is still perfectly correct in the DOM, which is why it is asserted here: the
       panel must open under the bar wherever the reader has scrolled to, and be on screen when it does. */
    await page.evaluate(() => { document.querySelector("#bkTocPanel").hidden = true; window.scrollTo(0, 2400); });
    await page.waitForTimeout(400);
    const tocDeep = await page.evaluate(() => {
      document.querySelector("#bkToc").click();
      const p = document.querySelector("#bkTocPanel").getBoundingClientRect();
      const bar = document.querySelector(".bk-bar").getBoundingClientRect();
      return {
        y: Math.round(window.scrollY),
        gap: Math.round(p.top - bar.bottom),          // hangs off the bar's own bottom edge
        onScreen: p.top >= 0 && p.top < window.innerHeight,
        fits: p.height <= window.innerHeight - bar.bottom + 1,
      };
    });
    check("...opening under the bar however far the reader has scrolled",
      tocDeep.y > 1000 && tocDeep.gap >= 0 && tocDeep.gap <= 14 && tocDeep.onScreen, JSON.stringify(tocDeep));
    check("...and fitting in what is left of the screen below it", tocDeep.fits, JSON.stringify(tocDeep));
    await page.evaluate(() => { window.scrollTo(0, 0); });
    await page.waitForTimeout(300);

    await page.evaluate(() => { [...document.querySelectorAll(".bk-toc-item")].find((t) => t.dataset.ch === "40").click(); });
    await page.waitForTimeout(600);
    const jumped = await page.evaluate(() => ({
      on: [...document.querySelectorAll(".bk-tab.on")].map((t) => t.dataset.ch).join(","),
      tocShut: document.querySelector("#bkTocPanel").hidden,
    }));
    check("a contents entry jumps to its chapter and closes the list", jumped.on === "40" && jumped.tocShut, JSON.stringify(jumped));

    // back to the shelf
    await page.evaluate(() => document.querySelector("#bkBack").click());
    await page.waitForTimeout(600);
    const backToShelf = await page.evaluate(() => ({ hash: location.hash, tiles: document.querySelectorAll(".book-tile").length }));
    check("the back link returns to the shelf", /library/.test(backToShelf.hash) && backToShelf.tiles > 0, JSON.stringify(backToShelf));

    const resumed = await page.evaluate(() => (document.querySelector(".bk-tile-resume") || {}).textContent || "");
    check("...and the tile now says where the reader got to", /letter\s+40/i.test(resumed), resumed);
    await page.close();
  }

  {
    const page = await browser.newPage({ viewport: PHONE });
    await watch(page);
    await page.goto(base + "#book/" + bookHref, { waitUntil: "load" });
    await page.waitForTimeout(2600);
    const ph = await page.evaluate(() => {
      const bar = document.querySelector(".bk-bar").getBoundingClientRect();
      const prose = document.querySelector(".bk-prose").getBoundingClientRect();
      const doc = document.documentElement;
      return {
        barW: Math.round(bar.width), vw: window.innerWidth,
        proseW: Math.round(prose.width),
        overflow: doc.scrollWidth > doc.clientWidth + 1,
        titleShown: getComputedStyle(document.querySelector(".bk-tab-t")).display,
        libTab: !!document.querySelector('.tabbar .tab[data-route="library"]'),
        labels: [...document.querySelectorAll(".tabbar .tab")].filter((t) => t.checkVisibility())
          .map((t) => { const l = t.querySelector(".tab-label"); return { w: Math.round(l.getBoundingClientRect().width), need: l.scrollWidth }; }),
      };
    });
    check("[phone] the book page never scrolls sideways", !ph.overflow);
    check("[phone] the chapter bar fits the screen", ph.barW <= ph.vw, JSON.stringify({ bar: ph.barW, vw: ph.vw }));
    check("[phone] chapter titles give way to their numbers", ph.titleShown === "none", ph.titleShown);
    check("[phone] the Library is reachable from the tab bar", ph.libTab);
    check("[phone] ...and no tab label is clipped by the extra cell",
      ph.labels.every((l) => l.w >= l.need - 1), JSON.stringify(ph.labels));
    await page.close();
  }

  /* ================= 6. the original beside the translation =================
     Almost everything here fails SILENTLY, which is why it is worth the assertions. A second column
     that never appears looks like a book with no original; a column paired one section out looks like
     a bilingual page and is worse than not having one, because a reader trusts it; and a tap gesture
     that fires on a glossary link takes the language away instead of opening the term. */
  console.log("\n6. The original beside the translation");
  {
    const page = await browser.newPage({ viewport: DESK });
    await watch(page);
    await page.goto(base + "#book/" + bookHref, { waitUntil: "load" });
    await page.waitForTimeout(2500);

    // THE LAZINESS: the original is its own file and must not ride in with the translation
    check("the original is not fetched until it is asked for",
      !asked.some((u) => /\.la\.js$/.test(u)), asked.filter((u) => /\.la\.js$/.test(u)).join(","));
    check("...and there is a control to ask for it", !!(await page.$("#bkLang")));

    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "9"); t.click(); });
    await page.waitForTimeout(500);
    check("a chapter reads as one column until then", (await page.$$(".bk-row")).length === 0);

    await page.evaluate(() => document.querySelector("#bkLang").click());
    await page.waitForTimeout(3000);
    check("asking for it fetches it", asked.some((u) => /\.la\.js$/.test(u)));

    const bi = await page.evaluate(() => {
      const box = document.querySelector(".bk-bi");
      const rows = [...document.querySelectorAll(".bk-row")];
      const r1 = document.querySelector(".bk-row[data-sec='1']");
      const a = r1.querySelector(".bk-col-en").getBoundingClientRect();
      const b = r1.querySelector(".bk-col-or").getBoundingClientRect();
      return {
        mode: box.dataset.lang,
        rows: rows.length,
        // the numbered sections, as each column reports them — this is the pairing itself
        secs: rows.filter((r) => r.dataset.sec).map((r) => r.dataset.sec),
        enMarks: rows.filter((r) => r.dataset.sec).map((r) => {
          const m = r.querySelector(".bk-col-en .bk-n"); return m ? m.textContent.trim() : "";
        }),
        orMarks: rows.filter((r) => r.dataset.sec).map((r) => {
          const m = r.querySelector(".bk-col-or .bk-n"); return m ? m.textContent.trim() : "";
        }),
        sideBySide: b.x > a.x + 100 && Math.abs(a.y - b.y) < 4,
        orLang: r1.querySelector(".bk-col-or").getAttribute("lang"),
        tips: { en: document.querySelectorAll(".bk-col-en .ttip").length, or: document.querySelectorAll(".bk-col-or .ttip").length },
      };
    });
    check("a wide screen sets the two languages side by side", bi.mode === "both" && bi.sideBySide,
      JSON.stringify({ mode: bi.mode, sideBySide: bi.sideBySide }));
    check("...as a row per section", bi.rows > 3, String(bi.rows));
    /* THE PAIRING, asserted from the RENDERED text rather than from the row's own data-sec — which
       would only be checking the label against itself. Each column's own section marker must be the
       number the row claims, in both languages: that is what makes the two cells the same passage. */
    check("...each row holding the SAME section number in both languages",
      bi.secs.length > 2 && bi.secs.every((s, i) => bi.enMarks[i] === s && bi.orMarks[i] === s),
      JSON.stringify({ secs: bi.secs, en: bi.enMarks, or: bi.orMarks }).slice(0, 200));
    check("...with the original marked as its own language", bi.orLang === "la", bi.orLang);
    /* The glossary is an ENGLISH glossary of prehistory and geography, and its keys collide with plain
       Latin words far harder than with English ones. Measured on letter 9, which carries terms; letter
       1 carries none, so the same check there would pass on nothing. */
    check("the glossary is linked through the translation only",
      bi.tips.en > 0 && bi.tips.or === 0, JSON.stringify(bi.tips));

    /* Two works, two licences, two boxes. The Latin is out of copyright by AGE and Gummere's English
       by its date of publication, and running the two together is how the distinction that decides
       what may be shelved here gets lost. It is also asserted because it failed silently once: the
       front matter is built when the page is set up, and the original's box comes from a file that
       lands later, so it has to be rebuilt on paint rather than once. */
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "0"); t.click(); });
    await page.waitForTimeout(600);
    const fm = await page.evaluate(() => [...document.querySelectorAll(".bk-rights")].map((s) => s.textContent));
    check("the front matter states the grounds for the translation AND for the original",
      fm.length === 2 && fm.some((s) => /Gummere/i.test(s)) && fm.some((s) => /Latin/i.test(s) && /public domain/i.test(s)),
      JSON.stringify(fm.map((s) => s.slice(0, 60))));
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "9"); t.click(); });
    await page.waitForTimeout(500);

    // a narrow screen shows ONE language — two columns of prose in 390px is two unreadable ones
    await page.setViewportSize(PHONE);
    await page.waitForTimeout(400);
    const narrow = await page.evaluate(() => {
      const r = document.querySelector(".bk-row[data-sec='1']");
      return {
        mode: document.querySelector(".bk-bi").dataset.lang,
        en: r.querySelector(".bk-col-en").offsetHeight,
        or: r.querySelector(".bk-col-or").offsetHeight,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      };
    });
    check("[phone] the same setting shows one language, not two columns",
      narrow.mode === "or" && narrow.en === 0 && narrow.or > 0, JSON.stringify(narrow));
    check("[phone] ...and the page still never scrolls sideways", !narrow.overflow);

    /* TAPPING THE PAGE TURNS IT OVER, and lands on the SAME SECTION — the reason the whole thing is
       paired on section numbers rather than on scroll offsets. The Latin runs about seven tenths the
       length of the English, so a switch that restored the pixel position would land further from the
       reader's sentence the deeper into the chapter they had got; the assertion is therefore that the
       section is the same AND that the scroll actually had to move to keep it. */
    await page.evaluate(() => window.scrollTo(0, 1400));
    await page.waitForTimeout(300);
    const nearestSec = () => page.evaluate(() => {
      const eye = window.scrollY + window.innerHeight * 0.35;
      let best = null;
      document.querySelectorAll(".bk-row").forEach((r) => {
        if (!r.offsetHeight) return;
        const top = r.getBoundingClientRect().top + window.scrollY;
        if (!best || Math.abs(top - eye) < Math.abs(best.top - eye)) best = { sec: r.dataset.sec, top: top };
      });
      return { sec: best && best.sec, y: window.scrollY, mode: document.querySelector(".bk-bi").dataset.lang };
    });
    /* One press of a finger, start to finish. `n` presses in a row makes a double tap; `dx` makes it a
       swipe. Dispatched as real PointerEvents rather than through page.touchscreen because the handler
       is on the page element and keys off pointerType. */
    const tapOn = (sel, n, dx) => page.evaluate(([s, n, dx]) => {
      const el = document.querySelector(s);
      const r = el.getBoundingClientRect();
      for (let i = 0; i < (n || 1); i++) {
        const base = { bubbles: true, cancelable: true, isPrimary: true, pointerType: "touch", pointerId: 1 };
        el.dispatchEvent(new PointerEvent("pointerdown", Object.assign({ clientX: r.x + 4, clientY: r.y + 4 }, base)));
        el.dispatchEvent(new PointerEvent("pointerup", Object.assign({ clientX: r.x + 4 + (dx || 0), clientY: r.y + 4 }, base)));
      }
    }, [sel, n, dx]);

    /* A SINGLE tap must NOT turn the page (Aug 2026, on request). This is the half of the change that
       fails silently: if the double tap regresses to a single one every assertion below still passes,
       because a double tap contains a single one — so the cheap gesture is asserted NOT to fire first. */
    const beforeTap = await nearestSec();
    await tapOn(".bk-col-or p:not(.bk-salut)", 1);
    await page.waitForTimeout(500);
    check("[phone] a SINGLE tap leaves the language alone",
      (await nearestSec()).mode === "or", (await nearestSec()).mode);

    await tapOn(".bk-col-or p:not(.bk-salut)", 2);
    await page.waitForTimeout(500);
    const afterTap = await nearestSec();
    check("[phone] a DOUBLE tap turns the page over to the other language",
      afterTap.mode === "en", afterTap.mode);
    check("[phone] ...landing on the same section the reader was on",
      afterTap.sec === beforeTap.sec && !!beforeTap.sec, "before " + beforeTap.sec + ", after " + afterTap.sec);
    check("[phone] ...which took a real scroll correction, the two lengths differing",
      afterTap.y !== beforeTap.y, beforeTap.y + " → " + afterTap.y);

    /* THE FRONT MATTER HAS NOTHING TO TURN TO (Aug 2026, on request). Chapter 0 is written here, in
       English, about this edition; it has no facing original. The double tap used to flip the stored
       preference there anyway, which is the worst shape of bug this file exists to catch — nothing on
       screen changed (applyLangMode finds no .bk-bi to switch), so the reader's NEXT real chapter opened
       in a language they had not asked for and could not see themselves asking for. Both halves are
       asserted, because they fail in opposite directions: the gesture must do nothing here, and it must
       still work one chapter along. */
    {
      const stored = () => page.evaluate(() => String(localStorage.getItem("folio_book_orig_v1")));
      await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "0"); t.click(); });
      await page.waitForTimeout(600);
      const was = await stored();
      await tapOn(".bk-prose", 2);
      await page.waitForTimeout(500);
      check("[phone] a double tap on the front matter changes nothing", (await stored()) === was, was + " → " + (await stored()));
      const btn = await page.evaluate(() => {
        const b2 = document.querySelector("#bkLang");
        return b2 ? { there: true, dead: b2.disabled, why: b2.title } : { there: false };
      });
      check("[phone] ...and the language control is greyed rather than gone, saying why",
        btn.there && btn.dead && /English only/i.test(btn.why || ""), JSON.stringify(btn));
      await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "9"); t.click(); });
      await page.waitForTimeout(700);
      await tapOn(".bk-col-en p:not(.bk-salut), .bk-prose", 2);
      await page.waitForTimeout(600);
      check("[phone] ...while a real chapter still turns over", (await stored()) !== was, was + " → " + (await stored()));
      // put the reader back on the language this section's later assertions expect
      if ((await page.evaluate(() => document.querySelector(".bk-bi").dataset.lang)) !== "en") {
        await tapOn(".bk-col-or p:not(.bk-salut), .bk-prose", 2);
        await page.waitForTimeout(600);
      }
    }

    // ...but a double tap on something that already does something keeps doing it
    const tip = await page.$(".bk-col-en .ttip");
    if (tip) {
      await tapOn(".bk-col-en .ttip", 2);
      await page.waitForTimeout(300);
      check("[phone] a tap on a glossary term does NOT turn the page",
        (await page.evaluate(() => document.querySelector(".bk-bi").dataset.lang)) === "en");
      await page.evaluate(() => document.querySelectorAll(".gloss-win").forEach((w) => w.remove()));
    }

    /* SWIPE BETWEEN CHAPTERS (Aug 2026, on request). Two things to pin, and the second is the one that
       breaks quietly: a swipe must step the chapter, and it must NOT also register as half a double tap
       — the two gestures end in the same pointerup and are told apart only by how far the finger moved. */
    const chapNow = () => page.evaluate(() => {
      const t = document.querySelector(".bk-tab.on");
      return { ch: t && t.dataset.ch, lang: document.querySelector(".bk-bi") ? document.querySelector(".bk-bi").dataset.lang : null };
    });
    const beforeSwipe = await chapNow();
    await tapOn(".bk-prose", 1, -120);              // a firm swipe left
    await page.waitForTimeout(600);
    const afterSwipe = await chapNow();
    check("[phone] swiping left moves to the next chapter",
      afterSwipe.ch && +afterSwipe.ch === +beforeSwipe.ch + 1, beforeSwipe.ch + " → " + afterSwipe.ch);
    await tapOn(".bk-prose", 1, 120);               // …and back
    await page.waitForTimeout(600);
    check("[phone] swiping right moves back",
      (await chapNow()).ch === beforeSwipe.ch, beforeSwipe.ch + " → " + (await chapNow()).ch);
    check("[phone] ...and two swipes are not read as a double tap",
      (await chapNow()).lang === afterSwipe.lang, "language changed under the swipes");
    // a short drag is a scroll that wandered, not a swipe
    await tapOn(".bk-prose", 1, -30);
    await page.waitForTimeout(500);
    check("[phone] a short sideways drag does not change the chapter",
      (await chapNow()).ch === beforeSwipe.ch, (await chapNow()).ch);

    /* …AND THE STEP IS A SLIDE, NOT A CUT (Aug 2026, on request). Measured MID-FLIGHT, because the
       finished state of a slide and the finished state of a cut are the same chapter in the same place —
       an assertion made after it settles would pass on a hard swap for ever. The panel leaves the way the
       finger went (a swipe left → it goes left, and the next one arrives from the right), and the stage
       clips horizontally while it moves so the travel cannot be scrolled into. */
    const flight = await page.evaluate(async () => {
      const el = document.querySelector(".bk-page"), r0 = el.getBoundingClientRect().left;
      const base = { bubbles: true, cancelable: true, isPrimary: true, pointerType: "touch", pointerId: 1 };
      const p = document.querySelector(".bk-prose"), r = p.getBoundingClientRect();
      p.dispatchEvent(new PointerEvent("pointerdown", Object.assign({ clientX: r.x + 4, clientY: r.y + 4 }, base)));
      p.dispatchEvent(new PointerEvent("pointerup", Object.assign({ clientX: r.x + 4 - 120, clientY: r.y + 4 }, base)));
      await new Promise((rs) => setTimeout(rs, 90));
      const out = document.querySelector(".bk-page").getBoundingClientRect().left;
      const clip = getComputedStyle(document.querySelector(".stage")).overflowX;
      await new Promise((rs) => setTimeout(rs, 120));         // past the midpoint: the new chapter is painted
      const inn = document.querySelector(".bk-page").getBoundingClientRect().left;
      await new Promise((rs) => setTimeout(rs, 600));
      const el2 = document.querySelector(".bk-page");
      return { r0: r0, out: out, in: inn, clip: clip,
               settled: el2.getBoundingClientRect().left,
               clipEnd: getComputedStyle(document.querySelector(".stage")).overflowX };
    });
    check("[phone] the outgoing chapter moves the way the finger went", flight.out < flight.r0 - 4,
      flight.r0 + " → " + flight.out);
    check("[phone] ...and the next one comes in from the other side", flight.in > flight.r0 + 4,
      flight.r0 + " → " + flight.in);
    check("[phone] ...with the stage clipped while it travels, and released after",
      flight.clip === "clip" && flight.clipEnd !== "clip", flight.clip + " → " + flight.clipEnd);
    check("[phone] ...and it lands where a chapter belongs", Math.abs(flight.settled - flight.r0) < 2,
      flight.r0 + " → " + flight.settled);
    await tapOn(".bk-prose", 1, 120);               // …and back to where the assertions below expect it
    await page.waitForTimeout(700);

    /* …and the same swipe as a REAL touch, which is a different test and the reason it is here (Aug 2026,
       on a report that the swipe did nothing on a phone). Everything above dispatches PointerEvents by
       hand, which bypasses the browser's own gesture arbitration and so completes every time. A real
       finger does not: under the default touch-action the browser claims the drag for scrolling the moment
       it passes the slop and fires POINTERCANCEL, pointerup never arrives, and the handler — which
       measures the gesture at pointerup — can never see one. The swipe was broken this way for its whole
       life and every synthetic assertion above passed throughout. `.page` carries `touch-action:pan-y
       pinch-zoom` for it; nothing in JS can substitute, so this is asserted through CDP touch input.
       The two that follow are the other halves: a vertical drag must still SCROLL (that one really is a
       scroll, and pan-y is what keeps it), and the chapter bar must still pan sideways under its own
       finger, since a touch-action that reached into it would take a nested scroller away. */
    const cdp = await page.context().newCDPSession(page);
    const realSwipe = async (x0, y0, dx, dy) => {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0, id: 1 }] });
      for (let i = 1; i <= 6; i++) {
        await page.waitForTimeout(25);
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + dx * i / 6, y: y0 + (dy || 0) * i / 6, id: 1 }] });
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(700);
    };
    await realSwipe(320, 500, -170);
    const afterReal = await chapNow();
    check("[phone] a REAL touch swipe steps the chapter, not just a synthesised one",
      afterReal.ch && +afterReal.ch === +beforeSwipe.ch + 1, beforeSwipe.ch + " → " + afterReal.ch);
    await realSwipe(80, 500, 170);
    check("[phone] ...and back the other way",
      (await chapNow()).ch === beforeSwipe.ch, beforeSwipe.ch + " → " + (await chapNow()).ch);
    /* The chapter bar goes FIRST of the two below, and the order is not arbitrary: a touch that lands
       while an earlier fling is still running is spent stopping it, so a bar pan measured straight after
       the vertical drag reads as a few pixels of scroll and fails on the wrong grounds. */
    const barPans = await page.evaluate(() => {
      const t = document.querySelector("#bkTabs");
      t.scrollTo({ left: 0, behavior: "auto" });
      return t.scrollWidth > t.clientWidth + 4;
    });
    if (barPans) {
      await page.waitForTimeout(600);
      const bar = await page.evaluate(() => { const r = document.querySelector("#bkTabs").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
      const chBefore = (await chapNow()).ch;
      await realSwipe(bar.x + bar.w - 25, bar.y + bar.h / 2, -220);
      check("[phone] ...and the chapter bar still pans sideways under its own finger",
        (await page.evaluate(() => document.querySelector("#bkTabs").scrollLeft)) > 80,
        String(await page.evaluate(() => document.querySelector("#bkTabs").scrollLeft)));
      check("[phone] ...without that pan also stepping a chapter",
        (await chapNow()).ch === chBefore, chBefore + " → " + (await chapNow()).ch);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await realSwipe(200, 620, 0, -300);
    check("[phone] ...while a vertical drag still scrolls the chapter",
      (await page.evaluate(() => window.scrollY)) > 100, String(await page.evaluate(() => window.scrollY)));
    await cdp.detach();

    // the choice is remembered — it is a way of reading, not a per-chapter accident
    await page.evaluate(() => document.querySelector("#bkLang").click());
    await page.waitForTimeout(400);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(3000);
    check("[phone] the reader's choice survives a reload",
      (await page.evaluate(() => { const b = document.querySelector(".bk-bi"); return b && b.dataset.lang; })) === "or");
    await page.close();
  }

  /* THE VERSE THAT WAS IN THE FILE AND NOT ON THE PAGE (Sep 2026, batch E26). Seneca quotes Virgil,
     Ovid and Ennius constantly, and 63 of those quotations sat between two paragraphs and inside
     neither — where `bookSections`, walking the ELEMENT children to split a chapter at its section
     markers, dropped them without a word. The chapter rendered, the sections paired, every count was
     right, and about six thousand characters of poetry were simply not there. So this asserts the
     text, not the markup: three lines that ARE in books/seneca-letters.la.js must be on the screen.
     It only shows in the two-column view, which is why it is here and not in section 3. */
  {
    const page = await browser.newPage({ viewport: DESK });
    await watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.evaluate(() => { try { localStorage.setItem("folio_book_orig_v1", "1"); } catch (e) {} });
    await page.goto(base + "#book/seneca-letters/76", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    const seen = await page.evaluate(() => {
      const t = document.body.innerText;
      return {
        ctl: /Vergilius|animus/.test(t),
        one: t.includes("non ulla laborum"),
        two: t.includes("nova mi facies"),
        three: t.includes("omnia praecepi"),
      };
    });
    check("the Latin chapter renders at all", seen.ctl);
    check("...and the Virgil it quotes is on the page, not only in the file",
      seen.one && seen.two && seen.three, JSON.stringify(seen));
    await page.close();
  }

  /* ================= 6c. every English branch is in the correction chain =================
     Sep 2026, batch E31. Five branches — `play`, `fitts`, `terzine`, `eddapoem`, `laisses` — read a
     cached page, handed it to a reader of their own and pushed the result onto `chapters` without
     ever calling `correctRaw`, so a book on one of those branches never got its own corrections.
     Nothing threw and the books built perfectly; the only symptom was a DID NOT FIRE line beside a
     row whose word was plainly in the shipped file.

     ASSERTED STATICALLY, OUT OF THE IMPORTER ITSELF, because there is nothing to click: this is a
     property of a build-time script, and the browser only ever sees its output. The check runs over
     `fetchBook` — the English half, which ends where `fetchOriginal` begins, the original column
     being deliberately OUT of the chain — and holds every `const got = extract…(` to being in the
     chain by ONE OF THE TWO SHAPES: wrapped in `correctGot(`, or preceded by `correctRaw` applied to
     the page it just read. Both are live and both fire on every run, the caches on these branches
     holding raw pages; E29 argues the first is the better of the two and seven branches are still on
     the second. Written to accept either, so it guards against a branch in NEITHER — which is what
     E31 found — rather than against the shape a branch happens to use. The two shipped repairs are
     checked beside it, since a guard on the mechanism and a guard on the result fail for different
     reasons. */
  {
    const src = fs.readFileSync(path.join(ROOT, ".claude", "fetch-book.js"), "utf8");
    const cut = src.indexOf("async function fetchOriginal");
    check("[chain] fetchOriginal is where the English half ends", cut > 0, String(cut));
    const english = src.slice(0, cut);
    const rx = /const got = (correctGot\()?extract([A-Za-z]+)\(/g;
    const bare = [];
    let m, sites = 0;
    while ((m = rx.exec(english))) {
      sites++;
      if (m[1]) continue;                                    /* corrects the extracted prose */
      const above = english.slice(Math.max(0, m.index - 1400), m.index);
      if (/\b(h|raw|xml)\s*=\s*correctRaw\(/.test(above)) continue;   /* corrects the page */
      bare.push(m[2]);
    }
    check("[chain] every English branch is in the correction chain",
      sites >= 13 && bare.length === 0,
      sites + " call sites, " + bare.length + " outside the chain: " + bare.join(" "));

    const roland = fs.readFileSync(path.join(ROOT, "books", "song-of-roland.js"), "utf8");
    const edda = fs.readFileSync(path.join(ROOT, "books", "poetic-edda.js"), "utf8");
    const bad = [
      ["song-of-roland", roland, /(?<![A-Za-z])(Carlum|Marsilium|Sarrazens)(?![A-Za-z])/g],
      ["poetic-edda", edda, /(?<![A-Za-z])Balled(?![A-Za-z])/g],
    ].flatMap(([id, txt, rx]) => (txt.match(rx) || []).map((w) => id + ":" + w));
    check("[chain] ...and the four E31 repairs are in the shipped books",
      bad.length === 0, bad.join(" "));
    check("[chain] the corrected spellings really are there",
      /(?<![A-Za-z])Carlun(?![A-Za-z])/.test(roland) &&
      /(?<![A-Za-z])Marsiliun(?![A-Za-z])/.test(roland) &&
      /(?<![A-Za-z])Sarrazins(?![A-Za-z])/.test(roland) &&
      /(?<![A-Za-z])Ballad(?![A-Za-z])/.test(edda));

    /* AND correctGot ITSELF REFUSES A SHAPE IT DOES NOT KNOW (Sep 2026, batch E32). Written to fall
       through, it returned an unrecognised object untouched and reported nothing — so pointing it at
       a reader whose parts hang off a name not in its list corrected NOTHING while every count read
       healthy. Sliced out of the importer and run against a marker `correctRaw`, which is the only
       way to see a helper whose whole contract is what it does to somebody else's object. */
    const fn = src.slice(src.indexOf("function correctGot("));
    let depth = 0, end = 0;
    for (let i = fn.indexOf("{"); i < fn.length; i++) {
      if (fn[i] === "{") depth++;
      else if (fn[i] === "}") { depth--; if (!depth) { end = i + 1; break; } }
    }
    const correctGot = new Function("correctRaw", fn.slice(0, end) + "; return correctGot;")
      ((t) => "<" + t + ">");
    const arr = correctGot([{ html: "a", t: "b", notes: ["c"] }])[0];
    check("[chain] correctGot corrects html, title and notes",
      arr.html === "<a>" && arr.t === "<b>" && arr.notes[0] === "<c>", JSON.stringify(arr));
    const map = correctGot({ cantos: { 1: { html: "a", name: "n" } }, counts: {} });
    check("[chain] ...and a reader's named collection of parts",
      map.cantos[1].html === "<a>" && map.cantos[1].name === "<n>", JSON.stringify(map.cantos));
    let threw = "";
    try { correctGot({ stanzas: [{ html: "a" }], counts: {} }); } catch (e) { threw = e.message; }
    check("[chain] ...and it THROWS on a shape it does not know, rather than doing nothing",
      /correctGot: nothing to correct/.test(threw), threw || "(returned quietly)");
  }

  /* ================= 7. the switch is a crossfade, not a cut =================
     A regression here is silent in the worst way: the languages still swap, the reader still lands on
     the right passage, and every assertion above still passes — the switch just goes back to being the
     jump it was. So the fade is measured rather than looked at, by sampling the prose's own opacity
     across the press.

     The second assertion is the one that catches a DRIFT rather than a removal: the JS holds the swap
     for BK_FADE and the CSS fades for its own duration, and if those two come apart the reader sees
     the change happen — a flash of the old language at half opacity — which is worse than the cut. It
     is checked by asserting that the first frame carrying the NEW language is a dark one. */
  console.log("\n7. Turning the page over is a crossfade");
  {
    const page = await browser.newPage({ viewport: DESK });
    await watch(page);
    await page.goto(base + "#book/seneca-letters", { waitUntil: "networkidle" });
    await page.evaluate(() => document.querySelectorAll(".bk-tab")[9].click());
    await page.waitForTimeout(300);
    await page.click("#bkLang");                       // first press fetches the original and repaints
    await page.waitForTimeout(2500);

    // every frame for 700ms from the moment of the press: the prose's opacity and which language it holds
    const frames = await page.evaluate(() => new Promise((done) => {
      const seen = [], t0 = performance.now();
      const tick = () => {
        const el = document.querySelector("#bkPage .bk-prose");
        seen.push({ o: el ? +getComputedStyle(el).opacity : null, mode: el ? el.dataset.lang : null });
        if (performance.now() - t0 < 700) requestAnimationFrame(tick); else done(seen);
      };
      document.querySelector("#bkLang").click();
      tick();
    }));
    const min = Math.min(...frames.map((f) => f.o));
    const swap = frames.find((f) => f.mode !== frames[0].mode);
    const rises = frames.filter((f, i) => i && f.o > frames[i - 1].o + 0.02).length;
    check("the prose fades right down rather than cutting", min < 0.05, "min opacity " + min);
    check("...the swap itself happens while nothing is visible",
      !!swap && swap.o < 0.1, swap ? "opacity " + swap.o + " at the swap" : "the language never changed");
    check("...and it comes back over several frames, not in one",
      rises >= 4, rises + " rising frames");
    check("...ending fully visible", frames[frames.length - 1].o > 0.95, String(frames[frames.length - 1].o));
    await page.close();

    // a reader who has asked for less motion is not made to wait out a fade they will not see
    const still = await browser.newPage({ viewport: DESK, reducedMotion: "reduce" });
    await watch(still);
    await still.goto(base + "#book/seneca-letters", { waitUntil: "networkidle" });
    await still.evaluate(() => document.querySelectorAll(".bk-tab")[9].click());
    await still.waitForTimeout(300);
    await still.click("#bkLang");
    await still.waitForTimeout(2500);
    const t0 = Date.now();
    await still.click("#bkLang");
    const mode = await still.evaluate(() => document.querySelector(".bk-bi").dataset.lang);
    const op = await still.evaluate(() => +getComputedStyle(document.querySelector(".bk-prose")).opacity);
    check("[reduced motion] the switch is immediate, not held for a fade",
      mode === "en" && Date.now() - t0 < 120, mode + " after " + (Date.now() - t0) + "ms");
    check("[reduced motion] ...and nothing is left faded out", op > 0.95, String(op));
    await still.close();
  }

  await browser.close();
  server.close();

  /* styles.css @imports the Google Fonts stylesheet and boot asks Supabase for the content overrides;
     no sandbox reaches either, so every run reports a handful of failures that say nothing about this
     code. Filtered by the same reasoning the other suites filter favicon/manifest noise: a real fault
     in the Library would name a file in it.

     HOW AN UNREACHABLE HOST IS SPELLED DEPENDS ON THE SANDBOX, NOT ON THE FAULT. This list was
     written against ERR_CONNECTION_RESET and the run after a container restart reported exactly the
     same two URLs — measured, not assumed — as ERR_CERT_AUTHORITY_INVALID, the egress proxy having
     come back presenting a certificate Chromium will not accept. One environment change, one red
     assertion, and nothing wrong with the Library. Match the whole family. */
  const real = errs.filter((e) => !/favicon|manifest|sw\.js|ServiceWorker|fonts\.(googleapis|gstatic)|ERR_CONNECTION_RESET|ERR_NAME_NOT_RESOLVED|ERR_CERT_|ERR_PROXY_|ERR_TUNNEL_CONNECTION_FAILED|ERR_INTERNET_DISCONNECTED/i.test(e));
  check("no console errors anywhere", real.length === 0, real.slice(0, 3).join(" | "));

  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
