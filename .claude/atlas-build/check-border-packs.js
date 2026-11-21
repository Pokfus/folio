#!/usr/bin/env node
/* check-border-packs.js — the CI gate for the BORDER PACKS (atlas/data/borders/<pack>.bin and the index atlas/data/border-packs.js;
   docs/atlas-v2-border-packs.md), in check-admin1.js's style.

     node .claude/atlas-build/check-border-packs.js [--rebuild] [--quiet]

   Offline: the committed packs, the committed core, history.bin's header, border-packs.json and the cards. Exit 1 on any failure.

   WHAT IT PROVES:
     spec         border-packs.json is well formed; no state key is a series of polity-spec.json or war-series.json, nor of two packs
     files        one committed file per pack of the spec and no other; the index border-packs.js is exactly what the committed packs give
     header       kindOf "border-pack", the pack's own name; built on the committed core (buildId and arc count); its sources Cliopatria, the OSM coast
                  and Natural Earth admin-0, each complete (the ODbL source among them: a pack references the OSM coast); its states are the spec's
     ids          every entity is a state of the spec, `pol:<key>`, and NOT an entity of history.bin (one id, one source: the window resolves an id
                  from history.bin first); every state has a face in every year its row asks for, and no other step
     rings close  at every level (0, 1, 2), through atlas-format.js historyArcGeometry and historyJunctions — what the worker hands a window
                  (a ring an arc of the level leaves out, arcMinLod, is skipped there, as the worker skips it)
     budget       each pack within PACK_MAX_BYTES, all of them within PACKS_MAX_BYTES (http only: a pack has no file:// twin)
     cards        every `members.groups[].ids` naming a pack's state has a `members.year` the pack draws it in (an id in neither file is printed as a
                  note, not failed: history.bin's own ids are its checkers' business); a pack state's `cards` are exactly the cards that name it
     --rebuild    each pack rebuilt by build-history.js --pack <name> --check (from the committed extract): byte-identical, or it fails */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const F = require("./lib/format.js");
const BP = require("./lib/border-packs.js");

const argv = process.argv.slice(2), quiet = argv.includes("--quiet"), REBUILD = argv.includes("--rebuild");
const HERE = __dirname, ROOT = path.join(HERE, "..", ".."), DATA = path.join(ROOT, "atlas", "data");
let pass = 0, fail = 0;
const ok = (m, d) => { pass++; if (!quiet) console.log(`  \x1b[32mok\x1b[0m    ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const bad = (m, d) => { fail++; console.log(`  \x1b[31mFAIL\x1b[0m  ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };

console.log("check-border-packs: atlas/data/borders/*.bin, atlas/data/border-packs.js");
/* ---------- spec ---------- */
let states = [];
try { states = BP.allStates(); ok("border-packs.json is well formed", `${states.length} state(s) in ${new Set(states.map((s) => s.pack)).size} pack(s)`); }
catch (e) { bad("border-packs.json is well formed", e.message); process.exit(1); }
const packNames = [...new Set(states.map((s) => s.pack))].sort();

/* ---------- files and index ---------- */
const committed = BP.committedPacks();
const names = committed.map((p) => p.name);
JSON.stringify(names) === JSON.stringify(packNames) ? ok("one committed file per pack, and no other", names.join(", ") || "none") : bad("one committed file per pack, and no other", `files [${names}] against the spec's [${packNames}]`);
const idxNow = fs.existsSync(BP.INDEX_FILE) ? fs.readFileSync(BP.INDEX_FILE, "utf8") : "";
idxNow === BP.indexText() ? ok("atlas/data/border-packs.js is what the committed packs give") : bad("atlas/data/border-packs.js is what the committed packs give", "run build-history.js --pack <name> --install (it rewrites the index)");

/* ---------- each pack ---------- */
const C = F.read(new Uint8Array(fs.readFileSync(path.join(DATA, "topology.bin")))), CH = C.header;
const HH = F.readFile(path.join(DATA, "history.bin"), { headerOnly: true }).header;
const histIds = new Set(HH.entities.map((e) => e.id));
const need = ["id", "name", "version", "url", "licence", "licenceUrl", "attribution", "retrieved", "sha256"];
let total = 0;
for (const p of committed) {
  const A = p.T, H = A.header, tag = p.name + ": ";
  total += p.bytes.length;
  H.kindOf === "border-pack" && H.pack && H.pack.name === p.name ? ok(tag + "a border pack of its own name") : bad(tag + "a border pack of its own name", H.kindOf + " / " + (H.pack && H.pack.name));
  H.core && H.core.buildId === CH.buildId && H.core.arcs === C.arcOffset.length - 1 ? ok(tag + "built on the committed core", CH.buildId) : bad(tag + "built on the committed core", (H.core && H.core.buildId) + " ≠ " + CH.buildId + " (rebuild every pack after a core rebuild)");
  const ids = (H.sources || []).map((s) => s.id).join(",");
  ids === "cliopatria,osm-land-polygons,ne-10m-admin0" && H.sources.every((s) => need.every((k) => s[k])) && H.sources.some((s) => /ODbL/.test(s.licence)) ? ok(tag + "sources complete (Cliopatria, the OSM coast under ODbL, admin-0)") : bad(tag + "sources complete", ids);
  p.bytes.length <= BP.PACK_MAX_BYTES ? ok(tag + "within its budget", `${p.bytes.length} of ${BP.PACK_MAX_BYTES} bytes`) : bad(tag + "within its budget", `${p.bytes.length} > ${BP.PACK_MAX_BYTES}`);
  // ids and steps
  const mine = states.filter((s) => s.pack === p.name), probs = [];
  const specIds = mine.map((s) => s.id).sort(), fileIds = H.entities.map((e) => e.id).sort();
  if (JSON.stringify(specIds) !== JSON.stringify(fileIds)) probs.push(`entities [${fileIds}] against the spec's [${specIds}]`);
  for (const e of H.entities) if (histIds.has(e.id)) probs.push(`${e.id} is also an entity of history.bin`);
  for (const s of mine) {
    const ei = H.entities.findIndex((e) => e.id === s.id); if (ei < 0) continue;
    const steps = H.steps.filter((st) => st[0] === ei);
    for (const y of s.years) if (!steps.some((st) => st[1] <= y && st[2] >= y)) probs.push(`${s.id} has no face in ${y}`);
    for (const st of steps) for (let y = st[1]; y <= st[2]; y++) if (!s.years.includes(y)) { probs.push(`${s.id} has a step in ${y}, a year the spec does not ask for`); break; }
  }
  const hs = H.pack.states || [];
  if (JSON.stringify(hs.map((x) => [x.id, x.years])) !== JSON.stringify(mine.map((s) => [s.id, s.years]))) probs.push("the header's states are not the spec's (rebuild the pack)");
  probs.length ? bad(tag + "its states are the spec's, in their years, and none is history.bin's", probs.join("; ")) : ok(tag + "its states are the spec's, in their years, and none is history.bin's", mine.map((s) => s.id + " " + s.years.join("/")).join(", "));
  // rings close at every level
  const junctions = F.historyJunctions(A, C), empty = H.arcEmpty || null, geomAt = new Map();
  const geom = (a, L) => { const k = a * 4 + L; let g = geomAt.get(k); if (!g) geomAt.set(k, g = F.historyArcGeometry(A, C, a, L, junctions, empty)); return g; };
  for (let L = 0; L < 3; L++) {
    const bk = []; let rings = 0, skipped = 0;
    A.faces.forEach((f, fi) => f.rings.forEach((ring, ri) => {
      if (ring.some((ref) => A.arcMinLod[Math.abs(ref) - 1] > L)) { skipped++; return; }
      rings++;
      for (let k = 0; k < ring.length; k++) {
        const g1 = geom(Math.abs(ring[k]) - 1, L), g2 = geom(Math.abs(ring[(k + 1) % ring.length]) - 1, L);
        const e1 = ring[k] > 0 ? g1[g1.length - 1] : g1[0], s2 = ring[(k + 1) % ring.length] > 0 ? g2[0] : g2[g2.length - 1];
        if (!e1 || !s2 || e1[0] !== s2[0] || e1[1] !== s2[1]) { bk.push(`face ${fi} ring ${ri}`); break; }
      }
    }));
    bk.length ? bad(`${tag}every ring closes at level ${L}`, bk.slice(0, 4).join("; ")) : ok(`${tag}every ring closes at level ${L}`, `${rings} rings${skipped ? ", " + skipped + " left out at this level" : ""}`);
  }
}
total <= BP.PACKS_MAX_BYTES ? ok("every pack together within the budget", `${total} of ${BP.PACKS_MAX_BYTES} bytes`) : bad("every pack together within the budget", `${total} > ${BP.PACKS_MAX_BYTES}`);

/* ---------- the cards ---------- */
{
  const { cards } = require("../card-io.js").loadCards();
  const X = (() => { const w = {}; new Function("window", idxNow)(w); return w.ATLAS_BORDER_PACKS || { ids: {} }; })();   // eslint-disable-line no-new-func
  const probs = [], named = new Map(), unresolved = [];
  for (const c of cards) {
    const m = c.members; if (!m || !Array.isArray(m.groups)) continue;
    for (const g of m.groups) for (const id of g.ids || []) {
      if (histIds.has(id)) continue;
      const row = X.ids[id];
      if (!row) { if (/^pol:/.test(id) && !/^pol:ext_/.test(id)) unresolved.push(`${c.id}: ${id}`); continue; }   // not a pack's: reported below, failed by nothing here (found 2026-11-20 on ww2-012; history.bin's own business)
      let l = named.get(id); if (!l) named.set(id, l = new Set()); l.add(c.id);
      if (!Number.isInteger(m.year)) probs.push(`${c.id}: ${id} is a pack's state, but the card has no members.year`);
      else if (!row.steps.some(([a, b]) => a <= m.year && m.year <= b)) probs.push(`${c.id}: ${id} is drawn by its pack in ${row.steps.map((s) => s[0] === s[1] ? s[0] : s.join("–")).join(", ")}, not in the card's year ${m.year} (add the year with add-border.js)`);
    }
  }
  for (const s of states) { const got = [...(named.get(s.id) || [])].sort(); if (JSON.stringify(got) !== JSON.stringify(s.cards)) probs.push(`${s.id}: the spec lists cards [${s.cards}] but [${got}] name it`); }
  if (unresolved.length) console.log(`  \x1b[33mnote\x1b[0m  ids in neither history.bin nor a pack (drawn as nothing; not a pack's fault): ${unresolved.join("; ")}`);
  probs.length ? bad("every members group id resolves, and a pack's state in the card's year", probs.join("; ")) : ok("every members group id resolves, and a pack's state in the card's year", [...named.entries()].map(([id, l]) => id + " ← " + [...l].join(", ")).join("; ") || "no card names a pack");
}

/* ---------- --rebuild ---------- */
if (REBUILD) for (const n of packNames) {
  const r = cp.spawnSync(process.execPath, ["--max-old-space-size=4000", path.join(HERE, "build-history.js"), "--pack", n, "--check"], { encoding: "utf8" });
  r.status === 0 ? ok(`${n}: rebuilt byte for byte from border-packs.json, its extract and the core`) : bad(`${n}: rebuilt byte for byte`, ((r.stdout || "") + (r.stderr || "")).trim().split("\n").slice(-3).join(" | "));
}

console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
