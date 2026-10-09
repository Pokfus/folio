/* atlas-canvas.js — Atlas v2's STILL renderer for a browser without WebGL2 (Phase 1d; docs/atlas-v2-design.md §2.9, Q-R3 a).

   The same interface as atlas-gl.js's `create(canvas, opts)` — atlas.js calls setLevel, setWaterLevel, render, pick,
   select, resize, setPalette and the loaded() questions without knowing which renderer answers — drawn with Canvas 2D:

     · one level only, LOD 0 (atlas.js caps the zoom at 5 km/px and never asks for a tile);
     · the ocean as a disc, the land as ONE path of every front-facing triangle filled once (nonzero winding, so the
       shared edges leave no seam), the selected face as a second path, the lakes likewise, then the lines by kind
       (coast, border — dashed where DISPUTED —, admin-1 where the zoom shows it, lake shores, rivers), the graticule
       and the rim;
     · a frame costs tens to a couple of hundred milliseconds in software, so atlas.js redraws on RELEASE: while a
       finger or the mouse is down it asks `shift(dx, dy)` to blit the last frame moved by the pointer's travel (the
       labels, cheap, are redrawn in their true places), and one true frame follows when the pointer lifts;
     · picking is on the CPU: the face whose projected triangle holds the point (land), or the lake's (water); arcs
       are never picked here, so a tap on a river answers with the country;
     · tiles and relief are declined (`tileLoaded` says yes so nothing waits; `reliefLoaded` says no).

   Why it exists: a reader without WebGL2 (a locked-down browser, a GPU process that crashed, a very old device) should
   still see the earth and the names rather than a sentence — and the sentence atlas.js shows beside it says what is
   missing (relief, the coast at street zoom, the finer names) and why. */
(function (root) {
  "use strict";
  const KIND_COAST = 0, KIND_BORDER = 1, KIND_RIVER = 2, KIND_LAKE = 3, KIND_ADMIN1 = 5;
  const FLAG_DISPUTED = 1;
  const LAKE_FACE_BASE = 524288;
  function hex2rgb(h) { if (root.AtlasGL && root.AtlasGL.hex2rgb) return root.AtlasGL.hex2rgb(h); const m = /^#?([0-9a-f]{6})$/i.exec(String(h).trim()); if (!m) return [0.5, 0.5, 0.5]; const n = parseInt(m[1], 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; }
  const css = (c, a) => `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a == null ? 1 : a})`;

  function create(canvas, opts) {
    opts = opts || {};
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const levels = {}, water = {};
    let palette = { ocean: [0.70, 0.92, 1.0], land: [0.9, 0.9, 0.92], coast: [0.55, 0.55, 0.6], border: [0.45, 0.45, 0.5], admin1: [0.6, 0.6, 0.66], river: [0.3, 0.55, 0.8], lake: [0.70, 0.92, 1.0], lakeShore: [0.55, 0.55, 0.6], rim: [0.5, 0.5, 0.55], halo: [0.6, 0.65, 0.9], grat: [0.2, 0.2, 0.3], selected: [0.95, 0.75, 0.3] };
    let dpr = 1, W = 0, H = 0, selected = -1, faceCount = 0, snapshot = null;
    const stats = { frames: 0, lastMs: 0, draws: 0, trianglesDrawn: 0, segmentsDrawn: 0, riverSegments: 0, lakeSegments: 0, lakeTriangles: 0, lakeCulled: 0, lakeSegCulled: 0, reliefPatches: 0, visibleAngle: 0, tilesDrawn: 0, parentsDrawn: 0, waterTilesDrawn: 0, level: 0, coreLevel: -1, waterLevel: -1, restores: 0, reliefL0: -1, static2d: true };
    const debug = { sphere: true, faces: true, arcs: true, water: true, relief: false, cull: true };

    // the finest level loaded that the view may use (atlas.js asks for 0; a later caller could load more)
    const levelFor = (view) => { let L = -1; for (const k of Object.keys(levels)) { const n = Number(k); if (n <= view.level && n > L) L = n; } return L; };
    function fillTriangles(P, I, rot, cx, cy, r, only) {
      const m0 = rot[0], m1 = rot[1], m2 = rot[2], m3 = rot[3], m4 = rot[4], m5 = rot[5], m6 = rot[6], m7 = rot[7], m8 = rot[8];
      let n = 0;
      ctx.beginPath();
      for (let t = 0; t < I.length; t += 3) {
        const a = I[t] * 4, b = I[t + 1] * 4, c = I[t + 2] * 4;
        if (only != null && P[a + 3] !== only) continue;
        const za = m6 * P[a] + m7 * P[a + 1] + m8 * P[a + 2]; if (za < 0) continue;
        const zb = m6 * P[b] + m7 * P[b + 1] + m8 * P[b + 2]; if (zb < 0) continue;
        const zc = m6 * P[c] + m7 * P[c + 1] + m8 * P[c + 2]; if (zc < 0) continue;
        ctx.moveTo(cx + (m0 * P[a] + m1 * P[a + 1] + m2 * P[a + 2]) * r, cy - (m3 * P[a] + m4 * P[a + 1] + m5 * P[a + 2]) * r);
        ctx.lineTo(cx + (m0 * P[b] + m1 * P[b + 1] + m2 * P[b + 2]) * r, cy - (m3 * P[b] + m4 * P[b + 1] + m5 * P[b + 2]) * r);
        ctx.lineTo(cx + (m0 * P[c] + m1 * P[c + 1] + m2 * P[c + 2]) * r, cy - (m3 * P[c] + m4 * P[c + 1] + m5 * P[c + 2]) * r);
        ctx.closePath();
        n++;
      }
      if (n) { ctx.fill("nonzero"); stats.draws++; }
      return n;
    }
    // one stroke per (kind, dashed) style: a segment is drawn when both ends face the viewer
    // the segments arrive BUCKETED, 8 floats each (a.xyz, tag, b.xyz, 0 — the texel layout atlas-gl.js samples); a segment is
    // drawn when both ends face the viewer
    function strokeSegments(S, rot, cx, cy, r, want) {
      const m0 = rot[0], m1 = rot[1], m2 = rot[2], m3 = rot[3], m4 = rot[4], m5 = rot[5], m6 = rot[6], m7 = rot[7], m8 = rot[8];
      let n = 0;
      ctx.beginPath();
      for (let i = 0; i < S.length; i += 8) {
        const tag = S[i + 3], kind = tag % 8, flags = Math.floor(tag / 8) % 8;
        if (!want(kind, flags)) continue;
        const za = m6 * S[i] + m7 * S[i + 1] + m8 * S[i + 2]; if (za < 0.002) continue;
        const zb = m6 * S[i + 4] + m7 * S[i + 5] + m8 * S[i + 6]; if (zb < 0.002) continue;
        ctx.moveTo(cx + (m0 * S[i] + m1 * S[i + 1] + m2 * S[i + 2]) * r, cy - (m3 * S[i] + m4 * S[i + 1] + m5 * S[i + 2]) * r);
        ctx.lineTo(cx + (m0 * S[i + 4] + m1 * S[i + 5] + m2 * S[i + 6]) * r, cy - (m3 * S[i + 4] + m4 * S[i + 5] + m5 * S[i + 6]) * r);
        n++;
      }
      if (n) { ctx.stroke(); stats.draws++; }
      return n;
    }
    function graticule(rot, cx, cy, r) {
      const D2R = Math.PI / 180;
      ctx.beginPath();
      const put = (lon, lat, first) => { const la = lat * D2R, lo = lon * D2R, c = Math.cos(la), x = c * Math.cos(lo), y = c * Math.sin(lo), z = Math.sin(la); const d = rot[6] * x + rot[7] * y + rot[8] * z; if (d < 0.005) return false; const sx = cx + (rot[0] * x + rot[1] * y + rot[2] * z) * r, sy = cy - (rot[3] * x + rot[4] * y + rot[5] * z) * r; if (first) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy); return true; };
      for (let lon = -180; lon < 180; lon += 15) { let first = true; for (let lat = -90; lat <= 90; lat += 2) first = !put(lon, lat, first); }
      for (let lat = -75; lat <= 75; lat += 15) { let first = true; for (let lon = -180; lon <= 180; lon += 2) first = !put(lon, lat, first); }
      ctx.stroke(); stats.draws++;
    }
    function render(view) {
      const t0 = performance.now();
      stats.draws = 0; stats.trianglesDrawn = 0; stats.segmentsDrawn = 0; stats.riverSegments = 0; stats.lakeSegments = 0; stats.lakeTriangles = 0; stats.level = view.level;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rot = view.rot, cx = view.cx, cy = view.cy, r = view.radius;
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      // the ocean
      ctx.fillStyle = css(palette.ocean); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); stats.draws++;
      const L = levelFor(view);
      stats.coreLevel = L;
      if (L >= 0) {
        const D = levels[L].data;
        ctx.fillStyle = css(palette.land);
        stats.trianglesDrawn += fillTriangles(D.facePos, D.faceIdx, rot, cx, cy, r, null);
        if (selected >= 0) { ctx.fillStyle = css(palette.selected); fillTriangles(D.facePos, D.faceIdx, rot, cx, cy, r, selected); }
      }
      const Wl = water[0] && (view.lakes || view.rivers) ? water[0].data : null;
      stats.waterLevel = Wl ? 0 : -1;
      if (Wl && view.lakes && Wl.faceIdx) { ctx.fillStyle = css(palette.lake); stats.lakeTriangles += fillTriangles(Wl.facePos, Wl.faceIdx, rot, cx, cy, r, null); }
      if (L >= 0) {
        const D = levels[L].data;
        ctx.lineWidth = 0.9; ctx.strokeStyle = css(palette.coast); ctx.setLineDash([]);
        stats.segmentsDrawn += strokeSegments(D.segs, rot, cx, cy, r, (k) => k === KIND_COAST);
        if (view.borders) {
          ctx.lineWidth = 0.8; ctx.strokeStyle = css(palette.border);
          stats.segmentsDrawn += strokeSegments(D.segs, rot, cx, cy, r, (k, f) => (k === KIND_BORDER || k === 4) && !(f & FLAG_DISPUTED));
          ctx.setLineDash([3, 3]);
          stats.segmentsDrawn += strokeSegments(D.segs, rot, cx, cy, r, (k, f) => (k === KIND_BORDER || k === 4) && !!(f & FLAG_DISPUTED));
          ctx.setLineDash([]);
          if (view.admin1) { ctx.lineWidth = 0.6; ctx.strokeStyle = css(palette.admin1); stats.segmentsDrawn += strokeSegments(D.segs, rot, cx, cy, r, (k) => k === KIND_ADMIN1); }
        }
      }
      if (Wl) {
        if (view.lakes && Wl.lakeSegs) { ctx.lineWidth = 0.6; ctx.strokeStyle = css(palette.lakeShore); stats.lakeSegments += strokeSegments(Wl.lakeSegs, rot, cx, cy, r, () => true); }
        if (view.rivers && Wl.riverSegs) { ctx.lineWidth = 0.8; ctx.strokeStyle = css(palette.river); stats.riverSegments += strokeSegments(Wl.riverSegs, rot, cx, cy, r, () => true); }
      }
      if (view.graticule) { ctx.lineWidth = 0.5; ctx.strokeStyle = css(palette.grat, 0.45); ctx.setLineDash([2, 4]); graticule(rot, cx, cy, r); ctx.setLineDash([]); }
      ctx.lineWidth = 1.2; ctx.strokeStyle = css(palette.rim); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); stats.draws++;
      // the snapshot a drag blits
      try { if (!snapshot || snapshot.width !== W || snapshot.height !== H) { snapshot = document.createElement("canvas"); snapshot.width = W; snapshot.height = H; } snapshot.getContext("2d").clearRect(0, 0, W, H); snapshot.getContext("2d").drawImage(canvas, 0, 0); } catch (e) { snapshot = null; }
      stats.frames++; stats.lastMs = performance.now() - t0;
    }
    // CPU picking: the face (or lake face) whose projected triangle holds (x, y) in CSS px
    function pickIn(P, I, rot, cx, cy, r, x, y) {
      const m0 = rot[0], m1 = rot[1], m2 = rot[2], m3 = rot[3], m4 = rot[4], m5 = rot[5], m6 = rot[6], m7 = rot[7], m8 = rot[8];
      for (let t = 0; t < I.length; t += 3) {
        const a = I[t] * 4, b = I[t + 1] * 4, c = I[t + 2] * 4;
        if (m6 * P[a] + m7 * P[a + 1] + m8 * P[a + 2] < 0 || m6 * P[b] + m7 * P[b + 1] + m8 * P[b + 2] < 0 || m6 * P[c] + m7 * P[c + 1] + m8 * P[c + 2] < 0) continue;
        const ax = cx + (m0 * P[a] + m1 * P[a + 1] + m2 * P[a + 2]) * r, ay = cy - (m3 * P[a] + m4 * P[a + 1] + m5 * P[a + 2]) * r;
        const bx = cx + (m0 * P[b] + m1 * P[b + 1] + m2 * P[b + 2]) * r, by = cy - (m3 * P[b] + m4 * P[b + 1] + m5 * P[b + 2]) * r;
        const cxx = cx + (m0 * P[c] + m1 * P[c + 1] + m2 * P[c + 2]) * r, cyy = cy - (m3 * P[c] + m4 * P[c + 1] + m5 * P[c + 2]) * r;
        const d1 = (x - bx) * (ay - by) - (ax - bx) * (y - by), d2 = (x - cxx) * (by - cyy) - (bx - cxx) * (y - cyy), d3 = (x - ax) * (cyy - ay) - (cxx - ax) * (y - ay);
        const neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
        if (!(neg && pos)) return P[a + 3];
      }
      return -1;
    }
    return {
      gl: null, debug, static2d: true,
      get lost() { return false; },
      levelLoaded(l) { return !!levels[l]; },
      levelData(l) { return levels[l] ? levels[l].data : null; },
      setLevel(level, data) { levels[level] = { data }; },
      setTile() {}, dropTile() {}, tileLoaded() { return true; }, tileCount() { return 0; },
      setWaterLevel(level, data) { water[level] = { data }; },
      waterLevelLoaded(l) { return !!water[l]; },
      setWaterTile() {}, dropWaterTile() {}, waterTileLoaded() { return true; },
      setRelief() {}, dropRelief() {}, reliefLoaded() { return false; }, reliefCount() { return 0; },
      setRamp() {}, setFaceCount(n) { faceCount = n; },
      setPalette(p) { for (const k of Object.keys(p)) palette[k] = typeof p[k] === "string" ? hex2rgb(p[k]) : p[k]; },
      select(face) { selected = face == null ? -1 : face; },
      resize(cssW, cssH, ratio) { dpr = Math.min(2, ratio || 1); W = Math.max(1, Math.round(cssW * dpr)); H = Math.max(1, Math.round(cssH * dpr)); if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; snapshot = null; } },
      render,
      // the last frame moved by (dx, dy) CSS px: what a drag shows until the pointer lifts
      shift(dx, dy) { if (!snapshot) return false; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H); ctx.drawImage(snapshot, Math.round(dx * dpr), Math.round(dy * dpr)); return true; },
      pick(view, x, y, mode) {
        const rot = view.rot, cx = view.cx, cy = view.cy, r = view.radius;
        if (mode === "water") { const Wl = water[0] ? water[0].data : null; if (!Wl || !Wl.faceIdx) return null; const f = pickIn(Wl.facePos, Wl.faceIdx, rot, cx, cy, r, x, y); return f >= 0 ? { lakeFace: f - LAKE_FACE_BASE } : null; }
        const L = levelFor(view); if (L < 0) return null;
        const D = levels[L].data; const f = pickIn(D.facePos, D.faceIdx, rot, cx, cy, r, x, y);
        return f >= 0 ? { face: f } : null;
      },
      stats() { return { triangles: stats.trianglesDrawn, segments: stats.segmentsDrawn, riverSegments: stats.riverSegments, lakeSegments: stats.lakeSegments, lakeTriangles: stats.lakeTriangles, lakeCulled: 0, lakeSegCulled: 0, reliefPatches: 0, draws: stats.draws, level: stats.level, coreLevel: stats.coreLevel, waterLevel: stats.waterLevel, tilesDrawn: 0, parentsDrawn: 0, waterTilesDrawn: 0, complete: true, tilesResident: 0, waterTilesResident: 0, reliefResident: 0, reliefL0: -1, lastMs: stats.lastMs, frames: stats.frames, visibleAngle: 0, restores: 0, static2d: true }; },
      rawStats: stats,
      dispose() { snapshot = null; },
    };
  }
  root.AtlasCanvas = { create, hex2rgb };
})(typeof window !== "undefined" ? window : globalThis);
