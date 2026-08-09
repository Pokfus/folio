// The media source gate: nothing Folio shows is saved without a credit line.
//
// The editors save on every keystroke, so a picture URL pasted in and then forgotten about used to ship
// credited to nobody — the one mistake that stays invisible until someone else points it out. The gate
// (wireMediaSource in app.js) holds a typed URL OUT of the store while the source box is empty, says so
// where it was typed, and asks for the source the moment the URL field is left.
//
// What is worth guarding: an uncredited URL really is absent from the store (not merely marked); it is
// still shown to the author, flagged, so the gate reads as "not yet" rather than "nothing happened";
// giving a source commits the whole object at once; clearing the source takes it back out; and the rule
// holds on all four surfaces — card image, card video, curated glossary, Studio term.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-media-source.js
//   FOLIO_CHROMIUM=<path to chrome>   if Chromium lives outside the playwright package
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const PIC = "https://example.org/pic.jpg";
const YT = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
// queueAdminSave is debounced ~350ms — never read the overlay sooner than this
const SETTLE = 700;

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    /* SERVE A data.js WITH NO CARD PICTURES.  This whole file is about the gate that stands between
       a pasted URL and the store, so every check needs a card that starts with an empty media panel.
       It used to name `wh-002` and rely on that card shipping none, which stopped being true the day
       the picture pass ran — and it failed at the third assertion with nine confusing failures behind
       it rather than saying "that card has a picture now".  Stripping them here makes the test a test
       of the GATE at any corpus size, the same move test-i18n-lang.js makes on app.js. */
    if (p === "/data.js") data = Buffer.from(stripCardImages(data.toString("utf8")), "utf8");
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
});

function stripCardImages(src) {
  const win = {};
  new Function("window", src)(win);
  /* …except `wh-046`, which section 2 needs: the other half of this test is that a picture already
     in the store, with its source, is untouched by the gate.  Strip every one and there is nothing
     left to prove that with. */
  win.CARD_DATA.forEach((c) => { if (c.id !== "wh-046") delete c.image; delete c.video; });
  return "window.CARD_DATA = [\n" + win.CARD_DATA.map((c) => JSON.stringify(c)).join(",\n") + "\n];\n" +
    "window.COLLECTION_TREE = " + JSON.stringify(win.COLLECTION_TREE) + ";\n";
}

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
}
// Set a field the way a keystroke does. page.fill() can land on a box the URL keystroke has only just
// revealed, before the panel has settled, and the value never reaches the input.
async function typeInto(page, sel, value) {
  await page.evaluate((a) => {
    const el = document.querySelector(a.sel);
    if (el) { el.value = a.value; el.dispatchEvent(new Event("input", { bubbles: true })); }
  }, { sel: sel, value: value });
  await page.waitForTimeout(SETTLE);
}
async function dismissPrompt(page) {
  if (await page.locator(".inline-prompt").count()) { await page.locator(".inline-prompt .ip-cancel").click(); await page.waitForTimeout(250); }
}
async function openCard(page, id) {
  await page.evaluate((cid) => { const el = document.querySelector('[data-open="' + cid + '"]'); if (el) el.click(); }, id);
  await page.waitForTimeout(700);
}
const cardDelta = (page, id, key) => page.evaluate((a) => {
  const c = (JSON.parse(localStorage.getItem("folio_admin_v1") || "{}").cards || {})[a.id];
  return c ? (c[a.key] || null) : null;
}, { id: id, key: key });

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push("pageerror: " + e));
  page.on("console", (m) => { if (m.type() === "error" && !/ERR_|net::|Failed to load/.test(m.text())) errs.push("console: " + m.text()); });

  /* ---------- 1. the curated card editor, on a card that ships no picture ---------- */
  await page.goto(base + "#admin", { waitUntil: "load" });
  await page.waitForTimeout(1400);
  // the editor opens on the Dashboard tab now — ask for Cards, as a reader would
  await page.evaluate(() => { const t = document.querySelector('.admin-tab[data-atab="cards"]'); if (t) t.click(); });
  await page.waitForTimeout(600);
  await openCard(page, "wh-002");
  check("the card editor has one media panel", await page.locator("#cesMediaPanel").count() === 1);
  await page.locator("#cesMediaSlot").first().click();
  await page.waitForTimeout(300);
  check("clicking the slot opens it", await page.locator("#cesMediaPanel").isVisible());
  check("title/description/source are hidden until a URL is typed", !(await page.locator("#cesMediaMeta").isVisible()));

  await typeInto(page, '[data-mediafield="src"]', PIC);
  check("an uncredited URL is NOT written to the store", (await cardDelta(page, "wh-002", "image")) === null);
  check("...but the panel says so, where it was typed", await page.locator("#cesMediaPanel .af-reqnote").isVisible());
  check("...and the picture is still shown, flagged as unsaved", await page.locator("#cesMediaSlot .ces-media-pending").count() === 1);
  check("...with a legible flag rather than a silent outline", await page.locator("#cesMediaSlot .ces-media-flag").isVisible());
  check("...and the source box is now reachable", await page.locator("#cesMediaMeta").isVisible());

  // leaving the URL field asks for the source outright. `change` is dispatched by hand because typeInto
  // sets the value programmatically, and a browser only fires change for a value a person edited.
  await page.evaluate(() => { document.querySelector('[data-mediafield="src"]').dispatchEvent(new Event("change", { bubbles: true })); });
  await page.waitForTimeout(400);
  check("leaving the URL field asks for a source", await page.locator(".inline-prompt").isVisible());
  await dismissPrompt(page);
  check("declining leaves it pending", await page.locator("#cesMediaPanel .af-reqnote").isVisible());
  check("...and still unsaved", (await cardDelta(page, "wh-002", "image")) === null);

  // navigating away warns rather than losing it in silence
  await page.evaluate(() => { location.hash = "#home"; });
  await page.waitForTimeout(500);
  check("navigating away warns that nothing was saved", /without a source/i.test((await page.locator("#toast").textContent().catch(() => "")) || ""));
  await page.evaluate(() => { location.hash = "#admin"; });
  await page.waitForTimeout(900);
  await openCard(page, "wh-002");
  await page.locator("#cesMediaSlot").first().click();
  await page.waitForTimeout(300);
  check("the uncredited URL really was dropped", (await page.locator('[data-mediafield="src"]').inputValue()) === "");

  // the notice's own button asks again, and an answer saves the whole object at once
  await typeInto(page, '[data-mediafield="src"]', PIC);
  await dismissPrompt(page);
  await page.locator("#cesMediaPanel .afr-btn").click();
  await page.waitForTimeout(350);
  await page.locator(".inline-prompt .ip-input").fill("Wikimedia Commons, public domain");
  await page.locator(".inline-prompt .ip-ok").click();
  await page.waitForTimeout(SETTLE);
  let img = await cardDelta(page, "wh-002", "image");
  check("answering saves the URL", !!(img && img.src === PIC), JSON.stringify(img));
  check("...together with its source", !!(img && img.credit === "Wikimedia Commons, public domain"));
  check("...and the answer lands in the source box too", (await page.locator('[data-mediafield="credit"]').inputValue()) === "Wikimedia Commons, public domain");
  check("the notice clears once it is credited", !(await page.locator("#cesMediaPanel .af-reqnote").isVisible()));
  check("...and so does the unsaved flag", await page.locator("#cesMediaSlot .ces-media-pending").count() === 0);

  // and the rule holds in reverse: taking the source away takes the picture with it
  await typeInto(page, '[data-mediafield="credit"]', "");
  img = await cardDelta(page, "wh-002", "image");
  check("clearing the source takes the picture back out of the store", !(img && img.src), JSON.stringify(img));
  check("...and says so", await page.locator("#cesMediaPanel .af-reqnote").isVisible());
  await typeInto(page, '[data-mediafield="src"]', "");
  check("clearing the URL leaves nothing pending", !(await page.locator("#cesMediaPanel .af-reqnote").isVisible()));

  /* ---------- 2. a shipped, credited picture is untouched by any of this ---------- */
  await openCard(page, "wh-046");   // the one shipped card that carries an image
  check("a shipped picture still renders", await page.locator("#cesMediaSlot .card-img img").count() === 1);
  check("...unflagged, because it carries a source", await page.locator("#cesMediaSlot .ces-media-pending").count() === 0);

  /* ---------- 3. a VIDEO link in the same one box ---------- */
  // the gate does not care which of the two stores the URL is bound for — but the modal's wording does, and
  // so does the store it is held out of
  await openCard(page, "wh-003");
  await page.locator("#cesMediaSlot").first().click();
  await page.waitForTimeout(300);
  await typeInto(page, '[data-mediafield="src"]', YT);
  await dismissPrompt(page);
  check("an uncredited video is held back too", await page.locator("#cesMediaPanel .af-reqnote").isVisible());
  check("...named as a video, not as an image", /video/i.test(await page.locator("#cesMediaPanel .afr-txt").textContent()));
  check("...and is absent from the store", (await cardDelta(page, "wh-003", "video")) === null);
  await typeInto(page, '[data-mediafield="credit"]', "An archive");
  const vid = await cardDelta(page, "wh-003", "video");
  check("crediting it saves it as a video", !!(vid && vid.src === YT && vid.credit === "An archive"), JSON.stringify(vid));
  await typeInto(page, '[data-mediafield="src"]', "");
  await page.waitForTimeout(300);

  /* ---------- 4. the curated glossary editor ---------- */
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /^glossary$/i.test(x.textContent.trim()));
    if (b) b.click();
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const r = document.querySelector("[data-gkey]"); if (r) r.click(); });
  await page.waitForTimeout(600);
  const glossImg = () => page.evaluate(() => {
    const o = JSON.parse(localStorage.getItem("folio_admin_v1") || "{}").glossaryImages || {};
    const k = Object.keys(o).find((x) => o[x] && o[x].src);
    return k ? o[k] : null;
  });
  await typeInto(page, '[data-gimgfield="src"]', PIC);
  await dismissPrompt(page);
  check("a term's uncredited picture is held back", await page.locator(".gloss-imgpanel .af-reqnote").first().isVisible());
  check("...and is absent from the glossaryImages overlay", (await glossImg()) === null);
  await typeInto(page, '[data-gimgfield="credit"]', "British Museum");
  const gi = await glossImg();
  check("crediting it saves it", !!(gi && gi.src === PIC && gi.credit === "British Museum"), JSON.stringify(gi));
  check("...and the term's popup preview shows it", await page.locator("#adminGlossPreview .gloss-imgslot .card-img").count() === 1);
  await typeInto(page, '[data-gimgfield="src"]', "");

  /* ---------- 5. the Studio's term form — a deck author forgets as easily, and may publish ---------- */
  await page.evaluate(() => { localStorage.removeItem("folio_admin_v1"); });
  await page.goto(base + "#studio", { waitUntil: "load" });
  await page.waitForTimeout(1100);
  const made = await page.evaluate(async () => {
    const b = [...document.querySelectorAll("button")].find((x) => /new deck/i.test(x.textContent || ""));
    if (!b) return false;
    b.click();
    await new Promise((r) => setTimeout(r, 500));
    const inp = document.querySelector(".inline-prompt .ip-input");
    if (inp) { inp.value = "Gate deck"; document.querySelector(".inline-prompt .ip-ok").click(); }
    await new Promise((r) => setTimeout(r, 900));
    const g = [...document.querySelectorAll("button")].find((x) => /^\s*glossary\s*$/i.test(x.textContent || "") || x.dataset.tab === "gloss");
    if (g) g.click();
    await new Promise((r) => setTimeout(r, 500));
    const add = document.querySelector("#stAddTerm");
    if (!add) return false;
    add.click();
    await new Promise((r) => setTimeout(r, 500));
    const i2 = document.querySelector(".inline-prompt .ip-input");
    if (i2) { i2.value = "Flint"; document.querySelector(".inline-prompt .ip-ok").click(); }
    await new Promise((r) => setTimeout(r, 900));
    return !!document.querySelector('[data-gimg="src"]');
  });
  check("the Studio term form is reachable", made);
  if (made) {
    const deckTermImg = () => page.evaluate(() => new Promise((res) => {
      const rq = indexedDB.open("folio-community");
      rq.onsuccess = () => {
        const all = rq.result.transaction("decks").objectStore("decks").getAll();
        all.onsuccess = () => {
          const d = all.result[0] || {};
          const t = (d.gloss || {}).Flint || {};
          res(t.image || null);
        };
      };
      rq.onerror = () => res(null);
    }));
    await typeInto(page, '[data-gimg="src"]', PIC);
    await dismissPrompt(page);
    check("a deck term's uncredited picture is held back", await page.locator(".gloss-imgpanel .af-reqnote").first().isVisible());
    check("...and never reaches the deck store", !((await deckTermImg()) || {}).src);
    await typeInto(page, '[data-gimg="credit"]', "A museum");
    const dt = await deckTermImg();
    check("crediting it saves it into the deck", !!(dt && dt.src === PIC && dt.credit === "A museum"), JSON.stringify(dt));
  }

  check("no console/page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
