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
  const LOD_M_RESIDENT = [10000, 2500, 500];  // the resident levels' tolerances (§2.3), for the fill-against-stroke stroke at the tile zooms
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
  const PERF_KEY = "folio_atlas2_perf";           // Phase 2a: the About sheet's "Show frame statistics" switch
  /* TIME (Phase 2a; docs/atlas-v2-design.md §2.4, §7 "Phase 2a — as built"). The rail runs from 10,000 BCE to today, piecewise
     linear with a knee so the last 2,500 years take 70 % of its width (Q-T1 a, Q-T2 a); the year the reader last used is the
     default (YEAR_KEY, localStorage behind try/catch), else today (the owner's instruction for 2a). The present-day faces of the
     core are alive from PRESENT_YEAR (their step is [2022, null]): before it they are not entities — the land draws plain, the
     present-day borders, provinces, countries' names and cities are not shown (the owner's decision: hide the anachronistic
     ones; the physical names stay) — and the historical polities of atlas/data/history.bin are what the year shows. A year change
     is a table: the alive set by binary search over each entity's steps, then a style texel per face and per arc; the meshes
     come lazily from the worker, the year the reader is on first and the next change year in the scrub's direction after it. */
  const YEAR_KEY = "folio_atlas2_year";
  const PRESENT_YEAR = 2022;
  const TODAY = new Date().getUTCFullYear();
  const RAIL_FROM = -10000, RAIL_KNEE_YEAR = TODAY - 2500, RAIL_KNEE_X = 0.30;
  const FADE_MS = 250;                            // the crossfade at a step when the reader steps or plays (none while dragging, none under reduced motion)
  const MESH_BYTES = 48 * 1024 * 1024;            // (face, level) meshes kept on the GPU, by their bytes (2b: a count let forty empires cost what forty islets did)
  const HIST_FILL_ALPHA = 0.42, HIST_FILL_ALPHA_DARK = 0.5, HIST_SEL_ALPHA = 0.72;
  const SPEEDS = [1, 5, 25, 100];                 // years per second (Q-T4 b: every year is played)
  const PHONE = (() => { try { return matchMedia("(pointer: coarse)").matches && Math.min(screen.width, screen.height) < 768; } catch (e) { return false; } })();
  const TOUCH = (() => { try { return matchMedia("(pointer: coarse)").matches; } catch (e) { return false; } })();
  const NARROW_PX = 600;   // under this width the rail takes two lines (‹ track › above; year, play, speed below), on any device
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
          <ul class="atlas2-results" id="atlas2-results" role="listbox" aria-label="Places found" hidden></ul>
        </div>
        <div class="atlas2-zoom" role="group" aria-label="Zoom">
          <button type="button" class="atlas2-btn" data-zoom="in" title="Zoom in" aria-label="Zoom in">+</button>
          <button type="button" class="atlas2-btn" data-zoom="out" title="Zoom out" aria-label="Zoom out">−</button>
          <button type="button" class="atlas2-btn" data-zoom="home" title="Whole earth" aria-label="Whole earth">⌂</button>
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
        <div class="atlas2-help">
          <button type="button" class="atlas2-btn atlas2-about-btn" aria-expanded="false" aria-controls="atlas2-about" aria-label="About this map" title="About this map">?</button>
          <div class="atlas2-sheet atlas2-about" id="atlas2-about" role="dialog" aria-labelledby="atlas2-about-title" hidden>
            <div class="atlas2-sheet-head"><strong id="atlas2-about-title">About this map</strong><button type="button" class="atlas2-sheet-close atlas2-about-close" aria-label="Close">×</button></div>
            <p class="atlas2-about-p">The present-day earth from open data: coastlines from OpenStreetMap, borders and places from Natural Earth, lakes from HydroLAKES, relief from ETOPO 2022, names checked against Wikidata. <a class="atlas2-about-credits" href="#credits">Sources and credits</a> lists every source with its licence.</p>
            <p class="atlas2-about-p atlas2-about-history">The years before today draw <b>the states Folio’s cards teach</b> — their borders from Cliopatria (Seshat), conflated onto today’s coast — not every state of the period: plain land in a past year is a state no card covers yet, or one the source does not draw.</p>
            <p class="atlas2-about-p atlas2-about-caution">Every border and coastline here is a reconstruction from those sources, drawn at the resolution each allows and as it stood on the day it was retrieved; a border is a guide to where a boundary runs, not a judgement on where it lies.</p>
            <dl class="atlas2-keys-help" aria-label="Keyboard">
              <div><dt>Drag, arrow keys</dt><dd>turn the globe (Shift: faster)</dd></div>
              <div><dt>Scroll, pinch, + −</dt><dd>zoom; double-tap zooms in</dd></div>
              <div><dt>Home</dt><dd>the whole earth</dd></div>
              <div><dt>Tab</dt><dd>walk the names on the map; Enter opens one</dd></div>
              <div><dt>Esc</dt><dd>close the place, the legend or this</dd></div>
              <div><dt>R</dt><dd>relief on or off</dd></div>
              <div><dt>/</dt><dd>find a place</dd></div>
              <div><dt>[ ]</dt><dd>the previous or next change year of what is on screen</dd></div>
            </dl>
            <label class="atlas2-about-perf"><input type="checkbox" class="atlas2-perf-switch"> Show frame statistics</label>
          </div>
        </div>
        <button type="button" class="atlas2-stack" hidden aria-live="polite"></button>
        <div class="atlas2-status" role="status" aria-live="polite"><span class="atlas2-bar"><i></i></span><span class="atlas2-note">Fetching the earth…</span></div>
        <div class="atlas2-caption" aria-live="polite"></div>
        <div class="atlas2-announce vh" aria-live="polite" aria-atomic="true"></div>
        <p class="atlas2-mode" hidden></p>
        <aside class="atlas2-card" hidden aria-label="Place">
          <button type="button" class="atlas2-grip" aria-label="Expand or collapse the place card"><i></i></button>
          <div class="atlas2-card-head"><div class="atlas2-card-titles"><h2 class="atlas2-card-title" tabindex="-1"></h2><p class="atlas2-card-kind"></p></div><button type="button" class="atlas2-card-close" aria-label="Close">×</button></div>
          <div class="atlas2-card-body"></div>
        </aside>
        <div class="atlas2-keys vh" aria-label="Places named on the map"><ul></ul></div>
        <div class="atlas2-rail" role="group" aria-label="Year">
          <p class="atlas2-rail-note" hidden>No state taught by Folio’s cards is mapped for this year yet.</p>
          <div class="atlas2-rail-row">
            <button type="button" class="atlas2-rail-btn atlas2-rail-prev" aria-label="Previous change year" title="Previous change year ([)">‹</button>
            <div class="atlas2-rail-track"><canvas class="atlas2-rail-ticks" aria-hidden="true"></canvas><div class="atlas2-rail-pin" role="slider" tabindex="0" aria-label="Year" aria-valuemin="${RAIL_FROM}" aria-valuemax="${TODAY}" aria-valuenow="${TODAY}" aria-valuetext="${TODAY}" aria-orientation="horizontal"></div><div class="atlas2-rail-mag" hidden aria-hidden="true"></div></div>
            <button type="button" class="atlas2-rail-btn atlas2-rail-next" aria-label="Next change year" title="Next change year (])">›</button>
            <input class="atlas2-rail-year" type="text" inputmode="text" aria-label="Year — for example 500 BCE, 1066 or -44" autocomplete="off" spellcheck="false">
            <button type="button" class="atlas2-rail-btn atlas2-rail-play" aria-label="Play" aria-pressed="false" title="Play every year">▶</button>
            <select class="atlas2-rail-speed" aria-label="Playback speed, years per second">${SPEEDS.map((v) => '<option value="' + v + '"' + (v === 25 ? ' selected' : '') + '>' + v + '/s</option>').join("")}</select>
          </div>
        </div>
        <pre class="atlas2-perf" hidden aria-hidden="true"></pre>
      </div>`;
    const el = host.querySelector(".atlas2"), canvas = el.querySelector(".atlas2-canvas"), status = el.querySelector(".atlas2-status"), note = el.querySelector(".atlas2-note"), bar = el.querySelector(".atlas2-bar i"), caption = el.querySelector(".atlas2-caption"), perfEl = el.querySelector(".atlas2-perf");
    const sheet = el.querySelector(".atlas2-sheet"), layersBtn = el.querySelector(".atlas2-layers-btn"), layersNote = el.querySelector(".atlas2-layers-note");
    const labelCanvas = el.querySelector(".atlas2-labels"), lctx = labelCanvas.getContext("2d");
    const stackBtn = el.querySelector(".atlas2-stack"), cardEl = el.querySelector(".atlas2-card"), cardTitle = el.querySelector(".atlas2-card-title"), cardKind = el.querySelector(".atlas2-card-kind"), cardBody = el.querySelector(".atlas2-card-body"), keysUl = el.querySelector(".atlas2-keys ul");
    const searchIn = el.querySelector(".atlas2-search-in"), resultsUl = el.querySelector(".atlas2-results");
    const railEl = el.querySelector(".atlas2-rail"), railTrack = el.querySelector(".atlas2-rail-track"), railPin = el.querySelector(".atlas2-rail-pin"), railTicks = el.querySelector(".atlas2-rail-ticks"), railMag = el.querySelector(".atlas2-rail-mag"), railYear = el.querySelector(".atlas2-rail-year"), railPlay = el.querySelector(".atlas2-rail-play"), railSpeed = el.querySelector(".atlas2-rail-speed"), railNote = el.querySelector(".atlas2-rail-note");
    const say = (t, frac) => { note.textContent = t; if (frac != null) { bar.style.width = Math.round(frac * 100) + "%"; bar.parentNode.hidden = false; } };
    const fail = (t) => { status.classList.add("atlas2-fail"); bar.parentNode.hidden = true; note.textContent = t; };

    /* THE RENDERER (Phase 1d): WebGL2 where the browser has it; else the still Canvas 2D view of atlas-canvas.js (LOD 0,
       redrawn on release, labels and picking working) with a sentence saying what is missing. FILE marks a page opened
       from a file (no fetch of a binary, no Worker, no tiles, no relief): the data comes from the `.js` twins and the
       worker's code runs on the main thread behind the same messages. */
    const FILE = location.protocol === "file:";
    let STATIC2D = false;
    const R = (() => {
      const gl = root.AtlasGL ? root.AtlasGL.create(canvas, { antialias: opts.antialias, onRestore: () => restoreAfterLoss() }) : null;
      if (gl) return gl;
      const c2 = root.AtlasCanvas ? root.AtlasCanvas.create(canvas, {}) : null;
      if (c2) STATIC2D = true;
      return c2;
    })();
    if (!R) { fail("This browser can draw neither WebGL2 nor a 2D canvas, which the Atlas needs."); return { dispose() {} }; }
    const modeEl = el.querySelector(".atlas2-mode");
    const modeSentences = [];
    if (STATIC2D) modeSentences.push("This browser has no WebGL2, so the Atlas shows a still globe at low detail: drag to turn it and it redraws when you let go; scroll or pinch to zoom. Relief, the coast at street zoom and the finer names need WebGL2.");
    if (FILE) modeSentences.push("Folio was opened from a file rather than a web server, so the coast at street zoom and the relief — which a browser will not fetch from a file — are left out; the globe, the rivers, the lakes and the names are all here.");
    if (modeSentences.length) { modeEl.hidden = false; modeEl.textContent = modeSentences.join(" "); }
    let palette = readPalette();
    R.setPalette(palette);
    R.setRamp(buildRamp());

    /* ---------- view and layers ---------- */
    const layers = loadLayers();
    const view = { history: null, lon: 10, lat: 20, zoom: 1, graticule: layers.graticule, level: 0, admin1: false, borders: layers.borders, kmpp: 24, tiles: [], parents: [], waterTiles: [], rivers: layers.rivers, lakes: layers.lakes, smoothRivers: false, relief: { on: layers.relief, strength: layers.strength, fade: 1, tiles: [] }, radius: 100, cx: 0, cy: 0, rot: new Float32Array(9) };
    let cssW = 0, cssH = 0, base = 100, dprNow = 1;
    /* ADAPTIVE DEGRADATION DURING A GESTURE (Phase 1d). The owner's gate holds every frame of a gesture to 100 ms, and on
       a slow GPU a full-screen frame does not fit it: on software GL the globe costs 100–130 ms at full resolution (fill
       bound: half the resolution halves it, measured p90 100 → 50 ms), and LOD 1 between 8 and 16 km/px — which a pinch
       out of the globe crosses twice — draws 130–180 k triangles over the whole earth and costs 130–280 ms whatever the
       resolution (geometry bound). So the view learns the GPU it is on, in two sticky stages for the session, each entered
       by SLOW_FRAMES frames of a live gesture (fingers down, a wheel in the last 200 ms, a coast, a fly) that took more than
       RES_DROP_MS — measured from the frame timestamps of the gesture itself, never from the pause before it:
         stage 1: while a gesture is live the GL canvas draws at half resolution (a quarter of the fill) and the first frame
                  after the gesture redraws at full — the "release frame" the gate measures apart; the label canvas keeps its
                  resolution, so the names stay sharp and what blurs for the length of the gesture is the coast;
         stage 2: a gesture also draws one level coarser than the view wants (never finer than the one it started at), as a
                  map app shows the coarser tiles under a pinch; the wanted level comes with the release frame.
       A GPU that draws the frame in 16.7 ms (the owner's phone) never reaches the threshold and never sees either. */
    /* PHASE 2a (task 0b of the brief): the stages RECOVER, IGNORE MAIN-THREAD STALLS, and read the GPU where it can be read.
         · a frame counts toward escalation only if no main-thread task over LONG_TASK_MS ran inside its interval: this thread
           brackets its own heavy work (a tile's or a level's upload, the relief compose, the label sprites — `bracket`) and
           the browser's long-task entries are observed too, so a collector's pause or a stall from outside the Atlas never
           teaches the view a slower GPU than it has. The decision is taken one frame late (a candidate waits in `pendingSlow`
           until the next frame), because a long-task entry is delivered after the task, possibly after the next frame began;
         · where EXT_disjoint_timer_query_webgl2 exists the GPU's own time per frame (atlas-gl.js `gpuMs`) is what is read
           against RES_DROP_MS; elsewhere the frame delta, as before;
         · recovery: the learnt stage is the ceiling, not the floor — a gesture starts one stage lower than the learnt stage
           when the last FAST_FRAMES gesture frames at the learnt stage ran under FAST_MS, and if that trial gesture itself runs
           FAST_FRAMES fast frames the learnt stage comes down to it; a slow frame in a trial sends the gesture back up.
         The overlay's first line prints the stage, the learnt stage, the escalations, the recoveries and the stalls ignored. */
    const RES_DROP_MS = 70, SLOW_FRAMES = 2, FAST_MS = 25, FAST_FRAMES = 20, LONG_TASK_MS = 20;
    let resScale = 1, lastWheelT = 0, wheelTimer = 0, stage = 0, learnt = 0, slowFrames = 0, gestureT = 0, lastFrameT = 0, wasLive = false, fastRun = 0, trialFast = 0, stageLocked = false;
    const longTasks = [];     // [start, end] of main-thread tasks over LONG_TASK_MS: this thread's own brackets and the browser's long-task entries
    const pendingSlow = [];   // gesture frames awaiting the long-task entries of their interval before they count
    const stageTrace = [];    // the last settled gesture frames: [interval ms, slow, fast, stalled, stage] — for the suites and the owner's console
    const frameSpans = [];    // the last frames' own CPU spans: a browser long-task entry that STARTS inside one is the frame's task (on software GL
                              // the draw blocks on the GPU process inside the rAF task, and every slow frame reads as a long task), not a stall
    function noteTask(t0, t1, observed) {
      if (t1 - t0 <= LONG_TASK_MS) return;
      if (observed && frameSpans.some((f) => t0 >= f[0] - 1 && t0 <= f[1] + 1)) { stats.frameTasks = (stats.frameTasks || 0) + 1; return; }
      longTasks.push([t0, t1]); if (longTasks.length > 64) longTasks.shift(); stats.longTasks++;
    }
    // run `fn` and record it as a long task if it was one (the brackets the brief asks for)
    function bracket(fn, name) { const t0 = performance.now(); try { return fn(); } finally { const t1 = performance.now(); noteTask(t0, t1); if (name) { const b = stats.taskMs || (stats.taskMs = {}); b[name] = (b[name] || 0) + (t1 - t0); } } }
    const timed = bracket;   // the same, named: the buckets show in statsNow().taskMs (what a slow frame spent its time on)
    let longObs = null;
    try { if (typeof PerformanceObserver === "function" && PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes("longtask")) { longObs = new PerformanceObserver((list) => { for (const e of list.getEntries()) noteTask(e.startTime, e.startTime + e.duration, true); }); longObs.observe({ entryTypes: ["longtask"] }); } } catch (e) { longObs = null; }
    const stalled = (t0, t1) => longTasks.some(([a, b]) => b > t0 && a < t1);
    const gestureLive = () => ptrs.size > 0 || coasting || !!flying || (performance.now() - lastWheelT < 200) || !!(time && time.dragging);   // a rail scrub is a gesture too: its frames re-rasterise every fill, and a slow GPU drops to half resolution for it as for a pan
    const lodBias = () => (stage >= 2 && !STATIC2D && gestureLive() ? 1 : 0);
    function setRes(sc) { if (sc === resScale) return; resScale = sc; R.resize(cssW, cssH, (window.devicePixelRatio || 1) * resScale); stats.resDrops = (stats.resDrops || 0) + (sc < 1 ? 1 : 0); invalidate(); }
    function gestureEnded() { wasLive = false; if (resScale < 1 && !gestureLive()) setRes(1); if (stage >= 2 && !gestureLive()) invalidate(); }
    function applyStage(s) { stage = s; stats.stage = stage; stats.learnt = learnt; if (gestureLive()) setRes(stage >= 1 ? 0.5 : 1); invalidate(); }
    function escalate() { if (stageLocked || stage >= 2) return; slowFrames = 0; fastRun = 0; trialFast = 0; stats.escalations++; if (stage + 1 > learnt) learnt = stage + 1; applyStage(stage + 1); }
    // the frame loop's bookkeeping: `t` is the frame's timestamp. A frame is a candidate only when the previous frame belonged
    // to the same gesture (so the pause before a gesture is never a slow frame) and was less than a second ago
    function gestureFrame(t) {
      if (STATIC2D) return;
      const live = gestureLive();
      if (live && !wasLive) {
        gestureT = t; pendingSlow.length = 0; slowFrames = 0;
        if (!stageLocked) { if (learnt > 0 && fastRun >= FAST_FRAMES && stage === learnt) { trialFast = 0; fastRun = 0; applyStage(learnt - 1); } else if (stage !== learnt && trialFast < FAST_FRAMES) applyStage(learnt); }
        if (stage >= 1) setRes(0.5);
      } else if (live && lastFrameT >= gestureT && t - lastFrameT < 1000) {
        const g = R.gpuMs ? R.gpuMs() : null;   // the GPU's own time where the timer extension answers, else the frame delta
        const dt = g != null ? g : t - lastFrameT;
        pendingSlow.push({ a: lastFrameT, b: t, slow: dt > RES_DROP_MS, fast: dt < FAST_MS, gpu: g != null });
      }
      settleFrames(false);
      wasLive = live; lastFrameT = t;
    }
    // settle the candidates older than one frame (all of them when `all`)
    function settleFrames(all) {
      while (pendingSlow.length > (all ? 0 : 1)) {
        const c = pendingSlow.shift();
        // the frame's own cost for the recovery test: the GPU time where the timer answers, else the frame's main-thread span (a 60 Hz
        // loop or a throttled tab stretches the interval between frames to 33 ms however light the frame is); escalation keeps the interval
        if (!c.gpu) { const span = frameSpans.find((f) => f[0] >= c.b - 4 && f[0] <= c.b + 40); if (span) c.fast = span[1] - span[0] < FAST_MS; }
        const wasStalled = !c.injected && stalled(c.a, c.b); stageTrace.push([Math.round(c.b - c.a), c.slow ? 1 : 0, c.fast ? 1 : 0, wasStalled ? 1 : 0, stage]); if (stageTrace.length > 48) stageTrace.shift();
        if (wasStalled) { stats.stallsIgnored++; continue; }
        if (c.slow) { if (++slowFrames >= SLOW_FRAMES) escalate(); }
        else slowFrames = 0;
        if (c.fast) {
          if (stage === learnt) fastRun++;
          else if (++trialFast >= FAST_FRAMES && !stageLocked) { learnt = stage; stats.learnt = learnt; stats.recoveries++; fastRun = 0; trialFast = 0; }
        } else { fastRun = 0; if (stage !== learnt) trialFast = 0; }
      }
    }
    // the suites: a gesture made of injected frame costs (ms), run through the same bookkeeping as real frames — the start-of-gesture
    // stage choice, then every frame settled as if the GPU timer had answered with that cost — so the stage logic is tested the
    // same on a one-core runner and a workstation (the 2a review: "twenty fast frames" depended on the runner's real frames)
    function feedGesture(costs) {
      if (STATIC2D) return;
      const t0 = performance.now(); gestureT = t0; pendingSlow.length = 0; slowFrames = 0;
      if (!stageLocked) { if (learnt > 0 && fastRun >= FAST_FRAMES && stage === learnt) { trialFast = 0; fastRun = 0; applyStage(learnt - 1); } else if (stage !== learnt && trialFast < FAST_FRAMES) applyStage(learnt); }
      let t = t0; for (const dt of costs) { pendingSlow.push({ a: t, b: t + dt, slow: dt > RES_DROP_MS, fast: dt < FAST_MS, gpu: true, injected: true }); t += dt; }
      settleFrames(true); wasLive = false; lastFrameT = 0;
    }
    // the suites: pin the stage (and stop it learning) or let it learn again
    function forceStage(n, lock) { if (n == null) { stageLocked = false; return; } stageLocked = !!lock; learnt = Math.max(learnt, n); slowFrames = 0; fastRun = 0; trialFast = 0; applyStage(n); if (!lock) learnt = n; stats.learnt = learnt; }
    function layout() {
      const r = el.getBoundingClientRect();
      cssW = Math.max(1, Math.round(r.width)); cssH = Math.max(1, Math.round(r.height));
      el.style.setProperty("--atlas2-h", cssH + "px");   // the sheets' height bound (styles.css, Phase 1d)
      el.classList.toggle("atlas2-narrow", cssW < NARROW_PX);   // the rail in two lines under NARROW_PX, whatever the pointer (the 2a review: a phone the flag missed clipped the speed control)
      dprNow = Math.min(2, window.devicePixelRatio || 1);
      R.resize(cssW, cssH, (window.devicePixelRatio || 1) * resScale);
      labelCanvas.width = Math.round(cssW * dprNow); labelCanvas.height = Math.round(cssH * dprNow);
      base = Math.min(cssW, cssH) * 0.46;
      view.cx = cssW / 2; view.cy = cssH / 2;
      needs = true;
      requestLayout("resize");
    }
    const zmax = () => Math.max(1, R_KM / (kmFloor() * base));
    // the cap is 150 m/px where tiles exist; without a tile index (an old core file) the finest resident level's 0.5 km
    const kmFloor = () => (STATIC2D ? 5 : tileIndex ? KM_PER_PX_FLOOR : 0.5);   // the still view stays at LOD 0 (5 km/px: the 10 km tolerance is two pixels)
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
        if (after) { view.lon += before.lon - after.lon; view.lat += before.lat - after.lat; clampView(); rotation(); }   // rotation(): the next unprojection before a frame has run must see this view (Phase 1d, the pinch audit)
      }
      invalidate();   // not a bare needs = true: a pinch reaches here with no frame scheduled, and set the zoom without a redraw until something else asked for one (Phase 1c)
    }
    function levelFor(k) { if (STATIC2D) return 0; let L = 0; while (L < LOD_KM_PER_PX.length && k < LOD_KM_PER_PX[L]) L++; return tileIndex ? L : Math.min(L, 2); }   // without a tile index (file://) the finest level is the finest resident one

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
          const tf = performance.now();
          spec.fetch(key, ac).then((payload) => { if (disposed) return; bytes += payload.bytes || 0; fetched++; if (spec.cost) spec.cost(key, { fetchMs: performance.now() - tf, bytes: payload.bytes || 0, at: performance.now() }); spec.toWorker(key, payload); })
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
      // the first-use cost of a relief patch (Phase 1d, the frame gate reports it ungated): fetch + decode, the
      // worker's compose, the main thread's upload — per key, in `stats.reliefCost`
      cost: (key, c) => { stats.reliefCost.push(Object.assign({ key }, c)); if (stats.reliefCost.length > 60) stats.reliefCost.shift(); },
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
    const stats = { frames: [], draw: [], uploads: {}, worker: null, escalations: 0, recoveries: 0, stallsIgnored: 0, longTasks: 0, stage: 0, learnt: 0, fetchMs: 0, firstPaintMs: 0, ready: false, level: 0, tiles: [], tileErrors: 0, water: null, waterFetchMs: 0, relief: null, reliefCost: [], labelLayout: [], labelSprite: [], labelDraw: [], gazetteer: null };
    const perfInHash = /[?&#/]perf\b/.test(location.hash || "");
    let needs = true, raf = 0, lastT = 0, disposed = false, perfOn = perfInHash || (() => { try { return localStorage.getItem(PERF_KEY) === "1"; } catch (e) { return false; } })(), stillAt = null;
    const t0 = performance.now();
    let lastPerfText = 0, lastTraceT = 0;
    function frame(t) {
      raf = 0;
      if (disposed) return;
      if (!el.isConnected) { dispose(); return; }
      if (lastT) { const dt = t - lastT; stats.frames.push(dt); if (stats.frames.length > 600) stats.frames.shift(); }
      if (perfOn && lastTraceT && t - lastTraceT < 1000) { (stats.frameTrace || (stats.frameTrace = [])).push([Math.round(t - lastTraceT), Object.assign({ histTri: R.rawStats.historyTriangles, meshes: R.rawStats.historyMeshes, resident: time.resident ? time.resident.size : 0 }, stats.taskMs ? Object.fromEntries(Object.entries(stats.taskMs).map(([k, v]) => [k, Math.round(v * 10) / 10])) : {})]); if (stats.frameTrace.length > 400) stats.frameTrace.shift(); }   // the suites and the console: what each frame spent its time on
      lastT = t; lastTraceT = t;
      const fs0 = performance.now();
      gestureFrame(t);
      if (time.fade && !STATIC2D) { timed(() => fadeStep(t), "fade"); needs = true; }
      if (time.playing) { timed(() => playStep(t), "play"); }
      if (needs) {
        needs = false;
        timed(plan, "plan");
        if (STATIC2D && ((dragging && moved) || coasting) && stillAt) {
          // the still view during a drag: the last frame blitted by the pointer's travel; the true frame comes on release
          const k = R2D / view.radius; let dl = view.lon - stillAt.lon; if (dl > 180) dl -= 360; else if (dl < -180) dl += 360;
          R.shift(-dl / k, (view.lat - stillAt.lat) / k);
        } else { timed(() => R.render(view), "render"); if (STATIC2D) stillAt = { lon: view.lon, lat: view.lat }; }
        stats.draw.push(R.rawStats.lastMs); if (stats.draw.length > 600) stats.draw.shift();
        timed(drawLabels, "labelsDraw");
        if (!stats.firstPaintMs && R.levelLoaded(0)) stats.firstPaintMs = Math.round(performance.now() - t0);
        if (perfOn && t - lastPerfText > 200) { lastPerfText = t; timed(perfText, "perfText"); }   // five times a second: the overlay is a DOM text block, and its relayout every frame cost more than the frame on a software rasteriser
      }
      frameSpans.push([fs0, performance.now()]); if (frameSpans.length > 8) frameSpans.shift();
      if (coasting) { coast(); }
      if (flying) { fly(t); }
      if (needs || coasting || flying || time.fade || time.playing) raf = requestAnimationFrame(frame); else lastT = 0;
    }
    // the view's derived state: level, admin-1 visibility, the tiles it wants (requested at once), the water and
    // relief it wants. Run by every frame and by setView, so `tilesSettled()` right after a setView already asks
    // about the NEW tiles
    let onScreenKey = "";
    function refreshOnScreen() {   // the change years, the ticks and the "no states" note follow the VIEW as well as the year
      if (!time.hist || !time.hist.ready || !time.faceCap) return;
      // keyed by the view and the ALIVE SET, not the year: the ticks are DOM (177 of them), and rebuilding them on every year of a
      // scrub cost a third of the frame (measured: 100 ms pointer frames against 67 ms for the same year changes without the DOM)
      const k = view.lon.toFixed(2) + "," + view.lat.toFixed(2) + "," + view.zoom.toFixed(3) + "," + (time.aliveKey || "") + "," + (time.present ? 1 : 0) + "," + cssW + "x" + cssH;
      if (k === onScreenKey) return; onScreenKey = k;
      const ys = changeYearsOnScreen(); const same = ys.length === time.changeYears.length && ys.every((y, i) => y === time.changeYears[i]); time.changeYears = ys; if (!same) drawTicks();
      // the alive faces now on screen (a pan since the last year change): their meshes, their arcs, the draw list
      if (time.alive.length && time.onScreenKey !== (time.aliveKey || "") + "@" + k) {
        const va = viewAngleNow(); const now = time.alive.filter((a) => faceOnScreen(a.face, va)); const nowKey = now.map((a) => a.face).join(",");
        if (nowKey !== (time.onScreenAlive || []).map((a) => a.face).join(",")) {
          time.onScreenAlive = now;
          time.aliveArcs = arcFlags(now);
          time.prevArcs = time.aliveArcs;
          wantMeshes(now.map((a) => a.face), true);
          if (time.view) time.view.faces = now.map((a) => ({ face: a.face, rgb: entColour(a.ent), hatch: hatchOf(a.ent) })).concat(time.fade ? time.view.faces.filter((f) => !time.aliveSet.has(f.face)) : []);
          uploadStyle(); invalidate();
        }
        time.onScreenKey = (time.aliveKey || "") + "@" + k;
      }
      railNote.hidden = time.present || time.onScreen.length > 0;
      if (!railNote.hidden) railNote.textContent = (time.hist.header.history && time.hist.header.history.slice ? "This copy carries the pilot slice of the past only (the Mediterranean and Near East, 550 BCE to 650 CE); open the Atlas over http for every state. " : "") + "No state taught by Folio’s cards is mapped for this year yet.";   // the layer shows the states the cards teach, not every state of the period (2b)
    }
    function plan() {
      clampView();
      view.radius = base * view.zoom; rotation();
      const k = kmPerPx();
      view.kmpp = k;
      // a finer level is not taken up while two fingers are down: a pinch from the globe crosses into LOD 1 at 16 km/px
      // and every frame of it would draw four times the primitives at full-screen fill — the finer level comes on release,
      // as a map app's tiles do (a coarser level is taken at once: it is the cheaper one); at stage 2 of the adaptive
      // degradation above, a live gesture draws one level coarser than the view wants
      const bias = lodBias(), wanted = Math.max(0, levelFor(k) - bias), level = (ptrs.size >= 2 && wanted > view.level) ? view.level : wanted;
      // a level the bias chose is the gesture's, not the labels': nothing is added or dropped while the globe moves (§2.9),
      // and the wanted level's layout comes with the release frame, when the bias lifts
      if (level !== view.level) { view.level = level; if (!bias) requestLayout("level"); }
      view.admin1 = layers.provinces && k < ADMIN1_KM_PER_PX && time.present;
      view.history = time.view; view.historyLevel = histLevelNow(); if (view.history) view.history.strokePx = view.level >= 3 ? (LOD_M_RESIDENT[2] / 1000) / k * 2 : 0;   // the coast stroke at the tile zooms: the resident level's tolerance, both sides
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
      // at stage 2 of the adaptive degradation a live gesture draws no relief either (the hillshade is two full-disc passes on a
      // software GPU); it returns with the release frame, as the finer level does
      view.relief.on = layers.relief && !bias; view.relief.strength = layers.strength;
      if (layers.relief && !reliefStarted) startRelief();
      view.relief.fade = Math.max(0, Math.min(1, (k - RELIEF_FADE[1]) / (RELIEF_FADE[0] - RELIEF_FADE[1])));
      if (layers.relief && reliefIndex && view.relief.fade > 0 && k < RELIEF_L1_KM_PER_PX && RELIEF_MAX_LEVEL >= 1) { view.relief.tiles = reliefKeysFor(1); reliefTiles.want(view.relief.tiles); }
      else view.relief.tiles = [];
      stats.level = view.level;
      refreshOnScreen();   // with the rotation and the level of THIS view (the ticks, [ ] and the "no states" note follow the view)
    }
    function invalidate() { needs = true; if (!raf && !disposed) raf = requestAnimationFrame(frame); }
    function perfText() {
      const f = stats.frames.slice(-120).sort((a, b) => a - b), n = f.length;
      const mean = n ? f.reduce((a, b) => a + b, 0) / n : 0, p95 = n ? f[Math.min(n - 1, Math.floor(0.95 * n))] : 0, max = n ? f[n - 1] : 0;
      const s = R.stats(), lt = landTiles.stats, wt = waterTiles.stats, rt = reliefTiles.stats;
      perfEl.textContent = `gesture stage ${stage} (learnt ${learnt}${stageLocked ? ", locked" : ""})  escalations ${stats.escalations}  recoveries ${stats.recoveries}  stalls ignored ${stats.stallsIgnored}  heap ${heapMB() == null ? "n/a" : heapMB() + " MB"}${R.gpuMs && R.gpuMs() != null ? "  gpu " + R.gpuMs().toFixed(1) + " ms" : ""}\n` +
        `frame ms (last ${n}): mean ${mean.toFixed(1)}  p95 ${p95.toFixed(1)}  max ${max.toFixed(1)}\n` +
        `draw ${s.lastMs.toFixed(2)} ms  ${s.triangles} tri  ${s.segments} seg  ${s.draws} calls\n` +
        `water: ${s.riverSegments} river seg${view.smoothRivers ? " (smoothed)" : ""}  ${s.lakeSegments} lake seg  ${s.lakeTriangles} lake tri  level ${s.waterLevel}  tiles ${s.waterTilesDrawn}/${view.waterTiles.length} (${wt.resident} resident)\n` +
        `relief: ${view.relief.on ? "on" : "off"} strength ${view.relief.strength.toFixed(2)} fade ${view.relief.fade.toFixed(2)}  patches ${s.reliefPatches}/${view.relief.tiles.length} (${s.reliefResident} resident, ${(rt.bytes / 1048576).toFixed(1)} MB fetched)\n` +
        `LOD ${s.level} (core ${s.coreLevel})  ${kmPerPx().toFixed(3)} km/px  zoom ${view.zoom.toFixed(2)}  gesture stage ${stage}${resScale < 1 ? " half-res" : ""}${lodBias() ? " coarser" : ""}\n` +
        `tiles: ${s.tilesDrawn} drawn, ${s.parentsDrawn} parents, ${view.tiles.length} wanted, ${lt.pending} pending, ${lt.resident} resident, ${lt.fetched} fetched (${(lt.bytes / 1024).toFixed(0)} KB), ${lt.evicted} evicted\n` +
        `lakes culled: ${s.lakeCulled} tri  ${s.lakeSegCulled} seg (under ${2} px²)\n` +
        `labels: ${L.placed.length} placed of ${L.candidates} (${layers.density}${PHONE ? ", phone" : ""})  layout ${L.lastLayoutMs.toFixed(1)} ms (p95 ${pct95(stats.labelLayout).toFixed(1)})  sprites ${(L.lastSpriteMs || 0).toFixed(1)} ms (p95 ${pct95(stats.labelSprite).toFixed(1)})  draw ${L.lastDrawMs.toFixed(2)} ms (p95 ${pct95(stats.labelDraw).toFixed(2)})\n` +
        `year ${fmtYear(time.year)}${time.present ? " (present)" : ""}  alive ${time.alive.length}  history ${s.historyFaces} faces ${s.historyTriangles} tri ${s.historySegments} seg  meshes ${s.historyMeshes}  year change p95 ${pct95(time.yearChange).toFixed(2)} ms${time.fade ? "  fading" : ""}${time.playing ? "  playing " + time.speed + "/s" : ""}\n` +
        `heap ${heapMB() == null ? "n/a" : heapMB() + " MB"}  dpr ${Math.min(2, window.devicePixelRatio || 1)}  ${cssW}×${cssH}${PHONE ? "  phone" : ""}`;
    }
    const pct95 = (arr) => { if (!arr.length) return 0; const a = arr.slice().sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(0.95 * a.length))]; };
    const heapMB = () => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null);
    /* the overlay: on from `#map2?perf`, from the P key, or from the About sheet's "Show frame statistics" switch, which is
       remembered per reader (PERF_KEY, localStorage behind try/catch) so the owner can turn it on from a phone with no special
       address; the address keeps its ?perf whatever the switch says */
    const perfSwitch = el.querySelector(".atlas2-perf-switch");
    function setPerf(on, remember) { perfOn = on; perfEl.hidden = !on; if (perfSwitch) perfSwitch.checked = !!on; if (remember) { try { localStorage.setItem(PERF_KEY, on ? "1" : "0"); } catch (e) {} } if (on) perfText(); }
    if (perfSwitch) perfSwitch.addEventListener("change", () => setPerf(perfSwitch.checked, true));

    /* ---------- the legend (Phase 1c; the layers control until then) ---------- */
    const inputs = {}; sheet.querySelectorAll("[data-layer]").forEach((i) => { const k = i.getAttribute("data-layer"); if (k === "density") (inputs.density = inputs.density || []).push(i); else inputs[k] = i; });
    function reflectLayers() {
      for (const k of ["borders", "provinces", "countries", "places", "physical", "cities", "rivers", "lakes", "relief", "graticule"]) inputs[k].checked = !!layers[k];
      inputs.strength.value = String(layers.strength); inputs.strength.disabled = !layers.relief || STATIC2D || FILE;
      inputs.relief.disabled = STATIC2D || FILE;   // the still view and a file:// page have no relief (the note in the sheet says why)
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
    const sheetOpenClass = () => el.classList.toggle("atlas2-sheet-open", !sheet.hidden || !el.querySelector(".atlas2-about").hidden);
    const openSheet = (open) => { sheet.hidden = !open; layersBtn.setAttribute("aria-expanded", String(open)); if (open) { const ab = el.querySelector(".atlas2-about"); if (ab && !ab.hidden) { ab.hidden = true; el.querySelector(".atlas2-about-btn").setAttribute("aria-expanded", "false"); } } if (open && PHONE) closeCard(); sheetOpenClass(); };
    layersBtn.addEventListener("click", () => { openSheet(sheet.hidden); requestLayout("chrome"); });
    el.querySelector(".atlas2-sheet .atlas2-sheet-close").addEventListener("click", () => { openSheet(false); requestLayout("chrome"); });
    /* About this map (Phase 1d): the `?` control, keyboard help, the caution sentence, the credits link. Opening it shuts
       the legend (one sheet at a time, on a phone they share the bottom); focus goes to its title and comes back to the
       button on close */
    const aboutBtn = el.querySelector(".atlas2-about-btn"), aboutEl = el.querySelector(".atlas2-about");
    const openAbout = (open) => { aboutEl.hidden = !open; aboutBtn.setAttribute("aria-expanded", String(open)); if (open) { openSheet(false); if (PHONE) closeCard(); aboutEl.querySelector(".atlas2-about-close").focus({ preventScroll: true }); } else if (aboutEl.contains(document.activeElement)) aboutBtn.focus({ preventScroll: true }); sheetOpenClass(); };
    aboutBtn.addEventListener("click", () => { openAbout(aboutEl.hidden); requestLayout("chrome"); });
    el.querySelector(".atlas2-about-close").addEventListener("click", () => { openAbout(false); requestLayout("chrome"); });
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
          // the place under the fingers' old midpoint lands under their new one: zoom, then move by the difference of the two
          // unprojections (a pixel pan at the centre's scale drifted 4–6° over a 40-step pinch off centre — the Phase 1d audit)
          const before = unproject(pinchMid.x - rect.left, pinchMid.y - rect.top);
          view.zoom *= d / pinch; clampView(); view.radius = base * view.zoom; rotation();
          const after = unproject(mid.x - rect.left, mid.y - rect.top);
          if (before && after) { let dl = before.lon - after.lon; if (dl > 180) dl -= 360; else if (dl < -180) dl += 360; view.lon += dl; view.lat += before.lat - after.lat; clampView(); }
          else { const k = degPerPx(); view.lon -= (mid.x - pinchMid.x) * k; view.lat += (mid.y - pinchMid.y) * k; clampView(); }
          rotation();   // two pointer events arrive per touch move, faster than frames: the second must unproject against this view, not the last frame's
          invalidate();
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
    let lastTap = null, tapTimer = 0;   // the last touch tap and the timer that turns it into a pick unless a second tap makes it a zoom (§2.9, Phase 1d)
    const TAP_MS = 260;
    function ptrUp(e) {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.delete(e.pointerId);
      if (ptrs.size === 1) { const p = [...ptrs.values()][0]; dragging = true; last = { x: p.x, y: p.y }; pinch = 0; return; }
      if (ptrs.size > 1) return;
      const wasDrag = dragging; dragging = false;
      if (wasDrag && !moved && e.type === "pointerup") {
        const rect = canvas.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
        if (e.pointerType !== "touch") { pickAt(x, y); return; }
        // touch: a second tap within TAP_MS and 30 px of the first zooms in about the spot instead of picking; a single tap picks
        // after the window closes (a pick costs two ID passes, which on a slow GPU would push the second tap past the window)
        if (tapTimer && lastTap && Math.hypot(lastTap.x - x, lastTap.y - y) < 30) { clearTimeout(tapTimer); tapTimer = 0; lastTap = null; zoomAt(2, x, y); touched(); gestureEnded(); return; }
        if (tapTimer) { clearTimeout(tapTimer); tapTimer = 0; }
        lastTap = { x, y };
        tapTimer = setTimeout(() => { tapTimer = 0; lastTap = null; if (!disposed) pickAt(x, y); }, TAP_MS);
        return;
      }
      if (wasDrag && moved && (performance.now() - lastMoveT) < 60 && Math.hypot(velLon, velLat) > 0.02 && !reduced()) { coasting = true; invalidate(); }   // no fling under reduced motion (§2.9)
      touched();
      gestureEnded();
      if (STATIC2D) invalidate();   // the static view redraws on release (Phase 1d)
    }
    canvas.addEventListener("pointerup", ptrUp); canvas.addEventListener("pointercancel", ptrUp);
    function coast() {
      view.lon += velLon * 16; view.lat += velLat * 16; velLon *= 0.92; velLat *= 0.92;
      if (Math.hypot(velLon, velLat) < 0.002) { coasting = false; touched(); gestureEnded(); }
      needs = true;
    }
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const f = Math.exp(-Math.max(-120, Math.min(120, e.deltaY)) * 0.0025);
      lastWheelT = performance.now();
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => { wheelTimer = 0; gestureEnded(); }, 220);
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
      else if (e.key === "Escape") { if (!aboutEl.hidden) openAbout(false); else if (!sheet.hidden) openSheet(false); else clearSelection(); }
      else if (e.key === "?") openAbout(aboutEl.hidden);
      else if (e.key === "/") { searchIn.focus(); searchIn.select(); }
      else if (e.key === "p" || e.key === "P") setPerf(!perfOn, true);
      else if (e.key === "r" || e.key === "R") setLayers({ relief: !layers.relief });
      else if (e.key === "[") stepChange(-1); else if (e.key === "]") stepChange(1);
      else used = false;
      if (used) { e.preventDefault(); clampView(); invalidate(); touched(); }
    });
    // Escape anywhere in the Atlas (the card, the search box, the key list) clears the selection and shuts the card
    el.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || e.target === canvas) return;
      if (e.target === searchIn && !resultsUl.hidden) { closeResults(); return; }
      if (!aboutEl.hidden) { openAbout(false); return; }                                   // the About sheet first (Phase 1d)
      if (!sheet.hidden && sheet.contains(e.target)) { openSheet(false); layersBtn.focus({ preventScroll: true }); return; }   // then the legend, focus back on its button
      const inCard = cardEl.contains(e.target);
      clearSelection();                                   // closeCard sends focus back to the card's opener
      if (!inCard) canvas.focus({ preventScroll: true });
    });
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
        if (header.tiles && !FILE && !STATIC2D) { tileIndex = {}; for (const z of Object.keys(header.tiles)) { const t = header.tiles[z]; tileIndex[z] = { cols: t.cols, rows: t.rows, present: new Set(t.present) }; } }   // no tile is fetched from a file or drawn by the still view
        faceOfEntity = new Map(); for (let i = 0; i < faceEntity.length; i++) if (!faceOfEntity.has(faceEntity[i])) faceOfEntity.set(faceEntity[i], i);
        entityIndexById = new Map(header.entities.map((e, i) => [e.id, i]));
        if (pendingZoom) { view.zoom = pendingZoom; pendingZoom = 0; clampView(); plan(); invalidate(); }   // a deep link's zoom past the old floor, now that the tile index says the cap is 150 m/px
        if (!gazStarted) startGazetteer();
        coreIn = true; if (!histStarted && (histWanted || time.year < PRESENT_YEAR)) startHistory();   // 2b: the borders of the past load the first time the rail leaves today, not at boot
        say("Shaping the land…", 0.35); return;
      }
      if (m.type === "gazetteer") { gazInWorker = true; requestLayout("gazetteer", true); return; }
      if (m.type === "progress") { if (!stats.ready) say(m.text, m.frac); return; }
      if (m.type === "layout") { applyLayout(m); return; }
      if (m.type === "lod") {
        const tu = performance.now();
        bracket(() => R.setLevel(m.level, { segs: m.segs, segRange: m.segRange, segCap: m.segCap, segRangeA1: m.segRangeA1, segCapA1: m.segCapA1, facePos: m.facePos, faceIdx: m.faceIdx, faceRange: m.faceRange, faceCap: m.faceCap }));
        stats.uploads[m.level] = Math.round(performance.now() - tu);
        say(m.level === 0 ? "Drawing…" : "Adding detail…", 0.5 + 0.17 * (m.level + 1));
        invalidate();
        return;
      }
      if (m.type === "tile") { landTiles.arrived(m.key, { tile: m.tile, stats: m.stats }); bracket(() => R.setTile(m.key, { segs: m.segs, segRange: m.segRange, segCap: m.segCap, segRangeA1: m.segRangeA1, segCapA1: m.segCapA1, facePos: m.facePos, faceIdx: m.faceIdx, faceRange: m.faceRange, faceCap: m.faceCap }, m.tile)); stats.tiles.push(m.stats); if (stats.tiles.length > 200) stats.tiles.shift(); invalidate(); return; }
      if (m.type === "water-meta") {
        waterKeep = null;
        waterHeader = m.header; waterFaceEntity = m.faceEntity || null; arcRiver = m.arcRiver || null;
        const t = waterHeader.tiles && waterHeader.tiles[Object.keys(waterHeader.tiles)[0]];
        if (t && !FILE && !STATIC2D) waterIndex = { cols: t.cols, rows: t.rows, present: new Set(t.present) };
        stats.water = { parseMs: m.parseMs, levels: [], entities: waterHeader.entities.length, rivers: (waterHeader.rivers || []).length };
        requestLayout("water", true);
        return;
      }
      if (m.type === "water-lod") {
        const d = { lakeSegs: m.lakeSegs, lakeRange: m.lakeRange, lakeCap: m.lakeCap, riverSegs: m.riverSegs, riverRange: m.riverRange, riverCap: m.riverCap, facePos: m.facePos, faceIdx: m.faceIdx, faceRange: m.faceRange, faceCap: m.faceCap, lakeBins: m.lakeBins || null };
        if (m.smoothSegs) { d.smoothSegs = m.smoothSegs; d.smoothRange = m.smoothRange; d.smoothCap = m.smoothCap; }
        bracket(() => R.setWaterLevel(m.level, d), "waterLevel");
        if (stats.water) stats.water.levels.push(m.stats);
        invalidate(); return;
      }
      if (m.type === "water-tile") { waterTiles.arrived(m.key, { tile: m.tile, stats: m.stats }); bracket(() => R.setWaterTile(m.key, { lakeSegs: m.lakeSegs, lakeRange: m.lakeRange, lakeCap: m.lakeCap, facePos: m.facePos, faceIdx: m.faceIdx, faceRange: m.faceRange, faceCap: m.faceCap }, m.tile), "waterTile"); invalidate(); return; }
      if (m.type === "relief") {
        let rgb = m.rgb;
        if (!rgb && m.planes) rgb = composeOnMain(m.planes, m.w, m.h);   // no OffscreenCanvas in the worker: compose here
        reliefTiles.arrived(m.key, { w: m.w, h: m.h });
        const tu = performance.now();
        bracket(() => R.setRelief(m.key, { w: m.w, h: m.h, rgb, tile: m.key === "0" ? null : reliefTileOf(m.key) }), "relief");
        { const c = stats.reliefCost.find((x) => x.key === m.key && x.uploadMs == null); if (c) { c.composeMs = Math.round(tu - c.at); c.uploadMs = Math.round((performance.now() - tu) * 10) / 10; delete c.at; } }
        stats.relief = stats.relief || { tiles: 0 }; stats.relief.tiles++;
        invalidate(); return;
      }
      if (m.type === "history-meta") { onHistoryMeta(m); return; }
      if (m.type === "history-segs") { bracket(() => R.setHistorySegs(m.level, { segs: m.segs, segRange: m.segRange, segCap: m.segCap }), "histSegs"); if (time.hist) time.hist.segLevels++; invalidate(); return; }
      if (m.type === "history-faces") { onHistoryFaces(m); return; }
      if (m.type === "history-done") { if (time.hist) { time.hist.ready = true; time.hist.stats = { ms: m.ms, arcs: m.arcs, faces: m.faces }; } applyYear(time.year, { why: "ready" }); return; }
      if (m.type === "done") { loadBuffer = null; stats.worker = m.stats; stats.ready = true; status.hidden = true; el.setAttribute("data-ready", "1"); if (pendingPlace && G.ready && selectById(pendingPlace, { open: true, fly: false, push: false })) pendingPlace = null; invalidate(); requestLayout("ready", true); }
    }
    /* a restored GL context (Phase 1c): the renderer dropped everything; the worker sends the resident levels
       again from the files it kept, the loaders fetch their tiles again, relief is asked for again */
    function restoreAfterLoss() {
      landTiles.reset(); waterTiles.reset(); reliefTiles.reset();
      time.resident.clear(); time.lru.length = 0; time.wanted.clear();
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
    // the main-thread shim (Phase 1d): the worker's file as a plain script, earcut beside it, the same messages, yielding
    // every 40 ms so no task holds the page past about 100 ms; its progress drives the status line
    let loadBuffer = null;   // the topology, kept on this thread until the worker says `done`, so a worker that dies can be replaced by the shim
    function startShim(buffer, why) {
      stats.shim = why;
      Promise.all([root.earcut ? null : loadScript("atlas/vendor/earcut.js"), root.AtlasWorkerMain ? null : loadScript("atlas/atlas-worker.js")]).then(() => {
        if (disposed) return;
        shim = root.AtlasWorkerMain;
        shim.handle({ type: "load", buffer }, onMessage, (text, frac) => { if (!stats.ready) say(text, frac); });
        if (waterBuffer) { const wb = waterBuffer; waterBuffer = null; postToWorker({ type: "water", buffer: wb }); }
        else if (waterKeep && !waterHeader) postToWorker({ type: "water", buffer: waterKeep });   // the worker had it and died with it
      }, () => fail("The Atlas worker could not be loaded."));
    }
    function startWorker(buffer) {
      const t = performance.now();
      loadBuffer = buffer;
      try {
        if (FILE) throw new Error("file:");
        worker = new Worker("atlas/atlas-worker.js");
        worker.onmessage = (e) => onMessage(e.data);
        // a worker that fails before the land is in (its script refused, a syntax error, an exception) is replaced by the shim
        worker.onerror = (e) => { if (e && e.preventDefault) e.preventDefault(); if (stats.ready || shim) return; try { worker.terminate(); } catch (x) {} worker = null; stats.workerError = String(e && e.message || "error"); say("Shaping the land here instead…", 0.32); startShim(loadBuffer, "worker failed: " + stats.workerError); };
        worker.postMessage({ type: "load", buffer });   // a copy, not a transfer: the original stays here for the fallback above
      } catch (e) {
        startShim(buffer, FILE ? "file://" : "no Worker: " + (e && e.message || e));
      }
      stats.workerStartMs = Math.round(performance.now() - t);
    }
    // a `.js` twin (lib/twin.js): window.ATLAS_TWIN[name] = { bytes, sha256, b64 }; decoded by fetch() of a data: URL, which a
    // file:// page may do and which runs off the main thread
    async function loadTwin(name, label) {
      say("Reading " + label + "…", 0.1);
      await loadScript("atlas/data/" + name + ".js");
      const tw = root.ATLAS_TWIN && root.ATLAS_TWIN[name];
      if (!tw || !tw.b64) throw new Error("no twin for " + name);
      let buffer;
      try { buffer = await (await fetch("data:application/octet-stream;base64," + tw.b64)).arrayBuffer(); }
      catch (e) { const bin = atob(tw.b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); buffer = u8.buffer; }
      if (buffer.byteLength !== tw.bytes) throw new Error(label + " twin decoded to " + buffer.byteLength + " bytes, not " + tw.bytes);
      try { if (crypto && crypto.subtle) { const d = await crypto.subtle.digest("SHA-256", buffer); const hex = [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join(""); if (hex !== tw.sha256) throw new Error(label + " twin's bytes do not match its sha256"); stats.twinVerified = (stats.twinVerified || 0) + 1; } } catch (e) { if (/sha256/.test(String(e))) throw e; }
      tw.b64 = null;   // 4–6 MB of text the page no longer needs
      return buffer;
    }
    (async () => {
      const t = performance.now();
      try {
        if (FILE) {
          const buffer = await loadTwin("topology.bin", "the earth");
          stats.fetchMs = Math.round(performance.now() - t); stats.bytes = buffer.byteLength;
          if (disposed) return;
          say("Shaping the land…", 0.32);
          startWorker(buffer);
          return;
        }
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
    let waterStarted = false, waterFailed = false, waterBuffer = null, waterKeep = null;   // waterKeep: the file until `water-meta`, so a worker that dies can be replaced
    function startWater() {
      waterStarted = true;
      const t = performance.now();
      (FILE ? loadTwin("water.bin", "the rivers and lakes") : fetch(waterUrl).then((res) => { if (!res.ok) throw new Error("HTTP " + res.status); return res.arrayBuffer(); })).then((buffer) => {
        if (disposed) return;
        stats.waterFetchMs = Math.round(performance.now() - t); stats.waterBytes = buffer.byteLength;
        waterKeep = buffer;
        if (worker || shim) postToWorker({ type: "water", buffer }); else waterBuffer = buffer;   // a copy to a worker, in place to the shim
      }).catch((e) => { waterFailed = true; layersNote.hidden = false; layersNote.textContent = "The rivers and lakes didn’t arrive (" + (e && e.message ? e.message : e) + ")."; });
    }
    // the relief index, then L0; the frame loop asks for L1 tiles as the view needs them
    let reliefStarted = false, reliefFailed = false;
    function startRelief() {
      reliefStarted = true;
      if (STATIC2D) { reliefFailed = true; layersNote.hidden = false; layersNote.textContent = "Relief needs WebGL2, which this browser does not have."; return; }
      if (FILE) { reliefFailed = true; layersNote.hidden = false; layersNote.textContent = "Relief needs a web server: a browser will not fetch its images from a file."; return; }
      if (typeof createImageBitmap !== "function") { reliefFailed = true; layersNote.hidden = false; layersNote.textContent = "This browser cannot decode the relief images."; return; }
      fetch(reliefUrl + "relief.json").then((res) => { if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); }).then((idx) => {
        if (disposed) return;
        reliefIndex = idx;
        reliefTiles.want(["0"]);
        invalidate();
      }).catch((e) => { reliefFailed = true; layersNote.hidden = false; layersNote.textContent = "The relief didn’t arrive (" + (e && e.message ? e.message : e) + ")."; });
    }

    /* ================= Phase 2a: time — the step topology, the year, the rail, playback =================
       (docs/atlas-v2-design.md §1.4, §2.4, §2.9 and §7 "Phase 2a — as built"; the worker's half is in atlas-worker.js) */
    const time = { year: TODAY, present: true, hist: null, faceEntity: null, faceCap: null, faceArcOff: null, faceArcs: null, stepsOf: new Map(), ents: [], alive: [], aliveSet: new Set(), aliveArcs: new Set(), view: null, fade: null, prev: null,
      resident: new Set(), lru: [], meshBytes: new Map(), meshTotal: 0, wanted: new Set(), pending: 0, selected: -1, playing: false, speed: 25, playY: 0, playT: 0, dir: 1, lastYear: TODAY, dragging: false, seq: 0, changeYears: [], onScreen: [], capitals: [], style: null, arcTab: null, yearChange: [], loadMs: 0, histStarted: false, failed: false };
    let histStarted = false, histWanted = false, coreIn = false;
    // the first touch of the rail, a year before today, a deep link's year or a suite: fetch the history file now (once)
    function ensureHistory() { histWanted = true; if (!histStarted && coreIn) startHistory(); }
    const reducedNow = () => reduced();
    const fmtYear = (y) => (y < 0 ? (-y) + " BCE" : y === 0 ? "1 BCE" : y + " CE");   // every year with its era ("1 CE", "300 BCE", "2026 CE"): a bare "1" in the year box read as nothing (the 2a phone review)
    // "500 BCE", "500 BC", "-44", "44", "44 CE", "AD 70", "1066": null when it is none of these
    function parseYear(text) {
      const t = String(text || "").trim().replace(/[,\.]/g, "").toUpperCase();
      let m = /^(-?\d{1,5})$/.exec(t); if (m) return Number(m[1]);
      m = /^(\d{1,5})\s*(BCE|BC)$/.exec(t); if (m) return -Number(m[1]);
      m = /^(\d{1,5})\s*(CE|AD)$/.exec(t); if (m) return Number(m[1]);
      m = /^(AD|CE)\s*(\d{1,5})$/.exec(t); if (m) return Number(m[2]);
      return null;
    }
    const clampYear = (y) => Math.max(RAIL_FROM, Math.min(TODAY, Math.round(y)));
    /* the rail's scale: piecewise linear with the knee (Q-T2 a) */
    const railX = (y) => (y <= RAIL_KNEE_YEAR ? (y - RAIL_FROM) / (RAIL_KNEE_YEAR - RAIL_FROM) * RAIL_KNEE_X : RAIL_KNEE_X + (y - RAIL_KNEE_YEAR) / (TODAY - RAIL_KNEE_YEAR) * (1 - RAIL_KNEE_X));
    const railYearAt = (x) => (x <= RAIL_KNEE_X ? RAIL_FROM + x / RAIL_KNEE_X * (RAIL_KNEE_YEAR - RAIL_FROM) : RAIL_KNEE_YEAR + (x - RAIL_KNEE_X) / (1 - RAIL_KNEE_X) * (TODAY - RAIL_KNEE_YEAR));
    function startHistory() {
      histStarted = true; time.histStarted = true;
      railNote.hidden = false; railNote.textContent = "Loading the years…";   // the quiet loading state: never a blank rail while the file is on its way
      const t = performance.now();
      const url = opts.historyUrl || "atlas/data/history.bin";
      (FILE ? loadTwin("history.bin", "the borders of the past") : fetch(url).then((res) => { if (!res.ok) throw new Error("HTTP " + res.status); return res.arrayBuffer(); })).then((buffer) => {
        if (disposed) return;
        time.loadMs = Math.round(performance.now() - t); time.bytes = buffer.byteLength;
        postToWorker({ type: "history", buffer });
      }).catch((e) => { time.failed = true; time.failWhy = String(e && e.message || e); railNote.hidden = false; railNote.textContent = "The borders of the past didn’t arrive (" + time.failWhy + ")."; });
    }
    function onHistoryMeta(m) {
      const H = m.header;
      time.hist = { header: H, ready: false, segLevels: 0 };
      time.faceEntity = m.faceEntity; time.faceCap = m.faceCap; time.faceArcOff = m.faceArcOff; time.faceArcs = m.faceArcs;
      time.ents = H.entities; time.entIndex = null;
      // steps per entity, sorted by year, as [from, to, face]
      time.stepsOf = new Map();
      for (const st of H.steps) { let l = time.stepsOf.get(st[0]); if (!l) time.stepsOf.set(st[0], l = []); l.push([st[1], st[2], st[3]]); }
      for (const [, l] of time.stepsOf) l.sort((a, b) => a[0] - b[0]);
      // synthetic rows so the labels, the stack and the card know these places
      H.entities.forEach((e, i) => {
        const steps = time.stepsOf.get(i) || [];
        const faceOfFirst = steps.length ? steps[0][2] : -1; let at = null;
        if (faceOfFirst >= 0) { const c = [time.faceCap[4 * faceOfFirst], time.faceCap[4 * faceOfFirst + 1], time.faceCap[4 * faceOfFirst + 2]]; at = [Math.atan2(c[1], c[0]) * R2D, Math.asin(Math.max(-1, Math.min(1, c[2]))) * R2D]; }
        const row = { id: e.id, name: e.name, kind: e.kind, hist: true, ent: i, at, span: e.span, wiki: e.wiki || null, qid: e.qid || null, key: fold(e.name), akeys: (e.sourceNames || []).map(fold), rank: 0, len: 0, aliases: [] };
        G.byId.set(e.id, row);
      });
      for (const c of H.cities || []) { const id = "cap:" + c.entity + ":" + c.name; if (!G.byId.has(id)) G.byId.set(id, { id, name: c.name, kind: "capital", hist: true, city: c, at: [c.lon, c.lat], within: c.entity, key: fold(c.name), akeys: [], rank: 0, len: 0, aliases: [] }); }
      if (pendingPlace && G.ready && stats.ready && G.byId.has(pendingPlace) && selectById(pendingPlace, { open: true, fly: false, push: false })) pendingPlace = null;   // the deep link's history place, now that its row exists
      // the colour of each entity (2b): a slot of a fixed palette, chosen once over every epoch so that two polities sharing a
      // border in a year never share a slot, and an entity keeps its slot across the years wherever that allows
      assignSlots();
      histColours();
      applyYear(time.year, { why: "meta" });
    }
    const SLOTS = 16;   // the palette: SLOTS hues round the wheel, each blended with the theme's ink or paper (histColours)
    /* slots per entity as [[fromYear, slot], …] (a change only where a neighbour forced one). Greedy, deterministic: the epochs
       (every change year of the file) in order; in each, the alive polities in entity order keep their current slot unless an
       alive neighbour holds it, else take the first slot no neighbour holds, preferring one no alive polity holds at all; a
       contested face is adjacent to both partners' neighbours; a nested face takes its member's slot. ~1,500 epochs × tens of
       polities: a few milliseconds at load. */
    function assignSlots() {
      const years = new Set(); for (const [, l] of time.stepsOf) for (const st of l) { years.add(st[0]); years.add(st[1] + 1); }
      const ys = [...years].sort((a, b) => a - b);
      const cur = new Map(), hist = new Map();   // entity → slot now; entity → [[year, slot]…]
      const owners = (ent) => { const e = time.ents[ent]; return e.kind === "polity" ? [ent] : e.partners.map(entityIndexOfId).filter((i) => i >= 0); };
      let lastKey = "";
      for (const y of ys) {
        const alive = aliveAt(y); const key = alive.map((a) => a.face).join(","); if (key === lastKey) continue; lastKey = key;
        // adjacency over the faces' non-coast arcs: an arc used by two faces joins every owner of one to every owner of the other
        const byArc = new Map();
        for (const a of alive) for (let k = time.faceArcOff[a.face]; k < time.faceArcOff[a.face + 1]; k++) { const arc = time.faceArcs[k]; let l = byArc.get(arc); if (!l) byArc.set(arc, l = []); l.push(a.ent); }
        const adj = new Map(); const link = (p, q) => { if (p === q) return; let l = adj.get(p); if (!l) adj.set(p, l = new Set()); l.add(q); };
        for (const [, l] of byArc) if (l.length > 1) for (const p of l) for (const q of l) for (const po of owners(p)) for (const qo of owners(q)) link(po, qo);
        for (const a of alive) { const e = time.ents[a.ent]; if (e.kind !== "polity") for (const o of owners(a.ent)) for (const o2 of owners(a.ent)) link(o, o2); }   // the partners of a contested face are neighbours
        const polities = [...new Set(alive.flatMap((a) => owners(a.ent)))].sort((p, q) => p - q);
        const used = new Set(polities.map((p) => cur.get(p)).filter((v) => v != null));
        for (const p of polities) {
          const taken = new Set(); for (const q of adj.get(p) || []) { const sq = cur.get(q); if (sq != null) taken.add(sq); }
          const mine = cur.get(p);
          if (mine != null && !taken.has(mine)) continue;
          let pick = -1;
          for (let k = 0; k < SLOTS && pick < 0; k++) { const sl = (p * 7 + k) % SLOTS; if (!taken.has(sl) && !used.has(sl)) pick = sl; }
          for (let k = 0; k < SLOTS && pick < 0; k++) { const sl = (p * 7 + k) % SLOTS; if (!taken.has(sl)) pick = sl; }
          if (pick < 0) pick = (p * 7) % SLOTS;
          cur.set(p, pick); used.add(pick); let h = hist.get(p); if (!h) hist.set(p, h = []); h.push([y, pick]);
        }
      }
      time.slots = hist;
    }
    const slotAt = (ent, y) => { const h = time.slots && time.slots.get(ent); if (!h || !h.length) return ent % SLOTS; let s = h[0][1]; for (const [from, sl] of h) { if (from > y) break; s = sl; } return s; };
    let histRGB = [], histBorderCss = "";
    function histColours() {
      const { ink, paper, dark } = themeTokens();
      const hsl = (h, sat, lum) => { const c = (1 - Math.abs(2 * lum - 1)) * sat, x = c * (1 - Math.abs((h / 60) % 2 - 1)), mm = lum - c / 2; const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return [r + mm, g + mm, b + mm]; };
      // the slots: hues spread round the wheel in a golden-angle order (neighbouring slot numbers are far apart in hue), two
      // lightness steps so sixteen stay apart; blended with the theme's tokens so every theme keeps its own ink and land
      histRGB = []; for (let k = 0; k < SLOTS; k++) { const h = (k * 137.508) % 360, even = k % 2 === 0; histRGB.push(dark ? mix(hsl(h, 0.55, even ? 0.62 : 0.52), paper, 0.1) : mix(hsl(h, 0.6, even ? 0.48 : 0.58), ink, 0.08)); }
      const hb = dark ? mix(paper, ink, 0.35) : mix(paper, ink, 0.58);
      histBorderCss = hb; R.setHistoryBorderColor(hb);
      void paper;
    }
    // the colour of an entity in a year: a polity's slot; a contested face its first partner's; a nested face its member's
    const entColourAt = (i, y) => { const e = time.ents[i]; if (!e) return [0.5, 0.5, 0.5]; const p = e.kind === "polity" ? i : entityIndexOfId(e.partners[0]); return histRGB[slotAt(p, y)] || [0.5, 0.5, 0.5]; };
    const entColour = (i) => entColourAt(i, time.year);
    const hatchOf = (i) => (time.ents[i].kind === "contested" ? entColour(entityIndexOfId(time.ents[i].partners[1])) : null);
    const entityIndexOfId = (id) => { if (!time.entIndex) { time.entIndex = new Map(time.ents.map((e, i) => [e.id, i])); } const i = time.entIndex.get(id); return i == null ? -1 : i; };
    // the arcs of a set of faces as flags, one byte an arc (2b: a Set of tens of thousands of entries was a millisecond a year change)
    const arcFlags = (faces) => { const nA = time.hist ? time.hist.header.counts.arcs : 0; const f = new Uint8Array(nA); for (const a of faces) for (let k = time.faceArcOff[a.face]; k < time.faceArcOff[a.face + 1]; k++) f[time.faceArcs[k]] = 1; return f; };
    /* the alive set of a year: a binary search over each entity's steps */
    function aliveAt(y) {
      const out = [];
      for (const [ent, l] of time.stepsOf) { let lo = 0, hi = l.length - 1; while (lo <= hi) { const m = (lo + hi) >> 1; if (l[m][1] < y) lo = m + 1; else if (l[m][0] > y) hi = m - 1; else { out.push({ face: l[m][2], ent, from: l[m][0], to: l[m][1] }); break; } } }
      return out;
    }
    /* a face is ON SCREEN when its bounding cap meets the view's disc (a superset of the faces with a vertex in view) — the set the
       renderer draws, the meshes it asks for and the arc table it fills since 2b: at full scale a year has tens of faces alive the
       world over, and a Mediterranean view owes nothing to the Han dynasty's mesh or the Inca's borders */
    const viewAngleNow = () => Math.min(Math.PI / 2, (Math.hypot(cssW, cssH) / 2 + 80) / view.radius) + 0.02;
    const faceOnScreen = (fi, viewAngle) => { const rot = view.rot; const d = Math.max(-1, Math.min(1, time.faceCap[4 * fi] * rot[6] + time.faceCap[4 * fi + 1] * rot[7] + time.faceCap[4 * fi + 2] * rot[8])); return Math.acos(d) - time.faceCap[4 * fi + 3] <= (viewAngle != null ? viewAngle : viewAngleNow()); };
    /* the change years of the faces on screen (the rail's ticks and [ ]) */
    function changeYearsOnScreen() {
      if (!time.faceCap) return [];
      const rot = view.rot, viewAngle = Math.min(Math.PI / 2, (Math.hypot(cssW, cssH) / 2 + 80) / view.radius) + 0.02;
      const visEnt = new Set(), onScreen = [];
      for (const [ent, l] of time.stepsOf) for (const st of l) { const fi = st[2]; const d = Math.max(-1, Math.min(1, time.faceCap[4 * fi] * rot[6] + time.faceCap[4 * fi + 1] * rot[7] + time.faceCap[4 * fi + 2] * rot[8])); if (Math.acos(d) - time.faceCap[4 * fi + 3] <= viewAngle) { visEnt.add(ent); if (st[0] <= time.year && st[1] >= time.year) onScreen.push(fi); } }
      const ys = new Set();
      for (const ent of visEnt) for (const st of time.stepsOf.get(ent)) { ys.add(st[0]); if (st[1] + 1 <= TODAY) ys.add(st[1] + 1); }
      ys.add(PRESENT_YEAR);
      time.onScreen = onScreen;
      return [...ys].filter((y) => y >= RAIL_FROM && y <= TODAY).sort((a, b) => a - b);
    }
    /* THE YEAR: the alive set, the style tables, the meshes wanted (and the look-ahead), the layout */
    function applyYear(y, o) {
      o = o || {};
      const t0 = performance.now();
      y = clampYear(y);
      const wasPresent = time.present;
      time.dir = y >= time.lastYear ? 1 : -1; time.lastYear = time.year; time.year = y;
      time.present = y >= PRESENT_YEAR;
      if (!time.present && !histStarted) ensureHistory();
      railPin.setAttribute("aria-valuenow", String(y)); railPin.setAttribute("aria-valuetext", fmtYear(y));
      railPin.style.left = (railX(y) * 100) + "%";
      if (document.activeElement !== railYear) railYear.value = fmtYear(y);
      if (time.hist) {
        const alive = aliveAt(y);
        const key = alive.map((a) => a.face).join(",");
        const changed = key !== time.aliveKey;
        if (changed) {
          const prevFaces = time.onScreenAlive || [];
          time.aliveKey = key; time.alive = alive; time.aliveSet = new Set(alive.map((a) => a.face)); time.aliveEnt = new Set(alive.map((a) => time.ents[a.ent].id));
          const va = viewAngleNow(); time.onScreenAlive = alive.filter((a) => faceOnScreen(a.face, va)); time.onScreenKey = key + "@" + onScreenKey;
          time.aliveArcs = arcFlags(time.onScreenAlive);
          // the crossfade: when stepping or playing, never while the pin is dragged, never under reduced motion
          if (!o.drag && !reducedNow() && prevFaces.length + alive.length && o.why !== "meta" && o.why !== "ready") { time.fade = { from: prevFaces, fromArcs: time.prevArcs || null, t0: performance.now() }; } else time.fade = null;
          time.prevArcs = time.aliveArcs;
          wantMeshes(time.onScreenAlive.map((a) => a.face), true);
          if (!o.drag) lookAhead();
        }
        if (changed || time.fade || wasPresent !== time.present || o.force) uploadStyle(changed ? 1 : 1);
        time.view = { faces: time.onScreenAlive.map((a) => ({ face: a.face, rgb: entColour(a.ent), hatch: hatchOf(a.ent) })), present: time.present, strokePx: 0 };
        time.capitals = (time.hist.header.cities || []).filter((c) => c.from <= y && c.to >= y && alive.some((a) => time.ents[a.ent].id === c.entity)).map((c) => ({ entity: c.entity, name: c.name, lon: c.lon, lat: c.lat }));
        refreshOnScreen();   // the ticks and the note: rebuilt only when the alive set or the view changed (not on every year of a scrub)
      } else { time.view = { faces: [], present: time.present, strokePx: 0 }; if (!histStarted || time.failed) railNote.hidden = true; }
      if (wasPresent !== time.present) { if (sel.id && !G.byId.get(sel.id)?.hist && !time.present) clearSelection(); }
      if (!o.drag) { try { localStorage.setItem(YEAR_KEY, String(y)); } catch (e) {} }
      plan(); invalidate();
      if (o.why === "play") { const now = performance.now(); if (now - (time.lastPlayLayout || 0) > 500) { time.lastPlayLayout = now; requestLayout("year", true); } else requestLayout("year"); writeHash(false); }   // playing: a layout twice a second at most (one per frame starved the frame on a software rasteriser)
      else if (!o.drag) { requestLayout("year", true); writeHash(false); announce(fmtYear(y)); }
      else requestLayout("year");
      const ms = performance.now() - t0; time.yearChange.push(ms); if (time.yearChange.length > 600) time.yearChange.shift();
    }
    /* the style tables: a texel per face (colour, alpha) and per arc (alpha); the crossfade writes both sets with their alphas */
    function uploadStyle() {
      if (!time.hist || !time.faceEntity) return;
      const nF = time.faceEntity.length, nA = time.hist.header.counts.arcs;
      if (!time.style || time.style.length < Math.ceil(nF / 256) * 256 * 4) time.style = new Uint8Array(Math.max(1, Math.ceil(nF / 256)) * 256 * 4);
      if (!time.arcTab || time.arcTab.length < Math.ceil(nA / 256) * 256) time.arcTab = new Uint8Array(Math.max(1, Math.ceil(nA / 256)) * 256);   // one byte an arc (R8; 2b): a quarter of the upload a year change used to make
      time.style.fill(0); time.arcTab.fill(0);
      const { dark } = themeTokens(); const base = dark ? HIST_FILL_ALPHA_DARK : HIST_FILL_ALPHA;
      let tNow = 1; if (time.fade) tNow = Math.min(1, (performance.now() - time.fade.t0) / FADE_MS);
      const put = (fi, alphaScale) => { const ent = time.faceEntity[fi]; const c = entColour(ent); const a = (time.selected === ent ? HIST_SEL_ALPHA : base) * alphaScale; const o = 4 * fi; time.style[o] = Math.round(c[0] * 255); time.style[o + 1] = Math.round(c[1] * 255); time.style[o + 2] = Math.round(c[2] * 255); time.style[o + 3] = Math.max(time.style[o + 3], Math.round(a * 255)); };
      if (time.fade) for (const a of time.fade.from) if (!time.aliveSet.has(a.face)) put(a.face, 1 - tNow);
      for (const a of (time.onScreenAlive || time.alive)) put(a.face, time.fade ? tNow : 1);
      const alive = time.aliveArcs, from = time.fade ? time.fade.fromArcs : null, aOn = Math.round((time.fade ? tNow : 1) * 255), aOff = Math.round((1 - tNow) * 255);
      if (alive) { for (let ai = 0; ai < nA; ai++) { if (alive[ai]) time.arcTab[ai] = aOn; else if (from && from[ai]) time.arcTab[ai] = aOff; } }
      R.setHistoryStyle(nF, time.style); R.setHistoryArcTable(nA, time.arcTab);
    }
    function fadeStep(t) {
      if (!time.fade) return;
      const u = (t - time.fade.t0) / FADE_MS;
      // the fading faces stay in the draw list until the fade ends
      const fromFaces = time.fade.from.filter((a) => !time.aliveSet.has(a.face)).map((a) => ({ face: a.face, rgb: entColour(a.ent), hatch: null }));
      if (time.view) time.view.faces = (time.onScreenAlive || []).map((a) => ({ face: a.face, rgb: entColour(a.ent), hatch: hatchOf(a.ent) })).concat(fromFaces);
      uploadStyle();
      if (u >= 1) { time.fade = null; if (time.view) time.view.faces = (time.onScreenAlive || []).map((a) => ({ face: a.face, rgb: entColour(a.ent), hatch: hatchOf(a.ent) })); uploadStyle(); }
    }
    /* the meshes: ask the worker for what the year needs at the view's level, keep an LRU on the GPU */
    // the history level: the resident level, one coarser while a gesture (a pan, a scrub) runs at stage ≥ 1 — the fills are masked by the
    // land stencil at full resolution either way, and a software rasteriser pays per triangle and per segment, not per pixel (measured)
    const histLevelNow = () => Math.max(0, Math.min(2, view.level) - (stage >= 1 && !STATIC2D && gestureLive() ? 1 : 0));
    function wantMeshes(faces, urgent) {
      if (!time.hist) return;
      const level = histLevelNow();
      const need = faces.filter((fi) => !time.resident.has(fi + ":" + level) && !time.wanted.has(fi + ":" + level));
      if (!need.length) return;
      for (const fi of need) time.wanted.add(fi + ":" + level);
      time.pending++;
      postToWorker({ type: "history-faces", level, faces: need, seq: ++time.seq, urgent: !!urgent });
    }
    function lookAhead() {
      // the next change year in the direction of the scrub or the playback: its faces are asked for after the year's own
      const ys = time.changeYears.length ? time.changeYears : changeYearsOnScreen();
      const next = time.dir > 0 ? ys.find((y) => y > time.year) : ys.slice().reverse().find((y) => y < time.year);
      if (next == null) return;
      const va = viewAngleNow(); wantMeshes(aliveAt(next).filter((a) => faceOnScreen(a.face, va)).map((a) => a.face), false);
    }
    function onHistoryFaces(m) {
      time.pending = Math.max(0, time.pending - 1);
      bracket(() => { for (const mesh of m.meshes) { const key = mesh.face + ":" + mesh.level; time.wanted.delete(key); R.setHistoryMesh(key, mesh); time.resident.add(key); time.lru.push(key); const b = mesh.pos.byteLength + mesh.idx.byteLength + (mesh.coast ? mesh.coast.byteLength : 0); time.meshBytes.set(key, b); time.meshTotal += b; } }, "histMesh");
      for (const fi of m.faces || []) time.wanted.delete(fi + ":" + m.level);
      // the LRU, by bytes: drop the oldest meshes the year does not draw until the resident set fits MESH_BYTES
      const evicted = []; let spins = 0;
      while (time.meshTotal > MESH_BYTES && time.lru.length && spins++ < time.lru.length * 2) { const key = time.lru.shift(); const fi = Number(key.split(":")[0]); if (time.aliveSet.has(fi)) { time.lru.push(key); continue; } R.dropHistoryMesh(key); time.resident.delete(key); time.meshTotal -= time.meshBytes.get(key) || 0; time.meshBytes.delete(key); evicted.push(key); }
      if (evicted.length) postToWorker({ type: "history-evict", keys: evicted });
      invalidate();
    }
    const historySettled = () => !histStarted || time.failed || (!!time.hist && time.hist.ready && (time.onScreenAlive || []).every((a) => time.resident.has(a.face + ":" + Math.min(2, view.level))));
    /* ---- the rail ---- */
    function drawTicks() {
      const r = railTrack.getBoundingClientRect(); const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      const d = Math.min(2, window.devicePixelRatio || 1);
      if (railTicks.width !== Math.round(w * d) || railTicks.height !== Math.round(h * d)) { railTicks.width = Math.round(w * d); railTicks.height = Math.round(h * d); }
      const x = railTicks.getContext("2d"); x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, w, h);
      const { ink, dark } = themeTokens(); const hex = (c) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0")).join("");
      x.strokeStyle = hex(mix(ink, [0.5, 0.5, 0.5], dark ? 0.3 : 0.5)); x.lineWidth = 1;
      // the knee and the big marks
      x.globalAlpha = 0.45; x.beginPath(); x.moveTo(0, h / 2 + 0.5); x.lineTo(w, h / 2 + 0.5); x.stroke();
      x.globalAlpha = 0.7;
      for (const y of [-10000, -5000, -3000, -2000, -1000, -500, 1, 500, 1000, 1500, 2000]) { const px = Math.round(railX(y) * w) + 0.5; x.beginPath(); x.moveTo(px, h / 2 - 4); x.lineTo(px, h / 2 + 4); x.stroke(); }
      x.globalAlpha = 1; x.strokeStyle = hex(ink);
      // at most about TICKS_MAX ticks a view (2b): change years closer than a bucket merge into one tick, drawn taller the more it
      // stands for; [ and ] still step through every change year (stepChange reads the full list)
      const TICKS_MAX = 200; const bucket = w / TICKS_MAX; const merged = new Map();
      for (const y of time.changeYears) { const px = railX(y) * w; const b = Math.floor(px / bucket); let m = merged.get(b); if (!m) merged.set(b, m = { sx: 0, n: 0 }); m.sx += px; m.n++; }
      for (const [, m] of merged) { const px = Math.round(m.sx / m.n) + 0.5, hh = m.n > 1 ? 5 : 3; x.beginPath(); x.moveTo(px, h / 2 - hh); x.lineTo(px, h / 2 + hh); x.stroke(); }
    }
    function stepChange(dir) {
      if (!time.hist) { ensureHistory(); if (dir < 0 && time.present) setYear(PRESENT_YEAR - 1); return; }   // the file loads on the first step back (2b); the change years follow once it is in
      const ys = time.changeYears.length ? time.changeYears : changeYearsOnScreen();
      const next = dir > 0 ? ys.find((y) => y > time.year) : ys.slice().reverse().find((y) => y < time.year);
      if (next != null) setYear(next);
    }
    function setYear(y, o) { stopPlay(); applyYear(y, o); }
    // dragging the pin, with the magnifier: the pointer's x maps through the knee; a pointer lifted more than 30 px above the
    // rail enters FINE mode — one year per 3 px of travel from the year where it left the rail — for one-year precision on
    // a phone, where the coarse scale is a decade a pixel
    let railDrag = null;
    const railYearFromX = (clientX, rect) => { const r = rect || railTrack.getBoundingClientRect(); return clampYear(railYearAt(Math.max(0, Math.min(1, (clientX - r.left) / Math.max(1, r.width))))); };
    railTrack.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.preventDefault(); stopPlay();
      try { railTrack.setPointerCapture(e.pointerId); } catch (x) {}
      const y = railYearFromX(e.clientX);
      const rect0 = railTrack.getBoundingClientRect();
      railDrag = { id: e.pointerId, fine: false, fineX: 0, fineY: y, railTop: rect0.top, rect: rect0 };   // the track's box, measured once: a measure after a style write forces a layout on every move
      time.dragging = true; railMag.hidden = false; railPin.classList.add("atlas2-rail-live");
      applyYear(y, { drag: true }); showMag(y, false);
      railPin.focus({ preventScroll: true });
    });
    railTrack.addEventListener("pointermove", (e) => {
      if (!railDrag || e.pointerId !== railDrag.id) return;
      const above = railDrag.railTop - e.clientY;
      let y;
      if (above > 30) { if (!railDrag.fine) { railDrag.fine = true; railDrag.fineX = e.clientX; railDrag.fineY = time.year; } y = clampYear(railDrag.fineY + Math.round((e.clientX - railDrag.fineX) / 3)); }
      else { railDrag.fine = false; y = railYearFromX(e.clientX, railDrag.rect); }
      if (y !== time.year) applyYear(y, { drag: true });
      showMag(y, railDrag.fine);
    });
    const endRailDrag = (e) => { if (!railDrag || (e && e.pointerId !== railDrag.id)) return; railDrag = null; time.dragging = false; railMag.hidden = true; railPin.classList.remove("atlas2-rail-live"); applyYear(time.year, { force: true }); touched(); };
    railTrack.addEventListener("pointerup", endRailDrag); railTrack.addEventListener("pointercancel", endRailDrag);
    function showMag(y, fine) {
      railMag.textContent = fmtYear(y) + (fine ? " · fine" : "");
      railMag.style.left = (railX(y) * 100) + "%";
    }
    railPin.addEventListener("keydown", (e) => {
      let used = true;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") setYear(time.year - (e.shiftKey ? 10 : 1));
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") setYear(time.year + (e.shiftKey ? 10 : 1));
      else if (e.key === "PageDown") setYear(time.year - 100); else if (e.key === "PageUp") setYear(time.year + 100);
      else if (e.key === "Home") setYear(RAIL_FROM); else if (e.key === "End") setYear(TODAY);
      else if (e.key === "[") stepChange(-1); else if (e.key === "]") stepChange(1);
      else if (e.key === " " || e.key === "Enter") togglePlay();
      else used = false;
      if (used) e.preventDefault();
    });
    el.querySelector(".atlas2-rail-prev").addEventListener("click", () => stepChange(-1));
    el.querySelector(".atlas2-rail-next").addEventListener("click", () => stepChange(1));
    const commitYearInput = () => { const y = parseYear(railYear.value); if (y == null) { railYear.classList.add("atlas2-rail-bad"); railYear.setAttribute("aria-invalid", "true"); return false; } railYear.classList.remove("atlas2-rail-bad"); railYear.removeAttribute("aria-invalid"); setYear(y); return true; };
    railYear.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); if (commitYearInput()) railYear.blur(); } else if (e.key === "Escape") { railYear.value = fmtYear(time.year); railYear.blur(); } });
    railYear.addEventListener("change", commitYearInput);
    railYear.addEventListener("blur", () => { if (!commitYearInput()) railYear.value = fmtYear(time.year); });
    /* playback: every year, at the chosen speed; the counter ticks every year, the map changes only at steps */
    function togglePlay() { if (time.playing) stopPlay(); else startPlay(); }
    function startPlay() { if (time.year >= TODAY) applyYear(RAIL_FROM, { why: "play" }); time.playing = true; time.playY = time.year; time.playT = 0; railPlay.setAttribute("aria-pressed", "true"); railPlay.textContent = "❚❚"; railPlay.setAttribute("aria-label", "Pause"); invalidate(); }
    function stopPlay() { if (!time.playing) return; time.playing = false; railPlay.setAttribute("aria-pressed", "false"); railPlay.textContent = "▶"; railPlay.setAttribute("aria-label", "Play"); applyYear(time.year, { force: true }); }
    function playStep(t) {
      if (!time.playT) { time.playT = t; return; }
      const dt = Math.min(250, t - time.playT); time.playT = t;
      time.playY += time.speed * dt / 1000;
      const y = Math.floor(time.playY);
      if (y !== time.year) { if (y >= TODAY) { applyYear(TODAY, { why: "play" }); stopPlay(); return; } applyYear(y, { why: "play" }); }
    }
    railPlay.addEventListener("click", togglePlay);
    railSpeed.addEventListener("change", () => { time.speed = Number(railSpeed.value) || 25; });
    /* the rail's chrome follows the card on a phone (the sheet sits above it) */
    const railResize = () => { drawTicks(); };
    window.addEventListener("resize", railResize);
    // the initial year: the deep link's, else the last used, else today
    { let y = null; try { const v = localStorage.getItem(YEAR_KEY); if (v != null && v !== "" && isFinite(Number(v))) y = clampYear(Number(v)); } catch (e) {} time.year = y == null ? TODAY : y; time.lastYear = time.year; time.present = time.year >= PRESENT_YEAR; railPin.style.left = (railX(time.year) * 100) + "%"; railYear.value = fmtYear(time.year); railPin.setAttribute("aria-valuenow", String(time.year)); railPin.setAttribute("aria-valuetext", fmtYear(time.year)); }

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
        for (const r of G.rows) { G.byId.set(r.id, r); if (typeof r.geom === "string" && r.geom[0] === "r") { G.byRiver.set(Number(r.geom.slice(1)), r); for (const ei of (Array.isArray(r.alt) ? r.alt : [])) G.byRiver.set(ei, r); } }   // a merged river answers for every stretch (Phase 1d)
        G.ready = true;
        stats.gazetteer = { rows: G.rows.length, ms: Math.round(performance.now() - t) };
        if (pendingPlace && stats.ready && selectById(pendingPlace, { open: true, fly: false, push: false })) pendingPlace = null;
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
    const moving = () => dragging || ptrs.size > 0 || coasting || !!flying || !!time.dragging;   // a rail scrub holds the layout too: the names move when the pin drops
    function requestLayout(reason, now) {
      if (disposed) return;
      if (reason === "level") { const t = performance.now(); if (t - lastLevelLayout < 100) return; lastLevelLayout = t; now = true; }
      if (moving() && reason !== "level") { layoutHeld = reason; return; }
      if (layoutTimer) { clearTimeout(layoutTimer); layoutTimer = 0; }
      if (now) { sendLayout(reason); return; }
      layoutTimer = setTimeout(() => { layoutTimer = 0; if (moving()) { layoutHeld = reason; return; } sendLayout(reason); }, SETTLE_MS);
    }
    function touched() { if (moving()) { layoutHeld = "settle"; return; } requestLayout(layoutHeld || "settle"); layoutHeld = null; }
    /* THE CHROME'S RECTANGLES (Phase 2a, task 0d): every visible control, measured against the Atlas's box, sent with each
       layout as occupied ground — the search box and its list, the zoom stack, the Legend and ? chips, an open sheet, the
       card (or its phone strip), the stack chip, the status line, the mode note, the year rail. A sheet opening or closing
       asks for a layout, so the names step out from under it. */
    const CHROME = [".atlas2-search-in", ".atlas2-results", ".atlas2-zoom", ".atlas2-layers-btn", ".atlas2-sheet", ".atlas2-about-btn", ".atlas2-card", ".atlas2-stack", ".atlas2-status", ".atlas2-mode", ".atlas2-rail"];
    function chromeRects() {
      const base = el.getBoundingClientRect(), out = [], seen = new Set();
      for (const sel of CHROME) for (const node of el.querySelectorAll(sel)) {
        if (seen.has(node) || node.hidden || node.closest("[hidden]")) continue; seen.add(node);
        const cs = getComputedStyle(node); if (cs.display === "none" || cs.visibility === "hidden") continue;
        const r = node.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
        const x0 = Math.max(0, r.left - base.left), y0 = Math.max(0, r.top - base.top), x1 = Math.min(cssW, r.right - base.left), y1 = Math.min(cssH, r.bottom - base.top);
        if (x1 > x0 && y1 > y0) out.push([x0, y0, x1, y1]);
      }
      return out;
    }
    function sendLayout(reason) {
      if (!gazInWorker || !metricsSent || disposed) return;
      plan();
      const seq = ++layoutSeq;
      L.sentAt = performance.now();
      postToWorker({ type: "layout", seq, reason, chrome: chromeRects(), year: time.year, present: time.present, aliveFaces: time.hist ? time.alive.map((a) => a.face) : [], capitals: time.capitals, rot: Float32Array.from(view.rot), radius: view.radius, cx: view.cx, cy: view.cy, W: cssW, H: cssH, kmpp: view.kmpp, level: view.level, density: layers.density, phone: PHONE, show: { countries: layers.countries, places: layers.places, physical: layers.physical, cities: layers.cities, provinces: layers.provinces, rivers: layers.rivers, lakes: layers.lakes }, admin1: view.admin1, riversDrawn: view.rivers, selected: sel.id, debug: !!L.debug });
      if (reason === "settle" || reason === "level") writeHash(false);
    }
    function applyLayout(m) {
      if (m.seq !== layoutSeq) { if (m.seq < layoutSeq) return; }   // a newer request is on its way: this one is stale
      L.lastLayoutMs = m.ms || 0; stats.labelLayout.push(L.lastLayoutMs); if (stats.labelLayout.length > 600) stats.labelLayout.shift();
      L.candidates = m.candidates || 0; L.cap = m.cap || 0; L.seq = m.seq; L.why = m.why || null;
      if (m.error) console.error("atlas2 layout failed: " + m.error);
      const t0 = performance.now();
      // sprites are cached by what they look like (text, style, glyph layout, selection, dpr, theme): a layout re-renders only the
      // labels that are new or moved along a path — a scrub's layouts cost 100 ms of canvas text a second before this (measured)
      bracket(() => { for (const p of m.placed) { p.chars = [...p.text]; p.sprite = spriteFor(p); } }, "sprites");
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
    const spriteCache = new Map(); let spriteGen = 0;   // key → sprite; spriteGen bumps on a theme or font change
    function spriteKey(p) { if (!p.glyphs || !p.glyphs.length) return null; const x0 = Math.floor(p.box[0]), y0 = Math.floor(p.box[1]); let g = ""; for (const q of p.glyphs) g += (Math.round((q[0] - x0) * 4) + "," + Math.round((q[1] - y0) * 4) + "," + (q[2] ? Math.round(q[2] * 100) : 0) + "," + (q[3] ? 1 : 0) + ";"); return p.id + "|" + p.style + "|" + p.text + "|" + (p.id === sel.id ? 1 : 0) + "|" + dprNow + "|" + spriteGen + "|" + g; }
    function spriteFor(p) { const k = spriteKey(p); if (!k) return null; let sp = spriteCache.get(k); if (sp) { spriteCache.delete(k); spriteCache.set(k, sp); return sp; } sp = renderSprite(p); if (sp) { spriteCache.set(k, sp); if (spriteCache.size > 600) spriteCache.delete(spriteCache.keys().next().value); } return sp; }
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
        if (p.hist && time.aliveEnt && p.id.charCodeAt(0) === 112 && p.id.startsWith("pol:") && !time.aliveEnt.has(p.id)) continue;   // a polity no longer alive (the layout is held while the pin is dragged)
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
        // Phase 2a: a historical face answers first — the polity, or a contested face's two claimants; the present-day country
        // only in a present year (before it, it is not an entity)
        if (f && f.histFace != null && time.hist) { const e = time.ents[time.faceEntity[f.histFace]]; if (e) { if (e.kind === "contested") { for (const p of e.partners) add(G.byId.get(p)); add(G.byId.get(e.id)); } else add(G.byId.get(e.id)); } }
        else if (f && f.face != null && header && faceEntity && time.present) { const ent = header.entities[faceEntity[f.face]]; if (ent) { add(G.byId.get(ent.id)); if (ent.parent) add(G.byId.get(ent.parent)); } }
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
    /* announcements (§2.9, Phase 1d): one polite live region speaks the selection — "France, country" — and, when the
       stack chip is up, how many places share the spot; the caption's own live region speaks hover names */
    const announceEl = el.querySelector(".atlas2-announce");
    let announceTimer = 0;
    function announce(text) { if (announceTimer) clearTimeout(announceTimer); announceTimer = setTimeout(() => { announceTimer = 0; announceEl.textContent = ""; announceEl.textContent = text; }, 50); }
    function selectRow(row, o) {
      o = o || {};
      sel.id = row.id;
      const face = (row.kind === "country" || row.kind === "admin1") && time.present ? faceOfId(row.id) : null;
      R.select(face);
      time.selected = row.hist && row.ent != null ? row.ent : -1; if (time.hist) uploadStyle();
      caption.textContent = "";
      announce(row.name + ", " + (KIND_LABEL[row.kind] || row.kind).toLowerCase() + (sel.stack.length > 1 ? "; " + sel.stack.length + " places here" : ""));
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
      if (time.selected >= 0) { time.selected = -1; if (time.hist) uploadStyle(); }
      if (had) announce("Nothing selected");
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
      hoverTimer = setTimeout(() => { hoverTimer = 0; if (disposed || dragging || !R.levelLoaded(0)) return; const f = R.pick(view, x, y, "land"); const ent = f && f.histFace != null && time.hist ? time.ents[time.faceEntity[f.histFace]] : f && f.face != null && header && time.present ? header.entities[faceEntity[f.face]] : null; caption.textContent = ent ? ent.name : ""; }, 180);
    }

    /* ---- the place card: a side column, a bottom sheet on a phone that opens shut ---- */
    let cardRow = null, cardOpen = false, sheetUp = false, cardOpener = null;   // cardOpener: where focus was when the card opened; Escape and Close send it back there (§2.9)
    const kindLine = (row) => { const w = row.within ? G.byId.get(row.within) : null; return (KIND_LABEL[row.kind] || row.kind) + (w ? " · " + w.name : ""); };
    const wikiUrl = (title) => "https://en.wikipedia.org/wiki/" + encodeURIComponent(String(title).replace(/ /g, "_"));
    function openCard(row) {
      const wasOpen = cardOpen;
      if (!wasOpen) sheetUp = false;   // a phone's sheet opens shut every time (§7 Phase 1c); a second place while it is up keeps its height
      cardRow = row; cardOpen = true;
      cardEl.hidden = false;
      reflectSheet();
      cardTitle.textContent = row.name; cardKind.textContent = kindLine(row);
      cardBody.innerHTML = "";
      cardBody.scrollTop = 0;
      if (row.kind === "country") renderCountryCard(row); else renderPlaceCard(row);
      el.classList.add("atlas2-has-card");
      // focus moves to the heading when the card OPENS (not when a second place replaces the first); the opener is
      // remembered unless focus was already inside the card
      if (!wasOpen) { const a = document.activeElement; cardOpener = a && el.contains(a) && !cardEl.contains(a) ? a : canvas; cardTitle.focus({ preventScroll: true }); }
    }
    function closeCard(returnFocus) {
      const had = cardOpen;
      cardOpen = false; cardRow = null; cardEl.hidden = true; el.classList.remove("atlas2-has-card"); el.classList.remove("atlas2-card-up");
      if (had && returnFocus !== false) {
        const inside = document.activeElement && (cardEl.contains(document.activeElement) || document.activeElement === document.body);
        if (inside) { const back = cardOpener && cardOpener.isConnected && el.contains(cardOpener) ? cardOpener : canvas; back.focus({ preventScroll: true }); }
      }
      cardOpener = null;
    }
    el.querySelector(".atlas2-card-close").addEventListener("click", () => clearSelection());
    // the phone sheet's two states: shut (title and kind) and up (the body); .atlas2-card-up on the host lets a short
    // landscape atlas hide the zoom stack under the up sheet (styles.css, Phase 1d)
    function reflectSheet() { cardEl.classList.toggle("atlas2-card-shut", PHONE && !sheetUp); el.classList.toggle("atlas2-card-up", PHONE && cardOpen && sheetUp); }
    el.querySelector(".atlas2-grip").addEventListener("click", () => { sheetUp = !sheetUp; reflectSheet(); });
    el.querySelector(".atlas2-card-head").addEventListener("click", (e) => { if (PHONE && !e.target.closest("button")) { sheetUp = !sheetUp; reflectSheet(); } });
    const safeHTML = (html) => (H.sanitizeHTML ? H.sanitizeHTML(html) : escText(html));
    function withinButton(row) { const w = row.within ? G.byId.get(row.within) : null; return w ? `<p class="atlas2-card-within">In <button type="button" class="atlas2-link" data-select="${escText(w.id)}">${escText(w.name)}</button></p>` : ""; }
    function wikiLine(row) { const title = row.wiki === 1 ? row.name : row.wiki; return title ? `<p class="atlas2-card-link"><a href="${wikiUrl(title)}" target="_blank" rel="noopener">Wikipedia: ${escText(title)}</a></p>` : ""; }
    function renderPlaceCard(row) {
      if (row.hist) { renderHistoryCard(row); return; }
      cardBody.innerHTML = withinButton(row) + wikiLine(row);
    }
    /* Phase 2a: a historical place — kind, span, the step list as a small timeline with the source on each step, the
       uncertainty sentence, the gaps in the span, the Wikipedia link from the source's own property; no prose yet */
    function renderHistoryCard(row) {
      if (row.kind === "capital" && row.city) { const e = time.ents.find((x) => x.id === row.city.entity); cardKind.textContent = "Capital of " + (e ? e.name : row.city.entity) + " · " + fmtYear(row.city.from) + " – " + fmtYear(row.city.to); cardBody.innerHTML = `<p class="atlas2-card-span">A period capital from Wikidata (the state's own capital statements, with their dates; CC0), through the card ${escText(row.city.card || "")}.</p>` + (e ? `<p class="atlas2-card-within">In <button type="button" class="atlas2-link" data-select="${escText(e.id)}">${escText(e.name)}</button></p>` : ""); return; }
      const e = time.ents[row.ent]; const steps = time.stepsOf.get(row.ent) || [];
      const src = (time.hist.header.sources || []).find((s) => s.id === "cliopatria");
      const srcName = src ? "Cliopatria " + src.version : "Cliopatria";
      const nameOf = (p) => { const r = G.byId.get(p); return r ? r.name : p; };
      cardKind.textContent = (e.kind === "contested" ? "Contested between " + e.partners.map(nameOf).join(" and ") : e.kind === "nested" ? "Within " + nameOf(e.partners[1]) : "Polity") + (e.span ? " · " + fmtYear(e.span[0]) + " – " + fmtYear(e.span[1]) : "");
      let html = "";
      if (e.span) html += `<p class="atlas2-card-span">Mapped from ${escText(fmtYear(e.span[0]))} to ${escText(fmtYear(e.span[1]))}, in ${steps.length} step${steps.length === 1 ? "" : "s"}.</p>`;
      // the steps as RANGES (2b): consecutive steps with no gap between them read as one range; the list of every step opens on request
      // (Rome has 123, Byzantium 124), each a button that sets the year
      if (steps.length > 1) {
        const ranges = []; for (const st of steps) { const last = ranges[ranges.length - 1]; if (last && st[0] === last.to + 1) { last.to = st[1]; last.n++; } else ranges.push({ from: st[0], to: st[1], n: 1 }); }
        html += `<p class="atlas2-card-ranges">${ranges.map((r) => escText(fmtYear(r.from) + " – " + fmtYear(r.to)) + (r.n > 1 ? ` <span class="atlas2-card-dim">(${r.n} steps)</span>` : "")).join("; ")}.</p>`;
        html += `<details class="atlas2-card-steplist"><summary>Every step (${steps.length})</summary><ol>${steps.map((st) => `<li><button type="button" class="atlas2-link atlas2-step-go" data-year="${st[0]}">${escText(fmtYear(st[0]))} – ${escText(fmtYear(st[1]))}</button></li>`).join("")}</ol></details>`;
      }
      // the step list as a small timeline: one bar per step across the span, the current year marked
      if (steps.length && e.span) {
        const s0 = e.span[0], s1 = e.span[1] + 1, W = Math.max(1, s1 - s0);
        html += '<div class="atlas2-steps" role="list" aria-label="Steps">';
        for (const st of steps) { const l = (st[0] - s0) / W * 100, w = Math.max(0.4, (st[1] + 1 - st[0]) / W * 100); const cur = st[0] <= time.year && st[1] >= time.year; html += `<button type="button" role="listitem" class="atlas2-step${cur ? " atlas2-step-now" : ""}" style="left:${l.toFixed(2)}%;width:${w.toFixed(2)}%" data-year="${st[0]}" title="${escText(fmtYear(st[0]))} – ${escText(fmtYear(st[1]))}: ${escText(srcName)}" aria-label="${escText(fmtYear(st[0]))} to ${escText(fmtYear(st[1]))}, ${escText(srcName)}"></button>`; }
        if (time.year >= s0 && time.year <= e.span[1]) html += `<i class="atlas2-step-pin" style="left:${((time.year - s0) / W * 100).toFixed(2)}%" aria-hidden="true"></i>`;
        html += "</div>";
        html += `<p class="atlas2-card-steps-note">Each step is a shape the source gives for those years — ${escText(srcName)} — and the map changes only at a step.</p>`;
      }
      html += `<p class="atlas2-card-uncert">Approximate: ${escText(srcName)}, CC BY 4.0. A border here is one reading of incomplete evidence, drawn at the source's own precision.</p>`;
      // the gaps in the span
      const gaps = []; for (let i = 1; i < steps.length; i++) if (steps[i][0] > steps[i - 1][1] + 1) gaps.push([steps[i - 1][1] + 1, steps[i][0] - 1]);
      html += gaps.length ? `<p class="atlas2-card-gaps">No source for ${gaps.map((g) => escText(fmtYear(g[0]) + (g[1] > g[0] ? "–" + fmtYear(g[1]) : ""))).join(", ")}: nothing is drawn in those years.</p>` : (steps.length > 1 ? '<p class="atlas2-card-gaps">No gaps in the span.</p>' : "");
      if (e.kind === "contested") html += e.partners.map((p) => { const r = G.byId.get(p); return r ? `<p class="atlas2-card-within">Claimed by <button type="button" class="atlas2-link" data-select="${escText(r.id)}">${escText(r.name)}</button></p>` : ""; }).join("");
      if (e.kind === "nested") html += e.partners.map((p, i) => { const r = G.byId.get(p); return r ? `<p class="atlas2-card-within">${i === 0 ? "The member" : "Within"} <button type="button" class="atlas2-link" data-select="${escText(r.id)}">${escText(r.name)}</button></p>` : ""; }).join("");
      // members and overlords (2b): the nested entities naming this polity, with their years
      if (e.kind === "polity") {
        const rel = (k) => time.ents.map((x, i) => ({ x, i })).filter(({ x }) => x.kind === "nested" && x.partners[k] === e.id && x.span).map(({ x }) => { const other = x.partners[k === 1 ? 0 : 1]; return `<button type="button" class="atlas2-link" data-select="${escText(other)}">${escText(nameOf(other))}</button> <span class="atlas2-card-dim">(${escText(fmtYear(x.span[0]) + " – " + fmtYear(x.span[1]))})</span>`; });
        const members = rel(1), overlords = rel(0);
        if (members.length) html += `<p class="atlas2-card-within">Members drawn inside it: ${members.join(", ")}.</p>`;
        if (overlords.length) html += `<p class="atlas2-card-within">Drawn within: ${overlords.join(", ")}.</p>`;
      }
      html += `<p class="atlas2-card-scope">The past here shows the states Folio’s cards teach, not every state of the period.</p>`;
      if (e.wiki) html += `<p class="atlas2-card-link"><a href="${wikiUrl(e.wiki)}" target="_blank" rel="noopener">Wikipedia: ${escText(e.wiki)}</a></p>`;
      if (e.alsoWiki && e.alsoWiki.length) html += `<p class="atlas2-card-link atlas2-card-also">Also in the source: ${e.alsoWiki.filter((w) => w.wiki).map((w) => `<a href="${wikiUrl(w.wiki)}" target="_blank" rel="noopener">${escText(w.wiki)}</a>`).join(", ")}</p>`;
      cardBody.innerHTML = html;
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
    cardBody.addEventListener("click", (e) => { const st = e.target.closest("button[data-year]"); if (st) { setYear(Number(st.getAttribute("data-year"))); if (cardRow) openCard(cardRow); return; } const b = e.target.closest("button[data-select]"); if (!b) return; const row = G.byId.get(b.getAttribute("data-select")); if (row) { if (row.hist) selectRow(row, { open: true, push: true }); else flyToRow(row, true); } });

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
      if (results.length) onVisual();   // the list's room under the visual viewport (a soft keyboard may be up)
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
      if (u >= 1) { flying = null; touched(); gestureEnded(); if (f.done) f.done(); }
    }

    /* ---- deep links: #map2/<lon>/<lat>/<zoom>/<place>, written on settle, pushed on a selection ---- */
    const HASH_RE = /^#map2\/(-?[\d.]+)\/(-?[\d.]+)\/(-?[\d.]+)(?:\/([^?]*))?(\?.*)?$/;
    const zoomLevel = () => Math.log2(156.543 / kmPerPx());
    function readHash() { const m = HASH_RE.exec(location.hash || ""); if (!m) return null; let place = m[4] || null; if (place) { try { place = decodeURIComponent(place); } catch (e) {} } let year = null; const q = /[?&]y=(-?\d{1,5})\b/.exec(m[5] || ""); if (q) year = clampYear(Number(q[1])); return { lon: Number(m[1]), lat: Number(m[2]), z: Number(m[3]), place, year }; }
    // the query: ?y=<year> (Phase 2a) and perf; the existing form #map2/<lon>/<lat>/<zoom>/<place> is unchanged
    function hashNow() { const q = []; if (time.hist || time.year !== TODAY) q.push("y=" + time.year); if (perfInHash) q.push("perf"); return "#map2/" + view.lon.toFixed(2) + "/" + view.lat.toFixed(2) + "/" + zoomLevel().toFixed(2) + (sel.id ? "/" + encodeURIComponent(sel.id) : "") + (q.length ? "?" + q.join("&") : ""); }
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
      if (d.year != null && d.year !== time.year) applyYear(d.year, { why: "hash" });
      if (!tileIndex) pendingZoom = z;   // the cap is not known until the header arrives: the asked-for zoom is clamped again then
      if (d.place) { const histId = /^(pol|cap|contested):/.test(d.place); if (G.ready && stats.ready && (!histId || time.ents) && selectById(d.place, { open: true, push: false })) pendingPlace = null; else pendingPlace = d.place; } else if (sel.id) clearSelection();   // a history place (pol:, cap:) waits for the history header
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

    /* the soft keyboard (Phase 1d, §2.9): the layout viewport (and 100vh) does not change when a keyboard comes up, so the
       map stays where it is; what must follow the VISUAL viewport is the search's result list, whose height is capped by
       --atlas2-vvh, and the focused search box, which is scrolled into the visible part if the keyboard has covered it */
    const vv = window.visualViewport || null;
    const onVisual = () => {
      if (disposed) return;
      const vh = vv ? vv.height : window.innerHeight, vt = vv ? vv.offsetTop : 0;
      const lr = resultsUl.getBoundingClientRect(), top = lr.height ? lr.top : searchIn.getBoundingClientRect().bottom + 4;
      el.style.setProperty("--atlas2-list-max", Math.max(96, Math.round(vt + vh - top - 12)) + "px");   // the list's room above a soft keyboard
      if (document.activeElement === searchIn) { const r = searchIn.getBoundingClientRect(); if (r.bottom > vh + vt || r.top < vt) searchIn.scrollIntoView({ block: "nearest" }); }
    };
    if (vv) { vv.addEventListener("resize", onVisual); vv.addEventListener("scroll", onVisual); }
    window.addEventListener("resize", onVisual);
    onVisual();
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
    const themeObs = new MutationObserver(() => { if (!el.isConnected) return; spriteGen++; spriteCache.clear(); palette = readPalette(); R.setPalette(palette); R.setRamp(buildRamp()); labelColours(); if (time.hist) { histColours(); uploadStyle(); if (time.view) time.view.faces = time.alive.map((a) => ({ face: a.face, rgb: entColour(a.ent), hatch: time.ents[a.ent].kind === "contested" ? entColour(entityIndexOfId(time.ents[a.ent].partners[1])) : null })); drawTicks(); } if (G.ready) measureMetrics(); invalidate(); });
    themeObs.observe(document.body, { attributes: true, attributeFilter: ["class", "data-theme"] });
    function dispose() {
      if (disposed) return;
      disposed = true;
      window.removeEventListener("resize", railResize);
      try { mo.disconnect(); themeObs.disconnect(); if (sizeObs) sizeObs.disconnect(); } catch (e) {}
      window.removeEventListener("resize", onResize);
      if (vv) { vv.removeEventListener("resize", onVisual); vv.removeEventListener("scroll", onVisual); }
      window.removeEventListener("resize", onVisual);
      window.removeEventListener("hashchange", onHash); window.removeEventListener("popstate", onHash);
      if (raf) cancelAnimationFrame(raf);
      if (layoutTimer) clearTimeout(layoutTimer);
      if (tapTimer) clearTimeout(tapTimer);
      if (longObs) { try { longObs.disconnect(); } catch (e) {} }
      landTiles.abortAll(); waterTiles.abortAll(); reliefTiles.abortAll();
      if (worker) { try { worker.terminate(); } catch (e) {} worker = null; }
      R.dispose();
    }
    setPerf(perfOn);   // after the label state exists: the overlay reads it (Phase 1c)
    layout();
    // a deep link (#map2/<lon>/<lat>/<zoom>/<place>) sets the first view; the place opens once the data is in
    { const d = readHash(); if (d) { lastWrittenHash = location.hash; applyHash(d); } }
    drawTicks();
    invalidate();
    // the view set from outside (the perf suite's fixed views): centre, zoom, then wait for `tilesSettled()`
    function setView(lon, lat, kmPerPixel) { view.lon = lon; view.lat = lat; view.zoom = R_KM / (kmPerPixel * base); flying = null; coasting = false; plan(); invalidate(); touched(); }
    const tilesSettled = () => view.tiles.every((k) => R.tileLoaded(k)) && (view.level !== 4 || view.parents.every((k) => R.tileLoaded(k))) && landTiles.pending.size === 0
      && (!view.lakes || !waterStarted || waterFailed || (view.waterTiles.every((k) => R.waterTileLoaded(k)) && waterTiles.pending.size === 0))
      && (!view.relief.on || !reliefStarted || reliefFailed || (!!reliefIndex && R.reliefLoaded("0") && view.relief.tiles.every((k) => R.reliefLoaded(k)) && reliefTiles.pending.size === 0));
    const waterSettled = () => !waterStarted || waterFailed || (!!waterHeader && R.waterLevelLoaded(2));
    const controller = { dispose, stats, view, layers, renderer: R, invalidate, zoomAt, pick, setView, setLayers, kmPerPx, tilesSettled, waterSettled, setPerf,
      stageInfo: () => ({ stage, learnt, locked: stageLocked, trace: stageTrace.slice(), escalations: stats.escalations, recoveries: stats.recoveries, stallsIgnored: stats.stallsIgnored, longTasks: stats.longTasks, frameTasks: stats.frameTasks || 0, gpuTimer: !!(R.gpuMs && R.gpuTimer && R.gpuTimer()), gpuMs: R.gpuMs ? R.gpuMs() : null, fastRun, trialFast, longObs: !!longObs }),
      forceStage, feedGesture, stall: (ms) => bracket(() => { const t0 = performance.now(); while (performance.now() - t0 < ms) { /* a main-thread stall, bracketed as one */ } }),
      perfOn: () => perfOn,
      mode: () => ({ file: FILE, static2d: STATIC2D, shim: !!shim, worker: !!worker, resScale, stage, lodBias: lodBias(), shimWhy: stats.shim || null, workerError: stats.workerError || null, twinVerified: stats.twinVerified || 0 }),
      input: () => ({ pointers: [...ptrs.entries()].map(([id, p]) => [id, Math.round(p.x), Math.round(p.y)]), dragging, moved, pinch: Math.round(pinch), coasting, flying: !!flying }),   // for the suites
      statsNow: () => Object.assign(R.stats(), { frameTrace: stats.frameTrace ? stats.frameTrace.slice() : null, taskMs: stats.taskMs ? Object.fromEntries(Object.entries(stats.taskMs).map(([k, v]) => [k, Math.round(v)])) : null, frameMsP95: pct95(stats.frames), frameMsMean: stats.frames.length ? Math.round(stats.frames.reduce((p, q) => p + q, 0) / stats.frames.length) : 0, kmPerPx: kmPerPx(), wanted: view.tiles.length, resScale, stage, lodBias: lodBias(), mode: STATIC2D ? "canvas2d" : "webgl2", pending: landTiles.pending.size, resident: landTiles.stats.resident, fetched: landTiles.stats.fetched, tileBytes: landTiles.stats.bytes, evicted: landTiles.stats.evicted, waterWanted: view.waterTiles.length, waterPending: waterTiles.pending.size, reliefWanted: view.relief.tiles.length, reliefPending: reliefTiles.pending.size, reliefBytes: reliefTiles.stats.bytes, reliefFade: view.relief.fade, riversOn: view.rivers, lakesOn: view.lakes, reliefOn: view.relief.on, phone: PHONE,
        year: time.year, historyFaces: time.alive.length, labelsPlaced: L.placed.length, labelCandidates: L.candidates, labelCap: L.cap, labelLayoutMs: L.lastLayoutMs, labelLayoutP95: pct95(stats.labelLayout), labelSpriteMs: L.lastSpriteMs || 0, labelSpriteP95: pct95(stats.labelSprite), labelDrawMs: L.lastDrawMs, labelDrawP95: pct95(stats.labelDraw), labelBudgets: { drawMs: LABEL_DRAW_BUDGET_MS, layoutMs: LABEL_LAYOUT_BUDGET_MS }, heapMB: heapMB(), density: layers.density, zoomLevel: zoomLevel() }),
      // Phase 1c, for the suites and the console
      labels: () => L.placed, labelsLive: () => L.live, layoutSeq: () => L.seq, layoutNow: () => new Promise((res) => { layoutWaiters.push(res); requestLayout("test", true); }), labelsReady: () => gazInWorker && metricsSent > 0,
      gazetteer: () => G, styles: STYLES, palette: () => palette, colours: () => ({ halo: haloCss, ink: inkCss, water: waterCss, selected: selCss }),
      select: selectById, selectedId: () => sel.id, stack: () => sel.stack.map((r) => r.id), stackAt: (x, y) => stackAt(x, y).map((r) => r.id), pickAt, hitAt: (x, y) => hitAt(x, y).map((h) => h.p.id), clearSelection,
      card: () => ({ open: cardOpen, id: cardRow ? cardRow.id : null, title: cardTitle.textContent, shut: cardEl.classList.contains("atlas2-card-shut") }),
      search: (q) => runSearch(q).map((r) => r.id), chooseResult, flyTo, flyToRow: (id, open) => { const r = G.byId.get(id); if (r) flyToRow(r, open); return !!r; }, flying: () => !!flying,
      chromeRects, hash: hashNow, readHash, metricsCount: () => metricsSent,
      /* Phase 2a: time */
      setYear: (y, o) => setYear(y, o), year: () => time.year, stepChange, play: () => startPlay(), stop: () => stopPlay(), playing: () => time.playing, setSpeed: (v) => { time.speed = v; railSpeed.value = String(v); },
      alive: () => time.alive.map((a) => ({ face: a.face, entity: time.ents[a.ent].id, from: a.from, to: a.to })), onScreenAlive: () => (time.onScreenAlive || []).map((a) => a.face), residentKeys: () => [...time.resident], meshInfo: (key) => (R.historyMeshInfo ? R.historyMeshInfo(key) : null), changeYears: () => time.changeYears.slice(), historySettled, historyReady: () => !histStarted || !!(time.hist && time.hist.ready), ensureHistory, historyStarted: () => histStarted,
      timeInfo: () => ({ year: time.year, present: time.present, alive: time.alive.length, fading: !!time.fade, playing: time.playing, speed: time.speed, resident: time.resident.size, wanted: time.wanted.size, pending: time.pending, entities: time.ents.length, loadMs: time.loadMs, bytes: time.bytes || 0, failed: time.failed, yearChangeP95: pct95(time.yearChange), yearChangeN: time.yearChange.length, capitals: time.capitals.length, note: !railNote.hidden, onScreen: time.onScreen.length, lru: time.lru.length }),
      // one device pixel of the GL canvas, read right after a render in the same task (the drawing buffer is not preserved between tasks)
      // one CSS row of the GL canvas as [r,g,b,a,…] per CSS pixel (one render, one readback — a scan by pixelAt would render once per pixel)
      pixelRow: (y) => { const g = R.gl; if (!g) return null; R.render(view); const d = Math.min(2, (window.devicePixelRatio || 1) * resScale); const w = g.drawingBufferWidth; const row = new Uint8Array(w * 4); g.readPixels(0, g.drawingBufferHeight - 1 - Math.round(y * d), w, 1, g.RGBA, g.UNSIGNED_BYTE, row); const n = Math.floor(w / d); const out = new Array(n * 4); for (let i = 0; i < n; i++) { const j = Math.round(i * d) * 4; out[i * 4] = row[j]; out[i * 4 + 1] = row[j + 1]; out[i * 4 + 2] = row[j + 2]; out[i * 4 + 3] = row[j + 3]; } return out; },
      pixelAt: (x, y) => { const g = R.gl; if (!g) return null; R.render(view); const d = Math.min(2, (window.devicePixelRatio || 1) * resScale); const px = new Uint8Array(4); g.readPixels(Math.round(x * d), g.drawingBufferHeight - 1 - Math.round(y * d), 1, 1, g.RGBA, g.UNSIGNED_BYTE, px); return [px[0], px[1], px[2], px[3]]; },
      parseYear, fmtYear, railX, railYearAt, histColour: (id) => { const i = entityIndexOfId(id); return i < 0 ? null : entColour(i); },
      /* Phase 2b, for the suites: the colouring over every epoch, the label contrast per theme, the largest face on screen */
      colourAudit: () => {
        if (!time.hist || !time.slots) return { epochs: 0, pairs: 0, clashes: 0, changes: 0, entities: 0, sample: [] };
        const years = new Set(); for (const [, l] of time.stepsOf) for (const st of l) { years.add(st[0]); years.add(st[1] + 1); }
        const owners = (ent) => { const e = time.ents[ent]; return e.kind === "polity" ? [ent] : e.partners.map(entityIndexOfId).filter((i) => i >= 0); };
        let epochs = 0, pairs = 0, clashes = 0, lastKey = ""; const sample = [];
        for (const y of [...years].sort((a, b) => a - b)) {
          const alive = aliveAt(y); const key = alive.map((a) => a.face).join(","); if (key === lastKey) continue; lastKey = key; epochs++;
          const byArc = new Map(); for (const a of alive) for (let k = time.faceArcOff[a.face]; k < time.faceArcOff[a.face + 1]; k++) { const arc = time.faceArcs[k]; let l = byArc.get(arc); if (!l) byArc.set(arc, l = []); l.push(a.ent); }
          const seen = new Set();
          for (const [, l] of byArc) if (l.length > 1) for (const p of l) for (const q of l) for (const po of owners(p)) for (const qo of owners(q)) { if (po >= qo) continue; const k = po + ":" + qo; if (seen.has(k)) continue; seen.add(k); pairs++; if (slotAt(po, y) === slotAt(qo, y)) { clashes++; if (sample.length < 5) sample.push(`${time.ents[po].id} and ${time.ents[qo].id} at ${fmtYear(y)}`); } }
        }
        let changes = 0; for (const [, h] of time.slots) changes += Math.max(0, h.length - 1);
        return { epochs, pairs, clashes, changes, entities: time.slots.size, sample };
      },
      contrastAudit: () => {
        const pal = readPalette(); const landC = pal.land; const a = themeTokens().dark ? HIST_FILL_ALPHA_DARK : HIST_FILL_ALPHA;
        const tokensNow = themeTokens(); const hsl = (h, sat, lum) => { const c = (1 - Math.abs(2 * lum - 1)) * sat, x = c * (1 - Math.abs((h / 60) % 2 - 1)), mm = lum - c / 2; const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return [r + mm, g + mm, b + mm]; };
        const slots = []; for (let k = 0; k < SLOTS; k++) { const h = (k * 137.508) % 360, even = k % 2 === 0; slots.push(tokensNow.dark ? mix(hsl(h, 0.55, even ? 0.62 : 0.52), tokensNow.paper, 0.1) : mix(hsl(h, 0.6, even ? 0.48 : 0.58), tokensNow.ink, 0.08)); }
        const lum = (c) => { const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
        const ratio = (p, q) => { const a1 = lum(p) + 0.05, b1 = lum(q) + 0.05; return a1 > b1 ? a1 / b1 : b1 / a1; };
        let min = Infinity, worst = -1; slots.forEach((sl, k) => { const fill = mix(landC, sl, a); const r = ratio(tokensNow.ink, fill); if (r < min) { min = r; worst = k; } });
        return { min, worst, alpha: a };
      },
      largestOnScreen: () => {   // the largest alive face whose ANCHOR (a point inside it) is on screen: a cap that meets the view is not a face a reader sees
        if (!time.hist) return null; const anchors = time.hist.header.faceAnchor || []; const rot = view.rot; let best = null;
        for (const a of time.alive) { const p = anchors[a.face]; if (!p) continue; const lo = p[0] * D2R, la = p[1] * D2R, v = [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)]; const x = v[0] * rot[0] + v[1] * rot[1] + v[2] * rot[2], y = v[0] * rot[3] + v[1] * rot[4] + v[2] * rot[5], z = v[0] * rot[6] + v[1] * rot[7] + v[2] * rot[8]; if (z <= 0 || Math.abs(x) * view.radius > cssW / 2 || Math.abs(y) * view.radius > cssH / 2) continue; const km2 = (time.hist.header.faceKm2 || [])[a.face] || 0; if (!best || km2 > best.km2) best = { face: a.face, km2 }; }
        if (!best) return null; const e = time.ents[time.faceEntity[best.face]]; const id = e.kind === "polity" ? e.id : e.partners[0]; return { id, name: (G.byId.get(id) || e).name, km2: best.km2 }; }, requestLayout: (why) => requestLayout(why || "test", true), labelDebug: (on) => { L.debug = !!on; }, labelWhy: () => L.why };
    el.__atlas2 = controller;
    return controller;
  }

  root.AtlasV2 = { mount };
})(typeof window !== "undefined" ? window : globalThis);
