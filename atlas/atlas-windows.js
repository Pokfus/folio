/* atlas-windows.js — the card windows and Find-it on the Atlas v2 engine (Atlas v2 Phase 4; docs/atlas-v2-card-windows.md). A LAZY file, loaded with atlas-embed.js (the `atlas2embed` bundle) the first time a window or the
   Find-it board is wanted, so none of it is on the eager path. It reaches app.js's own helpers only through `X`, the context object app.js hands over (`atlas2Ctx`): the card data, the
   locator and war attributes' readers, the sibling dots, the colours — nothing here is a second copy of a rule, except Find it's pool and rounds (`finditRegister`, `fi2Pools`, `fi2Rounds`), which moved here from v1's
   page closure when Phase 5 deleted it (docs/atlas-v2-phase5-plan.md §4.1: the day's five rounds are the same ones v1's data dealt, `.claude/compare-findit-deal.js`). */
  /* ---------- (1) CARD WINDOWS ON THE ATLAS v2 ENGINE (Oct 2026, Atlas v2 Phase 4; docs/atlas-v2-card-windows.md) ----------
     The same windows — a map card, a locator, a war — drawn by `atlas/atlas-embed.js` (ONE headless engine and one WebGL context for every window on the page) instead of by
     the earlier version's own 2D canvas (deleted in Phase 5). The host contract is that window's, attribute for attribute and method for method (`_folioMap`), so the nine surfaces that
     mount a window and the suites that read one do not know how it was drawn; `data-map-engine` on the host says: "v2" (the engine, WebGL2), "v2-2d" (the same engine on the still Canvas 2D renderer — a browser without WebGL2: the tint
     and the marks, no outline glow, no war tint, the zoom held at 5 km/px) or "none" (the engine could not start: a plain sentence and the card's own key).
     WHAT THE ENGINE DRAWS: the coast, the borders, the admin-1 lines of the three layers, the rivers and lakes (a locator, and the two layers with a hi-res row in v1), and the shaded place — its
     FACE, from the entity table of topology.bin (`atlas/data/card-faces.js` is the join from a layer's key to an entity id), with the Atlas's selection gold as a translucent tint and a gold
     outline and glow from the engine's own mask pass. WHAT THE WINDOW DRAWS ON TOP, as it always did: the gold mark (square, circle, swords), the card's authored area and range spine, the
     siblings and the collection's home square with their names, and the place's name after the reveal. Nothing about the card's content moved. */
(function (W) {
  "use strict";
  /* THE WAR WINDOW'S TIMELINE (2026-10-19; docs/atlas-v2-card-windows.md "The war window's timeline"). A war whose data has a front line or a picture that changes in two or more dated steps gets a slim rail under its
     window: a pin, play and pause, step buttons, the war's own years at its two ends and, under the pin, the step's month and year ("Mar 1943") where the step's date has a month, else the year. The steps come from the
     engine (`hub.warTimeline`): the years in which the faces of the war's two sides change, or — for the war that owns the front line — the front's plate dates. THE WAR SLICE CARRIES NO FRONT LINE (40 % of history.bin's
     vertices are the front's): `WAR_FRONT_CARDS` are the cards whose window reads the Second World War slice (atlas/data/history-ww2.bin, 4.7 MB, `build-ww2-slice.js`: every plate, the states of the plates' years and the war's sides,
     on file:// through its twin) instead of the war slice (1.8 MB) — and never the whole history (9.1 MB; it did until 2026-10-19). `.claude/test-war-timeline.js` proves the list equals the front entities' `cards` in history.bin. */
  const WAR_FRONT_CARDS = new Set(["ww2-001"]);
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const yearText = (y) => (y < 0 ? (-y) + " BCE" : y === 0 ? "1 BCE" : y < 1000 ? y + " CE" : String(y));   // a CE year is bare from 1000 on; a short one keeps its era so "632" is never a number
  const dateFrac = (d) => { const y = Math.floor(d / 10000), m = Math.floor(d / 100) % 100, dd = d % 100; return y + (Date.UTC(y, m - 1, dd) - Date.UTC(y, 0, 1)) / (365.25 * 86400000); };
  const stepText = (st) => (st.month ? MONTHS[st.month - 1] + " " + yearText(st.year) : yearText(st.year));
  /* the steps of a timeline from the engine's answer: the front's plates (each with a month) when the war owns them, else the change years; fewer than two is no timeline */
  function timelineSteps(tl) {
    if (!tl) return [];
    const out = [];
    if (tl.front && tl.plates && tl.plates.length) for (const d of tl.plates) out.push({ year: Math.floor(d / 10000), month: Math.floor(d / 100) % 100, day: d % 100, date: d, t: dateFrac(d), front: true });
    else for (const y of tl.years || []) out.push({ year: y, month: null, day: null, date: null, t: y, front: false });
    return out.length >= 2 ? out : [];
  }
  /* where the pin opens: the step nearest the card's own date when the card's date line names ONE year inside the war, else the war's last step */
  function startStep(steps, span, years) {
    const set = new Set((years || []).filter((y) => isFinite(y)));
    if (set.size === 1) { const y = [...set][0]; if (y >= span[0] && y <= span[1]) { let best = 0; steps.forEach((st, i) => { if (Math.abs(st.t - (y + 0.5)) < Math.abs(steps[best].t - (y + 0.5))) best = i; }); return best; } }
    return steps.length - 1;
  }
  const mark = (n) => { try { performance.mark(n); } catch (e) {} };   // Phase 4b: named marks (a2:*) so a trace shows where a first window's time went
  if (typeof window !== "undefined" && !window.__folioReliefBtnSync) {
    window.__folioReliefBtnSync = true;
    window.addEventListener("atlas2:windowrelief", (e) => {
      const on = !!(e && e.detail && e.detail.on);
      document.querySelectorAll(".mc-relief").forEach((b) => b.setAttribute("aria-pressed", on ? "true" : "false"));
    });
  }
  function startCardWindow(host, X) {
    mark("a2:window-start");
    if (W.AtlasWindows) W.AtlasWindows.lastCtx = X;
    let tlStop = () => {};   // removes the war timeline and stops its play (a war window only)
    let unhold = () => {};   // the hub is held while this window is pending (see AtlasEmbed.hold); let go at the first of: the window is mounted, it fell back to V1, it failed, it was stopped
    if (W.AtlasEmbed && W.AtlasEmbed.hold) { const let0 = W.AtlasEmbed.hold(); unhold = () => { unhold = () => {}; let0(); }; }   // the context app.js handed over, kept so a suite can mount synthetic windows (the fit sweep of test-atlas-windows.js) through the same code
    const { CARD_BY_ID, CARD_MAP_LAYERS, CMAP_ANCHOR, CMAP_DEG, CMAP_HIRES, CMAP_LAYER_HIRES, CMAP_SEG, CMAP_SUBDIV, CMAP_ZLOC, CMAP_ZMAX, CMAP_ZMIN, DATA_BUNDLES, TINT_SEL, cardCollectionRoot, cardLocator, ensureData, gameCapFirst, locatorSiblings, paintSwords, ringsBBox, wrapLon } = X, S = X.S;
    const cv = host.querySelector(".mc-canvas");
    const layerName = host.getAttribute("data-map-layer"), key = host.getAttribute("data-map-key");
    const def = CARD_MAP_LAYERS[layerName];
    /* THE WINDOW THE ENGINE COULD NOT DRAW (Phase 5, decision 3): a plain sentence in the window's place and the card's own text around it. Nothing else the card offers depends on the map. */
    const plain = (why) => {
      stopped = true; unhold(); tlStop(); host.classList.remove("mc-loading"); host.classList.add("mc-plain"); host.setAttribute("data-map-engine", "none");
      host._folioMap = { stop() { host._folioMap = null; }, reveal() {}, ready() { return true; }, settled() { return true; }, names() { return []; }, boxes() { return { names: [], marks: [], dropped: [], controls: null }; }, labels() { return []; }, probe() { return null; }, view() { return { lon: 0, lat: 0, zoom: 1, home: [0, 0, 1] }; }, pan() {} };
      if (cv) cv.hidden = true; host.querySelectorAll(".mc-zoom").forEach((z) => { z.hidden = true; });
      if (!host.querySelector(".mc-plain-note")) { const n = document.createElement("p"); n.className = "mc-plain-note"; n.setAttribute("role", "note"); n.textContent = why; host.insertBefore(n, host.firstChild); }
    };
    const SORRY = "This map could not be drawn here. The rest of the card is all there; try again with the page reloaded.";
    let stopped = false, revealed = host.hasAttribute("data-map-named"), win = null, isReady = false;
    if (!def) { plain(SORRY); return; }
    stopped = false;
    host._folioMap = {
      stop() { stopped = true; unhold(); tlStop(); if (win) win.stop(); host._folioMap = null; },
      reveal() { revealed = true; if (win) win.schedule(); },
      ready() { return isReady; },
      settled() { return !!(win && win.isSettled()); },
      names() { return lastNames.slice(); },
      boxes() { return JSON.parse(JSON.stringify(lastBoxes)); },   // every name drawn and every mark standing in the last frame, as boxes in the window's CSS px, the names dropped for want of room, the controls' box — for the suites
      labels() { return lastLabels.map((l) => Object.assign({}, l)); },   // the war window's two names as drawn: { k: "v" | "l", n, x, y (the LABEL'S POINT, CSS px of the window: inside a face of the side when `ground`), tx, ty (the text's centre: the point itself, or beside it when `beside`), w (its width), ground, beside } — for the suites
      probe() { return win && win.api ? { spec: win.api.spec, dpr: win.api.dpr, cw: win.api.cw, ch: win.api.ch } : null; },   // the frame the window last drew: its engine spec and size — for the suites   // Phase 4b: the war window's two sides as drawn on it ("Rome", "Carthage"), for the suites   // Phase 4b: the engine's levels, tiles and water for THIS view are all in (ready() is the window being mounted)
      view() { return win ? { lon: win.st.lon, lat: win.st.lat, zoom: win.st.zoom, home: [win.st.home.lon, win.st.home.lat, win.st.home.zoom] } : { lon: 0, lat: 0, zoom: 1, home: [0, 0, 1] }; },
      pan(dx, dy) { if (win) win.panBy(dx, dy); },
    };
    host.classList.add("mc-loading");
    const sibCard = host.getAttribute("data-map-card") || "";
    const warAttr = host.classList.contains("map-war");
    const locKind = host.getAttribute("data-map-kind") || "point";
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
    /* RELIEF FOLLOWS THE ATLAS (2026-10-18, the owner's decision c): a map card, a locator and a war window draw relief when the reader has it on in the Atlas's Legend, at the
       strength set there (AtlasEmbed.reliefSetting: the Atlas's saved layers, re-read on change), and never under light mode or on a cellular connection — the idle warm-up's own
       two rules (app.js lightMode / onCellular), since the L0 sheet alone is 9 MB. Find it never asks for it. */
    const onCellular = (() => { try { return !!(typeof navigator !== "undefined" && navigator.connection && navigator.connection.type === "cellular"); } catch (e) { return false; } })();
    const reliefNow = () => { const r = !lightReader && !onCellular && window.AtlasEmbed && window.AtlasEmbed.reliefSetting ? window.AtlasEmbed.reliefSetting() : null; return r && r.on ? { relief: true, strength: r.strength } : { relief: false }; };
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
    const wantsAlt = !!(S.settings && S.settings.mapAlt) && !sibCard && !!key;   // "Describe geography maps": the sentence naming the shaded shape's neighbours (docs/atlas-v2-phase5-plan.md §4.3)
    const need = [ensureData("atlas2"), ensureData("atlas2embed"), ensureData("atlas2cards")];
    if (wantsAlt) need.push(ensureData("atlas2nbr"));
    if (isWar) need.push(ensureData("atlas2wars"));
    if (wantsOwnRiver) { need.push(ensureData("rivers1")); if (hiRegion && DATA_BUNDLES["river_" + hiRegion]) need.push(ensureData("river_" + hiRegion)); }
    let FACES = null, targets = [], dot = null, ownLines = null, ownName = "";
    let ownRiverDone = false;
    const hubOptions = { host: {} };
    const wantsFront = isWar && WAR_FRONT_CARDS.has(sibCard);   // the war that owns the front line reads the Second World War slice (see WAR_FRONT_CARDS), on file:// too
    if (isWar) { hubOptions.needHistory = wantsFront ? "ww2" : "wars"; hubOptions.ownHolds = 1; }   // a hub on the other slice is replaced when no other window or pending window is on it (AtlasEmbed.ensure)
    let tlSteps = [], tlIdx = -1, tlSpan = null;   // the timeline's steps (none: no timeline), the step the pin stands on, the war's own years
    const tlStep = () => (tlIdx >= 0 ? tlSteps[tlIdx] : null);
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
    /* WAR WINDOWS: THE TWO PRINCIPAL SIDES ARE NAMED ON THE MAP and nothing else is written over it. `ATLAS_WARS` carries the card's name for each side ("Rome", "Carthage", "Han, Zhao, Wei, Chu, Yan and Qi"); the names stand where
       each side stands in the war's years (the engine's `warSides`: the mean direction of the side's faces). THE ONE LEGEND is the plain-text one under the window (`cardWarKeyHTML`, app.js: the swatches, "victors" and "defeated", the card's own
       words); Phase 4b drew a second one, a pill over the foot of the map, and the owner (a real phone, Oct 2026, decision 2) asked for it to go — it covered ground. */
    /* WHERE EACH SIDE'S NAME STANDS (Oct 2026, the owner's phone: on the Second Punic War "Rome" sat over a red area of southern Italy and "Carthage" over a green strip, because each name was at the centroid of the UNION of its side's faces,
       and a union of scattered states has a centroid on somebody else's ground). Now: a point INSIDE one of the side's own faces — the engine's label anchor, asked of the worker at rest (`faceAnchors`: the face's visible polygon's centre when
       it is inside, else the nearest inside point along its axes) — on the side's biggest face on screen that has room: the name's box wholly inside the frame, clear of the zoom controls and of the other side's name; the next face when it has
       not; and only when no face of the side has room the best face's point pushed in (and `ground: false` in `labels()`). The point is kept as a point on the sphere, so a pan or a pinch carries it with the map and the next rest asks again.
       Until the first answer (a worker round trip after the first full frame) the window is not settled and draws no names; if the worker never answers the old centroid stands. `labels()` is what the suites read. */
    let warSides = null, lastNames = [], lastLabels = [], warHub = null, lastBoxes = { names: [], marks: [], dropped: [], ctl: null };
    const anch = { asked: "", key: "", rows: null, state: "none", timer: 0 };   // state: none | wait | have | failed
    const viewKey = (st, cw, ch, level) => [st.lon.toFixed(4), st.lat.toFixed(4), st.zoom.toFixed(4), cw, ch, level, tlStep() ? tlStep().date || tlStep().year : ""].join();   // the level is in it: the faces are asked for at the level the view draws
    const anchorsCurrent = (st, o) => !isWar || !warSides || !warHub || anch.state === "failed" || (anch.state === "have" && anch.key === viewKey(st, o.cw, o.ch, o.level));
    function askAnchors(st, api) {
      const key = viewKey(st, api.cw, api.ch, api.level); if (anch.asked === key) return; anch.asked = key;
      const faces = [].concat(warSides.v ? warSides.v.faces || [] : [], warSides.l ? warSides.l.faces || [] : []);
      if (!faces.length || !warHub || !warHub.faceAnchors) { anch.state = "failed"; return; }
      if (anch.state !== "have") anch.state = "wait";
      clearTimeout(anch.timer); anch.timer = setTimeout(() => { if (stopped || anch.asked !== key || anch.key === key) return; if (!anch.rows) anch.state = "failed"; anch.key = key; if (win) win.schedule(); }, 6000);   // a worker that never answers must not hold the window unsettled for ever
      // each side's principal entity is asked in the piece of its face that holds its own capital of the year (Rome's Italy, not the strip of North Africa an ally held in the same face)
      const near = [warSides.v, warSides.l].filter((sd) => sd && sd.pface >= 0 && sd.pcap).map((sd) => ({ face: sd.pface, lon: sd.pcap[0], lat: sd.pcap[1] }));
      warHub.faceAnchors(faces, near).then((rows) => { if (stopped || anch.asked !== key) return; anch.rows = rows; anch.key = key; anch.state = "have"; if (win) win.schedule(); }, () => { if (anch.asked === key && !anch.rows) { anch.state = "failed"; anch.key = key; if (win) win.schedule(); } });
    }
    function warMarks(st, ctx, api) {
      if (!warSides) return;
      const W = api.cw, H = api.ch;
      if (!api.fast) askAnchors(st, api);
      if (anch.state === "wait" && !anch.rows) { lastNames = []; lastLabels = []; return; }   // not yet: a name at the centroid would flash on the wrong ground and jump
      const sides = [["v", "victors"], ["l", "defeated"]].filter((q) => warSides[q[0]]);
      // the zoom controls' box in the window's CSS px (refreshed at rest), kept clear
      const cvR = cv.getBoundingClientRect(), zc = host.querySelector(".mc-zoom");
      if (!api.fast || !warMarks.ctl) { const zr = zc ? zc.getBoundingClientRect() : null; warMarks.ctl = zr && zr.width ? [zr.left - cvR.left - 6, zr.top - cvR.top - 6, zr.right - cvR.left + 6, zr.bottom - cvR.top + 6] : null; }
      const ctl = warMarks.ctl;
      ctx.save(); ctx.font = "600 12.5px " + font; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const placed2 = [], named = [], labelsNow = [];
      const hit = (b, o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1];
      // per side: its name, the name's width, and the points inside its faces (the biggest face on screen first, each face's best point first) that are on the globe's near side
      const info = sides.map(([k]) => {
        const sd = warSides[k], text = String(sd.n || "").trim(); if (!text) return null;
        const faceSet = new Set(sd.faces || []), w = ctx.measureText(text).width;
        let cands = (anch.rows || []).filter((r) => r.v && faceSet.has(r.face)).sort((a, b2) => (b2.km2 || 1) * Math.max(0.02, b2.vis) - (a.km2 || 1) * Math.max(0.02, a.vis));
        /* THE NAME STANDS ON THE PRINCIPAL ENTITY'S OWN FACE (Oct 2026): "Rome" on Rome's face, not on an ally's strip that happens to be bigger on screen. Only when the principal has no face in the display year (or none of it
           is on the visible globe, so no point of it can be asked) does the name fall back to the side's biggest face, as before. */
        const own = sd.pface != null && sd.pface >= 0 ? cands.filter((r) => r.face === sd.pface) : [];
        if (own.length) cands = own;
        const pts = []; for (const r of cands) for (const q of r.pts && r.pts.length ? r.pts : [{ v: r.v }]) { const p = api.projectV(q.v[0], q.v[1], q.v[2]); if (p[2] > 0.02) { p.face = r.face; pts.push(p); } }
        return { k, sd, text, w, bw: w / 2 + 3, bh: 9, pts, principal: !!own.length };
      }).filter(Boolean);
      const boxAt = (o, x, y) => [x - o.bw, y - o.bh, x + o.bw, y + o.bh];
      const roomy = (o, x, y) => { const b = boxAt(o, x, y); return b[0] >= 3 && b[2] <= W - 3 && b[1] >= 3 && b[3] <= H - 3 && !(ctl && hit(b, ctl)); };
      /* where the name's text goes for a point inside a face: centred on it; and, when the faces are small and the names crowd, beside it with the point at the box's edge (right, left, above, below) — the point is still on the
         side's ground, the text is next to it, as a name stands beside a dot. Ranked: every point with the name ON it first (best point first), and only then the names beside a point (a name over somebody else's ground is the thing to avoid). */
      for (const o of info) { o.opts = []; o.pts.forEach((p, n) => { [[0, 0], [o.bw, 0], [-o.bw, 0], [0, -o.bh], [0, o.bh]].forEach((d, v) => { const tx = p[0] + d[0], ty = p[1] + d[1]; if (roomy(o, tx, ty)) o.opts.push({ p, t: [tx, ty], rank: (v ? 1000 : 0) + n, beside: v > 0 }); }); }); }
      // two names: the pair of placements (best-ranked first) whose boxes do not meet
      let chosen = null;
      if (info.length === 2) {
        const [a, b2] = info; let best = null;
        for (const x of a.opts) for (const y of b2.opts) if ((!best || x.rank + y.rank < best[0]) && !hit(boxAt(a, x.t[0], x.t[1]), boxAt(b2, y.t[0], y.t[1]))) best = [x.rank + y.rank, x, y];
        if (best) chosen = [best[1], best[2]];
      }
      info.forEach((o, n) => {
        let pick = chosen ? chosen[n] : o.opts.find((q) => !placed2.some((bx) => hit(boxAt(o, q.t[0], q.t[1]), bx))) || null, at = pick ? pick.t : null, ground = !!pick, beside = !!(pick && pick.beside), pt = pick ? pick.p : null;
        if (!at) {   // no point inside the side's faces has room for its name: the centroid, or the biggest face's best point, pushed in (it may then stand off its own ground — `ground: false`)
          const p = o.pts.length ? o.pts[0] : api.project(o.sd.lon, o.sd.lat); if (!o.pts.length && p[2] < 0) return;
          let x = Math.max(o.bw + 3, Math.min(W - o.bw - 3, p[0])), y = Math.max(o.bh + 3, Math.min(H - o.bh - 3, p[1]));
          const free = (xx, yy) => roomy(o, xx, yy) && !placed2.some((q) => hit(boxAt(o, xx, yy), q));
          for (let tries = 0; tries < 8 && !free(x, y); tries++) { const bb = boxAt(o, x, y); if (ctl && hit(bb, ctl)) x = Math.max(o.bw + 3, ctl[0] - o.bw - 1); else y = y + 17 > H - o.bh - 3 ? Math.max(o.bh + 3, y - 34) : y + 17; }
          at = [x, y]; pt = p; ground = false;
        }
        placed2.push(boxAt(o, at[0], at[1]));
        ctx.lineWidth = 3.4; ctx.lineJoin = "round"; ctx.strokeStyle = halo; ctx.strokeText(o.text, at[0], at[1]); ctx.fillStyle = ink; ctx.fillText(o.text, at[0], at[1]); named.push(o.text); labelsNow.push({ k: o.k, n: o.text, x: pt[0], y: pt[1], tx: at[0], ty: at[1], w: o.w, ground, beside, face: pt.face == null ? -1 : pt.face, pface: o.sd.pface == null ? -1 : o.sd.pface, principal: o.principal });
      });
      lastNames = named; lastLabels = labelsNow;
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
      /* THE WINDOW'S NAMES, LAID OUT BY THE LABEL ENGINE'S RULES (Oct 2026, the owner's phone: on the Tiber's window "Pyrgi", "Veii" and "Tiber" ran into one another and into the dots). Everything that is not a name is a MARK and
         is ground no name may cover — every sibling's dot (whether or not its name is placed), the home square, the card's own dot, the range's peaks — and the zoom controls are ground too. The names are then placed one at a time
         in PRIORITY order, each at the first of its candidate places that lies wholly inside the frame and meets no mark and no name already placed: the card's own river's name, the card's own place's name (these two are the
         answer or the subject: never dropped, they take their preferred place if no other is clear), the home square's name, then the siblings, nearest to the window's centre first. A name no place of which is clear is DROPPED (the
         label engine's rule: higher priority wins, a name that does not fit is not drawn); its dot stays. */
      const markBoxes = [], nameBoxes = [], plan = [];
      const hit = (b, o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1];
      const cvR = cv.getBoundingClientRect(), zc = host.querySelector(".mc-zoom");
      if (!api.fast || !marks.ctl) { const zr = zc ? zc.getBoundingClientRect() : null; marks.ctl = zr && zr.width ? [zr.left - cvR.left - 4, zr.top - cvR.top - 4, zr.right - cvR.left + 4, zr.bottom - cvR.top + 4] : null; }
      const ctlR = marks.ctl;
      const addMark = (kind, x, y, hw, hh) => markBoxes.push({ kind, box: [x - hw, y - hh, x + hw, y + hh] });
      const widths = marks.widths || (marks.widths = new Map());
      const wOf = (font2, text) => { const k = font2 + "|" + text; let w = widths.get(k); if (w == null) { ctx.font = font2; w = ctx.measureText(text).width; widths.set(k, w); } return w; };
      const clear = (b) => b[0] >= 2 && b[1] >= 2 && b[2] <= W - 2 && b[3] <= H - 2 && !(ctlR && hit(b, ctlR)) && !markBoxes.some((m) => hit(b, m.box)) && !nameBoxes.some((q) => hit(b, q.box));
      /* the places a name may take round a point mark of half-size r: right, left, above, below, then the four corners (the text's box is its width plus 2 px each side, `half` high) */
      const around = (x, y, r, w, half) => [0, 9].reduce((all, ring) => all.concat(ring1(x, y, r + ring, w, half)), []);   // the near ring, then one 9 px further out (a name beside a crowd of dots rather than none)
      const ring1 = (x, y, r, w, half) => {
        const g = r + 3, hw = w + 4;
        return [[x + g, y, "left"], [x - g, y, "right"], [x - hw / 2 + 2 + w / 2, y - g - half, "center"], [x, y + g + half, "center"], [x + g, y - g - half + 4, "left"], [x + g, y + g + half - 4, "left"], [x - g, y - g - half + 4, "right"], [x - g, y + g + half - 4, "right"]]
          .map((c) => ({ x: c[0], y: c[1], align: c[2], box: c[2] === "left" ? [c[0] - 2, c[1] - half, c[0] + w + 2, c[1] + half] : c[2] === "right" ? [c[0] - w - 2, c[1] - half, c[0] + 2, c[1] + half] : [c[0] - w / 2 - 2, c[1] - half, c[0] + w / 2 + 2, c[1] + half] }));
      };
      const centred = (x, y, w, half) => ({ x, y, align: "center", box: [x - w / 2 - 2, y - half, x + w / 2 + 2, y + half] });
      // a name: its candidate places in preference order; `must` = never dropped (the first candidate stands when none is clear)
      const placeName = (text, font2, cands, o) => {
        const w = wOf(font2, text); const list = typeof cands === "function" ? cands(w) : cands; if (!list.length) return null;
        const at = list.find((c) => clear(c.box)) || (o.must ? list[0] : null);
        if (!at) { droppedNames.push(text); return null; }
        nameBoxes.push({ text, box: at.box, own: !!o.own }); plan.push({ text, font: font2, x: at.x, y: at.y, align: at.align, color: o.color || ink, lw: o.lw || 3 });
        return at;
      };
      const droppedNames = [];
      const nm0 = gameCapFirst(dot ? dot.n : targets.length ? targets[0].n : "");
      // ---- the marks ----
      let sibAt = [], anchorAt = null;
      if (sibCard && !isWar) {
        const groups = new Map();
        for (const d of sib.dots) {
          if (!S.cards || !S.cards[d.id]) continue;
          const k = String(d.within || d.n || "").trim().toLowerCase(); if (!k || (locWithin && k === locWithin)) continue; if (anchor && k === anchor.n.toLowerCase()) continue;
          const isCity = !d.within || String(d.n || "").trim().toLowerCase() === k; let g = groups.get(k);
          if (!g) groups.set(k, g = { n: d.within || d.n, c: d.c, kind: d.kind, city: isCity }); else if (isCity && !g.city) { g.c = d.c; g.n = d.n; g.kind = d.kind; g.city = true; }
        }
        groups.forEach((g) => { const p = api.project(g.c[0], g.c[1]); if (inView(api, p)) sibAt.push([p[0], p[1], g.n, g.kind]); });
        if (anchor) { const p = api.project(anchor.c[0], anchor.c[1]); if (inView(api, p)) anchorAt = [p[0], p[1]]; }
        for (const sa of sibAt) addMark(sa[3] === "battle" ? "swords" : "dot", sa[0], sa[1], sa[3] === "battle" ? 8 : 4.6, sa[3] === "battle" ? 8 : 4.6);
        if (anchorAt) addMark("home", anchorAt[0], anchorAt[1], 5.6, 5.6);
      }
      if (locSpine) { const mh = Math.max(3, Math.min(9, 3.4 * Math.sqrt(st.zoom / CMAP_ZLOC))), mw = mh * 0.85; for (const q of locSpine) { const p = api.project(q[0], q[1]); if (inView(api, p)) addMark("peak", p[0], p[1] - mh * 0.1, mw + 1, mh * 0.65 + 1); } }
      let ownDotAt = null;
      if (dot && !(locKind === "river" && !!ownLines) && locKind !== "range" && locKind !== "region" && locKind !== "sea" && locKind !== "shelf") { const p = api.project(dot.c[0], dot.c[1]); if (p[2] >= 0) { ownDotAt = p; addMark(locKind === "battle" ? "swords" : "dot", p[0], p[1], locKind === "battle" ? 9 : 7, locKind === "battle" ? 9 : 7); } }
      // ---- the names, in priority order ----
      if (ownLines && revealed) {   // the card's own river: its name on the line, at the first of several stretches that is clear
        const lines = ownLines.filter((l) => l && l.length > 1).sort((p1, p2) => p2.length - p1.length);   // the river's stretches, the longest first
        if (lines.length) {
          const lbl = gameCapFirst(ownName), w = wOf("600 13px " + font, lbl), pts = [];
          for (const dy of [0, -11, 11]) for (const line of lines) for (const f of [0.5, 0.45, 0.55, 0.4, 0.6, 0.35, 0.65, 0.3, 0.7, 0.25, 0.75, 0.2, 0.8, 0.15, 0.85, 0.1, 0.9, 0.05, 0.95]) { const q = line[Math.min(line.length - 1, Math.floor(line.length * f))], p = api.project(q[0], q[1]); if (p[2] >= 0 && p[0] > 0 && p[0] < W && p[1] > 0 && p[1] < H) pts.push(centred(p[0], p[1] + dy, w, 8)); }   // on the line at the middle first, then along it, then just above and below it
          for (const line of lines) for (const f of [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8, 0.1, 0.9]) { const q = line[Math.min(line.length - 1, Math.floor(line.length * f))], p = api.project(q[0], q[1]); if (p[2] >= 0 && p[0] > 0 && p[0] < W && p[1] > 0 && p[1] < H) for (const c of ring1(p[0], p[1], 2, w, 8).slice(0, 4)) pts.push(c); }   // then beside the line, to its right and left, above and below
          placeName(lbl, "600 13px " + font, pts, { must: true, own: true });
        }
      }
      const ownLabelAt = locLabelPt && locLabelPt.length ? locLabelPt[0] : locArea && locArea.length ? (() => { const b = ringsBBox(locArea); return [wrapLon((b[0] + b[2]) / 2), (b[1] + b[3]) / 2]; })() : dot ? dot.c : targets.length ? targets[0].c : null;
      if (revealed && ownLabelAt && nm0 && !(locKind === "river" && !!ownLines)) {
        const p = api.project(ownLabelAt[0], ownLabelAt[1]);
        if (p[2] >= 0) {
          const beside = !!dot && locKind !== "region" && locKind !== "range" && locKind !== "sea" && locKind !== "shelf";
          // beside a dot: to its right as always (10 px from its centre), then the other places round it; on an area or a range: centred on its label point, then above and below it
          placeName(nm0, "600 13px " + font, (w) => beside ? around(p[0], p[1], 7, w, 8).map((c, n) => (n === 0 ? Object.assign(c, { x: p[0] + 10, box: [p[0] + 8, c.y - 8, p[0] + 12 + w, c.y + 8] }) : c)) : [centred(p[0], p[1], w, 8), centred(p[0], p[1] - 18, w, 8), centred(p[0], p[1] + 18, w, 8), centred(p[0] - w / 2 - 14, p[1], w, 8), centred(p[0] + w / 2 + 14, p[1], w, 8)], { must: true, own: true, color: locKind === "sea" ? water : ink });
        }
      }
      if (anchorAt) placeName(anchor.n, "600 11.5px " + font, (w) => around(anchorAt[0], anchorAt[1], 5.6, w, 8), {});
      sibAt.sort((a, b) => Math.hypot(a[0] - api.cw / 2, a[1] - api.ch / 2) - Math.hypot(b[0] - api.cw / 2, b[1] - api.ch / 2));   // the nearest to the window's centre first: they are the places the card is about
      for (const sa of sibAt) { const nm = gameCapFirst(sa[2]); if (nm) placeName(nm, "500 11px " + font, (w) => around(sa[0], sa[1], 4.6, w, 7), {}); }
      lastBoxes = { names: nameBoxes.map((q) => ({ text: q.text, own: q.own, box: q.box.slice() })), marks: markBoxes.map((m) => ({ kind: m.kind, box: m.box.slice() })), dropped: droppedNames.slice(), ctl: ctlR ? ctlR.slice() : null };
      // ---- drawing: the marks, then the names ----
      if (sibCard && !isWar) {
        for (const sa of sibAt) {
          if (sa[3] === "battle") paintSwords(ctx, sa[0], sa[1], 6.5);
          else { ctx.beginPath(); ctx.arc(sa[0], sa[1], 3.4, 0, Math.PI * 2); ctx.fillStyle = "rgba(200,69,60,.9)"; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.stroke(); }
        }
        if (anchorAt) { const q = 4.4; ctx.fillStyle = "rgba(200,69,60,.92)"; ctx.fillRect(anchorAt[0] - q, anchorAt[1] - q, q * 2, q * 2); ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.strokeRect(anchorAt[0] - q, anchorAt[1] - q, q * 2, q * 2); }
      }
      if (ownLines) { ctx.save(); ctx.strokeStyle = TINT_SEL.line; ctx.lineWidth = 2.6; ctx.shadowColor = TINT_SEL.glow; ctx.shadowBlur = 9; ctx.beginPath(); for (const ln of ownLines) addPath(ctx, api, ln, false); ctx.stroke(); ctx.restore(); }
      if (locSpine) {   // a range: a row of small peaks along its spine
        const mh = Math.max(3, Math.min(9, 3.4 * Math.sqrt(st.zoom / CMAP_ZLOC))), mw = mh * 0.85;
        ctx.save(); ctx.fillStyle = "rgba(0,0,0,0.62)"; ctx.strokeStyle = halo; ctx.lineWidth = 1;
        for (const q of locSpine) { const p = api.project(q[0], q[1]); if (!inView(api, p)) continue; ctx.beginPath(); ctx.moveTo(p[0] - mw, p[1] + mh * 0.55); ctx.lineTo(p[0], p[1] - mh * 0.75); ctx.lineTo(p[0] + mw, p[1] + mh * 0.55); ctx.closePath(); ctx.fill(); ctx.stroke(); }
        ctx.restore();
      }
      if (ownDotAt) {
        const p = ownDotAt;
        if (locKind === "battle") paintSwords(ctx, p[0], p[1], 7.5);
        else if (!sibCard) { ctx.save(); ctx.fillStyle = "rgba(" + TINT_SEL.rgb + ",1)"; ctx.fillRect(p[0] - 5, p[1] - 5, 10, 10); ctx.lineWidth = 1.6; ctx.strokeStyle = "rgba(60,40,0,.75)"; ctx.strokeRect(p[0] - 5, p[1] - 5, 10, 10); ctx.restore(); }
        else { ctx.save(); ctx.beginPath(); ctx.arc(p[0], p[1], 5.5, 0, Math.PI * 2); ctx.fillStyle = "rgba(" + TINT_SEL.rgb + ",1)"; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = "rgba(60,40,0,.75)"; ctx.stroke(); ctx.restore(); }
      }
      ctx.beginPath(); ctx.arc(api.cx, api.cy, api.radius, 0, Math.PI * 2); ctx.strokeStyle = "rgba(0,0,0,0.28)"; ctx.lineWidth = 1; ctx.stroke();
      if (isWar) warMarks(st, ctx, api);
      ctx.textBaseline = "middle"; ctx.lineJoin = "round";
      for (const n of plan) { ctx.font = n.font; ctx.textAlign = n.align; ctx.lineWidth = n.lw; ctx.strokeStyle = halo; ctx.strokeText(n.text, n.x, n.y); ctx.fillStyle = n.color; ctx.fillText(n.text, n.x, n.y); }
      ctx.restore();
    }
    /* THE TIMELINE UNDER A WAR WINDOW (2026-10-19): a slim rail spanning only the war's own years, a pin that snaps to the steps, play and pause, step buttons; the label under the pin is the step's month and year, else its year.
       Moving the pin changes the SAME window's year (and, for the front line, its date): the spec is read at every draw, so it is a `schedule()`, not a reload. It is a slider for assistive technology (value = the step's number,
       text = its date, with the day where the plate has one), keyboard-operable (arrows, Home, End, Page Up and Down), follows Text size (`--fs`) and wraps to 360 px. */
    function mountTimeline(hub) {
      const n = tlSteps.length, t0 = tlSpan[0], t1 = tlSpan[1] + 1;
      const frac = (st) => Math.max(0, Math.min(1, (st.t - t0) / Math.max(1e-9, t1 - t0)));
      const el = document.createElement("div"); el.className = "war-tl"; el.setAttribute("role", "group"); el.setAttribute("aria-label", "Timeline of the war: " + n + " steps, from " + stepText(tlSteps[0]) + " to " + stepText(tlSteps[n - 1]));
      el.innerHTML = '<div class="wtl-bar"><div class="wtl-ctl">' +
        '<button type="button" class="wtl-btn wtl-prev" aria-label="Previous step" title="Previous step"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '<button type="button" class="wtl-btn wtl-play" aria-label="Play the steps" aria-pressed="false" title="Play"><svg class="wtl-ic-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg><svg class="wtl-ic-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg></button>' +
        '<button type="button" class="wtl-btn wtl-next" aria-label="Next step" title="Next step"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>' +
        '<div class="wtl-rail"><div class="wtl-track"><div class="wtl-line"></div><div class="wtl-ticks" aria-hidden="true"></div><div class="wtl-pin" role="slider" tabindex="0" aria-label="War timeline" aria-orientation="horizontal"></div></div>' +
        '<div class="wtl-now" aria-hidden="true"></div><div class="wtl-ends"><span class="wtl-start"></span><span class="wtl-end"></span></div></div></div>';
      const q = (c) => el.querySelector(c), track = q(".wtl-track"), pin = q(".wtl-pin"), now = q(".wtl-now"), prev = q(".wtl-prev"), next = q(".wtl-next"), play = q(".wtl-play");
      q(".wtl-start").textContent = yearText(tlSpan[0]); q(".wtl-end").textContent = yearText(tlSpan[1]);
      q(".wtl-ticks").innerHTML = tlSteps.map((st) => '<i style="left:' + (frac(st) * 100).toFixed(2) + '%"></i>').join("");
      pin.setAttribute("aria-valuemin", "1"); pin.setAttribute("aria-valuemax", String(n));
      let playing = false, playTimer = 0;
      const stopPlay = () => { playing = false; clearTimeout(playTimer); playTimer = 0; play.setAttribute("aria-pressed", "false"); play.setAttribute("aria-label", "Play the steps"); play.title = "Play"; el.classList.remove("wtl-playing"); };
      function reflect() {
        const st = tlSteps[tlIdx], f = frac(st) * 100, txt = stepText(st);
        pin.style.left = f + "%"; pin.setAttribute("aria-valuenow", String(tlIdx + 1));
        pin.setAttribute("aria-valuetext", (st.day ? st.day + " " : "") + txt + ", step " + (tlIdx + 1) + " of " + n);
        now.textContent = txt;
        el.setAttribute("data-step", String(tlIdx)); el.setAttribute("data-date", String(st.date || st.year)); el.setAttribute("data-label", txt);
        prev.disabled = tlIdx <= 0; next.disabled = tlIdx >= n - 1;
        const tw = track.clientWidth || 200, nw = now.offsetWidth || 50, px = Math.max(nw / 2, Math.min(tw - nw / 2, (f / 100) * tw));
        now.style.left = px + "px";   // under the pin, held inside the rail's two ends
      }
      function go(i) {
        i = Math.max(0, Math.min(n - 1, i)); if (i === tlIdx) return false;
        tlIdx = i; const st = tlSteps[i];
        host.setAttribute("data-map-year", String(st.year));
        try { warSides = hub.warSides(sibCard, st.year); } catch (e) { /* the old sides stand */ }
        reflect(); if (win) win.schedule(); return true;
      }
      const tick = () => {
        playTimer = 0; if (!playing || stopped) return;
        if (win && !win.isSettled() && (tick.waited = (tick.waited || 0) + 150) < 4000) { playTimer = setTimeout(tick, 150); return; }
        tick.waited = 0;
        if (!go(tlIdx + 1) || tlIdx >= n - 1) { if (tlIdx >= n - 1) { stopPlay(); return; } }
        playTimer = setTimeout(tick, n > 60 ? 380 : 800);
      };
      play.addEventListener("click", () => {
        if (playing) { stopPlay(); return; }
        if (tlIdx >= n - 1) go(0);
        playing = true; play.setAttribute("aria-pressed", "true"); play.setAttribute("aria-label", "Pause"); play.title = "Pause"; el.classList.add("wtl-playing");
        playTimer = setTimeout(tick, n > 60 ? 380 : 800);
      });
      prev.addEventListener("click", () => { stopPlay(); go(tlIdx - 1); });
      next.addEventListener("click", () => { stopPlay(); go(tlIdx + 1); });
      pin.addEventListener("keydown", (e) => {
        const big = Math.max(2, Math.round(n / 10)); let to = null;
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") to = tlIdx - 1; else if (e.key === "ArrowRight" || e.key === "ArrowUp") to = tlIdx + 1;
        else if (e.key === "Home") to = 0; else if (e.key === "End") to = n - 1; else if (e.key === "PageDown") to = tlIdx - big; else if (e.key === "PageUp") to = tlIdx + big;
        if (to == null) return; e.preventDefault(); stopPlay(); go(to);
      });
      // the pointer: a press on the rail or the pin snaps to the nearest step and follows the drag
      const nearest = (clientX) => { const r = track.getBoundingClientRect(), t = t0 + Math.max(0, Math.min(1, (clientX - r.left) / Math.max(1, r.width))) * (t1 - t0); let b = 0; tlSteps.forEach((st, i) => { if (Math.abs(st.t - t) < Math.abs(tlSteps[b].t - t)) b = i; }); return b; };
      let dragging = false;
      track.addEventListener("pointerdown", (e) => { if (e.button) return; dragging = true; stopPlay(); try { track.setPointerCapture(e.pointerId); } catch (er) {} go(nearest(e.clientX)); pin.focus({ preventScroll: true }); e.preventDefault(); });
      track.addEventListener("pointermove", (e) => { if (dragging) go(nearest(e.clientX)); });
      const up = () => { dragging = false; };
      track.addEventListener("pointerup", up); track.addEventListener("pointercancel", up);
      host.insertAdjacentElement("afterend", el);
      reflect();
      if (typeof ResizeObserver !== "undefined") { try { const ro = new ResizeObserver(() => reflect()); ro.observe(track); const old = tlStop; tlStop = () => { ro.disconnect(); old(); }; } catch (e) { /* the label is placed at the next step */ } }
      const base = tlStop; tlStop = () => { stopPlay(); try { el.remove(); } catch (e) {} tlStop = () => {}; base(); };
      host._folioTimeline = { el, steps: tlSteps.slice(), index: () => tlIdx, go, playing: () => playing };   // for the suites
    }
    /* the hub is created as soon as the engine's two bundles are in — in parallel with the card-faces join and the rest, not after them (Phase 4b: it was 45 ms of a warm first window) */
    const hubP = Promise.all([need[0], need[1]]).then((ok) => (ok.every(Boolean) && window.AtlasEmbed ? window.AtlasEmbed.ensure(hubOptions) : null));
    hubP.then((hub) => { if (hub && stopped && window.AtlasEmbed) window.AtlasEmbed.release(); }).catch(() => {});   // the card was left before its window mounted: the hub it asked for must not outlive the idle time
    Promise.all(need).then((ok) => {
      mark("a2:window-data");
      if (stopped) return;
      if (!ok.every(Boolean) || !window.AtlasEmbed) { plain(SORRY); return; }
      if (!model()) { unhold(); host.classList.remove("mc-loading"); host.classList.add("mc-failed"); return; }
      return hubP.then((hub) => {
        mark("a2:window-hub");
        if (stopped) return;
        if (!hub) { plain(SORRY); return; }
        let warYear = null;
        if (isWar) {
          if (hub.canvas2d) { plain("This browser cannot draw a war’s sides on the map (it needs WebGL2). The key below says who fought whom."); return; }   // the still renderer draws no history
          const WT = window.ATLAS_WARS && window.ATLAS_WARS.wars && window.ATLAS_WARS.wars[sibCard];
          if (!WT) { plain(SORRY); return; }   // a war the table does not carry
          warYear = Math.round((WT.y[0] + WT.y[1]) / 2); host.setAttribute("data-map-year", String(warYear));
          hub.startHistory(wantsFront ? "ww2" : "wars");   // Phase 4c: the war-window slice (1.8 MB), not the whole history (9.1 MB); the card that owns the front line (WAR_FRONT_CARDS) reads its own slice (4.7 MB)
          return new Promise((res) => {
            let done = false; const fin = (ok) => { if (done) return; done = true; off(); clearTimeout(tm); res(ok); };
            const off = hub.onChange(() => { if (hub.historyOK()) fin(true); }), tm = setTimeout(() => fin(false), 150000);
            if (hub.historyOK()) fin(true);
          }).then((ok) => { if (stopped) return; if (!ok) { plain(SORRY); return; } { const sd = hub.warSides(sibCard); if (!sd || (!sd.v && !sd.l)) { plain(SORRY); return; } }
            /* the timeline's steps and where the pin opens (2026-10-19): the step nearest the card's own date when it names one year inside the war, else the war's last step; the window's year is that step's */
            try { tlSteps = timelineSteps(hub.warTimeline(sibCard)); } catch (e) { tlSteps = []; }
            if (tlSteps.length) { tlSpan = WT.y.slice(); const c0 = CARD_BY_ID[sibCard]; tlIdx = startStep(tlSteps, tlSpan, X.cardSpanYears && c0 ? X.cardSpanYears(c0) : []); warYear = tlSteps[tlIdx].year; host.setAttribute("data-map-year", String(warYear)); }
            mountWindow(hub, warYear); });   // Phase 4b: a war whose sides the loaded history has no faces for keeps V1's window too — on file:// the history twin is the 2a pilot slice (11 entities), and a window that tints nothing and frames the planet is worse than V1's
        }
        mountWindow(hub, null);
      });
    }).catch(() => { unhold(); if (!stopped) plain(SORRY); });
    /* THE MAP IN WORDS (Settings → Describe geography maps): the shaded shape's neighbours among that layer's own shapes, from atlas/data/card-neighbours.js (build-card-faces.js froze the proximity rule that v1 ran in the
       browser). A key-list the table has no entry for (a card added after Phase 5 that shades several shapes at once) gets the union of the single shapes' lists without the shapes themselves. */
    function describeMap() {
      const slot = host.querySelector(".mc-alt"); const T = window.ATLAS_CARD_NEIGHBOURS && window.ATLAS_CARD_NEIGHBOURS.layers && window.ATLAS_CARD_NEIGHBOURS.layers[layerName]; if (!slot || !T) return;
      let nb = T[key];
      if (!nb) { const own = key.split("|"), set = new Set(); for (const k of own) (T[k] || []).forEach((n) => { if (own.indexOf(n) < 0) set.add(n); }); nb = [...set].sort((a, b) => a.localeCompare(b)); }
      const one = def.what || "shape", many = def.plural || one + "s";
      const andList = (a) => (a.length === 1 ? a[0] : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);
      slot.textContent = nb.length ? "The shaded " + one + " borders, among the " + many + " on this map: " + andList(nb) + "." : "The shaded " + one + " borders no other " + one + " on this map.";
      slot.hidden = false;
    }
    function mountWindow(hub, warYear) {
        host.classList.remove("mc-loading"); host.setAttribute("data-map-engine", hub.canvas2d ? "v2-2d" : "v2");
        if (wantsAlt) describeMap();
        if (isWar) { try { warHub = hub; warSides = hub.warSides(sibCard, warYear); } catch (e) { warSides = null; } }
        fit();
        if (isWar) {
          const cr = cv.getBoundingClientRect(), short = Math.max(1, Math.min(cr.width, cr.height)), f = hub.warView(sibCard, short, 0.45);   // 0.45: half of a face's bounding cap counts, so a polity with far islands does not frame the planet
          if (f) { const base0 = 0.46 * short; home = { lon: f.lon, lat: f.lat, zoom: Math.max(CMAP_ZMIN, Math.min(CMAP_ZMAX, zoomAttr || 6371.0088 / (f.kmpp * base0))) }; }
        }
        win = window.AtlasEmbed.view(cv, {
          zmin: CMAP_ZMIN, zmax: CMAP_ZMAX,
          spec: () => ({
            layers: Object.assign({ borders: true, provinces: !isWar && (layerName !== "world" || !!subdiv), admin1Max: 60, neutral: isWar, rivers: wantWater && !isWar, lakes: wantWater && !isWar, riverFine: isWaterSubject() }, reliefNow()),
            year: tlStep() ? tlStep().year : warYear != null ? warYear : undefined, war: isWar ? sibCard : undefined, history: wantsFront ? "ww2" : undefined, front: !!(tlStep() && tlStep().front), frontDate: tlStep() && tlStep().front ? tlStep().date : null,
            highlights: targets.length ? [{ ids: targets.map((t) => t.id), rgb: TINT_SEL.rgb.split(",").map(Number), a: TINT_SEL.fillA, line: TINT_SEL.line, lineWidth: 2.6, glow: TINT_SEL.glow, glowBlur: 9 }] : [],
          }),
          draw: (st, api, ctx) => marks(st, api, ctx),
          extraSettled: (st, o) => anchorsCurrent(st, o),
        });
        mark("a2:window-mounted");
        win.setHome(home.lon, home.lat, home.zoom); win.setView(home.lon, home.lat, home.zoom);
        unhold();   // the window is in AtlasEmbed's `windows` now: it holds the hub itself
        if (tlSteps.length) mountTimeline(hub);
        host.querySelectorAll(".mc-btn").forEach((b) => b.addEventListener("click", (e) => {
          e.stopPropagation(); const w = b.getAttribute("data-mc");
          if (w === "home") win.goHome(); else if (w === "in") win.zoomBy(1.45); else if (w === "out") win.zoomBy(1 / 1.45);
          else if (w === "relief" && W.AtlasEmbed && W.AtlasEmbed.setWindowRelief) W.AtlasEmbed.setWindowRelief(!reliefNow().relief);
        }));
        /* THE RELIEF BUTTON (Oct 2026, on request) ships hidden in the markup and is shown only where relief CAN draw: the engine's WebGL2 path, and not under light mode or on a cellular connection (reliefNow's own rule). */
        const rb = host.querySelector(".mc-relief");
        if (rb && !lightReader && !onCellular && !(W.AtlasEmbed && W.AtlasEmbed.isCanvas2D && W.AtlasEmbed.isCanvas2D())) {
          rb.hidden = false; rb.setAttribute("aria-pressed", reliefNow().relief ? "true" : "false");
        }
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
    const { CARDS, CARD_BY_ID, GAME_MAX_DIFFICULTY, availableCardIdSet, cardDifficulty, cardDifficultyRank, cardMapSpec, cardSpanYears, cardWar, cardWarYears, checkAchievements, ensureData, esc, hashStr, markGamePlayed, mulberry32, prefersReducedMotion, route, save, seededShuffle, sfx, todayStr } = X;
  const FI2_AREA_MAX_DIFFICULTY = 3;   // = FINDIT_AREA_MAX_DIFFICULTY inside PAGES.map: "known to the interested"
  const fi2Hav = (lon1, lat1, lon2, lat2) => { const DEG = Math.PI / 180, dLa = (lat2 - lat1) * DEG, dLo = (lon2 - lon1) * DEG; const a = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(dLo / 2) * Math.sin(dLo / 2); return 2 * 6371 * Math.asin(Math.sqrt(a)); };
  /* ---------- FIND IT'S POOL: the register of every place any card names (moved here from app.js in Phase 5; it was v1's Personal-Atlas register, `atlasRegister`, and Find it's pools were its only reader once v1's page went) ----------
     One pass over the shipped cards' old `map` / `war` / `locator` fields — which the cards still carry (docs/atlas-v2-phase5-plan.md decision 1) — into `names` (a country by its lower-cased name → the cards naming it)
     and `marks` (a place's dot, a capital, a civilisation's extent, a war's side, a river or sea's name). Find it keeps only the dots and the extents. The rules are the ones the register always had, word for word where
     they decide what is in: a locator's name must be the card's answer or stand inside it as whole words; a region or a range that is not a polity is out; a river or a sea is a name, not a dot. */
  const MINE_POLITY = new Set(["culture", "people", "state", "dynasty", "empire", "civilisation"]);
  const nameFold = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/^the /, "");
  const nameFits = (name, answer) => { const n = nameFold(name), a = nameFold(answer); if (!n) return true; return n === a || (" " + a + " ").indexOf(" " + n + " ") >= 0; };
  function registerCard(X, cid, c, out) {
    const { cardMapSpec, cardWar, cardWarYears, cardLocator, cardSpanYears } = X;
    const title = String(c.answerText || "").trim() || String(cid);
    const spec = cardMapSpec(c);
    if (spec) {
      if (spec.layer === "world") spec.keys.forEach((k) => { const lk = k.toLowerCase(), e = out.names.get(lk); if (e) e.ids.push(cid); else out.names.set(lk, { id: cid, title: title, key: k, ids: [cid] }); });
      if (spec.dot) out.marks.push({ id: cid, title: title, kind: "dot", dot: spec.dot, layer: spec.layer, modern: true, cap: spec.def.what === "country", subcap: spec.def.what !== "country", y0: null, y1: null });
      return;
    }
    const war = cardWar(c), wy = war && !war.group ? cardWarYears(c) : null;
    if (war && wy) [["v", war.victors], ["l", war.losers]].forEach((pair) => { out.marks.push({ id: cid, title: title, kind: "war", side: pair[0], sideName: pair[1].name, keys: pair[1].keys, area: pair[1].area, y0: wy.y0, y1: wy.y1 }); });
    const loc = cardLocator(c);
    if (!loc) return;
    const ys = cardSpanYears(c), y0 = ys.length ? Math.min.apply(null, ys) : null;
    if (loc.kind !== "region" && loc.kind !== "shelf" && loc.kind !== "range" && !nameFits(loc.name, title)) return;
    if (loc.kind === "region" || loc.kind === "shelf") {
      const pol = String((c.tags || [])[0] || "").toLowerCase();
      if (!loc.area || !MINE_POLITY.has(pol)) return;
      const y1 = ys.length ? Math.max.apply(null, ys) : null;
      out.marks.push({ id: cid, title: loc.name || title, kind: "area", area: loc.area, at: loc.at, y0: y0, y1: y1, open: new Set(ys).size === 1 });
      return;
    }
    if (loc.kind === "river" || loc.kind === "sea") { out.marks.push({ id: cid, title: loc.name || title, kind: "water", at: loc.at, area: loc.area || null, y0: y0 }); return; }
    if (loc.kind === "range") return;
    out.marks.push({ id: cid, title: loc.name || title, kind: "dot", at: loc.at, battle: loc.kind === "battle", y0: y0 });
  }
  let regCache = null;
  function finditRegister(X) {
    const key = X.CARDS.length; if (regCache && regCache.key === key) return regCache.v;
    const out = { names: new Map(), marks: [] };
    X.CARDS.forEach((c0) => { const c = X.CARD_BY_ID[c0.id]; if (c) registerCard(X, c0.id, c, out); });
    regCache = { key, v: out }; return out;
  }
  const stackOrder = (X, ids) => { const yr = (id) => { const ys = X.cardSpanYears(X.CARD_BY_ID[id]); return ys.length ? Math.min.apply(null, ys) : Infinity; }; return ids.slice().sort((a, b) => X.cardDifficultyRank(a) - X.cardDifficultyRank(b) || yr(a) - yr(b) || (a < b ? -1 : a > b ? 1 : 0)); };
  const stackKey = (m) => { const t = String(m.title || "").trim().toLowerCase(); if (m.kind === "dot") return m.modern ? "c|" + String(m.dot || "").toLowerCase() + "|" + (m.cap ? 1 : 0) : "d|" + t; if (m.kind === "war") return "x|" + t + "|" + m.side; return m.kind.charAt(0) + "|" + t; };
  /* a capital's or a city's row in the card-faces dot tables (name → [lon, lat, state, printed name]); the first table of a layer wins, as the old two-table lookup did */
  const dotRow = (layer, name) => { const D = window.ATLAS_CARD_FACES && window.ATLAS_CARD_FACES.dots[layer]; return D && D[name] ? D[name] : null; };
  /* Find it's area rounds were scored on a polity's dated rings: the 90 of 104 area stacks that had a polity behind them are frozen in atlas/data/findit-areas.js (key: title | shown year → { slugs, rings }); an area with no entry is
     its card's own authored extent, as the 14 undated ones always were */
  const datedAreas = (title, yr) => { const T = window.ATLAS_FINDIT_AREAS && window.ATLAS_FINDIT_AREAS.areas; const a = T && T[title + "|" + yr]; return a ? { slugs: a.slugs, rings: a.rings } : null; };
  function fi2PointInRings(rings, lon, lat) { let inside = false; for (const ring of rings) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const yi = ring[i][1], yj = ring[j][1]; if ((yi > lat) !== (yj > lat)) { const xi = ring[i][0], xj = ring[j][0]; if (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside; } } return inside; }
  function fi2CountryDesc(name) { const k = (name || "").trim().toLowerCase().replace(/\s+/g, " "); return (window.COUNTRY_INFO || {})[k] || ""; }
  function fi2Pools() {
    const reg = finditRegister(X), avail = availableCardIdSet();
    const bbA = (rings) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; rings.forEach((ring) => ring.forEach((p) => { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; })); return (x1 - x0) * (y1 - y0); };
    const countryNames = new Set();
    reg.names.forEach((v, lk) => { if ((v.ids || [v.id]).some((id) => avail.has(id))) countryNames.add(lk); });
    const stacks = new Map();
    reg.marks.forEach((m) => {
      if (!avail.has(m.id) || !CARD_BY_ID[m.id]) return;
      const placeDot = m.kind === "dot" && (m.modern ? m.cap : Array.isArray(m.at));
      if (m.kind !== "area" && !placeDot) return;
      const k = stackKey(m); if (!stacks.has(k)) stacks.set(k, []); stacks.get(k).push(m);
    });
    const areas = [], places = [];
    stacks.forEach((ms) => {
      const bar = ms[0].kind === "area" ? FI2_AREA_MAX_DIFFICULTY : GAME_MAX_DIFFICULTY;
      if (!ms.some((m) => { const d = cardDifficulty(m.id); return d > 0 && d <= bar; })) return;
      const ids = stackOrder(X, ms.map((m) => m.id)), first = ms.find((m) => m.id === ids[0]) || ms[0];
      if (first.kind === "dot") {
        let at = first.at; if (first.modern) { const row = dotRow(first.layer, first.dot); at = row && [row[0], row[1]]; }
        if (!Array.isArray(at) || !isFinite(at[0]) || !isFinite(at[1])) return;
        places.push({ n: first.title, lon: at[0], lat: at[1], tol: first.cap ? 300 : 150, cap: !!first.cap, ids: ids }); return;
      }
      const y0s = ms.map((m) => m.y0).filter((v) => v != null), y1s = ms.map((m) => m.y1).filter((v) => v != null);
      if (!y0s.length) return;
      const y0 = Math.min.apply(null, y0s), y1 = y1s.length === ms.length ? Math.max.apply(null, y1s) : y0, yr = Math.round((y0 + y1) / 2);
      const dated = datedAreas(first.title, yr), slugs = dated ? dated.slugs : null, rings = dated ? dated.rings : first.area;
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
    const WL = (window.ATLAS_CARD_FACES && window.ATLAS_CARD_FACES.layers.world) || {}, pools = fi2Pools(), GEO2 = Object.keys(WL).map((n) => ({ n, a: WL[n][7] }));   // the world's shapes in the order v1's file listed them, each with the largest ring's box area (frozen from it)
    const countries = seededShuffle(GEO2.filter((g) => g.n && pools.countryNames.has(g.n.toLowerCase()) && fi2CountryDesc(g.n) && g.a > 30), rngC);
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
    const GREEN = "rgba(46,164,90,1)", RED = "rgba(224,68,56,1)", GOLD = "rgba(255,178,46,1)";
    /* THE PICK is the card windows' own selection: the gold tint (TINT_SEL), its outline and its glow, on a country or a state of the year alike (Oct 2026, the owner's phone: a pick was a blue wash that, on an area round, was one more colour among the states' own) */
    const SEL = X.TINT_SEL || { rgb: "255,178,46", fillA: 0.24, line: "rgba(255,192,74,1)", glow: "rgba(255,184,60,0.75)" };
    const TINT = { pick: { rgb: SEL.rgb.split(",").map(Number), a: SEL.fillA, line: SEL.line, glow: SEL.glow }, miss: { rgb: [224, 68, 56], a: 0.34 }, found: { rgb: [46, 164, 90], a: 0.34 }, answer: { rgb: [255, 178, 46], a: 0.38 } };
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
    let rounds = [], ri = 0, tries = 0, found = 0, firstTry = 0, lock = false, over = false, pick = null, win = null, hubRef = null, marks = [], pin = null, pickPin = null, pulse = null, disposed = false, shown = null;   // shown: an area round's rings, drawn by the window on the still renderer
    const reduced = () => prefersReducedMotion();
    const MAXY2 = new Date().getFullYear();
    const need = [ensureData("atlas2"), ensureData("atlas2embed"), ensureData("atlas2cards"), ensureData("atlas2prose"), ensureData("atlas2findit"), ensureData("atlas2countries")];
    const fail = () => { if (!root.isConnected) return; root.innerHTML = '<div class="data-loading dl-fail" role="alert"><strong>Find it could not be set up</strong><span class="dl-note">The map did not load. Check your connection and try again.</span><button class="btn" type="button" id="fi2Retry">Reload</button></div>'; const b = root.querySelector("#fi2Retry"); if (b) b.addEventListener("click", () => location.reload()); };   // the engine could not start at all (a refused bundle): a sentence, never a blank page
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
      const hl = []; for (const m of marks) if (m.ids && m.ids.length) hl.push({ ids: m.ids, rgb: m.tint.rgb, a: m.tint.a, exact: true, line: m.tint.line || "rgba(" + m.tint.rgb.join(",") + ",1)", lineWidth: 2.6, glow: m.tint.glow || "rgba(" + m.tint.rgb.join(",") + ",0.7)", glowBlur: 9 });
      return { layers: { borders: true, provinces: false, peoples: area ? "all" : "off", flat: area }, year: area ? r.shown : undefined, highlights: hl };
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
      if (shown && shown.rings) {   // the still renderer's area round: the extent as it stood, filled and outlined (the engine's own tint of a state of the year needs WebGL2 and the history)
        ctx.save(); ctx.beginPath();
        for (const rg of shown.rings) { let pen = false; for (const q of rg) { const p = api.project(q[0], q[1]); if (p[2] < 0) { pen = false; continue; } if (pen) ctx.lineTo(p[0], p[1]); else { ctx.moveTo(p[0], p[1]); pen = true; } } }
        ctx.fillStyle = "rgba(" + shown.tint.rgb.join(",") + "," + shown.tint.a + ")"; ctx.strokeStyle = "rgba(" + shown.tint.rgb.join(",") + ",1)"; ctx.lineWidth = 2; ctx.fill("evenodd"); ctx.stroke(); ctx.restore();
      }
      if (pickPin) { const p = api.project(pickPin[0], pickPin[1]); if (p[2] >= 0) {   // the pick where there is no region to light (a place round, a tap on no state of the year): the selection's gold, its tint, its glow
        ctx.save(); ctx.fillStyle = "rgba(" + SEL.rgb + "," + SEL.fillA + ")"; ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = SEL.line; ctx.lineWidth = 2.6; ctx.shadowColor = SEL.glow; ctx.shadowBlur = 9; ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, Math.PI * 2); ctx.moveTo(p[0] - 15, p[1]); ctx.lineTo(p[0] - 5, p[1]); ctx.moveTo(p[0] + 5, p[1]); ctx.lineTo(p[0] + 15, p[1]); ctx.moveTo(p[0], p[1] - 15); ctx.lineTo(p[0], p[1] - 5); ctx.moveTo(p[0], p[1] + 5); ctx.lineTo(p[0], p[1] + 15); ctx.stroke(); ctx.restore(); } }
      if (pin) { const p = api.project(pin.lon, pin.lat); if (p[2] >= 0) { ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, Math.PI * 2); ctx.fillStyle = pin.col; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = "rgba(60,40,0,.75)"; ctx.stroke(); ctx.font = "600 13px system-ui, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,255,255,0.94)"; ctx.strokeText(pin.name, p[0] + 11, p[1]); ctx.fillStyle = "#221808"; ctx.fillText(pin.name, p[0] + 11, p[1]); } }
      if (pulse) { const k = reduced() ? 0.5 : Math.min(1, (performance.now() - pulse.t0) / 900); const p = api.project(pulse.lon, pulse.lat); if (p[2] >= 0) ring(p[0], p[1], 8 + 36 * k, pulse.col.replace(/1\)$/, (1 - k).toFixed(2) + ")"), 3); if (k < 1) { win.schedule(); } else pulse = null; }
      ctx.restore();
    }
    // ---- the game (rules, scoring and wording as v1's) ----
    function clearPick() { pick = null; pickPin = null; marks = marks.filter((m) => !m.pick); confirmEl.hidden = true; clearEl.hidden = true; }
    function showRound() {
      const r = rounds[ri]; tries = 0; lock = false; pulse = null; marks = []; pin = null; shown = null; clearPick(); revealEl.hidden = true;
      roundEl.textContent = "Round " + (ri + 1) + " / " + rounds.length; scoreEl.textContent = found + " found";
      qEl.innerHTML = r.kind === "area" ? "Find <b>" + esc(r.n) + "</b> — as it stood in " + fi2Year(r.shown) : (r.kind === "point" && r.cap ? "Find the city of <b>" + esc(r.n) + "</b>" : "Find <b>" + esc(fi2Name(r.n)) + "</b>") + " on today's map";
      cart.textContent = r.kind === "area" ? "FULL ATLAS · " + fi2Year(r.shown) : "TODAY";
      fbEl.hidden = true; nextEl.hidden = true;
      if (r.kind === "area") fly(r.lon, r.lat, 1.6); else fly(15, 20, 1);
      win.schedule();
    }
    const targetIds = (r) => { if (r.kind === "entity") { const L = window.ATLAS_CARD_FACES && window.ATLAS_CARD_FACES.layers.world; const t = L && L[r.n]; return t ? [t[0]] : []; } if (r.kind === "area" && r.slugs && !(hubRef && hubRef.canvas2d)) return r.slugs.map((s) => "pol:" + s); return []; };   // the still renderer draws no history: an area round is scored on, and drawn from, its rings
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
      pickPin = marks.some((m) => m.pick) ? null : [ll[0], ll[1]];   // only the picked place is lit: a region where there is one under the tap, else the marker (a place round; a tap on no state of the year; an area round on the still renderer, which has no states to light)
      confirmEl.textContent = "Guess"; confirmEl.hidden = false; clearEl.hidden = false; sfx("click"); win.flash();   // the fill at once; the outline and glow follow within a few frames
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
    function fi2Target(r) { if (r.kind !== "entity") return [r.lon, r.lat]; const L = window.ATLAS_CARD_FACES && window.ATLAS_CARD_FACES.layers.world, g = L && L[r.n]; return g ? [g[1], g[2]] : null; }
    function reveal(r, ok) {
      lock = true; clearPick();
      const tgt = fi2Target(r), tint = ok ? TINT.found : TINT.answer, col = ok ? GREEN : GOLD;
      if (r.kind === "entity") { const t = targetIds(r); if (t.length) marks.push({ ids: t, tint }); }
      else if (r.kind === "area") { const t = targetIds(r); if (t.length) marks.push({ ids: t, tint }); else if (hubRef && hubRef.canvas2d && r.rings) shown = { rings: r.rings, tint }; }
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
      if (r.kind === "entity") { try { const reg = finditRegister(X), v = reg.names.get(r.n.toLowerCase()); if (v) ids = (v.ids || [v.id]).filter(Boolean); } catch (e) { ids = []; } }
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
      revealEl.querySelectorAll(".fi2-reveal-go").forEach((b) => b.addEventListener("click", () => route("map", { place: b.getAttribute("data-place") })));
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
  W.AtlasWindows = { startCardWindow, findIt, warFrontCards: () => [...WAR_FRONT_CARDS], timelineSteps, startStep, stepText };
})(window);
