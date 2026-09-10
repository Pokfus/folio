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

## What has shipped

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
