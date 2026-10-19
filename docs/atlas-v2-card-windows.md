# Atlas v2, Phase 4 — every map drawn inside a card or a game, and what replaces it

> **PHASE 5 (Oct 2026) — READ THIS FIRST.** v1's windows (`startCardGlobeV1`), v1's Find it, the per-viewer switch and `test-engine-switch.js` are **deleted**; everything below that says "V1 window", "the way back" or `FOLIO_ENGINE=v1` is history.
> The engine's windows are the only windows, and the fallback is the engine's own Canvas 2D path: no WebGL2 → `data-map-engine="v2-2d"` (map cards and locators work, zoom capped at 8, no outline glow); a war card →
> `"none"` with the sentence and the key; a refused bundle → `"none"` with `.mc-plain-note` (Find it: "Find it could not be set up" and a Reload button). `test-window-fallbacks.js` proves each in real WebGL-less and bundle-refused
> browsers; `test-window-env.js` is the small helper the window suites share (`launch`, `serve`, `v2()`). The "Every V1 window assertion" table is kept as the record of where each V1 assertion went at Phase 4b;
> the assertions that were about V1's mechanism (its `RIVERS`/`CITIES` globals, hi-res coast bundles, ring tables) were deleted in Phase 5 with a reason in the suite (`docs/atlas-v2-phase5-plan.md` §8). `mapAlt`
> ("Describe geography maps") now prints the sentence from `atlas/data/card-neighbours.js` under the engine's window (`test-map-cards.js` §9).

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

## The baseline and the first window (Tasks 1 and 2)

**What was measured, and how.** `.claude/measure-atlas-embed.js` opens `#card/<id>` in a fresh browser context (cold: nothing cached), times from the moment the card page inserts the window to the window's first painted frame (the canvas's centre pixel is non-transparent *and*, for V1, the map's data has landed — an empty globe is not a paint), then opens the same card in a second page of the same context (warm). Two profiles: **desktop** (1280×800, no throttle) and **phone** (390×844 @3×, touch, CPU ×4 and slow 4G — 1.6 Mbit/s, 150 ms — through the DevTools protocol; **note: `Emulation.setCPUThrottlingRate` slows the page's main thread, not its Web Workers**, so the phone profile understates the worker's cost and overstates nothing). Bytes are counted from every request after the page's own shell, **the worker's included** (Phase 4's figure missed it: the page's `response` event does not fire for a dedicated worker's requests, the context's `request` event does). The engine draws on SwiftShader (software GL) in this runner, V1 on a 2D canvas: **neither number says what a phone's GPU does.** Desktop numbers are the median of three runs, phone of one. Cards: **geo-002** (a map card: Texas), **rm-003** (a locator: the Tiber), **rm-209** (a war card: the Second Punic War). `--after=4000` is the realistic reader: the page opens on `#home`, the reader sits there 4 s (8 s on the phone), the idle warm-up runs, and then the card is opened.

First paint after the window mounted, **cold / warm cache, in ms**:

| card | profile | V1 (switch off) | engine at `173302b` (Phase 4) | engine, Phase 4b, card opened at once | engine, Phase 4b, reader sat on the site first |
|---|---|---|---|---|---|
| geo-002, map card | desktop | 149 / 202 | 4,696 / 4,677 | 1,391 / 677 | **200 / 195** |
| geo-002, map card | phone | 30,144 / 813 | 30,548 / 6,595 | 28,332 / 2,392 | 291 / 336 |
| rm-003, locator | desktop | 117 / 169 | 4,724 / 4,353 | 1,351 / 520 | 497 / 310 |
| rm-003, locator | phone | 37,087 / 354 | 9,894 / 5,904 | 4,676 / 1,890 | 3,042 / 505 |
| rm-209, war | desktop | 268 / 510 | 6,699 / 6,950 | 2,838 / 2,653 | 2,289 / 2,104 |
| rm-209, war | phone | 38,236 / 797 | 67,774 / 96,873 | 67,754 / 92,098 (the 9.1 MB history file again: a headless context does not cache an entry this large) | not measured |

Bytes the first window costs, cold, as served / gzip -9 (the tool's server does not compress; a host that does sends the second figure):

| card | V1 | engine at `173302b` | engine, Phase 4b |
|---|---|---|---|
| geo-002 | 3.8 MB / 1.1 MB (9 files) | 4.0 MB / 2.6 MB (14) | 8.1 MB / 5.5 MB (15) — **+4.2 MB: the water file, now fetched because the rivers are on** |
| rm-003 | 7.9 MB / 2.4 MB (17) | 4.4 MB / 2.8 MB (16) | 8.6 MB / 5.6 MB (17) — the same +4.2 MB |
| rm-209 | 7.9 MB / 2.4 MB (17) | 12.6 MB / 4.9 MB (17) | 12.7 MB / 4.9 MB (17) — of which **9.1 MB is `history.bin`**, parsed by the worker before the war window can draw |

(The water file arrives *after* the first paint — a window asks for it once its land is on the screen — so it adds to the bytes and to the time to *settle*, not to the time to first paint; the settle is 9 s on this desktop runner.)

**What the first window was doing for 4.7 s** (`.claude/profile-atlas-worker.js` runs the geometry worker's own code in Node; the browser agrees to within the noise): reading the file and the unit vectors 0.26 s; LOD 0 0.48 s; LOD 1 0.73 s; **LOD 2 3.5 s** (1.36 M triangles); 4.9 s in all. Phase 4's hub was "ready" only when the worker said `done` — after LOD 2 — although a window can draw from LOD 0 (the renderer falls back to the nearest coarser level that is loaded, which is what the Atlas page does while it zooms).

**What Phase 4b changed, and what each change bought** (desktop, geo-002, cold / warm, medians; every row is on top of the one above):

| change | cold / warm first paint |
|---|---|
| `173302b` | 4,696 / 4,677 ms |
| **the hub is ready at LOD 0, and a window redraws as the finer levels arrive** (`E.levelReady`, `landSettled` asks for the level its zoom wants; the coarse frame is within half a pixel at the zoom of a state and a pixel or two at a locator's) | 1,505 / 676 |
| **the first level and the header are kept in IndexedDB** (the worker's own output for LOD 0, ~2.6 MB; key `CORE_CACHE_REV`; the hub reads it while the file travels) | the warm hub is ready in 90 ms instead of 760 |
| **the hub is created at idle** (`AtlasEmbed.warm`, skipped under `lightMode()`; disposed after a minute with no window) and **the first frame is drawn at half resolution** with no outline pass, the full frame following within 140 ms | for a reader who has been on the site 4 s: **200 / 195** |
| the worker lets a `history` message run at its next yield instead of after LOD 2 (the water, tiles and layout still wait for the levels) | a war window: 6,699 / 6,950 → 2,838 / 2,653 |
| the retry that redrew an unsettled window every 400 ms → a 2.5 s safety net (the hub's `onChange` is the mechanism) | on a CPU ×4 phone the redraw (a 600 ms full frame) had been running back to back and starving the worker's own messages |

**What the remaining time is** (desktop, warm, window opened at once; `performance.mark("a2:…")` in `atlas-windows.js` and `atlas-embed.js`): the engine's bundles evaluated ~40 ms; the hub created (the controller's DOM, a WebGL2 context, the shaders) ~100 ms; the cached level read and uploaded ~90 ms; **the first frame ~330 ms on SwiftShader (40 ms setting the view up, 190 ms the GL work itself, 80 ms the outline pass — the pass is now deferred and the first frame is drawn at half resolution)**. V1's 2D canvas does the same job in 150–200 ms. That is the floor on this runner, and it is a software rasteriser's: on a GPU the frame is a few milliseconds and the hub's creation and the IndexedDB read are what is left.

### The Task 2 targets, as measured

| target | map card (geo-002) | locator (rm-003) | war (rm-209) |
|---|---|---|---|
| warm first paint at least **3×** faster than `173302b` — desktop | 6.9× ✓ | 8.4× ✓ | 2.6× ✗ |
| — phone | 2.76× ✗ | 3.1× ✓ | 1.05× ✗ (the history file) |
| **cold ≤ 1.5× V1** — desktop, card opened at once | 9.3× ✗ | 11.5× ✗ | 10.6× ✗ |
| — desktop, reader sat on the site 4 s | **1.34× ✓** | 4.2× ✗ | 8.5× ✗ |
| — phone | 0.94× ✓ | 0.13× ✓ | 1.76× ✗ |
| **warm ≤ 1.5× V1** — desktop, card opened at once | 3.4× ✗ | 3.1× ✗ | 5.2× ✗ |
| — desktop, reader sat on the site 4 s | **0.97× ✓** | 1.8× ✗ | 4.1× ✗ |
| — phone, card opened at once | 2.9× ✗ | 5.3× ✗ | 116× ✗ (the history file) |
| — phone, reader sat on the site 8 s | **0.41× ✓** | **1.4× ✓** | not measured |
| a placeholder block of the final size within 300 ms, no layout shift (`test-atlas-windows.js` §1) | ✓ (17 ms) | ✓ | ✓ |
| the card's text never waits for the engine (§1) | ✓ | ✓ | ✓ |

**The limit, stated.** The ≤ 1.5× targets cannot be met *when the card is opened at once and the engine has never been touched*, on this runner, and the reason is measured rather than guessed: V1 draws a 2D canvas in 150–200 ms from data it fetched in the same breath; the engine has to create a WebGL2 context and its shaders (~100 ms), bring a level to the GPU (~90 ms from the cache, 760 ms the first time ever), and then run a software rasteriser over the first frame (~130 ms at half resolution). What closes the gap is not in the window code but in *when* it starts: a reader who has been on the site for four seconds already has the hub (the idle warm-up), and then the first window is 200 / 195 ms against V1's 149 / 202. The cases that stay out of reach: a locator with a reader who has not yet been on the site (497 / 310 ms: the locator's frame needs LOD 2 (500 m) and the rivers' request), and **every war window**, which needs the 9.1 MB history file parsed before it can draw anything.

**Options weighed and rejected, with what was measured:**

- *A windows-only lite topology* (the LOD levels and faces a window can show, built by the pipeline with a checker and a sources header). For a first frame only LOD 0 is needed: 97,951 of the core's 917,243 vertices (10.7 %) and 5,995 of its 35,225 arcs, which is about 255 KB of vertex data at the format's 2.6 bytes a vertex, the 72 KB header and the arcs and faces — **about 0.4 MB against 3.0 MB**, and a parse of ~25 ms instead of 260 ms. It would take roughly 230 ms off a never-warm desktop hub and, on a compressing host, cut the bytes before first paint from ~2.6 MB gzipped to ~0.4 MB (V1's first window is 1.1 MB gzipped, so on a real phone's cold start it is the one option that changes the ratio from 2.4× to under 1). **Not built**: it needs a writer-model conversion of the reader's output, a load path in the worker, and a checker proving the lite level equals the full file's byte for byte — a task of its own — and in the tool's raw-bytes terms the phone's cold start is already at parity with V1 (0.94× for the map card, 0.13× for the locator). *The owner's call, with the real-phone reading.*
- *Parsing lazily per face or tile.* Rejected: the renderer's levels are whole-world bucketed lists; a partial level needs the tiles' stencil machinery for the resident levels, and once the hub is ready at LOD 0 and the windows refine, the LOD 2 triangulation (3.5 s) is no longer on a first window's path.
- *Decoding into typed arrays the worker can transfer.* Already the case (every buffer in a worker message is transferred).
- *A war-window slice of the history file.* **Not built, and the largest single lever left for war windows**: of the 3,043 faces in `history.bin`, 443 (14.6 %) are alive in the middle year of any of the 51 wars (29,680 of 102,443 arcs, 87,451 of 473,340 vertices) — a slice file would be about **1.5 MB against 9.1 MB**, and a war window's cold phone start would fall from 67 s (V1: 38 s) to about the locator's.



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
| 393, 394, 397 | a click on the map opens no panel and no popup; the canvas claims its touches (`touch-action: none`) | W | same (and `test-atlas-windows.js` §2: a tap does nothing before the reveal **or after it** — amended Oct 2026, "Phone fixes" below: only the globe button opens the Atlas) |
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
| 340–342, 345 | a legend names both sides, says which won, sits outside the locator block; the canvas says it in words | W (markup) | same, and **§4: the window itself names the two sides on the map** (Phase 4b also drew a one-line legend over the foot of the map; **removed Oct 2026**, "Phone fixes" below — the one legend is the key under the window) |
| 349, 350, 351, 354 | the window draws; the victors in green, the defeated in red, in comparable measure | W | same |
| 364, 368, 369 | Second Sino-Japanese War: China green, Japan red; the window frames the war; ready | W | same (over http; on `file://` the window falls back to V1, see below) |
| 386, 389, 392, 406, 411 | the v1 Personal Atlas page (`#map`): both sides in the war's years and none outside; a click opens the war's card; the popup keeps the legend | W (the v1 *page*, not a card window) | unchanged until Phase 5; the v2 Atlas's counterpart is `test-atlas-render.js` (Rome victor, Carthage loser in 216 BCE; the tint ends with the years) |
| 414 | no console errors | W | same |

### Find it (`test-minigames.js`, 19 W rows in the `[fi]` and `[fi-atlas]` blocks) → `test-atlas-embed.js` §6

1163, 1313, 1314 (five rounds, in order) → "deals the same five as v1's board"; 1209, 1216, 1219, 1226 (a tap picks, "Guess", Clear) → the pick / Clear rows; 1248, 1257 (a wrong guess spends a try and says how far) → "N km away — one more try!"; 1262 (a correct second guess counts) → "a second try that is right counts as FOUND"; 1320, 1322 (a state is on the Full Atlas in its year; a country on today's map) → the cartouche rows; 1323, 1329 (every round played; the game ends with a score) → the score-line row; **1264, 1324, 1326, 1327 — v1 had no twin in Stage A; Phase 4b adds them**: after two tries there is no third (Next showing, Guess gone); a country round ends on its own panel with a way to its place on the Atlas; a state, a people or a place ends on a list of its cards, each a link to the card's own address. *This is a different ending from v1's* (v1 opened its country panel and card stack in the page); the v1 learn panels (`showCountryPopup`, `showMinePopup`) are not built on the engine's board — **a Stage B decision for the owner**.

### What is left without a counterpart (Stage B blockers)

None among V1's window assertions. Two **behaviours** are not tests but gaps, and are listed with the readiness table in `docs/atlas-v2-design.md` §7 "Phase 4b": (1) **`file://`** — a war window falls back to V1 (the history file's `file://` twin is still the 2a pilot slice, 11 entities; `startCardWindow` now checks that the loaded history carries the war's sides and otherwise keeps V1's window), so deleting V1's window path would leave a war card on a `file://` page with no map; (2) **Find it's v1 learn panels**, above.

### Phase 4b, Task 6 — primitive budgets with a state selected (`.claude/measure-atlas-holes.js`, 1280×800, the frame gate's views; main → branch)

| view | state | triangles | segments | draws | interior in the selection colour |
|---|---|---|---|---|---|
| globe | Texas | 42,908 → 42,679 (−0.53 %) | 19,917 → 19,917 | 30 → 36 | not on screen |
| Europe | Kaliningrad Oblast | 190,074 → 187,359 (−1.43 %) | 116,657 → 116,657 | 30 → 34 | 95.0 → 95.0 % |
| Aegean | — | 26,759 → 26,759 | 24,800 → 24,800 | 8 → 8 | — |
| Aegean at the cap | — | 33,451 → 33,451 | 27,878 → 27,878 | 11 → 11 | — |
| Colorado, 3 km/px | Colorado | 171,221 → 152,317 (−11.04 %) | 57,368 → 57,368 | 29 → 40 | 95.6 → 100.0 % |
| Texas, 6 km/px | Texas | 57,774 → 57,774 | 37,145 → 37,145 | 37 → 48 | 89.2 → 100.0 % |
| Texas, 1 km/px | Texas | 35,177 → 35,177 | 10,550 → 10,550 | 9 → 13 | 95.7 → 100.0 % |
| Siberia, 12 km/px | Sakha (Yakutia) | 207,214 → 207,214 | 114,291 → 114,291 | 79 → 80 | 94.7 → 100.0 % |

No view grows in triangles or segments (limit +5 %); the second bucketed list costs up to eleven more draw calls. The window-only fix is not needed.


---

# Phase 4c — what Stage B still needed (labels, rivers, the war slice, Find it's learn panel)

The as-built note is `docs/atlas-v2-design.md` §7 "Phase 4c". The preview switch is still OFF by default and V1's windows are still the default. These are the tables that belong with the inventory above. **Every timing is headless Chromium on SwiftShader (the CPU rasterises) and, for the phone profile, CDP throttling that does not slow the worker; every phone figure is ONE run on this runner** (the desktop figures of 4b were medians of three; these are single runs, so read differences under ~15 % as noise). No real GPU, no real phone.

## The first window again (`.claude/measure-atlas-embed.js`, this runner, V1 re-measured beside the engine)

First paint after the window mounted, **cold / warm cache, in ms**. "4b" is the 4b table above; "4c, at once" is the card opened the moment the page loads; "4c, after idle" is a reader who has sat on `#home` 4 s (desktop) / 8 s (phone) first, so the idle warm-up has made the hub.

| card | profile | V1 | engine 4b (at once) | engine 4c, at once | engine 4c, after idle |
|---|---|---|---|---|---|
| geo-002, map card | desktop | 128 / 128 | 1,391 / 677 | 1,040 / 542 | **131 / 144** |
| geo-002 | phone | 30,162 / 443 | 28,332 / 2,392 | 28,833 / 1,657 | **285 / 288** |
| rm-003, locator | desktop | 81 / 106 | 1,351 / 520 | 1,105 / 549 | 256 / 265 |
| rm-003 | phone | 37,385 / 336 | 4,676 / 1,890 | 4,522 / 1,603 | 3,049 / 498 |
| rm-209, war | desktop | 239 / 205 | 2,838 / 2,653 (same runner today: 2,387 / 2,112) | **1,403 / 1,261** | 613 / 481 |
| rm-209 | phone | 37,984 / 516 | 67,754 / 92,098 (same runner today: 69,211 / 90,485) | **19,614 / 2,432** | 11,403 / 1,205 |

Bytes the first window costs, cold, as served / gzip -9 (KB as the tool prints them): geo-002 V1 3,939 / 1,150, engine 8,341 / 5,616 (4b: 8.1 / 5.5 MB); rm-003 V1 8,138 / 2,488, engine 8,768 / 5,766; **rm-209 V1 8,138 / 2,488, engine 4b 12,972 / 5,053, engine 4c 5,815 / 3,314**. For a map card or a locator the largest single piece is `water.bin` (4,355,748 B, 3,007,783 gzipped), fetched for the rivers after the land is on the screen; it is the same file at either river density.

**The Task 8 targets, re-read** (ratios of the engine to V1, same runner; ✓ = at or under the target):

| target | map card (geo-002) | locator (rm-003) | war (rm-209) |
|---|---|---|---|
| warm first paint ≥ 3× faster than `173302b` — desktop | 8.6× ✓ | 7.9× ✓ | **5.5× ✓** (was 2.6× ✗) |
| — phone | **4.0× ✓** (was 2.76× ✗) | 3.7× ✓ | **39.8× ✓** (was 1.05× ✗) |
| cold ≤ 1.5× V1 — desktop, at once | 8.1× ✗ | 13.6× ✗ | 5.9× ✗ (was 10.6×) |
| — desktop, after idle | **1.02× ✓** | 3.2× ✗ | 2.6× ✗ (was 8.5×) |
| — phone, at once | 0.96× ✓ | 0.12× ✓ | **0.52× ✓** (was 1.76× ✗) |
| warm ≤ 1.5× V1 — desktop, at once | 4.2× ✗ | 5.2× ✗ | 6.2× ✗ |
| — desktop, after idle | **1.1× ✓** | 2.5× ✗ | 2.3× ✗ (was 4.1×) |
| — phone, at once | 3.7× ✗ | 4.8× ✗ | 4.7× ✗ (was 116×) |
| — phone, after idle | 0.65× ✓ | 1.5× ✓ | 2.3× ✗ |

What is left is the same floor 4b named for the desktop (a WebGL2 context, the shaders and a software rasteriser against V1's 2D canvas) plus, for a locator, the water file and the finest level, and, for a war, the slice's parse. **The lite first-level topology was not built (the owner's decision 4); the war slice was** (below).

## Rivers in windows (decision 2) — before and after (`.claude/compare-window-rivers.js`)

The default is the Atlas's own density for the window's zoom; a card whose subject is water gets one resident level finer where one exists — **which cards is decided in `build-card-faces.js` (Stage B, item 1) from the places registry's kind for the locator's place (river, lake, sea, ocean, strait, gulf = a bay), written to `ATLAS_CARD_FACES.water`**: 30 locator cards, 23 by the registry kind, 2 by a declared river or sea kind where the card has no resolved place, **5 by the name fallback** (rm-043, rm-999, wh-092, wh-094, wh-744 — a point locator with no resolved place whose name has lake / bay / strait / sea / river in it); the old name test of this phase is gone from the window; under the data saver (`S.settings.saveData` or `navigator.connection.saveData`) a window draws no rivers or lakes and does not fetch the water file.

| window | view | V1 (km) | 4b: one level finer everywhere (km, × V1) | 4c (km, × V1) |
|---|---|---|---|---|
| geo-002, Texas (a map card) | 6.7 km/px, level 1 | 35,542 | 38,305 (1.08×) | **17,371 (0.49×)** — the Atlas's density |
| rm-003, the Tiber (a river locator) | 2.4 km/px, level 2 | 3,996 | 2,595 (0.65×) | 2,595 (0.65×) — already the finest resident level |
| wh-064, Lake Toba (a lake locator) | 13.3 km/px, level 1 | 19,585 | 23,476 (1.20×) | 23,476 (1.20×) — water card, finer |
| gr-001, the Aegean Sea (a sea locator) | 2.6 km/px, level 2 | 4,548 | 2,079 (0.46×) | 2,079 (0.46×) |

Bytes: unchanged by the decision — the coarse and the fine level are one file (`water.bin`, 4,355,748 B as served, 3,007,783 gzipped, fetched after the land). That is why "never fetched under the data saver" means *the file is not fetched* there. `test-atlas-windows.js` §5.

## The war-window slice (decision 3) — `atlas/data/history-wars.bin` and `build-war-slice.js`

| | `history.bin` | `history-wars.bin` |
|---|---|---|
| bytes / gzip -9 | 9,096,400 / 2,431,916 | **1,755,600 (19.3 %) / 646,819** |
| entities / steps / faces / arcs / vertices | 233 / 3,159 / 3,043 / 102,443 / 473,340 | 148 / 587 / 572 / 34,091 (286 kept for a junction only) / 104,303 |
| `file://` twin | `history.bin.js` 1.06 MB — the 2a pilot slice (11 entities), no war has faces in it | **`history-wars.bin.js` 2.35 MB** — every war works |

It keeps every state alive in each war's display year (the middle of its years, the one `atlas-windows.js` computes), less the presence layer and the front, and every step over the war's years of each side's entities; the checker (`build-war-slice.js --check`, CI's fast job) compares 856 state faces and 432 side steps with the full file at all three levels, including the moved junctions of own arcs — **a cut without the 286 junction arcs fails it** (Pontus's face at the coarse levels), which is how the rule was found. The four `file://` twins together are 13.25 MB against the owner's 12 MB rule of Phase 1d (three twins then): a decision for him, held at 13.5 MB in the checker.

War window, the second Punic War (rm-209), same runner, 4b → 4c: desktop cold 2,387 → 1,640 ms, warm 2,112 → 1,299 ms; phone cold 69.2 → 19.4 s, warm 90.5 → 2.6 s (a 1.7 MB file is cached by a headless context; the 9.1 MB one was not); bytes served cold 12,972 → 5,809 KB (gzip 5,053 → 3,312).

## Find it's learn panel — v1's popups and their engine counterparts (Task 3; `test-findit-learn.js`)

| what v1 held after an answer | where | on the engine's board |
|---|---|---|
| a country: its name (the full official name), "New discovery!" on first sight, the general prose (no figures, no "(Language: name)"), per-year prose (switched off), the figures grid, sources | `showCountryPopup` | the name (the short one: "Russia" for v1's "Russian Federation"), "New discovery!" from the same `placesSeen` register exactly when v1's chip showed, the prose through `sanitizeHTML` (1,885 characters against v1's 1,893 for Russia, 554 / 554 for Libya); **not rebuilt: the figures grid, the sources fold, the full official name** |
| a state, a people or a place: the card(s) about it, "1 of N cards", swipe or arrows through the answers | `showMinePopup` | the place card's list of cards (`AtlasStudy.cardsFor`: the reader's own first, the cap of 8 and "and N more", the collection chip, "studied"), N equal to v1's N, each a link to `#card/<id>`; **not rebuilt: swiping through the cards' answers inside the panel** (a card is one tap away) |
| the Next button under the question; Escape and the × closed the popup | | a Next button in the panel (and the one under the question), a close button, Escape |

## What a Stage B would delete from `app.js`, measured

`wc -c app.js` is 3,930,319 (4b's head: 3,930,014; +305 B for `atlas2StudyHost()`, the context's two fields and the slice's names). The fallback — no WebGL2, a refused bundle, `#map2?preview=0` — has to keep v1's window and v1's Find it until Phase 5 replaces them with the engine's Canvas 2D path, so **Part 2 deletes next to nothing from `app.js`** (the switch's gate, ~0.3 KB, replaced by the inverse switch). What the fallback keeps, and what Phase 5 then deletes:

| what | size | stays until |
|---|---|---|
| `startCardGlobeV1` (`app.js` 34634–35813) | 86,543 B | Phase 5 |
| Find it's game mode in `PAGES.map` (`finditPools` … `gameEnd`, 46185–46530) and `drawGameMarks` | ≈ 24.6 KB + 4.9 KB | Phase 5 |
| `hiresCoastIngest` and `hiresRiverIngest` (34454–34487) | 2,122 B (and the `CMAP_*` tables beside them) | Phase 5 |
| the five `coast/*.js` bundles and `rivers/greece.js`, `rivers/italy.js` (lazy, never on the eager path) | 1,367,513 B + 138,966 B | Phase 5 |


## Relief in windows (2026-10-18) — the Atlas's switch and strength, followed by every map card, locator and war window

The owner (2026-10-18): "if relief is turned on in the personal Atlas, it should also be on in the Atlas windows, at the opacity the user set." The setting is the Legend's own, already persisted by the Atlas page in `localStorage` (`folio_atlas2_layers_v2`: `relief`, `strength`); nothing new is stored. `atlas.js` exports `AtlasV2.layersStored()` (the page's `loadLayers`) and `setLayers` sends an `atlas2:layers` event on `window` after every save. `atlas-embed.js` `reliefSetting()` reads it once and caches; the event (same document) or a `storage` event (another tab) clears the cache and redraws every live window, so **a window reads the setting when it opens and follows a change while it is open**. `atlas-windows.js` `reliefNow()` puts `relief: true, strength` on the window's spec when the setting is on AND relief is allowed — not under light mode (`S.settings.saveData` or the browser's save-data hint) and not on a cellular connection (`navigator.connection.type === "cellular"`), the idle warm-up's own two rules, since the L0 sheet alone is 9 MB. `atlas-embed.js` `setup()` turns the hub's `layers.relief` / `strength` on for that draw; the controller's `plan()` then does what the page does — `startRelief()` (relief.json, the L0 sheet) and the L1 patches of the window's view below 6 km/px — lazily, on the first draw that asks; `tilesSettled()` already waits for them, so the window settles when its relief is in and redraws as each patch arrives.

**The mask passes draw no relief.** The outline's mask pass (`outline`: the shape white on black, read back) and `landMask` run with `view.relief.on` off and put it back after: with relief in the window the hillshade lit the black land and the mask read the mountains as the shape (the first relief-on shot of Texas had the gold outline round the Rockies and the Sierra Madre), and a shadowed slope would punch a hole in the land mask.

**Where it stays off.** Find it: its specs never ask (its pixel tests read exact tints, and a hillshade would change them). The Canvas 2D fallback (`atlas-canvas.js`): it has no relief at all — `setup()` leaves `layers.relief` off on a `canvas2d` hub; the window is the same as before. With the setting off nothing changes: no relief file is requested and a window's bytes and first paint are what they were (`test-atlas-neutral.js` §3 asserts zero relief requests and an identical picture).

**Measured** (`.claude/measure-atlas-embed.js geo-002` and `--relief`, this session's software GL): see the row the thread's report quotes; the relief-on figures include relief.json, the three L0 planes (9.3 MB as served) and the L1 patches the view needs.

## Stage B, item 2 — the idle warm-up and the connection

The idle warm-up (the engine's code, `topology.bin` and the hub, 60 s; `app.js`) does not run under the browser's save-data hint, Folio's light mode, **or `navigator.connection.type === "cellular"`** (`onCellular()`, where the browser reports it — Chromium on Android; Safari and Firefox do not, and are not held back). The first window then pays when a reader opens one (`test-atlas-windows.js` §10: the control warms, the three constrained cases fetch no engine code, no `topology.bin` and no `water.bin`, wifi and a browser with no connection API warm as before, and a cellular reader's window is still the engine's). `water.bin` is not part of the warm-up at all: a window asks for it after its land is on the screen.


---

# Phone fixes (Oct 2026) — what the owner found on a real phone after the Stage B flip

The as-built note is `docs/atlas-v2-design.md` §7 "Phone fixes". Two owner decisions and three faults; one suite, `test-card-windows-fixes.js` (`FOLIO_ENGINE=v1` runs its v1 twins), guards all five; its before / after numbers are in the design note.

- **Taps never navigate (decision 1).** Nothing a reader does to the map itself — tap, double tap, click, drag, pinch, wheel — opens the Atlas, on a map card (revealed or not), a locator or a war window. The window's globe button is the one way in; it keeps its deep link (view, year, `&war=`), the keyboard route (Tab to it, Enter) and Back to the same card with its reveal state. The tap path (`onTap` in `startCardWindow`, `openFromWindow` in `atlas2Ctx`) is gone; `atlas2OpenFromWindow` serves the button only. **A map card has no globe button** (the Atlas would name its answer), so it no longer links to the Atlas at all.
- **One legend on a war window (decision 2).** The pill drawn over the foot of the map is gone, and with it `legend()` on the window's host API; the legend is the plain-text key under the window (`cardWarKeyHTML`). The two principal sides' names stay on the map. The pill's "· N states" count and "approximate extent" wording went with it.
- **The outline of the shaded place through a gesture.** A gesture frame skipped the whole mask pass (`o.fast` in `atlas-embed.js` `draw`: a second render, a read-back and two filters, 60–140 ms on a CPU rasteriser), so the outline vanished for the whole of a drag or a pinch and the 140 ms after each move (a wheel zoom was never fast, so it kept it). The full frame's mask is now also kept as the shape's **rim** — its edge pixels, at most 5,000, as unit vectors on the sphere — and a gesture frame projects and stamps them with its own view: no render, no read-back, the outline exactly on the shape; no glow until the full frame, within 140 ms of the last move. It was not a gesture-time degradation stage (the hub has no frame loop) and not the second face pass (gone since 4b).
- **War labels on their own ground.** The worker answers `face-anchors`: a point inside each of the side's faces in the war's display year, a pole of inaccessibility of the visible part at the level the view draws, with up to twelve more points inside. `atlas-windows.js` places the two names jointly on the first points with room (frame, zoom controls, each other), beside the point only when nothing else fits, and keeps the point as a point on the sphere through a pan. A side with no face in the display year (a gap in the source) keeps the centroid, `ground: false`.
- **A side's name stands on its PRINCIPAL ENTITY's home piece (Oct 2026).** A polity's face is several rings — Rome in 209 BCE is Italy, Sicily and a strip of North Africa that an ally held — and the name used to go to the biggest piece on screen: "Rome" over inland Algeria, "Carthage" over its Spanish holdings, "Italy" (ww2-042) over Italian Africa, "Japan" over Manchuria, Rome in 173 BCE (wh-349) over Spain. Each side of `atlas/data/wars.js` now has `p`, its PRINCIPAL entity: the one entity its name stands for (`lib/war-resolve.js` `principalOf`: the only entity; else the one whose label is the name; else whose label holds every word of it; else whose label begins with its first word; none for "Allied powers" and "Byzantium and Sasanian Persia", which keep the largest-face rule). `warSidesOf` (atlas.js) adds `pface` (that entity's face in the display year, -1 when it has none: England and Normandy in 1076, Ethiopia in 1936, the Ardiaean kingdom, the Six States in 225 BCE) and `pcap` (its capital of the year from the history header's `cities`, Wikidata P36). The window asks the worker's `face-anchors` for the principal's face with `near` = the capital, and `histPole` searches only the piece of the face (`pieceNear`: an outer ring and the rings nested in it) that holds the capital, else the nearest piece, else the whole face. Only the principal's points are candidates (`labels()` says `principal: true`); a principal with no visible point falls back to the side's biggest face. Measured on all 56 windows (112 names): 104 of 104 names whose principal has a face in the year stand on it, at 1100 and at 390 px (the other five sides have no face that year or no principal, and keep the first property). Against the previous build 24 names moved at 1100 px (18 by more than 100 km) and 25 at 390 px (19): one was on ANOTHER entity's face (ww2-042 "Italy", on Italian Africa, now in Italy), the rest on a remote piece of their own — "Rome" in 16 Roman wars, "Carthage" in 3, "Japan" in 3 (in ww2-100 it stood in Manchuria), "Arabia" in 1. Windows with allies on both sides: only ww2-001 (Allied vs Axis powers, no principal on either: unchanged); allies on one side: wh-349, ww2-100, cnh-188. `test-card-windows-fixes.js` section 2 asserts it, plus rm-209 (Rome on the peninsula, Carthage on the African coast) and ww2-042. Screenshots: `docs/atlas-v2-phase4-shots/<card>-<desktop|phone>-principal-before|after.png`. Changing `atlas-worker.js` changes `CORE_CACHE_REV` (`check-core-cache.js --install`).
- **Locator names by the label engine's rules.** Every mark and the zoom controls are ground no name may cover; names are placed in priority order, each at the first of eight places (and a second ring) round its mark that is clear; one with none is dropped, the card's own names never.

**Found, not fixed.** (1) Four war sides have no face in the war's display year in the pinned history, so the window tints nothing for them: England and Normandy (wh-504, 1076: the source has England 1066–71 and from 1210), Ethiopia (ww2-042, 1936) and the Ardiaean kingdom (rm-237: `pol:illyria`, none in 224 BCE). (2) The mask pass's cost on a CPU rasteriser is a second full render: the rim is why a gesture does not pay it.


## The war window's timeline (2026-10-19) — and wars leave the Atlas page

**The owner's two decisions.** (1) The Atlas page (`#map`) draws no war: no victor or loser tint, no front line, no wash, no war legend text, no Wars switch, no "open a war from a card" state; `atlas.js` keeps the war machinery for the hub only (`time.warFocus`, `warRoles`, `warFrame`, `warSides`, `warTimeline`, `setWindowFront`), `loadWars()` runs only on a hub (`EMBED`), a saved `wars` / `fronts` in `folio_atlas2_layers_v2` is dropped on read, an address's `&war=` is ignored and the go button no longer writes it. `test-atlas-no-wars.js` fails on the pixels, the legend and the wire if any of it returns. (2) Under each war window, a timeline of only the war's own years.

**Which wars get one** (`node .claude/war-timeline-inventory.js`; 56 wars, 37 with a timeline, 19 without): a war whose picture has two or more DATED STEPS. For every war but one the steps are its CHANGE YEARS (the years of the war in which the faces of its two sides — each member inside its own window, the authored extent in the war's years — differ from the year before; Cliopatria dates a state to the year, so there is no month); for the one war that owns the front line (the front entities' `cards`: the Second World War, `ww2-001`) they are the front's PLATE DATES (93 distinct dates, 31 Aug 1939 – 15 Aug 1945, each YYYYMMDD, so each carries a month). The 19 without: a war whose sides never change a face in its years (the Third Punic War, the Social War, the Norman Conquest…) or whose only side is one static authored extent (the three Messenian wars, the Sicilian Expedition): nothing would move.

**What the reader gets** (`mountTimeline`, `atlas-windows.js`, `.war-tl` in `styles.css`): a slim rail directly under the window, inside `.card-loc`; step-back, play/pause and step-on buttons; a pin that snaps to the steps; the war's first and last year at the rail's two ends; under the pin the step's month and year ("Jun 1944") where it has a month, else its year ("202 BCE"; a CE year bare from 1000). The pin opens at the step nearest the card's own date when the card's date line names ONE year inside the war, else at the war's last step (no war card names one: every window opens at the last). Moving the pin changes the SAME window's spec (`year`, `front`, `frontDate`) and calls `win.schedule()`; the hub is not recreated, nothing is reloaded; `data-map-year` follows, so the globe button opens the Atlas at the pin's year. It is a slider (`role=slider`, 1 to N, the value text carries the date and the step), the arrows, Home, End and the page keys move it, a press on the rail snaps to the nearest step, play steps on (800 ms, 380 ms from 60 steps) and pause holds, it follows Text size (`--fs`) and wraps to 360 px. A window that is the plain sentence (no WebGL2, the bundle refused) has none.

**The front line has its own slice (2026-10-19).** The war slice carries no front entity (they are 40 % of `history.bin`'s vertices: 305 faces, 51,439 arcs, 189,413 vertices). Until 2026-10-19 the window of a `WAR_FRONT_CARDS` card (`ww2-001`) therefore read all of `history.bin` (9.1 MB, on a phone too) and on `file://` fell back to the year steps with no front. It now reads `atlas/data/history-ww2.bin` (**4.69 MB**, its gzip twin 1.77 MB; `build-ww2-slice.js`, `histKind` "ww2": `hubOptions.needHistory = "ww2"`, the spec's `history: "ww2"`): all 93 plate dates (138 plates) and their months, the 87 state faces alive in the years of the plates (1939–1945) and the war's sides in 1937–1945. A hub that began on the war slice is replaced for it, and a ww2 hub for the next war window, when no other window or pending window is on it (`ensure`'s `ownHolds`); with a window still open the hub stays and the newcomer takes what it has (a war window on a ww2 hub whose war is not in the slice prints the plain sentence). The engine draws the front in the window through `setWindowFront(on, date)` (the page's old front entities, `FRONT_WASH`, the plates in the header); `frontShown` is true only then. A hub asked for a window of no war lets the front go with the war. `test-war-timeline.js` §1 proves `WAR_FRONT_CARDS` equals the front entities' `cards`; `test-ww2-slice.js` proves the window loads no file larger than the slice and never `history.bin`, on http and on file://.

**What the slice simplifies, and why it is only 51 %.** The window's closest zoom is not smaller than the Atlas's: zoom is capped at `CMAP_ZMAX` 400 (app.js), the radius is 0.46 × the canvas's short side × zoom and the canvas is at most 340 px tall (`.mc-canvas`'s `clamp`), so the closest view is 6371.0088 / (0.46 × 340 × 400) = **0.1018 km per CSS pixel** (0.133–0.137 km/px at the real 253–260 px canvases), against the Atlas's cap of 0.15. Half a pixel there is **51 m**, under two of the file's 28 m quanta, so only the front's SOFT arcs (the line a plate drew: 99,167 → 60,383 vertices, 39 % fewer, 2,459 of 6,316 arcs touched) are simplified, per level (Douglas–Peucker on each level's polyline, endpoints moved with the level as the engine moves them, coarser survivors forced) and nothing else may move: the front's bytes are mostly the 445,851 rings of its 312 faces — 425,043 of them a held island's single coast arc, repeated in every plate it is held in — and the 45,123 coast pieces they walk, which a half-pixel rule cannot drop because the window can zoom onto any of them. The simplification alone saves 0.15 MB (4.84 → 4.69). **What 3 MB would cost** (measured on the unsimplified cut, 4.84 MB): dropping every front island under 1 / 5 / 25 / 100 km² gives 4.09 / 3.54 / 3.22 / 3.08 MB (twin 1.79 / 1.71 / 1.67 / 1.65 MB) — that is a visible change at the closest zoom (a small held island is no longer tinted), not the half-pixel rule, and it is the owner's call. `compare-ww2-slice.js` renders all 93 plates both ways (default view and zoom 400 on the front line) and prints the pixel difference per plate; `--baseline` renders the whole history twice and shows the renderer is deterministic (0 pixels). **Measured 2026-10-19, all 93 plates, both views (390 px phone, 1×): at most 21 visible pixels of 80,454 (0.026 %) at the default view and 45 of 142,800 (0.032 %) at zoom 400, median 8 and 6** (a pixel is VISIBLE when its three channels differ by more than 24 in all; no plate is pixel-identical at the default view, 24 of 93 are at zoom 400; the difference is single pixels along a line's edge, where one vertex less moves a triangle's edge by under half a pixel); the stated tolerance is 50 visible pixels per plate per view (`--tol`, the tool's default), and `--baseline` (the whole history twice) measures 0 of 0.

**Limits, plainly.** (1) A war window's other states come from the slice: the states alive in the war's DISPLAY year (the middle of its years) plus the war's own sides in every step; at another step a bare neighbour that was not alive in the display year has no border drawn (a plain state has no fill since 2026-10-18, so nothing but a border is missing). (2) The year steps are the sides' territorial steps, a front only in the sense of a changing territory; the Second World War is the one war with plates. (3) The Second World War's window opens from its own 4.7 MB slice (it was the whole 9.1 MB history) and on `file://` has its front from the slice's twin.
