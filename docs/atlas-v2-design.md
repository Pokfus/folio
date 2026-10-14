# Atlas v2 — design from the goal

*Status: DESIGN APPROVED 2026-10-06 — every question in §6 is answered (answers recorded there); §2–§4 are revised to match; §7 is the phased build plan. Building starts in later threads, phase by phase. No code is written for it yet. When the answers
are in, §2–§5 are revised and a phased build plan is appended as §7.*

This document designs the Atlas again from what it is for. It takes the existing research as input
(`docs/atlas-borders-audit.md` and its three notes, `docs/atlas.md`'s fault ledger, the data
inventory of October 2026) but not the existing architecture. Everything here was checked against
the repository on 2026-10-06; numbers that are estimates are marked as such.

The owner has allowed, for this rebuild only: a vendored, openly licensed library copied into the
repo as a plain file **where the design justifies it**; any Node library in the offline
data-generation scripts. Remote scripts, npm at runtime and a build step for the app remain
forbidden.

---

## 1. What the Atlas is for — the reader's experience, as scenarios

**1.1 The first visit.** A reader who has studied twenty cards on Ancient Greece opens the Atlas.
The globe is already turned to the Aegean because that is where their places are. The year sits
at the last year they looked at, or at the median year of their cards if they never have. They see
a plain earth with relief off: land, sea, lakes, the major rivers, a quiet graticule. On it, in
one colour family, are *their* places: Athens and Sparta as city marks, Marathon as a battle mark,
Attica as a region name in small capitals with no dot, the Aegean as a water name in italics, the
island of Delos as an island name. Nothing on the globe is a thing they have not studied; nothing
pretends to be a point that is not one.

**1.2 A drag.** They drag the globe. It turns at the speed of the finger with no stutter and no
"settle" — labels and borders move with it, every frame, on a mid-range phone as well as on a
laptop. Letting go gives a short glide. Nothing redraws in two stages, nothing pops in late.

**1.3 A zoom.** They pinch in on the Peloponnese. The coast resolves — headlands, bays, the islands
of the Saronic Gulf — smoothly at every stop, without a moment where a straight polygon edge shows.
Rivers appear in order of size; smaller places and smaller islands gain names as room appears; a
name never sits on another name. Pinch out and the detail folds away in the same order.

**1.4 The timeline.** Along the bottom runs a year rail. They drag the pin from 500 BCE towards
300 BCE. As it passes 480 the Persian satrapies on the far shore are there; as it passes 338 the
Macedonian border swallows the city-states; at 334 it moves east, year by year, as far as the
source records. Every change is a clean step at the year the source gives, with a brief crossfade;
nothing slides or morphs between years, because no source says what happened in between. The rail
marks, as small ticks, the years in which *something on screen* changes, so the reader can step to
exactly those. Press play and it runs at a chosen speed.

**1.5 A click.** They tap Macedon. The territory lifts slightly, its border brightens, and a card
opens — the same card standard as everywhere on the site: a titled information card with a dated
summary, figures where they exist, citations as numbered footnotes, and under it "From your cards":
the cards that put this place here, flippable in place. If several things sit under the finger
(Macedon the state, the Thracians as a people, the Axios river), a small stack says "3 here" and a
second tap cycles. On a phone the card is a bottom sheet; on a desktop it is a side column.

**1.6 Peoples.** At 450 BCE the Scythians lie across the northern Black Sea shore and the Bosporan
Kingdom sits on the Kerch strait inside that same area. The kingdom is a filled territory with a
crisp border and a small-capitals name. The Scythians are not a territory: they are a soft-edged
field of stippled texture with no border line, and their name is set in spaced italics along the
long axis of the field. Both are readable at once; neither hides the other; a toggle in the
legend turns peoples off.

**1.7 Uncertainty.** At 1200 BCE, the Shang. Its edge is not a crisp line but a dashed one with
a fading fill, and the card says in one sentence why ("extent reconstructed from site finds;
sources disagree"). Where two accepted sources disagree about a border, the ground they agree on
is solid and the ground they disagree on is hatched and labelled as disputed. Where there is no
source for a year at all, there is no border — plain land — never a guess.

**1.8 Relief.** They switch on relief. The land takes on shaded terrain, lit from the north-west,
with hypsometric tints that follow the site theme. It costs nothing noticeable; borders and labels
stay crisp above it. They switch it off again.

**1.9 The Full Atlas.** The second tab shows every place on the site. Thousands of places do not
appear as thousands of dots: at globe scale the map shows countries, the largest states of the
year and a few dozen of the highest-ranked places; everything else arrives as they zoom. A
collection filter lets them see only Rome's places, or only wars.

**1.10 From a card.** On any card with a place, a small globe window shows that place in the
card's year, drawn by the same engine with the same borders; a tap on it opens the Atlas there,
at that year.

**1.11 Accessibility.** Without a pointer: arrow keys turn, plus and minus zoom, square brackets
step through the years where something changes, Tab walks the named places on screen and Enter
opens the card. The year and the selected place are announced. With "reduce motion" on there is
no glide, no crossfade and no auto-play.

**1.12 Offline.** A reader who has visited the Atlas once has the core map offline through the
PWA; a "keep offline" button also stores relief and the detail tiles for the regions their own
places are in.

---

## 2. Technical design

### 2.1 Architecture in one picture

```
                 ┌─────────────────────────────────────────────────────────┐
  cards,         │  atlas/atlas.js (lazy code bundle, vanilla JS)          │
  glossary,  ──▶ │  scene · input · timeline · popup bridge · a11y list    │
  books,         │        │                      ▲                         │
  progress       │        ▼                      │ layout results          │
                 │  atlas/atlas-gl.js       atlas/atlas-worker.js          │
                 │  WebGL2 renderer         triangulation (earcut),        │
                 │  fills · lines · relief   label layout, PA derivation,  │
                 │  ID pass · sphere         year→style tables             │
                 │        ▲                                                │
                 │  Canvas 2D overlay: labels, markers, ink                │
                 └─────────────────────────────────────────────────────────┘
                          ▲                 ▲                 ▲
                   atlas/data/topology.bin  tiles/{z}/{x}/{y}.bin   relief/*.png
                   (arcs · faces · steps)   (coast/river/lake detail) (hillshade+height)
                          ▲
                 .claude/atlas-build/*  (Node: mapshaper, topojson, polygon-clipping, earcut…)
                          ▲
                 sources.json  — every input pinned by URL, version, sha256, licence
```

The Atlas becomes its **own lazy code bundle** (`atlas/`), not 5,600 lines inside `PAGES.map` in
`app.js`. The eager path loses roughly half a megabyte of raw JS that only Atlas visitors needed.
Card windows (map cards, locator windows, war shading) use the same engine, so there is exactly one
renderer and one geometry. `app.js` keeps a thin `PAGES.map` that loads the bundle and hands it the
root element, the hash parameters and the reader's state.

### 2.2 Rendering: WebGL2 for geometry, Canvas 2D for type, DOM for chrome

**Decision: WebGL2 for everything geometric; a Canvas 2D layer above it for labels and markers;
ordinary DOM for the popup, legend and timeline.** Reasons, in order:

1. *The lag today is CPU geometry per frame.* The measured frame times of the current Atlas in a
   headless Chromium (a laptop-class CPU, no GPU acceleration) were: dragging the Full Atlas,
   p50 16.7 ms but **p90 150 ms, p99 217 ms, max 300 ms** (40 of 171 frames over 50 ms); scrubbing
   the timeline p90 50 ms, p99 100 ms; JS heap 262 MB. The cause is structural: every frame
   re-projects tens of thousands of vertices in JavaScript, re-walks ring chains, and composites
   several offscreen canvases; the settled frame does label layout and relief reprojection per pixel
   on the CPU. No amount of caching removes the per-frame projection.
2. *On the GPU, projection is free.* Every vertex is uploaded once as a unit vector on the sphere.
   The orthographic projection is a 3×3 rotation and a scale — one uniform. A million vertices a
   frame is routine for a 2019 mid-range phone GPU. The horizon is a per-fragment test (`z < 0 →
   discard`), exact and free.
3. *Time becomes a lookup, not a geometry change.* With all years' arcs resident on the GPU, changing
   the year uploads a small style table (which faces exist, which arcs are borders). Scrubbing costs
   the same as a still frame.
4. *Picking is exact.* An ID pass renders every face, arc and marker in a unique colour to an
   offscreen framebuffer; a tap reads one pixel. No point-in-polygon code, no "a region's dot is the
   false claim".
5. *Canvas 2D keeps type crisp and themed.* Text rasterised by the browser, with the site's fonts and
   the theme's hex colours, is better than any GPU text. A few hundred labels per frame is ~1–2 ms.

**Why not Canvas 2D alone (today's choice, done better)?** Because the Full Atlas at high
resolution is 300k+ coast vertices and 500k+ polity vertices across years, and the user asked for
detail growing with zoom. Canvas 2D paths are re-tessellated by the browser every frame; that is a
CPU cost proportional to visible vertices and it is exactly what fails on a phone. WebGL moves that
cost to upload time.

**Why not DOM/SVG?** Hundreds of thousands of path nodes are not an option on a phone.

**Why not a vendored map engine (MapLibre GL)?** It is 800 KB of minified JS, needs its own tile
protocol and style spec, has no notion of a year, and would be the largest file on the site. The
renderer this design needs is small (estimated 1,500–2,500 lines) because it has exactly four
primitives: sphere, faces, arcs, points.

**Vendored runtime libraries (each justified):**

| file | licence | size | why |
|---|---|---|---|
| `atlas/vendor/earcut.js` | ISC | 22 KB (3.0.1, as vendored in Phase 0) | Robust polygon triangulation with holes. Writing one is a known swamp; earcut is the reference implementation (used by MapLibre, deck.gl). Runs in the worker only. |
| nothing else | | | The orthographic projection is ten lines; a TopoJSON client is not needed because the wire format is this design's own binary (§2.3), and d3-geo's clipping is replaced by the GPU's horizon discard. |

**The draw list, per frame** (all static buffers, uniforms only):

1. *Sphere pass* — one full-screen triangle. The fragment shader intersects the view ray with the
   unit sphere: outside → transparent (the page shows through; the limb's anti-aliasing comes from
   the ray-sphere distance, not from geometry); inside → lon/lat → ocean colour, graticule, optional
   relief lookup (§2.7), limb darkening and a halo, all in one pass. No DOM gradient divs. The
   graticule is a legend toggle (Q-V3 c), off by default, remembered per reader.
2. *Face pass* — indexed triangles for every face alive in the current year, one `drawElements`
   range per face (200–400 calls; trivial). Colour comes from a per-face style texture
   (fill, alpha, uncertainty flag, selected flag). Peoples' faces draw in a second sub-pass with the
   stipple pattern computed in geographic space so it rotates with the globe.
3. *Arc pass* — instanced quads, one instance per segment at the current LOD level. The vertex shader
   extrudes the segment to a screen-space width; the fragment shader anti-aliases with a signed
   distance and applies dash patterns from the arc's cumulative length (uncertain borders dashed).
   Style per arc (coast, border, border-selected, river by order, lake shore, hidden-this-year) from
   a per-arc style texture.
4. *Point pass* — instanced discs/squares for markers that need to be in the ID pass (cities,
   battles, sites). Their visible drawing is on the 2D layer; the GL pass is for picking only when
   the 2D layer is not authoritative — in practice markers are picked from the label layout's rects
   first and the ID pass second.
5. *ID pass* — only on tap/click (and on hover at most once per frame): passes 2–4 again into an
   offscreen 8-bit RGBA framebuffer with IDs as colours; one `readPixels`.

**Frame budget.** Target 60 fps on a 2021 laptop and a 2020 mid-range phone (Snapdragon 7xx class),
30 fps floor on a 2018 budget phone. Budget per frame: GPU ≤ 8 ms (sphere+relief 1–2 ms, faces ≤ 2 ms,
arcs ≤ 3 ms at LOD for the view, points < 0.5 ms); CPU ≤ 4 ms (uniforms, label canvas redraw of
≤ 250 labels, hit rects). Devices with `devicePixelRatio > 2` render the GL canvas at 2 and let the
browser upscale; MSAA 4× via the context attribute. Label layout (§2.6) and triangulation (§2.3) run
in the worker and never block a frame. Year changes upload ≤ 64 KB of style tables.

**The frame gate (owner's redefinition, 2026-10-08).** Phase 0's gate — "p95 ≤ 20 ms on the CI
runner with software GL" — measured SwiftShader rasterising tens of thousands of triangles on four
CPU cores, not a reader's phone, and its as-built note (§7) said so. The gate `test-atlas-perf.js`
asserts from Phase 1a on is: (1) v2's p95 frame interval is at most **40 %** of v1's p95 on the same
run, for drag, wheel and pinch — a relative measure, so a slower or faster runner moves both sides;
(2) the worst frame during drag and pinch is at most **100 ms**; (3) a deterministic **primitive
budget**: `__atlas2.statsNow()` reports the triangles and line segments the renderer drew in the last
frame, and four fixed views (the globe, Europe, the Aegean, the Aegean at the zoom cap) must stay
under budgets stored in the test and justified in §2.3 "as measured" — so a change that doubles what
a view draws fails in CI rather than on a phone. The `#map2?perf` overlay (frame mean, p95 and max
over the last 120 frames, primitive counts, LOD, tiles) is what the owner reads on a real phone; if
that reads under about 50 fps, the fallback is option (c) of the Phase 0 note — rasterise the fills
into a texture once per year change and keep only the lines as geometry. It is not built until it
is needed.

**Workers.** The CSP already allows `worker-src 'self'`, so `atlas/atlas-worker.js` is an ordinary
same-origin file. On `file://`, where browsers refuse workers, the same module runs on the main
thread behind the same message interface (a 2-line shim); triangulation then costs a visible
~1 s once at first load and ~50 ms at each year change — acceptable for a dev convenience.
`OffscreenCanvas` is not required.

**Context loss** is handled: all GPU buffers are rebuilt from the typed arrays kept in memory.
**No WebGL2** (very old devices, some privacy settings): the Atlas renders a static orthographic
Canvas 2D fallback at LOD 0 only, with a sentence saying so — see question Q-R3.

### 2.3 Geometry: one planar topology, shared arcs, coast-snapped faces, LOD per arc

**Data model.** The whole political and physical map, for every year, is **one planar topology**:

- **Vertices**: unit-sphere positions (stored as quantised lon/lat, expanded on load). Estimated
  300k–400k distinct vertices in the core file.
- **Arcs**: polylines between junctions. Each arc has a `kind` (coast, land border, river, lake
  shore, soft edge), an `id`, cumulative length, and **per-LOD segment ranges** (§ LOD below).
- **Faces**: a face is a list of signed arc references (TopoJSON-style). A face is a *polity step*:
  "Rome, 218 BCE – 212 BCE, these arcs". Faces of neighbouring polities in the same year reference
  the **same arc** with opposite sign, so the border is one line by construction — it cannot overlap
  or gap. Faces of the same polity in consecutive steps share every arc that did not move, so the
  14× vertex redundancy of `polities.js` disappears.
- **Steps**: `(entity, from, to, face)` rows, sorted; a year's map is the set of steps with
  `from ≤ y ≤ to`. Years are signed integers (BCE negative), inclusive, exactly as today.
- **Entities**: polity, people, culture, region, island, river, lake, sea, city, site, event — the
  taxonomy of §2.6 — each with a stable id (slug), a Wikidata QID where one exists, and a span.

**Coast snapping** is a property of construction, not a runtime patch. The land/sea partition is
built first from one coastline source at the finest resolution. Each polity step from Cliopatria (or
another accepted source) is then *conflated* onto that partition:

1. Vertices of the polity polygon within distance *d*₁ of the coastline are projected onto the coast
   arc; runs of the polygon that follow the coast are replaced by the coast arcs between the two
   projection points; islands wholly inside the polygon take their complete coast rings. The result's
   boundary is coast exactly where it should be and never a second line a few kilometres inland.
2. Land borders of *neighbouring* polities in the same year that run within *d*₂ of each other are
   merged into one arc (the two sources' lines are averaged, or the higher-precision one wins);
   slivers and gaps below an area threshold are assigned to the adjacent face with the longest shared
   edge. This is what makes neighbours share a line.
3. Historical borders within *d*₃ of a present-day border are snapped to the present-day
   high-resolution arc ("border inheritance": the Pyrenees in 1200 is the Pyrenees in 2024). This is
   how coarse source geometry gains resolution honestly — the line is where both sources put it.
4. *d*₁–*d*₃ depend on the source's stated precision (Cliopatria rows: ~10–15 km; traced plates:
   ~20 km; present-day admin sources: 1 km). Every snap is logged; the build fails if a snap moves a
   vertex by more than the source's tolerance.

**One coastline source for all levels of detail.** The failure today — Natural Earth at 1:10M
spliced into a 2-decimal `world.js`, with five regional patch files and four rounding regimes — comes
from mixing sources. The new topology takes *one* coastline at the finest level and simplifies it
per LOD with a topology-preserving simplifier (mapshaper's Visvalingam with intersection repair), so
every level is the same lines with fewer vertices, shared endpoints intact. Candidates, decided by
Q-S1: OpenStreetMap land polygons (ODbL, metre-scale, current), GSHHG 2.3.7 "full" (LGPL,
~100–200 m), Natural Earth 10m (public domain, ~1 km). The recommendation is OSM; the licence
consequence is that the *topology data files* carry ODbL and OSM attribution, which the audit's
rule already permits for a file of its own.

**Rivers and lakes** are arcs and faces in a topology OF THEIR OWN (`water.bin` and the water tiles,
decided in Phase 1b so the land files stay byte-identical) and are *not* used as borders (sources
place borders along rivers at their own precision; forcing a snap would invent). **HydroRIVERS is not
a source**: its licence failed §2.10a when read on 2026-10-08 (the finding is in `sources.json` under
`blocked` and in §7 "Phase 1b — as built"). Rivers come from **Natural Earth 10m rivers and lake
centerlines, the scale-rank edition (PD)**, one record per river per scale rank, so LOD is a filter on
scale rank — the great rivers at the globe, the rest from LOD 1–2 — with names, NE ids and Wikidata ids
for Phase 1c; the build joins tributaries to their main stems, snaps mouths to the OSM coast and ends to
lake shores (distances measured, §7), and splits every river at its junctions so the worker can smooth
it (Chaikin, two passes, endpoints fixed) past LOD 2, where the 1:10M chords (1.8 km at the median)
would show; rivers are not drawn below 0.35 km/px. Lakes come from HydroLAKES (CC BY 4.0; 1.4 M lakes
≥ 10 ha) filtered by area per level — ≥ 1000 km² at LOD 0, ≥ 100 at LOD 1, ≥ 10 at LOD 2, ≥ 6 in the
250 m tiles — and are made planar among themselves per level the way the coast is; a lake the OSM
partition calls sea (the Caspian, Lake Melville, the lagoons) is dropped. Lakes are an overlay drawn
over the country fills and under the borders, never cut out of the faces: borders cross lakes.

**Level of detail.** Three resident LOD levels for arcs (globe, continent, country scale) ship in the
core file; two finer levels (region, locality) ship as **tiles** on an equirectangular grid
(`z=3`: 8×4 tiles of 45°; `z=4`: 32×16 of 11.25°), fetched on demand and cached by the service
worker. A level is used while its simplification tolerance is at most half a pixel: LOD 0 (10 km)
above 16 km/px, LOD 1 (2.5 km) above 5, LOD 2 (500 m) above 1, LOD 3 (250 m) above 0.5, LOD 4 (75 m)
down to the cap of 150 m/px (Q-A6 a), where the finest tolerance is half a pixel and the 28 m quantum
a fifth — so no level ever stair-steps, and the switch between levels is invisible. (LOD 0 was built
at 8 km first; 10 km is 0.63 px at its 16 km/px switch and under half a pixel from 20 km/px up — the
default globe on every viewport — and it is what brings a globe frame under the owner's worst-frame
gate in software GL, §7 "Phase 1a — as built".) The tolerances
were chosen against the vertex census of the OSM coast (`build-land.js --census`, below): 75 m keeps
6.2 M vertices and 250 m 1.6 M, which packs the tiles well inside the 40 MB the owner allowed, so
there was no reason to accept more sag.

**Tiles carry their own fills (decided in Phase 1a, 2026-10-08).** The first design had a tile carry
only the finer *arcs*, keyed by the core's arc ids, and a face drawn with the finer arc when the tile
was present. Phase 0 found that a fill and its stroke must come from the same ring, and a fill
triangulated from the resident ring would disagree with a tile's finer stroke by up to the resident
tolerance — 500 m, three pixels at the cap — as sea-coloured gaps or land spilling over water. So
**every tile carries each face clipped to the tile's rectangle**, as fill rings of its own, built at
pack time by walking the face's arc pieces inside the tile and turning along the tile boundary where
they leave it; the chords along the boundary are arcs of kind EDGE, which close a ring and are never
stroked. The worker triangulates a tile exactly as it does a resident level — a tile *is* a level,
local to its rectangle — and the tile's faces carry the core face index, so the style texture, the
selection and the ID pass need nothing new. Tile arcs still name the core arc they are a piece of
(`arcRef`), which is what lets the checker prove that the pieces of an arc chain across tiles and
that every EDGE chord is matched, reversed, by the same face in the neighbouring tile — the union of
a face's pieces is the face. Because no vertex may lie on a tile line (build-admin.js nudges any
that does by one quantum), every crossing of the boundary is proper and entries and exits alternate.
The seam between two tiles is two fills meeting along a shared chord with identical endpoints; the
worker's chord subdivision (since 2b: every edge over the level's threshold split into equal pieces
along its great circle, the pieces a function of the edge alone) is the same on both sides, so there
is no gap. A loaded tile is drawn where its extent is written into the stencil
buffer and the resident level only where no tile covers, so a tile still on its way is a patch of
coarser coast, never a hole or a doubled line.

**Why faces are triangulated at runtime, in the worker, with earcut.** Shipping triangle indices for
1,700+ faces would add an estimated 2–3 MB; triangulating all of them once at first load takes under
two seconds in a worker and is cached in memory (and the worker can persist its result in
IndexedDB for the next visit). Faces are triangulated in an azimuthal projection about their own
centroid so even Russia or the Mongol Empire triangulate without wrap problems; long triangle edges
(> 1°) are split and the midpoints re-projected onto the sphere, so a flat triangle never
visibly cuts a chord through the globe.

**File format.** A compact binary of this design's own (`topology.bin`): a small JSON header (entity
table, step table, arc index with LOD offsets, licence block), then typed-array sections — vertex
lon/lat as zig-zag delta varints, arc segment index as `Uint32`. Varint-delta coordinates compress
poorly further, so the design does not depend on transit compression (Cloudflare Pages does not
compress `application/octet-stream`). Sizes — the first three rows **measured by Phase 1a's build
(2026-10-08; Phase 0's Natural-Earth-only core was 1.24 MB)**, the rest still estimates:

| file | content | size on the wire |
|---|---|---|
| `atlas/data/topology.bin` | arcs LOD 0–2, faces, steps, entities | **2.88 MB measured**: 917,243 vertices in 35,225 arcs, 430 faces (257 countries, 173 admin-1 units), at a quantum of 2.5·10⁻⁴° and Visvalingam intervals of 10 / 2.5 / 0.5 km for LOD 0 / 1 / 2; vertices 2,328 KB, 2-bit ranks 224 KB, arc table 173 KB, face table 152 KB, header 71 KB. CI refuses a core over 3 MB. Cliopatria's steps (Phase 2) will add to this. |
| `atlas/data/gazetteer.js` | places registry (§2.8): v0's 15 kinds with ranks, anchors, label paths, aliases, Wikipedia titles, the v1 prose keys | **0.589 MB measured (Phase 1c, 2026-10-09)**: 6,135 rows as arrays under a `cols` header with trailing zeros trimmed (the same rows as objects measured 1.03 MB); the budget was 0.6 MB and the levers that met it are measured in §7 "Phase 1c — as built" |
| `atlas/data/tiles/3/*.bin` (32 tiles) | every arc and every face clipped to the tile, LOD 3 (250 m) | **5.33 MB measured**, median 110 KB, largest 700 KB (the tile holding Scandinavia and the Baltic) |
| `atlas/data/tiles/4/*.bin` (382 of 512 tiles) | the same at LOD 4 (75 m) | **17.72 MB measured**, median 13 KB, largest 893 KB (the tile holding the Aegean and the Adriatic); 130 cells are open ocean and omitted, 38 are whole-tile covers of one face (Antarctica's pole row, inland cells of Brazil and Siberia) a few hundred bytes each; 23.05 MB in 414 files, under the 40 MB the owner allowed |
| `atlas/data/water.bin` | rivers (every vertex, 4,369 arcs in 1,208 rivers) and lakes ≥ 10 km² at LOD 0–2, lake entities, the water tile index | **4.16 MB measured (Phase 1b, 2026-10-08)**: 1,169,157 vertices, 37,701 arcs, 16,616 lake faces, 5,167 entities (named lakes and those ≥ 50 km²; smaller unnamed lakes share one entity and keep their HydroLAKES id in `header.lakeIds`) |
| `atlas/data/water/<x>-<y>.bin` (228 of 512 cells, the z=4 grid) | lakes ≥ 6 km² at 250 m, each clipped to the cell with EDGE chords | **7.54 MB measured**, median 12.2 KB, largest 666 KB (Québec's lake country); with the 5 km² floor the build uses the water would be 12.23 MB, over the owner's 12 MB — the 6 km² floor (6,015 lakes left out of the tiles) brings it to **11.70 MB** |
| `atlas/data/relief/L0.{hi,lo,sh}.png` | 4096×2048, three greyscale planes | **8.89 MB measured** (one RGB file would be 12.55 MB) |
| `atlas/data/relief/L1/<x>-<y>.{hi,lo,sh}.png` (8 tiles) | 2048² each | **32.83 MB measured**, largest tile 4.45 MB (one RGB file each: 47.85 MB) |
| relief L2 (32 tiles, NOT shipped) | 2048² each, 2.4 km per texel | **118.69 MB measured** on its own (RGB: 175.7 MB) against the 45 MB budget for the whole pyramid; `build-relief.js --levels 0,1,2` makes it |
| `atlas/atlas.js` + `atlas-gl.js` + worker + earcut | code | 120–180 KB |

For comparison the Atlas today loads about 4 MB (gz) of `atlas` + `world` + idle-warmed bundles
before any relief, and 9.4 MB more for the two heightmaps. A first visit to the new Atlas is 2.9 MB
before water, 7.0 MB with rivers and lakes (the defaults); relief adds 8.9 MB at globe scale and 4.1 MB
per L1 tile under 6 km/px — more than the first estimate (2.5 MB), because 16-bit heights at 1 m do not
compress below about 2 bits a texel, measured.

**The step topology — `atlas/data/history.bin` (Phase 2a, as built 2026-10-10; the pilot slice).** The
polities' steps live in a file OF THEIR OWN beside the core, so a history rebuild leaves the land, water
and relief files byte-identical (`sha256sum`, §7 "Phase 2a — as built"). The file is the `.bin` of this
section with four things added: an **entity table** in the header (`id` `pol:<slug>`, name, kind,
Wikidata QID and Wikipedia title taken from Cliopatria's own `Wikidata`/`Wikipedia` properties, span); a
**step table** `[entity, from, to, face]`; a **`coreRef` section** — a history arc that lies on the
core's coast, or on a present-day border, stores no vertices but the core arc's id, the range of core
vertices strictly inside the piece, and the two junctions' core segments, so the coast is drawn from the
core's line at every level and never as a second line a few hundred metres off; and a **`jpos`
section** — each junction's position and level segment at the two coarser levels (below). The header's
`extra` carries the uncertainty class per face and per arc (`approximate` for every Cliopatria face,
`contested` for an overlap face, `firm` for a core reference), the core's `buildId` (the checker
refuses a history file built against another core), the period capitals, a face's area and an interior
anchor, and the pilot's constants. Licence: the file embeds junctions snapped onto OSM geometry and
references OSM arcs by id, so its header states **ODbL 1.0 as a whole, with the Cliopatria CC BY 4.0
attribution kept**, and the credits page lists it under the share-alike statement. **That reading is
flagged for counsel**: whether referencing an ODbL arc by id (no OSM coordinate is copied, only the
snapped junctions are) makes the file a derivative is a judgement the owner has not yet taken.

*The pilot slice (owner's decision, 2026-10-09):* the Mediterranean and Near East (−20…80° E, 5…60° N),
550 BCE to 650 CE; the core series `rome`, `carthage`, `achaemenid`, `macedon` (Antigonid),
`ptolemaic`, `seleucid`, `byzantium`, `sasanian`, plus every `polity-spec.json` series that touches
them in those years (a shared arc, or a line within 25 km of a core polity's in some epoch — 24 kept;
`bosporus`, `peloponnesian_league`, `scythia`, `kushan`, `aksum` and `makuria` are in the region
but touch nothing and are left for 2b). Present-day faces keep their step `[2022, null]`; outside the
pilot's coverage the land draws plain and the rail says "No states are mapped for this year yet".
Period capitals: `state-capitals-spec.json` rows whose card maps to a pilot polity (the mapping is by
the row's title against the series' names, with two aliases) become city steps — 19 rows from 18 cards.

*At full scale (Phase 2b, as built 2026-10-10; the owner's scope decision of the same day):* the file holds **the states Folio's
cards teach** — every card-linked polity series of `polity-spec.json` that Cliopatria carries (152 series, including the
assembled ones: northern and central Italy from seven series each with its own border, the Zhou from "Zhou Dynasty" and "Later
Zhou", Rome from its three Cliopatria names, the Qing from "Later Jin Dynasty" and "Qing Dynasty" …), over the whole globe and
Cliopatria's whole span, 3400 BCE to 2021 CE (the present-day faces hold 2022 onward) — and not every state of the period, which
the rail's caption, the About sheet, the credits page and the place card each say once. Deferred to 2c: the eight series the
audit keeps as *peoples* (`scythia`, `galatia`, `gothia`, `huns`, `avars`, `old_great_bulgaria`, `khazaria`, `magyars` — the
2a pilot drew the Avars as a state; it no longer does), the coastline series (`cyclades`, `crete`) and the site-hull cultures
(`yangshao`, `longshan`); (all twelve built in Phase 2c, §7 "Phase 2c — as built"); to 2d the WW2 fronts and the war sides. The builder is the 2a pipeline with four changes: an epoch
conflates only the coast rings its alive rows can touch (a ring's box against the rows' boxes grown by D1), so the Pacific costs
a Mediterranean epoch nothing; the land/sea parity test casts its ray **north to the pole** (sea in the OSM partition) instead of
east — at global scale the eastward ray, unwrapped about the point, ran half round the globe and ended on land for most of
Eurasia, inverting the parity, so chords across the Mongol Empire read as sea chords and were dropped and its interior belonged
to nobody (24,543 km² for 1241–1249 in the first full build; the fix is the first thing the 2b note records); the build is
**resumable** (every finished epoch's contribution — its new arcs, faces and entities, the owner rows, the stat and snap-count
deltas — is a JSON under `out/history-cache/<hash>/`, replayed in order into the same registries; a cached and a fresh build give
one sha256, `check-history.js --determinism`); and a mutual overlap above the sliver threshold is still a **contested** face, but
an overlap that holds at least 80 % of the smaller claimant while the larger is at least twice it is a **nested** face — the
member drawn as itself, its overlord named on the card and drawn by its own border — the default recorded for the owner to
confirm (`NEST_SHARE`, `NEST_RATIO`). The entity table carries each polity's **card ids** (`cards`, from the spec's links) as data
for Phase 3's `places` field; nothing draws from them yet. The `file://` twin carries the **pilot slice only** (the full file's
twin would pass the 12 MB the three twins share), and its header says so in a sentence the rail shows. The file measured
4.70 MB for 2,693 steps — under the 6 MB that would have split it into windows (the stop rule's forecast from the 650–1500
band was 3.04 MB; from the pilot 4.76) — so it stays one file, fetched the first time the rail leaves today. It crossed
6 MB once: with the great-circle densification the plain-coded file reached 6.24 MB, 3.64 MB of it the **face table** —
1.37 million signed arc references, three bytes each, because a face walks every coast piece of its shore and an island
empire's face (Japan's: 7,500 pieces) is written afresh at every step that changes anything. The format now writes the
history file's face rings **delta-coded** (`faceRefs: "delta"` in the header; a ring's first reference as is, each later one
as the zig-zag difference from the one before — consecutive coast pieces are consecutive arcs, so a step costs a byte), which
the shared reader honours and the core and the tiles do not use, byte for byte: the face table fell to 2.14 MB and the
file to 4.70 MB. The window loader of the brief (3 MB windows under an index, the current year's window fetched, the next
in the rail's direction prefetched, an LRU, a step spanning a boundary carried by both) is therefore not built; the rule
that would call for it stays as stated.

*The conflation, as built (`.claude/atlas-build/build-history.js`), per epoch — a maximal interval over
which the alive set and every shape are constant (175 epochs, 175 distinct alive sets):*

1. **d1, the coast**: a vertex within **15 km** of the OSM coast projects onto it (**172,674** of the
   pilot's 219,407 vertices; the measured distribution is in §7). A chord between two coast junctions
   on one ring is a *run* and is replaced by the coast when the coast path between them is at most three
   times the chord (or 3 km) **and the chord's middle lies within 15 km of a coast** — without the second
   clause a border crossing western Sicily shore to shore (Carthage, 300 BCE) was taken for a run and the
   island merged. Junctions within two quanta of a core vertex take the vertex.
2. **d3, present-day borders**: a run of vertices within **2 km** of a present-day border (never a lone
   vertex) becomes a reference to the core's border arc (2,119 vertices, 102 references).
3. **d2, neighbours**: a vertex within **8 km** of a neighbour's line snaps onto it when it is surely on
   the line (≤ 1 km) or it and the next vertex of its own line reach the same line as a run; the
   neighbour's line **gains the point** (735 snaps, 10,223 insertions). A vertex lying ON a neighbour's
   chord (0 m: Cliopatria neighbours share edges) is inserted too — a T-junction the crossing test cannot
   see.
4. **Noding**: chord × coast, chord × chord and chord × referenced border are split at every crossing
   (planar intersection in the unwrapped frame, six rounds), with three cases the open-interval test
   misses handled by name: a chord's endpoint on another chord's interior (a T-junction, checked BEFORE
   the shared-endpoint rule, because a polygon folding back along its own edge — a collinear spike —
   shares an end with the chord it lies on); a chord through a coast VERTEX (split at the vertex); and a
   chord leaving a present-day border's junction that cuts back across that border's bends (only the
   segments touching the shared endpoint are exempt).
5. **Sea chords**: after the noding every chord lies wholly on land or wholly at sea, so a chord between
   two shore points whose middle is at sea (the parity of an eastward ray against the region's coast
   rings) is dropped — a polygon drawn across a strait or a gulf (Pontus over the Marmara at 87 BCE, Rome
   over the Adriatic at 215 BCE, Lydia across the Gulf of Antalya) otherwise closes a face round the
   WATER and walks the far shore with the sea on its left. A second test at the face walk catches what the
   midpoint test cannot: a chord that leaves a coast junction outside the land wedge there (between the
   land-left coast half and the sea-left one, counter-clockwise) is at sea (150 such, three distinct
   sites — an inlet 300 m wide the midpoint test could not see).
6. **The face walk**: every coast piece of every ring in the region is in the graph (so land closes along
   its coast where no polity reaches), the planar faces are walked by angular order, each land cycle's
   owners are the rows holding a majority of **interior samples on a grid over the piece** (an edge
   sample sits 3 km from the boundary, and a boundary that is a coast may be 15 km from where the source
   drew it), containment by the **non-zero rule** with holes by nesting depth (Cliopatria draws some
   polygons as figure-eights); a piece claimed by nobody or by several that is under **120 km²** or
   narrower than **4 km** goes to the neighbour with the longest shared edge (9,284 over all epochs,
   509,000 km² in all); an overlap above that is a **contested face** owned by both (8 in the pilot);
   land no polity claims stays unmapped (3,251 gap pieces over all epochs, 7.18 M km² — mostly the
   continents' remainders beyond the pilot's series). Pieces are keyed by their arc set, so a face that
   does not change between epochs is one face; arcs by exact vertex key, so an unchanged border is one arc
   across every step it bounds (**534 steps share 519 faces and 9,389 arcs: 6,268 coast references, 102
   border references, 3,019 own arcs of 29,594 vertices**).
7. **Levels**: own arcs take Visvalingam ranks at the core's three intervals; a core reference takes the
   core's own ranks. **Junctions at coarser levels** sit on the level's straightened coast: by default
   at the same fraction of arc length along the level segment that holds the LOD 2 segment
   (`junctionAt`), and — where a border's first drawn segments at that level cross the level's coast
   because the level cut off the bay or the headland they stood on — at the point where the border
   crosses the coast within three tolerances, with the border's vertices before it hidden at that
   level and the coast pieces' inner vertices bounded by the junctions' level segments (`jpos`; 140
   junctions moved, 24 vertices hidden, 105 crossings too far to move). A crossing left at a coarser
   level is a residue the checker counts against a budget (below); the finest level is exactly planar.
8. Every snap is logged; the build fails on one over the source's 15 km (the largest was 14,916 m,
   none over); two runs give one sha256 (no clock in the header).

*Fill against stroke at fine zoom — settled:* a historical fill is drawn from the **resident level's
mesh** (the meshes are per face and per level, triangulated lazily in the worker and kept in an LRU of
600 there and 400 on the main thread), masked by the **land stencil the land fills leave** — so a fill
never spills over water, and at the tile zooms (under 1 km/px) the finer coast is the tiles' and the
fill stops at it, not at the resident coast. The resident coast is stroked over the fill in the fill's
own colour, as wide as the level's tolerance in pixels, so the band between the resident and the tile
coast reads as fill rather than as plain land. The seam measured at the cap is in §7.

*The planarity budget:* `check-history.js` requires exact planarity among the alive faces at the finest
level in every epoch, and counts crossings at the two coarser levels against a hard ceiling over all alive
sets — the pilot measured 125 (66 at level 0, 59 at level 1, 25 distinct arc pairs — one site, a border
leaving the Bay of Cádiz at the 2.5 km level in thirty epochs, was most of it) against a budget of 200; the
2b file measured 1,120 over 494 alive sets (level 0 741, level 1 379), the same class of residue — a bend
a straightened coast cuts off — and the ceiling is a quarter above that (1,435, `COARSE_MEASURED` in the
checker); a regression shows, the known residue does not fail CI.

Loading strategy: `topology.bin` and `gazetteer.js` are the Atlas's two required files, fetched
with a determinate progress bar; tiles and relief are fetched on demand with a small LRU; the
worker triangulates faces for the *current* year first, then the rest at idle, so the globe paints
within a second of the data landing.

**Build pipeline** — `.claude/atlas-build/`, Node, any libraries (mapshaper MPL-2.0,
topojson-server/-simplify ISC, polygon-clipping MIT, earcut ISC, pngjs/sharp MIT, proj4 MIT):

| step | script | in | out |
|---|---|---|---|
| 0 | `fetch-sources.js` | `sources.json` (URL, version, sha256, licence, attribution text) | `src/` cache, never committed |
| 1 | `build-land.js` | coastline source | land/sea partition at LOD 4, simplified to LOD 0–3 |
| 2 | `build-admin.js` | Natural Earth 10m admin-0 (PD) [+ admin-1 for the three subdivision layers] | present-day faces conflated onto the land partition |
| 3 | `build-history.js` (2a; `build-polities.js` in the first plan) | the committed core, Cliopatria v0.2.0 rows per `polity-spec.json`, `state-capitals-spec.json` + `state-capitals.js`; later OHM relations where whitelisted and traced plates where the spec names one | `history.bin`: polity steps conflated per §2.3 and the snap log; `history-report.json` with the distributions and the forecast |
| 4 | `build-peoples.js` | Cliopatria "people" rows, site hulls (Hosner), traced soft outlines | soft faces with the uncertainty flag |
| 5 | `build-water.js` | Natural Earth 10m rivers (scale-rank edition), HydroLAKES, the committed land partition (`lib/landindex.js`) | `out/water-full.bin`: river arcs by scale rank, lake faces at four levels; `pack-water.js` splits it into `water.bin` and the water tiles |
| 6 | `build-gazetteer.js` | cards + glossary + books (place references, §2.8), Wikidata | `gazetteer.js`: entities, kinds, anchors, label paths |
| 7 | `build-relief.js` | ETOPO 2022 60 arc-second (CC0) | `relief/L0.*.png`, `relief/L1/*.png`, `relief.json` |
| 8 | `pack.js` | everything above | `topology.bin`, `tiles/`, the attribution text for the help card |
| 9 | `check-topology.js`, `check-water.js`, `check-relief.js`, `check-history.js` (2a) | outputs | fail on any §2.11 invariant |

Every step is deterministic given `sources.json`; every output file header names its sources,
versions and licences; the help card's attribution block is generated from the same manifest, so a
new source cannot ship uncredited. `node .claude/atlas-build/preview.js --year -300 --at 23,38 --zoom 6`
renders a PNG through Playwright for review in a session.

### 2.4 Time: steps, never interpolation; gaps are empty; uncertainty is drawn, not hidden

**Resolution.** Every entity's extent over time is a sequence of **steps** — the shape held
constant over `[from, to]` — exactly as Cliopatria and OHM give it, and as the current
`polities.js` already stores it. A dragged year resolves each entity by binary search over its
steps: O(log n) per entity, ~2,000 entities, well under a millisecond, in the worker, producing the
style tables of §2.2. There is **no interpolation between steps**: morphing a border from its 338
shape to its 323 shape would draw a frontier that never existed. The crossfade at a step boundary is
visual only (~250 ms, off under reduced motion).

**Year-by-year where sources allow.** The step density is the source's: the Roman Republic has
20 OHM steps and 123 Cliopatria steps; the Second World War fronts are monthly (1939–42) and from
plates dated to the fortnight (1943–45). The rail shows the **change years of what is on screen**
as ticks; `[`/`]` and the chevrons step between them; the pin can still be dragged to any year.
**Playback (Q-T4 b) advances every year** at a chosen speed (1, 5, 25 or 100 years per second);
the counter ticks each year, the map changes only at steps, with the crossfade at each step. Where
the rail is compressed (before 3000 BCE) the speed is in years, not pixels, so deep time passes
quickly by design.

**Gaps.** A year with no step for an entity draws **nothing for that entity** — not the last known
shape, not an authored fallback. The current "nothing ever draws less than it did" fallback to a
timeless hand-drawn polygon is what puts a Mongol Empire on a 1400 map. The card lists the gap
honestly ("no source for 1294–1300"). The design's one exception: a card-linked *site or city*
persists from its first year onward (a place stays a place), unless the gazetteer records its
abandonment.

**Uncertainty and disagreement**, encoded per face and per arc and chosen by Q-U1:

| state | source | how drawn (recommended) |
|---|---|---|
| firm | present-day admin; a border inherited from one | solid line, full fill |
| approximate | Cliopatria/OHM rows (atlas-style interpretations); traced plates | solid line slightly lighter; the face card says "approximate (source: …)" |
| soft | peoples, cultures, site hulls, tiers 4–5 "soft outline" | no line; fill fades to zero over ~5 % of the face's radius; stippled texture |
| disputed between sources | two accepted sources for the same year | agreed ground as above; symmetric difference hatched in both colours, labelled "disputed between sources" on the card with both citations |
| contested between polities | two polities claim the same ground in one year (Cliopatria overlaps) | the overlap is a hatched face owned by both; both cards name it |
| unknown | no step | nothing |

Contested faces are produced by the build as explicit faces (the overlay of two polity steps), so
the partition stays planar: every point on land belongs to exactly one face per year, including
"contested" faces.

**Present-day admin-1** (US states, Chinese provinces, Russian federal subjects) are faces at a
lower level, present-day only, shown when zoomed past country scale or when a card asks for them.

**As built in Phase 2a (2026-10-10).** The year query is a binary search over each entity's steps in
the main thread (39 entities in the pilot; the worker holds the same table for layout); a year change
uploads two small style textures (a face's RGBA — colour, alpha, hatch flag, selection — and an arc's
alpha), never geometry, and costs under 5 ms at p95 on the main thread (§7). The crossfade is 250 ms
between the two years' style tables when the reader steps or plays, none while the pin is dragged and
none under `prefers-reduced-motion`. Playback advances `speed × dt` years per frame (dt capped at
250 ms), so a slow frame skips the display of some years but never a step boundary. **Present-day faces,
borders, and the present-day city, town, capital, country and admin-1 names are hidden for a year
before 2022** (the owner's decision: an anachronistic Rome-the-capital-of-Italy is worse than no city);
physical names stay; the period capitals of the pilot polities are the only dated cities. A polity's
colour is a golden-angle hue per entity, blended with the theme's ink and land tokens and recoloured on a
theme change, so it is stable across years and legible in all fifteen themes.

**As built in Phase 2b (2026-10-10).** The history file is fetched **lazily**, the first time the rail leaves today (a year
before 2022 from the pin, the year box, `[`, a deep link's `?y=` or a suite's `ensureHistory()`), with a quiet "Loading the
years…" in the rail's note and never a blank; `[` before the file is in fetches it and steps to 2021. The year query stays a
binary search on the main thread: 0.05 ms a change on average over the largest alive sets (Europe near 1500 and China in the
Warring States, sixty one-year changes each, 22 and 21 faces alive), far under the 5 ms that would have moved it to the worker;
the whole year change (the query, the on-screen filter, the style tables, the meshes asked for, the ticks, the layout) averages
0.9 ms there, and its p95 over sixty changes reads 4.2–5.9 ms on the four-core software-GL runner — profiled phase by phase,
every phase shows a lone 3–5 ms maximum at a different change, the rail's two DOM writes included: the runner's own stalls, not
work a worker would take. `test-atlas-time.js` gates the query at 5 ms p95 and the whole change at a 2 ms median, and reports
the change's p95. **Colour** is a fixed palette of sixteen slots (golden-angle hues, two
lightness steps, blended with the theme's ink or paper so every theme keeps its own land and ink) assigned once at load by a
greedy walk over every epoch of the file: a polity keeps its slot across the years unless an alive neighbour (a face sharing a
border arc; a contested face joins both partners) holds it, and then takes the first slot no neighbour holds, preferring one
no alive polity holds at all — 0 clashes over 495 epochs and 3,957 adjacent pairs, one forced change
across the 152 polities (`colourAudit`); the label ink's contrast on every slot's fill is at least 4.60 (WCAG, the lowest of the 16 × 16 combinations) in all fifteen
themes and folio's night (`contrastAudit`). The mesh LRUs are sized by **bytes** (48 MB on the GPU, 96 MB in the worker), not
by count. **Only the faces on screen are drawn, meshed and tabled** (2b, after the first full-scale measurement): a face
whose bounding cap meets the view's disc is on screen; the year's draw list, the meshes asked of the worker, the arc table's
alive rows and the settle rule are over that set, recomputed on a pan as on a year change (`faceOnScreen`,
`refreshOnScreen`) — at Europe in 1500 fourteen of the year's 27 faces, so the Inca and the Ming cost the view nothing. The
historical **borders travel with each face's mesh** at its level (tagged with the arc index, so the arc table still fades
them) instead of one segment list per level holding every border of the file: the Mediterranean at 1 CE drew 70,725 border
segments of the 2b file at alpha 0 before (20,988 in the pilot), 542 now; Europe at 1500 1,078 instead of 45,387. A border
two on-screen faces share is drawn twice, in one place. Polity labels are ranked by their **area on screen** (the face's area times the share of its vertices on screen, in
pixels), so a view with many alive faces names what a reader sees most of first and keeps that order as the view moves; a
nested face is named as its member. The rail draws at most about **200 ticks** a view — change years closer than a
two-hundredth of the track merge into one tick, drawn taller — while `[` and `]` still step through every change year and
playback every year. The place card shows a long series (Rome's 123 steps, Byzantium's 124) as **ranges** of consecutive steps
with the full list under a disclosure, each step a button that sets the year; the gaps; the members drawn inside a polity and
the overlords it is drawn within, with their years; the source and the uncertainty sentence; and the sentence that the past
here shows the states Folio's cards teach.

**Deep time.** Cliopatria begins at 3400 BCE. Before that there are no polities to draw; sites and
cultures (soft) still appear. The rail's range is a question (Q-T1); the recommendation is a rail
from 10,000 BCE with a logarithmic-ish compression before 3000 BCE, and sites alone before 3400 BCE.

### 2.5 Peoples and cultures against states: visual language and interaction

A **state** is a *territory*: a face with a border line, a fill at ~30 % of its colour, and a
name in small capitals set along the face's label path (§2.6). A **people or culture** is a
*presence*: a soft face with **no border line**, a fill that fades at its edge, a diagonal
stipple (dots, not hatching, so war hatching stays distinct) in the people's hue, and a name in
**spaced italic** along the label path. The two are distinguishable at a glance at every zoom, in
every theme, in monochrome, and to a colour-blind reader (texture and type carry the distinction,
colour only reinforces it).

Overlaps: states draw first, peoples over them with multiply blending, so a kingdom inside a
people's range remains readable and the people's stipple remains visible across the kingdom. When
two peoples overlap, their stipples interleave at different angles. Labels of a people never
collide with a state's: the layout treats them as one pool.

Interaction: a tap's ID pass returns the topmost face; the popup's **stack chip** lists every entity
under the point in the year ("Scythians · people", "Bosporan Kingdom · state", "Pontic steppe ·
region"), the second tap cycles, and the legend's "Peoples" switch hides them entirely. **In the
Full Atlas only card-linked peoples are shown by default (Q-C2 b)**; the legend's Peoples switch has
a third position, "all with a dated source", for discovery. The Personal Atlas shows a people only
when one of the reader's cards links it. On the
timeline, a people's steps (Cliopatria's rows, or dated site phases) are ticks like a state's.

Khaganates and confederations (Avars, Khazars, Huns…) keep the *people* rendering while their
dated series supplies the where — the audit's rule "the series decides where, the tag decides how"
holds.

*As built (Phase 2c, 2026-10-12):* a presence is a different kind of entity in the step file (`people`, `culture`; its own edge a soft arc, conflated alone, class soft), its soft face a mesh with an edge alpha, its stipple a lattice of round dots in screen space at the presence's own angle, blended by multiply on a light theme and by screen on a dark one, its name `people-*` spaced italic in the one label pool, the stack chip lists every entity under a tap and the legend's Peoples switch has its three positions — §7 "Phase 2c — as built".

### 2.6 Labels and markers: the place taxonomy

| kind | geometry | marker | label | appears at |
|---|---|---|---|---|
| `polity` (state, dynasty, empire) | faces by step | none (the fill is the mark) | small capitals along the label path, size by face area on screen | when its face is ≥ ~40 px wide |
| `people` / `culture` | soft faces | none | spaced italic along the path | as polity |
| `region` (Attica, Etruria, Sahara, Anatolia, Beringia) | a *label anchor line*, optionally a soft face | none, never a dot | small capitals, letter-spaced, following the anchor line | by rank and zoom |
| `island` | the coast face | none | upright, letter-spaced, along the island's long axis; collapses into its group name (Cyclades) when small | when ≥ ~24 px |
| `sea` / `lake` / `strait` | water face or anchor | none | italic, water colour, along the anchor | by rank |
| `river` | arcs | none | italic, repeated along the river every ~400 px, following the curve | by stream order and zoom |
| `mountain range` | anchor line | none | small capitals along the ridge line | by rank |
| `city` (tiers: capital, major, town) | point | square (capital) / disc (major) / small disc | upright, beside the mark, leader-free | tier by zoom |
| `site` (battle, cave, temple, monument, wreck) | point | battle: crossed-swords glyph; site: small ring | upright, lighter weight | after cities; collapses into `within` parent when crowded |
| `event` (war, campaign, journey) | faces (sides), arcs (routes), points | side fills in two colours; route arrows | the event's name in the legend, not on the map | within the event's years |

Rules that remove today's label faults by construction:

- **A label never says what the thing is not.** The kind comes from the gazetteer (§2.8), checked at
  build time against Wikidata's class (`instance of`): a wine, a person, a temple cannot be filed as
  a city; a temple is a `site` whose label is "Temple of Artemis" and whose `within` is Corfu, so at
  island scale the map says *Corfu* and only close up says *Temple of Artemis*.
- **Area kinds get area labels.** A region, island, sea or range has no dot and its name follows the
  feature — a straight or gently curved baseline computed from the face's principal axis (the
  *label path*, precomputed in the build with a pole-of-inaccessibility start point).
- **Collision layout is global and settled in the worker.** Candidates are everything visible at the
  year, ranked (selected > capital > polity by area > people > region > island > major city > site >
  river); placed greedily with a screen-space grid; a label that cannot be placed is dropped, never
  overlapped; placement is recomputed on settle, on zoom-level change and on year change, and
  between recomputations labels simply follow their anchors (they move with the globe every frame).
  While the globe is in motion no label is dropped or added, so nothing flickers.
- **Density** is a legend setting with three stops (sparse / normal / dense) scaling the rank
  threshold and the minimum separation; Q-L1 asks for the default.
- **Hit targets** are the label rect plus the marker, at least 44 px on touch devices.

**Decisions taken for Phase 1c (owner, 2026-10-09; built the same day — the measurements are in §7
"Phase 1c — as built"):**

- **Density** (Q-L1 a): "normal" is a cap of about 40 labels at globe scale and about 120 at country
  scale, interpolated on the logarithm of km/px between 24 and 1; sparse is 0.6× that, dense 1.5×; a
  phone (coarse pointer, short side under 768 px) is one notch sparser, so its normal is the desktop's
  sparse. The stops also move the collision padding (8 / 4 / 2 px) and shift Natural Earth's zoom
  hints (−1 / 0 / +1.5 levels) for the kinds that carry them.
- **Typography** (Q-L2 a): small capitals for countries, provinces, regions and ranges; italic for
  water (seas, oceans, gulfs, straits, lakes, rivers); upright for cities and islands — in the theme's
  own font tokens (`--display` for territories, `--serif` for water, `--sans` for cities and islands),
  read from the computed style at mount and again on a theme change. Spaced italic for peoples waits
  for Phase 2. Every label is shaped glyph by glyph with its own tracking; canvas `letterSpacing` and
  `fontVariantCaps` are not used, so small capitals are capitals at 0.78 of the size.
- **Markers** (Q-L3 a): a 4 px square for a capital, a 3 px disc for a city, a 2.2 px disc for a town,
  ink with a paper stroke; battle and site glyphs come with the study material in Phase 3. An area
  kind never carries a marker.
- **Names are English only and as the source gives them**: Natural Earth's `name_en` where the table
  has one, else `name`; HydroLAKES' lake names as they stand ("Superior", not "Lake Superior"). Canvas
  text is outside the site's British-spelling pass and nothing here re-spells, title-cases or
  translates. Other name fields become search aliases.
- **Rivers** are drawn from 0.35 km/px upward only, so a river label exists only where its line does;
  a river's name repeats about every 400 px along its polyline, on runs the view shows, at most six
  times per river.
- **Where the work runs.** Glyph advances are measured on the main thread (the label canvas's
  `measureText`, one call per character per style, the Latin alphabet with its diacritics and the
  punctuation the sources use; a character the worker finds missing is measured on demand) and posted
  to the worker, which lays out: rank, then a greedy placement on a 64 px screen-space grid, dropping
  a label that does not fit and never overlapping — a curved label is a chain of per-glyph squares.
  A layout is asked for on settle (150 ms after the last input, with the pointer up), on a
  zoom-level change and on a legend change; between layouts every placed label is a sprite — rendered
  once, glyph by glyph, halo then ink — blitted at its anchor's current screen position, so nothing is
  added or dropped while the globe moves (the pointer's state decides "moving", not a quiet clock),
  a label behind the horizon is not drawn and one near the limb fades.

**The gazetteer's kinds and the feature classes behind them (v0, Phase 1c):**

| kind | source feature class → kind | rank | label geometry |
|---|---|---|---|
| `country` | `topology.bin` admin-0 face (NE admin-0 conflated on OSM land) | by area: ≥ 2 M km² 0, ≥ 500 k 1, ≥ 100 k 2, ≥ 20 k 3, ≥ 2 k 4, else 5 | pole of inaccessibility + principal-axis path, 2–5 points |
| `admin1` | `topology.bin` admin-1 face (US, China, Russia, the UK nations) | by area + 3 | as country |
| `capital` | NE populated places, `ADM0CAP = 1` / `Admin-0 capital` | NE `SCALERANK` | the point |
| `city` | NE populated places, `POP_MAX ≥ 1,000,000` (the further tier, `--tier`, measured below) | NE `SCALERANK` | the point |
| `town` | NE populated places, admin-1 capitals and region capitals of `POP_MAX ≥ 100,000` (`--town-min`) | NE `SCALERANK` | the point |
| `ocean` / `sea` | NE marine polygons `ocean` / `sea` | NE `scalerank` | pole + path, preferring a cell the OSM partition calls water |
| `gulf` | NE marine `gulf`, `bay`, `sound`, `inlet`, `fjord`, `lagoon` | NE `scalerank` | as sea |
| `strait` | NE marine `strait`, `channel` | NE `scalerank` | as sea |
| `lake` | `water.bin` named lake entity (HydroLAKES), a chord of ≥ 6 km or ≥ 25 km² | by area: ≥ 10 k km² 1 … ≥ 25 5, else 6 | pole + path from the finest resident rings; the path only from 60 km |
| `river` | `water.bin` named river entity (NE 10m rivers), scale rank ≤ 8 | NE `scalerank` | the midpoint; the polyline itself, from the worker's copy |
| `island` / `island-group` | NE regions polygons `Island` / `Island group`; NE regions points `island` / `island group` | NE `SCALERANK` | pole + path preferring land; a point |
| `range` | NE regions polygons `Range/mtn` | NE `SCALERANK` | pole + path |
| `region` | NE regions polygons `Continent` (rank 0), `Desert`, `Plateau`, `Plain`, `Basin`, `Lowland`, `Depression`, `Valley`, `Wetlands`, `Delta`, `Gorge`, `Tundra`, `Foothills`, `Geoarea`, `Peninsula`, `Pen/cape`, `Isthmus`, `Coast` | NE `SCALERANK` | pole + path |
| not in v0 | NE marine `reef` (2), `river` estuaries (3), the 11 unnamed `generic`; NE regions `Lake` (3, the water file has them), `Dragons-be-here` (Null Island); NE points `cape` (111), `waterfall` (4), `plain` (1), `pole` (3); NE scientific and meteorological stations (41) | | no kind of this table is a cape or a pole; sites are Phase 3 |

`within` is a country or admin-1 id: a city's from its `ADM0_A3` and `ADM1NAME`, a dependency's
sovereign, an area's or river's country only where its anchor and both ends of its path fall in one
admin-0 face of the z=4 land partition (a desert spanning five countries is in none). Every Wikipedia
title is Wikidata's enwiki sitelink for the row's QID, fetched at build time and cached in
`.claude/atlas-build/wiki-sitelinks.json`; a row with no QID or no sitelink has no link. Lakes have no
QID (HydroLAKES carries none) and so no link in v0.

### 2.7 Relief

**Source: ETOPO 2022** (NOAA NCEI, CC0 1.0 — the NCEI metadata record's own words: "not subject to
copyright protection in the United States. NOAA waives any potential copyright and related rights in
these data worldwide through the Creative Commons Zero 1.0 Universal Public Domain Dedication"; verified
2026-10-08). It is one clean source with one licence, which the current Mapzen/AWS composite is not.
**The owner's decision of 2026-10-08: the 60 arc-second surface grid (21600 × 10800, about 1.85 km per
cell) is the only relief source; the 15 arc-second grid is not fetched.** So relief is a **regional-scale
wash**, not terrain detail at street zoom: it shows the Alps as a range, the Tibetan plateau as a plateau,
the mid-ocean ridges as a tint, and it fades out as the zoom passes the finest level's texel (below).

**The files, as built in Phase 1b (§7 "Phase 1b — as built").** The build samples the grid to an
equirectangular pyramid and writes **three 8-bit greyscale PNGs per tile**: `<base>.hi.png` and
`<base>.lo.png` are the high and low bytes of (height in metres + 32768), 16 bits so a hypsometric ramp
has no terraces; `<base>.sh.png` is the hillshade (north-west light, azimuth 315°, altitude 45°, Horn's
3 × 3 slope on the level's own grid with the cell size corrected for latitude), flat over the sea floor.
The first wording of this section asked for one RGB PNG (R = shade, G·B = height); measured, that file is
2.5 × the size of the three planes — DEFLATE cannot predict across three interleaved planes with
different statistics — and the three decode natively on every phone, so the renderer composes them into
one RGB texture on upload. Levels: **L0 4096 × 2048 (one tile, 8.9 MB), L1 8192 × 4096 (8 tiles of
2048², 32.8 MB)** — 41.7 MB in 27 files against the owner's 45 MB budget. L2 (16384 × 8192, 32 tiles) was
built and measured at **118.7 MB on its own**; the owner's "~1 MB a tile" estimate was four to five times
low, so L2 is not shipped (`build-relief.js --levels 0,1,2` still makes it). L2 is resampled NEAREST and
L0–L1 are box averages of the source cells each texel covers; `check-relief.js --source` proves 200
random texels per level against the GeoTIFF. Tiles are 2048² so every phone GPU accepts them.

**Rendering** is in two places. The **sphere pass** fragment shader, where the ray hits the sphere,
samples the resident L0 sheet for the SEA: the depth tint (Q-V2 a: the ocean colour darkened with the
square root of the depth, at the reader's strength — subtle, and the shelves stay visible). Then, after
the faces, a **relief pass over the land**: hypsometric colour from a 1-D ramp texture built from the
theme's own tokens (the land colour at sea level, warmed toward the ochre through the uplands, greyed
toward the ink on the high plateaux, lightened toward the paper — or a plain white in a dark theme —
only at the peaks), multiplied by the hillshade, blended at the legend's strength × the zoom fade. L1
tiles are drawn as patches on the sphere for the visible region (a lon/lat mesh of the tile's
rectangle) under 6 km/px, the sea patches before the faces and the land patches after them, each
marking its pixels so the L0 pass does not shade them twice; a tile not yet landed shows L0 under it.
Height is decoded from four NEAREST taps and blended bilinearly after decoding (a linear filter over
the two bytes would mix a high byte with a neighbour's low byte at every carry). Cost: a few texture
reads per pixel. Relief is off by default and remembered per reader; the toggle flips a uniform — no
reload, no CPU work; the first switch-on fetches L0 (8.9 MB) and then the view's L1 tiles (4.1 MB each,
an LRU of nine). A phone (coarse pointer, short side under 768 px) never fetches L2 (Q-M1 a) — a rule
the code keeps although the shipped pyramid has no L2.

**The land/sea mismatch, settled.** ETOPO's coast and the OSM coast disagree by kilometres: measured
in Phase 1b (`check-relief.js --coast`), 3 km inland of a random OSM coast vertex ETOPO reads below sea
level 20 % of the time and 3 km seaward it reads above 21 %, so a naive relief pass paints bathymetry
onto land along the shore and a land tint onto the sea. **The face fills are the stencil mask**: every
land face sets a LAND bit in the stencil buffer as it is drawn; the land relief pass runs only where the
bit is set and samples the height clamped at zero or above; the sphere pass (before the faces) tints
the whole disc as sea with the height clamped at zero or below, and the land fills then cover it. So
the OSM coast always wins: a land pixel ETOPO puts under water is the lowest tint of the ramp with the
flat sea-floor shade, a sea pixel it puts on a hill is sea-level ocean. The context requests a stencil
buffer (it already did for the tiles: bits 0–1 tile coverage, bit 2 water tiles, bit 3 relief patches,
bit 4 land; each pass masks the bits it is about). `test-atlas-relief.js` renders twelve land points
ETOPO puts below sea level and twelve sea points it puts above and reads the pixels back.

**The fade.** L1's texel is 4.9 km; relief is at full strength above 2.5 km/px, fades linearly, and is
gone below 1.0 km/px (chosen by eye in Phase 1b, screenshots at 2.5 / 1.8 / 1.2 / 0.9 km/px): past that
a magnified texel is a blur that says nothing a reader can use, and the coast, borders and water carry
the map on their own.

### 2.8 Integration with the study material

**The gazetteer** (`atlas/data/gazetteer.js`, built) is the single registry of places: for each
place id — `name`, `kind`, `qid`, `within`, geometry reference (a point, an arc set, or an entity
with steps), `aliases`, label path, and `spans`. Everything on the site points at place ids; the
Atlas never again guesses a place from a card's answer text.

**On a card** the four fields of today (`locator`, `war`, `map`, and `GLOSSARY_PLACES` for terms)
become one light-half field:

```json
"places": [
  { "id": "athens", "role": "setting" },
  { "id": "attica", "role": "setting" },
  { "id": "delian-league", "role": "subject", "years": [-478, -404] }
]
```

Roles: `subject` (the card is about this entity — it draws the entity in the card's years),
`setting` (where the card's matter happened — a mark), `side:victor` / `side:loser` (wars),
`origin`/`destination` (journeys). `years` default to the card's date line (`cardSpanYears`), as
today. The field is a card field, so `ADMIN_EDITS.cards` deltas already cover it and the admin
editor edits it like any other; the migration script maps every existing `locator`/`war`/`map` to
`places` and the old fields are removed in the same commit.

**A glossary term** may carry `GLOSSARY_PLACES[key] = [placeId, …]` (replacing the 31-entry
coordinate table) so its popup keeps the "show on the Atlas" button, which opens the Atlas at the
place and at the term's first dated year. **Terms do not contribute to the Personal Atlas (Q-P3 c).**

**Books do not link to places and do not contribute to the Personal Atlas (Q-P2 c).** The
gazetteer leaves room for it (a `places` list on a book record would be read by the same derivation)
but nothing in this programme builds it.

**The Personal Atlas** is derived in the worker from exactly one thing: **the reader's cards that
have a review record (Q-P1 a)**, as today. Each such card contributes its place ids with years;
places stack by id (the stack is the "N cards here" browser); a change in progress invalidates the
derivation. Nothing is stored; it is computed from `S.cards` as today, but by id, not by
name-matching.

**Clicking a place** opens the **place card**: title (official name where the gazetteer has one),
kind and years, the dated description for present-day countries (`COUNTRY_INFO`, kept), figures
(kept), citations (kept, the footnote apparatus unchanged), the entity's **step list** as a small
timeline ("borders change: 338, 334, 331, 323 BCE — source: Cliopatria v0.2.0"), the uncertainty
sentence, and "From your cards" — the card backs, flippable, as today's `showMinePopup` does.

**Author tooling**: `node .claude/add-places.js <batch.json>` validates each `id` against the
gazetteer; `node .claude/atlas-build/add-place.js --name "Corfu" --kind island --qid Q121378`
adds a gazetteer entry (fetching the coordinate or matching the coast face by QID/name, refusing a
kind that contradicts Wikidata's class); `--check` reports cards whose places resolve to nothing in
their years. `import-batch.js` and `add-card.js` accept `places` and refuse the old fields.

### 2.9 Accessibility, keyboard, phone, offline

- **Keyboard**: arrows rotate (shift = faster), `+`/`−` zoom, `[`/`]` step change-years, `Home`
  recentres on the reader's places, `Tab`/`Shift-Tab` walk the visible labelled places in rank
  order (a visually hidden list of buttons mirrors the label layout — real DOM, so screen readers
  get names and kinds), `Enter` opens, `Esc` closes. Focus is drawn as a ring on the 2D layer.
- **Announcements**: an `aria-live` region speaks the year on settle ("1200 BCE") and the selection.
- **Reduced motion**: no inertia, no crossfade, no auto-play, instant fly-to.
- **Colour**: every theme supplies the Atlas palette as hex custom properties as today; state fill
  and people stipple differ in texture and type, not only hue; contrast of label text against fills
  is checked by `test-atlas-labels.js` for every theme.
- **Phone**: the GL canvas renders at DPR ≤ 2; LOD thresholds shift one level coarser below 480 px
  wide; the popup is a bottom sheet with a grip; the timeline is a full-width rail with a magnifier
  strip that appears while dragging for one-year precision, and a tappable year that opens a number
  pad; two-finger pinch zooms to the midpoint; a long-press opens the stack chip.
- **Offline**: the service worker's existing stale-while-revalidate covers `.bin` once its regex
  includes it; the core two files are added to a "keep offline" action (not the shell precache,
  which stays small), together with relief L0 and the LOD-3 tiles that cover the reader's own
  places; the Atlas says plainly which regions are offline-ready.
- **Dev origins**: unchanged — never register the worker there; the Atlas works from a local
  server; on `file://` it works with the main-thread shim and without tiles (see Q-R4).

### 2.10 Compatibility with the invariants in CLAUDE.md

- *Zero dependencies, no build step for the app*: the app loads plain files; the only vendored code
  is `earcut.js`; the pipeline is `.claude/` tooling, not the site.
- *Lazy data*: `atlas/` is registered as bundles (`atlas-code`, `atlas-topology`, tiles on demand);
  `gazetteer.js`'s `after` hook re-applies `ADMIN_EDITS.places` (the one new admin-editable map
  table: place-card prose and citations), exactly as `atlas.after` re-applies `ADMIN_EDITS.timeline`
  today. `ADMIN_EDITS.timeline` and the in-browser polygon editor are retired (Q-A1).
- *Admin edits are deltas*: card `places` and `ADMIN_EDITS.places` are deltas; geometry is never
  edited in the browser — it is edited in `polity-spec.json` and rebuilt.
- *Never fabricate*: no interpolation, no fallback polygons, no untraceable shape; every face carries
  a source id; the help card's attribution is generated from `sources.json`.
- *CSP*: unchanged except `img-src` no longer needs `data:` for the heightmap (it stays for avatars).
- *Minigames*: Find-it keeps drawing through `gameCardIdSet()` and `dayPick()`; it uses the engine's
  highlight and ID-pass primitives.

### 2.10a Licensing and credits (owner's rule, 2026-10-06)

The source rule of `docs/atlas-borders-audit.md` §3 is binding for every input of every build step,
including cross-checks: public domain, CC0 and CC BY without conditions beyond credit; CC BY-SA, ODbL
and GPL only when the derived data file carries that licence and credit and is a file of its own;
nothing NC, "academic", "educational", unstated or conflicting, not even to check a line against.
`fetch-sources.js` refuses a `sources.json` entry whose `licence` field is not one of the accepted
identifiers, so a disallowed source cannot enter the pipeline by accident.

**historical-basemaps is unavailable** until its GPL/CC BY-SA question is resolved. The design does
not need it: there are no "era maps" to build. Every year is a query over the step topology, whose
inputs are Cliopatria (CC BY 4.0) for the past, present-day admin sources (PD or CC BY) for today,
OHM (CC0) and public-domain plates where the spec names them. The 13 shipped eras, `build-era.js`
and `timeline.js` are retired with v1. If the question is later resolved in Folio's favour,
historical-basemaps can be added to `sources.json` as one more conflation input; nothing else changes.

**Every generated bundle carries its sources in a machine-readable header**: the first line of a
`.js` bundle, and the JSON header of a `.bin` file, hold `sources: [{id, name, version, url,
licence, licenceUrl, attribution, retrieved}]` for exactly the sources that contributed to that file.
`pack.js` writes them; `check-topology.js` fails if an arc or face traces to a source id missing
from its file's header.

**A visible Sources and credits page** (`#credits`, linked from the Atlas help card, the footer and
the Settings page) lists every data source with its licence link, attribution text, version and the
Folio files derived from it. The page is rendered from `atlas/data/credits.js`, which `pack.js`
generates by merging every bundle header, so the page can never lag the data. The page also carries
the one caution sentence about historical borders being reconstructions.

### 2.11 Testing

**Build-time (offline, CI gate)** — `node .claude/atlas-build/check-topology.js`:

| invariant | check |
|---|---|
| planar partition | for every change-year: faces alive do not overlap (pairwise arc-intersection and area-sum test); land ∖ faces = "unmapped", never a sliver below the threshold between two faces |
| coast-snapped | no face boundary vertex lies within *d*₁ of the coast unless it is on a coast arc; every face edge within the band is a coast arc |
| shared borders | every land-border arc is referenced by exactly two faces per year (or one face and "unmapped") |
| years | every entity's steps are sorted, non-overlapping; every card `places` entry with a `subject` role has ≥ 1 step inside the card's years; a people's steps lie inside its gazetteer span |
| labels | every place has a kind; every kind has the geometry it needs; names pass the toponym check (Wikidata class) or carry an explicit `manual: true` with a reason |
| licences | every arc and face traces to a `sources.json` entry; the attribution block contains every source |
| in/out assertions | the existing `places` in/out assertions from `card-war.js` (1,705 of them) are migrated and extended: "(lon, lat) in year y is inside face X" — evaluated on the built topology |

**Browser (Playwright, CI second opinion)**:

- `test-atlas-render.js`: at fixed views and years, read the ID pass at sample points and assert
  the entity (accuracy); screenshot diff against stored references with a tolerance (regressions).
- `test-atlas-perf.js`: scripted drag, pinch and scrub with the Full Atlas loaded; asserts p95 frame
  time ≤ 20 ms on the CI runner with software GL, and ≤ 33 ms under 4× CPU throttling; asserts no
  frame over 100 ms; asserts year-change cost ≤ 5 ms on the main thread.
- `test-atlas-labels.js`: no two label rects intersect; no label for a non-toponym; contrast per
  theme; collapse rules (Temple of Artemis → Corfu at island scale).
- `test-atlas-study.js`: a reader with a known set of studied cards sees exactly those places in
  exactly those years; a map card unlocks its country; a war card draws both sides inside its years
  and nothing outside; a book contributes after the threshold.
- `test-atlas-a11y.js`: keyboard walk, announcements, reduced motion.
- The existing `test-map-cards.js`, `test-war-cards.js`, `test-card-locator.js` are rewritten for
  the shared engine and keep their pixel assertions.

---

## 3. How it differs from today

| flaw today | root cause in the current design | how the new design makes it impossible |
|---|---|---|
| Lag (drag p90 150 ms, scrub p90 50 ms measured; "the browser hanging" with an empire selected) | Canvas 2D re-projects and re-tessellates tens of thousands of vertices per frame; settled-frame label layout and per-pixel relief on the CPU; offscreen-canvas compositing | Geometry resident on the GPU; projection is a uniform; labels follow anchors between layouts computed in a worker; relief is a texture lookup; a year change is a 64 KB table |
| Blocky borders, coasts, rivers | `world.js` at 2 dp (~1 km) and `ZMAX` raised to 120; polity rows simplified at 0.03°; five regional coast patch files | One finest-level coastline, topology-preserving simplification per LOD, tiles for the two finest levels; max zoom tied to the finest level's tolerance |
| Borders overlap or fail to meet | Each polity ships its own polygon; per-ring simplification "differs by a hair at the join"; eras from one source, polities from another, coasts from a third | One planar topology: neighbours reference the same arc; conflation merges near-coincident lines; `check-topology.js` fails the build on any overlap |
| Border drawn inland of the coast | Cliopatria's coarse coast stroked as border; patched with a 7 km band and edge runs | Coast snapping at build time: a face's boundary near the coast *is* the coast arc |
| Entities missing in years they should appear | 13 era snapshots step-resolved; countries unlocked by name and "founded" by heuristics; authored polygons with no time; 29 gaps fall back to timeless shapes | Every entity is a step series; a year's map is a set query; cards attach to entity ids with years; gaps are shown as gaps and listed on the card |
| "Temple of Artemis at Corfu", "Falernian wine" as places | Locator names fetched from the card's answer text; `atlasNameFits` then filtered by text match | A gazetteer with kinds checked against Wikidata classes; `within` collapses a site into its island; cards reference ids |
| Regions, rivers, islands marked with a red point | One marker for every locator kind | Taxonomy → area/line labels without markers; markers only for cities and sites |
| Labels overlapping, dropped, "a heap of words" | Per-frame greedy layout with ad-hoc separations per path | One ranked global layout in the worker, recomputed on settle, stable in motion |
| Peoples and states indistinguishable or hidden | Both are filled polygons; the people's dash is thin | Texture + type distinction; multiply blending; a stack chip |
| Two slightly offset coast lines; stray desert lines; "gold bloom" | Mixing `world.js` with era geometry; `coastEdges` heuristics; DOM gradient hacks for a compositor bug | One geometry; no heuristics; the limb is in the shader; one GL layer |
| 16 MB of lazy map data, 9.4 MB of it base64 PNG; 7.5 MB `polities.js` with 93 % redundant vertices | Per-feature duplicated rings; data-URI heightmaps | Shared arcs (14× smaller for polities); PNG textures as files; tiles on demand |
| Admin edits can shadow a rebuilt `timeline.js` | In-browser polygon editor writes `ADMIN_EDITS.timeline` | Geometry is build-only; admin edits touch place-card prose and card `places` |

**Reused, rewritten, dropped**

| reused as is or migrated | rewritten | dropped |
|---|---|---|
| `polity-spec.json` (164 Cliopatria matches, years, coast/sites flags) → input to `build-polities.js` v2 | all rendering, input, timeline and popup code in `PAGES.map`, `startCardGlobe` | `timeline.js` and `build-era.js` (historical-basemaps: licence in question, superseded by Cliopatria + present-day admin) |
| `state-capitals.js` (Wikidata P36 series) → gazetteer `city` steps | `build-polities.js`, `build-country-series.js` → one conflation pipeline | `country-series.js` (subsumed by steps), `world.js`, `coast/`, `rivers/`, `admin1.js`, `ranges.js`, `forests.js`, `uk.js`, `water.js`, `cities.js` (replaced by gazetteer + NE places in the build) |
| `.claude/ww2-plates/` georeferencing and `fronts.js` content → event faces | `fetch-place-coords.js`, `add-locators.js`, `add-card-wars.js` → `add-places.js` | `heightmap.js`, `heightmap-ultra.js` (data-URI relief) |
| `site-hulls.json` → soft faces | `test-personal-atlas.js`, `test-atlas-places.js`, `test-polities.js` → the suites of §2.11 | `mineCoastSkip`, `mineCoastCut`, `coastEdges`, `synthGroups`, `drawSovietRepublics`, `forceComposite`, limb DOM, the in-browser map editor and `ADMIN_EDITS.timeline` |
| `COUNTRY_INFO`, `COUNTRY_SOURCES`, `COUNTRY_STATS`, `COUNTRY_SPANS` → place cards (prose keyed by place id) | the Atlas help card (generated attribution) | `COUNTRY_YEARS` (gated off since August; Q-C2) |
| `card-war.js` in/out assertions → `check-topology.js` | Find-it's board and rounds (same rules, new primitives) | the five `MINE_STARTS` rails (one rail, Q-T1) |
| the four research notes and the audit's tiers → `sources.json` and the batch order | the Atlas help card's attribution → a Sources and credits page generated from bundle headers (§2.10a) | |

---

## 4. Features and improvements not asked for

**Cheap once the new base exists**

- **Palaeo-shorelines by sea level.** ETOPO carries bathymetry; a sea-level offset (−120 m at the
  Last Glacial Maximum, from a public-domain curve) redraws the coast in the shader for years before
  ~7000 BCE: Doggerland and Beringia appear as land. *Cost*: a uniform and a 1-D curve. *Caveat*: ignores
  isostasy and sediment; labelled "approximate" on the card.
- **An entity's own timeline.** Selecting a state shows its life as a bar under the rail with its
  change-years as ticks and its area over time as a sparkline (area computed at build). *Cost*: tiny.
- **"What changed this year".** The step diff between two years, computed geometrically ("Rome gains
  ~25,000 km² in Sicily; Carthage loses it") — derived, not written, so never fabricated. *Cost*: a
  worker function and a sentence template.
- **Compare two years.** A split or swipe view rendering the same scene twice. *Cost*: two style
  tables, one more face pass.
- **Journeys and routes.** `event` kind with arcs: Alexander's campaign, Xuanzang, the Odyssey's
  conventional route — animated along the rail. *Cost*: data per route; the primitive exists.
- **Capitals moving with the year** (Shang's Yin, Zhou's Haojing → Luoyang): `state-capitals.js`
  already has 174 rows. *Cost*: a city marker with steps.
- **Rivers named at zoom; islands named; seas named** — all fall out of §2.6.
- **Share a view**: `#map/<year>/<lon>/<lat>/<zoom>/<place>` deep links (half exists). *Cost*: small.
- **Day/night terminator** for the chosen date; an **astronomical** touch that costs one shader line.
- **Measuring tool**: tap two points → great-circle distance (metric first, imperial in brackets).
- **Study heat**: a toggle tinting faces by how many of the reader's cards touch them. *Cost*: a
  style table from the PA derivation.
- **"Where is this?" from a card**: every card's globe window gains "Open in the Atlas at
  <year>". *Cost*: a hash.
- **Find-it variants**: "where was the Battle of Cannae", "which state held Sicily in 250 BCE", "name
  this island" — draws from the gazetteer by kind; the ID pass scores the tap exactly.
- **Export the view** as a PNG (`toDataURL` of the composed frame) for notes and whiteboards.
- **Dated cities layer** from Reba et al. 2016 (*Spatializing 6,000 years of global urbanization*,
  Scientific Data; dataset stated CC BY 4.0 — *verify at fetch*): cities that existed in year *y*
  with population estimates. *Cost*: a build step and a tier rule.

**Larger follow-ups**

- **Three-dimensional relief** (vertex displacement on a sphere mesh from the height texture) — a
  real change to the sphere pass; striking at mountain ranges; costs GPU on phones; off by default.
- **Culture spread from dated site lists** (Bell Beaker from Bourgeois et al. 2025's arrival surface;
  Yangshao phases from Hosner): soft faces per phase. The data work is the cost, not the engine.
- **Ice sheets and glaciers by year** (Batchelor et al. 2019, CC BY — *verify*): an `event`-like
  natural layer. Pairs with palaeo-shorelines.
- **Physical-geography layers**: Köppen–Geiger climate zones (Beck et al. 2018, CC BY 4.0), WWF
  ecoregions (Dinerstein et al. 2017, CC BY 4.0), as faces in their own topology file.
- **Languages** (Glottolog, CC BY 4.0) as points/soft faces — a natural companion to the language
  decks.
- **A Find-it season / daily geography game** fed by the gazetteer through `dayPick()`.
- **Authoring from the map**: an admin mode that picks a place on the globe and writes `places` on the
  open card (no geometry editing; just id selection). Removes most of the batch-file friction.
- **Community decks with places**: `uDeckNormalize` accepting place ids (never coordinates) so a
  community card can light a gazetteer place; `SANITIZE_REV` bump.
- **Border provenance view**: colour arcs by source and precision — the honest map of what the map
  knows. Cheap to render, but a UX design question.
- **Historical coastlines where open data exists** (Dutch reclamation, the Mesopotamian shoreline):
  dated coast arcs in the topology. The engine supports it; the sources mostly do not.

---

## 5. Honest limits

- Where no open source gives a dated extent (the audit's tier-5 entities, the Delian League's
  members, Sparta without Messenia, most Italic and Iberian peoples, the pre-1000 BCE Zhou),
  the Atlas draws a soft labelled zone or nothing, and the card says why. No engine fixes that.
- Cliopatria's polygons are "atlas-style interpretations" with no stated uncertainty; the design
  labels them *approximate*, not *firm*, and says so once in the help card and on every card.
- Modern coastlines under ancient borders are a known anachronism (Sumer's Gulf); shown by default,
  flagged on the card, replaceable where a dated source exists.
- HydroRIVERS geometry stair-steps at the finest zoom; rivers stop being drawn one level before
  that becomes visible.
- Sizes in §2.3 are estimates until `pack.js` runs; the first phase of the build plan measures them
  before anything is committed to.

---

## 6. Questions for the owner — ANSWERED 2026-10-06

| T1 a | T2 a | T3 a | T4 **b** | S1 a | S2 a | S3 a | S4 a | S5 a | S6 (rule) |
|---|---|---|---|---|---|---|---|---|---|
| U1 a | U2 a | U3 a | U4 a | C1 a | C2 **b** | L1 a | L2 a | L3 a | L4 a |
| P1 a | P2 **c** | P3 **c** | P4 a | V1 a | V2 a | V3 **c** | V4 a | M1 a | M2 a |
| R3 a | R4 a | A1 a | A2 a | A3 a | A4 a | A5 a | A6 a | A7 a | |

Bold = the owner chose other than the recommendation; §2 has been revised for each. The questions
are kept below as the record of the options considered.

Each question lists the options and the recommendation (first, marked ★). Answers change §2–§4;
the phased build plan follows the answers.

### Years and time

- **Q-T1 — Range of the rail.** (a) ★ 10,000 BCE → today, compressed before 3000 BCE (sites and
  cultures only before 3400 BCE, when Cliopatria begins); (b) 4000 BCE → today as now; (c) a deep
  rail to 100,000 BCE for the human-origins cards (Blombos, Olduvai) with palaeo-shorelines.
  Recommendation: (a), with (c) as the follow-up it enables.
- **Q-T2 — Rail scale.** (a) ★ one rail, piecewise-linear with a knee so the last 2,500 years take
  ~70 % of the width, and a magnifier while dragging; (b) strictly linear; (c) the reader chooses a
  start year as today (five presets).
- **Q-T3 — Default year** on opening. (a) ★ the year the reader last used, else the median year of
  their studied cards; (b) always the present; (c) always the median year.
- **Q-T4 — Playback.** (a) plays through change-years only, at a chosen speed (1, 5, 25 years per
  second), crossfading at steps; (b) ★ **answered: (b)** plays every year; (c) no playback.

### Sources I may accept (each has a licence consequence)

- **Q-S1 — Coastline (the one source behind everything).** (a) ★ OpenStreetMap land polygons
  (ODbL): metre-scale, current, maintained; the topology files carry ODbL + "© OpenStreetMap
  contributors" and the help card says so; the site itself is untouched by share-alike. (b) GSHHG
  2.3.7 (LGPL): ~100–200 m, dated (2017), licence written for software not data. (c) Natural Earth
  10m (public domain): ~1 km, no licence obligations, but smooth coasts only to about today's zoom
  limit; detail tiles would not exist.
- **Q-S2 — Present-day country and admin-1 borders.** (a) ★ Natural Earth 10m admin-0 and admin-1
  (PD), as today; (b) OSM admin boundaries (ODbL, higher resolution, political choices made by OSM
  — Crimea, Kashmir, Western Sahara as "disputed" relations); (c) geoBoundaries CGAZ (CC BY 4.0).
  With (a) or (c) borders are coarser than an OSM coast at the finest zoom; the design snaps the two
  at the shore so no gap shows.
- **Q-S3 — Historical borders.** (a) ★ Cliopatria v0.2.0 (CC BY 4.0) as backbone, OHM (CC0) where
  the spec whitelists a better series, PD plates traced where the audit's batch 6 lists them; (b)
  Cliopatria only. historical-basemaps is unavailable by the owner's rule (§2.10a).
- **Q-S4 — Rivers and lakes.** (a) ★ HydroRIVERS + HydroLAKES (CC BY 4.0), order/area-filtered per
  LOD; (b) Natural Earth 10m rivers and lakes (PD), coarser, no LOD beyond one level; (c) OSM
  waterways (ODbL), best geometry, heaviest build.
- **Q-S5 — Relief.** (a) ★ ETOPO 2022 (PD, 15 arc-second, bathymetry included); (b) keep the
  AWS/Mapzen terrarium composite (mixed attributions); (c) SRTM/GMTED only (no bathymetry).
- **Q-S6 — Share-alike posture.** *Answered 2026-10-06*: the audit's §3 rule applies exactly
  (§2.10a). Share-alike inputs are acceptable only as a data file of their own carrying the licence;
  NC and unclear licences are excluded even as cross-checks. Q-S1 (a) and Q-S4 (c) remain open under
  that rule because ODbL is share-alike, not NC.

### Uncertainty and gaps

- **Q-U1 — How uncertainty is drawn.** (a) ★ the four-state scheme of §2.4 (firm / approximate /
  soft / disputed-hatched) with one sentence on the card; (b) two states only (firm, soft); (c) a
  numeric confidence shown as fill opacity.
- **Q-U2 — Gaps between steps.** (a) ★ draw nothing and list the gap on the card; (b) hold the
  last step with a dashed edge and "no source after N"; (c) hold silently as today.
- **Q-U3 — Cliopatria's steppe maximalism** (Huns, Scythia, Khazaria drawn at maximal hegemony).
  (a) ★ draw as *people* (soft, stippled) regardless of Cliopatria's "polity" type, per the audit;
  (b) draw as states; (c) draw both the hegemony (soft) and a core (from site data where it exists).
- **Q-U4 — Contested ground between two polities** in one year. (a) ★ a hatched face owned by
  both, both cards name it; (b) the later-dated row wins; (c) the larger polity wins.

### Peoples and cultures

- **Q-C1 — Visual language.** (a) ★ stipple + spaced italic, no border (§2.5); (b) dashed outline +
  flat wash as today; (c) only a label along the range, no fill at all.
- **Q-C2 — Which peoples appear in the Full Atlas by default?** (a) ★ all with a dated source;
  (b) only those a card links; (c) none until the legend toggle is switched on.

### Labels and markers

- **Q-L1 — Default label density.** (a) ★ "normal": at globe scale ~40 labels, at country scale
  ~120, phone one notch sparser; (b) sparse; (c) dense.
- **Q-L2 — Label typography.** (a) ★ small capitals for territories and regions, spaced italic for
  peoples, italic for water, upright for cities, in the theme's serif/sans as the site uses
  elsewhere; (b) one upright face for all, differentiated by size; (c) classic engraved-atlas look
  (serif throughout, letter-spaced) even in sans themes.
- **Q-L3 — City marker shapes.** (a) ★ square = capital, disc = major city, small disc = town,
  swords glyph = battle, ring = site; (b) discs only, sized by tier; (c) pins.
- **Q-L4 — Collapsing sites into their parent** (Temple of Artemis → Corfu). (a) ★ collapse until
  the parent is ≥ ~120 px across, then expand; (b) always show the site's own name; (c) show
  "Corfu · Temple of Artemis" as one label.

### The Personal Atlas

- **Q-P1 — What counts as studied.** (a) ★ a card the reader has reviewed at least once (has a
  record), as today; (b) a card that has reached "learned" (interval ≥ 7 days); (c) a card merely
  seen (opened) — includes browsing; (d) a per-reader setting with (a) as default.
- **Q-P2 — Books.** (a) ★ a book's places join the PA once the reader has read 10 % of it, its
  chapter places as the chapter is reached; (b) on opening the book; (c) books do not contribute.
- **Q-P3 — Glossary terms.** (a) ★ a term joins when its definition has been opened once;
  (b) only when it is studied through a card; (c) terms do not contribute.
- **Q-P4 — Collections toggle and hidden places** stay as today (per-collection on/off in the
  legend). (a) ★ yes; (b) also per-kind toggles (cities / sites / regions / states / peoples / wars).

### Visual style

- **Q-V1 — Overall look.** (a) ★ "quiet reference": land in the theme's paper tone, sea in its
  water tone, borders hairline, fills at ~30 %, relief as a subtle wash; reads as an atlas page in
  every theme; (b) "satellite-ish": relief on by default with stronger tints; (c) "flat": no relief
  at all, strong fills.
- **Q-V2 — Ocean depth tint** from bathymetry when relief is on. (a) ★ yes, subtle; (b) no.
- **Q-V3 — Graticule.** (a) ★ faint 15° lines, 5° past country scale; (b) none; (c) legend toggle.
- **Q-V4 — Selection.** (a) ★ brighter border + slightly lifted fill + the name in full; (b) fill
  only; (c) outline only.

### Mobile, offline, fallbacks

- **Q-M1 — Phone trade-offs.** (a) ★ DPR cap 2, one LOD coarser below 480 px, relief L2 never
  fetched on phones, label density one notch sparser; (b) identical to desktop; (c) a "lite" switch.
- **Q-M2 — Offline.** (a) ★ runtime cache plus a "keep offline" button for core + relief L0 + the
  tiles around the reader's places; (b) runtime cache only; (c) precache the core two files in the
  shell for everyone (adds ~3.5 MB to every install).
- **Q-R3 — No WebGL2.** (a) ★ a static Canvas 2D fallback at LOD 0 with a sentence, no timeline
  play; (b) a sentence only; (c) a full Canvas 2D renderer (doubles the engine).
- **Q-R4 — `file://` support.** (a) ★ works with the main-thread shim and without tiles (coast at
  LOD 2), because `fetch` of binary files fails on `file://` in Chromium — core data would be served
  as a `.js` twin of `topology.bin` generated by the same `pack.js` (base64, decoded on load; costs
  a second copy in the repo, ~4 MB); (b) `file://` shows a sentence pointing to a local server;
  (c) ship *only* the `.js` form for everything (works everywhere, ~15 % larger on the wire, parse
  cost on every load).

### Scope and migration

- **Q-A1 — Retire the in-browser map editor** and `ADMIN_EDITS.timeline`; geometry edits go
  through spec files and a rebuild, reviewed with `preview.js`. (a) ★ yes; (b) keep a read-only
  "inspect provenance" mode; (c) keep editing (then the topology must support live overrides —
  large).
- **Q-A2 — Place-card prose.** (a) ★ keep `COUNTRY_INFO` etc. for present-day countries, add
  entity cards for states/peoples at the same bar over time (the on-hold A9 plan resumes in the
  gazetteer), drop `COUNTRY_YEARS` (gated off since August); (b) keep `COUNTRY_YEARS` as the
  per-step paragraph; (c) prose only for present-day countries.
- **Q-A3 — The Full Atlas.** You considered removing it in September. (a) ★ keep both tabs: the
  Full Atlas is the discovery surface and the Find-it board; (b) Personal Atlas only, Find-it on a
  hidden full map; (c) Full Atlas only with "mine" as a highlight.
- **Q-A4 — Card windows** (map cards, locator windows, war shading). (a) ★ move to the shared engine
  in the same programme, so one geometry serves all; (b) leave them on the old renderer for now.
- **Q-A5 — Transition.** (a) ★ build v2 behind a `#map2` route until it passes the §2.11 suites,
  then swap and delete v1 in one release; (b) replace tab by tab; (c) ship v2 beside v1 as a reader
  choice for a while.
- **Q-A6 — Maximum zoom.** (a) ★ 1 px ≈ 150 m (coast tiles at LOD 4; about 5× today's limit);
  (b) 1 px ≈ 500 m (no LOD-4 tiles, ~60 % of the tile data); (c) as far as the data allows.
- **Q-A7 — Admin-1 everywhere?** (a) ★ only the three layers cards use (US, China, Russia) plus the
  UK nations, present-day; (b) admin-1 for every country (NE 10m, ~ +3 MB of tiles); (c) none.

---

## 7. Phased build plan

Rules that hold for every phase:

- **The site works and ships at the end of each phase.** v2 lives behind `#map2` (and its card
  windows behind a flag) until Phase 5 swaps it in; v1 is untouched until then. Every phase ends
  with CI green, the phase's own suite passing, and a changelog line only where a reader can see
  the change (Phases 0–2 are invisible to readers except the `#credits` page in Phase 1).
- **Data before code, measured before committed.** Every pipeline step is run and its outputs
  measured (`node .claude/check-sizes.js`, `check-topology.js`) before any renderer work depends
  on them; the §2.3 size estimates are replaced by measurements in this document as they land.
- **The source rule of §2.10a is enforced by the tooling**, not by memory: `fetch-sources.js`
  refuses a licence not on the list; `check-topology.js` refuses a face without a source.
- **Zero-dependency boundary**: `.claude/atlas-build/` has its own `package.json` (mapshaper,
  topojson-server, topojson-simplify, polygon-clipping, earcut, pngjs, proj4) with `node_modules`
  ignored; a session runs `npm ci` there. Everything CI runs (`check-topology.js`, the Playwright
  suites) stays dependency-free apart from Playwright reached through `NODE_PATH` as today.
- **One doc.** This file is the design; `docs/atlas.md` is rewritten in Phase 5 to describe v2 as
  built and this file becomes the record of why. Until then `docs/atlas.md` describes v1, which is
  still live.
- **Sessions** below are rough guesses for orientation, not commitments; quality decides.

### Phase 0 — Foundations and the measured spike (invisible; ~3–4 sessions)

*Goal: prove the two load-bearing assumptions — the binary topology fits the size budget, and a
WebGL2 renderer of arcs and faces holds the frame budget on the CI runner — before anything else is
built on them.*

Deliverables:
1. `.claude/atlas-build/` scaffold: `package.json`, `sources.json` (schema: id, name, version, url,
   sha256, licence ∈ {PD, CC0, CC-BY-3.0, CC-BY-4.0, ODbL-1.0, CC-BY-SA-4.0, GPL-3.0}, licenceUrl,
   attribution, retrieved), `fetch-sources.js` (verifies sha256, refuses unlisted licences, caches to
   `.claude/atlas-build/src/`, git-ignored), `lib/format.js` (the `.bin` writer and a zero-dependency
   reader shared with the checker and the runtime), `lib/log.js` (the snap log).
2. First entries in `sources.json`: Natural Earth 10m coastline + admin-0 + populated places (PD),
   Cliopatria v0.2.0 (CC BY 4.0), ETOPO 2022 (PD), HydroRIVERS and HydroLAKES (CC BY 4.0), OSM land
   polygons (ODbL) — each URL verified reachable through the proxy (`check-reach.js` gains them).
3. **Spike A (data)**: `build-land.js` on Natural Earth 10m only (fast to iterate) → `topology.bin`
   with coast arcs at LOD 0–2 and present-day admin-0 faces; `pack.js`; measured size.
4. **Spike B (renderer)**: `atlas/atlas-gl.js` sphere pass + arc pass + face pass + ID pass;
   `atlas/atlas.js` with drag, wheel, pinch, keyboard; `atlas/atlas-worker.js` with earcut
   triangulation; `#map2` route rendering Spike A's data, present day only, no labels, no timeline.
5. `test-atlas-perf.js`: the scripted drag/pinch/scrub harness (the one used for the measurements in
   §2.2), asserting the §2.2 budgets; run against v1 (`#map`) and v2 (`#map2`) and printing both.
6. `sw.js`: `CACHEABLE` regex gains `bin`; `_headers` unchanged (checked by `test-csp.js`).

Test that proves the phase: `node .claude/atlas-build/check-topology.js` passes on Spike A
(planarity, every arc referenced); `test-atlas-perf.js` shows v2 p95 ≤ 20 ms and max ≤ 100 ms
during drag and pinch on the CI runner with software GL, while v1 on the same run shows its current
p90 of ~150 ms; `topology.bin` for Natural Earth is ≤ 1.5 MB. **Gate**: if either budget is
missed, the design is revisited here, not patched later.

#### Phase 0 — as built (2026-10-08)

Everything in the deliverables list exists and runs: `.claude/atlas-build/` (its own `package.json`,
`sources.json` with eight pinned entries, `fetch-sources.js`, `lib/format.js` re-exporting the one
shared reader/writer `atlas/atlas-format.js`, `lib/log.js`, `lib/geo.js`, `build-land.js`, `pack.js`,
`check-topology.js`), `atlas/` (`atlas-gl.js`, `atlas.js`, `atlas-worker.js`, `vendor/earcut.js` 3.0.1
ISC, `data/topology.bin`), the `#map2` route and the lazy `atlas2` bundle in `app.js`, `bin` in the
service worker's cacheable list, `#map2` in `test-csp.js`, `.claude/test-atlas-perf.js`, and the
workflow's syntax and `check-topology` gates. `check-reach.js` probes the five new hosts by HEAD.

**Gate 1 — size: passed.** `topology.bin` is 1.24 MB (the §2.3 table above). `check-topology.js`
passes 27 of 27 on it: planar at every level (no two drawn segments cross among 33k / 123k / 376k),
rings close, every border two-sided or flagged disputed, every coast arc one-sided and land-left,
Σ faces = 146,719,901 km² against 146,720,187 km² of land (286 km² unmapped), every arc and face
traced to a header source.

**Gate 2 — frame budget: NOT met as written, with the comparison on the record.** Measured by the
suite on the CI-class runner (4 cores, Chromium 141, ANGLE/SwiftShader), rAF-to-rAF intervals in ms,
v1 = `#map` Full atlas, v2 = `#map2`:

| gesture | target | mean | p50 | p90 | p95 | max |
|---|---|---|---|---|---|---|
| drag | v1 | 80.6 | 16.7 | 250.0 | 250.1 | 516.7 |
| drag | v2 | 27.6 | 16.7 | 66.6 | 66.7 | 83.4 |
| wheel | v1 | 170.9 | 16.7 | 516.7 | 549.9 | 583.3 |
| wheel | v2 | 30.3 | 16.7 | 66.7 | 100.0 | 166.7 |
| pinch | v1 | 177.7 | 16.7 | 566.6 | 566.7 | 899.9 |
| pinch | v2 | 16.7 | 16.7 | 16.7 | 16.8 | 16.8 |
| scrub | v1 | 62.5 | 16.7 | 216.7 | 233.3 | 300.0 |

v2 is 3–7× faster than v1 on every gesture and its worst frame is a sixth of v1's, the pinch and the
max budgets pass, the CPU side of a frame is 0.2 ms — and the drag's p95 is 67 ms, not 20. The
reason is not the architecture: calibrated on the same runner with a synthetic page, SwiftShader
rasterises about 750k tiny triangles per second (50k triangles → 66 ms a frame; 600k → 1.4 s), and
MSAA 4× triples that; so a 20 ms frame holds roughly 15k primitives, and the globe view at LOD 0
draws 35k face triangles plus 24k line segments after culling. Instancing is far worse there
(≈ 25 µs per instance: the design's instanced arc quads cost 0.9 s a frame at globe scale and 5 s
zoomed in), which is why the arc pass was rebuilt as one vertex-pulled triangle per segment. On any
GPU the same frame is trivial; the budget as worded ("on the CI runner with software GL") measures
the runner, not a reader's phone. **Decision for the owner, per the gate's own rule**: (a) keep the
software-GL figure as the comparison it is and set the gate at a GPU-class device or at a
software-GL budget the measured rate allows (≈ 35 ms p95 at LOD 0 would pass today); (b) hold the
20 ms and make LOD 0 a ~15k-primitive level (a 20–25 km tolerance, 1.5 px at globe scale); or
(c) rasterise fills into a texture once per year change and keep only lines as geometry — which
moves the cost to year changes, exactly where §2.4 wants it cheapest. None of these is patched in;
the renderer is left honest at the measured number.

**Load.** Locally served: fetch 109 ms for 1.30 MB, first paint 0.67 s after navigation (LOD 0
triangulated in 235 ms), all three levels in 2.3 s in the worker (44k / 169k / 634k triangles,
33k / 123k / 376k segments), uploads 18 / 80 / 43 ms. The design's "under two seconds" is about right.

**Decided in Phase 0 where the design was silent** (each is in the code's own header too):
quantum 2.5·10⁻⁴° (28 m: 0.19 px at the deepest zoom of Q-A6, 0.03 px where this file's finest level
is first drawn; measured against 10⁻⁴° at 1.66 MB and 2·10⁻⁴° at 1.47 MB); LOD tolerances 8 / 2.5 /
0.5 km as plain Visvalingam √area (mapshaper's `interval` is 0.65·√area, so its "500" is our 770);
a level is used from 16 / 5 / 1 km per pixel down; fills are triangulated **per level** from the
same simplified ring as the stroke, not once at the face's own precision — the two then agree
exactly and the globe view draws a tenth of the finest level's triangles; chord subdivision at
4.1° / 2.3° / 1.0° (a quarter pixel of sag at each level's first use); 384 direction buckets with
bounding caps, culled against the viewport's cap per frame; MSAA off (every fill edge sits under an
anti-aliased line); a `flags` byte per arc with `DISPUTED` for a border the sources disagree on;
present-day steps dated `[2022, null]` (null = open); entity ids `adm0:<ADM0_A3>`; the zoom cap at
0.5 km/px until tiles exist; a sentence on `file://` (the `.js` twin of Q-R4 is Phase 1 work).

**Conflation on Natural Earth, as found.** The admin-0 theme (5.1.1) and the coastline theme
(5.0.0-pre9) are different releases: 15,206 of Antarctica's 15,955 admin vertices are on the
coastline, 749 are not (the Ronne ice front); the Maldives' are all exact; Fiji's and Russia's
antimeridian pieces are cut at 179.999, not 180; the coast's own two sides of the cut miss by 22–156 m
at 16 endpoints; the admin theme has four spikes, several vertices at the pole, and 14 rings (islets,
reefs — Bajo Nuevo, Serranilla, the Spratlys lose their face) with no land in the partition. The
rules that handle this, in `build-land.js`: exact-key matching; a border's end beside a coast vertex
projects onto the nearest coast segment within d₁ = 1 km; a run of one polygon's own vertices between
coast vertices is coast only if its projections follow one ring in one direction and the coast path is
no longer than 1.5× the run (Ceuta's land border fails this and stays a border); a consecutive pair
both shared with one neighbour is that neighbour's border edge and ends a coast run (the 49th parallel
at Point Roberts, Gibraltar's fence); runs are expanded only after every coast ring has its land-left
direction, and a run walking against it is a chord across water (the San Juan's bar); seam vertices
snap to the meridian and seam ends to the coast's crossing; pole vertices collapse to one point;
spikes and spurs are cut; a junction-free island cycle is cut at its smallest vertex so the admin ring
and the coast ring dedupe. What remains is counted, not hidden: 13 disputed one-sided borders
(196 km in all, the longest the 115 km ice front), 5 coast slivers (1.1 km), 50 coast arcs no face
claims (286 km²). **This contradicts §2.3's "snap within d₁" as the whole story: Phase 1's
`build-admin.js` must also clip faces to the land partition and merge slivers (the d₂ step), or the
disagreements above become visible fills over sea at the ice front.**

**Other findings that contradict or sharpen the design.** `gl.finish()` returns at once under
ANGLE/SwiftShader and cannot time a pass; rAF intervals with the pass toggles in `atlas-gl.js`
(`debug.sphere/faces/arcs/cull`) are the measure. github.com's archive and API answer 403 from the
sandbox, so Cliopatria is pinned at `raw.githubusercontent.com/…/v0.2.0/cliopatria.geojson.zip`;
ETOPO 2022's THREDDS paths are 404 and the file is
`https://www.ngdc.noaa.gov/mgg/global/relief/ETOPO2022/data/60s/60s_surface_elev_gtif/ETOPO_2022_v1_60s_N90W180_surface.tif`
(466 MB, serves relief L0–L2; the 15 arc-second grid is 288 tiles of 15° under `…/data/15s/15s_surface_elev_gtif/`).
The OSM land-polygon file has no versioned URL; its pin goes stale by design when the daily build
changes. Every large source was streamed and hashed (Cliopatria 44 MB, ETOPO 466 MB, HydroRIVERS
544 MB, HydroLAKES 820 MB, OSM 923 MB) so `sources.json` carries real pins; only Natural Earth is
cached in `src/`.

### Phase 1 — The present-day earth, at every zoom (ships `#map2` as a preview; ~6–8 sessions)

*Goal: the physical and present-day map complete — one coastline source, LOD tiles, rivers, lakes,
relief, labels, picking, the credits page — with no timeline yet.*

**Phase 1 is built in four sub-phases (split 2026-10-08):**

| sub-phase | scope (the deliverables below it covers) | state |
|---|---|---|
| **1a — land at every zoom** | the OSM land partition (1), admin-0 and admin-1 conflated onto it (2), LOD 3–4 as tiles with per-tile fills, the renderer's tile fetch, level selection and the 150 m/px cap, the checker on tiles, the redefined frame gate (§2.2), the build doc (9) | **built — see "Phase 1a — as built" below** |
| 1b — water and relief | rivers and lakes (3), relief (4) and the sphere pass's relief lookup, the minimal layers control | **built — see "Phase 1b — as built" below** |
| 1c — names and picking | the gazetteer (5), the label layer, markers, hover, the stack chip, the place card, deep links, the legend, the phone layout (6) | **built — see "Phase 1c — as built" below** |
| **1d — reader-ready** | the `#credits` page (7) — the phase's one reader-visible change, with its changelog line and version bump —, English names with one row per place, the About sheet, the fallbacks (8): no-WebGL2, `file://` via the `.js` twins, context loss, a failed worker; the phone audit, the accessibility audit, the long-session memory proof, the owner's frame-gate rules of 2026-10-09 | **built — see "Phase 1d — as built" below** |

Deliverables:
1. `build-land.js` on **OSM land polygons** (Q-S1 a): finest-level land/sea partition; LOD 0–4 by
   topology-preserving simplification; LOD 3–4 as `tiles/{z}/{x}/{y}.bin`; the ODbL header on every
   file that carries OSM-derived arcs.
2. `build-admin.js`: Natural Earth 10m admin-0 for the 258 countries, admin-1 for the US, China,
   Russia and the UK nations (Q-A7 a), conflated onto the land partition (coast arcs shared; the snap
   log; `check-topology.js` coast invariant).
3. `build-water.js`: Natural Earth 10m rivers (scale-rank-filtered per LOD, Chaikin-smoothed in the
   worker; HydroRIVERS failed the licence check — 1b) and HydroLAKES (area-filtered per LOD) into a
   water topology and water tiles of their own.
4. `build-relief.js`: ETOPO 2022 → `relief/L0.*.png`, `L1/*.png` (hillshade + 16-bit height as three
   greyscale planes; L2 measured and left out — 1b); sphere pass relief lookup, hypsometric ramp per
   theme, bathymetry tint (Q-V2 a), strength slider; off by default.
5. `build-gazetteer.js` v0: countries, admin-1 units, capitals and major cities (NE populated
   places), seas and lakes (names from the sources' attributes), islands (derived from coast faces
   ≥ a size threshold, named from NE `minor_islands` / Wikidata where available), with label paths
   (pole of inaccessibility + principal axis) computed here.
6. Renderer: LOD selection and tile fetching with an LRU; the Canvas 2D label layer with the §2.6
   layout in the worker (rank, grid, settle/zoom recompute, stable in motion); markers per §2.6
   (Q-L3 a); hover name; the stack chip; the place card for present-day countries reusing
   `COUNTRY_INFO`, `COUNTRY_STATS`, `COUNTRY_SOURCES`, `COUNTRY_SPANS` keyed by place id; deep links
   `#map2/<lon>/<lat>/<zoom>/<place>`; the legend (borders, names, cities, rivers, water, relief,
   graticule toggle (Q-V3 c)); phone layout (bottom sheet, DPR cap, coarser LOD, sparser labels).
7. `#credits` page generated from bundle headers (`atlas/data/credits.js`), linked from the Atlas
   help, the footer and Settings — **the one reader-visible change of this phase**, so it gets a
   changelog line and a version bump.
8. Fallbacks: no-WebGL2 static Canvas 2D at LOD 0 with a sentence (Q-R3 a); `file://` via the
   `.js` twin of `topology.bin` and the main-thread worker shim (Q-R4 a); `webglcontextlost` rebuild.
9. Docs: `docs/atlas-v2-build.md` (how to run the pipeline, where the cache lives, how to add a
   source), indexed in `docs/README.md`.

Tests that prove the phase: `check-topology.js` (planar, coast-snapped, shared borders, licences);
`test-atlas-render.js` (ID pass at 40 sample points → the right country/sea/lake at three zooms;
screenshot references for six views); `test-atlas-perf.js` with LOD-4 tiles loaded over Greece and
the Netherlands; `test-atlas-labels.js` (no overlapping rects; island/sea/river labels have no
marker; contrast per theme; density stops); `test-atlas-a11y.js` (Tab walk, announcements, reduced
motion); `test-csp.js`; `test-layout.js` for the `#credits` page at phone width. Measured sizes
replace the estimates in §2.3.

#### Phase 1a — as built (2026-10-08)

Everything in the 1a row of the table above exists and runs. In `.claude/atlas-build/`: `lib/shp.js`
(a streaming shapefile reader — the OSM file is 1.3 GB unpacked and never sits in memory whole),
`lib/rings.js` (quantisation to 2.5·10⁻⁴°, spike cutting, monotone Visvalingam), `lib/coastfile.js`,
`lib/segindex.js` (a radix-sorted segment grid whose pair sweep over 6.4 M segments takes a minute),
`build-land.js` (OSM → `out/coast.bin`, with `--census`), `build-admin.js` (the conflation, twelve
stages, → `out/full.bin` and the snap log), `pack.js` (`--dry`, `--install`), `check-topology.js
--tiles`, and `sources.json` with the `ne-10m-admin1` pin. In `atlas/`: `atlas-format.js` v2 (arc
kinds COAST, BORDER, RIVER, LAKE, SOFT, ADMIN1 and EDGE; flags DISPUTED and WATER; the `arcRef` and
`faceRef` sections a tile uses to name its core arc and face; a `tile` header and the core's `tiles`
index), `atlas-worker.js` (a tile is triangulated exactly like a level; tiles bucketed on their own
16×16 grid, admin-1 segments kept as a second list), `atlas-gl.js` (tile upload and drop, the stencil
pass that draws a loaded tile where it is and the coarser level only where no tile covers, 1,536
direction buckets, the sphere pass bounded to the disc) and `atlas.js` (tile addressing from the
header's index, an LRU of 96 tiles with six fetches in flight, the level from km/px with the cap at
150 m/px, admin-1 below 4 km/px, the `#map2?perf` overlay, and `setView` / `tilesSettled` /
`statsNow` for the suites). `app.js` routes `#map2?perf`; `.claude/test-atlas-perf.js` asserts the
redefined gate; `.claude/atlas-shots.js` takes the screenshot series; `docs/atlas-v2-build.md` says
how to run it all; CI runs `check-topology.js --tiles --max-bytes 3145728`.

**The land partition, as measured.** The OSM land polygons (planet data of 2026-10-08) hold 833,308
records, 647,462 rings and 46.9 M vertices; 185,833 degenerate vertices and 1,534,510 spikes go at
quantisation; 15 rings are cut at the antimeridian and rejoined by latitude (one seam end snapped
28 m). The working set at the finest tolerance, 75 m, is 195,536 rings and 6.25 M vertices (451,933
rings — islets under about 75 m across — exist only in the reserve). The vertex census that fixed
the tolerances is in §2.3; per level the topology carries 428,585 / 547,255 / 1,247,877 /
2,168,031 / 6,603,880 vertices (cumulative, lines included; LOD 0 draws 33,496 segments and 54,911 fill triangles for the whole earth, LOD 1 156,611 and 244,699, LOD 2 882,018 and 1,356,629). Rings are simplified one at a time, so
at 75 m two neighbouring rings, or two reaches of one, cross: **13,925 crossings** in the working set.
`build-admin.js` now makes the set planar before any line touches it, re-adding the largest reserve
vertex between the ends of each crossing segment, pass after pass: 35,730 vertices over 16 passes,
694 crossings left (OSM edges that cross only after quantisation) for the per-level repair's
junctions. 5,725 coast vertices coincide with one of another ring (rings touching at a point); they
share an id only where a line reaches that point. 130,519 working rings under 0.1 km² are invisible
to the lines: a border threaded through two overlapping marsh fragments (Smith Island, the Maryland
to Virginia line) had leaked the sea onto the land in the face walk, and a 28 m islet carries one
side's label without harm.

**Conflation, as measured.** The two distances the design asked for first:

| distribution (metres) | n | p50 | p90 | p95 | p99 | beyond |
|---|---|---|---|---|---|---|
| NE admin-0 border end → nearest OSM coast | 358 | 407 | 1,402 | 1,653 | 3,499 | 2 past 20 km |
| unshared NE admin-0 vertex → nearest OSM coast | 162,826 | 484 | 3,765 | 10,717 | 31,185 | 2,124 past 60 km |

So d₁ = **4,000 m** (every end but the two outliers, which are river-bank vertices far inland) and
D_FAR = **2,500 m**: an unshared NE vertex nearer the coast than that is Natural Earth's version of
the shore and contributes no geometry; one farther, on OSM land, is a one-sided line (a river bank
or lagoon shore NE draws as water — 20,935 such vertices, 22,641 edges, flagged DISPUTED). The NE
polygons yield 136,953 shared border edges; 4,053 rings share no vertex with any neighbour (islands,
continents of one country) and contribute no line at all. Cutting: 858 line/coast crossings (666 in
the first round, the rest where a crossing snapped onto a coast vertex grazed the next segment), 9
line/line crossings (overlapping NE polygons), 49 line vertices within a quantum and a half of the
shore snapped onto it. Ends: 3,109 joined to the coast or an admin-0 line (2 admin-1 ends onto
admin-0 lines), 283 tails over water cut back to the shore, 3 ends left over water (the India to
Pakistan line in the Rann of Kutch, a Russian line in the Bering Strait, the Michigan to Ohio line
in Lake Erie), 2 admin-1 ends that nothing could take (Texas to Louisiana and Alabama to Florida,
both at estuary mouths beyond 4 km of OSM coast). Every snap is in `out/admin-log.json`: 3,158, the
largest 3,930 m, none over its source's tolerance. The face walk: 393,354 cycles from 404,530
half-arcs — 197,715 land (39 holes) and 195,639 sea, **no cycle walking coast on both sides**.
Labelling: 36,654 land pieces by containment (one tie, 893 km² at the Congo's mouth that NE gives to
both the DRC and Angola — it went to the first), 159,371 by proximity (an islet within 60 km of one
polygon), 1,651 unmapped, of which 7 slivers merged into their longest neighbour and 1,644 stay
unmapped: 784 km² of remote islets with no NE polygon within 60 km, 153 of them over 1 km², the
largest 40 km²; the entity `adm0:scr` (Scarborough Reef) has no land. Admin-1: 8,789 pieces by
containment, 18,839 by proximity, no unit without land; 19 NE "border" arcs that lie between two
units of one country became admin-1 arcs. Arcs dropped: 1,681 with the same entity on both sides,
42 dangling; 148 flagged WATER. 257 admin-0 faces and 173 admin-1 faces. The per-level crossing
repair (reserve vertices re-added, junctions where no reserve exists): 914 / 6,777 / 16,280 /
15,677 / 848 vertices at LOD 0 to 4 over 8 / 9 / 16 / 15 / 3 passes, no residual crossing at any
level; 405 crossings became a junction vertex and 171 a shared endpoint.

**What conflation could not resolve, and how it is counted.** Unmapped land: 784 km² (above).
Lines over water: 148 arcs flagged WATER (drawn dashed, in no face). One-sided lines: 260 admin-0
and 30 admin-1 arcs flagged DISPUTED. Ends: 3 over water, 2 unjoined (above). Tiny rings: no count
of lines that cross one, by design. Coast crossings that no reserve could fix: 694 at stage 0, each
made a shared vertex by the per-level repair. Angle ties at a node: 5, all at closed border loops.
Pieces without an interior sample point: 69 (slivers thinner than the sampler's step; they fall
back to their first vertex). Everything is in `out/admin-report.json` and `out/admin-log.json`.

**Tiles and the fill decision.** §2.3 records the decision (every tile carries each face clipped to
its rectangle, closed by EDGE chords that are never stroked). Measured: z=3 has 32 tiles, 5.33 MB,
67,893 arc pieces, 596 face pieces and 706 chords; z=4 has 382 tiles, 17.72 MB, 203,371 arc
pieces, 1,345 face pieces (45 of them whole-tile covers, 38 in tiles no arc touches) and 3,788
chords. Seams: the checker proves every tile planar in its own plane, every chord on its tile's
boundary, every arc piece chained across tiles to the same core arc, and what a face's chords cover
along a shared tile line identical from both tiles (1,047 face×line pairs at z=4, 156 at z=3); the screenshot
series (`.claude/atlas-shots.js`: the Aegean, the Dutch coast and the Norwegian fjords at 6, 0.6 and
0.15 km/px, plus the cap view mid-load) was reviewed by eye for stair-stepping, fill/line gaps, tile
seams and the stencil fallback — see "Screenshots" below.

**The checker.** 71 checks on the core and every tile. New in 1a: 48 inland Natural Earth
populated places (plus Maseru, Lesotho's interior, Adygea and the South Pole) must be in the right
country and 22 open-water points (the Caspian, Hudson Bay, the Black Sea and open ocean among them)
in no face, at every level and in every tile; the tile index matches the directory; every tile's
`buildId` is the core's; per-tile planarity is tested in the lon/lat plane the tile is cut in (on
the sphere a chord along a parallel is a great circle that sags poleward — 0.004° over 2° of
longitude at 56° N — and would "cross" a coast hugging the edge; the renderer subdivides chords
before projecting, so the plane is the right model).

**The frame gate, as measured** (the CI-class runner: 4 cores, Chromium 141, ANGLE/SwiftShader;
rAF-to-rAF intervals in ms; v1 = `#map` Full atlas, v2 = `#map2`; `test-atlas-perf.js` on the
build above):

| gesture | target | mean | p50 | p90 | p95 | p99 | max |
|---|---|---|---|---|---|---|---|
| drag | v1 | 86.4 | 16.7 | 283.2 | 316.6 | 366.7 | 616.6 |
| drag | v2 | 30.9 | 16.7 | 66.7 | 83.3 | 83.4 | 100.0 |
| wheel | v1 | 249.8 | 16.7 | 583.4 | 733.2 | 2650.0 | 2650.0 |
| wheel | v2 | 38.0 | 16.7 | 83.3 | 150.0 | 200.0 | 200.0 |
| pinch | v1 | 187.4 | 16.7 | 566.7 | 666.6 | 899.9 | 1066.7 |
| pinch | v2 | 16.7 | 16.7 | 16.7 | 16.8 | 16.8 | 16.8 |

The ratios: drag 26 %, wheel 20 %, pinch 3 % of v1's p95 — all under the 40 %; the pinch's worst
frame is 16.8 ms. **The drag's worst frame sits on the gate**: 83.4 and 100.0 ms in the suite's two
confirmation runs (the steady drag frame is 50–67 ms, p95 83; the worst is a single frame per run,
six refreshes at 60 Hz, which the rAF clock reports as 100.0 or 100.1). The suite opens its window
after one warm frame, because the first draw after a pause costs the browser a vsync or two
(measured: 100 ms where the next frames read 50–67), and allows a millisecond of timestamp slack on
the 100 — a seven-refresh frame, 116.7 ms, still fails. If the gate flakes on a slower CI runner,
that is the number to read; the renderer has one more cheap lever (below). Phase 0's wheel
spikes (max 167 ms, p95 100 ms) are gone as spikes: a wheel frame now costs what a drag frame costs
at that zoom (the warm draw at upload took the first-use stall out; what remains — p95 150, max
200 — is the wheel passing through the Europe-scale LOD 2 view, the heaviest resident level, which
the owner's gate does not bound by a worst frame). The four fixed views and their budgets (triangles and line segments drawn in
one still frame, the budget 1.25× the measurement, stored in the test):

| view | km/px | LOD | tiles | triangles | segments | drag p95 / max |
|---|---|---|---|---|---|---|
| globe | 24 | 0 | — | 42,529 | 19,917 | 67 / 83 |
| Europe | 3 | 2 | — | 133,348 | 101,049 | 133 / 150 |
| the Aegean | 0.5 | 3 | 1 | 25,892 | 22,750 | 50 / 67 |
| the Aegean at the cap | 0.15 | 4 | 1 | 20,366 | 18,297 | 33 / 33 |

**Where the worst-frame rule stood, and what was done.** With LOD 0 at 8 km the drag's worst frame
was 150 ms, then 116.7 ms, against the owner's 100. A probe with the pass toggles showed a globe
frame in SwiftShader is vertex-bound and steady — every rendered frame cost 85–115 ms, none was a
spike: the arc pass about 45 ms (one triangle per segment, three vertex-shader runs each), the fill
pass about 35 ms, the sphere pass about 10 ms, and a frame with all three off never missed 16.7 ms.
So: the cull buckets went from 8×8 to 16×16 cells per cube face (−5 % at the globe, where the near
hemisphere simply holds more coast than the Pacific side, −18 % over Europe); the sphere pass draws
a quad around the disc instead of the whole screen; admin-1 segments are a list of their own and are
not submitted at all above their threshold (an eighth of LOD 0's segments); and LOD 0 was rebuilt
at 10 km (§2.3), which took its coast from 29,918 to 23,132 segments (its vertex count in the file
barely moved — arc endpoints, two per arc for 200k arcs, are rank 0 whatever the tolerance). The
figures in the tables are the result: the globe frame went from 85–115 ms to 67–100 ms. Reader
hardware with a GPU draws the same frame in a few milliseconds, which the `#map2?perf` overlay
shows on the owner's phone; the next lever, if CI ever needs it, is the arc pass (a triangle per
pair of segments would halve its vertex-shader runs).

**Findings that contradict or sharpen the design.** (1) §2.3's "snap within d₁" is not the whole
of conflation, as Phase 0 warned: the NE shoreline is never used as geometry at all — shared NE
vertex runs are borders, NE's own shore vertices near the OSM coast are discarded, and NE's shore far
from it (river banks, lagoons) is a one-sided DISPUTED line; faces are what the walk makes of the
OSM partition cut by those lines, and slivers merge into the neighbour with the longest shared
edge. (2) OSM's coastline treats the Great Lakes, Lake Victoria and the Caspian as land — they are
inland water, not coastline — so no face ends at their shores; the checker's "sea" points were
chosen accordingly and Phase 1b's lakes will draw them. (3) A tile is planar in the lon/lat plane,
not on the sphere (above). (4) A face that circles a pole must be closed by its first vertex one
lap on, then the pole, or the strip between the ring's two seam vertices tests outside — Antarctica
had no z=4 pole row until this was found. (5) The OSM land polygons cannot be dated to a citable
copy: osmdata.openstreetmap.de regenerates the file daily at one URL and no dated archive of it
exists (Zenodo and the Wayback Machine searched 2026-10-08); the pin in `sources.json` is a sha256
and the planet date from the file's own README, and the committed `atlas/data/` is the citable
artefact — the pipeline reproduces it from a re-fetch, not bit-identically. (6) Two LOD-4 repair
loops that never ended — a junction made 42 times beside an existing vertex at Durrës, and a
reserve read across two rings sharing a junction vertex — are the kind of fault the per-level
repair hides behind "40 passes": both are fixed and the pass count is in the report.

**Screenshots, reviewed.** The series (`.claude/atlas-shots.js`, 1280×800, twelve shots) was
read by eye on the final build. At the cap (150 m/px, LOD 4): Mykonos and Tinos, the Sognefjord's
inner arms and Texel with Den Helder show no stair-stepping — the 75 m tolerance is half a pixel
and the quantum a fifth — and the fill edge sits under the stroke everywhere, with no sea-coloured
gap and no land over water. At 0.6 km/px (LOD 3, the first tile level): the Cyclades, the fjord
coast from Stavanger to Ålesund and the Wadden islands are drawn from one tile each with no seam
where the tile meets the resident level outside it. At 6 km/px (LOD 1): Europe from Iceland to the
Caspian, with the admin-1 lines correctly absent above 4 km/px. The mid-load shots of the cap views
show the LOD 3 parent tile in the stencil's place of the pending LOD 4 tile — at this zoom the two
are hard to tell apart, which is the point: a tile on its way is a patch of slightly coarser coast,
never a hole. Two things the shots show that are not faults: the IJsselmeer is land, because OSM's
coastline stops at the Afsluitdijk (inland water is Phase 1b's), and the globe at LOD 0 looks the
same at 10 km as it did at 8 km.


#### Phase 1b — as built (2026-10-08)

Everything in the 1b row of the table above exists and runs, with one source refused under the licence
rule and one level of the relief pyramid left out under the budget — both below. In `.claude/atlas-build/`:
`lib/landindex.js` (the committed z=4 land tiles as a queryable partition — nearest coast segment and
point-in-land over 6.2 M coast segments, loaded in 5 s — the owner's rule that 1b never re-downloads
OSM), `build-water.js` (rivers and lakes → `out/water-full.bin`; `--measure` prints the distance
distributions), `pack-water.js` (→ `atlas/data/water.bin` and `atlas/data/water/<x>-<y>.bin`, with a
`--min-km2` floor for the tiles), `build-relief.js` (→ `atlas/data/relief/`), `check-water.js` and
`check-relief.js`, and `sources.json` with `ne-10m-rivers` added, `etopo-2022-60s` corrected to CC0 with
the NCEI statement, `hydrolakes` with its own licence page, and `hydrorivers` moved to a `blocked` list
that `fetch-sources.js` never reads. In `atlas/`: `atlas-format.js` gains `FLAG.INTERMITTENT`;
`atlas-worker.js` parses the water file and the water tiles into lake fills, lake shores and rivers
(the rivers also smoothed), and composes the three relief planes into one RGB array on an
`OffscreenCanvas`; `atlas-gl.js` draws water and relief under the stencil rules of §2.2 and §2.7, with
width and colour per arc kind and an `uIdBase` so water arcs live above 2²¹ in the id space;
`atlas.js` loads water and relief on demand through one tile loader for land tiles, water tiles and
relief tiles alike, carries the layers control (relief and its strength, rivers, lakes, graticule;
`R` toggles relief) remembered in `localStorage` behind try/catch, and re-reads the palette and the
ramp on a theme change. `.claude/test-atlas-perf.js` asserts the extended gate in **its own CI job**
(`atlas-perf` in `checks.yml`), `.claude/test-atlas-relief.js` the land/sea rule, `.claude/atlas-shots.js`
takes the review series; CI's fast job runs `check-water.js` and `check-relief.js` beside
`check-topology.js`.

**HydroRIVERS failed the licence check and is not used.** Its product page (hydrosheds.org/products/
hydrorivers, read 2026-10-08) says the data "are distributed under the same license agreement as the
HydroSHEDS core products, which is included in the HydroSHEDS Technical Documentation". That document
(HydroSHEDS_TechDoc_v1_4.pdf, April 2022, Appendix A) is a World Wildlife Fund end-user licence: the
licensee may distribute the data only "incorporated into any Derivative Works … subject to the terms and
conditions of an end user license agreement with terms that are at least as protective"; "In no event
shall Licensee license or distribute the Licensed Materials as a stand-alone product"; the licensee
"shall protect against unauthorized copying and/or distribution"; with record-keeping and audit duties.
That is not CC BY and not an equivalent open licence — under §2.10a nothing unclear or conflicting may
enter the pipeline even as a cross-check, and a plain static site that serves its data files cannot
promise an end-user licence agreement. Phase 0 had pinned the entry as CC-BY-4.0 from memory; the hash
and the size were real and are kept under `blocked` so a re-licensed copy can be verified. HydroSHEDS v2
(hydrosheds.org/products/hydrosheds-v2) IS CC BY 4.0 but covered only the Americas on 2026-10-08, with a
global release "under a free license" announced for 2026 — worth a look before Phase 2. HydroLAKES is
CC BY 4.0 on its own page and in its technical documentation (§4.1), which also asks, not as a licence
term, that the data not be redistributed whole in its original format; Folio ships a filtered,
simplified derivative in its own format. ETOPO 2022's NCEI metadata record states CC0 1.0 in so many
words (§2.7). **The stand-in is Natural Earth 10m rivers and lake centerlines, scale-rank edition
(5.0.0, PD)**: 4,224 records — 3,716 rivers, 23 intermittent rivers, 479 lake centerlines, 6 canals — in
260,393 vertices, with names on 4,039 of them and Wikidata ids; one record per river per scale rank. Its
resolution is 1:10M: the median chord is 1.8 km, p90 4.7 km, so at the cap (150 m/px) a chord is twelve
pixels — which is why rivers are smoothed past LOD 2 and not drawn under 0.35 km/px (below). The
supplementary European and North American river files (ranks 10–12, PD) were looked at and left out:
they would show every creek in Europe and none in India.

**Rivers, as built.** Lake centerlines (a river's course across a lake) and canals are dropped; the
3,740 polylines of the rest are quantised to the land quantum and made into a network: 7,480 ends, of
which 4,396 coincide exactly (Natural Earth's own chains) and 3,084 are free, 131 of them in the sea of
the OSM partition. The three distances were fixed from the free ends' distributions (`--measure`):

| free end → nearest | p50 | within 500 m | 1 km | 2 km | 3 km | 4 km | 6 km | 10 km | 20 km |
|---|---|---|---|---|---|---|---|---|---|
| another river's line | 645 m | 610 | 724 | 742 | 753 | — | — | 966 | — |
| the OSM coast (z=4) | 1,915 m | 142 | 205 | 267 | — | 321 | 346 | 386 | 467 |
| a kept lake's shore | 1,158 m | 528 | 732 | 886 | — | 1,019 | 1,107 | 1,251 | — |

So D_JOIN = **2 km** (the knee: 610 → 724 → 742 → 753, then flat), D_MOUTH = **6 km** (Natural Earth's
mouths stop in estuaries the OSM coast runs up) and D_LAKE = **4 km** (its lake shores against
HydroLAKES'); of the targets within tolerance the nearest wins. A free end in the sea is first walked
back to the last vertex on land. The result: **721 ends joined to another river** (projected onto the
line, which gets a junction vertex: p50 134 m, p90 677 m, max 1,911 m), **299 mouths snapped to the
coast** (p50 970 m, p90 3,682 m, max 5,955 m; 119 of them trimmed back from the sea first, by p50 3.3 km
and up to 21 km), **953 ends snapped to a lake shore** (p50 431 m, p90 2.1 km, max 3,979 m), **1,099 free
ends on land** — sources, endorheic ends (the Okavango, the Tarim) and gaps in the source (89 of them
within 20 km of the coast, p50 11.2 km, which is where Natural Earth stopped short of an estuary beyond
D_MOUTH) — and **12 lines wholly in the sea, dropped** (the Indus delta's tidal channels, the Ouémé's
and the Coatzacoalcos' mouths, the Dniester liman). 19 polylines have both ends free (Balak, the
Mahaweli, the Mearim, the Pangani among them: endorheic or a gap). Every polyline is then split at its
junctions: **4,360 river arcs in 1,208 rivers** (1,139 named, 1,054 with a Wikidata id), listed in order
in `header.rivers` for Phase 1c; 1,058 lists break between consecutive arcs where a lake was crossed or
the source record had several parts. LOD by scale rank, from the census of surviving vertices per
tolerance (10 km / 2.5 km / 500 m: ranks ≤ 3 hold 3,261 / 11,313 / 31,241 vertices of 100,492 km of
river; ranks ≤ 6 9,902 / 34,092 / 96,378; everything 21,144 / 70,947 / 200,466): **ranks ≤ 3 at LOD 0, ≤ 6
from LOD 1, all from LOD 2**. The rivers' every vertex (ranks 0–3, 248,676 after quantisation) lives in
`water.bin` — a tile could add nothing to a 1:10M line — and the worker builds a second, smoothed list
(two Chaikin passes over every vertex, endpoints fixed; a fixed endpoint is a junction, so no gap opens
where a tributary joins) that the renderer draws past LOD 2: 996,207 segments for the 246,162 raw ones.
Rivers are drawn down to **0.35 km/px** and not below: at 0.35 the smoothed line still reads as a river
(the Rhine and the Moselle in the series), at the cap the smoothed 12-pixel chords would read as a
cartoon. An intermittent river carries `FLAG.INTERMITTENT` (23 arcs) and is dashed like a disputed border —
the first build wrote them 0 because the constant was missing from `atlas-format.js`, so `check-water.js`
now asserts that some river arc carries it. What is
counted, not repaired: 57 river × river crossings (Natural Earth's own) and 7,827 river × lake-shore
crossings in the resident levels (11,046 in the full file, 1,307 lakes) where Natural Earth runs a
river across a lake HydroLAKES draws larger — the lake fill is drawn over the river, so the line
vanishes under the water.

**Lakes, as built.** The census that fixed the filters (`.claude/atlas-build/out/`'s lakes census,
quoted here): of 1,427,688 HydroLAKES polygons, 34,426 are ≥ 5 km², 16,689 ≥ 10 km², 1,708 ≥ 100 km²,
178 ≥ 1000 km²; the vertices surviving Visvalingam at 10 km / 2.5 km / 500 m / 250 m / 75 m are, for
lakes ≥ 5 km², 5,230 / 91,315 / 1.04 M / 2.51 M / 8.9 M and for ≥ 10 km² 5,230 / 88,627 / 0.83 M /
2.01 M / 7.2 M. **A 75 m level was therefore never affordable** (lakes ≥ 10 km² alone would be 19 MB at
75 m against a 12 MB budget for rivers and lakes together), and HydroLAKES' polygons are of mixed
provenance anyway (MODIS at 250 m for 167,435 of them, SWBD at 90 m, CanVec, NHD, ECRINS), so the
finest water level is **250 m, on the z=4 grid, drawn at both tile zooms** — 1.7 px at the cap, visible
on a shore as a gentle chording, reviewed (the Great Lakes and Finland at the cap). The filters: a lake
exists at LOD 0 from 1000 km², at LOD 1 from 100, at LOD 2 from 10, in the tiles from 6 (5 is the
build's floor; 6 is what the budget bought, below); a ring with fewer than three vertices at a level is
absent there; a hole exists only where its outer ring does. Dropped: **199 lakes with more than a third of
their sampled shore in the sea** of the OSM partition — the Caspian, Lake Melville, Bras d'Or, the Selawik
and Eskimo Lakes, the Great Bitter Lake, the Beysug liman, the Danish and Canadian lagoons (a majority
rule had kept nine half-sea lagoons whose simplified shores then read 52–64 % sea); 4 smaller lakes of 5 pairs whose
source rings cross each other (a reservoir over the lake it flooded); 252 islands drawn across their own
lake's shore; and the source's own bow-ties: **1,686 of the kept rings cross themselves**, cut at the
crossing point with the shorter loop dropped (2,284 cuts, no ring lost). Planarity per level, the way
build-admin.js makes the coast planar but with one difference: a crossing between two simplified rings
restores the WHOLE source stretch between the crossing segment's ends — first to the next level's
resolution, then two levels finer, then everything — because one vertex at a time oscillated in the lake
districts (measured: 700 crossings at LOD 1 still 600 after 24 passes). The passes: LOD 0 38 → 6 → 4 → 0
(411 vertices restored); LOD 1 687 → 174 → 89 → 10 → 10 → 0 (9,449 restored, 14 islands leave the level);
LOD 2 5,673 → 1,419 → 1,068 → 66 → 7 → 0 (31,206 restored, 163 islands and 2 lakes leave); LOD 3 6,552 →
407 → 18 → 0 (94,487 restored, nothing leaves). Two lakes of one pair with nothing left to restore lose
the smaller to the level; two rings of one lake lose the island, never the lake — the first build
removed Mistassini, Päijänne and the Caniapiscau Reservoir from LOD 1 on exactly that mistake. The water
topology: 3,013,580 vertices (per level 203,204 / 346,793 / 1,434,492 / 3,013,580), 92,111 arcs, 34,223
lake faces. Lakes planar at every level and in every tile is what `check-water.js` proves, with the
Natural Earth points (below).

**The water files.** `water.bin` **4.15 MB** (levels 0–2: 1,167,572 vertices, 37,649 arcs of which
4,360 river, 16,590 lake faces — the ≥ 10 km² ones; 5,157 entities — every named lake and every lake
≥ 50 km² is an entity of its own, the 29,000-odd unnamed smaller ones share `lake:unnamed` and keep their
HydroLAKES id in `header.lakeIds`, because 34k rows of JSON were 3.6 MB of a 12 MB budget); the water
tiles **7.54 MB in 228 files** (median 12.2 KB, largest 666 KB, the Québec cell 9-12; 28,801 face pieces,
2,202 edge chords); **11.69 MB in all, 229 files**, under the owner's 12 MB. With the build's 5 km² floor
the tiles were 7.90 MB and the total **12.26 MB** — over — so `pack-water.js --min-km2 6` leaves the
6,008 lakes of 5–6 km² out of the tiles (they are in the file for a later owner with a bigger budget). The land files are byte-identical to 1a's: `git diff --quiet
HEAD -- atlas/data/topology.bin atlas/data/tiles` is clean and `check-topology.js --tiles` passes its
71 checks unchanged. Site file count after 1b: 1 + 414 land, 1 + 228 water, 28 relief — 672 files under `atlas/data/`; the
largest file on the site is `relief/L0.lo.png` at 7.45 MB (Cloudflare's limits: 20,000 files, 25 MiB a file).

**Relief, as built.** §2.7 has the design as settled; the measurements: with the owner's three levels
from the 60-second grid, the first build as one RGB PNG per tile measured **L0 12.55 MB, L1 47.85 MB,
L2 175.71 MB** — six times the "~1 MB a tile" estimate, because sixteen-bit heights at one metre on a
2.4 km grid carry two to three bits of entropy a texel whatever the filter, and interleaving the shade
byte with them cost DEFLATE another factor. Three greyscale planes per tile (`.hi`, `.lo`, `.sh`; the
sea floor's shade flat) measured **L0 8.89 MB, L1 32.83 MB (largest tile 4.45 MB), L2 118.69 MB**. The
shipped pyramid is **L0 + L1, 41.72 MB in 27 files** (plus `relief.json`), under the 45 MB budget; L2 is not shipped — it
cannot fit under any encoding measured — and `build-relief.js --levels 0,1,2` still builds it. A
measurement that bit: pngjs packs from an RGBA buffer unless `inputColorType` says otherwise; the first
three-plane build filled a quarter of each image and wrote zeros for the rest, and read 1.7 MB a tile.
The builder now reads one plane per level back and compares every byte. `check-relief.js --source`
proves 200 random texels of L0 and L1 against the GeoTIFF (box averages within their footprint's
min–max; an L2 build would be nearest-sampled and provable to the metre — not run, since L2 is not
shipped) and that the hillshade is flat wherever the height is below zero; the coast sample (790 OSM
coast vertices, 3 km inland and 3 km seaward, both at least 2.5 km from any coast) found ETOPO below sea
level at **20.1 %** of the land points and above it at **20.8 %** of the sea points — the mismatch of
§2.7, mostly Antarctica's ice shelves (OSM land, ETOPO sea floor) and the Arctic islands.
`test-atlas-relief.js` renders twelve of the first kind and six of the second with relief on at full
strength and reads the pixels back: every land point stays within 40/255 of its plain fill, every sea
point has no face under it and is at least as bright as the deep sea. The fade range chosen by eye
(the series at 2.5 / 1.8 / 1.2 / 0.9 km/px): full above **2.5 km/px**, gone below **1.0** — at 1.8 the
Alps are a half-strength wash under the rivers, at 1.2 a hint, and at 0.9 the L1 texel (4.9 km) would be
five pixels wide. The ramp was looked at in folio (light), folio night (dark) and synth (a pink theme):
the stops are mixes of each theme's own land, ochre, ink and paper, so the dark theme's uplands are a
dusky brown and the pink theme's magenta; the one change after looking was the white stop, moved from
4,200 m to 5,400 m so the Tibetan plateau reads as high ground rather than snow. On this runner the
relief costs v2 a quarter of a frame at the globe (below); on a phone GPU it is a few texture reads.

**The frame gate, as measured** (this cloud session's runner, 4 cores, Chromium 141,
ANGLE/SwiftShader; rAF-to-rAF intervals in ms; v1 = `#map` Full atlas, v2 = `#map2` with rivers and
lakes on; +relief = v1 with its heightmap, v2 with relief; the third of three runs of the suite on the
final files, the one on the record):

| gesture | target | mean | p50 | p90 | p95 | p99 | max |
|---|---|---|---|---|---|---|---|
| drag | v1 | 47.1 | 16.7 | 133.2 | 149.9 | 183.3 | 300.0 |
| drag | v2 | 24.3 | 16.7 | 50.0 | 50.0 | 50.1 | 66.7 |
| drag | v1+relief | 26.8 | 16.7 | 50.0 | 50.1 | 66.8 | 166.7 |
| drag | v2+relief | 26.9 | 16.7 | 50.0 | 66.6 | 66.7 | 66.7 |
| wheel | v1 | 99.4 | 16.7 | 300.0 | 366.6 | 450.1 | 450.1 |
| wheel | v2 | 30.4 | 16.7 | 66.6 | 100.0 | 216.7 | 216.7 |
| wheel | v1+relief | 64.9 | 16.7 | 116.7 | 183.4 | 966.6 | 966.6 |
| wheel | v2+relief | 41.4 | 16.7 | 83.4 | 116.7 | 183.4 | 183.4 |
| pinch | v1 | 115.2 | 16.7 | 350.0 | 366.7 | 400.0 | 566.7 |
| pinch | v2 | 16.7 | 16.7 | 16.7 | 16.7 | 16.8 | 16.8 |
| pinch | v1+relief | 45.0 | 16.7 | 100.1 | 116.7 | 133.4 | 250.0 |
| pinch | v2+relief | 16.7 | 16.7 | 16.7 | 16.7 | 16.8 | 16.8 |

Relief off, the ratios are drag **33 %**, wheel 27 %, pinch 5 % of v1's p95, the worst drag frame 66.7 ms
and the worst pinch 16.8: the gate passes. **But the margin is a refresh, not a design**: the two
earlier runs of the same suite on the same files read the drag at **44 %** (v2 p95 66.7 ms, four
refreshes, against v1's 150.0), and this one at 33 % (50.0 ms, three refreshes, against 149.9) — the
globe frame sits on the 50 ms boundary and lands on either side of it run to run, while v1's drag
p95 read 150 ms in all three runs here against 316.6 in 1a's session on the same code (this runner is
faster: v2's globe frame was 83.3 ms there). So the same renderer reads 26 %, 33 % or 44 % depending on
the runner and the refresh it lands on. The water at the globe is 2,670 river and 2,968 lake-shore
segments and 2,623 lake triangles on 19,917 land segments and 42,529 triangles, inside the same frame.
The owner's instruction for 1b was not to optimise the arc pass unless the phone reading said so; it
did not, and the suite reports the ratio as measured. The fixed views
(primitives in a still frame; the budgets in the suite are these ×1.25):

| view | km/px | LOD | triangles | segments | rivers | lake shores | lake fills | drag p95 / max (relief off) |
|---|---|---|---|---|---|---|---|---|
| globe | 24 | 0 | 42,529 | 19,917 | 2,670 | 2,968 | 2,623 | 50.0 / 66.7 |
| Europe | 3 | 2 | 133,348 | 101,049 | 22,172 | 71,374 | 64,531 | 133.3 / 150.1 |
| the Aegean | 0.5 | 3 | 25,892 | 22,750 | 4,390 | 2,367 | 2,147 | 33.4 / 50.0 |
| the Aegean at the cap | 0.15 | 4 | 20,366 | 18,297 | 0 | 1,708 | 1,553 | 33.3 / 33.4 |

Relief on, the owner asked for v2's p95 at most 40 % of v1's with its heightmap on. Measured, v1 is
CHEAPER during a gesture with its heightmap on than without (drag p95 66.7 ms against 150.0): it
reprojects the heightmap at 360 px while moving and renders it in full only once settled, after the
window the suite measures, so that ratio cannot be met by a renderer that draws every frame in full
and says nothing about the relief passes. The suite prints the ratio (v2 is 133 % of v1+heightmap on
the drag, 64 % on the wheel, 14 % on the pinch) and asserts instead that relief costs v2 at most half
again its own relief-off p95 (measured: drag 66.6 vs 50.0, wheel 116.7 vs 100.0, pinch 16.7 vs 16.7)
with the worst frame reported (66.7 ms on the drag, 183.4 on the wheel through Europe) — a deterministic regression gate on the relief
passes; `RELIEF_VS_V1 = true` in the suite restores the literal gate. **This is the owner's call; it is
flagged in the report.** Load: `water.bin` 4.36 MB in 114 ms locally, the worker's three water levels
in about 60 / 190 / 2,100 ms (level 2: 885k lake-shore and 246k river segments, 806k lake triangles, 996k
smoothed river segments); relief L0 8.9 MB and two Alps L1 tiles 17.1 MB, composed in the worker.

**Findings that contradict or sharpen the design.** (1) HydroRIVERS is not open (above); §2.3 now
names Natural Earth and the rule that a licence is read on the source's own page when the file is
fetched, never from memory. (2) §2.3's "rivers and lakes join the topology as arcs and faces" became
files of their own, because every committed byte of the land tiles stays in history and water will be
rebuilt more often than land. (3) §2.7's single RGB PNG was 2.5 × the size of three greyscale planes;
the planes decode natively and the renderer composes them. (4) The relief estimate was six times low
and L2 cannot ship under 45 MB; the owner's "regional wash" is what the pyramid is, and the fade is
the design's answer at street zoom. (5) The 40 % ratio of the frame gate moves with the runner and with the refresh a
frame lands on (26 % in 1a's session, 44 % and 33 % here, the same renderer): the primitive budgets are
the deterministic half of the gate and the ratio needs the owner's reading on CI's own runner. (6) v1's heightmap is not a
per-frame cost, so a relief-on ratio against it measures the wrong thing (above). (7) The OSM partition
calls the Aral Sea land (its 2026 water is `natural=water`, not coastline), so HydroLAKES' Aral is drawn
as a lake — and the owner's note that "the Caspian and Aral are already water" is half right. (8)
HydroLAKES' polygons are not planar: 1,686 of the 34,269 kept rings cross themselves, 252 islands cross
their own shore, and 5 pairs of lakes overlap — the build repairs the first two and drops the smaller of
the third, and `check-water.js` would fail on any of them. (9) Natural Earth's Niamey exists twice (an
admin-1 capital at 7.1° E); the checker's river-city points name the admin-0 capital's.

**Screenshots, reviewed** (`.claude/atlas-shots.js`, 53 shots at 1280×800). Water: the Rhine at 1 km/px
and its delta at 0.5 (the IJsselmeer, land to the OSM partition, is now a lake; every distributary
reaches the coast); the Danube at 3 km/px and at Vienna at 0.5; the Nile at 6 km/px and its delta at 0.5
(both branches end on the coast, the Rosetta mouth within a pixel of it; no line runs into the sea); the
Mississippi at 6 and its bird-foot delta at 0.5 (the passes reach the Gulf; Pontchartrain and Borgne are
lakes); the Great Lakes at 6 km/px, Huron at 0.6 and the North Channel at the cap (the 250 m shore chords
show as a gentle angularity at 150 m/px, the Manitoulin islands are holes, the US–Canada line crosses the
water); Victoria at 3 and 0.5 (the three borders cross the lake, the rivers end on its shore); Baikal at
3 and 0.5. No river mouth was found off the coast and no lake over the sea; the smoothed rivers at
0.35–0.5 km/px show no chords. Relief: the globe, the Alps and the Himalaya at 6 / 3 / 1.5 km/px in folio,
folio night and synth (21 shots): the coast is exact in all of them — bathymetry never crosses onto land,
the land tint never onto the sea — and the two L1 patches over the Alps and the Himalaya meet without a
seam; the Tibetan plateau reads as high ground after the ramp change. The fade series at 2.5 / 1.8 / 1.2 /
0.9 km/px is what fixed the range. One thing the shots show that is not a fault: at 3 km/px over Europe
the rivers at every scale rank are dense, which is Natural Earth's own density at 1:10M and is where
Phase 1c's labels will need the stack chip.

#### Phase 1c — as built (2026-10-09)

Everything in the 1c row of the table above exists and runs, with the frame gate's method changed first (task
0 of the brief) and two renderer findings on the way. In `.claude/atlas-build/`: `lib/label.js` (the label
geometry: rasterised rings in an azimuthal projection, an exact Euclidean distance transform for the pole of
inaccessibility, the principal axis from the fill's covariance, the chord walked by exact point-in-polygon,
and a `prefer` predicate the caller supplies), `build-gazetteer.js`, `check-gazetteer.js`, `sources.json`
with three Natural Earth entries added (marine polygons, regions polygons, regions points) and
`wiki-sitelinks.json` (the Wikidata cache, committed). In `atlas/`: `atlas-worker.js` gains the gazetteer,
glyph shaping, the layout, the lake-area bins, a bounding cap per river and a rebuild on context loss;
`atlas-gl.js` a water ID pass, the lake cull, the relief passes restructured and the typed arrays dropped
after upload; `atlas.js` the label layer, picking, the card, the legend, search, deep links and the key list.
In `app.js`: the `atlas2prose` bundle and the host object — the only two edits to v1. New suites:
`test-atlas-render.js`, `test-atlas-labels.js`, `test-atlas-card.js`, `test-atlas-search.js`,
`test-atlas-a11y.js`; `check-gazetteer.js` in the fast CI job.

**Task 0 — the frame gate's method.** CI run 37863232583 failed "wheel, relief on: v2 p95 ≤ 1.5 × its
relief-off p95" at 116.7 against 66.7 ms. The old gate read one run's p95 of about 70 frames quantised to the
16.7 ms refresh — three or four frames — and a single frame moved it across a refresh. `test-atlas-perf.js`
now repeats every gesture three times (at least 300 frames) and every relative gate compares the POOLED
p90 of the repeats (v2 ≤ 40 % of v1; relief on ≤ 1.5 × relief off), printing the per-repeat p95s and their
median beside it; the worst-frame gate reads the worst frame of every repeat (stricter, not looser), with
the 100 ms + 1 ms slack unchanged. The pick smoke test resets the view to the home view first (the gestures'
coast had left the centre over the sea). The three local runs and the three CI runs are tabled below.

But the method alone did not make the relief gate honest: measured on the session's runner the relief-on
wheel read 1.57 × relief off in both of the first two runs (pooled p90 183 vs 117 ms), and the Europe view
alone 1.78 × on a 40-step drag — the relief passes really cost that much on software GL. Two renderer
changes, both bounded, took the Europe view to **1.33 ×**: (1) a relief fragment is shaded once. Until 1c the
sphere pass sampled the L0 sheet for every disc pixel, each L1 patch painted its whole rectangle as sea and
again as land, and the L0 land pass ran over everything — two to three relief shadings a pixel; now the
sphere pass draws the ocean with the L0 bathymetry only while no patch is on screen, each patch paints its
sea where the LAND stencil bit is clear and its land where it is set, and the L0 sheet paints only what the
patches do not cover — and not at all when they cover the viewport, which is tested on the CPU with nine
unprojected points, because on SwiftShader a stencil-rejected fragment is not a free fragment (measured:
the stencil-only restructure changed nothing). (2) An L1 patch mesh carries its equirectangular texture
coordinate per vertex, so the relief shader runs no `atan` or `asin` per fragment; the L0 sheet keeps the
full-disc quad with the per-fragment maths, because a 96 × 96 sphere mesh cost SwiftShader more in triangle
setup than it saved (measured: the globe's relief-on drag went from 83 to 150 ms with the mesh). The picture
is unchanged (a face is opaque; the sea passes are; the graticule and the rim ride on the sea passes).

**The gazetteer v0, as measured** (`out/gazetteer-report.json`; the file is `atlas/data/gazetteer.js`,
617,769 bytes = 0.589 MB, a `.js` table rather than a `.bin` — the build doc says why):

| kind | rows | bytes of rows | what it is |
|---|---|---|---|
| country | 257 | 41,115 | every face-bearing admin-0 entity of the core |
| admin1 | 172 | 21,943 | every named admin-1 unit (one Russian record is nameless) |
| capital | 203 | 17,376 | Natural Earth's admin-0 capitals |
| city | 400 | 35,262 | places of a million or more |
| town | 1,080 | 94,862 | admin-1 and region capitals of 100,000 or more |
| sea / ocean / gulf / strait | 71 / 7 / 160 / 52 | 9,073 / 1,232 / 20,465 / 6,821 | Natural Earth's marine polygons |
| lake | 1,628 | 115,753 | named HydroLAKES lakes a label can fit (a chord ≥ 6 km or ≥ 25 km²) |
| river | 952 | 91,402 | named Natural Earth rivers of scale rank ≤ 8 |
| island / island-group | 409 / 161 | 48,853 / 21,879 | Natural Earth's regions polygons and points |
| range | 219 | 29,972 | Natural Earth's `Range/mtn` polygons |
| region | 364 | 49,642 | continents, deserts, plateaus, plains, basins, peninsulas, coasts… |
| **all** | **6,135** | **617,769 bytes in the file** | 4,804 rows with a `within`; 4,195 Wikipedia titles on 4,171 rows with a QID (99 items have no enwiki sitelink) |

The levers that met the 0.6 MB budget, each measured before it was pulled: the first full build was 868 KB
(1,828 named lakes 198 KB, 1,564 cities and 1,618 towns 290 KB, a 250,000-people tier of 616 places 56 KB);
rows as arrays with trailing zeros trimmed, QIDs as numbers and `within` as a row index saved a third
against objects (1.03 MB); named lakes too small to label at the cap (a chord under 6 km and under 25 km²:
199) and lake paths under 60 km went; rivers of scale rank 9–12 (187) went; admin-1 capitals under
100,000 people (729 + 357) went — at 50,000 the file was 625 KB before a single Wikipedia title; the
further city tier is **not in v0**: at 250,000 it cost 48 KB and at 500,000 19 KB, and either put the file
over the budget once the titles were in. Natural Earth's own `MIN_ZOOM` / `MIN_LABEL` / `MAX_LABEL` ride
along as `z` and gate the kinds that carry them. Three Natural Earth rivers carry one `ne_id` over two
differently named stretches (the Mackenzie and the Comet, the Barwon and the Macintyre, the Avon and the
Swan): two water entities, one id — the second row takes the entity index as a suffix and picking goes by
entity index, never by id. One Russian admin-1 record has no name and no row.

**Label geometry, as measured.** `check-gazetteer.js` proves every country's anchor and every point of
its path inside its own admin-0 face of the z=4 partition, every admin-1 anchor inside its own LOD 2 face
and its parent's land, and by name the ten of the brief (the United States at −97.2, 39.1 with a 2,176 km
path across the plains; Russia at 107.9, 62.0, 3,969 km; Chile's path up the Atacama at −69; Norway's up
the spine at 9; Fiji on Viti Levu; Kiribati on an atoll with a 0 km path; Denmark on Jutland). Three
things the first builds got wrong and the final one does not: (1) the raster walk of the chord strode
across the sea between islands of an archipelago whose cells were "filled" by an islet in a corner — the
walk is now exact, by even-odd over the projected rings; (2) a pole chosen by distance alone was an atoll's
lagoon, a sea polygon's island it has no hole for, or a thin territory's neighbour at the rings' tolerance —
the builder now hands `labelGeometry` a `prefer` predicate (a country's own face by the partition, water
for a sea, land for a lake or an island) and the farthest cell it accepts wins, the path's points too;
(3) a 50 m rounding to three decimals put the Vatican's anchor in Italy — `prefer` now judges the rounded
coordinates, a territory under a hectare or two is written at four decimals, and the five countries whose
land exists only in the z=4 tiles (the Vatican, Ashmore and Cartier, Bajo Nuevo, Serranilla, the Coral Sea
Islands) are anchored from those tiles' faces. Where the sources disagree the checker counts rather than
fails: seven of 290 sea, ocean, gulf and strait anchors are land in the OSM partition (lagoons and
river-mouth channels the coastline treats as land: Lake Pontchartrain, the Patos Lagoon, the Amazon's Canal
do Sul), and the Caspian — sea to the partition — is the one lake off land.

**Wikipedia titles.** 4,171 rows carry a QID (every country and admin-1 unit but six UK nations and dependencies the core has no QID for, 4,163 of 4,205 populated places, 271 of 306 marine polygons, 956 of 1,047 regions polygons, 1,054 of 1,208 rivers; no lake), and 4,195 titles were written — the item's enwiki sitelink or nothing. The `wbgetentities` API answers 429 to every call from this sandbox's
shared address, with or without a descriptive User-Agent; `query.wikidata.org/sparql` answers the same
question for 50 items in one VALUES clause, rate-limited too (the first full fetch took about forty
minutes behind 10 / 30 / 60 / 120 s back-offs), and the cache is committed so that never happens twice.

**Labels, as measured** (`test-atlas-labels.js` on the session's runner, 1280 × 800, the atlas 796 × 647;
"normal" unless said):

| view | sparse | normal | dense | candidates at normal | cap at normal |
|---|---|---|---|---|---|
| globe (10° E 20° N, 24 km/px) | 24 | 40 | 60 | 152 | 40 |
| Europe (10° E 50° N, 3 km/px) | 55 | 92 | 139 | 530 | 92 |
| Aegean (25° E 38° N, 0.5 km/px) | 5 | 5 | 5 | 231 (215 of them rivers whose line is off screen) | 120 |
| Athens at the cap (0.15 km/px) | 1 | 1 | 1 | 1 | 120 |
| country scale (10° E 50° N, 1 km/px) | — | 57 (66 before the river-arc fix placed names on neighbours' lines) | — | 335, about 100 of them on screen | 120 |
| phone 390 px, globe / Europe / Aegean, normal | — | 24 / 29 / 2 | — | — | 24 / 55 / 72 |

The cap is met at the globe and over Europe; the Aegean at 0.5 km/px names what Natural Earth 10m names
there — Athens, the Aegean Sea, İzmir, the Cyclades, Volos (the Peloponnese, Lesbos and the Sea of Crete are
rows too, but their anchors fall off that screen or their chords under 40 px; Euboea, Chios, Samos, Andros
and Naxos are not named by Natural Earth's regions file at all) — and Athens at the cap is one label, because the 10m data has no feature smaller than a city there and the
towns under 100,000 are out of v0; **that contradicts the "about 120 at country scale" of Q-L1 where the
source is thin**, and the fix is data (Phase 3's places from the cards, a finer town tier when the budget
grows), not layout. The layout itself: 10.9 ms at p95 on the runner's software GL (the last 13.1 ms over 336 candidates; the budget is 50 ms, read × 3 on software). The redraw: 0.70 ms at p95 with 68 labels (the budget 3 ms, × 3 on software) — a sprite per label, so the
frame cost is a few hundred `drawImage` calls. Collision is proved pairwise over the chains at twelve
(view, density) pairs and three on the phone; the one fault the suite found and the build fixed was a
grid that dropped rectangles beyond the viewport into no cell at all, so two labels running off the top
edge overlapped each other; a label with under 8 px of itself on screen is now not placed (it held a slot
of the cap and drew nothing), a name whose run along its path would lie off screen falls back to the
straight name at its anchor, and an anchor nearer the limb than z = 0.1 (where the fade leaves a name at
half strength, foreshortened past reading) is not a candidate. A second fault behind "ink where the layout
says": the atlas element changes size without a window resize (the page's scrollbar goes as it finishes
loading; the card column opens) and both canvases kept the size measured at mount, 4 px narrower and 3 px
shorter than the element, so names along the bottom edge drew beyond the canvas — a `ResizeObserver` on the
element now re-measures. Nothing is added or dropped during a 40-step drag — and "moving" had to become the
pointer's state rather than a quiet clock, because on this runner a drag's moves were 150 ms apart and
the settle timer laid out between them, once per move (measured: layout #41 → #81 over 40 moves).
Contrast: ink names ≥ 10:1 on the land fill in all fifteen themes; water names 6.5–7.7:1 on the sea and
the land in the light themes and 4.8:1 on the sea and 6.7:1 on the land in folio's night, after the first dark-theme water colour
measured 1.8:1 against the sea.

**Picking, as measured** (`test-atlas-render.js`): 42 of 42 Natural Earth capitals answer with their own country at 24, 3 and 0.5 km/px (at the globe a coastal capital's own pixel or one of four neighbours two pixels away — a tap is a finger, not a needle); a point in Texas stacks the state above the country; Lake Tanganyika stacks the lake, then Tanzania; a tap on the Danube's midpoint at 1 km/px stacks the river, 6 px beside the line still does, 60 px away does not. Three faults found: the ID pass had cleared
the tile list before drawing, which with `complete` computed from that same list drew NO face at a tile
zoom (every pick past 1 km/px answered "sea" — unnoticed since 1a because the perf suite picks at the
globe); a line's id came back one less than its index (the arc shader adds only the base); and no line was
ever picked at all, because a pick shifts the viewport so one device pixel lands on the 1 × 1 target and
the arc shader measured a fragment's distance to its line from `gl_FragCoord` — the target's coordinates,
not the canvas's — so every fragment was a whole canvas away from its line and discarded (`uPickOff` now
carries the shift). Once lines picked, they shadowed faces: a tap on a coastal capital, an atoll at the cap
or a lake shore answered with the coastline, so the land ID pass draws no lines (nothing reads a line's id
yet). The ID pass now draws the resident level, the parents and the loaded tiles in that order without a
stencil, so the finest loaded face has the last word and an atoll the resident levels have no ring for is
still picked; a river is picked within 8 CSS px of its line through `uIdPad`.

**The two performance fixes, as measured.** (a) The lake cull: a resident water level's lake triangles and
shore segments are laid out per half-octave area bin from 10 km² (levels 1 and 2; level 0's lakes are
≥ 1,000 km² and the tiles' ≥ 6 km² never cross the line), and the renderer skips every bin whose lakes
project under 2 px² — at 3 km/px, lakes under 18 km². The Europe view (3 km/px) draws 55,915 lake-shore segments and 50,843 lake-fill triangles against 71,374 and 64,531 before the cull (the suite's Europe budgets go from 89,400 / 80,800 to 69,900 / 63,600, the measurement × 1.25); the globe's 2,968 / 2,623 and the Aegean's 1,831 / 1,648 are unchanged, their levels having no bin under the line. The
owner's guess that most of Europe's lake primitives were such smears was **not** borne out: the small bins
hold 58,420 of the level's 803,326 triangles (7 %), and the Finnish and Karelian lake districts are mostly
lakes of 20–200 km² with 500 m shores. The budgets in the suite are revised to the measurements × 1.25.
(b) Memory: the renderer kept every level's, tile's, water level's and relief sheet's arrays beside the GPU
copy "for context loss" — 150 MB of typed arrays, and the runner read v2's heap at 307 MB against v1's 242.
An upload now keeps only the bucket ranges and caps; on `webglcontextrestored` the worker, which kept the
raw files, sends every level again and the tile loaders fetch theirs again. Measured after the change, with the browser run under `--expose-gc` and the heap read after a forced collection (what is live, not what the collector has not reached — without it the same build read 38 MB one run and 78 MB the next): **v2 38 MB after its gestures against v1's 228–257 MB**, on four runs; the suite gates it at 48 MB (1.25 ×), and `#map2?perf` shows the live reading on Chrome ("n/a" where `performance.memory` is absent).

**The place card, the legend, search, deep links, the keyboard.** The card is a side column at 380 px, a
bottom sheet with a grip on a phone that opens shut (the title strip alone) and expands on the grip, like
v1's. A country's card loads the `atlas2prose` bundle (countries.js, country-stats.js, country-spans.js,
country-sources.js — not timeline.js, which v1's `atlas` bundle carries) through the host's `ensureData`,
titles itself by v1's `officialName` rule, strips the figure sentences by v1's `stripInfoNoise` rule, shows
the four-tile grid and the sources as a `.src-note` the host's `wireFootnotes` numbers — the two rules are
copied into atlas.js because they live inside v1's page closure, and the brief allowed v1 two edits. The mapping from `adm0:<a3>` to v1's prose key tries the core's name and Natural Earth admin-0's NAME, NAME_LONG, FORMAL_EN, NAME_EN, ABBREV, NAME_SORT, BRK_NAME and NAME_CIAWF in turn, lower-cased: **253 of 257 countries have an entry; without one: Brazilian Island, Cyprus No Mans Area, Indian Ocean Territories, United States Minor Outlying Islands** (the last has figures in country-stats.js under "u.s. minor outlying is." but no description) — their cards say "No description for … yet" rather than inventing one.
Any other kind shows its name, its kind, its containing place as a button and its Wikipedia link, nothing
else. The legend replaces the layers control (borders, provinces, the three name groups, cities, rivers,
lakes, relief with its strength, graticule, label density) under a new localStorage key behind try/catch;
a phone gets a "Legend" chip and a sheet. Search folds diacritics (NFD, the combining marks stripped) and
matches prefix before substring over names and aliases, the name that IS the query first, then by kind,
then by rank; Enter flies (700 ms, eased; instant under reduced motion or the site's animations switch),
selects and opens. Deep links are `#map2/<lon>/<lat>/<zoom>/<place>` with the zoom as the web-mercator
level (log₂ of 156.543 / km-per-px, what Natural Earth's hints are in), written with `replaceState` on
settle and `pushState` on a selection, so Back closes the place and Forward reopens it; the router ignores
the long form (it is not a page name) and the Atlas reads it itself; `?perf` rides on the end. A hidden
list of buttons (`.atlas2-keys`, the site's `.vh`) mirrors the placed labels in rank order, at most 60,
named "<place>, <kind>"; Tab reaches it after the search box and the zoom controls, Enter opens, Escape
clears, and a new layout keeps the focused button.

**Findings that contradict or sharpen the design.** (1) The relief-on ratio was a real cost, not noise
(above): the gate's method was wrong AND the passes were wasteful. (2) Early stencil rejection cannot be
assumed on software GL; a pass that must not run must not be issued. (3) A whole-sphere mesh is the wrong
tool for a full-disc pass on SwiftShader; per-vertex texture coordinates pay only on the patch meshes.
(4) Q-L1's "about 120 at country scale" presumes a density of named features Natural Earth 10m does not
have over the Aegean; the cap is a ceiling, not a promise. (5) HydroLAKES carries no QIDs: lakes have no
Wikipedia link in v0. (6) The gazetteer is a `.js`, not a `.bin`: 0.6 MB of names is a file a reviewer reads
in a PR. (7) The owner's "most of the Europe view's lake primitives" were not under 2 px² (7 % of the level's
triangles are); the cull is kept because it is cheap and right at every zoom, and the budgets are revised
to what is measured.

**The frame gate, three local runs and three CI runs** (pooled over three repeats; v2 = `#map2` with
rivers, lakes and labels; the session's runner reads v2's globe drag at twice CI's — 66.7 against 33.4 ms
p90 — and its worst drag frame of three repeats at 100–117 ms, which is the one gate the local runs cannot
hold):

Five local runs on the session's runner (SwiftShader, four cores; CI reads roughly half these). Runs 2 and 3 are
the three-repeat suite on the code before the pinch fix (run 1 was disturbed by a screenshot probe and is not
counted); run 4 has the pinch redrawing; run 5 has the pinch holding its level and the heap gate on. Pooled p90
in ms, v2 against v1, relief off unless said; "worst" is the worst frame of three repeats, relief off.

| run | drag v2 / v1 (p90) | wheel v2 / v1 | pinch v2 / v1 | worst drag | worst pinch | drag relief on / off | wheel on / off | pinch on / off | heap v2 / v1 | gate |
|---|---|---|---|---|---|---|---|---|---|---|
| 2 (before the pinch fix) | 66.7 / 233.3 (29 %) | 149.9 / 466.7 (32 %) | 16.7 / 483.3 (hollow: no frame drawn) | 116.6 | 116.7 | 100.0 / 66.7 (1.50) | 166.7 / 149.9 | 116.7 / 16.7 (idle loop against tile arrivals) | 38 / 257 | red: two worst frames, pinch relief, tap |
| 3 (same code) | 66.7 / 249.9 (27 %) | 116.7 / 483.3 (24 %) | 16.7 / 500.0 (hollow) | 116.6 | 83.4 | 100.0 / 66.7 (1.50) | 183.3 / 116.7 (1.57) | 100.1 / 16.7 | 38 / 242 | red: worst drag, wheel relief, pinch relief |
| 4 (pinch redraws) | 83.3 / 250.0 (33 %) | 133.3 / 500.0 (27 %) | 183.3 / 466.8 (39 %) | 100.1 | 283.4 | 100.0 / 83.3 (1.20) | 183.3 / 133.3 (1.37) | 100.1 / 183.3 (0.55) | 38 / 228 | red: worst pinch |
| 5 (pinch holds its level, heap gated) | 83.3 / 249.9 (33 %) | 133.4 / 466.7 (29 %) | 116.7 / 500.0 (23 %) | 249.9 (one frame; the other repeats 100.0) | 283.4 | 100.1 / 83.3 (1.20) | 183.3 / 133.4 (1.37) | 116.7 / 116.7 (1.00) | 38 / 228 | red: the two worst frames |

Every relative gate holds on runs 4 and 5, the heap gate holds, and the tap names Niger; what this runner cannot
hold is the 100 ms worst frame: a drag's occasional 250 ms frame and, now that a pinch draws, the first full-screen
frame at LOD 1 when the fingers lift (267–283 ms here, every repeat). The long intervals are not main-thread work —
the renderer's CPU side is under a millisecond a frame, a layout's sprites 6–21 ms — but SwiftShader's fill: a
rAF ticker beside the app's loop sees 100–300 ms gaps while the app's own frames are idle, which is the GPU
process holding the swap.

**CI, the same suite** (`Atlas v2 frame gate`, GitHub's runner, SwiftShader on two cores but faster than the
session's):

| CI run | head | drag v2 / v1 (p90) | wheel | pinch | worst drag | worst pinch | drag relief on / off | wheel on / off | pinch on / off | heap v2 / v1 | result |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 — [37878500473](https://github.com/Pokfus/folio/actions/runs/37878500473/job/113652967533) | 449b751 (before the river-arc fix; same renderer) | 50.0 / 183.3 (27 %) | 83.3 / 300.0 (28 %) | 83.3 / 333.3 (25 %) | 66.7 | **183.4** (183.4 / 183.3 / 183.4) | 66.7 / 50.0 (1.33) | **133.4 / 83.3 (1.60)** | 83.3 / 83.3 (1.00) | 28 / 150 | red: worst pinch, wheel relief |
| 2 — [37879826079](https://github.com/Pokfus/folio/actions/runs/37879826079/job/113657201327) | 0b6850d (this head) | 50.0 / 200.0 (25 %) | 100.0 / 316.7 (32 %) | 83.4 / 350.0 (24 %) | 66.7 | **183.4** (183.3 / 183.4 / 183.4) | 66.7 / 50.0 (1.33) | 150.0 / 100.0 (1.50) | 83.4 / 83.4 (1.00) | 28 / 150 | red: worst pinch only |
| 3 — [37881040122](https://github.com/Pokfus/folio/actions/runs/37881040122/job/113660985899) | eb50c64 (this head, docs only since 0b6850d) | 50.0 / 216.7 (23 %) | 83.3 / 366.7 (23 %) | 83.3 / 383.4 (22 %) | 66.7 | **166.8** (166.8 / 166.6 / 166.8) | 66.7 / 50.0 (1.33) | **133.2 / 83.3 (1.60)** | 83.3 / 83.3 (1.00) | 28 / 150 | red: worst pinch, wheel relief |

The pinch's worst frame on CI is 183.4 ms in all six repeats of two runs and 166.8 in the third (eleven and ten
vsync intervals): the
first frame after the fingers lift, when the held level gives way to LOD 1 and the renderer draws 64–138k
triangles at full-screen fill in one go (the probe on the session's runner reads the same frame at 117–133 ms
with 0.6 ms of CPU). The wheel's relief ratio sits on the line (1.60, 1.50, 1.60): the relief-on wheel pays
the L1 patch fetch and upload (17 MB of textures) inside the gesture, which the relief-off wheel never does.

The frame gate was red on `main` before this phase (run 37863242459: the method's own faults, since fixed) and is
red on this head on two rows in three runs (one row in the second), both honest: the pinch's worst frame, which
did not exist before the pinch drew, and the wheel with relief on, which on CI's faster relief-off wheel reads
1.50–1.60 × against the 1.5 × gate (1.37 × here). Every other row — the three 40 % ratios, the drag's worst
frame, the primitive budgets, the drag and pinch relief ratios, the heap, the tap — holds in all three. The numbers were not loosened; whether a pinch's first LOD-1 frame and the wheel's relief ratio are the
right gates is the owner's call — the design says 60 Hz on a phone's GPU, and the phone reading above says it
holds there.

**The owner's phone reading, 2026-10-09** (350 × 597 CSS px, DPR 2, relief on, the night theme): at LOD 1,
5.2 km/px, 25.6k triangles and 16.2k segments, frame mean 16.6 ms, p95 16.7 ms, CPU draw 0.50 ms — locked at
60 Hz; the texture-fallback option is not needed. The heavier LOD 2 view has not been read on the phone yet.
Two things the reading turned up, fixed in this phase: (1) the perf overlay was clipped at the right edge
(the max frame time and the ends of the water, relief and tile lines cut off) — it was `white-space: pre`
with no right bound; it now wraps (`pre-wrap`, `overflow-wrap: anywhere`, a right inset, a smaller face on a
phone) so every figure is on a 350 px screen, and the JS heap line (`performance.memory`, Chrome only —
"n/a" on Safari) is in it. (2) The graticule is off by default (`DEFAULT_LAYERS.graticule = false`, and the
suite reads `view.graticule === false` at mount), yet a faint dashed meridian ran down the left of the
phone's Europe view, through Britain, the Channel and France, at exactly 0°. It was not a line primitive (the
land topology has no arc along 0°, and the shot with relief off has no line) but the seam between two relief
L1 patches, which meet at 0°: `reliefAt` wrapped its sample column for the whole-world L0 sheet's seam at
180°, and a patch inherited the wrap, so its last half texel was blended with its FIRST column — a stripe of
wrong height and shade one half-texel wide along every patch edge, dotted because 4.9 km texels sit under
5.2 km pixels. The sheet wraps and a patch clamps now (`uWrap`); the patch meshes' edge vertices are also
the tiles' own bounds rather than lon0 + (lon1 − lon0)·n/n, so neighbours share bit-identical positions.
Verified by the same headless phone shot (350 × 597, DPR 2, night, relief on, 5.2 km/px): the line is gone.

A third finding from the suite rather than the phone: **a two-finger pinch did not redraw**. `zoomAt` set the
dirty flag without scheduling a frame, so a pinch changed the zoom and drew nothing until a tile or a layout
arrived — the frame-gate's pinch rows had been measuring an idle loop (16.7 ms p90, 0 frames rendered during
60 touch moves, on Phase 1b's code and on 1c's before the fix). It calls `invalidate` now, and a pinch from
the globe to 7 km/px renders every move; on this runner's software GL those frames fill the whole canvas
and cost 100–150 ms (p90 150 relief off, 167 on), which is the renderer's real full-screen cost (the fixed
Europe view reads the same), not a regression — and the pinch rows of the gate table below are the first
honest ones.

**A fault the screenshot review caught, not the suites**: "Thames" ran along a river in Spain, "Loire" along one
in Russia, "Mur" along the Po. `header.rivers` lists a river's arcs as the format lists every arc — ONE-BASED and
signed (`pack-water.js` writes arcIndex + 1, `check-water.js` reads ref − 1) — and both the worker's river lines
and the gazetteer builder's river anchors read them zero-based, so each name followed the arc AFTER each of its
own; where a river's arcs are consecutive (most are) the name still landed on its river, which is why the
Danube's pick and label passed. Both readers take `|ref| − 1` now and walk a negative reference backwards; the
gazetteer was rebuilt (the river anchors moved; every other row is unchanged) and the Europe screenshots retaken.

**Screenshots, reviewed** (`.claude/atlas-shots.js --only labels`, 76 shots): four views (globe, Europe, the Aegean, Athens at the cap) × three densities × desktop and a 390 px phone × three
themes (folio, folio night, synth), plus the France card on desktop and phone and the stack chip. Reviewed by
eye, after the river-arc fix: the globe at normal reads as an atlas page — oceans in slanted serif, continents
and large countries tracked small capitals, capitals squared and bold, Mumbai and Miami as dots, nothing
colliding; Europe at 3 km/px names the seas, the countries along their axes (FRANCE, SPAIN, GERMANY on its
north–south axis), the ranges (ALPS, BÖHMERWALD, CANTABRIAN MOUNTAINS), the rivers along their lines (Rhin,
Seine, Loire, Elbe, Donau, Danube, Ebro, Po, Drau, Inn) and the capitals, with the city names kept off the
coast lines; the phone at normal carries 29 names over Europe without a collision and its Legend chip, bottom
sheet and grip; the night theme's water names are pale blue on the dark sea and readable on land; the Aegean
is sparse for the reason given above (five names), and Athens at the cap is Athens alone. The France card on
desktop is the 380 px column with the prose and the figure tiles, on the phone the shut sheet with the title
strip and the grip. Two things a reader would notice and the phase does not fix: the ocean names near the
limb are foreshortened (by design — they fade with the limb), and GERMANY's tracked name runs over the
Elbe's label at 3 km/px in one density because a river label is placed after the country's and does not know
the country's glyph boxes are tracked (the overlap test is on rectangles; the glyphs' ink does not touch).

#### Phase 1d — as built (2026-10-09)

Everything in the 1d row of the table above exists and runs; the owner's frame-gate rules of 2026-10-09 (task 0 of the
brief) are in the suite and recorded below; CI's first complete browser job after the 1c merge was read and classified
first. In `.claude/atlas-build/`: `lib/wikidata.js` (the one SPARQL client — sitelinks and now English labels, 50 items a
call, the back-off schedule, the cache written after every batch), `lib/twin.js` (the `file://` twins), `build-credits.js`
and `check-credits.js`; `build-gazetteer.js` with the English-name rule and the merge; `check-gazetteer.js` with the
Phase 1d rules; `pack.js --twin` and `pack-water.js --twin`. In `atlas/`: `atlas-canvas.js` (the still Canvas 2D view),
`atlas-worker.js` made cooperative (every heavy loop awaits a `tick()` that is a no-op in a Worker and a yield on the main
thread), `atlas-format.js` with a generator reader (`readAsync`), `atlas.js` with the renderer choice, the twins, the
worker-failure fallback, the About sheet, the announcer, the focus rules, adaptive degradation (half resolution, then one coarser level, during a gesture on a slow GPU), the double tap, the exact
pinch and the `visualViewport` handling; `atlas/data/credits.js`, `topology.bin.js`, `water.bin.js` and the rebuilt
`gazetteer.js`. In `app.js`: `PAGES.credits`, the `credits` bundle, the Settings row, the home footer's Credits button and
the About page's link — the only v1 edits. New suites: `test-atlas-credits.js`, `test-atlas-fallbacks.js`,
`test-atlas-phone.js`, `test-atlas-session.js`; `test-atlas-a11y.js` extended; `check-credits.js` in the fast CI job.

**CI after the 1c merge, classified** (run [37905596883](https://github.com/Pokfus/folio/actions/runs/37905596883) on
`main`, the first complete browser job of the 1c suites, 53 of 57 suites green). The frame gate failed on the two rows the
1c note had called honest (the pinch's worst frame 183.4 ms, the relief-on wheel 1.50 ×) — the rows task 0 redefines.
Browser job: `test-draw-cards.js` and `test-tour.js` — pre-existing, known; `test-war-cards.js` ("the popup keeps the
legend that explains the colours") — pre-existing: it fails identically on the 1b tree (`e94957e`, before any 1c change),
run locally for this note; `test-personal-atlas.js` — pre-existing and flaky, not the Atlas's: run twice on each tree for this note, the 1b tree (`e94957e`, before any 1c change) went 78/78 then 76/78 and the clean 1c tree 76/78 then 77/78, the same two timing checks each time ("one click names the country, a second the province inside it" and "...and opens once the second is up"), so the failure belongs to the suite's timing and not to a change of 1c, whose only non-Atlas edits were the `atlas2prose` bundle and the host object in `app.js`; `test-review-decks.js`, listed as known, was green.

**Task 0 — the frame gate's rules.** The runner is software GL, so a gate must measure the renderer, not SwiftShader.
The evidence that fixed the rules: the pinch's first frame after release read 167–283 ms across eight runs (v1's worst
pinch frame 450–733 in the same runs); relief on cost 1.0–1.67 × relief off across eight runs; v2's heap read 28–82 MB
against v1's 228–257 in the same runs; and the owner's phone holds 60 Hz with relief on. The rules, as the suite asserts
them now (`test-atlas-perf.js`, `RELIEF_FACTOR`, `RELEASE_MS`, `HEAP_RATIO`):

- **Pinch**: the worst frame DURING the gesture (fingers down) is at most 100 ms (plus the millisecond of timestamp slack
  every worst-frame rule has had since 1a); the first full-screen frame after the fingers lift is measured separately,
  with a ceiling of 300 ms, and reported with that frame's primitive count. The page marks `performance.now()` at each
  `touchEnd`; a frame ending within 450 ms of a mark is a release frame, every other frame is a gesture frame.
- **Relief on**: the view's L1 patches are warmed first — an unmeasured rehearsal of the gesture, settled (the wheel's
  rehearsal pauses at every step, because a tile queued at one zoom and no longer wanted at the next leaves the queue and a
  plain run of the gesture left holes a measured run would fetch) — so the network and the upload are not in the measured
  gesture; the pooled p90 with relief on is at most 2.0 × relief off. The first-use cost of a patch (fetch + decode, the
  worker's compose, the main thread's upload) is reported as a number, ungated. The same rehearsal precedes every
  relief-off gesture of v2 and every gesture of v1, so no measured window pays a tile's fetch either.
- **Heap**: v2's JS heap after its gestures, read after a forced collection, is at most 50 % of v1's in the same run; the
  absolute value is reported. The absolute 48 MB ceiling is gone.
- **Unchanged**: v2's pooled p90 at most 40 % of v1's for drag, wheel and pinch; the drag's worst frame at most 100 ms
  with the millisecond of slack; the primitive budgets per fixed view. *(Restated twice since: Phase 2a task 0c allowed at
  most two frames over 100 ms across the repeats and none over 200; Phase 3a task 0b, 2026-10-10, reads it as at most 0.5 %
  of a gesture's frames over 100 ms and none over 200 ms, for the drag and for the pinch's during-gesture frames — a share
  scales with the sample where a count did not. Nothing else loosened; `WORST_SHARE` in `test-atlas-perf.js`.)*

**One renderer change the rules asked for: adaptive degradation during a gesture, in two sticky stages.** Measured on
the session's runner (software GL), the gesture frames the 100 ms rule forbids had two causes, found by sampling the
renderer's state frame by frame through a pinch: the globe at full resolution is fill-bound (p90 100 ms, max 133 over a
40-step drag at 1280×800; half the resolution halves it to p90 50), and LOD 1 between 8 and 16 km/px — which a pinch out
of the globe crosses twice, 174 k triangles and 98 k segments over the whole earth — is geometry-bound (p90 283 ms at
full resolution, 167 at half). The 1c code had no answer to the second, and its first answer never ran during a pinch:
the frame loop measured the interval only while frames were self-scheduled (a coast, a fly), and a gesture's frames are
each scheduled by an input event. So the view now learns the GPU it is on, in two stages that stay for the session, each
entered by two frames of a live gesture (fingers down, a wheel in the last 200 ms, a coast, a fly) that took more than
70 ms — measured from the gesture's own frame timestamps, never from the pause before it. Stage 1: while a gesture is
live the GL canvas draws at half resolution (a quarter of the fill), and the first frame after it redraws at full — the
release frame the gate measures apart; the label canvas keeps its resolution, so the names stay sharp and what softens
for the length of the gesture is the coast. Stage 2: a live gesture also draws one level coarser than the view wants
(never finer than the one it started at), as a map app shows the coarser tiles under a pinch, and no relief (the hillshade
is two full-disc passes, which on software GL cost two vsyncs a frame against a one-vsync baseline — the relief-on rule's
2 × read 3.0 on the fourth local run with relief drawn); the wanted level and the relief come with the release frame. A
level the bias chose never relays the labels (nothing is added or dropped while the globe moves, §2.9; the labels suite
caught the first cut relaying mid-drag). With both, the pinch's gesture frames on the runner read ≤ 100 ms (p90 67) where they had read up to
267. The ID pass is unaffected (a pick never happens mid-gesture, and the renderer's device-pixel ratio carries the
scale consistently). A GPU that draws the frame in 16.7 ms — the owner's phone — never reaches the threshold and never
sees either stage; `#map2?perf` prints the stage on its LOD line. **Flagged for the owner**: it is a renderer behaviour
visible only on slow GPUs, chosen over loosening a number; a phone that does reach stage 2 shows coarser coasts under a
pinch than it did.

**The gate's runs** (`test-atlas-perf.js`; every number v2, relief off unless said; the local runner is the session's
container, software GL on one core, with nothing else running). Six local runs, in order, each on the code of its moment:

| run | code | drag p90 / worst | wheel p90 | pinch p90 / during worst / release worst | relief on (drag / wheel / pinch, × off) | heap v2 / v1 | result |
|---|---|---|---|---|---|---|---|
| local 1 | 1d rules, 1c renderer | 66.7 / 250 | 150 | 117 / 200 / 100 | 1.25 / 1.22 / 0.72 | 79 / 223 | red: drag worst, pinch during |
| local 2 | + the resolution drop (never ran in a gesture) | 50 / 83 | 133 | 100 / 217 / 83 | 1.33 / 1.13 / 0.83 | 79 / 197 | red: pinch during |
| local 3 | + the two stages | 33 / 83 | 33 | 33 / 50 / 117 | 1.0 / 1.13 / 1.5 | 44 / 223 | **green** |
| local 4 | same | 33 / 83 | 17 | 33 / 50 / 100 | 1.0 / 2.97 / 1.5 | 44 / 190 | red: wheel relief (3 vsyncs against 1) |
| local 5 | + no relief in a stage-2 gesture | 33 / 117 | 17 | 33 / 50 / 100 | 1.0 / 1.98 / 1.5 | 79 / 197 | red: one 117 ms drag frame of 1,263 |
| local 6 | same (the pushed head) | 33 / 83 | 33 | 33 / 67 / 117 | 1.0 / 1.0 / 1.5 | 78 / 223 | **green** |

The two red rows after the stages are the runner's floor, not the renderer's: a frame on software GL is a whole number
of vsyncs, so a pooled p90 reads 16.8 or 33.4 and a ratio of two such figures flips between 1 and 2 (and read 3 once,
with relief drawn in the gesture); and one frame in 1,263 at 117 ms is a collector's pause on a one-core container
(the same run's p99 was 50). CI's runner (two cores) has never shown either. CI, on the pushed head `e254f18`:

| run | job | drag p90 (v1) / worst | wheel p90 (v1) | pinch p90 (v1) / during worst / release worst | relief on (drag / wheel / pinch, × off) | heap v2 / v1 | result |
|---|---|---|---|---|---|---|---|
| CI 1 | [37928457341](https://github.com/Pokfus/folio/actions/runs/37928457341/job/113813633302) (push) | 33.4 (200) / 66.8 | 16.8 (333) | 33.3 (350) / 49.9 / 100 | 1.0 / 1.0 / 1.0 | 28 / 150 | **green** |
| CI 2 | [37930590707](https://github.com/Pokfus/folio/actions/runs/37930590707/job/113820644797) (dispatch) | 33.4 (200) / 66.7 | 16.8 (333) | 33.3 (350) / 33.4 / 117 | 1.0 / 1.0 / 1.0 | 28 / 150 | **green** |
| CI 3 | [37938590103](https://github.com/Pokfus/folio/actions/runs/37938590103/job/113847508729) (dispatch) | 33.3 (117) / 33.5 | 16.7 (183) | 16.7 (217) / 16.8 / 50 | 0.5 / 1.0 / 1.0 | 28 / 150 | **green** |

Three consecutive green CI runs on one head, and the first run's Playwright job was cancelled by the dispatch of the
second (a dispatch cancels the branch's running jobs; the gate had finished). The second run's Playwright job completed:
57 suites green, the Atlas suites among them (`test-atlas-a11y`, `-card`, `-credits`, `-fallbacks`, `-labels`, `-phone`,
`-places`, `-relief`, `-render`, `-search`, `-session`), and three red that are the known pre-existing ones —
`test-draw-cards.js` (fd-223, fd-228, fd-229), `test-tour.js` ("no long dashes", the streak step) and
`test-personal-atlas.js` (the timing check classified above); `test-war-cards.js`, red on main's run, was green. The
gesture stage every CI run learnt in its rehearsals was 2, as on the session's runner: CI's runner is software GL too,
only with a second core. The run on the head that carries this paragraph is reported with the phase.

**English names, one row per place** (`build-gazetteer.js`, the header states the rule; `check-gazetteer.js` proves it).
The display name is the source's English field where the source translated it (Natural Earth's `NAME_EN` / `name_en`
differing from `NAME` — for the core's admin-1 units NE admin-1's `name_en` by ISO code: "Magadan", not "Maga
Buryatdan"; "Tibet", not "Xizang"), else the item's English label from Wikidata, else the source name; diacritics follow
the English Wikipedia title where the two differ only there (Bogotá gains its accent, Zürich loses its umlaut, Eswatini
its capital S; São Paulo keeps its tilde). One row per Wikidata item per kind: rows sharing a QID within a kind are merged —
the marine and regions polygons as one shape before the label geometry is computed (the Atlantic's two polygons, the
Pacific's, three island groups, one range, one region), the rivers as one row whose `alt` column lists the other water
entities (the worker lays the name along every stretch; a tap on any stretch answers with the row) — and every other
name becomes an alias, so a search for "Donau" finds the Danube. Three things the rule met in the data and how each was
settled: (1) **countries keep the core's name**, which is NE admin-0's `NAME` and already the English short name — NE's
`NAME_EN` there is the long form ("People's Republic of China", "Czech Republic") and wrong outright on a row ("Wake
Island" for the Spratly Islands); (2) **the Wikidata label is taken narrowly** — only where the source has no English
field, or copied a non-ASCII local name into it, and the label is plain ASCII without a parenthesis — because read broadly
it renamed 80 rows and some 70 of them wrongly: NE's own Wikidata ids are wrong on a few towns (Niamey → Maradi, Misrata →
an Arabic label, Baqubah → Bagdad) and Wikidata's labels follow conventions of their own ("Bali Island", "Ōita-shi",
"Taoyuan District", "Australian continent"); narrowed, it changes seven rows (Ha'il, the Aoukar Depression, five rivers
with a non-ASCII NE spelling); (3) two guards on the English field: a town or unit whose English field turns it INTO a
country's name is a source fault ("Saudi Arabia" for Ha'il) and keeps its name, and two admin-1 units of one country with
one English name (Moscow the city and the oblast; Washington the state and the District) each take their English
Wikipedia title where it begins with the shared name and goes on without a parenthesis ("Moscow Oblast", "Washington,
D.C."; "Washington (state)" has one and keeps "Washington"). Two Natural Earth faults are recorded rather than repaired:
Altai Krai carries the Altai Republic's Q5971 and the Republic's English name — the Krai keeps its local "Altay", no QID,
no link; and the Jewish Autonomous Oblast's English field reads "Jewish". **"Böhmerwald" stays**: NE's English field and
the Wikidata item's English label (Q23821373) both say Böhmerwald and the item has no English article — the one name the
owner named that no source offers an English form for. "Drau" has two rows still, one with Q171009 (now "Drava") and one
stretch with no Wikidata id at all, whose English field is "Drau".

| kind | rows before → after | renamed | merged away | what moved |
|---|---|---|---|---|
| country | 257 → 257 | 4 | — | diacritics by the title (Eswatini, Åland, Saint Barthélemy, São Tomé and Príncipe) |
| admin1 | 172 → 172 | 50 | — | NE admin-1 `name_en`: 46 Russian subjects (Primor'ye → Primorsky Krai, Chita → Zabaykalsky Krai, Yevrey → Jewish…), Tibet, Inner Mongolia, Washington, D.C., Moscow Oblast |
| capital | 203 → 203 | 7 | — | Copenhagen, Bogotá, Andorra la Vella, South Tarawa, Port of Spain, St. George's, Washington |
| city | 400 → 400 | 35 | — | Zurich, Osaka, Kobe, Montreal (the title's spelling); Prayagraj, Gqeberha, Chittagong… |
| town | 1,080 → 1,079 | 184 | 1 (Bandar Lampung twice) | Ghent, Lucerne, Sidon, Beersheba, Shimla, Ha'il, 60 Vietnamese and Turkish towns regaining their diacritics… |
| sea / ocean / gulf / strait | 71 / 7 / 160 / 52 → 71 / 5 / 160 / 52 | 2 gulfs | 2 oceans (the Atlantic's and the Pacific's two polygons each one shape) | — |
| lake | 1,628 → 1,628 | 0 | — | HydroLAKES carries no English field and no Wikidata id: its names stay as given |
| river | 952 → 591 | 144 | 58 (Rhein + Rhin + Rhine; Donau + Danube; Tajo + Tejo; Chang Jiang + Yangtze; Albert Nile + Bahr el Jebel + Victoria Nile…) | NE `name_en` (Cauvery → Kaveri, Corantijn → Courantyne, Luzern…); 288 rivers of scale rank 8 left out for the budget (below) |
| island / island-group | 409 / 161 → 406 / 161 | 3 / 1 | 3 / 0 | — |
| range / region | 219 / 364 → 218 / 363 | 4 / 11 | 1 / 1 | Jebel Akhdar, Carpathians, Tianshan…; Aoukar Depression (the one label-driven rename among the regions) |
| **all** | **6,135 → 5,766** | **445** (387 by the source's English field, 7 by Wikidata's label, 51 by the title's diacritics) | **66** (58 rivers, 2 oceans, 3 islands, 1 town, 1 range, 1 region) | the file 617,769 → 592,123 bytes (0.592 MB decimal) |

**The budget, in decimal.** The owner's 0.6 MB is 600,000 bytes from this phase on (it had been 0.6 × 1024² = 629,145;
the 1c file, 617,769 bytes, was 0.618 MB decimal and over). The English names and the aliases cost 20 KB (the aliases
31 KB in all, of which the first two 30 KB — capping them saves nothing worth a name), so a lever had to go: measured,
the 288 rivers of scale rank 8 cost 28 KB and are the names a reader sees last (drawn as lines still, named from rank 7
up; 591 named rivers remain), the towns under 150,000 would have cost 200 names, and lakes under 40 km² a hundred. The
builder's defaults are now the shipped file's (`--tier 1000000`, `--river-rank 7`); the file is 592,123 bytes.

**The Sources and credits page** (`#credits`, `PAGES.credits`; `atlas/data/credits.js`). `build-credits.js` walks
`atlas/data/` and merges the `sources` header of every file — the core, 414 land tiles, `water.bin`, 228 water tiles,
`relief.json` (whose 27 planes carry the same block, which `check-relief.js` proves), `gazetteer.js`, the two twins and
`credits.js`'s own predecessors excepted: 648 files, 11 sources, one variant each — so the page can never say more or
less than the data does, and `check-credits.js` in the fast CI job regenerates it in memory and fails when the committed
file lags. Each source shows its name, version, licence (the identifier's display name, linked to the source's own licence
page), the attribution string exactly as `sources.json` carries it (the row is `.notranslate`, so the site's spelling pass
leaves "License" alone), the retrieval date and the Folio files derived from it (a directory with its count). The page
adds two sentences of its own, which counsel is asked to review: the caution ("Every border and coastline on these maps
is a reconstruction from the sources below, drawn at the resolution each source allows and as it stood on the day it was
retrieved; a historical border in particular is one reading of incomplete evidence, and should be taken as a guide to
where a boundary ran rather than as a judgement on where it lies") and the ODbL statement, which names the source and
its attribution, says that each derived file is a database of its own offered under the ODbL 1.0 at the listed paths
(`atlas/data/topology.bin`, `topology.bin.js`, `tiles/3/` (32), `tiles/4/` (382), `gazetteer.js`), links the licence
text, and says that nothing else on Folio is under the ODbL. The gazetteer is on that list because its header names the
OSM source: its `within` and its anchors are computed against the OSM partition. The page is linked from the Settings
page (the Atlas card), the home page's footer ("Credits", beside About and Changelog), the About page's credits list and
the Atlas v2 About sheet; `#map2` itself stays unlinked. `test-atlas-credits.js`: every source id in every file header is
on the page and none on the page is absent from every file; every licence accepted; every link https; the attribution
strings verbatim; the ODbL statement names every file carrying the OSM source; the page fits 390 px; the four doors open it.

**About this map.** The `?` chip under the Legend chip opens a labelled dialog: what the map is made of, the caution
sentence, the credits link, and the keys (drag and arrows, scroll and pinch, Home, Tab, Esc, R, `/` for search, `?` for
the sheet). One sheet at a time: opening it shuts the legend and vice versa; Escape closes it and returns focus to the
chip. On a desktop both sheets open to the LEFT of the chip column, never over it (the phone audit found the legend's
sheet covering the About chip and the About sheet covering the Legend chip); on a phone they are bottom sheets and the
chips step aside while one is up.

**Fallbacks** (`test-atlas-fallbacks.js`, 32 checks). (a) **`file://`**: `atlas/data/topology.bin.js` (4.03 MB) and
`water.bin.js` (5.81 MB) — the same bytes as base64 in a script assigning `window.ATLAS_TWIN[name] = { bytes, sha256,
b64 }`, 9.84 MB together under the owner's 12 MB (decimal), written by `pack.js --install` / `--twin` and `pack-water.js`
(which refuses the water twin if the pair would pass 12 MB, and then atlas.js says rivers and lakes are absent),
decoded in the page by `fetch()` of a `data:` URL (off the main thread; `atob` the fallback), sha256-verified with
`crypto.subtle` before use, and checked identical by hash in `check-topology.js` and `check-water.js`. The worker's
code runs on the main thread behind the same messages, and every heavy loop in it — the parse (a generator reader that
yields between sections and every 262,144 vertices), the unit vectors, the per-face triangulation (Canada at LOD 2 is
thousands of rings and 200 ms: it yields between them), the bucket sort, the caps — awaits a `tick()` that yields to the
event loop after 40 ms of work and moves the status line. Measured in Node and in the page: the worst task after the
mount is 107–138 ms (one earcut call of 32 ms or a collection pause lands on a chunk's end), against the owner's "about
100"; the suite holds 150. The twins are loaded, the land is shaped in 7.1–7.5 s from a file (against about 3 s with the
worker), tiles and relief are never asked for (the finest level is the finest resident one, 0.5 km/px), the names are
laid out, a tap names Niger, and a sentence says what is left out and why. (b) **No WebGL2** (`--disable-webgl
--disable-3d-apis`): `atlas-canvas.js` draws LOD 0 with Canvas 2D — the ocean disc, the land as one path of every
front-facing triangle filled once by the nonzero rule, the selected face, the lakes, the lines by kind (dashed where
disputed), the graticule, the rim; a frame costs 50–200 ms in a browser and up to 9 s in headless Chromium's software
raster, so a drag blits the last frame moved by the pointer's travel and one true frame follows the release; picking is on
the CPU (the face whose projected triangle holds the point); the labels layer works unchanged (43 labels at the globe);
the zoom stops at 5 km/px; relief is declined with a sentence naming WebGL2. (c) **Context loss**: `WEBGL_lose_context`
loses and restores the context with France selected and its card open, relief and the graticule on at 3 km/px: the
levels, the water, the tiles and the relief are fed again, the view, the selection, the card, the layers and the relief
state survive, the renderer counts one restore, and a pick at the centre answers France. (d) **A worker that fails to
start** (its script throws): the topology and the water are kept on the main thread until the worker has read them
(posted as copies, not transfers), so the page terminates the worker, says "Shaping the land here instead…" and hands the
same bytes to the shim, which parses the land, the water and, at a tile zoom, the tiles.

**The phone and tablet audit** (`test-atlas-phone.js`; screenshots at 360×640, 390×844, 430×932, 768×1024 and 844×390 in
folio, folio night and synth — 60 shots, reviewed). What it found and the phase fixed: the legend's and the About sheet's
rectangles covered the chip column (above); the expanded card sheet (70 %) reached the zoom stack on a 360×640 phone (it
stops at `calc(100% - 184px)` now); with the card column open on a tablet the zoom stack, pushed left, met the search box
(the box yields to `min(300px, calc(100% - 486px))`); the phone's "card open" rule `.atlas2-phone .atlas2-has-card
.atlas2-zoom` had a descendant combinator since 1c and never matched, so a phone with a card open had its zoom stack 400 px
off the left edge; a landscape phone's globe scrolled (the Atlas is `min(360px, calc(100vh - 110px))` tall); the phone's
sheet opened expanded a second time (it opens shut every time now); the result list's cap `calc(var(--atlas2-vvh) -
140px)` was written with a stray parenthesis and dropped by the parser; the expanded card sheet on a landscape phone (844×390,
the Atlas 280 px tall) was 96 px — a title and no body — under the `calc(100% - 184px)` rule, so under 500 px of height
in landscape the up sheet takes the height below the search box and the zoom stack steps out from under it
(`.atlas2-card-up` on the host); and the pinch drifted — the pan by the midpoint's
pixel travel at the centre's scale, then a zoom about the midpoint, moved the place under the fingers 4–15° over a 40-step
pinch off centre, and two pointer events per touch move arrived faster than frames, so the second unprojected against the
last frame's rotation. A pinch now zooms and moves in one step (the place under the old midpoint lands under the new one,
both unprojected) and `rotation()` runs after every change, so the midpoint holds to under a degree. Built new: 44 px
targets on a coarse pointer (the chips, the search box, the result rows, the sheet's rows and close buttons, the grip, the
stack chip); `env(safe-area-inset-*)` on the chips, the sheets, the notes and the card; a double tap zooms in about the tap
(a touch tap's pick waits 260 ms for a second tap, because a pick is two ID passes and on a slow GPU pushed the second
tap past the window when the pick ran first — the probe showed the first tap's own pick stretching the wait); the soft
keyboard: the layout viewport and `100vh` do not change when a keyboard comes up, so the map stays where it is, and what
follows the visual viewport is the result list, whose height is `--atlas2-list-max` — the room between its top and the
visual viewport's bottom, recomputed on `visualViewport` resize and scroll and when results open — and the focused search
box, scrolled into the visible part if covered; the suite emulates the keyboard by taking 300 px from the viewport with
the search focused and holds the map's centre, the box and its list in view. The tablet (768×1024) takes the desktop
layout (a fine pointer by Playwright's rules) and is held to 34 px targets.

**Accessibility** (`test-atlas-a11y.js`, 28 checks; axe-core 4.x run from a scratch directory, not committed). Built: a
polite, atomic live region speaks the selection ("France, country", "Nothing selected", and how many places share a tap);
focus moves to the card's heading when the card opens and returns to the opener on Escape or Close (the key-list button,
the search box, the canvas); the About sheet is a `role=dialog` with `aria-labelledby`, takes focus and returns it to its
chip; the search is a combobox with `aria-expanded`, `aria-controls` the labelled listbox, `aria-autocomplete=list` and
`aria-activedescendant` following the arrow keys; under `prefers-reduced-motion` (or the site's animations switch) there is
no fling, `flyTo` lands at once, the progress bar's transition is off, and the label fade near the limb — a spatial fade,
not a movement — stays; a `forced-colors` block draws the focus rings as outlines in `Highlight` and the chrome's edges in
`CanvasText` (box-shadows vanish in Windows High Contrast), the canvases keeping their palette; every font size in the
chrome is `calc(px × --fs)`, so the site's Text size setting reaches it, and at `--fs: 2` every control stays inside the
Atlas (the sheets scroll inside it). **axe, before and after**: the 1c code read one violation type on every state — the
zoom stack was `aria-hidden="true"` with three focusable buttons inside (`aria-hidden-focus`, serious): 4 nodes over the
globe, the card, the legend and search; the 1d code reads **0 violations on all five states** (the About sheet included)
and the `#credits` page read 61 colour-contrast nodes on the first scan (the licence chip's link, indigo at 10 px) —
the chip went to ink at 11 px, and the rest were the scanner's: the page fades in (`.page` and `.mission` carry an
enter transition) and a scan started the moment the list appeared read every colour at partial opacity; a scan that
waits for the fade reads 0 on `#credits`, with and without the chip's change (kept).

**The five-minute session** (`test-atlas-session.js`, 300 s, 54 rounds on the session's runner: fly to one of three dozen
coasts, let its tiles land, pan, walk four views along the coast at 0.15 km/px, wheel out through the levels, search and
open a card, pinch at the globe; relief on every other round; the heap read after a forced collection every ten seconds).
The first cut visited a dozen coasts and never crossed the 96-tile cap — 43 tiles fetched, none evicted, the caches full
by round 13 and nothing changing after — which proved growth, not eviction, so the itinerary grew to three dozen coasts
with the walk. Measured: the JS heap 199 MB at the start (the gazetteer and the water index before their first
collection), 78 MB after round 1, 81–82 MB from round 11 to the end, 81 MB at the end — the heap returns to its baseline;
the land-tile cache fills at round 19 and evicts from there (217 fetched, 96 resident, 121 evicted at the end), the
water-tile cache holds its 64 from round 15, the relief cache its 9 of 10; the label sprites are always the current
layout's (63 of 63 placed, 40 of 40 at the globe). The renderer's GPU bytes (every buffer and texture it has uploaded and
not deleted, counted in `atlas-gl.js`): 168 MB at the start (the three core levels' triangles and segment textures, with
the water's), a peak of 706 MB with every cache full, 616 MB at the end with relief off — bounded by the caps, and the
caps are the finding: 96 land tiles and 64 water tiles at 1280×800 are some 450 MB of tile geometry on top of the core,
which a desktop GPU carries and a phone's should not. **For the owner**: the 1a/1b cache caps (`TILE_CACHE`,
`WATER_TILE_CACHE` in `atlas.js`) are not scaled to the device; a phone-sized cap (or a byte budget in place of a count) is
a Phase 2 item, not changed here.


**River labels at 0.5 km/px** (`atlas-worker.js`, the river branch of the layout). Once the rank-8 rivers left the
gazetteer the labels suite's "rivers labelled at 0.5 km/px" went red, and the reason was older than 1d: at that scale the
LOD 1 vertices of a meander sit 10–15 px apart, closer than the glyphs, and every try on the Rhine (80 vertices on screen,
a 1,088 px run), the Moselle and the Weser bent past the 23° a glyph may turn — on 1c the one river labelled at the Rhine
view was the Maas, a rank-8 row that happened to run straight. The text now follows a copy of the run averaged within two
text sizes of arc length (count and order kept, so the anchor stays a vertex of the real line) and slides up to 120 px
either way from a spot that bends or collides; the Rhine view now carries the Rhine twice, the Lek, the Nederrijn, the
Moselle and the Weser. The layout's debug reasons (`labelWhy()`) now name the row and, for a river, the vertices on
screen, the longest run, the tries, the bends and the collisions.

**Findings that contradict or sharpen the design.** (1) The 1c gate measured SwiftShader's full-screen fill, not the
renderer: the owner's rules split the pinch into gesture and release and warm the relief first, and the renderer meets
the gesture half by adaptive degradation (half resolution, then one coarser level) — a behaviour the design did not have and a fast phone never shows. (2) §2.9's "the
Atlas works on `file://` with the main-thread shim" needed more than a shim: a cooperative worker (every heavy loop
yields), a generator reader and twins verified by hash; "about 100 ms" a task is met at 107–138. (3) The brief's naming
rule "the source's English field, else Wikidata's label" could not be applied as written: NE fills its English field
for every record (so the label clause would never run) and where the label was consulted anyway it was wrong twice as
often as right, so the label is taken narrowly and the countries keep NE's short `NAME`; two Natural Earth faults (Altai
Krai's Wikidata id and English name, Ha'il's) and one Wikidata gap (Böhmerwald) are recorded rather than repaired. (4) The
0.6 MB budget was binary until this phase; in decimal the 1c file was over, and the lever was the rank-8 rivers. (5) The
phone's card rule had a selector fault since 1c that no suite had read: the audit's overlap check is what found it.
(6) A touch tap's pick must wait for a possible second tap, because a pick is two ID passes. (7) The pinch's pan was an
approximation that held only at the centre. (8) Canvas 2D in headless Chromium's software raster costs up to 9 s a frame
for 55k triangles — the still view is for a browser without WebGL2, not for CI's speed, and the suite reads the frame
count, not the time.

**Screenshots, reviewed** (the credits page on a desktop and at 390 px; the About sheet; the phone set — five viewports
× three themes × the globe, the card shut and expanded, the legend and the About sheet; the `file://` view; the no-WebGL2
view). The credits page reads as a page of the About family: eleven sources under one caution card, each with its licence
chip and attribution in italics, the derived files as code, the ODbL card last; at 390 px nothing runs off the right
edge and the long paths break. The About sheet on a desktop sits left of the chip column with its key list in two
columns; on a phone it is a bottom sheet with the chips gone. The phone set: at 360×640 the search box, the three
44 px chips and the Legend chip clear each other with 12 px gaps, the shut card is a title strip at the foot above the
tab bar, the expanded card stops under the zoom stack; in folio night the chips and sheets are dark cards on the dark
sea; in synth pink; the landscape phone (844×390) carries a 280 px globe with the legend sheet scrolling inside the
viewport. The `file://` view is the normal globe with the sentence at the foot and the Relief row of the legend greyed.
The no-WebGL2 view is recognisably the same atlas — ocean, land, borders, rivers, lakes, the names in the same type —
without relief and with the coast at LOD 0's 10 km tolerance.

#### Phase 1 — closing summary (2026-10-09)

Phase 1 set out to ship the present-day earth at every zoom behind `#map2` with no timeline. It did, in four sub-phases
over 2026-10-08 and 09: **1a** the OSM land partition (833k records, 6.25 M working vertices) with Natural Earth's borders
conflated onto it, five levels of detail, 414 tiles, the frame gate redefined for software GL; **1b** rivers and lakes
(Natural Earth 10m rivers after HydroRIVERS failed the licence rule; HydroLAKES at four levels) in files of their own under
12 MB, relief from ETOPO 2022 as two levels of three greyscale planes under 45 MB, the water and relief passes; **1c** the
gazetteer (now 5,766 places), the label layer laid out in the worker, picking through two ID passes, the place card, the
legend, search, deep links, the keyboard list; **1d** English names with one row per place, the Sources and credits page
generated from the data files' own headers, the About sheet, four fallbacks, the phone and accessibility audits, a
five-minute memory proof and the owner's gate rules. What ships to readers from Phase 1 is the credits page and its links;
`#map2` stays a preview until Phase 5. The land, water and relief files are byte-identical to 1a's and 1b's. Carried
forward: the finer-names data work (1e: towns under 100,000, the Aegean's thin density, lake Wikidata ids), the
Böhmerwald-class names no source renders in English, L2 relief (unaffordable under 45 MB), HydroSHEDS v2 when it goes
global, and the Phase 2 timeline, for which every generated file already carries the `sources` header the credits page
reads.

### Phase 2 — Time (ships `#map2` with a timeline; ~8–10 sessions)

*Goal: every year is a query; borders are steps from accepted sources, conflated, coast-snapped,
shared; uncertainty is drawn; peoples are a distinct presence.*

Deliverables:
1. `build-polities.js` v2: reads `polity-spec.json` (reused: 164 matches, years, coast and site
   flags) and Cliopatria v0.2.0; whitelisted OHM series via Overpass (`sources.json` entries per
   relation); per-step conflation per §2.3 (coast snapping *d*₁, neighbour merge *d*₂, border
   inheritance *d*₃, sliver assignment), contested faces as explicit overlay faces (Q-U4 a),
   uncertainty class per face and arc (Q-U1 a), the snap log with per-source tolerance failures.
2. `build-peoples.js`: Cliopatria "people" rows and the steppe hegemonies as soft faces (Q-U3 a);
   `site-hulls.json` (Hosner) as soft phase faces; traced plates where the audit's batch 6 names
   one (each plate a `sources.json` entry).
3. Events: `fronts.js` content as event faces (WW2, monthly 1939–42, fortnightly plates 1943–45);
   war cards' sides as `side:victor`/`side:loser` steps resolved from the entities they name;
   `state-capitals.js` rows as city steps.
4. Steps table and year query in the worker; style tables; crossfade at steps (off under reduced
   motion); gaps draw nothing (Q-U2 a) and the place card lists them.
5. Timeline UI: one rail 10,000 BCE → today with the knee (Q-T1 a, Q-T2 a), drag magnifier, year
   pad, change-year ticks for what is on screen, `[`/`]`, playback every year at 1/5/25/100 years
   per second (Q-T4 b), default year = last used else the reader's median (Q-T3 a; for `#map2`
   before Phase 3 the median is over all cards).
6. Peoples rendering (stipple, spaced italic, multiply blend, Q-C1 a), the three-position Peoples
   switch (Q-C2 b), states' label paths per step.
7. Place card for historical entities: kind, span, the step list as a mini-timeline with source
   names, the uncertainty sentence, the gap list; `ADMIN_EDITS.places` deltas for prose and
   citations with the `after` hook on the gazetteer bundle (Q-A2 a; the A9 prose plan resumes
   here as content batches).
8. The data batches of the audit continue as spec-file work from here on (tier 3 tracing, tier 4–5
   soft outlines, OHM whitelist), each gated by `check-topology.js` and a §7 ledger row appended to
   `docs/atlas-borders-audit.md` §7 — engine phases and data batches proceed in parallel.

Tests that prove the phase: `check-topology.js` for every change-year (planar with contested faces,
coast invariant, shared borders, every step inside its entity's span, every source in the header);
the 1,705 in/out assertions from `card-war.js` migrated to run on the built topology, plus new
assertions per batch; `test-atlas-render.js` at twelve (year, view) pairs; `test-atlas-perf.js`
scrub and playback with ≤ 5 ms main-thread cost per year change; a people and a state overlapping
read as distinct in the screenshot diff for the "Scythians over Bosporus 450 BCE" view.

### Phase 2a — as built (2026-10-10): the step topology, the year query and the rail, on the pilot slice

**Scope.** Sub-phase 2a only — the pilot slice of §2.3, behind the unlinked `#map2`. Not started: 2b (all
164 series), 2c (peoples), 2d (wars, fronts, prose). Preceded by Task 0, four fixes from the 1d review and
the owner's phone (below).

**Task 0 (the 1d review).** 0a — the credits page now says it covers the new globe (`#map2`) and carries
a separate, clearly headed section for the current Atlas (`#map`) with the sources, licences and
attributions recorded verbatim in `docs/atlas-borders-audit.md` §3 and v1's help card (Cliopatria,
Hosner 2016, the Commons and US Army WW2 maps, historical-basemaps marked "under owner review" in the
audit's words, Natural Earth and the terrain tiles, the last two with "licence not recorded in Folio's v1
documents" rather than a licence from memory). 0b — the gesture stages: a frame counts toward escalation
only if no main-thread task over 20 ms ran in it (the tile ingest, relief compose, layout and sprite work
are bracketed; a long-task observer catches the rest; a browser long task that STARTS inside a frame's
own span is the frame's work, not a stall — on software GL every slow frame reads as one); the GPU's own
time where `EXT_disjoint_timer_query_webgl2` answers; recovery — a gesture starts one stage lower than
the learnt stage once twenty gesture frames at the learnt stage ran under 25 ms (the frame's own cost:
the GPU time where the timer answers, else the frame's main-thread span — the interval between frames is
a 60 Hz loop's or a throttled tab's and says nothing about the frame); the deep-link writer keeps
`?perf` (now `?y=<year>&perf`); the About sheet's "Show frame statistics" switch (localStorage, try/catch);
the overlay's first line is the stage, the escalations, the recoveries, the stalls ignored and the heap,
updated five times a second (a DOM text block relaid out every frame cost more than the frame on a
software rasteriser). 0c — the worst-frame rule in the gate: across the three drag repeats at most two
frames over 100 ms and none over 200 ms, the same for the pinch's during-gesture worst. 0d — the
controls' rectangles (search, zoom stack, home, legend chip, ?, the open sheet, and now the rail) are
measured at every layout and resize and fed to the label layout as occupied cells; a point label must be
wholly on screen and outside every control; an area or path label may be clipped by the edge by a quarter
of its length and never by a control; **the upside-down river labels were confirmed** by a glyph-rotation
probe against the 1d worker (Danube 157°, Rhône 134°, Po −169° from upright) and fixed: a path is
reversed when its mean direction points left and no glyph may be rotated past 90°; asserted at 1280×800
and 390×844 in `test-atlas-labels.js` (0 of 35 curved labels beyond 90° at the Alps view, where the old
worker had 6).

**Measured first — the distributions (`build-history.js --measure`, 219,407 vertices of the 557 rows
alive in the pilot's years).** d1, vertex to the OSM coast: median 7.6 km; 4,338 under 250 m, 5,615 to
500 m, 9,274 to 1 km, 17,822 to 2 km, 14,295 to 3 km, 14,138 to 4 km, 26,315 to 6 km, 22,710 to 8 km,
15,293 to 10 km, 12,167 to 15 km, 2,272 to 20 km, 4,254 to 30 km, 6,588 to 50 km, 64,326 beyond — a
shoulder that falls off between 10 and 15 km, so **D1 = 15 km** (Cliopatria draws its coasts within that
of the shore; the band 15–20 km is a tenth of the one below it). d3, vertex to a present-day border:
757 under 250 m, 1,106 to 500 m, 1,358 to 1 km, 2,207 to 2 km, then rising with distance (2,687 to 3 km
… 15,967 to 50 km, 164,378 beyond) — no shoulder, so **D3 = 2 km, runs only**: a lone vertex 2 km from a
present-day border is not evidence that the historical line followed it. d2, vertex to a neighbour's
line in the same epoch (303,534 vertex–neighbour pairs): 22,535 under 250 m, then nothing to 500 m, 1 to
1 km, 118 to 2 km, 72 to 3 km, 49 to 4 km, 290 to 6 km, 2,745 to 8 km, 147 to 10 km — two populations,
shared edges (exact, under 250 m) and the 6–8 km band where two sources drew one frontier twice, so
**D2 = 8 km with a sure threshold of 1 km and the run rule between**. The per-pair table (Ptolemaic–
Seleucid 1,838 exact and 456 at 6–10 km; Byzantium–Sasanian 2,192 and 86; Avars–Byzantium 1,568 and 91)
is in `out/history-report.json`.

**Counts (the pilot).** 32 series kept of 38 candidates (6 touch nothing: Bosporus, the Peloponnesian
League, Scythia, Kushan, Aksum, Makuria); 557 source rows → **39 entities (6 contested), 534 steps, 519
faces (8 contested), 9,389 arcs: 6,268 coast references, 102 present-day border references, 3,019 own
arcs of 29,594 vertices**; 175 epochs over −550…650; 175,528 snaps, largest 14,916 m, none over the
15 km tolerance; 182,875 coast runs dropped, 1,519 border runs, 83,810 chord splits, 148 border
references cut by a crossing chord; 150 sea chords at 3 sites; 9,284 slivers merged (509,000 km² over
all epochs); 3,251 gap pieces unmapped (7.18 M km² over all epochs, the continents' remainders mostly).
Junctions at the coarser levels: 140 moved to the border's coast crossing, 24 border vertices hidden
there, 105 crossings too far to move, 13 reverted for coast order, 6 piece ends reverted. Planarity
residue after the repair: level 0 66, level 1 59, level 2 **0**, 25 distinct arc pairs — the checker's
coarse-level budget is 200.

**Bytes and the forecast (the stop rule).** `history.bin` **958,996 bytes (0.959 MB decimal)**: header
72.0 KB, vertices 144.5 KB, ranks 10.3 KB, arcs 45.8 KB, faces 513.2 KB, coreRef 67.3 KB, jpos 83.3 KB.
1,796 bytes per step × 2,648 steps of all 164 spec series = **4.76 MB decimal forecast**, under the 12 MB
stop rule; the `file://` twin is 1.28 MB and the three twins together 11.12 MB, under the owner's 12 MB.
Three builds, each deterministic (`967a90d4…` before the face anchors, `9d486736…` before the capitals source's retrieval date entered the header, `68d8d9d4…` committed). The land, water
and relief files are byte-identical before and after (`topology.bin` `26629af5…`, `water.bin`
`30bea9ba…`, every tile and relief file; `git diff --quiet` over `atlas/data` apart from the three
history files and `credits.js`).

**Known source faults found by the assertions (listed in `check-history.js` KNOWN_FAULTS, never forced).**
140 independent point assertions (Natural Earth populated-places coordinates; the claims are textbook
facts I checked one by one — **not one named independent source**, which the brief asked for and which I
could not supply honestly without a reference work at hand; the owner may want them re-sourced) — 139
hold, 1 known fault; 220 extent assertions from the cards' war extents through `polity-spec.json`
(asserted at the war's outbreak year, a side of several polities holding a place when any of them does)
— 173 hold, 47 known faults. The faults, each checked against the raw Cliopatria polygon of the year:
Cliopatria's Roman Republic of 480–338 BCE is a 12-vertex block whose east edge (12.45° E) leaves the
city of Rome, Tibur and Capua outside (rm-152, rm-153, rm-156, rm-158, rm-159); its Republic rows of
218–63 BCE include Milan and Bologna where the cards' extents leave Cisalpine Gaul out (rm-209 … rm-333,
11 pairs); Florence is unmapped at 264 and 229 BCE (rm-186, rm-237); Larissa belongs to "Greek
City-States", not Antigonid Macedonia, at 171 BCE (rm-249), as does Sparta against the Achaean League at
146 BCE (rm-255) and Ephesus and Miletus against Lydia at 547 BCE (gr-383); Hippo Regius is unmapped
under Numidia at 112 BCE (rm-292); Pydna lies outside the Macedonian polygons' coarse coast at 334 and
323 BCE (wh-310, gr-755); Damascus is Ptolemaic at 250 BCE and Cyrenaica unmapped (Magas) — two of my
own first assertions, replaced by sounder years; the Rashidun have no Cliopatria row alive in 632
(wh-463). Conflation limits, documented as such: Carthage's Sicily of 301–278 BCE is a coastal strip
under 15 km wide round an unclaimed interior (a keyhole ring) and collapses onto the coast within the
tolerance, leaving Palermo unclaimed; Corfu is Illyrian at 229 BCE by majority of the island's interior
(20 of 34 samples inside the drawn polygon) where the card's extent leaves it out; coastal notches
narrower than the tolerance at Hippo Regius (480 BCE), Syracuse (58 BCE) and Carthage (632 CE) join the
surrounding face.

**What the renderer learnt from the gate (software GL, 1280×800, measured frame by frame with the new per-frame trace,
`statsNow().frameTrace`).** A frame on the runner's software rasteriser is priced per primitive, not per pixel: about 2 µs a
segment and 0.7 µs a triangle, so the Mediterranean at 6 km/px — 58,000 land triangles, 42,000 segments of coast, border,
river and lake, and the pilot's 32,000 fill triangles and 12,000 border segments — cost 130 ms a frame while a scrub changed
only the year, and half resolution changed nothing. Four things followed, all in `atlas-gl.js` and `atlas.js`: (1) **the line
layer** — the water and the land's lines are drawn into a texture keyed by the view, the sizes and every upload, and
composited with one triangle a frame; (2) **the still cache** — while the view does not move the base (sphere, faces, relief)
is rendered once into a texture with its stencil, copied into a scratch target each frame, and only the year's layers (fills,
the line layer, borders) are drawn on the copy; a moving view draws straight to the canvas as before, so the cache costs a
frame nothing until the second frame at one view, and both paths draw in the same order (faces, relief, fills, lines,
borders — the fills now sit over the relief shading, which the 42 % alpha tolerates); (3) **label sprites are cached** by
text, style, glyph layout, selection, dpr and theme — a layout re-renders only the labels that are new or moved along a path
(a scrub's layouts cost 100 ms of canvas text a second before); the layout is HELD while the pin is dragged and the rail's
ticks (177 DOM nodes) are rebuilt only when the change years change, and the pin's track is measured once per drag (a measure
after a style write forced a layout on every move); (4) **a rail scrub is a gesture** for the stage logic, and at stage ≥ 1
the history is drawn one level coarser (the fills are masked by the land stencil at full resolution either way). A still
frame at the Mediterranean fell from 86 ms to 50; a year-change frame from 67 to 50; the base map alone from 71 to 43.

**From the screenshot review (the series under §7 "Proof", 2026-10-10).** Two faults, both fixed before the push: (1) **a polity's
name is placed on the part of its face a reader sees.** The label path took the whole visible polygon (every vertex on the
near side of the sphere, within a margin of one viewport each way), so the Eastern Roman Empire at 500 CE at 3 km/px — its
Balkan third on screen, Anatolia, Syria and Egypt beyond the right edge — had its centroid, its candidates and its reach off
screen, and no name at all; now, when at least three of the face's vertices are on screen, the centroid, the covariance, the
candidate slide and the reach are taken over the on-screen vertices and stop at the screen edge (`histLabelPath`,
`atlas-worker.js`), as a printed sheet names a country on the part the sheet shows; a face with fewer than three vertices on
screen keeps the margin box. (2) **The phone rail is two lines**: at 390 px one line with 44 px targets squeezed the track to
about 85 px for twelve thousand years and pushed the speed select past the edge; the row now wraps — ‹ track › above, then
the year field, play and speed — and `--atlas2-rail-h` on a phone is 104 px, so the card, the sheets, the caption and the
mode note step up with it; a phone on its side (the 844×390 audit view, under 300 px of atlas) keeps one line of 56 px, the
rail stopping 68 px short of the right edge where the control stack reaches the bottom — two lines there put the ? button
under the rail and left the label layout no free cell (the phone suite's landscape context never settled). Checked in the same pass and found sound: the fills stop at the tile coast with no sea tint and no
plain-land gap at any of the fifteen views; the contested Etruria–Rome face hatches at 500 BCE and the Ptolemaic gap draws
plain land with the caption at 323 BCE; no label sits under a control or reads upside down; the three themes keep their own
land, sea and ink (the first series had all three alike — the probe set the theme before the app booted and the app's
settings overwrote it; the retake sets `data-theme` and `.night` on the body as the labels suite does).

**Perf (the gate, `test-atlas-perf.js`, software GL at 1280×800, three repeats pooled, relief off unless said).** Drag v2 p90 33.4 ms against v1 133.3 (25 %), wheel 33.2 against 349.9 (9 %), pinch 33.4 against 350.0 (10 %); the drag's worst frame over 1,227 frames 66.7 ms (0 over 100), the pinch's during-gesture worst 83.4 over 409 frames (0 over 100), its first full frame after release 133 ms (≤ 300); **the scrub: v2 pooled p90 16.8 ms against v1 116.6 (14 %), worst 66.7** — before the still cache the same row read 100 ms (86 %); **a year change 2.2 ms at p95 on the main thread over 174 changes** (budget 5); the Mediterranean at 1 CE, 6 km/px: 48,900 triangles, 24,221 segments, 4,957 river and 8,706 lake-shore segments, 8,073 lake triangles, **32,949 historical fill triangles in 4 faces and 20,988 historical border segments** (budgets 42,000 and 26,000, the measurements × 1.25); relief on, the drag/wheel/pinch p90 stays 33 ms (v1 with its heightmap 50–100); the JS heap after the gestures 45 MB against v1's 197 (23 %).

**The seam at the cap.** Measured by `test-atlas-time.js` at Ostia, 200 CE, 0.15 km/px (the cap): scanning thirteen rows from the sea eastward, the plain-land pixels between the tile coast and the first fill-tinted pixel number **0 on every row** (the rule allows 2) — the fill, masked by the land stencil the tile fills wrote, meets the tile coast exactly; the resident coast stroke in the fill's colour covers the band where the resident fill ring stops short.

**The stage logic's tests (`test-atlas-stages.js`, software GL, 18 checks).** A drag at 1280×800 reaches stage 1 (frame intervals 50–83 ms); at 320×420, after a warm-up drag, a plain drag stays at stage 0 (every frame 33–50 ms); ten injected 150 ms main-thread stalls during a drag leave the stage at 0 and are counted (13 stalls ignored, 19 long tasks seen); with stage 2 learnt, the first light-load drag runs fast frames at the learnt stage and the second drag starts a stage lower and brings the learnt stage down (learnt 2 → 1, two recoveries, stage 0 at the end); `?perf` survives a mouse pan and a reload on the desktop and a touch pan and a reload on a phone (as `?y=<year>&perf`); the About sheet's switch turns the overlay on, stores the choice, survives a reload and turns it off again; no page errors. The suite must run alone: three Chromium instances on the four-core runner stretch every frame to 100–150 ms and the plain drag escalates for that reason, not the Atlas's.

**CI on the pushed heads (run 38022185997 on 001d602; the no-browser job and the frame gate green, the Playwright job red on
eight suites).** Three are the known trio (draw-cards, tour, personal-atlas). `test-war-cards` ("the popup keeps the legend",
the v1 personal atlas) is red on main's last run (37976490261) with the same line — not this branch's. `test-review-decks`
("cards that genuinely carry other phrasings") counts the phrasing pools of the five cards the day's draw deals to Multiple Choice: main's run on
2026-10-09 drew one card with a pool, both runs on 2026-10-10 drew none — the date, not the Atlas (nothing in this branch touches a card). The three Atlas reds were this phase's own
contracts meeting Phase 1's tests: `test-atlas-card` and `test-atlas-search` expected a deep link to END at the place, and
it now carries `?y=<year>` (the year is part of the link by the brief), and the phone sheet to sit on the host's bottom edge,
where it now sits on the rail; `test-atlas-stages` expected a 1280×800 drag on the runner's software GL to escalate, and after
the line and still caches the runner's frames read 50–67 ms, under the 70 ms rule, so stage 0 was the logic's correct answer
— the three tests now state those contracts (an optional year in the link; the sheet on the rail; no escalation owed when the
trace holds no two unstalled slow frames running), and the escalation path stays covered where frames do run slow.
The next run (38026399053 on 6b1d696) read every Atlas suite green on the runner; its five reds are the trio, the war-cards
legend line red on main, and the review-decks phrasing draw again.

**What contradicts the design.** (1) §2.3 said a face's fill and its stroke must come from one ring; a
historical fill comes from the resident mesh and is masked by the land stencil instead — the decision
recorded above. (2) §2.4 planned the year query in the worker; it runs on the main thread (39 entities,
under a millisecond) and the worker keeps a copy for layout — the style tables are the main thread's to
upload. (3) The design's "planar per epoch" is exact at the finest level and a counted budget at the two
coarser ones, for the reason given in §2.3. (4) The pilot's first plan made Cliopatria's steps part of
`topology.bin`; they are a file of their own so the land stays byte-identical. (5) The independent point
assertions are not from one named source (above).

### Phase 2b — as built (2026-10-10): every card-linked polity, with the pilot's fixes

**Scope.** Sub-phase 2b only — the 164 series of `polity-spec.json` as the audit's batches define them, built where
Cliopatria carries them and the audit calls them states (152 series, 194 entities with the contested and nested faces,
2,693 steps); the twelve deferred are listed in §2.3 and in `docs/atlas-v2-coverage.md` with the full inventory (kind, years,
cards, built or deferred). Not started: 2c (peoples, cultures, coastline and site-hull series), 2d (wars, fronts, prose), 1e,
1f. Preceded by Task 0, three defects of the merged 2a.

**Task 0.** 0a — *the two artefacts had one root cause, in the renderer, not the data*: the worker packed each face mesh's
coast-stroke segment as seven floats (two points and a tag) where `uploadSegs` reads eight per segment (point, tag, point,
pad), so every segment after the first read misaligned floats and drew a chord between unrelated points, in the face's own
colour, as wide as the level's tolerance in pixels — the stroke only exists at the tile zooms, hence thick at the cap, thin at
0.6 km/px and absent at 5 km/px; the fan over Sicily was the same misalignment over a face with many coast pieces. Proven by
reading the two views' pixels: on the 2a worker 5,097 of 5,148 full-colour pixels at Tuscany and 156 of 191 at Sicily lie
further than the stroke from any water; on the fixed worker none (`test-atlas-review.js`, which fails on the 2a worker and
passes on this one). The data was sound — which is why `check-history.js` passed — and the brief's checker rules were added
anyway: every core reference's drawn path at every level is at least a quarter of the line it replaces (a piece the level hid
altogether, an islet collapsing to a point at 2.5 km, exempt) and no drawn segment's middle lies further than three
tolerances from the real line (30 / 7.5 / 1.5 km per level; a chord across land fails whatever its length ratio). 0b — the
phone rail: the two-line layout now follows the container's width (`atlas2-narrow` under 600 px), not the coarse-pointer flag
the owner's phone had missed, with the track's flex basis forcing the wrap rather than leaving it to the content (at 390 px
the controls fitted one line at their minimum widths and the speed select was clipped to "25/"); `fmtYear` gives every year its
era ("1 CE", "300 BCE", "2026 CE") and `parseYear` reads them back; the suite measures 360, 390 and 430 px with and without the
flag, with and without a card. 0c — `feedGesture(costs)` runs a gesture of injected frame costs through the stage logic's own
bookkeeping, so the stages suite asserts twenty fast frames, the recovery a gesture later, the escalation on three slow frames
and none on alternating ones, on any runner; the runner's own two drags are reported, ungated.

**Measured first — the stop rule.** The 650–1500 band, built globally as the measurement: 128 epochs, 792 steps, 0.948 MB —
1,198 bytes a step × 2,542 steps of every series = **3.04 MB forecast** (the pilot's forecast was 4.76), under 6 MB, so one
file. The full build: **4.70 MB** (4.702 MB decimal) for 2,693 steps (1,746 bytes a step; the forecast from the band was
low because the medieval band's polities are smaller than the empires' faces elsewhere), the slice twin 0.97 MB and the
three twins 10.81 MB together.

**Counts (the full file).** 152 series of 164 (12 deferred) → **194 entities** (152 polities, 31 contested pairs, 11 nested pairs), **2,693 steps**, **2,592 faces** (67 contested, 20 nested), **51,025 arcs: 34,735 coast references, 692 present-day border references, 15,598 own arcs of 202,849 vertices** (221,395 of the sources' 1,132,169 vertices added along great circles on edges over 50 km); 494 epochs over 3400 BCE – 2021 CE; 786,656 snaps, the largest 14,999.6 m, none over the 15 km tolerance; 1,305 sea chords; junctions at the coarser levels: 954 moved to the border's coast crossing, 224 border vertices hidden, 968 crossings too far to move, 290 reverted for order, 69 piece ends reverted; planarity residue after the repair: level 0 741, level 1 379, level 2 **0**. Unmapped land: every ring an alive row can reach is in the epoch's graph, so the pieces claimed by nobody are the continents' remainders and every islet — counted, not drawn. The file: header 372.5 KB, vertices 944.0 KB, ranks 66.8 KB, arcs 249.4 KB, faces 2,142.3 KB (delta-coded; 3,642.2 plain), coreRef 352.1 KB, jpos 465.0 KB.

**The pipeline.** `build-history.js --install`: **15 min 11 s** fresh on this session's four cores (494 epochs; the 1500s–1800s, with the Spanish and Portuguese empires' coasts on every continent, are the heavy third), **2 min 14 s** replaying the epoch cache (the level repair is most of it); peak resident set under 2 GB (`--max-old-space-size=12000` is headroom, not need). Deterministic: the fresh build and the cache replay of the same geometry gave one sha256 (`ec5f5ed3…` on the first full build, both ways); the committed file `92529dc8…`. Resumable: the first full build was killed by a timeout at epoch 25 and resumed from its cache; the measurement band (650–1500) resumed after 118 of 128 epochs. Three faults found and fixed at full scale, each with a measured site: the parity ray (§2.3), the planar-against-spherical crossing of long edges (the densification), and a junction listed among its own piece's inner vertices (a zero-length first segment read as angle 0 — the Seljuk border at Kuwait in 1056–1071, a two-arc islet off Venezuela in 1516–1804); after them no epoch of the 494 has a mixed land–sea cycle. **Determinism, proved on the final file** (`check-history.js --determinism`): a fresh build with no cache (941 s), a rebuild replaying the epoch cache (141 s) and the committed `history.bin` share one sha256 (`92529dc8…`), 4,702,436 bytes each.

**Colour, labels, the rail, the card.** §2.4 "As built in Phase 2b".

**The coverage report** (`docs/atlas-v2-coverage.md`, generated): the land outside Antarctica in the core is 134.6 M km²; the layer covers under 2 % of it from 3400 BCE to 600 BCE and in 2000 CE, 6.4 % at 300 BCE (19 polities), 9.2 % at 100 CE (7), 19.0 % at 1300 (23, the Mongol successor states), 9.5 % at 1500 (24), and most at 1800 CE (28.4 %, 12 polities — the Spanish and Portuguese empires, the Qing, the Ottomans, the Mughals' remainder, the Marathas); the contested share stays under 0.1 % in every century and the nested share reaches 0.1 % only in the 1200s (the Rus' principalities). The report's sentence names where the layer is thin and says plain land is a state no card covers yet, or one the source does not draw.

**Checkers and tests.** `check-history.js` on the full file: 41 ok, 0 failed, in 225 s (budget 600): the core buildId, every core reference (and its drawn path at every level within a factor 6 of the line it replaces — the smallest ratios 0.35 / 0.29 / 1.00 per level, fractal coasts losing honestly at 10 km — and no drawn segment more than 30 / 7.5 / 1.5 km off the real line), the slice twin on the same core with its sentence, the three twins at 10.81 MB, the sources, the spans, 494 epochs' shared borders and coast invariant, planarity exact at level 2 with 1,120 coarse-level crossings against the 1,435 ceiling (741 at level 0, 379 at level 1, 119 distinct arc pairs × level). The named independent source of the brief: Wikidata's own
capital statements (P36 with their date qualifiers, CC0, as `state-capitals.js` carries them — 117 capitals, 347
facts at each capital's first, middle and last year), counted per millennium: 2000–1001 BCE 3 facts (2 hold, 1 known fault), 1000–1 BCE 43 (33, 10), 1–1000 CE 135 (120, 15), 1001–2000 CE 166 (143, 23) — the second millennium BCE has three capitals in the source and the fourth and third none, said so, not padded; a millennium with fewer than 25 is said
so, not padded. Every one of the 49 failing facts was checked against the raw Cliopatria row of the year by point-in-polygon on the GeoJSON itself, and each is the source's: either no row of the polity is alive in that year (Baghdad under the Abbasids in 1075, Luoyang under the Han in 25, Ganghwa under Goryeo in 1270, Babylon under the Seleucids in 312–308 BCE, Alexandria on the Caucasus in 56 BCE) or the row's polygon leaves the capital outside (Tenochtitlan outside the Triple Alliance of 1429, Carthage outside Carthage's first row, Rome outside the Roman Kingdom's, Cairo outside the Fatimids' of 1171 and the Mamluks' of 1241, Cusco outside the Inca of 1440, Edirne and Didymoteicho outside the Ottomans' of 1361–1365, Beijing and Mukden outside the Qing's of 1625–1644, Kyiv outside Rus' of 1240 …); the list is `KNOWN_CAPITAL_FAULTS`, each with its card. One failing fact in the first full build — Chang'an under the Tang in 623, which the raw row DOES hold — was the leak the densification fixed, and now holds. The 2a point assertions and the cards' extent assertions stay (139 of 140 point assertions hold with the one known fault; 235 of the cards' 285 extent assertions hold with 50 listed — the 46 of 2a and four new ones checked the same way: Megara inside Cliopatria's Peloponnesian League where gr-561 leaves it out, Zhengzhou outside the Shang row of 1046 BCE (cnh-103), Philadelphia outside and Newtown inside the United States row of 1779 (us-071)). Suites: `test-atlas-review.js`
(new: the artefact views, the narrow rail, the era), `test-atlas-time.js` (+ the year query at the largest alive sets, the
colouring over every epoch, the contrast in every theme, the largest face on screen named, the captions and the card),
`test-atlas-stages.js` (injected frames), `test-atlas-perf.js` (+ Europe in 1500 and in 1900 with their history budgets, the
whole rail scrubbed with the year-change gate). The perf gate on the final head, alone on the four-core software-GL
runner: drag 25 % of v1's pooled p90, wheel 9 %, pinch 12 %; Europe at 3 km/px 133,391 land triangles and 96,933
segments with, in 1500, 28,683 history triangles and 1,078 border segments in 27 faces (budget 36,000 / 1,400) and, in 1900,
25,449 / 1,131 in 9 (32,000 / 1,500); the Mediterranean in 1 CE at 6 km/px 7,032 / 542 in 8 faces (8,800 / 700); a year
change 2.40 ms at p95 over the Mediterranean scrub (174 changes) and 2.40 ms over the whole rail, 10,000 BCE to today (426
changes; frames p90 16.7 ms); the JS heap 40 MB against v1's 242.

**The fills, after the screenshots.** The review's Mongol Empire of 1245 showed a thin darker line from the Volga to Lake
Baikal through the fill. It was a *fold*, not a crack: the worker projected a face azimuthally about its centroid, earcut
bridged the Baikal hole to the outer ring with a needle triangle 4,000 km long and a few kilometres thick, and the great-circle
edges that triangle has on the sphere bend more than its thickness — lifted, it folded over its neighbour and the fill was
drawn twice along the bridge (2a's longest-edge bisection split the two sides of a shared edge differently as well, and
folded the same way). Two changes in `triangulateFace`: the projection is **gnomonic** about each outer ring and its holes
(a great circle is a straight line, so earcut's planar triangles are the spherical ones and a face wider than a hemisphere
— none in the core or the file; a girdling ring would be — falls back to the equidistant projection), and every edge over
the level's chord is split into pieces that depend on the edge alone, so the two triangles on a shared edge agree point for
point. Under Node, the Mongol face at level 1 after the change: 17,784 triangles, none clockwise on the sphere, the sum of
signed areas equal to the sum of absolute areas (before: 935 clockwise, 110,000 km² folded). `test-atlas-review.js` section
1b holds it as pixels: at two views without the coast stroke (the Mongol Empire about the Ob, the Russian Empire over Europe
in 1900, both faces with lake holes; the rivers, lakes and labels off so only fills remain), no run of two or more pixels
beyond the fill's tone towards a polity's full colour (a fold) and no run of land pixels with the fill's tone on both sides (a
crack); it fails on the committed 2a worker (1,506 pixels in runs) and passes on this one (4 lone pixels, the data's own
sub-pixel spikes at ring vertices, let through).

**Screenshots reviewed** (headless Chromium at 1280 × 800, the final worker; rivers, lakes, places and the present-day borders
on, relief off): the two 2a artefact views (Tuscany and Latium at the cap in 1 CE, Sicily and Calabria at 0.6 km/px in 250
BCE — the chord and the fan gone, the coast stroke at the coast); Europe in 1500 and in 1900 at 7 km/px; China in 300 BCE
(the Warring States) and 1100; the Americas in 1500 at the globe; India in 100 CE; Italy in 1460 at 2.4 km/px (the
city-states, Savoy, Milan, Venice, Florence, the Papal States, Naples); North America in 800 (no state: the caption); the
Mongol Empire of 1245 over Europe and about the Ob (the fold found and fixed above); the Mediterranean in 500 in the folio,
synth and gazette themes; the phone at 390 × 844. Looked for: fills over the sea, doubled borders, stripes, folds, label
collisions, clipped controls. Found and fixed: the Mongol fold; the Kingdom of Kongo's name past the limb (the label path now
clamps to the disc); the phone rail (Task 0b). Left as is: not every alive face is named at a zoom (the labels are ranked by
on-screen area and yield to the physical names and cities; the Ottoman Empire over Europe in 1500 at 7 km/px is unlabelled
while the Golden Horde and the Papal States are) — a ranking question for the owner, not a fault.

**The default for the owner to confirm.** A polity and its own member both in the spec: the overlap is a *nested* face — drawn
as the member's, the overlord named on the card and present by its border (its face is the rest of its land) — when the
overlap holds ≥ 80 % of the smaller claimant and the larger is ≥ 2× it; any other overlap above the sliver threshold stays
*contested* (hatched, both named). The 2b file has 20 nested faces: `rome` within `etruscans`, `papal_states` within `byzantium`, `chernigov`, `polotsk` and `vladimir_suzdal` within `rus`, `malacca` within `majapahit`, `byzantium` within `ottoman` and within `genoa`, `genoa` within `france`, `ccp` within `ussr` and within `roc` — eleven pairs over 20 faces; the Rus' principalities and the Communist base areas are the cases the rule was meant for, Byzantium inside Genoa (the Genoese colonies round the Black Sea at Byzantium's end) and the Etruscans round early Rome are the ones the owner may want to look at.

**What contradicts the design.** (1) §2.3 planned a planarity budget of 200 coarse-level crossings; at full scale the same
residue class measures 1,120 and the ceiling is restated above it (the finest level stays exact). (2) §2.4's year query
stays on the main thread (measured under the 5 ms rule at the largest alive sets). (3) The file:// twin is a slice, not the
file. (4) The 2a pilot drew the Avars as a state; the audit keeps them a people, so 2b drops them until 2c. (5) The design's
"every arc and face traces to a source" holds; the independent facts are from one named source now (Wikidata), with the 2a
textbook list kept beside it. (6) §2.3 planned the year's faces triangulated "for the current year first, then the rest at
idle" and the borders as one list per level; at full scale the renderer draws, meshes and tables only the faces on screen,
and the borders ride each face's mesh (§2.4 "As built in Phase 2b") — a Mediterranean view no longer pays for the Han.

**CI.** Run 38057576073 on `dff85a4` (the final code; the commit after it changes this document only): the fast job green
(check-history 3 min 32 s within its 600 s budget); the Playwright job with every Atlas suite green — `test-atlas-time` 81 ok,
`-review` 32, `-stages` 21, `-labels` 128, `-card` 25, `-phone` 138, `-render`, `-search`, `-a11y`, `-relief`, `-places`,
`-credits`, `-fallbacks`, `-session` — and only the five suites red on main for reasons of their own (`test-draw-cards`,
`-tour`, `-personal-atlas`, `-war-cards`, `-review-decks`); the frame gate red on its first attempt by Phase 1d's drag rule
alone (4 frames over 100 ms of 1,177 across three repeats, worst 116.7 ms, where the rule allows two — every 2b line green,
the year change 1.5 ms at p95 and 1.2 ms over the whole rail) and green on the one re-run the rules allow, as it was on run
38056150477 (`8cb34ac`, the same renderer) — three frame-gate readings on this renderer, two green, the red one the
two-core runner's drag frames and not a 2b line; locally the drag's worst frame reads 67–100 ms across four runs today.

### Phase 3a — as built (2026-10-11): the places registry, the additive migration and the author tooling

**Scope.** Sub-phase 3a only: a registry cards point at by id, the migration of what already exists onto it, and the tooling —
no reader-visible surface (3b: the Personal Atlas derived by id, the place card, the Full Atlas search, the glossary button).
v1 stays live and reads `locator`, `war` and `map` as before. Preceded by Task 0, three carry-overs from the 2b review.

**Task 0.** 0a — *the label engine's cause, found by the worker's own drop reasons* (`labelDebug` / `labelWhy`): the period
capitals scored 0, before every polity (whose best score is `KW.country` = 1), so Constantinople's marker and name took the
grid cells at the Ottoman Empire's one trial position (the middle of its label path) and the empire's name dropped as "polity
collides" — Europe in 1500 at 7 and 12 km/px; the same for Karakorum and the Mongol Empire at the globe in 1245, and on a 390 px
phone at 1500 at 12 km/px, where at the globe every name was also "wider than its path" (the 1.8× rule against a short path).
France and Songhai drew because no capital sat on their paths. Fixed in `atlas-worker.js`: a capital scores after the polities
of on-screen area rank 0–1 and before the smaller ones (`CAPITAL_AFTER_RANK`); every capital's MARKER rectangle is reserved
before any label is placed, so a name placed first is laid round the square and the marker is never lost (a capital whose name
then finds no free side keeps its marker alone — the fill and the tap still say what it is); a polity name slides along its path
(0, ±12, ±24, ±36 % of its length) and nudges its straight fallback up and down before giving up; the large ranks may be 3× their
path. Measured after: Europe 1500 at 7 km/px names the Ottoman Empire, the Golden Horde, France, England and the Papal States
(before: the Golden Horde, France, the Papal States); at 12 km/px seven polities (two); the globe in 1245 the Mongol Empire, the
Song and the Delhi Sultanate (none); the phone at 12 km/px four (one), at the globe two (none). The cost: a capital's NAME now
yields to the empire's where the two want the same cells. `test-atlas-labels.js` section 9 holds the three views (142 ok).
0b — the frame gate's worst-frame rule is at most 0.5 % of a gesture's frames over 100 ms and none over 200 ms (`WORST_SHARE`),
for the drag and the pinch's during-gesture frames, replacing "at most two frames" (which on the two-core runner read 4 of
1,177 — 0.34 % — and failed a renderer that was not slower); nothing else loosened. Run on this head (software GL, the fetch
running beside it): drag 1 frame of 1,268 over 100 ms (0.08 %), worst 133 ms; pinch 0 of 414; every other line green.
0c — the rail's ticks on narrow screens: 2b bucketed the view's change years into 200 buckets of under 2 px, and the ticks canvas
read back column by column showed runs of 9 CSS px of unbroken ink at 390 px and 28 at 360. A bucket is now at least 4 px and
ticks closer than 3 px merge (taller the more years they stand for); the entities in view still decide which years tick and [ ]
still step through every change year. Measured: 43 ticks for 474 change years over 224 px at 390 px, no run wider than one tick;
`railTicks()` reports the counts and `test-atlas-review.js` section 2 reads the canvas back at 360, 390 and 430 px (38 ok).

**The registry (Task 1).** One table read by `.claude/places-registry.js` from three generated files: the v0 gazetteer (5,766
rows), `atlas/data/places.js` — NEW, the places the cards need that the gazetteer does not carry, 713 rows, 55,920 bytes
(0.056 MB decimal), one row per Wikidata item, id `pl:q<number>`, the gazetteer's shape plus a `sub` column (battle, cave,
building) — and `history.bin`'s entity table (152 polities with their card links from 2b). *A file of its own, not rows in the
gazetteer*: the gazetteer stands at 592,123 bytes of its 600,000 budget, and the cards needed 713 places more; the two are one
registry to the Node side now and to the worker in 3b. Kinds in the new file: site 406 (battle 107 of them as `sub`), region
93, town 89, city 67, mountain 18, island 12, river 6, range 6, lake 5, island-group 3, cape 3, strait 2, gulf 2, sea 1 —
`mountain` and `cape` are additions to §2.6's table (a mountain is a point the cards mark; §2.6 had no kind for it), for the
owner to confirm. Every row is Wikidata-checked and nothing typed: the coordinate is the item's (P625), the kind is what its
classes (P31, followed through subclass-of to the taxonomy's tops in `TOPS`) give, the name is its English Wikipedia title
(CC0 sitelink) with the card's spelling as an alias. The card links travel both ways: a polity's `cards` (the entity table)
put `pol:<key>` on each of those cards, and `migrate-places.js --check` fails if either side lags. A card's `places` is a
HEAVY field (data-extra/, `CARD_EXTRA_FIELDS` + card-io's list) — §2.8 planned it light; nothing on the eager path reads it in
3a and 3b derives the Personal Atlas in the worker, which fetches the heavy halves it needs; whether it moves light when the
Personal Atlas needs it at boot is 3b's measurement. The field is a plain sorted list of ids (the brief's shape), not §2.8's
`{ id, role, years }` objects: a war's victor and loser are both on the card without a side, and the years default to the date
line — the role column is 3b's to add if the derivation needs it (a decision for the owner, below).

**The migration (Task 2).** `node .claude/migrate-places.js` — additive (every card's `locator`, `war` and `map` byte-identical
to the base commit's, `test-places.js` against `FOLIO_PLACES_BASE=a077fa4`: 0 of 6,827 differ, data.js unchanged), idempotent
(two consecutive runs: every written file byte-identical, sha256), offline from a committed cache (`places-wikidata.json`,
1.27 MB: 1,173 titles, 543 exact-label lookups, 304 searches around a coordinate pruned to the names the cards use, 4,293
classes), `--fetch` being the only networked mode. How a toponym resolves, in order and never by a guess: the gazetteer by name
within the radius (25 km for a point or a battle, 300 for a region, a range, a river, a sea); Wikidata by the article whose title
is the toponym, accepted only when the item's coordinate agrees; by exact English label or alias; by a search around the
coordinate (capped at 50 km — a 300 km circle over central Europe answered 504); two candidates within the radius are AMBIGUOUS
and listed, a candidate with no taxonomy kind (a mint, a diocese, a museum) does not count. **Numbers:** 1,325 distinct
toponyms over 1,920 locators — 950 resolved (182 to the gazetteer; 722 to places.js rows: 579 by title, 138 by label, 5 by the
search), 66 ambiguous (mostly a present-day city against the polis or site of the same name at the same spot — Thebes, Corinth,
Syracuse, Olympia — a rule the owner can set), 309 unresolved (141 with no item of that name within the radius — "Forum
Romanum", "Athenian Agora", "Tell el-Muqayyar"; 74 whose article names an item with no coordinate — "Mycenaean civilisation",
"Clovis culture", "Qin dynasty": not places; 29 whose item lies beyond the radius; 26 where the service could not answer the
search; 19 disambiguation pages; 16 with classes the taxonomy does not map — a museum, a gate, a massacre, an aerial bombing;
5 states or peoples). Map keys: 793 cards resolve (every `world` key but the three-polygon Cyprus pair; the US and Chinese
admin-1 keys), 15 keys do not — Russia's republics and krais under the gazetteer's short names (Buryatia, Chuvashia, Udmurtia,
Altai Krai…) and four honest ambiguities (Moscow the city and the oblast, Saint Petersburg and Leningrad Oblast, Washington
and the District, Shanxi/Shaanxi's two codes). War sides: 49 cards resolve through `polity-spec.json`'s links, the countries
and the polities by name; 24 sides do not — 18 authored extents of sides no entity draws (Sparta, Messenia, Samnium, "Athens
and its empire"…) and six names (British Raj, Chinese warlords, Union of South Africa, Yugoslavia, Ethiopia (Italy)); the 12
spec slugs the history file defers (the peoples, the coastline series) are listed. Thirteen locators resolve only through
their `within` city (Grave Circle A → Mycenae; the Forum → Rome), said so. Three locators carry a coordinate pair in `label`
(gr-056, wh-115, rm-011: a data fault, ignored and listed). The 31 glossary places resolve (25) or are listed, for 3b's button;
nothing is written to a term (Q-P3 c), nothing to a book (Q-P2 c). **The result on the cards:** 2,400 of 6,827 carry
`places` (2,782 had an old field; 382 of those get nothing — the unresolved above), by collection in
`docs/atlas-places-report.md` (GENERATED; never edit): `gw` 468/468, `geo` 130/133, `gru` 139/162, `gc` 56/58, `wh` 417/505,
`rm` 388/487, `gr` 306/388, `cnh` 259/310, `eg` 93/103, `ru` 64/83, `ww2` 60/62; 177 cards carry a polity by link.

**The tooling (Task 3).** `add-places.js <cardId> <id…>` adds and removes (a leading `-`) with validation — an id the registry
lacks is refused with the nearest names, a derived id cannot be removed; `--find` looks a name up and shows every candidate
(Olympia twice) without choosing; `atlas-build/add-place.js --qid --kind --reason` adds a registry row by its item, refusing
an item with no coordinate, a kind its classes contradict, a state or a people, or an item the registry already carries;
`build-places.js` is the only writer of `places.js` (and regenerates `credits.js` only when the file changed); `check-places.js`
gates it; `check-cards.js` rule 9 fails an id that resolves to nothing; `card-authoring.md` has the field. `import-batch.js` and
`add-card.js` do not yet accept `places` (§2.8's plan): a new card gets its places from the migration, run after the batch.

**Tests and CI (Task 4).** `test-places.js` (48 ok, Node only): the registry, the resolver on fixtures (the homonym, the
ambiguity, the title, the label, the disambiguation page, the unmapped class, the state, idempotence), the additive proof, the
tooling's refusals and an add-then-remove round trip byte-identical. The fast CI job gains `check-places.js`,
`migrate-places.js --check` and `test-places.js`; the browser job runs the labels and review suites as before. Not re-run
here: the other browser suites (CI's second opinion).

**Changelog.** No line and no bump: 0a and 0c change `#map2`, which is unlinked until Phase 5, and the registry is invisible.

**Decisions for the owner.** (1) The 66 ambiguous toponyms — a rule ("a history card's locator takes the polis or the site over
the present-day city at the same spot") would resolve most of them in one line of the resolver, but it is a choice, so it is
listed, not made. (2) `mountain` and `cape` as kinds. (3) The second file against the 0.6 MB budget. (4) `places` heavy and as
plain ids (roles and years for 3b). (5) The 15 map keys: whether the Russian admin-1 rows should carry the subjects' long names
as aliases (a gazetteer rebuild) or the layer's keys be matched by code. (6) The 309 unresolved toponyms: the report's table is
the work list; descriptive names ("seven hills of Rome", "Athenian Agora") want either a `within` city only or a hand-added
item. (7) The 24 war sides with no entity: 2c's peoples and the leagues.

### Phase 3b — as built (2026-10-11): the study layer on the v2 globe — the Personal Atlas, the Full Atlas, collection switches, stacks (removed 2026-10-14), the cards on a place card

**Scope.** The study integration on `#map2` (still unlinked; v1 at `#map` untouched): the registry rules the owner set on 2026-10-11, the light card-to-places index, the Personal Atlas, the Full Atlas with a switch per collection, stacks, and the place card's list of cards. Preceded by Task 0 (a red CI gate and two regressions). Not done: the 15 Russian admin-1 map keys and the 309 unresolved toponyms (the later human-read pass — nothing was guessed to shrink them), the glossary button, search of the registry across years, the default view centred on the reader's places, the "New discovery" chip (all but the first two: done in Phase 3c, below).

**Task 0.** *0a — `SEEN_CAP` 6,000 → 9,000.* The glossary (6,058 terms) had outgrown the cap, so `test-discovery.js` failed in CI's fast job — which gates every browser suite and the frame gate — from before 3a (reproduced on `07f3da5`). The test now demands each register's shipped universe × 1.2 (7,270 for the glossary, 1,453 for the places); `docs/reference.md` says why. Blob measured with the real slugs and a 13-digit timestamp: ~30.9 bytes a glossary entry, ~27.9 a place; a reader who has seen every term and place carries **187 KB (`glossSeen`) + 34 KB (`placesSeen`) = 221 KB**; the raise itself costs a completionist 58 terms = 1.8 KB; the 9,000 backstop would be ≤ 529 KB if both registers ever filled it (353 KB at the old cap). CLAUDE.md's golden rule asks a changelog line and a version bump for a user-requested change that reaches readers; a progress-code change ships to the live site (v1 reads these registers), so there is one line on 2026-10-11 and v1.996 — honestly invisible to anyone below 6,000 terms. *0b — `test-atlas-a11y.js`: the list legitimately changes; the engine is stable.* After Enter opens the first label's card the view is unchanged (same lon, lat, zoom) but the card is a chrome rectangle on a desktop (`[408,11,788,637]`, the zoom controls move left with it), and the label engine keeps every name out of chrome: the hidden list went from 69 labels to 31, and the 35 names (by unique id) that left it all lay within 12 px of a chrome rectangle (34 wholly inside one — Reg:1159104297 spans x 394–425 across the card's edge, Italy starts at 438), while the list is identical at +0.2 s, +1.7 s and after a further layout. The 2b head passed because its second-ranked name happened to lie left of the column (inferred, not re-measured). The test now re-reads the list after the card opens and asserts the cause (view unmoved; the lost names lay at the chrome; no placed name more than 12 px inside it; stable under a second layout) — 34 ok. *0c — phone labels.* On a 390 px phone an area label could hang a quarter past the frame (`MAX_CLIP`): the Mali Empire's box began at x 0, Kanem-Bornu's at −4 and the Mamluk Sultanate ran 254–366 in a 358 px frame; and the Ottoman Empire of 1500 at 24 km/px was dropped as "wider than its path (97 px against 42, rank 4)". A polity's name is now slid back inside the frame by at most a third of its width or not placed (`intoFrame`; the quarter stays for seas, rivers and regions — a decision below), may break at a space onto two lines (`splitName`, `stacked`: "Ottoman / Empire"), and tries five sideways and seven vertical offsets before giving up. `test-atlas-labels.js` section 9 holds it at six phone views (every polity inside the frame, one glyph per character, ink painted, the Ottoman Empire named on two lines at the globe view, the Mali Empire named whole): 180 ok. Consequence: the phone's Aegean view of that suite is centred 0.7° south, because the study panel is chrome across the top 120 px and the Aegean Sea's own name sat under it.

**The registry rules (Task 1).** `migrate-places.js`, `places-registry.js`, `build-places.js`. *One place per physical site.* Candidates for one toponym are ambiguous only when two lie more than 25 km apart or they are of different **kind families**; otherwise they are one site and merge (the nearest to the card's own coordinate is the place — a tie within a kilometre goes to the item whose title is the toponym, then the gazetteer's row, then the lowest Wikidata number — the others' names becoming aliases). A family is what the owner's own example needs: a capital, a city, a town, an ancient city or archaeological site and a polis are one (the settlement); a battle, a cave, a building, an island, a mountain, a cape, a river, a region each stay their own, so an island and an ancient city of one name (Thera, Salamis, Ithaca, Seriphos) remain ambiguous. Three class rules keep Wikidata's noise out of "different kinds": a candidate whose every class is a mint, a diocese, a titular see, a conservation area, a museum or a station is not a place; a settlement-scale administrative unit or a port (a freguesia, a commune, a district, a seat, a port — by its class label) is the town it is named for (and the row is a town); a natural feature named directly by a class (island, island group, range, mountain, cape) decides before anything reached by subclass-of, and a polis is read last — Santorini is an island that is also a "tourist destination", which 3a had read as a site (17 rows changed kind; the report lists them). *Across toponyms*: a period name (an ancient city or polis) this migration owns lying within 2 km of a modern city — or within 1 km of another period name of the same city — is folded into it; the gazetteer is never edited (its aliases are the `alias` overlay in `places.js`: "Epidamnos", "Epidamnus", "Dyrrachium" find Durrës), and period names 2–25 km from a modern settlement (Knossos–Heraklion 4.3, Chang'an–Xi'an 4.7, Tomis–Constanța 4.0 …) stay two places and are listed for the owner, who can fold any with `merges` in `places-spec.json`. `mountain` and `cape` are registry kinds (they were already rows in 3a: 18 and 3; now 21 and 4). **Before → after:** `places.js` rows 713 → 741 (59,441 bytes); ambiguous toponyms 66 → **15** (all different kinds or beyond 25 km: Akrotiri, Caudine Forks, Thera, Salamis, Qi, Macedonia, Plymouth, Black River, Versailles, Waterloo, Ithaca, Seriphos, Waitangi, Heart's Content, Jiangning); unresolved **309 → 309** (unchanged, by decision); toponyms resolved 950 → 1,001 (55 that were ambiguous or unresolved, **none of them through a mountain or cape — 0 newly resolved by the kinds**, which 3a already carried: the unresolved "Mount Pelion", "Cape Artemisium" fail by name, not by kind); cards carrying `places` 2,400 → **2,476** (of 6,827); 43 items folded into 38 places (40 by toponym, 3 by site) and 15 period names across toponyms (Byzantium into Constantinople, Epidamnos into Durrës, Massalia into Marseille, Vesontio into Besançon, Nineveh into Mosul, Tenochtitlan…). Additive and idempotent: three consecutive runs from the 3a files wrote 15 byte-identical files (sha256, the report included — it is derived from what the spec persists, not from the run), `test-places.js` against the base commit: every `locator`, `war` and `map` byte-identical, `data.js` unchanged (66 ok, 18 of them new). The Wikidata cache was not refetched. `docs/atlas-places-report.md` is regenerated with the new sections.

**The light index (Task 2).** `atlas/data/card-places.js` (`window.ATLAS_CARD_PLACES`, header `/* sources: [] */` — it carries no third-party data): `ids` (1,422 registry ids: 1,270 places and 152 polities) and `cards` (2,476 card ids → indices into `ids`; 2,623 links). **61,791 bytes** (the stop rule was 200 KB; nothing to propose). Generated by `.claude/atlas-build/build-card-places.js`, a pure function of the cards' heavy `places` (the `digest` is a hash of the content): `migrate-places.js` and `add-places.js` run it after they write `places`; `check-places.js` fails when it lags the cards, an id does not resolve, an entry is malformed or the file passes 200 KB; the build itself throws over the budget. No `.bin.js` twin (it is a plain script like `places.js`). The credits page counts it (652 files read).

**The Personal Atlas (Task 3).** `atlas/study.js` is the pure arithmetic (also `require`d by the Node tests). **"Studied" is v1's definition, unchanged:** a card with a record in `S.cards` (Q-P1 a: `atlasRegisterAll` asks the same keys; `studyHost.studiedCards` in `app.js` is `Object.keys(S.cards).filter(CARD_BY_ID)`, a text guard in `test-study.js` holds the two together) — opening a card writes no record and does not count, a community-deck card names no place. The Personal Atlas is computed at mount from those ids and the index; nothing is stored and the progress blob is untouched (`PROGRESS_FIELDS` unchanged; the view and the collections switched off are two per-viewer keys in localStorage inside try/catch). Studied places are drawn — a mark of a place's own shape, a ringed disc with its count for a stack, a name in the accent colour for a country, sea, island or polity the ordinary pass already draws (lifted past the density rules, `hl`) — and **everything else is muted** (alpha 0.4) when there is something to show. The panel (`.atlas2-study`, a chrome rectangle) has Map / Personal / Full radios, the count line "N places [and P polities] from M cards", the honest note "K of your cards have no place on the map yet", and the empty states: no cards ("You haven't studied any cards yet…" — the Full Atlas one tap away), cards with no place ("None of your N studied cards has a place on the map yet", singular for one), every collection of theirs switched off. **A difference from v1, and why:** v1 draws a studied card's locator at its own coordinate even where the toponym never resolved; v2 draws only what the registry resolved, so the 306 cards with an old field and no place show nothing on the Personal Atlas and are counted in the note instead of being guessed at. Defaults: a reader with studied cards opens on Personal, one with none on the plain Map; a stored choice wins.

**The Full Atlas, the switches, the stacks (Task 4).** Full flags every place any card is about (1,270 places and 152 polities) with the reader's apart. A row of switches by collection (only collections that have places — every one in the Full view, the reader's own in the Personal), all on by default, remembered in localStorage; a switched-off collection removes the places only its cards bring (and the studied flag only through a studied card of a collection still on), in both views. **[Superseded on 2026-10-14: stacks removed, see "Stacks removed" below — there is no clustering and no count badge any more; the rest of this paragraph is how it was.]** Stacks: the places within 30 px (34 on a phone) of one another are one mark with a count, merged until no two marks' centres lie within that radius (`AtlasStudy.cluster` — the property the marks rely on: a mark is dropped only for a control or the frame's edge, never for another mark); a tap zooms to the members (`kmpp / 2.4` at least) until they part, and where they share a point or the zoom is at its floor the stack becomes the existing "N places here" chip; the keyboard list carries each stack. Marks (diamond, triangle for a mountain or a cape, disc with count) are distinct from every label, the city dots and the capital squares; the study pass runs before the ordinary labels with the chrome already taken, so nothing draws under a control, and a present-day capital's dot yields to the reader's own mark.

**The place card (Task 5).** "From your cards" (Personal) or "Cards about this place" (Full): the question's answer as the title, the collection chip, the reader's cards first and marked "studied"; each row is a link to `#card/<id>`, the app's own read-only card page (it writes no record), and Back returns to the Atlas with the place open again — which needed a router case in `app.js` (a followed `#map2/<lon>/<lat>/<zoom>/<place>` address had no route in-session; `route("map2", { hash })` keeps it). The list is capped at 8 with "and N more", a button that shows twenty more; Personal counts the cards the reader has not studied without naming them. A polity lists its linked cards the same way (the 2b entity links, through the index).

**Tests and CI (Task 6).** `test-study.js` (Node only, 48 ok): the index is byte-for-byte what the cards build, under budget, deterministic and throws over budget; "studied" is one definition (text guards on `app.js`); a seeded reader's places are exactly the union of their cards' places, the cards with none are counted; flags, collections, sentences, the list and the stacks (a 400-point property test at three radii). `test-places.js` gains 18 checks for the registry rules (merge, 25 km, kinds, mints, island-and-polis, freguesia, mountain and cape, idempotence, the period-name fold, the alias overlay read back, no two places of one site remain). `test-atlas-study.js` (browser, 54 ok): the switch for a reader with nothing; a seeded reader's count line and note equal the Node computation, every place drawn is theirs, everything else muted; Full adds the rest; a collection switch against the Node flags, remembered across a reload, restored; Rome at 6 km/px is one stack of 82 that parts in three taps; a place card lists 8 of 21 with "and 13 more", opens `#card/…`, Back restores it; the Personal list; a polity's list; the empty states; the phone (inside the frame, clear of every control, 44 px targets, no name under it, a touch tap on a mark opens its card); no console errors. It runs in CI's browser job by name (the loop picks up every suite that says "playwright"); `test-study.js` is a step of the fast job. Local runs on this head (software GL): `test-atlas-a11y` 34 ok, `-labels` 180, `-review` 38, `-phone` 138, `-study` 54, `test-places` 66, `test-study` 48. **The frame gate** (local, software GL, three repeats): the study layer's first cut put a 145–200 ms task (`refresh`: the host asked for the name and collection of all 2,476 indexed cards at once) on the first frames of the pinch — the pinch's frames over 100 ms read 0.72 %, 0.96 % and 0.97 % in three local runs where the 3a head read 0.24 % (and CI had passed it). The cards are now asked in slices of 8 ms (the panel reads "Reading your cards…" meanwhile; `stats.study` carries each step's ms: register 14, parse 4, rows 3, refresh 28, the warm-up ~600 ms wall in 8 ms tasks). Final head: drag 2 of 1,212 over 100 ms (0.17 %, worst 116.7 ms), **pinch 2 of 428 (0.47 %, worst 133.3 ms)** — under the 0.5 % rule by one frame, which is this renderer's noise, not a margin — wheel and pinch p90 9 % and 13 % of v1's, first frame after release 150 ms, year change 3.6 ms at p95, JS heap 40 MB against v1's 202.

**Changelog.** One line and v1.996, for Task 0a only (the `SEEN_CAP` raise ships in `app.js` to the live site). Nothing else in 3b changes what a reader of the live site can see: `#map2` is unlinked until Phase 5, and the router case is for its own address.

**Decisions for the owner.** (1) *Kind families:* an island and the polis of the same name (Thera, Salamis, Ithaca, Seriphos) and a palace or a battlefield and the town beside it (Versailles, Waterloo) stay ambiguous under "different kinds"; folding island-and-polis would resolve four more in one line. (2) *Cross-toponym fold radius:* 2 km, from a modern city only; the 38 period settlements 2–25 km away are listed (Chang'an–Xi'an 4.7 km and Tomis–Constanța 4.0 km would merge at 5 km; Knossos–Heraklion 4.3 km must not) — a list for you to fold with `merges`. (3) *Area labels may still hang a quarter past the frame's edge* (seas, rivers, regions); only polity names were tightened. (4) *Hills as mountains:* Wikidata's hills (the Palatine, the Temple Mount, Qubbet el-Hawa) are `mountain` and draw as a triangle. (5) *Personal count* is places and polities together beside "from M cards"; say if polities should not be counted. (6) *The unresolved 309 / the 15 admin-1 keys* remain the later pass's. (7) *The panel* takes the top-left of the frame (120 px of a 700 px phone): a collapsible form is a design choice.

### Phase 3c — as built (2026-10-11): the study integration finished — collapsible panel, area labels in the frame, island-and-polis and Wikidata-linked folds, hills, the glossary pin, search across years, the default view, "New discovery"

**Scope.** The rest of Phase 3 on `#map2` (still unlinked; v1 untouched except where said): the owner's seven decisions of 2026-10-11, the glossary's "show on the Atlas", the search of the whole registry across years, the default view framed on the reader's places and the "New discovery" chip. Not done: the 309 unresolved toponyms and the 15 Russian admin-1 map keys (decision 6: a later human-read pass; nothing guessed).

**Task 0a — the fallbacks regression, cause and fix.** `3365d16` (the study layer's name lookup in 8 ms slices) moved the study layer's last slice from before the label layer's first paint to *after* it, so in the Canvas 2D no-WebGL path it landed during the frame gate's drag (23 ms after the press: `study data-ready=1`, then a full 2D frame). The cause is older than the slicing: every layout result and every study change called `invalidate()`, a full redraw of the globe — seconds on a software Canvas 2D renderer — though only the *names* had changed (they have a canvas of their own). Fix: `invalidateLabels()` repaints the names alone in the still view (`needsGlobe`), and the three bare `needs = true` sites that do move the globe (resize, coast, fly) ask for it explicitly; `applyLayout` and `applyStudy` use the names-only call. Evidence (`test-atlas-fallbacks.js`, Canvas 2D, software GL): before, the drag check read **5 → 6 → 7** (fail; 7 → 7 → 8 when it happened to pass: 2 of 3 runs failed) and a boot cost 5–7 full frames; after, **3 → 3 → 4** in three of three runs (no full frame during the drag, one after the release), a boot costs 3. A deterministic case holds it (a study change while the button is down: unfixed 7 → 8 → 9, fixed 8 → 8 → 9). The frame-gate improvement of `3365d16` (the 8 ms slices) is untouched. The other check ("no main-thread task after the mount ran past 150 ms", the file:// shim) is timing-noisy: it failed in about half of my runs (worst task 150–594 ms on this machine, with the base failing it too) and is not chased.

**Task 0b — the collapsible panel.** A chevron in the switch row (`.atlas2-study-toggle`, `aria-expanded`, `aria-controls`, 44 px on a phone) folds the note and the collection chips (`.atlas2-study-details`); the switch and the count line stay, and the empty-state sentence counts as the count line. Phone default: collapsed (85 px high at 390×844 against 141 open); desktop default: open; a stored choice (`folio.atlas2.studyOpen`, per viewer, localStorage) wins. The count line wraps at spaces (no ellipsis, no clip; checked word by word against the line boxes). Found by putting the panel into the phone suite's overlap check: it lay under the legend, About and card sheets on 360×640 and 844×390 — it now steps aside while a sheet is open (and for a card on a phone on its side), and on a phone it is capped to the height above the year rail (scrolls inside itself). Every viewport keeps ≥ 6 px from every other control (measured 11–12 px from the search box, 19–26 px from the Legend pill).

**Task 0c — area labels in the frame.** The quarter a sea, river or region could hang over the edge (`MAX_CLIP`) is gone: every area and path name — countries too — is slid back by at most a third of its width or not placed, as a polity's has been since 3b; a river stretch tries its other offsets. Measured over nine views each: the old worker puts a name past the edge in 11 of the suite's checks (English Channel, Böhmerwald, Norwegian Sea, Iran, Laccadive Sea …); the new puts none, at a cost of two names in ~320 on the desktop and two in ~120 on the phone.

**Task 1 — the registry.** (by the registry agent, verified here) *Island and polis fold*: Thera (into Santorini), Salamis, Ithaca, Seriphos — 4 folds; the island row survives and the polis name becomes an alias (Vathy, a modern town carrying "Ithaca" as an alias, is set aside and listed). Versailles and Waterloo stay ambiguous. *Period settlements fold only on Wikidata's own link* (P1366 replaced by / P1365 replaces / P460 said to be the same as / the same enwiki title; the radius stays 2 km, the cache gained `cache.links` for 69 items, fetched through `Special:EntityData` because the SPARQL service answered 429): **2 folded** (Tomis into Constanța, 4.0 km, P460 both ways; Magnesia ad Sipylum into Manisa, 2.2 km, P1366), **36 left unfolded, "no Wikidata link found"**, each pair printed with its distance in the run and in the report (Knossos–Heraklion 4.3 km among them; Chang'an–Xi'an is not a card toponym). *The `hill` kind* (Wikidata hill, Q54050, read after mountain): 9 rows reclassified from mountain (Areopagus, Aventine, Capitoline, Palatine, Pincian, Vatican Hill, Munichia, Temple Mount, Mesa Verde); Qubbet el-Hawa stays a mountain (its classes in the cache give Q8502), Isandlwana stays (Wikidata gives both). On the front end a hill is a triangle two-thirds the size of a mountain's (`r` 4 against 6), searchable and keyed, and the place sheet says "Hill". **Before → after:** ambiguous toponyms 15 → **11**; unresolved 309 → **309**; resolved 1,001 → 1,005; `places.js` rows 741 → **742** (three island rows added, two folded rows dropped); cards carrying `places` 2,476 → **2,483**; `card-places.js` 61,791 → 61,954 bytes; mountains 21 → 12. Additive and idempotent: every `locator`, `war` and `map` byte-identical to `19239a5` (0 of 6,827 differ), a re-run leaves the tree clean, `check-places.js` (25 ok) and `migrate-places.js --check` pass, `test-places.js` 95 ok.

**Task 2 — the glossary pin.** v1's popup already had the pin (`glossPlace`: 31 points + 181 countries → the old globe). **Found and fixed on the way (live, in v1): the pin never worked with a real mouse** — `makeGlossDraggable` captured the pointer on any press in the title bar except the close button, which retargets the `click` to the bar (reproduced on the base commit; only a programmatic `.click()` worked). It now skips every `button`: changelog line, **v1.997**. For `#map2`: `atlas/data/glossary-places.js` (5.4 KB, `build-glossary-places.js`, run by the migration, gated by `check-places.js`) maps term → registry id: **206 terms get a place — 25 of the 31 point terms and all 181 country terms** (a country by the one gazetteer row of the map's name); **6 cannot**: Alaska, Great Britain, Lake Turkana, Sahara, Siberia (the Wikidata item of the name lies 33–111 km from the glossary's hand-given point, beyond the 25 km agreement the resolver demands of a point) and Lomekwi 3 (no item of that name) — left out, not guessed, and they keep the old globe. **Not on the live site's path:** the popup sends a reader to `#map2` only behind `localStorage["folio.atlas2.preview"] = "1"` (off), so the pin keeps opening the old globe and the only reader-visible change is the mouse fix. What touched `app.js` (17 lines): `atlas2gloss` bundle, `atlas2Preview` / `glossPlaceId`, the pin's click, `route("map2", { place })` read after the mount, the drag fix, the two `studyHost` functions of Task 4. Atlas side: `showPlace(id)` (waits for the registry row like a deep link's place does, but flies). Terms do not contribute to the Personal Atlas (Q-P3 c; tested: the progress and the Personal flags are untouched after the pin).

**Task 3 — search across years.** The Find-a-place box searches the gazetteer and `places.js` rows, **the 152 polities of every age and their period capitals** (`atlas/data/polity-index.js`, 20 KB, `build-polity-index.js`, a pure function of `history.bin`'s header — fetched at the first keystroke so the 4.7 MB history file is not; tested), by name, alias and **kind** ("hills", "rivers", "battles" add the places of that kind after the name matches, the ones the reader's cards are about first). A polity or period capital that is not on the map in the rail's year says so under the box ("Rome is not on the map in 2026 CE. It is mapped 480 BCE – 475 CE.") with a button to the nearest year of its own steps — the end of the range before or the start of the range after, the later on a tie (`AtlasStudy.yearsNote`, joined ranges: a gap in the steps is a gap); the button sets the year and opens the polity once the borders load. Present-day places and sites have no years on record and are never said to be absent. Tested in Node against every polity (21,564 offers, none invented) and in the browser (Rome from 2026 → 475 CE; Abbasid in a gap, 1000 → 969, not 1202). Existing search tests green.

**Task 4 — default view and discovery.** With studied places, a Personal Atlas that opens with no deep link, no stored Map/Full choice and no touch yet frames them: centre of their unit-vector mean, scale holding nine in ten of them, clamped to 3–24 km/px and never wider than the whole earth; places spread right round the globe, or none, keep today's default (`AtlasStudy.framing`; the Greek reader opens at 3.0 km/px at 25.1°, 36.7°, as Node computes). The **"New discovery!"** chip (the site's `.disc-chip`) sits on a place card the first time the reader opens a place they *studied*; the register is the existing `placesSeen` (read through `studyHost.seenPlace`, written through `markSeen` as v1 writes it — no new field, no change to `PROGRESS_FIELDS` or the sync, no sound), a place they have not studied is never marked. *A decision for the owner below: this writes an existing field from the preview.*

**Tests and CI.** `test-study.js` 76 ok (Node: years, framing, discovery, the polity index and glossary builders), `test-places.js` 95, `test-atlas-study.js` 114 ok (collapsible panel, framing, chip, search across years, the pin by a real mouse, hills), `test-atlas-phone.js` 183 ok (the panel at five viewports), `test-atlas-labels.js` 182, `test-atlas-fallbacks.js` 33 ok. Every other Atlas suite on this head, run locally (software GL): a11y 34, card 25, search 18, session 8, time 81, stages 21, render 17, review 38, places 19, credits 15, relief and `test-discovery` green. **The frame gate** (`test-atlas-perf.js`, first of three local repeats, rule: at most 0.5 % of gesture frames over 100 ms, none over 200 ms): drag 0 of 1,271 frames over 100 ms (worst 100.0 ms), pinch during the gesture 1 of 405 (0.25 %, worst 116.7 ms), wheel and pinch p90 8 % and 12 % of v1's, a year change 2.4 ms at p95, heap 43 MB against 202 MB; the second repeat read drag 0 of 1,296 over 100 ms (worst 66.8 ms) and pinch 0 of 411 (worst 83.4 ms); CI's own frame-gate job passed on the pushed head (`810e10c`). The third repeat: drag 0 of 1,265 (worst 83.3 ms), pinch 0 of 406 (worst 99.9 ms). Three of three repeats pass the rule (at most 0.5 % over 100 ms, none over 200 ms).

**Changelog.** One line and v1.997: the glossary pin's mouse fix (it ships in `app.js`). The pin to `#map2`, the search, the framing and the chip are on an unlinked preview.

**Decisions for the owner.** (1) *Wikidata evidence:* I accepted P460 ("said to be the same as") beside replaces / replaced by and the same enwiki title — it folded Tomis into Constanța; say if only the first two should count (Tomis would unfold). (2) *The six point terms* (Alaska, Great Britain, Lake Turkana, Sahara, Siberia, Lomekwi 3): resolving areas against their Wikidata item within 300 km rather than 25 km would give the button to five of them. (3) *"New discovery" writes `placesSeen`* from the preview (the register v1 writes, no new field); the alternative is a per-viewer localStorage set that v1 would not share. (4) *Preview switch:* the pin goes to `#map2` only behind `folio.atlas2.preview`; Phase 5 deletes the switch. (5) *The 36 unfolded settlements* stay two places each; `merges` in `places-spec.json` folds any by hand.

### Phase 2c — as built (2026-10-12): peoples and cultures, a presence and not a territory

**Scope.** Sub-phase 2c of §7's Phase 2 on `#map2` (still unlinked until Phase 5; v1 and `#map` untouched): the data of the eight Cliopatria peoples, the two coastline series and the two site-hull cultures (`history.bin`); the rendering of a presence against a territory (§2.5); the stack chip that lists every entity under a tap; the legend's three-position Peoples switch (Q-C2 b); the place card for a people; the Node and browser tests and the two peoples-heavy primitive budgets. Not started: 2d (wars, fronts, prose), 1e, 1f. Preceded by two owner decisions (Task 0).

**Task 0a — the places registry's Wikidata evidence.** The rule is now written out in the test itself and in the two places a reader of the registry looks: Wikidata's P460 "said to be the same as" counts as fold evidence, with P1366 replaced by, P1365 replaces and a shared English Wikipedia article, **only when the two items are under 25 km apart (strictly) and in the same kind family** (`crossMerge`'s `linkEvidence`: `km < SAME_SITE_KM` and `familyOf` equal — both settlements); the registry's header comment (`atlas/data/places.js`, from `build-places.js`) and `docs/atlas-places-report.md` say so. The migration was run again: no fold changed (Tomis into Constanța stays, 4.0 km, P460 both ways; the 36 settlements stay unfolded, each pair with its evidence in the report).

**Task 0b — the six glossary point terms.** `resolveAnywhere` in `migrate-places.js` matches a point term the 25 km rule left over to a Wikidata item by **exact English label or alias** (the cache's `labels` answer both `rdfs:label` and `skos:altLabel`; plus the enwiki article of exactly that title) **at any distance**, taking only an item whose OWN classes name a kind that fits an area (a country subdivision, an island, a lake, a desert or a geographic / historical / natural region — a constituency, a street or a townland is not "a region" because subclass-of reaches the class). Exactly one fitting item resolves; several resolve only through the item whose English Wikipedia article is exactly the slug (printed in the report, for a human to overrule); none leaves the term unresolved. Printed in `docs/atlas-places-report.md` ("Glossary point terms matched by exact label or alias at any distance"), each with the item, its kind and its distance from the glossary's point:

| term | item | kind | distance from the glossary point | matched by |
|---|---|---|---|---|
| Alaska | Q797 | admin1 | 97.5 km | article + label or alias |
| Great Britain | Q23666 | island | 33 km | article + label or alias; Q3240725 "Britannia" (a historical region carrying the alias) loses to the item whose article is exactly "Great Britain" |
| Lake Turkana | Q182719 | lake | 53.1 km | article + label or alias |
| Sahara | Q6583 | region (a desert) | 40.7 km | article + label or alias |
| Siberia | Q5428 | region | 111.2 km | article + label or alias |
| Lomekwi 3 | — | — | — | no Wikidata item bears the name: unresolved, not guessed |

Four resolve to a gazetteer row already (by Q-number) and Lake Turkana adds one `places.js` row (`pl:q182719`); `glossary-places.js` now maps **211 terms: 30 of the 31 points and all 181 countries**. The migration is additive and idempotent (two runs, one set of bytes); `check-places` 25 ok, `migrate-places --check` and `build-places --check` pass. The glossary pin still reaches `#map2` only behind `folio.atlas2.preview`.

**Task 1 — the data.** `history.bin` **4,702,436 → 4,832,812 bytes (4.833 MB decimal; +130 KB; the stop rule is 12 MB, the forecast 4.58 MB)**: 206 entities (194 states + 12), 2,796 steps (2,693 + 103), 2,692 faces (2,592 + 100), 52,841 arcs (51,025 + 1,816). The three `file://` twins are 10.81 MB (the pilot slice carries no presence; its twin grew 2 KB with the header). *Where the states stand:* the full build with a warm epoch cache reproduces the 2b file byte for byte (`92529dc8…`) before the presence layer is switched on, and after it the 2,592 state faces resolve to the same arcs (kind, vertices, ranks, core references), the 194 state entities and 2,693 state steps are identical, the planarity residue is the 2b build's (741 / 379 / 0) and the Mediterranean at 1 CE draws the 2b budget's 7,032 fill triangles and 542 border segments exactly.

*How a presence enters the file.* It is a different thing from a state, so it is built differently (`build-history.js`, "the presence layer"): each row is conflated **alone** — a people overlaps the states and other peoples by design, so there is nothing to contest — onto the coast only (d1; no d2 neighbour snapping, no d3 present-day-border inheritance: it has no border line); its own edge arcs are **`KIND.SOFT`** with the series' source and class **soft**, and its faces are class soft; a presence's steps and arcs stay out of every state check (`check-history.js`'s per-epoch partition, the OPEN flags, the planarity repair's alive sets — each presence face is its own set). The presence rows have their own epoch cache; a rebuild of the presence layer on a warm state cache is ~15 s.

| series | kind | source | rows → steps | span |
|---|---|---|---|---|
| `scythia` | people | Cliopatria v0.2.0 (CC BY 4.0) | 6 → 4 | 650 BCE – 224 BCE |
| `galatia` | people | Cliopatria | 7 → 7 | 279 BCE – 26 BCE |
| `gothia` | people | Cliopatria | 11 → 11 | 207 – 382 CE |
| `huns` | people | Cliopatria ("Huns", "Hunnic Empire") | 21 → 16 | 106 – 629 CE |
| `avars` | people | Cliopatria ("Avar Khaganate") | 22 → 22 | 561 – 805 CE |
| `old_great_bulgaria` | people | Cliopatria | 3 → 3 | 633 – 681 CE |
| `khazaria` | people | Cliopatria | 25 → 25 | 630 – 979 CE |
| `magyars` | people | Cliopatria | 10 → 9 | 840 – 910 CE |
| `cyclades` | culture | the committed OSM coast partition (ODbL): 14 closed coast rings, one per spec point | 1 → 1 | 3100 – 2000 BCE |
| `crete` | culture | the OSM coast: the island's ring | 1 → 1 | 3100 – 1050 BCE |
| `yangshao` | culture | Hosner et al. 2016 (**CC BY 3.0**), outlines of `.claude/site-hulls.json` | 3 → 3 | 5000 – 3000 BCE |
| `longshan` | culture | Hosner et al. 2016 | 1 → 1 | 3000 – 1900 BCE |

The Avars, drawn as a state in the 2a pilot, are a people. *The coastline series* take the closed OSM coast ring that contains each `coast.points` entry (else the ring with a coast vertex nearest it within 0.25°, v1's rule — the Cyclades' Milos point lies 1,048 m offshore of its ring), so the face is the coast arcs and nothing else (every vertex snaps at 0 m); the years are those of the linked cards, by `card-links.js`'s `loadCardYears` — the rule `build-polities.js` used for `polities.js` — never typed. *The site hulls*: **Hosner et al. (2016) is a new pinned source** (`sources.json` id `hosner-2016`, PANGAEA 860072, `https://doi.pangaea.de/10.1594/PANGAEA.860072?format=textfile`, 5,907,172 bytes, sha256 `bb9c054b3e69cbe04d3d025390f770c6feee53ec9561ea92db88b126081ccd13`, licence CC-BY-3.0, whose own header states "Creative Commons Attribution 3.0 Unported"; two downloads, one hash); `build-site-hulls.js --check` rebuilds the hulls from those bytes and finds the committed file identical, and the file now records the hash it came from, which `build-history.js` and `check-history.js` hold against the pin. Hosner's labels carry no earlier and later Longshan, so there is one outline (the audit's "Early–Middle vs Late where the phase field allows" does not allow). The credits page lists Hosner (`credits.js` regenerated; `check-credits.js` green). *A fault found by the test, fixed:* the first build clipped every row at 3400 BCE, Cliopatria's first year and the states' floor, which cut the Yangshao's first phase; a culture's floor is the rail's (10,000 BCE).

Each entity carries `cards` (the cards that link it, carried so Phase 3's place card lists them — and each of those 16 cards now has the entity in its `places`; the migration re-derives them, `check-places` and `migrate-places --check` green; Galatia's duplicate region row `pl:q26847`, the same Wikidata item as the new entity, is dropped and gr-788 resolves to `pol:galatia`), `src` (its source's id) and `note`: **the audit's own words on how sure each extent is** (§4.C, rows C3, C4, C17, C18, C25, C29–C38 — Scythia's seventh-century row is maximalist and includes the Near-Eastern raids, the Huns are maximal hegemony and not settlement, where Etelköz lay is disputed, Khazaria's archaeological correlate is narrower, Old Great Bulgaria's source covers 14 % of the span, the Cyclades and Crete are the present coastlines) — printed on the card under the uncertainty sentence. Cliopatria's rows are taken whole (Q-U3 a); the audit's "take the 550–451 BCE row as the dominant range" is said, not drawn as a cut. `check-history.js`: **49 ok, 0 failed** in 199 s (budget 600); its new presence block: every face class soft, its arcs the coast (walked forward) and its own soft edge and never a border, no arc twice in a face, each face planar by itself at the finest level (0 coarse-level crossings), every entity with its span, source, cards and note, and `site-hulls.json` built from the pinned file.

*What the file says that the design's example does not.* §1.6 and the Phase 2 test name "the Scythians over the Bosporan Kingdom, 450 BCE". Cliopatria's Bosporan row begins in **404 BCE**, and its rows tile — the two shapes abut and do not overlap anywhere (a 0.2° sampling of the pair's every year found none). The overlaps the file does contain (a 0.25° sampling of every presence step against every state step): the Huns over Byzantium in 402–406 CE (a raid's reach, 276 cells ≈ 170,000 km²), the Huns over Rome in 451, Crete over Mycenaean Greece in 1400–1101 BCE (9 cells), Khazaria over the Abbasids (2 cells), and the Yangshao and Longshan in 3000 BCE (the year one step ends and the other begins). The tests use these (below).

**The 24 war sides with no entity** (the 3a / 2b note, item 7) — inventoried in `docs/atlas-v2-coverage.md` (generated from `WAR_SIDES_2C` in `build-history.js`): **none of the 24 is resolved by one of the twelve series** (the cards that link the twelve are not among theirs, and no side names a Scythian, Gothic, Hunnic, Avar, Bulgar, Khazar, Magyar, Cycladic, Minoan, Yangshao or Longshan party; Caesar's Gallic tribes are not the Galatians of Anatolia). The rest, for Phase 2d, by what each waits for: a **league or empire to trace** from a public-domain plate (Athens and its empire, the Greek allies, the allies of gr-676 — batch 6); **Italic, Gallic and Iberian peoples** with no open dataset (Samnium, Umbria and Picenum, the Cisalpine and Gallic tribes, the Celtiberians, the Lusitanians and the two together — batches 6 and 8); the **Laconia–Messenia split** from OHM (Sparta, Messenia — batch 5); **assemblies of entities already built** (Sparta and its allies = the Peloponnesian League, Macedon and the Greek leagues — batch 5); a Cliopatria "Greek City-States" blob that cannot be split (the Sicilian Greeks, Syracuse); **coalition members of the Second World War** by date over a Cliopatria row (the British Raj, Ethiopia (Italy), the Union of South Africa, Yugoslavia — batch 3); the Native-held interior from the USFS Indian Land Cessions (the Western Confederacy); and three that the audit records as **not drawable from open sources** (the Chinese warlords, the Seneca and Cayuga against Cliopatria's whole-confederacy Haudenosaunee, the Yue peoples).

**Task 2 — the rendering, as §2.5 asks.** *A soft face with no border line:* `atlas-worker.js` `presenceMesh` gives a presence face a mesh with a per-vertex **edge alpha** (the sink's fourth float, which a state's mesh uses for the face id): the face's ring at alpha 0, the same ring moved inward by a **fade width** at alpha 1, a strip between them, and the interior (the inset ring, earcut) at alpha 1. The width is a share of the face's own size — 6 % of its characteristic width, between 12 and 300 km — so a small people is a small smudge and the Huns a wide one; **where the edge is the coast nothing fades** (the coast is a real edge, and the fill is masked by the land stencil as a state's is) — a vertex moves in by the share of its two edges that are soft arcs. The inset ring is **verified** (a uniform grid of segments: no inset edge crosses another or the boundary; the width is halved up to twice and then dropped, with each vertex's move also capped at 40 % of its clearance to any other edge), so the fill never folds; the soft-edged faces all keep a fade at every level (Node, 300 face × level meshes). *The stipple:* `atlas-gl.js` `drawHistoryPresence` — a lattice of **round dots** (7 CSS px pitch, 1.35 px radius, in screen space, so dots, never hatching: a contested face's war hatching stays stripes) rotated by the presence's own angle (45°, 15°, 75°, 30° … by entity order, with a phase and a pitch of 1–1.14×), over a faint wash (alpha 0.14, dots 0.62), in the presence's own hue (a golden-angle wheel apart from the states' slots, dark on a light theme and light on a dark one); two overlapping peoples therefore interleave two lattices at two angles. *Blending:* **multiply** over what the states drew first (`dst · (src + 1 − srcα)`, a premultiplied source) on a light theme, **screen** on a dark one — the decision below. The presence pass runs after the states' fills and before the cached line layer and the borders, so coasts, rivers and borders stay crisp over the stipple; it is drawn each frame on the still cache's scratch target like the fills, and in an ID pass it writes the face's id wherever the edge alpha is solid. *The names:* a presence's name is set in **spaced italic, mixed case** (`people-l|m|s`: the serif italic at 16 / 13.5 / 11.5 px with 4.2 / 3.2 / 2.4 px of tracking, in ink — against water's italic, which is tighter and blue, and a state's small capitals), along the same label path as a state's (`histLabelPath`), and **laid out in one pool with the states'**: a candidate scores `rank·10 + 4.5` where a polity scores `rank·10 + 1` and a region 5, so a people's name comes after a state of its rank and before a region of it, and the one greedy grid keeps them from colliding. *Where the work runs:* the per-year cost is `presAliveAt` (twelve binary searches), the filter the switch applies and a list of ≤ a few draw records.

**The stack chip.** A tap's ID pass is asked in layers (`R.pick(…, { layer, skip })`): the presence pass first, again with the faces already found skipped (so two peoples under the point are both named; up to six), then the states'; the stack is the labels under the point, the water, **the presences topmost first, then the states**, then the country in a present year. The chip reads "2 here · 1/2 Huns · people" with, when a people is among them, a second line listing every entity — "Huns · people / Eastern Roman Empire · state" — and an `aria-label` that names each; a second tap cycles, as before. The kind word comes from `AtlasStudy.kindWord` ("state", "people", "culture"). **A discovered fault, fixed (it predates 2c):** when a view changed level with the same faces on screen — the year set first, the view second, as the perf suite does — the meshes of the new level were never asked for and `historySettled` waited for ever (measured: a Black Sea view at 4 km/px never settled after a steppe view at 6 km/px, 60 s); `refreshOnScreen` now asks for them, at the resting level only.

**Task 3 — the Peoples switch (Q-C2 b).** The legend's third fieldset — Off / Peoples a card links / All with a dated source, with a one-line note of what the position shows now. `study.js` is the one place its arithmetic lives (`peoplesShown(pos, mode, id, flags, linked)`; Node-tested over every position × view × link): **off** hides every presence; **linked** (the default) shows those a card links — in the Full Atlas through the flags (so a collection switched off removes the cards it owns and the peoples only they link), on the plain Map through the entity table's own `cards`; **all** shows every presence with a dated source in the Full Atlas and on the plain Map; **the Personal Atlas shows a presence only when one of the reader's OWN studied cards links it, whatever the position but off**. The choice is `layers.peoples` in the per-viewer legend object in `localStorage` (inside the existing try/catch; an unknown stored value reads as the default; with writes refused the switch still works — tested). A people's steps are ticks on the rail like a state's (`changeYearsOnScreen` includes a presence the switch lets through; the ≤ 200-tick bucketing and the 4 px floor are the same code — the Yangshao's 4000 and 3500 BCE are change years at the 4000 BCE view), and only a state counts toward "No state taught by Folio's cards is mapped for this year yet". *What the switch can and cannot do today:* **every one of the twelve presences is linked by a card** (the series are the cards' own), so "all with a dated source" shows the same twelve as "linked" until a collection is switched off or a people no card links is added in Phase 2d; the third position is built and tested and shows no more today.

**Task 4 — the place card of a people.** The kind line ("People · 650 BCE – 224 BCE", "Culture · …"); the span and the steps as ranges, the full step list and the timeline of bars, all of it the state card's code; **the uncertainty sentence in the state card's words** — "Approximate: Cliopatria v0.2.0, CC BY 4.0. A border here is one reading of incomplete evidence, drawn at the source's own precision." — with the source named from the entity (Hosner et al. (2016), CC BY 3.0; the OpenStreetMap land polygons, ODbL); **a plain sentence on what a presence is** ("A people is a presence, not a border: the soft, dotted shape is where the source places them in these years, with no line round it, drawn over any state that held the land.") and the audit's note on this one's extent; the gaps; the scope sentence ("the peoples and cultures Folio's cards teach, not every people of the period"); the Wikipedia link; and the cards that link it, Phase 3's list (`appendStudyCards`, which the history card already called). The search finds a people or a culture by name (`polity-index.js` carries them, the kind as an eighth element) and says, as for a state, when it is not on the map in the rail's year.

**Task 5 — tests and the gates.** *Node:* `test-peoples.js` **52 ok** — the classification (one function: `layerOf`; the file holds exactly the twelve presence entities the audit names, eight peoples and four cultures, none of them a polity, every other entity a state; a presence is never a partner of a contested or nested face), the switch's arithmetic (20 position × view × link cases and the collection, unknown-value and null cases), the data (every presence with its span, source, note and cards, each card carrying it; steps in order and inside their span; every face soft; the Yangshao's three phases from 5000 BCE), and the soft face's mesh on the committed file at the three resident levels (300 meshes, 350,456 triangles: the areas sum to the face's own area and no area is folded; the triangles that wind clockwise — the fade strip's quads where a reflex corner folds its inset — are 3.4 × 10⁻⁵ % of the area, the largest 38.9 km²; every alpha in [0, 1], every mesh has solid ground, a soft-edged face fades and an island never does; the slowest mesh 1.0 s in Node); `test-study.js` 76 ok in Node and `test-atlas-study.js` 124 ok in the browser, `test-places.js` 95 ok. *Browser:* `test-atlas-render.js` **42 ok** — five (year, view) pairs for peoples, each read three ways: the stack a tap answers, the **screenshot diff** of the same view with peoples on and off (labels hidden, so only the fill differs), and the same pixels in **monochrome** (luminance alone: 0.299 R + 0.587 G + 0.114 B): *(1)* 400 BCE, the Kerch strait: Scythia beside the Bosporan Kingdom — the people's window gains a stipple of dots on 6–30 % of its pixels and its luminance spread goes from ~0 to ≥ 15, the state's flat fill (spread ~0) does not change by a pixel, and the kingdom beside it is left as it was; *(2)* 404 CE, the Huns over Byzantium — the stack names the people first and the state second, the chip lists "Huns · people" and "Eastern Roman Empire · state", a second tap cycles to the state, and over the state the stipple stays visible while the state's fill stays readable (its brightest quartile within 20 %) and, in monochrome, a flat fill becomes a texture; *(3)* 3000 BCE, the Yangshao and the Longshan overlapping — two stipples at two angles, more dots together than either alone (1.15–2.3×) and not a solid fill; *(4)* 4000 BCE, the Yangshao alone — the stack names the culture alone, its name is set in the people style, the rail ticks at its steps; *(5)* the switch's three positions; and one check of the label pool — 375 CE over the steppe, the Goths' and the Huns' names (spaced italic) beside the states' small capitals, none overlapping another (0 overlapping pairs). `test-atlas-study.js` section 7h: the legend's three radios and their default; a reader who studied the Scythians' and Galatia's cards sees exactly those two on the Personal Atlas and draws only Scythia at 400 BCE; the Full Atlas shows all twelve; with the Russia collection off "linked" keeps five and "all" twelve; Off hides all; the choice is remembered, an unknown value reads as the default, and a refused write does not break the switch.

*The gates.* Local, SwiftShader (software GL), the perf suite: **all checks ok, none failed.** Relief off, pooled p90 against v1's: drag 50.0 ms vs 166.6 (30 %), wheel 33.3 vs 366.7 (9 %), pinch 50.1 vs 366.6 (14 %); **0 of 1,275 drag frames over 100 ms (0.00 %), worst 83.3 ms**; 0 pinch frames over 100 ms during the gesture, worst 100.0 ms; the first full-screen frame after a pinch 166.7 ms (≤ 300); scrub p90 16.8 ms (11 % of v1's); **a year change 2.80 ms at p95 over 174 changes** (≤ 5), and over the whole rail, 10,000 BCE to today, 2.80 ms over 426 changes, frames p90 16.8 ms, worst 83.3 ms; the heap 48 MB against v1's 200 MB. The suite shared the machine with my other Node runs for a few minutes, so these are, if anything, pessimistic. *Primitive budgets for the two peoples-heavy views* (the loosest ceiling is the measure plus ~30 %, as the existing views'): **Steppe 450 CE** (the Huns): 64,219 triangles, 28,034 segments, **presence fill 1,607 triangles in 1 face** (budget 2,100), the states' 11,195 fill triangles in 9 faces and 937 border segments; **Black Sea 450 BCE** (Scythia): 167,260 triangles, 89,000 segments, **presence fill 2,091 triangles in 1 face** (budget 2,700), the states' 26,935 fill triangles in 16 faces and 641 border segments; and a third view, **Steppe 660 CE** (the Avars, Old Great Bulgaria and Khazaria at once), 63,474 triangles, **presence fill 1,627 triangles in 3 faces** (budget 2,100), the states' 12,767 fill triangles and 1,188 border segments. A presence adds 1–3 % to a view's triangles (its mesh carries a fade strip, but the faces are smooth hulls) and no border segments, and its dots are a fragment shader's arithmetic, not geometry. The 2b views are unchanged to the triangle (Mediterranean, 1 CE: 7,032 fill and 542 border segments; Europe 1500 and 1900 as before). The other Atlas browser suites run locally, all green: `test-atlas-labels`, `-review` (38), `-phone`, `-study` (124), `-a11y`, `-card`, `-time`, `-render` (42), `-fallbacks` (33 ok; the 150 ms check passed, worst task 124 ms), `test-discovery`.

*CI.* The first push run (91c09ca) failed one step, `check-places`: the committed `polity-index.js` lagged `history.bin` after the Yangshao start-year fix (-3400 → -5000), which I had re-built but not re-installed; the step caught what it is for. Fixed in 7b9506e (one line of generated data), the fast job (every checker, `check-history` 49 ok) is green on that head; the Playwright and frame-gate jobs are reported in the closing message of the session.

**What contradicts or amends the design.** (1) The Phase 2 test "the Scythians over the Bosporan Kingdom, 450 BCE" cannot be run as written: Cliopatria's Bosporan row begins in 404 BCE and the shapes abut; the tests use the overlaps the file does contain (above). (2) §2.5's "fades to zero over ~5 % of the face's radius" is 6 % of the face's characteristic width between 12 and 300 km, so a small people is not swallowed by its own fade. (3) A culture's rail floor is 10,000 BCE, not Cliopatria's 3400 BCE; the states' floor is unchanged. (4) The audit's "Early–Middle vs Late Longshan" is one outline: Hosner's labels do not carry the phase.

**Decisions for the owner.** (1) *Multiply on a light theme, screen on a dark one:* a stipple that darkens a state is the natural overlay in a light theme, but over a dark theme multiply would vanish; if you want one blend everywhere, say so. (2) *Peoples default "a card links":* every one of the twelve is card-linked, so the third position adds nothing until Phase 2d adds a people no card teaches. (3) *Where to draw the Huns' maximal extent:* the audit says maximal hegemony, not settlement; I draw Cliopatria's rows whole and say so on the card. (4) *Phase 5 only:* `#map2` stays unlinked, so no reader of the live site sees any of this — **no changelog line and no version bump** (and `app.js` is untouched).

**Not verified.** The look on a real GPU (SwiftShader only); a phone's touch on the new stack chip beyond the headless phone suite; the 24 war-side inventory for Phase 2d has no code behind it.

### Phase 2d — as built (2026-10-12): the wars and the Second World War front

**Scope.** Sub-phase 2d of §7's Phase 2 on `#map2` (still unlinked until Phase 5; v1 and `#map` untouched): every war card's two sides drawn in the years it was fought, the 24 war sides of the 2c inventory built or deferred with their reasons, and the Second World War front as dated event faces. Nothing here reaches a reader of the live site (`#map2` is not linked): **no changelog line and no version bump.**

**Task 0.** (a) *CI on main's merge commit 352d151 (PR #454):* the workflow run is green overall, the fast job and the frame gate green, and the Playwright job red with "4 browser suites failed". The log I could read names `test-personal-atlas`, `test-review-decks` and `test-tour` (one assertion each); the fourth is by count and, being alphabetically earlier than the part of the log I could read, almost certainly `test-draw-cards`. Nothing beyond the four known non-Atlas suites was red, so nothing needed fixing first. (b) *The owner's 2c decisions:* the legend's third Peoples position keeps its control and says "adds nothing until more peoples are built"; a people's name carries an opaque halo two pixels deep over its own stipple (`PEOPLE_HALO`, tested in `test-atlas-labels.js`); the Huns stay Cliopatria's rows whole with the maximal-hegemony wording; the blend stays multiply on a light theme and screen on a dark one.

**Task 1 — the sides.** `lib/war-resolve.js` resolves every `card.war` side, in this order: an entry of `war-sides.json`, the card's link in `polity-spec.json` / `war-series.json`, a side name that is a series label, the side's `keys` through `keyMap`, and last the card's authored `area`, kept as an **authored extent** (an entity of kind `extent`). `build-wars.js` writes `atlas/data/wars.js` (12,206 bytes, budget 40 KB): **56 war cards, 100 members, 32 sides on an extent, 8 wars that group others, 17 names that resolve to nothing** (listed on the table, never drawn). The war-card rules hold: both sides or neither; a name may not stand on both sides in overlapping years; a war decided is drawn, an undecided one is not. The old `war` field is byte-identical to main's (a pinned sha256 over every card's block; `test-war-sides.js`); the migration is idempotent (run twice, no diff) and `migrate-places --check` and `check-places` pass. A member has a window of its own with its reason (Yugoslavia on the Allied side from 6 April 1941, the Union of South Africa from 6 September 1939): the entity is drawn only where its own steps lie too, and **never wider than the card's years**.

*The assertions.* `docs/war-cards.md` counts 1,705 in/out assertions once composed per side; the repository keeps only the subset pinned in `test-war-cards.js` `EXTENT_PLACES` — **490 over 49 cards** — and `test-war-sides.js` moves those onto the built topology (each place asked of the side's ground at the war's first year): **426 hold and 64 do not**. I changed none of them; the 64 are listed with a cause in `test-war-sides-known.js` and the test fails if a listed one starts to hold. Causes: 24 *Cliopatria's own row includes the place* where the card's hand-drawn ring leaves it out (Milan and Bologna inside Rome from 218 BCE); 23 *Cliopatria's own row does not contain the place* the card's ring holds (Rome, Capua and Neapolis in 343 BCE, Philadelphia in 1779); 8 *within the 15 km coast snap* (Megara in the Peloponnesian League, Hippo Regius in Carthage); 6 *a coastal site clipped to the present OSM land* (Methone, Camarina, Chios — each within 1 km of its face); 3 *the member is not drawn* (the Rashidun Caliphate in 632). The same disagreements already appear as the 50 "known source faults" of `check-history.js`'s own extent assertions.

**Task 2 — the 24 sides.** `docs/atlas-v2-coverage.md` (generated) holds the table; `test-war-sides.js` holds it too, so the two cannot disagree. *(i) Assemblies of built entities, by date:* Macedon and the Greek leagues (Macedon, the Achaean League and the **Aetolian League**, a new Cliopatria series), Sparta and its allies (the Peloponnesian League), the Lamian War's allies (the **Athenian Coalition**, new), and the members of ww2-001 (the **British Raj**, the **Union of South Africa**, **Yugoslavia**, all new series; the Republic of China, the USSR, Mongolia, Japan, Italy and Hungary already existed; Ethiopia in ww2-042 was already built). *(ii) Open sources named by the audit, built as it defines them* with a pinned sha256 and licence in `sources.json`: Laconia and Messenia split at the card's Taygetos line from OpenHistoricalMap's Lacedaemon (relation 2849727, **CC0**), and the Western Confederacy as the card's limit of the Ohio country less the Royce cessions by treaty date (USFS, **public domain**, three rows). *(iii) Not clearly open — not traced:* **Athens and its empire** (Shepherd's plate of c. 450 BCE is public domain but a raster page of scattered tribute-paying coasts) and the Italic, Gallic and Iberian peoples, the Greek allies of wh-319, the allies of gr-676, Seneca and Cayuga and the Yue peoples stay the card's own extent, drawn as a soft, borderless wash and **labelled authored on the place card and the legend**; **Chinese warlords** is unresolved. `docs/atlas-borders-audit.md` §7 has one ledger row per batch.

**Task 3 — the front.** `build-fronts-plates.js` and `.claude/ww2-plates/fortnight.py` make `fronts-plates.json`: **138 plates** — 41 monthly (31 August 1939 – 31 December 1942, Europe, ww2-atlas / San Jose's Commons series, public domain) and 97 fortnightly (1 July 1943 – 15 August 1945, Europe and the Pacific, the US Army's semimonthly atlas, public domain, none skipped). Four `front` entities (Axis-held, Axis-occupied, Allied-held, Allied-occupied); a plate stands from its date until the next plate of its theatre, for at most 31 days (monthly) or 17 (fortnightly); **January–June 1943 has no plate and draws nothing**. Steps are dated (`unit: "date"`, integers YYYYMMDD), never interpolated. Each plate carries its class (approximate) and its registration error (about 2 km monthly; 6–39 km, median 25, fortnightly) on the place card. Reused: the fetch/pin machinery (`fileset` sources), the presence layer's conflation onto the coast, `check-history`, the credits generator (every source is in the header the page is built from; `authored` sources are skipped).

**The file.** `history.bin` **4,832,812 → 9,096,472 bytes (9.096 MB decimal; the stop rule is 12 MB)**: 233 entities (206 + 5 states + 18 extents + 4 fronts), 3,159 steps, 3,043 faces; the twin `history.bin.js` 1.06 MB.

**Task 4 — what a reader sees.** *The Wars switch* (on by default; Off / On in the legend) tints a side's ground by role — a victor green, a loser red — over the state's own hue, and the legend says what the tints, an authored extent's soft wash and the front's four classes mean (its swatches are painted from the renderer's own colours, so the key cannot disagree with the map). *An authored extent* is a flat soft wash with no dots and no border (a presence-class face with its own `wash`), distinct from a people's stipple. *A front* is an event face — hard-edged, no fade, its own entity, its own stepper (date, theatre, uncertainty in one sentence; "no plate from 31 Jan 1943 to 30 Jun 1943 (no source)") and its own legend row. *The place card* of a war's entity, and a card's war, say who fought on which side, the years, which sides are authored extents and which names are not drawn. A grouping war is not drawn on its own; it is drawn when chosen from its card ("Show this war"). The 2a rules hold: a gap draws nothing, the nested polity is the default, no crossfade under reduced motion; the peoples' rendering is untouched except Task 0b.

**Task 5 — the tests.** *Node:* `test-war-sides.js` **15 ok** (resolution, the 24 statuses, the pinned field hash, the table derived and byte-identical on two builds, member windows, nothing tinted the year before or after a war, no name on both sides, the 490 assertions with their causes); `test-study` 89, `test-peoples` 54, `test-places` 95, `check-places` 29, `check-credits` 5. *Browser:* `test-atlas-render.js` **69 ok** with five new (year, view) pairs — the Second Punic War in 216 BCE (Rome green, Carthage red), the Peloponnesian War in 431 BCE chosen from its card (the League green, Athens' extent a red wash), the Western Confederacy in 1790 and 1795 (Dayton in, then cut out by the Treaty of Greenville), the Eastern Front on 30 November 1942 and the Western Front on 15 June 1944 (Europe and the Pacific plates standing at once; the 1 July 1943 step back to 31 December 1942). *The gates (SwiftShader, the perf suite, all ok):* 0 of 1,273 drag frames over 100 ms (worst 83.3 ms); 0 of 409 pinch frames over 100 ms during the gesture (worst 83.4 ms); **a year change 3.80 ms at p95** over 175 changes (2.70 ms over the whole rail); pooled p90 21 % of v1's for the drag. *Primitive budgets for the two war-heavy views* (the measurement × 1.25): the Western Front on 15 June 1944 at 3 km/px — 88,752 historical fill triangles in 10 faces (the four fronts count here, not in the presence counter) and 1,525 segments → ≤ 111,000 / ≤ 1,950; the Mediterranean in 216 BCE with the Second Punic War chosen, 6 km/px — 6,268 in 14 faces, 1,020 segments, 76 presence triangles in 1 face → ≤ 7,900 / ≤ 1,300 / ≤ 100.

*What I had to change in the checkers, and why.* `check-history.js`: **the shore-length ratio 6 → 7** (Norway's fjords under the fronts: 583–1,497 km of shore drawn as 95–248 km at 30 km, ratios to 6.5; a collapsed range reads past 10); **a separate, measured budget for the fronts' self-crossings** (29 at the finest level, 1,194 at the coarser; where a plate edge runs along a fjord shore the snapped edge and the coast cross — Boknafjord, the Sognefjord, the Ofotfjord, some Danish and Baltic shores — each a sliver of fjord scale), peoples and cultures keeping the exact finest level; **the time budget 600 → 900 s** (216 front faces of 2,000–3,600 rings add about 210 s to the planarity pass). Tests: `test-atlas-time` counts a war's years as change years (the switch is on by default) and extents and fronts as presence; `test-atlas-review`'s stroke test measures the state styling with the tints off; `test-atlas-perf` gained the two views.

**What contradicts or amends the design.** (1) The front is drawn as a state-class event face on the presence pass (no new pipeline), so its triangles count in the historical counters. (2) A war card's extent is an authored wash, not v1's dashed outline — v1's dashes cannot be placed on a globe that tilts. (3) The 1,705 assertions are not in the repository; 490 are. (4) A side's membership is dated where the war's own facts date it (declarations, invasions) — a claim made in `war-sides.json` with its reason, not a source's.

**Decisions for the owner.** (1) *Dated membership windows for the grouping war ww2-001* (the Raj from 3 September 1939, Yugoslavia from 6 April 1941 …): say if you want the whole war's years for every member instead. (2) *Authored extents as soft washes, labelled, instead of dashes.* (3) *The Taygetos line between Sparta and Messenia is Folio's* (OHM's outer limit is OHM's), and *the Western Confederacy's outer limit is Folio's editorial line* — both said on the cards. (4) *The Wars switch is on by default on the plain Map* (every war in its years); the alternative is the Personal Atlas only. (5) *Athens' empire stays an authored extent* until you choose an open outline. (6) *The fronts' straight frame cuts and fjord crossings* (above) are accepted at the measured budgets.

**Not verified.** The look on a real GPU (SwiftShader only); a phone's touch on the new stepper beyond the headless phone suite; the fourth red suite of main's Playwright job by name; `test-war-cards.js` fails its "popup keeps the legend" assertion in this session's Playwright on **main itself** (I ran it on an untouched checkout of 352d151) although main's CI passes it; `test-atlas-fallbacks.js`'s 150 ms main-thread check was 172 ms (noise, not chased).

### Phase 4 — as built (2026-10-13): the card windows and Find it on the shared engine, Stage A (behind the per-viewer preview switch)

**Scope and status.** Task 0 (the five owner decisions of 2d), the Task 1 inventory (`docs/atlas-v2-card-windows.md`), the embedded engine, every window type and Find it **on the engine behind `localStorage["folio.atlas2.preview"]="1"` (or `#map2?preview=1`), OFF by default** — Stage A. **Stage B (the default flipped, v1's window path removed) is NOT done: it waits for the owner's reply** (the question is in the report). Nothing here reaches a reader of the live site by default: `#map2` is unlinked, every window and Find it are v1's unless the switch is on. **No changelog line and no version bump.**

**Task 0.** *(0a)* The Wars switch has a third position, **Automatic**, the default: wars are tinted in the Personal Atlas and for a war chosen from a card (focus), not on the plain Map or the Full Atlas; Off and On are the reader's own and hold in every mode; the legend says what each does (`study.js` `warsEffective`, `test-study.js`, `test-atlas-render.js`). *(0b)* The 41 monthly plates of the front come from one map with a frame (a Lambert conformal conic rectangle, GMT `-JL15/0/45/60`, x −2271…2582 km, y 4556…8841 km, measured from the plates: the edges every plate shares); a front face of that era fades to nothing over 120 km towards the frame's four sides (`atlas-gl.js` `FRAME`, in the presence fragment shader), and the legend and the front's place card say in one sentence that the source map ends there. *The straight cut in European Russia is the right-hand side of that frame* (x = 2582 km: (54.16°E, 51.07°N) to (71.63°E, 63.2°N), the Allied-held ground of 31 December 1942). The fortnightly plates of 1943–45 are another atlas's page maps and carry no rectangle here (not examined). *(0c)* `audit-polity-names.js` (cache `polity-names-wikidata.json`, CC0): of 165 entities with a QID, 102 agree with the English label of their Wikidata item and 63 do not; **no item carries a dated name statement** (23 statements, none dated); two have a DATED LABEL — an item whose inception and dissolution cover the years — that contradicts Cliopatria for part of the span, and are overridden (`polity-names.json` → `atlas/data/polity-names.js`, applied at display time): **Kingdom of Hungary 1920–43** (Q600018, 1920-02-29 to 1946-02-01; Cliopatria's row says "Hungarian Republic" 1919–43) and **Federal State of Austria 1934–37** (Q176495, 1934-05-01 to 1938-03-13; "Republic of Austria" 1919–37). The other 61, reported: 16 are the right item whose label is a fuller or shorter form of the same name (England / Kingdom of England, Venice / Republic of Venice, Italy / Kingdom of Italy, …) or the modern item of a state whose own dated label agrees with Cliopatria (Republic of China Q13426199, Kingdom of Yugoslavia Q191077, Union of South Africa Q193619); **about 40 carry the QID of a different item** (a Chinese state's QID names a dynasty or an unrelated state: Lu → Aq Qoyunlu, Han (state) → Beylik of Saruhan, Han dynasty → Chauhan, Numidia → Jugurtha, Athenian Coalition → the Peloponnesian War, Byzantium → "Foreign relations of the Byzantine Empire", France → Bourbon Restoration, Rome → the 1798 Roman Republic, Lithuania → the 1251 Kingdom of Lithuania, the Republic of China → the People's Republic …) — **a fault of the `qid` the entity table carries, which feeds the place card's Wikidata link and the Wikidata-linked folds; not fixed, listed for a thread of its own**. *(0d)* A CPU profile of 203 year changes: the main thread's cost sat in `dateInt` (the 138 front plate dates parsed again on every year), `themeTokens` in `uploadStyle` (a `getComputedStyle` per year) and `toLocaleString` (a formatter built per call); all three removed. Same harness, four runs each, p95 of a year change: wars on 4.0–5.1 ms (median ≈ 4.5) before, 2.7–4.1 (≈ 3.0) after; wars off 3.2–4.3 (≈ 3.6) before, 2.1–3.1 (≈ 2.4) after; the gate's own reading of the year change (175 changes, p95) is **3.60 and 4.80 ms in two runs of this tree against 5.80 ms on an untouched `origin/main` on the same runner** (the rule is 5 ms; 2d measured 3.80 on its runner). *(0e)* The last COMPLETED push run on main when the work began (d6da7ed) was red in the four known non-Atlas suites **and the frame gate** (the Steppe 450 CE primitive budgets: 6,320 presence and 23,791 historical fill triangles against 2,100 and 14,000); the next run (2d's merge, a917242) had the fast job and the frame gate green and the same four suites red and nothing else.

**Task 2 — the embedded engine.** `atlas.js` gains `opts.embed`: the same controller mounted as a headless hub — no saved layers or year, no address bar, no gazetteer or labels, no frame loop (`frame` calls the hub's hook), `controller.embed` for the host. `atlas/atlas-embed.js` owns ONE hub (a hidden holder) and any number of windows: a window is a 2D canvas plus a spec (size, centre, zoom — the Atlas's own, `radius = 0.46 × the short side × zoom` —, layers, highlights, year, war); `draw` resizes the hub, plans the view, renders, copies the GL canvas into the window and lays the highlights' outlines on top (a mask pass: only the highlighted faces white, read back, a ±1.3 px band and a glow). **One WebGL2 context for the page** whatever the number of windows; the hub is disposed after 20 s with no window and recreated by the next (`test-atlas-embed.js` §2 counts `getContext("webgl2")` over twenty windows: 1; created 2 / disposed 1 after a gap). `atlas-gl.js` gains `R.highlight(Map face → colour)` and a second face pass for the highlighted faces: **found on the way — the core holds a country's face AND its admin-1 children's, overlapping, and with no depth buffer the later triangle won, so a selected state on the Atlas page itself came out with holes** (Colorado, Texas); fixed for the Atlas's own selection too. *Lazy and off the eager path:* the engine is the `atlas2` bundle, `atlas-embed.js` + `atlas-windows.js` the `atlas2embed` bundle, `card-faces.js` `atlas2cards`, `wars.js` `atlas2wars`; `topology.bin` is fetched by the controller; warmed at idle behind the switch, skipped in light mode; `history.bin` loads only for a window that needs a year (a war window, Find it's area round). **`app.js` is +6,964 bytes (3,921,528 → 3,928,492) against the Phase 3 head** — the dispatcher, `atlas2Ctx()`, the link out, the bundles' rows and the switch — **not unchanged or smaller as the brief asks: v1's window path has to stay until Stage B removes it**; `test-deck-lazy.js` passes (27). *First window* (`.claude/measure-atlas-embed.js`, headless Chromium with SwiftShader, so the CPU and not a GPU is what is timed): **cold cache, desktop: first paint 4.7 s after the window mounted, 3.5 MB as served (2.6 MB gzip -9): the engine's code 550 KB, topology.bin 2.9 MB, the worker's earcut and file; phone profile (390×844 @3×, CPU ×4, slow 4G): 24.6 s, the same bytes. Warm cache: 4.5 s desktop, 6.5 s phone — the time is the worker parsing and triangulating topology.bin (the hub is ready at 3.8 s), not the network; a second window on the page paints in 5 ms.** That is long for a first window; it is the cost of sharing the Atlas's own geometry and the reason Stage B should wait for the owner's phone reading (below).

**Task 3 — the windows.** `startCardGlobe` is a dispatcher: with the switch on, `atlas-windows.js` `startCardWindow` draws the window through the hub, else (or when the engine cannot start) `startCardGlobeV1`, byte-for-byte the old window. **Same host contract** (`_folioMap`: stop, reveal, ready, view, pan; the `.mc-*` markup; `data-map-engine` says which drew it). *Map cards:* the shaded place is the entity's face from `atlas/data/card-faces.js` (generated by `build-card-faces.js`, which joins each layer's key to an engine entity by the layer's own code against the entity's `iso`, the 53 world.js names Natural Earth's two files spell differently by an alias table, and exits 1 unless **all 821 map cards' layer, keys and dot resolve**; with the label point, the bounding box of the rings near it — the fit is `fitTarget`'s arithmetic — and the capitals and cities a card may mark) with the selection gold as a tint and an outline and a glow; the dot, the reveal's name and the controls as before. *Locators:* the engine draws the coast, borders, rivers, lakes and the admin-1 lines; the gold mark (square, circle, swords), the authored area (dashed, painted only where it is land — or sea, for a sea — by the engine's land mask), the range's peaks, the siblings and the home square with their names, and the card's own river (in gold, from `rivers.js`, **the one v1 data file left on a locator's path**) stay a 2D overlay projected with the engine's view. *War windows:* drawn at the MIDDLE YEAR of the war on the engine's history — the sides tinted green and red by `warRoles`, every other state plain land — and a year outside the war's years tints nothing; a war the table does not carry keeps V1's window. *Tap:* a tap on a locator or war window, and on a map card once revealed, opens `#map2/<lon>/<lat>/<zoom level>[?y=<year>]` (the go button does the same); a deep link may now carry `&war=<card>`. **What a reader sees differently** (screenshots in `docs/atlas-v2-phase4-shots/`): the engine's own coast (exact, from the tiles: Rhode Island's islands, Texas's gulf shore) where v1 drew 3-decimal polygons; fewer and thicker rivers (Natural Earth's rank-limited set against rivers.js's 1,073 thin ones); the neighbouring states' lines only where the admin-1 layer has them; a sphere with the Atlas's halo on a world card; **a war window is the year's states with the two sides tinted, not present-day countries shaded** — the one change of subject, and the owner's to confirm (the question below). *Not done:* China's modern provinces are solid thin lines (the admin-1 layer), not v1's dotted interior edges; the opt-in neighbours sentence (`mapAlt`) keeps V1's window; the glossary pin is unchanged since 3c (a button into `#map2`, covered by `test-atlas-places.js` and `test-atlas-study.js`) — no window to move.

**Task 4 — Find it.** `PAGES.findit` plays on `atlas-windows.js` `findIt` with the switch on. **The game is unchanged**: the same five rounds — a copy of `finditPools` / `buildGameRounds` (they live inside v1's page closure) **asserted equal to v1's by `test-atlas-embed.js`**, which opens both pages and compares the day's five (Russia, the Qing dynasty in 1769, Libya, Urartu in 675 BCE, Abu Dhabi) —, the same wording, a tap that only picks (Guess / Clear), two tries, "found" as the score, one play a day. **What moved:** the board is the engine at the round's year (the Full Atlas's states and peoples for an area round, today's earth for the others); the pick, miss, find and answer are highlights (a country's tint and outline; a state of the year's tint); a **country or a state is scored by the ID pass** — the entity ids under the tap, asked of the engine, against the entity the round names (`card-faces.js` for a country, `pol:<slug>` from the card's polity link for a state) — where v1 hit-tested a polygon list and `pointInRings`'d a dated outline; a place by distance; an authored extent with no polity behind it by its own ring, as before. The reveal is a plain panel of the place's cards (a link each; a country: a link to the Atlas) where v1 opened its country panel and card stack. *Not in this stage:* the v1 learn panels (`showCountryPopup`, `showMinePopup`), the pulse ring is a plain ring.

**Task 5 — tests.** *New:* `.claude/test-atlas-embed.js`, **42 ok**: the switch's default and the wire (OFF: no engine request, no WebGL context), twenty windows on one context and the recreate, map cards (the tint solved back out of the centre pixel is the palette's land; the capital's gold square; drag, zoom, home), locators (the river in gold, a tap to `#map2/…`, a region clipped to land), a war in its years and none outside, the go link and the Atlas at that year with the war in focus, Find it (the same five rounds, pick/clear/guess, the km message, a second try counts, a place by distance, the score line, the door, reduced motion), no console errors. `build-card-faces.js --check` and `audit-polity-names.js --check` / `build-polity-names.js --check` joined CI's fast job. *Guards in the Task 1 table:* `test-map-cards.js` (11,307 ok), `test-card-locator.js` (26 ok), `test-war-cards.js` and `test-minigames.js` run on v1 (the default) and pass; their v2 counterparts are `test-atlas-embed.js` §3–§6, which keep the pixel assertions that have an engine meaning (the tint, the dot, the river, the clip, the war's colours) — **not every assertion of those four suites has been rewritten against the engine** (the fit sweep of 51 states, the Alaska antimeridian, the hi-res Italian and Russian frames, the sibling reds with a studied profile are v1 assertions with no v2 twin yet: Stage B's work).

**The gate.** `test-atlas-perf.js` on this tree: the primitive budgets pass (a first run failed Europe 266,782 > 167,000 and the Aegean views because the second face pass I had first applied to the Atlas's own selected face doubled the triangles of a view with a face selected — the gate's tap leaves one; the pass is now the windows' highlight only, and the Atlas page's selected admin-1 state keeps its overlap holes, **reported here, not fixed**); the year change passes; **the pinch rule fails — 3 of 415 gesture frames over 100 ms (0.72 % against 0.5 %), worst 150 ms — and fails identically on an untouched `origin/main` on this runner (3 of 419, worst 166.6 ms, plus the year change at 5.80 ms)**: a property of this session's CPU, not of the change (CI's own runner passed it at the 2d merge). The CI head reading is in the report.

**What contradicts or amends the design.** (1) §7 asks for `app.js` "unchanged or smaller": it is +6,964 bytes in Stage A. (2) Find it is dealt through `atlasRegisterAll` / `availableCardIdSet` (as v1 deals it), not `gameCardIdSet()` / `dayPick()` — v1's Find it never used them; the copy keeps v1's path. (3) The war window changes subject (the year's states, not present-day countries). (4) A tap on a window opens the Atlas (the brief), where a map card was "nothing is clickable": only once revealed.

**Decisions for the owner.** (1) **Stage B — flip the default to the engine and remove v1's window path — yes or no?** It needs the engine's first window (about 4.7 s of worker time on this CPU runner, 3.5 MB cold) judged on a real phone, the v1 assertions without a v2 twin rewritten (listed above), and the answers below. (2) *War windows at the middle year of the war, other states plain, instead of present-day countries shaded* — keep? (3) *A tap on a window opens the Atlas* (a map card only once revealed): a reader mid-session who taps leaves the study page with the browser's Back as the way home — keep, or only the go button? (4) *Rivers: the engine's rank-limited rivers replace rivers.js's 1,073* in the windows; and the card's own river still reads `rivers.js` — accept until Phase 5? (5) *The QIDs of about 40 polities name a different Wikidata item*: a thread of its own? (6) *The Atlas's selected admin-1 state is drawn with holes* (found, not fixed: the fix doubles a view's primitives): fix it with a per-face draw order in the worker instead?

**Not verified.** A real GPU and a real phone (every timing is SwiftShader and a CPU, throttled in the phone profile only by CDP); the look of the windows in the dark and gazette themes (the engine's palette is the Atlas's); `test-war-cards.js`'s "popup keeps the legend" fails here on `origin/main` too (CI passes it); the glossary pin was not re-driven (unchanged since 3c; `test-atlas-study.js` passes); the studied-profile sibling reds and the hi-res frames on the engine; the fortnightly plates' own frames (0b). Screenshots, v1 and v2 at 1100 px and 390 px, are in `docs/atlas-v2-phase4-shots/` (`.claude/atlas-embed-shots.js`).

### Phase 4b — as built (2026-10-13): the engine's card windows made fast, legible and at parity, so that Stage B can be decided

**Scope and status.** The preview switch is **still OFF by default and V1's windows are still the default; Stage B (flipping the default, deleting V1's window path) is NOT done** — it waits for the gates in the table at the end of this note and for the owner's reading of the preview on a phone. **With the switch off nothing a reader of the live site sees changes** (`test-atlas-embed.js` §1 still proves the page requests neither the engine nor `topology.bin` and makes no WebGL context), so **no changelog line and no version bump**. The numbers behind everything below are in `docs/atlas-v2-card-windows.md` ("Phase 4b"), with the screenshots in `docs/atlas-v2-phase4-shots/` (`*-before.png` is `173302b`, `*-after.png` / `*-4b.png` this branch).

**Task 0.** *(0a)* `test-war-cards.js`'s "the popup keeps the legend" read `#cpDesc` in two separate `evaluate`s while the popup body fills after its title; it now waits (15 s) for the legend and reads both conditions in one evaluate, asserting exactly what it asserted. **Whether the app's popup fills later than it used to was NOT measured** (the brief asked for the time to fill on `758ccb8` against current `main`; no pair of figures was recorded, so none is claimed). *(0b)* The CI log of the last push run on `main` (`fe4b4ad`, run 3487) shows exactly the four known suites failing — `test-draw-cards`, `test-personal-atlas`, `test-review-decks`, `test-tour` — and no other, so the `test-war-cards` failure in the brief was a race on the Phase 4 head, not a state of `main`.

**Task 1 and 2 — the baseline and the first window** are in `docs/atlas-v2-card-windows.md` (every figure there is from `.claude/measure-atlas-embed.js`; this note does not repeat them). What did it: the hub is ready at LOD 0 and windows refine as LOD 1 and 2 arrive (the hub used to wait for `done`, 3.5 s of LOD 2); the first level is kept in IndexedDB (`CORE_CACHE_REV`, a hash of the worker, the format reader, earcut and `topology.bin`'s build id, checked by `check-core-cache.js` in CI); the idle warm-up creates the hub; the first frame is drawn at half resolution with no outline pass; history messages run at the worker's next yield instead of after LOD 2. **Targets not met are listed, with the measured limit and the options weighed, in the card-windows file** (direct-load desktop against V1, the phone's warm map card, every war window — the last because of the 9.1 MB history; a *war-window slice* of it, about 1.5 MB, is the lever and is **not built**; nor is a windows-only lite topology). The placeholder rule (a block of its final size within 300 ms, no layout shift, the text never waiting) is met and tested.

**Task 3 — war windows.** Decision 2 implemented: the window **names the two principal sides on the map** (where each side stands in the war's years, the engine's `warSides`) and draws **a one-line legend** from the card's own sides — a swatch in the engine's own victor / loser colour, the card's name for the side, "— victors" / "— defeated", falling back (on a narrow window with long names) to the names alone, then "(approx.)" for an extent. **The owner's example wording "Rome and allies" is NOT used**: nothing in `wars.js` says the extra states the engine tints for a side were *allies* (the Second Sino-Japanese War's two Chinese states are the Republic of China and the Communist-led state: "China and allies" would be wrong), so a side the card names once and the table tints with several states reads "China (2 states)"; a name that already lists its members is left as the card wrote it. **An authored extent stays visibly distinct from a state**: the engine draws it as the soft stippled wash of a presence, never a crisp face, and the legend gives it a hatched swatch. Checked at desktop and phone sizes on the Second Punic War (`rm-209`), the Second Samnite War (`rm-153`: Rome a state, Samnium an extent), the Sicilian Expedition (`gr-552`), the fall of the Shang (`cnh-103`) and the Second Sino-Japanese War (`ww2-096`): before / after in `docs/atlas-v2-phase4-shots/`. **Found on the way:** on `file://` the history twin is still the 2a pilot slice (11 entities), so the war's sides have no faces there — the window used to open on the default frame and tint nothing; `startCardWindow` now keeps V1's window for a war whose sides the loaded history does not carry (**a Stage B blocker for `file://`**, below). `test-atlas-windows.js` §4 and §4b.

**Task 4 — rivers.** **Found on the way, and it is why the Texas window had none: four statements of Phase 4's `atlas-embed.js` `setup()` (`L.rivers = …; L.lakes = …; L.relief = …; L.graticule = …`) sat after a `//` on the same line as the peoples comment, so no window had ever switched rivers or lakes on.** On, at the Atlas's own density for the window's zoom, the engine draws 49 % (Texas), 65 % (the Tiber) and 49 % (Russia) of the kilometres V1 drew in the same view (`.claude/compare-window-rivers.js`; the Atlas thins its rivers by scale rank to keep its frames inside the gate). The owner's rule is that windows are not limited *below* the Atlas, so windows ask for their rivers **one resident water level finer than the Atlas draws at that zoom** (`view.riverLevelBias`): 108 % (Texas) and 107 % (Russia) of V1's kilometres; the Tiber is already at the finest resident level (2) and stays at 65 % — V1 draws a hi-res Italian river file there, Natural Earth's rank set has fewer small Italian rivers. **The price is bytes**: `water.bin` is 4.2 MB, fetched after the land (so not on the first paint's path). The card's own river (`rivers.js`) still draws in gold until Phase 5. Rivers are unnamed (`labelsPlaced` 0). `test-atlas-windows.js` §5 and §7.

**Task 5 — taps and Back.** A tap on a map card opens the Atlas only once the card is revealed (nothing on the unrevealed window names the answer; a map card has no go button at all); the go button on a locator or war window always does. **Back used to lose the card**: `route("map2")` cleared the study record and the browser's Back to `#study` went home. Now `atlas2OpenFromWindow` captures the study session (the card, the queue, whether the answer was showing — `persistStudy` already writes `rev`) as `atlasHold` before routing, the hold survives the trip to `map2`, **the browser's Back resumes it** (`hashchange` to `#study`, only with the switch on) and **the Atlas page shows a "↩ Back" button** (aria "Back to studying") that does the same (the search box steps right to make room). Tested with a seeded session on a map card and on a locator (`test-atlas-windows.js` §2). The button is `H.back`, a host hook: the page offers it only when a window brought the reader.

**Task 6 — the selected-state holes.** Reproduced first: a selected state's interior was only 89–96 % the selection colour on `main` (Texas at 6 km/px 89.2 %, Colorado 95.6 %, Sakha 94.7 %) (the country's triangles, drawn after the state's own bucket, overdraw it — a coarse triangle is filed under its centroid's bucket, so no order *within* a bucket can fix it). Fixed in the worker: the children (admin-1 faces; 173 of the 430 faces) are **a second bucketed list drawn after the parents** (`bucketFaces` → `faceRangeA1`, `drawFaces`), the same two-list layout the admin-1 arcs have; **the second face pass Phase 4 added for windows is gone**. Now 100 % in every view that has a state, selected or highlighted. **Budgets, on the gate's views at 1280×800 with a state selected (`.claude/measure-atlas-holes.js`, main → branch): triangles −0.5 % (globe), −1.4 % (Europe), 0 on the Aegean, the cap, Texas 6 and 1 km/px and Siberia, −11.0 % (Colorado at 3 km/px); segments unchanged on every view; draws +1 … +11. Full table in the card-windows file. The limit was +5 %.** The window-only fix is therefore not needed; `test-atlas-perf.js` (the frame gate) is read from CI below. The faces' order in the ID pass is now deterministic: a tap on a US state returns the state's face, not whichever of the two was drawn last.

**Task 7 — the unported v1 assertions, and the mapping table.** The three V1 window suites now take `FOLIO_ENGINE=v2` (`test-engine-switch.js`) and run **unchanged against the engine's windows**; CI runs both modes. The new `test-atlas-windows.js` has the engine's own: **the fit sweep of all 51 states through the real windows**, **Alaska's antimeridian**, Rhode Island, **the Italian and Russian frames**, **the sibling reds with a studied profile**, plus the placeholder, taps and Back, the holes, the war legend and rivers. `test-atlas-embed.js` gains four Find-it rows (no third try; a country ends on its panel; a state or a place on its cards). **The mapping table of every V1 window assertion to its engine counterpart is in `docs/atlas-v2-card-windows.md`; none is left without one.** What is left are two behaviours, not tests (below).

**Found on the way, besides the above.** (1) *A pending window lost its hub*: the idle warm-up arms a 60 s dispose timer that nothing cancelled while a war window waited for its 9 MB history, so on the phone profile the hub vanished under it and it never settled; a window now holds the hub until it is mounted (`AtlasEmbed.hold`; tested). (2) *The retry storm*: an unsettled window was redrawn every 400 ms; on a CPU ×4 phone this starved the worker's messages for the whole settle; now a 2.5 s safety net behind the hub's own change events. (3) *`autoLinkGlossary` is a multi-second main-thread task on the phone profile* (V1's page pays it too) — not touched. (4) `test-atlas-stages.js` and `test-atlas-fallbacks.js` fail here on timing, identically on an untouched `main` on this runner.

**What contradicts or amends the design or Phase 4's note.** (1) Phase 4's note said rivers were "fewer and thicker" than V1's — the engine drew none (above). (2) §7 asked for `app.js` "unchanged or smaller": it is **3,930,014 bytes — +1,522 over `173302b`'s 3,928,492** (the placeholder `settled()`, the idle warm-up, the hold and Back wiring); Stage B would remove ≈ 84 KB (`startCardGlobeV1`, 1,161 lines) + ≈ 35 KB (v1's Find-it game mode in `PAGES.map`) and make the five `coast/*.js` bundles (1.36 MB, lazy) and `hiresCoastIngest` dead (estimates from the source, not from a build). (3) The owner's example legend wording is not used (Task 3).

**Readiness for Stage B** (the gates of Task 8; the owner has not yet tried the preview on a phone):

| gate | result | evidence |
|---|---|---|
| first window: warm first paint ≥ 3× faster than `173302b` | **partly** — desktop ✓ (6.9× map card, 8.4× locator), war 2.6× ✗; phone map card 2.76× ✗, locator ✓, war 1.05× ✗ | card-windows file, "The Task 2 targets, as measured" |
| first window: cold and warm ≤ 1.5× V1 | **FAIL** when the card is opened at once (9–12× cold, 3–5× warm on desktop, SwiftShader); **met** for the map card after the reader has been on the site 4 s (1.34× cold, 0.97× warm) and on the phone for the map and locator cold; war windows not met anywhere (the 9.1 MB history) | same table; the limit and the options (lite L0, war slice) stated there |
| placeholder of final size within 300 ms, no layout shift, text never waits | **PASS** (17 ms) | `test-atlas-windows.js` §1 |
| war windows name the sides and carry a legend; an extent is distinct from a state | **PASS** (wording differs from the brief's example, decision 2 of the owner list) | §4, §4b; screenshots |
| rivers at the Atlas's density or better | **PASS** (108 % / 65 % / 107 % of V1's length in Texas / the Tiber / Russia; the Tiber is bounded by the resident water levels) | `compare-window-rivers.js`; §5, §7 |
| taps open the Atlas only on a revealed map card; go always; Back returns to the same card | **PASS** | §2 |
| selected-state holes | **PASS** (100 % interior; budgets −11 % … 0 triangles, segments unchanged) | `measure-atlas-holes.js`; §3 |
| mapping of every V1 window test to the engine | **PASS** — none without a counterpart; two behaviours (`file://` war windows, Find it's learn panels) are Stage B blockers, not tests | card-windows file |
| every Atlas suite green | **PASS here** for `test-atlas-embed` (all), `-windows` (67), `-render`, `-study`, `-places`, `test-minigames`, `test-csp`, `test-war-sides`, and the three window suites in both modes; `test-atlas-stages` and `-fallbacks` fail on this runner on timing, identically on untouched `main`; CI's reading below | CI run 3526 (head `86fc17a`): the Playwright job failed in exactly the four known suites (`test-draw-cards`, `test-personal-atlas`, `test-review-decks`, `test-tour`) and no other; the run on the head with the last code commit (`ffd7b2d`) was still going when this was written |
| frame gate (`test-atlas-perf.js`) | **PASS** on `86fc17a` (run 3526, job "Atlas v2 frame gate"); the later commit adds a river-level bias that only the embedded hub sets; re-read the final head's run (3528) | CI job |
| `test-deck-lazy.js`, `check-sizes.js`, `check-core-cache.js` | **PASS** | run on the final tree |
| `app.js` ≤ 3,928,492 B | **FAIL by 1,522 B** (3,930,014): the placeholder `settled()`, the idle warm-up, the hold and Back wiring. Stage B removes ≈ 84 KB (`startCardGlobeV1`) + ≈ 35 KB (v1's Find-it mode) and makes the five `coast/*.js` (1.36 MB, lazy) dead — estimates from the source, not a build | `wc -c app.js` |
| owner has tried the preview on a phone | **not yet** | steps below |

**Verdict: Stage B is not ready.** Open: the cold first-window ratios, the war windows' history cost, `file://` war windows, Find it's learn panels, the real-GPU and real-phone check.

**To try the preview on a phone.** (1) Open `https://folio.study/#map2?preview=1` once on the phone (this turns the per-viewer switch on in that browser; open `#map2` and clear the site data, or run `localStorage.removeItem("folio.atlas2.preview")`, to turn it off). (2) Study or open these three cards and look at the window: **`geo-002`** (a state map card — rivers, the state's tint, tap after revealing), **`rm-003`** (a locator — rivers and the go button, then Back), **`rm-209`** (the Second Punic War — the names on the map and the one-line legend; it waits for the 9 MB history, so give it up to a minute on a slow connection the first time). (3) Check on each: how long until the map appears, whether the page jumps, and that Back from the Atlas returns to the same card. This build is on the branch only until it is merged; merging deploys it, with the switch still off for everyone else.

**Decisions for the owner.** (1) *Stage B* — not yet: the table says what is open. (2) *"and allies" in the legend* — replaced by the card's own name and "(N states)"; say if you want the other wording and where the data for it should come from. (3) *Rivers one level finer in windows* (V1's length, +4.2 MB after the first paint): keep, or the Atlas's own thinner density (about half of V1's length, same bytes)? (4) *Cold start on a real phone*: the lite L0 topology and the war-window history slice are the two builds that change the cold ratio to V1; they are separate tasks — build them before Stage B, or accept the cold first window as it is? (5) *`file://`*: a war window needs the engine's history, and the twin on `file://` is a pilot slice — Stage B either regenerates the twin or keeps a minimal fallback for war windows. (6) *Find it's v1 learn panels* (`showCountryPopup`, `showMinePopup`) are not on the engine's board; the board's round ends on a plain panel of the place's cards.

**Not verified.** A real GPU and a real phone (every figure is SwiftShader and CDP throttling that does not slow the worker); the new legend and the "↩ Back" button in the dark and gazette themes; `file://` beyond the war-window fallback; the engine's windows on Safari and Firefox (WebGL2 only; the engine falls back to V1 when it cannot start); a real study session beyond the seeded ones.

**The QID audit (2026-10-13, after task 0c).** The 63 name disagreements hid a worse fault: on 29 (series, Wikidata, Wikipedia) pairs Cliopatria's own fields name a different thing (Rome → the 1798 Roman Republic, Han dynasty → Chauhan, Numidia → the man Jugurtha, Sumer → "History of Sumer"). Of the 165 entities with a QID (157 polities, 8 peoples): **26 corrected** (29 pairs, three of them the secondary "Also in the source" pairs), **3 unresolved** (Athenian Coalition → a war, Chinese Communist base areas → a political party, Gothia → a disambiguation page: no unambiguous replacement), 136 unchanged — 3 of them right items the check lets through with a reason (Palmyra's dates, the Etruscan and Mycenaean civilizations) and 8 doubtful, listed for the owner. The table (each item's label, description, class, dates, the evidence, the candidates of the unresolved) is `docs/atlas-v2-polity-qids.md`, generated. A fix is written only where the right item is unambiguous: Cliopatria's own Wikipedia title is the English sitelink of exactly one item (`title`, 16), or its title is unusable and exactly one item with a polity class and dates over the span carries the polity's name or alias (`label`, 10, each with a note). **Where it lives:** `.claude/atlas-build/polity-qids.json` `fixes`, applied in `build-history.js` at the row (`prepareRow`; a fix matching no row stops the build) — `polity-spec.json` holds no QIDs. **The check** (`audit-polity-names.js --check`, in CI, offline against `polity-qids-wikidata.json`, a Wikidata cache of 207 items) fails when an entity's item has dates that reach 1 July of no year of its span, or a class that is not a polity (a people may also be an ethnic group or region), unless `allow`ed with a reason; an allow that no longer fires fails too; it also proves history.bin carries every fix. Against the old header the rules alone caught 21 of the 26 wrong items; Wiman Joseon → Gojoseon, Sasanian → Indo-Sassanids, Polotsk → the city, Yugoslavia → the SFR and Safavid → the dynasty pass both rules and were found only by label and title. **Downstream:** `history.bin` changed in its JSON header only (the 8,405,601 bytes of body are identical, built fresh; its twin and `polity-index.js` follow: 26 QIDs); the place card's "Wikipedia:" link changes for 11 polities and "Also in the source" for 5; six `places-spec.json` rows (Byzantine Empire, Han dynasty, Principality of Polotsk, Qin, Roman Republic, Sumer — 769 → 763) became duplicates of entities by QID, were deleted, and the 8 cards that carried them now carry the entity id only (`migrate-places.js`, `card-places.js`, the report). Unchanged: every polity name and period capital (neither comes from the QID), `polity-names.js`, `credits.js`, `wars.js`, `card-faces.js`, `glossary-places.js`, all geometry. **Found on the way:** a rebuild that replays `out/history-cache/` is not byte-identical to a fresh one (97 `arcFlags` bytes and the `faces` section differ, with the unmodified script); the fresh build reproduces the committed file. **Decisions for the owner:** (1) the 3 unresolved keep their wrong link until chosen — leave them, or drop their QID and title so the card shows no link (recommended); (2) Dai Viet (Ngô dynasty, 27 of 460 years, vs Q430309), Israel (united monarchy vs Samaria), and whether South Africa, Austria and Hungary should point at their dated historical-state items (Q193619, Q518101, Q600018) as the name overrides already do for the label; (3) Seleucid and Safavid were corrected on class (the ruling family → the state), not on dates — confirm; (4) Rome stays one entity on the Republic's item for a span that runs to 475 (the Empire is a secondary pair). **Not verified:** the rendered place card (no browser suite was run); a year-level date test (Wikidata's BCE years are astronomical, Cliopatria's a year off at most); that Wikidata and the sitelinks still say this tomorrow.

### Phase 4c — as built (2026-10-13): the gaps Stage B depended on

**Scope and status.** The preview switch is **still OFF by default and V1's windows and Find it are still the default; Stage B's flip (Part 2) is NOT done** — it starts only on the owner's "Stage B go". With the switch off a reader of the live site sees nothing different (the engine, the slice and every window change are behind the switch; the Atlas page `#map2` is unlinked), so **no changelog line and no version bump**. New data: `atlas/data/history-wars.bin` and its twin (read only by a war window with the switch on). `app.js` is **3,930,319 B (+305 over 4b's 3,930,014)**. The tables are in `docs/atlas-v2-card-windows.md` ("Phase 4c"); the shots are `docs/atlas-v2-phase4-shots/*-4c-before.png` / `-4c-after.png` and `findit-learn-*`.

**Task 0.** *(0a) Labels clipped by the frame and run under the chrome — the cause.* The layout (`atlas-worker.js`) has always kept every label wholly inside the frame and off every control, **but it runs only when the view settles**. While the map moves, `drawLabels` drew each label at its layout position plus the pan since (`p.sx` → the anchor's present place), with no check — so "Lille" slid past the left edge as "ille", "Strasbourg" past the right as "Strasbour", "Vosges Mountains" as "SGES MOUNTAINS", and "Essen" under the "?" button, "Groningen" under the search box, until the next layout landed (a settled view was always right: the Benelux view at 390 px in the dark theme has 19 labels, none clipped, none under a control — read from the layout and from a screenshot). Fixed where the fault is: `labelFits` applies the layout's own rule — the label's rectangles at their CURRENT place wholly inside the frame and clear of every chrome rectangle of the last layout (`L.chrome`, set by `sendLayout`) — and a label that fails is not drawn that frame and cannot be tapped; the next layout brings the right ones back. **The new cases fail without the fix and pass with it:** `test-atlas-labels.js` §11 and `test-atlas-phone.js` — six touch drags (±90 px, ±120 px, two diagonals) over the Benelux and Berlin views, every live label read mid-gesture and at release before the layout the release asks for, light and dark theme, 360 and 390 px: without the fix "Lille leaves the frame", "Brussels", "Bruges", "Frankfurt", "Zurich" … in all eight label cases; with it 0 of 300–600 live labels per case (labels suite 197 ok, phone suite 82 ok at 360×640 and 390×844). *(0b) CI.* Main's merge commit **9cd5e65 (PR #462), run 3532 — completed, not cancelled**: the fast job green, **the frame gate green**, the Playwright job red in **five** suites: the four known (`test-draw-cards`, `test-personal-atlas`, `test-review-decks`, `test-tour`) **and `test-units.js`** — one assertion, "every measurement-looking bracket is one the engine RECOGNISES: 1 unseen: gloss:Nord_Stream_2 (1.9 to 3.9 trillion cubic feet)", a glossary term PR #461 added (content, not Atlas; not touched). Every Atlas suite passed in that run, including `test-atlas-stages` and `-fallbacks`, which fail locally on timing here. **On my head: run 3534 (first push, `6efc832`) was CANCELLED by my next push** (the workflow cancels in-progress runs on a branch: `cancel-in-progress` is true off main). **Run 3535 (`05cc236`, every line of code of the final head; only docs follow it) ran to the end:** the fast job green (`build-war-slice --check` included), the frame gate green (a year change 1.80 ms over 175 changes and 1.10 ms over the whole rail at p95; the drag and the pinch 0 frames over 100 ms), and the Playwright job red in exactly five suites — **the same five as main: the four known and `test-units.js`**; `test-atlas-embed`, `-windows` (with `file://`) and `test-findit-learn` PASS. The run of the final docs head is read in the report. *(0c) The war-card popup's fill.* Measured on this runner, five runs each, the v1 Personal Atlas on the Second Punic War: the popup's title at ≈ 0.27 s and the legend (`.war-key` in `#cpDesc`) at **1.10 s median before Phase 4 (`4da78dd`, the commit before `eaae980`; title → legend gap 833 ms) and 1.14 s now (878 ms)** — **Phase 4 did not make it slower** (+36 ms, inside the 0.98–1.28 s spread); the ≈ 1 s gap is the lazy bundles the card's tiles wait for and predates the engine. *(0d) Year change.* A CPU profile and per-phase timers of a scrub found the cost in the **non-drag** year changes (a step, a jump, the pin's release: 13 of 172 changes in a scrub, every one of them the p95's tail): `requestLayout("year", true)` measured the controls (`chromeRects`) straight after `applyYear` had written the rail's pin and year, so the browser laid the page out again inside the call (**1.4–2.2 ms against 0.2 ms on a clean page**), and `writeHash`'s `replaceState` cost 0.8 ms. Both now wait for the next frame (`yearFlushLater`: one request per frame, a 120 ms timer behind it for a hidden tab). Same harness, three paired runs, the gate's own reading of a five-scrub run: **p95 3.0 / 3.3 / 3.8 ms before, 2.1 / 2.0 / 2.1 ms after** (median 0.5 ms either way). Honest limit: the forced layout is the browser's own work and is still paid — once per frame, in the frame's own layout step — it is no longer inside the timed call; the noise floor of this runner for the call itself is ≈ 2 ms.

**Task 1 — the legend and the rivers.** *Legend (decision 1):* the card's own name for the side, verbatim, then the count the table can vouch for — **"China · 2 states — victors"** — wherever the table draws more than one state for a side (including a name that lists its members: the count stays honest if the table has fewer); never "allies" (`test-atlas-windows.js` §4 asserts it on every war). The words "— victors / — defeated" are the card's roles and stay while they fit. *Rivers (decision 2):* the default is the Atlas's own density for the window's zoom (Texas **17,371 km = 0.49 × V1's 35,542**, 4b's one-level-finer-everywhere was 38,305 = 1.08 ×); a card whose subject is water (a river or sea locator, a point locator named lake / bay / gulf / strait / channel / sea / river — **a name heuristic**: 14 of the 1,652 point locators — Lake Toba, the Gulf of Tarentum, the Strait of Hormuz, Hakata Bay … and a few false friends, a site called "Mal'ta, Belaya River", a dry lake bed — plus the 5 river and 1 sea locators) gets the finer level (Lake Toba 23,476 km = 1.20 ×, unchanged; the Tiber is already at the finest resident level, 2,595 km = 0.65 ×; the Aegean 2,079 km = 0.46 ×); **bytes are unchanged — the coarse and the fine level are one file (`water.bin`, 4,355,748 B, 3,007,783 gzipped)**, so "never fetched under saveData / light mode" is implemented as *the file is not fetched there*: a window under the data saver draws no rivers or lakes (the card's own gold river from `rivers.js` still draws). Screenshots before / after at desktop and phone: rm-209, rm-153 (an authored extent: Samnium), ww2-096, geo-002, rm-003 (river), wh-064 (lake).

**Task 2 — the war-window slice (decision 3).** `.claude/atlas-build/build-war-slice.js` cuts `atlas/data/history-wars.bin` from the committed `history.bin` (through `lib/history-model.js`, whose round trip of the 9.1 MB file is byte-identical — `--roundtrip`) and writes its own `file://` twin: **1,755,600 B (19.3 % of 9,096,400; 646,819 gzipped against 2,431,916)** — 148 of 233 entities, 587 of 3,159 steps, 572 of 3,043 faces, 34,091 of 102,443 arcs, 104,303 of 473,340 vertices. It keeps every state alive in each war's display year (the middle of its years, the one `atlas-windows.js` uses) except the presence layer and the front, and every step over the war's years of each side's entities (the frame and the names read the first of them). **The subtle part, found by the checker:** an own arc's endpoint is moved onto a coarser level's coast by a junction that another arc of the file supplies, found by position (`historyJunctions`), so 286 arcs are kept for a junction only — without them Pontus's faces differ at the coarse levels (a cut without them fails the proof). `--check` (CI's fast job) rebuilds the slice from the committed file, proves **856 state faces and 432 side steps equal the full file's at all three levels**, verifies the twin and the header (same core build id, same `sources`, `history.slice: "wars"`), and holds the budgets (slice 2.5 MB; the four twins 13.5 MB). `build-credits.js` lists it; the credits check passes. **Wiring:** `atlas.js` `startHistory(kind)` — "wars" reads the slice, anything else the whole file — the kind of the first request is the file's; `atlas-embed.js` recreates a hub that began on the slice when Find it needs the whole history (`ensure({ needHistory: "full" })`) and prunes windows whose canvas has left the page (**found by the test: nothing called `stop()` on a card page's windows, so a hub that had served a card never looked idle**), and a window of any other year never draws from the slice. **`file://` war windows work** (`test-atlas-windows.js` §9: Chromium on a `file://` page, the engine's window, Rome and Carthage named, both sides tinted, `history-wars.bin.js` read and the pilot twin not). Numbers, rm-209, this runner, 4b → 4c: desktop cold **2,387 → 1,640 ms**, warm **2,112 → 1,299 ms**; phone cold **69.2 → 19.4 s** (V1 38.0 s), warm **90.5 → 2.6 s** (V1 0.5 s); bytes served cold 12,972 → 5,809 KB. **The four `file://` twins together are 13.25 MB, past the owner's Phase 1d rule of 12 MB for the three that then existed** — a decision for him (below).

**Task 3 — Find it's learn panel (decision 5).** `atlas-windows.js` `revealPanel`: the place's name, "New discovery!" (the `placesSeen` register, as v1's country panel wrote it, silent in a game), a country's prose (v1's `stripInfoNoise` through `sanitizeHTML` — **found by the screenshot: the prose carries `<b>` and printed as text before**), a state's year, **the place card's list of cards** (`AtlasStudy.cardsFor` over the round's own cards: the reader's own first, the cap of 8 and "and N more", the collection chip, "studied", each a link to `#card/<id>`), a Next button in the panel, a close button and Escape; the head and the buttons stay while the body scrolls, so a long country description never hides Next. `atlas2Ctx()` gained `study` (the same host object the Atlas page hands the controller, now `atlas2StudyHost()`) and `sanitizeHTML`. **`.claude/test-findit-learn.js` plays one seeded day on v1's board and on the engine's** (the same driver, a grid of taps until one lands, Guess, a second try) **and reads the panel at the end of each of the five rounds: 46 ok** — the questions are v1's, the name is v1's (the full official name aside: "Russia" for "Russian Federation"), the chip shows exactly when v1's did, the prose is v1's (1,885 characters for v1's 1,893 on Russia, 554 / 554 on Libya), the cards listed are v1's stack's count and the round's own, each a link, Next in the panel really moves on (and Next under the question still does), the close button and Escape put it away, twelve cards cap at 8 with "and 4 more" and grow, and on a 390 px phone the panel sits inside the screen with Next 44 px tall. **Not rebuilt: v1's figures grid and sources fold on a country, the full official name, and swiping through a card's answer inside the popup.**

**Task 4 — Stage B readiness, updated** (the rows of 4b's table, re-measured on this tree; ✓ passes, ✗ does not):

| gate | result | evidence |
|---|---|---|
| warm first paint ≥ 3× faster than `173302b` | **✓ everywhere** — desktop 8.6× / 7.9× / 5.5× (map card / locator / war), phone 4.0× / 3.7× / 39.8× (4b: war 2.6× and 1.05×, map card 2.76× ✗) | card-windows file, "The first window again" |
| cold and warm ≤ 1.5× V1 | **partly ✗** — cold: the phone at once ✓ for all three (0.96× / 0.12× / 0.52×); desktop after the idle warm-up ✓ for the map card only (1.02×; locator 3.2×, war 2.6×); desktop at once ✗ (5.9–13.6×). Warm: map card after idle ✓ (1.1× desktop, 0.65× phone), locator ✓ on the phone after idle (1.5×), war ✗ everywhere (2.3× after idle) | same; the floor is a WebGL2 context, the shaders and a software rasteriser against V1's 2D canvas; the lite first-level topology is **not built** (owner's decision 4) |
| placeholder of final size within 300 ms, no layout shift, text never waits | **✓** | `test-atlas-windows.js` §1 |
| war windows name the sides and carry a legend; an extent is distinct | **✓**, in the owner's wording ("China · 2 states") | §4, six wars at desktop and phone |
| rivers | **✓** at the Atlas's density by default, finer for water cards, none under the data saver | §5; `compare-window-rivers.js` |
| taps, go, Back | **✓** | §2 |
| selected-state holes | **✓** | §3 |
| mapping of every V1 window assertion to the engine | **✓**, and **both 4b blockers are now closed: `file://` war windows (the slice; §9) and Find it's learn panels (`test-findit-learn.js`)** | card-windows file |
| **new:** labels whole and clear of the controls while the map moves | **✓** | `test-atlas-labels.js` §11 (fails without the fix), `test-atlas-phone.js` |
| **new:** the war-window slice | **✓** 1.76 MB of 9.10 MB, proof against the full file at three levels in CI; **the twins' total (13.25 MB) is past the owner's 12 MB rule — decision** | `build-war-slice.js --check` |
| **new:** Find it's learn panel | **✓** 46 ok | `test-findit-learn.js` |
| **new:** `file://` | **✓** a war window and the engine's windows on a `file://` page | §9 |
| year change ≤ 5 ms at p95 | **✓** 2.0–2.1 ms (was 3.0–3.8 in the same harness) | 0d |
| every Atlas suite green | **✓ here** — `test-map-cards` 11,307 / 11,296 (V1 / engine), `test-card-locator` 26 / 14, `test-war-cards` 57 / 57, `test-minigames` 126, `test-deck-lazy` 27, `test-csp` 0 violations, `test-war-sides` 15, `-render` 72, `-study` 125, `-places` 19, `-labels` 197, `-windows` 98, `-embed` 46, `-findit-learn` 46, `-phone` 82 (360×640, 390×844), `-time` 81, `-session` 8, `-search` 18; `check-core-cache`, `check-credits`, `build-war-slice --check`, `check-docs` pass | the report has CI's reading of the head |
| frame gate (`test-atlas-perf.js`) | **✓ locally, 0 failures in 126 checks**: a year change 2.30 ms (175 changes) and 1.80 ms (the whole rail, 427 changes) at p95 against the 5 ms rule; the drag's frames over 100 ms 0 of 1,273 (0.00 %); the primitive budgets pass. CI's reading of the final head is in the report | local run of 2026-10-13 |
| `check-sizes.js` / `test-deck-lazy.js` / eager path | **✓** (no `atlas/` file on the eager path) | |
| `app.js` | 3,930,319 B (+305 over 4b): **Part 2 deletes next to nothing from it** — the fallback (no WebGL2, a refused bundle, `#map2?preview=0`) must keep v1's window and Find it until Phase 5 | the next section |
| the owner has tried the preview on a phone | **not yet** | 4b's steps still apply (`geo-002`, `rm-003`, `rm-209`, and now Find it with the switch on) |

**What Part 2 would do, and what it would delete.** It would flip the default for windows, Find it and the study Back to the engine, with the per-viewer way back being the switch's inverse — `localStorage["folio.atlas2.preview"]="0"` or `#map2?preview=0` — for one release, leaving the glossary pin (which CLAUDE.md says must not be wired on before Phase 5) on the "1" switch alone, and add one plain changelog line and a version bump (the first reader-visible change of the Atlas v2 build). **It deletes next to nothing from `app.js` (≈ 0.3 KB of gating, replaced by ≈ the same)**, because the no-WebGL2 / refused-bundle fallback IS v1's window and v1's Find it: what **stays** until Phase 5 replaces it with the engine's Canvas 2D path is `startCardGlobeV1` (86,543 B), Find it's game mode in `PAGES.map` (`finditPools` … `gameEnd`, ≈ 24.6 KB, and `drawGameMarks`, 4.9 KB), `hiresCoastIngest` / `hiresRiverIngest` (2,122 B) and the `CMAP_*` tables, and the lazy data they read (the five `coast/*.js`, 1,367,513 B, and `rivers/greece.js` / `italy.js`, 138,966 B). 4b's estimate of ≈ 84 KB + ≈ 35 KB is what **Phase 5** deletes, not Part 2.

**What contradicts or amends 4b's note.** (1) 4b's "rivers one level finer everywhere" is replaced by the Atlas's density, finer for water cards. (2) 4b's "(2 states)" is "· 2 states". (3) The slice was 4b's "largest single lever left": built, ≈ 1.76 MB not 1.5 MB. (4) "On `file://` a war window keeps V1's window" no longer holds with the slice present (it still does if the slice fails to load).

**Decisions for the owner.** (1) **The `file://` twins total 13.25 MB against your Phase 1d 12 MB rule for the three that then existed** — the slice's own twin is 2.35 MB: accept (the checker holds 13.5 MB), or drop the 1.06 MB pilot twin (`history.bin.js`, the Atlas page's `file://` history), or shrink the slice (only the plain neighbouring states can go, which changes what a war window draws)? (2) **The water file is now the largest piece of a map card's or locator's first window** (4,355,748 B, 3.0 MB gzipped; V1's whole map card is 1.15 MB gzipped): a coarse-only water file (a "lite water") is the lever and is **not built** — build it before Stage B, or accept? (3) **Part 2 deletes almost nothing from `app.js` until Phase 5**: still go, or wait for Phase 5 and flip once? (4) The water-subject test is a name heuristic (a locator of kind river or sea, or a point locator whose name has lake / bay / gulf / strait / channel / sea / river in it): add a `water: true` flag to the cards that want it, or accept? (5) Learn panel: accept one tap to a card where v1 swiped through its answers, and no figures grid or sources fold on a country? (6) `test-units.js` has been red on main since the Special courses' glossary PR (a measurement bracket in `gloss:Nord_Stream_2`): a content thread. (7) The 2.9–4.0 ms of cold first paint that remains for a locator after the idle warm-up (the water file and the finest level) and the war window's parse: acceptable, or the lite topology after all?

**Not verified.** A real GPU and a real phone (every timing is SwiftShader and CDP throttling that does not slow the worker, one run per phone figure); the dark and gazette themes of the new legend and the learn panel (the learn panel was shot in the light theme only); the engine's windows on Safari and Firefox (WebGL2 only; the engine falls back to V1); a real study session beyond the seeded ones; the label fix on a real finger (CDP touch drags only); the learn panel with a reader who has studied cards (the seeded day's five places each had one card and none studied; the "studied" tick and the cap are covered by the twelve-card case with no profile).

### Stage B — as built (2026-10-14): the engine's card windows and Find it are the default

**Scope and status.** The owner's "Stage B go" (2026-10-14), with two items first. **The default is now the engine's windows and the engine's Find it**; v1's window and v1's Find it are the fallback (no WebGL2, a refused bundle) and the way back (`#map2?preview=0`, kept for one release), until Phase 5 replaces them with the engine's Canvas 2D path. **Reader-facing, so one changelog line and the version bump: `1.1003`, `released` `2026-10-14T06:30Z` captured with `date -u`.** Accepted by the owner: the learn panel without the figures grid, sources fold, official name and swiping; the `file://` twins' 13.25 MB until Phase 5.

**Item 1 — water-subject windows from the registry.** `build-card-faces.js` now writes `ATLAS_CARD_FACES.water` — the locator cards whose window gets the finer water level — from the places registry's kind for the locator's place (`river`, `lake`, `sea`, `ocean`, `strait`, `gulf` — the registry's word for a bay), the place being the card's own `places` id whose name or alias is the locator's name, else its first; the window reads the list and carries no name test (`atlas-windows.js` `isWaterSubject`). **A name is read only for a locator with no resolved place: 287 of the 2,015 locators have none; of those 2 are river or sea locators by their own declared kind (gr-741, rm-836) and 5 use the NAME FALLBACK — rm-043 (Gulf of Tarentum), rm-999 (Lucrine Lake), wh-092 (Torres Strait land bridge), wh-094 (Lake Mungo lunette), wh-744 (Black River).** In all 30 cards: 23 by the registry (the Tiber, the Nile, the Weser, Lake Toba, Lake Copais, the Aegean, the Dardanelles, the Hellespont, the Taiwan Strait, Hakata Bay …), 2 declared, 5 by name. The two false friends of the name test are out (Mal'ta, Belaya River is a site; Causeway Bay a town). **Found, not fixed: the registry classes Runnymede (`pl:q1483542`, wh-513) as `sea`**, so its window gets the finer water level (harmless — the Thames is the subject — but a registry fault for `places-spec.json`'s thread). `test-atlas-windows.js` §5 asserts the list's shape and the bias on a false friend (0) and on a name-fallback card (1).

**Item 2 — the idle warm-up and the connection.** `onCellular()` (`navigator.connection.type === "cellular"`, where the browser reports it — Chromium on Android; Safari and Firefox do not, and are not held back) joins the save-data hint and light mode: the warm-up (the engine's code, `topology.bin`, the hub, the card-faces join) does not run, and the first window pays when a reader opens one. **`water.bin` was never part of the warm-up** — a window asks for it after its land is on the screen. `test-atlas-windows.js` §10: the control warms; cellular, save-data and light mode fetch no engine code, no `topology.bin`, no `water.bin`; wifi and a browser with no connection API warm as before; a cellular reader's window is still the engine's.

**Part 2 — the flip.** `atlas2Engine()` (app.js): the engine unless `localStorage["folio.atlas2.preview"]` is `"0"`; five call sites moved to it (the dispatcher `startCardGlobe`, Find it's door, the warm-up, the study Back, the link out of a window); **the glossary pin keeps the strict `"1"` rule** (`atlas2Preview()`, CLAUDE.md: not before Phase 5). `#map2?preview=0` stores `"0"` and `#map2?preview=1` stores `"1"`. **Found by the test and fixed: typed into a tab that is already open the address is a hashchange, `route()` rewrites it to `#map2`, and the page's handler never saw the query — the way back only worked on a fresh load**; `atlas2ApplyPreviewHash()` now reads it at the start of the hashchange handler too. **Found by the suites, fixed: with the engine on by default the idle warm-up created a hub on the engine's own Atlas page too, whose hidden controls matched `test-atlas-study`'s, `-a11y`'s and `-review`'s selectors (and held a second copy of the topology) — the warm-up now skips `#map2`, and the page releases an idle hub when it mounts.** **v1's fallback is kept and tested**: with no WebGL2 the default hub cannot start, the card window takes over as v1's (ready, not failed) and Find it plays v1's board (`test-atlas-embed.js` §1), and with `"0"` the page makes no engine request and no WebGL context even at idle. **What it deletes from `app.js`: nothing but five gates** — `app.js` is 3,932,404 B (+2,085 over 3,930,319: `atlas2Engine`, `onCellular`, `atlas2ApplyPreviewHash` and their comments); the 86 KB `startCardGlobeV1`, ≈ 30 KB of v1's Find-it mode and the lazy coast and river files stay as the fallback until Phase 5. **Tests re-pointed:** `test-engine-switch.js` now runs the three V1 window suites on the engine by default and on v1's windows with `FOLIO_ENGINE=v1` (CI runs both: `.github/workflows/checks.yml`); `test-minigames.js` pins v1's board with the switch at `"0"` in every context; `test-atlas-embed.js` §1 is rewritten for the new default; the measuring and screenshot tools set `"0"` for v1.

**Local reading of the whole browser set (67 suites, three at a time, then the failures serially, on this runner):** every suite passes except the four known (`test-draw-cards`, `test-tour`, `test-units`; `test-personal-atlas` passed here) and three that fail identically on untouched main on this runner — `test-video` (a CSP refusal of a Vimeo script in this sandbox), `test-atlas-fallbacks` (a main-thread task over 150 ms) and `test-atlas-stages` (intermittent timing; failed on main too). The suites that guard the flip: `test-atlas-embed`, `-windows` (including §9 `file://`, §10 the connection rule), `test-findit-learn`, `test-minigames` (v1's board, switch `"0"`), `test-map-cards` / `test-card-locator` / `test-war-cards` on the engine (default) and on v1 (`FOLIO_ENGINE=v1`), `test-csp`, `test-deck-lazy` — see the report for the last run.

### Stacks removed — as built (2026-10-14): every place and every polity the study layer flags is its own mark

**The owner's decision, made and implemented, not reopened:** a number standing in for nearby places is gone. There is no clustering and no count badge anywhere — Personal Atlas or Full Atlas, at any zoom — and no setting brings it back. `#map2` is unlinked until Phase 5 and `app.js` is untouched, so **nothing a reader of the live site can see changes: no changelog line, no version bump** (CLAUDE.md's rule is for changes that reach readers). Phase 3b's stacks paragraph above is marked superseded.

**What changed.** *`atlas/study.js`*: `cluster` is gone; in its place the pure arithmetic of a mark that is always one place — `markHalf(kmpp)` (the half-extent in CSS px, outline included: 2 px, a dot 4 px across, from 16 km/px outwards, rising on a log scale to 8 px, the old 16 px, at 1.5 km/px and nearer, never shrinking as the reader zooms in), `markShape` (a **diamond** for a settlement, a site and every other kind of place, a **triangle** for a mountain, a hill — the smaller one, `markScale` 0.75 — and a cape, a **disc** for a polity, a people, a culture or an authored extent: the three shapes the layer always had, the disc now meaning a polity instead of a count), `markLayer` (the draw order: places not studied 0, places studied 1, polities 2), `nearMarks` (the marks within a finger of a tap, nearest first) and `fanOut` (the fan's arithmetic, below). *`atlas-worker.js`*: the study pass no longer clusters. It lists **a mark for every flagged id that has a position** — a point place or a `places.js` area from the study rows, a gazetteer area (a country, a province, a sea, a river …) from its anchor, a polity at the anchor of its largest face on screen in the year — except what the year excludes (a present-day city, country or province in a year before the present, a polity outside its years: it has no position then, and `front` entities have no face), and posts the list with the labels (`marks`, unit vectors, one entry per id). It also places the **names** the study layer owns, beside their marks. *`atlas.js`*: the page projects every mark **every frame** (so a mark is at its true place and sized for the zoom of the moment during any gesture) and draws them as a handful of paths — one fill and one stroke per group of (layer, own or others', shape) — under the names; a mark that would lie past the frame's edge or under a control (the `L.chrome` rectangles of the last layout, measured again by a `ResizeObserver` whenever a control changes size — the study panel growing its chips left marks under it before that) is not drawn in that frame and cannot be tapped; the selected mark is drawn last and larger. The `stack` marker kind, `STACK_PX`, `expandStack`, the "N places here, activate to zoom in" button and the study use of the cycling chip are removed.

**Marks and names (task 2).** The label engine's rule is unchanged — a name is drawn only when it fits and clears higher-priority names and marks, and the controls — but marks are no longer all hard ground. The reader's own marks (flag 2) take their ground (`take`) before any ordinary name, so nothing is laid over them; the others' marks (flag 1) are **soft**: an ordinary name (a city, a sea, a country that is not flagged) may lie over a small dot, because a hard obstacle per place would blank the Full Atlas (1,303 places, 191 polities), while a study name clears every mark of higher priority than its own (`softFree`). A flagged area's or polity's name stands just above its mark (below, then over it where the mark is soft and there is no other room). **One latent fault found on the way and fixed:** a study point's name was placed 2 px from its own mark, inside the 4 px pad every two names need, so at the default density it never fitted — of 32 single marks in the Aegean only 3 had a name — and the names counted below rise for that reason, not because marks stopped blocking; the gap is now the mark's size plus the pad. Measured in the Full Atlas by `.claude/measure-study-marks.js` (names placed: before → after; the plain Map's counts are unchanged, 50, 42 and 43): **the Aegean at 6 km/px 43 → 125** (116 of them the study layer's), **Rome at 6 km/px 36 → 133** (123), **the Benelux at city scale 1.5 km/px 35 → 75** (51); the globe 22 → 76, Europe at 6 km/px 39 → 140, Rome at city scale 23 → 61. The ordinary names the study layer's own take ground from fall (Europe 14 → 9, the Aegean 17 → 9, the globe 6 → 2): those are the unflagged cities and seas losing ground to the reader's places' names, which have always outranked them (score −300 against 0 and up), and the plain Map is untouched.

**Tapping where marks overlap (task 3).** A tap picks the **nearest mark within a finger — 22 px on a phone (touch), 12 px with a mouse**; one mark in reach is picked at once and its card opens as before (and the layered "N here" chip, a different thing, does not appear). Where more than one lies within reach — or several share one exact point, as a site and a region do at 44.58 E 33.09 N — the group **fans out radially around the tap point**: each member at its true position (the mark already drawn) joined to a copy of itself on a circle by a thin line, with its name beside the copy, copies in the order of the members' own bearings from the tap so the lines do not cross. `fanOut` turns and widens the circle, and narrows it to three quarters, a half or a quarter, until every copy and name lies wholly in the frame, off every control and clear of the others (a phone tap with up to six members found room in 98 % of 128 random cases against a 390 × 700 frame with the panel, the zoom stack and the rail in it). **At most 14 members are fanned, the nearest** — a ring of fifty is not a choice — so in a crowd of more the rest are for a closer zoom. The next tap on a copy or its name picks that mark (card opens, fan closes); a tap on empty ground, **Escape**, any selection, or any move of the view closes the fan, and a tap that lands on empty ground does nothing more. No count and no cycling chip; the announcement is "Choose one: A, B, C".

**Keyboard and screen readers (task 4).** The hidden list is one button per **drawn mark** and per placed name, best first (a mark whose name is placed is one button), capped at 60 as the labels' list always was; "N places here, activate to zoom in" is gone; focus handling, Enter and Escape are as before (the list's label buttons are still one per placed label — a river named on several stretches has several).

**The frame gate (task 5).** `test-atlas-perf.js` asserts the owner's worst-frame rule (at most 0.5 % of gesture frames over 100 ms, none over 200 ms) for the **drag and the pinch with the Full Atlas on at the widest view** (their gesture frames read together, and none over 200 ms on its own — see below), over the same three repeats, and a **mark budget per fixed view** (the marks drawn in a still frame of the Full Atlas, measured × 1.25, rounded up: globe 1,300, Europe 220, the Aegean 80, the Aegean at the cap 3, the Mediterranean in 1 CE 600, Europe in 1500 and 1900 150 each, the steppe in 450 and 660 CE 300 each, the Black Sea in 450 BCE 260, the Western Front 140, the Mediterranean in 216 BCE 600). **Measured, with the Full Atlas on at the widest view** (15 E 35 N at 24 km/px, 1,176 marks drawn of 1,211 laid out, software GL, three repeats; two runs at that count — the first three runs read 159 and 413 marks because the card a tap had opened was a column of chrome the marks keep out of, and the test now closes it): the drag **0 and 1 of ~1,270 frames over 100 ms** (the worst 116.7 ms), p90 50–67 ms; the pinch DURING the gesture **2 and 4 of ~410** (0.49 % and 0.96 %, the worst frame 133 ms), none over 200 ms; pooled, **7 of 3,360 gesture frames, 0.21 %**, inside the 0.5 % rule; the wheel, which the rule does not gate, worst 283 ms against 217 ms on the plain Map in the same run. So the drawing of 1,000 marks fits the rule at the widest view and **no fix is proposed** (the fallbacks if it ever stops fitting, none of them built: draw only the marks that changed between two gesture frames, or hide the unstudied marks only while a gesture is in progress — never clustering). **The caveat is the runner's, not the marks'**: the same rule read on the plain Map in the same runs gave a drag of 6 frames over 100 ms in one run (0.49 %), one frame at 233 ms in another (a collector's pause: "none over 200 ms" broken with no mark on the globe), and a pinch of 2 of 413 (0.48 %) in a third — so a pinch's 0.5 % is two frames and the Full Atlas's own 0.96 % in one run is inside that band. **For that reason the suite reads the rule for the Full Atlas over the drag's and the pinch's gesture frames together** (a decision of this change, said here: a per-gesture reading is a coin flip on this runner, and each gesture's own count is printed and none may pass 200 ms). **The marks' own cost per frame** (the JS side of the marks pass: projection, clipping and building the paths; the rasterising is the canvas's and shows in the frame intervals), software canvas on this runner, mean / p95 over 120 frames of a view moving by a hair, Full Atlas against the same frames before the change (when the markers were part of the label pass, so the figure is that pass in Full less the same pass on the plain Map): **the globe 0.70 / 1.2 ms for ~1,040 marks (before ≈ 0.2 ms for 50 stacks and marks), Europe at 6 km/px 0.27 / 0.4 ms for ~750 (≈ 0 for 108), the Benelux at city scale 0.12 / 0.2 ms for 117 (≈ 0.1 for 42)**. A note for whoever touches the drawing: **`closePath` is expensive in this Chromium** — a path built as moveTo / lineTo ×3 / closePath per mark cost 5.3 ms per thousand marks, the same shapes ending in an explicit lineTo to their start cost 0.3 (measured in a bare canvas) — so the marks never call it; the round line cap closes the outline's corner. The first cut, with `closePath`, cost 5.2 ms a frame at the globe.

**Not stacks, and left alone.** The **layered "N here" chip** (`.atlas2-stack`) is not the study layer's: it lists the faces under a tap — a lake and its country, two overlapping peoples, a state and its overlord (Phase 1c, 2c) — and `test-atlas-card`, `-render` and the peoples sections hold it. It still appears where a tap lands on no mark and several faces lie under it; **say if the owner means that one to go too**. Likewise v1's `atlasStack*` (the card stack of one place on `#map`).

**The two things asked about (task 7).** *(a) The Find-a-place box keeps the last query ("Celtiberians") after the view moves or a card opens — **intended, and left**: `chooseResult` writes the chosen result's name into the box on purpose (the combobox convention: the box says what you chose), focusing the box again re-runs it, and nothing in the design or the tests asks for it to clear (Escape closes the list and leaves the text). If the owner wants it cleared when the view moves or a card opens, it would be a small change (clear the box on the next selection or the next move of the view), not made here.* *(b) The place card's bottom sheet on a phone has about 100 px of empty space between its drag handle and the title — **intended in its parts, left**: it is measured at 37 CSS px (111 device px on a 3× phone) from the bar's bottom edge to the title's box, made of the grip row's 44 px touch target (the Phase 1d rule: every control on a coarse pointer is at least 44 px, the grip included, with the 5 px bar centred in it) and the card head's 14 px top padding, which is the desktop card's too. Neither is a mistake; together they are more air than either asks for, and if the owner wants the handle closer to the title the smallest change is `padding-top: 4px` on the head inside `.atlas2-phone`, which keeps the 44 px target.*

**Tests.** `test-study.js` 101 ok (§5 is now the marks: no `cluster` in the module, none of its words in the worker or the page, the size curve, every kind the Full Atlas flags has one of three shapes and a layer, `nearMarks` against a brute force for 12 and 22 px, the fan's properties over 300 phone taps). `test-atlas-study.js` 141 ok (§4 is now: **the property over the Full Atlas's flags — at nine views every flagged place on screen, clear of the edge and the controls, has a mark at its own position within 0.75 px, one each, and nothing is drawn that is not flagged** (3,738 checked) — no mark a stack, the draw order, the size at three zooms, a lone mark picked at 9 px and not at 15, two marks 5–16 px apart fanned and neither picked, a copy picked, Escape, a tap on empty ground, the shared point, a crowd of 14, the hidden list against the layout, and no mark under a control on a 360 and a 390 px phone, with a touch tap picking and fanning). `test-atlas-a11y` 34, `-labels` 197, `-review` 38, `-phone` 193, `-render` 72, `-card` 25 and the frame gate green on this head; `test-atlas-fallbacks`'s one assertion "no main-thread task after the mount ran past 150 ms (the shim yields)" reads red on this runner **on `origin/main` too** (worst 172–211 ms there, 177 here) and is not a consequence of this change. `CORE_CACHE_REV` reinstalled for the worker edit.

**Not verified.** A real GPU and a real phone (every timing is SwiftShader and a software canvas; the touch figures are Playwright's touchscreen); the look of a fan over a dense city on a real phone beyond the headless screenshot.

**Decisions for the owner.** (1) **Shapes:** places of every kind but the three natural ones are diamonds, so a lake, a river, a sea, a province and a country carry a diamond at their anchor beside their name — say if an area should have its own shape. (2) **A polity's mark is a disc at the anchor of its largest face in view in the year** (no mark outside its years; a `front` has none) — there is no other true position for it. (3) **The fan shows at most 14**; more are for a closer zoom. (4) **The layered chip stays** for faces (above). (5) The unstudied marks are soft for ordinary names: say if the plain city and sea names should keep their ground against them.

### Phone fixes — as built (2026-10-14): the card windows after the owner tried them on a real phone

**Scope and status.** Two owner decisions and three faults found after the Stage B flip, one commit each, all guarded by `.claude/test-card-windows-fixes.js` (the engine's windows by default; `FOLIO_ENGINE=v1` runs the sections that have a v1 twin; CI runs it in both modes). Reader-facing, so one changelog line and the version bump `1.1004`. The detail is in `docs/atlas-v2-card-windows.md` "Phone fixes". **Not verified: a real phone and a real GPU** — every timing is headless Chromium on SwiftShader.

**The vanishing outline — the cause.** `atlas-embed.js` `draw` ran the outline's mask pass only when `!o.fast`, and `view()` marks a frame `fast` for 140 ms after every pan or pinch move (and for the first 80 ms), so a drag or a pinch drew no outline at all (a wheel zoom is not `fast`, which is why it was fine). The pass is a second render, a read-back and two CPU filters (60–140 ms on this runner, more on a phone's CPU). It was **not** a gesture-time degradation stage (the embedded hub has no frame loop; `gestureFrame` is the Atlas page's) and **not** the second face pass (gone since Phase 4b). Reproduced first: a CDP touch drag and pinch on geo-002 and gw-001 read **0 outline pixels at every one of 10 samples** (9,268 and 11,027 at rest). Fixed without a mask pass in a gesture frame: the full frame's mask is also kept as the shape's **rim** (its edge pixels, at most 5,000, as unit vectors on the sphere) and a gesture frame projects and stamps them with its own view — the outline exactly on the shape, 4,650 / 5,400 pixels during a drag (no glow; the full frame with its glow follows within 140 ms), and the cost of a drag frame unchanged (the window's `draw` median 71–74 ms against 71–72 ms before, same runner). The first attempt — a half-pixel mask in a gesture frame — kept the outline but cost +20 ms a frame (median 92 ms) and is not what shipped. **The frame gate** (`test-atlas-perf.js`, which reads the Atlas page, not a window) on the final head: drag 0 of 1,281 frames over 100 ms (worst 100.0 ms), pinch 1 of 409 (0.24 %, worst 116.6 ms), the Full Atlas's two gestures together 7 of 1,695 (0.41 %), none over 200 ms.

**War labels.** Before: each name at the area-weighted centroid of the union of its side's faces; the pinned property (every name's point inside a face of its own side in the war's display year, whole inside the frame, off the zoom controls, apart from the other name) had **54 faults at 1100 px and 55 at 390 px over the 56 war windows**; after, **none**. The point is a pole of inaccessibility of the visible part of the side's face at the level the view draws (the worker's new `face-anchors` message, `histPole`), with up to twelve more points inside for crowded names; the two names are placed jointly; beside its point only when nothing else fits. The property test reads the PINNED history (`lib/historyq.js`, the checker's own point-in-face), not the picture: an ID-pass reading disagreed with the data where a nested face overlays another (Ethiopia under Italian Africa). **Four sides have no face in the display year in the pinned history** — England and Normandy (wh-504, 1076; England is stepped 1066–71 and from 1210), Ethiopia (ww2-042, 1936), the Ardiaean kingdom (rm-237, `pol:illyria` ends 226 BCE): the window tints nothing for them and their names keep the centroid (`ground: false`); the test lists them. Checked at 1100 and 390 px on rm-209 (Rome on green, Carthage on red), ww2-001 (Allied powers against Axis powers) and gr-676; shots `docs/atlas-v2-phase4-shots/*-labels-before-*.png` / `-after-*.png`. **The worker was edited, so `CORE_CACHE_REV` was reinstalled**: a reader's first window after the deploy fetches and parses the first level once more.

**Locator names.** Before: names were placed against one another only. On rm-003 with the Roman cards studied, **eight names stood over dots at both sizes (Iguvium, Vulci, Cumae, Cures, Clusium, Capua, Sentinum, Tarentum) and three ran off the frame or under the controls on the phone**; after, none. Every mark and the zoom controls are ground; names go in priority order (the card's own river, its own place, the home square, then siblings nearest the centre), each at the first of eight places (and a second ring 9 px out) that is clear; a name with none is dropped, the card's own never. On rm-003 at 1100 px 42 names are placed and 102 dropped for want of room (the dense blob of Roman places), at 390 px 25 and 102. The label engine's other rules (the soft ground of the Atlas's flag-1 marks) are not copied: here every mark is hard.

**Decision 1 — taps never navigate.** The tap path is gone (`onTap` in the window, `openFromWindow` in `atlas2Ctx`); `atlas2OpenFromWindow` serves the globe button only. `test-card-windows-fixes.js` §5, mouse and touch: click, double click, drag, wheel / tap, double tap, touch drag, pinch on a map card (revealed and not), a locator and a war window change nothing; the button (Enter on it) opens the Atlas, with the year on a war window; Back returns to the same card. It **fails on the previous head** for the revealed map card and the locator. **Consequence the owner should know: a map card has no globe button** (the Atlas would name its answer), so it no longer links to the Atlas at all.

**Decision 2 — one legend.** The pill over the foot of a war window is gone with `legend()`; the key under the window (`cardWarKeyHTML`) is the one legend, and the sides' names stay on the map. The strip where the pill stood is the map's own frame (a pixel comparison with a fresh engine frame; the pill gave 5,600–25,600 differing pixels, now none besides the globe's limb line). Gone with it: the "· N states" count and the "(approximate extent)" wording, which only the pill carried — a side that is an authored extent is no longer called one anywhere on the window.

**CI and what is left.** The first push (run 3552, `e842ebc`): the fast job and the frame gate green; the shared Playwright job was **cancelled by its own 90-minute cap** in the v1 pass (main's runs were already at 85–90 minutes, and this suite added ten), so no suite after `test-card-locator` on v1 ran and no red-suite list was produced. `test-card-windows-fixes.js` therefore has a job of its own (`card-window-fixes`, both modes) and is out of the shared loop. The local reading of the browser suites touched (`test-card-windows-fixes` 46 ok, and 29 ok on v1; `test-atlas-windows` 98; `test-map-cards` 11,296 / 11,307 on v1; `test-card-locator` 14 / 26; `test-war-cards` 57 both; `test-atlas-phone` 193; `test-deck-lazy` 27; the frame gate) is green except `test-atlas-embed`'s `#map2?preview=0 stores "0"`, which fails identically on untouched main on this runner. Not done: the "approximate extent" wording on the key; a globe button on a revealed map card; real-device timings.

### Phase 3 — The gazetteer and the study material (ships `#map2` with Your atlas; ~6–8 sessions)

*Goal: cards reference places by id; the Personal Atlas is derived by id; labels can no longer lie.*

Deliverables:
1. `build-gazetteer.js` v1: every place the cards need, from the migration below, with kinds
   checked against Wikidata `instance of` (a failure is a build error unless `manual: true` with a
   reason); `within` relations; aliases; QIDs.
2. `migrate-places.js`: every `locator`, `war`, `map` and `GLOSSARY_PLACES` entry → a `places` list
   (**additive**: the old fields stay until Phase 5 so v1 keeps working); a report of every name
   that fails the toponym check for the owner to resolve (the "Temple of Artemis at Corfu" class
   becomes `site` within `corfu`; the "Falernian wine" class is dropped from the map with the card
   keeping its text). Written through `card-io.js`.
3. Author tooling: `add-places.js <batch.json>` and `--check`; `atlas-build/add-place.js`;
   `add-card.js` and `import-batch.js` accept `places`; `docs/card-authoring.md` gains the
   `places` field and the taxonomy; `check-cards.js` reports cards without places in the history
   collections.
4. Personal Atlas derivation in the worker from cards with a record (Q-P1 a); per-collection
   toggles (Q-P4 a); stacks ("N cards here") and the card-back browser in the place card; "New
   discovery" chip; the empty state; default view centred on the reader's places.
5. Full Atlas: all cards' places, collection filter, search by name/alias/kind across years.
6. Glossary popup's "show on the Atlas" button through place ids (no PA contribution, Q-P3 c).

Tests that prove the phase: `test-atlas-study.js` (a seeded reader sees exactly their places in
exactly their years; a map card lights its country; a war card draws both sides inside its years
and nothing outside; collection toggles; stack order by difficulty); `check-topology.js` labels
invariant (every place has a kind and the geometry its kind needs; no non-toponym without
`manual`); `test-atlas-labels.js` collapse rule (Corfu until ≥ 120 px, then Temple of Artemis,
Q-L4 a); `test-card-plans.js`, `check-style.js`, `check-questions.js` after the migration.

### Phase 4 — Card windows and Find-it on the shared engine (ships to readers; ~4–6 sessions)

*Goal: one renderer and one geometry on the whole site (Q-A4 a).* Card windows share a single WebGL context, destroyed and recreated as cards change, because browsers cap live contexts at about sixteen per page (noted in Phase 1b, 2026-10-08).

Deliverables:
1. Map cards, locator windows and war shading drawn by `atlas/` in a lightweight embedded mode
   (no timeline chrome; fixed year from the card; tap → "Open in the Atlas at <year>"); the engine
   code bundle and `topology.bin` load lazily when the first such card is shown, warmed at idle as
   the `atlas` bundle is today; `saveData` skips the warm.
2. Find-it moved to v2 primitives (highlight, ID pass scoring, year), still drawing through
   `gameCardIdSet()` and `dayPick()`.
3. `startCardGlobe`, `CARD_MAP_LAYERS`, `coast/`, `rivers/`, the subdivision bundles retire from the
   card path (files deleted in Phase 5).

Tests that prove the phase: `test-map-cards.js`, `test-war-cards.js`, `test-card-locator.js`
rewritten against the engine with their pixel assertions kept; `test-minigames.js`;
`test-deck-lazy.js` (the engine must not join the eager path: `check-sizes.js` shows `app.js`
unchanged or smaller). Changelog line and version bump.

### Phase 5 — The swap (ships `#map` as v2; ~3–4 sessions)

*Goal: v2 is the Atlas; v1 and its data are gone in one release (Q-A5 a).*

Deliverables:
1. `#map` → v2; `#map2` redirects; deep links keep working.
2. Delete v1: the `PAGES.map` closure and its helpers (~5,600 lines), `atlasRegister*`,
   `atlasNameFits`, the map editor and `ADMIN_EDITS.timeline` (Q-A1 a), the limb DOM, the
   heightmap loader; the retired data files (`timeline.js`, `world.js`, `polities.js`,
   `country-series.js`, `fronts.js`, `country-years.js`, `admin1.js`, `ranges.js`, `forests.js`,
   `uk.js`, `water.js`, `cities.js`, `lakes.js`, `rivers.js`, `coast/`, `rivers/`, `heightmap*.js`,
   `us-states.js`, `china-provinces.js`, `russia-subjects.js`, `world-capitals.js`, `us-cities.js`,
   `state-capitals.js`) and their builders; the old card fields (`locator`, `war`, `map`) removed by
   `migrate-places.js --finish`; `GLOSSARY_PLACES` as coordinates and `GLOSSARY_MAP_COUNTRY` removed.
3. `index.html` comments, `sw.js` `VERSION` bump (a cache generation: the old files must leave
   readers' caches), `_headers` `img-src` keeps `data:` for avatars.
4. Docs: `docs/atlas.md` rewritten for v2 (render path, data, tests, "Re-run after touching");
   `docs/map-cards.md`, `docs/war-cards.md`, `docs/eager-path.md`, `docs/admin-editor.md`,
   `docs/reference.md` entries updated; `CLAUDE.md` file map and invariants updated; this document
   gains a "as built" note per phase.
5. Changelog line(s) and version bump; the help card rewritten; the credits page final.

Tests that prove the phase: the whole CI; `check-sizes.js` (eager path smaller than before);
`check-docs.js`; `test-admin-editor.js` without the map editor; every `#map/...` deep link in
`test-layout.js`; the old suites (`test-personal-atlas.js`, `test-atlas-places.js`,
`test-polities.js`) deleted and their intent covered by the new ones (a mapping table in the PR).

### Phase 6 — After the swap (each item its own thread)

In the order of value to readers: "keep offline" (Q-M2 a) · the entity's own timeline bar · "what
changed this year" · palaeo-shorelines before 7000 BCE · journeys and routes as events · dated
cities layer (Reba 2016, licence verified at fetch) · compare two years · study heat · Find-it
variants · authoring from the map · provenance view. Each is small on the new base (§4) and each
adds its own test.

### What is not in the plan, and why

- Interpolated borders, authored fallback polygons, any shape without a source: excluded by design.
- Historical-basemaps: unavailable (§2.10a); nothing waits on it.
- Books and glossary terms in the Personal Atlas: declined (Q-P2 c, Q-P3 c); the gazetteer leaves
  the hook.
- Admin-1 beyond the four layers cards use: declined (Q-A7 a).
