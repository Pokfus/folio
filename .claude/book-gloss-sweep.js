#!/usr/bin/env node
/* .claude/book-gloss-sweep.js — EVERY GLOSSARY LINK A BOOK'S PAGES ACTUALLY DRAW (Nov 2026, the Library audit).

     NODE_PATH=<scratch>/node_modules node .claude/book-gloss-sweep.js <bookId> [<bookId> …]
     NODE_PATH=<scratch>/node_modules node .claude/book-gloss-sweep.js --all [--workers=4]
     … --json=<file>     write every link's key, count, surfaces, chapters and three contexts
     … --check           exit 1 if a book draws a link the rules below call WRONG (the gate fetch-book runs)

   A book is linked to the glossary when its chapter is painted (`autoLinkGlossary` then
   `linkProperNounsOnly`, less the row's `glossOff` / `glossOffIn`), so what a reader is offered can
   only be read off the RENDERED page. Thirty-six rows say they were "swept against the rendered
   page (every `.ttip`)" and each sweep was a script written for the occasion; this is that script,
   kept. It opens the reader in headless Chromium, turns to every chapter (front matter included),
   and records each `.ttip[data-k]` inside the English prose with the words round it.

   WHAT IT CAN DECIDE BY ITSELF, and prints under WRONG:
     · AN ANACHRONISM — the term's own date (`GLOSSARY_DATES`) begins after the last year the
       book's `written` states. Kublai Khan's dynasty in the Mozi; a city founded in 1636 in Kant's
       "Providence" is NOT one (1781 is later), which is why the rest is a list to be read.
     · A PERSON, A BATTLE, A TREATY OR A WAR dated after the book, by the same test.
   WHAT IT ONLY LISTS, under READ: every other key, most-linked first, with its surfaces and
   contexts. A key is right or wrong by the sentence; the row's `glossOff` (book-wide) and
   `glossOffIn` (per chapter) are where a wrong one goes.

   Front matter (chapter 0, Folio's own essay) is swept too but never fails the check: it is modern
   prose about the book and may name anything.

   Not part of the site. Needs Playwright on NODE_PATH; without it, says so and exits 0. */

const fs = require("fs"), path = require("path"), http = require("http");
const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
const ALL = args.includes("--all"), CHECK = args.includes("--check");
const JSON_OUT = (args.find((a) => a.startsWith("--json=")) || "").slice(7);
const WORKERS = +((args.find((a) => a.startsWith("--workers=")) || "--workers=4").slice(10));
const IDS = args.filter((a) => !a.startsWith("--"));
if (!ALL && !IDS.length) { console.log("usage: node .claude/book-gloss-sweep.js <bookId>… | --all  [--json=file] [--check] [--workers=N]"); process.exit(0); }
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { console.log("book-gloss-sweep: Playwright is not on NODE_PATH. Skipped."); process.exit(0); }

/* the catalogue and the glossary's dates, read in Node */
const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const a0 = app.indexOf("\n  const BOOKS = ["), a1 = app.indexOf("\n  ];", a0);
const BOOKS = (0, eval)(app.slice(app.indexOf("[", a0), a1 + 4));
const W = {}; new Function("window", fs.readFileSync(path.join(ROOT, "glossary.js"), "utf8"))(W);
const DATES = W.GLOSSARY_DATES || {}, TAGS = W.GLOSSARY_TAGS || {};
/* THE TWO PARSERS ARE THE READER'S OWN, sliced out of app.js between its marker lines: a check that
   judged a link by a different rule from the page's would pass books the page gets wrong. */
const g0 = app.indexOf("/* <gloss-date-rule> */"), g1 = app.indexOf("/* </gloss-date-rule> */");
if (g0 < 0 || g1 < 0) { console.log("book-gloss-sweep: the <gloss-date-rule> block is gone from app.js — the sweep cannot judge a link."); process.exit(1); }
const { glossTermStart: termStart, bookLastYear: bookEnd } = (0, eval)("(function(){" + app.slice(g0, g1) + "; return { glossTermStart, bookLastYear }; })()");

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end(""); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" }); res.end(data);
  });
});

async function sweepBook(ctx, base, b) {
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.setItem("folio_library_tour_v1", "1"); localStorage.setItem("folio_book_orig_v1", "0"); localStorage.setItem("folio_book_tour_v1", "1"); } catch (e) {} });
  await page.goto(base + "#book/" + b.id, { waitUntil: "load" });
  await page.waitForSelector(".bk-toc-item", { timeout: 120000, state: "attached" });
  const out = await page.evaluate(async () => {
    const res = {};
    const items = [...document.querySelectorAll(".bk-toc-item")];
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const it of items) {
      const ch = it.dataset.ch;
      /* The turn is animated (`slideChapter`) and the page is repainted at the end of it, so the old
         prose is marked and the loop waits for prose that is not. The first tab is the one already
         open, which `go` ignores — nothing repaints, and after a short wait the page is read as it is. */
      const old = document.querySelector(".bk-prose"); if (old) old.setAttribute("data-swept", "1");
      it.click();
      const open0 = !Object.keys(res.__seen || {}).length;
      for (let w = 0; w < (open0 ? 12 : 400); w++) { const now = document.querySelector(".bk-prose"); if (now && !now.hasAttribute("data-swept")) break; await sleep(10); }
      (res.__seen = res.__seen || {})[ch] = (document.querySelector(".bk-ch-t") || {}).textContent || "";
      const head = document.querySelector(".bk-ch-n"), prose = document.querySelectorAll(".bk-prose .ttip[data-k], .bk-col-en .ttip[data-k]");
      prose.forEach((el) => {
        const k = el.dataset.k, r = res[k] || (res[k] = { n: 0, surf: {}, ch: {}, ctx: [] });
        r.n++; const s = el.textContent; r.surf[s] = (r.surf[s] || 0) + 1; r.ch[ch] = (r.ch[ch] || 0) + 1;
        if (r.ctx.length < 3 && (r.ctx.length === 0 || !r.ctx.some((c) => c.ch === ch))) {
          const blk = el.closest("p, blockquote, li, td, div") || el.parentNode, t = blk.textContent, at = t.indexOf(s);
          r.ctx.push({ ch, t: t.slice(Math.max(0, at - 90), at + s.length + 90).replace(/\s+/g, " ") });
        }
      });
    }
    const seen = res.__seen; delete res.__seen;
    return { chapters: items.length, res, turned: new Set(Object.values(seen)).size };
  });
  await page.close();
  return out;
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const launch = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
  const browser = await chromium.launch(launch);
  const todo = (ALL ? BOOKS : IDS.map((id) => BOOKS.find((b) => b.id === id)).filter(Boolean)).slice();
  if (!todo.length) { console.log("no such book"); process.exit(1); }
  const results = {}; let wrongTotal = 0;
  const work = async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    for (;;) {
      const b = todo.shift(); if (!b) break;
      try { results[b.id] = await sweepBook(ctx, base, b); }
      catch (e) { results[b.id] = { error: String(e.message || e).split("\n")[0] }; }
      if (ALL) process.stderr.write("  swept " + b.id + (results[b.id].error ? "  ERROR " + results[b.id].error : "  " + Object.keys(results[b.id].res).length + " keys") + "\n");
    }
    await ctx.close();
  };
  await Promise.all(Array.from({ length: Math.min(WORKERS, todo.length) }, work));
  await browser.close(); server.close();

  /* A KEY SWITCHED OFF IN THREE OTHER BOOKS IS PROBABLY WRONG IN THIS ONE TOO — the reviewed table
     (.claude/book-gloss-off.json) is the shelf's memory of which keys catch namesakes and capitalised
     common words ("Elder" → Starets, Pallas → Claudius's freedman, a town → the battle fought there). */
  let offElsewhere = {};
  try { const tb = JSON.parse(fs.readFileSync(path.join(__dirname, "book-gloss-off.json"), "utf8")).books || {}; for (const id of Object.keys(tb)) for (const r of tb[id].off || []) (offElsewhere[r[0]] = offElsewhere[r[0]] || new Set()).add(id); } catch (e) {}
  const report = {};
  for (const b of BOOKS) {
    const r = results[b.id]; if (!r) continue;
    if (r.error) { console.log("== " + b.id + "  COULD NOT BE SWEPT: " + r.error); report[b.id] = { error: r.error }; if (CHECK) wrongTotal++; continue; }
    /* a sweep that did not turn the pages reads one chapter many times and reports it as the book */
    if (r.chapters > 3 && r.turned < r.chapters * 0.5) { console.log("== " + b.id + "  THE PAGES DID NOT TURN (" + r.turned + " distinct chapter heads over " + r.chapters + " tabs) — the sweep is blind"); report[b.id] = { error: "pages did not turn" }; wrongTotal++; continue; }
    const end = bookEnd(b), rows = [];
    for (const k of Object.keys(r.res)) {
      const x = r.res[k], inText = Object.keys(x.ch).filter((c) => c !== "0").reduce((a, c) => a + x.ch[c], 0);
      const start = k in DATES ? termStart(DATES[k]) : null;
      const anach = inText > 0 && start != null && start > end + 25;
      rows.push({ k, n: x.n, inText, date: DATES[k] || "", tags: TAGS[k] || [], surf: x.surf, ch: Object.keys(x.ch).length, ctx: x.ctx, wrong: anach ? "dated " + DATES[k] + ", after the book (" + b.written + ")" : "" });
    }
    rows.sort((p, q) => (q.wrong ? 1 : 0) - (p.wrong ? 1 : 0) || q.n - p.n);
    report[b.id] = { chapters: r.chapters, end, links: rows.reduce((a, x) => a + x.n, 0), rows };
    const wrong = rows.filter((x) => x.wrong); wrongTotal += wrong.length;
    if (JSON_OUT && ALL) continue;
    console.log("== " + b.id + " — " + rows.length + " key(s), " + report[b.id].links + " link(s) over " + r.chapters + " chapter tab(s); written " + b.written);
    if (wrong.length) { console.log("  WRONG — the term is later than the book:"); wrong.forEach((x) => console.log("    " + x.k.padEnd(34) + "×" + x.inText + "  " + x.wrong + "\n       …" + (x.ctx.find((c) => c.ch !== "0") || x.ctx[0]).t + "…")); }
    const likely = rows.filter((x) => !x.wrong && x.inText > 0 && offElsewhere[x.k] && [...offElsewhere[x.k]].filter((o) => o !== b.id).length >= 3);
    if (likely.length) { console.log("  LIKELY WRONG — switched off in three or more other books:"); likely.forEach((x) => console.log("    " + x.k.padEnd(34) + "×" + String(x.inText).padEnd(5) + " [" + Object.keys(x.surf).slice(0, 4).join(" | ") + "]  off in " + [...offElsewhere[x.k]].filter((o) => o !== b.id).length + " books\n       …" + (x.ctx.find((c) => c.ch !== "0") || x.ctx[0]).t + "…")); }
    if (!CHECK) { console.log("  READ — every other key, most linked first:"); rows.filter((x) => !x.wrong).forEach((x) => console.log("    " + x.k.padEnd(34) + "×" + String(x.n).padEnd(5) + " [" + Object.keys(x.surf).slice(0, 4).join(" | ") + "]  " + (x.date ? "(" + x.date + ") " : "") + "ch " + x.ctx.map((c) => c.ch).join(",") + "\n       …" + x.ctx[0].t + "…")); }
  }
  if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(report));
  console.log("\n" + Object.keys(report).length + " book(s) swept; " + wrongTotal + " link(s) the date test calls wrong." + (JSON_OUT ? " Wrote " + JSON_OUT + "." : ""));
  process.exit(CHECK && wrongTotal ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
