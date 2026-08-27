#!/usr/bin/env node
/* split-glossary.js — move GLOSSARY_IMAGES + GLOSSARY_SOURCES out of the eager path.
 *
 * WHY. glossary.js is on the EAGER path: every visitor downloads all of it before flipping
 * a card. Measured, GLOSSARY_SOURCES is 786 KB of it and GLOSSARY_IMAGES 523 KB -- 54% of
 * the file -- and NEITHER is read until a glossary popup opens. CLAUDE.md had named the
 * sources table "the largest remaining candidate" while it was 479 KB; it grew 64% before
 * anything was done about it.
 *
 * The two blocks are contiguous in the file, so this is a line-range move rather than a
 * re-serialisation: the bytes that ship are the bytes that were reviewed, and no key order,
 * no escaping and no formatting changes. It verifies that both files parse and that every
 * key survives before writing anything.
 *
 *   node .claude/split-glossary.js [--check]
 *
 * --check re-runs the verification against the files as they stand and writes nothing;
 * that is what CI and a later reader use to confirm the split is still intact.
 *
 * Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "glossary.js");
const EXTRA = path.join(ROOT, "glossary-extra.js");
const CHECK = process.argv.includes("--check");
const MOVED = ["GLOSSARY_IMAGES", "GLOSSARY_SOURCES"];

function load(file) {
  const g = {}; vm.runInNewContext(fs.readFileSync(file, "utf8"), { window: g }, { timeout: 30000 });
  return g;
}
const keys = (o) => Object.keys(o || {}).sort();
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ---------- --check: the split is intact ---------- */
if (CHECK) {
  let fail = 0;
  const ok = (m) => console.log("  \x1b[32mok\x1b[0m    " + m);
  const bad = (m) => { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + m); };
  if (!fs.existsSync(EXTRA)) { bad("glossary-extra.js exists"); process.exit(1); }
  const main = load(SRC), extra = load(EXTRA);
  for (const k of MOVED) {
    main[k] && Object.keys(main[k]).length
      ? bad(`${k} is NOT in the eager glossary.js`)
      : ok(`${k} is off the eager path`);
  }
  // glossary-extra.js stages into a queue rather than assigning, so the app's `after` hook
  // owns the merge. Check the queue, not the globals.
  const staged = extra.GLOSSARY_EXTRA_IN;
  Array.isArray(staged) && staged.length
    ? ok(`glossary-extra.js stages ${staged.length} payload(s) onto window.GLOSSARY_EXTRA_IN`)
    : bad("glossary-extra.js pushes onto window.GLOSSARY_EXTRA_IN");
  if (Array.isArray(staged)) for (const k of MOVED) {
    const n = Object.keys((staged[0] || {})[k] || {}).length;
    n ? ok(`${k} carries ${n.toLocaleString()} keys`) : bad(`${k} carries keys`);
  }
  console.log(fail ? `\n${fail} failed\n` : "\nthe split is intact\n");
  process.exit(fail ? 1 : 0);
}

/* ---------- the move ---------- */
const before = load(SRC);
const lines = fs.readFileSync(SRC, "utf8").split("\n");
const starts = lines.map((l, i) => [l, i]).filter(([l]) => /^window\.[A-Z_]+ *=/.test(l));
const at = (name) => { const r = starts.find(([l]) => l.startsWith("window." + name + " ")); return r ? r[1] : -1; };

const a = at(MOVED[0]), b = at(MOVED[1]);
if (a < 0 || b < 0) { console.error("could not find both blocks"); process.exit(1); }
const idx = starts.findIndex(([, i]) => i === b);
const end = idx + 1 < starts.length ? starts[idx + 1][1] : lines.length;   // first line AFTER the moved run
if (b < a || starts.findIndex(([, i]) => i === a) + 1 !== idx) {
  console.error("the two blocks are not contiguous — this script only does a range move"); process.exit(1);
}

const moved = lines.slice(a, end).join("\n").replace(/\s+$/, "");
const kept = lines.slice(0, a).concat(lines.slice(end)).join("\n").replace(/\n{3,}/g, "\n\n");

const HEAD = `/* The glossary's CITATIONS and ILLUSTRATIONS — split out of glossary.js and LAZY.
 *
 * WHY THIS FILE EXISTS. glossary.js is on the eager load path, so every visitor downloads it
 * before flipping a card, and these two tables were 54% of it — measured at 786 KB of citations
 * and 523 KB of picture metadata. Neither is read until a glossary popup OPENS. They are fetched
 * now by the \`glossExtra\` data bundle: warmed at idle after boot, and awaited by openGlossWin
 * for the rare reader who opens a popup before the warm lands.
 *
 * IT STAGES ONTO A QUEUE RATHER THAN ASSIGNING, for the same reason i18n/gloss-<lang>.js does.
 * app.js snapshots PRISTINE_GLOSS_SOURCES / PRISTINE_GLOSS_IMAGES at boot — which is BEFORE this
 * file lands — so a plain assignment would leave the admin editor's revert baseline empty and
 * "Revert" would silently delete a shipped citation list instead of restoring it. The bundle's
 * \`after\` hook (glossExtraIngest) drains the queue, re-seeds those baselines and re-applies the
 * admin overlay on top.
 *
 * GENERATED — do not hand-edit. Written by .claude/split-glossary.js and rewritten by the admin
 * editor's own serializer (serializeGlossaryExtra). \`node .claude/split-glossary.js --check\`
 * verifies the split is still intact. */
(function () {
`;
const TAIL = `
  (window.GLOSSARY_EXTRA_IN = window.GLOSSARY_EXTRA_IN || []).push({ GLOSSARY_IMAGES: GLOSSARY_IMAGES, GLOSSARY_SOURCES: GLOSSARY_SOURCES });
})();
`;
// `window.X = Object.assign(window.X || {}, {…});` → a local `var X = {…};`
const body = moved
  .replace(/^window\.(GLOSSARY_IMAGES|GLOSSARY_SOURCES) *= *Object\.assign\(window\.\1 *\|\| *\{\}, *\{/gm, "  var $1 = {")
  .replace(/^\}\);$/gm, "  };");

const extraText = HEAD + body + TAIL;

/* ---------- verify BEFORE writing ---------- */
const tmpMain = SRC + ".tmp", tmpExtra = EXTRA + ".tmp";
fs.writeFileSync(tmpMain, kept); fs.writeFileSync(tmpExtra, extraText);
let after, staged;
try { after = load(tmpMain); staged = load(tmpExtra).GLOSSARY_EXTRA_IN; }
catch (e) { fs.unlinkSync(tmpMain); fs.unlinkSync(tmpExtra); console.error("generated file does not parse:", e.message); process.exit(1); }

const problems = [];
for (const k of Object.keys(before)) {
  if (MOVED.includes(k)) {
    const got = (staged && staged[0] && staged[0][k]) || {};
    if (!same(keys(before[k]), keys(got))) problems.push(`${k}: keys differ after the move`);
    else if (!same(before[k], got)) problems.push(`${k}: values differ after the move`);
    if (after[k] && Object.keys(after[k]).length) problems.push(`${k}: still present in glossary.js`);
  } else if (!same(before[k], after[k])) problems.push(`${k}: changed, and should not have`);
}
if (problems.length) {
  fs.unlinkSync(tmpMain); fs.unlinkSync(tmpExtra);
  console.error("REFUSING TO WRITE:\n  " + problems.join("\n  ")); process.exit(1);
}
fs.renameSync(tmpMain, SRC); fs.renameSync(tmpExtra, EXTRA);

const kb = (f) => (fs.statSync(f).size / 1048576).toFixed(2) + " MB";
console.log(`\n  glossary.js        → ${kb(SRC)}   (eager)`);
console.log(`  glossary-extra.js  → ${kb(EXTRA)}   (lazy, bundle "glossExtra")`);
for (const k of MOVED) console.log(`  ${k}: ${Object.keys(staged[0][k]).length.toLocaleString()} keys moved, verified identical`);
console.log("\n  every other global in glossary.js is byte-identical.\n");
