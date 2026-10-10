/* atlas-format.js — the `.bin` topology format of Atlas v2, reader AND writer in one file.

   WHY ONE FILE. docs/atlas-v2-design.md §2.3 says the wire format is Folio's own binary, and §7
   Phase 0 asks for "a zero-dependency reader shared with the checker and the runtime". A reader
   that exists twice drifts; this file is loaded by the browser (atlas/atlas.js and the worker), by
   `.claude/atlas-build/lib/format.js` (which re-exports it for pack.js and check-topology.js) and by
   the Playwright suites, so there is exactly one definition of every byte. The writer rides along
   because it is a hundred lines and the only way to keep encode and decode provably symmetric is
   to keep them side by side; the browser never calls it.

   No dependencies, no DOM, no `require` at the top level: the file assigns `AtlasFormat` to
   whatever global it finds (window, a worker's self, or module.exports).

   ─────────────────────────────────────────────────────────────────────────────────────────
   LAYOUT (all integers little-endian)

     bytes 0–7     magic  "FOLIOTOP"
     bytes 8–11    u32    format version (FORMAT_VERSION)
     bytes 12–15   u32    byte length of the JSON header
     bytes 16–     the JSON header, UTF-8
     then          the sections, each starting on a 4-byte boundary, located by header.sections

   THE HEADER is JSON because it is small and read by humans in a PR: `sources` (the machine-readable
   licence block §2.10a demands of every generated file), the quantum, the LOD table, the entity and
   step tables, and the offset/length of every binary section. A reader that only wants the credits
   never touches a section.

   THE SECTIONS are varint streams or typed arrays:

     verts   zig-zag delta varints of quantised (lon, lat), arc by arc. Within an arc every vertex is
             a delta from the previous one; an arc's first vertex is a delta from the previous arc's
             last vertex (TopoJSON's convention, so neighbouring arcs cost nothing to start).
     ranks   the coarsest LOD the vertex survives at (0 = globe … lodCount-1 = finest), 2 bits per
             vertex (four to a byte) when the file has at most 4 levels — every shipped file — and
             4 bits (two to a byte) in the build's intermediate, which carries 5. An arc's endpoints
             are always rank 0.
     arcs    per arc: varint vertexCount, u8 kind (KIND.*), u8 sourceIndex (into header.sources),
             u8 minLod (the coarsest LOD at which this arc is drawn at all — a closed island ring
             smaller than a level's tolerance vanishes at that level rather than collapsing into a
             line), u8 flags (FLAG.*: DISPUTED marks a border the sources disagree on — one polygon's
             line with no neighbour sharing it, or a chord across water — which §2.4 draws dashed;
             WATER marks a border running through water; INTERMITTENT (Phase 1b) a river Natural Earth
             classes as intermittent, drawn dashed like a disputed border).
             Vertex offsets are cumulative, so they are not stored.
     arcRef  OPTIONAL (tiles only, Phase 1a): per arc, varint (core arc index + 1, 0 = this arc exists
             only in the tile — an islet too small for the resident levels, or a tile-edge chord) and
             u8 bits: 1 = the piece begins at the core arc's first vertex, 2 = it ends at its last.
             A tile arc is a PIECE of a core arc clipped to the tile; the checker proves the piece's
             outer ends coincide with the core arc's endpoints.
     faces   per face: varint entityIndex, u8 sourceIndex, varint ringCount, then per ring: varint
             refCount and refCount zig-zag varints of SIGNED arc references — (arc+1) when the arc
             is walked forward, -(arc+1) when walked backward. The face is on the LEFT of every arc
             as walked (counter-clockwise outer rings, clockwise holes, on the sphere).
     faceRef OPTIONAL (tiles only): per face, varint (core face index + 1). A tile face is a piece of
             a core face clipped to the tile; its `entity` indexes the CORE header's entity table (a
             tile carries no entity table of its own — header.core names the core file it belongs to).
     jpos    OPTIONAL (history.bin): every core-referencing arc's two junctions at each coarser level (0 … lodCount-2):
             zig-zag varint deltas (dx, dy) from the junction's LOD 2 position and the zig-zag delta of the level
             segment's END vertex offset from the LOD 2 one (coreRef's segA/segB) — junction A's levels, then junction
             B's, per core-referencing arc in arc order (own arcs write nothing). The build puts a junction where the
             border leaving the coast crosses the level's coast line, which may be a neighbouring level segment, and the
             piece's inner vertices at that level are those between the two junctions' level segments. `junctionAt`
             (the arc-length fraction on the level segment holding the LOD 2 one) is the fallback when the section is
             absent. A reader uses it through historyJunctions / historyArcGeometry.
     coreRef OPTIONAL (the step topology atlas/data/history.bin, Phase 2a): per arc, varint (core arc
             index + 1, 0 = the arc's own vertices are its geometry), varint `from`, varint `to` —
             vertex offsets WITHIN the core arc, inclusive, `from` > `to` meaning the core arc is
             walked backwards — then varint `segA`, varint `segB`: the core segment each junction lies
             on, as the offset of that segment's END vertex within the arc (the segment is (seg−1, seg)
             in file order; 0 when the range is whole-arc and the junction is the arc's own endpoint).
             Such an arc stores exactly TWO vertices of its own: its endpoints, which are junctions
             snapped onto the core's LOD 2 line (a point on a coast segment where a historical border
             meets the sea); its full geometry at a level is junction A, the core vertices [from..to]
             surviving that level, junction B — where AT A COARSER LEVEL A JUNCTION IS MOVED ONTO THAT
             LEVEL'S LINE (`junctionAt`: projected onto the level's segment that contains its LOD 2
             segment), so the coast stays exactly the core's line at every level and a border starting
             at the junction starts on it. An own arc whose endpoint is such a junction takes the same
             moved point at that level (the reader matches endpoints to junctions by position). A historical border that follows the coast
             is thus a reference by id to the OSM coast, never a second line beside it (§2.3 d1), and a
             border inherited from a present-day line references that BORDER arc the same way (d3).

   Everything a renderer needs that is not here (unit vectors, triangles, per-LOD segment lists) is
   derived at load time in the worker; the file carries one copy of each vertex and nothing that a
   client can compute in under a second.
   ───────────────────────────────────────────────────────────────────────────────────────── */
(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.AtlasFormat = api;
})(typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const MAGIC = "FOLIOTOP";
  const FORMAT_VERSION = 2;   // 2 (Phase 1a): ADMIN1 and EDGE kinds, WATER flag, 4-bit ranks above 4 levels, arcRef/faceRef sections
  // arc kinds (§2.3): coast, land border, river, lake shore, soft edge (a people's uncertain extent),
  // admin-1 border (inside one country, drawn thinner and only past a zoom threshold), tile edge (a
  // chord along a tile's boundary closing a clipped fill ring — never stroked)
  const KIND = { COAST: 0, BORDER: 1, RIVER: 2, LAKE: 3, SOFT: 4, ADMIN1: 5, EDGE: 6 };
  const KIND_NAME = ["coast", "border", "river", "lake", "soft", "admin1", "edge"];
  // DISPUTED: a border the sources disagree on (one polygon's own line, or a line where one source
  // says land and the other water) — drawn dashed. WATER: a border running over sea or lake (the
  // US–Canada line through the Great Lakes, a tripoint in Lake Victoria): no face on either side.
  // OPEN (Phase 2a): a historical border with a face on one side and unmapped land on the other (the source
  // draws no neighbour there); drawn solid, and the checker allows it to be used once. Bits above 4 never
  // reach the arc shader's tag (which carries flags & 7).
  const FLAG = { DISPUTED: 1, WATER: 2, INTERMITTENT: 4, OPEN: 8 };
  const rankBitsFor = (lodCount) => (lodCount <= 4 ? 2 : 4);

  /* ---------- varints ---------- */
  function zig(n) { return n < 0 ? (-n * 2 - 1) : n * 2; }       // zig-zag: small magnitudes stay small
  function zag(u) { return (u & 1) ? -((u + 1) / 2) : u / 2; }

  // A growable byte sink for the writer. Plain arithmetic, no BigInt: values stay below 2^53.
  function ByteSink(initial) {
    let buf = new Uint8Array(initial || 1 << 16), n = 0;
    const grow = (need) => { if (n + need <= buf.length) return; let L = buf.length; while (L < n + need) L *= 2; const b = new Uint8Array(L); b.set(buf.subarray(0, n)); buf = b; };
    return {
      u8(v) { grow(1); buf[n++] = v & 255; },
      varint(u) { grow(10); while (u >= 128) { buf[n++] = (u % 128) | 128; u = Math.floor(u / 128); } buf[n++] = u; },
      svarint(i) { this.varint(zig(i)); },
      bytes(arr) { grow(arr.length); buf.set(arr, n); n += arr.length; },
      get length() { return n; },
      result() { return buf.slice(0, n); },
    };
  }

  // A cursor over a byte range for the reader.
  function Cursor(u8, start, end) {
    let p = start;
    return {
      get pos() { return p; }, get done() { return p >= end; },
      u8() { return u8[p++]; },
      varint() { let r = 0, m = 1, b; do { b = u8[p++]; r += (b & 127) * m; m *= 128; } while (b & 128); return r; },
      svarint() { return zag(this.varint()); },
    };
  }

  /* ---------- writer ----------
     topology = {
       quantum, lod: { intervals_m: [...] }, generated, generator, sources: [...],
       entities: [...], steps: [...],
       vertices: { lon: Int32Array|number[] (quantised units), lat: ... }, rank: Uint8Array|number[],
       arcs: [{ offset, count, kind, source, minLod, flags }],   // offsets index `vertices`, in file order
       faces: [{ entity, source, rings: [[signedRef, ...], ...] }],
       extra: {}                                               // anything else to carry in the header
     } */
  function write(topology) {
    const T = topology;
    const nV = T.vertices.lon.length;
    if (T.vertices.lat.length !== nV || T.rank.length !== nV) throw new Error("vertex arrays disagree in length");
    const lodCount = T.lod.intervals_m.length;
    if (lodCount < 1 || lodCount > 15) throw new Error("1–15 LOD levels");
    const rb = rankBitsFor(lodCount), perByte = 8 / rb, mask = (1 << rb) - 1;

    // verts: arc by arc, so an arc's first vertex is a delta from the previous arc's last
    const verts = ByteSink(nV * 4);
    let px = 0, py = 0, expect = 0;
    for (const a of T.arcs) {
      if (a.offset !== expect) throw new Error("arcs must tile the vertex array in order (arc at " + a.offset + ", expected " + expect + ")");
      for (let i = a.offset; i < a.offset + a.count; i++) {
        const x = T.vertices.lon[i], y = T.vertices.lat[i];
        verts.svarint(x - px); verts.svarint(y - py); px = x; py = y;
      }
      expect += a.count;
    }
    if (expect !== nV) throw new Error("arcs cover " + expect + " vertices of " + nV);

    // ranks: 2 or 4 bits each
    const ranks = new Uint8Array(Math.ceil(nV / perByte));
    for (let i = 0; i < nV; i++) {
      const r = T.rank[i];
      if (r < 0 || r >= lodCount) throw new Error("rank out of range at vertex " + i);
      ranks[Math.floor(i / perByte)] |= r << ((i % perByte) * rb);
    }

    // arcs
    const arcs = ByteSink(T.arcs.length * 4);
    for (const a of T.arcs) {
      if (a.count < 1) throw new Error("empty arc");
      if (T.rank[a.offset] !== 0 || T.rank[a.offset + a.count - 1] !== 0) throw new Error("arc endpoints must be rank 0 (arc at " + a.offset + ")");
      if (a.source < 0 || a.source >= T.sources.length) throw new Error("arc source index " + a.source + " not in header.sources");
      arcs.varint(a.count); arcs.u8(a.kind); arcs.u8(a.source); arcs.u8(a.minLod || 0); arcs.u8(a.flags || 0);
    }

    // faces
    const faces = ByteSink(T.faces.length * 64);
    const nEntities = T.entityCount != null ? T.entityCount : T.entities.length;   // a tile carries no entity table: its faces index the core's (header.core.entities)
    for (const f of T.faces) {
      if (f.entity < 0 || f.entity >= nEntities) throw new Error("face entity index out of range");
      if (f.source < 0 || f.source >= T.sources.length) throw new Error("face source index " + f.source + " not in header.sources");
      faces.varint(f.entity); faces.u8(f.source); faces.varint(f.rings.length);
      for (const ring of f.rings) {
        faces.varint(ring.length);
        for (const ref of ring) {
          if (ref === 0 || Math.abs(ref) > T.arcs.length) throw new Error("face ref " + ref + " names no arc");
          faces.svarint(ref);
        }
      }
    }

    const sectionList = [["verts", verts.result()], ["ranks", ranks], ["arcs", arcs.result()], ["faces", faces.result()]];
    if (T.arcRef) {
      if (T.arcRef.length !== T.arcs.length) throw new Error("arcRef length");
      const s = ByteSink(T.arcs.length * 3);
      for (let i = 0; i < T.arcs.length; i++) { const r = T.arcRef[i]; s.varint(r.core == null || r.core < 0 ? 0 : r.core + 1); s.u8(r.bits || 0); }
      sectionList.push(["arcRef", s.result()]);
    }
    if (T.faceRef) {
      if (T.faceRef.length !== T.faces.length) throw new Error("faceRef length");
      const s = ByteSink(T.faces.length * 3);
      for (let i = 0; i < T.faces.length; i++) s.varint(T.faceRef[i] == null || T.faceRef[i] < 0 ? 0 : T.faceRef[i] + 1);
      sectionList.push(["faceRef", s.result()]);
    }
    if (T.coreRef) {
      if (T.coreRef.length !== T.arcs.length) throw new Error("coreRef length");
      const s = ByteSink(T.arcs.length * 6);
      for (let i = 0; i < T.arcs.length; i++) { const r = T.coreRef[i]; if (!r || r.core == null || r.core < 0) { s.varint(0); s.varint(0); s.varint(0); s.varint(0); s.varint(0); continue; } if (T.arcs[i].count !== 2) throw new Error("a core-referencing arc stores exactly its two junction vertices (arc " + i + ")"); s.varint(r.core + 1); s.varint(r.from); s.varint(r.to); s.varint(r.segA || 0); s.varint(r.segB || 0); }
      sectionList.push(["coreRef", s.result()]);
    }
    if (T.jpos) {
      if (!T.coreRef) throw new Error("jpos needs coreRef");
      const levels = lodCount - 1; const s = ByteSink(T.arcs.length * 8);
      for (let i = 0; i < T.arcs.length; i++) { const r = T.coreRef[i]; if (!r || r.core == null || r.core < 0) continue; const j = T.jpos[i]; if (!j || j.a.length !== levels || j.b.length !== levels) throw new Error("jpos: arc " + i + " needs " + levels + " positions per junction"); const o = T.arcs[i].offset; for (const [end, vi, seg] of [["a", o, r.segA || 0], ["b", o + 1, r.segB || 0]]) for (let L = 0; L < levels; L++) { const p = j[end][L]; s.varint(zig(p[0] - T.vertices.lon[vi])); s.varint(zig(p[1] - T.vertices.lat[vi])); s.varint(zig((p[2] == null ? seg : p[2]) - seg)); } }
      sectionList.push(["jpos", s.result()]);
    }
    const header = Object.assign({}, T.extra || {}, {
      format: FORMAT_VERSION,
      generated: T.generated, generator: T.generator,
      sources: T.sources,
      quantum: T.quantum,
      lod: T.lod,
      counts: { vertices: nV, arcs: T.arcs.length, faces: T.faces.length, entities: T.entities.length, steps: T.steps.length },
      entities: T.entities,
      steps: T.steps,
      sections: {},
    });
    // lay the sections out after the header; the header's own length is only known once the
    // offsets are in it, so size the offsets against a header serialised with placeholder offsets
    // of the final width (every offset is written as a fixed-width number string, so the length
    // of the JSON does not change when the real values go in)
    const pad = (n) => String(n).padStart(10, "0");
    for (const [name, bytes] of sectionList) header.sections[name] = { offset: pad(0), length: bytes.length };
    const probe = new TextEncoder().encode(JSON.stringify(header));
    const headerLen = probe.length;
    const base = 16 + headerLen;
    let off = base + ((4 - base % 4) % 4);
    for (const [name, bytes] of sectionList) {
      header.sections[name].offset = pad(off);
      off += bytes.length; off += (4 - off % 4) % 4;
    }
    const headerBytes = new TextEncoder().encode(JSON.stringify(header));
    if (headerBytes.length !== headerLen) throw new Error("header length changed while laying out sections");
    const out = new Uint8Array(off);
    const dv = new DataView(out.buffer);
    for (let i = 0; i < 8; i++) out[i] = MAGIC.charCodeAt(i);
    dv.setUint32(8, FORMAT_VERSION, true);
    dv.setUint32(12, headerLen, true);
    out.set(headerBytes, 16);
    for (const [name, bytes] of sectionList) out.set(bytes, Number(header.sections[name].offset));
    return out;
  }

  /* ---------- reader ----------
     read(ArrayBuffer | Uint8Array) → {
       header, quantum, lodCount,
       lon: Int32Array, lat: Int32Array        quantised units (degrees = units * quantum)
       rank: Uint8Array
       arcOffset: Uint32Array (arcs+1), arcKind: Uint8Array, arcSource: Uint8Array, arcMinLod: Uint8Array, arcFlags: Uint8Array
       faces: [{ entity, source, rings: [Int32Array of signed refs] }]
     }
     `headerOnly: true` stops after the header (the credits page needs nothing else). */
  /* The reader is a generator so the main-thread shim (file://, Phase 1d) can yield between sections and every
     VERT_CHUNK vertices — a 3 MB core is a 100 ms parse — while `read()` drains it in one go for everyone else. */
  const VERT_CHUNK = 1 << 18;
  function* readSteps(input, opts) {
    const u8 = input instanceof Uint8Array ? input : new Uint8Array(input);
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    for (let i = 0; i < 8; i++) if (u8[i] !== MAGIC.charCodeAt(i)) throw new Error("not a Folio topology file (bad magic)");
    const version = dv.getUint32(8, true);
    if (version !== FORMAT_VERSION) throw new Error("topology format " + version + ", this reader is " + FORMAT_VERSION);
    const headerLen = dv.getUint32(12, true);
    const header = JSON.parse(new TextDecoder().decode(u8.subarray(16, 16 + headerLen)));
    const sec = (name) => { const s = header.sections[name]; if (!s) throw new Error("section missing: " + name); const o = Number(s.offset); return [o, o + s.length]; };
    const out = { header, quantum: header.quantum, lodCount: header.lod.intervals_m.length };
    if (opts && opts.headerOnly) return out;
    const rb = rankBitsFor(out.lodCount), perByte = 8 / rb, mask = (1 << rb) - 1;

    const nV = header.counts.vertices, nA = header.counts.arcs, nF = header.counts.faces;
    const lon = new Int32Array(nV), lat = new Int32Array(nV);
    { const [s, e] = sec("verts"); const c = Cursor(u8, s, e); let x = 0, y = 0;
      for (let i = 0; i < nV; i++) { x += c.svarint(); y += c.svarint(); lon[i] = x; lat[i] = y; if ((i & (VERT_CHUNK - 1)) === VERT_CHUNK - 1) yield "verts"; }
      if (c.pos !== e) throw new Error("verts section has " + (e - c.pos) + " trailing bytes"); }
    yield "verts";
    const rank = new Uint8Array(nV);
    { const [s] = sec("ranks"); for (let i = 0; i < nV; i++) rank[i] = (u8[s + Math.floor(i / perByte)] >> ((i % perByte) * rb)) & mask; }
    yield "ranks";
    const arcOffset = new Uint32Array(nA + 1), arcKind = new Uint8Array(nA), arcSource = new Uint8Array(nA), arcMinLod = new Uint8Array(nA), arcFlags = new Uint8Array(nA);
    { const [s, e] = sec("arcs"); const c = Cursor(u8, s, e); let off = 0;
      for (let i = 0; i < nA; i++) { arcOffset[i] = off; off += c.varint(); arcKind[i] = c.u8(); arcSource[i] = c.u8(); arcMinLod[i] = c.u8(); arcFlags[i] = c.u8(); }
      arcOffset[nA] = off;
      if (off !== nV) throw new Error("arcs cover " + off + " vertices of " + nV);
      if (c.pos !== e) throw new Error("arcs section has trailing bytes"); }
    yield "arcs";
    const faces = new Array(nF);
    { const [s, e] = sec("faces"); const c = Cursor(u8, s, e);
      for (let i = 0; i < nF; i++) {
        const entity = c.varint(), source = c.u8(), nR = c.varint(), rings = new Array(nR);
        for (let r = 0; r < nR; r++) { const n = c.varint(), refs = new Int32Array(n); for (let k = 0; k < n; k++) refs[k] = c.svarint(); rings[r] = refs; }
        faces[i] = { entity, source, rings };
        if ((i & 4095) === 4095) yield "faces";
      }
      if (c.pos !== e) throw new Error("faces section has trailing bytes"); }
    Object.assign(out, { lon, lat, rank, arcOffset, arcKind, arcSource, arcMinLod, arcFlags, faces });
    if (header.sections.arcRef) {
      const [s, e] = sec("arcRef"); const c = Cursor(u8, s, e);
      const arcRef = new Int32Array(nA), arcRefBits = new Uint8Array(nA);
      for (let i = 0; i < nA; i++) { arcRef[i] = c.varint() - 1; arcRefBits[i] = c.u8(); }
      if (c.pos !== e) throw new Error("arcRef section has trailing bytes");
      Object.assign(out, { arcRef, arcRefBits });
    }
    if (header.sections.faceRef) {
      const [s, e] = sec("faceRef"); const c = Cursor(u8, s, e);
      const faceRef = new Int32Array(nF);
      for (let i = 0; i < nF; i++) faceRef[i] = c.varint() - 1;
      if (c.pos !== e) throw new Error("faceRef section has trailing bytes");
      out.faceRef = faceRef;
    }
    if (header.sections.coreRef) {
      const [s, e] = sec("coreRef"); const c = Cursor(u8, s, e);
      const coreArc = new Int32Array(nA), coreFrom = new Int32Array(nA), coreTo = new Int32Array(nA), coreSegA = new Int32Array(nA), coreSegB = new Int32Array(nA);
      for (let i = 0; i < nA; i++) { coreArc[i] = c.varint() - 1; coreFrom[i] = c.varint(); coreTo[i] = c.varint(); coreSegA[i] = c.varint(); coreSegB[i] = c.varint(); }
      if (c.pos !== e) throw new Error("coreRef section has trailing bytes");
      Object.assign(out, { coreArc, coreFrom, coreTo, coreSegA, coreSegB });
    }
    if (header.sections.jpos) {
      if (!out.coreArc) throw new Error("jpos without coreRef");
      const [s, e] = sec("jpos"); const c = Cursor(u8, s, e); const levels = out.lodCount - 1;
      const jposA = new Int32Array(nA * levels * 2), jposB = new Int32Array(nA * levels * 2), jsegA = new Int32Array(nA * levels), jsegB = new Int32Array(nA * levels);
      for (let i = 0; i < nA; i++) { if (out.coreArc[i] < 0) continue; const o = out.arcOffset[i]; for (const [arr, sarr, vi, seg] of [[jposA, jsegA, o, out.coreSegA[i]], [jposB, jsegB, o + 1, out.coreSegB[i]]]) for (let L = 0; L < levels; L++) { arr[(i * levels + L) * 2] = out.lon[vi] + zag(c.varint()); arr[(i * levels + L) * 2 + 1] = out.lat[vi] + zag(c.varint()); sarr[i * levels + L] = seg + zag(c.varint()); } }
      if (c.pos !== e) throw new Error("jpos section has trailing bytes");
      Object.assign(out, { jposA, jposB, jsegA, jsegB });
    }
    return out;
  }
  function read(input, opts) { const g = readSteps(input, opts); for (;;) { const r = g.next(); if (r.done) return r.value; } }
  /* A junction (jx, jy) on core arc `a`'s LOD 2 segment ending at file-order vertex `seg`, at level L: a point ON the level-L
     segment that contains that LOD 2 segment (between the nearest vertices of rank ≤ L on either side), at the same FRACTION
     of the LOD 2 arc length from the segment's start as the junction is — so junctions keep their order along the coast when a
     bay collapses to a chord (a nearest-point projection did not: two pieces of one chord ran back over each other, measured as
     583 "crossings" at LOD 0). At the finest level, or at an arc's own endpoint (seg 0), the junction stays. Planar in the
     unwrapped lon/lat frame about the segment's start, with cos φ on the longitudes: a level-0 segment spans a few tens of
     kilometres at most. Shared by the build, the checker and the worker. */
  function junctionAt(C, a, seg, jx, jy, L) {
    const s = C.arcOffset[a], e = C.arcOffset[a + 1];
    if (!seg || L >= C.lodCount - 1 || seg <= s || seg >= e) return [jx, jy];
    let lo = seg - 1; while (lo > s && C.rank[lo] > L) lo--;
    let hi = seg; while (hi < e - 1 && C.rank[hi] > L) hi++;
    if (lo === seg - 1 && hi === seg) return [jx, jy];
    const X180 = Math.round(180 / C.quantum), c = Math.cos(C.lat[lo] * C.quantum * Math.PI / 180);
    const ux = (x, ref) => { if (x - ref > X180) return x - 2 * X180; if (ref - x > X180) return x + 2 * X180; return x; };
    const dist = (ax, ay, bx, by) => Math.hypot((ux(bx, ax) - ax) * c, by - ay);
    let along = 0, total = 0;
    for (let i = lo + 1; i <= hi; i++) { const d = dist(C.lon[i - 1], C.lat[i - 1], C.lon[i], C.lat[i]); if (i < seg) along += d; total += d; }
    along += dist(C.lon[seg - 1], C.lat[seg - 1], jx, jy);
    const t = total > 0 ? Math.max(0, Math.min(1, along / total)) : 0;
    const x1 = C.lon[lo], y1 = C.lat[lo], x2 = ux(C.lon[hi], x1), y2 = C.lat[hi];
    let x = Math.round(x1 + (x2 - x1) * t); if (x >= X180) x -= 2 * X180; if (x < -X180) x += 2 * X180;
    return [x, Math.round(y1 + (y2 - y1) * t)];
  }
  /* the geometry of a history arc at level L, as [x, y] pairs: an own arc's vertices of rank ≤ L (its coast-junction endpoints moved
     with the level, `junctions` being a Map from "x,y" to { a, seg, x, y }), or junction A, the core range's vertices of rank ≤ L,
     junction B. `H` is the history file as read, `C` the core. */
  function historyArcGeometry(H, C, arc, L, junctions, arcEmpty) {
    const s = H.arcOffset[arc], e = H.arcOffset[arc + 1];
    if (H.coreArc[arc] < 0) {
      const out = [];
      for (let i = s; i < e; i++) { if (H.rank[i] > L) continue; let p = [H.lon[i], H.lat[i]]; if ((i === s || i === e - 1) && junctions) { const j = junctions.get(H.lon[i] + "," + H.lat[i]); if (j) p = j.pos && L < j.pos.length ? j.pos[L] : junctionAt(C, j.a, j.seg, H.lon[i], H.lat[i], L); } out.push(p); }
      return out;
    }
    const a = H.coreArc[arc], cs = C.arcOffset[a];
    const levels = C.lodCount - 1, jp = (arr) => [arr[(arc * levels + L) * 2], arr[(arc * levels + L) * 2 + 1]];
    const out = [H.jposA && L < levels ? jp(H.jposA) : junctionAt(C, a, H.coreSegA ? H.coreSegA[arc] + (H.coreSegA[arc] ? cs : 0) : 0, H.lon[s], H.lat[s], L)];
    if (!(arcEmpty && arcEmpty[arc])) {
      let f = H.coreFrom[arc], t = H.coreTo[arc]; const step = f <= t ? 1 : -1;
      if (H.jsegA && L < levels && H.coreSegA[arc] && H.coreSegB[arc]) {   // the junctions' level segments bound the inner vertices at this level
        const sa = H.jsegA[arc * levels + L], sb = H.jsegB[arc * levels + L];   // END vertex offsets of the two level segments
        if (step > 0) { f = Math.max(f, sa); t = Math.min(t, sb - 1); } else { f = Math.min(f, sa - 1); t = Math.max(t, sb); }
      }
      for (let i = f; step > 0 ? i <= t : i >= t; i += step) if (C.rank[cs + i] <= L) out.push([C.lon[cs + i], C.lat[cs + i]]);
    }
    out.push(H.jposB && L < levels ? jp(H.jposB) : junctionAt(C, a, H.coreSegB ? H.coreSegB[arc] + (H.coreSegB[arc] ? cs : 0) : 0, H.lon[e - 1], H.lat[e - 1], L));
    return out;
  }
  // the junction table of a history file: every core-referencing arc's two endpoints by position
  function historyJunctions(H, C) {
    const m = new Map(); if (!H.coreArc) return m;
    const nA = H.arcOffset.length - 1;
    const levels = C.lodCount - 1; const posOf = (arr, i) => { if (!arr) return null; const out = []; for (let L = 0; L < levels; L++) out.push([arr[(i * levels + L) * 2], arr[(i * levels + L) * 2 + 1]]); return out; };
    for (let i = 0; i < nA; i++) { const a = H.coreArc[i]; if (a < 0) continue; const s = H.arcOffset[i], e = H.arcOffset[i + 1], cs = C.arcOffset[a]; if (H.coreSegA && H.coreSegA[i]) m.set(H.lon[s] + "," + H.lat[s], { a, seg: cs + H.coreSegA[i], pos: posOf(H.jposA, i) }); if (H.coreSegB && H.coreSegB[i]) m.set(H.lon[e - 1] + "," + H.lat[e - 1], { a, seg: cs + H.coreSegB[i], pos: posOf(H.jposB, i) }); }
    return m;
  }
  // the same, awaiting `tick()` (a promise or null) at every step — the shim's way to parse without holding the page
  async function readAsync(input, opts, tick) { const g = readSteps(input, opts); for (;;) { const r = g.next(); if (r.done) return r.value; if (tick) await tick(); } }

  return { MAGIC, FORMAT_VERSION, KIND, KIND_NAME, FLAG, write, read, readAsync, readSteps, zig, zag, rankBitsFor, junctionAt, historyArcGeometry, historyJunctions };
});
