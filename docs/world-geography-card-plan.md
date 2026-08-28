# The world — the card plan

The collection is **The world** (`geo-world`), the second of the Geography SECTION on the Collections
page, beside **United States** (`geo-us`). It is **470 cards in two decks**: **The countries and
territories** (`geo-world-countries`, `gw-001`–`gw-233`) and **The capitals**
(`geo-world-capitals`, `gw-501`–`gw-733` with seven numbers deliberately unused, plus `gw-751`–`gw-761`
for the second and third seats of the ten countries that have more than one). Its cards use the
**map card** format — a shape on a globe, and the question is what it is.

📖 **`docs/geography-card-plan.md` describes the map card itself** — `map`, `facts`, `answerFlag`, the
globe, the fit, the accessibility limitation — and everything it says applies here unchanged. **Read it
before writing a card.** This file is the running order and the decisions that are particular to the
world: which entities are in the list, which seat a capital card asks for, and where the names come from.

The next card to write is the lowest `gw-NNN` not yet in `data.js`:

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='gw-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

**Shipped so far — countries `gw-001`–`gw-068`** (India, China, United States, Indonesia, Pakistan,
Nigeria, Brazil, Bangladesh, Russia, Ethiopia, Mexico, Japan, Egypt, Philippines, Democratic Republic of
the Congo, Vietnam, Iran, Turkey, Germany, Thailand, United Kingdom, Tanzania, France, South Africa,
Italy, Kenya, Myanmar, Colombia, South Korea, Sudan, Uganda, Spain, Algeria, Iraq, Argentina,
Afghanistan, Canada, Yemen, Morocco, Angola, Ukraine, Poland, Uzbekistan, Malaysia, Saudi Arabia,
Mozambique, Ghana, Peru, Madagascar, Côte d'Ivoire, Nepal, Cameroon, Venezuela, Australia, Niger, North
Korea, Syria, Mali, Burkina Faso, Taiwan, Sri Lanka, Malawi, Zambia, Kazakhstan, Chad, Chile, Romania,
Somalia, Senegal, Guatemala, Ecuador, Netherlands, Cambodia, Zimbabwe, Guinea, Benin, Rwanda, Burundi,
Bolivia, Tunisia, South Sudan, Belgium, Haiti, Jordan, Dominican Republic, United Arab Emirates) **and
capitals `gw-503` Washington, D.C., `gw-505` Islamabad, `gw-507` Brasília, `gw-510` Addis
Ababa, `gw-513` Cairo, `gw-514` Manila, `gw-515` Kinshasa, `gw-516` Hanoi, `gw-517` Tehran, `gw-518`
Ankara, `gw-519` Berlin, `gw-520` Bangkok, `gw-521` London, `gw-522` Dodoma, `gw-523` Paris, `gw-524`
Pretoria, `gw-525` Rome, `gw-526` Nairobi, `gw-527` Naypyidaw, `gw-528` Bogotá, `gw-529` Seoul, `gw-530`
Khartoum, `gw-531` Kampala, `gw-532` Madrid, `gw-533` Algiers, `gw-534` Baghdad, `gw-535` Buenos Aires,
`gw-536` Kabul, `gw-751` Dar es Salaam, `gw-752` Cape Town and `gw-753` Bloemfontein.** The next country
is `gw-087` Cuba and the next capital is `gw-537` Ottawa.

**Seven capitals are DEFERRED, and between them they name every way a capital source can fail.**
`gw-501` New Delhi and `gw-502` Beijing are reachable here only through the foreign legations that sat in
them — the recognition guide dates the American mission at New Delhi to 1946 and traces the United States
legation from Beijing to Nanjing to Chongqing to Taipei, which is a history of American diplomacy rather
than of either city. `gw-504` Jakarta: `jakarta.go.id` is 403 and `indonesia.go.id` returns 502.
`gw-506` Abuja: the Federal Capital Territory Administration has a page headed *A Brief History of our
City* whose text is **unreplaced template boilerplate** ("Millions of people around the world use Obira to
connect…"), so a fetch returning 200 and 220 KB carries no history at all — **check that a page says
something before counting it as a source.** `gw-508` Dhaka: **every Bangladeshi government domain tried
presents an incomplete certificate chain** (`parliament.gov.bd`, `dncc.gov.bd`, `bbs.gov.bd`,
`mofa.gov.bd`, `cabinet.gov.bd`), which is a fault in the source rather than a policy of this sandbox and
is not to be worked around by disabling verification. `gw-509` Moscow: `mos.ru`'s own history page renders
through JavaScript and hands back twenty-nine characters of text. `gw-511` Mexico City: the Chamber of
Deputies' site returns **one character** of text, and `inah.gob.mx` — the obvious source for the city
before it was Mexican — is 403. `gw-512` Tokyo: the Metropolitan Government's English site is a news
index, the Imperial Household Agency's About page is a menu, and `sangiin.go.jp` reset the connection.

What was tried and does not answer, so that nobody spends the afternoon again: `loc.gov`,
`hansard.parliament.uk`, `rct.uk`, `parliament.uk`, `whc.unesco.org`, `harappa.com` and
`asiasociety.org` are **403**; `en.dpm.org.cn` and `nationalmuseum.gov.cn` return **502**;
`beijing.gov.cn` and `nass.gov.ng` reset the connection; `en.chinaculture.org` serves navigation chrome;
the Archaeological Survey of India and the National Archives of India publish pages of a few thousand
characters with no narrative.

---

## What is in the list, and what is not

The set is not a judgement call made card by card. It is **three rules, applied to `world.js`**, so that
every inclusion and every exclusion can be checked rather than argued:

1. **It carries an ISO 3166-1 code of its own.** That standard is a list of countries AND their
   dependencies maintained by a body with no stake in any of the disputes, which is exactly the question
   this deck asks. It admits Taiwan (TW), Western Sahara (EH), Palestine (PS), Hong Kong (HK) and Macau
   (MO); it excludes Somaliland, Northern Cyprus and every other self-declared state that no code covers.
   **Kosovo (XK) is the one entry outside ISO 3166-1 proper** — XK is user-assigned rather than official
   — and it is in because the European Commission, the IMF and the World Bank all use it, and because
   `world.js` draws Kosovo as its own shape whatever this deck decides.
2. **`world.js` carries a shape for it.** The card's question IS that shape, so an entity the map cannot
   draw cannot be asked about. This is what keeps Christmas Island, the Cocos Islands, Tokelau and
   Svalbard out: Natural Earth folds each into its sovereign's polygon, so there is nothing to shade.
3. **It has a settled resident population and an administrative seat.** Antarctica, the French Southern
   and Antarctic Lands, the US Minor Outlying Islands, Heard Island, South Georgia and the British Indian
   Ocean Territory are all coded and all drawn, and none of them is a place people live.

Six further `world.js` entries are dropped as **not an entity at all** — Natural Earth gives Brazilian
Island, Clipperton, the Indian Ocean Territories, the Coral Sea Islands, Ashmore and Cartier and Baikonur
their SOVEREIGN's ISO code, which is not a code of their own.

**The rules do not settle whether a place is a country**, and they are not meant to. The deck is called
*The countries and territories* and every question is phrased **"The country or territory shaded on the
map is ____"**, which is true of all 233 of them and asserts nothing about the sovereignty of any. A card
whose subject is contested says so in its own background, at the bar, with the dispute described and no
side's account repeated as established fact — that is the standing rule for every collection here.

## How the running order was chosen

**By population, largest first** — as asked. It is a good order for this subject as well as the one
requested: a learner meets India, China and the United States, whose outlines they half-know already, and
works down towards the atolls and the overseas territories, which is where a shape deck earns its keep.
Alphabetical would open on Afghanistan, Albania and Algeria — three hard shapes in a row.

**THE ORDER IS FIXED AT PLANNING TIME AND IS NOT RE-SORTED.** A card id is a permanent address: it is
what `data.js` files the card under, what a deck's `cardIds` lists, what a reader's schedule is keyed by
and what a shared study link points at. Populations move every year, so re-sorting the list would move
cards between ids and silently repoint every one of those. The order is a snapshot, and this is the
snapshot:

- **World Bank, `SP.POP.TOTL`, 2024** (`api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL`) for the
  212 entities that series covers.
- **The Atlas's own `country-stats.js`** (Wikidata, via `fetch-stats.js`) for the other 21, which are the
  small territories the World Bank does not publish.

Two consequences worth knowing rather than discovering. **India is `gw-001` and China `gw-002`**, which is
what the 2024 series says and the reverse of what an older figure would give — the two crossed over in
2023. And a card's own POPULATION FIGURE is researched and cited when the card is written; it is not this
snapshot. The snapshot decides the ORDER and nothing else, and the two will drift apart. That is expected
and is not a fault to correct.

## The background is the country's HISTORY, and it never repeats the boxes

**Two rules, given together in Aug 2026 on request, and they are one rule seen from two sides.** A country
card carries three things that say what the country IS — the map, the facts box and the date line — and a
background that then recites the same region, population, area, capital and dates is a card saying
everything twice and teaching nothing the second time. So:

- **Nothing in the background may repeat what is already in the facts box or the date line.** Not the
  capital's name, not the population, not the area, not the region, and not a date the date line carries.
  Where the story needs one of those dates, the date line supplies it and the prose tells the story around
  it: *"Revolutionaries in the south then revolted successfully against the Qing, ending an imperial system
  more than two thousand years old"* beside a date line reading `Republic · 1911`.
- **The background's main focus is the country's history.** Not its landscape, not its economy, not its
  statistics — its history, from as far back as the sources reach to how it arrived at the present.

The first three cards were written the other way round and rewritten the same day, which is worth
recording because the wrong version looks perfectly good: five figures cited to two impeccable statistical
sources, every marker in place, every checker green. **No tool can see this** — `add-card.js` counts words
and markers, `check-style.js` reads punctuation, and neither knows that the sentence it is checking is the
facts box in prose. It is read by eye, and the test is to put the answer block and the first block of the
background side by side.

**It changes the source list, which is the part that bites.** Every source must be referenced by a marker,
so a history-focused background cannot carry a statistical spine it never cites: the World Bank population
and surface-area rows came off all three cards, and **UNdata stayed as source [1] because it carries the
whole facts box AND one claim the background genuinely makes** — the country's UN membership, which each
card uses as the sentence that brings its history to the present. That is the shape to copy: *the facts
box is sourced by [1], and [1] earns its marker on the one sentence that is about the country's place in
the modern order rather than about its size.*

## Countries with more than one capital get a card each

**Ten countries have more than one seat, and each seat is its own card** (Aug 2026, on request: "for
countries with multiple capitals, give each their own card where the question makes it clear what sort of
capital it is"). The alternative — one card per country, asking for whichever seat the plan picked —
teaches the reader that Bolivia's capital is Sucre and quietly makes La Paz a wrong answer, which is the
one thing a country with two capitals is interesting for.

**So the QUESTION carries the qualifier, and it is the qualifier that makes the card answerable.** A bare
"the capital of the country shaded on the map is ____" has three right answers over South Africa and no way
for a reader to know which is wanted; "the judicial capital" has one. The qualifier is also the teaching:
a reader who meets Pretoria, Cape Town and Bloemfontein over the same shape learns what a country does when
it splits its government up.

| country | card | its question asks for |
|---|---|---|
| Tanzania | `gw-522` Dodoma | the capital |
| | `gw-751` Dar es Salaam | the acting capital |
| South Africa | `gw-524` Pretoria | the executive capital |
| | `gw-752` Cape Town | the legislative capital |
| | `gw-753` Bloemfontein | the judicial capital |
| Malaysia | `gw-544` Kuala Lumpur | the national capital |
| | `gw-754` Putrajaya | the administrative capital |
| Côte d'Ivoire | `gw-550` Yamoussoukro | the official capital |
| | `gw-755` Abidjan | the seat of government and largest city |
| Sri Lanka | `gw-561` Sri Jayawardenepura Kotte | the legislative capital |
| | `gw-756` Colombo | the commercial capital and largest city |
| Chile | `gw-566` Santiago | the capital |
| | `gw-757` Valparaíso | the city where the national congress sits |
| Netherlands | `gw-572` Amsterdam | the constitutional capital |
| | `gw-758` The Hague | the seat of government |
| Benin | `gw-576` Porto-Novo | the official capital |
| | `gw-759` Cotonou | the seat of government and largest city |
| Bolivia | `gw-579` Sucre | the constitutional capital |
| | `gw-760` La Paz | the seat of government |
| Eswatini | `gw-660` Mbabane | the administrative capital |
| | `gw-761` Lobamba | the legislative and royal capital |

**THE SECOND AND THIRD SEATS ARE NUMBERED IN A BAND OF THEIR OWN, `gw-751`–`gw-761`, and that is not
tidiness.** The pairing rule is that a country's capital is its own number plus 500, which is what lets a
reader meet a country and then its capital a day later; renumbering the capitals deck to make room would
move cards between ids, and a card id is a permanent address — the same reason the running order is never
re-sorted. So the first seat keeps the paired number and the extras take the next free band, in the running
order of the country they belong to. **The band is a fact about the deck, not about the seats**: Cape Town
is not a lesser capital than Pretoria for having a higher number.

**Israel and Palestine are still deferred**, and this rule is why the deferral is not a way of dodging them:
both have a capital question whose answer is the dispute rather than a division of labour between cities, so
neither a bare question nor a qualified one settles it. They are numbered in the running order like
everything else and will be written when they are reached, with the positions described and no state's
account of its own claim given as established fact.

**Seven numbers in the capitals deck are deliberately never used**, and each is the same kind of case —
a question with no content:

- **`gw-671` Western Sahara** has no capital in the table at all. Natural Earth carries two claims about
  the territory — Laayoune under Morocco and Bir Lehlou under the Sahrawi republic — and each is one
  side's answer to the same question. The builder drops both. Western Sahara keeps its COUNTRY card.
- **Singapore, Monaco, Vatican City, Hong Kong, Macau and Gibraltar** (`gw-614`, `gw-714`, `gw-732`,
  `gw-604`, `gw-667`, `gw-713`) are city-states and city-territories: the capital and the whole territory
  are the same place, so shading it and asking for its capital asks nothing. That is the District of
  Columbia's position in the United States plan — an entry the layer carries and the deck cannot ask a
  question about.

## The two questions

**A country card asks:** *"The country or territory shaded on the map is ____."*

**A capital card asks:** *"The dot on the map marks ____, the capital of the country shaded around it."*
— with `country or territory` where the entity is a territory, and with the qualifier in place of *the
capital* on the twenty-one cards of the ten countries that have more than one seat: *"…marks ____, the
judicial capital of the country shaded around it."*

**The capital question puts its blank in the MIDDLE, and that is not a stylistic preference.** The
obvious shape — *"The capital of the country shaded on the map is ____."* — is what the United States
collection uses, and it ends on the blank, which a map card is allowed to do. On `gw-503` the reveal
writes the answer into that blank and the line reads **"…is Washington, D.C.."**, with two full stops,
in the one line of the card a reader looks at twice. Dropping the card's own stop is not the fix:
`check-questions.js` rule 1 requires a closing stop, and it is right to. Moving the blank into the
middle of the sentence solves it for every capital at once, satisfies the house rule that a blank sits
mid-sentence rather than relying on the map card's exemption from it, and reads better — the dot is
what the reader is being asked about, so the sentence may as well start there.

## The names

**Two names per country, and they are different fields.** `map.key` is the `world.js` name, which is a
map LABEL and is abbreviated to fit on one — `Dem. Rep. Congo`, `Bosnia and Herz.`, `St. Vin. and Gren.`
The card's `answer` and `answerText` are the name a reader would give and a glossary term is keyed by:
*Democratic Republic of the Congo*, *Bosnia and Herzegovina*, *Saint Vincent and the Grenadines*. The
running order below prints the map key beside the answer wherever they differ, and `add-card.js` checks
the key against the real data file, so a typo in one is caught and a mismatch between the two is
deliberate.

**The capital's name is the table's key**, and the table is generated. Four capitals Natural Earth names
after their own country are renamed there with their fuller official names — Andorra la Vella, Luxembourg
City, the City of San Marino, Djibouti City — because a card asking for the capital of Andorra and
answering "Andorra" asks nothing. **Kingston is disambiguated**: Jamaica's keeps the bare key and Norfolk
Island's is `Kingston (Norfolk Island)`, which is also what the map labels it on reveal.

## Where the map data comes from

**`world-capitals.js`, built by `node .claude/build-world-capitals.js`** — 246 cities across 233 countries
and territories, 13.5 KB, its own lazy bundle (`worldcaps`), fetched only by a card that actually asks for
a dot. **Never hand-edited.** Read that script's header before touching it; the short version is that the
coordinates come from Natural Earth's own capital classes, that a point NE files under the wrong class or
under a former capital is dropped with its reason stated, and that the seventeen micro-territories NE has
no point for are fetched from the named Wikipedia article's own published primary coordinate — so what is
declared in the script is an ARTICLE TITLE, which is checkable, and never a number, which is not.

**Two limits of the shapes, measured rather than assumed, and both bite only at the bottom of the list.**

- **Fifteen capitals sit just outside `world.js`'s own coastline** — Banjul, Colombo, Monrovia, Nassau,
  Nicosia, Nouméa, Majuro, Tarawa, Nuku'alofa, Cockburn Town, Philipsburg, Brades, Saint Helier,
  Adamstown and Yaren. Nothing is wrong with either figure: the dot is this file's 4dp (about 11 m) and
  the coast is `world.js`'s 2dp (about 1.1 km), so a city on a headland can fall a kilometre outside a
  simplified shore. It is sub-pixel on a country and visible on an atoll. **The dot is not snapped to the
  shape** — snapping would move the city to flatter the map. The builder counts them on every run.
- **A micro-territory opens at the polygon ceiling and reads as a speck.** `CMAP_ZMAX` is 180 because
  `us-states.js` is stored at 3dp; `world.js` is 2dp, so the world layer's usable ceiling is lower still.
  Nauru is 0.05° across and would want thousands. This is the District of Columbia's limitation in the
  United States plan, and the population order is what makes it bearable — every card it affects is in
  the last thirty of 233.

## Sourcing

Every claim needs an openable link, at the five-source bar. This subject is unusually well served, and the
spine below was **measured from this sandbox** rather than assumed. It is also the spine the glossary's own
country pass (batches C0–D3) built and proved over 197 terms — read the C-batch findings in `CLAUDE.md`
before starting, because most of the traps are already recorded there.

- **UNdata country profiles** — `data.un.org/en/iso/<cc>.html`, server-rendered and per country. Capital,
  surface area, population, region, and a **UN membership date that dates the independence of most modern
  states for free**. It has no profile for a state without an ISO code, so Kosovo's `xk` 500s.
- **The World Bank API** — `api.worldbank.org/v2/country/<ISO3>/indicator/SP.POP.TOTL` for population and
  `AG.SRF.TOTL.K2` for surface area, both as a series, so a figure can be dated rather than guessed at.
  Pass a semicolon-separated country list in one request. It serves a **UTF-8 BOM** (decode `utf-8-sig`).
- **The Office of the Historian's country pages** — `history.state.gov/countries/<slug>` — *A Guide to the
  United States' History of Recognition, Diplomatic, and Consular Relations, by Country, since 1776*. A
  page for every state, stating in prose when a country became independent and from whom.
- **The Commonwealth Secretariat** for its 56 members, and the **EU's own country pages** for its 27:
  each carries a Key Facts / accession block that dates the one datable claim in most third sentences.

**A MAP CARD CARRIES ITS PLACE'S FLAG AND NO OTHER PICTURE, WHICH IS THE STANDING ANSWER TO THE
PICTURE RULE.** A new card ships with an illustration or a stated reason why not; the reason here is
that the card's own frame is already a picture — the globe window is the question — and a second one
inside the background would compete with it. A country card carries `answerFlag` instead, and the
GLOSSARY term paired with it is where an illustration goes. `gw-503`'s term carries an aerial
photograph of the Mall for exactly that reason.

**THE CAPITALS NEED A SPINE OF THEIR OWN, AND IT IS NOT THE ONE ABOVE.** Every source in the list above
is organised by COUNTRY, and a capital card needs a city's history: when the seat moved there, who laid
it out, what was there before. Measured from this sandbox on the day the collection shipped, that is the
thin part of the subject and it is why `gw-501` is not written yet. What answers: **UNdata's own capital
row** and its capital-city population (which is the URBAN AGGLOMERATION, not the city proper — Delhi's
29.4 million is not New Delhi's, and a card that prints one as the other is wrong by two orders of
magnitude); the **UN Demographic Yearbook** at `unstats.un.org`; **UN-Habitat**; and the recognition
guide where a capital happens to be where a legation was opened. What does NOT: `loc.gov`, `census.gov`
and `congress.gov` are all **403**; `senate.gov` serves its 404 page **with a 200 status and a constant
37,523 bytes**, so a size check tells them apart; `archives.gov` has **no Residence Act milestone**
(`/milestone-documents/residence-act` is a 404); the National Park Service's own pages render their
history through JavaScript and hand back navigation chrome; and `beijing.gov.cn` resets the connection.
**Find the city spine before writing the batch, not during it** — three country cards were written in
the time it took to establish that the obvious capital sources do not answer.

**THE TEST HAS NOW DECIDED THIRTEEN CAPITALS AND HAS NOT BEEN WRONG ONCE.** Washington, Islamabad,
Brasília, Addis Ababa and Cairo passed it and are written; New Delhi, Beijing, Jakarta, Abuja, Dhaka,
Moscow, Mexico City and Tokyo failed it and are deferred. **Manila failed it and was written anyway**,
from the Spanish-American War and Philippine-American War milestones, which is the precedent to follow:
where a capital's own institutions are unreachable, the event literature about the city can still carry
a card, and only the facts box suffers (see its three-row entry below). Kinshasa is the same shape and
comes next. **Addis Ababa widens what counts as the institution.**
Ethiopia's own government publishes nothing reachable, but the city is the seat of the AFRICAN UNION,
which publishes both its founding story — 32 heads of independent African states meeting there in May
1963 to sign the OAU charter — and the fact that its Commission sits there. An international body
headquartered in a capital keeps a record of that capital, and it is a record nobody thinks to look for.
The recognition guide then supplied the rest: a legation opened in Addis Ababa in 1909, closed when
Italian forces occupied the city, and reopened in 1943 — **the comings and goings of a foreign mission
date an occupation as precisely as a history book would.** **Brasília is the most instructive pass**, because the institution that answered was not the
city's builder but its OCCUPANT: the Câmara dos Deputados publishes the list of every seat the chamber has
held — Cadeia Velha, Palácio Monroe, Biblioteca Nacional, Palácio Tiradentes, and then *Palácio do
Congresso Nacional, Brasília (1960 até hoje)* — which dates the move of the government to the new capital
from the record of the body that made it. **A legislature's own account of where it has sat is a capital's
history told sideways, and it is often the only version published.** The page is in Portuguese; a source in
any language qualifies.

**THE TEST HELD ON ITS SECOND OUTING, WHICH IS WHY IT IS WORTH TRUSTING.** `gw-505` Islamabad was
written from the **Capital Development Authority** — the body created in 1960 to build the city, which
publishes both a page about Islamabad and a page about itself — and from the **National Assembly of
Pakistan's** own history of the Constituent Assembly at Karachi. Two institutions that sit in or made
the capital, both publishing their own record. Jakarta and Abuja failed the same test on the same day.

**Where a city HAS an institutional history of its own, the card is easy and good, which is what
`gw-503` shows.** Washington is carried by the **Architect of the Capitol** (the Residence Act, the site
chosen from land ceded by Maryland, L'Enfant's plan and his dismissal, Jefferson's competition,
Thornton's late entry, the government moving into a half-built Capitol, the burning of 24 August 1814),
the **Office of the Historian's *Buildings of the Department of State*** (which dates the government's
arrival by tracking one department through four addresses in sixteen months) and **whitehouse.gov's own
history** (Hoban's design, the Adamses moving into an unfinished house, Monroe's return). **The question
to ask of any capital is whether the bodies that sit in it publish their own history** — a parliament, a
national archive, a city government, a presidential residence. That is the search to run first, and it
is what New Delhi and Beijing failed.

**THE FRUS PREFACES ARE A NARRATIVE SOURCE, AND THEY ARE ON A HOST THAT ANSWERS.** *Foreign Relations
of the United States* is a documentary series rather than a history, so it is easy to pass over — but
each volume opens with a signed editorial **preface** at
`history.state.gov/historicaldocuments/<volume>/preface`, and a preface says in prose what the volume is
about. The 2017 retrospective Iran volume's says outright that the 1989 volume "did not provide any
documentation on the role of the Central Intelligence Agency … or documentation on the covert action
that led to the overthrow of Iranian Prime Minister Dr. Mohammad Mosadeq on August 19, 1953", and that
the criticism this drew produced the 1991 statute obliging the Department to publish a thorough record.
That is a cited sentence for an event the milestones do not cover at all: **there is no Mossadegh
milestone, no hostage-crisis milestone and no Iranian-revolution milestone** (`/milestones/1953-1960/mossadeq`
and `/milestones/1977-1980/hostage-crisis` are both 404), so without the prefaces `gw-017` would have
had a two-source spine. Reach for a volume preface whenever the milestone series is silent on a country's
central 20th-century event. The volume id is worth checking rather than guessing: the retrospective Iran
volume is **`frus1951-54Iran`**, while `frus1952-54Iran` — which is how the volume titles itself — is a
404.

**MANILA AND KINSHASA WERE TESTED IN THIS BATCH AND BOTH FAIL THE INSTITUTIONAL ROUTE.** Every Philippine
government domain tried answers **403** from this sandbox — `officialgazette.gov.ph` (including the page
for Presidential Decree 940, which returned the capital to Manila in 1976), `senate.gov.ph`,
`legacy.senate.gov.ph`, `nhcp.gov.ph`, `dfa.gov.ph` and `manila.gov.ph` — and the recognition guide's
Philippines page is the thinnest in the guide, four sentences that name no city. The Democratic Republic
of the Congo's presidency site (`presidence.cd`) is a JavaScript shell and `gouvernement.cd` and
`assemblee-nationale.cd` do not resolve. **Neither city is deferred, because the milestone series carries
both**: Manila by *The Spanish-American War, 1898* (Dewey in Manila Bay on 1 May, troops landing on 10
June) and *The Philippine-American War, 1899–1902* (Luzon, the Philippine Republic, the civil government
under Taft in 1900, the first elected assembly in 1907); Kinshasa by *The Congo, Decolonization, and the
Cold War, 1960–1965*, which names Leopoldville and Kinshasa together, and by the country page, which
dates the American embassy there to the day of independence. **The institutional test is the first search
to run, not the only one** — where a capital's own bodies are unreachable, the event literature about the
city can still carry a card.

**Two other bodies were tried for Cairo and neither answers**: the League of Arab States, which is
headquartered there and would have been the Addis Ababa route exactly, serves a **"Request Rejected"
page** from its WAF, and `parliament.gov.eg`, `sis.gov.eg` and `egypt.gov.eg` do not resolve at all. What
carried `gw-513` instead is the **recognition guide's Egypt page, which is unusually city-specific** —
the Agent and Consul General at Cairo from 1849, Harding's recognition letter delivered there, the
legation established in June 1922, the UAR's capital established at Cairo in 1958, the interests section
opened inside the **Spanish embassy** in the city the day after relations were cut in 1967, and the
embassy reopened in 1974. **A guide page that names the capital in every entry is itself a city source.**

**TÜRKIYE AND TURKEY, AND WHICH NAME A CARD USES.** `world.js` keys the shape `Turkey`, the running order
below says Turkey, and the recognition guide's page is titled Turkey — so the card's `answer` is
**Turkey**, which is also the name a reader would type. UNdata lists the country as **Türkiye**, and
`gw-018` says so in its last sentence, marked to UNdata: the two names are a fact about the sources, and
stating it is better than choosing one silently. Its population is the batch's one figure worth
recording: UNdata gives 87,685 thousand for 2025 against the World Bank's 85,878,556, a 2% gap that is a
real methodological disagreement rather than a stale figure, and the card uses UNdata's because every
sibling card's four facts come from UNdata and one basis across the deck is worth more than a closer
figure on one card.

**THREE MORE SOURCES JOINED THE SPINE IN THIS BATCH, AND EACH ANSWERS A DIFFERENT KIND OF GAP.** The
Office of the Historian has only three pages that mention Thailand at all — the country page and,
through SEATO, one milestone — so a card at the five-source bar needed two works nobody had used here
before. **The WTO's member pages** (`wto.org/english/thewto_e/countries_e/<slug>_e.htm`) state a
member's WTO and GATT accession dates in one sentence, which is a datable claim for any country in the
trading system; the Egypt card had already used one. **The UN Digital Library**
(`digitallibrary.un.org`) is reachable and searchable, and it holds the General Assembly resolution
admitting each member — which is not merely a second citation for a date UNdata already gives, but a
better fact: resolution 101 (I) is headed *Admission of **Siam** to Membership in the United Nations*,
so the record shows the country entering under a name it no longer uses. **Search it by the claim
rather than the country**, and note that its record page gives the resolution's adoption date (15
December 1946) where UNdata gives the membership date (16 December 1946) — two different events a day
apart, so cite one or the other and do not mix them in a sentence. Third, **the World Bank's
surface-area series can carry a marker of its own**: `gw-021`'s facts box uses 243,610 km², the figure
batch D1 put on the `United_Kingdom` glossary term, against UNdata's 242,495 — so the card cites the
World Bank as well, and earns that citation on a sentence that says what the figure is *of* ("six
counties of northeast Ulster chose to remain part of the kingdom … and it is that territory whose area
the World Bank measures today"). **Where a card must diverge from Source A to agree with its own
glossary term, cite the source it is agreeing with and give it a real sentence.**

**A NEIGHBOUR'S COUNTRY PAGE IS OFTEN THE BEST SOURCE FOR A COUNTRY'S OWN BORDERS.** The United
Kingdom's page in the recognition guide is long on consulates and says nothing about the union changing
shape; **Ireland's** page opens with the whole of it — the Anglo-Irish Treaty of 6 December 1921, the
26 counties constituted as the Irish Free State, the six counties of northeast Ulster that chose to
remain — and the American recognition of the Free State in 1924. D3 found the same shape when El
Salvador's page carried Nicaragua's independence date. **Read the page of the state that left.**

**`gw-514` MANILA IS THE FIRST CAPITAL CARD WITH A THREE-ROW FACTS BOX, AND THAT IS A REFUSAL RATHER
THAN AN OVERSIGHT.** The natural fourth row is `Replaced · Quezon City` — the capital moved there in
1948 and came back in 1976 — and **no reachable source states it**: every Philippine government domain
tried is 403 (`officialgazette.gov.ph`, including its page for Presidential Decree 940, plus
`gov.ph`, `senate.gov.ph`, `nhcp.gov.ph`, `dfa.gov.ph`, `manila.gov.ph`, `ncca.gov.ph`), the Wayback
Machine has no snapshot of the decree, and UN-Habitat's Philippines page names Quezon City only as a
major city. **A facts box row is a claim like any other**; three cited rows are better than four with
one resting on nothing.

**THE PICTURE ON A CAPITAL'S GLOSSARY TERM IS A COMMONS THUMBNAIL, NOT THE ORIGINAL.** 571 of the
glossary's illustrations and 363 of the cards' already point at
`upload.wikimedia.org/wikipedia/commons/thumb/…/1280px-….jpg`, and the reason showed up here: Metro
Manila's Sentinel-2 image is **108 MB** at full size, which no reader should be asked to fetch for a
popup. The Cairo image was moved to its 1280px thumbnail in the same pass. Two Manila candidates were
rejected and the reasons are the usual ones — ESA's own Manila image is properly attributed but 605px
on the long side, under the pipeline's ~900px bar, and the Landsat image of the bay is categorised PD
NASA with **no machine-readable author or source**. `suggest-image.js` offered five photographs of a
2024 diplomatic conference in Manila, which is the name-match trap its own header warns about.

**A UNdata FOOTNOTE IS A CITABLE FACT, AND IT SOLVED THE THREE-CAPITAL PROBLEM.** The profile's
`Capital city` row for South Africa reads `Pretoria` with a footnote marker, and the footnote itself
says: *Pretoria is the administrative capital, Cape Town is the legislative capital and Bloemfontein is
the judiciary capital.* So `gw-024`'s facts box can say `Capital · Pretoria (administrative)` on Source
A's own authority rather than picking one seat silently or contradicting the glossary term, which names
all three. **Read the footnotes at the bottom of a UNdata profile before deciding a field is bare** —
they carry the qualifications the table has no room for.

**THE COMMONWEALTH'S JOINING LINE ANSWERS A SECOND QUESTION IT WAS NOT ASKED: WHEN A MEMBER LEFT.**
C4 and C6 measured that line as an independence date; South Africa's reads *"Joined the Commonwealth
1931, on independence from Britain. South Africa left the Commonwealth in 1961 then re-joined in
1994"*, which dates the declaration of the republic and the first democratic election from a body with
no stake in either reading. `gw-024` cites it twice for exactly that. Tanzania's page carries the
capital ambiguity in the same field — *"Dar es Salaam (acting), Dodoma (official)"* — which is a cited
sentence about a capital move no other reachable source states.

**THE UN DIGITAL LIBRARY EARNS ITS PLACE ON THREE CARDS IN A ROW, AND ITS TITLES ARE THE POINT.** A
resolution's own heading is a primary fact about what a state was called and what was done to it:
`A/RES/1667(XVI)` is *Admission of **Tanganyika** to membership in the United Nations*, and
`S/RES/143(1960)` is filed as *calling upon Belgium to withdraw its troops from **the Congo (capital
Leopoldville)*** — the UN naming the country by a capital under a name it no longer uses, which is the
whole subject of `gw-515`. **Search the library by the CLAIM and read the record's title**, which is
where the usable sentence usually is; the record page also gives the meeting number and date (the
986th meeting for Tanganyika, the 873rd for the Congo) where the resolution text itself is a PDF.

**A THIN COUNTRY PAGE IS NOT A THIN CARD.** The recognition guide's Tanzania page is four sentences and
one date, which would have left `gw-022` two short of the bar; the Commonwealth, the WTO, the UN
resolution and the decolonization milestone made six sources between them without a single stretched
marker. **When the guide is thin, the country is usually a Commonwealth member, a WTO member and a UN
admission of its own** — three institutional records that exist for almost every state and that nobody
has to search for.

**THE CHECK AGAINST THE GLOSSARY TERM FOUND ITS FIRST REAL ERROR, AND IT WAS IN THE TERM.** The
`Italy` term gave the country's area as 301,340 km², and **neither of its own two citations says so**:
UNdata gives 302,068 and the EU country page gives 302,073, with the World Bank at 302,070. The figure
sat 730 km² below a cluster of three sources, which is outside their spread, so by C9's rule it is a
correction rather than a divergence — the term now reads 302,068 km² (116,629 sq mi) and `gw-025` uses
the same. `Myanmar` was corrected by one square kilometre in the same pass (676,578 → 676,577, its own
UNdata figure) purely so the card and the term print the same number. **Do the comparison before
writing the card, not after**: the term is where a wrong figure has been sitting longest, and this is
the first of the twenty-seven where the card was right and the term was not.

**A CAPITAL CAN HAVE TWO SPELLINGS AND THE CARD SHOULD SAY SO RATHER THAN PICK ONE SILENTLY.** UNdata
writes Myanmar's capital **Nay Pyi Taw**; `world-capitals.js` (from Natural Earth), the `Myanmar`
glossary term and this plan's running order all write **Naypyidaw**, which is also what `gw-527` will
have to answer. So `gw-027`'s facts box carries Naypyidaw — three surfaces against one — and its last
sentence names the UN's spelling, cited to UNdata, which is the same move `gw-018` makes for Türkiye
against Turkey. **Where the deck and Source A spell a place differently, the deck wins the facts box
and the sentence explains why.**

**THE UN ADMISSION RESOLUTION IS NOW A ROUTINE FIFTH SOURCE, AND ITS RECORD PAGE GIVES THE MEETING.**
Three more were used in this batch — `A/RES/1976(XVIII)` for Kenya at the 1281st plenary meeting,
`A/RES/188(S-2)` for **the Union of Burma** at the 131st plenary meeting of the second special session,
and `A/RES/1667(XVI)` for Tanganyika before them — and each names the state as it was then called.
Search `digitallibrary.un.org` for *Admission of &lt;name&gt; to membership in the United Nations*; the
useful sentence is in the record's title and its *Adopted at the …* line, and the resolution symbol is
in the page's own metadata.

**COMMONS HAS NO OVERHEAD PICTURE OF HANOI, WHICH BREAKS A PATTERN WORTH KNOWING ABOUT.** Every capital
term so far carries a view from above — the Mall from the air, Islamabad from the ISS, the Plano
Piloto, ASTER over Addis Ababa and Cairo, Sentinel-2 over Metro Manila, the ISS over Kinshasa and
Brazzaville — and searches for a satellite or aerial Hanoi return nothing at all (the
`Satellite pictures of Hanoi` category is empty). What was used instead is a **pre-1945 aerial of West
Lake and Trúc Bạch Lake from the Gouvernement général de l'Indochine**, public domain and squarely of
the period the term describes, at **675×504 — under the pipeline's ~900px bar**, which is a deliberate
exception: the popup's picture box is smaller than the file, and the alternative was a modern
ground-level photograph that would have been the first of its kind on a capital term. **Record an
exception like this rather than quietly lowering the bar.**

**C9's STANDING SUDAN GAP IS CLOSED, AND THE WAY IT CLOSED IS THE POINT.** C9 recorded that
`Sudan`'s UNdata profile *has no Surface area row at all* — the only one in Phase 3 — so the term's
1,861,484 km² "rests on nothing openable here", and it stayed that way. The World Bank's
`AG.SRF.TOTL.K2` answers, and the series is self-evidencing: **2,505,810 km² for every year to 2011
and 1,878,000 for every year from 2012**, which is South Sudan's secession visible as arithmetic. The
term is corrected to 1,878,000 km² (725,100 sq mi) with the World Bank added as its third source, and
`gw-030` carries the same figure and says in its own last sentence that the UN profile has no
surface-area row. **A series with a step in it dates the step**, which no single-year figure can.

**THE ICJ IS A COUNTRY SOURCE, NOT JUST A REACHABLE HOST.** C7 recorded `icj-cij.org/case/<n>` as
200; this batch is the first to use one. The case page for *Territorial and Maritime Dispute (Nicaragua
v. Colombia)* (case 124) carries, in prose, the 1928 treaty in which Colombia recognised Nicaragua's
sovereignty over the Mosquito Coast and the Corn Islands while Nicaragua recognised Colombia's over
San Andrés, Providencia and Santa Catalina, the 2012 judgment awarding Colombia the seven disputed
cays, and the reasoning that moved the maritime boundary eastwards. **Where a country's borders have
been to the Court, the case page is a five-source card's fifth source**, and the summaries are long,
dated and quotable.

**THE SOUTH KOREA GUIDE SLUG IS `korea-south`.** `south-korea` is a 404, `korea` is a different page,
and the guide titles it *The Republic of Korea (South Korea)*. Add it beside D2's `burma` for Myanmar,
C8's `congo-democratic-republic` and `congo-republic`, and C9's `cote-divoire`: **the guide's slug is
worth a probe rather than a guess**, and the index at `history.state.gov/countries` resolves the rest.
Its own page is two sentences long, so the card is carried by the Korean War and two-Koreas milestones
— the second of which states outright that *"In 1991 both Koreas were simultaneously admitted into the
U.N."*, which is the fact a resolution search would otherwise have been needed for.

**TWO MORE TERM FIGURES WERE OUT, AND BOTH FAILED A DIFFERENT TEST.** `South_Korea`'s 100,363 km² sits
below UNdata's 100,401 *and* the World Bank's 100,440 — outside the spread, so C9's rule corrects it.
`Colombia`'s "about 52 million" is a point on the World Bank series (the 2022–23 value), so by C8's
diagnostic it is **stale rather than contested** and was moved to 53 million. Three of the last seven
countries have needed the term corrected before the card could be written; **the comparison is now the
first step of a card, not a check at the end of one.**

**THE CHIEFS OF MISSION DATABASE IS A CAPITAL SOURCE, AND IT IS THE BEST ONE FOUND SO FAR FOR A SEAT
THAT MOVED.** `history.state.gov/departmenthistory/people/chiefsofmission/<country>` lists every
American head of mission with the exact dates of each commission, and read as a series it shows things
no narrative page states: for Turkey, **Abram Elkus ends on 20 April 1917 and nobody succeeds him until
Joseph Clark Grew presents credentials on 12 October 1927** — the ten-year break, and the moment the
mission starts being accredited to a republic instead of an empire. That, with the recognition guide's
"exchange of notes in Angora", is what carries `gw-518`, and the same list will carry any capital whose
mission was interrupted or moved. **Note the database is frozen** — a banner says updates were
suspended in January 2024 — which is a limit on recent entries and no limit at all on historical ones.

**A COUNTRY THAT IS NOT IN THE WTO STILL HAS FIVE SOURCES.** `wto.org/.../algeria_e.htm` is a 302
(Algeria is an observer, not a member), which removes the routine fourth source used on eight cards
now. What replaced it is **the Barbary Wars milestone**, and the fit is exact rather than lucky: the
Algeria guide's own recognition entry is a peace treaty of 1795 with the Dey of Algiers, and the
milestone supplies the war that treaty ended and the squadron sent in 1815. **When the WTO page
redirects, look for the milestone that covers the country's oldest dealing with the United States** —
the guide will usually have named the event already.

**TWO MORE TERM FIGURES CORRECTED, ONE OF EACH KIND, WHICH IS NOW THE EXPECTED RATE.** `Uganda`'s
241,038 km² sits below UNdata's 241,550 and the World Bank's 241,550 — identical to each other, so the
term was simply outside — and its "roughly 48 million" is the 2023 value on the World Bank series, so
by C8's diagnostic it is stale and moves to 51 million. `Spain`'s 505,990 km² was INSIDE the spread
(UNdata 506,008, the EU 505,983, the World Bank 505,978) and so was not a correction by C9's rule, but
the card and the term may not print different digits, so both now carry UNdata's figure. **Inside the
spread is a reason not to CORRECT a term, never a reason to let two surfaces disagree.**

**Spain is also C2's warning intact after two years**: the EU country page gives its population as
49,077,984 against UNdata's 47,890 thousand, and the card and term both take UNdata's 48 million. The
EU page is the right source for the accession date and the wrong one for the population.

**`gw-036` AFGHANISTAN SHIPS WITHOUT A FLAG, AND THAT IS A DECISION RATHER THAN AN OVERSIGHT.**
Commons redirects `Flag_of_Afghanistan.svg` to **`Flag_of_the_Taliban.svg`**, whose own file page
describes it as *"Flag of the Islamic Emirate of Afghanistan (Taliban), introduced in 1997"*. Drawn
unlabelled beside the answer term, that shape asserts who legitimately governs; drawn instead, the
2004–2021 republic's flag asserts the opposite. `answerFlag` is optional in `add-card.js`, so the card
carries none, and its prose says — cited to the recognition guide — that a coalition campaign began in
2001 and that the mission has been headed by a chargé d'affaires since 1979. **The convention for the
rest of the deck is unchanged**: where Commons resolves `Flag_of_<Country>.svg` to a file that is
simply the country's flag, the card carries it. Where the redirect lands on a file named for a
faction, stop and put the question to the reader rather than answering it in a picture. **If this
should be revisited, the two candidates are named above and either is one line of JSON.**

**A CAPITAL WITH A GLOSSARY TERM ALREADY WRITTEN IS THE EASY CASE, AND IT DICTATES THE FACTS BOX.**
`Berlin` was cited in an earlier pass to the **Basic Law** (article 22(1) names the city as the
capital) and to the **Amt für Statistik Berlin-Brandenburg**, and it gives the city's population as
3,913,644 at the end of 2025 — against UNdata's 3,556.8 thousand, which is the figure Source A carries
for the capital. The card takes the statistics office's, because the term already does and the two may
not disagree, and adds that office as a **sixth source** with its own marker. **Where a capital's own
statistical service is reachable, it beats UNdata's capital-city row** — that row is an agglomeration
estimate and the office is counting residents.

**IRAQ AND ARGENTINA ARE BOTH CARDS WHOSE FIFTH SOURCE IS A UN OR WORLD BANK RECORD RATHER THAN A
MILESTONE.** Iraq is not a WTO member (`iraq_e.htm` is a 302, as Algeria's is), so the fifth source is
**`S/RES/660(1990)`**, adopted at the Security Council's 2932nd meeting on 2 August 1990 — the day of
the invasion, which is what makes it worth a sentence. Argentina's is the **World Bank surface-area
series**, cited because UNdata is the outlier there (2,796,427 km² against 2,780,400 at both the World
Bank and the glossary term, C12's South American pattern again) and because the series has carried the
same value every year from 2002 to 2022, which is itself the sentence the marker sits on.

**Two more term figures reconciled**: `Iraq`'s "roughly 46 million" is the 2023 value on the World Bank
series and moves to 47 million; `Afghanistan`'s 652,867 km² sits three above UNdata's 652,864 and four
above the World Bank's 652,860, which is outside the spread by C9's rule and moves to UNdata's.

**Batch 12 (Canada, Yemen, Morocco, Bangkok) is where one country needed its two figures taken from two
DIFFERENT sources, and the reason is an error rather than a disagreement.** `Canada`'s area is UNdata's
9,984,670 km² and its population the World Bank's, because the World Bank's area series gives Canada
**15,634,410 km²** — half as much land again as the country has, and the third outright error in that
series after C11's Dominican Republic and D1's Monaco. C9's rule is that an area is corrected only where
the term falls outside the spread of two sources; the rule underneath it is that a source has to be
PLAUSIBLE before it is allowed into the spread at all, and a figure exceeding Russia's is not. The card
says so in its own prose rather than quietly preferring one number, since a reader checking the World
Bank would otherwise find the site's figure contradicted by a source the site itself cites elsewhere.

**Yemen is the batch's reminder that a fifth source is sometimes a RESOLUTION rather than a paper.** Four
works carried it to the bar less one, and the fifth is Security Council resolution **2216 (2015)**, whose
own title names the arms embargo and the demand that the Houthis withdraw — an act of state, dated, and
served by `digitallibrary.un.org` where `un.org/securitycouncil/*` returns CloudFront's 200-status
"Request blocked" page. **Reach for the Digital Library, never the topic section.**

**And Bangkok ships without a picture, which is a sandbox limit and not a search that failed.** Every
Wikimedia endpoint — the Commons `api.php`, `api.wikimedia.org` and `upload.wikimedia.org` alike —
answered "You are making too many requests to the API" for the whole of the batch, including for files
already shipped on other terms, so the rate limit is the host's view of this sandbox rather than anything
about the file wanted. **Say which of the two it is**: a term with no reachable picture is worth
revisiting on the next run, where a term with no picture in existence is not.

**Batch 13 (Angola, Ukraine, Poland, London) found the primary source that proves a claim about the
United Nations seats of the Soviet republics, and it is a routine conference paper.** C3 recorded that
`Belarus` and `Ukraine` both show a UN membership date of 24 October 1945 and warned that a marker there
dates the USSR's founding seat rather than the 1991 independence. The thing that was missing was a
document showing the republic sitting in its own right, and **A/CONF.104/18** is one: a note handed to
the president of the UN Conference on the Least Developed Countries at Paris in September 1981, whose
signatories list the Ukrainian Soviet Socialist Republic and the Union of Soviet Socialist Republics as
two separate delegations, one after the other. **Where a claim about how a state was represented needs
proving, look for a credentials paper rather than a history**: the delegation list IS the evidence, it is
dated, and the UN Digital Library serves it.

**Ukraine's population is the pass's first correction to a FRAMING rather than to a figure.** The term
said "about 41 million people recorded before 2022 and far fewer since"; the World Bank series gives
44.3 million for 2021 and 41.0 million for 2022, so 41 million is what was recorded IN the invasion
year, not before it. C8's test asks whether the series passes through the term's figure, and it does —
which is exactly why the error survived: a stale figure and a figure attached to the wrong period look
identical to that test. **Read what the sentence CLAIMS about the figure's date, not only whether the
figure is on the curve.** The term now gives roughly 44 million before the 2022 invasion and 39 million
now, and the card states the fall in full: 45.8 million in 2015 down to 38.98 million in 2025, about one
recorded person in seven in a decade.

**And Poland is where three sources disagree by more than the term does, so nothing was corrected.**
UNdata gives 38,141 thousand people and the World Bank 36,435,861, a 4.5% spread, with the term's
"roughly 37 million" sitting between them; the areas are 312,679 at UNdata, 312,720 at the World Bank
and 312,696 in the term, again inside. C9's rule holds in both directions and the batch is a reminder
that it usually means doing nothing.

**Batch 14 (Uzbekistan, Malaysia, Saudi Arabia, Dodoma, Dar es Salaam) settled a divided capital from a
source the plan had already spotted and not yet used, and it changed one of the plan's own rows.** The
Commonwealth Secretariat's Tanzania page gives *"Capital: Dar es Salaam (acting), Dodoma (official)"* — so
the second seat is not, as this file's table said, "the former capital and largest city" but the ACTING
capital, a live arrangement rather than a historical one. The row is corrected and both questions now ask
for a status the source states in the word it uses. **A seat's description is researched with the card, not
taken from the plan**: the running order fixes which cities get cards and what each is called is a finding.

**Saudi Arabia is the first country where the two sources disagree about BOTH headline figures, and neither
was corrected.** UNdata gives 34.6 million people and 2,206,714 km²; the World Bank gives 37.0 million and
2,149,690 km² — a 7% gap on the population and 2.6% on the area, with the term's own figures inside both
spreads. C9 forbids correcting a figure inside the spread, so the population moved only from "roughly 34"
to "roughly 35 million" because 34 sat BELOW both sources, and the area was left exactly as written. The
card says so in its own last sentence rather than presenting one source's number as the answer. **Where two
sources bracket a figure widely, say that the figure sits in a spread; do not pick an end and go quiet.**

**Two access findings, both about a page that exists.** The recognition guide does not use one heading:
most country pages open on **Summary** and Uzbekistan's opens on **Historical Overview**, so a script
keying on "Summary" reports a live page as empty — which is how Uzbekistan looked unsourceable for a
minute. And the WTO's `countries_e/<slug>_e.htm` path exists only for MEMBERS: Uzbekistan, an acceding
observer, **302s to an error page served with a 200**, the sixth variety of 200-status error document this
pass has met. Uzbekistan was carried instead by two General Assembly resolutions — its admission,
46/226 of 2 March 1992, and 75/266 of 2021 on cooperation with the International Fund for Saving the Aral
Sea, which is the way to cite the Aral Sea from here at all.

**And UNdata's own footnotes carry the dual-capital facts for the countries still to come.** Malaysia's
profile footnotes its capital field with *"Kuala Lumpur is the capital and Putrajaya is the administrative
capital"* — the same shape as the Commonwealth's Tanzania line, and the source `gw-544` and `gw-754` will
need. **Read the footnote letters on a UNdata profile before looking elsewhere for a divided seat.**

**Batch 15 (Mozambique, Ghana, Peru, Paris) caught the recognition guide contradicting UNdata, and
UNdata is right.** The guide's Peru summary states that *"Peru has been a member of the United Nations
since 1949"*; UNdata gives **31 October 1945**, which makes Peru an original member. The card cites
UNdata for the date and says in its own prose that the guide is wrong about it, rather than quietly
preferring one and leaving a reader to find the clash. This is P2's finding — a spine source is not
infallible, read the whole page rather than the sentence that matches — arriving inside Phase 3's own
spine. **Check a membership date against UNdata even when the guide states one.**

**Ghana and Peru are the other end of the Saudi Arabia case, and worth recording for the same reason.**
Saudi Arabia's two sources differ by 7% on population and 2.6% on area; Ghana's differ by **6 km²** and
agree on the population to the thousand, and Peru's differ by **four tenths of a square kilometre**
(1,285,216 against 1,285,215.6) and agree on the population exactly. The spread between two official
sources is not a constant — it is a fact about the country, and reading it tells you how much weight a
single figure will bear.

**Mozambique's fifth source is a Security Council resolution about what the country DID.** Its diplomatic
record is four months long — recognition in June 1975, admission in September, an embassy in November —
and what carries the rest of the card is **S/RES/386 (1976)**, adopted unanimously on 17 March 1976 on
Mozambique's own decision to impose sanctions on Southern Rhodesia, with economic assistance to
Mozambique among its subjects. **A newly independent state's first datable act is often its own
sanctions decision or border closure, and the Council minutes it** — so where a country's recognition
guide is thin, search the Digital Library for what the state did rather than for what was done to it.

**And Paris ships without a picture, for the second batch running and the same reason.** Every Wikimedia
endpoint answered "You are making too many requests to the API" throughout, though the picture URLs
written in earlier batches all verify at 200 when the throttle lifts — Bangkok's, left out of batch 12
for exactly this, was fetched and attached in batch 13. **The gap is a sandbox limit, not a search that
failed, and it is worth one retry per batch until it lands.**

**Batch 16 (Madagascar, Côte d'Ivoire and all three South African seats) found the source that makes a
divided capital teachable rather than merely listed.** The Commonwealth Secretariat's South Africa entry
does not give three names in a row; it gives the INSTITUTION that earns each its title — *"The Parliament
is in Cape Town, making it the legislative capital. The President and Cabinet meet in Pretoria, making it
the administrative capital. The Supreme Court of Appeal is in Bloemfontein, making it the judicial
capital."* That sentence is the spine of all three cards, and it is the difference between a reader
memorising three names and a reader understanding what a country does when it splits its government up.
**Read the Commonwealth's Capital field before assuming a divided seat needs hunting for.**

**Batch 14's rule about UNdata footnotes paid twice more.** South Africa's profile footnotes its capital
field with the same three-way split, and **Côte d'Ivoire's** with *"Yamoussoukro is the capital and
Abidjan is the administrative capital"* — which is the source `gw-550` and `gw-755` will need, and which
uses "administrative capital" where this file's table says "the seat of government and largest city".
Expect to correct that row when the pair is written, as the Tanzanian row was corrected in batch 14.

**Two admissions at one sitting, and the resolution numbers prove it.** Madagascar and Côte d'Ivoire were
both admitted at the **864th plenary meeting** of the fifteenth session on 20 September 1960 — resolutions
**1478 (XV)** and **1484 (XV)**, six apart, pages 64 and 65 of the same volume. Where a card wants to say
a state joined "along with others", the Digital Library's own meeting number and resolution numbering are
the evidence, and they are exact; **do not assert a COUNT of that day's admissions from memory**, which
is what a first draft of the Madagascar card did.

**And the WTO's country path has no slug for Côte d'Ivoire that could be found.** Every guessed form
302s to the error page served with a 200 (batch 14's finding), and the country IS a member — so the
card was carried by five other sources rather than by more guessing. **When a WTO slug will not resolve,
stop guessing and spend the source elsewhere.**

**Batch 17 (Nepal, Cameroon, Venezuela, Rome) is where a country's admission is best cited from the
resolution that FAILED.** Nepal and Italy were both admitted on 14 December 1955 under a single General
Assembly resolution, **995 (X)**, at the 555th plenary meeting — and four days earlier a Security Council
draft, **S/3502**, naming eighteen applicants including Nepal, *"was not adopted having failed to obtain
the required number of votes"*, in the Digital Library's own note. That pair of records carries the whole
Cold War deadlock over new members without a word of interpretation. **Where a card wants to say an
admission mattered, look for the draft that came before it**; the Library records failures as carefully
as successes, and the failure is usually the more instructive document.

**It also settles how to write the rounding midpoint, which had been decided ad hoc.** Peru's 34.577
million became "about 35 million" and Saudi Arabia's 34.566 became "roughly 35"; Cameroon's **29.879**
plainly becomes 30 and was corrected. But **Venezuela's 28.517 sits at the midpoint**, where "28" is 1.8%
low and "29" is 1.7% high, and the term already said 28 — so it was LEFT. **A figure at the rounding
midpoint is not wrong, and flipping it is an arbitrary edit dressed as a correction**; C9's rule about the
spread covers this too, since the term is inside it either way.

**Venezuela is also the widest area disagreement since Saudi Arabia**: UNdata gives 929,690 km² and the
World Bank 912,050, a spread of 17,640 km² or nearly 2%, with the term's 916,445 inside it. Neither source
treats the country as disputed, so the card states the spread rather than choosing an end, which is now
the established treatment.

**And Rome's card is carried by a mission that FOLLOWED a capital.** The American legation moved Turin →
Florence in 1865 → Rome in 1871, which dates the capital's own arrival by dating the embassy's; the
consulate in the city had been open since 1797 and closed only in 1965; the embassy shut on 11 December
1941 when Italy declared war and reopened on 8 January 1945. **A capital card's best spine is often the
list of where a foreign mission sat**, because a mission moves when the seat of government does and the
recognition guide dates every move.

**Batch 18 (Australia, Niger, North Korea, Nairobi) met the first country with NO page in the
recognition guide, and the reason is the fact itself.** `history.state.gov/countries/korea-north` and
`/north-korea` are both 404 because the United States has never recognised the state — the Korea plan
recorded this in advance and it is now met in practice. **A missing page is not a gap to route around
but a fact to route THROUGH**, and the card is carried instead by the Korean War milestone, which
narrates the division and the war, plus two Security Council resolutions: **702 (1991)**, recommending
both Koreas for membership in a single resolution at the 3001st meeting, and **1718 (2006)** on the
nuclear tests. **What a state has no bilateral record for, the Council usually has a multilateral one
for.**

**A first draft of that card asserted the missing page IN the prose and marked it to the milestone,
which does not say it.** The probe that established the 404 is this session's work, not a published
source, so the sentence was cut. **A negative established by probing is a research finding, not a
citable claim** — it belongs in this file, where it now is, and not in a card.

**Australia is the widest SOURCE disagreement of the pass so far and neither figure is wrong.** UNdata
gives 26,974 thousand people and 7,692,024 km²; the World Bank gives 27,614,411 and 7,741,220 — a 2.4%
spread on population and about 49,000 km² on area, which is larger than several whole countries in this
collection. The term's "about 7.7 million km²" and "roughly 27 million" sit inside both, so nothing was
corrected and the card states the spread, which is now the settled treatment after Saudi Arabia and
Venezuela.

**Niger is the opposite and worth recording for contrast: both sources give its area as exactly
1,267,000 km² and agree on the population**, and it has the fastest population growth of any country
carded — two fifths in a decade, 19.9 to 27.9 million. The spread between two official sources is a fact
about the country; Australia and Niger are the two ends of it.

**Batch 19 (Syria, Mali, Burkina Faso, Naypyidaw) found that the recognition guide records the same
country being recognised TWICE, under two different states, and both entries matter.** `Mali` was
recognised on 20 June 1960 as the **Federation of Mali** — Senegal and the Soudanese Republic together —
with the embassy at DAKAR; Senegal withdrew on 20 August; the Soudanese National Assembly legislated on
22 September that it would become the Republic of Mali; and the United States recognised THAT republic on
24 September, raising the consulate at Bamako while reaccrediting the Dakar embassy to Senegal and so
ending relations with the federation. `Syria` is the same shape at a larger scale: recognised in 1944,
extinguished into the United Arab Republic in 1958 with its embassy demoted to a consulate general,
re-recognised on secession in 1961, severed by Syria in 1967, and restored through an interests section
in the Italian embassy in 1974. **A country's entry in the guide is a sequence, not a date — read all of
it before writing the card's first sentence.**

**Two neighbours were opened by the same man in three days, and both guides say so.** Donald R. Norland
presented credentials as chargé d'affaires to **Niger** on 2 August 1960 to take effect on the 3rd, and
to **Upper Volta** on 4 August to take effect on the 5th. The device — credentials presented the day
before independence, effective on the day itself — appears in both entries, and the two admission
resolutions are numbered **1482** and **1483**, adopted at the same 864th plenary meeting. **Where a run
of colonies became states in one season, the guide's separate entries interlock; cite the sibling's page
when a card's best fact is the pairing.**

**A capital's own spelling can be a finding.** UNdata writes Myanmar's capital **Nay Pyi Taw**, in three
words, where the plan, the glossary and `world-capitals.js` write **Naypyidaw**; the term now carries the
UN's form as an alias and the card says which is which. **Check the profile's spelling of a capital
before writing the card**, and give the divergent form an alias rather than silently choosing one.

**And the Syrian flag is the Afghanistan case with the opposite answer.** `Flag_of_Syria.svg` redirects
on Commons to `Flag_of_Syria_(2025-).svg`, exactly as Afghanistan's redirects to the Taliban flag — but
that file's own description says it is the *"de facto flag of Syria beginning December 2024, official
beginning March 2025"*, which is a statement about the STATE rather than about one faction, so it ships.
Afghanistan's was withheld because the target page describes the Islamic Emirate's own flag and either
choice would assert who legitimately governs. **Read the file page before treating a flag redirect as
either safe or unsafe**; the redirect alone settles nothing.

**Batch 20 (Taiwan, Sri Lanka, Malawi, Bogotá) SOLVED Taiwan, and the answer is an organisation that
admits customs territories rather than states.** D2 deferred it because all three of Phase 3's sources —
UNdata, the recognition guide and the World Bank series — are organised around UN membership, and D3
cited its glossary term on the guide's Milestones alone. The missing institution is the **World Trade
Organization**, which has a full member page for the *"Separate Customs Territory of Taiwan, Penghu,
Kinmen and Matsu (Chinese Taipei)"*, a member since 1 January 2002. That is a body treating the island in
its own right, and the card says why it can: the WTO admits customs territories, so a place with no
United Nations seat can hold a seat in it. **When a place is invisible to the UN-organised sources, ask
which international bodies admit something other than states.**

**The rest of Taiwan's card comes from the CHINA entry in the recognition guide**, which turns out to
carry the island's diplomatic history in full: American consular posts at Danshui from 1898 and Taipei
from 1914 under Japanese rule, the embassy following the Republic of China's government to Taipei on 19
December 1949, recognition transferred to the People's Republic on 1 January 1979, and the Taipei embassy
closed on 28 February. With GA resolution **2758 (XXVI)** of 25 October 1971 on the seat itself, that is
five openable sources without a single figure among them — **the figures stay unmarked, exactly as D3
left the term**, and the facts box states Folio's own.

**Two more capital spellings diverge from UNdata, and both belong in the record before their cards are
written.** UNdata writes Sri Lanka's legislative seat **Sri Jayewardenepura Kotte** where this plan and
the glossary write *Jayawardenepura*, and it writes Colombia's capital **Bogota** without the accent
where `world-capitals.js` writes **Bogotá** — which is not cosmetic, since `add-card.js` validates
`map.dot` against that file and refused the unaccented form outright. **Check the dot name against
`world-capitals.js` and the prose name against UNdata; they are two different questions.**

**And Malawi is the first country where THREE published areas disagree.** UNdata gives 117,726 km², the
World Bank 118,480 and the Commonwealth Secretariat a round 118,500 — a spread of 0.7% — with the term's
118,484 just outside the top of it, so it was corrected to the World Bank's figure. Sri Lanka is the
mirror image: the two sources agree on its area to the square kilometre and differ by nearly 7% on its
population, the World Bank showing a FALL since 2020 where almost every other country carded shows
growth. **Agreement on one figure says nothing about the other.**

**Batch 21 (Zambia, Kazakhstan, Chad, Seoul) is where the pass's own habit of naming a sitting's other
admissions had to be reined in.** Three cards in this batch wanted to say "at the sitting that also
admitted X and Y", and on a first draft each marked that claim to **UNdata**, which gives only the
country's own membership date and nothing about the meeting. The fix is cheap and should now be the
default: the Digital Library record for EACH state's admission resolution carries its meeting number, so
naming two neighbours costs two citations. Chad's card cites Cameroon's 1476 and Niger's 1482 for exactly
that. **Never mark a claim about OTHER states to a country's own profile** — it is the commonest way a
marker in this pass has pointed at a source that does not carry the sentence.

**Two capitals in one batch are recorded in the American archive under names their countries no longer
use.** The first American embassy in Kazakhstan opened at **Alma-Ata**, the city now called Almaty, which
was then the capital and is not now; the first in Chad opened at **Fort Lamy**, now N'Djamena, which is
still the capital under a different name. Two different kinds of change — a seat that moved and a name
that changed — and both leave the recognition guide naming a place a reader will not find on the map.
**Check whether a guide's city is the same place under a new name or a different place altogether before
writing the sentence.**

**Seoul is named IN the recognition itself, which is rare enough to be worth reaching for.** The White
House statement of 1 January 1949 recognised *"the Republic of Korea, with its capital at Seoul"* — so
the capital card's opening sentence is a quotation from the founding document of the relationship rather
than an inference from a statistical profile. **When a capital card is thin, grep the country's
recognition text for the city's name**; where it appears, that sentence is the card's best first line.

**And the WTO has no findable slug for the Republic of Korea.** Every plausible form was probed and none
resolves, which with Côte d'Ivoire in batch 16 makes two members whose pages could not be reached by
guessing. It cost nothing here — Seoul had five sources without it — but the pattern is now established:
**budget one WTO citation per batch as optional, not assumed.**

**Batch 22 (Chile, Romania, Somalia, Khartoum) closed C7's Somalia deferral by C8's method, which is
the pattern to reach for on every figure this pass once withheld.** C7 refused to correct Somalia's
"roughly 18 million" because UNdata alone gave 19.655 and C5's rule forbids correcting on one source. The
resolution is not a second source but the SERIES: the World Bank's run shows 13.8 million in 2015 and
19.7 in 2025, so 18 million is a point that curve passed through about 2022 — stale, not contested — and
C8's test settles it without needing corroboration UNdata's relay could not give. **Re-run the stale test
over every figure a batch DEFERRED for want of a second source**; several of them are not disagreements
at all. Chile went the same way, 19.5 million being the series' 2021 value.

**And a Wikimedia finding worth more than any of the pictures it produced: the throttle falls on
ORIGINALS, not on thumbnails.** Khartoum's astronaut photograph returned 429 on
`/wikipedia/commons/<a>/<ab>/<file>` at every attempt across half an hour while the control file fetched
beside it returned 200 — and the same file on `/wikipedia/commons/thumb/<a>/<ab>/<file>/1280px-<file>`
returned 200 first time. That is why every image shipped through the `/thumb/` path since batch 13 has
verified while several originals have not. **Always write the `/thumb/…/1280px-…` form**: it is smaller
for the reader, and it is the path that answers here.

**One picture was refused on content rather than on access, and the reason is worth stating.** The
Sentinel-2 file named *Khartoum, Sudan* is a FALSE-COLOUR image whose own description says the scene
"lies just south of the capital" — farmland, not the city, and not in true colour. A picture whose
caption has to explain that it is not of the thing it is filed under is not an illustration of that
thing. **Read the Commons description before the licence**; the licence decides whether a picture MAY
ship and the description decides whether it SHOULD.

**Batch 28 (Jordan, Dominican Republic, United Arab Emirates, Kabul) is where the population sort's own
logic shows itself.** Its three countries are counted at **11,520,684**, **11,520,487** and **11,513,149**
— Jordan, the Dominican Republic and the United Arab Emirates within about 7,500 people of each other, on
three continents and by three quite different histories. **That closeness is a fact about the ordering
rather than about the countries**, and it is the reason the plan fixes the order at planning time: a
re-sort on next year's estimates would shuffle these three among themselves and move every card id.

**It confirms C11's Dominican Republic finding against the current data, and the shape of the error is
worth knowing.** `AG.SRF.TOTL.K2` gives **48,670 km² for every year to 2018 and 146,839.463 for every
year from 2019** — a threefold jump with nothing behind it and no revision anywhere near it. So the
card states its area on **UNdata alone and says why**, which is the honest form of C5's single-source
position: name the missing source rather than quietly dropping it. **Fetch a date RANGE, not one year,
before trusting that series** — a single-year request returns the wrong number with no sign that it is
wrong.

**`United_Arab_Emirates` resolves C5's oldest deferral by standing still.** C5 refused to correct its
83,600 km² against UNdata's 71,024 — "the widest gap in Phase 3" — for want of a second source; D2 found
the World Bank's **98,648**, which puts the term between the two; and this card is the first to state all
three, 27,624 km² apart, with the term inside. **A figure that looks wrong against one source can be
right against two**, and the pass has now met this shape often enough that the reflex should be to fetch
the second series before drafting a correction.

**Jordan is the pass's first use of UNdata's REFUGEE field, and it is the right way to carry a claim the
term already makes.** The `Jordan` term ends "has since taken in large numbers of refugees"; the country
profile carries *Refugees and others of concern to UNHCR* at about **699,000**, so the card states the
figure rather than inferring anything from the population curve. **A UNdata profile has fields beyond the
five the recipe uses** — density, capital-city population, refugees, exchange rate — and reaching for the
one a term's own last clause needs is cheaper than finding a new source.

**And `Kabul` is the fullest mission history in the guide.** Recognition in 1921, relations only in 1935
and through a minister resident at Tehran, a legation in the city in 1942 — 21 years after the
recognition — an embassy in 1948, the ambassador **assassinated at post in February 1979**, the embassy
closed in January 1989 as Soviet forces left, a liaison office in December 2001, an embassy again in
January 2002, and operations **suspended and transferred to Doha in August 2021**. The card carries no
flag and neither does `gw-036`, for the reason recorded above: Commons resolves `Flag_of_Afghanistan.svg`
to a file named for one of the parties to that history.

**Batch 27 (South Sudan, Belgium, Haiti, Buenos Aires) met the pass's fastest state and its slowest
recognition in one sitting, and both are dated by the same two sources.** `South Sudan` declared
independence on **9 July 2011**, was recognised by the United States the same day, had the Security
Council recommend admission at its **6582nd meeting on 13 July** and took its seat on the **14th** — five
days, against `Guinea`'s 71 and `Bolivia`'s 23 years. `Haiti` is the other end: independence in **1804**,
American recognition in **1862**, and the guide states both in one sentence and offers no reason at all
for the 58 years. **Where the guide declines to explain a gap, the card says that it declines** rather
than supplying a reason the source does not carry.

**Its figure finding is that UNdata's missing surface-area field is a PAIR, not a one-off.** C9 recorded
that `Sudan`'s profile alone in Phase 3 omitted the field; `South Sudan`'s omits it too, so **both halves
of the old state are alike in the gap** and the area on either card rests on the World Bank alone. That is
C5's single-source position, and the honest response is to state the figure with its one source named
rather than to defer a card that is otherwise fully sourced.

**Belgium is the pass's clearest three-way area spread and none of the three is wrong.** UNdata gives
30,528 km², Eurostat 30,667 and the World Bank 30,689 — half a per cent between the smallest and the
largest, with the term at the top of the range and therefore inside it. **Argentina is the same shape at
scale**: UNdata 2,796,427 against the World Bank's 2,780,400, which the term matches exactly, so the
16,027 km² gap is again a spread the term sits inside. Both are C12's rule — **Source A is a source, not
an authority** — and neither is a correction.

**Buenos Aires is the third capital in three batches whose entry is headed by the CITY**, after `Algiers`
and, in a different way, `Madrid`. The guide's Argentina page is headed *United States Recognition of
Buenos Ayres, 1823*: what was recognised was the government of the city, "predecessor of Argentina", and
the mission physically **left the city for Paraná in 1857 and came back in 1862**, when the Argentine
Confederation collapsed. **Read the country page for a capital card before assuming the country is its
subject** — three times now the American record has been organised around the seat rather than the state.

**One tooling note, recorded because it wasted a check.** Two flag credits contain a Commons page URL with
**parentheses** in it (`File:Flag_of_Belgium_(civil).svg`, `File:Flag_of_the_United_Kingdom_(3-5).svg`), and
a URL-extraction regex written `[^\s)]+` truncates them and reports a 404 that is not there. The site is
unaffected — `mediaCreditHTML` linkifies only a credit that is ENTIRELY a URL, and these begin with prose,
so they render as escaped text — but **a verification script must not use `)` as a URL terminator**, which
is the opposite of the rule `SRC_URL_RX` follows for citations.

**Batch 26 (Burundi, Bolivia, Tunisia, Baghdad) closed the raster throttle and the four terms it had
held back.** After three batches in which every JPEG and PNG on `upload.wikimedia.org` returned 429 while
SVGs returned 200, a single test at the head of this batch came back **200** — so `Kampala`, `Madrid`,
`Algiers` and `Baghdad` were illustrated in one pass, each candidate re-checked for subject and licence
before use. **The one-test rule paid exactly as intended**: three batches spent one request each rather
than an hour, and the batch that found the door open spent one request finding it. Keep testing once and
shipping regardless.

**Its structural finding is that the trusteeship pairs behave like the federations do.** Batch 23 found
Senegal and Mali recognised on one day and admitted in consecutive resolutions (1490 and 1491) at one
plenary meeting; **Rwanda and Burundi are the same shape one continent over** — one Belgian trusteeship
over Ruanda-Urundi ended on 1 July 1962, both recognised that day, both seated at the **1122nd plenary
meeting on 18 September 1962** as resolutions **1748 and 1749**. So the rule from batch 23 generalises:
**when a country came out of a shared administration, open the sibling's page and look for the adjacent
resolution number** — the two records together say what neither says alone. `Burundi` also carries the
pass's only DEMOTION: its mission was an embassy from 1 July 1962, a **legation** from 15 December 1962,
and an embassy again only from 16 September 1963, with no reason given.

**`Bolivia` is the longest recognition gap the pass has met, and the guide is explicit about why.**
Independence was declared on 6 August 1825; the United States first recognised the country only
*indirectly*, as part of the **Peru-Bolivian Confederation**, when James B. Thornton — commissioned to
Peru and received by the confederation — was appointed on 16 March 1837; the confederation dissolved in
1839; and the republic was recognised in its own right only on **30 May 1848**, 23 years after the
declaration. **A recognition of a UNION is not a recognition of its members**, and the guide dates the
relationship from the later act. C11's Spanish-America warning and C12's read-the-summary-paragraph rule
both hold here, with a third case added: the intervening state.

**`Tunisia` is `Algiers` again with a different ending, and its recognition CANNOT BE DATED — which the
guide says outright.** Tunisian recognition of the United States "occurred at some time in mid-1795",
when the authorities accepted an American consular representative; the man holding consular authority
over all the Barbary states stayed at Algiers, so a French merchant at Tunis, Joseph Étienne Famin, was
**deputised to act for the United States** and went on to negotiate the 1797 Treaty of Peace and
Friendship. **Write the vagueness the source writes**: "mid-1795" is the date line's entry, because a day
invented for tidiness is a day nobody can check. Its French protectorate is dated by two treaties rather
than one — Bardo (12 May 1881) established control and **La Marsa (8 June 1883) is the one that says
"protectorate"** and ends the country's power to conduct diplomacy.

**And `Baghdad` shows the guide at its most complete.** Its entry runs from an Ottoman-era consul
appointed in 1888, through recognition by the **Anglo-American-Iraqi Convention of 9 January 1930** —
whose preamble is quoted — to the Arab Union of 1958 that was **recognised without relations being
established with it**, two severances (1967, 1991), an interests section in the Belgian embassy from
1972, an embassy restored in 1984 and closed in 1991, and the 2003 invasion, the Coalition Provisional
Authority and the transfer of sovereignty on 28 June 2004. **A capital card does not need a second
history source when the guide's own entry is this dense** — the two Security Council resolutions here
(660 of 1990, 1546 of 2004) corroborate rather than carry.

**Batch 25 (Guinea, Benin, Rwanda, Algiers) found the guide's oldest entry, and it is a capital's rather
than a country's.** `Algiers` recognised the United States in 1795 — **167 years before the United States
recognised Algeria** — because at American independence the city was a nominal Ottoman vassal that
conducted its own foreign relations, and the country page says so outright. Three sources carry it
together and none of them alone would: the country page for the diplomacy, the retired **Barbary Wars
milestone** for why there was a war to end (Britain told the Barbary states in 1785 that American ships
no longer had its navy's protection; the Confederation government could raise neither fleet nor tribute;
the 1795 treaty freed 83 captives), and the **Avalon Project's text of the treaty itself**, whose header
records that the original was **in Turkish** and that the Senate consented in March 1796. **A capital that
predates its country's independence may have a diplomatic history of its own** — check the country page's
Consular Presence section, which is where Algiers keeps 166 years the Recognition section does not
mention.

**Its second finding is that a country's guide entry can be SHORT because nothing went wrong.** `Rwanda`'s
records a recognition, an embassy on the day of independence, and then nothing at all — no closure, no
severance, no evacuation in 63 years — which after Cambodia's five reversals and Uganda's six-year gap is
worth saying in the card rather than treating as a thin page. **Read an empty entry as a fact about the
relationship, not as a gap in the source.**

**Guinea and Benin each turn on a date the OTHER sources supply.** Guinea's page gives recognition (1
November 1958) and the embassy (13 February 1959) and nothing between; the UN records fill it — Security
Council resolution 131 (1958) at the 842nd meeting on 9 December, then **A/RES/1325(XIII) at the 789th
plenary meeting three days later** — so the seat was taken two months before relations were established.
Benin's page is the reverse: it is the only source that says the American mission went to **Cotonou**, not
to the official capital, which is the fact a reader of a two-seat country most needs. Its recognition is
also filed under the country's **former name** — the United States recognised the Republic of **Dahomey**
on 1 August 1960 and the page records the 1975 renaming — so **search the guide by the name in use at the
time.**

**One correction, and it is a rounding rather than a source disagreement.** `Rwanda`'s term said "roughly
14 million" against UNdata's and the World Bank's identical 14,569,341, which rounds to 15 and is what
every sibling card's facts box would have given it; corrected to 15 million. This is batch 17's
midpoint rule applied at 0.069 above the line rather than Venezuela's 0.017, and the deck's own
convention — whole millions, rounded — decides it. Its area figure is the pass's only exact three-way
agreement so far, 26,338 at both counts, and the reason is visible in the data: **the World Bank rounds
larger countries to the nearest ten** (Benin 114,760, Guinea 245,860, Algeria 2,381,740), so a figure that
does not end in zero is a country small enough to be reported whole.

**Batch 24 (Netherlands, Cambodia, Zimbabwe, Madrid) corrected an area by C9's rule, and the case is the
cleanest example of it in the pass.** The `Netherlands` term said 41,850 km²; UNdata gives **41,543** and
the World Bank's `AG.SRF.TOTL.K2` gives **41,540**, so the two independent counts agree to three square
kilometres and the term sat 307 outside them — outside the spread, therefore a correction, made to 41,543
(16,040 sq mi). What makes it instructive is the THIRD figure: the EU country page gives **37,391 km²**,
which C2 already read correctly as land against total area, and which would have produced a much larger
and quite wrong correction had it been treated as a rival total. **Three institutional figures is not
three votes** — sort them by what they measure before comparing them, and 41,543 − 37,391 is exactly the
tenth of the country that is water.

**And the EU country page needs `?etrans=en` now, or it hands back a 394-character language picker with a
200 status.** C1 and C2 used the plain `_en` path and it worked; today that path serves the JavaScript
shell and the query parameter serves the Key Facts block (Capital, Geographical size, Population, *EU
Member State: since …*). Both `Netherlands` and `Spain` citations were rewritten to the working form.
This is the sixth variety of 200-status non-document the pass has met, and the first whose cure is a
query string rather than a different host.

**Spain is a standing three-way population disagreement and is deliberately left alone.** UNdata gives
47,890 thousand for 2025; Eurostat, on the EU page, gives 49,077,984; the World Bank gives 49,355,143 —
and the term says "roughly 48 million", which is where the World Bank series stood in 2023–24. By C8 the
figure is stale; by C5 the sources disagree by 3% and correcting would be picking a side. **It stays, and
the disagreement is recorded here rather than resolved**, because the World Bank's Spanish figure is the
national statistical office's (D1's finding) and UNdata's is the UN's, so this is two institutions
counting differently rather than one being out of date.

**Its research finding is that a REFUSAL to recognise is as citable as a recognition, and the Zimbabwe
page states one outright.** The guide carries a note — "The United States never recognized the
independence of Rhodesia, the name of the state proclaimed by the colony's minority white government in
its unilateral declaration of independence (UDI) in 1965" — and the Security Council's **resolution 216
(1965)**, adopted at its 1258th meeting on 12 November 1965, calls on all states not to recognise the
minority régime. A card about a country whose independence date is 1980 is therefore also a card about
the fifteen years before it, with both halves sourced. **When a country's guide page carries a Note, read
it: the notes are where the guide records what did NOT happen.**

**Two smaller routes worth keeping.** A country admitted in one of the UN's package resolutions is dated
by a resolution whose title is plural and whose text is a SCANNED IMAGE — `A/RES/995(X)` of 14 December
1955 has no text layer, so the number of states it admitted cannot be read from it here; both Spain and
Cambodia carry that date and the card says "several states at once" rather than a count. And a country's
place in the trading system can be **older than the country**: Zimbabwe's GATT membership runs from 11
July 1948, when the territory was Southern Rhodesia, while the state joined the WTO in 1995.

**The raster throttle of batch 23 held for the whole of batch 24**, so `Madrid` ships without a picture
as `Kampala` did — every JPEG and PNG tried returned 429 while three flag SVGs returned 200 in the same
minutes. That is now two batches on the same measurement, and it is a property of this sandbox rather
than of any file: **do not spend a batch's time re-testing rasters; test one, and if it 429s, ship the
term and record the candidates.**

**Batch 23 (Senegal, Guatemala, Ecuador, Kampala) is the first batch of this pass to correct NOTHING**,
and the reason is worth stating rather than being taken for luck. All four subjects were already
reconciled: Senegal 196,712 against the World Bank's 196,710, Guatemala 108,889 against 108,890, Ecuador
257,217 against 256,370, Uganda 241,550 against 241,550, and every population within a rounding of the
term's own figure. **A batch that finds nothing wrong is the expected outcome once a term has been
through the glossary length pass and a figure batch**; treat a run of corrections as the sign of an
unreconciled region, not as the normal yield.

**Its research finding is that the recognition guide sometimes recognises TWO STATES ON ONE DAY, and the
two country pages have to be read together.** Senegal's page dates recognition to 24 September 1960 "when
the American Embassy at Dakar (formerly accredited to the Federation of Mali) so informed the Foreign
Minister" — and Mali's page, on the same date, has the Bamako consulate general raised to embassy rank
while "the American Embassy at Dakar was reaccredited to the independent Republic of Senegal, thereby
formally ending diplomatic relations with the Federation of Mali". Neither page carries the whole story.
The pair also settles the UN side: both were admitted at the **876th plenary meeting on 28 September
1960**, in consecutive resolutions, Senegal as 1490 (XV) and Mali as 1491 (XV). **When a country left a
federation, open the sibling's page before writing the card.**

**Guatemala shows what to do when a state has documented its own covert action, and the honest source is
the state's account of that account.** The country page says outright that in June 1954 the Central
Intelligence Agency "assisted in the overthrow" of President Arbenz — but the load-bearing citation is
the PREFACE to *Foreign Relations of the United States, 1952–1954, Guatemala* (2003), which records that
the 1983 volume left the covert operation out because references to it "were denied in the declassification
process", that the Office of the Historian published it anyway without a disclaimer, and that the
supplement of 287 documents appeared only after historians gained fuller access to the agency's files.
That is the plan's own rule — no state's account of its own actions repeated as established fact — met by
citing the state's admission of how incomplete its earlier account was. **Reach for a FRUS volume's
preface whenever a country page states a covert episode flatly.**

**Ecuador is recognised in a letter that never uses the word, which is why its date looks wrong.** The
guide gives 4 June 1832, the date Secretary of State Edward Livingston replied to President Juan José
Flores's letter announcing he was "at the head of the Government of the State of the Equator" — an
acknowledgement, not a declaration, and the guide itself calls it an *effective* recognition. C11 warned
that a recognition date is not an independence date; this is the adjacent case, **a recognition with no
recognising sentence in it**, and the card has to say so rather than presenting 1832 as a proclamation.
Its WTO page also carries no GATT line at all: Ecuador acceded straight to the World Trade Organization on
21 January 1996, so **a missing GATT date on a WTO member page can be the fact rather than a gap.**

**And the Wikimedia throttle is by FILE TYPE, which revises batch 22's finding.** Batch 22 concluded the
429 falls on originals and not on thumbnails, and that held while it was measured. Here `/thumb/` was
429 too: across forty minutes every raster tried returned 429 — the astronaut photograph of Kampala and a
2006 view from Namirembe Hill, original and 1280px thumb alike, and a 944-pixel PNG with them — while
three flag **SVGs** returned 200 in the same seconds, one of them interleaved between two 429s as a
control. So the rule is **SVG passes and raster does not, whatever the path or the size**, which is why
every flag in this deck has verified and several photographs have not. `Kampala` therefore ships without
a picture, deliberately and recorded here rather than left looking like an oversight; the two candidates
are `File:Kampala,_Uganda.JPG` (NASA, public domain) and `File:Centrum_kampala.jpg` (CC BY-SA 3.0, taken
from one of the city's own hills), both checked for subject and licence and both waiting only on access.

**Four findings from the glossary pass govern the figures here and are not to be rediscovered.** *Read
both sources before concluding a figure is wrong* — the disagreement between two official sources is
routinely larger than the error you think you have found. *The CIA World Factbook is unusable*: every path
on `cia.gov` serves one identical JavaScript shell with no country content. *A population that disagrees
with UNdata is usually stale rather than contested, and the World Bank series says which* — if the term's
figure is a point on that series it is simply old; if the series never passes through it, it is disputed
and should be left alone. *A UN membership date is not always an independence date* — not for the Soviet
founding republics, and not for the Cold War admission deadlocks.

### Conventions

- **Metric first, imperial in brackets**: `9,596,960 km² (3,705,410 sq mi)`.
- **A population carries its vintage**: `1.45 billion (2024)`.
- **The date line carries the country's own dates** — `Independence`, `Founded`, `UN member` — never the
  dates of a survey or a census.
- **The answer term carries no article**: `Netherlands`, not "the Netherlands"; `Gambia`, not "the Gambia".
- **The facts box runs Capital, Population, Area, Largest city** — like over like, since the box is a
  two-column grid filled row by row and the order decides what a reader compares at a glance.
- **A country card carries its flag** in `answerFlag`, with `credit` and `alt` both required. A national
  flag on Commons is almost always public domain; the file page states it. **Look at the file** before
  using it.

## The glossary

**Every one of the 233 countries and territories already has a cited glossary entry** — that is what the
citation pass's batches C0–D3 did, 197 country terms all at the two-source bar and inside the 100-word
band. A country card's pairing obligation is therefore usually already discharged, and what it needs
instead is a **check**: the card and the term must not disagree about a figure. Where they do, the term is
the one written from a source and the card is being written now, so reconcile them in the same commit and
say so.

**The 226 capitals are the opposite case: almost none of them exists.** Of the first twenty capitals in
the running order only `Berlin` is in the glossary. So a capital card carries the full pairing rule — a
new term, three sentences, 90–110 words, at least two citations with markers, written to the glossary's
own rules rather than as a companion to the card. That is the bulk of the writing in this collection.

**Three collisions are already known and none should be settled quietly.** `Georgia` is an alias of
`Georgia_(country)`, so the bare word resolves to the country — which is right for `gw-137` and wrong in a
United States card, and the geography plan's note on it stands. `Washington,_D.C.` will want a key of its
own beside `George_Washington`. And **`Kingston` is two cities**, exactly as it is in the capitals table.
**Re-run the collision check before each batch** — the glossary is 1,254 terms and a collision is silent:

    node .claude/check-gloss-links.js

---

# The list

## The countries and territories — `geo-world-countries`

  gw-001  India
  gw-002  China
  gw-003  United States  [map key: United States of America]
  gw-004  Indonesia
  gw-005  Pakistan
  gw-006  Nigeria
  gw-007  Brazil
  gw-008  Bangladesh
  gw-009  Russia
  gw-010  Ethiopia
  gw-011  Mexico
  gw-012  Japan
  gw-013  Egypt
  gw-014  Philippines
  gw-015  Democratic Republic of the Congo  [map key: Dem. Rep. Congo]
  gw-016  Vietnam
  gw-017  Iran
  gw-018  Turkey
  gw-019  Germany
  gw-020  Thailand
  gw-021  United Kingdom
  gw-022  Tanzania
  gw-023  France
  gw-024  South Africa
  gw-025  Italy
  gw-026  Kenya
  gw-027  Myanmar
  gw-028  Colombia
  gw-029  South Korea
  gw-030  Sudan
  gw-031  Uganda
  gw-032  Spain
  gw-033  Algeria
  gw-034  Iraq
  gw-035  Argentina
  gw-036  Afghanistan
  gw-037  Canada
  gw-038  Yemen
  gw-039  Morocco
  gw-040  Angola
  gw-041  Ukraine
  gw-042  Poland
  gw-043  Uzbekistan
  gw-044  Malaysia
  gw-045  Saudi Arabia
  gw-046  Mozambique
  gw-047  Ghana
  gw-048  Peru
  gw-049  Madagascar
  gw-050  Côte d'Ivoire
  gw-051  Nepal
  gw-052  Cameroon
  gw-053  Venezuela
  gw-054  Australia
  gw-055  Niger
  gw-056  North Korea
  gw-057  Syria
  gw-058  Mali
  gw-059  Burkina Faso
  gw-060  Taiwan
  gw-061  Sri Lanka
  gw-062  Malawi
  gw-063  Zambia
  gw-064  Kazakhstan
  gw-065  Chad
  gw-066  Chile
  gw-067  Romania
  gw-068  Somalia
  gw-069  Senegal
  gw-070  Guatemala
  gw-071  Ecuador
  gw-072  Netherlands
  gw-073  Cambodia
  gw-074  Zimbabwe
  gw-075  Guinea
  gw-076  Benin
  gw-077  Rwanda
  gw-078  Burundi
  gw-079  Bolivia
  gw-080  Tunisia
  gw-081  South Sudan  [map key: S. Sudan]
  gw-082  Belgium
  gw-083  Haiti
  gw-084  Jordan
  gw-085  Dominican Republic  [map key: Dominican Rep.]
  gw-086  United Arab Emirates
  gw-087  Cuba
  gw-088  Czechia
  gw-089  Honduras
  gw-090  Portugal
  gw-091  Tajikistan
  gw-092  Papua New Guinea
  gw-093  Sweden
  gw-094  Greece
  gw-095  Azerbaijan
  gw-096  Israel
  gw-097  Hungary
  gw-098  Austria
  gw-099  Belarus
  gw-100  Switzerland
  gw-101  Sierra Leone
  gw-102  Togo
  gw-103  Laos
  gw-104  Hong Kong
  gw-105  Turkmenistan
  gw-106  Libya
  gw-107  Kyrgyzstan
  gw-108  Paraguay
  gw-109  Nicaragua
  gw-110  Serbia
  gw-111  Bulgaria
  gw-112  El Salvador
  gw-113  Republic of the Congo  [map key: Congo]
  gw-114  Singapore
  gw-115  Denmark
  gw-116  Lebanon
  gw-117  Finland
  gw-118  Liberia
  gw-119  Norway
  gw-120  Slovakia
  gw-121  Ireland
  gw-122  Central African Republic  [map key: Central African Rep.]
  gw-123  New Zealand
  gw-124  Palestine
  gw-125  Oman
  gw-126  Mauritania
  gw-127  Costa Rica
  gw-128  Kuwait
  gw-129  Panama
  gw-130  Croatia
  gw-131  Georgia
  gw-132  Eritrea
  gw-133  Mongolia
  gw-134  Uruguay
  gw-135  Puerto Rico
  gw-136  Bosnia and Herzegovina  [map key: Bosnia and Herz.]
  gw-137  Armenia
  gw-138  Namibia
  gw-139  Lithuania
  gw-140  Qatar
  gw-141  Jamaica
  gw-142  Gambia
  gw-143  Gabon
  gw-144  Botswana
  gw-145  Moldova
  gw-146  Albania
  gw-147  Lesotho
  gw-148  Guinea-Bissau
  gw-149  Slovenia
  gw-150  Equatorial Guinea  [map key: Eq. Guinea]
  gw-151  Latvia
  gw-152  North Macedonia
  gw-153  Kosovo
  gw-154  Bahrain
  gw-155  Timor-Leste
  gw-156  Estonia
  gw-157  Trinidad and Tobago
  gw-158  Cyprus
  gw-159  Mauritius
  gw-160  Eswatini  [map key: eSwatini]
  gw-161  Djibouti
  gw-162  Fiji
  gw-163  Comoros
  gw-164  Guyana
  gw-165  Solomon Islands  [map key: Solomon Is.]
  gw-166  Bhutan
  gw-167  Macau  [map key: Macao]
  gw-168  Luxembourg
  gw-169  Suriname
  gw-170  Montenegro
  gw-171  Western Sahara  [map key: W. Sahara]
  gw-172  Malta
  gw-173  Maldives
  gw-174  Cabo Verde
  gw-175  Brunei
  gw-176  Belize
  gw-177  Bahamas
  gw-178  Iceland
  gw-179  Vanuatu
  gw-180  New Caledonia
  gw-181  Barbados
  gw-182  French Polynesia  [map key: Fr. Polynesia]
  gw-183  São Tomé and Principe
  gw-184  Samoa
  gw-185  Saint Lucia
  gw-186  Guam
  gw-187  Curaçao
  gw-188  Kiribati
  gw-189  Seychelles
  gw-190  Grenada
  gw-191  Micronesia
  gw-192  Aruba
  gw-193  United States Virgin Islands  [map key: U.S. Virgin Is.]
  gw-194  Tonga
  gw-195  Jersey
  gw-196  Saint Vincent and the Grenadines  [map key: St. Vin. and Gren.]
  gw-197  Antigua and Barbuda  [map key: Antigua and Barb.]
  gw-198  Isle of Man
  gw-199  Andorra
  gw-200  Cayman Islands  [map key: Cayman Is.]
  gw-201  Guernsey
  gw-202  Dominica
  gw-203  Bermuda
  gw-204  Greenland
  gw-205  Faroe Islands  [map key: Faeroe Is.]
  gw-206  Saint Kitts and Nevis  [map key: St. Kitts and Nevis]
  gw-207  American Samoa
  gw-208  Turks and Caicos Islands  [map key: Turks and Caicos Is.]
  gw-209  Northern Mariana Islands  [map key: N. Mariana Is.]
  gw-210  Sint Maarten
  gw-211  Liechtenstein
  gw-212  British Virgin Islands  [map key: British Virgin Is.]
  gw-213  Gibraltar
  gw-214  Monaco
  gw-215  Marshall Islands  [map key: Marshall Is.]
  gw-216  San Marino
  gw-217  Åland
  gw-218  Saint Martin  [map key: St-Martin]
  gw-219  Anguilla
  gw-220  Palau
  gw-221  Cook Islands  [map key: Cook Is.]
  gw-222  Nauru
  gw-223  Wallis and Futuna  [map key: Wallis and Futuna Is.]
  gw-224  Saint Barthélemy  [map key: St-Barthélemy]
  gw-225  Tuvalu
  gw-226  Saint Pierre and Miquelon  [map key: St. Pierre and Miquelon]
  gw-227  Saint Helena
  gw-228  Montserrat
  gw-229  Falkland Islands  [map key: Falkland Is.]
  gw-230  Norfolk Island
  gw-231  Niue
  gw-232  Vatican City  [map key: Vatican]
  gw-233  Pitcairn Islands  [map key: Pitcairn Is.]

## The capitals — `geo-world-capitals`

  gw-501  New Delhi  [India]
  gw-502  Beijing  [China]
  gw-503  Washington, D.C.  [United States]
  gw-504  Jakarta  [Indonesia]
  gw-505  Islamabad  [Pakistan]
  gw-506  Abuja  [Nigeria]
  gw-507  Brasília  [Brazil]
  gw-508  Dhaka  [Bangladesh]
  gw-509  Moscow  [Russia]
  gw-510  Addis Ababa  [Ethiopia]
  gw-511  Mexico City  [Mexico]
  gw-512  Tokyo  [Japan]
  gw-513  Cairo  [Egypt]
  gw-514  Manila  [Philippines]
  gw-515  Kinshasa  [Democratic Republic of the Congo]
  gw-516  Hanoi  [Vietnam]
  gw-517  Tehran  [Iran]
  gw-518  Ankara  [Turkey]
  gw-519  Berlin  [Germany]
  gw-520  Bangkok  [Thailand]
  gw-521  London  [United Kingdom]
  gw-522  Dodoma  [Tanzania — the capital]
  gw-523  Paris  [France]
  gw-524  Pretoria  [South Africa — the executive capital]
  gw-525  Rome  [Italy]
  gw-526  Nairobi  [Kenya]
  gw-527  Naypyidaw  [Myanmar]
  gw-528  Bogotá  [Colombia]
  gw-529  Seoul  [South Korea]
  gw-530  Khartoum  [Sudan]
  gw-531  Kampala  [Uganda]
  gw-532  Madrid  [Spain]
  gw-533  Algiers  [Algeria]
  gw-534  Baghdad  [Iraq]
  gw-535  Buenos Aires  [Argentina]
  gw-536  Kabul  [Afghanistan]
  gw-537  Ottawa  [Canada]
  gw-538  Sana'a  [Yemen]
  gw-539  Rabat  [Morocco]
  gw-540  Luanda  [Angola]
  gw-541  Kyiv  [Ukraine]
  gw-542  Warsaw  [Poland]
  gw-543  Tashkent  [Uzbekistan]
  gw-544  Kuala Lumpur  [Malaysia — the national capital]
  gw-545  Riyadh  [Saudi Arabia]
  gw-546  Maputo  [Mozambique]
  gw-547  Accra  [Ghana]
  gw-548  Lima  [Peru]
  gw-549  Antananarivo  [Madagascar]
  gw-550  Yamoussoukro  [Côte d'Ivoire — the official capital]
  gw-551  Kathmandu  [Nepal]
  gw-552  Yaoundé  [Cameroon]
  gw-553  Caracas  [Venezuela]
  gw-554  Canberra  [Australia]
  gw-555  Niamey  [Niger]
  gw-556  Pyongyang  [North Korea]
  gw-557  Damascus  [Syria]
  gw-558  Bamako  [Mali]
  gw-559  Ouagadougou  [Burkina Faso]
  gw-560  Taipei  [Taiwan]
  gw-561  Sri Jayawardenepura Kotte  [Sri Lanka — the legislative capital]
  gw-562  Lilongwe  [Malawi]
  gw-563  Lusaka  [Zambia]
  gw-564  Astana  [Kazakhstan]
  gw-565  N'Djamena  [Chad]
  gw-566  Santiago  [Chile — the capital]
  gw-567  Bucharest  [Romania]
  gw-568  Mogadishu  [Somalia]
  gw-569  Dakar  [Senegal]
  gw-570  Guatemala City  [Guatemala]
  gw-571  Quito  [Ecuador]
  gw-572  Amsterdam  [Netherlands — the constitutional capital]
  gw-573  Phnom Penh  [Cambodia]
  gw-574  Harare  [Zimbabwe]
  gw-575  Conakry  [Guinea]
  gw-576  Porto-Novo  [Benin — the official capital]
  gw-577  Kigali  [Rwanda]
  gw-578  Bujumbura  [Burundi]
  gw-579  Sucre  [Bolivia — the constitutional capital]
  gw-580  Tunis  [Tunisia]
  gw-581  Juba  [South Sudan]
  gw-582  Brussels  [Belgium]
  gw-583  Port-au-Prince  [Haiti]
  gw-584  Amman  [Jordan]
  gw-585  Santo Domingo  [Dominican Republic]
  gw-586  Abu Dhabi  [United Arab Emirates]
  gw-587  Havana  [Cuba]
  gw-588  Prague  [Czechia]
  gw-589  Tegucigalpa  [Honduras]
  gw-590  Lisbon  [Portugal]
  gw-591  Dushanbe  [Tajikistan]
  gw-592  Port Moresby  [Papua New Guinea]
  gw-593  Stockholm  [Sweden]
  gw-594  Athens  [Greece]
  gw-595  Baku  [Azerbaijan]
  gw-596  DEFERRED  [Israel — see “The capital a card asks for” above]
  gw-597  Budapest  [Hungary]
  gw-598  Vienna  [Austria]
  gw-599  Minsk  [Belarus]
  gw-600  Bern  [Switzerland]
  gw-601  Freetown  [Sierra Leone]
  gw-602  Lomé  [Togo]
  gw-603  Vientiane  [Laos]
  gw-605  Ashgabat  [Turkmenistan]
  gw-606  Tripoli  [Libya]
  gw-607  Bishkek  [Kyrgyzstan]
  gw-608  Asunción  [Paraguay]
  gw-609  Managua  [Nicaragua]
  gw-610  Belgrade  [Serbia]
  gw-611  Sofia  [Bulgaria]
  gw-612  San Salvador  [El Salvador]
  gw-613  Brazzaville  [Republic of the Congo]
  gw-615  Copenhagen  [Denmark]
  gw-616  Beirut  [Lebanon]
  gw-617  Helsinki  [Finland]
  gw-618  Monrovia  [Liberia]
  gw-619  Oslo  [Norway]
  gw-620  Bratislava  [Slovakia]
  gw-621  Dublin  [Ireland]
  gw-622  Bangui  [Central African Republic]
  gw-623  Wellington  [New Zealand]
  gw-624  DEFERRED  [Palestine — see “The capital a card asks for” above]
  gw-625  Muscat  [Oman]
  gw-626  Nouakchott  [Mauritania]
  gw-627  San José  [Costa Rica]
  gw-628  Kuwait City  [Kuwait]
  gw-629  Panama City  [Panama]
  gw-630  Zagreb  [Croatia]
  gw-631  Tbilisi  [Georgia]
  gw-632  Asmara  [Eritrea]
  gw-633  Ulaanbaatar  [Mongolia]
  gw-634  Montevideo  [Uruguay]
  gw-635  San Juan  [Puerto Rico]
  gw-636  Sarajevo  [Bosnia and Herzegovina]
  gw-637  Yerevan  [Armenia]
  gw-638  Windhoek  [Namibia]
  gw-639  Vilnius  [Lithuania]
  gw-640  Doha  [Qatar]
  gw-641  Kingston  [Jamaica]
  gw-642  Banjul  [Gambia]
  gw-643  Libreville  [Gabon]
  gw-644  Gaborone  [Botswana]
  gw-645  Chișinău  [Moldova]
  gw-646  Tirana  [Albania]
  gw-647  Maseru  [Lesotho]
  gw-648  Bissau  [Guinea-Bissau]
  gw-649  Ljubljana  [Slovenia]
  gw-650  Malabo  [Equatorial Guinea]
  gw-651  Riga  [Latvia]
  gw-652  Skopje  [North Macedonia]
  gw-653  Pristina  [Kosovo]
  gw-654  Manama  [Bahrain]
  gw-655  Dili  [Timor-Leste]
  gw-656  Tallinn  [Estonia]
  gw-657  Port-of-Spain  [Trinidad and Tobago]
  gw-658  Nicosia  [Cyprus]
  gw-659  Port Louis  [Mauritius]
  gw-660  Mbabane  [Eswatini — the administrative capital]
  gw-661  Djibouti  [Djibouti]
  gw-662  Suva  [Fiji]
  gw-663  Moroni  [Comoros]
  gw-664  Georgetown  [Guyana]
  gw-665  Honiara  [Solomon Islands]
  gw-666  Thimphu  [Bhutan]
  gw-668  Luxembourg  [Luxembourg]
  gw-669  Paramaribo  [Suriname]
  gw-670  Podgorica  [Montenegro]
  gw-672  Valletta  [Malta]
  gw-673  Malé  [Maldives]
  gw-674  Praia  [Cabo Verde]
  gw-675  Bandar Seri Begawan  [Brunei]
  gw-676  Belmopan  [Belize]
  gw-677  Nassau  [Bahamas]
  gw-678  Reykjavík  [Iceland]
  gw-679  Port Vila  [Vanuatu]
  gw-680  Nouméa  [New Caledonia]
  gw-681  Bridgetown  [Barbados]
  gw-682  Papeete  [French Polynesia]
  gw-683  São Tomé  [São Tomé and Principe]
  gw-684  Apia  [Samoa]
  gw-685  Castries  [Saint Lucia]
  gw-686  Hagåtña  [Guam]
  gw-687  Willemstad  [Curaçao]
  gw-688  Tarawa  [Kiribati]
  gw-689  Victoria  [Seychelles]
  gw-690  Saint George's  [Grenada]
  gw-691  Palikir  [Micronesia]
  gw-692  Oranjestad  [Aruba]
  gw-693  Charlotte Amalie  [United States Virgin Islands]
  gw-694  Nuku'alofa  [Tonga]
  gw-695  Saint Helier  [Jersey]
  gw-696  Kingstown  [Saint Vincent and the Grenadines]
  gw-697  Saint John's  [Antigua and Barbuda]
  gw-698  Douglas  [Isle of Man]
  gw-699  Andorra  [Andorra]
  gw-700  George Town  [Cayman Islands]
  gw-701  Saint Peter Port  [Guernsey]
  gw-702  Roseau  [Dominica]
  gw-703  Hamilton  [Bermuda]
  gw-704  Nuuk  [Greenland]
  gw-705  Tórshavn  [Faroe Islands]
  gw-706  Basseterre  [Saint Kitts and Nevis]
  gw-707  Pago Pago  [American Samoa]
  gw-708  Cockburn Town  [Turks and Caicos Islands]
  gw-709  Capitol Hill  [Northern Mariana Islands]
  gw-710  Philipsburg  [Sint Maarten]
  gw-711  Vaduz  [Liechtenstein]
  gw-712  Road Town  [British Virgin Islands]
  gw-715  Majuro  [Marshall Islands]
  gw-716  San Marino  [San Marino]
  gw-717  Mariehamn  [Åland]
  gw-718  Marigot  [Saint Martin]
  gw-719  The Valley  [Anguilla]
  gw-720  Ngerulmud  [Palau]
  gw-721  Avarua  [Cook Islands]
  gw-722  Yaren  [Nauru]
  gw-723  Mata-Utu  [Wallis and Futuna]
  gw-724  Gustavia  [Saint Barthélemy]
  gw-725  Funafuti  [Tuvalu]
  gw-726  Saint-Pierre  [Saint Pierre and Miquelon]
  gw-727  Jamestown  [Saint Helena]
  gw-728  Brades  [Montserrat]
  gw-729  Stanley  [Falkland Islands]
  gw-730  Kingston (Norfolk Island)  [Norfolk Island]
  gw-731  Alofi  [Niue]
  gw-733  Adamstown  [Pitcairn Islands]

**The second and third seats**, in the running order of the country they belong to:

  gw-751  Dar es Salaam  [Tanzania — the former capital and largest city]
  gw-752  Cape Town  [South Africa — the legislative capital]
  gw-753  Bloemfontein  [South Africa — the judicial capital]
  gw-754  Putrajaya  [Malaysia — the administrative capital]
  gw-755  Abidjan  [Côte d'Ivoire — the seat of government and largest city]
  gw-756  Colombo  [Sri Lanka — the commercial capital and largest city]
  gw-757  Valparaíso  [Chile — the city where the national congress sits]
  gw-758  The Hague  [Netherlands — the seat of government]
  gw-759  Cotonou  [Benin — the seat of government and largest city]
  gw-760  La Paz  [Bolivia — the seat of government]
  gw-761  Lobamba  [Eswatini — the legislative and royal capital]
