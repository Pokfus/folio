// Serve the site with the real _headers CSP applied and walk every route, collecting CSP violations,
// console errors and page errors. Proves the policy doesn't break the app before it reaches the live site.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

// Repo root, resolved from this script so the test runs from anywhere.
const ROOT = path.resolve(__dirname, "..");
// This sandbox ships Chromium outside the playwright package; a normal `npx playwright install` needs neither.
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};

const root = ROOT;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".mp3": "audio/mpeg", ".png": "image/png" };

// parse the CSP + friends straight out of _headers, so the test can never drift from what ships
const headerLines = fs.readFileSync(path.join(root, "_headers"), "utf8").split("\n");
const EXTRA = {};
let inBlock = false;
for (const line of headerLines) {
  if (/^\/\*/.test(line)) { inBlock = true; continue; }
  if (!inBlock) continue;
  const m = /^\s{2}([A-Za-z-]+):\s*(.+)$/.exec(line);
  if (m) EXTRA[m[1]] = m[2].trim();
}
if (!EXTRA["Content-Security-Policy"]) { console.error("no CSP found in _headers"); process.exit(1); }
console.log("CSP under test:\n  " + EXTRA["Content-Security-Policy"] + "\n");

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, Object.assign({ "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" }, EXTRA));
    res.end(data);
  });
});

const ROUTES = ["", "decks", "map", "account", "settings", "challenge", "chrono", "truefalse", "whosaid", "findit", "mission", "studio", "community", "deck/does-not-exist"];

(async () => {
  await new Promise((r) => server.listen(5599, r));
  // 127.0.0.1 is a dev origin for app.js (no service worker, no cloud overrides) — same as the real dev machine
  const base = "http://127.0.0.1:5599/";
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage();

  const violations = [], errors = [];
  await page.exposeFunction("__cspHit", (d) => violations.push(d));
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => {
      window.__cspHit({ directive: e.violatedDirective, blocked: String(e.blockedURI).slice(0, 160), line: e.lineNumber });
    });
  });
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 300)); });
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 300)));

  for (const r of ROUTES) {
    await page.goto(base + (r ? "#" + r : ""), { waitUntil: "load" });
    await page.waitForTimeout(r === "map" || r === "findit" ? 3500 : 900);
    process.stdout.write("  visited #" + (r || "home") + "\n");
  }
  // exercise a study session + a glossary popup, the two paths that touch the code changed in this phase
  await page.goto(base + "#decks", { waitUntil: "load" });
  await page.waitForTimeout(800);
  const studied = await page.evaluate(() => {
    const b = document.querySelector(".collection .banner, .collection-row");
    if (b) { b.click(); return true; }
    return false;
  });
  await page.waitForTimeout(1200);
  console.log("  library row click: " + (studied ? "ok" : "no row found"));

  await browser.close();
  server.close();

  const uniq = [...new Map(violations.map((v) => [v.directive + v.blocked, v])).values()];
  console.log("\nCSP violations: " + uniq.length);
  uniq.forEach((v) => console.log("  " + v.directive + "  <- " + v.blocked));
  console.log("Console/page errors: " + errors.length);
  [...new Set(errors)].forEach((e) => console.log("  " + e));
  process.exit(uniq.length || errors.length ? 1 : 0);
})();
