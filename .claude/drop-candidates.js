#!/usr/bin/env node
// WHICH CITATION ON AN OVER-CITED CARD IS CHEAPEST TO DROP —
//   node .claude/drop-candidates.js [--prefix=gr-] [--card=<id>]
//
// `check-cards.js` rule 1 names the cards resting more than two of their sources on one author. It
// cannot say what to DO about one, and the obvious answer — drop a citation — is right on some cards
// and destructive on others, because a citation is only free to drop if some OTHER source already
// carries every claim its markers sit on. This measures that, per citation:
//
//   alone=N   sentences whose ONLY marker is this citation. Every one of them loses its source.
//   shared=N  sentences that cite it beside another source, which may already carry the claim.
//
// A citation at alone=0 is a CANDIDATE and never a verdict. Twice now the co-cited source turned out
// not to carry the claim at all — `gr-227`'s weight standard, and `ps-048`, where the sentence QUOTES
// the words of the citation that looked free. **Read the sentence before dropping anything.**
//
// It also states the constraint that has to be checked BEFORE the research rather than after: a card
// at exactly SRC_TARGET sources cannot lose one at all, so it needs a new source or a legitimate
// citation split first. That is what cost `wh-412` a round.
//
// Report-only; exits 0. Not part of the site.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const { loadCards } = require("./card-io");

/* The author rule is `check-cards.js`'s and is SLICED OUT BY TEXT rather than copied, for the reason
   that file slices its own exemptions out of `card-focus.js`: a second copy goes stale on a change made
   in a file nobody here has reason to open, and the two tools would then disagree about which card is
   over-cited at all. The run STOPS if the slice fails, rather than silently measuring something else. */
const CHECK = fs.readFileSync(path.join(__dirname, "check-cards.js"), "utf8");
function slice(startRe, endRe, what) {
  const a = CHECK.search(startRe);
  if (a < 0) die("cannot find " + what + " in check-cards.js — it has been renamed or moved. Fix this slice rather than letting the run measure something else.");
  const b = CHECK.slice(a).search(endRe);
  if (b < 0) die("cannot find the end of " + what + " in check-cards.js.");
  return CHECK.slice(a, a + b);
}
function die(m) { console.error("ERROR: " + m); process.exit(1); }
const plainSrc = slice(/^const plain = /m, /\n/, "plain()");
const authorSrc = slice(/^function authorOf\(src\) \{/m, /^\}$/m, "authorOf()") + "}";
const surnameSrc = slice(/^const surnameKey = /m, /\n/, "surnameKey()");
const { authorOf, surnameKey } = new Function(
  plainSrc + "\n" + authorSrc + "\n" + surnameSrc + "\nreturn { authorOf, surnameKey };")();

/* The bar is app.js's, read rather than restated — the same rule add-sources.js follows. */
const APP = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
// …and it is PER CARD (tiered by difficulty) since Sep 2026 — src-target.js slices it and stops if it cannot
const { srcTargetFor } = require("./src-target.js");

/* The over-cited cards come from check-cards.js's own report, so this can never drift from what that
   tool considers a violation — including its ancient-author and institutional exemptions. */
const args = process.argv.slice(2);
const filters = args.filter(a => /^--prefix=/.test(a));
const only = (args.find(a => a.startsWith("--card=")) || "").slice(7);
/* `--prefix` IS FORWARDED rather than applied here, so check-cards.js decides both which cards are
   over-cited and which of them this run is about — filtering afterwards lets the two tools disagree
   about what a prefix selects. `--card` is filtered locally because check-cards.js has no such flag
   (that is card-focus.js's and check-citations.js's); forwarding it would hand check-cards an argument
   it silently ignores, and the run would print the whole corpus while claiming to print one card. */
/* THE REPORT IS CAPTURED THROUGH A FILE, NOT A PIPE, and that is not fastidiousness. Piping
   check-cards.js's stdout into execFileSync returned a DIFFERENT, SHORTER string on different runs —
   42,785 bytes once and 32,811 another, the second cut off before the over-cited section entirely.
   A truncated capture makes this tool print "no over-cited card", which is the one answer it must
   never give by accident. Writing to a descriptor is synchronous and complete, and the read that
   follows cannot see a half-flushed buffer. */
const { execFileSync } = require("child_process");
const os = require("os");
const tmp = path.join(os.tmpdir(), "folio-drop-candidates-" + process.pid + ".txt");
let report;
try {
  const fd = fs.openSync(tmp, "w");
  try {
    execFileSync(process.execPath, [path.join(__dirname, "check-cards.js"), "--report", ...filters],
      { stdio: ["ignore", fd, "inherit"] });
  } finally { fs.closeSync(fd); }
  report = fs.readFileSync(tmp, "utf8");
} catch (e) { die("check-cards.js would not run: " + (e && e.message)); }
finally { try { fs.unlinkSync(tmp); } catch (e) {} }
/* An empty capture is a failed run wearing the shape of a clean corpus. */
if (!report.trim()) die("check-cards.js produced no report at all.");
const at = report.indexOf("FAIL: over-cited");
/* indexOf returning -1 would slice the LAST CHARACTER and report a clean corpus, which is the one
   answer this tool must never give by accident. */
if (at < 0) { console.log("check-cards.js reports no over-cited card" + (filters.length ? " under " + filters.join(" ") : "") + "."); process.exit(0); }
const FAILS = [...report.slice(at).matchAll(/^ {2}([a-z0-9-]+): (.+?) in \d+ of \d+ sources$/gm)].map(m => ({ id: m[1], who: m[2] }));
if (!FAILS.length) die("found the over-cited heading but parsed no rows out of it — check-cards.js's report format has changed.");
const prefix = "";

const { cards } = loadCards();
const byId = new Map(cards.map(c => [c.id, c]));

/* Markers sit BETWEEN the full stop and the space, so a plain lookbehind on ". " sees one long
   sentence. They are lifted out to a token the split can step over and put back. */
function sentencesWithMarkers(abstract) {
  const ann = String(abstract || "")
    .replace(/<sup class="fn" data-fn="(\d+)"><\/sup>/g, "{{$1}}")
    .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  return ann.split(/(?<=[.!?](?:\{\{\d+\}\})*)\s+(?=[A-Z“"‘])/)
            .map(s => [...s.matchAll(/\{\{(\d+)\}\}/g)].map(m => +m[1]));
}

let shown = 0, anyCandidate = 0, blockedByBar = 0;
for (const f of FAILS) {
  if (prefix && !f.id.startsWith(prefix)) continue;
  if (only && f.id !== only) continue;
  const c = byId.get(f.id);
  if (!c) { console.log(f.id + ": not in the corpus"); continue; }
  const srcs = c.sources || [];
  const mine = srcs.map((s, i) => surnameKey(authorOf(s)) === f.who ? i + 1 : 0).filter(Boolean);
  const rows = sentencesWithMarkers(c.abstract);
  const stat = {};
  for (const m of mine) stat[m] = { alone: 0, shared: 0 };
  for (const fns of rows) for (const m of mine) if (fns.includes(m)) (fns.length === 1 ? stat[m].alone++ : stat[m].shared++);
  const cheap = mine.filter(m => stat[m].alone === 0);
  const underBar = srcs.length - 1 < srcTargetFor(c);
  shown++;
  if (cheap.length && !underBar) anyCandidate++;
  if (underBar) blockedByBar++;
  console.log(f.id + "  " + f.who + "  " + mine.length + " of " + srcs.length + " sources"
    + (underBar ? "   [!] at the bar — a drop needs a NEW source or a citation split first" : ""));
  for (const m of mine) {
    const s = stat[m];
    console.log("   [" + m + "] alone=" + s.alone + " shared=" + s.shared
      + (s.alone === 0 ? "   <= candidate: no sentence rests on it alone" : ""));
  }
  if (!cheap.length) console.log("   -> nothing droppable: every one carries a sentence by itself, so this card wants a new source and a re-pointed claim rather than a drop.");
}
/* A run that printed nothing should say why. "0 cards" reads identically whether the corpus is clean,
   the prefix matched nothing, or the card named is simply not over-cited. */
if (!shown) {
  if (only) console.log(only + " is not in check-cards.js's over-cited list (it may be clean, or may not exist).");
  else console.log("No over-cited card matched" + (filters.length ? " " + filters.join(" ") : "") + ".");
}
console.log("\n" + shown + " over-cited card(s); " + anyCandidate + " with a drop candidate that also clears the "
  + SRC_TARGET + "-source bar; " + blockedByBar + " sitting at the bar.");
console.log("A candidate is a CANDIDATE. Read the sentence and confirm the co-cited source carries the claim.");
