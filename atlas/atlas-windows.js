/* atlas-windows.js — the card windows and Find-it on the Atlas v2 engine (Atlas v2 Phase 4; docs/atlas-v2-card-windows.md). A LAZY file, loaded with atlas-embed.js (the `atlas2embed` bundle) the first time a window or the
   Find-it board is wanted behind the preview switch, so none of it is on the eager path. It reaches app.js's own helpers only through `X`, the context object app.js hands over (`atlas2Ctx`): the card data, the
   locator and war attributes' readers, the sibling dots, the colours, the round pools of Find it — nothing here is a second copy of a rule, except `finditPools` / `buildGameRounds`, which are copied (they live inside
   v1's page closure) and compared with v1's by test-atlas-embed.js. */
  /* ---------- (1) CARD WINDOWS ON THE ATLAS v2 ENGINE (Oct 2026, Atlas v2 Phase 4; docs/atlas-v2-card-windows.md) ----------
     The same windows — a map card, a locator, a war — drawn by `atlas/atlas-embed.js` (ONE headless engine and one WebGL context for every window on the page) instead of by
     `startCardGlobeV1`'s own 2D canvas. STAGE A: behind the per-viewer preview switch (`atlas2Preview()`, localStorage `folio.atlas2.preview`), OFF by default, so v1's window stays what a
     reader gets until the owner has looked at this one on a phone. The host contract is the V1 window's, attribute for attribute and method for method (`_folioMap`), so the nine surfaces that
     mount a window and the suites that read one do not know which engine drew it; `data-map-engine` on the host says ("v2", or "v1" when the engine could not start and V1 took over).
     WHAT THE ENGINE DRAWS: the coast, the borders, the admin-1 lines of the three layers, the rivers and lakes (a locator, and the two layers with a hi-res row in v1), and the shaded place — its
     FACE, from the entity table of topology.bin (`atlas/data/card-faces.js` is the join from a layer's key to an entity id), with the Atlas's selection gold as a translucent tint and a gold
     outline and glow from the engine's own mask pass. WHAT THE WINDOW DRAWS ON TOP, as it always did: the gold mark (square, circle, swords), the card's authored area and range spine, the
     siblings and the collection's home square with their names, and the place's name after the reveal. Nothing about the card's content moved. */
(function (W) {
  "use strict";
  const mark = (n) => { try { performance.mark(n); } catch (e) {} };   // Phase 4b: named marks (a2:*) so a trace shows where a first window's time went
  function startCardWindow(host, X) {
    mark("a2:window-start");
    if (W.AtlasWindows) W.AtlasWindows.lastCtx = X;
    let unhold = () => {};   // the hub is held while this window is pending (see AtlasEmbed.hold); let go at the first of: the window is mounted, it fell back to V1, it failed, it was stopped
    if (W.AtlasEmbed && W.AtlasEmbed.hold) { const let0 = W.AtlasEmbed.hold(); unhold = () => { unhold = () => {}; let0(); }; }   // the context app.js handed over, kept so a suite can mount synthetic windows (the fit sweep of test-atlas-windows.js) through the same code
    const { CARD_BY_ID, CARD_MAP_LAYERS, CMAP_ANCHOR, CMAP_DEG, CMAP_HIRES, CMAP_LAYER_HIRES, CMAP_SEG, CMAP_SUBDIV, CMAP_ZLOC, CMAP_ZMAX, CMAP_ZMIN, DATA_BUNDLES, TINT_SEL, cardCollectionRoot, cardLocator, ensureData, gameCapFirst, locatorSiblings, paintSwords, ringsBBox, wrapLon, startCardGlobeV1, openFromWindow } = X, S = X.S;
    const cv = host.querySelector(".mc-canvas");
    const layerName = host.getAttribute("data-map-layer"), key = host.getAttribute("data-map-key");
    const def = CARD_MAP_LAYERS[layerName];
    const v1 = () => { stopped = true; unhold(); host.classList.remove("mc-loading"); host._folioMap = null; host.setAttribute("data-map-engine", "v1"); startCardGlobeV1(host); };
    let stopped = false, revealed = host.hasAttribute("data-map-named"), win = null, isReady = false;
    if (!def) { v1(); return; }
    stopped = false;
    host._folioMap = {
      stop() { stopped = true; unhold(); if (win) win.stop(); host._folioMap = null; },
      reveal() { revealed = true; if (win) win.schedule(); },
      ready() { return isReady; },
      settled() { return !!(win && win.isSettled()); },
      legend() { return lastLegend.slice(); },
      names() { return lastNames.slice(); },   // Phase 4b: the war window's two sides as drawn on it ("Rome — victors"), for the suites and a screen-reader alternative   // Phase 4b: the engine's levels, tiles and water for THIS view are all in (ready() is the window being mounted)
      view() { return win ? { lon: win.st.lon, lat: win.st.lat, zoom: win.st.zoom, home: [win.st.home.lon, win.st.home.lat, win.st.home.zoom] } : { lon: 0, lat: 0, zoom: 1, home: [0, 0, 1] }; },
      pan(dx, dy) { if (win) win.panBy(dx, dy); },
    };
    host.classList.add("mc-loading");
    const sibCard = host.getAttribute("data-map-card") || "";
    const warAttr = host.classList.contains("map-war");
    const locKind = host.getAttribute("data-map-kind") || "point";
    if (S.settings && S.settings.mapAlt && !sibCard) { v1(); return; }   // the opt-in neighbours sentence is computed from the layer's own shapes, which only V1's window loads
    const isWar = warAttr;   // a war window is drawn at a year of the war on the engine's history: its sides tinted in the years they fought, nothing outside them
    const readPts = (a) => (a ? a.trim().split(/\s+/).map((q) => q.split(",").map(Number)).filter((q) => q.length === 2 && isFinite(q[0]) && isFinite(q[1])) : null);
    const readRings = (a) => { if (!a) return null; const out = String(a).split(";").map((r) => readPts(r)).filter((r) => r && r.length >= 3); return out.length ? out : null; };
    const locArea = readRings(host.getAttribute("data-map-area")), locSpine = readPts(host.getAttribute("data-map-spine"));
    const locWithin = String(host.getAttribute("data-map-within") || "").trim().toLowerCase(), locLabelPt = readPts(host.getAttribute("data-map-label"));
    const zoomAttr = Number(host.getAttribute("data-map-zoom")) || 0;
    const root0 = sibCard ? cardCollectionRoot(sibCard) : null;
    const hiRegion = sibCard ? (CMAP_HIRES[(root0 || {}).id] || "") : (CMAP_LAYER_HIRES[layerName] || "");
    /* PHASE 4c, THE OWNER'S DECISION 2 — RIVERS IN WINDOWS. A window draws its rivers at the Atlas's own density for its zoom (about half of V1's length; Phase 4b had asked for one resident level finer everywhere, 107 % of V1's). A
       card whose SUBJECT is water — the registry's kind for the locator's place is a river, lake, sea, strait or bay (`ATLAS_CARD_FACES.water`, build-card-faces.js) — gets the finer level, so the river it is about is drawn in full. Under the reader's data saver or light mode the window asks for no water at all (the
       finer level is in the same 4.3 MB file as the coarse one, so "never fetched" can only mean the file is not fetched): the card's own river from `rivers.js` is still drawn in gold. */
    const lightReader = !!(S.settings && S.settings.saveData) || !!(typeof navigator !== "undefined" && navigator.connection && navigator.connection.saveData === true);
    const isWaterSubject = () => { const w = window.ATLAS_CARD_FACES && window.ATLAS_CARD_FACES.water; return !!sibCard && !!w && w.cards.indexOf(sibCard) >= 0; };   // the registry kind of the locator's place (build-card-faces.js); a name only for a locator with no resolved place, decided there
    const wantWater = (!!sibCard || !!hiRegion) && !lightReader;
    const subdiv = sibCard ? (CMAP_SUBDIV[(root0 || {}).id] || null) : null;
    const sib = sibCard ? locatorSiblings(sibCard) : { dots: [], termName: new Map(), own: new Set() };
    const anchor = (() => {
      const a = sibCard && root0 ? CMAP_ANCHOR[root0.id] : null;
      if (!a || isWar) return null;   // a war window spends red on the defeated side
      const k = a.n.toLowerCase(); if (locWithin === k) return null;
      const me = sibCard ? cardLocator(CARD_BY_ID[sibCard]) : null;
      return me && String(me.name || "").trim().toLowerCase() === k ? null : a;
    })();
    const wantsOwnRiver = !isWar && locKind === "river" && sib.own && sib.own.size > 0;
    const need = [ensureData("atlas2"), ensureData("atlas2embed"), ensureData("atlas2cards")];
    if (isWar) need.push(ensureData("atlas2wars"));
    if (wantsOwnRiver) { need.push(ensureData("rivers1")); if (hiRegion && DATA_BUNDLES["river_" + hiRegion]) need.push(ensureData("river_" + hiRegion)); }
    let FACES = null, targets = [], dot = null, ownLines = null, ownName = "";
    let ownRiverDone = false;
    const hubOptions = { host: {} };
    function model() {
      FACES = window.ATLAS_CARD_FACES; const L = FACES && FACES.layers[layerName]; if (!L) return false;
      if (key) for (const k of key.split("|")) { const t = L[k]; if (!t) return false; targets.push({ n: k, id: t[0], c: [t[1], t[2]], b: [t[3], t[4], t[5], t[6]] }); }
      const atAttr = host.getAttribute("data-map-at");
      if (atAttr) { const at = atAttr.split(",").map(Number); if (at.length !== 2 || !isFinite(at[0]) || !isFinite(at[1])) return false; dot = { n: host.getAttribute("data-map-atname") || "", c: at }; }
      else { const dn = host.getAttribute("data-map-dot"); if (dn) { const D = FACES.dots[layerName] || {}; const p = D[dn]; if (!p) return false; dot = { n: p[3] || dn, c: [p[0], p[1]] }; } }
      if (!targets.length && !dot && !isWar) return false;
      if (wantsOwnRiver) {   // the card's own river, by its name or a glossary alias, out of rivers.js (and the frame's hi-res set where there is one)
        const LOW = window.RIVERS || [], HR = hiRegion && window.HIRES_RIVER ? window.HIRES_RIVER[hiRegion] : null;
        const RIV = HR ? LOW.filter((r) => !HR.sup.has(String(r.n))).concat(HR.rivers) : LOW;
        for (let i = 0; i < RIV.length; i++) { const nm = String(RIV[i].n || "").toLowerCase(); if (sib.own.has(nm)) { ownLines = RIV[i].p; ownName = sib.termName.get(nm) || RIV[i].n; break; } }
      }
      return true;
    }
    // the opening view: the V1 fit, off the card-faces bounding boxes (the rings near the label point) or the card's own extent
    let home = { lon: 0, lat: 0, zoom: 1 };
    const DEG = CMAP_DEG;
    const ringsBox = (rings) => ringsBBox(rings);
    function fit() {
      const at = targets.length ? targets[0].c : dot ? dot.c : [0, 0];
      let lon = at[0], lat = at[1], z = targets.length ? 4 : CMAP_ZLOC;
      const ext = locArea || (locSpine ? [locSpine] : null);
      if (!targets.length && ext && ext.length) {
        const b = ringsBox(ext); lon = wrapLon((b[0] + b[2]) / 2); lat = (b[1] + b[3]) / 2;
        const span = Math.max(b[3] - b[1], (b[2] - b[0]) * Math.cos(lat * DEG), 0.2); z = 0.85 / (0.46 * DEG * span);
      }
      if (targets.length) {
        let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const t of targets) { if (t.b[0] < x0) x0 = t.b[0]; if (t.b[1] < y0) y0 = t.b[1]; if (t.b[2] > x1) x1 = t.b[2]; if (t.b[3] > y1) y1 = t.b[3]; }
        if (targets.length > 1) { lon = (x0 + x1) / 2; lat = (y0 + y1) / 2; }
        const span = Math.max(y1 - y0, (x1 - x0) * Math.cos(lat * DEG), 0.2); z = 0.55 / (0.46 * DEG * span);
      }
      home = { lon, lat, zoom: Math.max(CMAP_ZMIN, Math.min(CMAP_ZMAX, zoomAttr || z)) };
    }
    // colours of the marks' labels, from the theme as V1 read them
    let ink = "#221808", halo = "rgba(255,255,255,0.94)", font = "system-ui, sans-serif", water = "rgba(31,122,170,0.72)";
    function cols() {
      const cs = getComputedStyle(document.body), g = (n) => (cs.getPropertyValue(n) || "").trim();
      const rgb = (h) => { h = String(h).replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); const n = parseInt(h, 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
      const p = rgb(g("--paper") || "#fff"), dark = (p[0] * 0.299 + p[1] * 0.587 + p[2] * 0.114) < 128;
      ink = dark ? "#ffffff" : "#221808"; halo = dark ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.94)"; font = g("--sans") || "system-ui, sans-serif";
      water = dark ? "rgba(120,170,220,0.8)" : "rgba(31,122,170,0.72)";
    }
    const tintFill = "rgba(" + TINT_SEL.rgb + "," + TINT_SEL.fillA + ")";
    const SEG = CMAP_SEG;
    /* a ring or polyline as a path: each segment walked in steps of half a degree (a long straight segment is a lie on a sphere), broken where it passes behind the horizon */
    function addPath(c, api, ring, close) {
      let pen = false, prev = null;
      for (let i = 0; i < ring.length + (close ? 1 : 0); i++) {
        const q = ring[i % ring.length]; if (!q) continue;
        if (prev && Math.abs(q[0] - prev[0]) < 180) {
          const n = Math.min(60, Math.ceil(Math.max(Math.abs(q[0] - prev[0]), Math.abs(q[1] - prev[1])) / SEG));
          for (let s = 1; s < n; s++) { const t = s / n, p = api.project(prev[0] + (q[0] - prev[0]) * t, prev[1] + (q[1] - prev[1]) * t); if (p[2] < 0) { pen = false; continue; } if (pen) c.lineTo(p[0], p[1]); else { c.moveTo(p[0], p[1]); pen = true; } }
        }
        const p = api.project(q[0], q[1]);
        if (p[2] < 0) { pen = false; prev = q; continue; }
        if (pen) c.lineTo(p[0], p[1]); else { c.moveTo(p[0], p[1]); pen = true; }
        prev = q;
      }
    }
    const inView = (api, p) => p[2] >= 0 && p[0] > -20 && p[1] > -20 && p[0] < api.cw + 20 && p[1] < api.ch + 20;
    let areaCv = null;
    /* an authored area is painted only where it is land (or, for a sea, only where it is water): painted on its own canvas, cut by the engine's land mask, then laid on the window */
    function paintMasked(ctx, api, paint, water2) {
      if (!areaCv) areaCv = document.createElement("canvas");
      if (areaCv.width !== cv.width || areaCv.height !== cv.height) { areaCv.width = cv.width; areaCv.height = cv.height; }
      const a = areaCv.getContext("2d"); a.setTransform(1, 0, 0, 1, 0, 0); a.clearRect(0, 0, areaCv.width, areaCv.height);
      a.setTransform(api.dpr, 0, 0, api.dpr, 0, 0); paint(a);
      const mask = api.landMask ? api.landMask(water2) : null;
      if (mask) { a.setTransform(1, 0, 0, 1, 0, 0); a.globalCompositeOperation = "destination-in"; a.drawImage(mask, 0, 0, mask.width, mask.height, 0, 0, areaCv.width, areaCv.height); a.globalCompositeOperation = "source-over"; }
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(areaCv, 0, 0); ctx.restore();
    }
    /* PHASE 4b, WAR WINDOWS: THE TWO PRINCIPAL SIDES ARE NAMED ON THE WINDOW and a one-line legend is drawn from the card's own sides (`ATLAS_WARS` carries the card's name for each: "Rome", "Carthage",
       "Han, Zhao, Wei, Chu, Yan and Qi"). The names stand where each side stands in the war's years (the engine's `warSides`: the mean direction of the side's faces); the legend is a pill at the foot of the window:
       a swatch in the engine's own victor / loser colour, the side's name, and, wherever the table tints more than one state for the side, a count after it — "China · 2 states" (Phase 4c, the owner's decision 1: the card's OWN name verbatim, then the number of states the table draws for it; the legend never says or implies "allies", because nothing in the data says the extra states were allies). A side that is only an authored
       extent (no state of the table in those years) has a hatched swatch and says "approximate extent": the wash the engine draws for it is the card's own claim, never a border. */
    let warSides = null, warCols = null, lastLegend = [], lastNames = [];
    const sideText = (sd) => { const n = String(sd.n || "").trim(); return sd.members > 1 ? n + " · " + sd.members + " states" : n; };   // Phase 4c, owner's decision 1: the card's own name verbatim, then the count the table can vouch for ("China · 2 states"); never "allies"
    function warMarks(ctx, api) {
      if (!warSides || !warCols) return;
      const W = api.cw, H = api.ch, css = (c, a) => "rgba(" + c.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255)).join(",") + "," + a + ")";
      const sides = [["v", warCols.victor, "victors"], ["l", warCols.loser, "defeated"]].filter((q) => warSides[q[0]]);
      // the names, at the sides' centres, kept apart from each other and inside the window
      ctx.save(); ctx.font = "600 12.5px " + font; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const placed2 = [], named = [];
      for (const [k] of sides) {
        const sd = warSides[k], p = api.project(sd.lon, sd.lat); if (p[2] < 0) continue;
        const text = String(sd.n || "").trim(); if (!text) continue;
        const w = ctx.measureText(text).width; let x = Math.max(w / 2 + 6, Math.min(W - w / 2 - 6, p[0])), y = Math.max(14, Math.min(H - 34, p[1]));
        for (let tries = 0; tries < 4 && placed2.some((b) => x - w / 2 < b[2] && x + w / 2 > b[0] && y - 8 < b[3] && y + 8 > b[1]); tries++) y += 17;
        placed2.push([x - w / 2, y - 8, x + w / 2, y + 8]);
        ctx.lineWidth = 3.4; ctx.lineJoin = "round"; ctx.strokeStyle = halo; ctx.strokeText(text, x, y); ctx.fillStyle = ink; ctx.fillText(text, x, y); named.push(text);
      }
      lastNames = named;
      ctx.restore();
      // the legend: one line, at the foot, from the card's own sides
      ctx.save(); ctx.textAlign = "left"; ctx.textBaseline = "middle";
      let px = 11.5; ctx.font = "600 " + px + "px " + font;
      /* four wordings, longest first; the first that fits on one line at 10 px or more is used: the full line, then without "victors / defeated" (the swatch colour and the legend under the window say it), then "approx." for
         "approximate extent", then the names cut short — an extent's own word is the last thing to go */
      const word = (k) => (k === "v" ? "victors" : "defeated");
      const wording = (lvl) => sides.map(([k, c]) => { const sd = warSides[k], nm = sideText(sd); return { c, ext: sd.extent, text: nm + (sd.extent ? (lvl >= 2 ? " (approx.)" : " (approximate extent)") : "") + (lvl >= 1 ? "" : " — " + word(k)) }; });
      const sw = 11, gap = 6, between = 14, pad = 9;
      let parts = wording(0);
      const total = () => parts.reduce((a, q) => a + sw + gap + ctx.measureText(q.text).width, 0) + between * Math.max(0, parts.length - 1) + pad * 2;
      for (let lvl = 0; lvl <= 2; lvl++) { parts = wording(lvl); px = 11.5; ctx.font = "600 " + px + "px " + font; while (total() > W - 18 && px > 10) { px -= 0.5; ctx.font = "600 " + px + "px " + font; } if (total() <= W - 18) break; }
      if (total() > W - 18) for (const q of parts) { const ext = / \(approx\.\)$/.test(q.text) ? " (approx.)" : ""; let base = q.text.replace(/ \(approx\.\)$/, ""); while (base.length > 6 && total() > W - 18) { base = base.slice(0, -2).replace(/\s+$/, ""); q.text = base + "…" + ext; } }
      lastLegend = parts.map((q) => q.text);
      const tw = total(), bx = 9, by = H - 9 - 22;
      ctx.fillStyle = halo; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, tw, 22, 11); else ctx.rect(bx, by, tw, 22); ctx.fill();
      let x = bx + pad;
      for (const q of parts) {
        const y = by + 11;
        if (q.ext) { ctx.save(); ctx.fillStyle = css(q.c, 0.18); ctx.fillRect(x, y - sw / 2, sw, sw); ctx.strokeStyle = css(q.c, 0.95); ctx.lineWidth = 1.2; ctx.setLineDash([2.5, 2]); ctx.strokeRect(x + 0.6, y - sw / 2 + 0.6, sw - 1.2, sw - 1.2); ctx.restore(); }
        else { ctx.fillStyle = css(q.c, 0.85); ctx.fillRect(x, y - sw / 2, sw, sw); ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 0.8; ctx.strokeRect(x + 0.4, y - sw / 2 + 0.4, sw - 0.8, sw - 0.8); }
        ctx.fillStyle = ink; ctx.fillText(q.text, x + sw + gap, y + 0.5);
        x += sw + gap + ctx.measureText(q.text).width + between;
      }
      ctx.restore();
    }
    function marks(st, api, ctx) {
      cols();
      ctx.save(); ctx.setTransform(api.dpr, 0, 0, api.dpr, 0, 0);
      const W = api.cw, H = api.ch, shelf = locKind === "shelf", sea = locKind === "sea";
      // the authored area
      if (locArea) {
        const paintArea = (m) => {
          m.beginPath(); for (const ring of locArea) addPath(m, api, ring, true);
          m.globalAlpha = sea ? 0.38 : 1; m.fillStyle = sea ? water : tintFill; m.fill(); m.globalAlpha = 1;
          m.setLineDash([7, 5]); m.strokeStyle = sea ? water : TINT_SEL.line; m.lineWidth = 2; m.stroke(); m.setLineDash([]);
        };
        if (shelf) paintArea(ctx); else paintMasked(ctx, api, paintArea, sea);
      }
      const placed = [];
      const nm0 = gameCapFirst(dot ? dot.n : targets.length ? targets[0].n : "");
      if (sibCard) {
        const lat = locLabelPt && locLabelPt.length ? locLabelPt[0] : locArea && locArea.length ? (() => { const b = ringsBBox(locArea); return [wrapLon((b[0] + b[2]) / 2), (b[1] + b[3]) / 2]; })() : (dot ? dot.c : null);
        if (lat) { const p = api.project(lat[0], lat[1]); if (p[2] >= 0) { const beside = !!dot && !(locLabelPt || locArea) && locKind !== "range"; ctx.font = "600 13px " + font; const w0 = nm0 ? ctx.measureText(nm0).width : 0; placed.push(beside ? [p[0] - 9, p[1] - 11, p[0] + 12 + w0, p[1] + 11] : [p[0] - w0 / 2 - 4, p[1] - 11, p[0] + w0 / 2 + 4, p[1] + 11]); } }
      }
      const clashes = (bx) => placed.some((q) => bx[0] < q[2] && bx[2] > q[0] && bx[1] < q[3] && bx[3] > q[1]);
      const placeLabel = (x, y, text, half) => {
        const w = ctx.measureText(text).width, right = [x + 6, y - half, x + 10 + w, y + half], left = [x - 10 - w, y - half, x - 6, y + half];
        const fits = (bx) => bx[0] >= 2 && bx[1] >= 2 && bx[2] <= W - 2 && bx[3] <= H - 2 && !clashes(bx);
        if (fits(right)) { placed.push(right); return { x: x + 8, align: "left" }; }
        if (fits(left)) { placed.push(left); return { x: x - 8, align: "right" }; }
        return null;
      };
      let ownRiver = false;
      if (ownLines) {   // the card's own river, in the answer's gold, with its name once revealed
        ownRiver = true;
        ctx.save(); ctx.strokeStyle = TINT_SEL.line; ctx.lineWidth = 2.6; ctx.shadowColor = TINT_SEL.glow; ctx.shadowBlur = 9; ctx.beginPath();
        for (const ln of ownLines) addPath(ctx, api, ln, false);
        ctx.stroke(); ctx.restore();
        const line = revealed ? ownLines[0] : null;
        if (line && line.length) { const mid = line[Math.floor(line.length / 2)], p = api.project(mid[0], mid[1]); if (p[2] >= 0) { const lbl = gameCapFirst(ownName); ctx.font = "600 13px " + font; ctx.textAlign = "center"; ctx.textBaseline = "middle"; const half = ctx.measureText(lbl).width / 2 + 2; placed.push([p[0] - half, p[1] - 8, p[0] + half, p[1] + 8]); ctx.lineWidth = 3; ctx.strokeStyle = halo; ctx.strokeText(lbl, p[0], p[1]); ctx.fillStyle = ink; ctx.fillText(lbl, p[0], p[1]); } }
      }
      if (sibCard && !isWar) {
        const sibAt = [], groups = new Map();
        for (const d of sib.dots) {
          if (!S.cards || !S.cards[d.id]) continue;
          const k = String(d.within || d.n || "").trim().toLowerCase(); if (!k || (locWithin && k === locWithin)) continue; if (anchor && k === anchor.n.toLowerCase()) continue;
          const isCity = !d.within || String(d.n || "").trim().toLowerCase() === k; let g = groups.get(k);
          if (!g) groups.set(k, g = { n: d.within || d.n, c: d.c, kind: d.kind, city: isCity }); else if (isCity && !g.city) { g.c = d.c; g.n = d.n; g.kind = d.kind; g.city = true; }
        }
        groups.forEach((g) => { const p = api.project(g.c[0], g.c[1]); if (inView(api, p)) sibAt.push([p[0], p[1], g.n, g.kind]); });
        let anchorAt = null; if (anchor) { const p = api.project(anchor.c[0], anchor.c[1]); if (inView(api, p)) anchorAt = [p[0], p[1]]; }
        for (const s of sibAt) {
          if (s[3] === "battle") paintSwords(ctx, s[0], s[1], 6.5);
          else { ctx.beginPath(); ctx.arc(s[0], s[1], 3.4, 0, Math.PI * 2); ctx.fillStyle = "rgba(200,69,60,.9)"; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.stroke(); }
        }
        if (anchorAt) {
          const q = 4.4; ctx.fillStyle = "rgba(200,69,60,.92)"; ctx.fillRect(anchorAt[0] - q, anchorAt[1] - q, q * 2, q * 2); ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.strokeRect(anchorAt[0] - q, anchorAt[1] - q, q * 2, q * 2);
          ctx.font = "600 11.5px " + font; ctx.textBaseline = "middle"; const at = placeLabel(anchorAt[0], anchorAt[1], anchor.n, 8);
          if (at) { ctx.textAlign = at.align; ctx.lineWidth = 3; ctx.strokeStyle = halo; ctx.strokeText(anchor.n, at.x, anchorAt[1]); ctx.fillStyle = ink; ctx.fillText(anchor.n, at.x, anchorAt[1]); }
        }
        ctx.font = "500 11px " + font; ctx.textBaseline = "middle";
        for (const s of sibAt) { const nm = gameCapFirst(s[2]); if (!nm) continue; const at = placeLabel(s[0], s[1], nm, 7); if (!at) continue; ctx.textAlign = at.align; ctx.lineWidth = 3; ctx.strokeStyle = halo; ctx.strokeText(nm, at.x, s[1]); ctx.fillStyle = ink; ctx.fillText(nm, at.x, s[1]); }
      }
      if (locSpine) {   // a range: a row of small peaks along its spine
        const mh = Math.max(3, Math.min(9, 3.4 * Math.sqrt(st.zoom / CMAP_ZLOC))), mw = mh * 0.85;
        ctx.save(); ctx.fillStyle = "rgba(0,0,0,0.62)"; ctx.strokeStyle = halo; ctx.lineWidth = 1;
        for (const q of locSpine) { const p = api.project(q[0], q[1]); if (!inView(api, p)) continue; ctx.beginPath(); ctx.moveTo(p[0] - mw, p[1] + mh * 0.55); ctx.lineTo(p[0], p[1] - mh * 0.75); ctx.lineTo(p[0] + mw, p[1] + mh * 0.55); ctx.closePath(); ctx.fill(); ctx.stroke(); }
        ctx.restore();
      }
      if (dot && !(locKind === "river" && ownRiver) && locKind !== "range" && locKind !== "region" && locKind !== "sea" && locKind !== "shelf") {
        const p = api.project(dot.c[0], dot.c[1]);
        if (p[2] >= 0) {
          if (locKind === "battle") paintSwords(ctx, p[0], p[1], 7.5);
          else if (!sibCard) { ctx.save(); ctx.fillStyle = "rgba(" + TINT_SEL.rgb + ",1)"; ctx.fillRect(p[0] - 5, p[1] - 5, 10, 10); ctx.lineWidth = 1.6; ctx.strokeStyle = "rgba(60,40,0,.75)"; ctx.strokeRect(p[0] - 5, p[1] - 5, 10, 10); ctx.restore(); }
          else { ctx.save(); ctx.beginPath(); ctx.arc(p[0], p[1], 5.5, 0, Math.PI * 2); ctx.fillStyle = "rgba(" + TINT_SEL.rgb + ",1)"; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = "rgba(60,40,0,.75)"; ctx.stroke(); ctx.restore(); }
        }
      }
      ctx.beginPath(); ctx.arc(api.cx, api.cy, api.radius, 0, Math.PI * 2); ctx.strokeStyle = "rgba(0,0,0,0.28)"; ctx.lineWidth = 1; ctx.stroke();
      if (isWar) warMarks(ctx, api);
      if (revealed) {
        const at = locLabelPt && locLabelPt.length ? locLabelPt[0] : locArea && locArea.length ? (() => { const b = ringsBBox(locArea); return [wrapLon((b[0] + b[2]) / 2), (b[1] + b[3]) / 2]; })() : dot ? dot.c : targets.length ? targets[0].c : null;
        if (at && nm0 && !(locKind === "river" && ownRiver)) {
          const p = api.project(at[0], at[1]);
          if (p[2] >= 0) { ctx.font = "600 13px " + font; const beside = !!dot && locKind !== "region" && locKind !== "range" && locKind !== "sea" && locKind !== "shelf"; ctx.textAlign = beside ? "left" : "center"; ctx.textBaseline = "middle"; const lx = beside ? p[0] + 10 : p[0]; ctx.lineWidth = 3; ctx.strokeStyle = halo; ctx.strokeText(nm0, lx, p[1]); ctx.fillStyle = locKind === "sea" ? water : ink; ctx.fillText(nm0, lx, p[1]); }
        }
      }
      ctx.restore();
    }
    /* the hub is created as soon as the engine's two bundles are in — in parallel with the card-faces join and the rest, not after them (Phase 4b: it was 45 ms of a warm first window) */
    const hubP = Promise.all([need[0], need[1]]).then((ok) => (ok.every(Boolean) && window.AtlasEmbed ? window.AtlasEmbed.ensure(hubOptions) : null));
    hubP.then((hub) => { if (hub && stopped && window.AtlasEmbed) window.AtlasEmbed.release(); }).catch(() => {});   // the card was left before its window mounted: the hub it asked for must not outlive the idle time
    Promise.all(need).then((ok) => {
      mark("a2:window-data");
      if (stopped) return;
      if (!ok.every(Boolean) || !window.AtlasEmbed) { v1(); return; }
      if (!model()) { unhold(); host.classList.remove("mc-loading"); host.classList.add("mc-failed"); return; }
      return hubP.then((hub) => {
        mark("a2:window-hub");
        if (stopped) return;
        if (!hub) { v1(); return; }
        let warYear = null;
        if (isWar) {
          const WT = window.ATLAS_WARS && window.ATLAS_WARS.wars && window.ATLAS_WARS.wars[sibCard];
          if (!WT) { v1(); return; }   // a war the table does not carry keeps V1's window
          warYear = Math.round((WT.y[0] + WT.y[1]) / 2); host.setAttribute("data-map-year", String(warYear));
          hub.startHistory("wars");   // Phase 4c: the war-window slice (1.8 MB), not the whole history (9.1 MB)
          return new Promise((res) => {
            let done = false; const fin = (ok) => { if (done) return; done = true; off(); clearTimeout(tm); res(ok); };
            const off = hub.onChange(() => { if (hub.historyOK()) fin(true); }), tm = setTimeout(() => fin(false), 150000);
            if (hub.historyOK()) fin(true);
          }).then((ok) => { if (stopped) return; if (!ok) { v1(); return; } { const sd = hub.warSides(sibCard); if (!sd || (!sd.v && !sd.l)) { v1(); return; } } mountWindow(hub, warYear); });   // Phase 4b: a war whose sides the loaded history has no faces for keeps V1's window too — on file:// the history twin is the 2a pilot slice (11 entities), and a window that tints nothing and frames the planet is worse than V1's
        }
        mountWindow(hub, null);
      });
    }).catch(() => { unhold(); if (!stopped) v1(); });
    function mountWindow(hub, warYear) {
        host.classList.remove("mc-loading"); host.setAttribute("data-map-engine", "v2");
        if (isWar) { try { warSides = hub.warSides(sibCard); warCols = hub.warColours(); } catch (e) { warSides = null; } }
        fit();
        if (isWar) {
          const cr = cv.getBoundingClientRect(), short = Math.max(1, Math.min(cr.width, cr.height)), f = hub.warView(sibCard, short, 0.45);   // 0.45: half of a face's bounding cap counts, so a polity with far islands does not frame the planet
          if (f) { const base0 = 0.46 * short; home = { lon: f.lon, lat: f.lat, zoom: Math.max(CMAP_ZMIN, Math.min(CMAP_ZMAX, zoomAttr || 6371.0088 / (f.kmpp * base0))) }; }
        }
        win = window.AtlasEmbed.view(cv, {
          zmin: CMAP_ZMIN, zmax: CMAP_ZMAX,
          spec: () => ({
            layers: { borders: true, provinces: !isWar && (layerName !== "world" || !!subdiv), admin1Max: 60, neutral: isWar, rivers: wantWater && !isWar, lakes: wantWater && !isWar, riverFine: isWaterSubject() },
            year: warYear != null ? warYear : undefined, war: isWar ? sibCard : undefined,
            highlights: targets.length ? [{ ids: targets.map((t) => t.id), rgb: TINT_SEL.rgb.split(",").map(Number), a: TINT_SEL.fillA, line: TINT_SEL.line, lineWidth: 2.6, glow: TINT_SEL.glow, glowBlur: 9 }] : [],
          }),
          draw: (st, api, ctx) => marks(st, api, ctx),
          onTap: () => { if (key && !revealed) return; openFromWindow(host, sibCard); },
        });
        mark("a2:window-mounted");
        win.setHome(home.lon, home.lat, home.zoom); win.setView(home.lon, home.lat, home.zoom);
        unhold();   // the window is in AtlasEmbed's `windows` now: it holds the hub itself
        host.querySelectorAll(".mc-btn").forEach((b) => b.addEventListener("click", (e) => {
          e.stopPropagation(); const w = b.getAttribute("data-mc");
          if (w === "home") win.goHome(); else if (w === "in") win.zoomBy(1.45); else if (w === "out") win.zoomBy(1 / 1.45);
        }));
        isReady = true;
    }
  }

  /* ---------- (2) FIND IT ON THE ATLAS v2 ENGINE (Oct 2026, Atlas v2 Phase 4; docs/atlas-v2-card-windows.md, docs/minigames.md) ----------
     STAGE A, behind the preview switch like the card windows: with `atlas2Preview()` on, `PAGES.findit` plays the day on a board drawn by the engine (atlas-embed.js, one context) instead of
     on the v1 Atlas page in game mode. NOTHING ABOUT THE GAME MOVES: the day's five rounds are dealt by a copy of `finditPools` / `buildGameRounds` (same seeds, same pools, same bars —
     `test-atlas-embed.js` asserts that the two deal the same five questions), a tap only PICKS, Guess commits, two tries, the score is what was FOUND, the door is `gameLockedToday`.
     WHAT MOVED ONTO THE ENGINE'S PRIMITIVES: the BOARD is the engine at the round's year (today's earth for a country or a place, the year's states and peoples for an area round);
     the PICK, the MISS, the FIND and the ANSWER are HIGHLIGHTS of faces (the tint and the outline of a country; the tint of a state of the year); and a country or a state is SCORED BY THE ID
     PASS — the entity ids under the tap, asked of the engine, against the entity the round names — where v1 hit-tested a polygon list and `pointInRings`'d a dated outline. A place is still
     scored by distance, and an authored extent with no entity (no polity behind the card) by the card's own ring, as before. */
  function findIt(rootEl, X) {
    const { CARD_BY_ID, GAME_MAX_DIFFICULTY, atlasRegisterAll, atlasStackKey, atlasStackOrder, availableCardIdSet, cardDifficulty, cardDifficultyRank, checkAchievements, ensureData, esc, hashStr, layerPoint, markGamePlayed, mulberry32, prefersReducedMotion, route, save, seededShuffle, sfx, todayStr } = X;
  const FI2_AREA_MAX_DIFFICULTY = 3;   // = FINDIT_AREA_MAX_DIFFICULTY inside PAGES.map: "known to the interested"
  const fi2Hav = (lon1, lat1, lon2, lat2) => { const DEG = Math.PI / 180, dLa = (lat2 - lat1) * DEG, dLo = (lon2 - lon1) * DEG; const a = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(dLo / 2) * Math.sin(dLo / 2); return 2 * 6371 * Math.asin(Math.sqrt(a)); };
  function fi2PolityLink(m, k) { const L = window.POLITY_LINKS; if (!L || !m) return null; const ids = m.ids || [m.id]; for (let i = 0; i < ids.length; i++) { const l = L[ids[i]]; if (l && l[k]) return l[k]; } return null; }
  function fi2PolityRings(slugs, y) {
    if (!slugs) return null; const rings = [];
    for (let i = 0; i < slugs.length; i++) {
      const ser = window.POLITIES && window.POLITIES[slugs[i]]; if (!ser) continue; const st = ser.s; let lo = 0, hi = st.length - 1, hit = null;
      while (lo <= hi) { const mid = (lo + hi) >> 1; if (y < st[mid][0]) hi = mid - 1; else if (y > st[mid][1]) lo = mid + 1; else { hit = st[mid]; break; } }
      if (hit) for (let r = 0; r < hit[2].length; r++) rings.push(hit[2][r]);
    }
    return rings.length ? { rings } : null;
  }
  function fi2PointInRings(rings, lon, lat) { let inside = false; for (const ring of rings) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const yi = ring[i][1], yj = ring[j][1]; if ((yi > lat) !== (yj > lat)) { const xi = ring[i][0], xj = ring[j][0]; if (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside; } } return inside; }
  function fi2CountryDesc(name) { const k = (name || "").trim().toLowerCase().replace(/\s+/g, " "); return (window.COUNTRY_INFO || {})[k] || ""; }
  function fi2Pools() {
    const reg = atlasRegisterAll(true), avail = availableCardIdSet();
    const bbA = (rings) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; rings.forEach((ring) => ring.forEach((p) => { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; })); return (x1 - x0) * (y1 - y0); };
    const countryNames = new Set();
    reg.names.forEach((v, lk) => { if ((v.ids || [v.id]).some((id) => avail.has(id))) countryNames.add(lk); });
    const stacks = new Map();
    reg.marks.forEach((m) => {
      if (!avail.has(m.id) || !CARD_BY_ID[m.id]) return;
      const placeDot = m.kind === "dot" && (m.modern ? m.cap : Array.isArray(m.at));
      if (m.kind !== "area" && !placeDot) return;
      const k = atlasStackKey(m); if (!stacks.has(k)) stacks.set(k, []); stacks.get(k).push(m);
    });
    const areas = [], places = [];
    stacks.forEach((ms) => {
      const bar = ms[0].kind === "area" ? FI2_AREA_MAX_DIFFICULTY : GAME_MAX_DIFFICULTY;
      if (!ms.some((m) => { const d = cardDifficulty(m.id); return d > 0 && d <= bar; })) return;
      const ids = atlasStackOrder(ms.map((m) => m.id)), first = ms.find((m) => m.id === ids[0]) || ms[0];
      if (first.kind === "dot") {
        let at = first.at; if (first.modern) { const row = layerPoint(first.points, first.dot); at = row && row.c; }
        if (!Array.isArray(at) || !isFinite(at[0]) || !isFinite(at[1])) return;
        places.push({ n: first.title, lon: at[0], lat: at[1], tol: first.cap ? 300 : 150, cap: !!first.cap, ids: ids }); return;
      }
      const y0s = ms.map((m) => m.y0).filter((v) => v != null), y1s = ms.map((m) => m.y1).filter((v) => v != null);
      if (!y0s.length) return;
      const y0 = Math.min.apply(null, y0s), y1 = y1s.length === ms.length ? Math.max.apply(null, y1s) : y0, yr = Math.round((y0 + y1) / 2);
      const slugs = fi2PolityLink({ ids: ids }, "area"), dated = fi2PolityRings(slugs, yr), rings = dated ? dated.rings : first.area;
      if (!rings || !rings.length || bbA(rings) <= 20) return;
      let x0 = 180, yy0 = 90, x1 = -180, yy1 = -90; rings.forEach((ring) => ring.forEach((q) => { if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < yy0) yy0 = q[1]; if (q[1] > yy1) yy1 = q[1]; }));
      const ctr = Array.isArray(first.at) && isFinite(first.at[0]) ? first.at : [(x0 + x1) / 2, (yy0 + yy1) / 2];
      areas.push({ n: first.title, shown: yr, rings: rings, lon: ctr[0], lat: ctr[1], ids: ids, slugs: dated ? slugs : null });
    });
    places.sort((a, b) => cardDifficultyRank(a.ids[0]) - cardDifficultyRank(b.ids[0]) || (a.n < b.n ? -1 : a.n > b.n ? 1 : 0));
    const kept = []; places.forEach((pl) => { if (!kept.some((k) => fi2Hav(pl.lon, pl.lat, k.lon, k.lat) <= Math.max(pl.tol, k.tol))) kept.push(pl); });
    return { countryNames: countryNames, areas: areas, places: kept };
  }
  function fi2Rounds() {
    const MAXY2 = new Date().getFullYear();
    const rngC = mulberry32(hashStr("findit-c-" + todayStr())), rngT = mulberry32(hashStr("findit-t-" + todayStr())), rngK = mulberry32(hashStr("findit-k-" + todayStr()));
    const bbA = (t) => { let best = 0; (t.p || []).forEach((ring) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; ring.forEach((p) => { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }); const a = (x1 - x0) * (y1 - y0); if (a > best) best = a; }); return best; };
    const pools = fi2Pools(), GEO2 = window.WORLD_GEO || [];
    const countries = seededShuffle(GEO2.filter((g) => g.n && pools.countryNames.has(g.n.toLowerCase()) && fi2CountryDesc(g.n) && bbA(g) > 30), rngC);
    const areas = seededShuffle(pools.areas, rngT), places = seededShuffle(pools.places, rngK);
    const used = new Set(); const pick = (pool) => { for (let i = 0; i < pool.length; i++) { const k = pool[i].n.toLowerCase(); if (!used.has(k)) { used.add(k); return pool[i]; } } return null; };
    const c1 = pick(countries), a1 = pick(areas), c2 = pick(countries), a2 = pick(areas), p1 = pick(places);
    const area = (a) => a && { kind: "area", n: a.n, year: a.shown, shown: a.shown, rings: a.rings, lon: a.lon, lat: a.lat, ids: a.ids, slugs: a.slugs };
    return [c1 && { kind: "entity", n: c1.n, year: MAXY2 }, area(a1), c2 && { kind: "entity", n: c2.n, year: MAXY2 }, area(a2), p1 && { kind: "point", n: p1.n, lon: p1.lon, lat: p1.lat, tol: p1.tol, cap: p1.cap, ids: p1.ids, year: MAXY2 }].filter(Boolean);
  }
  const FI2_NAMES = {   // = FINDIT_NAMES: a map label is not a question (see docs/minigames.md "A MAP LABEL IS NOT A QUESTION")
    "congo": "Republic of the Congo (Congo-Brazzaville)", "dem. rep. congo": "Democratic Republic of the Congo (Congo-Kinshasa)", "s. sudan": "South Sudan", "w. sahara": "Western Sahara", "central african rep.": "Central African Republic",
    "dominican rep.": "Dominican Republic", "bosnia and herz.": "Bosnia and Herzegovina", "eq. guinea": "Equatorial Guinea", "n. cyprus": "Northern Cyprus", "fr. polynesia": "French Polynesia",
    "fr. s. antarctic lands": "French Southern and Antarctic Lands", "br. indian ocean ter.": "British Indian Ocean Territory", "s. geo. and the is.": "South Georgia and the South Sandwich Islands", "n. mariana is.": "Northern Mariana Islands",
    "u.s. virgin is.": "United States Virgin Islands", "british virgin is.": "British Virgin Islands", "st. vin. and gren.": "Saint Vincent and the Grenadines", "antigua and barb.": "Antigua and Barbuda", "st. kitts and nevis": "Saint Kitts and Nevis",
    "st. pierre and miquelon": "Saint Pierre and Miquelon", "turks and caicos is.": "Turks and Caicos Islands", "heard i. and mcdonald is.": "Heard Island and McDonald Islands", "faeroe is.": "Faroe Islands", "wallis and futuna is.": "Wallis and Futuna Islands",
    "ashmore and cartier is.": "Ashmore and Cartier Islands", "clipperton i.": "Clipperton Island", "marshall is.": "Marshall Islands", "solomon is.": "Solomon Islands", "falkland is.": "Falkland Islands", "cayman is.": "Cayman Islands",
    "cook is.": "Cook Islands", "pitcairn is.": "Pitcairn Islands", "coral sea is.": "Coral Sea Islands", "spratly is.": "Spratly Islands",
  };
  const fi2Name = (n) => FI2_NAMES[String(n || "").trim().toLowerCase()] || n;
  const fi2Year = (y) => (y >= new Date().getFullYear() ? "today" : y < 0 ? -y + " BCE" : String(y));
  function run(root) {
    const GREEN = "rgba(46,164,90,1)", RED = "rgba(224,68,56,1)", GOLD = "rgba(255,178,46,1)", BLUE = "rgba(59,110,214,1)";
    const TINT = { pick: { rgb: [59, 110, 214], a: 0.30 }, miss: { rgb: [224, 68, 56], a: 0.34 }, found: { rgb: [46, 164, 90], a: 0.34 }, answer: { rgb: [255, 178, 46], a: 0.38 } };
    root.innerHTML = `
      <div class="findit2" id="findit2">
        <canvas class="fi2-board" id="fi2Board" tabindex="0" role="application" aria-label="Interactive globe — drag to turn it, scroll or pinch to zoom, arrow keys turn it, plus and minus zoom. Tap a place to pick it, then press Guess."></canvas>
        <div class="map-cartouche fi2-cartouche" id="mapCartouche" aria-hidden="true"></div>
        <div class="fi2-zoom" role="group" aria-label="Zoom"><button type="button" class="mc-btn" data-fi="in" aria-label="Zoom in" title="Zoom in">+</button><button type="button" class="mc-btn" data-fi="out" aria-label="Zoom out" title="Zoom out">&minus;</button><button type="button" class="mc-btn" data-fi="home" aria-label="Whole earth" title="Whole earth">&#8962;</button></div>
        <div class="map-game" id="mapGame" hidden>
          <div class="mg-card">
            <div class="mg-head"><span class="mg-round" id="mgRound"></span><span class="mg-score" id="mgScore"></span></div>
            <div class="mg-q" id="mgQ"></div>
            <div class="mg-feedback" id="mgFeedback" hidden></div>
            <div class="mg-acts"><button class="btn mg-confirm" id="mgConfirm" type="button" hidden></button><button class="btn ghost mg-clear" id="mgClear" type="button" hidden>Clear</button><button class="btn mg-next" id="mgNext" type="button" hidden></button></div>
          </div>
        </div>
        <div class="fi2-reveal" id="fiReveal" hidden></div>
        <div class="data-loading fi2-loading" id="fi2Loading" role="status" aria-live="polite"><span class="dl-globe" aria-hidden="true"></span><strong>Setting up today’s five places</strong></div>
      </div>`;
    const board = root.querySelector("#fi2Board"), cart = root.querySelector("#mapCartouche"), mgEl = root.querySelector("#mapGame"), roundEl = root.querySelector("#mgRound"), scoreEl = root.querySelector("#mgScore"), qEl = root.querySelector("#mgQ"), fbEl = root.querySelector("#mgFeedback"), nextEl = root.querySelector("#mgNext"), confirmEl = root.querySelector("#mgConfirm"), clearEl = root.querySelector("#mgClear"), revealEl = root.querySelector("#fiReveal"), loadEl = root.querySelector("#fi2Loading");
    let rounds = [], ri = 0, tries = 0, found = 0, firstTry = 0, lock = false, over = false, pick = null, win = null, hubRef = null, marks = [], pin = null, pickPin = null, pulse = null, disposed = false;
    const reduced = () => prefersReducedMotion();
    const MAXY2 = new Date().getFullYear();
    const need = [ensureData("atlas2"), ensureData("atlas2embed"), ensureData("atlas2cards"), ensureData("atlas2prose"), ensureData("world"), ensureData("worldcaps"), ensureData("polities")];
    const fail = () => { if (!root.isConnected) return; root.innerHTML = ""; X.PAGES.map(root, { game: true }); };   // the engine could not start: the v1 board plays the same day
    Promise.all(need).then((ok) => {
      if (!root.isConnected) return;
      if (!ok.every(Boolean) || !window.AtlasEmbed) { fail(); return; }
      return window.AtlasEmbed.ensure({ host: {}, needHistory: "full" }).then((hub) => {
        if (!root.isConnected) return; if (!hub) { fail(); return; }
        hubRef = hub; rounds = fi2Rounds(); root._finditRounds = () => rounds.map((r) => ({ kind: r.kind, n: r.n, year: r.year })); root._finditApi = { panel: (r) => revealPanel(r), win: () => win, rounds: () => rounds, round: () => ri };   // read by test-atlas-embed.js
        if (!rounds.length) { route("map"); return; }
        loadEl.hidden = true;
        win = window.AtlasEmbed.view(board, {
          zmin: 0.85, zmax: 400,
          spec: () => specNow(),
          draw: (st, api, ctx) => overlay(st, api, ctx),
          onTap: (e) => tapAt(e),
          minDrag: 6,
        });
        win.setHome(15, 20, 1); win.setView(15, 20, 1);
        for (const t of ["pointerdown", "wheel", "keydown"]) board.addEventListener(t, () => { flyId++; }, { passive: true });
        root.querySelectorAll("[data-fi]").forEach((b) => b.addEventListener("click", () => { const w = b.getAttribute("data-fi"); if (w === "home") fly(15, 20, 1); else win.zoomBy(w === "in" ? 1.45 : 1 / 1.45); }));
        nextEl.addEventListener("click", () => { if (over) { route("home"); return; } ri++; if (ri >= rounds.length) end(); else showRound(); });
        confirmEl.addEventListener("click", commit);
        clearEl.addEventListener("click", () => { clearPick(); win.schedule(); });
        board.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); if (pick && !confirmEl.hidden) commit(); else if (!pick) tapAt({ clientX: board.getBoundingClientRect().left + board.clientWidth / 2, clientY: board.getBoundingClientRect().top + board.clientHeight / 2 }); } });
        mgEl.hidden = false; showRound();
      });
    }).catch(() => { if (!disposed) fail(); });
    new MutationObserver(() => { if (!root.isConnected) { disposed = true; if (win) win.stop(); } }).observe(document.body, { childList: true, subtree: true });
    // ---- the board ----
    const roundNow = () => rounds[ri] || null;
    function specNow() {
      const r = roundNow(), area = r && r.kind === "area";
      const hl = []; for (const m of marks) if (m.ids && m.ids.length) hl.push({ ids: m.ids, rgb: m.tint.rgb, a: m.tint.a, line: area ? null : "rgba(" + m.tint.rgb.join(",") + ",1)", lineWidth: 2.6, glow: area ? null : "rgba(" + m.tint.rgb.join(",") + ",0.7)", glowBlur: 9 });
      return { layers: { borders: true, provinces: false, peoples: area ? "all" : "off" }, year: area ? r.shown : undefined, highlights: hl };
    }
    let flyId = 0;   // a reader who touches the board mid-flight takes it over: the flight stops
    function fly(lon, lat, zoom) {
      if (!win) return; const my = ++flyId; const s = win.st, from = { lon: s.lon, lat: s.lat, zoom: s.zoom }; let dl = lon - from.lon; if (dl > 180) dl -= 360; else if (dl < -180) dl += 360;
      if (reduced()) { win.setView(lon, lat, zoom); return; }
      const t0 = performance.now(), D = 700; const step = (t) => { if (disposed || my !== flyId) return; const k = Math.min(1, (t - t0) / D), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; win.setView(from.lon + dl * e, from.lat + (lat - from.lat) * e, from.zoom * Math.pow(zoom / from.zoom, e), { fast: k < 1 }); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step);
    }
    function overlay(st, api, ctx) {
      ctx.save(); ctx.setTransform(api.dpr, 0, 0, api.dpr, 0, 0);
      const ring = (x, y, r, col, w) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); };
      if (pickPin) { const p = api.project(pickPin[0], pickPin[1]); if (p[2] >= 0) { ctx.strokeStyle = BLUE; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, Math.PI * 2); ctx.moveTo(p[0] - 15, p[1]); ctx.lineTo(p[0] - 5, p[1]); ctx.moveTo(p[0] + 5, p[1]); ctx.lineTo(p[0] + 15, p[1]); ctx.moveTo(p[0], p[1] - 15); ctx.lineTo(p[0], p[1] - 5); ctx.moveTo(p[0], p[1] + 5); ctx.lineTo(p[0], p[1] + 15); ctx.stroke(); } }
      if (pin) { const p = api.project(pin.lon, pin.lat); if (p[2] >= 0) { ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, Math.PI * 2); ctx.fillStyle = pin.col; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = "rgba(60,40,0,.75)"; ctx.stroke(); ctx.font = "600 13px system-ui, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,255,255,0.94)"; ctx.strokeText(pin.name, p[0] + 11, p[1]); ctx.fillStyle = "#221808"; ctx.fillText(pin.name, p[0] + 11, p[1]); } }
      if (pulse) { const k = reduced() ? 0.5 : Math.min(1, (performance.now() - pulse.t0) / 900); const p = api.project(pulse.lon, pulse.lat); if (p[2] >= 0) ring(p[0], p[1], 8 + 36 * k, pulse.col.replace(/1\)$/, (1 - k).toFixed(2) + ")"), 3); if (k < 1) { win.schedule(); } else pulse = null; }
      ctx.restore();
    }
    // ---- the game (rules, scoring and wording as v1's) ----
    function clearPick() { pick = null; pickPin = null; marks = marks.filter((m) => !m.pick); confirmEl.hidden = true; clearEl.hidden = true; }
    function showRound() {
      const r = rounds[ri]; tries = 0; lock = false; pulse = null; marks = []; pin = null; clearPick(); revealEl.hidden = true;
      roundEl.textContent = "Round " + (ri + 1) + " / " + rounds.length; scoreEl.textContent = found + " found";
      qEl.innerHTML = r.kind === "area" ? "Find <b>" + esc(r.n) + "</b> — as it stood in " + fi2Year(r.shown) : (r.kind === "point" && r.cap ? "Find the city of <b>" + esc(r.n) + "</b>" : "Find <b>" + esc(fi2Name(r.n)) + "</b>") + " on today's map";
      cart.textContent = r.kind === "area" ? "FULL ATLAS · " + fi2Year(r.shown) : "TODAY";
      fbEl.hidden = true; nextEl.hidden = true;
      if (r.kind === "area") fly(r.lon, r.lat, 1.6); else fly(15, 20, 1);
      win.schedule();
    }
    const targetIds = (r) => { if (r.kind === "entity") { const L = window.ATLAS_CARD_FACES && window.ATLAS_CARD_FACES.layers.world; const t = L && L[r.n]; return t ? [t[0]] : []; } if (r.kind === "area" && r.slugs) return r.slugs.map((s) => "pol:" + s); return []; };
    function tapAt(e) {
      const r = roundNow(); if (!r || over || lock || !hubRef) return;
      const rect = board.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top, spec = Object.assign({ w: rect.width, h: rect.height, lon: win.st.lon, lat: win.st.lat, zoom: win.st.zoom }, specNow());
      const ll = hubRef.lonLatAt(spec, x, y); if (!ll) return;   // the sky
      const ids = hubRef.idsAt(spec, x, y);
      const country = ids.find((id) => /^adm0:/.test(id)) || null;
      if (r.kind === "entity" && !country) return;
      marks = marks.filter((m) => !m.pick);
      pick = { ll, ids, country };
      if (r.kind === "entity" && country) marks.push({ ids: [country], tint: TINT.pick, pick: true });
      else if (r.kind === "area") { const s = ids.filter((id) => /^(pol|ext):/.test(id)); if (s.length) marks.push({ ids: s, tint: TINT.pick, pick: true }); }
      pickPin = r.kind === "point" ? [ll[0], ll[1]] : null;
      confirmEl.textContent = "Guess"; confirmEl.hidden = false; clearEl.hidden = false; sfx("click"); win.schedule();
    }
    function edgeKm(rings, lon, lat) { let best = Infinity; for (const ring of rings) for (const q of ring) { const d = fi2Hav(lon, lat, q[0], q[1]); if (d < best) best = d; } return best; }
    function commit() {
      const r = roundNow(); if (!r || over || lock || !pick) return;
      const ll = pick.ll, ids = pick.ids, country = pick.country; clearPick();
      let correct = false, distKm = null;
      if (r.kind === "point") { distKm = fi2Hav(ll[0], ll[1], r.lon, r.lat); correct = distKm <= r.tol; }
      else if (r.kind === "area") {
        const t = targetIds(r);
        if (t.length) correct = t.some((id) => ids.indexOf(id) >= 0); else correct = fi2PointInRings(r.rings, ll[0], ll[1]);   // an authored extent with no polity behind it is scored by its own ring, as before
        if (!correct) distKm = edgeKm(r.rings, ll[0], ll[1]);
      } else {
        const t = targetIds(r); correct = !!country && t.indexOf(country) >= 0;
        if (!correct) { const c = fi2Target(r); if (c) distKm = fi2Hav(ll[0], ll[1], c[0], c[1]); }
      }
      if (correct) { found++; if (tries === 0) firstTry++; sfx("good"); reveal(r, true); return; }
      if (r.kind === "entity" && country && !marks.some((m) => m.ids[0] === country)) marks.push({ ids: [country], tint: TINT.miss });
      if (r.kind === "area") { const s = ids.filter((id) => /^(pol|ext):/.test(id) && targetIds(r).indexOf(id) < 0); if (s.length) marks.push({ ids: s, tint: TINT.miss }); }
      if (tries === 0) { tries = 1; sfx("bad"); fbEl.textContent = (distKm != null ? Math.round(distKm).toLocaleString("en-US") + " km away — " : "Not there — ") + "one more try!"; fbEl.hidden = false; win.schedule(); }
      else { sfx("bad"); reveal(r, false); }
    }
    function fi2Target(r) { if (r.kind !== "entity") return [r.lon, r.lat]; const k = r.n.toLowerCase(); const g = (window.WORLD_GEO || []).find((x) => (x.n || "").toLowerCase() === k && x.c); return g ? [g.c[0], g.c[1]] : null; }
    function reveal(r, ok) {
      lock = true; clearPick();
      const tgt = fi2Target(r), tint = ok ? TINT.found : TINT.answer, col = ok ? GREEN : GOLD;
      if (r.kind === "entity") { const t = targetIds(r); if (t.length) marks.push({ ids: t, tint }); }
      else if (r.kind === "area") { const t = targetIds(r); if (t.length) marks.push({ ids: t, tint }); }
      else { pin = { lon: r.lon, lat: r.lat, name: r.n, col }; }
      pulse = { lon: tgt ? tgt[0] : r.lon, lat: tgt ? tgt[1] : r.lat, t0: performance.now(), col };
      if (tgt) fly(tgt[0], tgt[1], Math.max(win.st.zoom, r.kind === "point" ? 2.8 : 1.5));
      fbEl.textContent = ok ? (tries === 0 ? "Found it — first try!" : "Found it!") : "It was here."; fbEl.hidden = false;
      scoreEl.textContent = found + " found";
      revealPanel(r);
      nextEl.textContent = ri + 1 >= rounds.length ? "See your score" : "Next round"; nextEl.hidden = false; win.schedule();
    }
    /* THE LEARN PANEL (Phase 4c, the owner's decision 5) — what v1's `showCountryPopup` and `showMinePopup` did after an answer, on the engine's board. The round ends on something learned:
       · the place's NAME (a country by its full name), with "New discovery!" the first time a country is opened (the same `placesSeen` register v1's panel wrote, no sound in a game, as v1);
       · for a country the prose v1 printed (the general description, without the figures and the "(Language: name)" parentheticals v1 strips), for a state or people the years it is shown in;
       · THE PLACE CARD'S LIST OF CARDS (`AtlasStudy.cardsFor`: the reader's own first, "and N more", the collection beside each, "studied" on the ones the reader has a record for), each a link to the card's own
         address — for a country the cards the register names for it, for a state, a people or a place the cards the round was dealt for;
       · how to continue: a Next button in the panel (the same button as the one under the question), a way to read about it on the Atlas, and a close button (Escape too) that puts the panel away and leaves the board.
       v1's mine popup also swiped through the cards' answers one at a time; here a card is one tap away. */
    const stripInfoNoise = (t) => {   // = v1's `stripInfoNoise`: no "(Language: name)", no sentence that quotes a figure the number grid shows
      if (!t) return ""; t = String(t).replace(/\s*\([^)]*:[^)]*\)/g, "");
      const grid = /[$€£]\s?\d|\d[\d.,]*\s*(?:million|billion|trillion)\b|\d[\d.,]*\s*(?:km²|km2|sq\.?\s?mi|sq\.?\s?km|square\s?kilomet|square\s?mile)/i;
      const kept = t.split(/(?<=[.!?])\s+/).filter((q) => !grid.test(q));
      return (kept.length ? kept.join(" ") : t).replace(/\s{2,}/g, " ").trim();
    };
    const SU = X.study || null, AStudy = window.AtlasStudy || null;
    let learnLimit = 0, learnRound = null, learnNew = false;
    const cardsOf = (r) => {   // the card ids this round teaches: a country's by the register, anything else's as the round was dealt
      let ids = [];
      if (r.kind === "entity") { try { const reg = atlasRegisterAll(true), v = reg.names.get(r.n.toLowerCase()); if (v) ids = (v.ids || [v.id]).filter(Boolean); } catch (e) { ids = []; } }
      else ids = (r.ids || []).slice();
      const avail = availableCardIdSet(); return ids.filter((id, i) => CARD_BY_ID[id] && avail.has(id) && ids.indexOf(id) === i);
    };
    function learnList(r) {
      const ids = cardsOf(r); if (!ids.length) return "";
      const info = (id) => (SU && SU.cardInfo ? SU.cardInfo(id) : null);
      const mine = SU && SU.studiedCards ? SU.studiedCards() : [];
      let list;
      if (AStudy && AStudy.cardsFor) { const idx = { cardsOfPlace: new Map([["round", ids]]) }; list = AStudy.cardsFor(idx, "round", { cards: mine }, "full", [], info, learnLimit || AStudy.LIST_CAP); }
      else list = { shown: ids.slice(0, learnLimit || 8).map((id) => ({ id, mine: mine.indexOf(id) >= 0 })), more: Math.max(0, ids.length - (learnLimit || 8)), others: 0, total: ids.length };
      const li = (c) => { const i = info(c.id) || {}; return '<li><a class="cp-cardlink fi2-learn-card" href="' + esc(SU && SU.cardHref ? SU.cardHref(c.id) : "#card/" + c.id) + '" data-card="' + esc(c.id) + '"><span class="fi2-learn-title">' + esc(i.title || c.id) + "</span>" + (i.coll ? '<span class="fi2-learn-chip">' + esc(i.coll) + "</span>" : "") + (c.mine ? '<span class="fi2-learn-mine" title="You have studied this card">studied</span>' : "") + "</a></li>"; };
      return '<section class="fi2-learn-cards" aria-label="Cards about this place"><h3 class="fi2-learn-h">Cards about this place</h3><ul class="fi2-reveal-cards">' + list.shown.map(li).join("") + "</ul>" + (list.more ? '<button type="button" class="fi2-learn-more" data-more="1">and ' + list.more + " more</button>" : "") + "</section>";
    }
    function revealPanel(r, again) {
      learnRound = r;
      if (!again) { learnLimit = 0; learnNew = false; if (r.kind === "entity" && SU && SU.discover) { try { learnNew = !!SU.discover(r.n); } catch (e) { learnNew = false; } } }
      const name = r.kind === "entity" ? fi2Name(r.n) : r.n;
      let html = '<div class="fi2-reveal-head"><b>' + esc(name) + "</b>" + (learnNew ? '<span class="fi2-learn-new">New discovery!</span>' : "") + '<button type="button" class="fi2-reveal-close" aria-label="Close this panel">&times;</button></div>';
      html += '<div class="fi2-reveal-body">';
      if (r.kind === "entity") { const d = stripInfoNoise(fi2CountryDesc(r.n)); if (d) html += '<p class="fi2-reveal-desc">' + (X.sanitizeHTML ? X.sanitizeHTML(d) : esc(d.replace(/<[^>]*>/g, ""))) + "</p>"; }   // the country prose carries <b> and <i> (v1 sets it through sanitizeHTML too)
      else if (r.kind === "area") html += '<p class="fi2-reveal-desc fi2-reveal-when">As it stood in ' + esc(fi2Year(r.shown != null ? r.shown : r.year)) + ".</p>";
      html += learnList(r) + "</div>";
      const t = targetIds(r)[0];
      html += '<div class="fi2-reveal-acts">' + (t ? '<button type="button" class="btn ghost fi2-reveal-go" data-place="' + esc(t) + '">Read about it on the Atlas</button>' : "") + '<button type="button" class="btn fi2-reveal-next" id="fiRevealNext">' + esc(ri + 1 >= rounds.length ? "See your score" : "Next round") + "</button></div>";
      revealEl.setAttribute("role", "dialog"); revealEl.setAttribute("aria-label", "What you found: " + name);
      revealEl.innerHTML = html; revealEl.hidden = false;
      revealEl.querySelectorAll(".fi2-reveal-go").forEach((b) => b.addEventListener("click", () => route("map2", { place: b.getAttribute("data-place") })));
      const nx = revealEl.querySelector(".fi2-reveal-next"); if (nx) nx.addEventListener("click", () => { if (!nextEl.hidden) nextEl.click(); });
      const cl = revealEl.querySelector(".fi2-reveal-close"); if (cl) cl.addEventListener("click", () => { revealEl.hidden = true; board.focus({ preventScroll: true }); });
      const more = revealEl.querySelector(".fi2-learn-more"); if (more) more.addEventListener("click", () => { learnLimit = (learnLimit || (AStudy ? AStudy.LIST_CAP : 8)) + 20; revealPanel(learnRound, true); });
    }
    root.addEventListener("keydown", (e) => { if (e.key === "Escape" && !revealEl.hidden) { revealEl.hidden = true; e.stopPropagation(); } });
    function end() {
      over = true; const n = rounds.length, perfect = n >= 5 && found >= n;
      markGamePlayed("findit", perfect, found, n); save(); checkAchievements();
      roundEl.textContent = "Done!"; scoreEl.textContent = ""; revealEl.hidden = true;
      qEl.innerHTML = "<b>" + found + " / " + n + "</b> found" + (perfect ? " — perfect!" : ".");
      fbEl.textContent = (firstTry < found ? firstTry + " of them on the first try. " : "") + "Come back tomorrow for five new places."; fbEl.hidden = false;
      nextEl.textContent = "Back to Home"; nextEl.hidden = false;
    }
    void MAXY2;
    }
    run(rootEl);
  }
  W.AtlasWindows = { startCardWindow, findIt };
})(window);
