# The Atlas — the globe, the timeline, the eras and the map game

**Read this before touching `PAGES.map`, `build-era.js`, `timeline.js`, or anything in the render path.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary: what the globe is, the era data
shape, the frame-cost rules a change must not break, and which suites guard it. This file carries the
rest — why each rule exists, the host quirks it works around, and the several faults that rendered
perfectly while being wrong.

The bullet below is as it stood in CLAUDE.md, verbatim.

- **Atlas:** an orthographic Canvas-2D globe (drag to rotate, wheel/pinch zoom, **on-screen `+`/`−` buttons (`#gzIn`/`#gzOut`,
  `.globe-zoom`) + keyboard `+`/`−`** via `zoomStep()`; `ZMIN 0.82 … ZMAX 10`). Zooming scales the disk
  radius (`R = baseR·zoom`), so the globe fills the screen by ~zoom 2.1 (`R ≥ dist(centre,corner)`). The **wheel-zoom listener is
  bound to `window` in the CAPTURE phase** (`onGlobeWheel`), not to the canvas — some hosts (e.g. the Claude Code live preview)
  route `wheel` to a scroll container / parent rather than the canvas, so a canvas-only listener never fired there and scroll-zoom
  looked dead. Catching it at window+capture and acting only when the pointer is over the globe stage (with `stopPropagation` so
  the host can't also scroll its pane) makes scroll work wherever the event reaches the DOM at all. The **on-screen `+`/`−` buttons
  + keyboard `+`/`−`** (`zoomStep()`) remain as a fallback for any host that swallows wheel entirely before the DOM sees it.
  (Also re-runs `resize()` on `devicePixelRatio` changes so page-zoom / DPI changes don't leave the canvas at a stale resolution.)
  The wheel handler **normalizes `e.deltaMode`**
  (a line ≈ a 33px notch, a page ≈ the viewport) and uses a punchy factor so a few notches fill the screen — without this,
  line/page-mode mice barely zoomed and the globe seemed stuck at a fixed size (the "broken zoom"). The wheel zoom is
  **zoom-to-cursor**: it captures the lon/lat under the pointer (`screenToLonLat`), applies the zoom, then nudges
  `rotLon`/`rotLat` by `(before−after)` so that same geographic point stays under the cursor (recentering the globe on
  where you point, rather than always zooming to the disk centre).
  The Claude Code preview webview does **NOT repaint the `<canvas>` after a `preventDefault()`'d wheel gesture** (the draw runs and
  `zoom`/`R` update, but the pixels stay frozen — discrete clicks and a window-resize DO repaint). Fix: while a wheel gesture is
  active (`wheelActive`, set in `onGlobeWheel`, cleared in `settle()`), `draw()` calls `forceComposite()`, which **reallocates the
  canvas backing store** (toggles `canvas.width` by 1 device px, imperceptible) — the same thing a window-resize does, forcing the
  host to re-rasterize+composite. Gated to wheel gestures so drag/idle keep the fast (no-realloc) path. Don't use a CSS transform
  nudge for this — it promotes the canvas to a layer that onion-skins old frames into gold ghost rings. See the
  [[wheel-zoom-deltamode]] memory (incl. the gotcha that `preview_eval` hits a different browser than the user's panel).
  The Atlas **opens centred on the scholar's home location** — `atlasView` (the persistent rotLon/rotLat/zoom) is initialised from
  `S.settings.home` (`{ name, lon, lat }`, **default the Netherlands**; back-filled on load for older saves). Change it in
  **Settings → Home location**, a country `<select>` (`.set-sel`) built from `window.WORLD_GEO` names; picking one stores the
  largest-ring bbox centre via `countryCenter(name)` and re-centres `atlasView` (zoom reset to 1). Home lives in device settings,
  not the synced account record.
  Full-bleed between the top nav and a fixed bottom timeline (1000 BCE → present). **The timeline rail is
  NON-LINEAR** (`year2frac`/`frac2year`, exact inverses used by every rail position — pin, fill, ticks, marks): the
  map-less 1000 BCE – 1500 CE span compresses into the left `TL_KNEE_F = 15%` and 1500 → present stretches over the rest.
  The `.tl-mark` map-year ticks are **focusable buttons** (click = jump, title/aria-label = "1500 CE — <era label>").
  **The rail gets its own row on a phone** (≤560px, Aug 2026): one flex row could not hold a play button, a
  ~170px year box AND the rail, so at 390px the rail was squeezed to about **70px** — which is why its five
  year labels piled into an 80px band as an unreadable smudge and stopped lining up with the marks they
  annotate. The timebar becomes a two-row grid (`"play year" / "rail rail"`) and `--timebar-h` goes to 118px.
  **`layoutTicks()` then thins the labels to the ones that fit**: they are positioned off the same
  `year2frac` as everything else, so a colliding label is DROPPED rather than nudged — moving one off its
  year would make it a lie. The two ENDS are always kept (they are what fixes the scale), so an inner label
  must clear both its left neighbour and the right anchor; it re-runs from `resize()`, and it has to unhide
  everything before measuring because a hidden element has no width.
  A **plate-title cartouche** (`#mapCartouche`, top-centre, hidden ≤640px, updated by `paintYear`) shows "THE WORLD ·
  1938" for a past year and simply **"TODAY"** for the present one (Aug 2026, on request — it was "THE WORLD
  TODAY": every other plate is "THE WORLD · <year>", so on this one the two words before the date were the
  only part carrying no information, the globe under it being the world either way). The disk gets **limb shading + an atmosphere halo** as **two DOM layers, NOT canvas
  gradients**: `#globeHalo` (below the canvas) + `#globeShade` (above it, `z-index:1`), radial-gradient divs sized to
  the disk by `updateLimbDom()` each draw (style-update only, keyed so it no-ops unless the disk moved) and tinted by
  `paintLimbDom()` (colours `limbA/limbB/haloIn/haloOut` from `readColors`; re-applied by the theme observer). They
  were canvas gradients once, gated to settled frames — a limb-sized gradient shifting per frame is exactly what some
  hosts onion-skin into a page-wide gold bloom (the "everything turns gold" bug) — but that made them vanish during
  every drag/zoom; as GPU-composited DOM they are **always visible** and give the compositor artifact no fuel.
  `drawLimb()` now draws only the rim stroke. **Hovering names the entity under the cursor** via a **DOM chip**
  (`#globeHoverName` / `updateHoverName()` — deliberately NOT canvas: following the cursor is a style update, so the
  canvas only redraws when the hovered ENTITY changes, never per-move; on a geo era it shows "empire · territory" via
  `.mother`/`empireName`; hidden while dragging / map-editing / whiteboard-drawing and on touch (`@media (hover:none)`);
  `settle()` re-derives `hoverIdx` from the recorded `hoverPx/hoverPy` after a drag/coast/zoom so the tag and hover fill
  are never stale under a stationary cursor). **`eraLabelAnchors` caches on `_htId` AND `mapEditRev`** — mapBump() only
  nulls `_htId`, which `histTerr()` refills with the same era.id, so without the rev key editor edits kept stale labels.
  An **atlas search box** (`#globeSearch`, top-right) typeaheads over present-day countries, every era's territories and
  all capitals (index built lazily by `gsIndex()`, folded case/diacritics, rebuilt when `mapEditRev` changes; a territory
  sharing a present-day name folds into one row spanning its years). Picking a result keeps the current year when the
  entity exists there, else jumps to the present (if listed) or the entity's earliest era, then **flies the globe**
  (`flyTo` — easeInOutQuad rotLon/rotLat/zoom over ~0.7s) and selects it + opens its popup (capitals just fly close
  enough for the pin label, no popup). The fly is cancelled by pointerdown / wheel / `zoomStep` / `setYear` (so timeline
  navigation mid-flight aborts it) / `cleanupGlobe`; the landing selection runs ~90ms after touchdown via a **tracked**
  `flyDoneT` timeout and re-checks `eraKey(year)` against the era it took off for, so it can never resurrect a
  selection on an era the user navigated to meanwhile. The dropdown's `.gs-results[hidden]{display:none}` override is
  required (author `display:flex` beats the UA hidden rule — codebase convention, cf. `.country-pop[hidden]`).
  **On a phone the search and the legend are CHIPS** (≤640px, Aug 2026): open, they covered the whole
  top-right of a 390px screen — the map — before the reader had asked for either (the legend alone is
  126×196). The search collapses behind `#gsToggle` and expands across the full width of the stage when
  tapped (a 38vw field fits about four characters), and the legend starts `collapsed` there and shrinks to a
  34px round chip, reusing the collapse toggle it already had. `.gs-toggle{display:none}` is the desktop
  base rule and the phone block **must come after it in source order** — media queries add no specificity,
  so the base rule silently won when the block was placed first, and the chip never appeared.
  The `.globe-hint` ("drag to rotate · scroll or +/− to zoom") is hidden under `@media (hover:none)`: it is
  written for a mouse.
  **Change-over-time features (batch 2):** `terrOf(era)`/`ownerAt`/`ownerIdxAt` are the cross-era lookup (per-era.id cache
  `_terrCache`, cleared by `mapBump` + the groups→geo materialization in `enterMapEdit`; smallest-bbox tie-break so enclaves
  beat their surrounder, like `countryAt`). Stepping ONE map-year pulses the territories that changed hands (`pulseChanges` —
  each new-map label anchor sampled against the old era's owner; anchors carry their territory index `i` because names are
  NOT unique — 1900 has 35 "Fiji" polygons; skipped while `tlDrag`, throttled 450ms for chevron-holds, skipped on eras with
  >320 territories, and under `prefers-reduced-motion` (`REDUCED`)). Era changes **crossfade** (~280ms — `fadeCv` snapshot in
  `setYear`, composited with falling alpha in `draw()`, killed by `startMotion`/`tlDrag`; the settled base cache is snapshotted
  BEFORE overlays, so pulse/fade never leak into `baseCv`). A **play button** (`#tlPlay`) auto-steps the mapped years every
  2.4s (`_playStepping` flag; any user-driven `setYear` AND any search pick calls `playStop` — a pick on the current year has
  no setYear, and a later tick would cancel its flight mid-air). The info panel gained a **drill breadcrumb** (`#cpCrumb` —
  parent = the empire via `.mother`, or `ownerAt(popPointLL)` for drilled countries/UK constituents; clicking climbs back up),
  **"Through the ages"** (`#cpHistory` — `ownerAt(popPointLL)` across all mapYears, consecutive runs collapsed; a row click
  jumps + re-selects **by point, not name** via `selectEntityByName(name, atLL)`). Both read **`popPointLL`** — the click
  point / search anchor, the GEO label point `c` and NOT the bbox centre, which can land in a neighbour.
  A **Copy link** chip sat beside them and was **removed on request (Aug 2026)**; `popEntityName`, which was only ever
  read to mint one, went with it. The **`#map/<year>/<slug>` deep links themselves are untouched** and must stay so —
  every link already shared points at one. They are parsed at boot + hashchange by `parseMapHash` (`decodeURIComponent`
  is try/caught so a mangled %-escape can't kill boot; the consumer resolves territory names, then EMPIRE names via
  `.mother`, then drilled present-day countries (`subSelGeo`), then UK constituents (`subSelUK`)), and
  `test-layout.js` loads one, because nothing on screen says they still work. Unclaimed land on historical eras gets a
  **terra-incognita stipple** (`stipplePattern()`, theme-aware via `stippleCol`, drawn settled-only under the claimed-land
  refill so it survives only on wilderness).
  **CITY LABELS THIN OUT WITH ZOOM, Google-Earth style (Aug 2026, on request).** Turning Cities on used to
  put a label on EVERY city in view: a name that would not fit cleanly got a leader line and, failing that,
  was FORCED into its last candidate slot, so below "one country fills the screen" the map was dozens of
  overlapping names and 2,665 label placements per settled frame. Two rules replace the forced placement
  (`CITY_SEP` / `CITY_CAP` above `computeCityLayout`): **`CITIES` is already sorted by significance** —
  capitals by population, then cities over a million, then division capitals — so a city whose pin lands
  within `sep` px of one already placed is dropped WHOLE, and `sep` shrinks with zoom (88px at the globe,
  22px zoomed right in), which is what reveals the crowded-out names a level at a time; and **a label that
  cannot be placed without overlapping is dropped rather than forced**. Both drops take the PIN with them —
  a pin and its name are one thing (the same reason the whole layer waits for the settled frame), and a
  field of anonymous dots was rejected before. The separation test runs BEFORE the 34-candidate label
  search, which is where the lag went. `drawEraCities` runs the same rule, with the map EDITOR exempt: its
  pins are what a click is dragging.
  **The Heightmap layer's STRENGTH is the reader's** (`hmOpacity` / `setHmOpacity` / `#hmOpacityRow`, Aug
  2026, on request): a slider in the legend, under the row that turns the layer on and shown only while it
  IS on. It is applied as `globalAlpha` at the blend rather than baked into the reprojection buffer's
  per-pixel alpha, so moving it is a redraw and not a re-reprojection — and **`viewKey` carries it**, or the
  settled base cache would keep serving the old strength. Device-local
  (`localStorage["folio_hm_opacity_v1"]`), like the marker's position and the place sheet's height.
  **A GLOSSARY TERM CAN PUT ITSELF ON THE MAP** (`glossPlace` / `focusPlace` / `focusPoint`, Aug 2026, on
  request). A term the Atlas can show carries a map-marker button beside the × in its popup; pressing it
  closes the popup and routes to `map` with `{ focus }`. Two shapes and no third:
  · a term naming a **country** the map draws is flown to and **lit up** in the map's own gold — the ordinary
    selection paint plus the change-pulse — with **no info panel**, because the reader has just read about it
    and asked where it is, not for a second description;
  · a term naming a **point** (a cave, a gorge, a named region) gets a **gold dot and its name**, plus the
    expanding ring, and is drawn ONLY while focused. Most of these are not cities and have no business
    cluttering the map for someone who came to look at something else — but they ARE added to the atlas
    search index as kind `site`, so the place is findable by name and picking it focuses it the same way.
  Both land on `sfx("discover")` after the flight, and both are cleared by Esc and by the next click on the
  ocean. **The join is done at BUILD time** by `.claude/fetch-place-coords.js`, which writes two tables into
  glossary.js: `GLOSSARY_PLACES` (slug → `[lon, lat]`, **fetched from each article's own published primary
  coordinate**, never hand-written — a term whose article has none simply gets no marker) and
  `GLOSSARY_MAP_COUNTRY` (slug → the name world.js uses, with a short alias table for the ones the two spell
  differently). It is a build-time join because **world.js is a lazy 1.6 MB bundle and the popup has to
  decide whether to show its marker without it**. A continent, an ocean or a vague region is deliberately in
  neither table: it is not a place you can point at.
  **Frame-cost rules (smoothness batch, July 2026) — keep these when touching the render path:**
  · **Coalesce input renders.** `onGlobeWheel` calls `scheduleDraw()` (one render per rAF), EXCEPT right after its paced
    `forceComposite()` realloc, which needs a synchronous `draw()` (the realloc clears the backing).
  · **Borders are PRE-CHAINED, not per-edge.** `histTerr()` builds `_htRuns` = `{r0, r2}`, maximal same-mask polylines
    (rebuilt per era; entries reference the ring vertex arrays so editor vertex-drags flow through). The render strokes
    runs — never re-walk masks per frame — and skips the `'2'` pass when `r2` is empty (all geo eras).
  · **Cull before projecting.** Coast chains have bounding caps (`coastCaps()`, the `ADMC`/`cullHidden` pattern); the
    coast pass skips chains behind the horizon or off-screen. Any new global layer should get the same treatment.
  · **`_wild` is geo-eras-only.** Merger (groups) eras claim every country, so the wilderness pass is skipped entirely.
    Accepted delta: merger-era coasts lost a sub-pixel dark `landWild` seam fringe (an artifact of that pass).
  · **The wilderness pass COMPOSITES, it does not clip** (`landLayer()` / `landCv`, the `_wild` branch — the fix that
    made 1500–1938 as smooth as the present-day map, July 2026). Dark land, stipple and the claimed-land refill are
    painted into a transparent offscreen layer whose later passes run under `globalCompositeOperation = "source-atop"`,
    so they reach land pixels and nothing else; one `drawImage` puts the layer on the globe. The old path filled all
    117k GEO vertices dark, filled them again with the stipple pattern, then built a clip out of every era-territory
    ring and filled + stroked all 117k a third and fourth time inside it — **four world-sized passes where the
    present-day map does one, each of the 258 fills rasterized against a 20–45k-vertex clip mask.** Under the composite
    the stipple needs no geometry at all (one `fillRect`) and the refill is one territory-sized fill. The claimed fill
    is followed by a `stroke()` of the SAME path so a claimed coast keeps its light edge over the dark base's own
    stroke — drop that and every coast grows a dark hairline. `landCv` is freed on present-day/merger eras and in
    `cleanupGlobe`, so only a geo era pays for the buffer. **Never reintroduce a per-frame `ctx.clip()` over
    world-scale geometry** — that, not the vertex count, is what made the older maps unusable.
  · **Motion frames are cheaper on purpose.** While `moving`: the whole city layer is skipped (`drawCities` and
    `drawEraCities` return at the top), selection glows drop `shadowBlur`, and the selection's gold COASTLINE
    (`strokeCoastClipped`, two more clips + a scan of every coast chain in the region) is skipped — the fill is still
    clipped to the land, so only the bright coast edge waits for the settled frame. Everything returns when settled.
    **A pin and its name go together** (changed Aug 2026, on request): the label layout is a spatial grid plus
    thousands of short-lived rect arrays per frame and can only run on the settled frame, but drawing the PINS
    anyway left a field of nameless dots through every drag and zoom. The map editor is the one exception —
    `drawEraCities(era, editable)` still draws while `editable`, since those pins are what a click is dragging.
  · **A selection paints as ONE batch** (`paintFillGroups`; `paintFillRings` is now a single-group wrapper). A click on
    a geo era selects a whole EMPIRE — dozens of territories — and painting them one at a time meant one GEO-derived
    clip mask, one coastline scan and two full Gaussian `shadowBlur` passes **per territory, per frame**: dragging with
    an empire selected cost ~4× dragging with nothing selected, and was the likeliest source of the browser hanging.
    Batched, the whole selection shares one clip (bbox- **and** `cullHidden`-filtered, or a world-spanning empire drags
    the far side of the globe into the mask), one stroke path and one coast pass. Fills stay per-entity so ring holes
    survive.
  · **The selection overlay is cached.** `drawSelectionOverlay()` renders selSet/subSelGeo/subSelUK once into `selCv`
    (key = `baseKey` + selection ids) and blits it, so pulse/crossfade rAF frames never re-blur dozens of territories;
    motion frames paint direct. It temporarily reassigns `ctx` (hence `let ctx`) — restored in a `finally`.
  · **Reuse buffers, release big ones.** `drawHeightmap` keeps one `_hmId` ImageData per size; `fadeCv` frees its
    backing when the crossfade retires; `selCv` frees when nothing is selected.
  · **Heightmap grays live on `window.__folioHM`, NOT in the page closure** — the loader frees the multi-MB data-URI
    (`window[L.vn] = null`) and zeroes the decode canvas, so the extracted grays are the only surviving copy; per-mount
    state would force a script re-inject + re-decode on every Atlas revisit.
  · **The idle warm must never fire mid-gesture.** `coastEdges()`/`worldEdgeOwners()` (~1.3s combined) are warmed after
    mount via `requestIdleCallback`, but the callback **reschedules itself while `moving || dragging || ptrs.size ||
    flyRAF || playT || mapDragging`** — an rIC timeout landing during a drag would freeze the globe under the pointer.
  **Game mode + approachability (batch 3):** `PAGES.findit` routes to `PAGES.map(root, {game:true})` — the **"Find it"
  daily minigame** plays on the real globe (`const GAME` gates everything): 5 date-seeded rounds from
  `buildGameRounds()` (2 present-day countries, 2 historical territories, 1 capital; **one seeded RNG stream PER pool**
  so intraday data changes can't reshuffle the day; a `used`-names Set dedupes targets across rounds; quality gates =
  bbox area + `countryDesc` exists + an ETHNO name regex). Taps route to `gameTap` (countryAt name match, or
  haversine ≤300 km for capitals) — a wrong pick **flashes RED and opens ITS info panel** (`GAME_RED` via the shared
  `pulseCol`; a miss still teaches), one retry with a km-distance hint, then `gameReveal`: **GREEN pulse when found,
  gold when missed**, over ALL same-named polygons (capitals get a **geo-anchored `pulsePin` ring** since the fly alone
  is cancellable), and the **answer's info panel opens** (capitals → the owning state via `ownerIdxAt`). The country
  popup is therefore NOT in the `.atlas-game` hide list — it is the game's learning surface; `gameShowRound` closes it
  per round. `pulseCol` resets to gold wherever pulses fire outside the game (`pulseChanges` does). Scoring: first-try
  finds; `won` needs `n >= 5` AND all first-try; `gameEnd` → `markGamePlayed("findit", …)` + `save()` +
  `checkAchievements()`.
  · **A PULSE CANNOT CARRY AN ANSWER, AND FOR A FORTNIGHT IT WAS ASKED TO** (`gameMarks` / `gamePin` /
    `drawGameMarks` / `TINT_MISS` / `TINT_FOUND` / `TINT_ANSWER`, Aug 2026, on a bug report). The pulse is a
    1.6-second throb and then nothing, which is right for "these territories changed hands on that step" and
    wrong for an answer: a reader who missed twice was told "It was here." and looked up to find the flash
    already over and the map exactly as it had been — the answer announced and then withdrawn before it could
    be read. The wrong guess had the same fault the other way round, flashing red at the one moment the reader
    is looking at their own finger rather than at the map. So both are now **PAINTED and stay painted until
    `gameShowRound` clears them**: a LIST, since a round can hold two wrong guesses in red with the answer's
    gold over them. A revealed CAPITAL gets `gamePin` instead — a dot with its name beside it, drawn like
    `focusPoint` — because a city on a coastline of a thousand others cannot be shown by a ring that fades.
    · **Deliberately NOT `selSet`.** That is the map's gold, and `drawSelectionOverlay` caches it into `selCv`
      under a key made of its MEMBERS alone, so two marks wanting different colours would blit whichever was
      cached first. `drawGameMarks` paints direct instead, which costs nothing here: a mark lives for one
      round, there are never more than a handful, and the reveal is followed by a `flyTo`, so the frames it
      appears on are moving frames the cache would be rebuilding for anyway.
    · **`paintFillGroups` / `strokeCoastClipped` take an optional TINT** (`{rgb, fillA, line, glow}`, default
      `TINT_SEL`) so the game's three colours reuse the painter's exact edge-tracing — mask-aware, coast-clipped
      — rather than a second outline routine that would trace the era polygon's own offset shore. `TINT_SEL`
      writes `line` and `glow` out in full so the shipped gold selection is unchanged: its outline is a
      LIGHTER amber than its fill, which deriving them from one triple would have quietly flattened.
  **Anti-cheat gating**: `.atlas-game` CSS hides search/legend/hover-chip/hint, game mode
  **forces `citiesOn`/`majorCitiesOn`/`countryNamesOn` false** (a capital label on the board IS the answer),
  **the timebar is GONE** — `.atlas-game{--timebar-h:0px}` plus `display:none` on the bar, Aug 2026 on request.
  It used to be left on screen `inert` and slightly dimmed so the board would still look like the Atlas, but the
  round names its own year in the question, the rail cannot be touched and stepping years is precisely what the
  game must not allow, so it was a fifth of a phone screen spent on a control with nothing to say. **Setting the
  variable on `.atlas-game` rather than `:root` is what gives that height back**: `.globe-stage` is a descendant,
  so it inherits the zero and grows into the space, and every other rule written against `--timebar-h` is left
  describing the ordinary Atlas. The markup stays (hidden, so out of the tab order too), so `paintYear`,
  `renderMapYearMarks` and `layoutTicks` need no game branch — the last returns early on a zero `clientWidth`.
  `stepYear`/`playTick` keep their GAME guards, and the whiteboard never mounts. **A same-day replay is turned
  away at the door** by `gameLockedToday` in `PAGES.findit` (Aug 2026, on request — see the daily-games bullet).
  It used to be admitted as PRACTICE, playable and recording nothing, since the rounds are deterministic and
  every answer was revealed during play; `gamePractice` and its four branches are **deleted rather than left
  unreachable**. The Atlas also gained **first-visit coach
  marks** (`#atlasHelp` overlay, auto-shown once via `localStorage["folio_atlas_tour_v1"]`, reopened by the `#gzHelp`
  "?" button — **five tips since Aug 2026**, a marker one having been added on request: the whiteboard draws on the
  globe as it does on a study card, and the strokes there are geo-anchored, so they turn with the map. The Library
  now carries the same kind of card; see `pageHelp`) and **keyboard navigation** (canvas `tabindex=0`: arrows rotate, Enter selects/answers at the disk
  centre, Esc clears, `[`/`]` step map-years). The **`#gzIn`/`#gzOut` zoom buttons' markup was restored** (wiring + CSS
  existed but the DOM had been lost in an old refactor); the `.globe-zoom` column now sits **bottom-right** — at
  top:50% it collided with the (top-right) legend on short viewports. Clicking a country
  (present-day or a historical era's territory) highlights it and shows a single info popup above the
  timeline — its name + a 5-sentence description from `countries.js`; one at a time, cleared on a second
  click / ocean click / era change. The popup is a **vertical panel on the LEFT of the stage** (the base `.country-pop` rule:
  `left:clamp(16px,4vw,40px); top:16px; bottom:16px; width:min(360px,…)`, single-column `.cp-cols`) — the legend moved to the
  **top-right under the search box** (`.globe-legend{right:…; top:60px}`) to free the left edge. On **≤720px** it reverts to a
  **bottom sheet**. In both layouts it is `display:flex; flex-direction:column` and its
  **`.cp-cols` scroll internally** (`overflow-y:auto; min-height:0`) so the box never pushes the absolutely-positioned
  **`.cp-close` (×) off screen** — the × stays pinned while the columns scroll. Don't put `overflow` on
  `.country-pop` itself (the × would scroll off). **The scroller is reset on every populate**
  (`showCountryPopupName` sets `scrollTop` AND `scrollLeft` to 0) — the popup element is REUSED, so without it the
  next place opens wherever the previous one was left: however far down it on the desktop panel, and however far
  ACROSS on the phone.
  **Its parts each fold** (`.cp-sec` + `.cp-sec-head`/`.cp-sec-body`, one delegated click listener on
  `#countryPop`): the description, the year paragraph (whose header IS the year number, so it still reads while
  shut), the figures grid and the sources. `cpSection(sec, hasContent, alwaysShow)` sets each one as the popup is
  filled — **open when it has something, closed when it doesn't**, so a place with no year paragraph and no
  figures shows two quiet headers instead of a dash and a grid of dashes. That **resets per entity**: a reader's
  manual toggles belong to the popup they were made in, not to the next country.
  **On a phone and a tablet those sections were PAGES for a year** (Aug 2026, on request). The sheet is short,
  and four stacked sections buried the figures three scrolls down, so `.cp-cols` became a `flex-direction:row`
  `scroll-snap-type:x mandatory` scroller whose `.cp-sec` children were each `flex:0 0 100%`, swiped between one
  page at a time under a row of dots. **Retired Sep 2026, on request**: "users currently need to swipe right to
  see the country data boxes — instead, move them to above the country background paragraphs so it is all in one
  page." Reading the figures FIRST fixes what the pager was built for without a gesture, and the gesture was the
  worse half of it — a page reached only by swiping is a page a reader who does not swipe never learns is there,
  and the dots were the only thing on the sheet saying otherwise. Gone with it: `#cpDots` and `cpSyncDots` /
  `cpActiveDot` / `cpPanes`, the snap and one-page-swipe machinery (`scroll-snap-stop:always` and
  `wireOnePageSwipe`, whose only caller this was), and `cpFitH`, which re-fitted the sheet after a swipe.
  What the sheet is now: the sections **stack and scroll**, as they do on the desktop, with `.cp-statsec`
  lifted above them by **`order:-1`** in the ≤1024px block. It is `order` rather than a moved node so the
  DESKTOP column — which has room for both and is read top to bottom, where the paragraph is what the reader
  came for — keeps the order it has always had; the cost is that the sheet's visual order and its DOM order
  differ by one section. Three things survive from the pager and are still load-bearing: **the title block
  lives in `.cp-head`, outside the scroller** (it was `.cp-main`, inside it); an EMPTY section is **dropped
  outright** (`cp-blank`) rather than shown collapsed, since on a box this size a header with nothing under it
  spends a line on an absence — except the description, which passes `alwaysShow` because it carries a "no
  description yet" line; and `cpResize` re-derives the height when a rotation crosses the breakpoint.
  **The section heads fold again on the sheet**, which they could not while they were pages, and a fold
  re-applies the height (see below).
  **The discovery chip shares the title's row** (`.cp-titlerow` wrapping `#cpName` + `#cpNew`, Aug 2026, on
  request): it names the place beside it, and a line of its own cost the short phone sheet a whole line before
  the description started. It reads **"New discovery!" and carries no counter** since Sep 2026, on request —
  a running "7 / 258" beside a place's name is a second number competing with the one thing that line is for,
  and the reader's tally is on the account page, read on purpose rather than glanced at over a map. The Atlas's
  own `geoNameSet` / `countriesSeenCount` went with it; `placesSeen` is still written, and `countrySeenCount`
  still reports it.
  **…AND THE ROW NO LONGER WRAPS** (Sep 2026, on a bug report: a long country name, with the chip beside it,
  pushed the × onto a second line, "so it appears in the bottom left"). Four items on one `flex-wrap:wrap` line
  means the last two — the chevron and the × — are the ones pushed over, and the close button of a panel then
  sits as far from where a reader looks for it as the box allows. `.cp-titlemain` wraps the name and its chip
  and is the only item allowed to shrink or to wrap; the row itself is `nowrap`, and the two controls are
  `align-self:flex-start` so a two-line name keeps them at the TOP right rather than centring them against it.
  **The sheet's CEILING is what its CONTENT needs** (`cpContentNeedH` / `cpColsContentH`, Aug 2026, on request:
  "the max height should always be the point where everything is displayed fully, so we are never left with
  empty space at the bottom"). `cpMaxH()` is the smaller of the room the screen has and the height the sections
  actually ask for, and folding one away pulls the sheet down to fit what is left. **Both halves of that
  measurement are taken off content rather than off boxes, and each was wrong once for the same reason.** The
  head is measured by its own `scrollHeight`, not by where `.cp-cols` sits under it: it is `flex:0 1 auto`
  inside the box being resized and is measured while the box is still at the height it is opening FROM, so at
  that instant it is squeezed and the sheet opened ~26px shy of its content — a paragraph cut off mid-line, in
  the state the fit exists to prevent. And the sections are added up (`cpColsContentH`) rather than read off
  `.cp-cols`'s `scrollHeight`, which can never be less than the padding box we have already given a height:
  folding a section away therefore measured as a no-op and left the sheet exactly as tall as the paragraph
  that was no longer in it.
  **The sheet's HEIGHT is the reader's to set** (`.cp-grab` / `cpWireResize` / `cpApplyH` / `cpMinH` / `cpMaxH`,
  Aug 2026, on request): drag the grip at its top edge — a pill centred on it, since a draggable edge with no
  mark on it is one nobody will find — down to the title bar alone or up to the top of the screen. Stored as a
  **fraction of the viewport** in `localStorage["folio_cp_h_v1"]` (device-local like the marker's position, and a
  fraction so a rotation keeps the proportion), re-applied on every `showCountryPopupName`, so the next place
  opens at the height the last was left at. `.cp-sized` is what takes the stylesheet's 52% cap off and lets
  `.cp-head` shrink; the desktop panel is untouched (`cpSheetOn()` — `cpPagerOn` until Sep 2026, when the
  pager it was named for went — gates everything, and the grip is `display:none` above the breakpoint).
  **`cpMinH` measures through `offsetTop`/`offsetHeight`, never `getBoundingClientRect`** — and this is the whole
  trick. The head is a scroller inside the very box being shrunk, so its rect reports whatever is left of it, and
  a floor derived from that collapses as the drag approaches it: the first version bottomed out at the hard 56px
  and the title scrolled out of the sheet it was meant to be the floor of. Offsets are layout values and do not
  move.
  **AND ON A PHONE IT NOW OPENS SHUT — THE NAME AND A CHEVRON, NOTHING ELSE** (`cpShut` / `cpSetShut` /
  `cpSyncMore` / `#cpMore` / `.cp-shut`, Aug 2026, on request: "the popup panel at the bottom should only
  open far enough to reveal the name of the state, but have a chevron that can reveal the information
  sections, which should always be collapsed by default"). Tapping a country on a 390px screen used to
  raise a sheet over half the map — the map being the thing just tapped — before the reader had asked for
  anything but the name. **The shut height IS `cpMinH()`**, the floor the drag already measured, so there
  is one definition of "the title bar alone" and the chevron and the grip cannot come to disagree about it.
  Three things follow. **It is reset to shut on EVERY populate**, before `cpApplyH`, since the element is
  reused and a reader who opened one country's sections has said nothing about the next. **The reader's own
  dragged height is kept rather than overwritten** — the chevron opens to it, exactly as the swipe-to-a-
  shorter-page fit does. And **starting a drag clears the shut state**, or dragging the grip upward would
  fight a rule that keeps pulling the sheet back to its floor. The chevron is `display:none` above 720px,
  where the panel is a column beside the globe and covers nothing; that base rule must sit BEFORE the
  ≤720px block, media queries adding no specificity.
  The popup (`#countryPop`) stacks: the state's **full legal official name**
  (`officialName()` — from the summary's "officially …", or a leading "Full Name, commonly known as …" form, with a state-type
  keyword fallback so e.g. USSR → "Union of Soviet Socialist Republics"), with the **years that iteration of the state existed** in
  **thin grey directly under the title** (`.cp-span` ← `countrySpan()` / `country-spans.js`; missing → the line collapses); + a
  **general description of the state**
  (`stripInfoNoise(countryDesc())`) that is **constant across timeline years** (keyed by the entity name — it only differs when
  the name does) and free of any figure shown in the number grid; the **year** + a per-year paragraph describing that state in
  that map-year (`country-years.js` → `countryYear()`; missing → a dash, never fabricated); and a 2×2 grid of **Population / Area /
  GDP / GDP-per-capita** tiles — **year-specific** (present year → `country-stats.js`; a past map-year → `country-stats.js`'s
  `COUNTRY_STATS_YEARS`; missing → a dash). Pop/Area/GDP come from `country-stats.js`
  (Wikidata); **GDP-per-capita is computed at render** as GDP ÷ Population (`statNum()` parses the formatted strings) — it is NOT
  stored. **Hovering (or focusing) a number** shows a small speech bubble naming its source ("Source: Wikidata" / "Calculated:
  GDP ÷ Population").
  Glossary terms in **both** the summary and the per-year paragraph are **auto-linked** (`autoLinkGlossary` +
  `setupTooltips`, same as card backgrounds) so each opens its gloss popup; the place's own name is skipped.
  **Wilderness / stateless (unnamed) areas are not clickable** (`countryAt` skips unnamed entities).
  **Two-level click / drill-down** (single = parent, double = child):
  - **Merger-only eras** (groups, e.g. 1960 *USSR*): single-click selects the whole group; **double-click** selects the
    **present-day country under the cursor** within it (`countryAt(px,py,true)`), highlighting its exact `world.js`
    borders (`subSelGeo` → `paintFillRings(GEO[subSelGeo].p,…)`) and showing its per-year info.
  - **Geo eras** (1900/1920/1938): every territory carries a **`.mother`** field (its sovereign / colonial power, classified
    by an agent pass and applied to `timeline.js`, since the source's `SUBJECTO` tag is unreliable — Algeria/Kenya/Angola are
    tagged as themselves). The click model is a drill-DOWN (more clicks = deeper): **single-click selects the whole EMPIRE** —
    every territory sharing that `.mother` (so clicking French West Africa lights up France + all French colonies) — and shows
    the empire named as an EMPIRE via the `EMPIRE_NAME` map (mother "United Kingdom" → "British Empire", "France" → "French
    colonial empire", "Denmark" → "Danish Realm", "Chinese Warlords" → "Warlord-era China", …; mothers already named as a state
    map to themselves; the US resolves to "United States of America"). Empire descriptions live in `countries.js` (13 added,
    workflow-researched + adversarially fact-checked). **Double-click selects just that one territory/home country** (British Raj,
    or the UK metropole "United Kingdom of Great Britain and Ireland") and shows its info. Independent states are their own mother
    (group = just themselves). Multi-tap is counted by `tapCount` (1/2/3, same spot within 400ms).
  - **UK constituent countries** (`uk.js`, in EVERY era incl. present-day): the UK's internal land borders (England–Scotland,
    England–Wales) draw light (`drawUKConstituents`). The constituents are the DEEPEST level, so they're reached by a
    **TRIPLE-click on a geo era** (empire → country → constituents) and a **double-click elsewhere** (present-day / merger era:
    country → constituents) — `constituentHit()` returns the one under the cursor (England / Scotland / Wales / Northern Ireland), era-aware: **before the 1922
    partition the whole island of Ireland was part of the UK**, so any Irish point → the all-Ireland "Ireland"; from 1922 only
    N. Ireland is, the Republic being a separate country). Its popup uses `showCountryPopupName(name, true)` → the constituent's
    general description (from the inline `UK_DESC`), no year paragraph or stats. Highlight state is `subSelUK` (an array — the (era-aware: **before the 1922
    partition the whole island of Ireland was part of the UK**, so any Irish point → the all-Ireland "Ireland"; from 1922 only
    N. Ireland is, the Republic being a separate country). Its popup uses `showCountryPopupName(name, true)` → the constituent's
    general description (from the inline `UK_DESC`), no year paragraph or stats. Highlight state is `subSelUK` (an array — the
    pre-1922 all-Ireland selection lights both Ireland + N. Ireland). The drill is checked **before** the era logic, so it works
    over the UK in a colony-grouping geo era too (and a non-UK double-click still drills to the colony/present-day country).
  - The **info box** layout is the **same in every era** (`showCountryPopupName`): title = the state's full official name, the
    left/main paragraph = its general description (**constant across years**, keyed by the entity name), and the middle column =
    the per-year paragraph (`countryYear()`) describing that state in the selected map-year — so the constant "who they are" sits
    beside the year-specific "what was happening". `stripInfoNoise()` strips translation parentheticals + any sentence quoting an
    actual **numeric** grid figure from both — money (`$/€ N`), a population/GDP count in millions/billions, or an area in
    km²/sq mi. (It matches numeric figures only, NOT the bare words "population"/"GDP" — matching the words wrongly dropped
    figure-free general sentences like "most of the population lives on the coast"; don't reintroduce word-matching.)
    Stats (the number grid) are present-day Wikidata figures → shown only at the
    present year, a dash otherwise. (Earlier the historical box used the year paragraph AS the main text; it now mirrors the
    present-day layout.)
  - **`c` means two different things, and it bit once.** On an era territory (`timeline.js`) and a UK subunit
    (`uk.js`) `c` is the per-ring **edge mask**; on a `world.js` country it is the **label centre `[lon,lat]`**.
    `paintFill` / `paintSelection` read `terr[idx].c` off `terr = histTerr() || GEO` and passed the centre in as
    a mask, so `masks[r].charCodeAt(i)` threw for **every selection on the present-day map** — aborting the paint
    before anything was blitted, which meant clicking a country there produced **no highlight at all** (fixed
    July 2026 by passing `ht ? terr[idx].c : null`; the historical eras were always fine). Every other reader of
    `GEO[i].c` treats it as a point. If you touch either painter, keep the mask era-only.
  - **The golden overlay traces EXACTLY the edges the map draws** (`paintFillRings`) — it must match the displayed borders +
    coastlines. For masked geometry (era territory / merger group / UK constituent) it strokes only the political borders
    (`'0'` inter-group + `'2'` sub-country) and **skips `'1'` (the entity's own coast) and `'3'` (hidden)**; the coast is then
    added from the **present-day `coastEdges()` clipped to the region** (`strokeCoastClipped`, bbox-filtered) so the gold coast
    sits on the *drawn* coastline, never the era geometry's offset shore. The double-click **drill** (`subSelGeo`, an unmasked
    present-day country inside a merger era) skips any edge in `hiddenEdgeSet()` — the era's `'3'` edges — so it never draws a
    border the map omits (e.g. the S. Sudan split line pre-2011). This fixed the old artifacts: gold coast fragments around the
    southern USSR's inland seas (Caspian/Aral/Balkhash `'1'` edges) and present-day borders showing on older maps.
  - **Soviet republics on the geo eras** (`drawSovietRepublics`): the source's 1920/1938 USSR is a single polygon with **no
    internal republic borders**. To show its union republics (as the merger eras 1960+ already do via `synthGroups`, and the UK
    shows its constituents), the present-day **post-Soviet internal borders** (edges shared between two of the 15 successor
    states, `SOVIET` set) are overlaid **limited to the era's USSR extent**, light like a `'2'` sub-border — an accurate proxy
    for the union-republic boundaries (the Central-Asian/Caucasus borders were settled by 1936). Limiting to the era polygon
    keeps e.g. the still-independent 1938 Baltics out. Drawn on the map in `renderStatic` next to `drawUKConstituents`.
    That limit is a **per-era cached midpoint test** (`sovietSegsForEra`, keyed on `_htId` + `mapEditRev`), not a canvas
    clip: it used to build a complex clip mask from the USSR polygon on **every frame** of 1920/1938 for a layer whose
    geometry can't change within an era.

## Your own atlas — the second tab (Sep 2026, on request)

> "On the Atlas page, add a second tab, which will feature the user's own explored Atlas. Opening the
> Atlas page should default to this tab. On this personal atlas, the whole globe should have no borders
> or dots shown at first and be empty (except for landmasses+oceans+rivers etc.) in every year since
> 4000 BCE. By studying cards from the curated collections, users unlock these countries and places on
> the atlas in the appropriate years. … The information of the popups that appear when clicking a city
> or country can be directly the answer side of the card. … The page doesn't need a legend."

`CLAUDE.md`'s Atlas bullet carries the rules. This is the reasoning behind the three decisions that were
not obvious, and the one measurement that settled the hardest of them.

### "In the appropriate years" without a table of dates

The obvious reading — a modern state appears from its independence year — needs an independence year for
233 countries, which Folio does not have and which is not a thing to invent. `country-spans.js` was the
first candidate and was measured: **13 of `world.js`'s 258 countries have an entry**, so it answers for
5% of the deck.

The answer that works is a level down. `map.key` names a place in `world.js`; every one of the Atlas's
thirteen eras *also* files its own territories by name; so the unlock is the NAME, and the personal globe
draws whatever territory of that name the era for the current year happens to carry. Measured over the
shipped timeline, **every one of the 258 present-day countries is named in at least one era**, the
earliest ranging from 1500 (France, Cyprus, Ethiopia) to 1960 (Indonesia, China, Israel, Vietnam).

Three things follow, and all three are improvements rather than compromises:

- What is on screen is exactly what Folio's own maps say, in the shape those maps give it — so an
  unlocked France is its 1600 self in 1600 and its own self today, and the reader can watch it change.
- A state simply does not appear in a year whose map has no such state, which is the requested behaviour
  falling out of the model rather than being enforced by a rule.
- Before 1500 there is no era map at all, so the globe there is landscape plus the reader's own locator
  marks — which is precisely the "empty in every year since 4000 BCE" the request describes, and is why
  the tab can offer 4000 BCE where the world atlas stops at 1000 BCE.

A `us-states` / `china-provinces` shape belongs to no era and is today's boundary, so it is drawn only
where the era's geometry IS `world.js`'s (`eraIsModern` — a property of the era, not a year somebody
picked). Wyoming over a 1600 map would be a claim Folio does not make.

### Why the register is derived and not stored

`atlasUnlocks()` reads `S.cards`. That is the same test `locatorSiblings` already uses to decide which of
a collection's places a card map draws, so the two cannot disagree about what "studied" means — and it
means the feature shipped with no new `PROGRESS_FIELD`, no migration, and nothing to keep in step. The
one visible consequence is the right one: **Reset progress on a deck takes that deck's places off the
globe**, which is what a reader who has just forgotten a deck would expect.

It is cached on the number of studied cards and the sizes of the three shape globals, and cleared by
`uCacheBust` — declared beside it rather than beside `atlasUnlocks` for the temporal-dead-zone reason
`_locSibCache` is (`uCacheBust` runs at boot out of `applyAdminEdits`).

### Two rails, and why only one of them bends

The world atlas's rail is piecewise because it has thirteen STOPS, twelve of them after 1500, and a
linear scale crowds them into the right edge. The personal atlas has no stops: every year has a map,
because the earth is always there. A bent scale there would buy nothing and would lie about how far apart
two years are, so `year2frac`/`frac2year` are linear on that tab and `snapYear` returns the year it was
given. The era years are still marked on the rail — that is where the political shapes change — but the
pin slides freely between them, and the chevrons step by a century in the deep past and a decade after
1500, because one fixed step of 25 years is 240 presses from 4000 BCE to today.

### What the tab does NOT get, and why each absence is deliberate

- **No legend.** Its layers are the earth's; there is no political toggle to offer. Which makes
  `riversOn` the one toggle that tab actually reads, and it is forced on — the request names rivers, and
  a layer promised with no control to reach it is worse than one not offered.
- **No search.** The search index is the WORLD atlas's, so a hit would open a panel about a place the
  reader has not unlocked — on the tab that exists to show only what they have.
- **No hover chip from `hoverIdx`.** That index is the world atlas's territory index and is not
  maintained here, so the chip went on naming whatever country had last been under the cursor. It reads
  `mineAt` now, and names the reader's own place or nothing.
- **No empire drill.** One click, one level: a place is either the reader's or it is not there, so the
  single/double/triple ladder has nothing to count.

### The popup

It reuses the country panel rather than building a second one — the panel is a sheet on a phone and a
column on the desktop, it resizes itself, it closes on Escape, and it is what the reader already knows
how to dismiss. Its year paragraph, its Wikidata figures and the Atlas's own citation fold are hidden:
all three describe a country as the world atlas knows it, and what is being shown is a card, whose own
facts and sources arrive inside `buildBack`.

It goes through `mountCardBack` rather than raw markup, for the reason the Multiple Choice card back
does: the footnotes have to be numbered, the glossary terms wired and the picture made to open, and a
surface that renders `buildBack` without that wiring is a card with dead links.

One CSS rule is load-bearing and was found by looking at the page: **`.cp-tools[hidden]{display:none}`**.
`showMinePopup` hides that row, and an author `display:flex` beats the `hidden` attribute — the same trap
`.ces-imgpanel` and `.af-src` already carry — so the Atlas's "Through the ages" button stayed on a panel
that is showing a card rather than a country.

### The empty state

A reader who has studied nothing meets a world with no marks on it, which is exactly right and says
nothing about itself. `.atlas-empty` names what the globe is waiting for and offers a way to the
collections; it is drawn only while the register really is empty.

### Twelve further suggestions (Sep 2026, on request)

Asked for, not built. Each is written with what it would actually cost, because a suggestion without one
is a wish. Roughly in order of what each buys against what it costs.

1. **An unstudied place, drawn as a ghost.** The globe cannot currently tell "there is nothing here" from
   "there is something here you have not reached", so a reader half way through Ancient Greece sees a
   scattering of red and no sense of what is left. A faint hollow ring at every place in a collection the
   reader has BEGUN — never in one they have not, or the map stops being empty — turns the globe into a
   map of the work remaining, which is the deck progress bar laid on the geography. `atlasUnlocks` already
   walks every card in `S.cards`; this walks the collection's other cards beside it and pushes a second
   list. **Small, and the biggest single change to what the tab is for.**

2. **A search over your OWN places.** The world tab has one and this deliberately has none, on the
   reasoning that a hit would open a panel about a place the reader has not unlocked. That reasoning does
   not apply to a search restricted to the register: past three or four hundred marks, turning the globe
   is the only way to find one. Reuse `gsIndex`'s box and feed it `atlasUnlocks().names` and `.marks`.
   **Small; the index is already built.**

3. **Fly to what you unlocked last.** A reader who has just studied ten Korean cards opens the atlas over
   the Netherlands. One control — using the existing `flyTo` and the newest `S.cards[id].first` — puts the
   map where the reader has just been. **Very small.**

4. **Open on the reader's own century rather than on the present.** The tab opens at the present, which
   shows every modern country and none of the ancient ones; a reader whose register is Rome and Greece
   meets a map with almost nothing on it. Opening on the MEDIAN year of what they hold would put a Rome
   reader in the Republic and a Japan reader in the Nara period. **Small, and it changes the first
   impression of the feature more than anything else here.**

5. **"Study this" on the popup.** The panel already draws the card's whole answer side; the one thing it
   does not offer is a way into the card. A single button routing to the `{type:"ids"}` scope would make
   the globe a way INTO the deck rather than only a record of it. **Small.**

6. **Say what the tab holds, on the tab.** "Your atlas · 412" tells a reader the register is growing
   without their having to hunt the map for a new dot — which is the whole reward the feature is built on,
   and at the moment only the map itself states it. **Trivial;** `atlasUnlocks().count` is already
   computed for the render cache key.

7. **The empty state should say what fills it.** `.atlas-empty` says the globe is empty and offers the
   collections; it does not say that studying a GEOGRAPHY card is what puts a country on it and a card
   with a locator what puts a place. One sentence. **Trivial.**

8. **A ruin should not look like a capital.** A mark appears in its earliest year and never leaves, which
   is right about a place — Yinxu is still there — and means that at 2026 a reader sees Bronze Age
   capitals mixed with modern ones and nothing telling them apart. Drawing a mark whose card's span has
   ENDED as a hollow ring rather than a filled shape keeps the request ("no end date") and still says
   "this is a ruin". **Small;** `cardSpanYears` already gives the end, and `mineMarks` currently throws it
   away for a dot.

9. **One small layer control.** The tab has no legend by request, and three things are nevertheless drawn
   unconditionally: the rivers, the civilisation washes and the modern province borders. A reader working
   on ancient history has no use for the third. Not the world atlas's legend — one compact row of three.
   **Small, and it needs the request's "no legend" read carefully:** what was refused was a panel of
   fourteen layers, not the ability to turn off a line.

10. **A trail through the register.** Ordering the marks by `S.cards[id].first` and drawing the most
    recent few in a warmer red would show a reader the shape of their own progress through a collection —
    Athens, then Sparta, then Miletus. **Small,** and it is the one idea here that says something the
    deck list cannot.

11. **A share link for a year.** `#map/<year>/<slug>` already deep-links the world tab; `#mine/<year>`
    would let a reader link the year they are looking at. **Medium** — it needs the route, and it wants
    the reconcile question answered first: a link is only worth sharing if the other reader's globe shows
    something, and their register is their own.

12. **A friend's atlas.** `profiles` is readable by any signed-in user and a friend's `progress` already
    is too (RLS scopes it to accepted friends), so "see what they have explored" is reachable without a
    schema change. **The largest of the twelve** — it needs a second register keyed on somebody else's
    cards, and every helper here reads `S.cards` directly. Worth stating precisely because it looks
    cheap and is not.

**Two that were considered and are NOT recommended.** A heatmap of how many cards each country carries —
the globe would then be about the corpus rather than about the reader. And a globe animation that plays
the register forward through the years: `stepYear` and the play button already do exactly that, and a
second control for it would be two answers to one question.


---

# The personal atlas in full, moved out of `CLAUDE.md` (2026-09-11)

**READ BEFORE TOUCHING THE PERSONAL ATLAS TAB.** The account of the second tab as it stood in
`CLAUDE.md` until it was moved here verbatim: the requests it was built from, each measurement, the
reversals (the country labels placed and then removed, the three retreats of the modern-capital layer,
the closed-loop shortcut tried and withdrawn), and the faults that rendered perfectly while being
wrong. The RULES stay in `CLAUDE.md`, in their imperative form.

· **YOUR OWN ATLAS — A SECOND TAB, AND THE ONE THE PAGE OPENS ON** (`atlasTab` / `MINE` /
`atlasUnlocks` / `mineShapes` / `mineMarks` / `mineAt` / `mineSel` / `drawMineShapes` /
`drawMineMarks` / `mineCoastSkip` / `landDim` / `showMinePopup` / `eraIsModern` / `.atlas-tabs` /
`.atlas-empty` / `.cp-mine`; Sep 2026, on request). The globe
starts EMPTY — land, ocean, lakes, rivers and coast, and no border, dot or name anywhere — in every
year from 4000 BCE, and studying a card is what puts a place on it. Seven things.
**THE REGISTER IS DERIVED FROM `S.cards`, NEVER STORED.** A place is unlocked iff its card has a
record, which is the same test a locator window already uses for a studied sibling — so this needed
no progress field, no migration and nothing to keep in step, and resetting one deck's progress takes
that deck's places off the globe the same afternoon.
**A COUNTRY IS UNLOCKED BY NAME AND RESOLVED THROUGH THE ERA.** A geography card names a place in
`world.js`, and every one of the thirteen eras files its own territories by name too, so an unlocked
France is drawn in whatever shape the year's map gives it and does not appear at all in a year whose
map has no such state. That is the whole of "in the appropriate years" and it needed no table of
independence dates: **Folio's own maps already carry the answer.** A `us-states` or `china-provinces`
shape belongs to no era, so it is drawn only where the map IS present-day (`eraIsModern`) — today's
boundaries over a 1600 map would be a claim Folio does not make.
**A LOCATOR CARRIES ITS OWN YEARS, AND ONLY THE START OF THEM BINDS** (`cardSpanYears`; the end was
dropped in Sep 2026, on request: "cities and dot locations should have no end date, i.e. should appear
in their earliest known date of settlement and then stay visible until the modern day"). Both ends is
right about a STATE — which is what the country shapes answer for, through the era's own map — and
wrong about a PLACE: Yinxu is still there, and a globe that took Athens away in 300 CE was telling the
reader the city had stopped existing. What a card's span really dates is its SUBJECT, the Shang capital
or the classical city, and a dot on a map is the place rather than the episode. A card with no dates at
all is a place rather than a period — a river, a cave — so it is drawn in every year, which is the same
rule one step further on.
**THE RAIL IS LINEAR HERE AND BENT THERE, and nothing snaps.** The world atlas has thirteen stops and
bends its scale to keep them apart; the personal atlas has none, because every year has a map, so a
bent scale would only lie about how far apart two years are. **The chevrons step ONE YEAR** (Sep 2026,
on request); they stepped a century in the deep past and a decade after 1500, which is a chevron that
cannot reach most of the years its own rail holds. Crossing a millennium is what dragging the rail is
for, and a hold on the chevron still accelerates.
**THE POPUP IS THE CARD** — `buildBack` through `mountCardBack`, in the country panel's own shell, with
its year paragraph, its Wikidata figures and the Atlas's citation fold hidden: those describe a country
as the world atlas knows it, and what is being shown is a card, whose own facts and sources come with
it. `.cp-tools[hidden]{display:none}` is required — an author `display:flex` beats the attribute, the
trap `.ces-imgpanel` and `.af-src` already carry.
**NO LEGEND AND NO SEARCH** (the request says so for the legend; the search is the WORLD atlas's index,
so a hit there would open a panel about a place the reader has not unlocked). Which makes `riversOn`
the one toggle that tab reads, and it is forced ON: the request describes the empty globe as
"landmasses+oceans+rivers etc.", and with no legend a default of off is a layer promised and
unreachable.
**THE EARTH IS COLOURLESS UNTIL IT IS EARNED, AND A CLICK IS THE ONLY GOLD** (Sep 2026, on request:
"make countries colourless unless they are clicked, same as on the normal atlas. areas without any
known countries or places should appear slightly darker"). Every unlocked country was washed in
`TINT_SEL` at 0.16, which says "selected" about all of them at once and leaves a click nothing to say.
Two shades of the land colour do it instead — `landDim` for the earth at large, `land` for the states
this reader has reached — and the map's own selection gold is spent on the one shape just clicked,
tracked in `mineSel` (a NAME, not an index: the shape list is rebuilt whenever the era or the register
changes, and an index would light whichever country inherited the slot). **`landDim` IS NOT
`landWild`**: the era branch darkens its wilderness to 0.62 because that wilderness is a minority of
the map and carries a stipple; here it is nearly the whole earth on a reader's first day, and at 0.62
the globe reads as unlit rather than as unearned. 0.87 is a step, not a shadow.
**A MARK IS A RED DOT, AND ONLY EVER A DOT** (Sep 2026, on request: "make the dots red instead of
orange … mountain ranges like the Apennines should not be displayed … areas or regions (like Etruria,
Attica) should not show. countries or civilisations should"). The red is the locator windows' own
`rgba(200,69,60)`, so a place looks the same here as on the card it came from, and the gold is left to
mean one thing. A REGION and a RANGE are dropped from the register outright: they were a dashed wash
and a spine, and a dozen of them at world scale is a rash of blotches over an earth whose point is that
it is empty. Nothing is lost by it — a country or a civilisation is unlocked by NAME against the year's
own map and drawn in that map's shape, which is a better answer than any authored polygon — and they
are NOT demoted to a dot, a dot in the middle of Etruria being the false claim the card maps stopped
making.
**A SHAPE CARRIES ITS BORDER AND NO NAME** (Sep 2026, on request: "remove the name labels for
countries and provinces. Once a country is discovered, also show its border. Discovered provinces
should appear with dotted borders and selectable through a second-level/double click"). This reverses
a rule of the day before, and the reversal is the better answer: the names were placed at each
shape's own label point after a bug report that the United States was labelled over Europe (a bbox
centre is meaningless for a country crossing the antimeridian — Chukotka sits west of -180 and Alaska
east of it, so the box runs the full -180..180 and its centre is the North Sea, which is also where
France's fell in the Atlantic and New Zealand's on the wrong side of the planet). Correctly placed,
they were still a heap of words over the earth this tab exists to keep clear. **What says where a
country ends is now its OWN BORDER**, drawn for the shapes in the register and for nothing else — so
an inland state, which had no coast and so no edge of any kind, is finally a shape rather than a
patch. The country's is SOLID and in the map's own `border` ink (which the coast is stroked in too,
so a shared run drawn twice reads as one line); a **PROVINCE's is DOTTED**, which is how every atlas
separates the two and what `subdivInner` already does on the card maps. **A DOT KEEPS ITS NAME**: it
has no outline, so the name is the whole of what it says. `ringLabelAnchor` and the `lp` / `la`
fields went with the label pass.
**AND A PROVINCE IS THE SECOND CLICK** (`mineAt(px, py, sub)`): a state's own shape and its
province's coincide over most of their border, so "smallest wins" would hand every click inside
California to California and the country would be unreachable. The first click tests countries only
and the second provinces only — the world atlas's drill, two rungs instead of three, counted with
that tab's own 400ms window and 14px slop.
**A CULTURE OR A CIVILISATION IS DRAWN WITH ITS OWN EXTENT, IN THE YEARS IT STOOD** (`MINE_POLITY`,
the `area` marks, `drawMineAreas`; Sep 2026, on request: "ancient cultures and civilisations should be
displayed in their relevant years"). The earlier request — countries and civilisations yes, regions
and ranges no — could only be half kept, because a country is unlocked by NAME against the year's era
map and **Folio's maps begin at 1500**: every civilisation older than that had no shape to be drawn in
and appeared nowhere at all. What it does have is the authored `area` on its own card. **THE
DISCRIMINATOR IS THE CARD'S OWN KIND TAG** — `culture`, `people`, `state`, `dynasty`, `empire`: a
polity or a people, which is what "civilisation" means here, and NOT `place`, which is Etruria,
Attica, Latium and the Fertile Crescent, the regions the earlier request took off this globe.
Measured over the corpus that admits **30 of the 45 region locators and no geographic one**;
`rm-091` the Roman Republic is filed `era` by its own tags and so draws nothing, and the fix for that
is the card's tag rather than a wider rule here, since `era` is also the Bronze Age. **BOTH ENDS OF
THE SPAN BIND**, unlike a place's: the Liangzhu culture ends where Yinxu does not. It is drawn
DASHED, in the marks' red — a culture has no border to be right about and a crisp line would assert a
frontier Folio has not surveyed — and **CLIPPED TO THE LAND**, since an authored area is a dozen
points where a coast is a thousand. The clip is a `ctx.clip()` over the visible land rather than the
card maps' second canvas because it runs only in a frame that HAS a live civilisation in it; most
frames build no path at all.
**A RIVER IS NEITHER A DOT NOR A NAME** (Sep 2026, on request: "'Tiber' should not have a dot or
label"). It is drawn already — every river is, as one of the Atlas's own blue threads — so a dot on
one pins a 400 km course to an arbitrary point on it, which is the false precision a region's dot
would have been. It joins `range` and the non-polity regions in the register's own refusals.
**EVERYTHING DRAWN ANSWERS A CLICK** (same request): dot, culture, province, country, in that order
of how specific a claim each is.
**THE STRAY BORDERS ARE THE COAST CLASSIFIER'S GENEROSITY, AND THE FIX IS A MASK** (`mineCoastSkip`;
Sep 2026, on a bug report naming "the western border of Uzbekistan, some borders of Jordan,
Montenegro, the Netherlands, western Spain, the southern border of the Western Sahara"). `coastEdges`
calls an unshared world.js chain a coast if OCEAN is found anywhere within its bbox plus 1.2°, which is
why every reported stray is a land border a short way inland from a sea — and on the world atlas nobody
could see it, a border being drawn there anyway. This tab draws the coast and nothing else, so each one
stands alone in an empty continent. The discriminator is `coastEdges`'s own, two DIFFERENT countries
across the chain; it is not run in there because the world atlas has no use for it, and it probes the
chain's middle first so the fuller vote runs only for the few that look like a border. Measured: ~410ms
once, inside a first paint that already costs 1.4s on this tab, and **a shortcut that skipped CLOSED
loops was tried and removed** — a country's whole outline chains as one closed loop, its coast and its
unshared border together, so it took the fix to zero while looking like a five-times speed-up.
**AND THE POPUP SAYS NOTHING THE CARD ALREADY SAYS** (`.cp-mine`; Sep 2026, on request: "remove the
'Answer' header and 'From your card' tagline, the title bar (should only display when popup is
collapsed) and its dating"). Four repetitions of the card back beside them — the answer term is its own
heading and its dates are its date line — taken off by a stylesheet class rather than by four writes,
because the title bar has to come BACK when the sheet is collapsed (a collapsed sheet is nothing but
its title bar) and because the "Answer" label is inside markup `showMinePopup` does not build. The name
is still WRITTEN: it is what the collapsed sheet shows and what a screen reader reads.
**THE TAB IS MODULE-LEVEL AND `route()` RESETS IT**, which is what "opening the page defaults to this
tab" means; a `S.settings` value would send a reader who once looked at the world atlas back to it for
ever. Switching tab is `render()`, not `route()`, or the reset would undo the press. The two tabs keep
SEPARATE coach-mark keys (`folio_mine_tour_v1`), since a reader who dismissed the world atlas's card
months ago has never been told what this one is.
**WHAT CHANGED IN A SECOND SEP 2026 REQUEST ABOUT THIS TAB.** Six things, and four are decisions.
**A COUNTRY NOW ARRIVES IN THE YEAR IT WAS FOUNDED** (`mineFounded`; "ensure that each modern year
really appears in the year of its founding, e.g. the United States in 1776, China in 1949"). Folio's
maps step a century and then a decade, so the United States arrived in 1800 and the People's Republic
in 1960 — at the first map that happens to carry the name. **THE ERA MAPS BRACKET THE ANSWER AND THE
CARD SUPPLIES IT**: the first era carrying a name says the state existed BY that year and the era
before it says Folio's map did not show it THEN, so the founding lies in (previous, first], and the
card's own cited date line is read for a year inside that bracket. **IT CAN ONLY EVER MOVE A COUNTRY
EARLIER, and that clamp is what makes it safe to run over all 233 rather than hand-writing 233 founding
years.** MEASURED: unclamped it DELAYS 264 countries and takes FRANCE off the 1500, 1600 and 1700 maps
— `gw-`'s date line for France records the United States' recognition in 1778 — and Japan off the same
three on Perry's 1853. Clamped, 163 move earlier and none later. A state founded before the first map
that shows it is drawn in THAT map's shape, which is the only shape Folio has for it.
**THE MARKS AND THEIR NAMES ARE GATED BY ZOOM** (`MINE_SEP`, `MINE_LBL_Z`, `mineDotsShown`): a
separation in screen pixels thins the marks and the NAMES wait for zoom 2.6 altogether. Which mark
survives is RANKED — a capital first, then the title — so the set is stable between frames and zooming
in only ever adds; first-come over `Object.keys(S.cards)` would reshuffle the map on every grade. **And
`mineAt` reads the same thinned list**, or a click on empty ground opens a popup about a place that is
not drawn.
**A CAPITAL IS A SQUARE** and everything else a dot, which is the card maps' own convention one tab
over; **a CIVILISATION'S wash is GREEN** (`mineAreaFill` / `mineAreaLine`), red having made it read as
one of the reader's places writ large; and **`landDim` went from 0.87 to 0.78**, a step a reader can
see on a map whose whole grammar is earned-against-unearned.
**THE RAIL LOST THE WORLD ATLAS'S YEAR MARKS AND GAINED A RANGE** (`MINE_STARTS`, `mineStart`,
`setMineRange`, `.tl-range`): the marks are the world rail's thirteen stops, and on a rail where every
year is reachable they mark nothing while suggesting the pin will jump to them. The range is five
declared starts, each with its own ticks — a rail from 1900 wants decades where one from 4000 BCE wants
millennia — and it is closure state rather than a setting, like the glossary record's sort.
