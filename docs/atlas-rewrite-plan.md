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
| **A2** | Russia, Mexico, Ethiopia, Japan, Egypt, the Philippines, DR Congo, Vietnam | **shipped 2026-09-03** |
| **A3** | Iran, Turkey, Germany, France, the United Kingdom, Thailand, South Africa, Italy | **shipped 2026-09-04** |
| **A4** | Tanzania, Myanmar, Colombia, South Korea, Spain, Kenya, Argentina, Uganda | **shipped 2026-09-04** |
| **A5** | Algeria, Afghanistan, Ukraine, Sudan, Iraq, Poland, Canada, Morocco | **shipped 2026-09-04** |
| A6–A33 | The remaining 218 present-day countries and territories, in descending population | planned |
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

### A2 — the next eight by population (2026-09-03)

Russia, Mexico, Ethiopia, Japan, Egypt, the Philippines, DR Congo and Vietnam, continuing the descending
population order. All eight at the bar; five citations apiece, forty in all, every one open access and every
one curled before the batch was written. Six findings.

- **A COUNTRY'S DESCRIPTION CAN BE ABOUT SOMETHING ELSE ENTIRELY, AND NOTHING REPORTS IT.** `COUNTRY_INFO`'s
  `japan` entry was five sentences on the **Azuchi–Momoyama period** — Nobunaga's castle at Azuchi,
  Hideyoshi's sword hunt, the invasions of Korea — filed under the name of the modern state and shown to
  every reader who clicked Japan on any of the six eras it appears in. It reads as a perfectly good
  paragraph, it is five sentences of the old house style, and `atlas-audit.js` counted it as a box that
  exists. **A coverage count cannot see a description that is about the wrong subject**, so the rewrite pass
  is the only thing that will find the rest of them; read each existing entry before treating it as a
  starting hypothesis, which is what step 1 of the per-place workflow is for.
- **THE COMPARISON THAT CARRIES AN AREA CITATION SHOULD CITE BOTH COUNTRIES, AND THE WORLD BANK API TAKES A
  SEMICOLON LIST.** A1 established that an area citation has to hang on a ratio or a comparison rather than
  on a figure, because `stripInfoNoise` deletes the sentence and its marker with it. What A1 left is that
  the citation then named only the country's own series while the claim rests on two. C9 recorded that
  `api.worldbank.org/v2/country/AAA;BBB/indicator/…` serves a semicolon-separated list in one request; that
  URL is openable, `SRC_URL_RX` allows the semicolon, and each of these eight cites the two-country series
  its comparison actually stands on. **The anchor countries were chosen for a series the World Bank is not
  wrong about** — India, the United Kingdom, Italy, Germany, the United States, the Philippines — and Canada,
  the Dominican Republic and Monaco stay out of every comparison, per C11 and D1. France is out too: the
  series gives it 606,410 km², which is the republic including its overseas departments and not the country
  a reader pictures.
- **THE MAP CAN CHECK A NEIGHBOUR LIST, AND IT CAUGHT TWO.** Step 6 of the workflow says to read the
  description against the polygon; done as arithmetic — every claimed neighbour's own rings against this
  country's, at a 0.35° tolerance over `world.js` — it is a few seconds per place and it found that Russia's
  draft omitted **Poland**, which the map borders at the Kaliningrad exclave, and that Egypt's omitted
  **Palestine**, which the map draws at Gaza. Both drafts read as complete lists and both were short one
  state. Run the adjacency both ways: asking the map for a country's full neighbour set also confirmed DR
  Congo's "borders nine states" against exactly the nine named.
- **THE RECOGNITION GUIDE STILL DATES RECOGNITION, AND MEXICO IS C11's CASE UNCHANGED.** Grepped rather than
  assumed: `history.state.gov/countries/mexico` carries no 1821 anywhere, so no independence year is claimed
  for it. What the page does state is used instead — Spanish sovereignty ending with Napoleon's invasion of
  Spain in 1808, and Monroe receiving José Manuel Zozaya on 12 December 1822 — and the fifth source is
  **NARA's Milestone Document for the Treaty of Guadalupe Hidalgo**, which states outright that Mexico ceded
  55 per cent of its territory and names the states. That is a checkable claim about Mexico from a page that
  is really about the treaty, which is the same trade the Milestones make.
- **A NEIGHBOUR'S GUIDE PAGE CARRIES THE CLAIM THIS COUNTRY'S DOES NOT.** Ethiopia has no independence date
  to cite — its own page says the two states were "both long established" and dates only the 1903 treaty of
  commerce — so the fact that actually needs a source is that it is **landlocked**, and the page that states
  it is **Eritrea's**: independence declared 27 April 1993, "Eritrea previously had been under Ethiopian
  sovereignty." D3 used El Salvador's page for Nicaragua on the same reasoning. Where a country's own entry
  in the guide goes quiet, ask which neighbour's page the event is about.
- **AND WHERE THE GUIDE GOES QUIET ABOUT AN ERA, THE MILESTONE ABOUT THE EVENT ANSWERS.** Five of the eight
  take their fifth source from Milestones rather than from a statistical profile, and each is about an event
  rather than a state, which is why one page can carry several claims: the collapse of the Soviet Union
  dates Russia's succession and names the eleven republics that joined the CIS on 21 December 1991; the
  opening to Japan carries both the 1639 expulsion and Perry's four ships on 8 July 1853; the Philippine-
  American War carries the Treaty of Paris cession and the fighting from 4 February 1899; Congo
  decolonization carries the elections, the Force Publique mutiny of 5 July and the UN force of 13 July; and
  Ending the Vietnam War carries the Paris agreement of 27 January 1973 and the fact that neither party kept
  it. **The Milestones have been retired and are no longer maintained**, which the pages say at the top; they
  are still served, still stable and still the Office of the Historian's own text, so they are cited as they
  stand.

### A3 — the next eight by population (2026-09-04)

Iran, Turkey, Germany, France, the United Kingdom, Thailand, South Africa and Italy. All eight at the bar;
five citations apiece, forty in all, every one open access and every one curled before the batch was
written. Six findings, and the first is the one that will bite every batch after this.

- **A DESCRIPTION IS SHARED BY EVERY ERA, SO IT MAY NOT SAY ANYTHING ABOUT THE MAP IN FRONT OF THE READER.**
  Two drafts here did, and both were caught by asking which eras the place appears in rather than by reading
  the prose. France's said that French Guiana "is why the map shows France bordering Brazil and Suriname" —
  true of `world.js`, and **France also appears in the 1500 era**, where it does not. Italy's said San Marino
  and Vatican City are "drawn on this map as separate countries" — true of `world.js`, and **neither of them
  appears in ANY of the thirteen eras**, so that sentence would have been false on every historical map Italy
  is drawn on. The bar already says a description may not be written as a companion to one era; what these
  two show is that the failure arrives dressed as the step-6 map check, which is otherwise the most useful
  thing this pass does. **State the fact about the country, not about the polygon**: the republic's own land
  frontiers reach Brazil and Suriname, and Rome is the only capital that contains a foreign state — both true
  in 1500 and today.
- **THE MAP'S ADJACENCY CHECK PAID AGAIN, AND ONCE IT SAID DO NOT COUNT.** Run over `world.js` at a 0.35°
  tolerance it confirmed the United Kingdom's "only land border is with Ireland" and Thailand's four
  neighbours exactly, and it caught a superlative that is simply wrong: Germany's draft said nine land
  neighbours, "more than any other European state", and **Russia has fourteen**. It also showed why a COUNT
  is riskier than a LIST — Iran's eight map-adjacent states include Kuwait across the Persian Gulf, so the
  description names the seven land neighbours and claims no total.
- **IRAN IS D2's AREA DISAGREEMENT AND THE COMPARISON HAD TO SURVIVE IT.** UNdata gives 1,630,848 km² and
  the World Bank 1,745,150, seven per cent apart and neither adjudicable from here — the widest standing
  disagreement the glossary pass recorded. The area citation therefore hangs on a claim that is true under
  **both** figures: more than half as large again as Egypt is 1.63 on UNdata's number and 1.74 on the World
  Bank's. **When two sources disagree, pick a comparison coarse enough that the disagreement cannot change
  the answer**; that is cheaper than adjudicating, and honest.
- **FRANCE HAS THREE OFFICIAL AREAS, AND THEY ARE THREE DIFFERENT FRANCES.** UNdata gives 551,500 km²,
  the World Bank 606,410 and the EU's own country page 638,475, which is not a data-quality problem but a
  definitional one: metropolitan France, an intermediate FAO figure, and the republic including its five
  overseas departments. **No France area comparison is safe unless it holds under all three**, so the
  description claims only that it is the largest member state of the European Union by area, which beats
  Spain's 505,976 on every one of them.
- **UNDATA'S FOOTNOTES CARRY CLAIMS ITS FIELDS DO NOT.** South Africa's Capital city field says only
  "Pretoria", and footnote *c* at the bottom of the same page says "Pretoria is the administrative capital,
  Cape Town is the legislative capital and Bloemfontein is the judiciary capital" — the whole three-capital
  fact from Source A, where the field alone would have made the description wrong by omission. **Read the
  footnote block, not just the table**; the world-geography plan already records that twelve countries have
  more than one seat, and this is where the Atlas learns which.
- **AND THE EU COUNTRY PAGE IS INTACT — THE LABEL CHANGED, NOT THE BLOCK.** C1 recorded the Key Facts block
  as Capital, Geographical size, Population and "EU Member State : since <date>"; a first pass here reported
  three of those four missing and it was the extraction, not the page — the label is **Capital**, not
  *Capital city*, and the figures sit under a **Figures :** heading. All four fields are still served for
  Germany, France and Italy, each with the founding date of 1 January 1958. **Confirm a spine source is
  really broken before recording it as broken**, which cost two minutes here and would have retired a
  working source for every European batch after this one.

### A4 — the next eight by population (2026-09-04)

Tanzania, Myanmar, Colombia, South Korea, Spain, Kenya, Argentina and Uganda. All eight at the bar, and
**South Korea carries six citations rather than five** for the reason given below. Every URL curled before
the batch was written; every source open access. Six findings.

- **AN "OFFICIALLY" CLAUSE MUST BE CLOSED BY A COMMA, AND NOTHING MAY BE ADDED INSIDE IT.** `officialName`
  reads `\bofficially\s+(?:the\s+)?(.+?)\s*[,(.;:]` — non-greedy up to the first comma — so Myanmar's
  draft, which opened "officially the Republic of the Union of Myanmar and long known abroad as Burma,",
  put **the whole of that clause in the panel title**. It was caught in the browser and not by any check:
  `add-place-info.js` cannot see it, the sentence reads perfectly, and the failure is a title six words too
  long rather than an error. The fix is one comma. **A country with a second widely used name gets it in
  its own clause**, after the official one is closed.
- **THE RECOGNITION GUIDE HAS TWO KOREA PAGES AND THEY ARE DIFFERENT WORKS.** `/countries/south-korea` is a
  404; what answers is **`/countries/korea`**, on the Kingdom of Choson — the treaty of amity and commerce
  signed with the United States at Chemulpo on 22 May 1882, the first Korea signed with any western nation,
  and Japan taking over Korean foreign relations on 17 November 1905 — and **`/countries/korea-south`**, on
  the Republic of Korea, recognised on 1 January 1949. Neither page has a Summary section, which is why a
  scrape written for the usual shape came back empty from both. South Korea therefore cites both, plus the
  Korean War milestone for the division at the 38th parallel, and runs to six sources: **the bar is a floor,
  and a country whose history needs a sixth work should have one.** (The Korea plan already records that the
  guide has no page for North Korea at all.)
- **MARK ONLY WHAT THE PAGE ACTUALLY SAYS, AND THE COMMONWEALTH PAGE IS SHORTER THAN IT LOOKS.** Tanzania's
  draft carried a sentence about the union of the mainland with Zanzibar marked to the Commonwealth's own
  country page; grepped, that page contains **one** mention of Zanzibar — "The country includes the island of
  Zanzibar" — and **no** mention of 1964 or of the union at all. The sentence was rewritten to what the page
  does carry, which also gave Kilimanjaro's "highest point in Africa" a citation it had been asserting
  unmarked in the first block. **Grep the saved page for the year before marking a sentence to it** — the
  same two-second check C11 recommends for the recognition guide's independence dates.
- **THE COMMONWEALTH PAGE IS ALSO WHERE A SECOND SEAT OF GOVERNMENT TURNS UP.** UNdata gives Tanzania's
  capital as "Dodoma" and nothing else; the Commonwealth's Key Facts give "Dar es Salaam (acting), Dodoma
  (official)". That is A3's South Africa finding one source over — the fact is real, the field is not where
  it lives — and between the two, **UNdata's footnote block and the Commonwealth's Key Facts are where the
  Atlas learns which countries have more than one seat.**
- **MY OWN WORD COUNT HAD TO BE MADE THE TOOL'S.** The draft checker replaced tags with a space where
  `add-place-info.js` deletes them, so `<b>Spain</b>,` counted as two tokens against the tool's one, and
  Spain was refused at 269 words after passing the draft check at 270. The scratch checker now uses the
  tool's own expression. **A pre-flight check that is a paraphrase of the gate is a check that will
  disagree with it at the boundary**, and the boundary is where a 270-word bar puts every short entry.
- **SPAIN IS C2's POPULATION DIVERGENCE, STILL THERE AND NOW THREE-WAY.** UNdata gives 47,890 thousand, the
  EU's own country page 49,077,984 and the World Bank 49.36 million — the EU and the World Bank agreeing
  against Source A, exactly as C2 recorded. It costs this pass nothing, because `stripInfoNoise` means no
  description states a population figure at all; the ratio claim rests on the World Bank series. **Where a
  figure is contested, the rule that keeps figures out of the prose is also what keeps the prose right.**

### A5 — the next eight by population (2026-09-04)

Algeria, Afghanistan, Ukraine, Sudan, Iraq, Poland, Canada and Morocco. All eight at the bar, five
citations apiece, every URL curled and every source open access. Six findings, and the first supersedes
A4's version of it.

- **THE WORD "OFFICIALLY" MAY APPEAR ONCE IN A DESCRIPTION AND ONLY IN THE OPENING CLAUSE.** A4 recorded
  that an "officially" clause must be closed by a comma; that was the narrow case. `officialName` searches
  the WHOLE description for `\bofficially\b` and takes everything up to the next comma, so Afghanistan's
  eighth sentence — quoting the guide's "officially free and independent in its affairs" — put **that
  phrase in the panel title**, on a country whose opening sentence had no official-name clause at all.
  **A one-line audit over every cited place now exists and should be run after each batch**: flag any
  `officially` more than ~90 characters in, and any resolved title longer than 60 characters. Run over all
  forty entries it found exactly this one, which is the reassuring half of the result.
- **WHERE A STATE'S OFFICIAL NAME IS CONTESTED, LET THE TITLE FALL THROUGH TO THE MAP'S OWN NAME.** Neither
  UNdata nor the recognition guide gives Afghanistan a long form — both say simply "Afghanistan" — and the
  two long forms in circulation are the competing claims of two governments. Writing no "officially" clause
  is the neutral course and needs no special case: `officialName` already returns the short name, exactly as
  it does for Japan, Canada and the United States.
- **CANADA IS THE COUNTRY A1's AREA WARNING WAS WRITTEN ABOUT, AND IT NEEDED THE OPPOSITE TREATMENT.** A1
  recorded that a global area ranking is unsafe because `AG.SRF.TOTL.K2` gives Canada 15,634,410 km²
  against the true 9,984,670. Here the country needing a ranking IS Canada, so the World Bank series was
  **dropped from its source list altogether** and its area rests on the two works that agree — UNdata's
  9,984,670 and the Commonwealth Secretariat's rounded "10 million" — with the Commonwealth page also
  carrying its 1931 entry under the Statute of Westminster. **The fix for a series that is wrong about one
  country is to stop citing it for that country**, not to avoid the claim.
- **SUDAN HAS NO SURFACE AREA FIELD AT UNDATA AT ALL**, which C9 recorded and which is still true: its
  profile is the only one in the pass that omits one. Its area therefore rests on the World Bank series
  alone, stated here rather than hidden, and the comparison chosen is coarse — nearly twice the size of
  Egypt — so that a single source is carrying as little weight as possible.
- **A NEIGHBOUR'S GUIDE PAGE CARRIED SUDAN'S OWN RECENT HISTORY**, as Eritrea's did Ethiopia's in A2.
  Sudan's page states the 1956 independence and the Anglo-Egyptian condominium and stops; **South Sudan's**
  page carries the recurring north-south civil wars, the Comprehensive Peace Agreement of 2005, the
  referendum of January 2011 and the declaration of 9 July 2011. That is now the second time the route has
  paid, and it is worth reaching for whenever a country's own entry goes quiet after independence.
- **UKRAINE'S UN SEAT IS C3's TRAP AND THE SENTENCE SAYS SO.** UNdata gives 24 October 1945, which is the
  Ukrainian SSR's own seat and not the date of anything the modern state did; the description states the
  date and immediately says it was taken up while the country was a constituent republic of the Soviet
  Union. **A date that would mislead standing alone can still be used, provided the sentence carries what
  makes it not mislead** — which is cheaper than dropping it, and tells the reader something true.
