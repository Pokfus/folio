/* atlas.js — Atlas v2's page: the scene, the input, the worker bridge, the tiles, the water and the relief (docs/atlas-v2-design.md §2.1, §2.7).

   Phase 1a scope (§7): the present-day earth from atlas/data/topology.bin at three resident levels
   and from atlas/data/tiles/<z>/<x>-<y>.bin at two finer ones, drawn by atlas-gl.js, with drag,
   wheel, pinch and keyboard, and a tap that names the country under it through the ID pass.
   Phase 1b adds the WATER (atlas/data/water.bin and atlas/data/water/<x>-<y>.bin: rivers and lakes,
   fetched the first time either layer is on) and the RELIEF (atlas/data/relief/: the L0 sheet once
   relief is on, L1 tiles for the view), and the minimal LAYERS control: relief with its strength,
   rivers, lakes, graticule — remembered per reader. No labels, no timeline, no popup, no study
   material — those are Phases 1c–3. The page is reached at #map2; v1 at #map is untouched.

     window.AtlasV2.mount(root, { dataUrl, tileUrl, waterUrl, waterTileUrl, reliefUrl })  → controller

   WHAT HAPPENS ON MOUNT
     1. the DOM: a canvas, a zoom stack, the layers button and its sheet, a status line (the fetch's
        determinate progress, then the worker's), a caption for the picked name, and — on `#map2?perf`
        or after pressing P — the perf overlay — all inside `root`, which app.js's router replaces
        wholesale on navigation; a MutationObserver on the view notices that and disposes everything
        (the worker, the GL context, the window listeners), since PAGES functions have no unmount.
     2. the data: fetch() with a byte-progress bar; on file:// (where fetch of a local binary is
        refused) a sentence pointing at a local server — the `.js` twin of §Q-R4 is Phase 1d work.
     3. the worker: new Worker("atlas/atlas-worker.js"); where workers are refused the same file is
        loaded as a plain script with earcut beside it and driven through the identical message shape.
     4. levels arrive coarsest first and are uploaded as they land; the globe paints on LOD 0.
     5. tiles: past 1 km per pixel the view is covered by z=3 tiles, past 0.5 km by z=4 (§2.3). Each
        frame lists the tiles the viewport touches (the corners and edge midpoints unprojected to
        lon/lat); the ones the core header says exist are fetched, at most six at a time, parsed and
        triangulated in the worker, uploaded, and kept in an LRU of TILE_CACHE entries. Until a tile
        lands the renderer shows the finest resident level (or the parent tile) in its place. Water
        tiles (one level, on the z=4 grid) go through the same loader when lakes are on past 1 km/px.
     6. relief: relief.json names the pyramid; L0's three greyscale planes are fetched and decoded with
        createImageBitmap (colorSpaceConversion "none", premultiplyAlpha "none"), composed into one
        RGB array by the worker (an OffscreenCanvas) and uploaded; L1 tiles for the view likewise, in
        the same LRU. A phone (coarse pointer, short side under 768 px) never fetches level 2 (Q-M1 a)
        — a level the shipped pyramid does not carry anyway (§7 "Phase 1b — as built"). Relief fades
        out as the zoom passes the finest level's texel: full at RELIEF_FADE[0] km/px, gone at
        RELIEF_FADE[1]; it is a regional-scale wash, not terrain at street zoom.

   THE VIEW is a centre (lon, lat), a zoom and the layer flags. The rotation matrix R maps a unit
   vector on the earth to view space (x right, y up, z toward the viewer): R's rows are the right,
   up and forward vectors at the centre. Pixels per radian at the centre is the disc radius, so a
   drag of dx pixels turns the globe by dx / radius radians — the same feel at every zoom. Zooming
   keeps the point under the pointer still (unproject before, re-centre after). The level of detail
   follows kilometres per pixel: a level is used while its simplification tolerance is at most half
   a pixel — LOD 0 above 16 km/px, 1 above 5, 2 above 1, 3 above 0.5, 4 to the cap of 0.15 km/px
   (Q-A6 a), where the finest tolerance (75 m) is half a pixel and the quantum a fifth. Rivers are
   drawn down to RIVER_MIN_KM_PER_PX and smoothed past LOD 2 (§7 "Phase 1b — as built" says where
   their chords would show and why).

   FRAME ACCOUNTING for .claude/test-atlas-perf.js: the controller keeps the last 600 frame times
   (rAF to rAF, and the renderer's own draw time) under `stats`, and `statsNow()` returns the
   renderer's primitive counts of the last frame (land, rivers, lakes, relief) with the tile state;
   the suite reads them off `document.querySelector(".atlas2").__atlas2`. `setLayers({…})` is how the
   suites switch relief on without the sheet.
*/
(function (root) {
  "use strict";
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const R_KM = 6371.0088;
  const LOD_KM_PER_PX = [16, 5, 1, 0.5];     // LOD 0 while km/px ≥ 16, 1 while ≥ 5, 2 while ≥ 1, 3 while ≥ 0.5, else 4
  const ZMIN = 0.8;
  const KM_PER_PX_FLOOR = 0.15;              // the zoom cap (Q-A6 a): 150 m per pixel, where the LOD 4 tolerance is half a pixel
  const ADMIN1_KM_PER_PX = 4;                // admin-1 borders are drawn below this
  const TILE_CACHE = 96, TILE_PARALLEL = 6;
  const WATER_TILE_CACHE = 64;
  const RIVER_MIN_KM_PER_PX = 0.35;          // rivers are not drawn closer than this (chords of a 1:10M line would show; §7 Phase 1b)
  const RELIEF_L1_KM_PER_PX = 6;             // L1 patches are wanted below this (L0's texel is 9.8 km: under two pixels here)
  const RELIEF_FADE = [2.5, 1.0];            // km/px: full strength above the first, gone below the second (L1's texel is 4.9 km)
  const RELIEF_CACHE = 10;                   // L0 + up to nine L1 tiles resident (2048² RGB is 12 MB each on the GPU)
  const LAYERS_KEY = "folio_atlas2_layers_v1";
  const PHONE = (() => { try { return matchMedia("(pointer: coarse)").matches && Math.min(screen.width, screen.height) < 768; } catch (e) { return false; } })();
  const RELIEF_MAX_LEVEL = PHONE ? 1 : 2;    // Q-M1 a: a phone never fetches L2

  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function themeTokens() {
    const cs = getComputedStyle(document.body);
    const cv = (n, d) => { const v = cs.getPropertyValue(n).trim(); return /^#[0-9a-f]{6}$/i.test(v) ? v : d; };
    const H = root.AtlasGL.hex2rgb;
    const ink = H(cv("--ink", "#1d1b29")), paper = H(cv("--paper", "#f7f6fb")), paper2 = H(cv("--paper-2", "#ebe9f5")), indigo = H(cv("--indigo", "#45549c")), ochre = H(cv("--ochre", "#9a7c55"));
    const dark = (paper[0] * 0.299 + paper[1] * 0.587 + paper[2] * 0.114) < 0.5;
    return { ink, paper, paper2, indigo, ochre, dark };
  }
  function readPalette() {
    const { ink, paper, paper2, indigo, ochre, dark } = themeTokens();
    const ocean = dark ? mix(paper2, indigo, 0.30) : [0.70, 0.92, 1.0];
    // the same derivation v1 uses (readColors in app.js), so the two globes sit in one theme; the river takes
    // v1's rule too — the ocean's colour in a dark theme, a deeper blue of the same family in a light one,
    // where the pale cyan sea was 1.03:1 against the land (v1's bug report, Sep 2026)
    return {
      ocean, lake: ocean,
      land: mix(paper, ink, 0.10), coast: mix(paper, ink, 0.32), border: mix(paper, ink, 0.46), admin1: mix(paper, ink, 0.26), rim: mix(paper, ink, 0.32),
      river: dark ? mix(ocean, paper, 0.25) : [31 / 255, 122 / 255, 170 / 255], lakeShore: dark ? mix(ocean, paper, 0.3) : mix(ocean, ink, 0.35),
      halo: dark ? mix(paper2, indigo, 0.6) : mix(paper, indigo, 0.35), grat: ink, selected: mix(paper, ochre, 0.55),
    };
  }
  /* the hypsometric ramp (§2.7): 256 RGB texels over 0–6000 m on a square-root scale (the renderer maps
     sqrt(h / 6000) to the ramp, so the lowlands, where most land is, take most of the texels). Every stop
     is a mix of the theme's own tokens — the land colour at sea level, warmed toward the ochre through
     the uplands, greyed toward the ink on the high plateaux and lightened toward the paper (a light
     theme) or a plain white mixed in (a dark one, whose paper is darker than its land) at the peaks — so
     the same ramp reads in all fifteen themes without a hex of its own. */
  function buildRamp() {
    const { ink, paper, ochre, dark } = themeTokens();
    const land = mix(paper, ink, 0.10);
    const stops = [   // [metres, colour]; the high plateaux (Tibet at 4,500 m) stay a greyed brown — only the peaks whiten
      [0, land],
      [300, mix(land, ochre, 0.22)],
      [900, mix(land, ochre, 0.45)],
      [1800, mix(mix(land, ochre, 0.5), ink, 0.12)],
      [3000, mix(mix(land, ochre, 0.35), ink, 0.26)],
      [4500, mix(mix(land, ochre, 0.2), ink, 0.34)],
      [5400, dark ? mix(mix(land, ink, 0.25), [1, 1, 1], 0.2) : mix(mix(land, ink, 0.25), paper, 0.5)],
      [6000, dark ? mix(land, [1, 1, 1], 0.5) : mix(land, [1, 1, 1], 0.8)],
    ];
    const out = new Uint8Array(256 * 3);
    for (let i = 0; i < 256; i++) {
      const t = i / 255, h = t * t * 6000;
      let k = 0; while (k + 1 < stops.length - 1 && stops[k + 1][0] <= h) k++;
      const [h0, c0] = stops[k], [h1, c1] = stops[k + 1];
      const c = mix(c0, c1, Math.max(0, Math.min(1, (h - h0) / (h1 - h0))));
      out[3 * i] = Math.round(c[0] * 255); out[3 * i + 1] = Math.round(c[1] * 255); out[3 * i + 2] = Math.round(c[2] * 255);
    }
    return out;
  }

  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error("failed " + src)); document.head.appendChild(s); });
  }
  const DEFAULT_LAYERS = { relief: false, strength: 0.7, rivers: true, lakes: true, graticule: false };
  function loadLayers() {
    try { const v = JSON.parse(localStorage.getItem(LAYERS_KEY) || "null"); if (v && typeof v === "object") return Object.assign({}, DEFAULT_LAYERS, v); } catch (e) {}
    return Object.assign({}, DEFAULT_LAYERS);
  }
  function saveLayers(l) { try { localStorage.setItem(LAYERS_KEY, JSON.stringify(l)); } catch (e) {} }

  function mount(host, opts) {
    opts = opts || {};
    const dataUrl = opts.dataUrl || "atlas/data/topology.bin";
    const tileUrl = opts.tileUrl || "atlas/data/tiles/";
    const waterUrl = opts.waterUrl || "atlas/data/water.bin";
    const waterTileUrl = opts.waterTileUrl || "atlas/data/water/";
    const reliefUrl = opts.reliefUrl || "atlas/data/relief/";
    host.innerHTML = `
      <div class="atlas2" role="region" aria-label="Atlas (preview)">
        <canvas class="atlas2-canvas" tabindex="0" role="application" aria-label="Interactive globe — drag to turn, scroll or pinch to zoom, arrow keys turn, plus and minus zoom, Home resets"></canvas>
        <div class="atlas2-zoom" aria-hidden="true">
          <button type="button" class="atlas2-btn" data-zoom="in" title="Zoom in">+</button>
          <button type="button" class="atlas2-btn" data-zoom="out" title="Zoom out">−</button>
          <button type="button" class="atlas2-btn" data-zoom="home" title="Whole earth">⌂</button>
        </div>
        <div class="atlas2-layers">
          <button type="button" class="atlas2-btn atlas2-layers-btn" aria-expanded="false" aria-controls="atlas2-sheet" title="Layers">≡</button>
          <div class="atlas2-sheet" id="atlas2-sheet" hidden>
            <label><input type="checkbox" data-layer="relief"> Relief</label>
            <label class="atlas2-strength"><span>Strength</span><input type="range" data-layer="strength" min="0.2" max="1" step="0.05" aria-label="Relief strength"></label>
            <label><input type="checkbox" data-layer="rivers"> Rivers</label>
            <label><input type="checkbox" data-layer="lakes"> Lakes</label>
            <label><input type="checkbox" data-layer="graticule"> Graticule</label>
            <p class="atlas2-layers-note" hidden></p>
          </div>
        </div>
        <div class="atlas2-status" role="status" aria-live="polite"><span class="atlas2-bar"><i></i></span><span class="atlas2-note">Fetching the earth…</span></div>
        <div class="atlas2-caption" aria-live="polite"></div>
        <pre class="atlas2-perf" hidden aria-hidden="true"></pre>
      </div>`;
    const el = host.querySelector(".atlas2"), canvas = el.querySelector("canvas"), status = el.querySelector(".atlas2-status"), note = el.querySelector(".atlas2-note"), bar = el.querySelector(".atlas2-bar i"), caption = el.querySelector(".atlas2-caption"), perfEl = el.querySelector(".atlas2-perf");
    const sheet = el.querySelector(".atlas2-sheet"), layersBtn = el.querySelector(".atlas2-layers-btn"), layersNote = el.querySelector(".atlas2-layers-note");
    const say = (t, frac) => { note.textContent = t; if (frac != null) { bar.style.width = Math.round(frac * 100) + "%"; bar.parentNode.hidden = false; } };
    const fail = (t) => { status.classList.add("atlas2-fail"); bar.parentNode.hidden = true; note.textContent = t; };

    const R = root.AtlasGL.create(canvas, { antialias: opts.antialias });
    if (!R) { fail("This browser has no WebGL2, which the new Atlas needs. The current Atlas at #map still works."); return { dispose() {} }; }
    R.setPalette(readPalette());
    R.setRamp(buildRamp());

    /* ---------- view and layers ---------- */
    const layers = loadLayers();
    const view = { lon: 10, lat: 20, zoom: 1, graticule: layers.graticule, level: 0, admin1: false, tiles: [], parents: [], waterTiles: [], rivers: layers.rivers, lakes: layers.lakes, smoothRivers: false, relief: { on: layers.relief, strength: layers.strength, fade: 1, tiles: [] }, radius: 100, cx: 0, cy: 0, rot: new Float32Array(9) };
    let cssW = 0, cssH = 0, base = 100;
    function layout() {
      const r = el.getBoundingClientRect();
      cssW = Math.max(1, Math.round(r.width)); cssH = Math.max(1, Math.round(r.height));
      R.resize(cssW, cssH, window.devicePixelRatio || 1);
      base = Math.min(cssW, cssH) * 0.46;
      view.cx = cssW / 2; view.cy = cssH / 2;
      needs = true;
    }
    const zmax = () => Math.max(1, R_KM / (kmFloor() * base));
    // the cap is 150 m/px where tiles exist; without a tile index (an old core file) the finest resident level's 0.5 km
    const kmFloor = () => (tileIndex ? KM_PER_PX_FLOOR : 0.5);
    function kmPerPx() { return R_KM / (base * view.zoom); }
    function rotation() {
      const lo = view.lon * D2R, la = view.lat * D2R, cl = Math.cos(la), sl = Math.sin(la), co = Math.cos(lo), so = Math.sin(lo);
      const f = [cl * co, cl * so, sl];                  // forward: the centre, toward the viewer
      const u = [-sl * co, -sl * so, cl];                // up: north at the centre
      const r = [u[1] * f[2] - u[2] * f[1], u[2] * f[0] - u[0] * f[2], u[0] * f[1] - u[1] * f[0]];   // right = up × forward
      const m = view.rot;
      m[0] = r[0]; m[1] = r[1]; m[2] = r[2]; m[3] = u[0]; m[4] = u[1]; m[5] = u[2]; m[6] = f[0]; m[7] = f[1]; m[8] = f[2];
    }
    function unproject(px, py) {
      const dx = (px - view.cx) / view.radius, dy = -(py - view.cy) / view.radius, r2 = dx * dx + dy * dy;
      if (r2 > 1) return null;
      const z = Math.sqrt(1 - r2), m = view.rot;
      // world = Rᵀ · (dx, dy, z)
      const x = m[0] * dx + m[3] * dy + m[6] * z, y = m[1] * dx + m[4] * dy + m[7] * z, w = m[2] * dx + m[5] * dy + m[8] * z;
      return { lon: Math.atan2(y, x) * R2D, lat: Math.asin(Math.max(-1, Math.min(1, w))) * R2D };
    }
    function clampView() {
      view.zoom = Math.max(ZMIN, Math.min(zmax(), view.zoom));
      view.lat = Math.max(-88, Math.min(88, view.lat));
      view.lon = ((view.lon + 180) % 360 + 360) % 360 - 180;
    }
    function zoomAt(factor, px, py) {
      const before = (px != null) ? unproject(px, py) : null;
      view.zoom *= factor; clampView();
      view.radius = base * view.zoom; rotation();
      if (before) {
        const after = unproject(px, py);
        if (after) { view.lon += before.lon - after.lon; view.lat += before.lat - after.lat; clampView(); }
      }
      needs = true;
    }
    function levelFor(k) { let L = 0; while (L < LOD_KM_PER_PX.length && k < LOD_KM_PER_PX[L]) L++; return L; }

    /* ---------- the viewport's lon/lat box, for every tile grid ---------- */
    function viewBox() {
      const pts = [[0, 0], [cssW / 2, 0], [cssW, 0], [cssW, cssH / 2], [cssW, cssH], [cssW / 2, cssH], [0, cssH], [0, cssH / 2], [cssW / 2, cssH / 2]].map(([x, y]) => unproject(x, y));
      if (pts.some((p) => !p)) return null;
      const c = pts[8];
      let lon0 = Infinity, lon1 = -Infinity, lat0 = Infinity, lat1 = -Infinity;
      for (const p of pts) { let d = p.lon - c.lon; if (d > 180) d -= 360; else if (d < -180) d += 360; lon0 = Math.min(lon0, d); lon1 = Math.max(lon1, d); lat0 = Math.min(lat0, p.lat); lat1 = Math.max(lat1, p.lat); }
      if (lat1 > 85 || lat0 < -85) { lon0 = -180; lon1 = 180; }   // near a pole every longitude shows
      return { c, lon0, lon1, lat0, lat1 };
    }
    // keys "x-y" of the cells of a cols×rows grid (south-up rows, 0 at −90°) the viewport touches, filtered by `present`
    function cellsFor(cols, rows, present, box) {
      if (!box) return [];
      const W = 360 / cols, Hh = 180 / rows;
      const keys = [];
      const x0 = Math.floor((box.c.lon + box.lon0 + 180) / W), x1 = Math.floor((box.c.lon + box.lon1 + 180) / W);
      const y0 = Math.max(0, Math.floor((box.lat0 + 90) / Hh)), y1 = Math.min(rows - 1, Math.floor((box.lat1 + 90) / Hh));
      for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) { const k = (((x % cols) + cols) % cols) + "-" + y; if (!present || present.has(k)) keys.push(k); }
      return keys;
    }

    /* ---------- a tile loader: fetch → worker → renderer, an LRU, a few fetches in flight ---------- */
    function TileLoader(spec) {   // spec = { url(key) → string, msgType, wanted() → Set of keys, cacheSize, onData(m) }
      const cache = new Map(), pending = new Map(), queue = [];
      let bytes = 0, fetched = 0, evicted = 0, errors = 0;
      const touch = (key) => { const t = cache.get(key); if (t) { cache.delete(key); cache.set(key, t); } };
      function want(keys) {
        for (const k of keys) { if (cache.has(k)) { touch(k); continue; } if (pending.has(k) || queue.includes(k)) continue; queue.push(k); }
        pump();
      }
      function pump() {
        while (queue.length && pending.size < TILE_PARALLEL) {
          const key = queue.shift();
          if (!spec.wanted().has(key)) continue;   // the view moved on
          const ac = typeof AbortController === "function" ? new AbortController() : null;
          pending.set(key, ac);
          spec.fetch(key, ac).then((payload) => { if (disposed) return; bytes += payload.bytes || 0; fetched++; spec.toWorker(key, payload); })
            .catch((e) => { pending.delete(key); if (!disposed && !(e && e.name === "AbortError")) errors++; pump(); });
        }
      }
      function arrived(key, entry) {
        pending.delete(key);
        cache.set(key, entry);
        while (cache.size > spec.cacheSize) { const oldest = cache.keys().next().value; if (spec.wanted().has(oldest)) break; cache.delete(oldest); spec.drop(oldest); evicted++; }
        pump(); invalidate();
      }
      function failed(key) { pending.delete(key); errors++; pump(); }
      return { want, arrived, failed, cache, pending, get stats() { return { bytes, fetched, evicted, errors, pending: pending.size, resident: cache.size }; }, abortAll() { for (const ac of pending.values()) { try { if (ac) ac.abort(); } catch (e) {} } } };
    }
    const fetchBin = (url, ac) => fetch(url, ac ? { signal: ac.signal } : undefined).then((res) => { if (!res.ok) throw new Error("HTTP " + res.status); return res.arrayBuffer(); }).then((buffer) => ({ buffer, bytes: buffer.byteLength }));

    let tileIndex = null;             // from the core header: { "3": { cols, rows, present: Set }, "4": … }
    const landTiles = TileLoader({
      fetch: (key, ac) => { const [z, xy] = key.split(":"); return fetchBin(tileUrl + z + "/" + xy + ".bin", ac); },
      toWorker: (key, p) => postToWorker({ type: "tile", key, buffer: p.buffer }, [p.buffer]),
      wanted: () => new Set([...view.tiles, ...view.parents]), cacheSize: TILE_CACHE, drop: (k) => R.dropTile(k),
    });
    let waterIndex = null;            // from the water header: { cols, rows, present: Set }
    const waterTiles = TileLoader({
      fetch: (key, ac) => fetchBin(waterTileUrl + key.slice(2) + ".bin", ac),
      toWorker: (key, p) => postToWorker({ type: "water-tile", key, buffer: p.buffer }, [p.buffer]),
      wanted: () => new Set(view.waterTiles), cacheSize: WATER_TILE_CACHE, drop: (k) => R.dropWaterTile(k),
    });
    let reliefIndex = null;           // relief.json
    const reliefTiles = TileLoader({
      fetch: (key, ac) => fetchRelief(key, ac),
      toWorker: (key, p) => postToWorker({ type: "relief", key, w: p.w, h: p.h, hi: p.hi, lo: p.lo, sh: p.sh }, [p.hi, p.lo, p.sh]),
      wanted: () => new Set(["0", ...view.relief.tiles]), cacheSize: RELIEF_CACHE, drop: (k) => R.dropRelief(k),
    });
    // the three greyscale planes of one relief tile, decoded exactly (no colour management, no premultiplication)
    function fetchRelief(key, ac) {
      const lv = key === "0" ? reliefIndex.levels.find((l) => l.level === 0) : reliefIndex.levels.find((l) => l.level === Number(key.split(":")[0]));
      const t = key === "0" ? lv.tiles[0] : lv.tiles.find((x) => x.x + "-" + x.y === key.split(":")[1]);
      const one = (plane) => fetch(reliefUrl + t.base + "." + plane + ".png", ac ? { signal: ac.signal } : undefined).then((res) => { if (!res.ok) throw new Error("HTTP " + res.status); return res.blob(); }).then((blob) => createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" }));
      return Promise.all([one("hi"), one("lo"), one("sh")]).then(([hi, lo, sh]) => ({ hi, lo, sh, w: hi.width, h: hi.height, bytes: t.total || 0 }));
    }
    function reliefTileOf(key) { const lv = reliefIndex.levels.find((l) => l.level === Number(key.split(":")[0])); const [x, y] = key.split(":")[1].split("-").map(Number); const cols = lv.cols, rows = lv.rows; return { lon0: -180 + 360 * x / cols, lon1: -180 + 360 * (x + 1) / cols, lat0: 90 - 180 * (y + 1) / rows, lat1: 90 - 180 * y / rows }; }
    // relief tiles are indexed north-down (row 0 at 90° N) in relief.json; the grid helper counts rows from the south
    function reliefKeysFor(level) {
      const lv = reliefIndex && reliefIndex.levels.find((l) => l.level === level); if (!lv || !lv.tile) return [];
      return cellsFor(lv.cols, lv.rows, null, viewBox()).map((k) => { const [x, y] = k.split("-").map(Number); return level + ":" + x + "-" + (lv.rows - 1 - y); });
    }

    /* ---------- frame loop ---------- */
    const stats = { frames: [], draw: [], uploads: {}, worker: null, fetchMs: 0, firstPaintMs: 0, ready: false, level: 0, tiles: [], tileErrors: 0, water: null, waterFetchMs: 0, relief: null };
    let needs = true, raf = 0, lastT = 0, disposed = false, perfOn = /[?&#/]perf\b/.test(location.hash || "");
    const t0 = performance.now();
    function frame(t) {
      raf = 0;
      if (disposed) return;
      if (!el.isConnected) { dispose(); return; }
      if (lastT) { stats.frames.push(t - lastT); if (stats.frames.length > 600) stats.frames.shift(); }
      lastT = t;
      if (needs) {
        needs = false;
        plan();
        R.render(view);
        stats.draw.push(R.rawStats.lastMs); if (stats.draw.length > 600) stats.draw.shift();
        if (!stats.firstPaintMs && R.levelLoaded(0)) stats.firstPaintMs = Math.round(performance.now() - t0);
        if (perfOn) perfText();
      }
      if (coasting) { coast(); }
      if (needs || coasting) raf = requestAnimationFrame(frame); else lastT = 0;
    }
    // the view's derived state: level, admin-1 visibility, the tiles it wants (requested at once), the water and
    // relief it wants. Run by every frame and by setView, so `tilesSettled()` right after a setView already asks
    // about the NEW tiles
    function plan() {
      clampView();
      view.radius = base * view.zoom; rotation();
      const k = kmPerPx();
      view.level = levelFor(k);
      view.admin1 = k < ADMIN1_KM_PER_PX;
      const box = view.level >= 3 || (view.relief.on && k < RELIEF_L1_KM_PER_PX) ? viewBox() : null;
      if (view.level >= 3 && tileIndex) {
        const idx = tileIndex[view.level];
        view.tiles = idx ? cellsFor(idx.cols, idx.rows, idx.present, box).map((x) => view.level + ":" + x) : [];
        view.parents = view.level === 4 && tileIndex[3] ? cellsFor(tileIndex[3].cols, tileIndex[3].rows, tileIndex[3].present, box).map((x) => "3:" + x) : [];
        landTiles.want(view.tiles);
        if (view.level === 4) landTiles.want(view.parents);
      } else { view.tiles = []; view.parents = []; }
      // water: fetched the first time rivers or lakes are on; tiles for the lakes past 1 km/px
      if ((view.rivers || view.lakes) && !waterStarted) startWater();
      view.rivers = layers.rivers && k >= RIVER_MIN_KM_PER_PX;
      view.lakes = layers.lakes;
      view.smoothRivers = view.level >= 3;
      if (view.lakes && view.level >= 3 && waterIndex) { view.waterTiles = cellsFor(waterIndex.cols, waterIndex.rows, waterIndex.present, box).map((x) => "w:" + x); waterTiles.want(view.waterTiles); }
      else view.waterTiles = [];
      // relief: L0 once on; L1 patches for the view; the fade past the finest level's texel
      view.relief.on = layers.relief; view.relief.strength = layers.strength;
      if (layers.relief && !reliefStarted) startRelief();
      view.relief.fade = Math.max(0, Math.min(1, (k - RELIEF_FADE[1]) / (RELIEF_FADE[0] - RELIEF_FADE[1])));
      if (layers.relief && reliefIndex && view.relief.fade > 0 && k < RELIEF_L1_KM_PER_PX && RELIEF_MAX_LEVEL >= 1) { view.relief.tiles = reliefKeysFor(1); reliefTiles.want(view.relief.tiles); }
      else view.relief.tiles = [];
      stats.level = view.level;
    }
    function invalidate() { needs = true; if (!raf && !disposed) raf = requestAnimationFrame(frame); }
    function perfText() {
      const f = stats.frames.slice(-120).sort((a, b) => a - b), n = f.length;
      const mean = n ? f.reduce((a, b) => a + b, 0) / n : 0, p95 = n ? f[Math.min(n - 1, Math.floor(0.95 * n))] : 0, max = n ? f[n - 1] : 0;
      const s = R.stats(), lt = landTiles.stats, wt = waterTiles.stats, rt = reliefTiles.stats;
      perfEl.textContent = `frame ms (last ${n}): mean ${mean.toFixed(1)}  p95 ${p95.toFixed(1)}  max ${max.toFixed(1)}\n` +
        `draw ${s.lastMs.toFixed(2)} ms  ${s.triangles} tri  ${s.segments} seg  ${s.draws} calls\n` +
        `water: ${s.riverSegments} river seg${view.smoothRivers ? " (smoothed)" : ""}  ${s.lakeSegments} lake seg  ${s.lakeTriangles} lake tri  level ${s.waterLevel}  tiles ${s.waterTilesDrawn}/${view.waterTiles.length} (${wt.resident} resident)\n` +
        `relief: ${view.relief.on ? "on" : "off"} strength ${view.relief.strength.toFixed(2)} fade ${view.relief.fade.toFixed(2)}  patches ${s.reliefPatches}/${view.relief.tiles.length} (${s.reliefResident} resident, ${(rt.bytes / 1048576).toFixed(1)} MB fetched)\n` +
        `LOD ${s.level} (core ${s.coreLevel})  ${kmPerPx().toFixed(3)} km/px  zoom ${view.zoom.toFixed(2)}\n` +
        `tiles: ${s.tilesDrawn} drawn, ${s.parentsDrawn} parents, ${view.tiles.length} wanted, ${lt.pending} pending, ${lt.resident} resident, ${lt.fetched} fetched (${(lt.bytes / 1024).toFixed(0)} KB), ${lt.evicted} evicted\n` +
        `dpr ${Math.min(2, window.devicePixelRatio || 1)}  ${cssW}×${cssH}${PHONE ? "  phone" : ""}`;
    }
    function setPerf(on) { perfOn = on; perfEl.hidden = !on; if (on) perfText(); }
    setPerf(perfOn);

    /* ---------- the layers control ---------- */
    const inputs = {}; sheet.querySelectorAll("[data-layer]").forEach((i) => { inputs[i.getAttribute("data-layer")] = i; });
    function reflectLayers() {
      inputs.relief.checked = layers.relief; inputs.strength.value = String(layers.strength); inputs.rivers.checked = layers.rivers; inputs.lakes.checked = layers.lakes; inputs.graticule.checked = layers.graticule;
      inputs.strength.disabled = !layers.relief;
    }
    function setLayers(patch) {
      Object.assign(layers, patch);
      layers.strength = Math.max(0.2, Math.min(1, Number(layers.strength) || DEFAULT_LAYERS.strength));
      view.graticule = layers.graticule;
      saveLayers(layers); reflectLayers(); invalidate();
    }
    reflectLayers();
    layersBtn.addEventListener("click", () => { const open = sheet.hidden; sheet.hidden = !open; layersBtn.setAttribute("aria-expanded", String(open)); });
    sheet.addEventListener("change", (e) => { const k = e.target.getAttribute("data-layer"); if (!k) return; setLayers({ [k]: e.target.type === "checkbox" ? e.target.checked : Number(e.target.value) }); });
    sheet.addEventListener("input", (e) => { if (e.target.getAttribute("data-layer") === "strength") { layers.strength = Number(e.target.value); invalidate(); } });

    /* ---------- input ---------- */
    const ptrs = new Map();
    let dragging = false, last = null, downAt = null, moved = false, pinch = 0, pinchMid = null, velLon = 0, velLat = 0, lastMoveT = 0, coasting = false;
    const degPerPx = () => R2D / view.radius;
    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      coasting = false; velLon = 0; velLat = 0;
      if (ptrs.size === 1) { dragging = true; last = { x: e.clientX, y: e.clientY }; downAt = { x: e.clientX, y: e.clientY }; moved = false; lastMoveT = e.timeStamp; }
      else if (ptrs.size === 2) { dragging = false; moved = true; const p = [...ptrs.values()]; pinch = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); pinchMid = { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 }; }
      canvas.focus({ preventScroll: true });
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const rect = canvas.getBoundingClientRect();
      if (ptrs.size >= 2) {
        const p = [...ptrs.values()];
        const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), mid = { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 };
        if (pinch > 0 && d > 0) {
          // turn by the midpoint's travel, then zoom about the midpoint
          const k = degPerPx();
          view.lon -= (mid.x - pinchMid.x) * k; view.lat += (mid.y - pinchMid.y) * k; clampView();
          zoomAt(d / pinch, mid.x - rect.left, mid.y - rect.top);
        }
        pinch = d; pinchMid = mid;
        return;
      }
      if (dragging && last) {
        const dx = e.clientX - last.x, dy = e.clientY - last.y;
        if (!moved && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 5) moved = true;
        const k = degPerPx();
        const dLon = -dx * k, dLat = dy * k;
        view.lon += dLon; view.lat += dLat;
        const now = e.timeStamp || performance.now(), dt = Math.max(8, now - lastMoveT);
        velLon = velLon * 0.5 + (dLon / dt) * 0.5; velLat = velLat * 0.5 + (dLat / dt) * 0.5;
        lastMoveT = now; last = { x: e.clientX, y: e.clientY };
        invalidate();
      }
    });
    function ptrUp(e) {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.delete(e.pointerId);
      if (ptrs.size === 1) { const p = [...ptrs.values()][0]; dragging = true; last = { x: p.x, y: p.y }; pinch = 0; return; }
      if (ptrs.size > 1) return;
      const wasDrag = dragging; dragging = false;
      if (wasDrag && !moved && e.type === "pointerup") { const rect = canvas.getBoundingClientRect(); pick(e.clientX - rect.left, e.clientY - rect.top); return; }
      if (wasDrag && moved && (performance.now() - lastMoveT) < 60 && Math.hypot(velLon, velLat) > 0.02) { coasting = true; invalidate(); }
    }
    canvas.addEventListener("pointerup", ptrUp); canvas.addEventListener("pointercancel", ptrUp);
    function coast() {
      view.lon += velLon * 16; view.lat += velLat * 16; velLon *= 0.92; velLat *= 0.92;
      if (Math.hypot(velLon, velLat) < 0.002) coasting = false;
      needs = true;
    }
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const f = Math.exp(-Math.max(-120, Math.min(120, e.deltaY)) * 0.0025);
      zoomAt(f, e.clientX - rect.left, e.clientY - rect.top);
      invalidate();
    }, { passive: false });
    canvas.addEventListener("keydown", (e) => {
      const step = 6 / view.zoom;
      let used = true;
      if (e.key === "ArrowLeft") view.lon -= step; else if (e.key === "ArrowRight") view.lon += step;
      else if (e.key === "ArrowUp") view.lat += step; else if (e.key === "ArrowDown") view.lat -= step;
      else if (e.key === "+" || e.key === "=") zoomAt(1.25); else if (e.key === "-" || e.key === "_") zoomAt(1 / 1.25);
      else if (e.key === "Home" || e.key === "0") { view.lon = 10; view.lat = 20; view.zoom = 1; }
      else if (e.key === "Escape") { R.select(null); caption.textContent = ""; }
      else if (e.key === "p" || e.key === "P") setPerf(!perfOn);
      else if (e.key === "r" || e.key === "R") setLayers({ relief: !layers.relief });
      else used = false;
      if (used) { e.preventDefault(); clampView(); invalidate(); }
    });
    el.querySelectorAll("[data-zoom]").forEach((b) => b.addEventListener("click", () => {
      const z = b.getAttribute("data-zoom");
      if (z === "in") zoomAt(1.5); else if (z === "out") zoomAt(1 / 1.5); else { view.lon = 10; view.lat = 20; view.zoom = 1; clampView(); }
      invalidate();
    }));

    let header = null, faceEntity = null, waterHeader = null;
    function pick(x, y) {
      if (!stats.ready && !R.levelLoaded(0)) return;
      const hit = R.pick(view, x, y);
      if (hit && hit.face != null && faceEntity && header) {
        const ent = header.entities[faceEntity[hit.face]];
        R.select(hit.face);
        caption.textContent = ent ? (ent.parent ? ent.name + " — " + (header.entities.find((e) => e.id === ent.parent) || {}).name : ent.name) : "";
      } else if (hit && hit.arc != null) {
        caption.textContent = "";
      } else { R.select(null); caption.textContent = ""; }
      invalidate();
    }

    /* ---------- data + worker ---------- */
    let worker = null, shim = null;
    function postToWorker(m, transfer) { if (worker) worker.postMessage(m, transfer || []); else if (shim) setTimeout(() => shim.handle(m, onMessage), 0); }
    function onMessage(m) {
      if (disposed) return;
      if (m.type === "error") {
        if (/^tile /.test(m.message)) { stats.tileErrors++; landTiles.failed(m.message.split(" ")[1].replace(/:$/, "")); return; }
        if (/^water-tile /.test(m.message)) { waterTiles.failed(m.message.split(" ")[1].replace(/:$/, "")); return; }
        if (/^water/.test(m.message)) { layersNote.hidden = false; layersNote.textContent = "The rivers and lakes could not be read: " + m.message; return; }
        fail("The Atlas data could not be read: " + m.message); return;
      }
      if (m.type === "meta") {
        header = m.header; faceEntity = m.faceEntity; R.setFaceCount(faceEntity.length);
        if (header.tiles) { tileIndex = {}; for (const z of Object.keys(header.tiles)) { const t = header.tiles[z]; tileIndex[z] = { cols: t.cols, rows: t.rows, present: new Set(t.present) }; } }
        say("Shaping the land…", 0.35); return;
      }
      if (m.type === "lod") {
        const tu = performance.now();
        R.setLevel(m.level, { segs: m.segs, segRange: m.segRange, segCap: m.segCap, segRangeA1: m.segRangeA1, segCapA1: m.segCapA1, facePos: m.facePos, faceIdx: m.faceIdx, faceRange: m.faceRange, faceCap: m.faceCap });
        stats.uploads[m.level] = Math.round(performance.now() - tu);
        say(m.level === 0 ? "Drawing…" : "Adding detail…", 0.5 + 0.17 * (m.level + 1));
        invalidate();
        return;
      }
      if (m.type === "tile") { landTiles.arrived(m.key, { tile: m.tile, stats: m.stats }); R.setTile(m.key, { segs: m.segs, segRange: m.segRange, segCap: m.segCap, segRangeA1: m.segRangeA1, segCapA1: m.segCapA1, facePos: m.facePos, faceIdx: m.faceIdx, faceRange: m.faceRange, faceCap: m.faceCap }, m.tile); stats.tiles.push(m.stats); if (stats.tiles.length > 200) stats.tiles.shift(); invalidate(); return; }
      if (m.type === "water-meta") {
        waterHeader = m.header;
        const t = waterHeader.tiles && waterHeader.tiles[Object.keys(waterHeader.tiles)[0]];
        if (t) waterIndex = { cols: t.cols, rows: t.rows, present: new Set(t.present) };
        stats.water = { parseMs: m.parseMs, levels: [], entities: waterHeader.entities.length, rivers: (waterHeader.rivers || []).length };
        return;
      }
      if (m.type === "water-lod") {
        const d = { lakeSegs: m.lakeSegs, lakeRange: m.lakeRange, lakeCap: m.lakeCap, riverSegs: m.riverSegs, riverRange: m.riverRange, riverCap: m.riverCap, facePos: m.facePos, faceIdx: m.faceIdx, faceRange: m.faceRange, faceCap: m.faceCap };
        if (m.smoothSegs) { d.smoothSegs = m.smoothSegs; d.smoothRange = m.smoothRange; d.smoothCap = m.smoothCap; }
        R.setWaterLevel(m.level, d);
        if (stats.water) stats.water.levels.push(m.stats);
        invalidate(); return;
      }
      if (m.type === "water-tile") { waterTiles.arrived(m.key, { tile: m.tile, stats: m.stats }); R.setWaterTile(m.key, { lakeSegs: m.lakeSegs, lakeRange: m.lakeRange, lakeCap: m.lakeCap, facePos: m.facePos, faceIdx: m.faceIdx, faceRange: m.faceRange, faceCap: m.faceCap }, m.tile); invalidate(); return; }
      if (m.type === "relief") {
        let rgb = m.rgb;
        if (!rgb && m.planes) rgb = composeOnMain(m.planes, m.w, m.h);   // no OffscreenCanvas in the worker: compose here
        reliefTiles.arrived(m.key, { w: m.w, h: m.h });
        R.setRelief(m.key, { w: m.w, h: m.h, rgb, tile: m.key === "0" ? null : reliefTileOf(m.key) });
        stats.relief = stats.relief || { tiles: 0 }; stats.relief.tiles++;
        invalidate(); return;
      }
      if (m.type === "done") { stats.worker = m.stats; stats.ready = true; status.hidden = true; el.setAttribute("data-ready", "1"); invalidate(); }
    }
    function composeOnMain(planes, w, h) {
      const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d", { willReadFrequently: true });
      const rgb = new Uint8Array(w * h * 3);
      [["sh", 0], ["hi", 1], ["lo", 2]].forEach(([k, ch]) => { x.drawImage(planes[k], 0, 0); const d = x.getImageData(0, 0, w, h).data; for (let i = 0, o = ch; i < w * h; i++, o += 3) rgb[o] = d[4 * i]; try { planes[k].close(); } catch (e) {} });
      c.width = 0; c.height = 0;
      return rgb;
    }
    function startWorker(buffer) {
      const t = performance.now();
      try {
        if (location.protocol === "file:") throw new Error("file:");
        worker = new Worker("atlas/atlas-worker.js");
        worker.onmessage = (e) => onMessage(e.data);
        worker.onerror = (e) => { if (!stats.ready) fail("The Atlas worker failed: " + (e.message || "unknown error")); };
        worker.postMessage({ type: "load", buffer }, [buffer]);
      } catch (e) {
        // the main-thread shim: the same file, the same message shape, earcut loaded beside it
        Promise.all([root.earcut ? null : loadScript("atlas/vendor/earcut.js"), root.AtlasWorkerMain ? null : loadScript("atlas/atlas-worker.js")]).then(() => {
          shim = root.AtlasWorkerMain;
          setTimeout(() => shim.handle({ type: "load", buffer }, onMessage), 0);
          if (waterBuffer) { postToWorker({ type: "water", buffer: waterBuffer }, [waterBuffer]); waterBuffer = null; }
        }, () => fail("The Atlas worker could not be loaded."));
      }
      stats.workerStartMs = Math.round(performance.now() - t);
    }
    (async () => {
      const t = performance.now();
      try {
        if (location.protocol === "file:") { fail("The new Atlas needs to be served over http (a local server such as `python3 -m http.server`); a browser will not fetch its data from file://. The current Atlas at #map still works."); return; }
        const res = await fetch(dataUrl);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const total = Number(res.headers.get("Content-Length")) || 0;
        let buffer;
        if (res.body && total) {
          const reader = res.body.getReader(); const chunks = []; let got = 0;
          for (;;) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); got += value.length; say("Fetching the earth…", 0.3 * got / total); }
          const u8 = new Uint8Array(got); let o = 0; for (const c of chunks) { u8.set(c, o); o += c.length; }
          buffer = u8.buffer;
        } else buffer = await res.arrayBuffer();
        stats.fetchMs = Math.round(performance.now() - t);
        stats.bytes = buffer.byteLength;
        if (disposed) return;
        say("Shaping the land…", 0.32);
        startWorker(buffer);
      } catch (e) { fail("The Atlas data didn’t arrive (" + (e && e.message ? e.message : e) + "). Check your connection and try again."); }
    })();
    // the water file, once: parsed by the same worker (after the land, which it queues behind)
    let waterStarted = false, waterFailed = false, waterBuffer = null;
    function startWater() {
      waterStarted = true;
      const t = performance.now();
      fetch(waterUrl).then((res) => { if (!res.ok) throw new Error("HTTP " + res.status); return res.arrayBuffer(); }).then((buffer) => {
        if (disposed) return;
        stats.waterFetchMs = Math.round(performance.now() - t); stats.waterBytes = buffer.byteLength;
        if (worker || shim) postToWorker({ type: "water", buffer }, [buffer]); else waterBuffer = buffer;
      }).catch((e) => { waterFailed = true; layersNote.hidden = false; layersNote.textContent = "The rivers and lakes didn’t arrive (" + (e && e.message ? e.message : e) + ")."; });
    }
    // the relief index, then L0; the frame loop asks for L1 tiles as the view needs them
    let reliefStarted = false, reliefFailed = false;
    function startRelief() {
      reliefStarted = true;
      if (typeof createImageBitmap !== "function") { layersNote.hidden = false; layersNote.textContent = "This browser cannot decode the relief images."; return; }
      fetch(reliefUrl + "relief.json").then((res) => { if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); }).then((idx) => {
        if (disposed) return;
        reliefIndex = idx;
        reliefTiles.want(["0"]);
        invalidate();
      }).catch((e) => { reliefFailed = true; layersNote.hidden = false; layersNote.textContent = "The relief didn’t arrive (" + (e && e.message ? e.message : e) + ")."; });
    }

    /* ---------- lifecycle ---------- */
    const onResize = () => { if (!el.isConnected) { dispose(); return; } layout(); invalidate(); };
    window.addEventListener("resize", onResize);
    const viewHost = document.getElementById("view") || document.body;
    const mo = new MutationObserver(() => { if (!el.isConnected) dispose(); });
    mo.observe(viewHost, { childList: true });
    // a theme change (data-theme, or the night class) re-reads the tokens: the palette and the relief ramp follow
    const themeObs = new MutationObserver(() => { if (!el.isConnected) return; R.setPalette(readPalette()); R.setRamp(buildRamp()); invalidate(); });
    themeObs.observe(document.body, { attributes: true, attributeFilter: ["class", "data-theme"] });
    function dispose() {
      if (disposed) return;
      disposed = true;
      try { mo.disconnect(); themeObs.disconnect(); } catch (e) {}
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      landTiles.abortAll(); waterTiles.abortAll(); reliefTiles.abortAll();
      if (worker) { try { worker.terminate(); } catch (e) {} worker = null; }
      R.dispose();
    }
    layout();
    invalidate();
    // the view set from outside (the perf suite's fixed views): centre, zoom, then wait for `tilesSettled()`
    function setView(lon, lat, kmPerPixel) { view.lon = lon; view.lat = lat; view.zoom = R_KM / (kmPerPixel * base); plan(); invalidate(); }
    const tilesSettled = () => view.tiles.every((k) => R.tileLoaded(k)) && (view.level !== 4 || view.parents.every((k) => R.tileLoaded(k))) && landTiles.pending.size === 0
      && (!view.lakes || !waterStarted || waterFailed || (view.waterTiles.every((k) => R.waterTileLoaded(k)) && waterTiles.pending.size === 0))
      && (!view.relief.on || !reliefStarted || reliefFailed || (!!reliefIndex && R.reliefLoaded("0") && view.relief.tiles.every((k) => R.reliefLoaded(k)) && reliefTiles.pending.size === 0));
    const waterSettled = () => !waterStarted || waterFailed || (!!waterHeader && R.waterLevelLoaded(2));
    const controller = { dispose, stats, view, layers, renderer: R, invalidate, zoomAt, pick, setView, setLayers, kmPerPx, tilesSettled, waterSettled, setPerf,
      statsNow: () => Object.assign(R.stats(), { kmPerPx: kmPerPx(), wanted: view.tiles.length, pending: landTiles.pending.size, resident: landTiles.stats.resident, fetched: landTiles.stats.fetched, tileBytes: landTiles.stats.bytes, evicted: landTiles.stats.evicted, waterWanted: view.waterTiles.length, waterPending: waterTiles.pending.size, reliefWanted: view.relief.tiles.length, reliefPending: reliefTiles.pending.size, reliefBytes: reliefTiles.stats.bytes, reliefFade: view.relief.fade, riversOn: view.rivers, lakesOn: view.lakes, reliefOn: view.relief.on, phone: PHONE }) };
    el.__atlas2 = controller;
    return controller;
  }

  root.AtlasV2 = { mount };
})(typeof window !== "undefined" ? window : globalThis);
