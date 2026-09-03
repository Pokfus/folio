/* ============================================================
   AVATAR — the figure, what it wears, and the scene it stands in
   ============================================================
   The manifest behind the scene box at the top of the account page. It is LAZY (bundle `avatar`,
   fetched when that page mounts) and it is METADATA plus placeholder line art — a few KB — never the
   sprites themselves, which are ordinary same-origin files the browser fetches only for the parts a
   reader is actually wearing.

   THE ART IS SWAPPED IN FILE BY FILE, WHICH IS WHY EVERY PART HAS BOTH A `src` AND AN `svg`.
   `src` names a sprite under `avatar/` and is what ships once the drawn art exists; `svg` is the flat
   placeholder drawn here, used whenever `src` is null. So the feature is complete and looks deliberate
   before a single PNG is drawn, and adding one is dropping a file in a folder and setting `src` — no
   code changes, no layout changes, and nothing to keep in step.

   RECOLOURING. Skin and hair are reader-chosen colours, so those layers may not be flat art. A
   placeholder does it with `fill="var(--avs-skin)"` directly; a SPRITE does it with a `mask` — the
   part carries `mask` (a white-on-transparent PNG of the recolourable region) and the renderer paints
   a box of the chosen colour through it, with the fixed line art from `src` on top. One file per
   region rather than one per colour, which is the difference between 12 files and 200.

   EVERY COORDINATE IS A PERCENTAGE, never a pixel. The scene box is fluid between a 390px phone and a
   wide laptop, so an anchor stated in pixels is right at exactly one width. A figure anchor is a
   percentage of the SCENE box; a slot anchor is a percentage of the FIGURE box, so an item stays on
   the hand it is held in whatever the scene behind it.

   THE FIGURE'S OWN PARTS ALL SHARE ONE viewBox (0 0 200 400) and the scenes share another
   (0 0 600 400). That is what lets them be stacked as layers with no per-part positioning: hair drawn
   at the same scale as the head it sits on cannot drift from it.

   Adding a scene: an entry here, and the drop is automatic — `lockedScenes()` is this list minus what
   the reader owns, exactly as the collectible themes work. A scene declares `free: true` to be the one
   everybody starts with. */
(function () {
  "use strict";

  /* ---------- the palettes ---------- */
  const SKINS = [
    { id: "s1", name: "Porcelain", hex: "#F2D7C2", shade: "#DFBBA2" },
    { id: "s2", name: "Sand",      hex: "#E8C09C", shade: "#D0A27C" },
    { id: "s3", name: "Ochre",     hex: "#CE9C6F", shade: "#B27F53" },
    { id: "s4", name: "Umber",     hex: "#A97048", shade: "#8A5734" },
    { id: "s5", name: "Chestnut",  hex: "#7C4B2A", shade: "#61371D" },
    { id: "s6", name: "Ebony",     hex: "#4E2E1C", shade: "#3A2113" },
  ];
  const HAIR_COLORS = [
    { id: "c1", name: "Black",    hex: "#221D1A" },
    { id: "c2", name: "Chestnut", hex: "#4A2E1E" },
    { id: "c3", name: "Auburn",   hex: "#7C3A1D" },
    { id: "c4", name: "Wheat",    hex: "#C39A55" },
    { id: "c5", name: "Ash",      hex: "#8A8378" },
    { id: "c6", name: "Silver",   hex: "#D8D3C8" },
  ];

  /* ---------- the figure ----------
     Two builds, six hairstyles, four faces. A part is a layer in this order:
       hairBack → body → face → hairFront
     with the equipment drawn over all of it. Each is one viewBox so nothing has to be positioned. */
  const V = 'viewBox="0 0 200 400" preserveAspectRatio="xMidYMax meet"';
  const SK = 'var(--avs-skin)', SH = 'var(--avs-skin-shade)', HR = 'var(--avs-hair)';
  const LINE = "#2B2620";

  // the drawn body: skin, a plain undyed tunic, and the outline that holds it together
  function body(build) {
    const w = build === "b2" ? 8 : 0;          // b2 is the broader figure — shoulders and torso only
    const sh = 64 - w, hi = 78 - w * 0.5;
    return '<svg ' + V + ' class="avs-svg">' +
      // legs
      '<path d="M' + (86) + ' 228 h28 l6 152 h-18 l-6 -104 -6 104 h-18z" fill="' + SK + '"/>' +
      // feet
      '<path d="M78 380 h20 v10 h-24z M110 380 h20 l4 10 h-24z" fill="' + LINE + '" opacity=".82"/>' +
      // arms
      '<path d="M' + sh + ' 132 l-14 76 6 26 h12 l-2 -26 12 -66z" fill="' + SK + '"/>' +
      '<path d="M' + (200 - sh) + ' 132 l14 76 -6 26 h-12 l2 -26 -12 -66z" fill="' + SK + '"/>' +
      // torso, in the undyed tunic every figure starts in
      '<path d="M' + sh + ' 130 q36 -16 72 0 l6 66 -8 44 h-68 l-8 -44z" fill="#CFC6B4"/>' +
      '<path d="M' + (sh + 10) + ' 128 q26 22 52 0 l-4 22 q-22 14 -44 0z" fill="' + SH + '" opacity=".55"/>' +
      // belt
      '<path d="M' + (100 - hi * 0.5) + ' 200 h' + hi + ' v12 h-' + hi + 'z" fill="#8A6A3E" opacity=".8"/>' +
      // neck and head
      '<path d="M92 96 h16 v26 h-16z" fill="' + SH + '"/>' +
      '<ellipse cx="100" cy="70" rx="33" ry="39" fill="' + SK + '"/>' +
      '<path d="M67 74 q-6 10 2 16 q4 2 6 -2z M133 74 q6 10 -2 16 q-4 2 -6 -2z" fill="' + SK + '"/>' +
      '</svg>';
  }

  const BUILDS = [
    { id: "b1", name: "Slight",  src: null, svg: body("b1") },
    { id: "b2", name: "Broad",   src: null, svg: body("b2") },
  ];

  // faces are eyes, brows and mouth only — the head itself belongs to the body
  function face(id) {
    const eye = (cx, cy, r) => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + (r * 1.15).toFixed(1) + '" fill="' + LINE + '"/>';
    const brow = (d) => '<path d="' + d + '" stroke="' + LINE + '" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".85"/>';
    const mouth = (d) => '<path d="' + d + '" stroke="' + LINE + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
    const F = {
      f1: eye(86, 70, 3.4) + eye(114, 70, 3.4) + brow("M79 60 q7 -4 14 -1") + brow("M107 59 q7 -3 14 1") + mouth("M92 88 q8 6 16 0"),
      f2: eye(86, 70, 3.8) + eye(114, 70, 3.8) + brow("M78 58 h16") + brow("M106 58 h16") + mouth("M91 88 h18"),
      f3: eye(86, 71, 3.2) + eye(114, 71, 3.2) + brow("M79 61 q7 -6 15 -2") + brow("M106 59 q8 -4 15 2") + mouth("M93 87 q7 8 14 -1"),
      f4: eye(87, 70, 3) + eye(113, 70, 3) + brow("M80 57 q6 -2 13 2") + brow("M107 59 q7 -4 13 -2") + mouth("M94 89 q6 3 12 -2"),
    };
    return '<svg ' + V + ' class="avs-svg">' + (F[id] || F.f1) + "</svg>";
  }
  const FACES = [
    { id: "f1", name: "Open",     src: null, svg: face("f1") },
    { id: "f2", name: "Level",    src: null, svg: face("f2") },
    { id: "f3", name: "Wry",      src: null, svg: face("f3") },
    { id: "f4", name: "Thoughtful", src: null, svg: face("f4") },
  ];

  // hair comes in two layers so a style can fall BEHIND the shoulders and still frame the face
  function hair(back, front) {
    return {
      back: back ? '<svg ' + V + ' class="avs-svg">' + back + "</svg>" : "",
      front: '<svg ' + V + ' class="avs-svg">' + front + "</svg>",
    };
  }
  const H = (d) => '<path d="' + d + '" fill="' + HR + '"/>';
  const HAIR = [
    { id: "h1", name: "Cropped", src: null, ...hair("", H("M67 66 q4 -38 33 -38 q29 0 33 38 q-8 -18 -33 -18 q-25 0 -33 18z")) },
    { id: "h2", name: "Curls",   src: null, ...hair("", H("M66 70 q-4 -22 12 -30 q6 -14 22 -12 q16 -2 22 12 q16 8 12 30 q-6 -8 -12 -6 q-2 -12 -14 -12 q-8 -8 -20 -2 q-12 -2 -12 12 q-6 -2 -10 8z")) },
    { id: "h3", name: "Long",    src: null, ...hair(H("M60 66 q2 -44 40 -44 q38 0 40 44 l6 108 h-24 l-6 -96 q-16 10 -32 0 l-6 96 h-24z"), H("M66 68 q2 -40 34 -40 q32 0 34 40 q-10 -20 -34 -20 q-24 0 -34 20z")) },
    { id: "h4", name: "Braid",   src: null, ...hair(H("M92 96 q8 6 16 0 l6 96 q-14 8 -28 0z"), H("M67 68 q3 -40 33 -40 q30 0 33 40 q-9 -16 -20 -18 q-16 8 -30 2 q-10 4 -16 16z")) },
    { id: "h5", name: "Shaven",  src: null, ...hair("", H("M70 62 q6 -30 30 -30 q24 0 30 30 q-12 -10 -30 -10 q-18 0 -30 10z") ) },
    { id: "h6", name: "Bound",   src: null, ...hair(H("M126 46 q22 -6 24 16 q2 20 -16 22 q6 -22 -8 -38z"), H("M67 66 q4 -38 33 -38 q29 0 33 38 q-8 -18 -33 -18 q-25 0 -33 18z")) },
  ];

  /* ---------- placeholder items, one per slot ----------
     A slot's placeholder says WHAT KIND of thing is equipped and where it sits, and nothing more — it
     is deliberately a silhouette rather than an attempt at the object, since a bad drawing of the
     Sutton Hoo helmet is worse than an honest shape. The artefact's own name is on the slot beside it,
     and its real photograph is one press away in the plate. */
  const ITEM_SVG = {
    /* THE HEAD PLACEHOLDER COVERS THE CROWN AND STOPS ABOVE THE EYES. A silhouette drawn over the whole
       head reads as a mask rather than as a helmet, and it takes the face away — which on the one
       drawing a reader has made their own is the difference between wearing something and being
       replaced by it. The cheek pieces stop at the brow line for the same reason. */
    head: '<svg viewBox="0 0 100 100" class="avs-svg"><path d="M20 60 q0 -42 30 -42 q30 0 30 42 q-7 5 -12 1 l-2 -11 q-16 7 -32 0 l-2 11 q-5 4 -12 -1z" fill="var(--avs-item)" stroke="#2B2620" stroke-width="3" stroke-linejoin="round"/></svg>',
    body: '<svg viewBox="0 0 100 100" class="avs-svg"><path d="M22 20 q28 -12 56 0 l6 30 -10 6 -2 34 h-44 l-2 -34 -10 -6z" fill="var(--avs-item)" stroke="#2B2620" stroke-width="3" stroke-linejoin="round"/></svg>',
    jewelry: '<svg viewBox="0 0 100 100" class="avs-svg"><path d="M26 34 q24 26 48 0" fill="none" stroke="var(--avs-item)" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="58" r="9" fill="var(--avs-item)" stroke="#2B2620" stroke-width="3"/></svg>',
    hand: '<svg viewBox="0 0 100 100" class="avs-svg"><path d="M46 8 h8 v58 h-8z" fill="var(--avs-item)" stroke="#2B2620" stroke-width="3"/><path d="M32 66 h36 v7 h-36z" fill="#2B2620"/><path d="M46 73 h8 v20 h-8z" fill="#6B5B45"/></svg>',
    object: '<svg viewBox="0 0 100 100" class="avs-svg"><path d="M28 84 h44 l-6 -50 h-32z" fill="var(--avs-item)" stroke="#2B2620" stroke-width="3" stroke-linejoin="round"/><path d="M34 34 q16 -14 32 0" fill="none" stroke="#2B2620" stroke-width="3"/></svg>',
  };

  /* ---------- the scenes ----------
     `anchors` are percentages: `figure` of the scene box, `object` of the scene box, and the four worn
     slots of the FIGURE box. `object` is where the display object stands — the altar, the desk — which
     is drawn as part of the backdrop, so the anchor is the surface an artefact is set down on. */
  /* Percentages of the FIGURE box (200 × 400), each the CENTRE of a square item. `head` sits high
     enough that a helmet crowns the head instead of covering the face; `hand` sits where the drawn
     arms end, so a carried thing hangs from the hand rather than beside the hip. */
  const FIG_SLOTS = { head: { x: 50, y: 12.5, w: 42 }, body: { x: 50, y: 44, w: 60 }, jewelry: { x: 50, y: 30, w: 24 }, hand: { x: 25, y: 53, w: 30 } };

  const studySVG =
    '<svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" class="avs-svg">' +
      '<rect width="600" height="400" fill="#E8DFCC"/>' +
      '<rect y="300" width="600" height="100" fill="#B99C74"/>' +
      '<path d="M0 300 h600 v6 h-600z" fill="#8A6A44" opacity=".5"/>' +
      // shelves behind
      '<rect x="40" y="60" width="230" height="8" fill="#8A6A44"/><rect x="40" y="150" width="230" height="8" fill="#8A6A44"/>' +
      '<g fill="#7C5B3A">' +
        '<rect x="52" y="20" width="14" height="40"/><rect x="70" y="26" width="10" height="34"/><rect x="84" y="16" width="16" height="44"/>' +
        '<rect x="106" y="28" width="12" height="32"/><rect x="124" y="22" width="14" height="38"/>' +
        '<rect x="52" y="112" width="12" height="38"/><rect x="68" y="118" width="16" height="32"/><rect x="88" y="108" width="12" height="42"/>' +
      '</g>' +
      // window with light
      '<rect x="400" y="46" width="150" height="130" rx="8" fill="#CFE0E4" stroke="#8A6A44" stroke-width="8"/>' +
      '<path d="M475 46 v130 M400 111 h150" stroke="#8A6A44" stroke-width="6"/>' +
      // the desk — the display object
      '<path d="M96 258 h188 v18 h-188z" fill="#9C7448"/>' +
      '<path d="M110 276 h14 v58 h-14z M256 276 h14 v58 h-14z" fill="#7C5B3A"/>' +
    "</svg>";

  const romeSVG =
    '<svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" class="avs-svg">' +
      '<defs><linearGradient id="avsRomeSky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#BBD6E0"/><stop offset="1" stop-color="#F0DCC0"/></linearGradient></defs>' +
      '<rect width="600" height="400" fill="url(#avsRomeSky)"/>' +
      // distant hills
      '<path d="M0 250 q90 -46 190 -10 q80 -40 170 -4 q100 -34 240 4 v160 h-600z" fill="#B7B08C"/>' +
      // floor
      '<rect y="300" width="600" height="100" fill="#D9CEB4"/>' +
      '<path d="M0 300 h600 v7 h-600z" fill="#B6A886"/>' +
      '<g stroke="#C3B79A" stroke-width="4">' +
        '<path d="M0 330 h600 M0 362 h600 M80 300 v100 M230 300 v100 M380 300 v100 M520 300 v100"/></g>' +
      // colonnade
      '<g fill="#EDE4D2" stroke="#B6A886" stroke-width="3">' +
        '<path d="M336 100 h40 v200 h-40z"/><path d="M328 92 h56 v14 h-56z"/><path d="M328 294 h56 v12 h-56z"/>' +
        '<path d="M446 108 h34 v192 h-34z"/><path d="M438 100 h50 v12 h-50z"/><path d="M438 294 h50 v12 h-50z"/>' +
        '<path d="M534 116 h30 v184 h-30z"/><path d="M528 108 h42 v12 h-42z"/><path d="M528 294 h42 v12 h-42z"/>' +
      '</g>' +
      '<g stroke="#D6C9AC" stroke-width="3" opacity=".8">' +
        '<path d="M344 106 v188 M356 106 v188 M368 106 v188 M454 112 v182 M466 112 v182 M542 120 v180 M554 120 v180"/></g>' +
      // entablature over the colonnade
      '<path d="M318 62 h282 v34 h-282z" fill="#F3EBDB" stroke="#B6A886" stroke-width="3"/>' +
      // the altar — the display object
      '<path d="M104 256 h176 v22 h-176z" fill="#EDE4D2" stroke="#B6A886" stroke-width="3"/>' +
      '<path d="M126 278 h132 v52 h-132z" fill="#E4D9C0" stroke="#B6A886" stroke-width="3"/>' +
      '<path d="M110 330 h164 v14 h-164z" fill="#EDE4D2" stroke="#B6A886" stroke-width="3"/>' +
      '<path d="M140 292 q26 -16 52 0 q-26 -6 -52 0z" fill="#C9B48A" opacity=".7"/>' +
    "</svg>";

  const SCENES = [
    {
      id: "study", name: "The study", rarity: "common", free: true,
      blurb: "A working room of shelves and daylight, with a desk to set a find down on.",
      src: null, svg: studySVG,
      anchors: { figure: { x: 63, bottom: 4, h: 84 }, object: { x: 31.5, y: 64.5, w: 15 }, slots: FIG_SLOTS },
    },
    {
      id: "rome", name: "Ancient Rome", rarity: "rare",
      blurb: "A colonnade above the hills, and an altar of dressed stone for what you have found.",
      src: null, svg: romeSVG,
      anchors: { figure: { x: 66, bottom: 4, h: 82 }, object: { x: 32, y: 64, w: 15 }, slots: FIG_SLOTS },
    },
  ];

  window.AVATAR_ART = {
    version: 1,
    base: "avatar/",
    skins: SKINS,
    hairColors: HAIR_COLORS,
    builds: BUILDS,
    faces: FACES,
    hair: HAIR,
    scenes: SCENES,
    itemSVG: ITEM_SVG,
    /* Per-artefact sprites, once they exist: id → { src, mask? } for the WORN form of that artefact.
       An artefact with no entry falls back to its slot's placeholder silhouette on the body, and to its
       own photograph on the display object — which is the right answer there anyway, an altar being a
       place a real object is set down rather than a costume. */
    items: {},
  };
})();
