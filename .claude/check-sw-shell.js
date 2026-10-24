/* check-sw-shell.js — the service worker's app shell agrees with what index.html loads (no browser, no network).

     node .claude/check-sw-shell.js

   WHY (Oct 2026, docs/downloadable-app-plan.md §5). sw.js keeps a fixed list of the files an open of the app
   needs (`SHELL`) and serves them from the phone as one set. That list had drifted: four eager scripts and the
   fonts were added to index.html over the months and never to the worker, so an installed Folio opened offline
   before a second online visit could not find four of its own scripts. Nothing failed loudly; a reader on a
   train simply got a broken page. This check makes the drift a red CI step instead:

     1. every <script src> and stylesheet <link> in index.html is in SHELL
     2. every SHELL entry exists on disk (a renamed file would otherwise be fetched, fail, and be left out)
     3. every icon the manifest and index.html name is on disk and in SHELL
     4. every file the "Keep on this device" switches ask for by name (`KEEP_FIXED` in app.js) exists
     5. _routes.json sends only /api/* to the Pages Functions, so no static file costs a Function call */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
let fails = 0;
const ok = (m) => console.log("  \x1b[32mok\x1b[0m    " + m);
const bad = (m) => { fails++; console.log("  \x1b[31mFAIL\x1b[0m  " + m); };

const sw = read("sw.js");
const m = /const SHELL = \[([\s\S]*?)\];/.exec(sw);
if (!m) { console.error("no `const SHELL = [...]` in sw.js"); process.exit(1); }
const SHELL = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
const inShell = new Set(SHELL.map((u) => u.replace(/^\.\//, "")));

console.log("\n\x1b[1m1) index.html's eager files are in the worker's shell\x1b[0m\n");
const html = read("index.html").replace(/<!--[\s\S]*?-->/g, "");
const eager = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((x) => x[1])
  .concat([...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map((x) => x[1]))
  .filter((u) => !/^(https?:|data:)/.test(u));
const missing = eager.filter((u) => !inShell.has(u));
missing.length ? missing.forEach((u) => bad(u + " is loaded by index.html but not in SHELL (sw.js)")) : ok(eager.length + " eager files, all in SHELL");

console.log("\n\x1b[1m2) every shell file exists\x1b[0m\n");
const gone = SHELL.filter((u) => u !== "./" && !fs.existsSync(path.join(ROOT, u)));
gone.length ? gone.forEach((u) => bad(u + " is in SHELL but not on disk")) : ok(SHELL.length + " entries, all present");

console.log("\n\x1b[1m3) the icons\x1b[0m\n");
const man = JSON.parse(read("manifest.json"));
const icons = (man.icons || []).map((i) => i.src)
  .concat([...html.matchAll(/<link[^>]*rel="apple-touch-icon"[^>]*href="([^"]+)"/g)].map((x) => x[1]))
  .concat([...sw.matchAll(/(?:icon|badge): "([^"]+\.png)"/g)].map((x) => x[1]));
let iconBad = 0;
for (const i of new Set(icons)) {
  if (!fs.existsSync(path.join(ROOT, i))) { bad(i + " is named but not on disk"); iconBad++; }
  else if (!inShell.has(i)) { bad(i + " is named but not in SHELL, so an offline app has no icon"); iconBad++; }
}
if (!iconBad) ok(new Set(icons).size + " icons, all present and in SHELL");

console.log("\n\x1b[1m4) the files \"Keep on this device\" names exist\x1b[0m\n");
const app = fs.readFileSync(path.join(ROOT, "app.js"), "latin1");
const k = /const KEEP_FIXED = \{([\s\S]*?)\n  \};/.exec(app);
if (!k) bad("no `const KEEP_FIXED = {...}` in app.js");
else {
  const files = [...k[1].matchAll(/"([^"]+\.(?:js|bin|json|png|css))"/g)].map((x) => x[1]);
  const lost = files.filter((f) => !fs.existsSync(path.join(ROOT, f)));
  lost.length ? lost.forEach((f) => bad(f + " is in KEEP_FIXED but not on disk")) : ok(files.length + " files, all present");
}

console.log("\n\x1b[1m5) only /api/* reaches the Pages Functions\x1b[0m\n");
try {
  const r = JSON.parse(read("_routes.json"));
  const inc = JSON.stringify(r.include || []);
  inc === '["/api/*"]' ? ok("_routes.json includes /api/* only") : bad("_routes.json includes " + inc + ", expected [\"/api/*\"]");
} catch (e) { bad("_routes.json is missing or not JSON: " + e.message); }

console.log("\n" + (fails ? "\x1b[31m" + fails + " failed\x1b[0m" : "\x1b[32mall passed\x1b[0m"));
process.exit(fails ? 1 : 0);
