/* HSK 3.0 LEVELS 7–9, taken from hanzistroke.com's page for the band rather than from a PDF — there is no
   PDF of this one, and the page carries the whole list in its own data rather than fetching it, so nothing
   is scraped out of rendered markup. The band is ONE level in the standard, not three, and its 5,600
   entries are the list's own two halves: 512 single CHARACTERS and 5,088 WORDS, which are kept apart here
   because the source keeps them apart and because they are different things to study.

   THE PART OF SPEECH IS WRITTEN IN CHINESE HERE, where the level 1-6 PDFs write it as "(n.)" at the head of
   the definition. It is converted to that same form — 动、名 becomes "(v./n.)" — so everything downstream
   reads it exactly as it reads the other six levels: the card spells it out, the tagger seeds itself from
   it, and no second convention has to be carried anywhere. A tag the table does not know is REPORTED and
   the definition left alone rather than guessed at.

     node extract79.js <page.html>   → up7.json                                                            */
const fs = require("fs");

const src = fs.readFileSync(process.argv[2] || "l79.html", "utf8");
/* The page is a Next.js app and its data arrives as flight chunks — JavaScript string literals pushed onto
   self.__next_f. Decoding those with JSON.parse gives the real text, which is far safer than trying to undo
   the backslash escaping by hand: a first attempt at that mangled a hundred rows and reported 4,984 of the
   5,088 words, with the damage showing only as odd fragments in a key histogram. */
const chunks = [...src.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)].map((m) => JSON.parse(m[1]));
if (!chunks.length) throw new Error("no flight data in the page — has the site changed?");
const t = chunks.join("");

const S = '((?:[^"\\\\]|\\\\.)*)';
const words = [...t.matchAll(new RegExp(
  '\\{"id":"official_vocab:hsk30:\\d+:\\d+","simplified":"' + S + '","pinyin":"' + S +
  '","definition":"' + S + '","pos":"' + S + '"\\}', "g"))];
const chars = [...t.matchAll(new RegExp(
  '\\{"id":"[^"]*","char":"' + S + '","pinyin":"' + S + '","meaning":"' + S +
  '","isLearned":\\w+,"pos":(null|"' + S + '")', "g"))];

/* the tagset, as the two halves of the list write it. The Chinese tags are the standard's own; the English
   ones appear on the entries the site has classed as idioms and set phrases. */
const TAG = {
  "名": "n.", "动": "v.", "形": "adj.", "副": "adv.", "连": "conj.", "量": "mw.", "代": "pron.",
  "介": "prep.", "助": "part.", "数": "num.", "数量": "num.", "拟声": "onom.", "前缀": "pref.", "后缀": "suf.",
  noun: "n.", verb: "v.", adjective: "adj.", adverb: "adv.", conjunction: "conj.", pronoun: "pron.",
  preposition: "prep.", particle: "part.", numeral: "num.", phrase: "phr.", idiom: "idiom.",
  interjection: "interj.", onomatopoeia: "onom.",
};
const unknown = new Map();
function abbrev(pos) {
  const raw = String(pos || "").trim();
  if (!raw) return "";
  const parts = raw.split(/[、\/]/).map((x) => x.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) {
    const a = TAG[p];
    if (!a) { unknown.set(p, (unknown.get(p) || 0) + 1); return ""; }   // one unknown tag drops the whole prefix
    if (!out.includes(a)) out.push(a);
  }
  return out.length ? "(" + out.join("/") + ") " : "";
}

const un = (x) => JSON.parse('"' + x + '"');
/* A GRAPH LISTED TWICE IS TWO READINGS TO LEARN and both rows are kept, exactly as the level 1-6 lists do
   it: 挨 is here as āi "next to" and ái "to suffer". The builder merges them into one card carrying both,
   so deduplicating here would silently take the second reading away. */
const rows = [];
function add(simp, pinyin, def, pos) {
  const w = un(simp).trim();
  if (!w) return;
  rows.push({ simp: w, pinyin: un(pinyin).trim(), def: abbrev(pos) + un(def).trim() });
}
chars.forEach((m) => add(m[1], m[2], m[3], m[4] === "null" ? "" : un(m[4].slice(1, -1))));
words.forEach((m) => add(m[1], m[2], m[3], un(m[4])));

fs.writeFileSync("up7.json", JSON.stringify(rows, null, 1));
console.log("characters " + chars.length + " + words " + words.length + " = " + (chars.length + words.length)
  + " entries, " + rows.length + " rows (" + (rows.length - new Set(rows.map((r) => r.simp)).size) + " graphs listed twice)");
console.log("single characters among them: " + rows.filter((r) => [...r.simp].length === 1).length);
console.log("with a part of speech: " + rows.filter((r) => /^\(/.test(r.def)).length);
if (unknown.size) console.log("!! part-of-speech tags with no abbreviation: "
  + [...unknown].map(([k, v]) => k + " (" + v + ")").join(", "));
console.log(rows.slice(0, 3).map((r) => r.simp + "  " + r.pinyin + "  " + r.def).join("\n"));
