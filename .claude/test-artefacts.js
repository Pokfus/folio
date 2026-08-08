#!/usr/bin/env node
/* Folio — THE RELIQUARY, the collection banners, and the two colour swaps that went with them.
   ===========================================================================================
   Everything here fails SILENTLY, which is why it is worth a file. A chest that hands back a duplicate
   still opens; a rarity that never comes up still looks like luck; a level cap that has been removed from
   one of its three call sites still lets almost every add through; and a collection banner showing a
   level where it should show progress is a banner, not an error.

   What it guards:

     · **THE ROLL.** A chest never returns something the reader already owns, every rarity is reachable,
       and when the pool is exhausted the chest SAYS so rather than opening on nothing. The first is the
       one a reader would notice and never report — with a small pool it just reads as bad luck.
     · **THE QUEUE.** `S.chests` is a count, not a flag: dismissing an overlay keeps the chest, and opening
       one spends exactly one.
     · **THE SHOWCASE CAP.** Four, and the fifth is refused with a reason rather than silently ignored.
     · **THE COLOUR SWAP, in both directions.** A book's note markers must now be the card's vermilion and
       an undiscovered glossary term must NOT be the ochre a card's blank wears. Asserted as computed
       colours against each other rather than against a literal, so a re-toned token moves both together.
     · **THE COLLECTION BANNER.** An icon where the level numeral was, a studied/total bar where the XP bar
       was, and no level numeral or `.lib-cap` line left anywhere — the last being the deck cap's own
       obituary, since a cap removed from `addActive` but left in the page head reads as still in force.
     · **THE DECK CAP IS GONE.** A reader at level 1 can add every live collection, which is the whole of
       what was asked for and the one assertion that would have caught a half-removal.

   Run:  NODE_PATH=<playwright>/node_modules node .claude/test-artefacts.js
   Env:  FOLIO_CHROMIUM=<path to chrome> if Chromium lives outside the playwright package. */
const path = require("path"), http = require("http"), fs = require("fs");
const { chromium } = require("playwright");
const ROOT = path.join(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
let pass = 0, fail = 0;
const check = (n, ok, extra) => { if (ok) { pass++; console.log("ok    " + n + (extra ? "  " + extra : "")); } else { fail++; console.log("FAIL  " + n + (extra ? "  " + extra : "")); } };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end("nf"); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  res.end(fs.readFileSync(f));
});

// a synthetic pool, planted through the admin overlay exactly as an editor's own artefacts would be —
// eight of each rarity, so "every rarity is reachable" and "no duplicate ever" are both testable in one
// run without depending on how many artefacts happen to ship
const RARS = ["common", "rare", "epic", "legendary"];
function syntheticPool() {
  const out = {};
  RARS.forEach((r) => {
    for (let i = 1; i <= 8; i++) {
      const id = "t-" + r + "-" + i;
      out[id] = { id, name: "Test " + r + " " + i, rarity: r, date: "c. 100 BCE", origin: "Nowhere",
        desc: "A test object. ".repeat(5) };
    }
  });
  return out;
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch(LAUNCH);
  const errs = [];
  // reduced motion, so the chest's rarity-sized wait collapses to a tick and 32 of them can be opened
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !/net::ERR_/.test(t)) errs.push(t); });
  page.on("pageerror", (e) => errs.push(String(e)));
  // the Collections page raises a first-visit card over itself (Aug 2026); nothing here is about it
  await page.addInitScript(() => { try { localStorage.setItem("folio_collections_tour_v1", "1"); } catch (e) {} });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);

  /* ================= 1. the two colour swaps ================= */
  {
    // A BOOK'S markers take the card's vermilion. Compared against a CARD's marker rather than against a
    // hex literal: the point is that the two agree, and a re-toned --zh should move both.
    const cardZh = await page.evaluate(() => {
      const p = document.createElement("p");
      p.innerHTML = '<sup class="fn" data-fn="1"></sup>';
      document.body.appendChild(p);
      const c = getComputedStyle(p.firstChild).color;
      p.remove(); return c;
    });
    const bookFn = await page.evaluate(() => {
      const d = document.createElement("div");
      d.className = "bk-page";
      d.innerHTML = '<p><sup class="fn" data-fn="1"></sup></p><ol class="src-list"><li><span class="src-n src-back">1</span></li></ol>';
      document.body.appendChild(d);
      const marker = getComputedStyle(d.querySelector("sup.fn")).color;
      const back = getComputedStyle(d.querySelector(".src-n.src-back")).color;
      d.remove(); return { marker, back };
    });
    check("a book's note marker is the card's citation vermilion", bookFn.marker === cardZh, bookFn.marker);
    check("…and so is the entry number it jumps back from", bookFn.back === cardZh, bookFn.back);

    // An UNDISCOVERED term is --newterm and must NOT be --ochre, which is what a card's blank wears.
    const t = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      const p = document.createElement("p");
      p.innerHTML = '<span class="ttip" data-k="x" data-new="1">term</span><span class="ttip" data-k="y">seen</span><span class="blank">_____</span>';
      document.body.appendChild(p);
      const out = {
        nw: getComputedStyle(p.children[0]).color,
        seen: getComputedStyle(p.children[1]).color,
        blank: getComputedStyle(p.children[2]).color,
        tokNew: cs.getPropertyValue("--newterm").trim(),
        tokOchre: cs.getPropertyValue("--ochre").trim(),
        hasBknote: !!cs.getPropertyValue("--bknote").trim(),
      };
      p.remove(); return out;
    });
    check("--newterm is declared", !!t.tokNew, t.tokNew);
    check("--bknote is retired, not left beside it", !t.hasBknote);
    check("an undiscovered term is no longer the blank's ochre", t.nw !== t.blank, t.nw + " vs " + t.blank);
    check("…and is still told apart from a term already read", t.nw !== t.seen, t.nw + " vs " + t.seen);
  }

  /* ================= 2. the collection banners ================= */
  {
    await page.evaluate(() => { location.hash = "decks"; });
    await page.waitForTimeout(700);
    const d = await page.evaluate(() => ({
      rows: document.querySelectorAll(".collection-list-all .collection-row, #collection-list-all .collection-row").length,
      icons: document.querySelectorAll("#collection-list-all .collection-row .coll-ic svg").length,
      numerals: document.querySelectorAll(".collection-row .lb-num").length,
      progs: document.querySelectorAll("#collection-list-all .collection-row .deck-prog").length,
      labels: [...document.querySelectorAll("#collection-list-all .collection-row .deck-prog .xp-lvl")].map((e) => e.textContent),
      counts: [...document.querySelectorAll("#collection-list-all .collection-row .deck-prog .xp-count")].map((e) => e.textContent),
      cap: !!document.querySelector(".lib-cap"),
    }));
    check("every live collection carries a subject icon", d.rows > 0 && d.icons === d.rows, d.icons + " of " + d.rows);
    check("…and no level numeral is left on one", d.numerals === 0);
    check("…each with a studied/total bar in its place", d.progs === d.rows);
    check("…labelled as progress rather than as a level", d.labels.length > 0 && d.labels.every((x) => x === "Studied"), JSON.stringify(d.labels));
    check("…and counting cards, not XP", d.counts.every((x) => /^\d+ \/ \d+ cards$/.test(x)), JSON.stringify(d.counts));
    check("the deck-cap line is gone from the page head", !d.cap);

    // THE CAP ITSELF. A level-1 reader (nothing studied) adds every live collection; a cap left in any
    // one of addActive's call sites would stop this at the first or second.
    const added = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("#collection-list-all .collection-row .collection-add")];
      btns.forEach((b) => b.click());
      return { asked: btns.length, on: document.querySelectorAll("#collection-list-all .collection-row .collection-add.added").length };
    });
    check("a level-1 reader may add every live collection", added.asked > 1 && added.on === added.asked, added.on + " of " + added.asked);
  }

  /* ================= 3. the roll ================= */
  {
    await page.evaluate((pool) => {
      const ov = JSON.parse(localStorage.getItem("folio_admin_v1") || "{}");
      ov.artefacts = pool;
      localStorage.setItem("folio_admin_v1", JSON.stringify(ov));
      // retire the two shipped artefacts so the pool is exactly the 32 planted above
      (window.ARTEFACTS || []).forEach((a) => { ov.artefacts[a.id] = null; });
      localStorage.setItem("folio_admin_v1", JSON.stringify(ov));
      const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      s.chests = 40; s.artefacts = {}; s.showcase = [];
      localStorage.setItem("folio_v1", JSON.stringify(s));
    }, syntheticPool());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(700);
    await page.evaluate(() => { location.hash = "account"; });
    await page.waitForTimeout(600);

    const seen = [], rarSeen = {};
    let exhausted = null;
    for (let i = 0; i < 34; i++) {
      const openBtn = await page.locator("#arOpen").count();
      if (!openBtn) break;
      await page.locator("#arOpen").click();
      await page.waitForTimeout(120);
      const hint = await page.locator("#chestHint").textContent();
      if (/every artefact/i.test(hint)) { exhausted = i; await page.evaluate(() => document.querySelector("#chestActs button").click()); break; }
      await page.locator("#chestBtn").click();
      await page.waitForTimeout(260);
      const got = await page.evaluate(() => {
        const r = document.querySelector("#chestReveal");
        return { name: r.querySelector(".chest-name").textContent, rar: r.dataset.rar };
      });
      seen.push(got.name); rarSeen[got.rar] = (rarSeen[got.rar] || 0) + 1;
      // "Close" is always the last action
      await page.evaluate(() => { const b = document.querySelectorAll("#chestActs button"); b[b.length - 1].click(); });
      await page.waitForTimeout(140);
    }
    check("32 chests yielded 32 artefacts", seen.length === 32, String(seen.length));
    check("…and not one duplicate among them", new Set(seen).size === seen.length, new Set(seen).size + " distinct");
    check("…drawn from every rarity", RARS.every((r) => rarSeen[r] > 0), JSON.stringify(rarSeen));
    check("…common the commonest of the four", (rarSeen.common || 0) >= 8, JSON.stringify(rarSeen));
    check("the 33rd chest says the pool is exhausted rather than opening", exhausted === 32, String(exhausted));

    const st = await page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1")));
    check("one chest was spent per artefact", st.chests === 40 - 32, String(st.chests));
    check("…and the inventory holds all 32", Object.keys(st.artefacts).length === 32);
  }

  /* ================= 4. the queue, the inventory, the showcase ================= */
  {
    await page.evaluate(() => { location.hash = "home"; });
    await page.waitForTimeout(500);
    await page.evaluate(() => { location.hash = "account"; });
    await page.waitForTimeout(600);
    // dismissing a chest must not spend it — open, walk away, count
    const before = await page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1")).chests);
    await page.locator("#arOpen").click();
    await page.waitForTimeout(150);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
    const after = await page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1")).chests);
    check("dismissing a chest keeps it", before === after && before > 0, before + " → " + after);
    check("…and Escape really closed it", await page.locator(".chest-pop").count() === 0);

    check("the inventory lists everything owned", await page.locator("#reliquary .ar-tile").count() === 32);
    // the showcase: four, and the fifth is refused out loud
    const pinned = [];
    for (let i = 0; i < 5; i++) {
      await page.locator("#reliquary .ar-tile").nth(i).click();
      await page.waitForTimeout(200);
      const label = await page.locator("#arPin").textContent();
      await page.locator("#arPin").click();
      await page.waitForTimeout(200);
      pinned.push(await page.locator("#arPin").textContent() !== label);
      await page.locator(".ar-close").click();
      await page.waitForTimeout(150);
    }
    check("four artefacts pin", pinned.slice(0, 4).every(Boolean), JSON.stringify(pinned));
    check("…and the fifth is refused", pinned[4] === false);
    const show = await page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1")).showcase);
    check("the showcase holds exactly four", show.length === 4, JSON.stringify(show));
  }

  /* ================= 5. Admin → Artefacts ================= */
  {
    await page.evaluate(() => { location.hash = "admin"; });
    await page.waitForTimeout(800);
    check("there is an Artefacts tab", await page.locator('[data-atab="artefacts"]').count() === 1);
    await page.locator('[data-atab="artefacts"]').click();
    await page.waitForTimeout(500);
    check("it takes the admin area over", await page.locator(".admin.artefacts-mode").count() === 1);
    // the ≤860px panel cap must be lifted for it, or the whole tab is trapped in a 300px scroll box
    await page.setViewportSize({ width: 500, height: 900 });
    await page.waitForTimeout(300);
    const capped = await page.evaluate(() => getComputedStyle(document.querySelector("#adminListItems")).maxHeight);
    check("…with the phone's list cap lifted for it", capped === "none", capped);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(300);
    check("it lists the pool", await page.locator(".a-row").count() === 32);
    // a picture is never saved uncredited — the same rule the cards and the glossary enforce
    await page.locator(".a-row .a-main").first().click();
    await page.waitForTimeout(300);
    await page.fill("#aImg", "https://example.org/thing.jpg");
    await page.locator("#aSave").click();
    await page.waitForTimeout(300);
    check("a picture with no source is refused", await page.locator("#aForm").count() === 1 && /source/i.test((await page.locator("#toast").textContent()) || ""));
    await page.fill("#aCredit", "Someone, CC BY 4.0");
    await page.locator("#aSave").click();
    await page.waitForTimeout(400);
    check("…and saved once it has one", await page.locator("#aForm").count() === 0);
    const withImg = await page.evaluate(() => {
      const ov = JSON.parse(localStorage.getItem("folio_admin_v1")).artefacts;
      return Object.values(ov).filter((a) => a && a.image && a.image.src).length;
    });
    check("the picture reached the overlay", withImg === 1, String(withImg));
  }

  check("no uncaught page errors", errs.length === 0, errs.slice(0, 4).join(" | "));
  console.log("\n" + pass + " passed, " + fail + " failed");
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
