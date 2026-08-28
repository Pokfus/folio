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

**Shipped so far — countries `gw-001`–`gw-012`** (India, China, United States, Indonesia, Pakistan,
Nigeria, Brazil, Bangladesh, Russia, Ethiopia, Mexico, Japan) **and capitals `gw-503` Washington, D.C.,
`gw-505` Islamabad and `gw-507` Brasília.** The next country is `gw-013` Egypt.

**Five capitals are DEFERRED, and between them they name every way a capital source can fail.**
`gw-501` New Delhi and `gw-502` Beijing are reachable here only through the foreign legations that sat in
them — the recognition guide dates the American mission at New Delhi to 1946 and traces the United States
legation from Beijing to Nanjing to Chongqing to Taipei, which is a history of American diplomacy rather
than of either city. `gw-504` Jakarta: `jakarta.go.id` is 403 and `indonesia.go.id` returns 502.
`gw-506` Abuja: the Federal Capital Territory Administration has a page headed *A Brief History of our
City* whose text is **unreplaced template boilerplate** ("Millions of people around the world use Obira to
connect…"), so a fetch returning 200 and 220 KB carries no history at all — **check that a page says
something before counting it as a source.** `gw-508` Dhaka is the newest kind of failure and the one
worth naming: **every Bangladeshi government domain tried presents an incomplete certificate chain**
(`parliament.gov.bd`, `dncc.gov.bd`, `bbs.gov.bd`, `mofa.gov.bd`, `cabinet.gov.bd`), which is a fault in
the source rather than a policy of this sandbox, and is not to be worked around by disabling
verification. `gw-509` Moscow: `mos.ru`'s own history page renders through JavaScript and hands back
twenty-nine characters of text, and the Kremlin Museums site is a shell.

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
| | `gw-751` Dar es Salaam | the former capital and largest city |
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

**THE TEST HAS NOW DECIDED EIGHT CAPITALS AND HAS NOT BEEN WRONG ONCE.** Washington, Islamabad and
Brasília passed it and are written; New Delhi, Beijing, Jakarta, Abuja, Dhaka and Moscow failed it and are
deferred. **Brasília is the most instructive pass**, because the institution that answered was not the
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
