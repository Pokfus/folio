#!/usr/bin/env node
/* ============================================================
   test-library.js — the Library: the shelf, one book, and the reader's place.

     NODE_PATH=<scratch>/node_modules node .claude/test-library.js

   What this guards, and why each one is here rather than left to a screenshot:

   · THE RENAME. Two pages called Library — one of them titled Collections — is how a reader ends up
     on the wrong one, and nothing throws when a label is stale. The old #decks address must still
     work (every link ever shared points at it) while calling itself Collections everywhere.
   · THE TEXT IS LAZY. A book is ~450 KB. If books/<id>.js ever reaches the eager load path the site
     gets slower for every visitor who never opens a book, and the only symptom is a slower site —
     nobody reports that. So: not requested on boot, not on the shelf, only on the book itself.
   · THE READER'S PLACE. The whole point of the feature. It has to survive a RELOAD (not just a
     re-render), come back on the same chapter, and be stored as a fraction rather than a pixel
     offset — a pixel offset silently moves the place the moment the text size or the width changes,
     which is exactly the case a phone hits and a test window does not.
   · THE APPARATUS. Gloss links must resolve inside the prose and the translator's notes must be
     numbered by the site's own footnote pass. A note marker whose number has no entry behind it is
     REMOVED by wireFootnotes, so a mis-wired book loses its markers silently.
   · THE LICENCE. The book page states the translation and the grounds it is public domain on. That
     sentence is the reason the text may be served at all; if it ever stops rendering, the site is
     hosting a book with nothing on the page saying why it may.
   ============================================================ */

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

let pass = 0, fail = 0;
const check = (label, ok, detail) => {
  if (ok) { pass++; console.log("  ok   " + label); }
  else { fail++; console.log("  FAIL " + label + (detail ? "  → " + detail : "")); }
};

const PHONE = { width: 390, height: 844 };
const DESK = { width: 1280, height: 900 };

/* Read the SHIPPED book files and look for Wikisource's own stylesheet in them. Done in Node, over
   every chapter of every book, rather than in the page over whichever chapter happens to be open —
   the leak sat in 24 of Seneca's 335 notes and each one is only visible to a reader who opens that
   chapter's fold, so a one-chapter check is a check that passes by luck. */
function shippedBookLeaks() {
  const dir = path.join(ROOT, "books");
  const bad = { n: 0, notes: [], html: [] };
  if (!fs.existsSync(dir)) return bad;
  fs.readdirSync(dir).filter((f) => f.endsWith(".js")).forEach((f) => {
    global.window = {};
    delete require.cache[require.resolve(path.join(dir, f))];
    require(path.join(dir, f));
    (global.window.FOLIO_BOOKS_IN || []).forEach((b) => {
      (b.chapters || []).forEach((c) => {
        bad.n++;
        // a CSS rule set, however it arrived: the class MediaWiki scopes them with, a surviving
        // <style> tag, or a bare `selector{prop:value}` in what should be a sentence
        (c.notes || []).forEach((s, i) => {
          if (/\.mw-parser-output|<style|\{[^{}]*:[^{}]*\}/.test(s)) bad.notes.push(b.id + " " + c.n + "#" + (i + 1));
        });
        if (/\.mw-parser-output|<style/.test(c.html || "")) bad.html.push(b.id + " " + c.n);
      });
    });
  });
  return bad;
}

/* Both halves of one book, read off the files that shipped and measured against each other. Written
   for The City of God, whose reader serves one book and so cannot be proved inert by re-running a
   sibling — see the note at its call site. Returns null when the book is not on disk. */
function shippedPair(id) {
  const dir = path.join(ROOT, "books");
  const enF = path.join(dir, id + ".js"), laF = path.join(dir, id + ".la.js");
  if (!fs.existsSync(enF) || !fs.existsSync(laF)) return null;
  global.window = {};
  [enF, laF].forEach((f) => { delete require.cache[require.resolve(f)]; require(f); });
  const en = (global.window.FOLIO_BOOKS_IN || []).find((b) => b.id === id);
  const la = (global.window.FOLIO_BOOK_ORIG_IN || []).find((b) => b.id === id);
  if (!en || !la) return null;
  const nums = (h) => (h.match(/class="bk-n"[^>]*>(\d+)</g) || []).map((s) => +s.match(/>(\d+)</)[1]);
  const out = { en: en.chapters, la: la.chapters, secEn: 0, secLa: 0, pairs: 0, gaps: [], notSeq: [], noteFaults: [], caput: 0 };
  la.chapters.forEach((c) => { out.caput += (c.html.match(/CAPUT/g) || []).length; });
  en.chapters.forEach((c) => {
    const o = la.chapters.find((x) => x.n === c.n);
    const a = nums(c.html), b = o ? nums(o.html) : [];
    out.secEn += a.length; out.secLa += b.length;
    if (!a.every((v, i) => v === i + 1)) out.notSeq.push("en " + c.n);
    if (!b.every((v, i) => v === i + 1)) out.notSeq.push("la " + c.n);
    const sa = new Set(a), sb = new Set(b);
    const miss = a.filter((v) => !sb.has(v)), extra = b.filter((v) => !sa.has(v));
    if (a.length && !miss.length && !extra.length) out.pairs++;
    else out.gaps.push(c.n + ": en-only " + miss.join(",") + " la-only " + extra.join(","));
    const m = [...c.html.matchAll(/data-fn="(\d+)"/g)].map((x) => +x[1]);
    if (m.some((v) => v > (c.notes || []).length)) out.noteFaults.push(c.n + " marker past end of list");
    for (let i = 1; i <= (c.notes || []).length; i++) if (!m.includes(i)) { out.noteFaults.push(c.n + " note " + i + " unreferenced"); break; }
  });
  return out;
}

(async () => {
  // every request the page makes, so "is the book lazy?" is answered by observation
  const asked = [];
  const server = http.createServer((req, res) => {
    const url = req.url.split("?")[0];
    asked.push(url);
    const file = path.join(ROOT, url === "/" ? "index.html" : decodeURIComponent(url));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end("no"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";

  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM || undefined });
  const errs = [];
  /* …and suppresses the first-visit coach marks (Aug 2026) — BOTH of them, the shelf's and the one shown
     the first time a book is opened. They are full-screen overlays on document.body, so on a fresh profile
     every click below lands on the scrim instead of the shelf and the whole file times out; the book half
     is worse, since it is over the PAGE the gesture sections swipe (that is how it announced itself when
     the card was split — one real-touch swipe, silently eaten). Set BEFORE the first navigation, hence the
     await at every call site. The cards themselves are `.claude/test-tour.js`'s section 5 — this file is
     about the shelf and the book under them. */
  const watch = async (p) => {
    p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    p.on("pageerror", (e) => errs.push(String(e)));
    await p.addInitScript(() => {
      try {
        localStorage.setItem("folio_library_tour_v1", "1");
        localStorage.setItem("folio_book_tour_v1", "1");
        localStorage.setItem("folio_tour_v1", "1");
      } catch (e) {}
    });
  };

  /* ================= 1. the rename ================= */
  console.log("\n1. Collections — the page that used to be called Library");
  {
    const page = await browser.newPage({ viewport: DESK });
    await watch(page);
    await page.goto(base + "#decks", { waitUntil: "load" });
    await page.waitForTimeout(900);
    const d = await page.evaluate(() => ({
      h1: (document.querySelector(".page-head h1") || {}).textContent || "",
      eyebrow: (document.querySelector(".page-head .eyebrow") || {}).textContent || "",
      title: document.title,
      // the top bar must not offer two tabs both reading "Library"
      tabs: [...document.querySelectorAll(".topbar .tab")].map((t) => ({ r: t.dataset.route, l: t.querySelector(".tab-label").textContent.trim() })),
      rows: document.querySelectorAll(".collection-row, .collection").length,
    }));
    check("the old #decks address still resolves", d.rows > 0 || /Collection/i.test(d.h1), JSON.stringify({ rows: d.rows, h1: d.h1 }));
    check("...titled Collections", /^Collections$/i.test(d.h1.trim()), d.h1);
    check("...and its eyebrow no longer says Library", !/library/i.test(d.eyebrow), d.eyebrow);
    check("...with a Collections <title>", /Collections/i.test(d.title), d.title);
    const libTabs = d.tabs.filter((t) => /^library$/i.test(t.l));
    check("exactly one tab is called Library, and it is the books one",
      libTabs.length === 1 && libTabs[0].r === "library", JSON.stringify(d.tabs));
    /* …and there is no #decks TAB at all any more (Aug 2026, on request): Collections left the phone's bar
       first and the desktop's a fortnight later, and is reached from the "+ Add decks" lip under the daily
       review. So the assertion the rename needs is the pair — no tab called Collections, and none called
       Library except the books one, which is what "two pages called Library" was ever about. The ROUTE is
       asserted above, and separately: every #decks link ever shared still has to resolve. */
    check("...and no tab claims the collections at all — the home page's lip is the way in",
      !d.tabs.some((t) => t.r === "decks"), JSON.stringify(d.tabs));
    await page.close();
  }

  /* ================= 2. the shelf, and the book staying lazy ================= */
  console.log("\n2. The shelf — and the text that must not load with it");
  let bookHref = "";
  {
    asked.length = 0;
    const page = await browser.newPage({ viewport: DESK });
    await watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(1200);
    check("no book text is fetched on boot", !asked.some((u) => u.startsWith("/books/")), asked.filter((u) => u.startsWith("/books/")).join(","));

    await page.evaluate(() => { location.hash = "library"; });
    await page.waitForTimeout(700);
    const d = await page.evaluate(() => ({
      tiles: [...document.querySelectorAll(".book-tile")].map((t) => ({
        id: t.dataset.book,
        title: (t.querySelector(".bk-tile-title") || {}).textContent || "",
        author: (t.querySelector(".bk-tile-author") || {}).textContent || "",
        meta: (t.querySelector(".bk-tile-meta") || {}).textContent || "",
        when: (t.querySelector(".bk-tile-when") || {}).textContent || "",
        blurb: !!t.querySelector(".bk-tile-blurb"),
        spine: !!t.querySelector(".bk-spine"),
        h: Math.round(t.getBoundingClientRect().height),
      })),
      cols: getComputedStyle(document.querySelector(".book-grid")).gridTemplateColumns.split(" ").length,
      sortOpts: [...document.querySelectorAll("#bkSort option")].map((o) => o.value),
      sortLabels: [...document.querySelectorAll("#bkSort option")].map((o) => o.textContent),
      sortDir: (document.querySelector("#bkSortDir") || {}).textContent || "",
      note: (document.querySelector(".lib-note") || {}).textContent || "",
      blurb: (document.querySelector(".page-head p") || {}).textContent || "",
    }));
    check("the shelf shows a tile per book", d.tiles.length >= 1, JSON.stringify(d.tiles.map((t) => t.id)));
    /* WHAT A BANNER HAS TO SAY, asserted over EVERY book rather than over whichever one the shelf
       puts first. These two used to read tiles[0] and so quietly meant "Seneca", which held only
       while he led the shelf and broke when Aesop's Fables was added (Aug 2026) — reporting a
       missing Stoic on a page where nothing was wrong. Checking every banner is both order-proof
       and a stronger claim: a book added later with no author or no length now fails here, which
       is exactly the mistake this pair exists to catch. The named anchor is kept beside it, since
       a generic shape check would pass on a shelf of blanks. */
    const seneca = d.tiles.find((t) => t.id === "seneca-letters");
    const nameless = d.tiles.filter((t) => !/\S/.test(t.title) || !/\S/.test(t.author));
    check("...naming the work and its author",
      !nameless.length && seneca && /Letters from a Stoic/i.test(seneca.title) && /Seneca/i.test(seneca.author),
      JSON.stringify(nameless.length ? nameless : seneca));
    // "124 letters", "313 fables", "8 books" — a figure and the unit that book counts in
    const lengthless = d.tiles.filter((t) => !/\d+\s+\S+/.test(t.meta));
    check("...saying how long it is",
      !lengthless.length && /\d+\s+letters/i.test(seneca.meta),
      JSON.stringify(lengthless.length ? lengthless.map((t) => t.id + ":" + t.meta) : seneca.meta));
    check("...each with its coloured spine", d.tiles.every((t) => t.spine));
    /* The tile is SMALL (Aug 2026, on request), and the two halves of that are asserted separately
       because they fail in opposite ways: the blurb creeping back would make it tall again, and the
       date going missing would leave a history shelf saying nothing about when anything was written.
       The height ceiling is what a "smaller tile" actually means — it was ~200px with the blurb. */
    check("...with the year it was written, where the blurb used to be",
      /\d/.test(d.tiles[0].when) && !d.tiles.some((t) => t.blurb), JSON.stringify({ when: d.tiles[0].when, blurb: d.tiles.some((t) => t.blurb) }));
    check("...and short with it", d.tiles.every((t) => t.h <= 120), JSON.stringify(d.tiles.map((t) => t.h)));
    check("the shelf is one full-width banner per row", d.cols === 1, String(d.cols));
    check("...and can be sorted, by title, author and date as well as by reading",
      ["title", "author", "written"].every((v) => d.sortOpts.includes(v)), d.sortOpts.join(","));
    /* EVERY ORDER REVERSES, and the choice is REMEMBERED (Aug 2026, on request). Three things are asserted
       and each fails silently on its own: the select must not carry a direction in its option labels (it
       used to say "Title (A – Z)", which a reverse button turns into a control contradicting itself); the
       button must name the direction in THIS field's words rather than as a bare arrow; and the pair must
       survive a full reload, which is the whole of "the page should remember". */
    check("...the select names the FIELD, leaving the direction to the button beside it",
      d.sortLabels.every((l) => !/A – Z|Z – A|Oldest|Newest|recent first/i.test(l)) && !!d.sortDir,
      JSON.stringify({ labels: d.sortLabels, dir: d.sortDir }));
    const rev = await page.evaluate(async () => {
      const sel = document.querySelector("#bkSort");
      sel.value = "title"; sel.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 500));
      const az = [...document.querySelectorAll(".bk-tile-title")].map((t) => t.textContent);
      const azLbl = document.querySelector("#bkSortDir").textContent.trim();
      document.querySelector("#bkSortDir").click();
      await new Promise((r) => setTimeout(r, 500));
      return { az, azLbl, za: [...document.querySelectorAll(".bk-tile-title")].map((t) => t.textContent),
               zaLbl: document.querySelector("#bkSortDir").textContent.trim() };
    });
    check("...ordered A – Z, and reversed to Z – A",
      rev.za.join("|") === rev.az.slice().reverse().join("|") && /A – Z/.test(rev.azLbl) && /Z – A/.test(rev.zaLbl),
      JSON.stringify(rev));
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1200);
    const kept = await page.evaluate(() => ({
      sel: document.querySelector("#bkSort").value,
      lbl: document.querySelector("#bkSortDir").textContent.trim(),
      list: [...document.querySelectorAll(".bk-tile-title")].map((t) => t.textContent),
    }));
    check("...and the shelf opens the way it was left, after a reload",
      kept.sel === "title" && /Z – A/.test(kept.lbl) && kept.list.join("|") === rev.za.join("|"), JSON.stringify(kept));

    /* FAVOURITES (Aug 2026, on request): starred from the banner's own long-press sheet — the same gesture
       and the same shell as an added deck's row on the home page — and pinned to a section at the top. The
       assertions that matter are the ones about the SHELF rather than the sheet: a starred book must not be
       listed twice (a reader scrolling past their own favourite again has to work out which is the real
       one), and the headings must not appear at all until something is starred. */
    const sheet = await page.evaluate(async () => {
      const el = document.querySelector(".book-tile"), r = el.getBoundingClientRect();
      const x = r.left + 40, y = r.top + 20;
      const send = (t) => el.dispatchEvent(new PointerEvent(t, { pointerId: 3, pointerType: "touch", clientX: x, clientY: y, bubbles: true, cancelable: true }));
      send("pointerdown");
      await new Promise((z) => setTimeout(z, 700));
      send("pointerup");
      await new Promise((z) => setTimeout(z, 300));
      return { open: !!document.querySelector(".deck-menu"), hash: location.hash,
        acts: [...document.querySelectorAll(".deck-menu .dm-item")].map((i) => i.dataset.act) };
    });
    check("holding a banner opens its options rather than the book",
      sheet.open && sheet.hash === "#library", JSON.stringify(sheet));
    check("...offering the two things asked for: favourite and share",
      sheet.acts.join(",") === "fav,share", sheet.acts.join(","));
    const starred = await page.evaluate(async () => {
      document.querySelector('.deck-menu [data-act="fav"]').click();
      await new Promise((z) => setTimeout(z, 600));
      const titles = [...document.querySelectorAll(".bk-tile-title")].map((t) => t.textContent);
      return {
        heads: [...document.querySelectorAll(".lib-sec-head")].map((h) => h.textContent),
        first: [...document.querySelectorAll(".lib-sec")][0].querySelectorAll(".book-tile").length,
        dup: titles.length !== new Set(titles).size,
        stars: document.querySelectorAll(".bk-star").length,
        stored: Object.keys(JSON.parse(localStorage.getItem("folio_v1")).bookFavs || {}).length,
      };
    });
    check("starring puts the book in a Favourites section at the top",
      starred.heads[0] === "Favourites" && starred.first === 1, JSON.stringify(starred.heads));
    check("...with the rest below it, and no book listed twice", !starred.dup && /Everything else/i.test(starred.heads[1] || ""), JSON.stringify(starred));
    check("...the banner wearing a star, and the choice stored as progress", starred.stars === 1 && starred.stored === 1, JSON.stringify(starred));
    // …and Share hands out a link that opens the book here. navigator.share is absent in headless Chromium,
    // so this exercises the clipboard fallback — which is the desktop path either way.
    const shared = await page.evaluate(async () => {
      window.__copied = null;
      navigator.clipboard.writeText = (t) => { window.__copied = t; return Promise.resolve(); };
      const el = document.querySelector(".book-tile"), r = el.getBoundingClientRect();
      const send = (t) => el.dispatchEvent(new PointerEvent(t, { pointerId: 4, pointerType: "touch", clientX: r.left + 40, clientY: r.top + 20, bubbles: true, cancelable: true }));
      send("pointerdown");
      await new Promise((z) => setTimeout(z, 700));
      send("pointerup");
      await new Promise((z) => setTimeout(z, 300));
      document.querySelector('.deck-menu [data-act="share"]').click();
      await new Promise((z) => setTimeout(z, 400));
      return window.__copied;
    });
    check("Share hands out a #book/<id> link", /#book\/[a-z0-9-]+$/.test(shared || ""), String(shared));

    // put the shelf back the way the rest of this file expects to find it
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("folio_v1")); s.bookFavs = {};
      s.settings.bookSort = "recent"; s.settings.bookSortRev = false;
      localStorage.setItem("folio_v1", JSON.stringify(s));
    });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1000);
    /* The shelf's own licence paragraph is GONE (Aug 2026, on request) and its replacement is the
       short line under the heading. Both halves are asserted, because they fail in opposite ways: the
       paragraph creeping back would undo the request, and the line going missing would leave a page of
       public-domain books saying nothing about being free to read. The RULE that paragraph described
       has not gone anywhere — it is asserted below, in the front matter, beside the edition it is
       actually about. */
    check("the shelf says what it holds, in one line", /public domain/i.test(d.blurb) && /free to read/i.test(d.blurb), d.blurb.slice(0, 90));
    check("...and no longer carries the licence paragraph", !d.note, d.note.slice(0, 90));
    check("...and STILL no book text has been fetched", !asked.some((u) => u.startsWith("/books/")), asked.filter((u) => u.startsWith("/books/")).join(","));
    /* SECTIONS 3–6 READ SENECA SPECIFICALLY, so they name him rather than taking whatever the shelf
       happens to put first. This used to be `d.tiles[0].id`, which worked only for as long as Seneca
       led the shelf under the "recent" sort with nothing yet read — and stopped the day Aesop's
       Fables was added (Aug 2026). The failure is a confusing one rather than a useful one: every
       Seneca assertion below fails at once, reporting Gummere missing, no Latin control and four
       proper nouns nobody recognises, none of which is a fault in the book being opened. Two of
       those checks can ONLY pass on Seneca — the four common nouns that mean something else in him,
       and the original-language control, which Aesop deliberately has not got — so the target is
       pinned here in the same way lines further down already pin `#book/seneca-letters`. That the
       first tile opens at all is asserted separately, in the shelf and search sections above. */
    bookHref = "seneca-letters";
    check("...and the shelf still holds the book sections 3–6 are about",
      d.tiles.some((t) => t.id === bookHref), d.tiles.map((t) => t.id).join(","));
    /* THE SEARCH BOX (Aug 2026, on request). Three of these fail silently. A filter that quietly loses the
       favourites split, or one whose repainted banners have no listener on them, both leave a shelf that
       LOOKS right — the second only bites when a reader tries to open the book they just searched for, and
       it is a real risk here because the hold sheet is a per-element gesture rather than a delegated one.
       And re-sorting is the case the glossary record's own filter documents: two independent handlers, each
       rebuilding the list from scratch, throw away whatever the reader had typed. */
    const search = await page.evaluate(async () => {
      const box = document.querySelector("#bkFilter");
      const type = async (v) => {
        box.value = v;
        box.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise((z) => setTimeout(z, 120));
      };
      const titles = () => [...document.querySelectorAll(".bk-tile-title")].map((t) => t.textContent);
      const out = { box: !!box, all: titles().length };
      await type("seneca");
      out.byAuthor = [...document.querySelectorAll(".bk-tile-author")].map((t) => t.textContent);
      await type("sun tzu");                    // the shelf spells him Tzŭ — the fold is the point
      out.folded = titles();
      await type("republic plato");             // two words, the wrong way round
      out.anyOrder = titles();
      await type("zzzz");
      out.none = { line: !!document.querySelector(".lib-none"), tiles: document.querySelectorAll(".book-tile").length };
      await type("");
      out.cleared = titles().length;
      return out;
    });
    check("the shelf has a search box", search.box);
    check("searching by author narrows the shelf",
      search.byAuthor.length === 1 && /Seneca/i.test(search.byAuthor[0]), JSON.stringify(search.byAuthor));
    check("...diacritics fold, so “Sun Tzu” finds “Sun Tzŭ”",
      search.folded.length === 1 && /Art of War/i.test(search.folded[0]), JSON.stringify(search.folded));
    check("...the words may come in any order",
      search.anyOrder.length === 1 && /Republic/i.test(search.anyOrder[0]), JSON.stringify(search.anyOrder));
    check("...nothing matching says so rather than drawing an empty shelf",
      search.none.line && search.none.tiles === 0, JSON.stringify(search.none));
    check("...and clearing it puts every book back", search.cleared === search.all, search.cleared + " of " + search.all);
    // a banner the SEARCH painted must still be a book you can open — the hold sheet is wired per element
    const afterFilter = await page.evaluate(async () => {
      const box = document.querySelector("#bkFilter");
      box.value = "meditations";
      box.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((z) => setTimeout(z, 150));
      document.querySelector(".book-tile").click();
      await new Promise((z) => setTimeout(z, 700));
      return location.hash;
    });
    check("...and a banner it painted still opens its book", /^#book\//.test(afterFilter), afterFilter);
    await page.evaluate(() => { location.hash = "#library"; });
    await page.waitForTimeout(700);
    const kept2 = await page.evaluate(async () => {
      const before = document.querySelector("#bkFilter").value;
      const sel = document.querySelector("#bkSort");
      sel.value = "title";
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((z) => setTimeout(z, 500));
      return { before: before, after: document.querySelector("#bkFilter").value,
        tiles: document.querySelectorAll(".book-tile").length };
    });
    check("the query survives leaving the page and coming back", kept2.before === "meditations", JSON.stringify(kept2));
    check("...and re-sorting keeps both the query and the narrowed shelf",
      kept2.after === "meditations" && kept2.tiles === 1, JSON.stringify(kept2));


    /* A banner spans the FULL width on a phone too (Aug 2026, on request — it was briefly two narrow
       tiles side by side, which was asked for and then asked back). The count is read off the GRID as
       well as off the banner, so this still holds the day a second book lands. */
    await page.setViewportSize(PHONE);
    await page.waitForTimeout(400);
    const ph = await page.evaluate(() => {
      const g = document.querySelector(".book-grid"), t = document.querySelector(".book-tile");
      return { cols: getComputedStyle(g).gridTemplateColumns.split(" ").length,
        w: Math.round(t.getBoundingClientRect().width), page: Math.round(g.getBoundingClientRect().width),
        h: Math.round(t.getBoundingClientRect().height) };
    });
    check("[phone] the shelf is still one banner per row", ph.cols === 1, JSON.stringify(ph));
    check("[phone] ...spanning the full width", ph.w >= ph.page - 1, JSON.stringify(ph));
    check("[phone] ...and still short, without the blurb", ph.h <= 120, JSON.stringify(ph));
    await page.close();
  }

  /* ================= 3. one book ================= */
  console.log("\n3. One book — chapters on tabs, gloss links, the translator's notes");
  {
    asked.length = 0;
    const page = await browser.newPage({ viewport: DESK });
    await watch(page);
    await page.goto(base + "#book/" + bookHref, { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const d = await page.evaluate(() => ({
      h1: (document.querySelector(".page-head h1") || {}).textContent || "",
      tabs: document.querySelectorAll(".bk-tab").length,
      on: [...document.querySelectorAll(".bk-tab.on")].map((t) => t.dataset.ch),
      chTitle: (document.querySelector(".bk-ch-t") || {}).textContent || "",
      paras: document.querySelectorAll(".bk-prose p").length,
      words: ((document.querySelector(".bk-prose") || {}).textContent || "").trim().split(/\s+/).length,
      // the bar and its contents panel are one sticky block, so it is the WRAPPER that pins
      barSticky: getComputedStyle(document.querySelector(".bk-barwrap")).position,
      barInWrap: !!document.querySelector(".bk-barwrap > .bk-bar") && !!document.querySelector(".bk-barwrap > #bkTocPanel"),
      // the lit tab in the top bar — a book belongs under the Library
      lit: [...document.querySelectorAll(".topbar .tab.active")].map((t) => t.dataset.route).join(","),
      rights: (document.querySelector(".bk-rights") || {}).textContent || "",
      // the front matter is chapter 0, and nothing else may be
      zeros: [...document.querySelectorAll(".bk-tab")].filter((t) => t.dataset.ch === "0").length,
      footRights: !!document.querySelector(".bk-page ~ .bk-rights, .bk-foot ~ .bk-rights"),
    }));
    check("the book's text was fetched, and only now", asked.some((u) => u.startsWith("/books/")), asked.filter((u) => u.startsWith("/books/")).join(","));
    check("the book opens on its own page", /Letters from a Stoic/i.test(d.h1), d.h1);
    check("...with a tab per chapter", d.tabs >= 60, String(d.tabs));
    check("...exactly one of them selected", d.on.length === 1, d.on.join(","));
    check("...showing that chapter's title", d.chTitle.trim().length > 3, d.chTitle);
    check("...and its prose, in paragraphs", d.paras >= 3 && d.words > 300, JSON.stringify({ paras: d.paras, words: d.words }));
    check("the chapter bar sticks to the top as the reader scrolls", d.barSticky === "sticky", d.barSticky);
    check("...carrying its contents panel with it", d.barInWrap, String(d.barInWrap));
    check("a book lights the Library tab", d.lit === "library", d.lit);

    /* THE FRONT MATTER (Aug 2026, on request): a real chapter 0 rather than a panel, and the "About
       this text" box that used to sit under EVERY chapter is gone with it. Both halves are checked —
       a front matter that fails to appear and a rights box that comes back at the foot of all 65
       letters are opposite failures and neither raises anything. */
    check("the book opens on its own front matter", d.on[0] === "0" && /about this book/i.test(d.chTitle),
      JSON.stringify({ on: d.on, title: d.chTitle }));
    check("...which is one chapter, numbered 0, not a second copy", d.zeros === 1, String(d.zeros));
    check("...carrying the translator and the grounds it is free on",
      /Gummere/i.test(d.rights) && /public domain/i.test(d.rights), d.rights.slice(0, 120));
    check("...and NOT repeated below every chapter, as it used to be", !d.footRights, String(d.footRights));

    // the section numbers by which this text is cited belong to the letters, not to the front matter
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "1"); t.click(); });
    await page.waitForTimeout(500);
    const l1 = await page.evaluate(() => ({
      sections: document.querySelectorAll(".bk-prose .bk-n").length,
      rights: document.querySelectorAll(".bk-rights").length,
    }));
    check("the cited section numbers are kept", l1.sections >= 3, String(l1.sections));
    check("...and a letter carries no rights box of its own", l1.rights === 0, String(l1.rights));

    // the apparatus: gloss links in the prose, and the translator's notes numbered by the site's own pass
    const ap = await page.evaluate(() => {
      // find a chapter that actually carries notes
      const tabs = [...document.querySelectorAll(".bk-tab")];
      return { tabs: tabs.length };
    });
    void ap;
    // step to a chapter with notes (letter 3 carries three)
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "3"); t.click(); });
    await page.waitForTimeout(600);
    const n = await page.evaluate(() => {
      const markers = [...document.querySelectorAll(".bk-prose sup.fn")];
      const items = document.querySelectorAll(".bk-notes .src-item").length;
      return {
        markers: markers.length,
        numbered: markers.map((m) => m.textContent.trim()),
        items,
        label: (document.querySelector(".bk-notes .src-label") || {}).textContent || "",
        shut: !!document.querySelector(".bk-notes .src-collapse.collapsed"),
        expanded: (document.querySelector(".bk-notes .src-head") || {}).getAttribute
          ? document.querySelector(".bk-notes .src-head").getAttribute("aria-expanded") : "",
        gloss: document.querySelectorAll(".bk-prose .ttip").length,
      };
    });
    check("the translator's notes render as a numbered fold", n.items >= 3, String(n.items));
    check("...labelled Notes, not Sources", /notes/i.test(n.label), n.label);
    // OPEN by default (Aug 2026, on request — it started shut). An apparatus a reader has to go looking
    // for is one they will not look at, and this is the translator's commentary rather than a works list.
    check("...open by default, not collapsed", !n.shut && n.expanded === "true",
      JSON.stringify({ shut: n.shut, ariaExpanded: n.expanded }));
    check("...with a marker in the prose for each", n.markers >= 3, String(n.markers));
    check("...numbered in reading order by the site's own footnote pass",
      n.numbered.length >= 3 && n.numbered.slice(0, 3).join(",") === "1,2,3", n.numbered.join(","));
    check("...and no marker points past the end of the list",
      n.numbered.every((x) => +x <= n.items), JSON.stringify({ markers: n.numbered, items: n.items }));

    /* NO STYLESHEET IN THE PROSE, and this is checked over the WHOLE book rather than one chapter.
       Wikisource ships each note's font templates as an inline <style> element — the Greek face for a
       quotation, the small caps for A.D./B.C. — and the importer used to drop the tags and leave the
       CSS TEXT behind, so 24 of Seneca's 335 notes read "…on the Palatine, .mw-parser-output
       .wst-asc{font-variant:all-small-caps}…A.D. 41." (reported Aug 2026, with a screenshot).

       It fails SILENTLY in every way that matters: the note is a non-empty string of the right shape,
       the count is right, the markers all resolve, and nothing anywhere throws. Only a reader opening
       the fold ever sees it — which is why this reads the shipped DATA rather than one rendered page,
       and why it also sweeps the prose, where the same leak would land if the wrapper markup moves
       again. */
    /* TAPPING A MARKER LANDS ON THE NOTE, CLEAR OF THE TAB BAR (Aug 2026, on a bug report: on a phone
       the jump "doesn't quite go far enough to see the actual note").

       Two things conspired and the assertion has to be able to catch both. scrollIntoView({block:
       "nearest"}) brings the item's bottom flush with the VIEWPORT's — and a phone has a 58px tab bar
       fixed over the foot of it, so the note arrived underneath the bar. And when the fold was shut the
       scroll was computed against a list still zero pixels tall, stopping short by its whole height.

       So the check is not "is it in the viewport" — which the old behaviour passed — but "is it above
       the tab bar", measured against the bar's own rendered box rather than a hard-coded 58. */
    {
      const phone = await browser.newPage({ viewport: PHONE });
      await watch(phone);
      await phone.goto(base + "#book/seneca-letters", { waitUntil: "networkidle" });
      await phone.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "3"); t.click(); });
      await phone.waitForTimeout(600);
      const jump = await phone.evaluate(async () => {
        const m = document.querySelector(".bk-prose sup.fn");
        m.scrollIntoView({ block: "center" });                    // start from the marker, as a reader is
        await new Promise((r) => setTimeout(r, 400));
        m.click();
        await new Promise((r) => setTimeout(r, 900));             // let the smooth scroll settle
        const n = +m.getAttribute("data-fn");
        const item = document.querySelectorAll(".bk-notes .src-item")[n - 1];
        const r = item.getBoundingClientRect();
        const bar = document.querySelector(".tabbar");
        const barTop = bar && bar.offsetHeight ? bar.getBoundingClientRect().top : window.innerHeight;
        return { top: r.top, bottom: r.bottom, barTop, h: window.innerHeight, n };
      });
      check("[phone] tapping a marker brings its note fully into view",
        jump.top >= 0 && jump.bottom <= jump.h, JSON.stringify(jump));
      check("[phone] ...clear of the tab bar, not tucked behind it",
        jump.bottom <= jump.barTop, JSON.stringify(jump));
      // …and from a fold the reader had shut, where the scroll used to be computed against a flat list
      const shutJump = await phone.evaluate(async () => {
        document.querySelector(".bk-notes .src-head").click();    // shut it
        await new Promise((r) => setTimeout(r, 600));
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 300));
        const m = document.querySelector(".bk-prose sup.fn");
        m.click();
        await new Promise((r) => setTimeout(r, 900));
        const n = +m.getAttribute("data-fn");
        const r = document.querySelectorAll(".bk-notes .src-item")[n - 1].getBoundingClientRect();
        const bar = document.querySelector(".tabbar");
        const barTop = bar && bar.offsetHeight ? bar.getBoundingClientRect().top : window.innerHeight;
        return { top: r.top, bottom: r.bottom, barTop, h: window.innerHeight };
      });
      check("[phone] ...and so does a marker that had to open the fold first",
        shutJump.top >= 0 && shutJump.bottom <= shutJump.barTop, JSON.stringify(shutJump));
      await phone.close();
    }

    const leak = shippedBookLeaks();
    check("no note carries Wikisource's own stylesheet as text",
      leak.n > 0 && !leak.notes.length, JSON.stringify({ chapters: leak.n, bad: leak.notes.slice(0, 6) }));
    check("...nor does any chapter's prose", leak.n > 0 && !leak.html.length, JSON.stringify(leak.html.slice(0, 6)));

    /* THE CAPUT READER HAS NO SIBLING TO DIFF AGAINST (Aug 2026, adding The City of God). Every other
       book on this shelf shares its extractor with at least one more, so a change to one is proved
       inert by re-running the other and comparing bytes; this reader serves one book. What stands in
       for that is a sweep of the SHIPPED data — the same argument the Gita's stream cut rests on.

       The assertion that earns its place is the last one: an unconverted CAPUT in the Latin is a
       chapter mark wearing a costume the four the pass knows about do not cover, and it is silent
       everywhere else — the prose is all present, the book is the right length, and that chapter's
       Latin simply folds into the one above it. Exactly one is expected, Book I's bracketed
       resumption, which Migne prints and which is deliberately left as printed. */
    const cog = shippedPair("city-of-god");
    if (cog) {
      check("[city of god] the two columns carry the same number of chapters",
        cog.en.length === 22 && cog.la.length === 22, `en ${cog.en.length} la ${cog.la.length}`);
      check("...and 661 chapter numbers on each side",
        cog.secEn === 661 && cog.secLa === 661, `en ${cog.secEn} la ${cog.secLa}`);
      check("...numbered a clean 1..N in every book, both sides",
        !cog.notSeq.length, JSON.stringify(cog.notSeq.slice(0, 6)));
      check("...pairing exactly, every book, in both directions",
        cog.pairs === 22, `${cog.pairs}/22 — ${JSON.stringify(cog.gaps.slice(0, 4))}`);
      check("[city of god] every footnote marker resolves and every note is pointed at",
        !cog.noteFaults.length, JSON.stringify(cog.noteFaults.slice(0, 6)));
      check("[city of god] no unconverted CAPUT beyond Book I's bracketed resumption",
        cog.caput === 1, `${cog.caput} left`);
    } else {
      check("[city of god] both halves of the book are on disk", false, "missing books/city-of-god*.js");
    }
    /* The glossary, linked through the prose. Letter 3 deliberately is NOT the chapter to look at —
       it is about friendship and contains no glossary term at all, and an assertion pointed there
       passes or fails on nothing. Letter 9 names the Greeks, which the glossary has. */
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "9"); t.click(); });
    await page.waitForTimeout(600);
    const g = await page.evaluate(() => ({
      links: [...document.querySelectorAll(".bk-prose .ttip")].map((el) => ({ k: el.dataset.k, s: el.textContent.trim() })),
    }));
    check("the glossary is linked through the prose", g.links.length > 0, JSON.stringify(g.links));

    // a gloss link opens the popup it promises
    if (g.links.length) {
      await page.evaluate(() => document.querySelector(".bk-prose .ttip").click());
      await page.waitForTimeout(450);
      const popped = await page.evaluate(() => document.querySelectorAll(".gloss-win").length);
      check("...and one opens its glossary popup", popped > 0, String(popped));
      await page.evaluate(() => document.querySelectorAll(".gloss-win .gloss-close, .gloss-win [data-close]").forEach((b) => b.click()));
    }

    /* The proper-noun rule, and it is the assertion most worth having: Folio's glossary is a glossary of
       PREHISTORY, and run unrestricted over Roman philosophy it links `genus` (a logical category to a
       Stoic), `epoch`, `iron` and `bronze` to taxonomy, geology and the ages of the world. Those links
       look perfectly normal on the page — a glossary term, styled like every other — while telling the
       reader something untrue about the sentence they are reading. Nothing throws. So: walk the WHOLE
       book and assert no lowercase surface was ever linked.

       Reduced motion is turned on for the walk, and it is not incidental: a chapter change is a slide now
       (slideChapter), so the new chapter is not painted until the swap at the midpoint, and a loop clicking
       125 tabs a hundredth of a second apart would measure the FIRST chapter 125 times over — which reads
       as a book with almost nothing linked in it rather than as a test outrunning an animation. This sweep
       is about what the prose links, so the honest fix is to take the motion out rather than to wait it
       out three books deep. */
    await page.emulateMedia({ reducedMotion: "reduce" });
    const sweep = await page.evaluate(async () => {
      const bad = [], seen = {};
      for (const t of [...document.querySelectorAll(".bk-tab")]) {
        t.click();
        await new Promise((r) => setTimeout(r, 10));
        document.querySelectorAll(".bk-prose .ttip").forEach((el) => {
          const s = (el.textContent || "").trim();
          seen[el.dataset.k] = (seen[el.dataset.k] || 0) + 1;
          if (s && s[0] === s[0].toLowerCase()) bad.push(el.dataset.k + ":" + s);
        });
      }
      return { bad, keys: Object.keys(seen) };
    });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    check("no common noun is linked anywhere in the book", sweep.bad.length === 0, sweep.bad.slice(0, 6).join(", "));
    check("...while the proper nouns still are", sweep.keys.length >= 5, sweep.keys.join(","));
    check("...and the four that mean something else in Seneca are gone",
      !["Genus", "Geological_epoch", "Iron", "Bronze"].some((k) => sweep.keys.includes(k)), sweep.keys.join(","));
    await page.close();
  }

  /* ================= 4. the reader's place ================= */
  console.log("\n4. Where the reader left off — across a reload, not just a re-render");
  {
    const page = await browser.newPage({ viewport: DESK });
    await watch(page);
    await page.goto(base + "#book/" + bookHref, { waitUntil: "load" });
    await page.waitForTimeout(2500);

    // move to a chapter well into the book and scroll a good way down it
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "12"); t.click(); });
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight * 0.45, behavior: "auto" }));
    await page.waitForTimeout(900);

    const saved = await page.evaluate(() => {
      const S = JSON.parse(localStorage.getItem("folio_v1"));
      return S.reading && S.reading["seneca-letters"];
    });
    check("the place is recorded", !!saved, JSON.stringify(saved));
    check("...as a chapter NUMBER, not an index", saved && saved.ch === 12, JSON.stringify(saved));
    check("...and a FRACTION, so it survives a resize or a text-size change",
      saved && typeof saved.y === "number" && saved.y > 0 && saved.y <= 1, JSON.stringify(saved));

    // a real reload — the case that matters, and the one a re-render does not prove
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(2600);
    const back = await page.evaluate(() => ({
      on: [...document.querySelectorAll(".bk-tab.on")].map((t) => t.dataset.ch).join(","),
      head: (document.querySelector(".bk-ch-n") || {}).textContent || "",
      y: window.scrollY,
    }));
    check("a reload comes back on the same chapter", back.on === "12", JSON.stringify(back));
    check("...saying so in the chapter head", /12/.test(back.head), back.head);
    check("...scrolled back down to the place, not to the top", back.y > 200, String(back.y));

    // …and choosing a different chapter starts it at the top rather than mid-paragraph
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "5"); t.click(); });
    await page.waitForTimeout(800);
    const fresh = await page.evaluate(() => ({
      on: [...document.querySelectorAll(".bk-tab.on")].map((t) => t.dataset.ch).join(","),
      y: window.scrollY,
    }));
    check("a deliberate move to another chapter starts it at the top", fresh.on === "5" && fresh.y < 120, JSON.stringify(fresh));
    await page.close();
  }

  /* ================= 5. navigation ================= */
  console.log("\n5. Stepping, contents, and the phone");
  {
    const page = await browser.newPage({ viewport: DESK });
    await watch(page);
    await page.goto(base + "#book/" + bookHref, { waitUntil: "load" });
    await page.waitForTimeout(2500);
    // the first chapter is the front matter now, so that is where Previous runs out — the arrows step
    // through it like any other chapter rather than treating it as a panel beside the book
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "0"); t.click(); });
    await page.waitForTimeout(500);

    const first = await page.evaluate(() => ({
      prevDisabled: document.querySelector("#bkPrev").disabled,
      nextDisabled: document.querySelector("#bkNext").disabled,
    }));
    check("on the first chapter, Previous is disabled and Next is not",
      first.prevDisabled && !first.nextDisabled, JSON.stringify(first));

    await page.evaluate(() => document.querySelector("#bkNext").click());
    await page.waitForTimeout(500);
    check("Next steps from the front matter into the first letter",
      (await page.evaluate(() => [...document.querySelectorAll(".bk-tab.on")].map((t) => t.dataset.ch).join(","))) === "1");

    await page.evaluate(() => document.querySelector("#bkNext").click());
    await page.waitForTimeout(500);
    const stepped = await page.evaluate(() => [...document.querySelectorAll(".bk-tab.on")].map((t) => t.dataset.ch).join(","));
    check("Next steps one chapter on", stepped === "2", stepped);

    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(500);
    const keyed = await page.evaluate(() => [...document.querySelectorAll(".bk-tab.on")].map((t) => t.dataset.ch).join(","));
    check("→ steps too, as it does on any reader", keyed === "3", keyed);

    // contents
    const toc = await page.evaluate(() => {
      const before = document.querySelector("#bkTocPanel").hidden;
      document.querySelector("#bkToc").click();
      const p = document.querySelector("#bkTocPanel");
      return { before, after: p.hidden, items: p.querySelectorAll(".bk-toc-item").length, parts: p.querySelectorAll(".bk-toc-part").length };
    });
    check("Contents starts closed and opens", toc.before && !toc.after, JSON.stringify(toc));
    check("...listing every chapter", toc.items >= 60, String(toc.items));
    check("...grouped by the volume the edition itself divides it into", toc.parts >= 1, String(toc.parts));

    /* The panel TRAVELS WITH THE BAR (Aug 2026, on a bug report). The bar is sticky and the panel used to
       sit below it in the flow, so opening it a few screens into a chapter drew the contents back at the
       top of the DOCUMENT — off screen, nowhere near the button just pressed. Nothing throws when that
       happens and the panel is still perfectly correct in the DOM, which is why it is asserted here: the
       panel must open under the bar wherever the reader has scrolled to, and be on screen when it does. */
    await page.evaluate(() => { document.querySelector("#bkTocPanel").hidden = true; window.scrollTo(0, 2400); });
    await page.waitForTimeout(400);
    const tocDeep = await page.evaluate(() => {
      document.querySelector("#bkToc").click();
      const p = document.querySelector("#bkTocPanel").getBoundingClientRect();
      const bar = document.querySelector(".bk-bar").getBoundingClientRect();
      return {
        y: Math.round(window.scrollY),
        gap: Math.round(p.top - bar.bottom),          // hangs off the bar's own bottom edge
        onScreen: p.top >= 0 && p.top < window.innerHeight,
        fits: p.height <= window.innerHeight - bar.bottom + 1,
      };
    });
    check("...opening under the bar however far the reader has scrolled",
      tocDeep.y > 1000 && tocDeep.gap >= 0 && tocDeep.gap <= 14 && tocDeep.onScreen, JSON.stringify(tocDeep));
    check("...and fitting in what is left of the screen below it", tocDeep.fits, JSON.stringify(tocDeep));
    await page.evaluate(() => { window.scrollTo(0, 0); });
    await page.waitForTimeout(300);

    await page.evaluate(() => { [...document.querySelectorAll(".bk-toc-item")].find((t) => t.dataset.ch === "40").click(); });
    await page.waitForTimeout(600);
    const jumped = await page.evaluate(() => ({
      on: [...document.querySelectorAll(".bk-tab.on")].map((t) => t.dataset.ch).join(","),
      tocShut: document.querySelector("#bkTocPanel").hidden,
    }));
    check("a contents entry jumps to its chapter and closes the list", jumped.on === "40" && jumped.tocShut, JSON.stringify(jumped));

    // back to the shelf
    await page.evaluate(() => document.querySelector("#bkBack").click());
    await page.waitForTimeout(600);
    const backToShelf = await page.evaluate(() => ({ hash: location.hash, tiles: document.querySelectorAll(".book-tile").length }));
    check("the back link returns to the shelf", /library/.test(backToShelf.hash) && backToShelf.tiles > 0, JSON.stringify(backToShelf));

    const resumed = await page.evaluate(() => (document.querySelector(".bk-tile-resume") || {}).textContent || "");
    check("...and the tile now says where the reader got to", /letter\s+40/i.test(resumed), resumed);
    await page.close();
  }

  {
    const page = await browser.newPage({ viewport: PHONE });
    await watch(page);
    await page.goto(base + "#book/" + bookHref, { waitUntil: "load" });
    await page.waitForTimeout(2600);
    const ph = await page.evaluate(() => {
      const bar = document.querySelector(".bk-bar").getBoundingClientRect();
      const prose = document.querySelector(".bk-prose").getBoundingClientRect();
      const doc = document.documentElement;
      return {
        barW: Math.round(bar.width), vw: window.innerWidth,
        proseW: Math.round(prose.width),
        overflow: doc.scrollWidth > doc.clientWidth + 1,
        titleShown: getComputedStyle(document.querySelector(".bk-tab-t")).display,
        libTab: !!document.querySelector('.tabbar .tab[data-route="library"]'),
        labels: [...document.querySelectorAll(".tabbar .tab")].filter((t) => t.checkVisibility())
          .map((t) => { const l = t.querySelector(".tab-label"); return { w: Math.round(l.getBoundingClientRect().width), need: l.scrollWidth }; }),
      };
    });
    check("[phone] the book page never scrolls sideways", !ph.overflow);
    check("[phone] the chapter bar fits the screen", ph.barW <= ph.vw, JSON.stringify({ bar: ph.barW, vw: ph.vw }));
    check("[phone] chapter titles give way to their numbers", ph.titleShown === "none", ph.titleShown);
    check("[phone] the Library is reachable from the tab bar", ph.libTab);
    check("[phone] ...and no tab label is clipped by the extra cell",
      ph.labels.every((l) => l.w >= l.need - 1), JSON.stringify(ph.labels));
    await page.close();
  }

  /* ================= 6. the original beside the translation =================
     Almost everything here fails SILENTLY, which is why it is worth the assertions. A second column
     that never appears looks like a book with no original; a column paired one section out looks like
     a bilingual page and is worse than not having one, because a reader trusts it; and a tap gesture
     that fires on a glossary link takes the language away instead of opening the term. */
  console.log("\n6. The original beside the translation");
  {
    const page = await browser.newPage({ viewport: DESK });
    await watch(page);
    await page.goto(base + "#book/" + bookHref, { waitUntil: "load" });
    await page.waitForTimeout(2500);

    // THE LAZINESS: the original is its own file and must not ride in with the translation
    check("the original is not fetched until it is asked for",
      !asked.some((u) => /\.la\.js$/.test(u)), asked.filter((u) => /\.la\.js$/.test(u)).join(","));
    check("...and there is a control to ask for it", !!(await page.$("#bkLang")));

    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "9"); t.click(); });
    await page.waitForTimeout(500);
    check("a chapter reads as one column until then", (await page.$$(".bk-row")).length === 0);

    await page.evaluate(() => document.querySelector("#bkLang").click());
    await page.waitForTimeout(3000);
    check("asking for it fetches it", asked.some((u) => /\.la\.js$/.test(u)));

    const bi = await page.evaluate(() => {
      const box = document.querySelector(".bk-bi");
      const rows = [...document.querySelectorAll(".bk-row")];
      const r1 = document.querySelector(".bk-row[data-sec='1']");
      const a = r1.querySelector(".bk-col-en").getBoundingClientRect();
      const b = r1.querySelector(".bk-col-or").getBoundingClientRect();
      return {
        mode: box.dataset.lang,
        rows: rows.length,
        // the numbered sections, as each column reports them — this is the pairing itself
        secs: rows.filter((r) => r.dataset.sec).map((r) => r.dataset.sec),
        enMarks: rows.filter((r) => r.dataset.sec).map((r) => {
          const m = r.querySelector(".bk-col-en .bk-n"); return m ? m.textContent.trim() : "";
        }),
        orMarks: rows.filter((r) => r.dataset.sec).map((r) => {
          const m = r.querySelector(".bk-col-or .bk-n"); return m ? m.textContent.trim() : "";
        }),
        sideBySide: b.x > a.x + 100 && Math.abs(a.y - b.y) < 4,
        orLang: r1.querySelector(".bk-col-or").getAttribute("lang"),
        tips: { en: document.querySelectorAll(".bk-col-en .ttip").length, or: document.querySelectorAll(".bk-col-or .ttip").length },
      };
    });
    check("a wide screen sets the two languages side by side", bi.mode === "both" && bi.sideBySide,
      JSON.stringify({ mode: bi.mode, sideBySide: bi.sideBySide }));
    check("...as a row per section", bi.rows > 3, String(bi.rows));
    /* THE PAIRING, asserted from the RENDERED text rather than from the row's own data-sec — which
       would only be checking the label against itself. Each column's own section marker must be the
       number the row claims, in both languages: that is what makes the two cells the same passage. */
    check("...each row holding the SAME section number in both languages",
      bi.secs.length > 2 && bi.secs.every((s, i) => bi.enMarks[i] === s && bi.orMarks[i] === s),
      JSON.stringify({ secs: bi.secs, en: bi.enMarks, or: bi.orMarks }).slice(0, 200));
    check("...with the original marked as its own language", bi.orLang === "la", bi.orLang);
    /* The glossary is an ENGLISH glossary of prehistory and geography, and its keys collide with plain
       Latin words far harder than with English ones. Measured on letter 9, which carries terms; letter
       1 carries none, so the same check there would pass on nothing. */
    check("the glossary is linked through the translation only",
      bi.tips.en > 0 && bi.tips.or === 0, JSON.stringify(bi.tips));

    /* Two works, two licences, two boxes. The Latin is out of copyright by AGE and Gummere's English
       by its date of publication, and running the two together is how the distinction that decides
       what may be shelved here gets lost. It is also asserted because it failed silently once: the
       front matter is built when the page is set up, and the original's box comes from a file that
       lands later, so it has to be rebuilt on paint rather than once. */
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "0"); t.click(); });
    await page.waitForTimeout(600);
    const fm = await page.evaluate(() => [...document.querySelectorAll(".bk-rights")].map((s) => s.textContent));
    check("the front matter states the grounds for the translation AND for the original",
      fm.length === 2 && fm.some((s) => /Gummere/i.test(s)) && fm.some((s) => /Latin/i.test(s) && /public domain/i.test(s)),
      JSON.stringify(fm.map((s) => s.slice(0, 60))));
    await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "9"); t.click(); });
    await page.waitForTimeout(500);

    // a narrow screen shows ONE language — two columns of prose in 390px is two unreadable ones
    await page.setViewportSize(PHONE);
    await page.waitForTimeout(400);
    const narrow = await page.evaluate(() => {
      const r = document.querySelector(".bk-row[data-sec='1']");
      return {
        mode: document.querySelector(".bk-bi").dataset.lang,
        en: r.querySelector(".bk-col-en").offsetHeight,
        or: r.querySelector(".bk-col-or").offsetHeight,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      };
    });
    check("[phone] the same setting shows one language, not two columns",
      narrow.mode === "or" && narrow.en === 0 && narrow.or > 0, JSON.stringify(narrow));
    check("[phone] ...and the page still never scrolls sideways", !narrow.overflow);

    /* TAPPING THE PAGE TURNS IT OVER, and lands on the SAME SECTION — the reason the whole thing is
       paired on section numbers rather than on scroll offsets. The Latin runs about seven tenths the
       length of the English, so a switch that restored the pixel position would land further from the
       reader's sentence the deeper into the chapter they had got; the assertion is therefore that the
       section is the same AND that the scroll actually had to move to keep it. */
    await page.evaluate(() => window.scrollTo(0, 1400));
    await page.waitForTimeout(300);
    const nearestSec = () => page.evaluate(() => {
      const eye = window.scrollY + window.innerHeight * 0.35;
      let best = null;
      document.querySelectorAll(".bk-row").forEach((r) => {
        if (!r.offsetHeight) return;
        const top = r.getBoundingClientRect().top + window.scrollY;
        if (!best || Math.abs(top - eye) < Math.abs(best.top - eye)) best = { sec: r.dataset.sec, top: top };
      });
      return { sec: best && best.sec, y: window.scrollY, mode: document.querySelector(".bk-bi").dataset.lang };
    });
    /* One press of a finger, start to finish. `n` presses in a row makes a double tap; `dx` makes it a
       swipe. Dispatched as real PointerEvents rather than through page.touchscreen because the handler
       is on the page element and keys off pointerType. */
    const tapOn = (sel, n, dx) => page.evaluate(([s, n, dx]) => {
      const el = document.querySelector(s);
      const r = el.getBoundingClientRect();
      for (let i = 0; i < (n || 1); i++) {
        const base = { bubbles: true, cancelable: true, isPrimary: true, pointerType: "touch", pointerId: 1 };
        el.dispatchEvent(new PointerEvent("pointerdown", Object.assign({ clientX: r.x + 4, clientY: r.y + 4 }, base)));
        el.dispatchEvent(new PointerEvent("pointerup", Object.assign({ clientX: r.x + 4 + (dx || 0), clientY: r.y + 4 }, base)));
      }
    }, [sel, n, dx]);

    /* A SINGLE tap must NOT turn the page (Aug 2026, on request). This is the half of the change that
       fails silently: if the double tap regresses to a single one every assertion below still passes,
       because a double tap contains a single one — so the cheap gesture is asserted NOT to fire first. */
    const beforeTap = await nearestSec();
    await tapOn(".bk-col-or p:not(.bk-salut)", 1);
    await page.waitForTimeout(500);
    check("[phone] a SINGLE tap leaves the language alone",
      (await nearestSec()).mode === "or", (await nearestSec()).mode);

    await tapOn(".bk-col-or p:not(.bk-salut)", 2);
    await page.waitForTimeout(500);
    const afterTap = await nearestSec();
    check("[phone] a DOUBLE tap turns the page over to the other language",
      afterTap.mode === "en", afterTap.mode);
    check("[phone] ...landing on the same section the reader was on",
      afterTap.sec === beforeTap.sec && !!beforeTap.sec, "before " + beforeTap.sec + ", after " + afterTap.sec);
    check("[phone] ...which took a real scroll correction, the two lengths differing",
      afterTap.y !== beforeTap.y, beforeTap.y + " → " + afterTap.y);

    /* THE FRONT MATTER HAS NOTHING TO TURN TO (Aug 2026, on request). Chapter 0 is written here, in
       English, about this edition; it has no facing original. The double tap used to flip the stored
       preference there anyway, which is the worst shape of bug this file exists to catch — nothing on
       screen changed (applyLangMode finds no .bk-bi to switch), so the reader's NEXT real chapter opened
       in a language they had not asked for and could not see themselves asking for. Both halves are
       asserted, because they fail in opposite directions: the gesture must do nothing here, and it must
       still work one chapter along. */
    {
      const stored = () => page.evaluate(() => String(localStorage.getItem("folio_book_orig_v1")));
      await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "0"); t.click(); });
      await page.waitForTimeout(600);
      const was = await stored();
      await tapOn(".bk-prose", 2);
      await page.waitForTimeout(500);
      check("[phone] a double tap on the front matter changes nothing", (await stored()) === was, was + " → " + (await stored()));
      const btn = await page.evaluate(() => {
        const b2 = document.querySelector("#bkLang");
        return b2 ? { there: true, dead: b2.disabled, why: b2.title } : { there: false };
      });
      check("[phone] ...and the language control is greyed rather than gone, saying why",
        btn.there && btn.dead && /English only/i.test(btn.why || ""), JSON.stringify(btn));
      await page.evaluate(() => { const t = [...document.querySelectorAll(".bk-tab")].find((x) => x.dataset.ch === "9"); t.click(); });
      await page.waitForTimeout(700);
      await tapOn(".bk-col-en p:not(.bk-salut), .bk-prose", 2);
      await page.waitForTimeout(600);
      check("[phone] ...while a real chapter still turns over", (await stored()) !== was, was + " → " + (await stored()));
      // put the reader back on the language this section's later assertions expect
      if ((await page.evaluate(() => document.querySelector(".bk-bi").dataset.lang)) !== "en") {
        await tapOn(".bk-col-or p:not(.bk-salut), .bk-prose", 2);
        await page.waitForTimeout(600);
      }
    }

    // ...but a double tap on something that already does something keeps doing it
    const tip = await page.$(".bk-col-en .ttip");
    if (tip) {
      await tapOn(".bk-col-en .ttip", 2);
      await page.waitForTimeout(300);
      check("[phone] a tap on a glossary term does NOT turn the page",
        (await page.evaluate(() => document.querySelector(".bk-bi").dataset.lang)) === "en");
      await page.evaluate(() => document.querySelectorAll(".gloss-win").forEach((w) => w.remove()));
    }

    /* SWIPE BETWEEN CHAPTERS (Aug 2026, on request). Two things to pin, and the second is the one that
       breaks quietly: a swipe must step the chapter, and it must NOT also register as half a double tap
       — the two gestures end in the same pointerup and are told apart only by how far the finger moved. */
    const chapNow = () => page.evaluate(() => {
      const t = document.querySelector(".bk-tab.on");
      return { ch: t && t.dataset.ch, lang: document.querySelector(".bk-bi") ? document.querySelector(".bk-bi").dataset.lang : null };
    });
    const beforeSwipe = await chapNow();
    await tapOn(".bk-prose", 1, -120);              // a firm swipe left
    await page.waitForTimeout(600);
    const afterSwipe = await chapNow();
    check("[phone] swiping left moves to the next chapter",
      afterSwipe.ch && +afterSwipe.ch === +beforeSwipe.ch + 1, beforeSwipe.ch + " → " + afterSwipe.ch);
    await tapOn(".bk-prose", 1, 120);               // …and back
    await page.waitForTimeout(600);
    check("[phone] swiping right moves back",
      (await chapNow()).ch === beforeSwipe.ch, beforeSwipe.ch + " → " + (await chapNow()).ch);
    check("[phone] ...and two swipes are not read as a double tap",
      (await chapNow()).lang === afterSwipe.lang, "language changed under the swipes");
    // a short drag is a scroll that wandered, not a swipe
    await tapOn(".bk-prose", 1, -30);
    await page.waitForTimeout(500);
    check("[phone] a short sideways drag does not change the chapter",
      (await chapNow()).ch === beforeSwipe.ch, (await chapNow()).ch);

    /* …AND THE STEP IS A SLIDE, NOT A CUT (Aug 2026, on request). Measured MID-FLIGHT, because the
       finished state of a slide and the finished state of a cut are the same chapter in the same place —
       an assertion made after it settles would pass on a hard swap for ever. The panel leaves the way the
       finger went (a swipe left → it goes left, and the next one arrives from the right), and the stage
       clips horizontally while it moves so the travel cannot be scrolled into. */
    const flight = await page.evaluate(async () => {
      const el = document.querySelector(".bk-page"), r0 = el.getBoundingClientRect().left;
      const base = { bubbles: true, cancelable: true, isPrimary: true, pointerType: "touch", pointerId: 1 };
      const p = document.querySelector(".bk-prose"), r = p.getBoundingClientRect();
      p.dispatchEvent(new PointerEvent("pointerdown", Object.assign({ clientX: r.x + 4, clientY: r.y + 4 }, base)));
      p.dispatchEvent(new PointerEvent("pointerup", Object.assign({ clientX: r.x + 4 - 120, clientY: r.y + 4 }, base)));
      await new Promise((rs) => setTimeout(rs, 90));
      const out = document.querySelector(".bk-page").getBoundingClientRect().left;
      const clip = getComputedStyle(document.querySelector(".stage")).overflowX;
      await new Promise((rs) => setTimeout(rs, 120));         // past the midpoint: the new chapter is painted
      const inn = document.querySelector(".bk-page").getBoundingClientRect().left;
      await new Promise((rs) => setTimeout(rs, 600));
      const el2 = document.querySelector(".bk-page");
      return { r0: r0, out: out, in: inn, clip: clip,
               settled: el2.getBoundingClientRect().left,
               clipEnd: getComputedStyle(document.querySelector(".stage")).overflowX };
    });
    check("[phone] the outgoing chapter moves the way the finger went", flight.out < flight.r0 - 4,
      flight.r0 + " → " + flight.out);
    check("[phone] ...and the next one comes in from the other side", flight.in > flight.r0 + 4,
      flight.r0 + " → " + flight.in);
    check("[phone] ...with the stage clipped while it travels, and released after",
      flight.clip === "clip" && flight.clipEnd !== "clip", flight.clip + " → " + flight.clipEnd);
    check("[phone] ...and it lands where a chapter belongs", Math.abs(flight.settled - flight.r0) < 2,
      flight.r0 + " → " + flight.settled);
    await tapOn(".bk-prose", 1, 120);               // …and back to where the assertions below expect it
    await page.waitForTimeout(700);

    /* …and the same swipe as a REAL touch, which is a different test and the reason it is here (Aug 2026,
       on a report that the swipe did nothing on a phone). Everything above dispatches PointerEvents by
       hand, which bypasses the browser's own gesture arbitration and so completes every time. A real
       finger does not: under the default touch-action the browser claims the drag for scrolling the moment
       it passes the slop and fires POINTERCANCEL, pointerup never arrives, and the handler — which
       measures the gesture at pointerup — can never see one. The swipe was broken this way for its whole
       life and every synthetic assertion above passed throughout. `.page` carries `touch-action:pan-y
       pinch-zoom` for it; nothing in JS can substitute, so this is asserted through CDP touch input.
       The two that follow are the other halves: a vertical drag must still SCROLL (that one really is a
       scroll, and pan-y is what keeps it), and the chapter bar must still pan sideways under its own
       finger, since a touch-action that reached into it would take a nested scroller away. */
    const cdp = await page.context().newCDPSession(page);
    const realSwipe = async (x0, y0, dx, dy) => {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0, id: 1 }] });
      for (let i = 1; i <= 6; i++) {
        await page.waitForTimeout(25);
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + dx * i / 6, y: y0 + (dy || 0) * i / 6, id: 1 }] });
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(700);
    };
    await realSwipe(320, 500, -170);
    const afterReal = await chapNow();
    check("[phone] a REAL touch swipe steps the chapter, not just a synthesised one",
      afterReal.ch && +afterReal.ch === +beforeSwipe.ch + 1, beforeSwipe.ch + " → " + afterReal.ch);
    await realSwipe(80, 500, 170);
    check("[phone] ...and back the other way",
      (await chapNow()).ch === beforeSwipe.ch, beforeSwipe.ch + " → " + (await chapNow()).ch);
    /* The chapter bar goes FIRST of the two below, and the order is not arbitrary: a touch that lands
       while an earlier fling is still running is spent stopping it, so a bar pan measured straight after
       the vertical drag reads as a few pixels of scroll and fails on the wrong grounds. */
    const barPans = await page.evaluate(() => {
      const t = document.querySelector("#bkTabs");
      t.scrollTo({ left: 0, behavior: "auto" });
      return t.scrollWidth > t.clientWidth + 4;
    });
    if (barPans) {
      await page.waitForTimeout(600);
      const bar = await page.evaluate(() => { const r = document.querySelector("#bkTabs").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
      const chBefore = (await chapNow()).ch;
      await realSwipe(bar.x + bar.w - 25, bar.y + bar.h / 2, -220);
      check("[phone] ...and the chapter bar still pans sideways under its own finger",
        (await page.evaluate(() => document.querySelector("#bkTabs").scrollLeft)) > 80,
        String(await page.evaluate(() => document.querySelector("#bkTabs").scrollLeft)));
      check("[phone] ...without that pan also stepping a chapter",
        (await chapNow()).ch === chBefore, chBefore + " → " + (await chapNow()).ch);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await realSwipe(200, 620, 0, -300);
    check("[phone] ...while a vertical drag still scrolls the chapter",
      (await page.evaluate(() => window.scrollY)) > 100, String(await page.evaluate(() => window.scrollY)));
    await cdp.detach();

    // the choice is remembered — it is a way of reading, not a per-chapter accident
    await page.evaluate(() => document.querySelector("#bkLang").click());
    await page.waitForTimeout(400);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(3000);
    check("[phone] the reader's choice survives a reload",
      (await page.evaluate(() => { const b = document.querySelector(".bk-bi"); return b && b.dataset.lang; })) === "or");
    await page.close();
  }

  /* ================= 7. the switch is a crossfade, not a cut =================
     A regression here is silent in the worst way: the languages still swap, the reader still lands on
     the right passage, and every assertion above still passes — the switch just goes back to being the
     jump it was. So the fade is measured rather than looked at, by sampling the prose's own opacity
     across the press.

     The second assertion is the one that catches a DRIFT rather than a removal: the JS holds the swap
     for BK_FADE and the CSS fades for its own duration, and if those two come apart the reader sees
     the change happen — a flash of the old language at half opacity — which is worse than the cut. It
     is checked by asserting that the first frame carrying the NEW language is a dark one. */
  console.log("\n7. Turning the page over is a crossfade");
  {
    const page = await browser.newPage({ viewport: DESK });
    await watch(page);
    await page.goto(base + "#book/seneca-letters", { waitUntil: "networkidle" });
    await page.evaluate(() => document.querySelectorAll(".bk-tab")[9].click());
    await page.waitForTimeout(300);
    await page.click("#bkLang");                       // first press fetches the original and repaints
    await page.waitForTimeout(2500);

    // every frame for 700ms from the moment of the press: the prose's opacity and which language it holds
    const frames = await page.evaluate(() => new Promise((done) => {
      const seen = [], t0 = performance.now();
      const tick = () => {
        const el = document.querySelector("#bkPage .bk-prose");
        seen.push({ o: el ? +getComputedStyle(el).opacity : null, mode: el ? el.dataset.lang : null });
        if (performance.now() - t0 < 700) requestAnimationFrame(tick); else done(seen);
      };
      document.querySelector("#bkLang").click();
      tick();
    }));
    const min = Math.min(...frames.map((f) => f.o));
    const swap = frames.find((f) => f.mode !== frames[0].mode);
    const rises = frames.filter((f, i) => i && f.o > frames[i - 1].o + 0.02).length;
    check("the prose fades right down rather than cutting", min < 0.05, "min opacity " + min);
    check("...the swap itself happens while nothing is visible",
      !!swap && swap.o < 0.1, swap ? "opacity " + swap.o + " at the swap" : "the language never changed");
    check("...and it comes back over several frames, not in one",
      rises >= 4, rises + " rising frames");
    check("...ending fully visible", frames[frames.length - 1].o > 0.95, String(frames[frames.length - 1].o));
    await page.close();

    // a reader who has asked for less motion is not made to wait out a fade they will not see
    const still = await browser.newPage({ viewport: DESK, reducedMotion: "reduce" });
    await watch(still);
    await still.goto(base + "#book/seneca-letters", { waitUntil: "networkidle" });
    await still.evaluate(() => document.querySelectorAll(".bk-tab")[9].click());
    await still.waitForTimeout(300);
    await still.click("#bkLang");
    await still.waitForTimeout(2500);
    const t0 = Date.now();
    await still.click("#bkLang");
    const mode = await still.evaluate(() => document.querySelector(".bk-bi").dataset.lang);
    const op = await still.evaluate(() => +getComputedStyle(document.querySelector(".bk-prose")).opacity);
    check("[reduced motion] the switch is immediate, not held for a fade",
      mode === "en" && Date.now() - t0 < 120, mode + " after " + (Date.now() - t0) + "ms");
    check("[reduced motion] ...and nothing is left faded out", op > 0.95, String(op));
    await still.close();
  }

  await browser.close();
  server.close();

  /* styles.css @imports the Google Fonts stylesheet, which no sandbox reaches — every run reports a
     handful of connection resets that say nothing about this code. Filtered by the same reasoning the
     other suites filter favicon/manifest noise: a real fault in the Library would name a file in it. */
  const real = errs.filter((e) => !/favicon|manifest|sw\.js|ServiceWorker|fonts\.(googleapis|gstatic)|ERR_CONNECTION_RESET|ERR_NAME_NOT_RESOLVED/i.test(e));
  check("no console errors anywhere", real.length === 0, real.slice(0, 3).join(" | "));

  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
