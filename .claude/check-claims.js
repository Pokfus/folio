/* .claude/check-claims.js — CLAUDE.md'S OWN FIGURES, MEASURED.
   node .claude/check-claims.js [--all]

   CLAUDE.md is the ONLY operational memory a cloud session has — the file says so itself — and it is
   full of hand-written figures about things that can be counted: how many themes, how many books, how
   many cards in each collection, how many assertions a suite carries, how big app.js is. Nothing had
   ever compared one of them to the repository.

   THE FILE ALREADY KNEW. It warns against quoting a figure in NINE places — "read `THEMES` rather than
   quoting it", "DO NOT QUOTE A FIGURE HERE", "Count them rather than quoting that" — and every one of
   those warnings is a scar: the theme count said 8 for months and then 6, and the eager path's size
   drifted to being four times understated with "re-measure it rather than quoting it" written beside
   it. `check-sizes.js` exists because a warning cannot measure. **This is the same argument applied to
   the rest of the file.**

   ITS FIRST RUN (Sep 2026, batch E51) FOUND EIGHTEEN FIGURES WRONG, several by a factor of four: the
   collection index table — the lookup a session reads to decide what to write next — had Ancient Rome
   as "empty" against 100 shipped cards, Ancient Greece at 180 against 400, and the United States
   geography deck at 5 against 100; app.js was described as 2.57 MB and 38,000 lines against a real
   2.84 MB and 41,915; and one suite's assertion count was pinned at two different numbers in the same
   file, neither of them right.

   IT REPORTS EVIDENCE, NEVER A VERDICT, and exits 0. A figure it cannot measure is not reported at all
   rather than guessed at — see WHAT IT DOES NOT ASK below.

   Not part of the site. */

const fs = require("fs"), path = require("path"), cp = require("child_process");
const ROOT = path.join(__dirname, "..");
const MD = fs.readFileSync(path.join(ROOT, "CLAUDE.md"), "utf8");
const ALL = process.argv.includes("--all");

const rows = [];
/* label, what CLAUDE.md says (null when the pattern finds nothing), what the repo says, and a note. */
function claim(label, said, got, note) { rows.push({ label, said, got, note }); }
function find(rx, cast) {
  const m = rx.exec(MD);
  if (!m) return null;
  const v = m[1].replace(/,/g, "");
  return cast === "n" ? Number(v) : v;
}
function fresh() { global.window = { FOLIO_BOOKS_IN: [], FOLIO_BOOK_ORIG_IN: [] }; return global.window; }
function load(rel) {
  const p = path.join(ROOT, rel);
  delete require.cache[require.resolve(p)];
  require(p);
}

/* ---------- the collection index table, which is the lookup a session reads first ---------- */
{
  const w = fresh(); load("data.js");
  const byPrefix = Object.create(null);
  for (const c of w.CARD_DATA) {
    const m = /^([a-z]+)-\d/.exec(c.id);
    if (m) byPrefix[m[1]] = (byPrefix[m[1]] || 0) + 1;
  }
  /* Each row of the table is `| Name | id | prefix | plan | decks/leaves | state |`, and the state cell
     is prose. Only a cell that STATES A NUMBER of cards, or says "empty", makes a checkable claim. */
  const rx = /^\|\s*([^|]+?)\s*\|\s*`([^`]+)`\s*\|\s*`([a-z]+)-`\s*\|[^|]*\|[^|]*\|\s*([^|]*?)\s*\|\s*$/gm;
  let m;
  while ((m = rx.exec(MD))) {
    const name = m[1], prefix = m[3], state = m[4];
    const got = byPrefix[prefix] || 0;
    const n = /(?:^|[^\d])(\d[\d,]*)\s+cards/.exec(state);
    const empty = /^empty\b/.test(state);
    if (n) claim("index table — " + name, Number(n[1].replace(/,/g, "")), got, prefix + "-");
    else if (empty) claim("index table — " + name, 0, got, prefix + "- (row says \"empty\")");
    else if (ALL) claim("index table — " + name, got, got, "no countable claim: " + JSON.stringify(state.slice(0, 40)));
  }
  claim("cards in data.js", find(/(\d[\d,]*) cards in `data\.js`/, "n"), w.CARD_DATA.length);
}

/* ---------- the shelf ---------- */
{
  const w = fresh();
  for (const f of fs.readdirSync(path.join(ROOT, "books")).filter((f) => f.endsWith(".js")).sort()) load("books/" + f);
  claim("books on the shelf", /Currently forty-eight books/.test(MD) ? 48 : null, w.FOLIO_BOOKS_IN.length, "\"Currently forty-eight books\"");
  claim("original-language columns", /Currently thirty-two originals/.test(MD) ? 32 : null, w.FOLIO_BOOK_ORIG_IN.length, "\"Currently thirty-two originals\"");
}

/* ---------- the glossary, and the two completeness claims that ride on its total ---------- */
{
  const w = fresh(); load("glossary.js"); load("glossary-extra.js");
  const extra = (w.GLOSSARY_EXTRA_IN || [])[0] || {};
  const terms = Object.keys(w.GLOSSARY || {}).length;
  const cited = Object.keys(extra.GLOSSARY_SOURCES || w.GLOSSARY_SOURCES || {}).length;
  claim("glossary terms (citation pass)", find(/all (\d[\d,]*) terms are cited and at the bar/, "n"), terms);
  claim("glossary terms (length pass)", find(/(\d[\d,]*) of \d[\d,]* terms are inside the bar/, "n"), terms);
  /* THE COMPLETENESS CLAIMS THEMSELVES, which is the half that matters and the half a total obscures.
     CLAUDE.md says both passes are COMPLETE, and that is true only while every term carries citations
     and every description sits inside the length bar — a claim that survives the glossary growing, as
     it has from 477 terms to more than three times that, precisely because the rule holds for a new
     term. The totals are what go stale; these do not. */
  claim("glossary terms carrying citations", terms, cited, "the citation pass is complete only while these agree");
}

/* ---------- app.js, ASKED OF app-map.js RATHER THAN MEASURED AGAIN ----------
   A second definition of "a section banner" is a second answer, and the first cut of this file had
   one: it counted every dashed comment and reported 207 where app-map reports 159, because app-map
   requires the banner to sit at the IIFE's own indent and to carry dashes on BOTH sides — a rule its
   own header argues for at length. Two scripts disagreeing about a number in the same repository is
   worse than either being wrong. So app-map's header line is parsed, and it is the authority. */
{
  let head = "";
  try { head = cp.execSync("node " + JSON.stringify(path.join(ROOT, ".claude/app-map.js")),
    { cwd: ROOT, encoding: "utf8" }).replace(/\x1b\[[\d;]*m/g, ""); } catch (e) { head = ""; }
  const m = /app\.js — ([\d.]+) MB, ([\d,]+) lines, ([\d,]+) top-level functions, (\d+) sections/.exec(head);
  const w = /closure, and (\d+) things are put on `window`/.exec(head);
  if (!m) claim("app.js shape", "app-map.js could not be read", "—", "the four figures below are unchecked");
  else {
    claim("app.js size", find(/\[--functions\] \[--find <re>\]`\.\s*([\d.]+) MB/, "n"), Number(m[1]), "MB, per app-map.js");
    claim("app.js lines", find(/MB and ([\d,]+) lines is hard to find your way around/, "n"), Number(m[2].replace(/,/g, "")));
    claim("app.js section banners", find(/lists its (\d+) dashed section banners/, "n"), Number(m[4]), "per app-map.js's own rule");
  }
  if (w) claim("things app.js puts on `window`", find(/\*\*(\d+)\*\* things are put on `window`/, "n"),
    Number(w[1]), "per app-map.js");
}

/* ---------- the importer's layouts ---------- */
{
  const src = fs.readFileSync(path.join(ROOT, ".claude/fetch-book.js"), "utf8");
  const set = new Set((src.match(/layout: "([a-z]+)"/g) || []).map((s) => s.slice(9, -1)));
  const words = { "Twenty-two": 22, "Twenty-three": 23, "Twenty-four": 24, "Twenty-five": 25, "Twenty-six": 26, "Twenty-seven": 27 };
  const m = /\*\*(Twenty-\w+) layouts\*\* exist/.exec(MD);
  claim("importer layouts", m ? words[m[1]] : null, set.size, m ? "\"" + m[1] + " layouts\"" : "");
}

/* ---------- the shelves of collectible and generated content ---------- */
{
  let w = fresh(); load("artefacts.js");
  const arte = Array.isArray(w.ARTEFACTS) ? w.ARTEFACTS.length : Object.keys(w.ARTEFACTS || {}).length;
  claim("artefacts", find(/the bar \*\*\(batches 1–15\)|citing the (\d+) artefacts/, "n"), arte);

  w = fresh(); load("crossword.js");
  claim("crossword answers", find(/bank of (\d+) answers/, "n"), (w.CROSSWORD || []).length);

  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const themes = /const THEMES = \[([\s\S]*?)\];/.exec(src);
  claim("themes", find(/\*\*(\d+) themes\*\* via CSS custom properties/, "n"), themes ? (themes[1].match(/"/g) || []).length / 2 : 0);

  w = fresh(); load("lang-decks.js");
  const L = w.LANG_DECKS || [];
  const langs = new Set(L.map((d) => d.lang));
  claim("language deck files", find(/Currently \*\*(\d+) files across \d+ languages\*\*/, "n"), L.length);
  claim("language deck languages", find(/Currently \*\*\d+ files across (\d+) languages\*\*/, "n"), langs.size);
  claim("language deck cards", find(/\*\*([\d,]+) cards over [\d,]+ notes/, "n"), L.reduce((a, d) => a + (d.cards || 0), 0));
  claim("language deck notes", find(/\*\*[\d,]+ cards over ([\d,]+) notes/, "n"), L.reduce((a, d) => a + (d.notes || 0), 0));
  claim("language deck megabytes", find(/cards over [\d,]+ notes, (\d+) MB\*\*/, "n"),
    Math.round(L.reduce((a, d) => a + (d.bytes || 0), 0) / 1048576));
}

/* ---------- the suites: the files, the split, and the counts that can be had without a browser ----------
   A BROWSER SUITE'S COUNT IS NOT ASKED FOR, and that is deliberate rather than an omission: running
   twenty-six of them takes the best part of an hour, which is not a check anybody runs before a commit.
   What is asked is every count that costs a second, and those are exactly where the drift was found. */
{
  const files = fs.readdirSync(path.join(ROOT, ".claude")).filter((f) => /^test-.*\.js$/.test(f));
  const noBrowser = files.filter((f) => !/playwright/.test(fs.readFileSync(path.join(ROOT, ".claude", f), "utf8")));
  const suites = files.filter((f) => f !== "test-noise.js");
  claim("committed regression suites", /\*\*Forty-seven committed regression tests\*\*/.test(MD) ? 47 : null, suites.length,
    "test-*.js, excluding the shared console filter");
  claim("suites needing no browser", 7, noBrowser.filter((f) => f !== "test-noise.js").length, "named individually in the Testing section");

  const pinned = Object.create(null);
  const rx = /`node \.claude\/(test-[a-z0-9-]+)\.js`(.{0,220}?)(\d[\d,]*)\s+assertions/gs;
  let m;
  while ((m = rx.exec(MD))) {
    const k = m[1], v = Number(m[3].replace(/,/g, ""));
    if (pinned[k] != null && pinned[k] !== v) claim("assertions — " + k, pinned[k] + " and " + v, "—", "PINNED TWICE, at two different numbers");
    pinned[k] = v;
  }
  for (const f of noBrowser) {
    const k = f.replace(/\.js$/, "");
    if (pinned[k] == null) continue;
    let out = "";
    try { out = cp.execSync("node " + JSON.stringify(path.join(ROOT, ".claude", f)), { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
    catch (e) { out = String((e.stdout || "") + (e.stderr || "")); }
    const tot = /(\d+) passed/.exec(out);
    const n = tot ? Number(tot[1]) : (out.match(/^\s*ok\s/gm) || []).length;
    claim("assertions — " + k, pinned[k], n, "run, not estimated");
  }
}

/* ---------- the names CLAUDE.md tells you to grep for ----------
   Every suite bullet ends "**Re-run after touching `a` / `b` / `c` …**", and those lists are how a
   session decides which suite a change belongs to. A name in one that no longer exists in the code is
   a dead pointer: the session greps, finds nothing, and either concludes the suite is stale or goes
   looking for something that was renamed years ago. There are 379 of them across 31 lists.

   THE CODE IS THE HAYSTACK, AND CLAUDE.md AND docs/ ARE NOT IN IT. A name that survives only in this
   file's own prose is exactly the case being looked for, so including the prose would make the check
   answer its own question. */
{
  const dirs = [".git", "node_modules", "books", "decks", "book-cache", "docs"];
  const files = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) { if (!dirs.includes(e.name)) walk(path.join(d, e.name)); }
      else if (/\.(js|css|html|json|sql)$/.test(e.name)) files.push(path.join(d, e.name));
    }
  })(ROOT);
  const seen = new Set();
  const tok = /[A-Za-z_$][A-Za-z0-9_$-]{2,}/g;
  for (const f of files) {
    let src = "";
    try { src = fs.readFileSync(f, "utf8"); } catch (e) { continue; }
    let m; tok.lastIndex = 0;
    while ((m = tok.exec(src))) seen.add(m[0]);
  }
  const named = new Set();
  const blocks = MD.match(/\*\*Re-run after (?:touching|any)[\s\S]{20,3000}?\*\*/g) || [];
  for (const b of blocks) for (const m of b.matchAll(/`([A-Za-z_$][A-Za-z0-9_$]{2,})`/g)) named.add(m[1]);
  const dead = [...named].filter((n) => !seen.has(n)).sort();
  claim("names in a Re-run list that exist", 0, dead.length,
    dead.length ? dead.join(", ") : named.size + " checked across " + blocks.length + " lists");
}

/* ---------- and the names it says are GONE ----------
   The mirror, and it is a DECLARED list rather than a sweep. A free-text sweep for "`x` is deleted"
   was tried and is not usable: the claims are written in a dozen prose shapes, and the identifiers
   caught are as often `cards`, `glossary` and `find` — ordinary words in backticks — as they are real
   symbols. Nine of eleven hits were noise. So the symbols are named here, each verified once against
   comment-stripped source, and the check is that they have not come BACK.

   COMMENTS ARE STRIPPED FIRST, for the reason adBaitCheck strips them: app.js records most of these
   removals in a comment that names the thing removed, and a check that could not tell a gravestone
   from a body would fail on every one. */
{
  const GONE = ["cardWithQuestion", "COLLECTION_NUMERALS", "numeralIn", "cnNumeral", "romanNumeral",
    "greekNumeral", "devanagariNumeral", "cyrillicNumeral", "levelBadgeMarkup", "fromHome", "GB_SLOP",
    "dailyPick", "startMiniGlobe", "langDeckMB", "setMode"];
  /* …and the one the file says SURVIVES, unused. Checking that direction too is what stops the list
     above from being a list of names that were never there. */
  const KEPT = ["traceMapToGeo"];
  let code = "";
  for (const f of ["app.js", "styles.css", "index.html", "sw.js"]) {
    let src = "";
    try { src = fs.readFileSync(path.join(ROOT, f), "utf8"); } catch (e) { continue; }
    code += src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
  }
  const here = (n) => new RegExp("(?<![\\w$])" + n + "(?![\\w$])").test(code);
  const back = GONE.filter(here), lost = KEPT.filter((n) => !here(n));
  claim("symbols CLAUDE.md says are gone", 0, back.length, back.length ? back.join(", ") : GONE.length + " checked");
  claim("symbols it says survive unused", 0, lost.length, lost.length ? lost.join(", ") : KEPT.join(", "));
}

/* ---------- report ---------- */
let bad = 0, ok = 0, skipped = 0;
const out = [];
for (const r of rows) {
  if (r.said == null) { skipped++; if (ALL) out.push("  ????  " + r.label + " — no such figure in CLAUDE.md"); continue; }
  const agree = String(r.said) === String(r.got);
  if (agree) { ok++; if (ALL) out.push("  ok    " + r.label.padEnd(38) + String(r.got)); continue; }
  bad++;
  out.push("  DRIFT " + r.label.padEnd(38) + "CLAUDE.md says " + r.said + ", the repo says " + r.got + (r.note ? "   (" + r.note + ")" : ""));
}
console.log("CLAUDE.md's own figures, measured\n");
console.log(out.join("\n") || "  (nothing to report)");
console.log("\n" + (ok + bad) + " figures checked, " + bad + " drifted" + (skipped ? ", " + skipped + " not found in the file" : ""));
console.log(bad
  ? "Repair the FILE, not the repo: these are descriptions, and the repository is the fact."
  : "Every figure this can measure matches the repository.");

/* WHAT IT DOES NOT ASK, stated rather than left to be discovered.
     · A BROWSER SUITE'S ASSERTION COUNT. Twenty-six suites at up to fifteen minutes each is not a
       pre-commit check; the seven that need no browser are run, and they are where three of E51's
       drifts were. Re-pin a browser suite's count from the run you did when you changed it.
     · ANY FIGURE THAT IS A JUDGEMENT rather than a count — "about a third of them", "roughly 30 spare
       words", "~1,250 top-level functions" — where the tilde is doing honest work and a checker
       insisting on 1,300 would be reporting prose for being prose.
     · THE FIGURES IN docs/. There are fifty-five of those files and most of their numbers are a record
       of what a batch measured ON THE DAY, which is exactly what should NOT be updated: a batch log
       saying "3,094 articles" is right about the day it was written. CLAUDE.md is different because it
       is written in the present tense as the state of the repository. */
