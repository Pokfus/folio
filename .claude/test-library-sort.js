// The Library shelf's two orders added in Nov 2026 (on request): by POPULARITY, and by DATE with a
// work written over a long span filed at its EARLIEST year.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-library-sort.js
//
// The read counts are off on a dev origin (`isDevOrigin` — localhost, 127.x, file:), so this suite
// serves the site as http://folio.test through a host-resolver rule and answers the Supabase
// requests itself: `book_stats` with a table it controls, everything else with an empty list.
// Nothing reaches the real project.
//
// Re-run after touching BOOK_SORTS, PAGES.library's comparator, bookStatsLoad or a book's `year`.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const SUPA = /^https:\/\/[a-z0-9]+\.supabase\.co/;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
});
let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log("ok    " + name); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
}

const READS = { "homer-iliad": 40, "plato-republic": 31, "beowulf": 31, "magna-carta": 7, "ramayana": 2 };

async function open(browser, base, statsStatus) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route((url) => SUPA.test(url.toString()), async (r) => {
    const u = r.request().url();
    if (u.includes("/rest/v1/book_stats")) {
      if (statsStatus !== 200) return r.fulfill({ status: statsStatus, contentType: "application/json", body: "{}", headers: { "access-control-allow-origin": "*" } });
      const rows = Object.keys(READS).map((k) => ({ book: k, reads: READS[k] }));
      return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(rows), headers: { "access-control-allow-origin": "*" } });
    }
    return r.fulfill({ status: 200, contentType: "application/json", body: "[]", headers: { "access-control-allow-origin": "*" } });
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.setItem("folio_library_tour_v1", "1"); } catch (e) {} });
  await page.goto(base + "#library", { waitUntil: "load" });
  await page.waitForSelector(".book-tile", { timeout: 20000 });
  await page.waitForTimeout(900);
  return { ctx, page };
}
const pick = (page, key) => page.evaluate(async (k) => {
  const sel = document.querySelector("#bkSort");
  sel.value = k; sel.dispatchEvent(new Event("change", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 900));
  return {
    sel: document.querySelector("#bkSort").value,
    dir: document.querySelector("#bkSortDir").textContent.trim(),
    ids: [...document.querySelectorAll(".book-tile")].map((t) => t.dataset.book),
    titles: [...document.querySelectorAll(".bk-tile-title")].map((t) => t.textContent),
    note: (() => { const n = document.querySelector("#bkSortNote"); return n ? !n.hidden : null; })(),
    marks: [...document.querySelectorAll(".bk-mark")].length,
  };
}, key);

(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const launch = { args: ["--host-resolver-rules=MAP folio.test 127.0.0.1"] };
  if (process.env.FOLIO_CHROMIUM) launch.executablePath = process.env.FOLIO_CHROMIUM;
  const browser = await chromium.launch(launch);
  const base = "http://folio.test:" + port + "/";

  /* ---- 1. popularity, with figures ---- */
  let { ctx, page } = await open(browser, base, 200);
  const opts = await page.evaluate(() => [...document.querySelectorAll("#bkSort option")].map((o) => o.value + "=" + o.textContent));
  check("the sort picker offers Popularity", opts.includes("popular=Popularity"), opts.join(","));
  let p = await pick(page, "popular");
  check("...and choosing it is kept", p.sel === "popular" && /Most read first/.test(p.dir), JSON.stringify({ sel: p.sel, dir: p.dir }));
  check("...the most-read book leads", p.ids[0] === "homer-iliad", p.ids.slice(0, 6).join(","));
  check("...a tie in reads falls to the title (Beowulf before The Republic)",
    p.ids[1] === "beowulf" && p.ids[2] === "plato-republic" && p.ids[3] === "magna-carta" && p.ids[4] === "ramayana", p.ids.slice(0, 6).join(","));
  const tail = p.titles.slice(5), sortedTail = tail.slice().sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  check("...and the books nobody has read yet follow in title order", tail.join("|") === sortedTail.join("|"), tail.slice(0, 5).join(" | "));
  check("...with no era marks (they belong to the date order) and no apology", p.marks === 0 && p.note === false, JSON.stringify({ marks: p.marks, note: p.note }));
  // by TITLE, not id: two books share the title "The Histories", and a tie is left where it stood
  const fwd = p.titles.slice();
  const rev = await page.evaluate(async () => {
    document.querySelector("#bkSortDir").click();
    await new Promise((r) => setTimeout(r, 900));
    return { dir: document.querySelector("#bkSortDir").textContent.trim(), titles: [...document.querySelectorAll(".bk-tile-title")].map((t) => t.textContent) };
  });
  check("...reversed, the least read come first", /Least read first/.test(rev.dir) && rev.titles.join("|") === fwd.slice().reverse().join("|"), rev.dir + " " + rev.titles.slice(-3).join(","));
  await page.reload({ waitUntil: "load" });
  await page.waitForSelector(".book-tile");
  await page.waitForTimeout(1200);
  const kept = await page.evaluate(() => ({ sel: document.querySelector("#bkSort").value, last: [...document.querySelectorAll(".book-tile")].map((t) => t.dataset.book).pop() }));
  check("...and the order survives a reload, re-sorted when the figures land", kept.sel === "popular" && kept.last === "homer-iliad", JSON.stringify(kept));
  const typed = await page.evaluate(async () => {
    document.querySelector("#bkSortDir").click();
    await new Promise((r) => setTimeout(r, 900));
    const f = document.querySelector("#bkFilter"); f.value = "the"; f.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    return [...document.querySelectorAll(".book-tile")].map((t) => t.dataset.book);
  });
  check("...and a search keeps it (of the titles with \"the\", the Iliad, the Republic, the Ramayana lead)",
    typed.slice(0, 3).join(",") === "homer-iliad,plato-republic,ramayana" && !typed.includes("beowulf"), typed.slice(0, 5).join(","));

  /* ---- 2. date: the earliest year of a span ---- */
  await page.evaluate(() => { const f = document.querySelector("#bkFilter"); f.value = ""; f.dispatchEvent(new Event("input", { bubbles: true })); });
  let d = await pick(page, "written");
  const at = (id) => d.ids.indexOf(id);
  check("by date, the Ramayana (c. 500 BCE – 200 CE) files at 500 BCE: before Herodotus, after the Odyssey",
    at("ramayana") < at("herodotus-histories") && at("ramayana") > at("homer-odyssey"), [at("homer-odyssey"), at("ramayana"), at("herodotus-histories")].join(","));
  check("...the Rigveda (c. 1500–1000 BCE) before Gilgamesh (c. 1200 BCE)", at("rigveda") < at("epic-of-gilgamesh"), at("rigveda") + "," + at("epic-of-gilgamesh"));
  check("...the Bhagavad Gita (2nd century BCE – 2nd century CE) before Caesar", at("bhagavad-gita") < at("caesar-gallic-war"), at("bhagavad-gita") + "," + at("caesar-gallic-war"));
  check("...and the era marks are drawn", d.marks >= 4, String(d.marks));
  await ctx.close();

  /* ---- 3. popularity, where the figures never arrive ---- */
  ({ ctx, page } = await open(browser, base, 404));
  p = await pick(page, "popular");
  await page.waitForTimeout(600);
  const noStats = await page.evaluate(() => ({
    note: !document.querySelector("#bkSortNote").hidden,
    text: document.querySelector("#bkSortNote").textContent,
    titles: [...document.querySelectorAll(".bk-tile-title")].map((t) => t.textContent),
    reads: document.querySelectorAll(".bk-tile-reads").length,
  }));
  const az = noStats.titles.slice().sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  check("with no read counts to be had, the shelf says so in a sentence", noStats.note && /not available/.test(noStats.text), noStats.text);
  check("...stands in title order, and prints no figure", noStats.titles.join("|") === az.join("|") && noStats.reads === 0, noStats.titles.slice(0, 4).join(" | "));
  await ctx.close();

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
