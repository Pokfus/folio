/* Resolve each measure word's own reading and attach it to the words that take it (HSK 3.0 levels 1-3).
   Same two rules the HSK 2.0 pass settled: the CLASSIFIER sense of the character gives the reading (只 zhī
   and not zhǐ, 台 tái), a form whose every meaning is a surname is not a reading of it at all (双 leads with
   Shuāng), and where a character carries two classifier senses the choice can depend on the word it measures
   — 场 is cháng for a spell of something and chǎng for a staged event — so an override may be keyed either on
   the character or on "<word>|<character>".
     node mw30.js                                                                                          */
const fs = require("fs");
const data = JSON.parse(fs.readFileSync("complete.json", "utf8"));
const bySimp = new Map();
data.forEach(e => { if (!bySimp.has(e.simplified)) bySimp.set(e.simplified, []); bySimp.get(e.simplified).push(e); });

const MAX = 2;   // CC-CEDICT lists the commonest first; four of them is a list rather than a hint
const READING_FIX = {
  "场": "chǎng",            // the staged-event sense, which is what most of these words take
  "雪|场": "cháng",          // …but a fall of snow, a shower and a bout of illness are 一场 cháng
  "雨|场": "cháng",
  "病|场": "cháng",
  "感冒|场": "cháng",
  /* 曲 is not marked as a classifier in CC-CEDICT at all, so the reading falls to its first entry, which is
     qū "bent; crooked". A piece of music is 一曲 qǔ. */
  "曲": "qǔ",
};
const reading = (word, c) => READING_FIX[word + "|" + c] || READING_FIX[c] || "";

const surnameOnly = f => (f.meanings || []).length && (f.meanings || []).every(m => /^surname\b/i.test(m));
const isCls = f => (f.meanings || []).some(m => /classifier|measure word/i.test(m));
const xrefOnly = f => (f.meanings || []).length && (f.meanings || []).every(m => /^(variant of|old variant of|see )/i.test(m));

/* Five of these characters are not HSK words at any level and so are not in complete.json at all — 具 for a
   body, 尾 for a fish, 撮 for a tuft of grass, 沓 for a sheaf of paper, 身 for a suit of clothes — and dropped
   rather than resolved they would take the measure-word line off those five cards in silence. CC-CEDICT
   itself has them; its readings are written with a tone digit, which pinyin.js converts. */
const numToMarks = require("./pinyin.js");
const cedict = new Map();
fs.readFileSync("cedict.u8", "utf8").split(/\r?\n/).forEach(l => {
  if (!l || l[0] === "#") return;
  const m = /^(\S+) (\S+) \[([^\]]*)\] \/(.*)\/$/.exec(l);
  if (!m) return;
  if (!cedict.has(m[2])) cedict.set(m[2], []);
  cedict.get(m[2]).push({ traditional: m[1], pinyin: numToMarks(m[3]), meanings: m[4].split("/") });
});
const table = {};
function resolve(c) {
  if (table[c] !== undefined) return table[c];
  const forms = [];
  (bySimp.get(c) || []).forEach(e => (e.forms || []).forEach(f => forms.push(f)));
  let real = forms.filter(f => !surnameOnly(f)).map(f => ({ traditional: f.traditional, pinyin: f.transcriptions.pinyin, meanings: f.meanings }));
  if (!real.length) real = (cedict.get(c) || []).filter(f => !surnameOnly(f));
  /* a "variant of" entry carries no sense and its traditional form is an obscure one — 碗 leads with 㼝,
     which is what would otherwise have been printed beside the bowl */
  const solid = real.filter(f => !xrefOnly(f));
  const pool = solid.length ? solid : real;
  const pick = pool.filter(isCls)[0] || pool[0];
  return (table[c] = pick ? { trad: pick.traditional, pinyin: pick.pinyin } : null);
}

let total = 0, unresolved = [];
// the levels to touch, all six unless some are named on the command line
const LEVELS = process.argv.slice(2).map(Number).filter(n => n >= 1 && n <= 7);
(LEVELS.length ? LEVELS : [1, 2, 3, 4, 5, 6, 7]).forEach(L => {
  const words = JSON.parse(fs.readFileSync("w26-" + L + ".json", "utf8"));
  let n = 0;
  words.forEach(w => {
    /* a classifier can arrive with a space on it — complete.json gives 法律 the measure word " \u5957"
       — and an untrimmed one resolves to nothing and is reported as missing from the dictionary */
    w.mw = (w.cls || []).map(c => String(c).trim()).filter(Boolean).slice(0, MAX).map(c => {
      const t = resolve(c);
      if (!t) { unresolved.push(w.simp + " -> " + c); return null; }
      return { simp: c, trad: t.trad && t.trad !== c ? t.trad : "", pinyin: reading(w.simp, c) || t.pinyin };
    }).filter(x => x && x.pinyin);
    if (w.mw.length) n++;
  });
  fs.writeFileSync("w26-" + L + ".json", JSON.stringify(words, null, 1));
  total += n;
  console.log("L" + L + ": " + n + " of " + words.length + " words carry a measure word");
});
const distinct = [...new Set(Object.keys(table))].filter(c => table[c]).sort();
console.log("\ndistinct measure words: " + distinct.length);
distinct.forEach(c => console.log("  " + c + (table[c].trad !== c ? "/" + table[c].trad : "") + "  " + table[c].pinyin));
if (unresolved.length) console.log("\nUNRESOLVED: " + unresolved.join(", "));
