# The Mongolian language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Mongolian deck in `decks/`.** Asked for on
2026-11-16: "Add a Mongolian language collection." `docs/lang-decks.md` is the record of how the earlier sets
were built, and every rule there applies here unless this file says otherwise. The owner was not asked: the
Amharic and Yoruba owners' answers were taken, the sources being as thin (§2).

**STATUS (2026-11-16): the alphabet, A1 and A2 are built** (`.claude/mongolian/`, §6–§7). B1 and a phrases
deck are the next phases (§5).

## 1. The decisions (taken from the Amharic, Yoruba, Russian and Ukrainian sets)

1. **Levels: CEFR A1–B1, at 500 / 750 / 1,000 notes.** Each level is a hand-written topic inventory
   (`inventory.py`) scoped to the CEFR global descriptor for its band, topped up with the commonest remaining
   words of the Mongolian Wikipedia; the description says so. No B2 or C1: English Wiktionary holds about
   3,100 Cyrillic Mongolian lemmas.
2. **Khalkha Mongolian in the Cyrillic alphabet**, as written in Mongolia. Wiktionary's entries under the
   traditional Mongolian script (used in Inner Mongolia) are not read, and the script is not shown on a card:
   it is written vertically and few devices render it.
3. **No romanisation** on a level card (the Russian and Ukrainian precedent): Mongolian Cyrillic is read letter
   by letter, and the alphabet deck, sorted first by `levelRank`'s "Alphabet" rule, teaches the letters.
4. **No hand glosses** (the Zulu, Amharic and Yoruba rule): a word Wiktionary lacks is reported and dropped.
5. **No speaker button** (the Hausa rule): few devices carry a Mongolian voice. `speechLang: 'mn-MN'` stays.
   `check-mongolian.js` fails on a speaker button.

| deck | file | notes |
|---|---|---|
| Mongolian Alphabet — built | `Mongolian-Alphabet.folio-deck.json` | 36 |
| Mongolian A1 Beginner — built | `Mongolian-A1.folio-deck.json` | 500 |
| Mongolian A2 Elementary — built | `Mongolian-A2.folio-deck.json` | 750 |
| Mongolian B1 Intermediate | `Mongolian-B1.folio-deck.json` | 1,000 |
| Mongolian Phrases and Expressions | `Mongolian-Phrases-and-Expressions.folio-deck.json` | — |

## 2. Sources and licences — and what is missing

| what | source | licence |
|---|---|---|
| meanings, forms, other spellings | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Mongolian.jsonl`, 6,712 entries, 6,342 in Cyrillic; 3,116 lemmas and 1,709 pointer pages kept) | CC BY-SA 4.0 |
| frequency | the Mongolian Wikipedia, dump of 2026-11-01 (pinned; md5 `c3811e03…`), the 14,876 articles of 150 words or more | CC BY-SA 4.0 |
| example sentences | Wiktionary's usage examples (about 560, never its dated quotations), then Tatoeba's `mon` exports | CC BY-SA 4.0; CC BY 2.0 FR |
| alphabet: names, IPA, romanisation | Wikipedia's "Mongolian Cyrillic alphabet", revision 1380007835 (2026-10-13), its table (IPA after Svantesson et al. 2005; romanisation MNS 5217:2012) | CC BY-SA 4.0 |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| speakers (`LANGS`) | 5.0 million: Wikipedia's infobox (Ethnologue 28th ed., 5.05 million, 2020–2022), read 2026-11-16; no second-language figure, so `total` is the same | — |

**WHAT IS MISSING, measured on 2026-11-16:**
- **No subtitle frequency list** (hermitdave/FrequencyWords has no Mongolian, 404), and **Tatoeba has 2,801
  Mongolian sentences, 2,564 of them with an English translation** — enough for examples, too few to count. So the frequency is
  the Mongolian Wikipedia's (the Amharic arrangement), which ranks the encyclopaedia's words high.
- **No graded learner's word list was found published under an open licence**, so the levels are assembled.
- **Wiktionary lacks some of A1's common words**: та нар "you (pl.)", тэдгээр, аль, хэчнээн, үд, удахгүй,
  элсэн чихэр, ундаа, амттай, зарах, хямд, гал тогоо, угаалгын өрөө, урд, доор, ойр, сэрүүн, саарал, ягаан,
  хичээл, ажиллах, дуусах, дуртай, буцах, удаан, хялбар, хэцүү, үзэсгэлэнтэй, ядуу, зөв, гэхдээ, эсвэл,
  тэгээд, хэрэв. `inventory.py` lists them; none is glossed by hand. дугуй is filed only as "circle".
- **Wiktionary prints no Cyrillic verb conjugation** (16 verbs carry a table, all in the traditional script)
  and **a declension table for 599 of 4,481 nouns**. The card shows only what Wiktionary prints.

## 3. The card

One note, two templates (Mongolian → English, English → Mongolian). Fields: `Mongolian` (the headword),
`Word` (the same, for the check and the next level's de-duplication), `English` (meanings by part of speech,
up to three entries of three glosses), `Forms`, `Examples` (up to three sentences, the word in bold). The CSS is
`.claude/mongolian/card.css` (Amharic's). **Forms** are every one printed by Wiktionary, never composed: a
noun's plural, genitive ("of …"), dative-locative ("in, at …") and ablative ("from …") from its declension
table; a verb's causative and passive where its headword line names them; other spellings.

## 4. What Mongolian needs that no earlier set did — the findings

- **FORM-OF PAGES THAT ARE NOT TAGGED AS SUCH.** Wiktionary files many inflected forms as pages of their own
  (байна "durative tense in -на (-na) of байх", байсан "past participle in -сан of байх", байшингийн
  "genitive singular of байшин"), and only some carry the form-of tag. `extract.GRAMMAR` reads a gloss that
  names a grammatical form "of" a Cyrillic word as a POINTER: the sense is dropped, its count goes to the word
  it names, and an entry with no other sense is no lemma.
- **THE LEMMA FREQUENCY ADDS EVERY LISTED FORM** — the headword, its declension table, its plural, its other
  spellings and every pointer page that names it — and a form no lemma lists is peeled (`mn.stems`: the case,
  number, possessive, tense and converb endings in every vowel-harmony spelling, up to two layers) to a form
  some lemma lists or to a VERB'S STEM (`mn.verb_stem`: явах → яв, идэх → ид). 55 % of the Wikipedia's counted
  forms reach a lemma. A table cell that does not begin as its headword does (the directive's "руу", the
  ordinal's "дахь" on симфони's table) is a stray of the table's layout and not counted: it made "symphony"
  the 25th word.
- **ARTICLES UNDER 150 WORDS ARE NOT READ** (the Yoruba rule): 17,360 of the Wikipedia's 32,236 articles.
- **EXAMPLES ARE MATCHED STRICTLY** (`examples.token_hits`): a token is the word's when it is a listed form, or
  the headword with ONE noun ending, or the verb's stem with ONE verb ending — never two (шилдэг "best" peeled
  twice is шил "glass"), and never when the token is itself another lemma (эмээ "grandmother" is not эм +
  -ээ). Tatoeba's Том is Tom, not том "big" (`NAMES`), and a sentence Tatoeba holds twice is used once.
- **A SET'S ORDER VARIES BY RUN**: the shared-form split iterates its claimants sorted, so a re-run is
  byte-identical under any `PYTHONHASHSEED` (it was not, by a float's last digit, before).
- **THE FILL'S EXCLUSIONS** (`select.EXCLUDE`, each with its reason): words whose count is another word peeled
  (нийх "to blow one's nose" from нийслэл, тул "taimen" from тулд, хув "amber" from хувь, хур), participles and
  genitives of taught words (гэдэг, ирсэн, үүний, дэлхийн, үндэсний), хүрээлэн (glossed "garden"; its count is
  "institute"), хэмээх (the formal "to say"), зүй ("-logy"), онгоц (glossed "trough" first). A lemma whose
  every ordinary gloss is capitalised (a people, a language) is not dealt by the fill.
- **WEAK SENSES** (`extract.WEAK`): rare, archaic, Inner Mongolian (China), Buryat and Kalmyk senses, an
  onomatopoeia's homograph (хүн "the sound of ringing a hollow object") and "only used in …" senses are shown
  only after a word's ordinary ones, and a lemma of weak senses alone is never dealt by the fill.
- **SMALL CORRECTIONS** in `build_deck.py`: `LEAD` (one of Wiktionary's own glosses moved to the front:
  баруун "right", мөнгө "money", эм "medicine", даваа "Monday", уул "mountain", орших, тоо, тухай).

**Known, left.** The fill is the encyclopaedia's: government, history and administration (улс, засаг, аймаг,
сум, хаан, цэрэг). Wiktionary's glosses are long and sometimes odd (үргэлж "often", алба's plural "албд"), and
they are shown as Wiktionary prints them. A quarter of the cards have no sentence.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 (done), then B1, one level per session: write the
level's inventory into `inventory.py` and its `SCOPE` into `mongolian_level.py`; read the ranking for new
exclusions; read every card. **Phase 3** — the phrases deck. A level must leave the levels below it
byte-identical.

## 6. As built (2026-11-16): the alphabet and A1

`python3 .claude/mongolian/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `wikitext.py` →
`extract.py` → `select.py` → `examples.py` → `build_deck.py`, caching in `.claude/mongolian-cache/`
(gitignored, ~190 MB). `python3 .claude/mongolian/alphabet.py` writes the alphabet deck.
`node .claude/mongolian/check-mongolian.js` is the check. **A re-run is byte-identical** (verified for both
decks, from an empty lexicon and counts, under two hash seeds).

A1: 500 notes / 1,000 cards, 335 from the inventory (20 topics) and 165 by frequency; sentences for 373, forms
for 137. The alphabet: 36 notes — the 35 letters in order, each with its name, its sound in English words, the
IPA and MNS romanisation read from the pinned table, and an A1 word (for ы, a form an A1 card shows, улсын; for
ъ and щ, Wiktionary entries, авъяас and борщ), then the long vowel. The table's row 1 types a Cyrillic а in its
romanisation columns; it is read as the Latin a. Every sound side is unique (asserted).

The shelf's hue is measured: `#3C7676`, a muted teal, swept against the 79 hues on the page with the magenta
band's standing rejection and the greens left out: 13.9 from its nearest neighbours (Economics, France), against a
tightest existing pair of 4.0; 5.2:1 against white.

## 7. As built (2026-11-16): A2

`python3 .claude/mongolian/run.py --level a2`. 750 notes / 1,500 cards: 153 from the inventory (`inventory.A2`, 13
topics scoped to the A2 descriptor), 597 by frequency; sentences for 259, forms for 160. **A re-run is
byte-identical, and A1 and the alphabet still rebuild byte-identical.**

- **THE INVENTORY IS SMALL because Wiktionary is**: of about 260 A2 words looked up, about 45 are missing (three of
  the twelve months — July, November, December —, цүнх "bag", сувилагч "nurse", гэрлэх "to marry", эрүүл "healthy",
  авчрах "to bring", хадгалах "to keep", гоё, тэнэг, амархан, хүчтэй …; `inventory.py` names them), so nine months
  are taught and the frequency fill carries most of the level.
- **MORE EXCLUSIONS** (`select.EXCLUDE`, "Read off the A2 ranking"): words whose count is another word peeled (сур
  from сурах, авс from авсан, сал from салах, хаш from хашаа, дов from довтлох …), Ром (Rome) as "rum", the given
  name Болд as "steel", peoples (Oirats, Dzungars, Kazakhs), old court titles, лал (its second sense offensive),
  and үхсэн, the participle of a taught verb.
- **`LEAD` NOW ALSO KEEPS ITS ENTRY**: алах "to kill" is Wiktionary's fourth entry, after an adjective, an adverb
  and a noun, and the card shows three; the entry holding the lead gloss is sorted first before the cut. Eleven
  A2 leads move Wiktionary's everyday gloss forward (чулуу "rock, stone", утас "telephone", зурагт "television",
  тариа "injection", паспорт "passport", лууван "carrot" …). No A1 card changes.

**Known, left.** The fill is the encyclopaedia's again — politics, science and history (парламент, хүчилтөрөгч,
комиссар) — beside everyday words the inventory could not reach. Synonym pairs are labelled by the shelf's
de-duplication ("not өртөө"). Two thirds of the cards have no sentence.
