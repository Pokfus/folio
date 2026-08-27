#!/usr/bin/env node
/* Does every glossary description open as a GENERAL INTRODUCTION to its own term?
 *
 *   node .claude/gloss-general.js [--list] [--tag=<kind>] [--term=<slug>]
 *
 * A gloss popup is met by a reader who may know nothing whatever about the term, so its first
 * sentence has to say what the thing IS before the rest says anything about it. The failure this
 * hunts is a description that opens on a SPECIFIC CONTEXT or a piece of research — `Tin` opened
 * "Tin travelled a long way to reach the places that used it", which is a fact about Bronze Age
 * trade and never says tin is a metal.
 *
 * THE TEST IS ON THE FIRST SENTENCE AND IS DELIBERATELY SHALLOW. It asks whether that sentence
 * predicates something of the TERM ITSELF with a copula or a naming verb — "X is a…", "X was
 * the…", "The X is…", "X names…", "X refers to…" — and reports everything else. It cannot judge
 * whether a definition is a GOOD one, so it is a prompt to read rather than a verdict: read the
 * flagged term before rewriting it, and expect false positives on terms whose subject genuinely
 * opens another way.
 */
const fs = require("fs"), path = require("path");
function loadWindow(f) { const w = {}; new Function("window", fs.readFileSync(f, "utf8"))(w); return w; }
const win = loadWindow(path.join(__dirname, "..", "glossary.js"));
const G = win.GLOSSARY || {}, TAGS = win.GLOSSARY_TAGS || {}, TITLES = win.GLOSSARY_TITLES || {};

const args = process.argv.slice(2);
const LIST = args.includes("--list");
const tagArg = (args.find(a => a.startsWith("--tag=")) || "").slice(6);
const termArg = (args.find(a => a.startsWith("--term=")) || "").slice(7);

const strip = (s) => s.replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/\s+/g, " ").trim();
// first sentence — via split-abstract.js's own splitter, which already knows about runs of
// initials, era abbreviations and decimals. A second copy of that rule here would drift from it,
// and "Jason E." as a whole sentence is exactly what a naive splitter reports.
const { pieces } = require("./split-abstract");
function firstSentence(t) { const p = pieces(t); return (p[0] || t).trim(); }
const words = (s) => s.split(/\s+/).filter(Boolean);
// the surfaces a definition may legitimately open on: the key, its display title, and their heads
function surfaces(slug) {
  const out = new Set();
  /* A key is often longer than the word a definition opens on: `Awash_River` is defined as "The
     Awash is a river of…", `Gona,_Ethiopia` as "Gona is…", `Clovis_culture` as "Clovis is…". So the
     disambiguating tail is stripped as well — a trailing parenthesis, a comma-suffix, and the
     generic noun a slug carries to keep two subjects apart. Widen this rather than the verb list:
     what is being hunted is a description that never DEFINES, not one whose key is verbose. */
  const GENERIC = /\s+(cave|river|culture|people|peoples|glaciation|mountains|mountain|island|valley|gorge|plain|plateau|hills|hill|site|tribe|dynasty|empire|kingdom|era|period|language|script|style|ware|order|tomb|grave|temple)$/i;
  const add = (s) => {
    if (!s) return;
    let v = s.trim();
    for (let i = 0; i < 4 && v; i++) {
      out.add(v.toLowerCase());
      const next = v.replace(/\s*\([^)]*\)\s*$/, "").replace(/,[^,]*$/, "").replace(GENERIC, "").trim();
      if (next === v) break;
      v = next;
    }
  };
  add(slug.replace(/_/g, " "));
  add(TITLES[slug]);
  return [...out].filter(Boolean);
}
// COPULA / NAMING verbs a definitional opening uses of its own subject
/* COPULA / NAMING verbs a definitional opening uses of its own subject. A TECHNIQUE, an
   INSTITUTION or a HYPOTHESIS is defined by what it does, so a few doing-verbs belong here too.
   What is deliberately NOT here is a verb that merely reports an event or a distribution of the
   subject ("travelled", "occurs", "descend", "denned", "lived") — that is exactly what a
   description which never defines its term opens on.
   AND EVERY ENTRY MUST BE UNUSABLE AS A NOUN IN THIS POSITION. The list once carried `places?`,
   for "the technique places the figures…", and it matched the NOUN in "Tin travelled a long way
   to reach the places that used it" — silencing the one term this audit was written for, with
   nothing to show that it had. `set`, `works`, `records`, `leaves`, `stores`, `marks`, `forms`
   and `measures` are all the same trap. Prefer reading a false positive to widening this. */
const COP = /\b(is|are|was|were|means|meant|names|named|denotes|denoted|refers?\sto|referred\sto|describes|described|designates|designated|comprises?|consists?\sof|spans?|spanned|divides?|divided|lies?|lay|sat|stood|occupies?|occupied|belongs?\sto|remains?|proposes?|proposed|argues?|argued|establishes?|established|gave|gives?|joins?|joined|binds?|bound)\b/
const rows = [];
for (const slug of Object.keys(G)) {
  if (termArg && slug !== termArg) continue;
  const tags = TAGS[slug] || [];
  if (tagArg && !tags.includes(tagArg)) continue;
  const text = strip(G[slug]);
  const first = firstSentence(text);
  const lower = first.toLowerCase();
  const sfx = surfaces(slug);
  // where does the term's own surface appear in the first sentence?
  let at = -1, len = 0;
  for (const s of sfx) { const i = lower.indexOf(s); if (i >= 0 && (at < 0 || i < at)) { at = i; len = s.length; } }
  const reasons = [];
  if (at < 0) reasons.push("first sentence never names the term");
  else {
    const before = words(first.slice(0, at)).length;
    if (before > 6) reasons.push(`term arrives ${before} words in`);
    const after = first.slice(at + len);
    // the copula has to follow the subject closely; allow a short appositive
    const near = words(after).slice(0, 9).join(" ");
    if (!COP.test(near.toLowerCase())) reasons.push("no definition verb after the term");
  }
  rows.push({ slug, tags, first, reasons, ok: reasons.length === 0 });
}

const bad = rows.filter(r => !r.ok);
if (LIST || termArg) {
  for (const r of bad) {
    console.log(`\n${r.slug}   [${r.tags.slice(0, 3).join(", ")}]`);
    console.log(`  ! ${r.reasons.join("; ")}`);
    console.log(`  ${r.first.slice(0, 190)}`);
  }
  if (termArg && !bad.length) console.log(`${termArg}: opens as a general introduction`);
}
// per-kind tally, so a batch can be cut by the tag it shares
const byTag = {};
for (const r of rows) { const k = r.tags[0] || "(untagged)"; (byTag[k] = byTag[k] || { n: 0, bad: 0 }).n++; if (!r.ok) byTag[k].bad++; }
console.log(`\n${rows.length} terms, ${bad.length} flagged (${(100 * bad.length / rows.length).toFixed(1)}%)\n`);
for (const [k, v] of Object.entries(byTag).sort((a, b) => b[1].bad - a[1].bad)) {
  if (v.bad) console.log(`  ${k.padEnd(18)} ${String(v.bad).padStart(4)} of ${String(v.n).padStart(4)}`);
}
process.exitCode = 0;
