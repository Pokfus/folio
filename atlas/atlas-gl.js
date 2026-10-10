/* atlas-gl.js — Atlas v2's WebGL2 renderer (docs/atlas-v2-design.md §2.2, §2.7).

   Four primitives and nothing else: the sphere, faces, arcs, and an ID pass over the last two. Every
   vertex is uploaded ONCE as a unit vector on the sphere; a frame changes only uniforms (a 3×3
   rotation, a radius in pixels, a centre), so dragging the globe costs the GPU the same as a still
   frame and the CPU almost nothing. The horizon is a per-fragment `z < 0 → discard`: exact and free.

     const R = AtlasGL.create(canvas, { antialias })   null when WebGL2 is unavailable (the caller shows a sentence)
     R.setLevel(level, data)                    one resident LOD's arrays from the worker, kept for context loss
     R.setTile(key, data) / R.dropTile(key)     one tile's arrays (Phase 1a), the same shape as a level
     R.setWaterLevel(level, data)               one resident WATER level (Phase 1b): lake shores, rivers (raw and
                                                smoothed), lake fills — drawn over the land, under the borders
     R.setWaterTile(key, data, tile) / R.dropWaterTile(key)
     R.setRelief(key, { w, h, rgb, tile })      one relief texture (Phase 1b): "0" is the resident L0 sheet, "1:x-y"
                                                an L1 tile drawn as a patch on the sphere
     R.setRamp(bytes)                           the 256-texel hypsometric ramp, RGB, built from the theme's tokens
     R.setPalette({ ocean, land, coast, border, admin1, river, lake, lakeShore, rim, halo, grat, selected })
     R.resize(cssW, cssH, dpr)
     R.render(view)                             view = { rot: Float32Array(9) row-major, radius, cx, cy (CSS px),
                                                         level (0–4), graticule, admin1, rivers, lakes (bool),
                                                         tiles: [keys at the level], parents: [keys at level−1],
                                                         waterTiles: [keys], smoothRivers (bool),
                                                         relief: { on, strength, fade, tiles: [keys] } }
     R.pick(view, x, y)                         → { face } | { arc } | null, from a 1×1 ID pass at (x, y)
     R.stats()                                  → { triangles, segments, draws, riverSegments, lakeSegments, lakeTriangles, … }
     R.dispose()

   PASSES, per frame (§2.2 "the draw list", as built — measured in Phase 0 on the CI runner's software
   GL, see §7 "as built"):
     1. sphere   a quad around the disc; the fragment shader finds the ray–sphere hit, paints ocean
                 with limb darkening, an anti-aliased rim, a soft halo outside, the graticule when asked,
                 and — relief on — the BATHYMETRY tint from the resident L0 relief sheet (height clamped
                 at or below zero: a sea pixel is never tinted as land).
     1b. relief sea patches: each bound L1 tile drawn as a lon/lat mesh on the sphere, the same sea
                 tint from the finer texture, opaque over the L0 result — before the faces, so land covers it.
     2. faces    drawElements over the level's triangles, a per-vertex face id selecting the fill from
                 a style texture (a selection recolours one texel, not a buffer). NOT instanced, and
                 drawn only for the BUCKETS the view can see (below). With relief on, every face writes
                 the LAND bit of the stencil: that is the mask §2.7 asks for.
     2b. relief land: the L1 patches then the L0 sheet, only where the LAND bit is set (so the OSM coast
                 always wins over ETOPO's), height clamped at or above zero, hypsometric tint × hillshade,
                 blended at the reader's strength × the zoom fade; an L1 patch sets the PATCH bit so the
                 L0 pass does not shade the same pixel twice.
     3. water    rivers (the smoothed list past the resident zooms), then lake fills, then lake shores:
                 over the country fills, under the borders. Where a WATER tile covers (its extent in the
                 stencil), the tile's lakes; elsewhere the resident level's.
     4. arcs     ONE TRIANGLE PER SEGMENT, pulled from a float texture by gl_VertexID (no attributes,
                 no instancing: SwiftShader spends ~25 µs per instance, which made the design's
                 instanced quads a 0.9 s frame at globe scale). The vertex shader builds a triangle
                 that covers the segment's capsule; the fragment shader shades by distance to the
                 segment, with the horizon from the interpolated z. Width and colour per KIND (coast,
                 border, river, lake shore, admin-1); a DISPUTED border or an INTERMITTENT river is dashed.
     ID pass     passes 2 and 4 again with ids as colours into a 1×1 framebuffer whose viewport is shifted
                 so the pixel under the pointer lands at (0,0); one readPixels. No point-in-polygon code.

   THE STENCIL, one byte per pixel, cleared every frame:
     bits 0–1  land tile coverage at a tile zoom: 1 = a loaded parent tile, 2 = a loaded tile of the level
     bit 2     a loaded water tile covers this pixel
     bit 3     an L1 relief patch shaded this land pixel
     bit 4     a land face was drawn here (the land/sea mask for relief)
   A pass tests only the bits it is about (the mask argument), so the passes do not disturb each other.

   TILES (Phase 1a, §2.3). Past the resident levels the view is covered by tiles, each uploaded like a
   level. A frame at a tile level first writes the extents of the LOADED tiles into the stencil, then
   draws the finest resident level only where no tile covers, the parents only where only they do, and
   the level's tiles everywhere they cover. So a tile that has not arrived is never a hole — the coarser
   line shows through until it lands — and a loaded tile never shows a second, coarser coastline under
   its own. Faces of all tiles are drawn before the arcs of any, so a neighbour's fill never covers half
   a stroke at a tile edge. Water tiles follow the same rule with their own bit.

   CULLING. The worker sorts triangles and segments into 1536 direction buckets, each with a bounding
   cap. A frame computes the cap of what the viewport can show (the whole near hemisphere when the
   disc fits, a few degrees when zoomed in) and draws only the buckets whose caps touch it, merged
   into contiguous runs (small hidden gaps included) — a few dozen draw calls, not 1536. Software GL
   pays per triangle rasterised, and a zoomed-in view holds a few per cent of the geometry.

   MSAA is OFF by default: on software GL it tripled the face pass for nothing a reader sees, since
   every fill edge is covered by an anti-aliased coast or border line. `antialias: true` turns it on.
   Context loss is handled: every buffer and texture is rebuilt from the arrays this module keeps. A
   freshly uploaded level or tile is drawn once off-screen (one triangle, one segment) so the driver's
   first-use work — SwiftShader's texture conversion was the wheel spike of Phase 0 — happens at upload,
   not in the first frame that needs it.

   RELIEF TEXTURES are RGB8: R = hillshade, G·256 + B − 32768 = height in metres (16 bits). Sampling is
   four NEAREST taps and a bilinear blend of the DECODED height — a linear filter over the two bytes
   separately would mix a high byte with a neighbour's low byte at every carry.
*/
(function (root) {
  "use strict";

  const GLSL_RELIEF = `
    uniform sampler2D uRelief; uniform vec2 uReliefSize;
    // (height in metres, hillshade 0–1) at a texture coordinate, bilinear over four decoded taps; x wraps
    uniform float uWrap;             // 1 for the whole-world L0 sheet, 0 for a patch
    vec2 reliefAt(vec2 uv) {
      vec2 f = uv * uReliefSize - 0.5;
      vec2 i0 = floor(f); vec2 fr = f - i0;
      int w = int(uReliefSize.x), h = int(uReliefSize.y);
      int x0 = int(i0.x), y0 = int(i0.y);
      int x1 = x0 + 1;
      // the L0 sheet wraps at 180°; a patch does NOT — wrapped, its last half texel blended with its first column and
      // every patch edge showed as a faint dotted meridian (seen at 0° on a phone's Europe view, Oct 2026)
      if (uWrap > 0.5) { x0 = ((x0 % w) + w) % w; x1 = ((x1 % w) + w) % w; } else { x0 = clamp(x0, 0, w - 1); x1 = clamp(x1, 0, w - 1); }
      int y1 = clamp(y0 + 1, 0, h - 1); y0 = clamp(y0, 0, h - 1);
      vec3 a = texelFetch(uRelief, ivec2(x0, y0), 0).rgb, b = texelFetch(uRelief, ivec2(x1, y0), 0).rgb;
      vec3 c = texelFetch(uRelief, ivec2(x0, y1), 0).rgb, d = texelFetch(uRelief, ivec2(x1, y1), 0).rgb;
      vec4 hs = vec4(a.g * 65280.0 + a.b * 255.0, b.g * 65280.0 + b.b * 255.0, c.g * 65280.0 + c.b * 255.0, d.g * 65280.0 + d.b * 255.0) - 32768.0;
      vec4 sh = vec4(a.r, b.r, c.r, d.r);
      vec2 top = mix(vec2(hs.x, sh.x), vec2(hs.y, sh.y), fr.x), bot = mix(vec2(hs.z, sh.z), vec2(hs.w, sh.w), fr.x);
      return mix(top, bot, fr.y);
    }
    // equirectangular coordinates of a world unit vector over the whole sphere (the L0 sheet's ray path)
    vec2 worldUV(vec3 w) {
      float lon = degrees(atan(w.y, w.x)), lat = degrees(asin(clamp(w.z, -1.0, 1.0)));
      return vec2((lon + 180.0) / 360.0, (90.0 - lat) / 180.0);
    }`;
  // the graticule, every 15°, drawn by the sphere pass and — relief on — by the sea passes that paint over it
  const GLSL_GRAT = `
    uniform vec3 uGrat; uniform float uGratOn;
    vec3 graticule(vec3 c, vec3 w, float z) {
      if (uGratOn < 0.5) return c;
      float lon = degrees(atan(w.y, w.x)), lat = degrees(asin(clamp(w.z, -1.0, 1.0)));
      float fl = fwidth(lon), fa = fwidth(lat);
      float gl1 = abs(fract(lon / 15.0 + 0.5) - 0.5) * 15.0, ga = abs(fract(lat / 15.0 + 0.5) - 0.5) * 15.0;
      float line = max(1.0 - smoothstep(0.0, fl * 1.2, gl1), 1.0 - smoothstep(0.0, fa * 1.2, ga));
      if (abs(lat) > 85.0) line = 1.0 - smoothstep(0.0, fa * 1.2, ga);   // meridians converge: only parallels near the poles
      return mix(c, uGrat, line * 0.35 * z);
    }`;

  // a quad around the disc and its halo, not the whole screen: at the globe view two thirds of the
  // viewport is outside the halo and every fragment there was a discard (measured in software GL:
  // the sphere pass was a sixth of a globe frame)
  const VS_SPHERE = `#version 300 es
    precision highp float;
    uniform vec2 uCenter, uSize; uniform float uRadius, uHaloW;
    const vec2 Q[6] = vec2[6](vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(1.0, 1.0), vec2(-1.0, -1.0), vec2(1.0, 1.0), vec2(-1.0, 1.0));
    out vec3 vWorld; out float vZ; out vec2 vUV;   // unused here; declared so the relief fragment shader links with this vertex shader too
    void main() {
      vec2 px = uCenter + Q[gl_VertexID] * uRadius * (1.0 + uHaloW + 0.01);   // device px, y down
      gl_Position = vec4(px.x / uSize.x * 2.0 - 1.0, 1.0 - px.y / uSize.y * 2.0, 0.0, 1.0);
      vWorld = vec3(0.0); vZ = 1.0; vUV = vec2(0.0);
    }`;
  const FS_SPHERE = `#version 300 es
    precision highp float;
    uniform vec2 uCenter;      // device px, y down
    uniform float uRadius;     // device px
    uniform float uHeight;     // device px
    uniform mat3 uRotT;        // transpose of the view rotation: screen → world
    uniform vec3 uOcean, uRim, uHalo;
    uniform float uHaloW;
    uniform float uReliefOn, uStrength;   // the bathymetry tint from the L0 sheet, at the reader's strength — only while no L1 patch is drawn (Phase 1c)
    ${GLSL_RELIEF}
    ${GLSL_GRAT}
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
      vec3 c = uOcean;
      vec3 w = uRotT * vec3(d.x, -d.y, z);      // world unit vector (d.y is down on screen)
      if (uReliefOn > 0.5) {
        vec2 hs = reliefAt(worldUV(w));
        float depth = clamp(-min(hs.x, 0.0) / 6000.0, 0.0, 1.0);   // a sea pixel reads the height clamped at or below zero
        c *= 1.0 - 0.42 * sqrt(depth) * uStrength;                 // deeper = darker; the square root keeps the shelves visible
      }
      c *= shade;
      c = graticule(c, w, z);
      float rim = smoothstep(1.0 - 2.5 * px, 1.0 - 0.5 * px, r);
      c = mix(c, uRim, rim * 0.6);
      float a = 1.0 - smoothstep(1.0 - px, 1.0, r);
      o = vec4(c * a, a);
    }`;

  /* the relief pass: land tint × hillshade over the land fill (mode 1), or the sea tint opaque (mode 0),
     from the L0 sheet over the whole disc (uFromRay = 1, the sphere's quad) or from one tile's texture
     over its patch mesh (uFromRay = 0) */
  const VS_PATCH = `#version 300 es
    precision highp float;
    in vec3 aPos; in float aFace; in vec2 aUV;
    uniform mat3 uRot; uniform vec2 uCenter, uSize; uniform float uRadius;
    out vec3 vWorld; out float vZ; out vec2 vUV;
    void main() {
      vec3 p = uRot * aPos;
      vec2 px = uCenter + vec2(p.x, -p.y) * uRadius;
      gl_Position = vec4(px.x / uSize.x * 2.0 - 1.0, 1.0 - px.y / uSize.y * 2.0, 0.0, 1.0);
      vWorld = aPos; vZ = p.z; vUV = aUV;
    }`;
  /* the relief pass: the sea tint opaque (mode 0) or the land tint × hillshade blended (mode 1), from the L0
     sheet over the whole disc (uFromRay = 1: the sphere's quad, the ray unprojected and the texture coordinate
     computed per fragment — two triangles, which on software GL beats a sphere mesh's thousands, measured) or
     from one L1 tile over its patch mesh (uFromRay = 0: the mesh carries its texture coordinate per vertex, so
     no atan or asin runs per fragment — the costliest part of a relief frame, measured; Phase 1c) */
  const FS_RELIEF = `#version 300 es
    precision highp float;
    in vec3 vWorld; in float vZ; in vec2 vUV;
    uniform vec2 uCenter; uniform float uRadius, uHeight; uniform mat3 uRotT;
    uniform float uFromRay, uMode, uStrength, uFade;
    uniform vec3 uOcean, uRim; uniform sampler2D uRamp;
    ${GLSL_RELIEF}
    ${GLSL_GRAT}
    out vec4 o;
    void main() {
      vec3 w; float z; vec2 uv;
      if (uFromRay > 0.5) {
        vec2 d = (vec2(gl_FragCoord.x, uHeight - gl_FragCoord.y) - uCenter) / uRadius;
        float r2 = dot(d, d); if (r2 > 1.0) discard;
        z = sqrt(1.0 - r2); w = uRotT * vec3(d.x, -d.y, z); uv = worldUV(w);
      } else { z = vZ; if (z < 0.0) discard; w = normalize(vWorld); uv = vUV; }
      float r = sqrt(max(0.0, 1.0 - z * z)), px = 1.0 / uRadius;
      float edge = 1.0 - smoothstep(1.0 - px, 1.0, r);                 // the disc's anti-aliased rim, as the sphere pass draws it
      vec2 hs = reliefAt(uv);
      float shade = mix(1.0, 0.70, pow(1.0 - z, 2.2));                 // the sphere pass's limb darkening
      if (uMode < 0.5) {
        // sea: the ocean colour with the depth tint, opaque, the graticule and the rim over it as the sphere pass draws them
        float depth = clamp(-min(hs.x, 0.0) / 6000.0, 0.0, 1.0);   // a sea pixel reads the height clamped at or below zero
        vec3 c = uOcean * (1.0 - 0.42 * sqrt(depth) * uStrength) * shade;   // deeper = darker; the square root keeps the shelves visible
        c = graticule(c, w, z);
        c = mix(c, uRim, smoothstep(1.0 - 2.5 * px, 1.0 - 0.5 * px, r) * 0.6);
        o = vec4(c * edge, edge);
      } else {
        // land: height clamped at or above zero (the OSM coast decided this pixel is land), tinted by the ramp and lit by the hillshade
        float hgt = max(hs.x, 0.0);
        float t = sqrt(clamp(hgt / 6000.0, 0.0, 1.0));
        vec3 tint = texture(uRamp, vec2(t * (255.0 / 256.0) + 0.5 / 256.0, 0.5)).rgb;
        float lit = 0.35 + 0.95 * hs.y;          // level ground (shade 0.707) ≈ 1.02; a lit slope brighter, a shadowed one darker
        vec3 c = tint * lit * shade;
        float a = uStrength * uFade * edge;
        o = vec4(c * a, a);
      }
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
    uniform sampler2D uStyle; uniform float uIdPass; uniform vec4 uFlat; uniform float uUseFlat;
    uniform float uIdOffset;         // the history faces live above 2^18 in the id space (Phase 2a)
    uniform float uHatch; uniform vec3 uHatchB;   // a contested face: stripes of its two claimants' colours, in screen space
    out vec4 o;
    void main() {
      if (vZ < 0.0) discard;
      int id = int(vFace + 0.5);
      if (uIdPass > 0.5) {
        int v = id + 1 + int(uIdOffset);
        o = vec4(float(v & 255) / 255.0, float((v >> 8) & 255) / 255.0, float((v >> 16) & 255) / 255.0, 1.0);
        return;
      }
      if (uUseFlat > 0.5) { o = vec4(uFlat.rgb * uFlat.a, uFlat.a); return; }   // lakes: one colour, no style texel
      vec4 s = texelFetch(uStyle, ivec2(id & 255, id >> 8), 0);
      if (s.a < 0.002) discard;
      vec3 c = s.rgb;
      if (uHatch > 0.5) { float d = mod(gl_FragCoord.x + gl_FragCoord.y, 12.0); c = d < 6.0 ? s.rgb : uHatchB; }
      o = vec4(c * s.a, s.a);
    }`;
  // the stencil pass: tile extents as triangles on the sphere, colour writes off; only z matters
  const FS_EXTENT = `#version 300 es
    precision highp float;
    in float vZ; flat in float vFace;
    out vec4 o;
    void main() { if (vZ < 0.0) discard; o = vec4(0.0); }`;

  /* the cached line layer (Phase 2a): the water and the land's lines are drawn into a texture while the view is still and
     composited with one triangle over the screen each frame — on a software rasteriser a segment costs about 2 µs, and the
     42,000 of the Mediterranean view were three quarters of a frame while a scrub changed only the year */
  const VS_BLIT = `#version 300 es
  out vec2 vUv;
  void main() { vec2 p = vec2(float((gl_VertexID & 1) * 4 - 1), float((gl_VertexID & 2) * 2 - 1)); vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
  const FS_BLIT = `#version 300 es
  precision mediump float;
  uniform sampler2D uTex; in vec2 vUv; out vec4 o;
  void main() { o = texture(uTex, vUv); }`;
  const VS_ARC = `#version 300 es
    precision highp float;
    uniform sampler2D uSeg;          // RGBA32F, two texels per segment: (a.xyz, tag) (b.xyz, 0)
    uniform int uTexW;
    uniform mat3 uRot; uniform vec2 uCenter, uSize; uniform float uRadius;
    uniform float uWidth[8];         // device px, per kind: coast, border, river, lake shore, soft, admin-1
    uniform float uAdmin1;           // 1 = draw admin-1 arcs
    uniform float uBorders;          // 1 = draw the present-day borders and admin-1 lines (0 in a year before the present, Phase 2a)
    uniform float uIdPad;            // device px added to every line's reach in an ID pass (a river is picked within 8 CSS px, Phase 1c)
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
      float w = uWidth[int(kind + 0.5)];
      float hw = w * 0.5 + 1.0 + uIdPad;                  // a pixel of anti-aliasing margin
      vec2 d = sb - sa; float L = length(d);
      vec2 dir = L > 1e-6 ? d / L : vec2(1.0, 0.0);
      vec2 nrm = vec2(-dir.y, dir.x);
      // one triangle covering the capsule: a base twice the width at one end, an apex twice the length beyond
      vec2 base = sa - dir * hw; float Lt = L + 2.0 * hw;
      vec2 p = k == 0 ? base - nrm * 2.0 * hw : k == 1 ? base + nrm * 2.0 * hw : base + dir * 2.0 * Lt;
      if (pa.z < -0.01 && pb.z < -0.01) p = vec2(-1.0e5);  // wholly behind the horizon: off screen, nothing rasterised
      if (kind > 4.5 && kind < 5.5 && uAdmin1 < 0.5) p = vec2(-1.0e5);   // admin-1 below its zoom threshold: not drawn
      if (uBorders < 0.5 && ((kind > 0.5 && kind < 1.5) || (kind > 4.5 && kind < 5.5))) p = vec2(-1.0e5);   // a present-day line in a past year
      gl_Position = vec4(p.x / uSize.x * 2.0 - 1.0, 1.0 - p.y / uSize.y * 2.0, 0.0, 1.0);
      vA = sa; vB = sb; vHw = w * 0.5; vKind = kind; vFlags = flags; vArc = floor(tag / 64.0); vZ = vec2(pa.z, pb.z);
    }`;
  const FS_ARC = `#version 300 es
    precision highp float;
    flat in vec2 vA; flat in vec2 vB; flat in float vHw; flat in float vKind; flat in float vFlags; flat in float vArc; flat in vec2 vZ;
    uniform float uHeight; uniform vec3 uColor[8]; uniform float uIdPass; uniform float uIdBase; uniform float uIdPad;
    uniform sampler2D uArcTab; uniform float uArcTabOn;   // Phase 2a: per-arc alpha for the historical borders (0 = not alive this year)
    uniform vec2 uPickOff;           // a pick shifts the viewport so one device pixel lands on a 1×1 target: gl_FragCoord is then
                                     // the target's, and the device pixel is this much further along (0 in an ordinary frame)
    out vec4 o;
    void main() {
      vec2 p = vec2(gl_FragCoord.x + uPickOff.x, uHeight - gl_FragCoord.y - uPickOff.y);
      vec2 ab = vB - vA; float l2 = dot(ab, ab);
      float t = l2 > 0.0 ? clamp(dot(p - vA, ab) / l2, 0.0, 1.0) : 0.0;
      float dist = length(p - (vA + ab * t));
      float z = mix(vZ.x, vZ.y, t);
      if (z < -0.002) discard;
      if (uIdPass > 0.5) {
        if (dist > vHw + 1.0 + uIdPad) discard;
        int v = int(vArc + 0.5) + int(uIdBase);          // land arcs live above 2^20 in the id space, water arcs above 2^21
        o = vec4(float(v & 255) / 255.0, float((v >> 8) & 255) / 255.0, float((v >> 16) & 255) / 255.0, 1.0);
        return;
      }
      float a = 1.0 - smoothstep(vHw - 0.5, vHw + 0.5, dist);
      if (a <= 0.003) discard;
      if (uArcTabOn > 0.5) { int ai = int(vArc + 0.5); float ta = texelFetch(uArcTab, ivec2(ai & 255, ai >> 8), 0).r; if (ta < 0.004) discard; a *= ta; }
      // a DISPUTED line (flag 1) and an INTERMITTENT river (flag 4) are dashed: 6 px on, 4 px off
      if (mod(vFlags, 2.0) >= 1.0 || mod(floor(vFlags / 4.0), 2.0) >= 1.0) { float along = t * sqrt(l2); if (mod(along, 10.0) > 6.0) discard; }
      a *= smoothstep(-0.002, 0.03, z);                   // fade a line into the horizon instead of cutting it
      vec3 c = uColor[int(vKind + 0.5)];
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
    gl.bindAttribLocation(p, 0, "aPos"); gl.bindAttribLocation(p, 1, "aFace"); gl.bindAttribLocation(p, 2, "aUV");   // one VAO layout for every program
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(name + " link: " + gl.getProgramInfoLog(p));
    const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); const nm = info.name.replace(/\[0\]$/, ""); u[nm] = gl.getUniformLocation(p, info.name); }
    return { p, u };
  }

  const SEG_TEX_W = 4096;
  const D2R = Math.PI / 180;
  const ST_TILE = 0x03, ST_WATER = 0x04, ST_PATCH = 0x08, ST_LAND = 0x10, ST_SEAP = 0x20;
  const ID_LAND_ARC = 1048576, ID_WATER_ARC = 2097152;
  const LAKE_FACE_BASE = 524288;   // the worker's: a lake fill's face id is this + its core face index
  const HIST_FACE_BASE = 262144;   // Phase 2a: a historical face's id is this + its index in history.bin + 1
  const HIST_KIND = 7;
  const LAKE_MIN_PX2 = 2;          // a lake whose area projects under this many px² is not drawn (Phase 1c, the cull)

  // a lon/lat rectangle as triangles on the sphere: an n×n grid (unit vectors)
  // …with the equirectangular texture coordinate of every vertex (Phase 1c): the relief shader reads it as a
  // varying instead of computing atan and asin for every fragment — the costliest part of a relief frame on
  // software GL, measured; the error of interpolating lon/lat across a mesh cell is a fraction of a texel
  function extentMesh(tile, n) {
    const pos = new Float32Array((n + 1) * (n + 1) * 4), uv = new Float32Array((n + 1) * (n + 1) * 2), idx = new Uint16Array(n * n * 6);
    let k = 0, m = 0;
    // the edge vertices are the tile's own bounds, not lon0 + (lon1 − lon0)·n/n: two patches that meet must share
    // bit-identical positions or the rasteriser leaves sub-pixel cracks along the seam, which read as a faint dashed
    // meridian or parallel (seen at 0° on a phone's Europe view with the L0 sheet skipped under full patch cover)
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
      const lon = (i === n ? tile.lon1 : i === 0 ? tile.lon0 : tile.lon0 + (tile.lon1 - tile.lon0) * i / n) * D2R;
      const lat = (j === n ? tile.lat1 : j === 0 ? tile.lat0 : tile.lat0 + (tile.lat1 - tile.lat0) * j / n) * D2R, c = Math.cos(lat);
      pos[k++] = c * Math.cos(lon); pos[k++] = c * Math.sin(lon); pos[k++] = Math.sin(lat); pos[k++] = 0;
      uv[m++] = i / n; uv[m++] = (n - j) / n;
    }
    k = 0;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = j * (n + 1) + i, b = a + 1, c = a + n + 1, d = c + 1; idx[k++] = a; idx[k++] = b; idx[k++] = c; idx[k++] = b; idx[k++] = d; idx[k++] = c; }
    return { pos, uv, idx };
  }

  function create(canvas, opts) {
    opts = opts || {};
    const gl = canvas.getContext("webgl2", { antialias: !!opts.antialias, alpha: true, premultipliedAlpha: true, depth: false, stencil: true, preserveDrawingBuffer: false, powerPreference: "high-performance" });
    if (!gl) return null;
    const levels = {};            // level → { data, gpu }
    const tiles = new Map();      // key → { data, gpu, tile }
    const water = {};             // level → { data, gpu }
    const waterTiles = new Map(); // key → { data, gpu, tile }
    const relief = new Map();     // key → { w, h, rgb, tile, gpu }
    /* THE STEP TOPOLOGY (Phase 2a): one bucketed segment list per resident level for the historical borders (drawn through a
       per-arc alpha table, so a year costs a table, not geometry), and one small mesh per (face, level) the main thread has asked
       for — triangulated lazily in the worker, uploaded here, dropped by the main thread's LRU. A face's fill is drawn only
       where the LAND stencil bit is set (the land fills' own stencil: §2.3's fill-against-stroke rule), and at the tile zooms its
       coast edges are also stroked in the fill colour, as wide as the resident level's tolerance, so the fill never stops short
       of the finer coast. A contested face is hatched in its two claimants' colours. */
    const hist = { segs: {}, meshes: new Map(), styleTex: null, styleN: 0, arcTex: null, arcN: 0 };
    const lines = { fbo: null, tex: null, rb: null, w: 0, h: 0, key: "", on: true, reused: 0, rendered: 0 }; let dataGen = 0;   // the cached line layer; dataGen bumps on every upload that could change it
    const still = { fbo: null, tex: null, rb: null, scratch: null, scratchTex: null, scratchRb: null, w: 0, h: 0, key: "", lastKey: "", on: true, reused: 0, rendered: 0 };   // the still cache: the base while the view does not move
    let ramp = null, rampTex = null;
    let palette = { ocean: [0.70, 0.92, 1.0], land: [0.9, 0.9, 0.92], coast: [0.55, 0.55, 0.6], border: [0.45, 0.45, 0.5], admin1: [0.6, 0.6, 0.66], river: [0.3, 0.55, 0.8], lake: [0.70, 0.92, 1.0], lakeShore: [0.55, 0.55, 0.6], rim: [0.5, 0.5, 0.55], halo: [0.6, 0.65, 0.9], grat: [0.2, 0.2, 0.3], selected: [0.95, 0.75, 0.3] };
    let prog = null, styleTex = null, emptyVao = null, idFbo = null, idTex = null, lost = false;
    /* THE GPU'S OWN TIME PER FRAME (Phase 2a, task 0b): where EXT_disjoint_timer_query_webgl2 exists, every rendered frame is
       bracketed by a TIME_ELAPSED query and the oldest query is polled each frame; the latest answer (ms) is what atlas.js's
       stage logic reads instead of the frame delta, so a main-thread stall cannot read as a slow GPU. Software GL and most
       phones expose no timer; there the delta stays. A disjoint event throws the reading away. */
    let timerExt = null, gpuQueries = [], gpuLast = null, gpuLastFrame = -1;
    try { timerExt = gl.getExtension("EXT_disjoint_timer_query_webgl2"); } catch (e) { timerExt = null; }
    function gpuBegin() { if (!timerExt || lost || gpuQueries.length >= 8) return null; const q = gl.createQuery(); try { gl.beginQuery(timerExt.TIME_ELAPSED_EXT, q); } catch (e) { gl.deleteQuery(q); return null; } return q; }
    function gpuEnd(q) {
      if (!q) return;
      try { gl.endQuery(timerExt.TIME_ELAPSED_EXT); } catch (e) { gl.deleteQuery(q); return; }
      gpuQueries.push({ q, frame: stats.frames });
      // poll the oldest; a result arrives a frame or two later
      while (gpuQueries.length) {
        const h = gpuQueries[0];
        let ready = false; try { ready = gl.getQueryParameter(h.q, gl.QUERY_RESULT_AVAILABLE); } catch (e) { ready = true; }
        if (!ready) break;
        gpuQueries.shift();
        try { const disjoint = gl.getParameter(timerExt.GPU_DISJOINT_EXT); if (!disjoint) { gpuLast = gl.getQueryParameter(h.q, gl.QUERY_RESULT) / 1e6; gpuLastFrame = h.frame; } } catch (e) {}
        gl.deleteQuery(h.q);
      }
    }
    let faceCount = 0, selected = -1;
    let histBorderColor = [0.4, 0.4, 0.45];
    let dpr = 1, W = 0, H = 0;
    const stats = { frames: 0, lastMs: 0, draws: 0, historyTriangles: 0, historySegments: 0, historyFaces: 0, trianglesDrawn: 0, segmentsDrawn: 0, riverSegments: 0, lakeSegments: 0, lakeTriangles: 0, lakeCulled: 0, lakeSegCulled: 0, reliefPatches: 0, visibleAngle: 0, tilesDrawn: 0, parentsDrawn: 0, waterTilesDrawn: 0, level: 0, coreLevel: -1, waterLevel: -1, restores: 0, reliefL0: -1, gpuBytes: 0, gpuTextureBytes: 0 };   // gpuBytes: every buffer and texture uploaded and not yet deleted (Phase 1d's memory session reads it)
    const onRestore = typeof opts.onRestore === "function" ? opts.onRestore : null;
    const debug = { sphere: true, faces: true, arcs: true, water: true, relief: true, cull: true };   // toggles for the perf suite's breakdown; always on in use

    function setup() {
      lines.fbo = null; lines.tex = null; lines.rb = null; lines.key = "";   // a restored context rebuilds the line layer
      still.fbo = null; still.tex = null; still.rb = null; still.scratch = null; still.scratchTex = null; still.scratchRb = null; still.key = ""; still.lastKey = "";
      prog = { blit: compile(gl, VS_BLIT, FS_BLIT, "blit"), sphere: compile(gl, VS_SPHERE, FS_SPHERE, "sphere"), face: compile(gl, VS_FACE, FS_FACE, "face"), extent: compile(gl, VS_FACE, FS_EXTENT, "extent"), arc: compile(gl, VS_ARC, FS_ARC, "arc"), reliefL0: compile(gl, VS_SPHERE, FS_RELIEF, "relief"), reliefPatch: compile(gl, VS_PATCH, FS_RELIEF, "relief patch") };
      emptyVao = gl.createVertexArray();
      styleTex = gl.createTexture();
      rampTex = gl.createTexture();
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
      if (ramp) uploadRamp();
      if (faceCount) buildStyle();
    }
    /* MEMORY (Phase 1c). Until 1c every level, tile, water level and relief sheet kept its arrays beside the
       GPU copy "for context loss" — 150 MB of typed arrays on the main thread (the runner read a 307 MB heap
       against v1's 242). Now an upload keeps only what a frame reads on the CPU — the bucket ranges and caps,
       a few hundred KB in all — and a restored context is rebuilt the other way round: the caller's
       `onRestore` asks the worker, which kept the raw files, to send every level again, and drops its tile
       caches so the loader fetches them again (from the browser's cache). */
    function slim(D) { const keep = {}; for (const k of Object.keys(D)) if (/Range|Cap|Bins$/.test(k) || k === "stats") keep[k] = D[k]; return keep; }
    function uploadFill(pos, idx, uv) {
      const g = {};
      g.vao = gl.createVertexArray(); gl.bindVertexArray(g.vao);
      g.pos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, g.pos); gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 16, 12);
      if (uv) { g.uv = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, g.uv); gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 8, 0); }
      g.idx = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.idx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
      g.count = idx.length; g.u16 = idx instanceof Uint16Array;
      g.bytes = pos.byteLength + idx.byteLength + (uv ? uv.byteLength : 0); stats.gpuBytes += g.bytes;
      gl.bindVertexArray(null);
      return g;
    }
    function uploadSegs(segs) {
      // a float texture, two texels per segment, pulled by gl_VertexID
      const n = segs.length / 8, texels = n * 2, rows = Math.max(1, Math.ceil(texels / SEG_TEX_W));
      let data = segs;
      if (data.length !== SEG_TEX_W * rows * 4) { data = new Float32Array(SEG_TEX_W * rows * 4); data.set(segs); }
      const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, SEG_TEX_W, rows, 0, gl.RGBA, gl.FLOAT, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const bytes = SEG_TEX_W * rows * 16; stats.gpuBytes += bytes; stats.gpuTextureBytes += bytes;
      return { tex, count: n, bytes };
    }
    function releaseFill(g) { if (!g) return; gl.deleteBuffer(g.pos); gl.deleteBuffer(g.idx); if (g.uv) gl.deleteBuffer(g.uv); gl.deleteVertexArray(g.vao); stats.gpuBytes -= g.bytes || 0; }
    function releaseSegs(s) { if (s) { gl.deleteTexture(s.tex); stats.gpuBytes -= s.bytes || 0; stats.gpuTextureBytes -= s.bytes || 0; } }
    function upload(Lv) {
      const D = Lv.data, g = Lv.gpu = {};
      const f = uploadFill(D.facePos, D.faceIdx); g.vaoFace = f.vao; g.facePos = f.pos; g.faceIdx = f.idx; g.faceCount = f.count; g.bytes = f.bytes;
      const s = uploadSegs(D.segs); g.segTex = s.tex; g.segCount = s.count; g.segBytes = s.bytes;
      if (Lv.tile) { const m = extentMesh(Lv.tile, Lv.tile.z >= 4 ? 4 : 8); const e = uploadFill(m.pos, m.idx); g.vaoExt = e.vao; g.extPos = e.pos; g.extIdx = e.idx; g.extCount = e.count; g.bytes += e.bytes; }
      warm(Lv);
      Lv.data = slim(D);
    }
    function uploadWater(Wl) {
      const D = Wl.data, g = Wl.gpu = {};
      g.fill = D.faceIdx && D.faceIdx.length ? uploadFill(D.facePos, D.faceIdx) : null;
      g.lake = D.lakeSegs && D.lakeSegs.length ? uploadSegs(D.lakeSegs) : null;
      g.river = D.riverSegs && D.riverSegs.length ? uploadSegs(D.riverSegs) : null;
      g.smooth = D.smoothSegs && D.smoothSegs.length ? uploadSegs(D.smoothSegs) : null;
      if (Wl.tile) { const m = extentMesh(Wl.tile, 4); const e = uploadFill(m.pos, m.idx); g.ext = e; }
      warmWater(Wl);
      Wl.data = slim(D);
    }
    function uploadRelief(Rl) {
      const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB8, Rl.w, Rl.h, 0, gl.RGB, gl.UNSIGNED_BYTE, Rl.rgb);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const g = Rl.gpu = { tex, bytes: Rl.w * Rl.h * 3 };
      stats.gpuBytes += g.bytes; stats.gpuTextureBytes += g.bytes;
      if (Rl.tile) { const m = extentMesh(Rl.tile, 24); g.ext = uploadFill(m.pos, m.idx, m.uv); }   // the L0 sheet draws over the sphere's quad
      Rl.rgb = null;   // 12 MB a sheet: the GPU has it (Phase 1c)
    }
    function uploadRamp() {
      gl.bindTexture(gl.TEXTURE_2D, rampTex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB8, 256, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, ramp);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    /* the first draw with a new texture or buffer is where a software driver converts it; one tiny
       draw into the ID framebuffer at upload pays that outside any gesture (the wheel spike of Phase 0) */
    const IDENT = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    const WIDTH1 = new Float32Array(8).fill(1);
    function warmBegin() { gl.bindFramebuffer(gl.FRAMEBUFFER, idFbo); gl.viewport(0, 0, 1, 1); gl.disable(gl.SCISSOR_TEST); gl.disable(gl.STENCIL_TEST); }
    function warmFill(vao, u16) { const P = prog.face; gl.useProgram(P.p); gl.uniformMatrix3fv(P.u.uRot, false, IDENT); gl.uniform2f(P.u.uCenter, 0, 0); gl.uniform2f(P.u.uSize, 1, 1); gl.uniform1f(P.u.uRadius, 0.0001); gl.uniform1f(P.u.uIdPass, 1); gl.uniform1f(P.u.uUseFlat, 0); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, styleTex); gl.uniform1i(P.u.uStyle, 0); gl.bindVertexArray(vao); gl.drawElements(gl.TRIANGLES, 3, u16 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT, 0); gl.bindVertexArray(null); }
    function warmSegs(tex) { const P = prog.arc; gl.useProgram(P.p); gl.uniformMatrix3fv(P.u.uRot, false, IDENT); gl.uniform2f(P.u.uCenter, 0, 0); gl.uniform2f(P.u.uSize, 1, 1); gl.uniform1f(P.u.uRadius, 0.0001); gl.uniform1f(P.u.uHeight, 1); gl.uniform1fv(P.u.uWidth, WIDTH1); gl.uniform1f(P.u.uAdmin1, 1); gl.uniform1f(P.u.uIdPass, 1); gl.uniform1f(P.u.uIdBase, 0); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(P.u.uSeg, 1); gl.uniform1i(P.u.uTexW, SEG_TEX_W); gl.bindVertexArray(emptyVao); gl.drawArrays(gl.TRIANGLES, 0, 3); }
    function warm(Lv) { const g = Lv.gpu; warmBegin(); if (g.faceCount) warmFill(g.vaoFace, false); if (g.segCount) warmSegs(g.segTex); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
    function warmWater(Wl) { const g = Wl.gpu; warmBegin(); if (g.fill) warmFill(g.fill.vao, g.fill.u16); for (const s of [g.lake, g.river, g.smooth]) if (s) warmSegs(s.tex); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
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
      stats.gpuBytes -= (g.bytes || 0) + (g.segBytes || 0); stats.gpuTextureBytes -= g.segBytes || 0;
      Lv.gpu = null;
    }
    function releaseWater(Wl) { const g = Wl.gpu; if (!g) return; releaseFill(g.fill); releaseFill(g.ext); releaseSegs(g.lake); releaseSegs(g.river); releaseSegs(g.smooth); Wl.gpu = null; }
    function releaseRelief(Rl) { const g = Rl.gpu; if (!g) return; gl.deleteTexture(g.tex); releaseFill(g.ext); stats.gpuBytes -= g.bytes || 0; stats.gpuTextureBytes -= g.bytes || 0; Rl.gpu = null; }

    canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); lost = true; }, false);
    canvas.addEventListener("webglcontextrestored", () => {
      lost = false;
      for (const k of Object.keys(levels)) delete levels[k];
      for (const k of Object.keys(water)) delete water[k];
      tiles.clear(); waterTiles.clear(); relief.clear();
      stats.gpuBytes = 0; stats.gpuTextureBytes = 0;
      setup(); stats.restores++;
      if (onRestore) onRestore();
    }, false);
    setup();

    // the resident level to draw: the one asked for, else the finest uploaded below it, else the coarsest above
    function pickLevel(table, want, cap) {
      for (let l = Math.min(want, cap); l >= 0; l--) if (table[l] && table[l].gpu) return table[l];
      for (let l = want + 1; l < 8; l++) if (table[l] && table[l].gpu) return table[l];
      return null;
    }

    /* which buckets can be on screen: the cap of the visible part of the disc, against each bucket's cap */
    const GAP_MERGE = 256;   // items (segments or triangles) of invisible buckets a run may swallow to avoid a draw call
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
        // contiguous, or across a gap of a few hidden items: one draw call costs more than drawing them
        if (s >= 0 && start - e <= GAP_MERGE) e = start + count;
        else { if (s >= 0) runs.push([s, e - s]); s = start; e = start + count; }
      }
      if (s >= 0) runs.push([s, e - s]);
      return runs;
    }

    const common = (P, view, R) => { gl.useProgram(P.p); gl.uniformMatrix3fv(P.u.uRot, false, R); gl.uniform2f(P.u.uCenter, view.cx * dpr, view.cy * dpr); gl.uniform2f(P.u.uSize, W, H); gl.uniform1f(P.u.uRadius, view.radius * dpr); };
    function drawFill(vao, u16, range, cap, view, idPass, R, margin, flat, counter) {
      const rot = view.rot, cx = view.cx * dpr, cy = view.cy * dpr, radius = view.radius * dpr;
      const P = prog.face; common(P, view, R);
      gl.uniform1f(P.u.uIdPass, idPass ? 1 : 0); gl.uniform1f(P.u.uIdOffset, 0); gl.uniform1f(P.u.uHatch, 0);
      if (flat) { gl.uniform1f(P.u.uUseFlat, 1); gl.uniform4f(P.u.uFlat, flat[0], flat[1], flat[2], 1); } else gl.uniform1f(P.u.uUseFlat, 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, styleTex); gl.uniform1i(P.u.uStyle, 0);
      gl.bindVertexArray(vao);
      for (const [start, count] of visibleRuns(range, cap, rot, radius, cx, cy, margin)) { gl.drawElements(gl.TRIANGLES, count, u16 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT, start * (u16 ? 2 : 4)); stats.draws++; stats[counter] += count / 3; }
      gl.bindVertexArray(null);
    }
    function drawFaces(Lv, view, idPass, R) { drawFill(Lv.gpu.vaoFace, false, Lv.data.faceRange, Lv.data.faceCap, view, idPass, R, Lv.tile ? 0.002 : 0.01, null, "trianglesDrawn"); }
    const widths = new Float32Array(8), colors = new Float32Array(24);
    const pickOff = [0, 0];
    function arcUniforms(P, view, R, idPass, idBase, idPad) {
      common(P, view, R);
      gl.uniform1f(P.u.uHeight, H);
      gl.uniform1f(P.u.uIdPad, idPad || 0);
      gl.uniform2f(P.u.uPickOff, pickOff[0], pickOff[1]);
      widths[0] = 1.0 * dpr; widths[1] = 0.9 * dpr; widths[2] = 0.8 * dpr; widths[3] = 0.6 * dpr; widths[4] = 0.9 * dpr; widths[5] = 0.6 * dpr; widths[6] = 0; widths[7] = 1.1 * dpr;
      gl.uniform1fv(P.u.uWidth, widths);
      gl.uniform1f(P.u.uArcTabOn, 0); gl.uniform1f(P.u.uBorders, view.history && view.history.present === false ? 0 : 1);
      const C = [palette.coast, palette.border, palette.river, palette.lakeShore, palette.border, palette.admin1, palette.border, histBorderColor];
      for (let i = 0; i < 8; i++) { colors[3 * i] = C[i][0]; colors[3 * i + 1] = C[i][1]; colors[3 * i + 2] = C[i][2]; }
      gl.uniform3fv(P.u.uColor, colors);
      gl.uniform1f(P.u.uAdmin1, view.admin1 ? 1 : 0);
      gl.uniform1f(P.u.uIdPass, idPass ? 1 : 0); gl.uniform1f(P.u.uIdBase, idBase);
      gl.uniform1i(P.u.uTexW, SEG_TEX_W);
    }
    function drawSegs(tex, range, cap, view, margin, counter) {
      const rot = view.rot, cx = view.cx * dpr, cy = view.cy * dpr, radius = view.radius * dpr;
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(prog.arc.u.uSeg, 1);
      gl.bindVertexArray(emptyVao);
      for (const [start, count] of visibleRuns(range, cap, rot, radius, cx, cy, margin)) { gl.drawArrays(gl.TRIANGLES, start * 3, count * 3); stats.draws++; stats[counter] += count; }
    }
    function drawArcs(Lv, view, idPass, R) {
      const D = Lv.data, g = Lv.gpu, margin = Lv.tile ? 0.002 : 0.01;
      arcUniforms(prog.arc, view, R, idPass, ID_LAND_ARC);
      drawSegs(g.segTex, D.segRange, D.segCap, view, margin, "segmentsDrawn");
      // the admin-1 list is submitted only past its zoom threshold (the worker keeps it apart; §2.3)
      if (view.admin1 && D.segRangeA1) drawSegs(g.segTex, D.segRangeA1, D.segCapA1, view, margin, "segmentsDrawn");
    }
    function drawExtents(list, view, R, ref, mask) {
      const P = prog.extent; common(P, view, R);
      gl.colorMask(false, false, false, false);
      gl.stencilMask(mask);
      gl.stencilFunc(gl.ALWAYS, ref, 0xff); gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
      for (const g of list) { gl.bindVertexArray(g.vao); gl.drawElements(gl.TRIANGLES, g.count, gl.UNSIGNED_SHORT, 0); stats.draws++; }
      gl.bindVertexArray(null);
      gl.colorMask(true, true, true, true);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP); gl.stencilMask(0xff);
    }
    /* the relief pass: mode 0 = sea tint (opaque), 1 = land tint × shade (blended); from the L0 sheet over the
       disc or from a tile's texture over its patch */
    function drawRelief(Rl, view, R, mode, strength, fade) {
      const P = Rl.tile ? prog.reliefPatch : prog.reliefL0;
      gl.useProgram(P.p);
      gl.uniform2f(P.u.uCenter, view.cx * dpr, view.cy * dpr); gl.uniform1f(P.u.uRadius, view.radius * dpr); gl.uniform1f(P.u.uHeight, H); gl.uniform2f(P.u.uSize, W, H);
      gl.uniform1f(P.u.uWrap, Rl.tile ? 0 : 1);
      if (Rl.tile) { gl.uniformMatrix3fv(P.u.uRot, false, R); gl.uniform1f(P.u.uFromRay, 0); }
      else { gl.uniform1f(P.u.uHaloW, 0); gl.uniform1f(P.u.uFromRay, 1); gl.uniformMatrix3fv(P.u.uRotT, false, view.rot); }
      gl.uniform1f(P.u.uMode, mode); gl.uniform1f(P.u.uStrength, strength); gl.uniform1f(P.u.uFade, fade);
      gl.uniform3fv(P.u.uOcean, palette.ocean); gl.uniform3fv(P.u.uRim, palette.rim); gl.uniform3fv(P.u.uGrat, palette.grat); gl.uniform1f(P.u.uGratOn, view.graticule ? 1 : 0);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, Rl.gpu.tex); gl.uniform1i(P.u.uRelief, 2); gl.uniform2f(P.u.uReliefSize, Rl.w, Rl.h);
      gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, rampTex); gl.uniform1i(P.u.uRamp, 3);
      if (Rl.tile) { gl.bindVertexArray(Rl.gpu.ext.vao); gl.drawElements(gl.TRIANGLES, Rl.gpu.ext.count, gl.UNSIGNED_SHORT, 0); gl.bindVertexArray(null); }
      else { gl.bindVertexArray(emptyVao); gl.drawArrays(gl.TRIANGLES, 0, 6); }
      stats.draws++;
    }
    /* do the loaded L1 patches cover everything the viewport shows of the disc? Nine sample points, unprojected on
       the CPU; when they do, the L0 passes are skipped — on software GL a stencil-rejected fragment is not a free
       fragment, so the sheet must not be drawn at all where a patch will paint over it (Phase 1c, measured) */
    function patchesCover(patches, view) {
      if (!patches.length) return false;
      const rot = view.rot, cx = view.cx * dpr, cy = view.cy * dpr, radius = view.radius * dpr;
      const pts = [[0, 0], [W / 2, 0], [W, 0], [W, H / 2], [W, H], [W / 2, H], [0, H], [0, H / 2], [W / 2, H / 2]];
      for (const [sx, sy] of pts) {
        const dx = (sx - cx) / radius, dy = -(sy - cy) / radius, r2 = dx * dx + dy * dy;
        if (r2 > 1) continue;
        const z = Math.sqrt(1 - r2);
        const x = rot[0] * dx + rot[3] * dy + rot[6] * z, y = rot[1] * dx + rot[4] * dy + rot[7] * z, w = rot[2] * dx + rot[5] * dy + rot[8] * z;
        const lon = Math.atan2(y, x) / D2R, lat = Math.asin(Math.max(-1, Math.min(1, w))) / D2R;
        let inside = false;
        for (const r of patches) { const t = r.tile; if (lat >= t.lat0 && lat <= t.lat1 && lon >= t.lon0 && lon <= t.lon1) { inside = true; break; } }
        if (!inside) return false;
      }
      return true;
    }

    /* the WATER ID pass (Phase 1c): lake fills with their face ids and the rivers with a wide reach, nothing
       else — the second of a tap's two reads (atlas.js pick), so a tap on a lake yields the lake AND, from the
       faces pass, the country under it */
    function drawWaterIds(view) {
      const R = transposed(view.rot);
      const Wl = pickLevel(water, Math.min(view.level, 2), 2);
      if (view.lakes) {
        if (Wl && Wl.gpu.fill) drawFill(Wl.gpu.fill.vao, Wl.gpu.fill.u16, Wl.data.faceRange, Wl.data.faceCap, view, true, R, 0.01, null, "lakeTriangles");
        if (view.level >= 3) for (const k of view.waterTiles || []) { const t = waterTiles.get(k); if (t && t.gpu && t.gpu.fill) drawFill(t.gpu.fill.vao, t.gpu.fill.u16, t.data.faceRange, t.data.faceCap, view, true, R, 0.002, null, "lakeTriangles"); }
      }
      if (view.rivers && Wl) {
        arcUniforms(prog.arc, view, R, true, ID_WATER_ARC, 8 * dpr);
        if (view.smoothRivers && Wl.gpu.smooth) drawSegs(Wl.gpu.smooth.tex, Wl.data.smoothRange, Wl.data.smoothCap, view, 0.01, "riverSegments");
        else if (Wl.gpu.river) drawSegs(Wl.gpu.river.tex, Wl.data.riverRange, Wl.data.riverCap, view, 0.01, "riverSegments");
      }
    }
    // the first lake-area bin drawn at this zoom: bins whose largest lake projects under LAKE_MIN_PX2 are skipped
    function lakeMinBin(edges, kmpp) { const minKm2 = LAKE_MIN_PX2 * kmpp * kmpp; let b = 0; while (b < edges.length && edges[b] <= minKm2) b++; return b; }
    function binned(range, cap, edges, kmpp, count, counter) {
      if (!edges || !kmpp) return { range, cap };
      const b = lakeMinBin(edges, kmpp), n = edges.length + 1;
      if (b === 0) return { range, cap };
      let culled = 0; for (let i = 0; i < b * count; i++) culled += range[2 * i + 1];
      stats[counter] += counter === "lakeCulled" ? culled / 3 : culled;
      return { range: range.subarray(2 * b * count, 2 * n * count), cap: cap.subarray(4 * b * count, 4 * n * count) };
    }
    /* ---- Phase 2a: the historical fills, their coast stroke at the tile zooms, the hatch, the borders ---- */
    function histMeshFor(face, level) {
      for (let l = Math.min(level, 2); l >= 0; l--) { const m = hist.meshes.get(face + ":" + l); if (m && m.gpu) return m; }
      for (let l = level + 1; l <= 2; l++) { const m = hist.meshes.get(face + ":" + l); if (m && m.gpu) return m; }
      return null;
    }
    function drawHistoryFills(view, idPass, R, useStencil) {
      const hv = view.history; if (!hv || !hv.faces || !hv.faces.length || !hist.styleTex) { stats.historyTriangles = 0; stats.historyFaces = 0; return; }
      const P = prog.face; common(P, view, R);
      gl.uniform1f(P.u.uIdPass, idPass ? 1 : 0); gl.uniform1f(P.u.uIdOffset, idPass ? HIST_FACE_BASE : 0); gl.uniform1f(P.u.uUseFlat, 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, hist.styleTex); gl.uniform1i(P.u.uStyle, 0);
      // only where the land fills wrote the LAND bit: the fill is masked by the land, whatever level drew it
      if (useStencil) { gl.stencilFunc(gl.EQUAL, ST_LAND, ST_LAND); gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP); gl.stencilMask(0); }
      let tris = 0, drawn = 0;
      const strokes = [];
      for (const f of hv.faces) {
        const m = histMeshFor(f.face, view.historyLevel != null ? view.historyLevel : view.level); if (!m) continue;   // one level coarser during a gesture at stage ≥ 1 (atlas.js)
        gl.uniform1f(P.u.uHatch, f.hatch ? 1 : 0); if (f.hatch) gl.uniform3f(P.u.uHatchB, f.hatch[0], f.hatch[1], f.hatch[2]);
        gl.bindVertexArray(m.gpu.vao); gl.drawElements(gl.TRIANGLES, m.gpu.count, m.gpu.u16 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT, 0); stats.draws++;
        tris += m.gpu.count / 3; drawn++;
        if (!idPass && hv.strokePx > 0 && m.gpu.coast) strokes.push({ m, f });
      }
      gl.bindVertexArray(null);
      gl.uniform1f(P.u.uHatch, 0); gl.uniform1f(P.u.uIdOffset, 0);
      // the coast stroke in the fill colour (its alpha), as wide as the level's tolerance: the fill never stops short of the finer coast
      if (strokes.length) {
        const A = prog.arc; arcUniforms(A, view, R, false, 0);
        widths[HIST_KIND] = Math.max(1, hv.strokePx) * dpr; gl.uniform1fv(A.u.uWidth, widths);
        for (const { m, f } of strokes) {
          const c = f.rgb || histBorderColor; colors[3 * HIST_KIND] = c[0]; colors[3 * HIST_KIND + 1] = c[1]; colors[3 * HIST_KIND + 2] = c[2]; gl.uniform3fv(A.u.uColor, colors);
          gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, m.gpu.coast.tex); gl.uniform1i(A.u.uSeg, 1);
          gl.bindVertexArray(emptyVao); gl.drawArrays(gl.TRIANGLES, 0, m.gpu.coast.count * 3); stats.draws++;
        }
      }
      if (useStencil) { gl.stencilFunc(gl.ALWAYS, 0, 0xff); gl.stencilMask(0xff); }
      stats.historyTriangles = tris; stats.historyFaces = drawn;
    }
    // the borders of the faces on screen (2b): each face's mesh carries its border segments at its level, tagged with the arc index
    // so the arc table still fades them; a border shared by two faces on screen is drawn twice, in one place
    function drawHistoryBorders(view, R) {
      const hv = view.history; stats.historySegments = 0;
      if (!hv || !hv.faces || !hv.faces.length || !hist.arcTex) return;
      const P = prog.arc; arcUniforms(P, view, R, false, 0);
      gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, hist.arcTex); gl.uniform1i(P.u.uArcTab, 3); gl.uniform1f(P.u.uArcTabOn, 1);
      gl.bindVertexArray(emptyVao);
      for (const f of hv.faces) {
        const m = histMeshFor(f.face, view.historyLevel != null ? view.historyLevel : view.level); if (!m || !m.gpu.border) continue;
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, m.gpu.border.tex); gl.uniform1i(P.u.uSeg, 1);
        gl.drawArrays(gl.TRIANGLES, 0, m.gpu.border.count * 3); stats.draws++; stats.historySegments += m.gpu.border.count;
      }
      gl.uniform1f(P.u.uArcTabOn, 0);
    }
    const tableSize = new WeakMap();   // texture → "w×h": a same-size table is re-filled in place (texSubImage2D), never reallocated — a year change uploads two tables a frame
    function uploadTable(tex, w, h, bytes, r8) {   // r8: one byte a texel (the arc table since 2b), else RGBA
      const t = tex || gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      const sz = w + "x" + h + (r8 ? "r" : "");
      if (tableSize.get(t) === sz) { gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, w, h, r8 ? gl.RED : gl.RGBA, gl.UNSIGNED_BYTE, bytes); return t; }
      tableSize.set(t, sz);
      gl.texImage2D(gl.TEXTURE_2D, 0, r8 ? gl.R8 : gl.RGBA, w, h, 0, r8 ? gl.RED : gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }
    function drawScene(view, idPass) {
      const rot = view.rot, cx = view.cx * dpr, cy = view.cy * dpr, radius = view.radius * dpr;
      const rel = !idPass && debug.relief && view.relief && view.relief.on && relief.get("0") && relief.get("0").gpu && ramp ? view.relief : null;
      const strength = rel ? rel.strength : 0, fade = rel ? rel.fade : 0;
      const patches = [];
      if (rel && fade > 0) for (const k of rel.tiles || []) { const r = relief.get(k); if (r && r.gpu) patches.push(r); }
      stats.reliefPatches = patches.length;
      const useStencil = !idPass;
      const R = transposed(rot);
      const Lv = pickLevel(levels, view.level, 2);
      stats.coreLevel = Lv ? Object.keys(levels).find((k) => levels[k] === Lv) | 0 : -1;
      const own = [], parents = [];
      let complete = false;
      if (view.level >= 3) {
        for (const k of view.tiles || []) { const t = tiles.get(k); if (t && t.gpu) own.push(t); }
        complete = own.length === (view.tiles || []).length;   // every tile the view wants is here: nothing coarser is needed anywhere
        if (!complete) for (const k of view.parents || []) { const t = tiles.get(k); if (t && t.gpu) parents.push(t); }
      }
      stats.tilesDrawn = own.length; stats.parentsDrawn = parents.length; stats.complete = complete;
      const tileStencil = useStencil && !complete && (own.length || parents.length);
      // faces write the LAND bit (relief's mask); the tile bits decide which set draws where
      const faceStencil = (ref) => { if (!useStencil) return; gl.stencilFunc(tileStencil ? gl.EQUAL : gl.ALWAYS, (tileStencil ? ref : 0) | ST_LAND, tileStencil ? ST_TILE : 0); gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE); gl.stencilMask(ST_LAND); };
      const arcStencil = (ref) => { if (!useStencil) return; gl.stencilFunc(tileStencil ? gl.EQUAL : gl.ALWAYS, ref, ST_TILE); gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP); gl.stencilMask(0xff); };
      /* THE STILL CACHE (Phase 2a). While the view does not move — a scrub of the rail, playback, a crossfade — the base
         (sphere, faces, relief) is rendered once into a texture with its stencil, copied into a scratch target each frame,
         and only the year's layers (the fills, the cached lines, the borders) are drawn on the copy, which one triangle
         then puts on the canvas. A moving view draws straight to the canvas as before: the cache costs a frame nothing
         until the second frame at one view. Measured on the session's software GL at the Mediterranean, 6 km/px: a frame
         that changed the year fell from 67 ms to the fills and borders alone. Both paths draw in the same order (faces,
         relief, fills, lines, borders) so the picture does not change when the view comes to rest. */
      const drawBase = () => {
      if (useStencil) { gl.enable(gl.STENCIL_TEST); gl.clearStencil(0); gl.stencilMask(0xff); gl.clear(gl.STENCIL_BUFFER_BIT); gl.stencilFunc(gl.ALWAYS, 0, 0xff); gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP); }
      if (!idPass && debug.sphere) {
        const P = prog.sphere; gl.useProgram(P.p);
        gl.bindVertexArray(emptyVao);
        gl.uniform2f(P.u.uCenter, cx, cy); gl.uniform2f(P.u.uSize, W, H); gl.uniform1f(P.u.uRadius, radius); gl.uniform1f(P.u.uHeight, H);
        gl.uniformMatrix3fv(P.u.uRotT, false, rot);   // a row-major R read column-major IS its transpose
        gl.uniform3fv(P.u.uOcean, palette.ocean); gl.uniform3fv(P.u.uRim, palette.rim); gl.uniform3fv(P.u.uHalo, palette.halo); gl.uniform3fv(P.u.uGrat, palette.grat);
        gl.uniform1f(P.u.uGratOn, view.graticule ? 1 : 0); gl.uniform1f(P.u.uHaloW, 0.06);
        // with no L1 patch on screen the bathymetry rides on this pass (one disc pass fewer); with patches the sea passes below paint it
        const sphereRelief = rel && !patches.length;
        gl.uniform1f(P.u.uReliefOn, sphereRelief ? 1 : 0); gl.uniform1f(P.u.uStrength, strength);
        if (sphereRelief) { const r0 = relief.get("0"); gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, r0.gpu.tex); gl.uniform1i(P.u.uRelief, 2); gl.uniform2f(P.u.uReliefSize, r0.w, r0.h); }
        gl.drawArrays(gl.TRIANGLES, 0, 6); stats.draws++;
      }
      if (tileStencil) {
        if (parents.length) drawExtents(parents.map((t) => ({ vao: t.gpu.vaoExt, count: t.gpu.extCount })), view, R, 1, ST_TILE);
        if (own.length) drawExtents(own.map((t) => ({ vao: t.gpu.vaoExt, count: t.gpu.extCount })), view, R, 2, ST_TILE);
      }
      // the resident level where no tile covers; the parents where only they do; the level's tiles over all
      if (debug.faces) {
        if (Lv && !complete) { faceStencil(0); drawFaces(Lv, view, idPass, R); }
        if (parents.length) { faceStencil(1); for (const t of parents) drawFaces(t, view, idPass, R); }
        if (own.length) { faceStencil(2); for (const t of own) drawFaces(t, view, idPass, R); }
        if (useStencil) { gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP); gl.stencilMask(0xff); }
      }
      /* RELIEF, EVERY PIXEL SHADED ONCE (Phase 1c). Until 1c the sphere pass sampled the L0 sheet for every
         pixel of the disc, each L1 patch then painted its whole rectangle as sea and again as land, and the
         L0 land pass ran over the lot: a relief fragment was shaded two to three times, and at the Europe
         view a relief-on frame cost 1.8× a relief-off one on software GL against the gate's 1.5. Now the
         sphere pass draws the ocean (with the L0 bathymetry while no patch is on screen — one disc pass
         fewer at the globe); after the faces have written the LAND bit, each L1 patch paints its SEA where
         LAND is clear (marking SEAP), the L0 sheet paints the sea where neither is set — and not at all when
         the patches cover the viewport, since on software GL a stencil-rejected fragment is not free — each
         patch paints its LAND where LAND is set (marking PATCH), and the L0 sheet the land no patch covered.
         The picture is the same — a face is opaque and the sea passes are — and the graticule rides on the
         sea passes as it does on the sphere. Measured on the session's runner (Europe, 3 km/px, 1280×800):
         a relief-on drag frame went from 1.78× its relief-off cost to 1.33×. */
      const seaStencil = (ref, mask, write) => { gl.stencilFunc(gl.EQUAL, ref, mask); gl.stencilOp(gl.KEEP, gl.KEEP, write ? gl.REPLACE : gl.KEEP); gl.stencilMask(write || 0); };
      const l0Needed = rel ? !patchesCover(patches, view) : false;
      stats.reliefL0 = rel ? (l0Needed ? 1 : 0) : -1;
      if (rel && useStencil && patches.length) {
        seaStencil(ST_SEAP, ST_LAND, ST_SEAP);              // LAND clear → paint, mark SEAP
        for (const r of patches) drawRelief(r, view, R, 0, strength, fade);
        if (l0Needed) { seaStencil(0, ST_LAND | ST_SEAP, 0); drawRelief(relief.get("0"), view, R, 0, strength, fade); }   // LAND and SEAP clear → the L0 sea
        gl.stencilMask(0xff); gl.stencilFunc(gl.ALWAYS, 0, 0xff);
      }
      // relief over the land: the patches first (each marks its pixels), then the L0 sheet where no patch did
      if (rel && fade > 0) {
        // a patch draws where the LAND bit is set and marks the PATCH bit (the ref carries both; the test masks the LAND bit only, the write the PATCH bit only)
        gl.stencilFunc(gl.EQUAL, ST_LAND | ST_PATCH, ST_LAND); gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE); gl.stencilMask(ST_PATCH);
        for (const r of patches) drawRelief(r, view, R, 1, strength, fade);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP); gl.stencilMask(0xff);
        if (l0Needed) { gl.stencilFunc(gl.EQUAL, ST_LAND, ST_LAND | ST_PATCH); drawRelief(relief.get("0"), view, R, 1, strength, fade); }
        gl.stencilFunc(gl.ALWAYS, 0, 0xff);
      }
        };
      const drawWaterAndArcs = () => {
      // water: rivers under the lakes, lakes under the borders
        if (!idPass && debug.water && (view.rivers || view.lakes)) {
          const Wl = pickLevel(water, Math.min(view.level, 2), 2);
          stats.waterLevel = Wl ? Object.keys(water).find((k) => water[k] === Wl) | 0 : -1;
          const wOwn = [];
          if (view.lakes && view.level >= 3) for (const k of view.waterTiles || []) { const t = waterTiles.get(k); if (t && t.gpu) wOwn.push(t); }
          stats.waterTilesDrawn = wOwn.length;
          if (useStencil && wOwn.length) drawExtents(wOwn.map((t) => t.gpu.ext), view, R, ST_WATER, ST_WATER);
          if (view.rivers && Wl) {
            const g = Wl.gpu, D = Wl.data;
            arcUniforms(prog.arc, view, R, false, ID_WATER_ARC);
            if (view.smoothRivers && g.smooth) drawSegs(g.smooth.tex, D.smoothRange, D.smoothCap, view, 0.01, "riverSegments");
            else if (g.river) drawSegs(g.river.tex, D.riverRange, D.riverCap, view, 0.01, "riverSegments");
          }
          if (view.lakes) {
            const residentWhere = () => { if (useStencil) gl.stencilFunc(wOwn.length ? gl.EQUAL : gl.ALWAYS, 0, ST_WATER); };
            const tileWhere = () => { if (useStencil) gl.stencilFunc(gl.EQUAL, ST_WATER, ST_WATER); };
            const nB = Wl && Wl.data.lakeBins ? BUCKETS_OF(Wl) : 0;
            if (Wl && Wl.gpu.fill) { residentWhere(); const f = binned(Wl.data.faceRange, Wl.data.faceCap, Wl.data.lakeBins, view.kmpp, nB, "lakeCulled"); drawFill(Wl.gpu.fill.vao, Wl.gpu.fill.u16, f.range, f.cap, view, false, R, 0.01, palette.lake, "lakeTriangles"); }
            if (wOwn.length) { tileWhere(); for (const t of wOwn) drawFill(t.gpu.fill.vao, t.gpu.fill.u16, t.data.faceRange, t.data.faceCap, view, false, R, 0.002, palette.lake, "lakeTriangles"); }
            arcUniforms(prog.arc, view, R, false, ID_WATER_ARC);
            if (Wl && Wl.gpu.lake) { residentWhere(); const s = binned(Wl.data.lakeRange, Wl.data.lakeCap, Wl.data.lakeBins, view.kmpp, nB, "lakeSegCulled"); drawSegs(Wl.gpu.lake.tex, s.range, s.cap, view, 0.01, "lakeSegments"); }
            if (wOwn.length) { tileWhere(); for (const t of wOwn) if (t.gpu.lake) drawSegs(t.gpu.lake.tex, t.data.lakeRange, t.data.lakeCap, view, 0.002, "lakeSegments"); }
            if (useStencil) gl.stencilFunc(gl.ALWAYS, 0, 0xff);
          }
        } else stats.waterTilesDrawn = 0;
        // the land's lines over everything — not in an ID pass: a tap on a coast or a lake shore names the face under it
        // (a coastal capital, an atoll at the cap, a lake), and nothing reads a line's id yet
        if (debug.arcs && !idPass) {
          if (Lv && !complete) { arcStencil(0); drawArcs(Lv, view, idPass, R); }
          if (parents.length) { arcStencil(1); for (const t of parents) drawArcs(t, view, idPass, R); }
          if (own.length) { arcStencil(2); for (const t of own) drawArcs(t, view, idPass, R); }
          if (useStencil) gl.stencilFunc(gl.ALWAYS, 0, 0xff);
        }
      };
      const drawLinesLayer = (target) => {
      // the line layer: a texture while the view is still (its key: the view, the sizes, every upload), else drawn here
      if (!idPass && lines.on) {
        const key = Array.from(rot).map((v) => v.toFixed(6)).join(",") + "|" + radius.toFixed(2) + "|" + cx.toFixed(1) + "|" + cy.toFixed(1) + "|" + W + "x" + H + "|" + view.level + "|" + (view.kmpp || 0).toFixed(4) + "|" + (view.tiles || []).join(",") + "|" + (view.waterTiles || []).join(",") + "|" + (view.rivers ? 1 : 0) + (view.lakes ? 1 : 0) + (view.smoothRivers ? 1 : 0) + (debug.water ? 1 : 0) + (debug.arcs ? 1 : 0) + "|" + dataGen;
        if (linesTarget()) {
          if (lines.key !== key) {
            const before = snapCounts();
            gl.bindFramebuffer(gl.FRAMEBUFFER, lines.fbo); gl.viewport(0, 0, W, H);
            gl.clearColor(0, 0, 0, 0); gl.clearStencil(0); gl.stencilMask(0xff); gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            if (useStencil) { gl.stencilFunc(gl.ALWAYS, 0, 0xff); gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP); }
            if (tileStencil) {   // the tile bits again, in this target's stencil
              if (parents.length) drawExtents(parents.map((t) => ({ vao: t.gpu.vaoExt, count: t.gpu.extCount })), view, R, 1, ST_TILE);
              if (own.length) drawExtents(own.map((t) => ({ vao: t.gpu.vaoExt, count: t.gpu.extCount })), view, R, 2, ST_TILE);
            }
            drawWaterAndArcs();
            gl.bindFramebuffer(gl.FRAMEBUFFER, target); gl.viewport(0, 0, W, H);
            lines.key = key; lines.rendered++; lines.counts = diffCounts(before);
          } else { lines.reused++; addCounts(lines.counts); }   // the layer's primitives count toward the frame's budgets whether drawn or reused
          const P = prog.blit; gl.useProgram(P.p); gl.bindVertexArray(emptyVao);
          if (useStencil) { gl.stencilFunc(gl.ALWAYS, 0, 0xff); gl.stencilMask(0); }
          gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, lines.tex); gl.uniform1i(P.u.uTex, 0);
          gl.drawArrays(gl.TRIANGLES, 0, 3); stats.draws++;
          if (useStencil) gl.stencilMask(0xff);
        } else drawWaterAndArcs();
      } else drawWaterAndArcs();
      };
      const stillKey = !idPass && still.on ? Array.from(rot).map((v) => v.toFixed(6)).join(",") + "|" + radius.toFixed(2) + "|" + cx.toFixed(1) + "|" + cy.toFixed(1) + "|" + W + "x" + H + "|" + view.level + "|" + (view.kmpp || 0).toFixed(4) + "|" + (view.tiles || []).join(",") + "|" + (view.parents || []).join(",") + "|" + (view.graticule ? 1 : 0) + (debug.sphere ? 1 : 0) + (debug.faces ? 1 : 0) + "|" + (rel ? strength.toFixed(3) + "/" + fade.toFixed(3) + "/" + patches.map((r) => r.key || "").join(",") : "-") + "|" + dataGen : null;
      if (stillKey && stillKey === still.lastKey && stillTargets()) {
        if (still.key !== stillKey) {
          const before = snapCounts();
          gl.bindFramebuffer(gl.FRAMEBUFFER, still.fbo); gl.viewport(0, 0, W, H);
          gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
          drawBase();
          gl.disable(gl.STENCIL_TEST);
          still.key = stillKey; still.rendered++; still.counts = diffCounts(before);
        } else { still.reused++; addCounts(still.counts); }
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, still.fbo); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, still.scratch);
        gl.blitFramebuffer(0, 0, W, H, 0, 0, W, H, gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT, gl.NEAREST);
        gl.bindFramebuffer(gl.FRAMEBUFFER, still.scratch); gl.viewport(0, 0, W, H);
        gl.enable(gl.STENCIL_TEST); gl.stencilFunc(gl.ALWAYS, 0, 0xff); gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP); gl.stencilMask(0xff);
        if (debug.faces) drawHistoryFills(view, idPass, R, useStencil);
        drawLinesLayer(still.scratch);
        if (debug.arcs) drawHistoryBorders(view, R);
        gl.disable(gl.STENCIL_TEST);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
        const P = prog.blit; gl.useProgram(P.p); gl.bindVertexArray(emptyVao);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, still.scratchTex); gl.uniform1i(P.u.uTex, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3); stats.draws++;
      } else {
        drawBase();
        if (debug.faces) drawHistoryFills(view, idPass, R, useStencil);
        drawLinesLayer(null);
        if (debug.arcs && !idPass) drawHistoryBorders(view, R);
        if (useStencil) gl.disable(gl.STENCIL_TEST);
      }
      if (stillKey) still.lastKey = stillKey;
    }
    // what a cached layer would have drawn: its counters are snapshotted when it is rendered and added back when it is reused
    const COUNT_KEYS = ["segmentsDrawn", "riverSegments", "lakeSegments", "lakeTriangles", "lakeCulled", "lakeSegCulled", "trianglesDrawn", "draws", "tilesDrawn", "parentsDrawn", "waterTilesDrawn", "reliefPatches"];
    const snapCounts = () => { const o = {}; for (const k of COUNT_KEYS) o[k] = stats[k] || 0; return o; };
    const diffCounts = (before) => { const o = {}; for (const k of COUNT_KEYS) o[k] = (stats[k] || 0) - before[k]; return o; };
    const addCounts = (c) => { if (!c) return; for (const k of COUNT_KEYS) stats[k] = (stats[k] || 0) + c[k]; };
    // the still cache's two targets at the canvas's size (colour texture + depth-stencil renderbuffer each)
    function stillTargets() {
      if (still.fbo && still.w === W && still.h === H) return true;
      const make = (o) => { if (!o.fbo) { o.fbo = gl.createFramebuffer(); o.tex = gl.createTexture(); o.rb = gl.createRenderbuffer(); } gl.bindTexture(gl.TEXTURE_2D, o.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.bindRenderbuffer(gl.RENDERBUFFER, o.rb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, W, H); gl.bindFramebuffer(gl.FRAMEBUFFER, o.fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, o.tex, 0); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, o.rb); const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE; gl.bindFramebuffer(gl.FRAMEBUFFER, null); return ok; };
      const a = { fbo: still.fbo, tex: still.tex, rb: still.rb }, b = { fbo: still.scratch, tex: still.scratchTex, rb: still.scratchRb };
      const ok = make(a) && make(b);
      Object.assign(still, { fbo: a.fbo, tex: a.tex, rb: a.rb, scratch: b.fbo, scratchTex: b.tex, scratchRb: b.rb });
      if (!ok) { still.on = false; stats.stillOff = "incomplete framebuffer"; return false; }
      still.w = W; still.h = H; still.key = ""; return true;
    }
    // the line layer's target at the canvas's size: a colour texture and a stencil renderbuffer; a target the context refuses turns the cache off
    function linesTarget() {
      if (lines.fbo && lines.w === W && lines.h === H) return true;
      if (!lines.fbo) { lines.fbo = gl.createFramebuffer(); lines.tex = gl.createTexture(); lines.rb = gl.createRenderbuffer(); }
      gl.bindTexture(gl.TEXTURE_2D, lines.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindRenderbuffer(gl.RENDERBUFFER, lines.rb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, W, H);
      gl.bindFramebuffer(gl.FRAMEBUFFER, lines.fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, lines.tex, 0);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, lines.rb);
      const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      if (!ok) { lines.on = false; stats.linesOff = "incomplete framebuffer"; return false; }
      lines.w = W; lines.h = H; lines.key = ""; return true;
    }
    // a resident water level's direction-bucket count (the bin tables repeat it per bin)
    const BUCKETS_OF = (Wl) => Wl.data.lakeRange.length / 2 / (Wl.data.lakeBins.length + 1);
    const _t = new Float32Array(9);
    function transposed(m) { _t[0] = m[0]; _t[1] = m[3]; _t[2] = m[6]; _t[3] = m[1]; _t[4] = m[4]; _t[5] = m[7]; _t[6] = m[2]; _t[7] = m[5]; _t[8] = m[8]; return _t; }

    return {
      gl, debug,
      get lost() { return lost; },
      levelLoaded(l) { return !!(levels[l] && levels[l].gpu); },
      levelData(l) { return levels[l] ? levels[l].data : null; },
      setLevel(level, data) { dataGen++;
        levels[level] = { data };
        if (!lost) upload(levels[level]);
      },
      setTile(key, data, tile) { dataGen++;
        if (tiles.has(key)) release(tiles.get(key));
        const t = { data, tile };
        tiles.set(key, t);
        if (!lost) upload(t);
      },
      dropTile(key) { dataGen++; const t = tiles.get(key); if (!t) return; release(t); tiles.delete(key); },
      tileLoaded(key) { const t = tiles.get(key); return !!(t && t.gpu); },
      tileCount() { return tiles.size; },
      setWaterLevel(level, data) { dataGen++; if (water[level]) releaseWater(water[level]); water[level] = { data }; if (!lost) uploadWater(water[level]); },
      waterLevelLoaded(l) { return !!(water[l] && water[l].gpu); },
      setWaterTile(key, data, tile) { dataGen++; if (waterTiles.has(key)) releaseWater(waterTiles.get(key)); const t = { data, tile }; waterTiles.set(key, t); if (!lost) uploadWater(t); },
      dropWaterTile(key) { dataGen++; const t = waterTiles.get(key); if (!t) return; releaseWater(t); waterTiles.delete(key); },
      waterTileLoaded(key) { const t = waterTiles.get(key); return !!(t && t.gpu); },
      setRelief(key, r) { dataGen++; if (relief.has(key)) releaseRelief(relief.get(key)); const e = { w: r.w, h: r.h, rgb: r.rgb, tile: r.tile || null }; relief.set(key, e); if (!lost) uploadRelief(e); },
      dropRelief(key) { dataGen++; const r = relief.get(key); if (!r) return; releaseRelief(r); relief.delete(key); },
      reliefLoaded(key) { const r = relief.get(key); return !!(r && r.gpu); },
      reliefCount() { return relief.size; },
      setRamp(bytes) { dataGen++; ramp = bytes; if (!lost) uploadRamp(); },
      /* Phase 2a: the step topology */
      setHistorySegs() {},   // 2b: the borders travel with each face's mesh; nothing per level
      historySegsLoaded() { return true; },
      setHistoryMesh(key, m) {
        if (hist.meshes.has(key)) this.dropHistoryMesh(key);
        const f = uploadFill(m.pos, m.idx);
        const coast = m.coast && m.coast.length ? uploadSegs(m.coast) : null, border = m.border && m.border.length ? uploadSegs(m.border) : null;
        hist.meshes.set(key, { face: m.face, level: m.level, gpu: { vao: f.vao, pos: f.pos, idx: f.idx, count: f.count, u16: f.u16, bytes: f.bytes, coast, border } });
      },
      dropHistoryMesh(key) { const m = hist.meshes.get(key); if (!m) return; releaseFill(m.gpu); if (m.gpu.coast) releaseSegs(m.gpu.coast); if (m.gpu.border) releaseSegs(m.gpu.border); hist.meshes.delete(key); },
      historyMeshLoaded(key) { const m = hist.meshes.get(key); return !!(m && m.gpu); },
      historyMeshInfo(key) { const m = hist.meshes.get(key); return m && m.gpu ? { triangles: m.gpu.count / 3, coast: m.gpu.coast ? m.gpu.coast.count : 0, border: m.gpu.border ? m.gpu.border.count : 0 } : null; },   // for the suites (2b)
      historyMeshCount() { return hist.meshes.size; },
      // the face style table: RGBA bytes per history face (alpha 0 = not alive); the arc table: alpha per history arc
      setHistoryStyle(n, bytes) { if (lost) return; const h = Math.max(1, Math.ceil(n / 256)); const px = bytes.length === 256 * h * 4 ? bytes : (() => { const b = new Uint8Array(256 * h * 4); b.set(bytes.subarray(0, Math.min(bytes.length, b.length))); return b; })(); hist.sIdx = (hist.sIdx | 0) ^ 1; hist.sTex = hist.sTex || [null, null]; hist.sTex[hist.sIdx] = uploadTable(hist.sTex[hist.sIdx], 256, h, px); hist.styleTex = hist.sTex[hist.sIdx]; hist.styleN = n; },   // two textures in turn: an upload never touches the one the last frame still reads (a scrub re-uploads every frame)
      setHistoryArcTable(n, bytes) { if (lost) return; const h = Math.max(1, Math.ceil(n / 256)); const px = bytes.length === 256 * h ? bytes : (() => { const b = new Uint8Array(256 * h); b.set(bytes.subarray(0, Math.min(bytes.length, b.length))); return b; })(); hist.aIdx = (hist.aIdx | 0) ^ 1; hist.aTex = hist.aTex || [null, null]; hist.aTex[hist.aIdx] = uploadTable(hist.aTex[hist.aIdx], 256, h, px, true); hist.arcTex = hist.aTex[hist.aIdx]; hist.arcN = n; },
      setHistoryBorderColor(c) { histBorderColor = typeof c === "string" ? hex2rgb(c) : c; },
      clearHistory() { for (const k of [...hist.meshes.keys()]) this.dropHistoryMesh(k); },
      setFaceCount(n) { faceCount = n; if (!lost) buildStyle(); },
      setPalette(p) { dataGen++;
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
        stats.draws = 0; stats.trianglesDrawn = 0; stats.segmentsDrawn = 0; stats.riverSegments = 0; stats.lakeSegments = 0; stats.lakeTriangles = 0; stats.lakeCulled = 0; stats.lakeSegCulled = 0; stats.level = view.level;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, W, H);
        gl.disable(gl.SCISSOR_TEST); gl.disable(gl.STENCIL_TEST);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        // scissor to the disc + halo, so software GL shades nothing it will discard
        const r = view.radius * dpr * 1.07, cx = view.cx * dpr, cy = view.cy * dpr;
        const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(W, Math.ceil(cx + r)), yTop = Math.max(0, Math.floor(cy - r)), yBot = Math.min(H, Math.ceil(cy + r));
        if (x1 <= x0 || yBot <= yTop) return;
        gl.enable(gl.SCISSOR_TEST); gl.scissor(x0, H - yBot, x1 - x0, yBot - yTop);
        const q = gpuBegin();
        drawScene(view, false);
        gpuEnd(q);
        gl.disable(gl.SCISSOR_TEST);
        stats.frames++; stats.lastMs = performance.now() - t0;
      },
      gpuTimer() { return !!timerExt; },
      gpuMs() { return gpuLast; },
      gpuMsFrame() { return gpuLastFrame; },
      /* the ID pass at one pixel. mode "land" (the default): faces and the land's lines, as since Phase 0;
         mode "water" (Phase 1c): lake fills and the rivers alone, a river reaching 8 CSS px either side of its
         line. atlas.js reads both for a tap and stacks what they name. */
      pick(view, x, y, mode) {
        if (lost) return null;
        const px = Math.round(x * dpr), py = Math.round(y * dpr);
        if (px < 0 || py < 0 || px >= W || py >= H) return null;
        gl.bindFramebuffer(gl.FRAMEBUFFER, idFbo);
        // shift the viewport so device pixel (px, py) — y down — lands on the 1×1 target's (0,0)
        gl.viewport(-px, -(H - 1 - py), W, H);
        pickOff[0] = px; pickOff[1] = H - 1 - py;   // the arc shader measures a fragment's distance to its line in device pixels
        gl.disable(gl.SCISSOR_TEST); gl.disable(gl.STENCIL_TEST);
        gl.disable(gl.BLEND);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        // the tiles are drawn too (Phase 1c): without a stencil the order resident → parents → own tiles gives the
        // finest loaded face the last word, and an islet the resident level has no ring for is still picked
        if (mode === "water") drawWaterIds(view); else drawScene(view, true);
        const out = new Uint8Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, out);
        gl.enable(gl.BLEND);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        pickOff[0] = 0; pickOff[1] = 0;
        const id = out[0] + (out[1] << 8) + (out[2] << 16);
        if (!id) return null;
        // an arc's id is its index plus the base (the arc shader adds nothing else); a face's is its index plus one
        if (id >= ID_WATER_ARC) return { waterArc: id - ID_WATER_ARC };
        if (id >= ID_LAND_ARC) return { arc: id - ID_LAND_ARC };
        if (id > LAKE_FACE_BASE) return { lakeFace: id - 1 - LAKE_FACE_BASE };
        if (id > HIST_FACE_BASE) return { histFace: id - 1 - HIST_FACE_BASE };
        return { face: id - 1 };
      },
      linesCache(on) { lines.on = on !== false; lines.key = ""; },
      stillCache(on) { still.on = on !== false; still.key = ""; still.lastKey = ""; },
      stats() { return { linesReused: lines.reused, linesRendered: lines.rendered, linesOn: lines.on, baseReused: still.reused, baseRendered: still.rendered, baseOn: still.on, triangles: stats.trianglesDrawn, segments: stats.segmentsDrawn, historyTriangles: stats.historyTriangles, historySegments: stats.historySegments, historyFaces: stats.historyFaces, historyMeshes: hist.meshes.size, riverSegments: stats.riverSegments, lakeSegments: stats.lakeSegments, lakeTriangles: stats.lakeTriangles, lakeCulled: Math.round(stats.lakeCulled), lakeSegCulled: stats.lakeSegCulled, reliefPatches: stats.reliefPatches, draws: stats.draws, level: stats.level, coreLevel: stats.coreLevel, waterLevel: stats.waterLevel, tilesDrawn: stats.tilesDrawn, parentsDrawn: stats.parentsDrawn, waterTilesDrawn: stats.waterTilesDrawn, complete: !!stats.complete, tilesResident: tiles.size, waterTilesResident: waterTiles.size, reliefResident: relief.size, reliefL0: stats.reliefL0, lastMs: stats.lastMs, frames: stats.frames, visibleAngle: stats.visibleAngle, restores: stats.restores, gpuBytes: stats.gpuBytes, gpuTextureBytes: stats.gpuTextureBytes }; },
      rawStats: stats,
      dispose() {
        try { const ext = gl.getExtension("WEBGL_lose_context"); if (ext) ext.loseContext(); } catch (e) {}
      },
    };
  }

  root.AtlasGL = { create, hex2rgb };
})(typeof window !== "undefined" ? window : globalThis);
