#!/usr/bin/env node
"use strict";
/*
  pdf-text.js — the text out of a PDF, with no dependency and no system tooling.  Standalone Node
  helper.  Not part of the site.

    node .claude/pdf-text.js <file.pdf> [--pages]

  IT EXISTS BECAUSE THE UN DEMOGRAPHIC YEARBOOK'S TABLE 8 IS THE ONLY OPEN SOURCE FOR A RUSSIAN OR
  CHINESE CITY'S POPULATION, AND NOTHING HERE COULD READ IT.  This container has no pdftotext, no
  mutool, no qpdf, no pypdf and no fitz, and the obvious scrapes both fail on it: a `(...)`-string
  sweep returns binary noise and a raw inflate returns page furniture.  Two shapes of PDF cover every
  document this repo has met, and this reads both.

  · A MODERN PDF'S TEXT IS CIDs, NOT CHARACTERS.  Its fonts are Type0 (`/Subtype /CIDFontType2`) and
    its strings are hex — `[<00010002> -277 <0003000400050006>] TJ` — where each 4-hex-digit code is a
    glyph id in that font's own subset, meaning nothing until it is mapped.  The map is the font's
    `/ToUnicode` CMap, a stream of `beginbfchar` / `beginbfrange` blocks.  So: index the objects, build
    a CID → Unicode map per font object, resolve each page's `/Resources /Font` names to those objects,
    then walk the content stream taking `/Name … Tf` to switch maps and `<hhhh>` to decode.
  · A SCANNED REPORT'S TEXT IS AN OCR LAYER IN SIMPLE FONTS, single-byte and written as `(...)`
    strings with no `/ToUnicode` at all.  That branch is a dozen lines and runs when a page's fonts
    carry no CMap.

  WHAT IT DOES NOT DO: word spacing.  A PDF positions each run and the spaces between runs are
  geometry, not characters, so the output of the CID branch runs words together
  (`8.Populationofcapitalcities…`).  That is fine for what this is for — finding a city's row and
  reading the figures under it — and pretending otherwise would mean guessing at a space from an
  advance width.  The OCR branch keeps the original's spacing, since a scanned layer has real spaces.

  `--pages` marks each page with `=== page <objnum>`, which is how a page number is recovered: find the
  printed folio on a nearby page and count.
*/
const fs = require("fs");
const zlib = require("zlib");

const file = process.argv[2];
const MARK = process.argv.includes("--pages");
if (!file) { console.error("usage: node .claude/pdf-text.js <file.pdf> [--pages]"); process.exit(2); }
const s = fs.readFileSync(file).toString("latin1");

/* Objects are indexed by a plain scan rather than through the xref, which costs nothing and survives
   a damaged or incrementally-updated table. */
const objs = {};
{ const re = /(\d+) 0 obj/g; let m; while ((m = re.exec(s))) objs[m[1]] = m.index + m[0].length; }
const raw = n => { const o = objs[n]; if (o === undefined) return null; const e = s.indexOf("endobj", o); return s.slice(o, e < 0 ? s.length : e); };
function stream(n) {
  const r = raw(n); if (!r) return null;
  const i = r.indexOf("stream"); if (i < 0) return null;
  let j = i + 6; if (r[j] === "\r") j++; if (r[j] === "\n") j++;
  let d = Buffer.from(r.slice(j, r.lastIndexOf("endstream")), "latin1");
  if (/\/FlateDecode/.test(r.slice(0, i))) {
    try { d = zlib.inflateSync(d); } catch (e) { try { d = zlib.inflateRawSync(d); } catch (e2) { return null; } }
  }
  return d;
}

/* font object number -> { cid: "char" }, from that font's own ToUnicode CMap. */
const fontMap = {};
for (const n of Object.keys(objs)) {
  const r = raw(n);
  if (!r || !/\/Type\s*\/Font/.test(r)) continue;
  const tu = r.match(/\/ToUnicode\s+(\d+) 0 R/); if (!tu) continue;
  const cm = stream(tu[1]); if (!cm) continue;
  const txt = cm.toString("latin1"); const mp = {};
  let b; const bf = /beginbfchar([\s\S]*?)endbfchar/g;
  while ((b = bf.exec(txt))) {
    let p; const pr = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g;
    while ((p = pr.exec(b[1]))) {
      let dst = ""; for (let i = 0; i < p[2].length; i += 4) dst += String.fromCharCode(parseInt(p[2].substr(i, 4), 16));
      mp[parseInt(p[1], 16)] = dst;
    }
  }
  const bra = /beginbfrange([\s\S]*?)endbfrange/g;
  while ((b = bra.exec(txt))) {
    let p; const pr = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g;
    while ((p = pr.exec(b[1]))) {
      const lo = parseInt(p[1], 16), hi = parseInt(p[2], 16), d = parseInt(p[3], 16);
      for (let c = lo; c <= hi && c - lo < 65536; c++) mp[c] = String.fromCharCode(d + (c - lo));
    }
  }
  fontMap[n] = mp;
}

function pageFonts(pageRaw) {
  let res = pageRaw;
  const ri = pageRaw.match(/\/Resources\s+(\d+) 0 R/); if (ri) res = raw(ri[1]) || "";
  const fi = res.indexOf("/Font"); if (fi < 0) return {};
  const seg = res.slice(fi, fi + 4000);
  const inner = seg.slice(seg.indexOf("<<") + 2, seg.indexOf(">>"));
  const out = {}; let f; const fr = /\/([A-Za-z0-9_+.\-]+)\s+(\d+) 0 R/g;
  while ((f = fr.exec(inner))) out["/" + f[1]] = f[2];
  return out;
}

const out = [];
for (const pn of Object.keys(objs)) {
  const pr = raw(pn);
  if (!pr || !/\/Type\s*\/Page\b/.test(pr)) continue;
  const fonts = pageFonts(pr);
  let cont = [];
  const cm = pr.match(/\/Contents\s+(\d+) 0 R/);
  if (cm) cont = [cm[1]];
  else { const am = pr.match(/\/Contents\s*\[([^\]]*)\]/); if (am) cont = [...am[1].matchAll(/(\d+) 0 R/g)].map(x => x[1]); }
  const t = Buffer.concat(cont.map(c => stream(c) || Buffer.alloc(0))).toString("latin1");
  const cid = Object.values(fonts).some(o => fontMap[o]);
  const res = []; let line = "", cur = null;
  if (cid) {
    const tok = /\/([A-Za-z0-9_+.\-]+)\s+[\d.]+\s+Tf|<([0-9A-Fa-f]*)>|\bTD\b|\bTd\b|\bT\*\b|\bET\b/g; let tk;
    while ((tk = tok.exec(t))) {
      if (tk[1] !== undefined) { const on = fonts["/" + tk[1]]; cur = on ? fontMap[on] : null; }
      else if (tk[2] !== undefined) {
        const h = tk[2];
        for (let i = 0; i < h.length; i += 4) { const c = parseInt(h.substr(i, 4), 16); line += cur && cur[c] !== undefined ? cur[c] : "�"; }
      } else { if (line.trim()) res.push(line); line = ""; }
    }
  } else {
    const tok = /\((?:\\.|[^\\()])*\)|\bTD\b|\bTd\b|\bT\*\b|\bET\b/g; let tk;
    while ((tk = tok.exec(t))) {
      if (tk[0][0] === "(") line += tk[0].slice(1, -1).replace(/\\([nrtbf()\\]|[0-7]{1,3})/g, (a, b) => (/^[0-7]+$/.test(b) ? String.fromCharCode(parseInt(b, 8)) : "nrt".includes(b) ? " " : b));
      else { if (line.trim()) res.push(line); line = ""; }
    }
  }
  if (line.trim()) res.push(line);
  if (res.length) out.push((MARK ? "=== page " + pn + "\n" : "") + res.join("\n"));
}
process.stdout.write(out.join("\n") + "\n");
