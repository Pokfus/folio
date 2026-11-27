#!/usr/bin/env node
/* .claude/find-card-quotes.js — WHERE A CARD COULD QUOTE A BOOK ON THE SHELF (Nov 2026, the Library audit).

     node .claude/find-card-quotes.js                 # the summary, per collection
     node .claude/find-card-quotes.js --book=<id>     # only what ONE book offers (what fetch-book runs for a new book)
     node .claude/find-card-quotes.js --prefix=rm-    # one collection, every candidate
     node .claude/find-card-quotes.js --json=<file>   # every candidate, for a batch to be written from
     node .claude/find-card-quotes.js --md=<file>     # the report docs/library-card-quotes.md is made from

   `card.quote = { book, n, text, cite }` puts a passage of a Library book under a card, and
   `add-card-quotes.js` refuses any transcription that is not in the section it names. What nothing
   did was say WHICH cards have a passage waiting for them. This does, and only that:

   IT FINDS PLACES, NEVER PASSAGES. "The passage is authored, never extracted" is the rule
   add-card-quotes.js states and this tool keeps: a candidate is a card, a book and a section, with
   the sentence that made it a candidate printed so a writer can judge it — choosing the words to
   quote, and deciding whether the section says anything worth quoting, is the writer's.

   Two kinds of candidate, in order of how sure they are:

     CITED — the card's own sources already cite a book that is on the shelf (its author and, where
       the author has several books here, its title), usually with the passage's number. The card's
       writer has already said "this is where it comes from"; only the quotation is missing.
     NAMED — the card's answer is named in a book that could be a source for it: a book written no
       later than a generous lifetime after the card's own date line, in the tradition the card
       belongs to. The answer must be a NAME (a capital, two words or more, or a long single word),
       must stand in the book at least twice, and a book that names it in a quarter of its chapters
       is preferred to one that mentions it once.

   Only the history and science collections are read (HISTORY_SCIENCE below); a geography or flag
   card has no passage to quote. A card that already carries a quote is skipped.

   Not part of the site. Reads the shipped books and cards; needs no network. */

const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
const arg = (k) => (args.find((a) => a.startsWith("--" + k + "=")) || "").slice(k.length + 3);
const ONLY_BOOK = arg("book"), PREFIX = arg("prefix"), JSON_OUT = arg("json"), MD_OUT = arg("md");

/* prefix → what the collection is, and which book traditions can be a source for it (null = any) */
const HISTORY_SCIENCE = {
  "wh-": ["World History", null], "gr-": ["Ancient Greece", null], "rm-": ["Ancient Rome", null], "eg-": ["Ancient Egypt", null],
  "cnh-": ["China", null], "in-": ["India", null], "ru-": ["Russia", null], "us-": ["United States", null], "jp-": ["Japan", null],
  "ko-": ["Korea", null], "ww2-": ["The Second World War", null], "hs-": ["Historical States", null],
  "ps-": ["Psychology", null], "phi-": ["Philosophy", null], "bio-": ["Biology", null], "pal-": ["Palaeontology", null],
  "astro-": ["Astronomy", null], "ec-": ["Economics", null],
};

const { loadCards } = require("./card-io.js");
const loaded = loadCards(); const cards = loaded.cards || loaded;
const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const a0 = app.indexOf("\n  const BOOKS = ["), a1 = app.indexOf("\n  ];", a0);
const BOOKS = (0, eval)(app.slice(app.indexOf("[", a0), a1 + 4));
const g0 = app.indexOf("/* <gloss-date-rule> */"), g1 = app.indexOf("/* </gloss-date-rule> */");
const { glossTermStart, bookLastYear } = (0, eval)("(function(){" + app.slice(g0, g1) + "; return { glossTermStart, bookLastYear }; })()");

global.window = { FOLIO_BOOKS_IN: [], FOLIO_BOOK_ORIG_IN: [] };
for (const b of BOOKS) { if (ONLY_BOOK && b.id !== ONLY_BOOK) continue; try { require(path.join(ROOT, "books", b.id + ".js")); } catch (e) {} }
const TEXT = {};
const plain = (h) => String(h || "").replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/g, "").replace(/<span class="bk-n"[^>]*>[\s\S]*?<\/span>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/\s+/g, " ");
for (const b of window.FOLIO_BOOKS_IN) TEXT[b.id] = b.chapters.map((c) => ({ n: c.n, t: c.t, x: plain(c.html) }));

/* how a source line names a shelved book: the author's surname, and the title where one author has several */
const byAuthor = {};
for (const b of BOOKS) { if (!TEXT[b.id]) continue; const a = b.author === "Anonymous" ? null : b.author.split(/ of | and /)[0].split(" ").pop(); if (a && a.length > 2) (byAuthor[a] = byAuthor[a] || []).push(b); }
/* how else a citation names a shelved book, beyond its title and subtitle */
const ALSO = {
  "seneca-letters": ["Epistles", "Epistulae", "Moral Letters", "Letters to Lucilius"], "plutarch-lives": ["Life of ", "Lives"],
  "tacitus-annals": ["Annals"], "caesar-gallic-war": ["Gallic War", "Bellum Gallicum", "Bello Gallico"], "suetonius-twelve-caesars": ["Lives of the Caesars", "Life of ", "Divus "],
  "cassius-dio-roman-history": ["Roman History"], "augustus-res-gestae": ["Res Gestae"], "king-james-bible": ["King James"], "summa-theologica": ["Summa"],
  "breasted-ancient-records": ["Ancient Records"], "erman-egyptian-literature": ["Literature of the Ancient Egyptians"], "confucius-analects": ["Analects"],
  "russian-primary-chronicle": ["Primary Chronicle", "Tale of Bygone Years"], "novgorod-chronicle": ["Chronicle of Novgorod"], "marco-polo": ["Travels"],
};
const TITLE_KEYS = (b) => [b.title, b.subtitle].filter(Boolean).map((t) => t.replace(/^(?:The|A|An|On the|On) /, "")).filter((t) => t.length > 5).concat(ALSO[b.id] || []);
/* authors of whom a bare citation ("Herodotus 7.210") can only mean the work on the shelf — NOT Aristotle,
   Plutarch, Tacitus, Seneca, Ovid, Caesar or the dramatists, who each left other works a card may cite */
const ONE_WORK = new Set(["Herodotus", "Thucydides", "Livy", "Polybius", "Siculus", "Strabo", "Pausanias", "Lucretius", "Apollodorus", "Petronius", "Dio"]);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* A SOURCE LINE CITES A SHELVED BOOK when it opens on the author — the full name, or the surname and a
   comma — and names the book; or, for an author with one work here written before 1500, opens on the
   name alone ("Herodotus 7.210" is the Histories). The first run asked only for the surname and filed
   "James L. McClain, Japan: A Modern History" under William James eighty times. */
function citedBooks(card) {
  const out = [];
  const src = (card.sources || []).map((s) => (typeof s === "string" ? s : s && (s.text || s.t || "")) || "").map((s) => s.replace(/<[^>]+>/g, ""));
  for (const line of src) {
    const low = line.toLowerCase();
    for (const a of Object.keys(byAuthor)) {
      const list = byAuthor[a];
      const opens = list.some((x) => line.trimStart().startsWith(x.author + ",") || line.trimStart().startsWith(x.author + " ")) || new RegExp("^\\s*" + esc(a) + "[,’']").test(line);
      const titled = list.filter((x) => TITLE_KEYS(x).some((t) => low.includes(t.toLowerCase())));
      let b = null;
      if (opens && titled.length) b = titled[0];
      else if (opens && list.length === 1 && ONE_WORK.has(a)) b = list[0];
      else if (!opens && titled.length && new RegExp("(?:^|[\\s(“\"])" + esc(a) + "(?:[\\s,.:;’']|$)").test(line) && /\b\d{1,3}\.\d{1,3}\b/.test(line)) b = titled[0];
      if (!b) continue;
      const loc = /\b(\d{1,3})\.(\d{1,3})(?:\.(\d{1,3}))?\b/.exec(line.slice(Math.max(0, line.indexOf(a))));
      out.push({ book: b.id, loc: loc ? loc[0] : "", line: line.slice(0, 160) });
    }
    /* an anonymous work is cited by its title alone: "Beowulf 2200–2210", "Magna Carta, ch. 39" */
    for (const x of BOOKS) {
      if (x.author !== "Anonymous" || !TEXT[x.id]) continue;
      if (TITLE_KEYS(x).some((t) => line.trimStart().toLowerCase().startsWith(t.toLowerCase()) || line.trimStart().toLowerCase().startsWith("the " + t.toLowerCase())))
        out.push({ book: x.id, loc: (/\b(\d{1,3})\.(\d{1,3})\b/.exec(line) || [""])[0], line: line.slice(0, 160) });
    }
  }
  return out;
}
/* the section a "7.210" points at, where the book's chapters are its Books */
function sectionOf(bookId, loc) {
  const ch = TEXT[bookId]; if (!ch || !loc) return null;
  const n = +loc.split(".")[0];
  return ch.find((c) => c.n === n) || null;
}
const cardYear = (c) => { const m = /class="dt-v">([^<]*)</.exec(c.answerDate || ""); const d = m ? m[1] : String(c.answerDate || "").replace(/<[^>]+>/g, " "); const y = d ? glossTermStart(d) : null; return y != null && y > -100000 ? y : null; };
const isName = (s) => /^[A-Z]/.test(s) && (/\s/.test(s) ? s.length >= 7 : s.length >= 6) && !/^(?:The|A|An) [a-z]/.test(s);

const out = [];
for (const c of cards) {
  const pre = Object.keys(HISTORY_SCIENCE).find((p) => c.id.startsWith(p));
  if (!pre || c.quote) continue;
  if (PREFIX && !c.id.startsWith(PREFIX)) continue;
  const ans = String(c.answer || "").replace(/\s*\([^)]*\)/g, "").trim();
  // CITED
  const seen = new Set();
  for (const cb of citedBooks(c)) {
    if (seen.has(cb.book)) continue; seen.add(cb.book);
    const sec = sectionOf(cb.book, cb.loc);
    let ctx = "";
    if (sec && isName(ans)) { const k = sec.x.indexOf(ans); if (k >= 0) ctx = sec.x.slice(Math.max(0, k - 110), k + ans.length + 130).trim(); }
    out.push({ kind: "cited", id: c.id, coll: HISTORY_SCIENCE[pre][0], answer: ans, book: cb.book, n: sec ? sec.n : null, loc: cb.loc, ctx, src: cb.line });
  }
  // NAMED
  if (!isName(ans)) continue;
  const cy = cardYear(c);
  let best = null;
  const re = new RegExp("(?:^|[^A-Za-z])" + esc(ans) + "(?![A-Za-z])", "g");
  for (const b of BOOKS) {
    const ch = TEXT[b.id]; if (!ch || seen.has(b.id)) continue;
    // a source is written within a long lifetime of the thing, or is itself what the card is about
    if (cy != null && bookLastYear(b) < cy - 5) continue;                 // the book is older than the card's subject
    let hits = 0, chapters = 0, first = null;
    for (const s of ch) { const m = s.x.match(re); if (m) { hits += m.length; chapters++; if (!first) first = s; } }
    if (hits < 2) continue;
    const near = cy == null ? 0.5 : Math.max(0, 1 - Math.abs(b.year - cy) / 600);   // a contemporary beats a late compiler
    const score = Math.log2(1 + hits) * (0.4 + near) * (0.6 + Math.min(1, chapters / Math.max(4, ch.length / 4)));
    if (!best || score > best.score) { const k = first.x.search(re); best = { score, book: b.id, n: first.n, hits, chapters, ctx: first.x.slice(Math.max(0, k - 110), k + ans.length + 130).trim() }; }
  }
  if (best && best.score >= 1.6) out.push({ kind: "named", id: c.id, coll: HISTORY_SCIENCE[pre][0], answer: ans, book: best.book, n: best.n, hits: best.hits, chapters: best.chapters, ctx: best.ctx, score: +best.score.toFixed(2) });
}

/* ---------- the report ---------- */
const colls = {};
for (const c of cards) { const pre = Object.keys(HISTORY_SCIENCE).find((p) => c.id.startsWith(p)); if (!pre) continue; const k = HISTORY_SCIENCE[pre][0]; const r = colls[k] = colls[k] || { cards: 0, quoted: 0, cited: new Set(), named: new Set() }; r.cards++; if (c.quote) r.quoted++; }
for (const x of out) colls[x.coll][x.kind].add(x.id);
const title = (id) => (BOOKS.find((b) => b.id === id) || {}).title || id;
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(out));
const lines = [];
lines.push("collection".padEnd(24) + "cards".padStart(6) + "  quoted".padStart(8) + "  cite a shelved book".padStart(21) + "  named in a book".padStart(18));
for (const k of Object.keys(colls)) { const r = colls[k]; lines.push(k.padEnd(24) + String(r.cards).padStart(6) + String(r.quoted).padStart(8) + String(r.cited.size).padStart(21) + String([...r.named].filter((id) => !r.cited.has(id)).length).padStart(18)); }
if (!MD_OUT && !ONLY_BOOK && !PREFIX) console.log(lines.join("\n"));
if (ONLY_BOOK || PREFIX) {
  const list = out.filter((x) => !ONLY_BOOK || x.book === ONLY_BOOK);
  console.log(list.length + " card(s) could quote " + (ONLY_BOOK ? title(ONLY_BOOK) : "a book") + ":");
  for (const x of list.sort((p, q) => (p.kind < q.kind ? -1 : p.kind > q.kind ? 1 : (q.score || 0) - (p.score || 0))).slice(0, 400))
    console.log("  " + x.kind.padEnd(6) + x.id.padEnd(10) + x.answer.slice(0, 34).padEnd(36) + (x.book + (x.n != null ? " §" + x.n : "") + (x.loc ? " (" + x.loc + ")" : "")).padEnd(40) + (x.ctx ? "…" + x.ctx.slice(60, 190) + "…" : ""));
}
if (MD_OUT) {
  const md = [];
  const byBook = {};
  for (const x of out) (byBook[x.book] = byBook[x.book] || { cited: [], named: [] })[x.kind].push(x);
  md.push("| collection | cards | already quote a book | cite a shelved book, unquoted | answer named in a book |", "|---|---:|---:|---:|---:|");
  for (const k of Object.keys(colls)) { const r = colls[k]; md.push("| " + k + " | " + r.cards + " | " + r.quoted + " | " + r.cited.size + " | " + [...r.named].filter((id) => !r.cited.has(id)).length + " |"); }
  md.push("", "### By book", "", "| book | cards citing it, unquoted | cards whose answer it names |", "|---|---:|---:|");
  for (const id of Object.keys(byBook).sort((p, q) => (byBook[q].cited.length * 3 + byBook[q].named.length) - (byBook[p].cited.length * 3 + byBook[p].named.length))) md.push("| " + title(id) + " (`" + id + "`) | " + byBook[id].cited.length + " | " + byBook[id].named.length + " |");
  md.push("", "### The cards that already cite a shelved book", "", "Each names the passage in its own sources; `§` is the chapter tab the passage falls in.", "", "| card | answer | book | passage |", "|---|---|---|---|");
  for (const x of out.filter((x) => x.kind === "cited").sort((p, q) => p.id.localeCompare(q.id, undefined, { numeric: true }))) md.push("| `" + x.id + "` | " + x.answer.replace(/\|/g, "/") + " | " + title(x.book) + " | " + (x.loc || "—") + (x.n != null ? " (§" + x.n + ")" : "") + " |");
  md.push("", "### The strongest of the cards whose answer a book names", "", "The top 300 by score; the rest are in the JSON. The score weighs how often the book names the answer, in how many of its chapters, and how near the book stands to the card's own date.", "", "| card | answer | book | § | times named | the sentence that names it first |", "|---|---|---|---:|---:|---|");
  for (const x of out.filter((x) => x.kind === "named").sort((p, q) => q.score - p.score).slice(0, 300)) md.push("| `" + x.id + "` | " + x.answer.replace(/\|/g, "/") + " | " + title(x.book) + " | " + x.n + " | " + x.hits + " | …" + x.ctx.slice(50, 210).replace(/\|/g, "/") + "… |");
  fs.writeFileSync(MD_OUT, md.join("\n") + "\n");
}
if (!ONLY_BOOK && !PREFIX) console.log("\n" + out.filter((x) => x.kind === "cited").length + " cited and " + out.filter((x) => x.kind === "named").length + " named candidates" + (JSON_OUT ? "; wrote " + JSON_OUT : "") + (MD_OUT ? "; wrote " + MD_OUT : "") + ".\nA candidate is a place to look. The passage is authored, never extracted (add-card-quotes.js).");
