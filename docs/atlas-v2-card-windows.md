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

---

# Phase 4b — fast, legible and at parity, so that Stage B can be decided

Phase 4b changes nothing a reader of the live site sees: the preview switch is still OFF by default and V1's windows are still the default. What it adds is measurement, speed on the engine's side of the switch, and the tests that were missing. The as-built note is `docs/atlas-v2-design.md` §7 "Phase 4b"; this file keeps the two tables that belong with the inventory above.

@@NUMBERS@@

## Every V1 window assertion, and where it went (Phase 4b, Task 7)

**How the three V1 window suites now run on the engine.** `test-map-cards.js`, `test-card-locator.js` and `test-war-cards.js` take `FOLIO_ENGINE=v2` (`.claude/test-engine-switch.js`): every page the suite opens gets the preview switch turned on after the suite's own storage seeds, a suite that opened `index.html` as a file is served over http instead (the engine needs `fetch` and a Worker), and the window assertions then run **unchanged against the engine's window**. CI runs each suite twice (V1, then `FOLIO_ENGINE=v2`). Only rows that assert **V1's own mechanism** are skipped on the engine, by name, with a message; each has a twin in the new `test-atlas-windows.js` (Phase 4b) or in `test-atlas-embed.js`. Result on the engine: `test-map-cards.js` 11,296 ok (V1: 11,307; the 11 missing are the fit sweep's formula copy, replaced below), `test-card-locator.js` 14 ok and 12 skipped by name (V1: 26 ok), `test-war-cards.js` 57 ok (V1: 57).

Classes (the inventory behind this table was made by reading every assertion): **D** data only (no window; runs identically on both engines and is not repeated), **S** a regex over `app.js` text, **W** a mounted window in a browser. A row says **"same"** when the assertion passes unchanged on the engine's window (the suite run with `FOLIO_ENGINE=v2` is the proof); **"twin"** when V1's mechanism has an engine counterpart written for it; **"V1-only"** when it pins code Stage B deletes.

### `test-map-cards.js` (111 rows: 46 D, 13 D-in-a-page, 15 S, 37 W)

| V1 row(s) | what it asserts | class | on the engine |
|---|---|---|---|
| 53–151, 164–206, 244–250 (46 rows; ~11,240 assertions over 821 map cards, 424 capital cards, 1,309 facts boxes, 2,015 locators) | the layers' data, every card's `map` / `locator` / `facts` | D | same (data; engine-neutral) |
| 472–480, 502–504, 549, 593, 615 (13 rows) | the card's back in a page: answer, facts tiles, five sources, footnote markers, the collection's row, no console errors | D (page) | same |
| 215–219, 225, 227, 229, 235, 252, 253 | `serializeCardData` / `revertCard` carry `map`, `facts`, `locator`; `gameCardIdSet` excludes map cards; `us-states.js` is lazy and not in `index.html` | S | same (engine-neutral source pins) |
| 316, 323, 558 | the fit sweep is pinned to `app.js`'s formula; the zoom limits are read out of `app.js`; the reveal label's expression | S | **V1-only** (they pin `startCardGlobeV1`'s arithmetic; Stage B deletes them with it; the engine's fit is swept through the real windows below) |
| 409, 411 | `TINT_SEL` is defined once, as a triple, a fill alpha and a line colour | S | same (the engine's windows read the same constant) |
| 341, 343, 345, 347, 357 | the fit of all 51 states: computed, finite and positive, not a speck (fill ≥ 0.45), not cut off (≤ 1.02), at most one needs more zoom than the ceiling | W\* (a copy of the formula over `window.US_STATES`) | **twin: `test-atlas-windows.js` §6** — the same five assertions through the engine's real windows (one mounted per state through `startCardWindow`), with the engine's actual zoom and the card-faces box, plus the drawn outline measured (visible, never cut) |
| 351 | Alaska's fit ignores the rings across the antimeridian | W\* | **twin: §6** (frame under 40°, drawn at a visible size) |
| 362, 363 | Rhode Island opens zoomed in (> 20) and centred | W | same (runs on the engine in `test-map-cards.js`) and in §6 (zoom 79) |
| 372, 373, 378, 383, 387 | a drag turns the globe and does not zoom it; the + and − buttons; recentre is exact | W | same |
| 393, 394, 397 | a click on the map opens no panel and no popup; the canvas claims its touches (`touch-action: none`) | W | same (and `test-atlas-windows.js` §2: a tap *before* the reveal does nothing, *after* it opens the Atlas) |
| 435, 436 | the shaded place is outlined in `TINT_SEL.line` exactly, over a real edge | W | same |
| 450, 453, 456 | the shaded place is a translucent tint of `TINT_SEL.rgb` over the map's own land, over a real area | W | same |
| 473, 474, 557 | the map stays on the back and repaints on the reveal | W | same |
| 519, 520, 521, 539, 540 | a capital card resolves, carries its city, asks without naming it, paints a dot (not a region) | W | same |
| 594, 596, 599, 600, 605, 608, 611, 612 | a locator's window mounts, is not failed, reports ready, paints a globe; its controls are exactly go / home / in / out; its aria text names the place; it sits after the background fold and before the citations | W (markup-owned) | same |

### `test-card-locator.js` (26 rows: 4 D, 22 W)

| V1 row(s) | what it asserts | class | on the engine |
|---|---|---|---|
| 96, 113 | the card carries a locator globe; it paints without waiting for the atlas | W | same |
| 122, 123 | the cities and rivers arrive at idle; fetched, not bundled into the eager path | W (V1's `CITIES` / `RIVERS` bundles) | **skipped on the engine; twin: `test-atlas-embed.js` §3** (the engine and `topology.bin` arrive only on a card with a window, never on the eager path) **and `test-deck-lazy.js`**, and §5 of the new suite (the water file is fetched after the land) |
| 139, 154, 169 | the collection's other studied places are on the map in red; the card's own place is still in the answer's gold; the siblings are named | W | same, and `test-atlas-windows.js` §8 (the Cyclades with fourteen studied Greek cards: red 295 px, gold 2,128, ink 315) |
| 171, 437 | no console or page errors | W | same |
| 226 | a river card draws its river, not a dot | W | same |
| 236, 238 | a range card draws mountains along its spine, and no gold dot | W | same |
| 256, 258 | a reader who has studied nothing sees none of the earned places; the home city is always there as a square | W | same, and §8 |
| 326 | the collection's map draws the Atlas's rivers (measured by emptying `window.RIVERS`) | W (V1's mechanism) | **skipped; twin: §5 and §7** — the engine's own rivers are drawn at the Atlas's density for the zoom (the Texas card, the Tiber, the Apennines, Russia: river-colour pixels in the window) |
| 334 | …and not one of them is named | W | same, and **§7: no label layer in a window (`labelsPlaced` 0)** |
| 353, 355, 356, 357 | the Italian frame's hi-res river file: ≥ 40 rivers, > 40 points a river, every superseded name is in `rivers.js`, no river is drawn over itself | D (read from `window.HIRES_RIVER`) | **twin: §7a**, the same four properties read from `rivers/italy.js` in Node (the file is still what the card's own river reads) |
| 358 | …and the map really draws it | W (V1's mechanism) | **skipped; twin: §7b** (the Italian frame draws the engine's rivers) |
| 374 | a modern city puts nothing on the map | W (plants a row in `CITIES`) | same (vacuous on the engine, which has no city layer) and **§7b: no labels in a window** |
| 414, 416, 418, 433 | a Russia locator warms its own hi-res coast, fetched at idle; it draws the Atlas's rivers; the map really draws the hi-res coast on the opening view | W (V1's `HIRES_COAST`) | **skipped; twin: §7b** — the Russian frame opens on a level whose tolerance is within half a pixel, settles, draws rivers, and fetches no `coast/*.js` |

### `test-war-cards.js` (57 rows: 24 D, 12 S, 21 W)

| V1 row(s) | what it asserts | class | on the engine |
|---|---|---|---|
| 49–223 (24 rows; one of them 490 assertions) | the war blocks: every named side on a map, every extent plausible and in place, no clashes, the checker's own rules | D | same |
| 239–255 (12 rows) | `cardWar` run in Node; `serializeCardData` / `revertCard` carry `war`; `TINT_WIN` / `TINT_LOSE`; the stylesheet states no colour for `.war-key`; the Personal Atlas explains green and red | S | same (all shared with the engine's windows or the v1 Personal Atlas, which stays until Phase 5) |
| 335–338 | the war card has an atlas window, marked as a war with both sides, labelled "Who fought", needing no coordinate | W (markup) | same |
| 340–342, 345 | a legend names both sides, says which won, sits outside the locator block; the canvas says it in words | W (markup) | same, and **§4: the window itself now names the two sides and draws a one-line legend** |
| 349, 350, 351, 354 | the window draws; the victors in green, the defeated in red, in comparable measure | W | same |
| 364, 368, 369 | Second Sino-Japanese War: China green, Japan red; the window frames the war; ready | W | same (over http; on `file://` the window falls back to V1, see below) |
| 386, 389, 392, 406, 411 | the v1 Personal Atlas page (`#map`): both sides in the war's years and none outside; a click opens the war's card; the popup keeps the legend | W (the v1 *page*, not a card window) | unchanged until Phase 5; the v2 Atlas's counterpart is `test-atlas-render.js` (Rome victor, Carthage loser in 216 BCE; the tint ends with the years) |
| 414 | no console errors | W | same |

### Find it (`test-minigames.js`, 19 W rows in the `[fi]` and `[fi-atlas]` blocks) → `test-atlas-embed.js` §6

1163, 1313, 1314 (five rounds, in order) → "deals the same five as v1's board"; 1209, 1216, 1219, 1226 (a tap picks, "Guess", Clear) → the pick / Clear rows; 1248, 1257 (a wrong guess spends a try and says how far) → "N km away — one more try!"; 1262 (a correct second guess counts) → "a second try that is right counts as FOUND"; 1320, 1322 (a state is on the Full Atlas in its year; a country on today's map) → the cartouche rows; 1323, 1329 (every round played; the game ends with a score) → the score-line row; **1264, 1324, 1326, 1327 — v1 had no twin in Stage A; Phase 4b adds them**: after two tries there is no third (Next showing, Guess gone); a country round ends on its own panel with a way to its place on the Atlas; a state, a people or a place ends on a list of its cards, each a link to the card's own address. *This is a different ending from v1's* (v1 opened its country panel and card stack in the page); the v1 learn panels (`showCountryPopup`, `showMinePopup`) are not built on the engine's board — **a Stage B decision for the owner**.

### What is left without a counterpart (Stage B blockers)

None among V1's window assertions. Two **behaviours** are not tests but gaps, and are listed with the readiness table in `docs/atlas-v2-design.md` §7 "Phase 4b": (1) **`file://`** — a war window falls back to V1 (the history file's `file://` twin is still the 2a pilot slice, 11 entities; `startCardWindow` now checks that the loaded history carries the war's sides and otherwise keeps V1's window), so deleting V1's window path would leave a war card on a `file://` page with no map; (2) **Find it's v1 learn panels**, above.
