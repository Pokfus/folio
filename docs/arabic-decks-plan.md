# The Arabic language decks — plan and as-built findings (Nov 2026)

**Read this before building, or changing, any Arabic deck in `decks/`.** Asked for on 2026-11-09: "Add an
Arabic language collection." It is a twelfth language set in the shape of the ones already shipped
(`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this
file says otherwise).

**STATUS (2026-11-09): built — the Arabic Alphabet (31 notes) and Arabic A1 (500 notes / 1,000 cards).**
A2 and up, and a phrases deck, are not built; §6 is what they need.

## 1. What the set is

| deck | file | notes |
|---|---|---|
| Arabic Alphabet | `decks/Arabic-Alphabet.folio-deck.json` | 31: the 28 letters, then hamza ء, tāʔ marbūṭa ة, alif maqṣūra ى |
| Arabic A1 | `decks/Arabic-A1.folio-deck.json` | 500 |

**Modern Standard Arabic only** — the written and formal language, not any dialect. Titles in English, as
the Turkish and Russian sets settled. One note, two templates (Arabic → English, English → Arabic), the
Goethe / CAPLE / TORFL shape. `speechLang: "ar"` (the editor's own code for Arabic; a voice is chosen by
the base language, so `ar-SA`, `ar-EG` … all answer). The alphabet sorts before A1 (`levelRank`'s
existing "Alphabet" rule). The shelf orders Arabic at 411 million native speakers (Ethnologue 28th ed., all
varieties, read off Wikipedia's infobox 2026-11-09) — after Spanish.

## 2. Where the words come from

**No Arabic examination publishes an open graded word list**, so the A1 deck is ASSEMBLED, as UKBI, TORFL
and Turkish A2+ were, and its description says so in plain words: a vocabulary written for the CEFR A1
topics (`.claude/arabic/inventory.py`, one line a word: vowelled headword | part of speech | English), dealt
by subtitle frequency with the greetings first. **The English glosses are written by hand in the
inventory**, not taken from Wiktionary, whose Arabic glosses are a dictionary's ("to mark (symbols, shapes
…) on a surface"); Wiktionary supplies only the vowelled form, the romanisation, the gender, the plurals,
an adjective's feminine / plural / elative, a verb's present, verbal noun, form (I–X) and its past and
present cells.

## 3. The card

- **The headword is printed fully vowelled** (Wiktionary's canonical form) — Arabic is written without its
  short vowels and an A1 learner reads by them. The **example sentences are printed as Tatoeba wrote them**,
  mostly bare. Where kaikki's canonical form is not clean Arabic (`قَبْلَ Audio:`, `أَهْلًا وَ سَهْلًا` with a
  stray space, `الْحَمْدُ لِ لّٰهِ`), and for every multi-word greeting, the inventory's own spelling is printed;
  `build_deck.py` reports each one.
- **Romanisation on the back**, in Wiktionary's scheme (ā ī ū, ʔ hamza, ʕ ʿayn, ṯ ḵ ḏ š ṣ ḍ ṭ ẓ ḡ) — a check
  on the letters, not a replacement for them; the alphabet deck uses the same scheme.
- **Every Arabic run carries `dir="rtl" lang="ar"`**, and the deck CSS hooks on `[dir="rtl"]`, NEVER on
  `[lang="ar"]`: the app writes the type's `speechLang` onto the card wrapper as `lang`, so a `[lang="ar"]`
  rule would set the English text in an Arabic face. The speaker reads its language from the nearest
  `[lang]` ancestor (`cardSpeak`), which is the sentence's own div or the wrapper.
- A noun shows gender and plural(s) (Arabic plurals are mostly broken and must be learnt); five nouns that
  work as determiners (كُلّ بَعْض غَيْر أَحَد مِثْل) show nothing. A verb is named by its past 3ms
  (كَتَبَ "to write"), with an eight-person past and present table behind All forms.
- **The alphabet's `Name` field is PLAIN TEXT**: its template puts `{{Name}}` into the speaker's `data-say`
  attribute, and a span there broke the card (found on the first render — the letter showed `<"`).
  `check-arabic.js` refuses markup in it.

## 4. The pipeline (`.claude/arabic/`)

`python3 .claude/arabic/run.py [--no-fetch]` → `extract_kaikki.py` (kaikki's ~870 MB Arabic extract →
`dict.json`), `select.py` (join, count, deal), `examples.py` (Tatoeba), `build_deck.py`; `alphabet.py` is
separate and hand-written. Cache `.claude/arabic-cache/` (~1.4 GB, gitignored). A re-run is byte-identical.
Checks: `node .claude/arabic/check-arabic.js` (the files) and `node .claude/arabic/render-arabic.js a1|alphabet
[dir]` (imports a deck through the Studio and asserts the COMPUTED direction of the headword and a sentence
is `rtl`, the table and the speaker; writes a screenshot).

## 5. Findings

- **THE FOLD.** Matching and counting strip the harakat, shadda, sukūn, tanwīn, dagger alif and tatweel and
  read أ إ آ ٱ as a bare alif (`ar.fold`), because a bare text writes them so.
- **THE JOIN** filters by part of speech BEFORE it scores: `لِ` the preposition and an empty verb page share
  one exact spelling, and the verb won on the vowelled match alone. kaikki files the days as names and
  نَعَمْ as an adverb, so `POS_GROUPS` count those as one. Form-of stubs (`تفضل # تَفْضُلُ`) are never an entry.
  Four inventory lines had no usable entry and were replaced (تَفَضَّلْ, بِخَيْرٍ, خُضَار — kaikki's خضار is
  the greengrocer —, وُلِدَ).
- **THE COUNT.** An Arabic surface carries its clitics (و ف بِ لِ كَ and the article), so a surface counts for
  a word when, with one prefix chain stripped (`ar.PREFIXES`), it is one of the word's forms. Three rules
  came of reading the order: (1) a surface shared by several words is split in proportion to their
  unambiguous counts (the Turkish rule); (2) **a surface that is a word's own headword is that word's
  first** — Wiktionary's table for هٰذَا carries هٰذِهِ, ذٰلِكَ's carries تِلْكَ, and جَدّ's accusative is spelt
  جدا, so هٰذِهِ, تِلْكَ and جِدًّا were counted at nothing; (3) **two headwords of one spelling split it
  equally** — in proportion, مِنْ's unambiguous `منه` left مَنْ "who" nothing.
- **THE SENTENCES** were read whole, and each fault found became a rule: a pronoun is matched by its own
  headword only (أَنْتَ's table carries إِيَّاكَ); a clitic word takes no prefix, and no prefix stands on a form
  of one or two letters (ب + ضع is بضع "a few", ك + فا كفا, ك + لنا كلنا); **a written hamza seat must be the
  word's** (`إنه` had matched أَنَّ, `للأسف` آسِف); tanwīn on a word whose forms never carry it is another word
  (`إذاً`); a token inside one of the deck's compounds is the compound's (`إثنا عشر` is not اِثْنَان);
  **a vowelled token must agree with the word** — every mark it carries is one that form has on that letter,
  the last letter's case ending aside — so `مدرّسة` (teacher) is never مَدْرَسَة (school), and `الشّعر` (poetry,
  the sun-letter shadda) never شَعْر (hair). Fourteen words with a common homograph outside the deck take only a
  vowelled sentence (`VOWELLED_ONLY`: `علم` is knowledge, `آخر` another, `كتب` books, `قبل` accepted …), and a
  short hand list refuses named sentences (`REFUSE`, `REFUSE_ANY`: a name read as a word, a political or
  violent line). **What bare text cannot show is not caught** — a homograph with a word outside the deck that
  nobody has read yet; reading the deck is the check.
- **The banner hue** was measured (`lang-arabic` in `COLL_THEME`, #9F51B4), the sweep now also requiring
  4.5:1 against white — the farthest point without it was a violet at 3.8:1.

## 6. Next levels

A2 onward needs a second inventory per level (no exam list exists at any level), built on top of the shipped
A1 (no headword taught twice — add the `taught_below` arrangement the Turkish `select.py` has). A phrases deck
would start from kaikki's `phrase` / `intj` entries and Tatoeba counts, the Turkish `phrases.py` shape.
