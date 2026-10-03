#!/usr/bin/env node
/* split-glossary.js — move the glossary's heavy half out of the eager path, and guard the split.
 *
 * WHY. glossary.js is on the EAGER path: every visitor downloads all of it before flipping
 * a card. Measured in Sep 2026, GLOSSARY_SOURCES was 786 KB of it and GLOSSARY_IMAGES 523 KB
 * -- 54% of the file -- and NEITHER is read until a glossary popup opens. CLAUDE.md had named
 * the sources table "the largest remaining candidate" while it was 479 KB; it grew 64% before
 * anything was done about it. Both blocks moved to glossary-extra.js (bundle "glossExtra").
 *
 * THE DEFINITIONS FOLLOWED (Oct 2026). With the two tables gone the texts were 87% of what was
 * left -- 4.3 MB raw, about 1.3 MB gzipped, for 5,700 terms -- and nothing reads a text before
 * a popup, the glossary page, the search or a game asks for it. What boot DOES need is the KEY
 * SET: the auto-linker, the progress meters, `k in window.GLOSSARY` in thirty places. So
 * glossary.js keeps `window.GLOSSARY = {…}` with every key and an EMPTY STRING for its text,
 * and glossary-extra.js stages the texts under the same name, `GLOSSARY`, beside the two tables.
 * The eager file's own Node-only tail rejoins the halves for a plain `require`; everything
 * else goes through .claude/gloss-io.js, which is the one writer of both files.
 *
 *   node .claude/split-glossary.js            # perform whichever move is still outstanding
 *   node .claude/split-glossary.js --check    # assert the split is intact, write nothing
 *
 * --check is what CI and a later reader use to confirm the split is still intact: no table block
 * in glossary.js, no non-empty text in it, every key's text staged by glossary-extra.js, and the
 * two key sets identical.
 *
 * Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const io = require("./gloss-io.js");
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
  const G = main.GLOSSARY || {};
  const texts = Object.keys(G).filter((k) => G[k]);
  texts.length
    ? bad(`${texts.length.toLocaleString()} definition text(s) are still in the eager glossary.js, e.g. ${texts.slice(0, 3).join(", ")}`)
    : ok(`glossary.js carries ${Object.keys(G).length.toLocaleString()} keys and no text`);
  fs.readFileSync(SRC, "utf8").indexOf(io.TAIL_MARK) >= 0
    ? ok("glossary.js carries its Node-only rejoin tail")
    : bad("glossary.js has lost its Node-only rejoin tail — `require` of it would read every term as empty");
  // glossary-extra.js stages into a queue rather than assigning, so the app's `after` hook
  // owns the merge. Check the queue, not the globals.
  const staged = extra.GLOSSARY_EXTRA_IN;
  Array.isArray(staged) && staged.length
    ? ok(`glossary-extra.js stages ${staged.length} payload(s) onto window.GLOSSARY_EXTRA_IN`)
    : bad("glossary-extra.js pushes onto window.GLOSSARY_EXTRA_IN");
  if (Array.isArray(staged)) {
    for (const k of MOVED) {
      const n = Object.keys((staged[0] || {})[k] || {}).length;
      n ? ok(`${k} carries ${n.toLocaleString()} keys`) : bad(`${k} carries keys`);
    }
    const T = (staged[0] || {}).GLOSSARY || {};
    const missing = Object.keys(G).filter((k) => !T[k]);
    const stray = Object.keys(T).filter((k) => !(k in G));
    missing.length
      ? bad(`${missing.length.toLocaleString()} key(s) in glossary.js have no text in glossary-extra.js, e.g. ${missing.slice(0, 3).join(", ")}`)
      : ok(`every key has its text staged (${Object.keys(T).length.toLocaleString()} texts)`);
    stray.length
      ? bad(`${stray.length} text(s) in glossary-extra.js belong to no key in glossary.js, e.g. ${stray.slice(0, 3).join(", ")}`)
      : ok("no text for a retired key");
  }
  console.log(fail ? `\n${fail} failed\n` : "\nthe split is intact\n");
  process.exit(fail ? 1 : 0);
}

/* ---------- the moves ---------- */
const before = load(SRC);
const blocksEager = MOVED.some((k) => before[k] && Object.keys(before[k]).length);
const textsEager = Object.keys(before.GLOSSARY || {}).some((k) => before.GLOSSARY[k]);
if (!blocksEager && !textsEager) { console.log("nothing to move: the split is already performed (run --check to verify it)"); process.exit(0); }

if (blocksEager) {
  /* The two table blocks are contiguous in the file, so this is a line-range move rather than a
     re-serialisation: the bytes that ship are the bytes that were reviewed. */
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
  const kept = lines.slice(0, a).concat(lines.slice(end)).join("\n").replace(/\n{3,}/g, "\n\n");
  const tmp = SRC + ".tmp";
  fs.writeFileSync(tmp, kept);
  const after = load(tmp);
  const problems = [];
  for (const k of Object.keys(before)) {
    if (MOVED.includes(k)) { if (after[k] && Object.keys(after[k]).length) problems.push(`${k}: still present in glossary.js`); }
    else if (!same(before[k], after[k])) problems.push(`${k}: changed, and should not have`);
  }
  if (problems.length) { fs.unlinkSync(tmp); console.error("REFUSING TO WRITE:\n  " + problems.join("\n  ")); process.exit(1); }
  fs.renameSync(tmp, SRC);
  // the tables themselves are carried into the lazy file by the write below, from the merged window
  const win = {};
  for (const k of MOVED) win[k] = before[k];
  Object.assign(win, { GLOSSARY: before.GLOSSARY });
  io.writeGlossary(Object.assign(io.loadGlossary(), win), fs.readFileSync(SRC, "utf8"));
}

if (textsEager) {
  /* The definitions: the merged window holds every text, and writeGlossary blanks them in
     glossary.js and serialises them into glossary-extra.js beside the two tables. Verified
     key for key and text for text before the files are trusted. */
  const win = io.loadGlossary();
  if (!same(keys(win.GLOSSARY), keys(before.GLOSSARY))) { console.error("merged key set differs from glossary.js's — refusing"); process.exit(1); }
  for (const k of Object.keys(before.GLOSSARY)) if (before.GLOSSARY[k] && win.GLOSSARY[k] !== before.GLOSSARY[k]) { console.error("merged text differs for " + k + " — refusing"); process.exit(1); }
  io.writeGlossary(win, fs.readFileSync(SRC, "utf8"));
}

/* ---------- verify what was written ---------- */
const after = load(SRC), staged = load(EXTRA).GLOSSARY_EXTRA_IN;
const T = (staged && staged[0] && staged[0].GLOSSARY) || {};
const problems = [];
if (!same(keys(after.GLOSSARY), keys(before.GLOSSARY))) problems.push("GLOSSARY: key set changed");
for (const k of Object.keys(before.GLOSSARY)) {
  if (after.GLOSSARY[k]) problems.push(`GLOSSARY: ${k} still carries its text in glossary.js`);
  const want = before.GLOSSARY[k] || T[k];
  if (T[k] !== want) problems.push(`GLOSSARY: text differs for ${k} after the move`);
}
for (const k of MOVED) {
  const got = (staged && staged[0] && staged[0][k]) || {};
  const was = before[k] && Object.keys(before[k]).length ? before[k] : io.loadGlossary()[k];
  if (!same(keys(was), keys(got))) problems.push(`${k}: keys differ after the move`);
  else if (!same(was, got)) problems.push(`${k}: values differ after the move`);
  if (after[k] && Object.keys(after[k]).length) problems.push(`${k}: still present in glossary.js`);
}
for (const k of Object.keys(before)) {
  if (k === "GLOSSARY" || MOVED.includes(k)) continue;
  if (!same(before[k], after[k])) problems.push(`${k}: changed, and should not have`);
}
if (problems.length) { console.error("WRITTEN BUT NOT VERIFIED — fix before committing:\n  " + problems.slice(0, 10).join("\n  ")); process.exit(1); }

const kb = (f) => (fs.statSync(f).size / 1048576).toFixed(2) + " MB";
console.log(`\n  glossary.js        → ${kb(SRC)}   (eager)`);
console.log(`  glossary-extra.js  → ${kb(EXTRA)}   (lazy, bundle "glossExtra")`);
console.log(`  GLOSSARY: ${Object.keys(T).length.toLocaleString()} texts moved, verified identical; the keys stay eager`);
for (const k of MOVED) console.log(`  ${k}: ${Object.keys(((staged || [])[0] || {})[k] || {}).length.toLocaleString()} keys in the lazy file`);
console.log("\n  every other global in glossary.js is unchanged.\n");
