const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const HAN = 'var(--han, "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif)';

const BASE_CSS =
  ".card {\n  text-align: center;\n  font-size: 17px;\n  line-height: 1.6;\n}\n" +
  ".uc-ask {\n  margin-bottom: 14px;\n  font-size: 11px;\n  letter-spacing: 0.14em;\n  text-transform: uppercase;\n  opacity: 0.55;\n}\n" +
  /* The hanzi take the site's own CJK face (--han is Noto Sans SC, already in the stylesheet's single
     @import). The card's body serif renders Chinese in whatever the reader's system serif happens to be,
     usually a Song/Ming face whose strokes flare and taper like brushwork — hard to read at flashcard size.
     A sans gives even, unmodulated strokes. Hanzi are also never bold: a bold face closes up a dense
     character's strokes, which is why the site's own .tr-cn / .hz / .tr-trad all sit at 400. */
  ".uc-simp {\n  font-family: " + HAN + ";\n  font-size: 46px;\n  font-weight: 400;\n  line-height: 1.15;\n}\n" +
  /* the deck's standing rule: a traditional form is always at half strength */
  ".uc-trad {\n  font-family: " + HAN + ";\n  margin-top: 8px;\n  font-size: 34px;\n  font-weight: 400;\n  line-height: 1.25;\n  opacity: 0.5;\n}\n" +
  /* the reading in the site's own vermilion, the same accent the word gets inside an example sentence.
     `.uc-tts` takes `color:inherit`, so the speaker glyph — which is drawn from currentColor — follows it,
     while the pill it sits in stays neutral. The old 0.85 opacity goes: it would only dull the colour. */
  ".uc-pinyin {\n  margin-top: 12px;\n  font-size: 21px;\n  letter-spacing: 0.01em;\n  color: var(--zh, #C8453C);\n}\n" +
  /* Bopomofo sits under the pinyin, quieter and in the CJK face — the marks are CJK codepoints and the body
     serif has no glyphs for them. It is the citation reading, so where the pinyin above shows tone sandhi
     (bu4 -> bu2 in bu ke qi) the two differ by one tone mark; that is how zhuyin is written. */
  ".uc-zhuyin {\n  font-family: " + HAN + ";\n  margin-top: 5px;\n  font-size: 17px;\n  letter-spacing: 0.06em;\n  opacity: 0.72;\n}\n" +
  ".uc-mw {\n  margin-top: 12px;\n  font-size: 15px;\n  line-height: 1.5;\n}\n" +
  ".uc-mwlab {\n  margin-right: 8px;\n  font-size: 9.5px;\n  letter-spacing: 0.14em;\n  text-transform: uppercase;\n  opacity: 0.5;\n}\n" +
  ".uc-mwi + .uc-mwi {\n  margin-left: 12px;\n}\n" +
  ".uc-mwc {\n  font-family: " + HAN + ";\n  font-weight: 400;\n}\n" +
  ".uc-mwt {\n  margin-left: 4px;\n  opacity: 0.5;\n}\n" +
  ".uc-mwp {\n  margin-left: 6px;\n  opacity: 0.75;\n}\n" +
  /* The definitions sit in a field of their own so they read as a block apart from everything round them.
     --paper-2 is the site's own inset-panel paper and is darker than --card in BOTH light and night, which
     is why it is used rather than a fixed grey: a deck's CSS is scoped to the card, so it cannot branch on
     the theme (cssScopeSelector maps `body` to the card itself, so `body.night` matches nothing). Each
     token carries a literal fallback. inline-block keeps it only as wide as its longest line, centred by
     .card's own text-align, with max-width holding a long gloss inside the card. */
  /* A LINE OF ITS OWN, AND ONLY AS WIDE AS ITS CONTENT. `inline-block` gives the second half of that and
     not the first: the definition field, the character breakdown and the examples fold are three of them in
     a row, and on a centred card they share a line and overlap. `width:fit-content` on a block shrink-wraps
     the same way while still taking a line, and `margin-inline:auto` re-centres it. */
  ".uc-field {\n  display: block;\n  width: fit-content;\n  max-width: 100%;\n  margin: 14px auto 0;\n  padding: 11px 15px;\n" +
  "  border: 1px solid var(--rule, rgba(0,0,0,0.12));\n  border-radius: 11px;\n  text-align: left;\n" +
  /* the plain --paper-2 first, then a lighter mix of it for anything that understands color-mix: an
     unsupported value invalidates its own declaration and the line above stands. */
  "  background: var(--paper-2, rgba(0,0,0,0.05));\n" +
  "  background: color-mix(in srgb, var(--paper-2, #EFEDE6) 58%, var(--card, #FFFFFF));\n}\n" +
  ".uc-sense {\n  line-height: 1.6;\n}\n" +
  /* the part of speech, spelled out and set quietly apart from the definition itself */
  ".uc-pos {\n  margin-right: 0.4em;\n  font-size: 0.78em;\n  font-style: italic;\n  color: var(--ink-faint, #6C6A63);\n}\n" +
  /* THE CHARACTER BREAKDOWN IS THE PARTS, NOT THE CHARACTER (on request). Its own reading and meaning are
     already above it — the word, its pinyin and its gloss — so a row restating them is a row read for
     nothing; what the card has nowhere else is what the character is BUILT from. Where the traditional
     form is a different character it takes a row of its own at the traditional hanzi's half strength,
     since simplification usually changed exactly this: 说 is 讠 + 兑 where 說 is 言 + 兑. */
  ".uc-chars {\n  display: block;\n  width: fit-content;\n  max-width: 100%;\n  margin: 14px auto 0;\n  text-align: left;\n}\n" +
  /* the character sits CENTRED against its stack of parts (on request), not on the first one's baseline;
     the parts themselves still share a baseline within their own line */
  ".uc-ch {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 4px 0;\n  font-size: 13.5px;\n}\n" +
  ".uc-ch + .uc-ch {\n  border-top: 1px solid var(--rule, rgba(0,0,0,0.10));\n}\n" +
  /* THE TWO BREAKDOWNS ARE TWO BLOCKS, an empty line apart (on request) — every character of the word in
     simplified, then every character whose traditional form differs, at the traditional hanzi's own half
     strength. It is the order the head of the card already reads in, and it means a word of four
     characters has ONE break in its breakdown rather than four. The gap does the separating, so the first
     traditional row drops the hairline every other row carries. */
  ".uc-chtr {\n  opacity: 0.5;\n}\n" +
  ".uc-ch.uc-chgap {\n  margin-top: 11px;\n  border-top: 0;\n}\n" +
  ".uc-chc {\n  font-family: " + HAN + ";\n  font-weight: 400;\n  font-size: 22px;\n  line-height: 1.1;\n  min-width: 26px;\n}\n" +
  /* ONE PART TO A LINE, listed down the right of the character (on request). Run along a line the parts
     of a four-part character wrap awkwardly and their readings never line up with each other; stacked,
     the glyphs, the readings and the meanings each form a column, so the three can be read down. */
  ".uc-chps {\n  flex: 1 1 auto;\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n" +
  ".uc-pt {\n  display: flex;\n  align-items: baseline;\n  gap: 7px;\n}\n" +
  ".uc-pt b {\n  font-family: " + HAN + ";\n  font-weight: 400;\n  font-size: 16px;\n  min-width: 19px;\n}\n" +
  ".uc-ptp {\n  min-width: 44px;\n}\n" +
  ".uc-pt i {\n  font-style: normal;\n  opacity: 0.6;\n}\n" +
  ".uc-solo {\n  font-style: italic;\n  opacity: 0.6;\n}\n" +
  /* The examples, folded away. <details> is the platform's own disclosure widget and needs no script, which
     is the only kind of fold a deck can have — its CSS is scoped to the card and it may not carry JS. */
  /* the fold is CENTRED; the character breakdown above it stays left, being a list of aligned rows */
  ".uc-ex {\n  display: block;\n  width: fit-content;\n  max-width: 100%;\n  margin: 14px auto 0;\n  text-align: center;\n}\n" +
  ".uc-ex > summary {\n  cursor: pointer;\n  list-style: none;\n  font-size: 11px;\n  letter-spacing: 0.12em;\n  text-transform: uppercase;\n  opacity: 0.6;\n}\n" +
  ".uc-ex > summary::-webkit-details-marker {\n  display: none;\n}\n" +
  /* the character itself, never a \\25BE escape: a deck's CSS has its backslashes stripped on ingest
     (a CSS escape can spell any blocked keyword), so an escape reaches the card as the digits 25BE */
  ".uc-ex > summary::after {\n  content: \" \u25BE\";\n}\n" +
  ".uc-ex[open] > summary::after {\n  content: \" \u25B4\";\n}\n" +
  /* THE SENTENCES SIT IN A FIELD OF THEIR OWN (on request), a shade darker than the card, so the fold
     reads as a block apart from the breakdown above it rather than as more of the same page. --paper-2
     is the site's own inset paper and is darker than --card in every theme, light and dark alike, which
     is why it is used rather than a fixed grey: a deck's CSS is scoped to the card and cannot branch on
     the theme. It is mixed 58% toward the card, which is EXACTLY the definitions field above it (also on
     request) — two panels a few lines apart in two slightly different greys read as a mistake, and the
     plain --paper-2 it used to carry was darker than either. Both keep the unmixed value on the line
     before, for a browser with no color-mix: an unsupported value invalidates its own declaration. */
  ".uc-exs {\n  margin-top: 9px;\n  padding: 11px 14px;\n  border: 1px solid var(--rule, rgba(0,0,0,0.12));\n"
  + "  border-radius: 11px;\n  background: var(--paper-2, rgba(0,0,0,0.05));\n"
  + "  background: color-mix(in srgb, var(--paper-2, #EFEDE6) 58%, var(--card, #FFFFFF));\n}\n" +
  ".uc-exi + .uc-exi {\n  margin-top: 10px;\n  padding-top: 10px;\n  border-top: 1px solid var(--rule, rgba(0,0,0,0.10));\n}\n" +
  /* WHAT SHAPE THIS SENTENCE IS, as a formula of word types — "PRONOUN + NOUN + ADVERB + ADJECTIVE".
     Set as a label rather than as prose, and the term for the word being learnt takes the same vermilion
     the word itself does in the sentence below, so the two line up at a glance. */
  ".uc-exst {\n  margin-bottom: 4px;\n  font-size: 9.5px;\n  font-weight: 600;\n  letter-spacing: 0.09em;\n"
  + "  line-height: 1.45;\n  text-transform: uppercase;\n  color: var(--ink-faint, #6C6A63);\n}\n" +
  ".uc-exst b {\n  font-weight: 600;\n  color: var(--zh, #C8453C);\n}\n" +
  /* the speaker in front of each sentence. It carries NO text of its own — the sentence is beside it and
     naming it twice would only be read twice — so what it says comes from data-say, and wireSpeakControls
     names the control from that too. On a device with no speech engine the site's own rule strips the
     chrome and the empty button disappears, leaving the sentence exactly as it was. */
  ".uc-exsay {\n  margin-right: 7px;\n  font-size: 12px;\n  vertical-align: 0.08em;\n}\n" +
  /* A SPEAK BUTTON IS AN INSET, AND MUST READ AS ONE IN BOTH MODES (on request: after dark it was
     brightening its background rather than darkening it). The site's own .uc-tts fills with --paper-2 and
     outlines in --rule, and after dark that is a fill 7 levels darker than the card inside an outline 14
     levels lighter — so the outline wins and the pill reads as a bright blob. --paper is darker than
     --card in all eight themes in BOTH modes, measured rather than assumed, and taking the outline down to
     --paper-2 leaves an edge that describes the control without shouting. */
  ".uc-tts {\n  background: var(--paper, #F6F5F1);\n  border-color: var(--paper-2, rgba(0,0,0,0.12));\n}\n" +
  ".uc-exz {\n  font-family: " + HAN + ";\n  font-weight: 400;\n  font-size: 18px;\n  line-height: 1.5;\n}\n" +
  /* the word being learnt, picked out in the site's own vermilion rather than underlined, which sat under
     the descenders. NOT bold: the deck's standing rule is that hanzi are never bold, a bold face closing up
     a dense character's strokes. --zh is a theme token and follows the reader's theme; the literal after it
     is the fallback for a card rendered outside one. */
  ".uc-exz b {\n  font-weight: 400;\n  color: var(--zh, #C8453C);\n}\n" +
  ".uc-exe {\n  margin-top: 1px;\n  font-size: 14px;\n  opacity: 0.75;\n}\n" +

  ".uc-sense + .uc-sense {\n  margin-top: 2px;\n}\n" +
  "hr {\n  margin: 18px 0;\n  border: 0;\n  border-top: 1px solid currentColor;\n  opacity: 0.18;\n}\n";
/* The PINYIN is the read-aloud control. data-say carries what it should pronounce — the characters —
   because a Mandarin voice handed the romanisation "bēizi" reads the letters rather than the word. It is
   the same contract the site's own .tr-play buttons use, and cardSpeak honours it on a .uc-tts too. */
const SAY_PINYIN = '<div class="uc-pinyin"><span class="uc-tts" data-say="{{Simplified}}">{{Pinyin}}</span></div>';
const ZHUYIN = '{{#Bopomofo}}<div class="uc-zhuyin">{{Bopomofo}}</div>{{/Bopomofo}}';
const MEASURE = '{{#Measure word}}<div class="uc-mw">{{Measure word}}</div>{{/Measure word}}';
const CHARS = '{{#Characters}}<div class="uc-chars">{{Characters}}</div>{{/Characters}}';
const EXAMPLES = '{{#Examples}}<details class="uc-ex"><summary>In a sentence</summary><div class="uc-exs">{{Examples}}</div></details>{{/Examples}}';
const TRAD = '{{#Traditional}}<div class="uc-trad">{{Traditional}}</div>{{/Traditional}}';

/* ONE NOTE, TWO CARDS — the two study directions as two TEMPLATES of a single type rather than as two
   cards (Aug 2026, once Folio grew reverse cards). Every one of these decks used to write each word out
   twice, once per direction, and the two rows were identical field for field: the same characters, the
   same reading, the same character breakdown and the same three example sentences, which between them are
   nine tenths of a row. Halving that is the visible half of the change and the smaller half.

   WHAT MATTERS IS THAT A WORD IS NOW ONE RECORD. A note edited — a definition corrected, a better example
   found — is corrected in both directions at once, where two rows drift apart with nothing to say so; and
   the deck stops claiming to hold twice as many things to learn as it does, since 3,554 cards over 1,777
   words was always a count of the exercises rather than of the vocabulary. Each direction still keeps a
   SCHEDULE of its own, which is the whole point of a reverse card: recognising 谢谢 is easy long before
   producing it is, and one schedule over both would be paced by whichever is harder.

   The order is deliberate. Card 1 is CHINESE → ENGLISH, the easier direction and the one a reader meets
   first, and it therefore keeps the bare note id; card 2 takes the `~2` suffix. */
const TYPE_ID = "hsk";
const TYPE = {
  id: TYPE_ID, name: "Mandarin vocabulary", speechLang: "zh-CN",
  fields: ["Simplified", "Traditional", "Pinyin", "Bopomofo", "Measure word", "English", "Characters", "Examples"],
  cards: [
    {
      name: "Chinese → English",
      front: '<div class="uc-simp">{{Simplified}}</div>' + TRAD,
      back: "{{FrontSide}}<hr>" + SAY_PINYIN + ZHUYIN + MEASURE +
            '<div class="uc-field">{{English}}</div>' + CHARS + EXAMPLES,
    },
    {
      name: "English → Chinese",
      front: '<div class="uc-ask">Say it in Chinese</div><div class="uc-field">{{English}}</div>',
      back: "{{FrontSide}}<hr>" + '<div class="uc-simp">{{Simplified}}</div>' + TRAD +
            SAY_PINYIN + ZHUYIN + MEASURE + CHARS + EXAMPLES,
    },
  ],
  /* `data-uctpl` is the 1-based template index on the card wrapper — Anki's `.card2` in the shape
     cssScoped can rewrite. It is what lets one stylesheet dress two directions: the English is the ANSWER
     on card 1 and the QUESTION on card 2, and a question is set larger than an answer. */
  css: BASE_CSS +
    ".uc-sense {\n  font-size: 16px;\n}\n" +
    '.card[data-uctpl="2"] .uc-sense {\n  font-size: 18px;\n}\n',
};

/* A word's measure word, where it has one. It is markup rather than a plain string because the
   traditional form has to keep the deck's half-strength rule, and because the label is what stops
   "本 běn" under 书 from reading as a second pronunciation of the word itself. */
function measureHTML(mw) {
  if (!mw || !mw.length) return "";
  return '<span class="uc-mwlab">measure word</span>' + mw.map(m =>
    '<span class="uc-mwi"><span class="uc-mwc">' + esc(m.simp) + "</span>" +
    (m.trad ? '<span class="uc-mwc uc-mwt">' + esc(m.trad) + "</span>" : "") +
    '<span class="uc-mwp">' + esc(m.pinyin) + "</span></span>").join("");
}

/* One row per character: the character, and the parts it is written from, each with its own reading and
   meaning. A character that decomposes to nothing says so rather than showing an empty row — 人, 女, 心,
   又 and 28 others across the three levels are radicals in their own right. */
function charsHTML(chars) {
  if (!chars || !chars.length) return "";
  const parts = (list) => list.length
    ? list.map(p => '<span class="uc-pt"><b>' + esc(p.c) + "</b>" +
        '<span class="uc-ptp">' + esc(p.pinyin || "") + "</span>" +
        (p.meaning ? "<i>" + esc(p.meaning) + "</i>" : "") + "</span>").join("")
    : '<span class="uc-solo">a radical in its own right</span>';
  const row = (ch, list, cls) =>
    '<div class="uc-ch' + cls + '"><span class="uc-chc">' + esc(ch) + "</span>" +
    '<span class="uc-chps">' + parts(list) + "</span></div>";
  // only the characters whose traditional form is a DIFFERENT character are worth a second row
  const differ = chars.filter(c => c.trad);
  return chars.map(c => row(c.c, c.parts || [], "")).join("") +
    differ.map((c, i) => row(c.trad, c.tradParts || [], " uc-chtr" + (i ? "" : " uc-chgap"))).join("");
}

/* The sentences, with the word coloured in each so the eye finds it, the shape of the sentence named above
   it, and a speaker in front of it that reads it out ON A PRESS AND NEVER ON ITS OWN — the site's own rule
   about anything that makes a noise. THE CREDIT IS ON THE DECK'S OWN PAGE rather than in here (on request):
   CC BY asks for attribution in a manner reasonable to the medium, and a line under every one of a thousand
   cards is a line the reader reads a thousand times.

   The formula above each sentence is DERIVED, in extras.js: the sentence is segmented against CC-CEDICT and
   every token looked up in a real part-of-speech table — the HSK syllabus's own column first, then the
   ICTCLAS tags complete-hsk-vocabulary carries — so each term is a fact about a word rather than a reading
   of the sentence. A sentence with one token the table does not know gets NO formula, since a guessed term
   would be indistinguishable from a known one. It is also what the three examples are chosen to differ on,
   so the label is the claim and the selection is what makes it true. */
function examplesHTML(word, ex) {
  if (!ex || !ex.length) return "";
  const mark = (zh) => esc(zh).split(esc(word)).join("<b>" + esc(word) + "</b>");
  return ex.map(e =>
    '<div class="uc-exi">' +
    (e.st && e.st.length ? '<div class="uc-exst">' + e.st.map((t, i) =>
        i === e.si ? "<b>" + esc(t) + "</b>" : esc(t)).join(" + ") + "</div>" : "") +
    '<div class="uc-exz"><span class="uc-tts uc-exsay" data-say="' + esc(e.zh) + '"></span>' + mark(e.zh) + "</div>" +
    '<div class="uc-exe">' + esc(e.en) + "</div></div>").join("");
}

/* THE PART OF SPEECH IS SPELLED OUT, and it is expanded here rather than in the builders so both families
   of deck get it from one place. The syllabus writes it as an abbreviation in brackets at the head of the
   definition — "(n.) father", "(n./v.) interests; hobbies" — and the card writes "noun", small and italic
   and grey, with the brackets gone. Measured over all 5,400 official rows: fifteen distinct abbreviations
   and no row without one. An abbreviation not in the table is LEFT AS IT WAS and reported, rather than
   guessed at or silently dropped. */
const POS = {
  "n.": "noun", "v.": "verb", "adj.": "adjective", "adv.": "adverb", "mw.": "measure word",
  "pron.": "pronoun", "num.": "numeral", "prep.": "preposition", "conj.": "conjunction",
  "part.": "particle", "suf.": "suffix", "pref.": "prefix", "phr.": "phrase", "interj.": "interjection",
  "onom.": "onomatopoeia", "idiom.": "idiom",
};
const posSeen = new Set();
function englishHTML(senses) {
  return senses.map(s => {
    // "(n./v.) …" at the head, or after a reading's "pinyin — " on a word with two of them
    const m = /^((?:[^()]*—\s*)?)\(([^)]+)\)\s*/.exec(s);
    if (!m) return '<div class="uc-sense">' + esc(s) + "</div>";
    const parts = m[2].split("/").map(x => x.trim()).filter(Boolean);
    /* only something SHAPED like an abbreviation is a candidate. The HSK 2.0 column opens a good many
       definitions with an ordinary parenthetical instead — "(indicates comparison)", "(chicken)" — and
       those are the definition and must be left exactly as written. */
    if (!parts.every(x => /^[a-z]{1,6}\.$/.test(x))) return '<div class="uc-sense">' + esc(s) + "</div>";
    if (!parts.every(x => POS[x])) { parts.forEach(x => { if (!POS[x]) posSeen.add(x); }); return '<div class="uc-sense">' + esc(s) + "</div>"; }
    return '<div class="uc-sense">' + esc(m[1]) + '<i class="uc-pos">' + esc(parts.map(x => POS[x]).join(" / ")) +
      "</i>" + esc(s.slice(m[0].length)) + "</div>";
  }).join("");
}
process.on("exit", () => { if (posSeen.size) console.log("  !! part-of-speech abbreviations with no full form: " + [...posSeen].join(" ")); });
/* THE SAME BLOCK WITHOUT THE PART-OF-SPEECH PASS, for the two decks whose definitions are CC-DICT's rather
   than a syllabus's. That pass expands "(n.)" into "noun" and REPORTS an abbreviation it does not know, so
   pointing it at a dictionary gloss reports "coll.", "lit." and "fig." on every run — which is a warning
   that cries wolf, and the whole value of that warning is that it fires only when a real abbreviation has
   gone unhandled. */
function plainSensesHTML(senses) {
  return senses.map((s) => '<div class="uc-sense">' + esc(s) + "</div>").join("");
}

module.exports = { HAN, TYPE, TYPE_ID, esc, measureHTML, charsHTML, examplesHTML, englishHTML, plainSensesHTML };
