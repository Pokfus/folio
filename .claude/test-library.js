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
  const watch = (p) => {
    p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    p.on("pageerror", (e) => errs.push(String(e)));
  };

  /* ================= 1. the rename ================= */
  console.log("\n1. Collections — the page that used to be called Library");
  {
    const page = await browser.newPage({ viewport: DESK });
    watch(page);
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
    check("...and the decks tab now reads Collections",
      d.tabs.some((t) => t.r === "decks" && /^collections$/i.test(t.l)), JSON.stringify(d.tabs));
    await page.close();
  }

  /* ================= 2. the shelf, and the book staying lazy ================= */
  console.log("\n2. The shelf — and the text that must not load with it");
  let bookHref = "";
  {
    asked.length = 0;
    const page = await browser.newPage({ viewport: DESK });
    watch(page);
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
      note: (document.querySelector(".lib-note") || {}).textContent || "",
    }));
    check("the shelf shows a tile per book", d.tiles.length >= 1, JSON.stringify(d.tiles.map((t) => t.id)));
    check("...naming the work and its author", /Letters from a Stoic/i.test(d.tiles[0].title) && /Seneca/i.test(d.tiles[0].author), JSON.stringify(d.tiles[0]));
    check("...saying how long it is", /\d+\s+letters/i.test(d.tiles[0].meta), d.tiles[0].meta);
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
    check("the page states the rule that decides what may be shelved", /copyright/i.test(d.note) && /translation/i.test(d.note), d.note.slice(0, 90));
    check("...and STILL no book text has been fetched", !asked.some((u) => u.startsWith("/books/")), asked.filter((u) => u.startsWith("/books/")).join(","));
    bookHref = d.tiles[0].id;

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
    watch(page);
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
        gloss: document.querySelectorAll(".bk-prose .ttip").length,
      };
    });
    check("the translator's notes render as a numbered fold", n.items >= 3, String(n.items));
    check("...labelled Notes, not Sources", /notes/i.test(n.label), n.label);
    check("...shut by default, since a chapter is long", n.shut);
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
    const leak = shippedBookLeaks();
    check("no note carries Wikisource's own stylesheet as text",
      leak.n > 0 && !leak.notes.length, JSON.stringify({ chapters: leak.n, bad: leak.notes.slice(0, 6) }));
    check("...nor does any chapter's prose", leak.n > 0 && !leak.html.length, JSON.stringify(leak.html.slice(0, 6)));
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
       book and assert no lowercase surface was ever linked. */
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
    watch(page);
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
    watch(page);
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
    watch(page);
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
