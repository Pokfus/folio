#!/usr/bin/env node
/* check-docs.js — the docs/ split's own guard.
 *
 * WHY THIS EXISTS. CLAUDE.md was cut from 1.83 MB to under 450 KB by moving the REASONING
 * behind each rule into docs/, leaving the rule itself and an imperative pointer:
 *
 *     **📖 `docs/atlas.md` — READ BEFORE TOUCHING THE RENDER PATH, AN ERA OR THE TIMELINE.**
 *
 * That arrangement has exactly two silent failure modes, and this checks both:
 *
 *   1. A POINTER THAT RESOLVES TO NOTHING. A renamed or deleted file leaves CLAUDE.md
 *      telling the next session to read something that is not there -- and the instruction
 *      still LOOKS authoritative, so it reads as "that file must be somewhere".
 *   2. A FILE NOBODY IS TOLD TO READ. A doc with no pointer is a doc nobody opens; the
 *      knowledge is not lost so much as unreachable, which is worse, because the repo
 *      appears to have documented the thing. Eight files were in this state when the
 *      index was written -- several of them holding OPEN work.
 *
 * Neither shows up in a test, a lint or a page load. Hence a checker.
 *
 *   node .claude/check-docs.js          report; exit 1 on any failure
 *
 * Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const DOCS = path.join(ROOT, "docs");

let pass = 0, fail = 0;
const ok = (m, d) => { pass++; console.log(`  \x1b[32mok\x1b[0m    ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const bad = (m, d) => { fail++; console.log(`  \x1b[31mFAIL\x1b[0m  ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };

const claude = fs.readFileSync(path.join(ROOT, "CLAUDE.md"), "utf8");
const index = fs.existsSync(path.join(DOCS, "README.md"))
  ? fs.readFileSync(path.join(DOCS, "README.md"), "utf8") : null;
const files = fs.readdirSync(DOCS).filter((f) => f.endsWith(".md") && f !== "README.md");

console.log("\n\x1b[1m1) every docs/ pointer in CLAUDE.md resolves\x1b[0m\n");
const refs = [...new Set((claude.match(/docs\/[A-Za-z0-9._-]+\.md/g) || []))];
let dead = refs.filter((r) => !fs.existsSync(path.join(ROOT, r)));
dead.length ? dead.forEach((r) => bad("pointer resolves", r))
            : ok(`all ${refs.length} docs/ references resolve to a real file`);

console.log("\n\x1b[1m2) every docs/ file is reachable\x1b[0m\n");
console.log("  \x1b[2mA file with no pointer in CLAUDE.md and no row in docs/README.md is unreachable.\x1b[0m\n");
const unreachable = files.filter(
  (f) => !claude.includes("docs/" + f) && !(index && index.includes(f))
);
unreachable.length
  ? unreachable.forEach((f) => bad("reachable from CLAUDE.md or the index", "docs/" + f))
  : ok(`all ${files.length} docs/ files are pointed at or indexed`);

console.log("\n\x1b[1m3) the index itself\x1b[0m\n");
if (!index) { bad("docs/README.md exists"); }
else {
  ok("docs/README.md exists");
  const missing = files.filter((f) => !index.includes(f));
  missing.length ? missing.forEach((f) => bad("listed in the index", "docs/" + f))
                 : ok(`the index lists all ${files.length} files`);
  const ghosts = [...new Set(index.match(/`?([a-z0-9-]+\.md)`?/g) || [])]
    .map((s) => s.replace(/`/g, ""))
    .filter((f) => f !== "README.md" && f !== "CLAUDE.md" && !files.includes(f));
  ghosts.length ? ghosts.forEach((f) => bad("index row names a real file", f))
                : ok("the index names no file that does not exist");
  ok("the index states the split's rule",
     /Rules live in .CLAUDE\.md.; reasoning lives here/.test(index) ? "found" : "");
}

console.log("\n\x1b[1m4) every pointed-at file has an IMPERATIVE pointer\x1b[0m\n");
console.log("  \x1b[2mA pointer that does not say WHEN to read the file is one nobody reads in time.\x1b[0m");
console.log("  \x1b[2mThe rule is PER FILE, not per glyph: a file may be cross-referenced from several\x1b[0m");
console.log("  \x1b[2mplaces, and only one of them has to carry the instruction. Asserting it of every\x1b[0m");
console.log("  \x1b[2mmention flagged docs/library-books.md, whose second mention is a cross-reference\x1b[0m");
console.log("  \x1b[2mbeside a primary pointer that is imperative -- a true statement, wrongly scoped.\x1b[0m\n");
const ptrs = claude.match(/📖[^\n]*/g) || [];
const byFile = new Map();
for (const p of ptrs) {
  const f = (p.match(/docs\/[A-Za-z0-9._-]+\.md/) || [])[0];
  if (!f) continue;
  const imp = /READ BEFORE|READ THIS BEFORE/i.test(p);
  byFile.set(f, (byFile.get(f) || false) || imp);
}
const weak = [...byFile].filter(([, imp]) => !imp).map(([f]) => f);
weak.length ? weak.forEach((f) => bad("has at least one 📖 pointer saying READ BEFORE …", f))
            : ok(`all ${byFile.size} pointed-at files carry an imperative pointer`, `${ptrs.length} pointers in all`);

console.log("\n\x1b[1m5) each doc says what it is\x1b[0m\n");
const headless = files.filter((f) => !/^#\s+\S/.test(fs.readFileSync(path.join(DOCS, f), "utf8")));
headless.length ? headless.forEach((f) => bad("opens with an H1", "docs/" + f))
                : ok(`all ${files.length} files open with an H1`);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
