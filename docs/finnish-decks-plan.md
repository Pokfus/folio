# The Finnish language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Finnish deck in `decks/`.** It is the plan for a
Finnish set built in the Hungarian decks' shape (`docs/hungarian-decks-plan.md`, whose pipeline `.claude/finnish/`
adapts); `docs/lang-decks.md` is the record of how every set was built, and every rule there applies here unless
this file says otherwise. Asked for on 2026-11-15: "Add a Finnish language collection."

**STATUS (2026-11-15): the alphabet deck and A1 are built** (`.claude/finnish/`, §6). A2 to C1 and a phrases deck
are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit carried one because it also changed the APP — the
shelf's hue in `app.js` and the `LANGS` row in `.claude/build-lang-decks.js`.

## 1. The decisions (2026-11-15, taken from the Hungarian precedent — the owner was not asked)

The request named no levels, so the session followed the last "Add a … language collection" requests (Hungarian,
the closest language and pipeline). **Any of these is the owner's to overrule.**

1. **Word source: CEFR A1–C1, assembled.** Finnish has an examination graded to the CEFR (the National
   Certificates of Language Proficiency, YKI), but no graded word list for it is known to be published, so the
   decks do not claim to be any exam's vocabulary. (No new search was run this session; the Hungarian finding
   was taken as the pattern.) Each level is a hand-written topic inventory (`inventory.py`) scoped to the CEFR
   global descriptor, topped up with the commonest remaining lemmas; the description says so. Sizes, Hungarian's:
   **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**.
2. **An alphabet deck, first** in the collection — of SOUNDS rather than shapes, the script being Latin.
3. **No romanisation** (the script is Latin); **verbs by their first infinitive**, the form Finnish dictionaries
   and Wiktionary list (`syödä` "to eat").

| deck | file | notes |
|---|---|---|
| Finnish Alphabet — built | `Finnish-Alphabet.folio-deck.json` | 34 |
| Finnish A1 Beginner — built | `Finnish-A1.folio-deck.json` | 500 |
| Finnish A2 Elementary | `Finnish-A2.folio-deck.json` | 750 |
| Finnish B1 Intermediate | `Finnish-B1.folio-deck.json` | 1,000 |
| Finnish B2 Upper Intermediate | `Finnish-B2.folio-deck.json` | 1,500 |
| Finnish C1 Advanced | `Finnish-C1.folio-deck.json` | 1,500 |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, forms | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Finnish.jsonl`, 4.7 GB) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `fi_full.txt` (2.49 million forms) | CC BY-SA 4.0 |
| example sentences | Tatoeba `fin` exports (96,226 Finnish–English pairs after the swear filter) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 5.0 million, Wikipedia's infobox (Finland 4.75 million, 2023), read 2026-11-15; no second-language figure, so `total` is the L1 | — |

## 3. The card

One note, two templates (Finnish → English, English → Finnish), `speechLang: 'fi-FI'`. Fields: `Finnish` (the
headword), `Word` (the same, what the checks key on), `Say`, `English` (meanings by part of speech; a bracketed
DEFINITION over 40 characters is cut, `shorten`), `Forms` (a noun's plural, genitive, partitive and plural
partitive — `käsi`: `kädet`, `käden`, `kättä`, `käsiä`; an adjective's comparative, genitive and partitive; a
numeral's or a pronoun's genitive and partitive; a verb's "I" and "he/she" forms, past and perfect — `syödä`:
`syön`, `syö`, `söi`, `on syönyt`), `Table` (behind a fold: a verb's present, negative, past, perfect, conditional
and imperative by person and its passive; a noun's or adjective's fourteen cases in both numbers; a personal
pronoun's cases with its accusative), `Examples` (up to three Tatoeba sentences, the word in bold). The CSS is
Hungarian's.

## 4. What Finnish needs that no earlier set did — the findings

- **THE TABLES' TAGS ARE CLEAN.** Unlike Hungarian's (person tags shifted by a row) Wiktionary's Finnish
  declension and conjugation cells come out of the extraction properly tagged, so `fi.verb_table` and the
  declension reader go by tag, never by position. Over 11,270 conjugated verbs, a block is missing for a few
  dozen (imperative 40, perfect 23, past 19, negative 6), and a missing block is simply not shown.
- **THE PARTICIPLES' TAGS ARE GARBLED** (`syönyt` tagged "infinitive-i-long past", the third infinitive's cases
  tagged with persons), so the past participle is read off the perfect's third person (`on syönyt`), and the
  infinitives beyond the first are not shown.
- **A PERSONAL PRONOUN'S TABLE HOLDS BOTH NUMBERS OF ITS PERSON** (`te`'s table is `sinä`'s and `te`'s; `he`'s is
  `hän`'s and `he`'s): the first build gave `te` the forms `sinun`, `sinua`. `build_deck.pron_table` takes the
  column whose nominative is the word. `minä` and `me` have no table in the extraction and show none.
- **THE GRAMMAR NOTES INSIDE A GLOSS** — the case a verb or postposition takes ("to know with elative ‘about’",
  "towards with partitive or (with personal pronouns only) possessive suffix") — and cross-references ("(compare
  se, see usage notes)") are cut from the card (`GRAMMAR`, `XREF`).
- **"See" ONLY WITH ITS CAPITAL.** The Hungarian pointer test (`^See `, case-insensitive) dropped `näkemiin`'s
  "see you later, see you, goodbye", and a "see usage notes" test dropped `tuo`'s only gloss: both came out
  with no English and the shelf's dedupe labelled each "not" the other. The tests are case-sensitive now, in
  the builder and in `check-finnish.js`.
- **SPOKEN FINNISH IN TATOEBA.** Many sentences are in the colloquial language (`Tää ei oo hyvä`, `Mikä su nimi
  o?`); a sentence with a colloquial spelling that is no standard word (`COLLOQUIAL` in `examples.py`) is ranked
  after every standard one. It is a ranking, not a filter: a word with only spoken sentences still gets them.
- **POSSESSIVE AND PARTICIPLE FORMS COUNT** toward a lemma's frequency and match its sentences (`talossani`,
  `syönyt`), though the tables do not show the possessives; only forms the subtitle list contains are kept.
- **A FORM FILED AS ITS OWN WORD** (`mitä`, `sitä`, `naiset`, `odota`, `käy`), a count that belongs to another
  word (`et`, the ampersand, is `ei`'s "you not"; `niittää` "to mow" is `niitä` "them") and a spoken spelling
  (`mä`) are `select.EXCLUDE`d, each with its reason.
- **WRITTEN GLOSSES** (`build_deck.GLOSS`, each with its reason): `enemmän` (Wiktionary gives only "comparative
  degree of paljon"); `täällä`, `tässä`, `siellä`, `siinä`, told apart by distance; `sisko` and `sisar`, one
  meaning in two registers. `LEAD` puts `syy` "cause, reason" before "fibre", `lounas` "lunch" before
  "southwest", `sade` "rain" before "precipitation"; `ETYMS` shows `juuri` "just" before "root".

**Known, left.** The fill carries the subtitles' crime-drama vocabulary (`tappaa`, `ase`, `ampua`) on frequency,
as every subtitle-ordered deck does. The fill also deals some case forms Wiktionary files as adverbs (`tästä`,
`siihen`, `tähän`, `täältä`): they are words a beginner meets as such. Adjectives' comparatives come from the
headword line and are missing where Wiktionary gives none.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 to C1, one level per session: write the
level's inventory into `inventory.py` and its `SCOPE` into `finnish_level.py`, run, read every card.
**Phase 3** — a phrases deck (Hungarian's `phrases.py` is the model).

## 6. As built (2026-11-15): the alphabet and A1

`python3 .claude/finnish/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/finnish-cache/` (gitignored, ~6 GB; the extraction pass takes
about three minutes); `python3 .claude/finnish/alphabet.py` writes the alphabet deck (checks its example words
against `lex.json`). `node .claude/finnish/check-finnish.js` is the check. **A re-run is byte-identical** (verified
for both decks, with `--re-extract`). A1: 500 notes, 345 from the inventory and 155 by frequency; three sentences
for 498, at least one for all 500. The alphabet: 34 notes — the 29 letters in Finnish order with their Finnish
names, then ng/nk, the stress, the long vowel, the long consonant and the diphthong; every sound side unique
(asserted). The shelf's hue is measured: `#907227`, a dark mustard, 14.5 from its nearest neighbour (World
History) against all 69 other hues on the page.
