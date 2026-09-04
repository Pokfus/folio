# World — the card plan

The collection is **World** (`geo-world`, renamed from *The world* in Sep 2026 on request), the second of the Geography SECTION on the Collections
page, beside **United States** (`geo-us`). It is **470 cards in two decks**: **The countries and
territories** (`geo-world-countries`, `gw-001`–`gw-233`) and **The capitals**
(`geo-world-capitals`, `gw-501`–`gw-733` with seven numbers deliberately unused, plus `gw-751`–`gw-762`
for the second and third seats of the ten countries that have more than one). Its cards use the
**map card** format — a shape on a globe, and the question is what it is.

📖 **`docs/geography-card-plan.md` describes the map card itself** — `map`, `facts`, `answerFlag`, the
globe, the fit, the accessibility limitation — and everything it says applies here unchanged. **Read it
before writing a card.** This file is the running order and the decisions that are particular to the
world: which entities are in the list, which seat a capital card asks for, and where the names come from.

The next card to write is the lowest `gw-NNN` not yet in `data.js`:

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='gw-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

**Shipped so far — countries `gw-001`–`gw-233`, the WHOLE running order less the deferred `gw-195`, `gw-201`, `gw-218`, `gw-223`, `gw-224` and `gw-230`** (India, China, United States, Indonesia, Pakistan,
Nigeria, Brazil, Bangladesh, Russia, Ethiopia, Mexico, Japan, Egypt, Philippines, Democratic Republic of
the Congo, Vietnam, Iran, Turkey, Germany, Thailand, United Kingdom, Tanzania, France, South Africa,
Italy, Kenya, Myanmar, Colombia, South Korea, Sudan, Uganda, Spain, Algeria, Iraq, Argentina,
Afghanistan, Canada, Yemen, Morocco, Angola, Ukraine, Poland, Uzbekistan, Malaysia, Saudi Arabia,
Mozambique, Ghana, Peru, Madagascar, Côte d'Ivoire, Nepal, Cameroon, Venezuela, Australia, Niger, North
Korea, Syria, Mali, Burkina Faso, Taiwan, Sri Lanka, Malawi, Zambia, Kazakhstan, Chad, Chile, Romania,
Somalia, Senegal, Guatemala, Ecuador, Netherlands, Cambodia, Zimbabwe, Guinea, Benin, Rwanda, Burundi,
Bolivia, Tunisia, South Sudan, Belgium, Haiti, Jordan, Dominican Republic, United Arab Emirates, Cuba,
Czechia, Honduras, Portugal, Tajikistan, Papua New Guinea, Sweden, Greece, Azerbaijan, Israel, Hungary,
Austria, Belarus, Switzerland, Sierra Leone, Togo, Laos, Hong Kong, Turkmenistan, Libya, Kyrgyzstan, Paraguay, Nicaragua, Serbia, Bulgaria, El Salvador, Republic of the Congo, Singapore, Denmark, Lebanon, Finland, Liberia, Norway, Slovakia, Ireland, Central African Republic, New Zealand, Palestine, Oman, Mauritania, Costa Rica, Kuwait, Panama, Croatia, Georgia, Eritrea, Mongolia, Uruguay, Puerto Rico, Bosnia and Herzegovina, Armenia, Namibia, Lithuania, Qatar, Jamaica, Gambia, Gabon, Botswana, Moldova, Albania, Lesotho, Guinea-Bissau, Slovenia, Equatorial Guinea, Latvia, North Macedonia, Kosovo, Bahrain, Timor-Leste, Estonia, Trinidad and Tobago, Cyprus, Mauritius, Eswatini, Djibouti, Fiji, Comoros, Guyana, Solomon Islands, Bhutan, Macau, Luxembourg, Suriname, Montenegro, Western Sahara, Malta, Maldives, Cabo Verde, Brunei, Belize, Bahamas, Iceland, Vanuatu, New Caledonia, Barbados, French Polynesia, São Tomé and Principe, Samoa, Saint Lucia, Guam, Curaçao, Kiribati, Seychelles, Grenada, Micronesia, Aruba, United States Virgin Islands, Tonga, Saint Vincent and the Grenadines, Antigua and Barbuda, Isle of Man, Andorra, Cayman Islands, Dominica, Bermuda, Greenland, Faroe Islands, Saint Kitts and Nevis, American Samoa, Turks and Caicos Islands, Northern Mariana Islands, Sint Maarten, Liechtenstein, British Virgin Islands, Gibraltar, Monaco, Marshall Islands, San Marino, Åland, Anguilla, Palau, Cook Islands, Nauru, Tuvalu, Saint Pierre and Miquelon, Saint Helena, Montserrat, Falkland Islands, Niue, Vatican City, Pitcairn Islands) **and capitals
`gw-503` Washington, D.C., `gw-505` Islamabad, `gw-507` Brasília, `gw-510` Addis
Ababa, `gw-513` Cairo, `gw-514` Manila, `gw-515` Kinshasa, `gw-516` Hanoi, `gw-517` Tehran, `gw-518`
Ankara, `gw-519` Berlin, `gw-520` Bangkok, `gw-521` London, `gw-522` Dodoma, `gw-523` Paris, `gw-524`
Pretoria, `gw-525` Rome, `gw-526` Nairobi, `gw-527` Naypyidaw, `gw-528` Bogotá, `gw-529` Seoul, `gw-530`
Khartoum, `gw-531` Kampala, `gw-532` Madrid, `gw-533` Algiers, `gw-534` Baghdad, `gw-535` Buenos Aires,
`gw-536` Kabul, `gw-537` Ottawa, `gw-538` Sana'a, `gw-539` Rabat, `gw-540` Luanda, `gw-541` Kyiv, `gw-542` Warsaw, `gw-543` Tashkent, `gw-544` Kuala Lumpur, `gw-545` Riyadh, `gw-546` Maputo, `gw-547` Accra, `gw-548` Lima, `gw-549` Antananarivo, `gw-550` Yamoussoukro, `gw-551` Kathmandu, `gw-552` Yaoundé, `gw-553` Caracas, `gw-554` Canberra, `gw-555` Niamey, `gw-556` Pyongyang, `gw-557` Damascus, `gw-558` Bamako, `gw-559` Ouagadougou, `gw-560` Taipei, `gw-561` Sri Jayawardenepura Kotte, `gw-562` Lilongwe, `gw-563` Lusaka, `gw-564` Astana, `gw-565` N'Djamena, `gw-566` Santiago, `gw-567` Bucharest, `gw-568` Mogadishu, `gw-569` Dakar, `gw-570` Guatemala City, `gw-571` Quito, `gw-572` Amsterdam, `gw-573` Phnom Penh, `gw-574` Harare, `gw-575` Conakry, `gw-576` Porto-Novo, `gw-577` Kigali, `gw-762` Bujumbura, `gw-579` Sucre, `gw-580` Tunis, `gw-581` Juba, `gw-582` Brussels, `gw-583` Port-au-Prince, `gw-584` Amman, `gw-585` Santo Domingo, `gw-586` Abu Dhabi, `gw-587` Havana, `gw-588` Prague, `gw-589` Tegucigalpa, `gw-590` Lisbon, `gw-591` Dushanbe, `gw-592` Port Moresby, `gw-593` Stockholm, `gw-594` Athens, `gw-595` Baku, `gw-597` Budapest, `gw-598` Vienna, `gw-599` Minsk, `gw-600` Bern, `gw-601` Freetown, `gw-602` Lomé, `gw-603` Vientiane, `gw-605` Ashgabat, `gw-606` Tripoli, `gw-607` Bishkek, `gw-608` Asunción, `gw-609` Managua, `gw-610` Belgrade, `gw-611` Sofia, `gw-612` San Salvador, `gw-613` Brazzaville, `gw-615` Copenhagen, `gw-616` Beirut, `gw-617` Helsinki, `gw-618` Monrovia, `gw-619` Oslo, `gw-620` Bratislava, `gw-621` Dublin, `gw-622` Bangui, `gw-623` Wellington, `gw-632` Asmara, `gw-630` Zagreb, `gw-639` Vilnius, `gw-645` Chișinău, `gw-631` Tbilisi, `gw-637` Yerevan, `gw-633` Ulaanbaatar, `gw-640` Doha, `gw-625` Muscat, `gw-626` Nouakchott, `gw-627` San José,
`gw-751` Dar es Salaam, `gw-752` Cape Town and `gw-753` Bloemfontein.** **The countries and territories deck is COMPLETE at 227 of 233**, the six deferred being `gw-195` Jersey, `gw-201` Guernsey, `gw-218` Saint Martin, `gw-223` Wallis and Futuna, `gw-224` Saint Barthélemy and `gw-230` Norfolk Island — each for a facts box no openable source can fill, and each waiting on one field rather than on research. The next card is a CAPITAL: `gw-628` Kuwait City.

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

**Eleven countries have more than one seat, and each seat is its own card** (Aug 2026, on request: "for
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
| Burundi | `gw-578` Gitega | the political capital |
| | `gw-762` Bujumbura | the economic capital and largest city |
| Eswatini | `gw-660` Mbabane | the administrative capital |
| | `gw-761` Lobamba | the legislative and royal capital |

**THE SECOND AND THIRD SEATS ARE NUMBERED IN A BAND OF THEIR OWN, `gw-751`–`gw-762`, and that is not
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
capital* on the twenty-three cards of the eleven countries that have more than one seat: *"…marks ____, the
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

**UNDATA'S CAPITAL-CITY POPULATION IS THE WORLD BANK'S LARGEST-CITY SERIES, SO THE TWO CAN NEVER
CORROBORATE EACH OTHER ON A CAPITAL** (found on `gw-542` Warsaw, confirmed on `gw-543` Tashkent, and it
sent a correction back to `gw-541`). UNdata's *Capital city pop. (000, 2025)* row carries a footnote,
and the footnote dates the figure years earlier — 2019 on all three checked — where the row's own
heading says 2025. Read against `EN.URB.LCTY` the figure is not merely close but **identical**: Warsaw
1,775.9 against 1,775,933, Tashkent 2,490.3 against 2,490,334, Kyiv 2,973.3 against 2,973,335. So a
sentence saying the UN and the World Bank agree on a capital's population is **one source counted
twice**, which is C8's false-corroboration finding one indicator over. `gw-541` Kyiv said exactly that
and has been corrected, on the card and on its glossary term. **Read the footnote before citing the
row**: give the current figure to the World Bank, and where the UN figure is worth stating at all, state
what it is — the same series at the year its footnote names.
**`gw-564` ASTANA IS THE MEASURED EXCEPTION, AND IT SAYS EXACTLY WHAT THE RELAY IS.** Ten capitals in a
row had UNdata's *Capital city pop.* row equal to `EN.URB.LCTY` to the person; Kazakhstan's does not —
UNdata gives **1,117.6 thousand** for 2019 and the World Bank **1,862,809** for the same year. They are two
different cities, and the reason is the only thing that ever made the relay work: **UNdata counts whatever
city its own *Capital city* FIELD names, and `EN.URB.LCTY` counts whichever city is LARGEST, so the two
coincide only where the capital is the largest city.** Where it is not — Yamoussoukro, Canberra, Kotte,
Astana — they part company, and each source is right about a different place. That also resolves the family
cleanly: on such a capital, **cite UNdata for the city and leave the World Bank series out of the figures
altogether**, because it is about somewhere else. (Kotte is the mirror image and worth keeping straight:
there UNdata's Capital city field names COLOMBO, so its capital-city figure is Colombo's and the relay
holds — the field, not the country, decides.)

**`gw-556` Pyongyang is the fifth** — 3,060.9 against 3,060,864 for 2019, the footnote again reading
2019 under a heading saying 2025.
**`gw-544` Kuala Lumpur is the fourth confirmation and it adds the second half of the trap** — 7,780.3
against the World Bank's 7,780,301 for 2019 — because there UNdata footnotes the row TWICE, the second
footnote reading *"Refers to the Greater Kuala Lumpur"*. So the figure is not the city at all but the
agglomeration, and the World Bank's series, being the same series, is the agglomeration too: on that card
both sources are one source measuring something the card is not about. **Neither source has a figure for
a capital's own municipality**, so where the two carry a metropolitan figure the card must say which it is
— `gw-544`'s facts box reads *9.0 million in Greater Kuala Lumpur* rather than a bare population, which is
the Delhi warning at the head of this section arriving as a real card. Its divided seat came out of the
same footnote block exactly as batch 14 predicted: **UNdata's footnote d says "Kuala Lumpur is the capital
and Putrajaya is the administrative capital"**, which is the source both `gw-544` and `gw-754` needed and
which no other reachable work states.
**AND `gw-546` MAPUTO BREAKS THE RELAY, WHICH IS WHY IT MUST BE CHECKED RATHER THAN ASSUMED IN EITHER
DIRECTION.** UNdata gives the capital 1,104.3 thousand under a 2019 footnote and the World Bank's
`EN.URB.LCTY` gives **1,668,740** for that same year — half a million apart, where Warsaw, Tashkent, Kyiv,
Kuala Lumpur and Riyadh matched to the person. So the UNdata row is sometimes its own figure and sometimes
the World Bank's, and the only way to know is to fetch both. **Worse, the World Bank series names no city**:
it is *population in largest city*, and Mozambique's largest city may well be Matola rather than Maputo, so
where the two disagree the divergence cannot be read as a measurement difference — the series may not be
about the capital at all. `gw-546` therefore cites UNdata alone for its population, dated as UNdata dates
it, and the World Bank is off the card. **Where the two disagree by more than a rounding, drop the World
Bank rather than average or choose.**
**`gw-547` ACCRA DIVERGES TOO, WHICH SETTLES THE TALLY AT FOUR MATCHING AND TWO NOT.** UNdata gives
2,475.2 thousand for 2019 against the World Bank's 3,205,586 — so the divergence is not a Mozambican
oddity, and a capital card should FETCH BOTH and expect either answer. On the evidence so far the match
is the commoner case and the mismatch is a real one: both cards that diverge are African, and in both the
UNdata figure is the smaller, which is what a city-proper figure against an agglomeration looks like.
That is a hypothesis and is written here as one; what is settled is the practice, which is to cite UNdata
alone whenever they part.
**AND `gw-548` LIMA SHOWS THE THIRD CASE, WHICH IS THE ONE TO HOPE FOR: THE FOOTNOTE SAYS WHAT IS BEING
COUNTED.** UNdata's capital row there carries two footnotes — 2019, and *"Refers to the Province of Lima
and the Constitutional Province of Callao"* — so the figure is not merely dated but DEFINED, and a card
can state the unit rather than a bare population. The card does, and the glossary term does. **Read both
footnote letters on the capital row of every profile**: between them they have now told us the year on
six capitals, the greater city on Kuala Lumpur and the two provinces on Lima, and that is the difference
between a number and a fact.
**AND A DATE IN THE GUIDE IS SOMETIMES THE LETTER'S DATE RATHER THAN THE EVENT'S** (`gw-549`). The
Madagascar page says the United States recognised the Malagasy Republic *"on June 25, 1960"* and that the
consulate at Tananarive was elevated to embassy status *"on June 25, 1960"*; the FRUS editorial note for
the same events says the republic became independent **on 26 June**, that Eisenhower's message dated the
25th was **delivered on the 26th** as the consul general presented his credentials, and that the
Department announced the elevation on the 25th **as of the 26th**. Neither source is wrong — one is dated
by the paper and the other by the act — but a card that takes the guide's date alone says independence
happened a day before it did. **Where the guide and a FRUS note give neighbouring dates, the note is
describing the event.**
**WHERE THE CAPITAL IS NOT THE LARGEST CITY, `EN.URB.LCTY` IS ABOUT A DIFFERENT CITY AND MUST NOT BE
CITED AT ALL** (`gw-550`). This is the Maputo caution in its provable form: UNdata gives Yamoussoukro
**231.1 thousand** and the World Bank's largest-city series gives **6.06 million**, which is Abidjan. The
two are not a disagreement to weigh — they are two cities, and a card that reached for the series would
have multiplied its capital's population by twenty-six. **Ask whether the capital IS the largest city
before touching that indicator**; the divided-seat countries in the table above are exactly where it
fails, and UNdata's own capital footnote is what tells you (here: *"Yamoussoukro is the capital and
Abidjan is the administrative capital"*, which is also the source `gw-755` will need).
**THE TEST FOR THAT IS THE MATCH ITSELF** (`gw-552`). Where UNdata's capital figure EQUALS the World Bank
series at the year UNdata's footnote names, the series is measuring the capital and can be cited for the
current year: Yaoundé's 3,822.4 thousand is `EN.URB.LCTY`'s 3,822,425 for 2019, which settles that the
series is not following the larger port at Douala. Six capitals match that way and two do not; a mismatch
means either a different definition or a different city, and either way the series comes off the card.
**AND `gw-554` CANBERRA IS THE SECOND CAPITAL THE SERIES IS NOT ABOUT** — 452.5 thousand at UNdata
against 5.4 million in `EN.URB.LCTY` — so the rule now has an instance in a rich, well-documented country
as well as in Côte d'Ivoire. Australia, Côte d'Ivoire, and any other state whose seat of government is
not its biggest city, are cited on UNdata alone.


**`gw-556` PYONGYANG IS THE FIRST CAPITAL WITH NO RECOGNITION-GUIDE PAGE AT ALL, AND THE GUIDE FAILS
TWICE OVER.** `history.state.gov/countries/north-korea` and `/korea-north` are both 404 — the United
States has never recognised the state, so the guide has nothing to record — and `/countries/korea`,
which does exist, is about the **Kingdom of Chosŏn**: it opens on the 1882 treaty of amity and commerce
at Chemulpo and ENDS on 28 November 1905, when Japan took over Korean foreign relations and the legation
at Seoul closed. So half the two-fetch recipe is simply absent on the peninsula, for both Koreas, and it
is absent in a way a slug check cannot see — the page answers 200 and says nothing about the century the
card is written from. What replaced it is **FRUS full-text search plus the UN Digital Library**, which
between them gave the city its whole card. `history.army.mil` is **403** here, root and all, so the
Center of Military History's official Korean War volumes — the obvious source for a city that changed
hands twice — are not available; record that before the Korea collection is written rather than during it.

**AND A UN DIGITAL LIBRARY RECORD SUMMARY DROPS THE PLACE, WHICH IS THE ONE THING A CAPITAL CARD NEEDS.**
The catalogue summary for A/RES/62/5 says the Assembly welcomes "the inter-Korean summit held from 2-4
Oct. 2007" and names no city; the resolution's own text says "the summit meeting **held in Pyongyang**
from 2 to 4 October 2007", and A/RES/55/11 likewise says "the historic summit meeting, **held in
Pyongyang** from 13 to 15 June 2000". Both were readable only by pulling the PDF apart with the `zlib`
recipe above. **Read the document, never the record** — a catalogue is written to be searched by subject,
and the subject of an inter-Korean summit is not where it happened.

**`gw-557` DAMASCUS IS WHERE THE RECOGNITION GUIDE PAYS BEST, BECAUSE THE POST ITSELF IS THE STORY.**
Most country pages give a recognition date and an embassy date and stop; Syria's gives eight events and
six of them happen to the mission in this one city — a legation in November 1944, **reclassified as a
consulate general** on 25 February 1958 when Syria joined Egypt and the capital of the new state became
Cairo, raised back to an embassy on 10 October 1961, closed when Syria severed relations on 6 June 1967,
an **interests section inside the Italian embassy** from 8 February 1974, and the embassy restored on 16
June. **Read the Diplomatic Relations half of a guide page before deciding a capital is thinly sourced**:
a mission that is opened, downgraded, closed and reopened is a card, where a mission that opens once is a
sentence. FRUS then supplied both ends the guide cannot — the French mandate, in two 1925 telegrams from
the consul at Beirut reporting two thirds of the city in the hands of revolutionists and a demand for
100,000 Turkish gold pounds and 3,000 rifles on pain of the bombardment recommencing, and the interests
section itself, in a telegram Kissinger sent **from** it on 21 May 1974.

**AND UNDATA CAN WARN YOU OFF ITS OWN FIGURE, WHICH IS WORTH SAYING IN THE PROSE.** Syria's capital-city
row carries two footnotes rather than one: `d` is the usual 2019, and `c` reads *"Est. should be viewed
with caution as these are derived from scarce data."* That is the first capital in this deck where the
source hedges its own number, and the honest card says so rather than printing the figure flat. The relay
holds regardless — 2,353.6 thousand against `EN.URB.LCTY`'s 2,353,637 for 2019, a sixth confirmation — so
the current figure is still the World Bank's, at 2.8 million for 2025.

**`gw-558` BAMAKO IS THE THIRD CAPITAL IN FOUR WHOSE CARD IS ABOUT A MISSION SOMEWHERE ELSE, AND
THAT IS NOW A SHAPE TO LOOK FOR RATHER THAN A COINCIDENCE.** Niamey's first ambassador lived at
Abidjan, Damascus lost its embassy to Cairo for three years, and Bamako was not the capital of the
state that first became independent at all: the **Federation of Mali** was Senegal and the Soudanese
Republic together, it left French sovereignty on 20 June 1960, and the American embassy to it was the
consulate general at **Dakar**, raised that day. When Senegal withdrew and the Soudanese Republic
renamed itself on 22 September, Washington recognised it on the 24th, raised the consulate general at
Bamako to an embassy, and reaccredited the Dakar embassy to Senegal — **one day on which one city
became a capital in American eyes and another stopped being one**. **On a state that federated,
merged or seceded, read the guide for where the MISSION was**: the interesting sentence is almost
never the recognition date.

**AND FRUS DATES THE DECISION TO THE CITY WHERE IT WAS TAKEN.** Dillon's memorandum to Eisenhower of
23 September 1960 opens "As a result of the party conference held in Bamako yesterday", says that by
tacitly admitting the federation no longer existed the Soudanese had made it easier to recognise the
two countries separately, and adds that Washington was "particularly anxious to avoid a repetition of
the Guinean experience". A recognition guide gives the date Washington acted; the FRUS memorandum
behind it gives the date and place the other government acted, which is what a capital card wants.
Resolution 1491 (XV) then admitted Mali and Senegal at **one sitting**, the 876th plenary meeting of
28 September 1960, on Security Council recommendations of the same day.

**A COMMONS PICTURE CAN BE THE ARTICLE'S AND STILL BE TOO SMALL.** Three of the obvious Bamako
candidates are under the 900px bar — the widely-used `Bamako ACI 2000 view.jpg` is 715px — and the
`Special:FilePath?width=N` route does NOT tell you so: it serves the ORIGINAL when the original is
smaller than the width asked for, so a 715px file comes back looking like a successful 900px fetch.
**Read the size off the returned bytes, not off the request.** With the API rate-limited, the file
DESCRIPTION page carries "Original file (5,172 × 2,906 pixels)" and the licence in plain text, which
is the fallback that got this card its picture.

**THE NEXT-CARD LINE AT THE TOP OF THIS FILE IS A CONVENIENCE AND THE RUNNING ORDER IS THE AUTHORITY —
IT WENT WRONG ONCE AND THE CHECK COSTS TWO SECONDS.** After `gw-558` it was written `gw-559` Harare, from
memory; the table gives `gw-559` **Ouagadougou** and puts Harare at `gw-574`. Nothing catches this — a card
written to the wrong number is a perfectly valid card, it simply occupies a slot the plan promised to
another city, and `test-card-plans.js` checks that every number is covered rather than that a number holds
the topic beside it. **`grep -n "gw-NNN " docs/world-geography-card-plan.md` before writing the line**, and
before writing the card.

**`gw-559` OUAGADOUGOU PAYS FOR THE SECOND GUIDE PAGE, WHICH IS A ROUTE WORTH KEEPING.** Its own page is
four short paragraphs; what makes the card is that the chargé d'affaires who opened relations on 5 August
1960, **Donald R. Norland**, is the same man the NIGER page records presenting his credentials two days
earlier as the consul general at Abidjan and resident there — so one officer opened relations with two new
states in one week, and neither page says so on its own. **When a guide page is thin, read its neighbours'**:
the Sahelian states were decolonised in a fortnight by a handful of officers, and the interesting facts sit
between the pages rather than on them. Ouagadougou then waited until 31 December 1960 for an embassy, five
months, exactly as Niamey waited until 3 February 1961.

**AND THE UN ADMITTED THE COUNTRY UNDER A NAME IT NO LONGER USES.** Resolution 1483 (XV) of 20 September
1960 is headed *Admission of the Republic of the Upper Volta*, the state having renamed itself Burkina Faso
in 1984 — so a card about this capital cites a work whose title names a country that does not exist, which
is correct and looks like an error. **Say in the prose that the seat took its UN seat under the older
name**, or the citation reads as a filing mistake. The same holds for the guide, whose page is titled
*Burkina Faso (Upper Volta)*.

**`gw-560` TAIPEI IS THE FIRST CAPITAL CARD WITH NO POPULATION AT ALL, AND THE ROW IS OMITTED RATHER
THAN FILLED.** Batch 20 solved the COUNTRY card by finding the WTO, and left the figures unmarked with the
facts box stating Folio's own; a CITY figure is a different matter, because there is no widely-agreed round
number to state. Measured again here: `eng.stat.gov.tw`, `www.ris.gov.tw` and `english.gov.taipei` all
answer **200 with real bodies** — so D2's "the reachable Taiwanese statistical sites are JavaScript-driven"
is still true of the FIGURES but no longer of the hosts — and none of the three serves a population in its
HTML; `eng.dbas.gov.taipei`, the city's own budget and statistics bureau, is **refused by the egress policy
outright**. So the facts box carries Territory, Region, Where and **In the WTO as — Chinese Taipei**, and
says nothing it cannot source. **A missing row is honest; an invented figure is not**, and this is the
first card in the deck to take that option.

**ITS QUESTION IS THE ONLY ONE IN THE DECK THAT DOES NOT SAY "THE CAPITAL OF THE COUNTRY".** All 51 other
capital cards ask for "the capital of the country shaded around it"; this one asks for **"the seat of
government of the territory shaded around it"**, which is the countries deck's own "country or territory"
convention carried across, and it matches `gw-060`'s facts label. Folio takes no position by asking; it
would take one by asserting.

**AND THE CHINA GUIDE PAGE IS A CITY SOURCE AS WELL AS A COUNTRY ONE.** Batch 20 read it for the island's
diplomatic history; read for the CITY it also gives the consular post opened at **Taipei in 1914 under the
name Taihoku** while the island was Japanese — which is the earliest date on the card and predates the
government it is a capital for by thirty-five years — and the embassy's arrival on 19 December 1949 and
closure on 28 February 1979, thirty years apart. FRUS then supplies the one thing the guide never does,
an EVENT in the city: the **riot of 24 May 1957**, in which the embassy was wrecked and burned after a
court martial's acquittal, reported by the army attaché the next morning and analysed by Ambassador Rankin
the day after that. **When a capital's country has no guide page, its former sovereign's may carry it.**

**`gw-561` KOTTE: THE SPLIT IS STATED OUTRIGHT BY BOTH SOURCES, IN A FOOTNOTE AND IN A FIELD.** UNdata's
*Capital city* row for Sri Lanka reads **Colombo**, not Kotte, and carries footnote `c`: *"Colombo is the
capital and Sri Jayewardenepura Kotte is the legislative capital."* The Commonwealth Secretariat's Key Facts
divides the same pair by function — *"Colombo (executive and judicial), Sri Jayewardenepura Kotte
(legislative)"*. So the deck's hardest-looking capital is its best-documented split, and **the footnote is
the source, not the field**: reading the row alone would have put Colombo on this card. **Read the letters
beside a UNdata value before trusting the value.**

**AND ITS POPULATION ROW IS OMITTED FOR A SECOND TIME, ON A DIFFERENT GROUND FROM TAIPEI'S.** Here the
figure exists and is about the WRONG CITY: UNdata's 606.2 thousand is Colombo's, `EN.URB.LCTY` gives
606,158 for the same year, and neither body publishes anything for Kotte — the third capital the
largest-city series is not about, after Yamoussoukro and Canberra, and the first where the sources say so
themselves. The card states that in its last sentence rather than leaving a gap to be read as an oversight,
and the facts box carries **Role — legislative capital** in the population's place.

**THE SPELLING DIVERGENCE IS NOW TWO INSTITUTIONS AGAINST FOLIO, AND THE CARD SAYS SO RATHER THAN PICKING
A SIDE.** UNdata and the Commonwealth both write **Jayewardenepura**; `world-capitals.js`, this plan and the
glossary write **Jayawardenepura**, and `add-card.js` validates `map.dot` against that file, so the answer
term cannot change without regenerating it. The abstract therefore states the difference as a fact about
the sources — *"Both bodies write the name Sri Jayewardenepura Kotte, one letter different from the
spelling used here"* — and the glossary term carries the institutional form as an **alias**, so a reader
arriving with either spelling lands on the same entry. **A divergence a card explains is content; one it
hides is an error waiting to be reported.**

**`gw-562` LILONGWE: THE EMBASSY'S NAME AND ITS ADDRESS DISAGREED FOR SIX YEARS, AND THE GUIDE SAYS SO IN
A PARENTHESIS.** Malawi's Diplomatic Relations entry records that the consulate at Blantyre was elevated on
independence, 6 July 1964, *"(designated as Zomba, Malawi until 1970, but physically at Blantyre)"*, and
that the embassy was relocated to Lilongwe on **1 April 1976**. So the United States kept an embassy named
for one town while it stood in another, and neither of the two was the city this card is about — which is
the Damascus rule at its sharpest: **the Diplomatic Relations half is where a capital card's material is,
and the parentheses in it are not decoration.**

**AND THE CARD DOES NOT SAY WHEN LILONGWE BECAME THE CAPITAL, because nothing openable here says so.** The
guide dates the EMBASSY's move and not the seat's; UNdata and the Commonwealth both name Lilongwe as the
capital today and neither dates the change. A first draft opened "Lilongwe became Malawi's capital only in
the 1970s", which is true, widely known, and **in none of the five sources** — it was rewritten to the
embassy's own dates, which carry the same shape without asserting a year no citation supports. The glossary
term was drafted with the same sentence and fixed the same way. **A date everyone knows is still a date
that needs a source**, and this is the easiest kind of claim to let through, because nobody reading it
would doubt it.

**ITS PICTURES ARE THE THIN END OF COMMONS, AND ONE FILENAME LIES OUTRIGHT.** `Lilongwe, Capital city of
Malawi.jpg` is a café terrace looking at an office block; the ISS frames in `Category:Lilongwe` are
spaceborne and refused by the pass's own rules; and the best-lit candidate, `Bamako ACI 2000 view.jpg`'s
Malawian equivalent, is a single building. The card takes a street in Bwaila South — a city rather than a
building — and the term takes the City Centre block. **Worth recording for its own sake:
`Lilongwe - Chancery Office Building - 1975 - DPLA` is a photograph of the American chancery on open
scrubland the year before the embassy moved in.** It is the single most card-relevant image in the
category and it goes UNUSED, because the deck's rule is that a city card shows the city; noted here so the
next session does not spend the search finding it again.

**`gw-563` LUSAKA: WHERE THE GUIDE IS THIN, ASK WHAT WAS NEGOTIATED IN THE CITY.** Zambia's guide entry
is three facts — a consulate at Lusaka raised to embassy status on 24 October 1964, that elevation being
the act of recognition, and Robert C. Foulon as chargé — and it repeats its Recognition paragraph verbatim
under Diplomatic Relations, so it is thinner than it looks. What carried the card is **FRUS searched for
the CITY NAME rather than the country**: Kissinger's own report to the President of 21 September 1976
opens "From Pretoria I flew to Lusaka, Zambia, Monday to report to President Kaunda", describes the
three-hour meeting at which he put the Rhodesia programme, records that Kaunda "was speechless", and notes
in passing that **SWAPO was based in Lusaka**, which is the sort of city fact no country page ever carries.
**Search FRUS for the capital's name before concluding a capital is thinly sourced.**

**AND A 1969 UN RESOLUTION CAN BE CITED BY TITLE AND NOT BY TEXT.** `A/RES/2505 (XXIV)`, *Manifesto on
Southern Africa* — the Assembly's endorsement of what is commonly called the Lusaka Manifesto — is a
SCANNED PDF with no text layer, and so is the Zambian representative's covering letter `S/9363` of 28 July
1969; the `zlib` recipe returns nothing from either, and neither catalogue record names Lusaka. So the
obvious route to the city was dropped rather than asserted: **a resolution everyone calls the Lusaka
Manifesto is not a source that says "Lusaka" unless you can read it.** The 1955 admission resolution
`A/RES/995 (X)` behaves the same way; from about 1971 the scans carry text and the recipe works. **Test the
extraction before planning a sentence around a pre-1970 document.**

**`gw-564` ASTANA ALSO SHOWS THE UN PUBLISHING A CITY UNDER TWO NAMES.** Its Economic Commission for
Europe issued *Smart Sustainable Cities Profile: Nur-Sultan, Kazakhstan* (`ECE/HBP/197`, Geneva 2020) while
UNdata's country profile now gives the capital as **Astana** — one organisation, two names, twelve years of
records either side. A UN CITY PROFILE is a source class this deck had not used before and is worth
remembering: it is about the city rather than the country, which is what a capital card wants and what a
country page never gives. The Security Council's press statement `SC/12701` of 31 January 2017, headed
*International Meeting on Syria in Astana*, is the same shape — the city named in a document's own title.
**Search the UN Digital Library for the CITY, not the state.**

**And Kazakhstan's guide page stops before the capital moved**: it records the embassy established at
*Alma-Ata (now Almaty)* on 3 February 1992 and nothing after, so the guide is a source for the OLD capital
and for that city's own renaming, not for this card's subject. It is still worth citing for exactly that —
the mission is in the larger city, which is the card's point.

**`gw-565` N'DJAMENA IS THE ONLY CAPITAL SO FAR WHOSE EMBASSY WAS CLOSED BY A BATTLE IN THE CITY.** Chad's
guide entry carries five dated events and every one is about this place: relations opened on 11 August 1960
by **Alan W. Lukens, the consul at Brazzaville** — the fourth capital in this run served at first from
another country, after Abidjan for Niamey and Ouagadougou and Dakar for Bamako; **Embassy Fort Lamy (now
N'Djamena)** established 1 February 1961 under Frederic L. Chapin; **closed on 24 March 1980** with the
staff evacuated "following the outbreak of heavy fighting in the city"; and **reopened on 15 January 1982**
under John Blane. A guide page that looks like boilerplate on most countries is, on a few, the fullest
account of the capital anyone has published.

**AND THE RENAMING DATE WAS CUT FROM BOTH DRAFTS, FOR LILONGWE'S REASON.** The guide establishes that the
post was Fort Lamy and is now N'Djamena; it does not date the change, and nothing else openable here does.
The card was drafted "spent its first twelve years as a capital under another name" and the term "It was
called Fort Lamy until the 1970s" — both true, neither sourced — and both were rewritten to what the guide
carries, which is the two names and the dates of the POST. **That is the second batch running where a
capital's own renaming date had to be dropped**; expect it wherever the guide's parenthesis is the only
witness, and reach for the parenthesis rather than the year.

**THE APOSTROPHE COST NOTHING THIS TIME BECAUSE IT WAS EXPECTED.** `world-capitals.js` writes the dot name
with a straight ASCII apostrophe and the answer, question and glossary key all match it; both Commons
filenames percent-encode theirs as `%27`, so no credit line was truncated by `SRC_URL_RX`. **Fifteen
glossary keys already carry apostrophes**, so the key needed no special handling. What did need care is
the picture search: `NDjamena, Chad.jpg` — a filename with no hint in it — is an **orbital photograph**,
refused by the pass's own SPACEBORNE rule, and the two next-best candidates were a river bend in open
country and a stretch of riverbank scrub. The card and term both take street-level views instead.

**`gw-566` SANTIAGO FOUND A SPLITTER GAP, AND THE CARD WAS REWORDED RATHER THAN THE SPLITTER CHANGED.**
The Allende milestone quotes his last broadcast — *"Long live Chile! Long live the people! Long live the
workers!"* — and `split-abstract.js` read the three exclamation marks as three sentence ends, returning
**5+7**. The existing quotation guard (added for `geo-012`) holds a terminator that sits INSIDE a closing
quote when the next word is lowercase; here each `!` is followed by a space and a CAPITAL inside the
quotation, which is indistinguishable from a real boundary without tracking whether a quotation is open.
That fix is worth making, but it is shared machinery and the house rule is to prove such a change inert
over all 2,600-odd texts first — so the card paraphrases the three cries instead, and **the gap is recorded
here rather than papered over**. Anyone quoting more than one exclamatory sentence in an abstract will meet
it; check the split before committing the prose.

**Its other lesson is that the guide's LONGEST entries are the ones about a city.** Chile's runs to five
dated events and reads as a narrative — Monroe's message to Congress of March 1822 asking for ministers to
five new states, the appropriations bill signed 4 May 1822, the Senate's confirmation of Heman Allen on
**27 January 1823** as the act of recognition, Allen presenting credentials in Santiago on 23 April 1824 to
Ramón Freire Serrano "who had replaced Bernardo O'Higgins as Supreme Director", and the legation raised to
embassy status on **1 October 1914** — ninety years between the first minister and the first ambassador,
which is a fact about this city and about American diplomacy at once.

**And Santiago is the fourth AGGLOMERATION footnote.** UNdata's capital-city row carries `c` = *"Refers to
the urban population of Santiago Metropolitan Area Region"* beside `d` = 2019, and `EN.URB.LCTY` gives
6,723,516 for that year — the relay holding, and both figures being the metropolitan region rather than the
city. After Kuala Lumpur, this is routine enough to state as a rule: **where the footnote says
agglomeration, say so in the prose**, because a reader comparing capitals is otherwise told this one is
five times the size of its neighbours for a reason nothing on the card explains.

**`gw-567` BUCHAREST HAS THE LONGEST GUIDE ENTRY THE DECK HAS MET, AND ITS BEST MATERIAL IS A CONSULATE
NOBODY PAID FOR.** Romania's page runs to a dozen dated events. Two are worth the card on their own. **The
consulate here predates the country**: Louis J. Czapkay was appointed to Bucharest on 20 June 1866 while
the principalities were still an autonomous part of the Ottoman Empire; and his successor **Benjamin
Franklin Peixotto** was appointed in 1870 "as an expression of U.S. concern with the status of Romania's
Jewish community, which was denied citizenship and subject to persecution", the guide adding that he was
"financially supported by a consortium of American, British, and French Jews since there was little
American commerce with Romania". A consular post funded by private subscription because the trade did not
justify it is the kind of fact only this source carries.

**And it is the clearest case yet of a capital sharing its minister.** The 1882 legation's first head,
Eugene Schuyler, "was also accredited to Greece and Serbia and moved his residence to Athens"; from 1885
to 1905 the commissions covered Greece, Romania and Serbia with residence AT ATHENS; from 1905 the
minister lived in Bucharest but was still accredited to Serbia and at times Bulgaria; and **Peter Augustus
Jay, appointed 18 April 1921, was the first commissioned exclusively to Romania** — thirty-nine years
after the legation opened. After Abidjan, Dakar and Brazzaville, this is the shape at its extreme: not a
mission in the wrong city for six months but a capital that did not have a minister to itself for two
generations.

**A FALLING CAPITAL, AND THE PLAINEST INSTANCE SO FAR.** `EN.URB.LCTY` for Romania falls in **every one of
the eleven years 2015–2025**, 1,848,922 → 1,758,699. C10's Marshall Islands finding — that "out of date"
must not be read as "too low" — has a European instance now, and it is worth stating in the prose rather
than quoting one year, because a reader who knows the 2019 figure would otherwise think the card stale.

**AND A COMMONS ORIGINAL EXACTLY 1000px WIDE HAS NO 1000px THUMB.** `Bucuresti_de_sus.jpg` is 1,000 × 665,
and `/thumb/…/1000px-…` answers **400** — Commons does not generate a thumbnail at or above the original's
own width. The fix is to point `src` at the ORIGINAL file path (no `/thumb/`), which is what this card
does. Sibling of the earlier finding that `Special:FilePath?width=N` silently serves the original when it
is smaller than N: **between them, any file near the 900px bar needs its src checked rather than built.**

**`gw-568` MOGADISHU IS THE MISSION-ELSEWHERE SHAPE AT ITS LIMIT: TWENTY-EIGHT YEARS.** The guide records
the embassy closed on **5 January 1991** with all American personnel withdrawn after the collapse of the
central government — and states in the same breath that relations were NOT severed, the United States
dealing with Somalia "through the U.S. Embassy in Nairobi, Kenya" until the mission in Mogadishu reopened
on **2 December 2018**, with Nairobi still handling consular coverage afterwards. Beside Abidjan's six
months for Niamey and Brazzaville's for N'Djamena, this is the same arrangement lasting most of a working
lifetime, and it is the single fact the card is built on.

**TWO ORGANS SETTLED ITS INDEPENDENCE DATE AND BOTH RECORDS ARE CITABLE BY TITLE.** `A/RES/1418 (XIV)` and
`T/RES/2015 (XXVI)` are both headed *Date of independence of the Trust Territory of Somaliland under
Italian administration*, and the Trusteeship Council's carries a usable note — *"Adopted at the 1104th
plenary meeting, 7 June 1960"* — three weeks before the date it fixed. Both are pre-1970 scans with no text
layer, so **the citation rests on the catalogue metadata rather than the document**, which is exactly what
Lusaka's finding said to check first. Where a trust territory is involved, look for the TRUSTEESHIP COUNCIL
resolution beside the General Assembly one: it is a second organ on the same question and its record
usually carries the meeting number and date.

**AND A RETIRED MILESTONE URL ANSWERS 200 WITH A "PAGE NOT FOUND" BODY.**
`history.state.gov/milestones/1993-2000/somalia` returns **200** and 19 KB of navigation chrome whose text
begins *"Page not found"*; `/milestones/1989-1992/somalia` honestly 404s. The Milestones were retired and
some slugs simply do not exist, so this is a seventh variety of 200-status error document and the first on
a host the deck relies on. **Grep a milestone's body for the city or the subject before citing it** — the
status line will not tell you.

**`gw-569` DAKAR IS THE MISSION-ELSEWHERE FAMILY RUN BACKWARDS, AND IT IS THE FOURTH SHAPE THAT
FAMILY TAKES.** Bamako, Niamey and Ouagadougou were each dated by an American mission sitting in ANOTHER
city — the guide says where the accrediting embassy was, and the capital's own date falls out of it.
Dakar is the same sentence read from the other end: the embassy never moved at all, and it was the
ACCREDITATION that changed, from the Federation of Mali to the republic that had just left it. The guide
is unusually explicit about it — *"The Embassy at Dakar had been accredited previously to the Federation
of Mali, which no longer existed"* — which is why this pair is worth carrying together: `gw-558` Bamako
and `gw-569` Dakar are one federation seen from its two halves, and 24 September 1960 is the day one city
became a capital in American eyes while the other stopped being the capital of anything larger than
itself. **On a state that federated, merged or seceded, read the guide for where the mission was AND for
what it was accredited to** — the second question is the one that answers a capital card when the mission
was here all along.

**A SOURCE'S OWN TEXT CAN CARRY A TYPO, AND NEITHER REPRODUCING IT NOR SILENTLY FIXING IT IS RIGHT.**
UNdata's footnote d on Senegal reads *"Refers to the sum of the Departments of Dakar, Pikinie and
Guédiawaye, in Dakar Region"* — and the department is **Pikine**. Quoting the list reproduces a
misspelling on a study card; correcting it puts words in the source's mouth that a reader checking the
citation will not find. The card says the figure is *"the sum of three departments of the Dakar Region"*,
which is exactly what the footnote asserts and names nothing it does not. **Where a source's wording is
wrong in a way that does not touch its claim, paraphrase the claim and leave the wording alone.** The
relay itself held here for the eleventh time — UNdata's 3,057.1 thousand for 2019 and the World Bank's
`EN.URB.LCTY` 3,057,065 for the same year are one number, Dakar being both the capital and the largest
city, which is the condition the Astana exception established.

**`gw-570` GUATEMALA CITY IS WHERE C11'S SPANISH-AMERICA WARNING COMES GOOD, AND THE GUIDE PAGE IS THE
RICHEST IN THE DECK.** C11 found that the recognition guide dates by U.S. RECOGNITION, which in Spanish
America is not independence — the Central American states through the Federation in 1824 — and deferred
Mexico, Costa Rica and Nicaragua on it. Guatemala's page is the one that states BOTH: *"Following its
independence from Spain in 1821, Guatemala joined the Federation of Central American States in 1823"*,
and then the 1824 federal recognition, an 1844 recognition of an independent Guatemala by exequatur, an
1849 credentialing and an 1882 raising of the legation to an embassy. **Five datable relations claims on
one page, of which four name a rank or an instrument** — grep the summary paragraph for the independence
year before deferring a Spanish-American capital, exactly as C12 found for South America.

**AND IT CARRIES AN ADMISSION AGAINST INTEREST, WHICH IS CITED AS AN ACCOUNT AND NOT AS A FINDING.** The
same page says the Central Intelligence Agency "assisted in the overthrow" of President Jacobo Árbenz
Guzmán in June 1954 and that relations were resumed on 12 July. The house rule is that **no state's
account of its own actions is repeated as established fact**, and it does not lift merely because the
account is unflattering — so the card writes *"The American record states that…"* and lets the reader see
whose sentence it is. The corroboration is a different institution: **Security Council resolution 104
(1954)**, adopted unanimously at the 675th meeting on 20 June 1954 on a cablegram from the Guatemalan
minister for external relations, calling for "the immediate termination of any action likely to cause
bloodshed" and asking all members "to abstain, in the spirit of the Charter, from rendering assistance to
any such action." **A Security Council resolution is the second source a contested American account
needs**, and `digitallibrary.un.org/search?p=S%2FRES%2F<n>%28<year>%29` resolves one by symbol where the
free-text search returns nothing at all. Its PDF needs `curl -sL` — the files endpoint 302s, and a
redirect not followed hands back 182 bytes that decompress to nothing.

**`gw-571` QUITO IS THE FIFTH BREAK IN THE RELAY AND THE FIRST IN SOUTH AMERICA.** UNdata's *Capital city
pop.* gives 1,847.7 thousand for 2019 and `EN.URB.LCTY` gives 2,946,158 for the same year — a 59% gap,
because the World Bank series counts whichever city is LARGEST and Ecuador's is **Guayaquil**, on the
coast. That is the rule stated at Astana working exactly as written, and the card does the same thing
Yamoussoukro, Canberra and Kotte did: **cite UNdata alone for the population, and say in the prose why
there is no second figure**, rather than leaving a reader to wonder whether one was looked for. The
largest-city series is still cited — for the fact that it counts Guayaquil — which is the honest use of a
source that disagrees. **Before pairing the two figures on any capital card, ask whether the capital IS
the largest city**; where it is not, the World Bank number is about a different place and pairing them
would be a fabrication with two real citations under it.

**AND ECUADOR SUPPLIES A SECOND STATE DEPARTMENT WORK THAT IS NOT THE GUIDE.** `history.state.gov/
departmenthistory/people/chiefsofmission/<country>` is the roll of chiefs of mission, openable, and it
dates the PERSON where the guide dates the POST: the guide raises the legation at Quito to embassy rank on
**5 March 1942**, the roll commissions Boaz Walton Long as ambassador on **14 April 1942**. Neither is
wrong and they are not the same event, so the card states both and says which is which — this is C4's
Bangladesh case in a new register, where two institutional dates bracket the thing the reader wants. **It
is also a genuine fifth source on a capital whose statistical profile has only one usable figure**, which
is what made this card reach the bar at all. Ecuador's recognition page is the deck's best example of the
guide treating recognition as a SEQUENCE of acts — an 1832 letter, an 1835 exequatur, an 1836 instruction
— rather than a date.

**`gw-572` AMSTERDAM IS THE TWO-CAPITAL CASE WITH BOTH SOURCES STATING THE SPLIT OUTRIGHT, WHICH KOTTE
DID NOT HAVE.** UNdata carries footnote d on the Netherlands reading *"Amsterdam is the capital and The
Hague is the seat of government"*, and the EU country page's Capital field reads *"Amsterdam; Parliament
and government are located in The Hague"* — two institutions saying the same thing in their own words, so
the card can assert the division rather than describe it around the edges. Compare `gw-561`, where
UNdata's Capital field simply names **Colombo** and the split had to be handled by omission. **Read the
FOOTNOTES on a UNdata profile before writing a capital card, not just the fields**: on a divided capital
the qualification is where the fact lives, and it is the same footnote apparatus that carries the
agglomeration wording. The relay held here for the twelfth time (1,140.3 thousand against 1,140,339 for
2019), Amsterdam being the largest city as well as the capital.

**AND THE AMERICAN RECORD FOLLOWS THE GOVERNMENT, NOT THE CAPITAL — WHICH IS WHAT MAKES THE GUIDE USABLE
ON A CARD ABOUT THE OTHER CITY.** Every diplomatic event on the Netherlands page happens at The Hague:
relations established there on 19 April 1782, the legation closed there in 1801, moved to London in 1940,
raised to embassy rank in 1942 and returned there in 1945. Amsterdam appears in that record exactly once
and in a different register — as a CONSULAR post, Sylvanus Bourne acknowledged consul general on 2 January
1798, who then oversaw American interests from Amsterdam for the thirteen years the legation was shut. So
the guide is not silent about this capital; it places it correctly, and the card says so. **On a divided
capital, the recognition guide is evidence FOR the division rather than a source that has missed the
point** — check the consular section, which is where the commercial city turns up when the diplomatic one
has the government.

**`gw-573` PHNOM PENH IS THE RECOGNITION GUIDE'S RICHEST CITY-LEVEL PAGE SO FAR, BECAUSE THE MISSION
KEEPS MOVING.** Mogadishu's page was good because the embassy closed for 28 years; Phnom Penh's is better
because the mission is opened, severed, reopened, closed and opened again, and the guide dates every step
IN THE CITY — the legation opened 14 November 1950, raised to embassy rank 24 June 1952, the first
resident ambassador 2 October 1954, relations severed 3 May 1965 and reestablished 2 July 1969, the
embassy reopened that August, closed 12 April 1975, a mission established 11 November 1991, the embassy
reopened 17 May 1994. **A capital whose mission has a broken history is the easy case, not the hard one**:
where an uneventful capital yields one date, a contested one yields eight, all of them about the city
rather than the country. Note also that the first two ministers were resident at SAIGON — a mission
accredited from another capital, C4's shape once more, this time visible inside a single page.

**AND THE GAP IN THAT SEQUENCE IS WHERE THE SECOND SOURCE GOES.** Between the 1991 mission and the 1994
embassy sits **Security Council resolution 745 (1992)**, adopted at the 3057th meeting on 28 February
1992, establishing the UN Transitional Authority in Cambodia "for a period not to exceed eighteen months"
and deciding elections were vital by May 1993, on the Paris agreements of 23 October 1991. That is the
second time in five cards a Security Council resolution has carried what no statistical profile could —
after Guatemala City — and the pattern is worth naming: **when the recognition guide leaves a gap of
years in a mission's history, ask what the Security Council was doing in those years.** The guide's own
last line spells the city "Phnom Pehn"; that is a typo in the source and the card does not reproduce it,
by the rule Dakar's UNdata footnote established.

**`gw-574` HARARE IS THE THIN GUIDE PAGE WHOSE SECOND SOURCE IS THE WHOLE CARD, AND IT IS THE THIRD
SECURITY COUNCIL RESOLUTION IN SIX CARDS.** The Zimbabwe page is four sentences long — recognition and
relations both on 18 April 1980, plus a note that the United States never recognised Rhodesia's 1965
unilateral declaration. Everything else the card says comes from **resolution 460 (1979)**, adopted at the
2181st meeting on 21 December 1979, which recalls resolution 232 of 16 December 1966, notes that the
Lancaster House conference had produced agreement on a constitution for "a free and independent Zimbabwe
providing for genuine majority rule", deplores "the fourteen years of rebellion", reaffirms the people's
right to self-determination and calls on members to terminate the Chapter VII measures. **A capital whose
country had a contested sovereignty has a UN paper trail in proportion**; Guatemala City, Phnom Penh and
Harare have now all been carried by one, and the search-by-symbol route is the way in.

**AND THE SUPERLATIVE THAT WANTED WRITING WAS NOT IN THE SOURCE.** The draft said resolution 232 was the
first measure the Council ever made binding on all members — which is true, is in every account of the
sanctions, and is in NEITHER cited work: 460 merely recalls 232 by number and date. It was cut, and the
sentence now says what 460 says, that the Council acted under Chapter VII. **The claims most likely to
slip past a source check are the ones a writer already knows**; they arrive feeling verified. Two smaller
things: the guide writes *"the American Embassy at Salisbury (now Harare)"* with **no renaming date**, so
the card says Salisbury was the city's name at the time and dates nothing; and the glossary term was
drafted with the alias *"Salisbury, Rhodesia"*, which is a comma-bearing string no prose contains, then
**left with no alias at all**, since bare *Salisbury* is also a city in England and in Maryland.

**`gw-575` CONAKRY IS THE SECOND THIN GUIDE PAGE IN A ROW, AND THE FIX IS THE SAME ONE: FIND THE UN
ADMISSION AND READ THE ORDER OF THE DATES.** The Guinea page gives two facts — recognition on 1 November
1958 by a letter from Eisenhower to Sékou Touré, and the embassy established on 13 February 1959 — and
General Assembly resolution 1325 (XIII) puts the admission to the United Nations at the 789th plenary
meeting on **12 December 1958**, which falls BETWEEN them. That ordering is the card's own subject:
recognition, then a seat at the United Nations, then an embassy. **Where a guide page yields only two
dates, the admission record is the third, and its position in the sequence is often more interesting than
the date itself.**

**AND TWO CLAIMS WERE CUT IN DRAFT FOR THE SAME REASON HARARE'S SUPERLATIVE WAS.** The draft said French
West Africa's administrative seat was at Dakar rather than Conakry — true, and in NEITHER guide page, the
Guinea one saying only "part of French West Africa" and the Senegal one nothing about the federation's
capital — so it went. And it said the order was "unusual: most capitals in this deck…", which is a claim
about FOLIO rather than about the world; the sentence now states the sequence and calls it less usual than
the reverse, without counting anything. **A card may not cite the deck it is in**, the same rule that
retired an Astana sentence. Note also that the 1958 admission PDF has **no text layer** — the pre-1970 UN
scans do not — so the citation rests on the record page, which states the title, the plenary meeting and
the date, exactly as Senegal's did.

**`gw-576` PORTO-NOVO IS THE TWO-CAPITAL CASE AND THE BROKEN RELAY AT ONCE, AND THE SAME FOOTNOTE
CARRIES BOTH.** UNdata's footnote c on Benin reads *"Porto-Novo is the constitutional capital and Cotonou
is the economic capital"* — the second UNdata footnote in three cards to state a divided capital, after
the Netherlands — and it is ALSO why the relay breaks: the *Capital city pop.* field gives **285.3
thousand** for Porto-Novo while `EN.URB.LCTY` gives **991,000**, which is Cotonou. That is the sixth
break and the second in three cards, and the two faults have one cause, so **on any capital whose UNdata
footnote names a second city, expect the largest-city series to be measuring that second city** and cite
UNdata alone, as Quito and Astana did.

**AND THE RECOGNITION GUIDE CORROBORATES THE SPLIT BY WHERE IT PUT THE EMBASSY.** The Benin page never
mentions Porto-Novo: the mission is **Embassy Cotonou**, established 15 February 1961. Amsterdam's guide
page followed the GOVERNMENT to The Hague; Benin's follows the ECONOMY to Cotonou; in both the guide
names a city other than the capital, and in both that is evidence rather than an omission. **Three
institutions now agree the capital is not the working city, and none of them says it in the same words** —
which is what makes the claim safe to assert. Two smaller things: the guide dates the COUNTRY's renaming
("In 1975, the country was re-named the Republic of Benin"), unlike Harare's undated city renaming, so
that date is citable; and `Porto-Novo vue.jpg` is 834px and **below the picture bar**, though Commons
served an upscaled 960px thumbnail for it without complaint — **check the ORIGINAL's dimensions, since a
thumbnail request larger than the file still returns 200.**

**`gw-577` KIGALI IS THE FIRST CARD WHERE A UN RESOLUTION NAMES THE CITY IN ITS OWN OPERATIVE TEXT.**
Guatemala City, Phnom Penh and Harare were each carried by a Security Council resolution ABOUT the
country; **resolution 872 (1993)**, adopted at the 3288th meeting on 5 October 1993, mandates UNAMIR "to
contribute to the security of the city of Kigali, inter alia, within a weapons-secure area established by
the parties in and around the city" and authorises the first contingent to deploy *to Kigali*. On a
capital card that is worth more than any number of country-level dates. **Grep a resolution's PDF for the
CITY NAME before deciding what it can carry** — it takes one line and it decided this card's second half.
Its other source is the General Assembly's **resolution 1746 (XVI)** of 27 June 1962, which does the work
a thin guide page could not: it notes "the efforts to maintain the unity of Ruanda-Urundi did not succeed"
and terminates the Trusteeship Agreement of 13 December 1946 on 1 July 1962, "on which date Rwanda and
Burundi shall emerge as two independent and sovereign States". **Where a country was half of a trust
territory, the trusteeship-termination resolution dates the independence and explains the split at once.**

**AND THE HOUSE CHECKS CAUGHT TWO FAULTS ON THIS CARD THAT READING IT DID NOT.** `split-abstract.js`
reported **5+6** — the second block had grown a sentence — and `check-style.js` went from the standing 20
findings to **21**, on "Thirty-one years later", a non-round number above 20 written as a word. Merging the
two sentences fixed both at once. The repair also needed the card taking OUT of `data.js` and re-added,
`add-card.js` refusing a duplicate id: with the card the only uncommitted change to that file,
`git checkout data.js` then a re-add is clean, and the glossary files are untouched by it. **Run
`split-abstract.js` and `check-style.js` before the commit, not after** — a 5+6 abstract renders perfectly
and a spelled-out number reads as prose.

**`gw-578` FOUND THE PLAN OUT OF DATE: BURUNDI HAS MOVED ITS CAPITAL, AND IS THE ELEVENTH MULTI-SEAT
COUNTRY.** The running order said *Bujumbura [Burundi]*, written from the population snapshot; UNdata's
*Capital city* field says **Gitega**. So Burundi joins the table above with `gw-578` Gitega as the
political capital and **`gw-762` Bujumbura** as the economic capital and largest city, and the second-seat
band runs to `gw-762`. **`gw-578` IS DEFERRED, and for a mechanical reason worth stating**: `world-
capitals.js` holds only `Bujumbura` for Burundi, that table being generated from Natural Earth, which
still files Bujumbura as the capital — so a Gitega card has no dot, and the rule that **a coordinate is
generated and never typed** is what defers it rather than any gap in the sources. It waits on a Gitega
point in that table, exactly as the six territory cards wait on one facts field.

**AND UNdata's BURUNDI PROFILE CARRIES AN ORPHANED FOOTNOTE, WHICH IS WHY THE POPULATION IS CITED TO THE
WORLD BANK.** The *Capital city pop.* row gives **899** thousand marked only `c` (2018) under a Capital
city field reading Gitega — and footnote **e** on the same page reads, in full, *"Bujumbura"*, attached to
no row at all. That figure is Bujumbura's size, not Gitega's, and the page no longer says so: the label was
updated after the 2019 move and the footnote was left unanchored. **Check which row a UNdata footnote
actually hangs on before leaning on it** — the parse that reads footnotes positionally will happily attach
this one to the row above. The card therefore takes its population from `EN.URB.LCTY`, which
unambiguously counts the largest city, and cites UNdata for the capital, the region, the area and the
membership date. The recognition guide's own contribution is the city's older name — *Embassy Usumbura
(Bujumbura)* — and a rank that went backwards before it went forwards, to legation on 15 December 1962 and
to embassy again on 16 September 1963.

**`gw-579` SUCRE IS THE THIRD DIVIDED CAPITAL IN EIGHT CARDS, AND ALL THREE WERE SETTLED BY A UNdata
FOOTNOTE.** *"La Paz is the seat of government and Sucre is the constitutional capital"* joins the
Netherlands' and Benin's, and this one is properly anchored to the Capital city field where Burundi's was
orphaned. **Read that footnote first on any capital card**: it settles the qualifier the question must
carry, it predicts the relay break, and on three of these four it also told us which city the American
mission would turn out to be in. Here the guide again names the OTHER city — the legation opened at
**La Paz** on 3 January 1849 — so the pattern established at Amsterdam and Porto-Novo now holds three
times: on a divided capital, the recognition guide is evidence for the division.

**IT IS ALSO THE SEVENTH RELAY BREAK, AND THE FIRST WHERE THE THIRD CITY IS NEITHER CAPITAL.** UNdata
gives 277.9 thousand for Sucre and `EN.URB.LCTY` gives 1,835,355, which is neither Sucre nor La Paz but
whichever city is largest — so the card says only what the series IS and how far apart the two numbers
are, rather than naming a city no cited source names. **Where the largest-city series measures a place the
card cannot identify from its sources, describe the series rather than the city.** Two smaller things: the
picture's Commons file name carries PARENTHESES, which `SRC_URL_RX` stops at, and percent-encoding them
(`%28`/`%29`) keeps the credit line whole — the fix the plan's apostrophe-and-bracket rule implies but had
not stated; and a draft sentence saying Bolivia was recognised "two years before it took a seat at the
United Nations in 1945" was arithmetic nonsense for 1848 and was cut. **Read a sentence that computes.**

**`gw-580` TUNIS IS THE ONE CAPITAL WHOSE GUIDE PAGE RUNS THE RECOGNITION THE OTHER WAY.** Its first
heading is *"Tunisian Recognition of the United States, 1795"* — the authorities here accepted an American
consular representative in mid-1795, before there was anything to recognise in the other direction — and
the page is then almost entirely ABOUT THE CITY rather than the country: Donaldson named consul for Tunis
on 28 March 1795 but resident at Algiers, Famin deputised and arranging a truce effective 15 June 1796,
Eaton presenting his credentials to Hamouda Pasha on 15 March 1798, the Treaty of Bardo of 12 May 1881, the
La Marsa Convention of 8 June 1883, the consulate general of 22 May 1946, the embassy of 5 June 1956. Only
the Netherlands page has the same inversion, and there it is one sentence. **A pre-1800 consular
relationship is the richest kind of guide page this deck can meet**, because a consulate is in a CITY where
a legation is accredited to a state.

**IT ALSO CONTRADICTS ITSELF ON A DATE, AND THE CARD DROPS THE DAY.** The Recognition section dates the
Treaty of Peace and Friendship "on or around August 28, 1797" and the Consular section calls it "the August
1, 1797 treaty" — the same treaty, two days, one page. The card says **"signed in 1797"**, which is what
both statements agree on, rather than picking the hedged one and looking precise. C2's rule that a spine
source is not infallible usually means reading a source against ANOTHER source; here it means reading a
page against itself. (The page also spells the country "Tunisa", the deputy "Flamin" once and "Famin"
twice, and "Ocotber" — typos, and the card reproduces none of them, by the Dakar rule.) Its admission is
the deck's first to show **the Charter's two steps separately**: Security Council resolution 116 (1956) at
the 732nd meeting on 26 July recommends, General Assembly resolution 1112 (XI) at the 574th plenary on
12 November admits. **Both records are openable; cite the pair where a card has room.**

**`gw-581` JUBA IS WHERE `map.key` AND THE COUNTRY'S NAME COME APART, AND `add-card.js` CAUGHT IT.**
`world.js` files South Sudan as **`S. Sudan`** — its labels are written to fit on a map, which is the
`FINDIT_NAMES` finding one layer down — so `"key": "South Sudan"` was refused outright, with the checker
offering South Korea and South Africa. **The key is the world.js LABEL, never the country's name**, and
`world-capitals.js` agrees with it (`"Juba": {"s":"S. Sudan"}`), so the dot check passes only once the key
does. Nothing reader-facing is affected here — a map card's question never names the country — but a card
written without running the checker would have shipped a window that says it could not load.

**IT IS ALSO THE SECOND UNdata PROFILE WITH NO SURFACE AREA FIELD, AFTER SUDAN.** C9 recorded that
Sudan's profile omits one, the only such case in Phase 3; South Sudan's omits it too, which makes the pair
a shape rather than an accident — **the country that split and the country it split from both lost the
field.** The card takes 646,883 km² from the World Bank's `AG.SRF.TOTL.K2`, which C9 established as an
independent measurement rather than a relay, and says in the prose that the UN profile carries none.
Its own subject is the speed: **five days from declaration to membership**, with both of the Charter's
steps openable — Security Council resolution 1999 (2011) at the 6582nd meeting on 13 July recommending,
General Assembly resolution 65/308 at the 108th plenary on 14 July deciding — which is the second card in
two to cite the pair, after Tunis.

**`gw-582` BRUSSELS IS THE THIRD SOURCE JOINING THE OTHER TWO, AND THE EU PAGE EARNS ITS PLACE ON A
NON-FIGURE FIELD.** C1 found the EU country page for the accession date and the figures; here it also
supplies **the three official languages** — Dutch, French and German — which nothing else openable states
and which is the fact a reader of a Brussels card most wants after the population. Its area (30,667 km²)
and UNdata's (30,528) differ by half a per cent, the land-against-total spread C1 measured, and the card
states both rather than choosing. **On an EU capital, read the country page for its NON-numeric fields
too**; the accession line is what the recipe was built for, but Capital, languages and Schengen are all
stated outright.

**ITS OWN INTEREST IS A RECOGNITION SEQUENCE WITH THREE DIFFERENT DATES FOR ONE INDEPENDENCE.** Belgium
declared it on 4 October 1830; "most of the European powers recognized de facto independence" on
20 December 1830; the United States recognised it on 6 January 1832 by an exequatur to the Belgian consul
at New York; and the former ruler accepted it only with the Treaty of London of 19 April 1839 — nine years
between the declaration and the Netherlands' acceptance, with the American recognition in the middle. That
is the clearest case yet of why **a card should give the sequence rather than "independence: 1830"**, and
the date line carries three of the four. Note the guide's own phrasing there — it says the Netherlands
"recognized **Brussels** as a sovereign state", using the city for the state, which is a nice sentence and
not a fact to build on.

**`gw-583` PORT-AU-PRINCE IS THE CASE C11 SAID TO GREP FOR, AND THE GREP PAYS.** C11 recorded that the
recognition guide dates by U.S. RECOGNITION and that Haiti's is **1862** against an independence of 1804 —
a 58-year gap, the widest in the deck. What makes the card possible is that the summary paragraph states
BOTH: *"Though it won independence from France in 1804, Haiti did not receive U.S. recognition until
1862."* So the gap is not an obstacle to be worked around but the card's whole subject, stated by the
American record about itself. **Where the guide names both dates, the DISTANCE between them is the fact**;
where it names only the recognition, C11's deferral still stands.

**AND THE MARKER CHECK CAUGHT A STRANDED CITATION IN THE GLOSSARY TERM, WHICH NOTHING ELSE WOULD HAVE.**
Trimming the term to the 110-word bar removed the World Bank's 2025 figure while leaving its
`data-fn="2"` marker on the sentence — `add-glossary.js` passed it, the source still being *referenced* and
the marker still inside the list, which is exactly L7's finding in its glossary form. The clause was
restored and the words taken from elsewhere. **After trimming a term to length, read each marked sentence
against the work it points at**; the length tools and the source tools each pass this fault on their own.
Note also that Security Council resolution 1908 (2010) does NOT contain the string *Port-au-Prince* — the
Kigali grep run and failed — so the earthquake sentence is written about Haiti, which is what the source
says.

**`gw-584` AMMAN IS THE SHORTEST GUIDE PAGE THE DECK HAS USED, AND IT IS STILL ENOUGH.** Four sentences:
Transjordan a mandated territory under British protection after the First World War, independence declared
with British agreement on 25 May 1946, American recognition in a White House announcement on 31 January
1949, and the legation at Amman established on 18 February 1949 with Wells Stabler as chargé. There is no
consular section, no treaty list and no later event. **A page this thin still yields a card when the dates
are ORDERED rather than merely listed** — independence, then a wait of nearly three years, then
recognition, then a legation three weeks later, then a UN seat six years after that. Harare and Conakry
were the same shape and each needed a second source to carry the second half; this one is carried by the
admission record and the two statistical sources alone.

**AND THAT ADMISSION IS THE PACKAGE DEAL, WHICH THE RECORD PAGE LETS YOU CITE WITHOUT OVERCLAIMING.**
General Assembly resolution 995 (X), 555th plenary meeting, 14 December 1955, is headed *"Admission of New
Members to the United Nations"* — plural — and its PDF is a 1956 scan with **no text layer**, so the list
of states cannot be read from here. The card says the admission came "not on its own" and names the
resolution's title, which is exactly what the record page supports; it does NOT say how many states, a
number every reference work gives and no cited source here does. **Where a scan cannot be read, cite what
the catalogue record states and stop** — the same discipline Senegal's and Guinea's admissions needed.
Note that Phnom Penh's UN date is the same day, from the same resolution.

**`gw-585` SANTO DOMINGO IS THE SECOND ABBREVIATED `world.js` KEY IN FIVE CARDS — `Dominican Rep.`** —
after `S. Sudan`, which makes the Juba finding a rule rather than a curiosity: **look the key up in
`world.js` before writing the card, not after `add-card.js` refuses it.** Its guide page answers C11's
Spanish-America warning the way Haiti's did, in the summary paragraph: independence from Haiti in 1844,
a reversion to Spanish rule in 1861, independence again in 1865, and American recognition in 1866. **A
state that won its independence twice needs both in the date line**, which is why this card's reads
*Independence / Regained* rather than one year.

**IT ALSO CONNECTS TO THE CARD TWO BEFORE IT, AND THAT IS A FACT ABOUT THE MISSION.** Relations were
established on 26 March 1884 with John M. Langston, who "was also accredited to Haiti and resident at
Port-au-Prince" — so for twenty years the United States dealt with this capital from ANOTHER capital, and
a legation was opened in the city itself only on 23 July 1904. That is C4's mission-elsewhere family with
both ends now carded (`gw-583` and `gw-585`), and it is the fourth shape that family has taken. **The
fifth source had to be found rather than assumed**: the card came back one short, and C11 records that the
World Bank's AREA series is outright wrong for this country (146,839 km² for 2019 against 48,671), so the
usual `AG.SRF.TOTL.K2` fallback is barred. **Security Council resolution 203 (1965)** supplied it —
1208th meeting, 14 May 1965, "deeply concerned at the grave events in the Dominican Republic", calling for
a strict cease-fire — which is also the UN's own record of what the guide alludes to when it says American
military occupations "have at times strained relations".

**`gw-586` ABU DHABI EXPLAINS THE WIDEST AREA GAP IN PHASE 3, AND THE ANSWER WAS IN A FOOTNOTE ALL
ALONG.** C5 deferred the UAE because UNdata's 71,024 km² sat 17% below the term's 83,600 with no second
source; D2 resolved it with the World Bank's 98,648, which puts the term between the two. Neither read
UNdata's **footnote b on that row: *"Land area only."*** The two bodies are not disagreeing — one is
measuring land and the other surface, on a country of shoals, sabkha and islands. **A UNdata figure that
looks wrong by a wide margin may be measuring something narrower, and the footnote says which**; this is
the third time in ten cards that a UNdata footnote has settled a question the fields alone could not, after
the Netherlands' and Benin's divided capitals and Burundi's orphaned one.

**IT IS ALSO THE EIGHTH RELAY BREAK, THE THIRD MISSION-ELSEWHERE CARD RUNNING, AND THE THIRD CHARTER PAIR
IN SIX.** `EN.URB.LCTY` gives 2,833,079 for 2019 against UNdata's 1,452,100 for the capital, because the
series counts **Dubai** — and here, unusually, the card CAN name the larger city, the recognition guide
listing Dubai among the seven sheikdoms; Sucre's could not. Stoltzfus, credentialed 20 March 1972, "was
also accredited to a number of other Persian Gulf states and he resided in Kuwait", with an embassy at Abu
Dhabi only on 24 June 1974 — Langston at Port-au-Prince and Heath at Saigon in the same shape. And the
admission is Security Council resolution 304 (1971), voted unanimously on 8 December, then General
Assembly resolution 2794 (XXVI) at the 2007th plenary on 9 December: **one week from declaration to
membership.**

**`gw-587` HAVANA IS THE FULLEST MISSION ARC IN THE GUIDE, AND EVERY STEP IS DATED AT THE CITY.**
Legation 27 May 1902, embassy 10 February 1923, relations severed 3 January 1961, an **Interests Section
under Swiss protection** from 1 September 1977, and an embassy again on 20 July 2015 on a date the two
presidents agreed by letters of 30 June. Phnom Penh's arc had five steps and Havana's has five with a
thirty-eight-year gap in the middle filled by something that was a mission without being called one — a
category no other card in the deck has met. **Where a guide page names an Interests Section, that is the
card**: it is city-level, precisely dated, and it explains a gap that would otherwise read as an absence.

**AND THE POPULATION IS FINE HERE, WHICH IS WORTH SAYING BECAUSE C11 SAID THE COUNTRY'S WAS NOT.** C11
found Cuba's national figure CONTESTED rather than stale — the term's 9.4 million against UNdata's 10,937
thousand, with the World Bank series never passing through 9.4 — and withheld a correction. That finding
is about the COUNTRY and does not travel to the capital: UNdata's 2,138.4 thousand for Havana and
`EN.URB.LCTY`'s 2,138,419 for 2019 are one number, the relay holding as usual. **A contested national
population does not imply a contested capital figure**, and the two are measured by different rows. Cuba's
area agrees within four square kilometres between UNdata and the World Bank, which is what let this card
reach the bar without a UN resolution.

**`gw-588` PRAGUE IS THE FIRST CAPITAL WHOSE HISTORY IS SET DOWN UNDER TWO COUNTRY HEADINGS, BECAUSE THE
STATE CHANGED AND THE CITY DID NOT.** `history.state.gov/countries/czechoslovakia` carries the consulate of
1869, the recognition of the Czecho-Slovak National Council in Paris on 3 September 1918, Crane's legation
of 11 June 1919 and its closure on 21 March 1939; `…/czech-republic` carries the Velvet Divorce and the
1 January 1993 recognition. **Where a capital outlived its state, look for BOTH pages** — the guide keeps
a retired country's entry and does not cross-reference it from the successor's. Two smaller slug facts go
with it: the Czechia page's slug is **`czech-republic`** (the page title says Czechia), which joins `burma`
and `cote-divoire` in the list of slugs that are not the country's current name; and the WTO's is
`czech_republic_e.htm`, whose page says "a WTO member since" rather than the usual "has been a member of
WTO since", so a grep for the usual phrasing finds nothing.

**AND UNdata AND THE EU AGREE EXACTLY ON THE AREA WHILE DIFFERING ON THE POPULATION — THE REVERSE OF THE
NETHERLANDS.** Both give 78,871 km² to the square kilometre; UNdata gives 10,609,000 people against the
EU's 10,909,500, a 2.8% gap, which is C1's finding that **UNdata is sometimes the outlier** seen again
four years on. The card states both figures rather than choosing, as Brussels does for its two areas.
**Where two official sources differ, say so and cite both**; the disagreement is a fact about the sources
and a reader is better served by seeing it than by being handed one number that looks settled.

**`gw-589` TEGUCIGALPA IS THE FOURTH SHAPE OF THE MISSION-ELSEWHERE FAMILY, AND THE GUIDE SAYS IT
OUTRIGHT.** The three already recorded are a mission accredited from another city (Bamako, Niamey,
Ouagadougou), an accreditation that moved while the mission stayed (Dakar), and a mission sitting in the
economic capital rather than the constitutional one (Cotonou). Honduras adds a fourth and the recognition
guide states it in as many words: Solon Borland, appointed on 19 April 1853 as minister to Honduras, Costa
Rica, Nicaragua and El Salvador at once, **"did not present his credentials in Tegucigalpa, though he was
accredited to Honduras"** — so the recognition of the state was marked by no ceremony in its capital at all,
and the first American minister actually to reside in the country was James R. Partridge, on 25 April 1862.
**The legation itself is named for TWO towns**, "Comayagua and Tegucigalpa", opened 22 February 1856: the
seat of government alternated between them through the nineteenth century, and the guide records the pair
rather than choosing. That is the divided-capital pattern of the Netherlands, Benin and Bolivia seen a
century earlier and since resolved, which is why it costs the deck no extra card. Two smaller things. **The
UNdata relay holds exactly here** — the capital-city population of 1,403.2 thousand for 2019 is
`EN.URB.LCTY`'s 1,403,162 to the person, Tegucigalpa being both the capital and the largest city — and the
areas agree within 2 km² (UNdata 112,492, the World Bank 112,490), so the card is at five sources with
nothing strained. And **the 23 March 1943 joint announcement raising seven American legations to embassies
now carries a third card**, after Haiti and the Dominican Republic; where a guide entry is thin on the
capital itself, that announcement is usually the last datable act it records.

**`gw-590` LISBON IS WHERE UNdata FINALLY SAYS WHAT `EN.URB.LCTY` MEASURES, AND IT IS NOT A CITY.**
Every capital card in this deck has leaned on the relay — UNdata's *Capital city pop.* usually equalling
the World Bank's *Population in largest city* to the person — and Portugal both confirms it and explains
it. The figure is 2,942.1 thousand against `EN.URB.LCTY`'s **2,942,097**, the same number; and UNdata's
footnote **c** defines it as **"Grande Lisboa, the Peninsula of Setúbal, and the municipality Azambuja"**,
a three-part statistical region, where the city of Lisbon itself is about a fifth of that. So the series
is the national statistical office's own largest-urban-unit definition relayed unchanged, and it is
published wherever that office publishes it — which is why a capital figure in this deck should be
labelled by its region rather than asserted as a city population. **Read the footnote letters on the
capital row, not just the number**: Portugal's carries **c** and **d** together, and **d is "2019"**, so a
column headed *(000, 2025)* is in fact a 2019 figure. The other divergence is between the two European
sources and is left standing rather than resolved: UNdata gives the country 10,412 thousand and the EU
country page gives Eurostat's **10,749,635**, about 3 per cent apart, so the card states both and names
each. The areas agree — 92,226 km² at UNdata and on the EU page, 92,230 at the World Bank.

**AND THE RECOGNITION GUIDE ADDS A FIFTH MISSION-ELSEWHERE SHAPE: THE MISSION LEFT THE CONTINENT.** The
four already recorded all keep the mission somewhere in the region — accredited from a neighbouring
capital, an accreditation that moved while the mission stayed, a mission in the economic capital, a
minister who never presented his credentials in the capital at all. Portugal's is larger than any of
them: the legation was established at Lisbon on **13 May 1791**, the day the credentials of David
Humphreys were accepted — Portugal being "the first neutral nation to establish diplomatic ties with the
United States" — and then, when the King fled to Brazil during the Napoleonic Wars, **the legation
followed him and sat at Rio de Janeiro from 1810 until it closed in July 1821**, returning with him to
Lisbon in 1822. A capital's mission history can therefore run for eleven years on another continent, and
the guide records the whole of it under the country rather than the city.

**`gw-591` DUSHANBE IS THE POST-SOVIET SHAPE OF A GUIDE ENTRY, AND IT IS SHORT BY DESIGN.** Where a
Latin American or European entry runs to consulates, legations and relocations, a former Soviet republic's
has three lines and every one of them is a date in the same four months: recognition on **25 December
1991**, "when President George H.W. Bush announced the decision in an address to the nation regarding the
dissolution of the Soviet Union"; relations on **19 February 1992**, by a press statement from the same
president; and the embassy at Dushanbe on **13 March 1992** under Edmund McWilliams as chargé d'affaires ad
interim. There is no earlier consulate to record and no legation, because the state has no diplomatic
history of its own before 1991 — so the entry is thin and complete rather than thin and unhelpful, and it
still names the capital outright, which is what the card needs. **Expect the same four-line shape for the
other post-Soviet capitals still to be written**, and expect the recognition date to be the single day the
Soviet Union dissolved rather than anything about the country in question. Two things beside it. **The
relay holds exactly** — UNdata's 893.8 thousand for 2019 is `EN.URB.LCTY`'s **893,826** — and the areas
agree within 21 km² (141,400 against 141,379), so the card reaches five sources on the guide, UNdata, the
two World Bank series and the WTO with nothing strained. And the WTO date is worth checking rather than
assuming: Tajikistan acceded on **2 March 2013**, the same date of the year as its United Nations seat of
2 March 1992, which reads like a slip and is what both sources say.

**`gw-592` PORT MORESBY IS THE MISSION-ELSEWHERE FAMILY SEEN FROM THE RECEIVING END.** Every shape
recorded so far describes a capital whose American mission sits somewhere else; Papua New Guinea's is the
inverse, and the guide states it plainly: "the Ambassador to Papua New Guinea has also been accredited to
the Solomon Islands and Vanuatu, and the Ambassador has remained resident at Port Moresby." So one city
holds the mission for three states — **which means the Honiara and Port Vila cards, still to be written,
will each be a mission-elsewhere entry pointing back here**, and the guide's own Solomon Islands and
Vanuatu pages are worth checking against this one when they are. The entry also has a shape worth naming
in its own right: **the consulate became the embassy, under the same officer.** Mary S. Olmsted opened the
first American consulate in the then self-governing Territory of Papua and New Guinea "on or about July 1,
1974", and on **16 September 1975** — the day the United States recognised the new state, at the
independence ceremonies, by a letter from President Ford carried by the Governor of Iowa — that consulate
general was raised to an embassy with Olmsted in charge as ambassador-designate. A recognition, a
diplomatic establishment and a promotion on one date, in one building.

**AND A COMMONS THUMBNAIL BELOW THE ORIGINAL'S WIDTH CAN STILL 400.** The rule recorded so far is that no
thumbnail exists at or above an original's width; this file is 1,229px wide and **1200 and 1000 both
answer 400 while 960 answers 200**, so the ladder of generated widths is not continuous. The working rule
is therefore to **test the exact URL you intend to ship** rather than to reason from the original's
dimensions — and to fall back down the standard ladder (1280, 960, 800) rather than trying arbitrary
widths.

**`gw-593` STOCKHOLM TURNS LISBON'S FINDING INTO A RULE, AND THEN BREAKS THE AREA RULE.** Lisbon showed
UNdata's capital-city footnote defining the figure as a three-part statistical region; Sweden's defines it
as **"tätort" (according to the administrative divisions of 2005)** — the Swedish statistical locality —
and again it equals `EN.URB.LCTY` to the person (1,608.0 thousand against **1,608,037**). Two published
definitions of two different kinds, both relayed unchanged, settle it: **the World Bank's largest-city
series is whatever the national statistical office calls its largest urban unit, and UNdata's footnote is
where that definition is written down.** Read the footnote before calling a capital figure a city
population.

**AND `AG.SRF.TOTL.K2` IS NOT ALWAYS A SECOND OPINION ON THE SAME QUANTITY.** C9 established it as the
tie-breaker when UNdata's area looks wrong, and C11 recorded that it contains outright errors. Sweden is
neither case and is worse for being neither: **UNdata gives 438,574 km², Eurostat 447,424 and the World
Bank 528,860** — 20 per cent above UNdata — and the indicator's own `sourceNote`, which the API returns,
says why: *"Surface area is a country's total area, including areas under inland bodies of water and some
coastal waterways."* For a country with a large archipelago and territorial sea that is a different
measurement, not a disagreement about the same one. So: **fetch the indicator's `sourceNote` before
treating the two as comparable**, and where they are not, say so in the card rather than picking a winner —
this one states all three figures and names each source. `AG.LND.TOTL.K2` (Sweden 407,280) is the land-only
series if a like-for-like figure is ever wanted.

**Its guide entry also runs the other way round.** Every recognition entry so far records the United States
recognising somebody; Sweden's records **Sweden recognising the United States**, on 3 April 1783 by signing
the Treaty of Amity and Commerce at Paris, on an approach from the Swedish minister there who hoped it
would be remembered that "Sweden was the first power in Europe which had voluntarily and without
solicitation offered its friendship to the United States". Franklin negotiated it without ever going to
Sweden. Relations proper began on 29 April 1818, and Jonathan Russell resided at Stockholm as minister **to
the court of Sweden and Norway, "which were not then separate countries"** — one more shape for the mission
family: a single residence accredited to a union of two crowns.

**`gw-594` ATHENS IS THE THIRD PUBLISHED DEFINITION IN THREE CARDS, AND THE FIRST CAPITAL WHOSE
GLOSSARY TERM ALREADY EXISTED.** UNdata's footnote here reads **"Refers to the localities of Calithèa,
Peristérion and Piraeus, among others"** — an agglomeration named by its component localities, where
Portugal's named a set of regions and Sweden's named a national statistical concept — and again the figure
matches `EN.URB.LCTY` to the person (3,154.2 thousand against **3,154,152**). Three definitions of three
different kinds settle the rule beyond argument: **the World Bank's largest-city series is the national
statistical office's own urban unit, whatever that office has chosen it to be, and UNdata's footnote is
where it is written down.** Do not describe such a figure as a city population without reading the
footnote first.

**And this card wrote no glossary term, because `Athens` has been in the glossary since the Ancient Greece
collection and is already at the bar with five sources.** The pairing rule is satisfied by a term that
already exists, so the work is to CHECK rather than to write — and the checking matters, because
`add-glossary.js` would have replaced that five-source entry with a three-sentence one and said only
"updated". What the term did lack was a picture, and a picture is ADDED to an existing entry with
**`add-images.js`**, which writes the `GLOSSARY_IMAGES` row and touches nothing else. **Look the term up
before writing one**, and reach for `add-images.js` rather than `add-glossary.js` when the only thing
missing is the illustration.

**Its guide entry is Portugal's wartime twin, and the plural accreditation at its extreme.** The legation
at Athens **closed on 14 July 1941** under the German occupation; the mission followed the Greek government
to London, where Anthony J. Drexel Biddle, Jr. was "also commissioned to the exile governments of Belgium,
Czechoslovakia, Luxembourg, the Netherlands, Norway, Poland, and Yugoslavia" — **eight governments at once,
against Port Moresby's three states** — then to Cairo, and back to Athens on **27 October 1944**. So the
mission-elsewhere family now has a wartime branch beside Portugal's Napoleonic one, and the two are the
same shape: the mission is accredited to a government, not to a city, and goes where that government goes.
The recognition itself is worth reading for its own sake: asked in 1833 by Britain, France and Russia to
acknowledge Otto of Bavaria as King of Greece, the United States sent a reply the guide itself calls
ambiguous, and recognition proper waited until **7 November 1837**.

**`gw-595` BAKU MAKES IT FOUR DEFINITIONS IN FOUR CARDS, AND ADDS A SECOND KIND OF FOOTNOTE ENTIRELY.**
Azerbaijan's capital-city footnote reads **"Including communities under the authority of the Town
Council"** — an administrative jurisdiction, after Portugal's list of regions, Sweden's national statistical
concept and Greece's list of localities — and the figure again equals `EN.URB.LCTY` to the person (2,313.1
thousand against **2,313,138**). Four kinds, four cards, no exceptions: **read the footnote letters on the
capital row every time.** What is new here is a footnote on the COUNTRY row rather than the capital one:
UNdata's national population of 10,398 thousand carries footnote **b, "Including Nagorno-Karabakh"** — the
profile stating what territory its own count covers, which is the same service the capital footnote
performs one line down. **A country footnote can be a statement about disputed territory**, so read those
letters too, and where one says so the card should say so rather than quoting the figure bare.

**Its guide entry confirms the post-Soviet prediction made at Dushanbe, and refines it.** The three dated
lines are the same three to the letter — recognition **25 December 1991** by the address on the dissolution
of the USSR, relations **19 February 1992** by a press statement, the embassy at Baku **16 March 1992**
under a chargé d'affaires (Dushanbe's was 13 March under McWilliams, three days earlier). What Dushanbe's
lacked is a **Summary paragraph carrying a pre-Soviet independence**: Azerbaijan's records a state "de
facto recognized by the Allies in January 1920" whose independence ended "when the Red Army arrived in
April of that year". **So the four-line shape holds and the Summary is where anything older lives** —
worth reading on the remaining post-Soviet capitals rather than skipping to the dated sections.

**Two smaller things. The WTO has an ACCESSIONS page as well as a members page**, and it is the source to
reach for when a country is not a member: `wto.org/english/thewto_e/acc_e/a1_<country>_e.htm` gives the
date its working party was established (Azerbaijan's, 16 July 1997), which is a datable fact where the
members page is a 404 — **and the members-page 404 REDIRECTS to `/error/error_404.htm` with a 200 at the
end of the chain**, so follow redirects and read the effective URL rather than trusting the status. And a
Commons file named for a city and a year can be a **photo-contest poster**: `Baku_2020.jpg` is a competition
entry with four society logos, a photographer's name set in the margin and a URL across the foot — a
watermarked composite rather than a photograph of anywhere.

**`gw-597` BUDAPEST IS THE FIRST CAPITAL WHOSE OWN NAME CHANGES INSIDE THE GUIDE ENTRY, AND THE GUIDE
IS CAREFUL ABOUT IT.** Every mission shape recorded so far moves the mission — to another city, another
country, another continent. This one holds the mission still and moves the CITY: the first American post
in the Kingdom of Hungary was "a Consular Agent … appointed in **Pesth**" in 1869, a consul followed in
1874, and "those appointed after 1888 were accredited to **Budapest**". Buda, Pest and Óbuda had been
united in the meantime, and the guide records the two names against their own dates rather than
back-dating the modern one. **Read a pre-1900 consular line for the name it actually uses**; where the
guide names a place the card's answer term does not, that is usually a real change in the city rather
than an error.

**Its recognition date is late for a reason worth stating: the United States ratified neither treaty.**
Hungary's independence from Austria was recognised by the Treaty of St-Germain of 10 September 1919 and
its borders drawn by Trianon on 4 June 1920, and the guide records that the United States ratified
neither — so the state of war with the former Austro-Hungarian Empire was ended by a **Joint Resolution
of Congress on 2 July 1921**, a treaty of friendly relations was signed that August, and the legation at
Budapest opened on **26 December 1921**. **A recognition date that trails the independence by two years
is not always a slow decision; sometimes it is a ratification that never happened.**

**Two smaller things.** Hungary was a party to the **GATT from 9 September 1973**, while (in the guide's
own words) its foreign policy "was generally aligned with that of the Soviet Union" — so the WTO members
page is worth fetching even for a Warsaw Pact state. And its UN seat of **14 December 1955** is the same
date as Portugal's at `gw-590`: the sixteen-state package admission of that day turns up repeatedly in
this deck, so **a 14 December 1955 membership date is a fact about the Cold War deadlock rather than
about the country**, exactly as C9 recorded for Libya's 1955 admission.

**`gw-598` VIENNA IS THE FIRST GUIDE ENTRY THAT SIGNPOSTS ITS OWN SPLIT, AND IT CONFIRMS BUDAPEST'S
FINDING FROM THE OTHER SIDE.** Austria's page opens with a note the deck has not met before — *"This entry
is for the modern state, the Republic of Austria. Please click here for information on the Austrian
Empire"* — so where Prague needed two entries found by hand (`czechoslovakia` and `czech-republic`, the
state changing while the city did not), **Austria's page tells you the other one exists.** Read the opening
note before assuming an entry covers the whole of a capital's history: the guide splits by STATE, and it
says so when it does.

**And the same Joint Resolution appears on two cards.** Budapest's entry dated Hungary's recognition to
the Joint Resolution of Congress of **2 July 1921** ending the state of war with Austria-Hungary; Austria's
entry cites that identical resolution as "opening the way" for its own relations, and then dates
recognition to the **Treaty Establishing Friendly Relations signed at Vienna on 24 August 1921** — five
days before Hungary's equivalent treaty. So one American act unlocked two recognitions, and the guide
dates each to the instrument that country actually signed. **When two entries share a paragraph, check
which date each one hangs its recognition on**; they need not be the same.

**Its UN seat is 14 December 1955 for the third card running** (after Portugal at `gw-590` and Hungary at
`gw-597`), and Austria is the case that explains the pattern rather than merely joining it: the guide
records the **Austrian State Treaty of 15 May 1955**, which ended the four-power occupation and declared
the country "free, independent, and neutral", seven months before the package admission. **A 14 December
1955 date is the Cold War deadlock breaking, and the reason it broke is on some of these pages.** The
Vienna entry also carries the closure sequence in full — the legation shut on **30 April 1938** after the
Anschluss and became a consulate general, which closed on **9 July 1941** with every other American
consulate in Germany — which is the mission-elsewhere family's opposite: the mission does not move, it is
demoted and then extinguished.

**`gw-599` MINSK IS WHERE C3'S UN-MEMBERSHIP WARNING BECOMES A CARD'S OWN SENTENCE.** C3 recorded that
the UN membership date does not date independence for the Soviet founding republics — Belarus and Ukraine
both show **24 October 1945** because Byelorussia and Ukraine held seats in their own right — and Belarus
is where the gap is widest and most likely to mislead: the guide dates independence from the Soviet Union
to **25 August 1991**, 46 years later. The card states both figures and says outright that the membership
date is not when the present state began, which is the honest way to carry a trap the deck has already
met. **Where a UN date predates a state's own independence, say so in the prose rather than leaving two
numbers to contradict each other.**

**The post-Soviet shape has a variant, and a fifth line.** Tajikistan and Azerbaijan both separate
recognition (25 December 1991) from relations (19 February 1992); **Belarus has both on the same day**,
25 December 1991, in the same address. And its entry carries something the other two lack after the
embassy line: **"American Ambassador Recalled, 2008"** — the ambassador withdrawn on 12 March after a
threat of expulsion, Belarus recalling its own, and each mission cut to five diplomats. So the four-line
shape is a floor rather than a template: **read to the end of a post-Soviet entry**, because a rupture
after the establishment is recorded there and nowhere else the deck uses.

**Its capital footnote repeats Baku's word for word** — "Including communities under the authority of the
Town Council" — which refines the four-definitions finding: **the kinds are not per-country inventions but
recur across profiles**, presumably because the statistical convention is shared. Two smaller notes. The
WTO accessions route paid a second time (Belarus' working party, **27 October 1993**), and its French-slug
guess `a1_bielorussie_e.htm` redirected to the 200-status error document — **the accession slugs are
English**. And a Commons picture can fail on TONE as well as subject: `Belarus-Minsk-View from above-1.jpg`
is a good wide view of the modern city in **monochrome**, which on a card about a present-day capital reads
as a historical photograph; it was refused on that alone.

**`gw-600` BERN IS THE CLEANEST DEMONSTRATION YET THAT `EN.URB.LCTY` IS NOT A CAPITAL'S POPULATION,
AND THE INDICATOR SAYS SO ITSELF.** The relay has held on every card since Tegucigalpa and it breaks here
by more than three times: UNdata gives the capital **426 thousand** for 2019 and `EN.URB.LCTY` returns
**1,383,092** for the same year, because Bern is not Switzerland's largest city. Fetch the indicator's own
`sourceNote` and it settles the matter in one line — *"Population in largest city is the urban population
living in the country's largest metropolitan area"* — which is what makes the earlier agreement a
coincidence of the capital ALSO being the largest city rather than a property of the series. **Check that
the capital is the largest city before quoting the World Bank figure for it**; Quito, Porto-Novo, Sucre and
Abu Dhabi were the earlier breaks and this is the one to cite, since the definition is published. (Both
World Bank sourceNotes have now paid: `AG.SRF.TOTL.K2`'s explained Sweden's 20 per cent area gap and this
one explains Bern's threefold population gap. **Fetch `api.worldbank.org/v2/indicator/<code>?format=json`
before treating any two series as comparable.**)

**And the recognition guide never names the capital.** Grepped, Switzerland's entry contains "Bern" zero
times and "Basel" twice: recognition is dated to the appointment of **John Godfrey Boeker as consul general
at Basel on 30 November 1829**, and the legation of **29 June 1853** is recorded as established "in
Switzerland" rather than in a city. That is C7's rule in its strongest form — where the guide has nothing
to say about the capital, do not stretch it — so this card's second block is about the state's relations
and says plainly that the record names no Swiss capital. **Grep an entry for the capital's name before
planning a block around it.** Two smaller things: the entry hedges its own recognition date ("appears to
have been"), which is rare enough to be worth quoting; and Switzerland's **UN seat of 10 September 2002**
is the latest date the deck has met, which the card states plainly rather than ranking against its
siblings.

**`gw-601` FREETOWN IS THE THIRD CONSULATE-BECOMES-EMBASSY ENTRY, AND THE PATTERN IS NOW PREDICTABLE
FOR A BRITISH COLONY.** Port Moresby's consulate general became the embassy on independence day under the
same officer; Freetown's did the same on **27 April 1961** under Herbert Reiner, Jr.; Tegucigalpa's
legation was opened for two towns at once. The colonial shape is the first of those: **where the United
States kept a consulate in a colony, independence is a change of RANK rather than an opening**, so a card
for such a capital should say the mission was already there. Expect it again at Lomé, Accra, Nairobi and
the rest of the British and French African capitals still to be written.

**Its recognition instrument is dated the day BEFORE the recognition.** The guide says the United States
"recognized Sierra Leone when it became independent on April 27, 1961, in a congratulatory message from
President John F. Kennedy … **dated April 26, 1961**". Both dates are in one sentence and they are one day
apart, which is what a message written to arrive on the day looks like. **Read a recognition sentence for
two dates rather than one**; the card's date line carries both, and neither is wrong.

**Two figures worth recording.** The relay holds exactly (UNdata 1,168.4 thousand against `EN.URB.LCTY`'s
**1,168,424**), and here the capital IS the largest urban area, which is the condition Bern showed to be
doing all the work. And the areas divide two against one: UNdata and the World Bank both give **72,300
km²** where the Commonwealth Secretariat gives **71,740**, a 0.8 per cent gap — inside the spread C9's rule
tolerates, so the card states the majority figure and names the third rather than correcting anything.

**`gw-602` LOMÉ CONFIRMS THE FREETOWN PREDICTION ON THE VERY NEXT CARD, AND WIDENS IT BEYOND THE
BRITISH EMPIRE.** The consulate-becomes-embassy pattern was recorded as a British-colony shape; Togo was
**French**-administered, and the guide says the same thing in the same words — "the American consulate at
Lomé was raised to Embassy status" on **27 April 1960**, with Jesse M. MacKnight as chargé d'affaires ad
interim. So the rule is about a CONSULAR PRESENCE rather than about which empire held the territory:
**wherever the United States kept a consulate in a dependency, independence is a change of rank**. Two
details worth carrying. Togoland was a **United Nations trust territory** under France rather than a
plain colony, which is the same standing the guide gives Papua New Guinea's northern half — so the
trusteeship route recurs and is worth naming in the prose, since a trusteeship ending is not a colony
being released. And Togo's independence day, 27 April 1960, is the same date of the year as Sierra Leone's
at `gw-601`, one year apart; a coincidence, but one that makes the two cards easy to confuse when writing
them back to back.

**UNdata has a FIFTH kind of footnote: a methodological note that dates its own revision.** After a list
of regions (Portugal), a national statistical concept (Sweden), a list of localities (Greece) and an
administrative jurisdiction (Baku, Minsk), Togo's country population carries this: *"Results obtained from
an interim update of Togo's population estimates and medium variant projections released on 19 January
2026 … more detailed results from the Togo general population and housing census 2022."* That is the
profile telling you WHEN its figure changed and WHY — which is exactly what a card correcting an older
number needs, and it is why C7's correction of this term to 8.6 million now agrees with the profile
exactly. **Read the country-row footnotes for a revision note before deciding a figure is stale.**

**And the thumbnail rule is confirmed as untestable in the abstract.** Port Moresby recorded that a width
BELOW the original's can 400; here the original is exactly 1,280px wide and the **1280 thumb answers 200
while 1024 answers 400** — the opposite way round. The only rule that survives both is the one already
written: **test the exact URL you intend to ship.**

**`gw-603` VIENTIANE HAS THE FULLEST RANK HISTORY THE DECK HAS MET, AND IT COMPLETES THE SET.** Vienna's
legation was demoted to a consulate general and then extinguished; Belarus's ambassador was recalled and the
mission cut; Port Moresby's, Freetown's and Lomé's consulates were promoted. Laos has a mission that goes
**up, down and up again in one place**: a legation at Vientiane on **22 August 1950**, an embassy by joint
announcement on **10 August 1955**, the head of mission downgraded from ambassador to chargé d'affaires ad
interim after the Lao People's Democratic Republic was founded in December 1975, redesignated chargé
d'affaires in 1987, and an ambassador posted again only on **6 August 1992**. **A mission's rank is a
readable record of the relationship**, and where an entry gives four rank changes the card should carry the
shape rather than only the opening date.

**It also holds both halves of the mission-elsewhere family at once.** The consular officers at Vientiane
"had multiple postings and were also assigned to Saigon, Vietnam, and Phnom Penh, Cambodia", and the
minister who established relations on 29 July 1950, **Donald R. Heath, was accredited to Cambodia and
Viet-Nam as well and was resident at Saigon** — so at the same moment the city had a resident consul serving
three countries and a non-resident minister living in a fourth capital. Heath is already recorded here for
Phnom Penh; **when a guide names a minister resident elsewhere, expect his name on the neighbouring capitals'
cards too**, and check their entries against each other rather than writing each from scratch.

**Two smaller notes.** Laos's UN seat of **14 December 1955** is the fourth on that date after Portugal,
Hungary and Austria — and the first outside Europe, which is what a package admission looks like from the
other side of the world. And the WTO slug is the STATE'S OWN SHORT NAME: `laos_e.htm` and `lao_pdr_e.htm`
both redirect to the 200-status error document, while **`lao_e.htm`** serves the page (member since 2
February 2013).

**`gw-605` ASHGABAT IS BUDAPEST'S NAME-CHANGE FINDING IN A SECOND FORM, AND THE GUIDE AGAIN SIGNPOSTS
IT.** Budapest showed the guide recording a city under two names against their own dates, because the town
had been merged; Turkmenistan's shows the same care about a **TRANSLITERATION**, and inline: the heading
reads "Establishment of the American Embassy in **Ashkabad (now Ashgabat)**, 1992". So a post-Soviet
capital's entry may carry the Russian-era spelling with the current one in brackets — **grep an entry for
BOTH spellings before concluding it does not name the capital**, which is the failure Bern's card was
written around. Two structural notes from the same page: its **"Consular Presence" heading has nothing
under it**, so a heading in this guide does not imply content, and the post-Soviet four-line shape holds
for a fourth time (recognition 25 December 1991, relations 19 February 1992, embassy **17 March 1992**),
with the three Central Asian and Caucasus embassies opening within four days of each other — Dushanbe the
13th, Baku the 16th, Ashgabat the 17th.

**Its fifth source is a General Assembly resolution, and the UN Digital Library route is worth writing
down.** Turkmenistan's permanent neutrality was recognised by **A/RES/50/80A of 12 December 1995, adopted
without a vote** — a datable act of exactly the kind C3's rule looks for, and the only one this entry's
thin guide page could not supply. Search `digitallibrary.un.org/search?p=<symbol>&ln=en`, then read the
RECORD ids out of the HTML **beside the title you want**: a compound symbol like 50/80 returns the parent
resolution and both parts (202725, 284240, 284241), and only the middle one is Turkmenistan's. The record
page states the symbol, the meeting record, the committee report and "ADOPTED WITHOUT VOTE" outright.

**And a satellite scene can be named simply `<City>, <Country>.jpg`.** `Ashgabat, Turkmenistan.jpg` is a
NASA-style orbital image with nothing in its name to say so — the SPACEBORNE filter recorded in this plan
keys on words like Landsat and Sentinel and cannot see this one. **Look at the picture; the filename is
not evidence.**

**`gw-606` TRIPOLI HAS THE LONGEST AND MOST BROKEN MISSION HISTORY IN THE DECK, AND ITS EMBASSY IS
CURRENTLY IN ANOTHER COUNTRY.** Vientiane's rank went up, down and up in one place; Libya's mission has
been opened, closed by war, reopened, raised, closed for 26 years without relations being severed,
rebuilt as an interests section inside the **Belgian** embassy and then a liaison office, raised again in
2006, suspended in 2011, resumed, suspended again on 26 July 2014 — and **since March 2015 it has worked
from Tunisia as the "Libya External Office in Tunis"**. That is the mission-elsewhere family's live
instance: not a nineteenth-century accreditation but a present arrangement, and the guide states it in
the present tense. **Read a guide entry to its last paragraph before describing where a mission is**;
several of these entries end on an arrangement still in force.

**And it is the SECOND reversed recognition, after Sweden.** Sweden recognised the United States in 1783;
"the United States was recognized by **Tripoli** in 1796", by a peace treaty signed in the city on 4
November — with the same guide recording that the treaty was also signed by the Dey of Algiers, whose
claimed authority over Tripolitan affairs the Pasha denied. So the reversed-recognition shape is a
pattern rather than a curiosity, and both instances are pre-1800: **expect it wherever the United States
was the new state**.

**Its UN seat of 14 December 1955 is the fifth on that date** — after Portugal, Hungary, Austria and Laos
— and Libya is the case C9 already flagged, since it declared independence on **24 December 1951**, four
years earlier. Two figure notes. The area gap C7 deferred on and C9 resolved is confirmed here and left
standing in the prose: **1,676,198 km² at UNdata against 1,759,540 at the World Bank**, 5 per cent apart,
each named. And the relay holds exactly (1,160.9 thousand against **1,160,918**).

**A picture note worth keeping: when `Special:FilePath` 429s and will not clear, `w/thumb.php` still
serves.** Three attempts at `Special:FilePath/<file>?width=900` returned the 2,256-byte rate-limit
document over a minute apart; `commons.wikimedia.org/w/thumb.php?f=<FILE>&width=900` answered 200
immediately. Both routes are already recorded in CLAUDE.md — this is the first time the fallback has been
the only one that worked.

**`gw-607` BISHKEK IS WHERE THE RECOGNITION GUIDE IS CAUGHT CONTRADICTING ITSELF, AND THE PROSE IS THE
AUTHORITY.** Its entry is headed **"Establishment of the American Embassy in Bishkek, 2004"** and the
sentence beneath it reads "was established on **February 1, 1992**". The heading year is twelve years out
and nothing else on the page supports it; the 1992 date fits the Central Asian batch exactly (Bishkek 1
February, Dushanbe 13 March, Baku 16 March, Ashgabat 17 March). **Read the sentence, not the heading** —
this guide's section headings have already been shown to carry a city's old name beside its new one, and
here one carries an outright wrong year. Where a card takes a date from this source, take it from the
prose.

**And the same officer opened two of these embassies.** Edmund McWilliams was chargé d'affaires ad interim
at Bishkek on 1 February 1992 and at Dushanbe on 13 March 1992 — six weeks apart, in two countries. That
is Vientiane's rule paying: **read the neighbouring capitals' entries against each other**, because the
post-Soviet openings were carried out by a small number of people and the connection is visible only
across pages. Note that a card making that connection needs BOTH pages in its source list; this one cites
Tajikistan's guide entry as its sixth source rather than resting the claim on Kyrgyzstan's.

**Two smaller notes.** Kyrgyzstan takes the Belarus variant of the post-Soviet shape — recognition and
relations on the same day, **25 December 1991** — and its entry has no consular section at all, which is
the floor for a state with no diplomatic history of its own before 1991. And the WTO files it under its
formal name: `kyrgyzstan_e.htm` and `kyrgyz_e.htm` both redirect to the 200-status error document while
**`kyrgyz_republic_e.htm`** serves (member since **20 December 1998**). That is the second slug of this
shape after Laos's `lao_e.htm`, and the rule they share is that **the WTO's slug follows the name the
member joined under, not the name in common use.**

**`gw-608` ASUNCIÓN IS C12's SUMMARY-PARAGRAPH RULE WORKING EXACTLY AS WRITTEN, AND THE WIDEST
RECOGNITION GAP THE DECK HAS MET.** C11 found the recognition guide unusable for Spanish American
independence dates; C12 refined that to "read the summary paragraph", and Paraguay's opens **"Paraguay
declared its independence from Spain on May 15, 1811"** — the date nowhere in the Recognition section,
which gives **27 April 1852**, forty-one years later. Grepping the page confirms it: `1811` appears once,
in the summary. **The two dates belong in the same card and neither is the other**, which is what the date
line here carries.

**And the recognition itself was performed from another capital.** It was made "by the issuance to John
M. Pendleton, **Chargé d'Affaires at Buenos Aires**, of a full power to negotiate a treaty of commerce" —
so the mission-elsewhere family reaches the act of recognition itself, not merely the mission's residence,
and no American mission stood in Asunción for another nine years, until the legation of **26 November
1861**. Its embassy came by a **bilateral joint announcement of 4 January 1942**, raising both countries'
legations at once — the same instrument family as the 23 March 1943 seven-republic announcement already
recorded, but for two states rather than seven.

**Its capital footnote is a sixth kind: a district list naming a whole department.** *"Refers to the
district of Asunción and the 19 districts of Central Department"* — closest to Greece's list of localities
but naming an administrative department wholesale, and the figure it produces is startling: **3.28 million
against a national 7.0 million**, so nearly half of Paraguay lives inside the capital's statistical area.
`EN.URB.LCTY` returns 3,279,160 for the same year, the relay holding to the person. **Where a footnote
sweeps in a department, expect the capital figure to be a large fraction of the country** and say so
rather than letting the number pass as a city.

**Two picture notes.** A Commons file can be credited to **"Anonymous / Unknown author"** under a licence
that requires attribution — `Asunción Paraguay.jpg` is CC BY-SA 4.0 with no nameable author — which makes
it unusable here whatever its size, since Folio's credit line has nobody to name. And of the six Asunción
candidates looked at, three were under the 900px bar; **a smaller capital's Commons coverage is thinner
and the size check does most of the rejecting.**

**`gw-609` MANAGUA CONFIRMS THE BISHKEK HEADING FAULT IS NOT A ONE-OFF, WHICH SETTLES IT AS A RULE.**
Bishkek's entry is headed "…Embassy in Bishkek, **2004**" over a sentence giving 1992; Nicaragua's is
headed **"Legation Raised to Embassy, 1942"** over a sentence giving **27 March 1943**. Two wrong heading
years on two unrelated pages is a property of the source rather than an accident, so the rule stands
without qualification: **take a date from the guide's prose, never from its section heading.** (The 1943
date also sits four days after the 23 March 1943 seven-republic joint announcement this deck has cited
three times, which is what makes the heading's 1942 look plausible enough to slip past.)

**And C11's Nicaragua deferral can be closed without D3's El Salvador workaround.** C11 deferred this
country because the guide dates recognition through the Federation (4 August 1824) and gives no 1821
independence — confirmed here, since **`1821` appears zero times on the page**. But the entry supplies its
own sequence, and it is enough for a card: Nicaragua joined the Federation in **1823**, **withdrew on 5
November 1838**, and was recognised separately on **24 December 1849** when Polk received the chargé
d'affaires Eduardo Carcache. **Where a Spanish American page will not date the 1821 declaration, date the
WITHDRAWAL instead** — it is on the page, it is what made the state separate in this record's own terms,
and it needs no citation borrowed from a neighbour.

**Its mission history is the second-most broken in the deck, after Tripoli's.** Relations severed by the
United States on **1 December 1909** and re-established on **21 February 1911**; a refusal in 1926 to
recognise a government that had taken power by force, with recognition of its successor that November;
and a second severance in 1947. Three ruptures on one page, all from the same side. **A Central American
entry is worth reading past the recognition section** — the interesting dates are usually below it.

**`gw-610` BELGRADE GIVES THE COUNTRY-ROW FOOTNOTE ITS OPPOSITE, AND THE PAIR IS THE POINT.** Baku's
national population carried **"Including Nagorno-Karabakh"**; Serbia's carries **"Excluding Kosovo"**. The
same field, on two profiles, states an inclusion and an exclusion — so a country-row footnote letter is
not an occasional curiosity but the place UNdata says what territory its count covers, in either
direction. **Read it and say which**, since the figure is otherwise indistinguishable from one that covers
everything.

**Its capital footnote is a seventh kind and the vaguest yet: "Refers to the urban population of Belgrade
area."** After a list of regions, a national statistical concept, a list of localities, an administrative
jurisdiction (twice) and a whole department, this one names no unit at all — and the relay still holds to
the person (1,393.7 thousand against **1,393,717**), which is the strongest evidence yet that the two
series are one number relayed rather than two measurements agreeing.

**And `AG.SRF.TOTL.K2` does not sit still within a single request.** Serbia returns **88,360 for 2019 and
84,990 from 2020 onwards** — a step of nearly 4 per cent inside the seven-year window, with no note
attached. C11 recorded outright errors in this series and D3 recorded an unexplained drift on Mexico; this
is the sharpest instance, a single-year jump rather than a slow slide. **Fetch the series across the whole
window rather than one year, and if it steps, say so in the prose and name the years** — this card gives
UNdata's 88,444 as the figure and reports both World Bank values against it.

**Serbia is also the second entry to signpost its own split, after Austria** — "Please click here for
information on the Kingdom of Serbia and the Socialist Federal Republic of Yugoslavia" — and it is the
first where ONE link covers two earlier states. Its dates are worth having as a set, because they are all
recent: the ambassador recalled from Belgrade on **21 May 1992** with the mission left open under a
chargé, relations severed and the embassy closed on **23 March 1999**, full relations and recognition by
an exchange of letters dated **12 November 2000**, the embassy reopened in May 2001. The UN membership
date of **1 November 2000** falls eleven days before that recognition.

**`gw-611` SOFIA IS THE FIRST CARD WHERE RELATIONS PRECEDE RECOGNITION BY YEARS, AND THE ORDER IS
NOT A SLIP.** The recognition guide dates American relations with Bulgaria to **19 September 1903** and
American recognition of it to **3 May 1909** — five and a half years the wrong way round on every other
card in the deck — because Bulgaria was an autonomous Ottoman principality in 1903 and did not declare
its independence until **5 October 1908**. The 1909 note congratulates Tsar Ferdinand "upon the admission
of Bulgaria to the community of sovereign and independent States", which is the guide saying outright
that the earlier date was relations with something less than a state. **Where a guide page carries both
dates in that order, read what the polity WAS at the earlier one** rather than assuming the page has
mislabelled a section.

**AND THE EARLY MINISTERS WERE ACCREDITED FOUR WAYS AT ONCE, WITH THE FIRST NEVER PRESENTING CREDENTIALS
AT ALL.** John B. Jackson opened relations in 1903 as Minister to Greece, Romania and Serbia as well as
Bulgaria, and of the first agent (Charles M. Dickinson, 1901, concurrently consul general at
Constantinople) the guide says plainly that "there is no record that he ever presented credentials in
Sofia"; only after the First World War was an American representative commissioned solely to Bulgaria,
with a legation at Sofia on **18 March 1919**. **A plural accreditation is a fact about the mission and
not about the city**, so a capital card states the legation date and leaves the ministers' other posts to
the country's own history. Donald R. Heath appears here for the **third time in this deck** — he reopened
the Sofia legation on 27 September 1947 and Bulgaria declared him persona non grata on 19 January 1950,
severing relations a month later, having earlier been the minister at Saigon accredited to Laos, Cambodia
and Vietnam at `gw-603`.

**SOFIA IS THE SIXTH 14 DECEMBER 1955 UN SEAT IN THE DECK, AND THE FIRST WHERE EUROSTAT AND THE WORLD
BANK AGREE AGAINST UNDATA ON THE AREA.** The EU country page gives Bulgaria's geographical size as
**110,996 km²** and `AG.SRF.TOTL.K2` returns **110,996.758** for 2023 — the same figure to three decimal
places — against UNdata's **110,372 km²**, a 0.6% gap; C1's read-both rule decides it on the majority and
the card states 110,996. The capital-city relay holds exactly (UNdata's 1,276.9 thousand for 2019 is
`EN.URB.LCTY`'s 1,276,937 to the person), and the series is worth reading past the marked year: it peaks
at **1,288,114 in 2023** and eases to 1,286,460 by 2025, **a capital turning over rather than growing**,
which is the shape to expect of an EU member with a falling national population.

**`gw-612` SAN SALVADOR CARRIES THE MOST EXPLICIT CAPITAL-CITY FOOTNOTE IN THE WHOLE OF UNDATA: IT
NAMES ITS EIGHT MUNICIPALITIES.** Where the other definitions catalogued above say "urban agglomeration",
"city proper", "metropolitan area" or "the urban parts of the district", El Salvador's says outright that
the figure "refers to the urban parts of the municipalities San Salvador, Mejicanos, Soyapango, Delgado,
Ilopango, Cuscatancingo, Ayutuxtepeque and San Marcos" — a list a reader could check. **Where a footnote
enumerates rather than classifies, the term can say what the number counts without hedging**, and the
relay still holds to the person (UNdata's 1,105.7 thousand for 2019 against `EN.URB.LCTY`'s 1,105,662),
which is the useful half: an eight-municipality unit is what the World Bank's "largest metropolitan area"
means here too. The areas agree to within a single square kilometre, 21,041 against 21,040.

**AND IT IS THE FIRST CARD WHOSE CAPITAL'S FOREIGN RELATIONS RAN THROUGH A UNION OF STATES RATHER THAN
THE STATE.** In September 1896 Honduras, Nicaragua and Salvador formed the **Greater Republic of Central
America** to exercise their external sovereignty; the United States received a minister from it on 24
December 1896, President Grover Cleveland noting that the individual republics' responsibilities toward
the United States remained "wholly unaffected", and the union dissolved on 29 November 1898. It is the
second time this deck has met a federation on the same page — recognition of the United Provinces of
Central America on **4 August 1824** precedes recognition of Salvador itself by twenty-five years, to **1
May 1849** — so the guide's El Salvador entry dates the same country three ways: as a province of Spain
(1821), as a member of a federation (1824) and as a state in its own right (1849). **Take the date that
matches the polity the card is about**, which for a capital card is the last of the three.

**`gw-632` ASMARA IS THE ONE CAPITAL THE RECOGNITION GUIDE MAKES THE INSTRUMENT OF RECOGNITION RATHER
THAN ITS SETTING.** Every other page in the deck records a note between governments or an envoy presenting
credentials; Eritrea's says the United States recognised the republic on **27 April 1993**, "when the
American consulate at Asmara informed Eritrean authorities of this decision on the same date Eritrea
declared its independence" — the city's own post is what did the recognising, on the day the state came
into being. There is no legation stage at all: the same consulate was **raised to embassy status on 11
June 1993** under a chargé d'affaires ad interim, so declaration, recognition, UN admission (**28 May**)
and embassy all fall inside seven weeks. Note also that the page's *Diplomatic Relations* section reuses
the *Recognition* heading verbatim — after Bishkek's and Nicaragua's wrong section years, a third reason
to **take the dates from the prose rather than the heading**.

**AND UN.ORG'S OWN MEMBER-STATES PAGE IS REACHABLE AND SERVER-RENDERED**, which is worth knowing because
`/securitycouncil/*` and `/press/*` are not (both serve a 200-status block page) and
`digitallibrary.un.org` answers **202 with an empty body** here, so a resolution symbol cannot be looked
up. `https://www.un.org/en/about-us/member-states` returns the whole list with each state's admission date
in the markup ("Eritrea Date of Admission: 28-05-1993"), which gives a **second, independent** source for
a fact otherwise resting on UNdata alone — and UNdata's own capital-city figure carries no definitional
footnote for Eritrea at all, the opposite of San Salvador's eight-municipality enumeration one card
earlier. The relay to `EN.URB.LCTY` still holds to the person (928,758 for 2019), on a series climbing
more than two fifths in a decade; the AREA series is unusually restless, wandering between 121,630 and
121,766 km² before settling, against the statistics division's 121,144.

**AND `split-abstract.js` LEARNED THE CAPITAL-APOSTROPHE SURNAME HERE.** The lone-initial rule requires a
CAPITALISED WORD after the initial and tested it as a capital followed by a LETTER — so "Joseph P.
O'Neill", the chargé d'affaires in Eritrea's entry, split the block after the "P.", exactly as
`S. fatalis` and "König Leopold II." did before it. The lookahead now also accepts a capital followed by
an apostrophe and another capital, which is the shape of every O'/D' surname; **verified over all 4,681
shipped card blocks and glossary descriptions with zero splits changed.** The guarantee is unchanged: a
real boundary is swallowed only where the previous sentence ended on a single capital letter.

**`gw-630` ZAGREB IS THE WIDEST AREA DISAGREEMENT IN THE WHOLE PASS — 56% — AND NEITHER SOURCE IS
WRONG.** UNdata and the EU country page both give Croatia **56,594 km²**, exactly; `AG.SRF.TOTL.K2` gives
**88,070**. C9's rule says correct a term only when it falls outside the spread of the two sources, and
C12's says UNdata is a source rather than an authority — but neither applies here, because this is not a
measurement dispute at all: the World Bank's indicator is defined as "total area, **including** areas under
inland bodies of water and some coastal waterways", and Croatia's coastal waters are about a third of the
difference between a land figure and a total one. **Fetch both `sourceNotes` before letting two series
adjudicate each other** — the earlier Sweden and Serbia gaps were the same fault at a fifth of the size,
and at 56% it is unmistakable. A country with a long indented coast will show it worst; a landlocked one
will not show it at all.

**AND ITS CAPITAL-CITY FOOTNOTE IS A NINTH KIND: "the SETTLEMENT of Zagreb."** Not a city proper, not an
agglomeration, not a metropolitan area and not a list of municipalities but the *naselje*, Croatia's own
statistical settlement unit — and `EN.URB.LCTY` relays it to the person (685,233 against UNdata's 685.2
thousand). The series **falls every year** from 686,652 in 2015 to 684,114 in 2023 before easing back:
after the Marshall Islands, the second capital in this deck whose population is going the other way, and a
reminder that "out of date" is not a synonym for "too low". Croatia's own dates cluster hard — recognition
7 April 1992, UN admission 22 May, relations 6 August, embassy 25 August — and **both American steps were
taken in public**, a White House statement and the president's remarks to the press, where every other
entry in the deck records an exchange of notes or an envoy presenting credentials.

**`gw-639` VILNIUS CONFIRMS ZAGREB'S AREA FINDING BY BEING ITS OPPOSITE, WHICH IS THE ONLY WAY AN
EXPLANATION LIKE THAT GETS TESTED.** One card earlier the same two series differed by 56% for Croatia and
the reason offered was the World Bank's definition — total area "including areas under inland bodies of
water and some coastal waterways". Lithuania has a short Baltic coast, and the two series differ by **four
square kilometres**: 65,286 at UNdata, 65,290 at the World Bank, 65,284 at the EU country page, the
tightest three-source agreement in the pass. **A definitional explanation predicts where the gap should
vanish, so go and check that it does** — otherwise it is only a plausible story told about one number.

**AND IT IS THE FIRST CAPITAL IN THE DECK THAT NEVER HELD THE AMERICAN LEGATION AT ALL.** The deck's usual
sentence — the legation opened in the capital on such a date — is false here three ways over: the
representative recognised Lithuania on **28 July 1922** from **Riga**, another country's capital, being
accredited to all three Baltic states at once; the legation that followed on **31 May 1930** was at
**Kovno, later Kaunas**, not Vilnius; and it **closed on 5 September 1940** after the Soviet annexation,
with no American post in the country again until the embassy at **Vilnius on 2 October 1991**. In between,
the guide records that the United States never recognised the incorporation, let representatives
accredited by the last independent government keep diplomatic status, and held that **relations had
continued uninterrupted** — fifty-one years of unbroken relations with no post in the country. **Do not
write the legation sentence from the pattern; read which CITY the page names**, and whether it is the one
the card is about.

**`gw-645` CHIȘINĂU EXPLAINS D1's MOLDOVA DIVERGENCE, AND THE EXPLANATION WAS IN A FOOTNOTE ALL ALONG.**
D1 recorded that UNdata gives Moldova 2,996 thousand where `SP.POP.TOTL` gives 2,360,527, chose the World
Bank because it matched the term, and filed it under "the World Bank is not always the UN's number". The
country row's footnote b says what the difference is: UNdata's population is **"Including the Transnistria
region"**. That is the third country-row footnote of this kind after Azerbaijan's "Including
Nagorno-Karabakh" and Serbia's "Excluding Kosovo", and it is the one that settles a standing divergence
rather than merely flagging one — **read the letter footnotes on the figure, not just the figure**, since
a 27% gap between two institutions can be a disagreement about territory rather than about counting. The
card does not claim the World Bank excludes Transnistria, which nothing openable here states; it says what
UNdata's footnote says and lets the reader see that the two are not counting the same ground.

**AND THE WORLD BANK API WILL TELL YOU WHETHER A FIGURE WAS MEASURED OR EXTRAPOLATED.** Add **`footnote=y`**
to an indicator request and each observation carries its own note — Moldova's 2025 population comes back
"Extrapolated assuming the same growth rate as previous 6 months". Worth reaching for before treating a
terminal-year value as data: C8's stale-population diagnostic asks when a term's figure *was* true, and
this says how firm the other end of the series is. Chișinău's own capital-city series falls every year
from 526,146 in 2015 to 484,352 in 2025, which with Zagreb and the Marshall Islands makes three, and the
country's falls faster still.

**`gw-631` TBILISI PAID FOR `footnote=y` THE VERY NEXT CARD, AND THE ANSWER IS THAT A STEP IN A SERIES IS
NOT ALWAYS GROWTH.** Georgia's `SP.POP.TOTL` sits between 3.71 and 3.73 million from 2015 to 2023 and then
jumps to 3,812,518 and 3,935,766 — six per cent in two years, which on C8's stale-population diagnostic
would read as a term written from an old figure. The observations carry their own note: **"Average of
January 1st populations that are based on the results of the 2024 census."** The rise is a change of
method, not of the ground, and the two halves of the series are not comparable. **Ask `footnote=y` before
reading a step as growth or a term as stale** — the diagnostic assumes one series measuring one thing, and
a census year breaks that assumption silently.

**AND ITS COUNTRY-ROW FOOTNOTE IS THE FOURTH OF THE KIND, THE SECOND IN TWO CARDS.** UNdata's Georgian
population is marked **"Including Abkhazia and South Ossetia"**, as Moldova's is marked for Transnistria,
Azerbaijan's for Nagorno-Karabakh and Serbia's for Kosovo. That is now a pattern rather than a curiosity:
**a post-Soviet state with a breakaway region carries one, so look for it before treating a gap against
another institution as an error.** Here it explains the 3.807 against 3.72 million directly.

**A THIRD THING, ABOUT THE SOURCE RATHER THAN THE COUNTRY: THE GUIDE'S SECTION STRUCTURE CAN BE WRONG, NOT
JUST A HEADING'S YEAR.** On Georgia's page the establishment of relations sits beneath **Recognition** and
the embassy beneath **Diplomatic Relations**, while the recognition itself appears only in the summary
paragraph. After Bishkek's wrong year, Nicaragua's wrong year and Eritrea's repeated heading, that makes
four: **read the prose and ignore the furniture.** Georgia's page is also the rare one that gives a full
printed citation — the Fitzwater press statement in the *Public Papers of the Presidents* — for a date it
states.

**`gw-637` YEREVAN IS THE ONLY CAPITAL IN THE DECK WHOSE COUNTRY THE UNITED STATES HAS RECOGNISED TWICE,
71 YEARS APART — AND THE FIRST RECOGNITION EXPRESSLY DECLINED TO RECOGNISE ITS BORDERS.** On 23 April 1920
Secretary of State Bainbridge Colby delivered a note to the Armenian Republic's representative in
Washington conveying Wilson's decision, with the note stating that the recognition "in no way
predetermines the territorial frontiers, which…are matters for later delimitation"; Wilson then arbitrated
the Armenia–Turkey boundary at the Paris Peace Conference's request and submitted his determinations on
22 November 1920, by which date the territory had been attacked by Turkish and Bolshevik troops and the
republic was months from ceasing to exist. The second recognition, on **25 December 1991**, came in the
same Bush address the Moldovan and Georgian pages cite — but on Armenia's page that address establishes
**diplomatic relations as well**, so recognition and relations share a date here where they are months
apart on its two neighbours. **A shared source event does not mean a shared set of consequences: read what
each page says the address did.** The page also records an American consulate at **Ezerum "in Armenia"
from 1896**, moved to Trebizond in 1904 — a consulate in the name of a country that had no state, decades
before either recognition.

**AND ITS UNDATA ROW CARRIES NO TERRITORIAL FOOTNOTE, WHICH IS ITSELF THE DATA POINT.** Armenia's
population is not marked the way Georgia's, Azerbaijan's, Moldova's and Serbia's are, and yet UNdata's
2.952 million for 2025 sits **4.5% BELOW** the World Bank's 3.087 million — the opposite direction from
Georgia's gap one card earlier, and with nothing openable here to explain it. **Do not reach for the
territorial explanation just because the region makes it available**: where the footnote is absent, the
divergence is unexplained and the card says only that the two differ.

**`gw-633` ULAANBAATAR IS THE ONE PAGE THAT SAYS WHAT DOES *NOT* COUNT AS RECOGNITION, AND IT IS WORTH
MORE THAN A DATE.** Mongolia joined the United Nations in 1961 with the United States abstaining rather
than blocking, and the two had signed multilateral treaties to which both were parties — and the guide
states in terms that **neither act constituted recognition**, which came only on **27 January 1987**, in a
joint communiqué that established diplomatic relations at the same moment. It also records that
recognition was entertained under Kennedy, Johnson, Nixon and Carter without success. Every other page in
the deck records what recognition IS; this one draws the boundary from the other side, and that is the
sentence to reach for whenever a card is tempted to read a UN seat, a treaty or a vote as recognition —
**a state's presence in the same multilateral instruments as another says nothing about bilateral
recognition.**

**A NOTE ON PICTURES: A DATED PHOTOGRAPH FAILS THE SAME TEST A LITHOGRAPH DOES.** The only wide view in
Commons' "Views of Ulaanbaatar" category is from **1988**, and the city's own series here runs 1.36 to
1.72 million in the last ten years alone — so that photograph shows a town this card is not about, exactly
as the 19th-century bird's-eye views of Montpelier and Pierre did in the United States collection.
`incategory:` searches returned nothing; the usable images came from a plain **`list=search` for
"Ulaanbaatar cityscape"**, three 2023 photographs by one contributor, none of them in the views category.
**When a capital's own category is thin or old, search the file namespace by words rather than by
category.**

**And the arithmetic is the card's real subject**: on the World Bank's own figures the city held about
45% of all Mongolians in 2015 and about 48% in 2025, against a national density of 2.3 people per square
kilometre — a country emptying into one valley.

**`gw-640` DOHA IS THE FIRST BREAK OF THE UNDATA↔WORLD BANK CAPITAL RELAY THAT THE FOOTNOTE ITSELF
EXPLAINS.** The relay has held to the person on every card since Bern, and Bern broke it for a structural
reason (the capital is not the largest city). Doha breaks it for a definitional one: UNdata gives 637.3
thousand for 2019 against `EN.URB.LCTY`'s **715,997**, a 12% gap, and UNdata's own footnote says its
figure **"does not include the populations from the industrial area and zone 58"** — an exclusion of named
zones, which is a tenth kind of capital-city definition and the first that subtracts rather than
describes. **A relay break is a question, not an error, and the footnote usually answers it**: check the
letter footnote before treating either figure as wrong, and where it names what is left out, the card can
say so instead of hedging. The country's own total is unusually mobile too — 2.79 million in 2020, 2.50 in
2021, 2.97 by 2025 — beside a reported 245.9 men per 100 women.

**AND THE MINISTER LIVED IN ANOTHER COUNTRY AGAIN.** Relations were established on 19 March 1972 when
William A. Stoltzfus presented his credentials, "accredited to a number of other Persian Gulf states" and
**resident in Kuwait** — the Vilnius pattern (recognition from Riga) in a second region, and the reason
the deck's stock sentence about a legation opening in the capital keeps needing checking. Doha got its own
post on 24 February 1973 under a chargé, and a **resident ambassador only on 22 August 1974**, almost
three years after independence. Where a page distinguishes an accredited envoy from a resident one, the
capital's own date is the second.

**⚠ THE EIGHT-CARD NUMBERING DRIFT OF SEP 2026, AND THE CHECK THAT NOW CATCHES IT.** Eight capitals were
written from the **"The next card is a CAPITAL: …" line at the head of this file** rather than from the
running order below, and that line is advanced by hand each time — so once it was wrong by one city it
stayed wrong, and eight cards shipped at other cities' addresses before anyone looked: **Asmara at
`gw-613`** (Brazzaville's slot), Vilnius at `gw-615` (Copenhagen's), Chișinău at `gw-616` (Beirut's),
Tbilisi at `gw-617` (Helsinki's), Yerevan at `gw-618` (Monrovia's), Ulaanbaatar at `gw-619` (Oslo's), Doha
at `gw-620` (Bratislava's) — and **Zagreb at `gw-614`, one of the seven numbers this plan deliberately
leaves unused.** All eight were renumbered into their own planned slots (630, 631, 632, 633, 637, 639,
640, 645) the moment it was found, which was safe only because they were hours old and
`check-overlay.js` reported the live overlay carrying no card deltas at all; **a day later it would not
have been.** Three things to carry.
**NOTHING IN THE PIPELINE COULD SEE IT.** Each card was correct in itself — cited at the bar, style-clean,
in the right deck, with its paired glossary term — and `test-card-plans.js` checked that the running order
had no gaps and no duplicates without ever asking whether a SHIPPED card matched the topic at its own
number. The only symptom was that the plan and the deck had quietly stopped describing the same thing.
**IT IS NOW A TEST.** `test-card-plans.js` asserts two new things for every collection: that a shipped
card's number appears in the running order at all (which is what catches a card at a deliberately unused
number), and — wherever a plan line reads `Name  [Country]`, i.e. the three geography plans — that the
card's answer IS the city the plan put there. Verified to fail on the real fault before being kept.
**AND THE HEADER LINE IS A CONVENIENCE, NOT THE SOURCE.** Read the running order before writing a card:
`grep -n "^  gw-NNN " docs/world-geography-card-plan.md`. This file already warned that the next-card line
had been guessed wrong repeatedly; a warning is not a check, which is the whole of why the check exists.

**`gw-613` BRAZZAVILLE IS THE FIRST CARD WHERE EVERY FIGURE AGREES, AND THE FIRST WHOSE CAPITAL WAS
ANOTHER COUNTRY'S.** UNdata and the World Bank match on the capital to the person (2,308,076 for 2019),
on the area to the square kilometre (342,000) and on the national total to the thousand (~6.48 million) —
after Croatia's 56% area gap and Doha's 12% capital gap, a reminder that the divergences are the
exception and worth explaining rather than the rule. The history is the card's own: French Equatorial
Africa's administration sided with de Gaulle, so **Brazzaville was the symbolic capital of Free France
from 1940 to 1943**, and on **15 August 1960** independence, American recognition (a message from
Eisenhower to President Fulbert Youlou) and the opening of Embassy Brazzaville all fall on one day — the
opposite of Doha's three-year climb from recognition to a resident ambassador. **Five years later to the
day** the staff were gone: the withdrawal of August 1965 cites mistreatment of American diplomats
including arrest, detention, incommunicado interrogation and forced departure, Congo moved its own
mission from Washington to New York, and relations resumed only on 7 June 1977.

**TWO PRACTICAL NOTES FROM ITS PICTURES AND ITS MAP KEY.** `add-card.js` refused `"Republic of the
Congo"`: **the map key is `world.js`'s own LABEL, which is `Congo`** (its neighbour being
`Dem. Rep. Congo`) — the same abbreviation-and-ambiguity that made `FINDIT_NAMES` necessary for the
Find-it game, met from the other side. And the best wide view Commons offers of Brazzaville, a bird's-eye
along the river with Kinshasa on the far bank, is **a video frame carrying a corner logo** and so fails
the no-watermark half of the bar however good it is; the usable pictures are 1600px and 1000px originals,
**below the 1920px thumbnail this deck usually requests**, so the `src` is the FILE rather than a
`/thumb/` path — a thumbnail wider than the original is a 400, which is the Port Moresby finding again.

**`gw-615` COPENHAGEN IS THE FIRST PAGE IN THE DECK WHERE THE RECOGNITION RUNS THE OTHER WAY.** The
guide's Recognition section is headed **"Danish Recognition of the United States, 1792"** — Denmark
predates the republic, so what the page can record is Denmark recognising Washington, when the American
consul at Copenhagen received an **exequatur** on or about 9 June 1792. The direction holds through the
next entry too: relations began on **12 October 1801** when the DANISH minister resident presented his
credentials in the United States, and an American legation at Copenhagen followed only **26 years later**.
**Read whose credentials the page says were presented, and to whom** — the deck's stock sentence assumes
an American envoy arriving in the capital, and on an older European state it is often the reverse.

**IT ALSO GIVES THE MINISTER-IN-ANOTHER-COUNTRY PATTERN ITS THIRD AND STRANGEST FORM.** Riga stood in for
Vilnius and Kuwait for Doha; here the American minister to Denmark left occupied Copenhagen in June 1940
and **took up residence in OTTAWA**, accredited to a government under German occupation, until the
legation formally closed on 20 December 1941. The guide nevertheless states that relations "have never
experienced an interruption … since they were first established in 1801" — the same claim Lithuania's
page makes across fifty-one years without a post, so **a closed legation is not a broken relationship and
the two facts sit on the same page without contradiction.**

**AND ITS FOOTNOTES ARE AN ELEVENTH DEFINITION AND A FIFTH TERRITORIAL EXCLUSION.** The capital figure
"refers to the Greater Copenhagen Region, consisting of (parts of) 16 municipalities" — San Salvador's
enumeration one step vaguer, since the municipalities are counted but not named and only PARTS of them
count — and the country row says outright that Denmark's data exclude the **Faroe Islands and Greenland**,
which is the Transnistria/Abkhazia/Nagorno-Karabakh/Kosovo family arriving in a state with no dispute at
all. **The exclusion footnote is about statistical convention as often as about politics.**

**`gw-616` BEIRUT CARRIES THE FIRST FOOTNOTE THAT EXCLUDES A GROUP OF PEOPLE RATHER THAN A PIECE OF
GROUND — AND THE FIRST IN WHICH UNDATA DOUBTS ITS OWN FIGURE.** The capital's population wears two:
**"Est. should be viewed with caution as these are derived from scarce data"** and **"Excluding Syrian
refugees."** Every earlier exclusion in this deck has been territorial — Transnistria, Abkhazia and South
Ossetia, Nagorno-Karabakh, Kosovo, the Faroes and Greenland — and each subtracts a place; this one
subtracts a population living in the place being counted, which is a different operation and changes what
the number means rather than where it applies. **It also settles what D2 could only observe.** D2 withheld
a correction on Lebanon's 5.5 million because the World Bank series never passes through it, calling the
figure contested rather than stale; the source now says why the ground is soft. **When a figure resists
the stale-or-contested test, look for a candour footnote before concluding anything about the prose.**
Two numbers of the same shape: the capital's series turns over inside the decade, peaking at 2,434,609 in
2021 and easing to 2,379,326 by 2025, and the national total falls 6.47 → 5.70 million by 2020 before
recovering.

**AND ITS RECOGNITION IS THE ONLY ONE IN THE DECK WITH TERMS ATTACHED.** On 7 September 1944 the American
Diplomatic Agent offered Lebanon "full and unconditional recognition" **upon receipt of written assurances**
about existing American rights; the Lebanese foreign minister gave them, and the guide dates recognition
from that reply of **8 September**. An offer of unconditional recognition made conditional on a letter is
worth reading twice — and note that the same man, George Wadsworth, had been sitting in Beirut as **Agent
and Consul General since 9 October 1942**, a post in the capital two years BEFORE recognition, which is
Doha's sequence exactly reversed.

**`gw-617` HELSINKI IS THE PROFILE THAT INCLUDES AND EXCLUDES THE SAME TERRITORY IN ADJACENT ROWS.**
Finland's population footnote reads **"Including Åland Islands"** and, two rows down, its surface-area
footnote reads **"Excluding Åland Islands."** Every earlier exclusion in the deck was one institution
differing from another; this is a single profile applying opposite conventions to two of its own numbers,
and it is measurable both ways. The area, 336,884 km², sits about **1,600 km² below** the World Bank's
338,480 and the EU's 338,363 — a gap of the order of the islands set aside — and the profile's stated
density of **18.6 people per km² is not the quotient of its own two figures**, which give 16.7. **Do the
division before quoting a derived figure**, and read every letter footnote on the row you are using
rather than the one above it. (The World Bank's Finnish area series also creeps upward across the decade,
338,446 → 338,480, where almost every other country's is flat; recorded, not explained.)

**AND ITS GUIDE PAGE COMPLETES A TRIO WORTH HOLDING TOGETHER: A POST WITHOUT RELATIONS.** Lithuania gave
relations with no post in the country for fifty-one years; Denmark gave a legation shut for four while the
guide insists relations were never interrupted; Finland gives the third case — relations **severed on 30
June 1944** over the admitted military partnership with Nazi Germany, and then a **Special Mission at
Helsinki from 16 January 1945 which the page states explicitly was NOT a resumption of formal
relations**, eight months before they were restored on 1 September. **A mission, a legation and a
relationship are three separate things and a page may report any one of them without the others.** Two
smaller things from the same page: recognition was delayed to **7 May 1919**, and the guide says why —
concerns about political instability and ties with Germany, which few pages volunteer — and the legation
was established at **Helsingfors**, the city's Swedish name, so the term carries it as an alias.

**`gw-618` MONROVIA IS THE LONGEST DELAY BETWEEN A REPUBLIC AND ITS RECOGNITION IN THE DECK, AND THE
GUIDE DOES NOT SAY WHY.** Liberia constituted itself a republic in **1847** and, the page notes, "was
recognized by several European states"; the United States recognised it only on **23 September 1862** —
fifteen years — and did so through **Charles F. Adams, the American minister to ENGLAND**, empowered to
conclude a treaty of commerce and navigation, which he and the Liberian president signed in London on 25
October. So the recognition of a republic founded from the United States, by a society of Americans, was
transacted in another country's capital: the fourth instance of the recognition-from-elsewhere pattern
after Riga, Kuwait and Ottawa, and the one where it is strangest. **The page states the delay and gives
no reason for it**, where Finland's page one card earlier explains a shorter one — so record the gap and
do not fill it: the obvious explanation is not on the page, and a card is not the place to supply one
from elsewhere.

**A PICTURE NOTE THAT IS REALLY THE AMBIGUITY RULE AGAIN.** A file search for "Monrovia city view"
returns **Monrovia, CALIFORNIA** in the first result — a 1906 city hall — which is Springfield and Dover
one continent over, so the subject has to be established by CATEGORY. And the best daytime wide view of
the Liberian capital is filed as **"Liberia, Africa 2013 - panoramio (8).jpg"**, a name that never says
Monrovia at all: it is in `Category:Monrovia`, which is the whole of its claim to be one. **Search by
words, confirm by category** — the two halves catch opposite failures, a name that means the wrong place
and a right place with no name.

**`gw-619` OSLO IS THE WIDEST AREA DIVERGENCE OF THE PASS — 93%, NEARLY A FACTOR OF TWO — AND UNLIKE
CROATIA'S IT IS NOT EXPLAINED BY EITHER SOURCE.** UNdata gives Norway **323,772 km²**; `AG.SRF.TOTL.K2`
gives **624,500**. Croatia's 56% had a stated cause (the World Bank's series counts inland waters and some
coastal waterways) and Vilnius confirmed it by being the opposite case; here that definition is on record
and still does not visibly account for a doubling, and the profile's own footnotes only deepen the
question: its POPULATION is marked **"Including Svalbard and Jan Mayen Islands"** while its AREA row
carries no note at all. **Helsinki's asymmetry was declared on both sides; Oslo's is declared on one**, so
the card states both figures, states what the World Bank's series counts, and stops — **an unexplained
divergence is reported as unexplained, not narrated into a cause.**

**AND ITS GUIDE PAGE GIVES THE FOURTH MEMBER OF THE POST-AND-RELATIONS SET, THE ONE WITH A NAME.** After
relations without a post (Vilnius), a post shut while relations continued (Copenhagen) and a mission that
was not a resumption of relations (Helsinki), Norway supplies a post defined by a GOVERNMENT rather than a
place: the legation at Oslo closed on 15 July 1940 and the **"Legation Near the Government of Norway"**
opened in **London** on 2 August, its head in time accredited to seven other governments in exile as well,
until the embassy was transferred back to Oslo on **31 May 1945**. That is also the second London
recognition-or-mission in two cards, after Monrovia's.

**A SMALLER ONE, AND THE THIRD RENAMED CAPITAL IN FOUR CARDS.** The guide's consular list dates an American
consulate in the city to **1809** — 96 years before Norway was a state — under the name **Christiania**,
and gives the year the name changed: **"Oslo since 1925"**. With Helsingfors and Kovno that makes three,
so the terms carry the old names as aliases and the plan's rule stands: **read which NAME the page uses
for the capital, and check it is the one on the card.**

**`gw-620` BRATISLAVA IS WHERE FOOTNOTE "a" FINALLY MATTERS — UNDATA'S POPULATION IS A PROJECTION, AND
HERE IT POINTS THE WRONG WAY.** Every country profile in this deck carries **"Projected est. (medium
fertility variant)"** on its population, and on every earlier card it was harmless. Slovakia's projection
gives about **5.475 million** for 2025 while the two MEASURED series both fall — the World Bank's peaks at
5,458,827 in 2020 and drops to 5,413,813, and Eurostat gives 5,419,451 — so the divergence is not of size
but of **direction**: one number is a forecast and the others are counts. **C8's stale-or-contested
diagnostic assumes both sides are measurements**, and it cannot classify a projection at all; where the
gap is small and the trends oppose, check the footnote before running the test. The areas by contrast are
the tightest in the pass after Lithuania: 49,035 km² at UNdata and the EU, 49,030 at the World Bank.

**AND ITS RECOGNITION IS THE FASTEST IN THE DECK, WHICH IS WORTH RECORDING BESIDE MONROVIA'S TWO CARDS
BACK.** Liberia waited fifteen years for a recognition transacted in London; Slovakia was recognised **on
the day it came into existence** — 1 January 1993, in a public statement that also promised an ambassador
— with **diplomatic relations and the embassy at Bratislava three days later** and a resident ambassador
before the year was out. The whole sequence a capital card usually tracks across decades happens inside
eleven months, and the reason is structural rather than diplomatic: a state formed by the orderly
dissolution of one the United States already recognised needs no interval to establish that it exists.

**`gw-621` DUBLIN IS THE ONE RECOGNITION IN THE DECK ADDRESSED TO A THIRD COUNTRY.** Riga, Kuwait, Ottawa
and London were recognitions or missions transacted somewhere else; Ireland's was transacted **with**
somebody else. On 28 June 1924 Secretary of State Charles E. Hughes informed **the British ambassador in
Washington** that the President would be pleased to receive a duly accredited Irish minister — replying to
a British letter of 24 June asking American approval for the British plan to have an Irish minister handle
Irish business at Washington. Ireland is not a party to the exchange that recognises it. Relations then
began in **Washington** on 7 October 1924 with Smiddy presenting his credentials (the Copenhagen
direction), and an American legation reached **Dublin** only on 27 July 1927, three years later. **Read
who the page says was told, not just when.**

**AND IT IS THE FIRST CARD WHERE ALL THREE AREA SOURCES DISAGREE AND NONE IS AN OUTLIER**: 69,825 km² at
UNdata, 69,947 at the EU, 70,280 at the World Bank — a 455 km² spread with no two agreeing and no footnote
anywhere. C9's rule (correct only when the term falls outside the spread of two sources) has nothing to
bite on; the card gives all three and attributes each. Bratislava's projection finding also repeats here
**in the opposite direction**, which is what makes it a rule rather than an anecdote: UNdata's projected
5.308 million for 2025 sits BELOW Eurostat's 5,439,898 and the World Bank's 5,484,367, where Slovakia's
sat above both. **A projection is not biased one way; it is simply not a count.** (The World Bank's own
2025 figure is flagged extrapolated by `footnote=y`, so on this card two of the three national numbers are
estimates of the future rather than measurements of the present.)

**`gw-622` BANGUI CLOSES A LOOP WITH `gw-613` BRAZZAVILLE, AND THE JOIN IS ONE MAN.** The Central African
Republic's page says relations were established on **13 August 1960** when "the American Consul at
Brazzaville, **Alan W. Lukens**, presented his letter of credence as Charge d'Affaires" — the same man who,
**two days later**, was chargé at the opening of Embassy Brazzaville on the Congo page. So relations with
one new state were opened from the capital of another that did not yet have an American embassy of its
own, and Embassy Bangui followed on **10 February 1961** with Lukens now resident there. Each page states
its own half; nothing on either says they are the same person, and only reading them together shows it.
**A recurring officer is a real join between cards and it is invisible from one page** — but it is also
never citable from one page, so it belongs in the plan and not in a card.

**A PICTURE NOTE: THERE IS A SECOND BANGUI, IN NIGER.** A file search returns four photographs of
"la commune rurale de **Bangui (Région de Tahoua)**" alongside the capital's, and two ISS frames of the
country besides — Monrovia's California problem and the spaceborne rule in one result list. What the
capital actually has is **two aerials taken from the same window at the same minute** (12:38, 10 December
2014), which is why the card and its term share a scene at different crops: the alternative was a street
photograph centred on identifiable people and an armed soldier, which is a picture about the security
situation rather than a view of a city. **Where a capital has one good vantage and nothing else, say so
rather than reaching for a photograph that is about something else.**

**`gw-623` WELLINGTON IS THE SECOND BERN, AND A MORE EXTREME ONE.** Bern broke the UNdata↔World Bank
capital relay because the capital is not the largest city (426,000 against 1,383,092); Wellington breaks
it the same way and further — **413,000 against 1,582,028 for 2019, nearly four times** — and the
`EN.URB.LCTY` series climbs to 1,711,127 by 2025, so the two numbers diverge as the decade goes on. The
card therefore does not call Wellington the largest city, and neither does its term: **check the relay
before writing "capital and largest city", which this deck's opening sentence otherwise says by
habit.** Doha broke the relay by definition and Bern and Wellington break it by fact; the three are
different failures and only the footnote or the arithmetic tells them apart.

**AND ITS RECOGNITION PRECEDES THE COUNTRY'S OWN COMPLETION OF INDEPENDENCE BY FIVE YEARS.** New Zealand
was a self-governing Dominion from 26 September 1907 with the United Kingdom still controlling its
external relations; the Statute of Westminster of December 1931 was expressly not to take effect until
adopted by New Zealand's own government, and **its Adoption Act became law on 25 November 1947**. The
United States nevertheless recognised New Zealand as "an independent state with autonomous control over
its foreign relations" on **16 February 1942**, when Walter Nash presented credentials in Washington. So
the guide's recognition date is not the date the state's own law completed the transfer — the opposite
error from Monrovia's, where recognition came fifteen years LATE. **Recognition is one government's act,
not a constitutional milestone, and a card should not let the two stand in for each other.** Its UNdata
row also excludes the Cook Islands, Niue and Tokelau: the sixth territorial exclusion, and the first whose
excluded places are self-governing states in free association.

**A TWELFTH KIND OF CAPITAL-CITY DEFINITION: "refers to Muscat governorate."** The deck has now met
eleven ways for UNdata to say what its *Capital city pop.* row counts — a settlement, a Greater X region
assembled out of parts of sixteen municipalities, a list of eight named municipalities, an exclusion of
named zones, and several profiles that say nothing at all. Oman adds a twelfth and the plainest of them:
the figure is a **governorate**, a first-order administrative division, and the profile says so in one
clause. It is worth stating on the card because Muscat is a chain of settlements strung along the coast
between the Hajar ridges and the sea rather than one built-up centre, so a reader meeting "1.50 million"
has no way of telling from the number what has been counted. The UNdata-to-World-Bank relay holds to the
person here — 1,501.6 thousand against `EN.URB.LCTY`'s **1,501,635** for 2019 — which is the ordinary case
and worth recording precisely because Bern, Wellington and Doha have each broken it for a different reason.

**A NATIONAL POPULATION SERIES THAT FALLS AND THEN SURGES, AND WHY IT DEFEATS C8's DIAGNOSTIC.** Oman's
`SP.POP.TOTL` runs 4,184,895 (2015) up to 4,597,877 (2018), **down** to 4,500,424 (2021), then steeply up
to 5,494,691 (2025) — a fall of two per cent followed by a rise of twenty-two in four years. C8's test asks
whether a term's figure names a year on the series, so that a stale figure can be told from a contested
one; a series that is not monotonic answers **two** years for a value in the dip, and the test cannot say
which. Nothing here needed it, the term being written from the current figure, but a country whose
population turns is one where "when was this true?" has more than one answer, and the diagnostic should be
read as a hint rather than a verdict there. Oman's surface area is the batch's quietest agreement:
**309,980 km²** at UNdata against **309,500** at the World Bank, 0.15 per cent apart, against Norway's 93.

**THE COLUMN HEADING IS NOT THE DATE — THE FOOTNOTE IS, AND ON A FAST-GROWING CITY THE DIFFERENCE IS A
QUARTER.** UNdata heads its capital-city row *Capital city pop. (000, 2025)* and prints **1 259.0** for
Mauritania with a footnote **c**, which the page's own footnote list resolves to **2019**. Read against
`EN.URB.LCTY` the two agree almost to the person — 1,258,973 for 2019 — but the World Bank's figure for the
year in the heading is **1,612,940**, so a card taking the heading at face value would understate Nouakchott
by 28 per cent while appearing to quote the United Nations correctly. The deck has been reading these
footnotes all along (Muscat's said 2019 too), and this is the batch that measures what the habit is worth:
the error is invisible on a slow-growing capital and enormous on a fast one, so **check the letter beside
every UNdata figure before writing the year, and check it hardest where the city is growing.**

**AN EXACT AREA AGREEMENT: 1,030,700 km² from both sources.** UNdata and
`AG.SRF.TOTL.K2` give Mauritania the same number, digit for digit — not within a rounding, the same number
— where Norway's two figures are 93 per cent apart, Croatia's 56 and Oman's 0.15. It is worth recording
because it shows the divergences elsewhere are about **definitions** (inland waters, dependencies, disputed
ground) rather than about measurement: where a country's boundary is desert and coast and nobody disputes
either, the two agencies simply publish the same survey. Its population series is the matching case —
3,965,959 (2015) to 5,315,065 (2025) with no dip anywhere — so C8's stale-or-contested diagnostic works
perfectly here, one card after Oman's non-monotonic series defeated it.

**A THIRTEENTH KIND OF CAPITAL-CITY DEFINITION, AND THE MOST EXPLICIT ONE YET: "refers to the urban
population of cantons."** Costa Rica's UNdata row carries two footnotes at once, `c,d`, which resolve to
that definition and to the year 2019 — so the profile states, in one row, both WHAT is counted and WHEN,
which is the pair of questions every other capital in this deck has had to be reconstructed from. It is
also the first definition here that is not an administrative unit but a **part** of several: not the
cantons, but their urban population. The relay to `EN.URB.LCTY` holds again — 1,378.5 thousand against
1,378,546 for 2019, agreeing to within fifty people.

**AN EXACT AREA AGREEMENT TWICE RUNNING, WHICH SETTLES WHAT THE DIVERGENCES ARE ABOUT.** Costa Rica is
**51,100 km²** at both sources, digit for digit, one card after Mauritania's 1,030,700 at both. Two in two
is no longer a curiosity: where a country's boundary is undisputed and its inland water negligible, the two
agencies publish the same survey, and the deck's large divergences — Norway 93 per cent, Croatia 56, Pakistan's
Kashmir gap — are therefore about **definitions** rather than measurement. *(The Mauritania paragraph above
originally called that agreement the deck's first; it was never checked against the earlier 226 cards and
the claim has been withdrawn rather than left standing on nothing.)* San José is also the deck's slow
counterweight to Nouakchott: a sixth of growth in the decade against more than a half, in a country whose
population rose seven per cent while Mauritania's rose a third.

**TWO SANDBOX MECHANICS WORTH NOT REDISCOVERING.** `pypdf` is installed but **broken here** (its crypt
provider imports `cryptography`, which panics), so a UN resolution PDF is read by decompressing the
FlateDecode streams with `zlib` and pulling the text out of the parenthesised strings — twenty lines of
Python, and it is what got resolution 1608's actual operative paragraphs onto `gw-552`. And a
`upload.wikimedia.org` thumbnail URL at a width nobody has generated yet answers **400** from here: build
the src, then CHECK it, and fall back to a width that already exists (1280 or 1920). One glossary picture
shipped a 400 for a minute for want of that check.








**THE FRUS CORPUS IS SEARCHABLE FROM HERE, AND IT IS A CITY SPINE WHERE THE COUNTRY PAGES ARE THIN**
(`gw-543`). `history.state.gov/search?q=<city>` answers, ranks by relevance and searches the whole of
*Foreign Relations of the United States* as well as the guide — which matters because Uzbekistan's
country page is four sentences and names Tashkent once. The search returned the city's whole American
record: an **editorial note** (`frus1964-68v25/d278`) giving the Ayub–Shastri conference of 4–10
January 1966, Kosygin's part in it, the terms of the Tashkent Declaration and Shastri's death in the
city the next day; and a **1919 telegram** (`frus1919Russia/d136`) recording Roger C. Tredwell,
American consul at Tashkent, under arrest there since 20 October 1918 — a consular presence the
guide's own Consular Presence section does not list at all, because the guide is written per modern
state and the consulate was in Turkestan. This is the volume-preface route generalised: **where a
capital has no institutions publishing their own history, search the diplomatic record for the city's
name.** Two things left out for want of a source: the 1966 earthquake, which the USGS/ISC-GEM catalogue
records as M 5.3 nine kilometres from the city but with nothing about the damage — a magnitude alone
would read as a minor tremor and mislead — and everything before 1918, since `unesco.org`'s Silk Roads
pages carry no Tashkent article and `usgs.gov` itself is 403.

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

**Batch 82 (Niue, Vatican City, Pitcairn Islands) reaches the END of the countries deck's numbering —
`gw-233` is the last id in the running order — and it does so with `gw-230` Norfolk Island DEFERRED.**
Norfolk Island is the deck's fourth entity invisible to both quantitative sources (`nf` returns 500,
`NFK` is not a valid World Bank code) and, unlike Åland, its metropole does not fill the gap: the
Australian department that administers the territory refuses the connection outright at
`infrastructure.gov.au` and `regional.gov.au`, the island's own `norfolkisland.gov.nf` closes the tunnel
mid-exchange, and `legislation.gov.au`'s search is JavaScript-driven and returns tax statutes for a query
about the Norfolk Island Act. **The Australian Bureau of Statistics DOES answer** — its 2021 Census
QuickStats for area 901041004 gives 2,188 people, a median age of 50 and 1,220 private dwellings — but
nothing openable gives the island's area or names Kingston, so the facts box cannot be filled. That is
`gw-218` Saint Martin's shape with a different flag, and it is worth recording that **Australia joins
France in the "publishes, but not to a reader"** column while the United Kingdom, the Netherlands,
Denmark, New Zealand and the United States all answer plainly.

**The Vatican is the first entity in this deck whose OWN GOVERNMENT is the whole source list.** The
Governorate of Vatican City State publishes three short pages that between them carry everything a card
needs and nothing a summary would: the territory at **0.44 km² (44 hectares)**, walled in part, taking in
Saint Peter's Square "up to the marble strip that joins the ground to the outer parts of the Colonnade";
five entrances guarded by the Swiss Guard and the Gendarmerie; and, updated to 31 December 2024, **673
citizens, 458 of them inside the walls including 120 Swiss Guards, and 882 residents in all**, with about
30 per cent of citizens living abroad because their work is diplomatic. It also dates the state exactly —
the Lateran Treaty signed 11 February 1929 and ratified 7 June — and states its own constitutional
position: a personality under international law "separate from the Holy See", with structures "reduced to
the bare minimum required to carry out its functions". **UNdata files the entity as the Holy See and
gives NO surface area at all**, only a density, so the Governorate is not a supplement here but the
source. The term was reconciled with it and lost "the smallest sovereign state in the world" — a
superlative no cited source states, where the 0.44 km² beside it says the same thing and can be checked.

**Pitcairn is the smallest population the deck will ever card, and its two sources disagree about it.**
The Secretariat's working paper says 35 (2023); the territory's own government says "a population of only
around fifty". Both are printed. The paper is otherwise the richest short entry in the C-24 series —
four islands of which one is inhabited, 35.5 km² in all against 4.35 for Pitcairn itself, an exclusive
economic zone of 842,000 km² that is now a marine protected area, no political parties, official
languages English and **Pitkern**, "a mixture of eighteenth-century English and Tahitian", and the
Governor's office held concurrently by the United Kingdom's High Commissioner to New Zealand. A small
divergence worth knowing: **the paper writes HMS *Bounty* and the islanders' own government writes
HMAV** — His Majesty's Armed Vessel, which is what she was.

**And UNdata contradicts itself across two profiles, which the Niue card has to say out loud.** Its Cook
Islands profile footnotes the area as excluding "Niue, shown separately, which is part of Cook Islands,
but because of remoteness is administered separately" — batch 79 recorded that and attributed it. Its
Niue profile, meanwhile, files Niue under Polynesia in its own right and excludes it from the data for
New Zealand, and New Zealand's own foreign ministry calls it "a self-governing state in 'free
association' with New Zealand" under the Niue Constitution Act 1974. **Where one publisher's two pages
disagree, cite both and let the reader see it**; the card names the Cook Islands footnote as the
statistics division's filing convention rather than as a fact about Niue.

**Batch 81 (Saint Helena, Montserrat, Falkland Islands) is the batch where the C-24 working papers and
`legislation.gov.uk` finally run as ONE recipe**, and it is the cheapest three cards the pass has
produced since the EU country pages: a working paper each (A/AC.109/2026/13, /10 and /6), a UNdata
profile each, and the territory's own constitution as a British statutory instrument each — the St
Helena, Ascension and Tristan da Cunha Constitution Order 2009 (SI 2009/1751), the Montserrat
Constitution Order 2010 (SI 2010/2474) and the Falkland Islands Constitution Order 2008 (SI 2008/2846),
all served in full. Batch 77 found the route and batch 79 showed it reaches back to 1982; **it now covers
every British overseas territory this deck has met**, and it should be reached for before any other
constitutional source.

**The Falkland Islands are the second entity whose NAME is contested, and the working paper states both
positions in its own voice.** The territory has been on the United Nations list since 1946, and at the
Fourth Committee's twenty-fifth meeting on 6 December that year "the delegation of Argentina expressed a
reservation to the effect that the Government of Argentina did not recognize British sovereignty in the
Falkland Islands (Malvinas)" while "the delegation of the United Kingdom expressed a parallel reservation
that it did not recognize Argentine sovereignty in those islands". UNdata's own footnote says the same in
one sentence, and the M49 register goes further than either: it lists the entity as **Falkland Islands
(Malvinas)** in English and French and as **Islas Malvinas (Falkland)** in Spanish, the order reversed.
That is Gibraltar's case again — **where the sources attribute both positions themselves, the card can
carry the dispute without adjudicating it** — and the naming detail is checkable in a way no summary of
the argument would be.

**Montserrat's capital was ABANDONED, which is the seventh distinct shape the capital field has taken.**
The working paper says it plainly: "Plymouth, abandoned in 1997 following the volcanic eruption. Most of
the offices of the Government of Montserrat are based in Brades." UNdata gives "Brades Estate". The facts
box reads **"Brades; Plymouth abandoned 1997"** — the second Capital row in two batches that is a
sentence rather than a place name, after Nauru's "None; offices at Yaren", and both are right rather than
tidy. The paper also gives the figure that makes the island legible: of 103 km², **only 40.1 are
habitable**.

**Saint Helena is one island and three capitals, and the card has to say so.** The territory is Saint
Helena, Ascension and Tristan da Cunha; UNdata's 309 km² and 5,000 people are footnoted "Including
Ascension and Tristan da Cunha", and the working paper breaks the population into 4,122 on Saint Helena
(June 2025), about 800 on Ascension and 221 on Tristan da Cunha, with Jamestown, Georgetown and Edinburgh
of the Seven Seas as their seats. **A card whose answer is one island but whose figures are a territory's
must name both**, which is C1's Cyprus problem in a different ocean. The 2009 constitution is what made
the difference: it renamed the territory from "Saint Helena and its Dependencies" and gave the three
groups equal standing.

**And batch 77's digit-in-a-word test was confirmed three times over in one batch.** The Saint Helena
paper decodes D as `6` (`6ata`, `6ecember`), Montserrat's decodes A as `3` (`3ntigua`, `3lliouagana`,
`3pril`), and the Falkland Islands' decodes four letters at once — C as `5`, G as `9`, B as `4`, D
unaffected (`5onstitutional`, `9eneral Assembly`, `4ritain`). Five files, five different substitution
sets. **One warning to add: do NOT fix it with a global replace.** Running `.replace('6','D')` over the
Saint Helena text turned the genuine years 1633 and 1659 into "1D33" and "1D59" — the repair corrupted
the digits it was meant to leave alone. Read the affected tokens by eye; there are never many.

**Batch 80 (Nauru, Tuvalu, Saint Pierre and Miquelon) names the pass's blind spot: THE FRENCH OVERSEAS
COLLECTIVITIES.** Batch 79 deferred `gw-218` Saint Martin because nothing openable names Marigot. This
batch met the same wall twice more and both are deferred — **`gw-223` Wallis and Futuna** and **`gw-224`
Saint Barthélemy** — so three of the four French Caribbean and Pacific collectivities this deck reaches
are now blocked, and always in the same place. The cause is measured rather than guessed: the
collectivities' own sites are JavaScript single-page applications (`comstbarth.fr` serves a 760-byte shell
with one empty `<div id="app">`), `insee.fr`'s dossiers, comparateur and search are all JS-driven,
`legifrance.gouv.fr`, `outre-mer.gouv.fr` and `vie-publique.fr` are 403 or serve 281-byte stubs, and the
prefectures publish news rather than facts. **France's own institutional web is the least readable of any
metropole in this deck** — the United Kingdom hands over whole constitutions on `legislation.gov.uk`, the
Netherlands writes plain topic pages on `government.nl`, Denmark's territories publish their own
statistics, and the United States has both C-24 papers and the Office of Insular Affairs.

**Wallis and Futuna is deferred over a SPELLING, which is a first.** Everything else is there: UNdata's
11,000 for 2025, 142 km² and CFP franc; the Overseas Countries and Territories Association's census
figure of about 11,620 for 2023, its 72.5/27.5 split between Wallis and Futuna, and the three customary
kingdoms (Uvea on Wallis, Alo and Sigave on Futuna) alongside a prefect and a 20-member Territorial
Assembly. **But UNdata is the only reachable source that names the capital, and it writes "Matu-Utu"** —
verified in the raw HTML, not an artefact of extraction — where the name is Mata-Utu, which `gw-723`
already plans. Printing the source's spelling teaches a reader an error; printing the right one asserts
what no cited source says. **A source's typo can block a card as effectively as a missing figure**, and
the honest answer is the same: defer, and say why.

**OCTA — the Overseas Countries and Territories Association — is the route that will unblock them, and it
is the batch's real find.** Co-funded by its members and the European Union, it publishes a profile per
OCT with the figures a facts box needs: Saint-Pierre-and-Miquelon at 242 km² and 6,008 people (2016), the
Morne de la Grande Montagne at 240 m, the organic law of 21 February 2007, the 19-member Territorial
Council, taxation and customs as territorial competences, and French law applying directly. It carried
Saint-Barthélemy's 21 km² (25 including islets) and 9,793 (2018) too. **What it does not carry anywhere
is a capital**, which is exactly the field the French collectivities fail on — so it rescues the prose and
not the box. Saint Pierre and Miquelon ships only because **UNdata has a `pm` profile and names
Saint-Pierre correctly**.

**The Commonwealth's Key Facts is the source that answers the capital question HONESTLY**, and after five
batches of UNdata failures that is worth stating as a preference. For Nauru it says outright **"No
official capital, government offices in the district of Yaren"**; for Tuvalu, **"Vaiaku (government
offices), Fongafale islet, Funafuti atoll"** — a seat, an islet and an atoll, where UNdata gives
"Funafuti" flat. UNdata's Nauru entry meanwhile is the sixth capital-field failure and again confesses in
its own footnote: the 11,300 it gives for Yaren "Refers to Nauru", i.e. the whole country. **Nauru's facts
box therefore reads "None; offices at Yaren"** — the first card in the deck whose Capital row is not a
place name, and the right answer rather than a tidy one.

Two smaller notes. **The World Bank now files Nauru under its Nauruan name, Naoero**, which is worth
knowing before a series lookup fails on the English one. And **Tuvalu's own term was reconciled**: it said
"roughly 11,000 people" where UNdata gives 10,000 and the World Bank 9,492 for 2025, and both it and
Nauru's lost a rank superlative no source states ("the fourth smallest state in the world", "the third
smallest state by area") — the figures they already print say the same thing and can be checked.

**Batch 79 (Anguilla, Palau, Cook Islands) MEASURED the shape batch 74 corrected, and the two lists'
holes turn out to be independent.** Batch 74 established that UNdata's profile set is narrower than M49
and must be tested per entity; this batch met four entities in one sitting and every combination
appeared. **Saint Martin: World Bank yes, UNdata no** (`mf` returns 500, `MAF` has both population and
area series). **Anguilla: UNdata yes, World Bank no** (`AIA` returns an empty result set — no error, a
`total` of 0, which is the quieter failure of the two). **Cook Islands: UNdata yes, World Bank no**
(`COK` is not a valid country code at all). **Åland, last batch: neither.** So the two are not one list
with one set of gaps — they are independent registers, and **the only reliable procedure is to try both
for every entity**, which costs two requests and settles it.

**`gw-218` Saint Martin is DEFERRED, and on the narrowest possible ground: nothing openable names its
seat of government.** Everything else is there — the World Bank's population series (24,941 for 2025,
down from 37,369 in 2015, a third gone since hurricane Irma), its area series at 50 km², the European
Commission naming Saint-Martin one of the EU's nine **outermost regions** where "EU law and all the
rights and duties associated with EU membership apply", Article 355(1) TFEU listing it among the regions
the Treaties apply to under Article 349, the M49 entry (663, MAF), and Anguilla's own working paper
locating the island 8 km to its south. What is missing is Marigot: `insee.fr`'s dossier and comparateur
are JavaScript shells, `legifrance.gouv.fr` and `outre-mer.gouv.fr` are 403, the collectivity's own site
mentions Marigot only in a meeting-room address, and the prefecture's does not mention it at all. **The
facts box could have taken a Status row instead and the card would have shipped**; it is deferred because
the plan already numbers `gw-718` Marigot, and a countries card that quietly drops the Capital row every
other card carries is a worse answer than a gap the plan explains.

**A stranded marker was found in the Palau term, and it is the kind only reading the source catches.**
The term said "its capital is Ngerulmud" with the marker pointing at UNdata — **which names Melekeok**.
Nothing was broken: the fold listed a real source, the claim is defensible, and `gloss-source-audit.js`
counts citations rather than checking them. It now says what its source says. The card carries the whole
picture instead, because UNdata's own footnote confesses it: the capital-city figure of 11,400 for 2018
"Refers to Koror", and the recognition guide puts the American embassy at Koror too. **`gw-720` Ngerulmud
needs a source or a re-plan** — nothing reachable here names it (`palaugov.pw` serves a 202 challenge,
`un.int` and `pacificdata.org` are 403, the Pacific Islands Forum's page says nothing).

**The capital field has now failed in five distinct ways across four batches, and in three of them
UNdata says so itself.** Batch 75: Pago Pago's 48,500 is an agglomeration larger than American Samoa's
whole population; Cockburn Town's is a hundred people dated 2001. Batch 76: Garapan named where the
government sits at Capital Hill. This batch: Palau's figure "Refers to Koror", and the Cook Islands'
13,100 for Avarua "Refers to the island of Rarotonga" — which is the entire country. **The footnote is
the field's own erratum slip; read it before copying the value.**

Two more things worth keeping. **UNdata's Cook Islands area footnote makes a constitutional-sounding
claim that is a filing convention**: 236 km² "Excluding Niue, shown separately, which is part of Cook
Islands, but because of remoteness is administered separately". Niue is a self-governing state in free
association with New Zealand in its own right and has its own card coming; the note is repeated on the
card **attributed to the statistics division**, never asserted. And **`legislation.gov.uk` served a
second overseas-territory constitution**, the Anguilla Constitution Order 1982 (SI 1982/334), forty years
older than batch 77's Turks and Caicos order and equally complete — so the route is not a recent-instruments
one, and it should carry Montserrat, the Falklands, Saint Helena and the rest of the deck's British
territories.

**Batch 78 (Marshall Islands, San Marino, Åland) met the deck's THIRD entity invisible to both
quantitative sources and did NOT defer it, which is what the batch is for.** `data.un.org/en/iso/ax.html`
returns 500 and `ALA` is not a valid World Bank country code — the Jersey and Guernsey shape exactly, and
the third instance of the pattern batch 74 narrowed to "the profile sets are their own lists, test per
entity". Jersey and Guernsey were deferred because nothing else could fill a facts box. Åland can be
filled twice over, from **its own government and its own statistical office**: `aland.ax/en/facts-about-aland`
and `asub.ax/en/facts-about-aland`. **A territory outside the UN's statistical system may still publish
everything about itself** — the deferral test is whether an OPENABLE source states the figures, never
whether UNdata carries a profile.

**The Government of Åland's page is the richest single source this pass has met**, and it is worth saying
what it contains, because a card can be written from it end to end: the definition ("an autonomous,
demilitarised, Swedish-speaking region of Finland"); the main island holding 70 per cent of the land and
90 per cent of the people; Mariehamn founded in 1861 and Sottunga "the smallest municipality in Åland,
and all of Finland"; the Lagting's 30 members and four-year terms; the Finnish President's veto limited
to two named cases; the lump sum at 0.45 per cent of Finnish government income; right of domicile as a
regional citizenship; and the whole demilitarisation history — Bomarsund taken by British and French
troops in the Crimean War, demilitarisation by a **one-sided Russian commitment** at Paris in 1856,
the League of Nations settling the affiliation in 1921 with a convention signed by ten states that added
neutralisation, **Russia not a party to it**, and the Moscow Treaty of 1940 and Paris Peace Treaty of
1947 carrying demilitarisation but not neutralisation. That last distinction is the sort of thing only a
source with an interest in the question states precisely, and it is stated by the party with the
interest — which is why the card attributes it rather than asserting it.

**The area came from a fourth kind of source: a Nordic Statistics PXWeb API query.** Batch 76 found that
a PxWeb page embeds its whole series as a `pxDatas` block; here the same software answers a POST to
`pxweb.nordicstatistics.org/api/v1/en/.../AREA02.px` with JSON, giving Åland **1,586 km²** for 2024
alongside Finland's 338,485 and a comment noting that Finland's figure "Includes Åland". **When a PxWeb
site is the only holder of a figure, query its API rather than scraping its page** — it is two lines and
the answer carries its own metadata.

**The M49 change log paid a second time and on a second trusteeship entity.** Batch 76 found it dating the
Northern Mariana Islands to 1991; here it dates the **Marshall Islands to 1991 in the same words**
("Formerly part of Pacific Islands (Trust Territory)") and **Åland to 2003** ("Issued a numerical code in
2003"), which is nine years after Åland's EU accession and has nothing to do with any constitutional
change — so the log dates a STATISTICAL decision, which sometimes coincides with a political one and
sometimes does not. **Read the reason column, not just the year.**

Two smaller notes. **C10's Marshall Islands finding now has its own card**: the population has fallen in
every year the World Bank records, 48,800 in 2015 to 36,282 in 2025, a quarter of it gone in a decade
under the Compact's free movement, and this is the deck's steepest decline so far — stated as the series
rather than as a superlative. And **the recognition guide's San Marino entry is the third of its
inversions**, after Andorra in batch 73 and Monaco in batch 77: recognition there is a letter, Lincoln's
of 7 May 1861 accepting an offer of honorary citizenship, which the guide quotes — "although your
dominion is small, your State is nevertheless one of the most honored, in all history" — and no
ambassador was accredited for another 145 years.

**Batch 77 (British Virgin Islands, Gibraltar, Monaco) settles the World Bank area question and finds
the first entity in this deck whose AREA IS ITSELF DISPUTED.** Batch 74 read `AG.SRF.TOTL.K2`'s failures
as a problem at the extremes of size; batch 75 measured three successes and concluded it fails per entity
rather than by size. This batch is the confirmation, because it holds two failures and one success at
sizes that overlap: **Monaco 74.9 km² against the statistics division's 2** (37 times over) and
**Gibraltar 10 against 6**, where the **British Virgin Islands' 150 against 151** is right — and batch 75's
Sint Maarten, at 34 km², is smaller than Gibraltar and correct. **There is no size rule; the guard is a
plausibility check per entity**, and Monaco's failure is the one D1 recorded during the glossary pass and
is now measured on the card side too.

**Gibraltar's area is contested and the working paper prints both claims in one sentence** — 5.8 km²
"according to the administering Power" and 4.8 "according to Spain, which claims sovereignty over the
Territory" — with the statistics division's 6 and the World Bank's 10 beside them. That is four figures
for one place, and the honest card states the disagreement rather than choosing: the facts box takes
UNdata's neutral 6 and the abstract names all four. **The paper does the same for the substance**: the
United Kingdom holds that Gibraltar's territorial waters flow from its sovereignty over the land, and
Spain that article 10 of the Treaty of Utrecht ceded only the city, castle, port and fortifications. It
is the plans' rule about a state's account of its own actions in the easiest possible form — **the source
attributes both positions itself**, so the card can carry the dispute without adjudicating it. Two dates
anchor the rest: General Assembly **resolution 2070 (XX) of 16 December 1965**, the first appeal for
talks, and **decision 80/517 of 2025**, still urging a definitive solution in the spirit of the Brussels
Declaration of 27 November 1984 — sixty years of the same request, which is the fact worth a reader's
memory.

**Batch 75's letter-substitution finding needs a sharper test, and this batch supplies it.** That entry
said a subset font may map a capital wrongly and suggested looking for a letter that never appears; run
over all five working papers, no capital is ever wholly absent, because a document mixes fonts and the
letter survives in headers and tables. The real tell is **a digit inside a word**: this batch's British
Virgin Islands paper decodes both D and F (`6utch`, `Jost Van 6yke`, `8inancial services`) and the
Gibraltar paper decodes C and B (`5onstitution`, `4ritish`, `4russels Declaration`), where batch 74's
Bermuda paper had no substitution at all. **Grep an extraction for `[0-9][a-z]`** before trusting a proper
noun in it; the set differs per file and per font within a file.

**`history.state.gov` has an entry that begins before the United States did.** Monaco's summary opens
"When the United States announced its independence from Great Britain in 1776, the Principality of Monaco
was a sovereign, independent country under the military protection of the King of France, Louis XVI" —
the guide's second inversion of its own frame after Andorra's in batch 73, and between them they mark the
two European microstates older than the state whose recognition the guide records. It then gives what no
statistical profile can: annexation to the First French Republic in 1793, independence regained in 1814
and reaffirmed by the Treaty of Vienna, the protectorship of Piedmont-Sardinia from 1815 to 1861 and the
military safeguard of France since, and the **2005 renegotiation of the 1918 Franco-Monégasque treaty**,
after which Monaco began receiving foreign ambassadors at all. Monaco's own term was reconciled against
it and lost two superlatives no source states — "the second-smallest country in the world after the
Vatican" and "the most densely populated state on Earth" — for the figure UNdata prints, 25,732.2 people
to the square kilometre, which says the same thing and can be checked.

The British Virgin Islands, finally, give the C-24 papers' least expected use: **a working paper reporting
a finding AGAINST the territorial government it describes.** The Commission of Inquiry established in
January 2021 reported publicly on 29 April 2022 with 49 recommendations, and found that belonger status by
tenure was being measured against a 20-year residence requirement the Cabinet had applied since 2004
"contrary to the statutory criteria in section 16(3) of the 1977 Immigration and Passport Act" — unlawful,
in the Commission's word, with a review published in September 2023 making fifteen more recommendations.
**The papers are not a territory's self-description**; where a governance failure is on the record they
carry it, which is what makes them usable as a spine at all.

**Batch 76 (Northern Mariana Islands, Sint Maarten, Liechtenstein) found that the M49 list is not only a
register of codes but a DATED RECORD OF WHEN AN ENTITY CAME INTO BEING.** Its change log carries
`580 | Northern Mariana Islands | 1991 | Formerly part of Pacific Islands (Trust Territory) (numerical
code 582)` and `534 | Sint Maarten (Dutch part) | 2010 | Formerly part of the Netherlands Antilles
(numerical code 530)` — the statistical trace of two constitutional changes, one the year after the
Security Council ended the Trusteeship Agreement and the other the year the Netherlands Antilles was
dissolved. Batch 74 reached for this list to settle a question about Jersey and Guernsey and found it
carried a change log at all; **it is worth grepping for any territory whose status changed in living
memory**, since it dates the change in the UN's own books and needs no second source to interpret.

**A UN digital-library RECORD PAGE may carry the whole substance of a resolution in its Summary field,
which matters because so many of the older PDFs are image scans.** Batch 74 could cite A/RES/849(IX) only
for its title. Here the record for **S/RES/683 (1990)** prints a full abstract: that the peoples of the
Federated States of Micronesia, the Marshall Islands and the Northern Mariana Islands had approved their
new status agreements in plebiscites observed by visiting missions of the Trusteeship Council, and that
the Council determined the Trusteeship Agreement's applicability terminated with respect to them. The
record also gives the meeting (2972nd), the date (22 December 1990) and the **vote (14–1)** in fields of
their own. **Read the record before opening the PDF**: it is faster, it survives a scanned file, and its
Summary is written by the Library rather than extracted.

**`doi.gov` answers, and the Office of Insular Affairs is to the American territories what the C-24
working papers are to the listed ones.** The Northern Marianas have no working paper — they left the
United Nations' books in 1990 — so the equivalent institutional account is the administering power's own,
and OIA's page gives the whole constitutional sequence in five sentences: the Trust Territory administered
for the United Nations from 1947, the Covenant passed into federal law in 1975, the constitution adopted
in 1977, the first constitutional government in 1978, federal minimum wage rules in 2007, federal
immigration law in 2008, and Homeland Security taking over immigration and border controls in June 2009.
**Reach for it for Guam, American Samoa and the US Virgin Islands too**, beside their working papers.

**A third capital-field divergence in two batches, and this one is a seat-of-government case rather than a
stale figure.** UNdata names **Garapan** as the capital of the Northern Marianas; the Office of Insular
Affairs addresses the Governor at **Capital Hill, Saipan**. That is C10's Palau case exactly — Ngerulmud
against Melekeok — and it is recorded rather than corrected: the facts box takes UNdata's field and the
abstract says where the government actually sits. With batch 75's Pago Pago agglomeration and Cockburn
Town's hundred people dated 2001, **the capital field has now failed three ways in two batches** and
should be read as a claim to check rather than a value to copy.

**`government.nl` carried a whole card on its own, four pages of it.** Batch 69 found the route and batch
71 extended it; Sint Maarten is where it pays in full, because four separate topic pages each answer a
different question — the constitutional change of 10 October 2010, the division of powers under the
Charter for the Kingdom, the Governor's role and the Ministers Plenipotentiary, and the reconstruction
after hurricane Irma. The last is the most useful and the least expected: a government explaining what it
spent and on what condition. **Sint Maarten has no Minister Plenipotentiary in Washington where Aruba and
Curaçao do**, which the governance page states outright and which no statistical profile would ever
contain.

Liechtenstein, finally, is the batch's quiet correction. Its glossary term said the country shares with
Switzerland "a currency, a customs union and its diplomatic representation abroad" — present tense — where
the recognition guide says it *yielded* control of its foreign affairs to Switzerland "for much of the
twentieth century" and then "began pursuing independent membership in international organizations at the
end of the twentieth century", joining the United Nations in 1990 and receiving its first accredited
American ambassador in 1997. **A present-tense clause about an arrangement a source describes in the past
is the same error as a superlative no source states**, and it is easier to miss, since nothing in the
sentence looks like a claim.

**Batch 75 (Saint Kitts and Nevis, American Samoa, Turks and Caicos Islands) REFINES batch 74's warning
about the World Bank's area series into something usable.** Batch 74 found `AG.SRF.TOTL.K2` wrong by
eighty times for Bermuda, nine for the Faroe Islands and five for Greenland, and the reasonable inference
was that it fails on very small and very large entities. It does not: here it gives Saint Kitts and Nevis
**260 km²** against UNdata's 261, American Samoa **200** against UNdata's 199 and the working paper's 200,
and the Turks and Caicos Islands **950** against UNdata's 948 and the working paper's 948.2 — every one
right, at the series' own rounding of 10 km². **The series is not systematically wrong at any size; it
holds bad values for particular entities**, so the guard is a plausibility check per entity rather than a
rule about size, and it is cited on two of this batch's three cards.

**A C-24 working paper may take its population STRAIGHT FROM THE WORLD BANK, in which case the two are
not corroboration.** American Samoa's working paper prints "Population: 46,765 (2024 World Bank)" — naming
its source in the field itself — so citing both would be C8's `SP.POP.TOTL`-relay problem one level up.
Where the paper does NOT name a source it is an independent estimate and the divergences are real: the
Turks and Caicos paper's 50,828 for 2024 sits 8 per cent above UNdata's 47,000 and the World Bank's
46,855, so batch 71's rule applies and the two that agree take the facts box. **Read the population field
for a parenthesis before treating a working paper as a second source.**

**`legislation.gov.uk` answers, and a British overseas territory's constitution is a statutory instrument
on it.** The Turks and Caicos Islands Constitution Order 2011 is SI 2011/1681, served in full, and it
carries what no summary does: section 37 lists the Governor's special responsibilities as defence,
external affairs, **the regulation of international financial services**, internal security including the
Police Force, and public-service appointments; section 43 composes the House of Assembly as a Speaker,
fifteen elected members, four appointed members and the Attorney General, who may not vote. That is
batch 72's finding one shelf higher — **reach for the metropole's operational guidance, and then for its
statute book** — and it should serve every other British overseas territory in this deck.

**Two UNdata capital-city figures in one batch are unusable, and each fails differently.** American
Samoa's gives Pago Pago 48,500 for 2018, which is LARGER than the whole territory's 46,000, the field
being an urban agglomeration where the territory is shrinking; the Turks and Caicos figure is **0.1
thousand — a hundred people — and dated 2001**, a quarter of a century old. Batch 70 made reading that
footnote a standing step and this is why: neither figure is printed on either card, and both capitals are
named without one.

**A subset font can map a single letter wrongly, and the extraction reads perfectly while a name is
silently misspelt.** Both 2026 working papers decode capital D as `6`: `6epartment of the Interior`,
`6utch`, `6emocratic Party`, `6ominican Republic`, and the Turks and Caicos Governor as
`6ileeni 6aniel-Selvaratnam`. The substitution is consistent, so it is legible once seen — and that is
the danger, since a proper noun met only once has nothing to be checked against. **Read an extraction for
a letter that never appears**; here the absence of every capital D is the tell, and Bermuda's paper in
batch 74 had no such fault, so it is per file rather than per publisher.

The three cards themselves are the deck's three modes side by side. **Saint Kitts and Nevis closes the
Bridgetown thread with the guide saying it outright** — "All U.S. ambassadors have been resident at
Bridgetown, Barbados" — after eight cards of inferring it from where each ambassador presented
credentials; Frank V. Ortiz Jr. appears for the fifth time (Special Representative from 1 September 1977
to five states at once) and Milan D. Bish for the fourth, heading the American delegation at the
independence ceremonies on 19 September 1983, the day of both independence and recognition. Its
population is a three-way split decided by C10: UNdata's 47,000 and the World Bank's 46,922 against the
**Commonwealth's 53,000 for 2022, a figure the World Bank's series never passes through** at any year
from 2015 to 2025, so by C8's test it is contested rather than stale and the two that agree take the
box. **American Samoa is carded on the status rather than the statistics**, because the working paper
states something no profile does: a person born there neither of whose parents is a United States citizen
is a United States **national and not a citizen**, free to live and work anywhere in the country and
unable to vote in its federal elections. And its population is falling hard — 52,878 in 2015 to 46,029 in
2025, an eighth gone in a decade — which with C10's Marshall Islands makes the second Pacific territory
in this deck emptying under free movement to the metropole.

**Batch 74 (Bermuda, Greenland, Faroe Islands) DISPROVED A FINDING THIS FILE HAD ALREADY PUBLISHED
TWICE, and that is its most useful output.** Batches 72 and 73 explained why `data.un.org/en/iso/je.html`
and `.../gg.html` return 500 by saying that UNdata follows the UN's own list of countries and areas, on
which the Channel Islands are one area rather than two. Reading the **UNSD's M49 list** for this batch's
three codes settles it the other way: `Jersey | 832 | JEY` and `Guernsey | 831 | GGY` each hold entries of
their own, the change log records that Guernsey was "issued a separate numerical code in 2005", and a
footnote states outright that "Channel Islands (numerical code 830) **has been removed** from the list of
geographic regions". So the list carries the two bailiwicks and it is UNdata's PROFILE SET that does not
— a narrower list of its own, with no published rule behind it. **An explanation that fits two
observations is not thereby a rule**; both entries are corrected in place, and the standing instruction
is now to TEST a profile URL per entity rather than to predict it. Nothing shipped wrong on the back of
it — Jersey and Guernsey were deferred for want of a facts box either way — but the next reader would
have believed it.

**The World Bank's area series was unusable on all three, which extends C11's warning from "contains
errors" to "is wrong by orders of magnitude at both ends of the size range".** `AG.SRF.TOTL.K2` gives
Bermuda **4,290 km²** against the working paper's 53.35, the Faroe Islands **12,960** against 1,393, and
Greenland **410,450** against 2,166,086 — too large by eighty times, nine times and five times too small
in turn. C11 caught Canada at 15,634,410 and the Dominican Republic at 146,839; three more in one batch
makes the series a source to check against another before quoting, never one to adjudicate with. It is
cited on none of these three cards, where the population series `SP.POP.TOTL` is cited on all three and
agrees with everything.

**UNdata rounds a population to whole thousands, and on entities this small the ROUNDING is itself a
divergence.** Its Greenland profile gives 56,000 for 2025 where the World Bank gives 56,831 and
*Greenland in Figures 2024* says "just about 57,000"; its Faroe Islands profile gives 56,000 where the
World Bank gives 54,900 and Statistics Faroe Islands counted 55,070 in August 2025. C10's rule — two
sources agreeing against UNdata take the facts box — applies unchanged, and both cards print 57,000 and
55,000 respectively while the abstract names the rounding. Bermuda is the control: UNdata's 65,000, the
World Bank's 64,555 and the working paper's 63,905 all sit within a percent of each other.

**A statistics office that looks like a JavaScript statbank may be serving every number in its own
HTML.** `hagstova.fo` renders as a navigation shell and `hagstova.fo/en/faroe-islands-figures` 404s, so
the obvious conclusion is that Statistics Faroe Islands is unreadable from here — and it is wrong. Every
table on a Hagstova page is embedded as a `pxDatas.push({…})` block carrying the whole series in a
`"data"` array beside its PX metadata: the stub and heading variables, the month or year list, the source
line, the footnotes. Parsing one gives the monthly population since 1985, the eighteen islands with their
areas and altitudes, the highest mountains, the largest lakes and the per-island density, all without
running a line of the page's script. **Grep a statistics page for `pxDatas` before writing the office
off**; this is the standard PxWeb front end and the same trick should serve any Nordic office.

**The Faroe Islands are the deck's SECOND empty date line after the Isle of Man, and the card describes
the territory's status entirely through what institutions DO about it.** `government.fo` and
`norden.org` are 403 here, `retsinformation.dk` is a JavaScript application, and `logting.fo`, `um.dk`
and `denmark.dk` 404 on every path tried, so nothing openable states the constitutional arrangement or
dates it. What IS citable is the practice: the Danish krone is the currency, the United Nations excludes
the islands from its figures for Denmark and files them separately under Northern Europe with the code
234, its foreign-born share counts people born in Denmark and Greenland as foreign-born, and **Article
355 of the Treaty on the Functioning of the European Union provides that the Treaties "shall not apply to
the Faeroe Islands"**. **Where no source states a status, describe the practice** — what an institution
does about an entity is citable where what the entity IS, is not. Two smaller notes from the same card:
the treaty spells it **Faeroe**, which is also `world.js`'s map key, where every statistical source
writes Faroe; and the FAO's fishery country profile at `fao.org/fishery/en/facp/fro` serves a
five-language "Page not found" **with a 200 status**, a sixth variety of 200-status error document after
`senate.gov`, `state.gov`, the Security Council's CloudFront block, the UN press "Client Challenge" and
`history.house.gov`.

**Greenland's own term was corrected on one word.** It said Denmark "reasserted control in 1721" where
*Greenland in Figures 2024* says Greenland "became a Danish colony" that year — *reasserted* smuggles in a
prior Danish control the source does not assert, and the fix costs the term nothing, both phrases running
to five words. Its card is carried by that publication's own page 4, which states the 81 per cent ice
cover, the world's lowest population density at 0.3 people per square kilometre of ice-free ground, Nuuk
at 19,880 on 1 January 2024, the 44,087 km of coastline, and the sequence colony 1721 → Danish county
1953 → home rule 1979 → self-government 21 June 2009 → out of the European Economic Community in 1985
after a referendum in 1982. **A/RES/849(IX) is an image scan with no extractable text**, so it is cited
for what its catalogue record states — and the title IS the fact: "Cessation of the transmission of
information under Article 73e of the Charter in respect of Greenland", adopted at the 499th plenary
meeting on 22 November 1954. Bermuda takes the mirror of it, A/RES/66(I) of 14 December 1946, whose text
does extract and does name Bermuda among the territories the United Kingdom reported on — the two
resolutions bracketing the same list, one entering and one leaving. Both entities, incidentally, are
filed by the United Nations under **Northern America**, which is a fact about M49's regions rather than
about either place.

**Batch 73 (Andorra, Cayman Islands, Dominica) found the one entry in the recognition guide with NO
RECOGNITION IN IT, and it is Andorra.** Every other page in the guide answers the question *when did the
United States recognise this state*; Andorra's answers that the question does not arise. "Andorra has
considered itself independent since medieval times, and therefore was already independent when the United
States declared independence from the British Empire in 1776. Unlike many other independent states in the
late eighteenth century, Andorra never signed a bilateral treaty with the United States, which would have
legally constituted recognition of the new republic." **The guide inverts its own frame** — the older state
is the one that did not need recognising — and its diplomatic history therefore begins in 1995, with an
exchange of letters, 202 years after the constitutional history of most of its neighbours. That left the
card without a recognition date to anchor it, and what fills the gap is **the General Assembly's own
admission resolution**, A/RES/47/232 of 28 July 1993, adopted without a vote at the 108th meeting: where a
state has no recognition act, **its admission to the United Nations is the datable equivalent and the
digital library holds one for every member**. **`gw-201` Guernsey is deferred with `gw-195` Jersey, which
settles batch 72's finding as a pair rather than a one-off**: `data.un.org/en/iso/gg.html` returns 500 and
`GGY` is not a valid World Bank country code at all — the API answers "The provided parameter value is not
valid" — so both Channel Island bailiwicks are invisible to both quantitative sources while the Isle of
Man, Gibraltar and the Faroes each have a profile. **Two entities failing the same way in successive
batches is a rule, not an accident**, and the rule is only that the profile sets of UNdata and of the
World Bank each have holes in them, which have to be measured per entity (the stronger explanation
offered here and in batch 72 — that both follow a UN list carrying the Channel Islands as one entry —
is corrected in batch 74). The Cayman Islands are the fourth
territory carried by a C-24 working paper and the first whose history is mostly ADMINISTRATIVE rather than
diplomatic: settled by the British between 1661 and 1671, self-government growing from 1734, an Assembly of
Justices and Vestry in 1831, slavery abolished in 1834, and **a dependency of Jamaica from 1863 which stayed
under the Crown when Jamaica became independent 99 years later** — the working paper counts those 99 years
itself, which is the sort of sentence no statistical profile ever contains. Its population is batch 71's
Virgin Islands case inverted once more and decided the same way: the working paper's 84,738 for 2023 sits
above UNdata's 76,000 and the World Bank's 74,457, so **the two that agree take the facts box and the
abstract prints all three**. Dominica, finally, closes the Bridgetown thread at eight cards and puts the
same three names on their third card each: **Frank V. Ortiz Jr. attended its independence celebrations as
President Carter's personal representative**, which is the recognition; **Sally Angela Shelton**, Saint
Lucia's first ambassador, was Dominica's too and presented her credentials at Bridgetown; and **Milan D.
Bish** covered Saint Vincent, Antigua and Barbuda and four more from the same desk. **Where a deck's
entities are small and adjacent, the same handful of officials recurs, and naming them is what makes the
pattern visible** rather than eight separate cards each mentioning Barbados in passing.

**Batch 72 (Saint Vincent and the Grenadines, Antigua and Barbuda, Isle of Man) produced the pass's
FIRST DEFERRAL IN THE 190s, and the reason narrows batch 69's rule.** `gw-195` **Jersey is deferred**:
`data.un.org/en/iso/je.html` returns 500 and the World Bank has no `JEY` series at all, so it is the first
entity in this deck invisible to BOTH of the pass's quantitative sources. Batch 69 concluded from Western
Sahara that "the test is the ISO code, not statehood"; Jersey has ISO `JE` and no profile, so the rule needs
its second half: **UNdata's country profiles do not cover every entity holding an ISO code** — measured
here, `im` (Isle of Man), `gi` (Gibraltar) and `fo` (Faroe Islands) all answer 200 while `je` and `gg`
both 500. *(Corrected in batch 74. This entry first explained the gap by saying UNdata follows the UN's
own list of countries and areas, on which the Channel Islands are one area rather than two. That is
wrong: the UNSD's M49 list gives* **Jersey 832/JEY and Guernsey 831/GGY entries of their own**, *and its
own footnote records that "Channel Islands (numerical code 830) has been removed from the list of
geographic regions". The profile set is its own list, narrower than M49, and has to be tested per entity
rather than predicted from one.)* Its own government
answers where the international bodies do not — **`opendata.gov.je`, a CKAN portal, serves the States of
Jersey's population series as CSV** (104,540 at the end of 2024, growing only by migration: 730 births
against 880 deaths and net migration of 670) — but `www.gov.je` itself is 500 on every path tried, the
portal has no land-area or capital dataset, and the World Bank's only relevant series is a **Channel
Islands** aggregate that would serve Jersey and `gw-201` Guernsey identically. **A card whose facts box
cannot be filled from sources is deferred, not padded**; Jersey waits for a land area and a seat of
government from something openable. The Isle of Man took its place and is the contrast that proves the
point: a full UNdata profile, a World Bank series agreeing with it to 160 people, and **two United Kingdom
sources that turn out to be far better than expected** — His Majesty's Passport Office's *Knowledge Base
profile* and the Home Office's *Common Travel Area* guidance, which between them state the constitutional
position in terms a card can quote ("not part of the UK but self-governing dependencies of the Crown …
their own directly elected legislative assemblies, administrative, financial and legal systems and their own
courts of law"), name the statutes that call them "the islands", and set out the Common Travel Area as an
arrangement between the United Kingdom, Ireland and the three dependencies. **Reach for a metropole's
OPERATIONAL guidance, not its ceremonial pages**: a passport office's staff manual is written to be relied
on and says what a constitutional summary will not. The Isle of Man is also **the deck's first card with an
EMPTY date line**, deliberately: nothing openable dates anything about it, and CLAUDE.md's rule is that an
empty date line is the honest answer rather than a sentence apologising for the absence. The two Caribbean
cards, meanwhile, finish the Bridgetown thread that has run through five batches. Saint Vincent's
recognition is the deck's **longest gap between independence and recognition** — independent on 27 October
1979, recognised only on 23 November 1981 with the appointment of Milan D. Bish, more than two years — and
the relations sentence names the hub outright: Bish presented his credentials **at Bridgetown**, being
concurrently ambassador to Antigua and Barbuda, Barbados, Dominica and Saint Lucia and special
representative to Saint Christopher and Nevis, **one man accredited to six places at once**. Antigua and
Barbuda gives the "recognition IS the embassy" mode its third instance after the Bahamas and Barbados, and
then **the second closed embassy in the deck**: Saint John's closed on 30 June 1994 and, unlike Seychelles',
never reopened. One measurement note: the Commonwealth publishes Antigua's area **island by island** — 280,
161 and 1.6 km² — which is the only entry in the pass to break its own total down, and adds to 442.6 against
UNdata's 442.

**Batch 71 (Aruba, United States Virgin Islands, Tonga) is where an alias rule was applied BEFORE it
could bite, for the first time in the pass.** N7 found that "an alias list written before the sibling term
existed will contain the sibling's name, and will be wrong the day the sibling arrives" — `United_Kingdom`
carrying "Britain" and "Northern Ireland" was the case that produced it. The draft term for the United
States Virgin Islands carried the bare alias **"Virgin Islands"**, which reads perfectly today and would be
wrong at `gw-212`, the British Virgin Islands, already in this plan's running order. **Grep the running
order for the sibling before writing an alias**; it costs one command and it is the only point at which
this fault is cheap to fix. The alias was cut to the two unambiguous forms. Tonga is the batch's history,
and it is **the deck's second country recognised twice, by a different mechanism from Montenegro's**. The
United States and the King of Tonga signed a Treaty of Amity, Commerce and Navigation at Nuku'alofa on 2
October 1886, which is the act the guide records as recognition; when Tonga became a British protectorate in
1900 the Foreign Office took over all its external affairs, the United States stopped appointing
consuls-general, and **on 28 July 1920 the Foreign Office terminated the 1886 treaty on the King's behalf** —
so where Montenegro's recognition was withdrawn by the recognising state, Tonga's lapsed because the
protecting power cancelled the instrument that carried it. It was recognised again on 4 October 1972, 86
years after the first, **by the appointment of Kenneth Franzheim II** — the same ambassador who had presented
credentials at Apia for Samoa the year before, in batch 68. Tonga also gives the Commonwealth's **fourth
variety of joining line**: "1970, on withdrawing from British protectorate", after the ordinary independence
line, Vanuatu's condominium and Samoa's end of New Zealand administration. **The USVI is the reverse of
Curaçao's divergence and is decided the other way.** Where Curaçao's UNdata figure was a fifth ABOVE the
World Bank's with no corroboration either way, here UNdata's 84,000 for 2025 sits a fifth BELOW two sources
that agree closely — the Secretariat's own working paper at 104,917 for 2023 and the World Bank at 104,377
for 2024 — so C10's Kiribati precedent applies and **the facts box drops UNdata for the two that agree**,
while the abstract prints all three. **Two sources agreeing beat one disagreeing; one against one is
printed and not adjudicated.** Aruba, meanwhile, extends batch 69's `government.nl` route into real
constitutional detail — the Governor appointed by the King for six years and reappointable once, holding no
ministerial responsibility, appointing a five-member Advisory Council; the Minister Plenipotentiary in The
Hague who sits with the Dutch ministers as the Council of Ministers for the Kingdom; and the single Dutch
Representation headquartered at Willemstad with an office at Oranjestad. What it does NOT carry is **the
date of Aruba's separate status within the Kingdom**, which is in none of its English pages and returns no
match in the digital library, so the card says nothing about it — the Barbados-republic case a second time,
and the second reminder that a state's own site answers the questions it happens to have written a page
about.

**Batch 70 (Seychelles, Grenada, Micronesia) turns the UNdata capital-city footnote into a STANDING
RULE, because it has now been wrong three times in seven batches and in three different ways.** Malta's
212,800 for "Valletta" is the Northern and Southern Harbour districts; Curaçao's 144,000 for "Willemstad" is
the island's own total excluding some neighbourhoods; and Grenada's 39,300 for "Saint George's" is footnoted
*"Refers to Saint George Parish"*. **Never print UNdata's capital-city population without reading its
footnote** — the field is not a city's population often enough that the safe assumption is the opposite.
Grenada's card states the figure and what it actually counts, which is the honest form. The batch's three
recognitions are all instruments the deck had not met. **Seychelles was recognised by a SATELLITE TRACKING
AGREEMENT**: on 29 June 1976, its independence day, representatives of the two states signed at Victoria an
agreement "relating to the establishment, operation, and maintenance of a tracking and telemetry facility on
the island of Mahe", and that signature is what the guide records as the act of recognition — a technical
annexe standing in for a note verbale. **Micronesia was recognised by a PRESIDENTIAL PROCLAMATION**, Reagan
noting in Proclamation 5564 of 3 November 1986 that the United States had fulfilled its trusteeship
obligations, so that the Compact of Free Association entered into force the same day. And **Grenada's
ambassador presented HER credentials in Washington** on 29 November 1974, three months before the American
ambassador presented his at Saint George's — the recognition running from the smaller state outward.
Micronesia also gives the deck its clearest gap between an American act and a United Nations one: the
trusteeship ended for Washington in 1986, but **the Security Council did not determine that the Trusteeship
Agreement had terminated until 22 December 1990**, by 14 votes to 1, on the ground that the peoples of
Micronesia, the Marshall Islands and the Northern Mariana Islands had approved their new status in
plebiscites observed by Trusteeship Council visiting missions — four years, and the UN membership another
nine months after that. Two more notes. **Bridgetown claims a fourth card**: Grenada's ambassador is
resident in Barbados and its embassy is run by a chargé reporting to him, after Saint Lucia's, the Windward
Islands' special representative and the guide's own statement that Bridgetown is the American base for the
region. And **Seychelles is the pass's first population SERIES BREAK**: the World Bank's figures run 93,419
in 2015 to 99,258 in 2021 and then jump to 119,878 in 2022, a 21 per cent step in one year that is a
rebasing rather than growth — so **C8's stale-versus-contested test assumes a smooth series and cannot be
applied across a break**; read the series before trusting either end of it. The Commonwealth's "98,462
(2022)" is the World Bank's 2020 value, which is the same break seen from the other side. Its embassy is
also the deck's only one to close and reopen — shut on 30 August 1996, relations run through Mauritius for
27 years, reopened on 1 July 2023.

**Batch 69 (Guam, Curaçao, Kiribati) RESOLVED C10's Kiribati deferral, and the answer was in UNdata's own
footnote the whole time.** C10 recorded Kiribati's area as a three-way disagreement — UNdata 726 km² against
811 at the Commonwealth and 810 at the World Bank — and **dropped UNdata from that term outright**, the only
time Phase 3's Source A has been discarded. Its footnote b reads: *"Land area only. Excluding 84 square km
of uninhabited islands."* **726 and 84 make 810.** It was never an outlier; it was a different measure,
stated in its own apparatus, and nobody had read down that far. So the rule to carry is stronger than batch
14's: **a UNdata figure that looks wrong usually carries its own explanation, and the footnote is the first
place to look, not the last** — this pass has now read four of them into cards in six batches and every one
changed what the card could honestly say. Guam and Curaçao between them fill the last two gaps in the
territory recipe. **Guam's C-24 working paper is the American mirror of the French ones** — Navy
administration from 1899 to 1950, the Organic Act of Guam, an unincorporated territory to which not all of
the Constitution applies, residents who cannot vote for a President they become able to elect on moving to a
state, a delegate to Congress, Apra Harbor, the 2020 census ethnic breakdown — though its "Brief history" is
two sentences where New Caledonia's runs to a dozen, so **the block's length varies enormously by
territory**. **Curaçao is the batch's genuinely new route, because it is on NO list at all**: not a
non-self-governing territory, not a Commonwealth member, with no recognition-guide page and no bloc profile,
since the Netherlands Antilles left the United Nations' colonial reporting in 1955. What answers is
**`government.nl`**, the Dutch state's own topic pages, which state outright that "On 10 October 2010
Curaçao and St Maarten became autonomous countries", that the four countries of the Kingdom run their own
governance, education and courts, and that the Kingdom answers for foreign relations, defence and
nationality law. **Reach for the metropole's own government site when a territory belongs to no
organisation.** Its UN half is a resolution record rather than a text: A/RES/945 of 15 December 1955 is a
SCAN with no extractable text, so the card cites only what the catalogue states — the title, the 557th
plenary meeting, and the recorded vote of **21 to 10 with 33 abstentions**, which is itself the most
eloquent fact available about how contested that removal was. **Where a document is an image, cite the
record and not the reading.** Two figure notes. **Curaçao is the pass's widest unexplained population
divergence** — UNdata 186,000 for 2025 against the World Bank's 155,967 for 2024, about a fifth apart, with
no third source and no footnote — so the card gives both and adjudicates nothing, on C5's rule. And UNdata's
capital-city figure for Curaçao is footnoted "Total population of Curaçao excluding some neighborhoods",
making it Malta's harbour districts one island over and **the second time in six batches that UNdata's
"capital city population" is not a city's**.

**Batch 68 (São Tomé and Príncipe, Samoa, Saint Lucia) caught the recognition guide contradicting
ITSELF A SECOND TIME, three batches after Brunei, and this one is in a HEADING.** The Saint Lucia page's
section is headed "Diplomatic Relations Established, **1983**" and the sentence under it says relations were
established on **11 June 1979**, when Ambassador Sally Angela Shelton presented her credentials — dates four
years apart, one of them plainly the other's typo. **Read the guide's prose, never its headings**, which is
now a rule with two instances behind it rather than one anecdote. Saint Lucia is also the deck's clearest
case of **recognition by an APPOINTMENT**: it became independent on 22 February 1979, and the United States,
which had "informally recognized" it as an associated state of the Commonwealth, did not formally recognise
the independence until it appointed an ambassador on 17 May, three months later. Samoa supplies another mode
again — **a congratulatory message from the President hand-delivered by a SENATOR**, Oren Long, to the two
heads of state on 1 January 1962 — and the deck's most persistent absence: relations began on 14 July 1971
and **every American ambassador since has been resident at Wellington**, an embassy was opened at Apia on 15
November 1988, and it has been run by a chargé d'affaires ever since because the ambassador never moved
there. Beside Saint Lucia, whose ambassadors have all been resident in Barbados, and batch 67's note that
Bridgetown serves as the American base for the region, that makes **three cards in two batches whose
diplomatic history is really the history of somebody else's capital**. São Tomé and Príncipe is the
opposite: its whole guide entry is four sentences, relations were established on 10 October 1975 **by an
exchange of diplomatic notes** and nothing has been recorded since — no consulate, no embassy, no
ambassador. It is also **the second country in three batches that is not in the World Trade Organization**,
its working party dating from 26 May 2005 against the Bahamas' 18 July 2001, which is worth carrying: the
deck's remaining small states are where the WTO's accession backlog actually lives. Two content notes.
**Samoa's Commonwealth joining line is a third variety** after C4's independence line and batch 66's
condominium — "1970, following administration by New Zealand", eight years after the independence of 1962 —
and the same page records that Samoa hosted the heads of government meeting in 2024. And **the guide's date
for the start of British rule in Saint Lucia is 1815, where the term said 1814**, so the term was corrected;
its area went 617 → **616 km²**, which UNdata and the Commonwealth give identically, and its "changed hands
fourteen times" went with batch 45's rule, along with São Tomé's "second smallest state in Africa" and "first
plantation colony in the tropics" and Samoa's "first Pacific island country to gain independence" — three
superlatives in one batch, all of them the kind a reader would repeat and none of them in a reachable source.

**Batch 67 (New Caledonia, Barbados, French Polynesia) turned batch 64's Western Sahara route into a
REPEATABLE RECIPE for a non-self-governing territory, and it is better than the one for a small state.**
Neither French territory has a recognition-guide page or a bloc profile, but the Secretariat's annual
**working paper for the Special Committee on decolonization** opens with a "Territory at a glance" block —
land area, exclusive economic zone, population, life expectancy, ethnic composition, languages, capital,
head of government, GDP per head — followed by a **"Brief history" paragraph that runs from first contact to
the present in a dozen sentences**. It is the single richest per-territory source the pass has found: New
Caledonia's gives Cook naming Grande Terre in 1774, the French annexation of 24 September 1853, the overseas
territory of 1946, the *événements* in which about 80 people died between 1984 and 1988, the Matignon
Agreements of 26 June 1988, the Nouméa Accord of 5 May 1998 and all three referendums with the exact
question put to the voters. **Reach for `A/AC.109/<year>/<n>` before anything else on a listed territory**;
the index is a search of the digital library for the territory's name plus "working paper". Two things
follow. **The territory's own re-inscription is a citable General Assembly resolution**, which dates the
status the card asserts: A/RES/41/41 A of 2 December 1986 declares that France is obliged to transmit
information on New Caledonia under Chapter XI and affirms its people's inalienable right to
self-determination, and A/RES/67/265 of 17 May 2013, **adopted without a vote on a draft moved by Nauru,
Solomon Islands and Tuvalu**, put French Polynesia back on the list — three of the smallest states in the
world moving a resolution about a neighbour. And **UNdata and the working paper disagree about area on both
territories, without either being wrong**: 19,100 km² against 18,575 for New Caledonia and 3,687 against
"about 3,500" for French Polynesia, because one is a surface area and the other a land area, so the cards
give both and say which is which. Batch 14's footnote rule pays a third time in four batches: **UNdata's
first footnote on each of them reads "For statistical purposes, the data for France do not include this
area"**, which is the statistical form of the constitutional fact the whole card is about. Barbados adds a
recognition mode the Bahamas gave a batch ago and confirms it is a Caribbean pattern rather than a one-off:
**the act of recognition was the opening of the embassy**, on 30 November 1966, the same day independence
took effect, with the American consular presence on the island dating back to **11 June 1823** — the oldest
date on any card in this deck. Two negative findings worth recording. **`caricom.org` is 403 on every
path**, so the Caribbean has no bloc profile and its states are carried by the Commonwealth, the guide and
UNdata. And **nothing openable from here records that Barbados became a republic in 2021** — not the
Commonwealth's own member page, not the recognition guide, and the digital library returns no match for
"Republic of Barbados" — so the clause stands in the term unmarked, on the C0 practice of keeping an
uncontested claim and recording that it rests on nothing citable, rather than deleting a constitutional
change because this sandbox cannot reach a page about it.

**Batch 66 (Bahamas, Iceland, Vanuatu) found the deck's only case of DIPLOMATIC RELATIONS ESTABLISHED
BEFORE THERE WAS A COUNTRY TO HAVE THEM WITH**, and two more modes of recognition with it. Iceland took over
its own foreign relations on 10 April 1940, the day after Germany occupied Denmark, without declaring itself
independent of the Danish crown; Icelandic officials asked the United States in July and December 1940 to
place the island under its protection **under the Monroe Doctrine**; the United States, "initially
unenthusiastic", concluded that occupying Iceland was a matter of its own national defence and did so on 7
July 1941; and **diplomatic relations and an American legation at Reykjavík followed on 30 September 1941 —
three years before the republic existed**, the guide noting in as many words that "Iceland had taken over
full control of its foreign relations … although the country had not yet declared itself independent from
Denmark". Recognition then came on 17 June 1944, the day of the republic's founding, **in public statements
of congratulation by Roosevelt and Cordell Hull** — a tenth mode, and the only one that is not a document at
all. The Bahamas gives an eleventh: **the act of recognition WAS the opening of an embassy**, relations and
the embassy at Nassau both dated 10 July 1973 with nothing else recorded. And **Vanuatu's relations were
established by an agreement signed by both states** on 30 September 1986, six years after recognition, with
ambassadorial relations following in 1987 through the ambassador to Papua New Guinea and **the embassy at
Port Vila opening only on 19 July 2024, 44 years after the recognition** — the widest gap between
recognition and a resident mission anywhere in the deck. Vanuatu is also **the deck's only condominium**,
held under the joint sovereignty of Britain and France, which shows up in the Commonwealth's joining line as
well: where C4 found that line usually dates an independence, Vanuatu's gives "following ending of
administration Anglo-French condominium", naming the arrangement rather than the departing power. Two
measurement notes. **The Bahamas is the pass's widest three-way area disagreement among sources that all
look right** — UNdata 13,940 km², the Commonwealth 14,000 and the World Bank 13,880, a spread of 120 km² or
0.9 per cent — and the term's 13,878 sat inside the World Bank's rounding interval and outside the other
two, so C9's rule left it standing; **it was moved to UNdata's figure anyway, for the sibling-consistency
reason rather than the correction reason**, a card and its own glossary term being two Folio surfaces that
must not print different areas for one country. And **this is the second batch running with no population
correction**: all three terms sat between two of their three sources. Batch 45's rule fired for the
thirteenth consecutive batch and took the most this time — Iceland's "one of the most volcanically active
places on Earth", Vanuatu's "the country most exposed to natural hazards" and "one of the world's most
accessible lava lakes", and the Bahamas' "more than 2,000 cays", none of them in anything reachable, against
the Commonwealth's plain "nearly 700 coral islands. Around 30 of the islands are inhabited."

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
  gw-578  Gitega  [Burundi — the political capital; DEFERRED, no coordinate in world-capitals.js]
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
  gw-762  Bujumbura  [Burundi — the economic capital and largest city]
