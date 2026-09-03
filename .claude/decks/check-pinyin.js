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

  WHAT A TONE COMPARISON SHOWS, AND WHY IT IS NOT A CHECK (measured Sep 2026, chasing the report that
  "in some Mandarin cards the TTS pronunciation differs from the pinyin tone"). Both notations carry
  tone, so they can be compared syllable by syllable — and doing it over the 11,500 cross-checkable
  readings returns 231 disagreements, of which almost none are errors:
  · ~123 are 不 and 一 TONE SANDHI. Pinyin writes what is SPOKEN (bú kè qi, yì xiē) and zhuyin writes the
    citation tone (ㄅㄨˋ, ㄧ). Both conventions are right and the difference is systematic.
  · ~100 are NEUTRAL-TONE VARIANCE between the mainland and Taiwan standards — 学生 xuéshēng against
    ㄕㄥ˙, 回来 huí lái against ㄌㄞ˙. Neither is wrong; the two standards genuinely differ.
  So a tone check would cry wolf 220 times to find eight real faults, and a checker nobody runs is worse
  than no checker. The eight it WOULD have found are the erhua case below, which the zhuyin identifies
  exactly and which is therefore checked on its own terms instead. Do not add a blanket tone check.

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
const split = [], initial = [], spaced = [], erhua = [];

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
    /* ERHUA WRITTEN AS A SEPARATE `ér` SYLLABLE (Sep 2026, on a report that "in some Mandarin cards the
       TTS pronunciation differs from the pinyin tone"). 那儿 was set "nà ér" — two syllables, the second
       a full second tone — where the word is "nàr" and the speaker, handed the CHARACTERS, says "nàr".
       So the printed reading and the spoken one disagreed, which is exactly what was reported.
       THE ZHUYIN DECIDES, AND THAT IS THE WHOLE OF WHY THIS IS CHECKABLE. 儿 is two different things:
       a SUFFIX, which zhuyin writes ㄦ˙ (neutral), and a SYLLABLE of its own, which it writes ㄦˊ (second
       tone) — 女儿 nǚ'ér, 婴儿 yīng'ér, 孤儿 gū'ér, 胎儿 tāi'ér, 少儿 shào'ér are all correct as two
       syllables. Of the thirteen cards that wrote a trailing `ér`, the zhuyin sorted them 8 to 5 and the
       eight were repaired; the five stand. A rule that looked only at the pinyin could not have told them
       apart, and "fixing" all thirteen would have broken five correct readings.
       This is the erhua case the bare-`r` guard above does not see, `ér` carrying a vowel and a tone. */
    if (ps.length > 1 && /^(ér|er)$/i.test(ps[ps.length - 1].normalize("NFC")) && zs[zs.length - 1] === "ㄦ˙") {
      erhua.push([f, c.id, c.hanzi, p, z, "the zhuyin's ㄦ˙ is a suffix — write it onto the syllable before it"]);
      continue;
    }
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
list(erhua, "ERHUA WRITTEN AS ITS OWN SYLLABLE", "\u5417\u513f is \"n\u01cer\", not \"n\u01ce \u00e9r\" \u2014 and the speaker, given the characters, says the first");
list(spaced, "WRITTEN AS ONE WORD where the rest of the corpus separates the syllables", "house style, not an error — but the decks should agree with themselves");
if (!initial.length && !split.length && !spaced.length && !erhua.length) console.log("\n  clean");
process.exit(initial.length + split.length + erhua.length ? 1 : 0);
