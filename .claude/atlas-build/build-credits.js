#!/usr/bin/env node
/* build-credits.js — the Sources and credits page's data (Phase 1d, docs/atlas-v2-design.md §2.10a).

     node build-credits.js [--install] [--dry] [--check]

   WHAT IT WRITES: out/credits.js (and with --install, atlas/data/credits.js) — `window.ATLAS_CREDITS`, one entry
   per data source, MERGED FROM THE `sources` HEADER OF EVERY GENERATED FILE under atlas/data/: the core
   (topology.bin), every land tile, water.bin, every water tile, relief.json (whose PNGs carry the same block, which
   check-relief.js proves), gazetteer.js, the `.js` twins and whatever a later phase adds. Nothing is typed here:
   a source's name, version, licence, licence link, attribution string and retrieval date are what the files
   carry (copied from sources.json by the build that wrote them), so the page can never say more or less than
   the data does — and a file whose header carries a version the others do not shows as a second variant of
   that source rather than disappearing into a merge. Every `--install` of pack.js, pack-water.js, build-relief.js
   and build-gazetteer.js runs this afterwards, and check-credits.js (CI's fast job) regenerates it in memory and
   fails when the committed file lags the data.

   HOW A FILE IS READ: a `.bin` through atlas/atlas-format.js's header-only read; a `.json` by its `sources` key;
   a .js by its first line (the sources comment every generated script opens with). credits.js itself is
   skipped. Files are grouped per directory in the output (atlas/data/tiles/3/ with its count) so the page
   lists 644 tiles as two lines.

   --check  regenerate and compare with atlas/data/credits.js (ignoring the `generated` stamp); exit 1 if stale. */
"use strict";
const fs = require("fs"), path = require("path");
const F = require("./lib/format.js");
const { LICENCES } = require("./fetch-sources.js");

const HERE = __dirname, ROOT = path.join(HERE, "..", "..");
const DATA = path.join(ROOT, "atlas", "data");
const OUT = path.join(HERE, "out");
const TARGET = path.join(DATA, "credits.js");
const FIELDS = ["name", "version", "url", "licence", "licenceUrl", "attribution", "retrieved", "sha256"];

function headerOf(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  if (rel === "atlas/data/credits.js") return null;
  if (file.endsWith(".bin")) { const h = F.read(fs.readFileSync(file), { headerOnly: true }).header; return { rel, sources: h.sources || [], generated: h.generated }; }
  if (file.endsWith(".json")) { const j = JSON.parse(fs.readFileSync(file, "utf8")); return j && Array.isArray(j.sources) ? { rel, sources: j.sources, generated: j.generated } : null; }
  if (file.endsWith(".js")) {
    const fd = fs.openSync(file, "r"); const buf = Buffer.alloc(1 << 16); const n = fs.readSync(fd, buf, 0, buf.length, 0); fs.closeSync(fd);
    const first = buf.toString("utf8", 0, n).split("\n")[0];
    const m = /^\/\* sources: (\[.*\]) \*\/$/.exec(first);
    if (!m) throw new Error(rel + ": a generated .js must carry `/* sources: [...] */` as its first line");
    return { rel, sources: JSON.parse(m[1]), generated: null };
  }
  return null;
}
function walk(dir, out) {
  for (const name of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, name), st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out); else if (/\.(bin|json|js)$/.test(name)) out.push(p);
  }
  return out;
}
/* every file → every source; one entry per source id, variants per distinct (version, retrieved, sha256) */
function collect() {
  const files = walk(DATA, []);
  const byId = new Map(); let read = 0; const fileSources = [];
  for (const f of files) {
    const h = headerOf(f); if (!h) continue; read++;
    fileSources.push({ rel: h.rel, ids: h.sources.map((s) => s.id) });
    for (const s of h.sources) {
      if (!s.id) throw new Error(h.rel + ": a source without an id");
      if (!byId.has(s.id)) byId.set(s.id, { id: s.id, variants: [] });
      const e = byId.get(s.id);
      const key = [s.version, s.retrieved, s.sha256 || ""].join("\u0000");
      let v = e.variants.find((x) => x.key === key);
      if (!v) { v = { key, files: new Map() }; for (const k of FIELDS) v[k] = s[k] == null ? null : s[k]; e.variants.push(v); }
      else for (const k of ["name", "url", "licence", "licenceUrl", "attribution"]) if (v[k] !== (s[k] == null ? null : s[k])) throw new Error(`${h.rel}: source ${s.id} carries a different ${k} from another file of the same version`);
      // group by directory: the tiles are one line per level, the water tiles one, the relief planes one
      const dir = path.posix.dirname(h.rel), single = /^atlas\/data\/[^/]+$/.test(h.rel) || h.rel.endsWith("relief.json");
      const g = single ? h.rel : dir + "/";
      v.files.set(g, (v.files.get(g) || 0) + 1);
    }
  }
  const sources = [...byId.values()].sort((a, b) => (a.id < b.id ? -1 : 1)).map((e) => ({ id: e.id, variants: e.variants.map((v) => { const o = {}; for (const k of FIELDS) o[k] = v[k]; o.shareAlike = !!(LICENCES[v.licence] && LICENCES[v.licence].shareAlike); o.files = [...v.files.entries()].sort().map(([p, n]) => ({ path: p, count: n })); return o; }) }));
  return { sources, filesRead: read, fileSources };
}
function render(c) {
  const generated = new Date().toISOString();
  const all = [];
  for (const s of c.sources) for (const v of s.variants) all.push(Object.assign({ id: s.id }, Object.fromEntries(FIELDS.map((k) => [k, v[k]]))));
  const table = { format: 1, generated, generator: "folio atlas-build: build-credits.js (" + require("./package.json").version + ")", filesRead: c.filesRead, sources: c.sources };
  return "/* sources: " + JSON.stringify(all) + " */\n" +
    "/* atlas/data/credits.js — GENERATED by .claude/atlas-build/build-credits.js from the `sources` header of every file under\n" +
    "   atlas/data/ (docs/atlas-v2-design.md §2.10a). Do not edit: rebuild. Rendered by the #credits page (app.js, PAGES.credits).\n" +
    "   One entry per source id; `variants` holds each distinct (version, retrieved, sha256) the files carry, with the Folio files\n" +
    "   derived from it (a directory with its file count). `shareAlike` marks ODbL / CC BY-SA / GPL sources, whose derived files\n" +
    "   are files of their own under that licence. */\n" +
    "window.ATLAS_CREDITS = " + JSON.stringify(table, null, 1) + ";\n";
}
const strip = (s) => s.replace(/"generated": "[^"]*"/, '"generated": ""');
function build(opts) {
  opts = opts || {};
  const c = collect();
  const body = render(c);
  const n = c.sources.reduce((s, x) => s + x.variants.length, 0);
  const say = opts.log || console.log;
  say(`credits: ${c.filesRead} files read, ${c.sources.length} sources (${n} variants): ${c.sources.map((s) => s.id + (s.variants.length > 1 ? "×" + s.variants.length : "")).join(", ")}`);
  if (opts.check) {
    const have = fs.existsSync(TARGET) ? fs.readFileSync(TARGET, "utf8") : "";
    const same = strip(have) === strip(body);
    return { ok: same, body, collected: c };
  }
  if (!opts.dry) {
    fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(path.join(OUT, "credits.js"), body);
    if (opts.install) { fs.writeFileSync(TARGET, body); say("installed atlas/data/credits.js"); } else say("wrote out/credits.js (--install copies it into atlas/data/)");
  }
  return { ok: true, body, collected: c };
}
module.exports = { build, collect, render, headerOf, walk, strip, TARGET };

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.includes("--check")) { const r = build({ check: true }); if (!r.ok) { console.error("atlas/data/credits.js lags the data files — run: node .claude/atlas-build/build-credits.js --install"); process.exit(1); } console.log("atlas/data/credits.js is in step with every file header"); }
  else build({ install: argv.includes("--install"), dry: argv.includes("--dry") });
}
