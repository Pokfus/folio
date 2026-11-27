// THE LIBRARY'S TWO PAGES (Nov 2026, on request): the READING ROOM on a wide window (filters, rows, a
// pane for the selected text — design 1 of docs/mockups/library-desktop-redesigns/) and, below 1100px,
// the top of the DESK over the timeline shelf (the book being read, the others in progress, four
// figures — design 6).
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-library-room.js
//
// Served as http://folio.test (a host-resolver rule), because the pooled counts are off on a dev origin
// and the pane prints them; the Supabase requests are answered here and nothing reaches the real project.
//
// Re-run after touching PAGES.library, BOOK_FACETS, bookState, bookFacetPass, setReadingPos's `fin`,
// LIB_WIDE_MQ, a row's `tradition` / `form`, or any `lr-` / `ld-` / `lb-` rule in styles.css.
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
const STATS = [{ book: "homer-iliad", reads: 3, opens: 40 }, { book: "plato-republic", reads: 2, opens: 1 }];
const wait = (page, ms) => page.waitForTimeout(ms);

/* A reader with one text in hand (the Iliad, an hour ago), two more in progress, one finished and one
   starred. Written into the stored state before the page boots. */
function seed() {
  const now = Date.now(), D = 86400000;
  let s = {};
  try { s = JSON.parse(localStorage.getItem("folio_v1") || "{}") || {}; } catch (e) {}
  if (s.__seeded) return;
  s.__seeded = 1;
  s.reading = {
    "homer-iliad": { ch: 9, y: 0.4, at: now - 3600000 },
    "plato-republic": { ch: 4, y: 0.2, at: now - 2 * D },
    "marcus-aurelius-meditations": { ch: 12, y: 0.3, at: now - 9 * D, fin: 1 },
    "herodotus-histories": { ch: 2, y: 0.6, at: now - 20 * D },
  };
  s.bookFavs = { "ramayana": now };
  localStorage.setItem("folio_v1", JSON.stringify(s));
}

async function open(browser, base, viewport, opts) {
  const ctx = await browser.newContext({ viewport: viewport, hasTouch: !!(opts && opts.touch) });
  await ctx.route((url) => SUPA.test(url.toString()), (r) => {
    const u = r.request().url(), cors = { "access-control-allow-origin": "*" };
    if (u.includes("/rest/v1/book_stats")) return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(STATS), headers: cors });
    if (u.includes("/rpc/")) return r.fulfill({ status: 204, body: "", headers: cors });
    return r.fulfill({ status: 200, contentType: "application/json", body: "[]", headers: cors });
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => { try { localStorage.setItem("folio_library_tour_v1", "1"); } catch (e) {} });
  if (!(opts && opts.fresh)) {
    // the app writes its first state on boot; seed after that and load again
    await page.goto(base + "#library", { waitUntil: "load" });
    await wait(page, 700);
    await page.evaluate(seed);
    await page.reload({ waitUntil: "load" });
  } else await page.goto(base + "#library", { waitUntil: "load" });
  await page.waitForSelector("#bkShelf", { timeout: 20000 });
  await wait(page, 1100);
  return { ctx, page, errors };
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const browser = await chromium.launch({ args: ["--host-resolver-rules=MAP folio.test 127.0.0.1"] });
  const base = "http://folio.test:" + server.address().port + "/";
  const TOTAL = await (async () => { const s = fs.readFileSync(path.join(ROOT, "app.js"), "utf8"); return (s.match(/^\s+tradition: "/gm) || []).length; })();

  /* ================= 1. the Reading room ================= */
  console.log("\n1. A wide window — the Reading room");
  {
    const { ctx, page, errors } = await open(browser, base, { width: 1440, height: 900 });
    const d = await page.evaluate(() => {
      const rect = (el) => { const r = el.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), w: Math.round(r.width) }; };
      const rows = [...document.querySelectorAll(".lr-row")];
      return {
        room: !!document.querySelector(".lib-room"), tiles: document.querySelectorAll(".book-tile").length, desk: !!document.querySelector(".lib-desk"),
        rail: rect(document.querySelector(".lr-rail")), main: rect(document.querySelector(".lr-main")), det: rect(document.querySelector(".lr-det")),
        rows: rows.length, ids: rows.map((r) => r.dataset.book),
        heads: [...document.querySelectorAll(".lr-gh")].map((h) => h.textContent.replace(/\s+/g, " ").trim()),
        sel: rows.filter((r) => r.classList.contains("is-sel")).map((r) => r.dataset.book),
        untabbable: document.querySelectorAll('.lr-pick[tabindex="-1"]').length, current: document.querySelectorAll('.lr-pick[aria-current="true"]').length,
        detTitle: (document.querySelector(".lr-det h2") || {}).textContent || "",
        facets: [...document.querySelectorAll(".lr-rail h2")].map((h) => h.firstChild.textContent.trim()),
        count: document.querySelector("#bkCount").textContent.trim(),
        overflowX: document.documentElement.scrollWidth - innerWidth,
        nameless: rows.filter((r) => !/\S/.test(r.querySelector(".lr-t").textContent) || !/\S/.test(r.querySelector(".lr-au").textContent) || !/\d/.test(r.querySelector(".lr-meta").textContent)).length,
      };
    });
    check("a wide window draws the Reading room, not the banners or the desk", d.room && d.tiles === 0 && !d.desk, JSON.stringify({ room: d.room, tiles: d.tiles, desk: d.desk }));
    check("...three columns side by side: the filters, the shelf, the selected text",
      d.rail.r <= d.main.l && d.main.r <= d.det.l && Math.abs(d.rail.t - d.det.t) < 40, JSON.stringify([d.rail, d.main, d.det]));
    check("...with nothing running off the side", d.overflowX <= 0, String(d.overflowX));
    check("...a row for every text on the shelf, once each", d.rows === TOTAL && new Set(d.ids).size === d.rows, d.rows + " of " + TOTAL);
    check("...each naming its work, its author and its length", d.nameless === 0, String(d.nameless));
    check("...the starred text in a section of its own at the top", /^Favourites 1$/.test(d.heads[0] || "") && /^Everything else/.test(d.heads[1] || "") && d.ids[0] === "ramayana", JSON.stringify(d.heads));
    check("...one row selected, and the pane showing it", d.sel.length === 1 && d.sel[0] === d.ids[0] && /Ramayana/.test(d.detTitle), JSON.stringify({ sel: d.sel, det: d.detTitle }));
    check("...every row reachable by Tab, the selected one marked as current", d.untabbable === 0 && d.current === 1, JSON.stringify({ off: d.untabbable, current: d.current }));
    check("the rail offers the five ways of narrowing", d.facets.join("|") === "Reading|Tradition|Form|Original text|Length", d.facets.join("|"));

    /* a click selects; it does not open */
    await page.click('.lr-row[data-book="homer-iliad"] .lr-t');
    await wait(page, 150);
    const sel = await page.evaluate(() => ({
      hash: location.hash, sel: [...document.querySelectorAll(".lr-row.is-sel")].map((r) => r.dataset.book).join(","),
      title: document.querySelector(".lr-det h2").textContent, facts: [...document.querySelectorAll(".lr-facts dt")].map((x) => x.textContent).join("|"),
      shelved: [...document.querySelectorAll(".lr-facts dt")].filter((x) => x.textContent === "Shelved").map((x) => x.nextElementSibling.textContent).join(""),
      opened: [...document.querySelectorAll(".lr-facts dt")].filter((x) => x.textContent === "Opened").map((x) => x.nextElementSibling.textContent).join(""),
      place: (document.querySelector(".lr-place") || {}).textContent || "", go: document.querySelector(".lr-open").textContent.trim(),
      current: document.querySelectorAll('.lr-pick[aria-current="true"]').length,
    }));
    check("a click on a row selects it and stays on the shelf", sel.hash === "#library" && sel.sel === "homer-iliad" && sel.current === 1, JSON.stringify(sel));
    check("...the pane sets the text out: written, translator, length, original, where it is shelved",
      /Iliad/.test(sel.title) && ["Written", "Translator", "Length", "Original", "Shelved"].every((k) => sel.facts.includes(k)), sel.facts);
    check("...shelved by tradition and form", /^Greece · Epic and poetry$/.test(sel.shelved), sel.shelved);
    check("...how often it has been opened, where the database says", /^40 times$/.test(sel.opened), sel.opened);
    check("...where the reader is and when they were last there", /Book 9/.test(sel.place) && /last read today/.test(sel.place), sel.place);
    check("...and one button back into it, naming the place", /^Continue reading · Book 9$/.test(sel.go), sel.go);

    /* the keyboard */
    await page.keyboard.press("ArrowDown");
    await wait(page, 120);
    const down = await page.evaluate(() => ({ sel: document.querySelector(".lr-row.is-sel").dataset.book, ids: [...document.querySelectorAll(".lr-row")].map((r) => r.dataset.book),
      focus: document.activeElement.classList.contains("lr-pick") ? document.activeElement.closest(".lr-row").dataset.book : "", det: document.querySelector(".lr-open").dataset.go }));
    check("↓ moves the selection one row down, the focus and the pane with it",
      down.sel === down.ids[down.ids.indexOf("homer-iliad") + 1] && down.focus === down.sel && down.det === down.sel, JSON.stringify({ sel: down.sel, focus: down.focus, det: down.det }));
    await page.keyboard.press("ArrowUp");
    await wait(page, 120);
    await page.keyboard.press("Enter");
    await wait(page, 900);
    check("...and Enter opens the selected text", (await page.evaluate(() => location.hash)) === "#book/homer-iliad", await page.evaluate(() => location.hash));
    await page.evaluate(() => { location.hash = "#library"; });
    await page.waitForSelector(".lr-row");
    await wait(page, 500);
    check("the selection is still there on coming back", (await page.evaluate(() => (document.querySelector(".lr-row.is-sel") || { dataset: {} }).dataset.book)) === "homer-iliad");
    await page.dblclick('.lr-row[data-book="plato-republic"] .lr-t');
    await wait(page, 900);
    check("a double click opens a text", (await page.evaluate(() => location.hash)) === "#book/plato-republic", await page.evaluate(() => location.hash));
    await page.evaluate(() => { location.hash = "#library"; });
    await page.waitForSelector(".lr-row");
    await wait(page, 500);
    await page.click(".lr-open");
    await wait(page, 900);
    check("...and so does the pane's button", (await page.evaluate(() => location.hash)) === "#book/plato-republic", await page.evaluate(() => location.hash));
    await page.evaluate(() => { location.hash = "#library"; });
    await page.waitForSelector(".lr-row");
    await wait(page, 500);

    /* the filters */
    const f1 = await page.evaluate(async () => {
      const btn = (k, v) => [...document.querySelectorAll(".lr-fo")].find((b) => b.dataset.f === k && b.dataset.v === v);
      const n = (k, v) => +btn(k, v).querySelector("em").textContent;
      const before = { greece: n("tradition", "Greece"), rome: n("tradition", "Rome"), on: n("state", "on"), done: n("state", "done"), fresh: n("state", "new") };
      btn("tradition", "Greece").click();
      await new Promise((r) => setTimeout(r, 120));
      const afterG = { rows: document.querySelectorAll(".lr-row").length, rome: n("tradition", "Rome"), pressed: btn("tradition", "Greece").getAttribute("aria-pressed"),
        focus: document.activeElement === btn("tradition", "Greece"), count: document.querySelector("#bkCount").textContent.trim(), clear: !!document.querySelector(".lr-rail [data-clear]") };
      btn("tradition", "Rome").click();
      await new Promise((r) => setTimeout(r, 120));
      const afterGR = document.querySelectorAll(".lr-row").length;
      btn("form", "History").click();
      await new Promise((r) => setTimeout(r, 120));
      const afterH = { rows: document.querySelectorAll(".lr-row").length,
        all: [...document.querySelectorAll(".lr-row")].map((r) => r.dataset.book) };
      document.querySelector(".lr-rail [data-clear]").click();
      await new Promise((r) => setTimeout(r, 120));
      return { before, afterG, afterGR, afterH, cleared: document.querySelectorAll(".lr-row").length, pressedAfter: document.querySelectorAll('.lr-fo[aria-pressed="true"]').length };
    });
    check("each row of the rail carries the number of texts it would show", f1.before.greece > 0 && f1.before.on === 3 && f1.before.done === 1 && f1.before.on + f1.before.done + f1.before.fresh === TOTAL, JSON.stringify(f1.before));
    check("choosing one narrows the shelf to exactly that many", f1.afterG.rows === f1.before.greece && f1.afterG.pressed === "true", JSON.stringify(f1.afterG));
    check("...the count line says both numbers", f1.afterG.count === f1.before.greece + " of " + TOTAL + " texts", f1.afterG.count);
    check("...the focus stays on the button that was pressed, and a way to clear appears", f1.afterG.focus && f1.afterG.clear, JSON.stringify(f1.afterG));
    check("...its siblings keep their own counts (alternatives, not a narrowing)", f1.afterG.rome === f1.before.rome, f1.afterG.rome + " vs " + f1.before.rome);
    check("two rows of one facet are either-or", f1.afterGR === f1.before.greece + f1.before.rome, String(f1.afterGR));
    check("a second facet narrows the first", f1.afterH.rows > 0 && f1.afterH.rows < f1.afterGR, JSON.stringify(f1.afterH.rows));
    check("Clear filters brings the whole shelf back", f1.cleared === TOTAL && f1.pressedAfter === 0, JSON.stringify({ rows: f1.cleared, on: f1.pressedAfter }));
    const fin = await page.evaluate(async () => {
      const btn = (k, v) => [...document.querySelectorAll(".lr-fo")].find((b) => b.dataset.f === k && b.dataset.v === v);
      btn("state", "done").click();
      await new Promise((r) => setTimeout(r, 120));
      const out = { ids: [...document.querySelectorAll(".lr-row")].map((r) => r.dataset.book).join(","), st: (document.querySelector(".lr-row .lb-st-done") || {}).textContent || "",
        det: document.querySelector(".lr-det h2").textContent, go: document.querySelector(".lr-open").textContent.trim() };
      btn("state", "done").click();
      await new Promise((r) => setTimeout(r, 120));
      return out;
    });
    check("Finished is the text read to the foot of its last chapter", fin.ids === "marcus-aurelius-meditations" && /Finished/.test(fin.st), JSON.stringify(fin));
    check("...the pane never shows a text the filters have hidden, and offers to read it again", /Meditations/.test(fin.det) && fin.go === "Read again", JSON.stringify(fin));

    /* the search works with the filters, in place */
    await page.fill("#bkFilter", "zzzz no such text");
    await wait(page, 200);
    const none = await page.evaluate(() => ({ rows: document.querySelectorAll(".lr-row").length, msg: (document.querySelector(".lr-list .lib-none") || {}).textContent || "",
      det: document.querySelector(".lr-det").textContent, focus: document.activeElement.id }));
    check("a search that matches nothing says so, in the list and in the pane", none.rows === 0 && /No text here matches/.test(none.msg) && /Choose a text/.test(none.det), JSON.stringify(none));
    check("...and typing keeps the caret in the box", none.focus === "bkFilter", none.focus);
    await page.fill("#bkFilter", "");
    await wait(page, 200);

    /* the star, on the row and in the pane */
    const star = await page.evaluate(async () => {
      const row = () => document.querySelector('.lr-row[data-book="beowulf"]');
      row().querySelector("[data-star]").click();
      await new Promise((r) => setTimeout(r, 200));
      const a = { heads: [...document.querySelectorAll(".lr-gh")].map((h) => h.textContent.replace(/\s+/g, " ").trim()).join("|"),
        first2: [...document.querySelectorAll(".lr-row")].slice(0, 2).map((r) => r.dataset.book).sort().join(","),
        stored: Object.keys(JSON.parse(localStorage.getItem("folio_v1")).bookFavs || {}).sort().join(","), pressed: row().querySelector("[data-star]").getAttribute("aria-pressed") };
      row().querySelector(".lr-pick").click();
      await new Promise((r) => setTimeout(r, 120));
      document.querySelector(".lr-det [data-star]").click();
      await new Promise((r) => setTimeout(r, 200));
      return { a, after: Object.keys(JSON.parse(localStorage.getItem("folio_v1")).bookFavs || {}).join(","), hash: location.hash };
    });
    check("a row's star files the text under Favourites, there and then", /^Favourites 2\|/.test(star.a.heads) && star.a.first2 === "beowulf,ramayana" && star.a.stored === "beowulf,ramayana" && star.a.pressed === "true", JSON.stringify(star.a));
    check("...and the pane's star takes it out again, without leaving the page", star.after === "ramayana" && star.hash === "#library", JSON.stringify(star));

    /* right-click is the long press */
    await page.click('.lr-row[data-book="beowulf"] .lr-t', { button: "right" });
    await wait(page, 400);
    const menu = await page.evaluate(() => ({ open: !!document.querySelector(".deck-menu"), acts: [...document.querySelectorAll(".deck-menu .dm-item")].map((i) => i.dataset.act).join(","), hash: location.hash }));
    check("a right click raises the same options sheet a held banner does", menu.open && menu.acts === "fav,share" && menu.hash === "#library", JSON.stringify(menu));
    await page.keyboard.press("Escape");
    await wait(page, 400);

    /* crossing the seam */
    await page.setViewportSize({ width: 1000, height: 900 });
    await wait(page, 700);
    const narrow = await page.evaluate(() => ({ room: !!document.querySelector(".lib-room"), desk: !!document.querySelector(".lib-desk"), tiles: document.querySelectorAll(".book-tile").length }));
    check("narrowing the window past 1100px redraws the page as the shelf with the desk", !narrow.room && narrow.desk && narrow.tiles === TOTAL, JSON.stringify(narrow));
    await page.setViewportSize({ width: 1180, height: 900 });
    await wait(page, 700);
    const back = await page.evaluate(() => ({ room: !!document.querySelector(".lib-room"), rows: document.querySelectorAll(".lr-row").length, overflowX: document.documentElement.scrollWidth - innerWidth }));
    check("...and widening it brings the Reading room back, fitting at its narrowest", back.room && back.rows === TOTAL && back.overflowX <= 0, JSON.stringify(back));
    check("no script error on the way", errors.length === 0, errors.join(" | "));
    await ctx.close();
  }

  /* ================= 2. the desk ================= */
  for (const [label, vp] of [["tablet", { width: 820, height: 1100 }], ["phone", { width: 390, height: 844 }]]) {
    console.log("\n2. The desk — " + label);
    const { ctx, page, errors } = await open(browser, base, vp, { touch: true });
    const d = await page.evaluate(() => {
      const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), w: Math.round(r.width) }; };
      const figs = [...document.querySelectorAll(".ld-figs > div")];
      return {
        room: !!document.querySelector(".lib-room"), desk: !!document.querySelector(".lib-desk"),
        hero: rect(document.querySelector(".ld-hero")), also: rect(document.querySelector(".ld-also")), figsBox: rect(document.querySelector(".ld-figs")),
        tools: rect(document.querySelector(".lib-tools")), shelf: rect(document.querySelector("#bkShelf")),
        k: (document.querySelector(".ld-k") || {}).textContent || "", title: (document.querySelector(".ld-hero h2") || {}).textContent || "",
        big: (document.querySelector(".ld-big") || {}).textContent.replace(/\s+/g, " ").trim(), strip: document.querySelectorAll(".ld-strip i").length,
        filled: document.querySelectorAll(".ld-strip i.f").length, here: document.querySelectorAll(".ld-strip i.h").length,
        w: (document.querySelector(".ld-w") || {}).textContent || "", go: (document.querySelector(".ld-go") || {}).textContent.trim(),
        alsoHead: (document.querySelector(".ld-also h2") || {}).textContent || "", alsoRows: [...document.querySelectorAll(".ld-row")].map((r) => r.dataset.go).join(","),
        done: (document.querySelector(".ld-done") || {}).textContent || "",
        figs: figs.map((f) => f.querySelector("b").textContent + " " + f.querySelector("span").textContent),
        figTops: figs.map((f) => Math.round(f.getBoundingClientRect().top)), figLefts: figs.map((f) => Math.round(f.getBoundingClientRect().left)),
        tiles: document.querySelectorAll(".book-tile").length, overflowX: document.documentElement.scrollWidth - innerWidth,
      };
    });
    const total = d.tiles;
    check("[" + label + "] the page is the desk over the timeline shelf, not the Reading room", !d.room && d.desk && total === TOTAL, JSON.stringify({ room: d.room, desk: d.desk, tiles: total }));
    check("[" + label + "] ...between the search and the shelf, nothing off the side", d.tools.b <= d.hero.t && d.figsBox.b <= d.shelf.t + 1 && d.overflowX <= 0, JSON.stringify({ tools: d.tools.b, hero: d.hero.t, figs: d.figsBox.b, shelf: d.shelf.t, x: d.overflowX }));
    check("[" + label + "] On your desk: the text last read, and when", /On your desk · read today/.test(d.k) && /Iliad/.test(d.title), d.k + " / " + d.title);
    check("[" + label + "] ...how far through it, as a figure", /^\d+%\s*read so far$/i.test(d.big), d.big);
    check("[" + label + "] ...and as one segment to a chapter, eight behind and the ninth under way", d.strip === 24 && d.filled === 8 && d.here === 1, JSON.stringify({ n: d.strip, f: d.filled, h: d.here }));
    check("[" + label + "] ...the place in words, and the one button back into it", /Book 9 of 24/.test(d.w) && /^Continue reading$/.test(d.go), d.w + " / " + d.go);
    check("[" + label + "] Also on your desk: the others in progress, most recent first", d.alsoHead === "Also on your desk" && d.alsoRows === "plato-republic,herodotus-histories", d.alsoHead + ": " + d.alsoRows);
    check("[" + label + "] ...and the finished one named under them", /Finished/.test(d.done) && /Meditations/.test(d.done), d.done);
    check("[" + label + "] four figures about the shelf", d.figs.length === 4 && d.figs[0] === TOTAL + " texts on the shelf" && /with the original beside the English$/.test(d.figs[1]) && /^10 traditions$/.test(d.figs[2]) && d.figs[3] === "3 of your books in progress", JSON.stringify(d.figs));
    if (label === "phone") {
      check("[phone] ...two by two", d.figTops[0] === d.figTops[1] && d.figTops[2] === d.figTops[3] && d.figTops[2] > d.figTops[0] && d.figLefts[0] === d.figLefts[2] && d.figLefts[1] === d.figLefts[3], JSON.stringify({ t: d.figTops, l: d.figLefts }));
      check("[phone] the desk's parts stand one under another", d.also.t >= d.hero.b && d.figsBox.t >= d.also.b, JSON.stringify({ hero: d.hero, also: d.also, figs: d.figsBox }));
    } else {
      check("[tablet] ...four in a row", new Set(d.figTops).size === 1, JSON.stringify(d.figTops));
      check("[tablet] the text in hand and the others stand side by side", d.hero.r <= d.also.l && Math.abs(d.hero.t - d.also.t) < 4, JSON.stringify({ hero: d.hero, also: d.also }));
    }
    /* a search puts the desk away, in place, and gives it back */
    await page.fill("#bkFilter", "republic");
    await wait(page, 200);
    const typed = await page.evaluate(() => ({ hidden: document.querySelector(".lib-desk").hidden, shown: getComputedStyle(document.querySelector(".lib-desk")).display, tiles: document.querySelectorAll(".book-tile").length, focus: document.activeElement.id }));
    check("[" + label + "] typing a search puts the desk away, so the answer is under the box", typed.hidden && typed.shown === "none" && typed.tiles >= 1 && typed.tiles < total && typed.focus === "bkFilter", JSON.stringify(typed));
    await page.fill("#bkFilter", "");
    await wait(page, 200);
    check("[" + label + "] ...and clearing it brings the desk back", await page.evaluate(() => !document.querySelector(".lib-desk").hidden && !!document.querySelector(".ld-hero")));
    /* the star on the desk */
    const st = await page.evaluate(async () => {
      document.querySelector(".ld-hero [data-star]").click();
      await new Promise((r) => setTimeout(r, 200));
      return { favs: Object.keys(JSON.parse(localStorage.getItem("folio_v1")).bookFavs || {}).sort().join(","), pressed: document.querySelector(".ld-hero [data-star]").getAttribute("aria-pressed"),
        heads: [...document.querySelectorAll(".lib-sec-head")].map((h) => h.textContent).join("|"), hash: location.hash };
    });
    check("[" + label + "] the desk's star files the text under Favourites on the shelf below", st.favs === "homer-iliad,ramayana" && st.pressed === "true" && /^Favourites\|/.test(st.heads) && st.hash === "#library", JSON.stringify(st));
    /* into the books */
    await page.click('.ld-row[data-go="plato-republic"]');
    await wait(page, 900);
    check("[" + label + "] a row of Also on your desk opens its text", (await page.evaluate(() => location.hash)) === "#book/plato-republic", await page.evaluate(() => location.hash));
    // "last read" is a place moved to, not a page opened: read on a little before going back
    await page.waitForSelector(".bk-prose", { timeout: 20000 });
    await page.evaluate(() => window.scrollTo(0, Math.round(document.documentElement.scrollHeight * 0.5)));
    await wait(page, 1200);
    await page.evaluate(() => { location.hash = "#library"; });
    await page.waitForSelector(".ld-hero");
    await wait(page, 500);
    const hero2 = await page.evaluate(() => document.querySelector(".ld-hero").dataset.book);
    check("[" + label + "] ...and the text just read is now the one on the desk", hero2 === "plato-republic", hero2);
    await page.click(".ld-go");
    await wait(page, 900);
    check("[" + label + "] Continue reading opens it", (await page.evaluate(() => location.hash)) === "#book/plato-republic", await page.evaluate(() => location.hash));
    check("[" + label + "] no script error on the way", errors.length === 0, errors.join(" | "));
    await ctx.close();
  }

  /* ================= 3. a reader who has opened nothing ================= */
  console.log("\n3. Nothing begun yet");
  {
    const { ctx, page } = await open(browser, base, { width: 390, height: 844 }, { fresh: true, touch: true });
    const d = await page.evaluate(() => ({ hero: !!document.querySelector(".ld-hero"), also: !!document.querySelector(".ld-also"),
      figs: [...document.querySelectorAll(".ld-figs b")].map((b) => b.textContent).join(","), top: getComputedStyle(document.querySelector(".ld-top")).display }));
    check("with no text begun the desk is the four figures alone", !d.hero && !d.also && d.top === "none" && new RegExp("^" + TOTAL + ",\\d+,10,0$").test(d.figs), JSON.stringify(d));
    await ctx.close();
    const w = await open(browser, base, { width: 1440, height: 900 }, { fresh: true });
    const r = await w.page.evaluate(() => ({ go: document.querySelector(".lr-open").textContent.trim(), place: !!document.querySelector(".lr-place"), st: document.querySelector(".lr-row .lb-st").textContent }));
    check("...and the Reading room's pane offers to start the selected one", r.go === "Start reading" && !r.place && r.st === "Start reading", JSON.stringify(r));
    await w.ctx.close();
  }

  /* ================= 4. the foot of the last chapter ================= */
  console.log("\n4. Finishing a text");
  {
    const { ctx, page } = await open(browser, base, { width: 1440, height: 900 }, { fresh: true });
    await page.evaluate(() => { location.hash = "#book/magna-carta"; });
    await page.waitForSelector(".bk-prose", { timeout: 20000 });
    await wait(page, 900);
    const last = await page.evaluate(async () => {
      const tabs = [...document.querySelectorAll(".bk-tab")];
      tabs[tabs.length - 1].click();
      await new Promise((r) => setTimeout(r, 1500));
      const mid = (JSON.parse(localStorage.getItem("folio_v1")).reading || {})["magna-carta"] || {};
      window.scrollTo(0, document.documentElement.scrollHeight);
      await new Promise((r) => setTimeout(r, 1500));
      const end = (JSON.parse(localStorage.getItem("folio_v1")).reading || {})["magna-carta"] || {};
      return { mid: !!mid.fin, end: !!end.fin, ch: end.ch };
    });
    check("opening the last chapter is not finishing it", last.mid === false, JSON.stringify(last));
    check("...reaching its foot is", last.end === true, JSON.stringify(last));
    await page.evaluate(() => { location.hash = "#library"; });
    await page.waitForSelector(".lr-row");
    await wait(page, 500);
    const st = await page.evaluate(() => (document.querySelector('.lr-row[data-book="magna-carta"] .lb-st') || {}).textContent || "");
    check("...and the shelf then says Finished", /Finished/.test(st), st);
    await ctx.close();
  }

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
