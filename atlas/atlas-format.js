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
     ranks   2 bits per vertex: the coarsest LOD the vertex survives at (0 = globe … lodCount-1 =
             finest). An arc's endpoints are always rank 0. Four vertices to a byte.
     arcs    per arc: varint vertexCount, u8 kind (KIND.*), u8 sourceIndex (into header.sources),
             u8 minLod (the coarsest LOD at which this arc is drawn at all — a closed island ring
             smaller than a level's tolerance vanishes at that level rather than collapsing into a
             line). Vertex offsets are cumulative, so they are not stored.
     faces   per face: varint entityIndex, u8 sourceIndex, varint ringCount, then per ring: varint
             refCount and refCount zig-zag varints of SIGNED arc references — (arc+1) when the arc
             is walked forward, -(arc+1) when walked backward. The face is on the LEFT of every arc
             as walked (counter-clockwise outer rings, clockwise holes, on the sphere).

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
  const FORMAT_VERSION = 1;
  // arc kinds (§2.3): coast, land border, river, lake shore, soft edge (a people's uncertain extent)
  const KIND = { COAST: 0, BORDER: 1, RIVER: 2, LAKE: 3, SOFT: 4 };
  const KIND_NAME = ["coast", "border", "river", "lake", "soft"];

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
       arcs: [{ offset, count, kind, source, minLod }],       // offsets index `vertices`, in file order
       faces: [{ entity, source, rings: [[signedRef, ...], ...] }],
       extra: {}                                               // anything else to carry in the header
     } */
  function write(topology) {
    const T = topology;
    const nV = T.vertices.lon.length;
    if (T.vertices.lat.length !== nV || T.rank.length !== nV) throw new Error("vertex arrays disagree in length");
    const lodCount = T.lod.intervals_m.length;
    if (lodCount < 1 || lodCount > 4) throw new Error("ranks are 2 bits: 1–4 LOD levels");

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

    // ranks: 2 bits each
    const ranks = new Uint8Array(Math.ceil(nV / 4));
    for (let i = 0; i < nV; i++) {
      const r = T.rank[i];
      if (r < 0 || r >= lodCount) throw new Error("rank out of range at vertex " + i);
      ranks[i >> 2] |= r << ((i & 3) * 2);
    }

    // arcs
    const arcs = ByteSink(T.arcs.length * 4);
    for (const a of T.arcs) {
      if (a.count < 1) throw new Error("empty arc");
      if (T.rank[a.offset] !== 0 || T.rank[a.offset + a.count - 1] !== 0) throw new Error("arc endpoints must be rank 0 (arc at " + a.offset + ")");
      if (a.source < 0 || a.source >= T.sources.length) throw new Error("arc source index " + a.source + " not in header.sources");
      arcs.varint(a.count); arcs.u8(a.kind); arcs.u8(a.source); arcs.u8(a.minLod || 0);
    }

    // faces
    const faces = ByteSink(T.faces.length * 64);
    for (const f of T.faces) {
      if (f.entity < 0 || f.entity >= T.entities.length) throw new Error("face entity index out of range");
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
       arcOffset: Uint32Array (arcs+1), arcKind: Uint8Array, arcSource: Uint8Array, arcMinLod: Uint8Array
       faces: [{ entity, source, rings: [Int32Array of signed refs] }]
     }
     `headerOnly: true` stops after the header (the credits page needs nothing else). */
  function read(input, opts) {
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

    const nV = header.counts.vertices, nA = header.counts.arcs, nF = header.counts.faces;
    const lon = new Int32Array(nV), lat = new Int32Array(nV);
    { const [s, e] = sec("verts"); const c = Cursor(u8, s, e); let x = 0, y = 0;
      for (let i = 0; i < nV; i++) { x += c.svarint(); y += c.svarint(); lon[i] = x; lat[i] = y; }
      if (c.pos !== e) throw new Error("verts section has " + (e - c.pos) + " trailing bytes"); }
    const rank = new Uint8Array(nV);
    { const [s] = sec("ranks"); for (let i = 0; i < nV; i++) rank[i] = (u8[s + (i >> 2)] >> ((i & 3) * 2)) & 3; }
    const arcOffset = new Uint32Array(nA + 1), arcKind = new Uint8Array(nA), arcSource = new Uint8Array(nA), arcMinLod = new Uint8Array(nA);
    { const [s, e] = sec("arcs"); const c = Cursor(u8, s, e); let off = 0;
      for (let i = 0; i < nA; i++) { arcOffset[i] = off; off += c.varint(); arcKind[i] = c.u8(); arcSource[i] = c.u8(); arcMinLod[i] = c.u8(); }
      arcOffset[nA] = off;
      if (off !== nV) throw new Error("arcs cover " + off + " vertices of " + nV);
      if (c.pos !== e) throw new Error("arcs section has trailing bytes"); }
    const faces = new Array(nF);
    { const [s, e] = sec("faces"); const c = Cursor(u8, s, e);
      for (let i = 0; i < nF; i++) {
        const entity = c.varint(), source = c.u8(), nR = c.varint(), rings = new Array(nR);
        for (let r = 0; r < nR; r++) { const n = c.varint(), refs = new Int32Array(n); for (let k = 0; k < n; k++) refs[k] = c.svarint(); rings[r] = refs; }
        faces[i] = { entity, source, rings };
      }
      if (c.pos !== e) throw new Error("faces section has trailing bytes"); }
    return Object.assign(out, { lon, lat, rank, arcOffset, arcKind, arcSource, arcMinLod, faces });
  }

  return { MAGIC, FORMAT_VERSION, KIND, KIND_NAME, write, read, zig, zag };
});
