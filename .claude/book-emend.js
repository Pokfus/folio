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
/* A RULE is an entry with `re` in place of `ch`/`from`: a fault that repeats by a pattern no row
   could list sensibly — Livy's 600 line-break hyphens are rows (each needs a dictionary to know the
   word), but the Summa's 889 link serials "([4311]Q[13]" and the Song of Roland's 128 page-break
   marks are one expression each. `{ re, flags, to, in: "text"|"note"|"both", n, kind, why }`; `n` is
   how many times it fired when it was written, which is what it adds to the book's `emended` count.
   A rule must be IDEMPOTENT (what it writes it does not match), so applying it twice is applying it
   once; it has no "applied" test of its own, which is one reason for the lock below. */
function emendRule(chapters, rule) {
  const re = new RegExp(rule.re, rule.flags || "g"); let k = 0;
  const sub = (h) => h.replace(re, (...m) => { k++; return rule.to.replace(/\$(\d)/g, (x, d) => m[+d] == null ? "" : m[+d]); });
  const where = rule.in || "both";
  for (const c of chapters) {
    if (rule.ch != null && String(c.n) !== String(rule.ch)) continue;
    if (where !== "note") c.html = sub(c.html);
    if (where !== "text" && c.notes) c.notes = c.notes.map(sub);
  }
  return k;
}
function applyEmend(id, chapters, table, start) {
  const rows = (table || loadTable())[id] || [];
  const byN = new Map(chapters.map((c) => [String(c.n), c]));
  const out = { rows: rows.length, fired: 0, applied: 0, bad: [], count: rows.reduce((a, r) => a + (r.re ? (r.n | 0) : 1), 0) };
  rows.forEach((row, i) => {
    if (i < (start | 0)) { out.applied++; return; }
    if (row.re) { const k = emendRule(chapters, row); if (k) out.fired++; else out.applied++; out.ruleHits = (out.ruleHits || 0) + k; return; }
    const c = byN.get(String(row.ch));
    if (!c) { out.bad.push({ row, why: "the book ships no chapter " + row.ch }); return; }
    const r = emendRow(c, row);
    if (r === "fired") out.fired++; else if (r === "applied") out.applied++; else out.bad.push({ row, why: r });
  });
  return out;
}
/* THE LOCK — `.claude/book-emend.lock.json`, `{ "<id>": { entries: N, sha: "…" } }`: the digest of a
   book's chapters as this tool last left them, and how many of its entries were in by then.
   Entries are applied IN ORDER and a later one is written against the text the earlier ones left,
   so a later entry can change words an earlier entry's `to` contained — and then "is `to` there?"
   wrongly says the earlier one is missing. The lock answers the question the row test cannot: a
   file whose digest is the lock's HAS its first N entries in, whatever they now look like, and only
   the entries after N are applied to it. A fresh import has another digest, runs every entry from
   the first, and must arrive at the lock's digest — which is how a re-import is known to reproduce
   the audited text exactly. */
const LOCK = path.join(__dirname, "book-emend.lock.json");
const digest = (chapters) => require("crypto").createHash("sha256").update(chapters.map(chapterLine).join("\n")).digest("hex").slice(0, 24);
function loadLock() { try { return JSON.parse(fs.readFileSync(LOCK, "utf8")); } catch (e) { return {}; } }
/* ---------- the glossary keys a book must not link ----------
   `.claude/book-gloss-off.json`, `{ never: [key…], books: { "<id>": { off: [[key, why]…], offIn: [[key, [chapters], why]…] } } }`
   — the reviewed result of sweeping every link the reader draws (.claude/book-gloss-sweep.js, Nov 2026).
   It is written into the book's OWN lazy file (`glossOff` / `glossOffIn` beside `emended`), not into
   app.js's eager registry: 2,000 keys nobody needs until a book is open do not belong on the boot path.
   The registry rows keep their hand lists; the reader adds the two together (`bookGlossOff`).
   There is deliberately NO shelf-wide list: a key wrong in every old book ("Stratum", "Cell", "Amazon
   River" from a capitalised common word) is right in the next book of geology. The sweep instead
   prints a key that is off in three other books under its own heading when a new book draws it. */
const GLOSS_TABLE = path.join(__dirname, "book-gloss-off.json");
function loadGlossOff() { try { return JSON.parse(fs.readFileSync(GLOSS_TABLE, "utf8")); } catch (e) { return { books: {} }; } }
/* the lines that follow `id:` in a book's file, in the one order both writers use */
function fileFields(id, emended, glossTable) {
  const g = ((glossTable || loadGlossOff()).books || {})[id] || {};
  const out = [];
  if (emended) out.push("  emended: " + emended + ",");
  if (g.off && g.off.length) out.push("  glossOff: " + JSON.stringify(g.off.map((r) => r[0])) + ",");
  if (g.offIn && g.offIn.length) { const o = {}; g.offIn.forEach((r) => { o[r[0]] = r[1]; }); out.push("  glossOffIn: " + JSON.stringify(o) + ","); }
  return out;
}
/* What fetch-book.js calls from `writeEnglish`, on the finished chapters, just before it serialises. */
function finish(id, chapters, opts) {
  const lock = loadLock()[id], before = digest(chapters);
  const sealed = !!(lock && lock.sha === before);
  const em = applyEmend(id, chapters, null, sealed ? lock.entries : 0);
  const hf = (opts && opts.keepForm) ? { titles: 0, dashes: 0 } : houseForm(chapters);
  const emended = em.count, sha = digest(chapters);
  /* a fresh import that ran every entry and did not land on the lock's digest has not reproduced the audited text */
  const drift = !!(lock && !sealed && lock.entries === em.rows && sha !== lock.sha);
  return { emend: em, form: hf, emended, fields: fileFields(id, emended), sha, sealed, drift, lock };
}

module.exports = { esc, chapterLine, houseTitle, houseDashes, houseForm, titleCase, applyEmend, finish, loadTable, loadGlossOff, fileFields, loadLock, digest };

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
  let bad = 0, changed = 0, lockDirty = false;
  const newLock = {}, lockOut = loadLock();
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
    newLock[id] = (table[id] || []).length ? { entries: (table[id] || []).length, sha: res.sha } : undefined;
    for (const b of res.emend.bad) { bad++; console.log(id + " ch" + b.row.ch + " " + (b.row.in || "text") + ": " + JSON.stringify(b.row.from) + " → " + JSON.stringify(b.row.to) + "\n      " + b.why); }
    const after = chapters.map(chapterLine);
    const diff = after.filter((l, k) => l !== before[k]).length;
    /* the file-level fields: whatever stands between `id:` and `intro:` / `chapters:` is this tool's */
    const idLine = lines.findIndex((l) => l === '  id: "' + id + '",');
    let endF = idLine + 1; while (/^  (?:emended|glossOff|glossOffIn): /.test(lines[endF])) endF++;
    const have = lines.slice(idLine + 1, endF).join("\n"), want = res.fields.join("\n");
    if (CHECK) {
      if (diff) { bad++; console.log(id + ": " + diff + " chapter(s) are not in the form this tool writes (" + res.emend.fired + " row(s) not yet applied, " + res.form.titles + " title(s), " + res.form.dashes + " `--`) — run: node .claude/book-emend.js --apply " + id); }
      if (want !== have) { bad++; console.log(id + ": its `emended` / `glossOff` / `glossOffIn` lines are not what the two tables give — run: node .claude/book-emend.js --apply " + id); }
      const lk = res.lock, n = (table[id] || []).length;
      if (n && !(lk && lk.entries === n && lk.sha === res.sha && res.sealed)) { bad++; console.log(id + ": book-emend.lock.json does not seal this file (" + (lk ? "locked at " + lk.entries + " of " + n + " entries" + (res.sealed ? "" : ", another digest") : "no lock") + ") — run: node .claude/book-emend.js --apply " + id); }
      continue;
    }
    if (!res.emend.bad.length) { if (newLock[id]) lockOut[id] = newLock[id]; else delete lockOut[id]; lockDirty = true; }
    if (!diff && want === have) continue;
    after.forEach((l, k) => { lines[idx[k]] = l; });
    lines.splice(idLine + 1, endF - idLine - 1, ...res.fields);
    fs.writeFileSync(file, lines.join("\n"));
    changed++;
    console.log(id + ": " + res.emend.fired + " entr" + (res.emend.fired === 1 ? "y" : "ies") + " applied now" + (res.emend.ruleHits ? " (" + res.emend.ruleHits + " by rule)" : "") + ", " + res.emend.applied + " already in; " + res.form.titles + " title(s) and " + res.form.dashes + " dash(es) put in the house form; " + diff + " chapter line(s) rewritten.");
  }
  if (!CHECK && lockDirty) { const o = {}; Object.keys(lockOut).sort().forEach((k) => { o[k] = lockOut[k]; }); fs.writeFileSync(LOCK, "{\n" + Object.keys(o).map((k) => " " + JSON.stringify(k) + ": " + JSON.stringify(o[k])).join(",\n") + "\n}\n"); }
  if (CHECK) console.log(bad ? "\n" + bad + " finding(s)." : "book-emend: " + Object.values(table).reduce((a, r) => a + r.reduce((x, e) => x + (e.re ? (e.n | 0) : 1), 0), 0) + " emendation(s) in " + Object.keys(table).length + " book(s), all applied; every book is in the house form.");
  else console.log(changed + " file(s) written." + (bad ? " " + bad + " row(s) could not be placed." : ""));
  process.exit(bad ? 1 : 0);
}
