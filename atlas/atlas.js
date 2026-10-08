/* atlas.js — Atlas v2's page: the scene, the input, the worker bridge, the tiles (docs/atlas-v2-design.md §2.1).

   Phase 1a scope (§7): the present-day earth from atlas/data/topology.bin at three resident levels
   and from atlas/data/tiles/<z>/<x>-<y>.bin at two finer ones, drawn by atlas-gl.js, with drag,
   wheel, pinch and keyboard, and a tap that names the country under it through the ID pass. No
   labels, no timeline, no popup, no study material — those are Phases 1c–3. The page is reached at
   #map2; v1 at #map is untouched.

     window.AtlasV2.mount(root, { dataUrl, tileUrl })  → controller { dispose(), stats, view, … }

   WHAT HAPPENS ON MOUNT
     1. the DOM: a canvas, a zoom stack, a status line (the fetch's determinate progress, then the
        worker's), a caption for the picked name, and — on `#map2?perf` or after pressing P — the
        perf overlay — all inside `root`, which app.js's router replaces wholesale on navigation; a
        MutationObserver on the view notices that and disposes everything (the worker, the GL
        context, the window listeners), since PAGES functions have no unmount.
     2. the data: fetch() with a byte-progress bar; on file:// (where fetch of a local binary is
        refused) a sentence pointing at a local server — the `.js` twin of §Q-R4 is Phase 1d work.
     3. the worker: new Worker("atlas/atlas-worker.js"); where workers are refused the same file is
        loaded as a plain script with earcut beside it and driven through the identical message shape.
     4. levels arrive coarsest first and are uploaded as they land; the globe paints on LOD 0.
     5. tiles: past 1 km per pixel the view is covered by z=3 tiles, past 0.5 km by z=4 (§2.3). Each
        frame lists the tiles the viewport touches (the corners and edge midpoints unprojected to
        lon/lat); the ones the core header says exist are fetched, at most six at a time, parsed and
        triangulated in the worker, uploaded, and kept in an LRU of TILE_CACHE entries. Until a tile
        lands the renderer shows the finest resident level (or the parent tile) in its place.

   THE VIEW is a centre (lon, lat), a zoom and a graticule flag. The rotation matrix R maps a unit
   vector on the earth to view space (x right, y up, z toward the viewer): R's rows are the right,
   up and forward vectors at the centre. Pixels per radian at the centre is the disc radius, so a
   drag of dx pixels turns the globe by dx / radius radians — the same feel at every zoom. Zooming
   keeps the point under the pointer still (unproject before, re-centre after). The level of detail
   follows kilometres per pixel: a level is used while its simplification tolerance is at most half
   a pixel — LOD 0 above 16 km/px, 1 above 5, 2 above 1, 3 above 0.5, 4 to the cap of 0.15 km/px
   (Q-A6 a), where the finest tolerance (75 m) is half a pixel and the quantum a fifth.

   FRAME ACCOUNTING for .claude/test-atlas-perf.js: the controller keeps the last 600 frame times
   (rAF to rAF, and the renderer's own draw time) under `stats`, and `stats()` — the function —
   returns the renderer's primitive counts of the last frame with the tile state; the suite reads
   them off `document.querySelector(".atlas2").__atlas2`.
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

  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function readPalette() {
    const cs = getComputedStyle(document.body);
    const cv = (n, d) => { const v = cs.getPropertyValue(n).trim(); return /^#[0-9a-f]{6}$/i.test(v) ? v : d; };
    const H = root.AtlasGL.hex2rgb;
    const ink = H(cv("--ink", "#1d1b29")), paper = H(cv("--paper", "#f7f6fb")), paper2 = H(cv("--paper-2", "#ebe9f5")), indigo = H(cv("--indigo", "#45549c")), ochre = H(cv("--ochre", "#9a7c55"));
    const dark = (paper[0] * 0.299 + paper[1] * 0.587 + paper[2] * 0.114) < 0.5;
    // the same derivation v1 uses (readColors in app.js), so the two globes sit in one theme
    return {
      ocean: dark ? mix(paper2, indigo, 0.30) : [0.70, 0.92, 1.0],
      land: mix(paper, ink, 0.10), coast: mix(paper, ink, 0.32), border: mix(paper, ink, 0.46), admin1: mix(paper, ink, 0.26), rim: mix(paper, ink, 0.32),
      halo: dark ? mix(paper2, indigo, 0.6) : mix(paper, indigo, 0.35), grat: ink, selected: mix(paper, ochre, 0.55),
    };
  }

  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error("failed " + src)); document.head.appendChild(s); });
  }

  function mount(host, opts) {
    opts = opts || {};
    const dataUrl = opts.dataUrl || "atlas/data/topology.bin";
    const tileUrl = opts.tileUrl || "atlas/data/tiles/";
    host.innerHTML = `
      <div class="atlas2" role="region" aria-label="Atlas (preview)">
        <canvas class="atlas2-canvas" tabindex="0" role="application" aria-label="Interactive globe — drag to turn, scroll or pinch to zoom, arrow keys turn, plus and minus zoom, Home resets"></canvas>
        <div class="atlas2-zoom" aria-hidden="true">
          <button type="button" class="atlas2-btn" data-zoom="in" title="Zoom in">+</button>
          <button type="button" class="atlas2-btn" data-zoom="out" title="Zoom out">−</button>
          <button type="button" class="atlas2-btn" data-zoom="home" title="Whole earth">⌂</button>
          <button type="button" class="atlas2-btn" data-grat="1" title="Graticule" aria-pressed="false">#</button>
        </div>
        <div class="atlas2-status" role="status" aria-live="polite"><span class="atlas2-bar"><i></i></span><span class="atlas2-note">Fetching the earth…</span></div>
        <div class="atlas2-caption" aria-live="polite"></div>
        <pre class="atlas2-perf" hidden aria-hidden="true"></pre>
      </div>`;
    const el = host.querySelector(".atlas2"), canvas = el.querySelector("canvas"), status = el.querySelector(".atlas2-status"), note = el.querySelector(".atlas2-note"), bar = el.querySelector(".atlas2-bar i"), caption = el.querySelector(".atlas2-caption"), perfEl = el.querySelector(".atlas2-perf");
    const say = (t, frac) => { note.textContent = t; if (frac != null) { bar.style.width = Math.round(frac * 100) + "%"; bar.parentNode.hidden = false; } };
    const fail = (t) => { status.classList.add("atlas2-fail"); bar.parentNode.hidden = true; note.textContent = t; };

    const R = root.AtlasGL.create(canvas, { antialias: opts.antialias });
    if (!R) { fail("This browser has no WebGL2, which the new Atlas needs. The current Atlas at #map still works."); return { dispose() {} }; }
    R.setPalette(readPalette());

    /* ---------- view ---------- */
    const view = { lon: 10, lat: 20, zoom: 1, graticule: false, level: 0, admin1: false, tiles: [], parents: [], radius: 100, cx: 0, cy: 0, rot: new Float32Array(9) };
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

    /* ---------- tiles ---------- */
    let tileIndex = null;             // from the core header: { "3": { cols, rows, present: Set }, "4": … }
    const tileCache = new Map();      // key → { tile }   (insertion order = LRU order)
    const tilePending = new Map();    // key → AbortController
    const tileQueue = [];             // keys waiting for a fetch slot
    let tileBytes = 0, tilesFetched = 0, tilesEvicted = 0;
    function tileKeysFor(z) {
      // the lon/lat box of the viewport: corners and edge midpoints unprojected; at a tile zoom they all lie on the disc
      const idx = tileIndex && tileIndex[z]; if (!idx) return [];
      const pts = [[0, 0], [cssW / 2, 0], [cssW, 0], [cssW, cssH / 2], [cssW, cssH], [cssW / 2, cssH], [0, cssH], [0, cssH / 2], [cssW / 2, cssH / 2]].map(([x, y]) => unproject(x, y));
      if (pts.some((p) => !p)) return [];
      const c = pts[8];
      let lon0 = Infinity, lon1 = -Infinity, lat0 = Infinity, lat1 = -Infinity;
      for (const p of pts) { let d = p.lon - c.lon; if (d > 180) d -= 360; else if (d < -180) d += 360; lon0 = Math.min(lon0, d); lon1 = Math.max(lon1, d); lat0 = Math.min(lat0, p.lat); lat1 = Math.max(lat1, p.lat); }
      if (lat1 > 85 || lat0 < -85) { lon0 = -180; lon1 = 180; }   // near a pole every longitude shows
      const W = 360 / idx.cols, Hh = 180 / idx.rows;
      const keys = [];
      const x0 = Math.floor((c.lon + lon0 + 180) / W), x1 = Math.floor((c.lon + lon1 + 180) / W);
      const y0 = Math.max(0, Math.floor((lat0 + 90) / Hh)), y1 = Math.min(idx.rows - 1, Math.floor((lat1 + 90) / Hh));
      for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) { const k = (((x % idx.cols) + idx.cols) % idx.cols) + "-" + y; if (idx.present.has(k)) keys.push(k); }
      return keys;
    }
    function touchTile(key) { const t = tileCache.get(key); if (t) { tileCache.delete(key); tileCache.set(key, t); } }
    function wantTiles(z, keys) {
      for (const k of keys) {
        if (tileCache.has(k)) { touchTile(k); continue; }
        if (tilePending.has(k) || tileQueue.includes(k)) continue;
        tileQueue.push(k);
      }
      pumpTiles();
    }
    function pumpTiles() {
      while (tileQueue.length && tilePending.size < TILE_PARALLEL) {
        const key = tileQueue.shift();
        // still wanted? (the view may have moved on)
        if (!(view.tiles.includes(key) || view.parents.includes(key))) continue;
        const z = key.split(":")[0];
        const ac = typeof AbortController === "function" ? new AbortController() : null;
        tilePending.set(key, ac);
        const [zz, xy] = key.split(":");
        fetch(tileUrl + zz + "/" + xy + ".bin", ac ? { signal: ac.signal } : undefined)
          .then((res) => { if (!res.ok) throw new Error("HTTP " + res.status); return res.arrayBuffer(); })
          .then((buffer) => { if (disposed) return; tileBytes += buffer.byteLength; tilesFetched++; postToWorker({ type: "tile", key, buffer }, [buffer]); })
          .catch((e) => { tilePending.delete(key); if (!disposed && !(e && e.name === "AbortError")) stats.tileErrors = (stats.tileErrors || 0) + 1; pumpTiles(); });
        void z;
      }
    }
    function onTile(m) {
      tilePending.delete(m.key);
      R.setTile(m.key, { segs: m.segs, segRange: m.segRange, segCap: m.segCap, facePos: m.facePos, faceIdx: m.faceIdx, faceRange: m.faceRange, faceCap: m.faceCap }, m.tile);
      tileCache.set(m.key, { tile: m.tile, stats: m.stats });
      stats.tiles.push(m.stats); if (stats.tiles.length > 200) stats.tiles.shift();
      while (tileCache.size > TILE_CACHE) { const oldest = tileCache.keys().next().value; if (view.tiles.includes(oldest) || view.parents.includes(oldest)) break; tileCache.delete(oldest); R.dropTile(oldest); tilesEvicted++; }
      pumpTiles();
      invalidate();
    }

    /* ---------- frame loop ---------- */
    const stats = { frames: [], draw: [], uploads: {}, worker: null, fetchMs: 0, firstPaintMs: 0, ready: false, level: 0, tiles: [], tileErrors: 0 };
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
        clampView();
        view.radius = base * view.zoom; rotation();
        const k = kmPerPx();
        view.level = levelFor(k);
        view.admin1 = k < ADMIN1_KM_PER_PX;
        if (view.level >= 3 && tileIndex) {
          view.tiles = tileKeysFor(view.level).map((x) => view.level + ":" + x);
          view.parents = view.level === 4 ? tileKeysFor(3).map((x) => "3:" + x) : [];
          wantTiles(view.level, view.tiles);
          if (view.level === 4) wantTiles(3, view.parents);
        } else { view.tiles = []; view.parents = []; }
        stats.level = view.level;
        R.render(view);
        stats.draw.push(R.rawStats.lastMs); if (stats.draw.length > 600) stats.draw.shift();
        if (!stats.firstPaintMs && R.levelLoaded(0)) stats.firstPaintMs = Math.round(performance.now() - t0);
        if (perfOn) perfText();
      }
      if (coasting) { coast(); }
      if (needs || coasting) raf = requestAnimationFrame(frame); else lastT = 0;
    }
    function invalidate() { needs = true; if (!raf && !disposed) raf = requestAnimationFrame(frame); }
    function perfText() {
      const f = stats.frames.slice(-120).sort((a, b) => a - b), n = f.length;
      const mean = n ? f.reduce((a, b) => a + b, 0) / n : 0, p95 = n ? f[Math.min(n - 1, Math.floor(0.95 * n))] : 0, max = n ? f[n - 1] : 0;
      const s = R.stats();
      perfEl.textContent = `frame ms (last ${n}): mean ${mean.toFixed(1)}  p95 ${p95.toFixed(1)}  max ${max.toFixed(1)}\n` +
        `draw ${s.lastMs.toFixed(2)} ms  ${s.triangles} tri  ${s.segments} seg  ${s.draws} calls\n` +
        `LOD ${s.level} (core ${s.coreLevel})  ${kmPerPx().toFixed(3)} km/px  zoom ${view.zoom.toFixed(2)}\n` +
        `tiles: ${s.tilesDrawn} drawn, ${s.parentsDrawn} parents, ${view.tiles.length} wanted, ${tilePending.size} pending, ${tileCache.size} resident, ${tilesFetched} fetched (${(tileBytes / 1024).toFixed(0)} KB), ${tilesEvicted} evicted\n` +
        `dpr ${Math.min(2, window.devicePixelRatio || 1)}  ${cssW}×${cssH}`;
    }
    function setPerf(on) { perfOn = on; perfEl.hidden = !on; if (on) perfText(); }
    setPerf(perfOn);

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
      else used = false;
      if (used) { e.preventDefault(); clampView(); invalidate(); }
    });
    el.querySelectorAll("[data-zoom]").forEach((b) => b.addEventListener("click", () => {
      const z = b.getAttribute("data-zoom");
      if (z === "in") zoomAt(1.5); else if (z === "out") zoomAt(1 / 1.5); else { view.lon = 10; view.lat = 20; view.zoom = 1; clampView(); }
      invalidate();
    }));
    const gratBtn = el.querySelector("[data-grat]");
    gratBtn.addEventListener("click", () => { view.graticule = !view.graticule; gratBtn.setAttribute("aria-pressed", String(view.graticule)); invalidate(); });

    let header = null, faceEntity = null;
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
      if (m.type === "error") { if (/^tile /.test(m.message)) { stats.tileErrors++; const k = m.message.split(" ")[1].replace(/:$/, ""); tilePending.delete(k); pumpTiles(); return; } fail("The Atlas data could not be read: " + m.message); return; }
      if (m.type === "meta") {
        header = m.header; faceEntity = m.faceEntity; R.setFaceCount(faceEntity.length);
        if (header.tiles) { tileIndex = {}; for (const z of Object.keys(header.tiles)) { const t = header.tiles[z]; tileIndex[z] = { cols: t.cols, rows: t.rows, present: new Set(t.present) }; } }
        say("Shaping the land…", 0.35); return;
      }
      if (m.type === "lod") {
        const tu = performance.now();
        R.setLevel(m.level, { segs: m.segs, segRange: m.segRange, segCap: m.segCap, facePos: m.facePos, faceIdx: m.faceIdx, faceRange: m.faceRange, faceCap: m.faceCap });
        stats.uploads[m.level] = Math.round(performance.now() - tu);
        say(m.level === 0 ? "Drawing…" : "Adding detail…", 0.5 + 0.17 * (m.level + 1));
        invalidate();
        return;
      }
      if (m.type === "tile") { onTile(m); return; }
      if (m.type === "done") { stats.worker = m.stats; stats.ready = true; status.hidden = true; el.setAttribute("data-ready", "1"); invalidate(); }
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

    /* ---------- lifecycle ---------- */
    const onResize = () => { if (!el.isConnected) { dispose(); return; } layout(); invalidate(); };
    window.addEventListener("resize", onResize);
    const viewHost = document.getElementById("view") || document.body;
    const mo = new MutationObserver(() => { if (!el.isConnected) dispose(); });
    mo.observe(viewHost, { childList: true });
    function dispose() {
      if (disposed) return;
      disposed = true;
      try { mo.disconnect(); } catch (e) {}
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      for (const ac of tilePending.values()) { try { if (ac) ac.abort(); } catch (e) {} }
      if (worker) { try { worker.terminate(); } catch (e) {} worker = null; }
      R.dispose();
    }
    layout();
    invalidate();
    // the view set from outside (the perf suite's fixed views): centre, zoom, then wait for `tilesSettled()`
    function setView(lon, lat, kmPerPixel) { view.lon = lon; view.lat = lat; view.zoom = R_KM / (kmPerPixel * base); clampView(); invalidate(); }
    const tilesSettled = () => view.tiles.every((k) => R.tileLoaded(k)) && (view.level !== 4 || view.parents.every((k) => R.tileLoaded(k))) && tilePending.size === 0;
    const controller = { dispose, stats, view, renderer: R, invalidate, zoomAt, pick, setView, kmPerPx, tilesSettled, setPerf, statsNow: () => Object.assign(R.stats(), { kmPerPx: kmPerPx(), wanted: view.tiles.length, pending: tilePending.size, resident: tileCache.size, fetched: tilesFetched, tileBytes, evicted: tilesEvicted }) };
    el.__atlas2 = controller;
    return controller;
  }

  root.AtlasV2 = { mount };
})(typeof window !== "undefined" ? window : globalThis);
