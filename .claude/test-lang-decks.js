/* test-lang-decks.js — the Collections page's LANGUAGES section (Aug 2026, on request).

     NODE_PATH=<scratch>/node_modules node .claude/test-lang-decks.js
     FOLIO_CHROMIUM=<path to chrome>   if Chromium lives outside the playwright package

   Every failure this guards is SILENT, which is why it is a file rather than a few lines appended
   elsewhere.

   THE CATALOGUE GOING STALE IS THE WORST OF THEM and no browser can see it: `lang-decks.js` is
   metadata read off the deck files, so a deck rebuilt without regenerating it leaves a row claiming
   500 words over a deck that now holds 700 — which looks exactly like a row. The check is the deck
   generators' own discipline: re-running the build must reproduce the shipped file BYTE FOR BYTE.
   It costs about a second, because the build reads 119 MB and writes 9 KB.

   THE SECTION ITSELF fails silently twice over: a fold that lists nothing looks like a language with
   no decks, and an Add that fetches nothing looks like a slow connection. So the browser half counts
   the folds against the catalogue, reads a row's figures back against it, and then really adds the
   smallest deck there is and checks it arrives in the store AND on the page. */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

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
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
}

/* ---------- 1. the catalogue, with no browser at all ---------- */
const CAT = path.join(ROOT, "lang-decks.js");
const shipped = fs.readFileSync(CAT, "utf8");
{
  /* Re-running the build must reproduce the shipped file exactly. It writes in place, so the shipped
     bytes are held here and put back whatever the outcome — a check must not leave the repo changed. */
  let rebuilt = "";
  try {
    execFileSync(process.execPath, [path.join(ROOT, ".claude", "build-lang-decks.js")], { cwd: ROOT, stdio: "pipe" });
    rebuilt = fs.readFileSync(CAT, "utf8");
  } finally { fs.writeFileSync(CAT, shipped); }
  check("the catalogue reproduces byte for byte from decks/", rebuilt === shipped,
    rebuilt === shipped ? "" : "rebuild differs — run `node .claude/build-lang-decks.js`");
}

global.window = {};
require(CAT);
const ROWS = window.LANG_DECKS || [];
check("it holds rows", ROWS.length > 0, String(ROWS.length) + " decks");

{
  const bad = ROWS.filter((r) => !r.lang || !r.file || !r.id || !r.title || !(r.cards > 0) || !(r.bytes > 0));
  check("every row names a language, a file, a deck id, a title, a card count and a size", !bad.length,
    bad.map((r) => r.file).join(", "));
  const ids = new Set(ROWS.map((r) => r.id));
  check("no two rows claim the same deck id", ids.size === ROWS.length, ROWS.length + " rows, " + ids.size + " ids");
  const missing = ROWS.filter((r) => !fs.existsSync(path.join(ROOT, "decks", r.file)));
  check("every row's file is on disk", !missing.length, missing.map((r) => r.file).join(", "));
  /* CARDS AND NOT NOTES. A deck may ask a word both ways from ONE note by giving its type two
     templates, so a count of rows is half the pile a reader studies — and the figure on the row is
     the one they will meet. Checked on a deck whose type is known to carry two. */
  const two = ROWS.filter((r) => r.cards === r.notes * 2);
  check("some decks count two cards per note (the both-directions shape)", two.length > 0, two.length + " of " + ROWS.length);
}

/* ---------- 2. the section on the page ---------- */
(async () => {
  await new Promise((r) => server.listen(5661, r));
  const base = "http://localhost:5661/";
  const browser = await chromium.launch(LAUNCH);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  ctx.on("weberror", (e) => errs.push(String(e.error())));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errs.push(String(e)));

  await page.goto(base + "#decks", { waitUntil: "load" });
  await page.waitForTimeout(1200);

  const sec = await page.evaluate(() => {
    const s = document.querySelector("#langDecks");
    if (!s) return null;
    return {
      label: (s.querySelector(".group-label") || {}).textContent || "",
      count: (s.querySelector(".group-count") || {}).textContent || "",
      folds: [...s.querySelectorAll(".lang-fold")].map((f) => ({
        lang: (f.querySelector(".group-label") || {}).textContent || "",
        n: (f.querySelector(".group-count") || {}).textContent || "",
        open: f.hasAttribute("open"),
        rows: f.querySelectorAll(".lang-deck").length,
      })),
      caveat: (s.querySelector(".udeck-intro") || {}).textContent || "",
    };
  });
  check("the Collections page carries a Languages section", !!sec);
  if (sec) {
    check("…headed Languages", sec.label === "Languages", sec.label);
    check("…counting every deck in the catalogue", sec.count === String(ROWS.length), sec.count + " vs " + ROWS.length);
    const langs = [...new Set(ROWS.map((r) => r.lang))];
    check("…with one fold per language", sec.folds.length === langs.length,
      sec.folds.map((f) => f.lang).join(", "));
    check("…each naming its own deck count", sec.folds.every((f) =>
      f.n === String(ROWS.filter((r) => r.lang === f.lang).length)),
      sec.folds.map((f) => f.lang + ":" + f.n).join(" "));
    /* SHUT, and the rows still THERE. Flat this is 38 rows on a page whose subject is the curated
       collections; the two are asserted together because a fold that is shut and empty looks
       identical to one that is shut and full. */
    check("…all shut", sec.folds.every((f) => !f.open));
    check("…and full all the same", sec.folds.every((f) => f.rows > 0),
      sec.folds.map((f) => f.lang + ":" + f.rows).join(" "));
    /* It must say what these decks are NOT. They are Folio's own builds off an exam board's word
       list and they are not written to the card rules the collections above are — the same
       distinction "Shared decks" states one section down, and the reason it is stated in the UI
       rather than in a policy page. */
    check("…and says outright that they are not written to the collections' rules",
      /not written to the rules/i.test(sec.caveat), sec.caveat.slice(0, 60));
  }

  // a row's figures come from the catalogue rather than from anywhere else
  const first = ROWS[0];
  const row = await page.evaluate((file) => {
    const b = document.querySelector('[data-langadd="' + file + '"]');
    if (!b) return null;
    const el = b.closest(".lang-deck");
    return { title: (el.querySelector(".collection-title") || {}).textContent || "",
             count: (el.querySelector(".collection-count") || {}).textContent || "",
             size: (el.querySelector(".lang-size") || {}).textContent || "" };
  }, first.file);
  check("a row is drawn for the first deck in the catalogue", !!row, first.file);
  if (row) {
    check("…titled from the catalogue", row.title === first.title, row.title);
    check("…and stating its card count", row.count.replace(/[^\d]/g, "") === String(first.cards), row.count);
    check("…and how much it will download", /MB to download/.test(row.size), row.size);
  }

  /* ---------- 3. Add really fetches, imports and lands ---------- */
  const small = ROWS.slice().sort((a, b) => a.bytes - b.bytes)[0];
  await page.evaluate((f) => {
    const el = document.querySelector('.lang-fold [data-langadd="' + f + '"]');
    if (el) { el.closest("details").setAttribute("open", ""); el.click(); }
  }, small.file);
  await page.waitForTimeout(6000);
  /* Read off the PAGE and not out of the store, deliberately: the store is IndexedDB behind a
     localStorage fallback, and reaching into it would mean a debug surface on `window` that every
     reader then downloads. What the reader is promised is a row in Your decks, so that is what is
     asserted. */
  const after = await page.evaluate((id) => ({
    yours: !!document.querySelector('[data-udeck="' + id + '"]'),
    pill: [...document.querySelectorAll("#langDecks .lang-deck")].some((e) =>
      /added/.test(e.textContent) && e.textContent.indexOf("Your decks") >= 0),
  }), small.id);
  const gone = await page.evaluate((f) => !document.querySelector('#langDecks [data-langadd="' + f + '"]'), small.file);
  check("adding a deck puts it in Your decks", after.yours, small.title);
  check("…and the Languages row says so", after.pill, after.pill ? "" : "no 'added' row");
  /* …and stops offering Add. A second press would import the same file again, and `uDeckImportText`
     mints a fresh id when the deck's own is taken — so it would succeed, leaving the reader two
     copies of one deck with two separate schedules and nothing to say which is which. */
  check("…and no longer offers Add for it", gone, small.file);

  check("no uncaught page errors", errs.length === 0, errs.join(" | "));

  console.log("");
  console.log(pass + " passed, " + fail + " failed");
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
