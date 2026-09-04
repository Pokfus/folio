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

**`joinBrokenParas` — A PARAGRAPH NEVER BEGINS ON A LOWERCASE LETTER** (Sep 2026, batch E25). The
shelf's second shared repair after `teiInline`'s citation spacing, and it sits one level further out
still: in `writeEnglish`, at serialization, beside the `applyRoman` title pass. It has to, because
the fault reaches the shelf through **both** readers — Ovid and Herodotus are TEI books and the City
of God and the Summa are wiki books — so there is no reader it could live in.

  · **The fault is a printed PAGE-TURN become a paragraph break.** Wikisource serves the City of God
    one page at a time, and the break arrives in the markup mid-sentence, 43 times of 364 mid-WORD:
    the fetched HTML for Book I chapter 20 carries `no sensa` `</p><p>` `tion, nor of the irrational`
    literally. It is **Wikisource's own rendering rather than anything this script does**, which is
    the thing to establish before writing the pass — E17's rule — and the page has **no `pagenum`
    span and no anchor** at the break, so the lowercase letter is the only signal there is.
  · **It is rare and clean, which is what makes a signal that thin safe to use.** 387 boundaries in
    four books out of 48; 364 City of God, 9 Ovid, 9 Summa, 5 Herodotus. Every one outside the City
    of God was read by eye and is the same fault.
  · **THE JOIN IS EASY AND THE SEPARATOR IS THE WHOLE PROBLEM.** Nothing, `<br>` or a space.
  · **The mid-word test needs BOTH halves and the bigram must be counted WITHIN a paragraph.** The
    two fragments concatenated must be a word the book uses elsewhere, AND the pair must never be
    written as two words inside a paragraph anywhere in the book. Without the first, `murmur`+`ings`
    is welded on a guess; without the second, `in`+`the` becomes *inthe*, `may`+`be` *maybe* and
    `a`+`man` the name *Aman*, all three of which the shelf contains. And counted ACROSS a break the
    test returns nothing at all, because every one of the 387 boundaries then attests itself as two
    words. It is deliberately conservative where the two readings are both real — the City of God
    writes "can not" four times, so `can`+`not` takes a space. **A wrong space is a reading a reader
    can see through; a wrong weld invents a word.**
  · **THE VERSE TEST IS ASKED OF THE TWO PARAGRAPHS, NEVER OF THE CHAPTER.** The first cut tested the
    whole html and was wrong in two books at once: Herodotus quotes his oracles in verse and the
    Summa its marriage mnemonic, so a single `<br>` anywhere in the chapter put a line break into
    five and eight lines of ordinary prose — "Zeus contrived`<br>`to show himself". **The count could
    not see it** (the run reported the right number of joins throughout); only reading the joined
    text did.
  · **A `<p>` carrying ATTRIBUTES is never joined.** The join discards the opening tag, and a tag
    that says something about its paragraph must not be thrown away to close a gap. None of the 387
    has one, so the guard is free.
  · **It does NOT run in `writeOriginal`, and that is a limit rather than an omission.** The
    original-language columns carry 38 such boundaries, and **Seneca's three are not this fault at
    all** — they are Virgil quoted in verse, set as paragraphs of their own, where a lowercase
    opening is correct. So "a paragraph never begins on a lowercase letter" fails on a block
    quotation of verse, and the rule needs a guard for that before it can be pointed at the other
    column. The English column happens to contain no such quotation, which is why the census had to
    be read rather than trusted.

**`wrapLooseText` — TEXT BETWEEN TWO PARAGRAPHS AND INSIDE NEITHER** (Sep 2026, batch E26). The
third shared repair, beside `joinBrokenParas` and at the same point in `writeEnglish` — and, unlike
the other two, in `writeOriginal` as well, because the column it was written for is an original.

  · **The fault is that such text is INVISIBLE.** `bookSections` in app.js splits a chapter at its
    section markers by walking `box.children` — the ELEMENT children — so a bare text node between
    two blocks belongs to no section and never reaches the page. Measured when it was found: 67 such
    blocks in the books that have an original column, **63 of them in the Latin Seneca**, and every
    one a quotation of Virgil, Ovid or Ennius set off from the prose. About six thousand characters
    of poetry, in the data and not on the screen.
  · **IT ONLY SHOWS IN THE TWO-COLUMN VIEW**, which is why nobody met it: the single-column reader
    renders the chapter's html directly, so the same passage is visible with the original column off
    and gone with it on. Probed both ways in a browser before anything was written.
  · **The internal newlines become `<br>`.** Every other original column writes a verse line break
    that way — the Iliad 15,258 times, the Aeneid 9,452, the Ramayana 39,061 — and the Latin Seneca
    is the only one with none at all. Rescued without them, four hexameters arrive as one line.
  · **A wrapped paragraph is MARKED (`class="bk-loose"`) and `joinBrokenParas` will not join across
    it.** A block this pass lifted out of nowhere is by definition set off from the prose around it,
    so the seam below it is a real boundary; the seam above needs no rule, a `<p>` with attributes
    being one the join already refuses.
  · **It is repaired at the other end too, and that half is the more important one.** `bookSections`
    now carries a text node instead of discarding it — so the next one is rendered rather than lost
    in silence — and `test-library.js` asserts the TEXT: three lines of Virgil that are in
    `books/seneca-letters.la.js` must be on the screen.

**A TABLE HOLDING A POEM IS NOT FURNITURE** (Sep 2026, batch E26, in `originalChapters`). Latin
Wikisource sets a verse quotation as `{{block center|<poem>…</poem>}}`, which MediaWiki renders as a
one-cell **table** used for centring — and the rule that removes this wiki's prev/next navigation
bar, its export bar and its table-of-contents placeholder removed those too. **Seven quotations of
Virgil, in letters 56, 58, 59, 64 and 67, were not in the file at all**, and nothing said so: the
letters are long, the section numbers still pair, every count reads healthy, and the only symptom is
Seneca introducing a line the reader is never shown. The `div.poem` is lifted out before the table
round it is dropped — **and a table carrying prose is now REPORTED**, which is the half that would
have caught this when the rule was written. `dropTables`, added later for the Three Kingdoms, has
said so from its first line; this older rule did not, and that is the difference between a fault
found in an hour and one found in a year.

**And two things `joinBrokenParas` learned when it was pointed at the original columns** (E26):

  · **PROSE ON ONE SIDE AND VERSE ON THE OTHER IS A BLOCK QUOTATION, AND ITS BREAK IS REAL.** Seneca
    introduces a line with *Deinde cum subinde recitasset* and the verse follows as a block of its
    own, legitimately opening on a lowercase letter — so E25's "a paragraph never begins on a
    lowercase letter" is not universal, and this is the counter-example. Two verse paragraphs in a
    row are one poem split mid-line; two prose paragraphs are the page-turn; one of each is the
    boundary between them and is left alone.
  · **A BOOK MUST BE TOLD WHERE A BARE NEWLINE IS A LINE BREAK** (`verseNewlines`, declared on the
    Latin Seneca's `original` and nowhere else). Read as a general rule the same test fires on prose
    wrapped at the source's own line length: one ungated run put a `<br>` into **317 lines of the
    City of God**, whose paragraphs carry 134 internal newlines of exactly that kind. Gated, it can
    only ever refuse a join — a mismatch keeps the break — so the flag makes the pass cautious rather
    than confident.

**`versifyNewlines` — A VERSE LINE BREAK WRITTEN AS A BARE NEWLINE** (Sep 2026, batch E27). The
fourth shared repair, running before `wrapLooseText` and `joinBrokenParas`, and gated on the same
per-book `verseNewlines` flag E26 introduced.

  · **Only one column on the shelf needs it.** The Latin Seneca has no `<br>` in it at all — the
    Iliad has 15,258, the Aeneid 9,452, the Ramayana 39,061 — so the lines of the verse it quotes on
    nearly every other page are separated by newlines, which HTML collapses to spaces.
  · **WHICH PARAGRAPHS ARE VERSE IS A MEASUREMENT, NOT A JUDGEMENT, and E26 called it the wrong
    one.** Of the eighteen paragraphs in the book carrying an internal newline, the thirteen that are
    verse have a longest line of 25–51 characters and the five that are prose have one of
    1,428–2,179. **A threshold of 100 sits in the middle of a gap 1,377 characters wide.** Count the
    families before calling them a judgement: E26 had read all eighteen and classified them correctly
    by eye, and reading is what made them feel like eighteen separate decisions.
  · **The gate is doing real work.** Read as a general rule the same length test would lineate
    **10,198 paragraphs of the Summa, 2,013 of the City of God and 733 of the Confessions**, all of
    them ordinary prose wrapped at the source's own line length. The length test tells verse from
    prose WITHIN a book whose newlines mean something; it cannot tell whether they mean anything.
  · **It simplified the pass after it.** With the `<br>` written in before `joinBrokenParas` looks,
    that function went back to asking a single question — does this paragraph carry a `<br>`? — and
    E26's `VERSE_NL` parameter went with it. The joins came out unchanged, which is the proof that
    the two readings were the same reading. **A pass that normalises is worth more than a test that
    special-cases.**

**`restoreLostSpaces` — A TABLE ON THE ORIGINAL, WHICH THIS FILE HAD ALREADY SAID IT WANTED** (Sep
2026, batch E28). `correctRaw`'s own comment ends "An original that needs a slip corrected wants a
table of its own on `O`; none does today, and that is a gap rather than a decision." One does now.

  · **The fault it was written for is a space lost at a line end, in the SOURCE.** The last four
    books of the Latin Seneca — letters 101 to 124 — were typed into Wikisource with the space at
    each line end swallowed: `bonumesse`, `occupationibussum`, `claritasbonum`, `mortemhomo`. Every
    one of the 483 forms is glued in the wikitext `?action=raw` returns, so **no rule here could have
    produced it and none can undo it** — a lost space leaves nothing behind to key on. Hence a map.
  · **The first hundred letters are clean**, which is what makes it a finding rather than a guess:
    three isolated slips in letters 1–100 against about twenty a letter from 101 on.
  · **SORTING THE DAMAGE FROM THE REAL LATIN IS THE WHOLE DIFFICULTY.** The measure — a
    single-occurrence token that splits into two words the book uses several times — returns
    perfectly good words: `officiosum`, `adprobari`, `inmortales`, `satisfaciam`, `aberrat`,
    `curatam`, `quate`, `maledixit`, and every verb carrying the enclitic `-que` or a first-person
    `-mus`. So a **lexicon of 833,000 words of Latin from the other originals on this shelf** was
    built and TESTED before it was trusted (it knew 33 of 35 real words and none of the errors), and
    every survivor was then read in its own sentence, which is what caught the last two.
  · **Two sweeps, and the second is the larger.** Requiring the second half to be a FUNCTION word is
    what makes such a list readable, and it is blind to two content words run together: 318 repairs
    from the first family, 164 from the second.
  · **Every key is anchored on both sides, keys are letters only (so there is nothing to escape), and
    a key that fires nowhere is REPORTED.** A repair that has stopped applying and says so is a
    finding; one that stops in silence is a text quietly going back to being wrong.

**THE CORRECTION CHAIN RUNS ON THE EXTRACTED PROSE, NOT ON THE PAGE** (Sep 2026, batch E29). On the
per-chapter wiki branch — most of the shelf — it used to be `let h = correctRaw(await api(...))`, so
every `glyphs`, `fixes`, `reFixes` and `roman` row faced the page as Wikisource serves it, tags and
furniture and all, and the extractor was then run over the result. Two consequences and the second is
the larger.

  · **The cache was poisoned.** The prose cached from a corrected page is corrected, so on the next
    run every row meets a page it has already repaired and **reports itself DEAD** — E19's caveat, and
    the only thing standing between it and another `corning`.
  · **A ROW FACING MARKUP IS A WEAKER ROW THAN THE SAME ROW FACING PROSE.** Refetching chapters under
    both orders: seven books identical, and two where the old order LOSES and the new one matches the
    shipped text. The Book of Rites came back carrying `<p class="bk-head">THE LÎ <i>K</i>Yi</p>` — its
    own running head, mangled by a correction into something the head-remover no longer recognised and
    so left standing in the prose. The Book of Documents came back with **four `Tî` the romanisation
    had missed** — E19's own example book and its own word: that batch fixed the CACHED path and
    proved it over cached rebuilds, and the fetch path went on being the weaker of the two.
  · **THE TITLE IS THE ONE EXCEPTION AND IT HAD TO BE.** `applyRoman` is not idempotent — a row's
    output can be another row's input, Wade-Giles `Pi` being pinyin `Bi` — so a title corrected into
    the cache and corrected again on reading it gives Cao **Bi**, Xu **Zhu**, Ma **Zhao**, **Dao** and
    **Gan** Ze. It is corrected **where it is read** (`sanKuoHead`, `bothColumns`), so the cache holds
    a corrected title beside an uncorrected body: an asymmetry, and the only shape right for both. It
    is also what keeps `titlesCorrected` true for the Three Kingdoms.
  · **It takes the original column out of the English chain**, which `correctRaw`'s own comment says
    is where it belongs — a facing-page book extracts both columns from one page, so correcting the
    page corrected the Chinese too. Nothing changes today; the guard is against tomorrow.
  · **The benefit begins at each book's next REFETCH.** The caches still hold corrected prose, so
    until a book is refetched a dead-row report is still E19's caveat rather than a fact.

**A CACHE RECORD SAYS WHICH KIND OF PROSE IT HOLDS** (`raw: 1`, Sep 2026, batch E30). E29 moved the
correction chain to run on the extracted prose, so a record written from that point on holds the
extractor's own output and every row must fire against it; a record written before it holds prose an
earlier run had already corrected, and against that a row doing its job perfectly fires nowhere. The
run counts what it read and says which case it is in — E19's caveat prints only when a legacy record
was actually read, and where the cache is the source's own prose the run says the opposite outright:
*"a row reported DEAD below names damage that is not there."*

  · **It is what made restoring `corning` a decision rather than a guess** — see below.
  · **The twelve books on this branch that carry a correction table were refetched to make it true**
    (~1,700 pages). The other 36 either declare no table or are on a branch that has always corrected
    after reading its cache.

**AND THE REFRESH FOUND TWO REGRESSIONS OF THIS PROGRAMME'S OWN MAKING** (E30):

  · **THE THREE KINGDOMS HAD BEEN ROMANISED TWICE, in 111 of its 120 chapters and 974 names.** E19
    made the cached path re-apply `correctRaw` to prose an earlier run had corrected — right for
    `fixes`, `reFixes` and `glyphs`, which are idempotent, and **wrong for `roman`, which is not**:
    a row's output can be another row's input, so `Ch'ang` → `Chang` → `Zhang`. `Chang'an` became
    `Zhang'an` 66 times, `Ma Chao` became `Ma Zhao`, `Tao Qian` became `Dao Qian`, and `Zhang Chao`
    (張超) became `Zhang Zhao` — who is a different man. The unaspirated names pass through both
    applications unchanged (`Liu Bei`, 695 times), which is why it read as ordinary variation. **A
    refetch corrects once and the book is right again**, and stays right because the cache now holds
    the source's own prose.
  · **`corning` IS REAL AND E19 DELETED A LIVE ROW.** E15 repaired *"by the dove **corning** upon the
    Lord when He was baptized"* in the Summa; E19 found no standalone `corning` in the shipped file,
    concluded the row could never fire, and removed it. Refetching chapter 461 puts the fault straight
    back — one standalone occurrence against three `scorning`s. What E19 was reading was **E15's own
    repair**, carried in the cached prose. **A dead-row report is evidence about the TEXT IN HAND,
    never about the source: check the source before removing a row.**

**AND `fetchOriginal` NO LONGER CLOBBERS THE ENGLISH PASS'S RECORD** (Sep 2026, batch E30). A
facing-page book's two columns come off one page, so the original pass reads the record the English
pass just wrote — and under `--force` it was building a fresh one instead, throwing away the title
the extractor had read off the text and the `raw` marker that says whose prose the record holds.
Nothing rendered differently, both books on that path stating their titles in this file, but **the
marker went missing on exactly the books a `--force` run had just made trustworthy**, which is the
reverse of what it is for. The record on disk is now read even under `--force` and merged rather than
replaced.

**…AND FIVE ENGLISH BRANCHES WERE NEVER IN THE CHAIN AT ALL** (`correctGot`, Sep 2026, batch E31).
E29 said there is now one spelling of the correction chain and every branch that has raw English in
hand calls it. That was untrue for five: `play`, `fitts`, `terzine`, `eddapoem` and `laisses` each
read a cached page, handed it straight to a reader of their own, and pushed the result onto
`chapters` without ever calling `correctRaw`. A book on one of those branches simply never got its
own corrections.

  · **THE SYMPTOM IS A DEAD ROW BESIDE A WORD THAT IS PLAINLY IN THE TEXT.** Four rows written for
    the Poetic Edda and the Song of Roland reported `DID NOT FIRE` — `Balled` for `Ballad`, `Carlum`
    for `Carlun`, `Marsilium` for `Marsiliun`, `Sarrazens` for `Sarrazins` — with the misspellings
    sitting in the shipped files where anyone could grep them. Nothing threw and the books built
    perfectly; the rows were simply never consulted. **A `DID NOT FIRE` line is a claim about the
    chain as much as about the text** — E30 made that point one way round (the cache held prose the
    chain had already corrected) and this makes it the other (the chain was never run).
  · **IT CORRECTS THE EXTRACTED PROSE, NOT THE PAGE**, which is E29's rule and buys E29's property:
    the caches stay raw, so a row added later fires on the next ordinary run with no `--force`.
  · **AND IT TAKES THE TITLE WITH IT.** `extractPlay` reads a scene's head off the page, so a chapter
    title is English text like any other and goes through the chain. It is `c.t` that is corrected,
    never the `titles` table in this file, which is Folio's own declaration and not a transcription.
  · **ONE HELPER RATHER THAN FIVE COPIES OF THREE LINES.** `correctGot` takes both shapes an extractor
    returns — an ARRAY of parts (`play`, `laisses`) and a single object (the other three) — and
    touches `html`, `t` and `notes` where each is a string.
  · **PROVED BYTE-FOR-BYTE ON EVERY BOOK ON THOSE BRANCHES**, which is five and not fifty: Lysistrata
    (`play`), Beowulf (`fitts`) and the Divine Comedy (`terzine`) declare no correction tables and
    came back identical to the byte, the Song of Roland changed on three lines and the Poetic Edda on
    one, and those four lines are the four rows. `applyGlyphs` and `unwrapNameMarkup` both return
    their input untouched when the book declares no table, so the three were inert by construction as
    well as by measurement.

**A FORM THE EDITION USES TO THE EXCLUSION OF THE RIGHT ONE IS THE EDITION'S OWN SPELLING** (Sep
2026, batch E31, and the discriminator every sweep since B6 should have been stating out loud). The
single-occurrence sweep asks for a token one confusion-class substitution away from a form the book
uses ten times or more — so the arithmetic is already in the candidate list, and reading it is what
tells damage from vocabulary. Each of E31's twelve repairs stands alone against 5 to 230 of the
correct spelling: the edition plainly knows the word.

The Bhagavad-Gita's eighth discourse does not. It is *"THE YOGA OF THE INDESCTRUCTIBLE SUPREME
ETERNAL"* on the page, twice in the text, with the correct spelling **nowhere in the book** — the
misspelling is the 1922 Natesan printing's own, this file's entry had already recorded the decision
to keep it as printed, and a row for it was written, applied, and then withdrawn. Transcribing a
title means transcribing it. **The count was in front of me the whole time and said 0 correct** —
the check costs one grep, and it is the one that separates a slip from an edition's own error.

**WHICH SIDE OF EXTRACTION A BOOK'S CHAIN RUNS ON IS DECIDED BY WHAT ITS ROWS NAME** (Sep 2026, batch
E32). E29 moved one branch from correcting the page to correcting the extracted prose and gave the
reason: a row facing a page full of tags is weaker than one facing prose. E31's scan found eight more
branches still on the older shape. Pointed at all eight, the reason turns out to hold for **five of
them and to be exactly backwards for three**.

  · **MEASURED FIRST, and the weakness was not being suffered.** Six of the eight books carry a
    correction table. Applying each book's own rows to its raw cached page and asking whether any hit
    lands inside a tag: **zero, on all six**. So the move is a hardening against a row written LATER,
    not a repair — which is worth saying plainly, because it decides how much risk is worth taking
    for it.
  · **THE FIVE THAT READ MARKUP WERE MOVED** — `kanda` and `satyricon` (TEI), `sukta`, `tablets` and
    `ptahhotep` (HTML). Rebuilt: **all five byte-identical, every row still firing, no dead rows.**
  · **THE THREE THAT READ PLAIN TEXT WERE NOT, and the measurement is the argument.** Moved,
    the Canterbury Tales loses **180 of its 198 rows** and Journey to the West **13 of its 327** —
    193 repairs — while Don Quixote's single row is inert either way. The mechanism is not subtle
    once seen: those rows name **the scan's own damage**, and the extractor's job is to clean exactly
    that up before it builds a paragraph. `his_^pmiishment`, `fiie"clouds~and`, `Ping(preftctHre.)Chap.`,
    a page number sitting inside a word, five lines the scanner scrambled — none of those strings
    exists any more once `extractChaucer` or `extractJourney` has run, so the row matches nothing and
    the damage ships.
  · **So the rule is not a preference.** A row that names a form the SOURCE published — an OCR
    ligature, a run-together line, a stray mark — must run on the page, because that form is what the
    page has and what the extractor removes. A row that names a WORD can run on either, and runs on
    the prose, because that is where a tag can no longer come between its letters. **Read the book's
    own rows before deciding, and if they are full of punctuation the reader will never see, the
    answer is already given.**

**AND `correctGot` DID NOTHING AT ALL ON A SHAPE IT DID NOT RECOGNISE** (Sep 2026, batch E32, and it
is E31's own fault wearing the coat of the helper written to close it). Shipped in E31 it ended
`return one(got)`, so an object that was neither an array nor a part — a reader's `{ chapters: […],
counts }` — fell through and came back **untouched, with nothing reported**. Its own comment claimed
that a reader added later with a name not in the list would "fail loudly here"; it did not, and the
comment was the only thing saying otherwise.

It was found by pointing the helper at the three plain-text readers, whose parts hang off `chapters`:
**198 Canterbury Tales rows went dead in one run, and the only thing on screen that said so was the
dead-row report** — the build printed its counts, said `Wrote books/canterbury-tales.js`, and was
believed for a good ten minutes. It throws now, naming the keys it found. **A comment claiming a
helper fails loudly is not a helper that fails loudly**, and the difference is one line and a test.

**THE TRANSCRIPTION'S ITALIC, WHICH ONE READER WAS NEVER GIVEN** (Sep 2026, batch E33). Project
Gutenberg marks italic with a pair of underscores. `extractChaucer` has converted them since the day
it was written; `extractQuixote` did not — so **86 italic passages of Don Quixote shipped with their
marks showing**: *terra firma* reached the reader as `_terra firma_`, `_mine_` and `_thine_` in the
Golden Age speech carried four underscores between them, and the romance parody the novel opens on
had one at each end of 271 characters.

  · **MEASURED BEFORE IT WAS WRITTEN**, because a pairing rule that guesses is worse than the marks it
    replaces. Every chapter's underscore count is EVEN, all 86 spans pair, and **not one crosses a
    paragraph, a blockquote or even a `<br>`** — so the conversion runs per BLOCK, where `[^_]` cannot
    reach past the end of the block it is in, and it needs no lookahead and no state.
  · **WHAT IS LEFT OVER IS REPORTED RATHER THAN KEPT QUIETLY.** An odd underscore is either damage the
    reader should be told about or a pairing this rule cannot see; the run prints both figures, for the
    same reason the verse blocks and the all-capital blocks are counted beside them.
  · **AND AN UNDERSCORE IS NOT ALWAYS AN ITALIC MARKER.** The Canterbury Tales' source is a SCAN, not a
    Gutenberg text, so its 22 underscores are specks and rules the OCR read as characters — which is
    why `extractChaucer`'s own `_..._` rule has never once fired on it: all 106 of that book's italics
    are rubrics. **Ask what the source IS before reading its punctuation as markup.**

**TWO CONFUSION SHAPES THE SCANNER'S SET DID NOT CARRY** (Sep 2026, batch E33). `book-scan.js` holds
u/n, c/e, l/i, l/t, h/b, f/t, o/c, g/q, y/v, m/n, rn/m, in/m, cl/d, li/h and ii/n. Two more turned up
by accident, in a word noticed while reading round something else:

  · **`h` READ AS `n`** — the arch of the h breaking so the letter closes into an n. `somewnat` for
    *somewhat*, `cniefest` for *chiefest*, `bethougnt` for *bethought*, `Tney` for *They*.
  · **`na` READ AS `m`, AND `m` SET AS `na`** — the same accident as the `rn/m` and `in/m` already in
    the set, one letter pair further on. `Damans` for *Danaans*, `naortal` for *mortal*, `naagic` for
    *magic*.

**THE SHELF IS THE DICTIONARY, and that is what makes the h/n class usable at all.** Swept over the
whole corpus it returns 57 candidates, nearly all of them ordinary words — `snow`/`show`,
`heed`/`need`, `nigh`/`high` — because n and h swap into common English. Filtering to forms **no
other book on the shelf knows** cuts it to nine, of which four are damage and five are real archaic
words the filter cannot know (`nere` in Malory, `nighest` in the Summa, `snaring` in Plato, and the
Chinese place names `Jianghan` and `Nanzhong`, both correct as printed). The plan's own rule about
the confusion set — *a list nobody can read through is not evidence* — survives, and the shelf-wide
filter is how a noisy class is made readable rather than abandoned.

**AND A NAME MISREAD IS MISREAD WHEREVER IT IS SET THE SAME WAY.** `Damans` stands **three** times in
the Iliad, so the single-occurrence sweep is blind to it: the `na`/`m` sweep allows up to four
occurrences for exactly this reason, and the shelf filter carries the weight the count no longer can.

**A PLATE IS NOT NOTHING TO AN OCR, AND ITS CAPTION LANDS IN THE PROSE** (Sep 2026, batch E34, in
`extractJourney`). Journey to the West is a 1913 volume with thirty engravings, each captioned under
the plate. The scanner reads the picture as a run of blank lines, so the caption arrives as an
ordinary line of text in the middle of whatever paragraph the plate was bound into — and three of
them broke a sentence in half: *"But the women Bajie tempted at the Bathing Fool. would not let him
go."*

  · **THE TABLE OF WHAT TO REMOVE IS THE BOOK'S OWN LIST OF ILLUSTRATIONS**, read out of the front
    matter the reader is about to throw away. That is the whole reason it is safe. The alternative is
    a rule about the SHAPE of a caption — a short line inside a run of blank lines — and this scan has
    **523 runs of four blank lines**, most of them ordinary page breaks. Matching against the
    printing's own list asks a question the book has already answered, and it travels with the
    transcription instead of being a guess about it.
  · **IT IS A FUZZY MATCH BECAUSE BOTH SIDES ARE OCR** — the list prints "A Dragon transformed into a
    Horse" and the plate itself comes back "A Dragon tbanspormed into a r:cRSE." At a threshold of
    **0.40**, with the line required to sit behind **three or more blank lines**, twenty-two blocks
    match and every one is a plate caption; the nearest thing that is not is at 0.43. Both halves are
    needed: the ratio alone catches "chapter." against "The Master", and the blank run alone catches
    every page break in the book.
  · **THE THRESHOLD IS 0.40 RATHER THAN 0.35 BECAUSE THE CORRECTION CHAIN MOVES ONE SIDE AND NOT THE
    OTHER**, and that is the thing to know before tuning it again. The chain runs before this reader,
    so the LIST is romanised — *Kwanyin the Holy Spirit* becomes *Guanyin the Holy Spirit* — while the
    caption on the plate is too mangled for the same row to fire on it (`KWANYIM TIIE IFOLY SpiKIT`).
    The two drift apart by the width of the correction: that one caption sits at 0.30 against the raw
    list and 0.40 against the corrected one. **A row that fires on one side of a comparison and not on
    the other widens it.**
  · **A CAPTION MAY RUN TO MORE THAN ONE LINE**, so what is removed is the whole non-blank BLOCK the
    matching line belongs to — nineteen are one line, two are two, and one is four, the plate of the
    Incarnate One carrying the translator's note on the dove under its caption.
  · **AND THE ENGRAVING COMES OFF WITH IT.** The hatching is read as short blocks of punctuation
    (`-^A^^K^^^i^`, `\&r,4??:`) and the plate's corner marks as two- to six-character blocks that
    happen to be letters (`Vx-j`, `Mihi`), all sitting in the same white space. The removal walks OUT
    from the caption over any adjacent block that is short and mostly not letters, and stops at the
    first that is not — **eighteen blocks absorbed, every one engraving noise**. The six-character
    bound sounds reckless and is measured: the book has 24 such blocks, four of them real prose left
    stranded by a page break (`Truly.`, `done,`, `next.`, `Thus,`), and **not one of the four sits
    beside a plate**. The rule only ever walks out from a matched caption, which is what keeps it so.
    The chapter title `A DRAGON EXECUTED`, which sits directly after one of the plates, has eighteen
    letters and is untouched.
  · **THREE LINES ARE LEFT TO PER-INSTANCE ROWS** rather than to a wider rule, and each says why: the
    sub-caption under the Kwanyin plate (the list names a plate once, so there is nothing to match it
    with), and the last plate's hatching and the tail of its caption, which are too long for the noise
    rule and too letter-dense for its ratio. Widening either bound to reach them would mean taking any
    short capitalised sentence next to a caption, which is a rule that eats prose.

**A 107th RUNNING HEAD, AND WHY THE CAPS TEST IS LOAD-BEARING** (same batch). `HEAD_NUM`'s comment
recorded that the trailing page number "read cleanly in all 106 cases", so only the LEADING form took
the widened glyph class. The 107th is `BUDDHA PEOVIDES SCRIPTURES lOT` — 107 read as l-O-T — standing
between "He" and "agreed". The trailing class now takes `T` as well, and **the widening removes
exactly one more line in the whole book**: what makes that safe is the caps test the head rule already
applies (over three-quarters capitals, six letters or more), which no line of this translation's prose
or verse passes. Widen the glyph class if you must; never drop the caps test.

**AN ARTICLE THE TRANSCRIPTION LOST, AND THE ONLY THING THAT CAN TELL ITS ERROR FROM THE PRINTING'S**
(Sep 2026, batch E35). A new check — *does the book carry a paragraph twice in one chapter?* — found
the Summa serving duplicated text. Read out, the duplication is a whole ARTICLE: Wikisource's page for
I-II q.52 sets article 2 twice, the second time under article 3's number, and its page for II-II q.43
sets article 4 twice under article 5's. So Folio was not merely repeating a passage; it was making a
FALSE CLAIM — that article 3 asks what article 2 asks — and an article of Aquinas was missing.

  · **THE BOOK ITSELF NAMES WHAT IS MISSING.** Every question in the Summa opens by listing its own
    points of inquiry, so the witness is inside the text: q.52's list ends "(3) Whether each act
    increases the habit?" where the transcription sets "Whether habits increases by addition?" twice.
    **When a work states its own contents, check the contents against them** — it costs one pass and
    it is the strongest witness there is, being the same page.
  · **THE REPLACEMENT IS THE SAME TRANSLATION, AND THAT IS MEASURED, NOT ASSUMED.** Project Gutenberg
    carries the Fathers of the English Dominican Province (Benziger 1920) in three volumes. Run on an
    article BOTH transcriptions carry, the converter produces text **99.83% word-identical** to the one
    this book already ships — so the two are one edition transcribed twice, and what is spliced in is
    not a different Summa. **Validate a converter on the overlap before using it on the gap.**
  · **THE WORDS LIVE IN `.claude/summa-supplied.json`, NOT IN THIS FILE.** `fetch-book.js` holds rules;
    prose Folio asserts belongs in a book belongs where it can be read and reviewed. Three typographic
    normalisations are declared in that file's own header, each because this book's 614 questions are
    set that way — `Obj. N:` written out (the wiki spells it out 20,448 times and abbreviates it never),
    `Reply Obj. N:` likewise, and Gutenberg's underscore italics dropped (this book carries no `<i>`).
  · **IT REPAIRS ONLY WHAT IT FINDS BROKEN.** The splice happens only where the named article's body
    really is its predecessor's word for word, so an upstream fix makes the entry stop firing and SAY
    SO rather than overwrite a corrected article with our copy. Reported like a dead correction row.

**AND THE THIRD CASE, WHICH IS THE FINDING.** II-II q.47 sets article 10 under article 9's title, and
its own inquiry list disagrees with it. It looks exactly like the other two — and **the Gutenberg
transcription carries the same wrong heading.** Two independent transcriptions agreeing is the evidence
that the fault is the PRINTING's rather than the wiki's, so it is transcribed as printed and gets no
repair. That is E31's Bhagavad-Gita rule one batch on, and it names the instrument: **a second
transcription of the same edition is what tells a transcriber's error from the printer's, and nothing
else can.** Where only one transcription exists, the question cannot be settled and the text stands.

**AND A WHOLE QUESTION, WHICH THE SAME TRANSCRIPTION HAS NOT GOT AT ALL** (Sep 2026, batch E38,
`supplyQuestion` + `pageShift` + `.claude/summa-witness.js`). E35's duplication check finds a loss
that leaves a DUPLICATE behind. **A loss that leaves nothing behind is invisible to it, to every
spelling sweep and to `book-audit` alike** — and the Summa had one. Wikisource's Third Part serves
question 33's text under `Question 34` and question 34's under `Question 35`; `Question 36` is right
again, so **question 35 — Of Christ's Nativity, eight articles — is on no page of it**, and Folio
shipped chapters 455 and 456 byte-identical with 3,678 words of Aquinas absent.

  · **THE FAULT IS IN TWO HALVES AND SO IS THE REPAIR.** Chapter 456 wants question 34, which exists
    and is on the page named `Question 35`: that is a redirection, declared in this book's own
    `pageShift`. Question 35 exists nowhere in the source: that is a supply, from the same Gutenberg
    transcription E35 used. **Redirect what is merely misfiled; supply only what is genuinely gone.**
  · **BOTH HALVES NAME THE FAULT THEY EXPECT TO FIND.** `pageShift` carries the opening the SHIFTED
    page has while it is still wrong, and the supplied question carries the opening the BROKEN chapter
    has; if either phrase goes, the wiki has been corrected upstream and the run says so rather than
    quietly serving the wrong question under the right title. Reported like a dead correction row —
    which is E35's rule, and the two guards were negative-tested by breaking each phrase in turn.
  · **THE VALIDATION AT SCALE NEEDED A DIFFERENT MEASURE.** E35's sequential word walk reports
    **12.96%** for question 36 in the two transcriptions; a bag-of-words comparison of the same pair
    reports **99.41%**, and 99.1–99.7% article by article. The walk desynchronises past the first long
    insertion, so it is right for one article of 800 words and wrong for a question of 7,500.
    **Validate on the overlap, but check that the yardstick survives the length.**
  · **THE ARTICLE TITLES ARE SET BY HAND, checked word-for-word against the witness.** The wiki writes
    every article head in sentence case and Gutenberg in title case, and a rule that lower-cases after
    the first word also lower-cases Christ, the Blessed Virgin and Bethlehem.
  · **THE SUPPLEMENT HAS THE SAME FAULT AND NO WITNESS.** Its `Question 12` page carries question 11's
    text, chapters 523 and 524 are byte-identical, and *Of Satisfaction, As To Its Nature* is gone.
    Gutenberg's four volumes stop at Part III, so it is **measured and not repaired**; find the 1920
    Supplement volume before treating it as unreachable.

**AND TWENTY-SEVEN ARTICLE HEADS THAT NEVER BECAME HEADINGS** (Sep 2026, batch E39, the two
normalisation passes at the head of `markArticuli`). E38 measured fourteen questions carrying articles
Folio does not number, and in twelve the text was present and only the heading unread. It is ONE fault
in five spellings, and each was found only by reading the survivors of the last:

  · **`==== Art. 2 - … ====` sitting in the prose**, because the transcriber let the TITLE WRAP and a
    MediaWiki heading must be on one line, so the closing marks stood on a line of their own (5).
  · **The same with no closing run at all** — the opening marks typed and then nothing (3).
  · **The same inside a `<pre>`**, the line having begun with a SPACE, which is a preformatted block (2).
  · **A bare paragraph with no markup whatever** (10), and **a `<pre>` with no equals signs** (6).

  · **THE COUNT IS CHECKED AGAINST THE SOURCE, NEVER AGAINST THE OUTPUT.** In the finished book all
    ten escaped heads look identical, so after the first pattern the run reported 6 of 10 and the
    four survivors were indistinguishable from the six. **A repair rate measured on the thing you
    have just repaired says "finished" every time** — it said so three times here.
  · **THE UNMARKED HEAD IS FOUND BY THE WORK'S OWN SHAPE, AND THE ARGUMENT IS A MEASUREMENT.** Every
    article opens with its question and then "Objection 1:", so a short paragraph ending in a question
    mark whose next paragraph opens on that phrase is a head. Over the whole book it agrees with the
    existing numbering **3,071 times** and finds **16** that are not numbered, all in the six
    questions the book's own points of inquiry say are short. It only ever ADDS: 38 numbered heads do
    not open on an objection, and reading that as evidence would make a finder into a remover.
  · **WHERE NO HEADING STATES THE COUNT, THE PROSE DOES.** Three questions carry no question heading,
    so the `(FOUR ARTICLES)` parenthetical is not on the page — but the question opens by saying how
    many points of inquiry it has, in words. Same statement, same edition, read from the body. It also
    **corrects** II-II q.29, whose three headings are numbered 1, 2 and 3 where the third is the
    question's fourth article.
  · **ITS OWN FIRST FIX ATE AN ARTICLE.** The role test claims the first heading carrying no article
    number as the TREATISE line; on a page whose only headings this pass had just made, that was
    article 1, leaving five against a stated six and nothing numbered at all. Synthesised headings
    carry `folio-barehead` and the fallback skips them. **A normalisation feeding an existing pass
    must be read against every rule that pass already applies.**
  · **THE COUNT SENTENCE IS THE LAST ONE, NOT THE FIRST.** Several questions open with a two-level plan
    — the treatise's topics, then "Under the first head there are three points of inquiry" — so taking
    the first match reads the plan as the article list: 35 questions look short of an article against
    16 taken the other way. One survives even that (II-II q.48 says four points and has one article,
    the other three being questions 49–51), and it is recorded rather than "fixed".

**AND TWO MORE THAT WERE SIMPLY GONE** (Sep 2026, batch E40, `insertArticle`). E39 repaired heads that
were UNREAD; these had nothing behind them, and between them they needed the THIRD supply mode and a
second witness.

  · **SUPPLEMENT QUESTION 12 IS E38's FAULT AGAIN** — its page carries question 11's text, so chapters
    523 and 524 shipped byte-identical. **Gutenberg's four volumes stop at Part III**, which is what
    made E38 leave it; the witness is **CCEL**, validated at **99.02% and 99.12%** on Supplement
    questions 11 and 13 that Folio already carries, and it needs no reply-marker normalisation because
    it writes "Objection 1:" exactly as this book does. **It is cross-checked against New Advent's
    independently derived copy (97.4%)**, and that matters more here than anywhere: CCEL and Wikisource
    may share a transcription lineage, and **agreement between relatives proves nothing**.
  · **ASK WHO ELSE PUBLISHES THE TRANSLATION BEFORE CONCLUDING A WITNESS IS UNREACHABLE.** The
    archive.org search that E38 ran found printed volumes for Supplement questions 34–68, 69–86 and
    87–99 and **none for 1–33**; two web editions of the same translation carry all of it.
  · **CCEL's OWN TEXT IS ONE `<div class="book-content">`.** A slice from the top of the page drags 40%
    site chrome in and scores 0.83 — which reads as a different transcription and is a different
    SELECTION of the same one.
  · **II-II q.180's ARTICLE 5 IS A LOST ARTICLE AND NEEDED AN INSERT.** Its heading labelled `Art. 5`
    carries article SIX's title and text (**99.83% against 45%**, measured), so the question ran
    1,2,3,4,5,7,8 with the fifth gone. `insertArticle` puts it before the block standing in its place
    and renumbers the chapter 1..N — the count-agreement rule one layer later — with `beforeTitle` as
    the guard, naming the title that block carries WHILE THE FAULT STANDS.
  · **THE TWO REPLY NORMALISATIONS ARE ORDER-DEPENDENT AND WERE THE WRONG WAY ROUND.** `Obj. N:` →
    `Objection N:` applied first eats the `Obj.` inside `Reply Obj. N:`, so **28 replies shipped as
    "Reply Objection 3:"** — 3 in the article E35 supplied, 25 in the question E38 supplied — against
    7,590 correct ones written by the transcription itself. **Nothing in the pipeline could see it**:
    the words are right and the marker is a form the book never otherwise uses, so no non-word sweep
    and no citation check touches it. It surfaced only on running the converter again and reading its
    output. **Read what a converter PRODUCES, not only what it was given.**
  · **KNOWN AND UNREPAIRED: II-II q.153, a page fault of a fifth kind.** Its question heading carries
    **article 1's title** and its prologue is missing, so that heading is dropped as furniture and
    article 1 with it, leaving four headings for a stated five and the printing's articles 2–5
    numbered 1–4. The likely rule — *a question's own title is a noun phrase in capitals and never an
    interrogative, so a "Question…" heading ending in a question mark is an article head* — touches the
    weak role test that four other questions depend on, so it wants a whole-book remeasure.

**AND THE COUNT WAS ON EVERY PAGE ALL ALONG** (Sep 2026, batch E41). Each of the 614 carries a
`ws-title` header block — *"Summa Theologiae — Question 153 - OF LUST (FIVE ARTICLES)"* — put there by
the transcription's own header template, and **it is right even where the body's question heading is
missing, misnumbered, or carries an article's title instead**. `markArticuli` now reads the count from
there first, with the body heading and E39's prose sentence as backstops.

  · **IT IS READ FROM THE WHOLE PAGE, NOT FROM `b`.** That block is furniture to a reader, so the
    `ws-noexport` pass strips it well before this hook runs; `cleanBody` passes `h` down for it.
  · **CHANGING WHERE A COUNT COMES FROM TOUCHES EVERY QUESTION, SO ALL 614 WERE REFETCHED AND DIFFED
    — AND EXACTLY ONE CHAPTER MOVED.** That is the strongest statement available here: on 613 pages
    the header block and the body heading agree, and on the one where they do not the header is right.
    **608 of 614 questions are now numbered by their own stated count**, against 4 before E39.
  · **A QUESTION'S OWN TITLE IS A NOUN PHRASE AND NEVER AN INTERROGATIVE.** II-II q.153 heads itself
    *"Question. 153 - Whether the matter of lust is only venereal desires and pleasures?"* — article
    1's title — with no prologue at all, so the weak "Question…" role test claimed it, the pass
    dropped it as furniture, and article 1 went with it. That test now stands down on a heading ending
    in a question mark. Read as an article the head was then titled after the question it is in, so a
    `Question. N -` prefix is stripped, in ONE place, or the duplicate test and the emitted heading
    compare different strings.
  · **A COUNT READ FROM THE PAGE IS A COUNT READ FROM THE PAGE THE REDIRECTION FETCHED.** Chapters 456
    and 457 report "the heading says 8 articles and 4 were found", because E38's `pageShift` sends 456
    to the page named `Question 35`, whose header states question 35's count while its body carries
    question 34. The printed numbers are kept, which is right for 456, and 457 is replaced by the
    supplied question anyway — but the guard firing there is correct and should stay.

**📖 `.claude/check-twins.js` — RUN IT AFTER ADDING A BOOK.** The Summa's duplicated-chapter check,
generalised to the whole shelf (Sep 2026, batch E42), and it is the one fault no other checker here
can see: **the wrong chapter is perfectly good prose**, and what gives it away is a fact about the
BOOK rather than about any sentence in it. It found Aesop's fable 122, *The Old Lion*, carrying fable
121's text — scan page 90 holds three fables and Wikisource's page for that one transcludes the first.
Over the shelf: 4,397 chapters compared pairwise, one pair.

  · **IT COMPARES RUNS OF EIGHT WORDS, NEVER VOCABULARY.** Two chapters of one work share their
    author's entire vocabulary, so a bag-of-words test scores every pair high and finds nothing.
    Aquinas closes 54 articles with one identical sentence and no pair comes near the bar.
  · **THE WITNESS FOR THE REPAIR IS THE SCAN PAGE THE BOOK IS TRANSCRIBED FROM**, which is why it
    validates EXACTLY where every other supplied text on this shelf validates at 99-point-something:
    run on the fable printed beside it, the extractor produces a byte-identical string. Gutenberg's
    Townsend (ebook 21) was refused as an American reprint — `clamor` for `clamour`, small capitals,
    a clause reordered in the very fable used to check it.
  · **THE SIBLING TITLE-CHECK DOES NOT TRANSFER, and it is recorded here so nobody builds it twice.**
    `summa-witness.js` also reads each chapter's title against its own opening; over the shelf that
    flags 123 of 1,979 chapters and essentially all are legitimate — Seneca's letter titles are the
    translator's, Sophocles is divided into "Episode, lines 883–943", the Ramayana transliterates a
    name one way in a title and another in the verse. **A title check only works where the title is a
    claim about the text**, which the Summa's are and most books' are not.

**📖 `.claude/summa-witness.js` — RUN IT AFTER ANY CHANGE TO THIS BOOK.** The fourth scanner, and the
only one that can see text that is simply gone. Three checks: articles against the witness, each
chapter's TITLE against its own PROLOGUE (two independent statements of one fact — this is what finds
a question standing in another's place), and any two chapters carrying byte-identical text. The last
two need no witness, which is why they reach the Supplement and the Appendix, where 102 of the 614
questions have none.

  · **READ THE HEADING'S ORDINAL WORD, NEVER ITS BRACKET.** Gutenberg heads an article
    `NINTH ARTICLE [I, Q. 19, Art. 8]`, and the two disagree **seventeen times** across the four
    volumes; the bracket also writes `I.` for `I,`, `A.` for `Art.` and sometimes omits the part
    letter. Keyed on the bracket the first run reported 33 questions where Folio has an article the
    witness has not, and every one of the 33 was the checker's own. **A comparison between two
    witnesses reports the weaker one's faults as the stronger one's** until it is hardened, which is
    E37's lesson in a new subject.
  · **IT EXITS 0 WHATEVER IT FINDS.** It is a measure, like `card-focus.js`, not a gate: its standing
    residue is the numbering family E38 left for E39, and a permanent red teaches everyone to ignore it.

**TWO MORE SHAPES OF DUPLICATION, AND THE FOUR CASES THAT LOOK IDENTICAL AND ARE NOT** (Sep 2026,
batch E36, `dedupeArticles`). E35 put back two articles the Summa's transcription had lost; fifteen
paragraphs still stood twice. Read out they are two faults, both a transcriber's paste gone astray:

  · **THE TAIL OF THE NEXT ARTICLE, PASTED AT THE END OF THIS ONE.** In I q.108 and I q.109 the last
    two paragraphs of one article are the last two of the NEXT one, the first of the pair truncated —
    so article 1 of q.109 ends by answering objections it never raised. **Four paragraphs in the whole
    book, in two questions, both read against the wikitext.** The truncated half is caught as a SUFFIX
    of a paragraph in the next article, which is what a half-pasted block is.
  · **A RUN OF PARAGRAPHS SET TWICE IN A ROW.** I-II q.20's page carries **seven article headings for
    a six-article question** — article 5 set twice, the second under article 6's number, the real
    sixth pushed to a seventh — so eleven paragraphs stand twice; and two questions have one paragraph
    typed twice. **Three runs in the whole book, all three checked in the wikitext.**

**THE LENGTH BAR IS THE WHOLE OF WHAT MAKES THE FIRST RULE SAFE, AND IT IS MEASURED.** Six article
boundaries in the Summa end with a paragraph that also stands in the next article, and **four of them
are not damage at all**: they are the work's own closing formula — *"This suffices for the Replies to
the Objections"*, which the book prints **55 times** — so two adjacent articles ending the same way is
Aquinas's convention rather than a paste. The four run **48 to 66 characters** and the two real faults
**213 and 416**, so the bar sits in 147 characters of open ground. **A rule that fires six times where
two are wrong is not a rule; the measurement is what turns it into one.**

**AND IT SPLICES RATHER THAN REASSEMBLES.** The first cut rebuilt each chapter from its paragraphs and
the book **grew by 45 KB** — the whitespace between every paragraph in 614 questions, changed for
nothing, and a diff saying nothing on every line. Dropping character ranges out of the original html
leaves the file byte-identical everywhere the rule did not fire: **four lines of `books/` changed, and
they are the four questions that were read.** A rule that touches a file it had no finding in cannot be
proved inert, whatever it did to the text.

> **THE AUDIT'S REPEATED-PARAGRAPH CHECK NOW HAS TWO KNOWN FALSE FAMILIES, and both are the same
> lesson.** The Summa's closing formula is one. The other is in the Latin Bede: book 1 quotes several
> of Gregory the Great's letters, and two of them carry the identical dating clause — *"Data die X.
> Kalendarum Iuliarum, imperante domino nostro Mauricio Tiberio…"* — because they were sent on the
> same day, one closing *reverentissime frater* to a bishop and one *domine fili* to a king. **A work
> that repeats itself by convention looks exactly like a transcription that repeats itself by
> accident, and only reading the two occurrences apart tells them apart.**

**THE CACHE MARKER WAS TELLING A HALF-TRUTH, AND THE DEAD-ROW REPORT LIED ABOUT FIVE LIVE ROWS**
(Sep 2026, batch E37). A sweep of the whole shelf — every one of the 32 books that carries a
correction table, rebuilt and its report read — returned **24 dead romanisation rows in the Three
Kingdoms** and nothing anywhere else. Every one of the 24 names is CORRECT in the shipped book: Guan
Yu 589 times, Zhao Yun 357, Lü Bu 403. So the rows were not broken, and the report was.

  · **THE CAUSE IS E29 HALF-APPLIED.** That batch moved the correction chain to run on the extracted
    prose so a row would fire on every run — and corrected the TITLE where `sanKuoHead` reads it,
    which is *before* the record is cached. So a cache record marked **`raw: 1`** — E30's marker,
    meaning *this holds the extractor's own output and not a corrected copy* — had a raw `html` and a
    corrected `t`. Five of this book's romanisation rows fire **only on chapter heads**, because the
    printing drops the umlaut there and nowhere else (`Lu Pu` for *Lü Pu*, `Kuan Yu` for *Kuan Yü*);
    on a cached run they met a head already converted and reported themselves dead.
  · **THE DANGER IS THE HOUSE RULE ITSELF.** *Every declared row must fire; a dead row is a defect.*
    A session following it would have deleted five live rows, and **eight chapter titles would have
    gone back to Wade-Giles at the next `--force`, with the build saying nothing**. E30 taught that a
    dead-row report is evidence about the text in hand rather than about the source; this is the same
    lesson one level down — **it is evidence about the CACHE, and a marker that overstates what the
    cache holds makes it evidence about nothing.**
  · **THE FIX IS A VERSIONED MARKER, and it had to be.** The title is now cached raw and corrected on
    the way out, beside the html and the notes. But a record written before that says `raw: 1` and its
    title is ALREADY corrected, so correcting it again applies `applyRoman` twice — which is not
    idempotent, and which E30 caught doing exactly this to 974 names in the body. Measured before the
    marker was bumped: **seven titles moved, `Tao` → `Dao`, `Pi` → `Bi`, `Chao` → `Zhao`**, every one
    of them a name that was already right. A `raw: 2` record gets its title corrected here; a `raw: 1`
    record does not, and a refetch is what makes it honest.
  · **PROVED BY REFRESHING THE FIVE BOOKS IT CAN REACH** — the wiki-walk books that carry a `roman`
    table, since `fixes` and `glyphs` are idempotent and cannot double-apply. All five rebuild
    **byte-identical**; the Three Kingdoms goes from 2,076 of 2,100 declared names firing to **2,100 of
    2,100**, and from 24 dead rows to none. The cache for chapter 3 now holds the head as the printing
    sets it — *"Tung Cho Silences Ting Yuan: Li Su Bribes Lu Pu."* — which is the plain-u form those
    five rows were written for, and the evidence that they were never redundant.

Recorded and not repaired: the Book of Documents and the Book of Rites both warn that **the
blackletter pre-pass matched nothing**. Every romanisation row in both books fires, so no name is
going unconverted today; what is unknown is whether Wikisource has dropped the `en-Latf` spans the
pre-pass looks for, or whether the flag has simply outlived them. It wants a page fetched and read.
