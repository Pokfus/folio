#!/usr/bin/env node
/* check-cnh-spellings.js — the China collection's house spellings, checked. REPORT-ONLY.
 *
 *     node .claude/check-cnh-spellings.js [--range=cnh-001:cnh-100] [--card=cnh-004] [--no-glossary]
 *     node .claude/check-cnh-spellings.js --drafts=<dir> <id> …     # read $S/out/<id>.json patches instead
 *
 * Reads the Spellings table of docs/china-chronology.md (house form | reported variants | aliases only |
 * note) and reports every REPORTED variant that stands in a cnh- card's own voice: the three phrasings, the
 * background, the Think-it-through questions and answers, the date line, and the source list OUTSIDE a
 * quoted or italic title and outside its URL (a 19th-century translation is cited as printed — Legge's
 * <i>Shû King</i> keeps its spelling in its citation). Then, unless --no-glossary, the description and date
 * of every glossary entry tagged `china` (its ALIASES are where the variants belong, and are not read).
 *
 * A variant matches case-sensitively, as a whole word (no letter on either side). The "aliases only" column
 * is not read: those forms are legitimate in some sentences (Yin for the late Shang, Huangdi as the Yellow
 * Emperor's own name). Exits 0 whatever it finds. Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
const arg = (k) => { const a = args.find((x) => x.startsWith("--" + k + "=")); return a ? a.slice(k.length + 3) : null; };

/* ---------- the table ---------- */
const doc = fs.readFileSync(path.join(ROOT, "docs", "china-chronology.md"), "utf8");
const sec = /## Spellings\n([\s\S]*?)\n## /.exec(doc);
if (!sec) { console.error("ERROR: no Spellings section in docs/china-chronology.md"); process.exit(2); }
const RULES = [];
sec[1].split("\n").filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l) && !/^\|\s*house form/.test(l)).forEach((l) => {
  const cells = l.split("|").slice(1, -1).map((c) => c.trim());
  const house = cells[0], vars = (cells[1] || "").split(",").map((v) => v.trim()).filter(Boolean);
  vars.forEach((v) => RULES.push({ house, v, re: new RegExp("(?<![\\p{L}'’])" + v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/'/g, "['’]") + "(?![\\p{L}])", "gu") }));
});
if (!RULES.length) { console.error("ERROR: the Spellings table yielded no variants"); process.exit(2); }

/* ---------- the texts ---------- */
const plain = (s) => String(s || "").replace(/<sup[^>]*><\/sup>/g, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
// a source's own voice: drop italic titles, quoted titles and the URL
const srcVoice = (s) => plain(String(s || "").replace(/<i>[\s\S]*?<\/i>/g, " ").replace(/“[^”]*”/g, " ").replace(/"[^"]*"/g, " ").replace(/https?:\/\/\S+/g, " "));
function fields(c) {
  const out = [];
  [c.question].concat(c.questions || []).forEach((q, i) => out.push(["phrasing " + (i + 1), plain(q)]));
  out.push(["background", plain(c.abstract)]);
  (c.why || []).forEach((w, i) => { out.push(["why " + (i + 1) + " q", plain(w && w.q)]); out.push(["why " + (i + 1) + " a", plain(w && w.a)]); });
  out.push(["date line", plain(c.answerDate)]);
  (c.sources || []).forEach((s, i) => out.push(["source " + (i + 1), srcVoice(s)]));
  return out;
}
function scan(label, list) {
  const hits = [];
  for (const [where, t] of list) for (const r of RULES) { r.re.lastIndex = 0; const m = r.re.exec(t); if (m) hits.push(where + ": \"" + m[0] + "\" → " + r.house); }
  if (hits.length) { console.log(label); hits.forEach((h) => console.log("    " + h)); }
  return hits.length;
}

let n = 0, nCards = 0, nHit = 0;
const drafts = arg("drafts");
if (drafts) {
  args.filter((a) => /^cnh-\d+$/.test(a)).forEach((id) => {
    const f = path.join(drafts, id + ".json"); if (!fs.existsSync(f)) { console.log(id + "  (no draft)"); return; }
    const o = JSON.parse(fs.readFileSync(f, "utf8")); nCards++;
    const k = scan(id + "  (draft)", fields(o.patch || {}));
    const g = o.glossary ? scan(id + "  (draft glossary " + o.glossary.slug + ")", [["description", plain(o.glossary.description)], ["date", plain(o.glossary.date)]]) : 0;
    n += k + g; if (k + g) nHit++;
  });
} else {
  const { loadCards } = require("./card-io.js");
  const num = (id) => +String(id).replace(/^cnh-/, "");
  let lo = 1, hi = 1000;
  if (arg("range")) { const [a, b] = arg("range").split(":"); lo = num(a); hi = num(b || a); }
  if (arg("card")) lo = hi = num(arg("card"));
  const cards = loadCards().cards.filter((c) => /^cnh-\d+$/.test(c.id) && num(c.id) >= lo && num(c.id) <= hi).sort((a, b) => num(a.id) - num(b.id));
  for (const c of cards) { nCards++; const k = scan(c.id + "  " + plain(c.answer), fields(c)); n += k; if (k) nHit++; }
  if (!args.includes("--no-glossary")) {
    const { loadGlossary } = require("./gloss-io.js");
    const G = loadGlossary();
    for (const k of Object.keys(G.GLOSSARY || {}).sort()) {
      if (!((G.GLOSSARY_TAGS || {})[k] || []).includes("china")) continue;
      const h = scan("glossary " + k, [["description", plain(G.GLOSSARY[k])], ["date", plain((G.GLOSSARY_DATES || {})[k])]]);
      n += h;
    }
  }
}
console.log("\ncheck-cnh-spellings: " + RULES.length + " variants of the house forms; " + nCards + " card(s) read, " + nHit + " with a variant; " + n + " hit(s) in all");
