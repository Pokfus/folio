/* atlas-embed.js — Atlas v2 in a card: ONE headless engine, any number of small windows (docs/atlas-v2-design.md §7 "Phase 4 — as built").

   THE PROBLEM. A study card carries a map window, a page of the card browser carries twenty, Find-it carries a whole board — and a browser allows about
   sixteen live WebGL contexts per page, after which the oldest is silently lost. The windows therefore do not own a context.

   THE SHAPE. `ensure()` mounts atlas.js's own controller ONCE with `embed: true` into a hidden holder: the same renderer, worker, tiles, water and
   history as the Atlas page, with none of the page's chrome, storage, address-bar or names. A window is a plain 2D canvas plus a spec — the size,
   the centre, the zoom (the Atlas's own: radius = 0.46 × the short side × zoom), the layers, the faces to highlight and the year. `draw(spec, ctx)`
   resizes the hub to the spec, asks the controller for one frame, copies its GL canvas into the window's canvas and draws the highlights' outlines
   on top. That is one context for the whole page, and a window costs the page nothing while it is not being drawn.

     const hub = await AtlasEmbed.ensure({ host, dataUrl, … })   the hub (null if the page cannot run WebGL2: the caller keeps its own renderer)
     hub.draw(spec, ctx, { dpr })  → { settled, project(lon, lat) → [x, y, z] }
     hub.onChange(fn)              told when a tile, a water level or the history arrived (the windows redraw)
     AtlasEmbed.view(canvas, opts) the interaction every window shares (drag, pinch, wheel, keys, zoom buttons, home) over `spec`
     AtlasEmbed.stats()            { live, created, disposed, windows, draws } — a suite counts the contexts
     AtlasEmbed.release()          the last window went away: the hub is disposed after IDLE_MS, and recreated by the next `ensure()`

   WHAT A SPEC IS. { w, h (CSS px), lon, lat, zoom, layers: { borders, provinces, rivers, lakes }, year (omitted = today), highlights: [{ ids: [entity ids],
   rgb: [0–255], a: fill alpha, line: css colour, lineWidth, glow: css colour, glowBlur }] }. A highlight's FILL is the face colour of the Atlas's own
   selection mechanism (R.highlight: one texel per face), blended with the palette's land at `a` so that it reads exactly as a translucent tint over
   land; its OUTLINE and GLOW are drawn here from a mask pass — the same view rendered with only the highlighted faces white — because the renderer's
   arcs are shared between neighbours and carry no "this one is selected".

   No names are drawn by the hub (the gazetteer is not loaded, `countries/places/physical/cities` are off): a window names what it marks itself. */
(function (root) {
  "use strict";
  const IDLE_MS = 20000;        // a hub with no window left is disposed after this long (its GPU memory is the page's to have back)
  const D2R = Math.PI / 180;
  let hub = null, starting = null, idleTimer = 0, failed = false;   // failed: this page cannot run the engine (no WebGL2, a refused worker): ask once, answer null thereafter
  const counters = { created: 0, disposed: 0, draws: 0, masks: 0 };
  const windows = new Set();

  function ensure(opts) {
    opts = opts || {};
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = 0; }
    if (failed) return Promise.resolve(null);
    if (starting) return starting;   // the hub exists but its first level is not on the GPU yet: everyone waits for the same promise
    if (hub) return Promise.resolve(hub.ok ? hub : null);
    if (!root.AtlasV2 || typeof root.AtlasV2.mount !== "function") return Promise.resolve(null);
    starting = new Promise((resolve) => {
      const holder = document.createElement("div");
      holder.className = "atlas2-hub"; holder.setAttribute("aria-hidden", "true");
      holder.style.cssText = "position:fixed;left:-99999px;top:0;width:340px;height:260px;visibility:hidden;pointer-events:none;overflow:hidden;";
      document.body.appendChild(holder);
      let ctl = null;
      try { root.AtlasV2.mount(holder, Object.assign({ host: {} }, opts, { embed: true })); ctl = holder.querySelector(".atlas2") && holder.querySelector(".atlas2").__atlas2; } catch (e) { ctl = null; }
      if (!ctl || !ctl.embed || !ctl.embed.webgl) { try { if (ctl && ctl.dispose) ctl.dispose(); } catch (e) {} holder.remove(); starting = null; failed = true; resolve(null); return; }
      counters.created++;
      try { ctl.renderer.stillCache(false); ctl.renderer.linesCache(false); } catch (e) { /* the caches serve one view held still; a hub is asked a different view every frame */ }
      const E = ctl.embed, glCanvas = E.el.querySelector(".atlas2-canvas"), listeners = new Set();
      const h = hub = {
        ok: true, ctl, holder, E, glCanvas, listeners, w: 0, h: 0, faces: new Map(), last: null, disposed: false,
        onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
        ready: () => E.ready() && E.levelReady(),
        landRGB: () => ctl.palette().land.slice(),
        draw: (spec, ctx, o) => draw(h, spec, ctx, o || {}),
        pick: (spec, x, y) => pickAt(h, spec, x, y),
        startHistory: () => E.startHistory(),
        facesOf: (id) => { let f = h.faces.get(id); if (!f) h.faces.set(id, f = E.facesOfId(id)); return f; },
        dispose: () => dispose(h),
      };
      let pending = false;
      E.setHook(() => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; if (h.disposed) return; for (const fn of [...listeners]) { try { fn(); } catch (e) { /* a window's redraw must not stop the others */ } } }); });
      // the hub is usable when its first level is on the GPU; until then ensure() waits, and the windows are told by onChange
      const t0 = performance.now();
      const tick = () => { if (h.disposed) { resolve(null); return; } if (h.ready()) { h.readyMs = Math.round(performance.now() - t0); starting = null; resolve(h); } else setTimeout(tick, 30); };
      // the controller reports failure by showing a message and never becoming ready: give up after a minute
      const giveUp = setTimeout(() => { if (!h.ready() && !h.disposed) { h.ok = false; starting = null; failed = true; dispose(h); resolve(null); } }, 60000);
      const done = resolve; void done; void giveUp;
      tick();
    });
    return starting;
  }

  function dispose(h) {
    if (h.disposed) return; h.disposed = true; counters.disposed++;
    try { h.ctl.dispose(); } catch (e) {}
    try { h.holder.remove(); } catch (e) {}
    if (hub === h) hub = null;
  }
  function release() {
    if (windows.size || !hub) return;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { idleTimer = 0; if (!windows.size && hub) dispose(hub); }, IDLE_MS);
  }

  /* size the hub's element to the spec and make the controller see it (layout() reads the element's box) */
  function fit(h, spec) {
    const w = Math.max(1, Math.round(spec.w)), hh = Math.max(1, Math.round(spec.h));
    if (w === h.w && hh === h.h) return;
    h.w = w; h.h = hh;
    h.holder.style.width = w + "px"; h.holder.style.height = hh + "px";
    h.E.el.style.cssText = "width:" + w + "px;height:" + hh + "px;min-height:0;border-radius:0;";
    h.E.layout();
  }
  /* put the controller's view where the spec says and plan it (the tiles it needs are requested here) */
  function setup(h, spec) {
    const ctl = h.ctl, v = ctl.view, L = ctl.layers;
    fit(h, spec);
    const lay = spec.layers || {};
    L.borders = lay.borders !== false; L.provinces = !!lay.provinces; L.rivers = !!lay.rivers; L.lakes = !!lay.lakes; L.relief = false; L.graticule = false;
    v.graticule = false; v.rivers = L.rivers; v.lakes = L.lakes;
    v.lon = spec.lon; v.lat = spec.lat; v.zoom = spec.zoom;
    h.E.plan();
    // the water is asked for by the first plan that sees rivers or lakes on; a second plan lets this one's view use what that request set up
    if ((L.rivers || L.lakes) && (v.rivers !== L.rivers || v.lakes !== L.lakes)) h.E.plan();
  }
  const rgb01 = (c) => [c[0] / 255, c[1] / 255, c[2] / 255];

  function project(rot, radius, cx, cy) {
    return (lon, lat) => {
      const lo = lon * D2R, la = lat * D2R, cl = Math.cos(la), x = cl * Math.cos(lo), y = cl * Math.sin(lo), z = Math.sin(la);
      return [cx + radius * (rot[0] * x + rot[1] * y + rot[2] * z), cy - radius * (rot[3] * x + rot[4] * y + rot[5] * z), rot[6] * x + rot[7] * y + rot[8] * z];
    };
  }

  function draw(h, spec, ctx, o) {
    if (h.disposed) return { settled: false, project: null };
    const ctl = h.ctl, R = ctl.renderer, v = ctl.view, E = h.E;
    setup(h, spec);
    counters.draws++;
    // the fills of the highlights: one Map of face index → colour, blended over the palette's land at the highlight's alpha
    const land = h.landRGB(), fills = new Map(), groups = [];
    for (const hl of spec.highlights || []) {
      const faces = []; for (const id of hl.ids || []) for (const f of h.facesOf(id)) faces.push(f);
      if (!faces.length) continue;
      const a = hl.a == null ? 0.24 : hl.a, c = rgb01(hl.rgb || [255, 200, 40]);
      const col = [land[0] + (c[0] - land[0]) * a, land[1] + (c[1] - land[1]) * a, land[2] + (c[2] - land[2]) * a];
      for (const f of faces) fills.set(f, col);
      groups.push({ hl, faces });
    }
    R.highlight(fills);
    R.render(v);
    const dpr = o.dpr || Math.min(2, window.devicePixelRatio || 1), W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.drawImage(h.glCanvas, 0, 0, h.glCanvas.width, h.glCanvas.height, 0, 0, W, H);
    // the outline and the glow of each group, from a mask pass (only on request: a gesture frame skips them)
    if (!o.fast) for (const g of groups) if (g.hl.line || g.hl.glow) outline(h, g, ctx, spec, dpr);
    const rot = Array.from(E.rotation()), pr = project(rot, v.radius, v.cx, v.cy);
    h.last = { rot, radius: v.radius, cx: v.cx, cy: v.cy, kmpp: v.kmpp, level: v.level };
    const settled = E.landSettled() && ctl.tilesSettled() && ctl.waterSettled();
    return { settled, project: pr, radius: v.radius, cx: v.cx, cy: v.cy, kmpp: v.kmpp, level: v.level };
  }

  /* the mask pass: the same view with only the group's faces white on black, read back, and turned into a ±width/2 band round the edge plus a soft glow */
  function outline(h, g, ctx, spec, dpr) {
    const ctl = h.ctl, R = ctl.renderer, v = ctl.view, gl = R.gl; if (!gl) return;
    counters.masks++;
    const keep = { borders: v.borders, admin1: v.admin1, rivers: v.rivers, lakes: v.lakes, graticule: v.graticule };
    const pal = ctl.palette(), black = [0, 0, 0], white = [1, 1, 1];
    R.setPalette(Object.assign({}, pal, { ocean: black, land: black, coast: black, border: black, admin1: black, river: black, lake: black, lakeShore: black, rim: black, halo: black, grat: black, selected: white }));
    v.borders = false; v.admin1 = false; v.rivers = false; v.lakes = false; v.graticule = false;
    const m = new Map(); for (const f of g.faces) m.set(f, white);
    R.highlight(m); R.render(v);
    const w = gl.drawingBufferWidth, hh = gl.drawingBufferHeight, px = new Uint8Array(w * hh * 4);
    gl.readPixels(0, 0, w, hh, gl.RGBA, gl.UNSIGNED_BYTE, px);
    // restore the hub's state for the next window
    R.setPalette(pal); Object.assign(v, keep);
    // mask[y][x] = 1 where the pixel is white (readPixels is bottom-up)
    const mask = new Uint8Array(w * hh);
    for (let y = 0; y < hh; y++) { const src = (hh - 1 - y) * w * 4, dst = y * w; for (let x = 0; x < w; x++) mask[dst + x] = px[src + 4 * x] > 127 && px[src + 4 * x + 3] > 127 ? 1 : 0; }
    const lw = Math.max(1, (g.hl.lineWidth || 2.6) * dpr), r = Math.max(1, Math.round(lw / 2));
    const dilate = (src, rad, inv) => {   // separable max filter over `src` (or its complement), radius rad
      const tmp = new Uint8Array(w * hh), out = new Uint8Array(w * hh);
      for (let y = 0; y < hh; y++) { const row = y * w; for (let x = 0; x < w; x++) { let hit = 0; const a = Math.max(0, x - rad), b = Math.min(w - 1, x + rad); for (let k = a; k <= b; k++) { const s = inv ? 1 - src[row + k] : src[row + k]; if (s) { hit = 1; break; } } tmp[row + x] = hit; } }
      for (let x = 0; x < w; x++) { for (let y = 0; y < hh; y++) { let hit = 0; const a = Math.max(0, y - rad), b = Math.min(hh - 1, y + rad); for (let k = a; k <= b; k++) if (tmp[k * w + x]) { hit = 1; break; } out[y * w + x] = hit; } }
      return out;
    };
    const outer = dilate(mask, r, false), inner = dilate(mask, r, true);   // outer: within r of the shape; inner: within r of the outside
    const band = document.createElement("canvas"); band.width = w; band.height = hh;
    const bctx = band.getContext("2d"), img = bctx.createImageData(w, hh);
    const col = cssRGBA(g.hl.line || "rgba(0,0,0,0)"); let any = false;
    for (let i = 0; i < w * hh; i++) if (outer[i] && inner[i]) { img.data[4 * i] = col[0]; img.data[4 * i + 1] = col[1]; img.data[4 * i + 2] = col[2]; img.data[4 * i + 3] = Math.round(255 * col[3]); any = true; }
    if (!any) return;
    bctx.putImageData(img, 0, 0);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (g.hl.glow) { ctx.shadowColor = g.hl.glow; ctx.shadowBlur = (g.hl.glowBlur || 9) * dpr; ctx.drawImage(band, 0, 0, w, hh, 0, 0, ctx.canvas.width, ctx.canvas.height); ctx.shadowBlur = 0; ctx.shadowColor = "transparent"; }
    ctx.drawImage(band, 0, 0, w, hh, 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }
  const _cc = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null;
  function cssRGBA(css) {
    if (!_cc) return [0, 0, 0, 1];
    _cc.clearRect(0, 0, 1, 1); _cc.fillStyle = "#000"; _cc.fillStyle = css; _cc.fillRect(0, 0, 1, 1);
    const d = _cc.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255];
  }

  /* what is under a pixel of the window right now: the entity ids the Atlas's own ID pass answers (Find-it scores with this) */
  function pickAt(h, spec, x, y) {
    setup(h, spec);
    const ctl = h.ctl; ctl.renderer.highlight(null);
    return ctl.renderer.pick(ctl.view, x, y, "land") || null;
  }

  /* ---- the interaction every window shares ----
     opts: { spec(state) → the spec for the current state, draw(state, api) → called after the base is drawn so the window can add its marks, onView(state),
             zmin, zmax, fit() → { lon, lat, zoom } for "home", host (the element whose keys/clicks are wired), minDrag }                                   */
  function view(cv, opts) {
    const st = { lon: 0, lat: 0, zoom: 1, home: { lon: 0, lat: 0, zoom: 1 } };
    const ctx = cv.getContext("2d");
    let raf = 0, stopped = false, dirty = true, fastUntil = 0, settled = false, off = null;
    const ptrs = new Map(); let last = null, pinch = 0;
    const clamp = (z) => Math.max(opts.zmin || 0.85, Math.min(opts.zmax || 400, z));
    const w = { st, cv, windowId: windows.size + 1 };
    windows.add(w);
    function size() {
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      const cw = Math.max(1, Math.round(r.width)), ch = Math.max(1, Math.round(r.height));
      if (cv.width !== Math.round(cw * dpr) || cv.height !== Math.round(ch * dpr)) { cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); dirty = true; }
      return { cw, ch, dpr };
    }
    function paint() {
      raf = 0; if (stopped) return;
      const { cw, ch, dpr } = size(); if (cw < 2 || ch < 2) return;
      ensure(opts.hubOptions).then((hb) => {
        if (stopped || !hb) return;
        if (!off) { off = hb.onChange(() => { if (!settled) schedule(); }); }
        const spec = Object.assign({ w: cw, h: ch, lon: st.lon, lat: st.lat, zoom: st.zoom }, opts.spec ? opts.spec(st, { cw, ch }) : {});
        spec.lon = st.lon; spec.lat = st.lat; spec.zoom = st.zoom; spec.w = cw; spec.h = ch;
        const fast = performance.now() < fastUntil;
        const res = hb.draw(spec, ctx, { dpr, fast });
        settled = res.settled && !fast;
        w.api = { project: res.project, cw, ch, dpr, radius: res.radius, cx: res.cx, cy: res.cy, kmpp: res.kmpp, settled, fast, spec };
        if (opts.draw) opts.draw(st, w.api, ctx);
        if (fast) { if (!w.fastTimer) w.fastTimer = setTimeout(() => { w.fastTimer = 0; dirty = true; schedule(); }, 140); }
        if (opts.onPaint) opts.onPaint(st, w.api);
        dirty = false;
        if (!settled && !fast) w.retry = setTimeout(() => { w.retry = 0; if (!stopped && !settled) schedule(); }, 400);
      });
    }
    function schedule() { if (stopped || raf) return; dirty = true; raf = requestAnimationFrame(paint); }
    w.schedule = schedule; w.paint = paint;
    w.setView = (lon, lat, zoom, o) => { st.lon = ((lon + 180) % 360 + 360) % 360 - 180; st.lat = Math.max(-85, Math.min(85, lat)); st.zoom = clamp(zoom); if (!o || !o.silent) { if (opts.onView) opts.onView(st); schedule(); } };
    w.setHome = (lon, lat, zoom) => { st.home = { lon, lat, zoom: clamp(zoom) }; };
    w.goHome = () => w.setView(st.home.lon, st.home.lat, st.home.zoom);
    w.zoomBy = (f) => w.setView(st.lon, st.lat, st.zoom * f);
    w.panBy = (dx, dy) => {   // screen px → degrees at the centre, as the Atlas does it (a pixel is R_KM/radius km)
      const r = 0.46 * Math.min(w.api ? w.api.cw : cv.clientWidth, w.api ? w.api.ch : cv.clientHeight) * st.zoom, k = 180 / Math.PI / Math.max(1, r);
      st.lon -= dx * k / Math.max(0.2, Math.cos(st.lat * D2R)); st.lat += dy * k; st.lon = ((st.lon + 180) % 360 + 360) % 360 - 180; st.lat = Math.max(-85, Math.min(85, st.lat));
      fastUntil = performance.now() + 140; if (opts.onView) opts.onView(st); schedule();
    };
    // pointers: one finger or the mouse drags, two fingers pinch, the wheel zooms about the centre
    cv.addEventListener("pointerdown", (e) => {
      if (e.button != null && e.button !== 0 && e.pointerType === "mouse") return;
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      ptrs.set(e.pointerId, [e.clientX, e.clientY]); last = [e.clientX, e.clientY]; w.moved = 0; w.downAt = [e.clientX, e.clientY];
      if (ptrs.size === 2) { const a = [...ptrs.values()]; pinch = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); }
    });
    cv.addEventListener("pointermove", (e) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (ptrs.size === 2) { const a = [...ptrs.values()], d = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); if (pinch > 0 && d > 0) { st.zoom = clamp(st.zoom * d / pinch); fastUntil = performance.now() + 140; if (opts.onView) opts.onView(st); schedule(); } pinch = d; w.moved = 99; return; }
      if (last) { const dx = e.clientX - last[0], dy = e.clientY - last[1]; w.moved += Math.abs(dx) + Math.abs(dy); if (w.moved > (opts.minDrag || 4)) w.panBy(dx, dy); last = [e.clientX, e.clientY]; }
      if (e.cancelable && w.moved > 4) e.preventDefault();
    });
    const release = (e) => { const was = ptrs.has(e.pointerId); ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = 0; if (!ptrs.size) { last = null; if (was && w.moved <= (opts.minDrag || 4) && opts.onTap) opts.onTap(e, w); w.moved = 0; } };
    cv.addEventListener("pointerup", release); cv.addEventListener("pointercancel", release);
    cv.addEventListener("wheel", (e) => { e.preventDefault(); w.zoomBy(Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
    cv.addEventListener("keydown", (e) => {
      const k = e.key; let used = true;
      if (k === "ArrowLeft") w.panBy(24, 0); else if (k === "ArrowRight") w.panBy(-24, 0); else if (k === "ArrowUp") w.panBy(0, 24); else if (k === "ArrowDown") w.panBy(0, -24);
      else if (k === "+" || k === "=") w.zoomBy(1.4); else if (k === "-" || k === "_") w.zoomBy(1 / 1.4); else if (k === "Home") w.goHome(); else used = false;
      if (used) { e.preventDefault(); e.stopPropagation(); }
    });
    let ro = null;
    if (typeof ResizeObserver === "function") { ro = new ResizeObserver(() => { dirty = true; schedule(); }); ro.observe(cv); }
    w.stop = () => { stopped = true; if (raf) cancelAnimationFrame(raf); raf = 0; if (w.fastTimer) clearTimeout(w.fastTimer); if (w.retry) clearTimeout(w.retry); if (off) off(); if (ro) ro.disconnect(); windows.delete(w); release0(); };
    w.isSettled = () => settled;
    return w;
  }
  function release0() { release(); }

  root.AtlasEmbed = { ensure, view, release, stats: () => ({ live: hub && !hub.disposed ? 1 : 0, created: counters.created, disposed: counters.disposed, windows: windows.size, draws: counters.draws, masks: counters.masks, ready: !!(hub && hub.ready()) }), hub: () => hub, IDLE_MS };
})(typeof window !== "undefined" ? window : globalThis);
