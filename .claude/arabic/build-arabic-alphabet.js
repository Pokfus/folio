#!/usr/bin/env node
"use strict";
/*
  build-arabic-alphabet.js — writes decks/Arabic-Alphabet.folio-deck.json (Nov 2026, the Arabic beginner pass
  — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/arabic/build-arabic-alphabet.js [--check]

  IT READS NO LIVE SOURCE: the table `arabic-alphabet.json` (written by alphabet_table.py from three Wikipedia
  pages at pinned revisions, every sound, comparison and rule a quotation) and the shipped Arabic A1 deck. It
  replaces `alphabet.py`, which was hand-written with no sources and carded the 28 letters and ء ة ى only.

  WHAT A NOTE IS. A letter or a sign (card type `ar-abc`) is one note with two cards: see it and recall its
  name and sound, or see the name and sound and recall it. A rule (card type `ar-rule`) is one card: a question
  over a spelling, and the page's own sentence as the answer. 31 letters, 16 signs, 7 rules.

  THE EXAMPLE WORDS ARE ARABIC A1 CARDS, chosen by the `pick` a row carries (a pattern over the vowelled
  headword and the kinds of word allowed): the first two matches in the order A1 is dealt, skipping a word an
  earlier row has used while another will do — so a row's examples are words the reader meets early, each
  with A1's own romanisation, meaning and a speaker. Re-run this after A1's order or headwords change.

  THE IDS ARE PINNED (arabic-ids.json, the `arabc` rows): a letter keeps the number it shipped with — its key
  is the letter — and a new row takes the next free number, once. The ORDER the deck is dealt in is the
  table's, which is not the order of the numbers: the three short vowels and the sukūn come before the
  letters, because every example word is printed with them.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const OUT = path.join(DIR, "Arabic-Alphabet.folio-deck.json"), IDS_FILE = path.join(HERE, "arabic-ids.json");
const CHECK = process.argv.includes("--check");
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const T = JSON.parse(fs.readFileSync(path.join(HERE, "arabic-alphabet.json"), "utf8"));
const A1 = JSON.parse(fs.readFileSync(path.join(DIR, "Arabic-A1.folio-deck.json"), "utf8"));
if (!(A1.meta.types && A1.meta.types.arabic) || A1.meta.id !== "arabica1") fail("decks/Arabic-A1.folio-deck.json is not the Arabic A1 deck");
const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8")), PIN_BEFORE = JSON.stringify(PIN);
const ID = "arabc", STAMP = "2026-11-09T00:00:00.000Z", COLOR = A1.meta.color;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => esc(s).replace(/"/g, "&quot;");
const unesc = (s) => String(s).replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const AR = (s, cls) => "<span" + (cls ? ' class="' + cls + '"' : "") + ' dir="rtl" lang="ar">' + esc(s) + "</span>";
const SRC = { ipa: "Help:IPA/Arabic", abc: "Arabic alphabet", sun: "Sun and moon letters" };

/* ---------- the example words: Arabic A1, in the order it is dealt ---------- */
const POOL = A1.cards.map((c) => ({
  word: c.fields.Word, roman: unesc(c.fields.Roman),
  pos: (/class="uc-pos">([^<]*)</.exec(c.fields.English) || [])[1] || "",
  en: unesc((/<(?:div class="uc-gl"|li)>([\s\S]*?)<\/(?:div|li)>/.exec(c.fields.English) || [])[1] || ""),
}));
const used = new Set();
function pickOne(p, taken) {
  if (!p) return null;
  const re = new RegExp(p.re, "u");
  const ok = (w) => re.test(w.word) && !/\s/.test(w.word) && (p.single || !/^ال|^اَل/.test(w.word))
    && (!p.pos || p.pos.includes(w.pos)) && !taken.includes(w) && w.word.replace(/[ً-ْٰ]/g, "").length <= 7;
  return POOL.find((w) => ok(w) && !used.has(w.word)) || POOL.find(ok) || null;
}
function examples(row) {
  const got = [];
  for (const p of row.picks || (row.pick ? [row.pick, row.pick] : [])) { const w = pickOne(p, got); if (w) { got.push(w); used.add(w.word); } }
  return got.map((w) => '<div class="uc-row">' + AR(w.word, "uc-ex") + '<span class="uc-tts uc-exsay" data-say="' + attr(w.word) + '"></span>'
    + '<span class="uc-rom">' + esc(w.roman) + '</span><span class="uc-exe">' + esc(w.en) + "</span></div>").join("");
}
// an Arabic word inside a quoted English sentence is its own right-to-left run (a list of letters, one run)
const AR_RUN = /[\u0621-\u0652\u0670\u0671]+(?:[ ,،]+[\u0621-\u0652\u0670\u0671]+)*/g;
const note = (n) => '<div class="uc-note">' + (n.html || esc(n.text).replace(AR_RUN, (m) => '<span dir="rtl" lang="ar">' + m + "</span>")) + "</div>";
function shapes(s) {
  if (!s || !s.length) return "";
  const cells = [["alone", s[0]], ["start", s[1]], ["middle", s[2]], ["end", s[3]]].filter((x) => x[1]);
  // right to left, as the script reads: the flex row is laid out rtl
  return '<div class="uc-shapes" dir="rtl">' + cells.map(([l, f]) =>
    '<span class="uc-sh"><span class="uc-shf" lang="ar">' + esc(f) + '</span><span class="uc-shl" dir="ltr">' + l + "</span></span>").join("") + "</div>";
}

/* ---------- the notes ---------- */
const pin = PIN[ID] || fail("arabic-ids.json has no rows for " + ID), usedNums = new Set(Object.values(pin).concat(Object.values((PIN._retired || {})[ID] || {})));
const newKeys = [];
const cards = T.rows.map((r) => {
  if (!(r.key in pin)) { const n = Math.max(0, ...usedNums) + 1; pin[r.key] = n; usedNums.add(n); newKeys.push(r.key + " → " + n); }
  const id = "u_" + ID + "_" + pin[r.key];
  if (r.kind === "rule") {
    return { sub: "", key: r.key, id, type: "ar-rule", fields: {
      Shows: esc(r.show), Ask: esc(r.ask),
      Says: r.says.map(note).join("") + (r.letters ? '<div class="uc-set" dir="rtl" lang="ar">' + esc(r.letters.join(" ")) + "</div>" : ""),
      Example: examples(r) } };
  }
  const value = r.name ? r.roman + " — " + r.value : r.value;
  const sound = (r.ipa && r.ipa !== "∅" && r.ipa !== "ː" ? '<span class="uc-ipa">/' + esc(r.ipa) + "/</span>" : "")
    + (r.like ? ' <span class="uc-like">' + r.like + "</span>" : "") || esc(r.value);
  return { sub: "", key: r.key, id, type: "ar-abc", fields: {
    Letter: esc(r.show), Kind: r.kind === "letter" ? "Arabic letter" : "Arabic sign", Shapes: shapes(r.shapes),
    Named: r.name ? AR(r.name) + '<span class="uc-tts uc-say" data-say="' + attr(r.name) + '"></span> <span class="uc-rom">' + esc(value) + "</span>"
      : '<span class="uc-rom">' + esc(value) + "</span>",
    Value: esc(value), Sound: sound.trim(), Notes: (r.notes || []).map(note).join(""), Example: examples(r) } };
});
for (const k of Object.keys(pin)) if (!T.rows.some((r) => r.key === k)) fail("the pinned row “" + k + "” (" + pin[k] + ") is not in the table — a row is never dropped; move it to _retired by hand if it must go");
const count = (k) => T.rows.filter((r) => r.kind === k).length;
const nL = count("letter"), nS = count("sign"), nR = count("rule"), nCards = 2 * (nL + nS) + nR;

/* ---------- the two card types ---------- */
const FIELD = '<div class="uc-field"><div class="uc-pos">name and value</div><div class="uc-gl">{{Named}}</div><div class="uc-pos uc-gap">sound</div>'
  + '<div class="uc-gl">{{Sound}}</div>{{#Notes}}<div class="uc-notes">{{Notes}}</div>{{/Notes}}{{#Example}}<div class="uc-pos uc-gap">as in</div>'
  + '<div class="uc-rows">{{Example}}</div>{{/Example}}</div>';
const LETTER = '<div class="uc-letter" dir="rtl" lang="ar">{{Letter}}</div>';
const TYPES = {
  "ar-abc": { id: "ar-abc", name: "Arabic letter or sign", speechLang: "ar",
    fields: ["Letter", "Kind", "Shapes", "Named", "Value", "Sound", "Notes", "Example"],
    cards: [
      { name: "Letter → sound", front: '<div class="uc-ask">{{Kind}}</div>' + LETTER,
        back: "{{FrontSide}}{{#Shapes}}{{Shapes}}{{/Shapes}}<hr>" + FIELD },
      { name: "Sound → letter",
        front: '<div class="uc-ask">Which letter or sign is this?</div><div class="uc-field"><div class="uc-pos">name and value</div>'
          + '<div class="uc-gl"><span class="uc-rom">{{Value}}</span></div><div class="uc-pos uc-gap">sound</div><div class="uc-gl">{{Sound}}</div></div>',
        back: "{{FrontSide}}<hr>" + LETTER + "{{#Shapes}}{{Shapes}}{{/Shapes}}" + FIELD },
    ] },
  "ar-rule": { id: "ar-rule", name: "Arabic spelling rule", speechLang: "ar", fields: ["Shows", "Ask", "Says", "Example"],
    cards: [
      { name: "Spelling → rule", front: '<div class="uc-ask">How Arabic is written</div>' + '<div class="uc-letter uc-rule" dir="rtl" lang="ar">{{Shows}}</div><div class="uc-q">{{Ask}}</div>',
        back: '{{FrontSide}}<hr><div class="uc-field"><div class="uc-notes uc-says">{{Says}}</div>{{#Example}}<div class="uc-pos uc-gap">as in</div><div class="uc-rows">{{Example}}</div>{{/Example}}</div>' },
    ] },
};
const CSS = fs.readFileSync(path.join(HERE, "alphabet.css"), "utf8");
for (const k of Object.keys(TYPES)) TYPES[k].css = CSS;

const src = (k) => "Wikipedia, ‘" + T.sources[k].title + "’, revision " + T.sources[k].revision;
const meta = {
  id: ID,
  title: "Arabic Alphabet",
  subtitle: nL + " letters, " + nS + " signs and " + nR + " rules · " + nCards + " cards",
  desc: "How Arabic is written and read, before the first word: the first deck of the Arabic collection. " + (nL + nS + nR) + " notes — the 28 letters "
    + "with hamza (ء), tāʔ marbūṭa (ة) and alif maqṣūra (ى); " + nS + " signs, which are what a vowelled word carries beyond its letters (the three short "
    + "vowels, the sukūn, the shadda, the three tanwīn endings, the long vowels and the two diphthongs, the madda, the dagger alif and the lām-alif); "
    + "and " + nR + " rules (the direction of the script, the six letters that join on one side only, the hamza's carriers, the article before a moon letter and "
    + "before a sun letter, the hamzat al-waṣl, and why a text printed without vowels can be read more than one way). A letter or a sign is two cards, each "
    + "with its own schedule: see it and recall its name and sound, or see the name and sound and recall it. A rule is one card: a question over a "
    + "spelling. THE ORDER: the direction of the script, then the three short vowels and the sukūn, because every example word from there on is printed with "
    + "them; then the letters in their standard order; then everything else, the rules of the article last. WHY THE SIGNS ARE HERE: every headword of the "
    + "level decks is printed with its vowels, and of Arabic A1's first 500 words 453 carry a fatḥa, 199 a sukūn, 183 a kasra, 74 a ḍamma, 64 a shadda and "
    + "20 a tanwīn, 126 spell a long ā and 74 write a hamza on a carrier. THE PACE, since a deck cannot set it: at the default of ten new cards a day this "
    + "deck takes " + Math.ceil(nCards / 10) + " days. WHERE IT COMES FROM: nothing on a card was written for this deck. Each sound is the IPA value and the "
    + "‘English approximation’ of " + src("ipa") + " — where that page says a sound has no equivalent in English (ع, ط), the card says so in its words; a "
    + "letter's four shapes, the rules of joining, the hamza, the vowel signs, nunation, gemination, the sukūn and the dagger alif are sentences and table "
    + "cells of " + src("abc") + "; the rule of the article and its two lists of letters are " + src("sun") + ". A quoted sentence keeps Wikipedia's own "
    + "romanisation (fatḥah, ʾalif); a name's own romanisation is in the scheme the level decks use (ʔ for hamza, ʕ for ʿayn), and the Arabic names are "
    + "vowelled as the English Wiktionary vowels them (kaikki.org). Every example word is a card of Arabic A1, the first that shows the letter or sign in "
    + "the order A1 is dealt, with A1's romanisation and meaning and a speaker beside it. Text: CC BY-SA 4.0.",
  author: "", language: "en", color: COLOR, tags: ["arabic", "alphabet", "العربية"], glossMode: "site",
  types: TYPES, version: 1, createdAt: STAMP, updatedAt: STAMP, forkedFrom: null,
};
const out = JSON.stringify({ folioDeck: 1, exportedAt: STAMP, meta, cards, gloss: {} });
const pinChanged = JSON.stringify(PIN) !== PIN_BEFORE;
const same = fs.existsSync(OUT) && fs.readFileSync(OUT, "utf8") === out;
const noEx = T.rows.filter((r, i) => (r.pick || r.picks) && !cards[i].fields.Example).map((r) => r.key);
if (CHECK) {
  if (!same || pinChanged) { console.log("FAIL  Arabic-Alphabet.folio-deck.json is not what its table and Arabic A1 give — run node .claude/arabic/build-arabic-alphabet.js"); process.exit(1); }
  console.log("the Arabic Alphabet deck is what its table and Arabic A1 give: " + cards.length + " notes, " + nCards + " cards");
} else {
  if (!same) fs.writeFileSync(OUT, out);
  if (pinChanged) fs.writeFileSync(IDS_FILE, "{\n" + Object.keys(PIN).map((k) => JSON.stringify(k) + ":" + JSON.stringify(PIN[k])).join(",\n") + "\n}\n");
  console.log((same ? "unchanged: " : "wrote ") + "Arabic-Alphabet.folio-deck.json: " + cards.length + " notes (" + nL + " letters, " + nS + " signs, " + nR + " rules), " + nCards + " cards"
    + (newKeys.length ? "\n  pinned: " + newKeys.join(", ") : "") + (noEx.length ? "\n  no A1 word shows: " + noEx.join(", ") : ""));
}
