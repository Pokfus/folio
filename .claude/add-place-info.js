#!/usr/bin/env node
/* Write an Atlas place's description AND its citations, together. See docs/atlas-rewrite-plan.md.
 *
 *   node .claude/add-place-info.js <batch.json>
 *
 * <batch.json>  { "places": {
 *     "<map name, any case>": {
 *       "desc":    "<10 sentences, two blocks of 5 split by ' <br><br> ', with empty <sup class=\"fn\"> markers>",
 *       "sources": [ "<Chicago note-form citation ending in a URL>", … ]
 *     }, …
 *   } }
 *
 * THE DESCRIPTION AND ITS CITATIONS ARE ONE EDIT, which is why this writes `countries.js` and
 * `country-sources.js` in one pass rather than leaving the second to `add-country-sources.js`. A
 * description shipped without its list is prose claiming a citation the reader cannot follow, and a list
 * shipped without the description it belongs to is a works list nothing points at — and the two files are
 * far enough apart that either is easy to forget.
 *
 * It REFUSES the whole batch rather than half-applying it: a batch that wrote four places and threw on the
 * fifth leaves the Atlas in a state nobody chose and nothing reports.
 *
 * Keys are the place name AS IT APPEARS ON THE MAP, lowercased and whitespace-collapsed. A name that is in
 * neither `world.js` nor `timeline.js` is refused — a description filed under a name the panel never looks
 * up is a description nobody will ever see.
 */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const infoPath = path.join(root, "countries.js");
const srcPath = path.join(root, "country-sources.js");

const SRC_TARGET = 5;             // mirrors SRC_TARGET in app.js — a card's bar, and this is a card's background
const WORD_MIN = 270, WORD_MAX = 330;   // the abstract bar; add-card.js enforces the same
const SENT_PER_BLOCK = 5;
const SRC_URL = /https?:\/\/[^\s<>"']+/;
/* An imperial conversion is not charged against the word count — the site's own rule, and without it the
   metric-first rule could not be applied to a place already near the ceiling. Copied from add-card.js. */
const IMPERIAL_PAREN = /\s*\((?=[^)]*\d)[^)]*\b(?:miles?|foot|feet|ft|inch(?:es)?|in|yards?|pounds?|lbs?|ounces?|oz|tons?|acres?|sq\s?mi|°F)\b[^)]*\)/gi;

const { pieces } = require("./split-abstract.js");

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
const key = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
const text = (s) => String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

const batchFile = process.argv[2];
if (!batchFile) { console.error("usage: node .claude/add-place-info.js <batch.json>"); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(batchFile, "utf8"));
const places = batch.places || {};
if (!Object.keys(places).length) { console.error("nothing in the batch"); process.exit(1); }

// ---- the names the Atlas panel can actually look up ----
const geoWin = loadWindow(path.join(root, "world.js"));
const tlWin = loadWindow(path.join(root, "timeline.js"));
const known = new Set();
(geoWin.WORLD_GEO || []).forEach((g) => g && g.n && known.add(key(g.n)));
(tlWin.TIMELINE || []).forEach((e) => {
  (e.geo || []).forEach((t) => t && t.n && known.add(key(t.n)));
  Object.values(e.groups || {}).forEach((n) => n && known.add(key(n)));
});

const errs = [], warns = [];
const staged = {};

Object.keys(places).forEach((raw) => {
  const k = key(raw), p = places[raw] || {};
  const at = (m) => errs.push(k + ": " + m);
  if (!known.has(k)) return at("no such place on any map (world.js / timeline.js)");

  const desc = String(p.desc || "").trim();
  if (!desc) return at("no description");

  // ---- shape: two blocks of five ----
  const blocks = desc.split(/\s*<br>\s*<br>\s*/);
  if (blocks.length !== 2) at("the description is " + blocks.length + " block(s); it must be 2, split by ' <br><br> '");
  blocks.forEach((b, i) => {
    const n = pieces(b).length;
    if (n !== SENT_PER_BLOCK) at("block " + (i + 1) + " is " + n + " sentence(s), not " + SENT_PER_BLOCK);
  });

  // ---- length ----
  const w = text(desc.replace(IMPERIAL_PAREN, "")).split(/\s+/).filter(Boolean).length;
  if (w < WORD_MIN || w > WORD_MAX) at(w + " words; the bar is " + WORD_MIN + "–" + WORD_MAX);

  // ---- the place's own name, bolded, at its first mention ----
  const b1 = /<b>([^<]{1,80})<\/b>/.exec(desc);
  if (!b1) at("the place's own name is not bolded anywhere");
  else if (desc.indexOf("<b>") > 90) at("the bold is " + desc.indexOf("<b>") + " characters in; the description opens on the place's name");

  // ---- the apparatus ----
  const src = (p.sources || []).map((s) => String(s || "").trim()).filter(Boolean);
  if (src.length < SRC_TARGET) at(src.length + " citation(s); the bar is " + SRC_TARGET);
  src.forEach((s, i) => { if (!SRC_URL.test(s)) at("citation " + (i + 1) + " carries no URL a reader can open"); });
  const open = src.filter((s) => /\[Open access\]/i.test(s)).length;
  const pay = src.filter((s) => /\[Paywalled\]/i.test(s)).length;
  if (pay && open <= pay) warns.push(k + ": " + pay + " paywalled against " + open + " open — the majority of a list must be open");

  const marks = [];
  String(desc).replace(/<sup class="fn"[^>]*data-fn="(\d+)"[^>]*><\/sup>/g, (m, n) => { marks.push(+n); return m; });
  const bare = (desc.match(/<sup class="fn"(?![^>]*data-fn)/g) || []).length;
  if (bare) at(bare + " marker(s) with no data-fn — write the number, the panel does not renumber a bare one");
  if (!marks.length) at("no footnote markers in the prose");
  marks.forEach((n) => { if (n > src.length) at("a marker points at source " + n + " and there are only " + src.length); });
  src.forEach((s, i) => { if (marks.indexOf(i + 1) < 0) at("citation " + (i + 1) + " is referenced by no marker"); });

  staged[k] = { desc: desc, sources: src };
});

if (errs.length) {
  console.error("REFUSED — nothing written:\n" + errs.map((e) => "  ✗ " + e).join("\n"));
  process.exit(1);
}
warns.forEach((w) => console.warn("  ! " + w));

// ---- write ----
const info = Object.assign({}, loadWindow(infoPath).COUNTRY_INFO || {});
const srcWin = loadWindow(srcPath);
const gen = Object.assign({}, srcWin.COUNTRY_SOURCES || {});
const yrs = srcWin.COUNTRY_YEAR_SOURCES || {};
Object.keys(staged).forEach((k) => { info[k] = staged[k].desc; gen[k] = staged[k].sources; });

const lit = (o) => "{\n" + Object.keys(o).sort().map((k) => JSON.stringify(k) + ": " + JSON.stringify(o[k])).join(",\n") + "\n}";

fs.writeFileSync(infoPath,
  "/* Country / territory descriptions for the Atlas globe's click popup. Keyed by lowercased map name.\n" +
  "   The bar is a geography card's background: 10 sentences in two blocks of 5, 270–330 words, cited at\n" +
  "   SRC_TARGET with empty <sup class=\"fn\"> markers pointing into country-sources.js. Entries written\n" +
  "   before the Aug 2026 pass are the older five-sentence house style and are being rewritten batch by\n" +
  "   batch — see docs/atlas-rewrite-plan.md. Load before app.js. Written by\n" +
  "   `node .claude/add-place-info.js <batch.json>`; safe to re-generate. */\n" +
  "window.COUNTRY_INFO = " + lit(info) + ";\n", "utf8");

fs.writeFileSync(srcPath,
  fs.readFileSync(srcPath, "utf8").split("window.COUNTRY_SOURCES")[0] +
  "window.COUNTRY_SOURCES = Object.assign(window.COUNTRY_SOURCES || {}, " + lit(gen) + ");\n\n" +
  "window.COUNTRY_YEAR_SOURCES = Object.assign(window.COUNTRY_YEAR_SOURCES || {}, " + lit(yrs) + ");\n", "utf8");

// re-parse both, on the standing rule that a writer proves its own output loads
loadWindow(infoPath); loadWindow(srcPath);

const n = Object.keys(staged).length;
console.log("wrote " + n + " place" + (n === 1 ? "" : "s") + " to countries.js + country-sources.js");
require("child_process").spawnSync(process.execPath, [path.join(__dirname, "atlas-audit.js")], { stdio: "inherit" });
