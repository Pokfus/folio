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
