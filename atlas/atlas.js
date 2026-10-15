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
   (#map/<lon>/<lat>/<zoom>/<place>) and a hidden list of buttons that mirrors the visible labels for the
   keyboard. The page is reached at #map (Phase 5 swapped it in for the v1 page; #map2 redirects).

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
        determinate progress, then the worker's), a caption for the picked name, and — on `#map?perf`
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
  const WAR_FILL_BOOST = 1.3;   // a side's tint is read against a state's own colour: 30 % stronger than a state's fill (2d)
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
  const KIND_LABEL = { country: "Country", admin1: "Province or state", capital: "Capital", city: "City", town: "Town", sea: "Sea", ocean: "Ocean", strait: "Strait", gulf: "Gulf or bay", lake: "Lake", river: "River", island: "Island", "island-group": "Island group", range: "Mountain range", region: "Region", site: "Site", mountain: "Mountain", hill: "Hill", cape: "Cape", polity: "Polity", people: "People", culture: "Culture", extent: "Authored extent" };
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
    // a people's or a culture's name (2c, design §2.5): SPACED ITALIC, mixed case — the territory's small capitals' opposite; the same face as water's italic
    // but tracked wide and in ink, so an italic name is told from a sea's by its spacing and its colour as well as by where it lies
    { id: "people-l", face: "serif", size: 16, weight: 400, italic: true, caps: false, track: 4.2 },
    { id: "people-m", face: "serif", size: 13.5, weight: 400, italic: true, caps: false, track: 3.2 },
    { id: "people-s", face: "serif", size: 11.5, weight: 400, italic: true, caps: false, track: 2.4 },
  ];
  const SMALL_SCALE = 0.78;
  /* TEXT SIZE REACHES THE NAMES (Oct 2026, owner decision; v1's canvas labels followed it, v2's did not until now). Settings → Text size sets `--fs` on <body> (styles.css `body[data-fs]`: .8 … 1.32, one stop lower on a
     phone). The labels are painted, so the stylesheet cannot reach them; this reads the same variable and divides by what MEDIUM is on this device (1, or .9 under 641 px), so the default looks exactly as it always
     has and every other stop grows or shrinks the names by the ratio the chrome does. The factor multiplies the style sizes, the tracking, the glyph advances the worker shapes with, the halo widths, and — sent with each
     layout — the collision padding, the dot beside a city, the frame margin and the study marks, so a name that grows takes its box with it (a bigger name in the old box is a map that overlaps itself). */
  const FS_PHONE_QUERY = "(max-width:640px)";
  function labelScaleNow() {
    try {
      const v = parseFloat(getComputedStyle(document.body).getPropertyValue("--fs"));
      if (!(v > 0)) return 1;
      const medium = matchMedia(FS_PHONE_QUERY).matches ? 0.9 : 1;
      return Math.max(0.6, Math.min(1.6, Math.round(v / medium * 100) / 100));
    } catch (e) { return 1; }
  }
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
  const DEFAULT_LAYERS = { borders: true, provinces: true, countries: true, places: true, physical: true, cities: true, rivers: true, lakes: true, relief: false, strength: 0.7, graticule: false, density: "normal", peoples: "linked", wars: "auto", fronts: true };
  function loadLayers() {
    try { const v = JSON.parse(localStorage.getItem(LAYERS_KEY) || "null"); if (v && typeof v === "object") { const o = Object.assign({}, DEFAULT_LAYERS, v); if (!/^(sparse|normal|dense)$/.test(o.density)) o.density = "normal"; if (!/^(off|linked|all)$/.test(o.peoples)) o.peoples = "linked"; if (!/^(auto|off|on)$/.test(o.wars)) o.wars = "auto"; o.fronts = o.fronts !== false; return o; } } catch (e) {}
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

  /* PHASE 4b — THE FIRST FRAME OF A CARD WINDOW, FROM A CACHE. A hub (opts.embed) parses topology.bin and builds the three resident levels in its worker before the first window can draw;
     the coarsest level (LOD 0: 10 km tolerance, 55k triangles) and the file's header are the whole of a first frame, and they are the same bytes every visit. They are kept, after the worker
     has made them once, in IndexedDB — the worker's own output (typed arrays, structured-cloned), keyed by CORE_CACHE_REV — and the next hub reads them back while the file is still on its way to the
     worker, so a warm first window is a read and a draw. The revision is a hash of everything that shapes that output (atlas-worker.js, atlas-format.js, vendor/earcut.js and topology.bin's build id);
     `.claude/atlas-build/check-core-cache.js` fails CI when it lags and `--install` rewrites it. A stale or unreadable cache is ignored, never an error; the worker's own `meta` replaces the cached header
     if its build id differs. Since Oct 2026 the Atlas page uses it as well, for its FIRST FRAME ONLY: it is still `ready` when every level has arrived from the worker, but the coarse globe no longer waits for the file. */
  const CORE_CACHE_REV = "8fa3e9a360:9bde0dc16ffce93f";
  const idbOpen = () => new Promise((res, rej) => { try { const r = indexedDB.open("folio-atlas2", 1); r.onupgradeneeded = () => r.result.createObjectStore("core"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); r.onblocked = () => rej(new Error("blocked")); } catch (e) { rej(e); } });
  const idbGet = (key) => idbOpen().then((db) => new Promise((res, rej) => { const q = db.transaction("core").objectStore("core").get(key); q.onsuccess = () => { db.close(); res(q.result || null); }; q.onerror = () => { db.close(); rej(q.error); }; }));
  const idbPut = (key, val) => idbOpen().then((db) => new Promise((res, rej) => { const t = db.transaction("core", "readwrite"); t.objectStore("core").put(val, key); t.oncomplete = () => { db.close(); res(true); }; t.onerror = () => { db.close(); rej(t.error); }; t.onabort = () => { db.close(); rej(t.error); }; }));

  function mount(host, opts) {
    opts = opts || {};
    const dataUrl = opts.dataUrl || "atlas/data/topology.bin";
    const tileUrl = opts.tileUrl || "atlas/data/tiles/";
    const waterUrl = opts.waterUrl || "atlas/data/water.bin";
    const waterTileUrl = opts.waterTileUrl || "atlas/data/water/";
    const reliefUrl = opts.reliefUrl || "atlas/data/relief/";
    const gazetteerUrl = opts.gazetteerUrl || "atlas/data/gazetteer.js";
    const H = opts.host || {};
    const studyPanel = H.study && root.AtlasStudy ? `
        <div class="atlas2-study" role="group" aria-label="What the map shows from your cards" data-mode="map" data-ready="0">
          <div class="atlas2-study-top">
            <div class="atlas2-study-modes" role="radiogroup" aria-label="Atlas view">
              <button type="button" role="radio" aria-checked="true" data-mode="map" title="The plain map" disabled>Map</button>
              <button type="button" role="radio" aria-checked="false" data-mode="personal" title="Your Atlas: the places in the cards you have studied" disabled>Personal</button>
              <button type="button" role="radio" aria-checked="false" data-mode="full" title="The Full Atlas: every place any card is about" disabled>Full</button>
            </div>
            <button type="button" class="atlas2-study-toggle" aria-expanded="false" aria-controls="atlas2-study-details" aria-label="Show the collections" title="Show the collections" hidden><i aria-hidden="true"></i></button>
          </div>
          <p class="atlas2-study-sum" aria-live="polite"></p>
          <p class="atlas2-study-empty" role="status" hidden></p>
          <div class="atlas2-study-details" id="atlas2-study-details" hidden>
            <p class="atlas2-study-note" hidden></p>
            <div class="atlas2-study-colls" role="group" aria-label="Collections" hidden></div>
          </div>
        </div>` : "";
    host.innerHTML = `
      <div class="atlas2${PHONE ? " atlas2-phone" : ""}${H.back && !opts.embed ? " atlas2-has-back" : ""}" role="region" aria-label="Atlas (preview)">
        <canvas class="atlas2-canvas" tabindex="0" role="application" aria-label="Interactive globe — drag to turn, scroll or pinch to zoom, arrow keys turn, plus and minus zoom, Home resets; Tab walks the names on the map"></canvas>
        <canvas class="atlas2-labels" aria-hidden="true"></canvas>
        <div class="atlas2-search">
          <input type="search" class="atlas2-search-in" placeholder="Find a place" aria-label="Find a place" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="atlas2-results" aria-autocomplete="list">
          <ul class="atlas2-results" id="atlas2-results" role="listbox" aria-label="Places found" hidden></ul>
          <div class="atlas2-search-note" role="status" hidden><span class="atlas2-sn-t"></span><span class="atlas2-sn-b"><button type="button" class="atlas2-link atlas2-sn-go"></button><button type="button" class="atlas2-sn-x" aria-label="Dismiss" title="Dismiss">×</button></span></div>
        </div>${H.back && !opts.embed ? '<button type="button" class="atlas2-back" aria-label="Back to studying" title="Back to studying">&#8617; Back</button>' : ""}${studyPanel}
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
            <fieldset class="atlas2-group atlas2-peoples"><legend>Peoples</legend>
              <label><input type="radio" name="atlas2-peoples" data-layer="peoples" value="off"> Off</label>
              <label><input type="radio" name="atlas2-peoples" data-layer="peoples" value="linked"> Peoples a card links</label>
              <label><input type="radio" name="atlas2-peoples" data-layer="peoples" value="all"> All with a dated source <span class="atlas2-peoples-hint">Adds nothing until more peoples are built: every one built so far is linked by a card.</span></label>
              <p class="atlas2-peoples-note" aria-live="polite"></p>
            </fieldset>
            <fieldset class="atlas2-group atlas2-wars"><legend>Wars</legend>
              <label><input type="radio" name="atlas2-wars" data-layer="wars" value="auto"> Automatic <span class="atlas2-peoples-hint">Tints wars in your Personal Atlas, and the one war you open from a card. The plain Map keeps its states’ own colours so they stay steady as you scrub.</span></label>
              <label><input type="radio" name="atlas2-wars" data-layer="wars" value="off"> Off</label>
              <label><input type="radio" name="atlas2-wars" data-layer="wars" value="on"> On everywhere <span class="atlas2-peoples-hint">Every war a card teaches, in its years, in every view.</span></label>
              <dl class="atlas2-wars-key" aria-label="What the war tints mean">
                <div><dt class="atlas2-wars-sw atlas2-wars-sw-victor"></dt><dd>Victors: the ground a war’s winning side held in its years</dd></div>
                <div><dt class="atlas2-wars-sw atlas2-wars-sw-loser"></dt><dd>Losers: the ground the defeated side held</dd></div>
                <div><dt class="atlas2-wars-sw atlas2-wars-sw-extent"></dt><dd>A soft, borderless wash: an authored extent, Folio’s own approximation where no dataset draws the side</dd></div>
              </dl>
              <label class="atlas2-fronts-sw"><input type="checkbox" data-layer="fronts"> The Second World War’s front line (1939–45)</label>
              <p class="atlas2-fronts-edge">Where a 1939–42 tint fades out at a straight edge, the source map ends there; the war did not.</p>
              <dl class="atlas2-wars-key atlas2-fronts-key" aria-label="What the front tints mean">
                <div><dt class="atlas2-wars-sw atlas2-wars-sw-axis"></dt><dd>Axis-held ground; the lighter tint is ground the Axis occupied</dd></div>
                <div><dt class="atlas2-wars-sw atlas2-wars-sw-allied"></dt><dd>Allied-held ground; the lighter tint is ground the Allies occupied</dd></div>
              </dl>
              <p class="atlas2-wars-note" aria-live="polite"></p>
            </fieldset>
            <p class="atlas2-layers-note" hidden></p>
          </div>
        </div>
        <div class="atlas2-help">
          <button type="button" class="atlas2-btn atlas2-about-btn" aria-expanded="false" aria-controls="atlas2-about" aria-label="About this map" title="About this map">?</button>
          <div class="atlas2-sheet atlas2-about" id="atlas2-about" role="dialog" aria-labelledby="atlas2-about-title" hidden>
            <div class="atlas2-sheet-head"><strong id="atlas2-about-title">About this map</strong><button type="button" class="atlas2-sheet-close atlas2-about-close" aria-label="Close">×</button></div>
            <p class="atlas2-about-p atlas2-about-use"><b>Folio’s Atlas.</b> Drag the globe, scroll or pinch to zoom, and tap any place for its card — a country’s story, a battle, a city, a people. The <b>year rail</b> along the bottom takes you back through the states the cards teach, as they stood. The panel at the top left switches between the plain <b>Map</b>, <b>your atlas</b> (the places on the cards you have studied) and the <b>full atlas</b> (every place any card is about); a place card lists its cards. Search finds places, rivers, battles and states of any age. The same globe draws the maps on the cards and plays Find it.</p>
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
          <div class="atlas2-front" role="group" aria-label="The front line: choose a plate" hidden>
            <button type="button" class="atlas2-rail-btn atlas2-front-prev" aria-label="Previous front plate" title="Previous plate of the front line">‹</button>
            <span class="atlas2-front-label" aria-live="polite"></span>
            <button type="button" class="atlas2-rail-btn atlas2-front-next" aria-label="Next front plate" title="Next plate of the front line">›</button>
          </div>
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
    { const bk = el.querySelector(".atlas2-back"); if (bk && H.back) bk.addEventListener("click", () => H.back()); }   // Phase 4b: the way back to the card a window's tap or go button left
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
    /* PHASE 4 — THE EMBEDDED MODE (docs/atlas-v2-design.md §7 "Phase 4 — as built"; atlas/atlas-embed.js drives it). `opts.embed` mounts the very same controller as a HEADLESS HUB for the card windows
       and Find-it: it keeps the renderer, the worker, the tiles, the water and the history, and drops every thing a page owns — the reader's saved layers and year, the address bar, the gazetteer and
       the names, the label layout, the animation loop. The hub is never drawn to the screen; atlas-embed.js sets its size and view per window, asks for one frame (`plan` then the renderer) and copies
       the canvas into the window's own 2D canvas, so any number of windows share one WebGL context. */
    const EMBED = !!opts.embed;
    let embedHook = null;   // atlas-embed.js: told when a tile, a water level or the history has arrived (the hub has no frame loop of its own)
    const layers = EMBED ? Object.assign({}, DEFAULT_LAYERS, { countries: false, places: false, physical: false, cities: false, relief: false, graticule: false, rivers: false, lakes: false, wars: "off", fronts: false, peoples: "off" }, opts.layers || {}) : loadLayers();
    const view = { history: null, lon: H.home && isFinite(H.home.lon) ? H.home.lon : 10, lat: H.home && isFinite(H.home.lat) ? H.home.lat : 20, zoom: 1, graticule: layers.graticule, level: 0, admin1: false, borders: layers.borders, kmpp: 24, tiles: [], parents: [], waterTiles: [], rivers: layers.rivers, lakes: layers.lakes, smoothRivers: false, relief: { on: layers.relief, strength: layers.strength, fade: 1, tiles: [] }, radius: 100, cx: 0, cy: 0, rot: new Float32Array(9) };
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
      if (G.ready && Math.abs(labelScaleNow() - LS) > 0.001) { spriteGen++; spriteCache.clear(); measureMetrics(); }   // the viewport crossed the phone breakpoint: Medium is a different --fs there (labelScaleNow)
      base = Math.min(cssW, cssH) * 0.46;
      view.cx = cssW / 2; view.cy = cssH / 2;
      needs = true; needsGlobe = true;
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
    const stats = { frames: [], draw: [], uploads: {}, worker: null, escalations: 0, recoveries: 0, stallsIgnored: 0, longTasks: 0, stage: 0, learnt: 0, fetchMs: 0, firstPaintMs: 0, ready: false, level: 0, tiles: [], tileErrors: 0, water: null, waterFetchMs: 0, relief: null, reliefCost: [], labelLayout: [], labelSprite: [], labelDraw: [], markDraw: [], gazetteer: null };
    const perfInHash = /[?&#/]perf\b/.test(location.hash || "");
    let needs = true, needsGlobe = true, raf = 0, lastT = 0, disposed = false, perfOn = perfInHash || (() => { try { return localStorage.getItem(PERF_KEY) === "1"; } catch (e) { return false; } })(), stillAt = null;
    const t0 = performance.now();
    let lastPerfText = 0, lastTraceT = 0;
    function frame(t) {
      raf = 0;
      if (disposed) return;
      if (EMBED) { if (embedHook) embedHook(); return; }   // the hub draws on request (atlas-embed.js), never on its own
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
        const globe = needsGlobe; needsGlobe = false;
        if (STATIC2D && !globe && stillAt) {
          // names only: the globe on screen is already the true one
        } else if (STATIC2D && ((dragging && moved) || coasting) && stillAt) {
          // the still view during a drag: the last frame blitted by the pointer's travel; the true frame comes on release
          const k = R2D / view.radius; let dl = view.lon - stillAt.lon; if (dl > 180) dl -= 360; else if (dl < -180) dl += 360;
          R.shift(-dl / k, (view.lat - stillAt.lat) / k);
        } else { timed(() => R.render(view), "render"); if (STATIC2D) stillAt = { lon: view.lon, lat: view.lat }; }
        if (globe) { stats.draw.push(R.rawStats.lastMs); if (stats.draw.length > 600) stats.draw.shift(); }
        timed(drawLabels, "labelsDraw");
        if (!stats.firstPaintMs && R.levelLoaded(0)) { stats.firstPaintMs = Math.round(performance.now() - t0); if (!EMBED && H.firstDraw) { try { H.firstDraw(); } catch (e) { /* the host may not care */ } } }   // the coarse globe is on screen: the host may start its idle warm-ups now (app.js whenIdleAfterGlobe)
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
      if ((time.alive.length || time.palive.length) && time.onScreenKey !== (time.aliveKey || "") + "@" + k) {
        const va = viewAngleNow(); const now = time.alive.filter((a) => faceOnScreen(a.face, va)); const nowP = time.palive.filter((a) => faceOnScreen(a.face, va)); const nowKey = now.map((a) => a.face).join(",") + "|" + nowP.map((a) => a.face).join(",");
        if (nowKey !== (time.onScreenAlive || []).map((a) => a.face).join(",") + "|" + (time.pOnScreen || []).map((a) => a.face).join(",")) {
          time.onScreenAlive = now; time.pOnScreen = nowP;
          time.aliveArcs = arcFlags(now);
          time.prevArcs = time.aliveArcs;
          wantMeshes(now.map((a) => a.face).concat(nowP.map((a) => a.face)), true);
          if (time.view) { time.view.faces = now.map((a) => ({ face: a.face, rgb: entColour(a.ent), hatch: hatchOf(a.ent), tint: warRoleOf(a.ent) })).concat(time.fade ? time.view.faces.filter((f) => !time.aliveSet.has(f.face)) : []); time.view.pfaces = presenceDraw(time.fade ? time.fade.fromP : null, time.fade ? Math.min(1, (performance.now() - time.fade.t0) / FADE_MS) : 1); }
          uploadStyle(); invalidate();
        }
        time.onScreenKey = (time.aliveKey || "") + "@" + k;
      }
      /* the view's level changed with the same faces on screen (a zoom between two resident levels, or a year set at one zoom and a view set at another):
         the meshes of the new level were never asked for and `historySettled` waited for them for ever — found by the 2c perf views, where the year
         is set first and the view second. Asked for here, at the resting level only (never mid-gesture: a gesture draws one level coarser by design) */
      { const lv = Math.min(2, view.level); if (lv !== time.reqLevel && !gestureLive()) { time.reqLevel = lv; wantMeshes((time.onScreenAlive || []).map((a) => a.face).concat((time.pOnScreen || []).map((a) => a.face)), true); } }
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
      view.admin1 = layers.provinces && k < (EMBED && layers.admin1Max ? layers.admin1Max : ADMIN1_KM_PER_PX) && time.present;   // a card window shows a state's neighbours at its opening zoom (atlas-embed.js sets admin1Max)
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
      if ((view.rivers || view.lakes) && !waterStarted && topologyIn) startWater();   // after the land has arrived (topologyIn): the water file (4.3 MB) must not share a slow link with the 3 MB the first globe is waiting for
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
    function invalidate() { needs = true; needsGlobe = true; if (!raf && !disposed) raf = requestAnimationFrame(frame); }
    /* a redraw of the NAMES alone (a layout arrived, the study layer changed what is marked): the labels have their own canvas, so the
       still view (Canvas 2D, a full frame of seconds on a software renderer) keeps the globe it has and repaints only them — Phase 3c: the
       study layer's last slice landed during the frame gate's drag and its layout cost the drag a full frame */
    function invalidateLabels() { needs = true; if (!raf && !disposed) raf = requestAnimationFrame(frame); }
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
    const pct50 = (arr) => { if (!arr.length) return 0; const a = arr.slice().sort((x, y) => x - y); return a[Math.floor(0.5 * a.length)]; };
    const heapMB = () => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null);
    /* the overlay: on from `#map?perf`, from the P key, or from the About sheet's "Show frame statistics" switch, which is
       remembered per reader (PERF_KEY, localStorage behind try/catch) so the owner can turn it on from a phone with no special
       address; the address keeps its ?perf whatever the switch says */
    const perfSwitch = el.querySelector(".atlas2-perf-switch");
    function setPerf(on, remember) { perfOn = on; perfEl.hidden = !on; if (perfSwitch) perfSwitch.checked = !!on; if (remember) { try { localStorage.setItem(PERF_KEY, on ? "1" : "0"); } catch (e) {} } if (on) perfText(); }
    if (perfSwitch) perfSwitch.addEventListener("change", () => setPerf(perfSwitch.checked, true));

    var timeReady = false;   // 2c: set when the time block exists (the legend is reflected before it)
    /* ---------- the legend (Phase 1c; the layers control until then) ---------- */
    const inputs = {}; sheet.querySelectorAll("[data-layer]").forEach((i) => { const k = i.getAttribute("data-layer"); if (k === "density" || k === "peoples" || k === "wars") (inputs[k] = inputs[k] || []).push(i); else inputs[k] = i; });
    function reflectLayers() {
      for (const k of ["borders", "provinces", "countries", "places", "physical", "cities", "rivers", "lakes", "relief", "graticule", "fronts"]) inputs[k].checked = !!layers[k];
      inputs.strength.value = String(layers.strength); inputs.strength.disabled = !layers.relief || STATIC2D || FILE;
      inputs.relief.disabled = STATIC2D || FILE;   // the still view and a file:// page have no relief (the note in the sheet says why)
      for (const r of inputs.density) r.checked = r.value === layers.density;
      for (const r of inputs.peoples) r.checked = r.value === layers.peoples;
      for (const r of inputs.wars) r.checked = r.value === layers.wars;
      reflectPeoplesNote(); reflectWarsNote();
    }
    function setLayers(patch) {
      const before = JSON.stringify(layers);
      Object.assign(layers, patch);
      layers.strength = Math.max(0.2, Math.min(1, Number(layers.strength) || DEFAULT_LAYERS.strength));
      if (!/^(sparse|normal|dense)$/.test(layers.density)) layers.density = "normal";
      if (!/^(off|linked|all)$/.test(layers.peoples)) layers.peoples = "linked";
      if (!/^(auto|off|on)$/.test(layers.wars)) layers.wars = "auto";
      layers.fronts = layers.fronts !== false;
      view.graticule = layers.graticule;
      if (!EMBED) saveLayers(layers); reflectLayers(); invalidate();
      if (JSON.stringify(layers) !== before) { if (before.indexOf('"peoples":"' + layers.peoples + '"') < 0) refreshPresence(true); if (before.indexOf('"wars":"' + layers.wars + '"') < 0) refreshWars(); if (before.indexOf('"fronts":' + layers.fronts) < 0) refreshFronts(); requestLayout("legend", true); }
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
        if (e.pointerType !== "touch") { pickAt(x, y, false); return; }
        // touch: a second tap within TAP_MS and 30 px of the first zooms in about the spot instead of picking; a single tap picks
        // after the window closes (a pick costs two ID passes, which on a slow GPU would push the second tap past the window)
        if (tapTimer && lastTap && Math.hypot(lastTap.x - x, lastTap.y - y) < 30) { clearTimeout(tapTimer); tapTimer = 0; lastTap = null; zoomAt(2, x, y); touched(); gestureEnded(); return; }
        if (tapTimer) { clearTimeout(tapTimer); tapTimer = 0; }
        lastTap = { x, y };
        tapTimer = setTimeout(() => { tapTimer = 0; lastTap = null; if (!disposed) pickAt(x, y, true); }, TAP_MS);
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
      needs = true; needsGlobe = true;   // the globe moves with it: the still view blits it, and the frame after the last step draws the true one
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
      else if (e.key === "Escape") { if (fan) closeFan(); else if (!aboutEl.hidden) openAbout(false); else if (!sheet.hidden) openSheet(false); else clearSelection(); }
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
      if (fan) { closeFan(); return; }                                                    // the fan first (stacks removed): it is the newest thing on the map
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
    /* A message sent before the worker exists is KEPT and sent right after the `load` message that starts it (it used to be dropped silently: only a hub could reach that state, from its cached first frame, and its
       first requests came later than its worker). The Atlas page now draws from the cache too (below), so a stored past year's history request, a gazetteer or a layout can be asked for first. */
    const preWorker = [];
    function postToWorker(m, transfer) { if (worker) worker.postMessage(m, transfer || []); else if (shim) setTimeout(() => shim.handle(m, onMessage), 0); else if (m.type !== "load" && m.type !== "rebuild") preWorker.push([m, transfer]); }
    function flushPreWorker() { while (preWorker.length) { const [m, tr] = preWorker.shift(); postToWorker(m, tr); } }
    function onMessage(m) {
      if (disposed) return;
      if (m.type === "error") {
        if (/^tile /.test(m.message)) { stats.tileErrors++; landTiles.failed(m.message.split(" ")[1].replace(/:$/, "")); return; }
        if (/^water-tile /.test(m.message)) { waterTiles.failed(m.message.split(" ")[1].replace(/:$/, "")); return; }
        if (/^water/.test(m.message)) { layersNote.hidden = false; layersNote.textContent = "The rivers and lakes could not be read: " + m.message; return; }
        fail("The Atlas data could not be read: " + m.message); return;
      }
      if (m.type === "meta") {
        if (coreCached && !m.fromCache && header && header.buildId === m.header.buildId) { coreStore = null; return; }   // the cached header already applied is this build's: nothing to redo
        if (coreCached && header && header.buildId !== m.header.buildId) { coreCached = null; header = null; }   // a stale cache: the worker's own header (and level 0) replace it
        if (!coreCached && !FILE && typeof indexedDB !== "undefined") coreStore = { rev: CORE_CACHE_REV, meta: { header: m.header, faceEntity: m.faceEntity }, lod0: null };
        header = m.header; faceEntity = m.faceEntity; R.setFaceCount(faceEntity.length);
        if (header.tiles && !FILE && !STATIC2D) { tileIndex = {}; for (const z of Object.keys(header.tiles)) { const t = header.tiles[z]; tileIndex[z] = { cols: t.cols, rows: t.rows, present: new Set(t.present) }; } }   // no tile is fetched from a file or drawn by the still view
        faceOfEntity = new Map(); for (let i = 0; i < faceEntity.length; i++) if (!faceOfEntity.has(faceEntity[i])) faceOfEntity.set(faceEntity[i], i);
        entityIndexById = new Map(header.entities.map((e, i) => [e.id, i]));
        if (pendingZoom) { view.zoom = pendingZoom; pendingZoom = 0; clampView(); plan(); invalidate(); }   // a deep link's zoom past the old floor, now that the tile index says the cap is 150 m/px
        if (!gazStarted && !EMBED) startGazetteer();
        coreIn = true; if (!histStarted && (histWanted || time.year < PRESENT_YEAR)) startHistory();   // 2b: the borders of the past load the first time the rail leaves today, not at boot
        say("Shaping the land…", 0.35); return;
      }
      if (m.type === "gazetteer") { gazInWorker = true; requestLayout("gazetteer", true); return; }
      if (m.type === "progress") { if (!stats.ready) say(m.text, m.frac); return; }
      if (m.type === "layout") { applyLayout(m); return; }
      if (m.type === "lod") {
        if (m.level === 0 && coreCached && !m.fromCache && stats.fromCache && R.levelLoaded(0)) return;   // level 0 is already on the GPU from the cache (the same build, the same worker output)
        const tu = performance.now();
        bracket(() => R.setLevel(m.level, { segs: m.segs, segRange: m.segRange, segCap: m.segCap, segRangeA1: m.segRangeA1, segCapA1: m.segCapA1, facePos: m.facePos, faceIdx: m.faceIdx, faceRange: m.faceRange, faceCap: m.faceCap, faceRangeA1: m.faceRangeA1, faceCapA1: m.faceCapA1 }));
        stats.uploads[m.level] = Math.round(performance.now() - tu);
        say(m.level === 0 ? "Drawing…" : "Adding detail…", 0.5 + 0.17 * (m.level + 1));
        if (m.level === 0 && coreStore && !coreStore.lod0) {   // a hub's first level, kept for the next visit (at idle: a structured clone of 2.6 MB is not the frame's business)
          const st = coreStore; coreStore = null;
          st.lod0 = { level: 0, segs: m.segs, segRange: m.segRange, segCap: m.segCap, segRangeA1: m.segRangeA1, segCapA1: m.segCapA1, facePos: m.facePos, faceIdx: m.faceIdx, faceRange: m.faceRange, faceCap: m.faceCap, faceRangeA1: m.faceRangeA1 || null, faceCapA1: m.faceCapA1 || null };
          const keep = () => { if (!disposed) idbPut("core0", st).catch(() => {}); };
          if (typeof requestIdleCallback === "function") requestIdleCallback(keep, { timeout: 4000 }); else setTimeout(keep, 1500);
        }
        invalidate();
        return;
      }
      if (m.type === "tile") { landTiles.arrived(m.key, { tile: m.tile, stats: m.stats }); bracket(() => R.setTile(m.key, { segs: m.segs, segRange: m.segRange, segCap: m.segCap, segRangeA1: m.segRangeA1, segCapA1: m.segCapA1, facePos: m.facePos, faceIdx: m.faceIdx, faceRange: m.faceRange, faceCap: m.faceCap, faceRangeA1: m.faceRangeA1, faceCapA1: m.faceCapA1 }, m.tile)); stats.tiles.push(m.stats); if (stats.tiles.length > 200) stats.tiles.shift(); invalidate(); return; }
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
      if (m.type === "face-anchors") { const r = faceAnchorWait.get(m.seq); faceAnchorWait.delete(m.seq); if (r) r.cb(m.rows, r.q); return; }
      if (m.type === "history-meta") { onHistoryMeta(m); return; }
      if (m.type === "history-segs") { bracket(() => R.setHistorySegs(m.level, { segs: m.segs, segRange: m.segRange, segCap: m.segCap }), "histSegs"); if (time.hist) time.hist.segLevels++; invalidate(); return; }
      if (m.type === "history-faces") { onHistoryFaces(m); return; }
      if (m.type === "history-done") { if (time.hist) { time.hist.ready = true; time.hist.stats = { ms: m.ms, arcs: m.arcs, faces: m.faces }; } applyYear(time.year, { why: "ready" }); return; }
      if (m.type === "done") { loadBuffer = null; stats.worker = m.stats; stats.ready = true; maybeFrame(); status.hidden = true; el.setAttribute("data-ready", "1"); if (pendingPlace && G.ready && selectById(pendingPlace, { open: true, fly: pendingFly, push: false })) pendingPlace = null; invalidate(); requestLayout("ready", true); }
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
        flushPreWorker();
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
        flushPreWorker();
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
      if (tw.enc === "gzip") {   // Phase 5: a twin may hold the gzip of its bytes (the war slice's: 1.76 MB → 0.63 MB), `bytes` and `sha256` being the raw file's; every browser that runs the engine has DecompressionStream
        if (typeof DecompressionStream !== "function") throw new Error(label + " twin is compressed and this browser cannot decompress it");
        buffer = await new Response(new Blob([buffer]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
      }
      if (buffer.byteLength !== tw.bytes) throw new Error(label + " twin decoded to " + buffer.byteLength + " bytes, not " + tw.bytes);
      try { if (crypto && crypto.subtle) { const d = await crypto.subtle.digest("SHA-256", buffer); const hex = [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join(""); if (hex !== tw.sha256) throw new Error(label + " twin's bytes do not match its sha256"); stats.twinVerified = (stats.twinVerified || 0) + 1; } } catch (e) { if (/sha256/.test(String(e))) throw e; }
      tw.b64 = null;   // 4–6 MB of text the page no longer needs
      return buffer;
    }
    /* the cached first frame (a hub only): read it while the file travels; applied unless the worker has already delivered */
    let coreCached = null, coreStore = null;
    if (!FILE && typeof indexedDB !== "undefined") {   // the Atlas page too (Oct 2026, owner decision 2b): a return visit draws the coarse globe from this read, while the file is still on its way and before the worker has parsed a byte
      idbGet("core0").then((hit) => {
        if (disposed || !hit || hit.rev !== CORE_CACHE_REV || header || !hit.meta || !hit.lod0) return;
        coreCached = hit; stats.fromCache = true;
        onMessage(Object.assign({ type: "meta" }, hit.meta));
        onMessage(Object.assign({ type: "lod" }, hit.lod0));
      }).catch(() => {});
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
          topologyIn = true; if ((layers.rivers || layers.lakes) && !waterStarted) startWater();
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
        topologyIn = true; if ((layers.rivers || layers.lakes) && !waterStarted) startWater();   // the water file now (see plan(): it queued behind nothing on a fast link and in front of the land on a slow one)
      } catch (e) { fail("The Atlas data didn’t arrive (" + (e && e.message ? e.message : e) + "). Check your connection and try again."); }
    })();
    // the water file, once: parsed by the same worker (after the land, which it queues behind)
    let topologyIn = FILE, waterStarted = false, waterFailed = false, waterBuffer = null, waterKeep = null;   // waterKeep: the file until `water-meta`, so a worker that dies can be replaced
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
      resident: new Set(), lru: [], meshBytes: new Map(), meshTotal: 0, wanted: new Set(), pending: 0, selected: -1, playing: false, speed: 25, playY: 0, playT: 0, dir: 1, lastYear: TODAY, dragging: false, seq: 0, changeYears: [], onScreen: [], capitals: [], style: null, arcTab: null, yearChange: [], yearQuery: [], loadMs: 0, histStarted: false, failed: false,
      /* Phase 2c: the PRESENCE layer — the peoples and cultures alive in the year that the Peoples switch lets through (`palive`), the ones on
         screen (`pOnScreen`), the entity indexes of every presence (`presEnts`, `isPres`), the entities a card links (`linkedIds`) */
      presEnts: [], isPres: [], linkedIds: new Set(), palive: [], pSet: new Set(), pOnScreen: [], pKey: "",
      /* Phase 2d: the WARS — the table (atlas/data/wars.js), the wars drawn (`warShown`, from the switch, the study mode and the card), the entities tinted in the year with their role
         (`warRoles`: entity id → { role: 1 victor | 2 loser | 3 both, wars }), the signature of that map (`warKey`, so a war that starts changes the style), the war chosen from a card (`warFocus`),
         the extents (an authored extent is a presence-class soft face drawn as a wash in its side's tint; `isExt`) */
      wars: null, warShown: new Set(), warRoles: new Map(), warKey: "", warFocus: null, isExt: [], extWars: new Map(), warLoading: false, warFailed: false,
      /* Phase 2d: the FRONT line — event faces, dated to the day. `isFront` marks the four entities; `frontDate` is the date the reader stepped to (YYYYMMDD) or null for "the end of the year"; `fronts` the header's plates */
      isFront: [], frontEnts: [], fronts: null, frontDate: null, frontPlates: [], frontAlive: [] };
    timeReady = true;
    const PI = { mode: "map", flags: new Map() };   // the study layer's answer to "does a card of the reader's link it?" (applyStudy keeps it); "map" until the cards are read
    let histStarted = false, histWanted = false, coreIn = false;
    // the first touch of the rail, a year before today, a deep link's year or a suite: fetch the history file now (once)
    /* Phase 4c: a card window's war needs only the war-window slice (atlas/data/history-wars.bin, build-war-slice.js: the states of each war's display year and the war's own sides, 1.8 MB of the 9.1);
       `kind` is "wars" for that and "full" (the default) for everything else — the Atlas page, Find it's area round. The kind of the FIRST request is the file's; a hub that began on the slice is
       recreated by atlas-embed.js when something needs the whole history. */
    let histKind = "full";
    function ensureHistory(kind) { if (!histWanted && !histStarted) histKind = kind === "wars" ? "wars" : "full"; histWanted = true; if (!histStarted && coreIn) startHistory(); }
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
      const SLICE = histKind === "wars", url = opts.historyUrl || (SLICE ? "atlas/data/history-wars.bin" : "atlas/data/history.bin");
      (FILE ? loadTwin(SLICE ? "history-wars.bin" : "history.bin", SLICE ? "the states of the wars" : "the borders of the past") : fetch(url).then((res) => { if (!res.ok) throw new Error("HTTP " + res.status); return res.arrayBuffer(); })).then((buffer) => {
        if (disposed) return;
        time.loadMs = Math.round(performance.now() - t); time.bytes = buffer.byteLength;
        postToWorker({ type: "history", buffer });
      }).catch((e) => { time.failed = true; time.failWhy = String(e && e.message || e); railNote.hidden = false; railNote.textContent = FILE && !SLICE ? "The borders of the past are not in the file copy of the site; open Folio from its web address to see them." : "The borders of the past didn’t arrive (" + time.failWhy + ")."; });
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
      time.isFront = H.entities.map((e) => e.kind === "front"); time.frontEnts = []; time.isFront.forEach((b, i) => { if (b) time.frontEnts.push(i); }); time.fronts = H.fronts || null; time.frontPlates = (H.fronts && H.fronts.plates) || []; time.isExt = H.entities.map((e) => e.kind === "extent"); time.isPres = H.entities.map((e) => e.kind === "people" || e.kind === "culture" || e.kind === "extent"); time.presEnts = []; time.isPres.forEach((b, i) => { if (b) time.presEnts.push(i); });
      time.linkedIds = new Set(H.entities.filter((e) => (e.kind === "people" || e.kind === "culture") && (e.cards || []).length).map((e) => e.id));
      // synthetic rows so the labels, the stack and the card know these places
      H.entities.forEach((e, i) => {
        const steps = time.stepsOf.get(i) || [];
        const faceOfFirst = steps.length ? steps[0][2] : -1; let at = null;
        if (faceOfFirst >= 0) { const c = [time.faceCap[4 * faceOfFirst], time.faceCap[4 * faceOfFirst + 1], time.faceCap[4 * faceOfFirst + 2]]; at = [Math.atan2(c[1], c[0]) * R2D, Math.asin(Math.max(-1, Math.min(1, c[2]))) * R2D]; }
        const row = { id: e.id, name: e.name, kind: e.kind, hist: true, ent: i, at, span: e.span, wiki: e.wiki || null, qid: e.qid || null, key: fold(e.name), akeys: (e.sourceNames || []).map(fold), rank: 0, len: 0, aliases: [] };
        G.byId.set(e.id, row);
      });
      for (const c of H.cities || []) { const id = "cap:" + c.entity + ":" + c.name; if (!G.byId.has(id)) G.byId.set(id, { id, name: c.name, kind: "capital", hist: true, city: c, at: [c.lon, c.lat], within: c.entity, key: fold(c.name), akeys: [], rank: 0, len: 0, aliases: [] }); }
      if (pendingPlace && G.ready && stats.ready && G.byId.has(pendingPlace) && selectById(pendingPlace, { open: true, fly: pendingFly, push: false })) pendingPlace = null;   // the deep link's history place, now that its row exists
      // the colour of each entity (2b): a slot of a fixed palette, chosen once over every epoch so that two polities sharing a
      // border in a year never share a slot, and an entity keeps its slot across the years wherever that allows
      assignSlots();
      histColours();
      loadWars();
      loadPolityNames();
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
    let histRGB = [], histBorderCss = "", histDark = false;   // histDark: the theme's darkness, read by histColours() when the theme changes (a year change reads it, never the computed style: 0d)
    function histColours() {
      const { ink, paper, dark } = themeTokens(); histDark = dark;
      const hsl = (h, sat, lum) => { const c = (1 - Math.abs(2 * lum - 1)) * sat, x = c * (1 - Math.abs((h / 60) % 2 - 1)), mm = lum - c / 2; const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return [r + mm, g + mm, b + mm]; };
      // the slots: hues spread round the wheel in a golden-angle order (neighbouring slot numbers are far apart in hue), two
      // lightness steps so sixteen stay apart; blended with the theme's tokens so every theme keeps its own ink and land
      histRGB = []; for (let k = 0; k < SLOTS; k++) { const h = (k * 137.508) % 360, even = k % 2 === 0; histRGB.push(dark ? mix(hsl(h, 0.55, even ? 0.62 : 0.52), paper, 0.1) : mix(hsl(h, 0.6, even ? 0.48 : 0.58), ink, 0.08)); }
      // the war tints (2d): a green and a red a golden-angle slot never lands on exactly (hue 135° and 4°), each blended with the theme's ink (light) or paper (dark)
      warRGB = { victor: dark ? mix(hsl(138, 0.6, 0.55), paper, 0.08) : mix(hsl(138, 0.62, 0.34), ink, 0.1), loser: dark ? mix(hsl(4, 0.75, 0.6), paper, 0.08) : mix(hsl(4, 0.72, 0.44), ink, 0.1) };
      try { paintWarsKey(); } catch (e) { /* the legend is built before the time block on a first call */ }
      const hb = dark ? mix(paper, ink, 0.35) : mix(paper, ink, 0.58);
      histBorderCss = hb; R.setHistoryBorderColor(hb); presRGB = null; R.setPresenceTheme(dark);   // 2c: the presences' hues follow the theme too (screen on a dark one, multiply on a light one)
      void paper;
    }
    // the colour of an entity in a year: a polity's slot; a contested face its first partner's; a nested face its member's
    const entColourAt = (i, y) => { const e = time.ents[i]; if (!e) return [0.5, 0.5, 0.5]; const p = e.kind === "polity" ? i : entityIndexOfId(e.partners[0]); return histRGB[slotAt(p, y)] || [0.5, 0.5, 0.5]; };
    /* Phase 2d: a side's ground is tinted by its ROLE in the year (victor green, loser red; the legend says so). The tint replaces the entity's own slot colour, so a
       contested face between a victor and a loser is hatched in the two role tints, and a nested face takes its member's role. An entity on both sides in one year
       (the data has none: the builder refuses it) keeps its own colour. */
    let warRGB = { victor: [0.2, 0.62, 0.3], loser: [0.78, 0.2, 0.18] };
    const warRoleOf = (i) => { if (!time.warRoles.size) return 0; const e = time.ents[i]; if (!e) return 0; const id = e.kind === "polity" || e.kind === "extent" ? e.id : e.partners && e.partners[0]; const r = id ? time.warRoles.get(id) : null; return r ? r.role : 0; };
    const warColourOf = (i) => { const r = warRoleOf(i); return r === 1 ? warRGB.victor : r === 2 ? warRGB.loser : null; };
    /* Phase 4 (Find-it): a guess, a miss, a find and the answer are tinted entities of the year — `time.gameTints`: entity id → [r, g, b] (0–1), set by atlas-embed.js; stronger than a state's own hue and a war's tint */
    time.gameTints = null;
    const gameIdOf = (i) => { const e = time.ents[i]; if (!e) return null; return e.kind === "polity" || e.kind === "extent" ? e.id : e.partners && e.partners[0]; };
    const gameColourOf = (i) => { if (!time.gameTints) return null; const id = gameIdOf(i); return id ? time.gameTints.get(id) || null : null; };
    const entColour = (i) => gameColourOf(i) || warColourOf(i) || (EMBED && layers.neutral ? palette.land : entColourAt(i, time.year));   // a war window: the states that did not fight are plain land, so a green or a red on the map is a side
    const hatchOf = (i) => (time.ents[i].kind === "contested" ? entColour(entityIndexOfId(time.ents[i].partners[1])) : null);
    const entityIndexOfId = (id) => { if (!time.entIndex) { time.entIndex = new Map(time.ents.map((e, i) => [e.id, i])); } const i = time.entIndex.get(id); return i == null ? -1 : i; };
    // the arcs of a set of faces as flags, one byte an arc (2b: a Set of tens of thousands of entries was a millisecond a year change)
    const arcFlags = (faces) => { const nA = time.hist ? time.hist.header.counts.arcs : 0; const f = new Uint8Array(nA); for (const a of faces) for (let k = time.faceArcOff[a.face]; k < time.faceArcOff[a.face + 1]; k++) f[time.faceArcs[k]] = 1; return f; };
    /* the alive set of a year: a binary search over each entity's steps */
    function aliveAt(y) {
      const out = [];
      for (const [ent, l] of time.stepsOf) { if (time.isPres[ent] || time.isFront[ent]) continue; let lo = 0, hi = l.length - 1; while (lo <= hi) { const m = (lo + hi) >> 1; if (l[m][1] < y) lo = m + 1; else if (l[m][0] > y) hi = m - 1; else { out.push({ face: l[m][2], ent, from: l[m][0], to: l[m][1] }); break; } } }
      return out;
    }
    /* ---- Phase 2c: the PEOPLES AND CULTURES (design §2.5; study.js decides what a presence IS and what the switch lets through) ---- */
    function AS2() { return root.AtlasStudy || null; }
    const presShown = (ent) => { if (time.isExt[ent]) return time.warRoles.has(time.ents[ent].id) || extInAnyShownWar(ent); const a = AS2(); const id = time.ents[ent].id; return a ? a.peoplesShown(layers.peoples, PI.mode, id, PI.flags, time.linkedIds) : layers.peoples === "all" || (layers.peoples === "linked" && time.linkedIds.has(id)); };
    /* the presences alive in a year, in entity order (so the stipple angles never swap as a year changes) */
    function presAliveAt(y) {
      const out = [];
      for (const ent of time.presEnts) { const l = time.stepsOf.get(ent); if (!l) continue; let lo = 0, hi = l.length - 1; while (lo <= hi) { const m = (lo + hi) >> 1; if (l[m][1] < y) lo = m + 1; else if (l[m][0] > y) hi = m - 1; else { out.push({ face: l[m][2], ent, from: l[m][0], to: l[m][1] }); break; } } }
      return out;
    }
    const presAliveShown = (y) => presAliveAt(y).filter((a) => (time.isExt[a.ent] ? time.warRoles.has(time.ents[a.ent].id) : presShown(a.ent)));   // an extent is drawn only in a year it has a role
    /* a presence's hue: its own wheel (golden angle, offset from the states' slots), a darker one on a light theme (the pass multiplies) and a lighter
       one on a dark theme (it screens). Its stipple angle and pitch are its own, so two overlapping peoples interleave their dots */
    const PRES_ANGLES = [45, 15, 75, 30, 60, 0, 22.5, 67.5];
    const WAR_WASH = 0.5;   // an authored extent: a flat soft wash in its side's tint (alpha at the solid centre; the mesh fades it to nothing at the edge)
    let presRGB = null;   // the hues of every presence in the current theme (reset by histColours on a theme change): the draw list is rebuilt every frame of a crossfade
    function presHue(ent) {
      if (!presRGB) { presRGB = new Map(); for (const i2 of time.presEnts) presRGB.set(i2, presHueOf(i2)); }
      return presRGB.get(ent) || presHueOf(ent);
    }
    function presHueOf(ent) { const { ink, paper, dark } = themeTokens(); const k = time.presEnts.indexOf(ent); const hsl = (h, sat, lum) => { const c = (1 - Math.abs(2 * lum - 1)) * sat, x = c * (1 - Math.abs((h / 60) % 2 - 1)), mm = lum - c / 2; const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return [r + mm, g + mm, b + mm]; }; const h = (40 + k * 137.508) % 360; return dark ? mix(hsl(h, 0.7, 0.62), paper, 0.05) : mix(hsl(h, 0.7, 0.34), ink, 0.1); }
    /* 4 / 0b: the monthly maps of 1939–42 have a frame (atlas-gl.js FRAME); a front face of that era fades to nothing at it. The plates are monthly while their date is on or before FRAME_LAST. */
    const FRAME_LAST = 19421231;
    function frontFrameNow() { const A = AS2(), d = curFrontDate(); if (!A || d == null) return false; const ps = A.platesAt(time.frontPlates, d); return ps.length > 0 && ps.every((p) => A.dateInt(p.date) <= FRAME_LAST); }
    function presenceDraw(fadeFrom, tNow) {
      const out = [], frontFrame = frontFrameNow();
      const one = (a, fade) => { if (time.isFront[a.ent]) { const set = (time.ents[a.ent].front && time.ents[a.ent].front.set) || ""; out.push({ face: a.face, rgb: /^axis/.test(set) ? warRGB.loser : warRGB.victor, front: true, frame: frontFrame, wash: /occupied/.test(set) ? FRONT_WASH.occupied : FRONT_WASH.held, dotA: 0, fade }); return; } if (time.isExt[a.ent]) { const c = warColourOf(a.ent) || warRGB.loser; out.push({ face: a.face, rgb: c, ext: true, wash: WAR_WASH, dotA: 0, fade }); return; } const k = time.presEnts.indexOf(a.ent); out.push({ face: a.face, rgb: presHue(a.ent), angle: PRES_ANGLES[k % PRES_ANGLES.length], pitch: 1 + 0.07 * (k % 3), phase: [k * 2.7, k * 1.9], dotA: time.selected === a.ent ? 0.9 : null, fade }); };
      const fromSet = fadeFrom ? new Set(fadeFrom.map((a) => a.face)) : null;
      for (const a of time.pOnScreen || []) one(a, fromSet && !fromSet.has(a.face) ? tNow : 1);
      if (fromSet) for (const a of fadeFrom) if (!time.pSet.has(a.face)) one(a, 1 - tNow);
      return out;
    }
    /* the Peoples switch or the study mode moved: the alive presences of the year change, so the year is applied again (meshes, labels, ticks) */
    function refreshPresence() { if (!time.hist || !time.hist.ready) return; applyYear(time.year, { force: true, why: "peoples" }); }
    /* ---- Phase 2d: the FRONT LINE (event faces dated to the day; study.js does the arithmetic) ---- */
    const frontEl = el.querySelector(".atlas2-front"), frontLabel = el.querySelector(".atlas2-front-label");
    const frontShown = (ent) => { const A = AS2(); return !!A && A.frontsShown(layers.fronts, PI.mode, time.ents[ent].id, PI.flags); };
    let autoFrontYear = null, autoFrontVal = null;   // 0d: autoFrontDate walks every plate; the answer for a year never changes while the plates do not
    const curFrontDate = () => { const A = AS2(); if (!A || !time.frontPlates.length) return null; if (time.frontDate != null && Math.floor(time.frontDate / 10000) === time.year) return time.frontDate; if (autoFrontYear !== time.year) { autoFrontVal = A.autoFrontDate(time.frontPlates, time.year); autoFrontYear = time.year; } return autoFrontVal; };
    function frontAliveAt(d) {
      const out = []; if (d == null) return out;
      for (const ent of time.frontEnts) {
        if (!frontShown(ent)) continue;
        const l = time.stepsOf.get(ent); if (!l) continue;
        let lo = 0, hi = l.length - 1; while (lo <= hi) { const m = (lo + hi) >> 1; if (l[m][1] < d) lo = m + 1; else if (l[m][0] > d) hi = m - 1; else { out.push({ face: l[m][2], ent, from: l[m][0], to: l[m][1] }); break; } }
      }
      return out;
    }
    const FRONT_WASH = { held: 0.42, occupied: 0.26 };   // a held side's ground is tinted more than the ground it occupies
    const isoOf = (n) => { const q = String(n); return q.slice(0, 4) + "-" + q.slice(4, 6) + "-" + q.slice(6, 8); };
    const dayShift = (n, k) => Number(new Date(Date.parse(isoOf(n) + "T00:00:00Z") + k * 86400000).toISOString().slice(0, 10).replace(/-/g, ""));
    const dayDiff = (a, b) => Math.round((Date.parse(isoOf(b) + "T00:00:00Z") - Date.parse(isoOf(a) + "T00:00:00Z")) / 86400000);
    function frontText(d) {
      const A = AS2(); if (d == null || !A) return "";
      const ps = A.platesAt(time.frontPlates, d);
      const eur = ps.find((p) => p.theatre === "eur"), pac = ps.find((p) => p.theatre === "pac");
      const bits = []; if (eur) bits.push("Europe " + (eur.rms_km != null ? "±" + Math.round(eur.rms_km) + " km" : "")); if (pac) bits.push("Pacific ±" + Math.round(pac.rms_km) + " km");
      // a gap in the sources before this plate (the stepper jumps over it, and says so)
      const dates = A.plateDates(time.frontPlates), i = dates.indexOf(d);
      let gap = "";
      if (i > 0) { const prevEnd = Math.max.apply(null, time.frontPlates.filter((p) => A.dateInt(p.date) === dates[i - 1]).map((p) => A.dateInt(p.end))); if (dayDiff(prevEnd, d) > 1) gap = " · no plate from " + A.fmtDate(dayShift(prevEnd, 1)) + " to " + A.fmtDate(dayShift(d, -1)) + " (no source)"; }
      return A.fmtDate(d) + (bits.length ? " · approximate " + bits.join(", ") : "") + gap;
    }
    function reflectFront() {
      if (!timeReady || !frontEl) return;
      const yr = time.year, can = layers.fronts && time.frontEnts.length && time.frontEnts.some(frontShown) && yr >= 1939 && yr <= 1945 && !time.present;
      const d = can ? curFrontDate() : null;
      frontEl.hidden = !(can && d != null);
      if (frontEl.hidden) return;
      const t = "The front line · " + frontText(d);
      if (frontLabel.textContent !== t) frontLabel.textContent = t;
      frontEl.querySelector(".atlas2-front-prev").disabled = AS2().stepPlate(time.frontPlates, d, -1) == null;
      frontEl.querySelector(".atlas2-front-next").disabled = AS2().stepPlate(time.frontPlates, d, 1) == null;
    }
    function stepFront(dir) {
      const A = AS2(); const d = curFrontDate(); if (!A || d == null) return false;
      const n = A.stepPlate(time.frontPlates, d, dir); if (n == null) return false;
      time.frontDate = n; const y = Math.floor(n / 10000);
      if (y !== time.year) setYear(y, { keepFront: true }); else applyYear(y, { force: true, why: "fronts" });
      return true;
    }
    function refreshFronts() { if (!time.hist || !time.hist.ready) return; applyYear(time.year, { force: true, why: "fronts" }); }
    if (frontEl) { frontEl.querySelector(".atlas2-front-prev").addEventListener("click", () => stepFront(-1)); frontEl.querySelector(".atlas2-front-next").addEventListener("click", () => stepFront(1)); }
    /* the place card of a front: which ground it is, the plate standing on the chosen date, every plate (each a button that steps to it), the gap, the uncertainty */
    function frontCardHtml(e) {
      const A = AS2(); const set = (e.front && e.front.set) || ""; const d = curFrontDate();
      let html = `<p class="atlas2-card-span">${escText(e.name)} as the plates of the Second World War draw it: ${(time.stepsOf.get(entityIndexOfId(e.id)) || []).length} dated steps, each a plate that stands from its date until the next plate of its theatre replaces it.</p>`;
      if (d != null && A) { const ps = A.platesAt(time.frontPlates, d); html += `<p class="atlas2-card-front-now"><b>${escText(A.fmtDate(d))}</b>: ${ps.length ? ps.map((p) => escText((p.theatre === "pac" ? "Pacific" : "Europe") + " plate of " + A.fmtDate(A.dateInt(p.date)) + " — " + p.note)).join("<br>") : "no plate stands for this date: nothing is drawn."}</p>`; }
      html += `<p class="atlas2-card-uncert">Approximate: every plate is the situation on its date, redrawn from a map (the Wikimedia Commons maps of San Jose and the US Army’s atlas of 1945, both public domain), never a surveyed or daily front. A front is a line between two classes of ground, not a border.</p>`;
      html += `<p class="atlas2-card-frame">Where this ground fades out at a straight edge in 1939–42 (through European Russia, across the Sahara, in the far north), the source map ends there; the war did not.</p>`;
      html += `<p class="atlas2-card-gaps">No plate exists for January–June 1943 in either source: nothing is drawn between 31 January and 30 June 1943.</p>`;
      if (A) { const dates = A.plateDates(time.frontPlates); html += `<details class="atlas2-card-steplist"><summary>Every plate (${dates.length} dates)</summary><ol>${dates.map((x) => `<li><button type="button" class="atlas2-link atlas2-front-go" data-front="${x}">${escText(A.fmtDate(x))}</button></li>`).join("")}</ol></details>`; }
      html += `<p class="atlas2-card-scope">The front line is drawn for the Second World War only (1939–45), and only on the maps of its two sources: Europe to December 1942, then Europe and the Pacific from July 1943.</p>`;
      return html;
    }
    /* ---- Phase 4, 0c: DISPLAY-NAME OVERRIDES (atlas/data/polity-names.js, from polity-names.json) ----
       Cliopatria names a row once for its whole span; where Wikidata dates a different name for the same ground (the Kingdom of Hungary from 1920, the Federal State of Austria from 1934),
       the row shows that name in those years. Only the display string moves — the id, the faces and the steps are untouched — so `row.name` and `row.key` are set as the year is applied,
       and the worker is given the same table for the labels. The Cliopatria name stays an alias of the row, and so does every override name (a search finds the row by either). */
    time.polityNames = null;
    function nameIn(id, y, base) { const l = time.polityNames && time.polityNames[id]; if (l) for (const o of l) if (y >= o[0] && y <= o[1]) return o[2]; return base; }
    function loadPolityNames() {
      if (time.polityNames || time.namesLoading) return; time.namesLoading = true;
      loadScript(opts.namesUrl || "atlas/data/polity-names.js").then(() => {
        const T = root.ATLAS_POLITY_NAMES; time.namesLoading = false; if (!T || !T.names) return;
        time.polityNames = T.names; time.nameEvidence = T.evidence || {};
        for (const [id, l] of Object.entries(T.names)) { const row = G.byId.get(id); if (row) for (const o of l) { const k = fold(o[2]); if (row.akeys.indexOf(k) < 0) row.akeys.push(k); } }
        postToWorker({ type: "polity-names", names: T.names });
        applyNames(time.year); requestLayout("names", true);
      }).catch((e) => { time.namesLoading = false; if (typeof console !== "undefined") console.warn("atlas2 polity names failed: " + (e && e.message || e)); });
    }
    function applyNames(y) {
      if (!time.polityNames) return;
      for (const id of Object.keys(time.polityNames)) {
        const row = G.byId.get(id); if (!row) continue; const e = time.ents[row.ent]; const nm = nameIn(id, y, e.name);
        if (row.name !== nm) { row.name = nm; row.key = fold(nm); if (typeof cardRow !== "undefined" && cardRow === row && cardOpen) cardTitle.textContent = nm; }
      }
    }
    /* ---- Phase 2d: the WARS (atlas/data/wars.js; study.js does the arithmetic) ---- */
    const extInAnyShownWar = (ent) => { const ws = time.extWars.get(time.ents[ent].id); return !!ws && ws.some((w) => time.warShown.has(w)); };
    function loadWars() {
      if (time.wars || time.warLoading || time.warFailed || !FILE_OK_WARS()) return;
      time.warLoading = true;
      loadScript(opts.warsUrl || "atlas/data/wars.js").then(() => {
        if (disposed) return;
        const W = root.ATLAS_WARS; time.warLoading = false;
        if (!W || !W.wars) { time.warFailed = true; return; }
        time.wars = W.wars; time.extWars = new Map(); try { tryPendingWar(); } catch (e) { /* the deep link's war is not worth a failed table */ }
        for (const [id, w] of Object.entries(W.wars)) for (const k of ["v", "l"]) { const x = w[k] && w[k].x; if (x) { let l = time.extWars.get(x); if (!l) time.extWars.set(x, l = []); l.push(id); } }
        refreshWars();
      }).catch((e) => { time.warLoading = false; time.warFailed = true; if (typeof console !== "undefined") console.warn("atlas2 wars table failed: " + (e && e.message || e)); });
    }
    const FILE_OK_WARS = () => true;
    /* the wars drawn, from the switch, the study mode and the card; then the year is applied again (the tints, the washes, the ticks) */
    function computeWarShown() {
      const A = AS2(); if (!A || !time.wars) { time.warShown = new Set(); return; }
      time.warShown = A.warsShown(time.wars, { pos: layers.wars, mode: PI.mode, cardSet: typeof ST !== "undefined" && ST.st ? ST.st.cardSet : null, hidden: typeof ST !== "undefined" ? ST.hidden : null, info: typeof ST !== "undefined" && ST.ready ? info : null, focus: time.warFocus });
    }
    function refreshWars() {
      computeWarShown(); reflectWarsNote();
      if (!time.hist || !time.hist.ready) return;
      applyYear(time.year, { force: true, why: "wars" });
    }
    function computeWarRoles(y) {
      const A = AS2(); if (!A || !time.wars || !time.warShown.size) { if (time.warRoles.size) time.warRoles = new Map(); time.warKey = ""; return; }
      time.warRoles = A.warRoles(time.wars, time.warShown, y);
      let k = ""; for (const [id, r] of time.warRoles) k += id + ":" + r.role + ";";
      time.warKey = k;
    }
    var warsNoteText = null;
    function reflectWarsNote() {
      if (!timeReady) return;
      const el2 = sheet.querySelector(".atlas2-wars-note"); if (!el2) return;
      let t = "";
      const effW = AS2() ? AS2().warsEffective(layers.wars, PI.mode) : layers.wars;
      if (effW === "off" && !time.warFocus) t = layers.wars === "auto" ? "Wars are not tinted on the plain Map. Choose On to tint them, or open a war from its card." : "Wars are not tinted.";
      else if (!time.wars) t = time.warFailed ? "The wars table didn’t arrive." : "Reading the wars…";
      else if (time.warFocus && time.wars[time.warFocus]) t = "Showing one war: " + (time.wars[time.warFocus].t || time.warFocus) + ".";
      else { const n = [...time.warRoles.keys()].length; t = (PI.mode === "personal" ? "Wars from the cards you have studied. " : "Every war a card teaches. ") + (n ? (AS2() ? AS2().fmtN(n) : String(n)) + (n === 1 ? " side is" : " sides are") + " tinted in this year." : "None is tinted in this year."); }
      if (t !== warsNoteText) { warsNoteText = t; el2.textContent = t; }
    }
    var peoplesNoteText = null;
    function reflectPeoplesNote() {
      if (!timeReady) return;   // the legend is reflected once at mount, before the time block below exists
      const el2 = sheet.querySelector(".atlas2-peoples-note"); if (!el2) return;
      const a = AS2(); const t = a ? a.peoplesNote(layers.peoples, PI.mode, time.hist && time.hist.ready ? (time.palive || []).filter((a) => !time.isExt[a.ent]).length : null) : "";
      if (t !== peoplesNoteText) { peoplesNoteText = t; el2.textContent = t; }
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
      for (const [ent, l] of time.stepsOf) { if (time.isFront[ent]) continue; const pres = time.isPres[ent]; if (pres && !presShown(ent)) continue; for (const st of l) { const fi = st[2]; const d = Math.max(-1, Math.min(1, time.faceCap[4 * fi] * rot[6] + time.faceCap[4 * fi + 1] * rot[7] + time.faceCap[4 * fi + 2] * rot[8])); if (Math.acos(d) - time.faceCap[4 * fi + 3] <= viewAngle) { visEnt.add(ent); if (!pres && st[0] <= time.year && st[1] >= time.year) onScreen.push(fi); } } }   // a people's steps tick like a state's (2c) once the switch lets it through; only a state counts for the "no state is mapped" note
      const ys = new Set();
      // 2d: a war starting or ending (and a member's window) is a change on screen where one of its entities is
      if (time.wars && time.warShown.size) for (const id of time.warShown) {
        const w = time.wars[id]; if (!w) continue;
        let on = false; for (const k of ["v", "l"]) { for (const m of w[k].m) { const ei = entityIndexOfId(m[0]); if (ei >= 0 && visEnt.has(ei)) { on = true; ys.add(m[1]); if (m[2] + 1 <= TODAY) ys.add(m[2] + 1); } } if (w[k].x) { const ei = entityIndexOfId(w[k].x); if (ei >= 0 && visEnt.has(ei)) on = true; } }
        if (on) { ys.add(w.y[0]); if (w.y[1] + 1 <= TODAY) ys.add(w.y[1] + 1); }
      }
      for (const ent of visEnt) for (const st of time.stepsOf.get(ent)) { ys.add(st[0]); if (st[1] + 1 <= TODAY) ys.add(st[1] + 1); }
      ys.add(PRESENT_YEAR);
      time.onScreen = onScreen;
      return [...ys].filter((y) => y >= RAIL_FROM && y <= TODAY).sort((a, b) => a - b);
    }
    /* A STEPPED YEAR'S LAYOUT AND ADDRESS WAIT FOR THE FRAME (Phase 4c, task 0d). A year change that is not a drag — a step, a jump, the pin's release — asked for its
       layout at once, which measures the controls (`chromeRects`) and writes the address. Those reads come straight after `applyYear` has written the rail's pin
       and year, so the browser had to lay the page out again inside the call: 1.4–2.2 ms against 0.2 ms on a clean page, and 0.8 ms for `replaceState`, the whole
       of the 3.1–4.3 ms p95 the gate read (13 of 172 changes in a scrub, every one of them the tail). The same two steps now run once at the start of the next
       frame — where the frame's own layout was due anyway, and several changes in one frame make one request — with a timer behind it for a hidden tab. */
    let yearFlush = 0, yearFlushTimer = 0;
    function yearFlushLater() {
      if (EMBED || yearFlush) return;
      const run = () => { if (!yearFlush) return; yearFlush = 0; clearTimeout(yearFlushTimer); if (disposed) return; requestLayout("year", true); writeHash(false); };
      yearFlush = requestAnimationFrame(run);
      yearFlushTimer = setTimeout(() => { cancelAnimationFrame(yearFlush); run(); }, 120);
    }
    /* THE YEAR: the alive set, the style tables, the meshes wanted (and the look-ahead), the layout */
    function applyYear(y, o) {
      hideSearchNote();   // a note that says a polity is not on the map in the OLD year is stale
      o = o || {};
      const t0 = performance.now();
      y = clampYear(y);
      const wasPresent = time.present;
      time.dir = y >= time.lastYear ? 1 : -1; time.lastYear = time.year; time.year = y;
      time.present = y >= PRESENT_YEAR;
      applyNames(y);
      if (!time.present && !histStarted) ensureHistory();
      railPin.setAttribute("aria-valuenow", String(y)); railPin.setAttribute("aria-valuetext", fmtYear(y));
      railPin.style.left = (railX(y) * 100) + "%";
      if (document.activeElement !== railYear) railYear.value = fmtYear(y);
      if (time.hist) {
        const tq = performance.now(); computeWarRoles(y); const alive = aliveAt(y); if (time.frontDate != null && Math.floor(time.frontDate / 10000) !== y) time.frontDate = null; const pVis = (time.presEnts.length ? presAliveShown(y) : []).concat(time.frontEnts.length ? frontAliveAt(curFrontDate()) : []); time.yearQuery.push(performance.now() - tq); if (time.yearQuery.length > 600) time.yearQuery.shift();   // the query alone (2b): what the 5 ms rule names — the presences' too (2c)
        const key = alive.map((a) => a.face).join(",") + (pVis.length ? "|" + pVis.map((a) => a.face).join(",") : "") + (time.warKey ? "#" + time.warKey : "");
        const changed = key !== time.aliveKey;
        if (changed) {
          const prevFaces = time.onScreenAlive || [], prevP = time.pOnScreen || [];
          time.palive = pVis; time.pSet = new Set(pVis.map((a) => a.face)); time.pKey = pVis.map((a) => a.face).join(",");
          time.aliveKey = key; time.alive = alive; time.aliveSet = new Set(alive.map((a) => a.face)); time.aliveEnt = new Set(alive.concat(pVis).map((a) => time.ents[a.ent].id));
          const va = viewAngleNow(); time.onScreenAlive = alive.filter((a) => faceOnScreen(a.face, va)); time.onScreenKey = key + "@" + onScreenKey;
          time.aliveArcs = arcFlags(time.onScreenAlive);
          time.pOnScreen = pVis.filter((a) => faceOnScreen(a.face, va));
          // the crossfade: when stepping or playing, never while the pin is dragged, never under reduced motion
          if (!o.drag && !reducedNow() && prevFaces.length + alive.length + prevP.length + time.pOnScreen.length && o.why !== "meta" && o.why !== "ready" && o.why !== "peoples") { time.fade = { from: prevFaces, fromP: prevP, fromArcs: time.prevArcs || null, t0: performance.now() }; } else time.fade = null;
          time.prevArcs = time.aliveArcs;
          wantMeshes(time.onScreenAlive.map((a) => a.face).concat(time.pOnScreen.map((a) => a.face)), true);
          if (!o.drag) lookAhead();
        }
        if (changed || time.fade || wasPresent !== time.present || o.force) uploadStyle(changed ? 1 : 1);
        time.view = { faces: time.onScreenAlive.map((a) => ({ face: a.face, rgb: entColour(a.ent), hatch: hatchOf(a.ent), tint: warRoleOf(a.ent) })), pfaces: presenceDraw(time.fade ? time.fade.fromP : null, 0), present: time.present, strokePx: 0 };
        time.capitals = (time.hist.header.cities || []).filter((c) => c.from <= y && c.to >= y && alive.some((a) => time.ents[a.ent].id === c.entity)).map((c) => ({ entity: c.entity, name: c.name, lon: c.lon, lat: c.lat }));
        refreshOnScreen();   // the ticks and the note: rebuilt only when the alive set or the view changed (not on every year of a scrub)
        if (changed) reflectPeoplesNote();
        reflectFront(); reflectWarsNote();
      } else { time.view = { faces: [], pfaces: [], present: time.present, strokePx: 0 }; if (!histStarted || time.failed) railNote.hidden = true; }
      if (wasPresent !== time.present) { if (sel.id && !G.byId.get(sel.id)?.hist && !time.present) clearSelection(); }
      if (!o.drag && !EMBED) { try { localStorage.setItem(YEAR_KEY, String(y)); } catch (e) {} }
      plan(); invalidate();
      if (o.why === "play") { const now = performance.now(); if (now - (time.lastPlayLayout || 0) > 500) { time.lastPlayLayout = now; requestLayout("year", true); } else requestLayout("year"); writeHash(false); }   // playing: a layout twice a second at most (one per frame starved the frame on a software rasteriser)
      else if (!o.drag) { yearFlushLater(); if (o.why !== "peoples") announce(fmtYear(y)); }   // the Peoples switch re-applies the year: it is not a year change to a screen reader
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
      const dark = histDark; const base = dark ? HIST_FILL_ALPHA_DARK : HIST_FILL_ALPHA;
      let tNow = 1; if (time.fade) tNow = Math.min(1, (performance.now() - time.fade.t0) / FADE_MS);
      const put = (fi, alphaScale) => { const ent = time.faceEntity[fi]; const c = entColour(ent); const a = (time.selected === ent ? HIST_SEL_ALPHA : base) * alphaScale * (warRoleOf(ent) === 1 || warRoleOf(ent) === 2 ? WAR_FILL_BOOST : 1) * (gameColourOf(ent) ? 1.7 : 1); const o = 4 * fi; time.style[o] = Math.round(c[0] * 255); time.style[o + 1] = Math.round(c[1] * 255); time.style[o + 2] = Math.round(c[2] * 255); time.style[o + 3] = Math.max(time.style[o + 3], Math.round(a * 255)); };
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
      if (time.view) { time.view.faces = (time.onScreenAlive || []).map((a) => ({ face: a.face, rgb: entColour(a.ent), hatch: hatchOf(a.ent), tint: warRoleOf(a.ent) })).concat(fromFaces); time.view.pfaces = presenceDraw(time.fade.fromP, Math.min(1, u)); }
      uploadStyle();
      if (u >= 1) { time.fade = null; if (time.view) { time.view.faces = (time.onScreenAlive || []).map((a) => ({ face: a.face, rgb: entColour(a.ent), hatch: hatchOf(a.ent), tint: warRoleOf(a.ent) })); time.view.pfaces = presenceDraw(null, 1); } uploadStyle(); }
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
      const va = viewAngleNow(); wantMeshes(aliveAt(next).concat(time.presEnts.length ? presAliveShown(next) : []).filter((a) => faceOnScreen(a.face, va)).map((a) => a.face), false);
    }
    function onHistoryFaces(m) {
      time.pending = Math.max(0, time.pending - 1);
      bracket(() => { for (const mesh of m.meshes) { const key = mesh.face + ":" + mesh.level; time.wanted.delete(key); R.setHistoryMesh(key, mesh); time.resident.add(key); time.lru.push(key); const b = mesh.pos.byteLength + mesh.idx.byteLength + (mesh.coast ? mesh.coast.byteLength : 0); time.meshBytes.set(key, b); time.meshTotal += b; } }, "histMesh");
      for (const fi of m.faces || []) time.wanted.delete(fi + ":" + m.level);
      // the LRU, by bytes: drop the oldest meshes the year does not draw until the resident set fits MESH_BYTES
      const evicted = []; let spins = 0;
      while (time.meshTotal > MESH_BYTES && time.lru.length && spins++ < time.lru.length * 2) { const key = time.lru.shift(); const fi = Number(key.split(":")[0]); if (time.aliveSet.has(fi) || time.pSet.has(fi)) { time.lru.push(key); continue; } R.dropHistoryMesh(key); time.resident.delete(key); time.meshTotal -= time.meshBytes.get(key) || 0; time.meshBytes.delete(key); evicted.push(key); }
      if (evicted.length) postToWorker({ type: "history-evict", keys: evicted });
      invalidate();
    }
    const historySettled = () => !histStarted || time.failed || (!!time.hist && time.hist.ready && (time.onScreenAlive || []).concat(time.pOnScreen || []).every((a) => time.resident.has(a.face + ":" + Math.min(2, view.level))));
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
      // at most about TICKS_MAX ticks a view (2b), AND NEVER MORE THAN THE WIDTH CAN SHOW APART (Phase 3a, task 0c): change years
      // closer than a bucket merge into one tick, drawn taller the more it stands for; the bucket is at least TICK_PX wide, so on a
      // 390 px phone (a 224 px track) the view's 177 change years become at most 56 ticks instead of a solid bar (measured: runs of
      // 9 and 28 CSS px of unbroken ink at 390 and 360 px). The entities in view still decide WHICH years tick; [ and ] still step
      // through every change year (stepChange reads the full list)
      const TICKS_MAX = 200, TICK_PX = 4; const bucket = Math.max(w / TICKS_MAX, TICK_PX); const merged = new Map();
      for (const y of time.changeYears) { const px = railX(y) * w; const b = Math.floor(px / bucket); let m = merged.get(b); if (!m) merged.set(b, m = { sx: 0, n: 0 }); m.sx += px; m.n++; }
      // two buckets' means can still sit a pixel apart across their boundary (measured: a run of 3 px at 430 px); ticks closer
      // than TICK_GAP merge too, so every tick has blank pixels on both sides
      const TICK_GAP = 3; const ticks = [];
      for (const [, m] of [...merged].sort((p, q) => p[1].sx / p[1].n - q[1].sx / q[1].n)) { const px = m.sx / m.n; const last = ticks[ticks.length - 1]; if (last && px - last.px < TICK_GAP) { last.px = (last.px * last.n + px * m.n) / (last.n + m.n); last.n += m.n; } else ticks.push({ px, n: m.n }); }
      let maxN = 0, minGap = Infinity;
      for (let i = 0; i < ticks.length; i++) { const t = ticks[i], px = Math.round(t.px) + 0.5, hh = t.n > 1 ? 5 : 3; x.beginPath(); x.moveTo(px, h / 2 - hh); x.lineTo(px, h / 2 + hh); x.stroke(); if (t.n > maxN) maxN = t.n; if (i && Math.round(t.px) - Math.round(ticks[i - 1].px) < minGap) minGap = Math.round(t.px) - Math.round(ticks[i - 1].px); }
      time.tickStats = { years: time.changeYears.length, ticks: ticks.length, width: w, bucket, minGap: ticks.length > 1 ? minGap : null, maxMerged: maxN };   // for the suites (test-atlas-review.js section 2)
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
    { let y = null; if (!EMBED) try { const v = localStorage.getItem(YEAR_KEY); if (v != null && v !== "" && isFinite(Number(v))) y = clampYear(Number(v)); } catch (e) {} time.year = y == null ? TODAY : y; time.lastYear = time.year; time.present = time.year >= PRESENT_YEAR; railPin.style.left = (railX(time.year) * 100) + "%"; railYear.value = fmtYear(time.year); railPin.setAttribute("aria-valuenow", String(time.year)); railPin.setAttribute("aria-valuetext", fmtYear(time.year)); }

    /* ================= Phase 1c: names, picking, the place card, search, deep links, the keyboard =================
       (docs/atlas-v2-design.md §2.6, §2.8, §2.9 and §7 "Phase 1c — as built"; the worker's half is in atlas-worker.js) */
    const G = { rows: [], byId: new Map(), byRiver: new Map(), ready: false };
    const L = { placed: [], marks: [], live: [], ln: 0, markGroups: [], markIndex: new Map(), mA: null, lastMarkMs: 0, candidates: 0, cap: 0, seq: 0, lastLayoutMs: 0, lastDrawMs: 0, keyIds: "" };
    const STYLE_BY_ID = Object.fromEntries(STYLES.map((s) => [s.id, s]));
    let gazStarted = false, gazInWorker = false, faceOfEntity = null, entityIndexById = null, pendingPlace = null, pendingFly = false, pendingZoom = 0, focusId = null, flying = null, lastWrittenHash = null;
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
        G.ready = true; maybeFrame();
        stats.gazetteer = { rows: G.rows.length, ms: Math.round(performance.now() - t) };
        if (pendingPlace && stats.ready && selectById(pendingPlace, { open: true, fly: pendingFly, push: false })) pendingPlace = null;
        postToWorker({ type: "gazetteer", table: T });
        loadStudy();   // the study layer's two lazy files, once the gazetteer's rows are in G (Phase 3b)
        measureMetrics();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!disposed) measureMetrics(); });
      }).catch((e) => { layersNote.hidden = false; layersNote.textContent = "The place names didn’t arrive (" + (e && e.message ? e.message : e) + ")."; });
    }
    const entityOf = (id) => (entityIndexById ? entityIndexById.get(id) : null);
    function faceOfId(id) { const i = entityOf(id); return i == null || !faceOfEntity ? null : (faceOfEntity.has(i) ? faceOfEntity.get(i) : null); }

    /* ---- glyph metrics: every style's advances, measured on the label canvas, posted to the worker ---- */
    let faces = themeFaces(), metricsSent = 0, LS = labelScaleNow();   // LS: the Text-size factor of the names (see labelScaleNow)
    const extraChars = new Set();
    function themeFaces() {
      const cs = getComputedStyle(document.body);
      const g = (n, d) => cs.getPropertyValue(n).trim() || d;
      return { display: g("--display", "system-ui, sans-serif"), sans: g("--sans", "system-ui, sans-serif"), serif: g("--serif", "Georgia, serif") };
    }
    const fontOf = (st, px) => `${st.italic ? "italic " : ""}${st.weight} ${px}px ${faces[st.face]}`;   // ctx.font must carry a pixel size
    function measureMetrics() {
      faces = themeFaces(); LS = labelScaleNow();
      const styles = {};
      const chars = [...ALPHABET, ...extraChars];
      for (const st of STYLES) {
        const adv = {}, advSmall = {}, px = st.size * LS;
        lctx.font = fontOf(st, px);
        for (const ch of chars) adv[ch] = lctx.measureText(ch).width;
        if (st.caps) { lctx.font = fontOf(st, px * SMALL_SCALE); for (const ch of chars) advSmall[ch] = lctx.measureText(ch).width; }
        styles[st.id] = { id: st.id, size: px, caps: !!st.caps, smallScale: SMALL_SCALE, track: st.track * LS, adv, advSmall };
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
      if (disposed || EMBED) return;
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
    const CHROME = [".atlas2-search-in", ".atlas2-results", ".atlas2-search-note", ".atlas2-study", ".atlas2-zoom", ".atlas2-layers-btn", ".atlas2-sheet", ".atlas2-about-btn", ".atlas2-card", ".atlas2-stack", ".atlas2-status", ".atlas2-mode", ".atlas2-rail"];
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
      L.chrome = chromeRects();   // kept for the painter: between layouts a label that slid under a control or past the frame is not drawn (Phase 4c)
      postToWorker({ type: "layout", seq, reason, chrome: L.chrome, year: time.year, present: time.present, aliveFaces: time.hist ? time.alive.map((a) => a.face).concat(time.palive.map((a) => a.face)) : [], capitals: time.capitals, rot: Float32Array.from(view.rot), radius: view.radius, cx: view.cx, cy: view.cy, W: cssW, H: cssH, kmpp: view.kmpp, level: view.level, density: layers.density, phone: PHONE, fs: LS, show: { countries: layers.countries, places: layers.places, physical: layers.physical, cities: layers.cities, provinces: layers.provinces, rivers: layers.rivers, lakes: layers.lakes }, admin1: view.admin1, riversDrawn: view.rivers, selected: sel.id, debug: !!L.debug });
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
      L.placed = m.placed; L.marks = m.marks || []; indexMarks();
      if (m.missing && m.missing.length) { let grew = false; for (const [, ch] of m.missing) if (!extraChars.has(ch)) { extraChars.add(ch); grew = true; } if (grew && extraChars.size < 400) measureMetrics(); }
      updateKeys();
      invalidateLabels();
      while (layoutWaiters.length) layoutWaiters.shift()(L.placed);
    }

    /* ---- sprites: a label rendered once, glyph by glyph, halo then ink, at its layout position ---- */
    let haloCss = "", inkCss = "", waterCss = "", selCss = "", accentCss = "";
    function labelColours() {
      const { ink, paper, paper2, indigo, ochre, dark } = themeTokens();
      const hex = (c) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0")).join("");
      haloCss = hex(dark ? paper : paper);
      inkCss = hex(ink);
      // water names: a deep blue-ink in a light theme, a pale blue in a dark one — read against both the sea and the land
      waterCss = hex(dark ? mix([0.55, 0.8, 1], paper, 0.12) : mix(ink, [31 / 255, 122 / 255, 170 / 255], 0.5));
      selCss = hex(dark ? mix(paper, ochre, 0.5) : mix(ink, ochre, 0.55));
      accentCss = hex(ochre);   // the fill of the reader's own marks (Phase 3b)
      void paper2; void indigo;
    }
    labelColours();
    const WATER_KINDS = { sea: 1, ocean: 1, gulf: 1, strait: 1, lake: 1, river: 1 };
    const inkFor = (p) => (p.id === sel.id || p.st === 2 ? selCss : WATER_KINDS[p.kind] ? waterCss : inkCss);   // the reader's own places (Phase 3b) take the accent the selection has
    const spriteCache = new Map(); let spriteGen = 0;   // key → sprite; spriteGen bumps on a theme or font change
    function spriteKey(p) { if (!p.glyphs || !p.glyphs.length) return null; const x0 = Math.floor(p.box[0]), y0 = Math.floor(p.box[1]); let g = ""; for (const q of p.glyphs) g += (Math.round((q[0] - x0) * 4) + "," + Math.round((q[1] - y0) * 4) + "," + (q[2] ? Math.round(q[2] * 100) : 0) + "," + (q[3] ? 1 : 0) + ";"); return p.id + "|" + p.style + "|" + p.text + "|" + (p.id === sel.id ? 1 : 0) + (p.st === 2 ? "m" : "") + "|" + dprNow + "|" + spriteGen + "|" + g; }
    function spriteFor(p) { const k = spriteKey(p); if (!k) return null; let sp = spriteCache.get(k); if (sp) { spriteCache.delete(k); spriteCache.set(k, sp); return sp; } sp = renderSprite(p); if (sp) { spriteCache.set(k, sp); if (spriteCache.size > 600) spriteCache.delete(spriteCache.keys().next().value); } return sp; }
    const PEOPLE_HALO = 5.4;   // CSS px of stroke: 2.7 px each side of a glyph, so the stipple (dots 1.35 px in radius) never touches an ink pixel
    function renderSprite(p) {
      if (!p.glyphs || !p.glyphs.length) return null;
      const st = STYLE_BY_ID[p.style]; if (!st) return null;
      const pad = 4, x0 = Math.floor(p.box[0]) - pad, y0 = Math.floor(p.box[1]) - pad;
      const w = Math.ceil(p.box[2]) - x0 + pad, h = Math.ceil(p.box[3]) - y0 + pad;
      const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w * dprNow)); c.height = Math.max(1, Math.ceil(h * dprNow));
      const x = c.getContext("2d");
      x.scale(dprNow, dprNow); x.translate(-x0, -y0);
      x.textBaseline = "middle"; x.textAlign = "left"; x.lineJoin = "round"; x.lineCap = "round";
      x.lineWidth = (p.id === sel.id ? 3.4 : st.id.indexOf("people-") === 0 ? PEOPLE_HALO : 2.6) * LS; x.strokeStyle = haloCss; x.fillStyle = inkFor(p);   // a people's italic is thin and widely tracked, and its own stipple lies under it: a wider halo (2d, task 0b) keeps the dots a pixel clear of every stroke
      const fontBig = fontOf(st, st.size * LS), fontSmall = st.caps ? fontOf(st, st.size * LS * SMALL_SCALE) : fontBig;
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
    function drawMarker(ctx, x, y, r, kind, hot, p) {
      ctx.fillStyle = hot ? selCss : inkCss; ctx.strokeStyle = haloCss; ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (kind === "capital") ctx.rect(x - r, y - r, 2 * r, 2 * r); else ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
    /* ---- THE STUDY LAYER'S MARKS (Phase 3b; stacks removed 2026-10-14) ----
       Every place and every polity the layer flags is ONE mark at its own position, at any zoom: no cluster, no count (the owner's
       decision, docs/atlas-v2-design.md §7 "Stacks removed"). The worker posts the list at each layout (`L.marks`, unit vectors); the
       page projects every mark EVERY FRAME, so a mark is at its true place and sized for the zoom of the moment (AtlasStudy.markHalf: a
       dot about 4 px across at the widest view, 16 px by city scale) whatever a gesture is doing. A mark that would lie past the
       frame's edge or under a control (the chrome the last layout measured: the study panel, the rail, the card …) is not drawn in
       that frame and cannot be tapped. THREE SHAPES AND THEIR COLOURS ARE THE OLD ONES: a diamond for a settlement, a site and any
       other place, a triangle for a mountain, a hill (smaller) or a cape, a disc for a polity; the reader's own filled with the accent,
       the others hollow, a thin ink outline on both so two marks that touch still read as two. DRAW ORDER, back to front: places not
       studied, places studied, polities, and the selected mark last. The marks of one kind in one layer are one path (a fill and a
       stroke for all of them), so a Full Atlas of 1,300 places and 190 polities is a handful of canvas calls a frame. */
    function markInto(path, shape, x, y, h, lw) {
      const q = h - lw / 2;   // the outline is drawn inside the half-extent, so a mark never exceeds its size
      if (shape === "diamond") { path.moveTo(x, y - q); path.lineTo(x + q, y); path.lineTo(x, y + q); path.lineTo(x - q, y); path.lineTo(x, y - q); }
      else if (shape === "triangle") { path.moveTo(x, y - q); path.lineTo(x + q, y + q * 0.85); path.lineTo(x - q, y + q * 0.85); path.lineTo(x, y - q); }
      else { const rr = q * 0.92; path.moveTo(x + rr, y); path.arc(x, y, rr, 0, Math.PI * 2); }
    }
    /* NO closePath: in this Chromium a path built with moveTo / lineTo / closePath per mark cost 5.3 ms per thousand marks against 0.3 ms
       for the same shapes ending in an explicit lineTo to their start (measured, headless, 2026-10-14) — a Full Atlas of a thousand marks
       is the difference between a third of a frame and none of it. The round line cap closes the outline's corner. */
    const markLine = (half) => (half < 3 ? 1 : half < 6 ? 1.5 : 2);
    /* the marks of a layout, indexed for the frame loop: one flat array of unit vectors and the groups (layer, reader's own or not, shape,
       hill or not) each drawn as ONE path — so a frame projects each mark once, allocates nothing, and is a fill and a stroke per group */
    function indexMarks() {
      const marks = L.marks, n = marks.length, groups = new Map(), ax = new Float32Array(3 * n);
      L.markIndex = new Map();
      for (let i = 0; i < n; i++) {
        const m = marks[i]; ax[3 * i] = m.a[0]; ax[3 * i + 1] = m.a[1]; ax[3 * i + 2] = m.a[2]; L.markIndex.set(m.id, i);
        const key = m.layer * 64 + (m.st === 2 ? 32 : 0) + (m.shape === "diamond" ? 0 : m.shape === "triangle" ? 8 : 16) + (m.kind === "hill" ? 4 : 0);
        let g = groups.get(key); if (!g) groups.set(key, g = { key, mine: m.st === 2, shape: m.shape, scale: m.kind === "hill" ? 0.75 : 1, layer: m.layer, idx: [] });
        g.idx.push(i);
      }
      L.markGroups = [...groups.values()].sort((p, q) => p.key - q.key);
      L.mA = ax;
      if (!L.lx || L.lx.length < n) { L.lx = new Float32Array(n + 64); L.ly = new Float32Array(n + 64); L.lh = new Float32Array(n + 64); L.li = new Int32Array(n + 64); }
      L.ln = 0;
    }
    function drawMarks(ctx) {
      const t0 = performance.now(), marks = L.marks, A = root.AtlasStudy;
      L.ln = 0;
      if (!marks.length || !A || !L.mA) { L.lastMarkMs = 0; return; }
      const rot = view.rot, r = view.radius, cx = view.cx, cy = view.cy, ch = L.chrome || [], nch = ch.length;
      const r0 = rot[0], r1 = rot[1], r2 = rot[2], r3 = rot[3], r4 = rot[4], r5 = rot[5], r6 = rot[6], r7 = rot[7], r8 = rot[8];
      const half = A.markHalf(view.kmpp) * LS, lw = markLine(half), ax = L.mA, lx = L.lx, ly = L.ly, lh = L.lh, li = L.li, W = cssW, H = cssH;
      const selI = sel.id != null && L.markIndex.has(sel.id) ? L.markIndex.get(sel.id) : -1, aliveEnt = time.aliveEnt;
      let ln = 0, selK = -1;
      const faint = [];
      ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.lineWidth = lw; ctx.strokeStyle = inkCss; ctx.globalAlpha = 1;
      for (const g of L.markGroups) {
        const h = half * g.scale, e = h + 1, q = h - lw / 2, idx = g.idx, shape = g.shape, polity = g.layer === 2;
        ctx.beginPath();
        for (let k = 0; k < idx.length; k++) {
          const i = idx[k], j = 3 * i, a0 = ax[j], a1 = ax[j + 1], a2 = ax[j + 2];
          const z = r6 * a0 + r7 * a1 + r8 * a2;
          if (z < 0.005) continue;
          const x = cx + (r0 * a0 + r1 * a1 + r2 * a2) * r, y = cy - (r3 * a0 + r4 * a1 + r5 * a2) * r;
          if (x - e < 0 || y - e < 0 || x + e > W || y + e > H) continue;
          let hidden = false;
          for (let c = 0; c < nch; c++) { const cr = ch[c]; if (x - e < cr[2] && x + e > cr[0] && y - e < cr[3] && y + e > cr[1]) { hidden = true; break; } }
          if (hidden) continue;
          if (polity && aliveEnt && !aliveEnt.has(marks[i].id)) continue;   // a polity no longer alive (the layout is held while the pin is dragged)
          lx[ln] = x; ly[ln] = y; lh[ln] = h; li[ln] = i; ln++;
          if (i === selI) { selK = ln - 1; continue; }
          if (z < 0.2) { faint.push(ln - 1); continue; }   // near the limb: faded, drawn singly below
          if (shape === "diamond") { ctx.moveTo(x, y - q); ctx.lineTo(x + q, y); ctx.lineTo(x, y + q); ctx.lineTo(x - q, y); ctx.lineTo(x, y - q); }
          else if (shape === "triangle") { ctx.moveTo(x, y - q); ctx.lineTo(x + q, y + q * 0.85); ctx.lineTo(x - q, y + q * 0.85); ctx.lineTo(x, y - q); }
          else { const rr = q * 0.92; ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, 6.283185307179586); }
        }
        ctx.fillStyle = g.mine ? accentCss : haloCss; ctx.fill(); ctx.stroke();
      }
      L.ln = ln;
      if (faint.length) {
        for (const k of faint) {
          const m = marks[li[k]], path = new Path2D();
          markInto(path, m.shape, lx[k], ly[k], lh[k], lw);
          const z = rot[6] * m.a[0] + rot[7] * m.a[1] + rot[8] * m.a[2];
          ctx.globalAlpha = Math.max(0.05, Math.min(1, z / 0.2)); ctx.fillStyle = m.st === 2 ? accentCss : haloCss; ctx.fill(path); ctx.stroke(path);
        }
        ctx.globalAlpha = 1;
      }
      if (selK >= 0) {
        const m = marks[li[selK]], path = new Path2D();
        markInto(path, m.shape, lx[selK], ly[selK], lh[selK] + 1, 2);
        ctx.lineWidth = 2; ctx.strokeStyle = selCss; ctx.fillStyle = m.st === 2 ? accentCss : haloCss; ctx.fill(path); ctx.stroke(path);
      }
      if (focusId && L.markIndex.has(focusId)) {
        const fi = L.markIndex.get(focusId);
        for (let k = 0; k < ln; k++) if (li[k] === fi) { ctx.strokeStyle = "#45549c"; ctx.lineWidth = 2; ctx.strokeRect(lx[k] - lh[k] - 3, ly[k] - lh[k] - 3, 2 * lh[k] + 6, 2 * lh[k] + 6); break; }
      }
      L.lastMarkMs = performance.now() - t0; stats.markDraw.push(L.lastMarkMs); if (stats.markDraw.length > 600) stats.markDraw.shift();
    }
    /* the live marks (the last frame's) as entries, for the tap and the tests: only those within `radius` of (x, y) when given */
    function liveEntries(x, y, radius) {
      const out = [], n = L.ln || 0, r2 = radius * radius, all = x == null;
      for (let k = 0; k < n; k++) { if (!all) { const dx = L.lx[k] - x, dy = L.ly[k] - y; if (dx * dx + dy * dy > r2) continue; } out.push({ m: L.marks[L.li[k]], x: L.lx[k], y: L.ly[k], h: L.lh[k] }); }
      return out;
    }
    /* ---- THE FAN (Phase 3b, stacks removed) ----
       A tap picks the NEAREST mark within a finger (22 px on a phone, 12 with a mouse). Where more than one lies within it — or several
       share one exact point — they fan out round the tap point: each at its true position joined to a copy of itself on a circle, with its
       name, and the next tap picks one. A tap on empty ground, or Escape, closes the fan; so does any move of the view (the marks'
       true positions would no longer be under the lines). No count and no cycling chip: the reader chooses from what is drawn. */
    const FAN_MAX = 14;
    let fan = null;
    function markRadius(touch) { return touch || PHONE ? 22 : 12; }
    function marksNear(x, y, radius) {
      const A = root.AtlasStudy; if (!A || !L.ln) return [];
      const near = liveEntries(x, y, radius);
      return near.length < 2 ? near : A.nearMarks(near, x, y, radius).map((i) => near[i]);
    }
    function fanSig() { return view.lon.toFixed(5) + "," + view.lat.toFixed(5) + "," + view.zoom.toFixed(5) + "," + cssW + "x" + cssH; }
    function closeFan(silent) { if (!fan) return false; fan = null; if (!silent) invalidateLabels(); return true; }
    function openFan(x, y, near) {
      const A = root.AtlasStudy, ctx = lctx, st = STYLE_BY_ID.town || STYLE_BY_ID.city;
      ctx.font = fontOf(st, 12 * LS);
      const mem = near.slice(0, FAN_MAX).map((e) => { const row = G.byId.get(e.m.id); const name = row ? row.name : e.m.id; return { e, name, x: e.x, y: e.y, w: ctx.measureText(name).width }; });
      const f = A.fanOut(mem, { x, y }, { W: cssW, H: cssH, chrome: L.chrome || [], max: FAN_MAX, half: 9 * LS });
      fan = { x, y, sig: fanSig(), mem, slots: f.slots.map((sl) => Object.assign({}, sl, { mem: mem[sl.i] })), clear: f.clear };
      sel.stack = []; sel.at = null; stackBtn.hidden = true;
      announce("Choose one: " + mem.map((m) => m.name).join(", "));
      invalidateLabels();
    }
    function drawFan(ctx) {
      if (!fan) return;
      if (fan.sig !== fanSig()) { fan = null; return; }
      const st = STYLE_BY_ID.town || STYLE_BY_ID.city;
      ctx.globalAlpha = 1; ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(fan.x, fan.y, 3, 0, Math.PI * 2); ctx.fillStyle = inkCss; ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1;
      for (const sl of fan.slots) {
        const m = sl.mem;
        ctx.strokeStyle = haloCss; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(sl.x, sl.y); ctx.stroke();
        ctx.strokeStyle = inkCss; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(sl.x, sl.y); ctx.stroke();
      }
      for (const sl of fan.slots) {
        const m = sl.mem, mk = m.e.m, path = new Path2D(), hot = mk.id === sel.id;
        markInto(path, mk.shape, sl.x, sl.y, 8 * LS, 2);
        ctx.lineWidth = 2; ctx.strokeStyle = hot ? selCss : inkCss; ctx.fillStyle = mk.st === 2 ? accentCss : haloCss; ctx.fill(path); ctx.stroke(path);
        ctx.font = fontOf(st, 12 * LS); ctx.textBaseline = "middle"; ctx.textAlign = sl.right ? "left" : "right";
        const tx = sl.right ? sl.x + 13 * LS : sl.x - 13 * LS;
        ctx.lineWidth = 3; ctx.strokeStyle = haloCss; ctx.strokeText(m.name, tx, sl.y); ctx.fillStyle = inkCss; ctx.fillText(m.name, tx, sl.y);
      }
      ctx.textAlign = "left";
    }
    function pickMark(m) {
      const row = G.byId.get(m.id);
      closeFan(true);
      sel.stack = []; sel.index = 0; sel.at = null; stackBtn.hidden = true;
      if (row) selectRow(row, { open: true, push: true });
    }
    // a tap while the fan is open: one of its copies or names picks that mark; anywhere else closes the fan, and a tap that lands on
    // empty ground does nothing more (a tap on another mark or a name goes on to be picked as usual). Returns true when the tap is spent.
    function pickFan(x, y, touch) {
      const f = fan; closeFan(true);
      let best = null, bd = Infinity;
      for (const sl of f.slots) {
        const r = sl.rect, inRect = x >= r[0] - 3 && x <= r[2] + 3 && y >= r[1] - 3 && y <= r[3] + 3;
        const d = Math.hypot(sl.x - x, sl.y - y);
        if ((inRect || d <= (touch || PHONE ? 22 : 14)) && d < bd) { bd = d; best = sl; }
      }
      if (best) { pickMark(best.mem.e.m); return true; }
      invalidateLabels();
      return !marksNear(x, y, markRadius(touch)).length && !hitAt(x, y).length;
    }

    /* every frame: each placed label at its anchor's CURRENT position (a translation — the layout is only
       recomputed on settle), skipped behind the horizon, faded near the limb; the live hit rects are kept */
    /* A LABEL IS ALWAYS WHOLE AND CLEAR OF THE CONTROLS (Phase 4c; the owner's phone showed "ille" for Lille, "Strasbour", and Essen under the "?"
       button). The layout puts every label inside the frame and off every control — but only when the view settles; during a drag, a
       wheel or a pinch each label is drawn at its layout position plus the pan since, so it slid out under the frame's edge and under
       the chrome until the next layout landed. The rule the layout applies is applied again here, to the label's rectangles at their
       CURRENT place: one that no longer fits wholly inside the frame, or touches a control (the rectangles of the last layout), is not
       drawn this frame and cannot be tapped — dropped, never clipped or covered; the next layout brings the right ones back. */
    function labelFits(p, dx, dy) {
      const rs = p.rects; if (!rs) return true;
      const ch = L.chrome || [];
      for (let i = 0; i < rs.length; i++) {
        const q = rs[i], x0 = q[0] + dx, y0 = q[1] + dy, x1 = q[2] + dx, y1 = q[3] + dy;
        if (x0 < 0 || y0 < 0 || x1 > cssW || y1 > cssH) return false;
        for (let j = 0; j < ch.length; j++) { const c = ch[j]; if (x0 < c[2] && x1 > c[0] && y0 < c[3] && y1 > c[1]) return false; }
      }
      return true;
    }
    function drawLabels() {
      const t = performance.now();
      const ctx = lctx;
      ctx.setTransform(dprNow, 0, 0, dprNow, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      const rot = view.rot, r = view.radius, cx = view.cx, cy = view.cy;
      const live = [];
      const muteOthers = ST.mode === "personal" && ST.flags.size > 0;
      drawMarks(ctx);   // the study layer's marks, under the names
      for (const p of L.placed) {
        const a = p.a; if (!a) continue;
        if (p.hist && time.aliveEnt && p.id.charCodeAt(0) === 112 && p.id.startsWith("pol:") && !time.aliveEnt.has(p.id)) continue;   // a polity no longer alive (the layout is held while the pin is dragged)
        const z = rot[6] * a[0] + rot[7] * a[1] + rot[8] * a[2];
        if (z < 0.005) continue;
        const sx = cx + (rot[0] * a[0] + rot[1] * a[1] + rot[2] * a[2]) * r, sy = cy - (rot[3] * a[0] + rot[4] * a[1] + rot[5] * a[2]) * r;
        const dx = sx - p.sx, dy = sy - p.sy;
        if ((dx || dy) && !labelFits(p, dx, dy)) continue;
        ctx.globalAlpha = Math.min(1, z / 0.2) * (muteOthers && !p.st ? 0.4 : 1);   // the Personal Atlas mutes everything that is not the reader's (Phase 3b)
        if (p.marker) drawMarker(ctx, p.marker[0] + dx, p.marker[1] + dy, p.marker[2], p.marker[3], p.id === sel.id, p);
        if (p.sprite) ctx.drawImage(p.sprite.c, p.sprite.x0 + dx, p.sprite.y0 + dy, p.sprite.w, p.sprite.h);
        const hit = [p.hit[0] + dx, p.hit[1] + dy, p.hit[2] + dx, p.hit[3] + dy];
        if (p.id === focusId) { ctx.strokeStyle = "#45549c"; ctx.lineWidth = 2; ctx.strokeRect(hit[0] - 3, hit[1] - 3, hit[2] - hit[0] + 6, hit[3] - hit[1] + 6); }
        live.push({ p, dx, dy, hit });
      }
      ctx.globalAlpha = 1;
      drawFan(ctx);
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
        /* Phase 2c — the PRESENCES under the point, topmost first (the ID pass returns the topmost face; the presence pass is asked again with the
           faces already found skipped, so two peoples that overlap are both named), and then the states: the stack the card's chip lists is
           every entity under the point in the year — "Scythians · people", "Bosporan Kingdom · state" */
        const hasP = !!(time.hist && time.pOnScreen && time.pOnScreen.length);
        if (hasP) {
          const skip = new Set();
          for (let n = 0; n < 6; n++) { const p = R.pick(view, x, y, "land", { layer: "presence", skip }); if (!p || p.histFace == null) break; skip.add(p.histFace); const pe = time.ents[time.faceEntity[p.histFace]]; if (pe) add(G.byId.get(pe.id)); }
        }
        const f = R.pick(view, x, y, "land", hasP ? { layer: "states" } : undefined);
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
    function pickAt(x, y, touch) {
      if (!stats.ready && !R.levelLoaded(0)) return;
      if (fan && pickFan(x, y, touch)) return;
      // the nearest mark within a finger; several within it fan out round the tap (no count, no chip), one picks at once
      const near = marksNear(x, y, markRadius(touch));
      if (near.length === 1) { pickMark(near[0].m); return; }
      if (near.length > 1) { openFan(x, y, near); return; }
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
      const word = (row) => { const a = AS2(); const k = row.kind; const w = a ? a.kindWord(k) : k === "polity" ? "state" : k; return (KIND_LABEL[k] ? (a ? w : w) : w).toLowerCase(); };
      const cur = sel.stack[sel.index], anyPres = sel.stack.some((r) => r.kind === "people" || r.kind === "culture" || r.kind === "extent");
      // "Scythians · people": a name and what it is; with a people in the stack the chip lists every entity under the point (2c)
      stackBtn.textContent = `${n} here · ${sel.index + 1}/${n} ${cur.name}` + (anyPres ? " · " + word(cur) : "");
      if (anyPres) { const all = document.createElement("span"); all.className = "atlas2-stack-all"; all.textContent = " " + sel.stack.map((r) => r.name + " · " + word(r)).join(" / "); stackBtn.appendChild(all); }
      stackBtn.setAttribute("aria-label", `${n} places here: ${sel.stack.map((r) => r.name + ", " + word(r)).join("; ")}. Showing ${cur.name}; activate to see the next`);
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
      closeFan(true);   // a selection from anywhere (a tap, the search, the keys, Back) ends the fan
      sel.id = row.id;
      const face = (row.kind === "country" || row.kind === "admin1") && time.present ? faceOfId(row.id) : null;
      R.select(face);
      time.selected = row.hist && row.ent != null ? row.ent : -1; if (time.hist) { uploadStyle(); if (time.view) time.view.pfaces = presenceDraw(time.fade ? time.fade.fromP : null, time.fade ? Math.min(1, (performance.now() - time.fade.t0) / FADE_MS) : 1); }
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
    /* the glossary popup's "show on the Atlas" (Phase 3c): open a place by its registry id and fly there. The row may not be in
       `G` yet (a places.js row joins it when the study layer has loaded), so it waits like a deep link's place does — but flies */
    function showPlace(id) {
      if (!id || typeof id !== "string") return false;
      pendingFly = true;
      if (G.ready && stats.ready && G.byId.has(id) && selectById(id, { open: true, fly: true, push: true })) { pendingPlace = null; return true; }
      pendingPlace = id; return false;
    }
    function clearSelection() {
      const had = sel.id;
      sel.id = null; sel.stack = []; sel.index = 0; sel.at = null;
      R.select(null); caption.textContent = ""; stackBtn.hidden = true;
      if (time.selected >= 0) { time.selected = -1; if (time.hist) { uploadStyle(); if (time.view) time.view.pfaces = presenceDraw(time.fade ? time.fade.fromP : null, time.fade ? Math.min(1, (performance.now() - time.fade.t0) / FADE_MS) : 1); } }
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
      const mk = marksNear(x, y, 8)[0];
      if (mk) { const row = G.byId.get(mk.m.id); caption.textContent = row ? row.name : ""; canvas.style.cursor = "pointer"; return; }
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
      appendStudyCards(row);   // the cards about this place (Phase 3b); the country's prose arrives later and appends again
      discoveryChip(row);
      el.classList.add("atlas2-has-card");
      // focus moves to the heading when the card OPENS (not when a second place replaces the first); the opener is
      // remembered unless focus was already inside the card
      if (!wasOpen) { const a = document.activeElement; cardOpener = a && el.contains(a) && !cardEl.contains(a) ? a : canvas; cardTitle.focus({ preventScroll: true }); }
    }
    /* "NEW DISCOVERY" (Phase 3c): a place the reader has studied and has not opened on the Atlas before. Read from the existing registers —
       the studied set (a card with a record) and `placesSeen`, the register v1's panels already write — and written the way v1 writes it
       (`discover` is the host's markSeen): no new field, the blob's shape and the sync untouched. Only a place the reader studied is marked;
       a re-render of the same card keeps the chip, closing and opening it again does not. */
    let discId = null, discFresh = false;
    function discoveryChip(row) {
      for (const old of cardEl.querySelectorAll(".atlas2-disc")) old.remove();
      if (row.id !== discId) {
        discId = row.id; discFresh = false;
        try { if (AS && SU && SU.seenPlace && SU.discover && ST.st && AS.isNewDiscovery(ST.st, row.id, row.name, SU.seenPlace)) { discFresh = true; SU.discover(row.name); } } catch (e) { discFresh = false; }
      }
      if (!discFresh) return;
      const chip = document.createElement("span"); chip.className = "disc-chip atlas2-disc"; chip.title = "A place from your cards, opened on the Atlas for the first time"; chip.innerHTML = "<b>New discovery!</b>";
      cardKind.insertAdjacentElement("afterend", chip);
    }
    function closeCard(returnFocus) {
      const had = cardOpen;
      discId = null; discFresh = false;
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
      const pres = e.kind === "people" || e.kind === "culture";   // 2c: a presence, not a territory
      const ext = e.kind === "extent";   // 2d: an authored war extent — Folio's own approximation of a side no dataset draws
      const src = (time.hist.header.sources || []).find((s) => s.id === ((pres || ext) && e.src ? e.src : "cliopatria"));
      const srcName = ext ? "Folio’s own authored extent" : !src ? "Cliopatria" : src.id === "cliopatria" ? "Cliopatria " + src.version : src.id === "hosner-2016" ? "Hosner et al. (2016)" : src.id === "osm-land-polygons" ? "the OpenStreetMap land polygons" : src.name;
      const licName = !src ? "CC BY 4.0" : src.licence === "CC-BY-4.0" ? "CC BY 4.0" : src.licence === "CC-BY-3.0" ? "CC BY 3.0" : src.licence === "ODbL-1.0" ? "ODbL" : src.licence;
      const nameOf = (p) => { const r = G.byId.get(p); return r ? r.name : p; };
      cardKind.textContent = e.kind === "front" ? "Front · Second World War" : (e.kind === "contested" ? "Contested between " + e.partners.map(nameOf).join(" and ") : e.kind === "nested" ? "Within " + nameOf(e.partners[1]) : e.kind === "people" ? "People" : e.kind === "culture" ? "Culture" : ext ? "Authored extent" : "Polity") + (e.span ? " · " + fmtYear(e.span[0]) + " – " + fmtYear(e.span[1]) : "");
      if (e.kind === "front") { cardBody.innerHTML = frontCardHtml(e); return; }
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
      html += ext ? `<p class="atlas2-card-uncert">Authored extent: ${escText(e.note || "Folio’s own approximation, drawn from no dataset.")}</p>` : `<p class="atlas2-card-uncert">Approximate: ${escText(srcName)}, ${escText(licName)}. A border here is one reading of incomplete evidence, drawn at the source's own precision.</p>`;
      html += warsBlock(e.id);
      if (pres) {
        // a presence is not a border: said plainly, with the audit's note on where this one is uncertain
        html += `<p class="atlas2-card-presence">${e.kind === "people" ? "A people" : "A culture"} is a presence, not a border: the soft, dotted shape is where the source places ${e.kind === "people" ? "them" : "it"} in these years, with no line round it, drawn over any state that held the land.</p>`;
        if (e.note) html += `<p class="atlas2-card-extent">${escText(e.note)}</p>`;
      }
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
      html += ext ? `<p class="atlas2-card-scope">An authored extent is drawn only in the years of the war that uses it, and only for a side that no source draws; it is not a state or a people.</p>` : pres ? `<p class="atlas2-card-scope">The past here shows the peoples and cultures Folio’s cards teach, not every people of the period.</p>` : `<p class="atlas2-card-scope">The past here shows the states Folio’s cards teach, not every state of the period.</p>`;
      if (e.wiki) html += `<p class="atlas2-card-link"><a href="${wikiUrl(e.wiki)}" target="_blank" rel="noopener">Wikipedia: ${escText(e.wiki)}</a></p>`;
      if (e.alsoWiki && e.alsoWiki.length) html += `<p class="atlas2-card-link atlas2-card-also">Also in the source: ${e.alsoWiki.filter((w) => w.wiki).map((w) => `<a href="${wikiUrl(w.wiki)}" target="_blank" rel="noopener">${escText(w.wiki)}</a>`).join(", ")}</p>`;
      cardBody.innerHTML = html;
    }
    /* 2d — the wars an entity fought in, said on its card: who was on which side, the years, which sides are authored extents, and a button that shows the war
       (a war that groups others is drawn only this way). The sentence is study.js's, so the card, the tests and a screen reader read the same words. */
    function warsBlock(entityId) {
      const A = AS2(); if (!A || !time.wars) return "";
      const list = A.warsOfEntity(time.wars, entityId); if (!list.length) return "";
      let html = '<div class="atlas2-card-wars"><h3 class="atlas2-card-wars-h">Wars</h3>';
      for (const w of list) {
        const lead = w.role === "victor" ? "On the winning side" : "On the losing side";
        const on = time.warFocus === w.id;
        html += `<p class="atlas2-card-war"><b>${escText(w.term)}</b> · ${escText(A.fmtSpan(w.y[0], w.y[1]))} · ${lead}${w.authored ? ", as an authored extent" : ""}.<br><span class="atlas2-card-dim">${escText(A.warSentence(time.wars[w.id]))}</span><br><button type="button" class="atlas2-link atlas2-war-go" data-war="${on ? "" : escText(w.id)}">${on ? "Stop showing this war" : "Show this war"}${w.group ? " (it groups other wars, so it is drawn only when chosen)" : ""}</button></p>`;
      }
      return html + "</div>";
    }
    /* choose a war to draw whatever the switch and the study mode say (the only way a war that groups others is drawn), or null to let go. The year goes to the war's
       first year when it is outside its years, and the view to where its sides lie (the union of the faces of its members in those years). */
    function focusWar(id) {
      if (id && !(time.wars && time.wars[id])) return false;
      time.warFocus = id || null; computeWarShown();
      if (id) {
        const w = time.wars[id];
        if (time.year < w.y[0] || time.year > w.y[1]) setYear(w.y[0]);
        else refreshWars();
        frameWar(id);
      } else refreshWars();
      if (cardRow && cardOpen && cardRow.hist) openCard(cardRow);
      return true;
    }
    function warFrame(id, short, share) {   // the view that fits both sides of a war: { lon, lat, kmpp }; `short` is the short side of the box it is for (Phase 4: a card window asks for its own)
      const w = time.wars && time.wars[id]; if (!w || !time.faceCap) return null;
      const vecs = [];
      for (const k of ["v", "l"]) { const ids = w[k].m.map((m) => m[0]).concat(w[k].x ? [w[k].x] : []); for (const eid of ids) { const ei = entityIndexOfId(eid); if (ei < 0) continue; const l = time.stepsOf.get(ei) || []; const st = l.find((s) => s[1] >= w.y[0] && s[0] <= w.y[1]); if (!st) continue; const fi = st[2]; vecs.push([time.faceCap[4 * fi], time.faceCap[4 * fi + 1], time.faceCap[4 * fi + 2], time.faceCap[4 * fi + 3]]); } }
      if (!vecs.length) return null;
      let mx = 0, my = 0, mz = 0; for (const v of vecs) { mx += v[0]; my += v[1]; mz += v[2]; } const len = Math.hypot(mx, my, mz) || 1; const c = [mx / len, my / len, mz / len];
      let ang = 0; for (const v of vecs) ang = Math.max(ang, Math.acos(Math.max(-1, Math.min(1, v[0] * c[0] + v[1] * c[1] + v[2] * c[2]))) + v[3] * (share == null ? 1 : share));
      const km = Math.max(3, Math.min(R_KM / base, ang * R_KM * 1.35 / (Math.max(120, short || Math.min(cssW, cssH)) / 2)));
      return { lon: Math.atan2(c[1], c[0]) * R2D, lat: Math.asin(Math.max(-1, Math.min(1, c[2]))) * R2D, kmpp: km };
    }
    /* Phase 4b: the two principal sides of a war for a card window's own labels and legend — { v, l }, each { n (the card's name for the side), lon, lat (the mean direction of its faces in the war's years, weighted by their size), members (the states tinted), extent (no state, only an authored extent: drawn as a wash, not as a border), faces, pface (the face of the side's principal entity in `year`, -1 when none), pcap ([lon, lat] of that entity's capital in `year`, or null) } or null when the side has no face in those years */
    function warSidesOf(id, year) {
      const w = time.wars && time.wars[id]; if (!w || !time.faceCap) return null;
      const out = {};
      for (const k of ["v", "l"]) {
        const sd = w[k]; let mx = 0, my = 0, mz = 0, wt = 0, members = 0; const faces = [];
        // `faces`: the face each of the side's entities HAS IN `year` (a window's display year; with no year, the first step in the war's years) — what the window's labels are placed on (faceAnchors); an entity with no step in that year (a gap in the source: England and Normandy in 1076) has none, drawn or named
        // (the centroid below still counts the first step in the war's years, as the window's frame always has)
        const add = (eid) => { const ei = entityIndexOfId(eid); if (ei < 0) return false; const l = time.stepsOf.get(ei) || []; const atYear = year != null && l.find((q) => q[0] <= year && q[1] >= year), st = atYear || l.find((q) => q[1] >= w.y[0] && q[0] <= w.y[1]); if (!st) return false; const fi = st[2], r = time.faceCap[4 * fi + 3], a = r * r + 1e-6; mx += time.faceCap[4 * fi] * a; my += time.faceCap[4 * fi + 1] * a; mz += time.faceCap[4 * fi + 2] * a; wt += a; if ((atYear || year == null) && faces.indexOf(fi) < 0) faces.push(fi); return true; };
        for (const m of sd.m) if (add(m[0])) members++;
        const extent = !members && !!sd.x && add(sd.x);
        if (!wt) { out[k] = null; continue; }
        const len = Math.hypot(mx, my, mz) || 1;
        /* `pface`: the face the side's PRINCIPAL entity (`sd.p`, the entity its name stands for: wars.js, build-wars.js) HAS IN `year`, or -1 when it has none there (or the side has no principal) — the face the window puts the side's name on */
        let pface = -1;
        if (sd.p) { const ei = entityIndexOfId(sd.p); if (ei >= 0) { const l = time.stepsOf.get(ei) || [], atYear = year != null && l.find((q) => q[0] <= year && q[1] >= year), st = atYear || l.find((q) => q[1] >= w.y[0] && q[0] <= w.y[1]); if (st && (atYear || year == null)) pface = st[2]; } }
        /* `pcap`: the principal's own capital in that year (Wikidata's P36 as the history header carries it: `cities`) — where the principal's HOME is, the piece of its face the name stands on */
        const cyr = year != null ? year : Math.round((w.y[0] + w.y[1]) / 2), cap = sd.p && time.hist && time.hist.header ? (time.hist.header.cities || []).find((c) => c.entity === sd.p && c.from <= cyr && c.to >= cyr) : null;
        out[k] = { n: sd.n, lon: Math.atan2(my, mx) * R2D, lat: Math.asin(Math.max(-1, Math.min(1, mz / len))) * R2D, members, extent, hasExtent: !!sd.x, faces, pface, pcap: cap ? [cap.lon, cap.lat] : null };
      }
      return out;
    }
    /* PHASE 4 PHONE FIXES: a point inside each of the given history faces, on the visible part of the CURRENT view, from the worker (`face-anchors`; the label path's own anchor). The reply is `cb(rows, view)` with the view the
       question was asked in (rot, radius, cx, cy, W, H), because the anchors are screen points of THAT view and the window turns them into points on the sphere to carry them through the next gesture. */
    let faceAnchorSeq = 0; const faceAnchorWait = new Map();
    function faceAnchors(faces, cb, near) {   // `near`: [{ face, lon, lat }] — for a face, the point (its principal's capital) whose nearest piece the anchor is searched in
      if (!faces || !faces.length || disposed) { cb([], null); return; }
      rotation(); const q = { rot: Array.from(view.rot), radius: view.radius, cx: view.cx, cy: view.cy, W: cssW, H: cssH, level: Math.min(2, view.level) }, seq = ++faceAnchorSeq;
      faceAnchorWait.set(seq, { cb, q }); postToWorker(Object.assign({ type: "face-anchors", seq, faces, near: near || [] }, q));
    }
    let pendingWar = null;
    function tryPendingWar() { if (pendingWar && time.wars && time.wars[pendingWar]) { const id = pendingWar; pendingWar = null; time.warFocus = id; computeWarShown(); refreshWars(); } }   // a deep link's war: focused where it is, without the jump to the war's first year that the card's button makes
    function frameWar(id) { const f = warFrame(id); if (f) setView(f.lon, f.lat, f.kmpp); }
    function paintWarsKey() {
      const k = sheet.querySelector(".atlas2-wars-key"); if (!k) return;
      const css = (c, a) => "rgba(" + c.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255)).join(",") + "," + a + ")";
      const v = k.querySelector(".atlas2-wars-sw-victor"), l = k.querySelector(".atlas2-wars-sw-loser"), x = k.querySelector(".atlas2-wars-sw-extent");
      if (v) v.style.background = css(warRGB.victor, 0.7);
      if (l) l.style.background = css(warRGB.loser, 0.7);
      const ax = k.parentNode.querySelector(".atlas2-wars-sw-axis"), al = k.parentNode.querySelector(".atlas2-wars-sw-allied");
      if (ax) ax.style.background = "linear-gradient(90deg, " + css(warRGB.loser, 0.7) + " 0 50%, " + css(warRGB.loser, 0.35) + " 50% 100%)";
      if (al) al.style.background = "linear-gradient(90deg, " + css(warRGB.victor, 0.7) + " 0 50%, " + css(warRGB.victor, 0.35) + " 50% 100%)";
      if (x) x.style.background = "radial-gradient(circle at 50% 50%, " + css(warRGB.loser, 0.7) + " 0%, " + css(warRGB.loser, 0.2) + " 62%, transparent 100%)";
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
      appendStudyCards(row);
    }
    cardBody.addEventListener("click", (e) => { const wb = e.target.closest("button[data-war]"); if (wb) { focusWar(wb.getAttribute("data-war") || null); return; } const fb = e.target.closest("button[data-front]"); if (fb) { const n = Number(fb.getAttribute("data-front")); time.frontDate = n; const y = Math.floor(n / 10000); if (y !== time.year) setYear(y, { keepFront: true }); else applyYear(y, { force: true, why: "fronts" }); if (cardRow && cardOpen) openCard(cardRow); return; } const st = e.target.closest("button[data-year]"); if (st) { setYear(Number(st.getAttribute("data-year"))); if (cardRow) openCard(cardRow); return; } const b = e.target.closest("button[data-select]"); if (!b) return; const row = G.byId.get(b.getAttribute("data-select")); if (row) { if (row.hist) selectRow(row, { open: true, push: true }); else flyToRow(row, true); } });

    /* ---- search: one input, diacritic-folded prefix then substring over names and aliases ---- */
    /* Phase 3c — the search covers the WHOLE registry whatever year the rail shows: the gazetteer and places.js rows (G), the
       polities of every age and their period capitals (atlas/data/polity-index.js, 20 KB, fetched at the first keystroke — the 4.7 MB
       history file is not), and it matches the KIND too ("rivers", "hill", "battle": the places of that kind the reader's cards are
       about first). A polity that is not on the map in the rail's year says so and offers the nearest year it is — from its own
       step data, never a guess (`yearsNote`). */
    let results = [], active = -1;
    const KIND_ORDER = { country: 0, capital: 1, polity: 1, people: 1, culture: 1, ocean: 1, sea: 2, admin1: 2, city: 3, region: 3, range: 3, island: 4, "island-group": 4, lake: 4, gulf: 4, strait: 4, town: 5, river: 5, site: 5, mountain: 5, hill: 6, cape: 6 };
    const PX = { state: 0, rows: [], caps: [], ranges: new Map() };   // state 0 not asked, 1 loading, 2 in, 3 failed
    function loadPolityIndex() {
      if (PX.state) return; PX.state = 1;
      loadScript(opts.polityIndexUrl || "atlas/data/polity-index.js").then(() => {
        if (disposed) return;
        const X = root.ATLAS_POLITY_INDEX; if (!X || !Array.isArray(X.polities)) { PX.state = 3; return; }
        const taken = new Set(G.rows.map((r) => r.key));
        PX.rows = X.polities.map((r) => { PX.ranges.set(r[0], r[5]); return { id: r[0], name: r[1], kind: r[7] || "polity", hist: true, indexed: true, span: [r[3], r[4]], ranges: r[5], qid: r[6] || null, key: fold(r[1]), akeys: (r[2] || []).map(fold), rank: 0, len: 0, aliases: r[2] || [], at: null }; });
        const byEnt = new Map(PX.rows.map((r) => [r.id, r]));
        for (const c of X.capitals || []) {
          const owner = byEnt.get(c[0]); if (!owner) continue;
          if (!owner.at) owner.at = [c[2], c[3]];   // before the borders arrive a polity is found at its first capital
          const key = fold(c[1]); if (taken.has(key)) continue;   // a name the gazetteer already carries (Athens, Rome) is that place, not a second one
          PX.caps.push({ id: "cap:" + c[0] + ":" + c[1], name: c[1], kind: "capital", hist: true, indexed: true, span: [c[4], c[5]], ranges: [[c[4], c[5]]], key, akeys: [], rank: 0, len: 0, aliases: [], at: [c[2], c[3]], within: c[0] });
          taken.add(key);
        }
        PX.state = 2;
        if (searchIn.value.trim().length >= 2 && document.activeElement === searchIn) runSearch(searchIn.value);
      }).catch(() => { PX.state = 3; });
    }
    // the kinds a query may name: the label and its plural, the registry word and its plural, and a finer kind (battle, cave, building)
    const KIND_WORDS = (() => { const m = new Map(); const add = (w, k) => { w = fold(w); if (w && !m.has(w)) m.set(w, k); }; for (const [k, label] of Object.entries(KIND_LABEL)) { const l = label.toLowerCase(); add(l, { kind: k }); add(l + "s", { kind: k }); add(l.replace(/y$/, "ies"), { kind: k }); add(k.replace(/-/g, " "), { kind: k }); add(k.replace(/-/g, " ") + "s", { kind: k }); } for (const sub of ["battle", "cave", "building"]) { add(sub, { sub }); add(sub + "s", { sub }); } add("mountains", { kind: "mountain" }); add("hills", { kind: "hill" }); add("states", { kind: "polity" }); add("empires", { kind: "polity" }); return m; })();
    const kindHit = (r, w) => (w.kind ? r.kind === w.kind : r.sub === w.sub);
    const searchRows = () => (PX.state === 2 ? G.rows.concat(PX.rows, PX.caps) : G.rows);
    function runSearch(q) {
      const k = fold(String(q || "").trim());
      if (k.length < 2 || !G.ready) { closeResults(); return []; }
      loadPolityIndex();
      hideSearchNote();
      const pre = [], sub = [], rows = searchRows();
      for (const r of rows) {
        if (r.key.startsWith(k) || r.akeys.some((a) => a.startsWith(k))) pre.push(r);
        else if (r.key.indexOf(k) >= 0 || r.akeys.some((a) => a.indexOf(k) >= 0)) sub.push(r);
      }
      // the name that IS the query first, then by kind (a country before a town, a sea before a river), then by rank within the kind
      const score = (r) => (r.key === k ? 0 : 100) + (KIND_ORDER[r.kind] == null ? 5 : KIND_ORDER[r.kind]) * 10 + Math.min(9, r.rank);
      const by = (a, b) => score(a) - score(b) || (a.name < b.name ? -1 : 1);
      results = pre.sort(by).concat(sub.sort(by)).slice(0, 10);
      // a query that names a KIND adds the places of that kind after the name matches — the ones the cards are about first
      const w = KIND_WORDS.get(k);
      if (w && results.length < 10) {
        const seen = new Set(results.map((r) => r.id)), nCards = (r) => (ST.idx && ST.idx.cardsOfPlace && (ST.idx.cardsOfPlace.get(r.id) || []).length) || 0;
        const more = rows.filter((r) => !seen.has(r.id) && kindHit(r, w)).sort((a, b) => nCards(b) - nCards(a) || (a.name < b.name ? -1 : 1));
        results = results.concat(more.slice(0, 10 - results.length));
      }
      active = results.length ? 0 : -1;
      resultsUl.innerHTML = results.map((r, i) => { const w2 = r.within ? G.byId.get(r.within) : null; const span = r.indexed && r.span ? fmtYear(r.span[0]) + " – " + fmtYear(r.span[1]) : ""; return `<li role="option" id="atlas2-opt-${i}" data-i="${i}"${i === active ? ' aria-selected="true" class="active"' : ""}><span class="atlas2-res-name">${escText(r.name)}</span><span class="atlas2-chip">${escText(KIND_LABEL[r.kind] || r.kind)}</span>${w2 ? `<span class="atlas2-res-in">${escText(w2.name)}</span>` : r.indexed && r.within ? `<span class="atlas2-res-in">${escText((PX.rows.find((x) => x.id === r.within) || {}).name || "")}</span>` : ""}${span ? `<span class="atlas2-res-yrs">${escText(span)}</span>` : ""}</li>`; }).join("");
      resultsUl.hidden = !results.length;
      if (results.length) onVisual();   // the list's room under the visual viewport (a soft keyboard may be up)
      searchIn.setAttribute("aria-expanded", String(!!results.length));
      if (active >= 0) searchIn.setAttribute("aria-activedescendant", "atlas2-opt-" + active); else searchIn.removeAttribute("aria-activedescendant");
      return results;
    }
    // a polity or period capital that is not on the map in the rail's year: { ranges, go } (study.js, tested in Node), else null
    const yearsNote = (row, y) => (AS && row && row.indexed ? AS.yearsNote(row.ranges, y) : null);
    const noteEl = el.querySelector(".atlas2-search-note");
    function hideSearchNote() { if (noteEl && !noteEl.hidden) { noteEl.hidden = true; requestLayout("chrome"); } }
    function showSearchNote(row, n) {
      const list = n.ranges.slice(0, 3).map((r) => fmtYear(r[0]) + (r[1] !== r[0] ? " – " + fmtYear(r[1]) : "")).join("; ") + (n.ranges.length > 3 ? "; …" : "");
      noteEl.querySelector(".atlas2-sn-t").textContent = row.name + " is not on the map in " + fmtYear(time.year) + ". It is mapped " + list + ".";
      const b = noteEl.querySelector(".atlas2-sn-go"); b.textContent = "Go to " + fmtYear(n.go); b.setAttribute("data-year", String(n.go)); b.setAttribute("data-id", row.id);
      noteEl.hidden = false; requestLayout("chrome");
    }
    function closeResults() { resultsUl.hidden = true; resultsUl.innerHTML = ""; results = []; active = -1; searchIn.setAttribute("aria-expanded", "false"); searchIn.removeAttribute("aria-activedescendant"); }
    function setActive(i) { active = i; resultsUl.querySelectorAll("li").forEach((li, j) => { li.classList.toggle("active", j === i); if (j === i) li.setAttribute("aria-selected", "true"); else li.removeAttribute("aria-selected"); }); if (i >= 0) searchIn.setAttribute("aria-activedescendant", "atlas2-opt-" + i); }
    function chooseResult(i) {
      let row = results[i]; if (!row) return; closeResults(); searchIn.value = row.name;
      const n = yearsNote(row, time.year), full = G.byId.get(row.id);
      if (row.indexed && full && !full.indexed) row = full;   // the borders have loaded: the real row (its anchor is on its own land)
      if (row.indexed) {   // a polity or period capital known only by the index: fly to its capital; its card opens when the borders do
        if (row.at) flyTo(row.at[0], row.at[1], row.kind === "capital" ? 1.5 : 12, null);
        if (!n) { pendingPlace = row.id; pendingFly = false; ensureHistory(); }
      } else flyToRow(row, true);
      if (n) showSearchNote(row, n);
      canvas.focus({ preventScroll: true });
    }
    noteEl.addEventListener("click", (e) => {
      if (e.target.closest(".atlas2-sn-x")) { hideSearchNote(); return; }
      const g = e.target.closest(".atlas2-sn-go"); if (!g) return;
      const y = Number(g.getAttribute("data-year")), id = g.getAttribute("data-id");
      hideSearchNote(); setYear(y); pendingPlace = id; pendingFly = true; ensureHistory();   // the place opens, flown to, when its row exists (the borders of that year are loading)
      const full = G.byId.get(id); if (full && !full.indexed && G.ready && stats.ready && selectById(id, { open: true, fly: true, push: true })) pendingPlace = null;
    });
    searchIn.addEventListener("input", () => runSearch(searchIn.value));
    searchIn.addEventListener("focus", () => { loadPolityIndex(); if (searchIn.value.trim().length >= 2) runSearch(searchIn.value); });
    searchIn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { if (!results.length) runSearch(searchIn.value); if (results.length) { e.preventDefault(); setActive((active + 1) % results.length); } }
      else if (e.key === "ArrowUp") { if (results.length) { e.preventDefault(); setActive((active - 1 + results.length) % results.length); } }
      else if (e.key === "Enter") { if (!results.length) runSearch(searchIn.value); if (results.length) { e.preventDefault(); chooseResult(Math.max(0, active)); } }
    });
    resultsUl.addEventListener("pointerdown", (e) => { const li = e.target.closest("li[data-i]"); if (li) { e.preventDefault(); chooseResult(Number(li.getAttribute("data-i"))); } });
    document.addEventListener("pointerdown", (e) => { if (!resultsUl.hidden && !e.target.closest(".atlas2-search")) closeResults(); }, true);

    /* ---- flying to a place: an eased move, instant under reduced motion ---- */
    const PLACES_KMPP = { region: 8, range: 6, island: 3, "island-group": 8, sea: 10, gulf: 4, strait: 3, lake: 3, river: 6, ocean: 24, city: 1.5, town: 0.8, site: 0.8, mountain: 3, hill: 1.5, cape: 2 };   // a places.js row has a point and no extent: its zoom is by kind (Phase 3b)
    const kmppFor = (row) => {
      if (row.src === "places") return PLACES_KMPP[row.kind] || 2;
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
      clampView(); needs = true; needsGlobe = true;
      if (u >= 1) { flying = null; touched(); gestureEnded(); if (f.done) f.done(); }
    }

    /* ---- deep links: #map/<lon>/<lat>/<zoom>/<place>, written on settle, pushed on a selection ---- */
    const HASH_RE = /^#map\/(-?[\d.]+)\/(-?[\d.]+)\/(-?[\d.]+)(?:\/([^?]*))?(\?.*)?$/;
    const zoomLevel = () => Math.log2(156.543 / kmPerPx());
    function readHash() { const m = HASH_RE.exec(location.hash || ""); if (!m) return null; let place = m[4] || null; if (place) { try { place = decodeURIComponent(place); } catch (e) {} } let year = null; const q = /[?&]y=(-?\d{1,5})\b/.exec(m[5] || ""); if (q) year = clampYear(Number(q[1])); const qw = /[?&]war=([A-Za-z0-9_-]+)/.exec(m[5] || ""); return { lon: Number(m[1]), lat: Number(m[2]), z: Number(m[3]), place, year, war: qw ? qw[1] : null }; }   // &war=<card id>: a war card's window opens the Atlas on that war (Phase 4)
    // the query: ?y=<year> (Phase 2a) and perf; the existing form #map/<lon>/<lat>/<zoom>/<place> is unchanged
    function hashNow() { const q = []; if (time.hist || time.year !== TODAY) q.push("y=" + time.year); if (perfInHash) q.push("perf"); return "#map/" + view.lon.toFixed(2) + "/" + view.lat.toFixed(2) + "/" + zoomLevel().toFixed(2) + (sel.id ? "/" + encodeURIComponent(sel.id) : "") + (q.length ? "?" + q.join("&") : ""); }
    function writeHash(push) {
      if (EMBED) return;
      if (!/^#map(\/|\?|$)/.test(location.hash || "")) return;   // the reader has left the Atlas
      const h = hashNow(); if (h === location.hash) return;
      lastWrittenHash = h;
      try { if (push) history.pushState(null, "", location.pathname + location.search + h); else history.replaceState(null, "", location.pathname + location.search + h); } catch (e) {}
    }
    function applyHash(d) {
      if (!d || !isFinite(d.lon) || !isFinite(d.lat) || !isFinite(d.z)) return;
      const z = R_KM / ((156.543 / Math.pow(2, d.z)) * base);
      view.lon = d.lon; view.lat = d.lat; view.zoom = z; clampView(); flying = null; coasting = false;
      if (d.year != null && d.year !== time.year) applyYear(d.year, { why: "hash" });
      if (d.war) { pendingWar = d.war; tryPendingWar(); }
      if (!tileIndex) pendingZoom = z;   // the cap is not known until the header arrives: the asked-for zoom is clamped again then
      if (d.place) { const histId = /^(pol|cap|contested):/.test(d.place); if (G.ready && stats.ready && (!histId || time.ents) && selectById(d.place, { open: true, push: false })) pendingPlace = null; else { pendingPlace = d.place; pendingFly = false; } } else if (sel.id) clearSelection();   // a history place (pol:, cap:) waits for the history header
      plan(); invalidate(); requestLayout("hash", true);
    }
    // pushState and replaceState fire no event, so every hashchange or popstate is the reader's: Back, Forward, a typed link.
    // One that already describes the view and the selection (a settle's own rewrite read back) changes nothing.
    const onHash = () => { if (disposed) return; const h = location.hash || ""; if (!/^#map(\/|\?|$)/.test(h)) return; if (h === hashNow()) return; const d = readHash(); if (d) applyHash(d); else if (sel.id) clearSelection(); };
    if (!EMBED) { window.addEventListener("hashchange", onHash); window.addEventListener("popstate", onHash); }

    /* ---- the keyboard: a hidden list of buttons mirroring the visible labels in rank order ---- */
    function updateKeys() {
      /* one button per DRAWN mark and per placed name, best first, capped (stacks removed: the old zoom-in-on-a-stack
         button is gone). A mark whose name is placed is one button, not two. */
      const seen = new Set(), items = [];
      for (const p of L.placed) if (p.text) { seen.add(p.id); items.push({ id: p.id, kind: p.kind, score: p.score, name: p.text }); }   // one per placed label, as it always was (a river's name may stand on several stretches)
      for (const m of L.marks) if (m.clear && !seen.has(m.id)) { seen.add(m.id); items.push({ id: m.id, kind: m.kind, score: m.score, name: "" }); }
      const list = items.sort((a, b) => a.score - b.score).slice(0, KEY_LIST_MAX);
      const ids = list.map((p) => p.id).join("\n");
      if (ids === L.keyIds) return;
      L.keyIds = ids;
      const had = document.activeElement && keysUl.contains(document.activeElement) ? document.activeElement.getAttribute("data-id") : null;
      keysUl.innerHTML = list.map((p) => { const row = G.byId.get(p.id); return `<li><button type="button" data-id="${escText(p.id)}">${escText(row ? row.name : p.name)}, ${escText(KIND_LABEL[p.kind] || p.kind)}</button></li>`; }).join("");
      if (had) { const b = keysUl.querySelector(`button[data-id="${had.replace(/"/g, '\\"')}"]`); if (b) b.focus({ preventScroll: true }); }
    }
    keysUl.addEventListener("click", (e) => { const b = e.target.closest("button[data-id]"); if (!b) return; closeFan(); const row = G.byId.get(b.getAttribute("data-id")); if (row) selectRow(row, { open: true, push: true }); });
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
    /* A CONTROL THAT CHANGES SIZE (the study panel growing its collection chips, a sheet or the card opening, the rail) moves the ground the
       marks must keep clear of: the rectangles the painter checks (`L.chrome`, measured at each layout) are measured again, and the frame
       redrawn, whenever one of them does — so a mark is never left under a control that has grown since the last layout */
    const chromeObs = typeof ResizeObserver === "function" ? new ResizeObserver(() => { if (disposed) return; L.chrome = chromeRects(); invalidateLabels(); }) : null;
    if (chromeObs) for (const q of CHROME) for (const n of el.querySelectorAll(q)) chromeObs.observe(n);
    const viewHost = document.getElementById("view") || document.body;
    const mo = new MutationObserver(() => { if (!el.isConnected) dispose(); });
    mo.observe(viewHost, { childList: true });
    // a theme change (data-theme, or the night class) re-reads the tokens: the palette and the relief ramp follow
    const themeObs = new MutationObserver(() => { if (!el.isConnected) return; spriteGen++; spriteCache.clear(); palette = readPalette(); R.setPalette(palette); R.setRamp(buildRamp()); labelColours(); if (time.hist) { histColours(); uploadStyle(); if (time.view) time.view.faces = time.alive.map((a) => ({ face: a.face, rgb: entColour(a.ent), hatch: time.ents[a.ent].kind === "contested" ? entColour(entityIndexOfId(time.ents[a.ent].partners[1])) : null })); drawTicks(); } if (G.ready) measureMetrics(); invalidate(); });
    themeObs.observe(document.body, { attributes: true, attributeFilter: ["class", "data-theme", "data-fs"] });   // data-fs: Settings → Text size (the names follow it, labelScaleNow)
    /* ============================================================================================================
       PHASE 3b — THE STUDY LAYER (docs/atlas-v2-design.md §2.8, §7 "Phase 3b — as built")
       The host (app.js) hands over `H.study`: the ids of the cards the reader has a record for (studied: v1's own definition, see
       study.js), what a card is called and which collection owns it, and where it opens. Everything below is COMPUTED from that and
       from two lazy files — atlas/data/card-places.js (card → registry ids) and atlas/data/places.js (the places the gazetteer does
       not carry); nothing is stored but two per-viewer conveniences in localStorage (the view and the collections switched off), and
       nothing is written to the progress blob (docs/accounts-sync.md). Three views: the plain Map (the study layer off), the PERSONAL
       Atlas (the places of the studied cards drawn, everything else muted) and the FULL Atlas (every place any card is about, the
       reader's own filled). A collection's switch hides the cards it owns in either view.
       ============================================================================================================ */
    const AS = root.AtlasStudy;
    const SU = H.study || null;
    const MODE_KEY = "folio.atlas2.study", COLL_KEY = "folio.atlas2.studyOff", OPEN_KEY = "folio.atlas2.studyOpen";
    const ST = { ready: false, loading: false, failed: false, open: !PHONE, mode: "map", hidden: new Set(), idx: null, st: null, flags: new Map(), colls: [], rev: 0, limit: new Map() };
    const stRead = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    { const v = stRead(OPEN_KEY); if (v === "1" || v === "0") ST.open = v === "1"; }   // a stored choice wins over the phone default (collapsed)
    const stWrite = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
    const studyEl = el.querySelector(".atlas2-study");
    const infoCache = new Map();
    const info = (cid) => { let v = infoCache.get(cid); if (v === undefined) { try { v = SU.cardInfo(cid) || null; } catch (e) { v = null; } infoCache.set(cid, v); } return v; };
    // the places.js rows join the gazetteer's in G (selectable, searchable, openable by hash); a gazetteer-shaped row with `src: "places"`
    function registerPlaces(T) {
      if (!T || !Array.isArray(T.rows) || !Array.isArray(T.cols)) return 0;
      let n = 0;
      for (const r of T.rows) {
        const o = { i: G.rows.length }; T.cols.forEach((c, j) => { o[c] = r[j] == null ? 0 : r[j]; });
        if (G.byId.has(o.id)) continue;
        o.aliases = Array.isArray(o.aliases) ? o.aliases.slice() : []; o.at = Array.isArray(o.at) ? o.at : null; o.qid = o.qid ? "Q" + o.qid : ""; if (o.wiki === 1) o.wiki = o.name; if (!o.wiki) o.wiki = "";
        o.rank = 9; o.len = 0; o.src = "places"; o.within = o.within || 0;
        G.rows.push(o); G.byId.set(o.id, o); n++;
      }
      // the alias overlay: the period names folded into a gazetteer row (Epidamnos for Durrës), which the file does not own
      for (const [id, names] of Object.entries(T.alias || {})) { const row = G.byId.get(id); if (!row) continue; if (!Array.isArray(row.aliases)) row.aliases = []; for (const nm of names) if (!row.aliases.includes(nm)) row.aliases.push(nm); }
      for (const o of G.rows) { o.key = fold(o.name); o.akeys = (o.aliases || []).map(fold); }
      return n;
    }
    const POINT_KIND = /^(capital|city|town|site|mountain|hill|cape)$/;
    // what the worker needs of a place it has no geometry for: a mark (a point kind, from either file) or a name at a point (an area of places.js)
    function sendStudyRows() {
      const rows = [];
      for (const id of ST.idx.ids) {
        const row = G.byId.get(id); if (!row || !row.at || id.startsWith("pol:")) continue;
        const own = row.src === "places";
        if (!POINT_KIND.test(row.kind) && !own) continue;   // a gazetteer area is drawn by the ordinary pass, flagged only
        rows.push({ id, name: row.name, kind: row.kind, sub: row.sub || "", lon: row.at[0], lat: row.at[1], n: (ST.idx.cardsOfPlace.get(id) || []).length, pd: !own && POINT_KIND.test(row.kind) });
      }
      postToWorker({ type: "study-rows", rows });
    }
    function loadStudy() {
      if (!SU || !AS || ST.ready || ST.loading) return;
      ST.loading = true; renderStudyPanel();
      Promise.all([loadScript(opts.placesUrl || "atlas/data/places.js"), loadScript(opts.cardPlacesUrl || "atlas/data/card-places.js")]).then(() => {
        if (disposed) return;
        const t0 = performance.now();
        registerPlaces(root.ATLAS_PLACES); const t1 = performance.now();
        ST.idx = AS.parse(root.ATLAS_CARD_PLACES); const t2 = performance.now();
        /* what a card is called and which collection owns it is asked of the host for every card of the index (2,476 asks, ~70 µs each:
           145–200 ms in ONE task landed on the first frames of a pinch in the frame gate, 3 of 3 local runs) — so it is done in slices
           of 8 ms, a task each, and the panel reads "Reading your cards…" until the last slice is in */
        const ids = ST.idx.cardIds; let i = 0;
        const slice = () => {
          if (disposed) return;
          const s0 = performance.now(); while (i < ids.length && performance.now() - s0 < 8) info(ids[i++]);
          if (i < ids.length) { setTimeout(slice, 0); return; }
          const t3 = performance.now();
          ST.ready = true; ST.loading = false;
          sendStudyRows(); const t4 = performance.now();
          refreshStudy(true); const t5 = performance.now(); maybeFrame();
          stats.study = { register: Math.round(t1 - t0), parse: Math.round(t2 - t1), warm: Math.round(t3 - t2), rows: Math.round(t4 - t3), refresh: Math.round(t5 - t4) };   // main-thread ms of each step (the warm-up is many tasks of 8 ms), for the suites
          if (pendingPlace && stats.ready && G.byId.has(pendingPlace) && selectById(pendingPlace, { open: true, fly: pendingFly, push: false })) pendingPlace = null;
        };
        setTimeout(slice, 0);
      }).catch((e) => { ST.failed = true; ST.loading = false; renderStudyPanel(); if (typeof console !== "undefined") console.warn("atlas2 study data failed: " + (e && e.message || e)); });
    }
    // the studied set, the collections, the remembered view — recomputed whenever the host's progress could have moved (a mount; a toggle)
    function refreshStudy(first) {
      let ids = []; try { ids = SU.studiedCards() || []; } catch (e) { ids = []; }
      ST.st = AS.studied(ST.idx, ids);
      ST.colls = AS.collections(ST.idx, ST.st, info);
      if (first) {
        let hidden = []; try { hidden = JSON.parse(stRead(COLL_KEY) || "[]"); } catch (e) { hidden = []; }
        const known = new Set(ST.colls.map((c) => c.id));
        ST.hidden = new Set((Array.isArray(hidden) ? hidden : []).filter((h) => typeof h === "string" && known.has(h)));
        const m = stRead(MODE_KEY);
        ST.mode = m === "personal" || m === "full" || m === "map" ? m : (ST.st.total > 0 ? "personal" : "map");
      }
      applyStudy();
    }
    function applyStudy() {
      ST.flags = ST.ready ? AS.flags(ST.idx, ST.st, ST.mode, ST.hidden, info) : new Map();
      PI.mode = ST.ready ? ST.mode : "map"; PI.flags = ST.flags; refreshWars(); refreshPresence();   // 4/0a: the Automatic wars position follows the mode   // 2c: the Personal and Full Atlas decide which peoples a reader sees
      ST.rev++;
      postToWorker({ type: "study-flags", mode: ST.mode === "map" ? "" : ST.mode, entries: [...ST.flags], rev: ST.rev });
      renderStudyPanel();
      if (cardOpen && cardRow) appendStudyCards(cardRow);
      invalidateLabels(); requestLayout("study", true);
    }
    function setStudyMode(m) {
      if (!ST.ready || !/^(map|personal|full)$/.test(m) || m === ST.mode) return;
      ST.mode = m; stWrite(MODE_KEY, m); applyStudy();
    }
    /* THE DEFAULT VIEW (Phase 3c): a reader who opens on the Personal Atlas with studied places is shown THEM — centred on where they lie,
       zoomed to hold nine in ten of them (study.js `framing`, clamped to 3–24 km/px and never wider than the whole earth) — rather than
       the whole globe. Once per mount, and only while the reader has not touched the view, the address names no view, and the mode is
       Personal (a stored Map or Full keeps today's default); with no places, or places spread right round the globe, nothing changes. */
    let framed = false, userMoved = false, deepView = false, lastFrame = null;
    function maybeFrame() {
      if (framed || userMoved || deepView || !AS || !ST.ready || !G.ready || !stats.ready || !ST.st || ST.mode !== "personal") return;
      framed = true;
      const pts = []; for (const [id, f] of ST.flags) { if (f !== 2) continue; const r = G.byId.get(id); if (r && r.at && !r.hist) pts.push(r.at); }
      const fr = AS.framing(pts, { shortPx: Math.min(cssW, cssH), minKmpp: Math.max(3, kmFloor()), maxKmpp: R_KM / base });
      if (!fr) return;
      lastFrame = fr; setView(fr.lon, fr.lat, fr.kmpp);
    }
    for (const t of ["pointerdown", "wheel", "keydown", "touchstart"]) el.addEventListener(t, () => { userMoved = true; }, { capture: true, passive: true });
    function setStudyOpen(on) {
      on = !!on; if (on === ST.open) return;
      ST.open = on; stWrite(OPEN_KEY, on ? "1" : "0"); renderStudyPanel();
      const t = studyEl && studyEl.querySelector(".atlas2-study-toggle"); if (t && !t.hidden && studyEl.contains(document.activeElement)) t.focus({ preventScroll: true });
    }
    function toggleColl(id, on) {
      const was = !ST.hidden.has(id), want = on == null ? !was : !!on;
      if (want === was) return;
      if (want) ST.hidden.delete(id); else ST.hidden.add(id);
      stWrite(COLL_KEY, JSON.stringify([...ST.hidden])); applyStudy();
    }
    function renderStudyPanel() {
      if (!studyEl) return;
      const live = SU && AS && !ST.failed;
      studyEl.hidden = !live;
      if (!live) return;
      const moreEl = studyEl.querySelector(".atlas2-study-details"), toggleEl = studyEl.querySelector(".atlas2-study-toggle");
      const sumEl = studyEl.querySelector(".atlas2-study-sum"), noteEl = studyEl.querySelector(".atlas2-study-note"), emptyEl = studyEl.querySelector(".atlas2-study-empty"), collsEl = studyEl.querySelector(".atlas2-study-colls");
      studyEl.setAttribute("data-mode", ST.mode); studyEl.setAttribute("data-ready", ST.ready ? "1" : "0");
      for (const b of studyEl.querySelectorAll("button[data-mode]")) { const on = b.getAttribute("data-mode") === ST.mode; b.setAttribute("aria-checked", String(on)); b.classList.toggle("on", on); b.disabled = !ST.ready; }
      if (!ST.ready) { sumEl.textContent = "Reading your cards…"; noteEl.hidden = true; emptyEl.hidden = true; collsEl.hidden = true; moreEl.hidden = true; toggleEl.hidden = true; return; }
      const sm = AS.summary(ST.st, ST.mode, ST.flags);
      sumEl.textContent = sm.text; sumEl.hidden = !sm.text;
      noteEl.textContent = sm.note; noteEl.hidden = !sm.note;
      emptyEl.textContent = sm.empty; emptyEl.hidden = !sm.empty;
      // the collections that have places (in the Personal Atlas, those the reader has a place in): a switch each, all on by default
      const list = ST.mode === "map" ? [] : ST.colls.filter((c) => (ST.mode === "personal" ? c.mine : c.places) > 0);
      collsEl.hidden = !list.length;
      collsEl.innerHTML = list.map((c) => `<button type="button" role="checkbox" class="atlas2-study-coll${ST.hidden.has(c.id) ? "" : " on"}" aria-checked="${ST.hidden.has(c.id) ? "false" : "true"}" data-coll="${escText(c.id)}" title="${escText(c.name)}: ${ST.mode === "personal" ? c.mine + " of " + c.places + " places yours" : c.places + " places"}"><span class="atlas2-study-coll-n">${escText(c.name)}</span><i>${ST.mode === "personal" ? c.mine : c.places}</i></button>`).join("");
      // the collection chips and the note sit under a disclosure (collapsed by default on a phone, where the panel is 120 px of a 700 px frame):
      // the switch and the count line stay, the empty-state sentence is a count line too
      const hasMore = !!list.length || !noteEl.hidden;
      toggleEl.hidden = !hasMore; moreEl.hidden = !(hasMore && ST.open);
      toggleEl.setAttribute("aria-expanded", String(hasMore && ST.open)); { const t = (hasMore && ST.open ? "Hide" : "Show") + (list.length ? " the collections" : " the details"); toggleEl.setAttribute("aria-label", t); toggleEl.title = t; }
      studyEl.setAttribute("data-open", hasMore && ST.open ? "1" : "0");
      requestLayout("chrome");   // the panel's height moved: the names step out from under it
    }
    if (studyEl) {
      studyEl.addEventListener("click", (e) => {
        const m = e.target.closest("button[data-mode]"); if (m) { setStudyMode(m.getAttribute("data-mode")); return; }
        if (e.target.closest(".atlas2-study-toggle")) { setStudyOpen(!ST.open); return; }
        const c = e.target.closest("button[data-coll]"); if (c) { toggleColl(c.getAttribute("data-coll")); const again = studyEl.querySelector(`[data-coll="${c.getAttribute("data-coll").replace(/"/g, '\\"')}"]`); if (again) again.focus({ preventScroll: true }); }
      });
      // radio-group arrow keys, the way the legend's density stops behave
      studyEl.querySelector(".atlas2-study-modes").addEventListener("keydown", (e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        const bs = [...studyEl.querySelectorAll("button[data-mode]")].filter((b) => !b.disabled), i = bs.findIndex((b) => b === document.activeElement); if (i < 0) return;
        e.preventDefault(); const n = bs[(i + (e.key === "ArrowRight" ? 1 : bs.length - 1)) % bs.length]; n.focus(); setStudyMode(n.getAttribute("data-mode"));
      });
    }
    // the cards about a place, appended to whatever the card's own renderer wrote: idempotent (one section), capped with "and N more"
    function appendStudyCards(row) {
      for (const old of cardBody.querySelectorAll(".atlas2-study-cards")) old.remove();
      if (!SU || !AS || !ST.ready || !row) return;
      const mode = ST.mode === "personal" ? "personal" : "full";
      const limit = ST.limit.get(row.id) || AS.LIST_CAP;
      const r = AS.cardsFor(ST.idx, row.id, ST.st, mode, ST.hidden, info, limit);
      if (!r.total && !r.others) return;
      const sec = document.createElement("section"); sec.className = "atlas2-study-cards"; sec.setAttribute("aria-label", "Cards about this place");
      const head = mode === "personal" ? "From your cards" : "Cards about this place";
      const li = (c) => { const i = info(c.id) || {}; return `<li><a class="atlas2-study-card" href="${escText(SU.cardHref ? SU.cardHref(c.id) : "#card/" + c.id)}" data-card="${escText(c.id)}"><span class="atlas2-study-title">${escText(i.title || c.id)}</span>${i.coll ? `<span class="atlas2-chip atlas2-study-chip">${escText(i.coll)}</span>` : ""}${c.mine && mode === "full" ? '<span class="atlas2-study-mine" title="You have studied this card">studied</span>' : ""}</a></li>`; };
      sec.innerHTML = `<h3 class="atlas2-study-h">${escText(head)}</h3>` + (r.shown.length ? `<ul class="atlas2-study-list">${r.shown.map(li).join("")}</ul>` : "") +
        (r.more ? `<button type="button" class="atlas2-link atlas2-study-more" data-more="${escText(row.id)}">and ${r.more} more</button>` : "") +
        (r.others ? `<p class="atlas2-study-others">${r.others} more ${r.others === 1 ? "card is" : "cards are"} about this place that you haven’t studied yet.</p>` : "");
      cardBody.appendChild(sec);
    }
    cardBody.addEventListener("click", (e) => {
      const more = e.target.closest("button[data-more]");
      if (more) { const id = more.getAttribute("data-more"); ST.limit.set(id, (ST.limit.get(id) || AS.LIST_CAP) + 20); const keep = cardBody.scrollTop; if (cardRow && cardRow.id === id) appendStudyCards(cardRow); cardBody.scrollTop = keep; }
    });
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
    try { paintWarsKey(); } catch (e) { /* before the time block */ }
    layout();
    // a deep link (#map/<lon>/<lat>/<zoom>/<place>) sets the first view; the place opens once the data is in
    if (!EMBED) { const d = readHash(); if (d) { deepView = true; lastWrittenHash = location.hash; applyHash(d); } }
    /* AN OLD LINK (Phase 5): v1's address was #map/<year> or #map/<year>/<name-slug> ("#map/1938/france"). The host passes what app.js decoded of it (`legacy: { year, name }`): the year is set at once, and the name is looked up in the whole
       registry — the gazetteer's rows, then the polities of every age once their index lands — by the same folded spelling the search uses, and opened (flown to) the way a search result is. The address then becomes the new
       canonical form by the ordinary settle. A name that matches nothing leaves the year and the default view: the link still lands on the Atlas. */
    function openLegacy(l) {
      if (l.year != null && isFinite(l.year)) applyYear(clampYear(l.year), { why: "hash" });
      const norm = (s) => fold(s).replace(/[^a-z0-9]+/g, " ").trim(), want = norm(String(l.name || "").replace(/-/g, " "));
      if (!want) return;
      /* THE WAIT IS FOR THE DATA, NOT FOR A COUNT OF TRIES (Oct 2026). It used to give up after 200 tries (about 20 s) and leave the default view: a main-thread shim on a slow device (a file:// copy, or a Worker that
         failed) is `ready` well after that — a CPU slowed 8× opens `#map/1/Rome` from a file after 90 s — and so would a slow network, so the link opened the year and no place. It now waits until the Atlas has failed
         or been left, or ten minutes have passed. */
      const giveUp = performance.now() + 10 * 60 * 1000;
      const attempt = () => {
        if (disposed || status.classList.contains("atlas2-fail")) return;
        if (!(G.ready && stats.ready) || (PX.state === 1) || (PX.state === 0 && (loadPolityIndex(), true))) { if (performance.now() < giveUp) setTimeout(attempt, 100); return; }
        const rows = searchRows();
        const hit = rows.find((r) => norm(r.name) === want) || rows.find((r) => (r.akeys || []).some((a) => norm(a) === want));
        if (!hit) return;
        results = [hit]; chooseResult(0);
      };
      attempt();
    }
    if (!EMBED && H.legacy) { deepView = true; openLegacy(H.legacy); }
    drawTicks();
    invalidate();
    // the view set from outside (the perf suite's fixed views): centre, zoom, then wait for `tilesSettled()`
    function setView(lon, lat, kmPerPixel) { view.lon = lon; view.lat = lat; view.zoom = R_KM / (kmPerPixel * base); flying = null; coasting = false; plan(); invalidate(); touched(); }
    const tilesSettled = () => view.tiles.every((k) => R.tileLoaded(k)) && (view.level !== 4 || view.parents.every((k) => R.tileLoaded(k))) && landTiles.pending.size === 0
      && (!view.lakes || !waterStarted || waterFailed || (view.waterTiles.every((k) => R.waterTileLoaded(k)) && waterTiles.pending.size === 0))
      && (!view.relief.on || !reliefStarted || reliefFailed || (!!reliefIndex && R.reliefLoaded("0") && view.relief.tiles.every((k) => R.reliefLoaded(k)) && reliefTiles.pending.size === 0));
    const waterSettled = () => !waterStarted || waterFailed || (!!waterHeader && R.waterLevelLoaded(2));
    const controller = { embed: EMBED ? { plan: () => plan(), layout: () => layout(), setRes: (sc) => setRes(sc), el, setHook: (f) => { embedHook = f; }, webgl: !STATIC2D, base: () => base, size: () => [cssW, cssH], rotation: () => { rotation(); return view.rot; }, startHistory: (kind) => ensureHistory(kind), historyKind: () => (histStarted ? histKind : null), warFrame: (id, short, share) => warFrame(id, short, share), warSides: (id, year) => warSidesOf(id, year), faceAnchors: (faces, cb, near) => faceAnchors(faces, cb, near), warColours: () => ({ victor: warRGB.victor.slice(), loser: warRGB.loser.slice() }), refreshPresence: () => refreshPresence(), setTints: (map) => { time.gameTints = map && map.size ? map : null; if (time.hist) { uploadStyle(); invalidate(); } },
        lonLatAt: (x, y) => { const p = unproject(x, y); return p ? [p.lon, p.lat] : null; },
        /* the entity ids under a point in the year the controller is at — Find-it's ID-pass scoring: the states (a contested face's two claimants too) in a past year, the country or admin-1 unit in a present one */
        idsAt: (x, y) => {
          const out = [], add = (id) => { if (id && out.indexOf(id) < 0) out.push(id); };
          if (!R.levelLoaded(0)) return out;
          const hasP = !!(time.hist && time.pOnScreen && time.pOnScreen.length);
          if (hasP) { const skip = new Set(); for (let n = 0; n < 6; n++) { const p = R.pick(view, x, y, "land", { layer: "presence", skip }); if (!p || p.histFace == null) break; skip.add(p.histFace); const pe = time.ents[time.faceEntity[p.histFace]]; if (pe) add(pe.id); } }
          const f = R.pick(view, x, y, "land", hasP ? { layer: "states" } : undefined);
          if (f && f.histFace != null && time.hist) { const e = time.ents[time.faceEntity[f.histFace]]; if (e) { if (e.kind === "contested") { for (const p of e.partners) add(p); add(e.id); } else add(e.id); } }
          else if (f && f.face != null && header && faceEntity && time.present) { const ent = header.entities[faceEntity[f.face]]; if (ent) { add(ent.id); if (ent.parent) add(ent.parent); } }
          return out;
        }, historyOK: () => !!(time.hist && time.hist.ready) && !!time.wars && historySettled(), setYearNow: (y) => { if (time.year !== y) setYear(y); }, focusWarNow: (id) => focusWar(id), year: () => time.year, TODAY, landSettled: () => view.tiles.every((k) => R.tileLoaded(k)) && (view.level !== 4 || view.parents.every((k) => R.tileLoaded(k))) && landTiles.pending.size === 0 && (view.level >= 3 || R.levelLoaded(view.level)), levelReady: () => R.levelLoaded(0), faceOfId: (id) => faceOfId(id), facesOfId: (id) => { const i = entityOf(id); if (i == null || !faceEntity) return []; const out = []; for (let f = 0; f < faceEntity.length; f++) if (faceEntity[f] === i) out.push(f); return out; }, ready: () => stats.ready } : null, dispose, stats, view, layers, renderer: R, invalidate, zoomAt, pick, setView, setLayers, kmPerPx, tilesSettled, waterSettled, setPerf,
      stageInfo: () => ({ stage, learnt, locked: stageLocked, trace: stageTrace.slice(), escalations: stats.escalations, recoveries: stats.recoveries, stallsIgnored: stats.stallsIgnored, longTasks: stats.longTasks, frameTasks: stats.frameTasks || 0, gpuTimer: !!(R.gpuMs && R.gpuTimer && R.gpuTimer()), gpuMs: R.gpuMs ? R.gpuMs() : null, fastRun, trialFast, longObs: !!longObs }),
      forceStage, feedGesture, stall: (ms) => bracket(() => { const t0 = performance.now(); while (performance.now() - t0 < ms) { /* a main-thread stall, bracketed as one */ } }),
      perfOn: () => perfOn,
      mode: () => ({ file: FILE, static2d: STATIC2D, shim: !!shim, worker: !!worker, resScale, stage, lodBias: lodBias(), shimWhy: stats.shim || null, workerError: stats.workerError || null, twinVerified: stats.twinVerified || 0 }),
      input: () => ({ pointers: [...ptrs.entries()].map(([id, p]) => [id, Math.round(p.x), Math.round(p.y)]), dragging, moved, pinch: Math.round(pinch), coasting, flying: !!flying }),   // for the suites
      statsNow: () => Object.assign(R.stats(), { frameTrace: stats.frameTrace ? stats.frameTrace.slice() : null, taskMs: stats.taskMs ? Object.fromEntries(Object.entries(stats.taskMs).map(([k, v]) => [k, Math.round(v)])) : null, frameMsP95: pct95(stats.frames), frameMsMean: stats.frames.length ? Math.round(stats.frames.reduce((p, q) => p + q, 0) / stats.frames.length) : 0, kmPerPx: kmPerPx(), wanted: view.tiles.length, resScale, stage, lodBias: lodBias(), mode: STATIC2D ? "canvas2d" : "webgl2", pending: landTiles.pending.size, resident: landTiles.stats.resident, fetched: landTiles.stats.fetched, tileBytes: landTiles.stats.bytes, evicted: landTiles.stats.evicted, waterWanted: view.waterTiles.length, waterPending: waterTiles.pending.size, reliefWanted: view.relief.tiles.length, reliefPending: reliefTiles.pending.size, reliefBytes: reliefTiles.stats.bytes, reliefFade: view.relief.fade, riversOn: view.rivers, lakesOn: view.lakes, reliefOn: view.relief.on, phone: PHONE,
        year: time.year, historyFaces: time.alive.length, labelsPlaced: L.placed.length, labelCandidates: L.candidates, labelCap: L.cap, labelLayoutMs: L.lastLayoutMs, labelLayoutP95: pct95(stats.labelLayout), labelSpriteMs: L.lastSpriteMs || 0, labelSpriteP95: pct95(stats.labelSprite), labelDrawMs: L.lastDrawMs, labelDrawP95: pct95(stats.labelDraw), markDrawMs: L.lastMarkMs, markDrawP95: pct95(stats.markDraw), marksDrawn: L.ln,  marksLaid: L.marks.length, labelBudgets: { drawMs: LABEL_DRAW_BUDGET_MS, layoutMs: LABEL_LAYOUT_BUDGET_MS }, heapMB: heapMB(), density: layers.density, zoomLevel: zoomLevel() }),
      // Phase 1c, for the suites and the console
      study: { enabled: () => !!(SU && AS), ready: () => ST.ready, mode: () => ST.mode, setMode: setStudyMode, open: () => ST.open, setOpen: setStudyOpen, summary: () => (ST.ready ? Object.assign(AS.summary(ST.st, ST.mode, ST.flags), { studiedCards: ST.st.cards.length, studiedPlaces: ST.st.all.size, noPlace: ST.st.noPlace, total: ST.st.total }) : null),
        flags: () => [...ST.flags], collections: () => ST.colls.map((c) => Object.assign({ off: ST.hidden.has(c.id) }, c)), hidden: () => [...ST.hidden], toggleColl,
        /* the layout's marks (every flagged place or polity within the view and its margin, with whether its ground was clear at layout), the marks drawn in the last frame, the fan, the hidden list */
        marks: () => { const names = new Map(L.placed.filter((p) => p.st && p.text).map((p) => [p.id, p.text])); return L.marks.map((m) => ({ id: m.id, kind: m.kind, st: m.st, marker: m.shape, layer: m.layer, h: m.h, n: m.n, score: m.score, clear: !!m.clear, sx: m.sx, sy: m.sy, text: names.get(m.id) || "" })); },
        liveMarks: () => liveEntries().map((e) => ({ id: e.m.id, kind: e.m.kind, shape: e.m.shape, layer: e.m.layer, st: e.m.st, x: e.x, y: e.y, h: e.h })),
        layoutChrome: () => (L.chrome || []).map((r) => r.slice()),
        near: (x, y, touch) => marksNear(x, y, markRadius(touch)).map((e) => e.m.id),
        fan: () => (fan ? { x: fan.x, y: fan.y, clear: fan.clear, items: fan.slots.map((sl) => ({ id: sl.mem.e.m.id, name: sl.mem.name, x: sl.mem.x, y: sl.mem.y, fx: sl.x, fy: sl.y, right: sl.right, rect: sl.rect })) } : null), closeFan: () => closeFan(),
        keys: () => [...keysUl.querySelectorAll("button[data-id]")].map((b) => ({ id: b.getAttribute("data-id"), text: b.textContent })),
        index: () => ST.idx, panel: () => studyEl, refresh: () => refreshStudy(false), info, muted: () => ST.mode === "personal" && ST.flags.size > 0 },
      frame: () => [cssW, cssH],
      drawSamples: () => ({ labels: stats.labelDraw.slice(), marks: (stats.markDraw || []).slice() }),
      labels: () => L.placed, labelScale: () => LS, labelsLive: () => L.live, layoutSeq: () => L.seq, layoutNow: () => new Promise((res) => { layoutWaiters.push(res); requestLayout("test", true); }), labelsReady: () => gazInWorker && metricsSent > 0,
      gazetteer: () => G, styles: STYLES, palette: () => palette, colours: () => ({ halo: haloCss, ink: inkCss, water: waterCss, selected: selCss }),
      select: selectById, selectedId: () => sel.id, stack: () => sel.stack.map((r) => r.id), stackAt: (x, y) => stackAt(x, y).map((r) => r.id), pickAt, hitAt: (x, y) => hitAt(x, y).map((h) => h.p.id), clearSelection,
      card: () => ({ open: cardOpen, id: cardRow ? cardRow.id : null, title: cardTitle.textContent, shut: cardEl.classList.contains("atlas2-card-shut") }),
      search: (q) => runSearch(q).map((r) => r.id), chooseResult, flyTo, flyToRow: (id, open) => { const r = G.byId.get(id); if (r) flyToRow(r, open); return !!r; }, flying: () => !!flying,
      chromeRects, showPlace, framing: () => lastFrame, discovery: () => ({ id: discId, fresh: discFresh }), hash: hashNow, readHash, metricsCount: () => metricsSent,
      /* Phase 2a: time */
      setYear: (y, o) => setYear(y, o), year: () => time.year, railTicks: () => time.tickStats || null, stepChange, play: () => startPlay(), stop: () => stopPlay(), playing: () => time.playing, setSpeed: (v) => { time.speed = v; railSpeed.value = String(v); },
      alive: () => time.alive.map((a) => ({ face: a.face, entity: time.ents[a.ent].id, from: a.from, to: a.to })),
      // Phase 2c, for the suites: the presences the Peoples switch lets through in the year, the ones on screen, what is handed to the renderer, the switch
      presence: () => ({ alive: time.palive.filter((a) => !time.isExt[a.ent] && !time.isFront[a.ent]).map((a) => ({ face: a.face, entity: time.ents[a.ent].id, from: a.from, to: a.to })), onScreen: (time.pOnScreen || []).filter((a) => !time.isExt[a.ent] && !time.isFront[a.ent]).map((a) => a.face), drawn: ((time.view && time.view.pfaces) || []).filter((f) => !f.ext && !f.front).map((f) => ({ face: f.face, angle: f.angle, fade: f.fade })), position: layers.peoples, mode: PI.mode, all: time.presEnts.filter((i) => !time.isExt[i]).map((i) => time.ents[i].id), shown: time.presEnts.filter((i) => !time.isExt[i] && presShown(i)).map((i) => time.ents[i].id) }),
      // Phase 2d, for the suites: the wars table, the wars drawn, the entities tinted in the year with their roles, the washes handed to the renderer, the key's colours
      wars: () => ({ ready: !!time.wars, count: time.wars ? Object.keys(time.wars).length : 0, position: layers.wars, focus: time.warFocus, shown: [...time.warShown].sort(), roles: [...time.warRoles].map(([id, r]) => [id, r.role, r.wars.slice()]).sort((a, b) => (a[0] < b[0] ? -1 : 1)), washes: ((time.view && time.view.pfaces) || []).filter((f) => f.ext).map((f) => ({ face: f.face, rgb: f.rgb.map((v) => Math.round(v * 255)), wash: f.wash })), colours: { victor: warRGB.victor.map((v) => Math.round(v * 255)), loser: warRGB.loser.map((v) => Math.round(v * 255)) }, tinted: (time.view && time.view.faces || []).filter((f) => time.warRoles.size && f.tint).length, note: (sheet.querySelector('.atlas2-wars-note') || {}).textContent || '' }),
      rowName: (id) => { const r = G.byId.get(id); return r ? r.name : null; }, focusWar: (id) => focusWar(id), warsBlock: (id) => warsBlock(id), frontCardHtml: (e) => frontCardHtml(e),
      // Phase 2d, for the suites: the front line — the chosen date, the plates standing on it, the faces drawn and their tints, the stepper's text
      fronts: () => ({ on: !!layers.fronts, ents: time.frontEnts.map((i) => time.ents[i].id), plates: time.frontPlates.length, date: curFrontDate(), stepped: time.frontDate, standing: (AS2() && curFrontDate() != null ? AS2().platesAt(time.frontPlates, curFrontDate()).map((p) => p.theatre + ":" + p.date) : []), drawn: ((time.view && time.view.pfaces) || []).filter((f) => f.front).map((f) => ({ face: f.face, rgb: f.rgb.map((v) => Math.round(v * 255)), wash: f.wash })), shown: time.frontEnts.filter(frontShown).map((i) => time.ents[i].id), label: frontEl ? frontLabel.textContent : '', visible: !!frontEl && !frontEl.hidden }), stepFront: (d) => stepFront(d), setFrontDate: (n) => { time.frontDate = n; const y = Math.floor(n / 10000); if (y !== time.year) setYear(y, { keepFront: true }); else applyYear(y, { force: true, why: 'fronts' }); }, onScreenAlive: () => (time.onScreenAlive || []).map((a) => a.face), residentKeys: () => [...time.resident], meshInfo: (key) => (R.historyMeshInfo ? R.historyMeshInfo(key) : null), changeYears: () => time.changeYears.slice(), historySettled, historyReady: () => !histStarted || !!(time.hist && time.hist.ready), ensureHistory, historyStarted: () => histStarted,
      historyOK: () => !!(time.hist && time.hist.ready) && !!time.wars && historySettled(),   // every on-screen face has its mesh at the view's level (the frame gate waits on it before it counts the history's triangles)
      timeInfo: () => ({ changeYears: time.changeYears.slice(), year: time.year, present: time.present, alive: time.alive.length, fading: !!time.fade, playing: time.playing, speed: time.speed, resident: time.resident.size, wanted: time.wanted.size, pending: time.pending, entities: time.ents.length, loadMs: time.loadMs, bytes: time.bytes || 0, failed: time.failed, yearChangeP95: pct95(time.yearChange), yearChangeMedian: pct50(time.yearChange), yearQueryP95: pct95(time.yearQuery), yearChangeN: time.yearChange.length, capitals: time.capitals.length, note: !railNote.hidden, onScreen: time.onScreen.length, lru: time.lru.length }),
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
