/* test-engine-switch.js — run a browser suite that was written against V1's card windows on the Atlas v2 ENGINE's windows or on V1's (Atlas v2 Phase 4b, Task 7; flipped by Stage B).

     node .claude/test-map-cards.js                       (also test-card-locator.js and test-war-cards.js) — the DEFAULT, the engine's windows, exactly what a reader gets
     FOLIO_ENGINE=v1 node .claude/test-map-cards.js        — v1's windows, the fallback (no WebGL2, a refused bundle, `#map2?preview=0`) that stays until Phase 5

   `launch(chromium, opts)` is `chromium.launch(opts)`; with FOLIO_ENGINE=v1 every page and context the browser opens first gets an init script that sets the per-viewer switch to "0"
   (localStorage `folio.atlas2.preview`, the way back), so the card windows the suite mounts are drawn by v1. `v2()` says which engine is under test, for the assertions that are about one
   engine's mechanism (V1's `RIVERS` global, V1's hi-res coast bundles) and carry an engine-aware twin instead (`FOLIO_ENGINE=v2` is still accepted and means the default). Not part of the site. */
"use strict";
const ON = process.env.FOLIO_ENGINE !== "v1";
const INIT = () => { try { localStorage.setItem("folio.atlas2.preview", "0"); } catch (e) {} };
/* The init script is registered at the page's FIRST `goto`, not when the page is created: a suite that seeds its own storage (some of them clear localStorage first) registers its scripts before navigating, and
   init scripts run in registration order, so the switch must come after them or it is wiped before the app reads it. */
function patchPage(p) {
  if (p.__engineSwitch) return p; p.__engineSwitch = true;
  const g = p.goto.bind(p); let done = false;
  p.goto = async (...a) => { if (!done) { done = true; await p.addInitScript(INIT); } return g(...a); };
  return p;
}
async function launch(chromium, opts) {
  const browser = await chromium.launch(opts);
  if (ON) return browser;
  const nc = browser.newContext.bind(browser), np = browser.newPage.bind(browser);
  browser.newContext = async (o) => { const c = await nc(o); const cp = c.newPage.bind(c); c.newPage = async (...a) => patchPage(await cp(...a)); return c; };
  browser.newPage = async (o) => patchPage(await np(o));
  return browser;
}
/* the engine reads its data with fetch() and a Worker, which a file:// page cannot do (the file:// path is the slow, degraded one, and its history twin is the 2a pilot slice): a suite that opens index.html as a file
   serves it over http when the engine is under test (the default) */
function serve(root, port) {
  const http = require("http"), fs = require("fs"), path = require("path");
  const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
  const server = http.createServer((req, res) => { const p = decodeURIComponent(req.url.split("?")[0]) === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]); fs.readFile(path.join(root, p), (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream", "Content-Length": d.length }); res.end(d); }); });
  return new Promise((resolve) => server.listen(port || 0, () => resolve({ base: "http://127.0.0.1:" + server.address().port + "/", close: () => server.close() })));
}
module.exports = { launch, serve, v2: () => ON };
