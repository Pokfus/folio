/* atlas.js — Atlas v2's page: the scene, the input, the worker bridge, the tiles, the water and the relief (docs/atlas-v2-design.md §2.1, §2.7).

   Phase 1a scope (§7): the present-day earth from atlas/data/topology.bin at three resident levels
   and from atlas/data/tiles/<z>/<x>-<y>.bin at two finer ones, drawn by atlas-gl.js, with drag,
   wheel, pinch and keyboard, and a tap that names the country under it through the ID pass.
   Phase 1b adds the WATER (atlas/data/water.bin and atlas/data/water/<x>-<y>.bin: rivers and lakes,
   fetched the first time either layer is on) and the RELIEF (atlas/data/relief/: the L0 sheet once
   relief is on, L1 tiles for the view), and the minimal LAYERS control: relief with its strength,
   rivers, lakes, graticule — remembered per reader. Phase 1c adds the NAMES (atlas/data/gazetteer.js, the
   label layer on a 2D canvas over the globe, markers, the legend's density stops), PICKING (a tap reads two
   ID passes and stacks what is under the finger: lake, river, province, country, or the nearest sea on open
   water; a second tap cycles), the PLACE CARD (a side column, a bottom sheet on a phone; a country's prose,
   figures and footnotes through the host's own helpers), the LEGEND, SEARCH, DEEP LINKS
   (#map2/<lon>/<lat>/<zoom>/<place>) and a hidden list of buttons that mirrors the visible labels for the
   keyboard. No timeline and no study material — those are Phases 2–3. The page is reached at #map2; v1 at
   #map is untouched.

     window.AtlasV2.mount(root, { dataUrl, tileUrl, waterUrl, waterTileUrl, reliefUrl, gazetteerUrl, host })  → controller

   `host` is what app.js lends the mount (Phase 1c): { ensureData, dataReady, wireFootnotes, sanitizeHTML,
   sourceListHTML, esc, reducedMotion } — v1's helpers live inside app.js's closure, and the place card
   renders prose Folio authored for v1 (countries.js and its three siblings, a lazy bundle of their own that
   does not carry timeline.js) through the same sanitiser and footnote apparatus as every other surface.

   THE LABEL LAYER (§2.6, as built in 1c). Glyph advances are measured HERE, per label style, on the label
   canvas once the fonts are ready (and again on a theme change), and posted to the worker, which shapes
   every label glyph by glyph with the style's own tracking and lays the visible ones out — rank, then a
   greedy grid, never overlapping, capped by the density stop. A layout is asked for on settle (150 ms after
   the last input), on a zoom-level change and on a legend change; in between, every placed label is a
   SPRITE (rendered once, glyph by glyph, halo then ink, curved ones along their path) that the frame blits
   at its anchor's current screen position — so nothing is added or dropped while the globe moves, a label
   behind the horizon is simply not drawn, and one near the limb fades. The redraw of 250 labels is a few
   hundred drawImage calls, measured under LABEL_DRAW_BUDGET_MS at p95 in `stats()`.

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
  const LAYERS_KEY = "folio_atlas2_layers_v2";   // v2 (Phase 1c): the legend's fields replace the layers control's
  const PHONE = (() => { try { return matchMedia("(pointer: coarse)").matches && Math.min(screen.width, screen.height) < 768; } catch (e) { return false; } })();
  const TOUCH = (() => { try { return matchMedia("(pointer: coarse)").matches; } catch (e) { return false; } })();
  const RELIEF_MAX_LEVEL = PHONE ? 1 : 2;    // Q-M1 a: a phone never fetches L2
  const SETTLE_MS = 150;                     // a layout is asked for this long after the last input
  const HIT_MIN = TOUCH ? 44 : 0;            // a label's or marker's hit target is at least this wide on touch (§2.6)
  const LABEL_DRAW_BUDGET_MS = 3;            // the label canvas redraw at p95 (reported; test-atlas-labels.js asserts it)
  const LABEL_LAYOUT_BUDGET_MS = 50;         // the worker's layout at p95
  const KEY_LIST_MAX = 60;                   // the hidden button list mirrors at most this many labels
  const KIND_LABEL = { country: "Country", admin1: "Province or state", capital: "Capital", city: "City", town: "Town", sea: "Sea", ocean: "Ocean", strait: "Strait", gulf: "Gulf or bay", lake: "Lake", river: "River", island: "Island", "island-group": "Island group", range: "Mountain range", region: "Region" };
  /* THE LABEL STYLES (Q-L2 a): small capitals for territories and regions, italic for water, upright for
     cities, in the site's own font tokens — the display face for names of places, the serif for water.
     `size` is CSS px; `track` the letter spacing in px (ours, drawn glyph by glyph — never the canvas's
     letterSpacing); `caps` draws lower-case letters as capitals at `smallScale` of the size. */
  const STYLES = [
    { id: "country-l", face: "display", size: 17, weight: 700, caps: true, track: 2.4 },
    { id: "country-m", face: "display", size: 13.5, weight: 700, caps: true, track: 1.8 },
    { id: "country-s", face: "display", size: 11, weight: 700, caps: true, track: 1.1 },
    { id: "admin1", face: "display", size: 10.5, weight: 600, caps: true, track: 1.0 },
    { id: "capital", face: "sans", size: 12.5, weight: 700, caps: false, track: 0 },
    { id: "city", face: "sans", size: 11.5, weight: 600, caps: false, track: 0 },
    { id: "town", face: "sans", size: 10, weight: 500, caps: false, track: 0 },
    { id: "water-l", face: "serif", size: 15, weight: 400, italic: true, caps: false, track: 1.6 },
    { id: "water-m", face: "serif", size: 12.5, weight: 400, italic: true, caps: false, track: 0.8 },
    { id: "water-s", face: "serif", size: 11, weight: 400, italic: true, caps: false, track: 0.3 },
    { id: "river", face: "serif", size: 11, weight: 400, italic: true, caps: false, track: 0.2 },
    { id: "region-l", face: "display", size: 13, weight: 600, caps: true, track: 3.0 },
    { id: "region", face: "display", size: 10.5, weight: 600, caps: true, track: 1.8 },
    { id: "range", face: "display", size: 10.5, weight: 600, caps: true, track: 1.6 },
    { id: "island", face: "sans", size: 10, weight: 500, caps: false, track: 0.8 },
  ];
  const SMALL_SCALE = 0.78;
  // the characters measured per style: the Latin alphabet with its diacritics, digits and the punctuation the
  // sources use; anything else is measured on demand when the worker reports it missing
  const ALPHABET = (() => { let s = " .,'’-–()/&"; for (let c = 0x30; c <= 0x39; c++) s += String.fromCharCode(c); for (let c = 0x41; c <= 0x5a; c++) s += String.fromCharCode(c); for (let c = 0x61; c <= 0x7a; c++) s += String.fromCharCode(c); for (let c = 0xc0; c <= 0x17f; c++) s += String.fromCharCode(c); return [...new Set([...s])]; })();

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
  // the legend (Phase 1c): borders, provinces, the three name groups, cities, rivers, lakes, relief with its
  // strength, graticule, label density — remembered per reader, behind try/catch like every localStorage read
  const DEFAULT_LAYERS = { borders: true, provinces: true, countries: true, places: true, physical: true, cities: true, rivers: true, lakes: true, relief: false, strength: 0.7, graticule: false, density: "normal" };
  function loadLayers() {
    try { const v = JSON.parse(localStorage.getItem(LAYERS_KEY) || "null"); if (v && typeof v === "object") { const o = Object.assign({}, DEFAULT_LAYERS, v); if (!/^(sparse|normal|dense)$/.test(o.density)) o.density = "normal"; return o; } } catch (e) {}
    return Object.assign({}, DEFAULT_LAYERS);
  }
  function saveLayers(l) { try { localStorage.setItem(LAYERS_KEY, JSON.stringify(l)); } catch (e) {} }
  // diacritic-folded, lower-cased, for the search box (Phase 1c): "Zürich" and "zurich" are one key
  function fold(s) { try { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); } catch (e) { return String(s || "").toLowerCase(); } }
  /* v1's rule for a country's title (app.js officialName, which lives inside the Atlas page's closure and is
     copied here rather than reached): the full legal name from the summary's "officially …", else the name
     before ", commonly known as …" when it reads like a state's name, else the short name. */
  function officialName(shortName, desc) {
    desc = desc || "";
    let m = /\bofficially\s+(?:the\s+|known\s+as\s+|called\s+)?(.+?)\s*[,(.;:]/i.exec(desc);
    if (m && m[1]) { const o = m[1].trim().replace(/^the\s+/i, ""); if (o.length >= 3 && o.length <= 80) return o; }
    m = /^(?:The\s+)?(.+?),\s+(?:commonly|also|sometimes|formally|or\s+simply|or)\s+(?:known\s+as|called)?/i.exec(desc);
    if (m && m[1]) {
      const o = m[1].trim().replace(/^the\s+/i, ""), sn = (shortName || "").toLowerCase();
      const looksOfficial = o.toLowerCase().indexOf(sn) >= 0 || /\b(Republic|Kingdom|Union|Federation|Emirates|States|Commonwealth|Empire|Sultanate|Principality|Confederation|Dominion)\b/i.test(o);
      if (o.length >= 5 && o.length <= 80 && o.toLowerCase() !== sn && looksOfficial) return o;
    }
    return shortName;
  }
  // v1's stripInfoNoise: drop "(Language: name)" parentheticals and any sentence quoting a figure the grid shows
  function stripInfoNoise(s) {
    if (!s) return "";
    s = s.replace(/\s*\([^)]*:[^)]*\)/g, "");
    const parts = s.split(/(?<=[.!?])\s+/);
    const grid = /[$€£]\s?\d|\d[\d.,]*\s*(?:million|billion|trillion)\b|\d[\d.,]*\s*(?:km²|km2|sq\.?\s?mi|sq\.?\s?km|square\s?kilomet|square\s?mile)/i;
    const kept = parts.filter((t) => !grid.test(t));
    return (kept.length ? kept.join(" ") : s).replace(/\s{2,}/g, " ").trim();
  }
  // v1's statNum: the leading figure of a formatted stat ("41.45 million", "$20.5B", "49,710"), or NaN
  function statNum(s) {
    const t = String(s == null ? "" : s).trim().replace(/^[$€£]\s?/, "").replace(/,/g, "").toLowerCase();
    const m = /^([\d.]+)\s*(trillion|t|billion|b|million|m|thousand|k)?/.exec(t); if (!m) return NaN;
    let v = parseFloat(m[1]); if (isNaN(v)) return NaN;
    const u = m[2] || ""; v *= u === "trillion" || u === "t" ? 1e12 : u === "billion" || u === "b" ? 1e9 : u === "million" || u === "m" ? 1e6 : u === "thousand" || u === "k" ? 1e3 : 1;
    return v;
  }
  function escText(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m])); }

  function mount(host, opts) {
    opts = opts || {};
    const dataUrl = opts.dataUrl || "atlas/data/topology.bin";
    const tileUrl = opts.tileUrl || "atlas/data/tiles/";
    const waterUrl = opts.waterUrl || "atlas/data/water.bin";
    const waterTileUrl = opts.waterTileUrl || "atlas/data/water/";
    const reliefUrl = opts.reliefUrl || "atlas/data/relief/";
    const gazetteerUrl = opts.gazetteerUrl || "atlas/data/gazetteer.js";
    const H = opts.host || {};
    host.innerHTML = `
      <div class="atlas2${PHONE ? " atlas2-phone" : ""}" role="region" aria-label="Atlas (preview)">
        <canvas class="atlas2-canvas" tabindex="0" role="application" aria-label="Interactive globe — drag to turn, scroll or pinch to zoom, arrow keys turn, plus and minus zoom, Home resets; Tab walks the names on the map"></canvas>
        <canvas class="atlas2-labels" aria-hidden="true"></canvas>
        <div class="atlas2-search">
          <input type="search" class="atlas2-search-in" placeholder="Find a place" aria-label="Find a place" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="atlas2-results" aria-autocomplete="list">
          <ul class="atlas2-results" id="atlas2-results" role="listbox" hidden></ul>
        </div>
        <div class="atlas2-zoom" aria-hidden="true">
          <button type="button" class="atlas2-btn" data-zoom="in" title="Zoom in">+</button>
          <button type="button" class="atlas2-btn" data-zoom="out" title="Zoom out">−</button>
          <button type="button" class="atlas2-btn" data-zoom="home" title="Whole earth">⌂</button>
        </div>
        <div class="atlas2-layers">
          <button type="button" class="atlas2-btn atlas2-layers-btn" aria-expanded="false" aria-controls="atlas2-sheet" title="Legend">${PHONE ? "Legend" : "≡"}</button>
          <div class="atlas2-sheet" id="atlas2-sheet" hidden>
            <div class="atlas2-sheet-head"><strong>Legend</strong><button type="button" class="atlas2-sheet-close" aria-label="Close the legend">×</button></div>
            <label><input type="checkbox" data-layer="borders"> Borders</label>
            <label><input type="checkbox" data-layer="provinces"> Provinces</label>
            <fieldset class="atlas2-group"><legend>Names</legend>
              <label><input type="checkbox" data-layer="countries"> Countries</label>
              <label><input type="checkbox" data-layer="places"> Places</label>
              <label><input type="checkbox" data-layer="physical"> Physical</label>
            </fieldset>
            <label><input type="checkbox" data-layer="cities"> Cities</label>
            <label><input type="checkbox" data-layer="rivers"> Rivers</label>
            <label><input type="checkbox" data-layer="lakes"> Lakes</label>
            <label><input type="checkbox" data-layer="relief"> Relief</label>
            <label class="atlas2-strength"><span>Strength</span><input type="range" data-layer="strength" min="0.2" max="1" step="0.05" aria-label="Relief strength"></label>
            <label><input type="checkbox" data-layer="graticule"> Graticule</label>
            <fieldset class="atlas2-group atlas2-density"><legend>Label density</legend>
              <label><input type="radio" name="atlas2-density" data-layer="density" value="sparse"> Sparse</label>
              <label><input type="radio" name="atlas2-density" data-layer="density" value="normal"> Normal</label>
              <label><input type="radio" name="atlas2-density" data-layer="density" value="dense"> Dense</label>
            </fieldset>
            <p class="atlas2-layers-note" hidden></p>
          </div>
        </div>
        <button type="button" class="atlas2-stack" hidden aria-live="polite"></button>
        <div class="atlas2-status" role="status" aria-live="polite"><span class="atlas2-bar"><i></i></span><span class="atlas2-note">Fetching the earth…</span></div>
        <div class="atlas2-caption" aria-live="polite"></div>
        <aside class="atlas2-card" hidden aria-label="Place">
          <button type="button" class="atlas2-grip" aria-label="Expand or collapse the place card"><i></i></button>
          <div class="atlas2-card-head"><div class="atlas2-card-titles"><h2 class="atlas2-card-title"></h2><p class="atlas2-card-kind"></p></div><button type="button" class="atlas2-card-close" aria-label="Close">×</button></div>
          <div class="atlas2-card-body"></div>
        </aside>
        <div class="atlas2-keys vh" aria-label="Places named on the map"><ul></ul></div>
        <pre class="atlas2-perf" hidden aria-hidden="true"></pre>
      </div>`;
    const el = host.querySelector(".atlas2"), canvas = el.querySelector(".atlas2-canvas"), status = el.querySelector(".atlas2-status"), note = el.querySelector(".atlas2-note"), bar = el.querySelector(".atlas2-bar i"), caption = el.querySelector(".atlas2-caption"), perfEl = el.querySelector(".atlas2-perf");
    const sheet = el.querySelector(".atlas2-sheet"), layersBtn = el.querySelector(".atlas2-layers-btn"), layersNote = el.querySelector(".atlas2-layers-note");
    const labelCanvas = el.querySelector(".atlas2-labels"), lctx = labelCanvas.getContext("2d");
    const stackBtn = el.querySelector(".atlas2-stack"), cardEl = el.querySelector(".atlas2-card"), cardTitle = el.querySelector(".atlas2-card-title"), cardKind = el.querySelector(".atlas2-card-kind"), cardBody = el.querySelector(".atlas2-card-body"), keysUl = el.querySelector(".atlas2-keys ul");
    const searchIn = el.querySelector(".atlas2-search-in"), resultsUl = el.querySelector(".atlas2-results");
    const say = (t, frac) => { note.textContent = t; if (frac != null) { bar.style.width = Math.round(frac * 100) + "%"; bar.parentNode.hidden = false; } };
    const fail = (t) => { status.classList.add("atlas2-fail"); bar.parentNode.hidden = true; note.textContent = t; };

    const R = root.AtlasGL.create(canvas, { antialias: opts.antialias, onRestore: () => restoreAfterLoss() });
    if (!R) { fail("This browser has no WebGL2, which the new Atlas needs. The current Atlas at #map still works."); return { dispose() {} }; }
    let palette = readPalette();
    R.setPalette(palette);
    R.setRamp(buildRamp());

    /* ---------- view and layers ---------- */
    const layers = loadLayers();
    const view = { lon: 10, lat: 20, zoom: 1, graticule: layers.graticule, level: 0, admin1: false, borders: layers.borders, kmpp: 24, tiles: [], parents: [], waterTiles: [], rivers: layers.rivers, lakes: layers.lakes, smoothRivers: false, relief: { on: layers.relief, strength: layers.strength, fade: 1, tiles: [] }, radius: 100, cx: 0, cy: 0, rot: new Float32Array(9) };
    let cssW = 0, cssH = 0, base = 100, dprNow = 1;
    function layout() {
      const r = el.getBoundingClientRect();
      cssW = Math.max(1, Math.round(r.width)); cssH = Math.max(1, Math.round(r.height));
      dprNow = Math.min(2, window.devicePixelRatio || 1);
      R.resize(cssW, cssH, window.devicePixelRatio || 1);
      labelCanvas.width = Math.round(cssW * dprNow); labelCanvas.height = Math.round(cssH * dprNow);
      base = Math.min(cssW, cssH) * 0.46;
      view.cx = cssW / 2; view.cy = cssH / 2;
      needs = true;
      requestLayout("resize");
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
      invalidate();   // not a bare needs = true: a pinch reaches here with no frame scheduled, and set the zoom without a redraw until something else asked for one (Phase 1c)
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
      return { want, arrived, failed, cache, pending, get stats() { return { bytes, fetched, evicted, errors, pending: pending.size, resident: cache.size }; }, abortAll() { for (const ac of pending.values()) { try { if (ac) ac.abort(); } catch (e) {} } }, reset() { cache.clear(); } };
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
    const stats = { frames: [], draw: [], uploads: {}, worker: null, fetchMs: 0, firstPaintMs: 0, ready: false, level: 0, tiles: [], tileErrors: 0, water: null, waterFetchMs: 0, relief: null, labelLayout: [], labelSprite: [], labelDraw: [], gazetteer: null };
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
        drawLabels();
        if (!stats.firstPaintMs && R.levelLoaded(0)) stats.firstPaintMs = Math.round(performance.now() - t0);
        if (perfOn) perfText();
      }
      if (coasting) { coast(); }
      if (flying) { fly(t); }
      if (needs || coasting || flying) raf = requestAnimationFrame(frame); else lastT = 0;
    }
    // the view's derived state: level, admin-1 visibility, the tiles it wants (requested at once), the water and
    // relief it wants. Run by every frame and by setView, so `tilesSettled()` right after a setView already asks
    // about the NEW tiles
    function plan() {
      clampView();
      view.radius = base * view.zoom; rotation();
      const k = kmPerPx();
      view.kmpp = k;
      // a finer level is not taken up while two fingers are down: a pinch from the globe crosses into LOD 1 at 16 km/px
      // and every frame of it would draw four times the primitives at full-screen fill — the finer level comes on release,
      // as a map app's tiles do (a coarser level is taken at once: it is the cheaper one)
      const wanted = levelFor(k), level = (ptrs.size >= 2 && wanted > view.level) ? view.level : wanted;
      if (level !== view.level) { view.level = level; requestLayout("level"); }
      view.admin1 = layers.provinces && k < ADMIN1_KM_PER_PX;
      view.borders = layers.borders;
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
        `lakes culled: ${s.lakeCulled} tri  ${s.lakeSegCulled} seg (under ${2} px²)\n` +
        `labels: ${L.placed.length} placed of ${L.candidates} (${layers.density}${PHONE ? ", phone" : ""})  layout ${L.lastLayoutMs.toFixed(1)} ms (p95 ${pct95(stats.labelLayout).toFixed(1)})  sprites ${(L.lastSpriteMs || 0).toFixed(1)} ms (p95 ${pct95(stats.labelSprite).toFixed(1)})  draw ${L.lastDrawMs.toFixed(2)} ms (p95 ${pct95(stats.labelDraw).toFixed(2)})\n` +
        `heap ${heapMB() == null ? "n/a" : heapMB() + " MB"}  dpr ${Math.min(2, window.devicePixelRatio || 1)}  ${cssW}×${cssH}${PHONE ? "  phone" : ""}`;
    }
    const pct95 = (arr) => { if (!arr.length) return 0; const a = arr.slice().sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(0.95 * a.length))]; };
    const heapMB = () => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null);
    function setPerf(on) { perfOn = on; perfEl.hidden = !on; if (on) perfText(); }

    /* ---------- the legend (Phase 1c; the layers control until then) ---------- */
    const inputs = {}; sheet.querySelectorAll("[data-layer]").forEach((i) => { const k = i.getAttribute("data-layer"); if (k === "density") (inputs.density = inputs.density || []).push(i); else inputs[k] = i; });
    function reflectLayers() {
      for (const k of ["borders", "provinces", "countries", "places", "physical", "cities", "rivers", "lakes", "relief", "graticule"]) inputs[k].checked = !!layers[k];
      inputs.strength.value = String(layers.strength); inputs.strength.disabled = !layers.relief;
      for (const r of inputs.density) r.checked = r.value === layers.density;
    }
    function setLayers(patch) {
      const before = JSON.stringify(layers);
      Object.assign(layers, patch);
      layers.strength = Math.max(0.2, Math.min(1, Number(layers.strength) || DEFAULT_LAYERS.strength));
      if (!/^(sparse|normal|dense)$/.test(layers.density)) layers.density = "normal";
      view.graticule = layers.graticule;
      saveLayers(layers); reflectLayers(); invalidate();
      if (JSON.stringify(layers) !== before) requestLayout("legend", true);
    }
    reflectLayers();
    const openSheet = (open) => { sheet.hidden = !open; layersBtn.setAttribute("aria-expanded", String(open)); if (open && PHONE) closeCard(); };
    layersBtn.addEventListener("click", () => openSheet(sheet.hidden));
    el.querySelector(".atlas2-sheet-close").addEventListener("click", () => openSheet(false));
    sheet.addEventListener("change", (e) => { const k = e.target.getAttribute("data-layer"); if (!k) return; setLayers({ [k]: e.target.type === "checkbox" ? e.target.checked : e.target.type === "radio" ? e.target.value : Number(e.target.value) }); });
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
      if (!ptrs.has(e.pointerId)) { if (e.pointerType === "mouse") { const rect = canvas.getBoundingClientRect(); hoverAt(e.clientX - rect.left, e.clientY - rect.top); } return; }
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const rect = canvas.getBoundingClientRect();
      touched();
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
      if (wasDrag && !moved && e.type === "pointerup") { const rect = canvas.getBoundingClientRect(); pickAt(e.clientX - rect.left, e.clientY - rect.top); return; }
      if (wasDrag && moved && (performance.now() - lastMoveT) < 60 && Math.hypot(velLon, velLat) > 0.02) { coasting = true; invalidate(); }
      touched();
    }
    canvas.addEventListener("pointerup", ptrUp); canvas.addEventListener("pointercancel", ptrUp);
    function coast() {
      view.lon += velLon * 16; view.lat += velLat * 16; velLon *= 0.92; velLat *= 0.92;
      if (Math.hypot(velLon, velLat) < 0.002) { coasting = false; touched(); }
      needs = true;
    }
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const f = Math.exp(-Math.max(-120, Math.min(120, e.deltaY)) * 0.0025);
      zoomAt(f, e.clientX - rect.left, e.clientY - rect.top);
      invalidate(); touched();
    }, { passive: false });
    canvas.addEventListener("keydown", (e) => {
      const step = 6 / view.zoom;
      let used = true;
      if (e.key === "ArrowLeft") view.lon -= step; else if (e.key === "ArrowRight") view.lon += step;
      else if (e.key === "ArrowUp") view.lat += step; else if (e.key === "ArrowDown") view.lat -= step;
      else if (e.key === "+" || e.key === "=") zoomAt(1.25); else if (e.key === "-" || e.key === "_") zoomAt(1 / 1.25);
      else if (e.key === "Home" || e.key === "0") { view.lon = 10; view.lat = 20; view.zoom = 1; }
      else if (e.key === "Escape") clearSelection();
      else if (e.key === "p" || e.key === "P") setPerf(!perfOn);
      else if (e.key === "r" || e.key === "R") setLayers({ relief: !layers.relief });
      else used = false;
      if (used) { e.preventDefault(); clampView(); invalidate(); touched(); }
    });
    // Escape anywhere in the Atlas (the card, the search box, the key list) clears the selection and shuts the card
    el.addEventListener("keydown", (e) => { if (e.key === "Escape" && e.target !== canvas) { if (e.target === searchIn && !resultsUl.hidden) { closeResults(); return; } clearSelection(); canvas.focus({ preventScroll: true }); } });
    el.querySelectorAll("[data-zoom]").forEach((b) => b.addEventListener("click", () => {
      const z = b.getAttribute("data-zoom");
      if (z === "in") zoomAt(1.5); else if (z === "out") zoomAt(1 / 1.5); else { view.lon = 10; view.lat = 20; view.zoom = 1; clampView(); }
      invalidate(); touched();
    }));

    let header = null, faceEntity = null, waterHeader = null, waterFaceEntity = null, arcRiver = null;
    // the v1-era pick, kept for the perf suite's smoke test: the country under (x, y) by the faces pass
    function pick(x, y) { pickAt(x, y); }

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
        faceOfEntity = new Map(); for (let i = 0; i < faceEntity.length; i++) if (!faceOfEntity.has(faceEntity[i])) faceOfEntity.set(faceEntity[i], i);
        entityIndexById = new Map(header.entities.map((e, i) => [e.id, i]));
        if (pendingZoom) { view.zoom = pendingZoom; pendingZoom = 0; clampView(); plan(); invalidate(); }   // a deep link's zoom past the old floor, now that the tile index says the cap is 150 m/px
        if (!gazStarted) startGazetteer();
        say("Shaping the land…", 0.35); return;
      }
      if (m.type === "gazetteer") { gazInWorker = true; requestLayout("gazetteer", true); return; }
      if (m.type === "layout") { applyLayout(m); return; }
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
        waterHeader = m.header; waterFaceEntity = m.faceEntity || null; arcRiver = m.arcRiver || null;
        const t = waterHeader.tiles && waterHeader.tiles[Object.keys(waterHeader.tiles)[0]];
        if (t) waterIndex = { cols: t.cols, rows: t.rows, present: new Set(t.present) };
        stats.water = { parseMs: m.parseMs, levels: [], entities: waterHeader.entities.length, rivers: (waterHeader.rivers || []).length };
        requestLayout("water", true);
        return;
      }
      if (m.type === "water-lod") {
        const d = { lakeSegs: m.lakeSegs, lakeRange: m.lakeRange, lakeCap: m.lakeCap, riverSegs: m.riverSegs, riverRange: m.riverRange, riverCap: m.riverCap, facePos: m.facePos, faceIdx: m.faceIdx, faceRange: m.faceRange, faceCap: m.faceCap, lakeBins: m.lakeBins || null };
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
      if (m.type === "done") { stats.worker = m.stats; stats.ready = true; status.hidden = true; el.setAttribute("data-ready", "1"); if (pendingPlace && G.ready) { selectById(pendingPlace, { open: true, fly: false, push: false }); pendingPlace = null; } invalidate(); requestLayout("ready", true); }
    }
    /* a restored GL context (Phase 1c): the renderer dropped everything; the worker sends the resident levels
       again from the files it kept, the loaders fetch their tiles again, relief is asked for again */
    function restoreAfterLoss() {
      landTiles.reset(); waterTiles.reset(); reliefTiles.reset();
      postToWorker({ type: "rebuild" });
      if (layers.relief && reliefIndex) reliefTiles.want(["0"]);
      invalidate();
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

    /* ================= Phase 1c: names, picking, the place card, search, deep links, the keyboard =================
       (docs/atlas-v2-design.md §2.6, §2.8, §2.9 and §7 "Phase 1c — as built"; the worker's half is in atlas-worker.js) */
    const G = { rows: [], byId: new Map(), byRiver: new Map(), ready: false };
    const L = { placed: [], live: [], candidates: 0, cap: 0, seq: 0, lastLayoutMs: 0, lastDrawMs: 0, keyIds: "" };
    const STYLE_BY_ID = Object.fromEntries(STYLES.map((s) => [s.id, s]));
    let gazStarted = false, gazInWorker = false, faceOfEntity = null, entityIndexById = null, pendingPlace = null, pendingZoom = 0, focusId = null, flying = null, lastWrittenHash = null;
    const sel = { id: null, stack: [], index: 0, at: null, t: 0 };
    const layoutWaiters = [];
    const reduced = () => { try { return H.reducedMotion ? !!H.reducedMotion() : matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

    /* ---- the gazetteer: a plain script assigning window.ATLAS_GAZETTEER, read here and posted to the worker ---- */
    function startGazetteer() {
      gazStarted = true;
      const t = performance.now();
      loadScript(gazetteerUrl).then(() => {
        const T = root.ATLAS_GAZETTEER;
        if (!T || !Array.isArray(T.rows) || !Array.isArray(T.cols)) throw new Error("no table");
        G.rows = T.rows.map((r, i) => { const o = { i }; T.cols.forEach((c, j) => { o[c] = r[j] == null ? 0 : r[j]; }); o.key = fold(o.name); o.akeys = (o.aliases || []).map(fold); if (o.qid) o.qid = "Q" + o.qid; return o; });
        for (const o of G.rows) if (typeof o.within === "number") o.within = o.within > 0 && G.rows[o.within - 1] ? G.rows[o.within - 1].id : 0;   // the table stores the container's row index + 1
        for (const r of G.rows) { G.byId.set(r.id, r); if (typeof r.geom === "string" && r.geom[0] === "r") G.byRiver.set(Number(r.geom.slice(1)), r); }
        G.ready = true;
        stats.gazetteer = { rows: G.rows.length, ms: Math.round(performance.now() - t) };
        if (pendingPlace && stats.ready) { selectById(pendingPlace, { open: true, fly: false, push: false }); pendingPlace = null; }
        postToWorker({ type: "gazetteer", table: T });
        measureMetrics();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!disposed) measureMetrics(); });
      }).catch((e) => { layersNote.hidden = false; layersNote.textContent = "The place names didn’t arrive (" + (e && e.message ? e.message : e) + ")."; });
    }
    const entityOf = (id) => (entityIndexById ? entityIndexById.get(id) : null);
    function faceOfId(id) { const i = entityOf(id); return i == null || !faceOfEntity ? null : (faceOfEntity.has(i) ? faceOfEntity.get(i) : null); }

    /* ---- glyph metrics: every style's advances, measured on the label canvas, posted to the worker ---- */
    let faces = themeFaces(), metricsSent = 0;
    const extraChars = new Set();
    function themeFaces() {
      const cs = getComputedStyle(document.body);
      const g = (n, d) => cs.getPropertyValue(n).trim() || d;
      return { display: g("--display", "system-ui, sans-serif"), sans: g("--sans", "system-ui, sans-serif"), serif: g("--serif", "Georgia, serif") };
    }
    const fontOf = (st, px) => `${st.italic ? "italic " : ""}${st.weight} ${px}px ${faces[st.face]}`;   // ctx.font must carry a pixel size
    function measureMetrics() {
      faces = themeFaces();
      const styles = {};
      const chars = [...ALPHABET, ...extraChars];
      for (const st of STYLES) {
        const adv = {}, advSmall = {};
        lctx.font = fontOf(st, st.size);
        for (const ch of chars) adv[ch] = lctx.measureText(ch).width;
        if (st.caps) { lctx.font = fontOf(st, st.size * SMALL_SCALE); for (const ch of chars) advSmall[ch] = lctx.measureText(ch).width; }
        styles[st.id] = { id: st.id, size: st.size, caps: !!st.caps, smallScale: SMALL_SCALE, track: st.track, adv, advSmall };
      }
      metricsSent++;
      postToWorker({ type: "metrics", styles });
      requestLayout("metrics", true);
    }

    /* ---- asking for a layout: on settle, on a level change, on a legend change, now or after SETTLE_MS ---- */
    let layoutTimer = 0, layoutSeq = 0, lastLevelLayout = 0, layoutHeld = null;
    // "moving" is the pointer's state, not a quiet clock: on a slow machine a drag's moves can be 150 ms apart
    // and a settle timer would lay out between them (measured: one layout per move on the CI-class runner)
    const moving = () => dragging || ptrs.size > 0 || coasting || !!flying;
    function requestLayout(reason, now) {
      if (disposed) return;
      if (reason === "level") { const t = performance.now(); if (t - lastLevelLayout < 100) return; lastLevelLayout = t; now = true; }
      if (moving() && reason !== "level") { layoutHeld = reason; return; }
      if (layoutTimer) { clearTimeout(layoutTimer); layoutTimer = 0; }
      if (now) { sendLayout(reason); return; }
      layoutTimer = setTimeout(() => { layoutTimer = 0; if (moving()) { layoutHeld = reason; return; } sendLayout(reason); }, SETTLE_MS);
    }
    function touched() { if (moving()) { layoutHeld = "settle"; return; } requestLayout(layoutHeld || "settle"); layoutHeld = null; }
    function sendLayout(reason) {
      if (!gazInWorker || !metricsSent || disposed) return;
      plan();
      const seq = ++layoutSeq;
      L.sentAt = performance.now();
      postToWorker({ type: "layout", seq, reason, rot: Float32Array.from(view.rot), radius: view.radius, cx: view.cx, cy: view.cy, W: cssW, H: cssH, kmpp: view.kmpp, level: view.level, density: layers.density, phone: PHONE, show: { countries: layers.countries, places: layers.places, physical: layers.physical, cities: layers.cities, provinces: layers.provinces, rivers: layers.rivers, lakes: layers.lakes }, admin1: view.admin1, riversDrawn: view.rivers, selected: sel.id, debug: !!L.debug });
      if (reason === "settle" || reason === "level") writeHash(false);
    }
    function applyLayout(m) {
      if (m.seq !== layoutSeq) { if (m.seq < layoutSeq) return; }   // a newer request is on its way: this one is stale
      L.lastLayoutMs = m.ms || 0; stats.labelLayout.push(L.lastLayoutMs); if (stats.labelLayout.length > 600) stats.labelLayout.shift();
      L.candidates = m.candidates || 0; L.cap = m.cap || 0; L.seq = m.seq; L.why = m.why || null;
      const t0 = performance.now();
      for (const p of m.placed) { p.chars = [...p.text]; p.sprite = renderSprite(p); }
      L.lastSpriteMs = performance.now() - t0; stats.labelSprite.push(L.lastSpriteMs); if (stats.labelSprite.length > 600) stats.labelSprite.shift();
      L.placed = m.placed;
      if (m.missing && m.missing.length) { let grew = false; for (const [, ch] of m.missing) if (!extraChars.has(ch)) { extraChars.add(ch); grew = true; } if (grew && extraChars.size < 400) measureMetrics(); }
      updateKeys();
      invalidate();
      while (layoutWaiters.length) layoutWaiters.shift()(L.placed);
    }

    /* ---- sprites: a label rendered once, glyph by glyph, halo then ink, at its layout position ---- */
    let haloCss = "", inkCss = "", waterCss = "", selCss = "";
    function labelColours() {
      const { ink, paper, paper2, indigo, ochre, dark } = themeTokens();
      const hex = (c) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0")).join("");
      haloCss = hex(dark ? paper : paper);
      inkCss = hex(ink);
      // water names: a deep blue-ink in a light theme, a pale blue in a dark one — read against both the sea and the land
      waterCss = hex(dark ? mix([0.55, 0.8, 1], paper, 0.12) : mix(ink, [31 / 255, 122 / 255, 170 / 255], 0.5));
      selCss = hex(dark ? mix(paper, ochre, 0.5) : mix(ink, ochre, 0.55));
      void paper2; void indigo;
    }
    labelColours();
    const WATER_KINDS = { sea: 1, ocean: 1, gulf: 1, strait: 1, lake: 1, river: 1 };
    const inkFor = (p) => (p.id === sel.id ? selCss : WATER_KINDS[p.kind] ? waterCss : inkCss);
    function renderSprite(p) {
      if (!p.glyphs || !p.glyphs.length) return null;
      const st = STYLE_BY_ID[p.style]; if (!st) return null;
      const pad = 4, x0 = Math.floor(p.box[0]) - pad, y0 = Math.floor(p.box[1]) - pad;
      const w = Math.ceil(p.box[2]) - x0 + pad, h = Math.ceil(p.box[3]) - y0 + pad;
      const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w * dprNow)); c.height = Math.max(1, Math.ceil(h * dprNow));
      const x = c.getContext("2d");
      x.scale(dprNow, dprNow); x.translate(-x0, -y0);
      x.textBaseline = "middle"; x.textAlign = "left"; x.lineJoin = "round"; x.lineCap = "round";
      x.lineWidth = p.id === sel.id ? 3.4 : 2.6; x.strokeStyle = haloCss; x.fillStyle = inkFor(p);
      const fontBig = fontOf(st, st.size), fontSmall = st.caps ? fontOf(st, st.size * SMALL_SCALE) : fontBig;
      for (const pass of [0, 1]) {   // every halo first, then every glyph, so a halo never bites a neighbour
        for (let i = 0; i < p.glyphs.length; i++) {
          const g = p.glyphs[i], ch = p.chars[i]; if (ch == null) continue;
          x.font = g[3] ? fontSmall : fontBig;
          if (g[2]) { x.save(); x.translate(g[0], g[1]); x.rotate(g[2]); if (pass) x.fillText(ch, 0, 0); else x.strokeText(ch, 0, 0); x.restore(); }
          else if (pass) x.fillText(ch, g[0], g[1]); else x.strokeText(ch, g[0], g[1]);
        }
      }
      return { c, x0, y0, w, h };
    }
    function drawMarker(ctx, x, y, r, kind, hot) {
      ctx.fillStyle = hot ? selCss : inkCss; ctx.strokeStyle = haloCss; ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (kind === "capital") ctx.rect(x - r, y - r, 2 * r, 2 * r); else ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
    /* every frame: each placed label at its anchor's CURRENT position (a translation — the layout is only
       recomputed on settle), skipped behind the horizon, faded near the limb; the live hit rects are kept */
    function drawLabels() {
      const t = performance.now();
      const ctx = lctx;
      ctx.setTransform(dprNow, 0, 0, dprNow, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      const rot = view.rot, r = view.radius, cx = view.cx, cy = view.cy;
      const live = [];
      for (const p of L.placed) {
        const a = p.a; if (!a) continue;
        const z = rot[6] * a[0] + rot[7] * a[1] + rot[8] * a[2];
        if (z < 0.005) continue;
        const sx = cx + (rot[0] * a[0] + rot[1] * a[1] + rot[2] * a[2]) * r, sy = cy - (rot[3] * a[0] + rot[4] * a[1] + rot[5] * a[2]) * r;
        const dx = sx - p.sx, dy = sy - p.sy;
        ctx.globalAlpha = Math.min(1, z / 0.2);
        if (p.marker) drawMarker(ctx, p.marker[0] + dx, p.marker[1] + dy, p.marker[2], p.marker[3], p.id === sel.id);
        if (p.sprite) ctx.drawImage(p.sprite.c, p.sprite.x0 + dx, p.sprite.y0 + dy, p.sprite.w, p.sprite.h);
        const hit = [p.hit[0] + dx, p.hit[1] + dy, p.hit[2] + dx, p.hit[3] + dy];
        if (p.id === focusId) { ctx.strokeStyle = "#45549c"; ctx.lineWidth = 2; ctx.strokeRect(hit[0] - 3, hit[1] - 3, hit[2] - hit[0] + 6, hit[3] - hit[1] + 6); }
        live.push({ p, dx, dy, hit });
      }
      ctx.globalAlpha = 1;
      L.live = live;
      L.lastDrawMs = performance.now() - t; stats.labelDraw.push(L.lastDrawMs); if (stats.labelDraw.length > 600) stats.labelDraw.shift();
    }
    // the labels and markers under (x, y), the smallest first; a hit target is at least HIT_MIN wide on touch
    function hitAt(x, y) {
      const out = [];
      for (const e of L.live) {
        const h = e.hit; const ex = Math.max(0, (HIT_MIN - (h[2] - h[0])) / 2), ey = Math.max(0, (HIT_MIN - (h[3] - h[1])) / 2);
        if (x >= h[0] - ex && x <= h[2] + ex && y >= h[1] - ey && y <= h[3] + ey) out.push(e);
      }
      return out.sort((p, q) => (p.hit[2] - p.hit[0]) * (p.hit[3] - p.hit[1]) - (q.hit[2] - q.hit[0]) * (q.hit[3] - q.hit[1]));
    }

    /* ---- picking: labels and markers under the finger, the water ID pass, the faces pass, the nearest sea ---- */
    function stackAt(x, y) {
      const out = [], seen = new Set();
      const add = (row) => { if (row && !seen.has(row.id)) { seen.add(row.id); out.push(row); } };
      for (const h of hitAt(x, y)) add(G.byId.get(h.p.id));
      if (R.levelLoaded(0)) {
        const w = R.pick(view, x, y, "water");
        if (w && w.waterArc != null && arcRiver) { const ri = arcRiver[w.waterArc]; if (ri >= 0) add(G.byRiver.get(ri)); }
        if (w && w.lakeFace != null && waterFaceEntity && waterHeader) { const e = waterHeader.entities[waterFaceEntity[w.lakeFace]]; if (e) add(G.byId.get(e.id)); }
        const f = R.pick(view, x, y, "land");
        if (f && f.face != null && header && faceEntity) { const ent = header.entities[faceEntity[f.face]]; if (ent) { add(G.byId.get(ent.id)); if (ent.parent) add(G.byId.get(ent.parent)); } }
      }
      if (!out.length) {
        // open water: the nearest sea or ocean label on screen, else the nearest sea or ocean by angle
        let best = null, bd = Infinity;
        for (const e of L.live) { if (!/^(sea|ocean|gulf|strait)$/.test(e.p.kind)) continue; const h = e.hit, d = Math.hypot((h[0] + h[2]) / 2 - x, (h[1] + h[3]) / 2 - y); if (d < bd) { bd = d; best = G.byId.get(e.p.id); } }
        if (!best) { const ll = unproject(x, y); if (ll) { const la = ll.lat * D2R, lo = ll.lon * D2R, c = Math.cos(la), u = [c * Math.cos(lo), c * Math.sin(lo), Math.sin(la)]; let bdot = -2; for (const row of G.rows) { if (!/^(sea|ocean)$/.test(row.kind) || !row.at) continue; const lb = row.at[1] * D2R, lob = row.at[0] * D2R, cb = Math.cos(lb); const d = u[0] * cb * Math.cos(lob) + u[1] * cb * Math.sin(lob) + u[2] * Math.sin(lb); if (d > bdot) { bdot = d; best = row; } } } }
        add(best);
      }
      return out;
    }
    function pickAt(x, y) {
      if (!stats.ready && !R.levelLoaded(0)) return;
      const again = sel.at && Math.hypot(sel.at[0] - x, sel.at[1] - y) < 10 && performance.now() - sel.t < 5000 && sel.stack.length > 1;
      if (again) { sel.index = (sel.index + 1) % sel.stack.length; sel.t = performance.now(); showStack(); selectRow(sel.stack[sel.index], { open: true, push: true }); return; }
      const stack = stackAt(x, y);
      sel.at = [x, y]; sel.t = performance.now(); sel.stack = stack; sel.index = 0;
      if (!stack.length) { clearSelection(); return; }
      showStack();
      selectRow(stack[0], { open: true, push: true });
    }
    function showStack() {
      const n = sel.stack.length;
      if (n < 2 || !sel.at) { stackBtn.hidden = true; return; }
      stackBtn.hidden = false;
      stackBtn.textContent = `${n} here · ${sel.index + 1}/${n} ${sel.stack[sel.index].name}`;
      stackBtn.setAttribute("aria-label", `${n} places here; showing ${sel.stack[sel.index].name}; activate to see the next`);
      stackBtn.style.left = Math.max(8, Math.min(cssW - 180, sel.at[0] + 14)) + "px"; stackBtn.style.top = Math.max(8, Math.min(cssH - 40, sel.at[1] + 14)) + "px";
    }
    stackBtn.addEventListener("click", () => { if (sel.stack.length < 2) return; sel.index = (sel.index + 1) % sel.stack.length; sel.t = performance.now(); showStack(); selectRow(sel.stack[sel.index], { open: true, push: true }); });
    function selectRow(row, o) {
      o = o || {};
      sel.id = row.id;
      const face = (row.kind === "country" || row.kind === "admin1") ? faceOfId(row.id) : null;
      R.select(face);
      caption.textContent = "";
      if (o.open) openCard(row);
      if (o.push) writeHash(true); else writeHash(false);
      for (const p of L.placed) if (p.id === row.id || p.sprite && p.id !== row.id && false) p.sprite = renderSprite(p);   // the selected label takes the accent
      requestLayout("select", true);
      invalidate();
    }
    // a selection made by a reader (a tap, a search result, the console) pushes a history entry so Back undoes it; one made
    // by Back or by a deep link at load (push: false) does not
    function selectById(id, o) { const row = G.byId.get(id); if (!row) return false; o = Object.assign({ push: true }, o || {}); if (o.fly) flyToRow(row, o.open); else selectRow(row, o); return true; }
    function clearSelection() {
      const had = sel.id;
      sel.id = null; sel.stack = []; sel.index = 0; sel.at = null;
      R.select(null); caption.textContent = ""; stackBtn.hidden = true;
      closeCard();
      if (had) { for (const p of L.placed) if (p.id === had) p.sprite = renderSprite(p); writeHash(false); requestLayout("select", true); }
      invalidate();
    }
    // desktop hover: the top label under the pointer at once; the country under it when the pointer rests
    let hoverT = 0, hoverTimer = 0;
    function hoverAt(x, y) {
      const t = performance.now(); if (t - hoverT < 50) return; hoverT = t;
      if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = 0; }
      const h = hitAt(x, y)[0];
      if (h) { const row = G.byId.get(h.p.id); caption.textContent = row ? row.name : h.p.text; canvas.style.cursor = "pointer"; return; }
      canvas.style.cursor = "";
      hoverTimer = setTimeout(() => { hoverTimer = 0; if (disposed || dragging || !R.levelLoaded(0)) return; const f = R.pick(view, x, y, "land"); const ent = f && f.face != null && header ? header.entities[faceEntity[f.face]] : null; caption.textContent = ent ? ent.name : ""; }, 180);
    }

    /* ---- the place card: a side column, a bottom sheet on a phone that opens shut ---- */
    let cardRow = null, cardOpen = false, sheetUp = false;
    const kindLine = (row) => { const w = row.within ? G.byId.get(row.within) : null; return (KIND_LABEL[row.kind] || row.kind) + (w ? " · " + w.name : ""); };
    const wikiUrl = (title) => "https://en.wikipedia.org/wiki/" + encodeURIComponent(String(title).replace(/ /g, "_"));
    function openCard(row) {
      cardRow = row; cardOpen = true;
      cardEl.hidden = false;
      cardEl.classList.toggle("atlas2-card-shut", PHONE && !sheetUp);
      cardTitle.textContent = row.name; cardKind.textContent = kindLine(row);
      cardBody.innerHTML = "";
      cardBody.scrollTop = 0;
      if (row.kind === "country") renderCountryCard(row); else renderPlaceCard(row);
      el.classList.add("atlas2-has-card");
    }
    function closeCard() { cardOpen = false; cardRow = null; cardEl.hidden = true; el.classList.remove("atlas2-has-card"); }
    el.querySelector(".atlas2-card-close").addEventListener("click", () => clearSelection());
    el.querySelector(".atlas2-grip").addEventListener("click", () => { sheetUp = !sheetUp; cardEl.classList.toggle("atlas2-card-shut", PHONE && !sheetUp); });
    el.querySelector(".atlas2-card-head").addEventListener("click", (e) => { if (PHONE && !e.target.closest("button")) { sheetUp = !sheetUp; cardEl.classList.toggle("atlas2-card-shut", !sheetUp); } });
    const safeHTML = (html) => (H.sanitizeHTML ? H.sanitizeHTML(html) : escText(html));
    function withinButton(row) { const w = row.within ? G.byId.get(row.within) : null; return w ? `<p class="atlas2-card-within">In <button type="button" class="atlas2-link" data-select="${escText(w.id)}">${escText(w.name)}</button></p>` : ""; }
    function wikiLine(row) { const title = row.wiki === 1 ? row.name : row.wiki; return title ? `<p class="atlas2-card-link"><a href="${wikiUrl(title)}" target="_blank" rel="noopener">Wikipedia: ${escText(title)}</a></p>` : ""; }
    function renderPlaceCard(row) {
      cardBody.innerHTML = withinButton(row) + wikiLine(row);
    }
    function renderCountryCard(row) {
      const bundle = "atlas2prose";
      if (H.dataReady && !H.dataReady(bundle)) {
        cardBody.innerHTML = '<p class="atlas2-card-loading">Loading…</p>';
        if (H.ensureData) H.ensureData(bundle).then((ok) => { if (cardRow === row && cardOpen) { if (ok) renderCountryProse(row); else cardBody.innerHTML = '<p class="atlas2-card-loading">The description didn’t arrive.</p>' + withinButton(row) + wikiLine(row); } });
        return;
      }
      renderCountryProse(row);
    }
    function renderCountryProse(row) {
      const key = row.v1 || null;
      const info = key && root.COUNTRY_INFO ? root.COUNTRY_INFO[key] : "";
      const stat = key && root.COUNTRY_STATS ? root.COUNTRY_STATS[key] : null;
      const span = key && root.COUNTRY_SPANS ? root.COUNTRY_SPANS[key] : "";
      const src = key && root.COUNTRY_SOURCES ? root.COUNTRY_SOURCES[key] : null;
      cardTitle.textContent = officialName(row.name, info);
      let html = "";
      if (span) html += `<p class="atlas2-card-span">${escText(span)}</p>`;
      const desc = stripInfoNoise(info);
      html += desc ? `<div class="atlas2-card-desc">${safeHTML(desc)}</div>` : `<p class="atlas2-card-desc atlas2-card-none">No description for ${escText(row.name)} yet.</p>`;
      if (stat) {
        const tile = (label, v) => { const s = String(v == null ? "" : v).trim(); const pi = s.indexOf("("); const num = (pi >= 0 ? s.slice(0, pi) : s).trim() || "—"; const nu = pi >= 0 ? s.slice(pi + 1).replace(/\)\s*$/, "").trim() : ""; return `<div class="atlas2-stat"${nu ? ` title="${escText(nu)}"` : ""}><span class="atlas2-stat-l">${label}</span><span class="atlas2-stat-v">${escText(num)}</span></div>`; };
        const popN = statNum(stat.pop), gdpN = statNum(stat.gdp);
        const pc = popN > 0 && gdpN > 0 ? "$" + Math.round(gdpN / popN).toLocaleString("en-US") : "—";
        html += `<div class="atlas2-stats">${tile("Population", stat.pop)}${tile("Area", stat.area)}${tile("GDP", stat.gdp)}${tile("GDP per capita", pc)}</div>`;
      }
      html += withinButton(row) + wikiLine(row);
      if (src && src.length && H.sourceListHTML) html += `<div class="src-note atlas2-srcnote"><h3 class="atlas2-src-h">Sources</h3>${H.sourceListHTML(src)}</div>`;
      cardBody.innerHTML = html;
      if (H.wireFootnotes) { try { H.wireFootnotes(cardBody); } catch (e) {} }
    }
    cardBody.addEventListener("click", (e) => { const b = e.target.closest("button[data-select]"); if (!b) return; const row = G.byId.get(b.getAttribute("data-select")); if (row) flyToRow(row, true); });

    /* ---- search: one input, diacritic-folded prefix then substring over names and aliases ---- */
    let results = [], active = -1;
    const KIND_ORDER = { country: 0, capital: 1, ocean: 1, sea: 2, admin1: 2, city: 3, region: 3, range: 3, island: 4, "island-group": 4, lake: 4, gulf: 4, strait: 4, town: 5, river: 5 };
    function runSearch(q) {
      const k = fold(String(q || "").trim());
      if (k.length < 2 || !G.ready) { closeResults(); return []; }
      const pre = [], sub = [];
      for (const r of G.rows) {
        if (r.key.startsWith(k) || r.akeys.some((a) => a.startsWith(k))) pre.push(r);
        else if (r.key.indexOf(k) >= 0 || r.akeys.some((a) => a.indexOf(k) >= 0)) sub.push(r);
      }
      // the name that IS the query first, then by kind (a country before a town, a sea before a river), then by rank within the kind
      const score = (r) => (r.key === k ? 0 : 100) + (KIND_ORDER[r.kind] == null ? 5 : KIND_ORDER[r.kind]) * 10 + Math.min(9, r.rank);
      const by = (a, b) => score(a) - score(b) || (a.name < b.name ? -1 : 1);
      results = pre.sort(by).concat(sub.sort(by)).slice(0, 10);
      active = results.length ? 0 : -1;
      resultsUl.innerHTML = results.map((r, i) => { const w = r.within ? G.byId.get(r.within) : null; return `<li role="option" id="atlas2-opt-${i}" data-i="${i}"${i === active ? ' aria-selected="true" class="active"' : ""}><span class="atlas2-res-name">${escText(r.name)}</span><span class="atlas2-chip">${escText(KIND_LABEL[r.kind] || r.kind)}</span>${w ? `<span class="atlas2-res-in">${escText(w.name)}</span>` : ""}</li>`; }).join("");
      resultsUl.hidden = !results.length;
      searchIn.setAttribute("aria-expanded", String(!!results.length));
      if (active >= 0) searchIn.setAttribute("aria-activedescendant", "atlas2-opt-" + active); else searchIn.removeAttribute("aria-activedescendant");
      return results;
    }
    function closeResults() { resultsUl.hidden = true; resultsUl.innerHTML = ""; results = []; active = -1; searchIn.setAttribute("aria-expanded", "false"); searchIn.removeAttribute("aria-activedescendant"); }
    function setActive(i) { active = i; resultsUl.querySelectorAll("li").forEach((li, j) => { li.classList.toggle("active", j === i); if (j === i) li.setAttribute("aria-selected", "true"); else li.removeAttribute("aria-selected"); }); if (i >= 0) searchIn.setAttribute("aria-activedescendant", "atlas2-opt-" + i); }
    function chooseResult(i) { const row = results[i]; if (!row) return; closeResults(); searchIn.value = row.name; flyToRow(row, true); canvas.focus({ preventScroll: true }); }
    searchIn.addEventListener("input", () => runSearch(searchIn.value));
    searchIn.addEventListener("focus", () => { if (searchIn.value.trim().length >= 2) runSearch(searchIn.value); });
    searchIn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { if (!results.length) runSearch(searchIn.value); if (results.length) { e.preventDefault(); setActive((active + 1) % results.length); } }
      else if (e.key === "ArrowUp") { if (results.length) { e.preventDefault(); setActive((active - 1 + results.length) % results.length); } }
      else if (e.key === "Enter") { if (!results.length) runSearch(searchIn.value); if (results.length) { e.preventDefault(); chooseResult(Math.max(0, active)); } }
    });
    resultsUl.addEventListener("pointerdown", (e) => { const li = e.target.closest("li[data-i]"); if (li) { e.preventDefault(); chooseResult(Number(li.getAttribute("data-i"))); } });
    document.addEventListener("pointerdown", (e) => { if (!resultsUl.hidden && !e.target.closest(".atlas2-search")) closeResults(); }, true);

    /* ---- flying to a place: an eased move, instant under reduced motion ---- */
    const kmppFor = (row) => {
      const short = Math.min(cssW, cssH) * (PHONE ? 0.9 : 0.5);
      const fit = (km, floor) => Math.max(floor, Math.min(24, (km || 0) / short));
      switch (row.kind) {
        case "country": return fit(row.len * 1.6, 0.3);
        case "admin1": return fit(row.len * 1.6, 0.3);
        case "ocean": return 24; case "sea": return fit(row.len * 1.6, 2); case "gulf": case "strait": return fit(row.len * 1.8, 0.5);
        case "lake": case "island": case "island-group": case "range": case "region": return fit(row.len * 1.8, 0.4);
        case "river": return 6;
        case "capital": case "city": return 1.5; case "town": return 0.8;
        default: return 3;
      }
    };
    function flyToRow(row, open) { if (!row.at) return; flyTo(row.at[0], row.at[1], kmppFor(row), () => selectRow(row, { open: !!open, push: true })); }
    function flyTo(lon, lat, kmpp, done) {
      const z = Math.max(ZMIN, Math.min(zmax(), R_KM / (kmpp * base)));
      let dlon = lon - view.lon; while (dlon > 180) dlon -= 360; while (dlon < -180) dlon += 360;
      if (reduced()) { view.lon = lon; view.lat = lat; view.zoom = z; clampView(); flying = null; invalidate(); touched(); if (done) done(); return; }
      flying = { t0: 0, dur: 700, from: { lon: view.lon, lat: view.lat, lz: Math.log(view.zoom) }, to: { lon: view.lon + dlon, lat, lz: Math.log(z) }, done };
      coasting = false; invalidate();
    }
    function fly(t) {
      const f = flying; if (!f) return;
      if (!f.t0) f.t0 = t;
      const u = Math.min(1, (t - f.t0) / f.dur), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      view.lon = f.from.lon + (f.to.lon - f.from.lon) * e; view.lat = f.from.lat + (f.to.lat - f.from.lat) * e; view.zoom = Math.exp(f.from.lz + (f.to.lz - f.from.lz) * e);
      clampView(); needs = true;
      if (u >= 1) { flying = null; touched(); if (f.done) f.done(); }
    }

    /* ---- deep links: #map2/<lon>/<lat>/<zoom>/<place>, written on settle, pushed on a selection ---- */
    const HASH_RE = /^#map2\/(-?[\d.]+)\/(-?[\d.]+)\/(-?[\d.]+)(?:\/([^?]*))?(\?.*)?$/;
    const zoomLevel = () => Math.log2(156.543 / kmPerPx());
    function readHash() { const m = HASH_RE.exec(location.hash || ""); if (!m) return null; let place = m[4] || null; if (place) { try { place = decodeURIComponent(place); } catch (e) {} } return { lon: Number(m[1]), lat: Number(m[2]), z: Number(m[3]), place }; }
    function hashNow() { return "#map2/" + view.lon.toFixed(2) + "/" + view.lat.toFixed(2) + "/" + zoomLevel().toFixed(2) + (sel.id ? "/" + encodeURIComponent(sel.id) : "") + (perfOn ? "?perf" : ""); }
    function writeHash(push) {
      if (!/^#map2(\/|\?|$)/.test(location.hash || "")) return;   // the reader has left the Atlas
      const h = hashNow(); if (h === location.hash) return;
      lastWrittenHash = h;
      try { if (push) history.pushState(null, "", location.pathname + location.search + h); else history.replaceState(null, "", location.pathname + location.search + h); } catch (e) {}
    }
    function applyHash(d) {
      if (!d || !isFinite(d.lon) || !isFinite(d.lat) || !isFinite(d.z)) return;
      const z = R_KM / ((156.543 / Math.pow(2, d.z)) * base);
      view.lon = d.lon; view.lat = d.lat; view.zoom = z; clampView(); flying = null; coasting = false;
      if (!tileIndex) pendingZoom = z;   // the cap is not known until the header arrives: the asked-for zoom is clamped again then
      if (d.place) { if (G.ready && stats.ready) selectById(d.place, { open: true, push: false }); else pendingPlace = d.place; } else if (sel.id) clearSelection();
      plan(); invalidate(); requestLayout("hash", true);
    }
    // pushState and replaceState fire no event, so every hashchange or popstate is the reader's: Back, Forward, a typed link.
    // One that already describes the view and the selection (a settle's own rewrite read back) changes nothing.
    const onHash = () => { if (disposed) return; const h = location.hash || ""; if (!/^#map2(\/|\?|$)/.test(h)) return; if (h === hashNow()) return; const d = readHash(); if (d) applyHash(d); else if (sel.id) clearSelection(); };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);

    /* ---- the keyboard: a hidden list of buttons mirroring the visible labels in rank order ---- */
    function updateKeys() {
      const list = L.placed.filter((p) => p.text).slice().sort((a, b) => a.score - b.score).slice(0, KEY_LIST_MAX);
      const ids = list.map((p) => p.id).join("\n");
      if (ids === L.keyIds) return;
      L.keyIds = ids;
      const had = document.activeElement && keysUl.contains(document.activeElement) ? document.activeElement.getAttribute("data-id") : null;
      keysUl.innerHTML = list.map((p) => { const row = G.byId.get(p.id); return `<li><button type="button" data-id="${escText(p.id)}">${escText(row ? row.name : p.text)}, ${escText(KIND_LABEL[p.kind] || p.kind)}</button></li>`; }).join("");
      if (had) { const b = keysUl.querySelector(`button[data-id="${had.replace(/"/g, '\\"')}"]`); if (b) b.focus({ preventScroll: true }); }
    }
    keysUl.addEventListener("click", (e) => { const b = e.target.closest("button[data-id]"); if (!b) return; const row = G.byId.get(b.getAttribute("data-id")); if (row) selectRow(row, { open: true, push: true }); });
    keysUl.addEventListener("focusin", (e) => { const b = e.target.closest("button[data-id]"); focusId = b ? b.getAttribute("data-id") : null; if (focusId) { const row = G.byId.get(focusId); caption.textContent = row ? row.name : ""; } invalidate(); });
    keysUl.addEventListener("focusout", () => { focusId = null; invalidate(); });

    /* ---------- lifecycle ---------- */
    const onResize = () => { if (!el.isConnected) { dispose(); return; } layout(); invalidate(); };
    window.addEventListener("resize", onResize);
    // the element changes size without the window doing so (a scrollbar comes or goes as the page loads, the card
    // column opens): both canvases and the label layout follow its box, not the window's
    const sizeObs = typeof ResizeObserver === "function" ? new ResizeObserver(() => { if (disposed) return; const r = el.getBoundingClientRect(); if (Math.round(r.width) !== cssW || Math.round(r.height) !== cssH) onResize(); }) : null;
    if (sizeObs) sizeObs.observe(el);
    const viewHost = document.getElementById("view") || document.body;
    const mo = new MutationObserver(() => { if (!el.isConnected) dispose(); });
    mo.observe(viewHost, { childList: true });
    // a theme change (data-theme, or the night class) re-reads the tokens: the palette and the relief ramp follow
    const themeObs = new MutationObserver(() => { if (!el.isConnected) return; palette = readPalette(); R.setPalette(palette); R.setRamp(buildRamp()); labelColours(); if (G.ready) measureMetrics(); invalidate(); });
    themeObs.observe(document.body, { attributes: true, attributeFilter: ["class", "data-theme"] });
    function dispose() {
      if (disposed) return;
      disposed = true;
      try { mo.disconnect(); themeObs.disconnect(); if (sizeObs) sizeObs.disconnect(); } catch (e) {}
      window.removeEventListener("resize", onResize);
      window.removeEventListener("hashchange", onHash); window.removeEventListener("popstate", onHash);
      if (raf) cancelAnimationFrame(raf);
      if (layoutTimer) clearTimeout(layoutTimer);
      landTiles.abortAll(); waterTiles.abortAll(); reliefTiles.abortAll();
      if (worker) { try { worker.terminate(); } catch (e) {} worker = null; }
      R.dispose();
    }
    setPerf(perfOn);   // after the label state exists: the overlay reads it (Phase 1c)
    layout();
    // a deep link (#map2/<lon>/<lat>/<zoom>/<place>) sets the first view; the place opens once the data is in
    { const d = readHash(); if (d) { lastWrittenHash = location.hash; applyHash(d); } }
    invalidate();
    // the view set from outside (the perf suite's fixed views): centre, zoom, then wait for `tilesSettled()`
    function setView(lon, lat, kmPerPixel) { view.lon = lon; view.lat = lat; view.zoom = R_KM / (kmPerPixel * base); flying = null; coasting = false; plan(); invalidate(); touched(); }
    const tilesSettled = () => view.tiles.every((k) => R.tileLoaded(k)) && (view.level !== 4 || view.parents.every((k) => R.tileLoaded(k))) && landTiles.pending.size === 0
      && (!view.lakes || !waterStarted || waterFailed || (view.waterTiles.every((k) => R.waterTileLoaded(k)) && waterTiles.pending.size === 0))
      && (!view.relief.on || !reliefStarted || reliefFailed || (!!reliefIndex && R.reliefLoaded("0") && view.relief.tiles.every((k) => R.reliefLoaded(k)) && reliefTiles.pending.size === 0));
    const waterSettled = () => !waterStarted || waterFailed || (!!waterHeader && R.waterLevelLoaded(2));
    const controller = { dispose, stats, view, layers, renderer: R, invalidate, zoomAt, pick, setView, setLayers, kmPerPx, tilesSettled, waterSettled, setPerf,
      statsNow: () => Object.assign(R.stats(), { kmPerPx: kmPerPx(), wanted: view.tiles.length, pending: landTiles.pending.size, resident: landTiles.stats.resident, fetched: landTiles.stats.fetched, tileBytes: landTiles.stats.bytes, evicted: landTiles.stats.evicted, waterWanted: view.waterTiles.length, waterPending: waterTiles.pending.size, reliefWanted: view.relief.tiles.length, reliefPending: reliefTiles.pending.size, reliefBytes: reliefTiles.stats.bytes, reliefFade: view.relief.fade, riversOn: view.rivers, lakesOn: view.lakes, reliefOn: view.relief.on, phone: PHONE,
        labelsPlaced: L.placed.length, labelCandidates: L.candidates, labelCap: L.cap, labelLayoutMs: L.lastLayoutMs, labelLayoutP95: pct95(stats.labelLayout), labelSpriteMs: L.lastSpriteMs || 0, labelSpriteP95: pct95(stats.labelSprite), labelDrawMs: L.lastDrawMs, labelDrawP95: pct95(stats.labelDraw), labelBudgets: { drawMs: LABEL_DRAW_BUDGET_MS, layoutMs: LABEL_LAYOUT_BUDGET_MS }, heapMB: heapMB(), density: layers.density, zoomLevel: zoomLevel() }),
      // Phase 1c, for the suites and the console
      labels: () => L.placed, labelsLive: () => L.live, layoutSeq: () => L.seq, layoutNow: () => new Promise((res) => { layoutWaiters.push(res); requestLayout("test", true); }), labelsReady: () => gazInWorker && metricsSent > 0,
      gazetteer: () => G, styles: STYLES, palette: () => palette, colours: () => ({ halo: haloCss, ink: inkCss, water: waterCss, selected: selCss }),
      select: selectById, selectedId: () => sel.id, stack: () => sel.stack.map((r) => r.id), stackAt: (x, y) => stackAt(x, y).map((r) => r.id), pickAt, hitAt: (x, y) => hitAt(x, y).map((h) => h.p.id), clearSelection,
      card: () => ({ open: cardOpen, id: cardRow ? cardRow.id : null, title: cardTitle.textContent, shut: cardEl.classList.contains("atlas2-card-shut") }),
      search: (q) => runSearch(q).map((r) => r.id), chooseResult, flyTo, flyToRow: (id, open) => { const r = G.byId.get(id); if (r) flyToRow(r, open); return !!r; }, flying: () => !!flying,
      hash: hashNow, readHash, metricsCount: () => metricsSent, requestLayout: (why) => requestLayout(why || "test", true), labelDebug: (on) => { L.debug = !!on; }, labelWhy: () => L.why };
    el.__atlas2 = controller;
    return controller;
  }

  root.AtlasV2 = { mount };
})(typeof window !== "undefined" ? window : globalThis);
