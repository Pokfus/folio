# Geography — the card plan

The collection is **United States** (`geo-us`), the first of the Geography SECTION on the Collections
page — Geography is a heading there rather than a node in the tree, so a second country would be a
collection beside this one rather than a deck inside it (it was a wrapper node holding one deck until
Aug 2026; see `COLLECTION_SECTION` in app.js). It is a hundred cards in two decks: **The states**
(`geo-us-states`, `geo-001`–`geo-050`) and **The state capitals**
(`geo-us-capitals`, `geo-501`–`geo-550`). Its cards use a format no other collection uses — a **map card**,
which shows a shape on a globe and asks what it is — so this file has to describe the format as well as the
running order.

The next card to write is the lowest `geo-NNN` not yet in `data.js`:

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='geo-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

**Shipped so far: `geo-001` California, `geo-002` Texas, `geo-003` Florida, `geo-004` Rhode Island,
`geo-005` Alaska, `geo-006` Hawaii, `geo-007` Michigan, `geo-008` Louisiana, `geo-009` Maine,
`geo-010` Oklahoma, `geo-011` New York, `geo-012` Idaho, `geo-013` West Virginia, `geo-014`
Maryland, `geo-015` Nevada, `geo-016` Utah, `geo-017` Minnesota, `geo-018` New Jersey, `geo-019`
Massachusetts, `geo-501` Sacramento, `geo-502` Austin, `geo-503` Tallahassee, `geo-504`
Providence, `geo-505` Juneau, `geo-506` Honolulu, `geo-507` Lansing, `geo-508` Baton Rouge,
`geo-509` Augusta, `geo-510` Oklahoma City, `geo-511` Albany, `geo-512` Boise, `geo-513`
Charleston, `geo-514` Annapolis, `geo-515` Carson City and `geo-516` Salt Lake City.** Both
subdecks are worked down the same list, so the next state is `geo-020` and the next capital
`geo-517`.

---

## The map card

A map card carries two fields no other card has, and everything else about it is an ordinary curated card —
the same ten-sentence background, the same five-source bar, the same date line, the same `difficulty`.

```json
"map":   { "layer": "us-states", "key": "Rhode Island" },
"facts": [["Capital", "Providence"], ["Population", "1,112,308 (2024)"],
          ["Area", "4,001 km² (1,545 sq mi)"], ["Statehood", "29 May 1790"]]
```

`map` is what puts the globe on the front of the card. `layer` names a set of polygons (`CARD_MAP_LAYERS` in
app.js; today there is one, `us-states`) and `key` is a shape inside it, by name. An optional `zoom`
overrides the automatic fit for a place the fit frames badly.

**`geo-006` Hawaii IS THAT PLACE, and it is the only shipped card that overrides the fit.** The state's
polygons run from the Island of Hawaiʻi out to Kure Atoll at 178° W — 21.9° of longitude — and the fit's
near-rings rule keeps all fourteen, its window being 25° wide. So the automatic zoom is 3.13, at which the
eight main islands occupy about a seventh of the frame and read as a smear beside six specks of
uninhabited atoll. The eight main islands alone span 5.06° and fit at 13.55; `"zoom": 14` was chosen by
LOOKING at 8, 11 and 14 side by side, and at 14 every island from Kauaʻi to the Big Island is separately
legible. **The shape a reader is asked to recognise is the main chain**, and nothing is hidden by the
choice — the − button and pinch both zoom out to the rest, and the answer's facts box gives the whole
state's 28,313 km². Expect the same question at `geo-023` Washington, which has no such tail, and NOT at
`geo-005` Alaska: the Aleutians cross the antimeridian, which the near-rings rule already handles.

**A CAPITAL CARD INHERITS ITS STATE'S `zoom`.** `geo-506` Honolulu carries `"zoom": 14` for the reason
`geo-006` Hawaii does — without it the dot sits on an archipelago drawn a seventh of its useful size —
and any state that needs an override will need the same one on its capital. **Set them together.**

**AND A CAPITAL'S POPULATION IS SOMETIMES TWO FIGURES.** Honolulu is the case: the Census counts an
*Urban Honolulu CDP* of 344,967, while the city and county — which is legally the whole island of
Oʻahu — holds 998,747. Both are true and they answer different questions, so the card's facts box
carries both, labelled, rather than picking the flattering one; the county figure comes from
`co-est2024-alldata.csv` rather than from the places file, which is titled for incorporated places and
would be the wrong work to cite it to. **Watch for the same shape at `geo-528` Columbia and anywhere a
city and its county are one government.**

**A capital card adds `dot`**, and it is what makes the two subdecks two different questions:

```json
"map": { "layer": "us-states", "key": "Rhode Island", "dot": "Providence" }
```

`dot` names a point in the layer's own points table (`window.US_CAPITALS`, emitted by
`.claude/build-us-states.js` beside the shapes) and is drawn as a gold dot on top of the shaded state — the
Atlas's own focus mark, the same colour at full strength where the state around it is a 24% tint. Without it
a capital card shades Rhode Island and asks for Providence, which says only which *state*: every capital
card would be answerable from the same picture as its state card. The state answers "where"; the dot answers
"which place". Its name is held back until the reveal, and the reveal labels the **dot**, not the shape.

**The coordinates are generated, never typed.** Fifty hand-entered coordinates are fifty chances to put a
city in the wrong state, and a dot a degree out still draws — inside the shaded state, on a card that looks
entirely correct. Each entry carries the state it is in (`{s, c}`), so the card's claim is checkable:
`add-card.js` refuses a dot the table has not got, refuses one whose state is not the card's own `key`, and
warns if the answer is not the city. `cities.js` is the wrong source for this and was checked — it lives in
the ~9.9 MB `atlas` bundle, and it drops sub-100k capitals, so Juneau is simply absent.

`facts` is the numbers box under the answer. **It is not the date line**, and the two are easy to confuse:
`isDateList` caps the date line at four rows and demands a number in every labelled row, so `Capital ·
Sacramento` cannot go there. The date line carries the dates and the facts box carries everything else, and
a card may have both. At most eight rows (`CARD_FACTS_MAX`), plain text, `[label, value]`.

**THE ORDER OF THE ROWS IS THE ORDER OF THE COLUMNS, so it is a decision rather than a list** (Aug 2026, on
request). The box is a two-column grid filled row by row, so rows 1 and 3 stand above one another on the
left and rows 2 and 4 on the right — which means the order decides what a reader compares at a glance. A
state's four rows therefore run **Capital, Population, Largest city, Total area**: the two cities in one
column and the two figures in the other, rather than a city over a figure in both. Write a new card's rows
so that like sits over like.

**A card about a place with a flag of its own carries one** (Aug 2026, on request), as a fourth field in
the same three-field shape every other picture on the site uses:

```json
"answerFlag": { "src": "https://upload.wikimedia.org/…/Flag_of_Texas.svg",
                "credit": "Paul B. Joiner, public domain, via Wikimedia Commons (https://commons.wikimedia.org/wiki/File:Flag_of_Texas.svg)",
                "alt": "The flag of Texas: a blue vertical band at the hoist bearing a single white star, beside a white bar above a red bar." }
```

**IT IS `answerFlag` AND NOT `flag`, WHICH IS NOT PEDANTRY**: a card already has a FLAG in another sense —
the reader's own 1-7 marker — and the helper reading it is `cardFlag(id)`. Shipped as a second `cardFlag(c)`
this silently won for the whole of app.js and every reader flag read as unflagged, with nothing thrown. The
field is named for what it is: the flag drawn beside the ANSWER.

It is drawn inside the coloured answer box, to the right of the term and centred on it — a mark rather than
an illustration, so it is **not** the card's one frame and does not retire `image` or `video`. Two rules
`add-card.js` enforces. **`credit` is required**, like every picture here. And **`alt` is required as well,
which is unusual**: a flag has no title, no caption and no fullscreen view, so a reader who cannot see it
has nothing else at all — describe what the flag SHOWS rather than saying that it is a flag. Take the file
from Commons and **look at it before using it**: a state flag is public domain, a city's often is too, and
the file page states which.

**A CARD WITH NO CURRENT FLAG SHIPS WITH NONE, AND `geo-507` LANSING IS THE FIRST.** The field is
optional, and the temptation when a search comes back with something is to use it: Commons holds
`Flag of Lansing, Michigan (1969-1994)` and nothing else, which is a flag the city RETIRED thirty years
ago. Drawn beside the answer with no date on it, a retired flag reads as the city's present one, so the
card asserts something false in the one place a reader cannot check it. **Search for the retirement
date, not just for the file** — the same trap waits at any city that has redesigned — and where the
current design is not on Commons under a licence Folio can use, leave `answerFlag` off. The answer box
is complete without it.  **`geo-509` Augusta is the second such card and fails a
DIFFERENT way**: Lansing has a flag and Commons carries only the retired one, where Augusta has no
flag file on Commons at all — a title search returns photographs of the city and the two obvious
filenames are both missing. Both end in no `answerFlag`, but they are worth telling apart, because
the Lansing case can be fixed the day somebody uploads the current design and the Augusta case
cannot be fixed by looking harder.

## The locator — a globe on a HISTORY card

`locator` is the map card's sibling and is a **different field on purpose**, because it answers a different
question. A map card's window is the QUESTION: it sits above the prompt, it shades a shape, and it holds
the place's name back until the answer is shown. A locator is an ANNOTATION on the back of a card whose
answer is already on the screen — a reader meeting Knossos, the Cycladic civilisation or the Tiber for the
first time is being told a great deal about a place and nothing about where it is.

```json
"locator": { "name": "Knossos", "at": [25.1631, 35.2981] }
```

Optional `zoom` overrides the default, which is `CMAP_ZLOC` (4, about a 50° window) — a river wants less
and an island more.

**THE COORDINATE IS FETCHED AND NEVER TYPED.** `node .claude/add-locators.js <batch.json>` reads it off the
named Wikipedia article's own published primary coordinate; `--check` reports which cards carry one and
fetches nothing. A batch entry is `{ "title": "<article>", "name": "<the label>", "zoom": <optional> }`, and
`name` defaults to the card's `answerText`. Three things about running it:

- **One title per request.** `prop=coordinates` paginates, so a batched query records a handful and reports
  the rest as having no coordinate — which is indistinguishable from the truth.
- **READ THE `←` MARKERS.** The fetcher prints one wherever the API followed a redirect, and a redirect can
  land somewhere else entirely: `Idaean Cave` resolves to **Psychro Cave**, which is a different cave on a
  different mountain, and `Zagora, Andros` to **Zagora, Greece**, the village in Pelion. Both shipped wrong
  for a run. Where the exact place has no article, name the FEATURE the card's own first sentence puts it on
  (Mount Ida for the Idaean Cave, Andros for Zagora) — that is still fetched, still traceable through the
  batch file, and true at a locator's scale.
- **An article with no primary coordinate gets no locator and is reported by name.** That is the right
  outcome for a continental landmass whose whole point is its EXTENT — Sahul and Beringia have none
  deliberately, a single dot misrepresenting both — and for a place Pausanias puts on a road (Thornax).

**IT DOES NOT SHADE THE MODERN COUNTRY, and that is the decision worth keeping.** The gold fill means
*this is the answer* on a map card; lighting up modern Greece for Knossos would reuse that mark for a second
meaning and make a claim about a border drawn three and a half thousand years later. The dot's existing
meaning — *the place being pointed at* — is exactly right and needs no country to be chosen. So a locator's
layer is `world`, which every map window already loads for the coastline under it, and it carries no
`points` table: nothing may put a table dot on it, since a locator gives its coordinate outright.

It renders at the FOOT of the card, **after the Background fold and before the citations** — it is not
prose, so it does not belong under that heading, and a reader who shut the fold to see only the answer has
not asked to lose it — and it NAMES its place from the first frame, unlike a map card's window.

**Its failure modes are all silent**, which is why `test-map-cards.js` section 8 reveals a real card and
reads what is painted: a card whose `locator` the serializer forgot, a canvas nobody mounted, and a window
that resolved no place all render as a card that never had one. `ready()` is `!!(target || dot)` for that
reason — a locator has a dot and no target, so testing `target` alone reports every one as unmounted.

### Rules the format imposes

- **A map card carries NO extra phrasings.** `add-card.js` refuses them. The other two would have to ask
  about the same shape in two more ways, which is either the same sentence again or a different question
  about a different thing.
- **Its question is short** — 5 to 20 words rather than the usual 20 to 34. The clue is the picture; a
  paragraph beside it is a second clue, and usually a giveaway.
- **`add-card.js` checks the key against the real data file** and suggests a near match on a typo. A key
  naming nothing paints an empty window and throws nothing.
- **The card is kept out of every daily minigame.** The games deal a question cold, with no map beside it,
  so "the state shaded on the map is ____" is unanswerable there. This is derived rather than judged
  (`gameCardIdSet` tests `cardMapSpec`), so it needs no flag on the card.
- **`undatable` is not set and should not be.** It is read only by Timeline, and Timeline cannot reach a map
  card at all — the games filter runs first. Setting it would be a flag on an unreachable path.
- **The deck order is the order in this file, not chronological.** Cards are dealt in a deck's own `cardIds`
  order, so the running order below is what a reader meets.

### The accessibility limitation, stated rather than papered over

**A map card cannot be answered by a reader who cannot see it.** The shape is the whole question, so there
is no text alternative that does not give the answer away: an `alt` reading "a state on the north-east
coast, the smallest of the fifty" has answered the card. The canvas therefore says what it *is* and what to
do with it — "An interactive globe with one state shaded. Drag to turn it… Which state is it?" — and the
answer is announced normally once revealed, so the card can be READ even where it cannot be ANSWERED.

That is the Picture round's position, and it is the honest one for a format whose subject is a picture. It
is a reason to keep the geography collection to its own deck rather than mixing map cards into a collection
somebody is studying for its history.

### The globe

Drawn by `startCardGlobe` in app.js, not by the Atlas — `PAGES.map` is one enormous closure holding a
timeline, an editor, twelve layers and a game mode, all tied to a full-bleed stage, and half of what it does
(clicking a country to open its panel) is exactly what this must not do. What is shared is the arithmetic,
so a state sits where the Atlas would put it.

- **Nothing is clickable.** There is no click handler, no hit test and no hover. The pointer turns the
  globe; the buttons zoom it. A reader who could tap the shaded state and be told its name would not be
  studying.
- **The fit is read off the shape**, centred on Natural Earth's own published label point and zoomed so the
  longest side fills a little over half the window. Fifty hand-tuned numbers would be fifty things to keep
  right; one formula is one.
- **THE LAYER IS BUILT FROM NATURAL EARTH'S `_lakes` VARIANT, AND THAT IS WHAT GIVES MICHIGAN A MITTEN**
  (Aug 2026, found by looking at `geo-007`). Natural Earth publishes admin-1 twice:
  `ne_10m_admin_1_states_provinces` gives a Great Lakes state its share of the LAKE along with its land,
  and `..._lakes` clips the lakes out. The builder took the plain one — right for a choropleth, and
  catastrophic for a card whose whole question is a SHAPE. **Michigan shipped as ONE ring of 223 vertices
  spanning both peninsulas and the water between them**: a blob with no Straits of Mackinac, no mitten and
  no thumb, which is precisely the outline the running order put Michigan seventh for. It is 15 rings and
  1,197 vertices from the right file, with Isle Royale as its own speck. **Sixteen of the 51 shapes
  changed and none of them broke**: the eight Great Lakes states substantively (Michigan, Wisconsin 1 → 8
  rings, New York 9 → 13, Illinois, Indiana, Minnesota, Ohio, Pennsylvania), and Alabama, Iowa, Kentucky,
  Missouri, South Dakota, Tennessee, Texas and Wyoming by one to five vertices apiece, which is a large
  inland reservoir clipped at this tolerance. The fifty capitals came out byte-identical, and the six
  already-shipped states were untouched but for Texas, whose only change is a single vertex on Amistad or
  Falcon. **This is the second defect in this layer that no count could see and only looking at a card
  found** — the first was Rhode Island's tolerance, below — and both are the same lesson: a fit that
  frames its state and a file that parses tell you nothing about whether the picture is the right one.
- **`us-states.js` is traced ten times finer than `world.js`** (Douglas–Peucker 0.002, 3dp against 0.02,
  2dp). This is the correction most worth not undoing: the first cut copied world.js's tolerance on the
  reasoning that two traces in one canvas should match, and world.js's tolerance was chosen for a map at
  zoom 1–10 while a state card opens at whatever zoom frames its state — 79× for Rhode Island. At 0.02/2dp
  Rhode Island was 49 points: Narragansett Bay was three triangular spikes and Block Island was a triangle.
  Nothing was *wrong* with it and no count could see it. It was found by looking at the card.
- **The zoom ceiling is 180 and it is what the polygons support**, not what a place wants: at 3dp every
  vertex sits on a 0.001° grid, which is half a pixel at 180× on a 340px window and a visible step past it.
- **The states are filled as land** before they are outlined, because they are the finer of the two traces
  and routinely reach past world.js's shore; unfilled, that overhang shows the ocean straight through as a
  hairline of sea between a state and the coast it is on.

Guarded by `.claude/test-map-cards.js` — which sweeps the fit over all 51 shapes, asserts the view rather
than sampled pixels, and pins its copy of the fit formula against app.js so it cannot go stale.

---

## What is in the layer and what is in the deck

`us-states.js` carries **51** shapes: the 50 states and the District of Columbia, because that is what
Natural Earth's admin-1 layer holds for the United States and dropping one would be a special case in the
builder. **The deck is 50.** The District of Columbia is not a state, so "which state is this?" would be a
question with no right answer, and it has no state capital to ask about. It is also the only entry that
hits the zoom ceiling — 0.15° across, wanting roughly twice what the polygons support — so it opens filling
about half the window. If it is ever carded it wants a deck and a question of its own.

The territories (Puerto Rico, Guam, the US Virgin Islands, American Samoa, the Northern Mariana Islands) are
not in this layer at all. They would be a third deck and a second builder pass, and they are a better fit
for a future `geo-us-territories` than for a deck whose subject is states and state capitals.

---

## How the running order was chosen

**By how recognisable the outline is**, which is the question the card actually asks and the same one
`difficulty` encodes. A learner meets the states they half-know already and builds towards the ones that are
genuinely hard to tell apart — the plains rectangles and the New England cluster, which are the reason a
shape deck is worth studying at all. Alphabetical order would open on Alabama, Alaska and Arizona: a hard
state, a trick state and a hard state.

Four bands, and they are what the list below runs through: **1–10 unmistakable** (California, Texas,
Florida, Rhode Island for being tiny, Alaska, Hawaii, Michigan's mittens, Louisiana's boot, Maine,
Oklahoma's panhandle); **11–22 strongly distinctive**; **23–36 recognisable largely by position**;
**37–50 the hard ones**, which is the plains rectangles, the Deep South pair and the New England cluster.

**A capital is `geo-500+N` for state `N`**, so `geo-004` Rhode Island and `geo-504` Providence are the same
state seen twice. That pairing is the point of the numbering: the two subdecks show the same fifty pictures
and ask two different questions of them, and `studyOrder` deals subdecks round-robin with a day's lag, so a
reader meets a state and then its capital a day later — which is the right way round.

A plan line is a subject to research, not a fact to assert. Re-order or re-band a line where the research
says so, in the same commit as the card.

---

## Sourcing

Every claim needs an openable link, at the five-source bar, and the spine below was **measured from this
sandbox** rather than assumed. It is unusually good for a US subject: the federal government publishes the
figures and puts them behind no wall.

- **Area** — the Census Bureau's *State Area Measurements and Internal Point Coordinates* reference file.
  It gives land, water and total area, which matters for the small coastal states: Rhode Island's 4,001 km²
  is mostly Narragansett Bay, and quoting the total without saying so overstates the land by a third.
- **State population** — the Census Bureau's `NST-EST2024-ALLDATA.csv` (Population Division). A CSV, so the
  figure is exact and its vintage is stated.
- **City population** — `SUB-EST2024.csv`, the same series for incorporated places. **This is the one to
  reach for on a capital card**: most state-capital city governments run JavaScript sites with no citable
  text, and several of the obvious `.gov` pages 404.
- **History and geography** — the **Library of Congress state resource guides** (`guides.loc.gov/<state>-
  state-guide`). Each has a named author and a stated revision date, which is what makes them citable where
  an encyclopedia is not.
- **Landscape and protected land** — the **National Park Service** state pages (`nps.gov/state/<xx>`) and
  individual park and memorial pages, which carry real history under `/learn/historyculture/`.

Two access findings worth not rediscovering: `history.house.gov`'s statehood pages return a **200-status
"Error Document"**, so a fetch that looks successful carries no content; and the city-government sites are
the weak point of the whole subject, which is why a capital card leans on the Census place file and the
state's LoC guide rather than on the city's own site.

Four more, measured while writing `geo-005` and `geo-501`:

- **The LoC state guide is an INDEX, not an account** — three or four sentences of introduction over a list
  of digitised collections. Alaska's carries the 1867 purchase and "statehood in 1959" and no more; it will
  not date a statehood, name a rank or give a figure. Reach for it for the shape of a state's history, and
  for something else for every number in the card.
- **Austin shows the second half of that rule.** The Handbook of Texas Online, published by the Texas
  State Historical Association, is an encyclopedia — but its entries carry a named author, their own
  bibliography and the publisher's own preferred citation, which is the per-article test the glossary pass
  settled on (see `docs/glossary-citation-plan.md`, N9). Humphrey's Austin entry carries the founding, the
  site commission, the Archives War, the 1846 transfer, the 1872 vote, the Capitol and the University in
  one openable page, and Hazlewood's *Archives War* entry is a second work beside it. **Test the entry, not
  the publisher.** And the Texas State Preservation Board's Capitol History timeline is the state-body
  source beside it — the three million acres of Panhandle land that paid for the building, the granite, the
  cornerstone and the zinc Goddess of Liberty, dated year by year.
- **A NOMINATION IS ONE HISTORIAN'S READING, SO READ TWO.** Juneau's two — the Alaskan Hotel's and the
  Valentine Building's — disagree about when the capital arrived: one says "In 1900 the Territorial
  capital was moved from Sitka" and the other "Since 1906 Juneau has been the Capital of Alaska". Neither
  is wrong, and the first explains the second in its next sentence: "The capital' move from Sitka was
  slow, and occupied almost the first decade." That is C9's Madagascar rule in an American coat — two
  different acts, a decision and an arrival — and the card says both rather than picking one. **On a
  capital card, ask which act the date names.**
- **`npgallery.nps.gov/GetAsset/<uuid>` answers 404 to a HEAD and 200 to a GET.** That is where the NPS
  serves its National Register and National Historic Landmark nominations, and they are worth reaching for:
  the San Luis de Talimali nomination carries de Soto's winter camp of 1539, the missionisation of the
  Apalachee province in 1633, San Luis as the western capital of Spanish Florida from 1656 to 1704 with
  more than 1,400 residents, and its destruction in 1704 — a depth no state page has. **Check a citation
  URL with a GET**, since the obvious `curl -sIL` sweep reports these as dead.
- **The Census Bureau's own history stories are the thing that does** — `census.gov/about/history/stories/`,
  one a month, each with a named author and a date. "Alaska and Its People" (Gauthier, 1 January 2024)
  states the 49th-state rank, 3 January 1959, the $7.2 million at about two cents an acre, the largest-state
  land area and the largest city, in one openable page. **Look for a state's story before searching wider.**
- **`loc.gov` itself is behind a Cloudflare wall here and answers 403** — the *Today in History* pages among
  them — while `guides.loc.gov` is open. Do not read one as evidence about the other.  The *Today in History*
  tab **inside** a state guide (`guides.loc.gov/<state>-state-guide/today-in-history`) is a different page
  from those, is open, and is dated prose rather than a link list — it is where `geo-011` got the Dutch West
  India Company's New Amsterdam, which the guide's own Introduction does not mention. Not every state guide
  has the tab; Louisiana's 404s.
- **`parks.ny.gov` IS OPEN, AND ITS HISTORIC-SITE PAGES ARE REAL PROSE.** New York's equivalent of the
  state-preservation-office rule above: `parks.ny.gov/historic-sites/<n>/details.aspx`, numbered rather
  than named, so probe ids to find one. Two carried `geo-511`: **Schuyler Mansion** (site 33) for
  Burgoyne held prisoner after Saratoga, the Schuyler–Hamilton wedding of 1780 and the kidnap attempt of
  July 1781 — and it is unusually candid, naming both the enslaved labour the household rested on and
  Schuyler's part in the 1779 campaigns against the Haudenosaunee — and **Crailo** (site 30) for the
  patroonship of Rensselaerswyck and the Fort Orange excavations, which is the only openable source here
  for Dutch Albany. **A "(restricted)" archaeological NHL has no published nomination at all**: the
  by-state list gives Fort Orange and St Mary's City no link, so do not go looking for one.
- **CHECK THE NHL LIST'S ANCHOR TEXT, NOT A SUBSTRING.** Pulling a NARA id by searching the page for a
  label and then taking the nearest preceding `<a `, which is the obvious way, returns the PREVIOUS
  entry's id whenever the label carries a suffix like "(restricted)". It did that twice here and would
  have cited two entirely unrelated properties. Match the anchor's own text exactly. And **read the
  reference number back before fetching**: `66000386` returns a perfectly valid PDF for something that is
  not the Maryland State House, whose number is `66000385`.
- **A STATE SHPO MAY HOST THE NOMINATION PDFs ITSELF, WHICH SKIPS NARA ENTIRELY.** West Virginia's does:
  `wvculture.org/agencies/state-historic-preservation-office-shpo/register-of-historical-places/national-register-of-historic-places-nominations/<county>-county/`
  lists every National Register nomination in the county with a direct PDF link, so no reference number is
  needed and NRHP listings appear beside NHLs. That is how `geo-513` was written: Charleston has **no
  National Historic Landmark at all** (Kanawha County's only one had its designation withdrawn), and the
  Downtown Charleston Historic District nomination and its 2024 additional documentation carry the whole
  city — Clendenin's settlement of 1788, Fort Clendenin renamed Fort Lee in 1792, the capital arriving in
  1870, the referendum of 1877, the capitol of 1885, the railways of 1884 and 1890, and the fire of 1921.
  **Most of the older scans do not extract**: of five tried, only the two Downtown Charleston forms gave
  text, the rest being image-only PDFs with a text layer this sandbox cannot reach. Try the newest form
  first — a born-digital one extracts even when its letters come out spaced.
- **e-WV PASSES THE PER-ARTICLE ENCYCLOPEDIA TEST ON ONE ARTICLE AND FAILS IT ON ANOTHER**, which is the
  sharpest demonstration yet of why that test is per article. `wvencyclopedia.org` gives its Whiskey
  Rebellion entry a named author, a Sources bibliography of three works and a Chicago citation block —
  and its **Charleston** entry, by a named author and equally detailed, carries **no Sources section at
  all**. The Charleston article was therefore not cited, and everything it would have supplied was found
  in the SHPO nominations instead. **Check the article you are actually citing, every time**; a publisher
  that passed last week proves nothing about the page in front of you.
- **`history.idaho.gov` IS OPEN**, the Idaho State Historical Society's own site, and its `/capitol/`
  page carried `geo-512`'s statehouse completion in 1920 and the 1915 Lincoln with its Table Rock
  sandstone base. It is not an encyclopedia with per-article bibliographies like Oklahoma's — it is a
  state agency's own pages, so it qualifies the way a preservation office does, and it is thin: expect
  one or two claims from a page, not a spine.
- **A STATE HISTORICAL SOCIETY'S ENCYCLOPEDIA CAN PASS THE PER-ARTICLE TEST, AND OKLAHOMA'S DOES.**
  The glossary plan bars encyclopedias except where the ARTICLE cites its own sources, tested one
  article at a time. The Oklahoma Historical Society's *Encyclopedia of Oklahoma History and Culture*
  (`okhistory.org/publications/enc/entry?entry=<code>`) passes: each entry carries a named author, a
  "Learn More" bibliography of full citations, and a preferred-citation block in Chicago form. It is
  what carried `geo-510`'s oil — the discovery well of 4 December 1928, 409 million barrels by 1935,
  and the well drilled by directional drilling on the Capitol's own south plaza in 1941 — none of
  which is in any federal source reachable here. **Check the bibliography before citing an entry**,
  since the test is per article and not per publisher, and expect other states' societies to divide
  the same way Britannica and Store norske leksikon did.
- **A CAPITAL CARD'S BEST SOURCE MAY BE THE NOMINATION FOR THE CITY THAT LOST.** Oklahoma City has no
  National Historic Landmark at all, and the whole of its founding and its capital fight is in the
  **Guthrie Historic District** nomination — the land run of 22 April 1889, Guthrie as territorial
  then state capital, the two towns' populations between 1900 and 1910, Governor Haskell's statewide
  vote of 11 June 1910, the state seal carried to the Lee-Huckins Hotel and the proclamation written
  on its stationery, and the Supreme Court upholding the transfer in 1911. **When a city has no
  landmark of its own, look for the nomination of its rival, its predecessor or its neighbour.**
- **READ THE WHOLE NOMINATION, NOT THE ONE THAT IS ABOUT YOUR SUBJECT.** `geo-509` needed the year
  Augusta became Maine's capital, and it is in none of the obvious places — not the LoC state guide,
  not the Fort Western nomination, not the Blaine House one, and `nps.gov/places/maine-state-house.htm`
  and `maine.gov/legis/general/history.html` are both 404. It is in the **Kennebec Arsenal**
  nomination, three pages into a history of the Northeast Boundary Controversy: Congress voted the
  arsenal on 16 January 1827 for the town's central position on the Kennebec, and "Augusta was also
  chosen as the location for the state capital a month later, also due to its central location." That
  is P2's rule in an American coat — the sentence you need is often in the document about something
  else, so **grep every nomination you have fetched before concluding a fact is unreachable**. Note
  what it dates, too: the CHOICE, not the arrival, so the date line says "chosen 1827" (C9's
  Madagascar rule, and Juneau's).
- **WHEN A NOMINATION HAS NO NPS SUMMARY PAGE, GET ITS REFERENCE NUMBER OUT OF NARA.** The NHL summary pages
  at `nps.gov/subjects/nationalhistoriclandmarks/<slug>.htm` cover only some landmarks, and both of Baton
  Rouge's capitols 404 there. The list-of-NHLs-by-state page links each one to `catalog.archives.gov/id/<n>`
  instead — and **that page is a JavaScript shell that serves 200 with none of the record in it**, a sixth
  variety of 200-status non-page after `cia.gov`, `senate.gov`, `state.gov` and the two UN ones. Its own API
  is open and answers by that number: `catalog.archives.gov/proxy/records/search?q=<naId>&limit=1` returns a
  `scopeAndContentNote` ending "The National Historic Places Register Reference Number is 78001421_NHL",
  which is exactly what `npgallery.nps.gov/NRHP/GetAsset/NHLS/<refnum>_text` wants. **A text query to that
  API returns the shell instead of JSON**, so look up the number, never the name.
- **A state's own historic-preservation office is the source the city governments are not.** California's
  landmark record for Old Sacramento (`ohp.parks.ca.gov/ListedResources/Detail/812`) gives the founding
  month and founder, the year the capital settled there and every terminus claim — wagon train, stagecoach,
  riverboat, telegraph, pony express, first transcontinental railroad — in a single sourced paragraph.
  `parks.ca.gov` carries the same weight for a state park (Sutter's Fort's page is where the Nisenan and the
  exploited Native labour behind the fort's industries are stated outright, which no city page says), and
  the state capitol museums publish their own building histories. **Every state has a SHPO; try it before
  the city.**
- **A NON-NHL NRHP NOMINATION IS AT A DIFFERENT ASSET PATH, and it opens most of a small capital.**
  Everything cited before `geo-515` came through `npgallery.nps.gov/NRHP/GetAsset/**NHLS**/<refnum>_text`,
  which only serves National Historic *Landmarks* — of which Nevada has eight, none of them in Carson
  City. The ordinary National Register nominations are at
  `npgallery.nps.gov/NRHP/GetAsset/**NRHP**/<refnum>_text`, and Carson City has 44 of them: the U.S.
  Mint, the Nevada State Capitol, the Abraham Curry House and the Stewart Indian School carried four of
  that card's seven sources between them. **Reach for the NRHP path whenever a capital is too small to
  hold a Landmark**, and get the reference numbers from the Wikipedia *National Register of Historic
  Places listings in ‹place›* table, which is per city rather than per state.
- **AND WHEN THE NHLS PATH HANDS BACK A ~1.6 KB FILE, RE-ASK IT ON THE NRHP PATH.** The Brigham Young
  Complex is a Landmark and `.../NHLS/70000626_text` still returns a 1,623-byte stub with a 200 — no
  error, no message, just a PDF with nothing in it. `.../NRHP/70000626_text` returns the real 659 KB
  nomination. So the NHLS/NRHP split is not simply *landmarks here, everything else there*: **the size
  of the response is the signal**, and anything under a few kilobytes is a stub to retry rather than a
  nomination to give up on.
- **A LANDMARK WITH TWO REFERENCE NUMBERS IS INVISIBLE TO A DIGITS-ONLY PATTERN, and the regex then
  silently hands you the NEXT row's.** Paterson's Great Falls/S.U.M. district is listed as
  `"refnum":{"wt":"70000391, 86001507"}`; a `"refnum":\{"wt":"(\d+)"\}` scan skips the comma-separated
  pair, runs on, and returns `94001648` — which fetches a perfectly valid nomination for the
  *Hadrosaurus foulkii* site in Haddonfield instead. This is round 10's wrong-reference-number finding
  in a second disguise, and the same rule catches it: **read the fetched document's own name back
  before citing it.** (The accident was useful — the Hadrosaurus site went into the card on its own
  merits — but it would have shipped a citation pointing at the wrong landmark.)
- **The NPS *List of NHLs by State* page is not parameterised by state, whatever the URL suggests.**
  `nps.gov/subjects/nationalhistoriclandmarks/list-of-nhls-by-state.htm?state=MN` returns 200 and serves
  the DEFAULT page — one landmark, in Maine — so a query written that way looks like a state with a single
  NHL rather than like a URL that was ignored. The reliable index is the Wikipedia *List of National
  Historic Landmarks in ‹state›* table, whose designation-date cell carries the reference number as
  `(#NNNNNNNN)`; grep the table rows for it and go straight to
  `npgallery.nps.gov/NRHP/GetAsset/NHLS/<refnum>_text`. Twenty-five Minnesota landmarks came out of it in
  one parse. **Read the number back against the landmark's own name before fetching**, per round 10's
  finding — a wrong reference number returns a perfectly valid nomination for something else.

### Conventions

- **Metric first, imperial in brackets**, as everywhere: `4,001 km² (1,545 sq mi)`.
- **A population carries its vintage**: `1,112,308 (2024)`. A figure that time moves past is the commonest
  correction the citation passes make, and dating it is what lets a later reader see that it is stale rather
  than wrong.
- **The date line carries statehood**, labelled `Statehood`, which gives the card a sort year for free.
- **The answer term carries no article** — `Rhode Island`, not "the state of Rhode Island".

---

## The glossary

Every card ships with a cited glossary entry for its own answer term, written at the two-source bar, in the
same commit. That is a hundred entries — fifty states and fifty cities — and **three of them collide with
terms that already exist**. Each was measured, and none should be settled quietly.

- **`Alaska` already existed and was not about the state — SETTLED with `geo-005`.** It had been written
  for the prehistory deck and framed Alaska as the far north-western extremity of North America across the
  Bering Strait from Siberia; `wh-097` Beringia links it. It was **rewritten to serve both**, and the shape
  of that rewrite is the one to copy at `geo-027` Georgia: a glossary description is exactly three sentences
  and 90–110 words, so extending one is not adding a sentence but **re-cutting all three**. The state's
  figures and its 1867 purchase and 1959 statehood came in; the land-bridge flooding and the terminal
  Pleistocene genome — the two claims `wh-097` needs — stayed; and the St Paul Island mammoths went, with
  their citation, because a claim cut from a term whose sources are one-per-claim **orphans that source and
  `add-sources.js` refuses the batch**. That is the real cost of a shared term, and it is paid in claims
  rather than in words.
- **`Olympia` already exists and is the Greek sanctuary**, seat of the Olympic games. The capital of
  Washington needs a **disambiguated key** (`Olympia,_Washington`) with `Olympia` as its display title, and
  must **not** claim the bare surface: `buildGlossIndex` gives a surface to its first claimant, and Greek
  prose saying "Olympia" means the sanctuary. The card itself is unaffected — a card never auto-links its
  own answer term.
- **`Georgia` is an ALIAS of `Georgia_(country)`.** So the bare word resolves to the country everywhere,
  including in a card about the state. This is the fault CLAUDE.md already records from batch N7 — *an alias
  list written before the sibling term existed will contain the sibling's name, and will be wrong the day
  the sibling arrives*. When `geo-027` is written, decide it explicitly: either retire that alias and let
  both terms carry disambiguated keys, or keep it and give the state one. Do not add a second claimant to
  the same surface and leave the two to race.

- **`New_York_(state)` IS THE FIRST OF THESE ACTUALLY WRITTEN, and it settles how to decide one.** The
  rule above says a disambiguated key must not claim its bare surface; the question it leaves open is
  whether to give the state the bare "New York" as an alias anyway, since the card's own answer is that
  word. The way to answer it is to MEASURE, not to reason: grep the shipped card and glossary prose for
  the surface and read what it means there. "New York" appears sixteen times, and it is genuinely split —
  a vase "of about 550 BCE in New York" is the Metropolitan Museum, "20th-century buildings in New York"
  is the city, while "Stony Brook University in New York" is the state. **A surface whose existing uses
  divide gets no alias from either claimant**, so the term is keyed `New_York_(state)`, prints as "New
  York" in its popup, and the bare word auto-links to nothing — which is the honest result when the word
  means two things. The card is unaffected, a card never auto-linking its own answer.

- **`Charleston` IS KEYED BARE AND `geo-028` SOUTH CAROLINA MUST REVISIT IT.** All four uses in the
  corpus today are the West Virginia capital, so the measure says bare, and the render check confirms
  `geo-013` links correctly while "Charles Town" — the other West Virginia place, where John Brown was
  tried — is untouched. But South Carolina's card will almost certainly name Charleston for Fort Sumter,
  and on that day the surface divides and the term must be rekeyed `Charleston_(West_Virginia)`. **This
  is the Georgia case with a date on it**: the measure is a snapshot, and a collection written down a
  fixed running order can often see the collision coming. Where you can, name the card that will force
  the decision rather than leaving it to be discovered.
- **`Nevada_(state)` IS THE SECOND, AND IT MEASURED 2 OF 2 AGAINST.** Both existing uses of "Nevada"
  in shipped prose are inside **Sierra Nevada** — the range, in `geo-001` and the `California` term —
  so a bare key would have linked the mountains to the state twice over and there was no majority to
  weigh at all. Keyed parenthetically before shipping this time, and the render check confirmed "Sierra
  Nevada" stays plain text while "Boise", which measured 2 of 2 FOR the Idaho capital, links correctly
  in `geo-012`. **A state name that is also half of a longer place name is the shape to watch** — the
  same question waits at `geo-032` (Washington), `geo-041` (Kansas, for Kansas City) and anywhere a
  range, river or city carries the state's word. Note the forward exit: if a `Sierra_Nevada` term is
  ever written, the longest-first sort would protect the state and it could be rekeyed bare.
- **`Albany_(New_York)` IS THE FIRST CAPITAL TO NEED THE PARENTHETICAL, AND IT SHOWS THE MEASURE IS
  NOT ENOUGH ON ITS OWN.** Nine capitals before it are keyed bare and none collides; "Albany" measured
  2–1 for the New York capital, the third use being "the Albany Museum" in `wh-059`, a museum in the
  Eastern Cape named for a South African region. Two–one looked like a majority worth taking, so the
  term shipped bare — **and rendering the card showed the link firing**, `Albany Museum` opening the
  gloss for a city four thousand miles away. Rekeyed `Albany_(New_York)`, which `bareTaken` in
  `buildGlossIndex` refuses to register as a surface while `glossKeyTitle` still prints the popup title
  as "Albany". Three things follow. **The Wikipedia slug is `Albany,_New_York` and the parenthetical
  form is deliberately NOT it**: a comma key avoids the claim only by accident, its humanised surface
  ("Albany, New York") simply never occurring in prose, where the parenthetical is the mechanism built
  for this and says so. **`check-gloss-links.js` did not report it** — it flagged `wh-059` for a
  different link entirely — so the checker is a proxy for this class and not a gate. **The reliable test
  is to render a card that uses the surface and read the HTML**, which takes one Playwright run and is
  the only thing that actually saw it.

- **`Minnesota` AND `Annapolis` ARE BOTH BARE, AND THE COLLISION THIS ROUND WAS NOT A KEY AT ALL.**
  "Minnesota" occurred nowhere in shipped prose and "Annapolis" twice, both the Maryland capital, so both
  measured cleanly bare and the render check confirmed `geo-014`'s "Annapolis" and `geo-514`'s "Maryland"
  resolving to the right terms. What the render check DID catch is a different class: **a proper name that
  contains a common noun another term owns.** `geo-017` wrote "found the Mountain Iron Mine", and the
  auto-linker split the mine's name to link `Iron`, the material — a link that is not wrong about the word
  and is wrong about the sentence. **`check-gloss-links.js` did not report this either**, which with the
  `Albany` case makes it twice; the rendered HTML is the only thing that sees either. The fix is neither an
  alias nor a hand link: `autoLinkGlossary` keeps a `linked` Set and skips every occurrence after the
  first, so **moving the term's CORRECT occurrence earlier in the abstract takes the link and leaves the
  proper name whole**. The sentence was recut to name "the largest iron ore deposit in the world" before
  the mine, and "iron" now links while "Mountain Iron Mine" is plain. **Watch for this wherever a card
  names a mine, a fort, a river or a town after a material or a common noun** — Iron, Gold, Silver, Salt,
  Springfield's kin — and read the rendered abstract, not the source.

- **`New_Jersey` AND `Carson_City` ARE BOTH BARE, AND THE ROUND'S REAL FINDING IS A BACKLOG.** Both
  measured cleanly ("New Jersey" once, the state; "Carson City" twice, the Nevada capital) and both new
  cards render only correct links. But the render check was then run over the WHOLE collection rather
  than the two new cards — 36 pages, a few minutes — and it found **nine live wrong links on eight
  cards already shipped**, every one the round-13 shape, a common noun inside a proper name:
  `geo-010` "forced from **Georgia**, Alabama and Tennessee" → `Georgia_(country)`;
  `geo-011` "the West **India** Company" → `India`, and "**Syracuse**, Rochester and Buffalo" → the
  Sicilian city; `geo-509` "**Latin** America" → `Latin`, the language; `geo-510` "Harrison's **Horse**
  Race" → `Horse`; `geo-015` "**Gold** Hill" → `Gold` and "the **Panama** Canal" → `Panama`;
  `geo-512` "the **Salmon** River" → `Salmon`; `geo-513` "the Kanawha and **Michigan**" — a railroad —
  → `Michigan`. **`geo-010`'s is the `Georgia` alias fault this file already predicted for `geo-027`,
  arriving early and live.**
  Three things to carry. **The per-card rendered link list is the only real measure**: a phrase scan
  over the source text (does an auto-linkable single word sit inside a capitalised multi-word name?)
  returns 372 candidates over the corpus and cannot tell which surface actually won, whether the link
  fired at all under first-occurrence-wins, or whether it is wrong — `geo-017`, already fixed, is still
  in its output. **A lowercase common noun inside the phrase is usually right and must not be swept**
  ("the **temple** on Temple Square", "cast and sheet **iron**", "**tar** paper" are all correct); the
  fault is a CAPITALISED word that belongs to the name. And **this is a pass of its own, not a
  by-product of adding cards** — it is nine prose edits across eight shipped cards, each needing the
  round-13 reordering or a reword, and it is recorded here rather than folded into the commit that
  found it.

- **`Massachusetts` AND `Salt_Lake_City` ARE BOTH BARE, AND THE ROUND REFINES THE PROPER-NAME RULE
  INTO A TEST THAT SEPARATES REAL FAULTS FROM HARMLESS ONES.** "Massachusetts" measured 6 uses, all the
  state or its colony; "Salt Lake City" 2, both the Utah capital. The render check then showed the new
  key firing twice: correctly on `geo-004`'s "between Connecticut and Massachusetts", and inside a
  proper name on `geo-504`'s "banished from the **Massachusetts** Bay colony". That second one is the
  round-13 shape and it is **left as it is**, because the test is not *does the link sit inside a longer
  name* but **does the link's target refer to the same thing the name does.** The Massachusetts Bay
  colony and the Commonwealth are the same place, one the direct predecessor of the other, so a reader
  who taps it learns something true about what they were reading; `geo-516`'s "the **California**
  Volunteers" passes the same way, the unit having been raised there. Contrast the nine faults listed
  above: **Gold** Hill is a town, not a mineral; the **Panama** Canal is not the country; **Latin**
  America is not the language; the Kanawha and **Michigan** is a railroad. **Apply this test before
  reaching for a fix** — it halves the work and stops a reword being made for a link that is doing its
  job.

Checked and clear: no capital's name is a key or an alias today, and the presidents are keyed by full name
with no bare-surname aliases, so `Jackson`, `Lincoln`, `Madison` and `Jefferson City` are free. **Re-run that
check before each batch** — the glossary is 1,061 terms and growing, and a collision is silent.

# The list

## The states — `geo-us-states`

  geo-001 California
  geo-002 Texas
  geo-003 Florida
  geo-004 Rhode Island
  geo-005 Alaska
  geo-006 Hawaii
  geo-007 Michigan
  geo-008 Louisiana
  geo-009 Maine
  geo-010 Oklahoma
  geo-011 New York
  geo-012 Idaho
  geo-013 West Virginia
  geo-014 Maryland
  geo-015 Nevada
  geo-016 Utah
  geo-017 Minnesota
  geo-018 New Jersey
  geo-019 Massachusetts
  geo-020 Ohio
  geo-021 Illinois
  geo-022 Virginia
  geo-023 Washington
  geo-024 Oregon
  geo-025 Arizona
  geo-026 New Mexico
  geo-027 Georgia
  geo-028 South Carolina
  geo-029 North Carolina
  geo-030 Pennsylvania
  geo-031 Wisconsin
  geo-032 Indiana
  geo-033 Kentucky
  geo-034 Tennessee
  geo-035 Missouri
  geo-036 Arkansas
  geo-037 Alabama
  geo-038 Mississippi
  geo-039 Delaware
  geo-040 Connecticut
  geo-041 New Hampshire
  geo-042 Vermont
  geo-043 Montana
  geo-044 Wyoming
  geo-045 Colorado
  geo-046 Kansas
  geo-047 Nebraska
  geo-048 South Dakota
  geo-049 North Dakota
  geo-050 Iowa

## The state capitals — `geo-us-capitals`

  geo-501 Sacramento
  geo-502 Austin
  geo-503 Tallahassee
  geo-504 Providence
  geo-505 Juneau
  geo-506 Honolulu
  geo-507 Lansing
  geo-508 Baton Rouge
  geo-509 Augusta
  geo-510 Oklahoma City
  geo-511 Albany
  geo-512 Boise
  geo-513 Charleston
  geo-514 Annapolis
  geo-515 Carson City
  geo-516 Salt Lake City
  geo-517 Saint Paul
  geo-518 Trenton
  geo-519 Boston
  geo-520 Columbus
  geo-521 Springfield
  geo-522 Richmond
  geo-523 Olympia
  geo-524 Salem
  geo-525 Phoenix
  geo-526 Santa Fe
  geo-527 Atlanta
  geo-528 Columbia
  geo-529 Raleigh
  geo-530 Harrisburg
  geo-531 Madison
  geo-532 Indianapolis
  geo-533 Frankfort
  geo-534 Nashville
  geo-535 Jefferson City
  geo-536 Little Rock
  geo-537 Montgomery
  geo-538 Jackson
  geo-539 Dover
  geo-540 Hartford
  geo-541 Concord
  geo-542 Montpelier
  geo-543 Helena
  geo-544 Cheyenne
  geo-545 Denver
  geo-546 Topeka
  geo-547 Lincoln
  geo-548 Pierre
  geo-549 Bismarck
  geo-550 Des Moines
