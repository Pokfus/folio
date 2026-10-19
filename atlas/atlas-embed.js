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

   WHAT A SPEC IS. { w, h (CSS px), lon, lat, zoom, layers: { borders, provinces, rivers, lakes, relief, strength }, year (omitted = today), highlights: [{ ids: [entity ids],
   rgb: [0–255], a: fill alpha, line: css colour, lineWidth, glow: css colour, glowBlur }] }. A highlight's FILL is the face colour of the Atlas's own
   selection mechanism (R.highlight: one texel per face), blended with the palette's land at `a` so that it reads exactly as a translucent tint over
   land; its OUTLINE and GLOW are drawn here from a mask pass — the same view rendered with only the highlighted faces white — because the renderer's
   arcs are shared between neighbours and carry no "this one is selected". A past year's highlight is states of that year (tinted through the history's own style table); with `exact: true` the tint carries the
   highlight's own alpha (so it reads as the same translucent blend over the land as a modern country's) and the outline and glow come from a mask pass of those states (atlas.js `setMask`). `layers.flat` (Find-it's
   area round) draws every state of the year in the land colour with the modern borders' colour and width. The still renderer (no WebGL2) outlines a highlight only when it says `exact`.

   No names are drawn by the hub (the gazetteer is not loaded, `countries/places/physical/cities` are off): a window names what it marks itself. */
(function (root) {
  "use strict";
  // a hub with no window left is disposed after IDLE_MS (its GPU memory is the page's to have back); a suite shortens it with setIdleMs
  const D2R = Math.PI / 180, ZMAX_2D = 8;
  let hub = null, starting = null, idleTimer = 0, failed = false, idleMs = 20000, canvas2d = false;   // canvas2d (Phase 5): the hub runs on atlas-canvas.js because this browser has no WebGL2   // failed: this page cannot run the engine (no WebGL2, a refused worker): ask once, answer null thereafter
  const counters = { created: 0, disposed: 0, draws: 0, masks: 0 };
  const windows = new Set();

  /* a window whose canvas has left the document (the page it was on was replaced; nothing calls stop() on a card page's windows) no longer counts: the hub's idle timer and the history rule below read the live ones */
  function prune() { for (const w of [...windows]) if (w.cv && !w.cv.isConnected && w.stop) { try { w.stop(); } catch (e) { windows.delete(w); } } }
  function ensure(opts) {
    opts = opts || {};
    prune();
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = 0; }
    if (failed) return Promise.resolve(null);
    /* Phase 4c: a hub that began on a SLICE of the history ("wars": the war windows' states; "ww2": the Second World War window's front, 2026-10-19) cannot answer a window that needs another file — an area round (any year), or the other slice:
       with no window on it, it is disposed and the next hub reads the file that window needs. A hub on the whole history ("full") answers every request. With a window still open the hub stays as it is and the newcomer takes what it has. */
    // ownHolds: the asking window's own hold (atlas-windows.js holds the hub from the moment it is made)
    if (opts.needHistory && hub && !starting && !windows.size && holds.size <= (opts.ownHolds || 0)) { const k = hub.E.historyKind(); if (k && k !== "full" && k !== opts.needHistory) dispose(hub); }
    if (starting) return starting;   // the hub exists but its first level is not on the GPU yet: everyone waits for the same promise
    if (hub) return Promise.resolve(hub.ok ? hub : null);
    if (!root.AtlasV2 || typeof root.AtlasV2.mount !== "function") return Promise.resolve(null);
    starting = new Promise((resolve) => {
      const holder = document.createElement("div");
      holder.className = "atlas2-hub"; holder.setAttribute("aria-hidden", "true");
      holder.style.cssText = "position:fixed;left:-99999px;top:0;width:340px;height:260px;visibility:hidden;pointer-events:none;overflow:hidden;";
      document.body.appendChild(holder);
      let ctl = null;
      try { root.AtlasV2.mount(holder, Object.assign({}, opts, { host: Object.assign({ reducedMotion: () => true }, opts.host || {}), embed: true })); /* no crossfade: a hub has no frames to fade over */ ctl = holder.querySelector(".atlas2") && holder.querySelector(".atlas2").__atlas2; } catch (e) { ctl = null; }
      if (!ctl || !ctl.embed || (!ctl.embed.webgl && !(ctl.renderer && ctl.renderer.static2d))) { try { if (ctl && ctl.dispose) ctl.dispose(); } catch (e) {} holder.remove(); starting = null; failed = true; resolve(null); return; }
      canvas2d = !ctl.embed.webgl;   // Phase 5: no WebGL2 — the still Canvas 2D renderer draws the hub: land, borders, the tints; no outline pass, no history, no tiles, the zoom held at 5 km/px
      counters.created++;
      try { performance.mark("a2:hub-created"); } catch (e) {}
      try { ctl.renderer.stillCache(false); ctl.renderer.linesCache(false); } catch (e) { /* the caches serve one view held still; a hub is asked a different view every frame */ }
      const E = ctl.embed, glCanvas = E.el.querySelector(".atlas2-canvas"), listeners = new Set();
      const h = hub = {
        ok: true, canvas2d, ctl, holder, E, glCanvas, listeners, w: 0, h: 0, faces: new Map(), last: null, disposed: false,
        onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
        ready: () => E.levelReady(),   // Phase 4b: the coarsest level on the GPU is enough to draw a first frame; the finer levels arrive after it and the windows redraw (a draw's `settled` says whether the level its zoom wants is in)
        done: () => E.ready(),
        landRGB: () => ctl.palette().land.slice(),
        draw: (spec, ctx, o) => draw(h, spec, ctx, o || {}),
        pick: (spec, x, y) => pickAt(h, spec, x, y),
        kindOfId: (id) => (E.kindOfId ? E.kindOfId(id) : null),
        idsAt: (spec, x, y) => { setup(h, spec); return E.idsAt(x, y); },
        lonLatAt: (spec, x, y) => { setup(h, spec); return E.lonLatAt(x, y); },
        startHistory: (kind) => E.startHistory(kind),
        historyKind: () => E.historyKind(),   // null (not started), "wars" (the war-window slice), "ww2" (the Second World War window's) or "full"
        historyOK: () => E.historyOK(),
        warView: (id, short, share) => E.warFrame(id, short, share),
        warSides: (id, year) => E.warSides(id, year),
        warTimeline: (id) => E.warTimeline(id),   // the war's dated steps (years of change; the front's plate dates when the file has them): a war window's timeline
        /* a point inside each of the faces, on the visible part of the view the hub is in now (the worker's label anchor; `near`, [{ face, lon, lat }], searches a face in the piece nearest that point — a war window passes each side's principal's capital): Promise of [{ face, v: unit vector | null (the best point), pts: [{ v, clear }] (up to twelve, best first), clear (px of the view it was asked in), vis, km2 }] — a point on the sphere, not a screen
           point, so a window can carry it through its next pan or pinch and ask again at rest */
        faceAnchors: (faces, near) => new Promise((res) => E.faceAnchors(faces, (rows, q) => res(q ? rows.map((r) => ({ face: r.face, vis: r.vis, km2: r.km2, clear: r.clear, v: r.anchor ? unitAt(q, r.anchor[0], r.anchor[1]) : null, pts: (r.pts || []).map((p) => ({ v: unitAt(q, p[0], p[1]), clear: p[2] })).filter((p) => p.v), piece: !!r.piece })) : []), near)),
        warColours: () => E.warColours(),
        facesOf: (id) => { let f = h.faces.get(id); if (!f) h.faces.set(id, f = E.facesOfId(id)); return f; },
        dispose: () => dispose(h),
      };
      let pending = false;
      E.setHook(() => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; if (h.disposed) return; for (const fn of [...listeners]) { try { fn(); } catch (e) { /* a window's redraw must not stop the others */ } } }); });
      // the hub is usable when its first level is on the GPU; until then ensure() waits, and the windows are told by onChange
      const t0 = performance.now();
      const tick = () => { if (h.disposed) { resolve(null); return; } if (h.ready()) { try { performance.mark("a2:hub-ready"); } catch (e) {} h.readyMs = Math.round(performance.now() - t0); starting = null; resolve(h); } else setTimeout(tick, 30); };
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
  /* A WINDOW THAT IS STILL WAITING (for the history file a war window needs: 9 MB, a minute on a slow connection) is not yet in `windows` — it registers when its view is made — and the idle warm-up arms a dispose timer of its own (60 s)
     that nothing cancels: the hub was disposed under a war window that had been waiting 60 s, and the window then never settled (found by the phone profile of Phase 4b). A pending window therefore HOLDS the hub: `hold()` → a function that lets go. */
  const holds = new Set();
  function hold() { const t = {}; holds.add(t); if (idleTimer) { clearTimeout(idleTimer); idleTimer = 0; } return () => { if (!holds.delete(t)) return; release(); }; }
  function release(ms) {
    prune();
    if (windows.size || holds.size || !hub) return;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { idleTimer = 0; if (!windows.size && !holds.size && hub) dispose(hub); }, ms || idleMs);
  }
  /* the page's idle warm-up (app.js): create the hub now, with no window, and let it go after `ms` if none comes — the first window then draws at once instead of waiting for the worker */
  function warm(opts, ms) {
    return ensure(opts).then((h) => { if (h) release(ms); return !!h; });
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
    L.borders = lay.borders !== false; L.provinces = !!lay.provinces; L.admin1Max = lay.admin1Max || 0; L.neutral = !!lay.neutral;
    { const pw = lay.peoples || "off"; if (L.peoples !== pw) { L.peoples = pw; h.E.refreshPresence(); } }   // Find-it's area round draws the year's peoples too
    if (!h.canvas2d && h.E.setFlat) h.E.setFlat(!!lay.flat);   // Find-it's area round: every state of the year in the land colour, borders as a modern country's
    L.rivers = !!lay.rivers; L.lakes = !!lay.lakes; L.graticule = false;   // (Phase 4b: these four sat at the end of the comment line above in Phase 4, so no window ever drew a river or a lake)
    /* RELIEF IN A WINDOW (2026-10-18; the owner: "if relief is turned on in the personal Atlas, it should also be on in the Atlas windows, at the opacity the user set"). A spec
       says `relief: true, strength` when the window wants it (atlas-windows.js reads the Atlas's own saved layers through `reliefSetting()` below); the controller then fetches
       relief.json, the L0 sheet and the L1 patches of the window's view exactly as the page does (atlas.js startRelief / plan), lazily, on the first draw that asks. Never on
       the still renderer (it has no relief), never for Find it (its spec never asks: its pixel tests read exact tints). With no spec asking, nothing is fetched — same bytes. */
    L.relief = !!lay.relief && !h.canvas2d; if (lay.relief && lay.strength > 0) L.strength = Math.max(0.2, Math.min(1, Number(lay.strength) || 0.7));
    v.graticule = false; v.rivers = L.rivers; v.lakes = L.lakes;
    v.riverLevelBias = lay.riverFine ? 1 : 0;   // Phase 4c: the Atlas's own density by default; one resident level finer only for a card whose subject is water (atlas-windows.js)
    v.lon = spec.lon; v.lat = spec.lat; v.zoom = spec.zoom;
    yearAndWar(h, spec);
    h.E.plan();
    // the water is asked for by the first plan that sees rivers or lakes on; a second plan lets this one's view use what that request set up
    if ((L.rivers || L.lakes) && (v.rivers !== L.rivers || v.lakes !== L.lakes)) h.E.plan();
  }
  /* the year and the war of a spec. A window without a year is today's map (the present, with its borders); a window with one needs the history file, asked for here the first time. The war is drawn in
     its own years only: `focusWar` jumps the Atlas to the war's first year, so the spec's year is set again after it, and a year outside the war's years tints nothing (the roles are computed for that year). */
  function yearAndWar(h, spec) {
    const E = h.E, ctl = h.ctl, want = spec.year == null ? null : spec.year, war = spec.war || null;
    if (h.canvas2d) return;   // the still renderer draws no history: every window is today's map
    if (want == null) { if (h.year != null || h.war) { if (h.war) { E.focusWarNow(null); h.war = null; h.frontDate = null; } E.setYearNow(E.TODAY); h.year = null; } return; }
    if (!war && (E.historyKind() === "wars" || E.historyKind() === "ww2")) return;   // a slice holds the states of the wars' years only: a window of any other year draws today's map until it is given the whole history
    E.startHistory(war ? (spec.history === "ww2" ? "ww2" : "wars") : "full");
    if (!E.historyOK()) return;   // not yet: the window draws today's map and is told (onChange) when the history lands
    if (war !== h.war) { E.focusWarNow(war); h.war = war; h.year = null; if (!war) h.frontDate = null; }
    if (h.year !== want) { E.setYearNow(want); h.year = want; }
    /* a war window's timeline (2026-10-19): `spec.front` draws the front line standing on `spec.frontDate` (YYYYMMDD) in the war's year; moving the pin changes the year and the date of the SAME window, no reload */
    if (war) { const fd = spec.front && spec.frontDate != null ? spec.frontDate : null; if (h.frontDate !== fd) { E.setWindowFront(fd != null, fd); h.frontDate = fd; } }
    void ctl;
  }
  /* the unit vector under a screen point of an orthographic view { rot, radius, cx, cy } (the inverse of `project`; the rotation's rows are the view's axes in world coordinates) */
  function unitAt(q, x, y) {
    const a = (x - q.cx) / q.radius, b = -(y - q.cy) / q.radius, d2 = 1 - a * a - b * b; if (d2 < 0) return null;
    const d = Math.sqrt(d2), r = q.rot;
    return [r[0] * a + r[3] * b + r[6] * d, r[1] * a + r[4] * b + r[7] * d, r[2] * a + r[5] * b + r[8] * d];
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
    const low = !!o.lowRes; if (low) E.setRes(0.5);   // Phase 4b: a window's FIRST frame is drawn at half resolution (a quarter of the pixels: ~190 ms → ~70 ms of software GL) and the full one follows within 140 ms
    counters.draws++;
    // the fills of the highlights: one Map of face index → colour, blended over the palette's land at the highlight's alpha
    const land = h.landRGB(), fills = new Map(), groups = [], histYear = spec.year != null && !h.canvas2d;
    if (histYear) {   // a past year: the highlighted entities are states of that year, tinted in the history's own style (`exact`: the highlight's own alpha over the land, as a modern country's); the outline comes from a mask pass of those states
      const tm = new Map();
      for (const hl of spec.highlights || []) {
        const c = rgb01(hl.rgb || [255, 200, 40]), col = hl.exact ? [c[0], c[1], c[2], hl.a == null ? 0.24 : hl.a] : c;
        for (const id of hl.ids || []) tm.set(id, col);
        if (hl.line || hl.glow) groups.push({ hl, faces: [], ids: hl.ids || [], hist: true });
      }
      E.setTints(tm);
    } else if (!h.canvas2d) E.setTints(null);
    for (const hl of histYear ? [] : spec.highlights || []) {
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
    if (low) E.setRes(1);
    // the outline and the glow of each group, from a mask pass (only on request: a gesture frame skips the pass — and keeps the outline: the rim the last full frame left, laid on the new view)
    const rot = Array.from(E.rotation());
    if (!o.fast) { for (const g of groups) if ((g.hl.line || g.hl.glow) && (!h.canvas2d || g.hl.exact)) outline(h, g, ctx, spec, dpr, o.rims, rot); }   // the still renderer outlines only a highlight that asks (`exact`: Find-it's pick), as the card windows' fallback has none
    else if (o.rims) for (const g of groups) if (g.hl.line) drawRim(h, g, ctx, spec, dpr, o.rims, rot);
    const pr = project(rot, v.radius, v.cx, v.cy);
    h.last = { rot, radius: v.radius, cx: v.cx, cy: v.cy, kmpp: v.kmpp, level: v.level };
    const settled = E.landSettled() && ctl.tilesSettled() && ctl.waterSettled() && (spec.year == null || (E.historyOK() && h.year === spec.year && (!spec.war || (h.frontDate == null ? null : h.frontDate) === (spec.front && spec.frontDate != null ? spec.frontDate : null))));
    const projectV = (X, Y, Z) => [v.cx + v.radius * (rot[0] * X + rot[1] * Y + rot[2] * Z), v.cy - v.radius * (rot[3] * X + rot[4] * Y + rot[5] * Z), rot[6] * X + rot[7] * Y + rot[8] * Z];   // a point on the sphere (a unit vector) → the window's CSS px and its depth
    return { settled, landMask: (water) => landMask(h, spec, water), project: pr, projectV, radius: v.radius, cx: v.cx, cy: v.cy, kmpp: v.kmpp, level: v.level };
  }

  /* the mask pass: the same view with only the group's faces white on black, read back, and turned into a ±width/2 band round the edge plus a soft glow */
  function outline(h, g, ctx, spec, dpr, rims, rot) {
    const ctl = h.ctl, R = ctl.renderer, v = ctl.view, gl = R.gl, E = h.E; if (!gl && !R.static2d) return;
    counters.masks++;
    const keep = { borders: v.borders, admin1: v.admin1, rivers: v.rivers, lakes: v.lakes, graticule: v.graticule }, keepRelief = v.relief ? v.relief.on : false;
    const pal = ctl.palette(), black = [0, 0, 0], white = [1, 1, 1];
    R.setPalette(Object.assign({}, pal, { ocean: black, land: black, coast: black, border: black, admin1: black, river: black, lake: black, lakeShore: black, rim: black, halo: black, grat: black, selected: white }));
    v.borders = false; v.admin1 = false; v.rivers = false; v.lakes = false; v.graticule = false; if (v.relief) v.relief.on = false;   // 2026-10-18: with relief in the window the hillshade lit the black land and the mask read the mountains as the shape — the mask pass draws no relief
    if (g.hist) { const tm = new Map(); for (const id of g.ids) tm.set(id, [1, 1, 1, 1]); E.setMask(tm); R.highlight(null); }   // a past year: the group's states white at full alpha, every other state black (atlas.js setMask)
    else { const m = new Map(); for (const f of g.faces) m.set(f, white); R.highlight(m); }
    R.render(v);
    let w, hh, px;   // the still renderer (no WebGL2) draws on a 2D canvas: read it back top-down; the engine's GL read-back is bottom-up
    if (gl) { w = gl.drawingBufferWidth; hh = gl.drawingBufferHeight; px = new Uint8Array(w * hh * 4); gl.readPixels(0, 0, w, hh, gl.RGBA, gl.UNSIGNED_BYTE, px); }
    else { w = h.glCanvas.width; hh = h.glCanvas.height; px = h.glCanvas.getContext("2d").getImageData(0, 0, w, hh).data; }
    // restore the hub's state for the next window
    R.setPalette(pal); Object.assign(v, keep); if (v.relief) v.relief.on = keepRelief; if (g.hist) E.setMask(null);
    // mask[y][x] = 1 where the pixel is white
    const mask = new Uint8Array(w * hh);
    for (let y = 0; y < hh; y++) { const src = (gl ? hh - 1 - y : y) * w * 4, dst = y * w; for (let x = 0; x < w; x++) mask[dst + x] = px[src + 4 * x] > 127 && px[src + 4 * x + 3] > 127 ? 1 : 0; }
    const lw = Math.max(1, (g.hl.lineWidth || 2.6) * dpr), r = Math.max(1, Math.round(lw / 2));
    const dilate = (src, rad, inv) => {   // separable max filter over `src` (or its complement), radius rad
      const tmp = new Uint8Array(w * hh), out = new Uint8Array(w * hh);
      for (let y = 0; y < hh; y++) { const row = y * w; for (let x = 0; x < w; x++) { let hit = 0; const a = Math.max(0, x - rad), b = Math.min(w - 1, x + rad); for (let k = a; k <= b; k++) { const s = inv ? 1 - src[row + k] : src[row + k]; if (s) { hit = 1; break; } } tmp[row + x] = hit; } }
      for (let x = 0; x < w; x++) { for (let y = 0; y < hh; y++) { let hit = 0; const a = Math.max(0, y - rad), b = Math.min(hh - 1, y + rad); for (let k = a; k <= b; k++) if (tmp[k * w + x]) { hit = 1; break; } out[y * w + x] = hit; } }
      return out;
    };
    if (rims) { rims.set(rimKey(g), rimOf(mask, w, hh, spec, v, rot)); if (rims.size > 8) rims.delete(rims.keys().next().value); }   // the shape's rim as points on the sphere, for the frames of a gesture (drawRim)
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
  /* THE OUTLINE THROUGH A GESTURE (Oct 2026; the owner's phone: the outline vanished for the whole of a drag and a pinch, because a gesture frame drew no mask pass — a second render, a read-back and two
     filters, 60–140 ms on a CPU rasteriser — and so no outline at all). The full frame's mask is also turned into the shape's RIM: the mask pixels with a clear 4-neighbour, taken at a stride that keeps them
     under RIM_MAX, each as a unit vector on the sphere (the inverse of the orthographic view the mask was drawn in). A gesture frame projects those points with ITS view and stamps each as a small square:
     no render, no read-back, the outline exactly on the shape at any pan, pinch or turn (the points were found on the shape; at the next full frame they are found again, at the level the view then has). It has
     no glow — that follows with the full frame, within 140 ms of the last move (view(): `fastTimer`). A window that has not had a full frame yet has no rim and, as before, no outline. */
  const RIM_MAX = 5000;
  const rimKey = (g) => (g.hl.line || "") + "|" + (g.hist ? "h:" + g.ids.join(",") : g.faces.length + ":" + g.faces[0] + ":" + g.faces[g.faces.length - 1]);
  function rimOf(mask, w, hh, spec, v, rot) {
    let n = 0; const edge = (i) => mask[i] && !(mask[i - 1] && mask[i + 1] && mask[i - w] && mask[i + w]);
    for (let y = 1; y < hh - 1; y++) for (let x = 1, i = y * w + 1; x < w - 1; x++, i++) if (edge(i)) n++;
    const stride = Math.max(1, Math.ceil(n / RIM_MAX)), out = new Float32Array(3 * Math.ceil(n / stride)); let k = 0, c = 0;
    const kx = spec.w / w, ky = spec.h / hh, q = { rot, radius: v.radius, cx: v.cx, cy: v.cy };   // mask pixel → CSS px of the window
    for (let y = 1; y < hh - 1; y++) for (let x = 1, i = y * w + 1; x < w - 1; x++, i++) {
      if (!edge(i) || (c++ % stride)) continue;
      const u = unitAt(q, (x + 0.5) * kx, (y + 0.5) * ky); if (!u) continue;
      out[3 * k] = u[0]; out[3 * k + 1] = u[1]; out[3 * k + 2] = u[2]; k++;
    }
    return { pts: out, n: k };
  }
  function drawRim(h, g, ctx, spec, dpr, rims, rot) {
    const rim = rims.get(rimKey(g)); if (!rim || !rim.n) return;
    const v = h.ctl.view, sx = ctx.canvas.width / spec.w, sy = ctx.canvas.height / spec.h, px = Math.max(1.5, (g.hl.lineWidth || 2.6) * dpr / (window.devicePixelRatio || 1)), qx = px * sx, qy = px * sy, P = rim.pts;
    const col = cssRGBA(g.hl.line);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + col[3] + ")"; ctx.beginPath();
    for (let i = 0; i < rim.n; i++) {
      const X = P[3 * i], Y = P[3 * i + 1], Z = P[3 * i + 2];
      if (rot[6] * X + rot[7] * Y + rot[8] * Z < 0) continue;   // the far side
      const x = (v.cx + v.radius * (rot[0] * X + rot[1] * Y + rot[2] * Z)) * sx, y = (v.cy - v.radius * (rot[3] * X + rot[4] * Y + rot[5] * Z)) * sy;
      ctx.rect(x - qx / 2, y - qy / 2, qx, qy);
    }
    ctx.fill(); ctx.restore();
  }
  /* the land (or the water) of the current view as an alpha mask the size of the window's canvas, for painting an authored area only where it is land (or sea): the same view
     rendered black and white, read back. `spec` is the spec of the frame just drawn. */
  function landMask(h, spec, water) {
    const ctl = h.ctl, R = ctl.renderer, v = ctl.view, gl = R.gl; if (!gl) return null;
    setup(h, spec);
    const keep = { borders: v.borders, admin1: v.admin1, rivers: v.rivers, lakes: v.lakes, graticule: v.graticule }, keepRelief = v.relief ? v.relief.on : false;
    const pal = ctl.palette(), black = [0, 0, 0], white = [1, 1, 1];
    R.setPalette(Object.assign({}, pal, { ocean: black, land: white, coast: white, border: white, admin1: white, river: black, lake: black, lakeShore: black, rim: black, halo: black, grat: black, selected: white }));
    v.borders = false; v.admin1 = false; v.rivers = false; v.lakes = false; v.graticule = false; if (v.relief) v.relief.on = false;   // no relief in a mask pass (2026-10-18; a shadowed slope would punch a hole in the land)
    R.highlight(null); R.render(v);
    const w = gl.drawingBufferWidth, hh = gl.drawingBufferHeight, px = new Uint8Array(w * hh * 4);
    gl.readPixels(0, 0, w, hh, gl.RGBA, gl.UNSIGNED_BYTE, px);
    R.setPalette(pal); Object.assign(v, keep); if (v.relief) v.relief.on = keepRelief;
    const cv = document.createElement("canvas"); cv.width = w; cv.height = hh;
    const c = cv.getContext("2d"), img = c.createImageData(w, hh);
    for (let y = 0; y < hh; y++) { const src = (hh - 1 - y) * w * 4, dst = y * w * 4; for (let x = 0; x < w; x++) { const land = px[src + 4 * x] > 127 && px[src + 4 * x + 3] > 127; const on = water ? !land : land; img.data[dst + 4 * x + 3] = on ? 255 : 0; } }
    c.putImageData(img, 0, 0);
    return cv;
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

  /* THE ATLAS'S RELIEF SETTING, SHARED (2026-10-18). The Atlas page keeps its layers in localStorage (`AtlasV2.layersStored()` reads the same key it saves) and announces a change
     with an `atlas2:layers` event on `window` (atlas.js setLayers); another tab's change arrives as a `storage` event. A window reads the setting when it opens (its spec is built per
     draw) and every live window is redrawn when it changes, so a window follows the switch and the strength while it is open. The caller decides whether relief is ALLOWED at all
     (atlas-windows.js: not under light mode, not on a cellular connection — the idle warm-up's own rules). */
  let reliefCache = null;
  function reliefSetting() {
    if (reliefCache) return reliefCache;
    let l = null; try { l = root.AtlasV2 && root.AtlasV2.layersStored ? root.AtlasV2.layersStored() : null; } catch (e) { l = null; }
    reliefCache = { on: !!(l && l.relief), strength: l && isFinite(Number(l.strength)) ? Math.max(0.2, Math.min(1, Number(l.strength))) : 0.7 };
    return reliefCache;
  }
  function reliefChanged() { const was = reliefCache; reliefCache = null; const now = reliefSetting(); if (was && was.on === now.on && was.strength === now.strength) return; for (const w of windows) { try { if (w.schedule) w.schedule(); } catch (e) { /* one window's redraw must not stop the others */ } } }
  if (typeof window !== "undefined") { window.addEventListener("atlas2:layers", reliefChanged); window.addEventListener("storage", (e) => { if (!e || !e.key || /atlas2_layers/.test(e.key)) reliefChanged(); }); }

  /* ---- the interaction every window shares ----
     opts: { spec(state) → the spec for the current state, draw(state, api) → called after the base is drawn so the window can add its marks, onView(state),
             zmin, zmax, fit() → { lon, lat, zoom } for "home", host (the element whose keys/clicks are wired), minDrag }                                   */
  function view(cv, opts) {
    const st = { lon: 0, lat: 0, zoom: 1, home: { lon: 0, lat: 0, zoom: 1 } };
    const ctx = cv.getContext("2d");
    let raf = 0, stopped = false, dirty = true, fastUntil = performance.now() + 80, settled = false, off = null;   // Phase 4b: the FIRST frame is a fast one (no outline or glow pass: ~80 ms on software GL) and the full frame follows within 140 ms — the block is on screen sooner
    const ptrs = new Map(); let last = null, pinch = 0;
    const clamp = (z) => Math.max(opts.zmin || 0.85, Math.min(canvas2d ? Math.min(opts.zmax || 400, ZMAX_2D) : (opts.zmax || 400), z));   // the still renderer stays at LOD 0 (about 5 km/px)
    const w = { st, cv, windowId: windows.size + 1, rims: new Map() };
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
        if (hb.canvas2d && fast && w.painted) { if (!w.fastTimer) w.fastTimer = setTimeout(() => { w.fastTimer = 0; dirty = true; schedule(); }, 140); return; }   // the still renderer redraws when the gesture pauses (a frame is tens to hundreds of ms in software)
        const res = hb.draw(spec, ctx, { dpr, fast, lowRes: fast && !w.painted, rims: w.rims }); w.painted = true;
        settled = res.settled && !fast && (!opts.extraSettled || !!opts.extraSettled(st, { cw, ch, level: res.level }));   // the window's own conditions (a war window's names wait for the worker's anchors)
        w.api = { project: res.project, projectV: res.projectV, level: res.level, landMask: res.landMask, cw, ch, dpr, radius: res.radius, cx: res.cx, cy: res.cy, kmpp: res.kmpp, settled, fast, spec };
        if (opts.draw) opts.draw(st, w.api, ctx);
        if (!w.firstMarked) { w.firstMarked = true; try { performance.mark("a2:first-draw"); } catch (e) {} }
        if (fast) { if (!w.fastTimer) w.fastTimer = setTimeout(() => { w.fastTimer = 0; dirty = true; schedule(); }, 140); }
        if (opts.onPaint) opts.onPaint(st, w.api);
        dirty = false;
        if (!settled && !fast) w.retry = setTimeout(() => { w.retry = 0; if (!stopped && !settled) schedule(); }, 2500);   // Phase 4b: a safety net, not the mechanism — the hub's onChange redraws on every arrival (a level, a tile, the water, the history); at 400 ms a CPU-throttled phone redrew back to back for the whole of the settle (a 600 ms full draw every 600 ms) and starved the worker's own messages
      });
    }
    function schedule() { if (stopped || raf) return; dirty = true; raf = requestAnimationFrame(paint); }
    w.schedule = schedule; w.paint = paint;
    w.flash = () => { if (!canvas2d) fastUntil = performance.now() + 60; schedule(); };   // a change the reader must see AT ONCE (Find-it's pick): one fast frame (the fills, no mask pass), the full frame with the outline and glow follows within 140 ms
    w.setView = (lon, lat, zoom, o) => { if (o && o.fast) fastUntil = performance.now() + 140; st.lon = ((lon + 180) % 360 + 360) % 360 - 180; st.lat = Math.max(-85, Math.min(85, lat)); st.zoom = clamp(zoom); if (!o || !o.silent) { if (opts.onView) opts.onView(st); schedule(); } };
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

  root.AtlasEmbed = { ensure, warm, hold, view, release, reliefSetting, isCanvas2D: () => canvas2d, stats: () => ({ live: hub && !hub.disposed ? 1 : 0, created: counters.created, disposed: counters.disposed, windows: windows.size, draws: counters.draws, masks: counters.masks, ready: !!(hub && hub.ready()) }), hub: () => hub, setIdleMs: (ms) => { idleMs = ms; } };
})(typeof window !== "undefined" ? window : globalThis);
