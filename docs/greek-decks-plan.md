# The Greek language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Greek deck in `decks/`.** It is the plan for a
twelfth language set, built in the Hindi decks' shape (`docs/hindi-decks-plan.md`, whose pipeline
`.claude/greek/` adapts); `docs/lang-decks.md` is the record of how every set was built, and every rule there
applies here unless this file says otherwise. Asked for on 2026-11-09: "Add a Greek language collection."

**STATUS (2026-11-09): the alphabet deck and A1 are built** (`.claude/greek/`, §6). A2 to C1 and a phrases
deck are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit carried one (adding Greek to the day's
"collections join the Languages section" line) because it also changed the APP — the shelf's hue in `app.js`.

## 1. The decisions (2026-11-09, taken from the Hindi precedent — the owner was not asked)

The request named no levels, so the session followed the last "Add a … language collection" request, whose
owner's answers are recorded in the Hindi plan. **Any of these is the owner's to overrule.**

1. **Word source: CEFR A1–C1, assembled.** Greek HAS an examination at these levels — the Certificate of
   Attainment in Greek (Πιστοποίηση Ελληνομάθειας) of the Centre for the Greek Language — but no graded word
   list for it was found published (one web search, 2026-11-09: nothing from the Centre), so the decks do not
   claim to be its vocabulary. Each level is a hand-written topic inventory (`inventory.py`) scoped to the
   CEFR global descriptor, topped up with the commonest remaining lemmas; the description says so. Sizes,
   Hindi's: **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**.
2. **An alphabet deck, first** in the collection.
3. **Romanisation on every word card** — Wiktionary's (spíti, tróo, the accent kept).
4. **Modern Greek only**, monotonic spelling. Ancient Greek is a different subject.

| deck | file | notes |
|---|---|---|
| Greek Alphabet — built | `Greek-Alphabet.folio-deck.json` | 39 |
| Greek A1 Beginner — built | `Greek-A1.folio-deck.json` | 500 |
| Greek A2 Elementary | `Greek-A2.folio-deck.json` | 750 |
| Greek B1 Intermediate | `Greek-B1.folio-deck.json` | 1,000 |
| Greek B2 Upper Intermediate | `Greek-B2.folio-deck.json` | 1,500 |
| Greek C1 Advanced | `Greek-C1.folio-deck.json` | 1,500 |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, forms, romanisation | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Greek.jsonl`, 221 MB) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `el_full.txt` (1.49 million forms) | CC BY-SA 4.0 |
| example sentences | Tatoeba `ell` exports (30,821 Greek–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 13.5 million, Wikipedia's infobox (a 2015 figure), read 2026-11-09 | — |

## 3. The card

One note, two templates (Greek → English, English → Greek), `speechLang: 'el-GR'`. Fields: `Greek` (the
headword, **a noun with its article** — ο, η, το, οι/τα for a plural-only noun — in `.uc-art`), `Roman` (the
article's too: "to spíti"), `Word` (the bare lemma, what the checks key on), `Say` (what the speaker reads:
article and noun), `English` (meanings by part of speech, a noun's gender in its label), `Forms` (a noun's
genitive and plural, an adjective's feminine and neuter, a verb's simple past and future — `έφαγα`,
`θα φάω`, where Greek verbs change stem), `Table` (behind a fold: a verb's present, simple past, imperfect,
future and imperative; a noun's four cases; an adjective's, the article's or a pronoun's three genders; a
cell Wiktionary lists two forms for shows both, `το / τον`), `Examples` (up to three Tatoeba sentences, the
word in bold). The type's CSS is `.claude/greek/card.css` (Hindi's, plus `.uc-art`).

## 4. What Greek needs that no earlier set did — the findings

- **THE FOLD KEEPS THE ACCENT** (`gr.fold`: lower case, final ς as σ). Stripping it would merge `η` "the" with
  `ή` "or", `που` "that" with `πού` "where?", `πως` with `πώς`.
- **A ROMANISER FOR THE VERB TABLES** (`gr.translit`, Wiktionary's Module:el-translit scheme): Wiktionary
  romanises headwords and noun/adjective cells but no verb cell. Measured against its 300,114 romanised
  cells: 779 disagree (0.26 %), polytonic spellings, loanwords and Wiktionary's own inconsistency over η
  after a vowel (`ανόητος` anóitos beside `αηδόνι` aïdóni). `python3 .claude/greek/gr.py` re-measures.
- **CAPITALISED DAYS AND MONTHS** fold onto lower-case words (`Δευτέρα` / `δευτέρα`); the months are filed as
  names. A day or month wins its key (`CAL` in `extract.py`); any other capitalised headword (`Η` "eight") is
  kept only where no lower-case headword folds the same.
- **THE FREQUENCY RULES**, Hindi's plus two found on reading the A1 ranking: (1) an indeclinable word's own
  spelling is its own (Hindi's, closed class and adverbs only); (2) **a noun's headword is its own against an
  adjective's cell** — split, `μωρό` "baby", `λεπτό` "minute" and `κρύο` "cold" were dealt last and `μωρός`
  "stupid", `λεπτός` "thin" and `κρύος` dealt in their place — and against another noun's cell only when it
  is plural-only (`λεφτά` "money" against `λεφτάς` "moneybags"; given to every noun it handed the plural of
  `παιδί` to `παιδιά` "game"), never against a verb's; (3) a contraction (`στο` = σε + το) counts for the
  preposition. Rare, archaic and Katharevousa cells claim nothing.
- **THE ARTICLE'S FORMS ARE FILED AS PRONOUNS TOO** (`το` "it", `τον` "him"), and rule (1) handed each the
  article's whole count; they are taught on the card of `ο`, whose table shows every form (`select.EXCLUDE`).
  `του`, `της`, `τους`, `μου`, `σου`, `μας`, `σας` stay: "his", "her", "my" are A1.
- **ALTERNATIVE SPELLINGS WITH FULL ENTRIES** (`μέρα` / `ημέρα`, `αγαπώ` / `αγαπάω`, `μη` / `μην`): a fill lemma
  glossed exactly as a word already chosen is the same word and is skipped (`select.gloss_sig`).
- **NESTED SENSES** (`["to eat", "to chew and swallow food"]`) are given as their parent, once.
- **GLOSSES THAT ARE NOT MEANINGS** are cut (`NOT_A_MEANING`): "see: βρίσκομαι", "synonym of γυρίζω", form labels
  inside real entries, and sense-group headers ("Plant and fruit senses."); the particles' grammar notes
  (`να`, `θα`, `ας`), `έχω`'s paragraph and `κρατάω`'s passive headwords are written in `GLOSS`.
- Hand exclusions from the fill, each with its reason, in `select.EXCLUDE`; swearing in `SWEARS`.

**Known, left.** The fill carries the subtitles' crime-drama vocabulary (`σκοτώνω`, `όπλο`, `θάνατος`, `αίμα`)
on frequency, as every subtitle-ordered deck on the shelf does. A deponent verb's future row lists only the
first person (Wiktionary's table writes the rest as "θα + dependent"). Two of A1's 500 words have no Tatoeba
sentence. Synonyms the dedupe pass labels against each other (`αλλά`, "not μα") are true synonyms.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 to C1, one level per session: write the
level's inventory into `inventory.py` and its `SCOPE` into `greek_level.py`, run, read every card.
**Phase 3** — a phrases deck (`phrase` / `proverb` entries and idiomatic multi-word lemmas: `καλή όρεξη`).

## 6. As built (2026-11-09): the alphabet and A1

`python3 .claude/greek/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/greek-cache/` (gitignored, ~370 MB);
`python3 .claude/greek/alphabet.py` writes the alphabet deck (reads `lex.json` for the example words'
romanisations). `node .claude/greek/check-greek.js` is the check. **A re-run is byte-identical** (verified for
both decks). A1: 500 notes, 313 from the inventory and 187 by frequency; three sentences for 491, none for 2.
The alphabet: 39 notes — the 24 letters with their Greek names, the 13 two-letter spellings (ου αι ει οι υι αυ
ευ μπ ντ γκ γγ τσ τζ), the accent and the diaeresis; every sound side unique (asserted: "ee" is written six
ways, so each note says where its spelling is used). The shelf's hue is measured: `#6F69D2`, 18.6 from its
nearest; re-swept at the merge against all 48 other hues it is the outright winner (Arabic took the green
the first sweep had refused).
