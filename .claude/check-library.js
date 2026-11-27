#!/usr/bin/env node
/* .claude/check-library.js — THE SHELF'S THREE TABLES, HELD TO ONE ANOTHER (Nov 2026, the Library audit).

     node .claude/check-library.js            # every book; exits 1 on a finding
     node .claude/check-library.js <bookId>   # one book (what fetch-book.js runs after it writes)

   A book lives in three places — its row in app.js's eager `BOOKS`, its entry in fetch-book.js's
   `BOOKS`, and its generated `books/<id>.js` (with `books/<id>.<lang>.js` where it carries an
   original) — and nothing compared them. What that cost, found by the audit this file came out of:

     · FIVE BOOKS WERE NOT ON THE SHELF AT ALL. Their rows had lost the `}, {` that closed them in a
       merge, so each was one object literal with the row after it and the later `id` won. Valid
       JavaScript, a passing suite, and the Res Gestae, Jerome's Letters, Erman, Douglass's Narrative
       and Ebbinghaus's Memory invisible for weeks.
     · MARCO POLO'S CONTENTS LISTED 18 OF ITS 235 CHAPTERS: the importer files each chapter under
       its Book, the row named no `parts`, and the reader lists a book with none as one part.
     · THE CONFESSIONS AND THE CITY OF GOD HEADED EVERY BOOK WITH THEIR FIRST PART'S NAME: the row
       named three parts, the importer none, so every chapter shipped with `p: 1`.
     · Two Greek columns called themselves "Ancient Greek" beside fifteen that say "Greek".

   Every check here is a comparison of two things the repo already states, so a finding is a
   contradiction rather than an opinion, and the script EXITS 1 — it is a gate, unlike the word
   scanners beside it, whose findings are evidence to be read.

   THE `year` RULE (Nov 2026, on request): the shelf's Date order files a work at the EARLIEST year
   its `written` states. A range's key is its early end ("c. 500 BCE – 200 CE" is −500); a single
   century's or decade's key lies inside it; a single year's key is that year. A row may be excused
   in YEAR_EXCUSED below, with the reason.

   Not part of the site. */

const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const ONLY = process.argv.slice(2).find((a) => !a.startsWith("--"));
const fails = [], notes = [];
const fail = (id, msg) => fails.push((id ? id.padEnd(34) : "".padEnd(34)) + msg);

/* ---------- app.js: the eager BOOKS registry, read by TEXT and by VALUE ---------- */
const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const a0 = app.indexOf("\n  const BOOKS = [");
const a1 = app.indexOf("\n  ];", a0);
if (a0 < 0 || a1 < 0) { console.log("check-library: cannot find `const BOOKS = [` in app.js — the check is blind, which is a failure."); process.exit(1); }
const table = app.slice(app.indexOf("[", a0), a1 + 4);
let BOOKS;
try { BOOKS = (0, eval)(table); } catch (e) { console.log("check-library: app.js BOOKS does not evaluate: " + e.message); process.exit(1); }
/* WHERE A TEXT IS SHELVED (Nov 2026): the Reading room's rail filters by a row's `tradition` and `form`,
   one each, from the two lists app.js declares. A row without one is a text no filter of that facet can
   ever show; a value not on the list is a rail row that does not exist. */
const listOf = (name) => { const m = new RegExp("\\n  const " + name + " = (\\[[^;]*\\]);").exec(app); try { return m ? (0, eval)(m[1]) : null; } catch (e) { return null; } };
const TRADITIONS = listOf("BOOK_TRADITIONS"), FORMS = listOf("BOOK_FORMS");
if (!Array.isArray(TRADITIONS) || !Array.isArray(FORMS) || !TRADITIONS.length || !FORMS.length) { console.log("check-library: cannot read BOOK_TRADITIONS / BOOK_FORMS from app.js — the check is blind, which is a failure."); process.exit(1); }
const idLines = table.split("\n").filter((l) => /^      id: "/.test(l)).map((l) => /"([^"]+)"/.exec(l)[1]);
const rowIds = BOOKS.map((b) => b.id);
/* one `id:` line, one object: the merged-row fault is exactly a difference between these two lists */
for (const id of idLines) if (!rowIds.includes(id)) fail(id, "its `id:` line is in app.js's BOOKS but no row carries it — the `},` and `{` before it are missing, so it has merged into the row above");
if (new Set(rowIds).size !== rowIds.length) fail("", "app.js BOOKS holds a duplicate id: " + rowIds.filter((x, i) => rowIds.indexOf(x) !== i).join(", "));
const colour = (() => {
  const c0 = app.indexOf("const BOOK_AUTHOR_COLOR = {"), c1 = app.indexOf("\n  };", c0);
  const m = {}; (app.slice(c0, c1).match(/^\s*"((?:[^"\\]|\\.)+)":\s*"#[0-9A-Fa-f]{6}"/gm) || []).forEach((l) => { m[/"((?:[^"\\]|\\.)+)"/.exec(l)[1]] = 1; });
  return m;
})();

/* ---------- fetch-book.js: the importer's table, read by text (it is not a module) ---------- */
const fbL = fs.readFileSync(path.join(__dirname, "fetch-book.js"), "utf8").split("\n");
const FB = {};
{ let cur = null; const s = fbL.indexOf("const BOOKS = {");
  for (let i = s + 1; i < fbL.length && fbL[i] !== "};"; i++) {
    const m = /^  "?([a-z0-9-]+)"?: \{$/.exec(fbL[i]);
    if (m) { cur = FB[m[1]] = { line: i + 1 }; continue; }
    if (!cur) continue;
    const y = /^    year: (-?\d+),/.exec(fbL[i]); if (y && !("year" in cur)) cur.year = +y[1];
  } }

/* ---------- books/: what a reader is actually sent ---------- */
const DIR = path.join(ROOT, "books");
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".js"));
const enFiles = files.filter((f) => /^[a-z0-9-]+\.js$/.test(f)).map((f) => f.slice(0, -3));
const origFiles = {}; files.forEach((f) => { const m = /^([a-z0-9-]+)\.([a-z]+)\.js$/.exec(f); if (m) origFiles[m[1]] = m[2]; });
global.window = { FOLIO_BOOKS_IN: [], FOLIO_BOOK_ORIG_IN: [] };
for (const f of files) {
  if (ONLY && !f.startsWith(ONLY + ".")) continue;
  try { require(path.join(DIR, f)); } catch (e) { fail(f, "does not load: " + e.message); }
  const head = fs.readFileSync(path.join(DIR, f), "utf8").slice(0, 4000);
  if (!/^\/\* .+ — .+\n/.test(head)) fail(f, "the file does not open with the `/* Title — Author` header every book carries");
  if (!/GENERATED by \.claude\/fetch-book\.js/.test(head)) fail(f, "the header does not say GENERATED by .claude/fetch-book.js — was it written by hand?");
}
const EN = {}, OR = {};
window.FOLIO_BOOKS_IN.forEach((b) => (EN[b.id] = b));
window.FOLIO_BOOK_ORIG_IN.forEach((b) => (OR[b.id] = b));

/* ---------- the earliest year a `written` states ---------- */
function writtenSpan(w) {
  const s = String(w || "");
  const m = /(\d{1,4})(?:st|nd|rd|th)?(s\b)?/.exec(s);
  if (!m) return null;
  const n = +m[1], decade = !!m[2];
  const rest = s.slice(m.index + m[0].length);
  const seg = rest.split(/[,;(&]| or | printed | revised /)[0];           // the clause this date belongs to
  const century = /^(?:\s*[–-]\s*\d{1,2}(?:st|nd|rd|th))?\s+century/.test(rest);
  const here = /^\s*(?:century\s*)?(BCE|CE)\b/.exec(rest);
  const eraM = here || /\b(BCE|CE)\b/.exec(seg);
  const bce = eraM ? eraM[1] === "BCE" : false;
  const range = /^\s*(?:century\s*)?(?:BCE|CE)?\s*[–-]\s*(?:c\.\s*)?\d/.test(rest);
  let lo, hi;
  if (century) { lo = bce ? -n * 100 : (n - 1) * 100 + 1; hi = bce ? -(n - 1) * 100 - 1 : n * 100; }
  else if (decade) { lo = bce ? -(n + 9) : n; hi = bce ? -n : n + 9; }
  else { lo = hi = bce ? -n : n; }
  return { lo, hi, range, single: !range, stated: /\b(BCE|CE)\b/.test(s) };
}
/* id -> why its `year` is not what the rule gives */
const YEAR_EXCUSED = {
  "erman-egyptian-literature": "shelved as Erman's book of 1923, not as the texts it anthologises — the row's own stated choice",
};

/* the glossary's keys, for `glossOff` (glossary.js holds every key; the definitions are elsewhere) */
const GLOSS = (() => {
  try { const w = {}; new Function("window", fs.readFileSync(path.join(ROOT, "glossary.js"), "utf8"))(w); return w.GLOSSARY || null; } catch (e) { return null; }
})();

/* ---------- the comparisons ---------- */
for (const id of enFiles) {
  if (ONLY && id !== ONLY) continue;
  if (!rowIds.includes(id)) fail(id, "books/" + id + ".js ships but app.js's BOOKS has no row for it — the book is not on the shelf");
  if (!FB[id]) fail(id, "books/" + id + ".js ships but fetch-book.js's BOOKS has no entry — it cannot be regenerated");
}
for (const id of Object.keys(FB)) if (!ONLY && !enFiles.includes(id)) fail(id, "fetch-book.js has an entry but no books/" + id + ".js was written");
for (const b of BOOKS) {
  if (ONLY && b.id !== ONLY) continue;
  const id = b.id, t = EN[id];
  if (!t) { fail(id, "app.js lists it but books/" + id + ".js is missing or pushed nothing — the tile opens an empty book"); continue; }
  for (const k of ["title", "author", "written", "edition", "rights", "sourceName", "sourceUrl", "chapterWord"])
    if (typeof b[k] !== "string" || !b[k].trim()) fail(id, "the row has no `" + k + "`");
  if (TRADITIONS.indexOf(b.tradition) < 0) fail(id, "`tradition` is " + JSON.stringify(b.tradition) + " — the Library's filters need one of: " + TRADITIONS.join(" | "));
  if (FORMS.indexOf(b.form) < 0) fail(id, "`form` is " + JSON.stringify(b.form) + " — the Library's filters need one of: " + FORMS.join(" | "));
  if (typeof b.year !== "number") fail(id, "the row has no numeric `year` — the Date order has nothing to sort it by");
  if (!colour[b.author === "Anonymous" ? id : b.author]) fail(id, "no BOOK_AUTHOR_COLOR row for " + JSON.stringify(b.author === "Anonymous" ? id : b.author) + " — the tile falls back to the generic indigo");
  if (typeof t.intro !== "string" || t.intro.length < 200) fail(id, "the book ships no About essay (`intro`)");
  // chapters
  const ch = t.chapters || [];
  if (ch.length !== b.count) fail(id, "`count` is " + b.count + " but the file ships " + ch.length + " chapters");
  if (b.total < b.count) fail(id, "`total` (" + b.total + ") is less than `count` (" + b.count + ")");
  const seen = new Set();
  ch.forEach((c, i) => {
    if (typeof c.n !== "number" || seen.has(c.n)) fail(id, "chapter " + (i + 1) + " has a missing or repeated number (" + c.n + ")");
    seen.add(c.n);
    if (i && c.n <= ch[i - 1].n) fail(id, "chapter numbers go backwards at " + ch[i - 1].n + " → " + c.n);
    if (!c.t || !String(c.t).trim()) fail(id, "chapter " + c.n + " has no title");
    if (!c.html || c.html.length < 20) fail(id, "chapter " + c.n + " has no text");
  });
  // parts: the reader lists a chapter under the part whose `n` is the chapter's `p`, and nowhere else
  const ps = new Set(ch.map((c) => c.p));
  if (b.parts) {
    const pn = b.parts.map((p) => p.n);
    const orphan = [...ps].filter((p) => !pn.includes(p));
    if (orphan.length) fail(id, ch.filter((c) => orphan.includes(c.p)).length + " chapter(s) carry a part (" + orphan.join(", ") + ") the row's `parts` does not name — they are missing from the Contents");
    const empty = pn.filter((p) => !ps.has(p));
    if (empty.length) fail(id, "the row names part(s) " + empty.join(", ") + " but no chapter carries them — the importer's entry needs the same `parts`, with from/to");
  } else if ([...ps].some((p) => p !== 1)) {
    fail(id, ch.filter((c) => c.p !== 1).length + " chapter(s) carry a part other than 1 but the row names no `parts` — the Contents lists only part 1");
  }
  // the original
  const lang = origFiles[id];
  if (b.origLang && !lang) fail(id, "the row offers an original (`origLang: " + b.origLang + "`) but no books/" + id + "." + b.origLang + ".js exists");
  if (!b.origLang && lang) fail(id, "books/" + id + "." + lang + ".js ships but the row has no `origLang` — nobody can open it");
  if (b.origLang && lang && lang !== b.origLang) fail(id, "`origLang` is " + b.origLang + " but the file is ." + lang + ".js");
  if (b.origLang && !b.origName) fail(id, "`origLang` with no `origName` — the chip and the button would both say \"Original\"");
  const o = OR[id];
  if (o && b.origLang) {
    if (o.lang !== b.origLang) fail(id, "the original's own `lang` is " + o.lang + ", the row's is " + b.origLang);
    if (o.langName !== b.origName) fail(id, "the original calls its language " + JSON.stringify(o.langName) + ", the row " + JSON.stringify(b.origName));
    if (!(o.chapters || []).length) fail(id, "the original ships no chapters");
  }
  // the date
  const sp = writtenSpan(b.written);
  if (!sp) { if (!YEAR_EXCUSED[id]) fail(id, "`written` (" + JSON.stringify(b.written) + ") states no year the Date order could be checked against"); }
  else if (!YEAR_EXCUSED[id]) {
    if (sp.range && b.year !== sp.lo) fail(id, "`written` is a span (" + JSON.stringify(b.written) + ") so `year` must be its EARLIEST year, " + sp.lo + " — it is " + b.year);
    if (sp.single && (b.year < sp.lo || b.year > sp.hi)) fail(id, "`year` " + b.year + " lies outside what `written` states (" + JSON.stringify(b.written) + " → " + sp.lo + (sp.hi !== sp.lo ? " to " + sp.hi : "") + ")");
    if (sp.lo > 0 && sp.lo < 1000 && !sp.stated) fail(id, "`written` (" + JSON.stringify(b.written) + ") is a first-millennium date with no era — every other one on the shelf says CE");
  }
  if (/\b(?:BC|AD|B\.C\.|A\.D\.)\b/.test(b.written)) fail(id, "`written` uses BC/AD — the shelf writes BCE/CE (a BC/AD reader's setting converts it)");
  if (/\d-\d/.test(b.written)) fail(id, "`written` joins two years with a hyphen — the shelf uses an en dash");
  if (/\bcirca\b|\bca\.\s/i.test(b.written)) fail(id, "`written` spells out circa — the shelf writes `c.`");
  if (FB[id] && "year" in FB[id] && FB[id].year !== b.year) fail(id, "fetch-book.js gives `year: " + FB[id].year + "` (line " + FB[id].line + "…) and app.js `year: " + b.year + "`");
  if (/\.$/.test(b.edition)) fail(id, "`edition` ends with a full stop — no other row's does (the reader page adds its own)");
  if (!/[.)]$/.test(b.rights)) fail(id, "`rights` is a sentence and does not end like one");
  // glossOff / glossOffIn name glossary keys; a key that no longer exists is a switch wired to nothing
  if (GLOSS) for (const k of (b.glossOff || []).concat(Object.keys(b.glossOffIn || {}))) if (!(k in GLOSS)) notes.push(id.padEnd(34) + "`glossOff` names " + JSON.stringify(k) + ", which is not a glossary key (harmless; a note, not a finding)");
}

/* ---------- the home page's excerpts are the books' own words ----------
   `HOME_EXCERPTS` in app.js holds one passage per book for the home page's "Continue reading" box, with
   the chapter's number and TITLE — typed into the eager file, so nothing re-reads them when the book
   changes. The audit's emendations and the house form left seven of them stale (six titles still in
   capitals or with their stop, and Strabo's "Erastosthenes" after the book had been corrected). Words
   only are compared: the box prints plain text, so tags, marks and spacing are not its business. */
if (!ONLY) {
  const h0 = app.indexOf("const HOME_EXCERPTS = ["), h1 = app.indexOf("\n  ];", h0);
  let EX = null;
  try { EX = (0, eval)(app.slice(app.indexOf("[", h0), h1 + 4)); } catch (e) { fail("", "HOME_EXCERPTS in app.js does not evaluate: " + e.message); }
  const words = (x) => String(x).replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/g, "").replace(/<span class="bk-n"[^>]*>[\s\S]*?<\/span>/g, " ").replace(/<[^>]+>/g, " ").replace(/&#?\w+;/g, " ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  for (const e of EX || []) {
    const t = EN[e.book];
    if (!t) { fail(e.book, "HOME_EXCERPTS quotes a book that is not shipped"); continue; }
    const c = t.chapters.find((x) => x.n === e.n);
    if (!c) { fail(e.book, "HOME_EXCERPTS names chapter " + e.n + ", which the book does not ship"); continue; }
    if (c.t !== e.t) fail(e.book, "HOME_EXCERPTS titles chapter " + e.n + " " + JSON.stringify(e.t) + "; the book's own title is " + JSON.stringify(c.t));
    const hay = " " + words(c.html) + " ";
    for (const part of String(e.text).split("…")) { const w = words(part); if (w && !hay.includes(" " + w + " ")) fail(e.book, "HOME_EXCERPTS' passage is not the book's words in chapter " + e.n + " — near " + JSON.stringify(w.split(" ").slice(0, 8).join(" "))); }
  }
}

/* ---------- the reader's list of modern states is the glossary's, against the Atlas's countries ---------- */
if (!ONLY && GLOSS) {
  const m0 = app.indexOf("/* <gloss-modern-states> */"), m1 = app.indexOf("/* </gloss-modern-states> */");
  if (m0 < 0 || m1 < 0) fail("", "the <gloss-modern-states> block is gone from app.js — an old book would link today's countries again");
  else {
    const have = new Set((app.slice(m0, m1).match(/"((?:[^"\\]|\\.)+)"/g) || []).map((x) => JSON.parse(x)));
    let names = [];
    try { const w = {}; new Function("window", fs.readFileSync(path.join(ROOT, "atlas", "data", "country-names.js"), "utf8"))(w); names = w.ATLAS_COUNTRIES.countries.map((c) => c[0]); } catch (e) { fail("", "atlas/data/country-names.js does not load: " + e.message); }
    const EXTRA = ["United_States", "Czech_Republic", "Serbia", "Tanzania", "Cape_Verde", "Vatican_City", "Hong_Kong", "Macau", "State_of_Palestine"], NOT = new Set(["Antarctica"]);
    const want = new Set(EXTRA.filter((k) => k in GLOSS));
    for (const n of names) { const k = n.replace(/ /g, "_"); const hit = [k, "The_" + k, k + "_(country)"].find((x) => x in GLOSS); if (hit && !NOT.has(hit)) want.add(hit); }
    const missing = [...want].filter((k) => !have.has(k)), stale = [...have].filter((k) => !want.has(k));
    if (missing.length) fail("", "GLOSS_MODERN_STATES in app.js lacks " + missing.length + " glossary key(s) that are present-day countries: " + missing.map((k) => JSON.stringify(k)).join(", "));
    if (stale.length) fail("", "GLOSS_MODERN_STATES in app.js names " + stale.length + " key(s) that are no longer glossary countries: " + stale.map((k) => JSON.stringify(k)).join(", "));
  }
}

if (notes.length) console.log(notes.join("\n") + "\n");
if (fails.length) {
  console.log(fails.join("\n"));
  console.log("\n" + fails.length + " finding(s). Each is two statements in the repo that contradict one another — fix the one that is wrong.");
  process.exit(1);
}
console.log("check-library: " + (ONLY ? ONLY : BOOKS.length + " books, " + Object.keys(origFiles).length + " originals") + " — the catalogue, the importer's table and the shipped files agree.");
