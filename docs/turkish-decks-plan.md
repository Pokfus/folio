# The Turkish language decks — plan

Started 2026-10-30, on request: "In the same form that we have several language vocabulary collections,
start planning a Turkish language collection." **Built so far: A1** (`decks/Turkish-A1.folio-deck.json`,
2026-10-30, generator `.claude/turkish/`, findings in `docs/lang-decks.md` under `.claude/turkish/`).
The owner's decisions (2026-10-30): use the programme's vocabulary; fold B1+ into B1; English names for the
collection and decks. This file is the plan the remaining levels are built from. Read `docs/lang-decks.md` first: everything there about community decks, the shelf
(`lang-decks.js`, `build-lang-decks.js`) and the generators' standing rules applies here unchanged. This
file only says what is different about Turkish and what was checked before anything was built.

## 1. What the shelf gets

A **Turkish** language on the Languages shelf, built like the Portuguese set (`.claude/caple/`) — one deck
per CEFR level plus a deck that is not a level:

| deck file | level | source of its scope | target notes |
|---|---|---|---|
| `Turkish-A1.folio-deck.json` | A1 | Programme A1 themes + its *söz varlığı* | **500, built** |
| `Turkish-A2.folio-deck.json` | A2 | Programme A2 | ~600 |
| `Turkish-B1.folio-deck.json` | B1 | Programme B1 **and B1+** (one deck, see §6) | ~1,000 |
| `Turkish-B2.folio-deck.json` | B2 | Programme B2 | ~1,200 |
| `Turkish-C1.folio-deck.json` | C1 | Programme C1 | ~1,000 |
| `Turkish-Phrases-and-Expressions.folio-deck.json` | — | Programme *dil ifadeleri* + Wiktionary idioms and proverbs | ~400 |

**No C2 deck**: the programme stops at C1 and the only Turkish exam with an international quality mark
(Yunus Emre Enstitüsü's TYS) certifies only B2 and C1. A C2 deck would have no source for its scope, so
none is planned. The target counts are the siblings' order of magnitude, not a promise — the built deck's
own counts are what the description will state.

Each file name carries `Turkish` and the level, which is all `build-lang-decks.js` needs: `levelRank`
already ranks `A1`…`C1` and sorts the phrases deck last. **The shelf change was one row in `LANGS`**
(`{ word: "Turkish", name: "Turkish", l1: 85 }`) plus the collection's hue in `COLL_THEME` (`lang-turkish`).
Deck titles are English: "Turkish A1".

A community deck is not a change to Folio: **no changelog line, no version bump** for a further deck. The
collection's arrival on the shelf (a new `LANGS` row and hue) was reader-facing and got one, as Indonesian's did.

## 2. Where the words come from — checked before anything was built

The question `docs/lang-decks.md` says to ask first — **does an exam board publish a word list?** — was
asked on 2026-10-30:

- **TYS (Türkçe Yeterlik Sınavı, Yunus Emre Enstitüsü)**: tys.yee.org.tr says only that a candidate who
  passes receives a certificate "B2 veya C1 düzeyinde". No vocabulary list or level descriptors were found
  on the site or in a search. It is a proficiency test, not a syllabus — the UKBI situation.
- **Türkçenin Yabancı Dil Olarak Öğretimi Programı** (Türkiye Maarif Vakfı, 2nd edition, Istanbul, Nov
  2020, ISBN 978-605-80438-2-4; approved by MEB Talim ve Terbiye Kurulu, decision 36 of 11.11.2020;
  PDF at `turkoloji.turkiyemaarif.org/uploads/2024/11/16436c12901a55.pdf`). **This is the spine.** It is
  CEFR-based, A1–C1, and carries:
  - §6.1 *Düzeylere Göre Kazanım Listeleri* — the can-do outcomes per level (the level's SCOPE, as UKBI's
    descriptors are for the Indonesian decks);
  - §7 *Düzeylere Göre Dil Yapıları Listesi* (pp. 83–) — the grammar per level: A1 cases, possessives,
    present/past/future/aorist, `-lI/-sIz`; A2 converbs (`-Ip`, `-ArAk`, `-mAdAn`), necessity, conditional;
    B1 compound tenses, participles (`-DIk`, `-AcAk`), voice; and so on;
  - §8 *İzlence tabloları* — per age band and level, ten themes each, every theme with a **Söz Varlığı**
    (vocabulary) column and a **Dil İfadeleri** (set phrases) column. The **Ortaöğretim** (secondary,
    adult-like) tables are the ones to read: A1, A2, B1, B1+, B2, C1, pp. 243–306, ten themes each
    (A1 "Tanışalım … Tatil Planım", C1 "İletişim … Sanatın Dili").
  - **What it does NOT carry is a single alphabetical word list per level.** The vocabulary is scattered
    through the theme tables, often as examples ("Alfabe öğretimi için örnek kelimeler: A: araba, ayna …")
    and the programme says itself that its themes are suggestions and that "farklı kelime ve yapılar
    tercih edilebilir". So it is a **partial, thematic inventory** — closer to UKBI's case (scope given,
    words assembled) than to Goethe's (the board prints the list), and the decks' descriptions must say
    exactly that, in those words.
- University TÖMER programmes (Gazi 2025, Bandırma) exist and corpus studies of level vocabulary have been
  published (DergiPark), but none was found to publish a reusable list; they are not used.

**The plan therefore follows the UKBI arrangement, with a better spine**: each level's scope is the
programme's outcomes and themes; its inventory (`supplement.py`) is the programme's *söz varlığı* for that
level, typed in as headwords; the order and the fill are corpus frequency. Nothing in a deck claims an
official list it has not got.

**Copyright.** The programme's imprint reads "Tüm hakları saklıdır. Türkiye Maarif Vakfının izni olmadan
kopyalanamaz ve çoğaltılamaz." The generator reads it as a reference for which headwords belong to which
level — as the DELE generator reads the Plan curricular — and copies none of its text: **the PDF goes in
the gitignored cache, never in the repo, and no theme table, outcome or example sentence from it reaches a
card.** Meanings come from Wiktionary, sentences from Tatoeba. **Owner's decision, see §8.**

## 3. The other inputs (all reachable from a cloud session on 2026-10-30)

| input | use | licence |
|---|---|---|
| kaikki.org Turkish extract (Wiktionary) | meanings, part of speech, **the inflection tables** | CC BY-SA |
| hermitdave/FrequencyWords `content/2018/tr/tr_50k.txt` (OpenSubtitles 2018) | order and fill | CC BY-SA 4.0 (as recorded in `lang-decks.md`) |
| Tatoeba `per_language/tur` sentences + links | three example sentences per word | CC BY 2.0 FR |
| The programme PDF | each level's scope and inventory (§2) | all rights reserved — read, not copied |

Probed: the frequency list answers (`bir 6034903`, `bu`, `ne`, `ve`, `için` …), kaikki's Turkish JSONL
answers and a noun carries its full declension (`pound` → `poundu` accusative, `pounda` dative,
`poundda` locative, `pounddan` ablative, plurals), Tatoeba's Turkish export answers. **Measured at A1**: every
verb carries the same 949-cell `tr-conj` table (with shifted person tags — see `docs/lang-decks.md`);
616,337 Tatoeba Turkish sentences of 3–12 words have an English translation, and all 500 A1 words found at
least one; the programme's column extracts cleanly with a `pdftotext` crop (not `-layout` of the page).

## 4. The card — what Turkish spends it on

Each sibling spends its card on the morphology a learner cannot guess (German gender and plural, Spanish
conjugation, Indonesian's affix family). **Turkish's is suffixation under vowel harmony and consonant
change**, and that is the forms row:

- **noun**: nominative · accusative · dative · locative · ablative · genitive · plural — `kitap` /
  `kitabı` / `kitaba` / `kitapta` / `kitaptan` / `kitabın` / `kitaplar`. The row shows the harmony
  (`-a`/`-e`, `-ı/-i/-u/-ü`), the voicing (`kitap → kitabı`, `ağaç → ağacı`), the `-DA/-DAn` alternation
  and the irregulars (`su → suyu`, `ağız → ağzı`, the Arabic loans that take front suffixes: `saat → saati`).
- **verb**: infinitive · present continuous · aorist · past · future, third person — `gitmek` /
  `gidiyor` / `gider` / `gitti` / `gidecek`. **The aorist is the one a learner cannot derive**: the
  monosyllabic stems that take `-ir` rather than `-er` (`gelir`, `bilir`, `kalır` …) are a closed list.
- **adjective/adverb**: no row (Turkish adjectives do not inflect); show nothing rather than an empty cell.

**THE FORMS ARE READ FROM THE DICTIONARY, NEVER DERIVED BY SUFFIXING** — the Indonesian rule, for the
same reason: voicing, vowel loss and the front-suffix loans are lexical, and no rule produces `ağzı` from
`ağız` without a dictionary. A word whose table is missing ships with no row, and the build reports it.

The shape is the **Goethe/CAPLE shape** (one note, two templates, Turkish → English and English →
Turkish), so a corrected gloss is corrected both ways at once.

## 5. Pitfalls to design for before the first run

1. **THE DOTTED AND DOTLESS I.** Turkish has four letters — `I ı İ i` — and Python's `str.lower()` maps
   `I → i` and `İ → i̇` (i + combining dot). Every case fold in the pipeline (frequency lookup, dedupe,
   matching the inventory to the dictionary) needs a Turkish fold (`İ → i`, `I → ı`, then `lower()`).
   Get this wrong and `ılık` and `ilik` merge, or a capitalised `Istanbul` misses its entry. A test should
   pin it on a file of Unicode strings (CLAUDE.md: Unicode test strings in a file).
2. **THE FREQUENCY LIST IS SURFACE FORMS AND TURKISH IS AGGLUTINATIVE.** Indonesian lost a fifth of its
   list to three clitics; Turkish will lose far more — `gidiyorum`, `gitti`, `gideceğiz`, `evde`, `evimiz`
   are all separate rows. **The lemma must be recovered from the dictionary's own tables, inverted**
   (every form in every kaikki `forms` list → its headword), never by stripping suffixes. Where a surface
   form maps to two lemmas (`yüz` face / hundred / to swim; `gül` rose / laugh), split its count only if
   a principled rule is found; otherwise count it to each and say so. Zemberek (Apache-2.0, a Java
   morphological analyser) is an allowed offline alternative under the generators-may-use-any-library
   rule if inversion proves too thin — **measure the inverted table's coverage of the top 5,000 first**.
3. **REGISTER.** Drop senses tagged colloquial, slang, dialectal, archaic and Ottoman-only, but — the
   Indonesian lesson — `informal` is not `colloquial`: `sen` and the familiar imperative are standard
   Turkish. Read EVERY sense, not the first.
4. **LETTER NAMES AND PROPER NOUNS.** Keep the months and days (Wiktionary files some as names) — the
   Indonesian decks lost all twelve months once to a proper-noun filter applied at the wrong stage.
5. **"SYNONYM OF X" IS NOT A MEANING.** Resolve a cross-reference to English (parenthetical first, then
   one hop to the target's glosses) or refuse the word — the 62 Indonesian cards defined in Indonesian.
6. **THE PROGRAMME'S TABLES ARE MULTI-COLUMN.** `pdftotext -layout` interleaves outcomes, functions,
   grammar, themes and vocabulary on one line; a crop to the "Söz Varlığı" column extracts it. The
   inventory is then **typed in from reading the column**, a theme at a time, into `supplement.py` with the
   page number beside each theme — not scraped into the deck. Where the next level's pages are: A2
   pp. 255–264, B1 265–274, B1+ 275–284, B2 285–294, C1 295–306 (the Ortaöğretim tables).
7. **A DESCRIPTION STATES TRUE THINGS ABOUT ITS OWN LEVEL** — templated claims per level from one `SCOPE`
   table (`tr_level.py`), and every derived clause read at both ends of its range (zero phrases, etc.).

## 6. Levels and the B1+ question

The Ortaöğretim tables have a **B1+** between B1 and B2. **Decided: B1+ is folded into the B1 deck** (the
programme's own continuation of B1, ten more themes); the B1 description must say so, and `SCOPE["b1"]` in
`tr_level.py` names both page ranges.

## 7. Build order

Each step is one session's work, and each ends with the deck's own check passing and the shelf rebuilt.

1. ~~Scaffold `.claude/turkish/`~~ — done (written fresh rather than copied from `caple/`: four stages,
   `tr.py` for the fold and the dictionary rules, `tr_level.py` for the level's facts and the description).
2. ~~A1~~ — done; all 500 cards read.
3. ~~Shelf~~ — done.
4. **A2 → C1** (next: A2 — add `A2` to `supplement.LEVELS`, `SIZE["a2"]` in `select.py` and `SCOPE["a2"]`
   in `tr_level.py`, then `run.py --level a2`), one per session, each taught on top of the shipped decks below it (no word on two levels).
5. **Phrases**: the programme's *dil ifadeleri* as the scope; Wiktionary's Turkish idioms and proverbs
   (with English glosses) as the content; the CAPLE phrases deck is the model.
6. Optional: a combined `Turkish-A1-C1` (gitignored, `combine.py`, as French/Spanish/Italian/Indonesian).

## 8. Decisions (settled 2026-10-30)

- **a. The spine**: the programme's per-theme vocabulary, headwords only.
- **b. B1+**: folded into B1.
- **c. Names**: English — the collection "Turkish", decks "Turkish A1" … in files `Turkish-<level>`.
