# The Atlas information pass

Rewriting every place's popup to the standard a Folio card is held to, with citations, and retiring the
year-specific paragraph while it is done.

On request (Aug 2026): *"I want to start rewriting the info boxes of the countries of every year we have so
far, but with source citations. Since we are also making geography cards to study now, we can link the two;
a place's popup info box should contain the same info as the cards, so we already have 5 geography cards to
serve as example for the 5+5 sentence format. The year-specific information section can be removed for now;
research for it is difficult and it slows down our first release build. While you're re-writing the
information sections you should also check and refine their borders while you're at it, if possible. Plan
out batches to do this for every info box for every and city we currently have until all is rewritten and
refined."*

---

## The bar

**A place's description is a geography card's background.** `geo-001` California is the exemplar and the
figures below are read off it rather than recalled:

- **Exactly 10 sentences in two blocks of 5**, split by ` <br><br> ` — the first five the general meaning,
  the second five what makes this place itself.
- **270–330 words** (geo-001 is 285), at the site's ordinary register: a bright 17-year-old, precise words
  welcome, specialist vocabulary glossed on first use.
- **The place's own name in `<b>` at its first mention**, opening the description.
- **`SRC_TARGET`-many citations — five** — each in Chicago note form ending in an openable URL, each
  pointed at by at least one `<sup class="fn" data-fn="N"></sup>` marker written EMPTY, and each referenced
  by at least one marker. The majority must be open access.
- **Metric first, imperial in parentheses.** The conversion is not charged against the word count.
- **No parentheses otherwise**, no glossary `ttip` links written by hand (the panel auto-links), BCE/CE.
- **Impartial and self-contained**, as a glossary description is: the panel is shared by every era, so a
  description may not be written as a companion to one of them.

What the card carries in `facts` the panel already carries in its **Figures** grid, which is fed from
`country-stats.js` and is untouched by this pass.

**Nothing is invented.** A figure, a date or a citation rests on a source that was actually opened.

---

## What there is to rewrite — measured, not estimated

Counted over `world.js` + `timeline.js` against `countries.js` on 2026-08-21:

| | names | have a box | have none |
|---|---|---|---|
| Present-day countries and territories (`world.js`) | 258 | 254 | 4 |
| Era territories, all thirteen eras (`timeline.js`) | 1,193 | 607 | 586 |
| **Union of the two** | **1,210** | 625 | 585 |
| Era cities (`timeline.js`) | 556 | — | — |

`COUNTRY_INFO` holds 672 entries, of which **650 are already five sentences** — the old house style. Word
counts run 56–257 with a median of 125, so nearly every entry is **less than half** the new bar's length.
**`COUNTRY_SOURCES` and `COUNTRY_YEAR_SOURCES` are both EMPTY**: not one Atlas place is cited today.

**A CITY HAS NO INFORMATION BOX, and that is a fact about the Atlas rather than a gap in this table.**
Clicking a capital flies the globe and shows its pin label; the panel that opens belongs to the STATE the
capital is in (`showCountryPopupName`, and the Find-it game's `gameReveal` routes a capital to
`ownerAt`). So "every info box for every country and city" resolves, today, to the 1,210 country and
territory names above. **Giving 556 cities panels of their own is a FEATURE rather than a rewrite** — it
needs a hit test, a popup route, a data table and 556 more descriptions — so it is recorded here as an
open decision for the site's owner and is deliberately not folded into a rewriting pass.

### The three stages, and why the middle one is not the hard one

| stage | what | names | uncovered |
|---|---|---|---|
| **1** | Present-day countries and territories | 258 | 4 |
| **2** | Historical states on 1500 / 1700 / 1800 / 1900 / 1920 / 1938 / 1960+ | 424 | 78 |
| **3** | Names appearing ONLY in the 1600 era | 528 | 506 |

**The 1600 snapshot is the outlier and it is a different KIND of thing.** That era carries 626 names against
every other era's 129–242, because the source digitises peoples rather than states at that date — Atakapa,
Karankawa, the Malay and Bornean sultanates, the Swahili city-states, Wadai, Lunda, the Tunjur kingdom. 506
of its 528 own names have no description at all, and **the sources for them are anthropological and
historical rather than statistical**: UNdata has nothing to say about the Karankawa, and the recognition
guide begins in 1776. Stage 3 therefore comes last, and is the one place this plan expects to argue for a
**shorter bar** — three sentences and two citations, the glossary's bar, rather than ten and five — because
a people that left few written records cannot honestly carry ten sentences and five open citations, and
padding one to length is the way this pass could do real damage. **That is a decision to take when stage 3
is reached, on the evidence, and not now.**

---

## The source spine

Measured from this sandbox on 2026-08-21, each with a real User-Agent:

| source | what it carries | status |
|---|---|---|
| `data.un.org/en/iso/<cc>.html` | population, surface area, capital, region, UN membership date | **200** |
| `history.state.gov/countries/<slug>` | independence and recognition, in prose, for every state | **200** |
| `api.worldbank.org/v2/country/<ISO3>/indicator/SP.POP.TOTL?format=json` | the whole population series | **200** |
| `api.worldbank.org/v2/country/<ISO3>/indicator/AG.SRF.TOTL.K2?format=json` | surface area (FAO, not the UN) | **200** |
| `thecommonwealth.org/our-member-countries/<slug>` | Key Facts for 56 states | 200 |
| `european-union.europa.eu/principles-countries-history/eu-countries/<slug>` | EU member profiles | 200 |
| `britannica.com` | — | **403** |
| `cia.gov` World Factbook | — | 302 to a JavaScript shell |

**This is the glossary citation pass's Phase 3 spine, and every finding it recorded applies unchanged** —
see `docs/glossary-citation-plan.md`, batches C0–C12 and D1–D3. The four that will bite hardest here:

- **Read BOTH sources before concluding a figure is wrong.** Two official sources routinely disagree by more
  than the description's own error (C2's Spain, C9's Libya, C10's Kiribati).
- **`SP.POP.TOTL` is a diagnostic, not a second source** — it usually relays the UN's own estimate. Ask it
  when a figure was true: a figure that names a year on the series is STALE and safe to update; one that
  names none is CONTESTED and must be left alone (C8; C11's Cuba).
- **A recognition date is not an independence date** (C11), and the guide's *summary* paragraph often
  carries the independence year where its recognition paragraph does not (C12).
- **`AG.SRF.TOTL.K2` contains outright errors** — Canada at 15.6 million km², Monaco at 75 — so apply a
  plausibility check before letting it adjudicate (C11, D1).

A historical state has no statistical profile at all, so stage 2's spine is **the recognition guide, the
UNESCO and national-archive records for a colony's own administration, and the out-of-copyright shelf**
that the China deck has been running on since `cnh-001` — Mayers, Legge, Chavannes, Doré, Wylie, Giles,
and the archive.org scans of the standard 19th-century reference works. Batch 25 of the card pass and G4
of the glossary pass both record the rule: **for a 19th-century subject, a 19th-century work is a source
rather than a fallback**, and it is out of copyright.

---

## What "check and refine their borders while you're at it" can and cannot mean

The era geometry is **not hand-drawn**: it is imported by `.claude/build-era.js` from the
*historical-basemaps* dataset (CC BY-SA 4.0), topology-preservingly simplified, classified interior-vs-coast
and welded to the present-day coastline. So a place's borders cannot be refined while its description is
being rewritten, in the sense of moving vertices — that would diverge the era from its source and break the
shared-edge invariant the whole renderer rests on.

**What CAN be done, and is in this plan:**

1. **Re-run each era's own build checks and read the counts.** `build-era.js` already reports overlapping
   features removed, coast-junction welds made, and residual far-floats left; a count that moves is how a
   source-quality error is found (the 1938 stale Israel/Hejaz overlaps and the 1900 Ottoman deletion were
   both found that way).
2. **Read every rewritten place against its own map at its own year.** A description saying a state
   reached the sea, or bordered a named neighbour, is a claim the reader can check against the polygon in
   front of them — and where the two disagree, one of them is wrong. That is a check the description pass
   is uniquely placed to make and nothing else on the site makes.
3. **Record a divergence rather than repairing it.** Where the geometry is wrong and the source is what is
   wrong, the honest output is an entry in this file's batch log naming the era and the territory, so a
   later `build-era.js` pass or a `SUPPLEMENT` region has something to act on.

**Anything past that is a geometry job with its own plan**, and saying so here is better than a batch log
full of borders that were "checked" by looking at them.

---

## The three code changes this pass needs

Shipped in **batch A0** below, before any prose is written:

1. **`#cpDesc` must render HTML.** It is filled with `textContent` today, so a footnote marker would print
   as nothing at all. It goes through `sanitizeHTML`, like every other surface that carries prose.
2. **The source list needs a `.src-note` and the panel needs `wireFootnotes`.** `sourceListHTML` emits a
   bare `<ol class="src-list">`; `wireFootnotes(scope)` looks for `scope.querySelector(".src-note")` and
   `noteForNode` climbs for the same class. Without both, a marker resolves to nothing, is removed as
   over-range, and the apparatus silently does not exist. `wireFootnotes(cpColsEl)` is the call: `#cpDesc`
   and `#cpSrcSec` are both inside `.cp-cols`.
3. **The year section is gated off behind ONE switch** (`ATLAS_YEAR_PROSE`, beside `MULTILANG` in spirit),
   leaving `country-years.js` on disk and every reader of it intact. The request is "removed **for now**",
   and a switch is what makes "for now" true — deleting 682 researched paragraphs to satisfy a temporary
   scope decision is the one irreversible thing in this plan.

---

## The tooling

**`node .claude/add-place-info.js <batch.json>`** — the Atlas's counterpart of `add-sources.js`, written in
batch A0. It takes

```json
{ "places": { "<map name, any case>": { "desc": "<10 sentences with markers>", "sources": ["…", "…"] } } }
```

and writes `countries.js` and `country-sources.js` together, because a description and its citations are
one edit. It enforces, and REFUSES the batch rather than half-applying it:

- exactly 10 sentences in 2 blocks of 5, 270–330 words (an imperial conversion not counted);
- the place's own name bolded at its first mention;
- at least `SRC_TARGET` (5) citations, each ending in a URL, each referenced by a marker;
- no marker past the end of the list;
- the name known to `world.js` or `timeline.js` — a description filed under a name the map never shows is
  a description nobody will ever see.

It reports running coverage against the 1,210, which is how a pass this long is tracked.

**`node .claude/atlas-audit.js`** reports the same coverage standing alone, per stage and per era.

---

## The batches

Eight places a batch: that is a geography card's worth of research and prose each, and the card pass runs
five to ten. **Stage 1 is 33 batches**, and stages 2 and 3 are sized when they are reached — stage 3's bar
is an open question and its batch size follows from the answer.

| batch | places | state |
|---|---|---|
| **A0** | the three code changes, `add-place-info.js`, `atlas-audit.js` | **shipped 2026-08-21** |
| **A1** | The eight most-studied present-day countries | **shipped 2026-08-21** |
| A2–A33 | The remaining 250 present-day countries and territories, in descending population | planned |
| B1–… | Stage 2, the 424 historical states, grouped by era | planned |
| C1–… | Stage 3, the 528 names of the 1600 era, at a bar to be decided | planned |

### Ordering within a stage

**Descending population**, because that is the order a reader is likeliest to open them in, and because the
statistical spine is thickest at the top and thinnest at the bottom — a pass that runs out of sources runs
out of them at the end rather than in the middle.

### The per-place workflow

1. **Read the existing description** — it was written from Wikipedia and fact-checked, and its claims are
   the starting hypothesis rather than the answer.
2. **Open UNdata and the recognition guide.** Two fetches carry the figures and the independence date.
3. **Ask the World Bank series what year the old figure was true**, before correcting or keeping it.
4. **Write ten sentences**, five general and five particular, at 270–330 words.
5. **Mark each claim to the work it rests on**, empty markers, and check every source is referenced.
6. **Look at the place on the map at each era it appears in**, and read the description against it.
7. **Run `add-place-info.js`**, then `node .claude/test-atlas-places.js` and `node .claude/test-sources.js`.

---

## Batch log

### A0 — the code and the tools (2026-08-21)

The three changes above, plus `add-place-info.js` and `atlas-audit.js`. Findings:

- **The panel could never have shown a footnote.** `cpDescEl.textContent` and a source list with no
  `.src-note` are each independently fatal to the apparatus, and both were in place, so the citation
  pipeline that has run on cards and the glossary since July 2026 had **no path to the Atlas at all** —
  which is why `country-sources.js` shipped empty and stayed empty. It reads as a content backlog and is
  half a wiring gap.
- **The year section is a page in the phone's pager**, not merely a fold, so gating it off had to drop it
  from `cpSyncDots` too — otherwise the sheet keeps a dot for a page that renders nothing, and a swipe
  lands on a blank screen.

### A1 — the eight most-studied countries (2026-08-21)


India, China, the United States, Indonesia, Pakistan, Nigeria, Brazil, Bangladesh — the eight most
populous states, and the eight most likely to be the first box a reader opens. All eight at the bar; five
citations apiece, forty in all, every one open access. Six findings, and the first governs every batch
after this one.

- **THE DESCRIPTION MAY NOT STATE THE FIGURES GRID'S OWN NUMBERS, AND A CITATION ATTACHED TO ONE IS A
  CITATION THAT DISAPPEARS.** `stripInfoNoise` (app.js) splits the description into sentences and **drops
  any sentence** matching a currency followed by a digit, a number followed by *million* / *billion* /
  *trillion*, or a number followed by km² / sq mi — because those belong to the four stat tiles and the
  prose used to repeat them. That rule predates this pass and is right; what it means now is new. A
  sentence dropped at render **takes its `<sup class="fn">` marker with it**, so the citation it pointed at
  is left in the list with nothing referencing it — the exact fault `add-place-info.js` refuses a batch
  for, arriving *after* the batch was accepted and visible only to a reader who opens the box. So a place's
  population and area citations have to be hung on a claim that is **not** a figure: a *ratio* (India's
  population has more than tripled since 1960; Pakistan's more than quintupled), or a *comparison* (the
  seventh largest country in the world; more than six times the size of Mongolia; the largest state in
  South-eastern Asia; it would fit into India more than twenty times over). Both rest on exactly the World
  Bank series a bare figure would have cited, and neither can be stripped. **Check a draft against the
  rule before running the tool**; the scratch checker used here is ten lines and prints any sentence the
  panel would delete.
- **A GLOBAL AREA RANKING IS UNSAFE AND A REGIONAL ONE IS NOT.** CLAUDE.md's own C11 finding records that
  `AG.SRF.TOTL.K2` carries outright errors — Canada at 15,634,410 km² against the true 9,984,670 — so a
  claim of the form *the Nth largest country in the world* rests on a series that is wrong about at least
  one of the countries above it, and the China-against-the-United-States question for third place is
  contested by convention rather than by measurement. India's seventh is safe because the six above it are
  not in dispute; everything else here is a neighbour comparison or a rank within a UN region, each
  checked against the series entry by entry.
- **THE RECOGNITION GUIDE DATES RECOGNITION, WHICH IS OFTEN NOT INDEPENDENCE — AND FOR THREE OF THESE EIGHT
  IT STATES NO INDEPENDENCE YEAR AT ALL.** C11 and C12 already record the first half. Grepped rather than
  assumed here: the guide's country pages give no 1822 for Brazil, no 1971 for Bangladesh and no 1945 for
  Indonesia, so none of those three dates could rest on it and none is claimed. What the pages *do* state
  is used instead and is often better — Brazil recognised on 26 May 1824 when Monroe received José
  Silvestre Rebello, Bangladesh on 4 April 1972 in a statement by Secretary of State William Rogers,
  Indonesia on 28 December 1949 when the ambassador presented his credentials to Sukarno. India and
  Pakistan are the easy case, the guide naming the India Independence Act of 18 July 1947 and the date it
  took effect.
- **`un.org/en/about-us/member-states` CANNOT CARRY A FOUNDING-MEMBER CLAIM.** It is reachable and it looks
  like the right source; the served HTML is a list of names with **no admission dates and no "original
  members" sentence anywhere in it**, so a citation on it would point at a page that does not say the
  thing. The UNdata country profile states each state's own membership date in a field, which is what every
  one of these eight cites. Where a fifth work was wanted the Office of the Historian's **Milestones** are
  the answer — they are about EVENTS rather than states, so one can serve two countries honestly (the
  Monroe Doctrine for the United States and for Brazil; decolonisation 1945–1960 for India and Nigeria).
- **THE UNITED STATES HAS NO PAGE IN THE RECOGNITION GUIDE**, the guide being written from the United
  States outward — the same gap C11 met. NARA's Milestone Document for the Declaration of Independence
  stands in, which is a stronger source for that claim than a recognition page would have been.
- **A description must still open "X, officially the Y," or the panel loses its title.** `officialName`
  reads the raw description with a regex for *officially*, and it is what puts *Republic of India* at the
  head of the box rather than the map's own short name. Verified in a browser on all eight; the United
  States correctly falls through to its short name, that being its official one. The same check confirmed
  the apparatus end to end — India's eight markers numbered 1,1,5,1,2,2,3,4 with none removed, five items,
  five links, five back-links, the year section hidden and the phone's pager down to three dots.
