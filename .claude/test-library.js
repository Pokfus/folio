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
    p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
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
    /* …and there is no #decks TAB at all any more (Aug 2026, on request): Collections left the phone's bar
       first and the desktop's a fortnight later, and is reached from the "+ Add decks" lip under the daily
       review. So the assertion the rename needs is the pair — no tab called Collections, and none called
       Library except the books one, which is what "two pages called Library" was ever about. The ROUTE is
       asserted above, and separately: every #decks link ever shared still has to resolve. */
    check("...and no tab claims the collections at all — the home page's lip is the way in",
      !d.tabs.some((t) => t.r === "decks"), JSON.stringify(d.tabs));
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

  /* styles.css @imports the Google Fonts stylesheet, which no sandbox reaches — every run reports a
     handful of connection resets that say nothing about this code. Filtered by the same reasoning the
     other suites filter favicon/manifest noise: a real fault in the Library would name a file in it. */
  const real = errs.filter((e) => !/favicon|manifest|sw\.js|ServiceWorker|fonts\.(googleapis|gstatic)|ERR_CONNECTION_RESET|ERR_NAME_NOT_RESOLVED/i.test(e));
  check("no console errors anywhere", real.length === 0, real.slice(0, 3).join(" | "));

  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
