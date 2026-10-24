/* build-icons.js — renders the PNG icons the installed app needs from icon.svg and icon-maskable.svg.

     NODE_PATH=<playwright>/node_modules node .claude/build-icons.js          write them
     NODE_PATH=<playwright>/node_modules node .claude/build-icons.js --check  fail if any differs from a fresh render

   WHY PNG AT ALL (Oct 2026, docs/downloadable-app-plan.md). The SVG icons serve a browser tab and Chrome's
   install, but three readers of an icon accept only a bitmap: iOS's Home Screen (`apple-touch-icon`; an SVG
   there is ignored and iOS uses a screenshot of the page), Android's notification icon and its status-bar
   BADGE (a monochrome silhouette, where only the alpha channel is read). So:

     icon-192.png, icon-512.png     icon.svg (rounded ground), the manifest's "any" icons
     icon-maskable-512.png          icon-maskable.svg (full-bleed ground), the manifest's "maskable" icon
     icon-180.png                   icon-maskable.svg at 180: iOS rounds the corners itself
     badge-96.png                   the two leaves alone, white on transparent, for the notification badge

   Generated: never edit a PNG by hand; change the SVG and re-run this. The leaves of the badge are read
   out of icon.svg's two <path>s, so they cannot drift from the mark. */
"use strict";
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const CHECK = process.argv.includes("--check");

const icon = fs.readFileSync(path.join(ROOT, "icon.svg"), "utf8").replace(/<!--[\s\S]*?-->/g, "");
const mask = fs.readFileSync(path.join(ROOT, "icon-maskable.svg"), "utf8").replace(/<!--[\s\S]*?-->/g, "");
const leaves = [...icon.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
if (leaves.length !== 2) { console.error("expected the two leaves in icon.svg, found " + leaves.length); process.exit(1); }
// the badge: the mark scaled to fill the square (Android insets a badge itself), white, stroked for its corners
const badge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="64 104 384 304" width="512" height="512" preserveAspectRatio="xMidYMid meet">
  <g fill="#fff" stroke="#fff" stroke-width="22" stroke-linejoin="round">${leaves.map((d) => `<path d="${d}"/>`).join("")}</g></svg>`;

const OUT = [
  ["icon-192.png", icon, 192],
  ["icon-512.png", icon, 512],
  ["icon-maskable-512.png", mask, 512],
  ["icon-180.png", mask, 180],
  ["badge-96.png", badge, 96],
];

(async () => {
  const browser = await chromium.launch(LAUNCH);
  let bad = 0;
  for (const [name, svg, px] of OUT) {
    const page = await browser.newPage({ viewport: { width: px, height: px }, deviceScaleFactor: 1 });
    const sized = svg.replace(/<svg([^>]*?)\swidth="\d+"\s+height="\d+"/, `<svg$1 width="${px}" height="${px}"`);
    await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${sized}</body></html>`);
    const png = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: px, height: px } });
    await page.close();
    const file = path.join(ROOT, name);
    if (CHECK) {
      const same = fs.existsSync(file) && Buffer.compare(fs.readFileSync(file), png) === 0;
      console.log((same ? "  ok    " : "  STALE ") + name);
      if (!same) bad++;
    } else {
      fs.writeFileSync(file, png);
      console.log("  wrote " + name + " (" + px + " px, " + png.length + " bytes)");
    }
  }
  await browser.close();
  if (bad) { console.error("\n" + bad + " icon(s) differ from icon.svg / icon-maskable.svg — run node .claude/build-icons.js"); process.exit(1); }
})().catch((e) => { console.error(e); process.exit(1); });
