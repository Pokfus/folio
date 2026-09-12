# Map cards — a shape on a globe as the question

**Read this before touching the `MAP CARDS` block in app.js, `startCardGlobe` / `cardMapSpec` /
`cardMapHTML` / `mountCardMaps` / `cardFacts` / `CMAP_ZMAX` / `TINT_SEL`, `.claude/build-us-states.js`,
or before adding a map card.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary — the two fields, that such a card
is kept out of every minigame by construction, and that its question is short by design. This file
carries the rest: why the format is built in rather than a community card type, why the globe is drawn
here rather than by reusing the Atlas, the fit arithmetic and the Alaska and District of Columbia
exceptions, the shared selection gold and the three attempts it took to prove it is a tint, the capital
dot, and the honest accessibility limitation.

- **MAP CARDS — a shape on a globe as the question** (the `MAP CARDS` block in app.js, just above
  `cardFrontHTML`; `us-states.js`; the Geography collection. Aug 2026, on request). The card shows a place
  shaded on a globe the reader can turn and zoom but not click, and asks what it is; the back names it and
  adds a box of figures. Two new card fields carry it — **`map`** (`{ layer, key, zoom? }`) and **`facts`**
  (`[[label, value], …]`) — and everything else about such a card is an ordinary curated card. Six decisions
  are load-bearing.
  · **IT IS A BUILT-IN FORMAT AND NOT A COMMUNITY CARD TYPE, and that was settled before anything was
    written.** A card type is templates plus scoped CSS and cannot run code — deliberately, since a type is a
    stranger's content and `sanitizeHTML` plus the CSP exist to keep it inert. A globe needs a canvas, an
    animation frame and pointer handlers, so it cannot be one, and the reasoning is worth keeping because
    the request said "a new card type" and the honest answer was that the machinery it needs is exactly what
    a card type may not have.
  · **THE MAP IS DRAWN HERE RATHER THAN BY REUSING THE ATLAS.** `PAGES.map` is one enormous closure holding a
    timeline, an editor, twelve layers, a search index and a game mode, all keyed to a full-bleed stage —
    none of which belongs in a 260px window on a study card, and half of which (clicking a country to open
    its panel) is exactly what this must NOT do. What is shared is the ARITHMETIC: `startCardGlobe`'s
    orthographic basis is the Atlas's `setBasis`/`proj`, so a state sits where the Atlas would put it.
  · **NOTHING IS CLICKABLE, which is the point of the exercise.** No click handler, no hit test, no hover.
    The pointer turns the globe and the buttons zoom it — a reader who could tap the shaded state and be
    told its name would not be studying. Asserted in `test-map-cards.js`, since a map that has become
    clickable looks exactly like one that has not.
  · **A MAP CARD IS KEPT OUT OF EVERY DAILY MINIGAME, BY CONSTRUCTION** (`gameCardIdSet` tests
    `cardMapSpec`). The games deal a question cold with no map beside it, so "the state shaded on the map is
    ____" is unanswerable there. Unlike `difficulty` and `undatable` this needs no editorial judgement and
    so needs no field: a card whose clue is its map is by definition unanswerable without it. It also means
    **`undatable` should NOT be set on one** — Timeline is behind that filter and can never reach it.
  · **THE FIT IS READ OFF THE SHAPE**, centred on Natural Earth's published label point and zoomed so the
    longest side fills a little over half the window, with `map.zoom` as an override no shipped card needs.
    Fifty hand-tuned numbers would be fifty things to keep right. Two subtleties: the fit is taken from the
    rings NEAR the label point (`nearRings`, ±25°), or **Alaska's bbox spans the antimeridian and it opens on
    the whole planet** — while every ring is still SHADED, or the Aleutians drop out of Alaska — and
    `fitTarget` takes those rings as an ARGUMENT rather than narrowing `target.p`, since `shapes[i] ===
    target` is what stops the target being drawn twice.
  · **AND IT IS HONESTLY INACCESSIBLE TO A READER WHO CANNOT SEE IT.** A shape is the whole question, so
    there is no text alternative that does not give the answer away — an `alt` describing the outline has
    answered the card. The canvas says what it IS and what to do with it, and the answer is announced
    normally once revealed, so the card can be READ where it cannot be ANSWERED. That is the Picture round's
    position; it is stated in `docs/geography-card-plan.md` rather than papered over.
  **THE SHADED PLACE IS THE ATLAS'S OWN SELECTION GOLD, AND `TINT_SEL` IS HOISTED SO THERE IS ONE OF IT**
  (Aug 2026, on request — it was `--ochre`, which renders as a mid brown, then briefly a gold of the
  widget's own). That constant lived inside `PAGES.map`'s closure where a card could not see it, so the
  card had a second gold; it is module scope now, beside `CARD_MAP_LAYERS`, and the Atlas closes over it.
  **Two golds for one idea is exactly how they drift**, and this pair drifts INVISIBLY — a card and the
  Atlas are never on screen together, so a second copy is just a slightly different gold nobody can see is
  wrong. Hence `test-map-cards.js` asserts both halves: `app.js` defines `TINT_SEL` **exactly once** (a
  re-copied local inside the closure would shadow the module one in silence) and the canvas really paints
  it, with the expected values **read out of `app.js` rather than written into the test** — a literal
  there pins today's value instead of the rule, which is `test-tour.js`'s own lesson about a button's
  label.
  **AND THE TREATMENT IS SHARED TOO, WHICH IT WAS NOT FOR A DAY** (Aug 2026, on a second request: "the
  gold overlay doesn't really look the same as when I click a country on the atlas page"). The card
  filled SOLID with a darkened edge, on the reasoning that the Atlas tints at 24% because a country
  there sits over borders, cities, terrain and an era fill, where a card's land is a flat wash — so a
  24% tint would leave the answer barely distinguishable. That reasoning was written down here and in
  app.js and **it was wrong**, in the way this file keeps warning about: it was reasoned about rather
  than LOOKED at. The tint is most of what the Atlas's selection looks like, and at a card's zooms one
  state fills a third of the window, so it reads perfectly well. It is now the Atlas's three marks
  exactly — `fillA` tint, `shadowBlur 9` glow, `lineWidth 2.6` stroke in `TINT_SEL.line`.
  **The three numbers are written out rather than derived from `TINT_SEL.rgb`**: the outline is a
  LIGHTER amber than the fill and the glow lighter still, and deriving them from one triple is exactly
  what would quietly flatten that.
  **PROVING IT IS A TINT NEEDED THREE ATTEMPTS AND THE FIRST TWO PASSED ON A SOLID FILL.** Picking the
  fill out of a histogram by how WARM it is skips it entirely — a 24% tint is nothing like as saturated
  as the solid gold it replaced, `r - b` falling from 209 to 54 — so the check measured an antialiased
  fringe. SEARCHING the histogram for any pair of bulk colours satisfying the blend is worse: the glow
  lays the same gold over the land at every alpha there is, so some pair always satisfies it. What works
  is the pixel at the CENTRE of the window, which is inside the shaded shape by construction (`fitTarget`
  centres on the target's label point, and Natural Earth's label point is inside its polygon) — the land
  is then solved back out of the blend and required to be a real bulk colour on the canvas. Verified by
  reintroducing the solid fill and the darkened edge; each fails.
  **AND `h2r` HAD TO LEARN `rgb()`**, since `TINT_SEL` states its colour as a triple: without that branch
  `parseInt` reads it as NaN, `|| 0` makes it black, and the state fills BLACK — which reads as a
  rendering fault rather than as a colour that failed to parse.
  **THE FIGURES SIT BESIDE THE ANSWER, NOT UNDER IT** (Aug 2026, on request), as a sibling of
  `.answer-main` inside the coloured box — the slot `.answer-tr` already occupies on a Chinese card — which
  is what lets them be a two-column grid rather than a row that wraps. They cannot be inside `.answer-av`
  and be to the right of it. Below 640px `.answer` stacks, so "on the right" has nowhere to be and
  `.card-facts` goes back under the answer at full width, still two columns, which at 390px is what the
  tiles were sized for anyway.
  **`facts` IS NOT THE DATE LINE and the two are easy to confuse**: `isDateList` caps the date line at four
  rows and demands a number in every labelled row, so `Capital · Sacramento` cannot go there — the date line
  carries dates and the facts box everything else, and a card may have both (`CARD_FACTS_MAX` 8, plain text).
  **A CITY IS A DOT, AND A STATE ALONE CANNOT ASK ABOUT ONE** (`map.dot`, `window.US_CAPITALS`; Aug 2026,
  on request — "when the answer term is a city, it should appear as a dot on the globe, not just show the
  state"). A capital card shaded Rhode Island and asked for Providence, which says only which state: every
  capital card in a state's subdeck would have been answerable from the same picture as its state card.
  `map.dot` names a point in the layer's own `points` table (`CARD_MAP_LAYERS` gained `points` and
  `dotWhat`) and it is drawn as **the Atlas's own focus mark** — the same gold at full strength, the same
  5.5px radius, the same dark ring — on top of the shaded state, so the state answers "where" and the dot
  answers "which place". Its NAME is held back until the reveal, and the reveal labels the DOT where there
  is one, left-aligned beside it rather than centred over it, or the mark it names is under the word.
  **THE COORDINATES ARE GENERATED, NEVER TYPED** — `build-us-states.js` emits `US_CAPITALS` from the same
  Natural Earth download as the shapes (10m populated places), because fifty hand-entered coordinates are
  fifty chances to put a city in the wrong state and a dot a degree out still draws, inside the shaded
  state, on a card that looks entirely correct. **`cities.js` is the wrong source and was checked**: it is
  in the ~9.9 MB `atlas` bundle, and it drops sub-100k capitals, so Juneau is simply absent.
  **THE MARKER IS `FEATURECLA: "Admin-1 capital"`, NOT `ADM1CAP`** — that field does not exist in this
  vintage, so the first extraction returned zero and a rule testing only the flag ships a dotless deck in
  silence; both are read now. Each entry carries the state it is IN (`{s, c}`), which is what makes the
  card's claim machine-checkable: `add-card.js` refuses a dot the table has not got, refuses one whose `s`
  is not the card's own `key` (the dot would fall outside the shape), and warns if the answer is not the
  city. The test asserts the same three off the shipped files, plus that every capital falls inside its
  own state's bounding box.
  **`add-card.js` validates the key against the real data file** and suggests a near match on a typo, since a
  key naming nothing paints an empty window and throws; it also refuses extra phrasings on a map card and
  holds its question to 5–20 words rather than 20–34, the picture being the clue.
  **THE ZOOM CEILING IS WHAT THE POLYGONS SUPPORT** (`CMAP_ZMAX` 180), not what a place wants: at 3dp every
  vertex sits on a 0.001° grid, which is half a CSS pixel at 180× on a 340px window and a visible step past
  it. The District of Columbia is 0.15° across and wants roughly twice that, so it is the one entry of the
  layer's 51 that is capped — measured, and reported by name by the test so a second cannot appear quietly.
  Guarded by `.claude/test-map-cards.js`, which sweeps the fit over all 51 shapes, **asserts the VIEW rather
  than sampled pixels** (an earlier drag check compared two pixels and reported "the drag did nothing" on a
  globe that had turned four degrees — both samples sat on the same flat fill), and pins its own copy of the
  fit formula against app.js so it cannot go stale. Its **section 7 is the dot**, and both ends of it are
  needed because they fail differently and silently: a dot that never resolves leaves a perfectly good STATE
  card under a city's question, and a dot drawn but never named on the reveal leaves the reader looking at a
  gold speck nothing accounts for. It asserts the pure `TINT_SEL.rgb` triple appears in a small ROUND
  quantity — which on a card is the dot and nothing else, the outline being a different colour and the fill a
  blend of this one — and that `mc-failed` is NOT set, a missing capitals table being exactly what would take
  the dot away without a word. **Re-run after touching the `MAP CARDS` block, `startCardGlobe` /
  `cardMapSpec` / `cardMapHTML` / `mountCardMaps` / `cardFacts` / `CMAP_ZMAX` / `TINT_SEL` /
  `serializeCardData` / `revertCard` / `gameCardIdSet`, `.claude/build-us-states.js`, or after adding a map
  card.**

## The frame's own water, and the marks a locator carries (Sep 2026)

Three changes on one request — "modern capitals should not have their text labels shown, only their
squares", "Rivers in Italy in the Roman deck and Greek rivers in the Greek deck should have a much higher
resolution … and there should be more of them", and "Rome should always be visible in the Roman collection,
with a slightly larger red square as icon, and Athens should have the same in the Ancient Greek collection".
The rules are in CLAUDE.md's map-card bullet; the reasoning is here.

**A NAME ON THIS MAP BELONGS TO THE COLLECTION.** The capitals layer was labelled once the frame was a
region rather than a continent — a rule written so that a card about the Roman Republic, whose opening view
is the whole Mediterranean, would not name every capital from Nassau to Colombo. That guard was right about
the crowd and wrong about the principle: at any zoom close enough to pass it, Tirana, Valletta and Podgorica
were set in the same face and weight as Cumae and Veii, and a reader glancing at the map could not tell
which of the words were the collection's. The square is what that layer is for — it gives a site a seat of
government to be placed against — and the square survives untouched. `capAt`, the register the labels were
drawn from, is DELETED rather than left unread: a list nothing consumes is the next session's bug.

**A RIVER IS REPLACED, NOT SPLICED, AND NEVER CLIPPED.** The hi-res coastlines are spliced ring by ring
because a land border is shared with a neighbour and a hi-res copy over a low-res one traces the Alps twice.
None of that applies to a river: it is a polyline nothing else owns, so the honest fix is to draw the better
one INSTEAD — which is what `supersede` is for, and the only way a river can be doubled is if a name in the
region file that `rivers.js` also carries is missing from that list.

What was rejected is the obvious build: hi-res inside the region box and `rivers.js` outside it. `rivers.js`
is simplified at 0.05°, so the two chains are up to 5 km apart, and the box is well inside a card's opening
~50° view — the seam would be on screen, a river visibly stepping sideways as it left the frame. So a river
with any point in the box is taken at hi-res over its WHOLE course and its low-res entry dropped, Danube and
Rhône included. That is affordable only because a river is a thin thing: the Danube is 547 points at full
10m detail, and the two files come to ~89 KB and ~47 KB — the size of `coast/italy.js`, lazy on the same
bargain, warmed at idle and never awaited.

The extra rivers are Natural Earth's own doing. `rivers.js` is built from the world centreline set alone,
which carries 21 named rivers in the Italian box and 8 in the Greek one — the Po and the Tiber and not much
else. The **European supplement** (`ne_10m_rivers_europe`) is the file with the Arno, the Adige, the
Volturno, the Ofanto, the Simeto, the Acheloos, the Haliacmon and the Enipefs in it: together they give 53
named rivers for Italy and 30 for Greece.

**THE HOME CITY IS THE ONE MARK THAT IS NOT EARNED.** Since the studied-siblings rule, a red mark on a
locator's map means *you have met this place* — which is what makes the map fill up as a collection is
worked through, and which leaves a reader three cards into Ancient Rome looking at the Mediterranean with
one gold mark on it and nothing to place it against. The city the whole collection is about is the fixed
point worth giving them, and it is drawn studied or not.

Its coordinate is declared in `CMAP_ANCHOR` rather than looked up, and both obvious sources fail the word
ALWAYS. `cities.js` is the `atlas` bundle, warmed at idle, so a mark taken from it would be missing for the
first second of every card — which is exactly the second a reader is looking at the map for the first time.
The collection's own locators would serve Rome, where 39 cards stand `within` the city, and NOT Athens,
which no Greek card has a locator for yet. Two cities, each named beside its own numbers, is a table the
next session can check by eye.

Three suppressions go with it, each for the same reason — one place, one mark. It is dropped on the card
that IS that city or stands inside it, where the answer's gold mark is already there; the studied sibling
group of the same name is dropped, the anchor being that mark; and the grey capital square under it stands
aside, exactly as it does for a sibling. Its label is placed BEFORE the siblings take their boxes, so the
one mark that is on every map in the collection is also the one that is always named.


---

# The locator and card-globe findings, moved out of `CLAUDE.md` (2026-09-11)

**READ BEFORE CHANGING THE CARD GLOBE, A LOCATOR KIND OR A HI-RES FRAME.** The full account of the map
card's locator machinery as it stood in `CLAUDE.md` until it was moved here verbatim: the bug report
each rule came from, the measurements behind each figure, the Sep 2026 batch of seven changes, and the
generalisations that were tried and abandoned. The RULES stay in `CLAUDE.md`, in their imperative form.

· **A LONG STRAIGHT SEGMENT IS A LIE ON A SPHERE, AND `addRing` NOW WALKS ONE IN STEPS** (`CMAP_SEG`,
  0.5°; Aug 2026, on a report that the northern border of the US looked doubled). It was: `world.js`
  draws the whole US–Canada border west of the Great Lakes as ONE chord 27° of longitude long, and
  `us-states.js` draws the same parallel as five shorter ones, so in orthographic projection the two sag
  by different amounts — **0.0138 R against 0.0026 R**, which at a state card's zoom is forty pixels of
  open land between two grey lines. Neither file was wrong; a straight line between two points on a
  sphere simply is not the border. Subdividing fixes every ruler-drawn edge at once — **Colorado is six
  vertices** — and costs 5,330 extra points across all of world.js, nearly all culled per frame. **A
  segment wider than 180° is left alone**: the only one is Antarctica's base, (180,-90) to (-180,-90),
  which interpolates 720 steps the wrong way round the planet.
  **IT SHARES `addRing` WITH THE LOCATOR'S RIVERS, whose own change landed the same week** — a river is
  a POLYLINE and passes `close: false` — so the two arrive as ONE merge conflict on adjacent lines and
  must be resolved together: the walk is hoisted into `ringStep` and the `close` flag is read at the end
  of it. Taking either side whole silently loses the other, and **both losses render perfectly**: one
  doubles the northern border again, the other draws every river's mouth back to its source across a
  continent.
· **A LOCATOR SHOWS THE REST OF ITS COLLECTION, AND THE WORLD AROUND IT** (`cardCollectionRoot` /
  `locatorSiblings` / `_locSibCache`; Aug 2026, on request). Four layers under the card's own gold dot:
  the collection's other card places as smaller RED dots and its rivers. **The two halves are paid for
  differently and that is the whole design.**
  The siblings are FREE — every locator is in `data.js`, which every visitor downloads before flipping a
  card — so they ship unconditionally; the rivers are the `atlas` bundle (~600 KB), so they
  are **warmed at IDLE and never awaited**, which is `glossExtra`'s bargain, and skipped outright under
  `saveData`, which is `startMiniGlobe`'s. A card with a locator therefore paints at once with its own
  places and fills in a moment later. **THE MODERN CITIES ARE GONE ALTOGETHER** (Sep 2026, on request:
  "in all atlas windows in all history decks, modern capitals/cities should no longer be marked with
  small black squares, but should not appear at all — unless they’re a card answer term e.g. Athens,
  which should always appear"). The layer was `cities.js` filtered to national capitals and million-plus
  cities, and its whole history is one long retreat: 2,665 dots covered Europe in a grey rash, so it was
  thinned by zoom; the 2,057 division capitals went; the rest were made smaller and greyer twice; and a
  capital falling under one of the collection's own marks stood aside for it. Every one of them was a
  place no card in the collection is about, which is what the request settles — **a history card's map
  carries the collection's places, and the coastline, the rivers and the borders are the world it sits
  in.** The exception the request names needed nothing added: **a city that IS a card's answer is drawn
  already**, as a studied sibling, or as the collection's home city through `CMAP_ANCHOR`. `nearSib`
  went with the layer, having existed only so a grey square could stand aside for a red one.
  **EVERY RIVER THE ATLAS
  DRAWS IS DRAWN HERE TOO, AND NOT ONE OF THEIR NAMES** (Aug 2026, on request: "the same Rivers
  displayed on the Atlas should also be displayed in Atlas windows in cards (only without their
  labels)"). For a fortnight a river was drawn only where the collection taught one, and that narrowing
  was the answer to a REAL fault: **`addRing` closed every path**, and a river is a POLYLINE, so all
  1,073 were drawn with their mouths joined back to their sources across a continent. It takes a `close`
  flag now, `false` for a river, which is the flag the Atlas has always passed its own `addClipped` —
  and with the fault fixed the narrowing could go, a map that draws the Rhine only for a collection with
  a Rhine card being one whose water means something different on every card. **WHAT DOES NOT COME BACK
  IS THE NAMES**: on the Atlas a river label is a layer of its own, drawn only past a zoom and against a
  de-collision pass, and a thousand of them in a window this size buries the marks the card is about.
  The one exception is the card's OWN river, which is not a river label at all but the answer's mark,
  named after the reveal exactly as a dot's is. **THE THIN ONES ARE ONE PATH, STROKED ONCE** — it was a
  `beginPath`/`stroke` per river, which is right for the handful a collection teaches and is 1,073
  strokes a frame for all of them, on a globe the reader is dragging. **`sib.terms` WENT WITH THE RULE
  IT EXISTED FOR**: the only question left about a river is which one is the card's SUBJECT, which
  `locOwnTerms` answers per card, and that set's keys were `termName`'s keys exactly — one table in two
  copies, which is the kind of thing that comes to disagree. **Natural Earth labels a river in the
  language of the country it runs through**, which is why that match reads the term's GLOSSARY ALIASES:
  the Tiber is in `rivers.js` as `Tevere` (the Danube also as `Donau`, the Yangtze as `Chang Jiang`), so
  a Tiber card takes the gold and gets its name by carrying `Tevere` as an alias on the paired glossary
  term — and one that does not, visibly does not. **That alias was added in Aug 2026 and the mechanism
  now has a live instance**: `rm-003` is the first card whose answer is a river. **AND WHAT IS DRAWN IS
  LABELLED WITH FOLIO'S OWN NAME FOR IT, not Natural Earth's** — a map that draws the Tiber and prints
  "Tevere" beside it has answered a question nobody asked — so `locatorSiblings` hands back a `termName`
  map from every matchable surface to the term the collection teaches. **IT IS THE LOCATOR'S LAYER AND
  NOT THE MAP CARD'S**: a geography card asks the reader to name a shape and deliberately never fetches
  the `atlas` bundle, so it draws no rivers and pays for none.
  **AND THE SIBLING DOTS ARE NAMED** (Aug 2026, on the same report: "the other dots don't have their
  labels"). They went up bare, which made them decoration rather than information on a map whose whole
  job is to say where. A sibling's name gives nothing away — `locatorSiblings` excludes the card itself —
  so unlike the card's own label it is drawn BEFORE the reveal. They are **de-collided first-come**, the
  Atlas's city rule in the form this window can afford, with the card's own dot and label reserved first,
  and set at the river labels' 11px/500 rather than the answer's 13px/600, so the card's own place still
  reads as the subject: at the opening 50° view about seven of Ancient Greece's 55 are named and zooming
  in frees the rest. **Fewer names, each readable, beats every name in a heap.**
  `_locSibCache` is declared beside `uCacheBust` rather than beside its own function, for the temporal
  dead zone's reason.
· **…AND A PLACE WITH EXTENT IS DRAWN WITH ITS EXTENT** (`LOC_KINDS` / `locPts` / `locOwnTerms` /
  `drawSwords`; Aug 2026, on request: "For river cards like 'Tiber' ensure it is displayed on the map as
  an actual river and not just a dot. Same goes for mountain ranges like the Apennines … Also regions …
  Battle locations should be identified by a crossed swords icon instead of the red dot"). A locator was
  one thing — a coordinate with a gold dot on it — which is the right mark for a cave, a palace or a city
  and the WRONG one for anything with extent: the Apennines run 1,200 km and got a dot in the middle of
  Italy, the Tiber 400 km of river and got a dot at Rome. A dot there does not merely under-describe the
  place, it makes a false claim about it. So the locator declares a **`kind`** and the kind decides the
  mark — `point` (the dot, unchanged), `battle` (crossed swords, because a battle HAPPENED at a place
  rather than being one), `river` (traced out of `rivers.js` by the term-and-aliases match above and
  drawn in the answer's gold), `range` (black triangles walked along an authored `spine`) and `region`
  (an authored `area`, washed in the answer's gold under a **DASHED** edge). Five things.
  **`area` AND `spine` ARE APPROXIMATE AND THE DRAWING SAYS SO**: a region has no border to be right
  about — Ionia is a stretch of coast, the Fertile Crescent a schematic — so the dash reads as *about
  here* where a crisp gold line would assert a frontier Folio had surveyed. They are the one part of a
  locator that is AUTHORED rather than fetched, which is exactly why `add-card.js` validates them: a
  coordinate can be looked up and an extent cannot, so a transposed pair draws a region in the wrong
  ocean and nothing throws. **A card ALREADY SHIPPED gets one through `.claude/add-locators.js`**, which
  takes the same `kind` / `area` / `spine` and applies the same validation, and still FETCHES the `at`
  from a named article — the shape is the only part of a locator that may be typed.
  **NONE OF THE FOUR DRAWS A DOT AS WELL** — "not just as dots" was the request, and a gold dot inside a
  shaded region says "and specifically HERE", which is the false precision the shape exists to be rid of.
  The one exception is a river the `atlas` bundle has not landed yet: the dot stands until the river is
  actually traced, since a globe with nothing on it for two seconds is worse than a dot.
  **THE VIEW FRAMES THE SHAPE AND THE NAME STAYS AT `at`** — except on a region, where the name goes to
  the shape's middle too. Centring the view on `at` was tried and Doggerland showed why not: the point an
  author picks is somewhere INSIDE a region rather than at its middle, so the zoom that fitted the shape
  framed it half off the top of the window. A RANGE keeps `at` for its name, a spine's bbox centre being
  out in the Tyrrhenian Sea.
  **A REGION AND A RANGE ARE LEFT OFF EVERY OTHER CARD'S MAP** (the request says so), and **so is a
  river** — the only thing a sibling entry could carry is one red dot at the middle of them, which is
  exactly the claim their own cards stopped making, and a river is already drawn on every map in its
  collection as the thin blue thread above.
  **AND EVERY NAME ON THE MAP OPENS ON A CAPITAL** (same request), done at DRAW time through
  `gameCapFirst` rather than in the data — so it covers the sibling names, Natural Earth's river names
  and anything added later without a pass over `data.js` that would then have to be kept up.
  Guarded by `.claude/test-card-locator.js`, whose second section measures the SHAPE of the ink — a
  river is long and thin where a dot is a blob that fills four fifths of its own box — and whose third
  measures the river layer BY TAKING IT AWAY, the water falling when `window.RIVERS` is emptied and the
  dark ink not moving by a pixel.
· **A LOCATOR'S NAME IS A PLACE, NOT THE CARD'S ANSWER** (Aug 2026, on the same request: "A card like
  'founding of Rome' should simply have Rome as its atlas window location, and not a dot titled 'founding
  of Rome' which is obviously not a real location"). Thirty of the Rome collection's locators were named
  after the card's answer term — `imperium`, `patricians`, `collegiality`, `Fasti Consulares` — so the
  map put a labelled dot on a place called "collegiality". They are named for the place the coordinate
  actually marks, read off each card's own prose and its coordinate: the Forum cluster is **Roman
  Forum**, the Campus Martius pair the **Campus Martius**, the Palatine and Capitoline abstractions
  simply **Rome**, and the handful whose subject pins a place get it (`Pons Sublicius`, `Collatia`,
  `Gabii`, `Clusium`, `Aventine Hill`, `Lake Regillus`). **The rule is that the label names somewhere a
  reader could stand**; where the card's subject has no place of its own, the city is the honest answer
  and the hill is false precision.
· **…AND IT DOES NOT OPEN ON "THE"** (Sep 2026, on request: "the atlas location for the card 'Hongshan
  culture' should not include the word 'The' in its label. The same goes for other locations in the
  atlas windows, in all collections"). A map label is a place NAMED rather than a phrase in a sentence,
  and no atlas prints "The Apennines" beside the range. Eight carried one across four collections and
  they were stripped in `data.js`. **IT IS REFUSED IN `add-card.js` AND `add-locators.js` RATHER THAN
  STRIPPED AT DRAW TIME**, and the reason is a handful of real place names: **The Hague** is the seat of
  the Dutch government and **The Valley** the capital of Anguilla, both labels this same window draws off
  the capitals tables. A rule clever enough to tell those from a definite article is one that will
  eventually be wrong about one of them; a refusal at the point of writing cannot be.
· **WHAT CHANGED IN SEP 2026, ON ONE REQUEST ABOUT THE CARD ATLAS WINDOWS.** Seven things, and three
  of them are decisions rather than tuning.
  **THE SIBLINGS ARE THE PLACES THE READER HAS ALREADY STUDIED** — a sibling is drawn once its card has
  a record in `S.cards`, which a card gets on its first grade — "so that the map fills up the more they
  study a collection". A fresh reader's map is the card's own mark and the world.
  **AND A CITY IS ONE MARK, HOWEVER MANY CARDS ARE INSIDE IT.** A locator declares `within`, the city
  it stands in, and the studied siblings GROUP by it: thirty-nine Rome locators sit within four
  kilometres of each other and drew thirty-nine dots on one pixel. The group is drawn at the city's own
  coordinate where a member IS the city, and the card's own city is left out — a red "Rome" over the
  gold "Roman Forum" says nothing.
  **A LOCATOR'S NAME MUST BE A PLACE A READER COULD STAND**, which is a content rule the same request
  forced: thirty Rome locators were named after the card's ANSWER (`imperium`, `collegiality`), so the
  map put a labelled dot on a place called collegiality.
  The rest: the "Drag to turn" chip is gone (the canvas's aria-label still says what to do, which is
  the one reader the words were for); a CAPITAL is a square and the battle swords are steel with no
  outline; label boxes are MEASURED rather than reserved at a flat 141px and may be placed to the LEFT
  of their mark, so far more names fit; `CMAP_ZMAX` is 400 rather than 180; and the Vatican is in
  `CMAP_SKIP`, world.js rounding it to a 0.06° box that is six kilometres a side.
· **A REGION IS CLIPPED TO THE LAND** (`landMask`, `effRings`, `tc`; Sep 2026, on request: "ensure
  displayed areas accurately follow coastlines … and do not extend into the ocean"). An `area` is a
  dozen authored points and a coast is a thousand, so the polygon is drawn GENEROUSLY and then
  multiplied by the land: two offscreen canvases, one holding every country under its own even-odd
  rule with the lakes cut back out, the other holding the region's fill AND its dashed edge, combined
  with ONE `destination-in`. **It was one canvas and `source-in` for an hour and that erased the
  fill** — `source-in` makes everything outside the NEW shape transparent, so the dashed stroke painted
  after the fill wiped the fill. A canvas rather than `clip()` because the countries do not tile
  exactly and an even-odd clip over all of them carves hairlines down every border.
· **HI-RES COASTLINES, PER COLLECTION** (`CMAP_HIRES`, `hiresCoastIngest`, `coast/<region>.js`, the
  `coast_italy` / `coast_greece` / `coast_china` bundles; Sep 2026, on request). Natural Earth 10m coast
  chains SPLICED into world.js's own rings — a hi-res copy drawn over the low-res one doubles every LAND
  border, so a country keeps world.js's vertex chain wherever an edge is shared with a neighbour and
  only the runs no neighbour owns are replaced. Warmed at IDLE by the locator windows of the collection
  that frames it, never awaited and never by the Atlas. **📖 read
  `.claude/build-hires-coasts.js`'s header before touching it** — it records why the coast is classified
  off the 10m data rather than off world.js, and why Russia is left out of the China frame.
  **A MAP CARD GETS ONE TOO, KEYED BY ITS LAYER** (`CMAP_LAYER_HIRES`, the `coast_usa` bundle; Sep 2026,
  on request: "ensure that in the China geography collection, rivers are visible in China, and China's
  borders are of a higher resolution, like in the China history collection. Do the same for the US
  states geography collection"). A map card carries no `data-map-card`, so it cannot be looked up by
  collection the way a locator is — and does not need to be: its LAYER already says which part of the
  world it frames, one layer per geography collection. **The world layer is deliberately absent**, a
  `gw-` card framing any country on earth and a world-wide hi-res coast being a second world.js.
  **WHAT IT BUYS IS SMALL AND IT IS MEASURED**: A/B in a browser with the bundle dropped and the same
  view redrawn, it changes **117 pixels on the California card and 377 on Texas**, out of 224,322 —
  because a map card is not a locator, the state layer is drawn OVER world.js and IS the coast the
  reader sees, and `us-states.js` is already 0.002°/3dp, one device pixel at this window's zoom ceiling.
  All it can sharpen is where world.js overhangs that layer and the neighbours' own shores, and it costs
  220 KB gzipped against China's 63. **State the figure before building the next frame.**
  **A SPLICED RING CAN BE THE COUNTRY TRACED TWICE, AND IT RENDERS PERFECTLY** (Sep 2026, on a bug
  report: "in the Ancient Greece collection I can no longer see the landmass of Turkey"). The splice
  walks the 10m chain between a low-res edge's two ends in the RING's own direction, decided once by
  majority — and for a few edges the index mapping runs the other way, so the walk went the long way
  round and brought back nearly the whole ring. The result has every vertex in the right place and twice
  the signed area: stroked it is flawless, and under a NONZERO fill it is flawless, but **this window
  fills EVEN-ODD, where two windings cancel** — so Turkey's mainland was drawn and then unfilled by its
  own second copy, leaving Anatolia as open sea. China's was traced THREE times and so still filled, at
  three times the points (20,610 for one ring). `edgeChain` now takes the shorter arc, which is the only
  one a low-res edge can stand for. **The check that finds it is the SIGNED AREA of a spliced ring
  against world.js's own** — a near-integer ratio is a ring traced that many times — and it is worth
  running after any change here, since nothing else in the pipeline can see it.
· **HI-RES RIVERS, ON THE SAME TWO FRAMES** (`hiresRiverIngest`, `effRivers`, `rivers/<region>.js`, the
  `river_italy` / `river_greece` bundles; Sep 2026, on request: "Rivers in Italy in the Roman deck and
  Greek rivers in the Greek deck should have a much higher resolution … and there should be more of
  them"). **DELIBERATELY NOT THE COAST'S SPLICE**: a coastline is spliced ring by ring because a land
  border is shared with a neighbour and a hi-res copy over the low-res one doubles it, where a river
  shares nothing and can simply be drawn INSTEAD — so the file names the `rivers.js` entries it takes
  over and `effRivers` hands the draw loop that set minus those, plus the region's own. **The one way it
  can go wrong is a name the region carries that `rivers.js` also has and `supersede` does not name**,
  which draws the same river twice about five kilometres apart; `test-card-locator.js` section 4 checks
  that on the DATA rather than on the ink, that being where it can actually happen. Warmed at idle beside
  the coast and never awaited, so the card paints on `rivers.js` and the water sharpens when the file
  lands. **📖 read `.claude/build-hires-rivers.js`'s header before touching it** — why a river is
  replaced whole rather than clipped to the frame, and where the extra rivers come from.
· **A MODERN CAPITAL WAS A SQUARE, THEN A SMALLER ONE, AND IS NOW NOTHING** — three requests in one
  month, each taking more off the same layer, and the third took the layer. The reasoning is in the
  locator bullet above; what is worth keeping here is the shape of the retreat, because it is the
  argument against ever adding a layer of places the collection is not about: every step of it was
  "make this quieter" and the end of that road is "take it away". `capAt` and `nearSib` are DELETED
  rather than left unread, a register nothing draws from being the next session's bug.
· **A COLLECTION MAY DRAW ITS COUNTRY'S MODERN SUBDIVISIONS, DOTTED** (`CMAP_SUBDIV` / `subdivInner` /
  `_subdivFor` / `_subdivLines`; Sep 2026, on request: "in the China history collection, add dotted
  lines for modern province borders in the atlas windows"). A history card's map already carries the
  coast, the rivers and the modern national borders; what a reader placing Anyang or Erlitou has no way
  to do is say which province it is in. The table is keyed by COLLECTION ROOT — `china` alone today —
  naming a bundle and the global it assigns, so it rides the locator's own machinery and no other
  collection pays for it.
  **ONLY THE INTERNAL EDGES ARE DRAWN, and they are found by ownership rather than by clipping.** Every
  edge of every province is keyed on its two endpoints sorted (`"lon,lat|lon,lat"`); an edge two
  provinces share is internal and one only one province has is the national border, which
  `world.js` is already drawing solid — so drawing the whole province outline would double it. The
  shared edges are then walked back into RUNS rather than stroked one at a time, or a dash pattern
  restarts at every vertex and the line reads as a smear rather than as a dotted rule.
  **IT IS WARMED AT IDLE AND NEVER AWAITED**, the rivers' own bargain: the card paints at once with its
  national borders and the provinces appear a moment later, and the cache is dropped when the bundle
  lands so the next frame recomputes. **`chinaprov` carries `lakes.js` beside it** for the reason
  `usstates` does.
· **THE LAND IS FILLED, THEN THE RIVERS, THEN THE BORDERS** (Sep 2026, on two bug reports: "in the
  atlas windows of the world history collection, rivers appear on top of borders, making the borders
  invisible", and "in the China collection atlas windows, the northeast border with Russia is
  invisible"). **Those are one fault seen twice, and the second is the one that shows why it matters**:
  the Amur and the Ussuri ARE China's north-eastern frontier, so the river drawn over the border did not
  merely obscure a line, it deleted a country's edge — and nothing about it looks like a fault, since
  what is left is a perfectly good map with one border missing. The rivers were painted after the
  countries, in the ocean colour and at up to 1.8px against a border stroked at 0.7, so anywhere a
  border FOLLOWS a river it was painted out. A river is water on the land and a border is a line drawn
  over it; the fix is the ORDER, not the weight. **It costs one geometry pass and not two**: the obvious
  split walks all 117,000 vertices twice a frame on a globe the reader is dragging, so each country's
  projected outline is built ONCE into a `Path2D`, filled from it, and added to a single border path
  stroked after the water — `addRing` writes through `tc`, so pointing that at a path rather than at the
  context is the whole of it. The thin-river pass moved out of the sibling block into `drawThinRivers()`
  for the same reason; the card's own river, which is the ANSWER, still goes on last and over everything.
· **AND A MAP CARD ON A FRAMED LAYER DRAWS RIVERS TOO** (`wantRivers`; Sep 2026, same request as the
  hi-res coast above). A locator has drawn them since Aug 2026 and a geography card drew none:
  `rivers.js` is in the `atlas` bundle, which is ~600 KB of era maps, a timeline and a city index that a
  card asking which state is shaded has no use for. It rides in the `usstates` and `chinaprov` bundles
  instead — the one file listed three times, which is free, `rivers.js` ASSIGNING `window.RIVERS` rather
  than pushing onto a queue, exactly as `lakes.js` does. **A row in `CMAP_LAYER_HIRES` turns the water on
  as well as the coast**, and the two are one decision rather than two: both halves of the request ask
  for the window a history card already draws, and every layer that wants the finer coast wants the
  water on it. **Measured by TAKING IT AWAY** — read the pixels, empty `window.RIVERS`, redraw the same
  view, read them again, which is `test-card-locator.js` section 3's method: the water paints **5,980
  pixels on a China card and 10,631 on a United States one**, and **0 on a world card, which never loads
  `rivers.js` at all**.
  **AND THE SHAPE LAYER WAS PAINTING OVER THEM, so on both framed layers the figure was 0 for a
  fortnight** (Sep 2026). The bullet above put the rivers before the BORDERS and that is only half the
  order: a map card also fills its own layer's shapes — the states, the provinces — and that fill ran
  after the water, so every river inside the United States or inside China was covered by the state it
  ran through. **Nothing about it looks like a fault**: the map is complete, the coast and the borders
  are right, and what is missing is a layer nobody has seen there before. The shapes are filled and
  their outlines collected into a `Path2D` FIRST, the water goes down over the fill, and the borders and
  the subdivision lines are stroked from the collected paths afterwards. **The figures above are the
  only thing that can see this** — a screenshot of a map with no rivers in it is a perfectly good map —
  so re-measure them rather than reading them, and treat a 0 on a framed layer as the fault returning.
· **A RIVER IS DRAWN IN ITS OWN BLUE IN DAYLIGHT, NOT IN THE OCEAN'S** (`riverInk`; the Atlas's own
  `riverCol`. Sep 2026, on request: "on the atlas, rivers are quite hard to see on light mode"). Both
  maps drew a river in the OCEAN colour, which is right at night — the sea is dark against dark land —
  and nearly invisible by day, where the light paper's ocean is a pale wash: measured at **1.03:1**
  against the land it crosses, which is no contrast at all. The night value is unchanged (the ocean
  still), and daylight takes a saturated `rgba(31,122,170,…)` instead, at **3.56:1**. It is a variable
  set in the theme sync rather than a literal at the draw, so the two maps cannot come to disagree
  about what colour water is.
· **AND A RIVER IS THINNER WHEN THE FRAME IS WIDE** (Sep 2026, on request), and the thinning now reaches
  further in (Sep 2026, on a second: "in atlas windows on cards, start make rivers thinner at a lower
  level of zoom"). The weight was the Atlas's own `0.4 + zoom * 0.16` floored at 0.5, then
  `0.15 + zoom * 0.18`, and is **`0.10 + zoom * 0.13` floored at 0.25** — which takes zoom 2 from 0.51 to
  0.36, zoom 4 from 0.87 to 0.62 and zoom 6 from 1.23 to 0.88, and reaches the 1.8px cap at zoom 13 where
  the middle version reached it by zoom 9. The deep end is untouched, that being where a river IS the
  subject. The Atlas draws its rivers only past a zoom; this window draws all 1,073 of them at every
  zoom, so at a card's opening ~50° view the old weight is a continent of blue thread over a map whose
  coast is stroked at 0.7.
· **THE COLLECTION'S HOME CITY IS ON EVERY MAP IN IT** (`CMAP_ANCHOR`; Sep 2026, on request: "Rome
  should always be visible in the Roman collection, with a slightly larger red square as icon, and Athens
  should have the same in the Ancient Greek collection"). Every other red mark is EARNED — a sibling
  appears once its card has been studied — so a reader three cards into Ancient Rome met the
  Mediterranean with one gold mark on it and nothing to place it against. **ITS COORDINATE IS DECLARED
  RATHER THAN LOOKED UP, and both obvious sources fail the word ALWAYS**: `cities.js` is the `atlas`
  bundle, warmed at idle, so a mark taken from it is absent for the first second of every card; and the
  collection's own locators would give Rome (39 cards stand `within` it) and NOT Athens, which no Greek
  card has yet. Two cities, each named beside its own numbers, is a table this file's reader can check.
  It is dropped on the card that IS that city or stands inside it — the answer's gold mark is already
  there — it suppresses the studied sibling group of the same name and the grey capital square under it,
  and its label is placed BEFORE the siblings take their boxes, so the one mark on every map is also the
  one always named.
**📖 `docs/map-cards.md` — READ BEFORE CHANGING ANY OF IT.** Why the globe is drawn here rather than by
reusing the Atlas, the fit's near-rings rule and the Alaska and District of Columbia exceptions, the three
attempts it took to prove the fill is a tint, `h2r` learning `rgb()`, where the facts box sits and why,
and the ten-times-finer trace and its zoom-ceiling arithmetic.

---

## The MAP CARDS bullet as it stood in CLAUDE.md (2026-09-11)

**Read this before changing a map card's draw order, its hi-res layers or a locator's marks.** CLAUDE.md
keeps the rules; this is the bullet verbatim as it was written, with the request behind each rule and the
sentences of justification that were condensed out of it.

- **MAP CARDS — a shape on a globe as the question** (the `MAP CARDS` block in app.js, just above
`cardFrontHTML`; `us-states.js`; the Geography collection. Aug 2026, on request). The card shows a place
shaded on a globe the reader can turn and zoom but not click, and asks what it is; the back names it and
adds a box of figures. Two fields carry it — **`map`** (`{ layer, key, zoom? }`) and **`facts`**
(`[[label, value], …]`) — and everything else about such a card is an ordinary curated card.
· **`key` MAY BE A LIST, AND CYPRUS IS WHY** (Aug 2026, on request: "ensure the country Cyprus encompasses
the whole island"). `world.js` files a partitioned island as separate polygons — `Cyprus`, `N. Cyprus`
and `Cyprus U.N. Buffer Zone` are three — so a card naming one shaded two-thirds of what the reader can
see and asked them to name it. `"key": ["Cyprus", "N. Cyprus", "Cyprus U.N. Buffer Zone"]` shades them
as ONE place: the names are joined with a **pipe** for the markup's single attribute (no place name in
either layer contains one, and `add-card.js` refuses one that does), every name must resolve or the
window fails rather than shading a shape that is not the country, and the fill and outline are laid
down as **one path over all of them** — stroking each would draw the internal lines that dividing them
is exactly what naming them together is meant to hide. With several shapes the opening view centres on
the UNION's bounding box; with one it still centres on that shape's own published label point, **so no
existing card's opening view moves by a pixel**.
· **IT IS A BUILT-IN FORMAT AND NOT A COMMUNITY CARD TYPE**, settled before anything was written: a card
type is templates plus scoped CSS and **cannot run code**, deliberately, since a type is a stranger's
content — and a globe needs a canvas, an animation frame and pointer handlers. The request said "a new
card type" and the honest answer was that the machinery it needs is exactly what a type may not have.
· **NOTHING IS CLICKABLE, which is the point of the exercise** — no click handler, no hit test, no hover.
A reader who could tap the shaded state and be told its name would not be studying. Asserted, since a
map that has become clickable looks exactly like one that has not.
· **A MAP CARD IS KEPT OUT OF EVERY DAILY MINIGAME BY CONSTRUCTION** (`gameCardIdSet` tests
`cardMapSpec`): the games deal a question cold with no map beside it. Unlike `difficulty` and
`undatable` this needs no editorial judgement and so needs no field — and it means **`undatable` should
NOT be set on one**, Timeline being behind that filter already.
· **THE FIT IS READ OFF THE SHAPE** rather than hand-tuned per state, and `map.zoom` is an override no
shipped card needs. **The shaded place is the Atlas's own selection gold**, `TINT_SEL` hoisted to module
scope so there is ONE of it — two golds for one idea drift INVISIBLY here, a card and the Atlas never
being on screen together — and the treatment is the Atlas's three marks exactly.
· **A CITY IS A DOT** (`map.dot`, `window.US_CAPITALS`): a capital card shaded its state and asked for the
city, which says only which state. The coordinates are **generated, never typed** — fifty hand-entered
ones are fifty chances to put a city in the wrong state, and a dot a degree out still draws.
· `add-card.js` validates the key against the real data file, refuses a dot the table has not got or one
outside the card's own state, refuses extra phrasings, and holds the question to 5–20 words.
· **AND IT IS HONESTLY INACCESSIBLE TO A READER WHO CANNOT SEE IT** — a shape is the whole question, so
there is no text alternative that does not answer it. The card can be READ where it cannot be ANSWERED;
stated in `docs/geography-card-plan.md` rather than papered over.
Guarded by `.claude/test-map-cards.js`. **Re-run after touching the `MAP CARDS` block, `startCardGlobe` /
`cardMapSpec` / `cardMapHTML` / `mountCardMaps` / `cardFacts` / `CMAP_ZMAX` / `TINT_SEL` /
`serializeCardData` / `revertCard` / `gameCardIdSet`, `.claude/build-us-states.js`, or after adding a map
card.**
· **A LONG STRAIGHT SEGMENT IS A LIE ON A SPHERE, AND `addRing` NOW WALKS ONE IN STEPS** (`CMAP_SEG`,
0.5°): two files drawing the same ruler-straight border with different vertex counts sag by different
amounts in orthographic projection, which reads as a doubled border. **A segment wider than 180° is
left alone** — the only one is Antarctica's base, which would otherwise interpolate the wrong way
round the planet. **`addRing` is SHARED with the locator's rivers, which pass `close: false`** — a
river is a POLYLINE — so the walk is hoisted into `ringStep` and the flag read at the end of it; the
two arrive as one merge conflict on adjacent lines and **must be resolved together**, since taking
either side whole loses the other and both losses render perfectly.
· **A LOCATOR SHOWS THE REST OF ITS COLLECTION, AND THE WORLD AROUND IT** (`cardCollectionRoot` /
`locatorSiblings` / `_locSibCache`). **The two halves are paid for differently and that is the whole
design**: the siblings are FREE, being in `data.js`, so they ship unconditionally; the rivers are the
`atlas` bundle, so they are **warmed at IDLE and never awaited**, and skipped outright under
`saveData`. **A sibling is drawn once its card has a record in `S.cards`** — the map fills up the more
the reader studies — and **studied siblings GROUP by the `within` city they stand in**, or thirty-nine
Rome locators draw thirty-nine dots on one pixel. **THE MODERN CITIES LAYER IS GONE ALTOGETHER**: a
history card's map carries the collection's places, and the coastline, the rivers and the borders are
the world it sits in. **EVERY RIVER THE ATLAS DRAWS IS DRAWN HERE TOO, AND NOT ONE OF THEIR NAMES** —
the exception being the card's OWN river, which is the answer's mark — and **the thin ones are ONE
path, stroked once**, not 1,073 strokes a frame. **What is drawn is labelled with Folio's own name for
it, not Natural Earth's**, matched through the paired glossary term's ALIASES (the Tiber is `Tevere`
in `rivers.js`), and **the sibling dots are named too**, de-collided first-come at the river labels'
weight, with the card's own dot and label reserved first. `_locSibCache` is declared beside
`uCacheBust`, for the temporal dead zone's reason.
· **…AND A PLACE WITH EXTENT IS DRAWN WITH ITS EXTENT** (`LOC_KINDS` / `locPts` / `locOwnTerms` /
`drawSwords`). A dot on a 1,200 km range does not merely under-describe the place, it makes a false
claim about it — so the kind decides the mark: `point`, `battle` (crossed swords), `river` (traced out
of `rivers.js`), `range` (triangles along an authored `spine`), `region` (an authored `area`, washed
under a **DASHED** edge). **`area` AND `spine` ARE APPROXIMATE AND THE DRAWING SAYS SO** — the dash
reads as *about here* where a crisp gold line would assert a frontier Folio had surveyed — and they
are the one part of a locator that is AUTHORED rather than fetched, which is why `add-card.js`
validates them. **NONE OF THE FOUR DRAWS A DOT AS WELL**, the one exception being a river whose bundle
has not landed. **THE VIEW FRAMES THE SHAPE AND THE NAME STAYS AT `at`**, except on a region, where
the name goes to the shape's middle too. **A REGION, A RANGE AND A RIVER ARE LEFT OFF EVERY OTHER
CARD'S MAP.** **AND EVERY NAME ON THE MAP OPENS ON A CAPITAL**, done at DRAW time through
`gameCapFirst` rather than in the data.
· **A LOCATOR'S NAME IS A PLACE, NOT THE CARD'S ANSWER** — the rule is that the label names somewhere a
reader could stand; where the card's subject has no place of its own, the city is the honest answer
and the hill is false precision.
· **…AND IT DOES NOT OPEN ON "THE"**. It is **REFUSED IN `add-card.js` AND `add-locators.js` RATHER
THAN STRIPPED AT DRAW TIME**, because **The Hague** and **The Valley** are real place names and a rule
clever enough to tell those from a definite article will eventually be wrong about one of them.
· **A REGION IS CLIPPED TO THE LAND** (`landMask`, `effRings`, `tc`): an `area` is a dozen authored
points and a coast is a thousand, so the polygon is drawn generously and multiplied by the land —
**two offscreen canvases combined with ONE `destination-in`**. It cannot be `source-in`, which erases
the fill the dashed stroke is painted over, and it cannot be `clip()`, which carves hairlines down
every border because the countries do not tile exactly.
· **HI-RES COASTLINES, PER COLLECTION** (`CMAP_HIRES`, `hiresCoastIngest`, `coast/<region>.js`) — 10m
coast chains SPLICED into world.js's own rings, since a hi-res copy drawn over the low-res one doubles
every LAND border. Warmed at IDLE by the locator windows of the collection that frames it, never
awaited and never by the Atlas. **A MAP CARD GETS ONE TOO, KEYED BY ITS LAYER** (`CMAP_LAYER_HIRES`),
the world layer deliberately absent since a `gw-` card frames any country on earth. **WHAT IT BUYS IS
SMALL AND IT IS MEASURED** — 117 pixels on the California card against a 220 KB gzipped file — so
**state the figure before building the next frame.** **A SPLICED RING CAN BE THE COUNTRY TRACED TWICE,
AND IT RENDERS PERFECTLY**: this window fills EVEN-ODD, where two windings cancel, so `edgeChain` must
take the shorter arc. **The check that finds it is the SIGNED AREA of a spliced ring against
world.js's own** — a near-integer ratio is a ring traced that many times — and nothing else in the
pipeline can see it.
· **HI-RES RIVERS, ON THE SAME TWO FRAMES** (`hiresRiverIngest`, `effRivers`, `rivers/<region>.js`).
**DELIBERATELY NOT THE COAST'S SPLICE**: a river shares nothing and is drawn INSTEAD, so the file
names the `rivers.js` entries it `supersede`s. **The one way it can go wrong is a name the region
carries that `rivers.js` also has and `supersede` does not name**, which draws the same river twice
about five kilometres apart; `test-card-locator.js` section 4 checks that on the DATA.
· **A MODERN CAPITAL WAS A SQUARE, THEN A SMALLER ONE, AND IS NOW NOTHING** — three requests in one
month, each taking more off the same layer. **The shape of that retreat is the argument against ever
adding a layer of places the collection is not about**: every step was "make this quieter" and the end
of that road is "take it away". `capAt` and `nearSib` are DELETED rather than left unread.
· **A COLLECTION MAY DRAW ITS COUNTRY'S MODERN SUBDIVISIONS, DOTTED** (`CMAP_SUBDIV` / `subdivInner` /
`_subdivFor` / `_subdivLines`), keyed by COLLECTION ROOT so no other collection pays for it. **ONLY
THE INTERNAL EDGES ARE DRAWN, and they are found by ownership rather than by clipping** — an edge two
divisions share is internal, one only one division has is the national border `world.js` already
draws — and the shared edges are **walked back into RUNS rather than stroked one at a time**, or the
dash pattern restarts at every vertex and reads as a smear. Warmed at idle; the cache is dropped when
the bundle lands.
· **THE LAND IS FILLED, THEN THE RIVERS, THEN THE BORDERS.** A river painted over a border does not
merely obscure a line — where a border FOLLOWS a river it deletes a country's edge, and what is left
is a perfectly good map with one frontier missing. **A river is water on the land and a border is a
line drawn over it; the fix is the ORDER, not the weight.** It costs one geometry pass and not two:
each country's projected outline is built ONCE into a `Path2D`, filled from it, and added to a single
border path stroked after the water (`addRing` writes through `tc`); the thin-river pass is
`drawThinRivers()`. The card's own river, which is the ANSWER, still goes on last and over everything.
· **AND A MAP CARD ON A FRAMED LAYER DRAWS RIVERS TOO** (`wantRivers`) — `rivers.js` rides in the
`usstates` and `chinaprov` bundles, which is free, since it ASSIGNS `window.RIVERS` rather than
pushing onto a queue. **A row in `CMAP_LAYER_HIRES` turns the water on as well as the coast.** **AND
THE SHAPE LAYER WAS PAINTING OVER THEM**, so the figure was 0 on both framed layers for a fortnight
and nothing about it looked like a fault: the shapes are filled and their outlines collected into a
`Path2D` FIRST, the water goes down over the fill, and the borders and subdivision lines are stroked
afterwards. **Measured by TAKING IT AWAY** — read the pixels, empty `window.RIVERS`, redraw, read
again — and **a 0 on a framed layer is that fault returning**, so re-measure rather than reading the
figures back.
· **A RIVER IS DRAWN IN ITS OWN BLUE IN DAYLIGHT, NOT IN THE OCEAN'S** (`riverInk`): the ocean colour is
right at night and measured 1.03:1 against the land by day, which is no contrast at all. It is a
variable set in the theme sync rather than a literal at the draw, so the two maps cannot come to
disagree about what colour water is.
· **AND A RIVER IS THINNER WHEN THE FRAME IS WIDE** — `0.10 + zoom * 0.13`, floored at 0.25 and capped
at 1.8. The Atlas draws its rivers only past a zoom; this window draws all 1,073 at every zoom, so at
a card's opening ~50° view a heavier weight is a continent of blue thread. The deep end is untouched,
that being where a river IS the subject.
· **THE COLLECTION'S HOME CITY IS ON EVERY MAP IN IT** (`CMAP_ANCHOR`). **Its coordinate is DECLARED
rather than looked up, and both obvious sources fail the word ALWAYS**: `cities.js` is the `atlas`
bundle, warmed at idle, so a mark taken from it is absent for the first second of every card; and the
collection's own locators would give Rome and not Athens. It is dropped on the card that IS that city,
suppresses the studied sibling group of the same name, and **its label is placed BEFORE the siblings
take their boxes**, so the one mark on every map is also the one always named.
· **📖 `docs/map-cards.md` — READ BEFORE CHANGING ANY OF IT.** Why the globe is drawn here rather than
by reusing the Atlas, the fit's near-rings rule and its exceptions, the three attempts it took to
prove the fill is a tint, where the facts box sits and why — and, moved out of here, the full account
behind every locator rule above: the bug report each came from, the measurements (117 pixels, 5,980
and 10,631 river pixels, the 0.0138 R sag), the Sep 2026 batch's seven changes, and the
generalisations that were tried and abandoned.
