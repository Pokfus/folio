/* test-atlas-credits.js — the Sources and credits page (#credits), Atlas v2 Phase 1d (docs/atlas-v2-design.md §2.10a).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-credits.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES, against the data files themselves (never against a list typed here):
     · every source id in the `sources` header of every file under atlas/data/ appears on the page (a <li> with
       that data-source-id), and no source on the page is absent from every file;
     · every licence shown is an accepted identifier (§2.10a), every link on the page is https (the one in-site link,
       to #mission, excepted), every source shows its name, version, licence link, attribution and retrieval date;
     · the ODbL statement names every file that carries the OSM source, and the caution sentence is on the page;
     · the page fits a 390 px phone with no horizontal scroll, and its three doors exist: the Settings row, the home
       page's footer button and the About page's credits list;
     · the Atlas v2 "About this map" sheet links to it.
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const B = require("./atlas-build/build-credits.js");
const { LICENCES } = require("./atlas-build/fetch-sources.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5621;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const base = `http://127.0.0.1:${PORT}/`;
  // the truth: every header of every file
  const collected = B.collect();
  const inFiles = new Map(); for (const f of collected.fileSources) for (const id of f.ids) inFiles.set(id, (inFiles.get(id) || 0) + 1);
  const osmFiles = collected.fileSources.filter((f) => f.ids.includes("osm-land-polygons")).map((f) => f.rel);
  console.log(`\n${collected.filesRead} data files read, ${inFiles.size} source ids: ${[...inFiles.keys()].sort().join(", ")}\n`);

  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(base + "#credits", { waitUntil: "load" });
  await page.waitForSelector(".cred-list .cred-src", { timeout: 60000 });

  console.log("\x1b[1m1) every file's sources are on the page\x1b[0m\n");
  const shown = await page.evaluate(() => [...document.querySelectorAll(".cred-src")].map((li) => ({ id: li.getAttribute("data-source-id"), name: li.querySelector(".cred-name").textContent.trim(), lic: li.querySelector(".cr-lic a") ? { text: li.querySelector(".cr-lic a").textContent.trim(), href: li.querySelector(".cr-lic a").href } : null, meta: li.querySelector(".cred-meta").textContent.trim(), attr: li.querySelector(".cred-attr").textContent.trim(), files: li.querySelector(".cred-files").textContent.trim(), links: [...li.querySelectorAll("a")].map((a) => a.href) })));
  const onPage = new Set(shown.map((s) => s.id));
  const missing = [...inFiles.keys()].filter((id) => !onPage.has(id));
  check("every source id in every file header appears on the page", missing.length === 0, missing.join(", ") || `${onPage.size} sources`);
  const orphan = [...onPage].filter((id) => !inFiles.has(id));
  check("no listed source is absent from every file", orphan.length === 0, orphan.join(", "));
  const credits = (() => { global.window = {}; require(path.join(ROOT, "atlas/data/credits.js")); return global.window.ATLAS_CREDITS; })();
  const licIds = new Set(credits.sources.flatMap((s) => s.variants.map((v) => v.licence)));
  check("every licence is on the accepted list", [...licIds].every((l) => Object.prototype.hasOwnProperty.call(LICENCES, l)), [...licIds].join(", "));
  check("every source shows name, version, licence link, attribution and retrieval date", shown.every((s) => s.name && s.lic && /^Version .+\. Retrieved \d/.test(s.meta) && s.attr.length > 10 && /Folio files derived from it: /.test(s.files)), shown.filter((s) => !(s.name && s.lic)).map((s) => s.id).join(", "));
  // the attribution string exactly as the files carry it
  const attrOK = shown.every((s) => credits.sources.find((x) => x.id === s.id).variants.some((v) => v.attribution.replace(/\s+/g, " ").trim() === s.attr.replace(/\s+/g, " ").trim()));
  check("every attribution string is the files' own, verbatim", attrOK);
  const links = await page.evaluate(() => [...document.querySelectorAll("#view a")].map((a) => a.getAttribute("href")));
  check("every link is https (the About link aside)", links.every((h) => /^https:\/\//.test(h) || h === "#mission"), links.filter((h) => !/^https:\/\//.test(h) && h !== "#mission").join(", ") || `${links.length} links`);
  const odbl = await page.evaluate(() => { const d = document.querySelector("#odbl"); return d ? { text: d.textContent, files: [...d.querySelectorAll(".cred-odbl-files code")].map((c) => c.textContent) } : null; });
  check("the ODbL statement is on the page and names the OSM attribution", !!odbl && /Open Database License/.test(odbl.text) && /OpenStreetMap contributors/.test(odbl.text));
  const covered = osmFiles.every((rel) => odbl && odbl.files.some((f) => { const p = f.replace(/ \(\d+ files\)$/, ""); return p.endsWith("/") ? rel.startsWith(p) : rel === p; }));
  check("the ODbL statement names every file that carries the OSM source", covered, odbl ? odbl.files.join(", ") : "no statement");
  const caution = await page.evaluate(() => (document.querySelector(".cred-caution") || {}).textContent || "");
  check("the caution sentence about borders is on the page", /reconstruction/.test(caution) && /border/i.test(caution));
  check("no page errors on #credits", errors.length === 0, errors.slice(0, 3).join(" | "));

  console.log("\n\x1b[1m2) a 390 px phone\x1b[0m\n");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  const fit = await page.evaluate(() => ({ sw: document.scrollingElement.scrollWidth, cw: document.documentElement.clientWidth, wide: [...document.querySelectorAll("#view *")].filter((e) => e.getBoundingClientRect().right > 391).length }));
  check("the page fits 390 px (no horizontal scroll, nothing past the right edge)", fit.sw <= fit.cw && fit.wide === 0, `scrollWidth ${fit.sw}, client ${fit.cw}, ${fit.wide} elements past the edge`);
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log("\n\x1b[1m3) the doors\x1b[0m\n");
  await page.goto(base + "#settings", { waitUntil: "load" }); await page.waitForSelector("#creditsBtn", { timeout: 30000 });
  await page.click("#creditsBtn"); await page.waitForSelector(".cred-list .cred-src", { timeout: 30000 });
  check("Settings → Sources and credits opens the page", (await page.evaluate(() => location.hash)) === "#credits");
  await page.goto(base + "#home", { waitUntil: "load" }); await page.waitForSelector("#b-credits", { timeout: 30000 });
  await page.click("#b-credits"); await page.waitForSelector(".cred-list .cred-src", { timeout: 30000 });
  check("the home page's footer Credits button opens the page", (await page.evaluate(() => location.hash)) === "#credits");
  await page.goto(base + "#mission", { waitUntil: "load" }); await page.waitForSelector(".credits-list", { timeout: 30000 });
  check("the About page's credits list links to it", await page.evaluate(() => !!document.querySelector('.credits-list a[href="#credits"]')));
  // the Atlas v2 About sheet
  await page.goto(base + "#map2", { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  const aboutLink = await page.evaluate(() => { const b = document.querySelector(".atlas2-about-btn"); if (!b) return null; b.click(); const s = document.querySelector(".atlas2-about"); return s && !s.hidden ? [...s.querySelectorAll("a")].map((a) => a.getAttribute("href")) : null; });
  check("the Atlas v2 About sheet opens and links to #credits", !!aboutLink && aboutLink.includes("#credits"), aboutLink ? aboutLink.join(", ") : "no sheet");

  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
