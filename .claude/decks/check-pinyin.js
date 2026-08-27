#!/usr/bin/env node
/*
  Folio — the Mandarin decks' PINYIN, cross-checked against their own BOPOMOFO.

    node .claude/decks/check-pinyin.js [--all]

  Exit 1 on a finding.

  WHY THIS EXISTS. A reader reported one card: 饭馆 was printed "fàng uǎn" where it should read "fàn
  guǎn". The `g` had moved from the start of the second syllable to the end of the first — a segmenter
  splitting "fanguan" as "fang"+"uan" rather than "fan"+"guan", which is the classic n/ng ambiguity and
  the one place a pinyin segmenter can go wrong without producing anything that looks like nonsense at a
  glance. Nothing could have caught it: the characters are right, the tones are right, the translation is
  right, and the letters are right — only the space is in the wrong place. It was one card of 11,404.

  WHAT MAKES IT CHECKABLE is that every one of those cards carries the reading TWICE, in two notations
  produced independently: `pinyin` and `fields.Bopomofo`. Zhuyin writes the initial as a symbol of its
  own, so ㄍ is a `g` wherever it appears and cannot migrate; comparing the two therefore pins the
  syllable boundary exactly. This does not convert zhuyin to pinyin in full — the medial and final rules
  are a thicket — it checks the one thing that decides the boundary: an initial in the zhuyin must be an
  initial in the pinyin, and the two must have the same number of syllables.

  THREE THINGS ARE DELIBERATELY NOT FINDINGS:
  · ERHUA. Pinyin writes 好玩儿 as "hǎo wánr", two syllables; zhuyin keeps ㄦ as a third. Both are
    correct and the difference is a convention, so a trailing ㄦ is dropped before counting.
  · An entry with two readings (谁 "shéi/shuí"), where the two notations are not even the same shape.
  · A missing Bopomofo field — a card with only one notation has nothing to be checked against.

  Not part of the site. See docs/lang-decks.md.
*/
const fs = require("fs"), path = require("path");
const DECKS = path.join(__dirname, "..", "..", "decks");

// the twenty-one zhuyin initials and the pinyin letters each must appear as
const INIT = {
  "ㄅ": "b", "ㄆ": "p", "ㄇ": "m", "ㄈ": "f", "ㄉ": "d", "ㄊ": "t", "ㄋ": "n", "ㄌ": "l",
  "ㄍ": "g", "ㄎ": "k", "ㄏ": "h", "ㄐ": "j", "ㄑ": "q", "ㄒ": "x",
  "ㄓ": "zh", "ㄔ": "ch", "ㄕ": "sh", "ㄖ": "r", "ㄗ": "z", "ㄘ": "c", "ㄙ": "s",
};
const bare = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const showAll = process.argv.includes("--all");

const files = fs.readdirSync(DECKS).filter((f) => /^Mandarin.*\.folio-deck\.json$/.test(f)).sort();
let checked = 0, skipped = 0;
const split = [], initial = [], spaced = [];

for (const f of files) {
  const deck = JSON.parse(fs.readFileSync(path.join(DECKS, f), "utf8"));
  for (const c of deck.cards || []) {
    const p = String(c.pinyin || "").trim();
    const z = String(((c.fields || {}).Bopomofo) || "").trim();
    if (!p || !z) { skipped++; continue; }
    if (/[\/,]/.test(p) || /[\/,]/.test(z)) { skipped++; continue; }   // two readings in one field
    const ps = p.split(/\s+/);
    /* ERHUA, and the test has to be narrow. Pinyin folds a suffixed 儿 onto the syllable before it
       ("hǎo wánr") where zhuyin keeps ㄦ as a syllable of its own, so the counts differ by one and
       neither is wrong. What that must NOT swallow is a word whose last syllable really IS `er` — 二 èr,
       女儿 nǚ ér, 然而 rán ér — where the ㄦ is the syllable rather than a suffix on the one before. So
       the trailing ㄦ is dropped only when the zhuyin has exactly one syllable more AND the pinyin's own
       last syllable ends in `r` without being `er` itself. */
    let zs = z.split(/\s+/);
    const last = bare(ps[ps.length - 1] || "");
    if (zs.length === ps.length + 1 && /^ㄦ/.test(zs[zs.length - 1]) && /r$/.test(last) && last !== "er") zs = zs.slice(0, -1);
    checked++;
    /* A MULTI-SYLLABLE READING WRITTEN AS ONE WORD is a house-style finding rather than an error: it is
       how a Chinese dictionary sets it and how the last stretch of the level 7 list was imported, and it
       is simply not how the other 11,000 cards in these decks are set. Reported separately so a run that
       is chasing the segmentation fault is not buried in it. */
    if (ps.length === 1 && zs.length > 1) { spaced.push([f, c.id, c.hanzi, p, z]); continue; }
    /* A BARE "r" IS NEVER A SYLLABLE. Erhua is a suffix written onto the syllable before it, so "méi
       shì r" is a space that should not be there — and it passes every test below, since the counts
       agree with the zhuyin's own ㄦ and ㄦ carries no initial to check. Two cards had it. */
    if (ps.some((x) => bare(x) === "r")) { split.push([f, c.id, c.hanzi, p, z, 'a bare "r" — erhua is written onto the syllable before it']); continue; }
    if (ps.length !== zs.length) { split.push([f, c.id, c.hanzi, p, z, ps.length + " syllable(s) against " + zs.length]); continue; }
    for (let i = 0; i < ps.length; i++) {
      const want = INIT[zs[i][0]];
      if (!want) continue;                                     // no initial: the pinyin may open on y, w or a vowel
      if (!bare(ps[i]).startsWith(want)) {
        initial.push([f, c.id, c.hanzi, p, z, "syllable " + (i + 1) + ' should begin "' + want + '"']);
        break;
      }
    }
  }
}

const list = (rows, head, note) => {
  if (!rows.length) return;
  console.log("");
  console.log(head + " — " + rows.length);
  if (note) console.log("  " + note);
  (showAll ? rows : rows.slice(0, 30)).forEach((r) =>
    console.log("  " + r[1].padEnd(18) + (r[2] || "").padEnd(7) + 'pinyin "' + r[3] + '"   zhuyin "' + r[4] + '"' + (r[5] ? "   (" + r[5] + ")" : "")));
  if (!showAll && rows.length > 30) console.log("  … " + (rows.length - 30) + " more (--all)");
};

console.log("Mandarin pinyin, against the same cards' bopomofo");
console.log("  " + files.length + " decks, " + checked + " readings cross-checked, " + skipped + " skipped (no bopomofo, or two readings)");
list(initial, "A CONSONANT HAS MOVED ACROSS A SYLLABLE BOUNDARY", "the reported fault: \"fanguan\" split as fang+uan rather than fan+guan");
list(split, "THE TWO NOTATIONS COUNT DIFFERENT SYLLABLES");
list(spaced, "WRITTEN AS ONE WORD where the rest of the corpus separates the syllables", "house style, not an error — but the decks should agree with themselves");
if (!initial.length && !split.length && !spaced.length) console.log("\n  clean");
process.exit(initial.length + split.length ? 1 : 0);
