# The Mandarin deck generators

These built the nine HSK `.folio-deck.json` files in `decks/` (and, since Nov 2026, `build-beginner.js` builds three more — see "The order, the pinned ids and the three beginner decks"). **Not part of the site** — nothing here is
loaded by it, and a deck file is imported through the Studio exactly as a stranger's would be, through
`uDeckNormalize`, with no privileged path of any kind.

They live here for the reason `build-era.js` and `fetch-book.js` do: `decks/` holds 22 MB of generated
data, and generated data whose generator is on somebody's disk is data nobody can correct.

## What they need, and where it comes from

None of the source data is committed — it is 130 MB and it belongs to other people. Fetch it into a
working directory and run the scripts from there.

| file | what it is | where |
|---|---|---|
| `cedict.u8` | CC-CEDICT, ~124,800 entries (CC BY-SA 4.0) | mdbg.net's `cedict_1_0_ts_utf-8_mdbg.txt.gz` |
| `complete.json` | the HSK lists with ICTCLAS part-of-speech tags | `drkameleon/complete-hsk-vocabulary` |
| `mmah.txt` | character decompositions and radicals | `skishore/makemeahanzi`'s `dictionary.txt` |
| `cmn.tsv` `eng.tsv` `link.tsv` | Tatoeba sentences and their links (CC BY 2.0 FR) | tatoeba.org's weekly exports |
| `freq_full.txt` | OpenSubtitles 2018 Mandarin word frequencies (CC BY-SA 4.0) | `hermitdave/FrequencyWords`, `content/2018/zh_cn/zh_cn_full.txt` |
| `up1.txt` … `up6.txt` | the official HSK 3.0 level lists, as text | the published PDFs, run through `pdftext.js` |
| `l79.html` | the levels 7–9 band | hanzistroke.com's page for it — there is no PDF |

## The order

    node extract79.js l79.html          # → up7.json  (512 characters + 5,088 words)
    node build2026b.js                  # → w26-1..7.json   the words, readings, traditional forms
    node mw2026.js                      # adds measure words
    node extras.js                      # adds the character breakdown and the example sentences
    node extras2.js                     # the same for HSK 2.0 (words1.json / words2.json)
    node build-mandarin.js              # → decks/Mandarin-*.folio-deck.json  (nine decks)
    node build-hsk20.js                 # → decks/HSK1-Mandarin, HSK2-Mandarin

`build-mandarin.js` is the one that writes what ships, and it writes NINE decks: the seven HSK 3.0 levels,
the everyday phrases and the idioms. It requires `build-extra.js` for the last two — that file is a library
and writes nothing of its own, since two builders emitting one deck under two ids is a silent swap for
anyone who has installed it. The titles, ids, units, tags and descriptions are all in `hsk30-meta.js`, so
the generator and the files on disk cannot come to disagree about what a deck is called.

It was ONE file of nine subdecks until Aug 2026 ("It shouldn't download the whole collection at once, its
cards should be divided into decks the same as the other collections"): that shape made every row on the
Collections page read 20.6 MB and made pressing any of them fetch all nine. What the one file bought — one
Add for the whole language — the collection banner's own + buys instead.

`extras.js` is **both a script and a module**: required, it runs down to the pool and the segmenter and
stops, which is how `build-extra.js` gets the same corpus, the same traditional-script exclusions and the
same sentence selection as the vocabulary decks rather than a second copy of them.

## The order, the pinned ids and the three beginner decks (Nov 2026)

The nine decks cannot be rebuilt — `w26-*.json`, the generator's inputs, are not in the repo — so since Sep
2026 every change to them goes through `mandarin-fix.js` and its record, `mandarin-fixes.json`. The
beginner pass (`docs/mandarin-review.md`) added three things on that model.

    node mandarin-fix.js --check        # the nine decks carry their fixes, their order and their pinned ids
    node build-beginner.js --check      # the three beginner decks are what the tables and the decks give

| file | what it is |
|---|---|
| `mandarin-ids.json` | deck id → headword (or key) → the number in the card's id. **Never delete or renumber a row**: the Update press merges a reader's progress by id. A new note takes the next free number. |
| `mandarin-order.json` | deck id → the full list of headwords, in the order the deck is dealt. Applied by `mandarin-fix.js`, which moves a note with its id and rewrites `num`. May be edited by hand; a list that is not exactly the deck's headwords is refused. |
| `mandarin-order.js` | how that file was computed (the rules are in its header): Level 1's hand-written head, then frequency over the nine decks' own sentences, confusable notes forty apart; the phrases by reading level. Re-run it on purpose, never as a side effect. |
| `build-beginner.js` | writes `Mandarin-Pinyin-and-Tones`, `Mandarin-Bopomofo` (2026-11-16), `Mandarin-Level-1-Character-Parts` and `Mandarin-First-Phrases`. **Reads no live source**: only the shipped Level 1 to 3 decks and the three tables below. Re-run it after `mandarin-fix.js` changes Level 1, 2 or 3. |
| `beginner-pinyin.json` | the sounds: IPA and descriptions quoted from two Wikipedia articles at the revisions it names. A row's `key` is what its id is pinned to. |
| `beginner-bopomofo.json` | the bopomofo symbols: origin, IPA, pinyin and notes quoted from Wikipedia's "Bopomofo" at the revision it names; `pin` points at the `beginner-pinyin.json` row whose description a card shows. A row's `key` is what its id is pinned to. |
| `beginner-phrases.json` | the first phrases: hand-chosen CC-CEDICT headwords with the reading as printed and the senses to carry; `trad` and `senses` are captured from CC-CEDICT by `build-beginner.js --capture <cedict file>` and never typed. |

`mandarin-fix.js` leaves the four beginner decks alone (they are not in its record) but still holds them to
their pinned ids. To add a first phrase: add a row (`w`, `c`, `py`, `pick`), fetch CC-CEDICT, run
`--capture`, then build — a headword CC-CEDICT lacks, one using a character Level 1 does not, or one
already carded in the nine decks is refused. After any of this, `node .claude/build-lang-decks.js`.

## The Spanish decks: the record, the order, the pinned ids and the sounds deck (Nov 2026)

The DELE decks CAN be rebuilt (`.claude/dele/`, Python, 1.2 GB of live corpora), which is why every edit
to them is in a record that is re-applied after a rebuild. The beginner pass (`docs/lang-decks.md`, "The
Spanish beginner pass") added the Mandarin model's three files, with one difference: **the pin is APPLIED**,
so a rebuilt deck, which the generator numbers by position, is numbered back.

    node spanish-fix.js --check            # the seven decks carry their fixes, their order and their pinned ids
    node build-spanish-sounds.js --check   # the sounds deck is what its table and DELE A1 give

| file | what it is |
|---|---|
| `spanish-fixes.json` | the record: one entry per note, `insert` for a card the generator has not got, `dropDup` for a card a lower deck now carries, `hints`, and each deck's subtitle and description edits. |
| `spanish-ids.json` | deck id → headword (a sounds row's key) → the number in the card's id. **Never delete or renumber a row.** A removed note's row moves to `_retired`; a rename renames the key. |
| `spanish-order.json` | deck id → the full list of headwords in the order the deck is dealt (DELE A1, the phrases). May be edited by hand; a list that is not exactly the deck's headwords is refused. |
| `spanish-order.js` | how that file is computed, from the PINNED NUMBER (the generator's frequency rank) and never from the file's own order: A1's hand-written head, the closed sets, look-alikes forty apart; the phrases by reading level. `--report` prints the measurements. |
| `spanish-sounds.json` | the sounds table: rows quoted from one Wikipedia article at the revision it names. A row's `key` is what its id is pinned to. |
| `build-spanish-sounds.js` | writes `Spanish-Sounds-and-Spelling`. **Reads no live source**: the table and the shipped A1 deck. |

`spanish-fix.js` finds its decks by CARD TYPE (`dele`), so the phrases deck is covered and a Spanish deck
of another type is left alone. To add a word to A1: an `insert` entry (the next free id, its senses, three
sentences each naming where it came from in `why`), `spanish-fix.js`, then add the headword to the head in
`spanish-order.js` or let it fall where its `after` puts it, `spanish-order.js`, `spanish-fix.js` again,
`build-spanish-sounds.js` (A1's order decides its example words), and `node .claude/build-lang-decks.js`.

## The Italian decks: two records, the order, the pinned ids and the sounds deck (Nov 2026)

The eight Italian decks of card type `cils` were built by `.claude/cils/` (Python, about a gigabyte of live
corpora), and **can no longer be rebuilt as they are**: the third party's word list has been revised since
(`docs/lang-decks.md`, the `.claude/cils/` entry). So every change to them is in a record. The beginner pass
(`docs/lang-decks.md`, "The Italian beginner pass") added the Spanish model's files, with two differences:
**there are two records**, applied in a fixed order, and **a word is ONE NOTE with two card templates**, so
the pin is of note ids (a card id is the note id, plus `~2` for English → Italian).

    node paradigm-fix.js --check            # the folded paradigms (French, Italian and Portuguese decks; not in CI)
    node italian-fix.js --check             # the Italian record, the order and the pinned ids
    node build-italian-sounds.js --check    # the sounds deck is what its table and CILS A1 give

| file | what it is |
|---|---|
| `paradigm-fixes.json` | ONE CARD PER PARADIGM, **SHARED with the French and Portuguese decks** and applied FIRST by `paradigm-fix.js`: an article, a possessive, a demonstrative or lui / lei is one card listing its forms (`notes`, `fold`, `drop`). The Italian pass of Nov 2026 did not edit it; change it only for a folded paradigm, and never for anything the Italian record can say. |
| `italian-fixes.json` | the Italian record, applied SECOND by `italian-fix.js`: `insert` (a card the word list lacks: a moved card's six `fields` byte for byte with `from`, or `senses` / `forms` / `ex` with a source for every sentence), `decks.<id>.dropDup` (the card a lower deck now carries), `decks.<id>.dropForm` (a card that is only a form of another card, which must show it in its headword or Forms — the 28 feminine adjectives), `notes` (a field rebuilt on a generator card, or a rename with `word`), `decks.<id>.subtitle` and `descSub`. It never rebuilds a field the paradigm record rebuilds: the run fails if both name one. |
| `italian-ids.json` | deck id → headword (a sounds row's key) → the number in the note's id. **Never delete or renumber a row.** A removed note's row moves to `_retired` (71 of them); a rename renames the key. APPLIED, so a deck numbered by position is numbered back. |
| `italian-order.json` | deck id → the full list of headwords in the order the deck is dealt (CILS A1, the phrases). May be edited by hand; a list that is not exactly the deck's headwords is refused. A deck with no entry is dealt in the order of its pinned numbers. |
| `italian-order.js` | how that file is computed, from the PINNED NUMBER and never from the file's own order: A1's hand-written head, the closed sets (three placed at a note number), look-alikes forty apart; the phrases by reading level. It fails if a description's stated figures (`descSub`) no longer match the order. `--report` prints the measurements. |
| `italian-sounds.json` | the sounds table: cells and sentences quoted from three Wikipedia pages at the revisions it names, and the English Wiktionary's transcription of each hand-picked word. A row's `key` is what its id is pinned to. |
| `build-italian-sounds.js` | writes `Italian-Sounds-and-Spelling` (card type `itsound`). **Reads no live source**: the table and the shipped A1 deck. |

`italian-fix.js` finds its decks by CARD TYPE (`cils`), so the core vocabulary and the phrases are covered and
the sounds deck is left alone but held to its pin. To add a word to A1: an `insert` entry (the next free id
above 1008, its senses, three sentences each naming its Tatoeba ids in `src`, a `why`), `italian-fix.js`,
then name the headword in the head or in a set in `italian-order.js` (an insert with no place fails that
script), `italian-order.js`, `italian-fix.js` again, `build-italian-sounds.js` (A1's order decides its example
words), and `node .claude/build-lang-decks.js`. To move a word down from a higher deck: the same, with the
card's `fields` copied into the entry and a `dropDup` row on the deck it leaves. The counts a description
states are recounted on every run; a figure typed into a `descSub` is held to the order by `italian-order.js`.

## The German decks: the record, the order, the pinned ids, Goethe A2 and the sounds deck (Nov 2026)

Seven decks of card type `goethe`. `.claude/goethe/run.py` (Python, about 1.3 GB of live corpora) writes
two of them, A1 and A2; the shipped B1, the B2, C1 and C2 vocabulary and the phrases were supplied
ready-made, and A1 cannot be rebuilt byte for byte. So every change is in a record (`docs/lang-decks.md`,
"The German beginner pass"), on the Italian model: **a word is ONE NOTE with two card templates**, so the
pin is of note ids (a card id is the note id, plus `~2` for English → German).

    python3 ../goethe/case-order.py --check   # every case table runs Nominativ, Genitiv, Dativ, Akkusativ (not in CI)
    node german-fix.js --check                # the German record, the order and the pinned ids
    node build-german-sounds.js --check       # the sounds deck is what its table and Goethe A1 give

| file | what it is |
|---|---|
| `german-fixes.json` | the record: `insert` (a card a list lacks: a moved card's six `fields` byte for byte with `from`, or `senses` / `forms` / `ex` / `conjFrom` with a source for every sentence), `notes` (a field rebuilt on a card, or a rename with `word`), `decks.<id>.dropDup` (`headword → "<lower deck>/<its headword>"`, a card a lower deck carries), `dropForm` (a card that is only a form of another), `subtitle` and `descSub`. |
| `german-ids.json` | deck id → headword (a sounds row's key) → the number in the note's id. **Never delete or renumber a row.** A removed note's row moves to `_retired` (40 of them); a rename renames the key. APPLIED, so a deck numbered by position is numbered back. Goethe A2's rows were seeded from the generator's output of 2026-11-16. |
| `german-order.json` | deck id → the full list of headwords in the order the deck is dealt (Goethe A1, the phrases). May be edited by hand; a list that is not exactly the deck's headwords is refused. A deck with no entry is dealt in the order of its pinned numbers. |
| `german-order.js` | how that file is computed, from the PINNED NUMBER and never from the file's own order: A1's hand-written head, the closed sets (five placed at a note number), look-alikes forty apart; the phrases by reading level. It fails if a description's stated figures (`descSub`) no longer match the order. `--report` prints the measurements. |
| `german-sounds.json` | the sounds table: cells and sentences quoted from three Wikipedia pages at the revisions it names, and the English Wiktionary's transcription of each example word. A row's `key` is what its id is pinned to. |
| `build-german-sounds.js` | writes `German-Sounds-and-Spelling` (card type `desound`). **Reads no live source**: the table and the shipped A1 deck. |

`german-fix.js` finds its decks by CARD TYPE (`goethe`), as `case-order.py` does, so a German deck of
another type is left alone but held to its pin. **After a rebuild of A2** (the only level to rebuild):
`case-order.py`, then `german-fix.js`, `build-german-sounds.js`, `node .claude/build-lang-decks.js`; never
`run.py --level a1` or `--level b1`. To add a word to A1: an `insert` entry (the next free id above 797,
its senses, three sentences each naming its Tatoeba ids, a `why`), `german-fix.js`, then name the headword
in the head or in a set in `german-order.js` (an insert with no place fails that script),
`german-order.js`, `german-fix.js` again, `build-german-sounds.js`, and `node .claude/build-lang-decks.js`.
To move a word down from a higher deck: the same, with the card's `fields` copied into the entry and a
`dropDup` row on the deck it leaves. The counts a description states are recounted on every run; a figure
typed into a `descSub` is held to the order by `german-order.js`.

## The Portuguese decks: two records, the order, the pinned ids and the sounds deck (Nov 2026)

The seven Portuguese decks of card type `caple` are built by `.claude/caple/` (Python, about 750 MB of live
corpora that have been refreshed since), so every change to them is in a record. The beginner pass
(`docs/lang-decks.md`, "The Portuguese beginner pass") added the Italian model's files: **two records**,
applied in a fixed order, and **a word is ONE NOTE with two card templates**, so the pin is of note ids (a
card id is the note id, plus `~2` for English → Portuguese).

    node paradigm-fix.js --check               # the folded paradigms (shared with French and Italian; not in CI)
    node portuguese-fix.js --check             # the Portuguese record, the order and the pinned ids
    node build-portuguese-sounds.js --check    # the sounds deck is what its table and CAPLE A1 give

| file | what it is |
|---|---|
| `paradigm-fixes.json` | SHARED, applied FIRST: one card per paradigm (`ele, ela`, `meu, minha`). The Portuguese pass did not edit it. |
| `portuguese-fixes.json` | the Portuguese record, applied SECOND by `portuguese-fix.js`: `insert` (a moved card's six `fields` byte for byte with `from`, or `senses` / `forms` / `ex` with a source for every sentence), `decks.<id>.dropDup` and `dropForm`, `notes` (`senses`, `forms`, `ex`, `exDrop`, `exAdd`, or a rename with `word`), `subtitle` and `descSub`. Every meaning is Wiktionary's; every `src` names a Tatoeba id and how the sentence was judged European. |
| `portuguese-ids.json` | deck id → headword (a sounds row's key) → the number in the note's id. **Never delete or renumber a row.** A removed note's row moves to `_retired` (33 of them); a rename renames the key. APPLIED, so a deck numbered by position is numbered back. |
| `portuguese-order.json` | deck id → the full list of headwords in the order the deck is dealt (CAPLE A1, the phrases). May be edited by hand; a list that is not exactly the deck's headwords is refused. A deck with no entry is dealt in the order of its pinned numbers. |
| `portuguese-order.js` | how that file is computed, from the PINNED NUMBER: A1's hand-written head, the closed sets (three placed at a note number), look-alikes forty apart; the phrases by reading level inside each of their two subdecks. It fails if a description's stated figures (`descSub`) no longer match the order. `--report` prints the measurements. |
| `portuguese-sounds.json` | the sounds table: cells, notes and sentences quoted from two Wikipedia pages at the revisions it names, and Wiktionary's Portugal transcription of each A1 word. A row's `key` is what its id is pinned to. |
| `build-portuguese-sounds.js` | writes `Portuguese-Sounds-and-Spelling` (card type `ptsound`). **Reads no live source**: the table and the shipped A1 deck. |

`portuguese-fix.js` finds its decks by CARD TYPE (`caple`). To add a word to A1: an `insert` entry (the next
free id above 548, its senses, three sentences each naming its Tatoeba id and its judgement in `src`, a
`why`), `portuguese-fix.js`, then name the headword in the head or in a set in `portuguese-order.js` (an
insert with no place fails that script), `portuguese-order.js`, `portuguese-fix.js` again,
`build-portuguese-sounds.js` (A1's order decides its example words), and `node .claude/build-lang-decks.js`.
A figure typed into a `descSub` is held to the order by `portuguese-order.js`; the counts are recounted on
every run.

## The Indonesian decks: the record, the order, the pinned ids and the sounds deck (Nov 2026)

Eight decks of card type `ukbi`: the seven UKBI levels and the phrases, written by `.claude/ukbi/run.py`
(Python, 178 MB of live corpora, one level per run on top of the shipped decks below it). A re-run is not
byte for byte the shipped deck (`docs/lang-decks.md`, "The Indonesian beginner pass"), so every change is in a
record applied after it, on the German model: **a word is ONE NOTE with two card templates**, so the pin is
of note ids (a card id is the note id, plus `~2` for English → Indonesian).

    node indonesian-fix.js --check             # the Indonesian record, the order and the pinned ids
    node indonesian-order.js --check           # indonesian-order.json is what the rules give
    node build-indonesian-sounds.js --check    # the sounds deck is what its table and UKBI 1 give

| file | what it is |
|---|---|
| `indonesian-fixes.json` | the record: `insert` (a moved card's five `fields` byte for byte with `from`, or `senses` / `forms` / `ex` with a source for every sentence), `notes` (`senses`, `forms`, `ex`, `exDrop`, `exAdd`, `hint`), `decks.<id>.dropDup`, `subtitle`, `descSub`, and `lead`, the paragraph put before the generator's own description, whose figures are tokens (`{days}`, `{first}`, `{day:<headword>}`, `{shelfDays}` …) filled on every run. Every meaning is the English Wiktionary's, with the register its sense is tagged with; every sentence names its Tatoeba id. |
| `indonesian-ids.json` | deck id → headword (a sounds row's key) → the number in the note's id. **Never delete or renumber a row.** A removed note's row moves to `_retired` (5 of them); APPLIED, so a deck numbered by position is numbered back. |
| `indonesian-order.json` | deck id → the full list of headwords in the order the deck is dealt (UKBI 1, the phrases). May be edited by hand; a list that is not exactly the deck's headwords is refused. A deck with no entry is dealt in the order of its pinned numbers. |
| `indonesian-order.js` | how that file is computed, from the PINNED NUMBER: UKBI 1's hand-written head, four closed sets each placed at a note number, a derived word never before its root; the phrases by reading level inside each of their three subdecks. `--report` prints the measurements. |
| `indonesian-sounds.json` | the sounds table: cells and sentences quoted from four Wikipedia pages at the revisions it names, three glosses of the English Wiktionary, and Wiktionary's transcription of each example word. A row's `key` is what its id is pinned to. |
| `build-indonesian-sounds.js` | writes `Indonesian-Sounds-and-Spelling` (card type `idsound`). **Reads no live source**: the table and the shipped UKBI 1 deck. |

`indonesian-fix.js` finds its decks by CARD TYPE (`ukbi`) and skips the combined one-file deck (`ukbiall`,
gitignored). **A level reads the shipped decks below it**, so do not rebuild a level as a side effect: a
rebuild of UKBI 2 or 3 now leaves out the words the record moved down (UKBI 1 carries them) and fills the
level with other words, which arrive unpinned, and a rebuild of UKBI 1 gives other sentences on 76 cards. To add a word to UKBI 1: an `insert`
entry (the next free id above 506, its senses, three sentences each naming its Tatoeba id, a `why`),
`indonesian-fix.js`, then name the headword in `HEAD` or in a set in `indonesian-order.js` or let it fall by
its number, `indonesian-order.js`, `indonesian-fix.js` again, `build-indonesian-sounds.js`, and
`node .claude/build-lang-decks.js`. To move a word down from a higher deck: the same, with the card's
`fields` copied into the entry and a `dropDup` row on the deck it leaves. The counts a description states
are recounted on every run, and a lead's figures are tokens, so none is typed.

## The Arabic decks: the same three files, kept in `.claude/arabic/` (Nov 2026)

The seven Arabic decks follow the German model — a record, a pin, an order, each with a `--check` — but
their files live beside their generator in `.claude/arabic/`, not here (`docs/lang-decks.md`, "The Arabic
beginner pass"): `arabic-fix.js` (`arabic-fixes.json`, `arabic-ids.json`), `arabic-order.js`
(`arabic-order.json`) and `build-arabic-alphabet.js` (`arabic-alphabet.json`). They find their decks by
card type (`arabic`, `ar-abc`), and unlike the German decks every Arabic level CAN be rebuilt byte for byte.

## The Bengali decks: the pinned ids, the order and the sourced alphabet deck (Nov 2026)

Seven decks: six of card type `bengali` (A1 to C1 and the phrases) and the alphabet (`bn-abc`, with its
rule cards `bn-rule`). Unlike the German or Portuguese decks they CAN be rebuilt byte for byte
(`.claude/bengali/run.py`, Python, 156 MB of cached sources), so the beginner pass (`docs/lang-decks.md`,
"The Bengali beginner pass") put every change to a card's CONTENT in the generator and left the record
three things: **a word is ONE NOTE with two card templates**, so the pin is of note ids (a card id is the
note id, plus `~2` for English → Bengali); the order; and the sentences of a description that state an
order or a pace. There is no `bengali-fixes.json`: nothing is edited by hand.

    node bengali-fix.js --check              # the pinned ids, the order, the computed sentences
    node build-bengali-alphabet.js --check   # the alphabet deck is what its table and the level decks give
    node ../bengali/check-bengali.js         # no word twice, no pointer gloss, every id the pinned one
    node ../bengali/check-update.js          # a browser: an old reader keeps ids and progress (not in CI)

| file | what it is |
|---|---|
| `bengali-common.js` | what the scripts share: finding the decks by CARD TYPE, a note's key (`Word`; an alphabet note's `Key`), the forms a card shows. |
| `bengali-ids.json` | deck id → key → the number in the note's id. **Never delete or renumber a row.** A removed note's row moves to `_retired` (10 of them); a note that returns takes its number back. APPLIED, so a deck the generator numbered by position is numbered back. Seeded from the decks at commit `2b3cf5c`. |
| `bengali-fix.js` | applies the pin and the order to the `bengali` decks and writes the computed sentences; `--pin` only numbers new notes; `--check` writes nothing. The alphabet deck is only checked here. |
| `bengali-order.json` | deck id → the full list of headwords in the order the deck is dealt (A1, A2, the phrases). May be edited by hand; a list that is not exactly the deck's headwords is refused. A deck with no entry is dealt in the order of its pinned numbers. |
| `bengali-order.js` | how that file is computed, from the PINNED NUMBER: A1's hand-written head and its closed sets (a set stands where its commonest member would, or begins at a note number; no set is split), A2's numbers, months and seasons, the phrases by reading level inside each subdeck. `--report` prints the measurements. |
| `bengali-alphabet.json` | the alphabet's table: cells and sentences of Wikipedia's Help:IPA/Bengali and "Bengali alphabet" at the revisions it names. **Written by `bengali-alphabet-quote.js`, never by hand.** A row's `key` is what its id is pinned to. |
| `bengali-alphabet-quote.js` | cuts that table out of the two pages' wikitext (its header has the two `curl` lines). Which letters, signs and rules get a card, and which passages stand on each, is chosen here: `ROWS`, `RULES`, `PASSAGES`. A template it does not know stops it. |
| `build-bengali-alphabet.js` | writes `Bengali-Alphabet`. **Reads no live source**: the table and the shipped level decks, whose cards are its example words. Applies the pin. |

**After any `run.py`** (each level reads the WORDS of the ones below it, so a1, a2, b1, b2, c1, phr in
that order): `bengali-fix.js --pin`, `bengali-order.js`, `bengali-fix.js`, `build-bengali-alphabet.js`,
`node .claude/build-lang-decks.js`. To add a word to A1: name it in `.claude/bengali/inventory.py` and
raise `TARGET['a1']` in `bengali_level.py` by one (a target left alone pushes the last fill word down the
shelf), run the levels, then the steps above; name it in the head or a set in `bengali-order.js` or it
falls after the frequency order by its new number. To change what a card says, change the generator; to
change what an alphabet card says, change `bengali-alphabet-quote.js` and re-cut the table.

## The Hindi decks: the record, the order and the pinned ids (Nov 2026)

Seven decks: six of card type `hindi` (A1 to C1 and the phrases) and the alphabet (`hi-abc`, with its
reading rules, `hi-read`). Unlike the German and Spanish decks they CAN be rebuilt byte for byte
(`.claude/hindi/run.py`, `alphabet.py`; 280 MB of live corpora, proved 2026-11-19), so the split is: **a
fault that is the generator's is repaired in the generator; a hand judgement is in the record**, applied
after it (`docs/lang-decks.md`, "The Hindi beginner pass"). The files live in `.claude/hindi/`, not here.

    node ../hindi/hindi-fix.js --check     # the decks are what the record, the order and the pin give
    node ../hindi/hindi-order.js --check   # hindi-order.json is what its rules give
    node ../hindi/check-hindi.js           # the pipeline's own faults; every id is its pinned number

| file | what it is |
|---|---|
| `hindi-fixes.json` | the record: `insert` (a card moved from another deck, its seven `fields` byte for byte with `from`; or a new one with `roman` / `senses` / `forms` / `ex`, every sentence naming its Tatoeba ids), `notes` (`exDrop`, `exOnly`, `hint`), `decks.<id>.dropDup` and `descSub`. |
| `hindi-ids.json` | deck id → key (a word's `Word`, a letter's `Letter`, a rule's `Key`) → the number in the note's id. **Never delete or renumber a row.** A removed note's row moves to `_retired` (28); a respelling renames the key. APPLIED, so a deck numbered by position is numbered back. |
| `hindi-order.json` | deck id → `order` (A1, A2, the phrases) and `facts`, the figures the descriptions state. A deck with no entry is dealt by pinned number. |
| `hindi-order.js` | how that file is computed, from the PINNED NUMBER (the generator's frequency rank): A1's hand-written head and three closed sets placed at a note number; A2's months together; the phrases by reading level. `--report` prints the measurements. |
| `hindi-fix.js` | applies all three, recounts every figure a description states, writes `{fact}` placeholders from the order. Idempotent: `--check` is "applying it changes nothing". |

**A rebuild**: `python3 ../hindi/run.py --level <x>` (any level alone — `hindi_level.words_below` reads the
record and counts a moved card where the generator dealt it), `python3 ../hindi/alphabet.py`,
`hindi-order.js` if a headword changed, `hindi-fix.js`, `node .claude/build-lang-decks.js`. To add a word
to A1: an `insert` entry (the next free id above 524, a `why`), name it in `HEAD` or a set in
`hindi-order.js` (an insert with no place fails that script), then the two scripts. To move a word down:
the same with the card's `fields` copied in and a `dropDup` row on the deck it leaves. A reading rule is
a row of `RULES` in `alphabet.py`, with its quote and revision.
## The Persian decks: the generator, then the record (Nov 2026)

Seven decks of card type `persian` and `fa-abc`. Unlike the German and Portuguese sets they CAN be rebuilt
byte for byte (`.claude/persian/run.py`, `alphabet.py`; the sentence pool is pinned), so their files live in
`.claude/persian/`, not here, and the rule has two halves (`docs/lang-decks.md`, "The Persian beginner pass"):
a fault of the generator is fixed in the generator and every level rebuilt; a move, an addition, an order, a
pinned number or a description's count is in the record.

    node ../persian/persian-fix.js --check     # the record, the order and the pinned ids
    node ../persian/persian-order.js --check   # persian-order.json is what its script computes
    node ../persian/check-persian.js           # the seven decks, card by card

| file | what it is |
|---|---|
| `persian-fixes.json` | the record: `insert` (a card MOVED down from a higher deck, `from: "<deck>/<word>"`, or BUILT for A1 by `run.py --level x1`, `from: "x1/<word>"`), `notes` (`leadSense`), `decks.<id>.dropDup`, `subtitle`, `descSub` with recounted tokens. |
| `persian-ids.json` | deck id → headword (a letter, for the alphabet) → the number in the note's id. **Never delete or renumber a row.** A removed note's row moves to `_retired`. APPLIED. |
| `persian-order.json` | deck id → the headwords in the order the deck is dealt (the alphabet, A1, A2, the phrases). Written by `persian-order.js` from the pinned numbers; B1 to C1 are dealt by pinned number. |

After a rebuild: `run.py --level x1 --no-fetch`, `persian-fix.js --refresh`, `persian-order.js`,
`persian-fix.js`, `node .claude/build-lang-decks.js`. To add a word to A1: name it in `inventory.X1`, run
`--level x1`, add an `insert` entry (`from: "x1/<word>"`, the next free id, a `why`), `--refresh`, then name
it in `HEAD` or a set in `persian-order.js` (an insert with no place fails that script).

## The Russian decks: the record, the order, the pinned ids, the alphabet and the sounds deck (Nov 2026)

Seven decks of card type `torfl` (TORFL A1 to C2 and the phrases), written by `.claude/torfl/run.py` (Python,
about 1.3 GB of live corpora) — and **a rebuild is not byte for byte** (measured 2026-11-19: A1 moved four
notes, the phrases 92), so every change is in a record (`docs/lang-decks.md`, "The Russian beginner pass"), on
the German model: **a word is ONE NOTE with two card templates**, so the pin is of note ids (a card id is the
note id, plus `~2` for English → Russian). The alphabet (`ru-abc`) and the sounds deck (`rusound`) are written
from one sourced table.

    node russian-fix.js --check             # the Russian record, the order and the pinned ids
    node build-russian-sounds.js --check    # the alphabet and the sounds deck are what their table and TORFL A1 give
    node ../torfl/check-torfl.js a1         # one deck read as a reader would (a1 … c2, phrases, alphabet)

| file | what it is |
|---|---|
| `russian-fixes.json` | the record: `insert` (a card's six `fields`, MOVED byte for byte with `from`, or BUILT by `../torfl/extra.py` with the Tatoeba ids of its sentences in `src`), `notes` (`senses`, `forms`, `table`, `tableFrom`, `ex`, `glossAdd` on a card the deck has), `decks.<id>.dropDup` (`Word → "<lower deck>/<its Word>"`), `subtitle` and `descSub`. A note's key is its `Word` field: the headword without stress, an aspect pair as `делать, сделать`. |
| `russian-ids.json` | deck id → `Word` (a letter, a sounds row's key) → the number in the note's id. **Never delete or renumber a row.** A removed note's row moves to `_retired` (21 of them). APPLIED, so a deck numbered by position is numbered back. |
| `russian-order.json` | deck id → the full list of `Word`s in the order the deck is dealt (TORFL A1, the phrases). May be edited by hand; a list that is not exactly the deck's headwords is refused. A deck with no entry is dealt in the order of its pinned numbers. |
| `russian-order.js` | how that file is computed, from the PINNED NUMBER: A1's hand-written head, four closed sets each placed at a note number, look-alikes forty apart; the phrases by reading level. It fails if a figure a `descSub` states (a set's note, the head's length, the days) no longer matches the order. `--report` prints the measurements. |
| `russian-merge-extra.js` | copies the cards `../torfl/extra.py` built (in the gitignored cache) into `russian-fixes.json`. Not a CI step. |
| `russian-sounds.json` | the table behind BOTH the alphabet and the sounds deck: cells, notes and sentences quoted from three Wikipedia pages at the revisions it names, and the English Wiktionary's transcription of each example word. A row's `key` is what its id is pinned to. |
| `build-russian-sounds.js` | writes `Russian-Alphabet` (`ru-abc`, two cards a letter) and `Russian-Sounds-and-Spelling` (`rusound`, one card a note). **Reads no live source**: the table and the shipped A1 deck. |

`russian-fix.js` finds its decks by CARD TYPE (`torfl`). **Never `run.py --level <x>` to refresh a deck.** To
add a word to A1: name it in `EXTRA` in `../torfl/extra.py` and run it (it needs the cache: `run.py` fetches
it), read the three sentences it prints, `russian-merge-extra.js`, then name the word in the head or in a set
in `russian-order.js` (an insert with no place fails that script), `russian-order.js`, `russian-fix.js`,
`build-russian-sounds.js` (a meaning or a stress it shows is A1's) and `node .claude/build-lang-decks.js`. To
move a word down from a higher deck: an `insert` with the card's `fields` copied and `from`, and a `dropDup` row
on the deck it leaves. Every bracket of an English side that prints the card's own Russian word is wrapped and
hidden on the English → Russian card by `russian-fix.js` itself, on every run.

## The Urdu decks: the generator, the record, the pinned ids and the order (Nov 2026)

Six decks: the alphabet (card type `ur-abc`) and A1, A2, B1, B2 and the phrases (card type `urdu`). They
differ from the decks above in one thing: **the generator (`.claude/urdu/`, Python, a 150 MB cache) rebuilds
them byte for byte**, which was proved before the pass and after it (`docs/lang-decks.md`, "The Urdu
beginner pass"). So a fault the generator can fix is fixed THERE, and the record holds only what is a
decision about one card or one order: which cards move down a level, which are added, the order, the end
of each description. **A word is ONE NOTE with two card templates**, so the pin is of note ids (a card id
is the note id, plus `~2` for English → Urdu).

    node urdu-fix.js --check                  # the six decks are what the record, the pin and the order make of them
    node urdu-order.js --check                # the order file is what its rules give
    node ../urdu/check-urdu.js                # no word on two levels, pinned ids, one romanisation scheme
    python3 ../urdu/inserts.py --check        # the record's added cards are what the generator's code builds (needs the cache; not in CI)
    python3 ../urdu/alphabet.py --verify      # every sound and rule of the alphabet deck is in its pinned Wikipedia revision (not in CI)

| file | what it is |
|---|---|
| `urdu-fixes.json` | the record. `add`: deck id → rows, each `word`, `id` and `why`, and either `from` (a MOVE: the generator deals the card to that deck; `urdu-fix.js` takes it out of there whole, so a generator fix reaches it) or `fields` and `src` (an INSERT: a card no deck had). **`add` is written by `../urdu/inserts.py`, never by hand** — its lists are at the top of that script. `decks`: each deck's `subtitle` template, `descSub` pairs, and `tail`, the paragraph that ends its description and is recounted on every run. |
| `urdu-ids.json` | deck id → headword (for the alphabet, the letter as printed) → the number in the note's id. **Never delete or renumber a row.** A note that leaves a deck has its row moved to `_retired` (72 of them) by the move's own row. APPLIED, so a deck the generator has just numbered by position is numbered back. A new alphabet note gets its row here by hand; a new word card gets it from its `add` row. |
| `urdu-order.json` | deck id → every headword in the order the deck is dealt (A1, A2, the phrases). Written by `urdu-order.js`; a list that is not exactly the deck's headwords is refused. A deck with no entry (B1, B2, the alphabet) keeps the order the generator wrote. |
| `urdu-order.js` | how that file is computed, from the PINNED NUMBER (the generator's frequency rank) and never from the file's own order: A1's hand-written head of 75, the closed sets at stated note numbers, a sentence after its rarest word; A2 with the compound numbers last; the phrases by reading level. A card the record added to A1 that is named nowhere is an error. `--report` prints where everything fell. |
| `urdu-fix.js` | applies all three, in this order: the moves and inserts, the dup check, the ids, the order, the subtitles and descriptions. Writes Python's `json.dump` bytes, so a deck it has nothing to say about is not rewritten. |
| `../urdu/inserts.py` | builds the `add` rows: checks every move against the generator's selection, and builds an insert's fields with `build_deck.py`'s own functions from kaikki (the months), `lex.json` (the numbers) or Tatoeba by sentence id (two phrase cards, romanised by joining Wiktionary's romanisation of each word). |

`urdu-fix.js` finds its decks by CARD TYPE (`urdu`, `ur-abc`). **A rebuild**, after any change to the
generator: `python3 ../urdu/run.py --level a1` … `a2`, `b1`, `b2`, `phr` (all five: a moved card lives in
the deck it came from until `urdu-fix.js` moves it, and is not stored in the record), `../urdu/alphabet.py`,
`../urdu/inserts.py`, `urdu-fix.js`, `urdu-order.js`, `urdu-fix.js` again, `node .claude/build-lang-decks.js`.
`urdu_level.words_below` reads the record, so each level is dealt the list it was dealt before anything
moved. To move a word down: add it to a list at the top of `inserts.py`, run the sequence from
`inserts.py` on, and name it in the head or a set of `urdu-order.js` if it lands in A1. To add a letter or
a sign to the alphabet: a row of `LETTERS` in `alphabet.py` whose comparison is a cell of the key and
whose rule is a quoted phrase (`--verify`), and its number in `urdu-ids.json`.

## The Turkish decks: the generator, the record, the pinned ids, the order and the sounds deck (Nov 2026)

Seven decks: A1, A2, B1, B2, C1 and the phrases (card type `turkish`) and the sounds deck (card type
`trsound`). As with Urdu, **the generator (`.claude/turkish/`, Python, a 770 MB cache) reproduces the six
word decks** — proved before the pass with every source fetched fresh (`docs/lang-decks.md`, "The Turkish
beginner pass": 3 sentences and 11 positions of 4,776 notes differed, each traced to Tatoeba's export having
moved). So a fault the generator can fix is fixed THERE, and the record holds only what is a decision about
one card or one order: which cards move down to A1, which are added, the order, the end of each description.
**A word is ONE NOTE with two card templates**, so the pin is of note ids (a card id is the note id, plus
`~2` for English → Turkish).

    node turkish-fix.js --check               # the decks are what the record, the pin and the order make of them
    node turkish-order.js --check             # the order file is what its rules give
    node build-turkish-sounds.js --check      # the sounds deck is what its table and Turkish A1 give
    node ../turkish/check-turkish.js          # no word on two decks, pinned ids, known forms labels, balanced markup
    python3 ../turkish/inserts.py --check     # the record's added cards are what the generator's code builds (needs the cache; not in CI)
    python3 ../turkish/sounds.py --verify     # every cell and quotation of the sounds table is in its pinned Wikipedia revision (not in CI)

| file | what it is |
|---|---|
| `turkish-fixes.json` | the record. `add`: deck id → rows, each `word`, `id` and `why`, and either `from` (a MOVE: the generator deals the card to that deck; `turkish-fix.js` takes it out of there whole, so a generator fix reaches it) or `fields` and `src` (an INSERT: a card no deck had). **`add` is written by `../turkish/inserts.py`, never by hand** — its lists are at the top of that script. `decks`: each deck's `subtitle` template, `descSub` pairs, `hints` (a reverse-card label, `not <the other word>`, on two cards the record brought together) and `tail`, the paragraph that ends its description and is recounted on every run. |
| `turkish-ids.json` | deck id → headword (for the sounds deck, the row's `key`) → the number in the note's id. **Never delete or renumber a row.** A note that leaves a deck has its row moved to `_retired` by the move's own row. APPLIED, so a deck the generator has just numbered by position is numbered back. Seeded on 2026-11-26 from the six decks as shipped (4,776 rows, each equal to its position). |
| `turkish-order.json` | deck id → every headword in the order the deck is dealt (A1, the phrases). Written by `turkish-order.js`; a list that is not exactly the deck's headwords is refused. A deck with no entry (A2 to C1) is dealt in the order of its pinned numbers. |
| `turkish-order.js` | how that file is computed, from the PINNED NUMBER (the generator's frequency rank as first shipped) and never from the file's own order: A1's hand-written head of 100, the closed sets at stated note numbers; the phrases by reading level inside each subdeck. A card the record added to A1 that is named nowhere is an error. `--report` prints where everything fell. |
| `turkish-fix.js` | applies all three, in this order: the moves and inserts, the dup check, the ids, the order, the hints, the subtitles and descriptions. Writes Python's `json.dump` bytes, so a deck it has nothing to say about is not rewritten. Holds the sounds deck to its pin and counts it on the shelf; never writes it. |
| `turkish-sounds.json` | the sounds table: cells and sentences quoted from three Wikipedia pages at the revisions it names, and the English Wiktionary's transcription of each example word (written by `../turkish/sounds.py --fill`). A row's `key` is what its id is pinned to. A rule's table of forms is not stored: `pairsFrom` names A1 cards and `cells` the labels of their Forms rows. |
| `build-turkish-sounds.js` | writes `Turkish-Sounds-and-Spelling` (card type `trsound`). **Reads no live source**: the table and the shipped A1 deck. |
| `../turkish/inserts.py` | builds the `add` rows: checks every move against the pin, and builds an insert's five fields with `build_deck.py`'s own functions from kaikki, its sentences found by `examples.py` (level `ins`). |

`turkish-fix.js` finds its decks by CARD TYPE. **A rebuild**, after any change to the generator:
`python3 ../turkish/run.py --level a1` … `a2`, `b1`, `b2`, `c1`, `phr` (all six: a moved card lives in the deck it
came from until `turkish-fix.js` moves it, and is not stored in the record), `../turkish/inserts.py`,
`turkish-fix.js`, `turkish-order.js`, `turkish-fix.js` again, `build-turkish-sounds.js`, `turkish-fix.js` a
third time (the sounds deck's days are in every tail), `node .claude/build-lang-decks.js`. `tr.words_below`
reads the record, so each level — and the phrases deck — is dealt the list it was dealt before anything
moved. To move a word down: add it to `MOVES` at the top of `inserts.py`, run the sequence from `inserts.py`
on, and name it in the head or a set of `turkish-order.js` if it lands in A1. To add a card no deck has: a
row of `INSERTS` (the English Wiktionary must have a live entry for it; a phrase entry of one word counts).
To add a letter or a rule to the sounds deck: a row of `turkish-sounds.json` whose cells and sentences are
quoted (`sounds.py --verify`), `sounds.py --fill`, `build-turkish-sounds.js`.

## Changing the card type's CSS

`deckcore.js` holds it, and every built deck file carries a **copy** — so an edit there does not reach a
reader until the decks are rebuilt. Rebuilding needs the 130 MB of source corpora above; where only the CSS
has changed, the shipped files can be patched instead, and the way to do it safely is a **string replacement
on the raw JSON** rather than parsing and re-serialising:

    node -e '
    const fs=require("fs"), fresh=require("./deckcore.js").TYPE.css, enc=s=>JSON.stringify(s).slice(1,-1);
    for (const f of fs.readdirSync("../../decks").filter(x=>x.includes("Mandarin"))) {
      const p="../../decks/"+f, raw=fs.readFileSync(p,"utf8");
      const cur=Object.values(JSON.parse(raw).meta.types)[0].css;
      if (cur===fresh) continue;
      if (raw.split(enc(cur)).length-1 !== 1) { console.log("REFUSED",f); continue; }
      fs.writeFileSync(p, raw.replace(enc(cur), enc(fresh)));
    }'

Two reasons it is done that way. The three files are written with **different formatters** — `build-mandarin.js`
uses `JSON.stringify(deck)` and the other two `JSON.stringify(deck, null, 1)` — so re-serialising the wrong one
rewrites all 20 MB. And the refusal matters: replacing a string that occurs more than once would rewrite
something that is not the type's CSS.

Check afterwards that **only** `meta.types.<id>.css` moved, by diffing the parsed objects field by field —
and check the CARDS are byte-identical while you are there, since that is the half a bad replacement would
break. It has been done twice (the Aug 2026 `.uc-exst` change and the `PINYIN_FONT` one the day after), and
both times all three decks carried CSS byte-identical to `deckcore.js` beforehand, which is what makes the
patch provably the same edit as a rebuild.

`test-deck-ux.js`'s section 7 asserts the shipped files carry the pinyin rule, so a rebuild that loses it
fails there rather than on somebody's card.

## The two files to read before changing anything

`deckcore.js` holds the card type — one type, two templates, so a word is one note asked in both
directions — and every field builder. `phrasepick.js` holds the rule that decides whether a CC-CEDICT
entry is a phrase, an idiom or a word, and records the versions of that rule that were tried and measured
and thrown away. The findings that cost the most to get are written into those two files and into the
`decks/` entry in `CLAUDE.md`.

## Checking them

    node check-decks.js      # imports every deck in decks/, studies it, reads what is on the card
    node check-reverse.js    # the reverse card: a two-note cut, studied all the way through
    node check-nesting.js    # nested subdecks and the cascade, on a deck built in memory

Both need Playwright, which is a dev dependency and must not be installed into the repo — install it in a
scratch directory and run with `NODE_PATH=<that>/node_modules`, as `.claude`'s other browser tests do.

Two things they exist to catch, and neither shows up in any count. **After a reveal BOTH sides of the card
are in the document** — the front stays, hidden by CSS, because the back renders `{{FrontSide}}` — so the
back is the LAST `.uc-card` and never the first; reading the first one reports a card with no reading, no
definition and no character breakdown, which is exactly what a broken template would look like. And **the
reverse card is not reachable by grading Good**: that sends a new card to its ten-minute learning step and
straight back into the queue, so a four-card run of Goods deals the same two words twice.

`check-nesting.js` is the third, and it does not touch `decks/` at all — it builds its decks in memory. Its
first four sections use an eight-note deck whose cards name PATHS (`Level 1/Chinese to English`) and assert
the two things a curated collection has always done and the reader's own decks now do too: the Collections
page draws the tree, indented and counting its children's cards, and adding the deck puts every subdeck on
the home page — with removing it taking them all away again, and adding one branch bringing only that
branch.

Its **fifth section is direction as a subdeck**, on a six-note deck with a two-template type. That is the
level BELOW the subdeck — a word is one note with two cards, so `sub` can never name the direction and the
template does — and it needs no change to a deck file, which is what the section is really pinning. Three
of its assertions cover failures nothing else would see: a direction row drawn over a container that only
groups (the same cards offered a third time), the deck file having to change after all, and — the one that
matters — studying a direction dealing **three cards all ending `~2`** rather than the level's six.

It also pins that **adding a deck brings its levels and NOT their directions**, which is the narrower half
of the cascade: a direction holds a subset of its own parent's cards, so adding it too would surface
reverses in the pooled draw from the first day. `check-decks.js` is what caught that, studying the shipped
decks through the review, and it is the check to re-run after any change to the cascade.

The **sixth section is the pairing switch** — *Both directions together*, on a deck's own options. Off (the
default) the day's new cards are all forward; on, they are the day's new WORDS each way, shuffled, and
burying is derived off so the reverse is not taken straight back out. Its seeding is worth copying: writing
localStorage behind the app's back needs a real `reload()`, because a `goto` differing only in the
`#fragment` is a same-document navigation and the next `save()` puts the in-memory state back over it.
