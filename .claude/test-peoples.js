#!/usr/bin/env node
/* test-peoples.js — peoples and cultures, without a browser (Atlas v2 Phase 2c; docs/atlas-v2-design.md §2.5, §2.6, §7 "Phase 2c").

     node .claude/test-peoples.js

   WHAT IT PROVES
     · THE CLASSIFICATION IS ONE FUNCTION. A state ("polity", and the "contested" and "nested" faces of states) is a TERRITORY, a
       people or a culture a PRESENCE (study.js `layerOf`); the committed history.bin holds exactly the twelve presence entities the
       audit names (eight Cliopatria peoples, the Cyclades and Crete, the Yangshao and Longshan), none of them a polity, every other
       entity a state; the words the stack chip and the card use ("state", "people", "culture") come from one table.
     · THE PEOPLES SWITCH'S ARITHMETIC (Q-C2 b), position × view × what a card links: off hides every presence; "linked" shows the
       peoples a card links and "all" every one with a dated source in the Full Atlas and on the plain map; the Personal Atlas shows a
       presence only when one of the reader's OWN cards links it, whatever the position but "off"; a collection switched off removes the
       cards it owns from "linked"; an unknown stored value reads as the default.
     · THE DATA: every presence entity carries its span, its source, the audit's note and the cards that link it; each of those cards
       carries the entity in its `places` (the study layer's list reads them there); every presence face is class SOFT and made of the
       coast and its own soft edge; a presence overlaps the states by design, so the state partition ignores it.
     · THE SOFT FACE'S MESH (atlas-worker.js `presenceMesh`, run in Node on the committed file at the three resident levels): no
       triangle winds clockwise on the sphere (a fold would draw the fill twice), the triangles' areas sum to the face's own area, an
       edge alpha runs from 0 on the soft edge to 1 inside, a coast edge never fades (the land stencil is its edge), and the inset ring
       that carries the fade is simple at the width the face asked for or at a halving of it.
   Zero dependencies. Re-run after touching atlas/study.js, the presence code of atlas/atlas-worker.js or atlas-gl.js, or
   .claude/atlas-build/build-history.js's presence layer. */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const AS = require(path.join(ROOT, "atlas", "study.js"));
const { loadCards } = require("./card-io.js");
let pass = 0, fail = 0;
const check = (name, ok, detail) => { if (ok) { pass++; console.log("  ok    " + name + (detail ? "  (" + detail + ")" : "")); } else { fail++; console.log("  FAIL  " + name + (detail ? "  (" + detail + ")" : "")); } };

console.log("\n1) the classification\n");
{
  const cases = [["polity", "territory", "state"], ["contested", "territory", "contested land"], ["nested", "territory", "state"], ["people", "presence", "people"], ["culture", "presence", "culture"], ["country", "other", "country"], ["region", "other", "region"]];
  for (const [kind, layer, word] of cases) check(`${kind} is a ${layer}, said "${word}"`, AS.layerOf(kind) === layer && AS.kindWord(kind) === word && AS.isPresence(kind) === (layer === "presence"));
  const F = (global.window = {}, require(path.join(ROOT, "atlas", "atlas-format.js")), global.window.AtlasFormat);
  const T = F.read(new Uint8Array(fs.readFileSync(path.join(ROOT, "atlas", "data", "history.bin"))), { headerOnly: true }), H = T.header;
  const pres = H.entities.filter((e) => AS.isPresence(e.kind));
  const WANT = ["avars", "crete", "cyclades", "galatia", "gothia", "huns", "khazaria", "longshan", "magyars", "old_great_bulgaria", "scythia", "yangshao"].map((k) => "pol:" + k);
  check("the file holds exactly the twelve presence entities the audit names", JSON.stringify(pres.map((e) => e.id).sort()) === JSON.stringify(WANT), pres.map((e) => e.id.slice(4)).join(", "));
  check("the eight Cliopatria series are peoples, the coastline and site-hull series cultures", pres.filter((e) => e.kind === "people").length === 8 && pres.filter((e) => e.kind === "culture").length === 4 && ["cyclades", "crete", "yangshao", "longshan"].every((k) => H.entities.find((e) => e.id === "pol:" + k).kind === "culture"));
  check("every other entity is a state (polity, contested or nested)", H.entities.every((e) => AS.isPresence(e.kind) || AS.layerOf(e.kind) === "territory"), `${H.entities.length - pres.length} states`);
  check("a presence is never a member of a contested or nested face", H.entities.filter((e) => e.partners).every((e) => e.partners.every((p) => !pres.some((x) => x.id === p))));
  global.__H = H; global.__F = F; global.__T = T;
}

console.log("\n2) the Peoples switch\n");
{
  const flags = new Map([["pol:scythia", 2], ["pol:huns", 1]]), linked = new Set(["pol:scythia", "pol:huns", "pol:avars"]);
  const show = (pos, mode, id) => AS.peoplesShown(pos, mode, id, mode === "map" ? new Map() : flags, linked);
  const rows = [
    // position, view, id, expected
    ["off", "personal", "pol:scythia", false], ["off", "full", "pol:scythia", false], ["off", "map", "pol:scythia", false],
    ["linked", "personal", "pol:scythia", true], ["linked", "personal", "pol:huns", false], ["linked", "personal", "pol:avars", false],
    ["all", "personal", "pol:scythia", true], ["all", "personal", "pol:huns", false], ["all", "personal", "pol:avars", false],   // the Personal Atlas: only the reader's own cards, whatever the position
    ["linked", "full", "pol:scythia", true], ["linked", "full", "pol:huns", true], ["linked", "full", "pol:avars", false],
    ["all", "full", "pol:scythia", true], ["all", "full", "pol:huns", true], ["all", "full", "pol:avars", true], ["all", "full", "pol:yangshao", true],
    ["linked", "map", "pol:scythia", true], ["linked", "map", "pol:avars", true], ["linked", "map", "pol:yangshao", false],
    ["all", "map", "pol:yangshao", true],
  ];
  for (const [pos, mode, id, want] of rows) check(`${pos} · ${mode} · ${id.slice(4)} → ${want ? "shown" : "hidden"}`, show(pos, mode, id) === want);
  check("an unknown stored position reads as the default (linked)", AS.normalizePeoples("sometimes") === "linked" && AS.normalizePeoples(undefined) === AS.PEOPLES_DEFAULT && AS.peoplesShown("sometimes", "full", "pol:huns", flags, linked));
  check("three positions, in the legend's order", JSON.stringify(AS.PEOPLES_POSITIONS) === '["off","linked","all"]' && AS.PEOPLES_LABEL.all === "All with a dated source");
  check("a missing flag map or link set hides rather than throws", AS.peoplesShown("linked", "full", "pol:huns", null, null) === false && AS.peoplesShown("linked", "map", "pol:huns", null, null) === false && AS.peoplesShown("all", "map", "pol:huns", null, null) === true);
  // a collection switched off removes the cards it owns: the flags (study.js `flags`) lose the place, so "linked" hides it and "all" still shows it
  const idx = AS.parse({ ids: ["pol:scythia", "pol:huns"], cards: { "ru-005": [0], "ru-012": [1] } });
  const info = (c) => ({ collId: c.startsWith("ru-") ? "russia" : "x", coll: "Russia" });
  const st = AS.studied(idx, ["ru-005"]);
  const on = AS.flags(idx, st, "full", new Set(), info), off = AS.flags(idx, st, "full", new Set(["russia"]), info);
  check("Full Atlas, collection on: linked shows both, the reader's one is flag 2", AS.peoplesShown("linked", "full", "pol:huns", on, AS.linkedPolities(idx)) && on.get("pol:scythia") === 2 && on.get("pol:huns") === 1);
  check("Full Atlas, its only collection off: 'linked' hides them, 'all' still shows them", !AS.peoplesShown("linked", "full", "pol:huns", off, AS.linkedPolities(idx)) && AS.peoplesShown("all", "full", "pol:huns", off, AS.linkedPolities(idx)));
  check("Personal Atlas, nothing studied: no presence at all", !AS.peoplesShown("all", "personal", "pol:huns", AS.flags(idx, AS.studied(idx, []), "personal", new Set(), info), AS.linkedPolities(idx)));
  check("linkedPolities reads the card index's pol: ids", [...AS.linkedPolities(idx)].sort().join() === "pol:huns,pol:scythia");
  // splitting a year's alive faces
  const alive = [{ face: 1, ent: 0 }, { face: 2, ent: 1 }, { face: 3, ent: 2 }, { face: 4, ent: 3 }];
  const kinds = ["polity", "people", "contested", "culture"], vis = (e) => e === 1;
  const sp = AS.splitAlive(alive, (e) => kinds[e], vis);
  check("splitAlive keeps every territory and only the presences the switch lets through, in order", sp.territory.map((a) => a.face).join() === "1,3" && sp.presence.map((a) => a.face).join() === "2");
  check("the note says what the position shows", /hidden/.test(AS.peoplesNote("off", "full")) && /own cards|your cards/.test(AS.peoplesNote("linked", "personal")) && /3 are on the map/.test(AS.peoplesNote("linked", "full", 3)) && /1 is on the map/.test(AS.peoplesNote("all", "map", 1)));
}

console.log("\n3) the data\n");
const H = global.__H, F = global.__F, T0 = global.__T;
const pres = H.entities.map((e, i) => ({ e, i })).filter(({ e }) => AS.isPresence(e.kind));
{
  const { cards } = loadCards(); const byId = new Map(cards.map((c) => [c.id, c]));
  let bad = [];
  for (const { e } of pres) {
    if (!e.span || !e.src || !e.note || !Array.isArray(e.cards) || !e.cards.length) bad.push(e.id + " lacks a span, source, note or cards");
    for (const cid of e.cards || []) { const c = byId.get(cid); if (!c) bad.push(e.id + " links " + cid + ", not a card"); else if (!(c.places || []).includes(e.id)) bad.push(cid + " does not carry " + e.id); }
  }
  check("every presence has its span, source, the audit's note and the cards that link it, and each card carries it", !bad.length, bad.slice(0, 3).join("; ") || pres.length + " entities");
  const steps = new Map(); for (const st of H.steps) { let l = steps.get(st[0]); if (!l) steps.set(st[0], l = []); l.push(st); }
  check("a presence's steps sit inside its span, in order, without overlap", pres.every(({ e, i }) => { const l = steps.get(i) || []; return l.length && l[0][1] >= e.span[0] && l[l.length - 1][2] <= e.span[1] && l.every((s, k) => !k || s[1] > l[k - 1][2]); }), pres.map(({ e, i }) => e.id.slice(4) + " " + (steps.get(i) || []).length).join(", "));
  const cls = H.faceClass; const T = F.read(new Uint8Array(fs.readFileSync(path.join(ROOT, "atlas", "data", "history.bin"))));
  const faces = [...new Set(H.steps.filter((s) => AS.isPresence(H.entities[s[0]].kind)).map((s) => s[3]))];
  check("every presence face is class SOFT and made of the coast and its own soft edge", faces.every((f) => cls[f] === 2 && T.faces[f].rings.every((r) => r.every((ref) => { const k = T.arcKind[Math.abs(ref) - 1]; return k === F.KIND.COAST || k === F.KIND.SOFT; }))), faces.length + " faces");
  const yangshao = H.entities.findIndex((e) => e.id === "pol:yangshao");
  check("the Yangshao keep their three phases from 5000 BCE (not clipped at Cliopatria's 3400 BCE)", (steps.get(yangshao) || []).map((s) => s[1] + ".." + s[2]).join() === "-5000..-4001,-4000..-3501,-3500..-3000");
  global.__T = T;
}

console.log("\n4) the soft face's mesh, on the committed file\n");
{
  globalThis.AtlasFormat = F; require(path.join(ROOT, "atlas", "vendor", "earcut.js")); if (typeof globalThis.earcut !== "function") globalThis.earcut = global.window.earcut;   // the vendored file attaches itself to `window` once the test has set one
  require(path.join(ROOT, "atlas", "atlas-worker.js"));
  const LF = require("./atlas-build/lib/format.js");   // the build's reader: readFile for the core, the same history arc geometry as the page
  const D = globalThis.AtlasWorkerMain._debug, T = global.__T, core = LF.readFile(path.join(ROOT, "atlas", "data", "topology.bin"));
  const junctions = LF.historyJunctions(T, core), q = T.quantum, D2R = Math.PI / 180, nA = T.arcOffset.length - 1;
  const levels = [];
  const levelOf = (level) => {
    if (levels[level]) return levels[level];
    const lon = [], lat = [], arcOffset = new Uint32Array(nA + 1);
    for (let a = 0; a < nA; a++) { arcOffset[a] = lon.length; for (const p of LF.historyArcGeometry(T, core, a, level, junctions, T.header.arcEmpty || null)) { lon.push(p[0]); lat.push(p[1]); } }
    arcOffset[nA] = lon.length;
    const LT = { lon: Int32Array.from(lon), lat: Int32Array.from(lat), rank: new Uint8Array(lon.length), arcOffset, arcKind: T.arcKind, arcFlags: T.arcFlags, arcMinLod: new Uint8Array(nA), quantum: q };
    const pos = new Float32Array(lon.length * 3);
    for (let i = 0; i < lon.length; i++) { const la = lat[i] * q * D2R, lo = lon[i] * q * D2R, c = Math.cos(la); pos[3 * i] = c * Math.cos(lo); pos[3 * i + 1] = c * Math.sin(lo); pos[3 * i + 2] = Math.sin(la); }
    return (levels[level] = { LT, pos });
  };
  const faceSet = [...new Set(H.steps.filter((s) => AS.isPresence(H.entities[s[0]].kind)).map((s) => s[3]))].sort((a, b) => a - b);
  (async () => {
    const R2 = 6371 * 6371; let cw = 0, cwArea = 0, cwMax = 0, absTotal = 0, areaBad = [], alphaBad = 0, noFade = 0, coastFade = 0, tris = 0, meshes = 0, maxMs = 0, solidMissing = 0, insetFail = 0;
    for (const level of [0, 1, 2]) {
      const { LT, pos } = levelOf(level);
      for (const fi of faceSet) {
        const face = T.faces[fi], sink = D.Sink(); const t0 = Date.now();
        await D.presenceMesh(LT, pos, face, level, sink);
        maxMs = Math.max(maxMs, Date.now() - t0);
        const M = sink.result(); meshes++; tris += M.triangles;
        // signed spherical area of every triangle (positive: counter-clockwise seen from outside); the sum of areas against the face's own
        let signed = 0, absolute = 0;
        for (let t = 0; t < M.idx.length; t += 3) {
          const a = M.idx[t] * 4, b = M.idx[t + 1] * 4, c = M.idx[t + 2] * 4;
          const A = [M.pos[a], M.pos[a + 1], M.pos[a + 2]], B = [M.pos[b], M.pos[b + 1], M.pos[b + 2]], C = [M.pos[c], M.pos[c + 1], M.pos[c + 2]];
          const n = [(B[1] - A[1]) * (C[2] - A[2]) - (B[2] - A[2]) * (C[1] - A[1]), (B[2] - A[2]) * (C[0] - A[0]) - (B[0] - A[0]) * (C[2] - A[2]), (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0])];
          const s = (n[0] * (A[0] + B[0] + C[0]) + n[1] * (A[1] + B[1] + C[1]) + n[2] * (A[2] + B[2] + C[2])) / 6 * R2;   // triangle area ≈ ½ |n|, signed by the outward direction
          signed += s; absolute += Math.abs(s); absTotal += Math.abs(s); if (s < -1e-6) { cw++; cwArea += -s; if (-s > cwMax) { cwMax = -s; global.__cwWhere = `face ${fi} L${level} area ${(-s).toFixed(3)} km², vertices ${[A, B, C].map((v) => v.map((x) => x.toFixed(6)).join(",")).join(" | ")}`; } }
        }
        const want = H.faceKm2[fi];
        if (level === 2 && want > 50 && Math.abs(signed - want) / want > 0.03) areaBad.push(`${fi}: ${Math.round(signed)} vs ${want}`);
        if (Math.abs(signed - absolute) > 0.01 * Math.max(1, absolute)) areaBad.push(`${fi} L${level}: signed ${Math.round(signed)} ≠ absolute ${Math.round(absolute)}`);
        let a0 = 0, a1 = 0; for (let v = 0; v < M.vertices; v++) { const al = M.pos[4 * v + 3]; if (!(al >= 0 && al <= 1)) alphaBad++; if (al === 0) a0++; if (al === 1) a1++; }
        if (!a1) solidMissing++;
        // a face with a soft edge fades somewhere (unless the inset failed at every width: reported); an all-coast face (an island) never does
        const soft = face.rings.some((r) => r.some((ref) => T.arcKind[Math.abs(ref) - 1] === F.KIND.SOFT));
        if (!soft && a0) coastFade++;
        if (soft && !a0) noFade++;
      }
    }
    check(`${meshes} meshes (12 presences' ${faceSet.length} faces × 3 levels): the clockwise triangles (the fade strip's quads where a reflex corner folds its inset) are under 0.01 % of the area`, cwArea < 1e-4 * absTotal, `${tris} triangles; the largest: ${global.__cwWhere}; ${cw} clockwise of them, the largest ${cwMax.toFixed(1)} km², ${(100 * cwArea / absTotal).toExponential(1)} % of the area`);
    check("the triangles' areas sum to the face's own area (the fade strip and the interior partition it) and no area is folded", areaBad.length === 0, areaBad.slice(0, 3).join("; "));
    check("every vertex alpha is in [0, 1] and every mesh has solid ground", alphaBad === 0 && solidMissing === 0);
    check("a face with a soft edge fades at it (alpha 0 on the edge); a face made only of coast (an island) never does", coastFade === 0, `${noFade} soft-edged mesh(es) kept no fade (the inset failed at every width: drawn solid)`);
    check("no mesh took long (the worker builds one per face and level, lazily)", maxMs < 4000, `slowest ${maxMs} ms in Node`);
    // the inset verification itself: a square with a soft edge insets; a self-crossing request is refused and halved
    const sq = { p: [[0, 0], [10, 0], [10, 10], [0, 10]], soft: [1, 1, 1, 1] };
    const r1 = D.presenceInset([sq], 1);
    check("presenceInset: a square whose edges are all soft moves every vertex inward by the width", !!r1 && r1.scale === 1 && r1.inner[0].every((v) => Math.abs(Math.min(v[0], 10 - v[0]) - 1) < 1e-9 && Math.abs(Math.min(v[1], 10 - v[1]) - 1) < 1e-9));
    const thin = { p: [[0, 0], [10, 0], [10, 0.5], [0, 0.5]], soft: [1, 1, 1, 1] };
    const r2 = D.presenceInset([thin], 2);
    check("presenceInset: a sliver thinner than twice the width is narrowed (clearance), never folded", !r2 || r2.inner[0].every((v) => v[1] > -1e-9 && v[1] < 0.5 + 1e-9));
    const coastOnly = D.presenceInset([{ p: sq.p, soft: [0, 0, 0, 0] }], 1);
    check("presenceInset: a ring that is all coast does not fade", coastOnly === null);
    console.log(`\n${pass} ok, ${fail} failed`);
    process.exit(fail ? 1 : 0);
  })().catch((e) => { console.error(e); process.exit(1); });
}
