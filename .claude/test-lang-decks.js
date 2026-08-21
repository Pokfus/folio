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

   THE SECTION ITSELF fails silently three times over now that a language is a COLLECTION (Aug 2026,
   on request): a banner drawn with no hue looks like a design choice rather than a missing COLL_THEME
   key, a collection that lists nothing looks like a language with no decks, and an Add that fetches
   nothing looks like a slow connection. So the browser half counts the banners against the catalogue,
   reads each one's hue, icon and studied/total bar, opens one, reads a deck row's figures back against
   the catalogue, and then really adds the smallest deck there is and checks it arrives on the page.

   IT ALSO ASSERTS WHAT A LANGUAGE BANNER MUST **NOT** HAVE: the collection-level `+`. A curated
   collection's + adds its whole subtree to the daily review, and there is no study scope for "several
   community decks" — nor should pressing one silently download 21 MB of Mandarin. A + that appeared
   here would look like a working control and would be one of those two things. */
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
      intro: (s.querySelector(".udeck-intro") || {}).textContent || "",
      colls: [...s.querySelectorAll(".lang-coll")].map((c) => {
        const row = c.querySelector(".collection-row");
        return {
          id: c.dataset.langcoll || "",
          title: (c.querySelector(".collection-title") || {}).textContent || "",
          span: (c.querySelector(".collection-span") || {}).textContent || "",
          bar: (c.querySelector(".deck-prog .xp-count") || {}).textContent || "",
          hue: row ? getComputedStyle(row).getPropertyValue("--coll-bg").trim() : "",
          deco: !!c.querySelector(".collection-deco"),
          icon: !!c.querySelector(".coll-ic svg path"),
          chev: !!c.querySelector(".collection-actions > .chev"),
          plus: !!c.querySelector(".collection-add"),
          open: c.querySelector(".node-children").classList.contains("open"),
          rows: c.querySelectorAll(".node.lang-deck").length,
        };
      }),
    };
  });
  check("the Collections page carries a Languages section", !!sec);
  const langs = [...new Set(ROWS.map((r) => r.lang))];
  if (sec) {
    check("…headed Languages", sec.label === "Languages", sec.label);
    /* COUNTING LANGUAGES, not decks. The section holds one collection per language exactly as the
       Collections group above it holds one banner per subject, and the figure beside a group head is
       how many rows are under it. */
    check("…counting the languages, one collection each", sec.count === String(langs.length),
      sec.count + " vs " + langs.length);
    check("…and drawing one collection per language", sec.colls.length === langs.length,
      sec.colls.map((c) => c.title).join(", "));
    check("…titled by the language", sec.colls.map((c) => c.title).join("|") === langs.join("|"),
      sec.colls.map((c) => c.title).join("|"));
    check("…each saying how many decks it holds", sec.colls.every((c) =>
      c.span === ROWS.filter((r) => r.lang === c.title).length + (ROWS.filter((r) => r.lang === c.title).length === 1 ? " deck" : " decks")),
      sec.colls.map((c) => c.title + ":" + c.span).join(" "));

    /* THE BANNER IS THE CURATED ONE. Each of these is a thing a history collection's banner has, and
       each is invisible when it goes: a missing hue reads as a design choice, a missing icon as a
       collection nobody drew a mark for, a missing bar as a collection with no cards. */
    check("…drawn with the curated banner's wash", sec.colls.every((c) => c.deco));
    check("…and its subject icon", sec.colls.every((c) => c.icon));
    check("…and its studied/total bar", sec.colls.every((c) => /cards$/.test(c.bar)),
      sec.colls.map((c) => c.bar).join(" | "));
    /* THE DENOMINATOR IS THE CATALOGUE'S, which is the honest figure for a deck that is not on the
       device yet: an untouched language reads 0 of 23,666 rather than 0 of 0. */
    check("…whose total is the language's own card count", sec.colls.every((c) => {
      const want = ROWS.filter((r) => r.lang === c.title).reduce((n, r) => n + r.cards, 0);
      return c.bar.split("/")[1].replace(/[^\d]/g, "") === String(want);
    }), sec.colls.map((c) => c.title + ":" + c.bar).join(" | "));

    /* EVERY BANNER CARRIES A HUE AND NO TWO SHARE ONE — the whole point of measuring them. A language
       with no COLL_THEME key renders with no wash at all, which looks deliberate. */
    check("…each with a hue of its own", sec.colls.every((c) => /^#[0-9A-Fa-f]{6}$/.test(c.hue)),
      sec.colls.map((c) => c.title + ":" + (c.hue || "—")).join(" "));
    check("…and no two the same", new Set(sec.colls.map((c) => c.hue)).size === sec.colls.length,
      sec.colls.map((c) => c.hue).join(" "));

    /* SHUT, and the rows still THERE. Flat this is 38 rows on a page whose subject is the curated
       collections; the two are asserted together because a collection that is shut and empty looks
       identical to one that is shut and full. */
    check("…all shut", sec.colls.every((c) => !c.open));
    check("…and full all the same", sec.colls.every((c) => c.rows > 0),
      sec.colls.map((c) => c.title + ":" + c.rows).join(" "));
    check("…each holding exactly its own decks", sec.colls.every((c) =>
      c.rows === ROWS.filter((r) => r.lang === c.title).length),
      sec.colls.map((c) => c.title + ":" + c.rows).join(" "));

    // the one control a curated banner has that this must not — see the header
    check("…and no collection-level + on any of them", sec.colls.every((c) => !c.plus));
    check("…while every one can be opened", sec.colls.every((c) => c.chev));

    /* The one thing a reader needs told that no curated collection has to say: the cards are not here
       yet, and pressing Add fetches them. */
    check("…and the section says a deck is downloaded on Add",
      /download/i.test(sec.intro), sec.intro.slice(0, 70));
  }

  /* THE CHEVRON REALLY OPENS IT, which the shut-and-full pair above cannot show: those rows are in the
     DOM either way, and a fold whose height never changes is a collection nobody can read. */
  const opened = await page.evaluate(() => {
    const c = document.querySelector(".lang-coll");
    const before = c.querySelector(".node-children").getBoundingClientRect().height;
    c.querySelector(".collection-actions > .chev").click();
    return { before, after: c.querySelector(".node-children").getBoundingClientRect().height };
  });
  await page.waitForTimeout(500);
  const openedNow = await page.evaluate(() =>
    document.querySelector(".lang-coll .node-children").getBoundingClientRect().height);
  check("the chevron opens a language", opened.before === 0 && openedNow > 100,
    opened.before + " → " + Math.round(openedNow));

  // a row's figures come from the catalogue rather than from anywhere else
  const first = ROWS[0];
  const row = await page.evaluate((file) => {
    const b = document.querySelector('[data-langadd="' + file + '"]');
    if (!b) return null;
    const el = b.closest(".lang-deck");
    return { title: (el.querySelector(".node-title") || {}).textContent || "",
             count: (el.querySelector(".node-count") || {}).textContent || "",
             size: (el.querySelector(".lang-size") || {}).textContent || "",
             /* THE DECK ROW IS THE CURATED TREE'S `.node` (Aug 2026, on request), so it is the same box
                as a collection's decks one section up — but it is NOT a button, since there is nothing
                to study until it has been added and a row click would mean a 21 MB download off a
                stray tap. */
             isNode: el.classList.contains("node"),
             pressable: el.getAttribute("role") === "button" || el.hasAttribute("tabindex") };
  }, first.file);
  check("a row is drawn for the first deck in the catalogue", !!row, first.file);
  if (row) {
    check("…in the curated tree's own row shape", row.isNode);
    check("…and not itself pressable", !row.pressable);
    check("…titled from the catalogue", row.title === first.title, row.title);
    check("…and stating its card count", row.count.replace(/[^\d]/g, "") === String(first.cards), row.count);
    check("…and how much it will download", /MB to download/.test(row.size), row.size);
  }

  /* ---------- 3. Add really fetches, imports and lands ---------- */
  const small = ROWS.slice().sort((a, b) => a.bytes - b.bytes)[0];
  await page.evaluate((f) => {
    const el = document.querySelector('#langDecks [data-langadd="' + f + '"]');
    if (!el) return;
    // its collection may be a different one from the one opened above, so open that too before pressing
    const coll = el.closest(".lang-coll");
    const kids = coll.querySelector(".node-children");
    if (!kids.classList.contains("open")) coll.querySelector(".collection-actions > .chev").click();
    el.click();
  }, small.file);
  await page.waitForTimeout(6000);
  /* Read off the PAGE and not out of the store, deliberately: the store is IndexedDB behind a
     localStorage fallback, and reaching into it would mean a debug surface on `window` that every
     reader then downloads. What the reader is promised is a row in Your decks, so that is what is
     asserted. */
  const after = await page.evaluate((id) => ({
    yours: !!document.querySelector('[data-udeck="' + id + '"]'),
    pill: [...document.querySelectorAll("#langDecks .node.lang-deck")].some((e) =>
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
