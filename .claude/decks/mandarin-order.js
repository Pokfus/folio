#!/usr/bin/env node
"use strict";
/*
  mandarin-order.js — THE ORDER THE MANDARIN DECKS ARE DEALT IN (Nov 2026, the beginner pass). Standalone
  Node helper, zero deps. Not part of the site.

    node .claude/decks/mandarin-order.js              # recompute and write mandarin-order.json
    node .claude/decks/mandarin-order.js --seed-ids   # write mandarin-ids.json (refused once it exists)
    node .claude/decks/mandarin-order.js --report     # print each deck's first forty, write nothing

  WHY IT EXISTS. The nine decks shipped in the order of the lists they were built from — alphabetical by
  pinyin for the seven levels — and the app deals a deck in file order, its cards carrying no difficulty
  rating. Measured on 2026-11-15 (docs/mandarin-review.md, "The beginner pass"): Level 1 opened 爱, 八,
  爸爸, 吧, 白天; 你好 was note 147 and 我 note 221; zero to ten ran from note 2 to note 254.

  IT WRITES A RECORD, AND `mandarin-fix.js` APPLIES IT. `mandarin-order.json` is `{ <deck id>: { why,
  order: [headword, …] } }`, a full permutation of the deck's notes. The applier moves each note WITH ITS
  ID — see below — rewrites `num` to the new position and refuses a list that is not exactly the deck's
  headwords. The record is the authority and may be edited by hand; this script is how it was first
  computed and how it is recomputed on purpose, never as a side effect of another edit.

  A CARD ID IS PINNED TO ITS NOTE in `mandarin-ids.json` (deck id → headword → number). The ids were the
  note's POSITION when the decks were built (`u_hsk30l1_1` was 爱), and the Update press merges a reader's
  progress by id, so a re-ordering that renumbered would hand every schedule to another word. Nothing here
  renumbers: the id travels with the note, `--check` in mandarin-fix.js asserts every deck still agrees
  with the pin, and a row of the pin is never deleted. The three decks `build-beginner.js` writes take
  their numbers from the same file, a new note taking the next free one.

  THE RULES.
  · LEVEL 1 has a head written by hand — the courtesies, the first sentence's words, the pronouns, the
    question words, zero to ten and the numbers beyond, the commonest particles, the days — because those
    are closed sets and a set dealt across eight months is not learnt as one. The rest follows by
    frequency.
  · FREQUENCY is how often the nine decks' own example sentences use a headword, longest match at each
    position (so 天 is not counted inside 今天): the measure `uDeckWordFreq` in app.js makes in the
    browser, pooled over all nine decks instead of one. Ties keep the order the deck already had. It is
    baked into the file because the in-app "By frequency" order counts only the notes in memory, and a
    downloaded deck's notes are stubs until read.
  · TWO NOTES A READER COULD CONFUSE ARE KEPT `GAP` NOTES APART outside the head: a pair that names each
    other in a `not X` hint, and notes that share a first gloss (这里 / 这儿, 时候 / 时间, 学 / 学习).
  · THE EVERYDAY PHRASES are tiered by the lowest level whose word list spells the whole phrase, so the
    38 a Level 1 learner can read come first; within a tier the order is the one the deck had (film
    subtitle frequency). The curses listed in `LAST` close the deck.
  · IDIOMS are left as they are.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const IDS = path.join(__dirname, "mandarin-ids.json");
const OUT = path.join(__dirname, "mandarin-order.json");
const FIXES = path.join(__dirname, "mandarin-fixes.json");
const SEED = process.argv.includes("--seed-ids"), REPORT = process.argv.includes("--report");
const GAP = 40;

const LEVELS = ["hsk30l1", "hsk30l2", "hsk30l3", "hsk30l4", "hsk30l5", "hsk30l6", "hsk30l7"];
const NINE = LEVELS.concat(["hsk30phr", "hsk30idm"]);

/* Level 1's head. Each line is one sitting's worth, in the order a first course introduces them. */
const HEAD_L1 = [
  "你好 谢谢 不客气 对不起 没关系 再见 请 请问",          // the courtesies
  "我 你 他 她 是 不 的 吗 很 好",                        // the first sentence
  "您 它 们 我们 你们 他们 她们 它们",                    // the rest of the pronouns
  "什么 谁 哪 哪儿 怎么 怎么样 呢 吧",                    // asking
  "一 二 三 四 五 六 七 八 九 十 零 两 百 千 几 多少 个", // counting, and the general measure word
  "有 没有 在 了 也 都 和 这 那 这个 那个",               // the commonest function words
  "今天 明天 昨天 现在 年 月 日 号 星期 星期天 点 分",    // days and the clock
].join(" ").split(/\s+/);

/* The Everyday phrases deck's curses and insults, dealt last. Named, not detected: a pattern over the
   glosses took 午安 ("Hello") for "hell". */
const LAST_PHR = ["该死", "闭嘴", "放屁", "滚蛋", "住嘴", "去死", "奶奶的", "去你的", "我靠"];

const decks = {};
for (const f of fs.readdirSync(DIR).filter((x) => /^Mandarin-.*\.folio-deck\.json$/.test(x)).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  if (NINE.indexOf(d.meta.id) >= 0) decks[d.meta.id] = d;
}
for (const id of NINE) if (!decks[id]) { console.error("FAIL  no deck file for " + id); process.exit(1); }

if (SEED) {
  if (fs.existsSync(IDS)) { console.error("FAIL  mandarin-ids.json exists — a pin is never rewritten; add rows by hand or through build-beginner.js"); process.exit(1); }
  const pin = { _: "mandarin-ids.json — the number in each Mandarin card's id, pinned to its note: <deck id> → <headword> → N, for the id u_<deck id>_N. Seeded from the decks as shipped on 2026-11-15 by mandarin-order.js --seed-ids. Never delete or renumber a row: the Update press merges a reader's progress by id. A new note takes the next free number. mandarin-fix.js --check asserts every deck agrees with this file." };
  for (const id of NINE) {
    pin[id] = {};
    for (const c of decks[id].cards) {
      const m = /^u_([a-z0-9]+)_(\d+)$/.exec(c.id);
      if (!m || m[1] !== id || pin[id][c.hanzi]) { console.error("FAIL  " + id + "/" + c.hanzi + ": id " + c.id); process.exit(1); }
      pin[id][c.hanzi] = Number(m[2]);
    }
  }
  fs.writeFileSync(IDS, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n");
  console.log("wrote mandarin-ids.json: " + NINE.map((id) => id + " " + Object.keys(pin[id]).length).join(", "));
  process.exit(0);
}

const isHan = (ch) => /\p{Script=Han}/u.test(ch);
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "");
const sentences = (c) => (String((c.fields || {}).Examples || "").match(/<div class="uc-exz">[\s\S]*?<\/div>/g) || [])
  .map((m) => strip(m.replace(/<span class="uc-exsn">.*?<\/span>/, "")));

/* how often the nine decks' sentences use each headword — longest match, stepping past it.
   A TRANSLITERATED NAME IS STEPPED OVER FIRST: the sentences are Tatoeba's, where 汤姆 is Tom, and counted
   blind 汤 ("soup") is 420 uses, 386 of them Tom — it would open Level 4. Only names whose characters
   spell nothing else are listed. */
const NAMES = ["汤姆", "玛丽", "约翰", "萨米", "齐里", "莱拉"];
const vocab = new Set();
let maxLen = 1;
for (const id of NINE) for (const c of decks[id].cards) { vocab.add(c.hanzi); maxLen = Math.max(maxLen, [...c.hanzi].length); }
const freq = new Map();
for (const id of NINE) for (const c of decks[id].cards) for (const s of sentences(c)) {
  const t = [...s];
  for (let i = 0; i < t.length;) {
    let w = null;
    const nm = NAMES.find((x) => s.startsWith(x, t.slice(0, i).join("").length));
    if (nm) { i += [...nm].length; continue; }
    if (isHan(t[i])) for (let L = Math.min(maxLen, t.length - i); L >= 1; L--) {
      const cand = t.slice(i, i + L).join("");
      if (vocab.has(cand)) { w = cand; break; }
    }
    if (w) { freq.set(w, (freq.get(w) || 0) + 1); i += [...w].length; } else i++;
  }
}

/* the notes a reader could take for one another: a `not X` pair, and a shared first gloss */
const hints = JSON.parse(fs.readFileSync(FIXES, "utf8")).hints || {};
function rivals(id) {
  const cards = decks[id].cards, has = new Set(cards.map((c) => c.hanzi)), r = new Map();
  const link = (a, b) => {
    if (a === b || !has.has(a) || !has.has(b)) return;
    if (!r.has(a)) r.set(a, new Set()); if (!r.has(b)) r.set(b, new Set());
    r.get(a).add(b); r.get(b).add(a);
  };
  for (const key of Object.keys(hints)) {
    const i = key.indexOf("/");
    if (key.slice(0, i) === id) link(key.slice(i + 1), String(hints[key]));
  }
  for (const c of cards) {
    const m = /<div class="uc-pos">not ([^<]+)<\/div>/.exec((c.fields || {}).English || "");
    if (m) link(c.hanzi, m[1].trim());
  }
  const first = new Map();
  for (const c of cards) {
    const s = /<div class="uc-sense">([\s\S]*?)<\/div>/.exec((c.fields || {}).English || "");
    if (!s) continue;
    const g = strip(s[1].replace(/<i class="uc-pos">.*?<\/i>/, "")).split(/;\s*/)[0].toLowerCase().replace(/^(to|a|an|the) /, "").replace(/^\S+ — /, "").trim();
    if (!g || g[0] === "[") continue;
    if (!first.has(g)) first.set(g, []);
    first.get(g).push(c.hanzi);
  }
  for (const a of first.values()) if (a.length > 1 && a.length <= 4) for (const x of a) for (const y of a) link(x, y);
  return r;
}

/* `rest` in order, each note at least GAP after any rival already placed, where the list allows it */
function spaced(head, rest, r) {
  const out = head.slice(), at = new Map();
  out.forEach((w, i) => at.set(w, i));
  const left = rest.slice();
  while (left.length) {
    let k = left.findIndex((w) => {
      const rv = r.get(w);
      if (!rv) return true;
      for (const o of rv) if (at.has(o) && out.length - at.get(o) < GAP) return false;
      return true;
    });
    if (k < 0) k = 0;
    const w = left.splice(k, 1)[0];
    at.set(w, out.length); out.push(w);
  }
  return out;
}

const byFreq = (cards) => cards.map((c, i) => ({ w: c.hanzi, i, n: freq.get(c.hanzi) || 0 }))
  .sort((a, b) => b.n - a.n || a.i - b.i).map((o) => o.w);

/* The order is computed from the decks AS FIRST SHIPPED (the pin's own numbering), so running this twice
   gives the same answer: a tie is broken by the note's pinned number, not by wherever a previous run of
   the applier left it. */
if (!fs.existsSync(IDS)) { console.error("FAIL  mandarin-ids.json is missing — run --seed-ids on the decks as shipped first"); process.exit(1); }
const pin = JSON.parse(fs.readFileSync(IDS, "utf8"));
const shipped = (id) => decks[id].cards.slice().sort((a, b) => pin[id][a.hanzi] - pin[id][b.hanzi]);

const out = { _: "mandarin-order.json — the order each Mandarin deck is dealt in, as a full list of its headwords. Written by mandarin-order.js (the rules are in its header), applied by mandarin-fix.js, which moves a note with its id and never renumbers. May be edited by hand; a list that is not exactly the deck's headwords is refused." };

{ // Level 1
  const cards = shipped("hsk30l1"), has = new Set(cards.map((c) => c.hanzi));
  const bad = HEAD_L1.filter((w) => !has.has(w)), dup = HEAD_L1.filter((w, i) => HEAD_L1.indexOf(w) !== i);
  if (bad.length || dup.length) { console.error("FAIL  Level 1 head: not in the deck [" + bad + "], twice [" + dup + "]"); process.exit(1); }
  const head = new Set(HEAD_L1);
  out.hsk30l1 = {
    why: "Level 1 was alphabetical by pinyin: 你好 was note 147, 我 note 221, and zero to ten ran from note 2 to note 254. The first " + HEAD_L1.length + " notes are now the courtesies, the first sentence's words, the pronouns, the question words, the numbers, the commonest function words and the days, in that order; the rest follow by how often the decks' own sentences use them, with notes a reader could confuse kept " + GAP + " apart.",
    order: spaced(HEAD_L1, byFreq(cards).filter((w) => !head.has(w)), rivals("hsk30l1")),
  };
}
for (const id of LEVELS.slice(1)) {
  out[id] = {
    why: "The level was alphabetical by pinyin, an order with no teaching in it. It is now by how often the nine decks' own example sentences use each word, commonest first; words counted equally keep their alphabetical order, and notes a reader could confuse are kept " + GAP + " apart.",
    order: spaced([], byFreq(shipped(id)), rivals(id)),
  };
}
{ // Everyday phrases
  const cum = [];
  let acc = new Set();
  for (const id of LEVELS) { for (const c of decks[id].cards) acc.add(c.hanzi); cum.push(new Set(acc)); }
  const spells = (w, set) => {
    const t = [...w];
    for (let i = 0; i < t.length;) {
      if (!isHan(t[i])) { i++; continue; }
      let hit = 0;
      for (let L = Math.min(6, t.length - i); L >= 1; L--) if (set.has(t.slice(i, i + L).join(""))) { hit = L; break; }
      if (!hit) return false;
      i += hit;
    }
    return true;
  };
  const tier = (w) => { for (let i = 0; i < cum.length; i++) if (spells(w, cum[i])) return i + 1; return 8; };
  const cards = shipped("hsk30phr"), has = new Set(cards.map((c) => c.hanzi));
  const bad = LAST_PHR.filter((w) => !has.has(w));
  if (bad.length) { console.error("FAIL  phrases: not in the deck [" + bad + "]"); process.exit(1); }
  const last = new Set(LAST_PHR);
  const rows = cards.map((c, i) => ({ w: c.hanzi, i, t: last.has(c.hanzi) ? 99 : tier(c.hanzi) }))
    .sort((a, b) => a.t - b.t || a.i - b.i);
  const n = (t) => rows.filter((r) => r.t === t).length;
  out.hsk30phr = {
    why: "The deck was in film-subtitle frequency order and opened 快点, 没错, 干什么, 干嘛, 该死, under a subtitle saying it could be used from Level 1. It is now tiered by the lowest level whose word list spells the whole phrase: " + n(1) + " at Level 1, " + n(2) + " at Level 2, " + n(3) + " at Level 3, " + (n(4) + n(5) + n(6) + n(7)) + " at Levels 4 to 9 and " + n(8) + " using a word no level lists; within a tier the order is unchanged. Its " + LAST_PHR.length + " curses and insults close the deck.",
    order: rows.map((r) => r.w),
    tiers: { 1: n(1), 2: n(2), 3: n(3), "4-9": n(4) + n(5) + n(6) + n(7), none: n(8), last: n(99) },
  };
}

if (REPORT) {
  for (const id of Object.keys(out)) if (id !== "_") console.log("\n" + id + " (" + out[id].order.length + ")\n  " + out[id].order.slice(0, 40).join(" "));
  console.log("\nphrases tiers: " + JSON.stringify(out.hsk30phr.tiers));
  process.exit(0);
}
const text = "{\n" + Object.keys(out).map((k) => JSON.stringify(k) + ":" + JSON.stringify(out[k])).join(",\n") + "\n}\n";
fs.writeFileSync(OUT, text);
console.log("wrote mandarin-order.json: " + Object.keys(out).filter((k) => k !== "_").map((k) => k + " " + out[k].order.length).join(", "));
