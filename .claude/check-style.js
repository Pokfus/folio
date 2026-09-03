#!/usr/bin/env node
/* check-style.js — content style rules for cards (data.js) + glossary (glossary.js).
   Rules (see CLAUDE.md "Content style rules"):
     1. Non-round numbers above 20 are written as numerals ("27", never "twenty-seven").
        Round numbers may stay as words ("thirty", "eight hundred").
     2. Centuries and millennia are always numbered ("11th century", never "eleventh century") — any ordinal.
     3. Literature titles are italicised (<i>…</i>).
     4. Eras are BCE and CE, never BC or AD — everywhere a reader can see one (rule 4 alone also runs over
        artefacts.js, countries.js and crossword.js, which are prose a reader reads and were the files still
        saying "1500 BC"; the other three rules stay scoped to cards + glossary, as CLAUDE.md scopes them).
     5. A changelog DAY TITLE is at most 72 characters (report-only, changelog.js) — see the rule's own
        note at the foot of this file for the measurement behind the number.
   Usage:
     node .claude/check-style.js          report violations
     node .claude/check-style.js --fix    apply the safe fixes in place (string-level, format-preserving)
   Ambiguous single-name titles (Zhuangzi, Mencius… — person OR book) are always REPORT-ONLY: fix by hand. */
"use strict";
const fs = require("fs");
const path = require("path");
const FIX = process.argv.includes("--fix");
/* Rules 1–3 run over the first two; rule 4 runs over all four (see `ERA_ONLY` below). */
/* glossary-extra.js is in this list for ONE rule and it matters: rule 4 (BCE/CE) sweeps the text a
   PICTURE carries -- image.title / desc / alt -- and that is where most of the site's remaining
   "BC"s were, because those strings come from Wikimedia Commons saying "c. 2700 BC". The whole
   GLOSSARY_IMAGES table moved out of glossary.js when the citations and illustrations were split
   onto the lazy path, so without this line those captions stopped being checked and nothing said
   so. The citations in the same file stay masked from rule 4 as they always were -- a published
   title is the author's -- by the GLOSSARY_SOURCES mask below, which matches the block wherever
   it lives. */
/* `crossword.js` joined the ERA_ONLY list in Sep 2026 with the game's own clue bank. It is prose a
   reader reads, so the BCE/CE rule binds on it exactly as it does on an artefact or a country
   description — and NOT the other three rules, which are about a card's or a term's own conventions
   (italicised work titles, numerals) that a four-word crossword clue has no business carrying. */
const FILES = ["data.js", "glossary.js", "glossary-extra.js", "artefacts.js", "countries.js", "crossword.js"].map((f) => path.join(__dirname, "..", f));
const ERA_ONLY = new Set(["artefacts.js", "countries.js", "crossword.js"]);

/* --- rule 2: ordinal words before century/millennium --- */
const ORD = {
  first: "1st", second: "2nd", third: "3rd", fourth: "4th", fifth: "5th", sixth: "6th", seventh: "7th",
  eighth: "8th", ninth: "9th", tenth: "10th", eleventh: "11th", twelfth: "12th", thirteenth: "13th",
  fourteenth: "14th", fifteenth: "15th", sixteenth: "16th", seventeenth: "17th", eighteenth: "18th",
  nineteenth: "19th", twentieth: "20th", "twenty-first": "21st", "twenty-second": "22nd", "twenty-third": "23rd",
};
/* KNOWN GAP, left deliberately (Aug 2026): the lookahead is `\s*`, so it does not see the ATTRIBUTIVE
   hyphenated form — "nineteenth-century city", "second-millennium BCE". Measured over the corpus when it
   was found: 32 hyphenated century NUMERALS against 2 hyphenated WORDS, so the house convention plainly
   covers this shape and the rule simply cannot reach it.
   IT IS NOT WIDENED TO `[\s-]*` HERE because the cases it then finds are not all violations, and `--fix`
   would damage two of them: `Eighth-century_revival` is a GLOSSARY KEY and the term's own name, and "A
   Seventeenth-Century manual of arms" sits inside an image credit quoting the scan's own book title —
   the citation mask does not cover either. Widening it wants a pass that masks glossary keys and quoted
   titles first, which is a job of its own rather than a character class. */
const ORD_RE = new RegExp("\\b(" + Object.keys(ORD).join("|") + ")(\\s+(?:and|to|or)\\s+(?:" + Object.keys(ORD).join("|") + ")\\s+)?(?=\\s*(century|centuries|millennium|millennia)\\b)", "gi");
// also "the (ord) and (ord) centuries": handle the leading ord when the century word comes after the 2nd ord
const ORD_PAIR_RE = new RegExp("\\b(" + Object.keys(ORD).join("|") + ")(?=\\s+(?:and|to|or)\\s+(?:" + Object.keys(ORD).join("|") + ")[\\s-]*(?:century|centuries|millennium|millennia)\\b)", "gi");

/* --- rule 1: non-round compound number words > 20 --- */
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const UNITS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 };
const NUM_RE = new RegExp("\\b(" + Object.keys(TENS).join("|") + ")-(" + Object.keys(UNITS).join("|") + ")\\b", "gi");
// "one hundred and forty-eight" / "two hundred and six" → 148 / 206 (whole phrase, or the tens part alone would corrupt it)
const HUNDRED_RE = new RegExp("\\b(" + Object.keys(UNITS).join("|") + ")\\s+hundred\\s+and\\s+(?:(" + Object.keys(TENS).join("|") + ")-(" + Object.keys(UNITS).join("|") + ")|(" + Object.keys(TENS).join("|") + ")|(eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|ten)|(" + Object.keys(UNITS).join("|") + "))\\b", "gi");
const TEENS = { ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
// PROPER NAMES that contain number words — never converted
const NUM_EXCLUDE = [/Twenty-Four Histories/gi, /Twenty-four Filial Exemplars/gi];

/* --- rule 3: literature titles --- */
// Unambiguous titles (safe to auto-wrap when not already italicised)
const TITLES_SAFE = [
  "Records of the Grand Historian", "Bamboo Annals", "Book of Documents", "Book of Songs", "Book of Changes",
  "Book of Rites", "Book of Lord Shang", "Classic of Poetry", "Classic of Mountains and Seas", "Classic of Filial Piety",
  "Classic of History", "Classic of Changes", "Discourses of the States", "Zuo Tradition", "Zuo Zhuan",
  "Spring and Autumn Annals", "Rites of Zhou", "Art of War", "Tao Te Ching", "Daodejing", "Journey to the West",
  "Songs of Chu", "Shuowen Jiezi", "Mu Tianzi Zhuan", "I Ching", "Huainanzi", "Chuci", "Analects", "Erya",
  "Guoyu", "Lüshi Chunqiu",
];
// fields whose text must stay PLAIN (no <i>): answers are matched/spoken as plain text; slugs and pinyin never style
const PLAIN_FIELDS = new Set(["answer", "answerText", "citation", "hanzi", "pinyin", "traditional", "id", "num", "category"]);
function fieldAt(text, idx) {   // the JSON field a data.js match sits in (nearest preceding "key":" marker)
  const back = text.slice(Math.max(0, idx - 4000), idx);
  const re = /"([a-zA-Z]+)":"/g;
  let m, last = null;
  while ((m = re.exec(back))) last = m[1];
  return last;
}
// Person-or-book names: report only, never auto-fix
const TITLES_AMBIGUOUS = ["Zhuangzi", "Mencius", "Laozi", "Xunzi", "Han Feizi", "Liezi", "Guanzi", "Mozi", "Shiji"];

/* --- rule 4: BCE / CE, never BC / AD ---
   NEVER a bare \bBC\b or \bAD\b. Both have to be ANCHORED — to a digit, or to the unit words an era
   abbreviation actually follows — because a two-letter uppercase token on its own is not always an era:
     · "96.AD.258" is the Getty's accession number for a votive head, sitting inside a picture's own
       description. A blanket \bAD\b renames it, and nothing on the page would say so.
     · "A. D. Godley" translated the Histories and is named in a dozen citations. The dotted form is
       report-only for that reason among others (see below).
   The shapes, all measured off this corpus rather than imagined:
     "1200 BC" / "1200BC"       → "1200 BCE"    (BCE/CE are already safe — the \b after BC fails on "BCE")
     "6th century BC"           → "6th century BCE"   — the commonest miss: no digit touches the BC at all
     "14th – 13th cents. BC" / "III cen. BC" / "4 th c BC" / "cal BC"   → same, via ERA_UNIT
     "300 AD" / "1st century AD" → "300 CE" / "1st century CE"
     "AD 301"                   → "301 CE"      — the numeral leads in BCE/CE notation, so the pair swaps
   The number in that last one is `\d(?:[\d,]*\d)?` and not `\d[\d,]*`, which is a bug this rule shipped
   with for an hour: a trailing comma is the SENTENCE's, so "founded in AD 301, and it presents itself"
   came out as "founded in 301, CE and it presents itself" — grammatical damage, in prose, from a group
   that was one character too greedy.
   The DOTTED forms (B.C. / A.D.) are REPORT-ONLY. Most are inside citations, where a published title is
   the author's and not ours and the mask below already lifts them out; the handful that are not sit in
   picture descriptions, and fixing one means deciding whether the closing period was the abbreviation's
   or the sentence's — which is a judgement to make by eye, one at a time. */
const ERA_UNIT = "(?:centuries|century|millennia|millennium|cents?\\.|cens?\\.|c\\.|c|cal)";
const ERA_BC_RE = /(\d)(\s*)BC\b/g;
const ERA_BC_UNIT_RE = new RegExp("\\b(" + ERA_UNIT + ")(\\s+)BC\\b", "g");
const ERA_AD_AFTER_RE = /(\d)(\s*)AD\b/g;
const ERA_AD_UNIT_RE = new RegExp("\\b(" + ERA_UNIT + ")(\\s+)AD\\b", "g");
const ERA_AD_BEFORE_RE = /\bAD(\s+)(\d(?:[\d,]*\d)?)/g;
const ERA_DOTTED_RE = /(?:\d[\d,]*\s*)?\b(?:B\.\s?C\.|A\.\s?D\.)(?:\s*\d)?/g;
function eraFix(text) {
  let n = 0;
  text = text.replace(ERA_BC_RE, (m0, d, sp) => { n++; return d + (sp || " ") + "BCE"; });
  text = text.replace(ERA_BC_UNIT_RE, (m0, u, sp) => { n++; return u + sp + "BCE"; });
  text = text.replace(ERA_AD_AFTER_RE, (m0, d, sp) => { n++; return d + (sp || " ") + "CE"; });
  text = text.replace(ERA_AD_UNIT_RE, (m0, u, sp) => { n++; return u + sp + "CE"; });
  text = text.replace(ERA_AD_BEFORE_RE, (m0, sp, num) => { n++; return num + " CE"; });
  return { text, n };
}

function findAll(text, re, kind, out, file) {
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(text))) {
    out.push({ file, kind, at: m.index, hit: m[0], ctx: text.slice(Math.max(0, m.index - 55), m.index + m[0].length + 45).replace(/\s+/g, " ") });
  }
}
function isItalicised(text, idx, len) {
  return /<i>\s*$/.test(text.slice(Math.max(0, idx - 8), idx)) || /^\s*<\/i>/.test(text.slice(idx + len, idx + len + 8));
}

let totalFixed = 0;
for (const file of FILES) {
  let text = fs.readFileSync(file, "utf8");
  const name = path.basename(file);
  const report = [];

  // Citations are OUT OF SCOPE for every house-style rule: a citation names a work that exists,
  // and its title is the author's, not ours. Moro Abadía's "…at the turn of the twentieth
  // century" is not a century-word violation, and `--fix` would have quietly renamed the paper.
  const srcMask = [];
  text = text.replace(/"sources":\[(?:"(?:\\.|[^"\\])*"(?:,\s*)?)*\]/g, (m0) => {
    srcMask.push(m0); return '"sources":["SRCMASK' + (srcMask.length - 1) + '"]';
  });
  // …and glossary.js keeps its citations in a TOP-LEVEL GLOSSARY_SOURCES block rather than in a
  // per-entry "sources":[…] field, so the card-shaped mask above never fired there. Measured before
  // fixing: `--fix` renamed six real published works across twelve citations (Lemos's "…Late Eleventh
  // and Tenth Centuries B.C." → "…Late 11th and 10th Centuries B.C."). Mask the whole block.
  // The block moved to the lazy glossary-extra.js when the citations and illustrations were split
  // off the eager path, and it is emitted there as `var GLOSSARY_SOURCES = {…};` inside an IIFE
  // rather than as `window.GLOSSARY_SOURCES = Object.assign(…);`. BOTH shapes are masked: matching
  // only the old one left every citation in the new file exposed to rule 4, which is exactly the
  // fault this mask was written for -- `--fix` renaming real published works.
  const blockMask = [];
  text = text.replace(/(?:window\.|var\s+)GLOSSARY_SOURCES\s*=[\s\S]*?\n\s*\}\)?;\n/g, (m0) => {
    blockMask.push(m0); return "/*BLOCKMASK" + (blockMask.length - 1) + "*/\n";
  });
  // The DECK TREE is out of scope too. CLAUDE.md scopes these rules to "all card fields + glossary
  // descriptions"; a deck title is neither, and the titles are fixed by the ten collection plans (which
  // `test-card-plans.js` asserts the tree against), so a finding here is one nobody intends to act on.
  // It reported `gr-fourth-century` and `ru-nineteenth` on every run until 2026-08-08.
  text = text.replace(/window\.COLLECTION_TREE\s*=[\s\S]*$/g, (m0) => {
    blockMask.push(m0); return "/*BLOCKMASK" + (blockMask.length - 1) + "*/\n";
  });
  // artefacts.js writes the same citations under an UNQUOTED key (`sources: [`), so the card-shaped mask
  // above misses every one of them — five of its citations name a century or an era in a real title
  // ("…Chinese Coins from the VIIth Century B.C. to A.D. 621"). Same rule, second spelling.
  text = text.replace(/\bsources:\s*\[[\s\S]*?\n\s*\],\n/g, (m0) => {
    blockMask.push(m0); return "/*BLOCKMASK" + (blockMask.length - 1) + "*/\n";
  });
  // A URL is an IDENTIFIER, not prose: a Commons file is really called "…c_2700_BC_(10465349433).jpg"
  // and renaming it in an href breaks the picture. The era rule is anchored to a digit, so an underscore
  // already separates it from most of these — but a URL is not something to be one regex away from.
  const urlMask = [];
  text = text.replace(/https?:\/\/[^\s"'<>]+/g, (m0) => {
    urlMask.push(m0); return "URLMASK" + (urlMask.length - 1) + "URLMASK";
  });

  // rule 4 — BCE / CE. The only rule that runs over all four files (see ERA_ONLY).
  if (FIX) {
    const era = eraFix(text);
    text = era.text; totalFixed += era.n;
  } else {
    findAll(text, ERA_BC_RE, "era BC (should be BCE)", report, name);
    findAll(text, ERA_BC_UNIT_RE, "era BC (should be BCE)", report, name);
    findAll(text, ERA_AD_AFTER_RE, "era AD (should be CE)", report, name);
    findAll(text, ERA_AD_UNIT_RE, "era AD (should be CE)", report, name);
    findAll(text, ERA_AD_BEFORE_RE, "era AD (should be CE, numeral first)", report, name);
    findAll(text, ERA_DOTTED_RE, "era B.C./A.D. — READ IT, then fix by hand", report, name);
  }

  text = text.replace(/URLMASK(\d+)URLMASK/g, (m0, i) => urlMask[Number(i)]);
  if (ERA_ONLY.has(name)) {
    // Rules 1–3 are scoped to cards + glossary, as CLAUDE.md scopes them. Reporting a century word in
    // an Atlas description is a finding nobody intends to act on, which is what the COLLECTION_TREE
    // comment above already learned once.
    text = text.replace(/\/\*BLOCKMASK(\d+)\*\/\n/g, (m0, i) => blockMask[Number(i)]);
    text = text.replace(/"sources":\["SRCMASK(\d+)"\]/g, (m0, i) => srcMask[Number(i)]);
    if (FIX) fs.writeFileSync(file, text);
    else if (report.length) {
      console.log("\n=== " + name + " — " + report.length + " finding(s) ===");
      report.forEach((r) => console.log("[" + r.kind + "] …" + r.ctx + "…"));
    } else console.log(name + ": clean");
    continue;
  }

  // rule 2 — centuries/millennia (pairs first, then singles)
  for (const re of [ORD_PAIR_RE, ORD_RE]) {
    if (FIX) {
      text = text.replace(re, (m0, ord, tail) => {
        totalFixed++;
        const repl = ORD[ord.toLowerCase()] || ord;
        return (typeof tail === "string" && tail) ? repl + tail.replace(new RegExp("\\b(" + Object.keys(ORD).join("|") + ")\\b", "i"), (o) => ORD[o.toLowerCase()] || o) : repl;   // ORD_PAIR_RE has no tail group — its 3rd replacer arg is the numeric offset
      });
    } else findAll(text, re, "century-word", report, name);
  }

  // rule 1 — compound numbers (proper names masked first so they're never converted)
  const masks = [];
  NUM_EXCLUDE.forEach((re, i) => { text = text.replace(re, (m0) => { masks.push(m0); return "MASK" + (masks.length - 1) + ""; }); });
  if (FIX) {
    text = text.replace(HUNDRED_RE, (m0, h, t, u, tensOnly, teen, unitOnly) => {
      totalFixed++;
      let n = UNITS[h.toLowerCase()] * 100;
      if (t) n += TENS[t.toLowerCase()] + UNITS[u.toLowerCase()];
      else if (tensOnly) n += TENS[tensOnly.toLowerCase()];
      else if (teen) n += TEENS[teen.toLowerCase()];
      else if (unitOnly) n += UNITS[unitOnly.toLowerCase()];
      return String(n);
    });
    text = text.replace(NUM_RE, (m0, t, u) => { totalFixed++; return String(TENS[t.toLowerCase()] + UNITS[u.toLowerCase()]); });
  } else { findAll(text, HUNDRED_RE, "number-word", report, name); findAll(text, NUM_RE, "number-word", report, name); }
  text = text.replace(/MASK(\d+)/g, (m0, i) => masks[Number(i)]);

  // rule 3 — titles. Scope: in data.js only rich-HTML fields (never answerText etc.); in glossary.js only the
  // GLOSSARY description section — the ALIASES/TITLES sections hold match-keys where <i> would break linking.
  const titleLimit = name === "glossary.js" ? (text.indexOf("window.GLOSSARY_") > 0 ? text.indexOf("window.GLOSSARY_") : text.length) : text.length;
  for (const t of TITLES_SAFE) {
    const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    let m;
    while ((m = re.exec(text))) {
      if (m.index >= titleLimit) break;
      if (isItalicised(text, m.index, m[0].length)) continue;
      // skip when inside an attribute/slug (preceded by = or _ or ")
      const before = text[m.index - 1] || "";
      if (/[="_/\\-]/.test(before)) continue;
      if (name === "data.js" && PLAIN_FIELDS.has(fieldAt(text, m.index))) continue;   // plain-text fields stay plain
      if (FIX) {
        text = text.slice(0, m.index) + "<i>" + m[0] + "</i>" + text.slice(m.index + m[0].length);
        re.lastIndex = m.index + m[0].length + 7;
        totalFixed++;
      } else report.push({ file: name, kind: "title-plain", at: m.index, hit: t, ctx: text.slice(Math.max(0, m.index - 55), m.index + t.length + 45).replace(/\s+/g, " ") });
    }
  }
  // ambiguous titles — always report-only
  for (const t of TITLES_AMBIGUOUS) {
    const re = new RegExp("\\b" + t + "\\b", "g");
    let m;
    while ((m = re.exec(text))) {
      if (isItalicised(text, m.index, m[0].length)) continue;
      const before = text[m.index - 1] || "";
      if (/[="_/\\-]/.test(before)) continue;
      report.push({ file: name, kind: "title-AMBIGUOUS (person or book — fix by hand)", at: m.index, hit: t, ctx: text.slice(Math.max(0, m.index - 55), m.index + t.length + 45).replace(/\s+/g, " ") });
    }
  }

  text = text.replace(/\/\*BLOCKMASK(\d+)\*\/\n/g, (m0, i) => blockMask[Number(i)]);
  text = text.replace(/"sources":\["SRCMASK(\d+)"\]/g, (m0, i) => srcMask[Number(i)]);

  if (FIX) fs.writeFileSync(file, text);
  else {
    if (report.length) {
      console.log("\n=== " + name + " — " + report.length + " finding(s) ===");
      report.forEach((r) => console.log("[" + r.kind + "] …" + r.ctx + "…"));
    } else console.log(name + ": clean");
  }
}
/* --- rule 5: a changelog DAY TITLE is a title, not a summary (report-only) ---
   CLAUDE.md's golden rule already says one sentence per day title; what it did not say until Aug 2026 is
   how long. Measured over the whole file when the titles were compacted: the first thirty-two days run
   13–72 characters and read as titles ("After the ice", "A Library of books, and World History
   replanned"), while nine recent ones had grown to 100–194 and were three- and four-item lists — a
   contents page rather than a heading, and on a phone a wall of prose above the list it introduces.
   Rewritten to the older band, and the ceiling is the longest of the ones that were always right.
   REPORT-ONLY and never fixed: shortening a title is a judgement about which of the day's changes led,
   which is the one thing a regex cannot make. It also does NOT run under `--fix`, so a long title
   cannot be silently truncated into a sentence fragment. */
const DAY_TITLE_MAX = 72;
try {
  const clog = fs.readFileSync(path.join(__dirname, "..", "changelog.js"), "utf8");
  const g = {};
  new Function("window", clog)(g);
  const days = g.CHANGELOG || [];
  const longTitles = days.filter((d) => d && typeof d.t === "string" && d.t.length > DAY_TITLE_MAX);
  if (!days.length) console.log("\nchangelog.js: could not be read — rule 5 was skipped");
  else if (!longTitles.length) console.log("changelog.js: clean (" + days.length + " day titles, longest " +
    days.reduce((n, d) => Math.max(n, (d.t || "").length), 0) + " chars)");
  else {
    console.log("\n=== changelog.js — " + longTitles.length + " finding(s) ===");
    longTitles.forEach((d) => console.log("[day title over " + DAY_TITLE_MAX + " chars — shorten by hand] " +
      d.d + " (" + d.t.length + ") " + d.t));
  }
} catch (e) { console.log("\nchangelog.js: " + e.message + " — rule 5 was skipped"); }

if (FIX) console.log("Applied " + totalFixed + " safe fixes. Re-run without --fix to see remaining (ambiguous) items.");
