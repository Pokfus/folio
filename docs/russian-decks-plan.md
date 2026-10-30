# The Russian language decks — the plan (Oct 2026)

**Read this before building, or changing the plan for, any Russian deck in `decks/`.** It is the plan
for an eighth language set in the shape of the ones already shipped (Spanish DELE,
Portuguese CAPLE, Italian CILS, Indonesian UKBI …); `docs/lang-decks.md` is the record of how those
were built, and every rule there applies here unless this file says otherwise. Asked for on 2026-10-30: "In the same style, we made other language vocabulary collections for
several foreign languages. Start planning a collection for learning Russian."

**STATUS (2026-10-30): the alphabet deck and all six levels, A1 to C2, are built** (`.claude/torfl/`, §10). The owner's
answers to §9: sizes as below; **an alphabet deck, yes**; **titles in English**; word source as
recommended (assembled). The owner is supplying TORFL's own level descriptions; until they are written
into `SCOPE` in `torfl_level.py`, every level is scoped to the CEFR global descriptors for their bands
and say so in their descriptions.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version
bump** for any deck this plan produces. Only a change to the APP that Russian forces (below, §8) would
get one.

## 1. What the set is

**Six levels on the TORFL ladder plus a phrases deck** — the arrangement every other set has (CEFR
levels, then the one the syllabus leaves out). The Russian state exam, ТРКИ / TORFL, names its levels
itself, and each maps to a CEFR band:

| deck | TORFL level | CEFR | size (notes) |
|---|---|---|---|
| `Russian-Alphabet` (built) | — | — | 33 |
| `TORFL-A1-Russian` (built) | Элементарный уровень (ТЭУ) | A1 | 500 |
| `TORFL-A2-Russian` (built) | Базовый уровень (ТБУ) | A2 | 750 |
| `TORFL-B1-Russian` (built) | ТРКИ-1 | B1 | 1,000 |
| `TORFL-B2-Russian` (built) | ТРКИ-2 | B2 | 1,500 |
| `TORFL-C1-Russian` (built) | ТРКИ-3 | C1 | 1,500 |
| `TORFL-C2-Russian` (built) | ТРКИ-4 | C2 | 1,000 |
| `Russian-Phrases-and-Expressions` | — | — | whatever the pool holds (CAPLE's held 1,342) |

The sizes follow UKBI's and CAPLE's (A1 498–500, B2 1,400–1,500) and are the owner's (confirmed
2026-10-30). The file names put the CEFR band in the name, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule; **the titles are English** ("TORFL A1
Elementary — Russian"), the Russian level name only in the description. The alphabet sorts before A1
(`levelRank` returns −1 for a title with "Alphabet"). Each level is taught **on top of the shipped decks below it**
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

## 10. As built (2026-10-30): the alphabet and A1

**`.claude/torfl/`** — `run.py` (fetch + stages), `torfl_level.py`, `russian.py` (stress, ё, the
personal pronouns' cases), `extract_kaikki.py`, `supplement.py` (the A1 inventory), `select.py`,
`examples.py`, `build_deck.py`, `emit.py`, `alphabet.py`, `check-torfl.js`. Cache
`.claude/torfl-cache/` (gitignored, ~1.3 GB). `python3 .claude/torfl/run.py [--level a2]`, then
`node .claude/torfl/check-torfl.js a1`.

What the build found, in the order the stages meet it:

- **Wiktionary holds 55,708 Russian lemma entries** (53,882 before §11's fix) of a teachable part of speech, each with stressed
  forms, the full paradigm and the aspect partner. Pre-reform spellings (`дѣ́лать`) and romanisations
  are dropped from the forms; a cell's footnote digit (`него́ ²`) is stripped.
- **The lemma frequency needs two rules beyond summing.** A form that is some entry's HEADWORD belongs
  to that entry (`так` is the adverb, not the genitive plural of `та́ка`, Bangladesh's currency; `для`
  the preposition, not a form of `длить`), and only a form no headword owns (`стали`) is shared out, in
  proportion to what each paradigm earns alone. Even so `таки` — a particle with no entry — made
  `та́ка` common, so a lemma's sum is capped at forty times its own headword's count (319 capped; `рука́`,
  met mostly as `руки`/`руку`, is the highest real ratio among common nouns, about fifteen).
- **Letter names and abbreviations are spelt like function words** (`и`, `в` "volt", `К`, `ПО`), and
  some nouns are mostly another word's form (`том` ← `тот`, `лёт` ← `лет`); neither may enter by
  frequency. **A function-word entry that is an inflected form** (`было`, `знаешь`, `давай`, `себе`,
  `лучше`) is taught on its lemma's card, not as a note.
- **Closed-class homographs are one note** (`что` pronoun + conjunction; `пока` bye + while), and a
  **predicative** (Wiktionary files `жарко` "it is hot" as a formless `adj`) joins its adverb (`жарко`
  "hotly"), the predicative first only where it is the "it is…" sense.
- **Aspect pairs: only mutual pairings are taken**, plus four the textbook gives that Wiktionary does
  not reach (`видеть / увидеть`, not `завидеть`; `просить`, `ждать`, `нравиться`). The по- verbs of
  "doing it for a while" are refused as partners (`стоять / постоять`). 79 pairs in A1.
- **The personal pronouns share one table in Wiktionary** — `я`'s entry lists `ты`, `нас`, `их` — so
  their six cases are written out in `russian.py` (`PRONOUN_CASES`), or every pronoun would claim
  every other's sentences.
- **The film vocabulary the fill turns away** is a reasoned table (`REFUSED` in `select.py`): `убить`,
  `убийство`, `чёрт`, `мистер`, `сэр`, `капитан` …
- **Examples**: 508,365 usable Tatoeba pairs after the filters; three for all 500 notes. A sentence is
  never used twice, two of one card's sentences may not be the same sentence twice (more than half
  their words shared), and Tatoeba's Tom and Mary are passed over while anything else is left.
- **Glosses**: Wiktionary writes a function word's senses as usage notes and a preposition's under
  case headings that do not survive as glosses, so `GLOSS` in `build_deck.py` gives the plain gloss
  for about sixty words, each saying no more than the entry's own senses — and every preposition
  names the case each sense takes, which is the lesson.
- **The alphabet deck** is 33 hand-written notes (letter, name, sound in English words, one example
  word with its stress), two cards each; no source is read, so a re-run reproduces it exactly.
- **No typed-answer path exists for deck cards** (checked 2026-10-30), so §8's worry about a reader
  typing `рука` for `рука́` does not arise; the site's search already folds combining marks.

## 11. As built (2026-10-30): A2

750 notes / 1,500 cards on top of A1: 295 from `SECTIONS_A2` (the CEFR A2 descriptor's "personal and
family information, shopping, local geography, employment", plus narration and opinion), 455 by
frequency; 169 aspect pairs; three sentences for all 750. What A2 found, beyond A1's rules:

- **Wiktionary marks DERIVED words as `form of`** — `родитель` is a `form-of` its verb (`noun-from-verb`),
  `внучка` and `студентка` the feminines of `внук` and `студент` — so the extractor had been dropping
  1,826 real lemmas along with the inflected forms. A `form of` sense is now an inflected form only
  when it carries a tag of inflection or spelling (`FORM_TAGS` in `extract_kaikki.py`). This changed
  `lex.json` and therefore A1: A1 was rebuilt and differs from its first commit by `оружие` and `милый`
  out (the first refused, the second displaced to A2), `бросать / бросить` and `студентка` in.
- **Past the commonest 500 words the subtitle corpus chooses crime drama.** `REFUSED` became themed
  groups, each with one reason (crime drama, coarse, dubbing's forms of address, hesitation sounds,
  inflected forms filed as entries); a refused verb is caught as the SECOND member of a pair too
  (`затыкаться / заткнуться` came in through `заткнуться`); an entry whose first sense is coarse is
  refused even untagged (`шлюха`); given names Wiktionary lists in lower case (`генри`) are refused
  with letter names. These bind the frequency fill only — a later inventory may name `суд` or `война`.
- **The coarse filter matched inside words**: `ass\w*` caught "assistance", "assemble", "assent", so
  `помощь`, `собираться` and `согласиться` were refused and `помощь`'s gloss "help" was filtered away.
  Both copies (`select.py`, `build_deck.py`) are whole-word now.
- **More false pairs**: the по- delimitatives (`курить / покурить`, `мечтать / помечтать`), the
  inchoatives (`плакать / заплакать`, `кричать / закричать`), and `мешать / смешать` (to hinder, to
  mix) — all in `NO_PAIR`.
- **ё folding picked the wrong word**: `небо` (sky) folded onto `нёбо` (palate); the inventory now
  prefers the entry spelt exactly as written.
- **Glosses**: proper-name senses (`Otvet (Russian anti-submarine missile)`), a letter's old name,
  `diminutive of …:` and `female equivalent of …:` prefixes, `passive of …` on reflexives and
  square-bracket construction notes are stripped; short forms are shown only when the masculine
  exists (`взрослый` has none in use).
- **Two of one card's sentences sharing three of five words** are one sentence twice (`Дети и пьяные
  говорят правду` / `…не врут`); the similarity rule is one step stricter.

## 12. As built (2026-10-30): B1

1,000 notes / 2,000 cards on top of A2: 189 from `SECTIONS_B1` (the CEFR B1 descriptor's own domains —
work, school, leisure, travel, experiences and ambitions, reasons and opinions — plus society, money and
health), 811 by frequency; 229 aspect pairs; three sentences for 991 of the 1,000 and one or two for the rest.

- **The fill chooses four words in five at B1**, and naming film vocabulary word by word stopped
  scaling. `FILM_GLOSS` in `select.py` refuses a fill word whose FIRST English sense is about violence,
  crime, war, the supernatural or rank, matched on whole words. Two words were taken out of it after
  they cost A1 real words: "general" ("in general" — `вообще`) and "major" ("main"); and `accus\w+`
  became the verb's own forms after it matched "accusative" in `должен`'s grammar note. English names
  in the subtitles (`крис`, `стив`, `скотт`) and filler sounds are a short list beside it. This changed
  A1 and A2 a little: `господин` left A1 for the fill rule, and A2 lost `король`, `королева`, `дама`,
  `госпожа`, `пьяный`, `бороться`, `править`.
- **The fill may now choose between two same-spelt entries** (`PICK`): Wiktionary lists `клуб` "puff
  of smoke" before `клуб` "club", and `повод` "rein" before "reason".
- **Plurals filed as their own entries** (`кости`, `уши`, `мозги`, `карты`, `небеса`) duplicate a noun
  the set already teaches and are refused, as are participles and adjective forms filed as nouns
  (`любимая`, `созданный`).
- **`совершенно` and `довольно` are adverbs first** (`ADV_FIRST`) although their predicative's gloss
  begins "it is…".
- **The example filter refused "kiss", "girlfriend" and "boyfriend"**, which left `поцелуй` and
  `целовать` with no sentences; those are ordinary words and the filter no longer names them. It now
  names "whore" and "slut", which one translation carried.

## 13. As built (2026-10-30): B2

1,500 notes / 3,000 cards on top of B1: 186 from `SECTIONS_B2` (the CEFR B2 descriptor's "complex text
on both concrete and abstract topics" and "a viewpoint … giving the advantages and disadvantages": the
language of argument first, then society, the economy, science, the environment, culture, the media,
expertise, medicine and the mind), the rest by frequency; three sentences for nearly all.

- **The fill is now nine words in ten, and its tail is the corpus's least reliable part.** The subject
  rule (`FILM_GLOSS`) gained procedure, drugs, abuse and the fantastic (interrogations, autopsies,
  verdicts, cocaine, zombies, highnesses); a fill word whose first sense Wiktionary tags slang, vulgar,
  derogatory or offensive is refused (`кайф`, `тачка`); and `FILM_NAMES` grew by some ninety entries —
  subtitle names (`мик`, `хён`, `финн`), Greek letters, dubbing's endearments (`дорогуша`,
  `красавчик`), crime procedure the gloss rule cannot see from its first sense (`вскрытие`,
  `приговор`, `избивать`). **This is still a list, and B2's tail will hold strays the read missed**:
  1,500 cards were read as a sweep for known bad gloss shapes plus every inventory card and a random
  250 of the fill, not one by one.
- **A pair can differ only in stress** (`отреза́ть / отре́зать`, `выреза́ть / вы́резать`), and the
  partner search had paired such a verb with itself (both spellings fold alike). It skips itself now;
  the `Word` field names a stress-only pair's spelling once.
- **Diminutives glossed only as "diminutive of X"** take the base word's own gloss (`паренёк`: "fellow,
  lad … (diminutive)"); a later proper-name sense with a number (`Molniya 1 (…)`), a "see …"
  cross-reference and a "filter-avoidance spelling" are dropped.
- `притворяться` joins `PICK` ("pretend", not "to shut").

## 14. As built (2026-10-30): C1 and C2, mostly inventory

**The owner's decision (2026-10-30): C1 and C2 are built mostly from hand-written inventories**, as UKBI's
upper levels are, because past B2 the subtitle counts no longer rank anything and what fills that band
is film plot. C1 is 1,500 notes, **838 from `SECTIONS_C1`** (academic method, business and finance, law
and the state, politics, the economy, science, medicine, physical geography, the arts, the media, the
mind, society, philosophy, history; then the workplace, the city, cooking, the house, appearance, sport,
the education system, family relations, industry, computing, verbs of speech, prefixed verbs of motion,
abstract nouns in -ость); C2 is 1,000 notes, **609 from `SECTIONS_C2`** (the bookish and official
registers, the vocabulary of description, verbs of manner, the finer shades of feeling and character,
the language used to talk about language, rhetoric, adjectives of degree, adverbs of manner; then
bookish verbs, verbs of nuance, abstract distinctions, temperament, landscape, flora, fauna, anatomy).

- **Each first list lost about half its words to the levels below** (`мрачный`, `хрупкий`, `нарочно`
  had reached earlier levels by frequency), so each got a second list to make the inventory the
  majority. A further level's inventory should be written expecting that loss.
- **At C1 and C2 a missing inventory word is reported and skipped** rather than refusing the build
  (22 at C2: `строптивость`, `образумиться`, `трюизм`…, filed differently in Wiktionary or not at all),
  and an inventory larger than the level would keep its commonest words.
- **Many inventory words have no Tatoeba sentence** (131 of C1's notes, 146 of C2's), which is the
  price of choosing words for the level rather than for the corpus; the decks' descriptions say how
  many carry sentences.
- **The frequency remainder needed the same refusals again** (a rape verb whose first gloss is "to
  violate", an ethnic slur, coarse slang, crime and military, subtitle names), now in `FILM_NAMES`.
- An imperfective glossed only as "imperfective form of X" takes its perfective's senses
  (`перебивать / перебить`).

**C1 and C2 were read as an automated sweep for known bad gloss shapes plus a random 120 cards each**,
not one by one; strays will remain in their frequency remainders.

**Open:** write TORFL's own level descriptions into `SCOPE` and the inventories against them when the
owner's text arrives; a phrases-and-expressions deck (§1); and a full one-by-one read of B2–C2 of the
kind DELE's decks had.
