#!/usr/bin/env node
// Regression test for ARTWORK CARDS — the Visual Art collection's own card format, where the picture
// IS the question (Sep 2026, on request).
//
//   node .claude/test-artwork-cards.js
//
// Re-run after touching cardArtSpec / cardArtHTML / cardArtReveal / cardFrontHTML's artwork branch /
// showAnswer's reveal and duplicate-slot drop / IMG_OPEN_SEL / picturePool / gameCardIdSet /
// serializeCardData / revertCard / the .art-shot styles, or after adding an artwork card.
//
// WHY THIS FILE EXISTS. Every fault this format can have RENDERS PERFECTLY:
//  · A leak. A Commons credit routinely reads "Rembrandt, The Night Watch, Rijksmuseum", so a `title`,
//    a `desc`, a `credit` or a `data-img-*` attribute reaching the FRONT of the card answers the
//    question outright — on a card that looks exactly like a working one. It is asserted first.
//  · The alt text. It has to describe the picture without naming it, which is what makes this format
//    reachable by a reader who cannot see it at all; an alt carrying the answer is the leak again in
//    the one place nobody looks.
//  · Two pictures. `buildBack` still emits the background slot (every other surface that draws a back
//    draws it with no front), and the study page drops that copy at the reveal. If the drop stops
//    firing the reader gets the same picture twice and nothing throws.
//  · The pool. An artwork belongs in the PICTURE round and in none of the text-only games, and both
//    halves fail silently: a card missing from the picture pool is a game that simply never deals it,
//    and one that leaks into Multiple Choice is a question with a picture-less answer term.
//
// Playwright is a dev dependency and must NOT be installed into the repo. Install it in a scratch
// folder and run with NODE_PATH=<that>/node_modules; set FOLIO_CHROMIUM if Chromium lives elsewhere.
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const http = require("http"), fs = require("fs"), path = require("path");

const ROOT = path.join(__dirname, "..");
const PORT = 8149;
const MIME = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  cond ? pass++ : fail++;
  console.log((cond ? "ok   " : "FAIL ") + " " + name + (extra !== undefined ? "  " + JSON.stringify(extra).slice(0, 140) : ""));
};
const sect = (s) => console.log("\n== " + s);

/* `picturePool` is a closure variable inside app.js's single IIFE, and the alternative to reaching it
   is sweeping days of the real game until an artwork happens to be dealt — which is a coin toss (six
   artworks in a pool of a hundred), so a sweep that saw none would say nothing at all. The server
   therefore hangs the function on `window` as it serves app.js, and `patchApp` asserts the anchor was
   found: if it is renamed the suite fails loudly here rather than quietly testing an unpatched app. */
const ANCHOR = "  PAGES.picture = function (root) {";
let patched = false;
function patchApp(buf) {
  const src = buf.toString("utf8");
  if (src.indexOf(ANCHOR) < 0) return null;
  patched = true;
  return Buffer.from(src.replace(ANCHOR, "  window.__folioPicturePool = picturePool;\n" + ANCHOR), "utf8");
}
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/^\//, "") || "index.html");
  fs.readFile(p, (e, buf) => {
    if (e) { res.writeHead(404); res.end("not found"); return; }
    if (path.basename(p) === "app.js") { const out = patchApp(buf); if (out) buf = out; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
    res.end(buf);
  });
});

(async () => {
  server.listen(PORT);

  /* ---------- 1. the data and the wiring, with no browser ---------------------------------- */
  sect("1. the cards on disk, and the code that reads them");
  global.window = {}; require(path.join(ROOT, "data.js"));
  const CARDS = global.window.CARD_DATA;
  const art = CARDS.filter((c) => c.artwork === true);
  ok("cards carry `artwork: true`", art.length > 0, art.length + " of " + CARDS.length);

  art.forEach((c) => {
    const img = c.image || {};
    ok(c.id + ": the picture is there and is a link", !!img.src && /^https?:/.test(String(img.src)));
    ok(c.id + ": …and is credited", String(img.credit || "").trim().length > 0);
    /* The alt is the only thing a reader who cannot see the picture is given, so it has to DESCRIBE
       without NAMING. A generic fallback would answer nothing and the answer term would answer
       everything; both are failures and only the second is a leak. */
    const alt = String(img.alt || "");
    ok(c.id + ": …and describes what is depicted", alt.trim().length > 20, alt.slice(0, 60));
    const ansIn = (s) => String(s || "").toLowerCase().indexOf(String(c.answerText || "~~").toLowerCase()) >= 0;
    ok(c.id + ": …without naming the answer", !ansIn(alt), alt.slice(0, 80));
    /* An artwork card asks one short question about a picture, like a map card, and carries no extra
       phrasings: three ways of asking "what is this?" are three ways of asking the same thing. */
    ok(c.id + ": …and offers no extra phrasings", !Array.isArray(c.questions) || c.questions.length === 0);
  });

  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const slice = (name) => { const i = src.indexOf("function " + name + "("); return i < 0 ? "" : src.slice(i, i + 2600); };
  ok("cardFrontHTML puts the picture before the question", /const art = cardArtSpec\(c\);[\s\S]{0,200}cardArtHTML\(art\)/.test(slice("cardFrontHTML")));
  /* THE FRONT IS BARE, AS A STRING. cardArtHTML must emit the src and the alt and nothing else — the
     browser half below reads the rendered card, and this reads the builder, so a leak added to either
     one is caught by the other. */
  const built = slice("cardArtHTML");
  ok("…and the front markup carries no title, credit or desc", !/spec\.title|spec\.credit|spec\.desc/.test(built.split("cardArtReveal")[0]));
  ok("…and no data-img-* attribute", !/data-img-/.test(built.split("function cardArtReveal")[0]));
  ok("cardArtReveal is what adds them", /fig\.classList\.add\("revealed"\)/.test(slice("cardArtReveal")) && /data-img-credit/.test(slice("cardArtReveal")));
  ok("the revealed picture is what the viewer opens", /IMG_OPEN_SEL = ".card-img, .av-flag, .art-shot.revealed"/.test(src));
  ok("gameCardIdSet keeps artworks out of the text-only games", /difficultyOK\(c\) && !cardMapSpec\(c\) && !cardArtSpec\(c\)/.test(src));
  ok("picturePool takes them in", /const c = cardById\(id\), spec = cardArtSpec\(c\);/.test(src) && /const artIds = availableCardIdSet\(\);/.test(src));
  ok("serializeCardData carries `artwork` through", /o\.artwork = true/.test(slice("serializeCardData")));
  ok("revertCard restores it", /\.artwork = p\.artwork/.test(src));

  /* ---------- 2. the card on screen ------------------------------------------------------- */
  sect("2. the front says nothing but the picture");
  const browser = await chromium.launch(process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {});
  const page = await browser.newPage();
  const errs = [];
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
  page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));

  const card = art[0];
  let visit = 0;
  const study = async (id) => {
    await page.addInitScript((cid) => {
      localStorage.setItem("folio_tour_v1", "1");
      sessionStorage.setItem("folio_study_v1", JSON.stringify({ scope: { type: "card", id: cid }, queue: [cid], id: cid, qi: 0, rev: false, studied: 0 }));
    }, id);
    await page.goto("http://localhost:" + PORT + "/?c=" + (++visit) + "#study");
    await page.waitForSelector(".art-shot", { timeout: 20000 });
    await page.waitForFunction(() => !document.querySelector(".page-ghost"), null, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(200);
  };
  await study(card.id);

  const front = await page.evaluate(() => {
    const fig = document.querySelector(".art-shot");
    return { html: fig.outerHTML, cap: !!fig.querySelector("figcaption"), attrs: [...fig.attributes].map((a) => a.name),
             imgs: document.querySelectorAll(".study-card img").length };
  });
  const leaks = [String(card.image.title || ""), String(card.image.credit || ""), String(card.image.desc || ""), String(card.answerText || "")]
    .filter((s) => s.trim().length > 3).filter((s) => front.html.indexOf(s) >= 0);
  ok("nothing on the front names the work", leaks.length === 0, leaks);
  ok("…there is no caption yet", !front.cap);
  ok("…and no data-img-* attribute to open the viewer with", !front.attrs.some((a) => a.indexOf("data-img") === 0), front.attrs);
  ok("…and the picture is not announced as a control", !front.attrs.includes("role") && !front.attrs.includes("title"), front.attrs);
  ok("…and exactly one picture is on the card", front.imgs === 1, front.imgs);

  sect("3. the reveal gives the credit the licence asks for");
  await page.evaluate(() => document.querySelector("#reveal-btn").click());
  await page.waitForTimeout(400);
  const back = await page.evaluate(() => {
    const fig = document.querySelector(".art-shot");
    return { revealed: fig.classList.contains("revealed"), cap: (fig.querySelector(".art-cap") || {}).textContent || "",
             role: fig.getAttribute("role"), src: fig.getAttribute("data-img-src") || "",
             sameSrc: [...document.querySelectorAll(".study-card img")].filter((i) => i.getAttribute("src") === fig.querySelector("img").getAttribute("src")).length,
             slot: document.querySelectorAll(".study-card .card-imgslot").length };
  });
  ok("the picture is credited once the answer is out", back.revealed && back.cap.indexOf(String(card.image.credit).slice(0, 12)) >= 0, back.cap.slice(0, 80));
  ok("…and can now be enlarged", back.role === "button" && back.src === card.image.src);
  /* buildBack draws the background picture slot for every other surface; the study page drops that copy
     at the reveal, and if the drop stops firing the same picture is on screen twice. */
  ok("…and the back's own copy of it is gone", back.slot === 0 && back.sameSrc === 1, back);

  const viewer = await page.evaluate(() => {
    document.querySelector(".art-shot").click();
    return !!document.querySelector(".img-viewer, .media-viewer, #imgViewer");
  });
  ok("clicking it opens the fullscreen viewer", viewer);
  await page.keyboard.press("Escape");

  /* ---------- 4. the picture round ------------------------------------------------------- */
  sect("4. the picture round deals them");
  ok("app.js was patched to expose the pool", patched);
  await page.goto("http://localhost:" + PORT + "/?c=" + (++visit) + "#home");
  await page.waitForFunction(() => !!window.__folioPicturePool, null, { timeout: 20000 });
  /* The artefacts' prose is in the lazy `artefactExtra` bundle, warmed at idle; the pool is read after
     it lands so the two halves are counted against each other rather than against a warming race. */
  await page.waitForTimeout(3000);
  const pool = await page.evaluate(() => window.__folioPicturePool().map((p) => ({ label: p.label, tag: p.tags[0], note: (p.note || "").length })));
  const wanted = art.map((c) => c.answerText);
  const got = pool.filter((p) => p.tag === "artwork").map((p) => p.label);
  ok("every artwork card is in the pool", wanted.every((w) => got.indexOf(w) >= 0), { wanted: wanted.length, got: got });
  ok("…each filed under `artwork`, which is what keeps the draw apart", got.length === wanted.length);
  ok("…and carries its own background for the reveal", pool.filter((p) => p.tag === "artwork").every((p) => p.note > 200));
  ok("…beside the artefacts, which have not gone anywhere", pool.filter((p) => p.tag === "artefact").length > 90,
    pool.filter((p) => p.tag === "artefact").length);
  ok("…and no ordinary card's illustration came back with them", pool.every((p) => p.tag === "artwork" || p.tag === "artefact"));

  ok("no console errors", errs.length === 0, errs.slice(0, 3));
  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed.");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
