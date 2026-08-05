# Folio — project guide for Claude Code

Folio is a study companion for Chinese history: an Anki-style flashcard site with spaced
repetition, daily games, a glossary, a whiteboard, an admin editor, and an interactive globe.
It is a plain static website — open `index.html` and it runs.

## Golden rules (read first)

- **Zero dependencies, vanilla JS, no build step.** No frameworks, bundlers, npm packages, or
  CDN `<script>`s in the site itself. It must keep working by opening `index.html` directly.
- **Touch only what the task needs.** Don't reformat, rename, or "tidy" files that aren't part of
  the request. Prefer small, surgical diffs over rewrites.
- **Verify before declaring done.** After a change, reload in the browser and confirm there are no
  new console errors. For visual/UI work, it isn't finished until it's been looked at on the page.
- **Never fabricate card or glossary content.** This is a study tool — historical accuracy
  matters. If unsure about a fact, say so; don't invent dates, names, or definitions.
- **Be honest about scope and tradeoffs.** Flag limitations and judgment calls plainly rather than
  papering over them.
- **Bump the version with it.** `window.FOLIO_VERSION = { v, released }` at the top of `changelog.js` is printed
  very small in the top-left corner of the home page, and it is the reader's answer to "which Folio am I
  looking at?" — so it must be bumped **in the same commit as the changelog line**, on every merge to main.
  `v` is MAJOR.MINOR: the minor goes up by one per release, the major only when a whole new area of the site
  lands (the Library would have been one). `released` is an ISO instant in **UTC** and must be the real moment
  the work was finished — the page prints it in the reader's own clock, so a placeholder rounded to midnight
  is wrong in every timezone at once. It lives in `changelog.js` rather than app.js precisely so that
  bumping it and writing the day's line are one file open and two edits, and the two can never come to
  disagree about what shipped when. It is **not** sw.js's `VERSION`, which is a cache generation — bumping
  that one throws every cached file away and costs each reader ~1.4 MB, so the two are counted separately and
  a release does not touch it.
- **Keep the changelog current.** Whenever a user-requested change ships to the live site (committed/pushed),
  append a one-line plain-English summary to TODAY's entry in `changelog.js` (create the day if missing; newest
  day first). Reader-facing wording — what changed for the user, not how. **Card/glossary content changes are
  summarized by count + deck only, never naming specific cards or terms** (e.g. "Three new cards in the Western
  Zhou deck"). **One line per kind of change per day** — if the day already has a "N new cards" or "N more
  glossary terms" line, RAISE ITS COUNT and fold in the new subject rather than adding a second line; several
  days once carried the same kind of entry two to seven times over. The same holds for **"now in your language"
  lines**: a day gets ONE localisation line per area (the daily games, the Atlas, the site chrome), extended as
  more of that area lands — 2026-07-27/28 once carried eight and five of them, each announcing another corner of
  the same rollout. The Mission page renders it.
  **Keep an item SHORT — a summary, not a transcript.** Two entries once ran to 12,000 and 15,000 characters
  because a citation batch listed every correction it made; they were compressed on request (2026-08-01) into
  one line a day saying what changed and what KIND of corrections came out of it. The counts and the finding
  belong here; the per-card detail belongs in the batch log in `docs/`. Anything past ~1,000 characters is a
  transcript.
  **ENGLISH ONLY, for now (Aug 2026, on request): a new line does NOT need its nine translations.** The site
  ships in English while the work is on making the English as good as it can be — see the `MULTILANG` bullet
  under "How the app is wired". Write the line, ship it, move on. The rest of this paragraph is the rule to
  resume when translations do: the whole changelog (27 day titles + 196 items) is already live in
  es/fr/de/it/nl/ru/ar/zh/ja as `chrome.exact` rows in `i18n/ui-<lang>.js` — the items are plain text nodes, so
  `localizeTree` picks them up with no code. They must NOT go inline into `changelog.js`, which is in the eager
  load path (the `quotes.js` mistake: 27 KB → 312 KB for every visitor). Add them with `.claude/add-lang.js`
  chrome batches, and **if you reword or merge an existing line, retire the old translations** in the same pass
  via the `chrome.remove` list, or nine files keep a dead row that matches nothing and reads like coverage.
  A line added while English-only simply has no translated rows to retire.
  The changelog **dates follow the site language** (`fmtDay` → `dayLocale()`, en-GB for English), not the
  browser's.

## File map

**Only the study-critical files load eagerly** (~1.4 MB), in this order — it is significant:
`data.js → truefalse.js → quotes.js → changelog.js → mission.js → glossary.js → glossary-wikipedia.js → app.js`.

**Everything else is LAZY**, injected on demand by `DATA_BUNDLES` / `ensureData(name)` in app.js (see the
"Lazy data bundles" bullet under "How the app is wired"). Before this split every visitor downloaded ~11.3 MB
of blocking JS to flip a card; the Atlas layers and the translation tables are ~9.9 MB of that.

| bundle | files | loaded when |
|---|---|---|
| `world` | `world.js` | the Atlas mounts; the home page's mini globe (at idle); the Settings home picker |
| `atlas` | `uk` `lakes` `rivers` `water` `cities` `timeline` `countries` `country-stats` `country-spans` `country-years` `country-sources` | the Atlas mounts |
| `uiI18n:<lang>` | `i18n/ui-<lang>.js` | the site language isn't English |
| `glossI18n:<lang>` | `i18n/gloss-<lang>.js` | ditto |
| `gamesI18n:<lang>` | `i18n/games-<lang>.js` | ditto (the True-or-False / Who-said-it pools) |
| `placeI18n:<lang>` | `i18n/places-<lang>.js` | ditto (country / territory / capital names on the globe) |
| `book:<id>` | `books/<id>.js` | that book is opened in the Library (never on the shelf — see the Library bullet) |
| `bookOrig:<id>` | `books/<id>.<lang>.js` | the reader asks for that book's ORIGINAL language (never before) |

(`heightmap.js` + `heightmap-ultra.js` are lazy too, but on their own older path — `loadHeightmapLevel`, keyed off
the Heightmap legend toggle / zoom, not `DATA_BUNDLES`.
`ranges.js` + `admin1.js` — the removed Mountains / Divisions layers — are **never loaded**; app.js reads
`window.RANGES`/`window.ADMIN1` with empty-fallbacks, so the files stay on disk for a future revival.)

- `index.html` — app shell. `<main class="stage"><div id="view"></div></main>`, and two things added for
  accessibility in Aug 2026: a **`.skip-link`** as the document's first element (positioned off screen until
  it takes focus, never `display:none`, which would take it out of the tab order and defeat the point of it)
  so a keyboard reader can pass the eight nav buttons in one press; and the **`#toast` live region declared
  in the markup** rather than created on the first message — a region announced at the moment it is inserted
  is one the screen reader has not been watching, and the announcement is lost. Also the static
  `<title>`/description/OG baseline (link-preview crawlers don't run JS) and the `<link rel="manifest">`.
- `books/<id>.js` — one **Library book**'s text: `window.FOLIO_BOOKS_IN.push({ id, intro, chapters:[{ n, p, t, html, notes }] })`.
  **Lazy** (bundle `book:<id>`), **generated — never hand-edited** (see `.claude/fetch-book.js`), and it pushes onto a
  QUEUE rather than assigning a global, for the reason the i18n files do. `intro` is the book's own front
  matter (chapter 0 — see the Library bullet). Currently five: `seneca-letters`,
  `marcus-aurelius-meditations` (~337 KB, all 12 books, 487 section numbers, 812 translator notes),
  `sun-tzu-art-of-war` (~380 KB, all 13 chapters, 385 section numbers in 383 rows, 608 notes),
  `plato-republic` (~664 KB, all 10 books, **no section numbers at all**, 117 translator notes — the
  first book here with none, which is why it has no original; see the `<id>.<lang>.js` bullet below)
  and `ovid-metamorphoses` (~807 KB, all 15 books, 156 section numbers, **0 notes** — the first book
  here whose edition carries none, so its chapters render with no note fold at all, which is correct
  and not a wiring fault).
- `books/<id>.<lang>.js` — the same book in the language it was WRITTEN in
  (`window.FOLIO_BOOK_ORIG_IN.push({ id, lang, langName, edition, rights, sourceName, sourceUrl, chapters:[{ n, html }] })`).
  Its own **lazy** bundle (`bookOrig:<id>`), generated by the same importer, never hand-edited. Currently four:
  `seneca-letters.la.js` (~862 KB, all 124 letters), `marcus-aurelius-meditations.grc.js` (~197 KB, all 12
  books, 486 sections), `sun-tzu-art-of-war.zh.js` (~35 KB, all 13 chapters — classical Chinese is terse,
  and this is the whole work) and `ovid-metamorphoses.la.js` (~572 KB, all 15 books, 156 cards, 11,927
  lines of hexameter). **Five books, four originals**: the Republic has none, and the reason is the
  next paragraph's rule biting for the first time.
  **THE ONE QUESTION THAT DECIDES WHETHER A BOOK CAN HAVE AN ORIGINAL AT ALL** is not "does a text of it
  exist?" but **"does that text say which section each passage is?"** — because app.js pairs the two columns
  on the section NUMBER, never on paragraph or list order. Two shapes answer yes, and both are here:
  · **A FACING-PAGE EDITION**, where one editor numbered both columns at once, so the original's numbers are
    the translation's by construction. *The Art of War* is that: its original is not another edition on
    another wiki but the Chinese Giles printed on the facing half of HIS OWN page, transcribed in the same
    table, carrying his section numbering explicitly (each printed page's list opens on an `<li value="N">`).
    Measured before it was believed, over all 13 chapters: **385 sections, the two columns agreeing exactly**
    — same count, same maximum, nothing missing on either side, no duplicates. Hence no table of corrections
    and no hedging.
  · **A TEI EDITION prepared to the CTS standard**, where the numbers are STRUCTURE (`<div subtype="chapter"
    n="17">`) rather than something read back out of the prose. The *Meditations* is that, and it is the case
    to read before reaching for the obvious source, **because the obvious source was the wrong one**. Greek
    Wikisource's `Τα εις εαυτόν` prints **no section numbers at all** — each book is a single `<ol>`, so the
    only handle is a passage's POSITION in a list. Its edition divides six of the twelve books differently
    from Haines, so past one splice point per book the position runs one out from the section it would have
    to be (measured: pairing by position correlates 0.98–1.00 on the six books whose counts agree and
    0.33–0.71 on the six that diverge). Transferring another edition's numbering onto that text was tried and
    abandoned too — it is a different edition with its own variants, and even where the counts agree 15 of 185
    openings do not match. Leopold's Teubner text of 1908, via the Perseus Digital Library, agrees with Haines
    on **486 of 487 sections**; the exception is a section 18 in book 12 that Leopold does not carry, which
    draws as an empty cell precisely because both sides state their numbers.
  **VERIFY BEYOND THE NUMBERS, since a matching number is not a matching passage**: for the Greek,
  section-length correlation 0.9963 across all 486 pairs, and 36 of 38 shared proper names present on both
  sides — the two exceptions read rather than assumed, and both real (Haines renders "Plato's *Republic*" as
  "Utopias", and 11.26 is a genuine textual variant, Leopold's Ἐπικουρείων against Haines's Ἐφεσίων).
  **The Greek's licence has TWO LAYERS and it is the only file here that does**: Leopold's text is public
  domain (1908, and he died in 1925), while Perseus's digital edition is **CC BY-SA 4.0** — a deliberate
  departure from the expired-copyright-only rule, credited on the book's own page, in the About page's
  credits list and in `rights`. (The site already ships CC BY-SA data: the Atlas's era borders.) A book with
  no `origLang` simply shows no original-language control, so deleting an `original` block and its `origLang`
  removes that column and leaves the English untouched.
  **`plato-republic` IS THE CASE THAT ANSWERS NO, and it answers no on the ENGLISH side, which is new**
  (Aug 2026). Plato has the best-standardised citation system of any ancient author — Stephanus's
  page-and-column of 1578, used identically by every edition and translation in every language for four
  hundred years — and the Greek half is ready: Burnet's Oxford text of 1902 sits on Perseus in the same
  TEI/CTS encoding the Meditations' Greek comes from, Stephanus numbers as structure. What is missing is
  the numbers on JOWETT. The 1901 Colonial Press printing carries no Stephanus references anywhere —
  **measured over all ten books, not assumed** — and it is the ONLY complete transcription of the Republic
  in Wikisource's main namespace (the Jowett Republic inside *The Dialogues of Plato* is an index of red
  links; every other English Republic on Wikisource's own list is an `Index:` transcription project not
  transcluded into mainspace — all of it checked before this was concluded). Aligning them anyway would
  mean several hundred by-eye judgements per book on a free Victorian translation with nothing to check
  them against, which is exactly what was tried and abandoned for the Meditations' Greek. **So the honest
  move was to ship the book in English alone and say so in its own front matter** — a reader who knows
  Plato will go looking for the Stephanus numbers, and being told why they are absent is better than
  finding them missing. It is also the proof that `origLang` is genuinely optional: nothing else about
  the book differs, and the day a numbered transcription appears an `original` block and an `origLang`
  are the whole of the work.
  **It is a separate file from the translation on purpose** —
  together they are 2.2 MB, and a reader who only wants the English must not download the Latin to get it.
  Its `<span class="bk-n">` markers are the **section numbers**, and they are the whole point: app.js pairs the
  two texts on them (see the Library bullet).
  (~1.37 MB, **all 124 letters**, 1,065 translator notes — completed Aug 2026 on request; it was 65 and
  ~445 KB). The size is why the split exists: it is nearly as large as every eagerly-loaded file put
  together, and a visitor who never opens the book pays none of it.
- `.claude/fetch-book.js` — the importer that writes those files, from Wikisource. Standalone Node helper,
  zero deps, resumable (per-chapter cache in `.claude/book-cache/`, gitignored), safe to re-run:
  `node .claude/fetch-book.js seneca-letters [--from=N] [--to=N] [--force] [--only-original] [--skip-original]`.
  Adding a book = adding an entry to its `BOOKS` table (**and a matching one in app.js's eager `BOOKS`
  registry** — the importer writes the text, app.js holds the tile's metadata, and a book with only one of the
  two either never appears on the shelf or appears and cannot be opened).
  **A second edition needs the entry to say HOW IT IS SET, not just where it is** (Aug 2026, adding the
  Meditations — the first book after Seneca, and every difference between them became a field):
  · **`sections`** — how the printed edition marks the numbers any passage is cited by. Gummere sets them as a
    raised bold numeral, which arrives as its own `wst-verse` element and is rewritten inside `cleanBody`;
    Haines sets them as plain text at the head of a paragraph ("1. Say to thyself at daybreak"), which is
    indistinguishable in the markup from a sentence opening on a figure, so `sections: "leading"` runs
    `markLeadingSections` over the CLEANED text and accepts a number only where it moves the sequence forward.
    That pass must match **both of its forms in ONE sweep**, in reading order: run as two passes the paragraph
    rule reaches the end of the book and leaves the counter at the last section, after which the forward-only
    guard rejects every mid-paragraph `(15.)` as going backwards — which is exactly how book 12 first shipped
    numbered 14, 16, 17.
  · **`titleOf(n)`** — a book whose contents page gives its chapters no names (the Meditations' twelve are
    headed "BOOK I" … "BOOK XII" and nothing else). `chapterTitles()` returns `{}` when there is no
    `indexPage`. **Transcribe a title, never compose one** — inventing "On Death" for book 4 would be an
    apparatus the work does not have.
  · **`dropHeads`** — the scan's own running head, which is not part of the text. By the time it is seen every
    centred div has become a `<blockquote>`, so a head left in place renders the words "BOOK IV" as a
    QUOTATION at the top of a chapter already headed Book IV. Matched on the block's TEXT, anchored to the
    start, and declared per book because a phrase worth deleting in one edition is prose in another.
  **A book whose PAGES ARE NOT ONE COLUMN OF PROSE declares `layout`** (Aug 2026, adding the Art of War — the
  third book, and the first whose page shape differs rather than only its typographic conventions). Giles's
  edition is a PARALLEL TEXT: each printed page is transcribed as a two-cell table, the Chinese left and the
  English right, and a chapter is a run of 7–33 of them. `layout: "parallel"` selects a second extractor
  (`extractParallel` and the functions above it) which splits the cells, keeps the columns apart, lifts the
  commentary into the notes, and reads BOTH columns out of ONE fetch — so the original costs no extra requests
  and `fetchOriginal` reads it back from the English side's own cache. Four things about it are worth carrying:
  · **The ordinary extractor does not merely do this badly, it fails — and in the worse case SILENTLY.** On
    these pages `prp-pages-output` wraps only the footnote list at the foot, so `cleanBody`'s opening slice
    returns the notes and none of the book (that half throws, which is the good outcome); and the two columns,
    both being `<td>`s that `stripTags` unwraps, would come through INTERLEAVED — a line of classical Chinese,
    a line of English, all the way down, with nothing throwing to say so.
  · **A commentary is not a translator's footnote and this one is ten times the length of the text.** Sun Tzŭ's
    thirteen chapters run to ~6,000 words and Giles's notes on them to roughly ten times that, set in small type
    under each sentence. They are lifted into Folio's existing per-chapter note fold (608 of them), one block to
    one note, anchored where the printed page anchors it. Left inline they would bury the book a reader opened
    and make the bilingual page useless — a line of Chinese beside a page of argument about it, since the
    columns pair by section.
  · **A note cannot contain a note.** Giles's own 20 footnotes are all inside commentary blocks, never on Sun
    Tzŭ's text, so each is spliced into its commentary **at the point it was cited, in square brackets**. Left
    as markers they would point into the flat per-chapter list at random or be deleted by `wireFootnotes` for
    running past its end.
  · **MediaWiki only wraps a paragraph in `<p>` where the wikitext had a blank line before it.** 138 of this
    book's 163 English cells open on a BARE TEXT RUN, and 14 section numbers sit in one mid-cell. A `<p>`-anchored
    section pass cannot see those, and the failure is this file's usual quiet kind: nothing throws, the prose is
    complete and the chapter is the right length — the section just drops out of the numbering, its sentence is
    swallowed into the one above, and the Chinese line it should have faced is left facing nothing. It was found
    only by **counting the two columns against each other**, which is the check to run after any parallel fetch.
    `wrapBareRuns` now wraps every top-level bare run; the count went 369 → 383.
  **A book whose SCAN CONTAINS LEAVES THE EDITION NEVER NUMBERED declares `dropUnnumberedPages`** (Aug 2026,
  adding the Republic — the fourth book, and the first whose volume is illustrated). Jowett's 1901 printing
  binds engraved plates into the text: a facsimile of a Venetian frontispiece before Book V, the Gemma
  Augustea cameo before Book VII, each a caption, a paragraph about the engraving and the picture itself.
  None of it is Plato, and the reader drops images anyway (no `<img>` in `ALLOWED`), so left alone they
  arrive as a heading-shaped block, a paragraph on 16th-century Venetian printing, and an orphaned caption
  standing where the book should begin. **Matching that prose by its wording would be guessing about
  somebody else's page; the scan states it instead** — Wikisource's page markers carry the edition's own
  pagination in `data-page-number`, and these leaves are labelled `Caption` and `Plate` rather than
  numbered, because the binder inserted them outside the sequence. So the rule is structural (drop a scan
  page the edition did not number, marker to marker) and needs no knowledge of what is printed on it.
  Measured over all ten books: exactly two such leaves, both in the two illustrated books, every other page
  numbered. **It fixes the running heads for free**, and that is the part worth remembering: `dropHeads`
  only strips blocks from the START of a chapter, so while the plates stood in front of them Books V and
  VII kept heads the other eight lost — a rule that did not fire, reading as a rendering fault in two
  chapters out of ten.
  **`prp-pages-output` CAN OCCUR MORE THAN ONCE, so its opener is stripped globally** (same batch). A
  transclusion is broken into a fresh wrapper wherever something interrupts the run of scan pages — an
  inserted plate, or the footnote apparatus at the foot — and the Republic's pages carry two. Anchored to
  position 0, only the first was dropped and every later one survived as an opener with no closer inside
  the slice, so each of the ten books ended on a **stray empty `<blockquote>`**: an indented rule under the
  last line of Plato that nothing accounts for. The usual quiet shape — nothing throws, no prose is lost,
  the chapter is the right length. **Both changes were verified byte-for-byte against the shipped Seneca
  and Meditations chapters before being made**, which is the check to run on any edit to `cleanBody`: the
  extractor is shared, and its other three callers have already been proof-read by readers.
  **A book's ORIGINAL language is a second half of the same entry** (`original: { lang, langName, … }`),
  written to `books/<id>.<lang>.js` with its own cache under `book-cache/<id>/<lang>/`. **It comes in THREE
  shapes, and the wiki walk — the first one written — is the worst of them**, because it is the only one that
  has to read the section numbers back out of the prose:
  · **the facing page** (`layout: "parallel"`, above) — both columns out of ONE fetch of the translation's own
    page, numbered by the editor who set them side by side. Costs no extra requests; `fetchOriginal` reads it
    back from the English side's cache.
  · **`source: "tei"`** — one TEI/CTS file fetched over plain HTTPS (`fetchText` → `teiChapters`), where the
    section numbers are STRUCTURE. **Reach for one of these two first.** Its two editorial elements are
    resolved rather than passed through: `<add>` (the editor's supplement, part of the constituted text) is
    KEPT and `<del>` (what the editor marks as spurious) is DROPPED, so what ships is exactly what the printed
    page carries; `<quote>` becomes an inline `<q>`, because these quotations sit mid-sentence and a block
    element inside a `<p>` is invalid nesting.
    **A TEI edition of VERSE takes a second reader** (`layout: "verse"` → `teiVerseBooks` / `teiVerse`,
    Aug 2026, adding Ovid): `teiChapters` walks `<p>` elements and a poem has none — every line is an
    `<l>` and the stanza breaks are milestones between them — so pointing it at the Metamorphoses returns
    fifteen empty books. Three things about that reader are worth carrying. **Strip the `<note>` elements
    BEFORE sweeping for lines**: Magnus's apparatus notes CONTAIN `<l>`s (the variant readings, the lines
    he brackets as spurious), so the ordinary order pulls the apparatus into the poem — nothing throws,
    no book is missing, the text is just longer than Ovid wrote it. **Match the book divisions
    case-insensitively**: the English file spells Book 3 `subtype="BOOK"` and every other book lowercase,
    so a case-sensitive reader returns FOURTEEN books and quietly files Book 3's ten cards inside Book 2.
    And the unit both columns pair on is the **card** — a passage of 50–60 lines labelled with the LATIN
    LINE it opens at, which is how Ovid is cited and the only figure both editions state about the same
    thing (a verse translation cannot carry line numbers one-for-one: More runs 18,113 lines against the
    Latin's 11,927).
  · **the wiki walk** (`wiki` + `pages` + `originalChapters`) — one page per book of the collection, the
    numbers printed in the text and read back out. Everything below is about this shape.
  Two things about the wiki shape are worth knowing before adding one.
  **The other wiki is laid out differently** — la.wikisource gives one page per BOOK of the collection with the
  letters as `<h2>` headings inside it, where en.wikisource gives one page per letter — so `originalChapters`
  reads the Roman numeral off each heading rather than walking a page per chapter, and the salutation is lifted
  out of the heading (or, where the heading is a bare numeral, off the first paragraph) into the same
  `.bk-salut` line the English prints.
  **And the section markers wear three different costumes on that one wiki**: `[1]`, `[<b>1</b>]` (Libri VI–VII)
  and `(1)` (Liber XX). Each was found only by comparing section COUNTS against the English — seventeen letters
  came through with no section numbers at all, which does not throw, does not shorten the text and does not
  look wrong; it just leaves those letters with nothing to pair against. **So the check after a fetch is
  `.claude/test-library.js`'s pairing assertions plus a count of markers per letter against the English, never
  a look at one rendered chapter.** A bracketed number is accepted only when it moves the sequence FORWARD by
  a step or a few, since the editions genuinely skip some (letter 23 has no [2], letter 30 jumps [1]→[5]) and
  an editor's bracketed supplement must never be mistaken for a section.
  Two pages of that wiki are deliberately not walked: `Liber XXI` carries no numbered letters, and
  `Liber XXII - Excerpta Gellii` is the fragments quoted from a book numbered past anything that survives —
  neither has an English counterpart, so neither has a column to sit beside. **The chapter titles and the volume divisions are re-derived on every run**, so
  re-titling costs no refetch; **`--force` is needed to re-run the EXTRACTOR**, since the cache holds the
  extracted prose rather than the fetched page. Not part of the site.
  **FIVE extraction faults have been found and fixed in Aug 2026, and all five are the same mistake:**
  Wikisource's markup is not stable and none was assumed wrong until a reader saw it.
  **Two of them only ever appeared in letters 66–124** — the first 65 were clean, which is why they shipped
  unnoticed — so **the honest check runs over the WHOLE shipped book after a fetch, never over one rendered
  chapter**, and re-fetching a range that is already correct is cheap insurance rather than wasted work.
  · **A marker must carry the note it POINTS AT, not its position in the queue** (`data-fn`, written by
    `cleanBody` from the href MediaWiki put on it). A bare `<sup class="fn"></sup>` takes the next number in
    reading order, which is right only while every note is cited exactly once — and Wikisource REUSES a note
    wherever the translator repeats himself. Letter 114 cites one note four times and another three, so its
    21 notes carry 26 markers; numbered by reading order, every marker after the first repeat pointed one
    entry too far and the five past the end of the list were DELETED by `wireFootnotes`. Six letters do this
    (80, 82, 85, 94, 95, 114) and none of the first 65 does. **It is invisible to every count** — the notes
    are all present and correct, the prose is intact, nothing throws — so the check is to simulate
    `wireFootnotes` over the shipped data and assert that no marker is dropped and no note goes unreferenced.
    `stripTags` has to carry the attribute through, or it rewrites the marker back to the bare form.
  · **Read the contents page ROW BY ROW, not by the href on each link.** Both cells of a row link to the same
    letter, so keying off the href looks equivalent and is cheaper; it is not. On the `CIII.` row Wikisource's
    own markup hyperlinks the TITLE cell to Letter 104 while the numeral beside it correctly links to 103 — so
    103's title was filed under 104, overwritten there by 104's own title later in the document, and 103 fell
    back to the generic "Letter 103" while every other letter in the book was titled. The row is the structure
    the page actually means, and it needs only the numeral's href.
  · **Strip `<style>` BEFORE stripping tags.** MediaWiki ships each note's font templates as an inline
    `<style>` element (the Greek face for a quotation, the small caps for A.D./B.C.), and dropping tags
    first leaves the tags gone and the CSS TEXT behind — 24 of Seneca's 335 notes read "…on the Palatine,
    `.mw-parser-output .wst-asc{font-variant:all-small-caps}`…A.D. 41." for weeks. `cleanBody` had always
    done this for the prose; `notesOf` had not. It is **invisible to every check**: the note is a non-empty
    string of the right shape, the count is right, the markers all resolve, and only a reader opening that
    chapter's fold ever sees it. `stripWikiCSS` now does both halves, and `test-library.js` sweeps the
    SHIPPED data — every note of every book, not one rendered chapter, which would pass on luck.
  · **The `prp-pages-output` wrapper must not become a `<blockquote>`.** `cleanBody` turns every `<div>`
    into one, and the container holding the whole letter became a quotation OF the whole letter — every
    paragraph indented behind a rule and set in italic. 23 of the 65 chapters shipped that way. Its opening
    tag is now dropped before the generic pass, and `stripTags` discards the unmatched closer, which is
    exactly what its stack is for.
  · **The note list is cut off the prose by a class PREFIX, not by the whole attribute.** The split used to
    match `<div class="reflist"` with the closing quote — which is exactly what Seneca's pages carry, and
    Haines's carry `<div class="reflist wst-smallrefs">`, so it never fired and all twelve books of the
    Meditations came through with their entire footnote apparatus appended to the text as prose. It is the
    one fault of the five found on the FIRST run of a new book rather than by a reader, and only because
    the check was run over the shipped file: nothing throws, the note count is right, and the chapter is
    LONGER rather than shorter, so every count that would normally catch a truncation reads as healthy.
    The `<h2 id="Footnotes">` heading is taken as a second, independent boundary.
  · It also carries each book's **`about`** — the front matter prose, authored by hand here and emitted as
    `intro`. It lives in the generator rather than in app.js's eager `BOOKS` registry (a page of prose every
    visitor would pay for) or in the generated file (the next run would destroy it).
- `styles.css` (~235 KB) — editorial design system; 8 themes via CSS custom properties.
  **All theme color variables are hex** (e.g. `--ink:#1B1A17`) so the canvas globe can parse and
  blend them — keep them hex, not `rgb()`/`hsl()`.
- `app.js` (~684 KB) — all logic, written as a single IIFE. Hash-based routing via the `PAGES`
  map. No ES modules.
- `manifest.json` + `icon.svg` + `icon-maskable.svg` + `sw.js` — the PWA. See the "PWA" bullet below.
- `_headers` — Cloudflare Pages response headers: the **Content-Security-Policy** (plus nosniff /
  Referrer-Policy / Permissions-Policy). Verified against every route with 0 violations. `script-src 'self'`
  holds only because index.html has **no inline `<script>`** and app.js uses neither `eval` nor `new Function`
  — adding either would need the policy weakened, so don't. `style-src` needs `'unsafe-inline'` (app.js sets
  inline style attributes everywhere) and `fonts.googleapis.com` (styles.css `@import`s it); `img-src` needs
  `data:` (heightmap PNGs, avatars) and `blob:` (the avatar upload preview); **`media-src` allows `https:`**
  (linked card/glossary videos) and **`frame-src` allows exactly `youtube-nocookie.com` + `player.vimeo.com`**
  — nothing else may ever be framed. Headers only apply over HTTP, so
  opening index.html from `file://` is unaffected. If it ever breaks the live site, rename the header to
  `Content-Security-Policy-Report-Only` — violations keep showing in devtools without blocking anything.
- `docs/citation-plan.md` — the batch plan for **citing the 109 prehistory cards** (the bar a source must
  clear, the per-card workflow, how translations are staged, and the batches with their source spines).
  Not part of the site. **The bar is at least 5 citations per card** (`SRC_TARGET` in app.js; raised from
  2–4 on 2026-07-31) — **all 109 were there, with nothing blocked and nothing left to find**; batches 0–26 are complete.
  **That deck no longer exists**: World History was replanned on 2026-08-04 and 89 of those 109 were renumbered
  while 20 were retired, so the live figure is 89 cards all at the bar (plus Greece), and this file's `wh-NNN`
  references are the old numbering — read them through the table in `docs/world-history-card-plan.md`.
  Coverage is reported by `add-sources.js` on every run and in full by `node .claude/source-audit.js`. Its **Pilot log** records
  that batch 0 was attempted and stopped: this sandbox's egress policy blocks every scholarly host, so no
  source could be opened and none was cited. `.claude/sources-register.md` holds the verified citations
  (and, separately and clearly marked, unverified search-only candidates that must never be pasted in).
- `docs/glossary-citation-plan.md` — the batch plan for **citing the glossary**, the sibling of
  the card plan above. The bar is **at least 2 citations per term** (a description is three sentences, where
  a card's abstract is ten), and the acceptable sources are academic, museum, government or reputable
  NGO/IGO — **plus, since 2026-08-03 and on request, an encyclopedia that cites its own sources**, tested
  per article rather than per publisher (see N9's finding below: most do not).
  **THE GLOSSARY CITATION PASS IS COMPLETE: all 401 terms are cited and at the bar** (batches G1–G11, P1–P7, C0–C12, D1–D3, N1–N10), all with
  in-text markers in all ten languages. G11 COMPLETED Phase 1** (all 91 of its prehistory, palaeoanthropology,
  geological-time, peoples and physical-geography terms) **and P1 opened Phase 2** with the first six
  presidents, on the Miller Center's presidential essays; **P2 took it to Polk, P3 to Andrew Johnson, P4
  to McKinley, P5 to Hoover, P6 to Nixon and P7 to Biden, which finishes all 45**. **P1–P7 are the batches
  after G8 that correct almost nothing** — forty-five terms, fifteen clauses — because these descriptions
  were written from the same kind of institutional record the pass now cites; where a term and its citation
  come from the same kind of source, reconciliation finds little. **P2's finding is that the sources begin
  disagreeing with each other**: Harrison served "thirty-one days" per the White House Historical
  Association and "thirty-two" per the Miller Center, and the same Miller Center essay calls his post
  "governor of the **Indian** Territory" and puts Tippecanoe "in the Ohio River Valley", both contradicted
  by its own later paragraphs. A spine source is not infallible; read the whole essay, not the sentence
  that matches. Two routes it added: **a party platform is its own best citation** (the 1848 Free Soil
  platform, from UCSB's American Presidency Project, where no government page is reachable), and
  `history.house.gov`'s Historical Highlights work by the **numeric** `/HistoricalHighlight/Detail/<id>`
  path and NOT by the readable slug form, which serves an error document with a 200 status. **P3 is where
  the `Life in Brief` essay stops being enough on its own** — five of its six terms needed a second or third
  Miller Center essay, since a president between 1849 and 1869 is described by a statute, a treaty, a battle
  date or a trial, and Pierce's brief essay (the shortest of the 45, two paragraphs) carried one claim of
  eight. **P4 shows that was understated** — only two of its seven terms were carried by the brief essay
  alone, Grant took four essays, and Benjamin Harrison's Dependent Pension Act and six new states are in
  none of his essays at all and came from the Miller Center's **Key Events** timeline, which is a dated list
  of exactly the kind of claim a three-sentence description makes. **Reach for Key Events when the essays go
  quiet.** P4's own finding is the plan's Phase 2 warning arriving as written: both its corrections are on
  `Rutherford_B._Hayes`, where the term claimed "an informal bargain with southern politicians" that the
  cited essay explicitly calls doubtful, and said he "withdrew" the last federal troops where the record
  says he **ordered them to their barracks**. **P5 makes it unanimous** — none of its six was carried by the
  brief essay alone — and adds the SECOND SPINE the rest of Phase 2 needs: from 1901 a presidency turns on
  treaties and conferences, so the State Department's **Office of the Historian** carried five claims no
  presidential essay states (Portsmouth, the Fourteen Points, the League fight, the Washington Naval
  Conference, Smoot-Hawley), where P1–P4 had leaned on NARA because their claims were statutes. P5's own
  finding is what the **sibling-consistency check** is for: both its corrections are the SAME STATUTE seen
  from two sides twenty years apart — the Budget and Accounting Act of 1921 — with `William_Howard_Taft`
  credited with creating a budget system Congress explicitly refused him and `Warren_G._Harding` with
  creating a bureau no reachable source mentions (`gao.gov` is 403 here and `whitehouse.gov/omb` carries no
  history), each rewritten to what the cited essay does state. Neither was an error a source refutes; each
  was a summary reaching one step past the record, and only reading the two against each other showed it.
  It also adds a route: **when a NARA milestone slug 404s, try `docsteach.org`** — the Archives' own
  document-teaching site carried the Indian Citizenship Act with its statute citation and NARA identifier
  where `archives.gov/milestone-documents/indian-citizenship-act` does not exist. **P6's finding is about
  the five batches before it**, and it is why the plan now carries an owed **P-topup** row: every
  presidential term opens on "the Nth president, in office from X to Y", P1–P5 marked that sentence to the
  *Life in Brief*, and **most of those essays state neither the ordinal nor the term dates** (Hoover's
  contains no "thirty-first" and neither year). Not a wrong marker — the essay is about that presidency —
  but the two numbers the sentence asserts were resting on a page that does not carry them, and **the audit
  cannot see it**, since it counts citations rather than covered claims. The fix was already published:
  **the Miller Center's LANDING page for each president carries a Fast Facts block** with `President
  Number`, `Inauguration Date` and `Date Ended` outright — reach for it whenever a term opens on an
  ordinal. **The P-topup batch then cleared that debt the same day, and found nothing wrong**: the thirty
  ordinals and sixty term dates of P1–P5, checked for the first time against a page that states them, were
  right thirty times over — the one place in the pass where the prose needed no correction at all. It also
  RESOLVED two earlier findings rather than merely recording them: the Miller Center's Fast Facts gives
  Harrison March 4 → April 4, 1841, **exactly the 31 days** P2 chose over its own essay's "thirty-two", and
  gives Garfield March 4 → September 19, 1881, confirming the term's "about six months" against the essay's
  wrong "100 days". One parsing trap went with it — **Cleveland's block carries two of everything** (22 and
  24, both terms), so a script taking the first value after each label silently loses half his presidency.
  P6's own two corrections are both `Dwight_D._Eisenhower` and both from the Eisenhower
  Presidential Library: **"Supreme Allied Commander in Europe" is the NATO post he took in December 1950**,
  where his 1944 command was Supreme Commander, Allied Expeditionary Forces; and "kept military spending in
  check" is refuted by the cited essay, which says national security spending "never fell below 50 percent
  of the budget" while he cut conventional forces and built up nuclear weapons. A third clause was
  **withdrawn** rather than re-sourced — Nixon "promising order at home" is in nothing openable. The
  presidential libraries the plan named as P6's spine are only half-reachable (`jfklibrary.org` 403;
  the biography paths on `trumanlibrary.gov`, `lbjlibrary.org`, `nixonlibrary.gov` 404; `ssa.gov` 403), but
  the one that answered produced both corrections. And **check the byline**: the LBJ essays have no named
  author where every other president's do. **P7 finished Phase 2** and its four corrections are all one
  shape — **a clause claiming an ACHIEVEMENT where the cited essay describes an ATTEMPT**, which is what a
  batch of recent presidents produces: Reagan "loosened regulation" (the courts "forced the administration
  to retreat from many of its deregulatory efforts"), Clinton's EITC expansion and "time-limited
  assistance" (in no Clinton essay; the 1996 law is block grants replacing AFDC, and the essay's only "five
  years" is about immigrants' eligibility), Obama teaching "constitutional law" (he was "a lecturer at the
  University of Chicago Law School" — the institution, not the subject), and Trump's 2016 programme of
  "raising tariffs and cutting regulation" (the essay gives immigration, taxes and repealing the ACA).
  Three P7 routes worth keeping: **a superlative about a sequence is usually sourced from the essay on the
  person who broke it** (Reagan's "oldest at 69" and Biden's "oldest" are both in the TRUMP Life in Brief,
  and nowhere in their own); **an economic figure may be in no presidential essay at all** (no Miller
  Center page gives a Carter-era inflation rate — "double-digit" is sourced to Federal Reserve History's
  "The Great Inflation", which then serves Reagan too); and **reachable is not citable** — six presidential
  libraries answer here and not one carries a usable biography (JavaScript timelines, media galleries, 404
  biography paths), while the **Nobel Foundation's Carter biographical page** supplied six claims in two
  sentences. P7 also adds a THIRD variety of 200-status error document: `state.gov` and
  `2009-2017.state.gov` serve a page titled "Technical Difficulties" with a 200, and
  `whitehouse.gov/about-the-white-house/presidents/<name>/` is 404 for all nine (a 225 KB error document);
  `bls.gov` 403 and `fred.stlouisfed.org` refuses the connection. **C0 opened Phase 3 by breaking its own
  recipe, and the finding governs the remaining 191 countries: the CIA World Factbook — the plan's chosen
  Source A — is UNUSABLE**, since every path on `cia.gov` serves one identical 498,366-byte JavaScript
  shell with no country content (the word "France" appears zero times in the page served for France).
  **Source A is now UNdata** (`data.un.org/en/iso/<cc>.html`), server-rendered and per-country, whose **UN
  membership date field dates the independence of every modern state for free** — but it has no profile for
  a state without an ISO code, so `xk` (Kosovo) 500s and a state of limited recognition gets nothing from
  it. Add the **Commonwealth Secretariat** for small states (UNdata rounds Tuvalu to "10" thousand where
  the Commonwealth gives 11,790) and **Eurostat Statistics Explained** for anything sectoral in the EU
  (`iaea.org`, `iea.org` and the French energy ministry are all shut). `un.org` is reachable PATH BY PATH:
  the Charter text and UNISPAL serve real content, `/securitycouncil/*` returns a CloudFront "Request
  blocked" page **with a 200** and `/press/*` a JavaScript "Client Challenge" **also with a 200** — a
  fourth and fifth variety of 200-status error document. C0's two corrections are `Vatican_City`'s area
  (0.49 → **0.44 km²**, per the state's own governorate) and `South_Sudan`'s population (11 → **12
  million**, per UNdata) — **the second being the shape Phase 3 will keep producing, since every country
  term opens on a population that time moves past.** Its other honest output is a long list of clauses left
  UNMARKED and recorded in full in the register: where a claim is an act of state — a treaty, a resolution,
  a court ruling, an accession — it is citable and usually easy; where it is landscape or long history, it
  usually is not. **C1 then ran that recipe at scale and it held**: fifteen EU states on THREE works
  (UNdata, the EU's own country pages, NATO's member table) at two fetches each, **33 citations and no
  corrections**. The EU country page is the second source the recipe needed — Capital, Geographical size,
  Population and **"EU Member State : since <date>"** in one block, which dates the accession clause that is
  usually the only datable claim in a European term's third sentence. Sixteen areas and populations were
  checked against both sources and **every one held** — every area within 0.6% and most within 0.05%, which
  is the land-vs-total-area spread, not a contradiction. Two divergences that look like errors and are not:
  **the EU counts only the government-controlled area of a divided state** (Cyprus 979,865 against UNdata's
  1,371 thousand for the island — cite UNdata there), and **UNdata is sometimes the outlier** (Czechia
  10,609 thousand against the EU's and the term's 10.9 million), so **read both before assuming the prose is
  wrong**. C1's own finding is a limit: **a country term written without figures is invisible to this
  recipe** — `Greece` states no area, population or capital and was DEFERRED rather than given two sources
  nothing points at, which matters because several of the twelve long-form countries are the same shape.
  **C2 then nearly paid for C1's caution and turned it into a rule**: on `Malta`, `Portugal` and `Spain` the
  EU page's population would have made the term look wrong and UNdata confirms it (Spain 49,077,984 against
  UNdata's 47,890 thousand and the term's "roughly 48 million"), so **a batch run on the EU page alone would
  have produced three corrections, every one an error introduced rather than removed**. Read BOTH before
  concluding a figure is wrong; the disagreement between two official sources is routinely larger than the
  term's error. C2 also met the first wide area spread — the Netherlands' 41,850 km² against the EU's
  37,391, which is total against land area for a country a fifth water, and not a contradiction. Its six
  DEFERRALS name the recipe's limit: `Albania` (UNdata's 2,772 thousand contradicts the term's 2.4 million,
  and INSTAT's census pages don't carry the figure in their HTML — so a marker there would point at a work
  that refutes the sentence), and `Iceland`/`Norway`/`Switzerland`/`Andorra`, where UNdata confirms every
  figure but is only ONE source and the natural second is shut (`efta.int` and `coe.int` are both 403).
  **C3 then measured how far that goes: four of nineteen shipped and fifteen wait.** Outside the EU there is
  NO second institutional profile — `efta.int`, `coe.int`, `admin.ch`, `althingi.is` and `mfa.gr` are all
  403 — so the second source is per country, per claim, and exists only where the third sentence names a
  DATABLE ACT. The four that shipped are exactly those: Bosnia on the OSCE's Dayton page, North Macedonia on
  NATO's member table (2020), Norway on Norges Bank Investment Management (which calls the fund "one of the
  world's largest"), Ukraine on **General Assembly resolution ES-11/1** of 2 March 2022. **Read the third
  sentence first and ask what act it names**: a treaty, accession, resolution or founding has a source; a
  dynasty, a language family or a mountain confederation does not. Two C3 deferrals are warnings rather than
  gaps. **The UN membership date does NOT date independence for the Soviet founding republics** — `Belarus`
  and `Ukraine` both show 24 October 1945, because Byelorussia and Ukraine held UN seats in their own right
  from 1945, so a marker there would date the USSR's seat and not the 1991 independence the term claims. And
  **`United_Kingdom` is blocked by a SPLIT fault**: its Japanese translation runs to four sentences where
  the other nine run to three, so markers placed by sentence index would land on different claims — the
  first time the country pass has hit batch 24's failure, and the reason to **run `split-abstract.js` over a
  batch's terms before planning its markers**, which C0–C2 passed by luck rather than by rule. `Greece` has
  now been deferred THREE times (no area, no population, no capital; `mfa.gr` 403) and needs a rewrite or a
  new class of source rather than a fourth deferral. **C4 found the bloc profile the recipe needs OUTSIDE
  Europe: the Commonwealth Secretariat's country pages**, whose Key Facts block carries Population, Area,
  Capital city and the year of joining WITH its independence context in one line ("1947, following
  independence from Britain"; "1965, on leaving the Federation of Malaysia") — the same shape as the EU's
  accession field, from a body covering 56 states across Asia, Africa, Oceania and the Caribbean, which is
  most of the rest of Phase 3. **But the joining line is not always the independence line**: Bangladesh's
  gives 1972 against the term's 1971, and UNdata's UN membership date (1974) is later still, so BOTH
  institutional dates postdate the independence they follow and that sentence was left unmarked. C4 also
  settles the read-both rule beyond argument by breaking it in **opposite directions in one batch**:
  Pakistan's area is 796,095 km² at UNdata and 882,000 at the Commonwealth (the Kashmir question — a
  political fact, not a measurement convention, and the widest divergence in Phase 3), where the term
  matches the Commonwealth; India's is 3,166,391 at the Commonwealth and 3,287,263 at UNdata, where the term
  matches UNdata. Either source alone would have produced a wrong correction on one of two neighbours.
  **C5 then probed the three blocs C4 named and all three fail**: `asean.org` returns 307 on every path
  including the root, and the OIC, the Gulf Cooperation Council and the League of Arab States publish no
  per-country profiles — so **Asia outside the Commonwealth has no bloc profile** and is C3's position one
  continent over. Its four shipped terms all came through C3's act-of-state rule, and three of the four
  second sources are **UN instruments served by `documents.un.org` and UNISPAL** where `un.org`'s topic
  sections are CloudFront-blocked (GA resolution 181 (II) for Israel, SC resolution 1272 for East Timor),
  plus the **Office of the Historian's Korean War milestone, which cites BOTH Koreas from one page**. C5's
  own rule comes from the **United Arab Emirates**: UNdata gives 71,024 km² against the term's 83,600, a
  **17% gap — the widest in Phase 3** — with no second official source to break the tie, so the term was
  DEFERRED rather than corrected. **When UNdata is the only profile and disagrees by more than a rounding,
  defer; never correct on one source.** Two smaller notes: `China`'s figures match UNdata exactly and the UN
  Charter names it a permanent Security Council member, but its term never mentions the Council, so **an
  open, authoritative source about the right country is still not a source for a claim the term does not
  make**; and `Taiwan` is the SECOND split fault after `United_Kingdom` (Japanese runs to four sentences
  where the others run to three), which settles that **`split-abstract.js` must be run over a batch's whole
  term list before its markers are planned**. **C6 ran that check FIRST and it paid at once** — `Lesotho`
  splits into four sentences in German and `Malawi` into four in Chinese, both removed before any research
  was done, where `United_Kingdom` and `Taiwan` were caught after theirs. Four faults in four batches makes
  it a standing step. C6 also MEASURED C4's joining-line rule across thirteen African Commonwealth states:
  **it is the independence line eleven times in thirteen** (Ghana 1957 through Namibia 1990, all marked),
  and the exceptions have a shape — **`Mozambique` (joined 1995) and `Rwanda` (joined 2009) were never
  British**, so their joining line dates an accession, not an independence; `South_Africa` left and rejoined;
  and **`Cameroon` is the near-match to withhold on**, since the years agree but the term describes French
  and British portions independent in 1960 and 1961 joining together, which the Commonwealth's single line
  does not describe. Its populations all sit BETWEEN the Commonwealth's 2022 figures and UNdata's 2025 ones,
  which is what a term written from a recent-but-not-current estimate looks like and is not an error.
  **`Kenya` is the Greece shape and its recurrence is the thing to carry forward**: both state no area, no
  population and no capital, and both are among the twelve countries the plan calls "written earlier and at
  greater length" — that length is extra PROSE, not extra FIGURES, which is what makes them invisible to a
  recipe built on statistical profiles. Expect the same of the remaining ten.
  **C7 then found the source that opens the rest of Phase 3, and it is not a statistical profile.** The
  Office of the Historian's **`history.state.gov/countries/<slug>`** — *A Guide to the United States'
  History of Recognition, Diplomatic, and Consular Relations, by Country, since 1776* — has a page for
  **every state in the world**, and its Recognition section states in prose when a country became
  independent and from whom. C3's "outside the EU there is no second European profile" and C5's "Asia
  outside the Commonwealth has no bloc profile" both stand for FIGURES and are now largely beside the
  point, because **the third sentence of a country term is almost always an independence date** and this
  guide carries it everywhere: it gave `Somalia` two of its three historical claims from one page, both
  halves of `Kenya`'s "British control in the late 19th century … independent in 1963" (dating the
  colonial rule to 1895), and the colonial names — Basutoland, Nyasaland, Tanganyika, Togoland — several
  terms turn on. It is written from the American point of view, so a date is often a *recognition* date;
  cite it only where the page states the event beside it. C7's own rule is a limit on markers: **where a
  profile carries a term's FIGURES, marking the figure sentence to it is the C1–C6 practice and continues;
  where it carries only UNdata's Region field, it has not earned a sentence** that also asserts a plateau,
  a rift valley and a lake — which is how `Kenya`, deferred three times, finally shipped, by DROPPING the
  source that had nothing to say about it rather than by finding a figure. Its one correction (`Togo` 9 →
  **8.6 million**) is right because BOTH sources agree against the term, while `Gabon` (2.4 against 2.593)
  and `Somalia` (18 against 19.655) were **not** corrected — UNdata alone, so C5's UAE rule holds and C0's
  South Sudan correction stays the exception. Two Commonwealth slugs were recovered by the rule that **the
  slug follows the member's FORMAL name** (`united-republic-tanzania`, `kingdom-eswatini`), which retires
  C6's Tanzania deferral; and **a member admitted recently has a page but not a profile** (Gabon's says
  only that it joined in June 2022, with "No data found" where the population belongs). Its three
  deferrals — `Egypt` (107 against 118.4 million, a **10.6% gap, the widest in Phase 3**, and a live
  UN-against-national disagreement rather than an error), `Ethiopia` and `Libya` — are all one shape: a
  figure diverging from UNdata with no second profile, over a third sentence too ancient for the
  recognition guide. `whc.unesco.org` is **403**, `au.int` publishes no country pages and `afdb.org` /
  `oecd.org` are 403, so the AU is not a bloc profile either; `icj-cij.org/case/<n>` is 200 and usable.
  **C7 also ran the split audit over the WHOLE glossary rather than its own list, and that is the version
  to keep**: it found seven faults of two kinds, both now fixed, leaving **0 of 333**. Five were one
  authoring fault — **the Chinese rendered an English semicolon as a full stop**, turning three sentences
  into four on `United_Kingdom`, `Taiwan`, `Malawi`, `New_Zealand` and `Papua_New_Guinea` and nothing else
  — which **unblocks `United_Kingdom` (deferred in C3) and `Taiwan` (C5)** and clears two Oceania terms
  before C10 reaches them; **check a term whose English uses a semicolon.** Two were a splitter gap:
  German writes a regnal number as a Roman numeral with a trailing period ("König Leopold **II.** von
  Belgien", "Moshoeshoe **I.** in den 1820er Jahren"), which the existing German guard could not see since
  a Roman numeral is not `\d` and no determiner precedes it. `split-abstract.js` now holds a Roman numeral
  that follows a capitalised NAME and is followed by a LOWERCASE word — the test that tells a mid-sentence
  regnal number from a sentence genuinely ending on one — verified against all 109 cards in all ten
  languages with no regressions. **Four of the five Chinese faults sat in terms nobody had reached yet**,
  where a batch-scoped check would have found them only after the research was done.
  **C8 then turned C7's find into a two-fetch RECIPE FOR ANYWHERE** — UNdata for the figures,
  `history.state.gov/countries/<slug>` for the history — and ran it over fourteen African states in
  neither the EU nor the Commonwealth, exactly the position C3 and C5 called sourceless. Its finding is
  about figures and it changes how a divergence is read: **a population that disagrees with UNdata is
  usually STALE rather than contested, and you can PROVE which.** The World Bank API
  (`api.worldbank.org/v2/country/<ISO3>/indicator/SP.POP.TOTL?format=json&date=2015:2025`) returns the
  whole series, and thirteen of C8's fourteen terms turned out to state **an earlier point on that same
  series** — Egypt's "107 million" is the 2019 value to two decimals, Chad's "18 million" the 2022 value,
  DR Congo's "105 million" the 2023 value — so they were not disputing UNdata, they were written from it
  years ago. All thirteen were updated to the 2025 figure in ten languages. **Before deferring on a
  population, ask the series when the term's figure WAS true: if it names a year, the figure is stale and
  updating it is safe; if it names none, the figure is contested and C5's rule stands.** Two cautions.
  **The World Bank is NOT a second source for a population** — `SP.POP.TOTL` relays the UN's own estimate
  (21,003,705 for Chad against UNdata's 21,004 thousand, the same number), so citing both would be false
  corroboration; it is a diagnostic and belongs in no source list. And **this revises C7's Egypt
  deferral**, which read 107-against-118 as a UN-against-national disagreement — it was simply six years
  old, and Egypt is cited in C8. Its one non-figure correction is `Djibouti`, "French Somaliland until
  independence in 1977" → **"ruled by France, latterly as the French Territory of the Afars and the
  Issas"**, that being the territory the guide names at the date the term gives. `Comoros` is deferred for
  two reasons at once, both worth knowing: its 1,861 km² counts the islands it governs where UNdata's
  2,235 counts the archipelago **including Mayotte** (C1's Cyprus case in reverse), and **a recognition
  date is not an independence date** — the guide records U.S. recognition in 1977 against the term's 1975.
  Slugs: the two Congos are **`congo-democratic-republic`** and **`congo-republic`**, and the index at
  `history.state.gov/countries` resolves any in doubt. The API serves a **UTF-8 BOM** (decode `utf-8-sig`)
  and returns an empty body under rapid repeats, which retries fix.
  **C9 finished Africa (56 of 56) and found the second source for AREA.** C8's caution was that
  `SP.POP.TOTL` relays the UN's own population and so cannot corroborate it; **`AG.SRF.TOTL.K2` is a
  different series** (World Bank via the FAO, not the UN Statistics Division) and it **resolved both
  standing deferrals in the same direction — the term was right and UNdata was the outlier**. `Libya`,
  deferred in C7 on a 5.0% gap, states 1,759,540 km², the World Bank's figure exactly, against UNdata's
  1,676,198; `Comoros`, deferred in C8 because UNdata's 2,235 km² counts Mayotte, states 1,861 km², again
  the World Bank's figure exactly. **When UNdata's area looks wrong, ask `AG.SRF.TOTL.K2` before
  deferring** — and pass a SEMICOLON-SEPARATED country list in one request, which is also the way round
  the API's empty-body behaviour under rapid single fetches. Elsewhere the two agree within 0.05%, which
  is what makes those two meaningful, and the line C9 draws is: **correct an area only when the term falls
  OUTSIDE the spread of the two sources** — `Ivory_Coast` (322,463 against 322,462 and 322,460) falls
  inside and was left, `Senegal` (196,722 against 196,712 and 196,710) falls outside and was corrected.
  Its other corrections are thirteen more stale populations by C8's method (`Tunisia` alone still current)
  and one date narrowed: **`Madagascar`'s "France conquered it in 1897" → "in the 1890s"**, the guide
  giving 1890 for the protectorate against 1897 for the annexation — two different acts, so batch 16's
  rule applies and the decade is what the source will bear. Two things to carry: **four UN membership
  dates do NOT corroborate an independence year** (Mauritania 1961 against 1960 and Libya 1955 against
  1951, both Cold War admission deadlocks, plus Liberia and Ethiopia at 1945) — C3 found this for the
  Soviet founding republics and the deadlock is the other family; and **`Sudan`'s UNdata profile has no
  Surface area field at all**, the only one in Phase 3 that omits one, so its 1,861,484 km² rests on
  nothing openable here. Côte d'Ivoire's guide slug is **`cote-divoire`**.
  **C10 finished OCEANIA on three sources at once** — UNdata, the Commonwealth and the recognition guide,
  ten of its thirteen being Commonwealth members and all thirteen having a guide page. The three do
  different jobs and `Australia` shows it: the guide states "On January 1, **1901**, six colonies were
  joined together to create the Commonwealth of Australia", the term's whole third sentence, where the
  **Commonwealth's own joining line gives 1931 and the Statute of Westminster** instead. Its finding is a
  contrast: **C8 and C9 corrected twenty-six populations between them and C10 corrected three** — not
  better editing but arithmetic, since **a figure rounded to two significant figures survives a decade of
  slow growth** and these populations are small and flat or falling where Africa's are large and growing
  at 2–3% a year. `Marshall_Islands` is the case to remember: its 40,000 was stale by being **too HIGH**
  (48,800 in 2015 down to 36,282 in 2025 as people leave under the Compact), so **"out of date" must not
  be read as "too low"** — C8's diagnostic runs both ways. C10 also **qualifies C9's area rule**: the
  World Bank ROUNDS small areas to the nearest 10 km² (Tonga 750, Kiribati 810, Nauru 20), so its figure
  is an interval, not a point; `Fiji` was corrected 18,274 → **18,272** because UNdata *and* the
  Commonwealth both give that precisely and 18,274 is outside 18,270 ± 5 as well. Three source
  disagreements are recorded and each was decided on the majority: **`Kiribati`'s area** (UNdata's 726 km²
  against 811 at the Commonwealth, 810 at the World Bank and 811 in the term — so **UNdata is dropped from
  that term outright**, the first time Phase 3's Source A has been); **`Solomon_Islands`' area** (the
  Commonwealth's 30,407 the outlier against ~28,896, so its citation carries only the third sentence); and
  **`Palau`'s capital** (the term's Ngerulmud against UNdata's Melekeok — the seat of government against
  the state it stands in, recorded not corrected). Micronesia's guide slug is simply **`micronesia`**.
  **C11 (North and Central America and the Caribbean, twenty terms) found the sharpest limit on the
  recognition guide: it dates by U.S. RECOGNITION, and in Spanish America that is not independence.**
  Mexico was recognised in **1822** against independence in 1821, the Central American states through the
  Federation in **1824**, Haiti in **1862** against 1804, the Dominican Republic in **1866** against 1844.
  Where a page happens to state the independence year separately it still works (Guatemala's "Following
  its independence from Spain in 1821", Haiti's "won independence from France in 1804"); where it does
  not, it cannot carry the term's date, and **grepping the saved HTML for the year is the two-second
  check**. `Mexico`, `Costa_Rica` and `Nicaragua` are deferred on exactly that — and **`Costa_Rica` is
  the one not to paper over**, since its page does not merely omit 1821 but says Costa Rica "did not
  formally declare its independence until **August 30, 1848**"; both dates are defensible and the term
  needs a prose reconciliation rather than a citation. **The United States has no page in the guide** (it
  is written from the United States outward), so its third sentence is carried by **NARA's Milestone
  Document for the Declaration of Independence** and the guide's **Treaty of Paris, 1783** Milestone.
  C11's second finding is a caution on C9's tool: **the World Bank's area series contains outright
  ERRORS** — Canada at **15,634,410 km²** against the true 9,984,670, and the Dominican Republic at
  **146,839** from 2019 against 48,671 with its own 2018 value at 48,670 — so **apply a plausibility
  check before letting it adjudicate**. And the population diagnostic **said "do not touch" for the first
  time**: `Cuba`'s term says 9.4 million against UNdata's 10,937 thousand, a 14% gap, but the World Bank
  series never passes through 9.4 million (11.23 m in 2018 down to 10.94 m in 2025), so by C8's own test
  the figure is **contested, not stale**, and was left alone. Three more where UNdata is the outlier and
  the term stands: `Trinidad_and_Tobago` (1,511 thousand against 1.37–1.4 million at the World Bank and
  the Commonwealth), `Canada` and `United_States`, whose terms sit with the national estimates. Its eight
  corrections are five stale populations, **`Barbados` 270,000 → 280,000** (three sources above the term)
  and **`Saint_Vincent_and_the_Grenadines` 110,000 → 100,000** — the C10 falling-population pattern *with
  the corroboration attached*, the Commonwealth's 2022 figure of 110,900 showing the term was right when
  written — plus one area, `Panama` 75,417 → **75,320**. Slug note: **the two sites spell the same states
  differently** (`st-kitts-and-nevis` at the Commonwealth against `saint-kitts-nevis` at the guide), and
  both publish an index worth grepping.
  **C12 (South America, twelve terms) REFINED C11's warning rather than repeating it.** C11 concluded the
  recognition guide is unusable for Spanish America; **the same guide states the independence year
  outright on nine of twelve South American pages** — Colombia "by 1819", Peru "in July 1821 under
  General San Martin", Bolivia "on August 6, 1825", Paraguay "on May 15, 1811", Argentina "in 1816",
  Uruguay "in 1828". The difference is structural: **those pages open with a sentence of CONTEXT before
  the recognition paragraph, and that sentence carries the date**, where Mexico's, Costa Rica's and
  Nicaragua's have none. So the rule is **"the recognition date is not an independence date — read the
  summary paragraph"**, with a grep of the saved HTML as the check. **`Venezuela` is saved by a
  preposition**: the guide says independence was achieved "by 1819" and the term says "by 1821", and
  *achieved by 1819* entails *achieved by 1821* — where "in 1819" against "in 1821" would have been C6's
  Cameroon near-match. Two terms had no history source and still reached the bar: **`Brazil`**, whose
  third sentence is left unmarked and which is carried by its FIGURES (UNdata and the World Bank's area
  series both giving ~8.51 million km², independent measurements rather than one relayed) — **a term can
  reach the bar on its first sentence alone when the second source measures rather than relays** — and
  **`Chile`**, where the country page gives 1810 and not 1818 but the **Milestone** "The Allende Years and
  the Pinochet Coup, 1969–1973" carries the term's other claim. **When a country page will not date the
  independence, look for a Milestone on the term's other claim.** Its largest correction is the largest
  area correction of Phase 3 — **`Ecuador` 283,561 → 257,217 km²**, UNdata and the World Bank agreeing
  within 0.3% and the term 10% above both (a pre-1998-border-settlement figure is the plausible
  explanation, recorded as a hypothesis and NOT cited). And **UNdata was the outlier three times in four**
  on area (`Venezuela` between the two, `Argentina` and `Uruguay` matching the World Bank), which with C9's
  Libya and C10's Kiribati settles that **Source A is a source, not an authority**.
  **D1 cleared the whole European deferral list (nineteen terms) and completed EUROPE**, using tools
  that did not exist when C2, C3 and C5 deferred them — the recognition guide (C7) and the World Bank's
  two series (C9, C11). It opens with a correction to the pass's own bookkeeping: **C9 claimed Africa
  complete at 56 of 56 and it was 55**, because `Cape_Verde` never appeared in any batch's list — the
  country lists from C7 onwards used the UN's spelling *Cabo Verde* against the glossary key
  `Cape_Verde`, so it matched nothing and nobody noticed. **Derive a batch's list from the glossary's own
  keys (`gloss-source-audit.js`'s uncited list), never from an outside list of country names.** Its
  finding revises C8: **`SP.POP.TOTL` is NOT always the UN's number.** Where a country runs its own
  statistical service the World Bank uses that instead, and `Albania` (2,349,580 against UNdata's
  2,772,000) and `Moldova` (2,360,527 against 2,996,000) both match the TERM while UNdata is the outlier
  — which is exactly why C2 deferred Albania, reading a 13.4% gap as the term being wrong. Both now cite
  the World Bank and drop UNdata entirely. **Check whether the two actually agree before treating the
  World Bank's population as a relay.** D1 also **retires the Greece shape** — a country term stating no
  area, population or capital, deferred four times — by REWRITING the opening sentence to state the
  figures its 195 siblings state: `Greece` gains 131,957 km² and Athens, `Georgia` gains 69,700 km²,
  3.8 million and Tbilisi. **No population was added to Greece** (UNdata 9,939 thousand against the World
  Bank's 10,413,962, a 4.8% gap it would be arbitrary to resolve). These are logged as rewrites, not
  corrections — nothing either term said was wrong. Its two real corrections are `Switzerland` 41,285 →
  **41,291** and `United_Kingdom` 244,376 → **243,610**; and `Monaco` at **75 km²** is the third outright
  World Bank area error after C11's Canada and Dominican Republic.
  **D2 cleared the ASIAN deferral list — thirty-one terms, thirty of them on the same two fetches** —
  which retires C5's "Asia outside the Commonwealth has no bloc profile" the way C8 retired C3's and C5's
  equivalents for Africa: the claim was true and is beside the point, since UNdata plus the recognition
  guide carries everything. Only `Bhutan` has no guide page (C12's `Brazil` pattern, figures alone).
  **Myanmar's guide slug is `burma`.** It resolves **C5's UAE deferral by C5's own rule**: UNdata's
  71,024 km² against the term's 83,600 was "the widest gap in Phase 3" with no second source, and the
  World Bank's **98,648** puts the term BETWEEN the two, so it stands untouched — the instinct was right
  and only the second source was missing. Twelve populations were corrected, **`Yemen` 34 → 42 million**
  being the largest of the pass, but **`Lebanon` was withheld**: its 5.5 million sits 6.4% below both
  sources and yet the series never passes through 5.5 (6.5 m in 2015 down to 5.7 in 2020–22), so it is
  contested rather than stale. After C11's Cuba that is the second withholding, and both are countries
  whose population is argued about rather than counted. **`Taiwan` is deferred for a reason worth stating
  precisely**: no UNdata profile (a 500, as Kosovo's `xk` gives), no guide page and no World Bank series
  — all three of Phase 3's sources are organised around UN membership, so a state outside the UN system
  is invisible to every one of them, and it needs a different CLASS of source rather than more searching.
  Its five area corrections leave `Iran` alone as inside the widest source disagreement of the pass
  (UNdata 1,630,848 against the World Bank's 1,745,150, 7% apart, the term between them).
  **D3 FINISHED THE PASS at 333 of 333.** `Costa_Rica` got the prose reconciliation C11 called for
  rather than a citation — "independence from Spain came with the rest of Central America in 1821 and
  Costa Rica declared itself a separate republic in 1848" — with each half cited, the 1848 to its own
  page and the 1821 to the guide's **El Salvador** page, whose sentence is explicitly about "the other
  Central American provinces" and so serves `Nicaragua` too. (C11 saw that route and left it because a
  citation headed "…: El Salvador" on a Nicaragua term reads like a filing error; it is used, and the
  register says why.) **`Mexico` is cited on its figures with the independence clause unmarked** —
  nothing openable here dates Mexican independence to 1821, `loc.gov` being 403 — and its World Bank
  citation NAMES THE YEAR 2019, because that series gives 1,964,380 for 2018–19 and drifts to 1,957,194
  by 2023 with no explanation, the same movement that proved to be error for Canada, the Dominican
  Republic and Monaco. **`Taiwan` was cited without any of Phase 3's three sources**, all of which are
  organised around UN membership: the way in was the guide's **Milestones**, which are about EVENTS
  rather than states ("The Chinese Revolution of 1949" and "The Taiwan Strait Crises"), with its figures
  left unmarked since `taiwan.gov.tw` is 403 and the reachable Taiwanese statistical sites are
  JavaScript-driven. **A term can be cited on its history alone when its figures have no openable
  source** — the mirror of C12's `Brazil`.
  P3 also refines the `senate.gov` warning:
  its **impeachment** pages are real, its party-history and vice-president paths are the shell, and **the
  shell is a constant 37,523 bytes**, so a size check tells them apart instantly. Three access findings from it govern the rest of Phase 2 and Phase 3:
  **a URL containing a closing parenthesis cannot be cited** (`SRC_URL_RX` stops at `)`, which rules out
  every congressional bioguide address), **`senate.gov` serves its 404 page with a 200 status**, and
  **`monticello.org` and `founders.archives.gov` are closed here** — so Founders Online, named as a
  second-source spine in the plan, is not usable and the NARA milestone documents replace it. G9's finding held into G10 and G11 and is now a law of the pass:
  the register pays for taxa and periods and **not** for peoples, places or objects, so 24 of G9's 26 and
  18 of G10's 20 works were new — and where no reachable source uses a familiar term of art (there is no openable
  qualifying source here that says "potlatch"), the prose says what the cited source says rather than
  keeping the word over a citation that does not contain it. **G10's own finding re-cut the rest of Phase 1**:
  its planned 17 terms split down the line between claims that are MEASURED RESULTS (citable from here — ice
  thickness, a population, an ocean's depth) and claims that are CONVENTIONS OR CONSTANTS (not — "Europe is a
  continent", the equator's circumference, a hemisphere's land fraction), so the six continents, `Sicily`,
  `Equator` and the two hemispheres became **G11**. It is card batch 2's rule in a new dress: subject does not
  predict reachability, the KIND of claim does. **G11 then proved the split both ways**: every convention it
  met was citable — Mortimer et al.'s Zealandia paper states the criteria for calling something a continent
  because it is arguing a contested case, and names the six geological continents as including **Eurasia**,
  which is one open work carrying a sentence on six of its ten terms — while every constant was not, and is
  recorded unmarked. Its own finding is about a figure rather than a term: **no reachable authority publishes
  a continent's AREA, and the obvious one is actively wrong** — the UN's M49 scheme assigns whole countries to
  regions and so puts all of Russia in Europe, giving Europe 22.1 and Asia 31.0 million km² against the
  conventional 10.2 and 44.5. Cite the UN's Demographic Yearbook Table 1 for POPULATIONS, never for area. Two things about this pass that the card pass does not have: a term whose
  prose is corrected — or whose markers are placed — needs a second command in the same
  batch (`add-lang.js` for the nine languages, since `add-sources.js` writes only the English description);
  and Phase 1 is largely paid for out of `.claude/sources-register.md` already.
  (**Markers were OPTIONAL on a term through G1–G4 and are now REQUIRED**, changed on request 2026-08-01
  when the reader asked where the numbers were: lists had grown to five and six sources, at which size the
  list stops explaining itself, and a reader arriving from a fully-marked card read the vanishing numbers
  as the apparatus giving up. `add-sources.js` refuses an unmarked term or an unreferenced source, exactly
  as for a card; `add-lang.js` warns on a translation whose markers differ from the English, and
  `gloss-source-audit.js` reports both standing.) It also records which
  scholarly and official hosts were **reachable from this sandbox on 2026-08-01**, measured rather than
  assumed. **Batch G0 (tooling) has shipped**: `GLOSS_SRC_TARGET = 2` sits beside `SRC_TARGET` in app.js and
  is sliced out of it by text by `.claude/gloss-source-audit.js` (the mirror of `source-audit.js`, plus a
  `--tag=` filter and two checks a two-source list makes easy to fail — not-majority-open, and a citation
  with no access label) and by `add-sources.js`, which now warns a short term and reports glossary coverage
  against the bar. The **admin glossary list carries a coverage chip** like the card list, in two states
  rather than three (no `sourcesBlocked` on a term) and never on a deck term. Not part of the site.
- `docs/greece-card-plan.md` — the **1000-card running order for the Ancient Greece collection**
  (`col-13`): every card's number, topic and deck, fixed in advance across 19 leaf decks, so the deck
  can be grown one card at a time over many sessions. See the "ANCIENT GREECE" bullet under "Generating
  cards & glossary entries" for the workflow — the short version is that the next card to write is the
  lowest `gr-NNN` not yet in `data.js`. Not part of the site.
- `docs/world-history-card-plan.md` — the **1000-card running order for the World History collection**
  (`col-8`): every card's number, topic and deck, fixed in advance across 8 decks and 39 leaf subdecks,
  so the collection can be grown one card at a time over many sessions. The sibling of the Greece plan
  and used the same way — the next card to write is the lowest `wh-NNN` not yet in `data.js` — see the
  "WORLD HISTORY" bullet under "Generating cards & glossary entries". It also holds **the 2026-08-04
  renumbering record**: the collection was replanned from scratch on request, 89 of the 109 shipped
  prehistory cards were renumbered into their planned slots and **20 were retired**, and that file has
  the old→new table every earlier document's `wh-NNN` references must be read through. Not part of the
  site.
- `docs/history-focus-plan.md` — the rule that **Folio is a history site, not an archaeology site**, the measure that
  finds cards written the other way round (24 of 119 flagged, measured before the 2026-08-04 renumbering — the
  flags travel with the cards, the ids in its table do not), and the six rewrite batches. Opened Aug 2026 on request
  after `gr-008` Knossos was found to be mostly about who dug it. Not part of the site.
- `docs/card-glossary-pairing.md` — the rule that **a new card ships with a glossary entry for its own answer term**,
  and the backfill plan for the 77 of 119 shipped cards that have none. Its P9/P10 (the ten Ancient Greece terms) come
  first. Not part of the site.
- `docs/glossary-length-plan.md` — **every glossary description at 100 words (±10%)**, on request (Aug 2026): the
  bar, the measured baseline, the eleven batches, the per-term workflow and the batch log. **L0 (the tooling)
  L1–L10 and the L-audit have ALL SHIPPED — **THE PASS IS COMPLETE: 477 of 477 terms are inside the bar
  (100%), mean 106.7 words, range 90 (`James_A._Garfield`) – 110 (`Y-chromosomal_Adam`), and every one of the
  eighteen kinds is 0 outside**: the 197 countries (A–E, F–L, M–R, S–Z), L5's 55 caves, type sites, continents,
  oceans and regions, L6's 54 people (45 US presidents plus nine antiquarians, archaeologists and a poet),
  L7's 44 periods and stone industries, L8's 40 taxa, fossils and animals, L9's 45 tools, artworks, cultures
  and peoples, and L10's 24 concepts with the four singleton kinds.
  `node .claude/gloss-length.js` is
  the measure, with `--over` / `--under` / `--tag=<kind>` / `--list`. **What keeps it true is the rule, not the
  measure**: a new term ships at 90–110 words, three sentences, cited at the bar, exactly as it ships with its
  citations — so **re-run `gloss-length.js` after `add-sources.js` and after `add-glossary.js`**, since both
  write prose and neither measures it. Three things the bar does not
  change and which the pass must not quietly relax: still exactly three sentences, still impartial and
  self-contained, and **still no claim past what the citations carry** — a term padded to length is the one way
  this pass can do real damage. Two rules L1 established and the later batches should just apply:
  **an imperial conversion does not count** (`gloss-length.js` strips it, exactly as `add-card.js` does — the
  measure counted them at first, which held the glossary to a tighter prose budget than the cards for no reason
  but its subject matter), and **the border list is the first thing to cut** on a country term, worth 9–13 words
  and telling a reader less than the region already did. **L3 recast the "keep it where the borders ARE the
  fact" exception as a TEST to run on every term** — *does naming the neighbours say more than the region
  already did?* — because nine of its 43 kept theirs (Moldova, Mongolia, Nepal, the Netherlands, North Korea,
  Panama, Portugal, Qatar, Monaco) against one apiece in L1 (Bhutan, Bangladesh) and L2 (Luxembourg). The
  reason is arithmetic rather than luck: **a list of two is not a list.**
  **L3 also names the ISLAND term's equivalent of the border list**: a
  distance-to-the-mainland locator ("about 400 km (250 miles) off the southeast coast of Africa"), the same
  formulaic clause in a different coat, worth 8–11 words with its conversion and saying nothing the region
  already hasn't. Six of L3's terms lost one, and **L4 confirmed L3's measurement exactly** — all four terms
  it named carried the clause and all four lost it. **L4's refinement is that the clause has a PROSE form the
  regex cannot see** (`Tonga`'s "spread over a long north-south stretch of ocean", `Vanuatu`'s "lying east of
  Australia and north of New Caledonia"), so the numeric grep found four of six: **grep the shape to plan a
  batch, then read the batch's own first sentences.** On the other hand **not every country term has
  the recipe's 30 spare words**: a microstate, a single-island state or a term opening on a superlative
  (`Monaco`, `Nauru`, `Marshall_Islands`, `Russia`) has no border list and no ordinary landscape sentence, and
  there the words come out of real claims — which is why L3 and L4 name more substantive losses than L1 or L2.
  **Diff the FIGURES before and after a batch**: L1 shipped with zero numbers added or altered and 23 dropped
  with their clauses, three of them substantive, and naming which is the honest half of a trim; L2 the same, with
  17 dropped and six substantive; L3 with 15 dropped and four; L4 with 24 dropped, six substantive, and the ONE
  figure it added a correction — `Vatican_City` gave its area as "0.44 km² **(0 sq mi)**", a conversion rounded
  to nothing, which the units sweep could not see because it looked for MISSING conversions rather than useless
  ones. **A metric figure below one imperial unit needs two significant figures in its bracket**; the whole
  glossary was swept and it was the only one. **L5 dropped 102 and added none, nine substantive**, and its
  finding is the one to reach for on any batch of DATED terms: **the date line was in the prose twice.** 29 of
  its 55 carry a `GLOSSARY_DATES` entry, which the popup prints directly above the description, and the prose
  then restated the same span in words — so **read `GLOSSARY_DATES` before deciding a dropped date is a loss**
  (eight headline dates were queued for restoration before the table showed every one already on screen).
  L7 and L8 are the next two batches where that pays. **L5 also names the SITE term's padding class:
  excavation administration** — who dug, when, how many seasons, how deep — worth 15–25 words, and the one
  class the house rules already told us to cut, `docs/history-focus-plan.md` saying Folio is a history site
  and not an archaeology site. **L6 then transferred the date-line finding to the 45 presidents**, every one
  of whom opened by restating the term dates its `GLOSSARY_DATES` line already carries — but it must NOT
  become a template change, since cutting it from all 45 would push nine in-band ones below 90; it is a
  clause available to a term that NEEDS words, exactly like the border list. L6 also **half-refutes the
  office-list prediction made here**: on a president the prior career is how they got there and is not
  padding (Bush Sr's congressman → UN → CIA → vice president is the point of him), and the real padding
  class is the **run-on ENUMERATION** third sentence — nine achievements joined by "and … and … and", 88
  words on `George_W._Bush`. **L6's own hard finding is a constraint the earlier batches never met: a term
  whose citations are ONE-PER-CLAIM cannot lose that claim.** `Barack_Obama`'s Nobel Foundation source and
  `Donald_Trump`'s *Foreign Affairs* essay each carry exactly one clause, so cutting it ORPHANS the source
  and `add-sources.js` refuses the batch — read the source list before choosing what to cut. And its two
  GROW cases (the pass's first) both grew from a work already in the term's own list rather than from
  padding: **a term under the bar is usually under it because it left something out** — `Sima_Qian` never
  cashed its own promise to say what the Shiji's "arrangement" was. **L7 then transferred the date-line rule a
  third time and sharpened it — CUT THE SPAN, KEEP THE CAVEAT**, since a period's date line always carries its
  span but never "though both ends are debated" or "a lowstand plateau rather than a single peak"; its own
  padding class is **HISTORIOGRAPHY** (who named it, when, after what — keep the type site, cut the dig
  history); and it had FIVE grows, all paid for out of `.claude/sources-register.md`, which records Thomsen's
  1848 definitions verbatim and is why `Bronze_Age` and `Iron_Age` could grow at all with `brill.com` 403 here.
  **L7's hardest finding is L6's constraint in a subtler form: a marker can be left pointing at a claim the
  trim removed, and `add-sources.js` PASSES it** — the source is still *referenced* and the marker is still on
  the page — so `Châtelperronian` kept a citation titled "No Reliable Evidence for a Neanderthal–Châtelperronian
  [association]" after the 2018 challenge it IS had been cut, and `Howiesons_Poort` kept a climate-change paper
  after the clause it explained. Only reading each surviving marked sentence against the work it points at
  catches this. L7 also names two things to do BEFORE drafting: **run the sibling-consistency check over the
  whole batch's date lines** (it holds — and the `Paleolithic` 9700 BCE against `Neolithic` 10,000 BCE
  "overlap" is two regional schemes, recorded and deliberately not "fixed"), and **read a sentence that argues
  with itself before trimming it**, since `Boreal`'s "does not reach down to 8,000 years ago as loose usage
  suggests" is card batch 22's correction written into the prose and reads exactly like a stray figure.
  **L8 found a splitter gap the same way and its lesson is to look BEFORE drafting**: `Smilodon` was not
  three sentences but SIX, because `split-abstract.js` broke on an abbreviated binomial (`S. fatalis`) — the
  run rule needs a second initial and G5's lone-initial rule requires a CAPITALISED word to follow, where a
  species epithet is lowercase. Fixed with the exact test that **a single capital, a full stop and a
  LOWERCASE word can only be an abbreviated genus** (plus `>` in the lookbehind, since the letter sits
  inside `<i>…</i>`), and verified over 1,377 texts with one split changed and no regressions. **Run the
  whole-corpus split audit at the START of a batch.** L8's other lever is new: **the SIBLING PAIR** — six of
  its terms describe one find from two angles (`Taung_Child`/`Australopithecus_africanus`,
  `Lucy`/`Australopithecus_afarensis`, `KNM-WT_40000`/`Kenyanthropus_platyops`), so a shared fact can be
  given to whichever of the two owns it rather than trimmed twice; and on a taxon the **describer and year
  are the formal identity and stay**, while the discovery narrative around them goes.
  **L9's lever is L8's one level down, and it is measurable: NEAR-VERBATIM DUPLICATION BETWEEN SIBLING
  TERMS at the level of the SENTENCE.** Counting shared eight-word runs across its 40 terms found **17
  between `Chert` and `Flint` and 11 between `Gunflint` and `Musket`** — four terms written independently
  from the same two sources, repeating whole clauses word for word. Deciding what each term OWNS (`Chert`
  the mineralogy, `Flint` the chalk and the working quality, `Gunflint` the lock and the Brandon
  workshops, `Musket` the loading drill) took them to **2 and 0**. **Grep a batch's terms against each
  other before drafting**: it takes two minutes, it finds words that cost nothing to lose, and no other
  check in the workflow can see it. L9's padding class is the **MECHANISM DESCRIBED TWICE** — an `object`
  term explains how the thing works and then explains what that means, and one clause does both jobs,
  which is where most of the 70–90 words came off `Spear-thrower` (195) and `Bow_and_arrow` (177). And it
  **qualifies L5's and L7's date-line rule**: `Minoan_palace`'s restated "from about 1900 BCE" was the only
  thing its second marker (Rutter's chronology page) was standing on, so **check the source list before
  cutting a restated span**, not just `GLOSSARY_DATES`.
  **L10 is L9's lever meeting a wall, and the wall is the more useful half.** Its cluster —
  `Chronology`, `Stratum`, `Stratigraphy`, `Geology` and `Geological_epoch`, all reciting the same two
  GSSP facts out of the same three papers — could NOT be fixed by assigning ownership, because **each
  term's source list requires each of those works to be referenced somewhere in it** (L6's constraint),
  so dropping the shared clause orphans a source and `add-sources.js` refuses the batch. **Where several
  definitional terms rest on one small source set, the duplication cannot be deleted, only RE-REGISTERED**:
  each states the shared fact in the register it owns and in the fewest words (`Geological_epoch` the GSSP
  machinery, `Geology` the marker driven into a rock face, `Stratum` the sequence, `Stratigraphy` the
  combination of relative and scientific dating, `Chronology` the calibration) — every pair then measures
  0, with no marker lost. Its own padding class is L7's **historiography** again (`Post-glacial_rebound`
  lost Celsius in 1743 and Jamieson in 1865, 30 words), and its grow is the pass's largest —
  **`Archaeology`, 43 → 103, out of the register alone**, having left out the range of its own subject,
  the words *artifact* and *feature*, and **context**, which is the discipline's central idea. Two more checks
  L2 made standing, both
  for failures that are invisible in the
  finished prose. **Diff every MARKED sentence's YEARS before against after** — a trim can strand a marker, and
  `add-sources.js` cannot see it, since every source is still referenced and no marker runs past the end of the
  list: `Ireland`'s EU-country-page marker was left on a sentence about the famine once the 1973 accession it
  carried was cut, and the fix is to restore the datable clause rather than move the marker, that clause being
  what the recipe's second source exists to carry. And **grep the HEDGE vocabulary before and after** — a trim
  eats hedges silently, four of L2's six losses sat on claims that survived, and turning "often called the Isle
  of Spice" into "hence its name" saved four words by inventing a fact. **The hedge grep keeps paying, one to
  three terms a batch**: L3's was `Myanmar`, where "have long been **among** its exports" became "are
  long-standing exports" — reads the same, says something stronger. **L4 caught three, all one shape, and it is
  the shape to watch: a QUANTIFIER in front of a superlative or a fraction**, which reads as filler to someone
  cutting words and is in fact the whole claim — "**some of the** fiercest fighting" says *among the worst*
  where "fiercest fighting" says *the worst*, and `Somalia`'s "the way of life for **much of** the population"
  had become "for most people", turning a large fraction into over half. **L5 caught eight, of which six were
  the hedge leaving with the clause it hedged and two were the real thing** — `Madjedbebe`'s "5,000 to 15,000
  years earlier" flattened to "thousands of years earlier", and `Africa`'s "regained independence across
  **almost all** of its territory" to "independent again". **L5 also refines the MARKER check in both
  directions.** It fired four times and all four were benign, every one an excavation date leaving a sentence
  that still carried what its citation is for — so the rule is not that a marked sentence must keep every year
  but that **the marker must still point at something the source carries**: check the citation, not the count.
  And the checker has a blind spot worth knowing before a deep-time batch — a year regex matching
  `1\d{3}`/`20\d{2}` **cannot see BP, kya or Mya dates**, which on prehistoric terms is most of the dates
  there are (`Fertile_Crescent` lost "between about 12,000 and 11,000 years ago" out of a marked sentence in
  silence, caught by eye); **L6 fixed that**, and also stopped the check script splitting sentences with its
  own regex, which broke on initials and read `John F. Kennedy` as two sentences — `split-abstract.js`
  learned about runs of initials in card batch 24 and the check script had not. **L6's hedge grep caught
  only two against L5's eight**, which is what a batch of institutional prose produces: a presidential essay
  hedges very little; **L7's caught four, three of them the quantifier-before-superlative shape for the third
  batch running** (`Middle_Stone_Age`'s "some of the earliest", `Lomekwian`'s "mostly", `Ice_Age`'s and
  `Würm`'s "generally"). One blind spot remains, worth knowing before a batch of calibrated dates: the year
  regex needs the number immediately before "years ago", so an intervening word defeats it and `Boreal`'s
  "8,000 **calendar** years ago" reads as lost when it survived. Not part of the site.
- `docs/units-plan.md` — **metric first, imperial in parentheses**: the rule, the one imperial-first figure in the whole
  corpus (fixed), and the 360 metric figures still to gain their equivalents. Not part of the site.
- `docs/user-decks-plan.md` — the design plan for **community decks** (user-created decks, sharing,
  ratings, an optional per-deck glossary, and a later paid tier). Phases 0–1 have shipped; see the bullet
  in "How the app is wired". Not part of the site.
- `data.js` — `window.CARD_DATA` and `window.COLLECTION_TREE`. **Currently 99 cards** — 89 in World
  History (`col-8`, scattered across the first three subdecks of its 1000-slot plan) and 10 in Ancient
  Greece (`gr-001`…`gr-010`) — **each carrying its full pool of 3 question phrasings** (`question` + 2
  `questions` extras) in EN + all 9 languages (regrown from the `cnh-001` template, which remains the
  canonical format); both collections are grown one card at a time (see "Generating cards & glossary
  entries" below). **The old single `wh-prehistory` deck and the empty `col-44`…`col-64` period decks
  are gone** (2026-08-04) — World History's tree is now the one in `docs/world-history-card-plan.md`,
  and card ids follow that plan's numbering.
- `glossary.js` — `window.GLOSSARY` plus `window.GLOSSARY_DATES`, `GLOSSARY_TITLES`, `GLOSSARY_ALIASES`,
  `GLOSSARY_CASESENSITIVE`, `GLOSSARY_TAGS` (per-term category tags — the admin glossary's left-bar
  filter), `GLOSSARY_IMAGES` (per-term illustration — see the "Glossary image" bullet below) and
  `GLOSSARY_SOURCES` (per-term citations — see the "Source footnotes" bullet).
  **`add-sources.js` and `add-glossary.js` REBUILD this file from a fixed list of tables**, so a
  `window.GLOSSARY_*` table neither of them carries is silently dropped on the next content batch — which is
  what happened to `GLOSSARY_PLACES`/`GLOSSARY_MAP_COUNTRY` the day they were added. **Add a new table to
  both serializers in the same commit.**
  Trimmed to the single `Sima_Qian` template entry on 2026-07-23 and **regrown since to 401 terms**
  (every country in the world, plus prehistory/paleoanthropology vocabulary), one fully-formed entry at a time
  (description + date + tags + all 9 translations); the full pre-trim glossary (2,165 terms) and its partial
  translations are backed up in `.claude/backup/`.
- `glossary-wikipedia.js` — `Object.assign`s extra summaries onto `window.GLOSSARY` (loads *after*
  `glossary.js`). **Currently an empty stub.**
- `i18n/gloss-<lang>.js` — glossary descriptions translated into that one language (slug → text); written by
  `.claude/add-glossary.js` from the entry JSON's `translations` field, or backfilled a language at a time by
  `.claude/add-lang.js` (both go through `.claude/gloss-i18n-io.js`). A file **pushes onto
  `window.GLOSSARY_I18N_IN`** rather than writing the live table: the bundle's `after` hook (`glossI18nIngest`)
  drains that queue into the shipped baseline `PRISTINE_GLOSS_I18N` and then layers the admin overlay on top,
  producing `window.GLOSSARY_I18N[slug][lang]` — which is what `glossText()` reads. **Admin-editable**: with the
  site language switched to a non-EN language, the glossary editor edits that language's translation
  (`glossaryI18n` overlay deltas; baked back into this file by `serializeGlossaryI18n`).
- `i18n/ui-<lang>.js` — the site-chrome translation tables for one language (`window.I18N` exact strings /
  `I18N_RULES` regex patterns / `I18N_HTML` whole prose blocks, keyed by English source text) consumed by
  app.js's localisation engine. **Lazy** (bundle `uiI18n:<lang>`) — an English reader never fetches any of
  them. See the "Language picker + i18n" bullet below.
- `world.js` (~1.6 MB) — `window.WORLD_GEO`, country-border polygons (Natural Earth 110m, ~117k verts) for the
  Atlas globe.
- `uk.js` (~47 KB) — `window.UK_SUBUNITS = [ { n, p:[rings], c:[mask] } ]`, the UK's constituent countries (England,
  Scotland, Wales, Northern Ireland) + Ireland (the whole island, for the pre-1922 all-Ireland UK), from Natural Earth
  10m admin-0 **map subunits** (matched by `SU_A3`, since the NAME field abbreviates "Northern Ireland" → "N. Ireland").
  Built by `.claude/build-uk.js`. The `c` mask marks each edge `'0'` internal land border (England–Scotland, England–Wales —
  drawn light by `drawUKConstituents`) or `'1'` coast (the island edges + the UK–Ireland international border, left to
  `world.js`). Double-clicking the UK on the globe drills into the constituent under the cursor (see the Atlas section).
- `heightmap.js` (~3.5 MB) + `heightmap-ultra.js` (~8.9 MB) — `window.HEIGHTMAP` / `window.HEIGHTMAP_ULTRA = { w, h, lo, hi, png }`,
  the **global terrain-relief raster** as two LOD levels: a **base 6144×3072** (terrarium z=5) and a sharper **ultra 10240×5120**
  (terrarium z=6). Each is an equirectangular grayscale PNG (data-URI; pixel 0..255 → elevation `[lo,hi]` m) baked from the **AWS
  open Terrain Tiles** (the data behind tangrams.github.io/heightmapper) by `.claude/build-heightmap.js` (`node build-heightmap.js
  [Z] [OUTW] [OUTH] [outFile] [varName]` — key-free build-time tile fetch + a minimal zlib PNG codec, zero runtime deps).
  Both are **lazy-loaded** (NOT in `index.html`): enabling the **Heightmap** legend toggle (default off) loads the base via
  `loadHeightmap()`; the ultra loads only once zoomed past `HMULTRA_Z`. `drawHeightmap` reprojects the active level onto the globe
  over **land AND ocean floor (bathymetry)** — clipped only to the disk (cheap) — **blended with an `"overlay"` composite** (not a
  flat image paste) at strength `HM_OPACITY = 0.7`, so the grey relief **modulates the map's own colours** (lows/ocean-floor darken,
  peaks lighten; sea level = mid-grey 128 = neutral). Borders/rivers/cities still draw on top, **the same in every era** (physical
  layer, not in `PRESENT_ONLY`). The grey is
  baked into a **per-pixel alpha** that is **theme-aware**: on `body.night` it adds opacity to the DARK (ocean / low) end so the
  darks go darker over the dark map; on day it adds opacity to the BRIGHT (high-land) end so peaks go brighter — keeping the other
  end at the faint base. (So the ocean bathymetry is visible mainly on dark themes; tune via `aBase`/`aBoost`.) The reprojection
  buffer cap is **low while moving** (stays visible without lag — no blink) and **up to full canvas resolution when settled +
  zoomed in** (crispest the data allows at deep zoom); settled renders are cached. (Crisper-than-z=6 deepest-zoom detail would
  need runtime tile streaming, which would break the offline-first design and is imperceptible at this opacity, so it's not done.)
  An older `elevation.js`/three-globe attempt was replaced.
- `truefalse.js` (~34 KB) — `window.TRUEFALSE = [ { q, a, why, cat } ]`, the statement pool for the **True or False** home-page
  minigame (79 historical myths/misconceptions + surprising truths; `a` is a boolean, `why` the explanation). Generated and
  **adversarially fact-checked** for accuracy by a workflow (`q` statement, `a` true|false, `why` reality, `cat` category).
- `i18n/places-<lang>.js` — place names translated into one language (English name → local name): the
  countries in `world.js` plus the era territories and era capitals in `timeline.js`, **1,744 distinct names**.
  **Lazy** (bundle `placeI18n:<lang>`); the `after` hook `placeI18nIngest` drains `window.PLACE_I18N_IN` into
  `window.PLACE_I18N[englishName][lang]`, which **`placeName(n)`** reads. They live outside `world.js` /
  `timeline.js` because those are multi-megabyte geometry files. **`placeName` is called at CANVAS DRAW TIME**
  (`drawCountryNames`, `drawEraNames`, `drawCities`, `drawEraCities`) as well as in the DOM — the map labels are
  `ctx.fillText`, which the `localizeTree` walker can never reach, so this is the only route to translating them.
  Era names are localised **before** the two-line wrap, or the wrap measures the English. The Settings home
  picker localises only the option LABEL: the `value` stays the English name, since it keys `countryCenter()`
  and is stored in `S.settings.home`. Not routed through the I18N exact table, and for the same reason as
  `nodeTitle` — most of these names are also glossary terms and card answers. A file ships for every language
  so an untranslated one can't 404 on each page load.
  **Coverage — es 609 / fr 555 / de 547 / it 517 / nl 516 / ru 922 / ar 924 / zh 924 / ja 924.** The gap
  between the Latin and non-Latin counts is structural, not a backlog: **a name identical to the English is
  deliberately NOT written** (`placeName` falls back), so `Madrid` needs no Spanish row while every name needs
  a Russian one. Three things stay English on purpose and should not be "finished": the **~750 ethnonyms**
  among the era territories (Wiradjuri, Kwakwaka'wakw, Yukagir) — an endonym keeps its own form in every
  language; the uninhabited **banks, reefs, glaciers and military zones** (Bajo Nuevo Bank, Siachen Glacier);
  and the **obscure historical seats** (Bal Batsinâng, Danamombe, Xieng Dong Xieng Thong). None has an
  established form in Spanish or Japanese, and inventing a transliteration would be fabrication.
- `i18n/games-<lang>.js` — the two daily-game pools translated into one language, keyed by each item's
  **English `q`** (unique in both pools, and stable against reordering in a way an array index is not).
  **Lazy** (bundle `gamesI18n:<lang>`); the `after` hook `gamesI18nIngest` drains `window.GAMES_I18N_IN`
  into `GAMES_I18N[pool][englishQ][lang]`, which `tfLocalized()` / `quoteLocalized()` read. **These must
  NOT go inline into `truefalse.js` / `quotes.js`** — both are in the EAGER load path, and nine languages
  inline took `quotes.js` from 27 KB to 312 KB downloaded by every visitor to flip a card. `PAGES.truefalse`
  and `PAGES.whosaid` hold on a loading line (`gamesI18nPending`) until it lands so they never paint English
  and flip. Both pools are complete in all 9.
- `quotes.js` — `window.QUOTEGAME = [ { q, who, context } ]`, the pool for the **Who said it?** home-page minigame (64 famous,
  well-documented quotations by distinct historical figures; `who` = the speaker, `context` = a 2-sentence explanation shown on
  reveal). **Adversarially fact-checked** for correct attribution (quote misattribution is rampant). The 4 answer options are the
  correct speaker + 3 other `who` names from the pool (all real people → plausible). Loaded before app.js (after `truefalse.js`).
- `changelog.js` — `window.CHANGELOG = [ { d:"YYYY-MM-DD", label?, t, items:[…] } ]`, the day-grouped release notes
  rendered as the **About** page's collapsible changelog (`PAGES.mission`, hash `#mission` — the nav tab is LABELLED
  "About" but the route/hash stay `mission`; section order: intro prose + forgetting-curve SVG → "How to use Folio"
  walkthrough + feature blurbs → FAQ (collapsible `.faq-item`s) → **beta feedback form** → changelog →
  credits/licenses). See the golden rule: append to today's entry on every ship.
  It also carries **`window.FOLIO_VERSION = { v, released }`** at the top — the shipped version, printed in the
  top-left corner of the home page by `versionLineHTML()` (see the golden rule above, and the bullet under
  "How the app is wired"). Nothing rewrites this file programmatically, so both are hand-edited together.
- `mission.js` — `window.MISSION = { title, paras:[…] }`, the About-page intro copy (raw HTML; **deliberately
  jargon-free and written at a low reading level — NO glossary auto-linking on this page**, `autoLinkGlossary` is not
  called). **Admins click the title or a paragraph on the page to edit it in place** (Esc cancels, Ctrl+Enter/blur
  saves): edits overlay via `ADMIN_EDITS.mission` (merged at render by `missionMerged()`, so undo/reload need no
  special handling) and bake back into this file through auto-save / "Save to project" / `folioSave.files`
  (`serializeMission`). The walkthrough / FAQ / forgetting-curve SVG are hardcoded in `PAGES.mission`, not in this
  file. **The About page is TTS-free**: no read-aloud button, and `openGlossWin` skips its play button + auto-read
  when `current.name === "mission"`.
- `lakes.js`, `rivers.js`, `water.js`, `ranges.js`, `admin1.js`, `cities.js` — extra
  Natural-Earth layers for the Atlas globe (lakes, rivers, water-body labels, mountain ranges,
  admin-1 borders, city pins); built by the `.claude/build-*.js` dev scripts. (A Forests layer
  was removed; `forests.js`/`build-forests.js` remain on disk but are no longer loaded or rendered.)
  The **Mountains layer was likewise removed** from the globe: its legend toggle + `wire("#rangesToggle",…)` are
  gone and `rangesOn` defaults `false` with no way to enable it, so `drawRanges` is never called. **`ranges.js` and
  `admin1.js` are no longer loaded by `index.html`** (~1.7 MB less per page load; `drawRanges`/`drawAdmin` remain as
  inert dead code over the empty fallbacks) — the files stay on disk for a future heightmap-style lazy revival.
  `lakes.js` = `window.LAKES` (**~302 major inland seas & lakes**, NE 10m), kept by `build-lakes.js` when
  `scalerank ≤ 4 OR area ≥ 0.1 deg² OR` a well-known name (a `FAMOUS` regex ensures the Alpine lakes,
  Dead Sea, rift lakes, etc.). **Outer rings only** (island holes dropped) so every lake fills solid — otherwise an
  island-heavy lake (e.g. Manicouagan) renders as a confusing thin "ring". Rendered as ocean-coloured fills on top of
  the land (present-day shape in every era), with **no shore stroke** — lakes are covered by the country fill and just
  re-filled as water, so inland seas & lakes read clean (no outline) on the 2026 map too, matching the historical maps
  (don't reintroduce the per-lake border stroke). The **Caspian Sea is NOT in this layer** — no country polygon covers
  it, so it shows through as ocean (its shore is still drawn as a coastline, same on present-day + historical). Rivers
  (`rivers.js`) are stroked in the **ocean colour** (`riverCol = ocean`) so they read as water continuous with the sea.
- `timeline.js` — `window.TIMELINE`, historical border *eras* for the globe timeline (past-year
  political maps, **borders only**). Starts empty; eras are added in **Edit → Timeline** (see
  "Generating timeline eras").
- `countries.js` — `window.COUNTRY_INFO`, a map of *lowercased country/territory name* → 5-sentence
  description, shown in the Atlas click popup. Covers present-day countries (`world.js`) **and** every
  historical-era territory (`timeline.js`); a missing entry just yields a "no description yet" fallback.
  **Regenerated (from the accurate source summaries) + adversarially fact-checked** so each is exactly **5 clean,
  general, TIMELESS sentences free of number-grid figures** (population/area/GDP live in the stat tiles, not the prose) —
  including the 20 former Wikipedia disambiguation stubs (Oyo Empire, Kong Empire, Kuba/Luba/Lunda, Vatican City, etc.),
  which were researched into real descriptions of the entity the map means. Don't reintroduce grid figures or year-pinned
  facts into these; keep them general (the per-year specifics belong in `country-years.js`).
- `country-stats.js` — `window.COUNTRY_STATS`, *lowercased country name* → `{ pop, area, gdp, gdppc }`
  present-day figures (Wikidata, formatted strings) for the popup's stat tiles, shown **at the present year**. It also holds
  `window.COUNTRY_STATS_YEARS`, *name* → `{ "<map-year>": { pop, area, gdp } }` — **year-specific** figures shown at a historical
  map-year (`countryStatsYear()`; GDP-per-capita computed at render). Missing → a long dash, never fabricated.
- `country-spans.js` — `window.COUNTRY_SPANS`, *lowercased state/iteration name* → the years that iteration existed
  (e.g. `"1815 – Present"`, `"1636 – 1912"`), shown in **thin grey under the popup title** (`countrySpan()`; missing → the line
  collapses). Keyed by the name as it appears on the map (present-day name, or the era iteration name). Grown per timeline year.
- `country-years.js` — `window.COUNTRY_YEARS`, *lowercased state name* → `{ "<year>": "<2–3 sentence
  description of that state in that map-year>" }`, for the popup's middle "year" column (`countryYear()`).
  Keyed by the name as it appears on each era's map (e.g. `british raj`, `ussr`, `france`) and the map-years
  (1900/1920/1938/1960/1994/2000/2010/present). Built by a verified generation pass; **only fact-checked
  entries are added — a missing one shows a dash, never a fabricated fact.**
- `country-sources.js` — `window.COUNTRY_SOURCES` (*lowercased place name* → `[citations]`, the works behind the
  general description) and `window.COUNTRY_YEAR_SOURCES` (*name* → `{ "<year>": [citations] }`, the works behind that
  map-year's paragraph). The panel merges the two into **one** numbered list, general first, de-duplicated. **Currently
  empty** — the UI and the pipeline ship, the citations do not (see "Source footnotes"). Written by
  `node .claude/add-country-sources.js <batch.json>`, which refuses a place name that is in neither `countries.js` nor
  `country-years.js` (a citation filed under a name the panel never looks up is a citation nobody will ever see).
- `fetch-glossary.js` — standalone Node helper, run manually, that backfills missing glossary
  terms from Wikipedia. Not loaded by the site.
- `.claude/fetch-place-coords.js` — writes `window.GLOSSARY_PLACES` (slug → `[lon, lat]`, fetched from each
  Wikipedia article's own published primary coordinate) and `window.GLOSSARY_MAP_COUNTRY` (slug → the name
  world.js uses) into glossary.js, so a glossary term can put itself on the Atlas. **One title per request** —
  batching looked economical and quietly lost most of them, because `prop=coordinates` paginates and a
  single-response reader records a handful and reports the rest as having no coordinate, which is
  indistinguishable from the truth. Rate-limited hard: it backs off and retries rather than recording a 429 as
  "no coordinate". Not part of the site.
- `.claude/add-card-tags.js` — writes `card.tags` (see the card-tags bullet under "How the app is wired").
  Not part of the site.
- `fetch-countries.js` — standalone Node helper (run manually, resumable) that fetches the 5-sentence
  Wikipedia summaries into `countries.js` for every clickable name. Re-run after adding timeline eras so
  their new territories get descriptions. Not loaded by the site.
- `fetch-stats.js` — standalone Node helper that fetches present-day Population/Area/GDP/GDP-per-capita
  from Wikidata (matched to `world.js` by ISO code) into `country-stats.js`. Not loaded by the site.

## How the app is wired

- **Routing:** `location.hash` → the `PAGES` map (home, decks/library, study, map/atlas, account,
  settings, challenge, chrono, admin). `render()` clears `#view` and calls the current page fn.
  It also calls **`setPageMeta(current.name)`**, which sets `document.title` and the
  description / `og:` / `twitter:` meta from the **`PAGE_META`** table (route → `[title, description]`,
  run through `t()` so it localises where a translation exists, English otherwise). Add a route → add its
  `PAGE_META` row, or it inherits the home page's title. `index.html` carries the home-page values as the
  static baseline because most link-preview crawlers don't execute JS — **keep the two in step.**
  `render()` also **detaches the outgoing page's keyboard handler** (`detachKeys`). `attachKeys` already
  detached the previous one, so two pages could never both be listening — but a page with no shortcuts of its
  own attaches nothing, and the last handler stayed live over it: pressing Space on the Library after a study
  session ran that session's `showAnswer()` against a page that no longer existed. It mutated a detached tree,
  so nothing looked wrong and nothing was reported (found when the page ghost below stopped ids resolving in
  the dead copy). A page that wants keys re-attaches when its own render runs, which is after this.
- **`touch-action:pan-y pinch-zoom` on `.page` is what makes EVERY horizontal swipe on the site possible**
  (styles.css, Aug 2026, on a report that the book's chapter swipe did nothing on a phone). Without it none
  of them worked on a real device — not the chapter swipe and not the page swipe, which had been broken
  since the day it shipped. Under the default `auto` the browser hands the touch to its scroll machinery
  the moment it passes the slop and fires **`pointercancel`** at the page: `pointerup` never arrives, and
  both handlers measure the gesture at `pointerup`. `pan-y` says this box scrolls vertically and nothing
  else, so a horizontal drag is nobody's scroll and the pointer stream survives; a vertical one still
  scrolls and still cancels, which is correct. `pinch-zoom` keeps the reader able to zoom, which bare
  `pan-y` takes away; the cost is double-tap-to-zoom, which the book already suppressed for its own double
  tap. **Nested horizontal scrollers are unaffected** (measured, not assumed): the intersection deciding a
  pan stops at the element that will scroll, so the chapter bar, the Atlas sheet's pager and the heatmap
  still pan sideways, and every draggable declaring `touch-action:none` only narrows this further.
  **It was invisible to the tests, and that is the part to keep in mind when writing more of them**: a
  synthesised `PointerEvent` bypasses the browser's gesture arbitration entirely and completes every time,
  so every swipe assertion passed throughout. `test-layout.js` and `test-library.js` now drive one swipe
  each through **real CDP touch input** (`Input.dispatchTouchEvent`) beside the synthetic ones, which stay
  — they are what pins the classification (distance, angle, tap-vs-swipe) precisely. Two gotchas from
  writing them: a touch landing while an earlier fling is still running is spent stopping it, so a
  scroller pan measured straight after a vertical drag reads as a few pixels; and the guards must be
  asserted in both directions, since a false positive TAKES A PAGE AWAY.
- **SWIPE BETWEEN PAGES ON A PHONE** (`wirePageSwipe` / `SWIPE_ORDER` / `.page-next`/`.page-prev`, Aug 2026,
  on request). A horizontal swipe moves between `home → library → account → settings`, and the outgoing page
  leaves the way the finger came from, so the gesture and the transition tell the same story.
  · **THE ORDER IS THE TAB BAR'S, MINUS THE ATLAS — that is the whole rule**, and it is what decides whether
    a new destination belongs in `SWIPE_ORDER` (`test-layout.js` asserts the two against each other rather
    than against a list, so a tab added or removed later fails on the rule and not on a stale copy of it).
    The ATLAS is out because a drag on the globe rotates it, and a page that both rotates under the finger
    and navigates away from it can only do one of them badly; it is reached and left through the tab bar
    alone. **COLLECTIONS (`decks`) was in the order for a fortnight and came OUT on request (Aug 2026)** —
    the reasoning for including it (a real destination even without a tab, and leaving it out makes the
    sequence a subset of the bar) is backwards once the bar is what a reader has to go on: the swipe was
    landing them on a page the bar cannot reach, with nothing lit in it to say where they were. It is
    reached from the review's own lip ("+ Add decks"), which is the route the home page advertises, and
    that is now the only one.
  · **It is a full CROSS-SLIDE** (Aug 2026, on a report that it was "a hard cut"). It was a 26px nudge under
    a cross-fade, which at that distance is a fade with a lean in it — so after a finger had dragged a page
    sideways, what arrived barely moved. Both halves now travel a whole page width, exactly adjacent (plus a
    24px gutter so their edges never abut), at ONE duration and ONE easing, which is what makes it read as a
    single sheet moving rather than two things happening at once. **No opacity at all**: a page off the side
    of the screen needs no fading. It is only possible because both pages exist for those 340ms — the ghost
    being a real copy of the outgoing one — which is why the height guard in `makePageGhost` is skipped for
    a swipe (that guard is about fading in PLACE) while the element-count guard, which is about the cost of
    the clone, stays. The `sectIn` stagger opts out on a sliding page, or its blocks would pop in behind it.
  · **`clipStageFor` is what stops a page a whole screen wide from overflowing the document** while it
    travels — `body.stage-sliding .stage{overflow-x:clip}`, on a timer. Three things about it: it is on the
    STAGE rather than `#view`, which sits inside the stage's own padding and would cut both pages off short
    of the screen edge; it is **`overflow-x` alone, never the shorthand and never `hidden`**, since
    `overflow-x:clip` beside an untouched `overflow-y:visible` is the one pairing that clips without making
    a scroll container (with `hidden` the book's sticky chapter bar would stick to the stage instead of the
    viewport); and it is a body class on a timer rather than a `:has()` rule keyed off the ghost, because
    the incoming page slides whether or not a ghost was made.
  · **The guards are the whole of the difficulty, because a false positive TAKES A PAGE AWAY.** Touch only (a
    trackpad's horizontal scroll is a `wheel` and a mouse drag is a selection); never out of a horizontal
    scroller, walked up the ancestor chain by measuring `scrollWidth`/`overflow-x` rather than by listing
    classes, so a scroller added later is covered with nobody remembering this; never while an overlay is up,
    never on a form control, never while `body.grading`. Generous on distance (`SWIPE_MIN` 64px), strict on
    angle (`SWIPE_RATIO` 1.6) — a diagonal is a scroll that wandered.
  · The direction class is set on the PAGE ELEMENT, not the body, so it dies with that page and can never be
    left behind on a later tab-bar navigation.
- **PAGE TRANSITIONS (Aug 2026, on request).** `.page` has always faded IN; the missing half was the exit, so a
  navigation cut the old page away on the same frame the new one appeared. **`render()` is synchronous and has
  to stay so** — several callers query the DOM the moment it returns, which rules out `startViewTransition` and
  anything else that defers the swap — so the outgoing page is not held back but LIFTED OUT: `makePageGhost()`
  lays a copy over the stage (`.page-ghost`, `position:absolute` inside a now-`relative` `#view`) and leaves it
  to fade while the new page renders underneath, removing it on its own timer.
  · **It is a CLONE, not the element itself**, so anything still holding a reference to the outgoing page — a
    stale handler, a pending callback — keeps the original, detached, behaving exactly as before.
  · **The clone is stripped of every `id` and every control `name`.** For a quarter of a second the dead page is
    still IN the document: an `id` would let a `document.getElementById()` in the new page's wiring pick up the
    dead copy, and a `name` is worse — a radio group is scoped to the DOCUMENT when its inputs are not in a
    form, so the ghost's radios and the new page's were one group, and inserting the new checked radio silently
    unchecked the ghost's, making a click that had just landed read back as never having happened (found by
    `test-deck-glossary`, whose Studio radios are exactly that shape).
  · **Three exclusions**: reduced motion; the ATLAS in both directions (leaving it, the globe's teardown has run
    under the clone; arriving at it, its stage is full-bleed and a page fading over the globe reads as a
    rendering fault); and the editor, where a repaint per keystroke is routine. The home page's 170px ornamental
    globe is deliberately NOT excluded — skipping the commonest navigation on the site to protect it would be
    paying for the transition and not getting it.
  · **A SWIPED navigation is a different transition, not a longer one** — the full cross-slide described in
    the swipe bullet above, which is why `makePageGhost` takes the direction and relaxes its height guard
    for one. A tab-bar navigation keeps the vertical fade.
  · The stylesheet's MOTION block adds the rest: a staggered entrance for a page's top-level blocks (`sectIn`,
    capped at eight and opting out exactly where `.page` does, including inside the ghost), an entrance for the
    overlays (`.inline-prompt`/`.deck-menu`, which had none), and press feedback on the quieter buttons.
    Everything there is an animation or a transition, so the global reduced-motion killswitch covers it — the
    one thing it can't reach is a `both`-filled animation's DELAY, which is zeroed explicitly, or a reduced-motion
    reader would watch a page arrive in blank steps.
- **THE LIBRARY — whole books, read on the site** (`PAGES.library` at `#library`, `PAGES.book` at
  `#book/<id>`, the `THE LIBRARY` block in app.js; Aug 2026, on request). A reading room beside the
  flashcards. **The page that used to be called the Library is now Collections** — its route, hash and
  markup are untouched (`#decks`, every shared link still works); only the label, the eyebrow and its
  `PAGE_META` title changed. Two pages called Library, one titled Collections, is how a reader lands on the
  wrong one.
  · **WHAT MAY BE SHELVED, and it is the only content rule.** Folio serves the text itself, so a book goes
    up only where the copyright has **expired**. For a classical author the trap is that the original and
    the TRANSLATION are separate works: Seneca's Latin is free and the English is a 20th-century work with
    its own copyright. Seneca ships in **Gummere's Loeb translation (1917/1920/1925)**, public domain in the
    US as pre-1929 publication; the familiar Penguin translation (Campbell, 1969) is **still in copyright
    and must not be used**, and is named in `fetch-book.js` so nobody reaches for it later. The Meditations
    ships in **Haines's Loeb translation (1916)** on the same pre-1929 grounds — and clears the bar more
    widely, Haines having died in 1935, so it is also PD wherever the term is life plus 90 or less; the
    modern Hays (2002) and Hammond (2006) translations are **still in copyright** and are likewise named so
    nobody reaches for one. The Art of War ships in **Giles's translation (1910)** on the same pre-1929
    ground — Griffith (1963) and Ames (1993) are named as the ones not to reach for — and it is **the first
    book here whose licence states a LIMIT as well as a ground**: Gummere and Haines died in 1942 and 1935,
    so their translations clear the life-plus-seventy rule as well, while **Giles lived until 1958, so his
    stays in copyright in life-plus-seventy countries until 2029**. The site's bar is that the copyright has
    expired and the ground the other two are served on is US publication before 1929; this meets that bar on
    that ground, and the limit is **said outright in `rights` rather than smoothed into the sentence the
    other two use**. (The Chinese underneath is ~25 centuries old and free everywhere.) The Republic ships
    in **Jowett's translation (1871, revised through the 1890s; this printing 1901)**, and it is the
    easiest licence of the four — **the only one needing no qualification at all**: Jowett died in 1893, so
    it is PD on the pre-1929 publication rule, on life-plus-seventy, and on life-plus-a-hundred. The 1901
    Colonial Press volume carries a copyright notice, which covers what the press ADDED to Jowett — a
    special introduction by W. C. Lawton and a set of engraved plates — and neither is imported; what is
    taken is the ten books of the translation. Lee (1955), Bloom (1968) and Grube/Reeve (1992) are named
    as the ones not to reach for. The Metamorphoses ships in **Brookes More's blank verse (Boston, 1922)**
    — pre-1929, and More died in 1942, so it clears both rules as Gummere's and Haines's do — and it is
    **the first book here where BOTH columns carry the Perseus CC BY-SA 4.0 layer** as well as an expired
    copyright, the Meditations' Greek having introduced that layer on an original alone. Its Latin is
    grounded on the PUBLICATION date (Magnus, 1892–1919) and on the age of the poem, and deliberately not
    on the editor's death year: Wikisource's author page for a "Hugo Magnus" who died in 1907 is a
    DIFFERENT MAN, a German ophthalmologist, and citing it would have been a fabricated fact holding up a
    licence — the worst place to put one. Humphries (1955), Mandelbaum (1993), Martin (2004) and McCarter
    (2022) are named as the ones not to reach for. Each book's
    `rights` string states the grounds and **the book's own page prints it** — the reasoning is shown to the
    reader, not buried in a commit message.
  · **THE ORIGINAL BESIDE THE TRANSLATION** (`bookSections` / `bookRows` / `applyLangMode` /
    `anchorNow` + `restoreAnchor`, Aug 2026, on request). Side by side on a wide screen, one at a time on
    a phone where **tapping the page turns it over**, as the daily quote does.
    · **PAIRED ON SECTION NUMBERS, NEVER ON PARAGRAPH ORDER**, and the obvious implementation is the
      wrong one. Pairing the nth paragraph with the nth looks right on one screen and then drifts, because
      Gummere breaks where English prose wants a break and the Latin breaks where the Latin does — a
      reader who trusted the columns would be reading one passage against another. What the two editions
      genuinely share is the **section number**, the `[1] [2] [3]` by which any passage of Seneca is cited
      in either language, kept as `<span class="bk-n">` on both sides. Measured: **2,141 sections, 15
      unpaired (0.7%), in 7 letters**, and those are gaps in the Latin edition's own numbering. The
      Meditations pairs the same way and better — **486 of 487, one unpaired** — because its Greek comes
      from a TEI edition that states its numbers rather than from a wiki that prints none; see the
      `books/<id>.<lang>.js` bullet, which is the case worth reading before adding an original.
      A row whose other side is empty is still DRAWN — closing the gap would sit each column beside a
      passage it is not.
    · **The page is always built as paired ROWS once the original is loaded**, with CSS choosing the
      columns (`data-lang` = `en` / `or` / `both`). That is what makes turning it on a class change rather
      than a re-render, and it is the whole reason the reader's place survives exactly: the row they were
      looking at is the same element before and after, so it can be put back where it was. **The scroll
      offset is exactly what the switch invalidates** — Latin runs ~0.7 the length of Gummere's English,
      so restoring the pixel position lands further from the reader's sentence the deeper in they were.
    · **The salutation is folded into the first numbered row when only one side has one.** The Latin heads
      all 124 letters with one and Gummere's transcription prints it once, so a row of its own is a row
      with one empty cell at the top of 123 letters — which reads as a fault in the page rather than as a
      difference between editions.
    · **The glossary is linked through the ENGLISH only.** Folio's glossary is an English glossary of
      prehistory and geography and its keys collide with plain Latin far harder than with English —
      `genus` is the example. `linkProperNounsOnly` exists because that already bites in translated prose;
      in the original language it would be the rule rather than the exception.
    · **It is a DOUBLE tap** (Aug 2026, on request — it was a single one, and the wording above is what
      that gesture was for). A single tap is far too cheap a target for something that swaps the whole
      text out from under a reader: it is also how you put a keyboard away, dismiss a selection or
      simply hold the phone. The gloss window made the same move for the same reason, so a double tap
      on a body of text now means one thing across the site. The deliberate cost is discoverability,
      which is what the **LATIN button in the chapter bar** is for and why it must stay.
    · **A horizontal SWIPE steps between chapters** (Aug 2026, on request), and the two gestures cannot
      be classified independently — a swipe ends in a pointerup indistinguishable from a tap unless the
      movement is measured. So the tap half rejects anything that MOVED (`BK_TAP_SLOP`) and the swipe
      half rejects anything short or mostly-downward (`SWIPE_MIN` / `SWIPE_RATIO`, **shared with the
      page swipe** so the two gestures cannot come to disagree about what a swipe is); a swipe also
      **clears the pending tap**, or the finger that stepped a chapter counts as half a language flip.
    · **STEPPING A CHAPTER IS A SLIDE** (`slideChapter` / `BK_SLIDE_OUT` / `BK_SLIDE_IN`, Aug 2026, on
      request) — it was an `innerHTML` swap and nothing else, so on a phone the finger said "carry this
      away" and the page said nothing back. The panel leaves the way the finger went and the next one
      arrives from the opposite side, the swap happening at the midpoint while nothing is on screen.
      · **It is NOT the page swipe's cross-slide, and the difference is a cost rather than an oversight**:
        that one has both pages in hand at once (a clone laid over the stage), where a chapter's prose does
        not exist until it is painted and one chapter of this book can be thirty screens of it. Hence the
        travel is 10% of the panel's own width rather than a whole one, with a fade — with nothing behind
        it a full slide is mostly a wait.
      · **It is `Element.animate` and there is deliberately NO CSS for it**, which is the trap worth
        carrying: `.bk-page` is a direct child of `.page`, so the `sectIn` entrance stagger matches it, and
        a **`both`-filled animation goes on applying its last keyframe for the life of the page** —
        `transform:none`, which outranks any ordinary declaration. A `.bk-page.bk-out-next{transform:…}`
        rule is ignored silently and for ever: the class goes on, the computed transform stays the identity
        matrix, and the chapter changes exactly as abruptly as before (it shipped that way for an hour and
        is invisible unless something reads the transform MID-flight). A script animation sorts after CSS
        animations and wins, which is why `flipMove` is written the same way.
      · The incoming animation is created **before** the outgoing one is cancelled — the newer of two
        script animations wins, so its first keyframe holds the panel off the other side from the same
        tick; cancel first and there is a frame with the new chapter in place at full opacity.
      · The scroll to the top of the chapter goes **under** the slide, instantly, where it used to be a
        smooth scroll afterwards: a reader thirty screens into a letter is not travelling anywhere they
        want to watch, and a smooth scroll against an incoming panel is two motions disagreeing.
      · `queued` is the chapter a slide is on its way to, and `step()` counts from it rather than from
        `cur` (which the midpoint paint is what updates) — without it a reader swiping twice quickly asks
        for the same next chapter twice and stands still.
      The book page is deliberately absent from `SWIPE_ORDER`, so the site-wide page swipe is inert here
      and the two can never fight over one gesture.
      **It did nothing on a real phone for its whole life, and the fix is CSS** (Aug 2026, on a report):
      see the `touch-action` bullet under "How the app is wired" — the same fault, and the same one line,
      covers the site-wide page swipe too. `test-library.js` now drives this one through real CDP touch
      input beside the synthetic version, since the synthetic version passed throughout.
    · **The guards are the whole of it**, because a false positive swaps the language out from under a
      reader mid-sentence: a real target (link, `.ttip`, footnote marker, notes fold, any control) keeps
      its own behaviour, a live SELECTION is not a tap, nothing fires while a gloss popup or any other
      overlay is up, and a swipe out of a horizontal scroller belongs to that scroller (the chapter bar
      is one — walked up the ancestors by `swipeScrollerUnder`, not named). Narrow screens only: above
      the breakpoint both columns already show, so a stray tap would take one AWAY rather than reveal
      anything, and the chapters are reached by the tabs, the ‹ › steps and the arrow keys.
      **Both listeners go on `root`** — a fresh `.page` div per render — so they die with the page;
      one on the persistent `#view` would accumulate a copy per navigation.
    · The choice is device-local (`folio_book_orig_v1`), like the marker's position and the place sheet's
      height. **The front matter is rebuilt on every paint**, not once, because the original's licence box
      is built from the original's own file, which lands after the page was set up.
  · **`BOOKS` is EAGER and the text is not.** The registry holds a tile's worth of metadata per book (a few
    hundred bytes) so the shelf can paint, say how long a book is and show where the reader got to **without
    fetching a word**. `BOOK_TEXT` fills from the lazy bundle only when a book is opened. Guarded by
    `test-library.js`, which watches the request log — a book reaching the eager path makes the site slower
    for every visitor who never opens one, and the only symptom is a slower site.
  · **Chapters are TABS on a bar that SCROLLS** (`.bk-bar` / `.bk-tabs`), plus ‹ › steps, ←/→ keys and a
    **Contents** panel grouped by the volume the edition itself divides the book into. Seneca now has all
    124: a wrapped grid of 124 buttons is not a menu bar, it is the page — the scroller was built for the
    finished book rather than for the 65 it then had, which is why completing it needed no layout change.
    Below 640px the tab titles give way to their numbers.
    **`count` and `total` are equal now and BOTH are kept**: `count` is what Folio holds and `total` what
    the work contains, and they part company again the moment a book arrives in instalments. Seneca's own
    `total` is the EXTANT letters, not everything he wrote — Aulus Gellius quotes a book numbered past
    anything that survives.
    **The bar and the Contents panel are ONE sticky block** (`.bk-barwrap`, Aug 2026, on a bug report). The
    bar has always been sticky and the panel sat below it in the FLOW, so opening it a few screens into a
    chapter drew the contents back at the top of the DOCUMENT — off screen, nowhere near the button just
    pressed, and the reader's own scroll position unchanged. The wrapper carries the `position:sticky` now
    (which also makes it the containing block) and the panel is `position:absolute; top:calc(100% + 6px)`,
    so it hangs off the bar's own bottom edge at any scroll depth and OVERLAYS the prose rather than
    shoving it down, which is what a menu opened from a pinned bar has to do. Its ceiling is
    `min(52vh, calc(100vh - var(--bar-h) - var(--tabbar-h) - 96px))` — half the screen, or what is actually
    left between the pinned bar and the bottom bar, whichever is smaller. **A phone rule that used to set
    `.bk-bar{top:4px}` now sets `.bk-barwrap{top:4px}`**; a `top` on the inner box is inert. Guarded by
    `test-library.js`, which opens it 2,400px down and measures the gap to the bar.
  · **THE FRONT MATTER IS CHAPTER 0** (`bookIntroChapter` / `BOOK_INTRO` / `BOOK_GLYPH`, Aug 2026, on
    request). A real chapter rather than a panel — it takes a tab, it steps with the arrows, it is what a
    first-time reader lands on — because that is where front matter goes in a book, and because the "About
    this text" box it replaces sat at the FOOT of every chapter, which made it the last thing under letter 1
    and the last thing under letter 65 alike. Its `n` is **0 as a NUMBER, not an index**: `S.reading[id].ch`
    stores the chapter number precisely so a book gaining chapters cannot move a reader's place, and 0 sits
    below every letter Seneca wrote without disturbing one. Its tab wears a **book glyph** where the others
    wear their number (a "0" beside 1, 2, 3 reads as a chapter the author did not write, and on a phone the
    titles are hidden and the number is all there is) and is **`position:sticky` at the left of the
    scroller**, or the way back to it is sixty tabs behind wherever the reader has got to.
    **The split is the part to keep**: the ESSAY travels with the text (authored in `.claude/fetch-book.js`'s
    `about`, emitted as `intro` into the generated file) and the LICENCE half is built in app.js from the
    registry's own `rights` / `edition` / `sourceUrl`. The essay cannot live in the eager `BOOKS` registry
    (a page of prose every visitor pays for and nobody reads until they open the book) and cannot be written
    into `books/<id>.js` by hand (the next `fetch-book.js` run would destroy it); the licence half needs a
    live link and has always been built from those fields. A reader still in the front matter is told so on
    the shelf — "About this book", never "Letter 0".
  · **The shelf is one full-width BANNER per book** (`.book-grid` at `1fr`), reading left to right: author,
    title and the **year it was written** on the left, how much of the work is on Folio and where you had got
    to on the right, with the reading bar along the banner's own bottom edge (absolutely positioned, so it
    costs the row no height). It was 320px tiles two to a row with a paragraph of blurb in each, then briefly
    210px tiles two-up on a phone; all of that is gone. **The `blurb` field went with it** — a book is chosen
    from its author, title and date, and what it is about is a tap away in its own front matter — and that is
    what lets a full-width banner still be short. **`b.year` is an explicit signed sort key** beside the prose
    `written`, because a shelf that sorts by date needs one number per book and "c. 62–65 CE" is not one.
    A **sort picker** (`BOOK_SORTS`, shared `sortPickerHTML` with the glossary record) ships whatever the
    shelf holds, one book included: it was asked for outright, and a control that appears the day a second
    book lands is one nobody knows to look for.
    **The shelf's licence paragraph (`.lib-note`) is gone** (Aug 2026, on request) and the blurb under the
    heading is now one line. **The RULE it stated is not weakened by its going** and must not be quietly
    dropped with it: it still governs `.claude/fetch-book.js`, which is what decides what may be shelved,
    and it is still shown to the reader — in each book's own front matter, beside the edition it is
    actually about, which is where a statement about one book's copyright belongs. Both halves are
    asserted by `test-library.js`, since they fail in opposite directions.
  · **The reader's place is the point of the feature** (`S.reading[bookId] = { ch, y, at }`, in
    `defaultState` + `PROGRESS_FIELDS`, so it back-fills and SYNCS — a letter begun on a phone opens on the
    same paragraph on a laptop). `ch` is the chapter **number, not an index**: a book gains chapters between
    visits (Seneca will), and an index would silently move a reader's place the day the rest arrive. `y` is
    a **fraction of the chapter's own height**, not a pixel offset, so the place survives a text-size
    change, a rotation and a narrower screen — none of which preserve pixels. It is sampled a third of the
    way down the viewport (roughly where the eye is) and written only on a move of more than ~2% of the
    chapter, or a scroll would push the synced blob on every frame. **A deliberate move to another chapter
    starts it at the top; only a RESUME restores a depth.**
  · The scroll listener is on `window`, which outlives the page, and `render()` replaces `#view` without
    telling anyone — so it **takes itself off when it notices its own page is detached** (`isConnected`), the
    self-stopping shape `startMiniGlobe` uses. There is no teardown hook to hang it on.
  · **The notes are the site's own footnote apparatus** (`bookNotesHTML` emits `.src-note` / `.src-item`, so
    `wireFootnotes` numbers the markers and the delegated fold handler opens it with no new wiring). It is
    NOT `sourcesHTML`, because that carries caps written for a card — `normSources` trims a citation to 600
    characters (Gummere's longest note is 729, and a note cut mid-sentence is worse than none) and drops
    everything past 24, which would leave `wireFootnotes` deleting the markers that pointed at them.
    **It renders OPEN** (Aug 2026, on request — it was shut for a fortnight), like a card's sources and
    the Atlas panel's and for the same reason: an apparatus a reader has to go looking for is one they
    will not look at, and here it is the translator's own commentary rather than a works list. It keeps
    `src-compact` for the OTHER half of what that class buys — opening or shutting it never rewrites the
    reader's card-wide `S.settings.srcCollapsed` — and for the smaller type. **So the class no longer
    implies a starting state**: the two surfaces using it now differ there, a gloss popup still opening
    shut. Its being shut was also why every marker jump had to expand the fold first, which is exactly
    the case `openFootnote` used to get wrong (next bullet but one).
  · **`linkProperNounsOnly` — a book links only what the prose CAPITALISES.** Folio's glossary is a glossary
    of prehistory, palaeoanthropology, geography and heads of state; run unrestricted over Roman philosophy
    it links the right proper nouns (Greece, Sicily, Syria, Egypt, Hesiod) and then four words that mean
    something else entirely in Seneca — `genus` is a logical category to a Stoic, `epoch` a stretch of time,
    `iron` and `bronze` metals in a simile. Those look exactly like any other glossary link while telling
    the reader something untrue about the sentence in front of them. It cannot be fixed by a term blocklist:
    the SAME key is right or wrong depending on the sentence, and only the matched surface can tell you
    which. Deliberately narrower than a card's linking and **books-only** — a card's background is written
    against this glossary and should keep linking `knapping`. A book may still name keys in `glossOff`.
  · TTS is the next step and is **not** wired: `ttsEnabled()` returns false site-wide (see the read-aloud
    bullet), so a play control here would render and do nothing.
- **PAGES.glossary — the terms this reader has discovered** (`#glossary`, Aug 2026, on request), reached from the
  account page's "Glossary terms opened" meter, which is a `.ex-meter-link` button carrying `data-exgo`.
  `glossSeen` was already a permanent register and was only ever COUNTED; this is the list behind the number.
  Filtered to terms that STILL EXIST (as `glossSeenCount` is — a term retired since it was read would open a
  popup onto nothing) and to curated terms (a deck's are not part of what the meter measures). **The
  undiscovered terms are deliberately NOT listed beside them** — it is a record of reading, not a checklist.
  `setActiveTab` maps this route to `account`, so the tab bar stays lit under a page that is plainly part of
  "your record"; the meter is a link only on your OWN account (`prog === S`), never on a friend's.
  **It SORTS four ways** (`GLOSS_SORTS`, Aug 2026, on request: "by alphabet and date of discovery") — newest
  first stays the default, since the term just met is the one a reader came here about. Two things about it.
  The choice lives in a **module-level `glossSort`, not in `S`**: it is a way of looking at a list rather than
  a preference about Folio, the same call `renderDeckStats` makes about its own picker, so it survives
  navigating away and back and resets on reload. And the filter and the picker share **ONE `repaint()`** —
  the obvious implementation gives each its own handler rebuilding from the full set, which silently throws
  away a filter the reader has typed the moment they re-sort. Alphabetical uses `localeCompare` so an
  accented head word files where a reader expects it, and both date sorts fall back to the title so a
  restored session (which opens several popups in the same millisecond) has a stable order.
- **A STUDY SESSION SURVIVES A RELOAD (Aug 2026, on request).** `study` was not a restorable route: its hash said
  only "study", it was not in `valid`, and the whole session lived in a closure — so a refresh mid-card landed the
  reader on the home page with the card gone. **`STUDY_KEY` (`folio_study_v1`, sessionStorage)** now records
  `{ scope, queue, id, qi, rev, studied }`, written by `renderCard` and by `showAnswer`; boot and `hashchange` read
  it back and pass it to `PAGES.study` as `params.resume`.
  · It holds the **QUEUE**, not just the card: the schedule alone cannot say where a requeued learning step was
    sitting, and the reader was part-way through that order rather than a freshly built one.
  · **sessionStorage**, with the same trade and for the same reason as the gloss popups — an F5 or a dev-server
    live-reload in the same tab restores the session, a tab or browser CLOSE forgets it, so a cold start can never
    resurrect yesterday's queue. A `#study` address with no record simply goes home, which is also what a pasted
    link does.
  · **`route()` clears the record whenever `name !== "study"`** — one choke point, so no page has to tidy up after
    itself, and a language switch (which repaints through `render()`, not `route()`) leaves it alone.
    `renderComplete` clears it too, or a reload from the completion screen would resurrect an empty queue.
  · The `hashchange` branch for `study` must come BEFORE the generic `valid.includes(hh)` one, which would call
    `route("study")` with no scope.
- **A card's PHRASING is state, and the reader can step through it** (`qIdx` in `PAGES.study`, the `.q-cycle`
  chevrons beside the Question label — Aug 2026, on request). Every card carries three ways of asking the same
  thing and which one you met used to be a coin toss per render, with no appeal and nothing surviving a reload.
  `qIdx` is `null` for "not chosen yet"; `renderCard` picks one (at random, or the Card-of-the-day tile's own
  date-seeded choice), and **every move to another card sets it back to null** — `doGrade`, `suspendCurrent` and
  `undoGrade` all do — so a phrasing belongs to the card on screen and never leaks onto the next one. The chevrons
  swap the question **in place** rather than re-rendering, because the answer may already be showing and a reader
  comparing two wordings has not asked for it to be taken away; `c` is a copy whenever there is a pool, so updating
  `c.question` keeps read-aloud and `gradeCloze` on the words that are actually on screen.
- **Lazy data bundles:** `DATA_BUNDLES` + `ensureData(name)` / `dataReady(name)` / `whenIdle(fn)` (defined
  just above the ROUTER block). See the table in the File map for what's in each bundle. `ensureData`
  resolves `true`/`false` and **never rejects**, so a fire-and-forget caller can't raise an unhandled
  rejection; a failed bundle is retried on the next call. Consumers:
  · **`PAGES.map`** holds a `.data-loading` placard until `world` + `atlas` land, then re-renders (`render()`
    re-invokes the *current* page, so this covers `PAGES.findit` too).
  · **`startMiniGlobe`** (home) fetches `world` at **idle** so a 170px ornament never delays first paint,
    and skips entirely under `navigator.connection.saveData`.
  · **Settings' home-location picker** holds just the current home until `world` arrives, then fills.
  · **`loadLangData`** pulls `uiI18n` + `glossI18n` whenever the language isn't English.
  **A bundle's `after` hook re-establishes what boot would have done had the file been present** — this is
  the part that bites. `timeline.js` assigns `window.TIMELINE` over the empty array `applyAdminEdits()` left
  at boot, so the atlas hook re-applies `ADMIN_EDITS.timeline` on top or **the admin's working era set is
  silently lost**; a gloss language file arrives after `PRISTINE_GLOSS_I18N` was snapshotted empty, so its hook
  (`glossI18nIngest`) re-seeds that baseline (revert/undo compare against it) and re-applies the `glossaryI18n`
  deltas. Because those files are **per language** the hook runs once per language and the baseline accumulates —
  and it drains a QUEUE (`window.GLOSSARY_I18N_IN`), not a single slot, so two languages whose scripts land before
  either hook both get seeded. Any new lazy file whose global is read at boot needs the same treatment.
- **PWA:** `manifest.json` (installable, `icon.svg` + `icon-maskable.svg`) and **`sw.js`**, registered by
  app.js on `load`. **Never registered on a dev origin** (`isDevOrigin()` — same guard, and same reason, as
  the cloud content overrides): a file-watching dev server's live-reload against a caching worker serves
  files you have already fixed. **Test the PWA on the deployed site, not localhost.** Strategy: navigations
  are network-first (a deploy is picked up at once, and the app still opens offline); same-origin
  JS/CSS/JSON/images are stale-while-revalidate, so **content files land one reload late** — the deliberate
  trade for instant loads. Live admin edits are unaffected (they arrive through the Supabase
  `content_overrides` overlay at runtime, not through these files). The multi-MB lazy bundles are **not**
  precached — that would undo the split; they enter the cache when a page actually asks for them, so one
  Atlas visit makes it available offline. Bump `VERSION` in sw.js to invalidate everything.
- **State:** `localStorage["folio_v1"]` holds settings and spaced-repetition scheduling.
- **Admin edits:** `localStorage["folio_admin_v1"]` stores edits as *deltas*, applied at startup
  by mutating the in-memory globals (`CARD_BY_ID`, `window.GLOSSARY`, the collection tree). **The editing language
  IS the site language** (the top-right switcher; there is NO in-editor language picker — it was replaced on request):
  with the site in EN the card editor edits the base fields via `setCardEdit`; any other site language shows ONLY the
  5 translated fields (question, answer, answerDate, abstract, answerText; Arabic gets `dir="rtl"`) editing
  `card.i18n[lang]` via `setCardI18nEdit`, which REPLACES the card's `i18n` with a deep copy (never mutate in place —
  `PRISTINE_CARDS` shares the object) and stores the whole copy as an `i18n` delta (`applyAdminEdits` re-applies it
  via `Object.assign`; `serializeCardData` bakes `c.i18n` as-is; `revertCard` restores `p.i18n`). **The glossary
  editor follows the same rule**: non-EN site language edits that language's description translation
  (`setGlossI18nEdit` → a **per-(slug, language)** `glossaryI18n` delta **LAYERED** over the shipped text by
  `glossI18nMerged`/`glossI18nApply` — `null` is a cleared translation, and typing the shipped text back clears the
  delta. It must stay per-language rather than a whole lang-map: the gloss files are lazy and per-language, so a
  whole-map delta would hold only the languages loaded when the admin typed and would wipe the rest on the next
  load. Baked to `i18n/gloss-<lang>.js` by `serializeGlossaryI18n(lang)`, one file per edited language and **only
  for languages whose file is loaded** (`editedGlossI18nLangs`) — writing an unloaded one would truncate the shipped
  file to just the edited slugs — via auto-save / Save to project / `folioSave.files`;
  `PRISTINE_GLOSS_I18N` + `revertGloss` cover undo/revert); title/dates/aliases/tags stay EN-view-only. The editor
  previews render in the editing language. Gloss auto-linking stays EN-only. `setLang` itself
  calls `render()`, so the editor re-renders in the new language on switch — but note the picker now lives on
  the Settings page, so switching language means leaving the editor and coming back.
- **Card editor = single live card** (`.card-edit-single` in `adminRenderEditor`): no fields/preview split — ONE
  card-styled surface (`.admin-live-card`) whose question / answer / answerDate / abstract are `.ces-field`
  contenteditables, **double-click to edit in place** (blur locks again; every keystroke saves). Above it: the
  formatting ribbon + a meta row (id, chronology, plain `answerText`) + a collapsible "Appears in N decks" picker.
  Below: a collapsible **whole-card HTML source** (`#cesSrcTa`, sections delimited by `<!-- QUESTION -->`-style
  markers, two-way synced; `.af-src[hidden]{display:none}` is required — the author `display:block` would defeat the
  hidden attribute and leave it permanently expanded). The picture or clip renders in place in **ONE media slot**
  (`#cesMediaSlot`, click = edit panel; the **title / description / source fields (`#cesMediaMeta`) only appear once
  a URL is set** — `syncMediaMeta()` gates them on the GATE's staged src, not the store; the fullscreen
  viewer is suppressed inside the editor via stopPropagation); a card with neither shows an **editor-only**
  "Add an image or a video" placeholder (`.ces-img-ph` — deliberately NOT `.card-img`, so the delegated viewer/study
  page never see it). `.card-edit-single .admin-live-card` carries auto margins (the card caps at 680px inside the 780px
  column — without them it sat off-centre). **traditional / hanzi / pinyin / translations / citation were REMOVED from the editor on request**
  (the data fields still exist and render on study cards). **The admin tree drags two ways**: dropping on a
  same-parent sibling REORDERS (insert-before, `reorderSiblings` — the Library follows this order); dropping on a
  node with a different parent MOVES INTO it, as before. The
  shipped data files are never rewritten by the app; edits live in this override layer and can be
  exported as JSON. **"Save to project"** (`adminExport`) writes `data.js`/`glossary.js`/`timeline.js` via the File System Access
  API (Chrome over `http://localhost`) then prunes the overlay + reloads. **"Auto-save: on"** (`adminAutosave` toggle, pref
  `folio_autosave_v1`) writes those same files on **every** edit (debounced ~20s after you stop typing) with NO prune/reload — the folder handle is kept in
  IndexedDB (`folio-fs`), and since `applyAdminEdits` is idempotent (created-card guard + set-based) the untouched overlay re-applies
  cleanly on reload. Chrome's write permission is per-session, so after a reload the toggle shows an amber **"reconnect"** state you
  click (a user gesture) to re-grant. Only works in real Chrome over localhost — not `file://` or the Claude Code preview webview.
  Because a file-watching dev server may **live-reload** the page after each auto-save, the editor **persists its position**
  (open card/deck/term, tab, search, sort, tree-expansion, list scroll) to `localStorage["folio_admin_ui_v1"]` (`saveAdminUI`, on
  every navigation + `pagehide`) and **restores it on load** (`restoreAdminUI` seeds `adminState`; `PAGES.admin` re-validates the
  saved card/node/term against the rebuilt tree and scrolls it back into view) — so a reload lands you back on the card you were
  editing instead of the top of the deck.
- **Admin undo (Ctrl/Cmd+Z on the editor page):** an overlay edit checkpoints its PRE-edit state (JSON) onto an in-memory
  `adminUndoStack` via `adminCheckpoint()`. Immediate/structural saves (`saveAdminEdits`, e.g. create/delete/rename/move) checkpoint
  directly; debounced field-typing (`queueAdminSave`) checkpoints at the **LEADING edge** of a burst and the debounce fire only
  advances the baseline via `writeAdminEdits` (no 2nd entry) — so a Ctrl+Z **mid-burst** (before the 350ms save) still reverts the
  in-flight edit, and a structural action that interrupts a pending burst doesn't collapse the two into one undo (both were fixed
  after a review flagged them). Bursts collapse into one entry; capped 100; session-only, not persisted. A global keydown handler
  fires `adminUndo()` **only when `current.name === "admin"` and focus is NOT in an input/textarea/contenteditable** (so the
  browser's native typing-undo is preserved inside fields).
  `adminUndo` pops a snapshot and `reapplyAdminOverlay` reconstructs state exactly as a fresh load would: reset the in-place-mutated
  globals to their shipped base (`glossaryResetToPristine()` from `PRISTINE_GLOSS*`; rebuild `CARDS`/`CARD_BY_ID` from `PRISTINE_CARDS`
  restricted to `BASE_CARD_IDS`), install the snapshot as `ADMIN_EDITS`, then `applyAdminEdits()` (which rebuilds the tree from
  `SHIPPED_NODES` and re-applies all deltas). Guarded by `_adminUndoing` (so the undo's own save doesn't re-checkpoint) and
  `_adminUndoReady` (false until boot, so the load-time overlay cleanup isn't captured). Known limitation: undoing a **first
  timeline-era edit** (`ADMIN_EDITS.timeline` array→null) doesn't reset the in-memory `window.TIMELINE` (a deep snapshot would cost
  MBs) — the overlay reverts, so it self-heals on reload; timeline eras are edited on the map page anyway, out of this handler's scope.
- **The phone's gloss window is CENTRED, the WHOLE of it drags, and the page behind it goes soft**
  (`.gloss-win.gloss-sheet` / `makeGlossSheetDraggable` / `glossScrim` / `wireGlossDoubleTap`, Aug 2026, on
  request). It was a bottom sheet glued to the foot of the screen for months; a definition met mid-sentence
  belongs in the middle of the screen, where the reader's eye already is, and the sheet was also the
  furthest point on the page from the word tapped.
  What a centred window loses is the sheet's implicit "there is a page behind me", so it can be HELD and
  dragged UP AND DOWN to uncover the sentence the term came from. **Vertical only**, deliberately: the
  window is as wide as the screen allows, so there is nothing to uncover sideways and a horizontal drag
  would fight the page-swipe gesture. The offset is a custom property, **`--gs-dy`, riding INSIDE the
  `translate(-50%,-50%)`** rather than replacing it with a `top` — mixing the two would need the height
  measured on every move. It is **not remembered**: a new term always opens in the middle (the request says
  so), so the offset lives on the element and dies with it, which also means the restore-after-reload path
  needed no change.
  · **EVERY PART of the window is the handle**, not a bar. It was the title bar, then briefly a grab bar at
    each end, and both marks went on request — a window in the middle of the screen can want moving either
    way and which end falls under the thumb depends on where it currently is. The one exception is the
    DESCRIPTION when there is more of it than fits: that box scrolls, and the choice is made at
    **pointerdown** (`body.scrollHeight > body.clientHeight` → this is a scroll) rather than arbitrated
    mid-gesture, because a gesture that changes its mind half way through is what reads as broken. Most
    terms are three sentences and scroll nothing, so for most of them the whole window really does drag.
    `touch-action:none` on the window with **`pan-y` back on `.gloss-body`** is the CSS half of the same
    split; controls and `.ttip` are exempt through `GLOSS_NODRAG`.
  · **A DOUBLE TAP anywhere closes it** — the × is a 26px target in one corner of a window that fills most
    of the screen. Written on pointer events, not `dblclick`, which a phone may swallow for double-tap-to-
    zoom. Two guards: the taps must land close TOGETHER as well as close in time (`GLOSS_TAP_SLOP`), so
    tapping one word and then another further down is not a close; and an interactive target is exempt
    (`GLOSS_TAP_SKIP`), or a nested glossary link and the sources fold would become unusable. The end of a
    drag is told from a tap by a **one-shot flag** (`win._glossDragged`) that the drag sets and the tap
    handler clears — NOT by reading the `dragging` class, which is gone by the time the tap handler runs
    and which, if held for a frame instead, swallows the first real tap after every drag.
  · **The scrim is ONE element with `backdrop-filter`** (`#glossScrim`), never a `filter` over a list of the
    page's own containers: that list would need keeping in step with every fixed thing on the site, and a
    `filter` on an ancestor becomes the containing block for its `position:fixed` descendants — which would
    move the very bars it was blurring. **`pointer-events:none`**: this is focus, not a modal, and tapping
    outside still does not close a popup. It is raised **explicitly** in `openGlossWin` rather than through
    `syncGlossScrim`, because at that point the new window has not yet been pushed onto `glossWins` (that
    is the last thing the function does) and a count-based call would find zero.
  It keeps the sheet's **permanent compositing layer** (`will-change:transform` + `backface-visibility`),
  and that is not decoration: it was the fix for a reported flicker, where the sheet blinked out for a
  fraction of a second the instant its slide finished. A per-frame probe read `opacity:1`,
  `visibility:visible` and one `.gloss-win` throughout, so the gap is the browser DISCARDING the layer it
  made for the transform animation and repainting a frame or two later. Declaring the promotion up front
  means the layer is never created and never thrown away. **Keep it on this one element** — a permanent
  layer is cheap once and expensive by the dozen, and the desktop popups fade rather than move.
- **Gloss popups persist across reload:** the open glossary popups (`glossWins`, the draggable `.gloss-win` windows opened by
  clicking a `.ttip` term) are recorded to `sessionStorage["folio_gloss_open_v1"]` as `{ r: <route>, w: [{ k, l, t }] }` (owning page
  + term slug + left/top) by `persistGlossOpen()` on open / user-close / drag-end. **`sessionStorage` (not local)** so an F5 /
  dev-server live-reload in the same tab restores them, but a tab/browser **close** clears them (a cold restart won't resurrect stale
  popups). Boot captures the record **before** the first `render()` (whose `closeAllGloss()` clears the key) and `restoreGlossWins()`
  re-opens each at its saved position **after** the initial render — but **only if the record's route matches the booted page** (so a
  popup opened during study, which reloads to Home since `study` isn't a restorable hash, is dropped rather than orphaned over Home).
  Navigation still dismisses popups (`render()` → `closeAllGloss` also clears the key). Terms no longer in `window.GLOSSARY` are
  skipped; on mobile only the first saved popup is restored (single-sheet). `renderCard()` calls `closeAllGloss()` **before** its
  empty-queue early return so a last-card popup can't linger over the completion screen. `openGlossWin(key, triggerEl, pos)` takes an
  optional `pos` to place a restored window (vs `positionGlossBeside` for a fresh click).
- **Hierarchy terms:** collection → deck → subdeck. (An early refactor renamed these from the old
  deck/subdeck/sub-subdeck — don't reintroduce the old names.)
- **Cards** can belong to several decks at once (cross-listed by era/date) with shared progress,
  and are ordered chronologically.
- **XP / levels** (`levelFromXP` / `xpBarMarkup` / `levelBadgeMarkup` in app.js): **XP = the number of distinct cards
  studied** (derived from `S.cards`; no separate persistence). Each level costs **`XP_PER_LEVEL × level`** more cards,
  and **`XP_PER_LEVEL` is 5** (bar starts at 0/5, then 0/10, 0/15, …). It was 3 until Aug 2026 and was raised on
  request, because the daily allowance now defaults to FIVE new cards: at a step of three a level turned over in the
  middle of an ordinary day's work, which made the badge mean nothing. **Keep the step and the default allowance in
  step** — the number is a constant precisely so the two can be read against each other. Nothing migrates: XP is
  derived from `S.cards` on every read, so an existing reader's level simply recomputes on the new curve (roughly
  ×0.77 of the old level number at the same card count). Guarded by `test-card-types.js`, which slices `levelFromXP`
  out of app.js and walks every threshold through level 13. Each **collection** has its own level (distinct cards studied within it, `collectionXP` =
  `studiedInNode`) shown on its **Library banner**; the whole of Folio has a **general level** (`folioXP` =
  `Object.keys(S.cards).length`) shown on the **home Daily-review banner**. Both banners carry a **large level numeral**
  on the left (`.level-badge` — just the numeral now; the small "Level" label under it was removed since the blue "Level N"
  in the xp-bar head beside it already says it), rendered in a **golden colour** (`.banner .lb-num` + `.collection-row .lb-num`
  = `#C39A2E`, brighter `#E6C765` on `body.night`; the profile `.cl-row .lb-num` stays indigo). **The review
  banner's xp bar runs in the same metal** (`.banner .xp-fill` + `.xp-lvl`, gold): the Library's bars take each
  collection's hue and the account's are indigo, so one indigo bar read as another. Its "Level N" label is a
  DEEPER gold than the fill — `#C39A2E` on the card is only 3.6:1, too thin for 10px text. The earned
  `.done`/`.won` fills override both with their own on-fill colour, since gold on gold reads as nothing. The old studied/total
  **progress bars were removed from Library decks + collections** (they remain on the account page's "Progress by deck").
  **The Daily-review list got one back** in July 2026, on request: each added row carries an `X/X studied` bar
  (`adProg` in `PAGES.home` → `.prog.ad-prog`, animated by the existing `animateProgs`) where a blue `.ad-dot` used to
  sit. (The bin at the right of each row went in Aug 2026 — Remove moved into the row's long-press options sheet;
  see the per-deck-limits bullet above.) The dot and the ancestor rows' hollow `.ad-branch` went together — the branch existed only to line the two up,
  and alone it would have pushed every parent title 21px right of the deck beneath it; the `data-depth` indent carries
  the hierarchy. The bar's label also replaced the `.ad-count` "N cards" chip, which stated the same total twice.
  **The row is ONE horizontal line** (Aug 2026, on request): piles · name · figure · bin, all centred on the same
  level, with the row's vertical padding down to 10px. It was two lines — the title on top and the bar indented
  under it — which left a band of empty card either side of a short deck name. Two things had to give for five
  things to share a 390px screen. **Below 640px the bar leaves the line and becomes the row's own bottom edge**
  (`.ad-prog .track` absolutely positioned along it; the row is `position:relative; overflow:hidden` so the last
  row's rounded corners clip it), an underline costing no width at all — measured, the label alone is ~88px and
  the name needs ~100, so an inline track of any useful length can only be paid for by cutting the deck's name.
  **Above the breakpoint it stays in the line**, stretched between the name and the figure, which is what fills
  the middle of a wide row; the phone block must therefore sit BELOW those rules, a media query adding no
  specificity. And the label was shortened to **`X/X studied`** (its `I18N_RULES` pattern moved with it in all nine
  languages, the old one retired). The `data-depth` indent went with them, from `22 + depth*21` to
  `16 + depth*16`. The name is the only thing that ellipsises, since it is the only part of the row with a
  shorter form. Each collection's level is also listed on the **profile** (`renderCollectionLevels` in
  `acctSelfView`). `grade()` calls `announceLevelUps(id)` on a freshly-studied card → a **full-screen "Level up!" popup**
  (`congratsPopup(items)`, a `.levelup-pop` overlay modelled on `inlineModal`) naming each Folio/collection level that ticks
  over (China's shown as its Chinese numeral); it is **dismissed by clicking anywhere on screen** (or Esc/Enter) — the
  click-to-close listener is wired a tick later (`setTimeout 0`) so the grading click that spawned it doesn't instantly dismiss it.
  **`render()` closes it too** (`closeCongrats`, beside `closeImageViewer`, Aug 2026). Dismiss-on-any-click made
  it look as though it could not outlive its page — clicking a nav tab takes it away — but a back/forward, a
  deep link and any programmatic hash change move the route without a click, and it then sat over whatever
  rendered next. It lives on `document.body`, so like every other overlay there it is `render()`'s to clear.
  Clicking a **deck row in the home Daily-review list** starts a study session scoped to just that deck
  (`data-review` → `route("study",{scope:{type:"deck",id}})`). On the **Library page, clicking a collection's body studies its
  whole subtree** (`wireExpander`'s optional `rowClick` → `route("study",{scope:{type:"deck",id}})`, since a collection is in
  `NODE_BY_ID` and `subtreeCardIds` covers it); its **chevron still expands/collapses** the decks within (the chevron's
  `stopPropagation` keeps it from also studying). A coming-soon / empty collection falls back to toggling.
- **Card-of-the-day additions** (`COTD_ENTRY` / `cotdIds` / `cotdAdd`, beside the other entry helpers): the home tile's
  button studies **that one card** (`scope {type:"card", id, addTo:"cotd"}`), and **grading it** — not opening it — drops
  the card into the daily review. It can't be added the usual way: `S.active` holds whole decks, and pulling a deck in
  for one card is not what the tile offers. So the ids collect in **`S.cards`-independent `S.cotd`** (in `defaultState`
  + `PROGRESS_FIELDS`) and ride in under ONE pseudo-entry, `"cotd:added"`, which `activeEntryIds` / `entryCardIds` /
  `entryInfo` / `removeActive` each special-case so it lists, studies (`scope {type:"cotd"}`) and trashes like an added
  collection — its trash **empties the whole list**, and the entry only exists while it holds cards, so an emptied list
  retires its own row. The id carries a **colon** so it can never collide with a node id (plain slugs) or a `u:` deck.
  Two study-session details go with it: a **one-card session does not requeue** a learning step (`res.requeue &&
  scope.type !== "card"`) — with no other card between, the card would reappear instantly and read as a grade that
  never landed, and it is scheduled properly regardless — and `fromHome` (review / card / cotd scopes) sends the exit
  button, the completion screen and the caught-up placard back to **Home** rather than the collections.
- **Daily review order** (`S.settings.reviewRandom`): **Ordered** (labelled "Chrono" until Aug 2026, renamed on
  request — the old key is retired from all nine language tables) presents cards in their in-deck order;
  **Random** shuffles the session order. The **draw** of the day's new cards is date-seeded-random across the decks in BOTH
  modes now (see the next bullet) — the setting decides presentation order only.
  **It is chosen by HOLDING THE BANNER** (`openReviewMenu` → `openDeckMenu(REVIEW_ENTRY)`, Aug 2026, on request),
  plus the Settings page's own "Random review order" switch. **The banner's sheet IS the deck sheet now** (Aug 2026,
  on request: "the same menu, without the delete option"): Custom study, Daily limits and Skip today above it, no
  Remove — there is nothing to take the review out OF — and the Ordered/Random pair kept, being a property of the
  pooled session and of nothing else. It was a `.review-order` pill absolutely positioned in the banner's top-right
  corner: a permanent control, in the corner of the one block on the home page that has something to say, for a
  setting almost nobody changes twice. The sheet is the same `deckSheet` shell the deck rows use one level down,
  so the gesture is the same one step up the hierarchy, and the rows are `.dm-choice` — a SET, with the current
  one ticked, rather than commands. **The long-press wiring is `wireHoldMenu(el, onHold, onTap)`** (beside
  `openDeckMenu`), shared with the deck rows. Its one subtlety: the click that follows a hold is swallowed by a
  **document-level CAPTURE listener** keyed off `_holdUntil`, not by a flag the element's own handler checks —
  the banner already had a click listener before this ran, and listener order on one element is registration
  order, so an element-level guard registered second would fire after the very handler it exists to stop.
- **PER-DECK DAILY LIMITS, and a review pooled from all of them (Aug 2026, on request).** There used to be ONE global
  allowance (`S.settings.newPerDay`) sliced off the front of the pooled card list, so a reader with two decks got every
  new card from whichever came first and never saw the second deck at all. That was the bug; per-deck allowances are
  the fix, and the shape is Anki's.
  · **`deckLimits(id)`** → `{ newPerDay, maxReviews, newIgnoresReview }`, stored in **`S.deckOpts`** keyed by the same
    entry id as `S.active` and written only for decks the reader has actually changed — an absent deck follows
    `S.settings.newPerDay`, exactly as before. `DECK_MAX_REVIEWS` (200) is Anki's own default.
  · **`S.deckDay`** holds TODAY only — `{ d, extra, skip }`, the Custom-study bump and "Skip today" — and resets in
    place, dropping every other stale record with it, so the table can never outgrow the decks in use.
  · **The COUNTS are DERIVED, never tallied** (`deckDoneToday`). `grade()` writes **`c.first`** — the day a card was
    introduced — onto the card record, and every per-deck new count is read back off it. That is what makes the
    figures right for a deck that is not in the review, right after an undo, and right for a card sitting in two decks
    at once; a per-deck tally would have to be kept in step with all three by hand.
  · **`reviewQueue` now builds deck by deck and then pools**: each entry offers its due cards up to
    `deckReviewRemaining` and its unseen cards up to `deckNewRemaining`, the new ones are **date-seeded-shuffled across
    the decks** and sliced to `newRemainingToday()`. Dedupe happens BEFORE the slice, or a card an earlier deck already
    claimed eats one of this deck's places. So with two decks at 5/day the review draws 5 in all — say 3 and 2 — and
    each row then shows the 2 and 3 that deck still has of its own, which is exactly what a reader sees under a
    cleared banner and is correct rather than a bug.
  · **…and the REVIEW ITSELF is an entry, under `REVIEW_ENTRY` (`"review:all"`)** — Aug 2026, on a bug report. It is
    Anki's parent deck: it pools what its decks offer and caps the pool, and it had no settings of its own, so the cap
    came from Settings → New cards per day while each deck's came from its own sheet. Two decks at five a day pooled
    ten and then handed back three — a figure no deck had agreed to, and nothing on the page explained it.
    `deckLimits` / `deckDoneToday` / `deckNewRemaining` / `deckDay` / `entryCardIds` / `entryInfo` and the long-press
    sheet all answer for that id as they do for a deck, which is what makes the banner and the rows under it
    arithmetically incapable of disagreeing. Two things about it are decisions rather than plumbing.
    **Its DEFAULT new-card limit is the LARGEST any added deck offers** (`reviewLimits`), not the global number: a
    pooled view must not impose a figure none of the things it pools has agreed to. An explicit limit set in its own
    sheet wins outright, exactly as a parent deck's does in Anki, and Settings → New cards per day remains what a DECK
    follows until it is given limits of its own. **And `newRemainingToday()` is now `deckNewRemaining(REVIEW_ENTRY)`,
    derived from the card records** — it used to read `S.intro.count`, a running tally `grade()` increments on ANY
    card's first grade, so a Card of the day or a deck tapped into directly silently ate the review's allowance and an
    undo did not give it back. The decks' counts were derived all along; the banner above them was not, and the two
    drifted apart. `S.intro` is still written and still rides in the synced blob; nothing reads it for a limit.
  · **A deck's row wears its COLLECTION's hue**, not the review's bronze (Aug 2026, on request): `rowHue` in
    `PAGES.home` walks up to the root collection and sets `--coll-bg` from `COLL_THEME` — the same colour the
    Library banner uses — and the row's wash, left bar and hover all read it, falling back to the bronze for a
    community deck or the Card-of-the-day list, which belong to no collection.
  · **A pile at ZERO is grey** (`.adc-zero` on a row, `.stat-zero` on the banner, Aug 2026, on request): the
    colour means "there is work of this kind here", so it has nothing to say on a 0.
  · **`entryPiles(id)`** is what a deck's row shows, and it is deliberately NOT that deck's share of the pooled review.
    `buildSession` uses the same per-deck allowances for a `deck` / `udeck` scope, so tapping a row studies what its
    row promised.
  · **The sheet is CENTRED at every width and leaves the way it arrives** (Aug 2026, on request). It was a
    bottom sheet below 560px, on the reasoning that the row held was near the thumb; what that produced was a
    dialog rising out of the tab bar at the very bottom of the screen, furthest from where the reader was
    looking. It also had an entrance and no exit, so dismissing it cut it away on the frame of the click —
    the one abrupt half of a control that is otherwise entirely animated. `deckSheet`'s close adds `.closing`
    and removes the element after `DECK_SHEET_OUT_MS` (keep that in step with the CSS), and clears
    `_deckMenuClose` at the same moment so a second close cannot restart the timer; the overlay stops
    hit-testing the instant the class lands, so the gesture is finished whatever the paint is still doing.
  · **The row's options are a LONG PRESS** (`openDeckMenu` / `deckSheet` / `openCustomStudy` / `openDeckLimits`), and
    the small bin that used to sit at the right of every row is gone with it — one command holding a permanent column
    on a 390px row, with three more that had nowhere to live. Custom study bumps the deck's allowance for today AND
    `S.intro.extra` by the same amount (or the extra cards would be unreachable from the banner the reader pressed to
    ask for them); Skip today sits the deck out of `reviewQueue`; Remove is the old bin. A press is CLASSIFIED like
    the whiteboard marker's drag — a finger that moves more than `AD_SLOP` is scrolling, not holding — and
    `contextmenu` plus the ContextMenu key give a mouse and a keyboard the same way in. The sheet lives on
    `document.body`, so **`render()` closes it** (`closeDeckMenu`).
  · **The N/N STUDIED figure lives in the sheet's head, not on the row** (`.dm-studied`, Aug 2026, on request).
    It sat at the right of the row, where on a 390px line it competed with the deck's own name — the one part
    of the row with a shorter form, so the name is what gave way. The **bar stays on the row** and says the
    same thing at a glance, which is all a row of a list is for; the exact count is something a reader goes
    looking for, and holding the row IS that. It is derived from `entryCardIds(id)` + `isSeen`, so it answers
    for a deck, a community deck, the Card-of-the-day list and the pooled review alike, and is omitted
    outright on an entry with no cards. `.dm-head` is a `justify-content:space-between` row on
    **`align-items:baseline`**: the left-hand block (`.dm-headmain`) is a column, and a column flex item
    aligns on its own FIRST line's baseline — which is what puts the figure on the title's line rather than
    on the block's centre. `adProg` no longer emits `.count`.
  · **Remove carries its red in the TEXT and nothing else** (Aug 2026, on request). It had `--zh-wash` behind
    it on hover, and on a phone a hover state can be left behind by the very tap that opened the sheet — a
    highlighted row in a menu reads as one already chosen. The rule is gone; `.dm-item.dm-danger b` keeps
    `--zh` and the row hovers like every other. `test-layout.js` asserts it HOVERED, against an ordinary
    row's own hover wash — reading the resting style would pass whatever the rule says.
- **The Folio LEVEL is how many decks may sit in the daily review** (`maxActiveDecks` = the level, Aug 2026, on
  request — levels were a score and nothing else, and this is the first thing they decide). `addActive` returns
  **false** when the cap turned it down so `wireAddButton` can say why rather than doing nothing, and the Library's
  page head states the standing (`.lib-cap`). Two deliberate exclusions: the **Card-of-the-day pseudo-entry is
  outside the cap** (it is added by grading a card from the home tile, not chosen from the library, so a full review
  would otherwise make that button silently stop working), and **`countedActiveEntries` skips an entry with no
  available cards** — the shipped default `S.active` is a deck of the China collection, which is set aside as coming
  soon, and counting it would have left a brand-new reader at their cap before choosing anything.
- **THE DAY BOUNDARY** (`dayKey` / `dayKeyOfDate` / `dayEndMin` / `dayEndTs` / `scheduleDayRoll`, Aug 2026,
  on a bug report: "the daily quote doesn't always change exactly at midnight"). A day used to be a UTC day
  (`new Date().toISOString().slice(0,10)`), so the quote, the card of the day, the streak, the review's
  allowance and the games' per-day records all rolled over at an hour that was not midnight for anybody off
  the Greenwich meridian. A day now runs on **THIS DEVICE'S OWN CLOCK** and ends at `S.settings.dayEnd` —
  minutes past midnight, 0 by default, capped at noon (`DAY_END_MAX`), set in **Settings → Study → Day ends
  at** — so a reader who studies until two in the morning can keep the day open until then.
  · **`dayKey(ts)` is the SINGLE derivation and everything goes through it.** The key was computed in ten
    places by slicing an ISO string; a rule applied in nine of them would leave one surface rolling over at a
    different moment from its neighbours, which reads as a bug in whichever surface you happen to be looking
    at. `dayKeyOfDate(d)` is the sibling for the two places that ITERATE days (`reviewHistory`, the heatmap)
    rather than deriving one from a timestamp, and `dayEndTs()` is what `dueForecast` means by "the end of
    today" now that 23:59 is not it.
  · **It deliberately does NOT derive a zone from `S.settings.home`.** A lon/lat cannot be turned into a
    political time zone without a tz database, and approximating one from longitude would put the Netherlands
    (lon 5.3) on UTC+0 — an hour or two out from the reader's own clock, and worse than the device time it
    replaced. The Settings row says "this device's clock" outright.
  · **`scheduleDayRoll()`** re-arms itself and repaints ONLY the home page, which is where everything dated
    lives; a repaint under a reader mid-card would take the card away.
- **Scheduling (`grade()`):** SM-2-ish with Anki-style learning steps. A **new card graded "Good"** becomes a `learning` step
  (`interval 1/144`, `due = now + 10 min`) that **re-appears the same session/day** — grade() returns `{requeue: due-now < 11 min}`
  and the study session does `queue.shift(); if (requeue) queue.push(id)` — and only **graduates to `review` (due tomorrow) on the
  next "Good"** (Anki-like; before this it jumped straight to tomorrow). "Again"/"Hard" on a new/learning card also requeue
  (1 min / 6 min); "Easy" graduates immediately (4 days). `S.intro.count` (the daily new-card cap via `newRemainingToday`) is
  incremented only on a card's FIRST grade (`fresh`), so a requeued learning card is never re-counted.
- **Undoing a grade (Aug 2026, on request)** — `undoStack` / `undoSnapshot` / `undoGrade` inside `PAGES.study`,
  reached by the `#undoGrade` button in the study bar (rendered only when there is something to undo), by
  **Ctrl/Cmd+Z**, and by "Undo the last card" on the completion screen (where the queue is empty and there is no
  card left to press the button on). A misclick on Again or Easy was otherwise unfixable from inside a session.
  **A grade is LOSSY** — the old interval, ease and due date cannot be derived back out of the new ones — and
  `grade()` writes in five places at once, so the undo is a snapshot of exactly those (`S.cards[id]`, today's
  `reviewLog` row, `S.reviewDay`, `S.intro`, `S.streak`) taken in `doGrade` **before anything is written and
  before `queue.shift()`**, plus the queue itself, which is what restores a requeued learning step as faithfully
  as a graduated card. The card comes back **revealed** (`studyRevealId`), on the grade row it was mis-answered on.
  Two things it deliberately does NOT take back, both additive and harmless: a badge or level-up already announced
  (`checkAchievements` only ever adds) and a Card of the day already dropped into the review list.
  **The Ctrl+Z guard is not `!typing`**: the cloze box takes focus as each card opens, so refusing whenever it is
  focused would mean the shortcut never fired at the one moment it is wanted — the card AFTER the misclick, which
  has just opened with an empty box. It yields to the browser's own typing-undo only while the box actually holds
  a typed guess. (That autofocus is now **keyboard-machines only** — `setupCloze` skips it under `touchDevice()`,
  i.e. `(hover:none)`, added Aug 2026 on request: on a phone it summoned the on-screen keyboard over half the card
  on every card, before the reader had decided to type. The guard is unaffected — a touch reader who has not
  focused the box is exactly the case it already lets through.)
  **The shortcuts are written down in the grade bar's `?` bubble** (`.ghb-keys`, Aug 2026) — Space reveals,
  1–4 grade, Enter is Good, Ctrl+Z takes the last one back. They all existed and nothing said so, and that
  bubble is where a reader already goes to ask what the buttons do. (The Atlas's own coach marks already
  covered its click drill-down; they gained the keyboard line — `[`/`]`, Enter, Esc — which they hadn't.)
- **The grade bar is ONE row below 430px** (Aug 2026). Two rows of two plus a help/suspend row took about a
  quarter of a phone screen, over a card whose background already runs several screens. Four columns fit once
  `.gk` goes — those digits name keys a phone does not have — and `body.grading .stage`'s bottom padding drops
  from 206px to 150px to match.
- **…and on a phone its HEIGHT is the reader's** (`.gb-fold` / `gbWireResize` / `body.gb-compact`, Aug 2026, on
  request): a **CHEVRON** on its top edge folds the bar to half its height, 111px → 58px, the four grades going
  side by side as bare COLOURS with the `?`, Undo and Suspend as icons on the same row. It was a DRAG GRIP for a
  fortnight and became a chevron on request (Aug 2026): the bar has exactly two positions, so a drag was a
  gesture whose whole range mapped onto one bit, and a chevron says "there are two states and this is the other
  one" outright. Being a real `<button>` it also needs no press classification — `GB_SLOP`, which told a drag
  from a tap, is retired — and Enter/Space come free, with ↑/↓ reaching the two states directly.
  Three things are load-bearing. The chevron lives **outside `.gradebar-inner`**, whose contents are replaced for
  every card, so it is wired once in `ensureGradeBar` and a grade never has to survive a rebuild. Nothing is
  **lost** in the short state: the label is CLIPPED (`clip-path`, 1px) rather than `display:none`, or the four
  buttons would be four unnamed colours to a screen reader as well as to the eye, and the `?`/Undo/Suspend go
  icon-only via **`font-size:0` on the button** — their text is a bare node beside an `<svg>`, which no
  selector can reach, and the svg keeps its own px size. The chevron's own svg is rotated 180° in the short
  state, so it always points the way pressing it will go. And `body.gb-compact.grading .stage`'s padding drops
  to 96px with it (specificity, not source order — the ≤430px block's `body.grading .stage` sits further
  down). Device-local in `localStorage["folio_gb_compact_v1"]`, like where the marker sits and how tall the
  place sheet is. Guarded by `test-layout.js`.
  **It FOLDS rather than cutting** (Aug 2026, on a report). The two states differ by more than a height —
  the four grades go from two rows of two to one row of four, and the `?`, Undo and Suspend move up beside
  them — and none of that is a property CSS can transition. So the SIZES transition in CSS and the
  POSITIONS are FLIPped in JS (`gbSetCompact(on, persist, animate)` → `flipHeight` around `flipMove`), and
  the two halves have to be written against each other: the tall state states `.grade`'s height explicitly
  (`calc(56px * var(--fs))`, since `auto` is a value nothing can transition from) and **`GB_FOLD_MS` must
  stay in step with the 280ms in styles.css**. The animation is not gated on being a phone — above the
  breakpoint the chevron is `display:none` and it is unreachable, and `flipMove` skips anything that did
  not move — but it IS gated on the reader's motion setting, inside both helpers. Note for the tests: a
  height read sooner than `GB_FOLD_MS` after the press measures a state half way between the two.
- **Undo is repeated INSIDE the grade bar on a phone** (`#undoGradeBar`, `.gb-undo` — Aug 2026, on request).
  The study bar's `#undoGrade` sits at the top of a card that runs several screens, so on a phone the one way
  back from a misclicked grade was scrolled off screen at exactly the moment it was wanted. The grade bar's copy
  takes the `undo` cell of `.grade-wrap`'s phone grid (`"grades grades grades" / "help undo suspend"`), beside
  the `?` that explains the buttons above it. It is a SECOND button rather than a moved one because the grade
  bar only exists once the answer is revealed, and the study bar's copy still has to be there before that;
  `body.grading .study-shell .undobtn{display:none}` is what keeps a revealed card from showing two, and
  `.grade-wrap .gb-undo{display:none}` keeps the desktop on the study bar's single copy. Both halves are
  asserted by `test-layout.js` — a duplicate and a disappearance look identical in a screenshot of one state.
- **Review history + statistics:** `grade()` calls **`logReview(mature, correct)`**, which tallies
  `S.reviewLog["YYYY-MM-DD"] = [reviews, matureCorrect, matureTotal]` (in `defaultState()` so old saves
  back-fill, and in `PROGRESS_FIELDS` so it syncs and a friend's shows too). **This log has to exist**: a card
  record keeps only its *last* review, so a card studied on ten days is indistinguishable from one studied
  once — past-day history is unreconstructable from `S.cards`. "Mature" = the card's status was `review`
  *before* the grade (a real recall attempt, not a learning step — hence `preStatus`, captured before the
  scheduler rewrites it); correct = anything but Again. Pruned to `REVIEW_LOG_DAYS` (400).
  Read by `reviewHistory` / `retentionRate` / `dueForecast` and rendered by **`reviewStatsHTML(prog, joined)`**
  on the account page and a friend's: a **study heatmap** (whole weeks in columns, Monday-first,
  scrolling inside `.hm-scroll` so it can never widen the page), a **90-day true-retention** figure (`—`
  when nothing mature has been reviewed — never a made-up 0% or 100%), and a **14-day due forecast**
  (overdue cards fold into today rather than hiding in a past bucket). `dueForecast` skips suspended cards
  and anything in a coming-soon collection, matching `availableCardIdSet()`.
  **The heatmap starts on the day the account was created** (`joined` — `S.user.joined` for yourself, the
  friend's `profiles.joined` for theirs), capped at `HEAT_WEEKS` (53), rather than always showing a year of
  blank squares. Two things that look optional but aren't: it never starts **later than
  `firstLoggedDay(prog)`**, or a guest's study history migrated up into their first account would be hidden
  by the later sign-up date; and the range is rounded **back to that week's Monday**, because the grid is
  `grid-auto-flow:column` over 7 rows and day 0 must be a Monday or every column shifts. The days in that
  first column that precede the account render as `.hm-pre` blanks (aligned, but not drawn as missed days)
  and are excluded from the totals. Month labels drop the earlier of any pair closer than 3 columns — at
  11px per column two labels collide, which a full year never triggered but a short new-account range does.
- **Deck statistics + "Beyond the cards"** (the account page, and a friend's — both take a `prog`, so the
  friend view gets them for free). Two sections below Review statistics:
  · **`renderDeckStats(container, prog, withCommunity)`** — an `<optgroup>`ed picker over `statScopes()`
    (each live collection, every deck inside it, and — for your own account only — your community decks,
    which live outside the tree and outside a friend's synced blob) driving `deckStatsPanelHTML`: a
    studied/total bar plus eight tiles (mature / young / learning / not started / due now / lapses /
    average gap / set aside) and when the deck was last studied. It opens on the deck with the most
    studied cards, and the selection is UI-only — a glance, not a setting. **Everything is DERIVED from
    the card records** (`deckStats(prog, ids)`), deliberately: a per-deck review log would only start on
    the day it was added, so every deck already worked through would read as empty, and it would multiply
    the synced blob by the number of decks. The day-by-day history stays global.
  · **`exploreStatsHTML(prog)`** — what a scholar does *around* the cards. Two meters (glossary terms
    opened, **countries** opened on the Atlas — the latter shows "of N" only once `world.js` has actually
    loaded, since that bundle is lazy), seven derived tiles (**historical territories**, all-time reviews,
    days studied, **longest streak** — `longestStreakDays`, computable from `reviewLog` where `S.streak`
    only holds the current one — card-of-the-day picks, games played, perfect runs) and a per-game row
    from the lifetime log.
    **Both meters count against the set they are measured by, which is NOT the whole register**, and each
    was wrong once in the same way. `placesSeen` records every place opened — 258 present-day countries
    *and* 1,194 historical era territories — so counting the register against `WORLD_GEO.length` read
    "412 of 258": the bar clamps at 100%, the figure beside it does not. It now counts only names that
    are present-day countries (`countrySeenCount`), and the remainder gets the "Historical territories"
    tile rather than being silently dropped. `glossSeen` likewise counts only terms that **still exist**
    (`glossSeenCount`), or a term retired since it was read pushes the figure past the total. The single
    helpers `countryNameSet` / `countryTotalCount` / `countrySeenCount` / `glossSeenCount` /
    `glossTotalCount` are shared by the meters, the discovery chips and `progStats` — **keep new callers
    on them** rather than re-deriving, which is how the two mismatches got in. Guarded by
    `.claude/test-discovery.js`.
  · **Three new progress fields feed them** (in `defaultState` + `PROGRESS_FIELDS`, so old saves back-fill
    and a friend's shows too): **`glossSeen`** and **`placesSeen`** (key → first-seen timestamp, written by
    `markSeen` from `openGlossWin` and `showCountryPopupName`) and **`gameLog`** (key → `{plays, wins}`,
    written by `markGamePlayed`). These exist because **a popup and an Atlas panel leave no other trace** —
    nothing in the state records that they were ever opened, so the reading is invisible unless written
    down as it happens. `markSeen` no-ops (and so skips `save()`) on a key already known, and prunes
    oldest-first at **`SEEN_CAP` (6000)**. Deck
    glossary keys are **not** recorded: the terms-opened figure is measured against the curated glossary,
    and a stranger's deck would let it pass 100%. Both registers start the day they were added, so an
    existing reader's count begins at zero — said plainly here rather than on the meter, which was
    carrying a sentence about it until it was removed on request.
    **`SEEN_CAP` must stay above the SHIPPED universe of both registers** and is no longer a free
    parameter: these counts are now shown to the reader as progress towards completion, so a prune would
    make a count go backwards and re-flag a place as newly discovered. Measured: 401 glossary terms and
    **1,211 distinct clickable place names** (258 present-day + 1,194 across the 13 eras) — already 80% of
    the old 1500 cap, and **every new geo era adds territory names**. Fully seen, `placesSeen` is ~34 KB of
    the progress blob, so the headroom is nearly free. `.claude/test-discovery.js` asserts the clearance
    against the real data files; **if it fires, raise the cap — don't trim the data.**
  · **Discovery marks — telling a read term/place from an unread one.** `markSeen` **returns `true` only
    on first sight**, and that return is the entire signal. Both call sites (`openGlossWin`,
    `showCountryPopupName`) mark on the way IN, above everything that renders, so **anything asking "is
    this new?" at render time is always told no** — capture the return at the top, as they now do.
    · **The UNDISCOVERED term is the marked one.** A glossary link not yet opened carries **`data-new`**
      (set by `markTtipNew`, called from `setupTooltips` — the one choke point every `.ttip` render path
      already goes through, hand-authored and auto-linked alike), and `.ttip[data-new]` paints it in
      **`--ochre`, the same gold as the blank in a card's question**, so an unread term reads as something
      waiting to be filled in. **A term already read carries no attribute and renders exactly as every
      glossary link always has** — the familiar state is untouched, because the mark is the invitation,
      not a record of what is finished. (It was briefly the other way round — read terms dimmed — and was
      changed on request; don't reintroduce that.) It writes an explicit `data-new` rather than styling
      `:not([data-seen])` **because deck terms are in neither register** and would otherwise sit gold and
      undiscoverable forever. `.ttip[data-new]:hover` keeps the gold — jumping to the indigo hover would
      read as the term changing state before it was opened — and sits **after** the base `:hover` rules
      (equal specificity → source order). `refreshTtipNew(key)` re-marks every matching link on the page
      the moment a popup opens, so the prose behind it loses its gold at once, not on the next render.
    · The **first** opening also shows a gold chip (`discChipHTML` → `.disc-chip`): "New term! 41 / 401"
      in the gloss popup's bar, "New place! 7 / 258" in the Atlas panel (`#cpNew`), with a **splash** of
      two expanding rings (`discRing` / `discRingNight`, staggered onto `::after`) and a **`sfx("discover")`
      chime**. The rings are **box-shadow spread, never a scaled pseudo-element**: the chip sits inside
      `.gloss-win` (`overflow:hidden`) and `.cp-cols` (`overflow-y:auto`), where a transform would be
      clipped by the one and could add a scrollbar to the other. Both animations **end fully transparent**,
      so the reduced-motion killswitch — which lands animations on their END state — leaves no ring behind.
      The Atlas panel element is REUSED, so it must be cleared on every non-first open. A historical
      territory gets the label with **no ratio** — it is not part of any set with an honest total. The
      figure carries `notranslate`. **The chime is suppressed in the Find-it game** (`if (!GAME)`):
      `gameTap`/`gameReveal` have just played their own `good`/`bad`, and a bright discovery chime over
      `bad` would congratulate a reader for a wrong answer. The chip still shows — the sound was the only
      part that contradicted the game.
      The `!` is part of the translated string (Spanish opens with `¡`, CJK uses the full-width `！`), so
      the exclamation-less keys were retired from all nine language files when it was added.
    · Four achievements ride on the same counts (`terms25` / `terms100` / `places50` / `placesAll`, fed by
      `progStats`'s `terms` / `countries` / `countryTotal`), and `checkAchievements()` is called from both
      first-sight branches. `countries` is 0 until `world.js` loads, which only ever DELAYS a badge —
      `checkAchievements` adds and never revokes.
- **Deep time (years before the present).** A card's sort year is a plain signed number, so a prehistory
  card is just a very negative one (`-3300000` = 3.3 Mya). Three pieces carry that: **`cardYears(c)`** reads
  `answerDate` and now understands `"2.6 million years ago"`, `"3.3 to 2.6 million years ago"`,
  `"780,000 years ago"`, `kya`/`Mya`/`Gya`, **`BP`** and the RANGE forms of both (`"4.2 – 2 Mya"`,
  `"115,000 – 11,700 BP"` — the two the date line is written in since Aug 2026, where the unit is written
  once and carries leftwards), consuming each match so the BCE/CE rules can't re-read its
  digits (before this the prehistory deck sorted on the *discovery* years in the prose — `1925`, `2011` —
  because `\b(1\d{3}|20\d{2})\b` was the only rule that matched); the BCE rules also accept comma grouping
  now, or `"around 10,000 BCE"` parsed as the year 0. **`yearLabel(y)`** is the single formatter — `Gya` /
  `Mya` / `kya` above 10,000 years, `BCE`/`CE` below — used by `chronoLabel` and `fmtYearSpan`.
  **`parseChronoYear`** (the editor's chronology field) accepts everything `yearLabel` emits, so the field
  **round-trips**; keep that true if you touch either. In a range like `"3.3 to 2.6 million years ago"` the
  unit carries leftwards only when the first number is small and ungrouped — `"700,000 and 1.5 million
  years ago"` is not two millions.
- **CARDS CARRY CATEGORISING TAGS** (`card.tags`, Aug 2026, on request) — the card-side sibling of the glossary's
  `GLOSSARY_TAGS`, in the SAME vocabulary: tag 1 is the KIND (`era`, `hominin`, `place`, `industry`, `object`,
  `practice`, `concept`, `fossil`, `culture`, `event`, `people`, `person`, `animal`, `building`, `theory`), then
  the subject areas (`archaeology`, `palaeontology`, `geology`, `science`, `history`, `prehistory`, `evolution`,
  `genetics`, `technology`, `art`, `geography`, `nature`, `climate`, `migration`), then the specifics — a
  country, a region, a period. **Every shipped card is tagged.** Written by
  `node .claude/add-card-tags.js <batch.json>` (3–8 tags, lowercase, and it warns about a tag no other card
  shares — one that can never group anything); carried by `serializeCardData` beside `sources`.
  What they are FOR is **Multiple Choice**: `cardKinship(a, b)` counts the tags two cards share, weighting the
  first heavily (the kind is worth four subject areas) and capping the score when the kinds differ, and
  `buildChallengeQuestions` offers the three closest cards as the wrong answers. Before this the distractors
  were three cards of the same rough `answerType`, which on a prehistory deck put nearly everything in one
  bucket — a stone industry answered against a cave, an ice age and a fossil, where the odd one out was the
  right one. Now the Mousterian is answered against the Oldowan, the Acheulean and the Aurignacian.
  `answerType` survives as the fallback for a card with no tags (a community deck's).
- **Card fields (13):** `id, num, category, question` (HTML cloze with blanks), `answer`,
  `answerDate` (HTML), `traditional, hanzi, pinyin, translations` (HTML), `abstract` (rich HTML
  card background; may carry `ttip` glossary links, but newly generated cards omit them),
  `citation, answerText`. (The legacy `citation` string is **not** the footnote system — see the next bullet;
  it predates it, is not in the editor, and is empty on every current card.)
- **Source footnotes (July 2026)** — the `SOURCE FOOTNOTES` block in app.js, just above `buildBack`. Three surfaces
  say things about the past — a card's background, a glossary description, an Atlas place panel — and each can now
  name the scholarship behind them. Each carries a **`sources` list of Chicago note-form citations** (card:
  `card.sources`; term: `window.GLOSSARY_SOURCES[slug]` or a deck term's `entry.sources`; place:
  `country-sources.js`), rendered as a **numbered fold at the foot of the surface**, `sourcesHTML()` /
  `sourceListHTML()` for the Atlas panel, which owns its own `.cp-sec` fold.
  · **Prose points INTO the list with an EMPTY marker** — `<sup class="fn" data-fn="2"></sup>`. **The digit is
    written by `wireFootnotes()`, never by the author**, so re-ordering a source list can never leave a stale number
    sitting in a sentence — the one failure mode of hand-numbered footnotes. A bare `<sup class="fn"></sup>` takes
    the next number in reading order. A marker whose number has **no entry behind it is REMOVED**, not shown: a dead
    superscript claims a citation the reader cannot check, which is worse than no marker.
    **If that pass never runs the marker still prints its number**: `sup.fn:empty::before{content:attr(data-fn)}`
    (once `wireFootnotes` has written the digit the marker is no longer `:empty`, so the two can't both print).
    A phone once showed a whole card of blank gaps mid-sentence over a fold that would not open, which is what
    an unwired surface looks like — and it looks like nothing, so nobody reports it as a wiring failure.
  · **…and the ENTRY points back at the prose** (`srcNumHTML` / `jumpToMarker` / `markerForNumber` / `.src-n` /
    `.src-back`, Aug 2026, on request). The jump down had worked since the apparatus shipped and the return had
    no way in at all, because the entry's number was a **`::marker`** — which takes no `tabindex`, carries no
    accessible name and swallows no click of its own. So `list-style` is off and the number is an ELEMENT that
    both producers write (`sourceListHTML` and the book's `bookNotesHTML`), with the hanging indent coming from
    a flex row rather than each variant's own padding arithmetic.
    **Only a number some marker actually points at becomes a control.** `wireFootnotes` is the one pass that can
    see both ends — it has just numbered the markers and dropped the over-range ones — so it collects the numbers
    that survived and promotes those entries, leaving an uncited one a plain number. That is the dead-header
    lesson one level along: a surface that never gets the pass shows **no control** rather than a dead one, which
    is exactly the Atlas panel, whose prose carries no markers and which never calls `wireFootnotes`.
    **It returns to the marker the reader LEFT FROM**, recorded on the entry by `jumpToFootnote` as `_fnFrom`:
    a note may be cited several times over — Seneca's letter 114 cites one note four times — and coming back to
    the first citation when the reader jumped from the fourth lands them in the wrong sentence. Falling back to
    the first is the only other honest answer, and `markerForNumber` climbs the way `noteForNode` does, stopping
    at `<body>`, so a book's notes can never send the reader into a gloss popup open over them. Both ends reuse
    `scrollNoteIntoView` (it clears the same furniture either way) and the same `.src-flash`, so the reader is
    told which one at both ends. Guarded by `test-sources.js` and `test-library.js`.
  · **The fold header and the markers are DELEGATED** (one capture-phase document listener each for click and
    Enter/Space, beside `wireFootnotes`), never wired per render — the `.card-img` pattern. Everything a click
    needs is derivable from the DOM at click time, and a per-render listener is one render path away from a
    header that looks like a control and isn't. **Capture phase** so a surface that stops propagation on its own
    clicks (a gloss popup) can't swallow it; `noteForNode` climbs to the nearest ancestor holding a `.src-note`
    and **stops at `<body>`**, so a marker whose own surface has no list finds nothing rather than jumping into
    whatever other panel is open. Don't re-add a per-element listener — it would fire alongside the delegated
    one and toggle the fold twice, i.e. not at all. `wireFootnotes` still does the numbering and the a11y
    attributes, with `wireSourceLinks` in a try/catch: the links are decoration over text this code didn't
    write, the numbering is the join between the prose and the list, and one must not be able to take the
    other down.
  · **A card's, the Atlas panel's and a BOOK's folds are OPEN by default; a GLOSS POPUP's is always SHUT.** On
    the big surfaces a citation the reader has to go looking for is one they will not check, and checking is the
    whole point of shipping the apparatus (July 2026, on request — they were collapsed before; the book's notes
    joined them Aug 2026, also on request). **A reader who
    shuts one there is remembered**: `S.settings.srcCollapsed` (in `defaultState`, so old saves back-fill; a
    device setting, not synced) is written by the **delegated header handler only** — a marker jump force-opens
    the fold for one look and deliberately does NOT change the preference. The Atlas section follows the same
    setting and additionally **hides outright when empty** (unlike its neighbours, which show a shut header): an
    empty "Description" header still tells the reader the panel has that part, but a "Sources" header over
    nothing reads as a claim to have cited something.
    **The gloss popup (`sourcesHTML`'s `opts.compact`) is the exception on both counts** (August 2026, on
    request): it renders `collapsed` unconditionally, ignoring `srcCollapsed` rather than sharing it, and the
    header handler **skips the write when the note carries `.src-compact`** — so expanding one term's sources
    is not remembered, and the next popup opens shut again. A popup is a glance at a word met mid-sentence and
    the fold is a third of its height; expanding one says something about that term, not about every term
    opened afterwards. A marker jump still force-opens it, there as everywhere. Guarded by `test-sources.js`.
  · **A MARKER JUMP MUST CLEAR THE FURNITURE, AND MUST MEASURE A FOLD THAT IS ALREADY OPEN**
    (`openFootnote` / `scrollNoteIntoView`, Aug 2026, on a bug report: on a phone the jump "doesn't quite go
    far enough to see the actual note"). Two faults compounded, and each is invisible to a test that only
    asks whether the note is in the viewport.
    · `scrollIntoView({block:"nearest"})` brings the item's bottom flush with the **scrollport's**, and the
      scrollport is the whole viewport — which on a phone has a 58px tab bar fixed over the foot of it. So
      the note arrived UNDERNEATH the bar: in view by the browser's reckoning, unreadable by the reader's.
      Measured on a 390×844 phone, the note landed at 807–844 with the bar starting at 786.
    · `.src-collapse` opens over .38s (`grid-template-rows` 0fr → 1fr), and the scroll was issued in the
      same tick — so it was computed against a list still zero pixels tall and stopped short by however
      tall the list was about to become. Same phone, fold shut: the note landed at **850–887, entirely
      below an 844px viewport**. Worst exactly where it was noticed, at the foot of a long chapter, where
      the notes are the last thing in the document and the page cannot scroll that far until they exist.
    The fold is now expanded WITHOUT its animation before anything is measured (animating would only mean
    scrolling to a moving target; the scroll IS the movement asked for), and `scrollNoteIntoView` reads the
    bars off the custom properties that position them (`--bar-h`, `--tabbar-h` — both 0 on the side of the
    breakpoint where they do not exist, so this cannot drift out of step with them). Already clear of both →
    **nothing moves**, since a note the reader can see should not jolt; otherwise it is placed in the middle
    of what is genuinely visible, except when the note is taller than that band, where it is aligned to its
    top — centring a long note lands the reader mid-sentence. A note inside its OWN scroller (a gloss popup's
    body, the Atlas panel's columns — `noteScrollParent`) has no fixed furniture over it and keeps
    `scrollIntoView`. Guarded by `test-library.js`, which asserts against the tab bar's own rendered box
    rather than a hard-coded 58, from an open fold and from a shut one.
  · **A citation ends in its URL, written as plain text**, and `linkifySrcItem` turns it into an anchor —
    **inside `sourceListHTML`, so the list is serialized already wired** rather than fixed up by a pass over the
    rendered page. That was the second half of the same lesson the fold header learned: a list that depends on a
    caller remembering `wireSourceLinks` will, on some render path, reach a reader as a bare `[Open access]` and a
    URL that is not a link — which looks like nothing went wrong, so it gets reported as "the labels reverted",
    not as a wiring failure (it was, in July 2026). It still walks TEXT NODES, so a URL already inside an
    attribute is untouchable, and `wireSourceLinks` stays as an idempotent safety net for markup that arrives
    some other way: the URL pass skips text inside an anchor, and the chip pattern needs brackets that are gone
    once a chip exists. Building the anchor here rather than asking an author for `<a href="…">…</a>` is what
    keeps the href and the visible text from ever disagreeing — a mismatched anchor would quietly send a reader
    somewhere the citation does not name. Links open in a new tab, or following one would end the study session.
  · **A citation also ends in an access label** — `[Open access]` or `[Paywalled]`, stored as plain bracketed
    text after the final period, and lifted into a **chip** by the same `linkifySrcItem` pass
    (`SRC_ACCESS_RX`, `.src-access-open` in `--good` green / `.src-access-pay` in `--ochre` amber, both theme
    tokens so the chip follows every theme and both modes). A paywall is a fact about the link, **not an error,
    so it must not be styled as a warning** — amber, never red. The URL pattern already excludes `[` and stops before
    the closing period, so the two passes can't collide; `replaceInSrcText` is the shared text-node walk.
    Unlike the citation itself the four chip strings ARE localised, through **`t()` at build time** rather
    than `localizeTree`, which can't reach inside `.src-list`'s `notranslate`. **Write the label in English
    in the data.** A citation with no label renders exactly as before — most don't have one yet.
    The rule the label enforces: a **paywalled work is citable only when it is the landmark defining paper**
    for the claim, and the majority of any card's list must be open (`docs/citation-plan.md`, "The bar").
  · **Citations are NOT translated**, and for the reason image credits are not — a citation names an edition that
    exists in one language, and rendering "Cambridge University Press" in nine is fabrication, not translation. Hence
    `notranslate` on every list, and hence `sources` lives on the base card and NOT in the `i18n` blocks. Only the
    **"Sources" label**, its aria-label and the `^Source (\d+)$` rule are localised (all 9 languages).
  · **Deltas + serialization**: `setCardSourcesEdit` (a `sources` delta with a null tombstone, exactly like
    `questions`/`image`), `setGlossSourcesEdit` (`ADMIN_EDITS.glossarySources`, `PRISTINE_GLOSS_SOURCES`,
    `glossaryResetToPristine` / `revertGloss` / `deleteGloss`); baked by `serializeCardData` / `serializeGlossary`.
    Community decks get `uCardSetSources` / `uGlossSet(…, "sources", …)`, sanitized on ingest by `uCardSanitize` /
    `uGlossSanitize` (rich HTML — a citation italicises a title) and carried through export/publish/install.
  · **Editing**: the shared card surface's `sourcesPanel` (so the admin editor's EN view AND the Studio), and a
    `sources` textarea in the curated glossary editor's EN view + the Studio's term form. **One citation per LINE**,
    never comma-separated as tags and aliases are — a Chicago note is full of commas.
    On the CARD surface the panel is no longer a textarea (Aug 2026, on request): each citation is its own
    **rich contenteditable row** (`#cesSrcList` → `.ces-srcitem[data-rich]`, numbered by an `<ol>` exactly as the
    card numbers them), so a Chicago note — which is mostly italicised title — is written **as it reads** rather
    than as `<i>…</i>` in a text box, and the ribbon's italic button applies to it. `srcItems` is the working
    list, like the question pool: blanks survive editing and `normSources` drops them on the way to the store.
    Everything is DELEGATED on the list (input / keydown / paste / the row's ×) because the rows are rebuilt
    whenever one is added or removed, and **`wireRichEditor` now picks up the active field by a delegated
    `focusin` on the host** rather than a listener per element — without that, every row created after it ran
    would be unreachable from the ribbon. The URL and the `[Open access]` / `[Paywalled]` label deliberately stay
    PLAIN TEXT in the row: the card builds the link and the chip at render time, and showing them already
    converted would leave nothing to edit.
  · **The ribbon's `+Source` button** (`#rtFootnote`, added by `rtRibbonHtml({footnote:true})`, so only where a
    sources list exists — a glossary description has none). One press does both halves of a footnote: an EMPTY
    `<sup class="fn" data-fn="N">` at the caret in the background (or at its end if the caret is elsewhere) and a
    blank citation row waiting below, focused. The `N` is a starting value only — the card draws the real number
    from the list, which is the whole point of writing the marker empty. It never stacks two blank rows: a second
    press lands in the one already waiting. Shown only while the background is the active field (`.rt-fn` follows
    the ribbon's existing `.on-bg` class, like `.rt-link`).
  · **The ribbon is sticky, and which scrollport it pins to depends on the surface.** The desktop `.admin-editor`
    pane scrolls inside itself (`top:0`); the Studio and the phone scroll the whole PAGE, where it has to clear
    the sticky top bar (`top:calc(var(--bar-h) + 6px)`, z-index 30 — under the bar's 50). **On ≤860px
    `.admin-editor` is given `overflow:visible`**: it stops scrolling inside itself there, and a scroll container
    that never scrolls is a scrollport its sticky child can never leave, which is why the ribbon used to scroll
    away on a phone.
  · **How many, and the red mark** (July 2026, on request). **`SRC_TARGET` (5) is the editorial bar** a curated
    card is held to — a target the Edit page reports against, never a validity rule, and community decks are not
    held to it. The card list paints each row's id line with a coverage chip (`cardSourceState` → `.acr-src`):
    **nothing** at 5+, **amber `3/5`** under the bar, **red `0/5`** under it *and* carrying `card.sourcesBlocked`
    — a string reason recording that a batch went looking and came back short. The amber/red distinction is the
    point: amber is a to-do, red is a finding. **A card earns red only when a batch concludes it**, written by
    `.claude/mark-sources-blocked.js` (which demands a reason saying what was searched) and retired
    automatically by `add-sources.js` the moment the card reaches 5. Flagging a card unsourceable before
    searching is the failure the apparatus exists to prevent, one level up — and batch 8b is the standing
    warning, having cited two cards a previous session had written off. The flag is `data.js`-level, carried by
    `serializeCardData` beside `sources`, and **never shown to a reader**: the fold shows the sources a card has.
    A "Fewest sources" sort and an "N under-cited, M blocked" tally in the list head let the pass be worked
    straight down the list. Deliberately NOT the same channel as the right-click `cardColor` mark (a left
    stripe): one is derived from the data, the other is an editor's private marker.
  · `sup` + `class="fn"` + `data-fn` are in the sanitizer allowlists, so a community deck can use markers too.
  · **The Atlas table still ships EMPTY; the glossary has begun.** `country-sources.js` has no entries at all.
    **`GLOSSARY_SOURCES` carries ALL 401 terms** (batches G1–G11, P1–P7, C0–C12, D1–D3, N1–N10, 2026-08-01/03 — the genus, species, specimen,
    stone-industry, three-age, periodisation, geological-time, type-site, way-of-life and discipline terms, plus the
    Indigenous-peoples group, its odds and ends, the poles / desert / ocean / two historiographic names, the six
    continents with `Sicily`, `Equator` and the two hemispheres — which completes Phase 1 — and the first six
    US presidents, Jackson to Polk, Taylor to Andrew Johnson, Grant to McKinley, Theodore Roosevelt to
    Hoover, Franklin D. Roosevelt to Nixon, and Ford to Biden — **all 45** — plus C0's six pilot
    countries, C1–C2's twenty-five EU member states, C3's four non-EU European states and C4's seven
    Commonwealth states in Asia, C5's four more, C6's thirteen African Commonwealth states, C7's eleven — the rest of Commonwealth Africa plus the first terms carried by the Office of the Historian's recognition guide — C8's fourteen non-Commonwealth African states and C9's last fourteen, which COMPLETE AFRICA at 56 of 56, C10's thirteen, which COMPLETE OCEANIA, C11's twenty across North and Central America and the Caribbean, C12's twelve in South America, D1's nineteen, which clear the European deferral list, D2's thirty-one, which clear the Asian one, and D3's last four), against
    a bar of **`GLOSS_SRC_TARGET` (2)**, which is lower than a card's five because a description is three sentences
    where an abstract is ten; `docs/glossary-citation-plan.md` is the plan for the rest and
    `node .claude/gloss-source-audit.js` says where it stands. The UI, the deltas and the pipeline are in place;
    the rest is a content job (see "Citing the existing content" below). Guarded by `.claude/test-sources.js`
    (74 assertions).
    **Batches 0–22 shipped 2026-07-31/08-01**: **all 109 prehistory cards now carry sources.** **Against the
    5-source bar, ALL 109 are there** — batches 0–26 are complete, and
    the audit that says which is `node .claude/source-audit.js`. **Every list is majority-open**, `wh-045`
    Jebel Irhoud having been taken to six sources in batch 24 to clear the last exception. See `docs/citation-plan.md` — its Pilot log records how the
    definitional cards were solved, its Batch 1 log the factual errors the exercise turns up (21 so far) and
    the gotcha that a matching sentence COUNT across languages does not prove a matching sentence MAPPING, and
    its Batch 2 log the finding that reshapes the rest of the pass: **the batches are grouped by subject, and
    subject does not predict whether the sources are reachable.** Cards built on a published *result* — a
    genome, a date, a measurement, a model — go through easily; cards built on a discovery history or a naming
    history turn on founding announcements and historiography that are closed with no open deposit, and 14
    such cards are now deferred. Re-cut the remaining batches by source type before working them.
    Two working rules from Batch 3: **an index saying a paper is closed is not evidence that it is** — fetch
    it before labelling it, in both directions (Europe PMC marks Wood et al. 2013 closed and its PMC full text
    is free; the Auckland deposit of Sutikna et al. 2016 is indexed open and sits behind a JS challenge) — and
    **a card reporting an argument in progress has a shelf life**, so expect corrections caused by time rather
    than carelessness (`wh-037`'s *naledi* burial papers reached Versions of Record in 2025 with mixed
    verdicts, where the card said the reviewers were unanimously against and the papers still in revision).
    From Batch 8: **a correction is not finished when the abstract is fixed — check the QUESTION POOL too.**
    Each card carries three phrasings that repeat the abstract's figures exactly as the date line does, and
    `wh-075`'s third phrasing restated the very error being corrected, which would have shipped as the cloze
    question above a corrected background. Patch the extras with `add-questions.js` and the main `question`
    with `fix-field.js` (it reaches any string field, so `question` yes, the `questions` array no).
    From Batch 8b, and it reversed a deferral: **search the holding institution before concluding a card
    cannot be cited.** `wh-067`/`wh-068` were written off when every Swabian Jura paper proved closed, then
    went through on museum and government records — Museum Ulm's catalogue entry for the Lion Man (with its
    inventory number, its measurements and its sex), the Blaubeuren state museum's object record for the
    Hohle Fels flute, and the World Heritage property's official portal, which is openable where
    `whc.unesco.org` is not. For a card **about an object**, the museum record is often the better source
    anyway: it is kept by the people holding the thing and it states the measurements a journal article
    assumed its readers knew. It also carries what the literature quietly updated — the Lion Man's sex is
    settled in the catalogue and was still "disputed" on the card.
    From Batch 13, the limit of that method: **it works where a museum runs a CATALOGUE, and a catalogue is
    not the same thing as a website.** The Georgian National Museum, Naturalis, the Fundación Atapuerca and
    the Moravian Museum all have sites and none publishes per-object records, so Dmanisi, Java Man,
    Atapuerca and Dolní Věstonice were not unblocked the way the Swabian cards were. Check whether a
    catalogue exists before planning a batch around one.
    From Batch 14, the first batch cut by SOURCE TYPE rather than subject, as Batch 2 said the rest should
    be: **a supervolcano, an island species and two Levantine caves went through in one sitting because
    every claim on them is a published RESULT** — a modelled climate, a dated bone bed, a measured genome, a
    thermoluminescence age. Results are deposited, indexed and openable; discovery histories are not. Two
    corollaries worth carrying. **A figure can be right when written and wrong now**: `wh-042` gave Toba's
    2,800 km³ (Rose & Chesner) while the paper its own last sentence rests on opens with ∼5,300 km³, and it
    had Ambrose proposing a six-year volcanic winter he never proposed — that is Rampino & Self's, repeated
    into him by retellings, and his abstract gives a thousand years of cold instead. **Read the abstract of
    the paywalled landmark before paraphrasing it**; PubMed carries it even where the text is closed.
    And **budget for the length rule**: a citation pass makes prose longer, so a card already near the
    330-word ceiling (`wh-049` sat at 329) needs several trimming passes across all ten languages before it
    lands back inside it.
    From Batch 15, two rules that between them reopened a set the plan had written off. **When the
    discovery paper is closed, look for the REVIEW that restates it** — the southern African Middle Stone
    Age was deferred because Henshilwood and Marean are closed, which is true of the founding
    announcements and false of the syntheses built on them; one open review carried six of `wh-057`'s ten
    sentences. And **fetch the FILE, not the landing page**: `hal.science/hal-XXXXXX` sits behind an
    Anubis wall while `hal.science/hal-XXXXXX/document` serves the PDF, which reversed a Batch 14 call —
    Détroit et al. 2019 shipped as [Paywalled] and is open. A wrong access label is a real error, not a
    cosmetic one: it tells a reader not to bother following a link they could have followed.
    From Batch 16: **when a card narrates an ARGUMENT, look for the review that narrates it, and cite the
    originals alongside rather than instead.** `wh-033`'s middle five sentences are the Bordes–Binford
    debate and Dibble's reduction thesis, none of whose primary statements is open; one 2024 review states
    all three in an openable page, and Bordes 1961 and Binford & Binford 1966 sit beside it as the
    paywalled landmarks they are. Also **narrow a naming history to what a source actually says** — "the
    1860s and 1870s" for Levallois-Perret became "the 19th century", which is as precise as the open
    literature gets.
    From Batch 18: **when a card is about an object, an institution or an act of state, look for the body
    responsible before looking for a paper.** Three of its four cards were carried by sources that are not
    journal articles — a Dutch state commission's 2025 advice on the Dubois collection, the ministry's record
    of the handover, and the Smithsonian's Human Origins fossil and species records — none of which has an
    equivalent in the literature. Its other finding is a limit on the batch's own premise: **a founding
    monograph answers the questions its author asked**, so Dubois 1894 and Weidenreich 1943 settle the
    discovery sequences precisely and carry almost nothing else, and five claims across the four cards were
    dropped outright rather than sourced — including Binford & Ho 1985, which could not be opened at all, so
    the card no longer names it.
    From Batch 19: **a museum's catalogue IS the open review that restates the closed founding paper.** Batch
    15's rule — when the discovery paper is shut, find the review — worked on exactly one of its five cards
    (Kimbel & Villmoare 2016 carried the whole of `wh-016`'s second half). What carried the other four was
    batch 18's rule generalised: seven of the batch's 21 works are Smithsonian Human Origins records, and
    between them they supply the dates, body sizes, discoverers, discovery years, type-specimen status and
    cranial capacities that Dart 1925, Leakey/Tobias/Napier 1964 and Brown et al. 1985 hold behind paywalls.
    A catalogue is open **by policy** rather than by luck. Its other finding: **a discovery card is not the
    same as a card that can only be sourced from the discovery paper** — `wh-046` Herto, which the plan
    expected to come back short, reached the bar because the find has been re-examined three times in open
    venues since 2003, and every re-examination restates it before disputing it.
    From Batch 20, the move that reopened a set batch 5 and batch 15 had both walked away from:
    **when the paper that announced a find is shut, look for the paper that CITES it as a comparison.**
    This is not batch 15's rule — a review restates a field and may not exist, whereas a comparison
    restates one rival site and is much easier to find, because you can search the site's own NAME inside
    the open-access corpus. Every famous Blombos find came in that way: Bouzouggar et al. 2007 give the 41
    pierced *Nassarius* shells, their ≈75,000-year age, the two engraved ochres and the 400 Still Bay
    points because they are comparing Blombos with Taforalt, and Rosso et al. 2016 give the 100 ka ochre
    toolkits because they are comparing them with Porc-Epic. Its second finding is simpler and was missed
    twice: **check who is excavating a site NOW, not only who published the landmark.** Klasies River had
    been deferred on Marean's closed papers while Sarah Wurz's current team publishes in *Frontiers*, which
    is open by policy. Third, **old conference proceedings are often the most openable thing in a naming
    history** — the whole 440-page 1957 volume of the 1955 Pan-African Congress is OCR'd on the Internet
    Archive, and it corrected two claims at once: the term is Goodwin's alone from 1928 (1929 is the joint
    volume), and the Congress did not endorse the three-stage scheme but recommended a five-part frame,
    over objections. And the sibling check the plan puts on definitional cards paid twice: `wh-031` had a
    Still Bay date no other card used and an end-date 10,000 years off three of its own siblings.
    From Batch 21, a correction to batch 8b's rule rather than a new one: **the institution to ask is not
    always a museum, and its record is not always a catalogue.** Lascaux and Atapuerca — two of the three
    cards the plan called the hardest — were carried almost entirely by a **government ministry's scholarly
    portal** and a **foundation's year-by-year dig timeline**, eleven citations between them, covering the
    discovery dates, the sector count, the dating, the World Heritage years and even a fossil's nickname.
    Batch 13's "a website is not a catalogue" has a converse worth holding onto. Two hard findings go with
    it. **The `/document` trick is dead on hal.science and journals.openedition.org**, which now serve an
    Anubis proof-of-work wall on the file path as well as the landing page — Ducasse & Langlais 2019 is
    genuinely open and unreadable from here, so it is NOT cited and NOT labelled paywalled, because a bot
    wall is a different fact. And **the uncalibrated-radiocarbon error is the pass's most common find**:
    Lascaux's "17,000 years ago" and Dolní Věstonice's "29,000 to 25,000" are both raw BP read as calendar
    years (21,500–21,000 and 31,270–29,260 cal BP respectively). When a prehistory card carries a round age
    in the twenties or thirties of thousands, check BP against cal BP before anything else.
    From Batch 22, on the pair the plan expected to end red and which did not: **before searching for a
    definitional card, read the register.** Batch 12's finding at full strength — Marchal 2002, Walker 2012,
    Walker 2018 and Walanus & Nalepka 2010 were already deposited for `wh-102`/`wh-105`/`wh-106` and between
    them carry the entire chronozone framework. Its second finding: **when a regional scheme is named for one
    country's bogs, check the neighbours' journals** — the plan looked to Scandinavia, and the Preboreal
    vegetation is open in the *Netherlands Journal of Geosciences*, one country west. Third, a new route to a
    closed paper: **`api.crossref.org/works/<doi>` serves publisher-deposited abstracts**, and returned Groß
    et al. 2019 on Duvensee where PubMed has no record at all. And the arithmetic rule these two produced:
    **when a card gives an age both in ¹⁴C years and in "years ago", check that the second is the calibration
    of the first** — the Boreal's stated end of "8,000 years ago" was neither the calibration of 8,000 ¹⁴C BP
    (that is ~8,950 cal BP) nor consistent with `wh-105`, which already had the Atlantic starting at 7000 BC.
    From Batch 12: **the register pays for itself late.** The three framework cards (`wh-001`, `wh-002`,
    `wh-004`) took 25 citation slots and needed **no new sources at all** — every claim a definitional card
    makes is a claim some other card already makes, so the whole job was mapping sentences to entries
    already in `.claude/sources-register.md`. It also produced the first corrections of a new kind: the
    cards were not wrong against the literature but **against each other** (`wh-001` and `wh-004` ended the
    Palaeolithic at 12,000 years ago where five other cards and `wh-004`'s own date line said 11,700). Run
    the sibling-consistency check FIRST on any card that summarises a whole period.
    From Batch 23, the first TOP-UP batch, and its lesson governs the three that follow: **a top-up is
    where the errors are.** A first pass only has to stand behind the sentences it marked; the bare ones
    are exactly where an unchecked claim survives, and a top-up goes looking at them. Four of its ten
    cards changed prose and every wrong figure sat in an unmarked sentence — `wh-022`'s Acheulean end
    date (a 170–130 ka range no source in front of the card carried, against de la Torre's 0.125 Myr),
    `wh-023`'s "June 1797" and jawbone (both in Frere's own letter, which is paywalled on Cambridge
    Core with no abstract), `wh-008`'s antler pressure-flaker (the study that demonstrates the technique
    used a pointed BONE compressor) and `wh-098`'s 1.9 Ma for Wrangham, which Gowlett puts at 1.7. That
    last card also carried the pass's first **wrong marker**: its Wrangham sentence pointed at Berna et
    al. 2012, the Wonderwerk fire microstratigraphy, which says nothing about cooking — **a marker
    pointing at the wrong work is worse than no marker**, and only a top-up would ever have looked.
    Three tools findings go with it. **`https://www.ebi.ac.uk/europepmc/webservices/rest/PMC<id>/fullTextXML`
    is the way past the PMC captcha** that appeared partway through this batch; resolve the PMCID with the
    `search?query=DOI:"…"` endpoint rather than guessing it. **`split-abstract.js` could not see a dozen
    Chinese abstracts at all**: its CJK clause demanded that `。` carry no following space, so the twelve
    zh and four ja abstracts written with one came back as a SINGLE sentence per block — silently, which
    would have scattered markers anywhere. `\s?` on the CJK terminator took the deck's 5+5 failures from
    48 to 22; **the remaining 22 are real and not this batch's** — `wh-039` and `wh-063` split 6+5 and 7+5
    **in English** — and batch 24 should clear them before marking any of those cards. And
    **`check-style.js` was applying the house rules to `sources`**, reporting a real paper's title as a
    century-word violation; in `--fix` mode it would have renamed the paper. Citations are now masked out
    before any rule runs. Where a language's sentence split diverges from English (zh on `wh-022`), **repair
    the split rather than routing round it with a per-language marker map** — `add-sources.js` catches the
    divergence as a marker-count mismatch, and rejoining the sentences restores parity claim for claim.
    From Batch 24: **where a batch's cards share a DEBATE rather than a site, one review can carry
    most of it.** Two open reviews — Harvati & Reyes-Centeno 2022 on the Middle Pleistocene and
    Scerri et al. 2018 on whether *H. sapiens* has one birthplace — filled eleven of its sixteen
    slots across four and three cards respectively. Batch 2 found that subject does not predict
    reachability; this is the exception that sharpens it, since an argument attracts reviews and
    reviews are what open venues publish. It also produced the pass's **first clean re-check**:
    `wh-047` and `wh-048` were expected to have drifted and had not (Karmin's Y-MRCA "254 (95% CI
    192–307) kya", Rito's mtDNA ancestor "~180 ka"), and it retired the last not-majority-open list
    by giving `wh-045` two open sources instead of one. Two tooling notes: **PMC's browser check now
    covers the article HTML as well as search**, so the Europe PMC `fullTextXML` route from batch 23
    is the only one left here, and it 404s for author manuscripts with no deposited text; and
    **`isOpenAccess: N` in a Europe PMC record means not OA-LICENSED, not unreadable** — check for
    full text before writing a work off.
    Batch 24 also cleared the **5+5 residue** batch 23 left, and the three causes are worth keeping:
    the splitter held an initial only when another followed, so the LAST of a run was exposed and
    "R. P. Soejono" / "Frank H. H. Roberts Jr." each split a sentence in eight languages (it now
    holds whole runs in Latin, Cyrillic and Arabic, plus `Jr.`/`Dr.`/`St.`); **a sentence ending on
    the era abbreviation** has no terminator left and swallows the next one, which `wh-063` did in
    six languages at once — an AUTHORING rule, not a tooling gap, and the splitter's header has
    always said so; and nine translations had turned one English sentence into two. **The deck now
    splits 5+5 in all ten languages with identical marker counts** — the state batches 25–26 can
    rely on, and worth re-asserting after any prose edit.
    From Batch 25, a route the pass had not used: **where a card describes a nineteenth-century
    idea, the idea's own author is often the openable source — because he is out of copyright.**
    Batch 23 found that a founding paper of 1800 can still be paywalled (Frere on Cambridge Core);
    Blytt's 1886 statement of his theory is the other case, OCR'd in full on the Internet Archive,
    and it settled two of `wh-106`'s sentences and **disproved a third**: the card had Blytt naming
    the Atlantic and the Boreal, and his own paper uses neither word as a phase name. Nothing
    openable settles who coined which of the five names — Sernander is not on the Internet Archive,
    no open history of the scheme exists in the palynology journals, and Walker et al. 2012's open
    deposit has 404'd — so that clause and its companion about Sernander were **withdrawn rather
    than re-sourced**. Treat a "who named it" clause as a claim needing its own source. Its other
    finding is the register's, again: **six of the batch's eleven slots needed no new reading at
    all**, which is what a well-kept register buys late in a pass. And a caution for batch 26: two
    correctly-recorded open entries could not be RE-read this time (the Marchal 2002 WHOI PDF uses
    an encoding the extractor cannot decode; Walker 2012's deposit has moved), so a top-up wanting
    to extend what an old entry supports may find it cannot, and should say so rather than guess.
    From Batch 26, which finished the pass at **109 of 109 with nothing blocked**: the plan's own
    advice held — five of its thirteen citations are heritage-agency records (the French culture
    ministry for Lascaux and Chauvet, the Blaubeuren museum, Cosquer Méditerranée, the Fundação Côa
    Parque) — but its finding is a correction to the pass's own method. **A correction does not
    travel between cards on its own.** Batch 21 stripped three Lascaux claims from `wh-086` (the
    17,000-year date, ~1,500 engravings, the five-metre bull) and `wh-083`, which mentions Lascaux
    in one sentence, still carried all three five batches later — in its abstract AND on its date
    line, in ten languages. **Grep the deck for the FIGURE, not just for the card it belongs to**,
    and sweep every language before a batch closes. Two smaller notes: the batch-22
    `api.crossref.org/works/<doi>` abstract route paid for the only paywalled work added across
    batches 23–26 (Villa et al. 2012, the landmark for where the LSA begins at Border Cave); and
    **an agency record can disagree with the paper a card follows** — the Chauvet portal dates the
    occupations to ~36,500 and 30–31,000 where Quiles et al. give 37,000–33,500 and 31,000–28,000,
    so the discrepancy is recorded in the register and the card keeps its Quiles marker rather than
    being silently re-dated.
- **Multiple question phrasings (July 2026):** a card may carry an optional **`questions` array of EXTRA
  phrasings** beyond `question` — **at most `CARD_MAX_QUESTIONS` (10) in all** (official Folio cards carry
  exactly 3; the headroom is for community decks to experiment). Every phrasing is a full standalone clue
  under the same rules (mid-sentence blank, ~28 words), each testing the concept from a different angle so
  students learn the concept rather than one sentence's shape. `cardQuestions(c)` returns the non-blank pool;
  **`cardWithQuestion(c, pickIdx?)`** returns a COPY with `question` set to one of them — **random per show**
  on the study page, **date-seeded** for the card of the day, **fixed per round** in Multiple Choice (so the
  results summary repeats what was asked). Translations carry their own pool (`i18n[lang].questions`), and
  `cardLocalized` **falls back to the single translated question when a language hasn't translated the
  extras** — never a translated question mixed with English extras. In the editors the question box gets
  **chevrons (‹ ›) that cycle the pool** plus a "1 / 3" counter and add/remove controls; edits write through
  `setQuestions` (curated: `setCardEdit` + `setCardQuestionsEdit`, a delta with a null tombstone like
  image/video; i18n: `setCardI18nEdit`; Studio: `uCardSetQuestions`). The HTML source box gives each phrasing
  its own `<!-- QUESTION -->` / `<!-- QUESTION 2 -->` … section. Extras ride through export/publish/install
  and are sanitized on ingest (`uCardSanitize`, capped at 9 extras). The admin card search matches every
  phrasing. Backfill existing cards with `.claude/add-questions.js` (see "Generating cards").
- **Card image (optional):** `card.image = { src, title, desc, credit, alt }` — rendered by `buildBack` as a **16:9
  frame** (`.card-img`, `cardImageHTML`) at the top of the Background section, above the prose (the section now
  renders when a card has an image even without an abstract). Clicking it opens the **fullscreen viewer**
  (`openImageViewer`: wheel zoom toward the cursor 1–8×, click toggles 1↔2.5×, drag pans when zoomed, Esc/×/backdrop
  closes, `closeImageViewer()` runs in `render()`), with title/description/source in a bottom caption bar (a URL
  source becomes a link). One **delegated** document click/keydown listener opens it from any `.card-img` (study,
  previews, editor) via the figure's `data-img-*` attributes — no per-render wiring.
  **`alt` is the text alternative, and it is a field of its own** (Aug 2026, on request: "add alt text for
  images, which can be added when editing/making cards"). Deliberately not a reuse of `title`: a title NAMES
  the picture for a reader who can already see it, where alt text has to DESCRIBE it to somebody who cannot,
  and folding the two together is the commonest way alt text ends up useless. `cardImageHTML` and the
  fullscreen viewer read `img.alt || img.title || "Card illustration"` — the generic string only where there
  is neither, since an image with no alternative at all is worse than a weak one. It rides in `MEDIA_FIELDS`,
  so the editor's one media panel, the source gate, the store and the clearing path all carry it with no
  special case; the row is hidden when the pasted URL is a VIDEO, which announces itself through its player.
  Carried through `uCardSanitize` / `uGlossSanitize`, and warned about (never refused) by `add-card.js` and
  `add-glossary.js` — most shipped images predate it.
  **A file that will not load is handled** (Aug 2026): there is deliberately no upload path, so every picture
  and clip anywhere in Folio is somebody else's URL and link rot is a certainty rather than an edge case.
  A delegated **capture-phase `error` listener** (`error` does not bubble) marks the figure `.media-dead`.
  A READER gets nothing — `display:none`, because a broken illustration is worse than none and there is
  nothing they can do about it — while an AUTHOR keeps the frame, labelled "This link doesn't load"
  (`.ces-img`/`.ces-vid`), being the one person who can fix it. The click and Enter handlers skip a dead
  figure so it can't open an empty viewer, a dead one inside a gloss popup hides the whole floated
  `.gloss-imgslot`, and the home page's Term-of-the-day plate (a bare `.term-img`, not a frame) is removed
  and gives the discovery row its 2:1 layout back. The editor's EN view has the
  four image fields (`data-imgfield` → `setCardImageEdit`), which — like i18n — deep-copies the object and stores it
  whole as an `image` delta (clearing every field stores a **null tombstone** that hides a shipped image);
  `serializeCardData` bakes `c.image` when it has a `src`, `revertCard` restores `p.image`. Image metadata is shared
  across languages (not in the i18n blocks).
- **Card video (optional):** `card.video = { src, title, desc, credit }` — the **same four fields and the same
  frame as the image** (`.card-img` plus a `.card-vid` modifier), rendered by `cardVideoHTML`.
  **ONE FRAME PER CARD: the image and the video are alternatives, never companions.** Every writer enforces
  it — `setCardImageEdit`/`setCardVideoEdit` (via `retireOtherCardMedia`), `uCardSetImage`/`uCardSetVideo`,
  the glossary pair (via `retireOtherGlossMedia`), and the deck-ingest sanitizers — and `buildBack`,
  `renderGlossImage`, `serializeCardData`, `serializeGlossary` and the publish payload all keep the rule as a
  backstop, **with the picture winning** so a hand-authored `data.js` carrying both renders as it always did.
  **`retireOtherCardMedia` asks `PRISTINE_CARDS`, not the live card**, when deciding whether to write a null
  tombstone: it runs on every keystroke, and by the second one the live field is already gone — reading it
  erased the tombstone the first keystroke wrote and the retired picture came back on the next reload.
  **Links only — there is deliberately no upload path**: the only place an
  uploaded file could live is inline as a data-URI, which for a curated card rides into `data.js` (eagerly
  downloaded by every visitor) and for a community deck into its published jsonb payload. Host it elsewhere,
  link it here. **`videoSource(src)`** is the single resolver → `{ kind: "youtube"|"vimeo"|"file", url }` or
  **null** for anything else, and null renders NOTHING (the editors show "Not a link Folio can play" rather
  than an empty box). YouTube (watch / youtu.be / embed / shorts / live, `?t=` carried over as `&start=`) and
  Vimeo become `<iframe>`s on **youtube-nocookie.com** / **player.vimeo.com**; a `.mp4/.m4v/.webm/.ogv/.ogg/.mov`
  URL becomes a `<video controls>`. **An iframe src is only ever built by `videoSource` from a matched video
  id — never from raw input**, which is what keeps a stranger's deck from framing an arbitrary page; the
  regexes are the security boundary, so don't loosen them to "anything that looks like an embed URL".
  The figure is **not** a `role="button"` like an image's (the player owns clicks inside it): the fullscreen
  viewer is reached by an explicit `.cv-expand` control, placed **top**-right because a `<video>`'s native
  control bar owns the bottom edge. `openImageViewer`/`openVideoViewer` both call **`openMediaViewer`**, which
  skips the zoom/pan wiring for video and just plays it big (`.iv-vid`). The delegated `.card-img` click
  listener returns early on a `.card-vid` unless the expand control was hit, and the Enter/Space handler skips
  it entirely (the control is a real `<button>`). Editing: `setCardVideoEdit` (curated, a `video` delta exactly
  like `image`, null tombstone and all) / `uCardSetVideo` (community); `serializeCardData` bakes `c.video`,
  `revertCard` restores `p.video`, publish sends `data.video`. `_headers` carries **`media-src 'self' https:`**
  and **`frame-src`** for the two embed hosts. `.ces-imgpanel[hidden]{display:none}` is
  **required** — the author `display:flex` beats the UA `[hidden]` rule, and without it the panel sits
  permanently open and the click-to-edit toggle does nothing. Guarded by `.claude/test-video.js` (89 assertions).
- **ONE media panel on the card surface** (Aug 2026, on request — it was two, with a `.ces-media-swap` pill
  between them). A card shows one frame, so the editor offers one slot (`#cesMediaSlot`) and one panel
  (`#cesMediaPanel`, fields `data-mediafield="src|title|desc|credit"`), and the pasted URL decides which of the
  two stores it lands in: **`videoSource(url)` already recognises every link the player can take, so anything it
  does not recognise is a picture.** Asking the author to classify a URL Folio can classify itself was the whole
  of the old two-box design. The stores stay separate underneath (`card.image` / `card.video`, and the one-frame
  rule the writers enforce) — only the editor stops making the distinction the author's problem.
  Three details are load-bearing. **`mediaKind` must be settled BEFORE the gate stages the value**, since the gate's
  own `input` listener is what calls `set()` — hence the listener `wireLiveCardEditor` installs on the URL box
  *ahead of* `wireMediaSource`. **Emptying the URL leaves `mediaKind` alone**, so the clear reaches whichever store
  actually holds the media instead of defaulting to the picture one. And **when the kind flips, the title,
  description and source are emptied first**, while `mediaKind` still names the old store: they described the old
  file, and a credit line silently re-attached to a new one is the same mistake as no credit at all (it also
  clears the old store, one frame per card, and the new URL then arrives uncredited and is held back). The gate's
  `kind` may now be a **getter** (`mediaKindLabel` unwraps it) so the "where does this come from?" modal words
  itself for whatever was just pasted. The glossary editors keep their own separate image/video panels.
- **Nothing is saved uncredited — the media source gate** (`wireMediaSource` / `askMediaSource`, beside
  `videoSourceLabel`). The editors save on every keystroke, so a picture URL pasted in and then forgotten
  about used to ship credited to nobody — the one mistake that stays invisible until someone else points it
  out. The gate sits **between a media panel's fields and the store**: while the source box is empty a typed
  URL is **staged only**, an `.af-reqnote` says so where it was typed (with an "Add the source" button), and
  a modal asks for the source the moment the URL field is left (`change`, not every keystroke). The whole
  staged object enters the store together as soon as a source exists; **clearing the source takes it back
  out**, so `src` and `credit` can never come apart in stored data. `render()` toasts on the way out if a
  panel is still pending, rather than losing the URL in silence. **All four surfaces use it**: the shared
  card surface's image + video panels (so the admin editor and the Studio both), the curated glossary
  editor, and the Studio's term form — each passing its own `get`/`set`/`after`, so the writers stay dumb.
  Because a staged picture is deliberately NOT in the store, the panels' meta rows, the slot renderers and
  `imgSet()`/`vidSet()` **read `gate.staged()`, never the store** (an author must see the picture they just
  pasted, flagged `.ces-media-pending`, not an "Add an image" box over a panel they have just filled in);
  the one-frame sync calls the *other* gate's `reload()`. It is **editor-side on purpose** — a hand-authored
  `data.js`, an imported deck file and an installed community deck are untouched, since this is a guard
  against forgetting while writing, not a validity rule imposed on other people's decks. `add-card.js` and
  `add-glossary.js` enforce the same rule at the content-pipeline end. Guarded by
  `.claude/test-media-source.js` (36 assertions).
- **Glossary video (optional):** `window.GLOSSARY_VIDEOS` (slug → the same object; `glossVideo(key)`,
  `ADMIN_EDITS.glossaryVideos`, baked by `serializeGlossary`), or `entry.video` inside `UGLOSS` for a
  community deck's own term. `renderGlossImage` puts it in the **same `.gloss-imgslot`** at the same fixed
  height — **one frame per term, like a card**, so setting one retires the other and the picture wins if a
  hand-authored `glossary.js` carries both. Edited in the curated glossary editor's **EN view only**
  (`data-gvidfield` → `setGlossVideoEdit`) and in the Studio's term form (`data-gvid` → `uGlossSetVideo`) —
  metadata is shared across languages, like an image's. The home page's Gloss-of-the-day plate stays
  image-only on purpose: it is a silhouette, not a player.
- **Glossary image (optional):** a term can carry the **same `{ src, title, desc, credit, alt }` object as a card**,
  read through `glossImage(key)` and rendered by `renderGlossImage` into the `.gloss-imgslot`, which is
  **floated to the TOP-RIGHT of the popup body** — so the opening sentences run down its left and the
  description resumes the popup's full width below it. It reuses `cardImageHTML`/`.card-img`, so the existing
  delegated
  listener opens the **shared** fullscreen viewer — no wiring of its own. The slot is therefore **first in
  `.gloss-body`, before `.gloss-dates`/`.gloss-desc`** — a float only wraps content that follows it, so don't
  move it back after the prose (both markup sites: `openGlossWin` and the admin glossary editor's preview).
  **In the popup the 150px height and the half-popup width are the picture's MAXIMUM, not its shape**
  (`.gloss-imgslot`, changed Aug 2026 on request): `max-height:150px` (170 on the mobile sheet),
  `max-width:50%` on the float, `object-fit:contain` — so within those limits the WHOLE picture is shown. It
  was a fixed height with `object-fit:cover`, which gave every popup one silhouette at the cost of cutting the
  sides off anything wider than half the popup — and a map, a diagram or a wide landscape is exactly the kind
  of picture a glossary term carries. A tall picture is now narrow and a wide one short, and both are whole.
  The **home page's Gloss-of-the-day tile**
  shows the same image to the right of the copy, but as a **profile-picture plate** — a 3:4 frame running the
  tile's full height and **bleeding to its top, bottom and right edges** (negative margins cancelling the
  `.exp-tile` padding, which is 18/20px in every theme; arcade's blanket `*{border-radius:0}` already flattens
  the plate's right corners), filled with `object-fit:cover` (crop biased to 40% so a portrait's subject isn't
  cut off), so the tile keeps one silhouette whatever shape the day's picture is (`.term-img`, a plain `<img>`
  — the tile is a `<button>`, so the `role="button"` figure can't be nested inside it); the discovery row
  splits **half and half** with the card of the day instead of 2:1 on days its term has one
  (`.explore-grid.has-term-img`) — at a third of the row the copy was down to four words a line. Curated terms live in
  `window.GLOSSARY_IMAGES` (slug → object, in `glossary.js`, baked by `serializeGlossary`); a community deck's
  terms carry `entry.image` inside `UGLOSS` and travel with the deck (the `user_gloss` `data` jsonb takes the
  whole term object, so publishing needed **no** schema change), re-sanitized on ingest by `uGlossSanitize` /
  written by `uGlossSetImage`. Editing: the curated glossary editor's **EN view only** (`data-gimgfield` →
  `setGlossImageEdit`, a whole-object `glossaryImages` delta with a null tombstone, exactly like the card image
  — image metadata is shared across languages), and the Studio's term form (`data-gimg`). **The viewer's
  `z-index` (9800) must stay above the gloss stack** — popups sit at 8000+ and the mobile sheet at 9600, and a
  gloss image opens the viewer *from inside* a popup; `focusGlossWin` renormalizes its counter at
  `GLOSS_Z_CAP` so a long session can't climb past it.
- **Themes (8):** folio, clay, garden, synth + four full-overhaul themes: arcade (16-bit), academy (formal faculty),
  marble (antiquity inscriptions), gazette (1940s newsprint, two-column About prose) — each light + dark, tokens
  hex-only. The overhaul themes change layout/chrome/ornament per theme (scoped `body[data-theme="…"]` blocks in
  styles.css; fonts in the single @import). **Seven themes — atlas, press, bloom, tide, scroll, grove, dynasty — were
  REMOVED on request** (a saved selection of one falls back to folio via the `THEMES` whitelist); don't reintroduce
  them. **Collection banners and all theme decorations are STATIC — no animated/moving patterns (removed on request).**
  Themes register in `THEMES` (app.js) + the `THEME_OPTS` settings-picker table (mini-mockup previews, hover try-on).
- **Text size** (**Settings → Appearance → Text size**, `FONT_SIZES` / `setFontSize` / `S.settings.fontSize`, Aug
  2026, on request): small / medium / large, written by `applyTheme` as `body[data-fs]` — so it is re-applied on
  every `render()` and at boot with no separate call — and read by styles.css as the multiplier **`--fs`**
  (`:root{--fs:1}`, `.9` and `1.14` on the two `body[data-fs]` rules).
  **It scales EVERY px font-size in the stylesheet** — 519 of them, each rewritten as
  `calc(<its own px> * var(--fs))`, plus the four `clamp()` headings as `calc(clamp(…) * var(--fs))`. It reached
  only the reading prose for a fortnight (a card's question and background, a glossary popup, an Atlas panel)
  and was widened on a second request; **the wording on the Settings row names what it now reaches, so keep the
  two in step.** What it deliberately does NOT do is move the LAYOUT: the boxes are still laid out in px and
  only the text inside them grows, which is what keeps a four-cell grade bar four cells at Large.
  **The one thing outside its reach is the Atlas's own map labels**, which are `ctx.fillText` on a canvas —
  CSS cannot see them, and their collision arithmetic (`computeCityLayout`'s grid, the leader lines, `CITY_SEP`)
  is written against those numbers, so scaling them would rearrange the map rather than enlarge it. The setting
  says so. **The picker is a SLIDER across the full width of the row** (`.fs-slide` / `#fsRange` /
  `.fs-ticks`, Aug 2026, on request — it was a three-cell segmented control, `.fs-pick`, which ran to 186px
  and left the rest of the row empty). Three sizes are an ORDERED SCALE and a segmented control says nothing
  about that ordering; a native `<input type="range">` is the one control the browser already gives arrow
  keys, Home/End and a drag to. **Its value is the INDEX into `FONT_SIZES`**, not the name, so the scale and
  the stored setting cannot drift apart, and `setFontSize` writes the range's `value` + `aria-valuetext` back
  so a change made anywhere else moves it. The tick marks under the track are `aria-hidden` — the range
  itself announces the size, and labelling them again would read the scale twice. **`.fs-pick` stays** and is
  still the Measurements picker, which is a CHOICE between two systems rather than a point on a scale.
  Guarded by `test-layout.js`, which asserts the prose AND the chrome grow, that the control fills its row,
  and that nothing in the shell is clipped or wrapped by the growth.
- **ANIMATIONS OFF** (**Settings → Appearance → Animations**, `S.settings.animations` / `motionOff()` /
  `body.no-anim`, Aug 2026, on request: "since they may cause lag on some devices"). ONE switch driving BOTH
  halves: the stylesheet's global killswitch gained a `body.no-anim` selector beside its
  `prefers-reduced-motion` media query, and **`prefersReducedMotion()` now returns `motionOff()`**, which
  reads the same setting — so every JS-driven movement already written against it (the page ghost, the sheet
  exits, `render()`'s smooth scroll, the globe's camera, the era crossfade, `pulseChanges`) stops with the
  CSS-driven movement rather than half of it carrying on. It is an **OR, not an override**: an explicit OFF
  only ever adds to what the operating system has asked for, and cannot turn motion back ON over a reader
  whose OS wants less of it. Written to the body by `applyTheme`, which runs on every render and at boot, so
  it needs no call site of its own.
- **HIGH CONTRAST** (**Settings → Appearance → High contrast**, `S.settings.contrast` / `body.hc`, Aug 2026,
  on request: "check whether colour contrasts have a ratio of at least 4.5:1 — if they don't, add a high
  contrast mode"). **The check was run, and the numbers are in the CONTRAST block at the top of styles.css.**
  What it found: in LIGHT mode `--ink-faint` (3.0–3.5), `--ochre` (3.3–3.9) and `--geo` (3.0–3.5) are below
  the bar on every paper, and `--zh` / `--good` are below it on `--paper-2`; in NIGHT mode everything clears
  it except `--ink-faint` on `--card`, at 4.19. Those are the QUIET tokens — an eyebrow, a caption, a source
  line — and they are quiet on purpose, so re-toning them for everyone would flatten the typographic
  hierarchy the design is built on. Hence a mode: `body.hc` re-tones exactly those, plus `--rule` (a hairline
  at 1.2:1 is invisible to a reader who needs this at all) and the focus ring. **The values are solved, not
  eyeballed** — each is its own hue scaled toward the ink until it clears 4.6:1 against `--paper-2`, the
  darkest of the three papers, so it clears the bar on all three.
  **One failure was NOT left to the mode**: in night mode `.btn` was `#FFF` on the light-lavender `--indigo`
  at **2.29:1**, and that is a primary control rather than a caption, so `body.night .btn{color:var(--paper)}`
  fixes it for everybody at 7.9:1. Guarded by `.claude/test-a11y.js`, which measures every text node's
  computed colour against the background it actually renders on and demands that NOTHING falls short with
  the mode on.
- **Light / dark FOLLOWS THE DEVICE by default** (**Settings → Appearance → Match my device**,
  `S.settings.themeAuto` / `systemPrefersDark` / `setThemeAuto`, Aug 2026, on request). `S.settings.night` stays
  the RESOLVED value — every stylesheet rule and the canvas globe read `body.night`, and nothing else had to
  change — and `applyTheme` writes it from `matchMedia("(prefers-color-scheme: dark)")` whenever `themeAuto` is
  on. A `change` listener on that query repaints mid-session (a laptop crossing sunset does it without a reload),
  and it `save()`s, since the resolved value is what a later manual flip starts from.
  Three things are deliberate. **`setNight` turns `themeAuto` OFF**: flipping the switch by hand is an explicit
  choice, and without this `applyTheme` would immediately overwrite it, which reads as a broken control.
  **The Night mode row stays on the page while the device decides**, dimmed (`.row-locked` / `.switch-locked`)
  rather than removed and never `pointer-events:none` — a reader needs to see that the site knows it is dark,
  and clicking it is the way back to deciding for themselves. And the **migration is the part not to remove**:
  `defaultState()` carries `themeAuto: true` but the back-fill beside the other `S.settings` back-fills pins an
  OLDER save to `false`, because an existing reader chose their `night` by hand and handing that choice to the
  operating system would flip the site under someone who had already decided. Guarded by `test-layout.js`, which
  still asserts `#sw-night` is on the page.
- **Measurements: ONE system, the reader's** (**Settings → Appearance → Measurements**, `S.settings.units` /
  `unitizeText` / `unitizeTree` / `applyUnits` / `setUnits`, Aug 2026, on request). The content stays authored
  **metric-first with the imperial equivalent in brackets** — `about 37 kilometres (23 miles)` — which is what
  `docs/units-plan.md` put across all 119 cards and 414 glossary terms, and it is the only form that carries both
  figures for a batch script, a citation pass or a translator. What changed is what a READER sees: metric (the
  default) drops the bracket, imperial replaces the metric figure with what the bracket says. Both directions are
  idempotent — after either pass the bracket is gone — which is what lets it run from a `MutationObserver`
  without tracking what it has already touched.
  · **It is a DOM text-node pass, not a hook in `glossText()`/`cardLocalized()`**, and that is the load-bearing
    decision: the editors read those same accessors, and a card whose stored text had already lost half its
    measurement would be saved back that way on the next keystroke. Walking text nodes and skipping anything
    editable means the store is never involved. It skips `.notranslate` for the reason the i18n engine does.
  · **Two patterns.** `U_CONV_RX` is the ordinary `<number><unit> (<imperial>)`. `U_BARE_RX` is the second half
    of a pair sharing the first's unit — "averaging 151 centimetres (4 ft 11 in) and females 105 (3 ft 5 in)" —
    without which imperial mode leaves that sentence half-converted.
  · **`isImperialParen` is the guard against eating an ordinary bracket.** It must be measurement-shaped ALL
    THROUGH, carry a number, and carry a STRONG imperial unit — `in` and `mi` are allowed as fillers inside a
    `4 ft 11 in` but never qualify a bracket alone, or "(in 1920)" would read as a measurement. Verified over the
    whole corpus: 341 fields transform, no imperial bracket is missed and no other bracket is touched. **Re-run
    that check after a units batch**, and mind the shapes it took to cover: `km²` and the bare `m`/`g` need a
    lookahead rather than `\b`; a hyphenated `175-metre (574-foot)`; `2.2 million km²`; and spelled numbers up
    to ninety.
  · The `MutationObserver` is permanent (both modes transform, so there is no "off"), and `render()` also calls
    `unitizeTree(root)` directly, since an observer callback is a microtask and would otherwise let one frame of
    the other system through.
- **ENGLISH ONLY — `const MULTILANG = false`** (app.js, beside `LANG_CODES`; Aug 2026, on request). The site
  ships in English while the work is on making the English as good as it can be. It is **one switch**, and it
  shuts three doors: the Language card is not rendered on the Settings page, `?lang=xx` no longer switches,
  and `setLang` refuses anything but English. **Nothing is deleted** — the nine `i18n/*` files stay on disk,
  the engine stays wired, `langPickerHTML`/`wireLangPicker`/`loadLangData` are untouched, and every bullet
  below still describes live code; the tables are lazy and per-language, so an English reader never fetched
  one anyway and the shut door costs a visitor nothing. Flip the flag and it all comes back.
  **The migration back is part of the gate, and is the part not to remove**: `langFromURL` resets a stored
  non-English `S.settings.lang` to `"en"` on boot. Without it, a reader who had chosen Spanish would be held
  in Spanish for ever with no control left on the page to escape — the one way removing a setting can
  genuinely strand someone. The content pipeline has the same switch twice over
  (`REQUIRE_TRANSLATIONS` in `add-card.js` and `add-glossary.js`), and the changelog rule in the golden rules
  is suspended to match. Guarded by `test-layout.js` (the gate) and `test-i18n-lang.js`, which asserts the
  gate UNPATCHED and then **serves an app.js with the flag flipped** so the machinery behind it stays tested
  rather than quietly rotting.
  One consequence to know rather than to fix: **the editors can no longer reach a translation.** The editing
  language IS the site language, so with English forced the card editor edits the base fields and the
  glossary editor the English description — `setCardI18nEdit` / `setGlossI18nEdit` are unreachable from the
  UI, and `serializeGlossaryI18n` bakes nothing, since it only ever writes languages whose file is loaded.
  Translations are edited by `.claude/add-lang.js` alone while this stands.
- **Language picker + i18n** (**Settings → Language**, `langPickerHTML` / `wireLangPicker`; it was a `#lang-switch`
  dropdown in the top bar until Aug 2026, moved on request when the phone's top bar was removed — a preference
  belongs on the preferences page, and the picker had nowhere else to live once that bar was gone): a grid of
  10 languages (en/es/fr/de/it/nl/ru/ar/zh/ja) stored in `S.settings.lang`, each option showing an **inline SVG
  country flag** (`FLAG_SVG` in app.js — NOT emoji flags, which render as bare letter pairs on Windows) plus the
  language's native name. The whole grid is `notranslate`: these are the languages' OWN names, and translating
  "Deutsch" into German is how a reader loses the one row they were looking for. The light/dark switch made the
  same move and had a home there already (Settings → Appearance → Night mode, `#sw-night` — `applyTheme` keeps it
  in step and is now the only thing it looks for). **The site chrome IS localised**: `i18n/ui-<lang>.js` holds one language's tables (`window.I18N` exact strings /
  `I18N_RULES` regex patterns for dynamic labels / `I18N_HTML` whole prose blocks, all keyed by the ENGLISH source
  text), and app.js's engine (`t()`, `localizeTree()`, `applyLang()`) walks rendered text nodes +
  title/aria-label/placeholder/alt attributes after render, with a MutationObserver localizing later DOM (toasts,
  popups, menus). Originals are stashed on the nodes so switching back restores cleanly; anything untranslated stays
  English (graceful fallback). Arabic flips `<html dir="rtl">`. Elements with class `notranslate` are skipped.
  **Adding a language** — the language set is defined in exactly three code sites: `LANGS` + `FLAG_SVG` (app.js,
  the picker) and `CARD_I18N_LANGS` (app.js, the card editor's translated fields); plus the `I18N_LANGS`
  validation list in `.claude/add-card.js` and `.claude/add-glossary.js`. Everything else is keyed off
  `S.settings.lang` and needs no change. Backfill the CONTENT with **`node .claude/add-lang.js <batch.json>`**
  (see "Backfilling a site language" below) — and add the code to `LANGS` **last**, once the chrome table is
  translated, so the picker never offers a language that renders as English. Ship an EMPTY
  `i18n/gloss-<lang>.js` at that point too, or every page load 404s on it until the glossary is translated
  (`ensureData` degrades gracefully, but the console noise is real). **No CJK webfont is loaded, deliberately**: `--serif` ends in the generic
  `serif` and none of the Latin faces carry CJK glyphs, so Chinese and Japanese body text falls through to
  the reader's own system CJK font — correct glyph forms per language. The imported `Noto Sans SC` sits only
  in `--han` (level numerals, hanzi lines) and is NOT in the body chain, so it can't impose Chinese glyph
  forms on Japanese text. Don't "fix" this by adding a CJK webfont; it would be a multi-MB download for no
  gain. **Japanese (`ja`) is COMPLETE**: the chrome
  (531 strings / 72 rules / 12 prose blocks), all 30 cards and 333 glossary terms are translated and live,
  at full parity with the other eight languages. (The **sixty-three terms added on 2026-08-03 are English-only**,
  like every entry written since the `MULTILANG` gate went up — so all nine languages stand at 333 of 401,
  together, and a language is still "complete" in the sense that matters: none is behind the others.)
  **Content localisation is separate**: cards carry per-language `i18n` blocks (`cardLocalized()`), glossary
  descriptions live in `i18n/gloss-<lang>.js` (`window.GLOSSARY_I18N`, read by `glossText()`), and **collection /
  deck titles carry their own `node.i18n` lang-map in `data.js`, read by `nodeTitle(n)`** — deliberately NOT the
  I18N exact table, because titles like `Prehistory`, `Paleolithic`, `Neolithic` and `Bronze Age` also occur as
  answer terms and glossary links inside card prose, where a global exact key would override wording the card and
  glossary pipelines have already translated (verified empirically before choosing the helper). `nodeTitle` feeds
  `nodePath`/`nodeWhere`/`nodeParentPath`, so the Library, study bar, home review list, account rows, deck picker
  and level-up popup all follow; the **admin tree deliberately keeps reading `node.title`** so the editor always
  edits the English base, like the glossary editor's EN-view-only fields. An admin **rename retires** that node's
  translations (`i18n: null`), since a stale translation beside a new English title is worse than falling back.
  `SHIPPED_NODES`, the `applyAdminEdits` rebuild and `serializeCardData` all carry `i18n` through — **a new node
  field must be added to all three or it is silently dropped on the first admin edit** (this bit once: the rebuild's
  `nodeById` literal omitted it and every title stayed English).
  **The `I18N_HTML` whole-block pass is gated on key membership, not tag name.** It was once limited to
  `P|LI|H1…`, which skipped the About walkthrough's `<span>`s and `div.mf-row` blurbs; the exact pass then
  translated only their inline `<b>`s and stranded the surrounding prose in English. It now tests any element,
  with an `isConnected` guard and cheap `children.length`/`textContent.length` bounds against `_i18nHtmlCap`
  (the longest key in that language's table) so it does not serialize `innerHTML` for every element on the page.
  **`setLang(code)` is the single entry point** for a language change (the picker calls it; don't set
  `S.settings.lang` directly): it validates against `LANG_CODES`, persists, and — since the translation files are
  **lazy and per-language** (`langBundle`) — calls `loadLangData()` first, repainting with `applyLang(); render();`
  once the chrome table lands. A non-English reader therefore sees English for the moment the table takes to
  arrive; an English reader never fetches any of them, and never pays a second render. Switching language pulls
  only the new language's two files; the previous one stays resident.
  **`?lang=xx` links the site in a given language** (e.g. `/?lang=es#decks`) and, like the picker, becomes
  the stored preference. Its IIFE runs at load, before the first `render()`, so the Settings page paints with
  the chosen language already marked. Base-tag matching (`es-ES` → `es`); an unknown code is ignored, not stored.
  **Known gap:** the `PAGE_META` titles/descriptions have no `i18n/ui-<lang>.js` entries yet, so `document.title` stays
  English in other languages (the documented graceful fallback). Adding them is a content task.
- **UI sound effects** (the `/* UI sound effects */` block in app.js): tiny synthesized Web-Audio sounds, no files —
  **`click` and `toggle` are a soft TAP since Aug 2026** (`sfxTap` / `sfxNoiseBuf`, on request: "something more
  akin to a low soft tapping sound than a high chirp"): a short burst of noise with a light body under it,
  which is what a finger on wood actually is — a broadband transient that dies at once, with no pitch to
  speak of. A pure oscillator cannot make one, which is why the old click was a triangle sliding
  1900 → 1300 Hz. **The filter is a BANDPASS, and that is the second correction** (Aug 2026, on a report that
  the tap had become "a low thud"): a low-pass at 780 Hz keeps everything BELOW it, so most of what was left
  was rumble, and under it sat a sine falling 190 → 120 Hz — which is a bass drum, not a fingertip. A
  bandpass keeps a band and throws the rest away, so the tap has a MATERIAL rather than a weight, and the
  centre frequency is what says whether a finger landed on wood or on glass. **Nothing goes below 500 Hz
  now** (~1.9 kHz band, a 560 Hz body, both under 32ms — the decay mattered as much as the pitch), and the
  gains are LARGER than the low-pass version's for a quieter result, a band being less energy than
  everything below a corner. `sfxTap` deliberately has **no attack ramp** where `sfxTone` does: a tap starts
  at full level on its first sample, and a 5ms fade-in turns it into a small swell. The noise buffer is
  built once and reused; a click is by a wide margin the most frequently played sound on the site. —
  `sfx(name)` with click / toggle / pop / good / bad / win / **discover** (a term or place opened for the first
  time — see the discovery-marks bullet above), played by ONE delegated **capture-phase** click listener
  (so a handler's `stopPropagation` can't swallow the tick) that maps button-likes to sounds (grades → good/bad,
  `#reveal-btn` + `.card-img` → pop, switches → toggle, everything else → click), plus hooks in `congratsPopup`,
  `checkAchievements` and `markGamePlayed(won)` → win. Gated by **Settings → Audio → Sound effects**
  (`S.settings.sfx`, default ON); the shared `AudioContext` is lazily created + resumed inside the gesture (autoplay-safe).
  Volumes are deliberately tiny — keep them subtle.
- **Read-aloud TTS — SET ASIDE (July 2026)**: the whole system is disabled site-wide — `ttsEnabled()` in app.js
  returns `false` unconditionally, which hides every play control, the card mute button, the pronunciation button,
  auto-read and the selection Read-aloud menu; the Settings "Audio" card was removed. The machinery below and the
  baked `audio/` files stay dormant for a later revival — everything in this bullet describes that dormant system.
  (Web Speech API, zero-dependency; the `/* text-to-speech */` block in app.js): a slow MALE English voice
  (`ttsVoiceEn`, rate 0.85) + a slow FEMALE Chinese voice (`ttsVoiceZh`, rate 0.7 — also used by the `.tr-play` pronunciation
  buttons via `speak()`). **Voice choice is quality-scored** (`ttsPickVoice`): neural/natural/enhanced/premium names +8, network
  (`localService===false`) +2, wanted gender +4, wrong gender −3 — so Edge's free "… Online (Natural)" neural voices and iOS
  "Enhanced" voices win automatically; a voice picked in **Settings → Reading voices** (`S.settings.ttsVoiceEn/ttsVoiceZh`,
  stored by `voiceURI`, "" = auto; EN + ZH selects with Test buttons, refreshed on `voiceschanged` via `_ttsVoicesHook` since
  mobile delivers the list async) always beats the auto-pick. **The API can only use voices installed on the device** — Android
  Chrome often exposes a single female Google voice per language, so no in-app fix can produce a male voice there (the user must
  install/select a better system TTS voice, or pick the least-robotic option in the picker). Studying a card auto-reads the question (the cloze `____` is read as **"blank"** — `ttsQuestionText`);
  revealing auto-reads answer title → hanzi (ZH) → background. English text is **chunked into ~220-char sentences** (`ttsChunks`)
  or Chrome's engine cuts out mid-paragraph. Two gates: the Settings-page **Text-to-speech** toggle (`S.settings.tts` — off hides
  every control) and the card's top-right **mute** button (`S.settings.ttsMuted`, **persisted** so leaving a card muted keeps all
  future cards/decks muted until unmuted; muting `ttsStop()`s dead — unmuting never resumes). Tiny `[data-tts]` play triangles sit
  behind the Question/Answer/Background section titles (Background's is a `role=button` SPAN inside the `.bg-head` button — a
  nested `<button>` would be invalid HTML) and behind the gloss-popup title; `wireTTS(container, c)` binds them (study, admin
  previews). **Opening a gloss popup interrupts the current read, waits 500ms, then reads title + dates + description**
  (`ttsSay(parts, 500)`; a generation counter `_ttsSeq` kills superseded delayed reads — `ttsSay` also defers ≥60ms because Chrome
  swallows a `speak()` issued synchronously after `cancel()`). Right-clicking a text selection inside the background paragraph
  shows a custom **Copy / Read aloud** menu (`wireReadAloudMenu` → `.ctx-menu`; native menu when TTS is off or nothing is
  selected). `render()` calls `ttsStop()` so navigation always silences reading.
  **Baked narration** (`audio/cards/<narrator>/*.mp3` + `manifest.json` + `_sample.mp3`, built by `node .claude/build-tts.js
  [--narrator=key]`): card sections (question/answer/background) pre-rendered with a local neural TTS (**Piper**). FOUR shipped
  narrators (Settings → **Narrator**, `S.settings.ttsNarrator`, default `us-male`): `us-male`/`us-female` =
  `en_US-libritts_r-medium` speakers 5/12, `gb-male`/`gb-female` = `en_GB-vctk-medium` speakers 13/14 — both datasets
  **CC BY 4.0, commercial-safe**; do NOT switch to `hfc_male`/`ryan`/`lessac`, they're CC BY-**NC**. 48 kbps mono MP3, ~85 MB
  per narrator. The runtime loads the selected narrator's manifest (`loadBakedManifest()`; re-fetched on picker change; the
  Test button plays `_sample.mp3`) and plays a baked file when `bakedUrl()` finds one whose manifest hash (`hashStr` of the
  section text) still matches — an admin-edited card silently falls back to the Web Speech engine, as do missing files,
  `file://` (manifest fetch fails), and autoplay-blocked plays. **Gotcha:** the build's text-canonicalization must mirror DOM
  `textContent` EXACTLY — tags strip to "" (not a space), else every background hash mismatches and reads with the robotic
  device voice (this happened; `--rehash` updates manifest hashes without re-synthesis after canonicalization-only changes).
  `ttsSay` is a sequential part-driver (`runTTSPart`: baked `<audio>` → engine fallback per part); `ttsStop()` also halts
  `_ttsAudio`. Chinese hanzi stays on the device voice (no commercially-clear zh Piper voice). The bake is incremental
  (manifest hash check; `--force` re-bakes; `--scan-speakers=N` pitch-scans voices; toolchain auto-downloads into gitignored
  `.claude/tts-cache/`). Gloss popups + selection read-aloud always use the engine.
- **THE VERSION LINE** (`versionLineHTML`, just above `PAGES.home`; `.site-ver` in styles.css — Aug 2026, on
  request). The shipped version and the moment it went out, very small in the **top-left corner of the home
  page**, above the greeting. Four decisions in it are load-bearing.
  · **The record lives in `changelog.js`, not in app.js** — see the golden rule. Bumping it and writing the
    day's changelog line are then one edit in one file.
  · **It is read at RENDER, never captured at boot.** A reader on a service-worker-cached copy of the site is
    running an older build, and the number they are shown must be that build's, since the whole point of it is
    to be quotable in a bug report. It also means a missing record prints **nothing** rather than a
    placeholder, which is the honest failure.
  · **The instant is stored in UTC and printed in the READER's own clock and locale**, like the day boundary
    and unlike the changelog's day headings, which are deliberately fixed to the site language: this is a
    moment in time rather than a day of publication.
  · It is a **sibling BEFORE `.page-head`, not inside it**, and carries its own `text-align:left`: below 640px
    and in the academy and gazette themes the page head is centred or boxed in a rule, and a centred version
    number reads as a title rather than as a stamp. `notranslate` for the reason the discovery chip's figure
    carries it. Its colour is `--ink-faint`, the site's own quiet token — so it joins the captions and source
    lines that the **High contrast** mode re-tones, and `test-a11y.js` covers it with no change of its own
    (3.25:1 reported in the default mode, clearing the bar with the mode on). Guarded by `test-layout.js`.
- **Home page** (`PAGES.home`): greeting → daily quote (`QUOTES` — world sources East and West, standard published
  translations only, no loose internet attributions; **clicking one flips it to the original** — text, speaker and
  source from the entry's `o` block, `wireDailyQuote` swapping `hidden` on the `.dq-live`/`.dq-orig` spans, clicking
  again returns to the site language. The swap **crossfades**: the words fade out (`dq-out`), the swap happens while
  nothing is visible, the incoming ones are held at their start (`dq-in`, `transition:none` — removing the class is
  what animates them) and the figure's height eases between the two languages (`dq-sizing` + an inline height, since
  a Greek line and its English rarely wrap the same), so nothing cuts and the page below never jumps.
  **The figure is also held at the height of its TALLER language** (`lockHeight`, Aug 2026, on request): both are
  measured in one synchronous pass that never paints — swap the `hidden` attributes, read `offsetHeight`, swap
  back — and the larger becomes a `min-height`, after which the flip moves nothing at all and the height easing
  above is a no-op. It is **re-measured on a tick, on `document.fonts.ready` and on resize** (`_dqResize`, one
  listener ever), because the i18n observer rewrites the quote after render for a non-English reader and a
  webfont arriving re-wraps both languages. `DQ_FADE` /
  `DQ_SIZE` in app.js must stay in step with the `.dq-*` transition durations in styles.css; a `busy` guard ignores
  clicks mid-flight and `prefersReducedMotion()` swaps outright instead of waiting out the timings. `.dq-flip` also
  carries **`user-select:none`** — it is a button, and clicking it twice to toggle back otherwise swept the
  `::selection` wash across the whole quote (the "it lights up" bug); the trade is that the quote can no longer be
  selected for copying. The original carries **`notranslate`**, or the i18n engine would translate the
  one thing on the page that must stay as written. A quote has an `o` only where the original wording is documented —
  Bacon wrote in English, and Meditations VII.49's exact Greek could not be verified, so both render exactly as before
  with no `dq-flip` class, no cursor and no handler; **don't fill those in from memory**.
  **The day's quote follows `QUOTE_ORDER`, not the array** (`quoteRunningOrder`): the same author never speaks
  two days running and never more than twice in any seven days — in array order Confucius held the page for four
  days straight. The order is laid on a **circle** of `QUOTES.length` days and checked on every arc of it, wrap
  included: a reader sees that circle repeated, and a week is shorter than the cycle, so a circle that is legal
  all the way round is legal forever — which is why the order does **not** reshuffle per cycle (the join between
  two cycles is the one window neither can see). Greedy seating, busiest author first, plus a soft "a turn every
  n/c days" preference that is what makes the spread even rather than merely legal; seeded retries when a seating
  gets stuck. It rebuilds at load, so **adding quotes needs no thought here** — but the pool must stay solvable:
  an author with more than `2n/7` lines (5 of 20 today) cannot be spread by any arrangement, and the fallback is
  the best attempt, not a guarantee. Guarded by `.claude/test-daily-quote.js`) → review banner → (first-run only) a 3-step how-it-works strip →
  game tiles → a **discovery row** (`.explore-grid`): **Card of the day** (a real card, CSS-3D flip to its answer, gloss
  links stripped, **"Study this card"** button — see the CotD-additions bullet below), **Term of the day** (a dated glossary term → `openGlossWin`), and an **Atlas
  teaser** with a slowly turning decorative mini globe (`startMiniGlobe` — decimated `WORLD_GEO`, orthographic,
  theme-coloured like the Atlas, stops when the canvas leaves the DOM, static under `prefers-reduced-motion`). Both
  daily picks come from `dailyPick(arr, salt)` (date-seeded). **Until the first card is ever graded**
  (`S.cards` empty) the banner is a **first-run hero**: purpose sentence + "Study your first cards", which sets
  `S.active = ["china"]` (replacing the bare `cn-qing` default) and routes straight into a session; the level badge,
  xp bar, stats, review-order toggle and active-deck list appear only after that. The banner shows a **🔥 day-streak
  chip** (`S.streak`, shown at 2+ when the run is alive). **Completion is a RIBBON, not a filled tile**
  (`.gt-ribbon`, Aug 2026, on request — the banner and every game tile used to FILL with their colour once
  played and turn gold on a perfect score, which was a lot of surface to change for one fact and fought every
  theme's own treatment of the card). A small diagonal band crosses the TOP-RIGHT corner instead — the tile's
  own hue reading "Played" / "Done", the same shining gold (`gt-gold-shine`) reading "Perfect" — over a surface
  left exactly as it was. It carries a WORD rather than being a bare colour: an unlabelled band says nothing to
  a screen reader and little more to the eye. `.done` / `.won` stay on the element (they are what the tests and
  the achievements read); all they do now is carry the ribbon. The green `.gt-done` check circle went with the
  fill, as did the earned fill that used to run down the added decks (`rv-done` / `rv-won` are still set on
  `.review-group`, and nothing styles them). It reads `S.reviewDay = { d, n, miss }` (in
  `defaultState` + `PROGRESS_FIELDS`), written by **`logReviewDay`** from `grade()`: only a card's FIRST attempt
  of the day counts (`firstToday`, from the pre-grade `c.last`), since a learning card is graded again ten minutes
  later; correct = anything but Again, as in `logReview`. `reviewLog` can't answer this — it counts every grade
  and only tracks mature ones. Both fills carry `.review-group` in their selector **for specificity**: marble and
  academy dress `.banner` with a surface of their own, and the earned fill must outrank it in every theme; the
  gold is `.done.won`, since a perfect day carries both classes. **The home page must not read as China-centric** — Folio
  covers many history topics; copy stays subject-neutral (China is just the first live collection).
  **A "Seen total" stat sat beside Due and New and was removed on request (Aug 2026)** — the xp bar directly above
  it already counts the distinct cards studied, as progress towards the next level rather than a bare number.
  **The banner carries NO big numeral and no description line while there is work** (Aug 2026, on request —
  it had a gold numeral of the day's whole pile for a fortnight, and `pileBadgeMarkup` went with it). The
  numeral was a fourth unlabelled number competing with the three labelled counts directly below it, which
  break the same total into New / Learning / Review and are the answer a reader is actually after; the
  sentence ("Cards scheduled for today, plus a few new ones…") described those three counts in words. The
  other two `.desc` branches STAY — one says the day is finished and the other says there is nothing here
  yet, and neither is visible anywhere else on the banner. The level is still spelled out by `xpBarMarkup`
  directly underneath. **`test-account-switch.js` therefore reads the xp bar**, not a badge, to tell an
  account that has studied from one that has not.
  **The banner counts ANKI'S THREE PILES** (Aug 2026, on request — it was a Due / New pair): **New** in blue,
  **Learning** in red, **Review** in green (`pileCounts` in `PAGES.home`; the tokens are the study bar's own
  `--indigo-bright` / `--zh` / `--good`, so all three sites agree). The same three numbers, unlabelled, open every
  added deck's row below it (`adCounts` → `.ad-counts`), computed by the SAME function over that deck's ids, so a
  row can never claim work the banner does not. Two things about the split are deliberate: **new** is the day's
  allowance (`reviewQueue().fresh`), not the whole unseen backlog, and a **learning** card counts from the moment
  it is answered wrong until it graduates — whether or not its ten-minute step has come round — because a count
  that emptied while the card sat on its timer would say the work was done. `review` is the due pile minus those.
  Each figure is **centred over its own label** and the three sit on the **CTA's own line**; below 640px that
  costs the button its width (`.review-group .banner .cta .btn` shrinks and the row goes `nowrap`), since a
  button on a line of its own left the piles floating over nothing.
  The button is **CENTRED against them** (`align-items:center`, Aug 2026, on request): a figure over a label is a
  two-line column, and the `flex-end` this rule used to carry put a one-line button on its baseline, reading as
  having slipped down.
- **The phone home page is ONE COLUMN, and it is a DIFFERENT PAGE from the desktop's** (`const phone = phoneHome()`
  at the top of `PAGES.home`, Aug 2026, on request). It was three swiped panes for a week (`.home-pager` /
  `.hp-pane` / `#homeDots` — all gone, along with their ≤640px rules); the reason they went is that two of the
  three panes stopped existing. The order on a phone is: quote → review group (+ the first-run how-it-works
  strip) → a **Minigames** heading over the game grid → the About line. The desktop is unchanged: review, games,
  discovery row, in `.banners`, which is the flex column the pager used to be.
  · **`phone` gates what is BUILT, not what is shown.** The card of the day, the term of the day and the Atlas
    teaser are not rendered on a phone at all — no date-seeded pick over every card, no glossary scan, and above
    all no ~1.6 MB `world` bundle for an ornament nobody can see. So **crossing the breakpoint re-renders**
    (`_homeResize`, one listener ever — `render()` re-enters `PAGES.home`, so a per-render listener would pile
    up for the session).
  · **The games are 3 × 2 on a phone** under a LEFT-ALIGNED `.games-head` (`.game-grid` at ≤640px; it was 2-up on
    the pane it had to itself). The heading was centred for a week and moved back to the left in Aug 2026 on
    request — every other heading and label on that page starts at the column's left edge, and a centred one
    among them reads as a banner rather than as the name of the grid underneath it. The class is deliberately **not** `.mg-head`: `mg-` is the MAP GAME's prefix
    (`.mg-card` / `.mg-head` / `.mg-score`), and reusing it gave the heading that card's `display:flex` —
    which beats `text-align` outright, so it rendered hard left with a computed `text-align:center` — while
    pushing this heading's font and colour onto the game's own score row. `test-layout.js` measures the
    heading TEXT's centre through a Range rather than reading `text-align`, which is the only way to tell
    the two apart. The tiles' **taglines are dropped at the source**, in `gameSub`, not hidden in CSS. Three to a row leaves ~86px
    of text column, where one sentence runs to four lines and buries the name above it. **Today's SCORE stays**
    (`gameScore`, bare figures — "3/5" — on a phone): it is not a description, it is the one thing on the tile
    that changes during the day. The blank sixth tile drops its sentence the same way.
  · **The way to the Library is `.rv-lip`** — a small "+ Add decks" tab hanging off the bottom edge of the
    review group, replacing the full-width `.lib-banner` that sat under it (removed Aug 2026, on request). It is
    the group's **last child, in flow**: the deck list is glued flush to the banner above it (`.has-active`), so
    there is no bottom edge to hang from until the whole group has one, and an absolutely-positioned lip would
    have to guess the list's height on every render. It is **the ONLY route to the collections on a phone**, so
    it ships in every state the review can be in, first run included — don't gate it on having decks.
    It is **filled indigo with white text** (Aug 2026, on request), not the paper tab it started as: it is the
    only route to the collections down here, and paper-on-paper it read as part of the card's own edge. The
    blue is the site's primary-button indigo, so it matches Start review directly above it.
  · **`.home-about`** — a centred grey "About Folio" line (`#b-about` → `route("mission")`) at the foot, from
    when About left the tab bar. Phone-only on the same terms as the lip, and, like it, **rendered only on a
    phone** rather than hidden above the breakpoint. Its `20px 0 16px` padding is the whole of its separation
    from the games above it (Aug 2026, on request — it was `4px 0 2px`, leaving it crowded against the grid).
    Guarded by `test-layout.js`.
- **Home minigames** (game-grid tiles → `PAGES.*`): **Multiple Choice** (`PAGES.challenge`, formerly "Daily Challenge" — the
  rival bots + timer were removed; it's now a plain 5-question quiz whose 3 wrong options are the cards most AKIN
  to the answer, by `cardKinship` — see the card-tags bullet below), **Timeline** (`chrono` — **the FIRST "Check order" of the day is the answer that counts**, Aug 2026, on
  request: checking used to record the BEST of any number of tries, and since a check reveals every event's
  date a reader could check once, read the years off the rows and reorder to a perfect score every day. Later
  checks still mark the rows and show the dates — the puzzle stays usable for learning the order — they just
  no longer rewrite the score, and the result says so.
  **Its DRAG was rewritten in Aug 2026, on a report that it felt unpleasant** (`setupChronoDrag`). The old
  one called `insertBefore` on every `pointermove` and did nothing else, so the row being dragged never
  went anywhere under the finger — it was re-inserted at the new index and appeared there — and every other
  row CUT to its new place, a reorder being a reflow. The two are now held apart: the dragged row is moved
  by **transform** and follows the pointer exactly, and its siblings are reordered in the DOM and then
  **FLIPped** around it. Four things are load-bearing. The row **stays in the flow** — never absolutely
  positioned, no placeholder — so the list's height never changes, the DOM order is the answer at every
  instant, and an interrupted drag cannot leave the puzzle in a state the reader did not choose. Reordering
  moves the dragged row's own layout slot out from under it, so its transform is **recomputed against the
  new layout on every reorder** (`pinToPointer`), or it jumps by exactly one row's height at the moment it
  swaps. The target index is measured against the siblings' **LAYOUT** positions (`chronoLayoutTop`), never
  their painted ones — a sibling mid-FLIP is painted somewhere it is not, and reading that makes the list
  flicker between two orders. And `.chrono-item.dragging` must NOT set `transform` (the JS owns it) or a
  `transition` on it (the row would lag the finger by its own duration); it lifts with shadow and z-index
  instead. The ‹ › arrows FLIP the same way, or they would be the one remaining way to reorder with a cut),
  **True or False** (`truefalse`),
  **Who said it?** (`whosaid`, from `quotes.js`), and **Find it** (`findit`, renamed from "Find it on the map" Aug 2026 on request — see the Atlas game-mode bullet
  below; 5 date-seeded locate-on-the-globe rounds, score = first-try finds). `BOTS`/`drawRace`/podium are now dead code.
  Each of the 5 games records a per-day result in `S.games[key] = { date, played, won }` (`markGamePlayed(key, won)` at each
  game's end; `won` = a perfect run, or `solved` for Timeline). The home tile has **three daily states** (state classes set by
  `tile()`) — playing EARNS the colour: **unplayed** = a whisper of the tile's hue (a ~10% wash + hue-tinted title,
  theme colour only in the left bar, faint corner icon — `button.game-tile:not(.done):not(.won)`); **played today** (`done`, via
  `gamePlayedToday` — challenge/chrono still also derive it from `S.daily.lastPlayed` / `S.chrono.date`) = the tile FILLS with
  its theme colour (bright top-left → darkened far corner, dark icon, white text) + the green **✓ checkmark**; **perfect score
  today** (`won`, via `gameWonToday`) = a **shining gold** tile (`gt-gold-shine` sweeps a white band across the gold via
  animated `background-position`; icon/text darken; check stays). In **light mode** the filled (non-gold) tile skips the
  darkened far corner (`body:not(.night)` override). A played tile's tagline becomes **today's best score** ("4/5 correct!",
  chrono: "in order!") — `markGamePlayed(key, won, score, total)` stores `{s, n}` per day, `gameSub()` renders it. The
  Daily-review banner's CTA sits at the **bottom-left inside `.body`** (below the full-width xp bar), on mobile too. The **"Clean Sweep" achievement**
  (`sweep`, 🎯) unlocks when **all five are `won` on the same day** (`DAILY_GAMES` includes `findit`;
  `allGamesWonToday` → `progStats().dailySweep`). A perfect Multiple-choices run also increments `S.daily.wins`, which **revived
  the previously-dead `win1`/`win10` (Victor/Champion) badges** (`wins` was never written after the bot race was removed).
  `S.games` is in `defaultState()` (back-fills old saves) and `PROGRESS_FIELDS` (mirrors to the account).
  The grid's **sixth slot** (`blankTile`) reads "Coming soon / More games / Another one is being written"; it
  used to be "Coming soon / —", which names nothing and looks like a tile that failed to load. Below 430px the
  tile type shrinks, or "Multiple Choice" breaks across two lines and its tagline across two more. The **Card-of-the-day tile carries the card's DECK** in its head
  row (`.cod-where` ← `cardLeaves(id)[0]` → `nodeWhere`) — the tile is a fixed height, so a short question left
  a band of nothing under it. Deliberately the deck and **not** the era: on a prehistory card the era is most
  of the answer.
- **Settings and Account fill the stage** (Aug 2026). Both were a narrow column hard-LEFT inside the 800px
  stage — the settings cards stopped 180px short of a heading that spanned the whole width, and the signed-out
  sign-in form 340px short — so each page read as half-drawn on a laptop. `.settings` is now a grid that fills
  the stage and pairs the cards into two columns at ≥900px (`.set-wide` for the theme picker and `.danger`,
  which should never sit quietly beside something else, span both). Centring the column instead would have
  broken the left edge's alignment with the heading, which is why it isn't done that way. The signed-out
  account page splits into `.auth-split`: the form on the left and the three `.auth-perks` bullets — already
  written, previously stacked under it — in a column beside it at ≥820px, saying what an account is for at the
  moment a reader is deciding whether to make one.
- **Collection identity (Library)**: `COLL_THEME` (app.js) maps each collection id → `{ bg }`, a signature hue
  (`--coll-bg`, consumed by every theme's STATIC banner treatment in styles.css — the old drifting SVG motif system
  AND the gold `COLL_SEAL` emblem circles were both removed on request; banners carry only the hue wash + level
  numeral). The **default folio theme has a "bookplate" deco** (quiet hue wash + fine inner rule); coming-soon rows
  show a ghost of their hue (row opacity .62). Deck rows inside a collection take the collection hue as their left
  hairline (`--coll-bg` inherits from the `.collection` root; branches stay ochre). If a collection is ever recreated
  under a new id, update `COLL_THEME` (and `COLLECTION_NUMERALS`).
- **Library layout (`PAGES.decks`)**: "Collections" is a plain group; **"Coming soon" is a `<details>` disclosure**
  (`.collection-group-soon`), **collapsed for everyone, admins included** (Aug 2026, on request — it used to open
  itself for an admin so the library's drag-and-drop had its drop targets reachable, which meant the one person who
  opens this page most often always met it expanded; an admin moving a collection between the groups opens the fold
  first, and the drop targets are reachable the moment it is open). This exists because
  the collections still being written far outnumber the finished ones (currently 6 to 1), and listing them flat made
  the Library read as empty. A live collection's banner also carries a **card count** (`.collection-count`, from
  `subtreeCardIds`) — the one number that says there is something to study here.
  (The first group was labelled "All decks" until Aug 2026, which contradicted both the hierarchy —
  collection → deck → subdeck — and the page's own title.)
  **A coming-soon collection shows its name and the pill, and nothing else** (Aug 2026): it used to carry a
  `Level 1` badge over an XP bar reading `0 / 3 cards` — a progress meter towards a level in a collection
  that cannot be studied, and a figure that reads as a card count when the collection holds no cards. Six of
  the seven collections are coming-soon, so that was most of the Library saying nothing. With the meter gone
  the row's opacity fade no longer has to cover one, so it eases from `.62` to `.78` (at `.62`, over a tinted
  wash, the title and pill sat near the contrast floor). It also has to **cancel `.collection-title-row`'s 9px
  bottom margin** (Aug 2026, on request): that margin separates the title from the XP bar, and with no bar it
  was 9px of nothing inside a flex item the row centres as a whole, so the title rode ~4.5px above the middle
  of its own banner. A flex item establishes its own formatting context, so the margin cannot collapse away by
  itself — it has to be zeroed.
- **Collections count their level in their own script** (`levelBadgeMarkup(xp, sys)` + `numeralIn(sys, n)`; the id→system map is
  `COLLECTION_NUMERALS`): China → Chinese numerals (`一 二 三 …` via `cnNumeral()`, Han font — `一` for level 1 is a single
  horizontal stroke, so it reads as a bar until level 2+), Ancient Rome (col-40) → Roman numerals, Ancient Greece (col-13) →
  ancient Greek alphabetic numerals (`α ια`, ϛ = 6; the closing keraia was removed on request — don't reintroduce it), India (col-43) → Devanagari digits (`१ २`), Russia
  (col-42) → Cyrillic/Church-Slavonic numerals (`а҃ в҃`, titlo over the second-to-last letter, 11–19 unit-before-ten). The
  level-up popup (`congratsPopup`, items carry `sys`) uses the same map; sizes tuned per script in styles.css
  (`.level-badge.num-*`). World History + United States stay Western digits.
- **Mobile** (`@media max-width:640px`): page content is centred (`.page-head{text-align:center}`) and **the top
  bar is hidden outright** — see the next bullet.
- **The bottom tab bar (`.tabbar`, phones only — Aug 2026, on request).** The top bar held NINE icon-only
  controls in a scrolling strip at the top of a 390px screen — the four destinations plus theme, edit,
  account, settings and language — all out of the thumb's arc and none of them named. **Every destination
  now lives in the bottom bar** (home / map / account / settings — **not admin, not decks and not mission**,
  see below), and light-dark
  and the language picker moved to the **Settings page**, which leaves the top bar with nothing on it at
  all: `.topbar{display:none}` on a phone, and **`--bar-h` goes to 0px** there so `.globe-stage` and every
  other rule already written against it follows with no change of its own.
  It is **static markup in index.html** and reuses `.tab` + `data-route`, so
  `setActiveTab` and the boot-time `querySelectorAll(".tab")` wiring cover it with no new code — but note
  that same query runs ONCE over the static DOM, so a nav item added later still has to live in index.html.
  **Edit is NOT in this bar** — it left it the same week (Aug 2026, on request) for the top-right button
  described below: the editor is one person's tool and it was taking a seventh of a row six readers share.
  **Nor is COLLECTIONS** (`#decks`, Aug 2026, on request): it is reached from the home page's `.rv-lip`
  instead, which is why nothing in the bar is active there — that page is not one of the bar's destinations.
  **The page swipe stopped reaching it too** (Aug 2026, on request), for the same reason and a fortnight
  later: a gesture that lands a reader on a page the bar cannot reach leaves them somewhere with nothing lit
  to say where they are. The lip is the only route now.
  (The tab labelled **Library** is the books one, `#library`, which is a different page — see the Library
  bullet. Two pages called Library was exactly the confusion the rename settled.)
  **Nor About**, which left the same way a week later (Aug 2026, on request) for the `.home-about` line at the
  foot of the home page — a page read once, against a fifth of a row four readers share. `#mission` is
  therefore the second route with nothing marked in the bar.
  `applyMode` still hides `.tab-admin` with `querySelectorAll` rather than `querySelector`, because the
  entry point can exist more than once and the old form would have left a second copy live for every
  visitor. The bar is a **flex row of `flex:1 1 0` cells**, not a fixed column count, so a tab hidden or
  added closes the gap on its own. At that width the label
  may not wrap (a second line pushes the icons off centre), so it is `nowrap` + `text-overflow:ellipsis` at
  8.5px — `test-layout.js` asserts each label's rendered width against its own `scrollWidth`, so a longer
  name added later fails there rather than silently clipping.
  **The label rule is written `.tabbar .tab .tab-label`, and the descendant `.tab` is SPECIFICITY, not
  decoration** (Aug 2026, on a bug report): the top bar's `.tab:hover .tab-label` / `.tab.active .tab-label`
  open the label beside the icon with `margin-inline-start:8px`, and at two classes against three this rule
  lost to them whatever the source order — so the SELECTED tab, and only that one, drew its name 4px right
  of the icon it sits under. One tab misaligned out of five looks like a design, not a bug, which is why
  `test-layout.js` now measures every tab's icon centre against its label's, active included.
  Every tab is labelled here (the top bar's labels unfold on hover, and a phone has no hover). Hidden while
  `body.grading`: the grade bar owns that edge, and a session is a place you finish rather than browse from.
  **The editor's way in is `showAdminEditBtn(cardId)`** (`.admin-edit-fab`), a button on the page rather
  than a nav tab. Called with a card id from the study page — it opens THAT card in the editor — and with
  `null` from the home page, where it just opens the editor; the plain variant carries `.aef-plain` and is
  **phone-only**, since above the breakpoint the top bar's Edit tab is still there and a second way in
  beside it is clutter. On a phone both sit **top-right** (`right:12px`, `top:10px + safe-area-inset-top`);
  on a desktop the study card's copy stays bottom-left as it always has.
  Two things bit here. It is **admin-gated inside the function**, not by the caller — it used to be built
  unconditionally on every study card, so a signed-out reader got an Edit button that bounced them home.
  And its phone rules must live **BELOW** the base `.admin-edit-fab` rules in styles.css: media queries add
  no specificity, and the `bottom:calc(var(--tabbar-h) + 16px)` that used to sit up in the tab-bar block was
  silently overridden by the base `bottom:24px` further down and never applied at all.
  **Three custom properties keep everything anchored in step**: `--tabbar-h` (0 above the
  breakpoint, 58px below), `--timebar-h` (96px, 118px once the Atlas timeline goes to two rows) and
  `--bar-h` (60px, 0 below the breakpoint).
  `.globe-stage` and `.atlas-timebar` are each written ONCE against them rather than restated per
  breakpoint — which is how their old hard-coded `96px`/`118px` pair would have drifted apart the moment a
  third bar appeared. `.stage`, `#toast` and `.admin-edit-fab` take the same offset.
- **The whiteboard marker is DRAGGABLE anywhere on screen** (`wbMakeDraggable` / `wbApplyPos`, beside
  `ensureWBTools` — Aug 2026, on request). It is a fixed control floating over a card the reader is trying to
  read, and its default corner is exactly where some cards put the thing you want to look at.
  · **`WB.enabled` (the pen is down) and `WB.panelOpen` (the tools are showing) are TWO states**, and were
    one until Aug 2026, when putting the tools away also put the pen down — you could not draw with the
    panel out of the way, which on a phone is most of the card. The marker button now only opens and closes
    the panel (opening it with nothing selected picks the pen, so one tap still gets you drawing); what puts
    the pen down is **unselecting the tool inside it**. The tools are mutually exclusive and clicking the
    selected one deselects it, so **nothing selected IS the pen-up state** —
    which is what makes that gesture available at all. `applyWBState` maps `panelOpen` → `.active` and
    `enabled` → the button's `.on` (visible with the panel shut) plus the canvas; **`wbSetEnabled` is the
    one place `enabled` changes**, because the Atlas owns its own cursor / hover / spin state and has to be
    told through `WB.onToggle` the moment the pen goes down or up.
  · **The handle is the toggle button itself** — there is nothing else to grab — so every press has to be
    classified: under `WB_DRAG_SLOP` (5px) it stays a click and toggles drawing, past it the drag takes over
    and the click that pointerup fires afterwards is swallowed by the `wbDragged` flag, which the toggle's own
    click handler checks and clears. `pointerdown` resets it, so a cancelled drag can't swallow the next real
    press. The handle carries `touch-action:none`, or the browser claims a finger drag as a page scroll before
    `pointermove` ever arrives.
  · **The element is positioned by `right`/`bottom`, never `left`/`top`**, and is exactly the 46px button:
    `.wb-panel` hangs off it **absolutely** rather than sharing a flex column with it. Both follow from the
    drag — with `left`, opening the panel would shove the button sideways, since the panel is wider. Out of
    flow, the panel only has to be told which way to open: `.wb-flip` when there is no room above,
    `.wb-left` when there is none to the left (`WB_PANEL_W`/`WB_PANEL_H` are rough sizes used only for that
    choice — the panel is `display:none` when shut, so it cannot be measured).
  · **The position is device-local** (`localStorage["folio_wb_pos_v1"]`, not in `S` and not synced — where a
    control sits on a screen is a fact about that screen) and **clamped on every apply and on resize**, so a
    position saved on a wide window cannot strand the marker off the edge of a narrow one. With nothing
    stored the inline styles are cleared, which is what lets `.on-atlas` and `body.grading`'s offsets take
  · **There is no Draw button: the three SIZE buttons ARE the pen** (Aug 2026, on request). Clicking a size
    picks the pen at that width and clicking the width it is already down at lifts it, which is why the size
    buttons carry **two** marks — `.sel` for the width in use (true under Mark and Erase too, which are drawn
    at that width) and `.on` for the pen being down at it. While Mark or Erase is the active tool a size
    click only sets that tool's width: taking the tool out from under a reader mid-mark is not what a width
    control does. Panel order is `[colours] / [sizes] [Mark] / [Erase] [Clear] / [Undo] [Redo]`.
  · **The custom colour** (`wbReadCustom` / `wbSaveCustom`, `localStorage["folio_wb_custom_v1"]`) is **one per
    palette** (a highlighter yellow is not a pen colour) and device-local, like the position. It is chosen in
    an **inline picker of the ordinary shape** — a saturation/brightness field over a hue bar with the hex
    beneath (`.wb-pick`, `wirePickField`, `hsvToHex`/`hexToHSV`; Aug 2026, on request). It was an
    `<input type="color">` laid over the swatch, whose platform dialog on a phone is a full-screen "Select
    color" sheet of sliders covering the very card being annotated. Four things hold it up:
    · it is **its own `.wb-row` inside the panel**, not a popover — the panel is already a floating box that
      decides which way it opens, and a second one inside it would have to decide again;
    · **`.wb-pick[hidden]{display:none}`** is required, `.wb-row`'s author `display:flex` beating the UA rule
      (codebase convention, cf. `.ces-imgpanel`);
    · the picker keeps **its own HSV**, never re-derived from the hex on each move: at `v=0` or `s=0` a colour
      has no recoverable hue, so a reader dragging into the black corner and back would come back red. Hence
      `pickDrag`, which is what stops the re-render `useColor` triggers from reseeding it mid-gesture;
    · both fields need **`touch-action:none`**, or a finger drag is claimed as a page scroll before
      `pointermove` ever fires, and the knobs are `pointer-events:none` so a press lands on the field.
    Guarded by `test-layout.js`, which asserts there is no `input[type=color]` left anywhere in the panel.
  · **Controls under the ink stay usable** (the `CTL_SEL` / `controlUnder` / `passCtl` block in
    `setupWhiteboard`, Aug 2026, on request). The canvas covers the whole visible page, so with the pen down
    it also covered Show answer and everything else on the card. **A z-index cannot fix this**: `.page` and
    `.cardwrap` both animate with a fill mode, and a filling animation is a stacking context, so nothing
    inside them can paint above a sibling of the stage. Instead the canvas hit-tests underneath itself on
    pointerdown (`pointerEvents:none` → `elementFromPoint` → restore) and hands the press to any real control
    it finds, activating it on pointerup only if the finger is still on it. **`preventDefault` on the
    pointerdown is what makes that necessary** — it suppresses the compatibility click, which would otherwise
    land on the canvas. `CTL_SEL` is deliberately real controls only (`button, a[href], input, select,
    textarea, summary`) and **not** `[role="button"]` or anything focusable: a background is full of glossary
    links and its picture is a `role="button"` figure, and drawing over a word means drawing over it.
    (The grade bar itself never needed this — it is `z-index:60` against the canvas's 40, in the root
    stacking context — but it is asserted anyway, since nothing on screen says which of them is which.)
  · **On a phone the default corner clears the bottom bars**: `bottom:calc(var(--tabbar-h) + 12px)` on the
    study page and `calc(var(--tabbar-h) + var(--timebar-h) + 10px)` on the Atlas, where it also steps to
    `right:62px` — the zoom column (`.globe-zoom`, 34px wide at a 16px inset) holds that same corner, and
    the marker landed exactly on its `?`. A stored drag position still overrides both.
    Guarded by `test-layout.js`: a marker that cannot be moved and one that turns drawing on
    every time you move it are opposite failures, both silent.
    `test-layout.js` also guards the phone's **page SWIPE** (Aug 2026) — and guards as hard against what
    must NOT navigate as against what must, since a false positive TAKES A PAGE AWAY: a short drag, a
    diagonal (a scroll that wandered), the ends of the order, and the ATLAS, which is excluded outright
    because a drag there turns the globe. The gesture is dispatched as real `PointerEvent`s rather than
    through `page.touchscreen`, because the handler is on `document` and keys off `pointerType`.
    It also asserts that **`SWIPE_ORDER` IS the tab bar minus the Atlas** — read off the bar rather than
    off a list written into the test, so a tab added or removed later fails on the rule rather than on a
    stale copy of it, and Collections cannot creep back in — and that the transition is a real **slide**,
    measured MID-FLIGHT (the finished state of a slide and of a cut are the same page in the same place, so
    an assertion made after it settles would pass on a hard swap for ever): the ghost exists, the incoming
    page is a whole width off to the side rather than nudged, the stage is clipped while they travel, and
    both are cleaned up after.
    And the Atlas sheet's **content-fitted ceiling**: it opens no taller than the page in it needs, a drag
    upward stops at the content rather than at the top of the screen, and a swipe to a shorter page shrinks
    it — measured as the SLACK between the scroller and the pane inside it, which is exactly the "empty
    space at the bottom" the request names.
- **Reduced motion:** styles.css ends with a **global killswitch** — `@media (prefers-reduced-motion:reduce){ *,*::before,*::after
  { animation-duration:.001ms !important; animation-iteration-count:1 !important; transition-duration:.001ms !important; } }`.
  It covers every CSS animation and transition in the file (entrance animations land on their end state), so a new one usually
  needs no extra handling — only add a targeted override when the *end* state is wrong (e.g. `.lu-conf`/`.lu-burst` are
  `display:none`, the gold tile shine is `animation:none`). What it **cannot** reach is JS-driven motion, which must be gated
  by hand: `prefersReducedMotion()` (module-level, read live so the OS setting can change mid-session) covers `render()`'s
  smooth `scrollTo` and the home mini globe; inside the Atlas closure the same check is cached as `REDUCED`, gating
  `pulseChanges`, the era crossfade and `flyTo`'s duration. Globe drag inertia is deliberately left alone — it's the
  continuation of a direct gesture, not decorative motion.
- **FLIP — animating a layout change CSS cannot transition** (`flipMove` / `flipHeight`, beside
  `prefersReducedMotion`; Aug 2026, on two reports of hard cuts). CSS transitions a PROPERTY; it cannot
  transition a REFLOW. Move an element between two grid areas or reorder two siblings and it is simply in
  the new place on the next frame — which is what the grade bar's fold and the Timeline game's drag both
  looked like, and a hard cut does not read as fast, it reads as broken. `flipMove(els, mutate, opts)`
  measures where everything is, runs the mutation, and animates each element from its old paint position
  back to its new one; `flipHeight(el, mutate)` does the same for a container's content height, which is
  not an animatable value on its own. **`Element.animate`** — the Web Animations API, part of the platform,
  off the main thread, no dependency. Three deliberate choices: **scaling is opt-in** (`opts.scale`), since
  scaling a button squashes the text in it and a translate-only FLIP over an element whose SIZE is
  transitioned in CSS looks better than either alone; an element that has not moved is **skipped**, so
  calling it over a whole list costs nothing for the rows that stayed put; and `composite:"add"`, so it
  layers over a transform the element already has rather than replacing it. Both helpers gate on
  `prefersReducedMotion()` internally, so no caller has to. Used by `gbSetCompact` and by the Timeline
  game's drag and arrows — **reach for it rather than adding a transition that cannot fire.**
- **Atlas:** an orthographic Canvas-2D globe (drag to rotate, wheel/pinch zoom, **on-screen `+`/`−` buttons (`#gzIn`/`#gzOut`,
  `.globe-zoom`) + keyboard `+`/`−`** via `zoomStep()`; `ZMIN 0.82 … ZMAX 10`). Zooming scales the disk
  radius (`R = baseR·zoom`), so the globe fills the screen by ~zoom 2.1 (`R ≥ dist(centre,corner)`). The **wheel-zoom listener is
  bound to `window` in the CAPTURE phase** (`onGlobeWheel`), not to the canvas — some hosts (e.g. the Claude Code live preview)
  route `wheel` to a scroll container / parent rather than the canvas, so a canvas-only listener never fired there and scroll-zoom
  looked dead. Catching it at window+capture and acting only when the pointer is over the globe stage (with `stopPropagation` so
  the host can't also scroll its pane) makes scroll work wherever the event reaches the DOM at all. The **on-screen `+`/`−` buttons
  + keyboard `+`/`−`** (`zoomStep()`) remain as a fallback for any host that swallows wheel entirely before the DOM sees it.
  (Also re-runs `resize()` on `devicePixelRatio` changes so page-zoom / DPI changes don't leave the canvas at a stale resolution.)
  The wheel handler **normalizes `e.deltaMode`**
  (a line ≈ a 33px notch, a page ≈ the viewport) and uses a punchy factor so a few notches fill the screen — without this,
  line/page-mode mice barely zoomed and the globe seemed stuck at a fixed size (the "broken zoom"). The wheel zoom is
  **zoom-to-cursor**: it captures the lon/lat under the pointer (`screenToLonLat`), applies the zoom, then nudges
  `rotLon`/`rotLat` by `(before−after)` so that same geographic point stays under the cursor (recentering the globe on
  where you point, rather than always zooming to the disk centre).
  The Claude Code preview webview does **NOT repaint the `<canvas>` after a `preventDefault()`'d wheel gesture** (the draw runs and
  `zoom`/`R` update, but the pixels stay frozen — discrete clicks and a window-resize DO repaint). Fix: while a wheel gesture is
  active (`wheelActive`, set in `onGlobeWheel`, cleared in `settle()`), `draw()` calls `forceComposite()`, which **reallocates the
  canvas backing store** (toggles `canvas.width` by 1 device px, imperceptible) — the same thing a window-resize does, forcing the
  host to re-rasterize+composite. Gated to wheel gestures so drag/idle keep the fast (no-realloc) path. Don't use a CSS transform
  nudge for this — it promotes the canvas to a layer that onion-skins old frames into gold ghost rings. See the
  [[wheel-zoom-deltamode]] memory (incl. the gotcha that `preview_eval` hits a different browser than the user's panel).
  The Atlas **opens centred on the scholar's home location** — `atlasView` (the persistent rotLon/rotLat/zoom) is initialised from
  `S.settings.home` (`{ name, lon, lat }`, **default the Netherlands**; back-filled on load for older saves). Change it in
  **Settings → Home location**, a country `<select>` (`.set-sel`) built from `window.WORLD_GEO` names; picking one stores the
  largest-ring bbox centre via `countryCenter(name)` and re-centres `atlasView` (zoom reset to 1). Home lives in device settings,
  not the synced account record.
  Full-bleed between the top nav and a fixed bottom timeline (1000 BCE → present). **The timeline rail is
  NON-LINEAR** (`year2frac`/`frac2year`, exact inverses used by every rail position — pin, fill, ticks, marks): the
  map-less 1000 BCE – 1500 CE span compresses into the left `TL_KNEE_F = 15%` and 1500 → present stretches over the rest.
  The `.tl-mark` map-year ticks are **focusable buttons** (click = jump, title/aria-label = "1500 CE — <era label>").
  **The rail gets its own row on a phone** (≤560px, Aug 2026): one flex row could not hold a play button, a
  ~170px year box AND the rail, so at 390px the rail was squeezed to about **70px** — which is why its five
  year labels piled into an 80px band as an unreadable smudge and stopped lining up with the marks they
  annotate. The timebar becomes a two-row grid (`"play year" / "rail rail"`) and `--timebar-h` goes to 118px.
  **`layoutTicks()` then thins the labels to the ones that fit**: they are positioned off the same
  `year2frac` as everything else, so a colliding label is DROPPED rather than nudged — moving one off its
  year would make it a lie. The two ENDS are always kept (they are what fixes the scale), so an inner label
  must clear both its left neighbour and the right anchor; it re-runs from `resize()`, and it has to unhide
  everything before measuring because a hidden element has no width.
  A **plate-title cartouche** (`#mapCartouche`, top-centre, hidden ≤640px, updated by `paintYear`) shows "THE WORLD ·
  1938" / "THE WORLD TODAY". The disk gets **limb shading + an atmosphere halo** as **two DOM layers, NOT canvas
  gradients**: `#globeHalo` (below the canvas) + `#globeShade` (above it, `z-index:1`), radial-gradient divs sized to
  the disk by `updateLimbDom()` each draw (style-update only, keyed so it no-ops unless the disk moved) and tinted by
  `paintLimbDom()` (colours `limbA/limbB/haloIn/haloOut` from `readColors`; re-applied by the theme observer). They
  were canvas gradients once, gated to settled frames — a limb-sized gradient shifting per frame is exactly what some
  hosts onion-skin into a page-wide gold bloom (the "everything turns gold" bug) — but that made them vanish during
  every drag/zoom; as GPU-composited DOM they are **always visible** and give the compositor artifact no fuel.
  `drawLimb()` now draws only the rim stroke. **Hovering names the entity under the cursor** via a **DOM chip**
  (`#globeHoverName` / `updateHoverName()` — deliberately NOT canvas: following the cursor is a style update, so the
  canvas only redraws when the hovered ENTITY changes, never per-move; on a geo era it shows "empire · territory" via
  `.mother`/`empireName`; hidden while dragging / map-editing / whiteboard-drawing and on touch (`@media (hover:none)`);
  `settle()` re-derives `hoverIdx` from the recorded `hoverPx/hoverPy` after a drag/coast/zoom so the tag and hover fill
  are never stale under a stationary cursor). **`eraLabelAnchors` caches on `_htId` AND `mapEditRev`** — mapBump() only
  nulls `_htId`, which `histTerr()` refills with the same era.id, so without the rev key editor edits kept stale labels.
  An **atlas search box** (`#globeSearch`, top-right) typeaheads over present-day countries, every era's territories and
  all capitals (index built lazily by `gsIndex()`, folded case/diacritics, rebuilt when `mapEditRev` changes; a territory
  sharing a present-day name folds into one row spanning its years). Picking a result keeps the current year when the
  entity exists there, else jumps to the present (if listed) or the entity's earliest era, then **flies the globe**
  (`flyTo` — easeInOutQuad rotLon/rotLat/zoom over ~0.7s) and selects it + opens its popup (capitals just fly close
  enough for the pin label, no popup). The fly is cancelled by pointerdown / wheel / `zoomStep` / `setYear` (so timeline
  navigation mid-flight aborts it) / `cleanupGlobe`; the landing selection runs ~90ms after touchdown via a **tracked**
  `flyDoneT` timeout and re-checks `eraKey(year)` against the era it took off for, so it can never resurrect a
  selection on an era the user navigated to meanwhile. The dropdown's `.gs-results[hidden]{display:none}` override is
  required (author `display:flex` beats the UA hidden rule — codebase convention, cf. `.country-pop[hidden]`).
  **On a phone the search and the legend are CHIPS** (≤640px, Aug 2026): open, they covered the whole
  top-right of a 390px screen — the map — before the reader had asked for either (the legend alone is
  126×196). The search collapses behind `#gsToggle` and expands across the full width of the stage when
  tapped (a 38vw field fits about four characters), and the legend starts `collapsed` there and shrinks to a
  34px round chip, reusing the collapse toggle it already had. `.gs-toggle{display:none}` is the desktop
  base rule and the phone block **must come after it in source order** — media queries add no specificity,
  so the base rule silently won when the block was placed first, and the chip never appeared.
  The `.globe-hint` ("drag to rotate · scroll or +/− to zoom") is hidden under `@media (hover:none)`: it is
  written for a mouse.
  **Change-over-time features (batch 2):** `terrOf(era)`/`ownerAt`/`ownerIdxAt` are the cross-era lookup (per-era.id cache
  `_terrCache`, cleared by `mapBump` + the groups→geo materialization in `enterMapEdit`; smallest-bbox tie-break so enclaves
  beat their surrounder, like `countryAt`). Stepping ONE map-year pulses the territories that changed hands (`pulseChanges` —
  each new-map label anchor sampled against the old era's owner; anchors carry their territory index `i` because names are
  NOT unique — 1900 has 35 "Fiji" polygons; skipped while `tlDrag`, throttled 450ms for chevron-holds, skipped on eras with
  >320 territories, and under `prefers-reduced-motion` (`REDUCED`)). Era changes **crossfade** (~280ms — `fadeCv` snapshot in
  `setYear`, composited with falling alpha in `draw()`, killed by `startMotion`/`tlDrag`; the settled base cache is snapshotted
  BEFORE overlays, so pulse/fade never leak into `baseCv`). A **play button** (`#tlPlay`) auto-steps the mapped years every
  2.4s (`_playStepping` flag; any user-driven `setYear` AND any search pick calls `playStop` — a pick on the current year has
  no setYear, and a later tick would cancel its flight mid-air). The info panel gained a **drill breadcrumb** (`#cpCrumb` —
  parent = the empire via `.mother`, or `ownerAt(popPointLL)` for drilled countries/UK constituents; clicking climbs back up),
  **"Through the ages"** (`#cpHistory` — `ownerAt(popPointLL)` across all mapYears, consecutive runs collapsed; a row click
  jumps + re-selects **by point, not name** via `selectEntityByName(name, atLL)`). Both read **`popPointLL`** — the click
  point / search anchor, the GEO label point `c` and NOT the bbox centre, which can land in a neighbour.
  A **Copy link** chip sat beside them and was **removed on request (Aug 2026)**; `popEntityName`, which was only ever
  read to mint one, went with it. The **`#map/<year>/<slug>` deep links themselves are untouched** and must stay so —
  every link already shared points at one. They are parsed at boot + hashchange by `parseMapHash` (`decodeURIComponent`
  is try/caught so a mangled %-escape can't kill boot; the consumer resolves territory names, then EMPIRE names via
  `.mother`, then drilled present-day countries (`subSelGeo`), then UK constituents (`subSelUK`)), and
  `test-layout.js` loads one, because nothing on screen says they still work. Unclaimed land on historical eras gets a
  **terra-incognita stipple** (`stipplePattern()`, theme-aware via `stippleCol`, drawn settled-only under the claimed-land
  refill so it survives only on wilderness).
  **CITY LABELS THIN OUT WITH ZOOM, Google-Earth style (Aug 2026, on request).** Turning Cities on used to
  put a label on EVERY city in view: a name that would not fit cleanly got a leader line and, failing that,
  was FORCED into its last candidate slot, so below "one country fills the screen" the map was dozens of
  overlapping names and 2,665 label placements per settled frame. Two rules replace the forced placement
  (`CITY_SEP` / `CITY_CAP` above `computeCityLayout`): **`CITIES` is already sorted by significance** —
  capitals by population, then cities over a million, then division capitals — so a city whose pin lands
  within `sep` px of one already placed is dropped WHOLE, and `sep` shrinks with zoom (88px at the globe,
  22px zoomed right in), which is what reveals the crowded-out names a level at a time; and **a label that
  cannot be placed without overlapping is dropped rather than forced**. Both drops take the PIN with them —
  a pin and its name are one thing (the same reason the whole layer waits for the settled frame), and a
  field of anonymous dots was rejected before. The separation test runs BEFORE the 34-candidate label
  search, which is where the lag went. `drawEraCities` runs the same rule, with the map EDITOR exempt: its
  pins are what a click is dragging.
  **The Heightmap layer's STRENGTH is the reader's** (`hmOpacity` / `setHmOpacity` / `#hmOpacityRow`, Aug
  2026, on request): a slider in the legend, under the row that turns the layer on and shown only while it
  IS on. It is applied as `globalAlpha` at the blend rather than baked into the reprojection buffer's
  per-pixel alpha, so moving it is a redraw and not a re-reprojection — and **`viewKey` carries it**, or the
  settled base cache would keep serving the old strength. Device-local
  (`localStorage["folio_hm_opacity_v1"]`), like the marker's position and the place sheet's height.
  **A GLOSSARY TERM CAN PUT ITSELF ON THE MAP** (`glossPlace` / `focusPlace` / `focusPoint`, Aug 2026, on
  request). A term the Atlas can show carries a map-marker button beside the × in its popup; pressing it
  closes the popup and routes to `map` with `{ focus }`. Two shapes and no third:
  · a term naming a **country** the map draws is flown to and **lit up** in the map's own gold — the ordinary
    selection paint plus the change-pulse — with **no info panel**, because the reader has just read about it
    and asked where it is, not for a second description;
  · a term naming a **point** (a cave, a gorge, a named region) gets a **gold dot and its name**, plus the
    expanding ring, and is drawn ONLY while focused. Most of these are not cities and have no business
    cluttering the map for someone who came to look at something else — but they ARE added to the atlas
    search index as kind `site`, so the place is findable by name and picking it focuses it the same way.
  Both land on `sfx("discover")` after the flight, and both are cleared by Esc and by the next click on the
  ocean. **The join is done at BUILD time** by `.claude/fetch-place-coords.js`, which writes two tables into
  glossary.js: `GLOSSARY_PLACES` (slug → `[lon, lat]`, **fetched from each article's own published primary
  coordinate**, never hand-written — a term whose article has none simply gets no marker) and
  `GLOSSARY_MAP_COUNTRY` (slug → the name world.js uses, with a short alias table for the ones the two spell
  differently). It is a build-time join because **world.js is a lazy 1.6 MB bundle and the popup has to
  decide whether to show its marker without it**. A continent, an ocean or a vague region is deliberately in
  neither table: it is not a place you can point at.
  **Frame-cost rules (smoothness batch, July 2026) — keep these when touching the render path:**
  · **Coalesce input renders.** `onGlobeWheel` calls `scheduleDraw()` (one render per rAF), EXCEPT right after its paced
    `forceComposite()` realloc, which needs a synchronous `draw()` (the realloc clears the backing).
  · **Borders are PRE-CHAINED, not per-edge.** `histTerr()` builds `_htRuns` = `{r0, r2}`, maximal same-mask polylines
    (rebuilt per era; entries reference the ring vertex arrays so editor vertex-drags flow through). The render strokes
    runs — never re-walk masks per frame — and skips the `'2'` pass when `r2` is empty (all geo eras).
  · **Cull before projecting.** Coast chains have bounding caps (`coastCaps()`, the `ADMC`/`cullHidden` pattern); the
    coast pass skips chains behind the horizon or off-screen. Any new global layer should get the same treatment.
  · **`_wild` is geo-eras-only.** Merger (groups) eras claim every country, so the wilderness pass is skipped entirely.
    Accepted delta: merger-era coasts lost a sub-pixel dark `landWild` seam fringe (an artifact of that pass).
  · **The wilderness pass COMPOSITES, it does not clip** (`landLayer()` / `landCv`, the `_wild` branch — the fix that
    made 1500–1938 as smooth as the present-day map, July 2026). Dark land, stipple and the claimed-land refill are
    painted into a transparent offscreen layer whose later passes run under `globalCompositeOperation = "source-atop"`,
    so they reach land pixels and nothing else; one `drawImage` puts the layer on the globe. The old path filled all
    117k GEO vertices dark, filled them again with the stipple pattern, then built a clip out of every era-territory
    ring and filled + stroked all 117k a third and fourth time inside it — **four world-sized passes where the
    present-day map does one, each of the 258 fills rasterized against a 20–45k-vertex clip mask.** Under the composite
    the stipple needs no geometry at all (one `fillRect`) and the refill is one territory-sized fill. The claimed fill
    is followed by a `stroke()` of the SAME path so a claimed coast keeps its light edge over the dark base's own
    stroke — drop that and every coast grows a dark hairline. `landCv` is freed on present-day/merger eras and in
    `cleanupGlobe`, so only a geo era pays for the buffer. **Never reintroduce a per-frame `ctx.clip()` over
    world-scale geometry** — that, not the vertex count, is what made the older maps unusable.
  · **Motion frames are cheaper on purpose.** While `moving`: the whole city layer is skipped (`drawCities` and
    `drawEraCities` return at the top), selection glows drop `shadowBlur`, and the selection's gold COASTLINE
    (`strokeCoastClipped`, two more clips + a scan of every coast chain in the region) is skipped — the fill is still
    clipped to the land, so only the bright coast edge waits for the settled frame. Everything returns when settled.
    **A pin and its name go together** (changed Aug 2026, on request): the label layout is a spatial grid plus
    thousands of short-lived rect arrays per frame and can only run on the settled frame, but drawing the PINS
    anyway left a field of nameless dots through every drag and zoom. The map editor is the one exception —
    `drawEraCities(era, editable)` still draws while `editable`, since those pins are what a click is dragging.
  · **A selection paints as ONE batch** (`paintFillGroups`; `paintFillRings` is now a single-group wrapper). A click on
    a geo era selects a whole EMPIRE — dozens of territories — and painting them one at a time meant one GEO-derived
    clip mask, one coastline scan and two full Gaussian `shadowBlur` passes **per territory, per frame**: dragging with
    an empire selected cost ~4× dragging with nothing selected, and was the likeliest source of the browser hanging.
    Batched, the whole selection shares one clip (bbox- **and** `cullHidden`-filtered, or a world-spanning empire drags
    the far side of the globe into the mask), one stroke path and one coast pass. Fills stay per-entity so ring holes
    survive.
  · **The selection overlay is cached.** `drawSelectionOverlay()` renders selSet/subSelGeo/subSelUK once into `selCv`
    (key = `baseKey` + selection ids) and blits it, so pulse/crossfade rAF frames never re-blur dozens of territories;
    motion frames paint direct. It temporarily reassigns `ctx` (hence `let ctx`) — restored in a `finally`.
  · **Reuse buffers, release big ones.** `drawHeightmap` keeps one `_hmId` ImageData per size; `fadeCv` frees its
    backing when the crossfade retires; `selCv` frees when nothing is selected.
  · **Heightmap grays live on `window.__folioHM`, NOT in the page closure** — the loader frees the multi-MB data-URI
    (`window[L.vn] = null`) and zeroes the decode canvas, so the extracted grays are the only surviving copy; per-mount
    state would force a script re-inject + re-decode on every Atlas revisit.
  · **The idle warm must never fire mid-gesture.** `coastEdges()`/`worldEdgeOwners()` (~1.3s combined) are warmed after
    mount via `requestIdleCallback`, but the callback **reschedules itself while `moving || dragging || ptrs.size ||
    flyRAF || playT || mapDragging`** — an rIC timeout landing during a drag would freeze the globe under the pointer.
  **Game mode + approachability (batch 3):** `PAGES.findit` routes to `PAGES.map(root, {game:true})` — the **"Find it"
  daily minigame** plays on the real globe (`const GAME` gates everything): 5 date-seeded rounds from
  `buildGameRounds()` (2 present-day countries, 2 historical territories, 1 capital; **one seeded RNG stream PER pool**
  so intraday data changes can't reshuffle the day; a `used`-names Set dedupes targets across rounds; quality gates =
  bbox area + `countryDesc` exists + an ETHNO name regex). Taps route to `gameTap` (countryAt name match, or
  haversine ≤300 km for capitals) — a wrong pick **flashes RED and opens ITS info panel** (`GAME_RED` via the shared
  `pulseCol`; a miss still teaches), one retry with a km-distance hint, then `gameReveal`: **GREEN pulse when found,
  gold when missed**, over ALL same-named polygons (capitals get a **geo-anchored `pulsePin` ring** since the fly alone
  is cancellable), and the **answer's info panel opens** (capitals → the owning state via `ownerIdxAt`). The country
  popup is therefore NOT in the `.atlas-game` hide list — it is the game's learning surface; `gameShowRound` closes it
  per round. `pulseCol` resets to gold wherever pulses fire outside the game (`pulseChanges` does). Scoring: first-try
  finds; `won` needs `n >= 5` AND all first-try; `gameEnd` → `markGamePlayed("findit", …)` + `save()` +
  `checkAchievements()`. **Anti-cheat gating**: `.atlas-game` CSS hides search/legend/hover-chip/hint, game mode
  **forces `citiesOn`/`majorCitiesOn`/`countryNamesOn` false** (a capital label on the board IS the answer), the timebar
  is **`inert`** (not just pointer-events:none — buttons stay keyboard-focusable otherwise) + `stepYear`/`playTick`
  carry GAME guards, and the whiteboard never mounts. **Same-day replays are PRACTICE** (`gamePractice` — playable,
  never records: the rounds are deterministic and every answer was revealed). The Atlas also gained **first-visit coach
  marks** (`#atlasHelp` overlay, auto-shown once via `localStorage["folio_atlas_tour_v1"]`, reopened by the `#gzHelp`
  "?" button) and **keyboard navigation** (canvas `tabindex=0`: arrows rotate, Enter selects/answers at the disk
  centre, Esc clears, `[`/`]` step map-years). The **`#gzIn`/`#gzOut` zoom buttons' markup was restored** (wiring + CSS
  existed but the DOM had been lost in an old refactor); the `.globe-zoom` column now sits **bottom-right** — at
  top:50% it collided with the (top-right) legend on short viewports. Clicking a country
  (present-day or a historical era's territory) highlights it and shows a single info popup above the
  timeline — its name + a 5-sentence description from `countries.js`; one at a time, cleared on a second
  click / ocean click / era change. The popup is a **vertical panel on the LEFT of the stage** (the base `.country-pop` rule:
  `left:clamp(16px,4vw,40px); top:16px; bottom:16px; width:min(360px,…)`, single-column `.cp-cols`) — the legend moved to the
  **top-right under the search box** (`.globe-legend{right:…; top:60px}`) to free the left edge. On **≤720px** it reverts to a
  **bottom sheet**. In both layouts it is `display:flex; flex-direction:column` and its
  **`.cp-cols` scroll internally** (`overflow-y:auto; min-height:0`) so the box never pushes the absolutely-positioned
  **`.cp-close` (×) off screen** — the × stays pinned while the columns scroll. Don't put `overflow` on
  `.country-pop` itself (the × would scroll off). **The scroller is reset on every populate**
  (`showCountryPopupName` sets `scrollTop` AND `scrollLeft` to 0) — the popup element is REUSED, so without it the
  next place opens wherever the previous one was left: however far down it on the desktop panel, and however far
  ACROSS on the phone.
  **Its parts each fold** (`.cp-sec` + `.cp-sec-head`/`.cp-sec-body`, one delegated click listener on
  `#countryPop`): the description, the year paragraph (whose header IS the year number, so it still reads while
  shut), the figures grid and the sources. `cpSection(sec, hasContent, alwaysPane)` sets each one as the popup is
  filled — **open when it has something, closed when it doesn't**, so a place with no year paragraph and no
  figures shows two quiet headers instead of a dash and a grid of dashes. That **resets per entity**: a reader's
  manual toggles belong to the popup they were made in, not to the next country.
  **On a phone those sections are PAGES, not folds** (Aug 2026, on request). The sheet is short and four stacked
  sections buried the figures three scrolls down, so at ≤720px `.cp-cols` becomes a `flex-direction:row`
  `scroll-snap-type:x mandatory` scroller whose `.cp-sec` children are each `flex:0 0 100%`, swiped between one
  page at a time. Three things follow from that and are load-bearing: **the title block lives in `.cp-head`,
  OUTSIDE the scroller** (it was `.cp-main`, inside it, and would have slid away with the first swipe, leaving the
  figures unlabelled); every page renders **expanded** and the head is inert there (`cpPagerOn()` makes the
  delegated fold handler return, so a tap can't write `srcCollapsed` either) since there is nothing under a page
  to uncover by shutting it; and an EMPTY section is **dropped from the run** (`cp-blank`) rather than collapsed,
  so a swipe never lands on a dash — except the description, which passes `alwaysPane` because it carries a "no
  description yet" line and is **the page every place must open on**. `#cpDots` is the pager (built by
  `cpSyncDots`, followed by `cpActiveDot` on scroll, and a tap on one turns to that page); it is hidden outright
  in the stacked layout, and `cpResize` rebuilds it when a rotation crosses the breakpoint.
  **A swipe may never move more than ONE page** (Aug 2026, on a bug report: a hard flick carried from the
  description straight to the figures, skipping the year paragraph). `mandatory` only says WHERE a scroll may come
  to rest; **`scroll-snap-stop:always`** on `.cp-sec` is what forbids passing a snap point within one gesture,
  momentum included, and is the real fix. **`wireOnePageSwipe(el)`** (beside `animateProgs`; it was shared with
  the home pager, which no longer exists) is the net under it for engines that lack the property: it records the page a gesture STARTED on and,
  once the scroller has settled, pulls it back to one step away if snapping landed further. The correction comes
  **after** the settle rather than fighting the gesture — nothing can predict a fling, and a scroller wrestled
  mid-flick feels broken in a way an overshoot does not. It is RTL-aware (`scrollLeft` runs negative there) and
  the skip is invisible when it happens, which is why it does not rest on one mechanism.
  **The discovery chip shares the title's row** (`.cp-titlerow` wrapping `#cpName` + `#cpNew`, Aug 2026, on
  request): it names the place beside it, and a line of its own cost the short phone sheet a whole line before
  the description started. The 20px right margin that clears the × moved from `.cp-name` up to the row.
  **The sheet's CEILING is what the PAGE ON SCREEN needs** (`cpPaneNeedH` / `cpFitH`, Aug 2026, on request:
  "the max height should always be the point where everything is displayed fully, so we are never left with
  empty space at the bottom"). `cpMaxH()` is now the smaller of the room the screen has and the height the
  active pane actually asks for, and a swipe to a shorter page pulls the sheet down to fit it. The reader's
  own dragged height is kept as the CAP it always was rather than overwritten, so swiping back to a long page
  restores it — a swipe answers for the page it lands on and must not quietly relitigate a setting. The fit
  is **debounced past the scroll settle**, not run per scroll event: resizing the box a gesture is being made
  inside means the snap is measuring a moving target. `cpSyncDots` has to run BEFORE `cpApplyH` on every
  populate, since the dot row is part of what the sheet must make room for.
  **The sheet's HEIGHT is the reader's to set** (`.cp-grab` / `cpWireResize` / `cpApplyH` / `cpMinH` / `cpMaxH`,
  Aug 2026, on request): drag the grip at its top edge — a pill centred on it, since a draggable edge with no
  mark on it is one nobody will find — down to the title bar alone or up to the top of the screen. Stored as a
  **fraction of the viewport** in `localStorage["folio_cp_h_v1"]` (device-local like the marker's position, and a
  fraction so a rotation keeps the proportion), re-applied on every `showCountryPopupName`, so the next place
  opens at the height the last was left at. `.cp-sized` is what takes the stylesheet's 52% cap off and lets
  `.cp-head` shrink; the desktop panel is untouched (`cpPagerOn()` gates everything, and the grip is
  `display:none` above 720px).
  **`cpMinH` measures through `offsetTop`/`offsetHeight`, never `getBoundingClientRect`** — and this is the whole
  trick. The head is a scroller inside the very box being shrunk, so its rect reports whatever is left of it, and
  a floor derived from that collapses as the drag approaches it: the first version bottomed out at the hard 56px
  and the title scrolled out of the sheet it was meant to be the floor of. Offsets are layout values and do not
  move.
  The popup (`#countryPop`) stacks: the state's **full legal official name**
  (`officialName()` — from the summary's "officially …", or a leading "Full Name, commonly known as …" form, with a state-type
  keyword fallback so e.g. USSR → "Union of Soviet Socialist Republics"), with the **years that iteration of the state existed** in
  **thin grey directly under the title** (`.cp-span` ← `countrySpan()` / `country-spans.js`; missing → the line collapses); + a
  **general description of the state**
  (`stripInfoNoise(countryDesc())`) that is **constant across timeline years** (keyed by the entity name — it only differs when
  the name does) and free of any figure shown in the number grid; the **year** + a per-year paragraph describing that state in
  that map-year (`country-years.js` → `countryYear()`; missing → a dash, never fabricated); and a 2×2 grid of **Population / Area /
  GDP / GDP-per-capita** tiles — **year-specific** (present year → `country-stats.js`; a past map-year → `country-stats.js`'s
  `COUNTRY_STATS_YEARS`; missing → a dash). Pop/Area/GDP come from `country-stats.js`
  (Wikidata); **GDP-per-capita is computed at render** as GDP ÷ Population (`statNum()` parses the formatted strings) — it is NOT
  stored. **Hovering (or focusing) a number** shows a small speech bubble naming its source ("Source: Wikidata" / "Calculated:
  GDP ÷ Population").
  Glossary terms in **both** the summary and the per-year paragraph are **auto-linked** (`autoLinkGlossary` +
  `setupTooltips`, same as card backgrounds) so each opens its gloss popup; the place's own name is skipped.
  **Wilderness / stateless (unnamed) areas are not clickable** (`countryAt` skips unnamed entities).
  **Two-level click / drill-down** (single = parent, double = child):
  - **Merger-only eras** (groups, e.g. 1960 *USSR*): single-click selects the whole group; **double-click** selects the
    **present-day country under the cursor** within it (`countryAt(px,py,true)`), highlighting its exact `world.js`
    borders (`subSelGeo` → `paintFillRings(GEO[subSelGeo].p,…)`) and showing its per-year info.
  - **Geo eras** (1900/1920/1938): every territory carries a **`.mother`** field (its sovereign / colonial power, classified
    by an agent pass and applied to `timeline.js`, since the source's `SUBJECTO` tag is unreliable — Algeria/Kenya/Angola are
    tagged as themselves). The click model is a drill-DOWN (more clicks = deeper): **single-click selects the whole EMPIRE** —
    every territory sharing that `.mother` (so clicking French West Africa lights up France + all French colonies) — and shows
    the empire named as an EMPIRE via the `EMPIRE_NAME` map (mother "United Kingdom" → "British Empire", "France" → "French
    colonial empire", "Denmark" → "Danish Realm", "Chinese Warlords" → "Warlord-era China", …; mothers already named as a state
    map to themselves; the US resolves to "United States of America"). Empire descriptions live in `countries.js` (13 added,
    workflow-researched + adversarially fact-checked). **Double-click selects just that one territory/home country** (British Raj,
    or the UK metropole "United Kingdom of Great Britain and Ireland") and shows its info. Independent states are their own mother
    (group = just themselves). Multi-tap is counted by `tapCount` (1/2/3, same spot within 400ms).
  - **UK constituent countries** (`uk.js`, in EVERY era incl. present-day): the UK's internal land borders (England–Scotland,
    England–Wales) draw light (`drawUKConstituents`). The constituents are the DEEPEST level, so they're reached by a
    **TRIPLE-click on a geo era** (empire → country → constituents) and a **double-click elsewhere** (present-day / merger era:
    country → constituents) — `constituentHit()` returns the one under the cursor (England / Scotland / Wales / Northern Ireland), era-aware: **before the 1922
    partition the whole island of Ireland was part of the UK**, so any Irish point → the all-Ireland "Ireland"; from 1922 only
    N. Ireland is, the Republic being a separate country). Its popup uses `showCountryPopupName(name, true)` → the constituent's
    general description (from the inline `UK_DESC`), no year paragraph or stats. Highlight state is `subSelUK` (an array — the (era-aware: **before the 1922
    partition the whole island of Ireland was part of the UK**, so any Irish point → the all-Ireland "Ireland"; from 1922 only
    N. Ireland is, the Republic being a separate country). Its popup uses `showCountryPopupName(name, true)` → the constituent's
    general description (from the inline `UK_DESC`), no year paragraph or stats. Highlight state is `subSelUK` (an array — the
    pre-1922 all-Ireland selection lights both Ireland + N. Ireland). The drill is checked **before** the era logic, so it works
    over the UK in a colony-grouping geo era too (and a non-UK double-click still drills to the colony/present-day country).
  - The **info box** layout is the **same in every era** (`showCountryPopupName`): title = the state's full official name, the
    left/main paragraph = its general description (**constant across years**, keyed by the entity name), and the middle column =
    the per-year paragraph (`countryYear()`) describing that state in the selected map-year — so the constant "who they are" sits
    beside the year-specific "what was happening". `stripInfoNoise()` strips translation parentheticals + any sentence quoting an
    actual **numeric** grid figure from both — money (`$/€ N`), a population/GDP count in millions/billions, or an area in
    km²/sq mi. (It matches numeric figures only, NOT the bare words "population"/"GDP" — matching the words wrongly dropped
    figure-free general sentences like "most of the population lives on the coast"; don't reintroduce word-matching.)
    Stats (the number grid) are present-day Wikidata figures → shown only at the
    present year, a dash otherwise. (Earlier the historical box used the year paragraph AS the main text; it now mirrors the
    present-day layout.)
  - **`c` means two different things, and it bit once.** On an era territory (`timeline.js`) and a UK subunit
    (`uk.js`) `c` is the per-ring **edge mask**; on a `world.js` country it is the **label centre `[lon,lat]`**.
    `paintFill` / `paintSelection` read `terr[idx].c` off `terr = histTerr() || GEO` and passed the centre in as
    a mask, so `masks[r].charCodeAt(i)` threw for **every selection on the present-day map** — aborting the paint
    before anything was blitted, which meant clicking a country there produced **no highlight at all** (fixed
    July 2026 by passing `ht ? terr[idx].c : null`; the historical eras were always fine). Every other reader of
    `GEO[i].c` treats it as a point. If you touch either painter, keep the mask era-only.
  - **The golden overlay traces EXACTLY the edges the map draws** (`paintFillRings`) — it must match the displayed borders +
    coastlines. For masked geometry (era territory / merger group / UK constituent) it strokes only the political borders
    (`'0'` inter-group + `'2'` sub-country) and **skips `'1'` (the entity's own coast) and `'3'` (hidden)**; the coast is then
    added from the **present-day `coastEdges()` clipped to the region** (`strokeCoastClipped`, bbox-filtered) so the gold coast
    sits on the *drawn* coastline, never the era geometry's offset shore. The double-click **drill** (`subSelGeo`, an unmasked
    present-day country inside a merger era) skips any edge in `hiddenEdgeSet()` — the era's `'3'` edges — so it never draws a
    border the map omits (e.g. the S. Sudan split line pre-2011). This fixed the old artifacts: gold coast fragments around the
    southern USSR's inland seas (Caspian/Aral/Balkhash `'1'` edges) and present-day borders showing on older maps.
  - **Soviet republics on the geo eras** (`drawSovietRepublics`): the source's 1920/1938 USSR is a single polygon with **no
    internal republic borders**. To show its union republics (as the merger eras 1960+ already do via `synthGroups`, and the UK
    shows its constituents), the present-day **post-Soviet internal borders** (edges shared between two of the 15 successor
    states, `SOVIET` set) are overlaid **limited to the era's USSR extent**, light like a `'2'` sub-border — an accurate proxy
    for the union-republic boundaries (the Central-Asian/Caucasus borders were settled by 1936). Limiting to the era polygon
    keeps e.g. the still-independent 1938 Baltics out. Drawn on the map in `renderStatic` next to `drawUKConstituents`.
    That limit is a **per-era cached midpoint test** (`sovietSegsForEra`, keyed on `_htId` + `mapEditRev`), not a canvas
    clip: it used to build a complex clip mask from the USSR polygon on **every frame** of 1920/1938 for a layer whose
    geometry can't change within an era.
- **Community decks — Phase 0 foundations (July 2026).** Groundwork for user-created decks
  (`docs/user-decks-plan.md`). Nothing user-visible yet; these are the seams the feature will attach to, and
  they exist so the later phases can't be built the wrong way.
  · **`sanitizeHTML()` / `sanitizePlain()`** (in the helpers block, beside `esc`/`stripHtml`) — an allowlist
    sanitizer for content Folio did NOT author. Card fields are rich HTML rendered with `innerHTML`, and the
    Supabase access token lives in localStorage, so unsanitized user markup is account takeover for a learner
    and site defacement via `content_overrides` for an admin. Unknown tags are **unwrapped** (text survives),
    dangerous ones (`SANITIZE_DROP`) removed whole; attributes are dropped unless allowlisted; `class` is
    filtered to `SANITIZE_CLASSES` + `uc-*` (arbitrary classes let untrusted content borrow site chrome and
    spoof the UI); URL schemes are tested against a copy stripped of whitespace/control characters, because
    browsers read `java\tscript:` as `javascript:`. It re-sanitizes to a **fixed point** (mXSS) and escapes
    the input outright if it won't settle. **Call it on INGEST, not per render** — one missed render site
    would otherwise reopen the hole. Curated content never passes through it. 42 XSS vectors are covered by
    a Playwright test; re-run it after touching the allowlists.
  · **`UCARDS` / `cardById(id)` / `isCommunityCard(id)`** (beside `CARD_BY_ID`) — community cards get their
    OWN store and must never enter `CARDS` / `CARD_BY_ID` / `TREE` / `window.GLOSSARY` / `ADMIN_EDITS`.
    Four existing behaviours force this: `serializeCardData()` maps over `CARDS` (auto-save would bake user
    cards into `data.js`), `applyAdminEdits()` rebuilds the tree from `SHIPPED_NODES` on every admin edit,
    `adminUndo` rebuilds `CARDS` from `PRISTINE_CARDS`∩`BASE_CARD_IDS`, and the daily games draw from
    `ALL_CARD_IDS` (TREE-derived), which must stay fact-checked content only. `cardById()` is the lookup for
    the **study path** (scheduling, rendering, progress, the suspended list); the **admin editor deliberately
    keeps reading `CARD_BY_ID` directly** so it can only ever edit curated cards. `UCARDS` is empty today, so
    `cardById()` is currently a passthrough. Ids will be `u_<deck8>_<n>`.
  · **Scoped glossary indexes** — `buildGlossIndex()` now takes a scope and **returns** its index instead of
    assigning a single global; `glossIndexFor(scope)` caches per scope in `_glossIndexes`, `glossSourcesFor
    (scope)` picks the term tables, and `invalidateGlossIndex(scope)` (scope omitted = all) replaced the four
    `glossIndex = null` sites. `autoLinkGlossary(rootEl, answerText, offKeys, scope)` and `linkifyGloss(text,
    selfKey, scope)` take a trailing scope that **defaults to `"site"`, so every existing caller is
    unchanged**; `resolveGlossKey(idx, surface)` now takes the index. A deck with its own glossary gets scope
    `"deck:<id>"` so its terms auto-link inside its own cards and nowhere else — a single global index would
    leak a stranger's terms into curated backgrounds. Verified behaviourally identical to the previous code
    (same 125 auto-linked terms across 8 study cards).
  · **The shared card surface** (`liveCardEditorHTML(opts)` + `wireLiveCardEditor(host, opts)`, just above
    `adminRenderEditor`) — the `.card-edit-single` surface: ribbon, the four double-click-to-edit
    `.ces-field` contenteditables, the image slot/panel, the `#cesAnswerText` hook and the two-way HTML
    source box. **The admin editor and the Studio both render through it.** What stays with each caller is
    its own chrome: the admin's head bar, chronology field, deck picker and revert/delete; the Studio's
    equivalents. Callers pass `metaHtml` for the row above the card and receive every edit through
    `setField` / `afterEdit`, so neither editor knows anything about the other's store. Extracted in
    Phase 1, once the Studio existed as a real second caller — guessing the seam in Phase 0 would have
    meant refactoring the main content tool blind. `.claude/test-admin-editor.js` guards it.
- **Community decks — Phase 1: local decks + deck files (July 2026).** Users can write their own decks.
  Entirely local: no server, no account, no publishing (Phases 2+ in `docs/user-decks-plan.md`).
  · **Stores** — `UDECKS` (deckId → meta + `cardIds`), `UCARDS` (cardId → the 13 `CARD_FIELDS` + optional
    `image`), `UGLOSS` (reserved for the per-deck glossary). Card ids are `u_<deck8>_<n>`; a deck's active
    entry in `S.active` is `"u:<deckId>"` (`uDeckIdOf` / `uDeckEntry`). The whole module sits under the
    `COMMUNITY DECKS` banner in app.js.
  · **Persistence** — IndexedDB `folio-community`, store `decks`, one record per deck
    (`{ id, meta, cards, gloss }` — also the export-file shape). **An unusable IndexedDB silently falls back
    to `localStorage["folio_community_v1"]`** (`_communityLS`): the golden rule is that opening index.html
    directly keeps working, and private mode / blocked storage are real too. Verified both ways.
  · **`uDeckNormalize` is the single ingest choke point** — everything entering the store passes through it,
    imports *and* what comes back out of IndexedDB, because that store is writable by anything on the origin.
    Rich fields go through `sanitizeHTML`, plain ones through `sanitizePlain`, image `src` through
    `sanitizeUrl`. `uCardSet` sanitizes on write too, so an exported deck is clean at the source. **The
    contenteditable is never rewritten mid-keystroke** — only the stored value is sanitized, or the caret
    would fight the sanitizer.
  · **Bridges into the rest of the app** are deliberately few: `entryCardIds` / `entryInfo` /
    `activeEntryIds` (accept `u:` entries), `availableCardIdSet` (adds community cards so they reach the
    daily review), `buildSession`'s `scope.type === "udeck"`, and `cardById`. **The daily games are NOT
    bridged** — they draw from `ALL_CARD_IDS`, which is TREE-derived, so unvetted cards can't reach them.
    That's asserted by the test, not just intended.
  · **Studio** (`PAGES.studio`, `#studio`, `studioState`) — deck list → one deck (details, card list with
    reorder, the shared card surface). Reached from the Library's **"Your decks"** section, not the nav bar.
    Community rows are visually distinct (dashed rule, no collection hue) and the section says plainly that
    these decks are **not fact-checked by Folio** — Folio's content rules can't be imposed on a stranger, and
    the credibility of the curated decks is the whole product.
  · **Deck files** — `uDeckExport` writes `<name>.folio-deck.json` (`{ folioDeck: 1, meta, cards, gloss }`);
    `uDeckPickFile` → `uDeckImportText` reads one back. An import always takes a **fresh deck id and fresh
    card ids** when the id already exists, so importing can never overwrite a deck you're working on and two
    copies keep separate study progress. Blob URLs are revoked on a timer, not synchronously — an immediate
    revoke can cancel the download.
  · (The per-deck glossary that `deck.glossMode` refers to landed in Phase 4 — see below.)
- **Community decks — Phase 2: publishing, discovery, moderation (July 2026).** A deck can now go online.
  **⚠ The phase-2 SQL at the end of `.claude/supabase-schema.sql` must be run once** (Dashboard → SQL
  Editor) or every community call 404s; `communityErr()` turns that into "Deck sharing isn't set up on this
  site yet." rather than leaking PostgREST's error, and nothing else breaks.
  · **Tables** — `user_decks` (one row per published deck, with `slug`/`status`/`version`/denormalised
    `card_count` + `install_count`), `user_cards` (**one row per card**, PK `(deck_id, id)`), `user_gloss`,
    `deck_installs`, `deck_reports`. Cards are rows and not one jsonb blob **because that is the paywall
    seam**: the `user_cards` select policy already reads `is_demo or d.price_cents = 0`, so Phase 5 only has
    to flip non-demo cards and add `or exists (entitlement)`. A blob cannot be partially gated, and a
    client-side filter is not a paywall. `price_cents` / `is_demo` ship now so that phase needs no migration.
  · **Ownership** — a local deck is **mine** (`origin !== "installed"`) or **installed**. Mine can be
    published (`uDeckPublish` → insert/patch `user_decks`, then delete + re-insert every `user_cards` row,
    which is simpler than diffing and safe because **card ids are stable across a publish, so a learner's
    scheduling survives an update**). Installed decks are **read-only in the Studio** — editing would
    silently fork them and then the author's next update would either clobber the edits or be refused;
    "Duplicate to edit" makes the copy explicit (it round-trips through `uDeckImportText(..., true)`).
  · **`UDECK_PUBLISH_KEYS` never leave the device.** `uDeckExport` strips them and `uDeckImportText` zeroes
    them, so a deck *file* can't claim someone else's slug, masquerade as installed, or suppress an update
    prompt. Only `UDECK_META_KEYS` travel in a `.folio-deck.json`.
  · **Pages** — `PAGES.community` (`#community`: search, sort, grid) and `PAGES.deck` (`#deck/<slug>`, a
    shareable deep link parsed at boot and on `hashchange`, the same shape as `#map/<year>/<slug>`). The
    deck page renders **a real flippable sample card**, re-sanitized through `uCardSanitize` — the server
    copy is never trusted just because it came from our own API.
  · **Installs** — `deck_installs` is one row per user per deck, which both syncs a signed-in learner's
    installs and gives `install_count` an honest trigger-maintained source. Installing works **signed out**
    too (the deck lands in IndexedDB; only the row and the count need an account).
  · **Card-id collisions** — `remoteToLocal` remaps a deck's card ids if any already belong to a *different*
    local deck, so two installs can never collide in `UCARDS` / `S.cards`.
  · **Moderation** — a Report control on every deck page (`deck_reports`, reasons are a CHECK constraint),
    and an admin-only queue on `#community` with Hide / Restore / Dismiss. Hiding sets `status='hidden'`,
    which the RLS select policy already excludes from everyone but the owner and admins.
  · **Update checks** — `communityCheckUpdates()` runs once at idle after boot, in ONE request for all
    installed decks, and fills `_deckUpdates` (Library and Studio show an "update" pill). A failed or
    offline check just leaves it empty.
  · **The column guard — `guard_user_deck_columns()`.** RLS decides which ROWS you may write, **never which
    COLUMNS**. "edit your own decks" therefore let an owner PATCH their own `install_count`, `rating_avg`,
    `staff_pick` or even `owner` — inventing an editorial endorsement and a five-star average for
    themselves. A BEFORE INSERT/UPDATE trigger now restores those fields for any non-admin caller (silently,
    since a hard error over a field the client shouldn't have sent is the worse experience). **The
    maintenance triggers are exempt via a transaction-local `folio.sync` flag** — without it the guard would
    undo `sync_card_count` / `sync_install_count` / `sync_deck_rating`'s own writes. Phase 3's block
    `create or replace`s the guard to cover the columns it adds. **If you add a server-maintained column,
    add it to the guard**, or it is client-writable the moment it exists.
- **Community decks — Phase 4: a deck's own glossary (July 2026).** A deck can define its own terms, which
  auto-link inside its cards and **nowhere else**. This is what the Phase 0 glossary scoping was built for.
  · **`deck.glossMode`** — `site` (default: link the curated glossary, exactly as before), `own` (only the
    deck's terms; the site glossary is invisible), `both` (deck terms layered over the site's). Set in the
    Studio under **Deck details**; stored, exported and published.
  · **Keys are namespaced `u:<deckId>:<slug>`** (`uGlossKey` / `uGlossParse` / `isDeckGlossKey`). That
    namespacing is the isolation mechanism: `glossText` / `glossTitle` / `glossDates` / `glossTags` each
    branch on it and read `UGLOSS`, so a deck term resolves inside its deck and does not exist outside it.
  · **`glossSourcesFor(scope)`** now resolves `deck:<id>` to the deck's tables per its mode, and
    `glossScopeForCard(cardId)` picks the scope when a background is rendered (`processAbstract` passes it
    to `autoLinkGlossary` **and** uses it to prune hand-added `.ttip`s). `glossScopeForKey` derives the
    scope from the KEY when a popup opens nested links, so a curated description never starts linking a
    stranger's terms just because the reader arrived from a community card.
  · **Gotcha that bit once:** `buildGlossIndex` derived the matchable surface from `glossKeyTitle(key)`.
    For a namespaced deck key that humanizes to the literal `u:abc:Slug`, so nothing ever matched in prose.
    It now uses `surfaceOf(k)`, which reads a deck term's own title. **Curated keys still go through
    `glossKeyTitle`** — deliberately not `glossTitle`, since pass 1 matches the humanized slug, not a
    display-title override. The equivalence test (125 auto-linked terms over 8 curated cards) guards this.
  · **A card must not auto-link its OWN answer term, and for proper nouns it used to** (fixed Aug 2026).
    `autoLinkGlossary` suppresses the answer by resolving `answerText` to a key — but it looked only in
    `byName`, the case-INSENSITIVE map, while a proper-name surface lives in `byNameCS`. So a card whose
    answer is a proper noun linked that answer inside its own background, offering the reader a popup
    defining the very word they had just been asked to recall. `buildGlossIndex` now also returns
    **`byAnySurface`** — every surface lowercased, whichever map it landed in — which `autoLinkGlossary`
    uses for that one question. It is deliberately NOT used for matching prose: a proper name must still
    match case-sensitively there. Found by the card→glossary pairing plan, which gives every card's answer
    a term and so turns this from one stale case (`Ice_Age`) into one per batch.
  · **Every mutation invalidates only that deck's index** (`uGlossTouched` → `invalidateGlossIndex("deck:"+id)`),
    including deck deletion — otherwise a re-created deck with the same id would inherit a stale index.
  · **`uGlossSanitize` closes a hole Phase 1 left open**: `uDeckNormalize` used to pass `gloss` through
    untouched, which was harmless only because nothing rendered it. Descriptions are rich HTML and now DO
    render in a popup, so they go through `sanitizeHTML` on ingest like every other field, and slugs are
    restricted to `[\w.-]{1,80}` because they end up inside a `data-k` and a `u:` key.
  · **Publishing** carries the glossary (`user_gloss` rows, replaced wholesale like the cards) and an
    install pulls it down — re-sanitized on arrival, since the server copy is not trusted.
  · The **admin "edit this term" button is hidden on deck terms** — it routes into the curated glossary
    editor, which knows nothing about them.
- **Community decks — Phase 3: ratings, staff picks, attribution (July 2026).** **⚠ Needs the `6) RATINGS`
  block at the end of `.claude/supabase-schema.sql` run once**, on top of the phase-2 block.
  · **`deck_ratings`** — one row per (deck, user), 1–5 stars plus an optional ≤500-char review and the
    rater's display name copied in at write time so listing reviews needs no join to `profiles` (whose RLS
    is sign-in-only). Insert policy refuses a rating on an unpublished deck **or on your own deck**;
    update/delete are limited to your own row. Re-rating is an upsert (`Prefer: resolution=merge-duplicates`).
  · **Summary columns on `user_decks`** — `rating_avg`, `rating_count`, `rating_1..rating_5`, all
    trigger-maintained by `sync_deck_rating()` and unwritable by clients (see the column guard below). The per-star counts exist so the
    deck page can draw a distribution without an aggregate query, which PostgREST does badly.
  · **`rank_score` is a STORED generated column** — `(v/(v+10))·avg + (10/(v+10))·3.5`, the Bayesian pull
    toward a prior that stops one 5-star review outranking a deck with fifty good ones. Browse's "Top
    rated" orders by it. A generated column may only read its own row, so the prior is the **constant 3.5**
    rather than the live site mean; that keeps the sort indexable and is close enough.
  · **The rating form is gated on having studied `RATE_MIN_STUDIED` (5) of the deck's own cards**
    (`deckStudiedCount`). This is **friction, not security** — it is a localStorage check and a determined
    person could study five cards. Enforcing it properly would mean shipping per-deck progress to the
    server, which is not worth the privacy cost. Said plainly in the code comment too.
  · **`staff_pick`** — an admin-only boolean and the one strong quality signal on a page of unvetted
    content. Toggled from the deck page; browse has a filter and a badge. Its own RLS policy.
  · **`forked_from`** — `{slug, title, author}` recorded when "Duplicate to edit" copies an installed deck,
    rendered as "Based on X by Y". It rides in `UDECK_META_KEYS`, so unlike the publish keys it **survives
    export/import** — attribution should not be shed by round-tripping through a file.
  · **No creator profile page, deliberately.** It would need `profiles` readable by anonymous visitors,
    which publishes every user's username and display name — a privacy decision for the site owner, not
    one to make in passing. "More from this author" queries `user_decks` by `owner` instead, which is
    already public, and gets most of the value.
- **Community decks — CARD TYPES (Aug 2026, on request).** Anki's note types, cut to the three things an
  author actually programs: the **front template**, the **back template** and the **CSS** for the card as a
  whole. A type declares its own field names; a card of that type carries a `fields` map instead of the
  thirteen `CARD_FIELDS`. **⚠ Publishing a deck that uses one needs the `8) CARD TYPES` block at the end of
  `.claude/supabase-schema.sql` run once** — everything else (writing, studying, export, import) is entirely
  local and needs nothing.
  · **"Basic" is Folio's own format and is NOT one of these records.** It is what a card with no `type`
    renders as — question, answer, date line, background, sources — so **every card written before this
    existed is a Basic card and nothing migrates**. `CARD_TYPE_BASIC` is a reserved id: `uTypeSanitize`
    refuses a type that tries to take the name, or an imported deck could shadow the built-in format.
  · **Types live on the DECK (`deck.types`), not on the device**, and ride in `UDECK_META_KEYS` — so one
    entry covers the record, the export file, the import and the fork with no plumbing of its own. A deck is
    the unit that travels, and a template left behind would leave an installed copy rendering its fields as
    raw prose. Publishing sends `user_decks.types`, **but only when the deck actually has types**, so a deck
    of Basic cards still publishes from a database whose owner has not run that SQL block (`typesColumnMissing`
    turns PostgREST's PGRST204 into a sentence saying what to do instead).
  · **The template language is `{{Field}}`, `{{FrontSide}}`, `{{#Field}}…{{/Field}}` and `{{^Field}}…{{/Field}}`**
    (`tplRender`) — Anki's, minus the filters. There are deliberately no filters: a template needing more than
    this is a template that wants a build step, which Folio does not have.
  · **The safety rests on the LAST sanitize, not the first.** The templates and the field values are each
    cleaned on ingest, and that is not enough — a value dropped into `<img src="{{X}}">` is only checkable once
    the two are one string. So `cardTypeSideHTML` is the single choke point, and it runs `sanitizeHTML` over
    the COMPOSED result at render. Don't "optimise" that pass away.
  · **The CSS gets its own treatment, because it is not HTML and cannot go through the HTML sanitizer** (which
    drops `<style>` outright). `sanitizeCSSText` strips comments, strips `<` (so `</style>` cannot be spelled —
    **`>` is deliberately KEPT**, it is the child combinator and only the opening bracket can end the element)
    and strips backslashes (a CSS escape can spell any blocked keyword; the cost is that `content:"\201C"` has
    to be written as the character); drops `@import`/`@charset`/`@namespace`; narrows `url()` to https and
    `data:image/`; and **demotes `position:fixed` to `absolute`, since scoping a SELECTOR does nothing to stop
    a fixed box being painted across the whole page.**
  · **`cssScoped` prefixes every selector** with `.uc-card[data-uct="<deckId>__<typeId>"]`, drops block-form
    at-rules it doesn't allow (`@font-face`, `@page`, `@document`), keeps `@media`/`@supports`/`@layer` and
    scopes the rules inside them, and leaves `@keyframes` stops alone (`0%` is not a page selector).
    **Anki's convention is that `.card` is the card itself**, and `html`/`body`/`:root` are read the same way —
    an author who writes `body{}` means this card, not the site around it. `ensureCardTypeStyle` injects ONE
    `<style data-uct>` per (deck, type) into the head; leaving them is safe precisely because they are scoped,
    and re-injecting per render would restyle the page on every card. Needs `style-src 'unsafe-inline'`, which
    `_headers` already has — **no CSP change, and none should be needed.**
  · **Switching a card's type is reversible and deleting a type is not, and the code says so both ways.**
    `uCardSetType` keeps `c.fields` when a card goes back to Basic (a `<select>` is one keystroke from being
    hit by accident), and `uCardSanitize` therefore keeps a `fields` map whether or not there is a `type` —
    while a card that has never held one carries no key at all, so a Basic-only deck's export is unchanged.
    `uTypeDelete` does destroy them, and asks first, naming the number of cards.
  · **Studio**: a third tab, **Card types**, with Basic at the head of the list as a read-only row. The card
    editor gets a type picker above the card; choosing a type replaces the whole Basic surface with one box per
    field plus a live preview, rather than dressing the Basic surface up as something it isn't. Both previews
    render through the same `cardFrontHTML`/`buildBack` the study page calls — a second implementation would
    drift.
  · **A typed card has no phrasing pool** (`renderCard` skips `cardQuestions` for one): the chevrons and the
    "1 / 3" counter are about the Basic format's `questions` array.
  · **The deck PAGE's sample card** belongs to no local deck, so it carries its type on `card._type`
    (sanitized from `row.types` there) — `cardTypeOf` reads that before looking a deck up.
  · Guarded by **`.claude/test-card-types.js` (110 assertions)**, which tests the CSS scoper and the template
    engine as pure string functions (a scoping bug reads far better as a failed comparison than as a screenshot
    of a restyled page), then drives the real Studio, then imports a **hostile deck file** through the real
    file picker. **Re-run after touching `sanitizeCSSText` / `cssScoped` / `cssScopeSelector` / `tplRender` /
    `cardTypeSideHTML` / `ensureCardTypeStyle` / `uTypeSanitize` / `uCardSanitize`, or `levelFromXP`.**
    Two things that bit while writing it and will bit again: **`render()` called from inside a `change` handler
    throws** — removing the still-focused input fires blur in the middle of `#view`'s innerHTML assignment, so
    blur first and defer the render out of the event; and a test that opens IndexedDB **must close it**, or the
    idle connection blocks the app's own open after a reload and pushes it onto the localStorage fallback.
- **Reader feedback (beta, July 2026).** Readers write to the editors from the **foot of the About page**
  (`.msn-feedback`, between the FAQ and the changelog); admins triage the messages in **Edit → Feedback**,
  which **replaced the Accounts tab** — that tab managed the legacy device-local accounts (`folio_acct_v1`)
  and had had nothing to manage since accounts moved to Supabase. **⚠ Needs the `7) FEEDBACK` block at the
  end of `.claude/supabase-schema.sql` run once**, on top of the phase-2/3 blocks; until then every call
  404s and `feedbackErr()` says "Feedback isn't set up on this site yet." rather than leaking PostgREST's
  error, and nothing else breaks.
  · **`public.feedback`** — one row per message: `kind` (bug / correction / suggestion / praise / other),
    `message`, the optional `name` + `email`, the `page` the reader was on, a `meta` jsonb (`lang`, `ua`),
    and the triage pair `status` (**new / seen / approved / done / discarded**) + `admin_note`.
  · **Anonymous inserts are allowed, deliberately.** The reader most likely to spot a wrong date is the one
    who never made an account, and a sign-in wall is exactly the friction that loses that correction. The
    cost is that the publishable key lets anyone POST; the only rate limit is a **device-local cooldown**
    (`folio_feedback_sent_v1`, 30s) — honest friction, **not security**. If it is ever abused, narrow the
    insert policy to `to authenticated`; no application code has to change.
  · **`guard_feedback_columns()` is what actually matters**, and it is the same lesson as
    `guard_user_deck_columns`: RLS picks the ROWS you may write, never the COLUMNS. Without it a sender
    could POST `status:'done'` alongside their message and file it away before an editor saw it, or plant
    an `admin_note`. A non-admin's triage columns are silently restored on insert, and a non-admin update
    returns `old` unchanged. **If you add a server-maintained column here, add it to the guard.**
  · **The message is sanitized on INGEST** (`feedbackPlain` → `sanitizePlain` **per line**, because
    `sanitizePlain` collapses all whitespace and a textarea's paragraph breaks have to survive). It is
    escaped again on render in the queue — the server copy is not trusted just because it came from our
    own API, and this one is written by anonymous strangers.
  · **The status IS the colour** (`FEEDBACK_STATUS`, hex per status, set inline as `--fb-col`): the row's
    left edge, its kind chip and its state label all take it, so scanning for what still needs a decision
    is a glance. The swatches **toggle** — clicking the status a row already carries clears it back to New.
    Changes are applied optimistically and rolled back if the PATCH fails, so a triage pass never waits on
    the network between clicks. The queue opens on "Needs a decision" (new + seen), and the tab carries an
    unread badge fetched once per admin-page mount.
  · **The user-facing strings are localised in all 9 languages** (`chrome.exact` + two `chrome.html` rows
    for the `<small>(optional)</small>` labels); the **queue itself stays English**, like the rest of the
    editor.
  · `adminState.tab === "accounts"` is a **retired value**: `restoreAdminUI` drops it so a session saved
    before this change opens on the editor's default tab rather than one that no longer exists.
- **Edit → Dashboard: Folio in numbers (Aug 2026, on request).** The editor's FIRST tab and the one a fresh
  session opens on (`adminState.tab` defaults to `"dashboard"`; a session interrupted mid-edit still comes back
  to the card it was on — `restoreAdminUI` exists because auto-save can live-reload the page between
  keystrokes, and losing that would be a worse regression than gaining this). It takes over the admin area the
  way Feedback and Timeline do (`.dash-mode`, the same hide list). **Its tab is PURPLE and spans both columns
  of `.admin-tabs`** (Aug 2026, on request) — it is the only one of the five that describes the whole site
  rather than a kind of content, so it sits above the four as a header rather than beside them as a fifth
  peer. `grid-column:1 / -1`, not `span 2`, so it stays full width if the grid ever gains a third column.
  **Two halves, and the split is not cosmetic.** `dashContentStats()` is derived from the shipped data files
  and the admin overlay on top of them, so it is exact, instant and works offline — it is the same data the
  site is rendering. `dashLoadRemote()` has to ASK, and what it can ask is bounded by the RLS in
  `.claude/supabase-schema.sql`: `profiles` is readable by any signed-in user and the published-deck tables are
  public, but **`progress` is readable only by its owner and their accepted friends — an admin included**. So
  there is no honest site-wide "cards studied" figure and **none is invented**; the panel says so in prose
  rather than leaving a reader to read a missing number as a zero. **If you add a figure here, check the policy
  before the query.**
  Counting uses PostgREST's `Prefer: count=exact`, whose total arrives in **Content-Range** — which `supaFetch`
  now parses into `r.count`. Two things about that header: it is not a CORS-safelisted response header, so it
  is readable only because Supabase names it in `Access-Control-Expose-Headers` (a proxy in front of it might
  not, which is why `count()` also asks for up to `DASH_CAP` ids and falls back to counting them, flagged with
  a `+` if it filled the page — an honest floor beats a row of em dashes that looks like a broken panel); and
  **a mock must send the expose header too**, or every figure comes back null and the panel reports a
  connection failure that is really a CORS one.
- **ONE DECK PER CARD (Aug 2026, on request).** The card editor's deck picker was checkboxes — a card could be
  cross-listed into any number of decks with one set of scheduling. Nothing shipped ever used it (all 119 cards
  sit in exactly one deck) and it made "which deck is this card in" a question with no single answer, which the
  editor header, the study bar and the home review row all had to hedge around. It is **radios** now, and
  `setCardMembership` is passed a list of one; the collapsible header reads `Deck: <name>` rather than
  `Appears in N decks`. **The data model still holds a SET, deliberately** — `membership` deltas, `cardLeaves`
  and `serializeCardData` are all written against one, and narrowing them would be a rewrite of the overlay
  format to enforce in storage what the editor now enforces at the point of choice. A card that somehow holds
  two decks still renders honestly (every one of its decks is marked, with a note saying so) and the next
  choice made collapses it to one. The bulk **"Move to deck…"** in the selection bar already wrote a single
  leaf, so it needed no change.
- **The account page's identity actions** (Aug 2026, on request): **Change password sits beside Sign out**
  inside the profile card (`.acct-idacts`), not a section lower among the photo controls — the two act on the
  same thing — and the "Progress synced to your account" line moved directly under them (`.acct-syncnote`),
  with the password panel following it so it opens where the button is. `.acct-tools` survives for the
  Remove-photo button and renders only when there is a photo.

## Generating cards & glossary entries

**Content style rules (all card fields + glossary descriptions, current AND future):**
- **Reading level: a bright 17-year-old must understand it — and the length is fixed.** Two requirements:
  1. **Length: about 300 words** for the abstract, and always within **270–330** (a 10% margin). Treat this as a hard
     target — under 270 reads thin, over 330 turns dense. The abstract stays **exactly 10 sentences in two blocks of
     5**, so sentences now average about **30 words**. Vary the rhythm: mix shorter, punchier sentences with longer
     well-structured ones, rather than making all ten the same length. (This supersedes an earlier, shorter
     ~190–230-word house style — the cards were rewritten up to this length and level in July 2026.)
  2. **Vocabulary: upper-secondary — neither childish nor academic.** Precise words are welcome and need no apology at
     this level: *sedentary*, *surplus*, *hierarchy*, *reciprocity*, *domestication*, *subsistence*, *nomadic*,
     *successive*. What still earns a brief gloss on first use is genuinely specialist vocabulary a general reader
     would not meet outside the field (*conchoidal fracture*, *Levallois*, *Mousterian*, *debitage*, *knapping*,
     *immediate-return*). Avoid jargon for its own sake, but equally avoid over-explaining what a 17-year-old already
     knows.
  Keep the tone of a good popular-history book or a well-written museum panel for older students — never childish,
  never a lecture, and **never at the cost of accuracy or of the hedges**: contested facts stay hedged, in clear prose
  ("scholars still disagree about exactly when…"). This applies to every field, in English **and** in all 8
  translations, which must hit the same length and register in their own natural idiom — never a literal calque of the
  English. (Flesch–Kincaid lands around **11–13** for this register; treat it as a rough check only, since proper nouns
  like "Paleolithic" inflate it — judge by sentence construction and word choice.)
- **Non-round numbers above 20 are numerals** ("27 chapters", never "twenty-seven chapters"). Round numbers may
  stay as words ("thirty kings", "eight hundred years"). Proper names keep their words (*Twenty-Four Histories*,
  *Twenty-four Filial Exemplars*).
- **Centuries and millennia are always numbered** ("11th century", "2nd millennium BCE" — never "eleventh century"),
  whatever the ordinal.
- **Literature titles are italicised** (`<i>Bamboo Annals</i>`) — except in plain-text fields (`answerText`) and in
  glossary alias/title keys, which must stay unstyled or matching breaks. Person-vs-book names (Zhuangzi, Mencius,
  Laozi…) are italicised only when clearly the text — "the <i>Zhuangzi</i>" — never the person.
- **A WORD MENTIONED AS A WORD is quoted** (Aug 2026, on request, after a reader met "given a Latin name for
  handy"). Whenever the prose glosses a name — translating it, or naming the sense a coiner chose — the sense
  goes in **single quotes**: "a Latin word for 'handy' or 'skilful'", "its name means 'hollow rock'", "the Greek
  for 'old stone'". Single, not double, because that is what the deck already used where it got this right, and
  because a card's fields are stored in double-quoted JS strings. Where the FOREIGN word itself is given, it is
  italicised and its sense quoted: "the Greek <i>epi</i>, meaning 'upon'". The same holds for a term named as a
  term rather than used — "specialists now hedge the word 'cremation'", "he proposed the word 'Minoan'".
  What is NOT quoted: an explanation rather than a translation ("in everyday speech it means a single cold
  spell"), and a definition of a thing rather than a gloss of a name ("the Maasai word for the sisal plant that
  grows there"). Fixed across 14 abstracts, 2 questions, 3 question extras and 5 glossary terms on 2026-08-03;
  **the ENGLISH only**, since a quotation mark is a per-language convention (French takes « », German „ ", CJK
  「 」) and rendering the English mark in nine languages would be a typographic error nine times over. When
  translations resume, each language quotes in its own.
- **Measurements are METRIC FIRST, with the imperial equivalent in parentheses** — "over 2,400 kilometres
  (1,500 miles)". This is the ONE documented exception to the no-parentheses rule below; the ban stands for
  everything else. Round the conversion to the source figure's own precision (1,500 miles → 2,400 km, never
  2,414), leave the footnote marker on the metric figure the source actually states, and leave scientific units
  bare — "940 cubic centimetres (57 cubic inches)" is worse, not better.
  **THE WORD LIMITS DO NOT COUNT A CONVERSION** (Aug 2026, on request). A question is held to 20–34 words and
  an abstract to 270–330, and four measurements cost about twelve words, so without this the rule above could
  not be applied to the cards already near the ceiling. It is enforced rather than trusted: `add-card.js` and
  `add-questions.js` strip a parenthetical containing a digit and an imperial unit (`IMPERIAL_PAREN`) before
  counting (the leading space with it, or the stripped parenthetical leaves a stray token behind), so the
  **prose** limits stay exactly as binding as they were: the finished corpus has the SAME 4 over-length
  abstracts and 1 out-of-range question it had before the pass, against 11 and 4 counting the conversions.
  The exemption is for the parentheses, not for the sentence around them.
  **THE PASS IS COMPLETE** (`docs/units-plan.md`): 486 conversions across all 119 cards and all 414 glossary
  terms, and **nothing metric is left bare**. Two sweeps say so and BOTH are needed: one for a digit before
  a unit, and one for a **spelled-out** number before a unit (`about four miles inland`, `a third of a
  metre down`) — the second found the corpus's second imperial-first figure, which the first is blind to. That plan also holds the conventions settled once and to be
  followed rather than re-argued — feet-and-inches under 4 m, sq mi keeping the source's significant figures,
  a range taking ONE parenthetical for both ends ("between 400 and 700 m (1,300 to 2,300 feet)"), and
  °C → °F carrying the sign. **ENGLISH ONLY**, like every content change since the `MULTILANG` gate: the
  translations keep their bare metric figures until translations resume.
- Enforcement: `node .claude/check-style.js` reports violations; `--fix` applies the safe ones (it masks the proper-name
  exceptions, skips plain-text fields and the glossary alias sections). Run it after bulk content additions. **Card text
  edits invalidate baked narration hashes — re-run `build-tts.js` for all four narrators after a style pass.**

**FOLIO IS A HISTORY SITE, NOT AN ARCHAEOLOGY SITE (Aug 2026, on request).** A card is about the PAST it
names, not about the people who dug it up: the excavation is how we know, not what the reader came for.
So the **question must be answerable from the past, not from the dig** (`gr-008`'s opening clue was
"Schliemann tried to arrange a dig at ___ and never came to terms with the owners", which a reader could
answer knowing nothing about Bronze Age Crete); **at most about two of an abstract's ten sentences may be
discovery history**, and only where the discovery is itself the fact worth knowing or the dating is
contested; and **the date line carries the dates of the THING, not of the dig** — `Found`, `Excavated`,
`First dug`, `Named` and `Published` belong only on a card whose subject IS a modern act (`wh-006` the
three-age system, `gr-007` Arthur Evans), and `Built` / `In use` / `Occupied` / `Destroyed` everywhere else.
What does not change is the apparatus: saying less about the dig is not saying less about how we know, and
the 5-source bar stands. **24 of the 119 cards shipped in Aug 2026 are flagged**, measured rather than guessed (a card
scores on how many of its ten sentences carry a year between 1800 and 2029, whether its question carries
one, and whether its date line uses a discovery label) — `docs/history-focus-plan.md` holds the measure, the
table and the six rewrite batches. Re-run the measure after each batch; and read the card before rewriting
it, because on a few of them the modern years ARE the subject.

**A NEW CARD SHIPS WITH A GLOSSARY ENTRY FOR ITS OWN ANSWER TERM, IN THE SAME COMMIT (Aug 2026, on
request).** Not afterwards and not in a later batch: a card's answer is exactly the word its siblings will
use in their own backgrounds, and a term with no entry auto-links to nothing. Write it **cited, at the
`GLOSS_SRC_TARGET` bar**, while the card's research is still open — that is how the glossary pass stayed at
401/401 through sixty-eight new terms — and to the GLOSSARY's rules rather than the card's: three sentences,
impartial, deck-agnostic, self-contained, never written as a companion to the card that prompted it. Where
the answer is a phrase the glossary would never head, give the entry the head noun and add the card's exact
answer as an **alias**. **THE BACKFILL IS COMPLETE: every shipped card has such an entry** (42 of 119 did when the rule was written),
and the glossary stands at **477 terms, every one at the bar**. `docs/card-glossary-pairing.md` holds the
record of the ten batches and what each turned up — the rule itself is what remains in force. Worth knowing
before writing the next one: give the NARROWER thing its own key and let the broader one take the short
alias (`Clovis_point` as a key, `Clovis` as an alias of `Clovis_culture`), since `buildGlossIndex` sorts
surfaces longest-first; and **ask whether a one-word term is also an everyday word** before adding it —
`Boreal` needed `caseSensitive: true` or four country and region terms saying "boreal forest" would have
linked to a Holocene chronozone.

The deck and glossary are being regrown one entry at a time, each researched from **Wikipedia and
academic sources** — accuracy is non-negotiable, never invent dates, names, or definitions. The kept
template entries are the canonical format: card `cnh-001` in `data.js`, glossary term `Sima_Qian` in
`glossary.js`. The full pre-trim originals are backed up in `.claude/backup/`.

**Current direction (July 2026): the China collection is SET ASIDE** — its tree node carries
`placeholder: true`, so it sits under "Coming soon" and `availableCardIdSet()` (app.js) keeps its cards
out of the daily review, the games, the card of the day and study deep-links.

**WORLD HISTORY (`col-8`) runs off a 1000-card plan of its own (Aug 2026).** Its 8 decks and 39 leaf
subdecks are laid out in `data.js` and the running order is `docs/world-history-card-plan.md`.
**"Generate the next World History card" means: take the lowest `wh-NNN` not yet in `data.js`, read
its topic and deck from that plan, research it, and add it** with `node .claude/add-card.js <card.json>
<deckId>` — always passing the deck id. The next number is:
`node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='wh-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"`
(the padding is right for every id but `wh-1000`). **Do not create leaf decks under `col-8` as topics
demand** — that is what the plan replaced; a topic with nowhere to go means the plan needs changing, in
the same commit, and saying so. The collection is **not** contiguous: the 89 cards inherited from the
old prehistory deck fill scattered slots in `wh-evolution`, `wh-paleolithic`, `wh-peopling` and
`wh-neolithic`, so the "next" id is an early gap, not the high-water mark — which is the intended
behaviour, since those gaps are the cards the old deck never had.
**World History overlaps Greece, Rome, the US, Russia and India on purpose and never waits for them**:
it is written at survey altitude, and the plan's "Living beside the other collections" section is the
rule for how the two registers differ.

**ANCIENT GREECE (`col-13`) is the collection being grown (Aug 2026).** Its 19 leaf decks are laid out
in `data.js` and its full 1000-card running order is `docs/greece-card-plan.md` — number, topic and
deck for every card, fixed in advance so the deck can be grown one card at a time across many sessions.
**"Generate the next Ancient Greece card" means: take the lowest `gr-NNN` not yet in `data.js`, read
its topic and deck from that plan, research it, and add it** with `node .claude/add-card.js <card.json>
<deckId>` — always passing the deck id, since `add-card.js` otherwise falls back to the first leaf in
the whole tree, which is `cn-myth`, in China. The next number is:
`node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='gr-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"`
There is deliberately **no separate progress file** — `data.js` says what exists, the plan says what is
planned, and the next card is whatever falls between them, so the two can never disagree about where
the work had got to. A plan line is a **subject to research, not a fact to assert**, and not always the
finished answer term: rename, split or drop a line when the research says so, in the same commit as the
card. The Greek glossary starts from nothing (of 401 terms only `Greece` and `North_Macedonia`), so
write its terms **cited from the start** at the `GLOSS_SRC_TARGET` bar rather than opening a backlog.

**ENGLISH ONLY (Aug 2026, on request): a new card or glossary term does NOT need its nine translations.**
The site ships in English while the work is on making the English as good as it can be, so put the effort
that went into nine translations into the English instead — the sourcing, the sentence rhythm, the
question pool. `add-card.js` and `add-glossary.js` each carry a `REQUIRE_TRANSLATIONS = false` beside
their `I18N_LANGS`, which is the content-pipeline half of `MULTILANG` in app.js; flip both back and new
entries are held to all nine again. **Translations that ARE supplied are still written and still checked**
(question length, footnote-marker parity) — the requirement is lifted, the machinery is not, and the
existing 105 cards and 333 terms keep the translations they have. What is written below about the nine
languages is the rule to resume, not the rule in force.

**Add a card** — build a card object with all 13 fields, write it to a temp `.json` file, then run:

```
node .claude/add-card.js <card.json> [deckId]
```

It appends the card to `window.CARD_DATA`, registers the id in a leaf deck's `cardIds` (defaults to
the first leaf deck), keeps the collection `total` ≥ card count, and re-parses to confirm valid JS.
This stays cheap as `data.js` grows (it never re-Edits the whole file). Content rules:

- `question` — an HTML clue whose answer is the term, with the term itself blanked as
  `<span class="blank">_____</span>`; use `<i>…</i>` for work titles. **Place the blank in the MIDDLE
  of the sentence, never at the end** — the clue must keep going after the blank, not stop on it
  (write "The `___` is the god of the east…", not "…the god of the east is `___`.").
  **Length: ONE sentence of about 28 words, and always within 20–34** (the blank counts as a word).
  The questions were rewritten down to this length in July 2026 — they had grown to ~46 words on
  average, which reads as a paragraph on the study card. Keep one strong identifying clue and the
  detail that makes it guessable; push the rest into the background, which is where the depth belongs.
  `add-card.js` refuses an English question outside 20–34 words and warns on a translation that has
  not been shortened with it. **The translations follow the same rule in their own idiom** — a
  language does not get to keep the long version.
- `questions` — **REQUIRED for every new card: exactly 2 EXTRA phrasings of the question** (3 in all —
  the study page asks one of the three at random each time the card comes up, so students remember the
  concept rather than the shape of one sentence). Each extra follows every `question` rule above
  (mid-sentence blank, ~28 words, 20–34) and must **approach the concept from a genuinely different
  angle** — lead with a different fact from the card's background (a function, a date, a place, a
  consequence), never a reworded copy of the same clue. All three must stay answerable from the card's
  own background. `add-card.js` refuses a new card without exactly 2 well-formed extras.
  **Backfilling existing cards** is batched through `node .claude/add-questions.js <batch.json>`
  (`{ "cards": { "<id>": { "questions": [q2, q3], "i18n": { "es": [q2, q3], … all 9 } } } }`) — it
  merges ONLY the question pools, per language, without touching any other field or language
  (`update-cards.js` would clobber the whole `i18n` object; don't use it for this).
- Chinese fields (`hanzi, pinyin, traditional, translations`) — fill only if the term has a Chinese
  form, else `""`. `translations` wraps the pinyin: `<div class="tr-pinline"><span class="tr-pin">…</span></div>`.
- `answerDate` (the date line) — **the dates worth memorising beside the answer term, and nothing else**
  (Aug 2026, on request). It is a KEY/VALUE LIST, not a paragraph: alternating `dt-k` / `dt-v` spans
  inside ONE `<div class="dt">`, which is a two-column grid, so the labels align down the left and each
  date sits beside the word naming what it is. A `<span class="dt-v dt-sub">` line continues under a
  value with no label of its own — the place under a birth date.
  ```html
  <div class="dt"><span class="dt-k">Born</span><span class="dt-v">12 February 1809</span><span class="dt-v dt-sub">LaRue County, Kentucky</span><span class="dt-k">Died</span><span class="dt-v">15 April 1865</span></div>
  ```
  **The label names WHAT the date is** — `Era`, `Lived`, `In use`, `Occupied`, `Found`, `Named`,
  `Coined`, `Painted`, `Born`, `Died`, `World Heritage` — and NOT the card's category, which is what the
  old one-word key said (`Site`, `Species`, `Industry`) above a paragraph explaining the term all over
  again. That paragraph is what this replaced: the background is where prose belongs, and a date line a
  reader has to read is one they will not memorise.
  **If the card has no obvious date, leave the field `""`.** An empty section is the right answer there —
  it collapses to nothing (`.av-row:empty`), and a sentence apologising for the absence is not a date.
  Write it with **`node .claude/set-date-line.js <batch.json>`** rather than by hand (`[[label, value], …]`
  per card; the script builds the markup, so the shape cannot drift card to card). Both it and
  `add-card.js` hold the field to `.claude/date-line.js`: at most 4 rows, a label of at most 16
  characters, a value of at most 64 characters and 10 words, a number in every labelled row, and no
  sentence. **Deep spans are written in the compact notation** — `115,000 – 11,700 BP`, `c. 4.2 – 2 Mya`,
  `c. 2.6 Mya – 9700 BCE` — all of which `cardYears` parses, which is what keeps the deck in
  chronological order (see the "Deep time" bullet).
- `abstract` (the background) — **exactly 10 sentences and about 300 words** (keep within 270–330), as two
  blocks of 5 split by ` <br><br> `: sentences 1–5 give the general meaning/context, 6–10 the meaning in this
  card's question. Information-heavy and precise, at the 17-year-old register set out above. **The only `<b>` bold is the answer term, at its first mention
  opening the background**; use `<i>` for titles (and foreign terms). **No parenthetical asides** —
  never put information between parentheses. **No glossary links** — plain text only (`cnh-001`
  still uses the old `ttip`/`data-k` links and bolded facts; new cards omit both).
  **COVER THE WHOLE ANSWER TERM, not the part the sources talk about most** (Aug 2026, on request).
  A background is the card's account of its term, so every region, period, group or strand the term
  contains has to be in it, in something like proportion. No single aspect may stand in for the whole
  — and the failure is quiet, because a card can be accurate in every sentence and still be a card
  about something narrower than its own answer. **The test is to read the ten sentences back asking
  which part of the term each one serves**; if a part the term names gets nothing, the card is not
  finished, whatever its word count. **`gr-001` is the standing example**: *Aegean Bronze Age* is
  three traditions by definition — Minoan, Cycladic and Helladic — and a first rewrite gave seven
  sentences to Crete, two to the islands and one to the mainland, because Crete is where the palaces,
  the writing and the best sources are. It was reported by a reader and rebalanced to 7 / 5 / 4 the
  same day. **Where the evidence really is lopsided, say so in the card rather than letting the
  proportions say it silently** — an imbalance the reader can see explained is history; one they
  cannot is a gap. The pull is strongest exactly where one part of a term is better served by open
  scholarship than the others, so this bites hardest on the terms most worth getting right.
- `sources` — **REQUIRED for every new card: an array of Chicago note-form citations** for the claims the
  background makes, and **at least one `<sup class="fn" data-fn="N"></sup>` marker in the abstract**
  pointing at each of them. Write the marker EMPTY — the digit is drawn from the list at render time, so
  re-ordering the list can never leave a wrong number in the text. Chicago **note** form (not
  bibliography form), **ending in the URL that lets a reader check it**:
  `Author, “Article Title,” <i>Journal</i> 546, no. 7657 (2017): 289–92, https://doi.org/10.1038/nature22336.`
  Italicise the title with `<i>`, as everywhere else, and write the **URL as PLAIN TEXT** — the page turns
  it into a link (`linkifySrcItem`), so the href and the visible text can never disagree. **Every citation
  must carry a link** and all four helper scripts refuse one that does not, which by design restricts the
  citable literature to what is **publicly reachable**: a DOI, an open-access paper, a museum or agency
  permalink. That restriction is the point — a page number nobody can open is a page number nobody
  checked. **Every source must be referenced by at least one marker** — a citation
  nothing points at is a reading list, not a footnote — and `add-card.js` refuses a card that breaks
  either rule. Cite the scholarship the claim actually rests on: a monograph, a survey, a journal
  article, a museum or excavation report. **A Wikipedia article is not a source here** — it is where the
  research starts, not what a study card stands on; follow it to what it cites. **Never invent a
  citation, a page number, a DOI or a publisher.** If a claim cannot be tied to a work you can actually
  name, soften the claim or drop it — that is the whole point of the apparatus. **A source in any language
  qualifies**, and an English card may cite a French or German work where that work carries detail no
  English source does — common for European prehistory, where the excavation reports are written where the
  site is. English is preferred only where it serves equally well, since most readers of the English card
  can check an English source themselves. Cite a foreign-language work under its own title, untranslated:
  a citation names a work that exists, and a translated title names one that does not. Sources are **not
  translated** (they do not appear in the `i18n` blocks), but the **markers do**: put the same markers on
  the same claims in all 9 translated abstracts, or that language silently loses the apparatus
  (`add-card.js` warns when the counts differ). Escape hatch: `"skipSources": true`, only for a
  deliberate maintenance edit of a card written before citations existed.
- `answerText` — the answer as plain text, no HTML.
- `image` / `video` (optional, one or the other) — `{ src, title, desc, credit }`. **`credit` is required**:
  `add-card.js` refuses a `src` with no source line, matching the editors' media gate.
- `i18n` — **OPTIONAL while the site is English-only** (it was required, and will be again — see the
  English-only note above): the card translated into all 9 site languages,
  `"i18n": { "es": { "question": …, "questions": [q2, q3], "answer": …, "answerDate": …, "abstract": …,
  "answerText": … }, "fr": …,
  "de": …, "it": …, "nl": …, "ru": …, "ar": …, "zh": …, "ja": … }`. Each language mirrors the English fields under the
  SAME formatting rules (blank `<span class="blank">_____</span>` mid-sentence, a question of the same
  ~28-word brevity as the English, **a `questions` array with the same 2 extra phrasings translated**, 2×5-sentence abstract with one
  `<b>` on the answer term, `<i>` for titles, no parentheses). **`answerDate` is NOT translated** — the
  date line was cut to a list of dates in Aug 2026 and the translated ones were cleared with it
  (`set-date-line.js`), so every language falls back to the English line: numerals under a one-word
  label. Restoring them means translating the labels, and only the labels. Translate
  meaning-for-meaning at native quality — **not a literal, word-for-word rendering of the English.** Each language
  must read as though it were written by a native speaker for teenagers in that language: use its own natural phrasing,
  idiom and word order, at the same plain 14-year-old reading level as the English. Do not transliterate proper names
  that have established forms in the target language, and use each language's own standard scholarly term for the
  answer. The study page, card of the day and games show the `i18n[lang]` fields when the site
  language matches (`cardLocalized()` in app.js); English is the fallback. With `REQUIRE_TRANSLATIONS`
  back on, `add-card.js` refuses a new card with a missing language/field.

**Add a glossary term** — write `{ "slug": "Wikipedia_Article_Slug", "description": "<3 sentences>",
"date": "<optional>", "tags": ["<kind>", "<subject>", "<specific>"],
"sources": ["<Chicago note-form citation>", …],
"translations": { "es": "<3 sentences>", "fr": …, "de": …, "it": …, "nl": …, "ru": …, "ar": …, "zh": …, "ja": … } }`
(translations OPTIONAL while the site is English-only, and required again when it isn't — the description
in all 9 site languages, same three-sentence, impartial, self-contained rules; they land in
`i18n/gloss-<lang>.js` → `window.GLOSSARY_I18N`) to a temp `.json` file, then run:

```
node .claude/add-glossary.js <entry.json>
```

The key is the Wikipedia article slug (spaces → underscores, keep diacritics, e.g. `Nüwa`). The
description is **exactly three sentences**, and must stay **impartial and deck-agnostic** — a gloss
popup is shared across every deck, so define the term on its own terms the way a neutral encyclopedia
would, never within the context of a particular deck, card, or example. A term that is not *inherently*
Chinese (a general concept like *culture hero*, *creation myth*, or *dynasty*, or a comparative one
like *Ymir* or *Tiamat*) must **not** use China — or any single culture — as its framing or example;
only terms that are themselves Chinese should mention China. This holds **even for things invented or
chiefly developed in one place**: a general term gets a general description, never a portrait of its
local instance — an *abacus* is a bead-frame calculator used in many cultures (not "the Chinese
suanpan"); *gunpowder* is an explosive mixture of saltpetre, charcoal, and sulfur (not "invented in
China"); a *compass*, *crossbow*, or *water clock* is defined by what it is, with no country, dynasty,
or inventor attached. Only terms that are themselves inherently tied to one culture — a proper noun or
a named tradition/practice (e.g. *acupuncture*, *Dujiangyan*) — may reference it. The description must also be
**self-contained / not "aware" of other glossary entries**: describe the term on its own, never
defining or positioning it by comparison or contrast with a sibling gloss item — no *"the opposite of
X"*, *"in contrast to / as opposed to / unlike X"*, *"distinct from X"*, *"should not be confused with
X"*, *"together with X it forms Y"*, *"superseded by / grew out of X"*, or *"the counterpart of X"*.
Stating an intrinsic fact that merely names a related entity (a figure's parent, consort, or author;
a work it is part of; the members of a group) is fine — it is *comparative or contrastive framing*
that is banned, not every mention. Include `date` only when relevant (a
lifespan, dynasty, or dated event), e.g. `"c. 145–86 BCE"` or `"1644–1912"` — it lands in
`window.GLOSSARY_DATES`.

**Every new term carries `"sources"`** — Chicago note-form citations for its three sentences, in the same
form and under the same rules as a card's (see the `sources` bullet under "Add a card": real scholarship,
never Wikipedia, never an invented page number). They land in `window.GLOSSARY_SOURCES` and show as a
numbered fold at the foot of the popup. **Markers are REQUIRED, exactly as on a card** (they were optional
through batches G1–G4; changed on request 2026-08-01). Point each claim at the work it rests on with
`<sup class="fn" data-fn="2"></sup>`, written empty — the digit is drawn from the list at render time — and
put the SAME markers on the same claims in **whatever translations the term carries** — which for a term
written while the site is English-only is none — since a language that loses them shows the fold with no
in-text links and a language that carries a different set points at the wrong work.
`add-sources.js` refuses a term with no marker, a marker past the end of the list, or a source nothing
points at; `add-lang.js` warns on a mismatched translation and `node .claude/gloss-source-audit.js` reports
both over the whole glossary. **`split-abstract.js` exports `pieces()` and `mark()`** for exactly this: split
each language into its three sentences and apply one sentence-index → source-number map to all ten at once,
after checking that every language really does split into three. The citations themselves are not
translated (a citation names an edition that exists in one language). Escape hatch: `"skipSources": true`,
only for a maintenance edit of an older term.

**Every term carries `"tags"` — at least 3 lowercase category tags** (lands in `window.GLOSSARY_TAGS`;
the helper refuses a new term without them). They drive the tag filter in the admin glossary's left bar
and are shown as the list's second column and in the "Link term" picker. **Reuse the established
vocabulary** (check `window.GLOSSARY_TAGS` for tags already in use) rather than coining near-synonyms:
tag 1 = the kind (`person`, `ruler`, `deity`, `creature`, `place`, `mountain`, `river`, `city`, `state`,
`dynasty`, `era`, `event`, `battle`, `text`, `festival`, `food`, `plant`, `animal`, `object`, `concept`,
`practice`, `title`, `institution`, `school of thought`, `symbol`, `constellation`, `unit`, …), then
subject areas (`mythology`, `religion`, `philosophy`, `history`, `geography`, `astronomy`, `literature`,
`warfare`, …), then specifics that apply (a dynasty/period like `han dynasty`; a school like `taoism`,
`buddhism`, `confucianism`; a non-Chinese culture like `japan`, `greece` — there is deliberately **no
`china` tag**, China being the default context). Tags are also editable per-term on the admin glossary
page.

Optional `"aliases": ["alt spelling", …]` lists extra background spellings that should open the same
popup (lands in `window.GLOSSARY_ALIASES`); **plural forms link automatically**, so only add aliases
for forms the auto-pluralizer misses. Aliases are also editable per-term on the admin glossary page.

Optional `"image": { "src": "https://…", "title": "…", "desc": "…", "credit": "…" }` adds an illustration
shown at the foot of the term's popup, clickable into the fullscreen viewer (lands in
`window.GLOSSARY_IMAGES`; same shape and rules as a card image, and likewise **not** translated — the
metadata is shared across all 9 languages). Also editable per-term on the admin glossary page. Only add
one where the picture genuinely teaches something, and put its provenance in `credit`. **`credit` is
required** — `add-glossary.js` refuses an `image` or `video` that has a `src` and no source line, the same
rule the editors' media gate enforces (see the "Nothing is saved uncredited" bullet above).

Optional `"video": { "src": "https://…", "title": "…", "desc": "…", "credit": "…" }` adds a clip shown in
the same frame in the popup (lands in `window.GLOSSARY_VIDEOS`). **Links only** — a YouTube or Vimeo page
URL, or a URL ending in `.mp4`/`.m4v`/`.webm`/`.ogv`/`.ogg`/`.mov`; anything else silently renders nothing.
**A term shows one frame, so `image` and `video` are alternatives** — giving an entry both renders only the
image. Not translated, like the image metadata, and also editable per-term on the admin glossary page.

To remove a term, run the helper on `{ "slug": "Some_Slug", "delete": true }`.

When the user pastes one of the generation prompts and then sends bare terms one per message, treat
each as "research it and add it via the helper script," then reload to confirm no console errors.

**Citing the Atlas** — a place panel's citations do not come from `add-card.js` / `add-glossary.js`; they are
batched through `node .claude/add-country-sources.js <batch.json>` (`{ "general": { "<place>": [citations] },
"years": { "<place>": { "1938": [citations] } } }`). Keys are the place name **as it appears on the map**,
lowercased — the helper refuses a name that is in neither `countries.js` nor `country-years.js`, and warns when
year citations are filed against a year that has no paragraph. Same content rules as everywhere else: real
scholarship, Chicago note form, nothing invented. The number grid is untouched — it already names Wikidata in
its hover bubble.

**Backfilling citations onto existing content** — `node .claude/add-sources.js <batch.json>`
(`{ "cards": { "<id>": { "sources": [...], "abstract": "<with markers>", "i18n": { "es": "<with the same
markers>", … } } }, "glossary": { "<slug>": { "sources": [...], "description": "<optional>" } } }`).
add-card.js refuses a duplicate id and add-glossary.js rewrites a whole entry, so neither can do this;
`update-cards.js` would clobber the rest of `i18n`. It merges surgically — only `sources` and, where given,
the prose the markers live in — enforces the same marker rules as add-card.js, **warns for every language
whose abstract carries a different number of markers than the English** (that language shows the list but
none of the in-text links), and reports running coverage, which is how a multi-batch pass is tracked.

**Fixing a figure OUTSIDE the abstract** — `node .claude/fix-field.js <batch.json>`
(`{ "cards": { "<id>": { "field": "answerDate", "sub": { "en": [[find, replace], …], "es": […], … } } } }`).
add-sources.js touches only `sources` and the abstract, and `update-cards.js` ASSIGNS whole fields, so an
`i18n` patch through it replaces the card's entire `i18n` object and drops the other languages. Neither can
fix a wrong number sitting in **`answerDate`** — which is exactly where a citation pass keeps finding them,
because the date line repeats the abstract's figures. This does find/replace inside one named field, per
language, and **refuses to write unless every `find` string is present**: a silent no-op would leave a
corrected card still showing the wrong figure on its date line. Batch 6 needed it for three cards, all of
which would otherwise have shipped corrected prose above an uncorrected date line.
(A figure that is only on the date line and nowhere else is now usually easier to REWRITE than to patch —
the whole field is a handful of words. Use `set-date-line.js` for that and `fix-field.js` when the same
figure also sits in another field.)

**Rewriting a date line** — `node .claude/set-date-line.js <batch.json>`
(`{ "cards": { "wh-013": [["Lived", "c. 4.2 – 2 Mya"], ["Named", "1925, by Raymond Dart"]], "wh-080": [] } }`).
Rows are `[label, value]` pairs and the script builds the markup, so the shape cannot drift; a row with an
EMPTY label is a continuation line under the value above it, and `[]` is an empty date line. It validates
through `.claude/date-line.js` — the same module `add-card.js` holds a new card to, which is what stops the
field growing back into a paragraph — clears the field from every translation the card carries
(`--keep-i18n` opts out), and reports running coverage over the whole deck.
**The whole deck was converted this way on 2026-08-03** (11 batches, 112 cards): the date line had grown
into a summary of the card, sometimes three sentences under a one-word label, and is now the dates alone.
Two things worth keeping from that pass. **The sort order improved as a side effect** — fifteen cards
changed sort year and every one was a correction, because the old paragraphs carried excavation and
publication years that `cardYears` read as the card's own date (Atapuerca sorted at **1978 CE**, Denisova
Cave at 1977, Omo at 1967, Dolní Věstonice at 2016). **A card that states no era of its own needs the
sort year putting back by hand**: `wh-063` Paleo-Indians lost its only deep date when the Clovis figures
went, and sorted 5,000 years late until the Clovis row was restored — so run the before/after comparison
over `cardStartYear`, not just the eye, after a batch.

**Citing the existing content (as of July 2026)** — **most of the shipped content still has no citations.** The
109 cards, 333 glossary terms and every Atlas description were written before this system existed, from Wikipedia
and its sources, and were fact-checked rather than referenced. A batched pass is working through the cards —
**every shipped card carries sources and meets the 5-source bar** (`docs/citation-plan.md`; `add-sources.js`
reports both on every run, `node .claude/source-audit.js` reports them per card, and the Edit page's card list
shows each card's coverage as an amber or red chip) — and **a second pass has started on the glossary**, batched
through `docs/glossary-citation-plan.md` at a bar of **2 citations per term** (`GLOSS_SRC_TARGET`), with
`node .claude/gloss-source-audit.js` and the glossary list's own coverage chip reporting it; **all 401 terms are cited — THE GLOSSARY PASS IS COMPLETE** (batches G1–G11, which complete Phase 1;
P1–P7, which complete Phase 2 — all 45 US presidents; C0–C12, which take Phase 3 through every region;
D1–D3, which clear the European and Asian deferral lists and the last four terms; and **N1–N10,
sixty-eight new Palaeolithic terms written cited rather than cited afterwards** — which is how the pass stays
complete: a term added after it joins at the bar instead of reopening a backlog). `country-sources.js` is still empty, so the Atlas panel never shows a Sources fold.
**N9 is the batch that measured a rule change, and its finding is that the change buys less than it
sounds like.** The rule was relaxed on request — **an encyclopedia may be cited, but only if that
encyclopedia cites its sources** — and the test to apply is **per article, for that article's own
claims**, not the publisher's general reputation. Measured: **Dansk Biografisk Leksikon passes**
(a named author and a *Bibliografi* section listing sources), and **Britannica and Store norske leksikon
both fail** — Britannica's *Würm Glacial Stage* carries no bibliography, no "Additional Reading" and no
citations at all, its *rhinoceros* article has a named expert and an "External Websites" link box which
is not a source list, and SNL's *Fennoskandia* has a named expert and no *Litteratur* or *Kilder*
section. **A named author is not enough**, and the two that read most like they would qualify do not.
What it bought was one term: `Jens_Jacob_Worsaae`, shipped in N4 without birth and death dates, without
his career and without his book's Danish title because every source stating them was an encyclopedia,
and looked for again in N6 down the institutional route, where `natmus.dk` turned out to carry five
history pages that do not mention him at all. DBL supplies the lot, and the shape worth keeping is the
division it produced: **the encyclopedia carries the biography and the scholarship still carries the
argument.** N9 left `Weichselian_glaciation`, `Würm_glaciation`, `Devensian_glaciation`, `Fennoscandia`
and `Rhinoceros` deferred and said the encyclopedia rule was not what held them; **N10 cleared all five
and showed what was.**
**N10's finding is that a 503 on EVERY path is a moved domain, not an outage.**
`quaternary.stratigraphy.org.uk` — the ICS Subcommission on Quaternary Stratigraphy, named by N7 as the
right source for the European stage names — was recorded down in N7, in N9 and twice more at the top of
N10, on `/correlation/`, `/charts/` and the root alike. **The site is alive at
`quaternary.stratigraphy.org`, without the `.uk`**, and nothing on the dead host says so; a search
result for the chart carried the new address in passing. A genuine outage usually still answers
something, so **look for a sibling domain before recording a third refusal.** Behind it is Cohen &
Gibbard's *Global Chronostratigraphical Correlation Table for the Last 2.7 Million Years*, whose
regional columns carry Weichselian, Devensian and Wisconsinan side by side against the marine isotope
record — the one work that ties the three names together, and now cited on two of them. **It has no
Alpine column** in any version checked, so the Würm went to the south German and Swiss literature
instead. Three more things the batch is worth remembering for. **Where a Copernicus article is 2020 or
later, fetch the HTML full text**: the older ones are PDF-only, and a subset font with no ToUnicode map
defeats extraction outright (Preusser et al. 2011 comes out as raw byte codes, Ivy-Ochs 2015 as
nothing), which is why Gaar et al. 2019 answered where Preusser did not. **Test the file, not the
host** — N9 wrote off `geologinenseura.fi` on one image-only scan, and Donner 1996, on the same host,
extracts cleanly and carries the whole of `Fennoscandia`. And the sibling check paid again in a form
worth copying: the `Rhinoceros` draft carried Welker's "*Coelodonta* surviving locally to 14 ka" while
`Woolly_rhinoceros`, whose subject that is, says its demise begins about 10,000 years ago on its own
sources — **two open works disagreeing, so the clause was DROPPED from the family term rather than
reconciled**, a date about one genus belonging on the term for that genus. An unsourced date line went
the same way: `Weichselian_glaciation` was drafted with the textbook "c. 115,000–11,700 years ago",
which is in nothing opened for it, and now has no date line at all, like `Wisconsin_glaciation`.
**N1's finding is an access repair worth reusing: `hal.science` is now behind the Anubis wall on its RECORD
pages as well as on `/document`** (batch 21 found the file path), which silently breaks stored citations —
`wh-011`'s PAGES 2016 link among them. The way back is a **university repository deposit** of the same
paper (`repository.cam.ac.uk` carried it, record page and PDF both); look there before treating a HAL
citation as lost. `discovery.ucl.ac.uk`, `agupubs.onlinelibrary.wiley.com` and `whc.unesco.org` — the
latter on `/document/<id>` as well as its property pages — are all **403** here; so are `pnas.org`,
`nature.com` and `link.springer.com`, the last two **303ing to an identity-provider cookie endpoint**, for
which **Europe PMC is the way in** (resolve the PMCID with `search?query=DOI:"…"&resultType=core` — a
guessed one in N1 returned a paper on stress in mice).
**N8's finding is that a wrong TERM is not always a wrong FACT, and only a reader caught it.**
`Smilodon` opened "*Smilodon fatalis* is the saber-toothed cat" and held every sabre-tooth alias, so the
whole vocabulary of the group resolved to one American genus. Nothing in it was false about *Smilodon* —
the canines, the microwear, La Brea, the extinction were all sound and all still stand. What was wrong was
the **definite article**, and no tool can see that: `gloss-source-audit.js` counts citations, the marker
rules check pointers, `check-style` checks prose. **When a term is the only one in the glossary for its
subject area, check whether it is being made to carry the whole subject** — the fix is a sibling term, not
a correction. Note too that N6's *refusal* to cite `dodson-2025`'s Zhoukoudian cats for `Smilodon` (wrong
animal) is exactly what now carries `Saber-toothed_cat`'s third sentence: **the fact set aside as
uncitable-here was the fact the missing term needed.** Tooling note from the same batch:
**`add-glossary.js` clears an alias list only when the `aliases` key is PRESENT** — omit it on an update
and the old list stands, so two terms end up claiming the same surfaces and the older key wins. Pass
`"aliases": []`.
**N7 is the first N-batch to come back SHORT — eight of thirteen — and the deferrals are a source
problem, not an effort one.** `Weichselian`, `Würm` and `Devensian` are *stage names*, and what defines a
stage name is a stratigraphic authority: the canonical one is a Springer encyclopedia entry (barred twice
— `link.springer.com` 303s AND the plan bars encyclopedias), and the ICS Subcommission's correlation table
at `quaternary.stratigraphy.org.uk` returned **503 on two paths** — retry it before deferring them again.
`Wisconsin_glaciation` shipped only because a USGS record carries a MEASURED claim under the name, which
is the rule: **a stage name is citable when an agency has published a result under it, never from the mere
fact that it is the name.** `Fennoscandia` is deferred as `Scandinavia` nearly was — the ice sheet is well
sourced and nothing opened defines the REGION — and `Rhinoceros` because the family-level paper is in
*Cell* with no Europe PMC record. N7's other finding is the alias pattern hardening into a rule:
`United_Kingdom` was carrying "Britain", "British", "Great Britain" AND "Northern Ireland", three of them
wrong and the last never a synonym at all, all exposed the moment `Great_Britain` was added. **An alias
list written before the sibling term existed will contain the sibling's name, and will be wrong the day
the sibling arrives** — fourth correction in seven batches.
**N6's finding is a trap in the SEARCH RESULTS, not in a host.** Asked to complete `Jens_Jacob_Worsaae`
from a Danish institutional record, five `natmus.dk` history pages and `slks.dk` were tried and **not one
mentions him** — the Danish sources the search summaries appeared to offer were aggregating `lex.dk` and
Wikipedia, both barred, so a summary can read as institutional when every source under it is an
encyclopedia. What answered was **Worsaae's own book**, whose TITLE PAGE states his Danish office ("A
ROYAL COMMISSIONER FOR THE PRESERVATION OF THE NATIONAL MONUMENTS OF DENMARK") and whose opening pages
give Thomsen as "the real founder of the Museum" and the three-class division in his own words: batch
25's rule at full strength, **a 19th-century figure is his own best institutional record**. Read a scanned
book in bulk via `archive.org/stream/<id>/<id>_djvu.txt`. **His birth and death years are STILL uncited**
and the term still omits them. N6 also shows what N5's restraint bought: `stratigraphy` was cut from
`Stratum`'s aliases in draft, so giving it its own term cost nothing — had the alias shipped, the new term
would have overridden it and left a dead row, which is the `Upper_Paleolithic` case exactly.
**N5 CLEARED `wh-085`'s date line** (see N3's note) — "a rockfall closed the entrance roughly 13,000
years ago" is gone from all ten languages, via `fix-field.js`, which refuses to write unless every `find`
string is present. **The sweep came first and is the reusable part**: grepping every card's abstract and
date line in all ten languages for *rockfall* and its nine translations proved the claim was on `wh-085`
alone, and that `wh-084`'s Chauvet rockfall at ~20,000 years is a separate, sourced claim. N5's own
finding is that **the pass's most repeated mistake is the alias**: `Stratum` was drafted with
"stratigraphy" as an alias — the STUDY of strata, not a synonym — which is N2's "Late Stone Age" and N4's
"Swabia" a third time, caught in draft this once. It also caught its own `Subsistence` draft stretching a
registered source past what the register records (G6's rule), and fixed it by RE-READING the paper rather
than softening the sentence. And it recorded a limit worth knowing: **no openable source defines the
DISCIPLINE of geology in a sentence** — the BGS gives its scope and its topic pages and no definition,
`geolsoc.org.uk`/`usgs.gov`/`historicengland.org.uk` are shut — so `Geology` describes what geologists
study and do, written around the gap. G8 needed Gray's *Anatomy* for anatomy; geology's equivalent was
not found.
**N4's finding is the one to carry furthest: a FABRICATED AUTHOR was caught in draft.** The first draft
of `Mesopotamia` cited "Morphodynamic Foundations of Sumer" to "Alberto Bravin et al." — a name read
nowhere, composed because WebFetch had returned the paper's CONTENT without its author list. Nothing in
the surrounding process would have caught it: the URL resolves, the claims are real, the marker rules
pass, and `gloss-source-audit.js` counts citations rather than checking them. **When a source's content
arrives without its metadata, look the metadata up** — `search?query=DOI:"…"&resultType=core` at Europe
PMC returns author string, volume, issue and pages in one call — and **never compose a citation from
what the prose sounded like**. N4 also withdrew a second identity-asserting alias ("Swabia" off
`Swabian_Jura`, now its own term), which with N2's makes it a pattern; and it left `Jens_Jacob_Worsaae`
**without birth/death dates or his book title**, because every source stating them is an encyclopedia,
which the plan bars: a biography written to the length of its sources is short, and one padded to the
length of a reader's expectation is fiction.
**N3's finding is what to do when a term fails the majority-open check**: `Solutrean` came back 1 open of
2, and the reflex — add a third source to fix the ratio — is wrong. Ask what the PAYWALLED one is
carrying: Aubry et al. 2008 is about laurel-leaf *production* and the term's sentence is about the
retouch, which Bachellerie 2025 states openly, so Aubry was **dropped, not balanced**. A paywalled work
earns its place only as the landmark for a claim nothing open carries. N3 also **re-points
`guder-2025`'s URL** from the Europe PMC `fullTextXML` REST route to the PLOS article page, which is 200
again: that endpoint is a machine route serving raw markup, so **when a host reopens, move the citation
back to the human-readable copy** (`journals.openedition.org` has likewise dropped the Anubis wall batch
21 recorded). And it leaves one thing UNFIXED and written down: **`wh-085`'s date line still carries the
"rockfall closed the entrance roughly 13,000 years ago" that batch 21 removed from its abstract** — the
third time a correction has failed to travel from a card's prose to its own `answerDate`.
**N2's finding is about ALIASES, and it is a content rule rather than an access one.** `Upper_Paleolithic`
carried "Late Stone Age", which is not a synonym: the Later Stone Age is the AFRICAN division running from
~40 ka into historical times, and Malan 1957 records that Goodwin chose the African names precisely so
they would not be read as the European ones. Nothing looked broken — pass 1 of `buildGlossIndex` beats an
alias — so it would simply have sat there being wrong. **Before adding a synonym alias, ask whether the two
names belong to the SAME SCHEME**: Old/New Stone Age are Palaeolithic and Neolithic in one European
sequence and are right; Earlier/Middle/Later Stone Age are another continent's sequence and are not.
Two rules that pass turned up at once. **`add-sources.js` writes only the ENGLISH description**, so a term whose
prose is corrected needs an `add-lang.js` run per language in the same batch or nine languages keep the old
claim; and **a correction does not travel between surfaces** — `Homo_habilis` still carried the 2.3–1.5 Mya span
a day after batch 19 corrected it on `wh-016`, so when a card is corrected, grep the glossary for the figure.
**Batch G3 ran that rule BACKWARDS, and it is the more valuable direction**: a term is three sentences, so a
wrong figure is quickest to spot there, and the card is where it does the most damage. Checking six industry
terms against their sources corrected the `Mousterian`'s start date on the term **and** on `wh-033` (160,000 →
300,000, in ten languages and on the date line — 160,000 is in nothing openable and contradicted the card's own
parent period), and moved a marker on `wh-032` off a paper arguing the opposite of the sentence it marked. A
term's date line is patched by **`node .claude/fix-gloss-date.js`** — `fix-field.js`'s glossary sibling, an
asserted find-and-set on `window.GLOSSARY_DATES`, written for batch G3 because two of its four corrections were
there and `add-sources.js` does not touch dates.
**Batch G4 is where the pass stopped being about journals**: eighteen works, every one open, and nine of the
eleven new ones were museum records or out-of-copyright books — there is no modern open literature on who
Thomsen was, but the museum that still uses his arrangement publishes its own history, and it says **he did not
devise the three-age system** (he called it "the old idea" in 1825, and Vedel Simonsen had published the theory
ten years earlier). That corrected two terms and `wh-006`'s date line. G4 also found, and deliberately did NOT
half-fix, the pass's one systematic divergence: **the glossary starts prehistory at 3.3 Mya and the cards start
it at 2.6 Mya** with Lomekwi 3 as a contested earlier claim — and the glossary's own `Lomekwian` term calls that
assemblage debated, so it contradicts itself too.
**Batch G5 settled it: prehistory starts at 2.6 Mya everywhere**, with the disputed 3.3 Ma Lomekwi claim kept as
a hedge in the prose and left standing alone on `Lomekwian` and `Lomekwi_3`. Seven date lines moved with it, and
the sibling check the plan demanded found two nobody had gone looking for — `Neolithic` ended at 3000 BCE where
`Stone_Age` ended and `Bronze_Age` began at 3300, and `Upper_Paleolithic` ended at 12,000 BP where the Holocene
GSSP puts it at 11,700. The Palaeolithic now closes at **9700 BCE**, not 10,000. `wh-001` carried the same two
errors and was corrected in ten languages. G5's own finding is a caution about harmonising: the `Neolithic`
term's "first clear signs of social ranking" was **withdrawn** (contradicted by `wh-009` and by Fuller &
Stevens, who put rank with urbanism), while `Neolithic_Revolution`'s "private property and inherited rank" was
**kept**, because it claims these among the transition's consequences and not as the first of their kind. The
two read as inconsistent and are not; the difference is the word *first*. Also from G5: **open a source whose
title reads as a refutation before citing it** — `eren-lycett-2012` ("Why Levallois?", on whether Levallois
flakes are standardized at all) was opened for that reason and confirms the sentence it now marks.
**Batch G6 found the pass's third wrong marker, and the rule it produced governs every batch that leans on
the register.** `wh-011` credited Hoffman et al. 2017 with "at least five major ice ages"; that paper does
not say five, or any number, and nothing openable from here counts them — the familiar Huronian / Cryogenian
/ Andean-Saharan / Karoo / Quaternary list is a textbook enumeration. Both the card and the `Ice_Age` term
now say what Hoffman supports. Ten of G6's sixteen works were reused from `.claude/sources-register.md`
unopened, which is the economy of the whole pass, and **the one that broke was the one stretched to a new
claim** — so: **a source reused from the register is reused for the claim the register RECORDS; a new claim
needs a re-read.** All three wrong markers (`wh-098`, `wh-032`, `wh-011`) were caught the same way, by
re-reading a registered source for a different surface. Two smaller G6 findings: the sibling check beat the
sources again (the `Ice_Age` term's uncited "coldest point around 20,000 years ago" was settled by
`wh-078`, which already gave the LGM as 26,000–19,000 with a citation), and **a claim nothing contradicts
stays** — the Meghalayan GSSP is a "speleothem" in every open source, "stalagmite" in the term, and the term
keeps it with the gap recorded in the register rather than being reworded on a hunch.
**Batch G7 is where the register stopped paying, and the reason is structural.** Fifteen of its 32 works
were new — against ten of sixteen reused in G6 and 26 of 38 slots in G5 — because **the register carries
terms about TAXA and PERIODS, and a type site is a PLACE.** A site's three sentences are a location, an
excavation history and a find, and only the find is a claim some card already makes; the geography, the
administrative facts and the dig histories all had to be found. Expect the same of G9 and G10, which are
peoples and physical geography and have no cards behind them at all. Its other findings: the cross-surface
sweep paid twice more, and both were siblings rather than strangers — `Olduvai_Gorge` was still "about
48 km" five batches after `wh-017` was corrected to 46, and `Lomekwi_3` still had the passive-hammer
knapping backwards after G3 fixed the identical error on `Lomekwian`, so **a correction does not travel
between SIBLING TERMS either, and the grep is for the figure, on the day**. And G7 met a case the pass had
not: not a source contradicting the term but **two sources contradicting each other** over a claim the term
makes flatly — Parker et al. read Taung's hominin-bearing calcrete as pedogenic where Rowan & Wood still
write of "the cave sediments at Taung". The rule adopted: where the sources disagree and three sentences
leave no room to hedge, **say what both carry** (here "tufa and calcrete deposits") and record the question
in the register rather than settling it in a gloss.
**Batch G8 corrected NOTHING, and that is the pass's most useful negative result.** Thirty-four batches had
produced corrections every time; the tenth-of-a-batch that did not is the one whose terms are DEFINITIONS and
BIOGRAPHIES — and the same batch carries the most unmarked, unsourceable clauses of any so far (nine, across
seven terms: a forager band's size, portable wealth, `Megafauna`'s 10 kg lower bound, the word *anatomist*,
the French and Lakota etymology of *badlands*, and Dart's birth, his 1958 retirement and the
osteodontokeratic hypothesis). **A term whose fold shows two open sources looks identical to a reader whether
every sentence rests on them or only one clause does**, and the audit counts citations rather than covered
claims — so it cannot see this. G7 found the register pays for taxa and not for places; G8 adds that **the
literature pays for RESULTS, not for definitions or for living people**, which is a harder limit than any
sandbox egress policy. Two routes did work and should be reached for early in G9/G10: **a discipline's own
statement of scope** (the SAA's *What Is Archaeology?* carried that whole term) and **the canonical textbook,
out of copyright** — there is no modern open work saying what anatomy is, and Gray's *Anatomy of the Human
Body* (1918) is on the Internet Archive in full, defining the subject, dissection, histology, comparative and
applied anatomy in its Introduction. That is G4's rule applied to a discipline rather than a man; an
encyclopedia is barred by the plan, a founding textbook is not. Its cheapest find is a search order:
**look at the deck's own markers for a FIGURE before searching the literature for it** — `Megafauna`'s 44 kg
was already marked on `wh-089` to Koch & Barnosky, who also carry three of the term's four claims.
**Do not paper over the rest by attaching plausible-looking citations to existing prose** — a citation that was
not the actual source of a sentence is worse than no citation, because it invites a reader to trust a page number
nobody checked. The honest routes are the ones the pass follows: open every work before citing it, re-derive the
passage from it, and correct the prose where the source does not bear it out.

**Splicing footnote markers into the translations** — `node .claude/split-abstract.js <cardId …>` splits a
card's abstract into its 2 blocks of 5 sentences in all ten languages and reports whether each one runs 5+5
and round-trips byte for byte. **Run it before placing markers by sentence index**: a language that splits
differently maps the markers onto the wrong claims and nothing downstream notices. It carries every guard
the batches have turned up — decimals, the era abbreviations in five languages (incl. Russian `н. э.`,
which needs no `\b` since JS's is ASCII-only), initials — **runs of them AND lone ones**, the lone case
added in batch G5 after "the archaeologist **V.** Gordon Childe" split a glossary term in half in English and
five translations, with a matching Arabic clause since Arabic has no case to test for — a day-ordinal before a
month name, a bare ordinal
before `Jahrhundert`, the CJK full stop, and **markers already placed by an earlier batch** (the marker sits
between the full stop and the following space, and in zh/ja with no space at all — without that guard a
top-up batch sees one enormous sentence, or splits every marker off as its own).

**Backfilling a site language** — `add-card.js` / `add-glossary.js` only handle a whole NEW entry in every
language at once. To add a language to content that already exists (a new site language, or topping up a
partial one), batch it through:

```
node .claude/add-lang.js <batch.json> [--partial]
```

`{ "lang": "ja", "chrome": { "exact": {…}, "rules": [[pattern, replacement], …], "html": {…} },
"cards": { "<cardId>": { question, answer, answerDate, abstract, answerText }, … },
"tree": { "<nodeId>": "<translated collection/deck title>", … },
"glossary": { "<slug>": "<3 sentences>", … } }` — every section optional, so one batch can be as small as
20 glossary terms. It writes `i18n/ui-<lang>.js` / `data.js` / `i18n/gloss-<lang>.js`, **merging** in every case (a language
never overwrites its neighbours), refuses a card missing any of the 5 translated fields unless `--partial`,
refuses a glossary slug that has no English entry, refuses a `tree` id that is not in `COLLECTION_TREE`
(keyed by **node id**, not title — titles repeat across the tree, e.g. two `Jin`s and two `Prehistory`s),
warns on a chrome key no other language has (a sign the
English source string has changed), and re-parses each file it writes. It reports running coverage
("ja now 140/333"), which is how a multi-batch language rollout is tracked.
**Gotcha this exists to avoid:** `update-cards.js` assigns whole fields, so passing it an `i18n` patch replaces
the card's entire `i18n` object and silently drops the other languages. `add-glossary.js` used to do the same
to `GLOSSARY_I18N[slug]` and now merges instead.

## Generating timeline eras (historical globe maps)

The Atlas globe has a timeline (1000 BCE → present). The present year always shows the present-day map
(`world.js`); past years can show a **historical border era** — a snapshot of the world's political
borders, built from **curated historical GeoJSON** (the primary path) or traced from a map image (a
fallback). **A past era keeps the present-day land, coastline, lakes, rivers and mountains** (from
`world.js`/`lakes.js`/`rivers.js`/`ranges.js`/`forests.js`, at full resolution and exact position) and
changes **only the political borders on land**. Each era territory carries a per-ring `c` bitmask (built by
`build-era.js`) marking which edges are *coastal* (along the present-day coast) vs *interior*; the render
strokes **only the interior land borders** and draws the coast from the exact present-day coastline
(`coastEdges()` — the GEO edges not shared between two countries), so the era's own (lower-res, off-source)
coastline never shows and coasts look identical to the modern map. **`build-era.js` is topology-preserving**:
it quantizes every vertex to a shared grid so a border shared by two countries stays *bit-identical* in both
rings (drawn twice it overlaps exactly instead of doubling), classifies each edge interior-vs-coast
*topologically* (interior ⇔ its reverse edge exists in another territory), with a **`landAcross` fallback** for
NON-tiling sources: an unshared edge is still a LAND border (not coast) if another territory lies ~0.06° across it
(probe both sides of the midpoint) — this recovers borders where the source's polygons don't share exact edges.
It thins with a local cyclic collinear test that keeps junctions so shared edges stay matched. (The old
per-ring Douglas–Peucker diverged shared borders → "double border" + stray artifacts; do not reintroduce it.)
**Region SUPPLEMENT** (`SUPPLEMENT` map): some snapshots are sparsely *digitized* in a region (gaps, not real history).
`world_1900` maps Africa only ~20% (huge gaps → a blank continent); the Scramble for Africa was settled by 1900, so the
1900 era fills the African continent (a Red-Sea-aware bbox) from the complete `world_1914` snapshot, keeping 1900
everywhere else (incl. the pre-Balkan-Wars Balkans, which 1914 gets wrong). Result: 1900 Africa went 276 → 2268 interior edges.
**Region membership is a fraction-of-the-feature test (`SUP_MIN`, 80% of a feature's vertices), never a centroid** — a
state straddling the region's edge has a centroid that says nothing about where its land is. The centroid rule silently
DELETED the **Ottoman Empire** from the 1900 map: its centre of mass sits in the open eastern Mediterranean (31.8E 34.4N),
inside the Africa box, so it was dropped from 1900 while the 1914 Ottoman — whose centroid lies outside the box — was never
added, leaving Anatolia, the Levant, Mesopotamia and western Arabia as blank terra-incognita stipple. Greece went the same
way. Both are back under the fraction test, and with them 1900's Libya is Ottoman Tripolitania rather than a 1914 Italian
"Libya" polygon. Two residual artifacts are accepted there, both cross-snapshot frontier mismatches in empty desert: a
sliver of doubled border where 1914's Algeria overlaps Ottoman territory, and an unclaimed wedge in the Egyptian Western
Desert that the 1900 source genuinely never digitized. **A rebuild also carries the era's `id`, label, researched period
`cities` and per-territory `.mother` across from the era it replaces** (mothers travel by territory name; a territory the
rebuild introduces falls back to being its own mother and is listed in the build output to be checked by eye) — without
that, re-running a year silently discarded the capitals and the empire-grouping classification. `RENAME` keeps a source
name the site has standardised elsewhere (e.g. "Manchu Empire" → "Qing dynasty", which is how `countries.js` is keyed).
**It also cleans the source first** (`removeOverlaps`): some historical-basemaps snapshots ship STALE / ANACHRONISTIC /
DUPLICATE features that *overlap* the correct territories (e.g. `world_1938` layers "Israel", leftover "Hejaz"/"Hail"/
"Emirate of Bin Shal'an", and duplicate "Qatar"/"Yemen"/"Trucial Oman" on top of Saudi Arabia + Mandatory Palestine,
plus ~79 unnamed blobs) — overlapping polygons render as **double borders + desert strays**. `removeOverlaps` drops
unnamed features, then greedily drops whichever remaining feature is ≥60% contained inside a *single* other feature
(the spurious overlapper — a real base territory is never mostly inside one neighbour; valid enclaves like Lesotho with
a proper hole are kept), keeping one of any duplicate pair. 1938 went from 18 overlaps → 4 (the residual are tiny
sub-threshold Caribbean specks). This is why **no cleaner external source was adopted** — CShapes isn't topology-clean,
OHM is too sparse; the artifacts were source data-quality errors, fixable in place.
**It also WELDS coast-junctions to the present-day coastline** (step 4.6): a geo era draws only its interior borders and
lets `world.js` draw the coast (`coastEdges`), so where an interior border meets the sea it used to terminate at the era's
OWN (offset/historical) shore — leaving the border end floating off the drawn present-day coast ("stray lines that don't
connect"). The build snaps each junction vertex (where a drawn '0' edge meets a skipped '1' coast edge on a ring) onto the
nearest present-day coast vertex within EPS=0.6° (shared junctions snap by quantized key so both neighbours move
identically → the shared interior edge stays bit-identical; no doubles — coast edges stay skipped, only junctions move).
This fixed the bulk (e.g. 1900 went from 58 visible coastal floats to ~2; 1938 to 2). **Residual far-floats (>0.6° from any
present coast) are LEFT as-is** — they're genuinely hard cases with no clean target: borders through lakes (Superior, Malawi),
a sea that became land (the dried **Aral**, where the 1900 border meets a shore that no longer exists), and large 1900-vs-today
coastline divergence in colonial Africa. Don't widen EPS much — a 1°+ snap can yank a border onto the WRONG coast (worse than a float).

**Each era uses ONE geometry source — never a mix** (mixing world.js + the era source for the same border drew two
slightly-offset lines = "double borders"; do not reintroduce a render-time overlay that draws both). `build-era.js`
classifies each snapshot: a **merger-only** era (differs from today *only* by merged/split countries, not moved
borders — a sampling consistency check ≥97%; e.g. 2000/2010 ≈ 98.9%) is stored as just `groups`
{ presentCountryName: groupName } (groupName = the present-day name for an unchanged country so its popup name +
description resolve, the era-territory name only for a genuine multi-country merger) with **no geometry**, and the renderer reuses `world.js`'s own high-res
geometry — so unchanged borders are pixel-identical to the present-day map. An era with genuinely **moved** borders
(e.g. 1900 ≈ 88.1%) keeps its own topology-preserving `geo` (source resolution, ~46k verts — a source limit, not a
bug). At render time `histTerr()` returns, for a groups era, `synthGroups(era)` (cached by era.id): it groups the
GEO countries by `groups[name]` and per ring edge writes a 3-state mask — **'0' inter-group** border (reverse owned via
`worldEdgeOwners()` by a country in a **different** group → drawn bold at full res), **'2' intra-group** border (reverse
owned by a country in the **same** group → a **sub-country** border, e.g. a Soviet republic inside the USSR), **'1' coast**
(no neighbour → skipped, `coastEdges()` draws it). The renderer draws '0' bold and **'2' light** (`globalAlpha 0.5`,
`lineWidth ≈ bw*0.62`) so a merged unit still reads as one while showing its constituents; geo eras (no '2') are unchanged,
and editor-drawn territories (no mask) stroke their full outline. **An intra-group '2' edge is downgraded to '1' (skipped)
when either side is an entity that did not exist yet in the era's year** (`ENTITY_SINCE` table: Baikonur 1994, S. Sudan 2011,
Kosovo 2008, Timor-Leste 2002, Eritrea 1993, N. Cyprus 1983; disputed/military zones = `1e4` = never) — so e.g. Baikonur's
border is hidden before its 1994 lease, and S. Sudan's split line before 2011 (the *external* Sudan border still draws as '0').
E.g. 2010 Sudan = Sudan+South Sudan in one group → their shared edge is skipped (S. Sudan didn't exist until 2011). countryAt / paintFill / the click popup all read `histTerr()` and hit-test
the whole group territory (so single-click selects the union, double-click drills to the sub-country — see the Atlas popup section). Editing a groups era
(`enterMapEdit`) **materializes** it to deep-copied `geo` first, so it becomes a normal hand-editable era.
A past era's **territories are
clickable/selectable** exactly like present-day countries (hover/select hit-tests the era geometry via
`histTerr()`). Every legend layer now shows at **ALL zoom levels** (`updateLegendVisibility` no longer applies a per-layer
min-zoom gate). **Capitals (`citiesToggle`) and Borders (`bordersToggle`) are separate legend layers in EVERY year** —
every era ships period capitals, so `citiesToggle` is not in `PRESENT_ONLY` and gates `drawEraCities` on historical eras
too. **Country names (`countryToggle`) also draw in every era**: on a past era `drawEraNames` labels the era territories
(anchors computed once per era by `eraLabelAnchors` — largest-ring lon-unwrapped centroid, nudged inside concave shapes —
sized by territory area, de-collided big-first, long ethnographic names wrapped to two lines; era capital labels yield to
them via `countryLabelRects`). Only major cities (`majorToggle`) remains present-day-only, and its legend row is now
**dimmed + disabled (`.legend-na`, title "Present-day map only") on past eras rather than hidden**. The **"Divisions"
(admin-1 borders, `drawAdmin`) and "Division capitals" legend layers were removed** — like Mountains, their toggle + `wire()` are
gone, `adminOn`/`divCapsOn` default `false` with no way to enable them, so `drawAdmin` + the division-capital city tier are inert
dead code (never rendered).

- **Data:** `window.TIMELINE = [ { id, year, n:label, EITHER groups:{presentCountryName:eraTerritoryName} OR geo:[ { n, p:[rings], c:[coastal-bitmask/ring] } ], cities:[ { n, lon, lat, cap } ] } ]`
  in `timeline.js`. A **merger-only** era carries `groups` (tiny — geometry comes from `world.js`); others carry
  `geo` territories — `world.js`-shaped polygons (even-odd rings) with `c` marking coastal
  edges (so only interior borders stroke). `cities` are the era's own capitals/cities (`cap:true` = a capital),
  drawn at that era's year by `drawEraCities`, which calls the **same `drawPin`** as the present-day map so the dots
  look identical (vermilion `CITY_DOT` + white ring, radius `cityDot(tier)`); labels show once zoomed past `CAP_Z`, **sized
  exactly like the present-day map** (`clamp(10+(zoom−2)·1.1, 10, 13.5)`, weight 600 — `ctx.font` MUST include a px size,
  not just the family, or the browser ignores it and the labels render tiny). **Every shipped
  era now carries COMPREHENSIVE period-accurate capitals** (~157–232 each, ~1422 total — every sovereign state + colony)
  researched + adversarially fact-checked
  with PERIOD names and capital relocations correct for the year (St. Petersburg→Moscow in 1918, Constantinople→Ankara
  in 1923, Calcutta→Delhi→New Delhi, Kristiania→Oslo, Urga→Ulan Bator, Karachi→Islamabad, Almaty→Astana,
  Rangoon→Yangon→Naypyidaw, Lagos→Abuja, Rio→Brasília). Added by `.claude/add-era-cities.js <capitals.json>`
  (matches eras by year, sets `cities`, keeps any non-capital cities, re-parses to confirm valid JS). An era applies from its `year` until the next era's (a step function). The timeline only **stops on
  map-years** — each era's `year` plus the present (the years that actually have a map): dragging/clicking the
  rail snaps to the nearest map-year, and the chevrons / arrow keys step between adjacent map-years, so blank
  years are skipped entirely (`mapYears` / `snapYear` / `stepYear`). Small rail ticks (`.tl-mark`, drawn by
  `renderMapYearMarks`) mark the stops; the "no map yet" note is therefore effectively unreachable now.
  Shipped eras: **1500, 1600, 1700, 1800, 1900, 1920, 1938, 1960, 1994, 2000, 2010, 2015, 2020** (+ the present-day map)
  — a century apart back through 1500, then roughly every other decade of the 20th c. (1900-era snapshots are sparse:
  1900/1914/1920/1930/1938/1945/1960 then a gap to 1994, so "1940"→1938
  and "1980"→1994 land on the nearest snapshot, stored at the snapshot's real year). 1500–1938 are `geo` (their
  borders genuinely differ from today; the pre-1900 eras carry period capitals + researched descriptions/spans/year
  paragraphs merged as trailing `Object.assign` blocks in `countries.js`/`country-spans.js`/`country-years.js`);
  1960/1994/2000/2010 are merger-only `groups` (rendered from world.js — e.g.
  1960 correctly merges the 15 post-Soviet states into one "USSR"). The dataset's latest snapshot is **2010**, so there is
  **no distinct 2015/2020 source**: those two eras carry **empty `groups: {}`** (which `synthGroups` renders as the full
  present-day `world.js` map — South Sudan correctly separate since 2011) plus 2010's period capitals + Juba, so they're
  accurate present-day-border stops filling the 2010→present gap. 2021–present is the present-day map (the present stop).
- **Primary method — `node .claude/build-era.js <year> [label]`** (recommended; **use this when the user
  wants a year**): fetches accurate world borders for the nearest available snapshot from the
  *historical-basemaps* GeoJSON dataset (https://github.com/aourednik/historical-basemaps, CC-BY-SA 4.0;
  ~53 snapshots 123000 BCE → 2010, incl. 1900/1914/1920/1938/1945/…), topology-preservingly simplifies (see
  above — grid-quantize + topological interior/coast classification, NOT per-ring Douglas–Peucker), and
  writes `timeline.js`. Already accurate lon/lat — no tracing, no projection guessing. Re-running a
  snapshot replaces it; eras carry `src:"historical-basemaps"`. (Needs a build-time network fetch.)
  Era rings are stored **closed** (first vertex == last) so the per-ring `c` mask and the globe's
  `i+1 < ring.length` border stroke both cover every edge *including* the closing one — don't reintroduce
  open rings (a missing closing edge leaves 1-segment gaps in landlocked outlines). **Gotcha:** if an era
  was ever opened in the in-app editor, a copy is persisted to `localStorage` `ADMIN_EDITS.timeline` and
  **shadows the rebuilt `timeline.js` at startup** — clear that overlay key (or re-import the era in the
  editor) to see a fresh `build-era.js` run.
- **The in-app editor — Edit → Timeline → "Open globe editor"** (sets `atlasEditEraId`; the Atlas enters
  edit mode for that era). Enter a year (existing or new) and edit on the globe via a toolbar
  (`#mapEditBar`). Tools: **Select** (tap a territory/place to select; **drag a vertex** to reshape; drag a
  place to move; **Delete** the selected territory/place), **Draw** (tap to drop vertices → **Finish
  polygon** → name it), **City** / **Capital** (tap to place + name). Edits mutate the era in
  `window.TIMELINE`, bump `mapEditRev` (invalidates the render cache via `viewKey`) and persist to the
  overlay; **Done** returns to the editor. Drawn territories carry no `c` mask, so their full outline is
  stroked. (The old PNG image-tracer was removed; `traceMapToGeo` remains in `app.js` but is unused. Not
  yet in the editor: inserting/deleting individual vertices — move existing ones or redraw.)
- **Seeding accurate borders:** `build-era.js` (above) imports real historical borders for a year; open the
  result in the globe editor to clean it up, reshape, or add capitals/cities.
- In-app eras live in `ADMIN_EDITS.timeline` until **Save to project** writes `timeline.js`. Verify on the
  globe at the era's year (no console errors).

## Testing

- Fastest check: open `index.html` in a browser and watch the console for errors. The app uses
  `localStorage`, which works from `file://` in Chrome.
- After editing JS, run `node --check app.js` to catch syntax errors before reloading.
- For automated checks, Playwright + headless Chromium works well (navigate via `location.hash`,
  screenshot pages, assert zero console errors). Loading `data.js` / `glossary.js` / `world.js`
  under Node requires setting `global.window = {}` first.
- Put any Unicode (Chinese text) used in a test script into a file — don't pass it inline via
  `node -e`.
- **Twenty-four committed regression tests** (in `.claude/`, not loaded by the site): twenty-one drive a real browser with
  Playwright; `test-daily-quote.js`, `test-discovery.js` and `test-date-line.js` are plain Node with no dependencies at
  all (`test-card-types.js` is half and half — its XP, CSS-scoper and template-engine assertions need no browser).
  Each slices what it tests out of the real `app.js`/`_headers` by text, so they can't drift from what ships.
  **Gotcha when writing more of them:** `page.goto()` to a URL that differs only in the `#fragment` is a
  same-document navigation — the app keeps running and its module state survives. Use `page.reload()` when
  a test means "start fresh", or navigate through the UI. Several early failures were this, not real bugs.
  **And close any IndexedDB connection the test itself opens** — an idle one blocks the app's own open after a
  reload, which silently pushes it onto the localStorage fallback, and the test then goes looking for a deck in
  the store the app has just stopped using (`test-card-types.js` learned this the hard way).
  · `node .claude/test-sanitize.js` — 48 XSS vectors through `sanitizeHTML()`, each one also injected into
    a live DOM to confirm nothing executes. **Re-run after touching `SANITIZE_*` or `sanitizeUrl`.**
  · `node .claude/test-csp.js` — serves the site with the real `_headers` CSP and walks every route,
    failing on any violation. **Re-run after changing `_headers`, or adding an inline script/`eval`.**
  · `node .claude/test-community.js` — 40 assertions end-to-end: write a deck in the Studio, reload,
    study it, export, import, delete; plus that a hostile deck file executes nothing, and that community
    content never reaches `CARD_DATA` / the tree / the glossary / the admin overlay / the daily games.
    **Re-run after touching the `COMMUNITY DECKS` module or the Studio.**
  · `node .claude/test-admin-editor.js` — the curated-content editor: open a card, type, confirm the
    overlay records it, revert, the HTML source box, and gloss popups. **Re-run after touching
    `liveCardEditorHTML` / `wireLiveCardEditor`** — that surface is shared with the Studio.
  · `node .claude/test-publish.js` — 62 assertions across three browser sessions (an author, a reader, an
    admin) driving publish → browse → install → update → report → hide → rate → staff-pick → fork → export. It runs against an
    **in-memory mock of the Supabase REST API**, deliberately: the publishable key in app.js points at the
    real project, so a test that really published would write rows into it. The mock also enforces the
    ownership rule, which is how "a stranger cannot patch someone's deck" is asserted. **Re-run after
    touching the publishing functions or `.claude/supabase-schema.sql` — and keep the mock in step with
    the policies, since it is only a stand-in for them, never a proof that the real RLS is right.**
  · `node .claude/test-deck-glossary.js` — 22 assertions on per-deck glossaries: the three `glossMode`s,
    the popup, and above all **isolation** (a curated card never links a deck's term; a second deck never
    sees the first's), plus a hostile glossary in an imported deck. **Re-run after touching
    `glossSourcesFor` / `buildGlossIndex` / `uGlossSanitize`.**
  · `node .claude/test-i18n-lang.js` — 28 assertions, in two halves. First the **English-only gate**, on the
    real app.js: `?lang=ja` does not switch the site, Settings offers no picker, and not one translation
    file is fetched. Then everything else — the machinery kept behind `MULTILANG` — against an app.js the
    test's own server rewrites `const MULTILANG = false;` → `true` as it serves it, so the preserved code
    stays tested instead of quietly rotting until someone flips the flag back. **`patchApp` asserts the
    string was found**, and one assertion at the end reports it, so renaming the flag fails loudly here
    rather than leaving this file testing an app that can no longer switch language at all.
    That second half is the original test: a reader downloads one language and not all of them (an English
    reader downloads none), switching pulls only the new language, Japanese is at parity with the other
    languages across chrome/cards/glossary — **parity with EACH OTHER, not with the English count**, since
    every card and term added since the gate went up is English-only, so a test demanding equality with
    `GLOSSARY` is red by design and therefore read by nobody (it was, at 24/4, until Aug 2026). Both halves
    still bite: a batch that translates one language and forgets the rest fails, and so does a card
    translated into only some. **Tighten it back to `Object.keys(GLOSS).length` when translations resume.**
    Also asserted: — the sharp edge of this layout — a `glossaryI18n` overlay
    delta records ONLY the edited language, LAYERS over the shipped text so an edit made in one language
    cannot wipe another's, bakes to one file per edited language holding every term, and NEVER bakes a
    language whose file isn't loaded. **Re-run after touching `MULTILANG` / `langBundle` /
    `glossI18nIngest` / `glossI18nMerged` / `setGlossI18nEdit` / `serializeGlossaryI18n` /
    `editedGlossI18nLangs`, or after adding a language.**
  · `node .claude/test-account-switch.js` — 22 assertions on switching accounts on one device, against an
    in-memory mock of the Supabase **auth + progress** endpoints (a test that really signed up would create
    users in the live project). It asserts both halves of the rule: a guest's study history still migrates
    into their FIRST account, and a newly created second account starts at level 1 with no badges, no streak
    and no heatmap — in the store, on the server row, and on the page (first-run hero, "0 unlocked"). **Re-run
    after touching `supaAfterSignIn` / `supaSignOut` / `supaBoot` / `_supaOwner` / `PROGRESS_FIELDS`.**
  · `node .claude/test-video.js` — 89 assertions on card + glossary videos: that every accepted link shape
    resolves to the embed this code builds and **every other URL resolves to no player at all** (the check
    that keeps an `<iframe src>` off untrusted input), that the frame is byte-for-byte the image's frame
    (computed border-radius / aspect-ratio / border / size), that the expand control opens the viewer and a
    click on the player does not, and that a community deck's `javascript:` video src is dropped on ingest.
    Above all it pins the **one-frame rule** from every side: a card or term given both renders one frame,
    a URL of one kind retires the other in the store *and* on screen, the tombstone survives a reload (the
    keystroke bug above), and Revert brings the shipped picture back. On the card surface it also pins the
    **auto-recognition**: the single `data-mediafield` box files a video link as a video and a picture link as
    a picture, says which it decided on, and offers no second empty frame. It also pins **what a dead link
    does** — the failure that is guaranteed rather than hypothetical, since there is no upload path: a
    same-origin 404 leaves the AUTHOR the frame, marked and worded, and leaves the READER nothing at all
    (`height:0`, out of the flow — not a blank 16:9 box), with a click on it opening no empty viewer.
    Both halves matter: hiding it everywhere would leave the author with no way to notice.
    **Re-run after touching `videoSource` / `cardVideoHTML` / `openMediaViewer` / `retireOther*Media` /
    the delegated `error` listener / `.media-dead` / the media panel, or the `media-src`/`frame-src` CSP.**
  · `node .claude/test-gloss-image.js` — 44 assertions on glossary images: the popup floats one to the
    top-right of the body within a 150px × half-the-popup box — the LIMITS, not the shape, since Aug 2026 —
    **shown whole rather than cropped** (`object-fit:contain`, and the rendered box keeping the file's own
    proportions), with the prose starting level with it rather than below it; it opens the SHARED fullscreen viewer and that viewer stacks **above** the popup,
    the curated editor's overlay delta survives a reload and clears cleanly, and a deck's own term images
    are sanitized on ingest (a `javascript:` src is dropped). **Re-run after touching `glossImage` /
    `renderGlossImage` / `setGlossImageEdit` / `uGlossSetImage`, or any z-index in the gloss/viewer stack.**
  · `node .claude/test-media-source.js` — 36 assertions on the media source gate: that an uncredited URL
    really is **absent from the store** rather than merely marked, that it is still shown to the author
    and flagged (so the gate reads as "not yet", not "nothing happened"), that leaving the URL field asks
    for the source and navigating away warns instead of losing it, that an answer commits the whole object
    at once, that **clearing the source takes the picture back out**, and that a shipped credited picture
    is untouched by any of it — on all four surfaces (the card's one media box with a picture in it, the same
    box with a video link in it, the curated glossary, the Studio term). **Re-run after touching
    `wireMediaSource` / `askMediaSource` or any media panel's wiring.**
    Its `typeInto` sets a field's value and dispatches `input` by hand: `page.fill()` can land on a box the
    URL keystroke has only just revealed and the value never arrives — and a programmatic value fires no
    `change`, so the blur-asks-for-a-source case dispatches that itself.
  · `node .claude/test-feedback.js` — 39 assertions on reader feedback: the About-page form (a message
    that reaches the row with its line breaks intact and its markup gone, the device-local cooldown, and
    that **the sender never supplies a triage status** — the client half of what the column guard enforces)
    and the Edit-page queue (the filters, that **no two statuses paint the same row edge**, the toggling
    swatches, the private note, the two-step delete, and that a session saved on the retired Accounts tab
    opens on Cards). Supabase is an in-memory stand-in, deliberately: the publishable key in app.js points
    at the REAL project, so a test that actually sent a message would write rows into it — and like
    `test-publish.js`'s mock, it is a stand-in for the policies, never a proof they are right. **Re-run
    after touching the feedback functions, the queue, or the `7) FEEDBACK` schema block.**
  · `node .claude/test-sources.js` — 74 assertions on source footnotes, on all three surfaces. Most of them are
    about the JOIN between the prose and the list, since that is where a footnote apparatus rots: a marker shows
    the number of the entry it actually opens, a bare marker takes the next number in reading order, and a marker
    pointing **past the end of the list is removed** rather than left claiming a citation the reader cannot follow.
    Plus: the fold is **open everywhere by default and remembers being shut** — in the store and across a reload,
    written by the header and never by a marker jump — the Atlas section is hidden outright when a place has nothing,
    a place cited by both its general and its year paragraph gets **one** footnote and not two, the citation text
    is `notranslate`, a hostile deck's `sources` are sanitized on ingest, and an admin's typed citations reach the
    overlay as a `sources` delta and come back after a reload. **A whole unwired surface is exercised too** —
    the fold replaced by a listener-free clone and every marker blanked — since that is the shape both reported
    failures took, and it is invisible unless something asserts it: on that clone the numbers still print, the
    header still toggles, **and the links and chips are still there**, because the list is serialized wired
    rather than fixed up after render. The editor's own sources panel is exercised as the rich rows it now is:
    a shipped citation's italics render rather than showing their tags, and the ribbon's **+Source** button puts
    an EMPTY marker in the background and a blank citation row below it in one press. The **access chip** is
    guarded too: one chip per
    labelled citation and none invented for an unlabelled one, open and paywalled told apart by class **and by
    colour** so the difference survives without reading the words, the chip outside the anchor so it can never
    read as part of the URL, and the brackets gone from the render while the stored string keeps them.
    **Re-run after touching the `SOURCE FOOTNOTES` block, `wireFootnotes` / `sourcesHTML` / `normSources` /
    `linkifySrcItem` / `replaceInSrcText`, the `.src-access` styles, the editors' sources boxes, or the
    `fn` / `data-fn` sanitizer allowlists.**
  · `node .claude/test-layout.js` — 211 assertions on **the shell**: the rules that break silently because
    nothing throws when a layout is wrong. The phone's bottom tab bar (present, labelled — *every* tab, not
    just the active one, which is the top bar's behaviour — each name **centred under its own icon**, the
    selected one included, since one tab off out of five reads as a design; routing; no Library and no
    About, which the home page's banner and its grey line carry now; and gone while grading); the home
    page on a phone
    (one column, no pager, no card of the day, no gloss of the day and no Atlas teaser — none of which is
    BUILT there, so a missing assertion costs a phone the ~1.6 MB globe; the "+ Add decks" lip hanging off
    the bottom of the review group, centred, narrower than the group, routing to the collections and filled
    in the site's own `--indigo` read off a probe rather than hard-coded; the
    Minigames heading over a 3 × 2 grid whose tiles carry no tagline; the About link last, routing to the
    About page and with room above and below it; no Seen total; the review's three Anki piles — new /
    learning / review, in order, no two
    the same colour, repeated unlabelled in the same colours on each added deck's row, with the button
    CENTRED against them; and that deck row on ONE line — every part in a single horizontal band, its
    figure reading `N/N studied`, its bar underlining the row instead of taking width from it, and the
    deck's NAME not cut off at 390px, that being what gives way if the arithmetic ever stops working) and the same page above the breakpoint, where the day's card, the day's term, the
    Atlas teaser and the taglines are all still there and the lip, the heading and the About line are not;
    the whiteboard marker on a phone (clear of the tab bar, no Draw button, the sizes toggling the pen, the
    custom colour picked in the inline picker — its hue bar setting the hue, its field the saturation and
    brightness, the choice surviving the session, and **no `input[type=color]` anywhere**, which is what a
    revert to the platform dialog would look like — and **Show answer and the grade row still tappable with
    the pen down**, which is the assertion holding up the hit-test in `setupWhiteboard`); the Atlas place sheet's
    drag-to-resize (taller, capped at the top of the screen, remembered into the next place, and its title
    bar still showing at the floor); the daily quote keeping its height — and everything under it its
    position — when flipped to its original language; the Atlas panel's discovery chip sharing
    the title's row and its sections likewise unskippable; the CHAIN of
    things anchored to the bottom of the viewport, where the globe stage, the Atlas timebar and the tab bar
    are stacked by arithmetic over `--timebar-h`/`--tabbar-h` and each edge must meet the next exactly, at
    three widths; the rail's year labels never overlapping at four widths, with the two ends always kept;
    the Atlas search and legend as chips covering under 3% of the map, opening and closing again; the
    Settings page carrying NO language picker while the site is English-only, with the light/dark switch
    beside it untouched — and a language stored before the picker went being brought back to English on
    load, which is the one way removing a setting can strand somebody; the
    one-row grade bar and the study page's padding clearing it — and its two HEIGHTS, where dragging the grip
    down must genuinely halve it (a "compact" state saving 15px is not what was asked for), leave the four
    grades as bare colours that a screen reader can still name, keep the ? and Suspend beside them rather
    than dropping them, and take the page's bottom padding down with it — note that the fold is ANIMATED
    since Aug 2026, so a height read sooner than `GB_FOLD_MS` after the press measures a state half way
    between the two; the Text size setting, which is a SLIDER filling its row (asserted, that being the
    visible half of the request) and which must
    grow the card and the glossary popup and must leave a tab label and a grade button exactly where they
    were, that being the difference between a reading scale and a page zoom; Settings and Account filling the stage;
    a coming-soon collection carrying no level badge and no XP bar; and **no overlay outliving the page
    that spawned it** — a real level-up is raised (three cards graded Easy) and dismissed by a HASH CHANGE,
    never a click, since a click would dismiss it anyway and prove nothing.
    **Re-run after touching `.tabbar` / `--tabbar-h` / `--timebar-h` / `layoutTicks` / the Atlas chrome's
    media queries / `.settings` / `.auth-split` / the coming-soon rows / `wireOnePageSwipe`
    / `.rv-lip` / `.games-sec` / `.home-about` / `gameSub` / `pileCounts` / `adProg` / `.active-deck` /
    `gbWireResize` / `.gb-fold` / `body.gb-compact` / `wirePageSwipe` / `SWIPE_ORDER` /
    `makePageGhost` / `clipStageFor` / the `.page-next`/`.page-prev` keyframes /
    `applyTheme`'s `data-fs` / `var(--fs)` / `.fs-slide` / `#fsRange` / `MULTILANG` /
    `ensureWBTools` / `.wb-pick` /
    the ink layer's pass-through /
    `cpWireResize` / `cpPaneNeedH` / `cpFitH` / `lockHeight`, or after adding an overlay to `document.body`.** Its clicks go through `evaluate`
    rather than `page.click`: clicking an element the
    CSS has hidden waits 30s and then THROWS, and a missing chip is exactly what some of this is here to
    catch — it has to report, not abort the file. Verified against five deliberately reintroduced
    regressions (a no-op `layoutTicks`, the chip's source-order bug, the collapsing labels, a `render()`
    that forgets `closeCongrats`, and the tab label's two-class rule); each was caught.
  · `node .claude/test-discovery.js` — 22 assertions on the counting behind the discovery chips and the
    "Beyond the cards" meters, run against the **real** `world.js` / `timeline.js` / `glossary.js`: that a
    register full of historical territories can never push the country figure past its own total, that a
    retired glossary term drops out of the count, that an unloaded `world.js` yields an honest unknown
    rather than a confident zero, and — the assertion most likely to fire on someone else's change — that
    **`SEEN_CAP` still clears the shipped universe with room to spare**, since every geo era added to
    `timeline.js` grows it and a prune would make a completion count go backwards. **No browser and no
    dependencies.** Re-run after touching `markSeen` / `SEEN_CAP` / the `*SeenCount` helpers, **and after
    adding a timeline era or a batch of glossary terms** — the sizing, not just the logic, is what it
    guards.
  · `node .claude/test-a11y.js` — the accessibility floor (Aug 2026), and every one of its three passes covers
    something that fails SILENTLY. **Names**: every visible control resolves an accessible name, which in a UI
    made largely of SVG is the commonest screen-reader failure — an icon-only button with no `aria-label` is
    announced as "button" and nothing else. **Keyboard**: every control is in the tab order, a non-native one
    declares a role, the first Tab lands on the skip link, and — operation, not merely reach — a `.switch`
    answers to Space and reports its state, a `.ttip` opens on Enter. **Contrast**: every text node's computed
    colour against the paper it ACTUALLY renders on (the ancestor walk, alphas composited), at 4.5:1, or 3:1
    for large text. Measured live rather than from the token table, so a rule that re-tones something in one
    theme is caught. The default mode is REPORTED — the quiet tokens are quiet on purpose and the high-contrast
    mode is the answer to them — while **with `body.hc` on, nothing may fall short**, which is the assertion.
    **Re-run after touching a control's markup, `body.hc`, or any theme's colour tokens.**
  · `node .claude/test-daily-quote.js` — 7 assertions on the home page's daily-quote running order: it
    simulates 400 days off the real `QUOTE_ORDER` and checks every seven-day window in them, so a repeat
    two days running or a third appearance inside a week fails here rather than on the live page. **No
    browser and no dependencies** — the pieces are sliced out of `app.js` and run in a `new Function`.
    The rule is a property of the ARRANGEMENT, so it breaks silently: **re-run after adding or removing
    quotes** (a fifth Confucius line tightens the pool) as well as after touching `quoteRunningOrder`.
  · `node .claude/test-date-line.js` — 13 assertions on the card date line, run against the real `data.js`:
    that every shipped card's `answerDate` is still a LIST OF DATES and not the paragraph it replaced
    (the check is content-aware, since an old date line wore exactly the same tags), that the limits in
    `date-line.js` still describe a glance, that every card stating a date still yields a sort year from
    it — four cards on the pre-conversion data yielded none — and that **no card naming a deep date sorts
    by the year it was dug up**, which is how Atapuerca came to sort at 1978 CE. Plus the compact
    notation itself: `BP`, `cal BP`, and the ranges that write their unit once, where reading only the
    closing number sorts a card from the wrong end of its own era. **No browser and no dependencies.**
    Re-run after touching `cardYears` / `date-line.js`, **and after any batch of date lines** — the field
    is edited card by card and grew into a paragraph the same way.
  · `node .claude/test-review-decks.js` — the daily review's decks and the study session that comes out of
    them (Aug 2026). Everything it guards fails SILENTLY: nothing throws when a review quietly takes all its
    new cards from one deck, when a reload drops a session on the floor, or when a long press does nothing.
    It asserts that **both added decks contribute** to the day's new cards and that they are drawn at random
    across them (the bug this replaced sliced the whole allowance off the front of one deck's list — so it
    STUDIES the whole review through and reads back which deck each card came from, since a queue that looks
    right can still have been built wrong); that a deck's row shows **its own remaining allowance** rather
    than its share of the pooled review; that a **reload stays in the session**, on the same card, asking the
    same phrasing, still turned over if it was turned over, and that leaving forgets it so a bare `#study`
    goes home; that the **phrasing chevrons** change the question and the change sticks; that holding a row
    opens **Custom study / Daily limits / Skip today / Remove** and each does what it says, the bin having
    gone; and that the **Folio level caps** the decks a review will take — with the shipped default
    `S.active` (a deck of the coming-soon China collection) NOT filling that one slot.
    It also pins the **review's own limits** (Aug 2026): the banner's sheet carries the deck sheet's rows
    minus Remove, its Daily limits opens on the REVIEW and shows the allowance it is actually using, its
    default is the WIDEST deck's rather than a global figure (two decks at 5 draw 5, from the ten between
    them), and an explicit limit set there caps the pooled draw **without changing what a deck offers when
    tapped on its own** — which is the distinction the whole design turns on and which nothing on screen
    states. **Re-run after
    touching `reviewQueue` / `reviewLimits` / `REVIEW_ENTRY` / `deckLimits` / `deckDoneToday` / `entryPiles` /
    `openDeckMenu` / `addActive` / `maxActiveDecks` / `STUDY_KEY` / `qIdx`, or `buildSession`'s per-deck
    allowances.**
  · `node .claude/test-atlas-places.js` — the Atlas's label crowding, its heightmap strength slider, and a
    glossary term's way onto the map (Aug 2026). All three fail silently: a map that quietly writes forty
    overlapping names looks like a map, a slider that does nothing looks like a slider, and a marker that
    flies you somewhere and highlights nothing looks like a flight. It asserts that the shipped
    `GLOSSARY_PLACES` coordinates are all PLAUSIBLE (a `[0,0]` is what a failed fetch leaves behind) and
    that the country join shipped with them; that `CITY_SEP` falls with zoom and starts at a whole region
    — sliced out of app.js by text, since the labels are drawn on a canvas and there is nothing in the DOM
    to measure, the same technique `test-daily-quote.js` uses; that the slider is hidden while the layer is
    off, live while it is on and remembered; that a point term and a country term show the marker and a
    term that is neither does not; and that pressing it reaches the Atlas, closes the popup and opens **no
    info panel** — the reader has just read the term, and a second description is not what the marker
    offered. **Re-run after touching `glossPlace` / `focusPlace` / `CITY_SEP` / `computeCityLayout` /
    `gsIndex` / `hmOpacity`, or after re-running `.claude/fetch-place-coords.js`.**
  · `node .claude/test-units.js` — the two Settings that REWRITE what is already on the page (Aug 2026):
    measurements, and light/dark from the device. The units transform is a regex over every text node, so
    its two failure modes are a bracket it fails to recognise (both systems left on screen — it looks as
    though the feature was never built) and a bracket it recognises wrongly (an ordinary parenthesis eaten
    out of a sentence — it looks like a typo in the card). **The corpus sweep is the assertion that
    matters**: the engine is sliced out of the real app.js by text and run over every shipped card and every
    glossary term, demanding 0 missed and 0 taken in error (341 fields transform today). It also pins that
    the SHIPPED DATA still carries both figures after a reader has chosen one — the display transform must
    never reach the store, which is the whole reason it is a DOM pass. On the theme: a first visit follows
    the system in both directions, a manual Night flip takes the decision back and holds it across a
    reload, and **an older save keeps the light/dark it chose** — the one way this change could strand
    somebody. **Re-run after touching `unitizeText` / `unitizeTree` / `applyUnits` / `applyTheme` /
    `setNight` / `setThemeAuto`, and after any units batch.**
  · `node .claude/test-glossary-page.js` — the discovered-terms list and the page transition (Aug 2026).
    The list must drop a term retired since it was read (it would open a popup onto nothing) and a deck's
    own term (never part of what the meter counts); both filters are invisible until they are wrong. The
    GHOST is the other half: the outgoing page is cloned into the document for a quarter of a second, so it
    is asserted to carry **no `id`** (the new page's wiring could find the dead copy) and **no control
    `name`** (a radio group is document-scoped outside a form, so the ghost's radios joined the new page's
    and a click that had landed read back as never having happened — which is how it was found), to be out
    of the accessibility tree and out of the way of a click, and to be gone a moment later. Plus: the Atlas
    opts out in BOTH directions. It also guards the **SORT** (Aug 2026): alphabetical is asserted against
    the ORDER rather than against the picker's value — a control that changes nothing looks exactly like
    one that works — and, the assertion most worth having, that re-sorting KEEPS a filter the reader has
    typed, which the obvious two-handler implementation silently throws away. **Re-run after touching
    `makePageGhost` / `.page-ghost` / `PAGES.glossary` / `GLOSS_SORTS` / `glossSeen`.**
  · `node .claude/test-library.js` — the Library (70 assertions): the rename, the shelf, one book, and the
    reader's place. Each half guards something that fails SILENTLY. **The rename**: `#decks` must still
    resolve (every link ever shared points at it) while calling itself Collections everywhere, and exactly
    one nav tab may read "Library". **The laziness**: it watches the request log and asserts no
    `books/*.js` is fetched on boot OR on the shelf, and is fetched on the book — a book on the eager path
    just makes the site slower, which nobody reports. **The place**: stored as a chapter NUMBER and a
    FRACTION (an index moves when the book grows; a pixel offset moves when the text size does), surviving
    a real RELOAD rather than a re-render, and a deliberate chapter change starting at the top. **The
    apparatus**: notes numbered in reading order by `wireFootnotes` with no marker past the end of the
    list, and — the assertion most worth having — it walks **every chapter of every book** asserting no lowercase
    surface is ever glossary-linked, which is what keeps `genus`, `epoch`, `iron` and `bronze` from
    quietly mis-defining Seneca. Note that letter 3 contains no glossary term at all, so an assertion
    pointed there passes on nothing; letter 9 is the one to use. **The front matter** (Aug 2026): the book
    opens on chapter 0, there is exactly one of it, it carries the translator and the licence, and — the
    other half, which fails the opposite way — that rights box is NOT repeated under every chapter, and a
    letter still carries the section numbers by which the text is cited. **Once the original is loaded it
    must carry TWO licence boxes** — the Latin is out of copyright by AGE and Gummere's English by its date
    of publication, and running them together is how the distinction that decides what may be shelved here
    gets lost (it failed silently once: the front matter was built before the original's own file landed).
    **The bilingual reading** (section 6, Aug 2026), nearly all of which fails silently: the original is
    not fetched until asked for; a wide screen sets the two side by side and a narrow one shows ONE; each
    row holds the same section number **in both columns' own rendered markers** (checking `data-sec`
    against itself would prove nothing); the glossary reaches the translation and not the original;
    tapping the page turns it over and **lands on the same section**, having actually had to move the
    scroll to do so; a tap on a glossary term does NOT turn it; and the choice survives a reload.
    **The shelf's own licence paragraph is gone** (on request) and the one-line blurb replacing it is
    asserted with it — they fail in opposite ways. **No Wikisource stylesheet in the
    prose**: read off the SHIPPED data over every chapter of every book (`shippedBookLeaks`), not off one
    rendered page, because the leak sat in 24 of 335 notes and each is visible only to a reader who opens
    that chapter's fold. **The chapter SLIDE** (Aug 2026) is measured MID-FLIGHT for the same reason the
    page swipe's is — the panel leaves the way the finger went, the next arrives from the other side, the
    stage clips while they travel and releases after. Note that the whole-book proper-noun sweep now runs
    under `emulateMedia({reducedMotion:"reduce"})`: it clicks 125 tabs a hundredth of a second apart, and
    against an animated chapter change it would measure the FIRST chapter 125 times over and read as a book
    with almost nothing linked in it. **Re-run after touching `PAGES.library` /
    `PAGES.book` / `BOOKS` / `bookIngest` / `bookIntroChapter` / `bookNotesHTML` / `linkProperNounsOnly` /
    `readingPos` / `setReadingPos` / `bookSections` / `bookRows` / `applyLangMode` / `anchorNow` /
    `slideChapter`, after running `fetch-book.js`, or after renaming anything on the Collections page.**
  · `node .claude/test-account-page.js` — the SIGNED-IN account page and the Edit dashboard's account
    figures (Aug 2026). Neither is reachable without a session, so Supabase is a `page.route` stand-in —
    deliberately, and for the same reason as `test-publish.js`'s mock: the publishable key in app.js points
    at the REAL project. Like that mock it is a stand-in for the policies, never a proof they are right.
    It asserts Change password beside Sign out inside the profile card with the sync line under the two of
    them, that the glossary meter is a link on your own record, and that the dashboard's People panel fills
    from the database and still says in prose what RLS will not let it count. **The mock sends
    `Access-Control-Expose-Headers: Content-Range` on purpose** — that header is not CORS-safelisted, and a
    mock that forgets it reports a connection failure that is really a CORS one. **Re-run after touching
    `acctSelfView` / `adminRenderDashboard` / `dashLoadRemote` / `supaFetch`'s count parsing.**
  · `node .claude/test-card-types.js` — the XP curve and community-deck **card types** (Aug 2026), 110
    assertions in three parts. The **XP** part slices `levelFromXP` out of app.js and walks every threshold
    through level 13, so the shape of the curve is asserted rather than three sample points. The **pure** part
    runs `sanitizeCSSText` / `cssScoped` / `tplRender` as string functions with no browser at all — a scoping
    bug reads far better as a failed comparison than as a screenshot of a restyled page — and its central
    assertion is that a type's `.studio-tab{display:none}` cannot reach the site around it (probed on
    `.studio-tab` and NOT `.tabbar`, which is `display:none` above 640px anyway and would pass whatever the
    scoper did). The **browser** part builds a type and a card of it through the real Studio, studies it,
    reads the store back to prove the type travels with the DECK, and finally imports a **hostile deck file**
    through the real file picker: a type calling itself `basic`, a field name that is markup, an `onclick` in
    a template, a `javascript:` href, and CSS carrying `</style>`, `@import`, `url(javascript:)` and
    `position:fixed`. **Re-run after touching the CARD TYPES block, `cardTypeSideHTML` / `ensureCardTypeStyle`
    / `uCardSanitize` / `uDeckSanitizeMeta`, the Studio's Types tab, or `levelFromXP`.**
  Playwright is a dev dependency and must NOT be installed into the repo (the zero-dependency rule, and
  `node_modules/` is gitignored) — install it in a scratch folder and run with
  `NODE_PATH=<that>/node_modules`. Set `FOLIO_CHROMIUM=<path to chrome>` if Chromium lives outside the
  playwright package; otherwise the default launch is used.

## Environment

- Developed on Windows. Use forward-slash relative paths inside the site.
- The project is a **Git repo** (initialized Jul 2026) so any change can be reviewed and rolled back — commit meaningful
  changes as you go.
- **Cloud sessions (claude.ai/code, driven from the phone)** — when this project is worked on from an Anthropic cloud
  sandbox instead of the desktop: (1) the sandbox clones from **GitHub** — anything uncommitted on the desktop is
  invisible, and desktop sessions must push before/after a travel period; (2) cloud sessions **cannot push to `main`** —
  work lands on a feature branch and a PR, which the user merges from the GitHub mobile app (merge to main = the
  Cloudflare Pages deploy); (3) there is **no live-preview browser panel** — verify with `node --check`, Node scripts
  (`global.window = {}` then `require(...)` for the data files), and if visual verification is needed install
  Playwright + headless Chromium in-session (see Testing above); (4) the desktop machine's Claude memory files do NOT
  load in the cloud — **this CLAUDE.md is the only operational memory**, so keep it current exactly as the golden rule
  says; (5) the user may also make content edits from their phone via the LIVE site's admin editor (the
  `content_overrides` cloud overlay) — before shipping content-file changes from a cloud session, check that overlay
  isn't carrying unbaked live edits, and after baking remind the user to reset `content_overrides.data` to `{}`
  (Supabase Table Editor) per the hygiene rule above.
- **Online accounts + sync (Supabase)** — LIVE in app.js (the `/* Supabase */` module after the legacy accounts block).
  Static hosting on Cloudflare Pages fed by GitHub pushes (`git push` = deploy; content files like `data.js` ship with deploys).
  Schema + RLS: `.claude/supabase-schema.sql` (applied; tables `profiles` / `progress` / `friends`; signup trigger creates the
  profile + empty progress row). Plain `fetch()` (no SDK — zero-dependency rule); the publishable key in app.js is safe to ship
  (security = RLS). **Offline-first**: localStorage stays the working copy; `save()` → `supaQueuePush()` (6s debounce, skips
  no-ops) PATCHes the whole `PROGRESS_FIELDS` blob into `progress.data`; boot (`supaBoot`) refreshes the session, pulls, and
  reconciles — server wins when its `updated_at` ≠ the device's `S._supaTs` baseline (another device wrote), else local pushes.
  Sign-in adopts server progress (or MIGRATES local progress up if the server row is empty); the pre-sign-in device state is
  stashed (`folio_supa_guest_v1`) and restored on sign-out. **That migration is OWNERSHIP-GATED by `S._supaOwner`** —
  the account id the progress currently in localStorage belongs to (device-local like `_supaTs`, so it never syncs
  itself). Migrating up is right for a guest who studied before ever making an account and WRONG for every account
  after the first: without the gate, creating a second account on a device silently adopted — and then permanently
  owned, since we push it up — the previous account's levels, badges, streak and heatmap. So `supaAfterSignIn` migrates
  only when the local progress is unclaimed or already this account's, and otherwise **wipes to `emptyProgress()`**;
  `supaClaimGuestStash()` marks the stash claimed at the moment it migrates (or signing out and into a THIRD account
  would inherit it again), the stash carries its `owner` back on sign-out, and `supaBoot` back-fills ownership for
  sessions signed in before the field existed. Guarded by `.claude/test-account-switch.js`. Auth = email+password (`/auth/v1/*`); emailed links (confirm/reset)
  land with tokens in the URL hash → `supaBoot` adopts them (requires the Supabase **Site URL** to point at the deployed app).
  The account page (auth/self/friends views) is fully server-backed; friends use the `friends` table (request → accept, RLS lets
  accepted friends read each other's `progress` for the badges view). **Admin gating** (`adminEligible()` / `isAdmin()`): a
  signed-in user is admin-eligible iff `profiles.role === 'admin'` (set via the dashboard Table Editor); a signed-in non-admin is
  NEVER eligible; a signed-out guest is eligible only on a **dev origin** (`isDevOrigin()`: `file://` or
  localhost/127./10./192.168.) with no legacy local accounts — so the dev machine keeps its editor, while first-time visitors and
  non-admin accounts on the live site see no Edit tab or Editor/Visitor switch (`applyMode` shows the switch only when
  `adminEligible()`). `isAdmin()` additionally honours the Editor/Visitor toggle (`S.settings.adminMode === false` → visitor view).
  The old local accounts (`folio_acct_v1`) remain only as legacy code (guest stash helpers); their admin-page
  user-manager went with the Accounts tab when the reader-feedback queue replaced it.
- **Live content editing (cloud overrides)** — the `/* cloud content overrides */` module in app.js + the `content_overrides`
  table (single row `id=1`, in `.claude/supabase-schema.sql`; **the user must run the SQL once** — until then every fetch 404s and
  the module degrades silently). The row's `data` holds an admin-edit overlay in the exact `folio_admin_v1` delta format. Every
  visitor (anonymous included, RLS select = public) runs `cloudBootOverrides()` after `supaBoot`: if the row's `updated_at` differs
  from the device's baseline (`localStorage["folio_cloud_ts_v1"]`), the overlay is adopted via `reapplyAdminOverlay(row.data)` +
  persisted, so live-site edits reach all visitors within seconds of their next load. A **signed-in admin** publishes automatically:
  `writeAdminEdits()` (the single overlay write choke-point) calls `cloudQueuePush()` (4s debounce, skips no-ops) which PATCHes
  `ADMIN_EDITS` into the row (RLS update = admins only). **Dev origins neither publish nor adopt, signed-in or not**
  (`cloudBootOverrides` returns early on `isDevOrigin()`; `cloudCanPublish()` requires `!isDevOrigin()`): the dev machine's
  in-flight local overlay is never clobbered by the cloud copy, and it never publishes — a dev overlay empties whenever it's
  baked into the data files, so publishing it would wipe live edits (this actually happened in testing: a signed-in localhost
  tab auto-published its empty overlay over a fresh live edit; don't weaken these guards). Live editing is therefore
  live-site-only. Adopted/loaded overlays pass through `normalizeAdminEdits()` (used by `loadAdminEdits` +
  `reapplyAdminOverlay`), which guarantees every overlay section exists whatever the input (a bare `{}` row can't crash
  `applyAdminEdits`) and **must list every overlay key — `mission` was once missing from the load path, silently dropping
  Mission-page edits on reload**. **Hygiene:** after baking the overlay into `data.js`/`glossary.js`/`timeline.js` and
  deploying, reset `content_overrides.data` to `{}` (Table Editor) so a stale cloud overlay can't shadow the newer shipped files.
