# Atlas v2 — running the build pipeline

> **📖 READ BEFORE RUNNING OR CHANGING ANY SCRIPT IN `.claude/atlas-build/`.** The design is in
> `docs/atlas-v2-design.md` (§2.3 for the topology, §2.10a for the source rule, §7 for what each phase
> built); this file is only *how to run it*, where its caches live, and how a source is added.

The pipeline is Node, lives in `.claude/atlas-build/`, and **nothing in it ships**: its outputs are
`atlas/data/topology.bin` and `atlas/data/tiles/<z>/<x>-<y>.bin`, which the site serves as plain files.
Its libraries (`npm ci` in that directory) never enter the site — the one shared file is
`atlas/atlas-format.js`, the `.bin` reader/writer the browser, the worker, the checker and the
Playwright suites all load, so there is exactly one definition of every byte.

## The steps, in order

| step | command (from `.claude/atlas-build/`) | reads | writes | time (4 cores, Oct 2026) |
|---|---|---|---|---|
| 0 | `node fetch-sources.js [id…]` | `sources.json` | `src/<id>/` (the archive, unpacked) | minutes (OSM is 923 MB) |
| 1 | `node --max-old-space-size=12000 build-land.js` | OSM land polygons | `out/coast.bin`, `out/land-log.json` | ~90 s |
| 2 | `node --max-old-space-size=12000 build-admin.js` | `out/coast.bin`, NE admin-0, NE admin-1 | `out/full.bin`, `out/admin-log.json`, `out/admin-report.json` | ~20 min (the LOD 4 crossing repair is most of it) |
| 8 | `node pack.js [--install]` | `out/full.bin` | `out/dist/` (the core, the tiles, `tiles-report.json`); `--install` copies them into `atlas/data/` | ~1 min |
| 9 | `node check-topology.js --tiles` (from the repo root: `node .claude/atlas-build/check-topology.js --tiles`) | `atlas/data/` | nothing; exit 1 on any failure | ~2 min |

Steps 3–7 of the design's table (polities, peoples, water, gazetteer, relief) do not exist yet
(Phases 1b–2). Each step is deterministic given `sources.json`; the only non-determinism in the
outputs is the `generated` timestamp in each header. The `buildId` in every header is the sha256 of
`out/full.bin`, so a tile can always be matched to the core it was cut from — the checker refuses a
mismatch.

`build-land.js --census` prints the vertex census per candidate tolerance without writing anything;
it is how the LOD tolerances were chosen (§2.3 "as measured"). `pack.js --dry` builds everything in
memory and prints the size report without writing.

## Where things live

- **`src/`** — the source cache, git-ignored. `fetch-sources.js` fills it and verifies every archive
  against its sha256 pin before any step reads it; a build script calls `ensureSource(id)` rather
  than trusting a path. Delete it freely; a re-fetch costs minutes. The OSM zip (923 MB) unpacks to a
  1.3 GB shapefile; keep an eye on the session's disk allowance (`df -h`) and delete `src/` when done.
- **`out/`** — scratch outputs between steps, git-ignored. `coast.bin` (~540 MB: every OSM vertex
  with its Visvalingam area) and `full.bin` (~25 MB: the whole topology at five levels) are what the
  next step reads; the `*-log.json` files are the snap logs and the `admin-report.json` holds the
  measurements quoted in the design doc. `out/dist/` is the packed result before `--install`.
- **`node_modules/`** — `npm ci` here once per session; git-ignored.
- **`atlas/data/`** — the committed artefact: `topology.bin` and `tiles/`. **Never hand-edit a
  generated file**; fix the script or the pin and rebuild. Commit a rebuilt `tiles/` once per
  meaningful build, not per iteration — every committed tile stays in the repository's history.

## Iterating without re-running everything

- `build-land.js` only depends on the OSM pin: re-run it when the pin changes or the quantum does.
- `build-admin.js` is where almost every rule lives (the far-vertex threshold `D_FAR`, the sliver
  rules, the tolerances, the LOD intervals `LOD_M`). Set `DEBUG_PIECE_AT="lon,lat;lon,lat"` to print,
  for every land piece whose bounding box holds a point, its size, its interior sample points and the
  Natural Earth polygons that contain them — it is how the enclave-labelling fault was found.
  `DEBUG_NODE="lon,lat,radius;…"` prints, at face-walk time, every half-arc at every node within the
  radius with its kind, flags, length and angle, and the full half-arc list of every mixed cycle (a
  cycle that walks coast on both sides) — how the Fenwick Island and Smith Island leaks were found.
  `DEBUG_STOP=walk` exits right after the face walk (about four minutes in) with the snap log written
  to `out/admin-log-walk.json`, so a walk fault iterates at a fifth of the full run's cost.
- `pack.js` is fast; re-run it alone after a change to the tile grid, the resident level count or
  the clipping.
- The snap log fails the build when a snap exceeds its source's tolerance (`TOLERANCE_M`); read
  `out/admin-log.json` for the offending snap rather than raising the tolerance.

## Adding a source

1. Add an entry to `sources.json`: `id` (a slug), `name`, `version`, `url`, `sha256` (hash the file
   yourself — `curl … | sha256sum` — never copy a hash from a web page), `bytes`, `licence` (one of
   the accepted identifiers; anything else is refused by `fetch-sources.js` and cannot enter the
   pipeline even for a cross-check — §2.10a), `licenceUrl`, `attribution` (the exact credit line the
   licence asks for), `retrieved`, `files` (what the build reads inside the archive), `usedBy`.
2. A share-alike source (ODbL, CC BY-SA) must stay a data file of its own: `pack.js` copies every
   source an output drew on into that output's header, and `check-topology.js` fails if an arc or
   face names a source index the header does not carry. If the new source's geometry would be merged
   into a file whose other sources are PD or CC BY, it needs a file of its own.
3. Read it through `lib/shp.js` (streaming, for anything large) or mapshaper (for small files), in a
   new `build-*.js` step that writes into `out/` and is listed in the table above.
4. `node .claude/check-reach.js` gains the host, so a session can tell "the host is down" from "the
   pin is stale".

## When the OSM pin goes stale

osmdata.openstreetmap.de regenerates the land polygons daily at the same URL; the README inside the
zip names the planet date (`Date of the data used is …`), which `build-land.js` copies into every
header. There is no dated, citable archive of these files (searched 2026-10-08), so a re-fetch on
another day yields a different file and `fetch-sources.js` will refuse it against the pin. That is
deliberate: re-pin it in a commit that says so, re-run steps 1, 2, 8 and 9, and expect the outputs
to differ (new coastline edits, new islets). The committed `atlas/data/` is the reproducible
artefact; the pipeline reproduces it from a re-fetch, not bit-identically.
