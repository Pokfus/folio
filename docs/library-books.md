# The Library — the books on the shelf

Moved out of CLAUDE.md (Aug 2026) to keep that file loadable. **Read this before
adding, re-importing or editing a Library book**, and before touching
`books/<id>.js` or `books/<id>.<lang>.js`.

Each entry records what the import settled: how the edition marks its divisions,
what pairs and what does not, what was left behind and why, and the licence
ground the book is shelved on. They are findings rather than description — a
book added later will meet the same traps.

- `books/<id>.js` — one **Library book**'s text: `window.FOLIO_BOOKS_IN.push({ id, intro, chapters:[{ n, p, t, html, notes }] })`.
  **Lazy** (bundle `book:<id>`), **generated — never hand-edited** (see `.claude/fetch-book.js`), and it pushes onto a
  QUEUE rather than assigning a global, for the reason the i18n files do. `intro` is the book's own front
  matter (chapter 0 — see the Library bullet). Currently forty-eight:
  `marco-polo` (~2.77 MB, all 235 chapters, **788 notes**, no original — Sir Henry Yule's
  translation in the third edition of 1903 as revised by Henri Cordier, and **the first book here
  printed in TWO source files**, which costs a second fetch and one loop and matters only because
  every count has to be taken across both: the chapters run continuously from one volume into the
  next and Book Second is split across the join, so a count taken per file is a count of half a book.
  It is also the SEVENTH book from Project Gutenberg and the fourth from its HTML, which the
  Ptahhotep entry calls the easiest of the three paths.
  **EIGHT THINGS IT SETTLED ARE WORTH CARRYING.**
  **AN OFFSET MEASURED IN ONE LANGUAGE IS NOT AN OFFSET IN ANOTHER, and this is the fault the whole
  reader was built around.** The volume boundaries were first found with a Python probe and carried
  into JavaScript as numbers; JS counts a string in UTF-16 code units and an astral character costs
  two, so every span landed short and three separate sweeps reported **225, 233 and 234 chapters**
  with nothing throwing and no two agreeing. `poloSpan` searches for its own boundaries and no
  offset into either file is written down anywhere. The true figure is **235** — Prologue 18, Book
  First 61, Book Second 82, Book Third 40, Book Fourth 34.
  **WHY THERE IS NO FACING ORIGINAL IS THE TRANSLATOR'S OWN ANSWER, AND IT IS A NEW ONE.** The
  Republic's case is that the English states no section numbers; the Prose Edda's is that the
  original's editor is in copyright; Aesop's is that neither column states anything. Here the
  original exists, is complete, is machine-readable and is **CC BY 4.0** — Mario Eusebi's edition of
  the Franco-Italian text of MS BnF fr. 1116, published by Edizioni Ca' Foscari in 2018 — and every
  superficial sign says pair them: 232 chapters against Yule's 235, each with a rubric, and the
  rubrics correspond ("Ci devise de .viii. roiaumes de Perse" against "OF THE EIGHT KINGDOMS OF
  PERSIA"). What stops it is that **this English is not a translation of any one text**, which Yule
  states in his own introduction: he translated from Pauthier's French, then transferred into it
  from the Franco-Italian everything of substance Pauthier had left out, then added between square
  brackets everything peculiar to Ramusio's Italian. Three traditions in one column, and 144
  bracketed passages where the left-hand page would have had nothing to show. **ASK WHAT A
  TRANSLATION IS A TRANSLATION OF, not merely whether an original can be found.**
  **AND THE CHAPTER NUMBERS SAY THE SAME THING A SECOND TIME, ALSO IN YULE'S WORDS**: "232 chapters
  in the oldest French which we quote as the *Geographic Text*, 200 in Pauthier's Text, 183 in the
  Crusca Italian." He knows the figure the Ca' Foscari edition prints, does not adopt that division,
  and cites the older text **by the page of its 1824 printing and never by chapter** — so neither
  edition states the other's sections, which is the decisive test. The alternative was a rubric-by-
  rubric alignment, which is several hundred judgements with only a similarity score behind them:
  the work abandoned for the Meditations' Greek.
  **THE APPARATUS HAS TWO TIERS AND ONLY ONE OF THEM IS A NOTE ON THE TEXT.** 776 of Yule's
  substantive Notes are printed under the chapter and labelled "Note 1."; 295 small footnotes are
  numbered straight through each volume — and measured before anything was written, only a dozen of
  the 295 are cited on Polo's prose while **266 are cited INSIDE a Note**. A flat per-chapter fold
  cannot say "this is a note on that note", so those are spliced into the Note that cites them in
  square brackets: the Art of War's rule at twenty times the scale, using the bracket this edition
  already uses. It is also **the first book here whose notes carry block structure at all** — Yule's
  run to several paragraphs and the longest is 37,652 characters, against a previous shelf-wide
  maximum of 1,835 — so a note is joined with `<br><br>` rather than left as paragraphs inside a
  list item.
  **THE NOTES ARE FOUND BY THEIR OWN LABEL, NEVER BY THE RULE ABOVE THEM AND NEVER BY THE BOX ROUND
  THEM — and the second half of that cost a whole chapter's apparatus before it was written.** The
  obvious boundary is the `<hr>` the printing sets between a chapter and its notes, and it fails
  twice: **five chapters have no such rule at all** and one sets it `class="r40 clear"`. The rule
  was then written on the blockquote holding the notes, a box being structural where a rule is
  decoration — and **that fails on one chapter in 235**: III 30, on Kesmacoran, sets its two Notes
  as bare paragraphs with no box at all, so the region was never found and **a page and a half of
  Yule's commentary, table and all, ran on into Polo's own prose as though he had written it**. The
  chapter is complete, reads perfectly and is wrong. **Nothing but the importer's own dropped-marker
  warning could see it** — every count stayed healthy, and `test-library.js` now additionally sweeps
  the shipped file for a "Note 1.—" label left standing in a chapter's body, which is what the
  failure looks like from the outside. The anchor is the LABEL, which every Note carries by
  definition, and the region opens at whichever block encloses it.
  **AND THE FOOTNOTE CONTAINER MAY CARRY ATTRIBUTES AND MAY NEST**, which is the same lesson one
  element down and was found by chasing the single marker still being dropped after the fix above.
  `<div class="footnote" lang="fr">` is how this transcription marks a note quoting the
  Franco-Italian, with `de` and `it` besides, so a pattern anchored on the bare tag misses **13 of
  the 790** — each a claim in the text whose note silently goes — and **22 of them in the first
  volume hold a plate or a block of verse**, so a non-greedy `</div>` truncates the note at its
  first inner block. Matched loose and closed BALANCED. **Read the whole attribute list before
  writing the pattern**; this file's third instance of that, after the City of God's `ws-noexport`
  and the Odyssey's book divisions.
  **A NOTE MAY BE HUNG ON THE CHAPTER'S TITLE, IN BOTH TIERS, AND ONLY ONE ASSERTION CAN SEE IT.**
  The title becomes the tab, so neither of the shelf's usual answers will do: splicing gives Book
  Fourth's last chapter a 200-character tab reading "Conclusion. [This conclusion is not found in any
  copy except…]", and dropping loses a note about the whole chapter. Four notes are carried down to
  the chapter's first block instead — Bede's `dropFittHead` rule and its refinement, a title
  preceding the prose and opening it. Three of the four are **Notes** rather than footnotes and were
  found by the every-note-is-referenced assertion and by nothing else; each explains that its chapter
  is one Yule took whole from Ramusio, which is why two of those three titles are in brackets.
  **ITS REAL LIMITATION IS BOOK FOURTH AND YULE MARKS IT HIMSELF.** He judged a good many of its
  chapters "the merest verbiage and repetition of narrative formulæ without the slightest value",
  gave the gist of those instead, marked each **⚜**, and named the editions where they can be read in
  full — so 17 of the 235 chapters are a sentence or two rather than the text, the shortest 62
  characters and complete at that length. The mark is the EDITION'S and is kept rather than tidied
  away, which is the Ramayana's rule about a translator who says what he left out. Cordier's signed
  insertions (**—H. C.**, on 348 of the 788 notes) are kept for the same reason. Left behind: Yule's
  memoir, his three
  prefaces, his 130-page introduction, the bibliography, the appendices, the index, 133 plates, nine
  tables the tag stripper would flatten into a column of nouns — and **Cordier's separately published
  *Ser Marco Polo: Notes and Addenda* of 1920**, which the same file carries after the index and which
  repeats the prologue-and-four-books skeleton to hang its own notes on. Read without a boundary that
  is a second Prologue and a second Book First inside one file, which is Bede's finding again: an
  inventory taken over the FILE is not an inventory of the book),
  `bede-history` (~856 KB, all five books as **5 chapters**, **140 chapters as sections**, **1,050
  notes** — A. M. Sellar's revised translation of 1907, and **the first book here whose TWO COLUMNS
  COME FROM DIFFERENT KINDS OF SOURCE with the sides the other way round**: a Project Gutenberg TEI
  HTML English against a wiki Latin, where Thucydides had a Wikisource English against a Perseus TEI
  original. It is also the SIXTH book from Project Gutenberg and the third from its HTML, which the
  Ptahhotep entry calls the easiest of the three paths.
  **THE PAIRING IS THE CLEANEST MEASURED ONE ON THE SHELF**, bettered only by the constructed cases
  and the Gallic War: **140 chapters a side, 34/20/30/32/24 in both, a clean 1..N in every book with
  no gap or duplicate either way, and the two columns' lists identical book for book.** Length
  correlates at **r = 0.9987** over all 140, the English running 1.45–1.50 times the Latin's word
  count in every book — which is the check that mattered, because the Latin's own host rates it 25%
  proofread. The flag is about polish; the text is complete and correctly divided.
  **SIX THINGS IT SETTLED ARE WORTH CARRYING.**
  **THE OBVIOUS ENGLISH IS COMPLETE, SCAN-BACKED, CLEANER IN ITS LICENCE — AND CARRIES NO NOTES,
  WHICH IS WHAT DECIDED IT.** Wikisource has the whole book in L. C. Jane's Temple Classics edition of
  1910 (John Stevens's translation of 1723 revised), one page per book, proofread against a scan,
  pairing with the Latin exactly as this one does, and with a byline that can be traced — Stevens died
  1726, Jane lived 1879–1932, both with author pages and Jane on Wikidata. Swept over all five books
  it holds **zero reference marks**. Sellar's carries 1,081, a new introduction and a life of Bede,
  and was made against Plummer's critical text, which her own preface states. Bede is a book in which
  almost every name needs a note, so that is the difference between a usable book and an opaque one,
  and it was worth an untraceable translator. **Ask what an edition's APPARATUS is before comparing
  its text**: read side by side the two Englishes are close relatives and neither is the Jacobean
  prose that ruled out Golding, Hobbes, Burnaby and I.T. (Sellar keeps the Old English titles —
  "with your ealdormen and thegns" where Jane has "with your commanders and ministers" — and Jane is
  the more literal in places), so on the text alone there was nothing in it.
  **A MACHINE-READABLE ANCHOR IS NOT ALWAYS COMPLETE, AND THIS ONE COVERS 117 OF THE 140 CHAPTERS.**
  The Ptahhotep reader's rule is to find a chapter by its anchor and never by its heading, a heading
  being the ambiguous thing; here the anchors are generated from the index's cross-references, so a
  chapter the index never points at simply has none — 23/19/26/29/20 against 34/20/30/32/24, and only
  ONE of the five books has an anchor of its own. Reading them would have shipped a book missing a
  sixth of itself with nothing throwing. **Count what an identifier actually covers before preferring
  it to the thing it was meant to improve on.**
  **THE INDEX USES THE SAME MARKUP AS THE VERSE**, so an inventory taken over the FILE rather than
  over the divisions being imported reports 1,851 line groups and 3,086 lines of verse in a prose
  history. Inside the five books there is exactly ONE line group holding one line: Sellar sets Bede's
  quoted verse — the epitaphs of Gregory, Caedwalla and Wilfrid — as PROSE inside display quotations,
  which is Heseltine's judgement on Petronius met on another book. So the reader needs almost no verse
  handling and does need the quotations, and both are matched BALANCED, a quotation holding paragraphs
  and a line group holding lines.
  **A KEPT HEADING MAY CARRY A FOOTNOTE MARKER, and four of the 141 do.** That is the Consolation's
  finding on a title that STAYS rather than one that is dropped: flattening the heading to text before
  the anchors come out of it leaves the bare figure 143 sitting in a chapter title while its note sits
  in the fold with nothing pointing at it. Three shipped that way for one run. **Nothing but an
  every-note-is-referenced assertion can see it** — the chapters are complete, the numbering is right,
  the pairing is exact, and the only symptom is a number in a title that looks like part of the title.
  **ITS REAL LIMITATION IS WHOSE LATIN IT IS, and it is stated rather than guessed.** The
  transcription's own header names Migne's Patrologia Latina 95; the text it carries prints
  consonantal *v* as *u* throughout — measured over all five books, **93 `uero` against 2 `vero`, 48
  `uita` against 1 `vita`, 25 `ciuitate` against none, 31 v-spelled words in the whole work** — which
  is the convention of the late-19th-century critical editions and not of a Patrologia reprint, and
  sampled against the scans on archive.org it matches **Alfred Holder's edition of 1895** word for
  word. So the edition it names is not the edition it prints. Holder (d. 1916), Plummer (d. 1927) and
  Migne (1861) are all long out of copyright, so the licence is safe whichever it is; what cannot be
  said is which, and the book's own front matter says so. Lucretius's judgement with a measurement
  behind it. **AND THE CONTINUATION IS NOT SHELVED**: the printed volumes carry a short set of annals
  for 731–766 after Book V, both columns have it, and it is not Bede's — it was added by a later hand
  at his own monastery — so a tab reading Book VI over it would say the wrong thing. Boethius's
  Symmachus epigram, and said on the book's own first page),
  `morte-darthur` (~1.80 MB, all twenty-one of Caxton's books as **21 chapters**, **503 chapters as
  sections**, **0 notes** — the Everyman's Library text of 1906, and **the first book on this shelf
  with no facing original because there is no TRANSLATION.** Every earlier single-column book is
  silent for a reason about a text that exists somewhere: the Republic's Greek states Stephanus
  numbers its English does not, Aesop's two editions state nothing at all, and the Prose Edda, the
  Divine Comedy and Don Quixote each have an original whose editor is in copyright or unnamed. Malory
  wrote in English. The 1906 edition lightly modernises the spelling and leaves the vocabulary alone
  — it keeps a good deal of Caxton's own spelling as well, men *pyght* their pavilions and a knight
  is not yet *hool* of his wound — so the second column would be the same words in another
  orthography, which is a facing SPELLING rather than a facing original. The Canterbury Tales is the
  case to read it against: there Skeat's Middle English faces a prose TRANSLATION by two other hands,
  and the pairing is between two texts. **AND A CAXTON-SPELLING TEXT IS NOT TRANSCRIBED ANYWHERE
  REACHABLE**, measured rather than assumed — English Wikisource has no `Le Morte Darthur` in
  mainspace at all and Sommer's 1889 reprint appears only in a bibliography — so a reader who wanted
  one could not have been served either way. **FIVE THINGS IT SETTLED ARE WORTH CARRYING.**
  **A COUNT REMEMBERED IS NOT A COUNT, AND HERE THE DIFFERENCE IS FOUR CHAPTERS.** Books I, IV, VII
  and IX end at 27, 28, 35 and 43 where the figure usually quoted for Caxton is one higher in each,
  and 503 against 507 looks exactly like four pages nobody has transcribed. It is not: Project
  Gutenberg's wholly independent transcription of the same edition was counted book by book against
  the wiki's page list and the two agree on all twenty-one. **Count it before writing down a gap.**
  **THE OTHER FREE COPY IS A DIFFERENT TEXT, AND ONLY A WORD-BY-WORD WALK SHOWS IT.** PG's ebooks
  1251 and 1252 carry the same 503 chapters in the same 21 books with the same rubrics in the same
  order, and every structural check there is passes on both. Walked against the shipped chapters they
  diverge about a thousand times, and every divergence sampled runs one way — this edition carries
  the older form and that one the modern: *pyght* against *pight*, *hool* against *whole*, *paas*
  against *pace*, *essay* against *assay*, *bitaken* against *betaken*, *stynte* against *stint*, and
  past spelling into vocabulary *alit* against *alighted*, *trappours* against *trappings*,
  *advision* against *vision*. Don Quixote's method, and this time it decided which copy to ship
  rather than how bad the chosen one was. **What PG's copy IS was deliberately not settled**: it
  names no edition and the bibliographical note bound in front of it is A. W. Pollard's and describes
  a Macmillan printing, so identifying it would be composing — the Lucretius judgement, claim less.
  **THE NOTES ARE AN APPARATUS THE EDITION HAS NOT GOT, and they say so themselves.** All twenty-seven
  are Wikisource contributors' collations against the Winchester manuscript, several set in the
  scribal abbreviations of it (`[…othir þͤ] menoͣ oþͬ [þͤ takynge…]`), and each carries the words
  "Wikisource contributor note". Folded under a book presented as the 1906 Everyman they would be an
  unsigned apparatus that printing does not carry — the Satyricon's judgement about what a note fold
  is for, sharpened by the Divine Comedy's question about unattributed texts, since a reader has no
  way to know whose collation they are being shown. Dropped and counted; the book renders with no
  note fold at all, as Ovid, Lucretius and the Analects do.
  **CAXTON'S RUBRIC IS A SEPARATE ELEMENT FROM HIS CHAPTER NUMBER, AND ONE PAGE IN 503 SETS IT
  DIFFERENTLY.** Each chapter page carries three heading blocks — the book, the chapter number, and
  Caxton's own descriptive heading — and Book XX chapter 16 alone sets that heading as a centred
  block rather than as a `wst-subsubheading`. Beowulf's one-leaf-in-eighty-five finding, and here the
  cost of missing it is not a missing title but a visible one: the block survives as a blockquote and
  the chapter opens on an indented shout. **AND THE RUBRIC SHIPS IN CAPITALS**, which is Aesop's
  outcome reached by measurement twice over — the edition sets it in SMALL capitals, which carry no
  case to recover, and the only title-case copy of them belongs to the other transcription, which is
  not this text.
  **ITS REAL LIMITATION IS THE BOOK RATHER THAN THE IMPORT, and a reader should know it before Book
  X.** Malory's is a compilation, not a novel: for long stretches it is knights riding out, meeting
  other knights and riding on, and Book X alone is eighty-eight chapters of that. The quest of the
  Sangreal in Book XIII changes the register entirely and the last two books are as fast and as bleak
  as anything in English. Said on the book's own first page, because a reader who gives up in Book X
  has given up two books short of the reason the book is read),
  `boethius-consolation` (~253 KB, all five books as **5 chapters**, **78 sections of alternating
  prose and verse**, 39 poems, 19 notes — H. R. James's English of 1897, and **the first book here
  whose ROWS PAIR ON A POSITION BECAUSE THE PRINTED NUMBERS REPEAT.** Every earlier book sorts its
  rows on a figure that is unique within the chapter — a letter, a chapter, a Stephanus page, a
  Bekker page, a laisse, a verse, a line — and here the same numeral occurs TWICE in every book on
  each side. The work is cited by book and section, "III.m9" being the ninth metre of the third
  book, and it numbers its metres and its prose chapters in separate runs: James heads a poem
  "SONG IX." and a prose chapter with the bare numeral "IX.", while the Latin heads both "IX.", so
  neither edition prints the compound anywhere. The markers therefore carry what each edition prints
  and the SORT KEY is the section's position in its book, which is safe because it is arithmetic
  before it is a hope: measured over both files before a word was imported, each book's sections are
  the same in number, in the same order and in the same alternation — 13, 16, 24, 14 and 11 a side —
  and Book I is the one that opens on a poem where the other four open on a prose.
  **SIX THINGS IT SETTLED ARE WORTH CARRYING.**
  **THE ENGLISH PRINTED WITH THE LATIN IS NOT THE ENGLISH THIS BOOK SHIPS, AND THAT WAS A CHOICE
  RATHER THAN A NECESSITY.** The Latin comes from a Loeb of 1918 whose two columns are printed on
  facing pages and linearised by its transcription into one file; taking BOTH from it would have
  paired them by construction, out of a single request, needing no second source and no
  reconciliation at all — the cleanest import on the shelf. It is refused because that English is
  "I.T."'s of 1609 revised by H. F. Stewart, and Jacobean English is what ruled out Golding's Ovid,
  Hobbes's Thucydides and Burnaby's Satyricon. **The cleanest text to import is not always the one
  worth reading**, and the cost of refusing it was measured rather than waved at: all 78 sections
  are present in both Englishes and in the Latin, in the same order, and James tracks the Latin's
  length section by section as closely as the Loeb's own version does, so nothing was given up but
  the convenience.
  **THE TRANSLATOR'S OWN WORD FOR A SECTION IS IN HIS SUMMARIES AND NOWHERE ELSE.** A marker reading
  a bare "IV." says nothing, and composing "prose 4" would be composing an apparatus — the trap the
  Maxims of Ptahhotep records, where a tab printed two different numbers under one word. What James
  writes, at the head of each book and inside his own footnotes, is a summary in citations:
  *Boethius' complaint (Song I.).—CH. I. Philosophy appears to Boethius*, and a note reading *See
  also below, ch. iii., p. 14*. So the English marker carries **"Song I."** and **"Ch. I."**, both
  transcribed from his own prose, and the Latin carries the numeral its own edition prints and
  nothing more. **ASK WHAT ELSE IN AN EDITION NAMES ITS OWN SECTIONS** before concluding a citation
  cannot be transcribed: a summary, an index and a cross-reference are all places an editor writes
  one down.
  **A BOOK SUMMARY IS NUMBERED 0 SO THAT IT GETS A ROW OF ITS OWN, and this is the one place the
  shelf's own fold does the wrong thing.** `bookRows` folds a leading UNNUMBERED block into the
  first numbered row when the facing column has no counterpart — right for Seneca's one-line
  salutation, and wrong for a quarter of a page. Folded, James's summary of Book I sat in the same
  cell as his first poem while the Latin cell held only the poem, so the English's verse began a
  screen below the Latin's and a reader meeting a paragraph of English beside the opening of
  *Carmina qui quondam* would reasonably take one for a translation of the other. Numbered, it draws
  beside an empty Latin cell — the shelf's ordinary way of showing that two editions differ — and
  the poems start level. Zero is a section number here for the Gallic War's reason, and the mark it
  carries is the caption James prints over the block. **Five of the 83 rows are English only and
  that is the right figure rather than a gap.**
  **A HEADING MAY CARRY A FOOTNOTE MARKER, AND THREE OF THE NINETEEN DO** — `dropFittHead`'s rule in
  a fifth edition, biting here on a title that is KEPT rather than dropped. Flattening a section
  heading to text before the anchors are taken out of it leaves the literal string "[I]" inside a
  section title while its note sits in a list nothing points at; the markers are carried onto the
  head line, which is where James prints them. **AND TWO MORE HANG OFF A BOOK SUMMARY**, outside
  every section, so the note lists are harvested from the whole book rather than section by section
  — read the narrow way the file gives up fourteen of nineteen and reports the other five as
  cited-but-not-printed, which is the right complaint about the wrong half of the file.
  **A POEM PRINTED ACROSS A PAGE BREAK OPENS A FRESH BLOCK IN BOTH COLUMNS**, three times in the
  English and six in the Latin, and joining them is not cosmetic: on a page whose whole subject is
  the alternation of prose and verse, a stanza standing apart from its own poem reads as a fortieth
  song. The Gita's rule that a unit is cut as a STREAM rather than block by block, met from the
  other side.
  **ITS REAL LIMITATION IS THE GREEK AND IT IS THE TRANSCRIPTION'S.** Boethius writes a little Greek
  into his Latin — the Π and Θ embroidered on Philosophy's gown, and a dozen quotations from Homer,
  Euripides and Plato — and the Latin's transcription renders every one as `[Greek: ...]`. Four of
  the twenty-two are a letter NAME (`[Greek: PI]`), which is a closed and unambiguous encoding and
  is decoded; the other eighteen are a loose romanisation in which "ae" may be η or αι and "o" may
  be ο or ω, and reversing one would be inventing a Greek word rather than reading it. Those are
  left exactly as printed and counted — the Satyricon's `betaGreek` judgement in a second book. The
  ENGLISH carries the real letters and glosses each with a romanisation of its own, which is
  transcriber's furniture beside a letter already set and is removed. **And the Latin's marginal
  line numbers are dropped**, one every fifth line of every metre: James translates the verse into
  English verse rather than line for line, so a number there would point at a place the facing page
  cannot find — the Canterbury Tales' finding on a second book. Said on the book's own first page),
  `three-kingdoms` (~3.03 MB, all 120 chapters, **562,900 words**, 369 verse blocks, 16 notes — C. H.
  Brewitt-Taylor's English of 1925, and **the book whose chapter titles are on the chapter pages and
  nowhere else worth taking them from.** Both volumes print a full table of contents and both are
  transcribed complete, so `indexPage` is the obvious move; compared against the body chapter by
  chapter it is the worse reading twice over — the contents sets every title in CAPITALS where the
  body sets it in title case, and it drops the diacritics the body keeps (LU PU and CHIA HSU against
  Lü Pu and Chia Hsü) on a text whose romanisation is nothing but diacritics. That is Journey to the
  West's finding arriving from the other side, where the contents was the title-case copy and lost on
  ACCURACY instead; here it loses on both, which is Aesop's rule reached by measurement.
  **FIVE THINGS IT SETTLED ARE WORTH CARRYING.**
  **THE NUMBER AND THE TITLE ARE NOT ALWAYS IN THE SAME BLOCK, and assuming either arrangement loses
  the title on the chapters set the other way.** A hundred and eighteen chapters put "CHAPTER IX." in
  one centred block and the title in a second; chapters 14 and 15 put both paragraphs inside ONE. It
  is the fault `originalChapter` already records for an Italian edition of 1814, and it fails the
  quiet way — nothing throws, nothing shortens, the tab simply falls back to the words "Chapter 14",
  which on a bar of a hundred and twenty tabs nobody would notice.
  **THIS PRINTING NUMBERS ITS NINETIES BACKWARDS FROM A HUNDRED, and the rule was written from an
  inventory of the whole book rather than from the chapter that prompted it.** Read off both contents
  pages the run is XC IXC VIIIC VIIC VIC VC IVC IIIC IIC IC C — 90 to 100, with 91 to 99 set as
  <n>C meaning a hundred LESS n, a generalisation of XC that no modern style uses and that this
  printer applies for exactly nine chapters and nowhere else. `romanValue` returns 0 for every one of
  them, since it insists a numeral round-trip through `romanNumeral`, so the head check parses that
  form too and the nine are COUNTED — which is what would report the run changing shape.
  **A TEMPLATE'S INLINE STYLESHEET IS INSIDE THE VERY ELEMENT BEING READ**, so `stripWikiCSS` has to
  run before the tags do: chapter 3's title came back as "Tung Cho Silences Ting
  `.mw-parser-output .wst-tooltip{cursor:help;…}` Yuan: Li Su Bribes Lü Pu", which is a title of the
  right shape and the right length and is not a title. Third time this file has recorded that order
  mattering.
  **THE PRINTER'S TWO BOUNDARY MARKS ARE ONE KIND OF THING AND GO TOGETHER.** Chapter 60 closes on a
  centred "end of volume i" and chapter 120 on a centred "The End" — the marks a book printed in two
  volumes sets where its parts divide, not lines of the novel, and by the time `cleanBody` has run
  each is a blockquote under the last sentence of a chapter. Keeping either while dropping the other
  would be an inconsistency a reader meets sixty chapters apart and cannot explain. (The colophon at
  the foot of the last page needs no rule at all: it is set on the one leaf the edition never
  numbered, so the Republic's `dropUnnumberedPages` lifts it out for free — measured first, and it is
  the only unnumbered leaf in the book.)
  **ITS REAL LIMITATION IS THAT THE TEXT IS NOT QUITE LUO GUANZHONG'S, and that is a fact about every
  copy a reader will ever meet rather than about this one.** The oldest surviving printing, of 1522,
  divides the story into 240 sections; in 1679 Mao Lun and his son Mao Zonggang cut it into the 120
  chapters used ever since, rewrote much of the prose, replaced most of the poems and sharpened the
  novel's sympathy for Liu Pei's side. Almost everyone who has read this book in any language for
  three centuries has read the Maos, and both columns here are theirs — the plainest evidence being
  that the sentence about division and union opening chapter 1 and the poem above it are both their
  additions and appear in none of the earlier printings. Said on the book's own first page),
  `ptahhotep` (~33 KB, **by a wide margin the smallest thing on the shelf** — all 47 of the
  translation's sections, **22 notes**, no original — Battiscombe G. Gunn's English of 1906, and
  **the first book here taken from Project Gutenberg's HTML rather than its plain text or its TEI**,
  which turns out to be the EASIEST of the three and is worth saying so nobody reaches past it: the
  plain-text readers on this shelf exist because a machine reading of a printed page has to have its
  structure BUILT, where this file has already had its paragraphs marked up, its footnotes anchored
  and its page numbers tagged by a transcriber, and `stripTags` does the rest as it does on every
  wiki book.
  **FOUR THINGS IT SETTLED ARE WORTH CARRYING.**
  **THE SECTION IS THE CHAPTER, THE ROW AND THE CITATION**, which is the shape a book of maxims
  naturally has: this translation prints forty-seven marked sections and NOTHING above them — no
  parts, no books, no headings between the title and the first line — and the division is the poem's
  own, the Egyptian scribe having written the first sentence of each in red ink. So the tab is the
  citation, no `bk-n` marker is written, and with neither column carrying one `bookRows` has nothing
  to pair on at all, which costs nothing because there is no second column.
  **THE MARKS ARE LETTERS AND NUMBERS IN ONE INTERLEAVED RUN, and a reader written for either alone
  loses one end of the poem while every count still reads healthy.** They go A, B, 1..37, C, 38..43,
  D — the petition to the king and the title of the maxims proper, then the thirty-seven maxims,
  which is the traditional count, then the epilogue, numbered straight on from 38 with a lettered
  block at each end. A number-only rule silently drops the opening and the closing of the whole work.
  Hence `PTAH_KEYS`, which states the run and is checked against the file in both directions — and
  which has to stand in for a short-chapter guard, because **section 32 is twenty-eight characters**
  and that is the content rather than a truncation (see below), so `minChars` is 20 and could not
  catch an extraction that returned the page furniture instead of the text.
  **A TAB READING "SECTION 32" RENDERS AS "SECTION 34 / Section 32", WHICH IS THE RAMAYANA'S FINDING
  ARRIVING FROM THE OTHER SIDE.** There the canto head was dropped and its NAME went with it; here
  the title repeated the word `chapterWord` already prints, and because the printed mark is not the
  running index (A and B come first, so section 32 is the thirty-fourth chapter) the head showed two
  different numbers under one word, each contradicting the other. The tab carries the translator's
  own citation form instead — **"§ 32"**, the form he uses for these marks in his own introduction —
  so it is transcribed rather than composed and reads as a citation rather than as a second count.
  Found by LOOKING at the page, which is the golden rule earning its keep for the fifth time.
  **ITS REAL LIMITATION IS ONE SECTION AND IT IS THE TRANSLATOR'S**: section 32 is four words in
  square brackets, *[Concerning continence]*, where the other forty-six carry the poem — the maxim it
  stands for not being something a London series of 1906 would print in English. It is the only one
  in the book, it ships exactly as he printed it rather than being quietly closed up, and the front
  matter says so. **And there is no Egyptian column**, for a reason that is about this translation
  rather than about the Egyptian; see the `books/<id>.<lang>.js` bullet below, which is where the
  measurement is recorded),
  `ramayana` (~2.2 MB, 493 of the poem's 645 cantos, **52,560 lines of verse in 1,825 stanzas**,
  1,023 notes — Ralph T. H. Griffith's rhymed verse of 1870–1874, and **the first book here whose
  TRANSLATION NUMBERS AROUND ITS OWN GAPS, which is the only reason it can be paired at all.**
  Griffith left out the whole seventh book and forty-one cantos inside the six he did translate, so
  he ships 493 against the Sanskrit's 645 — and a translator who renumbers what he keeps produces an
  unbroken 1..N, where Griffith's Book VI runs 1..130 with twenty-nine numbers simply missing and his
  Book I skips 37 and 38 and carries on at 39. **A man who numbers around what he has left out is
  numbering to something outside himself**, and the only thing outside himself is the sarga numbering
  of the text in front of him. That inference is what the whole pairing rests on, and it was measured
  before it was believed.
  **SEVEN THINGS IT SETTLED ARE WORTH CARRYING.**
  **A DIFFERENCE IN THE TOTALS IS NOT EVIDENCE OF A DIFFERENCE IN THE DIVISION, and acting as though
  it were would have mispaired a whole book.** Three of the six books disagree with the Sanskrit on
  their totals — 76 cantos against 75, 66 against 68, 130 against 128 — and the obvious move is to fit
  a shift to each difference. It is right twice and WRONG once. Books III and VI genuinely divide the
  same words differently and the shift is real; Book V's 66-against-68 is Griffith **stopping two
  sargas early**, exactly as he stops in the middle elsewhere, and a shift fitted there displaces the
  entire tail of the book. What showed it was reading the passages: his 57 is the leap home and so is
  sarga 57 (आप्लुत्य च महावेगः पक्षवानिव पर्वतः against "Still, like a winged mountain, he Sprang
  forward"), his 65 opens on Mount Prasravana and so does sarga 65.
  **THE INSTRUMENT THAT WORKS IS LENGTH AND THE ONE THAT LOOKS RIGHT IS NAMES.** A proper-name
  profile is the obvious way to align two columns and it is nearly useless on this poem — Ráma, Sítá
  and Rávaṇ are in almost every canto, so cosine over name counts scored offset 0 best in only 10 of
  23 sampled cantos of Book III and 15 of 35 of Book VI, which reads as drift and is noise. Correlating
  the Sanskrit's **verse count** against Griffith's **line count** settles it in one pass: offset 0
  wins in every book at r = 0.63–0.71 against 0.40 at best for any other offset, and by thirds of a
  book the right offset scores 0.83–0.996. **Correlate a quantity both editions state about the same
  unit, not the vocabulary they share.**
  **AND THE CHANGEPOINT IS FOUND BY LENGTH AND CONFIRMED BY EPISODE, because neither alone is
  enough.** The length fit is decisive in Book III (the standard deviation of the log ratio falls from
  0.279 to 0.062 with a +1 shift after canto 56) and useless in Book VI, where Griffith's twenty-nine
  omissions leave the tail too sparse — there the fit put the changepoint at 100 and the passages put
  it at 111. Four unmistakable episodes land exactly at offset 0 (Kumbhakarṇa dies in canto 67 and
  sarga 67, Narántaka in 69 and 69, Atikáya in 71 and 71, Rávaṇ in 110 and 110) and four more land at
  +2 (Sítá restored from the fire in canto 120 and sarga 118, Indra's boon in 122 and 120, the meeting
  with Bharat in 129 and 127, the consecration in 130 and 128), which puts the boundary between 111
  and 114 — and Griffith's CXIV opens "In cars whose sheen surpassed the sun's Triumphant rode the
  radiant ones" where sarga 112 opens ते रावणवधं दृष्ट्वा देवगन्धर्वदानवाः। जग्मुः स्वैः स्वैर्विमानैः,
  the gods departing in their own cars. So the two extra cantos are CXII and CXIII, the rákshas dames'
  lament and Mandodarí's, and **490 of the 493 cantos pair**.
  **A TRANSLATOR WHO SAYS WHAT HE LEFT OUT IS WORTH MORE THAN ONE WHO IS COMPLETE AND SILENT.**
  Griffith prints a bracketed paragraph at the foot of the canto before every gap, naming what is
  missing and usually why — *Three Cantos consisting of little but repetitions are omitted*; *I omit
  the 28th and 29th Cantos as an unmistakeable interpolation*; and for Book I's 37 and 38, *both in
  subject and language offensive to modern taste*, with the reader sent to Schlegel's Latin. All five
  are `<p>` blocks inside the preceding canto and ship exactly where he printed them, so the shape of
  what is absent is visible from inside the poem rather than only in the front matter.
  **A TAB READS "1.1 · Nárad", AND THE NAME WAS THROWN AWAY FOR A WHOLE RUN BEFORE ANYONE LOOKED.**
  The canto head duplicates the tab and is dropped, which is right about the NUMBER and wrong about the
  rest of it: Griffith names every one of his 493 cantos, median fifteen characters and longest
  twenty-seven, and a book with 493 tabs whose titles are bare citations cannot be navigated by eye at
  all. Nothing could report it — every canto was complete, every count healthy, the pairing exact — and
  it was found by looking at the chapter bar, which is the golden rule earning its keep for the fourth
  time after the Gita, the Iliad and Don Quixote. **Ask what ELSE is on a heading before dropping it**;
  the case is the edition's own ("The Meeting With The Queens") and is kept, which is Aesop's rule.
  **A BOOK'S HALF-TITLE SITS INSIDE THE LAST CANTO OF THE BOOK BEFORE IT, AND CARRIES A NOTE** —
  Beowulf's `dropFittHead` rule biting a second time in one book, in a place nothing was watching.
  Nine of Griffith's canto titles carry a footnote and the canto head is dropped, so those markers are
  carried down; what was missed is that the edition also sets "BOOK V." and "BOOK VI." **within the
  preceding canto's own run of text**, each with Griffith's headnote on it, and no block sweep gathers
  a `<head>` at all. Two of the 1,023 notes therefore reached the fold with no sentence opening them,
  and **nothing but an every-note-is-referenced assertion can see it**: the cantos are complete, both
  notes are correct, and they simply sit in a list nothing points at. A carried marker now goes to the
  block nearest it in reading order rather than all of them to the top — a canto head precedes the
  verse and opens it, a book half-title follows the verse and closes it — since prepending would print
  a note about Book V above the first line of canto IV.67.
  **ITS REAL LIMITATION IS THE SEVENTH BOOK AND IT IS THE TRANSLATOR'S CHOICE RATHER THAN A GAP IN
  THE RECORD**: the Uttara Káṇḍa is 111 sargas, it is the poem's most disputed section, and Griffith
  simply stops where the war ends. The Sanskrit for all 111 is transcribed and complete, and it is
  deliberately NOT shelved as 111 tabs of untranslated Devanagari — Beowulf's rule, that a chapter tab
  with an original and no translation is worse than not having it. Said on the book's own first page,
  at length, because a reader who knows the poem will go looking for it),
  `satyricon` (~288 KB, all 141 sections, **55 display quotations**, **131 notes** — Michael
  Heseltine's Loeb of 1913, and **the first book here whose CHAPTER, SECTION AND CITATION ARE ALL
  ONE THING.** The Rigveda's chapter is the smallest unit of the work and its verses still divide it;
  here there is nothing below the section and nothing above it either. Both files state 141
  `<milestone unit="section"/>`, **zero `<div>` and zero `<head>`**, and each declares the scheme in
  its own header — `<refState unit="section"/>`, one level — so a passage is "Satyricon 48" and the
  tab is the citation. **NO `bk-n` MARKER IS WRITTEN**, which is a decision: with the chapter and the
  section the same thing there is nothing left to pair on, so each column comes back as a single
  unnumbered block and `bookRows` pairs them on `key -1 === -1` — deterministically, since NEITHER
  side carries a marker anywhere, which is what separates this from the Gallic War's chapter 0
  pairing "by luck". Writing one would print the section number at the head of a chapter whose tab
  already says it, which is Beowulf's `dropFittHead` rule.
  **FIVE THINGS IT SETTLED ARE WORTH CARRYING.**
  **THE TRANSLATION IS PARTLY UNTRANSLATED, and no ratio test can see it.** The Loeb of 1913 would
  not print Petronius's frankly sexual passages in English, so it printed the LATIN: ten sections
  entire or nearly so — 23–26, 85–87, 132, 138, 140 — **2,389 words, 4.9% of the English column**.
  The obvious measure is a per-section length ratio, and it reported §138 healthy at 1.36 while its
  "English" opens *Profert Oenothea scorteum fascinum* — **untranslated text is still text**. What
  DOES see it is word overlap between the two columns of the same section: a real translation shares
  only proper names, a few per cent, where these share nearly everything. It is the Rigveda's
  Griffith problem (thirteen verses turned into Latin rather than English) met on a Latin original,
  and the book's own front matter names the ten sections and the figure.
  **A NON-GREEDY TAG PAIR IS WRONG THREE TIMES IN ONE FILE**, which is the Prose Edda's nested-`<dl>`
  lesson at scale. `<quote>` nests inside `<l>` (`<l><quote>Quis furor</quote> exclamat…`), the
  Latin's `<note>` nests once and its `<p>` sixteen times, so everything is matched BALANCED — and
  the fault was quiet in the usual way: a non-greedy pair reported ten of the Latin's 607 lines as
  standing outside any display quotation when in fact none does.
  **A BLOCK MUST BE CLOSED AND REOPENED AT EVERY BOUNDARY THE TEXT IS CUT AT** — the Aeneid's
  mid-line card lift in a new shape, and the cut this book most needed. The Bellum Civile at
  sections 119–124 is **ONE `<quote rend="blockquote">` with five section milestones inside it**, so
  the poem is a display quotation the edition's own numbering divides; cut at the milestones without
  closing it, five blocks come back unclosed and 101 of the 607 lines render as run-on paragraphs
  with every word present. The same rule is needed at a PARAGRAPH and at a display quotation lifted
  out of the flow, since an inline quotation may wrap one (§83 is a speech quoting a poem) — and
  **the edition marks a quotation TWO ways**, 585 `<quote>` and three bare `<q>` in the Latin, one
  of the three being exactly the one that wraps a block. 58 cuts on the Latin side, 7 on the English.
  **ONLY COUNTING A TAG AGAINST ITS CLOSER OVER THE SHIPPED FILE SHOWS ANY OF IT.**
  **HESELTINE SETS PETRONIUS'S VERSE AS PROSE**, which is a fact about the translator rather than a
  pairing fault and shows on every page it happens: the Latin marks **607 lines in 54 blocks** and
  the English **23 in 8**, and in each of the eight longest poems the English's own `<l>` count is
  ZERO — §89's 65 lines of the Troiae Halosis face a single English paragraph. So a display
  quotation is a DISPLAY QUOTATION and not a verse block; what is inside decides whether the lines
  break, and one of the Latin's 55 holds no line at all, being Trimalchio's riddle set as a
  quotation in prose.
  **AND THE GREEK IS BETA CODE IN ALL THREE CANDIDATE FILES** — zero Unicode Greek anywhere — so
  there was no sibling to take it from; see `betaGreek`. **ITS REAL LIMITATION IS THE APPARATUS AND
  IT IS DELIBERATE**: the Latin's 385 notes are a critical apparatus (median 25 characters against
  the English's 82; 113 `place="marg"` sigla reading "L" or "LO", and 162 of the rest naming an
  editor or a manuscript), dropped and counted, because folded under the chapter they would put a
  list of variant readings in Latin abbreviations under every one of 141 tabs — the Art of War's
  rule about what a note fold is for. The cost is about five explanatory glosses on Trimalchio's
  Latin, and a rule that told those from the apparatus would have to know every editor's name, a
  list already watched come up short. Six apparatus notes DO ship, in the English fold, and are
  right there: they sit in the ten untranslated sections, where the English column is Latin and a
  textual note is a note about the text that column carries),
  `don-quixote` (~2.22 MB, both parts entire as **126 chapters**, **143 verse blocks**, **0 notes** —
  Ormsby's translation of 1885, and **the first book here that was BUILT ON ONE SOURCE, CHECKED, AND
  THEN THROWN AWAY FOR ANOTHER.** Everything said use Wikisource: it carries this translation
  complete, one page per chapter, typed clean, and needed nothing but `body: "plain"` and
  `dropHeadings` — the sixteenth book to arrive and the first in a while to need no new reader. That
  version was written, fetched, swept and browser-checked, and **it was discarded over two words**.
  **THE BROWSER CHECK ASSERTED THAT THE GIANTS ARE ON THE PAGE AT I.8 AND FAILED, AND THE FAULT WAS
  NOT THE EXTRACTOR'S**: that transcription reads "thirty forty windmills that there are on plain"
  where Ormsby wrote "thirty **or** forty windmills that there are on **that** plain" — the most
  famous sentence in European fiction, ungrammatical, in a text that had passed every structural
  check there is (126 chapters, tag balance clean, no chapter short, 126 unique titles). It is the
  golden rule's "it isn't finished until it's been looked at" earning its keep for the third time
  after the Gita and the Iliad, and the first time it has been earned by a TEST rather than by eye.
  **FOUR THINGS IT SETTLED ARE WORTH CARRYING.** **HOW FAR A TRANSCRIPTION'S ROT GOES NEEDS AN
  INDEPENDENT COPY OF THE SAME TRANSLATION, WALKED WORD BY WORD** — Project Gutenberg's ebook 996,
  which is Ormsby unrevised (its own editor's note says only the Doré PLATES came from a
  Jarvis/Motteaux edition). Over all 400,809 words the wiki copy drops **sixty** — "no occasion [to]
  ask", "the barber [whose] basin", "sancho could not [understand]" — and doubles six of its own
  ("out of all as as", "a portion portion of the kingdom"). One defect per six thousand words, and
  **not one of them visible to any count**: both copies are 126 chapters split 52/74 and agree
  chapter by chapter to within fifteen words. **AND THE ALIGNMENT ITSELF LIED FOUR TIMES BEFORE IT
  TOLD THE TRUTH**, which is the methodological half: keying a chapter on its opening words landed
  in Gutenberg's CONTENTS LIST rather than its body; normalising with `[^a-z0-9' ]` split every
  possessive on one side and not the other, Gutenberg setting a curly apostrophe; and the resync was
  written `W.indexOf(C.slice(a, a + 5).join(" "), p)`, which is `Array.prototype.indexOf` looking for
  a whole phrase as one ELEMENT and therefore matching nothing, ever. Each of the three reported a
  confident **52%** coverage and a short clean list. **A diff that stops early reports the text as
  sound; check what fraction it actually walked before believing what it found.**
  **THE VERSE MEASUREMENT THEN REVERSED THE LAST ARGUMENT FOR THE WIKI**, and it is the Canterbury
  Tales' rejected heuristic re-measured rather than inherited. That book tried detecting verse in a
  plain text and refused, because its OCR fragmented PROSE at the page edges; this transcription is
  modern and clean and has no page edges, so the rule was scored against the wiki's own 55
  marked-up blocks as ground truth — it finds 49 of them **and takes 99 blocks more**, which on
  reading are almost all real verse the wiki sets as prose, Cardenio's sonnets and the epitaphs of
  the Academicians among them. **The fuller text carried the better verse as well**, which is not
  what the markup suggested. The few that are NOT verse are what the all-caps guard is for — a
  heading is short-lined too, and so is a letter's signature — and 143 blocks ship as verse with 26
  short all-capital ones counted and kept as headings.
  **AND WHAT WAS NOT DONE IS THE POINT**: the wiki's words were NOT repaired from Gutenberg's. Both
  are transcriptions of a printed page neither party has, and Gutenberg has slips of its own —
  eleven places where one reads "he" and the other "be", in both directions. Correcting one fallible
  copy against another and shipping the result composes a text that has never existed. One copy is
  chosen, on measurement, and the book's front matter names the words the other drops so a reader who
  has met that copy elsewhere knows what they are looking at.
  **ITS REAL LIMITATION IS THE APPARATUS AND IT IS NEITHER COPY'S FAULT**: Ormsby's volumes are famous
  for their several hundred footnotes and **not one free transcription carries a single one** —
  measured on both, zero reference marks — so the book renders with no note fold at all, like Ovid,
  Lucretius and the Analects. His preface and his life of Cervantes are left behind as the Republic's
  introduction and plates were. The tabs run 1..126 straight through while the novel is cited by part
  and chapter, so each title opens on its citation, I.1 … II.74 — the Summa's arrangement),
  `rigveda` (~2.05 MB, all 1,028 hymns as **1,028 chapters**, **10,503 verse numbers**, 27 notes —
  Griffith's second edition of 1896, and **the first book here whose CHAPTER IS THE SMALLEST UNIT
  OF THE WORK and there are a thousand of them.** The tab is the citation itself: a passage of the
  Rigveda is "RV 10.129.1" — mandala, hymn, verse — so the hymn is what a reader looks up and the
  verse is the finest thing both editions state about the same place. The mandala is the PART, not
  the chapter, and that was measured rather than assumed: cutting there gives ten tabs and puts 191
  hymns in one of them, ~290,000 characters, larger than anything on the shelf, and throws away the
  verse numbers as pairing keys — which is what Beowulf's rule forbids.
  **FOUR THINGS IT SETTLED ARE WORTH CARRYING.**
  **MANDALA 8 CARRIES THE VALAKHILYA AND THE TWO EDITIONS NUMBER THEM DIFFERENTLY**, which is
  Journey to the West's recension check earning its keep and the one fault here no count could ever
  have shown. Griffith prints the eleven Valakhilya hymns as an APPENDIX to his eighth book, so his
  8.49 is the standard 8.60 and his 8.93–8.103 are the standard 8.49–8.59. Measured over 8.40–8.103
  on both sides before a word was imported: the verse counts agree exactly through 8.48 and then run
  eleven apart — **31 of 39 agreeing at an offset of eleven against 10 of 39 at none**, and all
  eleven appendix hymns matching their Sanskrit verse for verse. Paired on the page number, 55 hymns
  would have sat beside hymns that are not their counterparts with both columns complete, every
  mandala the right length and nothing thrown. The book is numbered the STANDARD way — the way the
  Sanskrit is numbered and every reference work cites — and Griffith's own page for each is looked
  up; his arrangement is stated in the front matter, since a reader holding a print copy will find
  the appendix numbered differently.
  **THE TRANSCRIPTION USES FOUR SHAPES AND 1,023 OF THE 1,028 ARE PLAIN TEXT** — measured with the
  wiki's own search over the whole book: 1,022 hymns are a `<div class="verse"><pre>`, one more is a
  bare `<pre>` (5.65), four are proofread transclusions rendering as `ws-poem` (1.1, 1.32, 4.27,
  5.1) and one is typed into the page with `<br>` (10.90, the Purusha Sukta). The Divine Comedy's
  finding at a different ratio, with the majority shape the Canterbury Tales' and Journey to the
  West's — a machine reading with no marks at all, so the structure is BUILT and the content ESCAPED.
  **ALL FOUR ARE READ BY FLATTENING TO LINES FIRST**, which is what keeps one verse rule rather than
  four that drift.
  **THE STOP AFTER A VERSE NUMBER WEARS FOUR COSTUMES AND THE RULE WAS WRITTEN FROM AN INVENTORY OF
  THE WHOLE BOOK** rather than from the example that prompted it — 4,543 read `1. `, 52 read `1 `
  with no stop at all, 2 read `1.` with the word run against it, and 2 read `1, ` where the scan
  took the stop for a comma. **The bare form is the dangerous one** and is admitted only where it is
  the very next verse, since a figure opening a line with nothing after it is also what a line of
  verse mentioning a number looks like.
  **AND ITS REAL LIMITATION IS WHAT THE TRANSLATION LEAVES OUT, in two different ways.** Griffith's
  own notes survive on THREE hymns of the 1,028 — only four pages were proofread against the scan
  and the rest were typed in without the apparatus, measured as zero `<ref>` in the whole book's
  wikitext — and **thirteen verses are simply absent**, being the frankly sexual passages he turned
  into Latin rather than English (1.179 entire, 10.61.5–9, 10.86.16–17); the Sanskrit beside them is
  complete, so those rows show the original with nothing facing it. **1,002 of the 1,028 hymns pair
  on every verse number**; of the twenty-six that do not, six are 1.65–1.70, whose metre the two
  traditions divide differently (five verses against ten, the same words twice divided), three are
  those passages, and seventeen are a single lost numeral apiece, ten on the English side and seven
  on the Sanskrit),
  `divine-comedy` (~811 KB, all 100 cantos, **4,811 tercet numbers**, **1 note** — Longfellow's
  blank verse of 1867, and **the first book here whose SECTION NUMBERS ARE COUNTED RATHER THAN
  READ.** Every earlier book takes its numbers off the page, because every earlier edition prints
  enough of them to pair on; this one does not, and the reason is the finding to carry.
  **ONE WORK IN ONE EDITION IS TRANSCRIBED TWO DIFFERENT WAYS ON THE SAME WIKI.** The Inferno and
  the first three cantos of the Purgatorio are a proofread transclusion of the scan, wrapped in
  `prp-pages-output` and carrying the printed marginal numeral every fifth line; the other
  sixty-three cantos are typed straight onto the wiki as a bare `<div class="poem">` with **no line
  numbers at all**. Measured: 37 pages of the first kind carrying 1,014 numerals between them, 63 of
  the second carrying none. So a reader written for either half finds nothing on the other, and a
  pairing built on the printed numerals would cover a third of the poem. **Ask how much of an
  edition's apparatus is actually PRINTED before deciding to pair on it** — not whether the shape
  exists, but on how many pages.
  **THREE THINGS MAKE COUNTING SAFE RATHER THAN HOPEFUL, and all three are arithmetic.** The two
  columns are the same length canto by canto — Dante is 14,233 lines and this Italian carries
  exactly that, per canticle as well as in total (4,720 / 4,755 / 4,758), and Longfellow translates
  line for line and comes to the same 14,233 — so line n of the English is line n of the Italian in
  all one hundred cantos. **Every canto is 3n+1 lines**, terza rima running in tercets and each
  canto closing on a single line: 4,711 tercets and 100 closing lines, which is why the TERCET is
  the pairing unit and not the line (the alternative is 14,233 rows of one line each). And **the
  Italian prints one numeral per tercet exactly** — 4,711 of them, one at the end of every tercet in
  the poem, none anywhere else, and not one disagreeing with the count — so the number written on a
  row is the number that edition prints at that row's own last line for 4,711 of the 4,811 rows. The
  remaining hundred are the canto-closing lines, which fall where neither edition prints anything.
  **TWO PRINTED NUMERALS ARE SLIPS and the RE-SYNC tells a slip from a bad cut**, the Gita's rule on
  a third book: Inferno IX prints 85 twice — the run goes 85, 90, 85, 100, 105 — and Inferno XXXII
  prints 135 against a count of 134 with that canto's two columns agreeing at 139 lines, so nothing
  is missing and the numeral sits a line early. Had the cut been wrong, every marker after the first
  would have disagreed instead of one.
  **ITS ONE FOOTNOTE IS THE ONLY REASON IT NEEDS NOTES, and it was the only canto whose columns
  disagreed.** Arnaut Daniel answers Dante in Provençal at Purgatorio XXVI.140–147; Longfellow
  leaves those eight lines in Provençal in the verse and Englishes them under the canto, cueing both
  ends with an asterisk. Counted as verse they make that canto 156 lines against 148 and put a
  translator's gloss in eight rows beside nothing. The rule is written from an inventory of the
  whole poem rather than from the example that prompted it: **two asterisks in 14,241 lines**, one
  closing line 147 and one opening the note, and nothing else anywhere.
  **AND THE HEADING TEST HAD TO RUN ON THE TEXT WITH ITS INLINE TAGS OFF** — Longfellow's canto
  heading is italicised, so a test against the raw line reads `<i>CANTO I.</i>` and matches nothing.
  That left one extra line at the top of each of the 37 transcluded cantos, which shifted every
  label in them by one and made all 37 disagree with their Italian **while every count still read
  healthy**: the poem was complete, the totals were right, and only comparing the two columns'
  section lists showed it),
  `canterbury-tales` (~700 KB, the Prologue and all 24 tales as **25 chapters**, **25 whole-tale
  sections**, **0 notes** — Tatlock and MacKaye's modern English of 1912, and **the first book here
  whose BOTH COLUMNS ARE PLAIN TEXT with no markup at all.** Journey to the West established that a
  book may arrive as an OCR and that the reader must then BUILD a structure rather than strip tags
  out of one; this does it twice from two different kinds of plain text, and the pair is worth
  reading together because **the two halves fail in opposite directions**. The translation is a
  machine reading of a printed page, where a running head, a page number, a rubric and a paragraph
  are all merely lines and the furniture has to be recognised on its SHAPE — after which the holes
  it leaves must be closed, a blank line being what separates two paragraphs. The original is a
  proofread transcription of a CRITICAL EDITION, which is the reverse: accurate to the letter, and
  most of what it accurately carries is apparatus.
  **FIVE THINGS IT SETTLED ARE WORTH CARRYING.** **THE OBVIOUS SOURCE IS UNFINISHED TWICE OVER AND
  THE THIRD CANDIDATE IS A LICENCE QUESTION**, which is the Plato-Jowett rule met three times on one
  book: Wikisource's Skeat Volume IV is a title page, a contents list and **twenty-eight red links**,
  not one tale transcribed; its MacKaye 1914 selection is FRONT MATTER ONLY, the tale subpages having
  never been made; and its one complete Middle English text is tagged `{{no source}}` — no edition,
  no editor, no scan — which for a medieval poem is not pedantry but the whole question, since a text
  has to be constituted from the manuscripts before anyone can read it and an editor's constituted
  text is a modern work. All three were measured before a word was imported. **AN APPARATUS BLOCK AND
  A PARAGRAPH OF VERSE OPEN AT THE SAME INDENTATION**, so the rule cannot be about indentation: Skeat
  sets his variant readings four spaces in where the verse is two, and a verse paragraph also opens
  at four. A block is apparatus only when its FIRST line carries an opener as well, and every
  four-indent block NOT taken is counted and reported — which is how `QUOTATION;`, `TITLE.` and
  `HEADING (` were found, each having leaked a paragraph of sigla into the poem. **A PAGE MARKER MAY
  SHARE A LINE WITH A RUBRIC**, so it is BLANKED rather than dropped with its line: the last one in
  the volume sits in front of the rubric opening Chaucer's retraction, and dropping the line takes the
  retraction's title with it. **AND A MARGINAL-SUMMARY STRIP MUST BE ANCHORED TO A NON-SPACE.** Skeat
  prints a gloss in the margin (`=Knight.=`) and the transcription also sets a RUBRIC between the same
  marks on a line of its own, so a pattern of "two spaces then =…= at end of line" reads the rubric's
  own indent as a margin and deletes it whole — 68 rubrics gone across 21 chapters, and the only
  symptom is an empty paragraph where a heading was. **VERSE DETECTION WAS TRIED AND REJECTED IN THE
  TRANSLATION**, which is the fifth: the editors versify a few short lyrics and the scan sets each
  line as its own block, so a run of short blocks looks like a stanza — but the same scan fragments
  PROSE at the page edges, and the rule marked 5 prose passages as verse against 7 real ones.
  Under-marking beats mis-marking, so every block is a paragraph and the lyrics read as short ones.
  **ITS REAL LIMITATION IS WHAT THE TRANSLATORS CUT, and it is uneven**: the two tales that are prose
  in the original — Melibeus and the Parson's Tale — are given as what their preface calls specimens,
  measured at 2,100 words against 18,200 and 4,100 against 32,200, and five further passages are
  dropped as too coarse for 1912 and marked with a row of asterisks that ships where they printed it
  (the mark is read five different ways by the scan and is normalised, the Journey rule). Take those
  two tales out and the columns run 130,000 words against 135,000, which is prose against verse rather
  than anything missing. The front matter says all of it, and the Middle English beside it is complete.
  **AND IT IS THE WORST-DAMAGED TEXT ON THE SHELF, repaired in 151 places in Sep 2026 (batch E5)**: it
  is not the odd wrong letter but **eight pages printed straight and scanned askew**, where the reader
  dropped and transposed whole lines and 40 words went missing, plus the opening quotation mark read as
  a pound sign on 59 lines and the AE ligature read two wrong ways, which made King Aella unreadable
  thirteen times. The sweep that found it is worth stealing for any OCR'd book: **count the characters
  the transcription uses that are neither ASCII nor its own curly quotes and dashes** — here `£ ™ ° § «
  » ■ „`, of which only the Parson's Tale's section marks were meant. **Batch E6 then put back 355
  QUOTATION MARKS**, the opening single quote having been misread six different ways — as `c` 227
  times, and as `*`, `4`, `f`, `{` and `<` — which a census of every one-character token found and
  which took a boundary-aware `reFixes` table to express, an asterisk being also the mark the
  translators use for a passage they cut. **Batch E7 then cleared the two remaining classes that
  have a shape** — a possessive apostrophe dropped or mangled on 73 lines in three shapes, and the
  closing quote on 43, where the finding is that **the slash stands for TWO characters and not one**,
  the comma or full stop AND the quote beside it, so which of the two it is is a judgement about the
  sentence: the sweep claims only the 37 a speech tag follows and the other six were read on the leaf.
  It also established that **the SECOND Internet Archive scan of an edition is a witness for a single
  damaged word** — cheap, being a `grep` rather than a page image — and that where both copies fail
  differently at one point the fault is the type rather than the scan. **Batch E8 then queried that
  second scan in BULK** — anchoring on the words around each suspicious token and printing what the
  other copy has between the same two — which located 191 of 221 candidates at once, and established
  that **this edition SPACES its `;` `!` `?` `:` as a house style and does not space its comma**
  (10,944 attached against 40), so 59 commas were put back on their own words and the spaced
  semicolons were left alone. 689 repairs in all; what waits is a word's first letter broken off it
  and about 150 single characters standing in the run of the prose, none of which has a shape to
  sweep — see `docs/book-text-plan.md`),
  `journey-to-the-west` (~524 KB, all 100 chapters, **100 chapter sections**, **0 notes** — Timothy
  Richard's *A Mission to Heaven* of 1913, the first English translation there ever was, and **the
  first book here whose SOURCE IS PLAIN OCR TEXT rather than markup.** Every other reader on the
  shelf is handed decisions somebody has already made — a wiki page whose paragraphs are `<p>`, a TEI
  file whose lines are `<l>` — and this transcription is a text file with hard line wraps, running
  heads, hyphenation across the wrap and page numbers mid-sentence, so `extractJourney` has to BUILD
  the structure and then ESCAPE what it finds rather than strip tags out of it (the reverse of every
  other extractor here, and the reason an ampersand in the scan is content).
  **FOUR THINGS IT SETTLED ARE WORTH CARRYING.** **A RUNNING HEAD IS MATCHED ON SHAPE, NEVER ON
  WORDING** — the OCR spells this book's own title differently on almost every page ("iaSSION TO
  HEAVEN", "SEAECH FOR BOIORTAIJTY 13", "VISITS DKAGONS AND 'JUDGES OF HELL 37"), so a rule that knew
  the words would drop some and leave the rest standing mid-sentence; 250 go on the shape (a short
  mostly-capital line with a page number at one end) and every one was read to confirm it.
  **AND LIFTING ONE OUT LEAVES A HOLE WHERE IT STOOD**, which is the quiet half: a blank line is what
  separates paragraphs, so a sentence running across a page arrives as two of them broken at the word
  the page turned on — 359 of those, rejoined on the Analects' test and only on it. **A COUNT THAT
  MOVES IS HOW EVERY OCR SHAPE WAS FOUND**: Richard marks the chapters he condensed with the word
  `[outline.]` and the scan mangles it twenty-two ways, brackets included at BOTH ends
  (`[ouTLrsrE.J`, `f OUTLINE.]`, `[ODTLLNE.J`), so the mark's own count is printed on every run and
  each widening of the matcher was prompted by that number being wrong — 85, then 87, then 88, then
  89. **AND THE CONTENTS PAGE IS NOT ALWAYS THE BETTER READING**: this edition prints its titles in
  capitals in the body and in title case on the contents page, so the case looked recoverable — and
  measured chapter by chapter the contents agrees with the body on only 53 of the 100, the
  disagreements being its own OCR ("Eeeonciliation", "Tt-rragli Dead, shall live"). The body headings
  ship, capitals and all, which is Aesop's outcome reached by measurement rather than by assumption.
  **ITS REAL LIMITATION IS THE TEXT AND NOT THE IMPORT, and it is the shelf's first of this kind**:
  every earlier short book is short by CHAPTERS — 102 of 305 poems, 10 of 46 treatises, 3 parts of 4
  — where this one has all hundred and is short WITHIN them. Richard renders about ten at length and
  condenses the rest, marking eighty-nine of the hundred himself; the unmarked eleven average ~3,700
  words and the marked eighty-nine ~570. The mark is a reliable guide and not a strict one — chapter
  100 carries it and is the longest in the book, and chapter 88 carries none and is plainly a summary
  all the same. **The book's own front matter says all of this on its first page**, because it is the
  first thing a reader needs to know. See the `journey-to-the-west.zh.js` entry for why it is worth
  shelving anyway),
  `virgil-aeneid` (~621 KB, all 12 books, **396 card sections**, **0 notes** — Theodore C. Williams's
  blank verse of 1910, and **the first book here whose TRANSLATION MARKS ITS CARDS TWO WAYS AT ONCE.**
  Every earlier file on the TEI card path picks one mechanism and keeps to it — Ovid's English divides
  into `<div subtype="card">` and its Latin marks `<milestone unit="card"/>` — and Williams uses BOTH,
  327 divisions and 69 milestones, because the choice follows where the boundary falls: a card opening
  where an English line opens gets a division, and one opening PART WAY THROUGH a line cannot, so it is
  set as a milestone inside the line at the word the new card begins on. Hence `cards: "both"`, which
  matches either in ONE sweep in reading order — the Meditations' rule, since two passes leave the
  counter at the end of the book and the forward-only guard then declines everything the second finds.
  **THREE THINGS IT SETTLED ARE WORTH CARRYING.** **A MID-LINE CARD MARK MUST BE LIFTED TO THE LINE'S
  EDGE BEFORE THE BOOK IS SLICED AT IT**, and this is the quiet fault of the batch: cards are cut by
  slicing, so a mark inside a line cuts the `<l>` in half, and `teiVerse` matches a complete `<l>…</l>`
  pair and nothing else — so it matches NEITHER half and **one line of verse disappears at every one of
  the 69**, with all twelve books still pairing, nothing thrown and the poem 99.5% present. The lift
  moves the mark past the line's own `</l>`, keeping the line whole and giving it to the card it begins
  in; the cost is a boundary drawn at the nearest line break, which is the Antigone's and Beowulf's case
  (two editions dividing a line apart, recorded rather than repaired). **AND IT MUST LEAVE A SPACE
  BEHIND IT** — the Iliad's rule in a fourth edition, measured: 13 of the 69 sit hard against the words
  on both sides ("he voiced this word:“What pride of birth"), so removing rather than replacing shipped
  "word:“What" and "acclaim.Ourselves" for one run. **AND `<del>` COSTS A WHOLE CARD HERE, WHICH IS
  LUCRETIUS'S RULE ONE NOTCH STRONGER**: Greenough brackets 54 lines as spurious and 22 of them are the
  entire content of his card 567, the Helen episode, so that card empties and is dropped, taking the
  Latin from 392 cards to 391 — measure what `<del>` costs in LINES and then in CARDS, because a card
  that empties changes the pairing and a line that goes does not. The English translates the passage, so
  **book 2 shows it in the English beside an empty Latin cell**, which is the two editors disagreeing in
  the plainest way the page can show, and the front matter says so. Its licence is the easy kind — see
  the Library bullet — and its ~120 l→I OCR slips are the SOURCE's and are recorded rather than
  repaired, because the same pattern spells Iulus, Ilium, Italy, Ida and Ithaca in the same text and
  "Iove" is undecidable between love and Jove),
  `homer-odyssey` (~701 KB, all 24 books, **288 card sections**, **0 notes** — A. T. Murray's Loeb
  prose of 1919, the SECOND book on the prose-translation-against-verse-original path and the first
  to confirm the rule that path was written for rather than to discover it: of its 2,434 line
  milestones **2,097 would weld two words together** if the tag were simply dropped, and 2 of its 192
  note stubs do the same, all of them repaired by the space rule. **TWO WELDS SURVIVE AND ARE THE
  SOURCE'S OWN** — "in thy insolence,ever roaming" at 17.245 and "ask thee;to speak out plainly" in
  book 8 — checked against the transcription, present there verbatim with no tag near them, and
  recorded rather than repaired for the reason the Iliad's thirteen are. **THREE THINGS IT SETTLED
  ARE WORTH CARRYING.** **A BOOK DIVISION'S ATTRIBUTES MUST BE READ INDEPENDENTLY OF THEIR ORDER**,
  which is the fault `cardMarks` already records met one element higher up: every earlier file on
  this path writes `<div type="textpart" subtype="book" n="1">` and this one's Greek writes
  `<div n="1" type="textpart" subtype="book">`, so the old order-fixed pattern matched **not one of
  the twenty-four**. It is the rare LOUD one — no book division means no book, so it throws on a file
  holding the whole poem — where the card version of the same fault returns a poem with nothing to
  pair on. Fixed in `teiVerseBooks` and proved inert on Ovid, Lucretius and the Iliad, **both columns
  of each, byte-for-byte**. **ITS LICENCE IS THE SIMPLEST OF ANY TWO-COLUMN BOOK HERE**, because
  Perseus's Greek for the Odyssey is not a separate Oxford text set beside the Loeb but the Greek
  printed on the facing half of the SAME 1919 volumes, credited to Murray; one life answers for both
  columns and there is no harder half to state. **AND `<del>` IS INERT HERE, MEASURED RATHER THAN
  ASSUMED**: zero in either file, and zero `<gap>` — worth the measurement every time, since
  Lucretius's 116 marks cost that poem thirty whole lines and the Iliad's cost it four),
  `homer-iliad` (~955 KB, all 24 books, **425 card sections**, **0 notes** — A. T. Murray's Loeb
  prose of 1924, and **the first book here whose TRANSLATION IS PROSE while its ORIGINAL IS VERSE.**
  Every earlier book on the TEI card path has verse facing verse, so `teiVerseBooks` read `<l>` and
  nothing else and returned twenty-four empty books when pointed at Murray; it grew a gated `prose`
  branch that walks `teiSectionProse` instead — the reader Suetonius and Herodotus already use.
  **THREE THINGS IT SETTLED ARE WORTH CARRYING.** **A STRIPPED TAG WELDS THE WORDS EITHER SIDE OF IT,
  and this is the loudest silent fault this file has recorded**: Murray prints Homer's line numbers
  every fifth line and the transcription sets them inline, hard against the words on both sides, so
  the generic tag sweep produced "came to fulfillment,from the time", "the people began to
  perish,because", "the old man prayedto the lord Apollo" — **2,787 of the 3,143 milestones, nearly
  every fifth line of the poem.** Every count read healthy throughout: 425 sections, tag balance
  clean on both columns, no word lost, nothing thrown. It was found by LOOKING AT THE RENDERED PAGE,
  which is the golden rule earning its keep for the second time after the Gita. The 137 note stubs
  weld the same way and take the same repair; **replacing a dropped tag with a SPACE costs nothing
  where one already exists**, since `teiInline` collapses runs of whitespace last. Thirteen welds
  survive and are the SOURCE's own typing, checked one by one against the transcription and recorded
  rather than repaired. **A `<note>` MAY CARRY NO NOTE**: all 144 of Murray's hold nothing but a
  reference number — "1", "2", "161.1" — because the Loeb's footnote TEXT was never transcribed and
  there is no back matter holding it, so lifting them would build a fold of 144 entries saying
  nothing and leaving them inline puts stray digits mid-sentence. They are dropped, the count is
  printed on every run, and the book's front matter tells the reader why it has no note fold. **AND
  THE EASIER COPYRIGHT WAS ATTACHED TO THE UNUSABLE TEXT** — see the Library bullet for the choice
  between Perseus's two English Iliads),
  `summa-theologica` (**~15.1 MB, by a factor of six the largest thing on the shelf** — all 614
  questions as **614 chapters**, **3,094 article numbers**, 7 notes — the Fathers of the English
  Dominican Province's translation of 1920, and **the first book here whose SIZE was the first
  question rather than the last.** Every earlier import decides the pairing and then finds out how
  big the file is; this one had to be sized before a word was fetched, because 614 questions at ~25
  KB apiece is 15 MB in ONE lazy bundle and **Cloudflare Pages refuses a file over 25 MiB** — a limit
  that breaks the deploy for every reader rather than just for this book's. Estimated at 16.2 MB from
  48 questions sampled across all six Parts, measured at 15.1 MB built, and then MEASURED IN A
  BROWSER rather than argued about: **1.6 s from tapping the banner to the chapter bar, 0.8 s to
  paint a chapter, 73 MB of heap**. One file, and the decision rests on those three numbers.
  **THE CHAPTER IS THE QUESTION AND THE SECTION IS THE ARTICLE**, which is the citation read straight
  off — "ST II-II, q. 6, a. 1" — and the alternatives were measured rather than weighed: cutting at
  the Part gives six chapters of 3–6 MB, which no browser paints and no reader scrolls, and cutting
  at the article puts ~3,000 tabs on the bar. The tabs therefore number 1..614 straight through while
  the citation restarts in each Part, and the title carries the citation; the front matter says so,
  since a reader meeting "Question 437" over "II-II q. 15" is owed the explanation.
  **FOUR THINGS IT SETTLED ARE WORTH CARRYING.** **A TYPED WIKI PAGE MAY STILL TRANSCLUDE ONE SCAN
  PAGE, AND `body: "plain"` HAD THE TWO TESTS THE WRONG WAY ROUND** — it looked for
  `prp-pages-output` FIRST and fell back to the parser container, which reads as the same thing on a
  book that is typed, because there is no wrapper to find. The Summa's first question is typed like
  the other 613 except for its first article, which somebody transcluded from the scanned volume, so
  the slice took that as the start of the chapter and threw away the treatise heading, Aquinas's
  prologue, his list of the ten points of inquiry and Article 1's own heading. **Nothing threw, the
  chapter came back 37,656 characters, and the only symptom was nine section numbers where the
  edition's own heading says ten articles.** The flag now means what it says; proved inert
  byte-for-byte on all four shipped books that declare it. **A HEADING'S ROLE IS READ FROM ITS TEXT
  AND NEVER FROM ITS LEVEL**: the transcription sets an article's heading at `h3` on two pages and
  the question's own at `h4` on three, so the first rule — drop every `h3`, keep every `h4` — deleted
  real articles. **AND THE QUESTION'S HEADING IS RECOGNISED BY THE ARTICLE COUNT IT CARRIES**, not by
  the word: it is typed a dozen ways across the book ("Quesiton." seven times, "question." lower
  case, "Question. - 112 -", "Question.OF THE MODE" with no space, "Question 6. –" with an en dash, a
  dozen with the bare title, and on three pages "Art. 1" exactly like an article) and the ONE thing
  every one of them carries is the "(SIX ARTICLES)" the edition prints after the title. **That count
  is also what makes the numbering a measurement rather than a repair**: where it and the number of
  headings agree — **592 of the 614** — the headings are numbered 1..N in order and whatever is
  printed on them is ignored, which absorbs every misprinted number at a stroke (question 12 heads
  its thirteenth article "Art. 12" a second time and its own heading says THIRTEEN) and lets the one
  question whose eight headings carry no numbers at all be numbered without composing anything. Where
  they disagree the printed numbers are kept and the gap is reported, so a question that runs 1, 4 is
  telling the truth about a page that prints two headings for four articles.
  **ITS LIMITATION IS FOURTEEN QUESTIONS AND IT IS THE TRANSCRIPTION'S**: twelve are short one
  article heading and two carry none at all, so those articles run on into the one before them and
  cannot be cited — **no prose is missing anywhere**, and the front matter says it in those words.
  **AND A SAMPLE OF 48 QUESTIONS FOUND NO FOOTNOTES WHERE THE BOOK HAS SEVEN**, which is this file's
  sample rule met on an apparatus: the entry was drafted saying the edition prints none, and the run
  over all 614 found seven in four questions of the Third Part. **A COUNT OF ZERO OVER A SAMPLE IS
  NOT A COUNT OF ZERO.** One of the seven hangs off an ARTICLE's own heading and another off a
  QUESTION's, so markers are lifted out of a kept heading and carried down off a dropped one —
  Beowulf's `dropFittHead` rule in a fourth edition, in both directions at once),
  `confessions` (~1000 KB, all 13 books as **13 chapters**, **276 chapter numbers**, 1,313 notes —
  Pilkington's Nicene and Post-Nicene Fathers translation of 1886, Augustine's SECOND book here and
  the City of God's shape exactly: one wiki page per chapter, gathered into books, the book being the
  tab and the chapter the section, because "Confessions VIII.12" is book eight chapter twelve and
  cutting at the chapter would put 278 tabs on the bar. **THREE THINGS IT SETTLED ARE WORTH
  CARRYING.** **THE TWO-NAME TRAP DOES NOT REPEAT, WHICH IS WHY IT IS A RULE ABOUT CHECKING RATHER
  THAN A RULE ABOUT WHICH NAME WINS.** Latin Wikisource carries this text twice under names one edit
  apart — `Confessiones (Migne)` and `Confessiones (ed. Migne)` — exactly as it carries the City of
  God, where the copy WITHOUT "ed." is the complete one and the other stops mid-sentence in Book XX.
  Measured here before a word was imported, **both carry all 278 chapters and all thirteen books**;
  they are one text, one on a single page and one split per book, and the `(ed. Migne)` copy is used
  purely because its subpages give one page per Folio chapter. Had the City of God's finding been
  read as a preference rather than as a measurement, the wrong reading would have been applied
  confidently to a book where it does not hold. **ITS LIMITATION IS TWO CHAPTERS AND IT IS THE
  TRANSCRIPTION'S**, not the edition's: Book I's chapters 19 and 20 have never been transcribed at
  the source, so the English carries 276 against the Latin's 278 and those two rows draw the Latin
  beside an empty English cell — the shelf's established honest rendering, and said on the book's own
  first page. Everything else pairs, a clean 1..N in every book on both sides. **AND PILKINGTON HEADS
  HIS CHAPTERS IN ROMAN WHERE DODS HEADS HIS IN ARABIC**, in the same series, the same volume set and
  the same decade — so `sections: "chapterhead"` grew a `chapterHeadRoman` gate rather than a widened
  pattern, and the City of God is inert by construction rather than by a re-run. **The three MODERN
  translations a reader is likeliest to own** — Chadwick 1991, Boulding 1997, Ruden 2017 — are named
  as the ones not to reach for, and with them **Outler's of 1955, which Wikisource carries beside
  this one** and which is in copyright until 2060),
  `city-of-god` (**~2.4 MB, the largest English text on the shelf** — Augustine's twenty-two books as
  **22 chapters**, **661 chapter numbers**, 1,675 notes — and the first book here whose CHAPTER IS
  ASSEMBLED FROM HUNDREDS OF WIKI PAGES. The Book of Documents established that `page(n)` may return an
  array; this is that at scale, 687 pages for 22 chapters, because Wikisource gives every one of
  Augustine's 661 chapters a page of its own. The mapping follows from the sizes and from the citation
  alike: "City of God XIX.24" is book nineteen, chapter twenty-four, so the BOOK is the chapter and the
  chapter is the section — Herodotus's shape a fifth time — and cutting at the chapter instead would
  put 661 tabs on the bar, a great many of them one paragraph long.
  **FOUR THINGS IT SETTLED ARE WORTH CARRYING.** **THE OBVIOUS COPY OF A SOURCE IS NOT ALWAYS THE
  FINISHED ONE, and this is the Plato-Jowett lesson on a text where the two look identical.** Latin
  Wikisource carries Migne's Patrologia twice under names one edit apart: `De civitate Dei (ed.
  Migne)`, which is what a search returns first, and `De civitate Dei (Migne)`, which has no "ed." The
  first is INCOMPLETE — measured against the English before a word was imported, its Book XX stops
  mid-sentence in chapter 24 and never reaches the last six, and its Book XII has no chapter 7 — and
  the second carries all 661. Nineteen books of twenty-two are indistinguishable between them.
  **A CLASS MUST BE LOOKED FOR ANYWHERE IN A TAG, not immediately after the element name**: this wiki
  writes `<div id="ws-data" class="ws-noexport">` and `<div align="left" class="ws-noexport">`, so a
  pattern anchored to `<div class=` misses both and the page's own author, title and year arrive as a
  quotation at the head of the chapter — the attribute-order fault this file already records on a TEI
  milestone, met again on a div, and quiet in the same way. **A CHAPTER NUMBER CAN BE READ AND THEN
  CHECKED, which is strictly better than either alone**: the page NAME states the chapter, so
  composing the marker from it would be composing an apparatus and trusting the printed heading would
  be trusting a wiki — reading the heading and comparing it against the name costs nothing and reports
  a page renamed or a heading mistyped instead of filing its prose under the chapter before it. And
  **THE RAREST FORMS CLUSTER**: 659 of the 661 headings are `Chapter N.—Title`, and the one page that
  sets its heading in bold is ALSO the one that omits the dash, so a rule written from any sample
  short of all 665 pages would have missed it and that chapter would simply have had no number),
  `prose-edda` (~339 KB, the Prologue, Gylfaginning and Skáldskaparmál as **3 chapters**, 132 section
  numbers, 177 notes — and the book that separates THE TAB from THE CITATION most sharply. Each of the
  work's three parts restarts its chapter numbering at 1, so making the numbered chapter the tab would
  mean renumbering 133 of them into one run and turning "Gylfaginning 44" into tab 50. The part is
  therefore the chapter and the work's own chapter numbers are the SECTIONS — Herodotus's shape, chosen
  for the citation rather than for the arithmetic, and the cost is three long chapters that are within
  precedent rather than at it (173,000 characters against Herodotus's longest at 199,000).
  **THREE THINGS IT SETTLED ARE WORTH CARRYING.** `count` 3 against `total` 4 is the EDITION and not the
  file: Háttatal is Snorri's own praise-poem demonstrating a hundred-odd metres, the least translatable
  part of the book, and the 1916 volume's own contents page lists three parts and stops — read off that
  page rather than inferred from the subpages that happen to exist. **A NUMBER CAN BE ROMAN AND WEAR TWO
  COSTUMES IN ONE VOLUME**: Gylfaginning and Skáldskaparmál set a bold numeral WITH a stop run into the
  first sentence, and the Prologue sets a CENTRED numeral with NO stop standing alone as its own block —
  hence the seventh section shape, `sections: "edda"`, matching both in one sweep in reading order for
  the Meditations' reason (run as two passes the first reaches 74 and the forward-only guard then
  declines every one of the Prologue's). **And the Prologue's first chapter carries NO numeral, so none
  is written**: checked on the scan, which sets the heading and then a drop-capital, so that tab's marks
  run from II and the front matter says why. Composing a "1" would be composing an apparatus.
  Its verse is the other lesson and it was found by LOOKING: Snorri quotes skaldic stanzas as evidence,
  hundreds of them, and this transcription sets them as `<dl><dd>` lines that `stripTags` unwraps into
  run-on prose — on a book arguing about how verse lines are built, the one thing that must not happen.
  Nothing threw, no word was lost and every count read healthy; see `verseFromLists`, and note that
  these lists NEST two deep, so a non-greedy `<dl>…</dl>` pair closes on the inner tag and leaves 34
  unclosed blockquotes in one chapter),
  `book-of-rites` (~790 KB, ten of the Lî Kî's forty-six treatises — **10 chapters**, 1,182 section
  numbers, 812 notes — Legge's fourth appearance on the shelf, and **the first book here that is short
  of its whole because of the TRANSCRIPTION rather than the edition.** The Classic of Poetry ships 102
  of 305 because Legge selected 102 and the Prose Edda 3 parts of 4 because Brodeur translated three;
  here Legge translated all forty-six, in two Sacred Books of the East volumes of 1885, and only the
  first has been transcribed — Volume 28 exists as an Index with 37 of ~500 pages proofread and no
  mainspace transclusion at all. That volume IS complete and every one of its ten books ships entire.
  **The ten are also the long ones — 420 pages of a 480-page volume against a companion volume of much
  the same size — so it is nearer half the work than 10-of-46 suggests**, which is worth measuring and
  saying rather than letting `count`/`total` imply a fifth. The missing thirty-six include the Great
  Learning and the Doctrine of the Mean, and the front matter names them.
  **CTEXT.ORG WAS CHECKED AND REJECTED, which is the finding to carry before anyone reaches for it as
  the obvious complete source.** It is reachable here and it does carry a complete Legge Lî Kî; its own
  FAQ says its translations are "based upon copyright-expired translations … and **manually adapted for
  the site**", alongside a third category "created through a combination of artificial intelligence and
  crowdsourcing", with no per-article statement of which is which. That cannot be shipped as "James
  Legge, 1885" — it is the Histories' modernised-Godley layer with no editor named and no way to tell
  the layers apart. **Ask what an obvious source has DONE to the text, not only whether it has it.**
  **FOUR THINGS IT SETTLED ARE WORTH CARRYING.** **A SECTION COUNT MAY RESTART INSIDE A CHAPTER** —
  Legge numbers paragraphs from 1 within each Section, and within each Part where a Section has Parts,
  so Book I starts over eight times and Book IV thirteen; run under the ordinary forward-only guard
  everything after the first Part is declined as going backwards and nine tabs in ten ship carrying
  their opening pages' numbers only. Hence the eighth section shape, `sections: "liki"`, whose counter
  is reset by the headings and which matches headings and numbers in ONE sweep for the Meditations'
  reason. **A HALF-TITLE AND THE HEADING UNDER IT ARRIVE IN ONE BLOCK**, so `dropHeads` — which keeps or
  drops a block whole, and whose three shapes cannot match Book I's nested centred div at all — is no
  help; the block is opened and its paragraphs sorted instead, on the test that a half-title is wholly
  CAPITAL and anything else is reported and kept. **DROPPING A HALF-TITLE DROPS A FOOTNOTE MARKER**,
  Beowulf's rule in another edition: Legge hangs his note on the whole treatise off its TITLE, so nine
  of the ten books would have shipped with a note 1 that no sentence opens — the markers are carried
  down onto the heading below. And **A PARAGRAPH NUMBER NEED NOT FOLLOW A FULL STOP**: three of them
  follow a comma or a footnote marker whose stop the printing drops, so the mid-paragraph rule keys on
  the figure OPENING A PRINTED LINE as well, which this transcription preserves. All 45 numbered runs
  are a clean 1..N after that, measured, with no gaps and no duplicates.
  Its plates were taken by the Republic's handle rather than a new rule: Book II's appendix closes on
  six mourning charts bound in outside the pagination, so Wikisource labels each leaf
  `data-page-number="table"` and `dropUnnumberedPages` removes them — measured first, eight unnumbered
  leaves in the whole book and every other page numbered. Worth removing rather than keeping: three of
  the six were never transcribed and arrive as Wikisource's own "A table should appear at this position
  in the text" box, the three that were are flattened by the tag stripper into a column of nouns with
  every relation gone, and the first caption is unproofread OCR),
  `book-of-documents` (~444 KB, the whole of the received Shû — **59 chapters**, 169 section numbers,
  283 notes — and the first book here whose CHAPTER IS PRINTED ACROSS MORE THAN ONE WIKI PAGE. Every
  earlier wiki book is one page to one chapter; where Legge prints a book in sections, Wikisource gives
  each section a page of its own and leaves the book's HEADNOTE — and at the head of a Part his
  introduction to the whole Part — on the book's own page, which carries no body text. So `page(n)` may
  return an ARRAY and the pages are cleaned in order and joined, with each later page's `data-fn` offset
  by the notes already gathered (measured: the four pages joined here carry no notes, so the offset is
  provably zero today, and it is written anyway because a silent mis-numbering is what this file keeps
  finding). **THREE THINGS IT SETTLED ARE WORTH CARRYING.** The tabs count **59 where the Shû is
  traditionally counted at 58 documents**, and the difference is a printing fact rather than an error:
  Legge sets the Tribute of Yü in two sections that EACH restart their paragraph count at 1, so joining
  them would put two paragraphs numbered 1 in one chapter — the edition's own division is followed and
  the front matter says why, which is Beowulf's missing fitt XXX again. **A NUMBER'S MARKUP MATTERS LESS
  THAN ITS WRAPPER**: this transcription writes Legge's paragraph numbers two ways, as plain text and as
  an anchor span carrying the citation as its id, and by the time the section pass runs `stripTags` has
  unwrapped the anchor so both have collapsed to the same plain "N." — the anchored form costs nothing,
  which is the opposite of what it looks like. What DOES cost is that **MediaWiki only wraps a run of
  text in `<p>` where the wikitext had a blank line before it**, so a document whose first paragraph
  follows its headnote directly arrives as a BARE RUN: `markLeadingSections` finds 167 of the 169 and the
  two it misses are the FIRST number of the Count of Wei and of the Announcement of the Duke of Shâo,
  each of which would ship numbered from 2 with every word present and nothing throwing — hence the sixth
  section shape, `sections: "shu"`. And **ELEVEN of the 59 carry no numbers at all**, which is the
  edition rather than the extractor: they are the short documents Legge did not number, recorded rather
  than repaired),
  `beowulf` (~264 KB, all 42 chapters, **636 line numbers**, 310 notes — and the first book here whose
  CHAPTER and whose PAIRING UNIT are two different things on purpose. Every earlier book pairs on a unit
  its editions divide into; Beowulf's editions divide into fitts, but a fitt is 50–140 lines, so pairing
  there would set one whole column-page beside another and the facing page would be useless. What both
  editions state far more finely is the LINE, printed in the margin every fifth line — which is also how
  any passage of Beowulf is cited in any language. So the fitt is the chapter and the printed line number
  is the section, which is what the tenth layout (`layout: "fitts"`) exists for. **Ask what the two
  editions state IN COMMON before assuming the pairing key is the thing they are divided into.**
  Measured over all 85 pages before it was believed: **636 markers a side over an identical range, no
  duplicate either way, and 40 of the 42 chapters pairing on every one of their line numbers** — which
  after the constructed facing-page cases is the cleanest pairing on the shelf. **THREE FAULTS IT FOUND
  ARE WORTH CARRYING.** The manuscript's numbering has **no fitt XXX** — both editions run ...XXVIII,
  [XXIX], XXXI... — and *no line is missing where it skips*, which the continuous line ranges prove
  (Wyatt: XXVIII 1963–2038, [XXIX] 2039–2143, XXXI 2144–2220); a reader meeting the gap in the tabs is
  told why in the front matter rather than finding the chapters silently renumbered into a sequence the
  poem has not got. **Six marginal numerals are misprinted** across the two editions and the way to tell
  a slip from a real divergence is the Gita's RE-SYNC test: each breaks a run that is otherwise a clean
  +5 and the very next marker is correct again, where a wrong cut would have disagreed on every marker
  after the first. And **the two editions divide once at a different line** — Wyatt opens fitt XXV at
  1740 where Gummere carries 1740 at the end of his XXIV — so that single block draws beside an empty
  cell twice, 2 half-empty rows out of 637, recorded rather than repaired, which is the Antigone case
  again. Its `dropFittHead` rule is where the care went: each fitt opens on its own numeral, which
  duplicates the tab and so goes — but **Gummere's XXXI carries a footnote ON the heading numeral**, so
  the marker is carried down to the line below rather than deleted with the line, or the note would have
  stayed in the list with no sentence opening it),
  `seneca-letters`,
  `bhagavad-gita` (~162 KB, all 18 discourses, **701 verses**, 303 notes — the THIRD facing-page book
  after the Art of War and the Analects, and the first whose verse numbers are complete on the
  ORIGINAL's side and damaged on the translation's, which is why it needed a ninth layout
  (`layout: "shloka"`) rather than reusing `interleaved`. **The lesson is that the side you cut at is
  a measurement, not a habit**: every earlier parallel book takes its structure from the English, and
  here the Sanskrit carries an unbroken set of ॥ N ॥ numerals while the English is missing eight of
  them — four a dropped closing parenthesis, four no numeral at all — so the cut is made at the
  Sanskrit and the English numerals become a CHECK. 696 of 701 then agree, which turns five inferences
  into the only reading consistent with the other 696. Its verse counts per discourse match the
  standard chapter lengths exactly, and the traditional total is 700 against this edition's 701, the
  difference being one opening verse of the thirteenth discourse that some recensions carry.
  **TWO faults it found are worth carrying.** The seventeenth discourse's printed English numerals run
  …17, 18, **20, 20**, 21… against a clean Sanskrit 1–28 — measured on the source page rather than
  inferred, which is what separates a printing slip from an off-by-one in the extractor, since a wrong
  cut would have disagreed on every verse from 19 on instead of re-agreeing at 21. And **a verse's
  Devanagari does not always sit in ONE element**: where the scan's page breaks mid-verse the
  transcription opens a fresh one, so the second discourse alone holds 76 blocks for 72 verses. Reading
  a block as a verse puts the opening of the NEXT verse at the end of the one before it — which shipped
  for an hour and is **invisible to every count this repo runs** (the verse total is right, the columns
  pair, the numbering is a clean 1–N); it was found by LOOKING AT THE RENDERED PAGE, which is the golden
  rule's "it isn't finished until it's been looked at" earning its keep. The Sanskrit is now cut as one
  continuous stream at its own numerals, so the element boundaries stop mattering),
  `marcus-aurelius-meditations` (~341 KB, all 12 books, 487 section numbers, 812 translator notes),
  `sun-tzu-art-of-war` (~379 KB, all 13 chapters, 385 section numbers in 383 rows, 608 notes),
  `plato-republic` (~666 KB, all 10 books, **no section numbers at all**, 117 translator notes — the
  first book here with none, which is why it has no original; see the `<id>.<lang>.js` bullet below),
  `plato-dialogues` (**~3.9 MB, much the largest book on the shelf** — **thirty-five whole WORKS as
  thirty-five chapters**, 1,484 Stephanus sections, 1,627 notes. The first book here whose chapter is a
  separate work rather than a division of one, so both columns are addressed through a table
  (`DIALOGUES` in the importer) instead of by arithmetic. It **absorbed the standalone
  `plato-symposium`** on 2026-08-06 — a `S.reading` / `S.bookFavs` migration in app.js carries the
  reader's place and star across the id change, and **its chapter number is re-derived, not constant**
  (7 while the book was Jowett's eleven, 11 once it was rebuilt in the ancient order; a stale number
  there does not throw, it just opens a reader on the wrong dialogue).
  **IT SHIPPED TWICE IN ONE DAY AND THE SECOND SHAPE IS THE LESSON.** It was first built from
  Wikisource's Jowett, which is the obvious source and is UNFINISHED: measured against Perseus's own
  section counts, the Gorgias carried 1 of its 81 Stephanus pages, the Phaedrus 2 of 53, the Phaedo 26
  of 62, and ten works were unusable — **the test being the visible `Page:…djvu/NNN` red-link text an
  untranscribed leaf leaves in the rendered page**, never a count of section markers, which cannot tell
  a short dialogue from a truncated one. Rebuilt on request from the **Loeb** translations on Perseus,
  which are complete, it went from eleven dialogues to thirty-five. **Ask what the source is MISSING
  before building on it**: the first shape was correct about everything it contained and was a third of
  the book.
  Thirty-five of thirty-six because Perseus's English Republic is Shorey's, published in two volumes
  in 1930 and 1935 — a LICENCE gap, not a textual one; the Republic is on the shelf from another
  printing. **THAT GAP IS NOW HALF OPEN, and the dates are why it has to be stated per volume**:
  Shorey died in 1934, so the translation is public domain wherever the term is life plus seventy —
  since 2005 — and in the United States volume 1 (Books I–V, 1930) cleared on 1 January 2026 with
  volume 2 (Books VI–X, 1935) following on 1 January 2031. This entry read "1935–37" until Aug 2026,
  which conflated volume 2's date with volume 1's reprint and hid the fact that the two clear at
  different times; taking the Republic into the Dialogues, and giving the Republic itself the facing
  Greek it has never had, both turn on it. See `docs/library-gaps.md`),
  `ovid-metamorphoses` (~813 KB, all 15 books, 156 section numbers, **0 notes** — the first book
  here whose edition carries none, so its chapters render with no note fold at all, which is correct
  and not a wiring fault), `suetonius-twelve-caesars` (~952 KB, all 12 lives, 551 chapter numbers,
  the translator's and his editor's notes — and the first book whose chapters are one TEI file EACH
  rather than divisions inside one, hence `perChapter`) and `lucretius-nature-of-things` (~445 KB,
  all 6 books, 213 section numbers, **0 notes** — the second book after Ovid whose edition carries
  none, so it too renders with no note fold) and `aristotle-nicomachean-ethics` (~515 KB, all 10
  books, 173 section numbers, 362 translator notes — and the first book here whose section number is
  **not an integer**, being a Bekker page like `1094a`; see the `data-n` note in the Library bullet)
  and `sophocles-oedipus-rex` (~140 KB, the whole play in the edition's own 15 parts, 683 line-number
  sections, **0 notes** — the first PLAY here, so the speaker of each speech is part of the text and
  the italic stage directions are the translator's, the ancient text recording none) and
  `euripides-medea` (~128 KB, the whole play in the edition's own 13 parts, 502 line-number sections,
  **37 notes** — the SECOND play, and it needed no new reader at all: both its columns divide the work
  with the same top-level `episode`/`choral` marks the Oedipus Rex uses, so `layout: "drama"` read it
  unchanged. What it did need is an APPARATUS. The Oedipus Rex's edition prints no notes, so the drama
  reader was written to STRIP them; this one prints 38 and would have lost the lot in silence — the
  quiet shape again, since every line of the play is present and only the notes are gone. See
  `dramaNotes` in the importer for the lift, and for the rule that **a marker standing between two
  lines belongs to the line before it**: seven of Perseus's own notes sit in the gap after a `</l>`,
  which `teiDramaBlocks` never walks, so their markers would have been dropped on the floor while
  their text still reached the list — an entry no sentence opens, the mirror of the dead marker the
  apparatus already refuses to draw. Measured over the whole play before it was written: all seven sit
  there and none anywhere else, and any note left without a marker is reported. **`<del>` is live here
  and changes NOTHING**, which is the thing Lucretius says to measure rather than assume: 2 in the
  English and 11 in the Greek, and — unlike the Oedipus Rex's single one, which wrapped a whole line
  and took the English from 684 sections to 683 — not one of the thirteen wraps a whole line, so
  dropping them shortens thirteen lines and removes no section from either column) and
  `sophocles-antigone` (~118 KB, the whole play in the edition's own 16 parts, 513 line-number
  sections, **0 notes** — the THIRD play, Sophocles' second book here, and it too needed no new
  reader: same top-level `episode`/`choral` marks, so `layout: "drama"` read it unchanged. It is
  **the cleanest pairing of the three plays — 513 of 513, not one empty Greek cell**, where the
  Oedipus Rex leaves 3 of 683 and the Medea 2 of 502, so it is the first drama here with no table of
  exceptions to state. Its one divergence costs the page NOTHING and that is the thing to know before
  reading the warning it raises on every run: part 4 opens at line 332 in Jebb and 333 in Storr — the
  first line of the ode on man — and because the pairing is a RANGE test rather than an equality one,
  the Greek's 333 falls inside the English's 332 block and the row draws filled. `<del>` is live and
  changes nothing (5 in the English, 0 in the Greek, not one wrapping a whole line — the Medea's
  finding again, which is why the rule is measured per book rather than carried over), and the
  **lettered line numbers are on the GREEK side alone** (161b, 323a, 1048a, 1261a, 1284a; none in the
  English), so `data-n` is doing real work on the original column.
  **ITS LICENCE FOUND A FAULT IN A SHIPPED BOOK, which is the argument for running the check across
  the SIBLINGS and not only over the book being added.** Both columns are the Oedipus Rex's easy case
  — Jebb 1891 (d. 1905) and Storr's 1912 Loeb, the same volume, (d. 1919), so no limit to state as
  Giles (2029), Ross (2042), Murray (2028) or the Song of Roland need — but Perseus has edited the
  PROSE as well as digitising it: this English is Jebb **modernized to remove archaisms**, by Pierre
  Habel in 1988 reviewed by John Gibert, which the file states in its own header. That is the
  Histories' third layer a second time, carried by CC BY-SA rather than by an expiry, and is stated
  in `rights`, in the front matter and in the importer entry. **The shipped `sophocles-oedipus-rex`
  carries the SAME layer** (Alex Sens, same year, same reviewer) **and its `rights` called the book
  "public domain on every ground" without mentioning it** — corrected in both files and in the About
  page's credits in the same commit. Coleridge's Medea carries no such note; checked, not assumed) and
  `herodotus-histories` (**~1.44 MB, the largest book on the shelf**, all 9 books, **1,578 chapter
  numbers** and 528 notes — the first work here divided into books of numbered chapters, which is the
  commonest shape in ancient prose; see the sixth layout below) and
  `confucius-analects` (~181 KB, all 20 books, **499 chapter numbers**, **0 notes** — Herodotus's
  shape a second time, and the first book here whose two columns are transcribed INTERLEAVED down one
  page rather than in a two-cell table; see the seventh layout below) and
  `machiavelli-prince` (~174 KB, all 26 chapters, **no section numbers at all**, 5 translator notes —
  the second book after the Republic with none, and unlike the Republic it still has an original,
  because its two columns pair on the CHAPTER, which the work is divided into and both editions state)
  and `caesar-gallic-war` (~508 KB, all 8 books, **404 chapter numbers**, **1 note** — Herodotus's
  shape a third time and the cleanest pairing on the shelf bar the Art of War's facing page, the two
  editions agreeing on all 404 chapter numbers in order in every book; also the first book here
  carrying a **chapter numbered 0**, Hirtius's covering letter at the head of book 8, and the first
  whose translator sets a TABLE — see the `<list>` note under the sixth layout) and
  `thucydides-peloponnesian-war` (~1.19 MB, all 8 books, **916 chapter numbers**, 4 notes — Herodotus's
  shape a fourth time, and **the first book here whose two columns come from DIFFERENT KINDS of source**:
  a Wikisource English against a Perseus TEI original, where every earlier pairing took both halves from
  one kind. It is also the first wiki book that is NOT a proofread transcription of a scan — see the
  three new rules under `.claude/fetch-book.js`) and
  `aesop-fables` (~209 KB, **313 fables in 313 chapters** — by a wide margin the most on the shelf,
  where Seneca's 124 letters were the previous high — with **no section numbers at all** and **0
  notes**. Two firsts, and both are about what an edition does NOT state. It is the first book here
  whose CHAPTER is the whole unit of the work at this scale: a fable is one paragraph, so
  `minChars` had to become a per-book floor (120 here against the default 200) or the shortest
  fable, at 191 characters and complete, reads as a truncation. And it is the first book with **no
  original whose answer is no on BOTH columns** — see the `books/<id>.<lang>.js` bullet. Its titles
  are the transcription's own, verbatim: the printed page sets every fable's title in capitals, so
  the case is unrecoverable and `titleCase()` was tried and REJECTED, since it rewrites 57 of the
  313 and damages every hyphenated compound the collection is full of. **Five titles occur twice** —
  five genuinely different fables Townsend gave one name — so two tabs can read the same thing and
  only the number tells them apart, which is the sharpest argument for numbering them at all) and
  `song-of-roland` (~219 KB, all **291 laisses**, 4,309 lines, **0 notes** — Scott Moncrieff's verse
  of 1919, and **the first book here whose CHAPTERS ARE CUT OUT OF ONE PAGE rather than fetched one
  by one**. Both columns are transcribed whole onto a single page per language, so the eighth layout
  (`layout: "laisses"`) splits rather than walks; see `.claude/fetch-book.js`. It is also the first
  where **the laisse is BOTH the chapter and the pairing unit**, which follows from the editions and
  not from a choice made here: measured over both, neither prints a part, book or canto heading
  anywhere, so the smallest unit they number is what the tabs count, as Aesop's fable is. A chapter
  is therefore short — a median of 13 lines — and that is the poem rather than the import, a chanson
  de geste having been sung one laisse at a time, each stanza on one vowel. **Each edition carries
  exactly ONE malformed numeral and the forward-only rule repairs both**: Scott Moncrieff's scan page
  87 prints laisse 135 as CXXXXV, an X too many — read off the page image rather than guessed, so it
  is the PRINTING and not the transcription — and Bédier's laisse 286 appears as CCXXXVI, having lost
  an L. Both are reported every run and named in the front matter. Its author is **Anonymous**, the
  first on the shelf, which is why `BOOK_AUTHOR_COLOR` needed that key rather than the generic
  fallback — see the Library bullet).
- `books/<id>.<lang>.js` — the same book in the language it was WRITTEN in
  (`window.FOLIO_BOOK_ORIG_IN.push({ id, lang, langName, edition, rights, sourceName, sourceUrl, chapters:[{ n, html }] })`).
  Its own **lazy** bundle (`bookOrig:<id>`), generated by the same importer, never hand-edited. Currently thirty-two:
  `bede-history.la.js` (~560 KB, all five books, **140 chapters**, the Praefatio joined in front of
  Book I — the received Latin as transcribed at Latin Wikisource, and **the original here whose
  TRANSCRIPTION NAMES AN EDITION IT DOES NOT PRINT.** Its header states "editio: Patrologia Latina,
  XCV"; the text sets consonantal *v* as *u* throughout (93 `uero` against 2 `vero` over the five
  books) and matches Alfred Holder's edition of 1895 word for word where sampled, which Migne's
  reprint does not. Every candidate is long out of copyright, so nothing is at stake but the claim,
  and none is made — the Divine Comedy's question answered the way Lucretius's entry answers it.
  **ITS CHAPTER MARK WEARS TWO COSTUMES AND IT IS THE WHOLE BOOK THAT CHANGES**, not a page here and
  there: Liber Primus sets its numbers as `<h3>` headings and the other four set them as a bare
  `[N]` opening the paragraph the chapter begins. Both are converted BEFORE the tags come off,
  because after `stripTags` a heading is a bare figure indistinguishable from a number in the prose —
  and this text is full of Roman numerals while writing its chapter marks in Arabic, so there is
  nothing else to tell them apart by. **A THIRD costume was found by inventorying all 106 bracketed
  marks rather than by fixing the three that failed**: 69 open `<p><br/>`, 23 open `<p>`, and 3 carry
  an empty anchor span between the two. Written against the first two the run loses II.16, V.21 and
  V.24 — three chapters folded into their neighbours with every count still reading healthy.
  **AND ONE PAGE CARRIES A STALE CHAPTER INDEX OUTSIDE THE WIKI'S OWN `ws-noexport` WRAPPER**: Liber
  Secundus opens on a strip reading "1 - 2 - 3 … 34", which is BOOK I's chapter count sitting on Book
  II's page, and because it stands before the running head a rule anchored to the start fires on
  nothing. The furniture is peeled in a LOOP instead, and the strip is recognised by its SHAPE — a
  paragraph of nothing but figures and dashes, which no sentence of Latin can wear — rather than by
  its wording; every removal is counted. **Its host rates it 25% proofread**, which is why the
  length correlation against the English was run before a word was imported rather than a page
  glanced at; see the `bede-history` entry above for the figure),
  `boethius-consolation.la.js` (~190 KB, all five books, **78 sections**, 39 metres in 896 lines —
  E. K. Rand's Latin of 1918, printed facing an English translation in the same Loeb volume, and
  **the original here that had to be lifted OUT of a facing-page file rather than fetched as one.**
  The transcription linearises the printed opening: within each book the numeral headings run Latin,
  English, Latin, English all the way down, so the Latin is every second one. Measured before it was
  believed — 156 numeral headings in the Consolation, exactly twice the seventy-eight sections, and
  each book's count exactly twice its own — and each pair's two numerals are checked against each
  other on every run, since a heading dropped anywhere in the file would shift the whole of the rest
  of that book onto the English column with nothing throwing.
  **ITS EDITOR IS NAMED AND SIGNS HIS OWN NOTE ON THE TEXT**, which is what settles the question a
  Latin original always raises here: Rand says outright that he built it from the apparatus in
  Peiper's Teubner of 1871, his own collations of the important manuscripts and Engelbrecht's
  article of 1902, and that every reading in it has the authority of some ninth- or tenth-century
  manuscript unless he says otherwise. **THE OBVIOUS FREE ALTERNATIVE NAMES NOBODY**: Latin
  Wikisource carries the Consolation complete, and it credits no editor, romanises the Greek into
  something the eye reads as broken Latin (`Ecauda me` for Ἔξαυδα, μὴ κεῦθε νόῳ), scatters scansion
  macrons through one metre and nowhere else, and — the fault that rules it out whatever its
  provenance — numbers each book's prose and verse in ONE continuous run of thirteen, sixteen,
  twenty-four, which is not how any edition of Boethius is cited and could not be printed as a
  citation. The Latin Library has no Boethius page at all. **Ask what an unattributed transcription
  IS, and then ask whether its numbers are the numbers anybody uses.**
  **ITS TWO LIMITATIONS ARE THE GREEK AND THE LINE NUMBERS**, and both are recorded rather than
  repaired; see the `boethius-consolation` entry above for what can be decoded and what cannot, and
  why the marginal numerals of the metres point at nothing on the facing page. Its own footnotes are
  the English column's and are printed under the translation, so none should reach a Latin slice at
  all — the count of any that do is printed on every run, a stray one shipping as prose),
  `ramayana.sa.js` (~2.1 MB, the 490 sargas the translation reaches, of 645 — the received text as
  transcribed at Sanskrit Wikisource, and **the original here whose TRANSCRIPTION USES THE MOST
  SHAPES: four, and each was met the loud way.** The Rigveda's pages on this same wiki use four too
  and 1,023 of its 1,028 are one of them; here `div.poem`, `div.verse` wrapping a `<pre>`, a
  proofread `ws-poem` and **the verse typed straight into the page as `<p>` blocks with no container
  at all** are all in ordinary use, and the reader threw on the first page of each new kind rather
  than returning a short sarga. That is the failure shape worth having: the alternative is a chapter
  that comes back empty and pairs with nothing while every count reads healthy. Which shape each page
  used is counted and printed on every run.
  **THE NO-CONTAINER FALLBACK IS THE NARROWEST OF THE FOUR AND HAD TO BE**, because those pages carry
  something the others do not: a स्रोतः section at the foot crediting the reciters of the recorded
  audio, which is prose on the page and is not Válmíki. The page is cut at its first section heading,
  the navigation tables go, and of what is left only a paragraph CARRYING A DAṆḌA is taken — every
  verse block closes on its ॥N॥ and no furniture on these pages holds one, so the test separates the
  poem from the page it is printed on rather than guessing at position.
  **EVERY PAGE STATES ITS OWN CITATION AND IT IS CHECKED**, which is the City of God's rule and is
  worth more on a book addressed by arithmetic than on one addressed by name: 490 pages fetched under
  a title built out of a kanda table and a canto number is 490 chances to file a sarga under the wrong
  one, and a mis-numbered page would pair with the wrong canto while every count stayed healthy. Each
  opens श्रीमद्वाल्मीकीयरामायणे बालकाण्डे प्रथमः सर्गः ॥१-१॥ — kanda and sarga — which is compared
  against the page asked for and then dropped as the page's own furniture. **THE VERSE NUMERAL WEARS
  TWO COSTUMES AND ONLY ONE BOOK USES THE FIRST**: the Bála Káṇḍa prints the whole citation at every
  verse, ॥१-१-९॥, and the other five print the verse alone, ॥ ९॥. Both are KEPT as printed — Griffith
  numbers no verses, so they pair with nothing and are not `bk-n` markers, but they are how a passage
  of the Sanskrit is cited and dropping them would take that away for nothing.
  **ITS LICENCE NAMES NO EDITOR AND NONE IS INVENTED**, which is Lucretius's judgement — and unlike
  the Rigveda's, where the recitation discipline makes the received samhita what every printed edition
  prints, the gap here is a real limitation and is stated as one: the Ramayana survives in three
  recensions that differ in their sarga divisions and in thousands of readings, so an unnamed text is
  a text whose recension a reader cannot look up. What CAN be said is that it divides where a northern
  text divides, and that is said on the book's own page),
  `satyricon.la.js` (~230 KB, all 141 sections, **607 lines of verse in 54 blocks**, **147
  lacunae** — the Latin printed facing Heseltine's English in the same 1913 Loeb volume, and **the
  EASIEST original on the shelf to justify and the hardest to read**. Easy because the two columns
  are not two editions at all: they are the two halves of one printed page, split into two files by
  Perseus in 2014, carrying the same 141 section milestones in the same order because one editor set
  them once — so the pairing is exact by construction and one life answers for both columns, the
  Odyssey's position rather than the Iliad's. Measured anyway: 141 a side, 1..141 with no gap or
  duplicate either way, 141 of 141 paired. Hard because the text is a RUIN — 147 `<gap/>`s across
  half its sections, each rendering as an ellipsis, and it breaks off mid-sentence at both ends.
  **IT IS THE FULLER COLUMN IN ONE RESPECT AND THE ONLY ONE IN ANOTHER**: where the translator left
  ten sections in Latin the two columns say the same thing twice, and where he set Petronius's verse
  as prose this is the only column that shows it as verse. `<del>` is live and costs 53 words across
  44 elements with **none wrapping a whole line**, measured rather than assumed — Lucretius's 116
  marks cost that poem thirty whole lines. Its 385 notes are an apparatus and are dropped; see the
  `satyricon` entry above),
  `canterbury-tales.enm.js` (~1.05 MB, the Prologue and all 24 tales, **17,581 lines of verse** plus the
  two prose tales entire — Walter W. Skeat's Oxford text of 1900, the first original here in **Middle
  English** (`enm`), and **the only one on the shelf that its own translation was made FROM.** Everywhere
  else the two columns are two editors set side by side and the pairing has to be measured; the
  translators state in their preface that they follow Skeat's text throughout, and Skeat's text is this
  column — so the two divide the work identically, twenty-five units in the same order, with no
  reconciliation to do and no exception to record. **Ask whether the translation names its own source
  before measuring a pairing**: it is rare, and where it happens the measurement is a confirmation
  rather than a search.
  **AND IT IS THE ONLY ORIGINAL HERE FROM PROJECT GUTENBERG**, which is new to this shelf and was chosen
  by elimination rather than by preference — see the `canterbury-tales` entry for the three Wikisource
  candidates and why each fails. **ITS LINE NUMBERS ARE DROPPED AND THAT IS THE ONE REAL LOSS**: Skeat
  prints one every fifth line and it is how any passage of Chaucer is cited in any language, but the
  prose translation states nothing to set against it, so a number here would point at a place the facing
  page cannot find — and putting them in as `bk-n` markers would additionally cut each tale's verse into
  a paragraph every five lines, since `bookSections` splits a block at every marker. Said in the front
  matter rather than smoothed over. **THE COUNT WAS CHECKED AGAINST THE EDITION'S OWN NUMBERING** rather
  than glanced at: group by group the extracted lines come to 4,432 against Skeat's last-numbered 4,422
  in Group A, 971 against 965 in C, 2,297 against 2,294 in D and so on, the handful over being the
  rubrics he prints between them — and B and I read far under, which is correct, those being the groups
  holding the two prose tales. **AND THE APPARATUS WAS SWEPT FOR RESIDUE AFTERWARDS, WHICH IS WHERE THE
  REAL WORK WAS**: the four-indent rule takes 1,246 blocks of variant readings in one pass and looks
  finished, and five more shapes of Skeat's editorial furniture were still standing in the shipped file
  — 18 lines whose margin reads `[T. _om._` rather than a Tyrwhitt line number, one reading `[See p.
  256.`, two four-indent notes opening on three asterisks, and six flush-left or verse-indent notes
  saying where Tyrwhitt puts the passage. **None of it throws, shortens a tale or breaks the pairing**;
  it just ships as Chaucer. Each rule was then written from a measurement rather than from the example
  that prompted it — 39 lines in the whole poem end in a bracketed margin and every one is one of three
  costumes; ten blocks carry a page reference and nine are notes, the tenth being a real stanza of the
  Monk's Tale whose margin carries one, which is why the margin is stripped per line before the blocks
  are judged. Skeat's apparatus, his marginal summaries and the Tale of Gamelyn — which he prints as an
  appendix and says is not Chaucer's — are not reproduced),
  `three-kingdoms.zh.js` (~1.74 MB, all 120 chapters, **483,000 hanzi** — the novel in the recension of
  Mao Lun and Mao Zonggang as transcribed at Chinese Wikisource, and **the original here whose
  RECENSION IS STATED BY THE TRANSCRIPTION ITSELF, which is what made the pairing a check rather than
  a search.** This novel exists in two forms that divide the story differently — the 1522 printing in
  240 sections and the Maos' of 1679 in 120 chapters — so a column taken from the wrong one could not
  be paired at all; the wiki's own front page says outright 此為毛綸、毛宗崗父子修改、批注後的版本 and
  links the Jiajing text carried separately under another title, and Brewitt-Taylor translated the
  Maos. Measured as well as read: 120 chapters a side, and the couplet heading each Chinese chapter is
  the couplet he prints over the same number, checked by name profile over all 114 titles the contents
  pages give up and then read side by side across the span.
  **ITS FURNITURE IS ALL TABLES AND THERE IS NOTHING ON THE PAGE TO KEY ON**, which is why it needed a
  rule stating a fact about the SOURCE rather than about the markup. The navigation at the head of the
  page is classed `ws-header`; the pair at the foot carries no class at all, only an inline style. What
  can be said instead is that these chapters contain no tabular matter whatever — it is a Ming novel —
  so every table on the page is furniture, and the rule reports any table it removes that was carrying
  prose rather than links. The wiki's own back-to-top link and its public-domain banner, which some
  chapters carry and some do not, are taken by the class each declares. Every one of them would
  otherwise arrive as prose, which makes a chapter LONGER and is invisible to every count.
  **AND A WRAPPER ROUND THE BODY APPEARS ON SOME CHAPTERS AND NOT OTHERS** (`div class="prose"`), so
  the rule that unwraps it is global rather than anchored to the head — anchored, it would leave a
  stray quotation of the whole chapter on however many of the 120 carry one. Its verse is set as a
  NESTED definition list, two deep, which `verseFromLists` flattens; on a novel that opens on a poem
  and quotes several a chapter that is the one thing that must not read as prose),
  `journey-to-the-west.zh.js` (~762 KB, all 100 chapters — the received Ming novel as transcribed at
  Chinese Wikisource, and **the only original on the shelf that is FULLER THAN ITS TRANSLATION.**
  Everywhere else the translation is the complete text and the original is the harder half to find;
  here the Chinese is all hundred chapters entire while the English condenses eighty-nine of them, so
  on most of the book this column is not merely fuller but the only place the story is actually told.
  That is also the answer to why the book is shelved at all: every complete English translation is
  still in copyright, so the choice was this pairing or none.
  **THREE THINGS IT SETTLED ARE WORTH CARRYING.** **A KNOWN RECENSION SPLIT MUST BE MEASURED BEFORE
  THE COLUMNS ARE TRUSTED**: the story of Tripitaka's parentage is chapter 9 in the Qing recension and
  stands outside the numbered sequence in the earlier one, so the two orderings run a chapter apart
  from there to the end and a pairing built on the assumption would be wrong for ninety-two chapters
  while looking perfect. Checked on the source itself — this transcription's index and its own
  chapter 9 both carry 陳光蕊赴任逢災, which is Richard's chapter IX, and 10, 11 and 12 follow his X,
  XI and XII — so the columns agree chapter for chapter over all hundred. **ITS 附錄 IS NOT A 101st
  CHAPTER** and is deliberately not fetched: it is a second copy of that same ninth chapter carrying
  the other recension's placement in a note of its own, and a walk that read the index rather than
  naming the pages wanted would pick it up as an extra. **AND IT IS THE FIRST ORIGINAL TYPED ONTO A
  WIKI RATHER THAN TRANSCLUDED FROM A SCAN**, so `originalChapter` gained the `body: "plain"` gate
  cleanBody already carried for the translation side, plus a balanced drop of that wiki's own
  `headerContainer` — without which every chapter opens on a quotation of its own bibliographic
  header. Its constant quoted verse (the poems that open a scene or describe a mountain, several a
  chapter) is set as `<dl><dd>`, which the tag stripper would unwrap into run-on prose on a book that
  is half poetry, so it takes `verse: "dl"` — the Prose Edda's `verseFromLists`, reused unchanged.
  All three options are gated per book and the change was proved inert on the shipped Prince,
  byte-for-byte, which is the standing discipline for any edit to a shared extractor),
  `virgil-aeneid.la.js` (~475 KB, all 12 books, **391 cards, 9,843 lines of hexameter** — J. B.
  Greenough's Oxford-shaped text published by Ginn and Company in Boston in 1881, and after the Gallic
  War the cleanest pairing of two independently edited texts on the shelf: 390 of its numbers appear on
  both sides in the same order, nine of the twelve books pair on every card they have, and the two
  reconcilable pairs (Latin 7.705 against English 7.706, 11.397 against 11.399) were READ passage by
  passage before either was moved, there being no tale names here for `reconcileCards` to check against —
  both Homers' position. **ITS LINE COUNT IS ONE OVER THE STANDARD AND FIFTY-FOUR UNDER IT, and both are
  accounted for**, which is the arithmetic to run rather than the total to glance at: 9,897 `<l>` against
  the traditional 9,896, the extra being book 10's `<l n="62b" part="F">`, a half-line the file's own
  revision history records being renumbered for in 2015; and 54 of those wrapped whole in `<del>` and
  dropped on the Meditations' judgement, of which 22 are one run — 2.567–588, the Helen episode — that
  empties a whole card. **Its `<q>` marks are the only speech punctuation it has**, 3,833 of them, so the
  Latin column prints no quotation marks at all where the English has them: rendering each as an HTML
  `<q>` was measured and rejected, since they nest three deep and `rend="merge"` repeats the tag on every
  line of a continuing speech, which would put quotation marks on every line of every one of Virgil's
  long speeches. Said in the front matter instead),
  `homer-odyssey.grc.js` (~574 KB, all 24 books, **all 288 of the translation's card sections** — the
  Greek printed facing Murray's English in the same 1919 Loeb volumes, which is why it is the ONLY
  original here that costs its book no second licence to reason about: one publication, one editor,
  one death year, both columns. **23 of the 24 books carry byte-identical card lists and 286 of the
  288 numbers appear on both sides**, with no duplicate and nothing out of order either way. The two
  exceptions are both in book 14 — English 147 against Greek 148, and English 234 against Greek 235 —
  each one line apart, each READ passage by passage before `reconcileCards` was allowed to move it,
  since a Homeric card carries no tale name to check a reconciled pair against; in both the English
  boundary is drawn one line early and the passage is plainly the same passage, and every other card
  in that book agrees, which is the clean re-sync that tells an editor's different cut from a
  misaligned extractor. **ITS LINE COUNT IS THREE SHORT OF THE STANDARD AND ALL THREE ARE ACCOUNTED
  FOR**: 12,107 `<l>` against the traditional 12,110, the missing lines being 10.456, 16.101 and
  23.49, and in each the edition's own numbering steps straight over the gap (…455, 457…), so the
  omission is the EDITION'S and not a line the importer lost. Do the arithmetic rather than glancing
  at the total — a count that is nearly right is how a truncated import hides),
  `homer-iliad.grc.js` (~1.38 MB, all 24 books, **all 425 of the translation's card sections** —
  Monro and Allen's Oxford Classical Text of 1908–1920, and **the cleanest pairing of two
  independently edited texts on the shelf bar the Gallic War**: 425 cards a side, 22 of the 24 books
  carrying byte-identical card lists, 423 of the 425 numbers on both sides, and the two exceptions
  each one boundary drawn a line or two apart — book 3's 381 against 383 and book 13's 82 against 81
  — READ passage by passage before `reconcileCards` was allowed to move either, since without a tale
  name to check against there is nothing else to tell an editor's different cut from a bad one.
  **ITS LINE COUNT IS SHORT OF THE STANDARD AND EVERY MISSING LINE IS ACCOUNTED FOR**, which is the
  arithmetic to run rather than the count to glance at: 15,687 `<l>` elements against the traditional
  15,693, six simply absent (9.458–461, which the edition's own single note says it omits, plus
  11.543 and 14.269) and four more present but `<del>`-wrapped in book 8, which are dropped with
  their words on the Meditations' judgement — so 15,683 ship, and 15,687 + 6 = 15,693. Lucretius's
  116 `<del>` marks cost that poem thirty whole lines, so measure this rather than assuming the rule
  is inert. **Its licence is the harder half of the pair**, which is the Medea's position: Allen
  lived until 1950 against Murray's 1940, and a joint work's term runs from the last surviving
  author, so the Greek stays encumbered ten years longer than the English where the term is life plus
  a hundred),
  `confessions.la.js` (~552 KB, all 13 books, **278 chapters against the translation's 276** — Migne's
  Patrologia Latina 32 of 1841, the text Pilkington was translating, so the two columns are a
  translation and its own original rather than two independent editions. It is **the first original
  here that is FULLER than its translation by a documented transcription gap rather than by an
  editorial choice**: Book I's chapters 19 and 20 are complete in the Latin and have never been
  transcribed in the English, so those two rows draw the Latin beside an empty cell. Everything else
  is exact — 12 of 13 books pair on every chapter number, both columns a clean 1..N. **ITS ONE
  FINDING IS A FIFTH COSTUME FOR THE CAPUT MARK, and it is the quietest one yet**: Book IX prints
  `CAPUT V Ambrosium consulit quid legendum.` with **no full stop after the numeral**, alone among
  278, so that chapter folded into the fourth and the Latin came out 12 chapters where the English
  had 13. Nothing threw, no word was lost, the book was the right length, and the ONLY symptom was
  the pairing warning naming a 9.5 the original did not have. The stop is optional now and the
  numeral carries a `\b` to pay for it, or `CAPUT` followed by any capitalised word beginning C, I,
  V, X or L would read that letter as a chapter number; proved inert on the City of God
  byte-for-byte),
  `city-of-god.la.js` (**~2.0 MB**, all 22 books, **all 661 of the translation's chapter numbers** —
  Migne's Patrologia Latina 41 of 1841, which prints the Maurist text of 1685 that Dods was
  translating, so the two columns are a translation and its own original rather than two independent
  editions set side by side. **It is the largest EXACT pairing on the shelf**: 661 chapters a side,
  identical numbers in identical order in all 22 books, no gap and no duplicate either way — bettered
  only by the constructed cases, where one editor numbered both columns at once. Its chapter mark is
  read out of the prose rather than off structure (`layout: "caput"` → `extractCaput`), and it wears
  four costumes — `CAPUT PRIMUM` for the first of every book against Roman numerals after it, the
  double dash after the number missing in a handful, and one chapter with a stray full stop after the
  word itself. Written against the strictest of the four the pass finds 650 of 661 and the eleven it
  misses fold into the chapter above them, which no count can see. Book I marks its tenth chapter a
  SECOND time in square brackets, where Migne resumes it after an inserted passage; the forward-only
  guard declines it and the material folds into chapter 10, where it belongs. **The edition's own
  page references are in the running text** — 821 bare figures like `41.0347|` threaded through the
  Latin — and are removed and counted rather than left as debris mid-sentence),
  `beowulf.ang.js` (~216 KB, all 42 chapters, all 636 of the translation's line numbers — A. J. Wyatt's
  Cambridge text of 1894, made from Zupitza's photographic facsimile of the burnt manuscript, and the
  first original here in **Old English** (`ang`). It is also the first whose own divisions had to be
  FOLDED to match the translation's: Wyatt divides where the manuscript does and brackets a section
  [XXIX] that Gummere runs on inside his XXVIII, so `foldInto` joins the two into one chapter and the
  columns divide alike — the alternative being a chapter tab with an original and no translation, which
  is worse than a long chapter. Measured after folding: 36 markers on each side of that chapter.
  **Its licence is the shelf's first where the thing that cannot be established is a DATE rather than a
  name** — see the Library bullet),
  `seneca-letters.la.js` (~862 KB, all 124 letters), `marcus-aurelius-meditations.grc.js` (~366 KB, all 12
  books, 486 sections), `sun-tzu-art-of-war.zh.js` (~34 KB, all 13 chapters — classical Chinese is terse,
  and this is the whole work), `ovid-metamorphoses.la.js` (~575 KB, all 15 books, 156 cards, 11,927
  lines of hexameter), `suetonius-twelve-caesars.la.js` (~530 KB, all 12 lives, 541 chapters) and
  `lucretius-nature-of-things.la.js` (~352 KB, all 6 books, 213 cards, 7,382 lines of hexameter —
  **and the book whose shipped text a LATER book's inertness check found broken, which is the argument
  for running that check across the SIBLINGS rather than only over the book being added**, exactly as
  the Antigone's licence pass is. Adding the Aeneid taught `teiVerse` to resolve TEI's `<choice>`, which
  offers two readings of the same word; unwrapping it the way everything else inside a line is unwrapped
  keeps BOTH, and this file had been shipping all **110** of its `<choice>` elements doubled since the
  day it was added — *aër* as "aeraër" 23 times, *aëris* as "aerisaëris" 15, *poëtae* as "poetaepoëtae",
  *coërcet* as "coercetcoërcet". Every count read healthy throughout: the line total is right, the cards
  pair, tag balance is clean, nothing threw. The rule keeps `<corr>` over `<sic>` and `<orig>` over
  `<reg>` — the reading the edition means to stand — and all 110 now read correctly. **24 of them still
  carry a doubled vowel that is the SOURCE's own** (`aeera`/`aeëra` for *aera*, both readings wrong),
  recorded rather than repaired) and
  `aristotle-nicomachean-ethics.grc.js` (~335 KB, all 10 books, 181 Bekker pages) and
  `plato-dialogues.grc.js` (**~5.6 MB, much the largest file in the project** — all thirty-five works,
  1,484 Stephanus sections. Burnet's Oxford Classical Text, and the FIRST original assembled from a
  file PER CHAPTER of a multi-work book, one Perseus work id each. Thirty-four are `perseus-grc2`; the
  Euthyphro has no grc2 at all and its grc1 is the older encoding, whose divisions read
  `resp n subtype` where the newer ones read `n subtype` — inert, because `teiSections` reads a
  division's attributes independently of their order, but a probe that fixes the order reports that
  dialogue as having no sections whatever, which is how it was first measured here.
  **THE ONLY PAIRING IN THE LIBRARY THAT IS EXACT BY CONSTRUCTION AT SCALE**: both columns are the
  same TEI encoding of the same citation scheme from the same publisher, so they cannot drift.
  Measured anyway, all 35 works — 1,484 sections a side, identical numbers in identical order, no
  exception either way. **The Letters repeat ten Stephanus numbers** (a page spanning the join between
  one letter and the next) **and both columns repeat the same ten in the same places** — worth checking
  rather than assuming, since a duplicate on ONE side only is what would quietly merge two passages
  into one row) and
  `sophocles-oedipus-rex.grc.js` (~123 KB, the whole play, 691 line numbers) and
  `herodotus-histories.grc.js` (~1.26 MB, all 9 books, 1,577 of the translation's 1,578 chapters) and
  `confucius-analects.zh.js` (~44 KB, all 20 books, all 499 chapters — the smallest original on the
  shelf, classical Chinese being terse, and the second after the Art of War to pair on every chapter
  the translation has) and `machiavelli-prince.it.js` (~162 KB, all 26 chapters) and
  `caesar-gallic-war.la.js` (~405 KB, all 8 books, all 404 chapters — T. Rice Holmes's Oxford text of
  1914, and the third original after the Art of War and the Analects to pair on every chapter the
  translation has, here without a single exception on either side).
  `thucydides-peloponnesian-war.grc.js` (~1.02 MB, all 8 books, **all 917 chapters** — Henry Stuart
  Jones's Oxford text of 1910, and the cleanest Greek on the shelf: 1..N in every book, no gaps, no
  duplicates and not one lettered number, so none of the Ethics' or Herodotus's `data-n` trouble
  arises. The English carries 916 of the 917; see the Library bullet for the one that is missing).
  `rigveda.sa.js` (**~3.06 MB on disk against 1.34 million characters**, every one of them three
  bytes of UTF-8 — all 1,028 hymns, **10,542 verses** — the received Shakala samhita as
  transcribed at Sanskrit Wikisource, and **the first original here whose SOURCE PAGE CARRIES A
  COMMENTARY TEN TIMES THE LENGTH OF THE TEXT.** Sayana's fourteenth-century bhashya sits in a
  collapsed block under every hymn, and it carries a second copy of the samhita with its accents and
  a third in the word-separated padapatha — so a reader that took the page's text would ship each
  hymn three times inside a commentary nobody asked for, with the numerals running 1..N three times
  over. It is the Art of War's commentary problem in a language the note fold cannot hold: not an
  explanation OF the text in the reader's language but another text entirely, so it is DROPPED
  rather than lifted, and `test-library.js` sweeps the shipped file for its stock vocabulary because
  a leak makes a hymn LONGER and no count of hymns or verses can see it. Its verse is cut as a
  STREAM rather than block by block — the Gita's rule on the same wiki — since a long hymn opens a
  fresh `div.poem` part way through (1,037 blocks over 1,028 hymns, 9.86 holding three for its 48
  verses), and reading a block as a hymn would take the first fifteen and drop the rest with the
  count still looking like a hymn. It is also the first original here whose pages carry
  ILLUSTRATIONS, whose captions the tag stripper would otherwise unwrap into the middle of the verse.
  **ITS LICENCE NAMES NO EDITOR AND NONE IS INVENTED**, which is Lucretius's judgement in a second
  book — and a weaker gap than that one, for a reason worth stating rather than assuming: Lucretius
  survives in two ninth-century copies and editors differ over hundreds of readings, where the
  Rigveda was transmitted by a recitation discipline built to make variation impossible and the
  received Shakala samhita is what every printed edition prints. The ground stated is the age of the
  text, which needs no edition to establish and anyone can check).
  `song-of-roland.fro.js` (~198 KB, all 291 laisses, 4,012 lines — Bédier's text of 1920–1922, and the
  first original here in **Old French** (`fro`), a historical stage of a living language rather than a
  dead one; see the `song-of-roland` entry below for the `<hr>` cut and the six unnumbered laisses).
  `euripides-medea.grc.js` (~149 KB, the whole play, 500 of the translation's 502 line numbers —
  Gilbert Murray's Oxford text of 1902, and **the first original here whose LICENCE is the harder half
  of the pair**: everywhere else the original is the older and easier column, and Murray died in 1957,
  so his Greek stays in copyright where the term is life plus seventy until 2028. The two empty cells
  are the first on the shelf the EDITION'S OWN NOTES explain — 1271 and 1273, where Murray runs the
  translation's lines together and gives them to both children speaking at once, which Perseus's notes
  on those very lines say and which now ship, so a reader who meets the blank finds the reason a marker
  away).
  `sophocles-antigone.grc.js` (~96 KB, the whole play, **all 513 of the translation's line numbers** —
  Francis Storr's 1912 Loeb, the same volume the Oedipus Rex's Greek comes from, and the only ORIGINAL
  on the shelf that pairs on every one of its translation's sections without a single exception in
  either direction bar the constructed cases (the Art of War's facing page, the Analects, the Gallic
  War). It carries 515 markers against 513 sections, which is correct and not a miscount: where the
  Greek changes speaker inside one of Jebb's prose blocks the block is emitted twice under the same
  number so each keeps its speaker, and `bookSections` folds the pair back into one row).
  `bhagavad-gita.sa.js` (~90 KB, all 18 discourses, **all 701 verses** — the Devanagari printed facing
  Besant's English in the same 1922 Madras volume, so it is the SECOND facing-page original after the Art
  of War, and like that one it costs no extra requests, both columns coming out of one fetch. Its
  numerals are the COMPLETE side and the English the damaged one, which is what the ninth layout exists
  for; see the `bhagavad-gita` entry above and `extractShloka` in the importer).
  **Forty-eight books, thirty-two originals**: the Republic, Aesop's Fables, Gilgamesh, the Classic of Poetry,
  the Book of Documents, the Book of Rites, the Prose Edda, the Poetic Edda, Lysistrata, Shakuntala, the
  Divine Comedy, the Summa Theologica, Don Quixote, the Maxims of Ptahhotep, Le Morte d'Arthur and the
  Travels of Marco Polo
  have none, and the reason differs — the next paragraph's rule bites on the Republic's ENGLISH only and
  on BOTH of Aesop's columns, while Gilgamesh fails a step earlier, there being no settled original text
  to face. **LE MORTE D'ARTHUR IS THE ONE THAT NEVER REACHES THAT RULE AT ALL**, and it is a fourth
  answer rather than a variant of the other three: it is written in ENGLISH, so there is no second
  text to pair with — see its entry above, and note that this is the case where the question "does
  that text say which section each passage is?" is not the question.
  **THE TRAVELS IS A FIFTH ANSWER, AND THE ONE TO READ WHEN AN ORIGINAL LOOKS EASY** (Aug 2026). Every
  earlier refusal is about the original: it does not exist, or its editor is in copyright, or it states
  no numbers. Here the original is complete, machine-readable and openly licensed — Eusebi's edition of
  the Franco-Italian text, CC BY 4.0 from Edizioni Ca' Foscari — its 232 chapters nearly match Yule's
  235, and its rubrics are what Yule's chapter titles translate. The refusal is about the TRANSLATION:
  Yule says in his own introduction that he translated from Pauthier's French, filled it out from the
  Franco-Italian, and bracketed in whatever Ramusio's Italian had that the others did not, so the
  English column is a composite of three traditions and 144 bracketed passages would face nothing at
  all. He also states that the Franco-Italian has 232 chapters against his 235 and cites it by PAGE
  rather than by chapter, so neither edition states the other's sections either. **Ask what a
  translation is a translation OF before asking whether an original can be found.**
  **PTAHHOTEP IS THE REPUBLIC'S CASE AT ITS PLAINEST, AND IT IS WORTH KEEPING BECAUSE THE EGYPTIAN IS
  NOT THE PROBLEM** (Aug 2026). Everything about the original looks available: the poem survives in
  four copies, the fullest of them the Papyrus Prisse, it has been edited twice over, and both a
  transcription and a lexical database are online. What decides it is the ENGLISH, measured before
  anything else was tried — **swept over the whole of Gunn's translation there is not one papyrus
  reference of any kind**: no column and line, no verse number, no mention of the manuscript
  anywhere. His sections are marked A, B, 1..43, C, D and by nothing else, and those marks are his
  own. So there is no number the two texts share and the answer is no whatever the Egyptian side
  says. **The Egyptian side has a difficulty of its own worth recording so nobody starts there**: the
  openly downloadable transcription of the Prisse text (Nederhof and Myers, St Andrews) follows
  **Žába's edition of 1956**, and Žába lived 1917–1971, so his constituted text is in copyright until
  2042 where the term is life plus seventy — the Prose Edda's rule, that an editor's constituted text
  is a modern work. The Berlin Thesaurus Linguae Aegyptiae numbers its verses by **Dévaud's** system
  and its lines by papyrus column, neither of which Gunn states. Shipped English-alone with the
  reason in the book's own front matter.
  **THE SUMMA IS THE PLATO-JOWETT CASE AND THE CTEXT CASE AT ONCE, WHICH IS WHY IT ANSWERS NO ON A
  WORK WHOSE LATIN IS EVERYWHERE** (Aug 2026). Both candidates fail, and they fail differently.
  **The freely transcribed Latin is a third of the book**: la.wikisource's Summa was measured through
  the wiki's OWN page index rather than by reading its contents pages — 423 pages under the title, of
  which 207 are questions — and it is the Prima pars complete at 119, the Prima secundae stopping at
  88 of its 114, and the Secunda secundae, the Tertia pars and the Supplementum **not begun at all**,
  their index pages being lists of red links. **Ask the wiki what it HAS rather than reading the
  index it publishes**: the Secunda secundae's contents page looks like a table of 189 questions and
  links to none of them. **And the complete Latin reserves rights in itself**: the Corpus Thomisticum
  carries the whole Leonine text of 1888, which is public domain, and every page of it closes
  "© 2019 Fundación Tomás de Aquino quoad hanc editionem. Iura omnia asservantur" over a text its own
  header describes as Roberto Busa's machine transcription re-checked by Enrique Alarcón. That is the
  Book of Rites' ctext.org finding in a stricter form — there the database had adapted a translation
  without saying which parts, here it says outright that its edition is its own and reserved — so:
  **ASK WHAT AN OBVIOUS SOURCE CLAIMS OVER THE TEXT, not only whether it has it.** A public-domain
  work carried by a database that reserves rights in its own edition of it is not available on that
  ground. Shipped English-alone with the reason in the book's own front matter, which is the
  Republic's outcome and the Divine Comedy's.
  **THE DIVINE COMEDY IS THE PROSE EDDA'S FAILURE MODE ON A FAMOUS POEM, AND THE TRAP IS THAT THE
  CANTO PAGE DOES NOT NAME ITS EDITOR** (Aug 2026). Everything about it looks ready: Italian
  Wikisource carries all 100 cantos, typed clean, with a line number at the end of every tercet, and
  the pairing against Longfellow was measured end to end and is exact — 14,233 lines a side, the same
  count in every canto, identical section lists, 4,811 tercet numbers each in the same order with no
  exception either way. **What blocks it is that the text is Giorgio Petrocchi's** — *La Commedia
  secondo l'antica vulgata*, 1966–67, and he died in 1989, so it is in copyright until 2060 where the
  term is life plus seventy. A medieval poem survives in dozens of disagreeing manuscripts and has to
  be CONSTITUTED before it can be read, and the constituted text is a modern work; that is the Prose
  Edda's rule, and here it bites on the best-known poem in Italian.
  **NOTHING ON THE CANTO PAGES SAYS SO.** Their header names Dante, leaves the curator field empty and
  tags the pages "no facing paper version"; the attribution is on the WORK-level `Opera:Divina
  Commedia` page, which lists the plain `Divina Commedia` text as "a cura di Giorgio Petrocchi".
  **Read the work page, not just the text page** — and note that **Project Gutenberg carries the same
  text**: PG 1000 was diffed line by line against these pages and is word for word identical, so a
  second source that looks independent is not one. Ask what text an unattributed transcription IS.
  **THE OTHER THREE CANDIDATES EACH FAIL DIFFERENTLY and the list is worth keeping.** Tommaseo's 1869
  edition has the perfect licence (d. 1874) and is transcribed as far as one page and an index of red
  links — the Plato-Jowett case. The 1472 *editio princeps* is free beyond argument and is an
  incunable at 25% proofread. And **Domenico Guerri's (Laterza, Bari, 1933) is the one to come back
  for**: complete, proofread against a scan, and genuinely a different constituted text rather than
  Petrocchi renamed — measured, Inferno I reads "E quanto a dir" where Petrocchi has "Ahi quanto a
  dir", "rinnova" for "rinova", "ch'io" for "ch'i'". Guerri died in 1953, so it cleared life plus
  seventy at the start of 2024; it stays under UNITED STATES copyright until 2029, being a 1933
  foreign publication restored by the URAA and running ninety-five years from publication. **That is
  the first candidate on this shelf whose limit falls in the United States rather than abroad** —
  every stated limit here runs the other way (Giles 2029, Ross 2042, Murray 2028 are all clear in the
  US and encumbered elsewhere) — so it was left for the site's owner and for 2029 rather than taken
  quietly in an importer entry. Shipped English-alone with the reason in the book's own front matter,
  which is the Republic's outcome.
  **DON QUIXOTE IS THE DIVINE COMEDY'S QUESTION ON A NOVEL, AND IT FAILS TWICE OVER** (Aug 2026).
  Spanish Wikisource carries the novel three times and every one is a fragment — the 1608 text at 16
  chapters, the 1842 and 1905 editions at 38 each, against 126 — and its own index page marks all
  three "A transcribir", still to be transcribed. That is the Plato-Jowett case. What blocks the one
  complete free Spanish is the second question: it names no editor and no edition, only its
  transcribers, and a novel first printed in 1605 survives in settings that differ, so a modern text
  of it is somebody's constituted text whether it says so or not. **Ask what text an unattributed
  transcription IS** — the Divine Comedy's finding, and it bites the same way on a work whose
  copyright expired four centuries ago. **ONE TRAP FOR ANYONE WHO COMES BACK TO THIS**: that wiki
  also carries `Segundo tomo del ingenioso hidalgo don Quijote de la Mancha`, which looks like the
  second part and is Avellaneda's spurious sequel of 1614 — a different book by an author nobody has
  identified, the one Cervantes attacks inside his own Part II. Shipped English-alone with the reason
  in the book's own front matter, which is the Republic's outcome.
  **THE PROSE EDDA IS A THIRD FAILURE MODE AND IT IS NOT A TEXTUAL ONE AT ALL** (Aug 2026): the original
  exists, states its chapter numbers outright, and PAIRS — measured against Brodeur, the Prologue 5 chapters
  to 5 and Gylfaginning 54 to 54, in order, the Icelandic chapter titles describing his chapter content at
  every point sampled. What blocks it is the LICENCE. A medieval text has to be edited from its manuscripts
  before anyone can read it, and an editor's constituted text is a modern work with a modern copyright: the
  only openly transcribed Old Norse Edda is Guðni Jónsson's (1901–1974), in copyright until 2044 and carried
  on Wikisource by permission from heimskringla.no rather than because the copyright has run out, which is
  not the ground this library serves books on. An edition whose copyright HAS expired would serve — Finnur
  Jónsson's, or the Arnamagnæan of 1848–87 — and none is transcribed on any Wikisource, on Perseus or
  anywhere else reachable (checked on the multilingual, Danish, Norwegian, German and Swedish Wikisources;
  only the German has anything, and that is Simrock's German verse of 1876, not the Old Norse). So the shelf
  now has three: one column silent (the Republic, fixable by a better transcription), both columns silent
  (Aesop, not fixable at all), and **a column that speaks and may not be quoted** — which puts it with the
  Loeb Republic that keeps Plato's Republic out of the Dialogues. Its Skáldskaparmál would have failed
  anyway, and that is worth knowing before anyone retries: 74 chapters against 89, already apart by chapter
  20 and about sixteen apart by the end, so pairing that part by number would set passages beside passages
  that are not their counterparts. **Ask what a medieval original's EDITOR died, not only how old the work
  is.** **The Book of Documents is the case where the
  CHAPTER pairing is exact and the level below it has no key at all**: Chinese Wikisource carries every one
  of the received 58 documents, so chapter for chapter the two columns match, but Legge numbers his
  paragraphs and that transcription numbers nothing, and pairing by POSITION — the approach abandoned for
  the Meditations' Greek — puts the two divisions together in only 8 of the 58. Measured, not assumed.
  **The Book of Rites is that same case and less close still**, which is worth recording because the two
  are the same translator on the same wiki: Chinese Wikisource carries all ten of its treatises under 禮記,
  so the chapter pairing exists, and those pages number nothing whatever — one book runs to 57 of Legge's
  numbered paragraphs against 35 Chinese ones, another to 64 against 20. One trap there for a later
  attempt: that index carries several pages TWICE under simplified and traditional titles (大传 beside
  大傳, 少仪 beside 少儀, 杂记上 beside 雜記上), so a chapter list built by reading it rather than by naming
  the pian wanted picks up duplicates of books it already has.
  **THE ONE QUESTION THAT DECIDES WHETHER A BOOK CAN HAVE AN ORIGINAL AT ALL** is not "does a text of it
  exist?" but **"does that text say which section each passage is?"** — because app.js pairs the two columns
  on the section NUMBER, never on paragraph or list order. **And the number need not be the unit the
  edition is DIVIDED into, nor even an integer** — see the Nicomachean Ethics' fourth shape below, which
  is the case that separated those two questions. Three shapes answer yes, and all three are here:
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
  **`aesop-fables` ANSWERS NO ON BOTH COLUMNS, which the Republic does not** (Aug 2026), and it is
  the cleanest illustration of the rule because there is nothing to be tempted by. The Republic's
  Greek states Stephanus numbers and only Jowett stays silent, so the pairing fails on one side and
  a numbered English would fix it. Here NEITHER edition states anything: Townsend prints a title
  over each fable and no figure anywhere — measured, and his own index at the back files
  alphabetically by title with a page number — while the standard Greek text on Greek Wikisource is
  Chambry's of 1927, which lists **359** fables alphabetically by their Greek titles with no
  numbering at all. Two unnumbered collections of different sizes in different orders have no shared
  key even in principle, and matching them fable by fable would be several hundred judgements made
  by eye, which is the work abandoned for the Meditations' Greek. **So the shelf now has both
  failure modes side by side**: one column silent (fixable by a better transcription) and both
  columns silent (not fixable at all). The tab figures here are the printed ORDER and the front
  matter says so outright — the honest alternative to a citation system the book has not got.
  **`aristotle-nicomachean-ethics` IS THE THIRD SHAPE, and it separates two questions that had always
  been answered together** (Aug 2026): *what is this edition DIVIDED into* and *what is it CITED by*.
  Every original before it pairs on the unit its own `<div>`s carry. Bywater's Greek is divided into 10
  books and 116 numbered sections — and a section is a modern editor's paragraphing, not what anyone
  cites Aristotle by, and not what Ross's margin prints. Both editions state the **Bekker page** — the
  page and column of Bekker's Berlin edition of 1831 — and Bywater states it as a **milestone standing
  inside the prose** (`<milestone unit="page" resp="Bekker" n="1094a"/>`) rather than as a division. So
  the pairing runs on the milestones and the section divisions are simply concatenated, which is what
  `layout: "paged"` → `teiPagedBooks` does. **Measured before it was believed, over all ten books: 181
  Bekker pages in the Greek, 173 in Ross, and every one of Ross's 173 present in the Greek** — nothing on
  the English side that is not on the Greek, which is the direction that would signal a misread. Of the
  eight the Greek has and Ross does not, **five are the page a BOOK BEGINS IN THE MIDDLE OF** (Bekker's
  pages run continuously while the book divisions fall where they fall, so 1109b ends Book II and opens
  Book III and the Greek marks it in both), and **three are the casualties of three repeated marks** in
  the transcription — 1138a, 1142b and 1170b are each marked twice, in each case where the page the Greek
  states next is missing. The obvious reading is that the second of each pair is a slip for its neighbour;
  it is still an inference about somebody else's printed page, so the forward-only guard drops the repeat,
  the material folds into the page already open, and the Greek's page draws beside an empty cell. **Three
  rows out of 181, recorded rather than repaired** — correcting them would be composing an apparatus,
  which is what the Meditations' Greek was abandoned for.
  **THE PAIRING KEY IS THEREFORE NOT ALWAYS THE MARKER'S OWN TEXT**, and that is a change in app.js as
  well as in the importer: `1094a` and `1094b` are two different places, and `parseInt` collapses them
  onto one section 1094, merging the pair into a single row and taking the ordering with it — the quiet
  kind of failure, since the prose is all present and only the pairing is wrong. So the importer writes
  an explicit **`data-n` sort key** beside the text the marker prints (`1094a` → 10940, `1094b` → 10941),
  `stripTags` carries that attribute through exactly as it carries a footnote marker's `data-fn`, and
  `bookSections` reads it in preference to the text. **A marker with no `data-n` is read exactly as it
  always was**, which is what keeps all seven earlier books byte-identical — verified by re-running the
  Symposium end to end and diffing, since the extractor is shared.
  **`herodotus-histories` IS THE FIFTH SHAPE AND THE CLEANEST PAIRING ON THE SHELF** (Aug 2026): a work
  divided into BOOKS of numbered CHAPTERS, each divided again into sections — which is the commonest
  shape in ancient prose, and the one the shelf had somehow not met. "Herodotus 1.32.4" is book, chapter,
  section. **Measured over both editions before any of it was believed: 1,578 chapters on each side, the
  same numbers in the same order in all nine books — nothing missing on either side, no duplicates.**
  Only the Art of War's facing-page edition does better, and it does so by construction. The finer
  SECTION level is deliberately not the pairing unit: there are 4,338 on each side and **nine chapters
  number them differently** (1.1 opens on a section the English calls `pr` and the Greek calls `0`; eight
  more run 1,2,4 against 1,2,3), so pairing there would have set nine chapters of the two columns beside
  passages that are not each other. Recorded rather than repaired, as the Ethics' three repeated Bekker
  pages are. Three more things it settled:
  · **A CHAPTER NUMBER IS NOT ALWAYS AN INTEGER FOR ARISTOTLE'S REASON.** 45 of the 1,578 carry a letter
    (2.121A–121F, 7.10A–10H) — an editor's way of numbering a passage inserted into a sequence everyone
    already cites. They are Herodotus, not apparatus: 2.121A opens the story of Rhampsinitus's treasury.
    The first cut of the reader borrowed teiSections' "a division numbered with a word is not a chapter"
    guard — right for Suetonius's appended essays, wrong here — and **silently dropped all 45 from both
    columns, reporting a clean 1,533-for-1,533 pairing of a book missing forty-five of its chapters.**
    So they take the same `data-n` sort key the Bekker pages introduced, on a ×100 scale (121 → 12100,
    121A → 12101), and **it is written on EVERY marker in the book, not only the lettered ones**, since
    `bookSections` falls back to parsing the text where the attribute is absent and a book mixing bare
    `121` with `data-n="12101"` would be sorting two scales against each other.
  · **`<del>` CHANGES THE COUNT AGAIN, and this is the third book it has.** Godley brackets the whole of
    6.122 — the Callias passage — as spurious in his Greek while still translating it, so that row draws
    the English beside an **empty Greek cell**, which is the honest rendering and reads as one: his
    English prints the passage in square brackets, so the page explains itself. 1,577 of 1,578 pair.
  · **PERSEUS'S NAME AUTHORITY IS THIS EDITION'S QUIET FAULT** (fixed in `teiInline`, scoped to `<reg>`
    inside `<name>` — TEI's own `<reg>` is a regularized reading an editor means to be read, so a blanket
    drop would delete prose from some future edition). Its English tags every person and place against a
    gazetteer, and the tag sweep keeps the words: left alone the book's first sentence reads "the inquiry
    of Herodotus of **Bodrum [27.466,37.5] (inhabited place), Mugla Ili, Ege kiyilari, Turkey, Asia**
    Halicarnassus". 4,305 of them, nothing throws, every count healthy. Found by READING the output.
  **`caesar-gallic-war` IS THE FIFTH SHAPE A SECOND TIME, and it needed no new reader at all** (Aug 2026)
  — books of numbered chapters, both columns from Perseus TEI, `layout: "chaptered"` on each side. It is
  worth carrying for four things rather than for its shape.
  · **IT IS THE CLEANEST PAIRING TWO INDEPENDENTLY-EDITED TEXTS HAVE MANAGED HERE.** Measured over both
    editions before any of it was believed: 8 books on each side, **404 chapters on each side, identical
    numbers in identical order in every book**, no duplicates, no gaps, and not one chapter number
    carrying a letter — so none of the Ethics' or Herodotus's `data-n` trouble arises. Only the Art of
    War does better, and it does so by construction, one editor having numbered both columns at once.
    The asymmetry is in the SUBDIVISION instead: Holmes's Latin divides its 404 chapters into 2,150
    numbered sections and this English prints one paragraph per chapter and no sections at all, which is
    why the Latin column reads as several paragraphs against the English column's one. A fact about the
    two editions, not a rendering fault.
  · **ZERO IS A SECTION NUMBER, and this is the first book here to use one.** Book 8 opens on a chapter
    0 — Hirtius's covering letter to Balbus, which both editions print before chapter 1 and number apart
    from the war it introduces. Two guards read 0 as "no number": `teiBookChapters`'s forward-only check
    warned twice a run on a perfectly ordered book, and **app.js's `bookSections` dropped the chapter to
    the UNNUMBERED path**, where it paired only by luck — both columns happening to carry exactly one
    leading unnumbered block. It rendered correctly for the wrong reason, which stops being an accident
    the day a book carries a chapter 0 on one side only. Both now admit zero (`seq = -1`, `v >= 0`);
    measured over the whole shelf first, the only markers anywhere whose value is not above zero are
    this book's two, so widening the guard is provably inert everywhere else.
  · **A TRANSLATOR MAY SET A TABLE, and the flattening is silent** (fixed in `teiInline`, scoped to
    `<label>` INSIDE a `<list>`). Caesar's 1.29 is the census tablets found in the Helvetian camp, set
    by this edition as a `<list>` of `<label>`/`<item>` pairs — a people on the left, a number on the
    right. The generic sweep unwraps all three and keeps the words, so left alone the passage arrived as
    one run-on line with the table's last figure running into the sentence after it. Nothing throws, no
    word is lost, the chapter is the right length. **The scoping is the whole care in the rule**: TEI's
    `<label>` is also how a play marks WHO IS SPEAKING, and the already-shipped Symposium Greek carries
    six of those; a rule keyed on `<label>` alone would have re-set a shipped book. `<list>` occurs in
    this one English file and nowhere else on the shelf, and the Symposium was re-run and diffed
    byte-for-byte to prove it.
  · **THE LICENCE RESTS ON THE PUBLICATION DATE ALONE, which is new** — see the entry in fetch-book.js.
    Half the byline cannot be found: "W. S. Bohn" has no first name, no dates and no biography in
    anything openable, and a joint work's life-plus-seventy runs from the LAST surviving author, so that
    term cannot honestly be asserted for the translation. McDevitte (1834–1909) and Holmes (1855–1933)
    were both looked up rather than recalled, for the Hugo Magnus reason. The ground stated is therefore
    the date of publication — 1870–1872 and 1914, both pre-1929 — and the gap is named in `rights` and
    on the book's own front matter rather than rounded up. Lucretius's judgement in a second book:
    **claim less, and say on the page what cannot be said.**
  **It is a separate file from the translation on purpose** —
  together they are 2.2 MB, and a reader who only wants the English must not download the Latin to get it.
  Its `<span class="bk-n">` markers are the **section numbers**, and they are the whole point: app.js pairs the
  two texts on them (see the Library bullet).
  (~1.37 MB, **all 124 letters**, 1,065 translator notes — completed Aug 2026 on request; it was 65 and
  ~445 KB). The size is why the split exists: it is nearly as large as every eagerly-loaded file put
  together, and a visitor who never opens the book pays none of it.
