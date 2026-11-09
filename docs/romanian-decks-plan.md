# The Romanian language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Romanian deck in `decks/`.** It is the plan for a
twelfth language set in the shape of the ones already shipped (Hindi, Russian TORFL, Indonesian UKBI,
Turkish …); `docs/lang-decks.md` is the record of how those were built, and every rule there applies here
unless this file says otherwise. Asked for on 2026-11-09: "Add a Romanian language collection."

**STATUS (2026-11-09): A1 is built** (`.claude/romanian/`, §6). A2 to C1 and the phrases deck are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any later deck this plan produces. The collection's first commit carried one line and one bump, because
it also changed the APP (the shelf's hue in `app.js`) — the Hindi, Turkish and Russian precedent.

## 1. Decisions (2026-11-09, taken on Hindi's precedent — the owner may overrule any)

The request named no level, source or size, so each decision copies the shelf's most recent assembled set
(📖 `docs/hindi-decks-plan.md` §1), where the owner did answer them:

1. **Word source: CEFR A1–C1, assembled.** No openly licensed graded Romanian word list was found to build
   from, so each level is a hand-written topic inventory (`inventory.py`) scoped to the CEFR global
   descriptor for its band, topped up with the commonest remaining lemmas. Each deck's description says so
   in plain words and claims no examination. Sizes: **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500
   notes**, then a phrases deck. (C2 can be added on request: the CEFR has it, the plan stops where Hindi's does.)
2. **No alphabet deck.** Romanian is written in the Latin alphabet; its five extra letters (ă â î ș ț) are
   learnt on the words.
3. **IPA on every card that Wiktionary gives one** (451 of A1's 500), in place of Hindi's romanisation:
   Romanian spelling is close to its sound, but the STRESS is neither written nor predictable.
4. **This session: plan + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Romanian A1 Beginner — built | `Romanian-A1.folio-deck.json` | 500 |
| Romanian A2 Elementary | `Romanian-A2.folio-deck.json` | 750 |
| Romanian B1 Intermediate | `Romanian-B1.folio-deck.json` | 1,000 |
| Romanian B2 Upper Intermediate | `Romanian-B2.folio-deck.json` | 1,500 |
| Romanian C1 Advanced | `Romanian-C1.folio-deck.json` | 1,500 |
| Romanian Phrases and Expressions | `Romanian-Phrases-and-Expressions.folio-deck.json` | what the levels leave |

The titles carry the CEFR band, so `levelRank` sorts them with no new rule.

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, forms, IPA | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Romanian.jsonl`, 434 MB) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `ro_full.txt` (≈1.1 million forms) | CC BY-SA 4.0 |
| example sentences | Tatoeba `ron` exports (31,918 Romanian–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 22.2 million, Wikipedia's infobox (Ethnologue 27th ed., 2020), read 2026-11-09 | — |

## 3. The card

One note, two templates (Romanian → English, English → Romanian), `speechLang: 'ro-RO'`. Fields: `Romanian`
(the headword; a verb as the dictionary cites it, `a face`, the particle quieter), `IPA`, `Word` (the bare
headword, what the speaker reads and what the level-below check compares), `English` (meanings by part of
speech, a noun's gender — masculine, feminine or NEUTER — in its label), `Forms` (a noun's plural and
definite form, `casă` → `case`, `casa`; an adjective's feminine and plurals; a verb's first person, past
participle and subjunctive — the three a dictionary gives), `Table` (behind a fold: a verb's present,
imperfect, subjunctive and imperative by person; a noun's indefinite and definite, nominative and genitive,
and vocative; an adjective's eight forms; a pronoun's case forms), `Examples` (up to three Tatoeba
sentences, the word in bold, with a speaker). The type's CSS is `.claude/romanian/card.css` (Hindi's, plus
`.uc-a` for the infinitive's particle).

## 4. What Romanian needs that no earlier set did — the findings

- **THE CEDILLA** (`ro.fold`): the subtitles write ş / ţ (U+015F / U+0163, the old code points) where
  Wiktionary writes ș / ț with the comma below — `şi` 4.27 million against `și` 0.39 million. Every match
  folds the cedilla to the comma; a card prints the comma letters, and `check-romanian.js` fails on a cedilla.
  Nothing else is folded: ă, â and î are letters, and `fată` "girl" is not `față` "face".
- **THE BARE SPELLING YIELDS TO A COMMONER ACCENTED TWIN** (`extract.py`). The subtitles also drop
  diacritics: `si` 1.08 million, `sa` 1.34 million. A surface with no diacritic whose accented twins are
  together commoner hands its count to them in proportion; one commoner than its twins keeps it (`fata`
  "the girl"). 16.5 million tokens moved. Counted as written, `si` made "B (the musical note)" an A1 word.
- **A CELL WITH ITS PARTICLE CLAIMS ITS VERB**: the conjugation table writes `să facă`, `nu face`; the cell
  claims (and the sentence matcher matches) the last word.
- **CLOSED-CLASS HEADWORDS THAT ARE A COMMONER WORD'S FORM.** Hindi's rule (an indeclinable word keeps its
  own spelling) is kept — it is what gives `bine`, `și`, `aici` their counts — but in Romanian many short
  closed-class headwords are also a verb's or pronoun's form: `e` (the letter; really `este` "is"), `o`
  ("oh"; really the article and "her"), `ai` and `au` (articles / "or"; really `avea`), `mă`, `mi`, `ia`,
  `bună`. Each is in `select.EXCLUDE` with its reason; the inventory teaches the real word.
- **ONE ETYMOLOGY PER CARD** and **a part of speech left off a card** (`ETYMS`, `DROP_POS` in
  `build_deck.py`, each with its reason): `mare` is "big" and "sea", `bancă` leads with "bank" not "bench",
  `eu` is not "ego", a colour adjective's noun ("white person") is dropped.
- **GRAMMAR NOTES AS GLOSSES**: Wiktionary writes "Used with an infinitive to form the future…" as senses.
  One is kept only where it is the entry's one meaning (`is_note`); a subsense that is a phrase and its
  translation ("casă de schimb – bureau de change") is replaced by its parent gloss.
- **Placeholder cells**: a defective verb's table writes `-` for a person it lacks (`întâmpla`); `ro.is_ro`
  requires a letter, so none reaches a card.

**Known, left.** A word whose every form is shared with a commoner lemma's table is dealt last on a count near
zero — `luni` "Monday" (the plural of `lună` "month"), `roșie` "tomato" (the feminine of `roșu` "red"); the
inventory keeps them in the deck, only the order suffers. Wiktionary gives no IPA for 49 of A1's 500. Some
first glosses are Wiktionary's own ordering ("to stand" as `avea`'s second sense). The fill carries the
subtitles' crime-drama vocabulary (`ucide`, `omorî`, `armă`, `poliție`) on frequency, as every
subtitle-ordered deck on the shelf does. 2 of A1's 500 words have no Tatoeba sentence.

## 5. Phases

**Phase 1 (done)** — the pipeline, A1. **Phase 2** — A2 to C1, one level per session: write the level's
inventory into `inventory.py` and its `SCOPE` into `ro_level.py`, run, read every card, extend `EXCLUDE` /
`ETYMS` / `DROP_POS` with reasons. **Phase 3** — the phrases deck. **Phase 4** — a combined file, gitignored
(and a `PARTS` row in `.claude/combine-decks.py`).

## 6. As built (2026-11-09): A1

`python3 .claude/romanian/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` →
`select.py` → `examples.py` → `build_deck.py`, caching in `.claude/romanian-cache/` (gitignored, ~470 MB).
`node .claude/romanian/check-romanian.js` is the check. **A re-run is byte-identical** (verified). A1: 500
notes, 354 from the inventory and 146 by frequency; IPA on 451, forms on 310, sentences for 498 (three for
495). The shelf's hue is measured: `#2A8424`, 19.5 from its nearest of 46.
