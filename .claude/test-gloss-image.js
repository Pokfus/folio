// Glossary images. A term can carry an illustration ({ src, title, desc, credit }, the same shape as a
// card image); it renders at the FOOT of the term's popup and opens the SHARED fullscreen viewer. The
// two things worth guarding are that the viewer stacks above the popup it was opened from (it is opened
// from inside one, unlike a card image), and that a community deck's own term images are sanitized on
// ingest like every other field a stranger can write.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-gloss-image.js
//   FOLIO_CHROMIUM=<path to chrome>   if Chromium lives outside the playwright package
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
// a 4x4 PNG, inline, so the test never depends on the network
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAFElEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC";
const HTTP_IMG = "https://example.org/plate.png";

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

// Close popups through the UI. Yanking the node out of the DOM leaves it in the app's own glossWins
// list, and the next open then finds a "matching" detached window and does nothing.
async function closeGloss(page) {
  while (await page.locator(".gloss-win .gloss-close").count()) {
    await page.locator(".gloss-win .gloss-close").first().click();
    await page.waitForTimeout(280);
  }
}
/* ---- a glossary popup, and a study card, without the home page's discovery row ----
   The Term-of-the-day and Card-of-the-day tiles were the convenient way in here until Aug 2026, when the
   whole discovery row was removed on request (from the phone first, then from the desktop). What replaces
   them is the route a reader actually takes: start the daily review, reveal the answer, and click a
   glossary link in the card's background. It stays inside ONE document — hash navigation and clicks, never
   page.goto — which matters in these files because they mutate window.GLOSSARY / GLOSSARY_SOURCES in the
   page first, and a reload would throw those mutations away. */
/* A collection has to be IN the daily review before there is a card to open: the first-run hero routes to
   the collections now (Aug 2026, on request) rather than adding one on the reader's behalf. Done through
   the page's own + and inside this ONE document, like everything else here — a reload would throw away
   the GLOSSARY mutations this file makes. The `.added` test makes a second call a no-op. */
async function ensureReviewDeck(page) {
  await page.evaluate(() => { location.hash = "decks"; });
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const b = document.querySelector("#collection-list-all .collection-add[data-id]");
    if (b && !b.classList.contains("added")) b.click();
  });
  await page.waitForTimeout(200);
}
async function openStudyCard(page) {
  await ensureReviewDeck(page);
  await page.evaluate(() => { location.hash = "home"; });
  await page.waitForTimeout(450);
  await page.evaluate(() => { const b = document.querySelector("#b-review"); if (b) b.click(); });
  await page.waitForTimeout(1000);
}
async function openAnyGloss(page) {
  await closeGloss(page);
  if (!(await page.locator(".ttip").count())) {
    await openStudyCard(page);
    if (await page.locator("#reveal-btn").count()) { await page.click("#reveal-btn"); await page.waitForTimeout(500); }
  }
  await page.locator(".ttip").first().click();
  await page.waitForTimeout(450);
}
async function openGlossEditor(page, base) {
  await page.goto(base + "#admin", { waitUntil: "load" });
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /^glossary$/i.test(x.textContent.trim()));
    if (b) b.click();
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => { const r = document.querySelector("[data-gkey]"); if (r) r.click(); });
  await page.waitForTimeout(400);
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage();
  // the Collections page raises a first-visit card over itself (Aug 2026); nothing here is about it
  await page.addInitScript(() => { try { localStorage.setItem("folio_collections_tour_v1", "1"); } catch (e) {} });
  const errs = [];
  page.on("pageerror", (e) => errs.push("pageerror: " + e));
  page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text()); });

  /* ---------- 1. the popup renders a term's image, last ---------- */
  await page.goto(base, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.GLOSSARY && Object.keys(window.GLOSSARY).length > 0);
  await page.evaluate((src) => {
    Object.keys(window.GLOSSARY).forEach((k) => {
      window.GLOSSARY_IMAGES[k] = { src: src, title: "A test plate", desc: "Something depicted.", credit: "https://example.org/plate" };
    });
  }, PNG);
  await openAnyGloss(page);

  check("a glossary popup opened", await page.locator(".gloss-win").count() === 1);
  const fig = page.locator(".gloss-win .gloss-imgslot .card-img");
  check("the popup carries the term's image", await fig.count() === 1);
  const order = await page.evaluate(() => [...document.querySelector(".gloss-win .gloss-body").children].map((e) => e.className));
  // it floats to the top-right, so it must come FIRST in the body for the prose to wrap down its left
  check("the image is first in the popup body", String(order[0]).includes("gloss-imgslot"), order.join(" | "));
  const box = await page.evaluate(() => {
    const slot = document.querySelector(".gloss-win .gloss-imgslot");
    const body = document.querySelector(".gloss-win .gloss-body");
    const desc = document.querySelector(".gloss-win .gloss-desc");
    const cs = getComputedStyle(body);
    const inner = body.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    return {
      float: getComputedStyle(slot).float,
      imgH: document.querySelector(".gloss-win .gloss-imgslot img").getBoundingClientRect().height,
      imgW: document.querySelector(".gloss-win .gloss-imgslot img").getBoundingClientRect().width,
      // shown WHOLE within its limits (Aug 2026, on request) — so the rendered box has to keep the file's
      // own proportions, which is what `object-fit:contain` and an auto height buy
      fit: getComputedStyle(document.querySelector(".gloss-win .gloss-imgslot img")).objectFit,
      natW: document.querySelector(".gloss-win .gloss-imgslot img").naturalWidth,
      natH: document.querySelector(".gloss-win .gloss-imgslot img").naturalHeight,
      w: slot.getBoundingClientRect().width, inner: inner,
      slotTop: slot.getBoundingClientRect().top, descTop: desc.getBoundingClientRect().top,
      // the first IN-FLOW block of the body: a float is out of flow, so this must start level with the
      // picture's top rather than below it — which is the whole of "the prose runs down its left"
      flowTop: (() => { const f = [...body.children].find((e) => !e.classList.contains("gloss-imgslot")); return f ? f.getBoundingClientRect().top : null; })(),
      slotRight: slot.getBoundingClientRect().right, bodyRight: body.getBoundingClientRect().right,
      slotBottom: slot.getBoundingClientRect().bottom,
      padR: parseFloat(cs.paddingRight),
    };
  });
  check("the image floats right", box.float === "right", box.float);
  /* 150px and half the popup are the picture's MAXIMUM, not its shape (Aug 2026, on request). It used to be
     a fixed 150px height with `object-fit:cover`, which gave every popup one silhouette at the cost of
     cutting the sides off anything wider than half of it — and a map or a wide landscape is exactly what a
     glossary term carries. So what is checked now is the LIMITS and the PROPORTIONS. */
  check("...no taller than its 150px limit", box.imgH <= 151, box.imgH);
  check("...never wider than half the popup", box.w <= box.inner / 2 + 1, box.w + " of " + box.inner);
  check("...and shown whole rather than cropped to fill the frame",
    box.fit === "contain" && box.natW > 0 &&
    Math.abs(box.imgW / box.imgH - box.natW / box.natH) < 0.05,
    JSON.stringify({ fit: box.fit, shown: [box.imgW, box.imgH], natural: [box.natW, box.natH] }));
  check("...pinned to the top-right with the body's padding",
    Math.abs(box.bodyRight - box.slotRight - box.padR) < 1.5, box.bodyRight - box.slotRight);
  /* It is a FLOAT, so the body's first in-flow block starts LEVEL with the picture and runs down its left.
     This used to be measured as "the description begins above slotTop + 150px", which passed for the wrong
     reason — the float was 150px tall whatever the picture was. With the height now the picture's own, the
     only meaningful test is that the prose is not pushed down at all. */
  check("the prose starts beside it, not below it",
    box.flowTop !== null && box.flowTop <= box.slotTop + 2,
    "first block " + box.flowTop + " vs image top " + box.slotTop);
  check("the figure is a focusable button, like a card image",
    await page.evaluate(() => { const f = document.querySelector(".gloss-win .card-img"); return f.getAttribute("role") === "button" && f.tabIndex === 0; }));

  /* ---------- 2. it opens the SHARED fullscreen viewer, above the popup ---------- */
  await fig.click();
  await page.locator(".img-viewer").waitFor({ timeout: 5000 });
  check("clicking the image opens the fullscreen viewer", await page.locator(".img-viewer").count() === 1);
  const zs = await page.evaluate(() => ({
    v: +getComputedStyle(document.querySelector(".img-viewer")).zIndex,
    g: +getComputedStyle(document.querySelector(".gloss-win")).zIndex,
  }));
  // the popup's own z-index is bumped on every focus; focusGlossWin renormalizes before it can reach the viewer's layer
  check("the viewer stacks above the popup", zs.v > zs.g, "viewer " + zs.v + " > popup " + zs.g);
  const cap = await page.evaluate(() => ({
    t: (document.querySelector(".iv-title") || {}).textContent,
    d: (document.querySelector(".iv-desc") || {}).textContent,
    c: (document.querySelector(".iv-credit a") || {}).href,
  }));
  check("the viewer shows the image title", cap.t === "A test plate", cap.t);
  check("the viewer shows the image description", cap.d === "Something depicted.", cap.d);
  check("a URL source becomes a link", cap.c === "https://example.org/plate", cap.c);

  await page.locator(".iv-stage").hover();
  await page.mouse.wheel(0, -400);
  await page.waitForTimeout(300);
  const zoomed = await page.evaluate(() => document.querySelector(".iv-img").style.transform);
  const zf = (zoomed.match(/scale\(([\d.]+)\)/) || [])[1];
  check("wheel-zoom works in the viewer", zf && parseFloat(zf) > 1, zoomed);

  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  check("Escape closes the viewer", await page.locator(".img-viewer").count() === 0);
  check("...and leaves the popup open underneath", await page.locator(".gloss-win").count() === 1);

  /* ---------- 3. a term with no image renders nothing ---------- */
  await page.evaluate(() => { window.GLOSSARY_IMAGES = {}; });
  await openAnyGloss(page);
  check("a term without an image renders no figure", await page.locator(".gloss-win .gloss-imgslot .card-img").count() === 0);
  check("...and the empty slot is hidden", await page.evaluate(() => document.querySelector(".gloss-win .gloss-imgslot").hidden));

  /* ---------- 4. the curated editor: panel, live preview, overlay delta, reload ---------- */
  await openGlossEditor(page, base);
  check("the glossary editor has an image URL field", await page.locator('[data-gimgfield="src"]').count() === 1);
  check("title/description/source are hidden until a URL is set", !(await page.locator('[data-gimgfield="title"]').isVisible()));

  await page.fill('[data-gimgfield="src"]', PNG);
  await page.waitForTimeout(250);
  check("...and appear once a URL is set", await page.locator('[data-gimgfield="title"]').isVisible());
  // the source gate: a URL with no credit line is STAGED, not stored, so nothing can ship uncredited
  if (await page.locator(".inline-prompt").count()) await page.locator(".inline-prompt .ip-cancel").click();
  await page.waitForTimeout(200);
  check("an uncredited URL is held back", await page.locator(".gloss-imgpanel .af-reqnote").first().isVisible());
  check("...and is not written to the overlay", await page.evaluate(() => {
    const o = JSON.parse(localStorage.getItem("folio_admin_v1") || "{}");
    return !Object.keys(o.glossaryImages || {}).some((k) => o.glossaryImages[k] && o.glossaryImages[k].src);
  }));
  await page.fill('[data-gimgfield="title"]', "Editor plate");
  await page.fill('[data-gimgfield="credit"]', "Test source");
  await page.waitForTimeout(700);
  check("...and saves as soon as a source is given", !(await page.locator(".gloss-imgpanel .af-reqnote").first().isVisible()));
  check("the popup preview shows the image live", await page.locator("#adminGlossPreview .gloss-imgslot .card-img").count() === 1);

  const stored = await page.evaluate(() => {
    const o = JSON.parse(localStorage.getItem("folio_admin_v1") || "{}");
    const k = Object.keys(o.glossaryImages || {})[0];
    return { k: k, v: k ? o.glossaryImages[k] : null };
  });
  check("the edit is recorded as a glossaryImages overlay delta", !!(stored.v && stored.v.title === "Editor plate"), JSON.stringify(stored.v));
  check("the term counts as edited (Revert is offered)", await page.locator("#adminRevert").isVisible());

  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => !!window.GLOSSARY);
  check("the overlay re-applies on reload",
    await page.evaluate((k) => (window.GLOSSARY_IMAGES[k] || {}).title, stored.k) === "Editor plate");

  await openGlossEditor(page, base);
  await page.fill('[data-gimgfield="src"]', "");
  await page.waitForTimeout(700);
  check("clearing the URL removes the image", await page.evaluate((k) => !window.GLOSSARY_IMAGES[k], stored.k));
  check("...and the delta is dropped, back to shipped state",
    await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("folio_admin_v1") || "{}").glossaryImages || {}).length === 0));

  /* ---------- 5. a community deck's own term images ---------- */
  const deckFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "folio-gimg-")), "d.folio-deck.json");
  fs.writeFileSync(deckFile, JSON.stringify({
    folioDeck: 1,
    meta: { id: "imgdeck1", title: "Image deck", glossMode: "own", language: "en", version: 1 },
    // the card's own answer term is never auto-linked in its background, so the glossary term is a different word
    cards: [{ id: "u_imgdeck1_1", question: 'A <span class="blank">_____</span> sits here.', answer: "Gadget", answerText: "Gadget", abstract: "A widget is a thing worth knowing about." }],
    gloss: {
      Widget: { title: "Widget", desc: "A thing.", tags: ["object"], image: { src: HTTP_IMG, title: "Plate", desc: "A plate.", credit: "Someone" } },
      Evil: { title: "Evil", desc: "Nope.", image: { src: "javascript:alert(1)", title: "x" } },
    },
  }));
  await page.goto(base + "#studio", { waitUntil: "load" });
  await page.waitForTimeout(900);
  const chooser = page.waitForEvent("filechooser");
  await page.click("#stImport");
  (await chooser).setFiles(deckFile);
  await page.waitForTimeout(900);
  const titles = await page.evaluate(() => [...document.querySelectorAll(".sd-title")].map((e) => e.textContent));
  check("the deck imported", titles.includes("Image deck"), JSON.stringify(titles));

  const openDeckGloss = async () => {
    await page.evaluate(() => {
      const r = [...document.querySelectorAll(".studio-deck-open")].find((x) => /Image deck/.test(x.textContent || ""));
      if (r) r.click();
    });
    await page.waitForTimeout(500);
    await page.click('[data-tab="gloss"]');
    await page.waitForTimeout(400);
  };
  await openDeckGloss();
  await page.evaluate(() => { const b = document.querySelector('[data-topen="Widget"]'); if (b) b.click(); });
  await page.waitForTimeout(400);
  check("the Studio term form has an image URL field", await page.locator('[data-gimg="src"]').count() === 1);
  check("an https image survives ingest", await page.inputValue('[data-gimg="src"]') === HTTP_IMG, await page.inputValue('[data-gimg="src"]'));
  check("its metadata survives ingest", await page.inputValue('[data-gimg="title"]') === "Plate");
  check("...including the source", await page.inputValue('[data-gimg="credit"]') === "Someone");

  await page.evaluate(() => { const b = document.querySelector('[data-topen="Evil"]'); if (b) b.click(); });
  await page.waitForTimeout(400);
  check("a javascript: image src is stripped on ingest", await page.inputValue('[data-gimg="src"]') === "", await page.inputValue('[data-gimg="src"]'));
  check("...so its metadata fields stay hidden", !(await page.locator("#stImgMeta").isVisible()));

  await page.evaluate(() => { const b = document.querySelector('[data-topen="Widget"]'); if (b) b.click(); });
  await page.waitForTimeout(400);
  await page.fill('[data-gimg="title"]', "Edited plate");
  await page.waitForTimeout(700);
  await page.goto(base + "#studio", { waitUntil: "load" });
  await page.waitForTimeout(900);
  await openDeckGloss();
  check("a Studio image edit persists", await page.inputValue('[data-gimg="title"]') === "Edited plate", await page.inputValue('[data-gimg="title"]'));

  await page.goto(base + "#decks", { waitUntil: "load" });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const e = document.querySelector(".collection.udeck [data-udeck]"); if (e) e.click(); });
  await page.waitForTimeout(800);
  await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
  await page.waitForTimeout(600);
  const tip = page.locator(".abstract .ttip").first();
  check("the deck's own term auto-links in its card background", await tip.count() === 1);
  if (await tip.count()) {
    await tip.click();
    await page.waitForTimeout(500);
    check("the deck term's popup carries its image", await page.locator(".gloss-win .gloss-imgslot .card-img").count() === 1);
    check("...pointing at the sanitized URL",
      await page.evaluate((u) => { const i = document.querySelector(".gloss-win .card-img img"); return !!i && i.getAttribute("src") === u; }, HTTP_IMG));
  }

  // the remote image host is unreachable from a test box; that failure is the fixture's, not the app's
  const real = errs.filter((e) => !/example\.org|ERR_|manifest\.json|CORS/.test(e));
  check("no console/page errors", real.length === 0, [...new Set(real)].join(" | "));

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
