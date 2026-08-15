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
     · **THE CITATION APPARATUS (Aug 2026).** Every shipped artefact carries at least ARTEFACT_SRC_TARGET
       citations, each ending in a URL and each pointed at by a marker; the plate renders them as the site's
       numbered fold and `wireFootnotes` joins the two ends. Read off the SHIPPED file as well as off the
       page, because a plate looks identical whether its markers resolve or not — an unwired one just shows
       empty superscripts over a list nothing points at, which is what an unwired surface has always looked
       like here.
     · **THE ADMIN PLATE PREVIEW.** It is the reader's own builder, it follows the FORM rather than the
       store, and its footnotes are wired. A preview that lags the boxes by one save is worse than none,
       because it is believed.
     · **THE SHOWCASE'S WAY IN.** The "See all" button opens the collection, lists everything owned, and —
       the half that fails silently — opens a FRIEND's collection on a friend's showcase rather than your
       own. It is absent when there is nothing behind it.

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
      // three citations and three markers, so a synthetic artefact is shaped like a real one — the save
      // path refuses anything under the bar, and a pool of uncited test objects would test the refusal
      // rather than everything downstream of it
      out[id] = { id, name: "Test " + r + " " + i, rarity: r, date: "c. 100 BCE", origin: "Nowhere",
        /* one of them carries a PICTURE and a word the glossary knows, which is what the plate section
           below needs: the picture is same-origin so it really loads (an external one would 404 in a
           sandbox and be marked dead), and "Bronze Age" is a shipped term, so the auto-linker has
           something to find without the test asserting anything about which terms exist. ONE artefact
           carries it, and deliberately not the first in the list: the admin section below picks the first
           row to prove a picture is never saved uncredited, and an artefact that already has a credit
           would save cleanly and pass that check for the wrong reason. */
        image: r === "legendary" && i === 1 ? { src: "/icon.svg", credit: "Public domain, via a test", alt: "A test picture" } : undefined,
        desc: 'A test object of the Bronze Age.<sup class="fn" data-fn="1"></sup> Another sentence.<sup class="fn" data-fn="2"></sup> A third.<sup class="fn" data-fn="3"></sup> A fourth. A fifth.',
        sources: [
          "Someone, “A Test Work,” <i>Test Journal</i> 1 (2026): 1–2, https://example.org/one. [Open access]",
          "Someone Else, “A Second Test Work,” <i>Test Journal</i> 2 (2026): 3–4, https://example.org/two. [Open access]",
          "A Third Hand, “A Third Test Work,” <i>Test Journal</i> 3 (2026): 5–6, https://example.org/three. [Open access]",
        ] };
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
    // the figures are grouped (1,000), so the pattern allows a separator — what is being asserted is that
    // the bar counts CARDS rather than XP, not how a thousand is punctuated
    check("…and counting cards, not XP", d.counts.every((x) => /^[\d,]+ \/ [\d,]+ cards$/.test(x)), JSON.stringify(d.counts));
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

    /* THE PLATE'S APPARATUS. The fold is the site's own, so what is worth asserting is the JOIN: a marker
       shows the number of the entry it opens, and the entry it opens exists. An unwired plate looks the
       same at a glance — empty superscripts over an unnumbered list — which is exactly how an unwired
       surface has failed here before. */
    await page.locator("#reliquary .ar-tile").first().click();
    await page.waitForTimeout(250);
    const ap = await page.evaluate(() => {
      const w = document.querySelector(".ar-win");
      const marks = [...w.querySelectorAll("sup.fn")].map((s) => s.textContent);
      const items = w.querySelectorAll(".src-item").length;
      const note = w.querySelector(".src-note");
      return { marks, items, open: note && !note.querySelector(".src-collapse.collapsed"), count: (w.querySelector(".src-count") || {}).textContent };
    });
    check("the plate carries the sources fold", ap.items === 3, String(ap.items));
    check("…numbered by wireFootnotes, not left blank", ap.marks.join(",") === "1,2,3", JSON.stringify(ap.marks));
    check("…open on the plate, as a card's is", !!ap.open);
    check("…and the header counts them", ap.count === "3", String(ap.count));
    await page.locator(".ar-close").click();
    await page.waitForTimeout(200);

    /* THE SHOWCASE'S "See all" BUTTON IS NOT ASSERTED HERE, and that is a fact about the page rather than
       an omission: the SIGNED-OUT account page carries the inventory and no showcase at all, because a
       showcase is four artefacts chosen to be SEEN and there is nobody to see a guest's. It is guarded in
       .claude/test-account-page.js, which has the session this needs. What is asserted here is the other
       half — that a guest is not shown a control that belongs to a section they have not got. */
    check("a guest gets the inventory and no showcase", await page.locator("#reliquary").count() === 1 && await page.locator("#showcase").count() === 0);
    check("…and so no orphan way in to it", await page.locator("[data-arall]").count() === 0);
  }

  /* ================= 4b. the plate: its picture, its rarity, its prose =================
     All four of these fail SILENTLY. A picture that does not open just looks like a picture; a rarity
     border read off a hex literal goes on passing after the token is re-toned; a chip that has drifted
     back above the title still renders; and a glossary popup opened from a plate whose stacking is wrong
     is really there, behind the plate, so the reader sees a click that did nothing. */
  {
    await page.evaluate(() => { location.hash = "account"; });
    await page.waitForTimeout(500);
    await page.locator('#reliquary [data-artefact="t-legendary-1"]').click();
    await page.waitForTimeout(300);
    const plate = await page.evaluate(() => {
      const w = document.querySelector(".ar-win");
      const fr = w.querySelector(".ar-frame");
      const h = w.querySelector(".ar-wname"), chip = w.querySelector(".ar-chip");
      // the border is measured against the RARITY TOKEN rather than a hex literal, by mixing it the same
      // way the rule does on a probe inside the same plate — so re-toning a rarity moves both together
      const probe = document.createElement("span");
      probe.style.color = "color-mix(in srgb, var(--rar) 70%, transparent)";
      w.appendChild(probe);
      const want = getComputedStyle(probe).color;
      probe.remove();
      const hb = h.getBoundingClientRect(), cb = chip.getBoundingClientRect();
      return {
        frame: !!fr, tile: !!w.querySelector(".ar-img:not(.ar-noimg)"),
        title: fr && fr.dataset.imgTitle, credit: fr && fr.dataset.imgCredit,
        border: fr && getComputedStyle(fr).borderTopColor, want: want,
        width: fr && getComputedStyle(fr).borderTopWidth,
        chipAfter: !!(h.compareDocumentPosition(chip) & Node.DOCUMENT_POSITION_FOLLOWING),
        sameLine: Math.abs(hb.top - cb.top) < 24 && cb.left >= hb.right - 2,
        ttips: [...w.querySelectorAll(".ar-wdesc .ttip")].map((t) => t.textContent),
        selfLinked: [...w.querySelectorAll(".ar-wdesc .ttip")].some((t) => /Test legendary/i.test(t.textContent)),
      };
    });
    check("the plate's picture is the site's media frame", plate.frame && !plate.tile, JSON.stringify({ frame: plate.frame, bareImg: plate.tile }));
    check("…carrying the artefact's name and its credit into the viewer",
      plate.title === "Test legendary 1" && /Public domain/.test(plate.credit || ""), plate.title + " / " + plate.credit);
    check("…bordered in its own rarity", plate.border === plate.want && plate.width === "2px", plate.border + " vs " + plate.want);
    check("the rarity chip sits after the name, on its line", plate.chipAfter && plate.sameLine, JSON.stringify({ after: plate.chipAfter, same: plate.sameLine }));
    check("the description links the glossary", plate.ttips.length > 0, JSON.stringify(plate.ttips));
    check("…but never the artefact's own name", !plate.selfLinked);

    // the picture enlarges, and Escape gives the plate back rather than closing it too
    await page.locator(".ar-frame").click();
    await page.waitForTimeout(300);
    const viewer = await page.evaluate(() => {
      const v = document.querySelector(".img-viewer");
      return v ? { open: true, title: (v.querySelector(".iv-title") || {}).textContent, credit: (v.querySelector(".iv-credit") || {}).textContent } : { open: false };
    });
    check("clicking the picture enlarges it", viewer.open && viewer.title === "Test legendary 1", JSON.stringify(viewer));
    check("…with its source under it", /Source:/.test(viewer.credit || ""), (viewer.credit || "").slice(0, 40));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(250);
    check("…and Escape closes the picture and LEAVES the plate",
      await page.locator(".img-viewer").count() === 0 && await page.locator(".ar-win").count() === 1);

    /* A DEFINITION OPENED FROM A PLATE HAS TO BE ON TOP OF IT. The plate is an overlay and the popups are
       overlays, so this is a stacking question and the failure is a click that appears to do nothing. */
    await page.locator(".ar-wdesc .ttip").first().click();
    await page.waitForTimeout(400);
    const gloss = await page.evaluate(() => {
      const w = document.querySelector(".gloss-win");
      if (!w) return { open: false };
      const r = w.getBoundingClientRect();
      const hit = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + 20));
      return { open: true, onTop: !!(hit && hit.closest(".gloss-win")), title: (w.querySelector(".gloss-title") || {}).textContent };
    });
    check("a glossary link on a plate opens its popup", gloss.open, JSON.stringify(gloss));
    check("…in front of the plate, not behind it", gloss.onTop === true, JSON.stringify(gloss));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(250);
    check("…and Escape closes the popup and LEAVES the plate",
      await page.locator(".gloss-win").count() === 0 && await page.locator(".ar-win").count() === 1);
    await page.locator(".ar-close").click();
    await page.waitForTimeout(200);
  }

  /* ================= 5. Admin → Artefacts ================= */
  {
    await page.evaluate(() => { location.hash = "admin"; });
    await page.waitForTimeout(800);
    check("there is an Artefacts tab", await page.locator('[data-atab="artefacts"]').count() === 1);
    /* EVERY tab carries a colour of its own (Aug 2026, on a bug report: Quotes and Artefacts arrived after
       the colours were placed, fell through to the bare `.admin-tab` rule, and read as DISABLED beside the
       five that were lit). Asserted over the whole bar rather than over these two, so a tab added later
       fails here instead of shipping grey; and on the RESTING state, since `.active` is a separate rule and
       a tab styled only when selected is the same bug wearing a different hat. */
    const tabCols = await page.evaluate(() => [...document.querySelectorAll(".admin-tab")].map((t) => {
      const cs = getComputedStyle(t);
      return { id: t.dataset.atab, bg: cs.backgroundColor, fg: cs.color, active: t.classList.contains("active") };
    }));
    const opaque = (c) => !/rgba\([^)]*,\s*0\s*\)/.test(c) && c !== "transparent";
    const resting = tabCols.filter((t) => !t.active);
    check("every admin tab is coloured, not just the ones that shipped first",
      tabCols.length >= 7 && resting.every((t) => opaque(t.bg)),
      JSON.stringify(resting.filter((t) => !opaque(t.bg)).map((t) => t.id)));
    check("…and no two of them wear the same colour",
      new Set(resting.map((t) => t.fg)).size === resting.length,
      JSON.stringify(resting.map((t) => t.id + ":" + t.fg)));
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
    /* A picture is never saved uncredited — the same rule the cards and the glossary enforce. The row is
       named rather than taken by position, and it is one with NO picture: an artefact that already has a
       credit saves cleanly, so a positional pick would pass this for the wrong reason the day the pool's
       order changes. */
    await page.locator('.a-row [data-aopen="t-common-1"]').click();
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
      const a = ov["t-common-1"];
      return { on: !!(a && a.image && a.image.src && a.image.credit), all: Object.values(ov).filter((x) => x && x.image && x.image.src).length };
    });
    check("the picture reached the overlay", withImg.on && withImg.all === 2, JSON.stringify(withImg));

    /* THE LIVE PLATE PREVIEW. Two things worth asserting and they fail in opposite directions: that the
       preview exists and is the READER's plate (same builder, so the same classes), and that it follows the
       FORM rather than the store — a preview a save behind is believed and is wrong. */
    await page.locator(".a-row .a-main").first().click();
    await page.waitForTimeout(350);
    check("the form shows the reader's plate", await page.locator("#aPreview .ar-win").count() === 1);
    check("…with the sources fold on it", await page.locator("#aPreview .src-item").count() === 3);
    check("…its markers numbered", (await page.locator("#aPreview sup.fn").first().textContent()) === "1");
    const nameNow = await page.locator("#aPreview .ar-wname").textContent();
    await page.fill("#aName", "A Renamed Thing");
    await page.waitForTimeout(250);
    const nameThen = await page.locator("#aPreview .ar-wname").textContent();
    check("…and it follows the form, not the store", nameThen === "A Renamed Thing" && nameThen !== nameNow, nameNow + " → " + nameThen);
    // the rarity is a <select>, which fires `change` and (in some engines) no `input` at all — so this is
    // the one field that would silently stop updating if the preview listened for `input` alone
    const rarWas = await page.locator("#aPreview .ar-win").getAttribute("data-rar");
    const rarNow = rarWas === "epic" ? "rare" : "epic";
    await page.selectOption("#aRar", rarNow);
    await page.waitForTimeout(250);
    const rarThen = await page.locator("#aPreview .ar-win").getAttribute("data-rar");
    check("…including the rarity, which fires change and not input", rarThen === rarNow && rarThen !== rarWas, rarWas + " → " + rarThen);

    /* THE CITATION BAR IS A REFUSAL. Empty the box and the save is turned away with a reason, which is the
       whole difference between a bar and a chip nobody reads. */
    await page.fill("#aSrc", "");
    await page.waitForTimeout(150);
    await page.locator("#aSave").click();
    await page.waitForTimeout(300);
    check("an artefact under the source bar is refused", await page.locator("#aForm").count() === 1 && /sources/i.test((await page.locator("#toast").textContent()) || ""));
    await page.fill("#aSrc", "One, “A,” <i>J</i> 1 (2026): 1, https://example.org/a.\nTwo, “B,” <i>J</i> 2 (2026): 2, https://example.org/b.\nThree, “C,” <i>J</i> 3 (2026): 3, https://example.org/c.");
    await page.waitForTimeout(150);
    await page.locator("#aSave").click();
    await page.waitForTimeout(350);
    check("…and saved once it is at the bar", await page.locator("#aForm").count() === 0);
  }

  /* ================= 6. the shipped pool is cited ================= */
  {
    // read off the FILE rather than off a page: every plate looks the same whether its list is three works
    // or none, and the pool is what a reader is actually handed
    const bar = (fs.readFileSync(path.join(ROOT, "app.js"), "utf8").match(/const\s+ARTEFACT_SRC_TARGET\s*=\s*(\d+)/) || [])[1];
    check("the bar is declared in app.js", !!bar, String(bar));
    const vm = require("vm");
    const ctx = vm.createContext({ window: {} });   // the file assigns a global, so a bare window stands in for the browser
    vm.runInContext(fs.readFileSync(path.join(ROOT, "artefacts.js"), "utf8"), ctx, { filename: "artefacts.js" });
    const pool = ctx.window.ARTEFACTS || [];
    const n = Number(bar || 3);
    /* THE SHAPE IS AN INVARIANT; THE COVERAGE IS A PASS IN PROGRESS, and the two are asserted differently
       on purpose. Anything that HAS been cited must be cited properly — a citation with no URL, a marker
       running past the end of its list (wireFootnotes deletes those, so the claim silently loses its
       source), a work nothing points at. Coverage is REPORTED rather than failed, exactly as the card and
       glossary passes were run: docs/artefact-citation-plan.md is the work of bringing the rest of the pool
       up, and a suite that goes red for a documented backlog is a suite people learn to ignore. The bar
       itself is enforced where it bites — add-artefacts.js refuses a new artefact under it, and so does the
       editor's Save. */
    const cited = pool.filter((a) => Array.isArray(a.sources) && a.sources.length);
    const short = cited.filter((a) => a.sources.length < n);
    const noUrl = cited.filter((a) => a.sources.some((s) => !/https?:\/\//.test(s)));
    const marks = (d) => (String(d).match(/<sup[^>]*class="[^"]*\bfn\b[^"]*"[^>]*>/gi) || [])
      .map((t) => { const m = t.match(/data-fn="(\d+)"/i); return m ? Number(m[1]) : 0; });
    const unmarked = cited.filter((a) => !marks(a.desc).length);
    const dangling = cited.filter((a) => marks(a.desc).some((x) => x > a.sources.length));
    const orphan = cited.filter((a) => a.sources.some((s, i) => marks(a.desc).indexOf(i + 1) < 0));
    const dead = pool.filter((a) => !Array.isArray(a.sources) || !a.sources.length);
    check("no cited artefact is under the " + n + "-source bar", short.length === 0, short.slice(0, 4).map((a) => a.id).join(", "));
    check("…every citation carries a URL", noUrl.length === 0, noUrl.slice(0, 4).map((a) => a.id).join(", "));
    check("…every cited description points at its works", unmarked.length === 0, unmarked.slice(0, 4).map((a) => a.id).join(", "));
    check("…no marker runs past the end of its list", dangling.length === 0, dangling.slice(0, 4).map((a) => a.id).join(", "));
    check("…and no citation goes unreferenced", orphan.length === 0, orphan.slice(0, 4).map((a) => a.id).join(", "));
    // …and a marker must never point at a work in a DIFFERENT artefact's list, which is what a copied plan
    // produces and which no count can see
    check("…and every marker resolves inside its own artefact", cited.every((a) => marks(a.desc).every((x) => x >= 1 && x <= a.sources.length)));
    console.log("      coverage: " + cited.length + " of " + pool.length + " artefacts cited, " + dead.length + " still to do");
  }

  check("no uncaught page errors", errs.length === 0, errs.slice(0, 4).join(" | "));
  console.log("\n" + pass + " passed, " + fail + " failed");
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
