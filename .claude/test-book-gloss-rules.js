// What a Library book links to the glossary, and what it must not (Nov 2026, the Library audit).
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-book-gloss-rules.js
//
// Guards the three things added to the reader's linking after the sweep of all 101 books
// (.claude/book-gloss-sweep.js):
//   · a book never links a glossary term dated after it (`unlinkLaterTerms`, the <gloss-date-rule> parsers);
//   · a book written before 1500 never links a modern nation-state entry (GLOSS_MODERN_STATES);
//   · a book's own file carries the keys the reviewed sweep switched off (`glossOff` / `glossOffIn`,
//     written by .claude/book-emend.js from .claude/book-gloss-off.json) and the reader obeys them;
// and two neighbours: the licence boxes of the About page are not glossed, and a painted chapter has
// no straight quotation mark (`bookQuoteTree`).
//
// The chapters it opens are FOUND in the shipped text, not hard-coded, so a re-import that moves a
// passage moves the test with it. Uses playwright. Re-run after touching bookGlossOff,
// unlinkLaterTerms, linkProperNounsOnly, bookQuotes or PAGES.book's paint.
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end(""); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("ok    " + name); } else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); } };

/* ---- the two parsers, sliced out of app.js exactly as the sweep slices them ---- */
const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const g0 = app.indexOf("/* <gloss-date-rule> */"), g1 = app.indexOf("/* </gloss-date-rule> */");
check("the <gloss-date-rule> block is in app.js", g0 > 0 && g1 > g0);
const { glossTermStart, bookLastYear } = (0, eval)("(function(){" + app.slice(g0, g1) + "; return { glossTermStart, bookLastYear }; })()");
const T = [["c. 145 – 86 BCE", -145], ["1881–1936", 1881], ["7 December 1941", 1941], ["Founded 1636", 1636], ["16 July 1945", 1945], ["5th – 3rd century BCE", -500],
  ["9th century CE", 801], ["c. 3,100 – 30 BCE", -3100], ["29 BCE – 9 CE", -29], ["c. 2.6 Mya – 11,500 BP", -1000000], ["Iron Age – Roman period", null], ["from 1940", 1940]];
const badT = T.filter(([d, y]) => glossTermStart(d) !== y);
check("a glossary date's first year is read in every form the glossary writes", !badT.length, JSON.stringify(badT.map(([d]) => [d, glossTermStart(d)])));
const B = [["c. 58–50 BCE", -58, -50], ["c. 500 BCE – 200 CE", -500, 200], ["c. 1469–70, printed 1485", 1469, 1470], ["c. 1550–50 BCE", -1550, -50], ["5th–3rd century BCE", -500, -201],
  ["1265–1274, unfinished", 1265, 1274], ["c. 1000 BCE – c. 300 CE", -1000, 300], ["early 2nd century CE", 115, 200], ["1605 & 1615", 1605, 1615], ["14th century, first printed 1522", 1301, 1400]];
const badB = B.filter(([w, y, e]) => bookLastYear({ written: w, year: y }) !== e);
check("a book's last year is the far end of what `written` states", !badB.length, JSON.stringify(badB.map(([w, y]) => [w, bookLastYear({ written: w, year: y })])));
check("…and `glossUntil` on a row overrides it", bookLastYear({ written: "c. 2600–525 BCE; translated 1906", year: -2600, glossUntil: 1906 }) === 1906);

/* ---- where to look, from the shipped files ---- */
const load = (id) => { const w = { FOLIO_BOOKS_IN: [] }; new Function("window", fs.readFileSync(path.join(ROOT, "books", id + ".js"), "utf8"))(w); return w.FOLIO_BOOKS_IN[0]; };
const plain = (h) => h.replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/g, "").replace(/<[^>]+>/g, " ");
const firstCh = (b, re) => { const c = b.chapters.find((c) => re.test(plain(c.html))); return c ? c.n : null; };
const summa = load("summa-theologica"), hdt = load("herodotus-histories"), caesar = load("caesar-gallic-war"), candide = load("voltaire-candide");
const table = JSON.parse(fs.readFileSync(path.join(__dirname, "book-gloss-off.json"), "utf8"));
const caesarOff = ((table.books["caesar-gallic-war"] || {}).off || []).map((r) => r[0]);
check("the sweep's table switches a key off for the Gallic War, and the book's own file carries it",
  caesarOff.length > 0 && Array.isArray(caesar.glossOff) && caesarOff.every((k) => caesar.glossOff.includes(k)), JSON.stringify({ table: caesarOff.length, file: (caesar.glossOff || []).length }));

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch(process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const open = async (id, ch) => {
    const page = await ctx.newPage();
    await page.addInitScript(() => { try { localStorage.setItem("folio_library_tour_v1", "1"); localStorage.setItem("folio_book_tour_v1", "1"); localStorage.setItem("folio_book_orig_v1", "0"); } catch (e) {} });
    await page.goto(base + "#book/" + id, { waitUntil: "load" });
    await page.waitForSelector(".bk-toc-item", { state: "attached", timeout: 120000 });
    await page.waitForTimeout(300);
    const intro = await page.evaluate(() => ({ rights: document.querySelectorAll(".bk-rights .ttip[data-k]").length, essay: document.querySelectorAll(".bk-intro-essay .ttip[data-k]").length, hasRights: !!document.querySelector(".bk-rights") }));
    await page.evaluate((n) => { const old = document.querySelector(".bk-prose"); if (old) old.setAttribute("data-old", "1"); [...document.querySelectorAll(".bk-toc-item")].find((x) => x.dataset.ch === String(n)).click(); }, ch);
    await page.waitForFunction(() => { const p = document.querySelector(".bk-prose"); return p && !p.hasAttribute("data-old"); }, null, { timeout: 30000 });
    const r = await page.evaluate(() => {
      const pr = document.querySelector(".bk-prose"), t = [...document.querySelectorAll(".bk-prose p, .bk-notes .src-text")].map((e) => { const c = e.cloneNode(true); c.querySelectorAll("sup, .bk-n").forEach((x) => x.remove()); return c.textContent; }).join("\n");
      return { keys: [...pr.querySelectorAll(".ttip[data-k]")].map((e) => e.dataset.k), straight: (t.match(/["']/g) || []).length, curled: (t.match(/[“”‘’]/g) || []).length };
    });
    await page.close();
    return { intro, keys: r.keys, straight: r.straight, curled: r.curled };
  };

  const sCh = firstCh(summa, /[a-z,] the (?:Blessed |Holy )?Trinity\b/);
  check("the Summa names the Trinity mid-sentence somewhere (the test has a chapter to open)", sCh != null);
  let r = await open("summa-theologica", sCh);
  check("the Summa's Trinity is not linked to the nuclear test of 1945", !r.keys.includes("Trinity_(nuclear_test)"), "ch " + sCh);
  check("…nor divine Providence to the capital of Rhode Island", !r.keys.includes("Providence"));
  check("…while the chapter still links what it does mean", r.keys.length >= 1, String(r.keys.length));
  check("the About page's licence boxes carry no glossary link, and its essay does", r.intro.hasRights && r.intro.rights === 0 && r.intro.essay > 0, JSON.stringify(r.intro));

  const hCh = firstCh(hdt, /[a-z,] Egypt\b/);
  r = await open("herodotus-histories", hCh);
  check("Herodotus's Egypt is not today's country", !r.keys.includes("Egypt") && !r.keys.includes("Greece"), "ch " + hCh);
  check("…but the Egyptians are still Ancient Egypt", r.keys.includes("Ancient_Egypt"), r.keys.slice(0, 12).join(","));
  check("a painted chapter has no straight quotation mark, and has curled ones", r.straight === 0 && r.curled > 0, JSON.stringify({ straight: r.straight, curled: r.curled }));

  const cCh = firstCh(caesar, /[a-z,] Titus [A-Z]/);
  r = await open("caesar-gallic-war", cCh);
  check("Caesar's legate Titus is not the emperor: the key the file switches off is not linked", caesarOff.includes("Titus") ? !r.keys.includes("Titus") : true, "ch " + cCh + " " + r.keys.filter((k) => caesarOff.includes(k)).join(","));
  check("…and none of the book's switched-off keys is", !r.keys.some((k) => caesarOff.includes(k)));
  check("…while Gaul and the Rhine still link", r.keys.includes("Gaul") || r.keys.includes("Rhine"), r.keys.slice(0, 10).join(","));

  const vCh = firstCh(candide, /[a-z,] (?:Portugal|Holland|France|England|Turkey)\b/);
  r = await open("voltaire-candide", vCh);
  const MODERN = ["Portugal", "Netherlands", "France", "England", "Turkey", "Spain", "Italy", "Germany"];
  check("a book of 1759 still links the states it names", r.keys.some((k) => MODERN.includes(k)), "ch " + vCh + " " + r.keys.slice(0, 12).join(","));

  await browser.close(); server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
