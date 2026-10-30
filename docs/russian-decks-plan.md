# The Russian language decks — the plan (Oct 2026)

**Read this before building, or changing the plan for, any Russian deck in `decks/`.** It is the plan
for an eighth language set in the shape of the ones already shipped (Spanish DELE,
Portuguese CAPLE, Italian CILS, Indonesian UKBI …); `docs/lang-decks.md` is the record of how those
were built, and every rule there applies here unless this file says otherwise. Nothing below is built
yet. Asked for on 2026-10-30: "In the same style, we made other language vocabulary collections for
several foreign languages. Start planning a collection for learning Russian."

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version
bump** for any deck this plan produces. Only a change to the APP that Russian forces (below, §8) would
get one.

## 1. What the set is

**Six levels on the TORFL ladder plus a phrases deck** — the arrangement every other set has (CEFR
levels, then the one the syllabus leaves out). The Russian state exam, ТРКИ / TORFL, names its levels
itself, and each maps to a CEFR band:

| deck | TORFL level | CEFR | proposed size (notes) |
|---|---|---|---|
| `TORFL-A1-Russian` | Элементарный уровень (ТЭУ) | A1 | 500 |
| `TORFL-A2-Russian` | Базовый уровень (ТБУ) | A2 | 750 |
| `TORFL-B1-Russian` | ТРКИ-1 | B1 | 1,000 |
| `TORFL-B2-Russian` | ТРКИ-2 | B2 | 1,500 |
| `TORFL-C1-Russian` | ТРКИ-3 | C1 | 1,500 |
| `TORFL-C2-Russian` | ТРКИ-4 | C2 | 1,000 |
| `Russian-Phrases-and-Expressions` | — | — | whatever the pool holds (CAPLE's held 1,342) |

The sizes follow UKBI's and CAPLE's (A1 498–500, B2 1,400–1,500) and are the owner's to change. The
file names put the CEFR band, not the Russian level name, in the name, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule; the title carries both
("TORFL A1 (Элементарный) — Russian"). Each level is taught **on top of the shipped decks below it**
and no headword is taught twice — the DELE/CAPLE arrangement exactly.

**The card shape is Goethe's / CAPLE's**: one note, two templates (Russian → English and English →
Russian), so a corrected gloss is corrected both ways at once and each direction keeps its own
schedule. `speechLang: 'ru-RU'`.

**A combined `Russian-A1-C2` file is gitignored**, as every combined file is (`docs/lang-decks.md`).

## 2. Where the words come from — the decision that shapes everything

**TORFL's lexical minimums are not an open list.** The minimum for each level is published as a book
(by Zlatoust, St Petersburg — to verify before it is named anywhere a reader sees), under copyright,
and is not downloadable as data. torfl.ru did not answer from this container (TLS failure,
2026-10-30), so nothing here has been read off it. Sizes commonly quoted for the six minimums
(roughly 780 / 1,300 / 2,300 / 10,000 / 12,000 / 20,000 words) are **unverified and must not be written
into any deck or description** until a primary source confirms them.

So the Russian set is in **CILS's and UKBI's position, not Goethe's or DELE's**: it cannot say "this
is the exam board's vocabulary". Three ways through, in order of preference:

1. **(Recommended) Assemble, as UKBI did.** Each level's scope is its published TORFL descriptor
   (survival → everyday and social life → the professional and the academic), written as a
   `SECTIONS_<n>` table of topics in `torfl_level.py`; candidates come from Wiktionary, are ranked by
   lemma frequency (§3), and the closed classes (pronouns, prepositions, conjunctions, numerals,
   particles) are seeded first so they do not compete with nouns on raw rank. The deck's own
   description says in plain words that the list is assembled to the level's descriptor, not the
   exam board's.
2. **A third party's graded list, as CILS did** (MindDory publishes graded bands for several
   languages; whether it has Russian is unchecked). Only if it exists, and with the same audit CILS
   ran on its bands (a frequency gradient or a syllabus? a written register's? missing basics?).
3. **Frequency cut into six bands.** Simplest; teaches `правительство` before `хлеб`, which is CILS's
   own finding about frequency-only lists. Not recommended.

## 3. The order: LEMMA frequency, and why a word-form list will not do

**Measured 2026-10-30 on hermitdave's `ru_50k.txt` (OpenSubtitles, CC BY-SA 4.0):** it counts
*word forms*, and Russian scatters one lemma across a dozen of them. `книгу` (accusative) ranks 1,375
and `книга` (the headword) 1,789; `книге` 3,333; `книгой` 11,254. `делать` ranks 140, its forms
`делаю` 663 and `делала` 1,216. Ranking on the headword's own row understates every noun and verb, and
unevenly (a word met mostly in an oblique case sinks furthest).

Two remedies, to be decided at the start of Phase 1:

- **(Recommended) Sum the word-form counts over each lemma's Wiktionary paradigm** — `extract_kaikki.py`
  already gives every inflected form, so this is a join, all open data. Homographs (`стали` is a form
  of `стать` and of `сталь`) are split by the paradigm's own part of speech and reported, not hidden.
- **The Russian National Corpus frequency dictionary** (Ляшевская & Шаров, 2009, dict.ruslang.ru —
  reachable): lemmatised and a written-plus-spoken corpus, so a better order. **No licence statement
  was found on its page**, so it may be used at most as a reported cross-check (the NVDB role in
  CILS), never shipped and never a filter, unless its terms are confirmed.

**ё is spelt inconsistently in every corpus.** In the same subtitle list `еще` (rank 67) and `ещё` (96)
are separate rows, as are `все` and `всё` (which are also two different words). Matching and counting
fold ё → е; the CARDS always print ё, as learner materials do.

## 4. What a Russian card must carry that no earlier set needed

- **Stress.** Russian stress is free and moves through a paradigm (`рука́`, `ру́ку`), and every learner's
  dictionary marks it. Headwords, forms and paradigm tables carry the stress mark (U+0301), taken from
  Wiktionary's own stressed forms. Example sentences do NOT: Tatoeba's are unstressed and there is no
  open accentuator good enough to trust on a card, so a sentence is shown as it was written. **The
  stress mark is stripped before matching, before counting, and before the text goes to speech
  synthesis** (a combining accent can make a voice stumble — to test on the Chrome and Safari voices
  in Phase 1).
- **Aspect pairs.** A verb is taught as its pair, `де́лать / сде́лать`, on ONE note (imperfective first),
  with each member's conjugation in the Forms row; an unpaired or bi-aspectual verb says so. Which
  pairing Wiktionary gives is read, not assumed; a pair counts once against the level's size.
- **Verbs of motion** (`идти́ / ходи́ть`, `е́хать / е́здить` …) are the exception: the unidirectional and
  multidirectional verbs are separate notes that point at each other, since the distinction is the
  thing being learnt.
- **Nouns**: gender, genitive singular and nominative plural on the front's Forms row (the three a
  learner needs to decline it), the full twelve-cell paradigm behind it; animacy where it changes the
  accusative; indeclinables (`кафе́`, `метро́`) say so.
- **Adjectives**: the long form as headword, the short forms where they exist.
- **Prepositions** name the case they govern (`в` + accusative / prepositional, with the meaning of
  each); a verb's government is in its gloss (`помога́ть` + dative).
- **No transliteration.** The decks are in Cyrillic from the first card, with stress marks doing the
  work romanisation does in the Mandarin set's pinyin. If the owner wants a way in, it is a small
  **alphabet deck** (33 letters, sound, a word each) before A1 — an open question, §9.

## 5. Examples

Three Tatoeba sentences per note, as every set has (`rus_sentences_detailed.tsv`, `eng_sentences.tsv`,
`rus-eng_links.tsv` — the links file is 5.0 MB compressed). Matched on **the lemma's paradigm**,
stress-stripped and ё-folded, never on the headword's letters alone — DELE's whole audit log is the
cost of the second (an example showing a different word that shares the letters). The DELE
filters carry over unchanged: no sexual content, no slurs, no example shared with a lower deck, no
example of another member of the family (`де́ло` is not an example of `де́лать`). For an aspect pair,
the three examples should show both members.

## 6. Sources and licences

The deck description states all of these, as every set's does:

- English Wiktionary via the kaikki.org extraction — CC BY-SA 4.0 (Russian dump reachable).
- Tatoeba sentence pairs — CC BY 2.0 FR.
- hermitdave/FrequencyWords, OpenSubtitles 2018 — CC BY-SA 4.0.
- The RNC frequency dictionary — cross-check only, licence unconfirmed (§3).
- The TORFL descriptors — read for the scope of each level, quoted at most a phrase at a time.

## 7. The pipeline — `.claude/torfl/`

Python, one level per run (`TORFL_LEVEL`), cache in `.claude/torfl-cache/` (gitignored), the CILS/UKBI
file layout so a reader of one can read this:

    run.py             fetch the sources, run the stages in order
    torfl_level.py     the level, its size, its SECTIONS table, titles, deck ids
    extract_kaikki.py  Russian Wiktionary records: senses, stressed forms, paradigms, aspect partners
    select.py          candidates → lemmas → order by paradigm-summed frequency (§3)
    examples.py        three Tatoeba sentences each, matched on the paradigm (§5)
    build_deck.py      Forms rows, paradigm tables, aspect pairs, the two templates
    emit.py            the .folio-deck.json
    russian.py         stress and ё helpers shared by every stage
    check-torfl.js     the deck's own checker
    phrases.py         the phrases deck (CAPLE's two tests: a phrase-only POS OR an `idiomatic` sense)

The standing discipline holds: **a re-run reproduces every shipped Russian deck byte for byte**.

## 8. What the site needs (small, and the only parts that get a changelog line)

- `LANGS` in `.claude/build-lang-decks.js` gains `{ word: "Russian", name: "Russian", l1: … }` — the
  native-speaker figure to be looked up and cited when the row is added, not guessed. **"Russian" in a
  file name must not catch anything else**: `Russia` is a history collection and `Russia (Geography)`
  a geography one, but both are curated collections, not files in `decks/`, so the file-name match is
  safe; `test-lang-decks.js` is re-run to prove it.
- Check that the stress mark renders in every theme's font stack and does not break a typed answer
  (a reader typing `рука` for `рука́` must be marked right — the comparison strips U+0301; to verify
  in the Studio's typed-answer path before A1 ships).
- Then `node .claude/build-lang-decks.js`.

## 9. Phases and the owner's open questions

**Phase 0 — decisions (this file).** Answers wanted before Phase 1:

1. Word source: assemble to the descriptors (recommended), a third party's list, or frequency only?
2. Level sizes as in §1?
3. An alphabet deck before A1, or none?
4. Deck titles: "TORFL A1 (Элементарный) — Russian", or English only?

**Phase 1 — A1.** The pipeline end to end on one level; measure the paradigm-summed order against the
word-form order and the RNC list and record what differs; read every A1 card before it ships (the DELE
audit's lesson: the faults are found by reading, not by checkers).
**Phase 2 — A2 to C2**, one level per session, each read in batches as DELE's were.
**Phase 3 — Phrases and expressions.**
**Phase 4 — the combined file** (gitignored) and the catalogue row.

Each finished phase records its findings as a bullet in `docs/lang-decks.md`, in the shape the other
sets' bullets have.
