#!/usr/bin/env node
/* check-style.js — content style rules for cards (data.js) + glossary (glossary.js).
   Rules (see CLAUDE.md "Content style rules"):
     1. Non-round numbers above 20 are written as numerals ("27", never "twenty-seven").
        Round numbers may stay as words ("thirty", "eight hundred").
     2. Centuries and millennia are always numbered ("11th century", never "eleventh century") — any ordinal.
     3. Literature titles are italicised (<i>…</i>).
   Usage:
     node .claude/check-style.js          report violations
     node .claude/check-style.js --fix    apply the safe fixes in place (string-level, format-preserving)
   Ambiguous single-name titles (Zhuangzi, Mencius… — person OR book) are always REPORT-ONLY: fix by hand. */
"use strict";
const fs = require("fs");
const path = require("path");
const FIX = process.argv.includes("--fix");
const FILES = ["data.js", "glossary.js"].map((f) => path.join(__dirname, "..", f));

/* --- rule 2: ordinal words before century/millennium --- */
const ORD = {
  first: "1st", second: "2nd", third: "3rd", fourth: "4th", fifth: "5th", sixth: "6th", seventh: "7th",
  eighth: "8th", ninth: "9th", tenth: "10th", eleventh: "11th", twelfth: "12th", thirteenth: "13th",
  fourteenth: "14th", fifteenth: "15th", sixteenth: "16th", seventeenth: "17th", eighteenth: "18th",
  nineteenth: "19th", twentieth: "20th", "twenty-first": "21st", "twenty-second": "22nd", "twenty-third": "23rd",
};
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

  if (FIX) fs.writeFileSync(file, text);
  else {
    if (report.length) {
      console.log("\n=== " + name + " — " + report.length + " finding(s) ===");
      report.forEach((r) => console.log("[" + r.kind + "] …" + r.ctx + "…"));
    } else console.log(name + ": clean");
  }
}
if (FIX) console.log("Applied " + totalFixed + " safe fixes. Re-run without --fix to see remaining (ambiguous) items.");
