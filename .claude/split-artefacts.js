#!/usr/bin/env node
/* split-artefacts.js — split the artefact pool in two, and prove the split is still intact.
 * ========================================================================================
 *     node .claude/split-artefacts.js            perform the split (one-off; refuses if already done)
 *     node .claude/split-artefacts.js --check    assert it is still intact (CI runs this)
 *
 * WHY. artefacts.js sits on the EAGER load path, between glossary-wikipedia.js and lang-decks.js, so
 * every visitor downloads all of it before flipping a card. Measured over the shipped file, `desc` +
 * `sources` + `image` are 237.5 KB of 251 — 94% — against a 14 KB index of id, name, rarity, date and
 * origin. Not one of those three fields is read until a chest opens or the Reliquary is visited, and
 * the only boot-adjacent reader of the pool is progStats, which counts legendaries and therefore needs
 * `rarity` alone. This is glossary-extra.js's case exactly, one file over, where the same move cut
 * 1.29 MB off the eager path.
 *
 * THE SPLIT IS VERIFIED BEFORE ANYTHING IS WRITTEN, field by field, on every artefact. The bytes that
 * ship are the bytes that were checked: the script reads the pool, re-serialises it as two files into
 * MEMORY, loads those back through artefact-io.js and compares the result against what it started
 * with — and refuses to write on any difference. A split that silently drops a citation list is
 * indistinguishable from an uncited artefact, which is precisely the failure this whole apparatus
 * exists to make impossible.
 *
 * Not part of the site. */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const io = require("./artefact-io.js");

const CHECK = process.argv.includes("--check");
let bad = 0;
const ok = (m, extra) => console.log("  \x1b[32mok\x1b[0m    " + m + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : ""));
const fail = (m, extra) => { bad++; console.log("  \x1b[31mFAIL\x1b[0m  " + m + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); };

// load one file in isolation, so we can ask what the INDEX alone carries
function loadOne(file) {
  const w = {};
  vm.runInNewContext(fs.readFileSync(file, "utf8"), { window: w }, { timeout: 30000 });
  return w;
}
const norm = (a) => JSON.stringify({
  id: a.id, name: a.name, rarity: a.rarity, date: a.date || "", origin: a.origin || "",
  desc: a.desc || "", sources: a.sources || [], image: a.image || null,
});

if (CHECK) {
  console.log("\n\x1b[1mTHE ARTEFACT SPLIT\x1b[0m\n");
  if (!fs.existsSync(io.EXTRA)) { fail("artefacts-extra.js exists"); process.exit(1); }
  const idx = loadOne(io.MAIN).ARTEFACTS || [];
  const merged = io.loadArtefacts();

  ok("both files load", idx.length + " in the index, " + merged.length + " merged");
  if (idx.length !== merged.length) fail("the merge changes the pool's length");

  // 1) the index carries NONE of the heavy three — if it does, the split has quietly regrown
  const leaked = idx.filter((a) => io.HEAVY.some((k) => a[k] !== undefined && a[k] !== "" ));
  leaked.length ? fail("the index carries a heavy field again", leaked.slice(0, 4).map((a) => a.id).join(", "))
                : ok("the index carries no desc, sources or image");

  // 2) every artefact has its prose back after the merge — an empty desc here IS the failure mode
  const empty = merged.filter((a) => !a.desc || !a.desc.trim());
  empty.length ? fail(empty.length + " artefacts have no description after the merge", empty.slice(0, 4).map((a) => a.id).join(", "))
               : ok("every artefact has its description after the merge");
  const nosrc = merged.filter((a) => !Array.isArray(a.sources) || !a.sources.length);
  nosrc.length ? fail(nosrc.length + " artefacts have no citations after the merge", nosrc.slice(0, 4).map((a) => a.id).join(", "))
               : ok("every artefact has its citations after the merge");

  // 3) the join holds in both directions — an extra row nothing indexes is unreachable content
  const extraW = loadOne(io.EXTRA);
  const table = (extraW.ARTEFACTS_EXTRA_IN || []).reduce((o, i) => Object.assign(o, i.ARTEFACTS_EXTRA || {}), {});
  const ids = new Set(idx.map((a) => a.id));
  const orphan = Object.keys(table).filter((k) => !ids.has(k));
  const missing = idx.filter((a) => !table[a.id]);
  orphan.length ? fail(orphan.length + " rows in artefacts-extra.js match no id in the index", orphan.slice(0, 4).join(", "))
                : ok("every row in artefacts-extra.js is indexed");
  missing.length ? fail(missing.length + " indexed artefacts have no row in artefacts-extra.js", missing.slice(0, 4).map((a) => a.id).join(", "))
                 : ok("every indexed artefact has a row in artefacts-extra.js");

  // 4) the staging queue's shape — a plain assignment would break the revert baseline (see the header)
  const raw = fs.readFileSync(io.EXTRA, "utf8");
  /ARTEFACTS_EXTRA_IN\s*=\s*window\.ARTEFACTS_EXTRA_IN\s*\|\|\s*\[\]\)\.push\(/.test(raw)
    ? ok("artefacts-extra.js stages onto a QUEUE rather than assigning")
    : fail("artefacts-extra.js must push onto window.ARTEFACTS_EXTRA_IN, not assign");
  /window\.ARTEFACTS_EXTRA\s*=/.test(raw) && fail("artefacts-extra.js assigns window.ARTEFACTS_EXTRA — it must only push");

  // 5) round trip: re-serialise what we just merged and it must come back the same
  const before = merged.map(norm).join("\n");
  const tmpMain = io.serializeIndex(merged), tmpExtra = io.serializeExtra(merged);
  const w2 = {};
  vm.runInNewContext(tmpMain, { window: w2 }); vm.runInNewContext(tmpExtra, { window: w2 });
  const by = {}; (w2.ARTEFACTS || []).forEach((a) => { by[a.id] = a; });
  (w2.ARTEFACTS_EXTRA_IN || []).forEach((i) => Object.keys(i.ARTEFACTS_EXTRA || {}).forEach((k) => {
    if (by[k]) io.HEAVY.forEach((f) => { if (i.ARTEFACTS_EXTRA[k][f] !== undefined) by[k][f] = i.ARTEFACTS_EXTRA[k][f]; });
  }));
  const after = (w2.ARTEFACTS || []).map(norm).join("\n");
  after === before ? ok("the split round-trips byte for byte")
                   : fail("re-serialising the split changes it — a writer would drop content");

  // 6) the eager saving, reported rather than asserted: a size is not a pass/fail
  const kb = (n) => (n / 1024).toFixed(1) + " KB";
  console.log("\n  \x1b[2meager artefacts.js " + kb(fs.statSync(io.MAIN).size) +
    "  ·  lazy artefacts-extra.js " + kb(fs.statSync(io.EXTRA).size) + "\x1b[0m");

  console.log("\n" + (bad ? "\x1b[31m" + bad + " failed\x1b[0m" : "\x1b[32mall checks passed\x1b[0m") + "\n");
  process.exit(bad ? 1 : 0);
}

/* ---------- perform the split ---------- */
if (fs.existsSync(io.EXTRA)) {
  console.error("artefacts-extra.js already exists — the split has been done. Use --check to verify it.");
  process.exit(1);
}
const w = loadOne(io.MAIN);
const list = w.ARTEFACTS || [];
if (!list.length) { console.error("artefacts.js carries no ARTEFACTS."); process.exit(1); }
const before = list.map(norm).join("\n");

// serialise into MEMORY, load it back, and compare before a single byte is written
const mainText = io.serializeIndex(list), extraText = io.serializeExtra(list);
const w2 = {};
vm.runInNewContext(mainText, { window: w2 }); vm.runInNewContext(extraText, { window: w2 });
const by = {}; (w2.ARTEFACTS || []).forEach((a) => { by[a.id] = a; });
(w2.ARTEFACTS_EXTRA_IN || []).forEach((i) => Object.keys(i.ARTEFACTS_EXTRA || {}).forEach((k) => {
  if (by[k]) io.HEAVY.forEach((f) => { if (i.ARTEFACTS_EXTRA[k][f] !== undefined) by[k][f] = i.ARTEFACTS_EXTRA[k][f]; });
}));
const after = (w2.ARTEFACTS || []).map(norm).join("\n");
if (after !== before) {
  const b = before.split("\n"), a = after.split("\n");
  const i = b.findIndex((x, n) => x !== a[n]);
  console.error("REFUSED: the split is not value-preserving. First difference at entry " + (i + 1) + ":");
  console.error("  before: " + String(b[i]).slice(0, 300));
  console.error("  after : " + String(a[i]).slice(0, 300));
  process.exit(1);
}
const wasKb = (fs.statSync(io.MAIN).size / 1024).toFixed(1);
fs.writeFileSync(io.MAIN, mainText);
fs.writeFileSync(io.EXTRA, extraText);
console.log("split " + list.length + " artefacts, verified field by field before writing.");
console.log("  eager artefacts.js       " + wasKb + " KB → " + (fs.statSync(io.MAIN).size / 1024).toFixed(1) + " KB");
console.log("  lazy  artefacts-extra.js " + (fs.statSync(io.EXTRA).size / 1024).toFixed(1) + " KB");
