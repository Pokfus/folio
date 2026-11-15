# Atlas v2 — a lazy admin-1 layer (design, 2026-10-30; steps 1 and 2 built 2026-11-14, step 3 2026-11-15 — §8)

> **📖 READ BEFORE ADDING A COUNTRY'S STATES OR PROVINCES TO THE ATLAS, OR BUILDING ANY PART OF THIS.** The design for
> giving more countries their states and provinces — shaded in a map card's window and drawn on the Personal Atlas —
> **without rebuilding `topology.bin`**. India (`geo-india`, 📖 `docs/india-geography-card-plan.md`) is the first country.
> Steps 1–3 of §6 are built for India (§8); step 4, the next country, is a spec row and a rebuild of this file alone.

## 1. The owner's requirements (2026-10-30)

1. More geography collections will come, each with the country's states or provinces as map cards.
2. **They must all show properly on the Personal Atlas** — a studied state outlined and named, exactly as a studied US
   state, Chinese province or Russian federal subject is today.
3. Adding a country later must be cheap: not a rebuild of the Atlas.

## 2. Why not the two obvious routes (measured)

**Admin-1 inside `topology.bin`** — what the US, China, Russia and the UK have (`ADMIN1` in `build-admin.js`, Q-A7 (a)).
Adding a country means `build-admin.js` and `pack.js` again, and every other generated file is pinned to the core's
`buildId` (`history.bin` and both war slices are refused by `atlas-worker.js` on a mismatch, `water.bin` names its land
build, the IndexedDB core cache is keyed by `CORE_CACHE_REV`). A trial on 2026-10-30, every country's admin-1 against a
baseline of today's four, both on the same OSM coast (the baseline came within 0.03 % of the committed files):

| | baseline (4 countries) | every country |
|---|---|---|
| admin-1 units | 173 | 4,273 |
| `build-admin.js` | ~15 min | ~43 min |
| `out/full.bin` | 18.10 MB | 20.35 MB |
| vertices at the three resident levels (what every visitor loads) | 2.22 M | 2.56 M |
| the core's header (the entity table, inside `topology.bin`) | 69.5 KB | 683 KB |

…and `pack.js` **failed**: two units (Kalkara, Malta; Duarte, Dominican Republic) left rings mixing resident and tile-only
arcs, and with those set aside, tiling Greenland's face failed. So "every country" costs every Atlas visitor about a
megabyte more at first load (estimated: the pack never finished) — and **CI caps the core at 3,145,728 bytes**
(`check-topology.js --max-bytes`, the fast job) against today's 3,018,212, so it would fail that gate outright — and pipeline repairs of unknown extent; "one country at
a time" costs a whole-Atlas rebuild per country. Neither meets requirement 3.

**An outline file the card window paints itself** (as a locator's authored `area` is painted, `paintMasked`) shades a
state in a window but **cannot meet requirement 2**: the Personal Atlas draws only engine entities.

## 3. The design: a second history-format file

**`history.bin` already is a lazy file of states laid onto the core**, and the engine already draws it on the Personal
Atlas and highlights it in card windows:

- `build-history.js` reads the committed `topology.bin` (never `out/`) and conflates each polygon onto the core's land
  partition: coast and present-day border arcs are SHARED by reference (`coreRef`), only the lines the core does not have
  are the file's own arcs. So its states meet the coast and the country borders exactly, at every level.
- `atlas-worker.js` `handleHistory` checks the core's `buildId`, then triangulates a face lazily per level into an LRU.
- `atlas.js` `aliveShown` filters the year's alive set to the reader's discovered entities in the Personal Atlas.
- Card windows already highlight history entities by id (a glossary window's state at its greatest extent, a members
  window's groups: `needHistory: "full"`, `highlights: [{ ids }]`).

**So: `atlas/data/admin1.bin`, a file in `history.bin`'s format, of present-day admin-1 units, conflated onto the
committed core by the same machinery.** Adding a country is a row in a spec and a rebuild of THIS file alone, against the
core as it stands. `topology.bin`, the tiles, water, relief, history, the slices and the core cache never change.

### 3.1 The file

- **Built by `.claude/atlas-build/build-admin1.js`** from **Natural Earth 10m admin-1** (`ne-10m-admin1`, already pinned,
  public domain), writing `history.bin`'s format (`coreRef` arcs into the core, own arcs for the rest) so the engine reads it with the
  code it has. **How it conflates — read 2026-10-30, and the recommendation:** `build-history.js`'s `conflate()` cannot
  simply be called. It is top-level code over globals (the arc, face and entity registries, the strip index, the snap
  log), takes Cliopatria rows (`prepareRow` reads GeoJSON features and `geometry-fixes.json`), and its tolerances are
  Cliopatria's (`TOLERANCE_M` 15 km, `D1`/`D2`/`D3`, the nesting and contest rules). Moving it into a shared `lib/` module
  would put `history.bin` at risk: the refactor has to be proved byte-identical by a `--no-cache` rebuild of the whole
  history. **Recommended instead: a smaller builder for a smaller problem.** Admin-1 units TILE their country, and the
  country's outline is already in the core from the same source (India: every admin-1 vertex within 1 km of Natural
  Earth's admin-0). So the job is not conflating free polygons onto a coast. It is SPLITTING one core face by the units'
  shared interior lines: (1) take each pair of neighbouring units' shared boundary from the source; (2) snap its two
  ends onto the core's boundary of the country face (a tolerance measured, of the order of the 1 km above); (3) walk the
  core face's rings plus those lines into faces; (4) label each face by the unit containing an interior point;
  (5) simplify the own arcs per level (`LOD_M`, as the history does). It reuses `lib/rings.js`, `lib/segindex.js`,
  `lib/geo.js` and the format writer, and copies nothing of `conflate()`. Islands (Lakshadweep, the Andamans) are the
  core's own island faces, labelled whole; enclaves (Puducherry's four) are the same step 4.
- **Rows from `.claude/atlas-build/admin1-spec.json`**, one per country: its ISO alpha-3, the units' DECLARED English names
  and kinds (Natural Earth's `type_en` is wrong on several Indian units, as its names were on Russian ones — the Russia
  plan's rule), and any recorded correction. A country's whole set of units must tile its admin-0 face, checked (India:
  every one of 32,884 vertices within 1 km of Natural Earth's admin-0 India, measured 2026-10-30).
- **Entity ids are the core's scheme**: `adm1:<a3>:<iso code>` (`adm1:ind:in-up`), kind `admin1`, `parent` the core's
  `adm0:` id, with `qid` and `iso`. One step each, `[PRESENT_YEAR, null]` (2022, the core's own present).
- **The header carries `sources`** (Natural Earth admin-1) **and `core.buildId`**; `build-credits.js --install` follows.
- **A `file://` twin** (`admin1.bin.js`) within the existing 12 MB total for twins.
- **A checker**, `check-admin1.js`, in `check-history.js`'s style: the core's build id, every core reference valid at
  every level, each country tiled by its units, no unit outside its parent, ids unique, the spec and the file in step.
  It joins the fast CI job, and so does `build-admin1.js --check`.
- **Size is measured in step 1, not guessed here.** India alone is 32,884 source vertices; conflated, most of its outer
  border is the core's own arcs, so only the inner lines are new.

### 3.2 The engine

- **A second slot in the worker.** Today `HIST` is ONE file: the page's history, or one of the two war slices, and a hub
  on the other slice is replaced. The new file needs its own slot (`ADM1`) held beside `HIST`, through the same code: the
  file reader, the `buildId` check, the lazy per-level triangulation and its LRU, the per-arc style table. The work is
  making those take a slot rather than reading the global, then sending the meshes and segments tagged by slot.
- **When it loads.** Never at boot. (a) The Personal Atlas, when the studied set holds an `adm1:` id that is not in the
  core's entity table (the light `card-places.js` index says so without loading the cards). (b) A card window whose
  card-faces row names an `admin1.bin` entity (`hubOptions.needAdmin1`, alongside `needHistory`). (c) Map, Personal and Full,
  through the legend's **Provinces** switch (§7, decided): when it is on, the year is the present and the view is zoomed in
  past `ADMIN1_KM_PER_PX` (4 km/px) over a country the file carries — the moment the core's own admin-1 lines appear today.
- **The present day.** At `time.present` the page draws only the core's faces today, and the Personal Atlas's present-day
  filter (`refreshPersonalPresent`) keeps core faces whose entity, or whose parent, is discovered. It gains the slot's
  faces and inner lines, by the same rule: a discovered state's face and its border, its name at the face's label point.
  The inner lines take the core's admin-1 line style, so an Indian state looks like a Russian one.
- **The card windows.** `build-card-faces.js` resolves a layer's keys against the core's entity table today; it gains
  `admin1.bin`'s table, and a window whose target is there asks for the slot and highlights by id, as today.

### 3.3 Places, the studied set and the registry

- **A card's `places` names the entity** (`adm1:ind:in-up`), exactly as `gru-` cards name `adm1:rus:ru-sve`, so studying
  it discovers it. `.claude/places-registry.js` (the gazetteer, `places.js` and the history entity table) gains
  `admin1.bin`'s table, so `add-places.js`, `check-places.js` and `build-card-places.js` accept the ids.
- **Search and names**: the history file's entities become synthetic rows (`G.byId`) when it loads; the slot does the
  same. Whether Map and Full also SEARCH Indian states before the file is in is part of Q1.

## 4. Budgets and gates

- **Every existing gate stays green unchanged**: the land files byte-identical (nothing in §3 touches them), the frame
  gate (`test-atlas-perf.js`) on the page as it is, the heap budget (`HEAP_BUDGET_MB`).
- **New**: the file's own size budget, set from step 1's measurement; the worker's mesh memory — the slot's LRU shares
  `HIST_LRU_BYTES` or has its own, decided and measured in step 2; the frame gate re-run with Indian states drawn in
  the Personal Atlas, and a new Personal case.

## 5. Risks, stated

- **Small units.** The trial's pack failures were tiny units (a Maltese local council, a Dominican province). India has
  small ones too: Chandigarh, Delhi, Puducherry's four enclaves, Lakshadweep's islands. The history conflation has its
  own sliver and chord rules; step 1 runs them on India and the checker says what survives.
- **The worker's single-file assumption may run deeper than `HIST`** (the main thread's `time.hist`, `time.ents`,
  `stepsOf`, the style texels are all one file's). Step 2 starts with an inventory of every place that assumes one file.
- **A country the core already carries** (the US, China, Russia, the UK) stays in the core: two sources for one state
  would be two entities with one id. Moving them would be a decision of its own, never a side effect.

## 6. Steps, each its own PR

1. **The file, India only**: `admin1-spec.json` with India's 36 units, `build-admin1.js`, `check-admin1.js`, the twin,
   the credits. Report: size, build time, what the conflation changed. Nothing in the site reads it yet.
2. **The engine slot and the card windows**: the worker's second slot, the window path, the India layer in
   `build-card-faces.js` (+ the capitals' dot table, coordinates FETCHED), `CARD_MAP_LAYERS`, `add-card.js`'s
   `MAP_LAYERS`, `test-map-cards.js` and a window test. **From here the India states and capitals decks can be written.**
3. **The Atlas page at the present day**: the file's states under the legend's Provinces switch in Map, Full and
   Personal (D1: every line in Map and Full, a discovered state's in Personal), the registry ids, a Personal suite case,
   the frame gate over India zoomed in.
4. **The next country** is a spec row and step 1's rebuild — the test of requirement 3.

## 7. The owner's decisions (2026-10-30)

- **D1 — the legend owns it, in all three views, on by default.** Map, Personal and Full draw the states as an option in
  the legend, switched on by default. That switch EXISTS: the legend's **Provinces** (`DEFAULT_LAYERS.provinces: true`,
  `view.admin1` in `atlas.js`), which draws the core's US, Chinese, Russian and UK lines at the present day below
  `ADMIN1_KM_PER_PX`. The file's states join it — **one switch for every country's states, whichever file they come
  from**, the saved `provinces` key unchanged so no reader's setting is lost. Map and Full draw every state line of the
  file's countries; Personal only a discovered state's (§3.2). Being on by default does not make the file load at boot:
  it loads the first time the switch is on, the year is the present and the view is zoomed in over one of its countries
  (or a Personal Atlas holds one of its ids, or a card window needs one). Whether the switch's label should become
  "States and provinces" now that it covers India's states and union territories is a wording call for step 3 — **decided in step 3
  (2026-11-15): the label reads "States and provinces"** (§8), the saved key still `provinces`.
- **D2 — the first build is India alone.** `admin1-spec.json` starts with India's 36 units; step 4 adds the next country.

## 8. As built (2026-11-14): steps 1 and 2

**Step 1 — the file.** `node .claude/atlas-build/build-admin1.js [--extract] [--dry] [--install] [--check]` (§3.1's smaller builder; nothing of
`conflate()` is copied). Inputs: `admin1-spec.json` (India's 36 units in the card plan's order: declared name, kind, CURRENT ISO code and the
Wikidata item that carries it, the English Wikipedia title, the recorded corrections), `admin1-source.json` (the committed extract of the units'
quantised rings from the pinned `ne-10m-admin1` zip, written by `--extract`, so `--check` runs offline in CI) and the committed `topology.bin`.
Output `atlas/data/admin1.bin`: **55,296 bytes** (budget 400 KB), 36 entities, 36 faces, 298 rings, 479 core references and 73 own inner lines;
its gzip twin `admin1.bin.js` is 54 KB and the five `file://` twins together are 10.89 MB of 12. Build time ~7 s. Header: `kindOf: "admin1"`,
`core.buildId`, `sources` = the core's own blocks for `ne-10m-admin1` (PD), `osm-land-polygons` (ODbL — the file references the OSM coast, so it
is listed under the credits page's ODbL statement, as `history.bin` is) and `ne-10m-admin0` (PD); `generated: null` (deterministic). No `jpos`
section: the reader's `junctionAt` fallback is exact for a junction on one core segment.
- **What the conflation did** (printed by every build): 12,519 inner edges of Natural Earth chained into 72 lines; 73 pieces kept on the core's
  land and 16 off it; 23 loose ends carried to the core's boundary, the median 16 m and the largest **4.25 km** (the Tamil Nadu–Andhra Pradesh line
  at Pulicat Lake, whose lagoon shore OSM draws inland of Natural Earth's; the next is 1.24 km), so `EXTEND_M` is 5 km and a loose end farther
  than that stops the build; one self-crossing untwisted (a one-quantum bow-tie in Yanam's ring); 90 faces — islands OSM draws and Natural Earth
  does not — labelled by the nearest unit (the farthest 33 km, an Andaman islet); two zero-width core rings kept with their unit.
- **Corrections recorded in the spec**: the four ISO codes ISO 3166-2:IN changed in 2023 (`IN-CG`, `IN-OD`, `IN-TS`, `IN-UK`; `ne` names Natural
  Earth's old code), the Wikidata items of Delhi and Chandigarh (Natural Earth names the cities), the kinds; and **Natural Earth's "Mahe" ring is
  dropped** — it lies 35–50 km north of Mahe at 14 times its area — so Puducherry is drawn as three enclaves and Mahe's land is Kerala's until an
  open outline is pinned.
- **A known source fault NOT corrected** (`knownFaults`): Natural Earth still draws the Telangana–Andhra Pradesh line of before 2014, so Telangana
  is about 1,100 km² too large and touches Odisha along 47 km; the neighbour sentence leaves the pair out, and a card must not say they border.
- **`check-admin1.js`** (CI's fast job, beside `build-admin1.js --check`): the header, the spec row for row, every core reference well formed (every
  junction within 0.0 m of its core segment), every ring closing at all three levels through `historyArcGeometry`, India tiled exactly by its units
  (every core arc of `adm0:ind`'s face covered once in the face's direction, every inner line used twice, areas equal to 0.04 ppm), every inner
  vertex inside India, every label point in its face, every seat of `admin1-capitals.json` in its unit (Chandigarh, the seat of Punjab and Haryana,
  in the union territory it is), no crossing at LOD 2, coarse crossings under 40 (1 at level 0), the twin and the twin budget.

**Step 2 — the engine slot and the card windows.**
- **The worker's second slot**: `ADM1` beside `HIST` in `atlas-worker.js` (`slotOf`); `handleHistory`, `handleHistoryFaces`, `histLevel` and
  `histGeom` take the slot; every message about it carries `slot: "adm1"` and an error is prefixed `admin1:`, which the page turns into the slot's
  failure, never the Atlas's. `CORE_CACHE_REV` was re-installed.
- **The main thread** (`atlas.js`, "THE ADMIN-1 SLOT"): `ensureAdmin1()` fetches the file (its twin on `file://`) once; the 36 faces are asked for at
  all three levels as soon as the header is in (they are small); `view.admin1Layer` is the draw list. **The GL renderer** keeps a second mesh table
  and second style and arc tables (`setAdmin1Mesh`, `setAdmin1Style`, `setAdmin1ArcTable`) and draws them with the history's own passes
  (`drawHistoryFills` / `drawHistoryBorders` take the slot): each face's fill at its tint's alpha (none: bare), its coast stroke at the tile zooms
  in the tint's colour (so a small island — Minicoy — is shaded at a card's zoom), and, while the Provinces layer is on, the file's own inner lines
  in the core's admin-1 line style. The page never calls `ensureAdmin1()` yet (step 3).
- **The windows** (`atlas-embed.js`, `atlas-windows.js`): a highlight id `adm1:…` the core does not carry starts the slot, tints its face through the
  slot's style table and outlines it with the same mask pass (the slot's face white, everything else black); the hub's history is untouched, so a
  war window and an India window share one hub. The still renderer (no WebGL2) has no slot: such a window is the plain sentence, as is a window
  whose file could not be read.
- **The India layer**: `india-states` in `build-card-faces.js` (keys = the spec's names, rows from admin1.bin's entities with Natural Earth's own box
  and label point; 34 seats from `admin1-capitals.json`, **coordinates fetched from Wikidata on 2026-11-14**, the source block
  `wikidata-admin1-seats` CC0; the neighbour lists exact, from shared inner lines), `CARD_MAP_LAYERS["india-states"]` in `app.js` ("state or union
  territory"), `MAP_LAYERS["india-states"]` in `add-card.js` (read from `card-faces.js`, and a seat outside its unit by fact accepted with a
  warning), `test-map-cards.js` §1 (the layer's 36 keys, 34 seats, Chandigarh) and `test-atlas-windows.js` §10 (all 36 units shaded and settled,
  one fetch of admin1.bin and no history file, **Lakshadweep framed whole is pixels**: a card on it sets its own `map.zoom`, and at 150 its island is
  shaded; the Punjab capital window draws Chandigarh outside the shape).
- **From here the India states and capitals decks can be written** (gin-001–036, gin-501–536). Not built: the registry ids (`places-registry.js`),
  the page's Provinces switch over India, the Personal Atlas and its frame-gate case — step 3.

## 9. As built (2026-11-15): step 3 — the Atlas page and the registry

- **When the page loads the file** (§3.2 (a), (c)): `plan()` calls `ensureAdmin1()` the first time `view.admin1` holds (the switch on, the present,
  under `ADMIN1_KM_PER_PX`) while the view's lon/lat box meets a box of `ADMIN1_FILE_BOXES` in `atlas.js` (`overAdmin1File`; India
  `[68, 6.5, 97.5, 35.5]`); `refreshPersonalPresent` calls it when the Personal Atlas holds a flag-2 `adm1:` id whose country is in that table, at
  any zoom. Never at boot, never over another country (both asserted). The table is guarded: `check-admin1.js` ("boxes") fails when a country of
  the file has no box or a vertex of its units (own arcs and every referenced core arc) lies outside it — step 4 adds a row there with the spec row.
- **Map and Full** (D1): every inner line of the file while `view.admin1` holds, in the core's admin-1 line (the history's border pass over the
  slot, `drawHistoryBorders`), and no fill pass at all (`fillFaces: []`); nothing of the slot is handed to the renderer otherwise, so the existing
  frame-gate views pay nothing. Measured at India 2 km/px: 27,852 slot border segments a frame (every face's border list at level 2, the core-ref
  pieces discarded by the arc table).
- **Personal** (D1, §3.2 "the present day"): a unit is kept when it or its country is flag 2 (the core's own admin-1 rule). A kept face is drawn
  with the BARE alpha (stencil only, no colour) BEFORE the empty-land darkening (`beforeDim`: in `atlas-gl.js` the page's slot fill moved ahead of
  `drawHistoryDim`; a window's tinted slot fill keeps its old place after the presences), so it is plain land while the rest of an undiscovered India
  is the darker empty land; at the tile zooms its coast stroke marks the stencil too. Its inner lines (while `view.admin1`) are only the kept faces'
  border lists — a line is drawn when a kept unit lies on a side. Its share of India's international border is drawn from the slot's OWN reference
  segments (the kind-1 pieces of its border list), in the border ink, by a second pass of `drawHistoryBorders` with a second arc table
  (`refTable`, `R.setAdmin1RefTable`), at every zoom. Adding the referenced core arcs to the core's arc mask was tried and dropped: the mask is by
  whole arc, and the India–Nepal arc ran 800 km past Uttar Pradesh through the empty land. A past year draws none of the file. With no kept unit the Personal Atlas draws nothing of it, though the file may be in.
- **Names**: the worker turns each unit into an ordinary `admin1` gazetteer row once both files are in (`adm1Rows`: the file's `faceAnchor`, rank by
  `build-gazetteer.js`'s area bins + 3, room = √area km), so the same rules apply as for a Russian subject: the switch, `view.admin1` and
  `MIN_CHORD_PX` in Map and Full, flag 2 only in Personal, never in a past year. The main thread adds the same units to `G` (`adm1GRows`, `src:
  "admin1"`) so a placed name, a tap on it, the popup and the **search** know them — Q1 decided: the search finds an Indian state only once the
  file is in (it is not fetched for a keystroke). A deep link `#map/…/adm1:ind:…` opens the place only once something else has fetched the file
  (not built: such links have no writer yet).
- **Not built**: a tap on the LAND of an Indian state (the whole-state selection, §12 of `test-atlas-popups.js`) — the slot is never in the ID pass,
  so the land under a tap is India's core face; a tap on the state's name opens its popup. The still renderer (no WebGL2) has no slot, as in step 2.
- **The registry** (§3.3): `places-registry.js` reads `admin1.bin` (`readAdmin1`, source `"admin1"`, kind `admin1`, `at` the label point, `within` the
  core country; `loadRegistry({ admin1: false })` leaves them out), so `add-places.js`, `check-places.js` and `build-card-places.js` accept
  `adm1:ind:<iso>`. Loading them changed no generated file (`check-places.js` 31 ok). No card names one yet; `card-places.js` was not rebuilt.
- **The wording call** (D1): the legend's switch reads **"States and provinces"** — it is the one switch for the US's and India's states, India's union
  territories, China's provinces and Russia's subjects; "Provinces" alone mislabelled the first two. The saved key stays `provinces`.
- **Tests**: `test-atlas-admin1-page.js` (new: the lazy fetch, Map and Full's lines and names, the switch / zoom / year, the search, Personal with
  Uttar Pradesh discovered — plain land inside it, empty land in Madhya Pradesh, its name alone, fewer segments than Map — and a reader with none;
  the Personal reader's index entry is extended in the test, as no card names an Indian unit yet); `test-atlas-perf.js` gains two gesture cases at
  India 2 km/px, Map and Personal (Uttar Pradesh discovered, a context of its own), each held to the worst-frame and drag-release rules.
- **The frame gate in the session that built it** was NOT a clean reading: four cores at load average 5–8 from other sessions' browser suites, and
  the suite's unchanged cases failed too (the globe drag 1.71 % of frames over 100 ms, the Full Atlas 2.39 %). India Map read 0.66 % (12 of
  1,822; p90 49.9 ms), India Personal 0.12 % (2 of 1,640; p90 33–50 ms), both release rules green. An A/B under the same load (India 2 km/px, the
  switch on against off, four alternations of the drag) read p90 33.4 against 33.3 ms and 6 against 4 frames over 100 ms of ~1,800: the slot's
  lines cost nothing measurable. CI's frame-gate job is the reading that counts.
