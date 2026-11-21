# Atlas v2 — border packs: a state's borders for a card window without rebuilding history.bin (2026-11-20)

> **📖 READ BEFORE ADDING A STATE'S BORDERS FOR A CARD, OR TOUCHING `--pack`, `border-packs.json`, `check-border-packs.js` OR THE WINDOWS'
> `packOf` / `packRings`.** Built on request after PR #798: the Russian Empire (ru-341, ru-276), Goguryeo (ko-106) and Silla (ko-161) had
> Cliopatria rows but no entity in `history.bin`, and adding one meant a whole-history rebuild.

## 1. The recipe (adding a state)

```
node .claude/atlas-build/fetch-sources.js cliopatria                    # once per session (44 MB)
node .claude/atlas-build/add-border.js --list "Russian Empire"           # the rows: years and areas, the largest marked
node .claude/atlas-build/add-border.js russian_empire --cliopatria "Russian Empire" --years 1724,1796 --card ru-276,ru-341
```

`add-border.js` writes the state's row in `.claude/atlas-build/border-packs.json`, refuses a year where not exactly one row of the
names is alive, builds the pack (`build-history.js --pack <name> --extract --install`) and runs `check-border-packs.js`. Then the card
names the state exactly as any `history.bin` state (📖 `docs/map-cards.md` "On a past year's borders"):

```js
"members": { "label": "Realm", "name": "Russian Empire", "note": "borders as the Cliopatria dataset maps them",
             "keys": ["Russia", "Estonia", "Latvia", "Ukraine"], "year": 1724,
             "groups": [{ "name": "Russian Empire", "note": "in 1724, at the height of the reign", "ids": ["pol:russian_empire"] }] }
```

`members.year` must be one of the pack's years (the checker fails otherwise); `keys` are the present-day countries the row covers — the
still renderer's fallback and the frame (check them against the row, not memory). A locator's `zoom` wins over the members block.
A second year for a state already in a pack: the same command with the new year (the row keeps its years and gains this one).
`check-border-packs.js --rebuild` is the one check; it runs in CI's fast job.

## 2. What a pack is

- **`atlas/data/borders/<pack>.bin`** — `history.bin`'s format (`kindOf: "border-pack"`), built by **`build-history.js --pack <name>`**: the
  SAME conflation as the history (d1 onto the OSM coast, d3 onto present-day borders, the face walk, the sliver rule, the LOD ranks, the
  planarity repair), onto the same committed `topology.bin`, but over the pack's rows only. Each year in the spec is a one-year step drawn
  by the one Cliopatria row alive in it (`rowsAt [y, y]`). Every branch the pack changes in `build-history.js` is guarded by `PACK`;
  the rest of the build is untouched (proved: a fresh full build with the edited script is byte-identical to one with the original, §5).
- **Inputs, all committed**: `border-packs.json` (the spec), `border-packs-source.json` (the extract — the pack's Cliopatria rows as the
  pinned file has them, written by `--extract`, so `--check` runs offline in CI) and `topology.bin`. Deterministic: two runs, one sha256.
- **The header** carries the three sources the faces name (Cliopatria CC BY 4.0, the OSM coast ODbL, Natural Earth admin-0 PD), so the
  `#credits` page lists `atlas/data/borders/` (`build-credits.js` walks the directory); `pack.states` repeats the spec rows.
- **`atlas/data/border-packs.js`** — the index, a pure function of the committed packs: id → pack, name, steps. It rides the
  `atlas2cards` bundle (with `card-faces.js`), so a window knows which pack to fetch before it fetches anything.
- **Budgets**: 600 KB a pack, 12 MB all together (`lib/border-packs.js`). The first three: Goguryeo 15 KB, Silla 18 KB, the Russian Empire
  in two years 155 KB. A build takes 1–5 s.
- **http only.** No `file://` twin: a pack's windows also need the whole `history.bin`, which has none either. On the file copy, or when a
  pack cannot be fetched, the window is the plain sentence ("This map needs a state's borders that could not be loaded here…").

## 3. The engine

- **Worker** (`atlas-worker.js`): a slot per pack, `slot: "pack:<name>"` (`PACKS`, `slotOf`), through the same reader, `buildId` check and
  per-level geometry as `HIST` and `ADM1`; nothing is triangulated — the worker posts `pack-meta` (the header) and answers `face-rings`
  for the slot. The lost-context `rebuild` re-reads every pack.
- **Main thread** (`atlas.js`, "BORDER PACKS"): `ensurePack(name)` fetches once (marked failed at once on the still renderer and the file
  copy); `packRings(name, ids, year, level, cb)` answers as `entityRings` does. A pack's error is the window's, never the Atlas's.
- **Hub** (`atlas-embed.js`): `startPack`, `packState` (null | loading | ready | failed), `packRings` (a Promise).
- **Window** (`atlas-windows.js`, `packOf` / `painted`): an id the index holds is painted EXACTLY as a war extent in a members group
  (📖 `docs/atlas-v2-card-windows.md` "An extent as a members group"): the group's tint over the land and one outline round the group, from
  the pack's rings in the window's year (`paintExtents` → `groupRings`). Unlike an extent, on the still renderer the present-day `keys`
  ARE tinted (they are the state's own ground today). `history.bin` ids in the same group stay engine highlights.

## 4. What packs are NOT part of (decided: card windows only, for now)

| | a pack's state | why |
|---|---|---|
| The Atlas page (`#map`), Map / Full | not drawn | the page never loads a pack; the land partition of a year is `history.bin`'s alone |
| The Personal Atlas | not drawn, not discoverable | a pack id is not a registry id (`places-registry.js` reads `history.bin`); a card names it in `members`, never in `places` |
| The past-states layer (`hs-` cards) | not included | `build-card-faces.js` `PAST_LAYERS` reads `history.bin`; a question state must be drawn with its year's neighbours |
| `polity-index.js` (search) | not included | built from `history.bin` |
| `glossary-places.js` / the glossary windows | not included | built from `history.bin` and the registry |
| The seats audit (`audit-seats.js`, `check-history.js` "seats") | not run | the card's own locator marks are the seat; the pack has no `cities` |
| `history.bin`'s neighbours | not snapped to | the pack is conflated alone: where its border meets a `history.bin` state of the same year the two lines can differ by the source's width (Goguryeo against Baekje in 480). The outline is drawn over the year's borders, so it reads as the card's state. |

Giving packs any of these is a decision of its own. **When a pack's state should join `history.bin`** (a whole-history rebuild for another
reason): add its series to `polity-spec.json` and delete its pack row — `check-border-packs.js` refuses a key both carry, and the cards
do not change (`pol:<key>` resolves from `history.bin` first). **After a core rebuild** every pack must be rebuilt
(`build-history.js --pack <name> --install` each; the checker fails on the `buildId`).

## 5. Why history.bin's rebuild "was not reproducible" (diagnosed 2026-11-20)

The report (PR #798): a fresh `build-history.js --no-cache` with the spec unchanged gave the committed size but another sha256, and
`check-history.js` failed on it (cnh-103 at −1122; four seats of Song and the Sasanian Empire).

- **The build IS reproducible.** Two fresh builds in this session — one with the original script, one with the pack edits — are
  byte-identical (`e265ee82…`). Node 22.23.5; nothing depends on sort stability, float order or the unzip order.
- **The committed file is stale, not a different build.** Against a fresh build, every geometry section (vertices, ranks, arcs, faces,
  core references, junctions) is identical; the ONLY difference is one entity: `pol:ext_zhou`, cnh-103's authored war extent, spans
  −1046 in the committed file and −1122..−1040 fresh. An extent's years are the war card's own years (`lib/war-resolve.js` over the
  cards and `app.js`'s `cardYears`), so **the cards are an input of `history.bin`** that no cache key or checker ties to it. `history.bin`
  was last built on 2026-10-29 (be9abe329); cnh-103's date line went from "c. 1046 BCE" to "1046 / 1040 / 1122 BCE" on 2026-11-12 (China
  refinement batch 2, #679).
- **`check-history.js` fails on the COMMITTED file too**, with today's cards, on exactly the same two assertions — they are card edits
  meeting faults already recorded at neighbouring years, not rebuild regressions:
  - cnh-103's new traditional year −1122: Cliopatria's Shang row of −1240..−1101 leaves Zhengzhou outside, as `KNOWN_FAULTS` already
    says of −1046;
  - cnh-157 (Song) now dates −641, −637, −546, −286 and rm-553 (Sasanian) 224 and 226: `audit-seats.js` classes all four as **source**
    (the raw rows leave the card's point 4.0 km and 347.7 km outside — the entries `seats-known.json` already holds for −638..−637 and 224).
  Whitelisting them (`KNOWN_FAULTS`, `audit-seats.js --write-known`) is the owner's decision and was NOT done here; neither was a rebuilt
  `history.bin` committed (nothing a pack needs depends on it).
- **Rule for later**: after a date-line edit to a war card with an authored extent, or to a card a seat is read from, `history.bin`'s
  extent years and `check-history.js`'s card-derived assertions move; rebuild (`--no-cache`) when the extent's years matter, and run
  `check-history.js` either way.

## 6. As built (2026-11-20)

- Packs `goguryeo` (480), `russian-empire` (1724, 1796), `silla` (682, Cliopatria's "Unified Silla" row: the "Silla" rows end at 681 and
  are smaller); cards ko-106 (locator zoom 5), ru-276 (Saint Petersburg's locator now `role: "capital"`, zoom 7 → 3), ru-341 (its Saint
  Petersburg mark stays the death mark it was), ko-161.
- Guarded by `check-border-packs.js --rebuild` (CI fast job) and `test-atlas-windows.js` §12 (each window on the engine at its year, the
  state painted against the engine's own frame, one fetch of the pack and of `history.bin`, the plain sentence when the pack is refused).
- Found, not fixed: ww2-012's members groups name `pol:south_africa_1920`, `pol:haiti_1920` and `pol:dominican_1920`, which `history.bin`
  no longer carries (drawn as nothing); `check-border-packs.js` prints them as a note.
