#!/usr/bin/env node
"use strict";
/*
  oldenglish-order.js — HOW oldenglish-order.json IS COMPUTED (Nov 2026, the Old English beginner pass —
  docs/lang-decks.md, "The Old English beginner pass"). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/oldenglish-order.js [--check] [--report]

  It reads the Old English decks AS oldenglish-fix.js LEFT THEM and the pin, and writes, for Level 1, the
  order the deck is dealt in, and for both decks the FACTS their descriptions state. The order is computed
  from the PINNED NUMBER — the word's rank in the frequency count of 2026-11-09, which never changes — and
  never from the order the file happens to be in, so running it twice, or after the order has been
  applied, gives the same list. `oldenglish-fix.js` applies the list and writes the facts into the
  descriptions.

  LEVEL 1 IS DEALT BY FREQUENCY, AND STAYS SO. The reader of this shelf is a READER — nobody speaks Old
  English — and the measure is how soon a page of prose can be read, which the commonest words first is
  already the best order for: there is no head of greetings to write. Day one is sē · and · hē · wesan · on.
  What the audit found scattered were the CLOSED SETS, the small paradigms that are learnt as one thing:
  hē was note 3 with hit 25 and hēo 32, bēon was 15 notes after wesan, mīn 43 and ēower 102, hwæt 64 and
  hwelċ 457, twēġen 113 and þūsend 462, magan 36 and cunnan 252. So one rule, and no other:
    · a SET (`SETS`) arrives together, in the order written here, at the place of its COMMONEST member.
  Everything else is in the order of its pinned number. A set word that is not a card of Level 1 is an
  ERROR, and so is a word in two sets. Level 1 gained no card: a level is a band of frequency (the plan's
  §1), and six, eight, nine and ten are Level 2's by count.

  THE ALPHABET has no order here: it keeps the one `alphabet.py` wrote (a rule after the block it needs).
  Its facts are what Level 1's headwords and sentences ask of a reader.

  THE FACTS (`facts`, per deck) are every figure a description's last paragraph states that is not a plain
  count of the deck: on which day of the shelf each set falls, how much of a sentence a reader has met on
  the day its card arrives, how many headwords need each reading rule. They are recomputed on every run;
  `--check` fails if the file lags. (What share of Ælfric the cards cover is the GENERATOR's figure, in the
  body of the description: it needs the corpus.)
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const IDS_FILE = path.join(__dirname, "oldenglish-ids.json"), ORD_FILE = path.join(__dirname, "oldenglish-order.json");
const CHECK = process.argv.includes("--check"), REPORT = process.argv.includes("--report");
const die = (m) => { console.log("FAIL  " + m); process.exit(1); };
const W = (s) => s.trim().split(/\s+/);
const PER_DAY_CARDS = 10; // LIMIT_DEFAULTS.lang: ten new CARDS a day; a word or a letter is two, a reading rule one

// each set in the order it is dealt; it stands where its commonest member's rank puts it
const SETS = [
  { key: "be", name: "to be, in its two stems", words: W("wesan bēon") },
  { key: "third", name: "he, she, it, they", words: W("hē hēo hit hīe") },
  { key: "we", name: "I, you, we, you", words: W("iċ þū wē ġē") },
  { key: "modal", name: "will, may, shall, must, can, know", words: W("willan magan sċulan mōtan cunnan witan") },
  { key: "poss", name: "my, your, our, your", words: W("mīn þīn ūre ēower") },
  { key: "ask", name: "the question words", words: W("hwæt hwā hū hwȳ hwǣr hwelċ hwæþer") },
  { key: "num", name: "the numbers above one", words: W("twēġen þrī fēower fīf seofon twelf hund þūsend þridda") },
  { key: "neg", name: "the verbs with ne- built in", words: W("nyllan nabban nesan nytan") },
];

function load(type) {
  for (const f of fs.readdirSync(DIR).filter((x) => /^Old-English-.*\.folio-deck\.json$/.test(x)).sort()) {
    const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
    if (d.meta.types && d.meta.types[type]) return d;
  }
  die("no deck of card type " + type);
}
const L1 = load("oldenglish"), ABC = load("oe-abc");
const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8"));
const dec = (s) => String(s || "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const strip = (h) => dec(String(h || "").replace(/<[^>]+>/g, ""));

/* `oe.fold`, in JavaScript: the spelling differences that are not differences (see .claude/oldenglish/oe.py) */
function fold(s) {
  s = s.toLowerCase().normalize("NFD").replace(/\p{Mn}/gu, "").normalize("NFC")
    .replace(/ð/g, "þ").replace(/ƿ/g, "w").replace(/[ȝᵹ]/g, "g").replace(/y/g, "i").replace(/ꝥ/g, "þæt").replace(/-/g, "").replace(/ie/g, "i");
  if (s.length > 6) s = s.replace(/nis(s?)(e|a|um|es)?$/, (m, a, b) => "nes" + a + (b || ""));
  return s;
}
const toks = (s) => s.match(/\p{L}+(?:-\p{L}+)*/gu) || [];
// every form a card prints: the headword, the key forms, the texts' spellings, the table
function forms(c) {
  const out = new Set([fold(c.fields.Word)]);
  for (const m of (c.fields.Forms + c.fields.Table).matchAll(/class="uc-(?:fl">[^<]*<\/span>|cj-f">)([^<]*)</g)) for (const t of toks(dec(m[1]))) out.add(fold(t));
  return out;
}
const sentences = (c) => [...c.fields.Examples.matchAll(/<div class="uc-exz">((?:(?!<\/div>).)*)<\/div><div class="uc-exe">[^<]*<\/div><div class="uc-exsrc">([^<]*)</g)]
  .map((m) => ({ toks: toks(strip(m[1])).map(fold), src: dec(m[2]) }));

function orderL1() {
  const pin = PIN.oel1, cards = new Set(L1.cards.map((c) => c.fields.Word));
  const anchor = new Map();
  for (const s of SETS) {
    const first = Math.min(...s.words.map((w) => {
      if (!cards.has(w)) die("set " + s.name + ": " + w + " is not a card of Level 1");
      if (anchor.has(w)) die(w + " is in two sets");
      return pin[w];
    }));
    s.words.forEach((w, i) => anchor.set(w, [first, i + 1]));
  }
  const key = (w) => anchor.get(w) || [pin[w] || die(w + " has no pinned number"), 0];
  return [...cards].sort((a, b) => key(a)[0] - key(b)[0] || key(a)[1] - key(b)[1]);
}

const abcCards = ABC.cards.reduce((a, c) => a + ABC.meta.types[c.type].cards.length, 0);
const dayOf = (n) => Math.ceil((abcCards + 2 * n) / PER_DAY_CARDS); // the day of the SHELF Level 1's nth note is finished on

function facts(order) {
  const by = new Map(L1.cards.map((c) => [c.fields.Word, c]));
  const at = (w) => order.indexOf(w) + 1;
  const f = { firstFive: order.slice(0, 5).join(" · "), firstDay: Math.floor(abcCards / PER_DAY_CARDS) + 1, sets: SETS.length };
  for (const s of SETS) {
    const p = s.words.map(at);
    if (Math.max(...p) - Math.min(...p) !== s.words.length - 1) die("set " + s.name + " is not together in the order");
    f[s.key + "At"] = Math.min(...p); f[s.key + "To"] = Math.max(...p); f[s.key + "Day"] = dayOf(Math.min(...p)); f[s.key + "N"] = s.words.length;
  }
  f.setWords = SETS.reduce((n, s) => n + s.words.length, 0);
  // the sentences, in arrival order: a word of a sentence is MET only if a card dealt so far prints that form
  const met = new Set(), all = new Set();
  for (const c of L1.cards) for (const x of forms(c)) all.add(x);
  let tot = 0, hit = 0, whole = 0, n = 0, none = 0, aelfric = 0, aelfricCards = 0, cardsWith = 0, three = 0;
  const lens = [];
  for (const w of order) {
    const c = by.get(w), ss = sentences(c);
    for (const x of forms(c)) met.add(x);
    if (ss.length) cardsWith++;
    if (ss.length === 3) three++;
    if (ss.some((s) => /^Ælfric/.test(s.src))) aelfricCards++;
    for (const s of ss) {
      const h = s.toks.filter((t) => met.has(t)).length;
      tot += s.toks.length; hit += h; n++; if (h === s.toks.length) whole++;
      none += s.toks.filter((t) => !all.has(t)).length; lens.push(s.toks.length);
      if (/^Ælfric/.test(s.src)) aelfric++;
    }
  }
  lens.sort((a, b) => a - b);
  Object.assign(f, { sentences: n, sentenceCards: cardsWith, threeSentences: three, aelfricSentences: aelfric, aelfricCards, tatoebaSentences: n - aelfric,
    sentenceMedian: lens[lens.length >> 1], metPct: (100 * hit / tot).toFixed(0), wholeSentences: whole, noCardPct: (100 * none / tot).toFixed(0) });
  // the grammar the cards show
  const pos = (c) => (/class="uc-pos">([^<]*)</.exec(c.fields.English) || [])[1] || "";
  const nouns = L1.cards.filter((c) => /^noun/.test(pos(c))), verbs = L1.cards.filter((c) => /^verb/.test(pos(c))), adjs = L1.cards.filter((c) => /^adjective/.test(pos(c)));
  f.nouns = nouns.length; f.nounClass = nouns.filter((c) => />declension</.test(c.fields.Forms)).length;
  f.verbs = verbs.length; f.strong = verbs.filter((c) => /strong class/.test(pos(c))).length;
  f.adjs = adjs.length; f.adjWeak = adjs.filter((c) => /weak (?:masculine|plural)/.test(c.fields.Table)).length;
  f.also = L1.cards.filter((c) => /uc-also/.test(c.fields.Forms)).length;
  return f;
}

// what Level 1's headwords and sentences ask of a reader (the alphabet deck's last paragraph states it)
function reading(order) {
  const by = new Map(L1.cards.map((c) => [c.fields.Word, c]));
  const f = { words: order.length, macron: 0, dotC: 0, dotG: 0, thorn: 0, voiced: 0, ie: 0, prefix: 0, notFirst: 0, slashes: 0, brackets: 0, noIpa: 0 };
  const V = "aæeiouyāǣēīōūȳ";
  for (const w of order) {
    const s = w.toLowerCase(), ipa = dec(by.get(w).fields.IPA);
    if (/[āǣēīōūȳ]/.test(s)) f.macron++;
    if (/ċ/.test(s)) f.dotC++;
    if (/ġ/.test(s)) f.dotG++;
    if (/[þð]/.test(s)) f.thorn++;
    if (new RegExp("[" + V + "lrmn][fsþ][" + V + "lrmn]").test(s)) f.voiced++;
    if (/[iī]e/.test(s)) f.ie++;
    if (/^ġe/.test(s)) f.prefix++;
    if (!ipa) f.noIpa++; else if (ipa[0] === "/") f.slashes++; else f.brackets++;
    if (/ˈ/.test(ipa) && !/^[\[/]ˈ/.test(ipa)) f.notFirst++;
  }
  const ss = L1.cards.flatMap((c) => [...c.fields.Examples.matchAll(/<div class="uc-exz">((?:(?!<\/div>).)*)<\/div><div class="uc-exe">[^<]*<\/div><div class="uc-exsrc">([^<]*)</g)].map((m) => ({ text: strip(m[1]), src: dec(m[2]) })));
  const ae = ss.filter((s) => /^Ælfric/.test(s.src)), ta = ss.filter((s) => /^Tatoeba/.test(s.src));
  f.aelfric = ae.length; f.aelfricEth = ae.filter((s) => /ð/i.test(s.text)).length; f.aelfricAcute = ae.filter((s) => /[áéíóúýǽ]/i.test(s.text)).length;
  f.aelfricMarked = ae.filter((s) => /[āǣēīōūȳċġ]/i.test(s.text)).length;
  f.tatoeba = ta.length; f.wynn = ta.filter((s) => /ƿ/i.test(s.text)).length;
  f.letters = ABC.cards.filter((c) => c.type === "oe-abc").length; f.rules = ABC.cards.filter((c) => c.type === "oe-read").length;
  return f;
}

const ORDER = orderL1();
const OUT = { oeabc: { facts: reading(ORDER) }, oel1: { order: ORDER, facts: facts(ORDER) } };
const text = "{\n" + Object.keys(OUT).map((k) => JSON.stringify(k) + ": " + JSON.stringify(OUT[k])).join(",\n") + "\n}\n";

if (REPORT) {
  const at = (w) => ORDER.indexOf(w) + 1;
  console.log("Level 1, " + ORDER.length + " notes; the alphabet before it is " + abcCards + " cards; the shelf ends on day " + dayOf(ORDER.length));
  for (let d = 0; d < 4; d++) console.log("  notes " + (d * 5 + 1) + "–" + (d * 5 + 5) + ": " + ORDER.slice(d * 5, d * 5 + 5).join(" · "));
  for (const s of SETS) { const p = s.words.map(at); console.log(s.name + ": notes " + Math.min(...p) + "–" + Math.max(...p) + " (day " + dayOf(Math.min(...p)) + "), were " + s.words.map((w) => PIN.oel1[w]).join(" ")); }
  console.log("Level 1 facts: " + JSON.stringify(OUT.oel1.facts));
  console.log("alphabet facts: " + JSON.stringify(OUT.oeabc.facts));
}
const old = fs.existsSync(ORD_FILE) ? fs.readFileSync(ORD_FILE, "utf8") : "";
if (CHECK) {
  if (old !== text) die("oldenglish-order.json is not what oldenglish-order.js computes — run it, then oldenglish-fix.js");
  console.log("oldenglish-order --check: the order and the facts are what the rules give");
} else if (old !== text) { fs.writeFileSync(ORD_FILE, text); console.log("wrote oldenglish-order.json — now run oldenglish-fix.js"); }
else console.log("oldenglish-order.json is current");
