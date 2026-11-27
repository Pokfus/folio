# The Library audit of November 2026

**Asked for, verbatim (2026-11-27):** *"I want a full Library audit. Read through all the texts looking for
spelling mistakes, inconsistencies, incorrect gloss links, illogical word usage that may be mistranscriptions,
copied source misprints, etc. Ensure consistency in formatting across all books. Make a list of names and
terms that would be most useful to add to the glossary. Redesign the desktop version of the Library page and
provide an interactive file with 6 versions […] Think of several other suggestions for changes or
improvements in the Library system. Library texts should also be sortable by popularity […] When sorting by
date, old texts written over extended periods of time (e.g. Ramayana) should be sorted by their earliest date
instead of the timespan average. Also scan the existing cards in all history and science collections to see
where book quotations could be added. Whenever a new book is added, ensure all these checks and processes are
applied automatically and immediately upon addition."*

This file is what was done, how to keep doing it, and what is still open. **Read "A new book" before adding
or re-importing a book.** The per-book findings are in `library-audit-books.md` (grep it for a book id), the
glossary list in `library-glossary-candidates.md`, the card quotations in `library-card-quotes.md`, the six
desktop designs in `mockups/library-desktop-redesigns/`. Not part of the site.

## 1. What the audit found, in one screen

- **Five books were not on the shelf at all.** The rows of the Res Gestae, Jerome's Letters, Erman, Douglass's
  *Narrative* and Ebbinghaus's *Memory* in app.js's `BOOKS` had each lost the `}, {` that closed them (merge
  resolutions, one per book added since), so each was one object literal with the row after it and the later
  `id` won. Valid JavaScript, a green suite. Restored; `check-library.js` now counts `id:` lines against rows.
- **Marco Polo's Contents listed 18 of its 235 chapters** (the row named no `parts`; the reader lists a book
  with none as one part), and **the Confessions and the City of God headed every Book with their first
  part's name** (the importer's entries had no `parts`, so every chapter shipped `p: 1`).
- **The texts are of three qualities, and the shelf did not say which is which.** About 50 books are
  proofed transcriptions with a handful of slips each (48 have twelve rows or fewer). About 35 carry a steady
  rate of scan or keying slips. About 15 are uncorrected OCR that reads with a stumble every page or so (§4). 6,465 corrections are now
  applied across 87 books (§2); the reviewers estimate several thousand more in the fifteen.
- **The reader drew about 8,500 wrong glossary links** of 48,136: a namesake (Titus the legate → the
  emperor), a term dated after the book (the Summa's Trinity → the nuclear test of 1945, seventy-two times),
  an ancient land → today's nation-state, a capitalised common word caught by an alias (the Elder → Starets).
  Two rules and a reviewed table removed them (§3).
- **Formatting differed by transcriber, not by edition**: straight quotation marks in 71 books and curled in
  30 (nine mixed inside one book); chapter titles shouting in capitals in three books; a stop after the
  title in three; `--` for a dash in four; "Ancient Greek" for two Greek columns and "Greek" for fifteen;
  six first-millennium dates without the "CE" the other seventeen carry. All now one form (§2, §5).

## 2. The text: emendations and the house form

**The tool is `.claude/book-emend.js`; the tables are `.claude/book-emend.json` (applied) and
`.claude/book-emend-probable.json` (held, 805 rows in 72 books).**

- **An emendation is not a `fixes` row.** A `fixes` row in fetch-book.js asserts *the printed page reads X
  and this transcription reads Y* and is made with the page in hand (`book-text-plan.md`). An emendation
  asserts less: *no printing can have meant this* — `the the`, `tbe`, `accompained`, a digit inside a word,
  `lie was` for `he was` — wherever the fault arose, scan, typist or compositor. The owner asked for exactly
  that ("mistranscriptions, copied source misprints"). The page was **not** read for these rows, which is
  why they are a second table, with a second count (`emended: N` in the book's file) and a second sentence
  on the book's About page ("N slips of the scan or the press have been corrected in this text").
- **The bar was "certain": no other reading possible.** Period spelling, dialect, the translator's choice,
  names and quoted foreign lines were left. Rows a reviewer marked *probable* — sound, but a period form or
  the 1890s compositor could not be ruled out — are in the held file with the reason, and nothing applies
  them. Fifty rows were moved there by hand on review (the Yale Shakespeare's printed line-end hyphens,
  which are the edition's lineation; deletions of more than a line; three guessed restorations).
- **How the rows were made.** `book-spell.js` (new: a dictionary scan, improbable pairs, line-break hyphens),
  `book-scan.js` and `book-vary.js` produced about 9,300 candidates; fifteen reviewers read every candidate
  in context and 440 evenly spread samples (about two million characters) as proof-readers; every `from` was
  machine-checked to stand exactly once in its chapter; the rows flagged as large, as real-word
  substitutions or as touching markup (352) were read again before anything was applied.
- **An entry is a row or a rule, applied in order.** A row is `{ ch, in, from, to, kind, why }`. A rule is
  `{ re, to, in, n, kind, why }` — a fault that repeats by pattern: Livy's 630 line-break hyphens
  (`obliter- ated`), the Summa's 961 link serials (`([4311]Q[13]`), Strabo's capital X read as a digit
  (`3anthus`), Euclid's italic *be* read as *he* (all 60), the Aeneid's `Iong` and `0 Sibyl`, and in
  Breasted's first three volumes the half-brackets read as a bullet and a raised 1 (531, the two shapes
  the reviewer measured with no false hit) and the running heads of the printed page.
- **The lock.** `.claude/book-emend.lock.json` holds a digest of each book's chapters as the tool last left
  them. A later entry may rewrite words an earlier entry's `to` contained, so "is `to` still there?" cannot
  be the test of whether an entry is in; the digest is. A fresh import runs every entry from the first and
  must land on the lock's digest — fetch-book.js says so loudly when it does not (*"this import does not
  reproduce the audited text"*), which is also how upstream drift in a source is noticed.
- **It runs at the write.** `writeEnglish` in fetch-book.js calls `finish()` on the finished chapters, after
  `fixes`, `reFixes`, `roman` and every extractor, because a row is written against the text a reader was
  sent. `node .claude/book-emend.js --apply <id>` does the same to a shipped file without a refetch — the
  importer's last step and the tool's only step are one function. `--check` is in CI.
- **The house form** (same function, every book, new ones included): a chapter title set in capitals is
  given in title case; a title's closing stop is dropped; a book that types its dashes as `--` (ten or more
  of them) gets `—`. Nothing else about a title is touched.
- **Quotation marks are curled as the chapter paints** (`bookQuotes` / `bookQuoteTree` in app.js), one
  character for one, because a reader's highlights are stored as offsets. `test-book-quotes.js` holds the
  rules and runs the function over every paragraph of the shelf: no length changed, no straight mark left.
- **Cards that quote a corrected passage were updated** (17, Greece, Rome and World History), and the
  home page's `HOME_EXCERPTS` (six stale titles, one corrected name). Both are gates now (§6).

Corrections by kind: scan misreading 2,945 · stray apparatus 1,083 · typo 815 · line-break hyphen 792 ·
run-together 306 · split word 190 · wrong word 145 · doubled word 96 · garbage 93.

## 3. The glossary links

- **Read off the rendered page.** `.claude/book-gloss-sweep.js` opens the reader in headless Chromium,
  turns to every chapter of a book and records each `.ttip[data-k]` with its sentence. The reader links the
  first mention of a key in each chapter.
- **Rule 1 — a book cannot name what came after it** (`unlinkLaterTerms`, app.js). A term whose own date
  (`GLOSSARY_DATES`) begins more than ten years after the last year the book's `written` states is unlinked.
  It removed 287 keys' links at a stroke and needs no list. `glossUntil` on a row moves the line for a book
  whose chapters carry a modern editor's prose (Breasted, Petrie, the Book of the Dead, Jones's Sacontala,
  Gilgamesh).
- **Rule 2 — a book written before 1500 does not mean the modern state** (`GLOSS_MODERN_STATES`, generated
  from the Atlas's country list; `check-library.js` fails when it lags). "Egypt", "Greece", "Syria" are
  entries about today's countries. The rows added since October 2026 each switched these off by hand; the
  fifty rows before them never had.
- **The licence boxes of the About page are not glossed** ("Creative Commons" went to the House of Commons).
- **Everything else was read.** Eight reviewers judged all 11,700 remaining (book, key) pairs against their
  sentences: 1,505 keys are wrong throughout a book and 507 in particular chapters. They are in
  `.claude/book-gloss-off.json` with a reason each, and `book-emend.js` writes them into the book's own lazy
  file (`glossOff` / `glossOffIn` beside `emended`) — not into the eager registry, whose hand lists stay.
  `bookGlossOff` adds the two. There is deliberately no shelf-wide off-list: a key wrong in every old book
  is right in the next book of geology. The sweep prints a key that is off in three other books under
  **LIKELY WRONG** when a new book draws it.
- **110 links are left open** (`doubtful` in the table, printed per book in `library-audit-books.md`): policy
  questions, not unknowns — the heavenly Jerusalem, "Argives" for all the Greeks, a regent linked in the
  chapter where his namesake comes first.
- **What the reviewers saw repeat**, worth fixing in the glossary rather than book by book: place names
  aliased to a *Battle of …* entry (Thermopylae, Himera, Mycale, Pharsalus); plays linked from their hero
  (Philoctetes, Hippolytus, Antigone); moons (Europa, Ganymede, Callisto); `Mount_Ida` (the Cretan one, where
  the texts mean the Trojan); `Persian_Gulf` under the alias "Arabian Gulf", which is the Red Sea in
  Herodotus, Diodorus, Strabo and Dio; aliases that are common words (`Starets` ← "Elder", `Hor-Aha` ←
  "Aha", `Montu` ← "Month", `Afar_Region` ← "Afar"); American capitals under saints' and English towns'
  names (St. Paul, St. Augustine, Dover, Concord, Augusta). Making those aliases case-sensitive, or removing
  them, would let the per-book rows go.

## 4. The books that need more than rows

The reviewers' samples say these are uncorrected OCR or keying, with hundreds of slips left after the rows —
mostly real words in the wrong place (`tattle` for `battle`, `Sim` for `Sun`), which no scanner finds. Each
wants a proof-read against page images or a re-import from a cleaner source; `library-audit-books.md` has the
measured rate and the classes for each.

| book | what it is | the reviewer's estimate of what remains |
|---|---|---|
| `breasted-ancient-records` | read off the Internet Archive's character OCR; no transcription exists | ~40% of paragraphs carried a stumble before the rules; ~1,550 half-brackets still misread (the shapes with false hits, and all of Vol. IV); 150 garbage paragraphs; 19 chapters end on the next one's heading — the classes and regexes are written down |
| `journey-to-the-west` | OCR of Richard's 1913 edition | several hundred after 540 rows; unreadable tables in ch58 and ch98 |
| `strabo-geography` | OCR of the Bohn translation | 400–600 after 262; the notes' Greek is garbled by rule |
| `rigveda` | unproofed scan | unknown: `he`/`be`, `cat`/`eat` class; three hymns are wrong or missing (1.179, 10.86, 10.34) |
| `canterbury-tales` | OCR of the modernised version | several hundred; two places where text is lost |
| `xunzi`, `mozi` | six OCRs voted word by word | ~300–400 each; orphaned quotation marks throughout |
| `erman-egyptian-literature` | FineReader OCR | the notes worst; a dozen passages unreadable without the print |
| `livy-history-of-rome` | Perseus | several hundred; 2,709 paragraphs begin mid-sentence (an importer fault: sub-sections became `<p>`) |
| `plutarch-lives`, `pausanias-description-of-greece` | Perseus | a few hundred each, concentrated in certain Lives and in Book 1 |
| `diodorus-library` Books 11–17, `cassius-dio-roman-history`, `polybius-histories` | LacusCurtius / Perseus | found by collating against a second transcription of the same edition; Polybius's ~900 longer diff hunks and all of Dio are unread |
| `virgil-aeneid`, `homer-iliad` IX–XXIV, `anglo-saxon-chronicle` 5–9 | scans | real-word misreadings in every sample |

**The method that worked best** was collation against an independent transcription of the same edition
(Polybius against Project Gutenberg: 97 certain rows; Diodorus against Perseus; The Prince against
Gutenberg). `book-text-plan.md` E57–E58 describes it. It is the next pass for the table above.

## 5. The catalogue

`node .claude/check-library.js` (new, in CI) holds the three places a book lives — its row in app.js's
`BOOKS`, its entry in fetch-book.js, its generated files — to one another: one `id:` line one row; a file
for every row and a row for every file; `count` against the chapters shipped; every chapter's `p` named by
the row's `parts`; `origLang` / `origName` against the original's own file; an author colour; the `year`
rule; `written` in the shelf's form (BCE/CE, en dash, `c.`, an era on a first-millennium date); the home
excerpts; the modern-state list.

**The `year` rule (Nov 2026, on request).** The Date order files a work at the **earliest** year its
`written` states. A span's key is its early end (the Ramayana's "c. 500 BCE – 200 CE" is −500, not the −300
midpoint); a single century's or decade's key lies inside it. 22 rows moved.

**Popularity.** A fifth sort. It first ran on the pooled `book_stats.reads` (a reader counted once, after a
minute with the book open); the owner then asked for **openings instead of readers**, so it now reads
`book_stats.opens`, bumped by `bump_book_open` when a book is opened (at most once an hour per book per
device). That is **schema section 20, the owner's to run**: until then the order falls back to readers and
says so under the tools row. `library-feature.md` ("POPULARITY") has the three cases.

**`tradition` and `form`** (Nov 2026). Every row declares one of each, from `BOOK_TRADITIONS` and
`BOOK_FORMS` in app.js — what the Reading room's rail filters by. `check-library.js` fails a row without
them and prints the lists.

## 6. A new book

`fetch-book.js` now ends every English import by running **`node .claude/book-checks.js <id>`** (skip with
`--no-checks`; `--fast-checks` drops its two slow steps). The report is the last thing on the screen.

1. The importer's write applies the emendation table and the house form (nothing to do for a first import).
2. **Gates** — the run fails on any: `check-library` (the row exists, agrees, has a colour, `year` obeys the
   rule, and it declares a `tradition` and a `form` from the two lists — the message prints them), `book-emend --check`, `book-audit` (tag damage), `test-book-quotes`, and "every card that quotes
   this book still quotes its words".
3. **Evidence** — read it: `book-spell`, `book-scan`, `book-vary`, `check-cutoff`, `check-counts`,
   `check-pairing`, `check-twins`, `book-gloss-sweep` (needs Playwright on `NODE_PATH`),
   `book-gloss-candidates --book` (the names it uses that the glossary lacks), `find-card-quotes --book`
   (the cards that could quote it).
4. A slip no printing can have meant → a row in `.claude/book-emend.json` (exact `from`, once in its
   chapter). A wrong link → `.claude/book-gloss-off.json` (or `glossOffIn` for chapters). Then
   `node .claude/book-emend.js --apply <id>` and the command again.
5. The dictionary for `book-spell` is installed outside the repo, like Playwright:
   `mkdir -p "$SCRATCH/dict" && cd "$SCRATCH/dict" && npm init -y && npm i an-array-of-english-words wordlist-english`,
   then `NODE_PATH="$SCRATCH/dict/node_modules:$SCRATCH/pw/node_modules"`. A step whose library is missing
   says so and is skipped.

CI (`checks.yml`, fast job): `check-library.js`, `book-emend.js --check`, `test-book-quotes.js`. The browser
shards pick up `test-library-sort.js` and `test-book-gloss-rules.js` by themselves.

**Re-run after touching** `bookQuotes` / `bookQuoteTree`: `test-book-quotes.js`. `bookGlossOff`,
`unlinkLaterTerms`, the `<gloss-date-rule>` parsers, `GLOSS_MODERN_STATES`: `test-book-gloss-rules.js`.
`BOOK_SORTS`, the shelf comparator, a `year`: `test-library-sort.js`. `PAGES.library`'s two layouts, the
filters, `bookState`: `test-library-room.js`. A book's text by any route:
`book-emend.js --check` and `check-cards.js` (the quotations).

## 7. Suggestions for the Library

Asked for ("several other suggestions for changes or improvements"). In rough order of value:

1. **Say how good each text is.** A line on the About page and a quiet mark on the tile for the fifteen
   books of §4 ("read from a scan; not yet proof-read"). The shelf currently presents Breasted and Seneca
   as the same kind of object.
2. **Let readers report a slip.** Select a word in the reader → "Report a slip" → a row in a Supabase table
   with book, chapter and the sentence. It is the only way the real-word misreadings will ever be found at
   scale, and each report is already in the shape of a `book-emend.json` row.
3. **Give the catalogue a tradition and a form.** *Done, Nov 2026*: every row declares both, and the
   desktop page filters by them (`library-feature.md`, "The Reading room and the Desk").
4. **Search inside the Library**, not only its titles: a lazy per-book index, "find this phrase in every
   text". `library-card-quotes.md` shows how much the texts could answer.
5. **Show a card where its book is.** A margin mark in the reader where a card quotes the passage ("3 cards
   quote this chapter"), and from a card's quotation a link that opens the book at that section.
6. **Sync highlights.** They live in `localStorage` (`BOOK_HL_KEY`) while reading position syncs; a reader
   who changes device keeps their place and loses their marks. They grow per use, so they want their own
   table, not `PROGRESS_FIELDS`.
7. **Finish what the shelf starts.** A "finished" state (*done, Nov 2026*: `fin` on the reading record,
   `bookState`) and a reading goal; an estimated reading time per
   chapter (the text length is known); the home page's reading box could say "about 25 minutes left in
   Book 3".
8. **Take the registry's prose off the boot path.** `BOOKS` in app.js is 370 KB, 203 KB of it comments, and
   it is eager; `rights`, `edition` and the per-row reasoning belong in the lazy book file and in
   `library-books.md`. Every visitor pays for it on every page.
9. **Erman is shelved at 1923** and Breasted at 2600 BCE; both are anthologies of ancient texts by a modern
   scholar. One rule for the three Egyptian anthologies (Petrie is the third).
10. **A names index per book** ("People and places in this book"), generated from the sweep: the glossary
    keys a book links, by count, each opening the first chapter that names it.
11. **Download a book for offline reading** through the service worker; long texts are read on trains.
12. **Count openings as well as readers.** *Done, Nov 2026, on request*: the Popularity order counts
    openings (schema section 20, the owner's to run; it falls back to `reads` and says so until then).

## 8. The glossary list, the card quotations, the six designs

- **`library-glossary-candidates.md`** — the names the books use that the glossary lacks, read and sorted from
  one run of `node .claude/book-gloss-candidates.js --top=900`: the entries worth writing (people, places,
  peoples and states, gods and heroes, works, institutions), the forms that only need an alias on an entry
  that exists, and the classes deliberately left out. `--book=<id>` prints what one book adds.
- **`library-card-quotes.md`** — where a history or science card could quote a shelved book
  (`node .claude/find-card-quotes.js`): about 1,300 cards whose own sources already cite a book on the shelf
  and carry no quotation. Places to look, never passages.
- **`mockups/library-desktop-redesigns/index.html`** — six desktop designs for the Library page in one
  interactive file (keys 1–6, D for day and night): Reading room, Stacks, Time river, Catalogue, Traditions,
  Desk. `make-data.js` regenerates its data from the live catalogue. **The owner chose** (Nov 2026): design 1,
  the Reading room, is the desktop page, and the top of the Desk (the book in hand, the others in progress,
  four figures) stands over the shelf on a phone and a tablet. Both are built; the other four are not.

## 9. Left as found, on purpose

- `test-library.js`: one failure, "…and short with it" (tile height ≤ 120 px) — it fails identically
  without this work: long titles wrap to a second line.
- `ci-shards.js --check`: the heaviest shard is predicted over its 28-minute cap, as it was before; seven
  suites have no measured weight.
- `eg-005`'s quotation prints a capital Δ where the book has δ — it failed before the audit.
- The 805 held rows and the 110 open links are decisions for a reader with the page.
