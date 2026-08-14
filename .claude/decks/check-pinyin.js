/* THE TWO READINGS ON EVERY CARD, CHECKED AGAINST EACH OTHER.
   Run: node check-pinyin.js            (from .claude/decks — no browser, no dependencies, ~1s)

   A card carries the reading twice: pinyin from the official HSK vocabulary PDFs, bopomofo from CC-CEDICT
   through complete.json. Two sources, one reading — so they can be held against each other, and neither
   needs a dictionary this repo does not have.

   IT EXISTS BECAUSE OF WHAT IT CAUGHT. 办公室 shipped as `bàng ōng shì`: the g had migrated one syllable
   left, leaving `ōng`, which is not a Mandarin syllable at all — the signature of a greedy splitter run
   over unsegmented pinyin, since at `bàngōngshì` the longest legal syllable is `bàng` and everything after
   that cut is wrong. 28 readings were corrupt that way and **every count read healthy**: the word had its
   three syllables, every tone was present, and nothing threw. Only the bopomofo could see it.

   MOST DISAGREEMENTS ARE NOT ERRORS, which is the whole difficulty and why this reports in classes rather
   than as one number. 92 words differ on 不 (the syllabus writes the sandhi bú, the bopomofo the citation
   form bù — both right); 236 differ in syllable COUNT, being erhua, two-reading words, and the levels 7–9
   band, which is word-spaced `zōngjiào` rather than syllable-spaced, standard orthography either way; and
   a handful differ over whether a syllable is neutral-toned, which is mainland against Taiwan and not for
   a build to settle. Only the first class below is a fault, and it must stay at zero. */
const fs = require("fs"), path = require("path");
const { fixPinyin } = require("./deckcore.js");

const DECKS = path.join(__dirname, "..", "..", "decks");
const TONE = { "ā":"a","á":"a","ǎ":"a","à":"a","ē":"e","é":"e","ě":"e","è":"e","ī":"i","í":"i","ǐ":"i","ì":"i",
  "ō":"o","ó":"o","ǒ":"o","ò":"o","ū":"u","ú":"u","ǔ":"u","ù":"u","ǖ":"v","ǘ":"v","ǚ":"v","ǜ":"v","ü":"v" };
const bare = (s) => [...String(s).toLowerCase()].map((c) => TONE[c] || c).join("").replace(/[^a-z]/g, "");
/* the thirteen syllables Mandarin writes with no initial. Anything else beginning with a vowel cannot be a
   syllable, which is what a consonant migrating across a boundary leaves behind. */
const ZERO = new Set(["a", "ai", "an", "ang", "ao", "e", "ei", "en", "eng", "er", "o", "ou"]);

let fails = 0, checks = 0;
const ok = (c, m, x) => { checks++; console.log((c ? "   ✓ " : "   ✗ ") + m + (x !== undefined ? "   " + x : "")); if (!c) fails++; };

const files = fs.readdirSync(DECKS).filter((f) => /Mandarin/.test(f) && /\.folio-deck\.json$/.test(f));
if (!files.length) { console.log("no Mandarin decks in " + DECKS); process.exit(1); }

for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DECKS, f), "utf8"));
  const impossible = [], contradicted = [], repairable = [];
  let sandhi = 0, counts = 0, checked = 0;
  for (const c of d.cards) {
    const x = c.fields || {};
    if (!x.Pinyin || !x.Bopomofo) continue;
    checked++;
    if (String(x.Pinyin).indexOf("/") >= 0) continue;              // a word with two readings
    const p = String(x.Pinyin).trim().split(/\s+/), z = String(x.Bopomofo).trim().split(/\s+/);
    /* THE HARD FAULT: a syllable that cannot exist. Tested only where the two readings agree on the count,
       since a word-spaced token (`zōngjiào`, `Běijīng`) is several syllables at once and vowel-initial by
       accident — correct orthography, and not something to report. */
    if (p.length === z.length) {
      const bad = p.map(bare).filter((s) => /^[aeiouv]/.test(s) && !ZERO.has(s));
      if (bad.length) impossible.push(x.Simplified + " " + x.Pinyin + " [" + bad.join(" ") + "]");
      // …and the same corruption where both halves happen to be legal, which only the bopomofo can see
      else if (fixPinyin(x.Pinyin, x.Bopomofo) !== x.Pinyin) contradicted.push(x.Simplified + " " + x.Pinyin);
      if (p.some((s, i) => /^bu$/.test(bare(s)) && /^ㄅㄨ/.test(z[i]) && s.toLowerCase() !== "bù")) sandhi++;
    } else {
      counts++;
      if (fixPinyin(x.Pinyin, x.Bopomofo) !== x.Pinyin) repairable.push(x.Simplified + " " + x.Pinyin);
    }
  }
  console.log("\n" + f + "   " + checked + " readings");
  ok(!impossible.length, "no reading contains a syllable Mandarin has not got",
    impossible.length ? impossible.slice(0, 6).join(" | ") : "");
  ok(!contradicted.length, "…and none is contradicted by its own bopomofo",
    contradicted.length ? contradicted.slice(0, 6).join(" | ") : "");
  ok(!repairable.length, "…and no syllable is cut in two",
    repairable.length ? repairable.slice(0, 6).join(" | ") : "");
  console.log("     (expected and not faults: " + sandhi + " 不 sandhi, " + counts + " count differences — erhua, two-reading words, word-spaced levels 7–9)");
}

console.log("\n" + (checks - fails) + " passed, " + fails + " failed");
process.exit(fails ? 1 : 0);
