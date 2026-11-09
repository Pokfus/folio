# The Ukrainian language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Ukrainian deck in `decks/`.** It is the plan for a
twelfth language set in the shape of the ones already shipped (Hindi, Russian TORFL, Indonesian UKBI …);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this file
says otherwise. Asked for on 2026-11-09: "Add a Ukrainian language collection."

**STATUS (2026-11-09): the alphabet deck and A1 are built** (`.claude/ukrainian/`, §6). A2 to C1 and a phrases
deck are not.

Later decks under `decks/` are community content, not a change to Folio: **no changelog line and no version bump**
for them. The collection's first commit carried one line and one bump, because it also changed the APP (the
shelf's hue in `app.js`) — the Hindi, Turkish and Russian precedent.

## 1. The decisions (2026-11-09)

The request named no word source, size or script deck, so the session took the arrangement the two nearest sets
already use, and the owner may overrule any of it:

1. **Word source: CEFR A1–C1, assembled** (the Hindi / UKBI / TORFL arrangement). Ukraine certifies proficiency in
   the state language but publishes no graded word list a deck could take whole, so each level is a hand-written
   topic inventory (`inventory.py`) scoped to the CEFR global descriptor for its band, topped up with the commonest
   remaining lemmas. Each deck's description says so. Sizes, Hindi's: **A1 500 · A2 750 · B1 1,000 · B2 1,500 ·
   C1 1,500 notes**.
2. **A Cyrillic alphabet deck, first** — the Russian precedent, since the level decks carry no transliteration.
3. **Stress marked on every headword and form, no transliteration** — the Russian decks' card.
4. **This session: plan + alphabet + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Ukrainian Alphabet — built | `Ukrainian-Alphabet.folio-deck.json` | 34 (33 letters and the apostrophe) |
| Ukrainian A1 Beginner — built | `Ukrainian-A1.folio-deck.json` | 500 |
| Ukrainian A2 Elementary | `Ukrainian-A2.folio-deck.json` | 750 |
| Ukrainian B1 Intermediate | `Ukrainian-B1.folio-deck.json` | 1,000 |
| Ukrainian B2 Upper Intermediate | `Ukrainian-B2.folio-deck.json` | 1,500 |
| Ukrainian C1 Advanced | `Ukrainian-C1.folio-deck.json` | 1,500 |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, aspect, stress, forms | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Ukrainian.jsonl`, 320 MB) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `uk_full.txt` (290,325 forms) | CC BY-SA 4.0 |
| example sentences | Tatoeba `ukr` exports (182,702 Ukrainian–English pairs used) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 32 million, Ethnologue 28th ed. (a 2023 figure), via Wikipedia's infobox, read 2026-11-09 | — |

## 3. The card

One note, two templates (Ukrainian → English, English → Ukrainian), `speechLang: 'uk-UA'`. Fields: `Ukrainian` (the
stressed headword, `кни́га`), `Word` (the same without the mark, what the speaker reads), `English` (meanings by part
of speech; a noun's gender, "plural only" for `гро́ші` / `две́рі`, a verb's aspect in its label), `Forms` (a noun's
genitive and plural, an adjective's feminine, neuter and plural, a verb's я / він forms and past, and the verb's
ASPECT PARTNER), `Table` (behind a fold: a noun's seven cases, an adjective's or pronoun's cases by gender, a
verb's present or future by person, past and imperative; the personal pronouns' written-out paradigms), `Examples`
(up to three Tatoeba sentences, the word in bold, with a speaker). The type's CSS is `.claude/ukrainian/card.css`
(Hindi's without the romanisation, plus `.uc-asp`).

## 4. What Ukrainian needs — the findings

- **THE SUBTITLE LIST IS PART RUSSIAN.** `что` is its 12th word, beside `ты`, `это`, `меня`. A form with a letter
  Ukrainian lacks (ы э ъ ё) is dropped at the door; a Russian word spelt with shared letters reaches only a
  Ukrainian lemma it collides with, and those are cut by hand with their reasons (`select.EXCLUDE`: `да`, `но`,
  `его` "ego", `ему` "emu", `том` "volume", `м'яти` taking `мне`, `посол` whose table holds `после`, `піт` "sweat"
  whose table holds `потом` …). Tatoeba files a few Russian sentences under `ukr`; they are skipped the same way.
- **THE APOSTROPHE** (`п'ять`, `сім'я`) is typed four ways across the sources and dropped by the subtitles
  (`пять`). `uk.fold` removes it for matching; the card prints U+02BC `ʼ`.
- **STRESS IS PRINTED, NEVER COMPARED** (`uk.bare` removes the acute by name, so `й` and `ї` survive); one-syllable
  words carry no mark. The head line's stress is the headword's; `STRESS` in `build_deck.py` supplies one Wiktionary
  lacks (`дава́йте`).
- **PERSONAL PRONOUNS SHARE ONE TABLE** in Wiktionary (`він` lists `я`, `мене́`, `ти`), so they get written-out
  paradigms (`uk.PRONOUN_CASES`).
- **A TABLE WITHOUT ITS OWN HEADWORD IS ANOTHER WORD'S**: `озимина` "winter crops" carries `мама`'s forms and
  claimed its count; such a table is dropped.
- **DIMINUTIVES ARE "FORM OF" ENTRIES** (`дідусь` "diminutive of дід"): the sense becomes "grandfather
  (affectionate)" from the entry's own gloss of the base word, rather than dropping the word.
- **ASPECT PARTNERS ARE KEPT ONLY WHEN RECIPROCAL** (`ходи́ти` → `походи́ти` "to walk about" is not its perfective);
  `PARTNER` overrides a reciprocal pair a grammar does not teach (`зна́ти` / `зазна́ти`).
- **ONE ETYMOLOGY PER CARD** (`ETYMS`): `сім'я` "family" not "seed", `ніж` "than" not "knife", `треба` "it is
  necessary" not "rite"; `ма́ти` is "to have" and "mother" on one card, both A1. Impersonal predicatives Wiktionary
  files as adjectives are labelled "predicative" (`PREDICATIVE`).
- **Known, left.** The fill carries the subtitles' drama vocabulary (`смерть`, `бог`, `чорт`, `король`, `сер`) on
  frequency, as every subtitle-ordered deck on the shelf does. `вбити` "to kill" is left out: Wiktionary's entry
  is only "to drive in".

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 to C1, one level per session: write the
level's inventory into `inventory.py` and its `SCOPE` into `ukrainian_level.py`, run, read every card, extend
`select.EXCLUDE` with what the ranking shows. **Phase 3** — a phrases deck.

## 6. As built (2026-11-09): the alphabet and A1

`python3 .claude/ukrainian/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/ukrainian-cache/` (gitignored, ~450 MB);
`python3 .claude/ukrainian/alphabet.py` writes the alphabet deck and reads nothing.
`node .claude/ukrainian/check-ukrainian.js` is the check (a word on two levels, a pointer gloss, a Russian-only
letter, a missing or doubled stress mark, a stressed speaker field, unbalanced HTML, a shared English side). **A
re-run is byte-identical** (verified). A1: 500 notes, 377 from the inventory and 123 by frequency; three sentences
for all 500. The shelf's hue is measured: `#2A8424`, 19.5 from its nearest of 46.
