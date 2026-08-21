#!/usr/bin/env node
/* Where the Atlas information pass stands. See docs/atlas-rewrite-plan.md.
 *
 *   node .claude/atlas-audit.js [--uncited] [--old] [--stage=1|2|3]
 *
 * A place is AT THE BAR when its description is ten sentences in two blocks of five, 270–330 words, and it
 * carries at least SRC_TARGET citations each pointed at by a marker. Everything else is one of two things,
 * and they are counted apart because they are different jobs: OLD (the pre-Aug-2026 five-sentence house
 * style, to be rewritten) and MISSING (no description at all, to be written).
 *
 * The universe is every name the panel can be opened on — `world.js` plus every era of `timeline.js` — and
 * NOT the keys of countries.js, which is the thing being measured rather than the thing to measure against.
 */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const SRC_TARGET = 5, WORD_MIN = 270, WORD_MAX = 330;
const IMPERIAL_PAREN = /\s*\((?=[^)]*\d)[^)]*\b(?:miles?|foot|feet|ft|inch(?:es)?|in|yards?|pounds?|lbs?|ounces?|oz|tons?|acres?|sq\s?mi|°F)\b[^)]*\)/gi;
const { pieces } = require("./split-abstract.js");

function loadWindow(f) { const w = {}; new Function("window", fs.readFileSync(f, "utf8"))(w); return w; }
const key = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
const text = (s) => String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const args = process.argv.slice(2);
const want = (f) => args.indexOf(f) >= 0;
const stageArg = (args.find((a) => a.startsWith("--stage=")) || "").slice(8);

const geo = loadWindow(path.join(root, "world.js")).WORLD_GEO || [];
const eras = loadWindow(path.join(root, "timeline.js")).TIMELINE || [];
const info = loadWindow(path.join(root, "countries.js")).COUNTRY_INFO || {};
const srcs = loadWindow(path.join(root, "country-sources.js")).COUNTRY_SOURCES || {};

const present = new Set(geo.map((g) => g && g.n).filter(Boolean).map(key));
const perEra = new Map();
eras.forEach((e) => {
  const s = new Set();
  (e.geo || []).forEach((t) => t && t.n && s.add(key(t.n)));
  Object.values(e.groups || {}).forEach((n) => n && s.add(key(n)));
  perEra.set(e.year, s);
});
const only1600 = new Set();
const outside1600 = new Set();
perEra.forEach((s, y) => { if (y !== 1600) s.forEach((k) => outside1600.add(k)); });
(perEra.get(1600) || new Set()).forEach((k) => { if (!present.has(k) && !outside1600.has(k)) only1600.add(k); });

/* Stage 1 is what a reader meets on the present-day map; stage 2 the historical states; stage 3 the 1600
   era's own names, which are mostly PEOPLES rather than states and whose bar is an open question. */
const stageOf = (k) => present.has(k) ? 1 : (only1600.has(k) ? 3 : 2);

function grade(k) {
  const d = info[k];
  if (!d) return "missing";
  const blocks = String(d).split(/\s*<br>\s*<br>\s*/);
  const shaped = blocks.length === 2 && blocks.every((b) => pieces(b).length === 5);
  const w = text(String(d).replace(IMPERIAL_PAREN, "")).split(/\s+/).filter(Boolean).length;
  const cited = (srcs[k] || []).length >= SRC_TARGET && /<sup class="fn"/.test(d);
  return (shaped && w >= WORD_MIN && w <= WORD_MAX && cited) ? "bar" : "old";
}

const all = new Set([...present, ...outside1600, ...only1600]);
const rows = [...all].map((k) => ({ k, stage: stageOf(k), state: grade(k) }));
const tally = (list) => {
  const t = { bar: 0, old: 0, missing: 0 };
  list.forEach((r) => t[r.state]++);
  return t;
};

console.log("The Atlas information pass\n");
[1, 2, 3].forEach((s) => {
  const list = rows.filter((r) => r.stage === s);
  const t = tally(list);
  const label = s === 1 ? "1  present-day countries      " : s === 2 ? "2  historical states         " : "3  the 1600 era's own names  ";
  console.log("  stage " + label + list.length + " names — " + t.bar + " at the bar, " + t.old + " to rewrite, " + t.missing + " to write");
});
const T = tally(rows);
console.log("\n  total " + rows.length + " names — " + T.bar + " at the bar (" + Math.round(T.bar / rows.length * 100) + "%), " + T.old + " to rewrite, " + T.missing + " to write");

/* Cities are counted and NOT graded: a capital opens no panel of its own (the popup belongs to the state it
   is in), so they are not part of this pass's universe — see the plan's own note on the point. */
const cities = new Set();
eras.forEach((e) => (e.cities || []).forEach((c) => c && c.n && cities.add(key(c.n))));
console.log("  (" + cities.size + " era cities carry no panel of their own and are outside this pass)");

if (stageArg || want("--uncited") || want("--old")) {
  const pick = rows.filter((r) => (!stageArg || r.stage === +stageArg) &&
    (want("--old") ? r.state === "old" : want("--uncited") ? r.state !== "bar" : true));
  console.log("\n" + pick.length + " name(s):");
  pick.sort((a, b) => a.k.localeCompare(b.k)).forEach((r) => console.log("  " + r.state.padEnd(8) + r.k));
}
