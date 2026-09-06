/* test-deck-update.js — UPDATING A LANGUAGE DECK THIS DEVICE ALREADY HOLDS (Sep 2026).

     NODE_PATH=<scratch>/node_modules node .claude/test-deck-update.js
     FOLIO_CHROMIUM=<path to chrome>   if Chromium lives outside the playwright package

   WHAT THIS GUARDS, AND WHY IT IS A FILE OF ITS OWN. The bug it was written for is the quietest kind
   there is: a reader reported that 蛋糕 gave the pinyin "dàng āo" WEEKS after that card was repaired,
   because a downloaded deck was never re-fetched and nothing compared the copy on the device against
   the shipped one. Nothing threw, nothing looked wrong, and the card the reader was shown was simply
   an old one. Every part of the fix fails the same way:
   · A row that never offers Update looks exactly like a deck that is up to date.
   · An Update that fetches and merges nothing looks exactly like one that had nothing to merge.
   · An Update that merged by RE-IMPORTING would mint a fresh deck id and orphan the reader's whole
     schedule — and the deck would look perfect, being a correct copy of the shipped file.
   So the test corrupts a card on the device the way a stale download is corrupt, and asserts the
   repair arrives AND the schedule survives it. That is the reported fault, reproduced and closed.

   THE CORRUPTION IS DONE IN IndexedDB AND THE PAGE RELOADED, rather than by reaching into the running
   app: app.js is one IIFE and puts 14 things on `window`, so the deck store is not reachable from
   here — and driving the real store is the more honest test anyway, since that is where a stale deck
   actually lives. */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
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
const check = (name, ok, extra) => {
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
};

/* The catalogue is read from the FILE rather than from the page, so the expectations below are the
   shipped figures. A `rev` missing from every row would make every assertion here vacuously pass, so
   its presence is asserted first and separately. */
const catSrc = fs.readFileSync(path.join(ROOT, "lang-decks.js"), "utf8");
const ROWS = (() => { const w = {}; new Function("window", catSrc)(w); return w.LANG_DECKS || []; })();

(async () => {
  const port = 8137 + Math.floor(Math.random() * 400);
  await new Promise((r) => server.listen(port, r));
  const base = "http://127.0.0.1:" + port + "/";
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));

  console.log("\n1) the catalogue carries a content revision\n");
  check("every catalogue row has a rev",
    ROWS.length > 0 && ROWS.every((r) => /^[0-9a-f]{12}$/.test(r.rev || "")), ROWS.length + " rows");
  /* IT IS A CONTENT HASH AND NOT THE FILE'S BYTES — see build-lang-decks.js. Two decks with different
     content must differ; the same deck built twice must not, which is what the generator's own
     byte-for-byte rebuild in test-lang-decks.js already holds. */
  check("…and no two decks share one", new Set(ROWS.map((r) => r.rev)).size === ROWS.length);

  /* THE SMALLEST MANDARIN DECK, deliberately, and not the smallest deck on the shelf. The fault this
     file exists for was reported on a Mandarin card, and the field it corrupts below (`Pinyin`) is a
     field of the Mandarin card type — the smallest deck overall is Indonesian, whose notes have no
     such field, so the corruption silently wrote nothing and every assertion after it read `undefined`
     while the code under test was perfectly correct. */
  const small = ROWS.filter((r) => r.lang === "Mandarin Chinese").sort((a, b) => a.bytes - b.bytes)[0];
  check("there is a Mandarin deck to test against", !!small, small && small.id);
  if (!small) { console.log("\n" + pass + " passed, " + (fail + 1) + " failed"); await browser.close(); server.close(); process.exit(1); }
  console.log("\n2) downloading records the revision it was built from   [" + small.id + "]\n");

  await page.goto(base + "#decks", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const entry = small.flat && small.tree && small.tree.length
    ? "u:" + small.id + "/" + encodeURIComponent(small.tree[0].n) : "u:" + small.id;
  await page.evaluate((e) => {
    const el = document.querySelector('#langDecks .node-add[data-id="' + e + '"]');
    if (!el) return;
    const coll = el.closest(".lang-coll"), kids = coll.querySelector(".node-children");
    if (!kids.classList.contains("open")) coll.querySelector(".collection-actions > .chev").click();
    el.click();
  }, entry);
  await page.waitForTimeout(1200);
  await page.goto(base + "#home", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { const b = document.querySelector("[data-langdl]"); if (b) b.click(); });
  await page.waitForTimeout(9000);

  // the stored deck record, straight out of IndexedDB — this is what a later boot will mount
  const readDeck = (id) => page.evaluate((deckId) => new Promise((res) => {
    const q = indexedDB.open("folio-community");
    q.onsuccess = () => {
      const db = q.result;
      const g = db.transaction("decks").objectStore("decks").get(deckId);
      g.onsuccess = () => {
        const r = g.result; db.close();
        res(r ? { langRev: r.langRev, notes: (r.index || []).length } : null);
      };
      g.onerror = () => { db.close(); res(null); };
    };
    q.onerror = () => res(null);
  }), id);

  const rec = await readDeck(small.id);
  check("the deck landed", !!rec && rec.notes > 0, JSON.stringify(rec));
  check("…and stored the catalogue revision it was built from", !!rec && rec.langRev === small.rev,
    (rec && rec.langRev) + " vs " + small.rev);
  const upNow = await page.evaluate(() => document.querySelectorAll("[data-langup]").length);
  check("…so no Update is offered on a deck that is current", upNow === 0, String(upNow));

  /* ---------- 3. a stale copy, which is what the reported reader had ---------- */
  console.log("\n3) a deck whose stored copy is behind the shipped one\n");
  const CORRUPT = "WRONG PINYIN";
  const target = await page.evaluate((args) => new Promise((res) => {
    const deckId = args[0], bad = args[1];
    const q = indexedDB.open("folio-community");
    q.onsuccess = () => {
      const db = q.result;
      const tx = db.transaction(["decks", "notes"], "readwrite");
      const ds = tx.objectStore("decks"), ns = tx.objectStore("notes");
      let out = null;
      const g = ds.get(deckId);
      g.onsuccess = () => {
        const r = g.result;
        /* Two things are done to it, and they are the two halves of a stale copy: the REVISION is set
           to one the catalogue does not carry (a deck downloaded before this feature carries none at
           all, which counts as stale for the same reason), and one card's content is made wrong the
           way the reported card was wrong.
           IT IS AT THE RECORD'S TOP LEVEL, NOT IN `meta`, and that is not incidental: a deck FILE must
           never be able to claim a revision, so app.js reads it only from its own store — writing it
           into meta here corrupts nothing and the test then passes on the unfixed code. */
        r.langRev = "0000deadbeef";
        ds.put(r);
        const first = (r.index || [])[0];
        const ng = ns.get(deckId + "/" + first.id);
        ng.onsuccess = () => {
          const note = ng.result;
          if (!note || !note.c || !note.c.fields) return;
          out = { id: first.id, was: note.c.fields.Pinyin };
          note.c.fields.Pinyin = bad;
          note.c.pinyin = bad;
          ns.put(note);
        };
      };
      tx.oncomplete = () => { db.close(); res(out); };
    };
    q.onerror = () => res(null);
  }), [small.id, CORRUPT]);
  check("a card on the device was made stale", !!target && !!target.was && target.was !== CORRUPT,
    target ? target.id + " was " + JSON.stringify(target.was) : "—");

  /* THE READER'S SCHEDULE, written before the update so it can be read back after it. This is the
     assertion the whole merge design exists for: S.cards is keyed by CARD id, and a merge that
     re-imported the deck would give every card a new id and lose all of it, while producing a deck
     that looks perfectly correct. */
  await page.evaluate((cardId) => {
    const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    s.cards = s.cards || {};
    s.cards[cardId] = { due: 9999999999999, ivl: 42, ease: 2.5, status: "review", reps: 7, first: "2026-01-01" };
    localStorage.setItem("folio_v1", JSON.stringify(s));
  }, target.id);

  /* A RELOAD, NOT A GOTO. `page.goto` to a URL differing only in the #fragment is a SAME-DOCUMENT
     navigation: the app keeps running and its deck store survives, so the corrupted record is never
     read back and every assertion below passes on the value the download left in memory. This suite
     read `d37db8b51350` out of a store holding `0000deadbeef` for exactly that reason. */
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(3000);
  const offer = await page.evaluate(() => {
    const b = document.querySelector("[data-langup]");
    return b ? {
      deck: b.dataset.langup, text: b.textContent.trim(),
      rows: document.querySelectorAll("[data-langup]").length,
      studiable: !!b.closest(".active-deck[data-review]"),
    } : null;
  });
  check("the row offers Update", !!offer && offer.deck === small.id, JSON.stringify(offer));
  /* ONE BUTTON FOR ONE FILE. A deck's levels and its directions are the same file seen from further
     in, so a button on each would be nine offers to do one fetch — the mistake the pending row
     records making once already. */
  check("…exactly one, on the deck's own row", !!offer && offer.rows === 1, offer && String(offer.rows));
  check("…on a row that is still perfectly studiable", !!(offer && offer.studiable));

  /* ---------- 4. the update itself ---------- */
  console.log("\n4) updating merges into the deck that is here\n");
  const fetched = [];
  page.on("request", (r) => { if (/\/decks\//.test(r.url())) fetched.push(r.url().split("/").pop()); });
  const clicked = await page.evaluate(() => { const b = document.querySelector("[data-langup]"); if (b) b.click(); return !!b; });
  check("the Update button is there to press", clicked);
  await page.waitForTimeout(14000);

  check("Update fetches the deck file, once", fetched.length === 1, fetched.join(", ") || "nothing fetched");
  check("…exactly the one the catalogue named", fetched[0] === small.file, fetched[0] || "—");

  const after = await page.evaluate((args) => new Promise((res) => {
    const deckId = args[0], cardId = args[1];
    const q = indexedDB.open("folio-community");
    q.onsuccess = () => {
      const db = q.result;
      const tx = db.transaction(["decks", "notes"]);
      const g = tx.objectStore("decks").get(deckId);
      const n = tx.objectStore("notes").get(deckId + "/" + cardId);
      tx.oncomplete = () => {
        db.close();
        const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
        const c = n.result && n.result.c;
        res({
          langRev: g.result && g.result.langRev,
          notes: ((g.result && g.result.index) || []).length,
          pinyin: c && c.fields ? c.fields.Pinyin : null,
          mirror: c ? c.pinyin : null,
          sched: (s.cards || {})[cardId] || null,
          deckId: g.result && g.result.id,
        });
      };
    };
    q.onerror = () => res(null);
  }), [small.id, target.id]);

  /* THE REPORTED FAULT, CLOSED: the card on the device now says what the shipped file says. */
  check("the stale card is repaired", !!after && after.pinyin === target.was,
    JSON.stringify({ now: after && after.pinyin, want: target.was }));
  check("…including its legacy mirror", !!after && after.mirror === target.was, String(after && after.mirror));
  check("…and the deck records the revision it is now at", !!after && after.langRev === small.rev,
    (after && after.langRev) + " vs " + small.rev);
  /* THE HALF THAT MAKES IT SAFE TO OFFER AT ALL. A re-import would have produced a correct deck under
     a new id and taken every interval, ease and repetition count with it — invisibly. */
  check("the deck keeps its id, so nothing is orphaned", !!after && after.deckId === small.id, after && after.deckId);
  check("…and the reader's schedule for that card is untouched",
    !!(after && after.sched && after.sched.ivl === 42 && after.sched.reps === 7 && after.sched.status === "review"),
    JSON.stringify(after && after.sched));
  check("…with the deck no bigger or smaller than the file it came from",
    !!after && after.notes === small.notes, (after && after.notes) + " vs " + small.notes);

  const gone = await page.evaluate(() => document.querySelectorAll("[data-langup]").length);
  check("and the Update button goes once there is nothing to update", gone === 0, String(gone));

  check("no uncaught page errors", errs.length === 0, errs.join(" | "));

  console.log("");
  console.log(pass + " passed, " + fail + " failed");
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
