#!/usr/bin/env node
/* .claude/book-emend.js — THE LAST THING DONE TO A BOOK BEFORE IT IS WRITTEN (Nov 2026, the Library audit).

     node .claude/book-emend.js --check            # CI: every row applied, every book in the house form
     node .claude/book-emend.js --apply <id>…      # bring shipped books/<id>.js up to the table, in place
     node .claude/book-emend.js --apply --all
     node .claude/book-emend.js --list <id>        # the rows of one book

   Two things live here, and fetch-book.js `require`s this file so that the importer and the
   in-place tool cannot disagree about either:

   1. THE EMENDATIONS — `.claude/book-emend.json`, `{ "<bookId>": [ { ch, in, from, to, kind, why } ] }`.
      A row says: in chapter `ch`, in its `text`, a `note` or its `title`, the string `from` stands
      once and should read `to`.

      THIS IS NOT THE `fixes` TABLE AND MUST NOT BECOME IT. A `fixes` row in fetch-book.js asserts
      "THE PRINTED PAGE READS X AND THIS TRANSCRIPTION READS Y" and is made with the page in hand.
      An emendation asserts less and says so: "NO PRINTING CAN HAVE MEANT THIS" — a doubled `the the`,
      `tbe`, `accompained`, a digit inside a word — wherever the fault arose, the scan, the typist or
      the 1890s compositor. The owner asked for exactly that in Nov 2026 ("spelling mistakes …
      mistranscriptions, copied source misprints"), and the page was NOT read for these rows, which is
      why they are a second table with a second count and a second sentence on the book's first page
      (`emended: N` in the shipped file; `bookIntroChapter` prints it). A row whose page HAS been
      read belongs in `fixes`, with its witness.

      THE BAR: `certainty: "certain"` only — no other reading is possible. A period spelling, a
      dialect form, the translator's own choice, a name, a quoted foreign line are never touched.
      Rows a reviewer marked "probable" are kept in `.claude/book-emend-probable.json`, which nothing
      applies: they wait for a page.

      IT RUNS AT THE WRITE, ON THE FINISHED CHAPTER — after `fixes`, `reFixes`, `roman` and every
      extractor — because a row is written against the text a reader was actually sent. That is
      also what lets `--apply` put a new row into a shipped file without refetching the book: the
      importer's last step and this tool's only step are the same function on the same input.

      EVERY ROW MUST BE ACCOUNTED FOR. On a fresh import `from` must occur exactly once (it fires);
      in a file already brought up to date `from` is gone and `to` stands (it is applied). Anything
      else — the source was re-transcribed, the chapter re-cut — is reported, and `--check` exits 1.

   2. THE HOUSE FORM — what every book's FORM shares whatever its edition printed:
        · a chapter title set in capitals is given in title case ("THE DESPONDENCY OF ARJUNA" →
          "The Despondency of Arjuna"): three books shouted from the chapter bar and 98 did not;
        · a chapter title does not end in a full stop (the Analects' "Xue Er.", Marco Polo's 232);
        · a typewriter's `--` is the dash it stands for, `—` (four books, 1,800 of them).
      Capitals and a stop after a heading are the printer's dress, not the author's words; nothing
      else about a title is touched ("Transcribe a title, never compose one").
      Straight quotation marks are NOT changed here: the reader page curls them as it paints
      (`bookQuotes` in app.js), one-for-one, so no stored highlight moves.

   Not part of the site. */

const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const TABLE = path.join(__dirname, "book-emend.json");

/* ---------- the importer's own serialisation, shared so the two cannot drift ---------- */
function esc(s) { return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n"); }
function chapterLine(c) {
  return "    { n: " + c.n + ", p: " + c.p + ', t: "' + esc(c.t) + '", html: "' + esc(c.html) + '"' +
    (c.notes && c.notes.length ? ", notes: [" + c.notes.map((x) => '"' + esc(x) + '"').join(", ") + "]" : "") + " },";
}

/* ---------- the house form ---------- */
const SMALL = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into", "nor", "of", "on", "or", "the", "to", "upon", "with"]);
function titleCase(t) {
  let first = true;
  return t.replace(/[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’]*/g, (w) => {
    const l = w.toLowerCase(), wasFirst = first; first = false;
    if (/^[IVXLCDM]+$/.test(w) && w.length > 1 && /^(?:M{0,3})(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/.test(w) && !/^(?:MIX|MILD|DIM|LID|MID|DID|CIVIL|LIVID|VIVID|MIMIC|DILL|MILL|VIM|MI|DI|LI|XI)$/.test(w) ) return w;   // a roman numeral stays
    if (!wasFirst && SMALL.has(l)) return l;
    return l.charAt(0).toUpperCase() + l.slice(1);
  });
}
function houseTitle(t) {
  let s = String(t);
  const letters = s.replace(/[^A-Za-z]/g, "");
  // set in capitals: at least four letters and none of them small (a prefix such as "I.1" has none)
  if (letters.length >= 4 && letters === letters.toUpperCase()) s = titleCase(s);
  // a heading's closing stop — but not an abbreviation's ("&c.", "etc.") and not an ellipsis
  if (/[^.]\.$/.test(s) && !/(?:&c|etc|[A-Z])\.$/.test(s)) s = s.slice(0, -1);
  return s;
}
/* `--` between words is a dash typed on a machine with none. Only in text, never inside a tag. */
function houseDashes(html) {
  if (html.indexOf("--") < 0) return html;
  return html.replace(/(<[^>]*>)|-{2,3}(?!-)/g, (m, tag, off, all) => {
    if (tag) return tag;
    if (all[off - 1] === "-" ) return m;                       // part of a longer rule of hyphens
    return "—";
  });
}
/* A BOOK THAT TYPES ITS DASHES AS `--` DOES IT EVERYWHERE; A BOOK WITH THREE IS NOT TYPING DASHES.
   Measured over the shelf: the Summa has 1,487, Thucydides 182, the Rigveda 123, the Divine Comedy
   14 — and the handful elsewhere are each something else (a figure of three strokes in William
   James, the tail of an HTML comment in Polybius, a scanner's noise in Breasted and the Novgorod
   chronicle). So the rule converts only where the book has ten or more, and a stray pair is an
   emendation row with its own reason. */
const DASH_FLOOR = 10;
function houseForm(chapters) {
  let titles = 0, dashes = 0;
  const pairs = chapters.reduce((a, c) => a + (c.html.match(/--/g) || []).length + (c.notes || []).reduce((x, n) => x + (n.match(/--/g) || []).length, 0), 0);
  for (const c of chapters) {
    const t = houseTitle(c.t); if (t !== c.t) { c.t = t; titles++; }
    if (pairs < DASH_FLOOR) continue;
    const h = houseDashes(c.html); if (h !== c.html) { dashes += (c.html.match(/--/g) || []).length; c.html = h; }
    if (c.notes) c.notes = c.notes.map((n) => { const x = houseDashes(n); if (x !== n) dashes += (n.match(/--/g) || []).length; return x; });
  }
  return { titles, dashes };
}

/* ---------- the emendations ---------- */
function loadTable() { try { return JSON.parse(fs.readFileSync(TABLE, "utf8")); } catch (e) { return {}; } }
const count = (hay, needle) => { let n = 0, k = hay.indexOf(needle); while (k >= 0) { n++; k = hay.indexOf(needle, k + needle.length); } return n; };
/* One row against one chapter. Returns "fired" | "applied" | a sentence saying what is wrong. */
function emendRow(c, row) {
  const where = row.in || "text";
  const parts = where === "title" ? [c.t] : where === "note" ? (c.notes || []) : [c.html];
  const nFrom = parts.reduce((a, p) => a + count(p, row.from), 0);
  let nTo = parts.reduce((a, p) => a + count(p, row.to), 0);
  /* THE HOUSE FORM RUNS AFTER THIS, so in a file already written the corrected words may stand in
     their house dress: a title in title case without its stop, a `--` as a dash. A row whose `to`
     stands that way is applied. */
  if (!nTo && !nFrom) {
    if (where === "title") { if (c.t.toLowerCase().includes(row.to.toLowerCase().replace(/\.$/, ""))) nTo = 1; }
    else { const dressed = houseDashes(row.to); if (dressed !== row.to) nTo = parts.reduce((a, p) => a + count(p, dressed), 0); }
  }
  const put = () => {
    const i = parts.findIndex((p) => p.includes(row.from));
    const next = parts[i].replace(row.from, () => row.to);
    if (where === "title") c.t = next; else if (where === "note") c.notes[i] = next; else c.html = next;
    return "fired";
  };
  if (row.from === row.to || !row.from) return "the row changes nothing";
  /* an INSERTION: `from` is inside `to` ("wc uld" would be the other kind; "Tristram.And" →
     "Tristram. And" is this one), so once applied `from` still stands, inside `to` */
  if (row.to.includes(row.from)) {
    if (nTo >= 1) return "applied";
    return nFrom === 1 ? put() : nFrom === 0 ? "neither `from` nor `to` stands in the " + where : "`from` stands " + nFrom + " times in the " + where + " — it must be unique";
  }
  /* everything else, a DELETION included ("the the priest" → "the priest": `to` is inside `from`
     and so stands before the row has fired — which is why `from` is asked first) */
  if (nFrom === 1) return put();
  if (nFrom === 0) return nTo >= 1 ? "applied" : "neither `from` nor `to` stands in the " + where;
  return "`from` stands " + nFrom + " times in the " + where + " — it must be unique";
}
function applyEmend(id, chapters, table) {
  const rows = (table || loadTable())[id] || [];
  const byN = new Map(chapters.map((c) => [String(c.n), c]));
  const out = { rows: rows.length, fired: 0, applied: 0, bad: [] };
  for (const row of rows) {
    const c = byN.get(String(row.ch));
    if (!c) { out.bad.push({ row, why: "the book ships no chapter " + row.ch }); continue; }
    const r = emendRow(c, row);
    if (r === "fired") out.fired++; else if (r === "applied") out.applied++; else out.bad.push({ row, why: r });
  }
  return out;
}
/* What fetch-book.js calls from `writeEnglish`, on the finished chapters, just before it serialises. */
function finish(id, chapters, opts) {
  const em = applyEmend(id, chapters);
  const hf = (opts && opts.keepForm) ? { titles: 0, dashes: 0 } : houseForm(chapters);
  return { emend: em, form: hf, emended: em.fired + em.applied };
}

module.exports = { esc, chapterLine, houseTitle, houseDashes, houseForm, titleCase, applyEmend, finish, loadTable };

/* ---------- the tool ---------- */
if (require.main === module) {
  const args = process.argv.slice(2);
  const ALL = args.includes("--all"), APPLY = args.includes("--apply"), CHECK = args.includes("--check"), LIST = args.includes("--list");
  const ids = args.filter((a) => !a.startsWith("--"));
  const table = loadTable();
  const DIR = path.join(ROOT, "books");
  const every = fs.readdirSync(DIR).filter((f) => /^[a-z0-9-]+\.js$/.test(f)).map((f) => f.slice(0, -3));
  if (LIST) { for (const id of ids) for (const r of table[id] || []) console.log(id + " ch" + r.ch + " " + (r.in || "text") + ": " + JSON.stringify(r.from) + " → " + JSON.stringify(r.to) + "  [" + r.kind + "] " + r.why); process.exit(0); }
  if (!APPLY && !CHECK) { console.log("usage: node .claude/book-emend.js --check | --apply <id>… | --apply --all | --list <id>"); process.exit(0); }
  for (const id of Object.keys(table)) if (!every.includes(id)) { console.log("book-emend.json names " + id + ", which is not a shipped book"); process.exitCode = 1; }
  const todo = CHECK || ALL ? every : ids;
  let bad = 0, changed = 0;
  for (const id of todo) {
    const file = path.join(DIR, id + ".js");
    const lines = fs.readFileSync(file, "utf8").split("\n");
    const idx = [], chapters = [];
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].startsWith("    { n: ")) continue;
      let c;
      try { c = (0, eval)("(" + lines[i].replace(/,\s*$/, "") + ")"); } catch (e) { console.log(id + ": line " + (i + 1) + " is not a chapter record this tool can read: " + e.message); bad++; continue; }
      c.notes = c.notes || [];
      /* THE ROUND TRIP. If re-serialising an untouched chapter does not give back the line it was
         read from, this tool's writer is not the importer's, and it must not write anything. */
      if (chapterLine(c) !== lines[i]) { console.log(id + ": chapter " + c.n + " does not round-trip through the serialiser — refusing to touch this book"); bad++; idx.length = 0; chapters.length = 0; break; }
      idx.push(i); chapters.push(c);
    }
    if (!chapters.length) continue;
    const before = chapters.map(chapterLine);
    const res = finish(id, chapters);
    for (const b of res.emend.bad) { bad++; console.log(id + " ch" + b.row.ch + " " + (b.row.in || "text") + ": " + JSON.stringify(b.row.from) + " → " + JSON.stringify(b.row.to) + "\n      " + b.why); }
    const after = chapters.map(chapterLine);
    const diff = after.filter((l, k) => l !== before[k]).length;
    const idLine = lines.findIndex((l) => l === '  id: "' + id + '",');
    const emLine = lines.findIndex((l) => /^  emended: \d+,$/.test(l));
    const want = res.emended ? "  emended: " + res.emended + "," : null;
    const have = emLine >= 0 ? lines[emLine] : null;
    if (CHECK) {
      if (diff) { bad++; console.log(id + ": " + diff + " chapter(s) are not in the form this tool writes (" + res.emend.fired + " row(s) not yet applied, " + res.form.titles + " title(s), " + res.form.dashes + " `--`) — run: node .claude/book-emend.js --apply " + id); }
      if (want !== have) { bad++; console.log(id + ": the file says " + (have || "no `emended`") + " and the table gives " + (want || "none")); }
      continue;
    }
    if (!diff && want === have) continue;
    after.forEach((l, k) => { lines[idx[k]] = l; });
    if (want && emLine >= 0) lines[emLine] = want;
    else if (want) lines.splice(idLine + 1, 0, want);
    else if (emLine >= 0) lines.splice(emLine, 1);
    fs.writeFileSync(file, lines.join("\n"));
    changed++;
    console.log(id + ": " + res.emend.fired + " emendation(s) applied now, " + res.emend.applied + " already in; " + res.form.titles + " title(s) and " + res.form.dashes + " dash(es) put in the house form; " + diff + " chapter line(s) rewritten.");
  }
  if (CHECK) console.log(bad ? "\n" + bad + " finding(s)." : "book-emend: " + Object.values(table).reduce((a, r) => a + r.length, 0) + " emendation(s) in " + Object.keys(table).length + " book(s), all applied; every book is in the house form.");
  else console.log(changed + " file(s) written." + (bad ? " " + bad + " row(s) could not be placed." : ""));
  process.exit(bad ? 1 : 0);
}
