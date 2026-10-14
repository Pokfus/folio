/* test-window-env.js — the little helper the card-window suites share (Atlas v2 Phase 5). Not part of the site.

     const WE = require("./test-window-env.js");
     const browser = await WE.launch(chromium, { executablePath: process.env.FOLIO_CHROMIUM || undefined });
     const { base, close } = await WE.serve(ROOT);           // http://127.0.0.1:<port>/ — the whole repo, index.html at /

   Since Phase 5 the card windows (a map card, a locator, a war) and Find it are drawn ONLY by the Atlas v2 engine, so there is no second engine to switch to: this file replaces the earlier
   engine switch (`test-engine-switch.js`, with its FOLIO_ENGINE=v1 way back) and keeps its three exports.
     launch(chromium, opts)  chromium.launch(opts), kept so a suite has one place to say how the browser starts.
     serve(root, port)       the engine reads its data with fetch() and a Worker, which a file:// page cannot do, so a suite that used to open index.html as a file serves it over http.
     v2()                    always true (the engine is the only one); kept so a suite's `if (v2())` reads the same. */
"use strict";
async function launch(chromium, opts) { return chromium.launch(opts); }
function serve(root, port) {
  const http = require("http"), fs = require("fs"), path = require("path");
  const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split("?")[0]), p = u === "/" ? "/index.html" : u, file = path.join(root, p);
    if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream", "Content-Length": d.length }); res.end(d); });
  });
  return new Promise((resolve) => server.listen(port || 0, () => resolve({ base: "http://127.0.0.1:" + server.address().port + "/", close: () => server.close() })));
}
module.exports = { launch, serve, v2: () => true };
