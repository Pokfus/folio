#!/usr/bin/env node
/* ============================================================================
   build-fonts.js — SELF-HOST THE WEBFONTS, so no third party sits on the
   critical render path.

   node .claude/build-fonts.js            # fetch + write fonts/ and fonts.css
   node .claude/build-fonts.js --check    # assert every url in fonts.css exists

   WHY THIS EXISTS (Sep 2026, measured).
   styles.css opened with a single `@import url('https://fonts.googleapis.com/…')`
   pulling twenty families. A CSS @import is discovered only AFTER the 0.69 MB
   stylesheet has itself downloaded and parsed, it blocks that stylesheet from
   completing, and a classic <script> will not execute while a stylesheet is
   pending — so when the font host is slow or unreachable, EVERY script tag
   waits, data.js included. Measured in a browser with fonts.googleapis.com
   blocked:

       as shipped .................. 12,949 ms to first paint
       @import commented out ..........  437 ms

   That 12.9s is the FAILURE case, not the ordinary one — but the failure case
   is every reader behind a corporate proxy, every privacy extension that blocks
   Google endpoints, and every reader in mainland China, for a site that ships
   China, Japan and Korea collections. `display=swap` cannot help: the swap
   governs the FONT, not the stylesheet that is still blocked.

   A <link rel="stylesheet"> would fix the discovery half and NOT the blocking
   half — a stylesheet is render-blocking wherever it lives. The CSP-safe async
   trick (`media="print" onload="this.media='all'"`) needs an inline event
   handler, which `script-src 'self'` forbids and which we are not weakening the
   policy for. So the answer is to serve the fonts ourselves: it removes the
   third party outright, it lets `font-src` drop to 'self', and it is what makes
   the PWA render correctly OFFLINE, which it never could while the faces came
   from Google.

   WHAT IT COSTS, MEASURED: 230 unique woff2 files, 7.7 MB on disk. That is a
   deploy-size cost and NOT a reader cost — an @font-face declaration is inert
   until some text on the page actually needs that face, so a reader downloads
   only the one or two subsets their theme and their card's script require,
   exactly as they did from Google.

   TWO THINGS THIS RUN FIXED BY ITSELF.
   · `Press Start 2P` was written `&Press+Start+2P` in the old @import, with no
     `family=`, so Google ignored it and the arcade theme has been falling back
     to a system monospace since the day it shipped. It is in FAMILIES below
     with its proper key and now actually loads.
   · The old URL asked for `Cormorant+Garamond` and the rest in one query
     string, which meant one 452 KB CSS response on the critical path. The
     generated fonts.css is 60 KB and same-origin.

   THE FILENAMES ARE OURS, NOT GOOGLE'S. Google serves opaque hashed names
   (`k3kXo84MPvpLmixcA63oeALhLOCT-…woff2`) that say nothing and change without
   notice. Each file here is written `<family-slug>-<subset>-<weight><-italic>.woff2`
   so a directory listing is readable and a missing face is obvious. The mapping
   is rebuilt from the fetched CSS on every run, never stored.

   RE-RUN IT when a family is added to a theme, and commit fonts/ with fonts.css
   — the two are a matched pair and a fonts.css naming a file that is not there
   is a face that silently falls back.
   ============================================================================ */

"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(__dirname, "..");
const FONT_DIR = path.join(ROOT, "fonts");
const OUT_CSS = path.join(ROOT, "fonts.css");

/* The twenty families styles.css names, with the axes each theme actually uses.
   Keep this in step with the `--serif` / `--display` / `--mono` / `--han` custom
   properties and the THEMES table in app.js. */
const FAMILIES = [
  "Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,900",
  "Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400",
  "IBM+Plex+Mono:wght@400;500;600",
  "Inter:wght@400;500;600",
  "Noto+Sans+SC:wght@400;500;700",
  "Space+Grotesk:wght@400;500;600;700",
  "Lora:ital,wght@0,400;0,500;0,600;1,400",
  "Nunito+Sans:wght@400;600;700",
  "Spectral:wght@400;500;600;700",
  "Cormorant+Garamond:wght@400;500;600;700",
  "Sora:wght@400;500;600;700",
  "JetBrains+Mono:wght@400;500;700",
  "Orbitron:wght@500;700;900",
  "Press+Start+2P",              // was `&Press+Start+2P` (no `family=`) and never loaded
  "VT323",
  "EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600",
  "Cinzel:wght@400;600;700",
  "Oswald:wght@400;500;600;700",
  "PT+Serif:ital,wght@0,400;0,700;1,400;1,700",
  "Special+Elite",
];

const CSS_URL =
  "https://fonts.googleapis.com/css2?" +
  FAMILIES.map((f) => "family=" + f).join("&") +
  "&display=swap";

/* A modern desktop UA is what makes Google serve woff2 with unicode-range
   subsetting. An old or absent UA gets one enormous ttf per family instead. */
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function get(url, binary) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": UA } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return resolve(get(res.headers.location, binary));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(url + " → HTTP " + res.statusCode));
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(binary ? Buffer.concat(chunks) : Buffer.concat(chunks).toString("utf8")));
      })
      .on("error", reject);
  });
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* Parse the fetched CSS into one record per @font-face.
   MATCH THE @font-face, NOT THE COMMENT IN FRONT OF IT. Google labels the Latin
   and Cyrillic blocks `/* latin *​/`, `/* greek-ext *​/` and so on — but it
   labels NONE of Noto Sans SC's 291 numbered CJK subsets, which arrive as bare
   consecutive rules. A regex anchored on the comment therefore silently keeps
   290 of 581 faces and drops every Chinese glyph on the site, while reporting a
   clean run. The subset name is read from a comment WHERE THERE IS ONE and
   derived from the file's own `.N.woff2` suffix otherwise. */
function parseFaces(css) {
  const out = [];
  const rx = /(?:\/\*\s*([^*]+?)\s*\*\/\s*)?@font-face\s*\{([\s\S]*?)\}/g;
  let m;
  while ((m = rx.exec(css))) {
    const body = m[2];
    const numbered = (body.match(/\.(\d+)\.woff2/) || [])[1];
    const subset = (m[1] || "").trim() || (numbered ? "cjk-" + numbered : "default");
    const family = (body.match(/font-family:\s*'([^']+)'/) || [])[1];
    const url = (body.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/) || [])[1];
    if (!family || !url) continue;
    out.push({
      subset,
      family,
      url,
      style: (body.match(/font-style:\s*([a-z]+)/) || [, "normal"])[1],
      weight: (body.match(/font-weight:\s*([^;]+)/) || [, "400"])[1].trim(),
      stretch: (body.match(/font-stretch:\s*([^;]+)/) || [])[1],
      range: (body.match(/unicode-range:\s*([^;]+)/) || [])[1],
      body,
    });
  }
  return out;
}

/* A readable, collision-free local name. Several faces legitimately share one
   gstatic file (a variable font serves every weight in its range from one
   file), so the name is derived from the FILE and reused wherever that file
   appears — otherwise the same bytes land on disk four times. */
function localName(face, seen) {
  const base =
    slug(face.family) +
    "-" +
    slug(face.subset) +
    "-" +
    slug(face.weight.replace(/\s+/g, "-")) +
    (face.style === "italic" ? "-italic" : "");
  let name = base;
  let n = 2;
  while (seen.has(name) && seen.get(name) !== face.url) name = base + "-" + n++;
  seen.set(name, face.url);
  return name + ".woff2";
}

async function build() {
  process.stdout.write("fetching the face list from Google … ");
  const css = await get(CSS_URL, false);
  const faces = parseFaces(css);
  console.log(faces.length + " @font-face rules, " + new Set(faces.map((f) => f.url)).size + " unique files");

  const missing = FAMILIES.map((f) => decodeURIComponent(f.split(":")[0].replace(/\+/g, " "))).filter(
    (fam) => !faces.some((f) => f.family === fam)
  );
  if (missing.length) {
    console.error("\nREFUSED — Google served nothing for: " + missing.join(", "));
    console.error("A family that returns no faces is almost always a typo in FAMILIES.");
    process.exit(1);
  }

  fs.mkdirSync(FONT_DIR, { recursive: true });
  for (const f of fs.readdirSync(FONT_DIR)) if (f.endsWith(".woff2")) fs.unlinkSync(path.join(FONT_DIR, f));

  const seen = new Map();
  const byUrl = new Map();
  for (const face of faces) {
    if (byUrl.has(face.url)) { face.local = byUrl.get(face.url); continue; }
    face.local = localName(face, seen);
    byUrl.set(face.url, face.local);
  }

  const jobs = [...byUrl.entries()];
  let done = 0;
  let bytes = 0;
  const CONC = 12;
  await Promise.all(
    Array.from({ length: CONC }, async () => {
      while (jobs.length) {
        const [url, name] = jobs.pop();
        const buf = await get(url, true);
        fs.writeFileSync(path.join(FONT_DIR, name), buf);
        bytes += buf.length;
        if (++done % 40 === 0) process.stdout.write("  … " + done + " files\n");
      }
    })
  );
  console.log("  downloaded " + done + " files, " + (bytes / 1048576).toFixed(2) + " MB");

  const head =
    "/* ============================================================================\n" +
    "   fonts.css — GENERATED by .claude/build-fonts.js. Do not hand-edit.\n" +
    "\n" +
    "   Self-hosted so that no third party sits on the critical render path. The\n" +
    "   script's own header carries the measurement that forced this (12,949 ms to\n" +
    "   first paint with fonts.googleapis.com blocked, against 437 ms without the\n" +
    "   @import) and the reasoning; read it before changing anything here.\n" +
    "\n" +
    "   Every @font-face below is inert until some text on the page actually needs\n" +
    "   that face, so the " + (bytes / 1048576).toFixed(1) + " MB in fonts/ is a deploy-size cost and not a\n" +
    "   reader cost — a reader fetches only the subsets their theme and their card's\n" +
    "   script require.\n" +
    "   ============================================================================ */\n\n";

  const rules = faces
    .map((f) => {
      const lines = ["@font-face {", "  font-family: '" + f.family + "';", "  font-style: " + f.style + ";"];
      lines.push("  font-weight: " + f.weight + ";");
      if (f.stretch) lines.push("  font-stretch: " + f.stretch.trim() + ";");
      lines.push("  font-display: swap;");
      lines.push("  src: url('fonts/" + f.local + "') format('woff2');");
      if (f.range) lines.push("  unicode-range: " + f.range.trim() + ";");
      lines.push("}");
      return "/* " + f.family + " — " + f.subset + " */\n" + lines.join("\n");
    })
    .join("\n\n");

  fs.writeFileSync(OUT_CSS, head + rules + "\n");
  console.log("wrote fonts.css — " + (fs.statSync(OUT_CSS).size / 1024).toFixed(1) + " KB, " + faces.length + " rules");
  console.log("\nRemember: fonts/ and fonts.css are a matched pair. Commit both.");
}

function check() {
  if (!fs.existsSync(OUT_CSS)) { console.error("fonts.css is missing — run without --check to build it."); process.exit(1); }
  const css = fs.readFileSync(OUT_CSS, "utf8");
  const urls = [...css.matchAll(/url\('fonts\/([^']+)'\)/g)].map((m) => m[1]);
  const uniq = [...new Set(urls)];
  let bad = 0;
  for (const u of uniq) {
    if (!fs.existsSync(path.join(FONT_DIR, u))) { console.error("  MISSING  fonts/" + u); bad++; }
  }
  const onDisk = fs.existsSync(FONT_DIR) ? fs.readdirSync(FONT_DIR).filter((f) => f.endsWith(".woff2")) : [];
  const orphan = onDisk.filter((f) => !uniq.includes(f));
  for (const o of orphan) console.error("  ORPHAN   fonts/" + o + " (no rule points at it)");
  if (bad || orphan.length) {
    console.error("\nFAIL — " + bad + " missing, " + orphan.length + " orphaned.");
    process.exit(1);
  }
  const bytes = onDisk.reduce((t, f) => t + fs.statSync(path.join(FONT_DIR, f)).size, 0);
  console.log("ok  " + urls.length + " rules over " + uniq.length + " files, " + (bytes / 1048576).toFixed(2) + " MB, none missing or orphaned");
}

if (process.argv.includes("--check")) check();
else build().catch((e) => { console.error("\nFAILED: " + e.message); process.exit(1); });
