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
| `book-of-rites` | 547 `'` | 172 | 254 | 121 |
| `confucius-analects` | 294 `'` | 0 | 0 | 108 |

**The hanzi column is what decides the order.** The Art of War is the only book on the shelf that prints the
characters beside its own romanisations — 118 of its 191 romanised forms are glossed with characters at least
once (`班超 Pan Ch‘ao`, `苻堅 Fu Chien`, `田忌 T‘ien Chi`), because Giles quotes his Chinese in his notes. Every
other book's conversion has to be verified from somewhere else: the Analects, the Book of Rites and Three
Kingdoms each ship a parallel Chinese column, and Journey to the West and the Book of Documents do not.

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
| **B2** | `confucius-analects` | Legge's romanisation, 108 names, verified against the parallel Chinese column |
| **B3** | `book-of-rites`, `book-of-documents` | Legge again — same system, 297 names between them |
| **B4** | plain-text/TEI reachability | extend `applyFixes`/`applyRoman` past the wiki loop; **prove inert byte for byte on every book already on those paths** |
| **B5** | `journey-to-the-west` | 115 names, Richard's OCR, no characters either side but a complete Chinese column |
| **B6–B8** | `three-kingdoms` | 803 names over 3.1 MB, verified from the parallel column; one batch per 40 chapters |
| **E1–En** | the error half | the slip and variant candidates, book by book, heaviest first; a book with no printed witness reachable contributes findings rather than fixes |

The error half of a Chinese book rides with its romanisation batch; the rest run on their own.

---

## 8. Batch log

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
