/* test-polity-names.js — a polity is labelled by the row alive in the displayed year (Atlas v2, 2026-10-18; the owner's phone: Rome read "ROME" at 18 CE).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-polity-names.js
     FOLIO_CHROMIUM=/path/to/chrome   FOLIO_SKIP_BROWSER=1 (the data half only)

   WHAT IT PROVES.
     1  THE DATA (Node): atlas/data/polity-names.js holds, for every series Cliopatria carries as rows with more than one Name (12 of them), the dated names of polity-row-names.json,
        which holds exactly the rows' Name / FromYear / ToYear — re-read here from the Cliopatria file when src/ has it; no two dated names of an entity overlap; the Wikidata
        overrides (Hungary 1920–43, Austria 1934–37) are untouched and beat a row name where they overlap; every dated name is one of history.bin's `sourceNames`.
        Rome: Roman Republic to 32 BCE, Roman Empire from 31 BCE to 394, Western Roman Empire from 395 (Cliopatria's boundary years); the Roman Kingdom is its own series.
     1b DATED PLACE NAMES (place-names.json): the IJsselmeer's lake, lake:117, is the Zuiderzee to 1931 and the IJsselmeer from 1932 (the dam's year, Wikidata Q4121 inception 1932).
     2  THE PAGE (Chromium, a 390 × 844 phone, the Full Atlas): Rome at 600 BCE, 200 BCE and 18 CE reads Roman Kingdom, Roman Republic and Roman Empire in the controller's row name,
        a polity label placed on the map reads ROMAN REPUBLIC (100 BCE) and ROMAN EMPIRE (18 CE) and never "ROME", and the search finds the row by every one of its names; the lake's label reads Zuiderzee at 1500 and 1660 and IJsselmeer at 1960.
   Re-run after touching build-polity-names.js, atlas/data/polity-names.js, the name application in atlas.js (applyNames) or the worker's nameIn. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };

console.log("\n1) the data\n");
const W = {}; new Function("window", fs.readFileSync(path.join(ROOT, "atlas/data/polity-names.js"), "utf8"))(W);
const N = W.ATLAS_POLITY_NAMES.names;
const ROWS = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude/atlas-build/polity-row-names.json"), "utf8")).entities;
const nameIn = (id, y, base) => { const l = N[id]; if (l) for (const o of l) if (y >= o[0] && y <= o[1]) return o[2]; return base; };
const F = require("./atlas-build/lib/format.js");
const H = F.read(fs.readFileSync(path.join(ROOT, "atlas/data/history.bin")), { headerOnly: true }).header;
const byId = new Map(H.entities.map((e) => [e.id, e]));
const multi = H.entities.filter((e) => e.kind === "polity" || e.kind === "people").filter((e) => (e.sourceNames || []).length > 1);
check("every entity whose rows carry several names has dated names", multi.every((e) => N[e.id] && N[e.id].length >= 2), multi.length + " entities: " + multi.map((e) => e.id.slice(4)).join(", "));
check("the table names exactly Cliopatria's row runs (polity-row-names.json) apart from the Wikidata overrides", Object.keys(ROWS).every((id) => ROWS[id].every((r) => (N[id] || []).some((o) => o[2] === r[2] && o[0] >= r[0] && o[1] <= r[1]))));
const clio = path.join(ROOT, ".claude/atlas-build/src/cliopatria/cliopatria_polities_only.geojson");
if (fs.existsSync(clio)) {
  const GJ = JSON.parse(fs.readFileSync(clio, "utf8")), byName = new Map(); for (const f of GJ.features) { const n = f.properties.Name; let l = byName.get(n); if (!l) byName.set(n, l = []); l.push(f.properties); }
  const spec = Object.assign({}, require("./polity-spec.json").polities, require("./atlas-build/war-series.json").polities);
  let bad = 0;
  for (const [id, runs] of Object.entries(ROWS)) { const p = spec[id.slice(4)]; for (const r of runs) { const rows = (byName.get(r[2]) || []).filter((x) => x.FromYear <= r[1] && x.ToYear >= r[0]); const lo = Math.min(...rows.map((x) => x.FromYear)), hi = Math.max(...rows.map((x) => x.ToYear)); if (!rows.length || Math.max(lo, p.years ? p.years[0] : -1e9) !== r[0] || Math.min(hi, p.years ? p.years[1] : 1e9) < r[1]) bad++; } }
  check("every run's years are Cliopatria's own (FromYear of its first row, ToYear of its last)", bad === 0, bad ? bad + " runs differ" : "read from " + path.relative(ROOT, clio));
} else console.log("        (no Cliopatria source under src/: the runs are checked against the cache only)");
let overlap = 0; for (const [id, l] of Object.entries(N)) for (let i = 1; i < l.length; i++) if (l[i][0] <= l[i - 1][1]) overlap++;
check("no two dated names of one entity overlap", overlap === 0);
check("every dated name is one of the entity's source names or a Wikidata override", Object.entries(N).every(([id, l]) => l.every((o) => o[3] || (byId.get(id).sourceNames || []).includes(o[2]))));
check("the Wikidata overrides stand (Hungary 1920–43, Austria 1934–37)", nameIn("pol:hungary_1918", 1930, "x") === "Kingdom of Hungary" && nameIn("pol:austria_1918", 1935, "x") === "Federal State of Austria");
check("Rome: Roman Republic at 200 BCE, Roman Empire at 18 CE, Western Roman Empire at 400 CE; the Kingdom is its own series",
  nameIn("pol:rome", -200, "Rome") === "Roman Republic" && nameIn("pol:rome", 18, "Rome") === "Roman Empire" && nameIn("pol:rome", 400, "Rome") === "Western Roman Empire" && byId.get("pol:roman_kingdom").name === "Roman Kingdom" && !N["pol:roman_kingdom"]);
check("Cliopatria's boundary years for Rome: the Republic's last year 32 BCE, the Empire's first 31 BCE (Actium; a boundary a year either side is the source's)", nameIn("pol:rome", -32, "Rome") === "Roman Republic" && nameIn("pol:rome", -31, "Rome") === "Roman Empire");

check("the IJsselmeer's lake (lake:117) is the Zuiderzee in every year to 1931 (1500, 1660, 1931) and the IJsselmeer from 1932 (Wikidata Q4121 inception 1932)",
  ["-10000", "1500", "1660", "1931"].every((y) => nameIn("lake:117", Number(y), "Ijsselmeer") === "Zuiderzee") && ["1932", "1960", "2026"].every((y) => nameIn("lake:117", Number(y), "Ijsselmeer") === "IJsselmeer"));
check("every place-names.json id is a registry row and is in the table", JSON.parse(fs.readFileSync(path.join(ROOT, ".claude/atlas-build/place-names.json"), "utf8")).names.every((o) => (N[o.id] || []).some((x) => x[2] === o.name && x[0] === o.from && x[1] === o.to)));

if (process.env.FOLIO_SKIP_BROWSER) { console.log(`\n${pass} ok, ${fail} failed\n`); process.exit(fail ? 1 : 0); }
console.log("\n2) the page\n");
const { chromium } = require("playwright");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const server = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html"; const f = path.join(ROOT, p); if (!f.startsWith(ROOT)) { res.writeHead(403); res.end(); return; } fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" }); res.end(d); }); });
(async () => {
  await new Promise((r) => server.listen(0, r)); const port = server.address().port;
  const browser = await chromium.launch(LAUNCH), ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }), page = await ctx.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`http://127.0.0.1:${port}/#map`); await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 }); await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.study.setMode("full"));
  const at = async (year, lon, lat, kmpp) => {
    await page.evaluate(({ year, lon, lat, kmpp }) => { const c = document.querySelector(".atlas2").__atlas2; c.setYear(year); c.setView(lon, lat, kmpp); }, { year, lon, lat, kmpp });
    await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && (!c.historyOK || c.historyOK()); }, null, { timeout: 120000 }).catch(() => {});
    await page.waitForTimeout(1500); await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow());
    return page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { rome: c.rowName("pol:rome"), kingdom: c.rowName("pol:roman_kingdom"), labels: c.labels().filter((p) => p.hist && /^pol:/.test(p.id)).map((p) => p.id + ":" + p.text) }; });
  };
  const a = await at(-600, 12.5, 42, 4), b = await at(-200, 12.5, 42, 4), c = await at(18, 12.5, 42, 4);
  check("600 BCE: the Roman Kingdom is the Roman Kingdom", a.kingdom === "Roman Kingdom", a.kingdom);
  check("200 BCE: Rome is the Roman Republic", b.rome === "Roman Republic", b.rome);
  check("18 CE: Rome is the Roman Empire", c.rome === "Roman Empire", c.rome);
  const d = await at(-100, 10, 43, 6), e = await at(18, 10, 43, 6);
  check("a polity label on the map reads ROMAN REPUBLIC at 100 BCE", d.labels.includes("pol:rome:ROMAN REPUBLIC"), d.labels.join(" | "));
  check("a polity label on the map reads ROMAN EMPIRE at 18 CE, and never ROME", e.labels.includes("pol:rome:ROMAN EMPIRE") && !e.labels.some((x) => /^pol:(rome|roman_kingdom):ROME$/.test(x)), e.labels.join(" | "));
  const found = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; const names = ["Roman Republic", "Roman Empire", "Western Roman Empire"]; return names.map((n) => { const r = c.search ? c.search(n) : null; return Array.isArray(r) ? r.includes("pol:rome") : null; }); });
  check("the search finds the row by every one of its names", found.every((x) => x === true), JSON.stringify(found));
  const lake = async (year) => { await at(year, 5.43, 52.645, 0.3); return page.evaluate(() => document.querySelector(".atlas2").__atlas2.labels().filter((p) => p.id === "lake:117").map((p) => p.text)); };
  const l1500 = await lake(1500), l1660 = await lake(1660), l1960 = await lake(1960);
  check("the water reads Zuiderzee on the map at 1500 and 1660 (not the post-1932 IJsselmeer)", l1500.join() === "Zuiderzee" && l1660.join() === "Zuiderzee", JSON.stringify([l1500, l1660]));
  check("and IJsselmeer at 1960", l1960.join() === "IJsselmeer", JSON.stringify(l1960));
  check("no page error", errors.length === 0, errors.join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
