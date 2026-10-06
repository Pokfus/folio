# Atlas v2 — design from the goal

*Status: DESIGN, awaiting the owner's answers to §6 (licensing answered, see §2.10a). No code is written for it yet. When the answers
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
| `atlas/vendor/earcut.js` | ISC | ~20 KB | Robust polygon triangulation with holes. Writing one is a known swamp; earcut is the reference implementation (used by MapLibre, deck.gl). Runs in the worker only. |
| nothing else | | | The orthographic projection is ten lines; a TopoJSON client is not needed because the wire format is this design's own binary (§2.3), and d3-geo's clipping is replaced by the GPU's horizon discard. |

**The draw list, per frame** (all static buffers, uniforms only):

1. *Sphere pass* — one full-screen triangle. The fragment shader intersects the view ray with the
   unit sphere: outside → transparent (the page shows through; the limb's anti-aliasing comes from
   the ray-sphere distance, not from geometry); inside → lon/lat → ocean colour, graticule, optional
   relief lookup (§2.7), limb darkening and a halo, all in one pass. No DOM gradient divs.
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

**Rivers and lakes** join the topology as arcs and faces but are *not* used as borders (sources
place borders along rivers at their own precision; forcing a snap would invent). Rivers come from
HydroRIVERS (CC BY 4.0), which carries stream order and discharge, so LOD is a filter on order: a few
hundred great rivers at globe scale, tens of thousands at street scale. HydroRIVERS geometry is
derived from a 15 arc-second grid (~460 m) and visibly stair-steps at the highest zoom; the build
smooths it (Chaikin, two passes) and the design caps the maximum zoom where rivers are drawn
accordingly. Lakes come from HydroLAKES (CC BY 4.0; 1.4 M lakes ≥ 10 ha) filtered by area per LOD,
with Natural Earth 10m as the fallback if HydroLAKES proves too large to pack.

**Level of detail.** Three resident LOD levels for arcs (globe, continent, country scale) ship in the
core file; two finer levels (region, locality) ship as **tiles** on an equirectangular grid
(`z=3`: 8×4 tiles; `z=4`: 32×16), fetched on demand and cached by the service worker. Tiles carry
*only* coast, river and lake arcs at the finer level, keyed by the same arc ids as the core, so a face
whose boundary is a coast arc is simply drawn with the finer version of that arc when the tile is
present — no re-topologising at runtime. Level thresholds are chosen so that the simplification
tolerance of a level is < 0.5 px at the zoom where it is first used; the switch is invisible. Fills
are triangulated once per face at the resident level that matches the face's own precision, so the
fill edge and the stroke never disagree by more than a pixel.

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
compress `application/octet-stream`). Estimated sizes, **to be measured by the pipeline's first run**:

| file | content | est. size on the wire |
|---|---|---|
| `atlas/data/topology.bin` | arcs LOD 0–2, faces, steps, entities | 2.5–3.5 MB |
| `atlas/data/gazetteer.js` | places registry (§2.8), labels, anchors | 0.3–0.5 MB |
| `atlas/data/tiles/3/*.bin` (32 tiles) | coast/river/lake at LOD 3 | 60–150 KB each |
| `atlas/data/tiles/4/*.bin` (512 tiles) | LOD 4 | 30–120 KB each; most are empty ocean and omitted |
| `atlas/data/relief/L0.png` | 4096×2048 hillshade + height | ~2.5 MB |
| `atlas/data/relief/L1/*.png` (8) | 2048² each | ~0.9 MB each |
| `atlas/data/relief/L2/*.png` (32, optional) | 2048² each | ~1 MB each |
| `atlas/atlas.js` + `atlas-gl.js` + worker + earcut | code | 120–180 KB |

For comparison the Atlas today loads about 4 MB (gz) of `atlas` + `world` + idle-warmed bundles
before any relief, and 9.4 MB more for the two heightmaps. A first visit to the new Atlas is
estimated at ~3–4 MB before relief; relief adds 2.5 MB at globe scale.

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
| 5 | `build-water.js` | HydroRIVERS, HydroLAKES | river arcs with order; lake faces |
| 6 | `build-gazetteer.js` | cards + glossary + books (place references, §2.8), Wikidata | `gazetteer.js`: entities, kinds, anchors, label paths |
| 7 | `build-relief.js` | ETOPO 2022 (PD) | `relief/*.png` |
| 8 | `pack.js` | everything above | `topology.bin`, `tiles/`, the attribution text for the help card |
| 9 | `check-topology.js` | outputs | fails on any §2.11 invariant |

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
region"), the second tap cycles, and the legend's "Peoples" switch hides them entirely. On the
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

### 2.7 Relief

**Source: ETOPO 2022** (NOAA NCEI, public domain, 15 arc-second global; bedrock and ice-surface
versions). It is one clean source with one licence, which the current Mapzen/AWS composite is not.
The build samples it to an equirectangular pyramid and writes **8-bit RGB PNGs**: R = hillshade
(north-west light, computed once at build, so a phone never computes normals), G+B = 16-bit height
(so hypsometric tints have no 36-metre terraces), A unused. Levels: L0 4096×2048 (one file, ~2.5 MB),
L1 8192×4096 as 8 tiles, L2 16384×8192 as 32 tiles (optional; ~2.4 km per texel). Tiles are 2048²
so every phone GPU accepts them.

Rendering is in the **sphere pass** fragment shader: the ray hits the sphere → lon/lat → sample the
height/hillshade texture (L0 always resident once relief is on; finer tiles bound when their region
is in view) → hypsometric colour from a 1-D theme ramp texture, multiplied by hillshade, mixed with
the land colour at the legend's strength. Cost is a few texture reads per pixel: ~1 ms. Bathymetry
is available for free as an ocean depth tint (Q-V2). Relief is off by default and remembered per
reader; the toggle flips a uniform — no reload, no CPU work.

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

**A glossary term** gets `GLOSSARY_PLACES[key] = [placeId, …]` (replacing the 31-entry coordinate
table), set by the same tooling; its dates (`GLOSSARY_DATES`) give it a year on the Atlas for the
first time.

**A book** gets `places` on the book record (settings of the work) and optionally per chapter; a
book contributes to the Personal Atlas when the reader has read past a threshold (Q-P2).

**The Personal Atlas** is derived in the worker from the reader's state: the set of cards with a
record (or a stricter test, Q-P1), the glossary terms they have opened, the books they have read;
each contributes its place ids with years; places stack by id (the stack is the "N cards here"
browser); a change in progress invalidates the derivation. Nothing is stored; it is computed from
`S.cards` as today, but by id, not by name-matching.

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

## 6. Questions for the owner

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
- **Q-T4 — Playback.** (a) ★ plays through change-years only, at a chosen speed (1, 5, 25 years per
  second), crossfading at steps; (b) plays every year; (c) no playback.

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
