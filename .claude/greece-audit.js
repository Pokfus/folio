#!/usr/bin/env node
/* greece-audit.js — every MECHANICAL rule of the Greece refinement audit, per card. REPORT-ONLY.
 *
 *     node .claude/greece-audit.js [--range=gr-001:gr-010] [--card=gr-008] [--summary] [--all]
 *
 *   --range    audit a contiguous run of ids (inclusive); default is the whole collection
 *   --card     one card
 *   --summary  one line per rule with the number of cards breaking it, and nothing else
 *   --all      also print the cards that pass every rule (default prints only cards with findings)
 *
 * WHAT IT CHECKS is the list in docs/greece-refinement-audit.md, "The rules", minus the ones only a
 * reader can judge — whether an article reads right, whether a question could fit a sibling, whether a
 * picture shows the WHOLE term, whether a background covers what the term's own article covers. Those are
 * the ledger's "read by eye" column, and nothing here pretends to them. What it CAN see is counted:
 *
 *   Q  questions      3 phrasings; one sentence, 20–34 words, blank mid-sentence (the check-questions.js
 *                     rules, re-measured here so a batch report is one file); NO DATE (a year, a century,
 *                     a millennium, a decade, BCE/CE); the most similar phrasing on another gr- card
 *   D  date line      isDateList shape, ≤4 rows, labels ≤16 chars; a year under 1000 carries its era; no
 *                     "c." inside a range; the line yields a sort year (cardYears, sliced out of app.js);
 *                     every year the line prints is also somewhere in the background; the pinned years in
 *                     docs/greece-chronology.md (the `chronology-pins` block) appear on the line
 *   B  background     5 + 5 sentences (split-abstract.js); 270–330 words by add-card.js's own count;
 *                     mean ≤25 words a sentence
 *   S  sources        the difficulty's bar (src-target.js); every source pointed at by a marker in the
 *                     abstract OR a Think-it-through answer; a MODERN author in ≤2 sources, an ANCIENT one
 *                     in ≤2 (≤3 where the card is about that author or work); at least half modern; at
 *                     most one source per non-English language, and every language chip well-formed
 *   W  think it through  exactly 3; answers 12–60 words; questions usually open "Why" (reported, not a
 *                     fault); every answer carries a marker, explicit and in range; answer-vs-abstract
 *                     4-gram overlap (aim <25%, a fault at ≥50%)
 *   I  image          present; not on another card; the description names no source, licence, museum
 *                     number or file name
 *   L  locator        present on a card whose kind (tag 1) is a place, site, city, building or battle
 *
 * THE AUTHOR RULE AND THE ANCIENT LIST ARE check-cards.js's, SLICED OUT BY TEXT, and the run stops if a
 * slice fails — a second copy of either goes stale in a file nobody editing a Greece card opens. The word
 * counter and IMPERIAL_PAREN are add-card.js's, sliced the same way.
 *
 * Exits 0 whatever it finds: it is the batch's report, not a gate. Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const die = (m) => { console.error("ERROR: " + m); process.exit(2); };

/* ---------- slices ---------- */
const ADD = fs.readFileSync(path.join(__dirname, "add-card.js"), "utf8");
const CHECK = fs.readFileSync(path.join(__dirname, "check-cards.js"), "utf8");
const APP = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
function sliceLine(src, re, what) { const m = re.exec(src); if (!m) die("cannot find " + what); return m[0]; }
function sliceBlock(src, startRe, endRe, what) {
  const a = src.search(startRe); if (a < 0) die("cannot find " + what);
  const b = src.slice(a).search(endRe); if (b < 0) die("cannot find the end of " + what);
  return src.slice(a, a + b);
}
const counting = new Function(
  sliceLine(ADD, /^const plain = .*$/m, "plain() in add-card.js") + "\n" +
  sliceLine(ADD, /^const IMPERIAL_PAREN = .*$/m, "IMPERIAL_PAREN in add-card.js") + "\n" +
  sliceLine(ADD, /^const COUNTS_AS_WORD = .*$/m, "COUNTS_AS_WORD in add-card.js") + "\n" +
  "const unconverted = (s) => String(s || \"\").replace(IMPERIAL_PAREN, \"\");\n" +
  "const qWords = (s) => plain(unconverted(s)).split(\" \").filter((w) => COUNTS_AS_WORD.test(w)).length;\n" +
  "return { plain, qWords };")();
const { plain, qWords } = counting;
const authorLib = new Function(
  sliceLine(CHECK, /^const plain = .*$/m, "plain() in check-cards.js") + "\n" +
  sliceLine(CHECK, /^const ANCIENT = .*$/m, "ANCIENT in check-cards.js") + "\n" +
  sliceBlock(CHECK, /^function authorOf\(src\) \{/m, /^\}$/m, "authorOf() in check-cards.js") + "}\n" +
  sliceLine(CHECK, /^const surnameKey = .*$/m, "surnameKey in check-cards.js") + "\n" +
  "return { authorOf, surnameKey, ANCIENT };")();
const { cardYears } = { cardYears: require("./card-links.js").loadCardYears(APP) };
const { isDateList, MAX_ROWS, LABEL_MAX } = require("./date-line.js");
const { srcTargetFor } = require("./src-target.js");
const { count: shapeOf } = require("./split-abstract.js");
const { declaredLang } = require("./src-langs.js");
const { loadCards } = require("./card-io.js");

/* ---------- the chronology pins ---------- */
function loadPins() {
  const f = path.join(ROOT, "docs", "greece-chronology.md");
  if (!fs.existsSync(f)) return {};
  const m = /```chronology-pins\n([\s\S]*?)```/.exec(fs.readFileSync(f, "utf8"));
  const out = {};
  if (m) m[1].split("\n").forEach((l) => {
    const r = /^(gr-\d+)\s*:\s*(.+)$/.exec(l.trim());
    if (r) out[r[1]] = r[2].split(/\s*;\s*/).filter(Boolean);
  });
  return out;
}
const PINS = loadPins();

/* ---------- args ---------- */
const args = process.argv.slice(2);
const arg = (k) => { const a = args.find((x) => x.startsWith("--" + k + "=")); return a ? a.slice(k.length + 3) : null; };
const SUMMARY = args.includes("--summary"), ALL = args.includes("--all");
const num = (id) => +String(id).replace(/^gr-/, "");
let lo = 1, hi = 1000;
if (arg("range")) { const [a, b] = arg("range").split(":"); lo = num(a); hi = num(b || a); }
if (arg("card")) { lo = hi = num(arg("card")); }

const { cards } = loadCards();
const gr = cards.filter((c) => /^gr-\d+$/.test(c.id));
const byId = new Map(gr.map((c) => [c.id, c]));
const scope = gr.filter((c) => num(c.id) >= lo && num(c.id) <= hi).sort((a, b) => num(a.id) - num(b.id));

/* ---------- helpers ---------- */
const markers = (html) => [...String(html || "").matchAll(/<sup\b[^>]*class="[^"]*\bfn\b[^"]*"[^>]*>/gi)]
  .map((m) => { const d = /data-fn="(\d+)"/i.exec(m[0]); return d ? +d[1] : 0; });
const toks = (s) => plain(s).toLowerCase().replace(/[^a-z0-9À-ɏ ]+/g, " ").split(/\s+/).filter(Boolean);
function grams(s, n) { const t = toks(s), out = new Set(); for (let i = 0; i + n <= t.length; i++) out.add(t.slice(i, i + n).join(" ")); return out; }
function overlap(a, b) { const A = grams(a, 4); if (!A.size) return 0; const B = grams(b, 4); let k = 0; A.forEach((g) => { if (B.has(g)) k++; }); return k / A.size; }
const STOP = new Set("the a an of in on at to and or but for with by from as is was were be been that which who whose this these those its it their his her into than then when where what while after before during over under".split(" "));
const content = (s) => new Set(toks(String(s).replace(/<span class="blank">_+<\/span>/g, " ")).filter((w) => w.length > 2 && !STOP.has(w)));
function jacc(a, b) { let k = 0; a.forEach((w) => { if (b.has(w)) k++; }); return k / Math.max(1, Math.min(a.size, b.size)); }
const QDATE = /\b\d{3,4}\b|\bB\.?C\.?E?\b|\bC\.?E\.?\b|\bA\.?D\.?\b|\b\w*centur\w*|\b\w*millenni\w*|\bdecades?\b|\b\d0s\b/i;
const dateRows = (html) => [...String(html || "").matchAll(/<span class="dt-(k|v)(?: dt-sub)?">([^<]*)<\/span>/g)].map((m) => ({ k: m[1], t: m[2] }));
const PLACE_KINDS = new Set(["place", "site", "city", "building", "battle", "island", "sanctuary", "palace", "settlement", "tomb", "monument"]);
const ALL_IMG = new Map();
for (const c of cards) if (c.image && c.image.src) {
  const k = decodeURIComponent(String(c.image.src).split("/").pop()).replace(/^\d+px-/, "").replace(/_/g, " ").toLowerCase();
  (ALL_IMG.get(k) || ALL_IMG.set(k, []).get(k)).push(c.id);
}
const CAPTION_SOURCE = /wikimedia|commons|\bcc[ -]?by\b|\bcc0\b|public domain|licen[cs]e|photograph(?:ed)? by|©|\binv(?:entory)?\.? ?(?:no|n°)|\bacc(?:ession)?\.? ?no|\.(?:jpe?g|png|tiff?|svg)\b|\bfile:/i;
const PHRASE_ALL = gr.map((c) => ({ id: c.id, sets: [c.question, ...(c.questions || [])].map(content) }));

/* ---------- the rules ---------- */
const RULES = {};
function finding(out, rule, msg) { out.push([rule, msg]); RULES[rule] = (RULES[rule] || 0) + 1; }

function audit(c) {
  const out = [];
  /* Q */
  const qs = [c.question, ...(c.questions || [])].filter((q) => typeof q === "string" && q.trim());
  if (qs.length !== 3) finding(out, "Q.count", qs.length + " phrasings, not 3");
  qs.forEach((q, i) => {
    const w = qWords(q), p = plain(q);
    if (w < 20 || w > 34) finding(out, "Q.length", "phrasing " + (i + 1) + " is " + w + " words (20–34)");
    const sent = p.replace(/\b(c|ca|St|Mt|no)\.\s/g, "$1 ").split(/[.!?]\s+(?=[A-Z])/).length;
    if (sent > 1) finding(out, "Q.sentence", "phrasing " + (i + 1) + " looks like more than one sentence");
    if (/_{3,}\s*[.?!]?\s*$/.test(p)) finding(out, "Q.blank-end", "phrasing " + (i + 1) + " ends on the blank");
    if (!/class="blank"/.test(q)) finding(out, "Q.no-blank", "phrasing " + (i + 1) + " has no blank");
    const d = QDATE.exec(p.replace(/_+/g, ""));
    if (d) finding(out, "Q.date", "phrasing " + (i + 1) + " carries a date: \"" + d[0] + "\"");
  });
  // the phrasing most like one on ANOTHER card — a confusability lead, never a verdict
  let best = { v: 0, id: "" };
  const mine = qs.map(content);
  for (const o of PHRASE_ALL) if (o.id !== c.id) for (const a of mine) for (const b of o.sets) {
    const v = jacc(a, b); if (v > best.v) best = { v, id: o.id };
  }
  if (best.v >= 0.42) finding(out, "Q.sibling", "a phrasing shares " + Math.round(best.v * 100) + "% of its content words with " + best.id);

  /* D */
  const ad = c.answerDate || "";
  if (ad) {
    if (!isDateList(ad)) finding(out, "D.shape", "not a date list");
    const rows = dateRows(ad);
    const nRows = rows.filter((r) => r.k === "v").length;
    if (nRows > MAX_ROWS) finding(out, "D.rows", nRows + " rows (≤" + MAX_ROWS + ")");
    rows.filter((r) => r.k === "k").forEach((r) => { if (r.t.length > LABEL_MAX) finding(out, "D.label", "label \"" + r.t + "\" is " + r.t.length + " characters"); });
    rows.filter((r) => r.k === "v").forEach((r) => {
      const v = r.t;
      // a day of the month is not a year: "8 July 1851"
      const vy = v.replace(/\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/g, "");
      // a bare year under 1000 must carry its era somewhere in the same value
      const small = [...vy.matchAll(/(?<![\d,.])(\d{3})(?![\d,.])/g)].map((m) => +m[1]);
      if (small.length && !/\b(BCE|CE|BP|Mya|kya)\b/.test(vy)) finding(out, "D.era", "\"" + v + "\" has a year under 1000 with no era");
      // a row that states no date at all is a fact on the date line, not a date
      if (!/\d{3,4}|\b(?:BCE|CE|BP|Mya|kya)\b|centur|millenni|Minoan|Helladic|Cycladic|Geometric|Olympiad|palatial/i.test(vy))
        finding(out, "D.not-a-date", "\"" + v + "\" states no date");
      if (/\d\s*[–-]\s*c\.\s*\d/.test(v)) finding(out, "D.c-in-range", "\"" + v + "\" puts c. inside a range");
      if (/(^|\s)(c\.\s*)?\d[\d,]*\s*[–-]\s*$|[–-]\s*$/.test(v)) finding(out, "D.dangling", "\"" + v + "\" ends on a dash");
    });
    const ys = cardYears(c);
    if (!ys.length) finding(out, "D.sort", "the date line yields no sort year");
    // every year printed on the line is in the background too
    const lineYears = [...plain(ad).matchAll(/\b(\d{3,4})\b/g)].map((m) => m[1]);
    const abs = plain(c.abstract).replace(/,(\d{3})/g, "$1");
    lineYears.forEach((y) => { if (abs.indexOf(y) < 0) finding(out, "D.not-in-prose", "the date line's " + y + " is not in the background"); });
  }
  (PINS[c.id] || []).forEach((p) => { if (plain(ad).indexOf(p) < 0) finding(out, "D.pin", "the chronology pins \"" + p + "\" and the date line does not carry it"); });

  /* B */
  const shape = shapeOf(c.abstract || "");
  if (shape.length !== 2 || shape[0] !== 5 || shape[1] !== 5) finding(out, "B.shape", "splits " + JSON.stringify(shape) + ", not 5 + 5");
  const bw = qWords(c.abstract);
  if (bw < 270 || bw > 330) finding(out, "B.length", bw + " words (270–330)");
  const nSent = shape.reduce((a, b) => a + b, 0) || 1;
  /* THE TWO BARS CANNOT BOTH HOLD, AND THE WORD FLOOR WINS (B1, Sep 2026). Ten sentences at a mean of
     25 is 250 words, which is under the 270 floor, so a card that honours the floor necessarily averages
     27. The ceiling is therefore the mean a card sitting at 285 words would carry — the top of the band
     the refinement aims at — and 25 still binds on any abstract long enough to afford it. */
  const meanCap = Math.max(25, 285 / nSent);
  if (bw / nSent > meanCap + 1e-9) finding(out, "B.sentence-length", "mean " + (bw / nSent).toFixed(1) + " words a sentence (≤" + meanCap.toFixed(1) + ")");

  /* S */
  const src = Array.isArray(c.sources) ? c.sources : [];
  const bar = srcTargetFor(c);
  if (src.length < bar) finding(out, "S.bar", src.length + " sources, bar " + bar + " (difficulty " + c.difficulty + ")");
  const whyMarks = (Array.isArray(c.why) ? c.why : []).flatMap((w) => markers(w && w.a));
  const allMarks = markers(c.abstract).concat(whyMarks);
  src.forEach((_, i) => { if (allMarks.indexOf(i + 1) < 0) finding(out, "S.unreferenced", "source " + (i + 1) + " is pointed at by no marker"); });
  const subj = String(c.answerText || "").toLowerCase();
  const modern = {}, ancient = {};
  let nModern = 0;
  src.forEach((s) => {
    const a = authorLib.authorOf(s), key = authorLib.surnameKey(a);
    const anc = authorLib.ANCIENT.test(a.toLowerCase()) || /^(?:<i>)?[A-Z]/.test(s) && authorLib.ANCIENT.test(plain(s).toLowerCase());
    if (authorLib.ANCIENT.test(a.toLowerCase())) { ancient[key] = (ancient[key] || 0) + 1; }
    else { if (key) modern[key] = (modern[key] || 0) + 1; nModern++; }
    void anc;
  });
  Object.keys(modern).forEach((k) => { if (modern[k] > 2) finding(out, "S.modern-cap", k + " in " + modern[k] + " sources (≤2)"); });
  Object.keys(ancient).forEach((k) => {
    const own = subj && (subj.indexOf(k) >= 0 || k.indexOf(subj) >= 0);
    const cap = own ? 3 : 2;
    if (ancient[k] > cap) finding(out, "S.ancient-cap", k + " in " + ancient[k] + " sources (≤" + cap + ")");
  });
  if (src.length && nModern < src.length / 2) finding(out, "S.modern-half", nModern + " of " + src.length + " sources are modern scholarship (≥ half)");
  const langs = {};
  src.forEach((s) => {
    const l = declaredLang(s);
    if (l) langs[l] = (langs[l] || 0) + 1;
    /* Two English sources wear a foreign word and must not trip the proxy: the Chronique des
     * fouilles en ligne publishes its notices in the language of the report (check-cards.js rule 6
     * dropped it for that reason; a French notice still needs its chip and is read by eye), and a
     * Dutch or German surname particle ("van der Plicht") is part of an English author's name. */
    else if (/[α-ωΑ-Ω]{4,}|\b(?:des|und|der|dei|della|delle|pour|dans|nella|sur|zur|für|über|et les|les)\b/.test(plain(s).replace(/https?:\/\/\S+/g, "").replace(/Chronique des fouilles en ligne/g, "").replace(/\b(?:van der|van den|von der)\b/g, "")))
      finding(out, "S.chip?", "may be non-English with no chip: " + plain(s).slice(0, 70));
  });
  Object.keys(langs).forEach((l) => { if (langs[l] > 1) finding(out, "S.lang-cap", langs[l] + " sources in " + l + " (≤1)"); });

  /* W */
  const why = Array.isArray(c.why) ? c.why : [];
  if (why.length !== 3) finding(out, "W.count", why.length + " questions, not 3");
  why.forEach((w, i) => {
    if (!w || typeof w.a !== "string") return;
    const n = qWords(w.a);
    if (n < 12 || n > 60) finding(out, "W.length", "answer " + (i + 1) + " is " + n + " words (12–60)");
    if (!/^why\b/i.test(String(w.q || ""))) finding(out, "W.not-why", "question " + (i + 1) + " does not open \"Why\" (usually should)");
    const mk = markers(w.a);
    if (!mk.length) finding(out, "W.no-marker", "answer " + (i + 1) + " carries no citation marker");
    if (mk.some((x) => !(x > 0))) finding(out, "W.bare-marker", "answer " + (i + 1) + " has a marker with no number");
    if (mk.some((x) => x > src.length)) finding(out, "W.marker-range", "answer " + (i + 1) + " points past the source list");
    const ov = overlap(w.a, c.abstract);
    if (ov >= 0.5) finding(out, "W.overlap", "answer " + (i + 1) + " shares " + Math.round(ov * 100) + "% of its 4-grams with the background (a fault at ≥50%)");
    else if (ov >= 0.25) finding(out, "W.overlap-high", "answer " + (i + 1) + " shares " + Math.round(ov * 100) + "% of its 4-grams with the background (aim <25%)");
  });

  /* I */
  if (!c.image || !c.image.src) finding(out, "I.none", "no picture");
  else {
    const k = decodeURIComponent(String(c.image.src).split("/").pop()).replace(/^\d+px-/, "").replace(/_/g, " ").toLowerCase();
    const others = (ALL_IMG.get(k) || []).filter((x) => x !== c.id);
    if (others.length) finding(out, "I.duplicate", "the picture is also on " + others.join(", "));
    const d = String(c.image.desc || "") + " " + String(c.image.alt || "");
    const hit = CAPTION_SOURCE.exec(d);
    if (hit) finding(out, "I.caption-source", "the description names its source: \"" + hit[0] + "\"");
  }

  /* L */
  const kind = (c.tags || [])[0];
  if (PLACE_KINDS.has(kind) && !c.locator && !c.war) finding(out, "L.missing", "a " + kind + " card with no locator");
  return out;
}

/* ---------- run ---------- */
const results = scope.map((c) => ({ id: c.id, name: plain(c.answer), f: audit(c) }));
if (!SUMMARY) {
  for (const r of results) {
    if (!r.f.length && !ALL) continue;
    console.log(r.id + "  " + r.name + (r.f.length ? "" : "  — clean"));
    for (const [rule, msg] of r.f) console.log("    " + rule.padEnd(18) + msg);
  }
  console.log("");
}
console.log("greece-audit: " + scope.length + " card(s), " + results.filter((r) => !r.f.length).length + " with no finding");
Object.keys(RULES).sort().forEach((k) => {
  const n = results.filter((r) => r.f.some(([x]) => x === k)).length;
  console.log("  " + k.padEnd(18) + n + " card(s)");
});
