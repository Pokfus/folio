/* atlas-gl.js — Atlas v2's WebGL2 renderer (docs/atlas-v2-design.md §2.2).

   Four primitives and nothing else: the sphere, faces, arcs, and an ID pass over the last two. Every
   vertex is uploaded ONCE as a unit vector on the sphere; a frame changes only uniforms (a 3×3
   rotation, a radius in pixels, a centre), so dragging the globe costs the GPU the same as a still
   frame and the CPU almost nothing. The horizon is a per-fragment `z < 0 → discard`: exact and free.

     const R = AtlasGL.create(canvas, { antialias })   null when WebGL2 is unavailable (the caller shows a sentence)
     R.setLevel(level, data)                    one resident LOD's arrays from the worker, kept for context loss
     R.setTile(key, data) / R.dropTile(key)     one tile's arrays (Phase 1a), the same shape as a level
     R.setPalette({ ocean, land, coast, border, admin1, rim, halo, grat, selected })   CSS hex colours or [r,g,b]
     R.resize(cssW, cssH, dpr)
     R.render(view)                             view = { rot: Float32Array(9) row-major, radius, cx, cy (CSS px),
                                                         level (0–4), graticule, admin1 (bool),
                                                         tiles: [keys at the level], parents: [keys at level−1] }
     R.pick(view, x, y)                         → { face } | { arc } | null, from a 1×1 ID pass at (x, y)
     R.stats()                                  → { triangles, segments, draws, tilesDrawn, … } of the last frame
     R.dispose()

   PASSES, per frame (§2.2 "the draw list", as built — measured in Phase 0 on the CI runner's software
   GL, see §7 "as built"):
     1. sphere   one full-screen triangle, scissored to the disc's bounding box; the fragment shader
                 finds the ray–sphere hit, paints ocean with limb darkening, an anti-aliased rim, a soft
                 halo outside, and the graticule when asked (lon/lat from the inverse rotation).
     2. faces    drawElements over the level's triangles, a per-vertex face id selecting the fill from
                 a style texture (a selection recolours one texel, not a buffer). NOT instanced, and
                 drawn only for the BUCKETS the view can see (below).
     3. arcs     ONE TRIANGLE PER SEGMENT, pulled from a float texture by gl_VertexID (no attributes,
                 no instancing: SwiftShader spends ~25 µs per instance, which made the design's
                 instanced quads a 0.9 s frame at globe scale). The vertex shader builds a triangle
                 that covers the segment's capsule; the fragment shader shades by distance to the
                 segment, with the horizon from the interpolated z. Coast, border and admin-1 differ
                 by width and colour; a DISPUTED line is dashed; admin-1 is drawn only when asked.
     ID pass     passes 2–3 again with ids as colours into a 1×1 framebuffer whose viewport is shifted
                 so the pixel under the pointer lands at (0,0); one readPixels. No point-in-polygon code.

   TILES (Phase 1a, §2.3). Past the resident levels the view is covered by tiles, each uploaded like a
   level. A frame at a tile level first writes the extents of the LOADED tiles into the STENCIL buffer
   (2 for the level's own tiles, 1 for a loaded parent tile of the level above), then draws the finest
   resident level only where the stencil is 0, the parents only where it is 1, and the level's tiles
   everywhere they cover. So a tile that has not arrived is never a hole — the coarser line shows
   through until it lands — and a loaded tile never shows a second, coarser coastline under its own.
   Faces of all tiles are drawn before the arcs of any, so a neighbour's fill never covers half a
   stroke at a tile edge.

   CULLING. The worker sorts triangles and segments into 384 direction buckets, each with a bounding
   cap. A frame computes the cap of what the viewport can show (the whole near hemisphere when the
   disc fits, a few degrees when zoomed in) and draws only the buckets whose caps touch it, merged
   into contiguous runs — a dozen draw calls, not 384. Software GL pays per triangle rasterised, and
   a zoomed-in view holds a few per cent of the geometry.

   MSAA is OFF by default: on software GL it tripled the face pass for nothing a reader sees, since
   every fill edge is covered by an anti-aliased coast or border line. `antialias: true` turns it on.
   Context loss is handled: every buffer is rebuilt from the arrays this module keeps. A freshly
   uploaded level or tile is drawn once off-screen (one triangle, one segment) so the driver's first-use
   work — SwiftShader's texture conversion was the wheel spike of Phase 0 — happens at upload, not in the
   first frame that needs it.
*/
(function (root) {
  "use strict";

  const VS_SPHERE = `#version 300 es
    precision highp float;
    const vec2 Q[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
    void main() { gl_Position = vec4(Q[gl_VertexID], 0.0, 1.0); }`;
  const FS_SPHERE = `#version 300 es
    precision highp float;
    uniform vec2 uCenter;      // device px, y down
    uniform float uRadius;     // device px
    uniform float uHeight;     // device px
    uniform mat3 uRotT;        // transpose of the view rotation: screen → world
    uniform vec3 uOcean, uRim, uHalo, uGrat;
    uniform float uGratOn, uHaloW;
    out vec4 o;
    void main() {
      vec2 d = (vec2(gl_FragCoord.x, uHeight - gl_FragCoord.y) - uCenter) / uRadius;
      float r2 = dot(d, d);
      float px = 1.0 / uRadius;                 // one device pixel, in disc units
      if (r2 > (1.0 + uHaloW) * (1.0 + uHaloW)) discard;
      float r = sqrt(r2);
      if (r > 1.0) {                              // the halo: a soft glow that fades with the square of the distance
        float t = (r - 1.0) / uHaloW;
        float a = (1.0 - t) * (1.0 - t) * 0.35;
        o = vec4(uHalo * a, a); return;
      }
      float z = sqrt(max(0.0, 1.0 - r2));
      float shade = mix(1.0, 0.70, pow(1.0 - z, 2.2));   // limb darkening
      vec3 c = uOcean * shade;
      if (uGratOn > 0.5) {
        vec3 w = uRotT * vec3(d.x, -d.y, z);      // world unit vector (d.y is down on screen)
        float lon = degrees(atan(w.y, w.x)), lat = degrees(asin(clamp(w.z, -1.0, 1.0)));
        float fl = fwidth(lon), fa = fwidth(lat);
        float gl1 = abs(fract(lon / 15.0 + 0.5) - 0.5) * 15.0, ga = abs(fract(lat / 15.0 + 0.5) - 0.5) * 15.0;
        float line = max(1.0 - smoothstep(0.0, fl * 1.2, gl1), 1.0 - smoothstep(0.0, fa * 1.2, ga));
        if (abs(lat) > 85.0) line = 1.0 - smoothstep(0.0, fa * 1.2, ga);   // meridians converge: only parallels near the poles
        c = mix(c, uGrat, line * 0.35 * z);
      }
      float rim = smoothstep(1.0 - 2.5 * px, 1.0 - 0.5 * px, r);
      c = mix(c, uRim, rim * 0.6);
      float a = 1.0 - smoothstep(1.0 - px, 1.0, r);
      o = vec4(c * a, a);
    }`;

  const VS_FACE = `#version 300 es
    precision highp float;
    in vec3 aPos; in float aFace;
    uniform mat3 uRot; uniform vec2 uCenter, uSize; uniform float uRadius;
    out float vZ; flat out float vFace;
    void main() {
      vec3 p = uRot * aPos;
      vec2 px = uCenter + vec2(p.x, -p.y) * uRadius;
      gl_Position = vec4(px.x / uSize.x * 2.0 - 1.0, 1.0 - px.y / uSize.y * 2.0, 0.0, 1.0);
      vZ = p.z; vFace = aFace;
    }`;
  const FS_FACE = `#version 300 es
    precision highp float;
    in float vZ; flat in float vFace;
    uniform sampler2D uStyle; uniform float uIdPass;
    out vec4 o;
    void main() {
      if (vZ < 0.0) discard;
      int id = int(vFace + 0.5);
      if (uIdPass > 0.5) {
        int v = id + 1;
        o = vec4(float(v & 255) / 255.0, float((v >> 8) & 255) / 255.0, float((v >> 16) & 255) / 255.0, 1.0);
        return;
      }
      vec4 s = texelFetch(uStyle, ivec2(id & 255, id >> 8), 0);
      o = vec4(s.rgb * s.a, s.a);
    }`;
  // the stencil pass: tile extents as triangles on the sphere, colour writes off; only z matters
  const FS_EXTENT = `#version 300 es
    precision highp float;
    in float vZ; flat in float vFace;
    out vec4 o;
    void main() { if (vZ < 0.0) discard; o = vec4(0.0); }`;

  const VS_ARC = `#version 300 es
    precision highp float;
    uniform sampler2D uSeg;          // RGBA32F, two texels per segment: (a.xyz, tag) (b.xyz, 0)
    uniform int uTexW;
    uniform mat3 uRot; uniform vec2 uCenter, uSize; uniform float uRadius;
    uniform vec3 uWidths;            // device px: coast, border, admin-1
    uniform float uAdmin1;           // 1 = draw admin-1 arcs
    flat out vec2 vA; flat out vec2 vB; flat out float vHw; flat out float vKind; flat out float vFlags; flat out float vArc; flat out vec2 vZ;
    void main() {
      int seg = gl_VertexID / 3, k = gl_VertexID - seg * 3, t0 = seg * 2;
      vec4 A = texelFetch(uSeg, ivec2(t0 % uTexW, t0 / uTexW), 0);
      vec4 B = texelFetch(uSeg, ivec2((t0 + 1) % uTexW, (t0 + 1) / uTexW), 0);
      vec3 pa = uRot * A.xyz, pb = uRot * B.xyz;
      vec2 sa = uCenter + vec2(pa.x, -pa.y) * uRadius, sb = uCenter + vec2(pb.x, -pb.y) * uRadius;
      float tag = A.w;
      float kind = mod(tag, 8.0);
      float flags = floor(mod(tag, 64.0) / 8.0);
      float w = kind < 0.5 ? uWidths.x : kind < 4.5 ? uWidths.y : uWidths.z;
      float hw = w * 0.5 + 1.0;                           // a pixel of anti-aliasing margin
      vec2 d = sb - sa; float L = length(d);
      vec2 dir = L > 1e-6 ? d / L : vec2(1.0, 0.0);
      vec2 nrm = vec2(-dir.y, dir.x);
      // one triangle covering the capsule: a base twice the width at one end, an apex twice the length beyond
      vec2 base = sa - dir * hw; float Lt = L + 2.0 * hw;
      vec2 p = k == 0 ? base - nrm * 2.0 * hw : k == 1 ? base + nrm * 2.0 * hw : base + dir * 2.0 * Lt;
      if (pa.z < -0.01 && pb.z < -0.01) p = vec2(-1.0e5);  // wholly behind the horizon: off screen, nothing rasterised
      if (kind > 4.5 && uAdmin1 < 0.5) p = vec2(-1.0e5);   // admin-1 below its zoom threshold: not drawn
      gl_Position = vec4(p.x / uSize.x * 2.0 - 1.0, 1.0 - p.y / uSize.y * 2.0, 0.0, 1.0);
      vA = sa; vB = sb; vHw = w * 0.5; vKind = kind; vFlags = flags; vArc = floor(tag / 64.0); vZ = vec2(pa.z, pb.z);
    }`;
  const FS_ARC = `#version 300 es
    precision highp float;
    flat in vec2 vA; flat in vec2 vB; flat in float vHw; flat in float vKind; flat in float vFlags; flat in float vArc; flat in vec2 vZ;
    uniform float uHeight; uniform vec3 uCoast, uBorder, uAdmin1Col; uniform float uIdPass;
    out vec4 o;
    void main() {
      vec2 p = vec2(gl_FragCoord.x, uHeight - gl_FragCoord.y);
      vec2 ab = vB - vA; float l2 = dot(ab, ab);
      float t = l2 > 0.0 ? clamp(dot(p - vA, ab) / l2, 0.0, 1.0) : 0.0;
      float dist = length(p - (vA + ab * t));
      float z = mix(vZ.x, vZ.y, t);
      if (z < -0.002) discard;
      if (uIdPass > 0.5) {
        if (dist > vHw + 1.0) discard;
        int v = int(vArc + 0.5) + 1048576;                // arcs live above 2^20 in the id space
        o = vec4(float(v & 255) / 255.0, float((v >> 8) & 255) / 255.0, float((v >> 16) & 255) / 255.0, 1.0);
        return;
      }
      float a = 1.0 - smoothstep(vHw - 0.5, vHw + 0.5, dist);
      if (a <= 0.003) discard;
      // a DISPUTED line (one source's own, or a line one source puts on land and the other in water) is dashed: 6 px on, 4 px off
      if (mod(vFlags, 2.0) >= 1.0) { float along = t * sqrt(l2); if (mod(along, 10.0) > 6.0) discard; }
      a *= smoothstep(-0.002, 0.03, z);                   // fade a line into the horizon instead of cutting it
      vec3 c = vKind < 0.5 ? uCoast : vKind < 4.5 ? uBorder : uAdmin1Col;
      o = vec4(c * a, a);
    }`;

  function hex2rgb(h) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(h || "").trim());
    if (!m) return [0.5, 0.5, 0.5];
    const n = parseInt(m[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function compile(gl, vs, fs, name) {
    const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(name + " shader: " + gl.getShaderInfoLog(s)); return s; };
    const p = gl.createProgram();
    gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(name + " link: " + gl.getProgramInfoLog(p));
    const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
    return { p, u };
  }

  const SEG_TEX_W = 4096;
  const D2R = Math.PI / 180;

  // a tile's extent as triangles on the sphere: an n×n grid of the lon/lat rectangle (unit vectors)
  function extentMesh(tile, n) {
    const pos = new Float32Array((n + 1) * (n + 1) * 4), idx = new Uint16Array(n * n * 6);
    let k = 0;
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
      const lon = (tile.lon0 + (tile.lon1 - tile.lon0) * i / n) * D2R, lat = (tile.lat0 + (tile.lat1 - tile.lat0) * j / n) * D2R, c = Math.cos(lat);
      pos[k++] = c * Math.cos(lon); pos[k++] = c * Math.sin(lon); pos[k++] = Math.sin(lat); pos[k++] = 0;
    }
    k = 0;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = j * (n + 1) + i, b = a + 1, c = a + n + 1, d = c + 1; idx[k++] = a; idx[k++] = b; idx[k++] = c; idx[k++] = b; idx[k++] = d; idx[k++] = c; }
    return { pos, idx };
  }

  function create(canvas, opts) {
    opts = opts || {};
    const gl = canvas.getContext("webgl2", { antialias: !!opts.antialias, alpha: true, premultipliedAlpha: true, depth: false, stencil: true, preserveDrawingBuffer: false, powerPreference: "high-performance" });
    if (!gl) return null;
    const levels = {};            // level → { data, gpu }
    const tiles = new Map();      // key → { data, gpu, extent }
    let palette = { ocean: [0.70, 0.92, 1.0], land: [0.9, 0.9, 0.92], coast: [0.55, 0.55, 0.6], border: [0.45, 0.45, 0.5], admin1: [0.6, 0.6, 0.66], rim: [0.5, 0.5, 0.55], halo: [0.6, 0.65, 0.9], grat: [0.2, 0.2, 0.3], selected: [0.95, 0.75, 0.3] };
    let prog = null, styleTex = null, emptyVao = null, idFbo = null, idTex = null, lost = false;
    let faceCount = 0, selected = -1;
    let dpr = 1, W = 0, H = 0;
    const stats = { frames: 0, lastMs: 0, draws: 0, trianglesDrawn: 0, segmentsDrawn: 0, visibleAngle: 0, tilesDrawn: 0, parentsDrawn: 0, level: 0, coreLevel: -1 };
    const debug = { sphere: true, faces: true, arcs: true, cull: true };   // toggles for the perf suite's breakdown; always on in use

    function setup() {
      prog = { sphere: compile(gl, VS_SPHERE, FS_SPHERE, "sphere"), face: compile(gl, VS_FACE, FS_FACE, "face"), extent: compile(gl, VS_FACE, FS_EXTENT, "extent"), arc: compile(gl, VS_ARC, FS_ARC, "arc") };
      emptyVao = gl.createVertexArray();
      styleTex = gl.createTexture();
      idTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, idTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      idFbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, idFbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, idTex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      for (const k of Object.keys(levels)) upload(levels[k]);
      for (const t of tiles.values()) upload(t);
      if (faceCount) buildStyle();
    }
    function upload(Lv) {
      const D = Lv.data, g = Lv.gpu = {};
      // faces: a VAO with positions + face id, an index buffer sorted by bucket
      g.vaoFace = gl.createVertexArray(); gl.bindVertexArray(g.vaoFace);
      g.facePos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, g.facePos); gl.bufferData(gl.ARRAY_BUFFER, D.facePos, gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(prog.face.p, "aPos"), aFace = gl.getAttribLocation(prog.face.p, "aFace");
      gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(aFace); gl.vertexAttribPointer(aFace, 1, gl.FLOAT, false, 16, 12);
      g.faceIdx = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.faceIdx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, D.faceIdx, gl.STATIC_DRAW);
      g.faceCount = D.faceIdx.length;
      gl.bindVertexArray(null);
      // segments: a float texture, two texels per segment, pulled by gl_VertexID
      const n = D.segs.length / 8, texels = n * 2, rows = Math.max(1, Math.ceil(texels / SEG_TEX_W));
      let data = D.segs;
      if (data.length !== SEG_TEX_W * rows * 4) { data = new Float32Array(SEG_TEX_W * rows * 4); data.set(D.segs); }
      g.segTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, g.segTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, SEG_TEX_W, rows, 0, gl.RGBA, gl.FLOAT, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      g.segCount = n;
      // a tile's extent, for the stencil
      if (Lv.tile) {
        const m = extentMesh(Lv.tile, Lv.tile.z >= 4 ? 4 : 8);
        g.vaoExt = gl.createVertexArray(); gl.bindVertexArray(g.vaoExt);
        g.extPos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, g.extPos); gl.bufferData(gl.ARRAY_BUFFER, m.pos, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(aFace); gl.vertexAttribPointer(aFace, 1, gl.FLOAT, false, 16, 12);
        g.extIdx = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.extIdx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.idx, gl.STATIC_DRAW);
        g.extCount = m.idx.length;
        gl.bindVertexArray(null);
      }
      warm(Lv);
    }
    /* the first draw with a new texture or buffer is where a software driver converts it; one tiny
       draw into the ID framebuffer at upload pays that outside any gesture (the wheel spike of Phase 0) */
    function warm(Lv) {
      const g = Lv.gpu;
      gl.bindFramebuffer(gl.FRAMEBUFFER, idFbo); gl.viewport(0, 0, 1, 1); gl.disable(gl.SCISSOR_TEST); gl.disable(gl.STENCIL_TEST);
      if (g.faceCount) { const P = prog.face; gl.useProgram(P.p); gl.uniformMatrix3fv(P.u.uRot, false, IDENT); gl.uniform2f(P.u.uCenter, 0, 0); gl.uniform2f(P.u.uSize, 1, 1); gl.uniform1f(P.u.uRadius, 0.0001); gl.uniform1f(P.u.uIdPass, 1); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, styleTex); gl.uniform1i(P.u.uStyle, 0); gl.bindVertexArray(g.vaoFace); gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_INT, 0); gl.bindVertexArray(null); }
      if (g.segCount) { const P = prog.arc; gl.useProgram(P.p); gl.uniformMatrix3fv(P.u.uRot, false, IDENT); gl.uniform2f(P.u.uCenter, 0, 0); gl.uniform2f(P.u.uSize, 1, 1); gl.uniform1f(P.u.uRadius, 0.0001); gl.uniform1f(P.u.uHeight, 1); gl.uniform3f(P.u.uWidths, 1, 1, 1); gl.uniform1f(P.u.uAdmin1, 1); gl.uniform1f(P.u.uIdPass, 1); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, g.segTex); gl.uniform1i(P.u.uSeg, 1); gl.uniform1i(P.u.uTexW, SEG_TEX_W); gl.bindVertexArray(emptyVao); gl.drawArrays(gl.TRIANGLES, 0, 3); }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    const IDENT = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    function buildStyle() {
      const styleH = Math.max(1, Math.ceil(faceCount / 256));
      const px = new Uint8Array(256 * styleH * 4);
      const land = palette.land, sel = palette.selected;
      for (let i = 0; i < faceCount; i++) {
        const c = i === selected ? sel : land;
        px[4 * i] = c[0] * 255; px[4 * i + 1] = c[1] * 255; px[4 * i + 2] = c[2] * 255; px[4 * i + 3] = 255;
      }
      gl.bindTexture(gl.TEXTURE_2D, styleTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, styleH, 0, gl.RGBA, gl.UNSIGNED_BYTE, px);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    function release(Lv) {
      const g = Lv.gpu; if (!g) return;
      for (const k of ["facePos", "faceIdx", "extPos", "extIdx"]) if (g[k]) gl.deleteBuffer(g[k]);
      for (const k of ["vaoFace", "vaoExt"]) if (g[k]) gl.deleteVertexArray(g[k]);
      if (g.segTex) gl.deleteTexture(g.segTex);
      Lv.gpu = null;
    }

    canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); lost = true; }, false);
    canvas.addEventListener("webglcontextrestored", () => { lost = false; setup(); }, false);
    setup();

    // the resident level to draw: the one asked for, else the finest uploaded below it, else the coarsest above
    function pickLevel(want) {
      for (let l = Math.min(want, 2); l >= 0; l--) if (levels[l] && levels[l].gpu) return levels[l];
      for (let l = want + 1; l < 8; l++) if (levels[l] && levels[l].gpu) return levels[l];
      return null;
    }

    /* which buckets can be on screen: the cap of the visible part of the disc, against each bucket's cap */
    function visibleRuns(range, cap, rot, radius, cx, cy, margin) {
      const n = range.length / 2;
      const runs = [];
      if (!debug.cull) { let s = -1, e = 0; for (let b = 0; b < n; b++) { if (!range[2 * b + 1]) continue; if (s < 0) s = range[2 * b]; e = range[2 * b] + range[2 * b + 1]; } if (s >= 0) runs.push([s, e - s]); return runs; }
      const fx = rot[6], fy = rot[7], fz = rot[8];
      // the farthest viewport corner from the disc centre decides how much of the near hemisphere shows
      const dmax = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy));
      const rho = (dmax >= radius ? Math.PI / 2 : Math.asin(dmax / radius)) + (margin == null ? 0.01 : margin);   // a bucket's cap already spans every vertex of its items; the margin covers float error
      stats.visibleAngle = rho;
      let s = -1, e = 0;
      for (let b = 0; b < n; b++) {
        const count = range[2 * b + 1];
        if (!count) continue;
        const d = Math.max(-1, Math.min(1, cap[4 * b] * fx + cap[4 * b + 1] * fy + cap[4 * b + 2] * fz));
        const vis = Math.acos(d) - cap[4 * b + 3] <= rho;
        if (!vis) { if (s >= 0) { runs.push([s, e - s]); s = -1; } continue; }
        const start = range[2 * b];
        if (s >= 0 && start === e) e = start + count;
        else { if (s >= 0) runs.push([s, e - s]); s = start; e = start + count; }
      }
      if (s >= 0) runs.push([s, e - s]);
      return runs;
    }

    function drawFaces(Lv, view, idPass, R) {
      const rot = view.rot, cx = view.cx * dpr, cy = view.cy * dpr, radius = view.radius * dpr;
      const D = Lv.data, g = Lv.gpu;
      const P = prog.face; gl.useProgram(P.p);
      gl.uniformMatrix3fv(P.u.uRot, false, R);   // GLSL is column-major: the transpose of a row-major matrix
      gl.uniform2f(P.u.uCenter, cx, cy); gl.uniform2f(P.u.uSize, W, H); gl.uniform1f(P.u.uRadius, radius);
      gl.uniform1f(P.u.uIdPass, idPass ? 1 : 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, styleTex); gl.uniform1i(P.u.uStyle, 0);
      gl.bindVertexArray(g.vaoFace);
      for (const [start, count] of visibleRuns(D.faceRange, D.faceCap, rot, radius, cx, cy, Lv.tile ? 0.002 : 0.01)) { gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, start * 4); stats.draws++; stats.trianglesDrawn += count / 3; }
      gl.bindVertexArray(null);
    }
    function drawArcs(Lv, view, idPass, R) {
      const rot = view.rot, cx = view.cx * dpr, cy = view.cy * dpr, radius = view.radius * dpr;
      const D = Lv.data, g = Lv.gpu;
      const P = prog.arc; gl.useProgram(P.p);
      gl.uniformMatrix3fv(P.u.uRot, false, R);
      gl.uniform2f(P.u.uCenter, cx, cy); gl.uniform2f(P.u.uSize, W, H); gl.uniform1f(P.u.uRadius, radius); gl.uniform1f(P.u.uHeight, H);
      gl.uniform3f(P.u.uWidths, 1.0 * dpr, 0.9 * dpr, 0.6 * dpr);
      gl.uniform1f(P.u.uAdmin1, view.admin1 ? 1 : 0);
      gl.uniform3fv(P.u.uCoast, palette.coast); gl.uniform3fv(P.u.uBorder, palette.border); gl.uniform3fv(P.u.uAdmin1Col, palette.admin1);
      gl.uniform1f(P.u.uIdPass, idPass ? 1 : 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, g.segTex); gl.uniform1i(P.u.uSeg, 1); gl.uniform1i(P.u.uTexW, SEG_TEX_W);
      gl.bindVertexArray(emptyVao);
      for (const [start, count] of visibleRuns(D.segRange, D.segCap, rot, radius, cx, cy, Lv.tile ? 0.002 : 0.01)) { gl.drawArrays(gl.TRIANGLES, start * 3, count * 3); stats.draws++; stats.segmentsDrawn += count; }
    }
    function drawExtents(list, view, R, ref) {
      const cx = view.cx * dpr, cy = view.cy * dpr, radius = view.radius * dpr;
      const P = prog.extent; gl.useProgram(P.p);
      gl.uniformMatrix3fv(P.u.uRot, false, R);
      gl.uniform2f(P.u.uCenter, cx, cy); gl.uniform2f(P.u.uSize, W, H); gl.uniform1f(P.u.uRadius, radius);
      gl.colorMask(false, false, false, false);
      gl.stencilFunc(gl.ALWAYS, ref, 0xff); gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
      for (const t of list) { gl.bindVertexArray(t.gpu.vaoExt); gl.drawElements(gl.TRIANGLES, t.gpu.extCount, gl.UNSIGNED_SHORT, 0); stats.draws++; }
      gl.bindVertexArray(null);
      gl.colorMask(true, true, true, true);
    }

    function drawScene(view, idPass) {
      const rot = view.rot, cx = view.cx * dpr, cy = view.cy * dpr, radius = view.radius * dpr;
      if (!idPass && debug.sphere) {
        const P = prog.sphere; gl.useProgram(P.p);
        gl.bindVertexArray(emptyVao);
        gl.uniform2f(P.u.uCenter, cx, cy); gl.uniform1f(P.u.uRadius, radius); gl.uniform1f(P.u.uHeight, H);
        gl.uniformMatrix3fv(P.u.uRotT, false, rot);   // a row-major R read column-major IS its transpose
        gl.uniform3fv(P.u.uOcean, palette.ocean); gl.uniform3fv(P.u.uRim, palette.rim); gl.uniform3fv(P.u.uHalo, palette.halo); gl.uniform3fv(P.u.uGrat, palette.grat);
        gl.uniform1f(P.u.uGratOn, view.graticule ? 1 : 0); gl.uniform1f(P.u.uHaloW, 0.06);
        gl.drawArrays(gl.TRIANGLES, 0, 3); stats.draws++;
      }
      const R = transposed(rot);
      const Lv = pickLevel(view.level);
      stats.coreLevel = Lv ? Object.keys(levels).find((k) => levels[k] === Lv) | 0 : -1;
      const own = [], parents = [];
      let complete = false;
      if (view.level >= 3) {
        for (const k of view.tiles || []) { const t = tiles.get(k); if (t && t.gpu) own.push(t); }
        complete = own.length === (view.tiles || []).length;   // every tile the view wants is here: nothing coarser is needed anywhere
        if (!complete) for (const k of view.parents || []) { const t = tiles.get(k); if (t && t.gpu) parents.push(t); }
      }
      stats.tilesDrawn = own.length; stats.parentsDrawn = parents.length; stats.complete = complete;
      const useStencil = !complete && (own.length || parents.length);
      if (useStencil) {
        gl.enable(gl.STENCIL_TEST);
        gl.clearStencil(0); gl.stencilMask(0xff); gl.clear(gl.STENCIL_BUFFER_BIT);
        if (parents.length) drawExtents(parents, view, R, 1);
        if (own.length) drawExtents(own, view, R, 2);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
      }
      // the resident level where no tile covers; the parents where only they do; the level's tiles over all
      if (Lv && !complete) {
        if (useStencil) gl.stencilFunc(gl.EQUAL, 0, 0xff);
        if (debug.faces) drawFaces(Lv, view, idPass, R);
        if (debug.arcs) drawArcs(Lv, view, idPass, R);
      }
      if (parents.length) {
        gl.stencilFunc(gl.EQUAL, 1, 0xff);
        if (debug.faces) for (const t of parents) drawFaces(t, view, idPass, R);
        if (debug.arcs) for (const t of parents) drawArcs(t, view, idPass, R);
      }
      if (own.length) {
        if (useStencil) gl.stencilFunc(gl.EQUAL, 2, 0xff);
        if (debug.faces) for (const t of own) drawFaces(t, view, idPass, R);
        if (debug.arcs) for (const t of own) drawArcs(t, view, idPass, R);
      }
      if (useStencil) gl.disable(gl.STENCIL_TEST);
    }
    const _t = new Float32Array(9);
    function transposed(m) { _t[0] = m[0]; _t[1] = m[3]; _t[2] = m[6]; _t[3] = m[1]; _t[4] = m[4]; _t[5] = m[7]; _t[6] = m[2]; _t[7] = m[5]; _t[8] = m[8]; return _t; }

    return {
      gl, debug,
      get lost() { return lost; },
      levelLoaded(l) { return !!(levels[l] && levels[l].gpu); },
      levelData(l) { return levels[l] ? levels[l].data : null; },
      setLevel(level, data) {
        levels[level] = { data };
        if (!lost) upload(levels[level]);
      },
      setTile(key, data, tile) {
        if (tiles.has(key)) release(tiles.get(key));
        const t = { data, tile };
        tiles.set(key, t);
        if (!lost) upload(t);
      },
      dropTile(key) { const t = tiles.get(key); if (!t) return; release(t); tiles.delete(key); },
      tileLoaded(key) { const t = tiles.get(key); return !!(t && t.gpu); },
      tileCount() { return tiles.size; },
      setFaceCount(n) { faceCount = n; if (!lost) buildStyle(); },
      setPalette(p) {
        for (const k of Object.keys(p)) palette[k] = typeof p[k] === "string" ? hex2rgb(p[k]) : p[k];
        if (faceCount && !lost) buildStyle();
      },
      select(face) { selected = face == null ? -1 : face; if (faceCount && !lost) buildStyle(); },
      resize(cssW, cssH, ratio) {
        dpr = Math.min(2, ratio || 1);
        W = Math.max(1, Math.round(cssW * dpr)); H = Math.max(1, Math.round(cssH * dpr));
        if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      },
      render(view) {
        if (lost) return;
        const t0 = performance.now();
        stats.draws = 0; stats.trianglesDrawn = 0; stats.segmentsDrawn = 0; stats.level = view.level;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, W, H);
        gl.disable(gl.SCISSOR_TEST); gl.disable(gl.STENCIL_TEST);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        // scissor to the disc + halo, so software GL shades nothing it will discard
        const r = view.radius * dpr * 1.07, cx = view.cx * dpr, cy = view.cy * dpr;
        const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(W, Math.ceil(cx + r)), yTop = Math.max(0, Math.floor(cy - r)), yBot = Math.min(H, Math.ceil(cy + r));
        if (x1 <= x0 || yBot <= yTop) return;
        gl.enable(gl.SCISSOR_TEST); gl.scissor(x0, H - yBot, x1 - x0, yBot - yTop);
        drawScene(view, false);
        gl.disable(gl.SCISSOR_TEST);
        stats.frames++; stats.lastMs = performance.now() - t0;
      },
      pick(view, x, y) {
        if (lost) return null;
        const px = Math.round(x * dpr), py = Math.round(y * dpr);
        if (px < 0 || py < 0 || px >= W || py >= H) return null;
        gl.bindFramebuffer(gl.FRAMEBUFFER, idFbo);
        // shift the viewport so device pixel (px, py) — y down — lands on the 1×1 target's (0,0)
        gl.viewport(-px, -(H - 1 - py), W, H);
        gl.disable(gl.SCISSOR_TEST);
        gl.disable(gl.BLEND);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        const save = { tiles: view.tiles, parents: view.parents };
        view.tiles = []; view.parents = [];   // the ID pass reads the resident level: faces are the same ids, and the 1×1 target has no stencil
        drawScene(view, true);
        view.tiles = save.tiles; view.parents = save.parents;
        const out = new Uint8Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, out);
        gl.enable(gl.BLEND);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        const id = out[0] + (out[1] << 8) + (out[2] << 16);
        if (!id) return null;
        if (id > 1048576) return { arc: id - 1048576 - 1 };
        return { face: id - 1 };
      },
      stats() { return { triangles: stats.trianglesDrawn, segments: stats.segmentsDrawn, draws: stats.draws, level: stats.level, coreLevel: stats.coreLevel, tilesDrawn: stats.tilesDrawn, parentsDrawn: stats.parentsDrawn, complete: !!stats.complete, tilesResident: tiles.size, lastMs: stats.lastMs, frames: stats.frames, visibleAngle: stats.visibleAngle }; },
      rawStats: stats,
      dispose() {
        try { const ext = gl.getExtension("WEBGL_lose_context"); if (ext) ext.loseContext(); } catch (e) {}
      },
    };
  }

  root.AtlasGL = { create, hex2rgb };
})(typeof window !== "undefined" ? window : globalThis);
