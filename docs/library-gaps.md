# The Library's gaps — what is missing, and what can still be added

An audit of all 29 shelved books (Aug 2026, on request; the Book of Rites was added after the first
pass and its rows are folded in below), covering three kinds of absence: **text the
book does not carry**, **a facing original it has not got**, and **notes**. For each gap it records
whether the blocker still holds, because several of the decisions behind them were made months or
years ago and at least one has expired since.

**The method is the shelf's own.** Every claim below was measured or fetched rather than recalled,
and where a source was checked and found unchanged that is said outright — a re-check that confirms
an existing record is worth as much as one that overturns it, and saves the next person the fetch.
Not part of the site.

---

## 1. The audit

29 books; 19 carry a facing original, 10 do not.

### Books that do not carry the whole work (`count` < `total`)

| book | has | of | why |
|---|---|---|---|
| `book-of-rites` | 10 | 46 | only the first of Legge's two volumes has been transcribed — see below |
| `classic-of-poetry` | 102 | 305 | Legge's *Sacred Books of the East* volume prints only the poems bearing on religion |
| `prose-edda` | 3 | 4 | Brodeur omitted *Háttatal* deliberately |
| `plato-dialogues` | 35 | 36 | the Republic is missing — a licence gap, not a textual one |

Everything else on the shelf is `count == total`.

### Books with no facing original (9)

| book | original would be | recorded blocker |
|---|---|---|
| `plato-republic` | Greek | Jowett prints no Stephanus numbers |
| `classic-of-poetry` | Chinese | no uniform transcription |
| `book-of-documents` | Chinese | Chinese transcription numbers nothing |
| `book-of-rites` | Chinese | ditto, and further apart — 57 of Legge's paragraphs against 35 Chinese |
| `poetic-edda` | Old Norse | — |
| `prose-edda` | Old Norse | licence (Guðni Jónsson, d. 1974) |
| `aristophanes-lysistrata` | Greek | the English prints no line numbers |
| `kalidasa-shakuntala` | Sanskrit | three independent grounds |
| `epic-of-gilgamesh` | Akkadian | no PD edition exists in the sense the shelf means |
| `aesop-fables` | Greek | neither collection numbers anything |

### Books with no notes (8)

`aesop-fables`, `confucius-analects`, `kalidasa-shakuntala`, `lucretius-nature-of-things`,
`ovid-metamorphoses`, `song-of-roland`, `sophocles-antigone`, `sophocles-oedipus-rex`.

**All eight are edition facts, not extraction failures**, and each was measured when the book was
imported — zero reference marks over the whole work in every case. Jones annotated his Shakuntala in
an introduction rather than in notes; Bédier and Scott Moncrieff print none over 291 laisses; Legge's
Analects carries none over twenty books. **There is nothing to recover here and no action is
proposed.** Composing notes would be composing an apparatus, which this repo has refused four times
already.

### Books with no section numbers (5)

`aesop-fables`, `aristophanes-lysistrata`, `kalidasa-shakuntala`, `machiavelli-prince`,
`plato-republic`.

`machiavelli-prince` is not a gap — it pairs on the **chapter**, which both its editions state, and
it has its Italian. The other four are the shelf's genuinely unpairable books, and the reason is the
same in each: the section number is the key app.js pairs on, and nothing states one.

---

## 2. What can still be added, in order of value

### A. Plato's Republic — the Greek is now reachable, and this changed on 1 January 2026

**This is the one recorded blocker that has expired, and it was not a textual problem in the first
place.** The Republic's entry records that Plato has the best-standardised citation system of any
ancient author, that Burnet's Greek sits on Perseus in the same TEI/CTS encoding the Meditations'
Greek comes from with Stephanus numbers as structure, and that the only thing missing was the numbers
on **Jowett**, who prints none. The obvious answer — Shorey's Loeb, which prints Stephanus numbers
and is on Perseus — was ruled out as still in copyright.

**Shorey died on 24 April 1934** (verified on Wikipedia rather than recalled, for the Hugo Magnus
reason). That puts his translation in three different positions at once:

- **Public domain wherever the term is life plus seventy — since 1 January 2005.** Twenty-one years
  ago. This appears never to have been considered.
- **United States, volume 1 (Books I–V, published 1930): public domain since 1 January 2026** on the
  95-year rule — seven months ago, and after the Republic's entry was written.
- **United States, volume 2 (Books VI–X, published 1935): in copyright until 1 January 2031.**

CLAUDE.md describes Shorey as "of 1935–37", which conflates volume 2's date with volume 1's 1937
reprint and hides the fact that the two volumes clear at different times. **That sentence is the one
the whole decision rests on and it should be corrected whichever option is taken.**

**The precedent for shipping this is already on the shelf, and it is the exact mirror image.** The
Nicomachean Ethics ships **Ross**, which is US public domain on the pre-1929 rule and stays in
copyright in life-plus-seventy countries until **2042** — a limit stated outright in `rights` and on
the book's own front matter. Shorey is the same trade the other way round: clear in life-plus-seventy
countries since 2005, clear in the US in two instalments. The Ethics entry also records *why* that
trade was taken — the freely-licensed alternative (Chase) pairs on 18 of 181 Bekker pages against
Ross's 173 of 173 — which is this case precisely: Jowett pairs on nothing at all and Shorey would
pair on every Stephanus page.

Two honest options, and the choice belongs to the site's owner rather than to an importer entry:

1. **Rebuild now**, stating the limit in the Art of War / Ross form — public domain wherever the term
   is life plus seventy, and in the United States for Books I–V with Books VI–X following on
   1 January 2031. This is defensible and consistent, and it is what the Ethics already does.
2. **Wait until 1 January 2031** and rebuild on a clean claim in every jurisdiction.

Either way the work is small and already proven: both columns would be Perseus TEI on the same
citation scheme, which is the Dialogues' shape — *the only pairing in the Library that is exact by
construction at scale*. **It would also close `plato-dialogues` at 36 of 36**, since the Republic is
the missing dialogue and the reason it is missing is this same copyright.

One thing to settle first: replacing Jowett means the Republic's front matter, which currently
explains at length why there are no Stephanus numbers, has to be rewritten — and Jowett is a
perfectly good translation that a reader may prefer. Keeping both is not a shape this shelf has.

---

### B. The Book of Documents and the Classic of Poetry — one source answers both

**`ctext.org` (the Chinese Text Project) carries exactly what both books are missing**, and it
answers a different question for each.

**For `book-of-documents`, it supplies the pairing key.** The recorded blocker is precise and still
true: Chinese Wikisource gives every one of the received 58 documents a page, so the *chapter*
pairing is exact, but that transcription numbers nothing — not a paragraph number, not a 章 division
— so the only available pairing was by position, which agrees on **8 of the 58**. ctext's Shang Shu
is broken into **numbered paragraphs with Legge's English against each one** (verified on the Canon
of Yao). Those are Legge's own paragraph numbers, which is exactly what Folio's book already carries:
169 of them across 59 chapters. The key exists on both sides.

**For `classic-of-poetry`, it supplies two-thirds of the book.** ctext carries the **complete** Legge
— *The Chinese Classics*, volume 4, all 305 odes — with facing Chinese and numbered stanzas
(verified on Guan Ju: `[1] [2] [3]`, Chinese then Legge's English within each). Folio has 102 odes
and no Chinese; this would give 305 and a facing column, on the Art of War's own shape of one editor
numbering both halves.

Two alternatives were checked and **both confirm the existing record rather than overturning it**:

- **Wikisource's *Chinese Classics* volume 4 is still an Index-only transcription project** — both
  Part 1 and Part 2 — with "The She King" a red link in mainspace. The entry's claim that neither of
  Legge's complete versions "has been transcribed anywhere this could honestly be built from" holds.
- **Project Gutenberg ebook 9394** is the *Sacred Books of the East* volume 3 selection — the same
  102-poem text Folio already ships. Not a route.

**The blocker is a TERMS question, not a copyright one, and that is a different kind of problem from
any the shelf has met.** Both underlying texts are unambiguously free — Legge died in 1897 and
published in 1871/1879, and the Chinese is twenty-five centuries old. But ctext's own terms state
that "the use of automatic download software on this site is strictly prohibited, and that users of
such software are automatically banned without warning", and `fetch-book.js` is automatic download
software. The sanctioned route is ctext's **JSON API**, which supports a `gettext` call returning a
text in ordered paragraphs, with tiered access by API key. Its documentation also says "usage
restrictions and other terms and conditions apply to all usage of the API", and that the API appears
oriented to the Chinese text rather than the translations.

**AND ITS TRANSLATIONS CARRY AN ADAPTATION LAYER, which is a separate objection and bites only on the
English.** Recorded when the Book of Rites was added (Aug 2026), because that book went looking at ctext
for a complete Legge and had to turn it down. ctext's own FAQ divides its translations into three kinds:
copyright-expired translations "**manually adapted for the site**", published translations used by
permission, and a third kind "created through a combination of artificial intelligence and
crowdsourcing" — with no per-article statement of which is which, and the standing advice that "all
translations should be used with caution". That is the Histories' modernised-Godley layer with no editor
named and no way to tell the layers apart, so nothing from there can be shipped as "James Legge, 1885".
**It does not touch what section B actually wants**, which is the CHINESE source text and the paragraph
numbering — those are transcriptions of a classical text, not adapted translations — but anyone reading
this section and thinking "ctext has the English too" should stop there. Ask what a source has DONE to a
text, not only whether it has it.

**So the next step is not code.** It is to read the API's terms and, most likely, to write to the
Chinese Text Project describing what Folio is and asking whether an import for this purpose is
acceptable — the project is run by a named academic and this is precisely the use it exists to serve.
That is cheap, and it is the only route that does not involve doing the thing the site is asked not
to do. **Do not scrape the HTML pages**; the terms are explicit and the shelf's whole credibility
rests on this kind of care.

If the answer is no, the honest outcome is that both books keep their present front matter, which
already says why the column is absent — and the Poetry's front matter is unusually good on this
point, telling the reader outright that what they have is a third of the collection.

---

### C. The Poetic Edda — Old Norse via Bugge 1867, with three real caveats

`poetic-edda` is the newest book on the shelf and carries no facing original. There is a route.

**Sophus Bugge's *Norrœn fornkvæði* / Sæmundar Edda of 1867 is public domain everywhere** — published
1867, and Bugge died in 1907, so it clears the pre-1929 rule, life plus seventy and life plus a
hundred alike, with no limit to state. It is transcribed in full as clean HTML at
`etext.old.no/Bugge/`, all the poems plus the prose links and fragments.

**The pairing key exists on both sides.** Eddic poetry is cited by poem and stanza, Bellows numbers
his stanzas, and Bugge's transcription sets each stanza number in a right-aligned table cell beside
its text — with the edition's line numbers as a smaller figure in the same cell. Verified by
inspecting the markup of Hávamál directly rather than by reading a description of it.

**Three caveats, and the first is the one that decides whether this is worth doing at all:**

1. **It is a DIPLOMATIC text, not a reading text.** Bugge prints the manuscript's own orthography
   with abbreviations expanded in italic: Hávamál 1 opens `Gattir allar, aþr gangi fram, vm scoðaz
   scyli` where a normalised edition reads *Gáttir allar, áðr gangi fram, um skoðask skyli*. A reader
   arriving from Bellows would meet a column that does not look like any Old Norse they have seen. It
   is authentic and it is what Bugge printed, but it is a genuine cost and the front matter would
   have to say so plainly.
2. **The italics are load-bearing and must not survive as emphasis.** `v<i>m</i>` means the
   manuscript wrote a suspension that the editor expanded — it is an apparatus, not stress. Folio's
   `stripTags` keeps `<i>`, so left alone the column would ship with apparently random italic letters
   through every line, and **nothing would throw, no word would be lost and every count would read
   healthy** — the quiet shape this repo has catalogued a dozen times. Either the italics are dropped
   (losing the distinction the edition makes) or they are kept and explained.
3. **The poem list does not map one-to-one.** Bugge's index runs to 43 entries against Bellows' 35
   chapters, including prose links and fragments from the sagas, and Völuspá is a directory rather
   than a single file — which almost certainly means the Codex Regius and Hauksbók recensions are
   given separately, a choice that would have to be made rather than inherited.

**The obvious modern alternative must be REJECTED, on the shelf's own precedent.** Edward Pettit's
*The Poetic Edda: A Dual-Language Edition* (Open Book Publishers, 2023) is complete, scholarly,
openly available and formatted as a parallel text — and it is licensed **CC BY-NC 4.0** (verified on
the publisher's own page). The Gilgamesh entry rejects the electronic Babylonian Library in exactly
these words: it "licenses it for non-commercial use, which is not a licence this site can build on
and, more to the point, is not an expired copyright." The same rule has to bite here or it is not a
rule. Recorded so it is not rediscovered and adopted by someone who has not seen the Gilgamesh entry.

---

## 3. Confirmed still blocked — re-checked, no action

Each of these was fetched and re-measured for this audit. **All five records hold exactly as
written**, and one of them was nearly overturned by a bad reading.

- **`prose-edda` — *Háttatal* (3 of 4).** There are seven English translations of the Prose Edda:
  Dasent 1842, Blackwell 1847, Anderson 1880, Brodeur 1916, Young 1954, Faulkes 1987, Byock 2006.
  **Only Faulkes includes *Háttatal*, and it is in copyright.** All four public-domain translations
  omit it, and Brodeur omitted it deliberately, holding that its technical nature — a hundred-odd
  verse forms demonstrated in a praise-poem — forbids effective translation into English. **This gap
  is permanent and the `count: 3` / `total: 4` is correct.** It is an edition fact, and the book's own
  front matter should carry it if it does not already.

- **`prose-edda` — the Old Norse.** Unchanged: the only openly transcribed Old Norse Edda is Guðni
  Jónsson's, in copyright until 2044 and carried by permission rather than by expiry. Finnur Jónsson
  (d. 1934) would serve and is not transcribed anywhere reachable. **Note that Finnur Jónsson's own
  copyright expired in life-plus-seventy countries in 2005**, on the same arithmetic as Shorey above —
  so if an edition of his is ever scanned, the licence question is already answered.

- **`aristophanes-lysistrata` — the Greek.** The record says Rogers's translation is the obvious
  answer and that Wikisource's transcription is barely begun. **A search result claimed it was now
  "fully transcribed in mainspace"; fetching the page shows it is not** — it carries Wikisource's own
  "This work is incomplete" banner and red `Page:…/NNN` links running to page 133, and the transcribed
  portion prints no line numbers. This is the Dialogues' rule earning its keep twice in one
  afternoon: **ask what the source is missing, and do not trust a summary of a page over the page.**

- **`kalidasa-shakuntala` — the Sanskrit.** `Index:Sakoontala (Williams 1872).djvu` is still marked
  "To be proofread": of roughly 300 leaves a handful are done and the mainspace work does not exist.
  Unchanged. The other two grounds recorded there — that the columns would be different recensions,
  and that the Sanskrit source names no edition — are not time-dependent and would survive a completed
  transcription anyway.

- **`epic-of-gilgamesh` — the Akkadian.** Unchanged. George 2003 is in copyright; the electronic
  Babylonian Library is non-commercial; ETCSL carries the older Sumerian poems, which are different
  texts rather than this poem in its original words.

- **`aesop-fables` — the Greek.** Unchanged and not fixable in principle: Townsend numbers nothing and
  Chambry's Greek lists 359 fables alphabetically by Greek title with no numbering. Two unnumbered
  collections of different sizes in different orders have no shared key.

---

## 4. Two corrections to CLAUDE.md — **applied**

Both were records that had drifted from what is on disk, and one of them held up a licence decision.
Fixed in the same batch as this audit.

1. **"Twenty-seven books, nineteen originals"** → **twenty-eight**. `poetic-edda` was added and the
   sentence was not updated. It was stale twice over: 28 − 19 leaves **nine** books without an
   original and the sentence named only eight, the Poetic Edda missing from its own list. Both halves
   corrected; the originals count of 19 was right.
2. **Shorey "of 1935–37"** → **1930 and 1935** (1937 is volume 1's reprint). This is the sentence that
   keeps the Republic out of the Dialogues and the Greek off the Republic, and as written it obscured
   that volume 1 cleared US copyright in January 2026. It now states the position per volume and the
   life-plus-seventy expiry of 2005, and points here.

---

## 5. Suggested order of work

1. **Decide the Republic.** It is the largest gain for the least work, it is already unblocked in
   most of the world and half-unblocked in the United States, the precedent for stating the limit is
   on the shelf, and it closes two gaps at once. (The CLAUDE.md dates are already corrected — see §4 —
   so the entry now states the position rather than hiding it, whichever way the decision goes.)
2. **Write to the Chinese Text Project.** Cheap, and it is the only thing standing between the shelf
   and both a complete Classic of Poetry and two facing Chinese columns.
3. **Decide whether Bugge's diplomatic text is worth having** for the Poetic Edda. This one is a
   judgement about the reader rather than about licences, and it could reasonably go either way.
4. **Leave the rest.** *Háttatal*, the Prose Edda's Old Norse, Lysistrata, Shakuntala, Gilgamesh and
   Aesop are all correctly recorded as blocked, and the notes are not missing at all.
