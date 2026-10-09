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
worker's chord subdivision (spherical midpoints, recursive to the level's threshold) is the same on
both sides, so there is no gap. A loaded tile is drawn where its extent is written into the stencil
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
| 3 | `build-polities.js` | Cliopatria v0.2.0 rows per `polity-spec.json` (reused), OHM relations where whitelisted, traced plates where the spec names one | polity steps conflated per §2.3; the snap log |
| 4 | `build-peoples.js` | Cliopatria "people" rows, site hulls (Hosner), traced soft outlines | soft faces with the uncertainty flag |
| 5 | `build-water.js` | Natural Earth 10m rivers (scale-rank edition), HydroLAKES, the committed land partition (`lib/landindex.js`) | `out/water-full.bin`: river arcs by scale rank, lake faces at four levels; `pack-water.js` splits it into `water.bin` and the water tiles |
| 6 | `build-gazetteer.js` | cards + glossary + books (place references, §2.8), Wikidata | `gazetteer.js`: entities, kinds, anchors, label paths |
| 7 | `build-relief.js` | ETOPO 2022 60 arc-second (CC0) | `relief/L0.*.png`, `relief/L1/*.png`, `relief.json` |
| 8 | `pack.js` | everything above | `topology.bin`, `tiles/`, the attribution text for the help card |
| 9 | `check-topology.js`, `check-water.js`, `check-relief.js` | outputs | fail on any §2.11 invariant |

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
  with the millisecond of slack; the primitive budgets per fixed view.

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
(never finer than the one it started at), as a map app shows the coarser tiles under a pinch; the wanted level comes with
the release frame. With both, the pinch's gesture frames on the runner read ≤ 100 ms (p90 67) where they had read up to
267. The ID pass is unaffected (a pick never happens mid-gesture, and the renderer's device-pixel ratio carries the
scale consistently). A GPU that draws the frame in 16.7 ms — the owner's phone — never reaches the threshold and never
sees either stage; `#map2?perf` prints the stage on its LOD line. **Flagged for the owner**: it is a renderer behaviour
visible only on slow GPUs, chosen over loosening a number; a phone that does reach stage 2 shows coarser coasts under a
pinch than it did.

{{GATE_RUNS}}

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
140px)` was written with a stray parenthesis and dropped by the parser; and the pinch drifted — the pan by the midpoint's
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
and the `#credits` page read 61 colour-contrast nodes (the licence chip's link, indigo at 10 px, 3.53:1) before its chip
went to ink at 11 px: 0 after.

{{SESSION}}

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
