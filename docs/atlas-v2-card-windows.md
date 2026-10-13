# Atlas v2, Phase 4 — every map drawn inside a card or a game, and what replaces it

**Read this before touching `startCardGlobe`, `CARD_MAP_LAYERS`, a card window, Find-it, or `atlas/atlas-embed.js`.**
It is the Task 1 inventory of Phase 4 (`docs/atlas-v2-design.md` §7 "Phase 4 — as built" has the build and the numbers). Line
numbers are `app.js` as of the Phase 4 branch point; use `node .claude/app-map.js --find <name>` rather than trusting them.
(`docs/atlas-v2-coverage.md` is a different, generated file: what the historical layer covers century by century.)

## The headline

Only **two** renderers in `app.js` draw a map outside the Atlas page, and everything else on the site is a button that routes to the
Atlas or one of these two.

- **A. `startCardGlobe`** (≈34626–35790): a hand-rolled 2D-canvas orthographic globe. It serves every map card, every locator
  window, every war window and the Special courses' headquarters windows. It reads *present-day* data only (`world.js`, the
  layer bundles) and takes **no year**.
- **B. `PAGES.map(root, { game: true })`**, hosted by `PAGES.findit` (≈46736): the v1 Atlas page itself switched into a game mode.
  Its board is the Full Atlas's draw path at the year a round names.

## The table

| # | Surface | Where (app.js) | Draws | Year and data | Guarded by | v2 primitive that replaces it |
|---|---|---|---|---|---|---|
| 1 | **Map card** (`card.map`: layer, key, dot, zoom). The map is the QUESTION; its name is held back until the reveal. | `cardMapSpec`, `cardMapHTML`, `CARD_MAP_LAYERS`, `cardFrontHTML`, `startCardGlobe`; reveal in `cardMapReveal` | The place shaded in the Atlas's selection gold (`TINT_SEL`: 24 % fill, glow, 2.6 px line), neighbours plain, land, borders 0.7 px, lakes; rivers only where the layer has a hi-res row; `map.dot` is a gold square (capital); a key list shades several polygons as one (Cyprus). Label only after the reveal. | **None** (today). Bundles `world`, plus `usstates` / `chinaprov` / `russubj` (+ their capital tables), `worldcaps` only for a dot, hi-res coasts `coast_usa` / `coast_china` via `CMAP_LAYER_HIRES`. | `test-map-cards.js` (fit sweep of 51 states through `_folioMap.view()`, drag / zoom / home, the gold is a tint not a fill, the dot, `mc-failed`), `test-minigames.js` (`gameCardIdSet` keeps map cards out) | **Highlight** of faces by registry id (the admin-1 faces of the three layers, the country faces) at a fixed year (today), plus a **mark** for the dot. The window keeps the reveal gate itself. |
| 2 | **Locator window** on history cards (`card.locator`: at, name, kind point / river / range / region / sea / shelf / battle, area, spine, within, label, zoom) | `cardLocator`, `cardLocatorHTML` (`.card-loc > .map-card.map-loc`), `locatorSiblings`, `startCardGlobe` | Gold dot, the card's own river traced in gold, range triangles along a spine, a dashed land-clipped area, crossed swords for a battle; the collection's other studied places as named red dots (folded by `within`, with a label-collision register); the collection's home square (`CMAP_ANCHOR`); hi-res coast; rivers; China's dotted modern provinces (`CMAP_SUBDIV`); always named. | **None** (today's `world.js`). Bundles `world`, then `atlas` (cities, rivers, lakes) warmed at idle, `coast_*` / `river_*` by collection (`CMAP_HIRES`), `chinaprov` for the dotted edges. All skipped under `lightMode()`. | `test-card-locator.js` (paints before `atlas` lands, cities and rivers off the eager path, sibling reds, the card's own gold, names inked, river / range pixels, hi-res frames, a modern city draws nothing), `test-map-cards.js` (locator data, serialise / revert) | **Marks** on a fixed-year (today) v2 view: the engine draws coast, borders, rivers, lakes and the capital squares; the card-specific marks stay a 2D overlay projected with the engine's own view. v2's tile levels replace the hi-res bundles. |
| 3 | **War window** (`card.war`: victors / losers `keys` or authored `area`, years, zoom, group) | `warSide`, `cardWar`, `cardWarKeyHTML` (the legend is a sibling of `.card-loc`), `TINT_WIN` / `TINT_LOSE`; reuses the locator window (`map-war`) | Victors green, defeated red (fill, glow, 2.2 px line); named sides matched by name against the *present-day* `world.js`; ancient sides are authored dashed `area` rings; frame fitted to the union of both sides. | **The window uses no year**; `cardWarYears` feeds only the Personal Atlas. | `test-war-cards.js` (window exists with no `at`, legend names both sides and sits outside `.card-loc`, aria text, green and red pixel counts, the Sino-Japanese frame, clicking a side opens the card), `test-war-sides.js` | **War side steps**: `warRoles(ATLAS_WARS, shown, year)` tints the sides' entities in the war's years on the v2 historical view; an authored extent or a side with no entity stays the card's dashed overlay. |
| 4 | **Mount points** | `mountCardMaps`; callers `PAGES.card`, `PAGES.sample`, study `renderCard` and `showAnswer`, `mountCardBack` (Multiple Choice via `withCardExtra`, the Atlas popup with `noLocator`, admin `previewCard`) | as 1–3 | | | one `mountCardMaps` branch plus `cardMapReveal` |
| 5 | **Editor previews** | `renderCardPreviewInto` (community-deck sample only; community cards carry no map), admin `previewCard` through `mountCardBack` | the locator only | | none of its own | as 2 |
| 6 | **Card peek** `openCardPeek` | | **no map** — a sheet with the defining sentence | | | none |
| 7 | **Glossary popup pin** (`glossPlace`, `GLOSSARY_PLACES`, `GLOSSARY_MAP_COUNTRY`) | button markup, click handler near line 4451; `atlas2Preview()` | **no mini globe** — a button that closes the popup and routes to the Atlas (`#map`, or `#map2` with `place` behind `folio.atlas2.preview`) | none | `test-atlas-places.js`, `test-atlas-study.js` | a place link into v2 (Phase 3c, already built); a popup mini-map would be a new use of the embed and is **not** built |
| 8 | **Find it** (`PAGES.findit` → `PAGES.map(root, { game: true })`) | `finditPools`, `buildGameRounds`, `gameBoard`, `gameTap`, `gameCommit`, `drawGameMarks` | The v1 Atlas page in game mode: today's world for a country or place round, the Full Atlas **at the round's year** for a state round; tints for the pending pick (blue), a miss (red), a find (green), the answer (gold); a hollow crosshair and a named pin for a place; a pulse ring; `flyTo` the answer. No names on the board. | Year of the round (`MAXY` for today). Bundles `world`, `atlas`, `worldcaps`, `polities`, `countrysteps`, `fronts`. | `test-minigames.js` (the Find-it block: tap picks without guessing, Clear, "N km away", a correct second guess scores, five rounds in fixed order, the reveal ends on a card), `test-csp.js`, `test-a11y.js` | **Highlight** (pick, answer), **ID-pass scoring** (`stackAt` for a country or state, great-circle distance for a place), **year** (`setYear`). Scoring rules and pools are unchanged. |
| 9 | Special-course "headquarters map windows" | data only: `card.locator` entries in `data.js` and `data-extra/{eep,gga,pea}.js` | a gold dot with the headquarters' name | none | those of 2 | as 2 |
| 10 | Home page and Settings | `startMiniGlobe` was deleted; Settings has a `<select>` and no canvas | none | | | none |

Other `getContext` sites are not maps: the avatar crop, the whiteboard, the draw-the-flag pad, the heightmap sampler and the
Atlas page's own canvases.

## `startCardGlobe`'s contract (what a replacement must keep)

- **Host attributes:** `data-map-layer`, `-key` (pipe list), `-dot`, `-zoom`, `-named`; locator: `-card`, `-at`, `-atname`, `-kind`,
  `-within`, `-label`, `-area` (rings joined by `;`, points by a space), `-spine`; war: `data-war-v`, `-varea`, `-l`, `-larea`.
- **Markup:** `.mc-canvas`, `.mc-zoom .mc-btn[data-mc=in|out|home|go]`, `.mc-alt`, `.mc-new` (the "Discovered!" chip), the
  `mc-loading` / `mc-failed` states.
- **API:** `host._folioMap = { stop, reveal, ready, view, pan }` — `view()` and `ready()` are what the suites read; `pan` is what the
  whiteboard uses to drive the globe with a finger in stylus mode.
- **Interaction:** drag, pinch, wheel (`preventDefault`), arrow keys, `+` / `−`, home; zoom clamped 0.85–400 (`CMAP_ZMIN` / `CMAP_ZMAX`);
  `fitTarget` frames the shape.
- **Leaving for the Atlas:** one capture-phase document listener on `.map-card [data-mc="go"]` ("See this on your atlas") sets the study
  hold and routes to `#map`. The string "Open in the Atlas" did not exist before Phase 4.
- **Reveal and accessibility:** a map card's `aria-label` describes the task, never the shape (any description answers the card);
  `S.settings.mapAlt` opts into the neighbours text.

## What has no v2 primitive of its own (and what Phase 4 does with it)

Nothing in the table is *unmappable*; five things are not an engine primitive, and each is a 2D overlay projected with the engine's own
view rather than an entity or a face:

1. **Authored approximate extents** — a locator's region / sea / shelf area, a range spine, a war's authored `area` (the ancient wars). They
   are the card's own claim, dashed on purpose; they stay overlay polygons (land-clipped), as they are in the Atlas's authored extents.
2. **The sibling overlay** — red dots for the collection's other studied places, folding by `within`, the label-collision register, the
   home square.
3. **The reveal gate** of a map card and the **zoom / home / go** controls, the `_folioMap` API and the whiteboard hand-off.
4. **Dotted modern provinces** under China's history cards (interior edges only).
5. **Find-it's feedback** beyond a highlight: the blue pending pick, the miss / find tints, the crosshair, the pulse, the distance
   sentence.

**A war window has no year today and v2's wars are dated.** A window therefore needs a display year per war card (the middle of the
war's years); that changes the picture from "present-day countries shaded" to "that year's states shaded", which the design calls an
improvement and the owner is asked to confirm (`docs/atlas-v2-design.md` §7 Phase 4 "Decisions").

## The suites that guard this, to run before and after

`test-map-cards.js`, `test-card-locator.js`, `test-war-cards.js` (+ `test-war-sides.js`, `test-war-sides-known.js`), `test-minigames.js`
(the Find-it block), `test-atlas-places.js` and `test-atlas-study.js` (the glossary pin), `test-deck-lazy.js` (the eager path), and, from
Phase 4, `test-atlas-embed.js` (the embedded windows on the engine).
