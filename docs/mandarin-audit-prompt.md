# The Mandarin card-by-card audit — the prompt, and what it rests on

**READ BEFORE OPENING A BATCH OF THE MANDARIN CARD-BY-CARD AUDIT.** It holds the paste-ready prompt,
the measured baseline the prompt's triage order is built from, and the four traps that make a
well-meant sweep of these decks destructive. The prompt is in the fenced block under
*The prompt* — paste that, and nothing else, into a fresh session.

This is the sibling of `mandarin-review.md`, which is the RECORD of the passes already run. That file
says what was measured and repaired; this one says how to run the next pass. Read its *What is still
open* and *Ten more ways* sections before the first batch — three of this audit's five requests were
measured there and two of them turned out to be mostly already true, which is the sort of thing worth
knowing before spending a batch on it.

## Why this is a batched pass and not a single job

The nine decks hold **11,532 notes** — run `node .claude/decks/check-mandarin-coverage.js` for the
figure rather than trusting this sentence. At two cards a note that is some 23,000 cards. A genuine
card-by-card read is a grind of the same shape as the three-example pass recorded in
`mandarin-review.md`, which took thousands of authored sentences to finish; it cannot be done in one
sitting and must not be attempted as one. So the prompt below defines a **batch** — one contiguous
slice of one deck — and a **log**, so a session that runs out of room leaves the next one a place to
start rather than a guess.

**The triage order in the prompt is not arbitrary.** It puts the checkers' existing findings first,
then Levels 7–9, then everything else, because that is where the measurement says the faults are.

## The baseline, measured 2026-09-17

Every figure here was produced by a committed checker on the shipped decks, and every one of them will
move. **Re-run the checker rather than quoting this table** — it is a record of one day, kept so the
next session can tell a fault it has introduced from one it has inherited.

| what | tool | reading on the day |
|---|---|---|
| notes with three example sentences | `check-mandarin-coverage.js` | 11,532 of 11,532 — **100%**, all nine decks |
| notes showing the same CHINESE sentence twice | `check-mandarin-coverage.js` | 0 |
| notes showing the same ENGLISH translation twice | `check-senses.js` | **154** |
| examples that may not contain their own headword | `check-example-fit.js` | **144** (0.42% of 34,596 sentences) |
| pinyin against the same card's bopomofo | `check-pinyin.js` | **clean** — 11,469 cross-checked, 63 unskippable |
| single-character cards on a minority reading | `check-say-reading.js` | 10, of which **1** carries no `Say` (咽) |
| glosses matching a neighbouring card's dictionary entry | `check-gloss-source.js` | **24** |
| notes not found in CC-CEDICT at all | `check-gloss-source.js` | 2 |
| still-ambiguous reverse cards | `check-mandarin-coverage.js` | **0** (708 notes carry a `not X` hint) |
| the fixes record applied and idempotent | `mandarin-fix.js --check` | ok — 6,809 fixes, 708 hints, 11 deck edits |

Two measurements that are not in any checker and that the prompt acts on:

**THE GLOSS REGISTER OF LEVELS 7–9 IS NOT THE COLLECTION'S.** Counted over every `uc-sense` in the
nine decks, **731 senses are a single capitalised English word — and 721 of them are in
`hsk30l7`**; **2,606 verb senses do not begin "to ", and 1,844 of those are in `hsk30l7`** as well.
The shape is 爱慕 glossed *Love* where the dictionary has *to adore; to admire*, 发源 as *Origin*
against *to rise; to originate*, 骨骼 as *Bone* against *bones; skeleton*, 费力 as *Strenuous*
against *to expend a great deal of effort*. A capitalised abstract noun standing for a verb is not
the commonest English definition of the word — it is a label — and it is the single largest
concentration of the first request in the collection. It is a fault of ONE DECK and can be worked
deck-first for that reason.

**THE CHARACTER PANEL IS EMPTY FOR MOST OF THE CARDS IT IS FOR.** `charNeighbours` in app.js lists
the other words in **the deck the card is in** that use a tapped character. Of the **1,503**
single-character notes, **639 have no other word in their own deck containing the character** — so
the panel says *No other word in this deck uses it* for 42% of them — and **1,160 have fewer than
three**. Across the whole nine-deck collection there are on average **8.7 more** per character. So
the fifth request below is not a second copy of the panel; it is the section the panel cannot be,
because a panel derived from one downloaded deck is bounded by what the reader happens to have.

## The four traps

**1. THE DECK FILES ARE NOT HAND-EDITED, EVER.** The Mandarin generator inputs (`w26-*.json`) are not
in this repo, so these nine decks cannot be regenerated: an edit made straight into a
`decks/Mandarin-*.folio-deck.json` is permanent and leaves no record of which of 11,532 notes moved
or why. **`.claude/decks/mandarin-fixes.json` is the record and `mandarin-fix.js` applies it.** Read
that script's header before the first batch — it is the specification of every field the record takes.

**2. THREE OF THE FIVE REQUESTS HAVE A MEASURED "DO NOT SWEEP" ATTACHED.** `mandarin-review.md`
measured them and the prompt carries the conclusions: **3,608 glosses joined by semicolons are mostly
synonym lists and must stay joined**; **1,487 notes naming two parts of speech against one gloss are
mostly zero-derivation and not missing a sense** (a Chinese adjective IS a stative verb); and **a
blanket pinyin-against-bopomofo tone sweep returns 231 disagreements of which almost none are errors**
— about 123 are 不/一 sandhi and about 100 mainland-against-Taiwan neutral-tone variance. Each of
these looks like several hundred cards of easy work and is several hundred cards of damage.

**3. A NEW FIELD IS ADDED IN THREE PLACES OR IN NONE.** The card type's `fields` list, the template
that renders it, and the type's scoped CSS — which `decks.<id>.addFields` in the record does together
— **and the whitelist array in `mandarin-fix.js` that decides which keys a note entry may set**
(`["Pinyin", "Bopomofo", "Say", "Measure word", "Literally", "Origin", "Examples"]`). Miss the
template and the field is stored and shown nowhere; miss the whitelist and the column is created and
never filled. Both are silent. `Literally` and `Origin` are the worked precedent, in
`fixes.decks.hsk30idm`.

**4. A CHECKER HERE IS A PROXY UNLESS IT SAYS OTHERWISE.** `check-senses.js` trips on 23% of the
corpus by design and is a ranked review list; `check-example-fit.js` runs about 57% precision;
`check-say-reading.js` reports a card that teaches BOTH readings as a finding. Reading the card is
the step, not running the tool. The two that are exact and may be treated as gates are
`check-pinyin.js` and `mandarin-fix.js --check`.

## The prompt

```
Audit the Mandarin vocabulary decks card by card, one batch at a time, and repair what you find.

FIRST, ORIENT YOURSELF. Read, in this order:
  - the Mandarin bullets in CLAUDE.md (mandarin-fixes.json, the six checkers, the character network)
  - docs/mandarin-audit-prompt.md   — the baseline, the triage order and the four traps
  - docs/mandarin-review.md          — what earlier passes already measured and repaired
  - the header of .claude/decks/mandarin-fix.js — the spec of every field the record takes
Then run, and read, the current state rather than trusting any figure written down:
  node .claude/decks/mandarin-fix.js --check
  node .claude/decks/check-pinyin.js
  node .claude/decks/check-mandarin-coverage.js
  node .claude/decks/check-say-reading.js
  node .claude/decks/check-senses.js
  node .claude/decks/check-example-fit.js --all
  node .claude/decks/check-gloss-source.js --all
(The last four are REPORT-ONLY PROXIES and a fair share of their findings are correct cards. Read the
card before changing it. check-gloss-source.js fetches CC-CEDICT once into .claude/.cedict.txt.)

THE ONE WAY THESE DECKS ARE EDITED is .claude/decks/mandarin-fixes.json, applied by
.claude/decks/mandarin-fix.js. Never edit a file under decks/ by hand: the generator inputs are not
in this repo, so an undocumented edit can never be told from a bug. Every entry carries a `why` that
says what was wrong and what the correction rests on, and an authored example says that it is
authored. Finish every batch with `node .claude/decks/mandarin-fix.js` and then `--check`.

WHAT TO ASK OF EVERY CARD IN THE BATCH, in this order. Read the whole note — headword, pinyin,
bopomofo, senses, measure word, character block and all three examples — and then:

1. IS THE DEFINITION THE COMMONEST ENGLISH DEFINITION OF THE WORD?
   Compare against the card's own CC-CEDICT entry (.claude/.cedict.txt, or check-gloss-source.js,
   which reports a gloss that has drifted onto a neighbouring card's entry). CC-CEDICT lists its
   senses commonest-first, so its leading sense is the benchmark; where it and the card disagree,
   the card must have a reason. Fix with `gloss` (one sense, wording only) or `glossAll`/`senses`.
   Three specific things to correct wherever the batch meets them:
     - a gloss that is a single capitalised abstract noun standing in for a verb ("Love", "Origin",
       "Bone", "Strenuous"). These are concentrated in Levels 7–9. A verb's gloss begins "to ".
     - a gloss that is the dictionary's whole entry pasted in, where the card should teach the
       leading sense or two.
     - a gloss so general it fits a dozen words ("Situation", "Condition") where the word is specific.
   DO NOT split the 3,608 semicolon glosses or the 1,487 two-part-of-speech notes as a class — both
   were measured and are mostly right. Split one only when the card in front of you is genuinely
   teaching one sense and testing another.

2. DOES THE DEFINITION MATCH THE SENSE THE EXAMPLES SHOW?
   This is the fault check-senses.js ranks. Where the examples agree with each other and disagree
   with the gloss, the gloss is usually the thing that is wrong. Where the note really teaches two
   senses and the sentences show different ones, do not rewrite either — tag them with `exSense`,
   which numbers each example with the sense it shows. Only where the senses are genuinely different:
   tagging a sentence as sense 3 of 5 near-synonyms is noise dressed as information.

3. IS THE PINYIN RIGHT, AND IS IT WHAT THE READER WILL HEAR?
   check-pinyin.js cross-checks every reading against the same card's bopomofo and is exact; keep it
   clean. What it cannot see, and you must:
     - VOWEL SPELLING. `luè` for `lüè` passes a boundary check and is wrong. check-gloss-source.js's
       reading half catches these against the dictionary.
     - ERHUA. 那儿 is `nàr`, one syllable, not `nà ér`. The zhuyin decides: ㄦ˙ is a suffix, ㄦˊ a
       syllable of its own.
     - WHAT THE SPEAKER WILL SAY. The card hands the engine its CHARACTERS, so a lone polyphonic
       character falls back to its commonest reading — 了 read `liǎo`, 差 read `chā`. The repair is a
       `Say` field carrying the shortest ordinary word that pins the reading (了 as 好了, 差 as 还差).
       check-say-reading.js ranks the candidates; a card that teaches BOTH readings is not a fault.
   DO NOT run a blanket tone comparison between pinyin and bopomofo. It returns 231 disagreements of
   which almost none are errors: 不/一 sandhi and mainland-against-Taiwan neutral tones.

4. DOES THE CARD CARRY THREE GOOD EXAMPLE SENTENCES?
   All 11,532 notes already carry three, so the work here is quality, not coverage. Check that:
     - each sentence actually CONTAINS the headword as a word, rather than having its characters
       split across two other words (check-example-fit.js ranks these; 一一 is illustrated by
       今年是二零一一年, where the bold is the digits of a year) or standing inside a longer word.
     - no two of the three carry the SAME English translation. check-mandarin-coverage.js compares
       the Chinese and reports zero; check-senses.js compares the English and reports 154.
     - the three show DIFFERENT constructions. A second example using the first's grammar teaches
       nothing the first did not.
     - the English is a translation of the Chinese, and the Chinese is natural.
   Repair with `dropEx` (naming the Chinese sentence to remove) plus `ex` (as [chinese, english]
   pairs). dropEx filters the record's own harvested examples as well as the deck's. The applier
   REFUSES an example that does not contain its headword — that guard is right; fix the sentence.
   Say in the `why` whether a replacement is authored or taken from a corpus.

5. A SINGLE-CHARACTER CARD GETS A SECTION LISTING OTHER WORDS BUILT ON ITS CHARACTER.
   1,503 of the notes are one character. Tapping a character already opens a panel (openCharWin /
   charNeighbours in app.js) — but that panel is scoped to the deck the reader has downloaded, and
   639 of those 1,503 characters have no other word in their own deck at all, so it says "No other
   word in this deck uses it" for 42% of the cards it exists for. The section is authored and is not
   bounded that way.
   Build it as a new card field — call it `Compounds` — following the `Literally` / `Origin`
   precedent in fixes.decks.hsk30idm:
     - add it through `decks.<id>.addFields` (name, `after`, `html`, `css`), which writes the type's
       field list, the template and the scoped CSS together. Put it after the Characters block and
       before the Examples fold, on BOTH cards of the type.
     - add "Compounds" to the whitelist array in mandarin-fix.js, or the field is created and never
       filled.
     - then write it per note, three to five rows, each row the word, its pinyin and its English.
   Content rules: choose words a learner will actually meet, commonest first; prefer words that show
   the character doing DIFFERENT work rather than three near-synonyms; where the character is
   polyphonic, include a word for each reading and say which reading; a row may be a fixed phrase or
   a bound use rather than a word. Do not simply mirror what the tap panel would already show for
   that deck. Verify every row's reading and gloss against CC-CEDICT, and state in the `why` that
   the list is authored.

ALSO REPAIR ANYTHING ELSE THE CARD IS WRONG ABOUT — a measure word that is missing or wrong (`mw`,
which expands bare characters from the decks' own table), a traditional form, a `not X`
disambiguator that no longer distinguishes anything after a gloss rewrite (the applier drops it with
the gloss; check the pair's other member still needs one).

THE BATCH. Do ONE batch per session and stop. A batch is 40–60 consecutive notes of one deck, or
one checker's whole finding list where that is smaller. Work the triage order:
  (a) every open finding of check-gloss-source.js, check-senses.js's duplicate-translation list and
      check-example-fit.js — these are the measured faults and they are the cheapest cards to fix
  (b) hsk30l7 (Levels 7–9) gloss register, deck order from the top — the largest concentration of
      request 1, and the deck with the most notes
  (c) the single-character cards of hsk30l1 upward, for request 5
  (d) everything else, deck by deck, lowest index first
Keep a log at the foot of docs/mandarin-review.md: one row per batch — the date, the deck, the note
range or finding list, how many notes were changed, what KINDS of fault were found, and what you
read and deliberately left alone. A batch that changes nothing is worth a row saying so; without it
the next session re-reads the same fifty cards.

FINISHING A BATCH:
  node .claude/decks/mandarin-fix.js            # apply
  node .claude/decks/mandarin-fix.js --check    # must say ok
  node .claude/decks/check-pinyin.js            # must be clean
  node .claude/decks/check-mandarin-coverage.js # examples still 100%, ambiguity still 0
  node .claude/decks/check-senses.js            # duplicate-translation count must not rise
  node .claude/check-sizes.js                   # these decks are not on the eager path; confirm
  node .claude/build-lang-decks.js              # REQUIRED: rewrites lang-decks.js, including the
                                                # content revision that puts an Update button on a
                                                # reader's already-downloaded copy
Then commit and push. Re-running build-lang-decks.js is not optional: without it every reader who
already downloaded a deck keeps the unrepaired copy and nothing on the site says so.

THE CHANGELOG. A community deck is not a change to Folio and gets no changelog line and no version
bump — but a change to the APP that this work forces (a new card-type field is one) does. Word such
a line as a fact about the decks rather than about any one card, fold it into the day's existing
line if there is one, and bump window.FOLIO_VERSION in the same commit, reading `released` off the
clock with `date -u "+%Y-%m-%dT%H:%MZ"`.

BE HONEST IN THE LOG. Where a card is right as it stands, say so and leave it. Where a finding is a
checker's false positive, say which and why, so the next session does not re-derive it. Where you
cannot settle a reading or a gloss from CC-CEDICT and the card's own examples, leave the card alone
and record the question — a confidently wrong definition is worse than an old one.
```

## Running it

Paste the block above into a fresh session. It is written to be self-contained: it names the files to
read, the tools to run, the refusals, the batch unit and the log, so a session that has never seen
these decks can open a batch from it. Each batch ends with a pushed commit and a log row, and the
next session starts by reading the log.

Two things worth doing once, before the first content batch, rather than inside one:

- **The `Compounds` field is infrastructure and should ship on its own**, with the `addFields` entry,
  the whitelist line and perhaps a dozen worked cards, so the field is proved end to end on a real
  reader's screen before 1,500 notes are written against it.
- **The Levels 7–9 gloss register is worth one measuring batch first** — a sample of fifty read
  against CC-CEDICT will say whether the 721 capitalised senses are one fault with one repair or
  several, and that decides whether the rest is a grind or a pass.
