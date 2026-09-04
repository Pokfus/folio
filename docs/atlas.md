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
