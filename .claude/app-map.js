#!/usr/bin/env node
/* app-map.js — a navigable map of app.js.
 *
 * WHY THIS EXISTS, AND WHY IT IS A MAP RATHER THAN A SPLIT. app.js is one 2.58 MB file and
 * 38,000 lines, which makes it both the biggest thing on the eager path and the hardest file
 * in the repo to find your way around. The obvious answer is to break it into several files.
 * It is the wrong answer, and the reason is structural rather than stylistic:
 *
 *   app.js is a SINGLE IIFE under "use strict", and its ~1,560 functions share one closure --
 *   S, CARDS, TREE, render, route, t, save, ADMIN_EDITS and the rest are closure variables, not
 *   globals. Exactly 14 things are deliberately put on `window`. Splitting the file across
 *   several <script> tags means every one of those shared names has to become a property of a
 *   namespace object (thousands of call sites), or become a true global -- which would leak the
 *   whole application surface onto `window`, where a community deck's sanitized HTML and any
 *   browser extension can reach it. The first is a multi-session refactor with no test that can
 *   prove closure-equivalence; the second is a security regression sold as tidying.
 *
 * So the file stays whole and this makes it navigable instead: every section banner and every
 * top-level function, with line numbers and sizes, so "where is the scheduler" is a command.
 *
 *   node .claude/app-map.js                  the section map
 *   node .claude/app-map.js --functions      every top-level function, by line
 *   node .claude/app-map.js --big [N]        the N largest sections (default 20)
 *   node .claude/app-map.js --find <re>      sections and functions matching a pattern
 *
 * Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path");
const SRC = path.join(__dirname, "..", "app.js");
const text = fs.readFileSync(SRC, "utf8");
const lines = text.split("\n");

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

/* A section is a DASHED banner comment at the IIFE's own indent:
 *
 *     /* ---------- the day boundary ---------- *\/
 *
 * and nothing else. The first cut also accepted any SHOUTED opening line, on the theory that
 * app.js marks its important blocks that way -- and it does, but so does every long prose
 * comment inside a function, because the house style opens an explanation with its conclusion
 * in capitals. The map then listed "THE POOL IS `whatyear.js`, NOT THE CARDS" as a 266 KB
 * section, which is a sentence about a minigame's draw, not a division of the file. A map that
 * invents sections is worse than no map: it is read as structure. The dashed banners are the real
 * ones, and how many there are is PRINTED rather than stated here -- this line said 128 and the file
 * has grown past it, which is the whole argument of check-claims.js one file down. */
const BANNER = /^ {2}\/\* *-{3,} *([^\n*]+?) *-{3,}/;
const secs = [];
lines.forEach((l, i) => {
  const m = BANNER.exec(l);
  if (!m) return;
  let name = m[1].replace(/\s*\(.*$/, "").replace(/[:,.]$/, "").trim();
  if (name.length > 74) name = name.slice(0, 71) + "…";
  secs.push({ line: i + 1, name });
});
// byte size of each section = up to the next banner
secs.forEach((s, i) => {
  const end = i + 1 < secs.length ? secs[i + 1].line - 1 : lines.length;
  s.end = end;
  s.bytes = lines.slice(s.line - 1, end).reduce((a, l) => a + l.length + 1, 0);
});

const FN = /^ {2}(?:async +)?function +([A-Za-z_$][\w$]*)/;
const fns = [];
lines.forEach((l, i) => { const m = FN.exec(l); if (m) fns.push({ line: i + 1, name: m[1] }); });

const KB = (n) => (n / 1024).toFixed(0).padStart(5) + " KB";

if (has("--find")) {
  const rx = new RegExp(val("--find", "."), "i");
  console.log("\n\x1b[1mSECTIONS\x1b[0m");
  secs.filter((s) => rx.test(s.name)).forEach((s) => console.log(`  app.js:${String(s.line).padEnd(6)} ${KB(s.bytes)}  ${s.name}`));
  console.log("\n\x1b[1mFUNCTIONS\x1b[0m");
  fns.filter((f) => rx.test(f.name)).forEach((f) => console.log(`  app.js:${String(f.line).padEnd(6)} ${f.name}`));
  console.log();
  process.exit(0);
}
if (has("--functions")) {
  fns.forEach((f) => console.log(`app.js:${String(f.line).padEnd(6)} ${f.name}`));
  console.log(`\n${fns.length} top-level functions\n`);
  process.exit(0);
}
if (has("--big")) {
  const n = +val("--big", 20) || 20;
  console.log(`\n\x1b[1mTHE ${n} LARGEST SECTIONS\x1b[0m\n`);
  [...secs].sort((a, b) => b.bytes - a.bytes).slice(0, n)
    .forEach((s) => console.log(`  ${KB(s.bytes)}  app.js:${String(s.line).padEnd(6)} ${s.name}`));
  console.log();
  process.exit(0);
}

console.log(`\n\x1b[1mapp.js\x1b[0m — ${(text.length / 1048576).toFixed(2)} MB, ${lines.length.toLocaleString()} lines, ` +
            `${fns.length.toLocaleString()} top-level functions, ${secs.length} sections\n`);
/* MEASURED, NOT STATED. This line read "only 14 things" for months against a real 27, which is the
   one figure on the page a reader might act on -- the argument for keeping app.js whole is that
   splitting it would leak the closure onto `window`, and how much is already there is the premise. */
const onWindow = new Set((text.match(/window\.[A-Za-z_$][\w$]*\s*=(?!=)/g) || [])
  .map((s) => s.slice(7).replace(/\s*=$/, "")));
console.log("  \x1b[2mIt is ONE IIFE under \"use strict\": every one of those functions shares a single\x1b[0m");
console.log(`  \x1b[2mclosure, and ${onWindow.size} things are put on \`window\`. That is why it is one file — see\x1b[0m`);
console.log("  \x1b[2mthis script's own header before proposing to split it.\x1b[0m\n");
console.log("  \x1b[2mA section runs from its banner to the NEXT banner, so its name is the name of the\x1b[0m");
console.log("  \x1b[2mblock it OPENS, not a summary of everything under it. Read a large one as \"starts\x1b[0m");
console.log("  \x1b[2mhere\", not as \"is all about this\".\x1b[0m\n");
secs.forEach((s) => {
  const n = fns.filter((f) => f.line >= s.line && f.line <= s.end).length;
  console.log(`  ${KB(s.bytes)}  ${String(n).padStart(4)} fn  app.js:${String(s.line).padEnd(6)} ${s.name}`);
});
console.log(`\n  --big / --functions / --find <re> for other views.\n`);
