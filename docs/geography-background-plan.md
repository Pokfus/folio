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

## The three rules, and what each costs

1. **No United States, on a card that is not one.** Seven cards are exempt by subject — `gw-003` the
   United States and the six territories it administers. On the other 412 the American material has to
   come out, and it is a third of the prose, so what replaces it is not an edit but new research.
2. **Nothing the data grid already says.** `facts` prints Capital, Population, Largest city and Area
   under the answer term; 205 backgrounds print one of those figures again. A background repeating the
   grid is spending a tenth of its 300 words saying what is already on screen two inches above.
3. **Geography, climate and history first.** Only 119 of 468 backgrounds mention a landscape or climate
   word at all. This is the positive half of rule 1 and the one that makes the collection worth studying:
   a card asking a reader to recognise a shaded country should tell them what that country IS.

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

**Rules 1 and 3 remain open on about 390 cards.** Run `node .claude/gw-audit.js` for the live figures.

*Not part of the site.*
