# `.claude/fetch-book.js` — the Library importer

Moved out of CLAUDE.md (Aug 2026). **Read this before adding a book, before
adding or changing a `layout`, and before touching any shared extractor** —
every rule here was paid for by a silent failure.

`node .claude/fetch-book.js <id> [--from=N] [--to=N] [--force] [--only-original] [--skip-original]`

- `.claude/fetch-book.js` — the importer that writes those files, from Wikisource. Standalone Node helper,
  zero deps, resumable (per-chapter cache in `.claude/book-cache/`, gitignored), safe to re-run:
  `node .claude/fetch-book.js seneca-letters [--from=N] [--to=N] [--force] [--only-original] [--skip-original]`.
  Adding a book = adding an entry to its `BOOKS` table (**and a matching one in app.js's eager `BOOKS`
  registry** — the importer writes the text, app.js holds the tile's metadata, and a book with only one of the
  two either never appears on the shelf or appears and cannot be opened; **plus a row in
  `BOOK_AUTHOR_COLOR` if the author is new to the shelf**, or the book falls through to the generic
  indigo every `--tile` rule already declares).
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
    **A FOURTH form arrived with the Nicomachean Ethics (Aug 2026) and it is the first whose number is not
    an integer**: a Bekker page, a figure with a column letter, set in the margin as a NESTED `wst-verse`
    (`<sup><b>1094<sup>a</sup></b></sup>`). Neither rule above can read it — Gummere's wants nothing but
    digits between the `<b>` tags and Jowett's takes the trailing number, which here is the page with its
    letter thrown away. `sections: "bekker"` reads **the span's `id`** instead, which Wikisource sets to the
    clean citation however the visible number is dressed, and writes an explicit `data-n` sort key beside
    the text (see the `data-n` note under `books/<id>.<lang>.js`). It has to tell two kinds of marker apart:
    **this edition marks Bekker's LINE numbers the same way**, every fifth line, as `wst-verse` spans whose
    id is a bare figure — inventoried over all ten books, 176 pages against 1,141 line numbers. So the
    fallback DROPS rather than keeps, because a line number left alone survives the tag strip as a loose
    superscript mid-sentence that reads like a footnote marker opening nothing. That inventory also found
    exactly one marker that is neither — a line 5 mistyped `id="5:"` with an empty `<sup>` — which is why a
    dropped span carrying non-numeric text is **reported before it goes**, so a genuinely new kind cannot
    leave in silence.
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
  **A PARALLEL TEXT COMES IN A SECOND SHAPE, and it is not a table at all** (`layout: "interleaved"` →
  `extractInterleaved` / `splitInterleaved` / `cnNum` / `bothColumns`; Aug 2026, adding the Analects —
  the twelfth book). Legge's edition is as much a facing-page text as Giles's and is transcribed quite
  differently: the two languages **alternate down one column**, each chapter's Chinese inside a
  `wst-lang` span or div and its English in the paragraphs after it, with no table anywhere. Neither
  existing extractor can read it — `cleanBody` unwraps the Chinese containers and hands back one text
  with the languages interleaved line by line (the silent failure the Art of War entry names), and
  `extractParallel` finds no `wst-translation-table` and throws. So the columns are separated by their
  own markup instead of by table cell. Five things it settled:
  · **THEY DO NOT ALTERNATE ONE FOR ONE, and assuming they do is the trap.** A run of several
    chapters' Chinese often sits in a SINGLE element, followed by that run's English — 7 of the 20
    books do this. Pairing by position looks perfect on book 1 and drifts thereafter. Both columns are
    therefore gathered whole and paired on the NUMBER, which is what app.js does at render time
    anyway; measured over all 20 books, **499 chapters on each side, a clean 1–N run in every book**,
    nothing missing either side and no duplicates. Only the Art of War's facing page does better.
  · **A CHINESE NUMERAL WEARS SEVERAL COSTUMES IN ONE EDITION** (`cnNum`): 第一…第十 with the prefix
    and 十一 onwards without it, the compressed 廿 (20) and 卅 (30), and a tens digit run straight into
    a units digit (四五 for 45, which written out is 四十五). An unreadable mark is REPORTED rather
    than skipped, since a dropped mark takes a chapter of prose off the page with it.
  · **ONE REPAIR, recorded rather than smoothed away**: in book 2 the English marker for chapter 18 is
    printed "Chapter XVII." a second time while the Chinese beside it reads 十八 and the passage is
    what every edition cites as 2.18. The English column is numbered **forward-only** — a numeral is
    taken where it moves the count on and replaced by the next number where it does not, with a
    warning naming the book and both numbers on every run. It restores the printed page rather than
    composing anything, but it is a repair, so it is said out loud.
  · **CUT THE RUNNING HEAD AT THE SENTINEL, NOT AT THE MARKER.** The chapter marker sits INSIDE its
    paragraph, so slicing the page at the marker leaves the opening `<p>` behind and hands `stripTags`
    a closing tag it never saw opened — which its stack correctly discards, after which the first
    chapter of every book runs into the second with no paragraph break. Nothing throws and no prose is
    lost; the page just quietly stops having paragraphs. Caught by counting `<p>` against `</p>` over
    the shipped file, which is the cheap check to run after any new extractor.
  · **LIFTING ONE COLUMN OUT LEAVES SCARS IN THE OTHER, in both directions.** The printed page
    alternates line by line, so a Chinese block can interrupt an English SENTENCE ("in the giving pay"
    / "or rewards to men") — 26 of those, all in books 14–20 — and the rejoining of two Chinese
    fragments leaves a space in a script that has no word spaces (43 of those). Both are repaired on
    narrow tests: paragraphs are joined only where the first ends on no sentence punctuation AND the
    second opens lower-case (a real Legge paragraph always opens on its own number), and whitespace is
    dropped only BETWEEN two Chinese characters. Neither is visible in a count — the chapter is the
    right length either way.
  Legge's own emphasis is set in SMALL CAPITALS ("is not <i>reciprocity</i> such a word?"), which the
  reader has no style for, so it becomes ITALIC — safe here precisely because this transcription uses
  italics nowhere at all. **This edition has no footnotes** (measured: zero reference marks over all 20
  books), so the book renders with no note fold, as Ovid, Lucretius and the Oedipus Rex do; `notesOf`
  is still called and warns if one ever appears.
  **A PARALLEL TEXT COMES IN A THIRD SHAPE, and it is NUMBERED ON THE ORIGINAL'S SIDE** (`layout:
  "shloka"` → `extractShloka` / `splitAlternating` / `devNum` / `saPlain`; Aug 2026, adding the
  Bhagavad Gita — the twentieth book, and the ninth layout). Besant's 1922 Madras edition is as much a
  facing-page text as Giles's and Legge's, and the Devanagari sits in the very same `wst-lang` wrapper
  the Analects uses, so no new markup rule was needed. What is new is **which column carries the
  numbers**. Every earlier parallel book takes its structure from the ENGLISH — Giles's section numbers
  open a list item, Legge's chapters are marked in both columns and the English is walked. Here the
  Sanskrit carries an unbroken run of ॥ N ॥ verse numerals and the English is the damaged column, so
  the cut is made at the Sanskrit and the English numerals are demoted to a CHECK. **Ask which side is
  complete before deciding which side to cut at**; it is a measurement, not a habit. Four things it
  settled:
  · **MEASURE THE DAMAGE BEFORE CHOOSING A STRATEGY.** 702 Sanskrit numerals against 694 English ones,
    and the eight are not missing verses: four are a dropped closing parenthesis, so the marker reads
    `(42` where the sequence wants `(42)`, and four carry no numeral at all. In every one the
    translation itself is present and complete. Cut at the Sanskrit, 696 of 701 printed English
    numerals then agree with the place it puts them.
  · **A NUMERAL PRINTED ONE AHEAD IS NOT AN OFF-BY-ONE IN THE EXTRACTOR, and the way to tell is the
    re-sync.** The seventeenth discourse prints …17, 18, **20, 20**, 21… against a clean Sanskrit 1–28.
    Had the cut been wrong, every verse from 19 on would have disagreed; instead the two columns
    re-agree at 21 and stay agreed. So it is the 1922 printing that skips a number. Measured on the
    source page rather than inferred from the warning. Two such verses exist (17.19, 18.14) and their
    stray numerals are dropped, since this reader strips the printed numeral from all 701 verses anyway
    and leaving them would set a figure beside a verse contradicting the number Folio shows.
  · **CUT THE ORIGINAL AS A STREAM, NOT BLOCK BY BLOCK** — the Song of Roland's rule again, met from
    the other direction. A verse's Devanagari does not always sit in ONE element: where the scan's page
    breaks mid-verse the transcription opens a fresh one, so the second discourse alone holds 76 blocks
    for 72 verses, four of them carrying no numeral. Reading a block as a verse appends the opening of
    the NEXT verse to the one before it, and **it is invisible to every count** — the verse total is
    right, the two columns pair, the numbering is a clean 1–N, nothing throws. It shipped that way for
    an hour and was found by LOOKING AT THE RENDERED PAGE. The numeral closes a verse; the element does
    not.
  · **THE COLOPHON IS WHY THE NUMBERING IS FORWARD-ONLY.** Each discourse ends with the traditional
    closing formula, and the eighteenth's is numbered ॥ १८ ॥ — the CHAPTER's number, standing after
    verse 78. Read as a verse it would overwrite the real eighteenth. Measured: the only numeral in the
    book that does not move the sequence on. That formula also **names each discourse in the edition's
    own English** ("…the first discourse, entitled: THE DESPONDENCY OF ARJUNA"), so `extractShloka`
    reads all eighteen titles off the text — the second book to do so after Gilgamesh — and the
    capitals are kept for Aesop's reason. One is misspelt on the page and is kept as printed, recorded
    in the entry so it cannot later be read as an import fault.
  **THE PAIRING UNIT NEED NOT BE THE UNIT THE BOOK IS DIVIDED INTO** (`layout: "fitts"` →
  `extractFitt` / `fittBody` / `markFittLines` / `fittHtml` / `FITT_MARK`; Aug 2026, adding Beowulf —
  the twenty-fourth book, and the tenth layout). Both columns are the ordinary wiki walk, one page per
  chapter; what is new is a level BELOW the chapter. Every earlier book pairs on the unit its editions
  divide into — a letter, a chapter, a Stephanus page, a laisse, a verse. Beowulf's editions divide into
  fitts, but a fitt is 50–140 lines, so pairing there would set one whole column-page against another
  and the facing page would be useless. What both editions state far more finely is the LINE, printed in
  the margin every fifth line, and a line number is also how any passage of Beowulf is cited in any
  language. So the fitt is the CHAPTER and the printed line is the SECTION. **Ask what the two editions
  state IN COMMON, not what they are cut into.** Five things it settled:
  · **MEASURE BOTH COLUMNS END TO END BEFORE CHOOSING THE KEY.** 636 markers a side over an identical
    range, no duplicate either way, 40 of 42 chapters pairing on every line number. That is what makes
    the two exceptions below statements about the editions rather than suspicions about the extractor.
  · **A MISPRINTED NUMERAL IS TOLD FROM A BAD CUT BY THE RE-SYNC** — the Bhagavad Gita's rule on a
    second book. Six numerals across the two editions break a run that is otherwise a clean +5 and the
    very next marker is correct again; a wrong cut would have disagreed on every marker after the first
    instead of one. Repaired forward-only and each named on every run, as the Song of Roland's two are.
  · **THE SAME CLASS CAN MEAN TWO THINGS.** Wyatt marks his line numbers and his FOLIO references with
    the same `wst-pline` class, differing only in which margin they float to, so a class-only test reads
    "Fol. 175a." as a section number. `FITT_MARK` is anchored on digits and the folio marks are dropped
    afterwards. And the reverse: **one page in 85 uses a different template altogether** — Wyatt's
    prelude is set with `ppoem`, whose numbers are `ws-poem-versenum`, so a reader written for the other
    84 finds that chapter unnumbered and silently unpairable. Both shapes are matched in one sweep.
  · **DROPPING A HEADING CAN DROP A FOOTNOTE MARKER.** Each fitt opens on its own numeral, which
    duplicates the chapter tab and so goes — but Gummere's XXXI carries a footnote ON that numeral and
    the Old English title carries another, so the markers are carried down to the line below rather than
    deleted with the line. Otherwise the note stays in the list with no sentence opening it, which is
    the mirror of the dead marker the apparatus already refuses to draw.
  · **AN ORIGINAL MAY HAVE TO BE FOLDED TO MATCH THE TRANSLATION** (`foldInto`). Wyatt divides where the
    manuscript does and brackets a section [XXIX] that Gummere runs on inside his XXVIII; folding the
    two into one chapter is what keeps the columns dividing alike, the alternative being a chapter tab
    with an original and no translation.
  **A BOOK MAY BE NO MARKUP AT ALL, and then the structure is BUILT rather than read**
  (`layout: "journey"` → `extractJourney`, plus a per-book `runningHead`; Aug 2026, adding Journey to
  the West — the thirty-fourth book, and the eleventh layout). Every earlier reader is handed
  decisions somebody has already made: a wiki page whose paragraphs are `<p>`, a TEI file whose lines
  are `<l>`. Richard's translation exists in exactly one transcription anywhere — the Internet
  Archive's OCR of the Cornell copy — and that is a plain text file. **So this is the first extractor
  here that ESCAPES its input rather than stripping tags out of it**: it is given prose and puts tags
  in, so an ampersand or an angle bracket in the scan is content and becomes markup by accident if
  it is not escaped. Five things it settled:
  · **A RUNNING HEAD IS MATCHED ON SHAPE, NEVER ON WORDING.** The OCR spells this book's own title
    differently on almost every page, so a rule that knew the words would drop some and leave the
    rest standing mid-sentence; what does not vary is a short mostly-capital line with a page number
    at one end. 250 go that way and all 250 were read to confirm it.
  · **…AND LIFTING ONE OUT LEAVES A HOLE WHERE IT STOOD.** A blank line is what separates blocks, so
    a sentence running across a page arrives as two paragraphs broken at the word the page turned on
    — 359 of them, rejoined on the Analects' test and only on it (the first must end on no sentence
    punctuation AND the second open lower-case), which is narrow enough that no real paragraph can be
    swallowed.
  · **A HEAD THE OCR SPLIT IN TWO NEEDS A DIFFERENT RULE FROM ONE IT MERELY MISSPELLED**, and this is
    where the shape rule runs out: two heads arrive as two lines each, so neither half carries the
    shape at all. Caught as a BLOCK instead, on a `runningHead` pattern the book declares for itself
    exactly as `dropHeads` is declared per book — matching only a block that is WHOLLY the running
    title, which no chapter of a novel is — and counted, so a rule that starts eating text cannot do
    it quietly.
  · **A COUNT THAT MOVES IS HOW AN OCR SHAPE GETS FOUND.** The mark Richard prints on the chapters he
    condensed is mangled twenty-two ways, and it is bracketed at BOTH ends, so the closing "]" is
    read as "J" a third of the time and the opening "[" as "f" once. The count is printed on every
    run, and every widening of the matcher was prompted by that number being wrong — 85, then 87,
    then 88, then 89. Nothing else would have shown it: a mark not recognised is simply a chapter
    filed under the wrong description.
  · **A CONTENTS PAGE IS NOT ALWAYS THE BETTER READING**, which is worth knowing because the opposite
    is usually true. This edition heads its chapters in capitals and lists them in title case, so the
    case looked recoverable — and the contents agrees with the body on only 53 of the 100, the
    disagreements being its own OCR. The body headings ship, capitals and all, which is Aesop's
    outcome reached by measurement rather than by assumption.
  **AND `originalChapter` GAINED THE TWO GATES `cleanBody` ALREADY HAD** (`O.body === "plain"`,
  `O.verse === "dl"`), plus a balanced drop of that wiki's `headerContainer`, for the first original
  typed onto a wiki rather than transcluded from a scan. All three are gated per book for the reason
  the English-side gates are, and the change was proved inert on the shipped Prince byte-for-byte.

  **BOTH COLUMNS MAY BE PLAIN TEXT, AND THEN THEY FAIL IN OPPOSITE DIRECTIONS** (`layout: "chaucer"` →
  `extractChaucer`, and on the original side `source: "text"` + `layout: "skeat"` → `extractSkeat`;
  Aug 2026, adding The Canterbury Tales — the thirty-fifth book, the twelfth and thirteenth layouts,
  and the first pair of extractors written for one book). The rule that shipped with `journey` was
  that a text with no markup has to have its structure BUILT and its content ESCAPED; this is that
  rule on two texts at once, and the useful half is that the two difficulties are opposites. A
  MACHINE READING of a printed page has no marks at all, so the page furniture must be recognised on
  its SHAPE and the holes it leaves closed afterwards. A PROOFREAD TRANSCRIPTION OF A CRITICAL
  EDITION has the opposite problem: it is exact, and most of what it exactly carries is apparatus —
  variant readings, marginal summaries, marginal line numbers — none of which is the poem.
  Six things they settled, and every one is a rule about not guessing:
  · **AN APPARATUS BLOCK AND A PARAGRAPH OF VERSE OPEN AT THE SAME INDENTATION**, so the test cannot
    be indentation. Skeat's variant readings sit four spaces in where the verse sits two — and a
    verse paragraph also opens at four, so a rule written on the indent alone deletes a fifth of the
    poem. A block is apparatus only when its FIRST line also carries an opener (a line number, a
    capitalised label, an italic editorial word), and **every four-indent block the test does NOT
    take is counted and reported** — which is how `QUOTATION;`, `TITLE.` and `HEADING (` were found,
    each having leaked a paragraph of manuscript sigla into the middle of the verse.
  · **A PAGE MARKER MAY SHARE A LINE WITH A RUBRIC**, so it is BLANKED rather than dropped with its
    line. Exactly one in the volume does — the last, standing in front of the rubric that opens
    Chaucer's retraction — and dropping the line takes the retraction's own title with it.
  · **A MARGINAL-SUMMARY STRIP MUST BE ANCHORED TO A NON-SPACE.** The gloss Skeat prints in the
    margin is set between `=` marks at the end of a verse line, and the same transcription sets a
    RUBRIC between the same marks on a line of ITS own — so "two or more spaces, then `=…=`, then
    end of line" reads a rubric's own indentation as a margin and deletes it whole. 68 rubrics went
    across 21 chapters, and the only symptom is an empty paragraph where a heading was.
  · **A RUNNING-HEAD SWEEP ON SHAPE WILL EVENTUALLY EAT A REAL HEADING**, so the book declares its
    exceptions (`keepHead`) exactly as it declares `dropHeads`, and **every distinct line the sweep
    removes is printed on the run**. Here it is one: Chaucer's envoy at the end of the Clerk's Tale
    is set in the same capitals as the running heads and the plate captions around it.
  · **VERSE DETECTION WAS TRIED AND REJECTED**, which is the one to remember before writing the
    obvious rule. The editors versify a few short lyrics and the scan sets each line as its own
    block, so a run of short blocks looks exactly like a stanza — but the same scan fragments PROSE
    at the page edges, and the rule marked five prose passages as verse against seven real ones.
    A blockquote over prose tells the reader something untrue about the text where a short paragraph
    over verse merely looks plain, so every block is a paragraph and the lyrics read as short ones.
  · **AN APPARATUS SWEEP IS NOT FINISHED WHEN THE APPARATUS RULE IS, and the way to find out is to
    sweep the SHIPPED file for what the rule was written to remove.** The four-indent rule takes
    1,246 blocks of variant readings in one pass and reads as complete; five more shapes of the same
    editor's furniture were still standing, and every one of them ships as Chaucer without throwing,
    shortening a tale or disturbing the pairing. The lesson is in how each was then fixed: **write
    the rule from an inventory of the whole book, never from the example that prompted it.** The
    margin looked like `[T. 14772.` and wears three costumes (a Tyrwhitt line number, `[T. _om._` for
    a line he omits, and one `[See p. 256.`) — 39 lines in the poem end in a bracketed margin and a
    rule anchored on the first shape leaves 19 standing. The block-level notes looked like a Tyrwhitt
    reference beside a page number, and the test that actually separates them is **the page reference
    alone**: ten blocks in the poem carry one, nine are notes and the tenth is a real stanza of the
    Monk's Tale whose MARGIN carries one — which is why the margin rules run per line, before the
    blocks are built, and would be worth nothing after. And two notes carry no page reference at all,
    opening on `***` in the apparatus band, where they belong to the apparatus rule rather than to
    this one. Every removal is counted and reported, per the standing rule that a rule which starts
    eating text cannot do it quietly.

  **A SOURCE MAY PASS EVERY STRUCTURAL CHECK AND STILL BE THE WRONG ONE** (`layout: "quixote"` →
  `extractQuixote`; Aug 2026, adding Don Quixote — the fortieth book, and the sixteenth layout). The
  third book on the plain-text path after Journey to the West and the Canterbury Tales, and the only
  one that did not have to be: Wikisource carries Ormsby's translation complete, one page per
  chapter, cleanly typed, needing nothing but `body: "plain"` and `dropHeadings`. That version was
  built, fetched, swept and browser-checked, and was discarded because the check found "thirty forty
  windmills that there are on plain". See the `don-quixote` entry in the File map for the whole of
  it — the sixty dropped words, the four ways the alignment lied before it told the truth, the verse
  measurement that reversed the last argument for the wiki, and the repair deliberately NOT made.
  What the extractor itself is worth remembering for is small by comparison: **a plain text's
  furniture must be peeled LINE BY LINE, not sliced to the first blank line** (the chapter titles
  here run one to three lines and a slice generous enough for the longest ate the opening of the
  shortest chapters); **an edition may set no heading where a PART ends**, so Gutenberg's chapter 52
  span carries Part II's dedication and preface, 1,992 words of front matter cut at a bare
  `Volume II` line, and the epitaphs of the Academicians come BEFORE it and are the real end of
  Part I; and **a short-lined block is not always verse** — a heading is short-lined too, so a block
  that is WHOLLY CAPITAL is kept as a paragraph and every one is counted and printed, since a rule
  that started eating headings must not do it quietly.

  **AN EDITION MAY STATE ONE LEVEL OF CITATION AND NOTHING ELSE AT ALL** (`layout: "satyricon"` →
  `extractSatyricon` / `satyriconSection` / `cutAcrossSections` / `closeQuotesAt` / `balancedSpan` /
  `betaGreek`; Aug 2026, adding the Satyricon — the forty-first book, and the seventeenth layout).
  The fifth TEI reader. Every earlier one takes its numbers from a `<div>` or from a milestone
  standing inside a division; this edition has **zero `<div>`, zero `<head>` and 141 section
  milestones**, and says so in its own header (`<refState unit="section"/>`, one level). So the
  section is the chapter and the row at once, and no `bk-n` marker is written — see the `satyricon`
  entry in the File map for why that pairs deterministically rather than by luck. Five things it
  settled, and three are about not trusting a tag pair:
  · **MATCH BALANCED, ALWAYS.** `<quote>` nests inside `<l>`, `<note>` nests once and `<p>` sixteen
    times, and a non-greedy pair reported ten of 607 verse lines as standing outside any block when
    none does. Third instance of this fault in the file after the Prose Edda's `<dl>`.
  · **CLOSE AND REOPEN AT EVERY BOUNDARY THE TEXT IS CUT AT** — a section mark, a paragraph, and a
    display quotation lifted out of the flow. The Bellum Civile is one quotation with five section
    milestones inside it; an inline quotation may WRAP a block (a speech quoting a poem); and **the
    edition marks a quotation two ways**, so the walk tracks `<quote>` and `<q>` and closes whichever
    is open. Every one of those is invisible except by counting a tag against its closer over the
    SHIPPED file.
  · **CUT PARAGRAPHS WITH SENTINELS, NOT WITH A `<p>` WALK.** 92% of the Latin's text is inside a
    `<p>` and 8% is not, so a `<p>`-anchored reader loses a twelfth of the column in silence — the
    Art of War's `wrapBareRuns` fault in a TEI file — and replacing every `<p>` tag with one sentinel
    survives the sixteen nested ones for free, where a paired match would not.
  · **A LENGTH RATIO CANNOT SEE AN UNTRANSLATED PASSAGE**, because untranslated text is still text.
    Word overlap between the two columns of the same section can: a real translation shares only
    proper names. That is what found the ten sections this Loeb left in Latin.
  · **AND BETA CODE IS DECODED, NOT REPAIRED** — see `betaGreek`, which sorts the combining marks
    (Unicode never reorders two of the same canonical class, so `oi/)nw|` composes to nothing) and
    REFUSES any string whose marks will not compose, leaving the ASCII rather than inventing a Greek
    letter the language has not got.

  **A TRANSLATION MAY BE SHORT OF ITS ORIGINAL AND STILL PAIR WITH IT, IF IT NUMBERED AROUND THE
  GAPS** (`layout: "kanda"` → `extractRamayan` / `ramSanskrit` / `RAM_BOOKS` / `RAM_CANTOS` /
  `RAM_PARTS` / `ramAt` / `ramSarga`; Aug 2026, adding the Ramayana — the forty-second book, and the
  eighteenth layout). The sixth TEI reader and **the first whose file is not Perseus's**: Project
  Gutenberg's TEI of Griffith, in which not one of the 571 `<div>`s carries a `type` or an `n` and the
  structure is nesting and `<head>` alone. What it does carry is an `<anchor id="CantoVI-CXXX"/>` at
  the head of every canto — the citation, machine-readable — so the divisions are ignored and the poem
  is cut at the anchors, which are then CHECKED against the numeral each `<head>` prints beside them.
  Six things it settled, and the first is the one to carry furthest:
  · **A TRANSLATOR'S OWN GAPS ARE EVIDENCE ABOUT HIS NUMBERING.** Griffith ships 493 cantos of 645, so
    the question is whether his canto 60 is the sixtieth canto he wrote or the sixtieth sarga — and
    pairing on the wrong answer sets passage beside unrelated passage with both columns complete and
    every count healthy. A man numbering his own cantos produces an unbroken 1..N; Griffith's Book VI
    runs 1..130 with twenty-nine numbers missing. **Ask whether the numbering has holes in it before
    asking what the numbers mean.**
  · **A DIFFERENCE IN THE TOTALS IS NOT EVIDENCE OF A DIFFERENCE IN THE DIVISION.** Three books
    disagree with the Sanskrit on their totals and fitting a shift to each is right twice and wrong
    once — Book V's 66-against-68 is the translator STOPPING EARLY, and a shift there displaces the
    whole tail of the book. Only reading the passages showed it.
  · **CORRELATE A QUANTITY BOTH EDITIONS STATE ABOUT THE SAME UNIT, NOT THE VOCABULARY THEY SHARE.**
    A proper-name profile is the obvious instrument and is nearly useless on a poem whose cast recurs
    in every canto — it scored offset 0 best in 10 of 23 sampled cantos of one book, which reads as
    drift and is noise. The Sanskrit's verse count against the translation's line count settles it in
    one pass, r = 0.63–0.71 at offset 0 against 0.40 at best anywhere else.
  · **A CHANGEPOINT IS FOUND BY LENGTH AND CONFIRMED BY EPISODE, and neither alone is enough.** The
    length fit is decisive where the translation is dense (a log-ratio sd of 0.279 → 0.062) and
    useless where it is full of omissions — in the war book it put the boundary eleven cantos wrong,
    and eight unmistakable episodes put it right. See `RAM_BOOKS` for the passages each shift rests on.
  · **A CANTO WITH NO SARGA IS SKIPPED, NOT GIVEN THE ONE NEXT DOOR.** Three of the 493 are the
    translator's own extra divisions; they draw with an empty cell, which is the shelf's ordinary way
    of showing that two editions disagree, and filling them would invent a division neither prints.
  · **AND THE UNTRANSLATED SEVENTH BOOK IS NOT SHELVED AS 111 TABS OF DEVANAGARI**, though the
    Sanskrit for all of it is transcribed and complete — Beowulf's rule, that a chapter tab with an
    original and no translation is worse than not having it. `count` 493 against `total` 645, and the
    book's own front matter says at length what is absent and why.
  On the original side `ramSanskrit` met **four transcription shapes on one wiki** — `div.poem`,
  `div.verse` round a `<pre>`, a proofread `ws-poem`, and the verse typed into the page as bare `<p>`
  — and threw on the first page of each rather than returning a short sarga, which is the failure
  shape to want. The bare-`<p>` fallback is the narrowest of the four because those pages close with a
  स्रोतः section crediting the audio reciters: the page is cut at its first heading, the navigation
  tables go, and only a paragraph carrying a daṇḍa is taken.

  **A PRINTED BOOK'S OWN SECTION MARKS, AND NOTHING ABOVE THEM** (`layout: "ptahhotep"` →
  `extractPtahhotep` / `PTAH_KEYS`; Aug 2026, adding the Maxims of Ptahhotep — the forty-third book,
  and the nineteenth layout). The FOURTH book from Project Gutenberg and the first from its HTML
  rather than its plain text or its TEI, **which is the easiest of the three and is worth saying so
  nobody reaches past it**: a transcriber has already marked up the paragraphs, anchored the
  footnotes and tagged the page numbers, so this is the wiki path's problem and not the plain-text
  path's — `stripTags` does the work. Five things it settled, and every one is about the FURNITURE
  rather than the text:
  · **THE CHAPTER IS FOUND BY ITS ANCHOR AND NEVER BY ITS HEADING.** This volume holds three works
    and an introduction, and the introduction's own heading is the WORDS of this work's title — so
    slicing on the heading text takes the essay ABOUT the poem instead of the poem, silently and at
    the right sort of length. Gutenberg anchors each chapter (`id="chap02"`), which cannot be
    ambiguous; assert on the TEXT at both ends as well, which is what `test-library.js` does.
  · **A PAGE NUMBER SURVIVES THE TAG STRIP AS PROSE.** The transcription marks each printed page as
    `<span class="pagenum">{42}</span>`, and `stripTags` unwraps a span it does not recognise and
    KEEPS the words — so left alone a section reads "the words of them that hearken {42} to the
    counsel of the men of old time". Removed with their braces, and counted. This is the Rigveda's
    commentary rule at small scale: **a leak makes a chapter LONGER, so no count of chapters or of
    sections can see it** and the shipped file has to be swept for it.
  · **A MARKER MUST CARRY THE NOTE IT POINTS AT.** The apparatus is numbered 1..N across the WHOLE
    work and each chapter keeps only the notes its own markers cite, renumbered from 1 — so the
    printed number is written into `data-fn` and the reading-order fallback is never relied on. It is
    the Seneca rule on a printed page rather than a wiki one.
  · **AND THE WORK'S OWN TITLE LINE STANDS BEFORE THE FIRST MARK**, unnumbered — the incipit naming
    the vizier and his king. It is kept and given to the section after it, which is where the printed
    page puts it; exactly one such block exists, counted, and more than one is reported.
  · **A TAB MUST NOT REPEAT THE WORD `chapterWord` ALREADY PRINTS.** See the `ptahhotep` entry in the
    File map for the two-numbers-under-one-word fault that reading the page turned up, and for why
    the tab carries the translator's own "§ 32" instead.


  **A PAIRING WITH NO PRINTED CITATION TO PAIR ON** (`layout: "boethius"` → `extractBoethius` /
  `boethiusLatin` / `boeGreek` / `boePoem` / `BOE_BOOKS` / `BOE_LETTERS`; Aug 2026, adding The
  Consolation of Philosophy — the forty-fifth book, and the twentieth layout). The FIFTH book from
  Project Gutenberg and the second from its HTML, which the Ptahhotep entry above says is the
  easiest of the three paths. Two extractors for one book, as the Canterbury Tales needed, and for
  the opposite reason: not two kinds of damage but one file per column with nothing wrong with
  either. Six things it settled:
  · **ASK WHETHER THE NUMBER AN EDITION PRINTS IS UNIQUE INSIDE THE CHAPTER.** Every earlier book's
    sort key is a figure that occurs once — a letter, a chapter, a Bekker page, a laisse, a verse.
    Here the numeral IX. occurs twice in every book on each side, once over a poem and once over a
    prose chapter, and neither edition prints the compound citation anywhere; so the marker carries
    what each edition prints and the SORT KEY is the section's position in its book. That is safe
    only because it is arithmetic: both files were measured end to end first, and each book's
    sections agree in number, in order and in alternation, 13/16/24/14/11 a side, with only the first
    book opening on a poem.
  · **AND THEN ASK WHAT ELSE IN THE EDITION NAMES ITS OWN SECTIONS.** James heads a poem "SONG IV."
    and a prose chapter "IV.", so a marker taken from the headings alone would print a bare figure
    over half the book — but he writes summaries at the head of each book, and footnotes inside it,
    in citations: *CH. I. Philosophy appears to Boethius*, *see also below, ch. iii.* A summary, an
    index and a cross-reference are all places an editor writes down the form he cites his own book
    by, and taking it from there is transcription rather than composition.
  · **A LEADING UNNUMBERED BLOCK IS NOT ALWAYS A SALUTATION**, and `bookRows`' fold is written for
    one. See the `boethius-consolation` entry in the File map for why the book summaries are
    numbered 0 instead, and for what a folded quarter-page of English facing a Latin poem tells a
    reader that is not true.
  · **A KEPT HEADING MAY CARRY A FOOTNOTE MARKER TOO.** `dropFittHead`'s rule has always been about
    a heading that is DROPPED; three of this edition's nineteen notes hang off a section title that
    is kept, and flattening the heading to text before the anchors come out of it leaves the string
    "[I]" inside the title with its note in a list nothing points at. **And two more hang off a book
    summary, outside every section** — so the note lists are harvested from the whole book rather
    than section by section, which is the difference between finding nineteen and finding fourteen.
  · **A POEM PRINTED ACROSS A PAGE BREAK OPENS A FRESH BLOCK IN BOTH COLUMNS**, three times in the
    English and six in the Latin, and each must be rejoined — the Gita's stream rule, and here a
    stanza left standing apart from its own poem reads as an extra one, on a page whose subject is
    the alternation of prose and verse.
  · **AND A TRANSLITERATION IS DECODED ONLY WHERE IT IS AN ENCODING.** `[Greek: PI]` names a letter
    and is decoded; `[Greek: theoraetikae]` is a lossy romanisation and is left exactly as printed
    and counted. The Satyricon's `betaGreek` judgement, and the same refusal: never compose a letter
    the evidence does not carry.

  **TWO COLUMNS FROM TWO DIFFERENT KINDS OF SOURCE** (`layout: "bede"` → `extractBede` /
  `bedeChapter` / `bedeInline` / `bedeText`, and on the original side `layout: "bedeLatin"` →
  `bedeLatin`, with `BEDE_CHAPTERS` / `BEDE_ROMAN` / `BEDE_LATIN_BOOK`; Aug 2026, adding the
  Ecclesiastical History of the English People — the forty-seventh book, and the twenty-first
  layout). The SIXTH book from Project Gutenberg and the third from its HTML. Two readers for one
  book, as the Canterbury Tales and the Consolation needed — here because the columns come from
  different kinds of source, which is Thucydides' position with the sides swapped. Five things it
  settled, and the first two are about not trusting what a file offers you:
  · **COUNT WHAT A MACHINE-READABLE IDENTIFIER ACTUALLY COVERS BEFORE PREFERRING IT TO A HEADING.**
    The Ptahhotep reader's rule is to find a chapter by its anchor and never by its heading; this
    file's anchors are generated from the INDEX's cross-references, so they cover 117 of the 140
    chapters and only one of the five books. The headings are complete on both sides, checked, so the
    number is read off the heading and CHECKED against the count the edition states.
  · **AN INVENTORY TAKEN OVER THE FILE IS NOT AN INVENTORY OF THE BOOK.** The index uses the same
    `tei-lg`/`tei-l` markup as the verse, so a sweep of the whole file reports 1,851 line groups and
    3,086 lines of verse in a prose history; inside the five books there is exactly one, of one line.
    Take the inventory over the divisions actually being imported.
  · **A KEPT HEADING MAY CARRY A FOOTNOTE MARKER** — the Consolation's finding on a title that stays
    rather than one that is dropped, and it bites on four of 141 here. Flattened to text the marker
    becomes a bare figure inside the chapter title while its note sits in the fold with nothing
    pointing at it, and only an every-note-is-referenced assertion can see it.
  · **A MARK MAY WEAR A DIFFERENT COSTUME IN EACH BOOK OF ONE WORK.** The Latin sets its chapter
    numbers as `<h3>` headings in Liber Primus and as a bare `[N]` opening a paragraph in the other
    four, so both are converted BEFORE the tags come off — after `stripTags` a heading is a bare
    figure indistinguishable from a number in the prose. **And the rule is written from an inventory
    of all 106 bracketed marks rather than from the three that failed**: 69 open `<p><br/>`, 23 open
    `<p>`, 3 carry an empty anchor span, and against the first two shapes three chapters fold
    silently into their neighbours.
  · **AND PAGE FURNITURE IS PEELED IN A LOOP, NOT MATCHED ONCE.** One page of the Latin carries a
    stale chapter index — Book I's numbers on Book II's page — outside the wiki's own `ws-noexport`
    wrapper and BEFORE the running head, so a rule anchored to the start fires on whichever comes
    first and leaves the rest standing. The index is recognised by its shape (a paragraph of nothing
    but figures and dashes) rather than by its wording, and every removal is counted.

  **ONE BOOK PRINTED IN TWO FILES, AND AN APPARATUS TWICE THE SIZE OF THE TEXT** (`layout: "polo"` →
  `extractPolo` / `poloChapter` / `poloNotes` / `poloNoteRegion` / `poloSplice` / `poloVerse` /
  `poloSpan` / `poloInline` / `POLO_BOOKS` / `POLO_PARTS` / `poloAt`; Aug 2026, adding the Travels of
  Marco Polo — the forty-eighth book, and the twenty-second layout). The SEVENTH book from Project
  Gutenberg and the fourth from its HTML. The entry takes `urls: [...]` rather than `url`, and the
  branch caches each volume as `en-vol<N>.html` and reads them as one. Six things it settled:
  · **AN OFFSET MEASURED IN ONE LANGUAGE IS NOT AN OFFSET IN ANOTHER.** Boundaries probed in Python
    and carried into JavaScript as numbers all land short, JS counting UTF-16 code units where Python
    counts code points — three sweeps, three different chapter totals, nothing thrown. Search for the
    boundary in the language that will do the extracting and write no offset down.
  · **A COUNT TAKEN PER FILE IS A COUNT OF HALF A BOOK.** The chapters run continuously across the
    join and Book Second is split over it, so the book count, the chapter runs and the note numbering
    are all checked over both volumes together.
  · **THE NOTES ARE FOUND BY THEIR OWN LABEL — NEVER BY THE RULE ABOVE THEM, AND NEVER BY THE BOX
    ROUND THEM.** Five chapters print no rule at all and one spells it `class="r40 clear"`; the rule
    was then written on the blockquote, which is structural where a rule is decoration, and ONE
    chapter in 235 sets its notes as bare paragraphs with no box — so a page and a half of
    commentary ran on into the author's own prose, complete, well-formed and wrong. **Anchor on the
    thing the unit carries BY DEFINITION** (a Note has a label) and let the region open at whichever
    block encloses it.
  · **A CONTAINER MAY CARRY ATTRIBUTES AND MAY NEST**, which is the same lesson one element down:
    `<div class="footnote" lang="fr">` costs a bare-tag pattern 13 of 790 footnotes, and 22 that
    hold a plate or a stanza are truncated at their first inner block by a non-greedy closer. Loose
    on the opener, BALANCED on the closer, always.
  · **A NOTE INSIDE A NOTE IS SPLICED, NOT LISTED** — the Art of War's rule, at 266 of 295 rather
    than 20, and here the measurement is what tells the two tiers apart: only a dozen of the
    footnotes are cited on the author's own prose.
  · **AND A NOTE HUNG ON A CHAPTER'S TITLE IS CARRIED DOWN TO THE CHAPTER'S FIRST BLOCK**, in both
    tiers. The title is the TAB here, so splicing gives a 200-character tab and dropping loses a note
    about the whole chapter; three of the four were found by the every-note-is-referenced assertion
    and by nothing else. `dropFittHead`'s rule in a sixth edition.

  **A TITLE THAT IS ONLY ON THE CHAPTER'S OWN PAGE — AND THAT IS A HOOK, NOT A LAYOUT**
  (`head: "sankuo"` → `sanKuoHead` / `sanKuoRoman` / `SANKUO`; Aug 2026, adding Romance of the Three
  Kingdoms — the forty-fourth book). Worth reading for what it is NOT: the book goes through the
  ordinary wiki walk and `cleanBody` like every other proofread transcription here, so it took no
  layout, no new extractor and not one line of change to any shared reader. What it took is a single
  gated line in the fetch loop, running on the RAW page before the notes are gathered — because by
  the time `cleanBody` has finished, every centred div is a blockquote and the class the hook keys on
  is gone. **Reach for a hook before a layout**: three of the last four books grew a whole reader for
  a difficulty this size. Four things it settled:
  · **THE TITLE MUST BE READ BEFORE ITS BLOCK CAN BE DROPPED**, which is why `dropHeads` cannot do
    this alone. That option matches a leading block against a pattern the book declares — exactly
    right for "CHAPTER IX." and impossible for a title, whose whole text differs on every page, since
    a pattern loose enough to match all 120 would eat prose. Here the second block is removed because
    it has just been READ rather than guessed at.
  · **AND IT MUST HANDLE BOTH ARRANGEMENTS OF THE HEAD** — see the `three-kingdoms` entry in the File
    map for the two chapters of a hundred and twenty that put the number and the title inside one
    centred block instead of two, and for the printer's own hundred-less-n numerals, which were
    inventoried over the whole book from its contents pages before the check was written.
  · **`stripWikiCSS` RUNS BEFORE THE TAGS DO**, for the third time in this file: a template's inline
    stylesheet sits inside the very element being read, so dropping tags first leaves the CSS text
    standing in the middle of the title.
  · **AND THE COUNTS ARE PRINTED ON EVERY RUN** — how many chapters gave up a title, how many wore the
    odd numerals, how many boundary marks went. A rule that quietly stops firing looks exactly like a
    rule that had nothing to do.
  On the ORIGINAL side it needed no new reader either: `originalChapter`'s `body: "plain"` gate grew
  drops for the wiki's licence banner and its `noprint` divs and an unwrap for a `div class="prose"`
  that appears on some chapters and not others — all three provably inert on the one original already
  on that path, measured rather than argued (`ws-header`, `licenseContainer` and `div.prose` occur
  zero times on Journey to the West's pages) — plus a per-book **`dropTables`**, which is a statement
  about the SOURCE rather than about the markup and which reports any table it removes that was
  carrying prose rather than links.

  **THE CHAPTER MAY BE THE SMALLEST UNIT OF THE WORK, A THOUSAND TIMES OVER** (`layout: "sukta"` →
  `extractSukta` / `suktaBody` / `suktaLines` / `suktaVerses` / `suktaHtml` / `suktaSanskrit` /
  `SUKTA_VERSE` / `RV_PARTS` / `rvGriffith`; Aug 2026, adding the Rigveda — the thirty-ninth book,
  and the fifteenth layout). The ordinary wiki walk, one page per chapter; what is new is that the
  chapter is a single hymn and there are 1,028 of them, with the mandala demoted to a PART. Five
  things it settled:
  · **ASK WHETHER A KNOWN RECENSION SPLIT AFFECTS THE NUMBERING, and measure it by CORRELATING VERSE
    COUNTS AT EVERY OFFSET** — Journey to the West's rule with a method attached. Mandala 8's eleven
    Valakhilya hymns are numbered in place by the Sanskrit and printed as an appendix by Griffith, so
    the two run eleven apart from 8.49 to 8.92 and forty-four apart for the appendix itself. Nothing
    else could have found it: both columns are complete, every mandala is the right length, and the
    only signal is 31-of-39 agreement at k=11 against 10-of-39 at k=0. **The correlation sweep is the
    tool to reach for whenever two editions of one work might disagree about where something sits.**
  · **WHERE FOUR TRANSCRIPTION SHAPES EXIST, FLATTEN THEM ALL TO LINES AND WRITE ONE RULE.** A
    thousand pages of plain text, four proofread transclusions and one hand-typed page do not need
    four parsers; they need one normaliser and one verse rule, or the four drift apart silently.
  · **RESOLVE THE FOOTNOTE MARKERS BEFORE FLATTENING, AND CARRY DOWN THE ONES ON A DROPPED HEAD.**
    The flatten removes every tag, so a marker not rewritten into the shelf's own form first is gone
    while its note still reaches the fold — 27 entries no sentence opens. And Griffith hangs his note
    on a hymn as a whole off its printed TITLE, which is page furniture and is discarded: Beowulf's
    `dropFittHead` rule in a fourth edition. Both faults were found by `test-library.js`'s
    every-note-is-referenced assertion and by nothing else.
  · **A COMMENTARY IN THE ORIGINAL'S OWN LANGUAGE IS DROPPED, NOT LIFTED.** The Art of War's
    commentary is Giles explaining Sun Tzu in the reader's language and belongs in the note fold;
    Sayana's bhashya is another Sanskrit text about the hymn, ten times its length, and carries two
    further copies of the verse inside it. A leak makes a hymn LONGER, so it must be swept for in the
    shipped file rather than counted.
  · **AND THE PRINTED STOP AFTER A NUMBER IS ITSELF AN INVENTORY QUESTION** — see the `rigveda` entry
    in the File map for the four costumes and for why the bare form is admitted on a tighter test.

  **AN EDITION MAY NOT PRINT ENOUGH OF ITS OWN NUMBERS TO PAIR ON, AND THEN THEY ARE COUNTED**
  (`layout: "terzine"` → `extractTerzina` / `terzinaBody` / `terzinaLines` / `terzinaHtml` /
  `terzinaDropSpans` / `TERZINA_MARK` / `TERZINA_HEAD`; Aug 2026, adding the Divine Comedy — the
  thirty-sixth book, and the fourteenth layout). The ordinary wiki walk, one page per canto; what is
  new is where the section numbers come from. Every earlier book reads them off the page. Here the
  translation prints marginal line numbers for 37 of its 100 cantos and none at all for the other 63
  — **one work in one edition, transcribed two different ways on the same wiki**, the first 37 as a
  proofread transclusion of the scan and the rest typed straight in — so there is nothing to pair on
  for two thirds of the poem. The lines themselves are explicit in both shapes, being what the `<br>`
  separates, so the number is recovered by COUNTING and the printed numerals become the CHECK, which
  is the Gita's rule with the complete side chosen by measurement. Four things it settled:
  · **THE ARITHMETIC IS WHAT MAKES COUNTING SAFE, and it has to be done before a word is imported** —
    both columns 14,233 lines and the same count in every canto, every canto 3n+1 lines, and the
    original printing exactly one numeral per tercet with none disagreeing. Without those three the
    count is a guess.
  · **A MARKER OPENS ITS ROW AND CARRIES THE NUMBER PRINTED AT THE ROW'S CLOSE.** `bookSections` cuts
    at a marker and gives everything after it to that number, so the marker stands at the head of the
    three lines it labels while reading the tercet's LAST line — which is the figure the edition sets
    in its own margin there, so 4,711 of the 4,811 labels are read rather than composed.
  · **THE HEADING TEST MUST RUN ON THE TEXT WITH ITS INLINE TAGS OFF.** The canto heading is
    italicised, so a test against the raw line reads `<i>CANTO I.</i>` and matches nothing — which
    left one extra line at the top of each transcluded canto, shifted every label in it by one, and
    made all 37 disagree with their original **while every count read healthy**. Only comparing the
    two columns' section lists showed it.
  · **AND A TRANSLATOR'S FOOTNOTE SET AS VERSE IS NOT VERSE.** Longfellow leaves eight Provençal lines
    untranslated and Englishes them under the canto, cued by an asterisk at both ends; counted as
    verse they made that one canto eight lines longer than its original. Written from an inventory of
    the whole poem — two asterisks in 14,241 lines — counted and reported, so a second cannot appear
    unnoticed.

  **A WHOLE BOOK MAY ARRIVE ON ONE PAGE, and then the chapters are CUT rather than walked**
  (`layout: "laisses"` → `extractLaisses` / `extractLaissesFr` / `laisseHtml` / `laisseNumber` /
  `dropLineNumbers`; Aug 2026, adding the Song of Roland — the seventeenth book, and the eighth
  layout). Every wiki book before it fetches a page per chapter; both columns of this one are
  transcribed whole onto a single page per language, so the fetch is one request and the 291 chapters
  are split out of it. Four things it settled, and three are about not trusting the numerals.
  · **STRIP THE WHOLE UNIT BEFORE SPLITTING IT INTO LINES, never line by line.** `stripTags` balances
    openers against closers on a stack, so a fragment holding a `<p>` whose `</p>` lives in the next
    fragment is unbalanced ON ITS OWN and the opener survives. Splitting first emitted a stray `<p>`
    in most laisses of the poem — the usual quiet shape: nothing throws, not one word is lost, every
    line is present and in order, and **only counting a tag against its closer over the shipped data
    shows it**, which is the sweep this file already prescribes after any `stripTags`-adjacent change.
  · **CUT THE ORIGINAL AT ITS OWN SEPARATOR, NOT AT ITS NUMERALS.** Bédier's presentation simply does
    not carry six of its 291 laisse numerals (188, 238, 278, 283, 287, 288), so a cut made at the
    numerals loses six laisses and shifts everything after them. What it does carry, exactly 291 times
    across its six pages, is an `<hr>` between one laisse and the next, with the Old French in the
    first margin block of each unit and Bédier's modern French in the second. Cut structurally and
    number forward-only, and **285 of the 291 printed numerals then AGREE with the position the cut
    gives them** — which is what turns six inferences from a guess into the only reading consistent
    with the other 285. The English is cut at its numerals because it carries all 291.
  · **EACH EDITION HAS EXACTLY ONE MALFORMED NUMERAL**, and the forward-only rule (the Analects') fixes
    both with a warning naming the book and both numbers: CXXXXV for 135 in the English — **verified on
    the scan image, so it is the 1919 PRINTING and not the transcription** — and CCXXXVI for 286 in the
    French, an L dropped. Recorded in the front matter rather than corrected in silence.
  · **AND ONE LINE NUMBER IS TYPED AS ORDINARY TEXT.** Both editions set their running line-count in
    templates `dropLineNumbers` removes by balanced span-matching, and exactly one line in the whole
    poem has the figure keyed straight into the verse where no span-matching can see it. The rule that
    removes it is as narrow as the evidence — a digit run at the very head of a line, a multiple of
    five (which is how often the edition numbers), inside the poem's line range — **measured over both
    cached editions before it was written: one line matches, laisse 231's 3210** — and it is reported
    when it fires, so a second cannot appear unnoticed.
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
  **IT TOOK A SECOND BOOK WITHOUT A LINE OF NEW CODE** (Aug 2026, the Book of Rites), which is the
  argument for having made it structural: Legge closes Book II's appendix with six charts of mourning
  degrees bound in outside the pagination, so Wikisource labels each of those leaves
  `data-page-number="table"` and the Republic's rule lifts them out knowing nothing about charts.
  Measured first, as there: eight unnumbered leaves in the whole book, all in Book II, every other page
  numbered. They are worth removing rather than keeping — three of the six were never transcribed and
  arrive as Wikisource's own "A table should appear at this position in the text. See Help:Table" box,
  which the tag stripper unwraps into the middle of Legge's prose as though he had written it; the three
  that WERE transcribed are flattened by that same stripper into a column of nouns with every relation
  between them gone; and the caption of the first is unproofread OCR ("( t>y a Man /ttr hit Kmamtn and
  Kiimpomtn." for "by a Man for his Kinsmen and Kinswomen"), which is the one thing a library must not
  ship as somebody's book.
  **`prp-pages-output` CAN OCCUR MORE THAN ONCE, so its opener is stripped globally** (same batch). A
  transclusion is broken into a fresh wrapper wherever something interrupts the run of scan pages — an
  inserted plate, or the footnote apparatus at the foot — and the Republic's pages carry two. Anchored to
  position 0, only the first was dropped and every later one survived as an opener with no closer inside
  the slice, so each of the ten books ended on a **stray empty `<blockquote>`**: an indented rule under the
  last line of Plato that nothing accounts for. The usual quiet shape — nothing throws, no prose is lost,
  the chapter is the right length. **Both changes were verified byte-for-byte against the shipped Seneca
  and Meditations chapters before being made**, which is the check to run on any edit to `cleanBody`: the
  extractor is shared, and its other three callers have already been proof-read by readers.
  **A WIKI PAGE NEED NOT BE A PROOFREAD TRANSCRIPTION AT ALL, and that breaks the extractor outright**
  (Aug 2026, adding the Peloponnesian War — the fifteenth book, and the first of the five wiki books
  whose page has no scan behind it). Every earlier one is a page-by-page transcription of a scan,
  transcluded into the chapter page and wrapped by MediaWiki in `prp-pages-output`; Crawley's Thucydides
  is typed straight onto the page, so there is no wrapper, `cleanBody`'s opening slice returned -1 and it
  threw **"no body"** on a page holding a whole book. That is the loud failure, and the good one. Three
  rules were needed and **all three are GATED per book**, which is what let the shipped Symposium be
  re-run end to end and diffed **byte-for-byte, both columns**, before any of them was kept:
  · **`body: "plain"`** — fall back to the parser's own container. Deliberately NOT tried automatically
    whenever the wrapper is missing: a proofread page HAS that container too, OUTSIDE the transclusion
    wrapper, so an automatic fallback would silently widen the slice of any of the four older books the
    day Wikisource next moves its markup, taking the navigation furniture in with the text.
  · **`dropHeadings: true`** — Crawley's summary headings would become BLOCKQUOTES under the generic div
    pass (the Meditations' running-head fault again), but the sharper reason is the pairing: they fall
    BETWEEN numbered chapters, and `bookSections` attaches an unmarked block to the section already open,
    so every one would print at the FOOT of the chapter before it, pointing backwards at prose it does
    not describe. A signpost at the wrong end of the road is worse than none.
  · **`sections: "bookchapter"`** — THE FIFTH WAY an edition marks its numbers, and the first read
    entirely out of the marker's `id`. The chapter marks are `wst-verse` spans whose id is the whole
    citation (`id="2:34"`), which none of the four older rules can read: Gummere's wants a `<b>` inside
    the `<sup>`, Jowett's wants the float class, Bekker's wants a page-and-column id. Unmatched they
    survive the tag strip as loose superscript digits mid-sentence — footnote markers opening nothing —
    and the book pairs as one 146-chapter block against a Greek column stating every number it has.
    The id carries the BOOK as well, so it is CHECKED rather than merely parsed (`expect`, set per
    chapter by the caller): a page transcluding the wrong book announces itself instead of silently
    filing 146 chapters under Book 2. No `data-n` is written — these numbers are integers, and app.js
    reads the marker's own text where the attribute is absent.
  · **`sections: "shu"`** — THE SIXTH WAY, and the first whose difficulty is the WRAPPER rather than the
    markup (Aug 2026, adding the Book of Documents). Legge numbers his paragraphs, and this transcription
    writes the number two ways: as plain text at the head of a paragraph, and as an ANCHOR SPAN carrying
    the citation as its id, because the volume's contents page links into some paragraphs and not others.
    **That second form costs nothing**, which is the opposite of what it looks like: `stripTags` runs
    BEFORE the section pass, so by then the anchor is unwrapped and both forms are the same plain "N.".
    What does cost is that **MediaWiki only wraps a run of text in `<p>` where the wikitext had a blank
    line before it**, so a document whose first paragraph follows its headnote directly arrives as a bare
    run with no tag round it — the Art of War's `wrapBareRuns` trap in another edition. Measured over the
    whole book: `markLeadingSections`, anchored to `<p>`, finds 167 of the 169 numbers, and the two it
    misses are the FIRST number of two documents, each of which would ship numbered from 2 with every word
    present and nothing throwing. So the pass matches a paragraph head OR a number opening a bare run
    where a block has just closed, in ONE regex scanned in reading order — the Meditations' rule, since
    two passes leave the counter at the end of the document and the forward-only guard then declines
    everything the second finds.
  · **`dropAuxToc`** — Wikisource's own auxiliary contents block (`wst-auxtoc`), which falls INSIDE
    `prp-pages-output` on a book page whose sections have pages of their own, and which the generic div
    pass would otherwise render as two quotations reading "Sections (containing the body text)" and
    "Section 1 Section 2 Section 3". Keyed on the wiki's own class rather than on its wording, like the
    `ws-noexport` rule, removed with a BALANCED match because it nests, and gated per book so it is
    provably inert on everything already shipped.
  · **`sections: "liki"`** — THE EIGHTH WAY, and the first whose count RESTARTS INSIDE A CHAPTER (Aug
    2026, adding the Book of Rites). Every rule above numbers a chapter once, straight through, under a
    forward-only guard that reads a number going backwards as prose. Legge numbers the paragraphs of the
    Lî Kî from 1 within each Section, and within each Part where a Section has Parts, so Book I starts
    over eight times and Book IV thirteen — and under the ordinary guard everything after the first Part
    is declined, so nine tabs in ten ship carrying their opening pages' numbers alone with every later
    paragraph's prose swallowed into the one above. **The counter is therefore reset by the HEADINGS**,
    which `markLikiHeads` fences off before the generic div pass, and the headings and the numbers are
    matched in ONE sweep in reading order — the Meditations' lesson, sharper here than anywhere, since as
    two passes there is no reading order at all and the reset cannot know which numbers it precedes.
    Three more things it settled. **A HALF-TITLE AND THE FIRST HEADING ARRIVE IN THE SAME BLOCK**, so
    `dropHeads` cannot help — it keeps or drops a block whole, and none of its three shapes can match
    Book I's block at all, that one holding a nested centred div (the volume's own title page). The block
    is opened and its paragraphs sorted instead, on the test that **a half-title is wholly CAPITAL** in
    this edition and nothing else is, so a line that is neither a heading nor capital is reported and
    KEPT rather than discarded on a guess. **DROPPING A HALF-TITLE DROPS A FOOTNOTE MARKER** — Beowulf's
    `dropFittHead` rule in another edition: Legge hangs his note on the whole treatise off its TITLE, so
    nine of the ten books would have shipped with a note 1 that no sentence opens, and every marker on a
    dropped line is carried down onto the heading below, where his note on the book belongs anyway. And
    **A PARAGRAPH NUMBER NEED NOT FOLLOW A FULL STOP**: Legge runs numbered paragraphs together where the
    sense runs on, so 4 of Book I's 31 and 82 of Book IV's 198 land mid-sentence — and three of those
    follow a comma or a footnote marker whose stop the printing drops. What all of them share is that the
    figure OPENS A PRINTED LINE, which this transcription preserves, so that is the signal rather than
    the punctuation. Watch the lookahead as well: Legge italicises the aspirated consonants of his
    romanisation, so a great many paragraphs open on `<i>K</i>ung-nî` and a rule wanting a capital
    immediately meets a `<`. All 45 numbered runs are a clean 1..N afterwards, measured, no gaps and no
    duplicates — which is the check to run, since every one of these faults is silent.
  · **`glyphs`** — a per-book table of exact characters applied to the fetched page BEFORE anything is
    extracted from it, so the prose, the footnotes and the chapter titles cannot come to spell one name
    differently (Aug 2026, same book). It exists because **a transcription may write ONE PRINTED LETTER
    SEVERAL WAYS**: Legge's romanisation needs a blackletter Z that Unicode has not got, and this one
    reaches for four characters to stand in for it — Cyrillic З 139 times in the running prose, a
    mathematical bold fraktur 𝖅 98 times and 𝖟 71 times in the headings and half-titles, and a
    blackletter ℨ twice, including on the volume's own contents page. Two of the four are also outside
    the Basic Multilingual Plane, so on a device with no mathematical-alphanumerics face they are 169
    empty boxes plus two chapter tabs. All four are written the way the transcription itself writes the
    letter most often. **It is a repair, so it is narrow and declared per book**, and it asserts nothing
    about which glyph Legge set — only that whatever he set, he set one.
  **A CHAPTER MAY BE PRINTED ACROSS SEVERAL WIKI PAGES, and `page(n)` may return an ARRAY** (Aug 2026,
  same book). Every earlier wiki book is one page to one chapter. Where Legge prints a book in sections,
  Wikisource gives each section its own page and leaves the book's headnote — and at the head of a Part
  his introduction to the whole Part — on the book's page, which carries no body text at all: fetching
  only the sections drops that prose on the floor, and giving it a chapter of its own puts an empty tab
  on the bar, since one of those four pages carries a title and nothing else. The pages are cleaned in
  order and joined, and **each later page's `data-fn` is offset by the notes already gathered** — the
  Seneca lesson (a marker must carry the note it points AT) applied across a join. Returning a string
  still means what it always did, so no shipped book's config is touched, and both a wiki book and a TEI
  book were re-run and diffed **byte-for-byte** to prove it. **The "no section numbers" warning became a
  property of the CHAPTER rather than of the page at the same time**: on a multi-page chapter the
  per-page one fires on the headnote page whether or not the sections that follow are numbered, which is
  three false alarms out of four — and a warning that cries wolf is one nobody reads.
  **AND THE TWO COLUMNS MAY COME FROM DIFFERENT KINDS OF SOURCE**, which is the same book's other first.
  `fetchOriginal`'s `chaptered` branch reconciles the original against the ENGLISH, and re-read that side
  out of `en-tei.xml` — which a wiki-side book does not have, and whose `BOOK.url` is `undefined`, so it
  asked `fetchText` for undefined and died AFTER the English had already been written. It now reads the
  English back out of whichever cache the translation actually used, keeping the discipline the verse,
  drama and TEI branches share: **the pairing is checked against the files that shipped, never asserted
  from the entry.**
  **A CHAPTER MAY BE ASSEMBLED FROM HUNDREDS OF PAGES, and then the whole wiki walk changes grain**
  (Aug 2026, adding The City of God — 687 pages for 22 chapters, where the Book of Rites' four-page
  chapter was the previous high). Five rules were needed and **every one is GATED per book**, which is
  what let two shipped books be re-run and diffed byte-for-byte before any of them was kept:
  · **`dropLinkLists`** — where a work is one chapter to a page, the wiki puts a bulleted list of links
    to those pages under a Contents heading. `dropHeadings` takes the heading; the `<ul>` is bare, and
    `ul`/`li` are not in `ALLOWED`, so `stripTags` unwraps both and it arrives as one run-on paragraph
    reading "Preface Chapter 1 Chapter 2 …" where the book should begin. **The test is structural**: a
    list goes only where every item is a single link and nothing else, which is what navigation IS and
    what an author's list never is. Measured first — one such list on each of the 22 book pages and
    none at all on the 665 chapter pages.
  · **`dropLeadParas`** — `dropHeads` is anchored to a leading `<blockquote>`, because in every edition
    that needed it the running head is a centred div. This transcription centres nothing: the volume's
    half-title, the book's number and the rule under it are three plain `<p>`s, so not one of
    dropHeads' three shapes can reach them. A SEPARATE option rather than a fourth shape, deliberately
    — a fourth shape would start dropping leading paragraphs in the six books that already declare
    dropHeads, whose patterns were written knowing only a centred block could match.
  · **`dropHeadMarkers`** — **A DROPPED HEAD MAY CARRY A FOOTNOTE MARKER**, Beowulf's `dropFittHead`
    rule in a third edition: two of these books hang the editor's note on the book's own number
    ("Book V.[1]"), so dropping the line strands the note. The markers are collected as the heads are
    peeled and planted afterwards, **never left in the string behind a sentinel** — every shape here
    is anchored to position 0, so a sentinel would make the SECOND head of a run unreachable, which is
    the fault dropHeads records for its own blank-line peel.
  · **`dropBlankParas`** — this transcription closes every page with the blank line the printing sets
    under a chapter. On a one-page-per-chapter book it falls at the end and is swept; on a joined run
    it lands between every pair of chapters, and an unnumbered block rides silently onto the end of
    the chapter above it.
  · **`pageMark`** — **THE NINTH WAY an edition marks its numbers, and the first read AND CHECKED.**
    Each page carries exactly one chapter number, at its head; the page NAME states the same number.
    Composing the marker from the name would be composing an apparatus and trusting the heading would
    be trusting a wiki, so `sections: "chapterhead"` reads the heading and compares it against
    `book.expect`, which the loop sets per PAGE from `pageMark(name)` — a page renamed or a heading
    mistyped is reported instead of being filed under the chapter before it. A page returning null
    (the book's own page, a preface) is left unmarked, which is what puts it at the head of the
    chapter as its opening unnumbered block.
    **ITS NUMBER IS ARABIC IN ONE EDITION AND ROMAN IN THE OTHER** (`chapterHeadRoman`, Aug 2026,
    adding the Confessions — the second book on this path and the second by this author). Dods heads
    his chapters "Chapter 1.—…" and Pilkington heads his "Chapter I.—…", **in the same series, the
    same volume set and the same decade**, which is the thing to expect rather than to be surprised
    by: a Victorian series is edited volume by volume and its conventions are not uniform across one.
    The Roman alternative is **GATED behind a flag rather than simply added to the pattern**, so the
    City of God is inert BY CONSTRUCTION rather than by a re-run — no page of it can reach the new
    branch — which is the cheaper half of the standing discipline for editing a shared extractor, and
    the half to reach for whenever the two readings could ever collide.
  · **`sections: "articuli"`** — **THE TENTH WAY an edition marks its numbers, and the first read off
    a HEADING** (Aug 2026, adding the Summa Theologica). Every rule above reads a number out of the
    PROSE, because that is where the editions this shelf had met printed them; the Dominican Fathers'
    Summa is transcribed with its own structure as HTML headings, so the number is a heading's own
    text. It runs at the **pre-strip hook** beside `markLikiHeads` rather than with the other section
    passes at the foot of `cleanBody`: `h4` is not in `ALLOWED`, so by the time those run stripTags
    has unwrapped every heading and "Art. 3 - Whether God exists?" is a bare run of words in the
    middle of the prose. Four things it settled, and every one was found by a count moving rather
    than by reading a page. **A HEADING'S ROLE IS READ FROM ITS TEXT AND NEVER FROM ITS LEVEL** —
    the transcription sets an article's heading at `h3` on two pages and the question's own at `h4`
    on three, so the first rule (drop every `h3`, keep every `h4`) deleted real articles, taking
    their titles with them. **AND THE QUESTION'S HEADING IS RECOGNISED BY THE ARTICLE COUNT IT
    CARRIES**, not by the word "Question", which is typed a dozen ways across the 614 pages; the one
    thing every one of them carries is the "(SIX ARTICLES)" the edition prints after the title — the
    City of God's rule about looking for a marker where it actually is rather than where the regular
    cases put it. **THAT COUNT IS WHAT MAKES THE NUMBERING A MEASUREMENT RATHER THAN A REPAIR**:
    where it and the number of headings agree (592 of 614) the headings are numbered 1..N in order
    and whatever is printed on them is ignored, which absorbs every misprinted number at a stroke and
    lets the one question whose eight headings carry no numbers at all be numbered without composing
    anything; where they disagree the printed numbers are kept and the gap reported, since
    renumbering there would file prose under the wrong number. **AND A DROPPED HEADING CAN DROP A
    FOOTNOTE MARKER while a KEPT one can lose its own** — Beowulf's `dropFittHead` rule in a fourth
    edition and in both directions at once: of the book's seven notes one hangs off a question's
    heading and one off an article's, so markers are carried down off a dropped head and lifted back
    into a rebuilt one.
  · **`sections: "malory"`** — **THE ELEVENTH WAY an edition marks its numbers, and the first whose
    number and TITLE are two separate elements printed one under the other** (Aug 2026, adding Le
    Morte d'Arthur). It runs at the same **pre-strip hook** as `articuli` and `liki`, and for the
    same reason: all three of the blocks it reads are `<div>`s, and the generic div pass turns every
    one of them into a blockquote. Four things it settled.
    **THE BOOK HEADING GOES AND THE RUBRIC STAYS**, which is `dropFittHead`'s rule in both directions
    at once. "Book I" duplicates the tab the reader is standing on and appears only on the first
    chapter of each book (ten of the twenty-one, counted); Caxton's descriptive rubric is printed
    nowhere else and on a bar of eighty-eight chapters it is the only thing telling one adventure
    from the next. **Ask what ELSE is on a heading before dropping it** — the Ramayana's finding,
    arriving here as a separate element rather than as words beside the number.
    **THE NUMBER IS READ AND THEN CHECKED against the page name**, the City of God's rule, and it
    earns more here than there: 503 pages are fetched under a title built out of a volume rule and
    two Roman numerals, and a mis-numbered one would sit in the right book at the wrong place with
    every count in the run reading healthy. The BOOK numeral is checked too, through a `bookNum` set
    per chapter beside `expect`.
    **A SECOND TEMPLATE ON ONE PAGE IN 503** — see the `morte-darthur` entry in the File map. Both
    shapes are tried in order and the odd one is COUNTED, so a rule that starts firing more often, or
    stops, cannot do it quietly.
    **AND CAXTON'S PREFACE IS LEFT UNMARKED ON PURPOSE**: it is fetched as the first page of Book I,
    `pageMark` returns null for it, and it therefore arrives as the chapter's leading unnumbered
    block — where the printed book puts it, and where app.js files a headnote. Writing a "0" over it
    would be composing a citation the edition has not got; nobody cites Caxton's preface as Malory
    I.0, where an unnumbered block claims nothing at all.
  · **`dropNotes`** on a WIKI book (same batch; the Satyricon's TEI path had its own already). Every
    note on that transcription is a Wikisource contributor's rather than the edition's, and says so
    in its own text. See the `morte-darthur` entry for the argument; what matters here is that the
    flag is per book, that the MARKERS go with the notes (a marker running past the end of the list
    is deleted by `wireFootnotes` at render, which is the right behaviour and the wrong place to find
    out), and that the count is printed on every run — a transcription that starts carrying the
    edition's own notes must not be able to do it unnoticed.
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
    **A FOURTH thing, added Aug 2026 by Lucretius, and it is the Suetonius attribute-order fault on a new
    element: READ A MILESTONE'S ATTRIBUTES INDEPENDENTLY OF THEIR ORDER.** Ovid's Latin writes its card
    boundaries `<milestone n="452" unit="card"/>` and Lucretius's writes them `<milestone unit="card"
    n="1"/>`, so the old order-fixed pattern returned every card of the one and **not one card of the
    other** — measured, 213 English cards against 0 Latin. It fails the quiet way: the fetch succeeds,
    the poem is all present, the English column looks flawless, and the whole original arrives as six
    unpaired blocks because there is nothing left to pair on. `cardMarks` now reads `unit`/`subtype` and
    `n` separately, and the change was **verified byte-for-byte over Ovid's own two files** (156 and 155
    cards, identical both ways) before being kept — the extractor is shared, which is the check to run on
    any edit to it.
    **And `<del>` does not always sit inside a note.** Ovid's every `<del>` was inside an apparatus note
    and so had already gone by the time the strip ran; Lucretius's edition has **no notes at all**, so its
    116 `<del>` marks are live in the text. All 116 sit *inside* a line rather than round whole ones: 84
    lines are shortened and survive, and **30 are bracketed entire and drop out**, taking the Latin from
    7,412 lines to 7,382. Dropping them is the same judgement the Meditations' Greek makes — what ships is
    the text the edition constitutes — but here it changes the COUNT, so measure it rather than assuming
    the rule is inert.
    **A FIFTH thing, added Aug 2026 by the Aeneid: AN EDITION MAY MARK ITS CARDS TWO WAYS AT ONCE, AND
    THEN BOTH MUST BE READ IN ONE SWEEP** (`cards: "both"`). Every earlier file here picks one mechanism
    and keeps to it, and Williams's Aeneid uses both — 327 `<div subtype="card">` and 69
    `<milestone unit="card"/>` — because the choice follows where the boundary falls: a card opening
    where an English line opens gets a division, and one opening PART WAY THROUGH a line cannot, so it
    is a milestone standing inside the line at the word the card begins on. Read with the Ovid setting
    the poem is complete, nothing throws, every book pairs, and 69 passages sit against Latin that is
    not theirs. One sweep in READING ORDER, never two passes — the Meditations' rule.
    **AND A MID-LINE MARK MUST BE LIFTED TO THE LINE'S EDGE BEFORE THE BOOK IS SLICED AT IT**, which is
    the quiet half: cards are cut by slicing, so a mark inside a line cuts the `<l>` in two, and
    `teiVerse` matches a complete `<l>…</l>` pair and nothing else — so it matches NEITHER half and one
    line of verse vanishes at each of the 69. Invisible to every count but the line total. The lift
    moves the mark past the closing `</l>` (keeping the line whole, at the price of a boundary drawn at
    the nearest line break — the Antigone's case) **and leaves a SPACE where it stood**, since 13 of the
    69 sit hard against the words either side and removing rather than replacing shipped "word:“What"
    for one run. Gated on `cards: "both"`, and measured on the siblings as well as reasoned about:
    Ovid's Latin has four milestones inside lines and every one is `unit="tale"`.
    **A SIXTH: A `<choice>` OFFERS TWO READINGS AND THE TAG SWEEP KEEPS BOTH** (same batch). Unwrapping
    it the way everything else inside a line is unwrapped prints them one after the other, and this
    found a live fault in a SHIPPED book — see `lucretius-nature-of-things.la.js`, which had been
    printing all 110 of its choices doubled ("aeraër" for *aër*) since the day it was added. One child
    is kept: `<corr>` over `<sic>` and `<orig>` over `<reg>`, the reading the edition means to stand.
  · **the wiki walk** (`wiki` + `pages` + `originalChapters`) — one page per book of the collection, the
    numbers printed in the text and read back out. Everything below is about this shape.
    **`layout: "caput"` → `extractCaput` is that shape with a page per FOLIO CHAPTER** (Aug 2026,
    adding The City of God), which `perChapter` above already does — what it adds is reading the
    section numbers out of the prose, which `originalChapter` does not do at all. Four things it
    settled, and every one was found by counting its marks against the English rather than by reading
    a page. **THE MARK WEARS FOUR COSTUMES** — `CAPUT PRIMUM` for the first of every book against
    Roman numerals after it, the double dash missing in a handful, one stray full stop after the word
    itself — and written against the strictest of the four the pass finds 650 of 661 and the eleven it
    misses fold their prose into the chapter above them, invisibly. **A FIFTH ARRIVED WITH THE
    CONFESSIONS** (Aug 2026) and is the same lesson one notch finer: that book's ninth prints
    `CAPUT V Ambrosium consulit quid legendum.` with **no stop after the numeral**, alone among 278,
    so the chapter folded into the fourth and the Latin came out one short **while every count read
    healthy** — the only symptom was the pairing warning naming a section the translation had and the
    original did not. The stop is optional now and the numeral carries a `\b` to pay for it, without
    which `CAPUT` followed by any capitalised word beginning C, I, V, X or L would read that letter as
    a chapter number and bold the sentence after it; proved inert on the City of God byte-for-byte,
    which is the check to run whenever this reader is touched, since it is now shared by two books.
    **A NUMBER MAY BE PRINTED TWICE,
    IN BRACKETS**, where the editor resumes a chapter after an inserted passage; the forward-only
    guard declines it for its number alone and the material folds where it belongs. **THE MARK IS IN
    NO ONE KIND OF ELEMENT** — 478 of the 661 in a definition-list item, 153 in a paragraph and 31 in
    no element at all, running on inside the paragraph before them — so the marking is done on the
    TEXT after the tags have gone and each mark SPLITS the block it was found in; anchoring to a `<p>`
    would find under a quarter of them. And **THE EDITION'S OWN PAGE NUMBERS ARE IN THE RUNNING TEXT**,
    821 bare figures like `41.0347|`, removed and COUNTED rather than removed in silence.
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
  **A VOID ELEMENT MUST NOT GO ON `stripTags`' STACK, and this one was latent from the beginning**
  (Aug 2026, adding Aesop's Fables — the first book here whose illustrations reach that pass).
  Everything outside `ALLOWED` is unwrapped by pushing a `kept:false` frame and waiting for its
  closer; an `<img>` or an `<hr>` never sends one, so its frame sits on top of the stack for the rest
  of the chapter and **every later closing tag is compared against IT, matches nothing, and is
  silently dropped**. Townsend's frontispiece is an `<img>` inside a `<p>` inside the centred block
  heading his first fable, so the `</p>` went, then the `</div>` closing that block — and the whole
  of fable 1 rendered inside a `<blockquote>` that never closed. The usual quiet shape: nothing
  throws, not one word is lost, the chapter is exactly the right length, and only the indent shows
  it. `br` was already special-cased, which is why fifteen books never met it. **`VOID_TAGS` plus a
  `/>` test now covers both spellings** — XHTML-style `<img … />` announces itself and MediaWiki's
  bare `<hr class="…">` does not. **Measured before it was fixed over every shipped chapter of all
  books and originals: `<p>`, `<blockquote>`, `<i>`, `<b>` and `<q>` balance exactly everywhere and
  that one chapter was the only imbalance on the shelf** — then confirmed byte-for-byte by re-running
  the five wiki books. **Counting a tag against its closer over the shipped data is the cheap sweep
  to run after any `stripTags` change.**
  **`dropHeads` GAINED A THIRD SHAPE at the same time**, for a centred head of SEVERAL paragraphs
  (Aesop's first page carries the half-title, the frontispiece and its caption in one block, where
  shape one wants exactly one `<p>` and shape two wants no tags at all). It is not a loosening: the
  test applied is the same one, so a block still goes only when its whole text matches a pattern the
  book itself declares, and it matches to the FIRST `</blockquote>` so a nested block yields a
  partial text that simply fails rather than swallowing prose.
  **AND `minChars` IS NOW PER BOOK** (default 200, Aesop 120): the short-chapter guard is what
  catches an extraction that has returned the wiki furniture instead of the text, and 200 is right
  while a chapter means a book of Herodotus — but a fable is one paragraph, and the shortest is 191
  characters and complete, checked against its own source page rather than assumed. Lowering the
  floor for everybody would blunt the guard on the books that need it.
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
