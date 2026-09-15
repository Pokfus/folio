# The World geography backgrounds — a rewrite plan

*Opened Sep 2026, on request: "the background sections of geography cards that are not the United States
or US-controlled … should never mention the United States or the card's relationship with it. No
geography card should ever mention any information in its background section that is already mentioned in
its data grid or data about the country it's in. Background sections should primarily mention its
geography, climate, and history."*

**READ THIS BEFORE REWRITING A `gw-` BACKGROUND.** The three rules above are one job, and the job is
larger than it looks from any one card. This file states how large, why, what has already shipped, and
the batches the rest of it wants.

## What is wrong, measured

**`node .claude/gw-audit.js` is the measure — run it rather than quoting the table below.** The three
rules are three questions about one card, and the first cut of this pass answered two of them with
regexes it did not write down: it reported 205 grid repeats and 119 landscape mentions where the
committed script reports 396 and 237 on the same data, because the earlier sweep matched only whole
`facts` values and a shorter word list. **A figure in prose cannot say how it was taken.** The script
can, so what follows is a dated reading of it and not the authority.

| as measured on 2026-09-06, before the first batch | |
|---|---|
| `gw-` cards | 468 |
| …whose background mentions the United States | **419** |
| mean share of a background's sentences that do | **31%** |
| …that are the United States or a US territory, and legitimately may | 7 |
| cards citing `history.state.gov` | 406 |
| facts-grid values repeated in a background | **396** |
| …whose background names no landform, water or weather at all | **237** |
| **date lines that name the United States** | **194** |

The last row is the one the plan did not have. A date line is not prose, so nothing in the three rules
reaches it — and 194 `gw-` cards print `US recognition`, `First US consul` or `Relations severed` in the
key/value list directly under the answer term, six of them (`gw-513` Cairo, `gw-516` Hanoi, `gw-521`
London, `gw-525` Rome, `gw-533` Algiers, `gw-534` Baghdad) with nothing else in the list at all. **Rewrite
a card's date line in the same batch as its background**, out of the same research; it costs one line in a
`set-date-line.js` batch and there is no other moment when the dates are to hand.

The cause is not carelessness, it is the SOURCE. The collection was written from the Office of the
Historian's *Guide to the United States' History of Recognition, Diplomatic, and Consular Relations, by
Country* — which is the one openable work with a page for every state on earth, and which is the reason
the collection could be written at all (see the C7 finding in `docs/glossary-citation-plan.md`). It is
written from the American point of view, so a background written out of it is a history of *American
recognition of* the country rather than a history *of* the country. `gw-008` Bangladesh is the clearest
case: nine of its ten sentences are about Washington's hesitation, Nixon's message and the date an
American consulate opened.

## The four rules, and what each costs

1. **No United States, on a card that is not one.** Seven cards are exempt by subject — `gw-003` the
   United States and the six territories it administers. On the other 412 the American material has to
   come out, and it is a third of the prose, so what replaces it is not an edit but new research.
2. **Nothing the data grid already says.** `facts` prints Capital, Population, Largest city and Area
   under the answer term. A background repeating the grid is spending a tenth of its 300 words saying
   what is already on screen two inches above.
3. **Geography, climate and history first.** This is the positive half of rule 1 and the one that makes
   the collection worth studying: a card asking a reader to recognise a shaded country should tell them
   what that country IS.
4. **No list of the countries that border it** (Sep 2026, on request). The card draws the country on a
   globe with every neighbour around it, so the neighbours are the one thing on the card a reader can
   already see — and a border list is the single commonest opening a statistical profile hands you, so
   it arrives by default rather than by choice. **It is rule 2 one step out**: the same objection to
   spending the prose on what the page has already said. The replacement is not a shorter sentence but
   the SAME sentence with each neighbour swapped for the sea, the region or the landform it stands in —
   "the Gulf of Guinea along its southern edge", "the dry interior of Asia stretching away to its west" —
   which keeps the bearings, keeps the length, and needs no new source.
   · **A SEA IS NOT A COUNTRY AND STAYS.** The Bay of Bengal, the Gulf of Aden and the Sea of Japan are
     what a coast faces, and naming them is the rule doing its job rather than breaking it.
   · **NOR IS A HISTORICAL MENTION A BORDER LIST.** A card may still say that a partition line was drawn
     across a subcontinent, or that a frontier was protested for fifty years — that is the country's own
     history, which rule 3 asks for. `gw-005` and `gw-053` are reported by the audit for exactly those
     sentences and are correct as they stand.
   · **AND AN ADJECTIVE COUNTS.** "the Cameroonian border", "the Kenyan border", "at the Zimbabwean and
     South African borders" name a neighbour as surely as a list does, and each was rewritten to a
     bearing.

## Rule 5 — the history paragraph is the WHOLE history

*Added Sep 2026, on request: "In the geography collections, the second paragraph of each background
section always covers its history. It should always summarise the entire history of the main answer
term, not some brief moment of it."*

**READ THIS BEFORE REWRITING ANY GEOGRAPHY BACKGROUND.** Rules 1–4 above are about a background
written out of an American source and bind on the world deck alone. **Rule 5 binds on all three
geography collections** — `gw-` the world, `geo-` the United States, `gc-` China — because it is not
about where the prose came from but about what a history paragraph is FOR.

A geography background is ten sentences in two blocks of five: the first says what the place is and
where, the second how it came to be. The second block is therefore the card's whole account of its
subject's past, and it has to read like one — from the earliest polity or settlement the sources
support, through whatever the place was before it was this, to what it is now. **A paragraph that
picks up at independence and stops is a paragraph about the last fifty years wearing the heading of
five thousand.**

**`gw-001` India is the case that shows what is wrong.** Its history block names 1945, 1946 and 1947
and nothing else: the Cripps aftermath, the Quit India movement, the interim government and the
Independence Act. Every sentence of it is true and cited. Between them they cover **two years** of a
history that runs from the Indus cities to the republic, so a reader who studies the card learns that
India is a country that was partitioned in 1947 and nothing whatever about what was partitioned.

### Why the deck came out this way

The same cause as rule 1, one step on. The collection was written from the Office of the Historian's
recognition guide, which has a page for every state on earth and begins each of them at the moment
American diplomats first took notice — so a background written out of it starts late by construction.
Rule 1's pass took the United States out of the prose and left the **shape** of the source behind: the
sentences no longer say Washington, and they still begin in 1947, 1960 or 1991.

The capitals half has the same fault from a different source. A city's history block was written out of
the constitution that names it and the statistical profile that counts it, both of which are documents
about the present, so it often runs from the founding decree to the current census and skips whatever
stood on the ground first.

### The measure

**`node .claude/geo-history-audit.js` — run it rather than quoting the table below.** It is
report-only, exits 0, and is a **separate script from `gw-audit.js` deliberately**: rule 1 is nonsense
on the United States collection, so reaching rule 5 by running that script at `--prefix=geo-` would
report a hundred legitimate mentions of the United States as violations, and a check that reports the
house style is a check nobody runs.

It asks three questions of the second block, and the second and third are the rule:

| | |
|---|---|
| **5a** | the history block names **no date at all** |
| **5b** | its dates span **under 300 years** — the earliest and the latest are one moment |
| **5c** | its earliest date falls **after 1800** — it does not reach back at all |

as measured on **2026-09-14**, before the first rule-5 batch:

| | cards | 5a | 5b | 5c |
|---|---|---|---|---|
| `gw-` the world | 468 | 13 | 405 | 369 |
| `geo-` the United States | 100 | 1 | 95 | 76 |
| `gc-` China | 58 | 18 | 35 | 26 |
| **all three** | **626** | **32** | **535** | **471** |

The median `gw-` history block spans **52 years** and its median earliest date is **1950**: half the
world deck's history paragraphs begin after the country was already independent. **Fifty-nine cards of
the 626 clear both bars today**, and they are what the rest should read like — `gw-513` Cairo walks
641, 751, 860, 969, 1168 and the present constitution in five sentences, which is the whole of what
this rule asks for.

**The bars are round numbers chosen to be readable and they are not the rule.** The rule is the
sentence at the top of this section; 300 years and 1800 are where the measure can separate "most of
these" from "the best of these". A card just under either is not thereby wrong, and a card over both
can still be a bad paragraph — which is why the script prints a list and this plan says to read it.

### Four ways the measure is a proxy, each stated on the script too

- **A block may reach back by NAMED ERA rather than by date** — "under the Ottomans", "when the Tang
  collapsed" — and tell a reader the same thing while carrying no year. The list marks such a finding
  `era:` with the words it found so it can be read; nothing is excused by the mark alone, and the ones
  read are DECLARED in the script's `ADJUDICATED` table with the reason beside each.
- **A BARE THREE-DIGIT YEAR IS NOT READ.** The script takes a plain number as a year only in the
  1000–2029 band, because it reads PROSE rather than a date line and a bare 712 or 730 in a background
  is as often a rainfall figure, a page or a count of rivers. A block whose deep end is *invaded Sindh in
  712* reports its earliest date as the next one up. It under-reports and never over-reports, which is the
  safe direction for a measure whose findings are read one at a time.
- **A span is measured between two dates**, so a block naming one date spans zero whether it covers a
  millennium or an afternoon.
- **`gc-` does not have the shape the rule assumes.** Eighteen of its 58 second blocks name no
  date at all — `gc-513` Nanchang's is ring roads, monsoon variability and park cooling — and
  several of its FIRST blocks are history where the house split puts geography. For that collection
  rule 5 is a rewrite of both blocks rather than one, and its batches should say so.

### What a rewrite has to do

Five sentences, the same five it replaces, carrying the same weight of citation. The shape that works
is the one Cairo's card already has: **one sentence per era, in order, ending in the present.**

1. What was there before the state was — the earliest settlement, polity or culture the sources carry.
2. The long middle — the empire, kingdom, dynasty or colonial power that held it longest.
3. The turn — conquest, partition, union, or the arrival of the power it became independent from.
4. Independence or foundation, with its date. This is usually the sentence that is already there.
5. What has happened since, ending near the present.

**It is new research, not an edit.** Rule 1's pass established that removing sentences orphans the
citations standing on them and `add-sources.js` rightly refuses that; rule 5 is worse, because the
sentences being added are about periods the card's existing five sources say nothing about. Expect to
replace two or three citations per card.

**And the date line is rewritten in the same batch**, out of the same research, for the reason rule 1's
section gives: a card whose prose now reaches back to a founding kingdom and whose date line still says
`Independence 1971` alone is a card that has moved and left its own summary behind.

### The sources

The recognition guide and the constitutions stay for what they are good for — the independence date and
the seat of government, sentences 4 and 5. What has to be added is everything before that, and the
hosts measured open from this sandbox on 2026-09-14 (`node .claude/check-reach.js`) that carry it:

- **archive.org's full text** — the out-of-copyright standard histories, which are the single richest
  seam here and the one the China geography collection already rests on. A country's 19th- and early
  20th-century history in English is nearly always on it, and the deep past with it.
- **UNESCO** — `whc.unesco.org` is 403 but `en.unesco.org` answers; a World Heritage inscription is
  usually the most quotable statement of what a site is and when it was built.
- **DOAJ and OpenEdition** — the open journal literature, which is where the archaeology of a region
  and the modern historiography both are.
- **Europe PMC** — archaeogenetics, which is how the peopling of a region is now dated.
- **The country's own national archive, museum or statistics office**, which is the best source for
  its own account of its founding and is cited as what it is.

**`loc.gov` is 403 from here**, so the Federal Research Division country studies — the obvious spine
for exactly this job — are not reachable at their own address. Several of them are on archive.org.

### Batches

The collections are taken in their own running order, which for `gw-` and `gc-` is by population, so
the countries a reader meets first are done first. **H-batches**, to keep them apart from the country
half's G and the capitals' C. Each batch:

1. Run the audit over the batch's ids and read each block, with the card's own first block beside it —
   the geography half often already carries a historical sentence the history half should have.
2. Research the whole arc, era by era, to the citation bar.
3. Rewrite the five sentences and the date line together.
4. `node .claude/check-citations.js --prefix=gw-` BEFORE writing, per that script's own header, then
   `add-sources.js` and `set-date-line.js`.
5. Read every sort year back through `cardYears`, re-run `gw-audit.js` (rules 1–4 must stay at zero —
   a history reaching back to a colonial power is the easiest way to put a border list or a mention of
   the United States back) and `geo-history-audit.js`, and record the figures here.

## Why this is not one batch

A `gw-` background is ten sentences at the house length (270–330 words) carrying **five citations** at
`SRC_TARGET`, every one with an openable URL. Removing a third of the sentences ORPHANS the citations
that stood on them, and `add-sources.js` refuses a batch with a source nothing points at — correctly. So
each card needs: new reading, new prose, a new source list, and the marker pass. That is the shape of
every content pass in `docs/`, and at 412 cards it is the largest one Folio has opened.

**Do not attempt it by find-and-replace.** A background with its American sentences deleted is a
four-sentence background under a five-source apparatus, which is worse than what is there now: it reads
as finished and is not.

## The sources the rewrite rests on

The recognition guide stays — for the ONE thing it is good for on these cards, which is the independence
date in the third sentence, and where the country page states it rather than a recognition date (see
C11's and C12's findings). What has to be added is the geography, and the passes above already record
what is reachable from this sandbox:

- **UNdata** (`data.un.org/en/iso/<cc>.html`) — the figures, and the Region field.
- **The World Bank indicator API** — `SP.POP.TOTL` for the population series and `AG.SRF.TOTL.K2` for
  surface area, which is a genuinely independent measurement (C9).
- **The EU country pages** and **the Commonwealth Secretariat** for the states each covers (C1, C4).
- For CLIMATE and LANDSCAPE, which none of the above carries: the open marine and earth-science
  literature the Korea collection's first ten cards were built on — Frontiers, Copernicus, PLOS, PMC —
  plus **UNESCO's World Heritage** entries where a country's landform is inscribed. `whc.unesco.org` is
  403 here and the Copernicus route is the way round it.

**Measure the reachability again before the first batch**; every one of those findings is dated.

## Batches

Fifteen batches of about 28, taking the collection in its own running order (which is by population, so
the countries a reader meets first are done first). Each batch:

1. Read the card, and grep its own `facts` figures out of the prose (rule 2 is mechanical and can be
   checked before any research).
2. Research the landscape, the climate and the country's own history to the citation bar.
3. Rewrite the ten sentences: **five on what the country is and where** — the landform, the water, the
   climate, the borders; **five on how it came to be** — the pre-colonial polity where there was one, the
   colonial period where there was one, the independence, and what has happened since.
4. `node .claude/add-sources.js`, then `node .claude/check-citations.js --prefix=gw-` BEFORE writing, per
   that script's own header.
5. Re-run the counts at the top of this file and record the new figures here.

**G-topup, first and separately:** rule 2 alone, over all 205 cards. It needs no research — the figure is
already on the card twice — so it can ship ahead of the rest and is the cheapest third of the job.

## The capitals — the second half of the deck

**The country half is finished and the capital half has never been touched.** `gw-501`–`gw-733` and
`gw-751`–`gw-761` are 235 shipped cards, and their backgrounds were written out of the same
recognition guide, so they have the country half's fault at nearly twice the concentration. Measured
with `node .claude/gw-audit.js --prefix=gw-5` (and `gw-6`, `gw-7`, which between them are exactly the
capitals) before the first batch:

| | capitals | of 235 |
|---|---|---|
| 1. mention the United States | 211 | 90% |
|  mean share of their sentences | 25% | |
| 2. repeat a facts-grid value | 216 | 92% |
| 3. name NO landform, water or weather | 126 | 54% |
| 4. name a bordering country | 9 | 4% |
| date lines naming the United States | 99 | 42% |

**RULE 2 ON A CAPITAL CARD IS THE COUNTRY'S NAME**, and that is the constraint that shapes the whole
half. The grid's first row is `Country`, so the value the prose may not repeat is *India*, *China*,
*Indonesia* — which rules out the sentence nearly every one of these cards opens on. It is the right
rule and it is sharper here than on the country cards: the reader is looking at that country shaded on
a globe with the grid naming it two inches above, so *X is the capital of India* spends a tenth of the
card on the one thing already on screen. It makes the history block hard and it makes it better — the
Ming court, a republic proclaimed from a rostrum in 1949, the government in London.

**And the audit had a hole that made the capitals look better than they are.** `COUNTRIES`, rule 4's
vocabulary, was read off the *filtered* card set, so a run under `--prefix=gw-5` had an empty
vocabulary and reported **0 bordering countries** on every capital hundred — a rule those cards
appeared to pass. It is read off the whole deck now, and the real figure is 9. **A check that
silently measures nothing under a filter is worse than one that refuses the filter.**

### The recipe for a city

The country recipe is dead here: AQUASTAT, the CBD, the Constitute Project and the recognition guide
are all organised around STATES. Four legs replace it, three of them uniform.

1. **The WMO's World Weather Information Service** — the city's own climatological normals, supplied
   by its national meteorological service, with the station named and the normals period stated:
   monthly mean maximum and minimum temperature, rain days and rainfall. **This is the capitals' CCKP,
   and it is better**, being per CITY where the CCKP answers only per country (probed: there is no
   subnational endpoint). The full index is at
   `worldweather.wmo.int/en/json/full_city_list.txt`, 3,598 cities with their ids.
   · **THE HUMAN PAGE IS A SHELL AND MUST NOT BE CITED.** `worldweather.wmo.int/en/city.html?cityId=N`
   answers 200 with 116,080 bytes **byte-identical for every city**, and the city's own name appears in
   it **zero times** — C0's CIA World Factbook finding in a new coat, and it would have shipped as the
   uniform citation for 235 cards. The address that carries the data is
   `worldweather.wmo.int/en/json/<id>_en.xml`, which is what is cited.
   · **THE COUNTRY IS A REFUSAL, NEVER A PREFERENCE.** Matching a capital to a WMO station by name needs
   a fuzzy match (the station is *Rabat-Sale*, *Helsinki-Vantaa*, *Muscat (Seeb)*, *Phnom Penh -
   Pochentong*), and written as "prefer the same country, else take the first candidate" it gave **Bern
   the Belgian village of Bernissart** — a real station, in the wrong country, with a full set of
   normals that would have rendered perfectly. Refusing a candidate outside the card's own country
   dropped **17 of 172 matches**, one in ten. What is left is a country-NAME problem rather than a
   matching one (*Türkiye*, *Republic of Korea*, *Lao People's Democratic Republic*, Greenland under
   Denmark), and is resolved by hand, twelve cities at a time.
2. **UNdata's country profile** — for the `Capital city` and `Capital city pop.` fields **and their
   footnotes**, which say what the figure actually counts: Delhi's "is not restricted to state
   boundaries … includes Faridabad, Gurgaon and Ghaziabad", Beijing's "all city districts (exc.
   Yanqing) meeting criteria such as contiguous built-up areas", Jakarta's "the functional urban area".
   That is a real fact about a capital and it is uniform across every UN member.
3. **An open paper's Study Area** — the site, the geology and the river, per city. DOAJ finds them
   (`bibjson.title:(<city> AND (groundwater OR subsidence OR geology OR aquifer))`); Frontiers,
   Copernicus, Springer Open and the national OJS journals serve them. Europe PMC is the wrong index
   here — it is biomedical, and a search for a capital returns its hospitals.
4. **The city's or the country's own institution** for the history — a municipal council, a capital
   development authority, a parks service, a national archive. This is the per-city leg and the one
   that decides whether a card can be written at all.

### Batches

Twenty batches of about twelve, in the deck's own running order (which is by population). Each batch
follows the country half's workflow exactly — draft, measure against the four rules before applying,
sweep every citation URL, apply with `add-sources.js` and `set-date-line.js`, read every sort year back
through `cardYears`, render in a browser to read the glossary auto-links, then record the figures here.

## What has shipped

- **2026-09-15, batch H13 — ten more, and the checker catching two initials expanded from memory**:
  `gw-003` United States, `gw-039` Morocco, `gw-042` Poland, `gw-050` Côte d'Ivoire, `gw-055` Niger,
  `gw-065` Chad, `gw-072` Netherlands, `gw-073` Cambodia, `gw-074` Zimbabwe and `gw-075` Guinea. Their
  history blocks opened at 1776, 1786, 1862, 1960, 1960, 1960, 1780s, 1950, 1980 and 1958; they now open
  at Cahokia, the Jebel Irhoud fossils, the Piast strongholds, the tradition that dates Kong to the 1040s,
  the Green Sahara, Toumaï in the Djurab, the Batavians on the Rhine island, the Khmer Empire, Great
  Zimbabwe and a Fula state in the highlands. Rules 1–4 stay at zero; 5b went 339 to 330 and 5c 307 to
  301.

  · **`check-citations.js` FOUND TWO GIVEN NAMES EXPANDED FROM MEMORY, WHICH IS THE ONE FAULT IT EXISTS
    FOR.** The Great Zimbabwe paper's own page lists its authors as "Chirikure S, Moultrie T, Bandama F,
    Dandara C, Manyanga M" in the citation line, and the Chicago note wants full given names: drafted from
    the initials they came out as **Tom** Moultrie and **Collet** Dandara, where the byline higher up the
    same page reads **Thomas** Moultrie and **Collett** Dandara. Nothing else in the pipeline could see it
    — the DOI resolves, the claims are right, the markers are sound. **A citation line of initials is not
    a byline; scroll up the article page to the authors' block.**

  · **THE BUILD IS NOT IDEMPOTENT AGAINST ITS OWN OUTPUT, AND THIS TIME THE VALIDATOR SAID SO.** H11 lost
    a round to `borrow()` re-reading a card the batch had already rewritten; the duplicate-source check
    added after it caught the same thing here on the first re-run — `borrow("gw-039",4)` had been the
    constitution and was now the UN member-states citation, so the batch would have listed that work
    twice. **Re-emitting one card after a batch has landed means building it from the SHIPPED card, not
    from the build.**

  · **THE PROXY READS "million years ago" AND NOT "million years old".** Chad was drafted "brackets the
    animal between 6.8 and 7.2 million years old" and reported a span of 109 years beginning 1851, which
    reads like a card nobody had taken deep. `geo-history-audit.js`'s `DEEP_UNIT` is an explicit list —
    Mya, kya, BP, "years ago" — and its own header says so. **Write the deep date in one of those four
    forms**; "ago" instead of "old" moved the card from 109 years to 7.2 million.

  · **NINE OF TEN CLEARED AND GUINEA IS THE HONEST EXCEPTION.** Its block now opens on the Fula state of
    the highlands — its prince at Timbo, its ruler titled Almamy, glossed by a traveller of 1818 as
    sovereign pontiff — instead of on independence in 1958, which is the improvement rule 5 asks for. It
    still trips 5b and 5c because **nothing reachable from here dates the Fula conquest of the Fouta
    Djallon**: Mollien describes it and gives no year, DOAJ's Fouta Djallon hits are agronomy and
    zoology, and Lady Lugard's history of the western Sudan does not mention the highlands at all. The
    card is better and the measure is right about it; it stays on the list until a dated source turns up.

  · **A SCAN'S TITLE PAGE SAID IT WAS A PERIODICAL, NOT THE BOOK THE CATALOGUE CLAIMED.**
    `archive.org/details/dunigeraugolfede00bing` is catalogued as Binger's two-volume *Du Niger au golfe
    de Guinée* and its running heads read **LE TOUR DU MONDE**, its first page "LE TOUR DU MONDE, NOUVEAU
    JOURNAL DES VOYAGES … PAR M. LE CAPITAINE BINGER, 1887-1889. TEXTE ET DESSINS INÉDITS". So the
    citation is the serial and the page numbers are the journal's. **The two Google scans of the actual
    volumes hand back page furniture and no text**, which is the other half of the same check: read what
    the file is before citing what the catalogue says it is.

  · **ONE BOOK COVERED TWO COUNTRIES A THOUSAND MILES APART.** Barth's one-volume 1860 Philadelphia
    edition carries the whole journey, so Niger has the Agadez market paying in millet where it once dealt
    in the gold of Gao (p. 108) and the Aïr known to Europe only from a hint in Leo Africanus (p. 53),
    while Chad has Bornu as Kanem's second stage (p. 164) and the plain by the lake in 1851 (pp. 234–37).
    **Its OCR spells the town `A''gades`**, so a grep for "Agadez" or even "Agades" reports the book does
    not mention it.

  · **KONG'S OWN FOUNDATION TRADITION COMES WITH ITS RECORDER'S DOUBT ATTACHED**, which is the shape this
    pass wants: Binger was told the town was founded when Djenné was, in 1043–44, and wrote that he doubted
    it because no Arabic history mentions the place and the first Europeans to report a country of that
    name were Mungo Park and Bowdich. The card carries the tradition and the doubt together.

  · **A COLONIAL TRAVELLER'S VALUE JUDGEMENT IS NOT A FACT TO REPEAT.** Binger explains the Dyula rise at
    Kong by their being "plus intelligents que les autochtones"; the card says instead that they settled
    at first in villages outside the town and before long had acquired influence within it, which is the
    same paragraph's other half and is what actually happened.

- **2026-09-15, batch H12 — ten more, and the proxy's blind spot for the plural of "century"**:
  `gw-059` Burkina Faso, `gw-062` Malawi, `gw-063` Zambia, `gw-064` Kazakhstan, `gw-066` Chile,
  `gw-067` Romania, `gw-068` Somalia, `gw-069` Senegal, `gw-070` Guatemala and `gw-071` Ecuador.
  Their history blocks opened at 1960, 1964, 1964, 1991, 1945, 1862, 1960, 1960, 1945 and 1822; they
  now open at Naba Oubri's conquest of the Mossi plateau, the Bantu expansion, the Bantu expansion,
  a horse-bone village of the 4th millennium BCE, Monte Verde, Trajan's conquest of Dacia, the
  Periplus's far-side ports, a gold-working settlement on the Falémé, the San Bartolo murals and a
  Valdivia community buried under volcanic ash. Rules 1–4 stay at zero; 5b went 349 to 339 and 5c
  317 to 307.

  · **THE PROXY DOES READ A CENTURY, AND ONLY IN THE SINGULAR.** Senegal was drafted as "between the
    9th and the 14th centuries CE" and came back at a span of 244 years beginning 1716, which reads
    like a card that had not been taken deep at all. `geo-history-audit.js` parses `(\d+)(?:st|nd|rd|th)\s+century`
    — so **`centuries` matches nothing**, and a block whose only early date is a century range written
    in the plural contributes no date. Rewritten "from the 9th century CE into the 14th century" it
    reads 850 and 1350 and the span is 1110 years. **In a geography background write each century out
    singly**; it costs one word and is the difference between the measure seeing the card and not.

  · **A SOURCE THAT DESCRIBES THE ANSWER TERM'S NEIGHBOUR IS NOT A SOURCE FOR THE ANSWER TERM.**
    `wh-422` Land of Punt was carried into the reconnaissance as Somalia's deep opening and dropped
    on reading it: the card's own point is that the Somalia placement "took little account of the
    distances a ship would have had to cover", and the baboon isotopes point at Adulis in Eritrea.
    Using it would have made the card assert what its own citation denies. What replaced it is a
    primary text one fetch away — the *Periplus of the Erythraean Sea*, whose sections 7 to 14 are a
    list of this coast's own market towns and which ends "this country is not subject to a King, but
    each market-town is ruled by its separate chief."

  · **A BAD OCR IS A REASON TO LOOK FOR ANOTHER SCAN, NOT TO GIVE UP ON THE BOOK.** The first
    Periplus item (`periplusoferythr00schouoft`) returns the far-side chapters as unreadable noise —
    "Twodaxs' sail, or three, hevoiul Malao". `cu31924030139236` is the same 1912 Schoff translation
    and comes through clean. **archive.org's advanced search lists every scan of a title in one
    call**; nineteen exist for this one.

  · **THE CAPITAL CARD GAVE THE MIDDLE OF FOUR AND THE CORPUS THE DEEP END OF SIX.** Marc's
    *Le Pays Mossi* off `gw-559`, the two Northern Rhodesia annual reports off `gw-563`, Gawęcki off
    `gw-564` and Cozzatella and Cosentino off `gw-568`; `wh-420` for two Bantu openings, `wh-099` for
    Monte Verde, `wh-367` for Dacia, `wh-423` for the Falémé beads and `wh-429` for San Bartolo.
    **Four books had to be found outside the repository** — Livingstone's Zambesi *Narrative*,
    Wilkinson on Wallachia, Faidherbe on Senegal and Bancroft on Central America — and all four are
    19th-century and on archive.org, which is where the middle of a colonial-era country card keeps
    coming from.

  · **ONE BOOK SERVED TWO COUNTRIES FROM DIFFERENT CHAPTERS.** Livingstone's *Narrative of an
    Expedition to the Zambesi* gives Malawi chapters 5 and 9 (Undi's empire, the lake reached at noon
    on 16 September 1859) and chapter 25 (an Arab trader carrying slaves across it in two boats), and
    Zambia chapter 11 (the Batoka driven off the plateau by Moselekatse and Sebetuane, and a week's
    march through their deserted villages without meeting a person). `check-cards.js` counts an author
    in more than two of ONE card's sources, so two citations of one book on one card is within the
    rule and three would not be.

  · **A VOLUME NUMBER ON A SPINE IS NOT ALWAYS THE VOLUME'S OWN RANGE.** Bancroft's *History of
    Central America* vol. 2 is catalogued 1530–1800 and its contents run from Pizarro in 1524 to
    Chiapas in 1800, chapter 5 covering 1527–28 and the founding of Santiago in the Almolonga valley.
    **Read the contents before citing a chapter by the range on the title page**; the prose was left
    without a year and the date line carries the chapter's own span.

  · **TWO DOIS WERE SWAPPED FOR PMC COPIES AND TWO 403s WERE KEPT.** Science Advances' address for
    Stuart 2022 and PNAS's for Chase 2023 answer 403 to spaced probes and both have open PMC copies,
    so the address moved while the citation text stayed byte-for-byte. The two Monte Verde citations
    that 403 are labelled `[Paywalled]` in the corpus already, which is the honest state and not a
    fault to repair.

  · **AN OPENEDITION OR MDPI PAGE MAY BE WALLED ON THE DAY.** `journals.openedition.org` and
    `www.mdpi.com` both returned a bot challenge to every attempt in this session, which took two
    candidate sources off the table — a REMMM article on medieval Horn of Africa mosques and an
    *Arts* article on colonial Quito. **A source that cannot be read cannot be cited**, so Ecuador's
    colonial sentence came instead from Ulloa's *Voyage to South America*, which names the Inca
    conquest, Atahualpa's fief, Pizarro's order and the rebuilding of the capital in 1534 in one
    passage. CLAUDE.md records both hosts as reachable; **measure on the day rather than reading the
    note back**.

- **2026-09-15, batch H11 — ten at once, and the measure catching what the drafting missed**:
  `gw-031` Uganda, `gw-044` Malaysia, `gw-045` Saudi Arabia, `gw-046` Mozambique, `gw-051` Nepal,
  `gw-052` Cameroon, `gw-053` Venezuela, `gw-056` North Korea, `gw-058` Mali and `gw-061` Sri Lanka.
  Their history blocks opened at 1945, 1957, 1932, 1975, 1955, 1960, 1819, 1953, 1960 and 1948; they
  now open at the Bantu expansion, a voyage of 1503, inscriptions of about 1000 BCE, the Bantu
  arrival on the Indian Ocean coast, Ashoka's pillar at Lumbini, the Cameroon highlands, Losada's
  colony of 1567, Gojoseon, Jenne in 765 CE and Mahinda's mission of about 246 BCE. Rules 1–4 stay at
  zero; 5b went 359 to 349 and 5c 327 to 317.

  · **AT TEN CARDS THE TWO HARVESTING PATTERNS CARRY THE BATCH.** The capital card gave the middle of
    eight of the ten — Cunningham on the kabaka at Mengo, Swettenham on the Klang, Palgrave and Philby
    on Nejd, Monteiro and Jessett on Delagoa Bay, Oldfield on the Newar valley, Curtis on Losada,
    Hulbert and Stoyakin on Koguryŏ's capital, Gallieni on the treaty of 5 November 1880 — and the
    corpus gave the deep end of eight. **Only Mali and Malaysia needed a source the repository had
    never used.** At this size the reconnaissance is what decides the batch: dump all ten capital
    cards and all the candidate corpus cards FIRST, then pick which ten to write.

  · **ONE CORPUS CARD SERVED THREE COUNTRIES WITH THREE DIFFERENT CITATIONS.** `wh-420` Bantu
    expansion carries Fortes-Lima for the Cameroon highlands as the homeland, Koile for the crossing
    of the rainforest about 4,420 years ago, and Semo for the arrival along the Mozambique coast — so
    Uganda, Cameroon and Mozambique each open on the same event described by the paper that is about
    them. **Read a shared card's whole source list before deciding it can only be used once.**

  · **`borrow()` READS THE LIVE CORPUS, SO THE BUILD IS NOT IDEMPOTENT AGAINST ITS OWN OUTPUT.**
    Re-running the build after the batch had already been applied borrowed `gw-045`'s fourth citation
    from the card the batch had just rewritten, which put the same work in two slots; `add-sources.js`
    refused the whole batch — "card gw-045 points at source 8, but lists 7" — which is the tool doing
    exactly its job. **Revert the data files before re-running a build that borrows from them**, and
    the build's own validator should check its lists for duplicates.

  · **THE MEASURE CAUGHT TWO FAULTS THE DRAFTING DID NOT.** Malaysia came back at a span of 136 years
    beginning 1821 although its date line said 1511 — because the prose never gave the year, and
    because **1511 is not in Swettenham's Malacca chapter at all**, whose own date is Varthema's
    voyage of 1503. A universally known date is still a date that needs a source, and a rule-5 reading
    that comes back shallow on a card you thought you had taken deep usually means the date is in the
    DATE LINE and not in the prose. Saudi Arabia came back at 83 years beginning 1862 for a different
    reason: **a bare `622` is not read**, the parser taking a plain number as a year only in the
    1000–2029 band, which its own header states. So the Hijra sentence contributed nothing until it
    was written `622 CE`. **The proxy's stated blind spot is a drafting rule, not just a caveat: in a
    geography background write the era on every pre-1000 year.**

  · **A SOURCE'S TITLE PAGE CONTRADICTED THE IMPRINT WRITTEN FROM MEMORY.** *Timbuctoo the Mysterious*
    is New York: Longmans, Green, 1896, not the London Heinemann first drafted. The title page is the
    first page of the djvu text and costs one `head -c`.

  · **A 403 IS SWAPPED WHERE AN OPEN COPY EXISTS AND KEPT WHERE IT IS THE PUBLISHER'S BOT POLICY.**
    Three borrowed DOIs answered 403 to curl. Oxford's for Semo 2020 and PNAS's for Koile 2022 both
    have PMC copies that open, so the address was swapped while the citation text stayed
    byte-for-byte. **`mdpi.com` answers 403 to every probe from here** and has no PMC copy, and that
    citation was KEPT: MDPI is fully open access, the article is the corpus's own already-shipped
    citation on `wh-458`, and a 403 is a different fact from a paywall.

  · **A DECLARED ADJUDICATION WENT DEAD AND WAS REMOVED.** `gw-audit.js` excused rule 4 finding
    "Spain" on `gw-053`; the rewrite no longer trips it, proved by disabling the row and watching the
    count stay at 12 with rule 4 still zero. A dead row can never excuse a different fault — a match
    needs the card, the rule AND the text to agree — but it is a claim about the corpus that is no
    longer true, so it goes. Its reasoning, kept here: **"independence from Spain" names the colonial
    power, not a neighbour.**

  · **NEPAL CAME IN AT 275 WORDS, JUST OVER THE FLOOR.** Five sentences of Oldfield's valley history
    are short ones — a walled town, a gateway for every square — so the block was lengthened by giving
    the constitution and the pillar their full wording rather than by padding. **The floor is as real
    as the ceiling, and a card built out of a 19th-century topographer's sentences will approach it.**

- **2026-09-15, batch H10 — both carried deferrals cleared, and citations borrowed rather than
  retyped**: `gw-016` Vietnam, `gw-033` Algeria, `gw-043` Uzbekistan, `gw-049` Madagascar, `gw-057`
  Syria and `gw-060` Taiwan. Their history blocks opened at 1949, 1830, 1991, 1890, 1922 and 1949;
  they now open at Nanyue, Ain Boucherit, the Oxus civilisation, the crossing from Borneo, the
  Neolithic of south-western Asia and the Austronesian expansion. Rules 1–4 stay at zero; 5b went
  365 to 359 and 5c 333 to 327.

  · **A DEFERRAL IS A FACT ABOUT THE CORPUS ON THE DAY IT WAS WRITTEN, SO RE-CHECK IT BEFORE
    RE-DEFERRING.** Vietnam and Algeria had been carried across two batches with reasons recorded:
    Vietnam for want of a readable edition behind the Chinese-rule and Đại Việt claims, Algeria for
    want of an openable source on the Arab conquest and the Berber dynasties of the *central*
    Maghreb. Both reasons had expired. `wh-559` Đại Việt has since been written out of Toda's *Annam
    and Its Minor Currency* with page numbers, and `cnh-232` Nanyue carries the Han annexation of
    111 BCE; and Algeria's middle turned out not to need a Maghreb survey at all — `gw-533` Algiers
    already cited Thomas-Stanford's *About Algeria* for Roman Icosium, the Arab town of the 10th
    century, Barbarossa's submission to Selim I and the landing at Sidi Ferruch on 14 June 1830.

  · **THE CAPITAL CARD CARRIED THE MIDDLE OF FOUR OF THE SIX. IT IS NOW THE FIRST THING TO TRY.**
    Besides Algiers: `gw-543` Tashkent gave Schuyler's *Turkistan* with the storming party that
    carried the Kamelan gate before dawn on 27 June 1865; `gw-549` Antananarivo gave Sibree's
    *Madagascar before the Conquest* with the twelve royal hills and the Hova conquest of the ridge;
    `gw-557` Damascus gave Le Strange's *Palestine under the Moslems*, whose chronological table
    counts fourteen Umayyad caliphs reigning there between 661 and 750. H8 found this pattern with
    two capitals, H9 with two more, and this batch with four.

  · **THE CITATIONS ARE BORROWED BY INDEX, NOT RETYPED** (`borrow(cardId, n)` in the batch's build
    script). H9's two fabrications were both expansions of `et al.` done from memory while copying a
    corpus citation across. Nineteen of this batch's citations are pulled straight out of the card
    that already carries them, so they arrive byte-for-byte with their Crossref check intact, and
    only three were typed by hand. **Copying a citation by hand is the step that invents authors;
    take it out of the loop.**

  · **A CARD NAMED AFTER A PLACE IN THE COUNTRY DOES NOT THEREBY MAKE A CLAIM ABOUT IT.** `wh-060`
    Aterian is named after Bir el Ater in eastern Algeria and looked like the obvious deep anchor —
    and not one of its five sources names the type site: they are Moroccan, on El Mnasra,
    Contrebandiers and Jebel Irhoud. Citing them for Algeria would have been a registered source
    stretched to a new claim, which is the fault `docs/glossary-citation-plan.md` records three times
    over. **Grep the SOURCE, not the card.**

  · **SEARCH FOR THE SITE, NOT THE COUNTRY.** Europe PMC on "Ghana" returned malaria studies in H9
    and on "Algeria" returns the same kind of thing; searching **"Ain Boucherit"** returned Cáceres
    et al. 2023 at once — open access, and the deepest anchor in the whole deck: Oldowan tools and
    cutmarked bones at about 2.4 and 1.9 million years ago, the lower layer the oldest such evidence
    in North Africa.

  · **A PRIMARY TREATY TEXT IS ONE FETCH AWAY AND BEATS A SUMMARY.** Taiwan's cession to Japan is
    Article II(b) of the Treaty of Shimonoseki of 17 April 1895 — "The Island of Formosa together
    with all Islands appertaining or belonging to the said Island of Formosa" — in the University of
    Tokyo's *"The World and Japan"* database, a host the corpus already cites for the 1910 Korea
    treaty. `worldjpn.net` answers 200 and is simply SLOW: it was the one address of forty-one that
    stalled the sweep loop, and it is not a wall.

  · **THREE CARDS NAMED A FACTS-GRID VALUE IN DRAFT.** Algeria's Roman town stands "where the capital
    does now" rather than at Algiers, Madagascar's Hova take "the highland ridge that became the
    capital" rather than Antananarivo, and Syria's Umayyads sit at "the capital" rather than at
    Damascus — all three because the grid's Capital cell says it already. H9 learned this from Sydney
    Cove; it is now part of drafting rather than a repair afterwards.

  · **TWO SOURCES LEFT WITH THE SENTENCES THAT CARRIED THEM.** Uzbekistan's block 2 opened on two
    Aral Sea sentences — geography standing in the history half — so Roget et al. 2017 went with them,
    as the Convention on Biological Diversity citations went from Peru and Ghana in H9. And `gw-016`
    dropped the third of its three Office of the Historian citations to make room for the older
    centuries, which took `check-cards.js`'s `one-institution` note on that card with it.

- **2026-09-15, batch H9 — six more, and three fabrications caught before they shipped**: `gw-007`
  Brazil, `gw-035` Argentina, `gw-041` Ukraine, `gw-047` Ghana, `gw-048` Peru and `gw-054` Australia.
  Their history blocks opened at 1824, 1816, 1945, 1957, 1821 and 1901; they now open at 9,600 years
  ago, 8,570 years ago, the Trypillia farmers and the Yamnaya, the Kintampo Complex, 8,600 years ago
  and 65,000 years ago. Rules 1–4 stay at zero; 5b went 371 to 365 and 5c 339 to 333.

  · **THE CORPUS CARRIED THE DEEP END OF FIVE OF THE SIX, AND ONE PAPER CARRIED THREE OF THEM.**
    Posth et al. 2018 in *Cell* reports 49 ancient genomes from Belize, Brazil, Peru, Chile and
    Argentina, so Brazil's Lapa do Santo at ~9,600 BP, Argentina's Arroyo Seco 2 at 8,570–7,160 BP and
    Peru's Lauricocha at ~8,600 BP are one citation, already cited and Crossref-checked on `wh-099`'s
    neighbourhood. Ukraine's whole span came out of `wh-258`'s own Saag 2025 — *North Pontic
    Crossroads* runs Trypillia to the Cossacks in one paper — and Australia's out of `wh-092`,
    `wh-093` and `wh-094`. **Read the sibling card's sources before searching; only Ghana needed a
    source the corpus had never used.**

  · **…AND THE CAPITAL CARD CARRIED THE MIDDLE OF TWO.** `gw-535` Buenos Aires already cited the city
    government's own account of Mendoza's failed 1536 settlement, Garay's founding on 11 June 1580 and
    the viceroyalty of 1776 — Argentina's entire colonial century, one level down. `gw-547` Accra
    already cited **Claridge's *History of the Gold Coast and Ashanti*** in both volumes, which gave
    Ghana the Portuguese landfall of 1471, the settlements from 1482 and the sacks of Kumasi in 1874
    and 1896. H8 found this with Sana'a and Bangkok; it is now the second thing to try.

  · **THREE FABRICATIONS WERE CAUGHT IN DRAFT, AND ONLY ONE OF THEM BY A TOOL.** Two were expansions
    of `et al.`: reusing `wh-432`'s Rick 2025 and `wh-434`'s Quilter 2025, the draft spelled out second
    and third authors from memory and got both wrong (Rick's are Lema and Echeverría; Quilter's are
    Harkins and Franco Jordán). **Crossref found them because the rule says to ask it BEFORE writing
    the JSON**, and the fix is not a better memory but to keep the corpus's own `et al.` The third no
    checker could see: the *Internet Encyclopedia of Ukraine*'s Hetman-state entry is by **Lev
    Okinshevych and Arkadii Zhukovsky**, and the draft credited a Kohut whose name appears three times
    in that entry's BIBLIOGRAPHY. **A name inside a bibliography is not the article's author**, and
    the entry says who wrote it in a line at the foot.

  · **A URL SWEEP MUST STRIP THE SENTENCE'S FULL STOP.** The house citation form ends `…, <url>. [Open
    access]`, and a greedy URL pattern eats that stop — the first sweep reported 26 of 41 addresses as
    404, including every `history.state.gov` and `constituteproject.org` address the deck has used for
    a year. Stripped, all 41 answer 200. **A sweep that reports most of a shipped corpus broken is
    reporting its own bug.**

  · **THE GRID CHECK BITES ON A NAME THAT CONTAINS A GRID VALUE, WHICH IS WHY AUSTRALIA'S FLEET LANDS
    AT PORT JACKSON.** `Sydney Cove` contains `Sydney`, the largest-city cell, with a space after it,
    so rule 2 would have reported it; naming Port Jackson instead is both the wider harbour the fleet
    actually moved to and a sentence the audit can pass. Peru's draft had the same shape — "the Supe
    valley north of Lima" against the capital cell — and says "on the central coast" instead.

  · **OPENALEX'S FREE TIER IS EXHAUSTED FOR THIS SANDBOX** (`Insufficient budget … Resets at midnight
    UTC`), so its open-access location lookup is not a route to rely on here. **UNESCO's World
    Heritage list pages answer 403 to every probe**, spaced or not — `whc.unesco.org` is not the
    `unesco.org` that `check-reach.js` measures as open. **`aec.gov.au` serves a 200-status 404**
    (its body reads "404 - Sauce not found"), a fifth variety of the trap. And **`legislation.gov.au`
    serves an Act only from a DATED version address**: `/latest/text` and `/asmade/text` both hand
    back the site's own shell.

  · **A CC BY ARTICLE IS NOT THEREBY A READABLE ONE.** Kay, Fuller and Neumann 2019 in the *Journal of
    World Prehistory* is the obvious deep source for West African land use and is open access;
    `link.springer.com` hands back 3 KB, its five repository copies are landing pages with no fetchable
    file, and Wiley's `onlinelibrary` 403s. Ghana's deep end came instead from **Amanda Logan's *The
    Scarcity Slot*, a Luminos open-access book mirrored on archive.org**, which dates the Kintampo
    Complex to 3,000–3,500 years before the present and carries the Asante conquests of Wenchi and
    Bono-Takyiman and the extension of British rule in 1897. **The artefact plan's own search order
    holds: OAPEN finds the books when the journals are shut.**

  · **TWO CARDS LOST A BIODIVERSITY SENTENCE AND ITS SOURCE.** Peru's and Ghana's history blocks each
    OPENED on flora and fauna counts — geography standing in the history half — so the rewrite dropped
    both, and the Convention on Biological Diversity citation went with each. That is the same trade
    H8 made with the United Nations sentence: a block of five has room for five, and a whole history
    needs all of them.

  · **`check-cards.js` REPORTS `gw-007: brazil in 3 of 9 sources` AND IS RIGHT TO CALL IT A NOTE.**
    Three Brazilian laws — the 1824 constitution, the Lei Áurea of 1888 and the republic's decree of
    1889 — are cited author-first under the state's own name, which is the corpus's convention for a
    national law. Three records of one state are not three opinions, and the tool files it under
    `one-witness` rather than failing it.

- **2026-09-15, batch H8 — six histories out of the corpus's own shelf, and a checker that had gone
  blind**: `gw-014` Philippines, `gw-020` Thailand, `gw-037` Canada, `gw-038` Yemen, `gw-015` Democratic
  Republic of the Congo and `gw-028` Colombia. Their history blocks opened at 1898, 1850, 1867, 1839,
  1960 and 1819; they now open at 46,000 years ago, 1238, 24,000 years ago, the Himyarite kingdom,
  4,400 years ago and the end of the Pleistocene. Rules 1-4 stay at zero; 5b went 377 to 371 and 5c
  345 to 339.

  · **`check-style.js` HAS BEEN BLIND TO EVERY CARD BACKGROUND SINCE THE CARD SPLIT, and this batch
    found it by expecting a finding and not getting one.** The draft wrote "Thirty-six kings" and "the
    first century", both plain violations of rules 1 and 2, and the checker reported the corpus clean.
    Its `FILES` list names `data.js`, `glossary.js`, `glossary-extra.js`, `artefacts.js`,
    `artefacts-extra.js`, `countries.js` and `crossword.js` — and the split moved `abstract`, `why`
    and `quote` to `data-extra/<collection>.js`, which nobody added. The two `*-extra.js` files ARE in
    that list, each added by the split that created it; the card split simply did not do the same.
    **Measured: 69 findings before the directory was added, 274 after.** It is the `data-extra` bullet's
    own warning one file over — a find-and-replace over `data.js` alone silently misses the prose — and
    the same failure shape the artefacts split's comment describes: a checker "going on reporting a
    clean pass over an index of names and dates".
  · **AND TURNING THE LIGHT ON SHOWED ITS `--fix` IS NOT SAFE OVER THAT PROSE.** Run over `data-extra`
    it applied 203 fixes, and `check-cards.js` rule 7 then failed: it had rewritten Thucydides' "first
    fixed at four hundred and sixty talents" to "460 talents" inside `gr-451`'s `quote.text` — a
    translator's published words, edited by a house-style rule. **Nothing else in the pipeline could
    have seen it**, the card rendering perfectly under a live link to the real text. `quote.text` and
    `quote.cite` are now masked exactly as `"sources"` is, for the same reason: the words are the
    translator's, not ours. `cite` alone was reporting `trans. A. D. Godley` on three Herodotus cards
    on every run — the false finding CLAUDE.md names by hand as the reason rule 4 must never sweep a
    bare `AD`.
  · **…AND THE COMPOUND-NUMBER RULE MANGLES A NUMBER THAT CONTINUES INTO A SCALE WORD.** `NUM_RE`
    converts the tens-units half and leaves the rest standing, so "thirty-two thousand foot" became
    "32 thousand foot", "twenty-five thousand foot and thirty-five hundred horse" became "25 thousand
    foot and 35 hundred horse", and so on for 17 spans in the Greece file alone. It never fired while
    the checker read only `data.js` — a card QUESTION rarely counts an army. Both `NUM_RE` and
    `HUNDRED_RE` now carry a `(?!\s+(?:hundred|thousand|million|billion))` lookahead, and with it
    `--fix` leaves `check-cards.js` exactly where it found it.
  · **THE 251 FINDINGS THE CHECKER NOW REPORTS ARE A PASS OF THEIR OWN AND WERE NOT SWEPT.** 186 of
    them `--fix` will apply safely (century ordinals, compound numerals, italicised work titles in
    `why` answers); the rest are the ambiguous ones it leaves for a person. Clearing them is a
    corpus-wide content sweep across nine collection files, which is not a geography history batch's
    work to do quietly. **This batch fixed its own two by hand and left the rest measured.**
  · **THE CORPUS CARRIED THE WHOLE DEEP END OF FOUR OF THE SIX** — H2's finding again, on two more
    continents. Canada's block opens on `wh-097` Beringia's neighbourhood and `wh-501` Vinland, the
    Philippines' on `wh-156` Austronesian expansion, the Congo's on `wh-420` Bantu expansion, and
    Colombia's conquest sentence on `gw-528` Bogotá's own Cunninghame Graham. Two capital cards did the
    same job one level down: `gw-538` Sana'a handed Yemen Playfair's *Arabia Felix* and `gw-520`
    Bangkok handed Thailand Carter's *Kingdom of Siam*. **Read the card's own capital before searching.**
  · **A DOI REUSED FROM THE CORPUS CAN STILL BE WALLED.** Koile's Bantu rainforest-route paper is cited
    at `wh-420` by its PNAS DOI, which answers 403 from this sandbox; the paper is open at
    `PMC9372543`. The corpus is the cheapest source of SOURCES, not of URLs — curl the address, not the
    card.
  · **AND AN INITIAL EXPANDED FROM A SEARCH RESULT WAS WRONG AGAIN.** The Kongo pottery paper's first
    author reads `Tsoupra A` at Europe PMC and the draft wrote **Andria**; Crossref's record gives
    **Anna**. Caught by running `check-citations.js` on the DOIs before writing the JSON, which is what
    that rule is for.
  · **THE UN-MEMBERSHIP SENTENCE IS THE ONE A WHOLE-HISTORY REWRITE ALWAYS HAS REASON TO DROP, and
    dropping it retires a dead citation with it.** Every `data.un.org/en/iso/<cc>.html` in the deck is a
    404 (423 cards, 434 glossary terms — a pass of its own). All six cards cited one, none from block 1,
    and in five of them "joined the United Nations on <date>" was the weakest of the five sentences.
    Where the fact earned its place it now rests on **`un.org/en/about-us/member-states`**, which is
    live and carries all 193 admission dates.
  · **…AND THAT LIST CONTRADICTED THE DECK BY A DAY.** It gives Thailand's admission as **15 December
    1946** where `gw-020` and `gw-520` both said the 16th, from the dead UNdata page. The UN's own list
    is the authority; both cards are corrected, prose and date line, in this batch. **A correction does
    not travel between surfaces**, so the figure was grepped through the whole corpus — two cards, no
    glossary term.
  · **AND THE UN'S PER-COUNTRY PAGE CARRIES A BETTER FACT THAN THE ADMISSION DATE.** Its Thailand page
    records that "On 11 May 1949, Siam informed the Secretary-General that it had changed its name to
    Thailand" — which on a card whose ANSWER TERM is Thailand is worth more than the year it took a
    seat, and is what the block's last sentence now ends on.
  · **TWO NEW `ADJUDICATED` GRID ROWS, both the shape `gw-009` Moscow and `gw-025` Rome set in H6.**
    `gw-014` names **Manila**, taken by force of arms on 19 May 1571 and made the capital of what
    Philip II's grant called a new kingdom of Castile; `gw-020` names **Bangkok**, where the capital
    settled in 1782 after Ayutthaya was destroyed. Both are the founding of the capital — the history
    rule 5 asks for — and neither is a restatement of the grid's cell. Colombia's deep sentence was
    written round the third case instead: the archaeological sites are "Tequendama and Aguazuque,
    Sabana de Bogotá", and naming the eastern Andes rather than the city needed no row at all.
  · **A SOURCE WRITTEN IN AN ERA'S OWN VOICE IS CITED FOR ITS DATES AND NEVER ITS FRAMING**, H6's rule
    again. Playfair (1859), Carter (1904), Wood (1924), Morga (1609 in Stanley's 1868 translation) and
    Casement (1904) each carry one kind of fact here — a foundation year, a dynasty's span, a treaty, a
    reported atrocity — and none of them carries a judgement into the prose. Casement is the exception
    that proves it: what his report says about the rubber tax, the emptied villages and the severed
    hands IS the fact, and the card says he reported it.
  · **A BLOCK-1 MARKER PINS A SOURCE POSITION A REWRITE MAY NOT REORDER**, H6's rule, and it bound on
    three of the six: `gw-020`'s Tomkratoke had to stay at 5, `gw-015`'s Sorí at 5, `gw-038`'s CBD at 3.
    The new sources went into the freed UNdata slot and onto the end.

- **2026-09-15, batch H7 — five cards whose history begins in deep time, and the measure taught to see
  it**: `gw-036` Afghanistan, `gw-027` Myanmar, `gw-024` South Africa, `gw-022` Tanzania and `gw-026`
  Kenya. Their history blocks opened at 1919, 1885, 1910, 1961 and 1895; they now open at 25 CE, 1044,
  97,974 BCE, 3.66 Mya and 3.3 Mya. Rules 1-4 stay at zero; 5b went 386 to 377 and 5c 353 to 345.

  · **THE MEASURE WAS BLIND TO THE ONE SHAPE A HISTORY BLOCK REACHES FURTHEST BACK IN, and that is what
    this batch fixed before it wrote a card.** `geo-history-audit.js`'s parser read BCE, CE, centuries,
    millennia and four-digit years - and nothing else - so a block opening "at Laetoli about 3.66
    million years ago" carried no date it could see, took its earliest date from whatever modern year
    came next, and reported as beginning after 1800. That is a permanent false finding on exactly the
    cards that answer rule 5 best. It now reads **Mya, kya, BP and "years ago"**, the notations
    `cardYears` already reads on a date line.
  · **IT IS A WIDENING RATHER THAN A LOOSENING, AND THAT WAS PROVED BY DIFFING THE LISTS.** Reading more
    dates can only push a block's earliest date earlier and its span wider, so it can only take a card
    OUT of 5b or 5c. Measured across all three collections before and after: **four cards left 5b
    (`gw-186`, `gw-207`, `gw-209`, `gw-539`), three left 5c, and nothing entered either list** - four
    already-shipped cards that had been reporting a fault they did not have.
  · **A "YEARS AGO" FIGURE IS SUBTRACTED FROM A DATUM, NEVER NEGATED, and that is the whole of what
    made the widening safe.** Read as a bare negative, "150 years ago" comes back as the year 150 BCE
    and a block that really begins in 1876 passes 5c - the one way this change could have created a
    false pass. BP is before 1950 by its own definition; the rest are before now, and at Mya and kya
    scales the choice of datum is noise.
  · **THE CORPUS'S PALAEOLITHIC CARDS ARE THE CHEAPEST DEEP END IN AFRICA - H2's finding on a third
    continent.** Tanzania's block opens on `wh-011` Laetoli and `wh-017` Olduvai, Kenya's on `wh-014`
    Lomekwi and `wh-021` Turkana Boy, South Africa's on `wh-058` Blombos: five cards' worth of cited,
    Crossref-checked, openable sources already written and already read by somebody.
  · **ONE PAPER CAN CARRY THE MIDDLE OF TWO CARDS, AND THE SENTENCES MUST STILL DIFFER.** Brielle et
    al.'s Swahili-coast genomes serve both Kenya and Tanzania, and the drafts said nearly the same
    thing twice - which inside one deck is two cards a reader meets in the same week repeating a
    sentence. They now take different facts from the same paper: the African and Asian families mixing
    by about 1000 CE on one, the coral-stone towns and the early adoption of Islam on the other.
  · **A GUESSED PMCID RETURNS A DIFFERENT PAPER, AND THIS ONE RETURNED A REVIEW OF ALCOHOL-ASSOCIATED
    LIVER DISEASE.** The Swahili paper is PMC10060156; PMC10060166 is one digit away, resolves with a
    200 and is a real article about something else. CLAUDE.md warns about exactly this and it still cost
    a fetch. **Take the id from Europe PMC's own record for the DOI**, never from arithmetic.
  · **A SHIPPED CITATION'S URL CAN GO DOWN AFTER IT SHIPS.** `wh-011`'s Laetoli citation points at
    Europe PMC's `webservices/rest/.../fullTextXML` endpoint, which answered **504 on every attempt**
    across this batch while the same paper's PMC article page answered 200 every time. This batch's own
    copy uses the article page. **The `wh-` card still carries the dead address**, and a sweep of the
    corpus's `fullTextXML` citations is a pass of its own.
  · **BELLEW IS CITED FOR A CORONATION AND FOR NOTHING ELSE.** *Afghanistan and the Afghans* (1879) is
    the only openable work found here that dates Ahmad Shah's crowning near Kandahar to about 1747, and
    it is a Victorian frontier officer's book that calls Islam "an exclusive and intolerant" creed a
    page earlier. **A source can be the right witness to a date and no witness at all to anything else**
    - H6's reading of Budge, one country over.
  · **A HISTORICAL FRONTIER IS RULE 4's OWN EXCEPTION AND THE MEASURE STILL FIRES ON IT.** Myanmar's
    draft said the Konbaung kings "pushed its frontiers outward, which brought them up against the
    expanding power of British India" - a historical mention, which rule 4's header allows, and which
    `BORDERISH` cannot tell from a neighbour list. Rewording *frontiers* to *reach* was cheaper and
    read better than an `ADJUDICATED` row. **Prefer the reword; keep the table for a finding that
    rewording would damage.**
  · **TWO CARDS WERE DEFERRED AND THE TWO REASONS ARE DIFFERENT.** `gw-016` **Vietnam**: its deep end
    rests on Toda's *Annam and Its Minor Currency*, whose archive.org text layer is unusable - the scan
    is a rotated, table-heavy book and the OCR is noise - so the claims cannot be verified from it even
    though `wh-559` already cites it; it needs another edition or another work. `gw-033` **Algeria**:
    nothing openable from here carries the Arab conquest and the Berber dynasties of the CENTRAL
    Maghreb. Lane-Poole's Egypt book reaches Kairouan in 910 and Kairouan is in Tunisia, so citing it
    for Algeria's Islamic centuries would be asserting Tunisian history as Algerian; its Numidian end
    (Livy and Sallust, through `rm-230` and `rm-293`) and its Ottoman and French end are both ready and
    waiting on that one sentence. **Both are SOURCE gaps rather than research not yet done, which is
    why they are written down rather than left to be re-derived.**

- **2026-09-15, batch H6 — six of the world deck's best-covered countries, and a reversed claim found
  while rewriting its neighbour**: `gw-034` Iraq, `gw-030` Sudan, `gw-021` United Kingdom, `gw-023`
  France, `gw-019` Germany and `gw-032` Spain. Their history blocks now open at 3500 BCE, 5000 BCE,
  2500 BCE, 58 BCE, 800 CE and 218 BCE against 1930, 1956, 1707, 1789, 1871 and the 16th century. Rules
  1–4 stay at zero; 5b went 391 → 386 and 5c 355 → 353. Twenty-eight of this batch's thirty-one new
  citations came out of Folio's own cards, which is H2's finding for the fourth time.

  · **THE SOURCE LIST'S ORDER IS NOT FREE, BECAUSE BLOCK 1'S MARKERS ARE FIXED.** A rewrite replaces the
    whole `sources` array while leaving block 1 byte-identical, so every position block 1 points at has
    to keep the citation it pointed at. Sudan's block 1 cites 1 and 4 — the AQUASTAT profile and the
    ENSO paper — and the draft reordered the array around them, which `add-sources.js` reported as an
    unreferenced source rather than as a marker now pointing at the wrong work. **Read block 1's markers
    off the card before writing the new array**, and build the list around them.
  · **THE MEASURE CANNOT READ A BARE THREE-DIGIT YEAR, AND THE FIX IS THE PROSE.** `geo-history-audit.js`
    says so in its own header, and this batch is where it bit: France's block reached back to Caesar and
    Germany's to Charlemagne, and both reported a span under 300 years because the drafts said "in the
    50s BCE" and "in the year 800". Writing "between 58 and 50 BCE" and "800 CE" is clearer prose AND
    readable by the script. **Prefer that to an `ADJUDICATED` row** — the table is for a block that
    genuinely reaches back by named era with no year to give, not for one whose year is simply written
    in a form the parser was built not to guess at.
  · **A CARD CAN PASS BOTH PROXIES AND STILL BE THE WRONG SHAPE, and `gw-032` Spain is the standing
    example.** Its old block named "the 16th century" and "the end of the 19th", which the parser reads
    as 1550 and 1850 — a span of 436 years beginning before 1800, so it was in neither list — while its
    history began with the overseas empire and said nothing of Altamira, Rome, the Visigoths, al-Andalus
    or Granada. **The lists are a floor, not a census**: pick a batch by reading the deck, and use the
    lists to catch what reading misses.
  · **A REVERSED CLAIM IS INVISIBLE TO EVERY CHECK IN THE PIPELINE, AND ONE SHIPPED.** `gw-013` Egypt
    said the New Kingdom "reached far south into Nubia, whose ores can be traced in Egyptian cosmetics
    by the lead isotopes they carry"; Lemos et al. find the opposite — galena from the Egyptian mines at
    Gebel el-Zeit in kohl buried in Lower Nubia. The URL opens, the authors are right, the marker points
    at a real source, and `check-citations.js` has nothing to compare. It is corrected in this batch.
    **When a rewrite reuses a neighbour's citation, read the paper rather than the sentence that cites
    it.**
  · **BUDGE'S `The Egyptian Sûdân` CARRIES THE WHOLE SUDANESE ARC AND ITS PREFACE IS THE CHEAPEST WAY
    IN** — vol. 1, vii–ix gives the Egyptian monuments from about 4000 BCE, the Nubian kingdom under
    Piankhi about 750 BCE, Silko's Christian kingdom at Dongola and its seven hundred years, and the
    Arab conquest about 650 CE; vol. 2 gives the Funj at Sennar, Muhammad Ali's conquest in 1820,
    Khartoum on 26 January 1885 and Omdurman on 2 September 1898, at pages 199–200, 211, 254 and 447.
    **CITE IT FOR ITS DATES AND NEVER FOR ITS FRAMING**: it is an Edwardian British account of a war
    Britain had just won, and it calls the Mahdist side rebels and Dervishes on every page.
  · **THE UN MEMBERSHIP DATE HAS AN OPENABLE HOME AGAIN.** Every `data.un.org/en/iso/<cc>.html` in the
    deck is a 404 — recorded in H2 and still a pass of its own — and `un.org/en/about-us/member-states`
    prints each state's date of admission in one page (Iraq 21-12-1945, Sudan 12-11-1956, the United
    Kingdom and France 24-10-1945, Spain 14-12-1955, Germany 18-09-1973). **Where a rewrite touches a
    sentence resting on the dead link, swap it**; where it does not, leave it to that pass.
  · **MDPI IS WALLED FROM HERE AND SCIENCE.ORG IS TOO, BUT ONLY ONE OF THEM HAS A WAY ROUND.** `mdpi.com`
    answers 403 to curl and to WebFetch alike, so no new MDPI citation could be added in this batch (the
    ones already shipped are a different question and stay). `doi.org/10.1126/sciadv.abc0133` also 403s,
    and the same paper is whole at `pmc.ncbi.nlm.nih.gov/articles/PMC7439454/` — the standing route, and
    the reason the Stonehenge citation is written to PMC.
  · **TWO SOURCES FOUND FOR SUDAN THAT THE CORPUS DID NOT HAVE, both English and both open**: Abdalla's
    review of female figurines in *Southern African Field Archaeology* 19 (2024), which is the only
    reachable thing giving the Sudanese Neolithic and Meroitic date ranges outright (5000–2800 BCE and
    to about 350 CE); and Nadig's *Bryn Mawr Classical Review* of Welsby's *The Medieval Kingdoms of
    Nubia*, which dates the Muslim invasions to 1276 and Makuria's first Muslim ruler to 1323. **The
    French-language Persée literature on Kush and Meroë is excellent and you may take exactly one of
    it** — `check-cards.js` rule 6 reports two sources in the same non-English language — so Rilly on
    the decipherment is the one Sudan spends.

- **2026-09-15, batch H5 — one card, to prove the rule on the THIRD collection and to find out what that
  collection actually costs**: `gc-002` Shandong, whose history block ran 1898 to 1919 and now runs from
  the Longshan towns of about 3000 BCE to the Treaty of Versailles, a span of 4,899 years. Its date line
  went with it: `German lease 1898 / To Japan 1919` gained the enfeoffment of Qi and Lu about 1046 BCE.

  · **`gc-` IS THE EXPENSIVE COLLECTION AND HERE IS WHY, MEASURED CARD BY CARD.** Its second blocks are
    not histories that start late; they are ASSORTMENTS — `gc-003` Henan's is the history of two
    excavations, the origins debate, the founding of the Song, a Taiping siege and a study of traditional
    villages, in that order. And its FIRST blocks are frequently history where the house split puts
    geography: `gc-001` Guangdong's opens on the collapse of the Tang. **So most `gc-` cards need BOTH
    blocks rewritten, which is why this batch is one card rather than six.**
  · **PICK THE `gc-` CARDS WHOSE FIRST BLOCK IS ALREADY GEOGRAPHY.** Counting the sentences in each block
    that carry a year, a century or a dynasty name sorts the collection usefully: `gc-002`, `gc-013` and
    `gc-024` have a first block with none, and `gc-021`, `gc-027`, `gc-011`, `gc-022`, `gc-026` and
    `gc-028` have one. Those nine are one-block rewrites like the world deck's; the rest are two.
  · **THE SOURCES CAME OUT OF THE CHINA COLLECTION, which is 259 cards deep.** `cnh-050` Longshan,
    `cnh-152` Qi and `cnh-156` Lu carried the deep end — Dematté in *Asian Perspectives* and Chavannes's
    Sima Qian — and the card's own Morse, Richard and Avalon citations carried the rest. H2's finding for
    the third time.
  · **WHAT SHANDONG LOST IS TWO GEOGRAPHY SENTENCES THAT WERE IN THE WRONG BLOCK**: the Yellow River
    silting its bed above the plain, and the delta resettled as the channels move. They were sentences 1
    and 2 of the history half, they are geography, and the first block was already full. Their two
    citations went with them. **On `gc-` expect that loss to be the rule rather than the exception**, and
    on a two-block rewrite move them up rather than dropping them.
  · **“S. M. Brooks” SPLITS A SENTENCE COUNT IN TWO**, as “St. Augustine” does one collection over. The
    card is ten sentences and any naive splitter reads twelve.

- **2026-09-15, batch H4 — the rule proved on the SECOND geography collection**: `geo-001` California,
  `geo-002` Texas and `geo-003` Florida, the three most populous states, all three of which now clear
  both bars. Rules 1–4 do not apply to this collection, which is the whole reason rule 5 needed a
  script of its own.

  · **A STATE'S HISTORY BLOCK HAS A SHAPE, AND IT IS FIVE SENTENCES LONG**: the Indigenous nations whose
    homeland it is; the first European claim; how the ground became American; statehood with its date;
    and what has happened since. The cards as written carried the last three and began at statehood or
    just before it — California's began in 1850, Texas's in 1836, and Florida's second block was national
    parks and tourism rather than history at all.
  · **THE FIRST SENTENCE COMES OUT OF THE `us-` COLLECTION, WHOSE OPENING DECK IS NATIVE AMERICA.**
    `us-033` is literally a card called California, `us-047` is the Comanchería and `us-082` the Seminole
    Wars, each cited at the bar to the National Park Service, the Handbook of Texas, the Muwekma Ohlone
    Tribe and the National Library of Medicine. **Every state has a card waiting for it there**, and the
    collection is 100 cards of Native America before it reaches anything else.
  · **THE CONTESTED FIGURE RULE BIT ON THE FIRST CARD, and it is worth seeing where.** California's
    Native population before the gold rush is given as 100,000 by the National Library of Medicine and
    150,000 by the Muwekma Ohlone Tribe's own account. The draft said “from perhaps 150,000”; the shipped
    sentence gives the range and cites both, which is CLAUDE.md's rule and reads better besides.
    **Fetch the figure before writing the sentence round it**, not after.
  · **THE `geo-` DECK IS 271–329 WORDS AND THE FLOOR IS REAL.** Two of the three drafts came in at 258
    and 236, because a history sentence naming a treaty is shorter than a paragraph about parks. Measured
    over all fifty state cards: none is under 271. **Measure the collection before assuming the house
    range**, and expect to write longer sentences here than the world deck needs.
  · **“St. Augustine” SPLITS A SENTENCE COUNT IN TWO.** Any naive sentence splitter breaks on `St. `, so
    `geo-003` reads as 12 sentences and is 10. Nothing in the pipeline fails on it; know it before
    chasing it.
  · **`geo-002` CARRIES A `one-institution` NOTE FROM `check-cards.js`** — three of its eight sources are
    the Census Bureau — and that is PRE-EXISTING and improved by this batch rather than caused by it:
    the three are the area file, the population estimates and the places file, all in block 1, and the
    ratio was 3 of 5 before.

- **2026-09-14, batch H3 — six countries whose whole history was already in the corpus, and one host
  that is walled rather than dead**: `gw-012` Japan, `gw-013` Egypt, `gw-017` Iran, `gw-018` Turkey,
  `gw-025` Italy and `gw-029` South Korea. Fifteen of the world deck's first twenty-nine now clear both
  bars. Twenty-two of this batch's twenty-four new citations came out of Folio's own cards — H2's
  finding applied deliberately rather than stumbled on — and four date lines were rewritten.

  · **THE COUNTRIES WHERE FOLIO ALREADY HAS A COLLECTION ARE THE CHEAPEST CARDS IN THE PASS, AND THEY
    ARE NOT THE OBVIOUS ONES.** Japan's history block was written out of `jp-001`, `jp-031` and `jp-086`
    (the peopling of the islands, the spread of rice, the ritsuryō state); Italy's out of `rm-022`,
    `rm-180` and `gr-223`; South Korea's out of `ko-046`, `ko-091` and `wh-540`; Iran's, Turkey's and
    Egypt's out of the World History collection's Elam, Achaemenid, Çatalhöyük, Hittite, Byzantine and
    Egyptian cards. **Take the world deck in the order of what the corpus already covers when the running
    order allows it**, which for the top thirty it does.
  · **A 403 FROM A HOST'S OWN ROOT IS A WALL, NOT LINK ROT, AND THE TWO ARE DIFFERENT FACTS.**
    `ucl.ac.uk` answers 403 on every path including `/`, so the 27 cards citing UCL's *Digital Egypt for
    Universities* are citing pages that work for a reader and cannot be opened from here. That is the
    opposite of the UNdata finding in H1, where the host answers and the country profiles are gone.
    **The rule this batch followed: do not ADD a citation to a host you cannot open**, even one the
    corpus already trusts — Egypt's three UCL citations were swapped for the radiocarbon chronology in
    `wh-205`, the Egyptian ministry's own site and a 2024 lead-isotope paper, all of which answer. The
    cost is that the Old Kingdom's span comes out of the sentence and is given as *the third millennium
    BCE*; the card is still right and is now checkable from here.
  · **`gw-025` REPEATED *Rome* THE MOMENT IT HAD A HISTORY, which is `gw-009`'s Moscow again.** A country
    whose capital was the polity that made it will trip rule 2 on the sentence rule 5 asks for, and both
    are now DECLARED in `gw-audit.js`. **Expect one per batch and do not reword around it**: "the city on
    the Tiber" is worse prose and says less.
  · **THE MEASURE WAS LENIENT ON A RANGE AND IS NOT NOW.** `geo-history-audit.js` read "between about
    1650 and 1200 BCE" as the year 1650 CE beside −1200, because its BCE rule consumed only the second
    number — so `gw-018` Turkey reported its latest date as 1650 and its span 8,553 years too short. An
    era marker now carries leftwards across a range, as `cardYears` has always done on a date line. **It
    inflated spans rather than shrinking them**, so nothing was wrongly reported as passing; but a
    measure that is wrong in the safe direction is still wrong.
  · **FOUR DATE LINES GAINED THEIR DEEP END** — Japan the capital at Nara in 710, Egypt the unification
    about 3100 BCE, Iran the Achaemenid span, Turkey the Hittite kingdom and the fall of Constantinople
    in place of a line that said only when it joined the United Nations. **Turkey did NOT gain 1923**,
    which is the date its line most wants: the Office of the Historian's page for it renders nothing
    this sandbox can read, and a date line is not a place to put a fact nothing on the card supports.

- **2026-09-14, batch H2 — five more of the world deck's opening, and the seam that makes this pass
  affordable**: `gw-004` Indonesia, `gw-006` Nigeria, `gw-009` Russia, `gw-010` Ethiopia and `gw-011`
  Mexico. With H1 that is nine of the deck's first eleven; `gw-007` Brazil is deferred, for a reason
  below. All five clear both bars. Three date lines were rewritten with them and two were not.

  · **THE CORPUS IS ITS OWN BEST SOURCE, AND THIS IS THE FINDING TO USE FIRST.** Folio has 3,215 cards,
    and the World History collection alone has 560 covering exactly the eras a country card's history
    block needs — each one already researched, cited to an openable URL, and checked against Crossref.
    Grepping `data.js` for cards whose answer term names a region gave `wh-554` Srivijaya and `wh-555`
    Majapahit for Indonesia, `wh-419` Nok for Nigeria, `wh-448` Kievan Rus’ for Russia, `wh-418` Aksum
    and `wh-455` the Ethiopian Orthodox Church for Ethiopia, and `wh-424` Olmecs, `wh-428` Maya and
    `wh-431` Teotihuacan for Mexico. **Eleven of this batch's fifteen new citations came out of the
    corpus rather than off the network**, and they are MODERN open scholarship where a colonial-era
    survey would otherwise have had to carry the deep past. Do this before opening a search engine.
  · **A COLONIAL OFFICIAL'S HISTORY IS STILL THE ONLY SURVEY FOR SOME COUNTRIES, AND IT IS CITED FOR
    CHRONOLOGY AND NOTHING ELSE.** Nigeria's middle three sentences rest on A. C. Burns's *History of
    Nigeria* (1929), written by the colony's own Deputy Chief Secretary — which is a state's account of
    its own actions, the thing CLAUDE.md says may not be repeated as established fact. It is used for
    what it can be checked on: which kingdoms stood where, and that the northern and southern
    protectorates were joined on 1 January 1914. **Nothing interpretive is taken from it**, the revolt
    against Gobir is given without Burns's own 1802 date (the conventional date is 1804 and the
    disagreement is not this card's to settle), and the deep end of the card rests on the Nok
    archaeology instead. The modern open alternatives were looked for and are thin: DOAJ returns water
    chemistry and paediatric surgery for *Benin City*, and the two modern papers that do exist — one in
    *Religions* on Kanem-Bornu, one in *Afriques* on Ile-Ife — are about present-day framing and the
    history of archaeology rather than about when those states stood.
  · **A HISTORY THAT REACHES BACK PUTS A CAPITAL BACK IN THE PROSE, AND RULE 2 CATCHES IT.** `gw-009`
    Russia reported a grid repeat the moment its history block was written: the rise of Moscow IS the
    history of the Russian state, and Moscow is both the Capital and the Largest city cell. It is
    DECLARED in `gw-audit.js`'s `ADJUDICATED` table with the reason beside it — the medieval principality
    that gathered the others in, not the capital cell — which is the third row of that kind, beside
    `gw-002`'s Shanghai and `gw-151`'s Gulf of Riga. **Expect one of these per batch**: the country whose
    capital was the polity that made it is the ordinary case, not the exception.
  · **`gw-007` BRAZIL IS DEFERRED, AND THE REASON IS A SOURCE GAP RATHER THAN A JUDGEMENT.** Its history
    wants 1500, the sugar and gold economies, the court's move to Rio in 1808, independence in 1822 and
    the republic of 1889, and nothing openable from here carries that arc: Southey's *History of Brazil*
    is on archive.org only as its third volume and stops around 1801, the Story of the Nations volume has
    no text layer, and DOAJ's Brazilian history is in Portuguese and topic-by-topic rather than a survey.
    It waits on reading rather than on a decision, like `gw-695` Saint Helier one section up.
  · **WHAT ETHIOPIA'S CARD LOST IS WORTH STATING.** Its old second block opened with two excellent
    geography sentences — a third of the country drains into the Nile, and the highlands supply about
    85 per cent of the water reaching Lake Nasser — which were in the history half because the history
    half was thin. The house shape is five and five and block 1 was already full, so they are gone, and
    the two citations that stood only on them went with them. **A card that was carrying geography in its
    history block will lose that geography; say so rather than quietly dropping it.**
  · **THREE DATE LINES WERE REWRITTEN AND TWO WERE NOT, on the rule H1 set.** Indonesia gained the 1945
    declaration beside the 1949 recognition, Nigeria the 1914 amalgamation beside 1960, and Ethiopia's
    was replaced outright — it read `Italy invades 1895 and 1935 / Eritrea leaves 1993`, which is three
    dates of which two are another country's actions, and now reads Aksum, the conversion and 1993.
    Russia's and Mexico's already named the dates their prose turns on. **A label is at most 16
    characters**, which `set-date-line.js` refuses twice before you remember it.

- **2026-09-14, batch H1 — the first four history paragraphs rewritten to cover a whole history, and two
  findings that are larger than the batch**: `gw-001` India, `gw-002` China, `gw-005` Pakistan and
  `gw-008` Bangladesh, the top of the world deck's running order and the four worst cases in it. India's
  history block named 1945, 1946 and 1947 and nothing else; it now runs from the Indus cities to the
  republic of 1950 and spans 3,850 years. All four clear both bars, and rules 1–4 stayed at zero through
  the rewrite. Two date lines were rewritten with them and two deliberately were not — see below.
  Fifteen of the batch's twenty-three citations are new.

  · **THE RECIPE THAT WORKED IS ONE PUBLIC-DOMAIN NATIONAL HISTORY PLUS ONE MODERN OPEN PAPER, AND IT IS
    WORTH REACHING FOR FIRST.** A whole-history sweep wants one date per era, and hunting a separate
    source for each era costs five fetches a card. A single 19th- or early-20th-century survey on
    archive.org carries the whole dynastic arc and can be grepped for every date in one download: Vincent
    A. Smith's *Oxford Student's History of India* (1921) carried the Maurya, the Gupta, the Delhi
    sultanate, Babur at Panipat, the Arab conquest of Sind, the Palas of Bengal, Plassey and the 1905
    partition of Bengal — **eleven of the batch's dates across three cards, from one file**. What such a
    book cannot carry is the deep past, whose dating has moved: the Indus civilisation's own span came
    from an open 2022 paper in *Frontiers in Political Science*.
  · **A 200 FROM ARCHIVE.ORG IS STILL NOT A READABLE BOOK, AND THE CHECK IS ONE COMMAND.** Grep the
    item's `_djvu.txt` for a word the book must contain before planning a card round it. Of the volumes
    tried here, `earlyhistoryofin00smit_2`, the four UNESCO *General History of Africa* volumes and both
    Cambridge *History of India* Mughal volumes all answered 200 and served no text at all;
    `oxfordstudentshi00smit`, `chinesebiograph00gile`, `chinesereadersm00maye`, `ahistorychinabe00willgoog`
    and `historyofnigeria0000acbu` all did. **The UNESCO volumes are the loss worth knowing about**: they
    are the obvious spine for the African cards and they are lending-only.
  · **PAGE NUMBERS COME OUT OF OCR WRONG, SO CITE THE STRUCTURE.** A page marker scanned backwards from a
    matched line put Smith's Gupta chapter on p. 232 and his Delhi sultanate on p. 128, which is the wrong
    way round. The book's own table of contents gives chapter openings that can be read directly
    (61, 77, 111, 151, 257), and those are what the citation carries. **Never estimate a page from a line
    offset**; the rule against inventing a page number covers arithmetic as well as memory.
  · **THE MET'S HEILBRUNN TIMELINE IS RATE-LIMITED HERE, NOT SHUT** — 429 on every attempt including
    spaced ones, which is `check-reach.js`'s own BUSY. `loc.gov` is 403, so the Federal Research Division
    country studies, the obvious per-country spine for this whole pass, are not reachable at their own
    address. `whc.unesco.org` is 403 while `en.unesco.org` and `www.unesco.org` answer.
  · **A DATE LINE IS REWRITTEN WHERE THE RESEARCH GIVES IT A DATE WORTH MEMORISING, NOT MECHANICALLY.**
    India's gained `Republic 26 January 1950` and China's gained `First unified 221 BCE`; Pakistan's and
    Bangladesh's already said the one thing a reader should carry away and were left alone. China's sort
    year moves from 1911 to −221 as a result, which is inert here — a map card is out of Timeline by
    construction, the Geography tree deals in tree order, and `mineFounded` can only move a country
    earlier than the era maps already place it.
  · **`gw-002` NO LONGER CONTAINS THE WORD *Shanghai*, so its `ADJUDICATED` row in `gw-audit.js` is now
    dormant** and the audit's adjudicated count reads 9 against ten declared rows. The row is kept: it
    records a reading that was made, and a row matches only when the card, the rule and the text all
    agree, so it can never excuse anything else.

  **FINDING 1 — EVERY `data.un.org` COUNTRY PROFILE IS NOW A 404, AND 857 ITEMS CITE ONE.** The UNdata
  country-profile section has been retired: `data.un.org/en/iso/<cc>.html` answers 404 for every code
  tried (in, cn, br, ng, ru, mx), in both cases and over both schemes, while `data.un.org/` itself and
  `data.un.org/Search.aspx?q=` still answer. Measured 2026-09-14: **416 `gw-` cards, 5 `ko-`, 1 `wh-`,
  1 `jp-` and 434 glossary terms** carry one. Nothing in the pipeline can see this — `add-sources.js`
  checks that a citation ENDS IN A URL and `check-citations.js` checks names against Crossref, and a dead
  link passes both. It is a repair of its own and a large one, because the honest fix is per claim rather
  than per URL: the profiles carried population, area, region and UN membership date, and the replacement
  differs for each. **`https://www.un.org/en/about-us/growth-in-un-membership` answers and carries the
  admission YEAR but not the day**, which is what this batch used where it needed one. Sweep every
  citation URL at the head of a batch rather than at the end; this was found by the sweep, on four cards,
  after the prose was already written.

  **FINDING 2 — THE RULE-1 PASS LEFT THE SOURCE'S SHAPE BEHIND, WHICH IS WHAT RULE 5 IS.** Every one of
  these four cards passed all four earlier rules and not one of them told a reader what its country was
  before the 20th century. The American sentences had gone; the American source's STARTING POINT had not.
  **A pass that removes what a source says can still leave what it left out.**


- **2026-09-14, batch C39 — the last five cards that needed work, and the finding that the other ten never did**: `gw-729` Stanley, `gw-730` Kingston, `gw-754` Putrajaya, `gw-733` Adamstown and `gw-134` Uruguay. **All four rules now read zero**, with the ten standing findings read, adjudicated and DECLARED in `gw-audit.js` with the reason beside each. `gw-754` comes off the deferred list; `check-cards.js` gained two declared rows the batch's reading produced.

- **2026-09-14, batch C38 — five second-seat and island capitals whose date lines were made of American diplomacy, a constitutional amendment written the year before the split it made possible, and a published article wrong about its own subject's latitude**: `gw-757` Valparaíso, `gw-759` Cotonou, `gw-760` La Paz, `gw-761` Lobamba, `gw-762` Bujumbura and `gw-731` Alofi, with five date lines rewritten off the same research and one malformed facts cell repaired. Taken from the audit's flagged list; it clears the last of the second-seat cards.

- **2026-09-14, batch C37 — six second-seat cities whose backgrounds were histories of American recognition, five constitutions that decline to name the seat they create, and the first batch to need no UNdata citation at all**: `gw-751` Dar es Salaam, `gw-752` Cape Town, `gw-753` Bloemfontein, `gw-755` Abidjan, `gw-756` Colombo and `gw-758` The Hague, with all six date lines rewritten off the same research. Taken from the audit's flagged list; `gw-754` Putrajaya was swapped out for `gw-758` mid-batch — see below.

- **2026-09-14, batch C36 — three Pacific constitutions that never use the word *capital*, a census that reports its capital only as a postal address, and a units bug that corrupted the imperial reader's prose on 48 text nodes**: `gw-721` Avarua, `gw-722` Yaren, `gw-725` Funafuti, `gw-726` Saint-Pierre, `gw-727` Jamestown and `gw-728` Brades, with all six date lines rewritten off the same research. Taken from the audit's own flagged list, as C35 was; `gw-723` and `gw-724` already pass all four rules.

- **2026-09-14, batch C35 — six capitals none of which the world weather index carries, two constitutions that name their capital where nine had not, and one that orders the capital MOVED**: `gw-710` Philipsburg, `gw-711` Vaduz, `gw-712` Road Town, `gw-715` Majuro, `gw-716` San Marino and `gw-720` Ngerulmud, with all six date lines rewritten off the same research. Taken from the AUDIT'S OWN FLAGGED LIST rather than in id order — `gw-713` and `gw-714` are city-states the plan never wrote, and `gw-717`–`gw-719` already pass all four rules.

- **2026-09-14, batch C34 — six capitals, four of them in no weather index at all, two filed in it under a state they are not part of, a capital the UN profile names as somewhere else, and a constitution that never uses the word**: `gw-704` Nuuk, `gw-705` Tórshavn, `gw-706` Basseterre, `gw-707` Pago Pago, `gw-708` Cockburn Town and `gw-709` Capitol Hill, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-14, batch C33 — six island capitals, three Crown Dependencies and Overseas Territories the weather index files under a state they are not part of, and a constitution that locates its Governor by an island rather than a seat**: `gw-698` Douglas, `gw-699` Andorra la Vella, `gw-700` George Town, `gw-701` Saint Peter Port, `gw-702` Roseau and `gw-703` Hamilton, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-14, batch C32 — six island capitals, four of whose countries keep no station at all in the world weather index, and a constitution that provides for a capital without naming one**: `gw-691` Palikir, `gw-692` Oranjestad, `gw-693` Charlotte Amalie, `gw-694` Nuku'alofa, `gw-696` Kingstown and `gw-697` Saint John's, with all six date lines rewritten off the same research. Six again, for C2's reason. `gw-695` Saint Helier stays deferred.

- **2026-09-14, batch C31 — six island capitals, a weather record with every cell in it blank, and a profile that names a different place as the capital**: `gw-685` Castries, `gw-686` Hagåtña, `gw-687` Willemstad, `gw-688` Tarawa, `gw-689` Victoria and `gw-690` Saint George's, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-14, batch C30 — six island capitals, two French territories with no constitution of their own, and two constitutions that name their city once and only as a place where a document was signed**: `gw-679` Port Vila, `gw-680` Nouméa, `gw-681` Bridgetown, `gw-682` Papeete, `gw-683` São Tomé and `gw-684` Apia, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-14, batch C29 — six capitals, a weather record missing a whole FIELD, and a constitution that names an ISLAND as the capital**: `gw-673` Malé, `gw-674` Praia, `gw-675` Bandar Seri Begawan, `gw-676` Belmopan, `gw-677` Nassau and `gw-678` Reykjavík, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-14, batch C28 — six capitals, a constitution that names its capital eighteen times and never calls it one, and a UN figure whose footnote names no place the capital is in**: `gw-665` Honiara, `gw-666` Thimphu, `gw-668` Luxembourg, `gw-669` Paramaribo, `gw-670` Podgorica and `gw-672` Valletta, with all six date lines rewritten off the same research. Six again, for C2's reason. (`gw-667` and `gw-671` are numbers the running order leaves unused.)

- **2026-09-14, batch C27 — six island and small-state capitals, a weather table with an impossible value in it, and a constitution that identifies a capital by whose house it is**: `gw-659` Port Louis, `gw-660` Mbabane, `gw-661` Djibouti, `gw-662` Suva, `gw-663` Moroni and `gw-664` Georgetown, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-14, batch C26 — six capitals, two more countries missing from the weather index, and the first two UN profiles that say what their capital figure counts**: `gw-653` Pristina, `gw-654` Manama, `gw-655` Dili, `gw-656` Tallinn, `gw-657` Port-of-Spain and `gw-658` Nicosia, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-14, batch C25 — six capitals, a weather record with an entirely blank month, and a constitution that files its capital among the national symbols**: `gw-647` Maseru, `gw-648` Bissau, `gw-649` Ljubljana, `gw-650` Malabo, `gw-651` Riga and `gw-652` Skopje, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-13, batch C24 — six capitals, three constitutions that say nothing at all, and two draft constitutions that never came into force**: `gw-641` Kingston, `gw-642` Banjul, `gw-643` Libreville, `gw-644` Gaborone, `gw-645` Chișinău and `gw-646` Tirana, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-13, batch C23 — six capitals, a territory with no weather record and no constitution to cite, and a constitution that spells its capital differently**: `gw-635` San Juan, `gw-636` Sarajevo, `gw-637` Yerevan, `gw-638` Windhoek, `gw-639` Vilnius and `gw-640` Doha, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-13, batch C22 — six capitals, three new ways for the weather record to fail, and a station field naming another city**: `gw-629` Panama City, `gw-630` Zagreb, `gw-631` Tbilisi, `gw-632` Asmara, `gw-633` Ulaanbaatar and `gw-634` Montevideo, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-13, batch C21 — six capitals, two constitutions no longer in force, and a WMO record split a century**: `gw-622` Bangui, `gw-623` Wellington, `gw-625` Muscat, `gw-626` Nouakchott, `gw-627` San José and `gw-628` Kuwait City, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-13, batch C20 — six capitals, and four constitutions that decline to name the city**: `gw-616` Beirut, `gw-617` Helsinki, `gw-618` Monrovia, `gw-619` Oslo, `gw-620` Bratislava and `gw-621` Dublin, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-13, batch C19 — six capitals, and the constitution slug stops being composed**: `gw-609` Managua, `gw-610` Belgrade, `gw-611` Sofia, `gw-612` San Salvador, `gw-613` Brazzaville and `gw-615` Copenhagen, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-13, batch C18 — six capitals, and a WMO table that is complete, windowed and wrong**: `gw-602` Lomé, `gw-603` Vientiane, `gw-605` Ashgabat, `gw-606` Tripoli, `gw-607` Bishkek and `gw-608` Asunción, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-13, batch C17 — six capitals, and the gw-5 hundred comes out clean on all four rules**: `gw-595` Baku, `gw-597` Budapest, `gw-598` Vienna, `gw-599` Minsk, `gw-600` Bern and `gw-601` Freetown, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-13, batch C16 — six capitals, and the constitution leg reverses**: `gw-589` Tegucigalpa, `gw-590` Lisbon, `gw-591` Dushanbe, `gw-592` Port Moresby, `gw-593` Stockholm and `gw-594` Athens, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-13, batch C15 — six capitals, and the constitution leg answers on all six**: `gw-583` Port-au-Prince, `gw-584` Amman, `gw-585` Santo Domingo, `gw-586` Abu Dhabi, `gw-587` Havana and `gw-588` Prague, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-13, batch C14 — six capitals, and a constitution that names a different city than the one it now has**: `gw-577` Kigali, `gw-578` Gitega, `gw-579` Sucre, `gw-580` Tunis, `gw-581` Juba and `gw-582` Brussels, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-13, batch C13 — six capitals, and two constitutional outcomes the pass had not met**: `gw-571` Quito, `gw-572` Amsterdam, `gw-573` Phnom Penh, `gw-574` Harare, `gw-575` Conakry and `gw-576` Porto-Novo, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-13, batch C12 — six capitals, and every author list drafted from a search result was wrong**: `gw-565` N'Djamena, `gw-566` Santiago, `gw-567` Bucharest, `gw-568` Mogadishu, `gw-569` Dakar and `gw-570` Guatemala City, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-10, batch C11 — six capitals, and the constitution leg fails on five of six**: `gw-559` Ouagadougou, `gw-560` Taipei, `gw-561` Sri Jayawardenepura Kotte, `gw-562` Lilongwe, `gw-563` Lusaka and `gw-564` Astana, with all six date lines rewritten off the same research. Six again, for C2’s reason.

- **2026-09-10, batch C10 — six capitals, a constitution that is a draft, and a river the grid forbids naming**: `gw-553` Caracas, `gw-554` Canberra, `gw-555` Niamey, `gw-556` Pyongyang, `gw-557` Damascus and `gw-558` Bamako, with all six date lines rewritten off the same research. Six again, for C2’s reason.

- **2026-09-10, batch C9 — six capitals, and the WMO leg has no station at one of them at all**: `gw-547` Accra, `gw-548` Lima, `gw-549` Antananarivo, `gw-550` Yamoussoukro, `gw-551` Kathmandu and `gw-552` Yaoundé, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-10, batch C8 — six capitals, and every one of their constitutions names its capital**: `gw-541` Kyiv, `gw-542` Warsaw, `gw-543` Tashkent, `gw-544` Kuala Lumpur, `gw-545` Riyadh and `gw-546` Maputo, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-10, batch C7 — six capitals, and the climate leg fails outright on one of them**: `gw-535` Buenos Aires, `gw-536` Kabul, `gw-537` Ottawa, `gw-538` Sana'a, `gw-539` Rabat and `gw-540` Luanda, with all six date lines rewritten off the same research. Six again, for C2's reason.

- **2026-09-10, batch C6 — six capitals, and two constitutions say nothing at all**: `gw-529` Seoul, `gw-530` Khartoum, `gw-531` Kampala, `gw-532` Madrid, `gw-533` Algiers and `gw-534` Baghdad, with all six date lines rewritten off the same research. Six again, for C2’s reason.

- **2026-09-10, batch C5 — six capitals, and one constitution names a different city**: `gw-523` Paris, `gw-524` Pretoria, `gw-525` Rome, `gw-526` Nairobi, `gw-527` Naypyidaw and `gw-528` Bogotá, with all six date lines rewritten off the same research. Six again, for C2’s reason.

- **2026-09-10, batch C4 — six capitals, and four of the six have no constitutional clause**: `gw-517` Tehran, `gw-518` Ankara, `gw-519` Berlin, `gw-520` Bangkok, `gw-521` London and `gw-522` Dodoma, with all six date lines rewritten off the same research. Six again, for C2’s reason.

- **2026-09-10, batch C3 — six more capitals, and the fifth leg is not always a constitution**: `gw-511` Mexico City, `gw-512` Tokyo, `gw-513` Cairo, `gw-514` Manila, `gw-515` Kinshasa and `gw-516` Hanoi, with all six date lines rewritten off the same research. Six again, for C2’s reason.

- **2026-09-10, batch C2 — six capitals, and the history leg turns out to be a book**: `gw-505`
  Islamabad, `gw-506` Abuja, `gw-507` Brasília, `gw-508` Dhaka, `gw-509` Moscow and `gw-510` Addis
  Ababa, with all six date lines rewritten off the same research. Six rather than twelve, and the
  reason is the fourth leg: the figures and the climate come uniformly from UNdata and the WMO, and
  the HISTORY is per city and is where the research time goes.

- **2026-09-10, batch C1 — the capitals begin, and the recipe is settled**: `gw-501` New Delhi,
  `gw-502` Beijing, `gw-503` Washington, D.C. and `gw-504` Jakarta, with all four date lines rewritten
  off the same research. **Deliberately four rather than twelve** — the country recipe does not
  transfer and this batch is where the city one was found.


- **2026-09-10, batch G20 — the last four, and the country half of the deck is finished**:
  `gw-230` Norfolk Island, `gw-231` Niue, `gw-232` Vatican City and `gw-233` the Pitcairn Islands, with
  all four date lines rewritten off the same research. **All 233 country and territory backgrounds have
  now been rewritten.**

- **2026-09-10, batch G19 — the last of the small islands, and four sovereign states among them**:
  `gw-218` Saint Martin, `gw-219` Anguilla, `gw-220` Palau, `gw-221` the Cook Islands, `gw-222` Nauru,
  `gw-223` Wallis and Futuna, `gw-224` Saint Barthélemy, `gw-225` Tuvalu, `gw-226` Saint Pierre and
  Miquelon, `gw-227` Saint Helena, `gw-228` Montserrat and `gw-229` the Falkland Islands, with all
  twelve date lines rewritten off the same research.

- **2026-09-10, batch G18 — the small-state tail, and three whose own name is their capital's**:
  `gw-204` Greenland, `gw-205` the Faroe Islands, `gw-207` American Samoa, `gw-208` the Turks and Caicos
  Islands, `gw-209` the Northern Mariana Islands, `gw-210` Sint Maarten, `gw-212` the British Virgin
  Islands, `gw-213` Gibraltar, `gw-214` Monaco, `gw-215` the Marshall Islands, `gw-216` San Marino and
  `gw-217` Åland, with all twelve date lines rewritten off the same research.

- **2026-09-10, batch G17 — twelve dependencies, and none of the pass's three standard sources carries
  eleven of them**: `gw-178` Iceland, `gw-180` New Caledonia, `gw-182` French Polynesia, `gw-186` Guam,
  `gw-187` Curaçao, `gw-192` Aruba, `gw-193` the United States Virgin Islands, `gw-195` Jersey, `gw-198`
  the Isle of Man, `gw-200` the Cayman Islands, `gw-201` Guernsey and `gw-203` Bermuda, with all twelve
  date lines rewritten off the same research.

- **2026-09-10, batch G16 — twelve more, four of which no international body carries**: `gw-115` Denmark,
  `gw-117` Finland, `gw-119` Norway, `gw-120` Slovakia, `gw-121` Ireland, `gw-123` New Zealand, `gw-130`
  Croatia, `gw-135` Puerto Rico, `gw-136` Bosnia and Herzegovina, `gw-153` Kosovo, `gw-167` Macau and
  `gw-171` Western Sahara, with all twelve date lines rewritten off the same research.

- **2026-09-06, batch G15 — twelve more, mostly European and one that belongs to no state's statistics**:
  `gw-072` the Netherlands, `gw-082` Belgium, `gw-088` Czechia, `gw-090` Portugal, `gw-093` Sweden,
  `gw-094` Greece, `gw-097` Hungary, `gw-098` Austria, `gw-100` Switzerland, `gw-104` Hong Kong,
  `gw-110` Serbia and `gw-111` Bulgaria, with all twelve date lines rewritten off the same research.

- **2026-09-06, batch G14 — the twelve largest deferrals, and the ones the pass most needed**: `gw-003`
  the United States, `gw-019` Germany, `gw-021` the United Kingdom, `gw-023` France, `gw-025` Italy,
  `gw-032` Spain, `gw-036` Afghanistan, `gw-037` Canada, `gw-042` Poland, `gw-054` Australia, `gw-060`
  Taiwan and `gw-067` Romania, with all twelve date lines rewritten off the same research. Ten of them
  had no AQUASTAT profile and the other two were deferred for reasons of their own, so the whole batch
  is written on G13's replacement recipe.

- **2026-09-06, batch G13 — twelve more, and the first written WITHOUT an AQUASTAT profile**: `gw-114`
  Singapore, `gw-146` Albania, `gw-149` Slovenia, `gw-152` North Macedonia, `gw-168` Luxembourg, `gw-170`
  Montenegro, `gw-172` Malta, `gw-188` Kiribati, `gw-191` Micronesia, `gw-194` Tonga, `gw-199` Andorra and
  `gw-211` Liechtenstein, with all twelve date lines rewritten off the same research. **Every one of them
  was on the deferral list**, which accordingly falls from fifty-nine to forty-seven.
- **2026-09-06, batch G12 — twelve more**: `gw-177` Bahamas, `gw-179` Vanuatu, `gw-181` Barbados,
  `gw-183` São Tomé and Príncipe, `gw-184` Samoa, `gw-185` Saint Lucia, `gw-189` Seychelles, `gw-190`
  Grenada, `gw-196` Saint Vincent and the Grenadines, `gw-197` Antigua and Barbuda, `gw-202` Dominica and
  `gw-206` Saint Kitts and Nevis, with all twelve date lines rewritten off the same research. **Fifteen
  more join the deferral list** — `gw-186` Guam, `gw-187` Curaçao, `gw-188` Kiribati, `gw-191` Micronesia,
  `gw-192` Aruba, `gw-193` United States Virgin Islands, `gw-194` Tonga, `gw-195` Jersey, `gw-198` Isle of
  Man, `gw-199` Andorra, `gw-200` Cayman Islands, `gw-201` Guernsey, `gw-203` Bermuda, `gw-204` Greenland
  and `gw-205` Faroe Islands — which takes it to fifty-nine.
- **2026-09-06, batch G11 — twelve more**: `gw-160` Eswatini, `gw-161` Djibouti, `gw-162` Fiji, `gw-163`
  Comoros, `gw-164` Guyana, `gw-165` Solomon Islands, `gw-166` Bhutan, `gw-169` Suriname, `gw-173`
  Maldives, `gw-174` Cabo Verde, `gw-175` Brunei and `gw-176` Belize, with all twelve date lines rewritten
  off the same research. **Eight more join the deferral list** — `gw-167` Macau, `gw-168` Luxembourg,
  `gw-170` Montenegro, `gw-171` Western Sahara, `gw-172` Malta, `gw-178` Iceland, `gw-180` New Caledonia
  and `gw-182` French Polynesia — which takes it to forty-four.
- **2026-09-06, batch G10 — twelve more**: `gw-144` Botswana, `gw-145` Moldova, `gw-147` Lesotho,
  `gw-148` Guinea-Bissau, `gw-150` Equatorial Guinea, `gw-151` Latvia, `gw-154` Bahrain, `gw-155`
  Timor-Leste, `gw-156` Estonia, `gw-157` Trinidad and Tobago, `gw-158` Cyprus and `gw-159` Mauritius,
  with all twelve date lines rewritten off the same research. **No country joined the deferral list**,
  which stands where G9 left it at thirty-six.
- **2026-09-06, batch G9 — twelve more**: `gw-129` Panama, `gw-131` Georgia, `gw-132` Eritrea, `gw-133`
  Mongolia, `gw-134` Uruguay, `gw-137` Armenia, `gw-138` Namibia, `gw-139` Lithuania, `gw-140` Qatar,
  `gw-141` Jamaica, `gw-142` Gambia and `gw-143` Gabon, with all twelve date lines rewritten off the same
  research. **Seven more join the deferral list** — `gw-130` Croatia, `gw-135` Puerto Rico, `gw-136` Bosnia
  and Herzegovina, `gw-146` Albania, `gw-149` Slovenia, `gw-152` North Macedonia and `gw-153` Kosovo —
  which takes it to thirty-six.
- **2026-09-06, batch G8 — twelve more**: `gw-108` Paraguay, `gw-109` Nicaragua, `gw-112` El Salvador,
  `gw-113` Republic of the Congo, `gw-116` Lebanon, `gw-118` Liberia, `gw-122` Central African Republic,
  `gw-124` Palestine, `gw-125` Oman, `gw-126` Mauritania, `gw-127` Costa Rica and `gw-128` Kuwait, with all
  twelve date lines rewritten off the same research. **Ten more join the deferral list** — `gw-104` Hong
  Kong, `gw-110` Serbia, `gw-111` Bulgaria, `gw-114` Singapore, `gw-115` Denmark, `gw-117` Finland,
  `gw-119` Norway, `gw-120` Slovakia, `gw-121` Ireland and `gw-123` New Zealand — which takes it to
  twenty-nine countries with no AQUASTAT profile.
- **2026-09-06, batch G7 — twelve more**: `gw-089` Honduras, `gw-091` Tajikistan, `gw-092` Papua New
  Guinea, `gw-095` Azerbaijan, `gw-096` Israel, `gw-099` Belarus, `gw-101` Sierra Leone, `gw-102` Togo,
  `gw-103` Laos, `gw-105` Turkmenistan, `gw-106` Libya and `gw-107` Kyrgyzstan, with all twelve date
  lines rewritten off the same research. **Six more high-income countries join the deferral list** —
  `gw-090` Portugal, `gw-093` Sweden, `gw-094` Greece, `gw-097` Hungary, `gw-098` Austria and `gw-100`
  Switzerland — which now stands at nineteen countries with no AQUASTAT profile.
- **2026-09-06, batch G6 — twelve more**: `gw-075` Guinea, `gw-076` Benin, `gw-077` Rwanda, `gw-078`
  Burundi, `gw-079` Bolivia, `gw-080` Tunisia, `gw-081` South Sudan, `gw-083` Haiti, `gw-084` Jordan,
  `gw-085` Dominican Republic, `gw-086` United Arab Emirates and `gw-087` Cuba, with all twelve date
  lines rewritten off the same research. **`gw-082` Belgium and `gw-088` Czechia join the deferral
  list**, which now stands at thirteen countries with no AQUASTAT profile.
- **2026-09-06, batch G5 — twelve more, the first written under all four rules**: `gw-061` Sri Lanka,
  `gw-062` Malawi, `gw-063` Zambia, `gw-064` Kazakhstan, `gw-065` Chad, `gw-066` Chile, `gw-068` Somalia,
  `gw-069` Senegal, `gw-070` Guatemala, `gw-071` Ecuador, `gw-073` Cambodia and `gw-074` Zimbabwe, with
  all twelve date lines rewritten off the same research. **`gw-067` Romania and `gw-072` the Netherlands
  join the deferral list**, which now stands at eleven countries with no AQUASTAT profile; `gw-060`
  Taiwan is left for a batch of its own, being outside every UN-organised source this pass rests on.
- **2026-09-06, the border sweep — 42 of the 49 already rewritten**: rule 4 arrived after G4, and every
  background written under the first three rules opened on a list of neighbours, that being the sentence
  an AQUASTAT profile opens with. All 42 were rewritten in place — the bearings kept, each neighbour
  swapped for the sea, region or landform it stands in — plus four adjectival mentions ("the Cameroonian
  border") and two historical ones reworded. `node .claude/gw-audit.js` gained rule 4 and its own
  vocabulary, taken from the deck's own answer terms below `gw-500`; the finding went 65 → 24, and every
  one of the 24 left is outside the rewritten range but two that the rule permits.
- **2026-09-06, batch G4 — twelve more**: `gw-047` Ghana, `gw-048` Peru, `gw-049` Madagascar, `gw-050`
  Côte d'Ivoire, `gw-051` Nepal, `gw-052` Cameroon, `gw-053` Venezuela, `gw-055` Niger, `gw-056` North
  Korea, `gw-057` Syria, `gw-058` Mali and `gw-059` Burkina Faso, with all twelve date lines rewritten off
  the same research. **`gw-054` Australia joins the deferral list**, the ninth country the FAO has no
  AQUASTAT profile for; `gw-060` Taiwan is left for a batch of its own, being outside every UN-organised
  source this pass rests on.
- **2026-09-06, batch G3 — twelve more**: `gw-031` Uganda, `gw-033` Algeria, `gw-034` Iraq, `gw-035`
  Argentina, `gw-038` Yemen, `gw-039` Morocco, `gw-040` Angola, `gw-041` Ukraine, `gw-043` Uzbekistan,
  `gw-044` Malaysia, `gw-045` Saudi Arabia and `gw-046` Mozambique, with all twelve date lines rewritten
  off the same research. **`gw-036` Afghanistan is DEFERRED for a reason of its own** — its AQUASTAT PDF
  is served as an HTML page (see below) — and `gw-032` Spain, `gw-037` Canada and `gw-042` Poland join
  the OECD deferral list, which now stands at eight: `gw-003`, `gw-019`, `gw-021`, `gw-023`, `gw-025`,
  `gw-032`, `gw-037`, `gw-042`.
- **2026-09-06, batch G2 — twelve more**: `gw-015` DR Congo, `gw-016` Vietnam, `gw-017` Iran, `gw-018`
  Turkey, `gw-020` Thailand, `gw-022` Tanzania, `gw-024` South Africa, `gw-026` Kenya, `gw-027` Myanmar,
  `gw-028` Colombia, `gw-029` South Korea and `gw-030` Sudan, on the same recipe, with eight date lines
  rewritten off the same research. **The four European countries in that stretch — `gw-019` Germany,
  `gw-021` United Kingdom, `gw-023` France, `gw-025` Italy — are DEFERRED**, for the reason `gw-003` is:
  the FAO has no AQUASTAT profile for any of them.
- **2026-09-06, batch G1 — the first thirteen backgrounds rewritten**: `gw-001` India, `gw-002` China,
  `gw-004` Indonesia, `gw-005` Pakistan, `gw-006` Nigeria, `gw-007` Brazil, `gw-008` Bangladesh,
  `gw-009` Russia, `gw-010` Ethiopia, `gw-011` Mexico, `gw-012` Japan, `gw-013` Egypt and `gw-014`
  Philippines, each five sentences of landform, water and climate over five of the country's own
  history, at 275–330 words with five cited works and their markers. Three date lines went with them
  (`gw-007`, `gw-011`, `gw-012`), which had printed `US recognition` and `Perry arrives`.
- **2026-09-06.** The date lines: fifteen `gw-` cards carried a census count or a population figure in the
  key/value list under the answer term (`Census | 21,893,095 in 2020` on `gw-502` Beijing), and none does
  now. The rule is that a geography card's date line carries DATES; the population belongs in the facts
  grid, where the card already prints it once.
- **2026-09-06.** Four facts-grid populations rounded to three significant figures — Beijing 21.89M →
  21.9M, Jakarta 11.14M → 11.1M, Moscow 13.27M → 13.3M, Tokyo 14.26M → 14.3M. Those were the only four
  in the whole corpus over three; the three `+105.1%` rows on `gw-575`, `gw-625` and `gw-673` are
  population GROWTH rates rather than population figures and are left as they are.
- **2026-09-06.** Two pictures: `gw-008` Bangladesh (the old one was a moored boat filling the frame,
  photographed at Kaikhali on the INDIAN side of the Sundarbans) and `gw-507` Brasília (a 14,177 × 1,820
  panorama — a 7.8∶1 strip, which in the card's 16∶9 frame is a sliver).

## What G1 found

- **📖 THE SOURCE THAT MAKES THE PASS POSSIBLE IS THE FAO'S AQUASTAT COUNTRY PROFILE.** One PDF per
  country at `https://www.fao.org/aquastat/en/countries-and-basins/country-profiles/country/<ISO3>`,
  whose GEOGRAPHY, CLIMATE AND POPULATION section carries the landform, the borders, the coastline, the
  regions and the altitude range, whose CLIMATE section carries the seasons, the mean rainfall AND its
  range across the country, and whose WATER RESOURCES section names the rivers and the basins. It is
  enough for a whole block of five sentences on its own, which is exactly what rule 3 asks for and what
  no other openable per-country source supplies. Each profile also STATES ITS OWN recommended citation
  on page 1, so the year is read rather than composed.
- **…AND IT HAS NO PROFILE FOR SEVERAL LARGE COUNTRIES, THE UNITED STATES AMONG THEM.** `gw-003` is
  therefore DEFERRED: it is the one card exempt from rule 1, it breaks rule 3 as badly as any, and the
  obvious substitutes are shut here — `www.usgs.gov` and `www.weather.gov` are 403, `globalchange.gov`
  refuses the connection outright, and NCEI's own explainer paths 404. `pubs.usgs.gov` and `nps.gov`
  answer and are where the next attempt should start.
- **THE RECOGNITION GUIDE IS STILL WORTH CITING AND ITS PAGES ARE MOSTLY NOT ABOUT THE COUNTRY.** For
  `gw-006` Nigeria, `gw-014` Philippines, `gw-005` Pakistan and `gw-007` Brazil the whole national
  content of the page is the colonial ruler and the independence date — one sentence, sometimes two.
  What fills the other four is per country and there is no general answer; what worked in G1 was the
  guide's **Milestones** (the two Chinese revolutions, Bandung, decolonisation, the Suez Crisis, the
  collapse of the Soviet Union, the opening of Japan), the **UNdata** profile for the UN membership date
  and the UN region, the **Commonwealth Secretariat** page for a member's landform, and a **primary
  constitutional text** where one is openable (`planalto.gov.br` for the Brazilian constitution of 1824,
  `diputados.gob.mx` for the Mexican one).
- **AN OPEN JOURNAL ARTICLE IS A GOOD FIFTH SOURCE AND A BAD FIRST ONE.** DOAJ and Crossref find
  Copernicus, PLOS, GRL and PEPS papers on a country's defining feature — the Amazon's hydrology, Lake
  Baikal's effect on its own rainfall, Japan's winters since 1959, Teotihuacan's valley — and each
  carries one specific, quotable, hedged claim. Searching for one that states a country's general
  geography is a waste of a search: Europe PMC is life-sciences and returns amphipods for Baikal.
- **TWO CARDS PAY A REAL PRICE FOR RULE 1 AND BOTH ARE FLAGGED HERE.** `gw-011` Mexico describes its
  seas and its southern neighbours and does not name the country along its northern border; `gw-014`
  Philippines carries the 1898 cession, the war that followed it, its casualties and the 1946
  independence, and never says who the second colonial ruler was. Both read as written; both leave a
  reader with a question the card declines to answer. **If the rule is meant to allow the bare
  geographic and colonial facts, those are one clause each.**
- **THREE 200-STATUS WALLS WERE MET AGAIN OR NEWLY**: `www.unesco.org/en/countries/<cc>` serves a
  JavaScript challenge under a 200 (its own `unesdoc` is 403); `scielo.br` article pages serve
  "Establishing a secure connection" under a 403; and **the CIA World Factbook is still the empty
  JavaScript shell C0 recorded**, on the HTML page and on the Gatsby `page-data.json` alike — re-tested
  and unusable. `search.scielo.org` is 403 and `digitallibrary.un.org`'s search returns 202.

## What C39 found

**TEN OF THE FIFTEEN CARDS LEFT ON THE FLAGGED LIST WERE THE MEASURE REPORTING ITSELF.** After C38 the
audit read United States 7, grid repeats 7, no-landform 1, bordering countries 2 — fifteen distinct
cards. Read one at a time, **five needed work and ten did not**:

* **The card's own subject IS the United States or one of its territories** — `gw-003`, `gw-135`
  Puerto Rico, `gw-193` the United States Virgin Islands, `gw-207` American Samoa and `gw-503`
  Washington, D.C. Rule 1 matches `\bWashington\b` and an unqualified `American`, so three of those
  are flagged for printing their own answer term. The plan already recorded two of them as permanent;
  it is five.
* **The grid's value stands inside a longer name, or names where something happened** — `gw-002`
  China says the Communist Party was founded in Shanghai, which is not the largest-city cell being
  repeated; `gw-151` Latvia says "the Gulf of Riga", and a gulf named for a city is not the city;
  `gw-188` Kiribati says "South Tarawa", which is the urban area and not the capital.
* **A country named for one of the hundred other reasons rule 4's own header allows** — `gw-005`
  Pakistan on the partition of British India, `gw-053` Venezuela on independence from Spain. Both
  sentences carry a border word; neither is a neighbour list.

**SO THE AUDIT GAINED A DECLARED ADJUDICATION TABLE, AND THAT IS THE BATCH'S REAL DELIVERABLE.**
`ADJUDICATED` in `gw-audit.js` follows `check-cards.js`'s own model: **a row matches only when the
card, the rule AND the matched text all agree**, so `gw-135` is excused for "United States" and would
report the day it says "Washington". Proved by planting one: a "seen from Washington" inserted into
`gw-135` and a "whose capital is Beijing" into `gw-002` both reported, and the adjudicated count fell
from 10 to 8. **A count that can never reach zero stops being read**, which is how a real finding
hides among ten standing ones — and the audit now reads **0 / 0 / 0 / 0, with 10 adjudicated**.

**THE PATTERN THAT SUGGESTS ITSELF IS THE ONE THAT MUST NOT BE USED.** "Exempt a card whose answer
term contains the matched words" would have excused `gw-134` Uruguay for "the southeast of the
American continent" — which was a real finding, is the exact compound trap rule 1's own header
records one word further in, and is fixed in this batch to "the south-east of South America".

**PUTRAJAYA CAME OFF THE DEFERRED LIST, AND THE WAY IN WAS THE CONSTITUTION RATHER THAN THE CITY.**
C37 gave it up when the corporation's own site turned out to be a portal with no prose, the lake
portal a login page, and Pertanika and MDPI shut. The federal constitution is open on Constitute and
says something better than any of them: **article 154 provides that "until Parliament otherwise
determines, the municipality of Kuala Lumpur shall be the federal capital"**, and article 1 excludes
the Federal Territory of Putrajaya from the state of Selangor under the Constitution (Amendment) Act
2001. The city is named 24 times in the text and never as the capital. The physical block came from
**a BMC Bioinformatics paper on the lake** (400 hectares, warm, shallow, never stably layered, 6.6 m
mean depth), **AQUASTAT's Malaysia profile** (61 per cent of the peninsula below 100 m, the Banjaran
Titiwangsa, the two monsoons) and **WMO Petaling Jaya**, the nearest station with published normals.
**A capital with no station of its own can still have a climate sentence if the card says whose** —
C38's Lobamba rule, applied a second time.

**THREE ISLAND CAPITALS HAD GOOD HISTORY WHERE THEIR GEOGRAPHY SHOULD HAVE BEEN.** `gw-729` Stanley
spent four of its first five sentences on census definitions and `gw-730` Kingston spent its on
ancestry and language statistics — both accurate, both cited, and neither telling a reader anything
about the place whose shape the card has just asked them to recognise. They now open on the land:
Stanley on the archipelago's 12,173 km², the cold currents, a wind belt averaging 30 km/h with gales
on 70 days a year, 400 to 600 mm of rain and the tussac peat that is one of the few long terrestrial
climate records the South Atlantic has; Kingston on the basalt of Mount Pitt and Mount Bates, the
krasnozem that slumps after heavy rain, the cliffed northern shore and an island that has never been
joined to a landmass. **The history each already had was kept**, which is what makes these rewrites
half the work of a C38 card.

**A CHECKER'S DECLARED TABLE IS PART OF A BATCH'S OUTPUT, TWICE OVER.** Three Parks Australia pages
on one card tripped `check-cards.js`'s over-cited rule, which is the right reading of three papers by
one scholar and the wrong reading of three record pages from the agency that manages the park — so
**"parks australia" joins `INSTITUTIONAL`**, beside "national park service", and the card reports as a
one-institution NOTE instead. And `gw-589` Tegucigalpa's standing "2 sources in Spanish" was read and
is **the École française d'Athènes case one language over**: only one of the two is a Spanish WORK,
the other being the WMO's own English page credited to the Honduran agency under its Spanish name. It
is declared in `SAME_LANGUAGE_OK` with the count in the key, so a third Spanish source reports again.

**AJOL IS STILL SHUT AND IT IS THE SECOND DAY RUNNING.** Every
`ajol.info/index.php/<journal>/article/view/<id>` answers 202 with a zero-byte body. **Copernicus
carried this batch as it carried C38** — Biogeosciences for the Falklands — and BMC for Putrajaya;
academicjournals.org (403), MDPI (403), sjst.psu.ac.th (connection reset) and sciencedirect (403) were
all shut again.

**AND THE BUILD-SCRIPT CHARACTER TRAP FIRED AGAIN.** A patch written with `\u2019` failed against a
file holding the real U+2019, having succeeded against the same file an hour earlier — the generator
is rewritten by its own patches and the escapes resolve as it goes. **Write a patch string with the
real character and let the assertion catch it**, which is what it is for.

## What C38 found

**THE FIVE SECOND-SEAT CARDS ARE DONE, AND EVERY ONE OF THEM HAD A DATE LINE MADE OF AMERICAN DIPLOMACY.**
`gw-757` led on a consular cable of 21 November 1914, `gw-759` on "US relations" and "Embassy here",
`gw-760` on a recognition of 1848 and a legation of 1849, `gw-762` on a legation and then an embassy
again, and `gw-731` on a recognition of 2023. Five of the six date lines were rewritten; `gw-761`
Lobamba's was already free of it and was left alone, which is the pass's own rule that a card needing
nothing is not touched.

**AJOL IS SHUT THIS SESSION, WHICH IS A FACT ABOUT THE DAY RATHER THAN ABOUT THE INDEX.** C37 found
African Journals Online the index this pass had been missing for African cities; today every
`/index.php/<journal>/article/view/<id>` page answers **202 with a zero-byte body** — a Cloudflare
interstitial — while the journal INDEX pages answer 200. Re-tested on URLs C37 itself cited and
successfully read. **Record a host's state with the date on it and re-measure rather than reading it
back**, which is `check-reach.js`'s whole argument one host further on.

**A PUBLISHED ARTICLE CAN BE WRONG ABOUT ITS OWN SUBJECT, AND THE WAY THROUGH IS TO USE ONLY WHAT IT IS
AN AUTHORITY ON.** Kapstein's *Ciudad anfiteatro* is the best description of Valparaíso's form there
is, and it places the city "entre los paralelos 32º 27’ y 32º 29’ latitud sur" — about 65 kilometres
north of where it stands — and dates the Panama Canal to "la década de 1930". Both are checkable and
both are wrong. The card takes the article's MORPHOLOGY, which is its subject and its argument (the
amphitheatre, the arc from Cerro Artillería to Cerro Alegre and then Playa Ancha to Cerro Barón, the
hills at 10 to 300 metres, el plan too narrow for a grid, the merchant styles) and NONE of its dates or
coordinates. The latitude used on the card is the IOP paper's −33°03’, which is right.

**A CONSTITUTIONAL AMENDMENT CAN BE THE WHOLE STORY, AND YOU ONLY SEE IT BY READING THE PREVIOUS TEXT.**
Article 9 of Burundi's 2018 constitution still fixes the capital at Bujumbura — and adds a clause the
2005 article did not have: the law may "separate the political capital from the economic capital". The
2005 text said only that the law might transfer the capital to another location. So `gw-762` is not a
card about a city that lost its status; it is a card about the sentence that made the division legal,
written the year before it happened. **Constitute carries both texts under separate URLs and the card
cites both**, because the finding is the difference between them.

**A UN RESOLUTION URL THAT 202s IS NOT AN INVITATION TO COMPOSE ONE.** `gw-762` cited
`digitallibrary.un.org/record/205656` for resolution 1746 (XVI) and that host is behind a challenge
today. The obvious replacement — a `documents.un.org/doc/resolution/gen/nr0/…` path — returned **200 and
a real PDF of a completely different resolution**, about scholarships for students from Territories
under Portuguese administration. It was caught by reading the first 1,200 characters of the file. **A
200 on a composed UN document path is not the document you asked for**, which is the AQUASTAT rule from
`docs/geography-background-plan.md` met again on another host. The resolution material was dropped from
the card rather than re-cited, and the two constitutions carry the seat question instead.

**COPERNICUS IS THE OPEN SHELF THIS PASS KEEPS COMING BACK TO.** Three of the six cards rest on a
Copernicus journal — NHESS for Bujumbura's rivers and floods, ACP for La Paz's canyon and its
temperatures, ESSD for Niue's reef terraces and uplift — all fetched whole, with no wall, in one
request each. MDPI (403), Wiley/Hindawi (403), Elsevier (via publisher) and academicjournals.org (403)
were all shut again. **Where a paper is Elsevier's, look for the author's HAL deposit**: the Nokoué
salinity paper that carries Cotonou's whole physical block is `10.1016/j.ecss.2021.107689` and is open
at `hal.science/hal-03368397`.

**A WMO RECORD CAN BE SOUND FOR RAIN AND USELESS FOR TEMPERATURE, AND THE TELL IS STILL THE SPREAD.**
C37 found this at Abidjan; Cotonou (city 259) is the same shape — its `maxTemp` reaches 39.0 °C in
October against real means near 31, and its `minTemp` sits at 28.7 °C in January against real means
near 25. **Its rainfall is textbook** and is what the card uses: the West African double maximum, June
at 342.7 mm over 17 days, the August dip to 44.0 mm, January at 13.4 mm on a single day. Bujumbura
(1519) and Mbabane (912) both pass the spread test and are used for temperature as well.

**A CAPITAL WITH NO STATION OF ITS OWN CAN STILL HAVE A CLIMATE SENTENCE, IF THE CARD SAYS WHOSE.**
Lobamba is not in the world weather index and Mbabane is, about 15 kilometres away and several hundred
metres higher. The card writes "at the nearest station with published normals, in the administrative
capital" rather than attributing those normals to Lobamba — which is the honest form, and which also
keeps the sentence inside the rule that a capital card may not name its own country.

**AND A MEASUREMENT WRITTEN IN WORDS DOES NOT CONVERT.** `U_METRIC` in app.js knows `°C` and does not
know "degrees Celsius", so a temperature written out in words keeps its Celsius figure for the imperial
reader while the rainfall in the same sentence converts — a half-converted sentence. Measured over the
shipped corpus: **81 cards carry a Celsius figure and 17 write it in a shape the switch cannot act on**,
of which one (`wh-053`) is a temperature DIFFERENCE and correctly stays. This batch's cards are written
`°C (°F)`; the other 16 are a pass of their own, and the fix is either a data sweep or one alternative
added to `U_METRIC` — which would need its own before-and-after measurement over the whole corpus.

**THE IMPERIAL RENDER SWEEP EARNED ITS PLACE AGAIN.** Rendering each draft through the real
`unitizeText` and diffing the word sets caught three things no other check can see: `gw-761`'s
"a national average of 788 (31)", where the bare follow-on figure loses its unit in BOTH modes;
`gw-761`'s "19.3 and 4.7 (67 and 40)", the same shape on a temperature; and `gw-760`'s "half a
kilometre above", a spelled-out metric figure the engine leaves bare for an imperial reader. All three
read perfectly in the authored metric view.

**AND ONE MALFORMED FACTS CELL WAS REPAIRED ON THE WAY PAST.** `gw-731`'s population row read
`610in Alofi (2022 census)` — a missing space that nothing in the pipeline reports, because
`set-facts.js` validates the grid's SHAPE and the audit strips a value at its first bracket. It is now
`610 in Alofi (2022 census)`. **Read a card's grid when you rewrite its background**; it is the one
part of a map card no checker proof-reads.

## What C37 found

**These were the worst cards in the collection, and the fault had a shape.** Every one of the six carried a
date line made entirely of American diplomatic events — *Embassy raised*, *Legation opened*, *US recognition*,
*US embassy*, *Council response* — and backgrounds to match: `gw-752` gave five of its ten sentences to a
legation that stayed in Cape Town for six months in 1930, and `gw-753` explained Bloemfontein by observing
that the American record of its own missions names the other two capitals and never this one. **A second-seat
card is the shape most exposed to this**, because the recognition guide has a great deal to say about which
city a mission sat in and nothing to say about the city.

**FIVE CONSTITUTIONS IN A ROW DECLINE TO NAME THE SEAT THEY CREATE, and each declines differently.** Tanzania's
uses the word *capital* only in the article forbidding capital punishment, names neither Dodoma nor Dar es
Salaam anywhere, and acknowledges the question once, obliquely, in a clause about whether the President counts
as absent — which speaks of "the town which is the seat of Government" without saying which town that is.
Côte d'Ivoire's never names Yamoussoukro at all and names Abidjan once, in the title of the national anthem.
Sri Lanka's never names Sri Jayewardenepura Kotte, but does place the Supreme Court at Colombo, "unless the
Chief Justice otherwise directs". The Netherlands' names Amsterdam exactly once, in the article on the King's
inauguration, and never names The Hague. **South Africa's is the exception that proves it**: it states that the
seat of Parliament is Cape Town and then, in the same sentence, provides that an Act of Parliament may put it
elsewhere — while naming the Supreme Court of Appeal eighteen times and Bloemfontein not once.

**THE COMMONWEALTH SECRETARIAT IS THE BODY THAT SAYS SO OUTRIGHT, and it is worth reading for what it omits
too.** It gives Tanzania's capital as "Dar es Salaam (acting), Dodoma (official)", South Africa's institution
by institution rather than by label, and Sri Lanka's as "Colombo (executive and judicial), Sri Jayewardenepura
Kotte (legislative)" — three different shapes of answer to one question. For Malaysia it gives **Kuala Lumpur
and nothing else**, so the administrative capital is absent from the Commonwealth's own record as well as from
the constitution, which names Putrajaya only as a Federal Territory carved out of Selangor in 2001.

**AJOL IS THE INDEX THIS PASS WAS MISSING FOR AFRICAN CITIES.** African Journals Online answers from here, and
it carried the landform leg for three of the six where DOAJ returned nothing and the obvious publishers were
walled: the Cape Flats aquifer in *Water SA*, Loch Logan in the middle of Bloemfontein in *Water SA*, and
Abidjan's Quaternary coastal aquifer in the *International Journal of Biological and Chemical Sciences*.
**Its article pages carry full `citation_*` metadata**, so authors, volume, issue and pages come off the page
rather than out of a guess. **Its back-catalogue DOIs have no `published-print` date**, so Crossref answers
with the deposit year — 2007 for a 2005 issue, 2010 for a 2009 one — which is the documented
digitising-a-back-catalogue case and goes to the eye rather than to the mismatch list.

**A BATCH IS COMPOSED OF CARDS WHOSE SOURCES CAN BE LANDED, AND SWAPPING ONE OUT IS CHEAPER THAN FORCING IT.**
`gw-754` Putrajaya was researched and abandoned: the Putrajaya Corporation's own site is a JavaScript portal
that serves no prose, its lake portal is a login page, MDPI and Pertanika are walled or down from here, and
DOAJ holds almost nothing on the city. `gw-758` The Hague replaced it and was fully sourced in three fetches.
This is `gw-695` Saint Helier's refusal one level up — **a sourcing decision, not a political one** — and
Putrajaya returns to the flagged list for a batch that finds a way in.

**AND THE URL SWEEP CAME BACK 28 OF 28, WITH NO UNDATA CITATION IN THE BATCH.** That is not a policy change;
it is what happens when the sources are chosen for what they say about the city rather than for a country
profile. Where a card needs a figure the profile used to give, the constitution, the Commonwealth and the
city's own water literature between them carry it.

**One measurement worth having before the next batch**: a WMO station's `maxTemp` and `minTemp` are usually
mean daily values and are **sometimes extremes**, and the field names do not say which. Abidjan's record gives
a January maximum of 36.7 °C against a minimum of 15.1 °C — far too wide a spread for mean daily values in a
tropical coastal city, whose real means are near 31 and 23. **The tell is the spread**; the rainfall on the
same record is sound and was used. Nothing in the file distinguishes the two, so read the numbers before
writing them.

## What C36 found

**Three constitutions in a row never use the word *capital*, and one of them never says *seat of government*
either.** Nauru's names Yaren only in its schedule of constituencies, where the district returns two members
as six of the eight constituencies do; Tuvalu's names Funafuti only among the eight islands and island
communities the country is made of; and Montserrat's Constitution Order of 2010 goes further than either,
naming neither the ruined capital at Plymouth nor the working one at Brades, and substituting the phrase
"absent from Montserrat" nine times where another territory's constitution would locate a seat. **Where the
constitution is silent the Commonwealth Secretariat is the one body that says so outright** — it records
that Nauru has no official capital at all — and for Tuvalu it gives the seat of government as an address in
three parts, Vaiaku, on Fongafale islet, in Funafuti atoll, which is the honest shape of the answer.

**A census can report the capital and never print its name.** The Cook Islands census of 2021 counts
Rarotonga by *tapere* — Avatiu-Ruatonga-Atupa 975, Takuvaine 629, Tutakimoa-Teotue 274 — and the word
*Avarua* appears in the whole report only in the statistics office's own postal address. The UN profile
names the town as the capital and prints 13,100 beside it, footnoting that the figure is the whole of
Rarotonga. **Both facts belong on the card**: the local record is the better one and the UN's is what a
reader will meet elsewhere, and the disagreement is the interesting part.

**The PACCSAP country reports are the replacement climate leg for a Pacific capital the world weather index
does not carry.** *Climate Variability, Extremes and Change in the Western Tropical Pacific* (Australian
Bureau of Meteorology and CSIRO, 2014) has a chapter per country with the wind-wave climate of a named
coast, the seasonal swell directions, a one-in-fifty-year wave height, and the temperature and rainfall
records with their start years — everything the WMO normals would have given and more, on the shore rather
than at the airport. Chapters 2 (Cook Islands), 8 (Nauru) and 15 (Tuvalu) carried three of this batch's six.

**`data.un.org` is DOWN, not retired, and the distinction is the whole of the decision.** Every
`data.un.org/en/iso/<cc>.html` now returns 404; so do `/robots.txt`, `/en/index.html` and a nonsense path,
while `/` returns a 3,769-byte SPA shell and the old `Data.aspx` returns **500** — an application still
deployed and erroring rather than removed. The new bundle carries no `iso` route and no country-profile
route of any kind. Three replacements were tried and none works: **Demographic Yearbook table 8 does not
carry these capitals by name** (Avarua, Yaren and Funafuti are absent from the 2021 file, which lists cities
of 100,000 or more plus reported capitals); **World Urbanization Prospects 2018's capital-cities file is
gone** from the live path, the revision having moved to 2025 and dropped city-level tables; and the
**Wayback Machine was intermittently offline** during the check and has no 200 snapshot for `sh.html`. The
citations were therefore KEPT, as C34's and C35's were, and the migration stays its own task — to be
actioned only if the pages are still down when it is picked up. **Re-derive that before acting on it**: a
claim about a host goes stale silently, which is what `check-reach.js` exists for one directory over.

**AND THE BATCH FOUND A UNITS BUG THAT CORRUPTS PROSE FOR THE IMPERIAL READER ONLY.** `U_NW` lists the
article and the small number words — `a`, `an`, `one` — with **no left word boundary**, so the last letters
of *Afric|a*, *me|an* and *limest|one* were read as the number one and the run swallowed the prose after
them. "1,930 kilometres (1,200 miles) from Africa and 2,900 kilometres (1,800 miles) from South America"
rendered as **"1,200 miles from Afric1,800 miles from South America"**. It reached **48 text nodes across
the shipped corpus** — *Apulia*, *Monaca*, *Patagonia*, *Bandama*, *Guinea*, *maxima*, *minima*, *median*,
*area*, *sea*, *zone*, *limestone* — in World History, Greece, Rome, China, both geography collections and
the glossary. **Nothing caught it because the authored view is the metric one**, which is byte-for-byte
unaffected, and no checker renders a card in the other system. Fixed with one lookbehind on `U_RUN`,
measured before and after over all 2,220 text nodes: **48 restored, 0 shortened, 0 metric-mode differences**.

**The same sweep is the check to run after a units batch, and it is not the one CLAUDE.md names.** The
documented check asks whether an ordinary bracket is eaten; this one asks whether **a content word is LOST
between the two systems** — render every field in both, and report a word that disappears and is not a unit
name, a connector or a number word. That filter is what separates the 48 real faults from the 478 fields
where a range legitimately loses its metric half. Three of this batch's own six were caught by it and by
nothing else: a bare `233` that read as square miles once the pair flipped, a density (`208 to the square
kilometre`) left unconverted beside a converted pair, and a **YEAR standing before "and *n* *unit*"** read
as the first half of a range, which ate "by 2030 and 39 to 87 centimetres" whole. **A comma after the year
breaks the run**; the lookbehind does not fix this one, and it is a shape to write around rather than a bug.

**Four unit faults in EARLIER batches are left standing and are named here rather than fixed.**
`test-units.js` is red on `main` for them and this batch did not touch them: `gw-091` writes
*minus 49°C (minus 56°F)* where the engine needs U+2212 or a digit; `gw-095` and `gw-105` use **`km³`,
which `U_METRIC` does not list** (it has `km²` and `m²`), so their cubic-mile brackets are left behind; and
`gw-517` writes *a few kilometres (2 to 3 miles)*, a conversion of a quantity that is not a figure. The
first and last are content fixes, the middle two want one unit added to the engine.

## What C35 found

**THE BATCH WAS PICKED FROM THE AUDIT, NOT FROM THE RUNNING ORDER, AND THAT IS HOW THE REST OF THIS PASS
SHOULD BE PICKED.** `node .claude/gw-audit.js --list=us|grid|nature|borders|dateline` prints the card ids
under each rule; the union of those five lists IS the backlog. Walking the ids in order instead wastes a
batch slot on every card that already passes — `gw-717` Mariehamn, `gw-718` Marigot and `gw-719` The
Valley are all clean, and `gw-713` and `gw-714` are Macau and Monaco, whose capital cards the plan
deliberately never wrote. **Read the lists first.**

**NOT ONE OF THE SIX IS IN THE WORLD WEATHER INDEX, AND FOR ONE OF THEM THE INDEX NAMES THE COUNTRY AND
MISSES THE CITY.** The flat city list carries a member called **`Curaçao and Sint Maarten`** whose two
entries are Willemstad and **Oranjestad, which is in Aruba** — so Sint Maarten is named in the index and
has no station in it. That is C32's misfiled capital and C33's coarse index in one row. **The replacement
leg is the territory's own met service**, and for Philipsburg that is the Meteorological Department St.
Maarten, whose annual Climatological Summary is a full 1981–2010 normal set.

**AND THAT DEPARTMENT'S TWO PUBLICATIONS DISAGREE ABOUT ITS OWN SEASONS.** The 2018 summary makes January
to June the dry half and July to November the wet; the department's `Climate` page gives a dry season from
December to May and a rainy one from June to November. Neither is wrong about the island — they are two
ways of cutting one bimodal year — but a card that took either alone would be asserting a boundary its own
source does not agree on. **The card prints both and says they differ**, which is the same rule the
WMO-against-national-normals rainfall gap taught in C34.

**A NATIONAL MET SITE CAN BE COMPROMISED AND STILL BE THE RIGHT SOURCE.** `meteosxm.com` carries injected
French casino spam in its footer and in its link graph, and one of its own annual-summary pages 404s. The
department's identity is not in doubt (its address, phone numbers and staff pages are all there) and the
2018 summary PDF is its own document, so the **PDF** is cited and the live pages are used only for what
they plainly publish. **Check what a government site is serving before quoting its HTML**; prefer the
artefact it published to the page that frames it.

**TWO CONSTITUTIONS NAME THEIR CAPITAL OUTRIGHT, WHICH IS NEW.** Nine Westminster deputy clauses across
C31–C34 mention a seat of government without naming it. **Liechtenstein names Vaduz in ARTICLE 1** —
“Vaduz is the capital and the seat of Parliament and the Government” — in the same article that divides
the state into two regions and eleven communes. **And Palau's goes further than naming: it MOVES the
capital.** Article XIII, section 11 puts the provisional capital at Koror and requires the Olbiil Era
Kelulau, within ten years of the constitution taking effect, to designate a place **in Babeldaob** as the
permanent one. Ngerulmud is what that clause produced. **A constitution can be the reason a capital
exists**, and this is the first card in the pass where it is.

**THE DEPUTY CLAUSE MEANWHILE TURNS UP TWICE MORE, AT SECTIONS 39 AND IN AN EXECUTIVE ARTICLE.** The
Virgin Islands Constitution Order 2007 has it at **section 39** and never uses the word *capital* or the
words *Road Town*; the Marshall Islands constitution has it in its executive article and never names
Majuro as the capital either. **But the Marshallese text says something better**: Majuro returns **five of
the Nitijela's thirty-three seats**, more than any other electoral district, which is the capital's weight
stated in the one place the constitution counts.

**A UN PROFILE CAN NAME A DIFFERENT CITY AND THEN FOOTNOTE A THIRD.** Palau's profile prints **Melekeok**
as the capital — not Ngerulmud, which is the place — and footnotes the figure beside that name, 11,400
for 2018, as referring to **Koror**. Three names for one row. This is C34's Garapan finding with a second
displacement on top of it, and the card says so rather than quietly correcting the profile.

**A NATIONAL STATISTICS OFFICE CAN SETTLE A CAPITAL FIGURE THAT NOTHING ELSE CAN.** San Marino's Ufficio
Nazionale di Statistica publishes resident population **per castello, month by month**: the capital had
**4,158** in June 2026 against Serravalle's 11,243 and Borgo Maggiore's 7,019, which makes it the third of
the nine and confirms the UN's 4,500 to within a few hundred. **Look for a monthly bulletin before
concluding a small state publishes nothing about its capital**; the same table carries firms per castello,
which is how the card can say the capital is commercially busier than its size.

**WHERE THE NATURE LEG CAME FROM WHEN NOTHING MODERN WAS OPEN.** Three of the six had no reachable modern
paper. **Vaduz was saved by a scholarly encyclopedia with named authors and a date** — the *Historisches
Lexikon des Fürstentums Liechtenstein*, whose `Vaduz (Gemeinde)` article carries a full
*Naturräumliche Voraussetzungen* section: the Möliholzrüfe and Spaniarüfe torrents, the Altabach and
Mölibach now culverted, the Rhine breaches of 1846, 1855 and 1888, the fountain cooperatives that delayed
a public water supply to 1910. **San Marino was saved by an 1879 traveller's book on archive.org**, J.
Theodore Bent's, which gives the mountain's height, the distance to Rimini, the three towers over the
plain and the spring that names Acquaviva. **And Road Town was saved by a 1966 USGS administrative
report** giving rainfall at the botanic station in the town, on Mount Sage and at the island's ends, and
the fracture porosity of the bedrock.

**THAT 1966 REPORT'S AUTHOR IS THE MAN CROSSREF MISSPELLS.** It is by **Donald G. Jordan** — the same
hydrologist whose name the USGS catalogue renders “D.G. Jordon” on the 1972 open-file report, which is
the `CROSSREF_WRONG` row C32 added. Crossref holds **no authors at all** for this one, so it goes to the
unchecked pile and the row is not needed twice; worth knowing that the two records of one man disagree
in two different ways.

**A CARD MAY NOT LEAVE A FIGURE'S UNIT TO THE PARENTHESIS BEFORE IT.** Two sentences read “about 96 square
kilometres (37 square miles) … of which this side holds 41” and “a lagoon of roughly 1,450 square
kilometres (560 square miles), of which patch reefs make up about 53”. Both are correct in the authored
metric-first form and both BREAK for a reader in imperial mode, where `unitizeText` swaps the pair round
and the bare number is then read as square miles. **A bare follow-on figure must carry its own conversion
or be dropped**; the checker cannot see this, and neither can a reader of the authored text.

**AND `better border control` TRIPS RULE 4.** `BORDERISH` matches `border(s|ed|ing)?`, so a sentence about
immigration policy that also names the Netherlands is reported as a background listing its neighbours. The
finding is a false positive and the fix was still to reword — *tighter control of entry to the country* —
because the alternative is a declared exception on a rule whose whole value is that it has none. **Watch
for `border` in its administrative sense** on any card that also names a state.

## What C34 found

**FOUR OF SIX ARE IN NO WEATHER INDEX AT ALL, AND THE TWO THAT ARE ARE FILED UNDER A COUNTRY THEY ARE
NOT IN.** The world weather index lists 3,597 cities and has nothing for Saint Kitts, the Turks and
Caicos, the Northern Marianas or Pago Pago — it does carry Guam under the metropolitan power, so the
absences are per city rather than per dependency. Nuuk and Tórshavn are both there, both filed under
**Denmark**, and both marked `isCapital: false`. That is C33's finding one step further on: C33's three
were filed under a state they are not part of but at least named themselves in their own records, where
these two simply are Denmark as far as the index is concerned. **The leg that replaces it is the national
met service's own normals**, which for both of these is one report each: DMI Report 21-12 for Greenland
and 21-13 for the Faroes, 1991–2020, station by station, table by table.

**AND THE TWO SOURCES DISAGREE ABOUT THE RAINFALL BY A SIXTH.** The index sums Nuuk's monthly figures to
754 mm against the normals' **874.0 mm**, and Tórshavn's to 1,284 mm against **1,399.2 mm** — and the
index states **no averaging period at all**, so there is nothing to reconcile them against. Both cards
print both figures and say which is which. **A figure with no period on it is not a figure that can be
checked**, which is the same rule the UNdata footnotes keep teaching one column over.

**A UN PROFILE CAN NAME A DIFFERENT CITY AS THE CAPITAL FROM THE ONE THE CARD IS ABOUT.** For the
Northern Marianas the profile's Capital city row reads **Garapan**, not Capitol Hill, at 4,000 people
footnoted to 2010. This is not an error to route around: the card says so, because a reader who looks the
territory up will meet exactly that. **The constitution is no help either** — read end to end it never
uses the word *capital*, never says *seat of government*, and never mentions Capitol Hill; what it does
is divide the islands into senatorial districts, the third being Saipan and everything north of it. The
nearest the statute book comes is a public law of 1998 renaming the administration building at Capitol
Hill, which at least fixes that the building is there.

**AND ONE PROFILE GIVES THE CAPITAL MORE PEOPLE THAN THE TERRITORY.** Pago Pago is credited with 48,500
footnoted to **2018** beside a 2025 projection of 46,000 for the whole of the territory. The two rows are
a census-style count of a wider urban area and a projection of a different base, and the profile itself
never reconciles them. **The card prints both and names the gap**; the alternative — quietly preferring
one — is the card making a demographic judgement it has no source for.

**TWO PROFILES CARRY A CAPITAL FIGURE UNDER A HEADING WITH NO YEAR IN IT.** Every other profile in this
pass heads the row `Capital city pop. (000, 2025)`. The Turks and Caicos and the Northern Marianas head
it `Capital city pop. (000)` — and the footnotes say why: **2001** for Cockburn Town and **2010** for
Garapan. A heading that drops the year where the year is two decades stale is the one shape a reader
cannot catch by eye.

**THE WESTMINSTER DEPUTY CLAUSE, TWICE MORE, AT SECTIONS 23 AND 27.** Saint Christopher and Nevis
(1983) puts it at **section 23** and the Turks and Caicos Islands Constitution Order 2011 at **section
27**, both in the same form: the Governor-General or Governor may appoint a deputy when absent from the
seat of government but not from the country. Neither names the seat. That is now nine of these across
C31–C34 at sections 22, 23, 25, 27 and 36. **And the country's own constitution may not use the
country's own name**: the 1983 text calls it *Saint Christopher and Nevis* throughout, which is not the
string the facts grid carries — so the card could name the country after all, in the constitution's
words.

**THE DANISH CONSTITUTION NAMES NO CAPITAL AND REACHES BOTH REALMS ONLY THROUGH SEATS.** The 1953 Act
never says Copenhagen and never uses *capital*. It touches Greenland and the Faroes at **section 28**,
reserving two Folketing members to each, and at **section 31**, allowing a statute to settle Greenland's
representation. So one document serves two cards, and what it says about each is the same sentence.

**WHERE THE FIFTH LEG CAME FROM WHEN THE USUAL ONES FAILED.** Three cards had no reachable modern paper
for their landform, and three different answers worked. For Basseterre it was **two out-of-copyright
works on archive.org** — a US Weather Bureau monograph of 1902 whose chapter 7 gives the town's
coordinates, the island's igneous soil, Mount Misery at 4,100 ft and a hurricane chronology, and an 1857
letter in the *Annals and Magazine of Natural History* describing the beach by the town, the *terras*
cliff half a mile south and the windward reef 50 yards offshore. For Cockburn Town it was a **2026
ZooKeys reptile checklist** whose Study Area is a complete physical geography of the archipelago, plus
the national museum's own geology and Guinep House pages. For Capitol Hill it was a **USGS groundwater
report** whose physiography and climate sections describe the uplands the settlement stands in.
**Search the taxonomy journals for a Study Area before concluding a small territory has no open
literature**; a reptile checklist carried this batch's hardest card.

**AND A PDF THAT EXTRACTED ZERO BYTES ON THE FIRST PASS EXTRACTED 283 KB ON THE SECOND.** The Saipan
report has no `/ToUnicode` map at all, which the earlier extractor treated as a reason to stop; the
fonts use standard encodings, so the literal strings come out readable with no CMap. **A PDF with no
ToUnicode is usually the easy case, not the hard one** — check before writing a source off.

**THE PAGE NUMBER YOU GUESS IS THE ONE THAT IS WRONG.** The 1902 monograph's OCR carries its page
numbers inline and broken (`£S0.000` for what is almost certainly £80,000), so the card cites
**chapter 7** rather than a page range, and the £80,000 total was dropped for the £3,000 Brimstone Hill
figure the OCR renders cleanly. **An OCR digit that could be a letter is not a figure**; either find a
clean one in the same passage or drop the claim.

**AND THE READ-BACK CAUGHT FIVE THINGS THE CHECKERS CANNOT SEE.** An unsourced link between Pago Pago
and the electoral district it sits in — the legislature's own page lists districts and members and
never says which one holds the town, so the sentence became a count of the two houses instead. A causal
order reversed, saying permanent settlement on Grand Turk was allowed *because* the plots were divided
when the museum says the representative came first. A bank named "the western" before the card had said
which was west. "On the lagoon shore" attached to Garapan on no source at all. And the £80,000 above.
**Every one of them would have rendered perfectly.**

## What C33 found

**THE INDEX IS COARSER THAN THE RECORDS IT INDEXES, AND SEARCHING IT ALONE REPORTS A PRESENT COUNTRY
AS ABSENT.** The flat city list gives one country column, and for three of this batch it prints
`United Kingdom of Great Britain and Northern Ireland`: searched there, Bermuda, Guernsey and the Isle
of Man all come back with nothing. Open the records themselves and each names its own member —
`UK - Bermuda`, `UK - Guernsey`, `UK - Isle of Man` — and each is presented by the territory's own
body: the Isle of Man Government, the Meteorological Observatory at Guernsey Airport, the Bermuda
Weather Service. **The earlier batches searched the list and reported absences; this one shows that a
list absence is not a record absence.** Andorra and the Cayman Islands really are missing, and were
checked both ways.

**AND THE NAME MATCH THAT LOOKED WRONG WAS RIGHT, WHICH IS THE SAME LESSON REVERSED.** `Hamilton`
under the United Kingdom reads exactly like Hamilton in South Lanarkshire, and C31 and C32 had both
just been bitten by capitals filed under other countries' names. It was nearly discarded on that
suspicion. **The coordinates settled it**: 32.29 N, 64.78 W, presented by the Bermuda Weather Service.
A name match is not evidence of identity in either direction — it is a reason to read the coordinates.

**TWO OFFICIAL COUNTS OF ONE CITY, TWELVE TIMES APART.** The UN profile gives Hamilton 10,100 people,
footnoted to 2018; Bermuda's own 2016 census counts **854** in the City of Hamilton. The UN figure is
plainly a wider urban area and the census a municipality, but nothing on either page says so, and the
card states both rather than choosing. It is the widest disagreement on a capital figure the pass has
met.

**A COUNTRY WHOSE UN PROFILE DOES NOT EXIST.** `data.un.org/en/iso/gg.html` returns **500**, on three
attempts spaced apart — a reproducible absence rather than an outage. Guernsey is therefore the first
capital in the pass whose card rests on no UN profile at all; the figures come from the States of
Guernsey's own statisticians instead, which is the better source anyway (19,679 in the parish in March
2023, against the UN's silence).

**THE WESTMINSTER DEPUTY CLAUSE WITH AN ISLAND WHERE THE SEAT SHOULD BE.** C31 and C32 found the
seat-of-government clause three times at section 22 and once at 25. The Cayman Islands Constitution
Order 2009 carries the same shape at **section 36** and replaces the seat with a landmass: the deputy
acts whenever the Governor is absent *from Grand Cayman but not from the Cayman Islands*. The words
`capital` and `seat of government` appear nowhere in it. **A fifth variety, and the first that locates
the office geographically rather than institutionally.**

**AND AT THE OTHER END, A CONSTITUTION THAT NAMES ITS CAPITAL IN ITS SECOND ARTICLE.** Andorra's says
*Andorra la Vella is the capital of the State*, among the official language, the anthem, the flag and
the arms — Lesotho's shape (C25), one article earlier. Its first article had already named the town as
one of the seven Parishes, and the document was signed at **Casa de la Vall**, a house in the capital,
on 28 April 1993. Dominica's is the opposite extreme: `Roseau`, `capital` and `seat of government` all
return zero, and **being a republic it has not even the deputy clause** by which its Westminster
neighbours reach a seat obliquely.

**A COUNTRY WITH ONE STATION IN THE INDEX, AND IT IS NOT THE CAPITAL.** Dominica's single entry is
**Melville Hall Airport**, on the opposite coast from Roseau, and it carries no rain-day count in any
of its twelve months. A country present in the index is not a capital present in it.

**WHAT THE READ-BACK CAUGHT, and the one that matters is an overclaim.** `gw-702` said the ground
around Roseau carries the densest settlement on the island; the paper says the areas around Roseau
*and Portsmouth* have the highest population density, so the card now says *among the most densely
settled*. A superlative for two places had been given to one. Beside it: a causal claim that
sea-surface temperature is what keeps Bermuda subtropical, where the source credits the pressure
gradient, the Gulf Stream and the Sargasso Sea; an unsourced *the surveyors named* for the Douglas
Syncline; and a claim that the principality's own rivers are gauged in the Pyrenean database, where
the abstract says only that the database spans France, Spain and Andorra.

**AND A CITATION FAULT THAT WAS MINE, NOT CROSSREF'S.** `check-citations.js` reported a surname
mismatch on the Data in Brief dataset: I had written the ninth author as `Beguîría` where
Crossref, and the paper, have **Beguería** — a mistyped escape, one character out, and all but
invisible as an error on the page.
Crossref was right and the citation was wrong, so it was fixed rather than declared. **The two-tier
report earns its keep in both directions.**

## What C32 found

**FOUR OF THE SIX COUNTRIES KEEP NO STATION AT ALL IN THE WORLD WEATHER INDEX, and that is a
measurement rather than an impression.** The index holds 3,597 cities. Searched on both the country
and the city column, the Federated States of Micronesia, Tonga, Saint Vincent and the Grenadines and
the Virgin Islands return nothing whatever — no Pohnpei, no Chuuk, no Yap, no Kosrae, no Tongatapu,
no Kingstown, no Saint Thomas. Only two of this batch's capitals are in it, and one of those is filed
under a country it is not in. The pass has met absent countries before, one or two at a time; a batch
in which two thirds of them are missing says something about which parts of the world the index
covers, and it is worth stating on the card rather than passing over in silence. Pohnpei is among the
wettest places on earth and publishes nothing there.

**A CAPITAL FILED UNDER TWO OTHER COUNTRIES' NAMES, NEITHER OF THEM ITS OWN.** C31 met a two-country
country field — `Curaçao and Sint Maarten` — on Willemstad, which is at least in one of the two.
Oranjestad is in neither. CityId 1829 is headed `Curaçao and Sint Maarten`, and its coordinates,
12.5 N and 70.0 W, are Aruba's. **THE COORDINATES ARE WHAT SETTLE IT, AND THEY HAD TO BE READ**: there
is a second Oranjestad, on Sint Eustatius at 17°29' N, and a name match alone cannot tell the two
apart. The record also carries `isCapital: false` for a capital city, repeats C31's misspelt
presenting body (`Meteteorological Department Curacao`), and gives no normals period at all while
carrying a full twelve months of figures — three faults in one record.

**A CONSTITUTION THAT PROVIDES FOR A CAPITAL AND DECLINES TO NAME ONE.** The Micronesian constitution
never says Palikir. What it does instead is new to the taxonomy: among the powers Article IX, section
2 expressly delegates to Congress, between acquiring new territory and regulating natural resources,
is **the power to govern the area set aside as the national capital**. The document establishes the
office of a capital district and leaves the choosing to be done afterwards — which is what happened,
the seat moving from Kolonia to a purpose-built site at Palikir. The geology report drilled the wells
for that site and calls it *the new FSM capitol site*, which dates it without any need to reach for a
secondary source.

**AND ONE THAT NAMES NO CAPITAL, NO SEAT AND NO MEETING PLACE — not one of the three words.** The
Staatsregeling van Aruba is not in the Constitute index, so it was read in the Aruban government's own
Centraal Wettenregister text (AB 1987 no. GT 1) on archive.org. `Oranjestad`, `hoofdstad`, `zetel` and
`vergaderplaats` all return zero. The pass has met total silence before (the Bahamas, Vanuatu, Samoa,
Lesotho, Estonia), but always in English-language Westminster texts where the word `capital` at least
appears in some other sense. Here the whole family of words is absent.

**THE WESTMINSTER SEAT-OF-GOVERNMENT CLAUSE AT SECTION 22 FOR THE THIRD TIME, AND THE SAME CLAUSE AT
25.** Saint Vincent and the Grenadines carries the clause at **section 22**, word for word and at the
same number as Saint Lucia and Grenada in C31 — three constitutions, one section number. Its single
use of the word `capital` is **capital raised**, C29's Saint Lucia and C31's Brunei a third time.
Antigua and Barbuda carries the same clause at **section 25** instead, and does not use the word
`capital` anywhere at all, not even of punishment: a Westminster constitution in which the word simply
does not occur.

**THE CATALOGUE RECORD AND THE REPORT DISAGREE ABOUT THE AUTHOR'S NAME, AND THE REPORT WINS.** The
USGS Publications Warehouse files Open-File Report 72-201 under `Jordon, D.G.`, and Crossref relays
that deposit, so `check-citations.js` reported a surname mismatch. The report's own title page prints
**by D. G. Jordan and O. J. Cosner**, and its own Selected References list a 1963 paper by
*Ward, P. E., and Jordan, D.G.* — two places inside the document, both Jordan. Declared in
`CROSSREF_WRONG` with that reasoning. **The rule holds: read the article's own byline, not the
catalogue's index of it.**

**A SOURCE CAN BE INTERNALLY INCONSISTENT, AND A CARD MUST NOT REPRINT THE INCONSISTENCY.** The Pohnpei
rainfall report states that the island's gauges differ *by as much as 150 inches*, and states on the
same page that the lowest annual total is about 120 inches and the highest about 300. Those are 180
inches apart, not 150. A first draft of `gw-691` put the spread and the two extremes in one sentence,
which invites the reader to do the subtraction and find it wrong. **The two measured extremes are the
defensible figures and the derived spread is not**, so the clause went and the extremes stayed. Nothing
in the pipeline can see this; only reading the card back can.

**WHAT THE READ-BACK CAUGHT THIS TIME, and two of the six were claims no checker could have seen.**
Nuku'alofa's tilt was written as carrying the land down towards the capital's coast — true, and sourced
only to a report whose PDF extraction is a substitution cipher, so the clause went and the paper's own
73 per cent population figure took its place. A clause saying salinization is worst *at the villages
nearest the shore* came from a search summary rather than from the paper, which says the risk depends
on a well's distance from the centre of the well field and from the lagoon; rewritten to that. Saint
John's was placed *at the western end of the central plain*, which the FAO source does not say, so the
card now gives the coordinates the weather record carries instead. And `gw-692` said the island became
a country of the Kingdom *in 1986* on the strength of a page that gives no date at all.

## What C31 found

**A WEATHER RECORD CAN EXIST AND CONTAIN NOTHING AT ALL.** C25 met a blank MONTH, C29 a blank FIELD,
C30 the same field twice in two spellings of missing. Castries is the whole TABLE: the index files it
under Saint Lucia, flags it `isCapital` true, lists twelve months — and every cell in every one of
them is empty. No maximum, no minimum, no rainfall, no rain days, and no window. **The row's
existence is the only information in it**, and a card that quoted "the record" without opening it
would have had nothing to quote and no way to know.

**AND A PROFILE CAN NAME A DIFFERENT PLACE AS THE CAPITAL THAN THE DECK ASKS FOR.** The UN gives
Kiribati's capital as **Bairiki** — an islet of South Tarawa — where `gw-688`'s answer is Tarawa, and
it heads that column **with no year at all** (every other profile in the pass reads "Capital city pop.
(000, 2025)") while footnoting the figure to 2015. **Read the column heading as well as the
footnote**: this is the one profile in the pass whose heading is missing the year it is claiming.

**TWO CAPITALS ARE FILED IN THE WEATHER INDEX UNDER SOMETHING OTHER THAN THEIR OWN NAME, AND ONE OF
THEM UNDER A NAME IT HAS NOT USED SINCE 1998.** Hagåtña's record is **`Agana, Guam`**, inside the
entry for the sovereign state rather than the territory, `isCapital` false — a former spelling under
somebody else's country field. Willemstad's is **`Curacao`**, the island, `isCapital` false, under a
country field reading **`Curaçao and Sint Maarten`**: two countries in one field. C30's Tahiti was the
first of this shape and this batch has two more.

**AND THE PRESENTING BODY CAN MISSPELL ITS OWN NAME.** Willemstad's record is served by the
*Meteteorological Department Curacao*. It is a small thing and it is worth recording, because it is
the kind of fault that says how closely these records are read: nobody has looked at that field since
it was typed.

**A COORDINATE PRECISION CAN BE A TELL TOO.** Agana's is given as 13.4627 north and 144.7439 east —
four decimal places, where the rest of the batch (Castries 14.00 / −61.01, Curacao 12.12 / −68.88,
Victoria −4.62 / 55.43) gives two. **A record that came from a different pipeline looks different in
the fields nobody reads.**

**THREE COUNTRIES ARE ABSENT FROM THE INDEX ALTOGETHER** — Kiribati, Grenada and, for the second
batch running, a country whose capital has no row anywhere. That takes the pass's absent list to
Equatorial Guinea, Kosovo, Timor-Leste, Barbados, São Tomé and Príncipe, Kiribati and Grenada.
**Kiribati has a national meteorological service of its own all the same**, at Betio on Tarawa,
publishing tide calendars and a watch on extreme spring tides — which is the fourth leg that
absence leaves room for.

**THE WESTMINSTER SEAT-OF-GOVERNMENT CLAUSE APPEARS TWICE IN ONE BATCH, WORD FOR WORD AND AT THE SAME
SECTION NUMBER.** Saint Lucia's 1978 text and Grenada's 1973 text (reinstated 1991, revised 1992) both
put it at **section 22** and both read *"Whenever the Governor-General — has occasion to be absent
from the seat of government but not from [the country]"*, differing only in the country's name and in
whether *Government* takes a capital G. With Jamaica (C24), Trinidad and Tobago (C26) and Belize
(C29) that is five instances, and the pair here settles what the earlier ones suggested: **this is one
drafting template, not a coincidence of phrasing.** Neither text names its capital; Saint Lucia's uses
the word once, of *capital raised* in the country, and Grenada's not at all.

**A CONSTITUTION CAN NAME ITS COUNTRY'S ISLANDS AND NOT ITS CAPITAL.** Kiribati's 1979 text as revised
through 2018 has *capital* 0 and *Bairiki* 0, and names Tarawa exactly once — in **Schedule 2, the
territory of the state**, which lists every island in it *"together with all small islands, islets,
rocks and reefs depending on them"*. Seychelles' 1993 text as revised through 2025 never names
Victoria and uses *capital* only of the death penalty and of company shares; what it names **ten
times** is Mahé, always in the electoral articles — at least nineteen electoral areas there, two on
Praslin, the Inner Islands together one. **Both locate the state by its geography and neither by its
seat.**

**AND THE METROPOLE'S TEXT CAN NAME A CAPITAL THAT IS NOT ITS SEAT OF GOVERNMENT.** Constitute holds
no text for Curaçao, so Willemstad's fifth leg is the Dutch constitution of 1814 as revised in 2008 —
which names **Amsterdam** as *the capital city*, where the King is sworn in (article 32), contains
**The Hague nowhere at all**, and does not mention Curaçao. C30 found France's text naming neither its
own capital nor Papeete; this one names a capital and omits the city its government actually sits in.

**THREE DEFINED UN FOOTNOTES, AND ONE OF THEM DEFINES ALMOST NOTHING.** Curaçao's capital figure is
*"Total population of Curaçao excluding some neighborhoods (see source)"* — the whole island minus an
unnamed set, with a pointer instead of a list. Grenada's says its figure *"Refers to Saint George
Parish"*. Kiribati's is an AREA footnote: the 726 square kilometres are *"Land area only. Excluding 84
square km of uninhabited islands."* **Guam's is the one that matters most and it is a bare 2018**: the
capital-city figure is **146.9 thousand against 169 thousand for the whole territory**, seven eighths
of it, with nothing said about what is being counted. **The emptier the footnote, the larger the
figure it is hiding.**

**AND TWO SMALL NUMBERS CAN COINCIDE AND MEAN NOTHING.** Grenada's UN profile gives 345 square
kilometres and 345 people to the square kilometre. It is arithmetic rather than a finding — the
population happens to be near 117 thousand — and it is recorded here because a card that prints both
figures without saying so reads like a copying error. **Say it, or drop one of the two.**

**A PUBLISHER CAN DEPOSIT A THIRD DOI FOR AN OLD ARTICLE AND MISDATE IT, AND THE JOURNAL'S OWN
CITATION LINE IS WHAT SETTLES IT.** `check-citations.js` reported `10.4000/vertigo.10594` as a year
mismatch: Crossref carries **published-print 2011** with the record created 2011-04-02, where
VertigO's own *Référence électronique* line reads *"10-3 | Décembre 2010, mis en ligne le 20 décembre
2010"*. That is the third OpenEdition journal to do this and the third row in `CROSSREF_YEAR_WRONG`
(after two from Brussels Studies), added with the journal's own line quoted beside it. **The
article's metadata header said 2011-01-19 and agreed with Crossref; only the printed citation line
disagreed, and only it is the publisher's own statement of the issue.**

**AND A DOI THAT 403s IS A WORK YOU HAVE NOT READ.** `10.1051/epjconf/202023708010` (EPJ Web of
Conferences, on Guam's sinkholes) answers 403 at `doi.org` and 403 at the publisher's own PDF path;
unlike MDPI there is no `res.` mirror to read it at. It was drafted into `gw-686` on the strength of
its Crossref title and **taken out again before the batch was applied**: the rule is to open every
work before citing it, and a title is not an opening. A Frontiers survey of Tumon Bay — readable in
full — took its place, and brought Typhoon Mawar with it.

**HOSTS MET IN THIS BATCH.** `journals.lww.com` serves a Cloudflare challenge and is unusable, which
cost the Conservation and Society paper on North Tarawa; `www.sciencedirect.com` is 403 as always,
but **DOAJ's own record carried the Curaçao paper's full structured abstract** — Study region, Study
focus, New hydrological insights — which is enough to cite from and is the route to remember for a
gold-OA Elsevier title. `barbadosweather.org`'s shape reappeared as `grenadamet.com`, which does not
resolve at all; the Grenadian statistics office at `stats.gov.gd` answers plain HTML and carries the
2021 preliminary census. **PLOS answered 503 once and 200 on a retry three seconds later**, which is
the one sweep result in this batch that was not a fact about the host.

## What C30 found

**A TERRITORY HAS NO CONSTITUTION OF ITS OWN, SO THE FIFTH LEG IS THE METROPOLE'S.** Constitute has
no record for New Caledonia or French Polynesia, and the text that governs both is France's 1958
constitution as revised in 2024 — which **never names Paris**, uses the word *capital* once and only
of *capital punishment*, and does not contain *Papeete* anywhere. What it does carry is **Title XIII,
the transitional provisions pertaining to New Caledonia**, whose article 76 sends that population to
vote on *the agreement signed at Nouméa on 5 May 1998*. **So the one occurrence of the city's name in
the constitution governing it is a signing venue.**

**AND BARBADOS'S IS THE SAME SHAPE IN A DIFFERENT OCEAN.** Its 1966 text as revised through 2026
never uses the word *capital* and names *Bridgetown* exactly once — in the interpretation clause of
the Caribbean Court of Justice chapter, as the place where the Agreement establishing that Court *was
signed* on 14 February 2002. **Two constitutions in one batch of six name their capital once and in
both it is where a document was signed**, which is a shape worth expecting now rather than reading as
a coincidence.

**FOUR OF THE FIVE CONSTITUTIONS NEVER APPLY THE WORD TO A PLACE AT ALL.** Vanuatu's 1980 text as
revised through 2023 comes back empty on every term worth asking: *capital* 0, *Vila* 0, *Port Vila*
0, *Efate* 0, *seat of government* 0. Samoa's 1962 text as revised through 2025 is the same: *Apia* 0
and *capital* 0, and what it locates instead is the country, *the islands of Upolu, Savaii, Manono and
Apolima … between the 13th and 15th degrees of south latitude*. With Barbados and France that makes
four, and **Vanuatu, Samoa and Barbados are the fourth, fifth and sixth texts in the pass containing
no occurrence of the word at all**, after Lesotho (C25), Estonia (C26) and the Bahamas (C29). Only
São Tomé and Príncipe's names one — article 5, in the same breath as declaring the state unitary,
with article 4 defining the territory as the islands, their named islets and a territorial sea
*within a circle of twelve miles*.

**A CAPITAL CAN BE FILED IN THE WEATHER INDEX UNDER ITS ISLAND'S NAME AND FLAGGED AS NOT A CAPITAL.**
French Polynesia has eight rows and Papeete is not among them: the record is **`Tahiti`**, `isCapital`
false. C25's Lesotho, C28's Solomon Islands and Malta and C29's Cabo Verde were countries present
without their capital; this is the same fault wearing the island's name instead of a suburb's or an
airport's, and it is the shape hardest to notice, because the row looks right.

**AND C29'S MISSING FIELD HAPPENS TWICE MORE, IN TWO DIFFERENT SPELLINGS OF MISSING.** Tahiti's record
carries `raindays: null` in all twelve months; Apia's carries the **empty string** in all twelve. Both
render as a complete table of temperature and rainfall with one column simply gone, and a reader who
does not know the shape of a normals table cannot see it. Tahiti's also states **no observation period
at all**, which is C29's Bandar Seri Begawan again one batch later.

**TWO MORE COUNTRIES ARE ABSENT FROM THE INDEX ALTOGETHER** — Barbados and São Tomé and Príncipe —
joining Equatorial Guinea, Kosovo and Timor-Leste. **And the richest entry in this batch belongs to a
territory rather than a state**: New Caledonia has **fifteen** rows against Vanuatu's six, French
Polynesia's eight, Samoa's one and the two zeroes — and its record is presented by *Météo-France
Regional Service New Caledonia, Wallis and Futuna*, with Tahiti's under a plain *Meteo-France*. **The
metropolitan service is the presenting body for both French cards.**

**A UN CAPITAL-CITY FOOTNOTE CAN NAME SEVEN COMMUNES.** French Polynesia's footnote `f` says the capital-city figure *refers to the total population in the communes
of Arue, Faaa, Mahina, Papara, Papeete, Pirae and Punaauia* — so the 136 thousand is seven communes
together, of which the capital is one. **Its AREA footnote is defined the same way and is the rarer
kind**: 3,687 square kilometres *including water bodies of lake Vaihiria, lake Temae and the Maiao
lagoons, but not lake Maeva and the lagoons of Raiatea and Tahaa*. Every other profile in the batch
footnotes its capital figure to a bare **2018**.

**AND A TERRITORY'S PROFILE SAYS WHAT IT IS NOT PART OF.** New Caledonia's and French Polynesia's both
carry *For statistical purposes, the data for France do not include this area*, and **neither has a UN
membership date row**, there being none to have. That absence is itself a fact about the place and the
card says so rather than leaving the gap to be read as a missing figure.

**A REGISTERED DOI CAN 404 AT `doi.org`, AND ONLY THE URL SWEEP CATCHES IT.** The Atoll Research
Bulletin paper on Papeete Harbor, `10.5479/si.00775630.484.`, has a full Crossref record — title,
authors, volume, year — and resolves to nothing; the Smithsonian repository path it points at is gone
too. **A citation built on it would have passed `add-card.js`** (it ends in a URL) **and
`check-citations.js`** (Crossref knows the work) **and failed only the curl.** Papeete's fourth leg is
a 2025 metabarcoding survey of the same port instead.

**AND A PAPER'S ABSTRACT CAN NAME THE PAPER YOU NEED.** São Tomé defeated every keyword search —
Crossref returned IMF country reports and CABI compendium stubs, DOAJ returned linguistics and public
health, OpenAlex rate-limited — until a 2025 Geosciences article on Príncipe's geological heritage
said its sites were assessed *using the same qualitative methodology previously applied to the
geological heritage of São Tomé Island*. **An AUTHOR search on that article's second author** returned
the 2015 Sustainability paper that carries the island's height, area, axes, submarine platform and
volcano-stratigraphic units. **Read the sibling article's own sentences before widening the keywords.**

**HOSTS MET IN THIS BATCH.** `iwaponline.com` serves a Cloudflare JavaScript challenge and is
unusable; `conbio.onlinelibrary.wiley.com` is 403; `gov.st` answers 400. What carried it: **MDPI via
`res.mdpi.com/d_attachment/…`** (four of the six papers — the DOIs 403 from here, as the 219 already
shipped record), **Copernicus**, **Nature**, the Indonesian and Portuguese **OJS** installations, and
two institutional sites that answer plain HTML — `meteo.nc` and `ine.st`. **`barbadosweather.org`
answers 200 and is a JavaScript shell with no citable page**, which is the C0 Factbook shape again.

## What C29 found

**A WMO RECORD CAN BE MISSING A WHOLE FIELD, NOT A MONTH.** C25's Bissau had a December with every
cell empty and C27's Georgetown had one impossible value in an otherwise sound table; Cabo Verde's
only record, filed under **Sal**, gives twelve average maxima and **not one average minimum** — the
`minTemp` cell is null in all twelve months. The table is not broken and does not look broken: it
renders as a complete year of highs, rainfall and rain days, and only a reader who knows what a
normals table is supposed to carry notices that half the temperature is gone. **Ask what a record
does NOT have before quoting what it does**, which is the mirror of C25's finding one field over.

**A FOURTH COUNTRY IS IN THE WEATHER INDEX WITHOUT ITS CAPITAL.** Lesotho (C25, Mejametalana),
Solomon Islands (C28, Auki) and Malta (C28, Luqa) were the first three; Cabo Verde's one row is
**Sal**, an island the capital is not on, flagged `isCapital` false. Every country in this batch is
in the index — none of the outright absences C25 and C26 met — so the shape here is the softer one:
present, and not where the reader wants it. **The index is not a list of capitals and must never be
read as one.**

**AND ONE RECORD STATES NO PERIOD AT ALL.** Bandar Seri Begawan's carries `datab` and `datae` both
empty — no start year, no end year — where Malé's says 1981–2000 (twenty years), Belmopan City's
1980–2003 (twenty-four) and Sal's and Reykjavik's 1961–1990, with **Nassau's 1971–2000 a full
thirty**. **A card that quotes an unwindowed record can say what the figures are and not what they
are of**, which is why `gw-675` says so in its prose and puts no weather row on its date line: there
is no window to put there.

**A CONSTITUTION CAN NAME AN ISLAND AS THE CAPITAL.** The Maldives' 2008 text, article 14, under the
heading *National capital*, reads *The capital of the Maldives is the island of Male'* — not a city,
an island — and the same text makes that island an administrative division in its own right,
counting *the twenty administrative Atolls plus Male', for a total of twenty one*, with Villingili
and Hulhumalé folded into its schedule entry. **Cape Verde's 1992 text is the same shape one step
softer**: article 9 gives *the city of Praia, on the island of Santiago* — the city AND its island —
and seats the Supreme Court and every overseas electoral district there as well. Both sit in the run
of articles on national symbols, which is C25's Guinea-Bissau finding met twice more in one batch.

**TWO MORE TOTAL SILENCES, AND THEY ARE NOT THE SAME SILENCE.** Brunei Darussalam's 1959 text (rev.
2006) never names Bandar Seri Begawan and uses the word *capital* **exactly once**, in the definition
of *debt* as an obligation to repay *capital sums*. The Bahamas' 1973 text never names Nassau and
**does not contain the word *capital* at all** — the emptier of the two, and the third such text in
the pass after Lesotho (C25) and Estonia (C26). Belize's 1981 text (rev. 2022) is a third variety:
*Belmopan* appears nowhere, *capital* only in *capital cases* and *issued share capital*, and the
state is located instead by the **Westminster seat-of-government clause** — its third instance
after Jamaica (C24) and Trinidad and Tobago (C26).

**AND ICELAND LOCATES BOTH PRESIDENT AND GOVERNMENT BY RESIDENCE, WITHOUT EVER USING THE WORD.**
The 1944 text as amended through 2013 says the President *shall reside in or near Reykjavik* (art.
12), that *the seat of Government is in Reykjavik* (art. 13) and that the Althing *shall normally
convene in Reykjavik* (art. 37); the only occurrence of *capital* in the whole text is *capital
punishment*. **The 2011 DRAFT is more explicit than the text in force** — the Althing *shall normally
assemble in Reykjavik, but may decide to assemble elsewhere*, and *the Government Offices of Iceland
shall be located in Reykjavik* — and Constitute's own record dates it: delivered to the Althing on 29
July 2011, approved by a non-binding referendum on 20 October 2012, failed to pass in 2013. C24 met
two Gambian drafts that never came into force; what is new here is a draft that says MORE about the
capital than the constitution that governs — **so a record marked `in_force: false` is worth reading
for what it adds, not only avoiding for what it cannot support.**

**SIX BARE-YEAR FOOTNOTES IN A ROW, AFTER TWO BATCHES OF DEFINED ONES.** All six UN profiles footnote
their capital-city figure `c` and define `c` as **2018** and nothing else — no scope, no statement of
what territory is counted. C26 found two profiles that define what they count and C27 and C28 found
three more; this batch found none, which is the ordinary case returning. **The footnote is worth
reading every time precisely because it is usually empty.**

**AND THE DENSEST AND NEARLY THE EMPTIEST STATE IN THE DECK ARE IN ONE BATCH.** The Maldives is
1,765.6 people to the square kilometre on 300 square kilometres; Iceland is **four** to the square
kilometre on 103,000. Both capitals hold about the same share of their country — a third and a half —
so the share says nothing about either, and the density says everything.

**THE FOURTH LEG WAS THE SLOWEST PART OF THIS BATCH AND ALL SIX WERE FOUND IN OPEN JOURNALS.**
`iwaponline.com` serves a Cloudflare JavaScript challenge and is unusable from here, and
ScienceDirect is 403 as before, so the Brunei River water-quality paper and the Elsevier *Data in
Brief* rainforest dataset both had to be given up — the latter is readable at its **Europe PMC**
copy, which is the route that keeps paying. What carried the batch instead: **Copernicus** (Ocean
Science, for North Malé atoll), **Frontiers** (Frontiers in Water, for New Providence's five
wellfields), **PLOS** (PLOS ONE, for Hellisheidi's hydrogen sulphide), **RCAAP** (Finisterra, for
Praia's Plateau and trade winds — a Portuguese journal whose article carries its own page range in
its running head, `XLIX, 98, 2014, pp. 33-48`, where Crossref holds only an online date of 2015), the
Indonesian **OJS** at `ijeas.untan.ac.id` (for Kampong Ayer's mangroves), and **Docomomo Journal** at
`docomomojournal.com` (for Belmopan's garden-city plan, CC BY 4.0). **Two of those six were found
through DOAJ and neither through Crossref**, whose keyword search returned only encyclopedia stubs
for both Belmopan and New Providence. **Search DOAJ before concluding a small capital has no
literature.**

**AND A DOCOMOMO DOI RESOLVES TO A DIFFERENT ARTICLE ID THAN ITS LANDING PAGE CARRIES.**
`10.52200/43.A.SMV82DGU` redirects to `/article/view/87`, not to the `/view/43` the issue number
suggests, and the PDF galley is `/article/download/87/406` — a number that appears nowhere on the
article page's own text, only in one `href`. **Follow the DOI and read the page's links; do not
compose an OJS galley URL.**

## What C28 found

**A CONSTITUTION CAN NAME ITS CAPITAL EIGHTEEN TIMES AND NEVER ONCE CALL IT THE CAPITAL.** The
Solomon Islands' 1978 text uses *Honiara* eighteen times — always as *Honiara City*, *the Honiara
City Council* or *the government of Honiara City*, in clauses about taxation and local administration
— and contains the word *capital* nowhere and the phrase *seat of* nowhere. Latvia (C25) named its
city once without calling it a capital; this is the same shape at eighteen times the frequency, and
it is the strongest case yet for the rule this leg keeps producing: **count the occurrences of the
CITY's name and of the word CAPITAL separately, because they answer different questions.**

**A DEFINED FOOTNOTE CAN NAME A UNIT THE CAPITAL IS NOT IN.** Malta's capital-city figure of 212.8
thousand is footnoted *Refers to the localities of the Northern Harbour and Southern Harbour* —
neither of which is Valletta, whose own population is a small fraction of that. Djibouti's *cercle*
and Paramaribo's *District of Paramaribo* are units CONTAINING the city; Podgorica's *urban
population of Podgorica municipality* is the town carved OUT of a unit; Malta's is neither. **Four
defined footnotes now name four different kinds of thing**, which is the running order's own
conclusion (see the correction to the C26 entry) reached a fourth time.

**⚠ AND THAT CORRECTION IS THIS BATCH'S REAL FINDING.** C26 recorded Manama and Port of Spain as
“the first two capital-city figures in the whole pass” to define what they count. They were the first
two THIS REWRITE had met; `docs/world-geography-card-plan.md` had recorded three others when the
cards were first generated, and had drawn the better conclusion. **The running order is the deck's
memory of what it has already seen, and a superlative measured only over the current pass is a claim
about the current pass.** Both entries are corrected in place. **Grep the plan for a card's own notes
before claiming a first about it.**

**THREE MORE TOTAL SILENCES, AND THE STRONGEST CAPITAL CLAUSE THE PASS HAS MET, IN ONE BATCH.**
Suriname's 1987 text and Malta's 1964 text name no capital in any sense; Bhutan's 2008 text mentions
Thimphu exactly once, in a GLOSSARY entry defining monastic bodies in dzongs *other than Punakha and
Thimphu*. Against them, Luxembourg's Article 109: *The City of Luxembourg is the capital of the Grand
Duchy and the seat of Government. The seat of the Government may only be transferred temporarily for
grave reasons* — the only clause the pass has met that forbids a permanent move, and it sits in the
general provisions at the END of the text rather than among the emblems at the front.

**AND MONTENEGRO NAMES TWO CAPITALS IN ONE SENTENCE**: *The capital of Montenegro shall be Podgorica,
The Old Royal Capital of Montenegro shall be Cetinje.* Eswatini (C27) had two capitals recorded in a
UN FOOTNOTE while its constitution named neither; here the constitution itself does it, one working
and one historic. **Two capitals is now a recurring outcome and arrives by at least two different
routes.**

**A NORMAL CAN BE TWENTY-THREE YEARS LONG AND CARRY TWO DECIMAL PLACES.** Thimphu's record states
1996–2018 and gives every figure — temperatures, rainfall, rain DAYS — to two decimals, including
0.35 of a rain day in November. Beside Nicosia's ten-year window (C26) that is a second departure from
the thirty-year convention in three batches, and the decimals mark it as a derived series rather than
a station's own book. **State the window; it is a fact about the figures.**

**A CAPITAL'S COUNTRY CAN BE IN THE WMO INDEX WITHOUT THE CAPITAL BEING IN IT — TWICE IN ONE BATCH.**
The Solomon Islands' only row is Auki, on a different island, and Malta's is *Luqa, Malta*, the
airport with the country's name run into the city field. Maseru (C25) was the first of this shape and
Manama (C26) the first of the run-together name; both now have a second instance. **The index is
searched on the COUNTRY column, never on the city's name.**

**A SMALL COUNTRY'S WATER CAN HAVE A SINGLE POINT OF FAILURE, AND A PAPER WILL SAY SO.** The lake on
the Upper Sûre is 0.15 per cent of Luxembourg's surface and its treatment plant can supply 89 per
cent of the country's people; a tractor accident on a road at Witry, in another country, put herbicide
into a creek that reaches it twenty kilometres downstream. **Where one reservoir serves a whole state,
the incident report is the card's best sentence** — it is the geography and the vulnerability in one.

**AND A USGS REPORT IS A USABLE LEG WHERE NOTHING MODERN EXISTS.** Paramaribo's aquifer has no recent
open literature reachable from here; the 1990 Water-Resources Investigations Report gives the whole
history — one well field in 1958 growing to six, pumping from 1,643 to 40,230 cubic metres a day, 227
million cubic metres drawn in thirty years, and chloride moving inland towards the wells. **Its DOI
is not in Crossref; cite the pubs.usgs.gov URL, which resolves.**

## What C27 found

**A WMO TABLE CAN BE COMPLETE, WINDOWED, SOUND IN ELEVEN MONTHS AND IMPOSSIBLE IN THE TWELFTH.**
Georgetown's 1961–1990 record gives May a mean maximum of **39.4 °C** where every other month of the
year lies between 28.7 and 30.8 — a transposition of 29.4 that parses perfectly and renders
perfectly. This is C18's Bishkek finding at a different scale: there the whole table was wrong and
the card took its weather elsewhere; here one cell is wrong and the rest is usable, so the card
**quotes the sound figures, names the bad one, and says it is a figure to distrust rather than
quote**. **Read a station's twelve maxima against one another before quoting any of them**; a single
outlier is the shape this fault takes when the table is otherwise fine.

**A UN FOOTNOTE CAN HANG OFF THE CAPITAL'S NAME RATHER THAN OFF ITS POPULATION.** Eswatini's profile
marks the capital-city row itself: *Mbabane is the administrative capital and Lobamba is the
legislative capital.* Every earlier batch read the footnote letters on the FIGURE; this one is on the
NAME, and it is the only place in the recipe that will tell you a country has two capitals.
**Read both letters on that row.**

**AND A THIRD PROFILE THAT SAYS WHAT ITS CAPITAL FIGURE COUNTS**, one batch after the first two of
this rewrite: Djibouti's 568.8 thousand *refers to the population of the “cercle”*. Manama, Port of
Spain and now Djibouti — three in two batches, against roughly 150 cards that carried a bare year.
**What that means is settled in the running order rather than here**: a defined footnote names three
different things across the three cards that carry one, so quoting the definition is what lets a
reader see which, and the presence of a footnote is not itself the finding (see the C26 entry's
correction).

**A COUNTRY PROFILE CAN MEASURE ITS POPULATION AND ITS AREA OVER DIFFERENT TERRITORIES.** Mauritius's
population and density are footnoted *Including Agalega, Rodrigues and Saint Brandon* while the
surface area is footnoted *Excluding the islands of Saint Brandon and Agalega*. A density computed
from the two numbers on that page is therefore not the density either footnote describes. This is
C26's Cyprus finding in a sharper form — there the scopes differed between rows, here they differ
between the two halves of a single ratio.

**A CONSTITUTION CAN IDENTIFY A CAPITAL WITHOUT NAMING A PLACE.** Eswatini's 2005 text names neither
Mbabane nor Lobamba and says instead that *the official residence of the Ndlovukazi is the
legislative and ceremonial capital of the nation and the arena of the Incwala and Umhlanga* — the
capital defined by whose house it is, and so moving with the person. Nothing in the pass's earlier
taxonomy covers that.

**AND ONE CAN PROVIDE FOR ITS OWN INSTITUTIONS TO SIT ELSEWHERE.** Comoros's Article 10 names Moroni,
leaves its status to a law, and then adds that an organic law determines the islands where the
Union's institutions sit *if circumstances thus require* — a capital clause written by a federation
of islands that expects to have to move.

**THE THIRD TOTAL SILENCE IN THREE BATCHES, and two more that use the word only of money or of the
gallows.** Mauritius's 1968 text does not contain *capital* anywhere in any sense (after Lesotho in
C25 and Estonia in C26); Fiji's 2013 text uses it only of capital expenditure in the budget article
and Timor-Leste's only of the death penalty. **A constitution that does not locate its own state is
now the commonest single outcome of this leg.**

**A CITY POPULATION IN A PAPER AND ONE IN THE UN TABLE NEED NOT AGREE, AND BOTH CAN BE RIGHT.** The
RISE study describes Suva as a city of 93,000; the UN gives 178.3 thousand for the capital. The card
gives both and says the second counts a wider area — which is what the Manama and Port of Spain
footnotes spell out and most profiles do not.

**AND A NATIONAL SERVICE'S ISLAND-WIDE FIGURE IS NOT ITS CAPITAL'S.** Port Louis's own 1971–2000
total is 711 mm against the Mauritius Meteorological Services' island mean of 2,010 mm for exactly
the same period — the capital takes about a third of what the island averages. **Where the national
service publishes a country-wide normal, quote it against the station rather than instead of it**;
the contrast is the fact.

**KEEP ONE INSTITUTION UNDER THREE OF A CARD'S SOURCES.** `check-cards.js` notes a card resting
mostly on one body, and the obvious Port Louis build — the WMO row plus two pages of the same
meteorological service — would have tripped it. One page of the service, plus the WMO row, plus
UNdata, Constitute and the index, keeps it at two. **This is a real constraint on the recipe when a
small state's national service is the only body publishing about it.**

## What C26 found

**A UN CAPITAL FIGURE CAN SAY WHAT IT COUNTS, AND TWO DID IN ONE BATCH AFTER ABOUT A HUNDRED AND FIFTY
CARDS OF SILENCE.** Bahrain's row is footnoted “Refers to the urban area of the municipality of
Al-Manamah” and Trinidad and Tobago's “Data refers to the urban agglomeration” — the first two
capital-city figures THIS REWRITE had met that carry a DEFINITION as well as a date. Every earlier
batch recorded the opposite finding (a year and nothing else), which was true of what it had met and
was never a rule. **Read the footnote letters on the capital row before writing the sentence**: the
finding is per country, not per table.
**⚠ AND “THE FIRST IN THE WHOLE PASS” WAS THE WRONG SCOPE, corrected on reaching C28.** The deck's
ORIGINAL generation notes, in `docs/world-geography-card-plan.md`, had already recorded three defined
footnotes — Djibouti's *cercle*, Paramaribo's *District of Paramaribo* and Podgorica's *urban
population of Podgorica municipality* — and drew the sharper conclusion this rewrite had not: the
three define three DIFFERENT things, two of them whole administrative units bigger than the city and
one the town carved out of the unit, **so a defined footnote is not a comparable figure**. **Read the
running order's own notes on a card before claiming a first**; the plan is the deck's memory of what
it has already seen, and a superlative measured only over this pass is a claim about this pass.

**AND ONE PROFILE CAN MEASURE ITS COUNTRY THREE WAYS AT ONCE.** Cyprus's footnotes carry “Refers to
the whole country”, “Excluding northern Cyprus” and “Data refer to government controlled areas”, each
attached to different rows of the same page. A card that quotes one figure from such a profile without
saying so is quoting a scope it has not checked.

**TWO MORE COUNTRIES ABSENT FROM THE WMO INDEX, in the batch after the first one was met.** Neither
Kosovo nor Timor-Leste has a row in the list of 3,598 cities, so Pristina and Dili have no
international weather record of any kind — which with Equatorial Guinea in C25 makes three in two
batches. **This is now an ordinary outcome rather than a curiosity, and the recipe has an answer for
it**: Kosovo's own hydrometeorological institute publishes monthly means for three stations, the
capital among them, for 2001 to 2019, and the card rests on that and on an open air-quality paper
instead.

**A URL WITH PARENTHESES IS CITABLE ONCE THEY ARE PERCENT-ENCODED, AND THAT IS WHAT MADE THE PRISTINA
CARD POSSIBLE.** The Kosovo institute's own PDF is served at a path ending `_(1).pdf`, which
`SRC_URL_RX` truncates at the first bracket; `%281%29` resolves, matches the pattern whole, and
returns the same 1.4 MB file. **Encode, do not reject** — the rule CLAUDE.md records for Commons pages
applies to any official document whose filename carries a bracket.

**THE WMO INDEX NAMES TWO OF THIS BATCH'S CITIES IN SHAPES A PLAIN LOOKUP MISSES.** Manama's row is
filed as a single country/city string and Port of Spain's carries its island in brackets, as does
Scarborough beside it. Neither is findable by searching the city's name alone against the second
field. **Search the index on the COUNTRY column and read the rows**, which is also how Lesotho's
airfield was found in C25.

**A CLIMATOLOGICAL NORMAL CAN BE TEN YEARS LONG.** Nicosia's record states 2002 to 2011, against the
thirty-year windows the rest of this batch carries (1961–1990 twice, 1971–2000 once). The card says
so rather than presenting it as a normal like any other.

**AND THE NATIONAL AGENCY CAN BE A GENERATION AHEAD OF THE WMO RECORD IT FEEDS.** Estonia's WMO table
is 1971 to 2000; the Estonian Environment Agency publishes 1991 to 2020 for the same city. **The two
are not comparable term for term** — the WMO gives mean maxima and minima, the agency gives mean
temperature — so the card gives each on its own terms and compares only the one quantity both state,
the annual precipitation (693 mm against 700 mm). **A newer table is not a correction of an older one
unless it measures the same thing.**

**FOUR MORE CONSTITUTIONAL SHAPES, and one of them repeats across the Caribbean.** Trinidad and
Tobago's 1976 text, like Jamaica's in C24, names no capital and legislates instead about “the seat of
government”, unnamed, in a clause about an officer being absent from it — **the same Westminster
clause in two constitutions**, which is worth expecting in the others of that family. Cyprus names its
city three times and never as a capital (twice as where the 1960 draft was signed, once among the five
towns getting separate municipalities). Kosovo names it and hands its status to law. Estonia's text
does not contain the word capital at all, in any sense — the second such after Lesotho in C25 — and
Bahrain's and Timor-Leste's use it only of money and of the death penalty.

## What C25 found

**A WEATHER RECORD CAN HAVE AN ENTIRELY BLANK MONTH, and that is the sixteenth shape this leg has
failed in.** Bissau's record carries eleven months and a December that is null in every field at once
— no maximum, no minimum, no rainfall, no rain days — and the previous fifteen shapes were all
about the PERIOD or the STATION rather than about a hole in the table itself. Every annual figure a
card gives from such a record is therefore a figure for eleven months, and the card has to say so:
1,756 millimetres is what the months that carry a figure add to, not the year.
**AND THE REASON IS PUBLISHED, WHICH IS WHAT MAKES IT WRITEABLE RATHER THAN A SHRUG.** An open paper
on the country's own weather data says the country keeps long-term records at three places only
— the capital, Bafatá and Bolama — and that all three are incomplete after documents were lost in
the civil war of 1998 and 1999 and the stations went untended for lack of money. **A gap explained
is a fact about the place; a gap merely noted is a complaint about the source.** Look for the
national meteorology paper before writing the gap up.

**A COUNTRY CAN BE MISSING FROM THE WMO INDEX ALTOGETHER.** Equatorial Guinea has no row in the list
of 3,598 cities, so Malabo has no record of any kind — the first time this pass has met a whole
member absent rather than a capital absent. It is a different finding from Maseru's, in the same
batch, where the country has **thirteen** rows and not one of them the capital: there the nearest
record is filed under **Mejametalana**, at 29.31° S and 27.50° E, and is flagged `isCapital: false`.
**A country well covered is no guarantee its capital is covered, and a capital uncovered is not the
same as a country uncovered.** Both are writeable; they are written differently.

**THE CONSTITUTE INDEX IS KEYED ON `country_id`, NOT ON THE COUNTRY'S PRINTED NAME, AND THAT COST
THIS BATCH A FALSE FINDING.** Guinea-Bissau was recorded mid-research as having no constitution in
the index at all — the sovereign-state counterpart of C23's territory with no entry — and it was
wrong: the record is `Guinea_Bissau_1996`, with an **underscore** where the country's name has a
hyphen, and a search on the printed spelling returns nothing. **Search the cached index on a
substring, never on the exact name**, and re-check a "no record" conclusion before writing a card
around it.

**AND WHAT THAT RECORD SAYS IS A CONSTITUTIONAL SHAPE THE PASS HAD NOT MET: THE CAPITAL AS A
NATIONAL SYMBOL.** Article 23 names the city, and it stands at the END of the sequence describing
the flag, the coat of arms and the anthem — so the text files where the state sits among the
emblems rather than among its administrative arrangements. North Macedonia's Article 6 is the same
placement, between the symbols article and the language article, and Slovenia's Article 10 is the
opposite, between the guarantee of local self-government and the language. **Where a constitution
names the capital is worth a clause; it is the cheapest sentence in the whole recipe and the one
most often thrown away.**

**LATVIA BINDS THE PARLIAMENT TO THE CITY WITHOUT EVER CALLING IT THE CAPITAL.** Article 15 reads
that the Saeima shall hold its sittings in Riga and may convene elsewhere only in extraordinary
circumstances, and the word capital appears nowhere in the text — though the Constitute topic tag
above the article says **National capital**, which is the site's own classification and not the
document's words. **Read the article, never the tag**: this is the third time in three batches the
tag has promised something the text does not say.

**TWO MORE TOTAL SILENCES, taking the run to five in three batches.** Lesotho's 1993 constitution as
amended through 2025 does not name the city, does not use the word capital in any sense at all —
not even the financial one — and does not locate the seat of government either; Equatorial Guinea's
1991 text as amended through 2012 uses the word only of money, three times, all of it about foreign,
public and private investment. **A text silent about its own capital is now the ordinary case rather
than the odd one**, and the card says so in a sentence instead of leaving a gap.

**THREE MORE CAPITAL FIGURES DATED 2018 RATHER THAN 2019** — Maseru, Ljubljana and Malabo, against
2019 for Bissau, Riga and Skopje — which confirms C24's finding that the year in the capital-city
row is a fact about that country's own last usable count and not a rule of the table. **Read the
footnote letter; do not assume the year from a neighbour.**

**AND A PDF EXTRACTOR THAT RETURNS FONT NAMES IS NOT BROKEN, IT IS READING HEX STRINGS.** Three of
this batch's papers came back as `WindowsWindowsMacintosh` and megabytes of noise from the
scratchpad's own extractor, which reads only `(…) Tj` literal strings; the text was in `<hex>`
form behind a ToUnicode CMap. A variant that also decodes hex strings and applies the merged CMap
reads all of them. **A binary-looking extraction is a format finding, not a paywall** — check the
shape of the output before concluding the PDF is unreadable.

## What C24 found

- **THE CONSTITUTE INDEX HOLDS TEXTS THAT NEVER CAME INTO FORCE, NOT ONLY TEXTS THAT HAVE CEASED TO.**
  C21 found two records marked `in_force: false` because a later text had replaced them. The Gambia has
  **three** records — the 1996 constitution as revised in 2018, which is in force, and **drafts of 2019 and
  2020 which are not**, each flagged as a draft text provided in collaboration with International IDEA.
  **Choosing by recency would cite a document that has never had any legal effect at all**, and the card
  would read perfectly. Gabon's 1991 (rev. 2011) is the other kind, recorded as no longer in force; the
  card dates the text and says so. **Read `in_force` on every record the query returns, not just on the
  one you take.**

- **THREE OF THIS BATCH'S SIX CONSTITUTIONS SAY NOTHING WHATEVER.** Botswana's 1966 (rev. 2021) contains
  neither `Gaborone` nor `capital` nor any clause about a seat of government. The Gambia's contains
  neither `Banjul` nor `capital` except of the death penalty. Jamaica's 1962 (rev. 2023) contains neither
  `Kingston` nor `capital` of a place, **but does legislate about "the seat of Government" and leaves it
  unnamed** — in a clause about the Governor-General being absent from that seat without being absent from
  the country, which is the Namibia shape (C23) with the place-name removed as well. Three silences in one
  batch of six is the highest proportion this pass has met, and all three are Commonwealth texts.

- **AND GABON'S IS THE STRONGEST FENCE YET.** The capital *"cannot be transferred to another location
  without a law resulting from a referendum"* — where the Central African Republic (C21) required a law
  passed when the superior interest of the Nation requires it, and Qatar (C23) merely a law. **The escape
  hatch has three grades**: a law, a law under a stated condition, and a referendum.

- **THE WMO INDEX FILES COUNTRIES UNDER NAMES A PLAIN LOOKUP MISSES, WHICH IS A FOURTEENTH WAY THE LEG
  FAILS.** `Gambia (The)` puts the definite article in brackets after the name; `Republic of Moldova` uses
  the long official form. A search for `Gambia` or `Moldova` returns zero rows and reads exactly like a
  country with no stations — which is what a card would then say. **Fuzzy-match the country name against
  the index's own key list before recording an absence**; this batch's first pass reported both countries
  as absent and both have four to seven stations.

- **AND A FIFTEENTH: A COUNTRY WELL COVERED WHOSE CAPITAL IS THE ONE PLACE MISSING.** Lesotho has
  **thirteen** rows in the index and **not one of them is Maseru**; the two nearest are Mejametalana, the
  airfield in the city, and Moshoeshoe I, the international airport outside it. C18's Nicaragua had one
  station and it was not the capital; this is the same fault with twelve more stations to hide it in.
  **Albania has no rows at all**, which is why `gw-646` has no weather leg and says so.

- **THE UNDATA CAPITAL FIGURE IS NOT ALWAYS DATED 2019.** Every batch since C11 has recorded that the
  capital-population figure carries a footnote dating it to 2019 under a column headed 2025, and it has
  held for something over sixty cards. **Gaborone's and Maseru's are dated 2018.** The pattern is a
  pattern and not a rule; read the letter and follow it. Banjul's names two local government areas, the
  city's own and Kanifing; Moldova's national population figure carries a territorial scope note saying
  it includes the Transnistria region, the second such note in this pass after Georgia's.

- **A STATION FIELD CAN CARRY A DIFFERENT TRANSLITERATION OF THE SAME CITY.** C22's Montevideo names
  Salto, a different place entirely; Chișinău's (id 208) names **Kisinev**, which is the same city under
  another romanisation and is not the spelling the index's own city field uses. The milder case is worth
  recording because it is the one that will pass a read-back: nothing is wrong, and the card can say what
  the record says.

- **WHERE THE SCHOLARLY LITERATURE IS THIN, THE CITY'S OWN DISEASE IS THE GEOGRAPHY.** C21's Bangui rested
  on a hepatitis E study; Libreville rests on a 2026 malaria paper whose opening pages describe it as a
  humid coastal city with a dense hydrographic network and a fine-grained mosaic of watercourses, shrub
  cover and remnant forest, and give its density as about 5,000 inhabitants per square kilometre against
  roughly 9 nationally, holding close to half the national population. **The geography is in the Study
  Site section because the disease is a geographical fact**; search the health literature by city name
  before concluding a capital has none.

- **HOSTS MEASURED THIS BATCH.** `tirana.al`, `instat.gov.al`, `geo.edu.al` and `scindeks-clanci.ceon.rs`
  all answer 200; `doi.org/10.5937/...` resolves to the SCIndeks record, which carries the abstract and
  the reference list but not the full text, and that is enough for a citation and not enough for a claim
  about the body of the paper. `iwaponline.com` is 403 and `iopscience.iop.org` serves a Radware captcha,
  both confirmed from C23. MDPI DOIs still 403 with the papers readable at `res.mdpi.com`.

- **AND THE CHECK THAT EARNED ITS KEEP THIS BATCH WAS CROSSREF, BEFORE THE CARD WAS WRITTEN.** The
  Kingston flood paper was drafted into the batch as "Sara Bonetti et al." — a name from nowhere; Crossref
  gives **Andrea Rivosecchi and Minerva Singh**. The URL resolved, the journal, volume, issue, year and
  page were all right, and the citation would have passed every check in the pipeline except the one that
  reads the byline. **Run the DOI through Crossref while drafting, not after applying**; this is the
  fabricated-author failure `docs/citation-plan.md` records, met live.

- **THE READ-BACK CAUGHT SIX, AND TWO OF THEM ARE A CLASS WORTH NAMING: A CLAIM ABOUT FOLIO'S OWN CORPUS
  DRESSED AS A FACT ABOUT THE PLACE.** "the 2019 every other capital in this batch carries" and "one of
  only a handful of capitals in this deck in that position" are both true and both meaningless to a
  reader, who does not know what a batch or a deck is and cannot check either. **A background states facts
  about its subject; the pass's own bookkeeping belongs here.** The other four were the usual unmeasured
  comparatives — "monsoonal to a degree few capitals match", "fences it harder than most" — an arithmetic
  overstatement (490.0 over 6.6 is seventy-four times, not seventy-five), and a claim that no month is dry
  on a card whose driest month gets 18 millimetres.

## What C23 found

- **A TERRITORY LOSES TWO LEGS OF THE FIVE AT ONCE, AND BOTH ABSENCES ARE STRUCTURAL RATHER THAN
  ACCIDENTAL.** Puerto Rico has **no row anywhere in the WMO city index** — that index is organised by
  MEMBER, and a territory served through another member's service is not listed under its own name — and
  **no entry on the Constitute Project**, which carries the constitutions of sovereign states. Neither gap
  is a data fault to be worked around; they are what the two sources are FOR. So `gw-635` runs on three
  papers plus UNdata plus the city list, and takes its weather leg out of the scientific literature: a
  dengue-climatology paper's Study Area gives the island's latitudes, the humid subtropical climate, the
  ~1,800 mm of rain, the easterly trade winds and a **daily rainfall and air-temperature record reaching
  back to 1899**. **Expect this shape again on every remaining territory in the deck**, and plan five
  legs that do not include a constitution.

- **AND THE US RULE BINDS HARDEST EXACTLY WHERE IT IS MOST TEMPTING TO BREAK IT.** San Juan's UNdata page
  carries a footnote on the territory's own population line reading *"For statistical purposes, the data
  for United States of America do not include this area"* — genuinely interesting, and unusable: rule 1
  forbids the phrase, and paraphrasing it would be writing the card about the relationship the rule
  exists to remove. **It is left out**, and the capital-population footnote (the Metropolitan Statistical
  Area) is reported instead. The rule is a rule about what the card is ABOUT, not a word filter to be
  routed around.

- **A CONSTITUTION CAN SPELL ITS CAPITAL DIFFERENTLY FROM THE WORLD, WHICH IS A TWELFTH SHAPE.** Qatar's
  article 2 reads *"The Capital of the State is Al-Douha. It may be replaced by any other location by
  law."* — and the string **Doha does not occur in the document at all**. A grep for the card's answer
  term would have reported this constitution as silent about its capital, which is the opposite of the
  truth. **Search for the capital AND for `\bcapital\b`, and read the hits**; C22's Eritrea really is
  silent and this one is not, and only reading both tells them apart.

- **NAMIBIA IS THE CLEANEST INSTANCE YET OF C19'S WARNING ABOUT THE TOPIC TAG.** Constitute's bold
  *National capital* heading sits above a clause that reads *"Windhoek shall be the seat of central
  Government"* and never uses the word capital of the place at all. The clause follows directly on the
  sentence defining the territory — the enclave, harbour and port of Walvis Bay, the offshore islands,
  and a southern boundary running down the middle of the Orange River. **The tag is Constitute's; the
  words are the constitution's; quote the words.**

- **AND TWO SHAPES THAT ARE NEW IN THE OTHER DIRECTION.** **Lithuania gives a REASON**: article 17 makes
  the capital *"the city of Vilnius, the long-standing historical capital of Lithuania"*, the only text in
  twenty-three batches to justify its choice in the clause that makes it. **Armenia names the city three
  times over**: once in the article on the capital, once to leave the peculiarities of regional
  administration there to ordinary law, and once to say flatly that *"Yerevan is a community"*, with its
  local self-government settled the same way. Bosnia and Herzegovina's sits in article I, between the
  free-movement clause and the symbols clause, and a later article has each chamber convene there within
  30 days of being chosen.

- **THE WMO RECORD FAILS TWO MORE WAYS, TAKING THE TALLY TO THIRTEEN.** **TWELFTH: A RECORD ROUNDED TO
  WHOLE UNITS.** Yerevan's (id 66) gives every high, every low and every monthly rainfall as an integer —
  33, 1, 17, −8, 44, 8 — and states no period. That is a fact about the record's precision and the card
  says so; it also means the imperial conversions are written to whole degrees, because writing 91.4 °F
  from a source that says 33 °C would invent precision the record does not have. **THIRTEENTH: THREE
  SPANS IN ONE RECORD.** Doha's (id 221) gives temperature and rainfall over 1962–1992 and **rain days
  over 1962–1990**, two years shorter. C18's Lomé had two fields a year apart and C21's San José two a
  century apart; this is three fields and two spans in one table. **Read every window field, every time.**

- **THE UNDATA FOOTNOTE GAINS ITS FIRST EXCLUSION.** Every scope note in this pass so far has widened the
  figure — a metropolitan area, a governorate, a department and its neighbours, a settlement. Qatar's
  reads *"Does not include the populations from the industrial area and zone 58"*, which NARROWS it, and
  narrows it in a way worth noticing on a card about a Gulf capital. Sarajevo's names five municipalities
  (Stari Grad, Centar, Novo Sarajevo, Novi Grad and Ilidža); San Juan's is the Metropolitan Statistical
  Area; Yerevan's, Windhoek's and Vilnius's carry no scope note at all. All six are dated **2019 in a
  column headed 2025**.

- **A NATIONAL UTILITY'S WEEKLY BULLETIN IS THE BEST WATER LEG THIS PASS HAS FOUND.** NamWater publishes a
  Surface Water System Weekly Dam Bulletin as a PDF, and the issue of **8 July 2024** shows the three dams
  carrying the bulk of Windhoek's supply holding 24.417 of 154.513 million cubic metres between them —
  **15.8 per cent, with the Omatako printed as `empty`** — while the two small dams filed under the city's
  own name stood together at 69.3 per cent and the Goreangab read **100.3 per cent** of its capacity. Every
  figure in that paragraph was re-derived from the table's own columns and checked: the sub-totals are the
  sums, and the percentages are the quotients. **The host is intermittent** (one fetch died on a connection
  reset and the retry served the file), so retry before recording it as shut.

- **A CITY'S OWN MUNICIPALITY CAN CARRY THE WHOLE LANDFORM LEG.** `yerevan.am/en/our-city/` states the
  position (the north-eastern part of the Ararat valley, both banks of the Hrazdan, 900–1,200 m above sea
  level), the area (233 km²), the twelve districts by name, the continental climate, and the city's
  standing as a legal entity with its own property, budget and seal. That is four of the five things a
  background needs, from one page, in the city's own words. **Check the municipality before searching for
  a paper.**

- **HOSTS MEASURED THIS BATCH.** `yerevan.am`, `armstat.am`, `e-gov.am`, `nsa.org.na`, `namwater.com.na`,
  `estuario.org`, `drna.pr.gov`, `jp.pr.gov` and `agrocienciauruguay.uy` all answer 200.
  **`iopscience.iop.org` serves a Radware Bot Manager captcha**, which is a new wall shape for this pass
  and cost Windhoek an open population-growth paper. IWA Publishing (`iwaponline.com`) is 403, so the
  Windhoek water-reuse literature — the obvious leg for the city that pioneered direct potable reuse —
  could not be read. `estuario.org` and `inumet.gub.uy` answer 200 and serve their content through
  JavaScript, the pattern first recorded for the East Asian museum sites. MDPI DOIs still 403 while the
  papers read at `res.mdpi.com`; six of this batch's works are MDPI or Frontiers and all were verified
  against Crossref.

- **THE READ-BACK CAUGHT SEVEN, AND TWO ARE NEW SHAPES.** The first is **a true conversion that reads as
  a mistake**: Sarajevo's city station is at 630 m, which is **2,067 feet**, and the mountain station it is
  paired with is at **2,067 metres**. Both figures were right and the sentence looked like a typing error,
  so the conversion is written 2,070 ft — within the source figure's own precision and free of the
  collision. **A conversion that collides with another number in the same sentence is worth rounding
  differently.** The second is **an unsourced comparison reached for to pad a short card**: Yerevan came in
  at 258 words and the first fix added "less than a third of what falls on London", a figure from nowhere;
  the honest expansion was the municipality's own description of the city as a legal entity, and the
  rainfall total summed from the record's own twelve months. **A card under the floor is a card that needs
  more RESEARCH, not more sentences.** The other five are this pass's usual: two unsourced compass
  directions and a distance on the Windhoek dams, an unmeasured "one of the few" about Lithuania's
  constitution, a hedge dropped from the San Juan salvinia story, "dredging" for the paper's mechanical
  control, and an opener promising what its sentence did not deliver.

## What C22 found

- **THE WMO LEG FAILS THREE MORE WAYS, AND ALL THREE ARE IN THIS BATCH.** C21 took the tally to eight;
  these take it to eleven, and every one of them is invisible from the monthly table itself.
  · **NINTH: A COMPLETE RECORD WITH NO PERIOD AT ALL.** Zagreb's entry (id 70) gives twelve months of
    highs, lows, rainfall and rain days and states no window — `datab`/`datae`, `tempb`/`tempe`,
    `rdayb`/`rdaye` and `rainfallb`/`rainfalle` are all empty. What it does carry is
    `climateFromMemDate`, **which is the date the member service SENT the figures in and not the span
    they cover** (15 June 2001 here). Asmara and Montevideo are the same shape. A card that reads that
    field as a window is stating a period the record does not claim.
  · **TENTH: HALF A RECORD.** Tbilisi's entry (id 209) states a window — 1961 to 1990 — and carries
    rainfall and rain days and **no temperature whatever**, every `maxTemp` and `minTemp` null. It is the
    mirror of C20's Beirut, which had rainfall alone on a short window; here the window is long and
    ordinary and the temperature is simply not there.
  · **ELEVENTH, AND THE DANGEROUS ONE: THE STATION FIELD CAN NAME A DIFFERENT CITY.** Montevideo's entry
    (id 293) is filed under the city, at the city's own coordinates (34.88° S, 56.17° W), and its
    `stationName` reads **Salto** — a city on the other side of the country, which has no row of its own
    in the index. **C21's Wellington card named its station off that field** ("the airport station's
    normals"), which is right there and was right by luck. **Read `stationName` against `cityName` and
    the coordinates before putting it in a sentence**, and where they disagree say what the record says
    rather than adjudicating between them: `gw-634` reports the mismatch and does not decide it.

- **THE CONSTITUTIONAL TALLY GAINS A SHAPE NO OTHER CONSTITUTION ON THE SHELF HAS: ONE THAT DEFINES WHAT
  A CAPITAL IS BEFORE NAMING ONE.** Mongolia's article 13 reads *"A capital of the State shall be the city
  in which the supreme organs of State permanently exist. The capital of Mongolia is the City of
  Ulaanbaatar."* Every other text in twenty-two batches either names its capital, legislates about "the
  capital" without naming it, or says nothing; this one writes the definition first. **Croatia's is the
  other new one**: article 13 names the city and then hands its arrangements to ordinary legislation —
  status, jurisdiction and organisation — and a later article lets that law give the capital the standing
  of a county. Georgia's sits **among the state symbols**, the commonest shape of all, in one sentence
  between the naming of the state and the naming of the official language.

- **AND TWO MORE THAT NEVER NAME THE CITY, BOTH OF THEM BY NOW THE MAJORITY SHAPE.** Panama's 1972 text
  (rev. 2004) legislates about "the capital city" — the Assembly convenes there for eight months a year
  in two four-month sessions, and university teaching in the regional centres is given equal standing
  with teaching in the capital city — and reaches the name only through an electoral clause singling out
  one district. **Eritrea's 1997 constitution does not contain the word `capital` at all**, and does not
  contain the city's name either: its article 4, *National Symbols and Languages*, settles the flag, the
  anthem and the languages and stops — which is the article a capital most often sits in. **Uruguay's
  names the place twice and never as the capital**, once requiring candidates for Justice of the Peace in
  the department to be lawyers and once setting aside a share of national taxes collected outside that
  department for decentralisation.

- **THE UNDATA CAPITAL LINE GAINS A NEW SCOPE WORD: SETTLEMENT.** Zagreb's footnote reads "Refers to the
  settlement of Zagreb" — **narrower** than the administrative city, where every earlier qualified
  footnote in this pass has been wider (a metropolitan area, a governorate, a department plus named
  localities). Panama City's is the metropolitan area; Montevideo's is the department plus two localities
  in Canelones and San José; Tbilisi's, Asmara's and Ulaanbaatar's carry no scope note at all. All six
  are dated **2019 in a column headed 2025**, as every batch since C11. **Georgia's page footnotes the
  NATIONAL population figure to say it includes Abkhazia and South Ossetia** — the first time in this
  pass that a country's own total carries a territorial scope note, and it is reported as the footnote's
  words rather than adjudicated.

- **A CITY'S OWN AUTHORITY CAN BE THE WATER LEG, AND THE PANAMA CANAL AUTHORITY IS THE BEST ONE YET.**
  `pancanal.com` answers 200 and states on its Canal Watershed page that the watershed is the principal
  source of the water a transit needs **and** supplies 95 per cent of the drinking water of Panama City,
  Colón, San Miguelito and, in the near future, Chorrera. Its August 2026 advisory then dates what that
  means: reduced precipitation in the watershed, Neopanamax slots cut to nine from 3 September and
  Panamax slots to twenty-five and then twenty-three. **One institution supplied both the landform leg and
  a dated event**, which is what the recipe's fourth leg is for and what it rarely manages.

- **AND A TIDE TABLE IS NOT A SOURCE YOU CAN PARSE.** The same authority publishes per-terminal tide
  tables as PDFs, and the Pacific/Atlantic contrast would have been the best fact on the card. The
  extraction runs the columns together — `11414.644520812.4378` is a time, a height in feet and a height
  in centimetres with no separator — and **the obvious disambiguator is not enough**: a four-digit time
  followed by a one-or-two-digit foot value is ambiguous, so the parser read 14.6 ft / 445 cm as
  "1141" + "4.6" + "445" and reported a Limón range of 30 feet. A feet-to-centimetres consistency test
  passed on those mis-splits often enough to look like a clean run. **The claim was dropped rather than
  published**; do not try to derive figures from these tables.

- **SEARCH THE DISCIPLINE, AGAIN, AND THIS TIME IT IS MINING GEOLOGY.** Asmara has no landform literature
  of its own, and the leg came from a 2026 PLOS ONE paper mapping volcanogenic massive sulphide
  mineralization: the Asmara Mineralized Belt runs NNE–SSW for over 35 km and **"approximately 15 km of
  the belt is covered by basalt flows, urban infrastructure, and the city of Asmara itself"** — one
  sentence that puts the city on its own ore body. Tbilisi's came from an urban-forest ecosystem-services
  paper whose study area is the municipality's 502 km²; Ulaanbaatar's from a water-quality paper that
  gives the altitude, the aquifer, the bank filtration, the river's dimensions and the basement geology
  in one Study Area section.

- **HOSTS MEASURED THIS BATCH.** `pancanal.com` 200 and useful; `inumet.gub.uy` **answers 200 and serves
  its climate pages through JavaScript** (the Características climáticas page yields 3.4 KB of navigation
  and no content), the East Asian national-museum pattern met again one continent over;
  `agrocienciauruguay.uy` 200; `scielo.edu.uy` does not answer at all. Wiley (including the former
  Hindawi journals), Taylor & Francis and `downloads.hindawi.com` are 403, so the one open-looking
  Tbilisi seismology paper could not be read and was not cited. **MDPI DOIs still 403 while the papers
  read at `res.mdpi.com`** — five of this batch's works are MDPI and all five were verified against
  Crossref rather than trusted to resolve.

- **THE READ-BACK CAUGHT SIX, AND FOUR OF THEM ARE NEW SHAPES.** An **unsourced attribution of a name**:
  the Mtkvari's second name was written as "the river the Russian and Azerbaijani names call the Kura",
  where the source says only "Mtkvari (Kura)". A **"such as" list read as a complete one**: the Asmara
  belt's prospects. A **claim about the country attached to the city**: the Sahara and Arabian dust is
  the paper's statement about Eritrea, not about Asmara. An **unmeasured comparative**: "the constitution
  does something few others do". **74 per cent written as "almost all".** And an ordinary factual slip
  that only the table could catch — Montevideo's driest month is **June** at 83.1 mm, not December at
  84.4. **Every one of the six rendered perfectly.**

- **THE MINUS SIGN IS U+2212 AND THE CORPUS ALREADY SAYS SO.** Three negative temperatures were written
  with an EN DASH, which is what the house style uses for a range, and the two are visually near enough
  to pass a read-back. Measured over the shipped `gw-` backgrounds: **29 minus signs, 12 ASCII hyphens,
  and the 3 en dashes this batch introduced.** Write `−`; the hyphens are a small standing backlog and
  the en dash is simply wrong.

## What C21 found

- **TWO OF THIS BATCH'S CONSTITUTIONS ARE NOT IN FORCE, AND THE SERVICE INDEX IS WHAT SAYS SO.** C19
  established that the constitution's slug and exact title are read off
  `constituteproject.org/service/constitutions?lang=en` rather than composed; that same record carries an
  `in_force` flag, and for `Central_African_Republic_2016` and `Oman_2011` it is **false**. A card that
  called either "the constitution" would be asserting something the source itself denies, so both cards
  date the text they quote instead — "The constitution of 2016 names the city…", "The Basic Law of 1996,
  as revised in 2011, opens by declaring…". **Read the flag, not just the slug.**

- **A CONSTITUTION CAN NAME ITS CAPITAL AND FENCE IT IN THE SAME BREATH**, which is a seventh shape for
  the tally. The Central African text's opening article reads *"Its capital is Bangui. It can only be
  transferred by virtue of a law, when the superior interest of the Nation requires it."* Nicaragua's
  escape hatch, found in C19, turns out not to be a one-off: a state that names its capital in the
  constitution often writes the condition for moving it into the same article. Oman's is the plain
  opposite — the Basic Law declares the Sultanate an Arab, Islamic, independent state and makes Muscat
  its capital, with no clause about moving it.

- **NEW ZEALAND'S CONSTITUTIONAL TEXTS NEVER CALL WELLINGTON THE CAPITAL, AND THE THREE PLACES IT DOES
  APPEAR ARE WORTH THE CARD ON THEIR OWN.** It is the place an Order in Council was dated; it is the
  address of the Electoral Commission; and it is in the definition of a public holiday — "the day
  observed as anniversary day in Wellington". "The seat of Government" occurs once, in a proviso about
  electors absent from their district, and names no place. **Kuwait is the flatter case in the same
  family**: its constitution never names the city and uses *capital* only of money (article 16, ownership
  and capital and labour as the mainstays of the State's social entity). **Costa Rica** is the third:
  article 114 has the Assembly reside "in the capital of the Republic" and requires two-thirds of its
  members to move that seat, naming no city. This is C20's "legislating about the capital without naming
  it", now three batches deep and plainly the commonest shape of all.

- **THE WMO LEG FAILS A SEVENTH WAY: TWO WINDOWS A CENTURY APART IN ONE RECORD.** San José's entry
  (id 1113) gives temperature normals for **1961–1982** and rainfall normals for **1888–1997** — 22 years
  of heat against 110 of rain, in one table with one city name over it. C18's Lomé had per-field windows
  a year apart and that was already worth stating; this is the same fault at a scale nothing on the page
  marks. **Read `climateFromMemDate` per field, never once for the record.**

- **AND AN EIGHTH: ONE CAPITAL WITH TWO ENTRIES.** Kuwait is the whole of its country's index — two rows,
  `Kuwait City` (1498, `isCapital` true, normals 1994–2008) and `Kuwait Airport` (217, `isCapital` false,
  normals 1962–2008). The two disagree by about a degree in the same month over spans that do not
  overlap, which is a fact about the records rather than about the air between them, and `gw-628` says so
  rather than reading the gap as geography. **Where a country has two rows, cite both and name the
  difference as a difference between records.**

- **TWO MORE COUNTRIES ABSENT FROM THE INDEX ENTIRELY**: the Central African Republic and Mauritania,
  joining C19's Nicaragua, Congo and Liberia. The per-country counts this batch needed are Costa Rica 17,
  New Zealand 46, Oman 35 and Kuwait 2, all read off `full_city_list.txt` rather than estimated — and the
  absences are what the Bangui and Nouakchott cards close on, since a card that simply omits the weather
  leg looks like a card whose author did not look.

- **WHERE THE WMO IS ABSENT, THE PAPER'S OWN STUDY-AREA CLIMATE PARAGRAPH IS THE LEG.** Both stationless
  capitals here were carried by one: the Bangui land-cover paper states 25.9 °C mean annual temperature,
  1,525 mm annual rainfall, a December-to-February dry season and monthly rainfall above 145 mm from May
  to October; the Nouakchott sand-encroachment paper reports 25.6 °C over **2000–2015** from the city's
  own station, with 120 mm of rain concentrated in July, August and September. **The window is attached
  to the temperature sentence and not to the rainfall one**, which is why that card's date line says
  *Temperatures* rather than *Rain and heat* — caught in read-back, and the shape to watch whenever one
  paragraph carries two figures and one date range.

- **THE UNDATA CAPITAL LINE MEANS A GOVERNORATE IN TWO OF THESE SIX.** Muscat's figure is the
  governorate's and its footnote says so; Kuwait's covers **four** named governorates — Capital, Hawalli,
  Al-Farwaniya and Mubarak Al-Kabeer; San José's is "urban population of cantons". Wellington's and
  Bangui's are the city. All six are dated **2019 in a column headed 2025**, as every batch since C11.

- **OPENEDITION'S PROOF-OF-WORK WALL IS CONFIRMED ACROSS A SECOND JOURNAL.** C20 met Anubis v1.26.2 on
  `journals.openedition.org/aam`; `physio-geo` on the same host serves it too, which cost Bangui its
  flood-history leg and is why that card rests on land cover and an epidemiological paper instead. It is
  a host-wide wall, not a per-journal one. **Do not plan a batch around OpenEdition.**

- **A HEALTH PAPER IS A CLIMATE SOURCE WHEN THE CLIMATE IS THE EXPOSURE.** C19's rule (search the
  discipline that publishes about the place) paid again: the only openable statement that Bangui's
  rainfall has a measurable consequence is a BMC hepatitis E study — 2,883 yellow-fever-surveillance blood
  samples from 2008 to 2012, 745 of them positive, an outbreak peaking in 2008–2009, and "a clear
  seasonal pattern with correlation between HEV incidence and rainfall in Bangui". **Name the sample's
  provenance**: a prevalence figure drawn from surveillance samples is not a population rate, and the
  first draft read as though it were.

- **MDPI DOIs STILL 403 FROM THIS CONTAINER AND THE PAPERS STILL READ AT `res.mdpi.com`.** Three of this
  batch's works are MDPI (Muscat, Nouakchott, Kuwait City); all three DOIs were verified against Crossref
  for authors, title, journal, volume, issue, year and pages rather than trusted to resolve. **A 403 from
  the resolver is this container's fact, not the citation's** — which is why the URL sweep and the
  Crossref check are two different steps and neither substitutes for the other.

- **AND THE READ-BACK CAUGHT THE USUAL FOUR KINDS.** A **wrong expansion of an abbreviation**: the
  Wellington Fault's T-P segment is *Tararua–Putara*, and the first draft read it as "Tararua to
  Pahiatua" — Pahiatua is named in that paper as part of a *different* segment's description, so the
  error was manufactured out of the source's own page. A **hedge dropped**: the paper says the two
  segments could be stable "in **at least** the future 300 years and 190 years"; the draft said "about".
  An **arithmetic claim that is false at one end**: Wellington's highs swing exactly 9.0 degrees over the
  year and its lows 7.9, so "under nine degrees at either end" was wrong about the highs. And an
  **unsupported superlative**: "the station's record here is the oddest in the index" claims a comparison
  across 3,598 cities that nothing checked. **Every one of the four renders perfectly.**

## What C20 found

- **THE CONSTITUTIONAL TALLY NOW HAS SIX SHAPES, AND FOUR OF THIS BATCH'S SIX DECLINE TO NAME THE CITY IN
  THE ORDINARY WAY.** Slovakia gives the capital **a structural division of its own**: the third part of
  the opening chapter is headed for it, and article 10 both names Bratislava and remits the city's status
  to ordinary law — the strongest form the pass has met. Lebanon's article 4 sits between the clause
  forbidding any part of the territory to be ceded and the clause describing the flag. **Norway names no
  city at all**: article 68 has the Storting assemble “in the capital of the Realm” and lets the King
  designate another town “in extraordinary circumstances, such as hostile invasion or infectious
  disease” — El Salvador's variety with a far better escape clause. **Ireland names the city twice and
  never calls it the capital**, giving the President an official residence “in or near the City of
  Dublin” and having the Houses of the Oireachtas sit “in or near” it “or in such other place as they
  may from time to time determine”: a new variety, the place named and the title withheld. And Finland
  and Liberia join Denmark and Togo in silence — Finland's text never uses the word at all, Liberia's
  uses it only of capital offences.

- **AND A WARNING FOR ANYONE READING A CONSTITUTE PAGE: THE BOLD “National capital” LINE ABOVE AN
  ARTICLE IS CONSTITUTE'S OWN TOPIC TAG, NOT THE CONSTITUTION'S WORDS.** Ireland's page carries that label
  twice over articles whose text never uses the word, and every page carries “Prohibition of capital
  punishment” over a clause about the death penalty. **Grep the text, and count the word only where the
  constitution itself says it.**

- **THE WMO LEG FAILS A FIFTH WAY: A RECORD THAT CARRIES ONE VARIABLE.** Beirut's holds rainfall and
  nothing else — no temperature, no rain days — over **1981–1990**, a ten-year window rather than a
  thirty-year one. The card prints the rainfall and says what the record is. The measured tally of ways
  this leg fails now runs to five: no record at all (Managua, Brazzaville, Monrovia); a country in the
  index whose single city is not the capital (Managua); per-field windows a year apart (Lomé); complete,
  windowed and wrong (Bishkek); and one variable on a short window (Beirut).

- **AND A SIXTH THING THE INDEX DOES: IT FILES A CAPITAL UNDER ITS AIRPORT.** Helsinki is entered as
  **Helsinki-Vantaa**. Set beside C19's finding that the index files Copenhagen with Tórshavn and Nuuk —
  which UNdata's own profile explicitly excludes from every figure it gives for that country — the point
  is that **the meteorological index's idea of a country is not the statistics division's**, and a card
  that says so is saying something true about both.

- **THE UNDATA FOOTNOTE CAN HEDGE THE FIGURE AS WELL AS DEFINE IT.** Beirut's capital line carries two:
  the estimate “should be viewed with caution as these are derived from scarce data”, and it “excludes
  Syrian refugees”. That is the first capital figure in the pass qualified for RELIABILITY rather than
  for SCOPE, and it belongs on the card precisely because the facts grid's own number cannot say it.

- **WHERE THE PHYSICAL LITERATURE IS SILENT, THE MEDICAL LITERATURE HAS THE GEOGRAPHY.** Monrovia's fifth
  leg is a PLOS scabies prevalence survey whose Study Setting names New Kru Town as a coastal community
  **on Bushrod Island**, of more than 20,000 people in 25 distinct communities — the only openable
  statement of the city's island geography the batch found. C18's rule restated: search the discipline
  that happens to publish about the place, not the discipline the fact belongs to.

- **A GOLD-OPEN-ACCESS JOURNAL IS NOT A READABLE ONE, AND THE CHECK IS TO OPEN THE ARTICLE.** Elsevier's
  gold titles (Scientific African, Heliyon) redirect through `doi.org` to a ScienceDirect wall; Springer's
  `link.springer.com` and even SpringerOpen's own `earth-planets-space.springeropen.com` answer a client
  challenge; Wiley answers 403. Two papers were collected as far as their Crossref metadata in this batch
  and then dropped, because the metadata is not the article. **Never cite from a record alone.**

## What C19 found

- **THE CONSTITUTE SLUG AND TITLE COME FROM THE SERVICE, NOT FROM THE `/countries` PAGE.** That page is an
  Angular application whose list never appears in the HTML, so the slug could not in fact be read off it.
  **`https://www.constituteproject.org/service/constitutions?lang=en`** returns the whole catalogue as JSON,
  giving every constitution's `id` (the slug), its exact `title` in the *Country YEAR (rev. YEAR)* form the
  citation needs, whether it is `in_force`, and its translator. All six of C18's titles were re-checked
  against it and match. It also settles a choice a guessed slug cannot: the Republic of the Congo has both
  `Congo_2001` and `Congo_2015`, and only the second is in force. **Use the service; it removes the last
  place in this recipe where a slug or a title could be composed.**

- **THREE MORE VARIETIES OF WHAT A CONSTITUTION DOES INSTEAD OF NAMING ITS CAPITAL.** Denmark's 1953
  constitution does not contain the word *capital* anywhere, and never names Copenhagen — a silence one
  degree deeper than Togo's, which at least uses the word once. El Salvador's legislates about the capital
  without naming it: article 122 has the Legislative Assembly meet “in the capital of the Republic”, with
  leave to sit elsewhere. And Nicaragua's article 12 names the city and in the same breath provides for
  losing it — “in extraordinary circumstances these can be established elsewhere in the national
  territory” — which in a capital flattened by an earthquake in 1972 is a clause with a history behind it.
  The four that do name theirs land where C18 found them: among the state symbols (Bulgaria's article 169
  closes the chapter on the coat of arms, the seal, the flag and the anthem), in the article defining the
  state (the Congo's article 1), and in an article of its own beside the borders clause (Serbia's
  article 9).

- **THE WMO LEG FAILS TWO NEW WAYS IN ONE BATCH, AND NEITHER IS A MISSING WINDOW.** Nicaragua is in the
  index with exactly one city and it is **Chinandega, not the capital**; the Republic of the Congo is **not
  in the index at all**. Both are facts about the city worth a clause rather than gaps to apologise for,
  and both cards say so. The measured tally of ways this leg fails now runs: no record (Managua,
  Brazzaville), a record with no single window but per-field ones a year apart (Lomé), and a record
  complete, windowed and wrong (Bishkek).

- **THE UNDATA CAPITAL LINE MEANS A DIFFERENT THING IN EVERY COUNTRY, AND ONLY ITS FOOTNOTE SAYS WHICH.**
  Three of these six are not the city at all: Belgrade's figure is “the urban population of Belgrade
  area”, San Salvador's covers the urban parts of eight named municipalities, and Copenhagen's is the
  Greater Copenhagen Region, “consisting of (parts of) 16 municipalities”. With Asunción's from C18 that
  is four cards in twelve. **Read the footnote before writing the figure**, and where it defines an
  aggregate, say so on the card — it is the most interesting thing on the line, and it is what makes the
  grid's own number honest.

- **WHEN TWO CITIES IN A BATCH SHARE A HAZARD, LOOK FOR THE PAPER THAT RANKS THEM BOTH.** Meredith et
  al.'s 2025 survey of 1,133 cities near volcanoes carries the whole landform half of Managua AND of San
  Salvador, with a distinct figure for each: Managua has 66% of its people within 10 km of a volcano
  against Naples's 40%, and San Salvador has 23 volcanoes within 100 km and stands third in the study's
  composite ranking behind Bandung and Jakarta. One fetch, two cards.

- **THREE HOSTS SHUT, AND ONE OF THEM USED TO BE OPEN.** `journals.openedition.org` now serves an
  **Anubis proof-of-work challenge** instead of the article, where earlier measurements in this project
  record it as reachable. `doiserbia.nb.rs` presents a certificate that does not match its own hostname
  — a different fact from a refusal, and equally unusable, since this pass does not disable
  verification. `link.springer.com` answers a “Client Challenge”. **Re-measure a host before planning a
  leg on it**; two of these were picked because a search result looked open.

- **AND CHECK THAT A FETCHED PDF EXTRACTS BEFORE COUNTING IT AS A LEG.** The Geosciences paper on local
  seismic effects at San Salvador downloads at 13 MB and extracts as blank glyph codes — the subset-font
  cipher C18 met on the Lomé transport paper. The card was built without it, which is why gw-612 rests on
  four sources and the index rather than five and the index.

## What C18 found

- **A WMO RECORD WHOSE `datab` IS EMPTY IS NOT A RECORD WITHOUT A WINDOW.** Lomé carries no single
  `datab`/`datae` pair and the PER-FIELD ones carry it instead: temperature over 1961–1990 and rainfall
  over **1960–1989**, two windows a year apart. Read off `datab` alone the station reports as having no
  normals at all, which is how this batch's first pass recorded it. The card states both windows, because
  the pass's standing sentence — *the station's normals for X to Y* — is not true of a record shaped
  like this. **Read every window field before concluding a station has none.**

- **AND BISHKEK'S TABLE IS PRESENT, COMPLETE, WINDOWED AND WRONG, AND IT RENDERS PERFECTLY.** Under a
  stated 1981–2010 window it gives rain-day counts of **36, 37 and 38 in months of 30 and 31 days**, and
  its `maxTemp`/`minTemp` are plainly absolute EXTREMES rather than monthly means — January 19.2 / -25.0
  °C, July 42.8 / 9.9 °C. The field names are the standard ones and the JSON parses, so nothing
  downstream can tell; a card built from it would have printed nonsense in the house form. `gw-607` takes
  its weather from a published one-year model simulation instead **and says on the card that it is
  modelled**, and the WMO leg survives there only as the index. **A table that parses is not a table that
  is right: check the rain days against the length of the month before quoting a station.**

- **THE UNDATA FOOTNOTE LIST IS PARSED ON ITS LETTER MARKERS, NEVER BY COUNTING NON-EMPTY LINES.** A long
  note wraps across several lines and shifts every letter after it, which read Togo's capital figure as
  2023 when it is 2019. All six capital figures are dated **2019 under a column headed 2025** — the
  seventh batch running to find that unanimous — and Paraguay's carries the substantive note as well:
  the figure covers the district of Asunción together with the nineteen districts of Central
  Department, which is why the grid's 3.30M is not the city.

- **WHERE A CONSTITUTION FILES ITS CAPITAL CLAUSE SAYS WHAT ITS DRAFTERS TOOK A CAPITAL TO BE**, and these
  six land in four different places. Among the **STATE SYMBOLS**: Laos's article 119 stands in the chapter
  on the language and script, the emblem, the flag, the anthem, the national day and the currency;
  Kyrgyzstan's clause sits inside article 14, after the flag, emblem and anthem and before the monetary
  unit. Among the **ADMINISTRATIVE UNITS**: Turkmenistan's article 24 follows directly on the article
  establishing administrative-territorial units, and Paraguay's article 157 constitutes the City as a
  Municipality independent of every Department, with article 221 giving it an electoral college of its
  own in the Chamber of Deputies. In the article **DEFINING THE STATE**: Libya's 2011 declaration names
  the capital in article 1 beside the religion and the official language, and separately seats the
  National Transitional Council there at article 23 while allowing it a provisional seat at Benghazi.
  **And in Togo's 2024 constitution, nowhere at all**: the single occurrence of the word in the whole text
  is the article abolishing capital punishment — the strongest form yet of the silence C11 first met.

- **WHERE THE OPEN LITERATURE ON A CITY IS THIN, THE BEST SOURCE IS A DATABASE RATHER THAN A PAPER.**
  Ashgabat returns four DOAJ hits and not one of them is about the place. The card rests instead on the
  NOAA/NCEI Global Significant Earthquake Database's own record of 5 October 1948 — magnitude 7.2, 18 km
  deep, maximum intensity X, 110,000 deaths and 25 million dollars of damage, each a field of the record
  rather than a claim of ours — on a 2025 Copernicus regional hazard model that computes ground motion at
  every Central Asian state capital, and on a Frontiers archaeobotany paper whose INTRODUCTION dates the
  piedmont's first farming to about 6000 BCE at Djeitun. **A paper's introduction is a citable leg when its
  own subject is somewhere else**, which is how the landform sentence was got at all.

- **TWO HOSTS REFUSED OUTRIGHT AND ONE WALL IS THE KNOWN ONE.** `geopersia.ut.ac.ir` resets the connection
  on both the article page and the PDF, so the obvious geomorphology review of the country could not be
  read; `whc.unesco.org` answers 403. The two MDPI DOIs in this batch resolve to a 403 as they always do
  and were read at `res.mdpi.com/d_attachment/…` — a host wall, not a dead link, and the citation keeps
  the DOI.

- **A JOURNAL PDF WHOSE FONTS ARE SUBSET-ENCODED IS A SUBSTITUTION CIPHER, AND IT IS NOT WORTH SOLVING FOR
  A SECONDARY LEG.** The Lomé intermodality paper extracts as glyph codes assigned in order of first
  appearance (`!`=T, `"`=R, `#`=A, `(`=space, and upper and lower case are separate glyphs), so the
  mapping is recoverable word by word — and the ten minutes that would take buys one institution
  sentence. The leg was replaced.

- **ONE OPEN PAPER CAN CARRY THREE LEGS.** The Frontiers in Water study of the Continental Terminal
  aquifer gives Lomé its water (a 64 km² lagoon system at 1.8–2.5 g/L, reaching the sea through the
  Aného channel), its rock (the Gulf of Guinea basin over a Pan-African basement) and its climate (four
  seasons, 864 mm a year against 1,445 mm inland) in a section apiece. That is what made a city with no
  single-window WMO record writable at all.

- **A RIVER THAT SHARES ITS COUNTRY'S NAME CANNOT BE NAMED.** The grid's first row is Country, so rule 2
  forbids the word on the card — and for Asunción the word is also the name of the river the city stands
  on. The card says *the river the country is named for*, which keeps the bearing and breaks no rule.
  Expect the same on any capital whose defining water carries the country's name.

## What C17 found

- **THE `gw-5` HUNDRED IS FINISHED AND MEASURES ZERO ON ALL FOUR RULES.** `node .claude/gw-audit.js
  --prefix=gw-5` now reports 98 cards with **no** mention of the United States, **no** repeated grid value,
  **no** card missing landform, water or weather, **no** bordering country named and **no** date line naming
  the United States — the first complete hundred of the capital half. Run it rather than trusting this
  sentence; what it records is that a hundred cards rewritten one batch of six at a time do converge.
- **A CAPITAL IS A FIRST-ORDER TERRITORIAL UNIT FAR MORE OFTEN THAN THE PASS HAD NOTICED, AND FOUR OF THESE
  SIX SAY SO.** Hungary's Article F names Budapest and then lists **the capital ahead of the counties,
  cities, towns and villages** as a tier of the territorial system, letting it be divided into districts.
  Austria seats Vienna three ways at once — the Federal capital and seat of the highest Federal authorities
  (article 5), **one of the nine autonomous Länder** (article 2), and the seat of the National Council
  (article 25). Belarus runs the pattern through its whole text: the upper chamber takes **eight deputies
  from every oblast and eight from the city of Minsk alike**, a referendum initiative needs 30,000 voters
  from each oblast *and* from Minsk, and a seat in that chamber requires five years' residence in an oblast
  *or* in the city. Tajikistan (C16) did the same. **Read past the capital clause**: the standing is
  usually somewhere else in the text.
- **AND TWO OF THE SIX ARE FAMOUS FOR HAVING NO CONSTITUTIONAL CAPITAL, WHICH IS MEASURABLE RATHER THAN
  ASSERTED.** *Bern* occurs **exactly once** in the Swiss text, in article 1's list of the People and the
  Cantons, so the text names it only as a canton and establishes no federal capital at all. *Freetown*
  occurs exactly once in the Sierra Leonean text, and the reference is to the **Freetown Municipality
  Act**, in a list of bodies whose membership does not disqualify a member of parliament. Both are the
  C16 Portugal/Greece outcome met again, and both cards say so plainly instead of reaching for a clause
  that is not there.
- **A CITY WITH NO WMO STATION AT ALL, AND A CITY WHOSE STATION IS ACROSS AN ESTUARY.** The service's
  index of 3,598 cities carries **three Swiss entries — Geneva, Lugano and Zurich — and none for Bern**,
  which is the other half of C1's finding that a fuzzy matcher gave Bern the Belgian village of
  *Bernissart*: it did so because there was nothing to match. `gw-600` therefore prints no normals and
  says why, citing the index itself — the C14 Sucre rule done the right way round, the source for the
  negative being the document that would have carried the positive. **Freetown's entry is filed under
  the city and reads at `Lungi`**, and carries neither a normals period nor any rain-day count: C11's
  Colombo-for-Kotte case, and the card names the station rather than printing the figures as the city's
  own.
- **AND THE SAME INDEX ANSWERS A QUESTION ABOUT A CITY'S STANDING.** Minsk is the **only** entry the
  service carries for its whole country, which is a real fact about the place and is one grep of a file
  already cited. **A uniform leg can be read for what it does NOT contain.**
- **A HARBOUR'S PROPER NAME CAN CARRY ITS COUNTRY'S, AND RULE 2 TAKES IT AWAY.** Freetown's harbour is the
  **Sierra Leone Estuary**, which is the grid's Country value verbatim, so `gw-601` has to describe the
  estuary without naming it. That is the rule working as designed and it is worth knowing before drafting:
  check the place names a city's site is made of against the grid before writing the sentence, not after.
- **THE UNdata CAPITAL FOOTNOTE AGAIN, AND TWO CITIES SHARE ONE.** Baku's and Minsk's figures both carry
  *Including communities under the authority of the Town Council* — the same sentence, on two profiles in
  one batch, which is the first time the pass has seen a footnote repeat. The other four are the bare year
  and the year is 2019 on all of them.
- **THREE PDFs IN THIS BATCH EXTRACT AS CIPHERS AND ONE JOURNAL PRINTS ITS BYLINE IN A DIFFERENT SCRIPT
  FROM ITS TITLE.** The Greater Baku paper, the Minsk housing paper and the UN-Habitat Port Moresby
  profile all download whole and come out as raw CID codes, so three candidate legs were dropped rather
  than guessed at. And the Minsk flood paper is in a **Polish** journal with an **English** title and a
  byline printed only in **Cyrillic** — В. Корнеев, Л. Гертман, И. Булак and А. Пахомов on the journal's
  own page as well as in Crossref — so that is how it is cited. **Cite the byline the publisher prints,
  in the script it prints it in.**
- **ACCESS.** `journals.librarypublishing.arizona.edu` fails DNS resolution entirely, which cost the
  Freetown deforestation paper; `e3s-conferences.org`, `journals.aesop-planning.eu` and
  `www.sciencedirect.com` are 403; `hasp.ub.uni-heidelberg.de` serves an Anubis wall. Open and useful:
  Copernicus in full (`esurf`, `sd`, `we`, `hess`, `bg`, `nhess`, `isprs-archives`), `nature.com` for its
  open-access titles, `frontiersin.org`, `bozpe.pcz.pl`, `jurareview.ro`, `radhyg.ru` and
  `revistas.una.ac.cr`.

## What C16 found

- **THE CONSTITUTION LEG REVERSED THE BATCH AFTER IT, AND ONLY TWO OF SIX NAME THEIR CAPITAL AT ALL.**
  C15 was unanimous; this one is the other end of the same distribution, and the four failures fail in four
  different ways. **Honduras names TWO CITIES — the first shared capital the pass has met**: article 8
  makes Tegucigalpa and Comayagüela *jointly* the capital of the Republic, and article 295 folds those two
  former municipalities into a single central district. **Papua New Guinea names no city whatever**:
  section 4 creates a National Capital District, puts the Seat of Government inside it and leaves the
  boundaries to an Organic Law, so the capital is a territorial unit before it is a place — a new outcome
  for the leg, and the reason `gw-592` opens by saying so. **Sweden seats the parliament without naming a
  capital**, and expressly lets the Riksdag sit elsewhere for the liberty or safety of parliament, which is
  C11's Sri Lanka outcome in a different shape. And **Portugal and Greece say nothing at all**: *Lisbon*
  occurs zero times in the Portuguese text, whose only uses of *capital* are *capital punishment* and
  *capital investment*, while the Greek text's single occurrence of *Athens* is the Athens Academy, in the
  article on what magistrates may do besides judge. Only **Tajikistan** answers plainly, in article 4, and
  it then gives the city a second standing by seating it in the upper chamber beside the autonomous region
  and the provinces with an equal number of representatives.
- **THE UNdata CAPITAL FOOTNOTE PAID OFF ON HALF THE BATCH, AGAINST ONE IN SIX LAST TIME**, and each of the
  three says a different thing about what is being counted. Portugal's figure is **Grande Lisboa plus the
  Peninsula of Setúbal plus the municipality of Azambuja**; Sweden's is a **`tätort`**, a built-up locality
  defined by the administrative divisions of 2005; Greece's is **"the localities of Calithèa, Peristérion
  and Piraeus, among others"**, spelled as the UN spells them rather than as an atlas would. The other
  three footnotes are the bare year, and the year is 2019 on all three — a sixth unanimous batch for that.
- **INTERNAL VOCABULARY LEAKED INTO A READER-FACING SENTENCE AND ONLY THE READ-BACK CAUGHT IT.** `gw-589`'s
  draft ended "…jointly the capital of the Republic, which is the only shared capital **the pass** has
  met" — this batch log's own word for this work, inside a card. **No checker can see it**: the sentence is
  grammatical, it is true, and what is wrong with it is that it is a fact about Folio's project rather than
  about the city. The rule that caught it is the standing one — read every finished card back as a reader —
  which has now taken a wrong superlative (C13), unsourced clauses (C13 and A8) and this.
- **THE WMO WINDOWS ARE ALL DIFFERENT AND SO IS THE RAIN-DAY THRESHOLD**, which is C15's finding holding
  over a second batch. Windows: Tegucigalpa, Lisboa and Dushanbe 1961–1990, Port Moresby 1973–2007,
  Stockholm 1991–2020, Athens 1955–1997. `raindef`: 1 mm at Tegucigalpa, 0.1 mm at Lisboa, Port Moresby and
  Stockholm, **blank at Dushanbe and Athens**. A wet-day count is not comparable between two cities unless
  the threshold is read, and on two of these six it cannot be read at all.
- **THE HARDEST CITIES WERE CARRIED BY A NEIGHBOURING DISCIPLINE, AGAIN.** Dushanbe's whole site — the
  Hissar valley 70 km by 20, the Kafirnigan gathering the Varzob, the Luchob and the Hissar Canal, three
  kilometres of Meso- and Cenozoic sediment over which the city stands on loess and alluvium, and the 1989
  Hissar earthquake — comes from a **seismic-microzonation** paper, and its fifth leg is a **radon survey of
  200 rooms in 14 kindergartens and 36 schools**, which is also honest enough to report that its readings
  show no pattern against the geology under each school. Port Moresby's city facts come from a
  **housing-economics** paper (the planning board, the commission under the Physical Planning Act of 1989,
  and the 60/40 split between State and customary land) and a **population-estimation** paper counting
  4,653 structures in one settlement. C15's rule again: search the discipline that publishes about the
  place.
- **AND A HOST THAT NEEDED THE AUGMENTED CA BUNDLE ONCE DOES NOT ALWAYS NEED IT.** `revistas.una.ac.cr`,
  which carries `gw-589`'s water source, was fetched with `--cacert` out of habit and answers 200 plainly —
  so the TLS-chain list stays at the three C15 named and is NOT four. **Re-test before recording a host.**
  Newly shut this batch: **`e3s-conferences.org` is 403 here**, and **`hasp.ub.uni-heidelberg.de` serves an
  Anubis proof-of-work wall at status 200** to the plain agent that C14 found gets past OpenEdition's — so
  the plain-agent trick is a thing to try, not a thing to rely on.

## What C15 found

- **THE CONSTITUTION LEG ANSWERED ON ALL SIX — the second unanimous batch — AND NO TWO ANSWER ALIKE.**
  Haiti's first article makes the city the capital *and* the seat of government and lets that seat move
  **only for reasons of force majeure**, which is the first CONDITION the pass has met on a power to
  relocate: Rwanda's and South Sudan's are unconditional and Burundi's and Jordan's are by ordinary or
  special law. The same text then seats the legislature there, movable only to the same place and at the
  same time as the executive, and fixes the president's residence at the National Palace unless that
  happens — three articles, like Belgium's, but all three about MOVING rather than about standing.
  Jordan's third article names the City of Amman and allows a special law to transfer it, and two further
  articles locate the trial of ministers and the Constitutional Court's seat by the word *Capital* rather
  than by the city's name. The Dominican text gives one city three standings in one article: the National
  District, the capital of the Republic and the seat of the national government. The federal text of the
  Emirates makes the city the capital in article 9 and requires the Supreme Council to meet there unless
  another place is agreed in advance. **Cuba's is the first in the pass with NO relocation clause at all** —
  the capital is named in the same sentence as the state's name, language and symbols, and nothing
  anywhere provides for moving it. And the Czech answer is in TWO documents: article 13, plus the
  constitutional act of 1997 creating the fourteen higher territorial self-governing units, whose third
  article fixes the capital's own territory — so the place is a region as well as a capital.
- **A SIXTH AND A SEVENTH VARIETY OF WMO FAILURE, AND BOTH ARE SILENT.** Port-au-Prince IS listed, with a
  station name and its national hydrometeorological unit named beside it, and its `climateMonth` array is
  **empty** — an entry that is present and carries no data whatever, where C7's Luanda and C11's Taipei
  each had half a table. And **Amman has a full twelve-row table with no normals period stated at all**
  (`datab` and `datae` blank), so the averages can be printed and the years they average cannot. A card
  may not invent a window; `gw-584` says so in a sentence instead. The batch's five windows, measured:
  Santo Domingo and Havana 1961–1990, Abu Dhabi 1982–1991, Prague 1981–2010, Amman none, Port-au-Prince
  nothing at all.
- **AND THE RAIN-DAY THRESHOLD IS NOT UNIFORM EITHER, WHICH MAKES A WET-DAY COUNT INCOMPARABLE.** The
  `raindef` field is 1 mm at Santo Domingo, Havana and Prague, **0.2 mm at Abu Dhabi** and blank at Amman.
  Two cities' "wet days" are two different measurements unless the threshold is read and stated.
- **THE SAME TLS-CHAIN FAULT ON TWO MORE HOSTS, AND A 000 IS NOT A DEAD CITATION.**
  `gtg.webhost.uoradea.ro` and `materconstrucc.revistas.csic.es` both answer 000 to a plain curl —
  *unable to get local issuer certificate* — and **200 with an augmented CA bundle**, the DOI resolving
  correctly in both cases. C12 met this at `polipapers.upv.es`; it is now three hosts. The site is not
  sending an intermediate this container happens not to carry, and a reader's browser does. **Re-test a
  000 with the bundle before recording a citation as unreachable.**
- **ONE PAPER SERVED TWO CARDS, WHICH IS WHY ITS TITLE WAS WORTH READING PAST.** Belvaux and colleagues'
  Hispaniola microzonation study is filed under the ISLAND, and it carries the 2010 earthquake and the
  Enriquillo–Plantain fault for `gw-583` **and** the 34 geomechanical units under Santo Domingo for
  `gw-585` — Yanigua marls with sand, limestone and calcarenite, the karsted reef limestone of Los
  Haitises, La Isabela's altered reef terraces, San Cristóbal's clays grading into sandstone and gravel,
  plus sinkholes, floodplain pebbles and valley-floor alluvium. **Where a paper names an island rather
  than a city, read it for every capital on that island.**
- **A PDF THAT EXTRACTS AS A CIPHER IS A SOURCE LOST, NOT A HOST LOST.** The obvious Amman geology paper —
  the strike-slip study of the Wadi Shueib and Amman–Hallabat structures — downloads whole from
  `res.mdpi.com` and its text layer comes out as raw CID codes, C5's redalyc case and C13's White Rose
  case again; this container has no `pdftotext`, no `pypdf` and no `fitz` to fall back on. A different
  paper in the SAME journal from the same publisher extracts cleanly. **Check that the words come out as
  words before planning a card around a paper.**
- **AND A GEOLOGICAL FORMATION CAN CARRY A CAPITAL'S OWN NAME.** The **Amman Silicified Limestone** is an
  Upper Cretaceous bed of silicified limestone alternating with chert and phosphatic chert, laid down on
  a marine shelf and holding foraminifera, ammonites, gastropods and bivalves; limestone of that kind has
  been used as building stone for decades and weathers badly enough that its exact composition is worth
  measuring. That is a landform sentence, a history sentence and the city's name in one source.
- **RULE 2 TOOK THE WORD *largest* AWAY FROM ALL SIX**, C11's finding at full strength: five grids say
  `largest` and Abu Dhabi's says `2nd largest`, which strips to the same word. It has to be hunted out of
  a finished draft deliberately — `gw-588` lost it on "the largest share of larnite-belite" — and the six
  country names go with it, so the Emirates card writes *the federation* and the Czech one writes nothing
  at all.
- **DOAJ'S HAVANA CORPUS IS CLINICAL AND THE CITY'S OWN JOURNALS ARE SHUT.** `riha.cujae.edu.cu`, which
  carries the Vento canal hydrology, refuses the connection; so does `scielo.sld.cu`; and
  `whc.unesco.org` 403s a spaced request as well as a burst. A title search for the city returns 300
  articles of which almost every one is medical. What carried `gw-587` instead is an **English** paper in
  *Frontiers in Microbiology* on antibiotic-resistance genes in the Almendares — whose Site Description
  table is a hydrology of the river through the western city, with dry- and wet-season flows station by
  station — and an **art-history** paper in *Religions* on the sanctuary at Regla, whose introduction is a
  description of the harbour crossing, the lighthouse at its mouth and the dockworkers' municipality on
  its southern rim. **Search the discipline that happens to publish about the place, not the discipline
  the fact belongs to.**

## What C14 found

- **A CONSTITUTION CAN NAME A CAPITAL THAT IS NO LONGER THE CAPITAL, AND THE SAME ARTICLE IS WHY.**
  Burundi's text of 2018 fixes the capital **at Bujumbura** in its ninth article — and that article also
  says the law may move the capital to any other city, or separate the political capital from the
  economic one, which is exactly what was later done in favour of Gitega. C5 recorded a constitution
  naming a different city; here the mechanism of the move is in the clause itself, so the card can state
  both without contradicting either. **Read the whole article, not the sentence the search lands on.**
- **AND ONE WHOSE ONLY USE OF THE WORD *CAPITAL* IS ABOUT ANOTHER PEOPLE'S.** Tunisia's text of 2022
  contains *capital* exactly once, in the preamble, supporting a state for the Palestinian people with
  Al-Quds Al-Sharif as its capital; its own seat of government is named nowhere. That is a fifteenth
  outcome for the leg and the most easily mis-measured: a bare count of the word says the constitution
  discusses capitals, and it does not discuss its own.
- **THE OTHER FOUR ALL ANSWERED, TWO OF THEM WITH A POWER TO MOVE.** Rwanda's article 7 names the City of
  Kigali, leaves its organisation to ordinary law and adds that a law may relocate the capital
  elsewhere; South Sudan's text makes Juba both the national capital and the seat of the national
  government, seats the legislature there by name, and then lets the government relocate the capital and
  either speaker convene a sitting somewhere else. **A named capital is not always a fixed one**, and a
  card that says "the constitution makes it the capital" and stops has told the reader the smaller half.
- **BELGIUM GIVES ONE CITY THREE CONSTITUTIONAL STANDINGS AT ONCE** — article 194 the capital and the
  seat of the federal government, article 3 one of the three Regions, article 4 the single bilingual
  region among four linguistic regions. No other capital met in the pass holds three.
- **CROSSREF AND A DRAFT CITATION CAN AGREE ON A YEAR THE JOURNAL ITSELF CONTRADICTS.** OpenEdition
  registers a DOI for an old article at the moment of registration, so the "published-print" year
  Crossref carries is the DEPOSIT rather than the article's own date: *Brussels Studies* document 78 says
  *mis en ligne le 23 juin 2014* against Crossref's 2016, and document 185 says 15 October 2023 against
  Crossref's 2022 — and the draft had copied Crossref's 2022, so the checker passed it in silence. Only
  the journal's own **"Pour citer cet article"** line settles it. Both are now declared in
  `CROSSREF_YEAR_WRONG`, which downgrades them to the eye rather than excusing them.
- **THE WMO LEG HAS NO STATION AT SUCRE AT ALL** — the service's full city list carries no Bolivian
  entry — and the honest handling is to drop the climate sentences rather than to assert one. The first
  draft ended on *the World Meteorological Organization's city service carries no station here*, marked
  to the UNdata profile, which does not say it; **a negative claim needs a source for the negative**, and
  the sentence was replaced with a geological one the paper does carry. Sucre's card rests instead on
  Cal Orcko, whose main track-bearing surface is 25,000 m² of lacustrine limestone tilted to 70° with 313
  trackways on nine levels.
- **A BROWSER USER-AGENT TRIGGERED A BOT WALL THAT A PLAIN TOOL UA PASSED,** which is the reverse of the
  usual advice and cost an hour. Every OpenEdition article answered a Chrome UA with an Anubis
  proof-of-work page at status 200 and answered `FolioReach/1.0` with 200 KB of real text. **Before
  recording a host as walled, try a plain agent.** `check-reach.js` reports OpenEdition OK and was right.
- **AND COMMONS RATE-LIMITS A BURST HARD ENOUGH TO LOOK SHUT.** Four `suggest-image.js` runs in a row
  took the search endpoint to non-JSON refusals for several minutes while a single spaced request
  answered. The picture repair planned for this session was parked rather than recorded as blocked —
  which is `check-reach.js`'s own `BUSY` finding met in the field.

## What C13 found

- **THE CONSTITUTION LEG ANSWERED FOR FIVE OF SIX, ITS BEST SHOWING OF THE PASS, AND TWO OF THE FIVE ARE
  OUTCOMES THE EARLIER BATCHES HAD NOT MET.** **The Cambodian text gives its capital a legal calendar of
  its own**: article 6 names the city, and then article 93 brings a promulgated law into force there ten
  days after promulgation and throughout the rest of the country after twenty — a constitution in which
  the capital is legally ten days ahead of everywhere else, which is the first clause the pass has found
  that gives a capital a different *rule* rather than a different status. **And the Dutch text names its
  capital once, for a ceremony**: article 32 requires the King to be sworn in and inaugurated at
  Amsterdam at a public joint session of the two Houses, and says nothing else about the place — the
  government sitting at The Hague, exactly as the UNdata footnote says. A constitution can therefore name
  a capital without seating anything in it.
- **AND THE ZIMBABWEAN TEXT IS C12's CHILE OUTCOME ONE STEP FURTHER ON.** C12 recorded a constitution
  that names its capital only as a REGION, in a clause about something else; this one names *Harare
  Metropolitan Province* among the ten provinces in section 267 and then, in section 269, constitutes a
  metropolitan council chaired by the mayor of the City of Harare with the mayor of the province's
  second-largest urban local authority as his deputy — so the city is named twice, as a province and as
  a local authority, and never as the capital. **Read the whole text before recording the leg as silent**:
  a search for the word *capital* finds nothing here, and the city is in the document five times.
- **THE ECUADORIAN TEXT IS THE FULLEST TREATMENT OF A CAPITAL THE PASS HAS MET.** Article 4 names the
  city, and then four further articles seat the National Assembly, the National Court of Justice, both
  electoral bodies and the Constitutional Court there by name — every branch of the state fixed in one
  place by the constitution rather than by practice.
- **THE ONE FAILURE IS A TOTAL SILENCE, WHICH IS C6's OUTCOME AND IS WORTH STATING ON THE CARD.** The
  Guinean text of 2010 contains *Conakry* zero times and *capital* zero times, while fixing the flag's
  three bands, the anthem and the motto in its first article. An absence checkable against the cited text
  is a fact about the state's own founding document, so `gw-575` says so rather than leaving the leg empty.
- **A SIXTH WAY THE WMO LEG FAILS: A RECORD THAT CARRIES PRECIPITATION AND NO TEMPERATURE AT ALL.**
  Porto-Novo's station reports rainfall and rain days for 1981–2010 with every one of its twelve
  `maxTemp` and `minTemp` fields null, so the card's climate sentences are about water only. **Check the
  fields before drafting the heat sentence**, not after: the record is present, the period is stated, and
  it looks like every other city's until the numbers are read.
- **READING A FINISHED CARD BACK CAUGHT A FACT THAT EVERY CHECK PASSES.** The Amsterdam draft called
  February the driest month, which is what a reader of the WMO table expects; April is lower — 41.0 mm
  against 43.4 — and the superlative was simply wrong. Nothing in the pipeline can see this: the figure
  was real, the source was right, the marker pointed at it, and the sentence was inside the word budget.
  **A superlative drawn from a twelve-row table has to be taken from the whole table.**
- **CROSSREF SETTLED A NAME THE PDF's OWN TEXT LAYER COULD NOT.** The Quito geosites paper extracts as
  “Theo Þ los Toulkeridis”, the ligature having been mangled; the record gives **Theofilos
  Toulkeridis**. C12's rule — verify every author list against Crossref before writing the JSON — caught
  nothing wrong this time in eleven works, which is what it looks like when the rule is being followed
  rather than when it is not needed.
- **SIX OF THIRTY CITATION URLS ANSWER 403 FROM THIS SANDBOX AND ALL SIX ARE REAL.** Five are MDPI and one
  is IWA; every one resolves in Crossref and every MDPI paper was read in full at
  `res.mdpi.com/d_attachment/<journal>/<journal>-<vol>-<art>/article_deploy/<journal>-<vol>-<art>.pdf`,
  which serves the same PDF the blocked landing page offers. **A 403 from a publisher is a fact about this
  container, not about the citation**, and the shipped corpus already cites five MDPI papers by DOI.

## What C12 found

**EVERY AUTHOR LIST DRAFTED FROM A SEARCH RESULT WAS WRONG, ALL NINE OF THEM.** The drafts were
written with the authors taken from DOAJ listings, abstracts and reading pages, and checked against
Crossref before applying rather than after: **not one matched.** The paper behind `gw-565`'s river is
by Nambatingar, Clement, Merle, Mahamat and Lanteri and the draft said Ngar-One, Lallemant, Adoum and
Malloum; `gw-565`'s landscape source has a **single** author, Mounsi Febo, against three invented
ones; `gw-566`'s fault paper is Lamperein-Polo, Vidal-Páez and Pérez-Martínez against two invented
names, in a different issue, a different year and a different language; `gw-568`'s sprawl paper is
Hassan and five colleagues against three invented; `gw-570`'s subsidence paper is García-Lanchares and
four colleagues against three invented. **The failure is not carelessness about one field, it is that
a plausible author list is the easiest thing in a citation to produce and the hardest thing in it to
notice.** CLAUDE.md's instruction — run `check-citations.js` BEFORE writing a card's JSON, not after —
is the whole of the lesson, and on this batch it was the difference between a clean apply and nine
fabricated bylines under six cards at the citation bar.

**…AND THE ONE NAME CROSSREF COULD NOT CHECK NEEDED THE JOURNAL'S OWN ARCHIVE PAGE.** `gw-567`'s
heat-island paper is in a Romanian university annals with no DOI, so it is UNCHECKED by definition,
and its PDF drops diacritics: the author line extracts as `Marin VL DUCU, Dumitru T TEA,
Carmen-Sofia DRAGOT`. Three glyphs are missing and no amount of reasoning says which. The journal's
own category page for 2007 prints the line properly — **Marin Vlăducu, Dumitru Tâştea, Carmen-Sofia
Dragotă, Gheorghe Kucsicsa, Ines Grigorescu** — and the middle name is one nobody would have guessed.
**A PDF's text layer is a witness, not the record; the publisher's own index page is the record.**

**THE MDPI ARTICLE PAGE IS WALLED HERE AND ITS FILE HOST IS NOT.** `www.mdpi.com` answers 403 to this
container on both the article and its PDF path, and `res.mdpi.com/d_attachment/<journal>/<journal>-<vol>-<art>/article_deploy/<file>.pdf`
serves the whole paper. Five of this batch's sources were read that way. **The DOI is still what is
cited**, because it is the address a reader's browser opens and a Chicago note wants; the 403 is this
sandbox's bot wall and is not a paywall, which is the distinction `docs/artefact-citation-plan.md`
insists on. The same reading also confirmed that a 403 at `doi.org` is the DESTINATION refusing, not
the resolver.

**AND AN INCOMPLETE CERTIFICATE CHAIN IS NOT A CLOSED HOST, WHICH THIS BATCH MET FOR THE SECOND TIME.**
`polipapers.upv.es`, which serves `gw-566`'s fault paper, fails TLS verification with *unable to get
local issuer certificate*. The leaf's own Authority Information Access extension NAMES the missing
intermediate; fetching it and appending it to the bundle opens the host, exactly as it did for
`psychclassics.yorku.ca` (see `docs/psychology-card-plan.md`):

    openssl s_client -connect <host>:443 -servername <host> -proxy "${HTTPS_PROXY#http://}" -showcerts </dev/null \
      | awk '/BEGIN CERT/{n++} n==1' | openssl x509 -noout -text | grep 'CA Issuers'

**Never `-k`, and never `NODE_TLS_REJECT_UNAUTHORIZED=0`.** The citation uses the article's DOI rather
than the publisher URL, which is better in any case.

**THE CONSTITUTION LEG PASSED FOUR OF SIX, ITS BEST SHOWING SINCE C8, AND THE TWO FAILURES ARE BOTH
NEW.** Chad names the capital in **article 8**, in the same breath as the flag, the motto, the anthem
and the national holiday; Romania in **article 14**; Senegal in **article 2**, adding that the capital
*may be transferred to any other place on the national territory*; Guatemala in **article 231**, which
makes the city and its area of urban influence one metropolitan region. **Somalia is a TWELFTH
outcome: a constitution that declines to settle the question**, its article 9 leaving the status of the
capital to the constitutional review process and to a special law of the two houses. **Chile is a
THIRTEENTH: a constitution that names the city only as a REGION, in a clause about something else** —
*Santiago* appears twice in the whole text, both times as the Metropolitan Region in the rules for
electing indigenous representatives, and never as the seat of government.

**AND THE WMO LEG FAILED A FIFTH WAY: NORMALS WITH NO PERIOD.** Guatemala City's entry carries a full
set of monthly figures from INSIVUMEH and states no `datab`/`datae` at all, where the other five give
1961–1990, 1981–2010 or 1963–1990. The figures are citable and the citation simply cannot say what
years they average, which is stated rather than guessed at.

**A LANDSCAPE PAPER IS AUTHORITATIVE ABOUT THE LANDSCAPE AND NOT ABOUT THE ADMINISTRATION.**
`gw-565`'s source is excellent on the Chari and the Logone, the 90 per cent of Lake Chad's basin they
supply, the founding of Fort-Lamy in 1900 and its 17.29 square kilometres in the 1950s — and it files
the colony under **Afrique-Occidentale française**, which is the wrong federation, and dates the
renaming to 1975, which disagrees with the usual 1973. Both were left out of the card rather than
repeated: the paper was used for what it studies. **Read a source's incidental claims as incidental.**

**AND THE AUDIT REPORTED TWELVE CARDS FOR NAMING THEMSELVES.** Rule 2's word boundary was added for a
capital whose name is a PREFIX of its country's — *Tunis* inside *Tunisia* — and it does nothing for
the mirror case, a capital whose name CONTAINS its country's as a whole word: **Guatemala City,
Panama City, Kuwait City, Mexico City**. The grid's first row is Country, so each was reported for
repeating a value it had never printed, on the strength of the bolded answer term the house style
REQUIRES an abstract to open on. The answer term is masked before the grid test now, and **only
before that test** — masking it in the shared plain text also moved rule 1 from 153 findings to 150,
because a few capitals are named Washington, which is a different question with a different answer.

## What C11 found

**THE CONSTITUTION LEG FAILED ON FIVE OF SIX, WHICH IS THE WEAKEST SHOWING OF THE PASS.** C4 called it the weakest
of the five legs at four of six failing; here only **Kazakhstan** names its capital outright (article 2: the capital
shall be the city of Astana, its status to be fixed by constitutional law). Burkina Faso's text of 2015, the Malawian
of 2017 and the Zambian of 2016 name no capital at all and carry no *National capital* topic tag either; the Republic
of China's text of 1947 names none and provides only that the National Assembly shall meet **at the seat of the
Central Government** — C4's Iranian case, a sentence about the seat that names no city. **AND SRI LANKA IS AN
ELEVENTH OUTCOME: a clause that names the city and does not make it the capital.** Its Ninth Schedule excludes "the
city of Colombo, Sri Jayewardenepura, Kotte, and their environs" from the provincial councils' law-and-order powers —
a real, citable clause about the place, and not a capital clause. The card is carried by **UNdata's footnote and the
Commonwealth Secretariat's Key Facts instead**, which between them state the functional split (Colombo executive and
judicial, this city legislative) that no constitutional text does.

**AND WHERE FOUR OF THE FIVE LEGS FAIL, THE CITY'S OWN GOVERNMENT ANSWERS FOR ALL OF THEM** — G16's Hong Kong
finding at capital scale. **Taipei has no UNdata profile** (`tw` returns a 75-byte 500, as `xk` and `ax` do) and its
WMO entry is the third variety of that leg's failure: filed under the China Meteorological Administration, it carries
**rainfall for every month and no temperature at all**, the mirror of C7's Luanda, which carried temperature and no
rainfall. What replaced both is `english.gov.taipei`, whose **Geographical Overview** states the three faults crossing
the city, the three kinds of landform, the three rivers and a full year of station figures, and whose **History** page
runs from the Ketagalan through the Qing land grants to the trading quarters. `cwa.gov.tw` refuses the connection and
`tao.cgu.org.tw` is 403, so the city site is not a convenience but the only way in.

**AND THE WMO LEG FAILED A FOURTH WAY: A COUNTRY WHOSE ONLY STATION IS AT ANOTHER CITY IN THE SAME CONURBATION.**
Sri Lanka's single WMO entry is **Colombo**, about eight kilometres from Kotte inside one continuous built-up area —
which is C9's Yamoussoukro rule at a distance small enough to be tempting. It is still a different city and the card
may not print its normals as its own, so `gw-561` takes its seasons from the open paper that carries its landform
(the south-west monsoon of May to September and the convective inter-monsoon of October and November), and **Lilongwe
has no WMO station at all**, C3's Kinshasa case, its rainfall coming from the same catchment study.

**AND THE COLONIAL ANNUAL REPORT IS A PRIMARY RECORD OF A CAPITAL'S OWN FOUNDING.** No openable modern work found
dates Lusaka's promotion, and the **Colonial Office's *Annual Report … Northern Rhodesia, 1936*** states it on page 7
in one sentence: "The seat of government was transferred from Livingstone to Lusaka in 1935, the official inauguration
of the new capital being arranged to coincide with the ceremonial celebration of His late Majesty's birthday on the
3rd of June." The **1932 report** shows the same capital half built — fifteen houses nearly finished on the new site.
Both are on archive.org with clean OCR and running heads that survive, so the page numbers can be cited. A colonial
administration reporting the movement of its own offices is the record for that fact, which is the same ground the
house rules allow a state's account of an administrative act.

**AND A PERIOD ACADEMIC WORK CARRIED TWO MORE.** Lucien Marc's *Le Pays Mossi* (1909), a Paris doctoral thesis by an
officer who had spent five years in the Ouagadougou cercle, gives both the tradition (Naba Oubri conquered the
country and settled his capital there, first of the Moro Nabas, placed near the middle of the 14th century by counting
three rulers to a century) and the contact history (Krause in 1885, Binger in 1888, a French column in August 1896);
and Davidson's *The Island of Formosa* (1903) gives Taipei's founding in a detail nothing modern matches — three
districts joined into a prefecture in 1878, the city marked out on unplanted farmland north-east of Mengjia, building
begun in May 1879, four gates nearly finished by the end of that year.

**AND THE LANDFORM SOURCE WAS A MINING PAPER, A ZOOPLANKTON SURVEY AND A BLACKFLY RECORD.** C6's rule that a
capital's landform source is usually a hazard paper widens again: Ouagadougou's area, altitude and granite come from
a *Scientific Reports* study of **artisanal aggregate quarrying**; Kotte's marshes, canal depths and 400 hectares of
flood storage from a **zooplankton survey of the Diyawanna Oya**; and Astana's whole river — source, catchment,
gradient, spring flood, concreted urban reach, willow and reed banks, the weir at Koktal-1 — from the **first record
of a blackfly species complex in Central Kazakhstan**. Search the fauna and the extraction, not the geology.

**AND RULE 2 TOOK THE COUNTRY'S NAME AWAY FIVE TIMES OVER**, which on these six is the binding constraint: the grid's
first row is Country, so `gw-560` may not write *Taiwan* even once (the city government's own page opens "the northern
part of Taiwan Island"), `gw-561` may not write *Sri Lanka*, `gw-562` *Malawi*, `gw-563` *Zambia*, `gw-564`
*Kazakhstan*, and three of them may not write *largest* either. **The adjective is safe and the noun is not** —
"Sri Lankan" carries a letter after *Lanka* and does not match, which is what makes several of these sentences
writeable at all.

**ACCESS.** `link.springer.com`, `sciencedirect.com`, `mdpi.com`, `onlinelibrary.wiley.com`, `journals.openedition.org`
(Anubis again), `tao.cgu.org.tw`, `digitalcommons.usf.edu`'s `viewcontent.cgi`, `unece.org`, `cwa.gov.tw`,
`lawnet.gov.lk`, `astana.gov.kz` and `adilet.zan.kz` are all shut. **`agupubs`/`doi.org` 403s the GeoHealth article
that PMC serves whole**, so it is cited at its PMC copy. **AJOL is open and its search is usable**, which is what
found the Ouagadougou reservoir chemistry and the Lilongwe catchment study; **`sljol.info` 403s its own root while its
per-journal subdomains answer**, so an OUSL Journal article is reached at `ouslj.sljol.info`. **`pressto.amu.edu.pl`
and `czasopisma.uwm.edu.pl` are open**, and the first carries the Astana history nothing else did.
**AND A WALLED ELSEVIER PAPER'S REPOSITORY COPY CAN BE A CIPHER**: the 2009 Ouagadougou flood study is deposited at
White Rose and at NERC's NORA, both serve the full 7.5 MB PDF, and **both extract as raw CID codes** — subset fonts
with no ToUnicode map, C5's redalyc case. Ask OpenAIRE for the deposits, then check that the text comes out as words.

**AND THE UNdata CAPITAL FIGURE WAS DATED 2019 ON ALL FIVE PROFILES THAT HAVE ONE**, in a table headed 2025 — the
second unanimous batch after C6. Sri Lanka's is the one whose footnote says something: *Colombo is the capital and
Sri Jayewardenepura Kotte is the legislative capital*, which is the fact the card is about.

**AND THE AUTO-LINKER TOOK A CONVENTION AND A WILDLIFE RESERVE.** `Great_Britain` claims the adjective *British*, so
the Franco-British convention of 1898 linked to a definition that explicitly excludes the United Kingdom — written
round with Marc's own *franco-anglaise*; and **`Sanctuary` in this glossary is ground set apart for a god**, so
Lilongwe's zoned *nature sanctuary* linked to a Greek temenos. `Water`, `Settlement`, `Council` and `Republic` were
written round again, and `Europe`-as-*European*, `Japan`-as-*Japanese*, `Russia`-as-*Russian*, `Plough` on a verb and
`Constitution` for the seventh batch running are recorded rather than fixed.

## What C10 found

**THE CONSTITUTE PROJECT CAN CARRY A DRAFT THAT WAS NEVER IN FORCE, AND ITS OWN PAGE TITLE CALLS IT A
CONSTITUTION.** C3–C9 recorded eight outcomes for the fifth leg — present, absent with a statute in its
place, a bare *National capital* topic tag, a clause naming a different city, silence with nothing to
replace it, a procedure naming no city, a provisional clause, and a clause naming two capitals. Syria is a
tenth kind of answer and the most dangerous of them, because it looks like the first: the project’s only
Syrian text is `Syria_2017D`, the browser tab reads “Syrian Arab Republic 2017 Constitution”, article 17
says *The capital of the state is Damascus* — and the page’s own header line reads **“Draft of 23 Jan 2017
— Presented by Russian officials at Syrian peace negotiations”**. It was never adopted. **Read the header
line, not the tab**, and treat a slug ending in `D` as a draft until the page says otherwise. Damascus
therefore ships with four legs and Le Strange twice, which `check-cards.js` allows and which the pass has
not had to do before.

**AND THE NINTH CONSTITUTIONAL OUTCOME IS A CLAUSE THAT FIXES WHERE THE CAPITAL MAY BE WITHOUT NAMING IT,
BY ITS DISTANCE FROM ANOTHER CITY.** Section 125 of the Australian constitution leaves the seat of
government to parliament but requires it to lie within New South Wales, **at least 100 miles from Sydney**,
on at least 100 square miles granted to the Commonwealth, and adds that parliament shall sit at Melbourne
until it can meet there. So the text that decides the capital names two other cities and not the capital,
and the statute that finally chose the ground — the **Seat of Government Act 1908**, assented to on 14
December — names the *district of Yass-Canberra*, requires at least 900 square miles and, remarkably,
**access to the sea**, which is why the act was amended in 1955 by legislation acquiring lands at Jervis
Bay. The leg answered for five of six this batch, the highest since C8’s ceiling of six.

**AND RULE 2 CAN TAKE A RIVER’S NAME AWAY, WHICH IS THE MIRROR OF `gw-511`’S CASE.** The grid’s first row
is Country, so on `gw-555` the forbidden value is *Niger* — and Niamey stands on the Niger. The card
therefore cannot name the river it is built on, and calls it “the great river of West Africa”; `gw-558`
Bamako is on the same river and merely has to avoid *Mali*, which is easier. **Where a capital’s country
shares its name with the water it stands on, the water is written round**, and there is no fix for it: the
grid really has said the word two inches above.

**AND THE FEDERAL REGISTER OF LEGISLATION IS AN ELEVENTH VARIETY OF 200-STATUS NON-DOCUMENT.**
`legislation.gov.au/C1908A00024/latest/text` answers 200 with 76 KB and the word *Yass* appears in it **zero
times**: it is the register’s JavaScript shell, and the act’s words are only in the compilation PDF at
`…/1973-12-31/1973-12-31/text/original/pdf`, which is what is cited. **Grep the served page for a word the
statute must contain before citing a `/text` path.**

**AND THE AUSTRALIAN DICTIONARY OF BIOGRAPHY RESOLVES BY NUMERIC ID AND IGNORES THE SLUG ENTIRELY**, which
is `history.house.gov`’s fault in a new coat: `/biography/griffin-walter-burley-6489` answers 200 and serves
**John Alfred Griffiths**, and `/biography/x-6493` serves Clarrie Grimmett. Every guessed slug is a 200 and
a different person. Its search endpoint 400s and 404s on every form tried, so the ADB was abandoned and
Canberra’s history taken from the constitution and the statute instead — which is the better source anyway.

**AND UNdata’S CAPITAL FOOTNOTE SAID SOMETHING NEW: THAT THE FIGURE ITSELF SHOULD NOT BE TRUSTED.** C2–C9
found footnotes naming an agglomeration, a mega city, a development region, a special city, the boroughs
summed, and a second administrative seat. Syria’s carries footnote *c*, “Est. should be viewed with caution
as these are derived from scarce data” — a caution about the count rather than a description of what it
counts, and worth printing rather than merely reading. **All six capital figures are dated 2019 in a table
headed 2025**, unanimous for the second batch after C6.

**AND THE WMO LEG ANSWERED FOR ALL SIX, WHICH IT HAS NOT DONE SINCE C2**, after C3’s country with no
station, C7’s entry with temperature and no rainfall, and C9’s country whose six stations are all somewhere
else. Two of the six state no normals window (Niamey and Damascus), which is C7’s Luanda case and not a
failure. The data is what carries the climate block everywhere this batch: Canberra’s July mean minimum of
−0.2 °C against a January mean maximum of 27.7 °C, Damascus’s 134 mm of rain a year with **none at all in
July or August**, Pyongyang’s 275.2 mm in July alone.

**AND A HAZARD OR RESOURCE PAPER CARRIED THE LANDFORM ON FOUR OF SIX, THE FIFTH BATCH RUNNING** — a GIS
study of destroyed areas for Damascus (the plain at the edge of the Anti-Lebanon, the Barada, the Ghouta
oasis, the Barada’s 72 km against the Awaj’s 70), a red-flood model for Niamey, a groundwater potential map
for Bamako (the metamorphosed sandstone under more than half the region, aquifers 30–50 m thick), and a
bushfire-smoke study for Canberra. **Caracas’s came from a Chagas review**, whose “Characteristics of the
Caracas Valley” section gives the depression in the coastal range, 870–1,043 m, 22 °C and 870 mm in four
lines. **Search the hazard or the disease, not the geology.**

**AND PYONGYANG WAS THE HARD ONE, AND WHAT ANSWERED WAS A RUSSIAN JOURNAL.** Every obvious route is shut:
MDPI’s *Land* and *Remote Sensing* papers on Pyongyang land cover, `apjjf.org` (403), `scholarspace` and the
*IJKH* carry nothing on the city, and DOAJ’s 82 Pyongyang articles are almost all about nuclear weapons.
**M. A. Stoyakin’s “The Third Capital of Koguryo in Pyongyang,” in the NSU *Vestnik* at `nguhist.elpub.ru`,
is the whole history block** — the move of 427 under King Changsu, the early phase on the Daesong mountain
fortress and the Anhakgung palace, the late one the sources call Chang’an. Its PDF is at
`/jour/article/download/<id>/<file>` and **the `/view/` path of the same numbers serves the viewer HTML
instead**, which pypdf reports as a truncated stream rather than as a wrong page.

**AND A PERIOD BOOK CARRIED THREE OF THE SIX HISTORIES, ONE OF THEM IN FRENCH.** Curtis’s *Venezuela: A Land
Where It’s Always Summer* (1896) gives Losada’s founding of 1567, the valley behind the coast range, and the
1812 earthquake with its 12,000 dead; Le Strange’s *Palestine under the Moslems* (1890) gives the Ghouta as
Mukaddasi and Yakut described it, the Barada canals under Jabal Qasiyun, and the fourteen Umayyad caliphs
of 661–750; and **Gallieni’s *Voyage au Soudan français* (1885) is Bamako before the French post** — a
walled market village held nominally by the Niaré, “premiers maîtres du pays”, whose trade a Moorish family
had taken over, with the treaty of 5 November 1880 that followed. **Its OCR has eaten the page numbers and
mangled the chapter numerals**, so the chapters were recovered by counting `CHAPITRE` headings — and the
count only works once you notice that a French book puts its *table des matières* at the **back**, so the
first twenty headings are the body and the last twenty-three the contents.

**AND `archive.org`’s `/download/` PATH CAN 500 AND THEN WORK.** Curtis’s `_djvu.txt` came back as a 170-byte
nginx 500 page on the first request and as the full 702 KB on the second, from a different mirror host.
**Check the size of what came back before believing a grep that found nothing** — G16’s rule, one host over.

**AND THE AUTO-LINKER TOOK A CHILEAN CAPITAL AND AN AUSTRALIAN FEDERATION.** `Santiago` is the capital of
Chile, so Losada’s *Santiago León de Caracas* linked to a city 5,000 km away — the `Alofi`, `Stanley` and
`Nassau` collision a fourth time, and written round by naming the apostle instead. `Commonwealth_of_Nations`
claims the bare *Commonwealth*, so the land “granted to the Commonwealth” in section 125 linked to 56 modern
states rather than to the federation the clause is about; and `Guinea` claims the adjective, so the *Guinean*
climatic zone linked to a country. **`Lebanon` matching inside “Anti-Lebanon” is recorded rather than fixed**
— the hyphen is a word boundary, G18’s `East_Asia`-in-“South-East Asia” exactly, and the range’s name is
worth more than the link is worth avoiding. `Water` was written round three times (the verb *water*, a
*water-clock* now set as a clepsydra, and a talweg running down to the water), `Council` once (the Council of
the Indies is not Aristotle’s boule), `Republic` once, and `Constitution` recorded for the sixth batch
running. **`Mountain_fortress` is the batch’s one perfect link**: its definition is explicitly the
fortification of the Korean Three Kingdoms, and it landed on Daesong.

## What C9 found

**The recipe held for five of six and the sixth had no weather station at all.** Côte d'Ivoire has six
WMO stations and not one of them is at Yamoussoukro — the nearest, Bouaké, is another city a hundred
kilometres away, and C5's rule that the country is a refusal rather than a preference applies one level
in: **a station in the wrong CITY is as wrong as one in the wrong country**, so `gw-550` is written with
no normals for its own place and takes its seasons out of an open paper instead, as C7's `gw-538` Sana'a
did. What that paper gave was better than a substitute station: an ornithological survey of the city's
lakes states the four seasons by name and month and the mean annual rainfall in its own study area.

**AND THE CONSTITUTION LEG ANSWERED FOR FOUR OF SIX, WITH AN EIGHTH OUTCOME BESIDE THE SEVEN C2–C8
ESTABLISHED: A CLAUSE THAT NAMES TWO CAPITALS, ONE OF THEM HISTORICAL.** Peru's article 49 reads "The
capital of the Republic of Peru is the city of Lima. Its historical capital is the city of Cusco," and
article 198 adds that the capital belongs to no region and is governed by its own metropolitan
municipality — the fullest constitutional treatment of a capital met in the pass after Turkey's. Madagascar
names Antananarivo at article 4, Nepal at article 288 and Cameroon in its very FIRST article, where the
capital is listed beside the flag, the anthem and the seal as a mark of the state. **Ghana's text of 1996
and Côte d'Ivoire's of 2020 name no capital anywhere**, which is C6's silence; unlike C3's Manila and C5's
Paris, no openable statute stands in for either.

**AND UNdata'S CAPITAL FOOTNOTE NAMED A SECOND SEAT FOR THE SECOND BATCH RUNNING.** C8 found Malaysia's
Putrajaya recorded in a footnote and nowhere else; Côte d'Ivoire's says "Yamoussoukro is the capital and
Abidjan is the administrative capital", which is the same arrangement seen from the other end and again
recorded in no other source in the recipe. Nepal's says the figure "refers to the municipality" and Peru's
that it counts the Province of Lima together with the Constitutional Province of Callao. **All six capital
figures are dated 2018 or 2019 in a table headed 2025** — the second unanimous year-gap after C6's.

**AND A HAZARD PAPER CARRIED THE LANDFORM ON FOUR OF SIX, FOR THE FOURTH BATCH RUNNING**: a flood-risk
model for Greater Accra, a landslide and rockfall study of the hills north-west of Yaoundé, a river
metabarcoding survey of the Rímac, and a malaria geography of Antananarivo that divides the city between
erodible slopes and ground below 1,250 m that floods. Two of them carry the finding worth keeping.
**Accra sits in what climatologists call the ANOMALOUS DRY EQUATORIAL region** — which is why a city three
hundred kilometres from the equator records only about 740 mm of rain a year, less than half what Yaoundé
gets — and **Kathmandu's floor is the dry bed of a vanished lake** about 25 km across and once 75 m deep,
filled with lake and river sediment since the late Pliocene, which is what a *Climate of the Past* core
study says in its opening paragraph while being about monsoon vegetation.

**AND THE HISTORY LEG WAS A PERIOD BOOK FOUR TIMES, AND THE BEST OF THEM IS A CAPITAL'S OWN CITIZEN
WRITING IN ENGLISH.** Manuel Atanasio Fuentes's *Lima: or, Sketches of the Capital of Peru* (1866) gives
the founding of 18 January 1535, the town of Jauja it displaced and why, the wooden bridge of 1554 and
the stone one that replaced it, the statue of Philip V thrown down by the earthquake of 1746, and the
plain statement that the ground shakes on average eight times a year. Claridge's *Gold Coast* carries
Accra's three forts and — in its second volume — the sentence this pass most wanted, that **the
headquarters of government were moved there in 1876 "on account of its supposed better climate and the
proximity of the Akwapim mountains"**, a history claim that explains the landform block above it.
Oldfield's *Sketches from Nipal* (1880) gives Kathmandu's sword-shaped plan, its walls and gateways and
the four-year Gorkha conquest from the siege of Kirtipur in 1765 to the fall of Bhadgaon early in 1769;
Sibree's *Madagascar before the Conquest* (1896) gives the meaning of Antananarivo's name, the twelve old
towns, and the old custom forbidding stone or clay inside the city that left it burning twenty, thirty or
a hundred houses at a time. **Claridge counts as ONE author in TWO of a card's sources, which is exactly
what `check-cards.js` allows and no more.**

**AND THE HOLY SEE IS AN OPENABLE ARCHIVE.** `vatican.va` serves every papal homily by date, and the
dedication of the Basilica of Our Lady of Peace at Yamoussoukro — Monday 10 September 1990 — is a primary
record of the event, naming the head of state who raised it and Félix Houphouët-Boigny's generosity in
paying for it, in a city whose own institutions publish nothing openable. **The English path 404s and the
French and Italian ones do not**, so the index at `/content/john-paul-ii/en/homilies/<year>.index.html` is
what settles a slug.

**AND YAOUNDÉ'S GERMAN FOUNDING IS IN NOTHING OPENABLE HERE, WHICH IS RECORDED RATHER THAN GUESSED.**
Persée has 151 articles naming Yamoussoukro and a dozen naming Yaoundé, and its article bodies are PAGE
IMAGES with no text layer, so a search that finds the right article cannot read it; `docAsPDF` is 403.
IMIST answers 302 with an empty body on every path, Érudit's search is a JavaScript shell, `link.springer.com`
still serves a 3 KB challenge under a 200, ScienceDirect 403s an Elsevier gold open-access article, and the
one German account on archive.org (von Morgen, 1893) is Fraktur OCR and unreadable. `prc.cm` IS open and
carries the Centre Region's ten divisions and its 68,953 km², so that card's history is written from what
can be checked and stops there.

**AND THE AUTO-LINKER TOOK THE GULF OF GUINEA.** `Guinea` is a deck answer term claiming its bare name, so
"the head of the Gulf of Guinea" linked to a country 1,500 km away — rule 4's own MASK knows that "Gulf of
X" is not X and `buildGlossIndex` does not. Written round with the latitude the source states instead.
`Water` was written round four times and `Settlement` twice, with `Constitution` recorded rather than fixed
for the fifth batch running; `Grassland`, `Savanna`, `Irrigation`, `Clay`, `Principality`, `Hinduism`,
`Pacific_Ocean`, `Europe` and `Abidjan` all resolved correctly.

## What C8 found

**The constitution leg answered for all six, which is the first unanimous batch — and one of the six names
its capital PROVISIONALLY, which is a seventh outcome.** C3 found the clause missing with a statute in its
place, C4 a bare *National capital* topic tag, C5 a clause naming a different city, C6 silence with nothing
to replace it, C7 a clause that is a procedure. Malaysia's article 154 reads *until Parliament otherwise
determines, the municipality of Kuala Lumpur shall be the federal capital* — and the country has moved half
of the government anyway, which only **UNdata's own footnote** records: *Kuala Lumpur is the capital and
Putrajaya is the administrative capital*. The other five are plain: Ukraine art. 20 closes the article on
the state symbols by naming the city, Poland art. 29 and Mozambique art. 301 are one line each, Uzbekistan
art. 6 the same, and Saudi Arabia's Basic Law names the capital in article 1 and puts the Shura's seat there
in article 12. Against C3–C7's third-to-two-thirds, six of six is the batch to remember as the ceiling
rather than the norm.

**A CITY PORTAL THAT LOOKS MUNICIPAL AND IS NOT.** `kualalumpurcity.my` carries a dated historical timeline
of Kuala Lumpur — 1857, the Klang and the Gombak, the Kapitan Cina, the 1880 move of the Residency — exactly
the shape of the city institution the recipe's fourth leg asks for, and it is a **commercial city guide**
with an *Advertise & Partnerships* page and no mention of the city hall anywhere in it. **Read the footer
before citing a city site**; `dbkl.gov.my` answers and publishes nothing usable, while `arkib.gov.my` (the
national archives) and `jmbras.org` both refuse the connection. What carried that card instead was a
**hazard paper about a heritage district** — D'Ayala et al. on flood vulnerability in Kampung Baru — plus
Swettenham's own 1907 account, written by the man who ran the administration and read as the witness he is.

**AND PMC SERVES A reCAPTCHA CHALLENGE UNDER A 200, WHICH IS THE TENTH VARIETY OF 200-STATUS
NON-DOCUMENT.** Fetched with a short user-agent, `pmc.ncbi.nlm.nih.gov` answered 200 with **21,281 bytes**
of Google challenge page; the same URL with a full browser user-agent answered 200 with **148,853 bytes** of
article. It is intermittent, and it is indistinguishable from a real answer to any check that reads only the
status code. **Retest with a full user-agent before treating a PMC copy as lost** — this is the route C1
established for everything walled at its publisher, so losing it would cost far more than one citation.

**A NATIONAL INSTITUTE'S OWN ENCYCLOPEDIA IS THE WAY INTO A CITY WHOSE GOVERNMENT IS SHUT.**
`kyivcity.gov.ua` is 403 and `st-sophia.org.ua` refuses, where the **Institute of History of Ukraine**
publishes the *Encyclopedia of the History of Ukraine* in full, and its Kyiv article is signed by three
named authorities, carries a bibliography of its own, and is prefaced by the site's own preferred citation.
That is the encyclopedia test the glossary pass settled — cite one that cites its sources — met by a
national academy rather than a publisher. **Its short permalink fails TLS from here** (`https://www.history.org.ua/?termin=…` returns nothing while the `http` form answers), so the citation
uses the long `resource.history.org.ua/cgi-bin/eiu/history.exe?…` address, which serves over https and
carries none of the characters `SRC_URL_RX` stops at.

**AND THE HAZARD PAPER CARRIED THE LANDFORM ON FOUR OF SIX, FOR THE THIRD BATCH RUNNING** — a groundwater
and landslide review of the Kyiv-Pechersk Lavra, a flood-risk study of the Vistula reach, a seismic risk
assessment of Tashkent's housing, and a flood-vulnerability study of Kampung Baru. The Lavra paper is the
one to copy: written about a monument, it describes the loess plateau at 170–198 m, the 80 m ravine that
splits it, slopes of 23–26° and the first floodplain terrace below them, which is the whole of Kyiv's
ground in one Study Site section. Where no hazard paper existed the answer was **a national agency's own
geology** — the Saudi National Center for Vegetation Cover's *Geology of the North Riyadh Geopark*, 7.9 MB
of Jurassic stratigraphy that names Wadi Hanifah outright — and **a landfill-siting paper** for Maputo,
whose criteria sections describe the bedrock, the soils, the dunes and the slope one after another.

**AND `nature.com` IS OPEN HERE**, serving a 2026 *Scientific Reports* article in full at 426 KB, where C1
recorded it 303ing to an identity-provider cookie endpoint. Shut this batch: `matec-conferences.org` and the
rest of EDP Sciences (403), De Gruyter's *Open Geosciences* (202 with an empty body), `link.springer.com`
(a 3 KB challenge under a 200), ScienceDirect (2.7 KB), `pgi.gov.pl`, `um.warszawa.pl`, `darah.org.sa`,
`rcrc.gov.sa` and `diriyah.sa`. Open: Copernicus, PLOS, `journals.iaepan.pl`, `periodicals.karazin.ua`,
`acquesotterranee.net`, `muzeumwarszawy.pl`, `1944.pl`, `scielo.org.za`, `culture.pl` and archive.org.

**AND A FIGURE THE SOURCES DO NOT STATE IS THE ONE TO CATCH IN DRAFT.** Tashkent's climate sentence first
read *of which barely a fifth falls between June and September*; the WMO's own months give 17.1 mm of 419,
which is a twenty-fifth. Nothing in the pipeline can see an arithmetic claim made on top of a source — the
citation is real, the marker is right, the sentence is wrong — so **a proportion computed while writing has
to be computed again before committing**, or written as the source states it. It ships as *next to none of
that falls between June and September*.

**AND A PARENTHETICAL GLOSSARY KEY CLAIMS NO BARE NAME, BUT ITS ALIASES DO.** `Tian_(Chinese_religion)`
carries the explicit aliases `T'ien` and `Tien`, so **Tashkent's Tien Shan linked to the Chinese sky
deity** — written round by using the modern spelling *Tian Shan*, which the key does not claim. Three more
went the same way: `Commonwealth_of_Nations` claims the bare *Commonwealth*, so the Polish-Lithuanian
Commonwealth linked to an association of 56 modern states; `Turkey` claims *Turkish*, so a Turkic nomad of
the Middle Ages linked to the modern republic; and `Great_Britain` claims *British* for the fourth time in
this pass. `Water`, `Settlement` and `Council` were written round again — the last because in this glossary
a council is Aristotle's boule and the Shura is not one — with `Constitution` and `Russia`-as-*Russian*
recorded rather than fixed.

## What C7 found

**THE WMO LEG CAN FAIL, AND IT FAILS TWO DIFFERENT WAYS.** C3 recorded that some countries have no
WMO station at all; **Yemen is another**, so `gw-538` is the second capital card written with no
climatological normals for the city and the first in the capital half where the climate had to come
out of the same kind of open paper as the landform — Wilby and Yu's *Rainfall and temperature
estimation for a data sparse region*, whose title names no country and which gives the highland belt
its altitude band, its two rainy seasons and the range of its annual totals. The second failure is
quieter: **an entry can carry temperature and no rainfall at all.** Luanda's twelve months give
maxima and minima and a null for every rainfall figure, so a script that sums them reports an annual
total of zero — and neither Luanda's entry nor Kabul's states a normals window. **Read the monthly
fields; do not trust a total computed from them.**

**THE FIFTH LEG ANSWERED FOR FOUR OF SIX AND ADDED A SIXTH OUTCOME.** C2 found the clause present,
C3 absent with a statute in its place, C4 a bare *National capital* topic tag, C5 a clause naming a
different city and C6 silence with nothing to replace it. Argentina's is a new shape: **article 3
provides for a capital by a special law of Congress, after a province has ceded the territory to be
federalised, and names no city** — a clause that is a PROCEDURE rather than a designation, and the
procedure is itself the fact worth citing, since it explains why the constitution of a country whose
capital has not moved in a century still declines to name it. Morocco's 2011 text is C6's silence
exactly: *Rabat* appears **zero times**, there is no topic tag either, and nothing openable stands in
for it, so that card is written without the leg and takes a fifth source elsewhere. The other four
are clean — Afghanistan art. 21, Yemen arts. 66 and 157, Angola art. 20, and **Canada's section 16 of
the Act of 1867, the strongest on the shelf after Turkey's**: "Until the Queen otherwise directs, the
Seat of Government of Canada shall be Ottawa."

**AND THE CONSTITUTE SLUG NAMES THE LATEST COMPILATION, NOT THE FOUNDING TEXT.** `Canada_1982` is a
404 where `Canada_2011` serves the Constitution Act of 1867 with everything since bound in after it —
G16's rule about grepping an index's own hrefs, one site over.

**FOUR OF THE SIX LANDFORM SOURCES ARE A HAZARD PAPER AGAIN** (C6's finding, held): a basin-level
flood-risk analysis for Buenos Aires, a tsunami vulnerability assessment for Rabat, a slope-stability
map for the wadis north-west of Sana'a and a lagoon-sediment health study for Luanda. **Where a
capital has no hazard paper, look for the national survey's own report**: `pubs.usgs.gov` is open,
and its *Conceptual Model of Water Resources in the Kabul Basin* gives the altitudes of the central
plains, the Paghman fault scarp, the ranges, the rivers and the annual precipitation and evaporation
in one document. Ottawa's came through PMC — a *Groundwater* paper on the Champlain Sea muds that
dates the sea's inundation of the valley to ~12,800–10,400 cal BP and puts the Leda clay at 98 m.

**A PERIOD BOOK CARRIED THREE OF THE SIX HISTORIES** — Playfair's *A History of Arabia Felix or
Yemen* (1859), Elphinstone's *An Account of the Kingdom of Caubul* (1842) and Monteiro's *Angola and
the River Congo* (1875) — and two things about that route are worth carrying. **The `_djvu.txt` file
name is not derivable from the identifier**: `india.history.resource.107503` serves its text as
`107503_djvu.txt`, so a composed `<id>_djvu.txt` address 404s and the real name has to be read off
`archive.org/metadata/<id>`. And **a period book's FIGURE may be wrong where its DESCRIPTION is
sound**: Playfair puts Sana'a at "four thousand feet above the level of the sea" where the city
stands above 2,200 m, so the valley's length and breadth and Jabal Nuqum are what the witness is
trusted for and the altitude band comes from the modern paper instead.

**AND THE CITY'S OWN INSTITUTION ANSWERED TWICE.** The Buenos Aires city government's historical
museum publishes both foundations, the cabildo, the 250-block grid, the three thousand inhabitants
and the 1776 viceroyalty in one page; and **Parks Canada's national-historic-site page is the same
kind of source** — G20's Parks Australia finding one country over — carrying Colonel By's arrival in
1826, the start of work in 1827, the labourers and the malaria, the opening in the summer of 1832,
the 47 locks over 202 km and the parliamentary inquiry that met the builder instead of an honour.

**UNdata'S CAPITAL FOOTNOTE PAID A SIXTH TIME, AND NAMED TOWNS TWICE**: Rabat's figure is "Including
Salé and Temara" and Luanda's "the urban population of the province of Luanda", with Buenos Aires's
"Refers to Gran Buenos Aires", Ottawa's "the Census Metropolitan Area" and Sana'a's "the urban
agglomeration". **All six are dated 2019 in a table headed 2025 — the second unanimous batch running.**

**ÉRUDIT IS OPEN**, which is a large find for anything Canadian or French-language: it carries
*Géographie physique et Quaternaire*, the journal of record for the Champlain Sea, along with much
else, and its article PDFs answer directly. Its SEARCH page is a JavaScript shell, so it is reached
by a site-restricted web search rather than by its own form. **DOAJ still needs field queries with
spaces round the operator** (C4): a free-text query returns 0 where
`bibjson.title:Rabat AND bibjson.abstract:coastal` finds the tsunami paper first.

Shut this batch: `mdpi.com` 403; `link.springer.com` serves a 3 KB challenge under a 200 on its own
`/content/pdf/` path; `tandfonline.com` and `facetsjournal.com` sit behind Cloudflare; OpenEdition is
behind the Anubis wall again; `e3s-conferences.org` 403; `revistas.ute.edu.ec` serves a challenge;
`revista.ismm.edu.cu` 503; **`squjs.squ.edu.om` serves its abstract page and 403s its own PDF**, so
that citation rests on what the abstract states; `lop.parl.ca` 403, `geoscan.nrcan.gc.ca` and
`www.canada.ca` refuse the connection while **`parks.canada.ca` answers**, and NRCan's open-science
repository is a JavaScript shell whose API path serves the same shell.

**AND THE AUTO-LINKER TOOK A CARIBBEAN CAPITAL**: `Nassau` is the capital of the Bahamas, so
Monteiro's Count of Nassau, who sent the fleet that took Luanda in 1641, linked to a town in the
Atlantic — the `Alofi` and `Stanley` collision for a third time, written round by naming the fleet's
commander instead. `Water` was written round twice more, `Settlement` twice (its definition is
explicitly the archaeologists' dwelling place, which a 19th-century canal town is not) and `Republic`
once; `Constitution` claiming the bare surface is recorded rather than fixed for the sixth batch
running.

## What C6 found

**A FIFTH OUTCOME FOR THE CONSTITUTION LEG: THE TEXT IS SIMPLY SILENT, AND NOTHING STANDS IN ITS
PLACE.** C3 found the clause missing on two capitals and a statute in its stead; C4 found a bare
*National capital* topic tag that is not a clause; C5 found a clause naming a different city. Here
the Korean text of 1987 contains *Seoul* **zero times** and the Sudanese constitutional document of
2020 names no capital either — and unlike Tokyo or Manila **no openable statute replaces it**, so
those two cards are written without the leg at all and take a fifth source elsewhere. The Korean
Constitutional Court's own English site serves its home page and then drops the connection on
`/site/eng/decisions/casesearch/caseSearch.do`, so its case law could not be read from here. Where
the leg does answer it answers plainly: Uganda's article 5 (Kampala, *located in Buganda*,
administered by the Central Government), Spain's section 5, Algeria's article 5, and Iraq's articles
11 and 124, the last making the city within its municipal borders a governorate of its own that may
not merge with a region. **Four of six** — the same proportion C4 measured, arrived at by a
different route.

**AND UNdata'S CAPITAL FOOTNOTE PAID A FIFTH TIME, ONCE BY NAMING THE TOWNS IT SWALLOWED.**
Kampala's figure "includes Kira, Makindye Ssabagabo and Nansana" — three neighbouring towns folded
into the capital's count and listed by name — where Algiers's "Refers to the Governorate of Grand
Algiers" and Seoul's to "Seoul Special City". **And all six are dated 2019 in a table headed 2025**,
which is the first batch where the year-gap is unanimous rather than a case or two. **Sudan's
profile has no `Surface area` field at all**, which C9 of the glossary pass recorded for the country
term and which turns up here again: the only one in the deck that omits one.

**A LANDFORM PAPER FOR A CAPITAL IS USUALLY A HAZARD PAPER, AND THAT IS HOW TO SEARCH FOR ONE.**
Four of C6's six landform sources are risk studies whose Study Area is a description of the ground:
a landslide susceptibility zonation for the July 2011 Seoul event (Mt Woomyeon, 293 m of Precambrian
banded biotite gneiss under oak forest, 147 shallow slides in one storm), a tsunami risk scale for
the Bay of Algiers (the bay 30 km east to west, the old quarter on mica schist with lenses of
limestone), a subsidence study of the Madrid aquifer (a tectonic depression holding a 2,500 km²
Tertiary detrital aquifer between the Sierra de Guadarrama and the alluvium of the Manzanares and
Jarama) and a dust-storm analysis over Baghdad. **Search the hazard, not the geology** — a city has
papers about what threatens it long before it has papers about its rocks.

**THE PERIOD BOOK CARRIED FOUR OF THE SIX HISTORIES, AND CAN CARRY THE LANDFORM TOO.** Churchill's
*The River War* (1899) gives the confluence as "the point on which the trade of the south must
inevitably converge" and the Mahdi's move across the White Nile to Omdurman because the marshes
about the older town "did not commend itself"; Cunningham's *Uganda and Its Peoples* (1905) gives
Mengo as the kabaka's capital with the Lukiko sitting there and the missions on the neighbouring
hills; Thomas-Stanford's *About Algeria* (1912) gives Roman Icosium, the Arab town founded in the
10th century, the Moors who settled about 1500 and took to piracy, and the landing of 35,000 men at
Sidi Ferruch on 14 June 1830 — **and, in the same book, the wooded hills of the Sahel and the Tell
"once the granary of Rome"**; Le Strange's *Baghdad during the Abbasid Caliphate* (1900) gives
al-Mansur laying out the round city in AH 145 / 762 CE just above where the Sarat canal ran in, the
Nestorian monasteries on the spot, and *Madinat as-Salam* as the mint name on Abbasid coins.

**AND AN `archive.org` `_djvu.txt` THAT ANSWERS 200 IS NOT ALWAYS OCR.** The item
`BaghdadDuringTheAbbasidCaliphateFromContemporaryArabicAndPersian` serves 215 KB under that path and
every word of it is the catalogue description — a chapter list that reads exactly like the book —
while `bub_gb_rdcoAAAAYAAJ` serves the real 833 KB. The standing rule is to grep for a word the book
must contain; **the cheaper tell is the SIZE against the book's length.**

**AND THE CITY'S OWN INSTITUTION CAN BE THE BEST SOURCE FOR ONE LEG AND USELESS FOR ANOTHER.** The
Seoul Metropolitan Government's history page, compiled by its Historiography Institute, carries
Wiryeseong and the Baekje earthworks at Pungnaptoseong and Mongchontoseong, the 493 years the
kingdom held the city, the fall to Goguryeo in 475, Yi Seong-gye's move to Hanyang in 1394, the
palaces of 1395 and 1405 and the 18 km wall over Bugaksan, Naksan, Namsan and Inwangsan — G16's Hong
Kong finding at full strength. Its *geography* page is a 404 and its *climate* page is tourist copy
with not one figure in it.

**AND A DOI CAN 503 WHILE ITS ARTICLE PAGE IS 200.** `10.5944/etfi.10.2017.15940` refused on every
attempt and `revistas.uned.es/index.php/ETFI/article/view/15940` answered, so the Maŷrīṭ paper is
cited at the page that opens while its Crossref record was still read for the authors and
pagination. **Cite what opens.**

**HOSTS.** Open: `nature.com`, `journals.plos.org`, `ajol.info`, `piahs.copernicus.org`,
`nhess.copernicus.org`, `tsunamisociety.org`, `journals.iaepan.pl`, `jstage.jst.go.jp`,
`findingspress.org`, `revistas.uned.es`, `bage.age-geografia.es`, `mjs.uomustansiriyah.edu.iq`,
`english.seoul.go.kr`, `gutenberg.org`, `archive.org`. Shut: **CSIC's whole journal platform**
(`cultureandhistory`, `informesdelaconstruccion` and `dra.revistas.csic.es` all refuse the
connection, which rules out a great deal of Spanish scholarship), `madrid.es` 403,
`e3s-conferences.org` 403 again, `gtg.webhost.uoradea.ro` and `jdesert.ut.ac.ir` closing
mid-exchange, `igj-iraq.org` answering **202**, `etj.uotechnology.edu.iq` 404ing its own
DOAJ-listed PDF, and **`pam-journal.pl` 404ing both its article and its PDF path** — the same team's
work on the same site is open one journal over at `journals.iaepan.pl`. A `mjs.uomustansiriyah.edu.iq`
PDF is a cipher (fonts subset with no ToUnicode map), so its abstract was read from the HTML.

**AND THE AUTO-LINKER TOOK A CALIPH AND AN EMPIRE.** `Muhammad` in this glossary is the Prophet, so
Madrid's 9th-century emir linked to a life that ends in 632 — written round by keeping the source's
own **Muḥammad I**, which the surface cannot match — and `Rome` is the modern capital of Italy, so
"the granary of Rome" pointed at a city of 4.2 million; written as "the Roman empire" it links
correctly to `Roman_Empire`. `Water` was written round three more times, and `Constitution`,
`Republic` and `Japan` claiming the adjective *Japanese* are recorded rather than fixed.

## What C5 found

**A CONSTITUTION CAN NAME A CAPITAL AND NAME THE WRONG ONE.** C3 found the fifth leg missing on two
capitals in six and C4 on four; C5’s count is three of six — Italy’s article 114 says outright that
“Rome is the capital of the Republic. Its status is regulated by State Law”, Myanmar’s section 50
prescribes Nay Pyi Taw a union territory under the direct administration of the president, and
Colombia’s article 322 organises Bogotá as a capital district of the republic and of its department at
once. France’s text contains the word *Paris* **zero times**, and Kenya’s names no capital either: its
article 200 lets Parliament legislate for “the governance of the capital city” without saying which
city that is, which is C4’s Iranian case again — **a topic tag is not a clause, and neither is a
sentence about the capital that does not name it.** What Kenya does carry is the First Schedule, where
**Nairobi City is one of the forty-seven counties**, so the leg answers for a different claim.
**And South Africa’s answers for a DIFFERENT CITY**: section 42(6) puts the seat of Parliament at Cape
Town, and Pretoria appears in the whole text **not once**. That is a fourth outcome to expect beside
present, absent and a bare topic tag, and on a three-capital state it is the honest one.

**AND UNdata’S CAPITAL FOOTNOTE PAID A FOURTH TIME, ONCE AS THE WHOLE ANSWER.** South Africa’s
footnote *c* is the three-capital arrangement stated outright — “Pretoria is the administrative
capital, Cape Town is the legislative capital and Bloemfontein is the judiciary capital” — which no
other source in the recipe says in one line. Colombia’s footnote counts **four separate nuclei**
(Santa Fe de Bogotá with Soacha, Chía and Funza), Italy’s says the figure “refers to the official
Metropolitan City”, and **four of the six figures are dated 2019 in a table headed 2025**. C4 said to
print a footnote that says something; C5 adds that on a state with more than one capital the footnote
is the one place the arrangement is written down.

**AND A WMO RECORD’S `stationName` CAN NAME ANOTHER CITY ENTIRELY, WITH ONLY THE DATA TO SAY SO.** The
WMO’s Nairobi entry (id 251) carries `stationName: Mombasa` and no normals window at all — and its
numbers are a highland city’s: maxima of 21–26 °C, July nights near 10 °C, and **two rain peaks**, 219
mm in April and 154 mm in November. Mombasa’s own entry (id 520) is 8 °C hotter with **one** peak in
May. So the field is stray and the data is Nairobi’s; the citation names the entry and not the
station, and the check is to fetch the neighbouring city and compare rather than to trust the label.
**Read the numbers before quoting the metadata.**

**WHERE THE HISTORY CAME FROM: FOUR OF THE SIX ARE BOOKS, AND TWO OF THEM ARE THE CITY’S OWN
INSTITUTION.** The Presidency’s page on the **Union Buildings** is a landform source in disguise —
Meintjeskop chosen over Muckleneuk Ridge, under two kilometres from the centre, the highest ground the
city has, the terraces of mountain stone quarried on the spot — and the **National Museums of Kenya**
page on the Nairobi Gallery carries the point from which distances across the country were measured,
the 1913 Native Ministry building, and the colonial courthouse where people accused of entering the
city without a pass were tried. The other four are out-of-copyright books on Project Gutenberg and
archive.org (Okey’s *The Story of Paris*, Lanciani’s *The Ruins and Excavations of Ancient Rome*,
Cunninghame Graham’s life of Quesada) and one open-access press: **ANU Press publishes its whole
catalogue as free PDFs**, and Selth’s *Interpreting Myanmar* dates the designation of Naypyidaw to
November 2005 and gives its distance from Yangon as 327 km — with a footnote saying the 367 km often
quoted is the road distance. **Ask whether a university press is open before hunting for a paper.**

**AND A PERIOD BOOK CAN DATE THE CARD WHEN NOTHING MODERN WILL.** Rome’s five sources between them
carry almost no year a date line can use: the uplift phases are hundreds of thousands of years old,
the radiocarbon dates are BP, the normals are a window and the UNdata figure is census information a
geography date line may not print. What gave the card a sort year was one clause of Lanciani’s —
“the shepherds who occupied the hill in 753 B.C.” — so the line reads `Founded | 753 BCE by tradition`
and the card sorts at −753. **When a capital’s modern sources are all undated, the period book is
where the anchor is.**

**HOSTS.** Open here: `bluepapers.nl`, `press.anu.edu.au`, `ans-names.pitt.edu` (the journal *Names*,
CC BY), `annalsofgeophysics.eu`, `revistas.sgc.gov.co` (the Colombian *Boletín Geológico*),
`journals.uj.ac.za`, `bg.copernicus.org`, `nature.com`, `museums.or.ke`, `thepresidency.gov.za`,
`senat.fr`, `storia.camera.it`, `sanbi.org`, `geoscience.org.za`, `wrc.org.za`, `bogota.gov.co`,
`redalyc.org`, `insee.fr`. Shut: **`e3s-conferences.org` is 403 on every PDF path**, and so are
`legifrance.gouv.fr`, `ogst.ifpenergiesnouvelles.fr`, `pubs.geoscienceworld.org` (the *South African
Journal of Geology*), `hindawi.com`, `journals.sagepub.com`, `journal.maranatha.edu`, `dws.gov.za`
and `gnlm.com.mm`; `myanmar.gov.mm`, `kws.go.ke`, `tshwane.gov.za` and `sahris.sahra.org.za` refuse
the connection and `president-office.gov.mm` answers 522.
**AND TWO ROUTES EARLIER BATCHES RELIED ON HAVE CLOSED**: `journals.openedition.org` is **behind the
Anubis wall again** (N3 recorded it had dropped), which cost a *Physio-Géo* paper on the Paris
quarries; and **`www.unesco.org`’s Man and the Biosphere pages now serve a JavaScript CAPTCHA under a
200**, which is the route G17 named for a country with no CBD profile — a ninth variety of 200-status
non-document, and it did not clear on a retry.

**AND A REDALYC PDF IS A CIPHER.** The *Territorios* article on the canalisation of Bogotá’s San
Francisco river is served by `redalyc.org` at a guessable path (`/pdf/<journal>/<id>.pdf`) and answers
200 with a real 10-page PDF whose fonts are subset with no ToUnicode map: everything but the cover
page extracts as mojibake. It was abandoned rather than deciphered. **`sanbi.org` has its own trap**:
`/gardens/pretoria/wildlife-and-biodiversity/` answers 200 and serves **Kirstenbosch’s** page, breadcrumb
and all — a slug that quietly returns another garden.

**AND THE AUTO-LINKER TOOK SIX, TWO OF THEM ON THE WRONG CONTINENT.** `Monte_Verde` is the Chilean
site, so Lanciani’s quarries “at the foot of the hills now called Monte Verde” on the Roman right bank
linked to a waterlogged settlement in southern Chile; `Santa_Fe` is the capital of New Mexico, so
UNdata’s own spelling *Santa Fe de Bogotá* linked to a town founded in 1610. Both were written round.
`Water` was written round three times again, `Netherlands` claims the adjective *Dutch* (so the Apies
River’s Dutch name linked to a modern country’s area and population — dropped, and the name is
Afrikaans anyway), and `Great_Britain` claims *British* while `Settlement` claims the bare surface, so
one clause about British settlement at Nairobi in 1899 carried two wrong links and was cut. `Council`
is Aristotle’s boule and `Constitution` his politeia; both are recorded rather than fixed, the second
because its own first sentence is a general definition and four write-rounds would buy nothing.

## What C4 found

**FOUR OF THE SIX HAVE NO CONSTITUTIONAL CAPITAL CLAUSE, WHICH MAKES THE FIFTH LEG THE WEAKEST OF THE
FIVE.** C3 found the Constitute Project failing on two capitals in six; C4 ran the same probe and it
failed on four. **Only Türkiye and the Federal Republic name their capital in the constitutional text**
— and the Turkish clause is the strongest on the shelf, article 3 naming the city beside the language,
the flag and the anthem and **article 4 forbidding any amendment to it or even the proposal of one**,
so the choice is among the handful of things that text puts beyond change; the German one is article 22
of the Basic Law, which also gives the federation the task of representing the nation as a whole there.
**Iran’s constitution does not name Tehran** (Constitute tags an article of its own with the
*National capital* topic, which is a topic label rather than a clause — read the sentence, not the tag),
**Thailand’s 2017 text contains the word Bangkok nowhere**, and **Tanzania’s names no city at all**,
speaking instead of “the town which is the seat of Government of the United Republic”. Running the leg
over the whole capital half is now the honest expectation: it answers for about a third of them, and
what replaces it is a statute (C3), a resolution, or nothing.

**AND THE CONSTITUTE PROJECT DOES HAVE A UNITED KINGDOM, WHICH THE COUNTRY HALF SAID IT DID NOT.**
`United_Kingdom_2013` exists and is a 3.4 MB compilation of texts collected from `legislation.gov.uk`,
opening on Magna Carta 1297. It names no capital, so the practical conclusion of the country half stands
— but the entry is there, and it carries a clause about the city itself: **chapter IX, the liberties of
London.** That is where `gw-521` is cited, and at `legislation.gov.uk` rather than through Constitute,
which is the primary text and states its own amendment history: **of the thirty-seven chapters of the
1297 confirmation only three are still law**, I (Confirmation of Liberties), IX (Liberties of London)
and XXIX (Imprisonment contrary to Law), and the page for IX says there are no known outstanding
effects on it. **A capital with no codified constitution still has constitutional facts; they are
statutes, and they are open.**

**THE WMO HAS A STATION FOR ALL SIX**, which C3 could not assume — there is none in the Democratic
Republic of the Congo at all — so the climate leg was uniform again. Two of the six normals are worth
knowing before quoting a figure: **Ankara’s run 1926–2000**, a 75-year window rather than the usual 30,
and **London’s 1981–2010** where Tehran’s and Bangkok’s are 1961–1990. The station name is not always
the city (Tehran’s is Tehran-Mehrabad).

**AND UNdata’S CAPITAL FOOTNOTE PAID FOR A THIRD BATCH RUNNING, ONCE SPECTACULARLY.** **Ankara’s
figure is the sum of eight named boroughs** — Altındağ, Çankaya, Etimesgut, Gölbaşı, Keçiören, Mamak,
Sincan and Yenimahalle — which the footnote lists outright, and **London’s is not the city at all but
the “Urban area (Greater London)”**. Four of the six are additionally footnoted to a year before the
table that carries them (2019 for Tehran, Ankara, Berlin and Bangkok; 2018 for Dodoma), so a capital’s
population in a table headed 2025 is routinely six or seven years old. **Where the footnote says
something, print it**; where it only says a year, one card a batch is enough.

**AND WHERE THE HISTORY LEG FAILS, ARCHIVE.ORG ANSWERS — BUT CITE BY CHAPTER, NOT BY PAGE.** C2’s route
carried Tehran and Bangkok: **Curzon’s *Persia and the Persian Question* (1892)** gives the Safavid
court’s occasional residence, the Afghan sack, Agha Mohammad Khan’s choice of a seat further south than
the Kajar lands at Astarabad, the elevation to metropolitan rank “commonly dated from 1788”, and the
fact that the place has no river and drank through qanats after a diversion of the Karaj was abandoned;
**Carter’s *The Kingdom of Siam* (1904)**, a volume the kingdom published about itself, gives 1782,
Ayutthaya, the east bank, the “Venice of the East” and the canals bridged for tramways. **The DLI scan
of Curzon’s volume 1 has page markers the OCR mangles beyond recovery** — the running head comes through
as `TEHERAX 333` and a grep for them returns nothing — so it is cited at chapter 11, which the chapter
headings do survive well enough to establish.

**AND DOAJ IS SEARCHED BY FIELD, WITH SPACES AROUND THE OPERATOR.** `bibjson.title:Ankara AND
bibjson.abstract:geomorphology` returns one article and the right one; the same query with `+AND+` in
it returns zero, the plus being percent-encoded into a literal. Three of C4’s landform sources came out
of field queries that free text could not find. **Elsevier, MDPI, Taylor & Francis and De Gruyter are
all shut** (403, or 202 with an empty body), so a Heliyon article is cited at its **PMC** copy and a
*Geology, Ecology and Landscapes* one could not be used at all; **Copernicus, Nature, Frontiers and the
Turkish DergiPark and university presses are open**, and `nature.com` needs `curl -L` rather than
WebFetch. **A city’s own institution answered twice** — Berlin’s *Umweltatlas*, whose English
soil-associations map description is the glacial geology of the city in prose, and the German statute
portal `gesetze-im-internet.de`, which serves the Berlin/Bonn Act of 26 April 1994 with its preamble
reciting the Unification Treaty and the Bundestag’s resolution of 20 June 1991.
**But the *Umweltatlas* rate-limits**: a fourth fetch in quick succession returns a 429 whose body is
the words “Calm down”, and the text is on the `map-description` page — the `introduction` and `summary`
pages of the same chapter carry only furniture.

**AND A GEOGRAPHY CARD’S DATE LINE HAS NOWHERE TO PUT A CENTURY.** Tehran’s only firm early date is
Curzon’s hedged “commonly dated from 1788”; had he written only “the close of the eighteenth century”
the card would have had no sort year at all, since `cardYears` reads no century form and the population
figures that would otherwise fill the line are census information the date line may not carry. **Read a
history source for a YEAR, not just for a period**, and check the sort year back before committing.

**AND `Afghanistan` CLAIMS THE ADJECTIVE *Afghan***, so `gw-517`’s eighteenth-century Afghan invasion of
Persia links to a modern country entry that gives its area, population and capital. Recorded rather than
fixed, on the `Islam Khan` reasoning: the write-round costs the sentence its precision. `Water` (the
chemistry term) was written round three times in this batch and `Republic`, `Constitution`, `Citadel`,
`Treaty` and `Venice` all fired correctly.

## What C3 found

**THE ANSWER TERM CAN CONTAIN THE COUNTRY’S NAME, AND THAT IS A PERMANENT RULE-2 CASE OF ITS OWN.**
G18 put `gw-213` Gibraltar, `gw-214` Monaco and `gw-216` San Marino on the permanent list because the
country, its capital and its largest city are one name; `gw-232` Vatican City joined them in G20.
**`gw-511` Mexico City is the mirror of that and the fifth permanent entry**: the grid’s first row is
`Country`, whose value is *Mexico*, and the abstract’s own opening bold answer term contains it, so
the audit fires on the one sentence house rule requires. Measured after the batch, the whole abstract
contains the word once and nowhere else. Nothing can be written round it.

**A CAPITAL WITH NO WMO STATION TAKES ITS CLIMATE FROM THE SAME STUDY-AREA PAPER THAT CARRIES ITS
LANDFORM.** C1 made the WMO the uniform first leg — 3,598 cities — and the index has **no station in
the Democratic Republic of the Congo at all**, so `gw-515` had to be carried another way. The paper
that answered is one open article on Kinshasa’s rainfall record, and it turned out to give the
landform as well: the crescent along the southern shore of Pool Malebo, the flat ground at about
300 m, the N’djili and N’sele, the Arenoferrasol sands over a Precambrian red-sandstone basement that
breaks surface at the rapids, and then the seasons, the annual rainfall and the fact that the rainy
season has been shortening. **Where the WMO has no station, look for the climate in the geology
paper rather than for a second climate source.**

**AND THE FIFTH LEG — THE CONSTITUTION — FAILS ON TWO OF SIX.** C2 promoted the Constitute Project to
the recipe because a constitution says what a capital IS in law. **Japan’s 1946 constitution names no
capital and the Philippine constitution of 1987 names none either**: Tokyo is the capital by the
emperor’s move in 1868 and by nothing written down, and Manila is the capital by **Presidential
Decree No. 940 of 24 June 1976**, which also names the metropolitan region the permanent seat and so
explains the UNdata footnote. **Where the constitution is silent, the statute is the leg** — and for
Manila there are two, since **Republic Act No. 333 of 17 July 1948** had moved the capital to Quezon
City in the first place, which is the fact the card is actually about. Both are open at
`lawphil.net`, where `officialgazette.gov.ph` and `elibrary.judiciary.gov.ph` are shut.

**A THREE-DIGIT CE YEAR IS INVISIBLE TO `cardYears`, SILENTLY.** After `c. 1200s` and `1620s` in C1,
this is the third route to a wrong sort year found in this pass and the quietest: the parser matches
`1\d{3}` or `20\d{2}`, so **`641` and `969` yield nothing at all** and `gw-513` Cairo sorted at
**1168**, the only four-digit year on its own date line. Writing the era explicitly (`641 CE`,
`969 CE`) parses and is house style anyway. **Read the sort year back before committing**, which is
what caught it.

**THE OLD CAPITAL’S HISTORY IS A BOOK AGAIN, AND THE PERIOD AUTHOR IS A WITNESS OR A TRANSMITTER.**
C2’s finding held for all six. `mos.ru` had already failed there; here `egymonuments.gov.eg` answers
but serves its object pages through JavaScript, `inah.gob.mx`’s archaeological-zone pages are a
JavaScript shell, `cdmx.gob.mx` is egress-blocked, and `gob.mx`, `diputados.gob.mx` and
`senado.gob.mx` are 79–1,864-byte shells. What answered was **archive.org**: Stanley Lane-Poole’s
*The Story of Cairo* for Fustat in 641, al-Askar in 751, Ibn Tulun’s al-Qatai about 860, al-Qahira in
969 and the burning of Fustat in 1168; John Foreman’s *The Philippine Islands* for Soliman firing his
own town and Legazpi’s council of 24 June 1571; and **Henry Morton Stanley’s own book for 9 April
1882**, the day his party named the station at Kintamo. **Read the title page**: the Lane-Poole item
is the second edition of 1906, not the first of 1902.

**AND TWO CAPITALS PUBLISH ABOUT THEMSELVES AFTER ALL.** The Tokyo Metropolitan Government’s
*Tokyo’s History, Geography, and Population* carries the landform, the area, the ward and island
figures and a full dated history in one page — the one source of the batch that answers three legs at
once. It is reached at `english.metro.tokyo.lg.jp/w/000-101-007591`, and **its page ids are
unguessable**: the ids are found only by grepping another page’s own hrefs and fetching each to read
its `<title>`.

**J-STAGE IS OPEN AND ITS SEARCH API IS THE WAY IN.** `api.jstage.jst.go.jp/searchapi/do?service=3&text=…`
returns Atom with English and Japanese titles, authors, journal, volume, pages and DOI, and the
`_pdf` path serves the file — which is how Tokyo’s incised-valley fills came from the *Journal of the
Sedimentological Society of Japan*. `link.springer.com` is a 3 KB challenge, so *Earth, Planets and
Space* is unreachable by its own DOI; `sciencedirect.com` is 403; `journals.openedition.org` is behind
the Anubis wall again; `mdpi.com` is 403; and **`ejpasa.journals.ekb.eg` — the Egyptian Knowledge
Bank — refuses the connection outright**, on four consecutive attempts.

**A DOI THAT 403s IS OPEN ONE HOST OVER, AND SO IS A DEAD ONE.** `doi.org/10.1073/pnas.2500095122`
answers 403 through `pnas.org`, so the Templo Mayor obsidian paper is cited at its PMC copy;
`doi.org/10.32454/…` for the Russian geology journal times out where the journal’s own article page
answers 200, so that citation names the article page. **Sweep every citation URL before writing the
JSON**, which is what found both.

**AND THE AUTO-LINKER TOOK A SURNAME.** `Stanley,_Falkland_Islands` carries the explicit alias
**`Stanley`**, so Henry Morton Stanley links to a town of two thousand people in the South Atlantic —
the `Alofi` and `Liancourt_Rocks` collision in its sharpest form yet, a bare common surname claimed by
a capital. It is **recorded rather than fixed**, on C2’s reasoning about `Islam` on Islam Khan: every
write-round removes a man from the founding that is his. `Temple` (a Greek definition), `Water`,
`Council` and `Settlement` all fired again and are already recorded; **`Republic` claims the bare
surface**, so *Republic Act 333* linked to the political form and the sentence now names the act by
its date instead.

## What C2 found

**THE FOURTH LEG IS THE EXPENSIVE ONE, AND FOR AN OLD CAPITAL IT IS AN OUT-OF-COPYRIGHT BOOK.** C1
settled a four-leg recipe — WMO normals, UNdata, an open paper's Study Area, the city's own
institution — and three of those four are uniform. The fourth is not: a purpose-built modern capital
publishes its own founding (the Capital Development Authority's *Islamabad — The Beautiful* carries
the 1958 site commission, the Doxiadis master plan and the 1963 move; the Chamber of Deputies'
*História e Arquivo* carries the Cruls survey, the seats of the Chamber and the inauguration of 21
April 1960), and an OLD capital publishes nothing openable at all. `mos.ru/en` is a 6.6 KB JavaScript
shell, `addisababa.gov.et`, `dhakanorthcity.gov.bd` and `iphan.gov.br` are egress-blocked, `kreml.ru`
answers 404 on every path tried, and SciELO, JSTOR, Project MUSE, MDPI and Wiley are all shut.
**WHAT ANSWERED WAS ARCHIVE.ORG**, exactly as it did for the Korea collection's Hulbert: Bradley-Birt's
*Dacca: The Romance of an Eastern Capital* (2nd ed., 1914) gives Islam Khan's move from Rajmahal in
1608, the rejection of Gonakpara because the land was too low-lying, and the choice of the site for the
high ground behind it; Gerrare's *The Story of Moscow* (1900) gives Yuri Dolgoruki's meeting of 1147
and the Kremlin hill; and Vivian's *Abyssinia* (1901) gives Entotto abandoned for want of firewood and
the new capital as a camp of huts across some 130 square kilometres with no streets in it.
**A PERIOD TRAVELLER IS A WITNESS AND IS CITED AS ONE** — Vivian's figures are what he saw, and the
prose says so ("a traveller found", "the same visitor found") rather than passing them off as a survey.

**AND THE FIFTH LEG IS THE CONSTITUTION, WHICH THE COUNTRY HALF ALREADY HAD.** The Constitute Project
answers for all six and it says something no statistical profile does: what the capital IS in law.
Ethiopia's article 49 is the richest of them — the city is the capital, its residents have a full
measure of self-government, its administration answers to the federal government, its residents sit in
the House of Peoples' Representatives, and the special interest of the State of Oromia in it is to be
respected. Nigeria's sections 297–299 vest every piece of land in the territory in the federal
government and put the territory's limits in a schedule to the text; Pakistan's article 1 lists the
Islamabad Capital Territory among the federation's territories and article 51 gives it three of 326
seats; Brazil's article 18 states the whole thing in five words. **Reach for it whenever a capital card
needs a fifth source**, and note the Constitute slug names the REVISION year, not the adoption year.

**AND UNDATA'S CAPITAL FOOTNOTE IS WORTH PRINTING, NOT JUST READING.** C1 found that the `Capital city
pop.` field carries a footnote saying what the figure counts; C2 is where that became the closing
sentence of four cards, because the four answers are all different and none of them is "the city":
Abuja's is *the urban agglomeration*, Dhaka's is *mega city*, **Brasília's is the "Região Integrada de
Desenvolvimento do Distrito Federal e Entorno"** — a whole development region around the district —
and Islamabad's, Moscow's and Addis Ababa's are a DATE, 2019, printed in a column headed 2025. Saying
so is the honest form of a figure the grid has already printed.

**AND THE AUTO-LINKER TOOK A PERSON'S NAME FOR A RELIGION.** `Islam` claims the bare surface, so
`gw-508`'s Islam Khan — the viceroy who founded the city — links to the religion. Measured over the
whole shipped corpus, `gw-508` is the ONLY card in which *Islam* is followed by a capitalised word, so
this collision is new; it is recorded rather than fixed, because every way of writing round it either
renames a historical person or removes him from his own city's founding. `Great_Rift_Valley` matching
"Ethiopian Rift Valley", `Ethiopia` matching "Ethiopian", `Belgium` matching "Belgian" and
`Urban_agglomeration` matching the UNdata footnote's own words are all correct and were left.

## What C1 found

**A CAPITAL CARD MAY NOT NAME ITS OWN COUNTRY, AND THAT IS RULE 2 DOING ITS JOB.** The grid's first
row is `Country`, so *India*, *China*, *Indonesia* and *United States* are grid values like any other.
Every one of the four opened on "X is the capital of Y" and none of them does now. What the constraint
costs is a sentence of throat-clearing; what it buys is that the history has to be written in the
things that happened — the government in London, the Ming and the Qing, the Netherlands Indies, the
Federal City of 1791 — rather than in the name the reader can already see.

**AND ONE CAPITAL IS PERMANENTLY IN THE RULE-1 LIST, FOR `gw-003`'s REASON**: `gw-503`'s own answer
term is *Washington, D.C.*, and the rule-1 pattern contains `\bWashington\b`, so that card will always
stand in that list — as `gw-003` and `gw-193` always will. It is written with no *United States* and no
*America* in it all the same, because rule 2 forbids the grid's `United States` independently, and the
two rules push the same way.

**THE WMO'S CITY PAGE IS THE EIGHTH VARIETY OF 200-STATUS NON-DOCUMENT**, and it nearly became the
uniform citation for 235 cards. `worldweather.wmo.int/en/city.html?cityId=N` answers 200 with 116,080
bytes that are **byte-identical for every city** and contain the city's name **zero times**; the data
is served from `…/en/json/<id>_en.xml`, which is what the cards cite. Every earlier variety on this
list was found by grepping the page for a word it must contain, and so was this one — **do that before
adopting an address as a recipe's uniform leg**, since a wrong one is wrong 235 times.

**A DECADE OR A CENTURY WRITTEN WITH A TRAILING `s` IS INVISIBLE TO `cardYears`, AND IT FAILS
QUIETLY.** `gw-502`'s first date line read `Axis laid out | c. 1200s` and `Axis reshaped | c. 1500s`
and yielded **no year at all**, so the card sorted at 1750, the one row the parser could read; `gw-504`
opened `Canals begun | 1620s` and sorted at 1645. Neither looked broken — a neighbouring row rescued
the sort each time, which is exactly why reading every new sort year back through `cardYears` is the
last step before committing. Both were rewritten as ranges the parser reads (`c. 1200 – 1300`,
`c. 1622 – 1627`), which assert no more than the sources do.

**A CITATION OPENING ON ITS QUOTED TITLE HAS NO AUTHOR**, which is what lets `gw-503` cite four pages
of the National Park Service and the Architect of the Capitol without tripping `check-cards.js`'s
one-author-in-three-sources rule — G20's finding, and the capital half will lean on it constantly,
since a city's history is usually published by one municipal body.

**THREE MORE AUTO-LINKS WRITTEN ROUND, AND TWO RECORDED.** `Water` (the chemistry term) and `Council`
(Aristotle's boule) both fired again, and `Great_Britain` claims the adjective *British* — on a term
whose own description says it "should never be used interchangeably" with the United Kingdom, so "the
British government" of 1911 linked to a definition that excludes it, and the sentence now says "the
government in London". Recorded rather than fixed: `Temple` opens on a Greek definition and claims the
*Temple* of Heaven, and **`India` matches inside "Dutch East India Company"**, which is the standard
English name of a company that has nothing to do with the country.

**AND THE COUNTRY HALF IS NOT QUITE 233 CLEAN ON RULE 1, WHICH THE FULL-DECK RUN HIDES.** Four country
cards report: `gw-003` and `gw-193` permanently, `gw-207` American Samoa for the same reason (its own
answer term), `gw-135` Puerto Rico because its claims are intrinsically about the United States — and
one that is a measurement fault rather than a card fault, **`gw-134` Uruguay, which says "the American
continent"**. The rule's lookbehind excludes *South American*, *North American*, *Latin American* and
*Central American* and cannot see a bare *the American continent*; the phrase is a calque and wants
rewording to "South American" in a sweep of its own.

## What G20 found

Four cards, and the batch that closes the country half of the deck. Its findings are small because the
recipe was settled long before it; what is worth keeping is where the recipe stopped applying.

**A PLACE THAT IS ITSELF A CAPITAL CANNOT ESCAPE RULE 2, AND `gw-232` IS THE FOURTH SUCH CARD.** The
grid prints Capital and Largest city, both of which read *Vatican City* — which is also the card's own
answer term, so the abstract's opening bold word IS a grid repeat and nothing can be written round it.
It joins `gw-213` Gibraltar, `gw-214` Monaco and `gw-216` San Marino in the permanent rule-2 list, for
exactly the reason G18 recorded. The area and the population were still taken out of the prose, since
those the grid really does say twice: the state's extent is written as **44 hectares** rather than as
the grid's 0.44 km², which is the same measurement in the unit the Governorate's own page uses.

**AND WHERE FOUR OF THE FIVE STANDARD SOURCES FAIL, A NATIONAL PARK SERVICE ANSWERS BETTER THAN ANY OF
THEM WOULD HAVE.** Norfolk Island and the Pitcairn Islands have no UNdata profile (both 500, as Jersey
and Guernsey do), no CBD Biodiversity Facts section, no recognition-guide page and no constitution in
the Constitute Project — G17's finding about dependencies, one more time. What carried `gw-230` is
**Parks Australia**, whose Norfolk Island National Park pages are a landform inventory in disguise:
separate pages for the geology (the basalt under Mount Pitt and Mount Bates, the krasnozem clays, the
skeletal soils on the summit ridge, Phillip Island's volcanism at 3.2 to 2.3 million years), for the
plants (200 natives, 46 of them endemic) and for the history (Polynesian seafarers between the 13th
and 15th centuries, Cook in 1774, the two convict settlements, the Pitcairners in 1856), with the
Australian Marine Parks page for the **Norfolk Ridge** and its seamounts beneath. G16's Hong Kong
finding and G17's museum finding at a third address: **a territory's administering power publishes
about it in the department that manages it, not in the department that counts it.**

**AND A CITATION THAT OPENS ON ITS QUOTED TITLE HAS NO AUTHOR, WHICH IS WHAT MAKES SUCH A CARD
POSSIBLE.** `check-cards.js` refuses a card citing one author in more than two of its sources, and four
Parks Australia pages or three Government of the Pitcairn Islands pages would trip it — written in the
Chicago note form an anonymous institutional page actually takes, opening on the title, `authorOf`
returns nothing and the rule is satisfied honestly rather than dodged. **Cite an institutional web page
the way Chicago says to; the concentration rule is measuring authors, and such a page has none.**

**AND THE TWO ENDS OF THE BATCH TURN OUT TO BE ONE STORY.** The whole Pitcairn community moved to
Norfolk Island in 1856 — 196 people, the descendants of the *Bounty* mutineers and their Tahitian
wives, into the buildings the second convict station had left — and families returned to Pitcairn in
1859 and 1864. Each card is written from the other island's own source, so the two halves are cited
independently and agree.

**AND ONE MORE WRONG AUTO-LINK, VISIBLE ONLY IN A BROWSER**: `Compact_of_Free_Association` claims the
bare surface *free association*, and that term is explicitly the treaty between the United States and
a formerly administered Pacific state — so Niue's free association with New Zealand, which is a
different arrangement entirely, linked to a definition that excludes it. Written round
("self-government while remaining freely associated with New Zealand") and recorded here; the fix is a
narrower alias on that term, which is a glossary pass rather than a background one. Two smaller ones
were written round in the same read: `Settlement` is the archaeologists' dwelling place, so "Settlement
began about 1000 CE" sent a reader to the wrong sense, and `Water` is the chemistry term, so "salt
water" offered a reader a polar molecule where they wanted the sea. **`Council` was left standing**, as
CLAUDE.md already records it — Niue's Island Council is a proper name, and there is one occurrence.

## What G19 found

**THE UN'S OWN DOCUMENT ROUTES ARE THREE, AND ONLY ONE OF THEM SERVES THE TEXT.** G18 recorded that
`digitallibrary.un.org` answers **202 with an empty body** and proposed `docs.un.org/en/<symbol>` as
the route to adopt in one sweep. That is wrong and this batch measured it: `docs.un.org/en/<symbol>`,
`undocs.org/en/<symbol>` and `docs.un.org/api/symbol/<symbol>` all answer **200 with a 4.2 KB
JavaScript document viewer and no text in it** — a sixth variety of 200-status non-document. What does
serve the PDF is **`documents.un.org/api/symbol/access?s=<symbol>&l=en&t=pdf`**, which redirects to the
real file and needs `curl -L` (without it you get a 64-byte redirect stub, which is how the first pass
here read every working paper as empty). So the machine route and the citable route are different
addresses: the working papers are **read** through the `documents.un.org` API and **cited** at
`docs.un.org/en/<symbol>`, which is the UN's own permalink and does display the document in a browser.
The same swap fixed `gw-220`'s Security Council citation, which had been pointing at a 202
(`docs.un.org/en/S/RES/956%281994%29` — **percent-encoded**, since `SRC_URL_RX` stops at a bracket).
The four papers this batch needed are A/AC.109/2026/2 (Anguilla), /6 (Falkland Islands (Malvinas)),
/10 (Montserrat) and /13 (Saint Helena); the numbering is alphabetical by territory and is worth
grepping out of the first two pages of each PDF rather than guessing.

**THE WORLD BANK'S CLIMATE PORTAL DOES NOT ANSWER FOR ALL 233.** G17 called the CCKP ERA5 climatology
"the uniform answer for climate … which answers for all 233 including the ones no UN body carries", and
it does not: **`FLK` returns `"data": []`** on the annual and the monthly endpoint alike, and in a
multi-country request the other codes come back while it is simply absent. The Falklands' climate is
carried instead by **Groff, Williams and Gill in *Biogeosciences*** (2020), whose study-site section
gives the whole of it — mean 9.4 °C in January and 2.2 in July over 1922–1988, winds averaging 8.5
metres a second with gales on about 70 days a year, rainfall of 400 to 600 millimetres, and the cold
Antarctic Circumpolar Current that sets it. **A paper's Study Area is the fallback for climate as well
as for landform**, which is G16's Kosovo finding one column over.

**A CBD PROFILE HAS THREE STATES, NOT TWO.** G18 established that the Biodiversity Facts *section* is
the check and the byte count is not. This batch found the third state: **the Cook Islands page carries
no Biodiversity Facts at all and is still a real profile**, its NBSAP narrative describing the fifteen
islands, the northern atolls, the high island of Rarotonga, the raised islands and the almost-atoll of
Aitutaki, and stating that about 60 per cent of the land is still forested. **Read past the missing
heading before writing a profile off.** Palau, Nauru and Tuvalu — the three UN members in this batch —
all have Facts; the eight dependencies serve the empty shell, as G17 predicted.

**THE ANGUILLA BANK IS ONE PAPER SERVING THREE CARDS.** `gw-218`, `gw-219` and `gw-224` are the three
main islands of a single shallow shelf, and Browne et al. in *Molecular Ecology* (2026) state it with
the peak elevations of all three — Saint Martin 424 m, Saint Barthélemy 286 m, Anguilla 73 m — and with
the Pleistocene sea-level falls that joined them into one landmass. **Where several cards in a batch
sit on one bank, arch or plate, one paper about its biogeography carries the landform sentence for all
of them**; the same held for `gw-218` and `gw-224` with Cécé et al. in *NHESS* (2021), whose Hurricane
Irma reconstruction gives each island's area, maximum dimension, lowland elevation and summit as its
model's terrain description. Its DOI is at Wiley and **403s**, so it is cited at its PMC copy, as
*Science Advances* already was for `gw-228`.

**AND THE AUTO-LINKER TOOK THREE MORE, ALL OF THEM ONLY VISIBLE IN A BROWSER.** G18's
`Federated_States_of_Micronesia` fault fired again the moment a card named the REGION: `gw-220` said
"the greatest area of continuous native forest in Micronesia" and "files it under Micronesia with code
585", and both linked the region to one small country in it, so both were written round. **`Alofi` is
the third glossary collision of the `Liancourt_Rocks` kind**: the term is Niue's CAPITAL, and Wallis and
Futuna's third main island shares the name, so `gw-223` cannot name its own island at all and now calls
it "Futuna's uninhabited neighbour" — recorded here rather than fixed, since the real repair is a
second term or a re-keying of Niue's, which is a glossary pass. And `Indian_reservation` claims the bare
surface **reservation**, so the Falklands' 1946 diplomatic reservations linked to a North American
land tenure; `gw-229` says "put on record" and "stated in parallel" instead.

**AND `to the East Indies` IS A BORDERISH CONSTRUCTION.** Rule 4's pattern matches `to the east`
case-insensitively, and the mask that hides a compound geographic name ends at `Sea|Ocean|Gulf|…|Islands`
and does not know *Indies* — so Saint Helena's "ships bound to the East Indies" made its own sentence
borderish and reported Portugal, named in it for a wholly different reason. Written "bound **for** the
East Indies" it is clean. **A rule-4 finding on a card with no neighbours in it is worth reading before
believing.**

## What G18 found

Twelve of the smallest entries left in the deck: two North Atlantic autonomies of the Danish Realm, five
Caribbean and Pacific dependencies, three sovereign microstates and Åland. G17's dependency recipe held
for the dependencies and the three microstates each needed something of their own.

- **THREE CARDS ARE PERMANENTLY IN THE RULE-2 LIST, AND THEIR OWN NAME IS WHY.** Rule 2 refuses a
  background that repeats a facts-grid value, and the grid prints Capital and Largest city — so on
  `gw-213` Gibraltar, `gw-214` Monaco and `gw-216` San Marino, where the country, its capital and its
  largest city are one name, the abstract's own opening bold answer term IS a grid repeat and nothing
  can be written round it. They join `gw-003` and `gw-193`, which stand in the rule-1 list for the
  mirror of the same reason. `gw-207` American Samoa is a third of that kind: its answer term contains
  the adjective the rule matches, and its prose was still written clear of every other mention (the
  Treaty of Berlin of 1899 "divided the archipelago between two powers").

- **`Saipan` IS A GRID VALUE, SO THE MARIANAS CANNOT NAME THEIR OWN MAIN ISLAND.** It is the Largest
  city on `gw-209`, so the background is written on Mount Pagan and the northern arc instead — which is
  the better card anyway, the arc being what the place IS.

- **THE CBD ANSWERS FOR TWO OF THE THREE MICROSTATES AND SERVES THE SHELL FOR THE THIRD.** Monaco's and
  San Marino's profiles carry real Biodiversity Facts — Monaco's 202 hectares of hilly rock with 53 of
  them reclaimed from the sea, San Marino's land-use split of 41 per cent farmed, 16 woodland, 17
  shrubland and 4 badlands — while the Marshall Islands' answers 200 at 65,891 bytes and carries no such
  section at all. **The byte count is not the check; the section is.** G17 read the shell at 54,8xx and
  a real profile at 65,963, so a page can be larger than a known-good one and still be the shell.

- **THE CONSTITUTE PROJECT HAS NO SAN MARINO**, which is the United Kingdom's case in miniature: there
  is no single codified text to carry, the republic's constitutional order resting on its own statutes.
  Monaco is `Monaco_2002` and the Marshall Islands `Marshall_Islands_1995` — **the slug carries the
  revision year, not the year of adoption**, so a guess built from the constitution's own date 404s.

- **AND FOR SAN MARINO THE RECOGNITION GUIDE IS UNUSABLE UNDER RULE 1, NOT MERELY UNHELPFUL.** Its page
  is one long account of Lincoln's 1861 reply, so every date on it names the thing rule 1 forbids. What
  replaced it is the republic's own foreign ministry: `esteri.sm` publishes a history of its relations
  with the European Union — diplomatic relations from 1983, a cooperation and customs union agreement
  signed at Brussels on 16 December 1991, approved by the European Parliament on 9 July 1992 — in
  Italian, which the house rules allow. **Monaco's guide page, by contrast, is full of facts about
  Monaco** (annexed 1793, independent again 1814, Vienna 1815, Piedmont-Sardinia to 1861), so it is
  cited there and the card names no other state's recognition of anything.

- **A COMPACT OF FREE ASSOCIATION CAN BE DESCRIBED WITHOUT NAMING THE OTHER PARTY**, and on `gw-215`
  it is: the compact "entered into force on 21 October 1986", ended the trusteeship agreement, and left
  "the administering Power" responsible for defence and for the military use of Kwajalein Atoll. The
  same dodge carries the 43 nuclear tests at Enewetak between 1948 and 1958 — a fact about the atoll,
  whoever ran them — and the finding that gives the card its landform sentence is that **the atoll
  consisted of 42 islands, of which 39 still exist**.

- **UNdata HAS NO ÅLAND**, a 500 on `ax` exactly as G17 found for Jersey and Guernsey, and Protected
  Planet does — 59 areas under `ALA`, a real profile rather than Finland's. So the fifth source there is
  a paper: the Ordovician limestone under Lumparn Bay, which fills the depression of an ancient meteorite
  impact, 15 km² of it up to 70 m thick and all of it now below sea level.

- **WHAT COULD NOT BE KEPT ON ÅLAND IS ITS DEMILITARISATION DATES.** The shipped card carried 1809, 1856
  and the 1921 convention; `aland.ax` states only that the islands ARE demilitarised, `asub.ax` and
  `peace.ax` carry no dates either, and nothing else reachable does — so the date line is **one row**,
  the Autonomy Act in force on 1 January 1993, and the prose says demilitarised without dating it. A
  single-row date line is the honest form here, exactly as an empty one is where nothing is datable.

- **`digitallibrary.un.org` IS STILL 202 WITH AN EMPTY BODY**, on all four working papers this batch
  reuses. **`docs.un.org/en/<symbol>` answers 200** and is the UN's current viewer — a route worth
  adopting, but the four cards keep the addresses the other thirty-odd working-paper citations in the
  collection already use, since one batch spelling them differently is worse than all of them being
  hard to fetch from a sandbox.

- **TWO DOIs HAD TO BE REPOINTED TO PMC**: `science.org` 403s the Marianas rice paper (G17's finding
  again) and `peerj.com` now 403s its own articles, so `10.7717/peerj.18487` is cited at
  `pmc.ncbi.nlm.nih.gov/articles/PMC11660859/`. **Ask Europe PMC before assuming a DOI that 403s is
  lost.**

- **THE AUTO-LINKER MATCHED TWO SENSES WRONG AND ONLY THE BROWSER SHOWED IT.** `Micronesia` is an alias
  of `Federated_States_of_Micronesia`, so "files under Micronesia" on the Marianas and the Marshalls
  linked the region to one small country in it — G17's `Micronesian` finding one word over — and
  **`East_Asia` matched inside "South-East Asia"**, the hyphen counting as a boundary, there being no
  `Southeast_Asia` term at all. Both clauses were rewritten. Standing and NOT fixed: `Council` in this
  glossary is Aristotle's boule, so the Council of Europe, the Privy Council and the Council of
  Ministers for the Kingdom all link to it — three cards, one glossary key, and a reword would rename
  three real bodies.

## What G17 found

**THE STANDARD SOURCES FOLLOW UN MEMBERSHIP, AND A DEPENDENCY HAS NO MEMBERSHIP.** G16 found this one
country at a time — Kosovo missing from four lists, Western Sahara from two — and a batch made entirely of
dependencies makes it a rule. Measured over the twelve: the **CBD** carried Iceland and served the empty
country-selector shell for the other eleven (54,8xx bytes every time, against Iceland's 65,963 — the
byte count is the check, since all twelve answer 200); the **recognition guide** has a page for Iceland
and for no dependency, being a guide to relations with *states*; the **Constitute Project** likewise, there
being no constitution to carry. What answers for all twelve is the **World Bank's ERA5 climatology** and
**UNEP-WCMC's Protected Planet**, and **UNdata for ten** — it 500s for Jersey and Guernsey, which the UN
files together as the Channel Islands and gives no ISO profile of their own.

**`www.unesco.org` ANSWERS WHERE `whc.unesco.org` IS 403, AND ITS BIOSPHERE PAGES ARE A CBD PROFILE IN
ANOTHER COAT.** A Man and the Biosphere page carries the coastline, the hills, the peat, the wetlands and
the seabed in prose, per reserve, which is exactly what the CBD gives a country and exactly what the tail
of this deck has been missing. The Isle of Man's whole island and the whole of its territorial waters were
designated in 2016, and the Commune de Fakarava page carried French Polynesia's atolls, including the
ring-shaped one raised on a volcano that subsided as the Pacific seafloor drifted. **The slug is the
reserve's own name, not the country's** — `/en/mab/commune-de-fakarava` answers where `/en/mab/fakarava`
is a 404, and the Isle of Man's is `/en/mab/isle-man`.

**A DEPENDENCY'S OWN INSTITUTIONS ANSWER, AND THE MUSEUM IS OFTEN THE BEST OF THEM.** This is G16's Hong
Kong finding at scale: `gov.ky` carries a real history page from Columbus's sighting on 10 May 1503 to
the first constitution of 1959, `parliament.bm` a legislature history back to the assembly Governor
Nathaniel Butler summoned on 1 August 1620, Tynwald its own claim to be the oldest parliament with an
unbroken existence, La Société Guernesiaise the 2.5-billion-year-old Icart Gneiss under the southern
cliffs, and Jersey Heritage both the 584-million-year-old volcanic origin of the island and the passage
grave opened in September 1924. **But the two most obvious sites are the two that fail**: `gov.je`
answers **500 on every path tried** and `gov.im` hands back a 269-byte stub, so Jersey is carried entirely
by its heritage trust and by GUERNSEY's constitutional page, which describes both bailiwicks together.

**A `gov.gg` ARTICLE IS FOUND THROUGH THE SITEMAP AND NOWHERE ELSE.** The root links almost nothing
internal and every guessed `/article/<id>/<slug>` is a 404, the ids being unguessable; `/article/119691/Sitemap`
is 500 KB and holds every one of them, which is how `152732/Constitution-position-and-customs-territory`
was found. The same shape works on `museums.gov.gg`.

**RULE 2 CAN COLLIDE WITH A TREATY'S NAME.** The Nouméa Accord is named after New Caledonia's capital, so
naming it repeats a facts-grid value; it is written round as "a further accord was signed on 5 May 1998",
which is the move the great powers already forced for the Treaty of Paris, the Berlin Wall and the Grand
Duchy of Warsaw.

**RULE 1 IS UNAVOIDABLE ON `gw-193`, AND AVOIDABLE ON `gw-186`.** The United States Virgin Islands' own
answer term contains the phrase, so that card joins `gw-003` as one that will always stand in the rule-1
list. **Guam did not have to**: with no recognition-guide page to write from, its history is the first
islanders of 3,500 years ago, the rice in their pottery, the occupation from 10 December 1941 and the
retaking on 21 July 1944 — the National Park Service tells all of it without the card ever naming the
sovereign. The absence of the American-facing source is what made the American-free card easy.

**TWO WRONG AUTO-LINKS, AND ONE OF THEM CANNOT BE REWORDED ROUND.** `Federated_States_of_Micronesia` claims
the surface *Micronesia*, and the linker matched the ADJECTIVE too, so "the Micronesian region" linked a UN
subregion to a sovereign country; the clause was dropped from Guam's card rather than reworded, since every
form of the word is claimed. And **"horse mussel" linked `Horse`**, a grazing mammal of the open grassland,
on the Isle of Man — the species list was cut back to the reefs and beds that carry no such trap.

**A 202 WITH A SHORT BODY IS THE PROXY, NOT THE HOST.** `dcnanature.org`, Curaçao's only openable landform
source, answered 200 (263 KB), then 202 (179 bytes), then 200 again in three consecutive requests.
Re-request before treating a territory's one source as lost.

## What G16 found

**FOUR OF THE FIVE STANDARD SOURCES ARE ORGANISED AROUND UN MEMBERSHIP, AND THIS BATCH MEASURED EXACTLY
WHERE THAT BITES.** D2 recorded it for Taiwan; here it is a table. **Kosovo** has no UNdata profile (`xk`
500s), no CBD profile, no World Bank climate code and — new this batch — **no Protected Planet entry
either**, `XKO`, `XK`, `KOS` and `RKS` all returning 500. **Western Sahara** has no CBD profile and no
climate code, but DOES have UNdata and Protected Planet. **Macau** and **Puerto Rico** have UNdata, the
climate API and Protected Planet, and neither has a CBD profile or a recognition-guide page. So the
gap is not "outside the UN" but **outside the World Bank's country list AND the CBD's party list**, which
are different lists that fail in different places: the climate API answers for Taiwan, Hong Kong, Macau
and Puerto Rico and refuses Kosovo and Western Sahara.

**AND WHAT ANSWERS INSTEAD IS THE OPEN LITERATURE, WHICH G11 PUT IN THE RECIPE AS A FALLBACK AND IS NOW
CARRYING WHOLE CARDS.** Kosovo's landform and climate come from a paper on the ecology of sand flies —
its study area gives the Accursed, Sharri and Kopaonik ranges, the mid-elevation Carralevë and Zhegoc,
the humid continental climate and the rapid meeting of maritime and continental influences — and its
water from a 2025 description of a new caddisfly from the Lumbardhi i Deçanit. Western Sahara's climate
comes from a four-decade study of the Arab world (its maximum temperatures rising 0.2 °C a decade, the
second slowest of 22 units measured) and its sea from a loggerhead-turtle fisheries paper (north-west
African waters among the most productive on earth, and this territory's own zone third of eight for
fishing effort, 2013–2023). Macau's geography comes from a soil-chemistry paper. **Read the study area,
not the subject**: none of those four papers is about geography and all four state it precisely.

**HONG KONG'S GOVERNMENT PUBLISHES ITS OWN BASIC LAW AND MACAU'S DOES NOT, WHICH IS THE EXACT INVERSE OF
G15's FINDING AND THE MOST USEFUL THING HERE.** G15 concluded that a place with no international profile
publishes about itself; Macau is the counter-example that shows the conclusion is about a GOVERNMENT
rather than about a class of place. `basiclaw.gov.mo` answers **405 with a JSON trace id on every path**
tried — root, `/en/`, `/index.html`, `/en/web/en` — which is an API gateway with no HTML at all;
`bo.io.gov.mo` and `images.io.gov.mo` are refused by the egress policy; `www.dsaj.gov.mo` serves one
identical 23,682-byte shell for every path (an eighth variety of 200-status error document, and its size
tells them apart the way `senate.gov`'s 37,523 bytes does); the tourism office 404s; and
`gov.mo/en/about-government/` is real and mentions neither 1999, nor the Basic Law, nor autonomy. **So
`gw-167` ships without the 1999 transfer**, because nothing openable states it, and says instead what
the sources do carry — that it is a special administrative region, that it trades in its own name (GATT
11 January 1991, WTO on the day that body opened), that it keeps the pataca, and that services are 92.8%
of its value added. **An absent date is better than a guessed one**, and this is the fourth card in the
pass to be written round a hole rather than over it.

**AND THE UN's OWN DOCUMENT LIBRARY IS UNUSABLE, SO CITE THE COURT INSTEAD.** `digitallibrary.un.org`
returns **202 with an empty body** on every record — Security Council resolution 1244 and General
Assembly resolution 1514 (XV) were both drafted as citations and both had to be withdrawn at the URL
sweep. The way round is that **the International Court of Justice's own case pages recite the
instruments**: `icj-cij.org/case/61` quotes resolution 1514 in the Western Sahara opinion of 1975, and
`icj-cij.org/case/141` recites 1244 and dates Kosovo's declaration to 17 February 2008. Two citations
became one better one on each card.

**RULE 1 EXEMPTS A UNITED STATES TERRITORY AND THE AUDIT STILL COUNTS IT.** `gw-135` Puerto Rico names
the United States four times — the national forest system, Public Law 600, the Federal Relations Act and
the dollar — every one of them unavoidable, since the territory's constitutional position IS its
relationship with that state. With `gw-003` that makes **two cards permanently in the rule-1 list**, and
both belong there; every other name on it is still work.

**NO WRONG AUTO-LINK, FOR THE FIRST TIME SINCE G11.** Five batches running turned one up — Guinea,
Providence, Paris, Mazu, Consul — and this one's rendered cards were read the same way and came back
clean, with `Settlement`, `Genus`, `Karst` and `Principality` all resolving to the right sense and
`Paris` on `gw-136` the Berlin case again (a treaty named for the city it was signed in). **The reason is
worth stating: this batch's prose names almost no institution by a periphrasis**, which was G15's own
lesson applied before the fact rather than after it.

**AND FIVE UNSUPPORTED SUPERLATIVES WERE CAUGHT IN DRAFT, ALL OF ONE SHAPE.** Having the whole batch's
climate figures side by side invites a ranking — "the wettest country in Europe outside the Alps", "the
second coldest country in the European Union", "the smallest and most easterly of the Greater Antilles"
— and **a comparison across a batch is not a claim any source in that batch makes**. Each was softened
to what the figures actually support. The one that survived is Norway's "changes more over a short
distance than almost anywhere on earth", which is the CBD profile's own sentence.

## What G15 found

**THE FIVE-SOURCE RECIPE NOW HAS A EUROPEAN FORM AND IT IS TWO FETCHES PLUS THREE LOOKUPS**: the CBD
country profile for the landform and the ecosystems, the World Bank's ERA5 climatology for the weather,
the recognition guide for the history, the Constitute Project for the state's own account of itself, and
the EU country page for the accession, euro and Schengen dates. Nine of these twelve took it whole. **And
the EU page's dates are worth reading rather than assuming**: Greece adopted the euro in 2001 rather than
1999, Sweden entered Schengen in 2001 and Czechia and Hungary only in December 2007, and **Bulgaria adopts
the euro on 1 January 2026**, which no card in the collection had said.

**THE RECOGNITION GUIDE'S SUMMARY IS A LOTTERY, AND THE LOSERS ARE THE COUNTRIES THAT NEVER FOUGHT
ANYBODY.** G14 found those summaries carrying whole country histories; here the same field runs from four
paragraphs to one sentence, and the length has nothing to do with the country's importance. Hungary's
gives the Ottoman conquest of 1526, the Habsburg reconquest of 1699, the Compromise of 1867, the
declaration of 17 October 1918 and the Treaty of Trianon with the three-quarters of territory it cost;
Bulgaria's gives the revolt of 1876, San Stefano, the smaller principality the Treaty of Berlin left and
the independence of 5 October 1908; Serbia's traces the whole break-up from 1992 to 2006. **Greece's is
one sentence, Portugal's and Sweden's two, and the Netherlands' is about somebody else** — so those four
carry their history on the constitution's own preamble and revision history instead, which is why
`gw-090` opens on the coup of 25 April 1974 that the Portuguese text itself dates and names.

**HONG KONG IS INVISIBLE TO EVERY SOURCE THE PASS USES AND IS STILL THE BEST-SOURCED CARD IN THE BATCH.**
It has no CBD profile, no recognition-guide page, no UNdata profile and no Constitute entry — the last of
those not a gap but a fact, its Basic Law being a national law of another state rather than a constitution
of its own. What answers instead is the territory's own government, and it answers better than any
international body would: **the AFCD's country-parks table** gives 25 parks over 43,997 hectares with the
date each was designated, which is a landform inventory in disguise (Tai Mo Shan, Lantau Peak, Sunset
Peak, Lion Rock, the Pat Sin range); **the Hong Kong Observatory's "Climate of Hong Kong"** gives the
season-by-season account, the typhoon record and a rainfall range from about 1,400 mm at Ping Chau to over
3,000 near Tai Mo Shan; **the Basic Law's own Chapter I** gives Articles 1, 2 and 5 verbatim; **the Hong
Kong Act 1985** at `legislation.gov.uk` is the other side of the transfer; and **the WTO's member page**
dates its accession in its own right. **When a place has no international profile, ask what it publishes
about itself.**

**AND THE CBD ANSWERS 200 FOR A COUNTRY IT HAS NO PROFILE FOR — CHECK FOR THE SECTION, NOT THE STATUS.**
That warning was already in this file; Portugal is a new instance and a bigger country than the ones that
prompted it, and its page returns the country SELECTOR under a 200. `gw-090`'s landform therefore rests on
an open paper on the Western Iberian Coast — the estuaries of the Minho and the Douro, Cape São Vicente,
and the seasonal upwelling that makes marine cold spells there outnumber marine heat waves — which is the
G11 fallback working exactly as recorded.

**TWO WRONG AUTO-LINKS, BOTH FOUND BY READING THE RENDERED CARDS, AND ONE OF THEM WAS MY OWN CIRCUMLOCUTION
BITING BACK.** `Consul` in this glossary is the highest magistrate of the Roman Republic, so Greece's "the
first foreign consul took up residence" pointed at a Roman office; it is now a "consular post", which the
linker cannot match. And **"the Atlantic alliance" links to the Atlantic Ocean** — the phrase was chosen to
vary the prose, and the glossary carries `NATO` as a key, so writing the plain acronym both reads better
and links correctly. **A periphrasis is not free here: the auto-linker rewards the ordinary name.** Two
links were left standing and are the G14 Berlin case: the Treaty of London and the Congress of Vienna
point at the cities, which is where those treaties were made.

## What G14 found

**These were the worst cards in the collection and that is why they were left until now.** Before this
batch, `gw-003` was ten sentences on the drafting of the Declaration of Independence and the Louisiana
Purchase; `gw-021` was a list of the consular posts opened at Leith, Belfast, Falmouth and Cardiff and
the years each closed; `gw-023` was the XYZ affair and the Quasi-War. None of the twelve said where the
country is, what it is made of or what its weather does. They were deferred because the FAO carries no
AQUASTAT profile for a rich northern state, and G13's replacement recipe is what unblocked them.

**THE UNIFORM CLIMATE SOURCE IS THE WORLD BANK'S ERA5 CLIMATOLOGY, AND IT ANSWERS FOR EVERY COUNTRY IN
THE DECK.** AQUASTAT's value was that one document carried landform, water AND climate; the CBD profile
carries the first two and says nothing about weather. One request to
`cckpapi.worldbank.org` returns the 1991–2020 mean annual temperature and precipitation for an ISO3
code — Canada at −3.7 °C and 669 mm, Australia at 22.2 °C and 454 mm, Taiwan at 20.3 °C and 2,829 mm,
Spain the driest of the large western European states at 647 mm. **It answers for Taiwan**, which no UN
statistical source does, and for Kosovo and every other code outside the UN system, so it closes the
one hole D2 recorded as needing a different CLASS of source. The portal's own human-readable pages are
403 from here, so the API route is what is cited; it returns JSON a reader can open and check.

**THE RECOGNITION GUIDE'S SUMMARY PARAGRAPH IS A COUNTRY HISTORY, AND ON THESE TWELVE IT IS THE BEST ONE
AVAILABLE.** C12 found that a page which opens with a sentence of CONTEXT before the recognition
paragraph carries the independence date; here the context runs to whole paragraphs. Poland's gives the
elective monarchy, the liberum veto, the three partitions, the republic of 1918, the corridor to the
Baltic and the Treaty of Riga; Romania's gives the 1862 union of Moldavia and Wallachia, Charles of
Hohenzollern-Sigmaringen, the 1878 treaties and the 1989 revolution; Australia's gives the six colonies,
the Balfour Declaration and the Statute of Westminster Adoption Act with its retroactive date. **The
exception is the United Kingdom, whose page is about America from its first line to its last** — the
guide is written from the United States outward, and the UK is the state it separated from — so that
card's history is taken from `legislation.gov.uk` instead.

**AND THE CONSTITUTE PROJECT HAS NO UNITED KINGDOM.** That is not a gap in the site but the fact it
records: there is no codified text to carry. The Acts of Union of 1706 and 1800 and the Scotland Act
1998 are all served in full at `legislation.gov.uk`, which is a better source for that state's shape
than any single document would be. Germany's slug is **`German_Federal_Republic_2014`**, not
`Germany_<year>`, and it was found the way C1 says to find one — by grepping the search page's own
hrefs, after six guessed years returned 404.

**RULE 2 TAKES THE CAPITAL OUT OF THE HISTORY BLOCK, AND ON THE GREAT POWERS THAT IS THE BINDING
CONSTRAINT.** The facts grid prints Capital and Largest city, so the audit counts a bare "Berlin",
"Paris", "Rome", "Madrid" or "Warsaw" as a repeat wherever it stands — which rules out the Treaty of
Paris, the Berlin Wall, the Congress of Vienna's Polish settlement written round the Grand Duchy of
Warsaw, and, on Afghanistan, **the Kabul River**, the longest river in the country. Those sentences have
to be written another way: the Afghan card names the Helmand, the Harirod-Murghab, the Northern and the
Panj Amu and calls the fifth "the river that flows east to the Indus".

**THE AUDIT DOES NOT EXEMPT `gw-003` FROM RULE 1, AND CANNOT.** Rule 1 is "no United States on a card
that is not the United States", and the card's own answer term is that name, so it appears in the
rule-1 list and always will. Exactly one card stands there legitimately; every other name on that list
is still work.

**FOUR WRONG AUTO-LINKS, THE MOST ANY BATCH HAS PRODUCED, AND ALL FOUR WERE FOUND BY READING THE
RENDERED CARDS.** `Mazu` is a Chinese sea goddess in this glossary, so the island group off Taiwan
linked to a deity — the sharpest mis-link the pass has turned up — and it is now spelled Matsu.
`Commonwealth` resolves to the Commonwealth of Nations, which is neither the Polish-Lithuanian
Commonwealth nor the Commonwealth of Australia, so both were reworded. And `Turkey` is the modern
republic, so "the Russo-Turkish war of 1877 to 1878" sent a reader to a country that did not exist for
another forty-five years; the sentence now names the Ottoman Empire, which the glossary does not carry
and so cannot mis-link. **One was left standing and recorded rather than reworded**: "the Philippine Sea
plate" links to the Philippines, which is the water-body class CLAUDE.md already measures — the sea IS
named after the country, so the link is related rather than wrong, and the fix belongs in a glossary
entry rather than in this card's prose.

**AND THE SHIPPED CARDS DISAGREE ABOUT THE BOLD ANSWER TERM.** Measured over the 233 country cards, 185
carry a `<b>` on the answer term at first mention and 48 do not, and the 48 include every card G13
shipped. The house rule says it is bolded; this batch bolds. **It is worth one sweep of its own rather
than a fix per batch.**

## What G13 found

- **THE AQUASTAT RECIPE IS FINISHED, AND THE PROOF IS EXHAUSTIVE RATHER THAN A GUESS.** All twenty-seven
  `gw-` cards left after G12 — `gw-207` through `gw-233` — were probed, and **not one has a country
  profile**: eighteen return the 189,869-byte page the FAO serves for a code it does not carry, and nine
  return a real page with no PDF link on it. With the fifty-nine already deferred that is eighty-six
  cards, so this batch either changed source 1 or the pass stopped. It changed source 1.
- **A CBD COUNTRY PROFILE'S PHYSICAL CONTENT SCALES INVERSELY WITH THE SIZE OF THE COUNTRY**, which is why
  it can replace AQUASTAT here and could not have replaced it in G7–G12. Germany's profile is species
  counts and France's names no relief at all; **Liechtenstein's gives three physical regions, the Alpine
  Rhine, the Rätikon massif and an altitude gradient of 450 to 2,600 m**, Tuvalu's gives three reef islands
  and six atolls at an average height of one metre, San Marino's the Apennine position and the limestone
  cliffs, North Macedonia's the altitude bands, the relief, the four watersheds AND the climate zones with
  their rainfall. A biodiversity profile for a small country has to describe the whole territory; for a
  large one it describes a fauna. **Measured before drafting**, which is what made the batch possible.
- **THE NEW RECIPE IS CBD + RECOGNITION GUIDE + CONSTITUTE + UNDATA + PROTECTED PLANET**, and the fifth is
  the find worth keeping: `protectedplanet.net/country/<ISO3>` is server-rendered, exists for every country
  and territory including the dependencies, gives the number of protected areas, and **states its own
  recommended citation on the page**, as AQUASTAT does. It answered 200 for all twelve.
- **THE COST OF THE CHANGE IS LENGTH, AND IT IS MEASURABLE.** Every one of the twelve first drafts came in
  UNDER 270 words — 210 to 279, against G12's 240 to 306 — because a CBD profile carries perhaps half of
  what an AQUASTAT profile does. The material to make up the difference is there, but it is further down
  the page, in the pressures-and-threats and ecosystem-services sections rather than in the opening
  paragraph. **Budget two passes over the profile, not one.**
- **AND THE CLIMATE IS THE HALF THAT DOES NOT SURVIVE.** AQUASTAT gave every card a mean rainfall, a range
  and a season; CBD gives that for North Macedonia and for nobody else in this batch. Where a card needed
  it, it came from the same G11 fallback — an open per-country paper — which is what carried `gw-168`
  Luxembourg: Douinot et al. in *Hydrology and Earth System Sciences* (2022) gave the Moselle basin, the
  Gutland's sandstone and marl, an elevation range and a rainfall gradient, and Protected Planet was
  dropped from that one card to make room for it. **Rule 3 asks for landform, water OR weather, so a card
  can clear it on the first two; the SHAPE the plan describes is what gives way.**
- **A CONSTITUTION'S YEAR IS READ OFF THE PAGE'S TITLE, AND THREE OF TWELVE WOULD HAVE BEEN WRONG BY
  GUESS**: Singapore's is 1963 rather than the 1965 of independence, Montenegro's 2007 rather than the 2006
  of independence, Malta's 1964. A fourth row was **withdrawn rather than guessed** — Malta became a
  republic in 1974 and the recognition-guide page does not say so, so the date line carries the
  constitution instead.
- **ONE MORE AUTO-LINK TAKEN BY THE TAIL**: "the sedimentary Paris Basin" linked its last word to
  **`Paris`**. Reworded. That is the fourth batch running in which reading the rendered cards has found a
  wrong link that no checker can see.

## What G12 found

- **THE SMALL-ISLAND TAIL IS WHERE THE DEFERRAL LIST GROWS FASTEST, AND IT IS TWO DIFFERENT ABSENCES.**
  Reaching twelve writable cards from `gw-177` meant passing fifteen, against eight in G11 and none in
  G10 — because below about 400,000 people the deck fills with DEPENDENCIES, and the FAO carries no code
  for one: Guam, Aruba, the United States Virgin Islands, Jersey, the Isle of Man, the Cayman Islands,
  Guernsey, Bermuda, Greenland and Curaçao all return the 189,869-byte page G9 recorded for Kosovo. The
  others — Kiribati, Micronesia, Tonga, Andorra, the Faroe Islands — return a real page of 283–287 KB with
  no profile on it. **Expect the ratio to get worse, not better**, and to reach a point where a plan for
  the dependencies has to be written rather than a batch run.
- **THE RECOGNITION GUIDE DROPS THE "AND" FROM A COMPOUND NAME.** `saint-vincent-and-the-grenadines` and
  `antigua-and-barbuda` are both 404; `saint-vincent-grenadines` and `antigua-barbuda` are 200, and
  `saint-kitts-nevis` (which C11 had already found) is the same rule. With G11's finding — that the slug is
  the country's OLDER name — that makes two independent ways for a guessed slug to fail, and one fix for
  both: **grep the index's own `href`s**, never compose the slug from the card's title.
- **AND SO DOES THE CONSTITUTE PROJECT, IN ITS OWN WAY.** `Suriname_1992` was a 404 in G11 and the index's
  link read `Surinam_1992`; here the same grep gives **`St_Lucia_1978`, `St_Vincent_and_the_Grenadines_1979`
  and `St_Kitts_and_Nevis_1983`** with the saint abbreviated, against `Antigua_and_Barbuda_1981` and
  `Sao_Tome_and_Principe_2003` written out. There is no rule; there is only the index.
- **A WESTMINSTER CONSTITUTION HAS NO STATE-FORM CLAUSE AT SECTION 1, AND THE EXECUTIVE-AUTHORITY SECTION
  IS WHAT TO CITE INSTEAD.** Saint Lucia, Grenada and Saint Vincent and the Grenadines all open on
  fundamental rights, and the constitutional fact worth reporting is in the executive chapter — "The
  executive authority of Saint Lucia is vested in Her Majesty", section 59, with Grenada at 57 and Saint
  Vincent at 50. **Barbados is the same shape with the opposite answer**: it became a republic in 2021, so
  its section 28 now reads "There shall be a President who shall be the Head of State", and Dominica's
  declaration of a republic is at section 116, not section 1. **Read where the clause IS rather than
  assuming article 1**, which held for every card in G10 and G11 and for only half of G12.
- **TWO MORE AUTO-LINKS TAKEN BY THE TAIL, AND ONE OF THEM HAD A ONE-LINE FIX.** "New Providence" linked
  to **`Providence`, the capital of Rhode Island**, and "São Tomé" as the name of the ISLAND linked to
  **`São_Tomé`, the capital city**. The island names were reworded out; but measuring the `Providence`
  surface over the whole corpus first showed it also claimed **gr-318's "divine providence"**, Xenophon on
  the silver of Attica, so the term is now `caseSensitive: true` — the `Boreal` precedent, verified against
  the four legitimate occurrences on `geo-004` and `geo-504`, every one of them capitalised.
- **THE OLDEST PROFILES IN THIS BATCH ARE THE TWO AFRICAN ONES.** São Tomé and Príncipe and the Seychelles
  are 2005 and everything Caribbean is 2015, with Fiji's neighbours Vanuatu and Samoa at 2016 — the
  regional survey rounds showing through, which is a reason to read the year rather than infer it and not a
  rule that can be leaned on.

## What G11 found

- **THE RECOGNITION GUIDE'S SLUG IS THE COUNTRY'S OLDER NAME, AND THREE OF THIS BATCH NEEDED IT.**
  `history.state.gov/countries/eswatini` and `/cabo-verde` are both 404 while `/swaziland` and
  `/cape-verde` are 200 — and the guide's own INDEX lists them under the current names, so the index
  resolves the slug where the title does not. That is D2's `burma` finding generalised: **the page is
  filed under the name the United States recognised the country by**, and each page says so in a closing
  sentence ("In 2018, the country was re-named Eswatini"; "In 2013, the country was re-named Cabo
  Verde"), which is also the citable source for the rename. `/bhutan` is a genuine absence, as D2
  recorded: the country is not in the index at all.
- **A COUNTRY WITH NO GUIDE PAGE TAKES AN OPEN PAPER ABOUT ITS OWN LANDFORM, AND SO DOES A COUNTRY WHOSE
  PAGE SAYS NOTHING.** `gw-166` Bhutan has no page, and `gw-163` Comoros has one that never mentions
  1975, France or any event before the recognition of 1977 — C11's grep check paying for itself again.
  Both took the recipe's stated fallback. Bhutan's is Wangchuk and Tsubaki in *Natural Hazards and Earth
  System Sciences* (2024), which dates the Luggye glacial lake outburst of 6 October 1994 and states what
  it released and what it cost; the Comoros' is Dille et al. in *Frontiers in Earth Science* (2020), which
  describes Karthala as a young, little-eroded basaltic shield forming the southern two thirds of Grande
  Comore. **Both are Crossref-verified by `check-citations.js`**, which is the check that makes an
  author-bearing citation safe to write at all.
- **AND WHERE THE HISTORY IS UNCITABLE, THE CONSTITUTION IS STILL AN ACT OF STATE.** `gw-163` therefore
  dates nothing before its admission to the United Nations on 12 November 1975, and reports what its
  constitution SAYS — that it names the islands and islets of Mwali, Maoré, Ndzuwani and Ngazidja and
  makes the return of Mayotte a national priority — as the constitution's own claim rather than as
  Folio's. Its date line has two rows, which is the honest length.
- **A WATER BODY NAMED AFTER A COUNTRY AUTO-LINKS TO THE COUNTRY, AND G10 PATCHED ONE CARD OF A CLASS OF
  THIRTY-FOUR.** G10 reworded `gw-150` because "Gulf of Guinea" linked its last word to Guinea; measured
  over the shipped `gw-` cards, **ten say "Gulf of Guinea", eight "Sea of Japan", six "South China Sea",
  five "Gulf of Mexico", three "Mozambique Channel" and two "East China Sea"** — 34 occurrences, and not
  one of the six water bodies is a glossary term, so the country surface wins every time. ("Persian Gulf",
  19 cards, and "Bay of Bengal", 3, are safe: neither *Persia* nor *Bengal* is a surface.) **The fix is a
  glossary term per water body, not a reword per card** — `buildGlossIndex` gives the longest surface the
  match, so one cited entry retires every occurrence at once — and it is a content pass of its own. G11's
  prose is left saying what those seas are called.
- **EIGHT MORE COUNTRIES HAVE NO AQUASTAT PROFILE, AND THE TWO PAGE SIZES SORTED THEM WITHOUT A FETCH
  EACH.** `gw-168` Luxembourg, `gw-170` Montenegro, `gw-172` Malta and `gw-178` Iceland return 283–287 KB
  with no `fao.org/3/…pdf` link — a real page for a country the FAO simply has no profile for — while
  `gw-167` Macau, `gw-171` Western Sahara, `gw-180` New Caledonia and `gw-182` French Polynesia return
  **189,869 bytes**, byte for byte the page G9 recorded for Kosovo and Hong Kong, which is a code the FAO
  does not carry at all.
- **THE OLDEST AND THE NEWEST PROFILES SIT SIDE BY SIDE IN ONE BATCH**: Eswatini, Djibouti, the Comoros
  and Cabo Verde are 2005 and Fiji and the Solomon Islands 2016, with Bhutan, Brunei and the Maldives at
  2011 and Belize, Guyana and Suriname at 2015. Read the year off each profile's own recommended-citation
  line; there is no survey round to infer it from.
- **TWO CONSTITUTE SLUGS ARE THE COUNTRY'S OLDER OR ANGLICISED NAME**, on the same principle as the
  recognition guide's: Eswatini is **`Swaziland_2005`** and Suriname is **`Surinam_1992`** — the second
  found only by grepping the country index's own `href`, since `Suriname_1992` is a 404 while the index
  link resolves. Belize is **`Belize_2022`**, the newest revision on the shelf.

## What G10 found

- **RULE 1 HAS BEEN REPORTING A FALSE FINDING ON EVERY REWRITTEN CARD IN THE AMERICAS, AND THE FIX IS ONE
  LOOKBEHIND.** `gw-audit.js`'s own header records that "America" was deliberately left out of the rule-1
  pattern, because "South America" is the continent Brazil is on — and the ADJECTIVE was left in, so a bare
  `\bAmerican\b` went on matching "South American", "North American", "Latin American" and "Central
  American". Measured before changing anything: **8 of the 307 rule-1 findings were that and nothing
  else**, and every one of the eight was a background this pass had already rewritten (`gw-070`, `gw-089`,
  `gw-109`, `gw-112`, `gw-129`, `gw-157`, `gw-719`, `gw-729`) — so the rule was reporting a permanent,
  growing false finding on exactly the cards it had finished with, which is how a measure stops being read.
  The lookbehind excludes the compounds and leaves "American" and "Americans" alone; the count went 307 to
  299 with no card's prose touched.
- **TWO COUNTRIES HAVE NO CBD BIODIVERSITY PROFILE AND EACH NEEDED A DIFFERENT FIFTH SOURCE.** `cbd.int`
  answers 200 for Lesotho and Bahrain and carries no Biodiversity Facts section for either — the shape C0
  warned about, one recipe source down. **Lesotho took the Commonwealth Secretariat's member page**, whose
  Key Facts line reads "1966, following independence from Britain" and so carries the Commonwealth clause
  the term's third sentence wanted. **Bahrain took the International Court of Justice**, whose summary of
  the judgment of 16 March 2001 in *Qatar v. Bahrain* states that a British decision of 1939 bound both
  parties from the outset and that sovereignty over the Hawar Islands lies with Bahrain — an act of state
  about a place AQUASTAT itself names as the country's second largest island group. `icj-cij.org/case/87`
  answers 200, as C7 recorded.
- **THE AUTO-LINKER TOOK TWO PHRASES BY THEIR TAILS, AND ONLY A RENDERED CARD COULD SHOW IT.** "Gulf of
  Guinea" linked its last word to **Guinea the country**, which is not the gulf and is a thousand
  kilometres away from the part of it Equatorial Guinea sits on; and "South-East Asia" linked to
  **`East_Asia`**, the boundary before "East" being a hyphen. The first was reworded ("on the Atlantic coast
  of western Africa, on the gulf that bears its name"), the second respelled — **"Southeast Asia" is the
  corpus's own majority form, 33 occurrences against 11 hyphenated** — and the eleven hyphenated ones
  elsewhere carry the same wrong link and are recorded rather than swept, being another pass's cards.
- **THE OLDEST AQUASTAT PROFILE ON THE SHELF IS CYPRUS'S, OF 1997**, and it states its own scope: the
  figures refer to the roughly 5,807 km² under government control. Read the citation year off the profile
  rather than assuming a survey round — G10's twelve run from 1997 to 2016 and no two consecutive card
  numbers share a year.
- **TWO CONSTITUTE SLUGS ARE NOT THE COUNTRY'S NAME**: Guinea-Bissau is **`Guinea_Bissau_1996`** with an
  underscore where the name has a hyphen, and Timor-Leste is **`East_Timor_2002`**. The country index at
  `constituteproject.org/constitutions` resolves either in one fetch; composing the slug from the card's
  own title fails silently with a 200 on a search page.
- **THE `released` STAMP AND THE AQUASTAT URL ARE THE SAME LESSON TWICE.** Both were read rather than
  composed, and both would have been wrong if composed: the FAO's document numbers bear no relation to the
  ISO code (`i9727en` for Botswana, `ca0329en` for Moldova, `CA3386EN` for Trinidad and Tobago, in three
  different cases).

## What G9 found

- **THE PROBE THAT TELLS A PROFILE-LESS COUNTRY FROM ONE THE FAO HAS NEVER HEARD OF IS THE PAGE SIZE, AND
  IT IS TWO DIFFERENT NUMBERS.** A high-income country with no AQUASTAT profile returns **286 KB** and no
  `fao.org/3/…pdf` link; **Kosovo (`XKX`) and Hong Kong (`HKG`) return 189,869 bytes**, byte for byte the
  same page, which is what the site serves for a code it does not carry at all. Both are deferred, but for
  different reasons, and the size says which without opening anything. G8's rule stands: check the size
  before believing the grep.
- **RULE 1's `American` PATTERN CATCHES THE CONTINENT, WHICH IS A THIRD KIND OF PERMITTED FINDING.**
  `gw-129` says "the narrowest country of the **Central American** isthmus" and `gw-134` "the southeast of
  the **American** continent" — both are the landmass rather than the United States, and both are the
  natural English for what they describe. They join the federation cases (`gw-070`, `gw-089`, `gw-109`,
  `gw-112`) and the historical ones (`gw-005`, `gw-053`) in the list the rules permit, and unlike those
  they are not a proper name at all: **the audit's rule-1 vocabulary cannot distinguish an American state
  from an American continent, and it should not try** — a pattern narrow enough to tell them apart would
  miss the thing it is for.
- **PANAMA CAN NAME ITS CANAL WITHOUT BREAKING RULE 1, BECAUSE AQUASTAT DESCRIBES IT AS HYDROLOGY.** The
  recognition guide's whole Panama page is the canal as an American undertaking — the 1904 treaty, the
  Canal Zone, the transfers of 1979 and 1999 — and none of it may be used. The AQUASTAT profile names the
  same waterway from the other side: the Chagres basin of 3,338 km² is "of vital importance to the
  operation of the Panama Canal", and the artificial lakes of Alajuela and Gatún regulate the flow the
  interoceanic route depends on. **When rule 1 takes a country's most famous thing away, look for the
  source that describes it as a landform.**
- **A THIN RECOGNITION-GUIDE PAGE STILL HAS ITS ONE CLAUSE, AND THE CARD MUST POINT AT IT.** `gw-131`
  Georgia first shipped with the guide cited and no marker on it — the page says only "Georgia previously
  had been a constituent republic of the USSR" — and `add-sources.js` would have refused the batch, as it
  refused `gw-029` in G2. The fix is G2's: find the one national fact the page does carry and mark the
  sentence to it as well as to AQUASTAT, which states the April 1991 declaration.
- **THE CBD OVERVIEW IS SOMETIMES ALL THERE IS, AND WHAT IT CARRIES MAY BE WEATHER RATHER THAN WILDLIFE.**
  Qatar's profile is four sentences under **Overview** — position, climate, mean temperatures, rainfall and
  area — with no species at all, so `gw-140`'s fifth source carries a climate sentence and the card says
  so. G8's finding widened: the heading varies (*Biodiversity Facts*, *Status and Trends of Biodiversity*,
  *Overview*) and so does what is under it. **Read the section before deciding what the source is for**;
  a first draft of that sentence claimed the peninsula was a landfall for migrating birds, which is
  plausible, is true, and is in nothing that was open.
- **TWO SOURCES DISAGREEING ABOUT ONE FIGURE IS A SENTENCE, NOT A PROBLEM.** Gabon's forest is 82 per cent
  of the territory in AQUASTAT and 85 in the CBD profile, both cited on the card, the second introduced as
  another reckoning. That is C1's read-both rule applied to prose rather than to a correction.
- **RULE 4's COUNT FELL BY THREE ON A BATCH THAT REWROTE ONE OF ITS CARDS.** `gw-142` Gambia was on the
  standing list for naming Senegal, and the country is describable without it: the River Gambia runs east
  to west through the middle and divides the land into two strips 25 to 50 km wide, which is the same
  bearing information and is what AQUASTAT leads with. **A border list is nearly always replaceable by the
  landform that made the border.**
- **AND THE LINK CHECK CAME BACK CLEAN FOR THE FIRST TIME.** Reading the twelve rendered cards for their
  `.ttip` links — G7's method, which found a mis-link in each of the last two batches — turned up nothing:
  `Byzantines` → the Byzantine Empire, `Commonwealth` → the Commonwealth of Nations, `karst`, `gazelles`,
  `savannas` all resolve correctly. **Run it anyway; the two it caught were both invisible in the data.**

## What G8 found

- **THE CBD PROFILE'S HEADING IS NOT ALWAYS "Biodiversity Facts", AND A GREP FOR IT REPORTS A GOOD PAGE AS
  EMPTY.** `cbd.int/countries/profile?country=py` carries a full account of Paraguay's two geological
  formations, its habitats and its 13,000 plants under **"Status and Trends of Biodiversity"** with no
  Biodiversity Facts heading anywhere, so the probe this pass has used since G3 called it a Venezuela case
  and it is not one. **Test for the CONTENT, not for the heading** — and the two shapes are worth knowing
  apart from the genuine absences, of which this batch has exactly one (`gw-124`, below).
- **A COUNTRY THAT CANNOT USE THE RECOGNITION GUIDE AT ALL: `gw-124` PALESTINE, AND IT NEEDED A SOURCE SET
  OF ITS OWN.** `history.state.gov/countries/palestine` is a 404 — G4's North Korea case, and for the same
  reason, since the guide is a record of American recognition — and the CBD profile is genuinely empty, so
  two of the recipe's five sources are gone at once. What replaced them are **two UN instruments and a
  court record**: UNdata (which carries forest cover and threatened-species counts where the CBD carries
  nothing), **General Assembly resolution 67/19 of 29 November 2012**, read from its own PDF at
  `documents.un.org` (`digitallibrary.un.org` answers 202 and `un.org/unispal` 403, both recorded before),
  and the **International Court of Justice's own case record at `icj-cij.org/case/131`**, which is open and
  substantive. **The AQUASTAT profile is titled *Occupied Palestinian Territory* and is cited under that
  name**; it is also the one source that describes Areas A, B and C, which no statistical profile does.
  The card states what each source states and adopts no view of its own on the dispute, which is the same
  footing `gw-096` Israel was written on in G7.
- **RULE 2's LIVE COLLISIONS IN THIS BATCH ARE A CITY INSIDE A REGION AND A CAPITAL INSIDE A CLAUSE.** The
  facts grid gives `gw-124`'s largest city as **Gaza**, so *the Gaza Strip* — a territory, not that city —
  would be reported by the audit, which compares words and cannot tell them apart; the card says "a narrow
  coastal strip on the Mediterranean", which is AQUASTAT's own wording for it. Three more were reworded for
  the same reason and each is the G3 Algiers / G6 Tunis case again: the Republic of the Congo's chief town
  was **the symbolic capital of Free France between 1940 and 1943**, Oman's Basic Law names its capital in
  the same article 1 that defines the state, and Costa Rica's Central Valley is described by AQUASTAT
  through the cities in it.
- **⚠ RULE 4's PROXY READS A LANDFORM NAMED AFTER A COUNTRY AS THAT COUNTRY, AND `MASK` DOES NOT COVER
  "depression".** `gw-122` first wrote "the Chad depression to the north and the Congo depression to the
  south", which is AQUASTAT's own phrasing translated, and the compass bearing beside the name is exactly
  the BORDERISH construction rule 4 looks for. The mask covers `Basin|Delta|Valley|Plateau|…` and only when
  the geographic word is CAPITALISED, so neither "Chad depression" nor "Chad basin" is masked. It was
  reworded to drop the bearings, which the sentence did not need. **`gw-128` Kuwait names Iraq and is NOT
  reported**, correctly: the invasion of 2 August 1990 carries no bordering construction, which is the rule
  working as the plan says it should — a historical mention is not a border list.
- **RULE 1's PERMITTED FINDINGS ARE THE SAME TWO WORDS AS EVER.** `gw-109` and `gw-112` name the
  **Federation of Central American States** and the **United Provinces of Central America**, which the
  audit's rule-1 pattern matches on `American`. Both are the Office of the Historian's own names for the
  polity the country belonged to, and both cards are right as they stand; they join `gw-005`, `gw-053`,
  `gw-070` and `gw-089`.
- **AND ONE CARD PAYS A REAL PRICE FOR RULE 1, WHICH IS WORTH SAYING OUTRIGHT.** Liberia's origin is that
  the **American Colonization Society** founded a settlement there in 1822 for freedmen and recaptured
  slaves, and the card cannot name the society. It says the settlement was founded and that in 1847 it
  constituted itself as a republic — every fact the source gives except the founder's name — which is
  `gw-011` Mexico's and `gw-014` Philippines' position for a third time. **If the rule is meant to allow
  the bare founding fact, that is one clause.**
- **⚠ AN OVER-BROAD GLOSSARY ALIAS SENT TWO CARDS TO ANOTHER CONTINENT, AND THE FIX WAS MEASURED BEFORE IT
  WAS MADE.** Reading the twelve rendered cards for their `.ttip` links — G7's method — found **Chaco →
  `Chaco_Canyon`**, the Ancestral Puebloan site in New Mexico, on the Paraguayan Chaco, and **Saint Paul →
  `St._Paul`**, the capital of Minnesota, on the Liberian river. Both came from an ALIAS, and in both cases
  removing it costs nothing: every one of the four US cards that mean the canyon writes *Chaco Canyon* or
  *Chaco Culture*, which is the term's own longer surface and wins on longest match, and every corpus
  mention of the Minnesota city writes *St. Paul*, which is its key. So the two aliases were dropped —
  `Yan_(state)`'s rule, and the checker's own second remedy — which also fixed **`gw-035` Argentina**, a
  card nobody was editing. **Measure what an alias is carrying before removing it, and measure it before
  deciding it is safe to keep.**
- **THE STANDING WRONG LINKS ARE ALL ONE SHAPE: A FEATURE NAMED AFTER A PLACE.** `Jordan River` → the
  country Jordan (on `gw-124` and on G7's `gw-096`), `the Senegal river` → the country, `the Oslo Accords`
  → the city, and G7's `Gulf of Guinea` → the country on eleven cards. Each is a real term reached by a
  surface that really is that word, so none can be fixed by an alias; the fix is a term of its own for the
  feature, which would win on longest match, and that is a cited-term job rather than a rewrite. Recorded
  here rather than half-swept.
- **THE OMAN PROFILE IS THE NEW-STYLE ONE AND SAYS "Required citation", NOT "Recommended citation".**
  `cb4413en` (2021, revised April 2021) is the only one of the twelve whose year the G7 grep could not
  find, and the line is on its own first page like all the others. Eleven of the twelve are the 2005–2016
  vintage; three are Spanish, three French.

## What G7 found

- **⚠ THE AQUASTAT COUNTRY PAGE 301-REDIRECTS, AND A `curl` WITHOUT `-L` REPORTS EVERY COUNTRY AS
  HAVING NO PROFILE.** The first sweep of this batch fetched twenty country pages, got twenty empty
  files and a 301 status, and read the result as twenty deferrals — which would have deferred the whole
  of G7 and G8 in one command. The page is 286–291 KB when it arrives, so **check the SIZE of what came
  back before believing the grep that found nothing in it**: a profile-less country (Portugal, Sweden,
  Greece, Hungary, Austria, Switzerland) returns 286 KB and no `fao.org/3/…pdf` link, which is a
  different fact from returning nothing at all. G2's rule — read the PDF address out of the page, never
  compose it — still holds and was still needed here; nine of the twelve addresses are irregular
  (`ca0420es`, `I9758EN`, `ca0211fr`, `i9803en`), and three are in a language other than English.
- **📖 THE `pypdf` INSTALL NEEDS `--ignore-installed cffi cryptography` IN THIS SANDBOX.** A plain
  `pip install pypdf` succeeds and then dies on `ModuleNotFoundError: _cffi_backend` inside a Rust
  panic from the system `cryptography` 41.0.7, which pip cannot uninstall ("RECORD file not found. Hint:
  the package was installed by debian"). `pip install --ignore-installed cffi cryptography` fixes it in
  one command, and all twelve profiles then extract cleanly (12–22 pages each, 24–63 KB of text).
- **THE RECOGNITION GUIDE'S SUMMARY IS THE COUNTRY'S OWN HISTORY FOUR TIMES IN TWELVE, AND ITS
  RECOGNITION SECTION IS THE OTHER EIGHT.** Azerbaijan's summary carries the centuries of Russian,
  Persian and Ottoman contention, the brief independence of 1918 and the Red Army's arrival in April
  1920; Belarus's carries the National Republic of 25 March 1918, the absorption by the Bolsheviks, the
  retaking of 1944 and the declarations of 27 July 1990 and 25 August 1991; Libya's carries the Ottoman
  province, the Italian colony and the Franco-British occupation. **The three Central Asian republics
  carry nothing at all** beyond "previously had been a constituent republic of the USSR", which is one
  clause for a whole second block — so Tajikistan, Turkmenistan and Kyrgyzstan take their history from
  the CONSTITUTION instead, whose preamble is where a post-Soviet state says what it claims to be.
- **A CONSTITUTION'S PREAMBLE IS A HISTORY SOURCE WHERE ITS ARTICLE 1 IS ONLY A DEFINITION.** Laos's
  dates the founding of the unified Lane Xang country to the middle of the 14th century under Chao Fa
  Ngum, the repeated invasions to the 18th century, the founding of the republic to 2 December 1975 and
  the first constitution to 15 August 1991 — four datable claims from one document, on a country whose
  recognition-guide page is otherwise a list of chargés d'affaires. Kyrgyzstan's invokes the precepts of
  Manas the Magnificent, Turkmenistan's the status of permanent neutrality, Belarus's the centuries-long
  development of Belarusian statehood, Azerbaijan's the traditions of many centuries of statehood.
  **Read the preamble before deciding a country's history cannot be sourced.**
- **ISRAEL HAS NO SINGLE WRITTEN CONSTITUTION, AND THE CONSTITUTE PROJECT SERVES THE BASIC LAWS
  INSTEAD** — a document that opens on *Basic Law: The Knesset* (1958) rather than on an article 1, so a
  grep for the state-form sentence returns nothing and reads as a missing text. The usable clause is in
  *Basic Law: Human Dignity and Liberty* (1992), section 1A, whose stated purpose is "to establish in a
  Basic Law the values of the State of Israel as a Jewish and democratic state"; the absence of a single
  constitution is itself the fact worth carding. **The first section of `Basic Law: The Knesset` states
  where the Knesset sits, which is a grid value on this card** and could not be used.
- **A COUNTRY WITH NO CBD BIODIVERSITY FACTS TAKES A MILESTONE RATHER THAN A JOURNAL, WHERE ONE FITS.**
  `cbd.int/countries/profile?country=ly` answers 200 with no Biodiversity Facts section — G4's Venezuela
  and G6's South Sudan case a third time — and the open literature on the Libyan landform is thin here:
  the MDPI and Egyptian Journal of Botany copies are shut, `persee.fr` serves the Al-Jabal Al-Akhdar
  vegetation paper's record page but 404s its `.txt` and 403s its PDF, so only the title could be read.
  The **Barbary Wars milestone** carries a sentence that is about the country rather than about America
  — Tripoli owed a loose allegiance to the Ottoman Empire rather than standing wholly apart from it —
  and is G3's rule applied one country further east. **Cite the title of a paper you could not open at
  your peril; take the milestone.**
- **RULE 1's ONE PERMITTED FINDING IN THIS BATCH IS G5's, AGAIN.** `gw-089` Honduras names the
  **Federation of Central American States**, which the audit's rule-1 pattern matches on `American`. It
  is the Office of the Historian's own name for the polity Honduras belonged to between 1823 and 1840, it
  is a different state from the one rule 1 is about, and the card is right as it stands. It joins
  `gw-005`, `gw-053` and `gw-070` in the list the rules permit.
- **⚠ A FORMAL STATE NAME CAN AUTO-LINK TO ANOTHER COUNTRY, AND IT RENDERS PERFECTLY.** `gw-106` first
  shipped "as the United Kingdom of Libya under King Idris I", which is what the recognition guide calls
  the state — and `buildGlossIndex` matched the surface *United Kingdom* inside it, so a reader clicking
  the name of the Libyan monarchy was shown a definition of Britain. Nothing failed: the sentence is
  correct, the citation is correct, and the link is a working link to a real term. It was caught only by
  looking at the rendered card. **Read a formal state name for the shorter state name inside it** —
  *United Kingdom of Libya*, *Republic of the Congo*, *United States of Mexico* are all this shape — and
  reword rather than reach for a hand-written `data-k`.
- **…AND THE OTHER TWO MIS-LINKS ARE A SPELLING AND A STANDING GAP.** Reading the twelve rendered cards
  for their auto-linked terms — `[...document.querySelectorAll(".study-card .ttip")]` with each one's
  `data-k`, which is far faster than `check-gloss-links.js` (that script did not finish inside 280s here)
  — turned up two more. **`Tien Shan` links to `Tian_(Chinese_religion)`**, whose alias list is
  `["T'ien", "Tien"]`, where **`Tian Shan` does not**, the key being parenthetical and so claiming no bare
  name; `wh-277` and `ru-001` already spell it *Tian Shan*, so `gw-107` was respelled to match and the
  corpus is now consistent. **`Gulf of Guinea` links to the COUNTRY Guinea on eleven cards**, six of them
  already rewritten (`gw-006`, `gw-047`, `gw-050`, `gw-058`, `gw-059`, `gw-076`), so it is a standing
  condition rather than anything G7 introduced and is recorded here rather than half-swept: the fix is a
  `Gulf_of_Guinea` glossary term, which would win on longest match, and that is a cited term of its own.
- **CHECK-STYLE's `data.js` BASELINE IS 127, NOT 92**, measured by stashing the batch and re-running:
  the figure quoted in a request drifts like every other figure in prose. G7 added none of them. All 60
  citation URLs answered 200 on the `SRC_URL_RX` sweep, and `check-citations` reports 0 mismatches over
  the 17 of 1,752 gw- citations it can adjudicate — none of this batch's carries a DOI, so all 60 are
  UNCHECKED rather than passed, which is that script's own distinction.

## What G6 found

- **⚠ RULE 2 WAS REPORTING FIVE CARDS FOR A REPEAT THEY NEVER MADE, and the bug was a substring test.**
  The audit asked `abstract.includes(value)`, so **"Tunis" matched inside "Tunisia"** — the country's own
  name — and the same trap waits in `Kuwait` beside Kuwait City, `Panama` inside Panama City, `Guatemala`,
  `Djibouti`, `Mexico` and `Singapore`, wherever a capital's name is a prefix or a substring of its
  country's. `gw-080` was rewritten once for a repeat it did not have before the script was read. **A
  place-name comparison needs a word boundary on both sides**; with one the count went 362 → 357, and
  five of those five were this.
- **A COUNTRY WITH NO CBD PROFILE STILL HAS A FIFTH SOURCE, AND THE OPEN JOURNALS ARE WHERE IT IS.**
  `cbd.int/countries/profile?country=ss` answers 200 and carries no Biodiversity Facts at all — G4's
  Venezuela case again — so South Sudan takes a 2026 **HESS** paper on flood-wave timing from Lake
  Victoria down into the Sudd, which is about the country's own dominant feature and says something no
  statistical profile does. **Search Crossref for the country's landform, not for the country.**
- **A CAPITAL THAT IS ALSO THE COUNTRY'S HISTORIC POLITY IS RULE 2's OTHER LIVE COLLISION.** "Tunis was a
  state under nominal Ottoman dependence" is a true sentence about the polity and prints the grid's
  Capital and Largest city in one word; it is now "the country". This is the sibling of G3's Algiers case
  and will recur wherever a city gave its name to the state around it.
- **THE CONSTITUTE SLUG YEAR IS THE LATEST AMENDMENT AND CAN BE DECADES OLD.** Benin is `Benin_1990` and
  Guinea `Guinea_2010`; the 2019 and 2020 guesses both 404. And **article 1 is again not always the
  article** — Rwanda's state-form clause is article 4, Haiti's article 1 names the capital (a grid value,
  so unusable), and Benin's names it too.

## What G5 found

- **WRITING UNDER RULE 4 FROM THE START COSTS NOTHING AND IS EASIER THAN SWEEPING FOR IT.** Every card
  here opens on position, extent and water instead of neighbours — Chile's three territories and the
  4,329 km of its continental strip, Malawi's 900 km against a 250 km maximum width, Zambia's latitudes,
  Sri Lanka's three peneplains — and none of them is shorter or thinner for it. **The border list was
  never carrying information the card needed; it was carrying the sentence AQUASTAT opens with.**
- **THE OPENING SENTENCE OF AN AQUASTAT PROFILE IS THE ONE PARAGRAPH TO STOP READING AT.** Its geography
  section runs *position → area → neighbours → relief → soils*, and the first three of those are now
  either the facts grid's (rule 2) or forbidden (rule 4). The material worth having starts at the relief
  and runs on into the soils and the agro-ecological zones, which is where every card in this batch takes
  its first block from.
- **A SECOND CLASS OF PERMITTED FINDING, and it is not the United States.** `gw-070` names the
  **Federation of Central American States**, which is what the Office of the Historian calls the polity
  Guatemala belonged to; the audit's rule-1 pattern matches `American` and reports it. That is a
  different state from the one rule 1 is about, the name is the federation's own, and the card is right
  as it stands. It joins `gw-005` and `gw-053` in the list of findings the rules permit.
- **A CONSTITUTION'S SLUG YEAR IS THE YEAR OF ITS LATEST AMENDMENT, NOT OF ITS ADOPTION**, which is why
  `Guatemala_1993` sits beside `Chile_2021` and `Ecuador_2021` — those are the 1985 and 2008 texts as
  amended. All twelve G5 slugs answered on the first guess, unlike G4's; the pattern `Country_Year` holds
  wherever the country's short English name is unambiguous.
- **AND ARTICLE 1 IS NOT ALWAYS THE ARTICLE THAT SAYS WHAT THE STATE IS.** Five of the twelve put the
  form of the state somewhere else — Sri Lanka's is article 2, Malawi's and Zimbabwe's are section 1 of a
  founding chapter, Zambia's article 1 is the supremacy clause, and Chile's article 1 in the 2021 text is
  an electoral provision about indigenous representation. **Grep for the sentence, not for the number**,
  and cite the article the sentence is actually in.

## What G4 found

- **A COUNTRY OUTSIDE THE RECOGNITION GUIDE CAN STILL BE WRITTEN, AND `gw-056` IS THE PROOF.** The Office
  of the Historian has **no page for North Korea** — the United States has never recognised it, and the
  guide is a record of American recognition — so the card's whole second block comes from three other
  works: the CBD profile for the forest, the coast and the islands; the **Korean War milestone**, which is
  about an EVENT rather than a state and so covers a country the country index does not; and the DPRK's own
  constitution. **When the guide has no country page, look for a milestone about the event.** The milestone
  is heavily American in its framing and the two sentences taken from it name no American at all: the
  peninsula "was temporarily divided at the 38th parallel", passive, because the actors in the source are
  the United States and the Soviet Union and only one of them may be named here.
- **THE CONSTITUTE PROJECT'S SLUG IS NOT ALWAYS THE COUNTRY'S NAME, AND THE INDEX RESOLVES IT.** Syria is
  `Syria_2012` rather than `Syrian_Arab_Republic_2012`, and North Korea is **`Peoples_Republic_of_Korea_2016`**
  — not the country's name at all, and not guessable from it. Fetch `constituteproject.org/countries` and
  grep for the country's own directory, then grep that page for `constitution/…`; three guesses at the DPRK
  slug returned 404 before the index gave it in one.
- **AN AQUASTAT PROFILE'S YEAR IS ON ITS OWN FIRST PAGE, IN ITS OWN LANGUAGE.** The English profiles carry a
  "Recommended citation" line; the French and Spanish ones carry *Citation recommandée* and, for Peru and
  Venezuela, nothing at all — those two state **"Versión 2015"** in the running head under a survey banner
  reading 2016 that is plainly a template artefact (it says *Irrigation in Africa in figures* on a South
  American profile). Cite the version the document gives itself. Burkina Faso's address is also the batch's
  reminder that these are read rather than composed: it is `…/3/I9864FR/i9864fr.pdf`, with the case of the
  two halves reversed.
- **THE CBD PROFILE IS NOT UNIVERSAL, AND THE GAP IS SILENT.** Venezuela's page answers 200, is 67 KB, and
  carries no "Biodiversity Facts" section at all — only its national strategy — so a script keyed on the
  page's existence would have reported it usable. `gw-053` took the guide's **Venezuela Boundary Dispute**
  milestone instead, which is about Venezuela's own eastern frontier and its claim to the Essequibo on the
  strength of the limits it held at independence from Spain.
- **AN OH SUMMARY OFTEN CARRIES THE COUNTRY'S OWN MODERN HISTORY IN ONE CLAUSE.** Nepal's names the
  abolition of the monarchy, the creation of a representative government and the end of a ten-year Maoist
  insurgency in 2006; Peru's names territorial disputes with its neighbours, periods of military rule and
  coups against civilian constitutional government; Côte d'Ivoire's dates the change of name to 1986 and
  Burkina Faso's the change from Upper Volta to 1984. Read past the recognition paragraph.

## What G3 found

- **⚠ AN AQUASTAT PDF CAN BE SERVED AS AN HTML PAGE, AND THAT IS WHY `gw-036` IS DEFERRED.**
  `https://www.fao.org/3/ca0357en/CA0357EN.pdf` — Afghanistan's, read out of the country page rather than
  composed — 301-redirects and hands back 1.6 MB of `<!DOCTYPE html>`, so a PDF reader fails on it with
  "Invalid PDF structure". The AQUASTAT factsheets on `storage.googleapis.com` are data tables with no
  prose at all, so there is no second route to the same material. **Test the file, not the status code**:
  a 200 on a `.pdf` address is not a PDF, and the extractor's own error is what says so.
- **THE CBD COUNTRY PROFILES ARE THE THIRD SOURCE**, `cbd.int/countries/profile?country=<cc>`, open and
  per country. Their "Biodiversity Facts" section is prose about a country's own ecosystems — Morocco's
  24,000 animal and 7,000 plant species with a fifth of the vascular plants endemic, Mozambique's five
  phytogeographical regions and three hotspots, Angola's escarpment — which is landscape a statistical
  profile does not carry. **Several are marked "still draft… subject to final approval"**; cite one for
  what it is.
- **A MILESTONE CAN BE THE COUNTRY'S OWN SUBJECT RATHER THAN AMERICA'S.** The Barbary Wars page describes
  what the Barbary states were and how they were governed; the Gulf War page gives Iraq's war with Iran,
  its 37 billion dollars of Gulf debt and why that turned into the invasion of Kuwait; the oil embargo
  page describes OPEC's 1973 action and the pricing system it broke. Three of G3's cards rest on one of
  those for a sentence that names no American at all.
- **A CAPITAL THAT IS ALSO THE LARGEST CITY TRIPS RULE 2 TWICE, AND SOMETIMES THE HISTORY NEEDS IT.**
  `gw-033` had Algiers in two sentences — the Barbary state and the 1848 departments — and both were
  reworded to the coast and the northern territory. The country's own name for its capital is often the
  natural subject of its colonial history, so this is the rule's commonest live collision.
- **THE WORLD BANK'S CLIMATE API IS OPEN AND IS THE ROUTE THE OECD DEFERRALS WILL TAKE.**
  `cckpapi.worldbank.org` answers where `cia.gov` is still an empty JavaScript shell and
  `climate-adapt.eea.europa.eu` carries policy tables rather than description. The national met services
  answer too (Met Office, DWD, Météo-France, AEMET, ISPRA). What none of them supplies is LANDFORM, which
  is what AQUASTAT was carrying, so those eight are deferred rather than half-solved.

## What G2 found

- **⚠ EIGHT OF TWELVE AQUASTAT URLS COMPOSED FROM THE PATTERN WERE WRONG, AND ONE OF THEM POINTED AT
  ANOTHER COUNTRY'S PROFILE.** The profile addresses look regular — `ca0394en`, `ca0403en`, `i9807en` —
  and they are not derivable: Thailand's is `ca0408en` where the guess `ca0412en` is VIET NAM'S, and
  Tanzania, South Africa, Kenya, Iran, Turkey, DR Congo and Vietnam were all wrong too. G1's were right
  only because they were copied out of `geo-src.js`'s output rather than typed. **Read the PDF link out
  of the country page every time** (`grep -ao 'https://www.fao.org/3/[^"]*\.pdf' <ISO3>.html`), and read
  the YEAR off the profile's own "Recommended citation" line, which was also wrong twice.
- **CHECK EVERY CITATION URL WITH `SRC_URL_RX`'S OWN REGEX BEFORE APPLYING A BATCH.** Sweeping the batch's
  57 addresses caught those eight and one more: `doi.org/10.1515/geo-2019-0013` answers **202**, De Gruyter
  serving a challenge, so an Open Geosciences paper was swapped for a HESS one. The pattern is
  `/https?:\/\/[^\s<>"')\]]+[^\s<>"')\].,;:]/g` — a looser one takes the citation's closing full stop
  with it and reports every URL as a 404.
- **📖 THE CONSTITUTE PROJECT IS THE SECOND SOURCE THE PASS NEEDED** —
  `constituteproject.org/constitution/<Country>_<Year>`, open, with English text for nearly every country
  on earth. A constitution's opening articles state the form of the state, its territory and its founding
  claim, which is exactly the kind of thing a geography card's second half is for and which the
  recognition guide does not carry: Iran's article 1 dates the Islamic Republic to the referendum of 29
  and 30 March 1979, Myanmar's preamble dates the loss of sovereignty to 1885 and the recovery to 4
  January 1948, South Korea's article 3 claims the whole peninsula, South Africa's section 1 founds the
  state on non-racialism and universal suffrage. Slugs are `Country_Year` and are not always guessable
  (`Republic_of_Korea_1987`, not `South_Korea_1987`; Vietnam has none).
- **THE OFFICE OF THE HISTORIAN'S MILESTONES ARE AMERICAN-FRAMED AND STILL CARRY THE COUNTRY'S OWN FACTS**
  — Dien Bien Phu's fall on 7 May 1954 after a four-month siege, the Force Publique mutiny at Thysville a
  week after Congolese independence, de Lesseps's abandoned Panama canal, the 38th parallel and the 1953
  truce. Read them for the sentences that are about the country and leave the rest.
- **A SOURCE MUST STILL BE REFERENCED AFTER A REWRITE**, which is where `gw-029` first failed: taking the
  recognition guide's American material out of the prose left its citation pointing at nothing, and
  `add-sources.js` refuses that. Either find the one national fact the page does carry or drop the source
  and put a fifth in its place.

**Rules 1 and 3 remain open on about 250 cards.** Run `node .claude/gw-audit.js` for the live figures.

*Not part of the site.*


---

## The G1–G6 batch account, moved out of `CLAUDE.md` (2026-09-11)

**READ BEFORE REWRITING A `gw-` BACKGROUND.** The account as it stood in `CLAUDE.md` until it was
moved here verbatim: the three per-country sources and what each carries, the deferred countries with
their card ids, the AQUASTAT URL finding, and the sweep of the already-rewritten cards. The RULES stay
in `CLAUDE.md`.

- `docs/world-geography-card-plan.md` — the running order for **World** (`geo-world`, the second
collection of the Geography SECTION), and the second plan that is not a thousand cards: it is **470
cards** — 233 countries and territories (`gw-001`–`gw-233`) and 237 capitals (`gw-501`–`gw-733` with
seven numbers deliberately unused, plus `gw-751`–`gw-761` for the extra seats of the ten countries that
have more than one) — using the same **map card** format the United States collection uses, so
it points at `docs/geography-card-plan.md` for the format rather than restating it. **It is SORTED BY
POPULATION, largest first, and the order is FIXED at planning time and never re-sorted**: a card id is
a permanent address, so re-sorting would move cards between ids and silently repoint every reader's
schedule and every shared link. The snapshot behind the order is stated in the plan (World Bank
`SP.POP.TOTL` 2024, with `country-stats.js` for the 21 small territories that series omits), and a
card's own population figure is researched and cited when the card is written — **the two will drift
apart, and that is expected rather than a fault**. Three things in it are decisions rather than lists.
**Which entities are in the deck is THREE CHECKABLE RULES rather than a judgement per country** — an
ISO 3166-1 code of its own, a shape in `world.js`, and a settled population with an administrative
seat — which is what keeps Folio out of every sovereignty argument it would otherwise be making 233
times; the deck is called *The countries and territories* and every question asks for "the country or
territory shaded on the map", which is true of all of them. **Twelve countries have more than one
seat** and the plan says which each card asks for, with the working seat named in the facts box.
**Israel and Palestine are deferred**, numbered but not written, because a card that shades a shape and
asks for one word cannot hold a capital question whose answer is the dispute.
· **📖 `docs/geography-background-plan.md` — READ BEFORE REWRITING A `gw-` BACKGROUND.** These
backgrounds were written out of the recognition guide, which is written from the American point of
view, so they are histories of *American recognition of* the country rather than histories *of* it.
**RUN `node .claude/gw-audit.js` FOR THE FIGURES RATHER THAN QUOTING ANY** — this bullet stated
three and two of them were wrong within a day, because the sweep behind them was never written
down; the script is report-only, exits 0, and answers all four rules plus the date lines at once.
**THE FOURTH RULE IS THAT A BACKGROUND MAY NOT LIST THE COUNTRIES THAT BORDER IT** (Sep 2026, on
request): the card draws the country on a globe with every neighbour around it, so the neighbours
are the one thing on it a reader can already see — rule 2 one step out. **The replacement is the
SAME sentence with each neighbour swapped for the sea, the region or the landform it stands in**,
which keeps the bearings and the length and needs no new source; a SEA is not a country and stays,
a HISTORICAL mention of a frontier is the country's own history and stays, and an ADJECTIVE ("the
Cameroonian border") counts and does not. All 42 of the already-rewritten cards that opened on a
border list were swept in the same pass.
The plan holds the rules asked for, why this cannot be a find-and-replace (removing a third of the
sentences orphans the citations that stood on them, and `add-sources.js` rightly refuses that), the
sources the rewrite needs, fifteen batches, and what each shipped batch found.
**G1–G6 have shipped — seventy-three backgrounds rewritten** (`gw-001`–`gw-087`, less the
deferrals below), each five sentences of landform, water and climate over five of the country's own
history, with fifty-nine date lines rewritten out of the same research. Three sources make the
pass possible and all three are per country. **The FAO's AQUASTAT country profile** carries the
landform, the borders, the coastline, the altitude range, the seasons, the mean rainfall AND its
range, and the rivers — enough for a whole block on its own — and states its own recommended
citation on page 1. **The Constitute Project** carries an English text of nearly every constitution
on earth, whose opening articles state the form of the state, its territory and its founding claim.
**The CBD's country profiles** carry a country's own ecosystems in prose, which no statistical
profile does. **AND AN AQUASTAT URL MUST BE READ, NEVER COMPOSED**: eight of G2's twelve guesses
were wrong and one pointed at another country's profile — and **a 200 on a `.pdf` address is not a
PDF**, Afghanistan's being served as 1.6 MB of HTML, which is why `gw-036` is deferred. **THIRTEEN
HIGH-INCOME COUNTRIES HAVE NO AQUASTAT PROFILE AT ALL** (`gw-003`, `gw-019`, `gw-021`, `gw-023`,
`gw-025`, `gw-032`, `gw-037`, `gw-042`, `gw-054`, `gw-067`, `gw-072`, `gw-082`, `gw-088`) and are
deferred rather than half-solved: the
World Bank's open climate API and the national met services answer for the weather, and nothing
reachable carries the LANDFORM. **A COUNTRY THE RECOGNITION GUIDE HAS NO PAGE FOR CAN STILL BE
WRITTEN**: it has none for North Korea, and `gw-056` rests instead on a MILESTONE, which is about
an event rather than a state. Rules 1 and 3 remain open on about 350 cards.
· **A GEOGRAPHY CARD'S DATE LINE CARRIES DATES, NOT A CENSUS** (Sep 2026, on request: "cards in
geography decks should never have their census information mentioned in the period box below the main
answer term"). Fifteen carried one — `Census | 21,893,095 in 2020` on `gw-502` Beijing, `2011 census |
97,857 people` on `gw-195` Jersey — and the population is already in the facts grid two inches above.
**A card with nothing else datable gets an EMPTY date line rather than a filler row**: Jersey's every
row was a census count and its prose dates nothing else, so it now has none, which `test-date-line.js`
is what caught — a non-empty line yielding no sort year is a card that STATES a date and cannot be
ordered by it. **And a population is written to three significant figures**, which was four on exactly
four cards in the whole corpus (Beijing, Jakarta, Moscow, Tokyo); the `+105.1%` rows on `gw-575`,
`gw-625` and `gw-673` are population GROWTH rates rather than population figures and are left alone.
Not part of the site.
