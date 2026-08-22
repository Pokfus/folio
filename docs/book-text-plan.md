# Correcting the Library's texts

**Asked for, verbatim (Aug 2026):** *"Some of the books contain spelling errors since these errors were
baked into the source material we took the texts from. We will correct them: scan the texts for errors or
inconsistencies and correct them, and mention on their About pages that such mistakes have been corrected.
Also for the Chinese texts, enforce the use of modern pinyin for all Chinese transliterations, overriding
the antiquated transliteration systems used in these old English translations. Also mention this in the
book about pages."*

That is **two passes, not one**, and the whole of this plan turns on keeping them apart. The rest of the
file is what was measured, the bar each correction has to clear, the tools, and the batches.

---

## 1. Two mechanisms, because they mean two different things

`.claude/fetch-book.js` already carries the first and its header already states the rule:

> a fix asserts **THE PRINTED PAGE READS X AND THIS TRANSCRIPTION READS Y**, which is a claim about a book,
> and it may only be made with a printed witness in hand.

That is exactly what a **transcription slip** is, and the existing `fixes: [[from, to, why], …]` table is
the right home for one. `FIX_HITS` counts firings and every entry MUST fire, so a fix that stops matching —
because the source was re-transcribed — fails loudly rather than rotting.

A **romanisation change is not that claim.** The printed page really does read `Ts‘ao Kung`; Giles wrote it,
his printer set it, and no witness anywhere says otherwise. Converting it to `Cao Gong` is Folio EDITING a
translation, which is a thing this site has until now refused to do — `check-style.js` exempts a Library book
from the BCE/CE rule and `spellTree` skips `.bk-page`, both on the stated ground that *"a book is somebody's
published translation, transcribed rather than edited"*. The change was asked for, twice, and it goes ahead;
what must not happen is that it goes ahead **through the same table**, because then:

- a count of "transcription errors corrected" silently becomes a count of editorial changes;
- the printed-witness rule is quietly weakened for the entries that genuinely need it;
- and the book's front matter can only make one statement where the reader is owed two.

So romanisation gets a **third table beside `glyphs` and `fixes`** — `roman: [[from, to, why], …]`, applied by
`applyRoman`, counted in `ROMAN_HITS`, run **after** `applyFixes` so neither count can absorb the other.
Two mechanisms, two counts, two sentences on the book's own first page.

**It is done at IMPORT, not at render.** The site's own display-time transforms (`spellText`, `unitizeText`)
are the obvious precedent and are the wrong one here: they turn on a per-word rule a reader can toggle, where
this is a per-NAME table of several hundred entries per book that would have to be shipped to every reader and
walked over 3.1 MB of prose on every chapter paint. At import the table lives in the importer, the cost is paid
once, and the shipped file is what the reader is told it is.

**THE ORDER IS LOAD-BEARING AND THE ART OF WAR PROVES IT.** `applyFixes` runs first because an unfixed
variant does not merely stay unconverted — **it converts WRONGLY, into a plausible different name.** The
book's commonest commentator is 張預, and `.claude/book-vary.js` finds the transcription spelling him four
ways: `Chang Yü` ×127, and once each `Ch‘ang Yü`, `Chang Yŭ` and `Chang Yu`. Run a `roman` table over those
three as they stand and the aspiration mark on the first gives `Chang Yu` (常, a different surname), and the
missing umlaut on the third gives `Zhang You` (the `yu`→`you` trap above) — two names that do not exist, in a
book that elsewhere reads `Zhang Yu` 127 times, with nothing anywhere to say a conversion had gone wrong.
Meanwhile the book's OTHER commentator with that syllable, `Tu Yu` 杜佑, is written 50 times and never once
with an umlaut: the transcription is right about the distinction and wrong only about three tokens.

**So `.claude/book-vary.js` is run BEFORE the `roman` table is written, on every book being converted**, and
its groups are read as candidate name variants rather than as curiosities. Whether a given variant is repaired
as a `fixes` entry (a printed witness says the page reads otherwise) or simply carried as a fourth `roman`
entry pointing at the same name (no witness needed, since the conversion asserts only what the string denotes,
which the surrounding characters settle) is decided per case — but it must be decided, because doing neither
ships the wrong name.

---

## 2. The bar

**A slip is corrected only against a printed witness.** The scan below produces candidates; a candidate becomes
a `fixes` entry when the printed page has been read and disagrees with the transcription. Where no scan of the
printed page is reachable, the candidate is **recorded here and left in the text** — the shelf's standing answer
(`homer-iliad`'s thirteen welds, `virgil-aeneid`'s ~120 l→I slips, `lucretius`'s 24 doubled vowels are all
recorded rather than repaired).

**A romanisation is converted only when it is known which name is meant, AND THAT IS A WEAKER CLAIM THAN IT
SOUNDS.** The syllable mapping is *deterministic* — Wade-Giles was built as a one-to-one system and every
apparent ambiguity is resolved by the letter after it:

| Wade-Giles | pinyin | and the rule that decides it |
|---|---|---|
| `chi` / `ch‘i`, `chü` / `ch‘ü` | `ji` / `qi`, `ju` / `qu` | palatal before **i** and **ü** |
| `cha` / `ch‘a`, `chu` / `ch‘u` | `zha` / `cha`, `zhu` / `chu` | retroflex before **a e o u** — the following vowel decides, nothing else |
| `hs` | `x` | |
| `ts`, `tz` / `ts‘`, `tz‘` | `z` / `c` | |
| `k`, `t`, `p` / `k‘`, `t‘`, `p‘` | `g`, `d`, `b` / `k`, `t`, `p` | the turned comma is phonemic, never decoration |
| `jen` | `ren` | |
| `ssŭ`, `tzŭ`, `tz‘ŭ` | `si`, `zi`, `ci` | |
| `yü` | `yu` | |
| `yu` | `you` | a *different syllable* — so dropping the umlaut, the obvious "modernise", turns one into the other |

**So the diacritics are the whole of it: strip them first and the mapping really does become ambiguous.** The
turned comma separates two consonants and the umlaut separates two vowels, and a table written against a text
whose marks had already been lost would be guessing at both. Giles prints all of them, which is why this book
can be converted at all.

**What is NOT deterministic is which READING a name takes**, and that is a fact about Chinese rather than about
Wade-Giles: 朴 as a surname is *Piáo* and not *Pǔ*, 員 in 伍員 is *yún* and not *yuán*, 罃 is *yīng*. A syllable
table cannot see any of that, and the printed characters can — so the table is written **per name**, each entry
carried by the characters the book itself prints beside it, and a name with no gloss and no independent
identification is **recorded rather than converted**. See §4 for what that verification is worth in each book;
the Art of War is the only one on the shelf where it is available from the text alone.

**The established-English-name exception is the site's own and is not re-argued here.** `docs/china-card-plan.md`
already fixes it: *pinyin, except where a non-pinyin form IS the English name (Confucius, Mencius, Taoism, the
Tao Te Ching, Peking opera, the Yangtze).* A book pass inherits that list rather than inventing one, keeps it
short, and names the exceptions it used on the book's own front matter. For the Art of War that is **Sun Tzu**
— the name the book is known by in English and the author on Folio's own shelf, so converting the text to
`Sunzi` while the shelf says `Sun Tzŭ` would be Folio contradicting itself — with the Wade-Giles breve dropped,
that being a diacritic rather than a name.

**Nothing else in the file moves.** Not the Chinese original column (`<id>.zh.js` is characters already), not
the characters Giles quotes inline, and not a romanisation of any language but Chinese.

---

## 3. The tools

Two scanners, both of which produce **evidence and never a verdict**, and both of which work with no dictionary
— there is none in this sandbox, so each book is used as its own.

### `.claude/book-scan.js <id>` — probable transcription slips

A word occurring **once** whose neighbour under one known scan confusion occurs **four times or more**.
`meaniug` sits once and `meaning` seventy-two times, so it surfaces.

**The confusion set is short ON PURPOSE, and that is the finding.** Run with an unrestricted single-letter
substitution the scan reported **369 candidates** on the Art of War, of which almost none was a slip — a
five-letter word is one arbitrary letter away from a dozen other real words (`tie`/`the`, `hot`/`not`,
`lot`/`not`). Restricted to the shapes a scanned letterpress page actually confuses — u/n, c/e, l/i, l/t,
h/b, f/t, o/c, g/q, y/v, m/n, rn/m, in/m, cl/d, li/h, ii/n — it reports **14**. Adding a dropped or inserted
letter took it back to **207**, because a shortened word reaches every shorter real word and a lengthened one
every longer one; that class is deliberately not reached, and the two shapes it would have caught are recorded
in §6 instead. **A list nobody can read through is not evidence.**

### `.claude/book-vary.js <id>` — one name written two ways

Fold every romanised form to a key ignoring case, hyphenation and the aspiration mark; report every key the
book writes more than one way. It needs no table at all — the book contradicts itself in plain sight.

**Its fold is deliberately too aggressive, and the plan says so rather than tightening it.** Stripping the
aspiration mark is what lets it catch `Yao-ch‘ên` beside `Yao-Ch‘ên`; it is also what collapses `Li Ch‘üan`
(李筌, a commentator) onto `P‘ang Chüan` (龐涓, a general), and `chêng` (正, the direct force) onto `Chêng`
(鄭, a surname) onto `Ch‘êng`. **Every group is read**; a group of two spellings of one name is an
inconsistency, and a group of two names is not.

---

## 4. What was measured

### The romanisation, per book

Only the books whose subject is Chinese are in scope. `marco-polo` carries 80 `ŭ`, 139 `ê` and 161 `ü` and is
**not** one of them: it is a European travel narrative whose romanisations are Persian, Mongol, Turkic and
Sanskrit as well as Chinese, and converting them would be a different pass with a different authority behind it.

| book | aspiration marks | diacritics | **hanzi in the English** | distinct hyphenated names |
|---|---|---|---|---|
| `three-kingdoms` | 9,917 | 9,872 | **0** | **803** |
| `book-of-documents` | 1,460 `'` | 239 | 0 | 176 |
| `journey-to-the-west` | 1,103 `'` | 0 | 0 | 115 |
| `sun-tzu-art-of-war` | 648 | 646 | **6,219** | 138 |
| `book-of-rites` | 547 `'` | 172 | 254 | ~~121~~ **218** |
| `confucius-analects` | 294 `'` | 0 | 0 | 108 |

**The last column is a PROXY and it undercounts.** It was built by sweeping for the diacritics and the
blackletter Z, so Legge's bare `Kh`/`Th`/`Ph`/`Hs` syllables — which carry neither — were invisible to it:
measured against the finished table, the Book of Rites has 218 hyphenated names rather than 121, and 483
names in all. Read every figure in this column as a floor.

**The hanzi column is what decides the order.** The Art of War is the only book on the shelf that prints the
characters beside its own romanisations — 118 of its 191 romanised forms are glossed with characters at least
once (`班超 Pan Ch‘ao`, `苻堅 Fu Chien`, `田忌 T‘ien Chi`), because Giles quotes his Chinese in his notes. Every
other book's conversion has to be verified from somewhere else: the Analects, Three Kingdoms and Journey to
the West each ship a parallel Chinese column, and the Book of Documents and the Book of Rites do not.
**That list has been wrong twice, in both directions, and each time the measurement was two commands.**
B3b found the Lî Kî's Chinese was never transcribed at the source, so its 483 names were each read off the
passage they stand in instead, which is why that batch came to more than twice the count this table
predicted; B5 then found this sentence claiming Journey to the West has no column when
`books/journey-to-the-west.zh.js` ships all hundred chapters, pairing 1:1 with the English by number.
**Check whether a book HAS the column it is planned around before sizing its batch** — the file is on
disk, and reading it is cheaper than either mistake.

Two further measurements about the Art of War, both of which shaped the tooling:

- **Only 233 of its 1,199 romanised tokens stand beside characters.** A name is glossed once and then used
  bare, so the conversion is verified per NAME and then applied to every occurrence — which is what a
  per-name table is for.
- **The turned comma `‘` is both the aspiration mark and this edition's opening quotation mark** — 599 of one
  against 49 of the other. Telling them apart is a letter on both sides, **and the letter class has to include
  `ü`, `ê` and `ŭ`**: written `[A-Za-z]` it misclassified 154 marks, among them `Ch‘üan` and `Yao-ch‘ên`,
  which are the two commonest names in the book.

### The errors, per book

`book-scan` and `book-vary` over all 48 shipped books: **1,404 slip candidates and 320 variant groups.** The
head of the list, by candidates then variants:

```
 143 121  marco-polo          54 110  three-kingdoms      21   0  plato-republic
 125   5  journey-to-the-west 49   0  virgil-aeneid       19   0  herodotus-histories
  96  17  rigveda             46   1  ovid-metamorphoses  18   1  book-of-rites
  65   4  summa-theologica    46   1  city-of-god         14   8  sun-tzu-art-of-war
  59   0  plato-dialogues     44   0  canterbury-tales     1   2  confucius-analects
  58   4  don-quixote         42   2  seneca-letters       0   0  ptahhotep
```

**Most candidates are correct English and only reading the sentence tells you which.** On the Art of War 13
of the 14 are — `paint`, `white`, `impassible`, `safely`, `wailing`, `fails`, `tying`, `tearing`, `black`,
`month`, `notion`, `befit`, `fears` all read correctly in context — and one, `meaniug`, is the slip. Budget
the pass at reading ~1,400 lines to find something on the order of a hundred.

---

## 5. Reachability — which books the machinery can already correct

`applyFixes(applyGlyphs(…))` is called at exactly two sites, both inside the **wiki chapter loop**, and the
first sits *before* the `parallel`/`interleaved`/`shloka` branch — so every wiki book is covered, parallel
books included. **TEI books and the plain-text/Project Gutenberg layouts are not**: `journey`, `boethius`,
`polo`, `bede`, `ptahhotep`, `quixote`, `chaucer` and every `source: "tei"` original call `fetchText` raw.

That is why the Art of War is book batch 1 twice over: it is a `parallel` book, so it needs no new plumbing,
and it is the only book that carries its own evidence.

Extending the machinery to the other two paths is its own batch and must be **proved inert on every book
already on that path, byte for byte** — the shelf's standing discipline for editing a shared extractor.

---

## 6. The front matter

Each corrected book gains, on its own first page, **one sentence per pass that actually fired** — never a
sentence for a pass that changed nothing, and never one sentence covering both.

> *The transcription this text was taken from carries a handful of scanning slips, and **N** of them have been
> corrected here against the printed page; they are listed in the importer.*

> *Giles romanises Chinese in the Wade-Giles system of his day. Folio prints the names in modern pinyin
> instead — `Ts‘ao Kung` is given as `Cao Gong` — except where a non-pinyin form is the English name, as
> **Sun Tzu** is. The Chinese quoted in the notes is the edition's own and is untouched.*

Recorded here rather than repaired, per book, in the batch log below: any candidate the scan raised that could
not be settled against a printed witness.

---

## 7. The batches

Each ships with its named suite green, its changelog line written and the version bumped, per the standing rule.
`test-library.js` is the suite for all of them; a book whose extractor changed additionally needs its siblings
re-run and diffed byte for byte.

| # | book(s) | what it carries |
|---|---|---|
| **B1** ✅ | `sun-tzu-art-of-war` | the `roman` table + `applyRoman` + `ROMAN_HITS`; the one slip (`meaniug`); the three spellings of 張預 folded to one; 110 names; both front-matter sentences |
| **B2** ✅ | `confucius-analects` | Legge's romanisation, **194 names** (108 estimated), verified section by section against the parallel Chinese column; six slips; the twenty book titles; `writeEnglish` gains the title pass |
| **B3** ✅ | `book-of-documents` | Legge's Sacred Books system, **430 names in 2,725 places**; the `nameMarkup` pre-pass, without which two thirds of the table is dead; two slips |
| **B3b** ✅ | `book-of-rites` | the same system and the same pre-pass, **483 names** (215 estimated) over ~2,450 occurrences, read off the passages rather than off a Chinese column; three transcription manglings; the ten chapter titles |
| **B4** ✅ | plain-text/TEI reachability | `correctRaw` wired into all 16 read sites; **24 books re-imported and byte-identical**, the 22 on the two paths plus the two wiki books that declare tables |
| **B5** ✅ | `journey-to-the-west` | the missing back-matter boundary (19 KB of index, life and publisher's catalogue cut off the last chapter); **488 OCR repairs** in two systematic confusions |
| **B5b** ✅ | `journey-to-the-west` | **83 names in 756 places**, verified against the Chinese column the plan said this book did not have; a third OCR confusion (w read as av, 63 places); the tag-crossing bug in `applyRoman` that was hiding 37% of the novel from every row |
| **B6** ✅ | `three-kingdoms` | **1,727 names in 23,369 places**, verified twice over against the parallel Chinese column; the batch absorbed B7–B8, a shared surname making 40-chapter batching incoherent; five names the printing spells against its own Chinese, and one it converts to a name the book has not got; 349 aspiration marks normalised; about forty spellings left as printed and said so on the book's own page |
| **E1** ✅ | `journey-to-the-west` | the tail B5 deferred: **261 further rows, 319 declared in all**, every remaining junk token read against its own sentence; the widened character class that found 27 more; 91 marks left and named on the book's page |
| **E2–En** | the rest of the error half | the slip and variant candidates, book by book, heaviest first — marco-polo (82 unique), rigveda (51), canterbury-tales (18), summa-theologica (15), virgil-aeneid (14); a book with no printed witness reachable contributes findings rather than fixes |

The error half of a Chinese book rides with its romanisation batch; the rest run on their own.

---

## 8. Batch log

### E1 — Journey to the West, the rest of the scan's damage, shipped 2026-08-22

**The tail B5 deferred, corrected: 261 further rows, 319 declared in all, and 0 of them dead.** B5 took
the three confusions that are systematic — `y` read as a `j` with a stray mark 468 times, `th` as `tli`
79 times, `w` as `av` 63 — and left "a tail of some 90 one-off slips and 200 stray carets" for an
E-batch. That tail is what this is. Every remaining token in the shipped text carrying a mark outside
letters, digits and ordinary punctuation was listed with its own sentence and read: **320 distinct
tokens over 375 occurrences**, sorted into eight confusion families (a caret standing for a deleted
mark, for a lost letter or for a lost space; a bullet or `■` prefixing a word; a stray comma or full
stop inside one; a digit for a letter; a backslash for `w`, `v` or `y`; `}` for `y`; and the plate
wreckage, which is not damage to the novel at all).

**A `fixes` ROW NORMALLY NEEDS A PRINTED WITNESS AND THIS BOOK HAS NONE**, which is B5's own finding and
is what sets the bar here: the Internet Archive's scan of the Cornell copy is the only transcription of
Richard's translation anywhere, so there is nothing to check a reading against. What stands in is that
each key is **a sequence that cannot be legitimate English anywhere in the book**, verified by
enumerating every occurrence of it before the row was written. Where that test cannot be met the token
is left: `af^TTcah'` sits in "I know seventy-two magic af^TTcah' outlive all kalpas" and the printed
word is not recoverable from it, so it stands as it is.

**THE ORDER IS THE WHOLE MECHANISM.** `applyFixes` is plain `split`/`join` in declared order with no
regex, so a short row placed first eats a longer row's key — `a.s` sits inside `thi.s` and `•do` inside
`•down`. The table is therefore stored **longest-first** rather than sorted at run time, and the splice
was validated before it went in: 0 duplicate keys, 0 cases of an earlier key sitting inside a later one,
and **0 idempotence violations** across all 319 rows, which matters because `correctRaw` runs twice on
this path — once over the whole raw before `extractJourney`, so a fix can unblock the running-head sweep
and the hyphenation rejoin, and again per rebuilt chapter. Four rows fire on the second pass only
(`year^`, `y^our`, `is,unsurpassed`, `Guanjiang(baptism)river.`), which is why a row that matches
nothing on the raw is not automatically dead.

**A SWEEP REPORTS WHAT ITS OWN FILTER CAN SEE.** The first pass wrote 248 rows and the importer reported
every one firing — and a widened character class then returned **27 word-like tokens more**, because the
class had not held `*` or `«` and a slip whose only damage was one of those was invisible while sitting
in plain prose. Seven of the 27 are not damage at all: this printing marks its own footnotes with a
trailing asterisk, so `Shakyamuni*`, `moon,*` and `Holy*` are the edition. Thirteen are the second wave.
`Keligion*` is the one that had to be told apart from both — the asterisk is the printer's and stays,
the `K` for `R` is the scanner's and goes. **Widen the class before concluding a sweep is finished.**

**What is left is 91 marks over 139 places and is named on the book's own page**: the wreckage around the
illustration plates' captions and the ornament with it, a few page numbers the scan dropped into the
prose, and a handful of names damaged past recovery. Nothing shared moved — `fixes` is per book and
`journey-to-the-west.zh.js` was not rebuilt — and the run reports **319 rows, 0 `DID NOT FIRE`**.
`test-library.js` 333/333.

### B5 — Journey to the West, shipped 2026-08-21

**A missing back boundary and 488 OCR repairs, and the batch was SPLIT because the names themselves are
damaged.** This book was planned as a romanisation batch and could not be done as one: Richard's
`Kwanyin` occurs 108 times and `Kwanj'in` seven more, so a `roman` table written against the shipped text
would have converted the healthy spellings and walked past the damaged ones — leaving a book in which one
name in fifteen is still in the old system and looks like an oversight rather than a scan fault.
**Repair the transcription before editing the translation**; the romanisation is B5b.

**THE LAST CHAPTER RAN ON INTO THE INDEX, AND THE MEASUREMENT THAT SHOWS IT IS A RATIO AGAINST THE BOOK'S
OWN SIBLINGS.** `extractJourney` had a front boundary and no back one, so chapter 100 carried a plate, the
volume's index, a life of the translator, a bibliography and the publisher's 1913 catalogue — 39,388
characters against a median chapter of 2,402, a ratio of **16.4**. That figure means nothing on its own,
this being a book whose chapters are condensed to a few hundred words apiece with eleven translated at
length; what makes it a fault rather than a long chapter is that **the other seven plain-text and HTML
books end within 0.8–1.1 of their own medians**. After the cut the chapter is 21,041 characters at a ratio
of 8.3, inside the range of the eleven Richard renders in full (the longest is 26,578) and consistent with
this file's existing note that chapter 100 carries the `[outline.]` mark and is the longest in the book.
**19,152 characters dropped**, counted and printed on every run.

**THE CUT IS AT THE FIRST THING THE PRINTING ITSELF NAMES, WHICH IS `INDEX` AND NOT THE PLATE ABOVE IT.**
Four blocks of back matter sit between the last line of the novel and that word — some 190 characters of
scan dirt and a plate's caption — and the only anchor above the caption is the smudge the plate's page
number came out as (`3^^`). A boundary written on a smudge stops matching the day anybody re-scans the
volume, and here that failure is silent and total: the whole index goes back into the chapter with nothing
thrown. So the residue ships and the book's own front matter says so, which is this shelf's standing
answer — **anchor a boundary on something the edition states, never on what the scanner made of it.**

**THE TWO CONFUSIONS GIVE OPPOSITE ANSWERS, AND ONLY ENUMERATING EVERY OCCURRENCE SAYS WHICH.** The scan
reads **y as a j with a stray mark after it** — `j'ou`, `verj"`, `j^ears`, `thej-`, `maj*`, `journej%` —
417 times, and swept over the whole novel **not one of those sequences is legitimate English**, so the
substitution is provably lossless (both line-end `j-` cases are *equally* and *my*, so de-hyphenation is
unharmed). It reads **th as tli** 71 times, and there the blanket rule is WRONG: `outline` occurs 75 times
because `[outline.]` is Richard's own mark for a chapter he condensed, with `settling` and `outlive`
besides. So the `tli` rows are keyed on the letter that follows (`tlie`, `tlii`, `tlia`, `itli`) and four
single words are spelled out. **A confusion that is safe as a blanket and one that is not look identical
until both are counted.**

**BARE `j` IS DELIBERATELY UNTOUCHED** — 628 legitimate occurrences — and a tail of some 90 one-off slips
and 200 stray carets is left for an E-batch and named on the book's own page.

**A MEASUREMENT IN THIS LOG WAS WRONG AND IS CORRECTED HERE (found in E1).** It read: "`book-scan.js`
over the shipped file returns two candidates and both are false positives (`saving`, `bearing`), which
is the book-as-dictionary method saying, correctly, that what is left is singletons." It returns **98**
at this batch's own commit and **93** at B5b's, and no parameter setting and no book on the shelf
reproduces that pair — so the figure was not a measurement of anything. The conclusion it was offered
for is right for a different reason, which E1 then measured properly: what is left is singletons
because `book-scan.js` compares a book against the shelf's own vocabulary and cannot see a token that
is not a word at all, which is what nearly all of this book's damage is. **A number quoted in a log is
load-bearing for the next batch that reads it** — re-run the tool rather than recalling the figure.

**Nothing shared moved**: `extractJourney` serves this book alone, `endAt` and `fixes` are per-book, and
`books/journey-to-the-west.zh.js` is byte-identical (`c331d6bb…`), so the translator's repairs cannot
reach the facing original. `test-library.js` 333/333.

### B3b — the Book of Rites, shipped 2026-08-21

**483 names in 2,454 places, three transcription manglings, no new machinery at all.** The same Sacred
Books romanisation as the Book of Documents, on a book more than twice the size, and every stage the
last batch built — `unwrapNameMarkup`, the page-marker heal, the italic-transparent splitter — read it
unchanged. What the batch is worth carrying for is the two ways the NAME TABLE was wrong before a line
of it ran.

**THE BOOK HAS NO PARALLEL CHINESE COLUMN, AND THIS PLAN SAID IT DID.** §4 sized the batch at 215
names on the strength of a column that was never transcribed at the source, so every reading here had
to be settled from the passage it stands in instead — which is slower per name and is why the finished
table is 483. **Ask whether a book HAS the column it is planned around before sizing its batch**; the
same sentence also promised one for Three Kingdoms, and that one should be measured before B6 rather
than after it.

**AND THE TABLE'S OWN BUILD WAS BLIND TO A WHOLE CLASS OF NAME.** It keyed on the diacritics and the
blackletter Z — which is what §4's proxy column keys on too — so Legge's bare `Kh`/`Th`/`Ph`/`Hs`
syllables, carrying neither, were never collected: `Khung` for 孔, `Ming Thang` for 明堂, `Sze` for
both 泗 and 司, `Khien` for 乾, `phin` for 品. Twenty-seven rows and a further 127 occurrences, found
only by a SECOND sweep keyed on the digraphs. **A name table built by one signal is a name table with
one blind spot**, and nothing reports it: the run said 456 of 456 and every declared row fired.

**THE EDGE GUARD REFUSES A ROW THAT ENDS AGAINST A LETTER, which is why one cyclical day fired and
its twin did not.** `(<i>K</i>iâ-)` was taken and `(<i>K</i>î-)` was dead, and the difference is
entirely in what follows the closing bracket: `𝖟` for one, the `m` of `mâo` for the other. A row has
to run past any letter that follows it, so the dead one is declared as `(<i>K</i>î-)mâo`. Note the
corollary the same guard imposes: **a stem ending in a hyphen can never be a row on its own**, the
hyphen itself being an edge character — hence `nêi-<i>kh</i>in` declared whole.

**THREE NAMES WERE MANGLED BY WHOEVER TYPED THE VOLUME UP, AND NO WARNING CAN REPORT ONE.** A digit
`3` standing in for the blackletter Z (`3in`, `3ze-khun`); a `4` for the â of `Hsiâ`, which the
passage settles by naming it between Yu and Yin, so it is 夏; and `Зung->fcing`, letters that spell
nothing, which the note's own gloss "all bright" and its season of the west identify as the Ming
Tang's western apartment 總章. Each was read off its passage and written out; each would otherwise
have shipped as a well-formed word that is not a word.

**A NAME MAY ALSO BE PINYIN-SHAPED AND STILL WRONG.** `Kû-lü` was first declared as `Zhulü`, which is
not a syllable Mandarin has — three passages ("duke Khâo of Kû-lü", "duke Ting of Kû-lü") identify the
state as 邾婁, so it is Zhulou. **Check that a conversion's OUTPUT is a word**, not only that its input
was matched.

**THE CHAPTER TITLES NEEDED NO SPECIAL HANDLING.** They go through `applyRoman` like any other text,
so the ten Legge headings a reader meets on the chapter bar were declared as rows rather than edited
into `LIKI`: Tan Gong, Jiao Te Sheng, Shizi, Qu, Nei. **AND THE SUBTITLE DOES NOT** — it lives in the
registry, not in the text, so it was still `The Lî Kî` after every name in the book had been
converted, with the book's own front matter three lines away saying `Li Ji`. Fixed here, **and in the
Book of Documents too**, which shipped a fortnight earlier with the same gap (`The Shû King` over
prose reading `Shu King`). Running the check across the SIBLING is what found it.

The three books that declare `roman` were re-imported forced and are byte-identical, with
`plato-republic` as the never-declares-it control.

### B3 — the Book of Documents, shipped 2026-08-21

**430 names in 2,725 places, two slips, one new pre-pass.** Legge's Sacred Books romanisation, the
same system the Analects uses, and the batch was re-cut to one book: the Book of Rites is B3b.

**THE WHOLE OF THE DIFFICULTY IS THAT `applyRoman` RUNS ON THE RAW WIKI PAGE AND THE ROWS WERE
WRITTEN AGAINST THE OUTPUT.** A name that reads `Kâu` on the finished page is four or five elements
on the wiki, and until they are unwrapped no row can see the name at all — the table opened at 396 of
430 and every dead row was a name the markup had cut in half. `unwrapNameMarkup` is the answer,
gated `nameMarkup: true` and reported per run, and it has to handle four separate shapes:

- **A LETTER MARKED UP AS BLACKLETTER IS STILL A LETTER.** Legge sets a few consonants in a
  blackletter face and the wiki spells that `<span style="line-height: 50%;"><span lang="en-Latf"
  class="blackletter">Z</span></span>`, sometimes with a `<style>` block or a dedupe `<link>` between
  the two. 62 of them, 58 wrapped and 4 bare.
- **A TOOLTIP MAY CARRY INLINE MARKUP, so its content class cannot be `[^<]*`.** The wiki glosses
  almost every name with its own modern pinyin — `<span class="wst-tooltip" title="Qiāng"><i>K</i>iang
  </span>`, 703 of them — and the first version forbade the `<i>` inside, which is precisely where the
  italicised consonant lives. That one change took the table from 396 to 427.
- **…AND IT MAY WRAP A SPAN, AND MAY WRAP ANOTHER TOOLTIP.** Seven wrap a letterspaced or
  small-capital run, so the pair is closed BALANCED rather than non-greedily — the rule this file has
  now met four times. And one glosses a day of the cycle as a whole and marks its second half `[sic]`
  inside that same gloss, so the inner tooltip survives the outer unwrap verbatim and the name is
  still split: the pass repeats until the page holds none, which on this book is two.
- **AND A LINK IS THE ONE NO ANCHORING CAN WORK ROUND.** `applyRoman` treats markup as OPAQUE and
  rewrites only the text between tags, so a row can never span a `</a>` — and this wiki hyperlinks a
  state, a word or a character wherever one is named. `<a title="w:Rui (state)"><i>Z</i>ui</a> is
  referred` offers a row nothing but the bare name, with every word of context on the far side of a
  tag, and the bare name is a homophone of another the book also carries. **Three names shipped wrong
  for that reason alone** — 芮 Rui twice as *Chui*, 窮 Qiong once as *Jiong* — and 伯冏 Bo Jiong shipped
  with its markup intact. The anchors are unwrapped and their text kept, **except a footnote
  marker's**, whose href is what `cleanBody` writes `data-fn` from. 1,814 links.

**A `title` ATTRIBUTE IS EVIDENCE AND NOT AN ANCHOR.** The obvious fix for the three homophones is to
key a row on the wiki's own identification (`title="w:Rui (state)"><i>Z</i>ui`), and it cannot work:
that string is inside a tag, which `applyRoman` never rewrites. It is still the best evidence there
is for WHICH entity a name refers to, and it is what the three disambiguations were checked against —
read it, then anchor on the prose the unwrap has just made contiguous.

**STRIPPING `<style>` BEFORE THE TOOLTIPS BREAKS `cleanBody`'s SLICE** — chapter 2 came back at 0
characters — so the `lead` prefix that absorbs a dedupe link belongs on the blackletter rules and not
on the tooltip one.

**Deliberately unchanged:** `Kwei-kî` keeps its faithful `Gui Ji`. The wiki's own `title="[sic]"`
marks a slip in the PRINTING (癸巳 guǐsì), and silently correcting a printed slip belongs to `fixes`,
which needs a printed witness. Also `Lü`, `Sui`, `Shun`, `Han`, `Liang`, `Yang`, `Min`, `Nan`, and the
period's own English (`Corea`, `Pekin`, `Cochin-China`, `Ko-ko-nor`). The English interjection `Ho!`
is 14 of the book's 84 `Ho`s and must never change, so the 49 Chinese ones are anchored on the word
before them and the 21 hyphenated ones on the hyphen.

**The eleven documents with no section numbers are the edition's own** and are unchanged.

**Proved inert byte for byte** on the Art of War, the Analects, the Book of Rites and the Republic —
the pre-pass is per-book gated, and the Republic is the check that it cannot reach a book that never
declares it.

### B2 — the Analects, shipped 2026-08-21

**194 names, 671 occurrences, six slips, and the twenty book titles.** Every declared row fired
(`194 of 194`), all six fixes applied once each, the Chinese column came out **byte-identical** to the
shipped file and the 499 section numbers are unchanged. The plan's §7 estimated 108 names; the real figure
is 194, because a name in this edition is very often a two-word phrase that has to be romanised whole.

**A BOOK-LEVEL WITNESS CHECK GIVES FALSE PASSES, AND SECTION-LEVEL IS THE REAL VERIFICATION.** B1 checked
each candidate row against the characters printed in the same CHAPTER; on a book of twenty chapters and
499 numbered passages that is far too coarse, and it passed `Chang → Zhang` in books 15 and 17 on the
strength of a 張 elsewhere in those books when the actual occurrences are 鄭 (Zheng). Both columns split
cleanly on their own section numbers — 20 books of matching counts — so every one of the 671 hits was
checked against the characters printed beside it **in its own section**. Five hits legitimately have no
character behind them and are named in the importer: at 14.22, 15.2 and 18.1 Legge supplies a name the
Chinese does not print, and at 19.14 and 19.15 the English names Tsze-hsia where the Chinese names 子游.

**THE TRANSCRIPTION IS PURE ASCII, WHICH IS WHY THIS BOOK NEEDS `fixes` WHERE THE ART OF WAR NEEDED ONE.**
Legge distinguishes his syllables with circumflexes and breves and this transcription carries none of
them, so distinct names collapse onto one spelling — and a collapsed spelling is what a wrong reading
hides behind. Five of the six fixes are one family: the transcription prints **Yen** for 冉 at 6.3 (twice),
6.10, 7.14 and 11.25, where the same pages print **Zan** for the same disciple a sentence away and the
Chinese beside them settles it. The sixth is `Ch'i K'ang` for `Chi K'ang` at 14.20, whom the book names
correctly everywhere else. Each is justified twice over — by the page's own spelling and by the Chinese —
which is the bar a `fixes` row has to clear.

**A COLLAPSED SPELLING IS FIXED BY A CONTEXT ROW, NOT BY A WIDER WITNESS LIST.** Four spellings cover two
characters apiece and each is separated by naming the phrase rather than the syllable: `songs of Chang` →
Zheng (鄭) against `friend Chang` → Zhang (張); `city of Pien` → Pian (騈) against `Chwang of Pien` → Bian
(卞); `Hsien asked` → Xian (憲); `Chi cannot` → Qi (杞) against the ordinary Ji (季). The bare rows they
replace were deleted rather than left beside them — a row that can never fire is a claim the text does not
bear out, and `Chwang` became exactly that the moment `Chwang of Pien` shadowed it.

**A CHAPTER TITLE IS ON THE ROMANISATION'S OTHER SIDE, and it was for the first run of this batch.** The
apply chain runs on the page body, and a title comes from the contents page or the chapter head — set at
some eighteen `chapters.push` sites — so the twenty tabs still read Hsio R., Pa Yih and Wei Ling Kung over
prose that had been converted throughout. It is fixed at **`writeEnglish`, the single choke point every
branch returns through**, and gated on `BOOK.roman`, so it is structurally inert for every book with no
table; proved inert byte for byte on `sun-tzu-art-of-war` (whose titles are English) and on
`machiavelli-prince` (which has no table at all). Six of the twenty then convert for free from the name
rows, those six being people; the other fourteen are declared as WHOLE title strings, because taken apart
Le, Jin, Shu, Han, Wei and Kung are ordinary syllables that occur all over the book under other characters.

**FOUR THINGS WERE FOUND AND DELIBERATELY LEFT, each recorded rather than repaired.** Book 8 prints
**Meng Chang** for 孟敬子 where every other book prints Mang for 孟 — a variant of the edition's own,
not a scanning slip. At 14.19 Legge romanises 僎 as **Hsien**, a reading modern dictionaries do not agree
with, so it stays as printed. The edition prints **關睢** for 關雎, and at 20.1 it prints 履 where Legge
supplies **T'ang** in the English. Three further collapses are harmless and are noted so a later pass does
not read them as faults: 子游 and 子羽 are both Tsze-yu, 曾 and 臧 are both Tsang, 丘 and 求 are both
Ch'iu.

### B1 — the Art of War, shipped 2026-08-21

**110 names, 1,338 occurrences, one slip.** Every declared row fired: `romanised 1338 name occurrence(s)
into pinyin across 110 of 110 declared names`, and `fix applied 1x`. The Chinese column came out
**byte-identical** to the shipped file, which is the assertion that matters — `applyRoman` runs on the raw
page and both columns are cut from it, so an original that moved would mean the pass had reached the
edition's own Chinese.

**THE TABLE IS PER NAME AND NOT PER SYLLABLE, and that is the finding to carry into B2.** Wade-Giles →
pinyin is mechanical at the level of the syllable — the apostrophes and the breves are nearly the whole of
it — so a syllable table is the obvious implementation and it is wrong: which READING a character takes is
not derivable from the romanisation, and Giles's own spellings are not internally consistent either. Every
row here is therefore carried by the characters the edition prints beside the name, and where the edition
prints none the name was left alone. Two forms are kept as they stand because a non-pinyin spelling IS the
English name — **Sun Tzu** and the **Tao Te Ching** — and the breve is dropped from the first rather than
the name being converted to Sun Zi.

**ORDER IS LOAD-BEARING: `applyRoman(applyFixes(applyGlyphs(h)))`.** An uncorrected variant does not merely
stay in Wade-Giles — it converts into a plausible DIFFERENT name, which is the quiet failure this whole
pass exists to avoid. 張預 is printed three ways in the transcription (`Chang Yü` ×127, `Chang Yu` ×1,
`Chang Yŭ` ×1); each is a row of its own and all three land on `Zhang Yu`. **The plan's §7 said four
spellings and there are three** — corrected above.

**EVERY ROW MUST FIRE, AND EIGHT CANDIDATES WERE DROPPED BEFORE SHIPPING BECAUSE THEY DID NOT.** Three
matched nothing at all (`Hsiao Ho`, `Wu Ti`, `Ssŭ-ma Ch‘ien` — the book names them some other way), and
`T‘ai P‘ing Yü Lan` matched nothing because Giles cites that encyclopedia as `Yü Lan` alone, 69 times.
Three more were no-ops (`Sun Wu`, `Yang Han`, `Wu Huo` are already pinyin). A dead row is not harmless: it
is a claim about the text that the text does not bear out, so `ROMAN_HITS` pushes a warning for one and the
count in the run's own report is what says the table still describes the book.

**THE CACHE IS WHY THE FIRST RUN REPORTED `0 of 110`.** `.claude/book-cache/` had been filled by the
baseline run, and a cached chapter is `continue`d past the whole apply chain — so the import succeeded,
rewrote both files and romanised nothing, with no error anywhere. **Re-run with `--force` after any change
to `glyphs`, `fixes` or `roman`**; the cache holds the extracted prose rather than the fetched page.

**The slip is a slip rather than a reading**: ch. 5 n. 17 reads `meaniug` where the printed page reads
`meaning` — an n taken for a u by the scanner, in a word the same note spells correctly three lines above.

The two front-matter sentences are written per PASS THAT ACTUALLY FIRED, never one per pass declared: a
book whose `fixes` table is empty gets no sentence about slips.

---

### B4 — plain-text/TEI reachability, shipped 2026-08-21

**The chain ran at two sites, and both of them were inside the wiki loop.** `applyRoman(applyFixes(
applyGlyphs(unwrapNameMarkup(h))))` was spelled out where a wiki page comes back from the API and nowhere
else — so a book on the **TEI** path or the **plain-text/HTML** path could declare a `roman`, `fixes`,
`glyphs` or `nameMarkup` table, and nothing whatever would fire. No error, no warning: the tables are
per-book and every pass early-returns on a book that has not declared one, so an undeclared table and a
declared-but-unreachable one look identical from every direction. The next two romanisation batches are
both on those paths — B5 is `journey-to-the-west`'s OCR (`layout: "journey"`) and B6–B8 is
`three-kingdoms` — so the gap had to be closed before either could be written rather than found by
writing one.

**The composition is now spelled once, as `correctRaw(t)`**, and wired into **all sixteen** places a
book's raw English is read: six on the TEI path (`perChapter`, `drama`, `kanda`, `satyricon`,
`chaptered`, and the generic branch that carries `verse` and the Dialogues), eight on the plain-text and
HTML path (`journey`, `boethius`, `polo`, `bede`, `ptahhotep`, `quixote`, `chaucer`, `tablets`), and the
two wiki-loop sites, which become a call to the helper rather than the composition written out.

**IT RUNS AFTER THE CACHE IS READ AND NEVER BEFORE IT IS WRITTEN.** The two paths cache differently — the
wiki path caches the EXTRACTED prose per chapter, which is why it needs `--force` to re-run the
extractor, while these cache the RAW file (`en-tei.xml`, `en-text.txt`, `en-page.html`, `en-vol<N>.html`)
and re-extract on every invocation. Correcting on the way IN would bake a table's output into the cache,
so a corrected row would need a network round trip per chapter to take effect and a withdrawn one could
never be withdrawn at all. Correcting on the way OUT means the cache stays the source's own bytes and a
table edit is picked up on the next run.

**IT IS THE ENGLISH SIDE ONLY.** `originalChapter` is untouched, so a translator's romanisation table
cannot rewrite the Chinese, Latin or Greek facing it — which is what would happen the moment a `roman`
row's left-hand side occurred in the original's own script. An original that genuinely needs a table of
its own would want one declared on `O` rather than inheriting the translation's; that is a gap rather
than a decision, and nothing needs it today.

**Marco Polo takes the helper through a `map`** (`extractPolo(vols.map(correctRaw), warn)`) rather than at
an assignment, because its two volumes are read in a loop whose cached and fetched branches both push
onto one array — correcting at the push sites would have meant two calls and a chance to update one of
them later and not the other.

**THE INERTNESS IS STRUCTURAL FIRST AND MEASURED SECOND, and the structural half is the stronger of the
two.** All four passes return their argument unchanged unless the current book declares the matching
table (`!BOOK.nameMarkup`, `!BOOK.glyphs`, `!BOOK.fixes`, `!BOOK.roman || !BOOK.roman.length`), and
enumerated mechanically over the importer's own table, **not one of the 22 books on the two paths
declares any of the four** — the only four books on the shelf that do are the Art of War, the Analects,
the Book of Documents and the Book of Rites, and all four are wiki books whose two sites now call a
helper with the same composition, in the same order, that was written out at them before.

**Measured anyway, because that is the standing discipline for editing a shared extractor: 24 books
re-imported with `--skip-original` and every one byte-identical.** All 22 on the two paths —
`suetonius-twelve-caesars`, `sophocles-antigone`, `sophocles-oedipus-rex`, `euripides-medea`, `ramayana`,
`satyricon`, `caesar-gallic-war`, `herodotus-histories`, `lucretius-nature-of-things`,
`ovid-metamorphoses`, `homer-iliad`, `homer-odyssey`, `virgil-aeneid`, `plato-dialogues`,
`journey-to-the-west`, `boethius-consolation`, `marco-polo`, `bede-history`, `ptahhotep`, `don-quixote`,
`canterbury-tales`, `epic-of-gilgamesh` — plus `book-of-rites` and `book-of-documents` with `--force`,
which are the two books that actually have something to lose: both came back byte-identical AND still
report every declared name firing, 483 of 483 in 2,454 places and 430 of 430 in 2,725.

**SATYRICON WAS MISSING FROM THE FIRST ENUMERATION, AND THE REASON IS WORTH KEEPING.** The books were
listed with a regex over the importer's own table anchored on `^  "([a-z0-9-]+)": {` — every entry is
quoted except that one, which is a bare `satyricon:`, so it was silently absent from the path list and
would have been the one TEI branch never re-run. **A regex over a source file is an inventory of what the
file's formatting happens to be, not of what it contains**; the second pass allowed the key to be
unquoted and the count went 47 → 48.

**It ships no changelog line and no version bump, deliberately.** The two go together by the golden rule,
and a changelog line is reader-facing wording about what changed for the user — here, provably, nothing:
every book on the shelf is byte-identical to what shipped before it. What this batch buys is that B5 and
B6–B8 can be written at all.

---

### B5b — Journey to the West, the romanisation, shipped 2026-08-21

**83 names in 756 places, and the batch is worth reading for the bug it found rather than for the
table.** B5 split this book in two because the names themselves were damaged — repair the
transcription, then edit the translation — and this is the second half.

**THE PLAN SAID THIS BOOK HAD NO FACING COLUMN TO VERIFY AGAINST AND THE PLAN WAS WRONG.**
`books/journey-to-the-west.zh.js` is the received Ming novel, complete, and it pairs 1:1 with the
English by chapter number, so a proposed `[englishForm, hanzi]` pair can be tested: the Chinese
chapters matching the English chapters that carry the form have to carry the characters.
`Kwanyin` occurs in 112 places in the English and 觀音 in 113 in the Chinese, which is as close as
two independent texts of one novel come. **That test is decisive for a name of two or more syllables
and worthless for a single one**, which any common character would pass — so the asymmetry is what
draws the line, and the bare single syllables are left exactly as Richard set them (Chang, Chu, Ku,
Sim, Ssu, Hoh, Kiang, Teng, Kwoh, Yen, Tai Shan). The Sanskrit names are not Chinese and are left;
`Pusa` and `Pu Sa` are already pinyin. Six proposals were re-probed and dropped rather than shipped:
Tung Ming is 通明 and not 東溟, Shang Liang is the man 相良 and not a roof beam, Pi Lan is 毘藍
(×18) and not 毗藍 (×0), Tsui Ju is 崔珏 and not 崔玨, Kwanchow is 灌江, and `Ki Pusa` is not a
name at all — the name is Ling Ki 靈吉. Three rows rest on the translator's own glosses rather than
on the column (Sianfu, Shansi, Szechuan).

**A TAG PATTERN THAT ASSUMES WELL-FORMED MARKUP HID A THIRD OF THE NOVEL FROM EVERY ROW, AND
NOTHING ANYWHERE SAID SO.** `applyRoman` treats markup as opaque so that a row can never rewrite an
href or a class, and it did that with `/(<[^>]*>)|([^<]+)/g` — exact on a wiki page, where every `<`
opens a tag and the next `>` closes it. This book is a machine reading of a printed page with no
markup at all, and ten stray `<` characters of scanner's noise: each paired with the next `>`
hundreds of thousands of characters away, so **213,130 of the book's 574,507 characters — 37% of the
novel — were handed back as one opaque "tag"** and every row inside them died. The table reported 428
conversions where the text held 727 and nine of the 83 rows matched nothing, with the book complete,
every count healthy, and the only symptom a name still in Richard's spelling.

It took **two** constraints to close, and the first alone was not enough: a real tag contains no `<`
**and never spans a line**. Bounding on `<` still let the `<` at character 157,660 pair with a `>`
83,000 characters later, because no other `<` stood between them, so a third of the swallowed text
stayed swallowed. A `<` that opens no tag is now matched by the text branch and passed through as the
character it is, rather than being dropped on the floor by an alternation that can match neither way.
**Inert on the four books already on this path by construction rather than by a re-run** — measured
over all 1.8 MB of their cached pages, not one of their 20,206 tags contains a newline and not one
carries a `<` that would have been paired across another — and the Analects and the Art of War were
re-imported and came back byte-identical anyway.

**AND THE CORRECTION CHAIN HAS TO RUN TWICE ON A READER THAT REBUILDS BROKEN WORDS.** `correctRaw`
runs on the raw and must: the running-head sweep and the paragraph rejoining both read the text, so a
confusion left standing there changes which lines are recognised as furniture. But the raw is
hard-wrapped at the printed measure and hyphenated across the wrap, so a name the wrap has broken is
invisible to every row — `Tai Chung-` at the end of one line and `through` at the start of the next is
not the string any table is written against, and `extractJourney` is what puts the halves back
together. **Eighteen names of 756 shipped in the old spelling for that reason alone**, each with every
count healthy. The chain now runs again over the rebuilt chapter, which is safe because it is
**idempotent, measured rather than assumed**: no `roman` row's output is matched by any `roman` row,
and no `fixes` row's output contains any `fixes` row's input, so the second pass can only reach what
the first could not see. It found 129 further corrections as well as the eighteen names.

**A THIRD SYSTEMATIC OCR CONFUSION WENT IN WITH IT: w read as av, 63 places.** Enumerated over the
whole book before a row was written — 42 distinct forms in 69 occurrences, of which **eleven are
legitimate English in capitals** (SAVED ×3, SAVES ×2, CAVE ×2, HEAVEN ×2, SAVING, SHAVES) and 36 forms
in 58 occurrences are damaged. The eleven are excluded by NOT BEING NAMED rather than by a rule, which
is the only honest way to exclude a word that is spelled the same as the fault. The table runs before
`roman` because four of the recoveries are names the pinyin table is keyed on (`Ching KAvan`,
`Chu AVu Neng`, `AVu Tang`, `AVutai`). Three further rows are a lost space that hides a name
(`Kwanyinand`, `Pa Kieiis`, `Tai Chungthrough`), found by a systematic sweep of what the boundary
regex was refusing rather than by eye.

**The Chinese column lost 644 characters and that is a correct removal, recorded rather than
reverted.** Re-importing the original dropped 161 characters from each of four chapters (5, 6, 7, 9),
and the removed text is in every case the wiki's own public-domain licence banner — page furniture the
original reader is meant to drop, which those four pages happened to carry. Suppressing a correct
removal to keep a diff tidy is the wrong call.

The book now carries **617 corrections** in all — y as j 468, th as tli 79, w as av 63, p as j 4, and
three lost spaces — and 756 romanisations across all 83 declared rows, with no old form surviving
anywhere in the shipped text and every declared row firing.


---

### B6 — Romance of the Three Kingdoms, shipped 2026-08-22

**1,727 names in 23,369 places, and it absorbed B7 and B8 rather than running as three batches.** The
plan cut this book into forty chapters at a time on the assumption that a table can be built and shipped
per third. It cannot: **a Chinese surname is shared, so the rows are not partitioned by chapter.** Ts‘ao
is 曹 in every chapter it appears in, and a table built over chapters 1–40 and shipped would convert Ts‘ao
Ts‘ao and leave a dozen later Ts‘ao of the same clan spelt the old way — a book in which one name in ten
is in the old system, which is exactly the failure B5 split Journey to the West to avoid. So the whole
table was built at once and the batch is one.

**THE PAIRING IS THE PLAN'S OWN AND IT HELD.** `books/three-kingdoms.zh.js` is the Maos' recension,
120 chapters against 120, so every proposed `[englishForm, hanzi]` pair is testable: the Chinese chapters
matching the English chapters carrying the form have to carry the characters. What is new here is that
**one score is not enough**, and the reason is the whole difficulty of this book.

**A WADE-GILES SPELLING MAY ALREADY BE CORRECT PINYIN FOR A DIFFERENT CHARACTER, AND CONVERTING IT
CORRUPTS THE NAME.** `Ma Chao` is 馬超 and Chao is already the pinyin of 超; read as Wade-Giles it converts
to Zhao, which is a different man of a different clan. The same holds for Ma Teng 騰, Shen Pei 配, Wen Chou
醜 and the place 武昌 Wuchang. So every candidate is scored **twice** against the Chinese column — once as
its Wade-Giles reading and once as its own letters read as pinyin — and ships only where the Wade-Giles
reading wins outright (`wg >= 0.8 && wg > py`). Beside that sits a blunter rule: **a bare single syllable
that is itself a legal pinyin syllable is held**, eighteen forms in all, because a single common character
passes any frequency test — B5b's asymmetry finding, met on a book where it is a corruption risk rather
than merely a weak signal. A held syllable is still converted inside a disambiguated two-word name, so
`Chao Yun` ships as Zhao Yun while bare `Chao` does not.

**THE BATCH'S CENTRAL FINDING IS ABOUT WHERE A RESIDUE SWEEP IS RUN.** `applyRoman` is one alternation
over the RAW page, so **a row keyed on a string that only exists in the converted output can never fire**
— and five rows were exactly that, because the sweep that proposed them had been run over the shipped
English rather than over the source. `Nancheng`, `Shangkui`, `Nantun`, `Sishui Kuan` and `Chuan I` are all
products of an earlier row, not inputs to a later one. **The fix is to retarget the PRODUCING row, never to
add a second row after it**: `["Nanch‘êng", "Nanzheng"]` rather than `["Nancheng", "Nanzheng"]`. The
extractor's own dead-row warning is what found them, which is the argument for that warning existing.

**AND FOUR NAMES ARE SPELT IN THIS PRINTING AGAINST THE CHINESE IT IS PRINTED BESIDE.** The printing
aspirates where the character is unaspirated — `Nanch‘êng` for 南鄭, `Shangk‘uei` and `Shangk‘ui` for 上邽,
`Nant‘un` for 南頓 — and writes `Ch‘uan` for `Ch‘üan` 全, **which the transcriber himself flags with a
`{{SIC}}` tooltip**. Converted as printed each would give a place or a person that occurs nowhere in the
book. The Chinese column decides, and the book's own front matter says so rather than leaving a reader to
find a spelling no other edition has.

**THREE REGIMES OF RESIDUE DETECTION, AND ONLY THE THIRD IS SOUND.** Searching for the signature
characters (`‘ ĕ ê ŭ ũ ū`, and `ü` outside l/n) is blind to plain-ASCII Wade-Giles; searching for
pinyin-impossible letter runs is blind to Wade-Giles that happens to spell a legal pinyin syllable. What
works is that **a token is residue iff it segments as Wade-Giles and its conversion differs from itself** —
applied, per the finding above, to the source and not to the output. After the run the shipped English
retains no Wade-Giles mark at all: the only signature tokens left are `Lü` and its inflections, which is
呂 correctly spelt, and the English word `mêlée`.

**THE ASPIRATION MARK IS SET TWO WAYS AND FIFTEEN GLYPH ROWS WERE DECLARED ON A MEASUREMENT THAT WAS
WRONG.** A first pass reported 270 ASCII apostrophes doing the mark's work and a table was written for
them; every one of the fifteen rows was dead, and the extractor's dead-row warning said so on the first
run. Re-measured, the scan sets the mark as `ʻ` U+02BB and `‘` U+2018 and in no third way — one row, 349
occurrences. **Re-measure rather than carrying a count forward**, and note that the second half of the
finding is the same warning paying twice in one batch.

**U+2018 IS ALSO THE OPENING QUOTE, so a row's leading edge cannot simply be a word boundary.** The mark
is the same character in `Ts‘ao` and in `‘Wait!’`, so the edge is two lookbehinds and a turned comma counts
as part of a word only where a letter precedes it. Swept afterwards, the 167 signature tokens the text
still carries are 161 opening quotes and six real words.

**MARKUP IS OPAQUE TO A ROW, AND THIS TRANSCRIPTION SPLITS NAMES THREE WAYS.** A two-word row cannot cross
a tag; a `{{SIC}}` tooltip and a template's inline `<style>` block sit inside a name; and a
`wst-largeinitial` drop capital splits the first letter off the word that opens a chapter — 116 of those,
seven of them names. Hence `nameMarkup: true` (1,852 tooltip spans, 478 links and 2,334 style-dedupe links
unwrapped), the page-marker move (11) and the drop-capital unwrap, all of them running before the rows do.
**The same three improvements corrected three names in Journey to the West** that had been split by markup
and were silently walking past its table — `Pa</p><p>Kiei` and `Pa <br> Kiel` now reading Bajie, and
`Lo <br> Kia Shan` reading Luojia Shan — which is the argument for re-running every sibling on the path
rather than only the book in hand.

**A BLACKLETTER WARNING FIRED ON A BOOK THAT HAS NONE.** The unwrap counts what it did and warns when it
did nothing, which is right for the Book of Documents and the Book of Rites and wrong for every other book
on the path, where zero is the expected answer. Gated behind a per-book `blackletter: true` rather than
silenced.

**THE UPSTREAM CHINESE HAS DRIFTED AND THE ORIGINAL WAS REVERTED.** A run made without `--skip-original`
regenerated `books/three-kingdoms.zh.js` and picked up two changes made at Chinese Wikisource since the
book was imported: an editorial variant gloss `一作「景」` now sits **inside chapter 15's prose** three
times, and chapter 81's 范彊 has become 范疆. The gloss in the prose is a regression whatever its merits,
and the Chinese column is not this batch's subject, so the file was put back to what shipped. **Run a
romanisation batch with `--skip-original`**; the original half is a separate path and needs no refetch to
prove an English-side change.

**Sibling inertness**: all five books already on the `roman` path — `sun-tzu-art-of-war`,
`confucius-analects`, `book-of-documents`, `book-of-rites`, `journey-to-the-west` — were re-run with
`--force --skip-original` and are md5-identical to what shipped, so the shared changes above are proved
inert rather than assumed to be.

**Three smaller lessons.** The book cache holds POST-extraction chapters, so there is no raw page to
inspect after a run and the run's own report is the authority on what the source contained; to read the raw
markup you must ask the API for `prop=text`, since `prop=wikitext` on a `Page:`-transcluding chapter returns
only the transclusion stub. A CJK character typed from memory into a script is unreliable — 趙彥 and 段煨
were both mistyped, the third time this has happened — so take the codepoints out of the source text
instead. And a 429 from Wikimedia has two meanings: usually the robot policy refusing curl's default user
agent, and occasionally genuine rate limiting, which the body distinguishes and which needs a backoff loop.

**A DECLARED ROW CAN SHIP A WRONG PINYIN, AND ONLY THE OUTPUT SHOWS IT.** `["Shunyü", "Shunyu"]`
converts 淳于, whose pinyin is **Chunyu** — so the row fired, the run reported it firing, no warning
was raised, and eight places in the book carried a surname the language has not got. The row's
right-hand side is the one thing nothing in the pipeline checks: the extractor counts what fired and
the Chinese column is consulted when a row is *written*, never afterwards. What found it was a sweep
of the **shipped English** for tokens that cannot be segmented into legal pinyin syllables — the
right residue test for an output, where a Wade-Giles sweep returns 404 false positives because
already-converted pinyin is full of WG-legal strings. The same sweep found that the printing spells
the surname three ways (`Shunyü`, `Shunyu`, `Shun-yu`) and that only one of them had a row at all.
**Sweep the output for impossibility, not the source for a system.**

**ONE SPELLING CAN BE TWO DIFFERENT NAMES, DISTINGUISHED ONLY BY CHAPTER.** `Kung-ming` is 公明
(Gongming, Xu Huang's style) in chapters 13 and 69 and 孔明 (Kongming, Zhuge Liang's) in chapters 90,
93 and 102. A `roman` row is one branch of one global alternation, so it cannot express that at all,
and matching it against the declared `["K‘ung-ming","Kongming"]` on stripped diacritics — which is
what a residue adjudicator naturally reaches for — says "Kongming" and is wrong for two fifths of the
occurrences. It is held and named in the book's own front matter rather than converted. **A residue
token that matches a declared row is a hypothesis, not a verdict: read every context before accepting
one.** Two others failed the same test in the same pass — `Tu-yu` is an office and not Du Yu, and
`Jun-An` is the reign name 永安 Yong'an rather than the place Runan, which is what `["Junan","Runan"]`
would have made of it.

**THE RESIDUE IS STATED ON THE BOOK'S OWN PAGE RATHER THAN CHASED TO ZERO.** After the sweep and a
second pass of forty-two rows the tail is about forty spellings in some fifty-five places, of
23,369 conversions — a place named once in a translator's note that the Chinese column never names,
a word the scan has garbled past reading (`Hsui`, in "said King Hsui, with a Hsui"), and the two-men
style above. Each was looked at; none can be checked against anything, and a name with nothing to
check it against is a name that would be guessed at. The front matter says so in those words.

**A RAW DUMP OF THE CHAPTER BODIES IS NOT THE SOURCE.** Three tokens in the shipped book had no
counterpart in the scratch copy of the raw chapters and read as conversion products — the corruption
hazard this batch is built to avoid — and all three are in the translator's **notes**, which the dump
excluded and the extractor does not. Check what a scratch artefact actually holds before reading an
absence as evidence.
