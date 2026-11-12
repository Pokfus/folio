# The Bengali language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Bengali deck in `decks/`.** It is the plan for a
twelfth language set, the Hindi set's sister: `.claude/bengali/` is `.claude/hindi/` adapted, and every rule
in 📖 `docs/hindi-decks-plan.md` and `docs/lang-decks.md` applies here unless this file says otherwise. Asked
for on 2026-11-09: "Add a Bengali language collection."

**STATUS (2026-11-12): the alphabet deck, A1, A2 and B1 are built** (`.claude/bengali/`, §6–8). B2, C1 and
the phrases deck are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any later deck this plan produces. The collection's first commit carried one (merged into the day's Hindi
line, one line per kind of change) and a bump, because it also changed the APP (the shelf's hue in `app.js`).

## 1. The decisions (2026-11-09)

The request named no word source, size or script deck. The owner had answered exactly these questions for
Hindi the same day, so **the Hindi answers are taken for Bengali** — to be revisited if the owner says
otherwise:

1. **Word source: CEFR A1–C1, assembled.** No exam board publishes a graded Bengali word list for learners,
   so each level is a hand-written topic inventory (`inventory.py`) scoped to the CEFR global descriptor for
   its band, topped up with the commonest remaining lemmas; the description says so. Sizes: **A1 500 · A2 750
   · B1 1,000 · B2 1,500 · C1 1,500 notes**, then a phrases deck.
2. **A script deck, first in the collection.**
3. **Romanisation on every word card** — Wiktionary's own, the `Roman` field.
4. **This session: plan + alphabet + A1**; later levels one per session.
5. **Both standards.** Bengali is one written language across West Bengal and Bangladesh, but a few
   everyday words differ (`জল` / `পানি` water, `নমস্কার` / `সালাম`); where they do at a level, the
   inventory takes both.

| deck | file | notes |
|---|---|---|
| Bengali Alphabet (Bangla script) — built | `Bengali-Alphabet.folio-deck.json` | 56 |
| Bengali A1 Beginner — built | `Bengali-A1.folio-deck.json` | 500 |
| Bengali A2 Elementary — built | `Bengali-A2.folio-deck.json` | 750 |
| Bengali B1 Intermediate — built | `Bengali-B1.folio-deck.json` | 1,000 |
| Bengali B2 Upper Intermediate | `Bengali-B2.folio-deck.json` | 1,500 |
| Bengali C1 Advanced | `Bengali-C1.folio-deck.json` | 1,500 |
| Bengali Phrases and Expressions | `Bengali-Phrases-and-Expressions.folio-deck.json` | what the levels leave |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, forms, romanisation | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Bengali.jsonl`, 40 MB, 11,376 entries) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `bn_full.txt` (99,993 forms) | CC BY-SA 4.0 |
| example sentences | Tatoeba `ben` exports (8,709 Bengali–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 242 million — Wikipedia's infobox (Ethnologue 28th ed. and the 2011 Census of India, 2011–2023), read 2026-11-09 | — |

## 3. The card

One note, two templates (Bengali → English, English → Bengali), `speechLang: 'bn-IN'`. Fields: `Bengali`
(the headword), `Roman`, `Word` (what the speaker reads), `English` (meanings by part of speech — Bengali has
no grammatical gender, so no gender label), `Forms` (a noun's definite form "the" with -টা, its plural, its
genitive "of"; a verb's third-person present and past and its "having done" participle, where the stem vowel
changes — `করা`: করে, করল; `খাওয়া`: খায়, খেলো, খেয়ে — and the irregular verbs show — `যাওয়া`: গেল, গিয়ে;
a pronoun's objective and possessive), `Table` (behind a fold: a verb's present, present continuous, present
perfect, past, habitual past and future by person at the three levels of address — তুই, তুমি, আপনি; a noun's
four cases bare, definite and plural), `Examples` (up to three Tatoeba sentences). The CSS is the Hindi type's.

## 4. What Bengali needs that Hindi did not — the findings

- **THE SADHU TABLES.** Wiktionary gives many verbs a second conjugation in sadhu bhasha, the
  nineteenth-century literary register (`করিতেছে`); every row after a `…/sadhu` template is skipped.
- **kaikki's NOUN TABLES ARE GARBLED.** A slot's colloquial and formal variants are run together, into the
  romanisation ("(boiṭa (colloquial), boiṭi (formal))") or into the form itself ("বাড়িগুলো (baṛigula …"). The
  Bengali before the bracket is the cell (`extract.cell_form`); a romanisation is kept only when it is one
  clean word; a cell that is the headword plus a regular ending is romanised as the headword's romanisation
  plus the ending's (`build_deck.SUFFIX_ROMAN`) — a concatenation, not a guess. The colloquial variant is
  shown (-টা, -গুলো), matched on the ENDING, never the stem (`টাকা` holds টা).
- **THE y-STEM TEMPLATE ON A WORD ENDING IN য়** (`সময়`, `বিষয়`) writes the genitive সময়য়ের / সময়র; both
  cells are dropped (`BAD_CELL`), and `check-bengali.js` fails on a doubled য়.
- **POINTERS THE INVENTORY NEEDS, of any part of speech.** `আছে` "there is; has" is Wiktionary's
  "third-person of আছ-", the stem of a defective verb; `নেই` is filed under `নাই`; the possessives
  `তোমার`, `আপনার` are pointer entries. `extract.py` keeps every form-of and alt-of entry as a pointer; the
  card prints the inventory's spelling, the pointer's own romanisation, and the target's meanings. The fill
  never takes a pointer, a stem (`আছ-`), or a pronoun's bare case form ("objective of আমরা").
- **কী / কি** are spelt either way for "what" in running text; the fold merges them, and the card prints the
  inventory's spelling.
- **ONE ETYMOLOGY PER CARD** (`ETYMS`, `POS_LEAD`, `LEAD` in `build_deck.py`), each with its reason; pronoun
  glosses lose their grammar tails ("I; 1st person nominative singular pronoun" → "I"); the address pronouns'
  glosses are written from Wiktionary's own labels (familiar, honorific, informal) so the five "you" cards
  differ (`GLOSS`).
- Hand exclusions from the fill, each with its reason, in `select.EXCLUDE` — among them `দায়িত্ব`
  "responsibility", whose Wiktionary entry carries চেষ্টা's senses. Swearing in `SWEARS`.

**Known, left.** Head romanisations mix Wiktionary's letter transliteration (`hoōẇa`, `jaōẇa`) with an
editor's phonetic one (`tumi`, `bhalo`); the conjugation tables' romanisations are phonetic (`gêlam`). Some
table cells are the template's, not usage (`ডাকা` "having done ডাকে" for ডেকে; `অস্ত্রর` for অস্ত্রের). 19 of
A1's 500 words have no Tatoeba sentence. The fill carries subtitle vocabulary (`খুন`, `গুলি`, `পুলিশ`).

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 and B1 (done) to C1, one level per session: write
the level's inventory into `inventory.py` and its `SCOPE` into `bengali_level.py`, run, read every card.
**Phase 3** — the phrases deck. **Phase 4** — a combined file, gitignored.

## 6. As built (2026-11-09): the alphabet and A1

`python3 .claude/bengali/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py`
→ `examples.py` → `build_deck.py`, caching in `.claude/bengali-cache/` (gitignored, ~160 MB);
`python3 .claude/bengali/alphabet.py` writes the alphabet deck (reads `lex.json` for the example words'
romanisations, and stops if one is missing). `node .claude/bengali/check-bengali.js` is the check. **A re-run
is byte-identical** (verified for both decks). A1: 500 notes, 272 from the inventory and 228 by frequency;
sentences for 481, three for 434. The alphabet: 56 notes — 11 vowels (each alone and as its sign on ক), 5
signs (ং ঃ ঁ ্ ৎ), 32 consonants, the 3 dotted letters, 2 conjuncts and the 3 phola signs; every sound side
unique (asserted). The shelf's hue is measured: `#574518`, a dark olive, 17.7 from its nearest of 49 — re-swept at the
merge, its first two winners (a green, then `#6F69D2`) having been taken by Arabic and Greek in parallel
sessions (`app.js`'s note).

## 7. As built (2026-11-09): A2

`python3 .claude/bengali/run.py --level a2`. 750 notes, 252 from the inventory and 498 by frequency; sentences
for 523, three for 283 (Tatoeba's Bengali is small: 228 words have none). Wiktionary's Bengali is thin at this
level — 61 of the first inventory draft's words had no entry (চাচি, বেতন, পেন্সিল, ক্লান্ত …) and were dropped
or swapped for a spelling that has one (নাতনী, গরীব, একলা), never given a meaning by hand. The inventory takes
Wiktionary's multi-word verbs (`মনে করা`, `সাহায্য করা`, `অপেক্ষা করা` …), which the fill never deals.

**Found on reading the ranking, and fixed in `select.py`:**
- **Untagged form and pointer entries.** `গিয়েছিল` ("চলিত past perfect … of যাওয়া") and `পুরনো` ("Umlauted
  form of পুরানো") were dealt as words: a lemma whose every gloss is a form of another Bengali word is now
  skipped (`FORMGLOSS`). The rule also took `নিজে` ("instrumental/locative form of নিজ") out of A1, where `নিজ`
  is taught; `মান` "respect" took its place. A1 was rebuilt — the only change.
- **Spelling variants** dealt twice (`চাকরি` / `চাকরী`): the fill skips a word whose ী/ি, ূ/ু or ণ/ন variant
  is already dealt at this level or below (`vkey`).
- A pointer that QUOTES its meaning ("umlauted form of ভিজা (bhija, “wet”)") is cut to the quoted meaning in
  `build_deck.gloss_text` (`ভেজা` "wet").
- New hand exclusions, each with its reason: `মাই`, `থাম`, `মাল` (counted from commoner words), `দক্ষ`
  (Wiktionary's entry parses to its headword line), `দিয়া` (sadhu), `জো` (a bare "synonym of"), the bare stems
  `সেখান` / `ওখান`, and the second spellings `জুতো`, `জ্বী`, `লাজ`.

## 8. As built (2026-11-12): B1

`python3 .claude/bengali/run.py --level b1`. 1,000 notes, 297 from the inventory and 703 by frequency;
sentences for 370, three for 96 — Tatoeba's 8,709 Bengali pairs run out at this level (630 words have none),
and the description says so in its counts. **The inventory was written from Wiktionary's headwords, not
before them**: the first draft lost about a third to missing entries (বেতন, পরিবেশ, প্রযুক্তি, ভোট, নিরাপদ,
সম্ভবত …) and another third to words A1 or A2's fill had already dealt (শিক্ষা, সরকার, সমস্যা …), so the
level's topics were refilled from the remaining lemmas that have an entry. Nothing was given a meaning by hand.

**Found on reading the ranking, and fixed:**
- **"synonym of" pointers.** `আম্মা` ("synonym of মা"), `আপু`, `অপারেশন` were dealt as words; `select.FORMGLOSS`
  now counts "synonym of <Bengali>" as a pointer. A1 and A2 do not change.
- **A multi-word verb's table.** kaikki garbles the conjugation of `মনে করা`, `অনুভব করা` … to one
  "habitual past" row (তুই করতি, তুই প্রমাণকরতিস); a multi-word lemma now has no table
  (`build_deck.table_html`) — the verb's whole table is on its own card (করা, A1). A2's ten such cards lost
  the broken row — the only change to A2.
- **The subtitles' homographs** are the commonest fault at this depth: English words in Bengali letters
  (হোম "havan" counted from "home", হিল, রুট, ব্যাক, অল, ডগ), names (রাম, জামাল, ওমর, আলী, আদম), and forms of
  common verbs (হল "plough" ← হল "was"; পেল ← "got"; দেও ← "give!"; গুলা "flood" ← the plural -গুলা). Each
  is a hand exclusion in `select.EXCLUDE` with its reason, as are older, dialect and sadhu spellings of words
  already taught (ঔষধ, গোরু, ভিজা, ভালা, কাইল, লওয়া, ইহা, হইতে) and two entries with no clean romanisation
  (ফ্ল্যাট, ওহে).
- Counts of 1,000 and more are written with a comma ("1,000 words"), as the shelf's other B1 decks write them.

**Known, left.** The fill still carries some dialect and Perso-Arabic register (পোলা, পুত, কেডা, আপনে, দুশমন)
and some subtitle vocabulary (ধর্ষণ, ভূত, প্রেতাত্মা); each has a real entry and a real meaning, so it stays.
