#!/usr/bin/env node
/* add-card-quotes.js — write `card.quote` onto cards that already exist.
 *
 *     node .claude/add-card-quotes.js <batch.json> [--dry] [--replace]
 *
 *     { "cards": {
 *         "gr-286": { "book": "herodotus-histories", "n": "1", "cite": "Histories 1.32",
 *                     "text": "<p>But refrain from calling him fortunate before he dies…</p>" }
 *     } }
 *
 * WHY THIS EXISTS. `card.quote` could be set on nothing but a card written after the field shipped —
 * `add-card.js` only ever adds a WHOLE new card, and no other helper touches it. On a corpus of 2,895
 * cards that made the Library's best feature permanently dormant: 23 cards carried a quotation, against
 * several hundred that cite a work sitting on the shelf.
 *
 * THE PASSAGE IS AUTHORED, NEVER EXTRACTED — CLAUDE.md's rule, and this tool does not soften it. What it
 * does is REFUSE a transcription that is not what the book says, which is the one part a machine can
 * check and the one a reader cannot:
 *
 *   · the book is on the shelf (app.js's own eager BOOKS registry, matched as add-card.js matches it);
 *   · the section exists in the generated books/<id>.js;
 *   · and THE WORDS ARE IN THAT SECTION, compared exactly as `check-cards.js` compares them — bare
 *     numbers dropped from both sides (several editions run their section numbers inline), whitespace
 *     entities decoded, and ` … ` read as the author saying a gap was cut, each side checked on its own.
 *
 * The comparison is SLICED OUT OF check-cards.js rather than copied. This repo has the scar of a batch
 * tool that kept its own copy of a rule and drifted from it (add-card-tags.js, which stripped two fields
 * from all 500 cards in one run), and a second copy of "is this quotation real" is the worst possible
 * place for that to happen.
 *
 * A CARD THAT ALREADY HAS A QUOTE IS REFUSED without --replace, for add-images.js's reason: replacing
 * one is a decision, and a batch is not the place to make it silently.
 *
 * It splices LINES rather than rewriting data.js, and resplits afterwards so the passage lands in the
 * lazy half — a quotation is several hundred bytes and belongs nowhere near the eager path.
 *
 * Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data.js");

const file = process.argv[2];
const DRY = process.argv.includes("--dry");
const REPLACE = process.argv.includes("--replace");
if (!file) { console.error("usage: node .claude/add-card-quotes.js <batch.json> [--dry] [--replace]"); process.exit(1); }

const batch = JSON.parse(fs.readFileSync(file, "utf8"));
const want = batch.cards || {};
if (!Object.keys(want).length) { console.error("ERROR: batch has no `cards`."); process.exit(1); }

/* THE NORMALISER IS check-cards.js's OWN, sliced out by text. If that function is renamed or reshaped
   this tool stops rather than silently checking something else. */
const checkSrc = fs.readFileSync(path.join(__dirname, "check-cards.js"), "utf8");
const normM = /const norm = t => [\s\S]*?\.join\(" "\) \+ " ";/.exec(checkSrc);
if (!normM) { console.error("ERROR: could not find check-cards.js's `norm` — the quote comparison lives there and this tool will not guess at it."); process.exit(1); }
const norm = new Function("return " + normM[0].replace(/^const norm = /, "").replace(/;$/, ""))();

const appjs = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const shelfCache = {};
function shelved(id) {
  if (id in shelfCache) return shelfCache[id];
  const f = path.join(ROOT, "books", id + ".js");
  if (!fs.existsSync(f)) return (shelfCache[id] = null);
  const win = { FOLIO_BOOKS_IN: [] };
  new Function("window", fs.readFileSync(f, "utf8"))(win);
  return (shelfCache[id] = win.FOLIO_BOOKS_IN.find((b) => b.id === id) || null);
}

const { cards } = require("./card-io").loadCards();
const byId = {}; for (const c of cards) byId[c.id] = c;

const errs = [], merged = {};
for (const id of Object.keys(want)) {
  const cur = byId[id];
  if (!cur) { errs.push(id + ": no such card"); continue; }
  const q = want[id] || {};
  if (q === null) { merged[id] = Object.assign({}, cur); delete merged[id].quote; continue; }
  const extra = Object.keys(q).filter((k) => ["book", "n", "cite", "text"].indexOf(k) < 0);
  if (extra.length) { errs.push(id + ": a quote carries book / n / cite / text only (got " + extra.join(", ") + ")"); continue; }
  const bid = String(q.book || "").trim(), text = String(q.text || "").trim();
  if (!bid || !text) { errs.push(id + ": a quote needs both a `book` and the `text` of the passage"); continue; }
  if (cur.quote && !REPLACE) { errs.push(id + ": already quotes " + cur.quote.book + " " + (cur.quote.cite || cur.quote.n) + " (pass --replace)"); continue; }
  if (!new RegExp('\\bid:\\s*"' + bid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"').test(appjs)) {
    errs.push(id + ': "' + bid + '" is not a book in app.js\'s BOOKS registry'); continue;
  }
  const b = shelved(bid);
  if (!b) { errs.push(id + ": no books/" + bid + ".js on disk"); continue; }
  const n = q.n == null ? "" : String(q.n).trim();
  const ch = (b.chapters || []).find((x) => String(x.n) === n);
  if (!ch) {
    errs.push(id + ': "' + bid + '" has no section ' + JSON.stringify(n) + " — it holds " + (b.chapters || []).length +
      ((b.chapters || []).length ? " (" + (b.chapters || []).slice(0, 8).map((x) => x.n).join(", ") + "…)" : ""));
    continue;
  }
  const flat = norm(ch.html), said = norm(text).trim();
  let bad = null;
  for (const part of said.split(" … ")) if (part && flat.indexOf(part) < 0) { bad = part; break; }
  if (bad) { errs.push(id + ": this is not what " + bid + " " + n + " says — first stray words: " + JSON.stringify(bad.slice(0, 80))); continue; }
  const next = Object.assign({}, cur);
  next.quote = { book: bid, n: n, text: text };
  if (q.cite) next.quote.cite = String(q.cite);
  merged[id] = next;
}
if (errs.length) {
  console.error("ERROR: the batch was NOT applied — " + errs.length + " problem" + (errs.length === 1 ? "" : "s") + ":");
  errs.forEach((e) => console.error("  · " + e));
  process.exit(1);
}

let src = fs.readFileSync(DATA, "utf8");
const lines = src.split("\n");
let touched = 0;
for (let i = 0; i < lines.length; i++) {
  const raw = lines[i], body = raw.replace(/,\s*$/, "");
  if (!body.startsWith("{")) continue;
  let obj; try { obj = JSON.parse(body); } catch (e) { continue; }
  if (!obj || !merged[obj.id]) continue;
  lines[i] = JSON.stringify(merged[obj.id]) + (raw.endsWith(",") ? "," : "");
  touched++;
}
if (touched !== Object.keys(merged).length) {
  console.error("ERROR: matched " + touched + " lines for " + Object.keys(merged).length + " cards — data.js is not one card per line. Nothing written.");
  process.exit(1);
}
if (DRY) { console.log("dry run: " + touched + " card" + (touched === 1 ? "" : "s") + " would change"); process.exit(0); }
fs.writeFileSync(DATA, lines.join("\n"));
require("./card-io").resplit();
{ const win = {}; new Function("window", fs.readFileSync(DATA, "utf8"))(win); }

const after = require("./card-io").loadCards().cards;
const n = after.filter((c) => c && c.quote && c.quote.book).length;
const by = {}; after.forEach((c) => { if (c && c.quote) by[c.quote.book] = (by[c.quote.book] || 0) + 1; });
console.log("wrote " + touched + " | corpus now: " + n + " cards quote a shelved book");
Object.keys(by).sort((a, b) => by[b] - by[a]).forEach((k) => console.log("   " + String(by[k]).padStart(3) + "  " + k));
