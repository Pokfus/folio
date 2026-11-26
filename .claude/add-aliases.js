#!/usr/bin/env node
"use strict";
/*
  add-aliases.js — give EXISTING glossary terms more auto-link surfaces, without retyping them.
  Standalone Node helper, zero deps. Not part of the site.

    node .claude/add-aliases.js <aliases.json> [--dry]

  <aliases.json> is { "<slug>": ["alias", …], … }. Each alias is ADDED to the term's list (an alias it
  already has is skipped); nothing else about the term changes. It goes through add-glossary.js — the
  one writer of glossary.js — as a maintenance edit (`skipSources`), handing it the term's own
  description back, so every check that script makes still runs and glossary-extra.js is never
  re-serialised by a second writer.

  It REFUSES an alias another term already uses as its title or alias: buildGlossIndex resolves such
  a tie by position in glossary.js, which no reader can see (see check-gloss-links.js). Move the alias
  deliberately instead — delete it from the other term first.
*/
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const file = process.argv[2], DRY = process.argv.includes("--dry");
if (!file) { console.error("usage: node .claude/add-aliases.js <aliases.json> [--dry]"); process.exit(1); }
const want = JSON.parse(fs.readFileSync(file, "utf8"));
const win = require("./gloss-io.js").loadGlossary();
const G = win.GLOSSARY || {}, A = win.GLOSSARY_ALIASES || {};
const title = (k) => k.replace(/_\([^)]*\)$/, "").replace(/_/g, " ");
const owner = new Map();
for (const k of Object.keys(G)) {
  if (!/_\([^)]*\)$/.test(k)) owner.set(title(k), k);
  for (const a of A[k] || []) if (!owner.has(a)) owner.set(a, k);
}
let bad = 0, done = 0;
for (const slug of Object.keys(want)) {
  if (!(slug in G)) { console.error("  NO TERM  " + slug); bad++; continue; }
  const have = A[slug] || [];
  const add = [];
  for (const a of want[slug]) {
    if (have.includes(a) || add.includes(a)) continue;
    const o = owner.get(a);
    if (o && o !== slug) { console.error("  TAKEN    " + JSON.stringify(a) + " is already " + o + "'s — not added to " + slug); bad++; continue; }
    add.push(a);
  }
  if (!add.length) { console.log("  nothing  " + slug); continue; }
  console.log((DRY ? "  would add " : "  adding   ") + slug + ": " + add.join(", "));
  if (DRY) continue;
  const tmp = path.join(os.tmpdir(), "alias-" + process.pid + "-" + done + ".json");
  fs.writeFileSync(tmp, JSON.stringify({ slug, description: G[slug], aliases: have.concat(add), skipSources: true }));
  const r = cp.spawnSync(process.execPath, [path.join(__dirname, "add-glossary.js"), tmp, "--no-wiki"], { encoding: "utf8" });
  fs.unlinkSync(tmp);
  if (r.status !== 0) { console.error("  FAILED   " + slug + "\n" + (r.stderr || r.stdout)); bad++; continue; }
  done++;
}
console.log(done + " term(s) updated" + (bad ? ", " + bad + " refused" : ""));
process.exit(bad ? 1 : 0);
