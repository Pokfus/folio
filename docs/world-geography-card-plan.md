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

**Shipped so far — countries `gw-001`–`gw-142`** (India, China, United States, Indonesia, Pakistan,
Nigeria, Brazil, Bangladesh, Russia, Ethiopia, Mexico, Japan, Egypt, Philippines, Democratic Republic of
the Congo, Vietnam, Iran, Turkey, Germany, Thailand, United Kingdom, Tanzania, France, South Africa,
Italy, Kenya, Myanmar, Colombia, South Korea, Sudan, Uganda, Spain, Algeria, Iraq, Argentina,
Afghanistan, Canada, Yemen, Morocco, Angola, Ukraine, Poland, Uzbekistan, Malaysia, Saudi Arabia,
Mozambique, Ghana, Peru, Madagascar, Côte d'Ivoire, Nepal, Cameroon, Venezuela, Australia, Niger, North
Korea, Syria, Mali, Burkina Faso, Taiwan, Sri Lanka, Malawi, Zambia, Kazakhstan, Chad, Chile, Romania,
Somalia, Senegal, Guatemala, Ecuador, Netherlands, Cambodia, Zimbabwe, Guinea, Benin, Rwanda, Burundi,
Bolivia, Tunisia, South Sudan, Belgium, Haiti, Jordan, Dominican Republic, United Arab Emirates, Cuba,
Czechia, Honduras, Portugal, Tajikistan, Papua New Guinea, Sweden, Greece, Azerbaijan, Israel, Hungary,
Austria, Belarus, Switzerland, Sierra Leone, Togo, Laos, Hong Kong, Turkmenistan, Libya, Kyrgyzstan, Paraguay, Nicaragua, Serbia, Bulgaria, El Salvador, Republic of the Congo, Singapore, Denmark, Lebanon, Finland, Liberia, Norway, Slovakia, Ireland, Central African Republic, New Zealand, Palestine, Oman, Mauritania, Costa Rica, Kuwait, Panama, Croatia, Georgia, Eritrea, Mongolia, Uruguay, Puerto Rico, Bosnia and Herzegovina, Armenia, Namibia, Lithuania, Qatar, Jamaica, Gambia, Gabon, Botswana, Moldova, Albania, Lesotho, Guinea-Bissau, Slovenia, Equatorial Guinea, Latvia, North Macedonia, Kosovo, Bahrain, Timor-Leste, Estonia, Trinidad and Tobago, Cyprus, Mauritius, Eswatini, Djibouti, Fiji, Comoros, Guyana, Solomon Islands, Bhutan, Macau, Luxembourg, Suriname, Montenegro, Western Sahara, Malta, Maldives, Cabo Verde, Brunei, Belize) **and capitals
`gw-503` Washington, D.C., `gw-505` Islamabad, `gw-507` Brasília, `gw-510` Addis
Ababa, `gw-513` Cairo, `gw-514` Manila, `gw-515` Kinshasa, `gw-516` Hanoi, `gw-517` Tehran, `gw-518`
Ankara, `gw-519` Berlin, `gw-520` Bangkok, `gw-521` London, `gw-522` Dodoma, `gw-523` Paris, `gw-524`
Pretoria, `gw-525` Rome, `gw-526` Nairobi, `gw-527` Naypyidaw, `gw-528` Bogotá, `gw-529` Seoul, `gw-530`
Khartoum, `gw-531` Kampala, `gw-532` Madrid, `gw-533` Algiers, `gw-534` Baghdad, `gw-535` Buenos Aires,
`gw-536` Kabul, `gw-537` Ottawa, `gw-538` Sana'a, `gw-539` Rabat, `gw-540` Luanda, `gw-541` Kyiv,
`gw-751` Dar es Salaam, `gw-752` Cape Town and `gw-753` Bloemfontein.** The next country is `gw-177` Bahamas
and the next capital is `gw-542` Warsaw.

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

**Batch 65 (Cabo Verde, Brunei, Belize) is where the recognition guide, the spine of Phase 3's history,
CONTRADICTS ITSELF AND MISSPELLS A NAME IT PRINTS TWICE** — P2's rule that a spine source is not infallible,
in a third coat. The Brunei page says the United States recognised full independence on 1 January 1984 and
"opened the American Embassy in Bandar Seri Begawan on that same date", and then, four paragraphs down, that
"diplomatic relations and the American Embassy in Brunei were established on May 28, 1984". Both cannot be
the embassy's opening. The card states the recognition and the credentials and **leaves the embassy date
unstated** rather than picking one. The Cape Verde page prints the president's surname as *Pereria* in both
of the places it appears, which is a form no other reachable source uses; **the name was dropped from the
card rather than corrected on a hunch**, since nothing openable here gives the spelling. And the Belize page
dates the Guatemala dispute to "an 1859 treaty between Imperial Spain and Great Britain", which the card
does not repeat: it says only *a treaty of 1859*. **Where a source is the only one you have and it is
visibly wrong about something, state the part it can carry and say nothing about the rest** — the alternative
is to publish somebody else's slip with Folio's name on it. Three finds go the other way. **Brunei carries
the deck's oldest treaty still in force**: the Treaty of Peace, Friendship, Commerce and Navigation signed
on 23 June 1850, in force from 11 July 1853, which the guide says "is still in effect today" — older than
most of the states in this deck. **Belize's recognition came FIVE WEEKS AFTER its independence**, on 29
October 1981 against 21 September, by raising a consulate general to an embassy, where the deck's usual
pattern is the same day or a few days. And **the ICJ carried a second card in two batches**:
`icj-cij.org/case/177` dates the Guatemala/Belize special agreement to 8 December 2008, its protocol to 25
May 2015 and the seising of the Court to 12 June 2019, which no statistical profile holds. **The guide also
settles D1's naming problem with a citation rather than an inference** — "In 2013, the country was re-named
Cabo Verde" — so the card can say outright that the United Nations and the WTO use Cabo Verde while the
guide still files it under Cape Verde, which is why the glossary key is `Cape_Verde` and the alias is the
other way round. Two smaller notes. **This is the first batch since C10 with no population correction at
all**, and the reason is arithmetic rather than better editing: Cabo Verde's whole decade runs 512,394 to
524,877, so a term written at any point in it is still right. And **Belize is the pass's fifth moving World
Bank area series and the first that moves the RIGHT way** — 22,970 for 2019–22 and 22,966 for 2023, a
de-rounding toward UNdata's 22,965, where Canada, the Dominican Republic, Monaco and Montenegro all moved
without explanation and one was outright error. Access: `ine.cv`, Cabo Verde's own statistics institute,
serves 10 KB containing the single word "INE", another JavaScript shell; `un.org/development/desa`,
`unctad.org` and `au.int/en/countryprofiles` are all shut, so a small African state outside the Commonwealth
has no bloc profile and is carried by UNdata, the guide, the WTO and the two World Bank series between them.
Batch 45's rule fired for the twelfth consecutive batch and took four superlatives: Brunei's forest as "one
of the highest proportions left in the region" became 72.1 per cent, and Belize's "longest reef system in
the northern hemisphere", its "only Central American state whose official language is English" and Cape
Verde's "more Cape Verdeans now live abroad than at home" all went, none being in anything reachable.

**Batch 64 (Western Sahara, Malta, Maldives) wrote the deck's first NON-SELF-GOVERNING TERRITORY, and
the route is the United Nations' own decolonization machinery rather than any of Phase 3's three sources.**
`history.state.gov` has no page for Western Sahara and the World Bank has no series, but **UNdata does have
a profile** — `data.un.org/en/iso/eh.html` — which refines C0's finding that a state without an ISO code
gets nothing: **the test is the ISO code, not statehood**, and `EH` has one where Kosovo's `xk` 500s. The
history is carried by three UN works instead: the **International Court of Justice's advisory opinion of 16
October 1975** (`icj-cij.org/case/61`, which states the questions the General Assembly asked in December
1974 and the answers — not *terra nullius*, ties of allegiance to the Sultan of Morocco and land rights of
the Mauritanian entity, but no tie of territorial sovereignty with either), **Security Council resolution
690 of 29 April 1991** establishing MINURSO, and **the Secretariat's annual working paper for the Special
Committee on decolonization** (A/AC.109/2025/17). That last one is what makes the card writable at all under
the rule that no state's account of its own actions is repeated as established fact: **it states each
party's position in that party's own words**, so Morocco's autonomy initiative and territorial integrity and
the Frente POLISARIO's "last colony in Africa" both appear as claims, attributed, with the Court's opinion
and the unheld referendum as the facts around them. Two access findings go with it. **`un.org`'s
decolonization section answers 202 with an EMPTY BODY** — an eighth variety of non-error refusal and a worse
one than the 200-status error documents, since there is no document at all to inspect — while
`peacekeeping.un.org` and `minurso.unmissions.org` are 403; `digitallibrary.un.org` and `icj-cij.org` carry
everything. And **a UN document PDF needs a CMap-aware extractor**: the working paper's fonts are subset
with hex-encoded strings, so a literal-string extractor returns image noise and not one readable word, where
reading the ToUnicode CMaps out of the file recovers the whole text. **Batch 14's footnote rule paid twice
and the second is the one to carry.** UNdata's area footnote for Western Sahara names the two former Spanish
territories outright — the Northern Region, formerly Saguia el Hamra, and the Southern Region, formerly Rio
de Oro — which is the colonial geography for free. And **Malta's capital-city population footnote says it
"refers to the localities of the Northern Harbour and Southern Harbour"**, so UNdata's 212,800 for
"Valletta" is two harbour districts rather than the city, which holds a few thousand people: a capital card
written from that field would print a figure that is not its city's. Elsewhere, **Malta's autumn of 1964 is
four acts on four sources within eleven weeks** — recognised on 18 September, the embassy at Valletta opened
on 21 September, GATT on 17 November, the United Nations on 1 December — and **the Maldives is the deck's
second state to leave the Commonwealth and rejoin**, withdrawing on 13 October 2016 and returning on 1
February 2020, after South Africa. Both populations were stale by C8's test and both were raised, Malta's to
570,000 and the Maldives' to 530,000; **UNdata is the outlier on Malta** at 545,000 against the World Bank's
568,847 and Eurostat's 574,250. Batch 45's rule fired for the eleventh consecutive batch, and hardest here:
the Maldives term's "lowest-lying country in the world, averaging about 1.5 m" and its "1,190 coral islands
in a double chain of atolls spread over 90,000 km² of sea" are in nothing reachable, and were replaced by
the Commonwealth's around 1,200 islands and sandbanks with about 200 inhabited and UNESCO's measured reefs —
seventh largest in the world, about 5 per cent of the world's reef area.

**Batch 63 (Luxembourg, Suriname, Montenegro) found the deck's ninth distinct mode of recognition and,
in Montenegro, the ONLY recognition the United States has ever WITHDRAWN and later granted again.**
Luxembourg was recognised on 31 May 1878 when President Hayes issued an **exequatur** to François Berger as
consul general ad interim at New York — not a note, not a treaty, not a ceremony attended, but the routine
document admitting another state's consul to do business, which is an act of recognition because only a state
has consuls to admit. **Look for an exequatur where a small European state's recognition seems to be
missing**: the guide records no earlier note for Luxembourg at all. Montenegro's entry then runs the whole
arc twice. It was recognised on 3 March 1905, when Roosevelt approved the Diplomatic and Consular Act
assigning the mission in Greece responsibility for Montenegro as well; Wilson decided to withdraw that
recognition on 30 December 1920, and on 21 January 1921 Acting Secretary Norman H. Davis told the honorary
consul-general that "in view of the present status of Montenegro, this Government no longer considers it
necessary to accord recognition to her diplomatic and consular officers"; independence was declared again on
3 June 2006 and recognised on 13 June, with relations established on 15 August — **85 years between the
withdrawal and the second recognition**, and the only place in the deck where a country's guide page has to
be read as two separate histories of the same name. Suriname is the Gambia's shape one continent over:
the independence ceremony at Paramaribo on 25 November 1975 was attended by the **Secretary of the Navy** as
the President's representative, with Ford's letter of recognition sent the same day, so the attendance and
the letter are one act rather than two. Three figure findings go with the batch. **Luxembourg's three
sources give three areas** — 2,586 km² at UNdata, 2,590 at the World Bank and 2,595 at Eurostat — which is
inside C9's spread and was left alone, while its population was corrected from "roughly 670,000" to 680,000,
the term having sat below all three. **Montenegro is the pass's FOURTH moving area series**: the World Bank
gives 13,810 km² for 2020–22 and 13,888 for 2023 with no explanation, after Canada, the Dominican Republic
and Monaco, so a World Bank area that changes mid-series is a fact about the series rather than about the
country. And **Suriname's income per head has FALLEN** — 8,814 US dollars in 2015, 6,792 in 2020, 5,976 in
2023 — which with Equatorial Guinea's earlier fall makes two, so a per-head figure needs its year stated as
firmly as a population does. Batch 45's rule fired for the tenth consecutive batch: Luxembourg's grand duchy
described as "the only one left" is in no reachable source and was cut to what the sources print.

**Batch 62 (Solomon Islands, Bhutan, Macau) found the source that answers for an entity OUTSIDE every other
source, and it is a general route rather than a lucky page.** Macau has no recognition-guide entry (the guide
covers states the United States has recognised) and no bloc profile, and UNdata's SAR page is thin. What
carries the card is **`HRI/CORE/CHN-MAC/2019`, the COMMON CORE DOCUMENT** that Macao, China filed with the
United Nations human-rights treaty bodies and the Secretariat issued on 5 August 2020: it gives the land area
and how it has grown, the maritime jurisdiction, the by-census breakdown by ethnicity, language and place of
birth, and the constitutional machinery — **a government's own description of itself, filed under a treaty
obligation.** Every state party to a human-rights treaty files one, so **search `digitallibrary.un.org` for
`HRI/CORE/<code>` whenever a territory falls outside the usual three.** One handling note: the PDF extracts
with **broken word spacing** — letters separated inside words — so despace a copy, grep that, and read the
window back; searching the raw extraction finds nothing at all.

**Macau's land area GROWS, and here the source says why.** The core document records it rising from about
29.5 km² in 2010 to **32.9 km² at the end of 2018**, with jurisdiction over 85 km² of sea since 2015, and the
World Bank's own series records the same movement (32.9 through 2020, 33 from 2021). Batch 57 found Bahrain's
area moving and batch 59 Mauritius's, and neither source explained itself; **this is the first where one
does**, and it settles the earlier note: a moving area series is sometimes reclamation and sometimes
revision, and only a source that says so can tell you which.

**Macau is also the deck's first entity whose CONSTITUTIONAL HISTORY has no openable source here, and the
asymmetry with Hong Kong is exact.** Hong Kong's card could cite the United Kingdom's Hong Kong Act 1985 on
`legislation.gov.uk` and the HKSAR government's own Basic Law page; Macau's equivalents are all shut —
`bo.io.gov.mo` refuses the connection, `io.gov.mo` refuses, `gov.mo`'s English pages 404 except a news feed,
`macaotourism.gov.mo` 404s. So the card and the new term state modern, sourced facts and **do not date the
handover at all**. It is D2's Taiwan position in a new form: the entity is perfectly reachable, its history
is not.

**Bhutan is the deck's only country that is not a WTO member, and the WTO dates that too.** Its working party
on accession was **established on 6 October 1999** and the accession has not been completed — twenty-six
years. Set beside Comoros (21 August 2024) and Timor-Leste (30 August 2024), the WTO's own pages now date
both ends of the deck's range, from a member that joined last year to one that has been acceding since the
century before. Note the accession page lives under `acc_e/`, not `countries_e/`, and its slug is the FRENCH
spelling: `a1_bhoutan_e.htm`.

**And Bhutan has the longest gap in the deck between a Security Council recommendation and a General Assembly
admission.** Recommended unanimously at the Council's 1566th meeting on **10 February 1971** and admitted at
the Assembly's 1934th plenary on **21 September 1971** — more than seven months, against six days for Gabon
and Equatorial Guinea and three for Timor-Leste. The Assembly's ordinary session opens in September, which is
the mundane explanation and is stated by no source, so the card gives the interval and not the reason.

**A thirty-year embassy closure that ENDED, and the deck's first woman ambassador.** The American embassy at
Honiara closed on 30 July 1993 and **reopened on 27 January 2023**, where Guinea-Bissau's (batch 55) and
Comoros's (batch 61) never did — so a closure is not necessarily permanent, and the guide records the
reopening as its own dated event. And relations were established on 9 October 1978 when **Mary S. Olmsted**
presented her credentials as ambassador, accredited to Papua New Guinea as well and resident at Port Moresby:
the first woman named as an ambassador in any entry this deck has cited.

**Recognition delivered by a senator.** Solomon Islands was recognised on 7 July 1978 when **Senator John H.
Glenn**, as the President's personal representative, delivered a letter from President Carter to Prime
Minister Peter Kenilorea. It is the Gambia's recognition-by-attending (batch 53) with a sitting legislator
carrying it, and it brings the count of distinct modes the guide records to eight.

**Batch 45's rule is in its ninth consecutive batch, and one of its removals is the kind to watch for.**
Bhutan's "a proportion the constitution requires never to fall below three-fifths" is a claim about a legal
instrument, which is exactly the class that must be sourced or dropped; it gave way to UNdata's 71.2 per
cent. Solomon Islands lost "about 990 islands" and "logging, fishing and palm oil are its main exports" for
the Commonwealth's own "two parallel chains of volcanic islands and coral atolls" and its named neighbours.
**A new glossary term shipped with the batch — `Macau`, with `Macao` as an alias** — the deck's first new
country term since Puerto Rico.

**Batch 61 (Fiji, Comoros, Guyana) turns up the guide's oldest date and a recognition made from a chair at
the Security Council.** Fiji's entry records a CONSULATE 26 years before the colony and 126 before
independence: Commercial Agent John B. Williams was appointed the first consul to the Fiji Islands on
**19 August 1844**, resident at Auckland, and the islands became a British Crown colony only in 1874. It is
the earliest act any card in this deck cites. And the recognition itself has a shape the deck has not seen:
independence came on 10 October 1970 and the United States recognised it **in a statement by Charles W. Yost,
its representative in the United Nations Security Council** — not a press release, a message, an embassy or a
delegation, but a speech in the chamber. **The reverse credential ceremony goes with it**: relations were
established when FIJI's ambassador presented HIS credentials to President Nixon on 22 July 1971, where every
other entry in the deck dates relations from an American presenting credentials abroad.

**COMOROS IS RECOGNITION AND RELATIONS IN ONE ACT, ANNOUNCED BY BOTH GOVERNMENTS TOGETHER.** On 15 August
1977 the two states issued a **joint communiqué** announcing the establishment of diplomatic relations, and
the guide files that single document under both headings. Every other mode the deck records is unilateral —
a press release, a congratulatory message, an appointment, an attendance — and this one is not. Its embassy
history is the deck's most travelled: a chargé resident at Antananarivo from 1977, an embassy at Moroni from
26 August 1985, that embassy CLOSED on 30 September 1993, ambassadors accredited from Port Louis in Mauritius
after it, and on 6 March 2006 the responsibility moved back to Antananarivo — **three capitals, ending where
it began.**

**C8's Comoros deferral is now cited rather than reasoned.** C8 read UNdata's 2,235 km² against the term's
1,861 and explained the gap as Mayotte, which was right and was an inference. The General Assembly's
**resolution 31/4 of 21 October 1976** is titled *Question of the Comorian Island of Mayotte*, and the item
was still on the Assembly's agenda in September 2025 as A/DEC/79/576 — **49 years of the same agenda item**,
which is what makes the two area figures a political fact rather than a measurement difference, and it is now
carried by two openable records instead of by this plan's own prose.

**Guyana's income per head TRIPLED in three years and UNdata prints all three figures**: 5,640 US dollars in
2015, 6,779 in 2020 and **20,189 in 2023**. It is the largest movement in any economic series the pass has
met — larger than Djibouti's exports and in the opposite direction from Equatorial Guinea's fall — and it is
worth noting that the term said "offshore oil since 2015 has transformed the economy" and could not say by
how much. **The figures were in its own cited source the whole time.**

**And a live case at the International Court of Justice is citable like any other act of state.**
`icj-cij.org/case/171` is *Arbitral Award of 3 October 1899 (Guyana v. Venezuela)*, and the case page carries
its own procedural history — public hearings on the merits at the Peace Palace from 4 to 11 May 2026. The
deck has cited the Court's finished opinions before (Kosovo, batch 57); this is the first UNFINISHED case,
and the page states where it has got to, which is the only claim a card should make about one.

**Fiji is the Commonwealth's most-suspended member in the deck.** Its Key Facts line records membership
suspended **three times** — October 1987 to October 1997, June 2000 to December 2001, and December 2006 to
September 2014 — against the Gambia's single leave-and-rejoin (batch 53) and South Africa's (C6). The
Commonwealth's own prose also supplied the island count the term had been asserting without a source: "about
300 islands, only about 100 of which are inhabited", where the term said about 330 and some 110.

**Two of the WTO's newest members are in this deck and both joined in 2024** — Comoros on 21 August and
Timor-Leste on 30 August (batch 58), nine days apart. It is recorded here rather than on either card, since
neither card's sources carry the other's date; but it is worth knowing that a country page's membership line
is the most perishable fact the pass cites, and that two of them moved within a fortnight of each other.

**Batch 60 (Djibouti) is a one-card batch because the other half of it was a CHANGE TO THE MAP FORMAT.**
On request — "ensure the country Cyprus encompasses the whole island" — `map.key` now takes a LIST as well as
a name. `world.js` files a partitioned island as separate polygons, and Cyprus is three of them (`Cyprus`,
`N. Cyprus`, `Cyprus U.N. Buffer Zone`), so batch 59's card shaded two-thirds of what the reader could see
and asked them to name it. Four things about the implementation are decisions rather than plumbing. The names
are joined with a **pipe** for the markup's single attribute — no place name in either layer contains one and
`add-card.js` refuses one that does, so the join can never become lossy. **Every name must resolve or the
window fails**: a card shading two of three draws perfectly and asks about a shape that is not the country,
which is the worst failure this format has. The fill and the outline are laid down as **ONE PATH over all of
them**, because stroking each would draw exactly the internal lines that naming them together is meant to
hide. And the opening view centres on the union's bounding box only when there are several shapes — with one
it still centres on that shape's own published label point, **so not one of the 280 existing map cards moves
by a pixel**.

**Djibouti's American post was PROMOTED rather than opened, and that is now a pattern rather than a
curiosity.** On 27 June 1977 the American consulate general to the former French Territory of the Afars and
the Issas *became* the embassy at Djibouti; batch 59's Cyprus is the same shape, where "the American
Consulate General was elevated to an embassy" on the day of recognition in 1960. Two instances in two
batches, alongside the modes already recorded — opening an embassy, attending the ceremonies (the Gambia),
accrediting a neighbouring ambassador (Equatorial Guinea, Bahrain) — makes **the elevated consulate a fifth
way the guide records a relationship beginning**, and the one that leaves the same building and the same
staff on the same street.

**Djibouti's capital figure is for the CERCLE, and its own footnote says so.** UNdata gives 568,800 for the
capital in 2019 and footnotes it *"Refers to the population of the 'cercle'"* — a French administrative
district — so "close to half the country lives in the capital" is a statement about the district and not
about the city. That is the fourth footnote finding in three batches (Moldova's Transnistria, Cyprus's whole
country, Mauritius's two island sets, and now this), and the one that most changes what a number means
without changing the number.

**AN EXACT AGREEMENT IS NOT ALWAYS EVIDENCE.** UNdata and the World Bank both give Djibouti 23,200 km² — but
the World Bank rounds an area of this size to the nearest 10 and 23,200 is already a multiple of ten, so the
agreement costs nothing and proves nothing. Batch 56 made an exact agreement between UNdata and Eurostat the
test that makes a term checkable to the kilometre; **that works because neither of those two rounds**, and it
does not transfer to the World Bank. Ask whether the rounding could have produced the agreement before
treating it as corroboration.

**Batch 45's rule is in its eighth consecutive batch, and this is its clearest win yet.** The Djibouti term
lost three unsourced claims — "one of the hottest and driest countries on Earth", Lake Assal "at 155 m below
sea level the lowest point in Africa", and "the port handles most of landlocked Ethiopia's trade and several
countries keep military bases there" — and gained four figures UNdata prints: forest over 0.2 per cent of the
land, nearly four in five people in towns, **services employing 92.9 per cent of the workforce**, and exports
rising from 251 million dollars in 2015 to **4,466 million by 2020**. The last two say what the port does to
the country far better than the sentence that claimed it, and they can be checked.

**Batch 59 (Cyprus, Mauritius, Eswatini) is where batch 57's renamed-country rule becomes a table.** Eswatini
was renamed in 2018 and its four institutional sources split two against two: the recognition guide keeps
**`swaziland`**, the WTO keeps **`swaziland_e.htm`** (with `eswatini_e.htm` serving the 9,709-byte error
document at a 200), while the Commonwealth and SADC both use the new FORMAL name, **`kingdom-eswatini`** —
which extends C7's Commonwealth rule to SADC. Batch 57 established that a renamed country does not rename
anyone else's records; this shows the split runs straight through one batch of sources, so **try both names
rather than reasoning about which is likelier**. The byte-size test settles the WTO half in one fetch either
way.

**A PROFILE CAN COUNT A DIFFERENT TERRITORY FOR TWO OF ITS OWN FIELDS, AND ONLY ITS FOOTNOTES SAY SO.**
UNdata gives Mauritius a surface area of 1,979 km² footnoted *"Excluding the islands of Saint Brandon and
Agalega"* and a population of 1,268,000 footnoted *"Including Agalega, Rodrigues and Saint Brandon"* — the
area and the population on one page describe different countries. The Commonwealth explains the gap by
publishing the parts (Mauritius 1,864 km², Rodrigues 104, "total including other islands" 2,050) and SADC
gives 2,040, the term's figure exactly. **This is a step beyond Moldova and Cyprus, where a footnote explained
a divergence BETWEEN sources; here it explains one WITHIN a source**, which no comparison of sources could
ever have found.

**Cyprus is the pass's cleanest statement of the divided state, and every source is explicit.** UNdata's
population carries the footnote *"Refers to the whole country"* (1,371,000), the World Bank agrees at
1,370,754, and Eurostat gives **979,865**, the area the government controls — so it is the EU that counts
differently here, not UNdata, and C1's Cyprus finding is confirmed with the footnote that explains it. The
guide states the politics plainly: a Turkish-controlled area in the north declared independence in 1983 and
**"Turkey has been the only country in the world to recognize the TRNC"**, while the United States never has
and has maintained relations with Cyprus without interruption since 1960.

**`world.js` CARRIES THREE CYPRUS SHAPES AND THE CARD SHADES ONE.** `Cyprus`, `N. Cyprus` and `Cyprus U.N.
Buffer Zone` are separate polygons and `map.key` takes a single name, so the card shades the republic's own
area and leaves the north and the buffer zone in the layer's grey. **That is the right answer rather than a
compromise**: the card's second sentence is about precisely that division, and the map now illustrates it. It
is the first card in the deck whose shaded shape is deliberately not the whole island the reader can see, and
the question — "the country or territory shaded on the map" — is still exactly true of it.

**The guide's fourth error variety, and this one is a slip of the pen**: Mauritius's entry reads "Chargé
d'Affaires **at** interim" where every other page has *ad interim*. Trivial beside batch 55's misspelt head of
state, batch 57's surname spelt two ways and batch 58's heading contradicting its own paragraph — but it is
the fourth kind in five batches, and worth saying plainly: **these are typing errors in a good source, not
evidence the source is unreliable.** Every date and event the guide has stated has held.

**UNdata's own footnote confirms a two-capital claim for the first time.** Eswatini's capital field carries
*"Mbabane is the administrative capital and Lobamba is the legislative capital"* — a claim the deck has
previously taken from the Commonwealth or from this plan's own list of multi-seat countries. SADC adds that
Lobamba is the royal seat as well, and its area, 17,364 km², matches the term to the kilometre.

**A second area series that moves.** The World Bank gives Mauritius 2,007 km² for 2020 and 2021 and 2,010 for
2022 and 2023. Bahrain's moved by 15 km² as land was reclaimed (batch 57); this moves by 3, which is a
revision rather than a coastline. **An area is not always a constant, and the number does not say which kind
of change it is** — so a series that moves is a reason to read the other sources, not to prefer the newest
value.

**Batch 45's rule is in its seventh consecutive batch, and both replacements say more than what they
replaced.** Mauritius's "one of the world's longest continuous coral reefs" gave way to SADC's measured 67 km
by 46 km and its submarine volcanic origin; Eswatini's "one of the last absolute monarchies" became SADC's own
"the only absolute monarchy in southern Africa" — narrower, sourced, and a sharper fact. Two populations were
restated with them: Eswatini 1.2 → 1.3 million, and **Cyprus's single "roughly 1.3 million" became 1.4 million
for the island as a whole with Eurostat's 980,000 beside it**, since a term should not give one figure for a
country its own sources count two ways.

**Batch 58 (Timor-Leste, Estonia, Trinidad and Tobago) found the guide contradicting itself INSIDE one
entry — a heading against its own text.** Estonia's page carries the heading "American Legation established at
Tallinn, **1922**" over a paragraph that begins "The American Legation at Tallinn was established on **30 June
1930**", and the paragraph is right: it goes on to explain that until then the American representative resided
at Riga and was accredited to all three Baltic states. **Read the paragraph, not the heading.** The guide's
headings are a year appended to a section title and can be wrong where the prose is not. That is the third
variety of guide error in four batches — batch 55's misspelt head of state, batch 57's surname spelt two ways
across three pages, and now a date wrong against its own sentence — and the only one visible without leaving
the entry.

**Estonia and Latvia are one act, and Estonia's page states what batch 56 had to infer across two.** Both were
recognised on 28 July 1922 by Evan Young, the Commissioner at Riga, on Hughes's telegram of 25 July; Estonia's
entry adds that Young "would continue as the American representative to the three Baltic States, with the new
rank of Minister". So the four-states-on-one-day connection can be cited **on Estonia's own card**, from
Estonia's own page, without touching batch 21's rule about marking another state's claim to this country's
source. The doctrine is Latvia's word for word — never recognised the incorporation, representatives of the
last independent government kept their diplomatic status, relations held to have continued — and the 1991
dates differ by a day: restoration recognised 2 September for both, relations resumed 4 September for Estonia
and 5 September for Latvia, embassies opened on the same 2 October.

**Batch 56's square-kilometre test is now properly bounded, and Estonia is what bounds it.** For Slovenia and
Latvia, UNdata and Eurostat agreed EXACTLY and both terms were a few kilometres wrong. **Estonia's two do not
agree at all** — 45,261 at UNdata against 45,336 at Eurostat, 75 km² apart, with the World Bank's rounded
45,340 beside them — so the term's 45,339 sits inside the spread and stands. The rule was never that the two
sources agree: it is that **when they agree exactly the term becomes testable to the kilometre, and when they
do not, C9's spread rule governs as usual.**

**Timor-Leste, by contrast, is exactly the case C9 was written for**: UNdata gives 14,919 km², the World Bank
14,870 (an interval of 14,865–14,875 at its rounding), and the term said 14,954 — above both. Corrected to
14,919, with the divergence stated on the card.

**A THIRD FORMULA IN THE DIGITAL LIBRARY'S VOTE SUMMARIES, AND THE THREE ARE NOT SYNONYMS.** Earlier batches
met "Adopted unanimously" (Gabon, Guinea-Bissau, Equatorial Guinea, and resolution 1272 here), batch 57 met
"14-0-1" on resolution 1244, and Timor-Leste's admission is **"Adopted without vote"** — in the Council at its
4542nd meeting on 23 May 2002 and in the Assembly at its 20th plenary meeting on 27 September. A unanimous
vote is a vote taken; adoption without a vote is a vote not taken, and the record distinguishes them. **Quote
the record's own formula** rather than writing "unanimously" over all three.

**Batch 56's byte-size test paid a third and fourth time, both at the WTO, and the rule behind them is
small and permanent: the WTO drops "and" from a compound country slug.**
`countries_e/trinidad_and_tobago_e.htm` is the 9,709-byte error document served with a 200 and
`trinidad_tobago_e.htm` is the real page; `timor_leste_e.htm` likewise. The size check finds either answer in
one fetch. And the membership line is a LIVE fact, not a historical one: **Timor-Leste joined the WTO on 30
August 2024**, the most recent accession any card in this deck records.

**Trinidad and Tobago's date line is four events in eight weeks** — independence and American recognition on
31 August 1962, United Nations membership on 18 September, accession to the General Agreement on Tariffs and
Trade on 23 October. Only the Gambia's GATT accession four days after independence (batch 53) is tighter, and
that one had no UN admission in between.

**C11's Trinidad finding is confirmed from a third source, and the card states all three figures rather than
choosing.** C11 recorded UNdata as the outlier at 1,511 thousand against 1.37–1.4 million elsewhere; the World
Bank now gives 1,367,764 for 2025, flat within 20,000 for a decade, and the Commonwealth 1.4 million for 2022.
**And the Commonwealth counts a two-island state's islands SEPARATELY** — about 4,800 km² for Trinidad and 300
for Tobago — where every other source gives one total. That is a different unit of account rather than a
divergence, but a script summing a Commonwealth "Area" field would read 5,100 for a country whose other
sources give 5,127 and 5,130.

**Batch 45's rule is in its sixth consecutive batch.** Pitch Lake as "the world's largest natural asphalt
deposit" and Trinidad and Tobago as "one of the wealthier states in the region" both went; the second is
replaced by the guide's own "one of the most industrialised countries in the English-speaking Caribbean" and
the first by the Commonwealth's account of the two islands' relief, which says more and is citable.

**Batch 57 (North Macedonia, Kosovo, Bahrain) spent batch 56's byte-size test on its first outing and it
paid twice in one batch.** `history.state.gov/countries/north-macedonia` is a plain 404 and
`wto.org/…/north_macedonia_e.htm` is the 9,709-byte error document served with a 200 — and the reason is the
same for both: **each institution kept the pre-2019 slug.** The guide's page is `macedonia` and the WTO's is
`macedonia_e.htm`. A country that changes its name does not rename anyone else's records. **When a country
has been renamed, try the old name**, and note that the guide publishes an index at `history.state.gov/countries`
which resolves any slug in doubt in one fetch.

**The guide misspells one man's surname on one page of three, and this one settles INSIDE the guide.**
Bahrain's entry gives the ambassador first accredited to it as "William A. **Soltzfus**, Jr."; Qatar's and
Oman's both give **Stoltzfus**, and batch 53 recorded that link between those two. Bahrain is his third post
and the odd spelling. Where batch 55's "Akmeida" for Almeida had to be settled from outside, **a recurring
person is a spelling check the guide performs on itself** — so the card names Joseph W. Twinam, whose
spelling is stable, and describes the earlier ambassador without naming him.

**Kosovo has a SECOND PAGE SHAPE in the guide, and it is the richest page the deck has used.** Every other
entry runs Summary / Recognition / Diplomatic Relations in a few hundred words; Kosovo's is a **Historical
Overview** running from the Ottomans to 2008 at six times the length, with the recognition section at the
end — the 1974 Yugoslav constitution's socialist autonomous province with nearly the rights of a republic,
the 1981 riots, the ending of autonomy in 1989, the KLA in 1997, the 78-day air campaign, resolution 1244,
the declaration of 17 February 2008 and American recognition the next day. **Do not assume the guide's
template**: a state whose status is unusual gets an unusual page, and reading only for the usual headings
finds nothing at all.

**Kosovo is D2's Taiwan case one step less severe, and the step is worth naming.** D2 found a state outside
the UN system invisible to all three of Phase 3's sources. Kosovo has no UNdata profile — `xk` still 500s, as
C0 recorded — and **no World Bank surface-area series**, but it does have a World Bank POPULATION series
under `XKX`. **The one tool that reaches outside UN membership reaches only half way.** Nothing openable here
gives Kosovo's area or names Pristina as its capital (NATO's page places KFOR's headquarters at Camp Film
City, Pristina, which is not the same claim), so its facts box is the first in the deck with **no Area row
and no Capital row**, carrying population, region, EU membership status and the date of American recognition
instead. The term keeps its 10,887 km² and its Pristina, unmarked, on C9's principle that an uncontested
figure no source carries is recorded rather than deleted.

**The EU enlargement page's timeline prints the DATE ABOVE the item it dates.** Read the other way it shifts
every entry by one, and it reads perfectly naturally either way. Verified on three independently checkable
dates before any of it was used — the stabilisation and association agreement in force on 1 April 2016,
EULEX established on 4 February 2008, supervised independence declared at an end on 10 September 2012.

**A vote that is not unanimous, for the first time in the pass.** Every admission resolution cited so far was
adopted unanimously; **resolution 1244 (1999) was adopted 14-0-1** at the Security Council's 4011th meeting
on 10 June 1999, and the digital library's record page prints the vote summary beside the meeting number.
That record page is the only citable form: the resolution symbol carries parentheses, which `SRC_URL_RX`
stops at.

**Bahrain's area both disagrees between sources AND MOVES.** UNdata gives 778 km²; the World Bank series
gives 785 in 2020, 790 in 2021 and 2022, and 800 by 2023 — **the only area series in the whole pass that
changes**, in a country that is reclaiming land. The two disagree by 22 km² for the same year, 2023, which is
not a rounding and not reclamation timing. The term's 786 was in no source at all and goes to **778**, the
one precise published figure, by batch 45's rule; the divergence itself is stated on the card rather than
resolved, which is what C9 and C12 between them say to do when two sources part company.

**North Macedonia is the deck's clearest case of recognition under a NAME rather than of a state.**
Independence came in 1991 with the peaceful breakup of Yugoslavia, but recognition was delayed by Greece's
objection: the United States recognised "the former Yugoslav Republic of Macedonia" on 9 February 1994 under
the provisional designation, opened a liaison office at Skopje before that on 3 December 1993, confirmed
relations on 13 September 1995 in a Clinton announcement quoting his own correspondence with President Kiro
Gligorov, and began using the constitutional name in 2004. The Prespa Accord of June 2018 settled the
dispute, the country became the Republic of North Macedonia in February 2019, and NATO membership followed
on 27 March 2020. **It joined the United Nations under the provisional designation on 8 April 1993 and the
WTO under it on 4 April 2003** — three names, one state, and the sources still index it under the middle one.

**Batch 45's rule is now in its fifth consecutive batch.** Three unsourced claims went this time: Bahrain's
causeway to Saudi Arabia "since 1986" and its "some 50" islands, and North Macedonia's Lake Ohrid being
"among the oldest and deepest in Europe". Two sourced figures replaced them — Bahrain's density of some 2,100
people to the square kilometre and North Macedonia's two-fifths forest cover — and one clause was simply
dropped, since not every removal has a replacement waiting.

**Batch 56 (Slovenia, Equatorial Guinea, Latvia) puts Latvia beside Albania, and the two are opposites.**
Batch 55 found a relationship that stopped and restarted; **Latvia's never stopped.** The legation at Riga
closed on 5 September 1940 after the Soviet occupation and annexation, and the guide then says what no other
entry in the deck says: the United States "never recognized the state's forcible incorporation into the
Soviet Union", permitted Latvian representatives accredited by the last independent government to remain with
diplomatic status, and held that "diplomatic relations continued uninterrupted". So 1991 is recorded as the
recognition of the **restoration** of independence, on 2 September, and the present government as "a legal
continuation of the interwar republic". **A closed legation is not ended relations**, and only the guide's own
prose tells the two apart — the dates alone read identically to Albania's.

**And one telegram date runs through both batches.** Albania was recognised on 28 July 1922 on Secretary of
State Charles Evans Hughes's telegram of 25 July to the Commissioner in Albania; Latvia was recognised on
28 July 1922 on Hughes's telegram of 25 July to the Commissioner at Riga, instructing him to advise the
foreign offices of **Estonia, Latvia and Lithuania** of the decision "on the 28th". Four states recognised on
one day on instructions of one date. It is recorded here and on neither card, because batch 21's rule forbids
marking a claim about another state to this country's source.

**`wto.org` SERVES ITS OWN 404 WITH A 200 STATUS — the seventh variety of 200-status error document, and the
easiest to detect.** Equatorial Guinea is not a WTO member, and
`countries_e/equatorial_guinea_e.htm` answers 200 with a 9,709-byte page reading "HTTP 404 – File not
found". A real WTO country page is about 34,500 bytes. **Check the size before reading one** — the same
test P3 found for `senate.gov`, whose shell is a constant 37,523 bytes.

**When UNdata and Eurostat agree to the square kilometre, a European term is testable to the square
kilometre — and two of two were wrong.** Slovenia's gave 20,271 km² against both sources' **20,273**;
Latvia's gave 64,589 against both sources' **64,594**. Batch 54 established that the World Bank's rounding to
the nearest 10 km² is the floor under C9's area rule, and both terms sat inside that interval, which is
exactly what had been hiding them: **the floor applies only where the second source rounds**, and the EU
country page does not. Both corrected, with Latvia's imperial conversion moving 24,938 → 24,940 with it.

**A fourth outright World Bank area error, and it is in Europe this time.** `AG.SRF.TOTL.K2` gives Slovenia
**20,480 km²** against 20,273 at UNdata and at Eurostat — about one per cent, where that series' European
figures otherwise agree to a rounding. After C11's Canada (15,634,410 for 9,984,670) and Dominican Republic
and D1's Monaco, the pattern is settled: **the World Bank's area series is a source to check against a
second, never one to adjudicate with**, which is what C12 concluded of UNdata and what makes the two of them
a pair rather than an authority.

**A NEAR-MISS WORTH RECORDING, BECAUSE IT IS NOT THE FAILURE THIS PASS KEEPS WATCHING FOR.** The Equatorial
Guinea draft carried "income per head was 6,159 US dollars in 2023" — a number in no source, written in the
shape the other cards use rather than read off the page that was already fetched and open. The real figure is
**6,558, down from 9,069 in 2015**, which is a better fact than the invented one. N4's finding was a
fabricated author on a citation whose URL resolved; this is a fabricated FIGURE on a page that was sitting in
the scratch directory. **Check every number against the fetched file before the card is added**, and treat a
figure that arrived without a fetch exactly as the plan already treats a padding clause: the fix is another
look, never another sentence.

**Equatorial Guinea is the deck's third interruption in two batches and the fullest, because the guide gives
the REASON.** Relations were suspended by the United States on 14 March 1976, after its ambassador and consul
were declared *personae non gratae* in what the State Department called an "unwarranted affront"; resumed on
19 December 1979; the embassy at Malabo closed on 31 October 1995 with its work moved to Yaoundé; and it
reopened in 2006, the first resident ambassador in more than ten years presenting credentials on 23 November.
**Three breaks, three causes**: Albania's made by a third power, Guinea-Bissau's by a civil war, and this one
by the two governments themselves.

**Its UN pair also reverses Guinea-Bissau's order**: independence on 12 October 1968, the Security Council
recommending admission unanimously at its 1458th meeting on 6 November, the General Assembly admitting it at
its 1714th plenary meeting on 12 November — a month from independence to membership, where Guinea-Bissau's
Council recommendation came four weeks BEFORE the recognising powers moved.

**One thing deliberately not changed: the Region row and the term's prose may disagree.** UNdata's M49
scheme files Slovenia under *Southern Europe* where its term says central Europe, and Latvia under *Northern
Europe* where its term describes the eastern Baltic shore. G11 established that M49 is a statistical
grouping rather than a geographical claim — it is the scheme that puts all of Russia in Europe — so the card
states the source's own field and the term keeps its prose, and neither is wrong.

**Batch 55 (Albania, Lesotho, Guinea-Bissau) turns up a MODE the recognition guide has not shown before:
a relationship that stopped and started again.** Albania's entry is the longest in the deck so far, and it
records four acts rather than one — de jure recognition on 28 July 1922, relations established on 4 December
1922, relations ENDED on 5 June 1939 when the Albanian foreign minister told the American minister that Italy
had taken control of Albania's foreign affairs (the legation closed on 16 September), and relations RESUMED on
15 March 1991 with a memorandum of understanding signed in Washington. **A gap of nearly 52 years**, with an
informal American mission sent in 1945 and withdrawn in November 1946 inside it, and with UN membership
(14 December 1955) falling inside it too. The date line carries those four and no independence row, which is
the right four: the interruption is the fact.

**And Albania's page shows that the guide can be OUT OF DATE IN THE PRESENT TENSE.** Its summary ends
"Albania received an invitation to join NATO in April 2008 and is expected to become a full member in 2009" —
written before the event and never revised. **A source predicting a thing is not a source for the thing having
happened**, so the accession is cited to NATO's own enlargement page, which gives the accession protocol of
July 2008 and membership on 1 April 2009. Batch 54's EU candidate profile paid at once beside it: Thessaloniki
June 2003, application 2009, candidate status June 2014, negotiations opened March 2020, first
intergovernmental conference July 2022, and the last of all 33 chapters opened in December 2025.

**Lesotho gives the pass the MIRROR of C12's Venezuela case, and it is the more dangerous direction.** C12 kept
a term saying independence was achieved "by 1821" against a source saying "by 1819", because *by 1819* entails
*by 1821*. Here the term said Lesotho is "the only country whose whole territory lies above 1,400 m" and the
Southern African Development Community says **more than 1,000 metres** — and *all above 1,400* entails *all
above 1,000*, not the other way about, so the source cannot carry the term's figure at all. It reads as a
near-match and is a claim beyond every open source. **Ask which way the entailment runs before treating a
near-match as corroboration**; where it runs from the claim to the source, the source is not evidence.

**The Lesotho Highlands Water Project was nearly dropped as unsourceable and is documented by the authority
that runs it.** SADC lists "Water" among Lesotho's natural resources and says nothing about selling any;
`orasecom.org` refuses the connection and the Commonwealth page is silent — so the term's water-export clause
had no source. `lhda.org.ls` carries the whole of it on its front page: a multi-phased project established by
the 1986 treaty between Lesotho and South Africa, harnessing the Senqu/Orange in the highlands to supply water
to Gauteng and hydro-electricity to Lesotho. Note the shape of the fetch — `/lhda/about-lhwp` 404s and the
site ROOT is where the description lives. **When a fact belongs to a NAMED PROJECT, look for that project's
own authority before giving the fact up.**

**SADC's Lesotho page also says what its Botswana page left out**, which is the first time two pages of one
bloc profile have been read against each other here: SADCC was formed at Lusaka in **April** 1980 and
"transformed into" SADC in **1992**, where Botswana's page gives the year alone and no transformation date.
**Read a second page of a new bloc profile before deciding what it carries.** Its opposite number failed the
same test: **ECOWAS is NOT a bloc profile.** `ecowas.int/member-states/<slug>` answers 200 for Guinea-Bissau
with a page whose entire body is the word "guinea-bissau" and a date stamp — no capital, no area, no prose.
That is C7's "a page but not a profile" (Gabon at the Commonwealth) in its strongest form, since here every
member has such a page and not one of them carries anything. `cplp.org` 404s, so lusophone Africa has no bloc
profile either.

**Guinea-Bissau is the deck's sharpest illustration that ADMISSION AND RECOGNITION ARE DIFFERENT ACTS, and
the order surprises.** The Security Council recommended it for membership **unanimously**, at its 1791st
meeting, on **12 August 1974**; the United States recognised the republic on **10 September**, when President
Ford wrote to the President of the Council of State; the General Assembly admitted it on **17 September**.
Nearly a month separates the Council's unanimous recommendation from the formal recognition of one of the
Council's own permanent members. Both UN acts are openable at `digitallibrary.un.org/record/<id>` — 93484 for
S/RES/356 (1974) and 189827 for A/RES/3205 (XXIX) — and the record pages carry the meeting numbers and the
vote summary that the resolution symbols, with their parentheses, cannot be cited for.

**The guide misspells a head of state, and the card does not repeat it.** Guinea-Bissau's entry gives the
President of the Council of State as "Luis de Akmeida Cabral"; the name is **Luís de Almeida Cabral**. The
card prints the correct spelling with the citation pointing at the page that does not. **A citation's job is
to be checkable, not to be transcribed** — propagate the fact, never the typo — and this is the third kind of
error found ON a page that opens perfectly, after N4's missing metadata and P2's essay contradicting itself.

**One finding runs the other way for once: a term claiming LESS than its own source.** Albania's said it spent
1944 to 1991 "under one of the most isolated communist governments in Europe"; the guide it already cited says
Albania under **Enver Hoxha** "was one of the most diplomatically isolated nations in the world". Taking the
source's own scope made the sentence stronger AND sourced, and named the man. The pass keeps finding prose
that reaches past its citations; it is worth remembering that prose can fall short of them too, and that both
are fixed by reading the source rather than the sentence.

**Three populations re-rounded to the figure their own source gives**: Lesotho 2.3 → 2.4 million (2,363,325),
Guinea-Bissau 2.3 → 2.2 million (2,249,515), and **Albania deliberately left at 2.4** — the World Bank's
2,349,580 sits within a thousand of the midpoint, so either rounding is defensible and changing it would buy
a reader nothing. Albania's own gap between sources stays the widest in Europe (UNdata projects 2,772,000
against that 2,349,580, and the World Bank series has fallen in every one of the last ten years), which D1
established and this batch states on the card rather than hiding.

**Batch 54 (Gabon, Botswana, Moldova) found the bloc profile for SOUTHERN AFRICA and the one for an EU
CANDIDATE, which between them cover most of what is left in Europe and Africa.** `sadc.int/member-states/<slug>`
gives Capital, Area, Currency, Independence Day and a paragraph of prose for each of the sixteen Southern
African Development Community states — C4's Commonwealth shape, verified on Botswana and on Namibia, and
reaching Angola, Mozambique, DR Congo, Madagascar and Tanzania where the Commonwealth reaches some of them
and none of the first. And **`enlargement.ec.europa.eu/<country>_en` is the EU country page's equivalent for
a state that is not a member**: C1's second source covers members only, so every candidate has been sourceless
since, and Moldova's page states "Membership status: candidate country" outright with the whole chronology
under it — applied on 3 March 2022, European perspective on 23 June 2022 by unanimous agreement of all 27
leaders, accession negotiations opened by the European Council on 14 December 2023. **Quote the page's own
wording**: it says *European perspective* where the common account says *candidate status*. The path matters —
`/enlargement-policy/moldova_en` and the `neighbourhood-enlargement` host both 404, and only the short
`/<country>_en` form answers. It is the source for Albania, North Macedonia, Kosovo, Serbia, Montenegro,
Georgia, Ukraine and Turkey, eight of which are still to come.

**Batch 54's second finding retires D1's Moldova outlier by READING THE FOOTNOTE.** D1 recorded that UNdata's
2,996,000 disagrees with the World Bank's 2,360,527 and that the World Bank matches the term, and left it as a
divergence. It is not a divergence: UNdata's figure carries footnote **b, "Including the Transnistria region"**,
where the World Bank follows the national statistical service, so the two are counting different countries.
That is C1's Cyprus case exactly — the EU counting only the government-controlled area of a divided state —
and it is the third time batch 14's rule has paid. **A gap that looks like a dispute is often a definition, and
the definition is usually printed under the table.**

**And it settles where C9's area rule stops.** Moldova's term gives 33,846 km² against UNdata's 33,847 and the
World Bank's 33,850, which is strictly outside the spread, and C9 says correct an area that falls outside it.
It was left alone, because C10 qualified that rule without saying it was doing so: **the World Bank rounds a
small area to the nearest 10 km², so 33,850 is the interval 33,845–33,855 and it CONTAINS the term's figure.**
That is the test C10 ran on Fiji, where 18,274 was outside 18,270 ± 5 as well and so was corrected. **C9's rule
has no floor of its own; C10's rounding interval is the floor.** Below it a "correction" is a change inside a
source's own precision, which buys a reader nothing and costs the term a true sentence.

**Gabon resolves C7's deferral by C8's method, and its forest figure is a third kind of finding.** C7 read
UNdata's 2,593 thousand against the term's 2.4 million as one-source-only and deferred; the World Bank series
passes through 2,430,747 in 2022, so the figure was stale rather than contested and went to 2.6 million. The
forest clause is different: the term said tropical rainforest covered "about 85 per cent" of the country, and
**UNdata — the term's own source 1 — prints Forested area 91.2 per cent of land area.** It is logged as a
REWRITE and not a correction, deliberately, because *rainforest* and *forest* are not the same class and the
two figures do not strictly contradict; what was wrong is that 85 was in no source the term cites. **The World
Bank's `AG.LND.FRST.ZS` gives 91.228 for the same year and is NOT a second source** — it relays the same FAO
number, which is C8's `SP.POP.TOTL` caution one series over. Two unsourced superlatives went with it, "one of
the highest proportions anywhere" and "one of the higher average incomes in sub-Saharan Africa", the second
replaced by the 8,071 US dollars UNdata prints: batch 45's rule for the fourth batch running.

**Botswana's population was wrong in the direction C8's diagnostic does not have a name for.** The term said
2.7 million; the World Bank series never reaches it in eleven years, its maximum being the 2025 value of
2,562,122, and UNdata gives 2,562 thousand with the Commonwealth at 2.352 million for 2022. So it is neither
stale (no year on the series was ever 2.7) nor contested (nobody publishes 2.7) — it is simply above every
published estimate, and a figure above all of them is corrected on the same footing as one behind them.
Its third sentence lost "from 1885" and "one of the poorest countries in the world", neither in any cited
work, and gained the recognition guide's own "under British sovereignty as Bechuanaland" and SADC's list of
natural resources.

**A 200 THAT SERVES ANOTHER COUNTRY'S PAGE — the sixth variety of 200-status error document, and the worst.**
`worldbank.org/en/country/botswana/overview` returned the complete Bosnia and Herzegovina country page:
headline, thirty-years-of-partnership brief, road-project story, energy press release, data links, all of it
coherent and none of it about Botswana. The five varieties recorded before this one announce themselves —
a JavaScript shell, a CloudFront block, a client challenge, a "Technical Difficulties" page, a 404 document —
and this one does not, because the page is real. **Grep a fetched country page for its own country's name
before reading a word of it.**

**Moldova ships with NO independence row, and the near-miss is the reason to say so.** The recognition guide
dates U.S. recognition to 25 December 1991 and says only that Moldova "previously had been a constituent
republic of the USSR"; the constitution's preamble refers to "the proclamation of independence" without a
date; and the declaration of 27 August 1991 is in nothing openable here. What the constitution does state is
that it **came into force on 27 August 1994**, repealing the constitution of 15 April 1978 — the third
anniversary of the declaration, which is exactly the coincidence a card must not quietly turn into a citation.
The date line carries recognition, relations, UN membership and the constitution instead, and the Constitute
Project is a good fifth source for any post-Soviet state whose founding act cannot be reached.

**Access, measured this batch.** `opec.org` 403, so Gabon's oil has no source from its own cartel;
`ceeac-eccas.org/en/member-states/` 404, so **ECCAS is not a bloc profile for central Africa** and Gabon's
region has none; `imf.org/en/Countries/<ISO3>` 403; `kimberleyprocess.com` 404, so Botswana's diamonds are
carried by SADC's resource list and nothing stronger; `eia.gov/international/analysis/country/<ISO3>` is a
JavaScript shell with no country content; `consilium.europa.eu` 403. Working and worth keeping:
`moldova.osce.org` (the OSCE Mission to Moldova, established 4 February 1993, with the 57 participating
states' settlement formula stated on the front page), `constituteproject.org/constitution/<Country>_<year>`,
and `digitallibrary.un.org/record/<id>` for a Security Council admission resolution — Gabon's is
**S/RES/153 (1960) of 23 August 1960**, six days after independence, and the record URL carries no
parenthesis where the symbol does.

**Batch 53 (Qatar, Jamaica, the Gambia) collects three more MODES of recognition, and the Gambia's is
new to the deck: recognition BY ATTENDING.** On 18 February 1965 the Assistant Secretary for African
Affairs represented President Johnson as his personal representative, **with the rank of special
ambassador**, at the independence ceremonies at Bathurst — and the guide files that presence as the
recognition itself. Jamaica's came "with the establishment of the American Embassy at Kingston" on 16
August 1962, one act serving as recognition, relations and embassy alike, which is Namibia's shape from
last batch. Qatar's was a Department of State announcement two days after independence. **The guide's
Recognition heading is not a single kind of event, and the card's job is to say which kind this was.**

**One envoy links two cards, and both guide entries say so.** William A. Stoltzfus Jr. presented his
credentials in Qatar on 19 March 1972 and in Oman (`gw-125`) on 17 April, accredited to a number of Gulf
states at once and resident in Kuwait. The Qatar card cites BOTH guide pages for that sentence, which is
batch 21's rule again: a claim about another country is marked to that country's own source.

**The Gambia acceded to the GATT four days after independence** — 22 February 1965 against 18 February —
and it is the deck's second country to leave the Commonwealth and rejoin, after South Africa: the
Secretariat's line reads "1965, following independence from Britain; left 2013, rejoined 2018". **Read the
whole joining line; it is not always one date.**

**Qatar's sex ratio is 246 men to every 100 women, the widest figure this pass has met** — against Oman's
166 (batch 47) and Kuwait's 157 (batch 48) — and its two published populations differ by 144,000, UNdata
giving 3,116,000 against the World Bank's 2,972,215. **Three Gulf cards in seven batches, three ratios far
outside anything else in the deck**, and the card states the figure without explaining it.

**Two more superlatives went out for figures.** `Qatar`'s "one of the highest-income countries in the
world" became **66,600 US dollars a head**, from the profile it already cited; and `The_Gambia`'s "the
smallest state on the African mainland" became "the smallest country in West Africa", which is what the
Commonwealth page actually says — the term had widened its own source's claim. Its population moved 2.7 →
**2.8 million**, both sources agreeing at 2,822,000.

**Batch 52 (Armenia, Namibia, Lithuania) is three ways a state can be recognised and then not exist, and
the guide keeps all three straight.** **Armenia** was recognised on **23 April 1920** in a note whose
wording is the card's point — the recognition "in no way predetermines the territorial frontiers, which …
are matters for later delimitation" — after which Wilson, at the request of the Paris Peace Conference's
Supreme Council, ARBITRATED the boundary with Turkey and submitted his determinations on 22 November 1920,
by which time the Red Army had already put local communists in power. **A recognition can be granted
before the frontiers exist and outlive the state it recognised by seventy years.**

**Lithuania is the opposite case: a recognition that never lapsed.** Recognised on 28 July 1922, the
legation at Kaunas closed on 5 September 1940 after the Soviet annexation — and the United States **never
recognised the forcible incorporation**, let the representatives accredited by the last independent
government stay on with diplomatic status, and held that relations continued uninterrupted, so 1991 brought
the RESTORATION of independence (2 September) and the RESUMPTION of normal relations (6 September) rather
than either afresh. The guide adds that the present government is viewed as a legal continuation of the
interwar republic. **Read the verbs in a guide entry: "resumed" and "restoration" are load-bearing words,
and they are what distinguish this card from every other post-Soviet one in the deck.**

**Namibia is the deck's most compressed act: recognition, relations and an embassy in one.** On **21 March
1990** the American liaison office at Windhoek was elevated to embassy status, and the guide files that
single act under all three headings. Its terms had been set twelve years earlier by **Security Council
resolution 435 (1978)**, adopted 12–0–2, which established the UN Transition Assistance Group; and the
General Assembly admitted it on 23 April 1990 at the **first meeting of its eighteenth SPECIAL session** —
the only admission in the deck so far not taken at a regular one.

**Two term figures were outside the spread and both were corrected.** `Namibia` gave 825,615 km², above
all three published figures (825,229 at the UN, 824,290 at the World Bank, 824,000 at the Commonwealth),
and `Lithuania` gave 65,300 against a spread of 65,284–65,290. `Namibia` also lost "among the most thinly
populated in the world" for **3.8 people to the square kilometre**, which is batch 45's rule — a figure a
source prints beats a superlative no source states — for the third time in eight batches.

**And Armenia's own populations disagree by 4.6%**, UNdata giving 2,952,000 against the World Bank's
3,086,700, so the card prints both and the term's "roughly 3 million" covers them. Its sex ratio, 87 men
to 100 women, is the second in three batches from the Caucasus at that level.

**Batch 51 (Bosnia and Herzegovina) turns up the deck's strangest embassy and a constitution that is an
ANNEX.** Victor Jackovich presented his credentials as American ambassador on **23 June 1993** and had
nowhere to work: an American embassy to Bosnia and Herzegovina was established on **10 November 1993 on
the premises of the American embassy in Vienna**, and an embassy in Sarajevo itself only on 4 July 1994.
Norway's wartime legation (batch 42) sat in London beside a government-in-exile; this one was accredited
to a government at home and sited in a third country because the capital was under siege. **A guide entry
that names two establishment dates for one embassy is telling you where the war was.**

**And the constitution is Annex 4.** The OSCE's own page on the General Framework Agreement for Peace —
reached at Wright-Patterson Air Force Base near Dayton in November 1995, formally signed at Paris on 14
December — states that "the current Constitution of Bosnia and Herzegovina is the Annex 4 of the DPA".
The `Bosnia_and_Herzegovina` term had said instead that the agreement "reorganised" the country "into two
entities", which that page does not say; it now says what the page says, which is both citable and more
striking. **When a term's only source for a sentence is one institutional page, read what the page
actually claims before keeping the sentence's shape.**

**Its admission resolution shares a meeting with Croatia's, one batch after Mongolia's shared one with
Mauritania's.** `A/RES/46/237` and `A/RES/46/238` were both adopted without a vote at the **86th plenary
meeting on 22 May 1992**. That is now twice in two batches that a card's admission has turned out to sit
beside a card already written; **the register of sittings is worth grepping before every admission
search**, which is batch 40's rule paying for the sixth and seventh time.

**The ICJ case is reported in the Court's own words, including what it declined to find.** On 26 February
2007 the Court found that Serbia had violated its obligation to PREVENT the genocide at Srebrenica; that
other acts before it were not accompanied by the specific intent that defines genocide; and that financial
compensation was not the appropriate reparation, since it had not been shown the genocide would in fact
have been averted. **On a case this contested the negative findings are half the holding**, and a card that
gives only the violation misreports the judgment.

**Its population fall is the steepest the pass has measured, and it displaces last batch's record.**
3,518,541 in 2015 to 3,140,095 in 2025 — about a ninth — against Puerto Rico's tenth, Bulgaria's 8%,
Serbia's 7.7% and Croatia's 6.6%. Five of the six steepest declines carded are in the western Balkans or
the Caribbean. Its term's "roughly 3.2 million" went to **3.1**, both sources agreeing at 3,140,000.

**Batch 50 (Mongolia, Uruguay, Puerto Rico) is batch 48's Kuwait finding turned over: here the guide
states what does NOT constitute recognition.** The United States had not blocked Mongolia's admission to
the United Nations in 1961 — it abstained — and had signed several multilateral treaties to which Mongolia
was also a party, and the entry says in terms that **"these acts had not constituted recognition"**, which
waited until **27 January 1987**, twenty-six years later, the Kennedy, Johnson, Nixon and Carter
administrations having each entertained it without success. Kuwait's recognition was a practice before it
was an act; Mongolia's practice explicitly fell short of one. **Two consecutive batches, opposite
directions, and the guide says which it is on the page both times.**

**The admission resolutions are consecutive and printed on the same page, which is how the card links
Mongolia to Mauritania without asserting a bargain.** `A/RES/1630(XVI)` and `A/RES/1631(XVI)` were both
adopted at the **1043rd plenary meeting on 27 October 1961** and both sit at p. 64 of `A/5100`. C9 recorded
that Mauritania's UN membership date does not corroborate its independence year because of a Cold War
admission deadlock; the deck now holds both halves of the package that broke it, each cited to its own
record. **Where two states were admitted together, cite both records** — batch 21's rule about not marking
a claim on another state to this one's source, applied to a resolution rather than a profile.

**Uruguay's recognition is the deck's oddest instrument: an EXEQUATUR ISSUED IN NEW YORK.** On 25 January
1836 the United States recognised the Oriental Republic by issuing an exequatur to John Darby as its
consul general at New York — recognition performed by accepting the other state's consul on American
soil, rather than by sending anyone. Diplomatic relations waited another 31 years, and for three of those
the American minister accredited to Uruguay lived at Buenos Aires.

**Puerto Rico is the deck's second territory card, and it needed a spine no country card uses.** The
recognition guide has no page for it — the guide is written from the United States outward, as C11 found
for the United States itself — so the card rests on **`A/RES/748 (VIII)`** of 27 November 1953,
*Cessation of the transmission of information under Article 73e of the Charter in respect of Puerto Rico*,
on the Office of the Historian's **Spanish-American War milestone** for the 1898 cession, and on the
profile's own footnote that the data for the United States **do not include this area** — New Zealand's
Cook Islands note (batch 46) seen from the other side. Its facts box takes Hong Kong's and Palestine's
`Status` row, and its UNdata profile carries no membership date, which the card states as Palestine's does.

**That resolution's PDF is an image scan with no text layer, and the catalogue entry is the citation.**
Like `A/RES/995(X)`, `T/1269` and `A/RES/2908(XXVII)` before it, `A_RES_748(VIII)-EN.pdf` extracts to
nothing — but the record carries the symbol, the full title, the 459th plenary meeting and the date, and
**the title alone states what the Assembly did**. Cite the record, quote the title, claim nothing from the
body.

**Its population is the steepest fall the pass has measured**: 3,535,167 in 2015 to 3,184,835 in 2025, a
tenth in ten years, against Bulgaria's 8%, Serbia's 7.7% and Croatia's 6.6%. Uruguay's, by contrast, is
the flattest — up half a per cent in the same decade.

**And the style checker earned its keep for the third batch running.** "thirty-one years" on the Uruguay
card broke rule 1 (non-round numbers above 20 are numerals) and was caught by reading the `=== data.js`
block, which is batch 40's rule; the tail of that report is about `changelog.js` and would have shown
nothing.

**Batch 49 (Croatia, Georgia, Eritrea) is three post-1991 states whose guide entries run to three facts
each, and it settles how such a card is built: the UN's own ADMISSION RESOLUTION and, where there is one,
the country's case at the INTERNATIONAL COURT OF JUSTICE.** Croatia was admitted without a vote at the 86th
plenary meeting on 22 May 1992 (`A/RES/46/238`), Georgia **unanimously** at the 88th on 31 July 1992
(`A/RES/46/241`), Eritrea without a vote at the 104th on 28 May 1993 (`A/RES/47/230`) — each record carrying
the vote line, the meeting number and the date. **A short guide entry is not a thin card; it is a card that
has to be built from the UN side.**

**The World Bank's surface-area series is measuring something other than land, and Croatia is the case that
shows it.** UNdata and Eurostat both give **56,594 km²** to the square kilometre where the World Bank gives
**88,070** — half as much again, on a country whose territorial waters are about that difference. Batch 42
recorded Norway's 323,772 against 624,500 as a probable fourth outright World Bank error; **two of the
pass's three widest area gaps are now maritime states**, which is a better explanation than error and is
recorded here as a HYPOTHESIS, uncited, in C12's Ecuador manner. **Where the World Bank's area is wildly
high, look at the coastline before calling it wrong.**

**Georgia's profile carries a footnote that reads against expectation, and the card states it without
explaining it.** Its UN population is footnoted "Including Abkhazia and South Ossetia" and stands at
**3,807,000**, where the World Bank — whose figures come from a service that excludes them — counts
**3,935,766**: the count that says it takes the two territories in is the SMALLER of the two. **Print both
and the footnote; the reconciliation is not in either source.**

**Eritrea is the deck's first same-day recognition, and the referendum behind it is citable.** It declared
independence on 27 April 1993 and the United States recognised it that day, the consulate at Asmara
informing Eritrean authorities — and the vote was verified by a United Nations observer mission named for
that one task, reported on by the Secretary-General that August. **A referendum a UN mission observed leaves
a paper trail in the Digital Library even when no country page carries it.**

**Its term also carried the batch's only figure corrections, and both were outside the spread.** `Eritrea`
gave 117,600 km² where UNdata gives 121,144 and the World Bank 121,766 — 3% below both, so C9 corrects it —
and "roughly 3.7 million" where the two agree **to the person** at 3,607,003. **When the two sources agree
exactly and the term does not, there is nothing to weigh.**

**And a drafting note worth keeping, because it nearly shipped.** A sentence padding the Georgia card to
length claimed the WTO accession came "three years before the World Bank's series shows its population
beginning to recover" — a detail from no fetched series, written to fill a word count. It was caught and
replaced with the 2015–2025 figures actually in hand. **A card that is short is short because the research
is short; the fix is another fetch, never another clause.**

**Batch 48 (Costa Rica, Kuwait, Panama) opens a source this deck had not used: a country's own
CONSTITUTION.** `constituteproject.org` is open here and serves consolidated constitutional text with the
articles numbered — Costa Rica's **Article 12** reads "The Army as a permanent institution is proscribed",
provides instead for the police forces needed to keep public order, and allows military forces only by
continental agreement or for national defence. The `Costa_Rica` term had been asserting that the army was
abolished in 1948 with the recognition guide as its only marker, and the guide says nothing about it.
**Where a claim is what a state's own law provides, the law itself is usually the shortest way to it**, and
this one is reusable: the site carries every country's text under the same URL shape.

**Costa Rica is also the deck's clearest case of a recognition that produced nothing.** The guide records
that Ephraim G. Squier, the chargé in Guatemala, was given full powers on 24 April 1849 to negotiate with
Costa Rica and that this "constituted recognition by the United States" — and then that he **never
transmitted his letter of credence, never visited the country and reached no agreement by correspondence**.
Relations waited until the Costa Rican minister presented credentials in Washington on 24 March 1851, and
the first American minister accredited to the country, in 1853, was appointed to four states at once and
presented his credentials only in Nicaragua. D3's prose reconciliation rides into the card unchanged: the
1821 independence from Spain is cited to the guide's **El Salvador** page and the 1848 declaration to Costa
Rica's own.

**Kuwait inverts batch 44's Ireland case: here recognition came BEFORE independence, and the guide says how
it was evidenced.** Kuwait became fully independent on 19 June 1961 when an exchange of notes terminated
the Anglo-Kuwaiti Treaty of 1899 — but the Department of State noted a month later that the United States
had "for some time recognized Kuwait as a sovereign state", **as evidenced by its consular officers
receiving exequaturs from the Ruler** and by a visa agreement concluded directly with Kuwait in December
1960, while the protectorate still stood. **Recognition can be a PRACTICE before it is an act**, and a
guide entry that lists the evidence is the place that says so.

**Kuwait is also the batch's one figure disagreement, and the term now says so rather than picking a side.**
UNdata gives 5,026 thousand against the World Bank's 4,865,298 — 161,000 apart, or 3% — where its area
figures differ by two square kilometres. The term said "roughly 4.9 million", which is the World Bank's
number while citing UNdata; it now reads "4.9 to 5 million people by the two international counts" and
cites both. **When two sources differ by more than a rounding, say the range and cite them both** — the
alternative is a term whose own citation contradicts its only figure.

**Panama has more recorded breaks in relations than any country carded: four in 37 years.** 1931 and 1949
after changes of government, 1968 after a coup, and **1964 by Panama itself** — President Chiari severing
relations on 10 January after clashes in the Canal Zone that followed a flag-raising incident between
Panamanian and American students, and the two states restoring them by a joint declaration of 3 April
agreeing to seek "the prompt elimination of the causes of conflict … without limitations or preconditions
of any kind". Every break was mended within weeks or months. Its consular relations, at 1823, predate the
country by eighty years, in what was then Colombia — the Singapore and Oman pattern for a third time.

**Batch 47 (Palestine, Oman, Mauritania) writes the term this plan has deferred since it was drafted,
and the sources do the attributing rather than the card.** `gw-124` was written to the rule set out above —
the positions described, no state's account of its own claim given as established fact — and what made it
writeable is that the two UN works say who is speaking. **UNdata prints East Jerusalem as the capital
city and footnotes the entry**: "Designation and data provided by the State of Palestine. The position of
the UN on Jerusalem is stated in A/RES/181 (II) and subsequent General Assembly and Security Council
resolutions." **A/RES/67/19 supplies the rest in the Assembly's own words** — non-member observer State
status accorded **138 to 9 with 41 abstentions** on 29 November 2012, exactly 65 years after the partition
vote of 29 November 1947; the 1988 proclamation by the Palestine National Council acknowledged; "Palestinian
territory occupied since 1967"; the annexation of East Jerusalem "not recognized by the international
community"; and the status of Jerusalem "as the capital of two States" left to negotiation. The two ICJ
advisory opinions, of 9 July 2004 and 19 July 2024, are reported as what the Court held and dated to their
own case pages. **The facts box takes Hong Kong's `Status` row rather than a `Capital` row**, so the card
asks nothing the capital deck defers; **`gw-624` stays deferred.**

**An ABSENT row is itself a fact, and this is the first card to use one.** Palestine's UNdata profile
carries no UN membership date where every other profile in the deck has one — an observer State is not a
member — and the card says so rather than passing over the gap.

**Oman is the deck's longest wait between recognition and relations: 139 years.** Mutual recognition came
by the treaty of amity and commerce signed at Muscat on **21 September 1833** by the special agent Edmund
Roberts and Seyyid Said bin Sultan, among the earliest American dealings with the Middle East; diplomatic
relations waited until **17 April 1972**, and the first minister was accredited to Bahrain, Kuwait, Qatar
and the United Arab Emirates as well and resident in Kuwait. Against Liberia's fifteen years (batch 41) and
Singapore's 129-year gap between a consulate and its state, this is the widest yet.

**Persée pays a second time, one batch after the first.** Pradines's study of Omani forts in East Africa
carries the Zanzibar clause the `Oman` term had been asserting with the recognition guide as its only
marker — the guide says nothing about frankincense, the Indian Ocean or Zanzibar. **A French congress
volume on Persée is as citable as a journal**, and the doc page gives the full bibliographic reference.

**A UN Special Rapporteur's report is a first-rate source, and its PDF extracts.** `A/HRC/54/30/Add.2`
(Obokata, visit of May 2022) records that Mauritania **first explicitly outlawed slavery in 1981, by Order
No. 081-234** — a law vague in its definition, without measures for implementation, concerned to compensate
enslavers rather than to make reparation to victims, and not criminalising slavery at all, which waited for
the Act of **2007**, with the constitution classing it a crime against humanity in **2012**. That replaces
the term's unsourced superlative, "the last country to abolish slavery in law". `ohchr.org` is **403** here,
so the Digital Library's own copy is the way in — and **its text layer positions every glyph separately**,
so "1981" extracts as "1 9 8 1" and a plain grep finds nothing: **collapse all whitespace before searching
an extracted UN PDF.**

**Mauritania is also the deck's only severance BY the other party** — relations cut by Mauritania on 7 June
1967 in the wake of the June war and resumed by joint communiqué on 22 December 1969 — where every other
break carded has been American or an occupation. And **both these countries' populations are the fastest
growing yet carded**, Oman up about 31% and Mauritania about a third in ten years.

**One tooling finding, and it is the reason to re-count by hand: `add-sources.js` does NOT measure abstract
length, where `add-card.js` refuses anything outside 270–330.** A rewritten Palestine abstract went through
at **331 words** with nothing said. **After revising an abstract through `add-sources.js`, count the words
again** — the gate that would have caught it is on the other tool.

**Batch 46 (New Zealand) is C10's Australia case at full strength: THREE institutions give three dates
for one transition, and the card prints all three.** The colony was raised to a self-governing Dominion on
**26 September 1907**, sovereign at home while the United Kingdom kept its external relations; the Balfour
Declaration of 1926 called the Dominions equal in status and in no way subordinate; the Statute of
Westminster of December 1931 put that in law but only for a Dominion that adopted it; **the United States
recognised autonomous control of foreign relations on 16 February 1942**; and New Zealand's own Statute of
Westminster Adoption Act became law on **25 November 1947** — five years AFTER the recognition it would
have justified. The Commonwealth Secretariat, meanwhile, dates its membership to "1931, under the Statute
of Westminster". **Where a dominion becomes a state by degrees, no single date is the answer and the card's
job is to lay the sequence out.**

**The footnote rule pays a third time in two batches, and this profile puts the note on the POPULATION.**
UNdata's New Zealand population is footnoted "the data for New Zealand do not include Cook Islands, Niue,
and Tokelau" while its surface area carries only a year — the same asymmetry as Finland's Åland note and
Norway's Svalbard note, with the coverage declared on the other figure. Three profiles now: **assume
nothing about what a figure covers until its letters are read.**

**New Zealand's entire national documentary web is shut to this sandbox, and the national MUSEUM is what
answered.** `nzhistory.govt.nz` and `teara.govt.nz` are **403**; `archives.govt.nz` serves an Incapsula
bot-wall stub **with a 200** — a sixth variety of 200-status error document; and `legislation.govt.nz`
returns **202 with an empty body**, a shape this pass has not met before. The Treaty of Waitangi is carried
instead by **Te Papa**, the Museum of New Zealand, and the settlement date by a PNAS paper found through
Europe PMC. **When a country's own history and legislation sites are closed, try its national museum
before giving the claim up.**

**A GUESSED Europe PMC article id returns 200, so a status check cannot catch a fabricated one.** The URL
`europepmc.org/article/MED/18461082` was constructed from a half-remembered PMID and answered 200; the real
one is **18523023**. That is N4's fabricated-citation trap in a new host, and the way round it is the same:
**resolve the identifier through the REST API** (`search?query=PMCID:PMC…` returns the title, the PMID and
the author string) and read the title back before citing it.

**And cite the DOI rather than the Europe PMC page, because only the DOI keeps the byline machine-checked.**
`check-citations.js` reads a DOI only when it is the TRAILING url of the citation, so a citation ending at
`europepmc.org` is reported "unchecked"; ending at `doi.org` it verified all four of Wilmshurst, Anderson,
Higham and Worthy against Crossref, given names and all. A **403 from `pnas.org` is a bot wall and not a
paywall**, so the open-access label stands — the artefact plan's rule, applied to an access decision rather
than to a refusal.

**The term's fault is the same one for the sixth batch running, with a correction attached.** Its area of
268,021 km² is published by none of its sources — UNdata gives 268,107, the Commonwealth 268,000 and the
World Bank 267,710 — so, inside the spread or not, it becomes the figure Source A prints; and "Polynesian
settlers arrived around 1300" becomes **around 1280**, which is what the radiocarbon dating of the Pacific
rat's bones and gnawed seeds gives, a millennium later than the chronologies that paper set out to correct.

**Batch 45 (Central African Republic) is the first card in the deck carried by FRENCH scholarship, and
Persée is why it could be written at all.** The guide's entry is five facts long and says nothing about
the colony, so the colonial half comes from two open articles: a review that records the administration
granting possession of the Ubangi to **more than forty concession companies** which divided it between
them, and Pierre Mollion's study of **porterage in Oubangui-Chari, 1890–1930**, on the carrying of loads
and of people to link the Ubangi basin with Lake Chad's. **`persee.fr` is open on `/doc/<id>` and 403 on
`/docAsPDF/<id>.pdf`**, and the doc page carries the article's opening pages, its full bibliographic
reference and its DOI — enough to cite and to quote from, and the DOI is in Crossref, so
`check-citations.js` verifies the byline. CLAUDE.md already permits a foreign-language source where it
carries detail no English one does; **for French colonial Africa that is the ordinary case rather than
the exception**, and this is the deck's first use of it.

**Its UN admission is the 864th plenary meeting for the FIFTH time.** Togo, Dahomey and the Republic of
the Congo were already carded from that sitting of 20 September 1960; the Central African Republic's own
resolution is **1488 (XV)**, adopted without a vote there. Batch 40's rule — check the register for the
sitting before searching for a resolution — now has five cards behind it, and the search that finds a new
one is a UN Digital Library title search, which returns the record id even when the resolution's own PDF
is a scan.

**Its figures are a relay, and the card says the arithmetic rather than the provenance.** UNdata gives
5,513 thousand and the World Bank 5,513,282 — the same estimate, per C8, so the card states that the two
agree to the person and claims no corroboration from it. What the pair does support is growth: 4,629,320
in 2015 to 5,513,282 in 2025, up nearly a fifth. The areas agree within 4 km² and the term needed no
figure changed.

**The term's fault this batch is a SUPERLATIVE and an atrocity claim, and both were replaced by a
figure.** `Central_African_Republic` said concession companies "imposed forced labour on a brutal scale"
and that conflict had left the country "among the poorest in the world despite deposits of diamonds, gold
and uranium" — none of it in either work it cited. The concession clause becomes what the review actually
records, the conflict clause becomes the stabilisation mission the Security Council established in 2014,
and the poverty superlative becomes **UNdata's own income per head of 366 US dollars**, which is on the
profile the term already cited. **A figure a source prints beats a superlative no source states**, and it
is usually shorter.

**Batch 44 (Ireland) is the deck's clearest case of a recognition passing THROUGH the former
sovereign, and the guide preserves both halves of the exchange.** Independence dates from the
Anglo-Irish Treaty of **6 December 1921**, which gave 26 counties the Irish Free State while six
counties of northeast Ulster remained in the United Kingdom — and American recognition waited until
**28 June 1924**, when Secretary of State Charles E. Hughes replied to a letter the BRITISH ambassador
had sent four days earlier asking American approval of his own government's plan to let an Irish
minister handle matters relating exclusively to the Free State. **Where a state leaves an empire by
agreement rather than by war, the recognition correspondence may be addressed to the empire**, and the
guide files it under the new state all the same.

**Its UN admission is the second card in three batches to land on the 555th plenary meeting.** Finland
(`gw-117`) and Ireland were both admitted on 14 December 1955, and the meeting record's own subject list
names them among the sixteen — so the record cited by batch 37 has now carried three cards, and
**checking the register for the sitting before searching for a resolution** has paid a third time. The
card cites `A/PV.555` rather than `A/RES/995(X)`, which is the re-pointing this plan has had standing
since batch 37; the eight older cards still on the resolution are unaffected and stay correct.

**Three sources give this country three different populations to one decimal place, and the reason is
growth rather than error.** UNdata projects 5,308 thousand, Eurostat counts 5,439,898 and the World Bank
gives 5,484,367 — 5.3, 5.4 and 5.5 million — and the World Bank series explains it: 4,701,957 in 2015 to
5,484,367 in 2025, up **16.6%** in ten years, the fastest of any European country carded. **On a
fast-growing population the vintage of a figure matters more than its source**, which is C8's stale-figure
finding read forwards rather than backwards.

**Its areas are C9's rule left alone.** They spread 455 km² — 69,825 at the United Nations, 69,947 at
Eurostat, 70,280 at the World Bank — and the glossary term's 70,273 falls INSIDE that spread, so it is
untouched; the facts box takes Source A and the card's last sentence prints all three, which is the deck's
practice whenever a spread is too wide to hide.

**The term's fifth-batch-running fault is a near-match rather than an absence, and it is C6's Cameroon
rule.** `Ireland` said independence came "in 1922" and the only work that could carry the claim, the
guide, says 6 December **1921** — the treaty against the state it created a year later, both defensible
and only one of them citable here. The clause is now "won independence for 26 of its counties in 1921",
which is what the marked source says. **Where a term and its new citation differ by a year, change the
term to the source or leave the clause unmarked; never mark the source and keep the other year.**

**Batch 43 (Slovakia) is the deck's first card whose history is mostly in ANOTHER COUNTRY'S guide
entry.** Its own page runs to three events, all in 1993, because the guide is organised by the state that
exists rather than by the ground it stands on — so the card is carried by the **Czechoslovakia** entry,
which is where the Dual Monarchy, the 1918 recognition and the consulate at Bratislava are. **When a
guide entry is a page long, look for the predecessor state**: the index keeps former states, and a
successor's first fifty years are filed under the name that has gone.

**The predecessor's entry also carries the one recognition fact that is Slovakia's alone.** When German
forces occupied Prague in March 1939 the United States refused to recognise **either** the protectorate
over Bohemia and Moravia **or** the establishment of a Slovak state — a refusal recorded on the page for
the country that was being dismembered rather than on the page for either thing it refused. And the
consulate general opened at Bratislava in 1947 was shut in 1950 after the communist government alleged
that American diplomatic personnel were engaged in espionage.

**It is also the fastest recognition in the collection, and it lands one batch after the slowest.**
Liberia waited fifteen years from its own declaration to American recognition; Slovakia was recognised
on **1 January 1993**, the day it came into being, with the guide's summary and its recognition section
both giving that date. The pair is worth keeping in mind when a card has to say whether a recognition
date is remarkable: this deck now holds both ends of the range.

**Its figures are the batch-42 case in reverse: the two European sources agree on the AREA exactly and
differ on the POPULATION.** The United Nations and Eurostat both give **49,035 km²** to the square
kilometre, where the previous batch's Nordic pair could not be made to agree at all; but UNdata's
population of 5,475 thousand is a **projection, footnoted as such**, against Eurostat's 5,419,451 and the
World Bank's 5,413,813, which agree within 0.1%. D1's rule decides the facts box — where a country runs
its own statistical service and the EU republishes it, UNdata is the outlier — so the card and the term
both say 5.4 million. **A footnote that says "projected est." is a reason to prefer the other two, not a
reason to average.**

**And the glossary fault of the last two batches appears again, in the same place.** `Slovakia`'s third
sentence asserted a thousand years of Hungarian rule, the 1918 union and the 1993 division while citing
only UNdata and the EU country page, neither of which says any of it. The thousand years is dropped —
the guide dates the Hungarian half of the Dual Monarchy and no reachable source here measures the whole
span — and the two guide entries are added and marked. **Four batches running, the fault has been a
first or third sentence carrying history that no work in the term's own list states.**

**Batch 42 (Finland, Liberia, Norway) is batch 14's read-the-footnotes rule paying twice on one page,
in both Nordic profiles.** UNdata footnotes Finland's population as **including the Åland Islands** and
its surface area as **excluding** them, so the two headline figures printed six rows apart are for
different territories; Norway's footnotes its population as **including Svalbard and Jan Mayen** against
a surface area that matches nothing counting them. Finland's case is corroborated arithmetically: the
World Bank gives 338,480 km² and Eurostat 338,363 against UNdata's 336,884, and the ~1,550 km² between
them is about the area of Åland. **Read the letters beside a figure before comparing it with anything** —
a profile that looks like one country's numbers can be two territories' numbers.

**Norway is the widest area disagreement of the whole pass: 323,772 km² against the World Bank's
624,500, nearly a factor of two.** It is recorded here as a probable **fourth outright World Bank area
error**, after C11's Canada and Dominican Republic and D1's Monaco — no standard published figure for
Norway is near 624,500, and mainland plus Svalbard and Jan Mayen comes to about 385,000 — but that is a
HYPOTHESIS and **is not cited**: the card states both figures and the population footnote and lets the
reader see the gap, which is C12's Ecuador practice. **And `world.js` shades Svalbard**, so the map's
shape is larger than the territory the facts box measures — batch 39's Serbia case with the sign
reversed, and likewise recorded rather than corrected.

**A third footnote reading, and it is the one a reader is most likely to trip over: UNdata's population
DENSITY is computed on land area, not on the surface area printed two rows above it.** Finland's
5,623 thousand over 336,884 km² is 16.7 against the 18.6 printed; Norway's is 17.4 against 18.5. Dividing
one published figure by the other gives a third number that is on the page nowhere.

**The two countries are also given the same population to the thousand — 5,623 — where the World Bank
separates them by 35,566** (5,646,436 against 5,610,870). A coincidence rather than a fault, and a
standing reason not to read a UN estimate as a measurement.

**Liberia is the deck's longest wait between a state's founding and American recognition, and the reason
for the date is in a president's annual message rather than in the guide.** The American Colonization
Society founded the settlement in 1822, it constituted itself a republic in 1847 and was recognised by
several European states, and the United States recognised it only on 23 September 1862 — with Lincoln
telling Congress in December 1861 that "if any good reason exists why we should persevere longer in
withholding our recognition of the independence and sovereignty of Hayti and Liberia, I am unable to
discern it", and asking it to fund a chargé d'affaires near each. **The guide gives a date and rarely a
reason; the American Presidency Project carries every annual message and is where the reason is.**

**A country's own statute is a source, and Liberia's is the model.** `trcofliberia.org` serves the Act of
12 May 2005 establishing the Truth and Reconciliation Commission, which dates the Comprehensive Peace
Agreement to Accra on **18 August 2003**, calls it the formal end of "the civil strife and wars which
have bedeviled the nation", and gives the commission **January 1979 to 14 October 2003** to investigate —
the war period the glossary term had been asserting out of nothing. It is cited for what the statute
says rather than as a settled account, per the plans' rule about a state's account of its own actions.
`peacekeeping.un.org` is **403** here, and the UN Digital Library's RECORD page carries enough of a
resolution to cite without opening the PDF at all.

**The NATO member-countries page has MOVED**: `nato.int/cps/en/natohq/topics_52044.htm`, cited on the
glossary since C1, now 301s to `nato.int/en/about-us/organization/nato-member-countries`. Old citations
still resolve through the redirect and new ones take the new address. That one page carries both of this
batch's European cards, and the pairing is exact: Finland deposited its instrument of accession on **4
April 2023**, the anniversary of the treaty **Norway** signed as a founding member on 4 April 1949.

**Three glossary faults, all the same shape — a figure or a clause that none of the term's own citations
states.** Finland's 338,455 km² is in none of its three works and becomes Eurostat's **338,363**;
Norway's "oil and gas were found offshore in 1969" rests on NBIM, which says only that the fund was
established "after Norway discovered oil in the North Sea", so `norskpetroleum.no` is added, dating the
Ekofisk discovery to just before Christmas **1969**; and Liberia's "is the oldest in Africa" is
**dropped** as an unsourced superlative, the class this pass keeps finding wrong. Norway's population
goes 5.5 → **5.6 million**, its own UNdata citation giving 5,623 thousand.

**Batch 41 (Singapore, Denmark, Lebanon) opens with a TOOLING finding that no check in the pipeline can
see.** `gw-115` was refused by `add-card.js` at 261 words, `gw-116` was written while it was being fixed,
and the repaired card was then added AFTER its successor — so `data.js` carried `gw-116` before `gw-115`
in `CARD_DATA` **and** in the leaf's `cardIds`. **`add-card.js` appends; it does not insert.** Nothing
reports this: the file parses, both cards render, every suite passes, and the deck's own study order is
chronological rather than by id, so the only surface it shows on is the id column of the card browser.
**When a card is refused, add it before its successor or repair the order in the same pass** — the fix
is a splice of two lines and it gets harder the longer it waits.

**Lebanon OVERTURNS D2's withholding, and what settles it is the term's own citation.** D2 declined to
correct "5.5 million" because the World Bank series never passes through that figure — 6.47 million in
2015 down to 5.70 in 2020 and rising every year since — so by C8's test the number looked contested
rather than stale. But the term already cited UNdata, which gives **5,849 thousand**, and the World Bank
now agrees with it to within five hundred people: the sentence was refuted by a work in its own source
list. **Batch 29's rule decides this outright** — a citation that contradicts the sentence it marks ends
the argument — and it is worth carrying that **C8's stale-or-contested test is about the SERIES and says
nothing about whether the present figure is right.** A number that was never true at any point in the
series is not thereby a defensible number. `cas.gov.lb` is a JavaScript shell here, as the national
statistical offices of Taiwan and Mexico were, so the two international sources are what there is.

**Denmark is the Greece shape, three batches after D1 retired it.** Its term stated no area and no
population at all — the same fault D1 fixed on `Greece` and `Georgia` by rewriting their opening
sentences — so the shape is not extinct and **is worth grepping for rather than assuming closed**: a
country term with no figures is invisible to every recipe in this pass, because there is nothing for two
sources to disagree about. It gains 42,938 km² and 6 million here. Its figures also **expressly exclude
the Faroe Islands and Greenland**, which UNdata profiles separately, which is C1's Cyprus case and C8's
Comoros case a third time: **read what a profile counts before reading what it says.**

**Singapore's consulate predates the state it stands in by 129 years, the widest such gap in the deck.**
Joseph Balestier was appointed consul on 4 July 1836 to a British port on the China trade route;
recognition of the state came on 11 August 1965, a fortnight after it left the Federation of Malaysia.
**A consular post is a fact about a PLACE and recognition a fact about a STATE**, and the guide's own
entry keeps them in one list, which is how a card can state both without implying either.

**It is also the first card whose AREA IS GROWING, and that qualifies C9's rule.** The World Bank's
`AG.SRF.TOTL.K2` gives 719 km² for 2015 and **728 for 2023** — land reclaimed from the sea, showing up as
arithmetic — with UNdata agreeing at 728 and the Commonwealth still on 720. The term's 735 falls outside
the two that agree and was corrected to 728. **On a reclaiming country an area needs a DATE as well as a
spread**: two sources differing by nine square kilometres may be measuring the same coast eight years
apart rather than disagreeing about it.

**Batch 40 (Bulgaria, El Salvador, Republic of the Congo) begins with a correction to batch 39's own
verification, which is the entry to read.** Two `check-style` findings on `gw-108` shipped in that batch
— *forty-one years* and *forty-seven in every hundred*, both breaking rule 1, non-round numbers above 20
are numerals — because the check was run and only its `title-AMBIGUOUS` count and its last line were
looked at. **`check-style.js` reports a TOTAL and then the findings; reading the tail tells you about
`changelog.js` and nothing about `data.js`.** Both are fixed here. **Read the `=== data.js` block, not the
count and not the tail** — the two long-standing `Mencius` findings make a bare count useless as a signal,
which is exactly how these hid.

**Bulgaria is the collection's clearest case of relations PRECEDING recognition, and the guide states
both dates.** John B. Jackson, minister to Greece, Romania and Serbia, presented credentials at Sofia on
**19 September 1903** and that date establishes relations; recognition waited on independence, declared
**5 October 1908**, and came on **3 May 1909** with Knox instructing a chargé to convey Taft's
congratulations on the country's "admission to the community of sovereign and independent States". Six
years of relations with a state not yet recognised. **When a guide entry's Diplomatic Relations date
precedes its Recognition date, that inversion is the card.**

**It is also the pass's widest POPULATION disagreement so far, and the outlier is Source A.** UNdata
gives 6,715 thousand where **Eurostat gives 6,437,360 and the World Bank 6,433,302** — those two agree to
within 4,000 and UNdata sits about 280,000 above both, a 4.4% gap. D1's finding (`Albania`, `Moldova`)
and C2's (`Czechia`) again: where a country runs its own statistical service and the EU republishes it,
UNdata is the one to drop. The term's "roughly 6.4 million" already followed the two that agree and was
left. Its **area** went the other way and was corrected: the EU page gives 110,996 km² and the World Bank
110,996.758, so the term's 110,994 is two below a figure two sources publish — a rounding width, so by
batch 39's rule both surfaces take the agreed figure.

**Bulgaria's population is also the steepest fall in the collection**: the World Bank's series is down
about 550,000 in ten years, close to 8%. Serbia's decline in batch 39 was 7.7% over the same period, so
two consecutive batches have produced the two fastest-shrinking countries carded, and both are in the
same corner of Europe.

**Two more admissions land on sittings this pass has already sourced, which is now worth planning for.**
Bulgaria is one of the sixteen named in **`A/PV.555`**, so batch 37's meeting record carries a third card
and can name this one in its own list; the Republic of the Congo was admitted at the **864th plenary
meeting** on 20 September 1960, the sitting that already carries Togo, Madagascar and Côte d'Ivoire.
**Check the register for the sitting before searching for a resolution** — an admission date shared with
a card already written means the record is already fetched and read.

**And the UN's own resolution title solves the two-Congos problem for free.** `A/RES/1486(XV)` is headed
*Admission of the **Republic of the Congo (Brazzaville)** to membership in the United Nations* — the
Organization distinguishing the two states by their capitals, exactly as batch 22 found `S/RES/143(1960)`
filed as "the Congo (capital Leopoldville)". A card that has to tell a reader which Congo it is should
reach for the resolution heading rather than explaining.

**El Salvador's recognition passes through TWO federations, which no other card has.** The United States
recognised the Federation of Central American States in 1824 rather than its members, recognised Salvador
separately on 1 May 1849 after the union broke up, and then in 1896 adjusted its relations again when
Honduras, Nicaragua and Salvador formed the **Greater Republic of Central America** to exercise their
external sovereignty — receiving its minister on 24 December 1896 while Cleveland noted the individual
republics' responsibilities remained "wholly unaffected", and reverting when the union dissolved on 29
November 1898. Its population moves "about 6 million" → **6.4 million**: not a C8 stale figure but a
rounding to one significant figure that had drifted 5.7% low, which is the other way a term's number goes
wrong.

**Batch 39 (Paraguay, Nicaragua, Serbia) met the deck's first case where the MAP and the FACTS BOX are
not describing the same territory, and the card says so rather than choosing.** `world.js` draws Serbia
**without** Kosovo, because Kosovo has an entry of its own in this deck under rule 1, so the shaded
shape is Serbia proper. UNdata's profile footnotes its POPULATION "Excluding Kosovo" and attaches no
such note to its **surface area of 88,444 km²**, which is close to the total that includes it; the World
Bank's area series drops from 88,360 to 84,990 between 2019 and 2020, a third answer again. There is no
figure that is both cited and unambiguous, so the facts box takes Source A's and the card's last
sentence states the asymmetry outright — *the United Nations counts its people expressly without Kosovo
but marks its area with no such note*. **Batch 32's Israel rule is the precedent and it generalises: when
a statistical profile footnotes a designation, the footnote is the citation, and where it footnotes one
field and not its neighbour, saying so is the honest card.**

**The ICJ's Kosovo case page is the neutral source this subject needs, and it is the best one found for
any disputed status so far.** `icj-cij.org/case/141` gives, in prose, the General Assembly's question of
8 October 2008, the Court's Advisory Opinion of 22 July 2010 that "the declaration of independence of
Kosovo adopted on 17 February 2008 did not violate international law", and the Court's own
characterisation of **Security Council resolution 1244 of 10 June 1999** as "a temporary, exceptional
legal régime which . . . superseded the Serbian legal order . . . on an interim basis". It also lists
every filing, so **Serbia's own participation is checkable without any state's account of itself being
repeated** — a written statement, written comments and replies to the judges' questions. C7 recorded
`icj-cij.org/case/<n>` as merely reachable; this is the second card to use one and the first to build a
paragraph on it.

**The `Serbia` term carried two area figures that neither of its citations states.** It gave 77,589 km²
and 88,499 km² "counting Kosovo", both marked to UNdata, which publishes 88,444 and neither of those —
the `Togo` fault for the third time in five batches, and the reason the first sentence of a country term
is now the first thing read. It is rewritten to the cited figure with the footnote's own qualification,
and the ICJ page is added as a third source so the Kosovo clause is carried by something; the term goes
109 → 108 words and keeps its three sentences.

**A rule the last three batches have been deciding case by case is now settled: how wide a spread has to
be before a figure BETWEEN two sources is honest.** Where two published figures differ by a rounding
width — `Kyrgyzstan` at 199,949 and 199,950, `Nicaragua` at 130,370 and 130,374 — a term sitting one or
two units outside them is stating a number nobody publishes, and both card and term take Source A's.
Where the spread is material — Serbia's population at 6.549 and 6.689 million, 2.1% apart, or Australia's
and Saudi Arabia's before it — a figure between them is the honest answer and the prose states the
spread. **The test is whether any single source could be called the answer**; under a rounding width one
can, and above it none can.

**Two guide findings, and the second is now a pattern.** Paraguay's page is C12's South American shape
exactly — the summary paragraph carries the independence date, 15 May 1811, where the recognition entry
gives 1852, forty-one years later — and the gap between the two is the card. And the guide's **section
HEADINGS carry years that disagree with their own text**, for the second batch running: Nicaragua's
*Legation Raised to Embassy, **1942*** describes a promotion on 27 March **1943**, as Kyrgyzstan's
*Establishment of the American Embassy in Bishkek, **2004*** described one of 1 February 1992. **Read
the text and treat the heading as a label, not a date.**

**Nicaragua's guide is the richest recognition sequence in the collection so far** — the Federation of
Central American States recognised in 1824 rather than its members, withdrawal from it on 5 November
1838, recognition of Nicaragua itself in 1849, relations severed in 1909 over the execution of two
American citizens, Marines at Bluefields and then in the country until 1932, recognition withheld from
Chamorro in 1926 and from Somoza García in 1947. **A country whose recognition was granted, severed and
withheld repeatedly needs no other source**: the entry alone carries eight of the card's ten sentences.
And Paraguay is the collection's most concentrated population, the United Nations putting 3.28 million
of just over seven million in Greater Asunción — which its own footnote defines as the capital's
district plus nineteen districts of Central Department, batch 14's read-the-footnotes rule paying again.

**Batch 38 (Kyrgyzstan) swept every metric-to-imperial conversion in the corpus and found NOTHING
wrong, which is worth recording because the sweep nearly reported nineteen faults that are not faults.**
A term's area was suspected of a transposed conversion, so all 1,569 glossary descriptions and all 1,093
cards' abstracts, date lines and facts boxes were scanned for the `N km² (M sq mi)` form and each pair
recomputed. **A naive tolerance — a fixed percentage — reports 19 findings and every one is correct**,
because the house rule rounds a conversion to the SOURCE figure's own precision: "86,600 km² (33,400 sq
mi)" is 33,436 rounded to three significant figures and is exactly right. **The tolerance has to be read
off the WRITTEN imperial figure's own trailing zeros** — a value written to the hundred may be 50 out, a
value written to the unit may not be one out. On that test the whole corpus produces a single flag,
`gw-009`'s Russia at 1.7 sq mi, which is the conversion factor's own precision on an eight-digit figure
and the standard published number. **The suspicion was arithmetic done in the head and it was wrong**;
199,951 km² really is 77,201 sq mi. The check is not committed as a tool — it found nothing — but the
precision rule is what makes it worth re-running after a units batch, and it is recorded here so nobody
re-derives it.

**Its area is harmonised rather than corrected, and this settles the rule for the rest of the deck.**
UNdata gives 199,949 km², the World Bank 199,950 and the term 199,951 — one above the top of the spread,
which is C9's `Ivory_Coast` case and therefore not a correction. But **no source publishes 199,951**, and
a facts box sourced by [1] may not print a figure [1] does not carry, so both surfaces take UNdata's
199,949; the imperial conversion is unchanged at 77,201 sq mi either way. That is Spain's rule stated the
other way round: **inside the spread is a reason not to correct a term, and a figure no cited source
states is a reason to move it anyway.** Its population is an ordinary C8 correction, "roughly 7 million"
being the 2023 value on a series rising by more than 120,000 a year, so it moves to 7.3 million, which
both sources give.

**The recognition guide contradicts itself on this page, and a second page on the same site settles
it.** The section is headed *Establishment of the American Embassy in Bishkek, **2004*** and its text
says the embassy "was established on February 1, 1992, with Edmund McWilliams as Chargé d'Affaires ad
interim". The **Chiefs of Mission database** lists McWilliams from 1 February 1992, so the text is right
and the heading is a slip. P2's rule — a spine source is not infallible, read the whole page — with the
useful addition that **the chiefs-of-mission list is the cheapest way to check a date the guide gives**,
since the two are maintained separately and agree or do not.

**Two smaller things.** The country **took its United Nations seat under a different name from the one it
trades under**: resolution 46/225 is headed *Admission of the **Republic of Kyrgyzstan***, and the WTO
lists the member as the **Kyrgyz Republic** — the Türkiye and Naypyidaw device, but here the two names
belong to two institutions rather than to a source and a deck, which is a fact about the state rather
than about the sources. And its founding has **no ceremony at all to cite**: recognition and diplomatic
relations were both announced in Bush's broadcast of 25 December 1991, so there are no credentials, no
exchange of notes and no letter — batch 30 recorded the same of Tajikistan, and it is what the whole
post-Soviet run looks like.

**Batch 37 (Libya) CLOSES batch 36's owed top-up, and the answer is that the claim was right and the
citation was the wrong document.** Batch 36 recorded that `A/RES/995(X)` is an image scan, so the
"sixteen states" two cards already assert could not be checked from here. The **VERBATIM MEETING RECORD
of the same day extracts cleanly** — `A/PV.555`, record 646501, 58 KB of text — and it settles the
question outright: the President opens by naming the draft resolution of forty-one countries providing
for the admission of "Albania, Jordan, Ireland, Portugal, Hungary, Italy, Austria, Romania, Bulgaria,
Finland, Ceylon, Nepal, Libya, Cambodia, Laos and Spain", and closes by recording that "the General
Assembly has accepted each of the sixteen countries recommended by the Security Council". So the count
is verified and no card is wrong; what is owed is a better POINTER, since the resolution record carries
only the title and the vote. **Where a resolution's own PDF is a scan, fetch the plenary meeting record
instead** — `A/PV.<n>` is a different digitisation, and it carries the debate, the separate votes and
the president's rulings as well as the text. The eight earlier cards resolution 995 (X) carries may be
re-pointed at leisure; nothing about them is false.

The record repays reading beyond the count. Cuba asked, on a point of order, that each country be voted
on separately in accordance with an advisory opinion of the International Court of Justice, and had its
own abstention on the resolution as a whole entered in the record; Australia's representative says the
Assembly had "voted for the group of eighteen States which was previously before the Council", which is
the Cold War deadlock C9 named — **eighteen proposed, sixteen admitted** — visible in one sentence of
debate. `gw-103` and `gw-106` both sit on that sitting.

**Libya is also where the recognition guide reaches furthest back of any page used in this pass.** It
carries the Ottoman semi-independent province of 1711–1835, the 1796 peace treaty by which Tripoli
recognised the United States — signed also by the Dey of Algiers on a claim to authority the pasha
denied — the Treaty of Ouchy of 18 October 1912, the joint British and French occupation from 1943, and
Truman's message to King Idris I on 24 December 1951. **A guide page's length is a fact about the
relationship's age as well as its complication**: Israel's runs to two sentences and Libya's to a
consular chronology beginning in 1799.

**Two corrections to the `Libya` term, one of each kind this pass now expects.** Its "an Italian colony
from **1911**" is contradicted by the very source it marks, which gives 1912 for the cession and
1912–1947 for the colony — batch 29's Cuba rule, and 1911 is the invasion rather than the transfer, so
the citation decides. And it carried "a Mediterranean coast of more than 1,700 km (1,100 miles)", which
**no source in its list publishes**: the same L3-class distance locator dropped from `Togo` in batch 35,
and the second time in three batches that a country term's first sentence has been found carrying a
figure nothing behind it states. **Grep a country term's first sentence for a length or a distance
before writing its card** — neither UNdata, the World Bank nor the recognition guide measures coastline,
so any such clause is unsupported by construction. The term goes 110 → 101 words.

**Its area is C9's Libya finding still standing, and the card states it rather than hiding it**: UNdata
gives 1,676,198 km² where `AG.SRF.TOTL.K2` gives 1,759,540 for every year on record, a gap of 83,342 km²
or about five per cent — the widest area disagreement in the collection. The term takes the World Bank's
and so does the card, with a sentence saying which is the larger. Its population needed nothing: UNdata's
7,459 thousand and the World Bank's 7,458,555 are the same number.

**Two small access notes.** `wto.org/.../libya_e.htm` returns the 9,709-byte error page batch 36
measured, Libya being an observer rather than a member — **the size check now identifies that page
without reading it**. And the World Bank API returned **400 Request Error to `per_page=100`** on a
single-country call that worked at `per_page=50` and with the parameter omitted; C8's "empty body under
rapid repeats" is not the only way that API declines, so **read the body before assuming a retry is
what is needed**.

**Batch 36 (Laos, Hong Kong, Turkmenistan) is the first to write a TERRITORY, and a territory needs a
different fourth facts row.** UNdata's `Capital city` for Hong Kong is Hong Kong, so the row the whole
deck is built on has no content there — the District of Columbia's position in the United States plan,
met for the first time here. The row is **`Status · Special Administrative Region of China`**, cited to
the Basic Law, which is `gw-060`'s `Seat of government` move taken one step further: **where the capital
row would say nothing, say what the place IS, and cite the instrument that says so.**

**And a territory has no recognition-guide page, but its SOVEREIGN's page names it.** `/countries/hong-kong`
is a 404, as North Korea's is and for a related reason; the guide's **China** page carries "The United
States established a consular post in the British colony of Hong Kong in 1843", which is the card's whole
first sentence. Batch 20 found Taiwan's diplomatic history inside the same China entry. **Read the
sovereign's page before concluding a territory is unsourced.**

**What actually carries Hong Kong is two statutes, one British and one Chinese, and both are open.**
`legislation.gov.uk` serves the **Hong Kong Act 1985, section 1 as enacted**, which provides that from
1 July 1997 the Crown should no longer have sovereignty or jurisdiction over any part of Hong Kong, and
which dates the Joint Declaration precisely — "signed in Peking on 19th December 1984" — and makes the
section's commencement wait on the exchange of instruments of ratification. `basiclaw.gov.hk` serves
**chapter I of the Basic Law**, whose articles 1, 2 and 5 give the inalienable-part declaration, the high
degree of autonomy including final adjudication, and the fifty years unchanged. Both hosts are new to
this pass's spine. **When a place's status was settled by law rather than by recognition, cite the law**
— and attribute what a legal instrument DECLARES rather than asserting it, which is what keeps a card out
of the sovereignty argument its own question already avoids.

**Its WTO slug is `hong_kong_china_e.htm`**, and `hongkong`, `hong_kong`, `hongkongchina` and `macao` all
return batch 14's 200-status error page at a constant 9,709 bytes — **a size check tells them apart
instantly**, as it does for `senate.gov`. The member is "Hong Kong, China", a **GATT member from 23 April
1986**, eleven years before the transfer and while still a British dependency, which is the fact the card
turns on. Add the slug beside D2's `burma`, C9's `cote-divoire` and C8's two Congos.

**THE POLYGON CEILING BITES AT `gw-104`, NOT IN THE LAST THIRTY, AND THAT PREDICTION IN THIS FILE IS
WRONG.** It says a micro-territory reading as a speck is bearable because the population order puts every
card it affects in the last thirty of 233. Hong Kong is **104th by population and 1,107 km²**: `world.js`
is stored at 2dp, about 1.1 km, so at this card's zoom its coastline is a visible stair-step. The card is
still answerable — Kowloon, the island and Lantau are distinguishable and the Guangdong coast is drawn
round them — and it was looked at rather than assumed. But **the population order does not protect a
dense city-territory**, and Singapore, Macau, Gibraltar and Bahrain are all the same shape and all far
above the bottom of the list. Recorded rather than fixed: the fix is a higher-resolution `world.js`, which
every visitor pays for on the eager path.

**Hong Kong's own census beats both international counts, by the Berlin rule.** The Census and Statistics
Department gives **7,413,070 for 2021** against 7,336,585 five years earlier; UNdata gives 7,396 thousand
for 2025 and the World Bank 7,498,900, about 103,000 apart. The World Bank's series for it **falls in each
of the last two years**, which no other card in this collection has shown, so the usual C8 stale test —
which assumes a rising curve — says nothing here. C10's `Marshall_Islands` warned that "out of date" is
not the same as "too low"; this is the same warning for a place nobody thinks of as shrinking.

**Turkmenistan's area is a STEP in the series and the cause is a hypothesis that is deliberately not
cited.** `AG.SRF.TOTL.K2` gives **488,100 km² for every year to 2018 and 491,209 from 2019 onwards**;
UNdata still carries the earlier figure and the glossary term the later. C9's rule leaves the term alone —
491,210 against 491,209 is the `Ivory_Coast` case, a one-unit gap that counts as inside — so the card
prints the term's figure and its own prose says the two official sources differ and why. The step falls in
the year after the Convention on the Legal Status of the Caspian Sea was signed, which apportioned Caspian
waters among the five littoral states; that is a plausible cause and **nothing openable here states it**,
so it is recorded as a hypothesis exactly as C12 recorded Ecuador's border settlement, and no citation
rests on it. **A series with a step in it dates the step; it does not explain it.**

**And `A/RES/995(X)` is an image scan, so its "sixteen states" cannot be checked from here.** Two cards
already in this collection assert that count and mark it to that resolution; the record's catalogue entry
gives only the title, *Admission of New Members to the United Nations*, and the vote — 56 in favour, one
abstention, of 76 members — so `gw-103` states the vote instead. **A claim inherited from an earlier batch
is not verified by having been used before**, and the eight cards that resolution carries are worth a
top-up pass. One `Laos` correction went with the batch: "roughly 7.7 million" is the 2023–24 value on the
World Bank series, so C8's test makes it stale and it moves to 7.9 million, which both sources give to
within fifty people.

**Batch 35 (Togo) found the spine for a FORMER TRUST TERRITORY, and it is the trusteeship record
itself.** The recognition guide's Togo page is as thin as Sierra Leone's — recognition and an embassy on
one day in 1960 and nothing earlier — and what carried the card instead is the paper trail the United
Nations kept while it supervised the territory. **`T/Agreement/7`, the Trusteeship Agreement for
Togoland under French Administration**, states in its own preamble that the territory lies east of "the
line agreed upon in the Declaration, signed on 10 July 1919" and was administered under the mandate
"defined under the terms of the instrument of 20 July 1922", which let France run it "as an integral
part of its territory" — three dated facts about a partition that no country page anywhere states.
**`A/RES/1044(XI)`** then carries the other half: resolution 944 (X) had ordered a plebiscite under a
United Nations Plebiscite Commissioner to ask whether Togoland under British administration wished to
join an independent Gold Coast, the Assembly notes that a majority voted for union, and it ends the
trusteeship on the day the Gold Coast became independent. And **`A/RES/1416(XIV)`** records that France
and Togoland had agreed on 27 April 1960 and recommends admission to the United Nations upon it.
**Eleven trust territories became states; before writing any of them, search the Digital Library for
"the future of &lt;territory&gt; under &lt;power&gt; administration"** — the `T/Agreement/<n>` and
`T/RES/…` collections had not been used by this pass at all.

**Two things about reading those documents.** A General Assembly resolutions PDF of the 1950s **extracts
cleanly and brings its neighbours with it**, because the scan is of the whole printed page: 1416 (XIV)
arrives with 1415 and 1417 attached, which is where the sentence naming "the Cameroons under French
administration, Togoland under French administration and Somaliland under Italian administration during
1960" came from. A **working document of the same decade does not extract at all** — `T/1269`, the
Plebiscite Administrator's own 24-page report, is an image scan with no text layer — so the resolutions
volumes were typeset and re-digitised where the working papers were photographed. **Cite an image-only
record for what its catalogue entry states** (its title, the administrator's name, the date it was
circulated) and never for a figure inside it.

**The German period needed a source outside the UN and American spines entirely, and a MUSEUM answered.**
Nothing in either reaches behind 1919. The **Deutsches Historisches Museum's LeMO** gives the whole first
phase of German colonial policy in a paragraph and dates Togo and Cameroon to **July 1884**, one month
finer than the glossary term's bare 1884. `bundesarchiv.de`, `deutsche-digitale-bibliothek.de` and
`bpb.de` all answer here too. **When a country's history predates every institution the pass is built on,
ask which national museum published on it.**

**The `Togo` term is batch 29's fault in its commonest and least visible form.** Cuba's citation
*refuted* the sentence it carried; this one was simply silent on it — three claims (the 1884 German
claim, the wartime division, and "one family held the presidency from 1967 into the present century")
were all marked to the recognition guide and UNdata, and neither source mentions any of them. **No audit
can see this**: `gloss-source-audit.js` counts citations, the marker rules check that each points inside
the list, and both pass. It is caught only by reading each marked clause against the work it points at,
which is now this batch's first step on any term whose card is being written. Rewritten to what the
sources bear, with three sources added; the family claim survives as the one thing the record proves —
**`A/59/700` is Faure Gnassingbé's own address to the nation as President, transmitted to the
Secretary-General, on the death of Gnassingbé Eyadéma**. That document also contains the state's account
of itself, a eulogy listing the late president's achievements, and none of it is used. The rewrite also
cost the term its "about 550 km (340 miles) inland" — an L3-class distance locator for which no cited
source gives a figure.

**Its figures needed nothing, and its capital figure is a warning about batch 32's find.** UNdata gives
8,592 thousand people against the World Bank's 8,591,626, and 56,785 km² against 56,790 — agreement to
within a thousandth on both. But UNdata's capital-city row for Togo is **1,785.3 thousand and the World
Bank's `EN.URB.LCTY` is 1,785,310 for 2019**, the same number to the person, so the "second institutional
count of a capital" batch 32 found for Angola is a **relay** here rather than corroboration. **Check the
two against each other before citing both**, exactly as C8 established for `SP.POP.TOTL`.

**Batch 34 (Sierra Leone) found the source that carries a country whose recognition-guide page says
nothing before 1961, and it is a national TRUTH COMMISSION.** The guide's Sierra Leone entry is four
sentences long — recognition on independence, the consulate general at the capital raised to an embassy
the same day — and names no event earlier; the Commonwealth's line gives the joining year and no more.
What carried nine tenths of the card is the **Sierra Leone Truth and Reconciliation Commission's
*Witness to Truth* (2004), volume 3A chapter 1, "Historical Antecedents to the Conflict"**, which runs
from the 1787 purchase of the peninsula from the Temne ruler King Nimbana, through the Sierra Leone
Company and the abolitionists behind it, the Crown Colony of 1808 against the protectorate of 1896, the
Hut Tax War of 1898 and the One Party Act of 1978, to the first shots at Bomaru on 23 March 1991.
**Where a country has had a truth commission, the historical chapter of its report is a statutory body's
own dated narrative of that country's whole past, published in full** — reach for it whenever the
recognition guide is thin, which for a state decolonised in one act it usually is.

Three notes on using it. **The report is not infallible, and P2's rule applies to it as to any spine
source**: it calls the 1947 constitution the "Stevens Constitution" after "its chief drafter Siaka
Stevens", where the document is the Stevenson constitution named for the governor, Sir Hubert Stevenson —
so the card takes the amalgamation the chapter states repeatedly and leaves the attribution alone.
**The download URLs cannot be cited**: the site is a Joomla install whose file links carry `args[0]=`,
and a closing square bracket ends `SRC_URL_RX`, so the citation points at the chapter's **item page**
(`…/item/witness-to-the-truth-volume-three-a-chapter-1?category_id=13`) while the PDF is fetched with the
bracket percent-encoded as `args%5B0%5D=`. And **`www.sierraleonetrc.org` resets the connection about half
the time** — every fetch here needed one to three retries and then answered 200, which is a flaky host
rather than a closed one; the item ids are not in display order, so check a downloaded file's first page
before trusting which chapter it is.

**Its area is the third country with three published figures, and the first where the card follows the
Commonwealth AGAINST Source A.** UNdata gives 72,300 km² and the World Bank's `AG.SRF.TOTL.K2` gives
72,300 for every year on record, while the Commonwealth Secretariat gives 71,740 — which is the figure
the `Sierra_Leone` term already carried and cited. C9's rule leaves a term inside the spread alone, so
nothing was corrected, and `gw-021`'s rule then settles the card: where a card must diverge from Source A
to agree with its own glossary term, cite the source it is agreeing with and give it a real sentence. The
card's last sentence states the 560 km² gap and says which of the two is the larger. Its population is an
ordinary C8 correction — "roughly 8.6 million" is the 2024 value on the World Bank series against 8.82
million at both sources for 2025 — so the term moves to 8.8 million and the card prints the same.

**Batch 33 (Belarus, Switzerland, Kyiv) closes the first hundred countries, and its finding is that the
UN MEMBERSHIP DATE is the single most misread field in the whole recipe.** C3 recorded the first form of
this — the Soviet founding republics show 24 October 1945, so the field dates the USSR's seat rather than
the 1991 independence — and C9 recorded the second, the Cold War admission deadlocks that put Mauritania
at 1961 against independence in 1960 and Libya at 1955 against 1951. **Switzerland is the third and
opposite form: a state that was independent for centuries and simply did not apply until 2002.** Its field
reads 10 September 2002, and the letter of application, from the president and chancellor of the Swiss
Confederation on behalf of the Federal Council, is dated 20 June 2002 (**A/56/1009–S/2002/801**, record
469401, circulated 24 July); the admission is **A/RES/57/1**, record 473420. So the field can sit **either
side** of an independence by half a century, and the rule is simply: **the UN membership date dates a
seat, never a state.** Belarus is the same page read the other way — a member from 24 October 1945 while
its government answered to Moscow, and recognised by the United States only on 25 December 1991, so its
seat precedes its recognition by 46 years.

Two source notes. **The WTO's `countries_e/<slug>_e.htm` page does not exist for a state that is still
acceding**, so Belarus's status is at `acc_e/a1_belarus_e.htm` instead, which gives the date its working
party was established (27 October 1993) and nothing else — a citable fact about a process that has now
been open for more than thirty years. And **`EN.URB.LCTY` earns its second use immediately**: for
Switzerland it gives about 1.46 million against the roughly 426,000 UNdata records for Bern, because the
largest city is not the capital. That is the indicator's real value here — not corroboration but a check
on whether the capital IS the largest city, which the collection has silently assumed everywhere.

One correction: **`Switzerland` 8.9 → 9 million.** UNdata gives 8,967 thousand and the World Bank
9,092,436, so the term sat below both, and the World Bank series shows 8.89 million in 2023 — C8's stale
figure, not a contested one. The term now cites the World Bank alongside UNdata.

And one gap recorded rather than papered over. **The `Kyiv` term ships WITHOUT a picture**, and the reason
is access rather than absence: the right file exists and was identified — *Perchersk Lavra, Kyiv
Panorama.jpg*, an 1889 photograph from the National Gallery of Art library, public domain, 1000×688, well
proportioned for the popup's 150px slot — but `upload.wikimedia.org` returned **429 to every raster
request** throughout the batch, including the Luanda file verified 200 an hour earlier, while both flag
SVGs went through. That is batch 23's finding still holding: **SVG passes and raster does not, whatever
the path.** Nothing is installed that has not been seen to return 200, so the term waits; when the
throttle lifts it is one `add-images.js` batch.

**Batch 32 (Israel, Hungary, Austria, Luanda) corrected NOTHING — all four sets of figures were already
inside the spread of their two sources — and its finding is that the DOCUMENTARY TRAIL of a UN admission
is openable in full, not just its resolution.** Every earlier batch has cited the General Assembly
resolution and stopped there. Angola's admission has four records in the UN Digital Library and each is a
different document: the Secretary-General's note circulating the president's application letter of 22
April 1976 (**A/31/85–S/12064**, record 671486); the Committee on the Admission of New Members' report of
**23 June 1976** (**S/12109**, record 225044); its second report of **22 November** (**S/12234**, record
225171); and the resolution itself (**A/RES/31/44**, record 199650). The two committee reports are the
valuable half, because they carry the ARGUMENT: the June one records that the American representative
urged deferral and that the United Kingdom, France, Italy and Japan supported it while stating they fully
supported the application and that "none of them wished to see the admission of Angola to the United
Nations delayed even by a single day". **Where a country's admission was contested, search the library for
the COMMITTEE reports rather than only the resolution** — `p=<country>+admission+membership` returns them
beside it. Two cautions from reading them. **The OCR of a 1976 mimeograph is not to be quoted**: S/12234's
requesting delegations come out as "Berlin, the Libyan Arab Republic and the United Republic of Tanzania",
where the sponsor list a paragraph later reads cleanly and includes Benin — so the card says "three
members of the Council" and names nothing the scan cannot bear. And **a PDF's text is extractable only in
patches**: the June report's first page comes out clean and its second degenerates into font-subset noise,
so read what extracts and do not infer the rest.

Its other finding is a source for a CAPITAL that the collection has not used before: the World Bank's
**`EN.URB.LCTY`, "Population in largest city"**, which for Angola gives 9,651,032 for 2024 against
UNdata's 8,044.7 thousand for Luanda in 2025. That is not a contradiction and must not be written as one
— the two are drawn on different boundaries, a city proper against a wider agglomeration — but it is a
SECOND institutional count of a capital's population, which the capital cards have otherwise had only
from UNdata. **Reach for it when a capital's figure needs corroborating**, and state the divergence as a
matter of boundary rather than picking a winner.

Israel is the batch's one card where the FACTS BOX had to say something different from its 232 siblings.
The plan defers `gw-596`, the capital card, because its answer is the dispute; the country card is
written normally, and the row reads **"Seat of government | Jerusalem"** rather than "Capital". That is
not an editorial hedge invented here — it is what the cited source says. **UNdata's own footnote c on the
Israel profile reads: "Designation and data provided by Israel. The position of the UN on Jerusalem is
stated in A/RES/181 (II) and subsequent General Assembly and Security Council resolutions."** A second
footnote records that the capital-city population figure includes East Jerusalem. So the dispute is
carried in the tables the whole collection is built on, and the honest card quotes the table rather than
resolving what the table declines to resolve. **When a statistical profile footnotes a designation,
the footnote is the citation** — it says the thing outright and needs no other source.

Two smaller things. Hungary and Austria were admitted in the same resolution as Spain, Cambodia, Jordan
and Portugal — **A/RES/995 (X) of 14 December 1955 now carries eight cards in this collection**, and its
record (209584) is worth keeping to hand. And the American recognition guide's entry for **Israel is two
sentences long** where Hungary's and Austria's run to two thousand words apiece: the guide's length is a
fact about the relationship's complication, not about its importance, and a short entry means the card
must be carried by the UN records instead.

**Batch 31 (Sweden, Greece, Azerbaijan, Rabat) made two corrections and one of them CLOSES THE GREECE
SHAPE, four batches after D1 half-closed it.** D1 rewrote `Greece` to state an area and a capital but
**deliberately left it with no population**, on a 4.8% gap it called arbitrary to resolve: UNdata's 9,939
thousand against the World Bank's 10,413,962. The third source settles it — **Eurostat gives 10,409,547**,
so two independent counts agree at 10.41 million and UNdata is the outlier, which is D1's own finding
about `Albania` and `Moldova` in the other direction. The term now says "roughly 10.4 million". **A
figure deferred for want of a tiebreak is worth re-testing when the batch brings a third source anyway**;
this one cost nothing, because the EU page was already being fetched for the accession date.

**`Sweden` is batch 29's marker test again, and the fourth World Bank area error.** The term said 450,295
km²; its two citations are UNdata (**438,574**) and the EU page (**447,424**), and **neither carries
450,295** — the batch-29 rule, that a citation contradicting the sentence it marks ends the argument.
Corrected to 447,424, which is the figure Eurostat gives *and* the figure the World Bank itself gave
until 2012. That series then **jumps from 447,420 to about 528,500 in 2013 and stays there**, an 18%
step with nothing behind it, joining Canada, the Dominican Republic and Monaco. **Fetch the RANGE**: a
single-year request returns 528,660 and nothing tells you it is wrong.

**Three sittings from earlier batches turn out to be the same sittings.** `Azerbaijan` was admitted by
resolution **46/230** at the **82nd meeting** on 2 March 1992 — the meeting at which batch 30's
`Tajikistan` was admitted by 46/228; `Morocco` by **1111 (XI)** at the **574th plenary meeting** on 12
November 1956, the resolution immediately before batch 26's `Tunisia` at 1112 (XI); and `Sweden` was
admitted on the recommendation of **Security Council resolution 8 (1946)**, already cited on batch 28's
`Kabul` card, which covered Afghanistan, Iceland and Sweden together. **The UN admissions cluster, and a
resolution already fetched for one card will often serve another** — check the register before searching.

**Two source notes.** Azerbaijan's absence from the WTO is a citable fact rather than a gap: the trade
body's own **accession status page** records that its working party was established on **16 July 1997**
and the process is still open, which is a better sentence than "it has no member page". And when the
**Commons API is throttled**, a file's URL can be derived without it — Wikimedia's path is
`/commons/<h[0]>/<h[:2]>/<filename>` where `h` is the **MD5 of the filename** — and the licence read off
the file page on `commons.wikimedia.org`, which is a different host from the API and was answering while
the API returned 429 three times running. All three flags this batch were resolved that way.

**One picture note.** `Rabat`'s best-matching candidate was a 5561×1073 panorama, and the gloss image
slot caps height at 150px with `object-fit: contain`, so a 5:1 image renders as a strip about 30 pixels
tall. **Check the aspect ratio, not just the pixel count**: the slot rewards something near 3:2, which
is why the term carries a 1926 autochrome of the kasbah above the Bou Regreg instead.

**Batch 30 (Portugal, Tajikistan, Papua New Guinea, Sana'a) spent its first work UNDOING a finding of
its own pass, and that is the entry to read.** Batch 24's `?etrans=en` rule is **wrong** and is struck
through above: the plain EU country-page path returns the full 104 KB page with Geographical size and
Population, five fetches in a row, with and without a user agent. The 394-character language picker batch
24 met was intermittent. **A short response is evidence about one moment, not about a host**, and turning
one into a rule takes a re-test on another day — which costs one command and would have prevented a false
rule sitting in this file for six batches, plus a 25-term "fix" that was drafted here before the re-test
showed there was nothing to fix.

**Portugal is the batch's figure decision and the answer was to leave it alone.** Its population is
counted three ways for 2025 — UNdata 10.41 million, Eurostat 10.75, the World Bank 10.80 — and the term's
"roughly 10.5 million" sits inside that spread and between the term's own two citations, neither of which
refutes it. That is the difference from `Cuba` in batch 29, where the cited source contradicted the
sentence outright. **The test is not whether a term follows the majority but whether anything it cites
refutes it**; on that test Portugal stands and Cuba did not.

**Its research finding is a capital that moved and took the embassy with it.** `Sana'a` did not receive
the American mission to North Yemen: that was at **Taiz**, the old capital, from 1959, was raised to
embassy rank there in 1963, and **moved to Sana'a in 1966 when Sana'a became the new capital of the Yemen
Arab Republic**. The guide also carries the whole two-Yemens apparatus — a separate embassy at Aden from
December 1967, severed and closed by the south in October 1969 and **never reopened even after the union
of May 1990** — and Yemen's United Nations seat is **30 September 1947**, the northern state's admission
carried through the merger. **When a country's capital has moved, the guide records the mission's move as
a separate dated act**, which is exactly what a capital card wants and what a country card would bury.

**Two smaller things.** `Tajikistan` joined the United Nations on 2 March 1992 and the World Trade
Organization on **2 March 2013**, 21 years to the day, both dates from their own sources and neither
remarked on by either. And its recognition has no ceremony at all: President Bush recognised it **in an
address to the American nation** on the dissolution of the Soviet Union, and established relations two
months later **by press statement** — so a card here has no credentials, no exequatur and no letter to
hang on, which is what the post-Soviet entries look like throughout.

**And the Commons throttle is now on the API and the file host both, intermittently.** A category listing
returned 429 twice and 200 on the third try; a metadata lookup for two named files 429ed while **the
listing already fetched carried the same metadata**. Batch 29's rule paid immediately: **look a candidate
up once and read the answer out of what you already have** rather than re-querying to confirm.

**Batch 29 (Cuba, Czechia, Honduras, Ottawa) OVERTURNED C11's Cuba withholding, and the thing that
settled it was the term's own marker.** C11 left `Cuba` at "about 9.4 million" against UNdata's 10,937
thousand, reading the gap as contested rather than stale because the World Bank series never passes
through 9.4. That reading assumed the figure came from somewhere — the national count — and this batch
went looking: **`onei.gob.cu` returns 503 over http and refuses the connection over https, CEPALSTAT's
dashboard is a 4.5 KB JavaScript shell and its API 500s**, and no reachable source publishes 9.4 million
for Cuba. What decided it is smaller and harder to argue with: **the term's first sentence was marked to
UNdata, and UNdata says 10,937** — a citation contradicting the sentence it carries, which is the fault
G6 and L7 exist to catch. Corrected to 10.9 million. **When a withheld figure's own citation refutes it,
the withholding is over**; and the searching is recorded here so that a later session with a reachable
ONEI can reverse it again on evidence rather than on instinct.

**`Czechia` is D1's finding at its cleanest, and this time there are three sources.** UNdata gives 10,609
thousand; **Eurostat gives 10,909,500 and the World Bank 10,886,878**, and the term's "roughly 10.9
million" follows the two that agree. This is what D1 meant by *the World Bank's population is not always
the UN's*: where a country runs its own statistical service the bank reports that service, and UNdata is
then the outlier rather than the authority. On area all three give **78,871 km²** exactly, which is the
control that shows the population divergence is real rather than an artefact.

**Ottawa carries C11's Canada area error rather than avoiding it.** `AG.SRF.TOTL.K2` gives Canada
**15,634,410 km²** against the United Nations' 9,984,670 — more than half as much again — so the card
states the country's area from UNdata and **names the series it cannot use**, the same treatment
`gw-085` gives the Dominican Republic. Two cards in two batches now do this, and it is the better form of
C5's single-source position: **a source you have ruled out is worth a sentence, because the next reader
will otherwise go and fetch it themselves.**

**Three smaller notes.** The guide's Czechia page lives at `/countries/czech-republic` but calls the
country **Czechia** throughout, so search the guide by slug and quote it by its own usage. Commons
redirects `Flag_of_Honduras.svg` to **`Flag_of_Honduras_(1949–2022, 2026–present).svg`**, whose own
description reads simply "The flag of Honduras" — a date-range filename recording a design that changed
and changed back, which the batch-19 convention admits because the file is the country's flag and is not
named for a party to anything. And the **Commons API itself began returning 429** part-way through this
batch, where earlier batches only saw it on `upload.wikimedia.org`: the metadata endpoint is rate-limited
too, so **look a candidate up once and keep the result** rather than re-querying to confirm.

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

**~~And the EU country page needs `?etrans=en` now~~ — CORRECTED IN BATCH 30, and the correction is the
more useful finding.** Batch 24 met a **394-character language picker** at the plain
`.../eu-countries/<country>_en` path, several times in a row, and got the Key Facts block by adding
`?etrans=en`; it recorded that as a permanent change and rewrote the `Netherlands` and `Spain` citations.
Batch 30 re-tested: **both forms return the full 104 KB page, five plain fetches in a row, with and
without a user agent**, and the plain path carries Geographical size and Population exactly as C1 and C2
found it. So the interstitial is **intermittent, not permanent**, and the 25 glossary terms citing the
plain form need no sweep. The rewritten citations are left alone because both forms work. **The rule this
leaves is about method rather than about the EU: a short response is evidence of a short response, and
turning one into a permanent rule about a host takes a re-test on another day** — which is cheap, and
which batch 24 did not do.

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
