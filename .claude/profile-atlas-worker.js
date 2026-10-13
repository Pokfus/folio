#!/usr/bin/env node
/* profile-atlas-worker.js — where the first window's time goes INSIDE the geometry worker (Atlas v2 Phase 4b, Task 2). A tool, not a gate.

     node .claude/profile-atlas-worker.js [--file=atlas/data/topology.bin] [--levels=N] [--cpuprofile=out.cpuprofile]

   Loads atlas-format.js, earcut and atlas-worker.js into this process exactly as the file:// shim does, posts `load` with the file, and prints when each message the page waits for
   was posted: `meta` (the file read and the unit vectors), each `lod`, `done`, with the worker's own per-level stats. With --cpuprofile it also writes a V8 profile, summarised by self time.
   Node's V8 is the browser's V8, so the milliseconds are the worker's on this machine (the page's CPU x4 profile multiplies them). */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const arg = (n, d) => { const a = process.argv.find((x) => x.startsWith("--" + n + "=")); return a ? a.split("=")[1] : d; };
const FILE = path.resolve(ROOT, arg("file", "atlas/data/topology.bin"));
globalThis.window = globalThis;
globalThis.AtlasFormat = require(path.join(ROOT, "atlas", "atlas-format.js"));
if (!globalThis.AtlasFormat || !globalThis.AtlasFormat.read) globalThis.AtlasFormat = globalThis.window.AtlasFormat;
require(path.join(ROOT, "atlas", "vendor", "earcut.js")); if (typeof globalThis.earcut !== "function" && globalThis.window.earcut) globalThis.earcut = globalThis.window.earcut;
try { require(path.join(ROOT, "atlas", "study.js")); } catch (e) { /* the worker only needs it in a Worker */ }
require(path.join(ROOT, "atlas", "atlas-worker.js"));
const W = globalThis.AtlasWorkerMain;
(async () => {
  const buf = fs.readFileSync(FILE);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const t0 = performance.now(), log = [];
  let prof = null, session = null;
  if (arg("cpuprofile", "")) { const inspector = require("inspector"); session = new inspector.Session(); session.connect(); await new Promise((r) => session.post("Profiler.enable", () => session.post("Profiler.start", r))); }
  W.yieldEvery(1e9);
  await W.handle({ type: "load", buffer: ab }, (m) => {
    const t = performance.now() - t0;
    if (m.type === "meta") log.push(["meta (file read + unit vectors)", t, m.parseMs]);
    else if (m.type === "lod") log.push(["lod " + m.level, t, m.stats.ms, m.stats.triangles, m.stats.faceVertices, m.stats.segments]);
    else if (m.type === "done") log.push(["done", t]);
    else if (m.type === "error") log.push(["ERROR " + m.message, t]);
  });
  if (session) { prof = await new Promise((r) => session.post("Profiler.stop", (e, p) => r(p.profile))); }
  console.log(path.relative(ROOT, FILE) + " " + (buf.length / 1024).toFixed(0) + " KB");
  let prev = 0;
  for (const l of log) { console.log("  " + l[0].padEnd(34) + " at " + l[1].toFixed(0).padStart(6) + " ms  (+" + (l[1] - prev).toFixed(0) + ")" + (l.length > 2 ? "  worker says " + l[2] + " ms" + (l[3] != null ? ", " + l[3] + " tris, " + l[4] + " face verts, " + l[5] + " segs" : "") : "")); prev = l[1]; }
  if (prof) {
    const out = arg("cpuprofile", ""); fs.writeFileSync(out, JSON.stringify(prof));
    const self = new Map(), byId = new Map(prof.nodes.map((n) => [n.id, n]));
    const dt = prof.timeDeltas; for (let i = 0; i < prof.samples.length; i++) { const n = byId.get(prof.samples[i]); const k = n.callFrame.functionName + " " + path.basename(n.callFrame.url) + ":" + n.callFrame.lineNumber; self.set(k, (self.get(k) || 0) + (dt[i] || 0)); }
    const rows = [...self].sort((a, b) => b[1] - a[1]).slice(0, 18);
    console.log("\n  self time, top 18:"); for (const [k, v] of rows) console.log("    " + (v / 1000).toFixed(0).padStart(6) + " ms  " + k);
  }
})().catch((e) => { console.error(e); process.exit(1); });
