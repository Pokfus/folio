/* Read a TORFL Russian deck the way a reader would, over the FILE: every card, every field.

     node .claude/torfl/check-torfl.js [a1|a2|b1|b2|c1|c2|alphabet]

   Zero dependencies; no browser.  `check-decks.js` skips the card-level checks for a deck that is
   not Mandarin, so everything Russian this deck is FOR is unchecked by anything until here.  Every
   fault it looks for is quiet — a card with one stray Latin letter reads as Russian, a stress mark
   on a consonant renders as a speck, and a sentence with no bold word looks like a sentence:

     · THE STRESS MARK IS ON A VOWEL, ONCE, AND NEVER IN WHAT IS SPOKEN.  U+0301 after anything
       but а е и о у ы э ю я is a mark Wiktionary never meant; two in one word is two stresses;
       and `Word` (what the speaker reads, and what the next level's exclusion reads) carries none.
     · NO LATIN LETTER IN A RUSSIAN FIELD.  `с`, `о`, `р`, `а`, `е` have Latin twins that look
       identical; one in a headword makes a word no search and no exclusion will ever match.
     · EVERY NOTE TEACHES A WORD NO OTHER NOTE DOES, at this level and below it.
     · EVERY ENGLISH SIDE IS UNIQUE, so the English → Russian card has one answer.
     · EVERY EXAMPLE SHOWS ITS WORD — at least one bold run in each sentence.
     · THE DESCRIPTION'S NUMBERS ARE THE DECK'S.  */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..", "..");
const LEVEL = (process.argv[2] || "a1").toLowerCase();
const BANDS = ["a1", "a2", "b1", "b2", "c1", "c2"];
const FILE = LEVEL === "alphabet" ? "Russian-Alphabet.folio-deck.json"
  : "TORFL-" + LEVEL.toUpperCase() + "-Russian.folio-deck.json";
let fails = 0, checks = 0;
const ok = (c, m, extra) => {
  checks++;
  if (!c) { fails++; console.log("   ✗ " + m + (extra ? "   " + extra : "")); }
  else console.log("   ✓ " + m);
};
const text = (h) => String(h || "").replace(/<[^>]*>/g, " ").replace(/&[a-z#0-9]+;/gi, " ");
const deck = JSON.parse(fs.readFileSync(path.join(ROOT, "decks", FILE), "utf8"));
const cards = deck.cards;
const type = Object.values(deck.meta.types)[0];
console.log(FILE + ": " + cards.length + " notes");

ok(deck.folioDeck === 1 && type.cards.length === 2, "one note type with two card templates");
ok(type.speechLang === "ru-RU", "speech language is ru-RU");
ok(cards.every((c, i) => c.id === "u_" + deck.meta.id + "_" + (i + 1)), "card ids are sequential");
ok(cards.every((c) => type.fields.every((f) => f in c.fields)), "every note has every field");

const RU_FIELDS = LEVEL === "alphabet" ? ["Letter", "Name", "Word"] : ["Russian", "Word"];
const latin = cards.filter((c) => RU_FIELDS.some((f) => /[A-Za-z]/.test(text(c.fields[f]))));
ok(!latin.length, "no Latin letter in a Russian field", latin.slice(0, 5).map((c) => c.fields.Word).join(", "));

const badMark = [], twice = [], spoken = [];
for (const c of cards) {
  const all = Object.values(c.fields).map(text).join(" ");
  for (const m of all.matchAll(/(.)́/g)) if (!/[аеиоуыэюяАЕИОУЫЭЮЯ]/.test(m[1])) badMark.push(c.fields.Word);
  // a hyphenated compound stresses each half (`ко́е-что́`), so a half is the unit
  for (const w of text(c.fields.Russian || c.fields.Example).split(/[\s\/,\-]+/))
    if ((w.match(/́/g) || []).length > 1) twice.push(w);
  if (/[́̀]/.test(c.fields.Word)) spoken.push(c.fields.Word);
  for (const m of (c.fields.Examples || "").matchAll(/data-say="([^"]*)"/g))
    if (/[́̀]/.test(m[1])) spoken.push(m[1]);
}
ok(!badMark.length, "every stress mark follows a vowel", badMark.slice(0, 5).join(", "));
ok(!twice.length, "no headword carries two stress marks", twice.slice(0, 5).join(", "));
ok(!spoken.length, "nothing sent to speech carries a stress mark", spoken.slice(0, 5).join(", "));

const fold = (s) => s.normalize("NFD").replace(/[́̀]/g, "").normalize("NFC").toLowerCase().replace(/ё/g, "е");
const seen = new Map(), dup = [];
for (const c of cards) for (const w of c.fields.Word.split(/\s*,\s*/)) {
  const k = fold(w);
  if (seen.has(k)) dup.push(w); else seen.set(k, c.id);
}
ok(!dup.length, "no word is taught by two notes", dup.slice(0, 8).join(", "));

if (BANDS.includes(LEVEL)) {
  const below = new Set();
  for (const b of BANDS.slice(0, BANDS.indexOf(LEVEL))) {
    const p = path.join(ROOT, "decks", "TORFL-" + b.toUpperCase() + "-Russian.folio-deck.json");
    for (const c of JSON.parse(fs.readFileSync(p, "utf8")).cards)
      for (const w of c.fields.Word.split(/\s*,\s*/)) below.add(fold(w));
  }
  const again = [...seen.keys()].filter((k) => below.has(k));
  ok(!again.length, "no word a lower level teaches", again.slice(0, 8).join(", "));

  const eng = new Map(), same = [];
  for (const c of cards) { if (eng.has(c.fields.English)) same.push(c.fields.Word); eng.set(c.fields.English, 1); }
  ok(!same.length, "every English side is unique", same.slice(0, 5).join(", "));

  const sents = cards.flatMap((c) => (c.fields.Examples.match(/<div class="uc-exz">[\s\S]*?<\/div>/g) || []).map((s) => [c.fields.Word, s]));
  const unbold = sents.filter(([, s]) => !/<b>/.test(s));
  ok(!unbold.length, "every example sentence shows its word in bold", unbold.slice(0, 3).map((x) => x[0]).join(", "));
  const ex3 = cards.filter((c) => (c.fields.Examples.match(/uc-exi/g) || []).length === 3).length;
  ok(deck.meta.desc.includes(cards.length + " words"), "the description states the deck's own size");
  console.log("   · three sentences: " + ex3 + " of " + cards.length);
  const nouns = cards.filter((c) => /uc-pos">noun/.test(c.fields.English));
  const noGen = nouns.filter((c) => !/indeclinable|plural only/.test(c.fields.English) && !/>genitive</.test(c.fields.Forms));
  ok(!noGen.length, "every declinable noun shows its genitive", noGen.slice(0, 5).map((c) => c.fields.Word).join(", "));
  const pairs = cards.filter((c) => /imperfective \/ perfective/.test(c.fields.English));
  ok(pairs.every((c) => c.fields.Word.split(",").length === 2), "every aspect pair names two verbs");
  console.log("   · aspect pairs: " + pairs.length + ", nouns: " + nouns.length);
} else {
  ok(cards.length === 33, "the alphabet has 33 letters");
}
console.log("\n" + (checks - fails) + " passed, " + fails + " failed");
process.exit(fails ? 1 : 0);
