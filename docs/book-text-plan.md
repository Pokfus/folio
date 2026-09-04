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
(`homer-iliad`'s thirteen welds, `virgil-aeneid`'s l→I slips, `lucretius`'s 24 doubled vowels are all
recorded rather than repaired). **That l→I figure was an estimate of ~120 and is now a measurement:
28 forms and 37 occurrences across six books, 14 of the forms in the Aeneid** — see the E4 entry.

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

**AND THE COUNT CAN BE WILDLY LOW, WHICH E5 FOUND THE HARD WAY.** `book-scan` gives the Canterbury Tales
44 candidates; the batch shipped **151 repairs**, because the damage there is not the class this scan looks
for. A slip scanner reads TOKENS, so it cannot see a quotation mark set as a pound sign, a ligature set as
two letters, or a line the reader dropped altogether — and those were nine tenths of that book's trouble.
**Run the non-ASCII character census beside `book-scan`** (count the characters a transcription uses that
are neither ASCII nor its own curly quotes and dashes); it is two lines, needs no judgement, and on that
book it pointed straight at every passage a reader could not read.

**Most candidates are correct English and only reading the sentence tells you which.** On the Art of War 13
of the 14 are — `paint`, `white`, `impassible`, `safely`, `wailing`, `fails`, `tying`, `tearing`, `black`,
`month`, `notion`, `befit`, `fears` all read correctly in context — and one, `meaniug`, is the slip. Budget
the pass at reading ~1,400 lines to find something on the order of a hundred.

---

## 5. Reachability — which books the machinery can already correct

`applyReFixes(applyFixes(applyGlyphs(…)))` is called inside the **wiki chapter loop**, *before* the
`parallel`/`interleaved`/`shloka` branch — so every wiki book is covered, parallel books included.
**`reFixes` joined the chain in E6** — a regex `fixes`, for the repairs a split/join cannot express —
and it runs AFTER `fixes` so a hand-written passage row pre-empts a general sweep.

**THIS SECTION SAID THE PLAIN-TEXT AND TEI LAYOUTS WERE NOT, AND THAT IS NO LONGER TRUE.** It named
`journey`, `boethius`, `polo`, `bede`, `ptahhotep`, `quixote` and `chaucer` as calling `fetchText` raw;
each was wired into `correctRaw` as its own batch reached it, and measured again in Sep 2026 **all seven
now call it** — `polo` through `vols.map(correctRaw)`, the rest directly on the raw. What is left off the
chain is a `source: "tei"` ORIGINAL. Re-measure before believing this paragraph: it went a year out of
date without anything failing, because a book with no `fixes` table cannot tell you whether it would be
corrected if it had one.

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
| **B6b** ✅ | `three-kingdoms` | the second pass's 527 candidates, **462 of 483 romanisations shipped and 21 struck out** after each was checked against the printing rather than taken on trust; the table goes **1,727 → 2,100 names in 24,741 places**; the page-turn join, which found **six** split names and not two; the TemplateStyles block that was hiding a chapter head from every row; **sixteen chapter titles corrected**, among them Cao Pi, Sun Quan, Xiaoyao Ford and Guan Yunchang; and an editorial variant tooltip glued into the Chinese of this book and of Journey to the West |
| **E2** ✅ | `marco-polo` | the error check; **no words changed, and that is the finding** — for a scholarly edition the aggregate test is weak and the independent scan is the poorer witness; the `✛` revision mark identified and explained on the About page |
| **E3** ✅ | `rigveda` | **52 slips**, every one anchored in the Internet Archive's scan of the same 1896 second edition before it became a row; the `layout: "sukta"` branch wired into `correctRaw`, without which the table was inert |
| **E4** ✅ | `ramayana`, `don-quixote` | **ten slips corrected and two false corrections refused**, every one read against a scan of the same translation; the page-IMAGE route, for the four places where the witness's own text layer repeats the error; and the measured no-witness records for the Aeneid, Plato and the Summa |
| **E5** ✅ | `canterbury-tales` | **151 repairs in 75 rows** — far the worst-damaged text on the shelf, and the damage is not the letter slips the batch went looking for: **eight pages printed straight and scanned askew**, where the reader dropped and transposed whole lines; the **opening quotation mark read as a pound sign** on 59; the **AE ligature read two wrong ways**, `iE` and `/E`, which made King Aella unreadable thirteen times; two full-page plates whose signature and dirt were set down mid-sentence; 40 dropped words restored |
| **E6** ✅ | `canterbury-tales`, and a change to shared machinery | **355 quotation marks put back in 6 rows**, and the class was three times what E5 estimated: the opening quote is misread SIX ways, not one — `c` 227 times, `*` 61, `4` 40, `f` 15, `{` 6, `<` 6. The `reFixes` table (a regex `fixes`, same assertion, boundary-aware) is the machinery, proved inert on the nine books already declaring `fixes` |
| **E7** ✅ | `canterbury-tales` | **119 more repairs — the possessive and the closing quotation mark, both cleared to zero.** A possessive apostrophe was dropped or mangled on 73 lines in three shapes (`God s sake`, `the Knight' s Tale`, `Saint Peter’ s sister`); the closing quote was read as a slash on 43, and the slash stands for TWO characters, not one — the comma or full stop AND the quote beside it. Three one-off strays went with them, each witnessed on the SECOND scan of the same edition |
| **E8** ✅ | `canterbury-tales` | **62 repairs, and a tool.** The second scan is queried in BULK — anchor on the words around a suspicious token, score candidate positions by the words that follow, print what the other copy has between the same two words: 221 candidates, 191 located. The finding is that this edition SPACES its `;` `!` `?` `:` as a house style and does not space its comma (10,944 attached to 40), so 59 commas were put back on their own words. A census over tag-stripped HTML first reported 22 phantom errors that were Folio's own `bk-n` markers |
| **E9** ✅ | `canterbury-tales` | **71 repairs, and a character that stands for three marks.** A lone figure `1` appears 66 times: before a lowercase word it is the pronoun (37), before a CAPITAL it is an exclamation mark after a bare word and an OPENING QUOTE after a full stop, colon, dash or closing quote (21) — two rules and seven read exceptions cover every one. It also fixes the limit on the second-scan witness: that copy's OCR discards the asterisk rows this one keeps, so it answers *what is this mark* and never *is there a mark here* |
| **E10** ✅ | `canterbury-tales` | **27 repairs, decided by MEASUREMENT.** With the second scan unable to witness an absence, the strays were classified by their bounding boxes in the page XML, and they fall into three populations that do not overlap: 121×6 or 61×7 is a RULE the edition prints at a break (kept, set as a dash); 20–47 wide by 57–67 tall is the wide space after a full stop, boxed as though it were a glyph (nothing is there); under 20×14 is a speck. The apostrophe family is excluded whatever it measures |
| **E11** ✅ | `canterbury-tales` | **21 repairs, using the book to check itself.** A word broken open is found by joining the lone letter to the fragment and scoring the result against THIS text's own vocabulary (`H`+`ow` 619 to 6). It is a proxy: it also proposed joining `a bout` in 'cannot stand a bout', which the second scan shows is the printing, and the join would have been grammatical and wrong. The second class — a letter standing for another word (`m` for `in`, `y` for `by`, `l` for `I`) — no frequency test can see |
| **E12** ✅ | `canterbury-tales` | **17 repairs, and the batch was small because it was COUNTED first.** The spaced full stop is 31 occurrences in the raw and six units of work: twelve are the plate list's leader dots and eleven the back matter's `( Sh . T.)` keys, neither of which the extractor puts in a chapter. The rest are mangled runs, two of them a heap of marks where the page prints one closing quote. Nine marks are left, three of which are a correct `—,` both copies read |
| **E13** ✅ | `canterbury-tales` | **6 repairs, every one cropped out of the page image and read**, the second scan being unable to align to a run it garbles differently. Two are punctuation the scan flattened and both change the sentence (a colon, a question mark); one is a closing quote lost while its neighbours survived; three are nothing, and each a different kind of nothing — a line break, SHOW-THROUGH from the facing page, and a reader's PENCIL down the margin. It also corrects a figure E12 estimated rather than measured |
| **E14** ✅ | eight books | **42 repairs, and it UNBLOCKS the two E4 wrote off.** The capital I and the lowercase l are the same stroke, so an OCR writes `Iooked` for `looked` and `househoIds` for `households` — `virgil-aeneid`'s 22 unrepairable candidates are this class exactly, and eight of `plato-dialogues`' fourteen. Inside a word no witness is needed (no type sets one there); at the start the book's own vocabulary decides. It proposed six CORRECT readings — `Io` the nymph, `Io Pæan!`, the Gnostic `Ieu` — all excluded by name |
| **E15** ✅ | five books | **6 repairs, and a rule that applies BEFORE the work: a substitution family is safe exactly where the wrong spelling is a NON-WORD.** E14's capital-I yield was ~100% because a capital mid-word never is one; the same sweep for `rn`/`m` proposed thirteen and SEVEN were right as they stood (a `dose`, papers `torn`, the city `Homs`, archaic `doth`, Old French `corne`), and `cl`/`d` got all three wrong. It also claimed to close `summa-theologica`'s `corning` — **and that claim was wrong; see E19**, which found the row could never fire |
| **E16** ✅ | eight books | **23 repairs in the family E15 predicted would pay** — a digit inside an English word is a non-word. It runs BOTH ways (`0ceanus`, `1ndra`, `k9ew`, `equa1`; and Suetonius's `[i6th March]` where the letter stands for the digit), and the legitimate cases name themselves (`1ff`, `8vo`, `1274bb`). Its lesson is that **a row carrying context carries its source's SPACING**: written first with the Canterbury Tales' double spaces, 22 of 23 were dead |
| **E17** ✅ | six books, in shared machinery | **193 spaces inserted at a citation's element boundary, and not one other byte changed in sixteen rebuilt books.** Perseus encodes a cited work as an element and leaves no whitespace at its edge, so unwrapping welds it to the prose (`Cf. Laws638 B`, `302has said`, `betweenἔρωςand`). THE FIRST DIAGNOSIS WAS WRONG and is recorded: the missing space is in the SOURCE, not eaten by our tag-strip — an abbreviation keeps its space only because its full stop sits outside the element. So it is a FLATTENING rule in `teiInline`, not a book's `fixes` table: sixteen books read this source |
| **E18** ✅ | `plato-dialogues.grc` | **13 citations restored, and the rule is SELF-VERIFYING.** Perseus ran a beta-code converter over references that were already in Latin script, so Plato's Greek cited the Iliad as `ηομ. ιλ. 14.291` — Greek letters spelling nothing. The same `<bibl>` carries the right form on its `n=` attribute, so the repair decodes the text and writes the attribute in ONLY where the two match: 42 genuinely Greek `<title>`s cannot pass that test. One is a PREFIX match and keeps its extra reference |
| **E19** ✅ | five books, and a fault in the machinery | **A CORRECTION ROW ADDED TO A CACHED WIKI BOOK DID NOTHING, AND NOTHING SAID SO.** `correctRaw` ran only on the fetch path, so a row met the page only when `--force` was passed — and its own comment promises the opposite. The Book of Documents shipped the same emperor title as `Tî` 25 times and `Di` 69, by which chapters happened to be cached. Fixed, proved byte-for-byte over the whole shelf, and the run now says which kind of dead row it is reporting. Plus 15 repairs to Plato and the Summa, closing E4's last two deferrals |
| **E20** ✅ | six books | **10 repairs from 78 candidates, and E19's table is what said where to look.** Every candidate in the seven cleanest books read in full: Thucydides' nineteen were ALL correct (place names, `hods`, `hove`, `waives`), and the yield came from the others — `haye`, `goverment`, `continuallly`, `Archaeans`, `faired-haired`, `inflecting`/`inflected`, and two LOST SPACES (`andvice`, `[Isay]`) that no confusion-family sweep would have named. `Lede` for Leda is DEFERRED: it is in Perseus's file and the Greek is Λήδην, so it wants a printed witness |
| **E21** ✅ | six books | **40 repairs, 30 of them in the Summa** — 2.5 million words whose candidate list had never been read. Its 245 are mostly the book's own LATIN, which no rarity test can tell from a typo; what was left is 30 slips, each a single occurrence against hundreds of the correct form. Three findings: **a TRANSPOSITION is two edits and was invisible** to E19's sweep (`creatuers`, and ten more across the shelf); **one error finds another** (three `no` for `not`, which no sweep can see, all found by reading round a neighbour); and **the filter that made the list readable hid a real error** (`Wheather`, an inserted `a`) |
| **E22** ✅ | three books | **30 repairs, 26 of them in Three Kingdoms** — which E19's table called the FOURTH CLEANEST book on the shelf and which turns out to be the most damaged text yet swept (`afaid`, `attck`, `broher`, `flooor`, `speeech`, `twefth`). **A low noise rate is not a low error rate**; it only means the list is worth reading. The other four are what E21's filter hid: widening the confusion set by the two missing vowels returned 42 candidates across nine already-swept books, of which three in the Summa and one in the Odyssey are damage — and TWO would have destroyed archaic quotations |
| **E23–En** | the rest of the error half | 45 marks left in the Canterbury Tales and six of `plato-dialogues`' candidates, all inside runs needing a leaf read; `summa-theologica`'s `inproportionate`; and the books below them; a book with no printed witness reachable contributes findings rather than fixes |

The error half of a Chinese book rides with its romanisation batch; the rest run on their own.

---

## 8. Batch log

### E22 — what the filter hid, and the next tier's worst book, shipped 2026-09-04

**30 repairs across three books.** E21 ended by saying the unfiltered candidate list is where the next
pass starts; this is that, plus the next book down E19's noise table.

**FIRST, WHAT THE FILTER HID, AND IT IS LESS THAN IT LOOKED.** E21 found `Wheather` sitting outside the
list it had read, because an inserted `a` is not one of the declared confusion classes. Running the
sweep with **no** filter at all returns **524 candidates for the Summa alone**, which is not a work
list — it is dominated by trailing apostrophes, the book's Latin, and ordinary singular/plural pairs.
So the gap was measured precisely instead: widen the class by **exactly the two missing vowels**, `a`
and `o`, and read only what that admits. **42 candidates across the nine books already swept**, of
which **four are damage**: `realations`, `monaster` and `Whosever` in the Summa, and `Achaens` in the
Odyssey — **the same word E20 repaired as `Archaeans`, damaged a second way**.

**TWO OF THE 42 WOULD HAVE DESTROYED ARCHAIC QUOTATIONS, and that is the finding worth keeping.**
`Trubled` in the Summa is not a slip for `troubled`: it is inside *"Trubled gost is sacrifice of God"*,
quoted from the Prose Psalter of **A.D. 1325**. `abegging` in Plato is not a slip for `begging`: it is
*"there came Poverty abegging"*. A vowel is the most plausible thing for a scanner to drop and also the
most plausible thing for a 14th-century scribe to spell differently, so **the vowel class has a lower
signal-to-noise ratio than the consonant classes by its nature**, not by accident. It is worth running
and worth reading slowly. `throughly` in the Odyssey was left for the same reason — Murray's
translation is deliberately archaic and never uses `thoroughly` at all.

**SECOND, AND THE BULK OF THE BATCH: THREE KINGDOMS.** E19's table put it at 14.7 candidates per
100,000 words, the **fourth cleanest** on the shelf. It is the most damaged text yet swept: **26
slips**, every one a single occurrence against dozens or hundreds of the correct form — `afaid`,
`alredy`, `appintment`, `attck`, `broher`, `callected`, `creft` for cleft, `destoy`, `flooor`,
`forgotton`, `inhabiants`, `neccessary`, `preprations`, `prepard`, `puled`, `rcentre`, `readly`,
`repart`, `reponse`, `speeech`, `sticken`, `spead`, `teror`, `togther`, `twefth`.

**THE RULE THIS SETTLES: a low noise rate is not a low error rate.** The rate says how much of the
list will be foreign words and proper names; it says nothing about how much of the rest is damage.
Thucydides at 9.8 returned nineteen candidates and no repairs; this book at 14.7 returned eighty-two
and twenty-six. **The table says where reading is cheap, not where reading is unnecessary.**

**AND ONE ERROR FOUND ANOTHER AGAIN**, for the third batch running: *"He **send** a **repart** of his
misfortune"* carries two faults in four words, and only `repart` is a non-word — `send` for `sent` is
a good word in the wrong place that no sweep here can name. It is written as the row AFTER `repart` on
purpose, since it anchors on the corrected spelling.

**`repart` IS ALSO E15's `scorning` TRAP, MEASURED.** The book uses **`repartee` three times**, and a
bare substring row would have written `reportee` in all three, silently, while the report said one fix
applied. Every row here is boundary-anchored, which is why it did not.

**The proof.** Three books rebuilt. The Odyssey is **+1 byte**; Three Kingdoms is **+10**, which is
exactly the sum of its twenty-six repairs' own length changes; and every changed line in all three —
25, 3 and 1 — was read and is one of the rows.

### E21 — the biggest book on the shelf, and what its errors led to, shipped 2026-09-04

**40 repairs across six books, 30 of them in the Summa Theologica** — 2.5 million words, the largest
thing Folio serves by a wide margin, and a book whose candidate list had never been read.

**MOST OF ITS 245 CANDIDATES ARE ITS OWN LATIN**, which is E19's noise rule seen from the inside: the
Summa sits at 9.7 candidates per 100,000 words, near the CLEAN end of that table, and still returns a
long list simply because it is enormous. `accidens`, `agens`, `actio`, `conditio`, `conjunctio`,
`ambitione`, `De Celebratione missae`, `Ex opere operato`, a hundred more — every one a real citation
and none of them tellable from a typo by any rarity test. **The rate normalises for size; the list
still has to be read.**

**What was left is 30 slips, and every one is a single occurrence against hundreds or thousands of the
correct form in the same book** — `Obejection` against 20,617 `Objection`, `thut` against 42,487
`that`, `countrary` against 4,881 `contrary`, `sats` against 7,194 `says`. That ratio is what settles
them; no scan was opened for any of it.

**THREE FINDINGS, and each is about the instrument rather than the book.**

**1. A TRANSPOSITION IS TWO EDITS, SO THE ONE-EDIT SWEEP WAS BLIND TO IT.** `creatuers` for `creatures`
turned up by eye, in the same clause as `primaily`. A transposition sweep was written and run over the
shelf, and it is **higher precision than the one-edit sweep**, because a swap of two adjacent letters
that lands on a word the book uses constantly is very rarely a coincidence: `substnaces`, `subsistnet`,
`gaint` for giant, `sieze`, `cheiftain`, `solenm`, `siezed`, `emnity`, `battels`, `kindgom`,
`strenghten`, `afroe`. Eleven more repairs across five other books, all of them non-words.

**2. ONE ERROR FINDS ANOTHER, AND THE SECOND IS OFTEN INVISIBLE TO EVERY SWEEP HERE.** Reading round
`substnaces` produced *"We are **no**, however, accustomed to say Three substances"*; reading round
`primaily` produced *"**Wheather** names predicated of God are predicated primarily of **cretures**"* —
**three faults in one heading**. `no` for `not` is a perfectly good word in the wrong place and no
vocabulary measure can ever name it; three of them are repaired here and all three were found by
standing next to something else. **The neighbourhood of a known error is the best-yielding place to
look**, and it costs nothing once you are already there.

**3. THE FILTER THAT MADE THE LIST READABLE HID A REAL ERROR.** E19's sweep proposed 295 candidates for
Plato, which is not a work list, so E20 and this batch read a version filtered to declared confusion
classes — an inserted or dropped `i l n m r e t u c`, or a substitution from a named set. `Wheather`
is an inserted **`a`**, so it was in the unfiltered 295 and not in the list that was read. **A filter
that buys legibility spends precision**, and the honest way to say what this batch did is: every
candidate in the FILTERED list was read, and the unfiltered one is where the next pass should start.

**One is deferred, and one is deferred for a reason worth stating.** `graps` in Journey to the West —
*"some purple fungus of immortality, some jade **graps** and Immortal Pills"* — is certainly damage,
and has TWO plausible readings: `grapes` (a transposition) and `grass` (the immortals' 瑤草 is a real
item in that banquet). The book uses neither word elsewhere, so its own usage cannot choose, and a
witness is wanted. And the Summa's *"it was also established that **there several** real relations in
God"* is missing a word, not carrying a wrong one: the clause is ungrammatical and the parallel three
words later supplies the repair, but **inserting a word is a stronger claim than repairing a
non-word** — the printed Benziger page might read that way — so it stands, recorded.

**The proof.** Six books rebuilt: five changed by one to four single-word runs each, read individually;
the Summa by 24 lines, every changed word one of the 30 rows. Nothing else on the shelf moved.

### E20 — the cleanest books' candidates, read in full, shipped 2026-09-04

**10 repairs across six books, from 78 candidates read one by one.** E19 ended with a table of the
sweep's noise rate per book and the claim that it is an instrument for a book you have reason to
suspect; this is that table used. The seven books at the clean end of it — the Odyssey (9.0 candidates
per 100k words), Thucydides (9.8), Caesar (10.5), the Analects (10.9), the Ethics (11.2), the Book of
Documents (12.2) and the Republic (12.6) — return 78 candidates between them, which is a list a person
can read.

**THE YIELD IS 13%, AND THE 87% IS THE INTERESTING PART.** What the sweep proposes and a reader
refuses is a catalogue of what looks wrong and is not: proper names the shelf has never met
(`Anthene`, `Glauce`, `Istone`, `Treres`, `Pele`, `Nanzi`, `Milo`, `Pero`, `Thon`), archaic English
that is exactly right (`refusest`, `hove in sight`, `for want of hods`, `waives these his
privileges`, `previsions`, `careen them`, `larding the plain`, `lyes`, `stingers`, `chines`), an
editor's surname (`Burnet`, `Allen`), and a French sentence in a footnote (`Selon les anciens
documents`). **`Thucydides' nineteen candidates are ALL of that kind — not one repair in the book**,
which is the honest outcome a sweep should be able to produce and the reason a measure like this can
never be run unread.

**TWO OF THE TEN ARE A KIND NO EARLIER BATCH COULD HAVE FOUND: A LOST SPACE.** `andvice` in the Ethics
(*"for virtue andvice respectively preserve and destroy"*) and `[Isay]` in Caesar (*"Adcantuannus,
[Isay] endeavoring to make a sally"*). E14, E15 and E16 each hunted a declared character confusion,
and two words run together is not one — it only shows up when you ask which words are rare and near
something common, which is what E19's sweep does. **They are also the two the eye skips**, since a
run-together pair still reads as a word.

**`[Isay]` IS E16's RULE PAYING FOR ITSELF A SECOND TIME.** The row was written round the brackets,
matched nothing, and the reason is in the source: it reads `[<name>Isay</name>]` — **Perseus's own
tagger read the run-together words as a proper name**, which is itself the tell — so the tag stands
between the bracket and the word. Anchored on the token alone it fires. A row carrying context carries
its source's markup as well as its spacing.

**THE OTHER EIGHT are settled by each book's own usage rather than by a scan**: `Archaeans` against
114 correct `Achaeans`; `faired-haired` against 19 `fair-haired`; `inflecting` and `inflected` — the
SAME CLAUSE, twice — against 3 `inflicting` and 5 `inflicted`; `haye`, `goverment` and `continuallly`,
which are non-words; and the Analects' `Shau-yang`, the one name in that book still carrying Legge's
own spelling while `Boyi`, `Shuqi` and `Zilu` stand beside it in the same sentence — a romanisation
row found by an error-track sweep, which is worth noting because the two passes are otherwise separate.

**ONE IS DEFERRED AND IT IS THE RIGHT KIND OF DEFERRAL.** The Odyssey reads *"And I saw Lede, the wife
of Tyndareus"* where every English text writes **Leda**. But the word is in Perseus's file, the Greek
is Λήδην, and `Lede` is a defensible transliteration of Λήδη — so the book's own usage cannot settle
it (Leda appears nowhere else) and **only Murray's printed page can**. No witness is reachable, so it
stands, recorded.

**The proof.** Six books rebuilt and each diffed at the byte: the Ethics changed by one `y`→`v` and one
inserted space, the Book of Documents by one inserted `n`, Caesar by one space and two `e`→`i`, the
Odyssey by a dropped `ed` and a dropped `r`, the Republic by one dropped `l`, and the Analects by one
line. Nothing else on the shelf moved.

### E19 — a correction row that did nothing, and nothing said so, shipped 2026-09-04

**A fault in the importer, four books silently uncorrected, and 15 repairs that close the last two
things E4 wrote off.** It began as a small batch — Plato's remaining slip candidates — and turned into
the machinery when the Summa's new row refused to fire.

**THE FAULT.** On the per-chapter wiki branch, `correctRaw` is called on the FETCH path and nowhere
else. A chapter read from cache goes straight into the book, so **a correction row added to a book
whose chapters were already cached does nothing at all** until somebody passes `--force`. And
`correctRaw`'s own comment promises the opposite in as many words: *"a row added or corrected in this
file is picked up on the very next run."* True on the TEI branches, which correct after reading their
cache. False on every per-chapter wiki book, which is most of the shelf.

**WHAT IT COST, MEASURED.** Four books were shipping half-corrected, and the shape is the worst
possible one — not an error left standing, but the SAME WORD SPELLED TWO WAYS in one book, by the
accident of which chapters happened to be in the cache when the row was written:

| book | before | after |
|---|---|---|
| `book-of-documents` | `Tî` 25 × **and** `Di` 69 × | `Di` 71 ×, `Tî` 0 |
| `sun-tzu-art-of-war` | `Yao-Ch'ên` 1 × **and** `Yaochen` 60 × | `Yaochen` 61 ×, `Yao-Ch'ên` 0 |
| `three-kingdoms` | `Tao and put` 1 ×, `Dao` elsewhere | `Dao and put` |
| `summa-theologica` | — | `improportionate`, this batch's own row |

**AND IT IS WHY BATCH E15 SHIPPED A CLAIM THAT WAS FALSE.** E15 announced `summa-theologica`'s
`corning` as repaired. That row **has never applied and never could**: the word does not occur in this
translation at all — only the three `scorning`s the row is anchored to spare — and the passage its
note describes, *"by the dove coming upon the Lord when He was baptized"*, is not in this book either,
which reads *"the Holy Ghost descended upon Him in the shape of a dove"*. E4's candidate was itself a
substring match inside `scorning`. So E15 wrote a careful boundary anchor around a fault that was not
there, and the build's DEAD-ROW warning — which fired correctly — said nothing that every other row on
that cached run was not also saying. **A guard that cries wolf on everything is a guard nobody reads.**
The row is removed; the `scorning` trap it documents is real and is kept in E15's entry.

**THE FIX, AND THE ONE THING IT COSTS.** The cached branch now runs `correctRaw` over the prose and
its notes. The chain is idempotent — stated above `applyRoman` and relied on here — so re-running it
over prose that has already been through it is safe by construction rather than by luck. What it costs
is that **a dead row on a cached run is now ambiguous**: a row doing its job perfectly fires nowhere,
because the cache already carries its output. That ambiguity is not new — before this change every row
on a fully cached run reported dead, which is strictly worse — but it is now worth naming, so the run
PRINTS which kind of report it is giving and says to re-run with `--force` to tell them apart.

**THE DEAD ROWS WERE THEN AUDITED RATHER THAN ASSUMED**, by a test that settles it without a refetch:
**look for the row's OUTPUT in the built book.** A row that already applied has left its output behind;
a row that never applied has not. Fifteen dead rows across the shelf, **fourteen already applied and
one genuinely dead** — and the genuinely dead one is exactly `corning`.

**THE REPAIRS.** Fourteen in `plato-dialogues` and one in `summa-theologica`, found by a **fourth
sweep that generalises E14, E15 and E16 rather than adding a fourth family**: instead of naming a
confusion and hunting for it, ask the SHELF's own vocabulary which words are rare everywhere and sit
one edit from a word the shelf uses constantly. Eleven of Plato's fourteen are NON-WORDS, which is
E15's rule and needs no witness — `Cortinthian`, `Bocotia`, `Poseiden`, `possibillty`, `wlth`,
`weree`, `sayng`, `sarting`, `moster`, `grap`, `lonians` (E14's capital-I family the other way up).
Three are not, and each is settled by the book's own usage: **`Hipponieus`** against seven correct
`Hipponicus` in the same dialogue; **`fake opinion`** in the Theaetetus, whose source file writes
`false opinion` thirty-seven times and this once; and the Summa's **`inproportionate`**, where the
translation renders *improportionatus* as `improportionate` ten times.

**TWO OF E4's SIX PLATO CANDIDATES WERE NEVER ERRORS**, which is worth recording because they were
carried as outstanding work for four batches: `patent` is right (*"in patent ignorance"*) and `sling`
is right (*"stones flung either by hand or by sling"*).

**WHERE THE NEW SWEEP CAN BE RUN, MEASURED.** Shelf-wide it returns **3,559 candidates**, which is not
a work list. Normalised per 100,000 words the rate runs from **9.0 to 202** — a factor of twenty-two —
and the ordering explains itself: **the noise floor is set by how much Latin-alphabet non-English the
book carries.** Marco Polo tops it at 202 because Yule's notes quote Old French, Portuguese, Italian
and Latin, and no rarity test can tell *aler parmy la forest* from a typo. Plato sits near the clean
end at 11.4 **because its foreign matter is Greek** — another script, invisible to a Latin-letter word
scan — and there the sweep yielded 14 real repairs from 79 candidates. **So it is an instrument for a
book you have reason to suspect, and the table says which books it can be pointed at**: the Odyssey
(9.0), the Summa (9.7), Thucydides (9.8), Caesar (10.5), the Analects (10.9), the Ethics (11.2), Plato
(11.4), the Book of Documents (12.2), the Republic (12.6).

**A NEGATIVE RESULT WORTH KEEPING.** Before any of this, all sixteen TEI books were re-fetched with
`--force` to see how much more had drifted upstream since E17 found the Odyssey and the Oedipus had.
**Nothing had**: every built file byte-identical. The shelf's TEI sources are current, and the drift
E17 adopted was the whole of it.

**The proof.** Every book with a cache rebuilt; five changed and each change was read. `book-of-documents`
28 substitutions, `three-kingdoms` 8, `sun-tzu-art-of-war` 1, `summa-theologica` 1, `plato-dialogues`
14 — and no book without a correction table moved a byte.

### E18 — a citation put through a beta-code converter, shipped 2026-09-04

**13 citations restored in Plato's Greek, and nothing else changed in sixteen rebuilt books.** E17
banked this as a finding while its own insertions were being read; this is it measured and repaired.
Perseus's Greek files cite Homer like this:

```
<bibl n="Hom. Il. 14.291">ηομ. ιλ. 14.291</bibl>
```

`h o m . i l .` is beta code for `η ο μ . ι λ .`, so a reader of Plato's Greek meets a reference to
the Iliad **spelled in Greek letters that spell nothing**. A converter was pointed at text that was
already Latin script and did exactly what it was asked.

**IT WAS CONFIRMED IN THE SOURCE BEFORE A LINE WAS WRITTEN, which is the step E17 had to learn the
hard way** — and the answer was not the obvious one. Folio HAS a beta-code decoder (`betaGreek`), so
the natural suspicion was that this is ours; it is not, because that decoder runs only where a book
declares `greek: "beta"`, which is the Satyricon alone, and the mangling is in Perseus's file as
served. Two minutes of `curl` and one `grep` of the importer, and the batch was pointed at the right
thing.

**THE TEST IS A ROUND TRIP, AND THAT IS THE WHOLE SAFETY OF THE RULE.** The element's text is decoded
back through the importer's own beta table and must then MATCH the `n=` attribute on the same
`<bibl>`; only then is the attribute written in. **A citation legitimately given in Greek cannot pass
that test**, because decoding real Greek yields a string of consonants that is not its own reference —
measured: 42 `<title>` elements across the shelf carry genuine Greek and not one matches. The reverse
table is DERIVED from `BETA_LET` rather than typed out, a second copy of a mapping being a copy that
comes to disagree with the first.

**ONE OF THE THIRTEEN IS A PREFIX MATCH, AND IT IS THE ONE THAT WOULD HAVE COST SOMETHING.**
`ηομ. ιλ. 14.201, 302.` sits against `n="Hom. Il. 14.201"` — the text cites a SECOND line that the
attribute does not — so a rule that took the attribute whole would have silently dropped a reference
while looking like it had tidied one up. Where the decoded text merely BEGINS with the attribute, the
attribute supplies the capitals and the decoded remainder is kept.

**MEASURED OVER EVERY PERSEUS FILE THE SHELF READS, both columns**: 1,301 `<bibl>` elements carrying
text, of which 13 are this fault and **every one is in Plato's Greek**. Twelve match outright, one is
the prefix case, and no other element on the shelf is affected — the fault does not occur in a
`<title>` anywhere.

**The proof is the same shape as E17's and is unusually clean.** Sixteen books rebuilt, fifteen
byte-identical; `plato-dialogues.grc.js` is the same LENGTH as before (`ηομ. ιλ.` and `Hom. Il.` are
both eight characters) and differs in exactly **26 runs — the thirteen citations' two abbreviations
each** — in a file of 3.05 MB. Nothing else moved.

**KNOWN LIMIT, stated rather than papered over**: a future instance that fails the round trip is left
standing rather than reported, `teiInline` being a pure function with nowhere to warn to. It would
show as Greek gibberish in the book, and the census that found these is what would find it.

### E17 — a citation's element boundary is a word boundary, shipped 2026-09-04

**193 spaces inserted across six books, and not one other byte changed in the sixteen that were
rebuilt.** Perseus's TEI encodes a cited work as an element — `<title>Laws</title>`, `<bibl>Hom. Il.
14.201, 302</bibl>` — and leaves no whitespace at its edge, so flattening the markup welds the
citation to the words on either side of it:

```
Cf. <title>Laws</title>638 B.               →  Cf. Laws638 B.
<bibl>Hom. Il. 14.201, 302</bibl>has said   →  Hom. Il. 14.201, 302has said
Cf. 86 E;<title>Phaedo</title>81 C          →  Cf. 86 E;Phaedo81 C
between<foreign>ἔρως</foreign>and           →  betweenἔρωςand
```

**THE FIRST DIAGNOSIS WAS WRONG, and it is the same shape of error as E9's, so it is recorded rather
than quietly replaced.** E16's log called this "a TAG-STRIP JOIN and not scanner damage" — a fault of
OURS — on the strength of a real and telling observation: an ABBREVIATED work keeps its space
(`Rep. 392 D`) and a spelled-out one loses it (`Laws638`). The observation was right and the actor was
wrong. The source itself reads `<title>Laws</title>638`; an abbreviation keeps its space only because
its own full stop sits OUTSIDE the element and carries the space after it. **Reading the source before
writing the rule is the step that was missing**, and it took one `curl` — the same two minutes E9's
absence fallacy cost, in the other direction.

**SO IT IS A FLATTENING RULE AND NOT A CORRECTION**, which decides where it lives. Folio's reader has
no `<title>` and no `<bibl>`; this importer's job is to say what those boundaries become in plain
prose, and two words welded together is not one of the answers. **Sixteen books read Perseus TEI**, so
a `fixes` table would be the same three rows sixteen times over — the duplication a shared extractor
exists to prevent. It sits at the head of `teiInline`, which every TEI reader and both columns of every
TEI book go through.

**MEASURED OVER EVERY PERSEUS FILE THE SHELF READS, before the rule was written**: 176 boundaries in
the files that could be fetched up front, every one of which wants a space, and 193 in the event once
Plato's Greek and Suetonius's per-chapter files were rebuilt too. The rules are anchored on the
element's own tag, so they can reach nothing else. **The second of the three is the abbreviation's own
stop** — `<title>Rep</title>.401 D` is the stop set correctly and the number then set tight to it —
and it is why the first rule cannot simply be widened to any non-space character: `</title>.` is right
115 times against seven, so the digit after the stop is what tells them apart.

**THE PROOF IS THE POINT OF THE BATCH.** Sixteen books rebuilt, ten unchanged; the six that changed
changed by exactly the inserted spaces and nothing else — each file's length is its old length plus
its insertions, and no other byte differs. Plato 167 + 19, Herodotus 4, the Satyricon 1 on each side,
Thucydides' Greek 1.

**AND THE PROOF EARNED ITS KEEP IMMEDIATELY: two of the eight changed files had nothing to do with
this rule.** `homer-odyssey.grc.js` and `sophocles-oedipus-rex.js` came back different because
**Perseus has edited those texts since Folio last built them**. Rebuilding with the change reverted,
off the same cache, separated the two cleanly. What drifted is 56 lines of Murray's Greek — accents
and breathings (`μὰλα`→`μάλα`, `ὥς`→`ὣς`, `οἷ`→`οἱ`, `γὰρ σφιν`→`γάρ σφιν`, which is right before an
enclitic) and a handful of real words (`προσέθη`→`προσέφη`, `Πηλεΐδαο`→`Πηλεΐωνα`, `ἔσιδε`→`εἴσιδε`,
`κατὰ ἔσχεθε`→`κατὰ δʼ ἔσχεθε`) — and one typo in Jebb's Oedipus, "for a **lone** time" → "a long
time". They are adopted rather than reverted: they are corrections from the edition's own maintainers
and re-shipping a text one knows to be worse is not a defensible option. **They are somebody else's
work and are counted separately from this batch's own.**

**A FINDING FOR A LATER BATCH, from reading the Greek column's insertions**: Plato's Greek files carry
their citations partly TRANSLITERATED INTO GREEK LETTERS — `ηομ. ιλ. 14.291` where the English says
`Hom. Il. 14.291` — and this is in Perseus's own file rather than anything Folio does. Fourteen of the
nineteen Greek insertions sit against one. The `n=` attribute on the same `<bibl>` carries the correct
Latin-script form, so the repair is to prefer the attribute over the element's text on that side; it
wants its own measurement and its own sibling proof.

### E16 — the third family, and what a row carries with its context, shipped 2026-09-04

**23 repairs across eight books, in the family E15's rule predicted would pay: a word mixing letters
and digits.** A digit inside an English word is a non-word, so the sweep is safe — and the measured
yield bears the rule out. 108 candidates across twelve books, of which **the legitimate ones name
themselves and are BIBLIOGRAPHIC**: `1ff` and `78ff` for *and following*, `8vo` and `4to` for octavo
and quarto, `1274bb` for a Bekker page. Nothing else in the corpus mixes the two on purpose.

**The repairs run in BOTH directions, which the family's name does not suggest.** A digit stands for
a letter — `0ceanus` for *Oceanus*, `1ndra` for *Indra*, `f1ed` for *fled*, `equa1` for *equal*,
`k9ew` for *knew*, `4orth` for *worth*, `highe3t` for *highest*, `com6` for *come*, `baggag6` for
*baggage*, `Earl61y` for *Early* — and a letter stands for a digit, in Suetonius's `[i6th March]`
and `[I8th May]`, where the dates are 16th and 18th. **One is in French**: the Book of Rites quotes
Callery in the original, and `m6me` is *même*.

**Two are the earlier batches meeting this one.** `4so` in the Canterbury Tales is E6's family with
no space to separate it — the opening quotation mark read as a figure 4 and run onto the word, in
*‘Nay, nay,’ quoth she, ‘so may God help me’*. And `1ioff` in Journey to the West is a Chinese
distance unit and an English word run together: *only 20 li off*.

**A ROW CARRYING CONTEXT CARRIES ITS SOURCE'S SPACING WITH IT, and this batch was written wrong
first.** The rows went in as substring `fixes` with the words either side for safety, copied in shape
from the Canterbury Tales' — and **twenty-two of twenty-three were dead**. The Tales' djvu source
sets TWO spaces between words; every TEI and wiki book on this shelf sets one. Nothing was wrong with
the readings; the context was borrowed from a book with a different idiom. Rewritten as `reFixes`
anchored on the damaged token alone, every one fired. **Anchor on the token, not on its neighbours**
— and the dead-row report is what turns this from a silent no-op into a five-minute correction.

**Three are deferred and named rather than guessed at.** `Na4o` in Journey to the West is a character
speaking in a badly garbled passage (*Na4o replied; "You wretched monkey naonster, know that I aoa
the third son"*) — the third son of Li Jing is Nezha, but which romanisation Richard used is the
question, and the surrounding words are damaged too. `1ii«` wants to be *the* from the sense (*the
lowest official position of all*) and does not look like it. And the Rigveda's `Varuni3` sits in a
line addressing two gods, where the vocative could be *Varuna* or a dual form.

**The Rigveda's five rows landed in a follow-up commit**, it being 1,028 pages and some forty
minutes to rebuild: `1ndra` four times, plus `3trength`, `we.1grown`, `f1ed` and `Marut3` — eight
repairs in all, each read in context beforehand and each verified in the rebuilt book after.

**A separate fault surfaced and is NOT repaired here.** About thirty-eight of Plato's references are
run together in the prose — `Cf. Laws638 B`, `Hom. Il. 14.201, 302has said`, `Hes. WD 25and in all
other cases`. The pattern is structural: **an abbreviated work name keeps its space (`Rep. 392 D`)
and a spelled-out one loses it (`Laws638`)**, which is what a boundary between two elements looks
like, not what a scanner does. It belongs in the extractor with the byte-for-byte sibling proof a
shared change requires, and it is E17.

> **This paragraph read "because it is ours and not the source's", and that was wrong** — see E17,
> which read the source before writing the rule and found the space missing THERE. The observation
> above is sound and the actor was not; the correction is kept in view rather than edited away,
> because the mistake is the reusable part.


### E15 — the second OCR family, and the rule for which families pay, shipped 2026-09-04

**Six repairs across five books, and the batch's real product is a rule that can be applied BEFORE
the work.** E14 swept the shelf for a capital I standing where a lowercase l belongs and repaired 42.
The obvious next move is the scanner's other confusions — the digit `1` for an `l`, `rn` for `m` and
back, `cl` for `d` — and the measured answer is that **only the first pays, for a reason that could
have been stated in advance.**

**A SUBSTITUTION FAMILY IS SAFE EXACTLY WHERE THE WRONG SPELLING IS A NON-WORD.** A capital in the
middle of a word never is one, so E14's yield was near 100% and its only exclusions were proper names
(`Io`, `Ieu`). `rn` and `m` are both ordinary English, so the same measure over the same shelf
proposed thirteen changes of which **SEVEN were correct as they stood**: a real `dose` of medicine,
red papers `torn` down, the Syrian city of `Homs`, the archaic `doth` — and, in Marco Polo's notes,
the Old French `corne` and `cornes` (`un corne ad en la teste`, `pour acheter cornes et glus pour
faire arbalestres`) and the manuscript called the **Liber Horne**. `cl`-for-`d` did worse: all three
of its candidates were right. **A book that quotes other languages defeats the test twice over**, and
Marco Polo, with its apparatus of Old French, Latin and transliterated Persian, produced five of the
seven.

**What survives is only what is no word at all in any language the book quotes**: `a1oud` in the
Iliad (`and Athene cried aloud`), `Se1f` and `Pavarnana` and `bome` in the Rigveda (`Invincible!
Self-luminous!`, `O Soma Pavamana`, `The Consort-Queen hath borne him`), `rnen` in Journey to the
West, and `corning` in the Summa.

**That last one closes E4's third and smallest deferral without opening a book.** E4 recorded the
Summa's two candidates as needing the right one of twenty-two volumes and not worth the search for
two words. One of them is this family — `by the dove coming upon the Lord when He was baptized` — and
it needs no volume at all. **Two of E4's three 'no witness reachable' entries are now closed by
rules rather than by witnesses**, which is worth saying plainly: a deferral recorded for want of a
SCAN should be re-read whenever a new rule arrives, because the reason it was deferred may no longer
be the reason it is hard.

**A NON-WORD IS STILL A SUBSTRING OF REAL WORDS, and one of these six proves it.** `corning` is not
a word, which is what makes it safe to repair — and it sits inside `scorning`, which the Summa uses
three times (`in scorning the command of the proconsul`). A bare substring row would have written
`scoming` in all three, silently, while the report said one fix applied. **The rows are anchored on
word boundaries and that is not decoration**; the row for this one says so in its own `why`, because
the trap is invisible from the corrected line.

> **THE `corning` REPAIR ITSELF WAS NOT REAL, and batch E19 found it out.** The word occurs nowhere in
> this translation — only the three `scorning`s the anchor spares — and the passage described above
> ("by the dove coming upon the Lord when He was baptized") is not in the book, which reads "the Holy
> Ghost descended upon Him in the shape of a dove". E4's candidate was itself a substring match inside
> `scorning`; the row was written around a fault that was not there and reported as shipped. What let
> that through is the cache fault E19 fixes: on a cached run EVERY row reported dead, so the warning
> this one correctly raised said nothing the others did not. **The trap above is real and stands; the
> repair did not, and the row is removed.**

**And E14's own two pending confirmations are closed here**: the Rigveda's Sanskrit column rebuilt
**byte-identical**, and Journey to the West's single row fired on `the boundless and universal law`.

### E14 — the capital I standing where a lowercase l belongs, shipped 2026-09-04

**42 repairs across EIGHT books, and it unblocks the two the plan had written off.** E4 recorded
`virgil-aeneid`'s 22 candidates as unrepairable because the 1910 Houghton Mifflin printing of
Williams's translation is not on the Internet Archive, and `plato-dialogues`' because the Loeb
volumes' OCR is unusable where the facing Greek bleeds into the English column. **Both were the same
fault, and it needs no scan at all.** Virgil's 22 is this class exactly; Plato's are eight of its
fourteen.

**The capital I and the lowercase l are the same stroke in most faces**, so an OCR that guesses wrong
writes `Iooked` for `looked`, `Ioudly` for `loudly`, `househoIds` for `households`. **Where the
capital falls INSIDE the word no witness is needed**, because no type sets one there — the same shape
of argument as E8's 10,944-to-40 comma measurement: the corpus establishes the convention and the
reading follows from it. **Where it falls at the START, the book's own vocabulary decides**, on E11's
measure: `looked` against `Iooked`, counted in that text.

**AND IT PROPOSED SIX CORRECT READINGS, WHICH IS THE THIRD TIME A FREQUENCY MEASURE HAS DONE SO.**
`lo` is common, so `Io` scores as a fix — and in all four books that carry it, it is right: **Io the
nymph** in the Aeneid (`horned Io—wondrous the device!— a shaggy heifer`) and in the City of God,
and the ritual cry **`Io Pæan! Io Pæan!`** in Lysistrata. Marco Polo's `Ieu` is the Gnostic name and
its `Iar` a Turkic word for earth. All six are excluded by name. **After `a bout` in E11 and
`Io` here, the rule is settled: a vocabulary score says a change is POSSIBLE, and a proper name is
what it cannot see.**

Two that look like the class and are not quite: Ovid's `Iamb` is a **lamb**, not an iamb — `Could I
be braver than the lamb that hears the wolves howling around?` — and Suetonius's `Iviii` is a
**chapter number**, `lviii`, in a cross-reference to Augustus 58. Journey to the West's single
instance needed more than the letter: the scan reads `boundIe.?s` where the litany reads
`boundless`, so the capital sits inside a word the machine had also broken, and it is a `fixes` row
rather than part of the sweep.

**The six Greek and Latin original-language columns are byte-identical**, which is what anchoring
the rows on ASCII word boundaries buys. **The Rigveda's Sanskrit column and Journey to the West were
still rebuilding when this was committed** — the Rigveda is 1,028 pages and its two English repairs
are verified (`The long-known laws`, `a wild-cow's hide`), but the Sanskrit column's byte-identity
and Journey's single row are confirmed separately, as batch E6's Rigveda was.

### E13 — the six that needed the leaf, shipped 2026-09-04

**Six repairs, taking the book to 831, and every one was cropped out of the page image and read.**
E12 left nine marks in the shipped prose, three of them correct — the page really does print `—,`
and both copies read it. The second scan could not settle any of the other six, in four cases
because it cannot be ALIGNED to a run it has garbled differently, so there was nothing left but the
leaf.

**Two are punctuation the scan flattened, and both change the sentence.** `Save only this . she
prayed the man` is a COLON on the page — `Save only this : she prayed the man that, if he could, he
should bury her little son in the earth` — set with the space this edition gives one. And `will you
joust at the quintain . Methinks` is a QUESTION MARK, set tight against the word, which this edition
does not always do. A flattened colon and a flattened question mark both read as a finished sentence
and neither looks damaged.

**One is a closing quotation mark that was simply lost while its neighbours survived**: the page
reads `he started and cried ‘Ah !,’ as though he were stricken through the heart`, and this scan has
the exclamation mark and the comma and not the quote.

**Three are nothing, and each is a different KIND of nothing** — which is the argument for reading
the leaf rather than inferring. `I thought . him so faithful` has a line break between the words and
no mark at all. `you may.’ . TTT, ...` is SHOW-THROUGH from the facing page, the ghost of type on the
other side of the leaf. `the tower . <,and guarded` is a READER'S PENCIL, running down the whole
outer margin of that leaf and legible as handwriting in the crop.

**The book's own front matter carried a figure I had estimated rather than measured, and this batch
corrects it.** E12 wrote 'about twenty marks remain'; the census says 75 single characters, of which
27 are the printed rows of asterisks and 3 the correct `—,`, leaving **45**. **A count in prose a
reader can check is one to measure**, and the sentence now says forty-five.

**Where the book stands: 831 repairs, no standalone full stop left in the shipped prose, and three
standalone commas that are all correct.** What remains is 45 marks, nearly all inside runs the scan
mangled past any rule, plus the four apostrophe-shaped marks E10 set aside on principle.

### E12 — the spaced full stop and the last mangled runs, shipped 2026-09-04

**17 repairs, taking the book to 825, and the batch is mostly the tail E8 deliberately left.** That
batch put the comma back on its own word and left the full stop alone, because in the raw the spaced
full stop is overwhelmingly the plate list's leader dots and the back matter's tale abbreviations —
`( P . F.)`, `( Sh . T.)`, `( T . and C .)`. **Measuring which of the 31 actually reach a reader is
what made the batch small**: twelve are in the list of illustrations and eleven in the glossary's
source keys, and the extractor puts neither in a chapter. **Six ship, and all six are one shape** — a
heading's own terminal stop driven a space off it, in `Here endeth the Shipman's Tale .` and its
five siblings. **A class can be thirty-one occurrences and six units of work; count what ships before
costing it.**

**The rest are runs the scan mangled, and two of them are the same fault twice: a small heap of
marks where the page prints ONE closing quotation mark.** `I is as ill a miller as you.` is followed
in this scan by `. . , ,` and in the printing by `’`; `what will you do whilst it is in hand ?` is
followed by `, , _ i` and in the printing by `’`. Both were read on the second copy. The remainder
are a comma standing after a sentence already closed (three), a full stop printed twice (four), and
one semicolon read as a comma — `‘Yea, God wot all,’ quoth she ; ‘well may I sing Alack !’ — where
the quotation mark opening the second half of the speech had gone with it.

**Nine marks are left in the shipped prose and three of them are correct.** `— ,` appears three
times and BOTH copies read it, so the page prints a dash and a comma together, which was a real
printer's mark in this period; it is left alone. The other six sit inside passages the scan made
such a mess of that the second copy cannot be aligned to them at all — `you may.’ . TTT, ...`, `the
tower . <,and guarded` — and each needs a leaf read rather than a rule. **They are recorded, and the
book's own front matter now says so** rather than claiming the text is clean.

### E11 — the word broken open, shipped 2026-09-04

**21 repairs, taking the book to 808, and the finding is a measure that uses the book to check
itself.** Where a lone letter stands before a fragment, join the two and ask how often the result
appears elsewhere in this same text against how often the fragment appears alone. `H`+`ow` scores
619 to 6; `k`+`nowest` 19 to 1; `j`+`oy` 196 to 1; `T`+`ale` 426 to 21. **No dictionary is needed and
none would be better** — the corpus is the edition's own vocabulary, in its own spelling, so a word
this translator uses and a modern dictionary does not is scored correctly, and a fragment that is
also a word is scored on how the book actually uses it.

**IT IS A PROXY AND IT PROPOSED A DESTRUCTIVE CHANGE, which is the whole reason every one was read.**
`a`+`bout` scores 250 to 1, and the passage is *many a man who cannot stand a bout is nevertheless
pleased* — where the second scan shows the two words ARE the printing. Joining them would not have
produced a visible error: `cannot stand about` is grammatical, plausible, and wrong. **A high score
says a join is POSSIBLE, never that it is right**; twelve of the thirteen it proposed are repairs and
the thirteenth would have been damage, and nothing but the witness separates them.

**The second class no frequency test can see at all: a letter standing in for a different word**,
where both readings are ordinary English. `m` is `in` three times (*they made them dance in their
father's blood*, *these woful maidens in fear of this*, *destroyed the green in every yard*), `y` is
`by` (*neither by force nor bribe*), `l` is `I` (*of all his wit I am never the better*), `i` is `a`
(*a fair bit of horsemanship for a cook*) and an exclamation mark once, and once it is nothing at all
(*if you will hearken*, where the other copy has no word between). All eight came off the second scan.

**Two of them are the E9 signature and worth naming: BOTH copies misread the same glyph, DIFFERENTLY.**
This one reads `l am never the better` where the other reads `f am never the better`; this one reads
`i fair bit` where the other reads `\ fair bit`. Two independent scans failing in two different ways
at one point says the type is faint rather than that the scanner slipped — and it also says something
IS printed there, which is what rules out deletion and leaves only the reading that fits.

### E10 — the strays, sorted by measuring them, shipped 2026-09-04

**27 repairs, taking the book to 787, and the method is the point: the marks were classified by
MEASURING them in this scan rather than by reading them anywhere.** E9 established that the second
copy cannot witness an absence, its OCR discarding ornament this one keeps — which leaves nothing to
ask about a mark that may be dirt. The page XML carries the bounding box of every word, so the
question becomes arithmetic: what SHAPE is this thing, and does any type on the same page have that
shape? Measured against the page's own text column and median glyph height, the strays fall into
three populations that do not overlap.

**About 121 by 6, or 61 by 7 — long and flat. That is a RULE and the edition prints it**, at a
paragraph break, in the same spirit as its rows of asterisks: `he would fain die.——` then `Alas!
this noble, lordly January`. Confirmed on the leaf. It is KEPT, set as a dash, because it is type
and the reader should see it — the same decision E5 made about the asterisk rows, and consistent
with the book already rendering those as `* * * * *`.

**About 20 to 47 wide by 57 to 67 tall — narrow and full-height. Nothing is printed there at all.**
It is the WIDE SPACE this edition sets after a full stop, which the scanner has boxed as though it
were a glyph. Confirmed on the leaf, where `thou wilt I shall have my love.  Thy honor` runs on with
a gap and no mark of any kind. Twelve deleted.

**Under 20 by 14 — a speck.** Dirt on the leaf, one of them measurably in the MARGIN, outside the
text block. Six deleted.

**A mark of the apostrophe family is deliberately excluded whatever it measures.** Three batches
were spent putting quotation marks back, and an apostrophe really is a small tall mark, so it sits
inside the second population by shape while being type. Deleting one by arithmetic is the single
mistake this pass must not make; the four that measure like a space are left for a reading.

**FIVE OF THE THIRTY-TWO ROWS WERE DEAD, AND EVERY ONE WAS A ROW E5 HAD ALREADY MADE.** They were
generated against the ORIGINAL raw, where the marks are; by the time they run, E5's passage repairs
have rewritten those very sentences. Nothing was wrong with the reading — the repair had simply
happened already. **A generated row must be checked against the text AS THE CHAIN SEES IT, not
against the file it was derived from**, and the dead-row report is what catches it: five rows, all
removed, and the batch is what is left.

### E9 — the figure that stood for three marks, shipped 2026-09-04

**71 more repairs, taking the book to 760, and the finding is a single character that means three
different things depending only on where it stands.** The scan reads a lone figure `1` in 66 places.
Before a lowercase word it is the pronoun **I**, whose serifs the scan lost — 37 of them. Before a
CAPITAL it is never the pronoun, and the 21 occurrences partition exactly: **after a bare word it is
an exclamation mark**, which this edition sets with a space before it (`So wags the world ! God
shield us`, `tender creatures ! Thou didst set`), and **after a full stop, a colon, a dash or a
closing quote it is the opening quotation mark** of the speech that follows (`‘What folk are you`,
`‘Experience, though no authority`, `‘My sorrowful hand,’ quoth she`). Two rules and seven read
exceptions account for every one, and nothing in the shape of the character says which of the three
it is — only its neighbours do.

**THE SECOND SCAN IS A WITNESS FOR WHAT A CHARACTER IS AND NEVER FOR WHAT IS ABSENT, and E9 found
that out by nearly deleting something real.** Its OCR prints no asterisk row anywhere in the book,
which read as proof that the `* * * * *` between paragraphs is this copy's dirt and that E5's
account of them as the translators' omission marks was wrong. **The leaf settles it the other way:
the page prints a row of seven spaced asterisks**, and the other copy's OCR simply discards the
ornament. E5 was right. The rule to carry is that the other copy answers *what is this mark* and
cannot answer *is there a mark here* — for that, only the page will do. **E7's one deletion made on
an absence was re-checked on the leaf under that rule and is confirmed**: the page turn at 150
prints the folio, the running head and then `soun, Sam-soun !’`, with nothing between.

**A count can look healthy while a quarter of a class stands untouched.** The `1`-as-pronoun sweep
was first written to the two spaces this text sets between words, fired 27 times, reported no dead
row and left ten behind — every one of them the pronoun at the END of a line, where the following
space is a newline. **Write the lookahead for the whitespace the text actually has, and check what
the class has LEFT rather than what the row reports.**

**A census over tag-stripped HTML lies in both directions.** E8 recorded the phantom class it
invents; E9 adds the other half — a row that fires and repairs nothing a reader sees. Three of this
batch's rows correct the back-matter notes, which the extractor does not put in any chapter, so
they are real corrections to the raw and invisible in the book. That is not a fault, but a repair
count and a shipped count are two numbers: 71 rows fired and 34 regions of the shipped chapters
changed.

Four single asterisks inside a sentence went with the class — three are semicolons in the house
style (`a furlong or two ; then he arose`, verified on the leaf) and one is a CLOSING quote, which
is the mark E6's rule cannot read, being anchored on the punctuation before it and so committed to
the opening one.

### E8 — the Canterbury Tales' displaced commas, shipped 2026-09-03

**62 more repairs, and the batch's real product is a TOOL.** E7 established that the second Internet
Archive scan of an edition is a witness for a single damaged word. E8 turns that into something that
scales: `/tmp` scratch aside, the method is to take every suspicious token in the shipped prose,
anchor on the three words before it, find the same passage in the second scan by word sequence,
score each candidate position by how many of the words AFTER it also match, and print what the other
copy has between the same two words. **221 candidates, 191 located automatically.** A question that
was a page image apiece is now a table.

**IT ALSO CAUGHT A PHANTOM CLASS, WHICH IS THE WARNING TO CARRY.** The first census reported 22
digits standing before tale headings, running 1 to 25 in sequence, and the obvious reading was that
the edition numbers its tales and the numbers were leaking into the prose. They are Folio's own
`<span class="bk-n">` section markers. **A census run over tag-stripped HTML sees the site's own
apparatus as text**, and this one nearly produced 22 deletions of the reader's own furniture. Strip
`.bk-n` before counting, and when a class looks too tidy, look at the markup rather than the text.

**The finding is that this edition spaces its punctuation, and the comma is the exception.** It
really does set a space before a semicolon, an exclamation mark, a question mark and a colon — 1178,
736, 281 and 78 times against 328, 105, 86 and 27 closed up, so between three-quarters and
seven-eighths, which is a house style and is left exactly as it stands. **The comma is 10,944
attached against 40 spaced: 0.4%, which is not a convention but noise.** The second scan settles it
outright, attaching every one of them in its own misreadings included — it reads `Squire^` and
`Haberdasher^` where this copy reads `Squire ,` and `Haberdasher ,`. 59 commas were put back on
their own words, and the one spaced comma left alone is `{Frankl. T ,)`, where the mark is a misread
full stop inside a back-matter reference and closing it up would only make a wrong stop tidier.

**Three word slips came free with the class**, each read off the second scan while the commas were
being checked: `a IVeaver, a Oyer` in the Prologue's five guildsmen is `a Weaver, a Dyer` (the W
broken into an I and a V, the D read as an O), and `son ot Philip` is `son of Philip`. **Looking at
what is beside the thing you are checking is worth more than looking harder at the thing** — none of
the three is a shape any sweep would have flagged.

**What is left, measured rather than estimated: 13 standalone commas and about 150 single characters
standing in the run of the prose**, and the second-scan table already carries a verdict for most of
them. The `_` class alone is 10, of which the other copy shows 6 to be nothing at all, 2 to be em
dashes, one to be part of a garbled run of quotation marks, and one to be a mark both copies read
and read differently — the E7 signature of worn type rather than a scanner artefact. Those are E9.

### E7 — the Canterbury Tales' possessives and closing quotes, shipped 2026-09-03

**119 more repairs, and two whole classes cleared to zero.** E6 put back the OPENING quotation mark
in six disguises and left the closing one, the possessive and the strays. This batch takes the two
that have a shape, and the count is 108 by sweep plus eleven read on the leaf. The book has now been
corrected in **628 places**, and neither remaining class can be swept at all.

**The possessive was three shapes, not one, and the shape says what happened to the apostrophe.**
The mark is simply gone on 61 lines (`God  s  sake`, `the  Shipman  s  Prologue`, `Chaucer  s  Tale
of  Melibee`); it survives as a straight apostrophe with a space driven in after it on 8 (`the
Knight'  s  Tale`); and it survives correctly, with the same space, on 2 (`Saint  Peter’  s
sister`). Two more escaped every one of those because the apostrophe was read as *a different mark*
— `Oxford?  s  Tale` and `Manciple*  s  Tale`, both tale headings — and are `fixes` rows. **All 73
were enumerated and read before a rule was written**, and there is no line anywhere in the book
where a word is followed by a standing lowercase `s`, so the sweep has no exception inside its own
shape. The cost of the class is that the reader had been meeting `the Wife of Bath' s Tale` at the
head of a tale.

**THE FINDING IS THE SLASH, AND IT IS THAT ONE CHARACTER STANDS FOR TWO.** The printing sets a
comma or a full stop and *then* the closing quote; the scan reads the pair as a single stroke. So a
rule cannot simply substitute a quotation mark — it has to decide which punctuation the page prints
before it, and that is a judgement about the sentence rather than about the glyph. The sweep
therefore claims only the 37 where a lowercase word follows on the same line, because on every one
of those the word is a speech tag or the narrative resuming — `quoth he`, `said she`, `answered
Criseyde`, `replied the sumner` — and a comma is what the page sets without exception. The other
six were read on the leaf: five close a sentence outright and take a full stop, and one takes a
comma and is only outside the sweep because a capitalised name follows rather than a tag. **Had the
sweep been written to the class rather than to the safe half of it, five sentences would have
gained a comma where the page prints a full stop, and nothing would ever have reported it.**

**The second scan is a witness for a word, and that is the cheapest route this pass has found.**
E5 established that two Internet Archive scans of one edition share an OCR engine, so their
agreement on a systematic class proves nothing. The converse is what pays: where ONE copy is
damaged at a single point and the other reads cleanly, the damage is in that copy's scan and not in
the plate, and the clean reading is a printed witness that costs a `grep` instead of a page image.
Three of the four slashes left after the sweep were settled this way — `renov/n` for **renown** in
Arcite's prayer, `pater noster /’` for **`pater noster!’`**, and a mark standing alone at the head
of a leaf between `Sam-` and `soun` which the other copy does not have at all. **Two were not**, and
they are the shape to expect: `ah benedicite /,` and `cor meum eructavit /”` are damaged in BOTH
copies and damaged *differently* (`benedicite .',` and `eructavit T'` in the second). Two independent
scans failing in different ways at the same point is what faint or worn type looks like rather than
what a scanner artefact looks like, so no third scan is likely to settle them; they are recorded
here and left alone.

**A `fixes` row can undo a repair the extractor then makes badly, so read what it produced.** The
stray mark between `Sam-` and `soun` was removed first as a bare deletion, which let the page-turn
join finally fire — and the join is written for a word broken by the LINE, so it ate the hyphen and
produced `Samsoun` where the edition sets `Sam-soun`, as it does again four words later in the same
sentence. The row now carries the word over the page turn whole. **The stray had been protecting a
correct reading by preventing a wrong join**, which is the second time in this pass that repairing
one character has changed a decision the extractor makes about the text around it.

### E6 — the Canterbury Tales' quotation marks, shipped 2026-09-03

**355 opening quotation marks put back, in six rows, and the batch begins by correcting the batch
before it.** E5 deferred this class saying `applyFixes` could not express it at all, because a row
written `"c  "` matches inside every word ending in c. **That was half right and the half it got
wrong is worth stating: a row written `"  c  "`, with the spaces on BOTH sides, matches only a
standalone `c` and would have been perfectly safe.** What genuinely defeats a substring rule is the
other shape — a character that also appears legitimately in a run of itself. The translators mark
each passage they cut with a row of asterisks, so `"  *  "` matches inside `*  *  *  *  *` and would
have eaten the marks the extractor counts and reports. Only *an asterisk followed by a letter*
separates the quote from the mark, and that needs a lookahead.

**AND THE CLASS WAS THREE TIMES THE SIZE E5 REPORTED.** E5 counted the `c`. A census of every
one-character token in the shipped prose — two lines of script — found the opening quote misread
**six** ways: `c` 227 times, `*` 61, `4` 40, `f` 15, `{` 6 and `<` 6. **Count the alphabet, not the
letter you noticed**: the same census is what turns "a quotation mark is sometimes wrong" into a
list you can finish.

**`reFixes` IS `fixes` WITH A BOUNDARY, NOT A FOURTH KIND OF ACT.** It asserts what `fixes` asserts —
the printed page reads X and this transcription reads Y — so it takes the same `why`, the same
must-fire rule and the same per-row count, and it is deliberately NOT filed beside `glyphs` and
`roman`, which assert nothing about a page. It runs AFTER `fixes`, and that order is load-bearing: a
hand-written passage row is specific and a regex row is general, so the specific one gets first
refusal. Three rows exercise it — a stray `f` inside the hyphen-wrapped `every-where` is deleted
before the `f`-as-quote sweep can read it as a quotation mark, and two real quotes the asterisk rule
deliberately cannot reach are restored by hand.

**EVERY ONE OF THE 355 WAS ENUMERATED AND READ BEFORE A ROW WAS WRITTEN.** That is affordable at
this size and it is what the rules are built out of. Two tests did the work: **what FOLLOWS** (a
quotation mark is followed by a word; the page furniture it can be confused with is followed by a
run of capitals or a digit) and **what PRECEDES** (a quotation mark opens after a full stop, comma,
colon, dash or paragraph break). The second is needed only for the asterisk, where anchoring on the
punctuation removes all five false positives — one of them the semicolon in *burnished gold ; but
now he was descended* — at the cost of two real quotes, restored by hand.

**A GUARD FOR ONE ROW ONLY: `4` IS ALSO A PAGE NUMBER.** `4  THE CANTERBURY TALES` is the top of a
leaf and `4  Thou shalt to Athens` is Mercury speaking; a capital followed by a capital is a running
head. And **only the `c` row allows a single space** before the following word. The printing sets two
between words, so a lone space is itself a scanning fault — but widening the others by a space takes
a stray brace and two currency figures (`a coin worth 4 d.`) out of the back matter, so it was
measured row by row rather than applied across the table.

**THE FALSE POSITIVES ARE WHERE THE VALUE OF ENUMERATING IS.** Five of the seventy loose asterisk
matches are not quotes at all, and one of them is prose a reader meets. Had the rule been written
from the shape alone and shipped on its count, the book would have gained 355 correct quotation
marks and five new errors, and nothing in the pipeline could have told the difference.

**AND REPAIRING A CHARACTER CAN REPAIR THE PARAGRAPHING AROUND IT, which is worth expecting rather
than being surprised by.** The extractor's own heuristics READ the text they are deciding about: a
block beginning with a lowercase letter is treated as a continuation of the paragraph above it. Two
blocks in this book began with a misread quotation mark and were therefore glued to their
predecessor — the Wife of Bath's `“ Sir old dotard, is this how you would have things ?`, which the
printing sets as a new paragraph, and a mangled page number `J87`, which was riding into the prose on
the back of the `f` that followed it. Both come right on their own once the character is a quotation
mark, so the diff carries one paragraph more and one piece of scanner dirt fewer than the rows
account for. **Diff the paragraph structure as well as the words** after a batch like this; the
change is correct here and would have been just as invisible had it not been.

### E5 — the Canterbury Tales, shipped 2026-09-03

**75 rows, 151 substitutions, and the batch found something bigger than it was sent for.** E5 was
scoped as the next tier of letter slips; the Canterbury Tales turned out to be the worst-damaged
text on the shelf, and its damage is of a different order — not a wrong letter here and there but
**whole lines dropped and transposed**, and a quotation mark misread more than two hundred times, of
which this batch could reach sixty.

**THE SWEEP THAT FOUND IT IS TWO LINES AND SHOULD BE RUN ON EVERY BOOK: count the characters the
transcription uses that are neither ASCII nor its own curly quotes and dashes.** For this book that
was `£ ™ ° § « » ■ „`, and every one of them except the section marks of the Parson's Tale was a
letter, a quotation mark or a mark on the leaf. It needs no judgement, no witness and no reading,
and it points straight at the passages a reader cannot read. The density sweep that had been used
until now — count odd-looking tokens in a sliding window — found the thirteen worst passages and
missed the eighteen the census then turned up, because a passage can be badly wrong in one character
and a window of twelve tokens cannot see it.

**EIGHT PAGES ARE PRINTED STRAIGHT AND SCANNED ASKEW**, and on those the OCR did not misread words,
it lost them. A reader met `*° °Ve Him bCSt °f any creature` where page 230 says *I warrant him to
love him best of any creature, had he no more than his kirtle*; met one line made of the halves of
two, where January's brawn and his `Noel!` had been folded together; and met five scrambled lines
on page 142 in place of *deliberation he sent for a churl in that city … to, the judge was glad*.
Forty words are restored. **The pages themselves are perfectly legible** — that is the point, and
the reason every one of these is a repair and not a guess.

**TWO SCANS OF ONE EDITION SHARE AN OCR ENGINE, SO THEIR AGREEMENT PROVES NOTHING AND THEIR
DISAGREEMENT PROVES A GREAT DEAL.** A second copy of the same 1912 printing (`completepoetical00chau`,
the New York Public Library's) reads `full`, `lord` and `sooth` where ours reads `fuli`, `loid` and
`scoth` — decisive. It also reads `undei` and `othei`, exactly as ours does, which looked like a
defective sort in the forme and is not: **read the letter rather than the OCR.** Measured on the page
image, the final glyph of `undei` is solid, dotless and eleven pixels wide against a control `r` of
twenty — an `r` whose arm failed to ink. The same measurement settled all six of the batch's
ambiguous words, and twice it went against the first reading by eye: `wili`'s fourth glyph has an
`l`'s top serif at row 15 where the true `i` beside it carries a round dot at row 16, and `scoth`'s
second letter is an `o` with a three-row gap in the right of its bowl, closed above and below it.

**THREE SYSTEMATIC FAMILIES, and they dwarf the slips.** The edition's opening single quote is read
as a **pound sign** on 59 lines (every one checked, every one opening a speech); the **AE ligature**
is read as `iE` and as `/E`, which between them made King Aella's name unreadable thirteen times and
also hid Aegeus, Aesculapius and Aeneas; and **a full-page plate can land inside a sentence**, so
Warwick Goble's signature was set down in the middle of *Some evil … aspect or disposition of
Saturn* and a speck from another plate between *Brother mine Valerian,* and *will you lead me
thither?* — the second dragging its caption into the prose, which the running-head sweep takes
sixty times and misses once.

**WHAT IS DELIBERATELY LEFT, AND WHY IT IS ITS OWN BATCH.** The same opening quote is read as a
lowercase **`c` on 157 further lines** and the closing quote as a slash on about eleven, and neither
can be a `fixes` row: `applyFixes` is split/join with no word boundary of its own, so `"c  "` would
match inside every word ending in c, and 157 rows each carrying their own context is not a table but
a transcript. That wants a word-boundary-aware pass — a change to machinery nine other books share,
which must be proved inert on all of them — so it is E6 rather than the tail of this. Eleven stray
carets, each needing its own page read, wait with it. **The book's front matter says so to the
reader**, in the paragraph naming the 151 repairs.

**A DEFECT CLASS CAN BE INVISIBLE TO THE MEASURE THAT FOUND ITS SIBLINGS.** Both `wili` and `vour`
collide as substrings with real words in the same book (`wiliness`, `devouring`), and the second
`vour` slip is in Troilus and Criseyde — outside the Tales, so not shipped and not fixed. **Count a
candidate as a substring and as a whole word before writing the row**, and check which part of the
volume it falls in: this edition is the Complete Poetical Works — Troilus, the minor poems and the
Legend of Good Women are all in the same file, and none of them ships.

### E4 — the Ramayana and Don Quixote, shipped 2026-09-03

**TEN SLIPS CORRECTED, TWO FALSE CORRECTIONS REFUSED, AND THE SECOND NUMBER IS THE ONE THAT JUSTIFIES
THE WITNESS RULE.** `Baratario` and `sard` both look exactly like scanning slips — a village named
one letter off the island it names, an ass compared to a word no dictionary carries — and the 1885
printing sets both. Without the scan they would have shipped as corrections, which is the failure this
plan's bar exists to prevent, and the only way to know is to look.

**THE FILTER THAT MADE THE READING TRACTABLE IS THE SHELF ITSELF.** `book-scan` has no dictionary and
says so; forty-seven other books are one. Ranking a book's candidates by how many OTHER books on the
shelf ever write the word puts every real slip in the first band and every ordinary English word below
it: on the Ramayana the nine that turned out to be slips all sit among the thirteen rarest of 159
candidates, and the rest of the list is *tabours*, *laves*, *lath*, *hern*, *lops*, *glean* — words
this book uses correctly and a dozen books share. On the Summa the same ranking separates one real
slip (`corning` for coming) from sixty-four correct words, most of them Latin citations.

**AND THE SECOND FILTER IS A SYSTEMATIC CLASS THE SUBSTITUTION SCAN DOES NOT NAME: `l` READ AS CAPITAL
`I`.** A capital I inside a lowercase word is the same stroke as an l in most faces and is never
correct English. Swept over the whole shelf, deciding each case by whether swapping the glyph gives a
word that same book writes often: **28 forms and 37 occurrences across six books**, of which the
Aeneid has 14 forms and Plato 4. That is a measurement where §2 carried an estimate — §2 carried an
estimate of "~120" for the Aeneid alone, and the estimate was four times high; it now carries the
measurement instead.

**THE WITNESS'S OWN TEXT LAYER IS NOT ALWAYS A WITNESS, AND THAT IS THE BATCH'S REUSABLE FINDING.** An
OCR of the same typeface makes the same mistake: the Internet Archive's scan of Griffith reads
`Ayodby4` at one place, `Namuehi` at another, exactly as Folio's transcription does. The asymmetry is
what saves it — **an OCR turns a printed letter into a wrong one and never a printed wrong letter into
a right one**, so where the scan's text reads the CORRECT form the printed page carries it and the
check is done (five of the nine settled that way), and where it repeats the error the page IMAGE has
to be read (the other four did). `<id>_djvu.xml` carries per-word coordinates on every page, so the
line can be cropped out of `archive.org/download/<id>/page/n<leaf>_w1400.jpg` and looked at: the page
reads *King Ráma reached Ayodhyá's gate*, *As Namuchi and Indra met*, *Called also Videha*, and *bows
out of the horns of antelopes*.

**A SECOND TRANSCRIPTION IS A WEAKER TOOL THAN IT SOUNDS, and it was tried and measured rather than
assumed.** Folio's Ramayana is Project Gutenberg's transcription and the witness is a Google scan of
the same translation, so a word Folio uses once and the scan never uses at all ought to be a candidate
the substitution scan cannot reach — a dropped or inserted letter, which it deliberately does not look
for. It reports **1,197 words**, because the 1895 one-volume reprint is abridged where the five-volume
edition is not and because Sanskrit proper names are the bulk of both books' rare vocabulary. It found
nothing the ranking had not, and is recorded here so the next pass does not spend an hour on it.

**WHAT THE TEN ARE.** Nine in the Ramayana, all in one family or another of the shapes a letterpress
page confuses: y read as v (`jovful`, `Vindhva`, `Kártikeva`), h as b (`Ayodbyá`), c as e (`Namuehi`),
e as c (`Vidcha`), `in` as m (`Mamda`), m as rn (`arras` for arms) and one dropped r (`hons` for
horns). One in Don Quixote, `neigbbour's`, in a transcription otherwise clean enough that a sweep of
2.4 MB turned up nothing else. Each string occurs exactly once in its raw source, which is what makes
`applyFixes`'s bare substring replace safe on all ten.

**WHAT IS RECORDED RATHER THAN REPAIRED, and why, per book.** `virgil-aeneid` — **the 1910 Houghton
Mifflin printing of Theodore Chickering Williams's translation is not on the Internet Archive**, which
holds his Georgics of 1915 and his poems of 1910 but not this; its 22 candidates stand. `plato-dialogues`
— the Loeb volumes are there, and **their OCR is unusable because the facing Greek bleeds into the
English column**, so the text layer reads as transliterated gibberish; 14 candidates stood, among them
`Iawgiver`, `moster` for monster, `Hipponieus` and `possibillty`. **(Batch E14 repaired eight of the
fourteen, and Virgil's 22 entire, without any scan at all: both were the capital-I-for-l class, which
is settled by a rule about type and by the book's own vocabulary. Read E14 before treating a
'no witness reachable' entry here as closed.)** `summa-theologica` — its two
(`corning`, `inproportionate`) would need the right one of twenty-two volumes and are not worth the
search for two words. **(Batch E15 repaired `corning` with no volume opened: it is the rn-for-m
family, and `corning` is a non-word. `inproportionate` stands.)**

---

### E3 — the Rigveda, shipped 2026-08-22

**FIFTY-TWO SLIPS, AND THE WITNESS IS A SECOND SCAN OF THE SAME PRINTING.** `book-scan.js`'s own header
says a candidate is evidence and never a verdict, and this is the batch that had to act on it: the
Rigveda's transcription is 1,023 hand-typed pages, so the scanner reports slips by the dozen and most of
them are words. What settles one is the Internet Archive's OCR of the same 1896 second edition — volume I
as `in.ernet.dli.2015.104118`, volume II as `in.ernet.dli.2015.104119` — whose own OCR is bad in
**different places** from the wiki's, which is the whole of what makes it a witness. Each candidate was
anchored by three to five words of the shipped sentence, located in the scan by a normalised alnum stream
with an offset map back to the raw, and read there. Forty-eight wiki pages in all.

**A CANDIDATE THE SCAN COULD NOT SETTLE WAS DROPPED RATHER THAN GUESSED AT**, which is why 52 of the
~100 the sweep surfaced are rows and 44 are still reported by `book-scan.js`. Three that were dismissed
are worth naming, because each looks exactly like a slip: `marry` for many (the scan reads *marry*, and
the line is about a suitor), `vyansa` for vyamsa (the scan reads **Vyansa** — a printed-book variant, so
"correcting" it would have been editing Griffith), and `abject`.

**FOUR ROWS TARGET THE TRANSCRIPTION'S OWN HOUSE FORM RATHER THAN THE SCAN'S RENDERING, and they say so.**
The scan writes a vocalic ṛ as *ri* — it has "amrit" 43 times and "amrta" not once — while this text
writes it *r* and spells `Amrta` 25 times. The row therefore fixes `Anirta` to the book's own `Amrta` and
its reason quotes that count, rather than claiming the printed page reads a spelling it does not.
`erthrawn` is the same judgement one notch finer: the scan reads *overthrown* with no apostrophe, so only
the vowel is fixed and the transcription's own `o'erthrown` — which it uses five times elsewhere — stands.

**TWO ROWS ARE WIDER THAN THE SLIP THEY FIX, AND THAT IS `applyFixes`' RULE RATHER THAN A FLOURISH.** The
pass is a plain substring replace over **every page of the book**, so `hones` would eat "honest" seven
times and `bither` would eat "bitherward" twice: the rows are `car and hones` and `come bither`, and
declaration order puts `bitherward` first. Every one of the 52 was proved unique as a plain substring
across the whole shipped book before it was written down, and each fires exactly once.

**AND THE TABLE WOULD HAVE BEEN SILENTLY INERT**, which is the finding to carry to the next book on an
unusual path: `layout: "sukta"` is the Rigveda's alone and its fetch branch never called `correctRaw`, so
a `fixes` table on this book was a hundred lines of dead configuration — no error, no warning, and a run
that reports the right number of hymns. It is wired now, and it is wired **after the cache is read**:
the sukta branch caches the page as Wikisource served it, so a row can be re-verified against the cache
instead of needing a refetch to prove it still fires. **Check that a book's own branch reaches the
correction chain before writing a table for it.**

Counts unchanged: 1,028 hymns, 10,503 verse numbers, 27 notes, 2,054 KB. The book's own front matter now
says fifty-two have been corrected and that the rest are left as found.

### E2 — the Travels of Marco Polo, the error check, shipped 2026-08-22

**No words were changed, and that is the finding rather than a batch that came back empty.** The E-half
asks whether a transcription has taken damage the printed page does not have. On this book the answer is
no, and getting to a confident no cost more than a correction would have.

**FOR A SCHOLARLY EDITION THE AGGREGATE SLIP TEST IS WEAK, AND ITS WEAKNESS IS STRUCTURAL RATHER THAN A
MATTER OF TUNING.** `book-scan.js` finds a word that occurs once and sits one known confusion away from a
word that occurs many times — which on a novel or a history is a good proxy for a scan slip, because the
rare side of such a pair is usually not a word at all. Here the rare side is a word by construction:
Yule quotes French, Italian, Latin and Persian on nearly every page, and Cordier adds more, so the
book's own vocabulary of hapax legomena IS its subject matter. Every candidate read against the page
turned out to be a quotation, one of Yule's own transliterations of a Persian or Mongol name, or his
note setting two manuscript readings beside each other. **Ask what the rare side of the test is made of
before reading its output as a list of slips.**

**AND THE INDEPENDENT SCAN IS THE POORER WITNESS ON EXACTLY THE CLASS OF WORD IN QUESTION.** The
standing rule is that a correction asserts "the printed page reads X and this transcription reads Y", so
a second copy of the same 1903 edition is what settles it — and archive.org's scan **loses every
diacritic**. A machine reading of it says *Kublai* and *Kerman* where the printed page and this
transcription both say Kúbláí and Kermán. On a book whose disputed spellings are almost all accented
names, the witness that would adjudicate them is the one that cannot see them. Walked word by word
against it, nothing in the transcription needed correcting.

**WHAT THE BATCH DID CHANGE IS THE ABOUT PAGE, and it is a mark rather than a word.** `✛` appears 21
times and the book never explains it, because the sentence that does stands in a preface the library
does not carry: Cordier writes that "paragraphs which have been altered are marked thus ✛", so a cross
at the head of a note is Yule's text revised by his editor thirty years on. **Fourteen of the
twenty-one are that; the other seven are not Cordier's at all** — two stand for *died in* beside a date,
and five are crosses somebody dug up, in the chapter on the tomb of St. Thomas. A reader meeting the
same character doing three jobs is owed the difference, and the entry now says so. The About page also
records the check itself, including that the scan is the poorer copy, so a reader who has met that copy
elsewhere knows which of the two is losing the accents.

Verified the way every book entry is: rebuilt with `--skip-original` (235 chapters, 2,738 KB, 788 notes)
and diffed byte for byte against the shipped file.

---

### B6b — Romance of the Three Kingdoms, shipped 2026-09-03

**462 OF 483 CANDIDATE ROMANISATIONS SHIPPED AND 21 STRUCK OUT, and the 21 are the entry's point.**
The two notes this replaces recorded that a second independent pass over this book had built a table
neither nested with nor worse than B6's, and held its 527 extra rows in
`.claude/three-kingdoms-candidates.js` against the day somebody merged them. Merging them is this
batch, and the file is deleted with it — a file headed NOT SHIPPED that has been shipped is a lie
waiting to be read, and what it held is now in the importer with the reasons beside each row. What the earlier notes did not say — because it could not be known without doing the work — is
that **a table built from a second pass is research and not a result**, and that the rows most worth
having are the rows most likely to be wrong.

**THE CHECK THAT MADE IT SAFE IS A DETERMINISTIC WADE-GILES → PINYIN SYLLABLE CONVERTER, CALIBRATED
AGAINST B6'S OWN 1,727 ROWS.** The syllable mapping is fixed — `Ts‘ao` is `cao` whatever character it
spells — so a converter can say whether a row asserts only the mapping or asserts something beyond
it. Run over the shipped table it corroborates 1,618 rows outright, leaves 98 that are
character-carried corrections and 11 it cannot read, which is close enough to B6's own account of
itself to trust. Run over the 483 candidates it corroborates 458. **The 25 it does not are where the
errors were**, and reading them is what caught `Chio → Jie` (張角 is Zhang **Jue**, as the shipped
`Chang Chio` row already says, and the row ships with that target instead) and `Chuko Ch‘üo → Zhuge Que` (the shipped table carries `Ch‘üo → Ke`,
and 諸葛恪 is Zhuge Ke — a longer row would have silently renamed him in seven places).

**BUT THE CONVERTER CANNOT SEE THE ERROR THAT MATTERS MOST, and that has to be said plainly.** It
checks which SYLLABLE a spelling is; it cannot check which CHARACTER. Nine rows were mechanically
perfect and factually wrong, every one of them found by reading the rebuild's own diff against the
edition's Chinese: `Yushui → Youshui` (淯水 is Yushui), `Anping → Anbing` (安平), `Tingchun → Dingzhun`
(定軍山), `Tungchun → Dongzhun` (東郡), `Yuchang → Youzhang` (豫章), `Yutan → Youdan` (雅丹),
`Shanyu → Shanyou` (單于, the Xiongnu **Chanyu**), `Yu-kung → Yougong` (庾公之斯) and
`Shunyu Tao → Shunyou Dao` (淳于導, contradicting the table's own `Shunyu → Chunyu` two rows above).
**Diff the rebuilt book and read the tail of the change list**; the common forms are safe by weight of
numbers and the singletons are where a wrong name hides.

**THE BARE UNASPIRATED SINGLE SYLLABLE IS THE CLASS B6 EXCLUDED, AND IT IS 1,330 OF THE 1,638 WORDS
THIS BATCH CHANGES.** B6's policy was that "a bare `Chang` is three different surnames"; the real test
is narrower and is measurable — **does this printing distinguish the bare form from its marked
sibling, and in which direction?** Counted over the whole novel: `Chang` 1,467 against `Ch‘ang` 14,
`Kuan` 1,006 against `K‘uan` 2, `Kuo` 465 against no `K‘uo` at all — so the bare form is real and the
row is safe. Where the ratio runs the other way the row is a dropped mark wearing a name: `Chun` 3
against `Chün` 36 (諸葛均 Zhuge Jun), `Tang` 42 against `T‘ang` 14 but all three of its uncovered
occurrences are 唐, and **`Yu` 107 against `Yü` 1,224 — two of them chapter titles about 關羽, Guan
Yu**. Eight bare rows were struck on that measurement, `Hsui → Xui` with them, `xui` being no pinyin
syllable at all.

**A ROW THAT WAS ONLY EVER CORRECT BY ACCIDENT: `writeEnglish` WAS RUNNING THE ROMANISATION TWICE.**
That function applies `applyRoman` to every chapter title, because a title comes from a contents page
and the chain never reaches it — but this book has no contents page in its config and `sanKuoHead`
reads each title off the chapter's own printed head, out of text `correctRaw` has already been over.
So the pass was a SECOND application of a table designed to be applied once, and the collision rule
then bites: `Ts‘ao P‘ei → Cao Pi` first, `Pei → Bei` second, and the bar reads *Cao Bei*. It was
harmless until this batch, because the bare unaspirated rows are what turn a second pass from a no-op
into a rename. `titlesCorrected: true` declares the case per book.

**AND THE FIRST PASS COULD NOT REACH THE TITLES EITHER, BECAUSE A STYLESHEET STOOD IN THE MIDDLE OF
ONE.** MediaWiki emits the tooltip template's CSS as an inline `<style>` element immediately before
the first tooltip on the page, and this book puts a tooltip inside a chapter head, round the very word
a row is written for: `Kuan <style…>…</style>Yun-ch‘ang`. Every pass treats markup as opaque, so the
row for the whole name could not fire and the half that could was rewritten alone. **This is the third
costume the same fault has worn** — a page marker inside a word (the Book of Rites), a drop capital
(B6), and now a stylesheet — and the answer is the same one each time: remove what carries no prose,
so a row can see the word, and change not one character of what ships. 859 blocks per run, and the
five sibling books are byte-identical with it in place.

**SIX PAGE-TURN SPLITS, NOT TWO.** The earlier note found `Lü Pu` and `Chou Yü`, whose halves convert
to something visibly wrong; the join finds `Huang Chung`, `Liang K‘uan`, `Ssŭma Wang` and `Têng Ai`
too, whose halves each convert correctly on their own and therefore looked like nothing. **The join is
built from the ROWS rather than from the marker** — the marker moves only where moving it makes a
declared two-word row match — because the general form would relocate a leaf boundary at 1,700
ordinary word breaks to convert two names. The separator is `&#32;` rather than a space, so the class
a row's space compiles to had to learn the entity as well.

**TWO DEFECTS IN B6'S OWN TABLE THAT NOTHING COULD REPORT.** `Yen-Hsi` was declared twice with
different targets — `Yanxi` for the Shu reign period 延熙 and `Yanshi` for 彥士 — and `to` is built in
declaration order, so the later row won and the shipped book dated two chapters to the "sixteenth year
of Yanshi". **`ROMAN_HITS` is keyed by the `from` string, so the two rows shared one counter and
neither read as dead.** 彥士 is set `Yen-shih` by the printing, once; the row now says so. And the
surname 于 was converted three ways at once: `Yü Chin → Yu Jin` right, `Yu Chin → You Jin` wrong,
`Yu Ch‘uan → You Chuan` wrong — 于禁 appears 90 times in this edition's own Chinese and 于詮 five.

**THE PRUNE IS 88 SHIPPED ROWS, AND IT WAS PROVED BYTE-NEUTRAL BY REBUILDING WITH THEM BACK IN.**
Twenty-four were superseded by a new `fixes` row that repairs their input before the romanisation
runs; sixty were shadowed by a longer candidate row; four went dead only after the stylesheet fix let
longer rows reach a chapter head. Every figure above is the importer's own: **2,100 of 2,100 declared
names fire, in 24,741 places, with 38 fixes and one glyph, and no warnings.**

**AND THE RE-IMPORT FOUND SOMETHING NOBODY WAS LOOKING FOR.** Chinese Wikisource has taken to marking
a textual variant as a tooltip — `<span class="variant-text">璟<span class="variant-tooltip">一作「景」
</span></span>` — which the tag strip flattens into the running prose, so a sentence reads
吳璟一作「景」不和 with an editor's note glued into the middle of it. The Book of Documents' entry
records the same shape on the same wiki as a trap for a facing original it never got; this is the
first book to meet it. **Fourteen of them were already shipped inside Journey to the West's Chinese
and one inside this book's**, and nothing threw, nothing counted wrong, and each chapter was simply a
few characters longer. The originals also picked up two upstream corrections (范彊 → 范疆), which is
what a re-import is for.

---

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
