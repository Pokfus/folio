# The Urdu language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Urdu deck in `decks/`.** It is the plan for a
twelfth language set, built in the shape of the Hindi one (`docs/hindi-decks-plan.md`), whose pipeline
`.claude/urdu/` is adapted from; `docs/lang-decks.md` is the record of how the shelf was built, and every
rule there and in the Hindi plan applies here unless this file says otherwise. Asked for on 2026-11-09:
"Add an Urdu language collection."

**STATUS (2026-11-12): the alphabet deck and A1 to B2 are built** (`.claude/urdu/`, §6–§9). C1 and the
phrases deck are not — and §9 says why C1 should be decided before it is built.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any later deck this plan produces. The collection's first commit carried one (raising the day's Hindi
line to name both) and a bump, because it also changed the APP (the shelf's hue in `app.js`).

## 1. The decisions (2026-11-09)

The request named no word source, script deck or romanisation, and the owner had answered all three for
Hindi the same day — the same spoken language in another script — so **Hindi's answers were taken**:

1. **Word source: CEFR A1–C1, assembled** (UKBI / TORFL / Hindi). No exam board publishes a graded Urdu
   word list, so each level is a hand-written topic inventory (`inventory.py`) scoped to the CEFR global
   descriptor for its band, topped up with the commonest remaining lemmas. Sizes as Hindi's: **A1 500 ·
   A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**, then a phrases deck.
2. **An alphabet deck, first in the collection.**
3. **Romanisation on every word card** — Wiktionary's own (khānā, ma͠i), the `Roman` field. More needed
   than in Hindi: Urdu leaves the short vowels unwritten, so the romanisation is where they are shown.
4. **This session: plan + alphabet + A1**; later levels one per session.

If the owner wants any of these otherwise for Urdu, change them here first.

| deck | file | notes |
|---|---|---|
| Urdu Alphabet — built | `Urdu-Alphabet.folio-deck.json` | 56 |
| Urdu A1 Beginner — built | `Urdu-A1.folio-deck.json` | 500 |
| Urdu A2 Elementary — built | `Urdu-A2.folio-deck.json` | 750 |
| Urdu B1 Intermediate — built | `Urdu-B1.folio-deck.json` | 1,000 |
| Urdu B2 Upper Intermediate — built | `Urdu-B2.folio-deck.json` | 1,500 |
| Urdu C1 Advanced | `Urdu-C1.folio-deck.json` | 1,500 |
| Urdu Phrases and Expressions | `Urdu-Phrases-and-Expressions.folio-deck.json` | what the levels leave |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, forms, romanisation | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Urdu.jsonl`, 39 MB) | CC BY-SA 4.0 |
| frequency (speech) | hermitdave/FrequencyWords, OpenSubtitles 2018, `ur_full.txt` (9,592 forms — very small) | CC BY-SA 4.0 |
| frequency (writing) | the `wordfreq` package's Urdu list (Wikipedia, web text, Twitter; 23,201 forms), dumped once to `ur_wordfreq.txt` | CC BY-SA 4.0 data, Apache-2.0 code |
| example sentences | Tatoeba `urd` exports (≈2,400 Urdu–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 78 million (77.7), Ethnologue 28th ed., via Wikipedia's infobox, read 2026-11-09 | — |

`wordfreq` is installed OUTSIDE the repo and reached through `PYTHONPATH`, as Playwright is through
`NODE_PATH` (`pip install --target "$SCRATCH/py" wordfreq`); `run.py` needs it only for the first fetch.

## 3. The card

Hindi's card: one note, two templates (Urdu → English, English → Urdu), `speechLang: 'ur-PK'`; fields
`Urdu`, `Roman`, `Word`, `English`, `Forms`, `Table`, `Examples`. What is new:

- **RIGHT TO LEFT.** Every piece of Urdu on a card is its own `<span class="uc-ur" dir="rtl" lang="ur">`
  (`ur()` in `build_deck.py`), and a romanisation stands OUTSIDE it, so Latin letters never take the Urdu
  face or direction. `dir` and `lang` are on the sanitizer's allow-list (`SANITIZE_ATTRS["*"]`), so no
  sanitizer change and no `SANITIZE_REV` bump.
- **THE FACE IS NASTALIQ WHERE THE DEVICE HAS ONE** (`card.css`: Noto Nastaliq Urdu, Jameel Noori
  Nastaleeq, Urdu Typesetting, then Naskh). Nothing is downloaded. Nastaliq's lines are given line-height 2.
- **THE CARD PRINTS URDU AS IT IS WRITTEN** — without the short-vowel marks Wiktionary's tables carry
  (`ur.plain`: zabar, zer, pesh, tashdid, jazm dropped; tanween kept). `check-urdu.js` fails on a marked
  headword.
- **The speaker** depends on an Urdu voice on the reader's device; both descriptions say so.

## 4. What Urdu needs that Hindi did not — the findings

- **THE FOLD** (`ur.fold`): vowel marks dropped; the Arabic yeh, kaf and heh (`ي ك ه`) written as Urdu's
  (`ی ک ہ`); izafat heh, tatweel and joiners dropped. It composes (NFC) and NEVER decomposes: NFD would turn
  `ئ` into yeh + a mark and the fold would then merge words.
- **TWO FREQUENCY LISTS, AVERAGED PER MILLION.** The subtitle list alone is ~200,000 words of text and ranks
  A1's middle by noise; the written list alone would deal the news first. The average still brings the
  news's words (حکومت, وزیر, عدالت) earlier than a phrase book would, and the deck's description says so.
- **WIKTIONARY'S URDU IS THINNER THAN ITS HINDI.** No entry for `تک`, `دیر`, `چچا`, `ٹرین`, `رکنا`,
  `مہربانی`, `کے سامنے`, `کے پیچھے`, `کے نیچے`: the inventory was cut to what it defines and uses its spellings
  (`کمرہ`, `پیسہ`, `اسپتال`, `دوائی`, `کے لئے`, `گھنٹہ`). `امی` is filed as a spelling of `اما`, whose first entry
  is the conjunction "but", so the inventory has `اماں`. `بدھ` "Wednesday" is a proper noun (`NAME_OK`).
- **HOMOGRAPH ENTRIES THAT STEAL A COMMON FORM'S COUNT** — `ہے` and `ہیں` ("is", "are") are filed only as a
  vocative particle and an interjection, `گے` as "gay", `اسی` as eighty; and names (`خان`, `حسین`, `نواز`,
  `شریف`, `علی`) rank as words. Each is in `select.EXCLUDE` with its reason.
- **ONE ETYMOLOGY PER CARD** (`ETYMS`), as Hindi: `اگر` "if" not agarwood, `سر` "head" not arrow, `کل`
  "yesterday; tomorrow" not "dumb", the days `منگل`, `بدھ`, `پیر`; `POS_LEAD` puts `اور` "and" before "more".
- **TWO SHAPES OF VERB TABLE.** Most verbs have Wiktionary's GENERATED table (participles, and each tense
  for میں alone); about 130 — the commonest, `کرنا`, `دینا`, `دیکھنا` — have a FULL table, by person, whose
  cells tag no gender (masculine first, feminine second: `cell(nth=1)`) and whose future and subjunctive
  carry their pronoun inside the cell; `ہونا` has a table of its own. `build_deck.verb_table` reads all
  three. The full table's present perfect ("میں کیا ہوں") is NOT shown: a transitive verb's is ergative.
- **A table's header cells** (the pronoun `میں` heading a column) come through with no tags and were being
  matched as forms, bolding `میں` in every sentence; `extract.py` drops tagless cells.
- **Possessives are two words** (`آپ کا`, `ان کا`) defined only by pointing at the pronoun; `GLOSS` says what
  they mean.

**Known, left.** Tatoeba has few Urdu sentences: 406 of A1's 500 words have at least one, 300 have three.
Some table forms carry no romanisation in the source (`دیکھنا`'s key forms); `ملنا`, `چلنا`, `چلانا` have no
table at all. Wiktionary's romanisation is printed as it is (`keliye` for `کے لئے`). `جو` is labelled a noun,
as Wiktionary files it. `گانا` "song; to sing" is dealt early: its count includes the future endings `گا`/`گی`.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** (A2, B1 and B2 done 2026-11-12) — A2 to C1, one level per session: write the
level's inventory into `inventory.py` and its `SCOPE` into `urdu_level.py`, run, read every card.
**Phase 3** — the phrases deck. **Phase 4** — a combined file, gitignored.

## 6. As built (2026-11-09): the alphabet and A1

`PYTHONPATH=<wordfreq> python3 .claude/urdu/run.py [--level a1] [--no-fetch] [--re-extract]`; stages
`extract.py` → `select.py` → `examples.py` → `build_deck.py`, caching in `.claude/urdu-cache/` (gitignored,
~40 MB plus Tatoeba's English sentences); `python3 .claude/urdu/alphabet.py` writes the alphabet deck (reads
`lex.json` for the example words' romanisations). `node .claude/urdu/check-urdu.js` is the check. **A re-run
is byte-identical** (verified for both decks). A1: 500 notes, 265 from the inventory and 235 by frequency.
The alphabet: 56 notes — the 40 letters (each in its joined shapes), the 5 marks on ب, the 11 aspirated
pairs; every sound side names its letter, so the three s's, four z's, two t's and two h's are told apart
(asserted unique). The shelf's hue is measured: `#58288A`, 18.1 from its nearest of 50 (first `#7066D0`, re-swept on
merging because Greek had measured `#6F69D2` the same day; greens refused as Pakistan's flag colour).

## 7. As built (2026-11-12): A2

Asked for on 2026-11-12: "Add Urdu A2." `python3 .claude/urdu/run.py --level a2`; 750 notes / 1,500 cards,
220 from the inventory (Hindi's A2 topics in Urdu spellings) and 530 by frequency; no word of A1 repeated
(`words_below`). **A re-run is byte-identical**, and A1 rebuilt after the A2 changes is unchanged. Tatoeba
gives 340 of the 750 at least one sentence, 118 three. Read card by card; what that found:

- **WIKTIONARY LACKS MORE OF A2 THAN OF A1.** No Urdu entry for `پھوپھی`, `ملازم`, `یونیورسٹی`, `طالبہ`,
  `پولیس`, `تاجر`, `وکیل`, `ڈرائیور`, `نرس`, `انجینئر`, `شلوار`, `کرتا`, `کرایہ`, `پارک`, `کھانسی`, `شرمیلا`,
  `پھر`, `پچھلا`, `جیتنا`, `ہارنا`, or the compound verbs `مدد کرنا`, `کوشش کرنا`, `پسند کرنا`. The list uses
  what it does define: `جامعہ`, `شاگرد`, `پولس`, `سوداگر`, `دکان دار`, `رکشا`, `گندہ`, `کبھی کبھار`, `گزشتہ`,
  `دوبارہ`, `کھانسنا`, `فوٹ بال`, the nouns `جیت`, `ہار`, `مدد`, `کوشش`. Five jobs went with no stand-in.
- **THE MONTHS ARE NOT A TOPIC.** Wiktionary defines four of the twelve (February, April, August, October);
  four of twelve is not a lesson, so the topic was dropped and the scope sentence no longer names it.
- **MORE HOMOGRAPHS** (`ETYMS`, each with its reason): `ذکر` zikr "mention" (1 is a body part), `رائے`
  "opinion" (1 is "king"), `دین` "religion", `دم` "breath; tail", `قوت` "strength", `گھٹنا` "knee",
  `سکھانا` "to teach" (1 is "to dry"), `دھونا` "to wash", `بتی` "lamp", `شکر` "thanks; sugar", `مبنی`
  "based on". `حد` has no romanisation in the source (`ROMAN_BY_HAND`: had).
- **THE FILL'S NOISE IS NAMES, SUFFIXES AND FORMS** — 38 more `select.EXCLUDE` rows, each with its reason:
  names (`سید`, `سنگھ`, `شاہد`, `رضا`, `مریم`…), suffixes (`-بندی`, `-بازی`, `-پور`, `-گاہ`), English loans
  counted under a native homograph (`سپر`, `بیگ`, `موتر`, `ہیک`), a verb's form under a rare noun (`سنا`,
  `سکا`, `ملی`, `پا`), plurals of a word taught (`روپے`, `انتخابات`, `حدود`), and two entries that lack
  the common meaning (`ماہ` "month", `گزر` "passage").

**Known, left.** `اسی` "eighty" is dealt first: its count includes the emphatic "this very". The written half of
the frequency puts the news's words (`الزام`, `اجلاس`, `دھماکہ`, `قبضہ`) well inside A2, as A1's description
already warns.

## 8. As built (2026-11-12): B1

Asked for on 2026-11-12: "Add B1." `python3 .claude/urdu/run.py --level b1`; 1,000 notes / 2,000 cards.
**Only 86 come from the inventory and 914 by frequency**: the frequency fill of A2 had already taken much of
the B1 topic list (`ترقی`, `منصوبہ`, `مذہب`, `حکومت`…), so `words_below` skipped it, and Wiktionary lacks
much of the rest. Tatoeba gives 254 of the 1,000 a sentence, 48 three: by B1 the sentences have run out,
and the description says so in numbers. **A re-run is byte-identical**; A1 and A2 rebuilt after it are
unchanged. Read card by card; what that found:

- **WIKTIONARY LACKS THE MODERN WORDS.** No Urdu entry for `کمپنی`, `ٹیکس`, `بجٹ`, `پالیسی`, `ویزا`,
  `ٹریفک`, `ٹیکنالوجی`, `انٹرویو`, `ڈگری`, `منافع`, `غربت`, `مایوسی`, `ناکامی`, `تبدیلی`, `سماجی`,
  `معاشی`, `مفید`, the connectors `چونکہ`, `تاکہ`, `جب تک`, `پھر بھی`, `جیسے`, and more (the run prints
  them). The list uses what it defines: `بے روزگاری`, `افلاس`, `اعتماد`, `اضطراب`, `استدلال`, `تبدیل`,
  `تاہم`, `کی طرح`, `اقتصادی`, `جستجو`, `سیاست`, `بیجا`, `ملاقات`. `بل` "bill" came out of the inventory:
  its only entry is "power".
- **MORE HOMOGRAPHS** (`ETYMS`): `بت` "idol", `گل` "flower", `مہر` "seal; kindness; dowry", `سرد` "cold",
  `چھٹا` "sixth", `سکھ` "peace; Sikh", `تیر` "arrow", `مادہ` "matter; female".
- **THE FILL'S NOISE GREW WITH ITS DEPTH** — about 70 more `select.EXCLUDE` rows, each with its reason:
  names (`جناح`, `گاندھی`, `ناصر`, `اختر`, `ظفر`…, often under a common noun's entry), suffixes (`-ساز`,
  `-کشی`, `-گیر`, `-پذیر`, `-آباد`, `-نوشی`), English loans under a native homograph (`پیج`, `کیش`, `گرڈ`,
  `کلو`, `گن`, `سوری`), forms (`کرا`, `کھیلا`, `بنتی`), other spellings of a word taught (`قمیض`,
  `سوموار`), and entries whose only gloss is not the word's meaning (`بچی` "girlfriend", `تذکرہ`
  "substantial", `بیل`, `نیم`). `پٹھان`, an ethnic name glossed first as "militant", is left out. `گدھے` is
  in `SWEARS`.

**Known, left.** Wiktionary tags `باندھنا` and `لہرانا` as nouns, and the cards print that. Religious vocabulary
(`نماز`, `آیت`, `حدیث`, `جہاد`, `شریعت`) runs heavier than in a phrase book, as the written half of the count is
partly religious text.

## 9. As built (2026-11-12): B2 — and the source running dry

Asked for on 2026-11-12: "Add B2." `python3 .claude/urdu/run.py --level b2`; 1,500 notes / 3,000 cards,
**22 from the inventory and 1,478 by frequency**. Tatoeba gives 100 of the 1,500 a sentence, 8 three. **A
re-run is byte-identical**; A1, A2 and B1 rebuilt after it are unchanged.

- **THE INVENTORY BARELY RESOLVES.** Wiktionary has no Urdu entry for most of B2's topic words — vote,
  campaign, judiciary, appeal, finance, import, invention, resources, psychology, diagnosis, historian,
  equality, prejudice, rural, refugee, aspect, whereas, limited, sensitive, transparent, compare, and
  more (the run prints them) — and the lower levels' fill had already taken many that it has. Stand-ins
  used: `کوئلا`, `کشیدگی`, `افسردہ`, `مورتی`, `نقاش`, `کلا کار`, `نو آبادی`, `مہاجر`, `کے باوجود`, `شماریات`,
  `بہر حال`, `نتیجتا`, `جائزہ`, `انکشاف`.
- **THE FILL IS DEEP IN THE TAIL.** The deck's median frequency is 2.9 per million (B1's was 22.5) and 532
  of the 1,500 sit under 2 per million: every word is attested at 0.5 or more (`select.py`'s floor), but at
  this depth the ranking is close to noise, and what fills the deck is less "upper-intermediate" than "the
  rest of what Wiktionary defines" — numbers to ninety-nine, fruits and spices, animals, poetry and
  religious terms alongside the abstract nouns B2 wants.
- **THE NOISE** — about 190 more `select.EXCLUDE` rows, each with its reason, read off four passes of
  the ranking: names (most of them), suffixes, loans under a native homograph, forms, plurals, other
  spellings of a word taught, two slurs in a gloss, and entries with no romanisation.

**C1 SHOULD BE DECIDED BEFORE IT IS BUILT.** The lexicon holds ~7,000 lemmas; A1–B2 have used 3,750 and
excluded some 400. A C1 of 1,500 would be drawn from what is left, nearly all of it under 1 per million,
with almost no inventory and no sentences. The honest options: a smaller C1, a C1 built from another
dictionary, or no C1 and the phrases deck next.
