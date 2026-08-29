# Geography — the card plan

The collection is **United States** (`geo-us`), the first of the Geography SECTION on the Collections
page — Geography is a heading there rather than a node in the tree, so a second country is a collection
beside this one rather than a deck inside it (it was a wrapper node holding one deck until Aug 2026; see
`COLLECTION_SECTION` in app.js). **That second collection now exists: `geo-world`, The world**, 233
countries and territories and their capitals, sorted by population — see
`docs/world-geography-card-plan.md`. It uses this file's map-card format unchanged, so a change to the
format here reaches both, and the three glossary collisions listed below are shared with it.

This collection is a hundred cards in two decks: **The states**
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
Massachusetts, `geo-020` Ohio, `geo-021` Illinois, `geo-022` Virginia, `geo-023` Washington,
`geo-024` Oregon, `geo-025` Arizona, `geo-026` New Mexico, `geo-027` Georgia,
`geo-028` South Carolina, `geo-029` North Carolina, `geo-030` Pennsylvania,
`geo-031` Wisconsin, `geo-032` Indiana, `geo-033` Kentucky, `geo-034` Tennessee, `geo-035` Missouri, `geo-036` Arkansas,
`geo-037` Alabama, `geo-038` Mississippi, `geo-039` Delaware, `geo-040` Connecticut, `geo-041` New Hampshire, `geo-042` Vermont, `geo-043` Montana, `geo-044` Wyoming, `geo-045` Colorado, `geo-046` Kansas, `geo-047` Nebraska, `geo-048` South Dakota, `geo-049` North Dakota, `geo-050` Iowa,
`geo-501` Sacramento, `geo-502` Austin, `geo-503`
Tallahassee, `geo-504` Providence, `geo-505` Juneau, `geo-506` Honolulu, `geo-507` Lansing,
`geo-508` Baton Rouge, `geo-509` Augusta, `geo-510` Oklahoma City,
`geo-511` Albany, `geo-512` Boise, `geo-513` Charleston, `geo-514` Annapolis, `geo-515` Carson
City, `geo-516` Salt Lake City, `geo-517` St. Paul, `geo-518` Trenton, `geo-519` Boston,
`geo-520` Columbus, `geo-521` Springfield, `geo-522` Richmond, `geo-523` Olympia, `geo-524` Salem,
`geo-525` Phoenix, `geo-526` Santa Fe, `geo-527` Atlanta, `geo-528` Columbia, `geo-529` Raleigh, `geo-530` Harrisburg, `geo-531` Madison, `geo-532` Indianapolis, `geo-533` Frankfort, `geo-534` Nashville, `geo-535` Jefferson City, `geo-536` Little Rock, `geo-537` Montgomery, `geo-538` Jackson, `geo-539` Dover, `geo-540` Hartford, `geo-541` Concord, `geo-542` Montpelier, `geo-543` Helena, `geo-544` Cheyenne, `geo-545` Denver, `geo-546` Topeka, `geo-547` Lincoln, `geo-548` Pierre, `geo-549` Bismarck and
`geo-550` Des Moines.**
**THE COLLECTION IS COMPLETE.** All fifty states (`geo-001`–`geo-050`) and all fifty capitals
(`geo-501`–`geo-550`) are written, cited at the bar, paired with glossary terms and illustrated. The
running order below is a record of what was written, not a queue; there is no next card.

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
app.js: `us-states`, `world` for the world collection, and the `world` layer again for a locator) and `key`
is a shape inside it, by name. An optional `zoom` overrides the automatic fit for a place the fit frames
badly.

**`geo-006` Hawaii IS THAT PLACE** — it and its capital card are the only two that override the fit. The state's
polygons run from the Island of Hawaiʻi out to Kure Atoll at 178° W — 21.9° of longitude — and the fit's
near-rings rule keeps all fourteen, its window being 25° wide. So the automatic zoom is 3.13, at which the
eight main islands occupy about a seventh of the frame and read as a smear beside six specks of
uninhabited atoll. The eight main islands alone span 5.06° and fit at 13.55; `"zoom": 14` was chosen by
LOOKING at 8, 11 and 14 side by side, and at 14 every island from Kauaʻi to the Big Island is separately
legible. **The shape a reader is asked to recognise is the main chain**, and nothing is hidden by the
choice — the − button and pinch both zoom out to the rest, and the answer's facts box gives the whole
state's 28,313 km². The same question was expected at `geo-023` Washington and did not arise — its San
Juan islands sit inside the mainland's own frame, so the automatic fit needed no override — and it does
not arise at `geo-005` Alaska either: the Aleutians cross the antimeridian, which the near-rings rule
already handles.

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

**AND WHAT IS IN THE BOXES IS NOT IN THE BACKGROUND** (Aug 2026, on request, for the world collection and
stated here because the format is shared). A card carries three things that say what the place IS — the
map, the facts box and the date line — so a background that recites the same capital, population, area and
dates says everything twice. The background's job is the place's HISTORY; the boxes carry the figures.
**The five `geo-` cards shipped before that rule and do not follow it** — `geo-004`'s background gives
Rhode Island's area, population and capital, all of which are in its own facts box — so they want a rewrite
of their first block when somebody is next in this collection. **No checker can see this**: the duplicated
sentences are well formed, correctly cited and count the right number of words.

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

**THE FLAG PASS IS FINISHED AT 93 OF 100, AND THE SEVEN MISSING ARE THREE DIFFERENT FAILURES.** All
fifty states carry a flag and 43 of the fifty capitals do. Lansing's and Augusta's cases above are two
of the three; the third is new and is the one to watch for, because a file EXISTS and is still wrong.

· **NOTHING ON COMMONS AT ALL** — `geo-509` Augusta, `geo-523` Olympia, `geo-539` Dover, `geo-543`
  Helena. Confirmed by listing each state's own `Category:Flags of municipalities in <state>` rather
  than by guessing filenames, which is the check worth copying: a title search for "Olympia" returns
  twenty photographs of protest flags and a cruiser, and for "Dover" the flag of Dover, MASSACHUSETTS
  — the right name in the wrong state, twice over.
· **ONLY A RETIRED DESIGN** — `geo-507` Lansing (1969–1994, as above) and `geo-537` **Montgomery**,
  where Commons holds **one design in three files** — an SVG titled **`(1952–2026)`**, an undated PNG,
  and a third under a French name — and the city replaced that flag this year, so the design every one
  of them carries is retired and the new one is not up. Two of the three carry no date at all, so **a
  file with no date range beside a dated sibling is not evidence that it is current**: read every
  sibling before trusting an undated one, and check the whole `Category:Flags of municipalities in
  <state>` rather than the two obvious filenames, which is what turned up the third.
· **ONLY A PHOTOGRAPH** — `geo-541` Concord, whose sole file is a good 3000×2000 shot of the flag
  flying against trees. It was rejected on SIZE rather than on licence: this field renders at **26px
  tall and 56px wide at most**, where a flat flag still reads and a photograph is a smudge of green
  and blue. **The bar for a flag is not the ~900px illustration bar** — the mark is never opened
  fullscreen — so a 384px raster is ample (`geo-534` Nashville and `geo-548` Pierre are exactly that)
  and a photograph is not, whatever its resolution.

**THE ALT TEXT WAS WRITTEN FROM THE PICTURE, NOT FROM THE FILENAME.** All 22 were downloaded and looked
at before a word was written — an SVG through Commons' thumbnailer at 960 or 1280px, the widths that
actually serve. It is the one field here a checker cannot verify, so the only thing that makes it true
is having looked; three of the 22 turned out to differ from what their name suggests.

**AND A 429 IS NOT A 404.** Verifying the 22 URLs, ten came back `429 text/html` in one pass and all
ten returned `200 image/svg+xml` when re-run at a slower rate — every one of them a file already
downloaded successfully minutes earlier. An all-or-nothing negative is a statement about the
instrument. Space the requests and retry before recording a single absence.

**WIKIMEDIA IS BLOCKED FROM THE HEADLESS BROWSER IN THIS SANDBOX, AND THE CONTROL IS THE POINT.** A
rendered card reports `naturalWidth: 0` for every flag — but so do the 71 flags already shipped and
merged, which is what says the fault is the sandbox and not the new data. **Test a shipped one beside
the new ones** before concluding anything from a page that will not load pictures. The block is in the
relay rather than in the browser's configuration: pointing Chromium at the agent proxy gives
`ERR_CONNECTION_RESET` and the proxy's own status reports `ws_closed_mid_exchange` for browser-
originated tunnels, while Node's requests to the same hosts succeed. Nothing about the page is
fixable from here, so **do not spend a session on it** — and never reach for `--ignore-certificate-errors`,
which trades a real check for a fake one.

**WHAT CAN BE CONFIRMED VISUALLY, AND SHOULD BE, IS THE RENDER AT 26px.** The live URL cannot be
loaded here; the FILE can, and that is where the interesting failure lives. Serve the downloaded
copies to a local page that carries `.av-flag`'s own rule — 26px tall, 56px wide at most,
`object-fit:contain` — put each flag's alt text beside it, and screenshot the lot as one sheet. It
takes two minutes and it answers three questions nothing else does: whether each file really is the
flag its name claims, whether the alt text describes the picture rather than the filename, and
**whether the design survives being 26px wide**, which is what ruled Concord's photograph out and what
would rule out any future candidate that is a photograph, a scan or a seal on a busy ground.

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
- **THE DECK ORDER IS BY POPULATION, LARGEST FIRST** (Aug 2026, on request), and it is NOT the numbering.
  Cards are dealt in a deck's own `cardIds` order, which was the order they were written in and is now
  sorted: California, Texas, Florida, New York … down to Vermont and Wyoming, and Phoenix, Honolulu,
  Austin … down to Pierre and Montpelier. **The ids were deliberately NOT renumbered** — an id is the
  address a shared link, a glossary cross-reference and this file's running order all use, and renaming
  fifty of them to express a sort would break every one of those to change something `cardIds` already
  says. So the numbering below is a record of what was written WHEN, and the deck order is a separate
  fact held in the tree. **The figure sorted on is the one the card itself gives as the place's size**,
  which for forty-nine capitals is `Population` and for `Honolulu` is its city-and-county count, that
  being the population of the city as a legal entity — the same rule the difficulty banding uses.

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
- **A NOMINATION THAT WAS NEVER SCANNED IS EXACTLY 22,151 BYTES, ON BOTH PATHS.** `GetAsset/NHLS/` and
  `GetAsset/NRHP/` both answer 200 and hand back the same placeholder, which extracts as a page of
  punctuation — measured on the B Reactor (`92000245`), Fort Rock Cave (`66000641`) and Sunken Village
  (`89002455`), all three the same size to the byte. **Check the size before reading**: the stub is not
  an error, it is a landmark whose paperwork is not online, and no amount of re-fetching will change it.
  A file that IS there runs to hundreds of kilobytes, and the two paths then differ in size — try both,
  since either can be the readable one (`73001575` extracts from NHLS and is binary from NRHP).
- **AND THE 1,623-BYTE STUB HAS A SECOND MEANING: the property is on the Register but is not a
  LANDMARK.** Olympia's three sources — the Old Capitol, the Capitol Historic District and the Bigelow
  House — are all NRHP listings and none is an NHL, so `GetAsset/NHLS/` hands back the small stub for
  every one of them while `GetAsset/NRHP/` serves the real document. That is not a gap in the archive,
  it is the archive saying the property has no landmark file. **On a capital card, expect to cite the
  NRHP path**: a state's landmarks are spread over the state, and its capital's own buildings are
  often listed rather than designated.
- **AND IT HAPPENED AGAIN THE NEXT ROUND, ON A DIFFERENT FILE.** `First_Oil_Well.jpg` answered 429 on
  both the original and the thumbnail while every other Commons file in the same batch answered 200, so
  the Pennsylvania term is illustrated with Valley Forge instead. **Do not spend a round retrying a
  throttled file: pick another picture** — the choice of illustration is editorial, and a card is not
  improved by waiting.
- **`upload.wikimedia.org` CAN 429 ONE FILE WHILE SERVING ITS NEIGHBOURS.** `geo-525`'s city flag
  answered **429 on the SVG for over four minutes**, in both the encoded and the literal spelling of
  the comma in its name, while the 1280px PNG rendering of the same file and every other flag SVG
  answered 200. It is a per-file throttle rather than a rate limit on the session, and it is not a
  dead link — but a URL that cannot be opened cannot be verified, so **ship the rendering you actually
  fetched**: that card's flag is the PNG.
- **NOT EVERY STATE HAS A LIBRARY OF CONGRESS GUIDE, and Oregon is the first that has not.**
  `guides.loc.gov/oregon-state-guide` is a 404 while every state written before it resolved, and the
  guides' own search page is JavaScript-driven, so the index cannot be listed from here to check.
  **Try the slug and be ready for it to fail**, rather than treating that source as a given; `geo-024`
  is carried by the NPS trail pages instead, which are better history anyway.
- **THE STATUTES AT LARGE ARE IMAGE SCANS THAT DO NOT EXTRACT, AND GOVINFO'S METADATA IS THE WAY IN.**
  `govinfo.gov/metadata/pkg/STATUTE-<vol>/mods.xml` lists every act in a volume with its title, its
  session and its page, so `An Act for the Admission of Oregon into the Union` at 11 Stat. 383 can be
  cited by name from the record even though the PDF behind it is a photograph. Two cautions: the
  volume-level `dateIssued` is the volume's, **not the act's** — it gave 3 March 1859 for a February act,
  so cite the year and not the day — and govinfo answers **503 "Please Retry later in 15 Seconds"** under
  rapid requests, which is a rate limit rather than a dead page.
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
- **A MID-CENTURY NOMINATION WILL NOT MENTION SLAVERY, AND ON A VIRGINIA CARD THAT IS A HOLE THE
  SOURCE CANNOT FILL.** The Monticello, Mount Vernon and Williamsburg forms are 1960s and 1970s work:
  they describe Jefferson as a "universal man" and Washington's farming as his "major occupation", and
  the word *enslaved* appears in none of them. A card built from those alone is a portrait rather than a
  history. The **NPS park pages are modern and do carry it** — Historic Jamestowne's *History & Culture*
  states the 1607 founding, the Virginia Company and the "20 and odd" Africans put ashore in 1619 in one
  paragraph — so **pair an old nomination with the park's own current page** whenever the subject is
  colonial. And a caution about reuse: the shipped `Thomas_Jefferson` term said he "enslaved more than
  600 people", and **none of its five sources carries that figure** — the Miller Center's *Life in Brief*
  says he argued for prohibiting slavery in new territories and never freed his own slaves, which is what
  the term now says. That is the P-topup class of fault (a sentence resting on a page that does not state
  it), found because a card tried to borrow the claim. **Read the source before reusing a figure from a
  neighbouring term.**
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
same commit. **RE-RUN `gloss-length.js` AFTER THE LINK FIXES, not just after drafting** — those come last, they
change the word count, and `Richmond` shipped at 111 words in the round before this one because four
words were added to dodge a wrong link after the bar had been checked. That is a hundred entries — fifty states and fifty cities — and **three of them collide with
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
  **IT BIT AT `geo-023`, WHICH IS THE STATE CARD AND NOT THE CAPITAL ONE.** Every state card and every
  state glossary term names its capital in its first sentence, so "its capital at Olympia" linked to a
  sanctuary in the Peloponnese. Measured, the surface runs **31 uses and 29 are the sanctuary** (twenty
  Greece cards and nine glossary terms), so the key stays where it is and neither the divided-surface
  rule nor a rekey applies — the two Washington uses are the strangers. **The fix is that a Washington
  text does not name its capital in PROSE**: `autoLinkGlossary` runs on the abstract alone, so the card
  keeps `["Capital","Olympia"]` in its facts box, unlinked and in plain sight, and the glossary term
  simply omits it, being the one state term on the shelf that cannot say where its government sits.
  Two things follow for the capital card. It is safe, its own answer term seeding the `linked` set —
  confirmed at `geo-523`, whose abstract names Olympia twice and links neither. And
  `ADMIN_EDITS.glossOff` — the per-card list of keys to leave un-linked — **is not a way out**: it is
  an admin-overlay delta rather than a card field, so nothing in the content pipeline can write it and
  the overlay-hygiene rule says content must not live there.
  **AND THE TERM ITSELF IS THE THIRD PLACE IT BITES, which nothing had predicted.** A glossary popup
  auto-links its description with only its OWN KEY in the off list, so `Olympia_(Washington)` — whose
  displayed title is "Olympia", the Greek term's key — linked its own subject's name, in its own
  popup, to a sanctuary in the Peloponnese. **A parenthetical key whose bare name is ANOTHER TERM'S
  KEY must not use that bare name anywhere in its description**; the popup's heading already carries
  it, so the prose opens "The capital of Washington is a city of about 56,000 people" and calls it
  "the town" thereafter. The other five parentheticals are unaffected because no other term claims
  their bare names — but **`geo-027` Georgia is the next one to check**, since `Georgia` is an alias
  of `Georgia_(country)` and the same fault would follow.
- **`Georgia` WAS an alias of `Georgia_(country)`, and `geo-027` RETIRED IT.** The measure: twelve texts
  carry the bare word, and they divide **eight for the country** (the Dmanisi cards and terms, `Armenia`,
  `Eurasia`, `Out_of_Africa_I`) against **three for the state** (`geo-009`'s Appalachian Trail,
  `geo-010`'s Cherokee removal, `Jimmy_Carter`'s governorship). The divided-surface rule applies and the
  alias is gone, so the word now links nowhere and both terms carry disambiguated keys —
  `Georgia_(country)` and `Georgia_(state)`.
  **THIS IS THE FIRST TIME THE RULE HAS DESTROYED CORRECT LINKS, and it was applied knowing that**: eight
  right links were given up to remove three wrong ones. The reasoning is the one this file has followed
  since the Archaic-period report — a link that tells a reader the Cherokee were driven out of a country
  in the Caucasus is worse than a word left in plain text, which a reader can still look up — and the
  arithmetic will only move further that way as the collection adds fifty more states and capitals.
  **Read the count as texts-where-the-FIRST-use-is-wrong, not as a majority.**
  Retiring an alias needs the whole term rebuilt from `loadGlossary` and re-added with `"aliases": []`,
  since `add-glossary.js` leaves an alias list alone when the key is absent.

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

- **`Ohio` AND `St._Paul` — AND THE CAPITAL'S SPELLING IS DECIDED BY THE MAP DATA, NOT BY THE
  EDITOR.** `Ohio` measured six uses, all the state, and went in bare. The capital was drafted as
  `Saint Paul` — the city's own name, the Library of Congress's, and what `geo-017` and the `Minnesota`
  term already said — and **`test-map-cards.js` failed it**: section 1 asserts `answerText === map.dot`,
  and the dot key comes from `us-states.js`, which `build-us-states.js` takes from Natural Earth, which
  writes **St. Paul**. `add-card.js` warns about the mismatch and the suite refuses it, which is the
  right division of labour and is why this was caught in the same session rather than by a reader.
  **So the deck is aligned on the data's spelling**: the card answers `St. Paul`, `geo-017` and the
  `Minnesota` term were edited to match, and the glossary term is keyed `St._Paul` with **`Saint Paul`
  as an alias**, so prose in either spelling still opens it. Only the CITATIONS keep "Saint Paul",
  because a citation names a work as its publisher titles it and is never rewritten. **Expect this
  again**: the generated capitals table follows Natural Earth, so check the key before writing an
  answer — `node -e` over `window.US_CAPITALS` takes a second and settles the spelling.
- **The round also broke the proper-name rule twice on its own new card, and both were caught by the
  render check rather than by any checker.** `geo-517` wrote "bought the St. Paul and **Pacific**
  Railroad", which linked to `Pacific_Ocean`, and "toward **Latin** America", which linked to `Latin`,
  the language — the `geo-509` fault reproduced exactly. The railroad was fixed by the round-13
  technique, **putting a correct earlier occurrence in the same sentence** ("drove his lines to the
  Pacific: he bought the St. Paul and Pacific Railroad…"), which is a phrase the source supports and
  which takes the link; the Latin America clause had no correct earlier occurrence and no right key to
  point at, so it was **cut**. **Where the technique has nothing to work with, cutting the clause is
  the honest fix** — a reworded region name that says something slightly different is worse than one
  fact fewer.

- **`Illinois` AND `Trenton` ARE BOTH BARE, AND THE ROUND FOUND A THIRD VARIETY OF WRONG LINK: A
  GIVEN NAME THAT IS SOMEBODY ELSE'S WHOLE NAME.** Both surfaces measured clean (two uses apiece, all
  the state and all the New Jersey capital) and both new cards rendered correctly — except that
  `geo-021` wrote "designed by the architect **Solon** S. Beman", and `Solon` linked to the Athenian
  lawgiver. This is not the round-13 shape: nothing here is a common noun inside a proper name, and the
  round-15 test does not catch it either, because the target does not refer to a *related* thing — it
  refers to a different person entirely, two and a half thousand years away. **A forename is a surface
  like any other**, and the glossary is full of classical single names — Solon, Draco, Homer, Pericles,
  Cicero, Augustus — every one of which is also somebody's American given name. **So check a person's
  FORENAME as well as the phrase around it**, and where the collision is real and there is no correct
  earlier occurrence to take the link, the fix is to drop the name: Pullman's designers are now "an
  architect and a landscape engineer working to one scheme", which costs the card two names it did not
  need and removes the fault entirely.
  One link was considered and **kept**: `geo-518`'s "the thousand-man **German** garrison" resolves to
  `Germany`, and there was no German state in 1776 — but the adjective means what the term is about,
  which is round 15's test, and it is the same shape as the "British" links already all over the deck.

- **`Virginia_(state)` IS THE FOURTH PARENTHETICAL, AND THE ROUND ALSO RETIRED AN ALIAS ON A TERM
  NOBODY WAS EDITING.** "Virginia" measured six uses and they divide: three are the state, and three are
  **Virginia City** on the Comstock (`geo-015`, `geo-515`, the `Nevada_(state)` term) — a Nevada mining
  town, which is the `Gold Hill` shape. So the key takes the parenthetical, exactly as `New_York_(state)`
  and `Nevada_(state)` did, and the bare word links to nothing. `Boston` measured seven uses, all the
  city, and went in bare.
  **The alias retirement is the more useful half.** `geo-519` calls the Old State House "the oldest
  **Georgian** public building left in the country", and it linked to `Georgia_(country)`, which carried
  "Georgian" in its alias list. Measured across the corpus, that surface divides 2–2: the Dmanisi
  fossils on `wh-020` and `Homo_ergaster` are Georgian in the demonym's sense, and the two
  architectural uses are not. **A divided surface gets no alias from either claimant**, so "Georgian"
  is gone from that list and the country keeps "Georgia" alone; the Dmanisi mentions now link to
  nothing, which is the honest result. **Check a DEMONYM as well as a place name** — an adjective that
  is also a style, a period or a dynasty (Georgian, Victorian, Roman, Elizabethan) will collide sooner
  or later, and this is the alias list the file already flagged as needing settling at `geo-027`.
  One link was considered and kept: `geo-022`'s "the French in the **Ohio** valley" of 1753 resolves to
  `Ohio`, and the state did not exist until 1803 — but the valley is the river country the state is
  named for, which is the round-15 test, and it is the `Massachusetts Bay colony` case again.

- **`Washington_(state)` AND `Columbus_(Ohio)` ARE THE FIFTH AND SIXTH PARENTHETICALS, and the second
  of them is the first key disambiguated against a PERSON.** "Washington" measures 24 uses and only two
  are the state (`wh-102` and `Clovis_point`, both writing "Washington state"); the rest are George
  Washington, the federal city, the government and two universities. "Columbus" measures four and
  divides evenly — two the Ohio city (`geo-020`, the `Ohio` term) and two Christopher Columbus (the
  `Cuba` and `The_Bahamas` terms) — which is the divided-surface rule at its smallest sample and still
  the right answer, since a reader meeting "Columbus" in a sentence about the Caribbean must not be
  handed a city in Ohio. Neither key claims its bare name.
  **The round also shows the earlier-mention technique working on a REGION name**: "the Pacific
  Northwest" linked "Pacific" to `Pacific_Ocean`, which is the `Gold Hill` shape a sentence later, and
  the fix was to give the ocean its own true mention first — Heceta in 1775 "was swept back out into
  the Pacific" — so the correct link fires and the region name is skipped. That is better than cutting
  the phrase: the card gains a link it should have had.

- **`Oregon` GOES IN BARE AND `Springfield_(Illinois)` DOES NOT, ON THE SAME MEASURE.** "Oregon"
  measures four uses and none of them is a stranger: one is the state outright (the Paisley Caves on
  `wh-098`), two are the *Oregon Trail* (`geo-012`, the `Idaho` term) and one the *Oregon boundary* of
  1846 (`James_K._Polk`). The trail and the boundary name the region rather than the state, which is
  the shape round 15 tests — and here they pass it, the way `geo-022`'s "the French in the **Ohio**
  valley" did: the region is what the state was made from, and a reader following either link lands on
  the right corner of the continent. **A surface divides when its uses mean different THINGS, not when
  they mean the same place at different dates.** "Springfield" measures four and splits evenly between
  the Illinois capital (`geo-021`, the `Illinois` term) and the federal armoury at Springfield,
  Massachusetts (`geo-019`, the `Massachusetts` term), so it takes the parenthetical.

- **`Arizona_(state)` IS THE FIRST KEY DISAMBIGUATED AGAINST A SHIP, and it shows the measure is not a
  head-count.** "Arizona" has three existing uses and TWO of them are the state — the Paisley Caves are
  described as being in Oregon and the Hoover Dam as on "the Arizona line" — so a majority test would
  have given it the bare word. The third is `geo-506`'s **USS Arizona**, and that decides it: the first
  occurrence in a card is the only one that links, and on the Honolulu card the first is the battleship,
  so a bare key would have put a wrong link on a card already shipped. **Count what the FIRST occurrence
  on each card means, not what the corpus means on balance** — and a warship named for a state is a
  different thing from the state, where the Oregon Trail was not. `Richmond` measures two uses, both the
  Virginia capital, and goes in bare.
  Two auto-link faults were found in the round's own drafts and both are the component-word shape this
  file keeps recording: "the furthest northern reach of **New Spain**" linked to `Spain` (rewritten to
  "Spain's empire in America", where the link is right), and "the Tredegar **Iron** Works" linked to
  `Iron` — fixed by letting the metal take the link first, "what made it worth holding was as much
  **iron** as politics". A third was "short of **pig** iron", which resolved to `Pig`, the animal.
  **A compound technical term is as dangerous as a proper name**, and the cheapest fix for both is a
  true earlier mention of the ordinary word.

- **`New_Mexico` WENT IN BARE AND REPAIRED TWO SHIPPED CARDS ON THE WAY IN.** All six existing uses
  are the state — the Clovis and Folsom type sites, and the Santa Fe Trail on `geo-010` — but until
  this round the surface "New Mexico" was being eaten by `Mexico`, whose own key matched inside it:
  `wh-100` and `geo-010` both linked the words "New Mexico" to the country, as did the `Clovis_culture`
  and `Folsom_tradition` terms. Adding the longer key fixed all four at once, because `buildGlossIndex`
  sorts surfaces longest-first. **Adding a term can REPAIR an auto-link as well as break one**, and the
  place to look for that is any key that is a substring of a place the deck will reach later.
  One draft fault went the other way and is the component-word shape again: `geo-523`'s first
  territorial legislature met above the **Gold** Bar Restaurant, which linked to `Gold`. There is no
  gold anywhere in Olympia's story to take the link first, so the restaurant's name was dropped — "a
  hired room above a restaurant" — which is what that sentence was for anyway.

- **`Salem` GOES IN BARE, AND THE RISK IS NAMED RATHER THAN HEDGED.** Two texts carry the word today
  and both are the Oregon capital, so the measure says bare — but Salem, Massachusetts is famous, and a
  `us-` card about the witch trials would land on this key. That is the same bet `Richmond` took, and the
  answer if it ever comes due is the one used here for Georgia: measure again, and if the surface has
  divided, retire the bare key for two parentheticals. **Do not pre-emptively parenthesise against a
  card nobody has written.**
  One more Pacific fault, in the round's own drafts: "the first mission anywhere in the **Pacific**
  Northwest" resolved to `Pacific_Ocean` again. Measured across the corpus the alias is right — 54 texts
  carry the word and the great majority mean the ocean — and `Pacific_Northwest_Coast` is a key that
  already wins where the full phrase appears, so the fix is local: the card says "the American
  north-west", and the sentence that keeps its link says "the **Pacific** coast", where the word does
  mean the ocean.

- **`Charleston` WAS A BARE KEY AND `geo-028` BROKE IT WITHIN FIVE ROUNDS.** It was written for
  `geo-513`, the capital of West Virginia, on a measure that was true at the time; South Carolina's
  largest city is also Charleston, so the moment that state's card shipped the term was linking two
  texts to the wrong city. Measured, the surface divides evenly among the texts that actually link —
  `geo-013` and `West_Virginia` for the capital, `geo-028` and `South_Carolina` for the port — so the
  key was retired for **`Charleston_(West_Virginia)`** and the word now links nowhere. **A bare key is
  a bet that no later card will use the name for something else, and in a collection working through
  fifty states that bet comes due fast.** The lesson is not to parenthesise everything: it is that
  **the round which introduces a name should re-measure the names it already holds**, which is how
  this was caught in the same session rather than by a reader.
  Rekeying is add-then-delete: rebuild the entry from `loadGlossary` under the new slug, then run
  `add-glossary.js` on `{"slug": "<old>", "delete": true}`. The description needs no rewrite, since a
  bare name nobody claims cannot self-link — the Olympia fault only bites when another term owns it.
- **`Phoenix_(Arizona)` IS THE SEVENTH PARENTHETICAL, AND THE COLLIDING TEXT IS ONE THIS PASS WROTE
  YESTERDAY.** "Phoenix" measures three uses: the Arizona city on `geo-025` and its term, and the
  **Cherokee Phoenix**, the newspaper named in `geo-027`, written the round before. On that card the
  newspaper is the first occurrence, so a bare key would have mislinked a card one day old.
  `South_Carolina` goes in bare — one existing use, the state — and takes no "Carolina" alias, which
  would have caught the Spanish-colonial raids on `geo-503` and a forename in `gr-151`.

- **`North_Carolina` AND `Santa_Fe` BOTH GO IN BARE, AND THE ROUND'S REAL WORK WAS THE RE-MEASURE.**
  Both new surfaces are clean — "North Carolina" has two existing uses, both the state, and "Santa Fe"
  has three, of which the third is `geo-010`'s **Santa Fe Trail**, named for and leading to that city,
  which is the `Oregon Trail` case and passes. What the round-24 rule bought was the check in the other
  direction: `geo-029`'s own subject list contains **Old Salem and Salem Tavern**, the Moravian town in
  Winston-Salem, and writing either would have divided `Salem` — the bare key this pass gave Oregon's
  capital two rounds ago — inside the same card that introduced it. The card was written from the other
  National Historic Landmarks instead (Reed Gold Mine, the North Carolina Mutual Life building), which
  is editorial freedom rather than a dodge; **the trigger is recorded so the next writer knows that the
  first Winston-Salem subject forces `Salem_(Oregon)`.**

- **`Pennsylvania` AND `Atlanta` BOTH GO IN BARE, AND THE ROUND'S FAULT WAS A FRATERNAL ORDER'S NAME.**
  "Pennsylvania" has four existing uses: three are the state and the fourth is `Jeremy_Rutter`'s
  **University of Pennsylvania**, which is the `Ohio valley` case — an institution named for the state
  it stands in — so the key goes in bare. "Atlanta" has two, both the Georgia capital. The draft fault
  was `geo-527`'s **Yaarab Temple Building Company**, whose "Temple" resolved to the ancient-buildings
  term; a shriners' lodge is not that kind of temple, and with no true temple anywhere in the card to
  take the link first the company's name was dropped for what it was — "a mosque for some 5,000 members
  of a shriners' order". **A fraternal order, a company or a club whose name contains an ordinary
  common noun is the same trap as a proper place name**, and there is no earlier-mention fix when the
  card has no honest use for the word.
  One link worth recording as CORRECT: `geo-030`'s "pre-Clovis times" resolves to `Clovis_culture`,
  which is exactly what the prefix negates, and `Meadowcroft Rockshelter` links to the term the
  prehistory deck already holds — the first time a geography card has met a glossary term written for
  another collection and simply fitted it.

- **`Wisconsin_(state)` IS THE FIRST KEY WHOSE BARE NAME IS WRONG IN *EVERY* EXISTING USE.** The
  measure found two occurrences of "Wisconsin" and neither is the state: `wh-052`'s "the Wisconsin in
  North America" and the `Wisconsin_glaciation` term itself, the glaciation being named for the state
  but not being it. Every earlier parenthetical on this pass was a divided surface — some uses right,
  some wrong; this one is unanimous the other way, which makes the decision easier rather than harder
  and is worth naming so the next 0-for-N case is not mistaken for a reason to hesitate. `Columbia`
  went the same way for the ordinary reason: eight uses split between the Columbia River, British
  Columbia three times, Columbia University and the South Carolina capital, so the capital takes
  **`Columbia_(South_Carolina)`**. Both keys therefore claim no auto-link surface at all, which is the
  settled practice for a parenthetical key here — the term is reachable from its own card and from the
  glossary list, and the ambiguous word links to nothing.
  The round's one link worth recording as CORRECT is `geo-031`'s **"Unemployed tin miners"** resolving
  to `Tin`. It looks at first like the component-word-inside-a-proper-name family, and it is the
  opposite: Cornish tin miners really did mine tin, so the metal is what the reader should get.
  **Check what the component word MEANS in the sentence before treating a surprising link as a fault.**

- **THE NPS ASSET PATH HAS TWO SPELLINGS AND ONLY ONE OF THEM IS RIGHT PER PROPERTY.**
  `npgallery.nps.gov/NRHP/GetAsset/NHLS/<refnum>_text` serves a document only where the property is a
  National Historic Landmark; for an ordinary National Register listing it returns the **1,623-byte
  stub**, and the nomination is at `.../GetAsset/NRHP/<refnum>_text` instead. Both 200, so a citation
  written to the wrong one is a live URL pointing at nothing. **Check the response SIZE, not the
  status.** Of this round's eight nominations only two — the Dairy Barn and the First Baptist Church —
  are NHLs and take the NHLS path.
  The way to FIND a refnum is the NPS ArcGIS layer, `mapservices.nps.gov/arcgis/rest/services/`
  `cultural_resources/nrhp_locations/MapServer/0/query`, filtered on `State='WISCONSIN'` — spelled
  out and upper case, not the postal code — with `RESNAME LIKE '%…%'`. NPGallery's own search page
  renders its results in JavaScript and hands a fetch nothing but page furniture.

- **A CAPITAL'S FOUNDING DATE IS NOT ALWAYS REACHABLE, AND THE STATE HOUSE'S IS.** Columbia was laid
  out in 1786 and no openable source here says so: `schpr.sc.gov` (the South Carolina Historic
  Property Record) is behind a bot wall, `nationalregister.sc.gov` refuses the connection, and none of
  the eight Columbia nominations read for this card states the year. What the legislature's own
  **Student Connection** site does carry is a dated State House sequence — Charleston 1753, Columbia
  1790, the fire of 1865, the third building finished in 1903 — which dates the move as well as the
  founding would have and is published by the body that made it. **Where a city's founding is
  unsourceable, the arrival of the thing that made it a capital usually is.**
  Read that page against the National Register nomination before using it, though: it says flatly that
  "the State House was destroyed by fire … by General William T. Sherman on February 17", and the
  nomination is careful that what burned was the OLD state house while the unfinished new one was
  shelled and spared. Both are true of different buildings; the card follows the nomination.

- **`Indiana` AND `Raleigh` BOTH GO IN BARE, AND THE ROUND PAID FOR ITSELF ON THE SOURCE RULE INSTEAD.**
  "Indiana" has three existing uses and every one is the state or something named for it — `geo-020`'s
  list of canal states, `Benjamin_Harrison`'s "An Indiana senator", and `William_Henry_Harrison`'s
  "governor of Indiana Territory", which is the `Ohio valley` case. "Raleigh" has two and both are the
  capital; **Sir Walter Raleigh is the foreseeable trigger** and is recorded here the way Winston-Salem
  was for `Salem`, since the first card or term that names the man divides the surface and forces
  `Raleigh_(North_Carolina)`. Note that `geo-529` itself names him and does NOT divide it: the link goes
  on the first occurrence, which is the city in sentence one, so the man's name in sentence five is left
  plain — **a card may safely name the ambiguous person as long as the term's own sense comes first.**

- **NCPEDIA PASSES THE ENCYCLOPEDIA TEST AND BRITANNICA DID NOT, AND THE DIFFERENCE IS WHAT IS BEHIND
  THE LINK.** The glossary pass allows an encyclopedia only where that encyclopedia cites its own
  sources, tested per article (finding N9). `ncpedia.org` is published by the **Government & Heritage
  Library of the State Library of North Carolina**, its Raleigh article carries three named authors and
  a revision date, and its "References and additional resources" link resolves to a real bibliography —
  a dozen monographs and local histories, Powell's *Encyclopedia of North Carolina* and *North Carolina
  Gazetteer* among them. That is a source list; Britannica's "External Websites" box, which N9 rejected,
  is a list of other websites. **Follow the link before deciding**: on this article it took one fetch.
  It was worth the trouble because the founding of Raleigh is otherwise unreachable from here —
  `schpr.sc.gov`'s North Carolina equivalents, `nationalregister.sc.gov`, and every Raleigh nomination
  but three are shut or stubs — and NCpedia carries the 1787 ten-mile rule, the 1792 purchase of Joel
  Lane's plantation for £1,378, William Christmas's plan around Union Square and Governor Alexander
  Martin's choice of name, all in one page.

- **THE 22,151-BYTE STUB IS THE OTHER NPS ANSWER, AND IT IS MUCH COMMONER THAN THE 1,623-BYTE ONE.**
  Round 27 recorded that `GetAsset/NHLS/<refnum>_text` returns 1,623 bytes where the property is not a
  National Historic Landmark. This round found the matching case on the other path: `GetAsset/NRHP/` —
  returns **22,151 bytes** where NPGallery holds no nomination at all. Six Raleigh listings that would
  have carried the city's story came back at exactly that size (the Joel Lane House, Estey Hall at Shaw
  University, Dorton Arena, the Executive Mansion, Mordecai House, the Oakwood and Maiden Lane
  districts), which is why the card rests on the Capitol, Christ Church and the Daniels house — the
  three Raleigh properties that are Landmarks. **Both stubs return 200. Size is the only test.**

- **A 1976 NOMINATION'S PROSE IS NOT REUSABLE EVEN WHERE ITS FACTS ARE.** Grouseland's nomination
  describes Harrison as "foremost defender of white settlement against the Indian tribes who attempted
  to block the White tide of westward expansion" and calls Tecumseh "the great Red leader". The dates,
  the confederation, the warning at Vincennes and the outcome at Tippecanoe are all sound and all cited;
  the framing is the nomination's own period voice and was rewritten. The same discipline runs the other
  way on `geo-529`: the Josephus Daniels nomination is the source for both halves of that man — his
  biographer's "leading voice of reform in North Carolina and the upper South" **and** "one of the major
  spokesmen for Negro disfranchisement in a 1898 white supremacy campaign" — and a card that took the
  first without the second would be a whitewash written out of a source that refuses to be one.

- **`Kentucky` AND `Harrisburg` GO IN BARE, AND THE ROUND'S REAL WORK WAS TWO COMPONENT-WORD TRAPS FOUND
  BEFORE DRAFTING.** Both surfaces are clean — "Kentucky" has three uses, all the state (including
  `Abraham_Lincoln`'s "a Kentucky log cabin"), and "Harrisburg" has two, both the capital. What the
  round-24 re-measure caught was in the *intended content*: **`Mammoth` claims the bare surface**, so
  "Mammoth Cave" would have linked the cave to the Pleistocene proboscidean, and the cave is named for
  its size. The fix is the documented one and it worked: **Big Bone Lick, where mammoths and mastodons
  were trapped in the bog, is sentence four and Mammoth Cave is sentence six**, so the animal takes the
  link and the cave is left plain — verified by rendering both the card and the popup, not assumed.
  That fix is only available because the earlier mention is HONEST; had Kentucky no mammoth of its own,
  the cave would have had to go.
  · **`Louisville` IS ALREADY A DIVIDED SURFACE and nobody has noticed, because no term claims it.**
    Its one use in the corpus is `geo-527`'s **Louisville, Georgia**, the 18th-century Georgia capital,
    not the Kentucky city — so a future `Louisville` term must be parenthetical from the day it is
    written. Recorded here the way Sir Walter Raleigh and Winston-Salem are.

- **"OHIO RIVER" WOULD LINK TO THE STATE, AND THE CORPUS HAS NEVER TESTED IT.** `Ohio` claims the bare
  surface, and both existing occurrences of "Ohio River" sit inside the Ohio card and the Ohio term,
  where that key is its own and off the list — so the fault has been invisible. Kentucky's northern
  border is the Ohio, and `geo-033` would have been the first text to expose it. **The card avoids the
  phrase** (Big Bone Lick is placed "south-west of Cincinnati"), which costs nothing here, but four more
  states border that river and the dodge will not keep working. The honest fix is an **`Ohio_River`
  glossary term**: surfaces sort longest-first, so "Ohio River" would then take the river and a bare
  "Ohio" the state. That is a term to write, not a rule to remember.

- **`tile.loc.gov` ANSWERS WHERE `www.loc.gov` IS 403, AND SO DOES THE LOC JSON API.** This is the
  round's biggest access find and it opens a large corpus for the capital cards. Every `www.loc.gov`
  HTML page is 403 from here, with or without a browser User-Agent — but **`https://www.loc.gov/search/
  ?q=…&fo=json` returns 200**, and the files themselves are served from **`tile.loc.gov`**, which is
  not blocked. So the **Historic American Buildings Survey data books** — the written histories that
  accompany the measured drawings — are readable at
  `tile.loc.gov/storage-services/master/pnp/habshaer/<st>/<st>NN00/<st>NNNN/data/<st>NNNNdata.pdf`.
  HABS PA-394, *The First Capitol Buildings, Harrisburg*, carries the whole of `geo-530`: the Act of
  February 1810, the ground given by John Harris and William Maclay, the architects' competition with
  its $400 premium, Stephen Hills from Ashford in Kent, Governor Findlay's cornerstone of 1819, the
  costs, the fire of 2 February 1897 and the dedication of 4 October 1906. **Find the id with the JSON
  search, then fetch the PDF from tile.** The citation points at the PDF rather than the item page,
  because the PDF is the document that was read and the one that opens.
  It was needed because **NPGallery has almost nothing for Dauphin County**: the Pennsylvania State
  Capitol's own NHL record (77001162) is the 22,151-byte stub on both paths, as are the Broad Street
  Market, Camp Curtin, the John Harris Mansion and every Harrisburg bridge.

- **THE NRC'S FACILITY LOCATOR IS WHAT LICENSES A NEARBY SUBJECT.** Three Mile Island belongs on a
  Harrisburg card only if a source says where it is relative to Harrisburg, and the accident
  backgrounder does not — it places the reactor "near Middletown, Pa." and mentions the city once, for a
  committee meeting. The NRC's **Operating Nuclear Power Reactors** page states it outright:
  "Middletown, PA (10 miles SE of Harrisburg, PA)". **Before putting a nearby subject on a city's card,
  find the source for the nearness**, and cite it separately from the source for the event. The card
  also keeps the NRC's own qualifier — small releases, no detectable health effects on workers or the
  public — attributed to the commission rather than asserted flat.

- **`Tennessee` AND `Madison` GO IN BARE, AND `Madison` SETTLES A WORRY THIS PASS HAS BEEN CARRYING.**
  "Tennessee" has four uses and all four are the state. "Madison" has three: two are the Wisconsin
  capital and the third is the opening words of `James_Madison`'s own description. That third looked
  like a reason to go parenthetical — inside the president's popup his own key is off the link list, so
  a shorter `Madison` surface appeared free to grab half his name, which is round 22's Olympia
  self-link fault wearing a new coat. **Measured, it does not happen**: the term was added bare, the
  `James_Madison` popup rendered, and "Madison" there is plain while `Wisconsin_(state)` links its
  "Madison" correctly. **A shorter surface does not slip inside a longer registered one even when the
  longer one is the popup's own key** — so the plan's older note that the presidents are keyed by full
  name and leave `Jackson`, `Lincoln` and `Madison` free is right for the reason it gives *and* safe
  in the one case that looked like an exception. Test it again if `buildGlossIndex` is ever touched.

- **A NOMINATION'S OWN WORDING CAN CARRY A LINK TRAP INTO A CARD.** Blount Mansion's nomination calls
  William Blount "Governor of the Territory South of the Ohio River (commonly known as the 'Southwest
  Territory')", and quoting the formal name would have fired last round's "Ohio River" fault on the
  first geography card outside Ohio's own. `geo-034` writes **the Southwest Territory** and nothing is
  lost — the nomination itself offers the short form. **When a source's phrasing contains a bare state
  name, check the alternative the source already gives you before rewriting around it.**

- **TENNESSEE IS THE FIRST STATE WHOSE FOUR LANDMARKS SPAN FOUR CENTURIES AND FOUR SUBJECTS**, which is
  worth naming as a shape to aim at rather than a fact about Tennessee: Blount's mansion for the 1796
  convention, Jubilee Hall for the Fisk Jubilee Singers who paid for it, the X-10 reactor at Oak Ridge
  for 1943, and Sam Phillips's Memphis studio for 1950. **A state card reads better when its four
  Landmark sources are four different kinds of thing** — a government, a school, a laboratory, a
  recording room — than when they are four houses of four politicians. The NHL list is short enough per
  state (Tennessee has twelve) to choose for that spread rather than take the first four that answer.

- **`Missouri_(state)` IS THE MOST DIVIDED SURFACE THE PASS HAS MET: NINE OF ITS TWELVE USES ARE NOT THE
  STATE.** Three are the **Missouri Compromise** (`geo-009`, `James_Monroe`, `Maine`), four the
  **Missouri Valley** or the **Missouri River** (`geo-016`, `geo-516`, `geo-524`, `Salt_Lake_City`,
  `Salem`), one `North_America`'s "the basin of the Mississippi and Missouri". Only `geo-010`,
  `geo-024` and `Harry_S._Truman` mean the state. It is round 29's Ohio River problem at four times the
  scale and settles the same way: **the key is parenthetical, so all twelve stay plain**, verified by
  sweeping every text that names the word. **A `Missouri_River` term would be the real fix**, exactly as
  an `Ohio_River` term would — surfaces sort longest-first, so the river would take "Missouri River"
  and "Missouri Valley" and leave the bare word to the state. Two rivers now want the same term.
  `Indianapolis` goes in bare: two uses, both the city.

- **THE SPLITTER COULD NOT SEE A CASE CITATION, AND NOW CAN.** `split-abstract.js` broke `geo-035` after
  "Shelley v." — a **lowercase abbreviation between two capitalised names**, which is the one shape none
  of its existing guards covers: the initial rules want a capital before the stop, the genus and rank
  rules want a lowercase word after it. Fixed with the narrowest test that works —
  `(?<=\p{Lu}\p{L}+\s)vs?\.\s(?=\p{Lu})` — and **verified over all 2,043 shipped texts: exactly two
  splits change, and both are the ones it was written for.** The German era abbreviation is untouched,
  its "v." following a NUMBER rather than a name. Every future card naming a Supreme Court decision
  would have hit this.

- **THE "LOUISIANA PURCHASE" LINK IS THE COMPONENT-WORD TRAP WITH A FREE FIX, AND THE FIX HAS TO BE
  MADE TWICE.** "Louisiana Purchase" links its first word to the STATE, and `geo-010` has carried that
  link since it shipped. On `geo-035` the Library of Congress's own sentence supplies the cure — "after
  Louisiana, was the second state of the Louisiana Purchase to be admitted" puts the state first, so it
  takes the link and the Purchase is left plain. **The glossary term needed the same fix separately**:
  its first draft opened on "the second state of the Louisiana Purchase … after Louisiana itself" and
  the popup duly linked the Purchase, caught by rendering it. **A card and its term are two texts and
  the earlier-mention fix does not travel between them** — check both.

- **THE LONGEST-FIRST FIX IS THE PASS'S MOST REUSABLE TOOL, AND IT REPAIRS SHIPPED TEXTS FOR FREE.**
  Rounds 29 and 31 each recorded that a wrong component-word link wants a LONGER term rather than a
  reworded sentence, and named `Ohio_River` and `Missouri_River`. `geo-036` could not dodge its own case
  — the Louisiana Purchase Survey Marker is one of the four things worth saying about Arkansas — so
  **`Louisiana_Purchase` was written this round**, cited to the National Archives milestone document,
  the Office of the Historian and the marker's own nomination. Measured afterwards: "Louisiana Purchase"
  now resolves to the event **in `geo-010` and `Missouri_(state)` as well**, where it had been pointing
  at the state of Louisiana since `geo-010` shipped. **One term, three texts corrected, and no prose
  touched.** Two surfaces still want the same treatment (`Ohio_River`, `Missouri_River`) and a third is
  arguable — `Greek Revival` currently resolves to the modern country, which is looser than it should be
  but no looser than `wh-207`'s "in Greek", already shipped; a `Greek_Revival` term would sharpen it.
  **Writing the longer term is in scope for a round whose own card needs it**, and is the cheapest
  correction this pass has.
  Three links checked and judged CORRECT rather than fixed: `settlement` and `cemetery` resolve to the
  archaeological concepts, and both sentences mean exactly those concepts — including "Greenhill
  Cemetery", which really is a cemetery, where "Mammoth Cave" is not a mammoth. **The round-27 test —
  what does the component word MEAN in this sentence — settles all three in two minutes.**

- **`Arkansas` AND `Frankfort` BOTH GO IN BARE**, three clean uses and two. Worth recording for the
  capitals still to come: **`Little Rock` already appears in `Dwight_D._Eisenhower`**, correctly, so
  `geo-536` will find its surface clean; and the Arkansas card's `Arkansas Post` is the `Ohio valley`
  case, a place named for the river and state it stands on.

- **THE MAP-CARD SUITE HAS AN INTERMITTENT SINGLE-ASSERTION FAILURE THAT DOES NOT REPRODUCE.** It
  reported 716 passed / 1 failed once this round and 717 / 0 on the next three runs with nothing
  changed, which is the same shape recorded in an earlier round at 573 / 1. The likely cause is now
  visible: the sandbox's outbound proxy drops connections **during** the run — Supabase, Google Fonts
  and the autofill endpoint all reported closed tunnels — so a browser assertion that waits on a page
  which is itself waiting on a dropped fetch will occasionally miss. **Re-run before believing it, and
  do not report a clean first pass that did not happen.**

- **ROUND 32'S "ARGUABLE" THIRD SURFACE WAS WRITTEN, AND IT REPAIRED A SHIPPED CARD THE SAME WAY.**
  That round named `Ohio_River`, `Missouri_River` and — as the arguable one — `Greek_Revival`, whose
  surface was resolving to the modern country of Greece. `geo-534` could not dodge it: William
  Strickland's capitol is the reason Nashville looks the way it does, and the phrase is the one the
  sources use. **`Greek_Revival_architecture` was written this round with the alias `Greek Revival`** —
  the key is the Wikipedia slug and the alias is the surface the prose actually carries — cited to the
  Tennessee Capitol and Kentucky Old State House nominations. Measured afterwards: "Greek Revival" now
  resolves to the style **in `geo-533` as well**, where it had been pointing at Greece since that card
  shipped. Second round running that one new term corrected a card nobody was editing.

- **A NEW TERM CAN CARRY ITS OWN COMPONENT-WORD TRAP, AND ONLY RENDERING IT SHOWS THIS.** `Pig_iron`
  was written for the same longest-first reason — "pig iron" was resolving its first word to `Pig`, the
  domesticated animal, on the Alabama card — and the fix worked on the card and then failed inside the
  new term's own popup, where "the bars that set in the moulds the pigs" linked to the animal. The cure
  was not a longer term but **an honest sentence**: the first sentence now says the arrangement's
  "fancied likeness to a sow suckling her pigs gave the metal its name", where the word does mean the
  animal, so the link is correct rather than suppressed. **Render the new term as well as the new card**
  — round 32 recorded that the earlier-mention fix does not travel between them, and this is the same
  lesson from the other side.

- **A PARENTHETICAL KEY REALLY DOES STAND DOWN, AND IT SAVED A TERM THIS ROUND.** A surface scan run by
  hand — stripping `_(…)` the way `glossKeyTitle` does — predicted that "Booker T. Washington" would
  link its surname to `Washington_(state)`, which would have been the worst mis-link the pass has made.
  Rendering `geo-037` shows it does not fire at all: `glossKeyTitle` strips the parenthetical for the
  TITLE and the stripped form is never registered as a surface. **Build the scan from the app's own
  index, not from a hand-stripped key list**, or it invents traps and hides real ones.

- **`Alabama` AND `Nashville` BOTH GO IN BARE**, one clean use and two, all of them the state and the
  city. Three surfaces recorded for the rounds to come: **`Montgomery` is already in the corpus** as
  "Montgomery's Tavern" on `geo-036`, so a bare `Montgomery` key for `geo-537` would link a tavern in
  Arkansas to the capital of Alabama; **`Memphis`** is free today and will not be once Egypt is written;
  and **`Parthenon`** is free today, which is why the Nashville replica links to nothing — a future
  Ancient Greece term would claim it, and Nashville's is a concrete copy of 1931, not the building on
  the Acropolis.

- **THE `African`→`Africa` LINK IN "African Americans" IS THE PASS'S OLDEST UNFIXED TRAP.** It fires on
  `geo-533` and will fire on every United States card that uses the phrase. It fails the round-27 test
  outright — the word names an American people, not the continent — and the fix is the same
  longest-first one: an `African_Americans` term. It is bigger than a geography round should carry on
  its own, so it is written down here beside `Ohio_River` and `Missouri_River` as work the collection
  owes.

- **`test-gloss-image.js` FAILS IN THIS SANDBOX AND DID SO BEFORE THIS ROUND.** It times out clicking
  the `Sima_Qian` popup's picture, which never becomes visible because `GLOSS_IMG_WAIT` holds the body
  until the image's size is known and the remote file cannot be fetched through the proxy. **Verified by
  stashing the round's three data files and re-running: identical failure.** Check a failing browser
  suite against the unmodified tree before treating it as yours.

- **THE RIVER TERMS ARE SAFE AFTER ALL, AND THE REASON IS IN `autoLinkGlossary`.** Rounds 29, 31 and 32
  recorded `Ohio_River` and `Missouri_River` as owed work, and this round nearly deferred
  `Mississippi_River` on a fear that turned out to be unfounded: that giving a river term the bare state
  name as an alias would make the STATE's own card link its answer term to the river. It would not.
  `autoLinkGlossary` resolves the card's `answerText` against **every** surface and adds the KEY it finds
  to the suppressed set, so on a Mississippi card the surface "Mississippi" would resolve to the river
  term and suppress it outright. **The obstacle is elsewhere, and it is real**: a LATER card that is not
  about the state — `geo-538` Jackson will say "the capital of Mississippi" — gets no such suppression,
  and a bare alias would point that at the river. So `Mississippi_River` ships with **no bare alias**, its
  only surface the full name, which links correctly on `geo-038` and leaves the fourteen existing bare
  "the Mississippi" uses exactly as they were. **Measure the bare surface before aliasing a river**, and
  expect the same answer for the Ohio and the Missouri.

- **`Mississippi` IS THE MOST ONE-SIDED SURFACE THE PASS HAS MEASURED: 14 uses and not one of them the
  state.** Every one is the river, its valley, its floodplain or its basin — `wh-159`, `geo-008`,
  `geo-035`, `geo-036`, `geo-508`, `geo-517` and eight glossary terms. Round 31's `Wisconsin_(state)` was
  the first case where every existing use was the other sense; this is that at four times the scale, and
  it settles the key shape without argument: **`Mississippi_(state)`**, parenthetical, claiming nothing
  bare.

- **THE CORINTHIAN TRAP IS THE `Greek Revival` ONE AGAIN, ONE ORDER OVER.** `Corinth` carries the alias
  "Corinthian", so "134 Corinthian columns" on the Jefferson City card resolved its adjective to the Greek
  city. Folio already had `Doric_order` and `Ionic_order` and not the third, so the fix was the missing
  sibling: **`Corinthian_order`**, cited to Vitruvius 4.1 at Perseus and Marquand's *Greek Architecture*
  (1909) — the same two works the other two orders cite — and the card now reads "134 columns of the
  Corinthian order", which the longer surface claims. **A bare "Corinthian" still resolves to Corinth and
  that is correct**, since the adjective does mean the city elsewhere; what changed is that the
  architectural sense now has a surface of its own.

- **`www.loc.gov/item/…` IS 403 HERE AND `tile.loc.gov` IS NOT**, which decided every citation on
  `geo-535`. Cole County has **no NPS nomination documents at all** — all five npgallery fetches returned
  the 22,151-byte "no nomination held" stub — so the whole card rests on HABS written data, reached
  through the loc.gov JSON API (`?fo=json` answers where the item page does not) and cited at the
  `tile.loc.gov` PDF, which is round 30's Harrisburg route used again. The data PDFs also **429 under
  rapid fetches**; retry with backoff rather than recording them as unreachable.

- **`Jefferson_City` AND `Mississippi_River` EACH REPAIRED A SHIPPED CARD ON ARRIVAL** — `geo-035` now
  links its capital, and `geo-038` its river — which is the third round running that a new term corrected
  a text nobody was editing. Two surfaces recorded for later: **`Cairo`** will be claimed by Ancient Egypt
  and would then take Cairo, Illinois, so the river term says "its lower course" instead; and
  **`Montgomery`** and **`Memphis`** are still free but will not stay so.

- **`Delaware` IS DIVIDED THREE WAYS AND NOT ONE OF THEM DOMINATES.** Its five uses are the RIVER twice
  (`geo-518` and the `Trenton` term, both "on the Delaware"), a STREET NAME twice (`geo-532` and the
  `Indianapolis` term, "North Delaware Street") and the STATE once, in `Joe_Biden`. Round 31's
  `Wisconsin_(state)` was every-use-the-other-sense and round 34's `Mississippi_(state)` was fourteen
  uses all one way; this is the third shape, a surface with no majority at all, and it reaches the same
  key: **`Delaware_(state)`**, parenthetical, claiming nothing bare. Rendering `geo-518` confirms the
  river reference is left alone.

- **`Little_Rock` REPAIRED THREE SHIPPED TEXTS ON ARRIVAL** — `geo-036`, the `Arkansas` term and
  `Dwight_D._Eisenhower`, all of which named the city and linked nothing. That is the fourth round
  running in which a new term corrected texts nobody was editing, and it is now predictable enough to
  plan for: **measure the surface, and if every use is the answer term's own sense, the term pays for
  itself the moment it ships.**

- **THE ARKANSAS CAPITAL CARD HAD TO GO ROUND ITS OWN STATE CARD.** `geo-036` had already spent the
  Little Rock school crisis in detail — the Daisy Bates house, the executive order, the 101st Airborne,
  Central High — so `geo-536` is built on what the state card did not touch: the limestone outcrop that
  named the place, Gideon Shryock's state house, the arsenal, and the capitol of 1899. **Read the
  matching state card before writing a capital**, or the two repeat each other and the second says
  nothing new.

- **SHRYOCK NOW APPEARS ON THREE CARDS AND THE THREAD IS WORTH KEEPING.** He drew Frankfort's old state
  house (`geo-533`), he is the American exemplar in the `Greek_Revival_architecture` term written last
  round, and Little Rock's Old State House is his too — its plans cut down by his assistant George
  Weigart when the state would not pay. A collection of fifty capitals will keep meeting the same few
  architects; **name them, and the deck acquires a spine the individual cards cannot.**

- **DELAWARE HAS ALMOST NOTHING IN THE NPS LAYER AND EVERYTHING IN HABS.** The ArcGIS NRHP layer returns
  519 Delaware rows and **one** flagged NHL, with no Fort Christina, no Old Swedes, no Dickinson
  mansion and no du Pont mills — a name search for each returns nothing at all. The whole card therefore
  rests on HABS written data through the loc.gov JSON API, cited at `tile.loc.gov`, which is now the
  third round to use that route. **When a state's NHL list comes back implausibly short, the layer is
  wrong, not the state**; go to HABS.

- **`Montgomery` IS A FOURTH SHAPE OF DIVIDED SURFACE: THE CITY IS THE MAJORITY AND STILL LOSES THE BARE
  NAME.** Its four uses are the capital twice (`geo-037` and the `Alabama` term), a tavern in ARKANSAS once
  (`geo-036`'s "Montgomery's Tavern") and a PERSON once (`geo-038`'s Isaiah Thornton Montgomery). Two of
  four is a majority, and it makes no difference: a bare key would mis-link the other two, and the pass's
  rule is never to create a mis-link to gain one. **`Montgomery_(Alabama)`**, on the `Columbia_(South_Carolina)`
  precedent. The alternative — an `Isaiah_Thornton_Montgomery` term to win the surface back by
  longest-first — is two extra terms to enable one bare key, and is not worth it.

- **THE ALABAMA CARD LEFT MORE FOR ITS CAPITAL THAN IT LOOKED.** `geo-037` had spent the moving capitals
  and the provisional Confederate constitution, so the obvious material was gone; what it had NOT used is
  in the same nomination — the capitol finished on 26 October 1847, burnt out on 14 December 1849 with the
  legislature sitting, rebuilt on Button's plans by 1851, and **Jefferson Davis sworn in on the west
  portico on 18 February 1861 with the permanent constitution adopted there on 11 March**. Round 35's rule
  was to read the state card first; the refinement is that **re-reading the SOURCE is what finds the way
  round it**, since a card takes four or five claims from a document that holds twenty.

- **THE FEDERAL COURTHOUSE IS THE SOURCE THE CIVIL-RIGHTS CARDS KEEP NEEDING.** Montgomery's US Post
  Office and Courthouse is listed as the **Frank M. Johnson, Jr. Federal Building**, and its nomination
  carries what the church nomination cannot: that Johnson's 1956 decision struck down segregated seating
  on the city's buses and carried *Brown v. Board of Education* out of the schools, and that his 1961
  order "freezing" voter-registration standards went into the Voting Rights Act of 1965. **Look for the
  courthouse** when a city's civil-rights story needs its legal half.

- **`Connecticut` GOES IN BARE** — two uses, both the state — **and repaired `geo-004` on arrival**, the
  fifth round running that a new term corrected a shipped text. Three surfaces checked and clear on the
  Connecticut card, one of them a near miss worth recording: **`Hannibal` is not a glossary key**, so
  "identified with Hannibal and the Midwest" links nothing; the day Ancient Rome writes the Carthaginian,
  that sentence acquires a trap and this card will need re-checking.

- **`Salmon` IS A GLOSSARY KEY AND SALMON PORTLAND CHASE WALKED STRAIGHT INTO IT.** The surface scan on
  the New Hampshire draft returned `Salmon -> Salmon`, the fish, on the Chief Justice's given name — the
  `Pig`/"pig iron" shape with a person in it. **Case sensitivity is the wrong tool here and it is worth
  knowing why**: the eighteen entries in `GLOSSARY_CASESENSITIVE` (`Turkey`, `Guinea`, `Poland`,
  `Providence`, `Boreal`) are terms whose CAPITALISED form is the one meant, so the flag suppresses the
  lowercase everyday word. Chase's name is the capitalised form, so the flag would protect exactly the
  wrong occurrence. The fix is round 33's: a longer term. **`Salmon_P._Chase` with the alias "Salmon
  Portland Chase"**, cited to the NHL birthplace nomination and the Federal Judicial Center's
  Biographical Directory — and rendering the card confirms the fish never fires. **No bare "Chase"
  alias**, which would link the verb.

- **`Jackson` IS THE MOST DILUTED SURFACE THE PASS HAS MET: nine uses and seven of them are not the
  city.** Patrick Tracy Jackson, Jackson Creek in Oregon, Eighth and Jackson streets in Springfield,
  Alexander Jackson Davis twice, against the Mississippi capital twice. **`Jackson_(Mississippi)`**, and
  the cost is accepted openly: `geo-038`'s own "at Jackson" now links to nothing. A parenthetical key
  buys correctness for seven texts by giving up a link on two.

- **`New_Hampshire` REPAIRED `Franklin_Pierce` ON ARRIVAL** — the sixth round running that a new term
  corrected a shipped text. It is worth stating as an expectation rather than a happy accident: **the
  glossary is now dense enough that a state or capital term almost always has somewhere to land**, so the
  surface measurement at the head of a round is as much a forecast of what will be fixed as a check on
  what might break.

- **THE NEW HAMPSHIRE NHL LIST IS TWO ENTRIES LONG AND THE ANSWER WAS NOT HABS THIS TIME.** Round 35's
  rule held — the layer is wrong, not the state — but the HABS route that saved Delaware and Jefferson
  City failed here: the Amoskeag records are **measured drawings with no written data**, which extract to
  a page of font junk. What carried the card instead was an ORDINARY NRHP nomination for a private house:
  the **William Parker Straw House**, whose Historic Context section gives the Amoskeag Manufacturing
  Company entire — the world's largest textile plant, 17,000 workers, thirty mills, run from a Boston
  office through a local agent. **A nomination for a small building often carries the context of the big
  one**; read the agent's house when the mill has no file.

- **A FORMER NAME IS AN ALIAS, AND THAT IS THE WHOLE FIX FOR A COMPONENT-WORD TRAP.** Vermont's founding
  delegates came from a territory calling itself **New Connecticut**, and the surface `Connecticut` inside
  that phrase auto-linked to the modern state — a reader sent from Vermont's own founding to the wrong
  state entirely. Registering **"New Connecticut" as an alias of `Vermont`** settles it in one line:
  surfaces sort longest-first, so the two-word name claims the phrase before `Connecticut` can, and on
  `geo-042` itself the alias resolves to the card's own answer term and is therefore suppressed like any
  other. **The alias was also simply true**, which is the test — Thomas Young's letter to the convention
  recommended "Vermont" in place of "New Connecticut" — so this is not a workaround but the missing row.
- **`Settlement` IS AN ARCHAEOLOGICAL TERM AND MUST NOT BE REACHED FROM A MODERN POPULATION FIGURE.** The
  Dover term first read "its second largest **settlement** after Wilmington", which linked a 2024 Census
  figure to a term about dwelling places, pottery scatters and rank-size analysis. The word was changed
  to **city** — which the Census itself uses — and nothing else moved. **A common noun with a specialist
  glossary entry is the quietest trap there is**: the sentence is correct, the link resolves, and only
  reading the popup shows the reader has been sent somewhere else. Run the rendered popup check on a NEW
  term as well as on the cards.
- **VERMONT AND NEW HAMPSHIRE HAVE TWO NHLs EACH AND BOTH LAYER COUNTS ARE WRONG.** Round 37's rule now
  has a third instance, and Vermont's way round it was neither HABS's written data nor the mill agent's
  house but the **NRHP search on a name** — `RESNAME LIKE '%Constitution%'` found the Old Constitution
  House at Windsor, whose nomination carries the state's whole founding: 72 delegates, Thomas Young's
  letter, Elijah West's tavern, the first constitution in the country to prohibit slavery and establish
  universal manhood suffrage, and the republic that ran from 1778 to 1791. **When the NHL layer is short,
  guess the building's name and query for it** — the property you want usually has an obvious one.
- **A `tile.loc.gov` DATA PDF CAN BE A 200 AND STILL BE UNREADABLE.** The Justin Smith Morrill Homestead
  (HALS VT-6) downloads at 12.5 MB and extracts to font junk — a subset font with no ToUnicode map, the
  same failure round 37 met on the Amoskeag drawings. Its whole significance statement is in the loc.gov
  **JSON API** record (`?fo=json`), which answers where `www.loc.gov/item/` is 403 here; but the honest
  citation is the document actually read, so **Morrill was dropped from the card rather than cited from a
  catalogue record standing in for a PDF nobody could open**. Two clean documents plus the Constitution
  House were enough.

- **THE PRE-DRAFT SURFACE CHECK WAS CASE-SENSITIVE, AND THAT IS WHY IT KEEPS MISSING THE ONE TRAP THAT
  MATTERS.** The scratch script that greps a draft against every glossary surface built its regexes without
  the `i` flag, so a key stored capitalised — `Settlement`, `Cemetery`, `Gold`, `Silver`, `Copper`, `Tin`
  — could never match the lowercase common noun in the prose. **The real linker is case-insensitive
  except for the eighteen `GLOSSARY_CASESENSITIVE` entries**, so the check was silently blind to exactly
  the class of surface that produces a wrong link: an everyday word with a specialist entry behind it.
  It let `Settlement` through in round 38 and would have let `Settlement` AND `Cemetery` through here.
  Fixed, and the rendered check caught both anyway — which is the argument for running BOTH: the grep
  plans the draft, the browser is the authority.
- **`Cemetery` IS `Settlement`'S TWIN, AND THE PAIR IS NOW A NAMED CLASS.** Both are archaeological
  entries — one about dwelling places against camps and cemeteries, one about graves grouped rather than
  scattered and the Early Iron Age burials under the Athenian Agora — and both were being reached from an
  ordinary modern sentence: an Italian *settlement* at Meaderville in the 1890s, the only *cemetery* in
  Hartford until 1803. Both were fixed by changing the WORD rather than the link (neighbourhoods at
  Meaderville; "took every burial in Hartford"). **Before using a plain English noun for a place, a
  burial ground, a period or a material, ask whether Folio has a specialist entry on it.**
- **A DEMONYM LINKING TO ITS COUNTRY IS FINE; FOUR OF THEM IN ONE SENTENCE IS NOT.** Butte's immigrant
  list drew `Irish`→`Ireland`, `Italian`→`Italy`, `Finnish`→`Finland` and `Croatian`→`Croatia` while
  Chinese, Jewish and Slav linked to nothing, so a list of seven wore four links and three bare words
  for no reason a reader could see. Rewriting it round the DISTRICTS the source actually names —
  Centerville and Walkerville, Meaderville, East Broadway — cut it to two and is better history besides.
  The links themselves were never wrong: this is a legibility rule, unlike the `Settlement` class above.
- **THE METALS ARE THE OPPOSITE CASE AND SHOULD BE LEFT ALONE.** `gold`, `silver` and `copper` on a Butte
  card link to Folio's own metallurgy entries, which is exactly where a reader following the Anaconda
  story should be able to go; and `tin`, on "the failing tin workings at home", lands on a term about
  Cornish tin and Bronze Age sourcing, which is the same metal and the same county. **A common-noun link
  is not a fault by itself** — the test is whether the entry behind it is about the thing the sentence
  means.
- **MONTANA'S NHL LAYER RETURNS ZERO, WHICH IS THE SHORT-LIST RULE AT ITS LIMIT.** ⚠ **The zero was a bug in the QUERY, not a gap in the data — the flag's value is `X`, not `Y`; see "THE NHL FLAG IS `X`" below.** Rounds 35–38 met
  layers giving one or two; here `Is_NHL='Y'` gives none at all for a state holding Little Bighorn and
  the Butte district. The way in was **the LoC HABS/HAER collection's own JSON search**
  (`/collections/historic-american-buildings-landscapes-and-engineering-records/?q=…&fo=json`), which
  returns the survey number as the last path segment of each result's `id` — so `mt0040`, `mt0041`,
  `mt0075` resolve straight to `tile.loc.gov` data PDFs. **Search the collection, not the layer**, when a
  state's landmark list comes back empty. Two of the four Virginia City documents fetched this way are
  photographs only and extract to a single line; the survey number tells you nothing about that in
  advance, so fetch and look.

- **📌 THE LOWERCASE COMMON NOUN WITH A PREHISTORIC ENTRY BEHIND IT IS THIS PASS'S STANDING HAZARD, AND
  IT HAS NOW FIRED FIVE TIMES IN THREE ROUNDS** — `Settlement` twice, `Cemetery` twice and `Horse` once.
  Each is an ordinary English word in a modern sentence (an Italian settlement at Meaderville in the
  1890s; the only cemetery in Hartford until 1803; the old North Cemetery where a president was buried;
  horse-drawn wagons in 1813) whose Folio entry is about archaeological survey, Early Iron Age graves
  under the Athenian Agora, or the Botai lineage of 3500 BCE. **The fix is always the WORD, never the
  link** — neighbourhoods, "took every burial", "his wagon-building trade" — because the entry is right
  about its own subject and it is the sentence that has wandered into it.
  **There are about eighty such keys and they can be listed rather than remembered:**

      node -e "const {loadGlossary}=require('./.claude/gloss-io.js');const g=loadGlossary();
        console.log(Object.keys(g.GLOSSARY).filter(k=>/^[A-Z][a-z]+$/.test(k)).join(' '))"

  Read that list once before drafting a batch and the traps become obvious: Settlement, Sanctuary,
  Inscription, Cemetery, Tomb, Temple, Clay, Copper, Silver, Gold, Ivory, Marble, Tin, Amber, Horse,
  Cattle, Sheep, Goat, Pig, Plough, Irrigation, Pottery, Metallurgy, Coinage, Citadel, Fresco, Stucco,
  Diadem, Scabbard, Stele, Salmon, Tar, Ochre, Bronze, Iron, Flint, Musket, Mammoth, Elephant, Emery,
  Pumice, Papyrus, Chronology, Geology, Stratum, Prehistory, Archaeology, Domestication, Anatomy, Genus,
  Genome, Monograph. **The metals are the exception that proves the rule** — `gold` on a gold-leafed
  capitol dome, `tin` on the failing Cornish tin workings, `copper` on Butte — because those entries ARE
  about the substance the sentence means.
- **`Concord` SHIPS AS A BARE KEY, AND THE REASONING IS THE LONGEST-FIRST MECHANIC RATHER THAN THE
  MEASUREMENT.** The corpus is 2 of 2 for the New Hampshire capital, but Concord, Massachusetts is
  coming: `us-231 Battles of Lexington and Concord` is in `docs/us-card-plan.md`. It is safe anyway,
  because that card's ANSWER TERM is the whole phrase, so its glossary key will be keyed on the phrase
  and will claim the text before the bare surface can — the same rule that fixed "New Connecticut" in
  round 38. **What is NOT covered is the town mentioned on its own** (Thoreau, Emerson, the militia), so
  Concord, Massachusetts joins Dover in England and Hartford's namesake on the recorded-collision list,
  to be settled when a sibling term actually arrives rather than guessed at now.
- **WYOMING'S NHL LAYER RETURNS ZERO TOO, THE SECOND STATE RUNNING** ⚠ **The zero was a bug in the QUERY, not a gap in the data — the flag's value is `X`, not `Y`; see "THE NHL FLAG IS `X`" below.** — and the way in this time was not
  the HABS collection but a single ORDINARY nomination. The **Wyoming State Capitol** form carries the
  entire suffrage story in its statement of significance: the 1869 bill passing the territorial council
  6–2 and the lower house 6–4, Esther Morris having heard Susan B. Anthony lecture in Illinois, the 1870
  elections answering the warnings, the 1889 fight in Washington, Joseph M. Carey's telegram, the
  legislature's reply — *"We will remain out of the Union a hundred years rather than come in without
  the women"* — the House vote of 139 to 127, and the 480 initiatives in 33 states that followed between
  1870 and 1910. **Round 37's rule at full strength: a nomination for one building often carries the
  context of a whole state**, and a capitol's form is where a state argues for its own significance.
- **THE LoC STATE GUIDE IS A SUMMARY AND THE NOMINATION IS THE RECORD.** The Wyoming guide says the state
  was "the first state to grant voting rights to women", which flattens the distinction the capitol
  nomination draws carefully: the first VICTORY was in the TERRITORY in 1869, and Wyoming became the
  first STATE to enfranchise women on admission in 1890. Both were used, each for the claim it actually
  makes. The guide also prints "Ester" for Esther and "the first women designated a justice of the
  peace"; **take dates and the statehood line from the guide, and take the argument from the nomination.**

- **📌 THE `Settlement` TRAP WAS ALREADY IN THE SHIPPED CORPUS, TWELVE TIMES OVER, AND IS NOW SWEPT.**
  Round 40 named the class; running the RENDERED check over the ten geography cards that use the word
  found it was not a drafting hazard at all but a defect already live — nine cards and six glossary terms
  sending readers from Roger Williams, Sutter's Fort, Stephen F. Austin, the Erie Canal, the Oklahoma land
  run, Hull-House and Jamestown to a term about archaeological survey. All twelve are fixed by changing
  the WORD (settlers, town, foothold, outpost, of its kind), every card still 5+5 and inside 270–330, and
  the rendered check over all ten now returns nothing. **When a new trap is identified, grep the SHIPPED
  corpus for it before writing the plan entry** — the class had been accumulating for forty rounds.
- **AND THE TEST FOR WHICH COMMON-NOUN LINKS ARE ACTUALLY WRONG IS THE TERM'S FIRST CLAUSE.** The sweep
  turned up far more candidates than faults, so the line is: **is the entry's opening clause a general
  definition, or is it already inside the specialism?** `Settlement` fails — it defines the word by
  contrasting it with cemeteries and camps *as an archaeological classification* — and so does `Cemetery`,
  whose sentence runs on to archaeologists mapping a landscape. `Temple` ("a building raised for a god"),
  `Tomb` ("a burial place built or cut as a chamber"), `Irrigation` ("the supply of water to crops by
  human effort"), `Cattle` and `Pig` all open on definitions that fit an ordinary modern sentence, and
  were LEFT: Temple Square, Lincoln's tomb, Hohokam canals, Texan cattle and pig iron all link honestly.
  **A proper noun is left alone too** (Greenhill Cemetery, Harrison's Horse Race, the Bay of Pigs), since
  a reader clicking a name and getting the definition of the common noun has lost nothing.
- **`Colorado` IS THE MOST DILUTED SURFACE THE PASS HAS MEASURED — 1 OF 6 — SO THE KEY IS
  `Colorado_(state)`.** Of six uses, one is the state, two are the Texas Colorado River, two the western
  Colorado River, and one is the Colorado Museum of Natural History. That is worse than `Jackson` (7 of 9
  wrong) as a proportion, and the answer is the settled one: a parenthetical key claiming nothing bare,
  beside `Delaware_(state)`, `Mississippi_(state)` and `Nevada_(state)`.
- **AND NO `Colorado_River` TERM WAS ADDED, DELIBERATELY — TWO RIVERS SHARE THE NAME AND AUTO-LINKING
  CANNOT TELL THEM APART.** Round 34 shipped `Mississippi_River` beside `Mississippi_(state)` and it
  repaired three texts for free. That move is unavailable here: the surface "Colorado River" is the great
  western river on `geo-015` and `Nevada_(state)`, and a *different* river on `geo-502` and `Austin`, and
  longest-first cannot separate two identical surfaces. **Adding the term would have created two wrong
  links to fix none**, since the western mentions say "the Colorado" rather than "the Colorado River"
  anyway. Where two rivers share a name, neither can be auto-linked.
- **`Montpelier` SHIPS BARE**, 2 of 2 for the Vermont capital; Montpellier in France is spelled with two
  Ls and cannot collide, and James Madison's Montpelier in Virginia joins the recorded-collision list with
  Dover in England and Concord in Massachusetts.
- **THE VERMONT STATE HOUSE WAS HELD BACK IN ROUND 38 AND PAID FOR IT HERE.** Its NHL nomination carries
  the whole building — the 1831 resolution, the committee sent to look at three neighbouring capitols,
  Ammi B. Young at 32 taking the exterior from the Theseion at Athens, the 1857 fire, Silloway's added
  bays and taller dome, the Barre granite from the Wheaton Quarry — which is four of Montpelier's ten
  sentences. **When a state card and its capital card both want a building, the capital gets it**; the
  state card has a whole state to cover and the capital card has one town.
- **COLORADO'S NHL LAYER RETURNS ZERO, THE THIRD STATE RUNNING** ⚠ **The zero was a bug in the QUERY, not a gap in the data — the flag's value is `X`, not `Y`; see "THE NHL FLAG IS `X`" below.** (after Montana and Wyoming), so the
  HABS/HAER JSON search carried it again. Two notes from that: **Cliff Palace is photographs only**
  (`co0300` extracts to a single line) while **Balcony House (`co0380`) has the written data** — the
  survey number tells you nothing about which, so fetch and look — and the El Paso Lode HAER for Cripple
  Creek gives Womack's fifteen years of prospecting, his 15-metre shaft, the 1890 strike and the 1893
  rush in one paragraph.

- **📌 THE BARE-KEY RULE, WHICH SIX ROUNDS HAVE BEEN APPLYING WITHOUT WRITING DOWN: A BARE KEY SHIPS ONLY
  WHEN EVERY EXISTING USE IS THE RIGHT SENSE.** Not a majority — every one. Dover, Hartford, Montpelier,
  Concord, Vermont and Montana all measured 100% correct and went bare; Colorado (1 of 6), Jackson (2 of
  9), Delaware (1 of 5), Mississippi (0 of 14), Montgomery (2 of 4) and now Kansas and Helena all had at
  least one wrong use and went parenthetical. The reason the threshold is zero rather than a majority is
  that **the wrong uses cannot be fixed by longest-first unless a longer surface exists to claim them**,
  and usually none does.
- **`Kansas` IS THE FIRST SURFACE WHOSE WRONG USES ALL CONTAIN THE RIGHT WORD.** Four of its six uses are
  "Kansas City", which is in MISSOURI, so a bare `Kansas` key would have underlined half the name of a
  city in another state and sent the reader to the wrong one. That is worse than `Colorado`'s rivers,
  because the link looks plausible. `Kansas_(state)`, and the note worth carrying: **a future
  `Kansas_City` term would let the bare key be reinstated**, longest-first claiming the compound — the
  `Pig_iron` mechanic, which already protects "pig iron" from `Pig`.
- **`Helena` IS 2 OF 3 AND STILL PARENTHETICAL**, because the third is "St Helena Island" on `geo-028`,
  named for the saint, and nothing longer exists to claim it. The parenthetical costs nothing: there is
  no Helena key today either way, so the two correct mentions lose a link they never had.
- **`split-abstract.js` COULD NOT SEE "No." BEFORE A NUMBER, AND NOW CAN.** "Helena City Lodge No. 10"
  split the card's first block into six. The new rule is the abbreviated-genus rule's shape — the test is
  what FOLLOWS: a sentence boundary in this corpus is never followed by a bare numeral, and no sentence
  ends on the word "No". **Proved inert over all 2,837 shipped texts before it was kept**, which is the
  standing requirement for a change to a shared extractor and is worth the two minutes every time.
- **TWO MORE `Geometric`-CLASS TRAPS, BOTH CAUGHT IN DRAFT.** The Helena card first read "It is Geometric
  Gothic … a near replica of the Votive Church in Vienna", which linked `Geometric` to the GREEK
  **Geometric period** and `Votive` to **votive dedication**. Both were fixed by writing "Gothic Revival"
  and "the Votivkirche" — the building's own name. **The Greek collection has salted the glossary with
  ordinary-looking adjectives**, so the risk list is not only nouns.
- **`Temple` ON "MASONIC TEMPLE" IS WHERE ROUND 41'S TEST SITS LEAST COMFORTABLY, AND IT IS LEFT.** The
  test says a term whose opening clause is a general definition may be reached from an ordinary sentence,
  and `Temple` opens "a building raised for a god" — which a Masonic temple is not. It is left because it
  is a proper name and because changing the ruling round to round is worse than a marginal link; recorded
  here so the next reader knows it was decided rather than missed.
- **KANSAS'S NHL LAYER RETURNS ZERO, THE FOURTH STATE RUNNING** ⚠ **The zero was a bug in the QUERY, not a gap in the data — the flag's value is `X`, not `Y`; see "THE NHL FLAG IS `X`" below.**, and this time the way in was neither the
  HABS collection nor a capitol: a **`RESNAME LIKE`** query on names guessed from the state's history
  (`%Constitution Hall%`, `%Monroe%`) found Lecompton Constitution Hall and the Sumner/Monroe schools —
  Bleeding Kansas and Brown v. Board, a century apart on the same question, from two NHL nominations.
  **When a state's landmark list is empty, name the events first and query for their buildings.**

- **📌 WHEN A SHORT ALIAS IS RIGHT NEARLY EVERYWHERE AND WRONG IN ONE COMPOUND, ADD THE COMPOUND AS A KEY
  — NEVER STRIP THE ALIAS.** `Pacific_Ocean` carries the bare alias "Pacific", and the Cheyenne card put
  "Union Pacific" in front of it twice, sending a reader from a railway company to an ocean. The reflex is
  to drop the alias; the measurement forbids it — **54 uses of "Pacific" in the corpus and about 52 are
  the ocean** ("the Pacific coast", "into the Pacific", "the South Pacific"), so removing it would break
  forty correct links to fix two wrong ones. The fix is the `Pig_iron` mechanic: a **`Union_Pacific_Railroad`
  term whose alias is "Union Pacific"**, which longest-first claims ahead of the bare word. **Measure the
  alias before touching it** — a short alias that looks reckless is usually carrying most of its own weight.
- **THAT MADE THIS THE FIRST ROUND TO SHIP A THIRD TERM.** The pairing rule asks for a term per answer
  term; this pair needed one more, because the fix for an auto-link fault was a glossary entry rather than
  a rewording. It is cited at the bar from the Cheyenne depot's own NHL nomination — incorporation at
  Boston in July 1862, Oliver Ames and his brother Oakes at Credit Mobilier, the land grants and the
  $16,000-to-$48,000-a-mile loans, nearly $27 million drawn by 1869, and Dodge routing the line across
  southern Wyoming for coal rather than down to Denver. **A source fetched for a card usually has a second
  term in it.**
- **`Nebraska` IS THE PURE CASE OF THE ZERO-TOLERANCE RULE: NOT ONE OF ITS THREE USES IS THE STATE.** All
  three are inside "Kansas-Nebraska Act", on `geo-046`, `Kansas_(state)` and `Franklin_Pierce`. So
  `Nebraska_(state)`, and the same note as Kansas: **a future `Kansas–Nebraska_Act` term would free BOTH
  bare keys at once**, which is the strongest argument yet for writing it when the United States
  collection reaches the 1850s.
- **`Cheyenne` IS 2 OF 3 AND THE THIRD IS A PEOPLE, WHICH IS THE MORE IMPORTANT TERM.** `geo-010` speaks of
  "the Cheyenne village of the peace chief Black Kettle", so a bare key would have sent a reader from the
  Washita to a Wyoming railway town. `Cheyenne_(Wyoming)`, and **a `Cheyenne` term for the people is owed**
  — when it is written it takes the bare name and this key needs no change, the parenthetical having
  claimed nothing.
- **READ A DIRECTION BACK AGAINST THE SOURCE'S POINT OF VIEW.** The capitol nomination says the capitol
  "is complementary to the Union Pacific Depot located ten blocks south on Capitol Avenue" — that is the
  capitol's view of the depot, and the draft repeated it from the depot's, putting the capitol ten blocks
  south of a building it stands north of. Caught by reading the sentence back against the source rather
  than by any checker. **A bearing, like a date, belongs to whoever is standing where the source stands.**
- **NEBRASKA'S NHL LAYER RETURNS ZERO, THE FIFTH STATE RUNNING** ⚠ **The zero was a bug in the QUERY, not a gap in the data — the flag's value is `X`, not `Y`; see "THE NHL FLAG IS `X`" below.**, and the HABS collection has nothing for
  Lincoln either. What carried the card was the ordinary NRHP list for the capital city: the **Kennard
  House**, whose nomination holds the whole founding — the legislature at Omaha naming three of its own
  officers, the commission picking the site of Lincoln on 29 July 1867, the doubt through the 1870s
  depression, and Winchell's three houses of 1869 built to end it — plus **Fairview** for Bryan and the
  **Willa Cather House** for Cather. **List the capital city and read what its houses were for.**

- **📌 THE LINKER MUST NEVER SKIP `<i>`, AND THE MEASUREMENT SETTLES IT.** The Denver draft raised the
  question again — a book title in italics carrying a linkable word — so it was measured rather than
  argued: **362 auto-link matches across the corpus fall inside an italic span, and the great majority are
  wanted**, because `<i>` marks a foreign term as often as it marks a title and a foreign term is exactly
  what a glossary is for. Teaching `autoLinkGlossary` to reject `I` the way it rejects `A` and `.ttip`
  would take four hundred good links away to remove a handful of awkward ones.
- **THAT MEASUREMENT EXPOSED TWO PRE-EXISTING FAULTS IN THE GREECE DECK, RECORDED HERE AND NOT FIXED.**
  `<i>hippos</i>` links to **Hippopotamus** on `gr-075` and `gr-096`, and `<i>laos</i>` to **Laos** on
  `gr-079` — a Greek word for horse sending a reader to an African animal, and one for the people to a
  country in south-east Asia. Both are the `Settlement` class one language over: a short common word whose
  key was written for another collection. They are outside this collection and are left for whoever next
  works on Greece; the fix in each case is a narrower key or a `caseSensitive` flag, not a rewording.
- **`Silver` AND `Coinage` WERE PUT TO THE FIRST-CLAUSE TEST AND BOTH PASS.** `Silver` links from "By the
  Shores of Silver Lake" — inside a book title, and inside a proper name within it — and `Coinage` from
  "the coinage of gold", which is the mint's own statutory phrase. Neither term's opening clause sits in a
  specialism, so both are the sense a reader would expect, and **the only mechanism for suppressing a link
  is `ADMIN_EDITS.glossOff`, an overlay field a card cannot carry** — so the choice is the link or a
  rewording, and neither is worth rewording for.
- **SOUTH DAKOTA'S NHL LAYER RETURNS ZERO, THE SIXTH STATE RUNNING** ⚠ **The zero was a bug in the QUERY, not a gap in the data — the flag's value is `X`, not `Y`; see "THE NHL FLAG IS `X`" below.**, which retires the layer as a first
  stop for the plains states altogether: Montana, Wyoming, Colorado, Kansas, Nebraska and now South Dakota
  have all come back empty on `Is_NHL='Y'`. Both of this card's landmark nominations were reached by
  `RESNAME LIKE` on names taken from the state's own history — `%Wounded Knee%` and `%Ingalls%`.
- **A NOMINATION MAY HEDGE ITS OWN SUBJECT'S NAME, AND THAT HEDGE IS THE CITABLE FACT.** The Wounded Knee
  nomination says the event "is called the Wounded Knee Massacre or the Battle of Wounded Knee, depending
  on the historical perspective of the writer" — so the card and the term say exactly that, attributed,
  rather than choosing one name and asserting it. **Where the source names the disagreement, cite the
  disagreement**; it is shorter than a hedge composed by hand and it is somebody's published judgement
  rather than ours.

- **📌 THE NHL FLAG IS `X`, NOT `Y`, AND THE FIELD IS `NRIS_Refnum`, NOT `Ref_Num` — SIX RECORDED FINDINGS
  WERE MY OWN QUERY BUG.** Rounds 39–44 each wrote down that a plains state's landmark layer "returns
  zero" — Montana, Wyoming, Colorado, Kansas, Nebraska, South Dakota — and built a workaround on it. It
  returns zero because `Is_NHL='Y'` matches nothing anywhere: the column holds `X`. Asked properly, North
  Dakota has 1, South Dakota 2, Nebraska 7 and Kansas 9. The second half of the bug is worse, because it
  is silent in a different way: the reference-number field is **`NRIS_Refnum`**, and naming a field that
  does not exist in `outFields` makes the service answer **`{"error":{"code":400}}`** or an empty feature
  list — **which reads exactly like a state with no landmarks.** The six entries above are marked; their
  routes all still work and are worth keeping, but none of them was necessary.
- **THE LESSON IS ABOUT THE SHAPE OF THE EVIDENCE, NOT ABOUT ARCGIS.** A query that returns zero rows is
  not a measurement — it is the *absence* of one, and it looks identical whether the data is missing or
  the question is malformed. Six states in a row coming back empty should have been the signal, and it
  was read instead as a pattern about the plains. **Before recording an emptiness as a finding, prove the
  query can return something**: ask for a count with no filter, or ask the layer for its own field list
  (`?f=json` on the layer root gives every field name and would have shown both faults in one call).
- **KANSAS'S OWN 1971 NOMINATION IS CONTRADICTED BY TOPEKA'S 2008 ONE, AND `geo-046` IS CORRECTED.** The
  Lecompton NHL form calls that hall "the only remaining building of the several where opposing drafts of
  the first Kansas Constitution were approved", and the card repeated it faithfully. Constitution
  Hall–Topeka is standing too — listed in its own right, and the source for this round's capital card.
  The sentence now says what the Lecompton form's own description supports and claims nothing about what
  else survives. **A nomination is a snapshot of what its writer knew in its year**, and a 1971 negative
  about the rest of the world is the kind of claim a later document quietly overturns; the check is to
  read a superlative back against the sources of the neighbouring cards, which is what writing the pair
  forced.
- **A LARGE PNG ON COMMONS SERVES ONLY THE THUMBNAIL WIDTHS ALREADY CACHED.** For the Big Hidatsa survey
  plan, 960px and 1280px return the image and **480, 512, 640, 720, 900 and 1024 all return a 400 with an
  HTML error document** — which, saved to a `.png` file, is a broken picture that looks like a working
  URL. JPEGs re-render at any width; PNGs above a size threshold do not. **Fetch the exact `src` you are
  about to ship and check it is really an image**, since the site's dead-media handling shows a reader
  nothing at all.
- **TOPEKA IS A CAPITAL WHOSE CARD COULD NOT USE ITS OWN BEST-KNOWN STORY.** Brown v. Board of Education
  of Topeka is on `geo-046` already, where it fills the whole second block, so the capital card had to be
  built from what was left — and what was left was better than expected: the town settled in December
  1854, Constitution Hall, the Topeka Constitution passed 1,731 to 46, Colonel Sumner's dragoons on 4 July
  1856, and Charles Curtis. **When a city's famous event belongs to the state card, read the city's own
  register list rather than looking for a second angle on the same event.**

- **📌 `Lincoln` IS THE HARDEST BARE-KEY CASE THE PASS HAS MET, AND IT IS 14 AGAINST 2.** The corpus uses
  the word sixteen times: fourteen are **Abraham Lincoln** or named for him — he signed the West Virginia
  proclamation and the Montana act, sat in the Illinois legislature, stands in bronze outside the Idaho
  capitol, is the Land of Lincoln, was mourned at Concord — and exactly two are the Nebraska capital, on
  `geo-047` and its glossary term. So `Lincoln_(Nebraska)`, and the rendered check confirms the word now
  links nowhere on either card, which is right: **a parenthetical key claims nothing bare**, and
  `Abraham_Lincoln` is reached by the full name. **Nothing was wrong before this round** — no alias
  claimed the bare word — but a bare key here would have been the worst single link the pass could ship.
- **THE COUNT IS THE ARGUMENT, NOT THE INTUITION.** "Lincoln is obviously the president" is a hunch;
  fourteen against two is a measurement, and it is the same instrument that said `Denver`, `Concord` and
  `Montpelier` were safe bare. **Run the measure even when the answer feels certain** — it is the only
  thing that tells the certain cases from the ones that merely feel certain.
- **A PROPERTY MISSING FROM THE POINT LAYER MAY STILL HAVE ITS NOMINATION ON `npgallery`.** The **Nebraska
  State Capitol** is in no row of the layer — state-owned properties are patchily represented — and its
  form is at `NHLS/70000372_text` all the same. The layer is an index of locations, not of documents, so
  **a subject the layer does not list is not a subject without a nomination**; the refnum is the key, and
  the two empty-document sizes (1,623 and 22,151 bytes) tell a real form from a miss in one fetch.
- **A GOVERNMENT BODY'S OWN HISTORY PAGE IS A SOURCE WHERE NO NOMINATION CARRIES THE FACT.** No reachable
  nomination mentions Nebraska's single-chamber legislature — not the capitol's, and not the **George
  Norris** NHL form, which is entirely about his federal career and never names the thing he is most
  remembered for at home. `nebraskalegislature.gov`'s own history page carries the whole of it: the 1934
  vote of 286,086 to 193,152, the nonpartisan ballot, the fall from 133 members to 43 and from 61
  committees to 18 in 1937, and the two sessions costed against each other. **When the landmark record is
  about a building and the fact is about an institution, ask the institution.**
- **A LINK CAN BE RIGHT IN SENSE AND PAROCHIAL IN BODY, WHICH IS A THIRD CATEGORY.** `inscriptions` on the
  Nebraska capitol resolves to `Inscription`, whose opening clause — "a text cut into a durable surface,
  stone above all" — is exactly the sense meant, so it passes round 41's first-clause test and is left.
  But its second and third sentences are entirely Greek: proxeny decrees, manumission records, the 8th
  century BCE. This is N8's `Smilodon` shape one collection over — a term that is the only one for its
  subject and has been made to carry the whole of it — and **the fix is a broadened `Inscription`, with
  its own sources, not a rewording of a Nebraska card.** Recorded as owed.
- **AMANA IS SIX VILLAGES FOUNDED AND A SEVENTH BOUGHT, AND THE DRAFT SAID SEVEN FOUNDED.** The nomination
  is precise — Amana in 1855, then Middle, High, West, South and East Amana over seven years, and the town
  of Homestead **purchased** to reach a railway — and the round number in the head is what a draft reaches
  for. **Count the list in the source before writing its total.**

- **📌 THE COLLECTION IS COMPLETE: fifty states and fifty capitals, a hundred map cards.** `geo-548`
  Pierre, `geo-549` Bismarck and `geo-550` Des Moines were written in one round because nothing was left
  to pace; the running order in this file is now a record rather than a queue. Every card is at the
  five-source bar, every answer term has a glossary entry at its own bar, and every one of the hundred
  carries an illustration or a stated reason for having none.
- **`Pierre` AND `Bismarck` ARE BOTH PARENTHETICAL, AND NEITHER IS ABOUT THE OBVIOUS COLLISION.** The
  corpus uses "Pierre" five times and **three are French forenames** — Pierre Dugua on `geo-009` and in
  the `Maine` term, Pierre Charles L'Enfant on `geo-018` — so a bare key would send a reader from a
  Frenchman to a town in South Dakota. "Bismarck" is four uses and **two are the Bismarck Archipelago**,
  in `wh-157` and `Lapita_culture`, half a world away. Neither collision is the one a first guess names
  (Otto von Bismarck is not in the glossary at all); **the measure finds the collisions that are actually
  there, which are rarely the famous ones.** `Des_Moines` is bare: two uses, both the city.
- **THE `Union Pacific` FAULT RECURRED WITH A DIFFERENT RAILWAY, AND THE RULE FIXED IT UNCHANGED.**
  "Northern Pacific Railway" put `Pacific_Ocean`'s bare alias in front of a reader twice on the Bismarck
  card. Round 45's rule says add the compound and never strip the alias — the alias is right in "no
  passage to the Pacific" on the Pierre card in the same round — so a **`Northern_Pacific_Railway` term
  with the alias "Northern Pacific"** was written, cited from the depot and Camp Hancock nominations, and
  the rendered check now shows the whole phrase claimed. **A rule that fixes its second instance without
  amendment is a rule worth keeping**; expect a third railway.
- **`Fort Abraham Lincoln` LINKS TO `Abraham_Lincoln` AND THAT IS LEFT, WHICH IS THE PRINCIPLED HALF OF
  THE SAME CASE.** It looks identical to the Pacific fault — a short surface matching inside a longer
  proper name — and it is the opposite: "Pacific" in "Union Pacific" does not mean the ocean, where
  "Abraham Lincoln" in "Fort Abraham Lincoln" means exactly the man the fort is named for. **Ask whether
  the compound's short surface still refers to what the term describes**; if it does, the link is a fact
  about the compound rather than an error.
- **A CAPITAL'S OWN BEST STORY IS OFTEN ALREADY SPENT ON ITS STATE CARD, AND THAT IS WHAT MAKES THE
  CAPITALS INTERESTING.** Pierre could not use Wounded Knee or the Ingalls family, Bismarck could not use
  Knife River or the Nonpartisan League mill, and Des Moines could not use the Old Capitol or Amana — so
  the three went instead to the La Vérendrye plate of 1743, the Bismarck Tribune telegraphing the Little
  Bighorn to the New York Herald on 5 July 1876, and Henry Wallace on Roosevelt's Country Life
  Commission. **Read the state card first and treat what it spent as unavailable**; the second-best
  subject for a city is usually the one nobody else was going to write about.
- **THE SMALLEST-CAPITAL CLAIM IS ARITHMETIC OVER A CITED TABLE, AND IT WAS CHECKED FOR HOLES.** Pierre is
  the second smallest state capital after Montpelier, which `geo-542` already calls the smallest — but the
  name-matching pass over the Census place file resolved only 46 of 50 capitals, missing Juneau, Honolulu,
  Boise and Nashville, each of which is filed under a different place type. All four are far larger than
  13,788, so the claim holds. **When a ranking comes from matching names against a table, count the
  matches and check what fell out before asserting the rank.**
- **A COMMONS THUMBNAIL CAN RETURN 429, WHICH IS NOT A DEAD IMAGE.** Three of this round's downloads came
  back `429 Too Many Requests` with a 2 KB body — indistinguishable, if saved blindly, from the 400-with-
  HTML that round 45 recorded for oversized PNG thumbnails. Both write a file; neither writes an image.
  **Check the file type after every fetch, and retry a 429 with backoff** rather than concluding the URL
  is wrong.

- **📌 A CLEAN-UP PASS OVER THE FINISHED COLLECTION (Aug 2026, on request) — and the fact box had drifted
  in five separate ways.** Fifty capital cards had **twenty-four distinct spellings** of one figure:
  `second largest`, `2nd largest`, `5th largest city`, `Largest city`, `fifth`, `eleventh`. The rule now is
  one line: **`largest` for rank one, `Nth largest` in numerals for the rest**, because `1st largest` is not
  English and everything else is. Four more drifts went with it — three capitals had put `Founded by` or
  `Named for` where the other forty-six have `Largest city` (all three facts survive in the prose, so the box
  lost nothing); `Montpelier` labelled the row `Rank` and filled it with a fact about capitals rather than
  about Vermont; twenty capitals carried the same five tags in a different order; and the first four state
  cards written gave their populations as `39.4 million` where the other forty-six give the Census count.
- **THE FORMAT AUDIT FOUND A FACTUAL ERROR, WHICH IS THE ARGUMENT FOR DOING THEM.** Checking every stated
  rank against the Census place file to normalise its spelling showed that **`Helena` is Montana's SIXTH
  city and the card said fifth** — in the fact box, in the abstract and in the glossary term. The missed
  place is **Butte-Silver Bow**, a consolidated city-county, which is exactly the row a hand count skips.
  `Providence`'s population was `195,000` against a Census 194,706, the only rounded figure among fifty.
  **Re-derive a ranking from the table rather than counting the names you can remember.**
- **DIFFICULTY HAD NO RULE AT ALL, AND NOW HAS ONE ANYBODY CAN RE-DERIVE.** Sorted by population the column
  was noise: `Pierre` (13,788) was rated 1 while `Lansing` (114,336) was 3, and `Frankfort` (28,610) was 1
  while `Augusta` (19,168) was 3 — the ratings drifted session by session with nothing to anchor them. All
  fifty capitals are now banded on the figure their own card states: **1 at 400,000 and above, 2 from 75,000,
  3 below**, with `Honolulu` taking its city-and-county figure because that is the population its card gives
  for the city as a legal entity. It is a judgement, but it is a **stated** one, which is the difference
  between a scale and a habit. The states stay at 1 throughout: every one of them is a household name.
  Nothing functional turns on it — a map card is out of every minigame by construction — but the stars are
  on screen and were claiming a consistency the collection did not have.
- **FOURTEEN STATE CARDS HAD NO FLAG, AND THEY WERE THE LAST FOURTEEN WRITTEN.** `answerFlag` arrived
  part-way through the run, so `geo-001`–`geo-036` carry one and `geo-037` Alabama onwards did not: 36 flags
  against 14 blanks, which reads as a missing file rather than as a feature added late. All fourteen are in
  now, each looked at, each with its own alt text. **A field introduced mid-collection is a field the cards
  before it and after it disagree about** — check the whole run when adding one, not just the card in hand.
  **The fifty CAPITALS were then done as a pass of their own** — a city flag is not the uniform,
  always-free, always-existing object a state flag is, which is why it needed one — and **43 of the 50
  carry one now**; the seven that do not, and the three different reasons, are under "A card about a
  place with a flag of its own" above.
- **THE PLACE TO VERIFY A COUNT IS THE PROBE, NOT THE DATA.** A check written to confirm every capital's dot
  sits inside its own state reported **50 failures out of 50** — because it read `US_CAPITALS`' entries as
  `[lon, lat]` when they are `{ s, c }`. Round 46's lesson one shape over: an all-or-nothing result is a
  statement about the instrument. Asked properly, all fifty are correct.

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
  geo-517 St. Paul
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
