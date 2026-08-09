// Card + glossary videos. A video is LINK-ONLY (a YouTube / Vimeo page URL, or a direct .mp4/.webm/.ogv
// URL) and renders in the EXACT frame a card image uses — .card-img, plus a .card-vid modifier that turns
// the click-to-enlarge figure into a player with an explicit expand control.
//
// What is worth guarding: the frame really is the image's frame; an <iframe> src is only ever one this
// code built from a matched video id (never a stranger's URL); a community deck's video fields are
// sanitized on ingest; and the fullscreen viewer still belongs to images alone for zoom/pan.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-video.js
//   FOLIO_CHROMIUM=<path to chrome>   if Chromium lives outside the playwright package
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAFElEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC";
const YT = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const MP4 = "https://example.org/clips/handaxe.mp4";

// nothing in this test may reach the network: the players are never expected to load, only to be built
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
// Nothing is stored uncredited (wireMediaSource in app.js): typing a URL with an empty source box stages
// it and pops a modal asking for one. These two keep that out of the way of the tests that are about
// something else — the gate itself is exercised by test-gloss-image.js and in section 2 below.
async function dismissSourcePrompt(page) {
  if (await page.locator(".inline-prompt").count()) { await page.locator(".inline-prompt .ip-cancel").click(); await page.waitForTimeout(200); }
}
async function creditMedia(page, attr, credit) {
  await dismissSourcePrompt(page);
  // set it the way a keystroke does. page.fill() sometimes lands on this field without the panel having
  // settled from the URL keystroke that revealed it, and the value never reaches the input.
  await page.evaluate((a) => {
    const el = document.querySelector("[data-" + a.attr + '="credit"]');
    if (el) { el.value = a.credit; el.dispatchEvent(new Event("input", { bubbles: true })); }
  }, { attr: attr, credit: credit });
  await page.waitForTimeout(500);
}
async function openGlossEditor(page, base) {
  await page.goto(base + "#admin", { waitUntil: "load" });
  await page.waitForTimeout(800);
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
  const errs = [];
  page.on("pageerror", (e) => errs.push("pageerror: " + e));
  page.on("console", (m) => { if (m.type() === "error" && !/ERR_|net::|Failed to load/.test(m.text())) errs.push("console: " + m.text()); });

  /* ---------- 1. link parsing, through the curated glossary editor's own read-out ---------- */
  await openGlossEditor(page, base);
  check("the glossary editor offers a video URL field", await page.locator('[data-gvidfield="src"]').count() === 1);
  check("video title/description/source are hidden until a URL is set", !(await page.locator('[data-gvidfield="title"]').isVisible()));

  const CASES = [
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "iframe", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0", "YouTube"],
    ["https://youtu.be/dQw4w9WgXcQ?t=42", "iframe", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&start=42", "YouTube"],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "iframe", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0", "YouTube"],
    ["https://vimeo.com/123456789", "iframe", "https://player.vimeo.com/video/123456789", "Vimeo"],
    ["https://player.vimeo.com/video/123456789", "iframe", "https://player.vimeo.com/video/123456789", "Vimeo"],
    [MP4, "video", MP4, "video file"],
    ["https://example.org/clips/reel.webm?x=1", "video", "https://example.org/clips/reel.webm?x=1", "video file"],
  ];
  // give the term a source once, up front: it stays in the panel across every URL edit below, and without
  // it the gate would (rightly) keep each URL out of the store and there would be nothing to preview
  await page.fill('[data-gvidfield="src"]', YT);
  await page.waitForTimeout(300);
  await creditMedia(page, "gvidfield", "Test archive");
  for (const [url, tag, want, label] of CASES) {
    await page.fill('[data-gvidfield="src"]', url);
    await page.waitForTimeout(400);
    const got = await page.evaluate(() => {
      const el = document.querySelector("#adminGlossPreview .gloss-imgslot .card-vid .cv-media");
      return { tag: el ? el.tagName.toLowerCase() : null, src: el ? el.getAttribute("src") : null, note: (document.querySelector("#adminGlossVidNote") || {}).textContent || "" };
    });
    check("parses " + url, got.tag === tag && got.src === want, got.tag + " " + got.src);
    check("...and names the source", got.note.indexOf(label) >= 0, got.note);
  }
  // anything else must produce no player at all, rather than an iframe pointed at a stranger's URL
  for (const bad of ["https://example.org/a-page-about-video", "javascript:alert(1)", "https://evil.example/embed/x"]) {
    await page.fill('[data-gvidfield="src"]', bad);
    await page.waitForTimeout(350);
    const got = await page.evaluate(() => ({
      n: document.querySelectorAll("#adminGlossPreview .card-vid").length,
      note: (document.querySelector("#adminGlossVidNote") || {}).textContent || "",
    }));
    check("refuses " + bad, got.n === 0 && /Not a link Folio can play/.test(got.note), got.n + " " + got.note);
  }

  /* ---------- 2. the curated overlay: delta, reload, clearing ---------- */
  await page.fill('[data-gvidfield="src"]', YT);
  await page.waitForTimeout(300);
  check("...and the meta fields appear once a URL is set", await page.locator('[data-gvidfield="title"]').isVisible());
  await page.fill('[data-gvidfield="title"]', "A short film");
  await page.waitForTimeout(700);
  check("...and nothing is pending, because the term carries a source", !(await page.locator(".gloss-imgpanel .af-reqnote").first().isVisible()));
  const stored = await page.evaluate(() => {
    const o = JSON.parse(localStorage.getItem("folio_admin_v1") || "{}");
    const k = Object.keys(o.glossaryVideos || {})[0];
    return { k: k, v: k ? o.glossaryVideos[k] : null };
  });
  check("the edit is recorded as a glossaryVideos overlay delta", !!(stored.v && stored.v.title === "A short film"), JSON.stringify(stored.v));
  check("the term counts as edited (Revert is offered)", await page.locator("#adminRevert").isVisible());

  // one frame per term: giving the same term a picture must retire the video, in the store and in the fields
  await page.fill('[data-gimgfield="src"]', PNG);
  await creditMedia(page, "gimgfield", "A museum");
  await page.waitForTimeout(700);
  const gExcl = await page.evaluate((k) => {
    const o = JSON.parse(localStorage.getItem("folio_admin_v1") || "{}");
    return {
      vidDelta: (o.glossaryVideos || {})[k],
      live: !!(window.GLOSSARY_VIDEOS || {})[k],
      field: (document.querySelector('[data-gvidfield="src"]') || {}).value,
      pvVid: document.querySelectorAll("#adminGlossPreview .card-vid").length,
      pvImg: document.querySelectorAll("#adminGlossPreview .card-img").length,
    };
  }, stored.k);
  check("a picture retires the term's video", !gExcl.vidDelta && gExcl.live === false, JSON.stringify(gExcl));
  check("...clearing the video URL field with it", !gExcl.field, String(gExcl.field));
  check("...and the preview shows one frame, the picture", gExcl.pvImg === 1 && gExcl.pvVid === 0);
  await page.fill('[data-gimgfield="src"]', "");
  await page.fill('[data-gvidfield="src"]', YT);
  await creditMedia(page, "gvidfield", "Test archive");   // the picture retired the video, which cleared its source with it
  await page.fill('[data-gvidfield="title"]', "A short film");
  await page.waitForTimeout(700);

  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => !!window.GLOSSARY);
  check("the overlay re-applies on reload",
    await page.evaluate((k) => (window.GLOSSARY_VIDEOS[k] || {}).title, stored.k) === "A short film");

  /* ---------- 3. the popup renders it, in the image's frame, ONE frame only ---------- */
  await page.goto(base, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.GLOSSARY && Object.keys(window.GLOSSARY).length > 0);
  // both fields set at once — only a hand-authored glossary.js can do this, and the picture must win
  await page.evaluate((args) => {
    Object.keys(window.GLOSSARY).forEach((k) => {
      window.GLOSSARY_IMAGES[k] = { src: args.png, title: "Plate", desc: "A plate.", credit: "Someone" };
      window.GLOSSARY_VIDEOS[k] = { src: args.yt, title: "A short film", desc: "What it shows.", credit: "https://example.org/channel" };
    });
  }, { png: PNG, yt: YT });
  await openAnyGloss(page);
  check("a term carrying both renders ONE frame", await page.locator(".gloss-win .gloss-imgslot .card-img").count() === 1);
  check("...and it is the picture", await page.locator(".gloss-win .gloss-imgslot .card-vid").count() === 0);

  await page.evaluate(() => { Object.keys(window.GLOSSARY).forEach((k) => { delete window.GLOSSARY_IMAGES[k]; }); });
  await openAnyGloss(page);
  check("with no picture, the popup carries the term's video", await page.locator(".gloss-win .gloss-imgslot .card-vid").count() === 1);
  check("...as the only frame in the slot", await page.locator(".gloss-win .gloss-imgslot .card-img").count() === 1);
  const gbox = await page.evaluate(() => {
    const v = document.querySelector(".gloss-win .gloss-imgslot .card-vid");
    const slot = document.querySelector(".gloss-win .gloss-imgslot");
    const body = document.querySelector(".gloss-win .gloss-body");
    const cs = getComputedStyle(body);
    return {
      h: v.getBoundingClientRect().height,
      w: slot.getBoundingClientRect().width,
      inner: body.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
      first: String(body.children[0].className).indexOf("gloss-imgslot") >= 0,
    };
  });
  check("the video shows at the popup's fixed media height", Math.abs(gbox.h - 150) < 1.5, gbox.h);
  check("...and never wider than half the popup", gbox.w <= gbox.inner / 2 + 1, gbox.w + " of " + gbox.inner);
  check("the media slot is still first in the body (the float needs it)", gbox.first);

  /* ---------- 4. the fullscreen viewer: expand control only, and no zoom wiring ---------- */
  await page.evaluate(() => document.querySelector(".gloss-win .card-vid .cv-media").dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await page.waitForTimeout(300);
  check("clicking the player does NOT open the viewer", await page.locator(".img-viewer").count() === 0);
  await page.evaluate(() => document.querySelector(".gloss-win .card-vid .cv-expand").click());
  await page.waitForTimeout(400);
  check("the expand control opens the viewer", await page.locator(".img-viewer.vid-viewer").count() === 1);
  const vv = await page.evaluate(() => ({
    tag: (document.querySelector(".iv-vid") || {}).tagName,
    src: (document.querySelector(".iv-vid") || {}).getAttribute ? document.querySelector(".iv-vid").getAttribute("src") : "",
    img: document.querySelectorAll(".img-viewer .iv-img").length,
    t: (document.querySelector(".iv-title") || {}).textContent,
    c: (document.querySelector(".iv-credit a") || {}).href,
    z: +getComputedStyle(document.querySelector(".img-viewer")).zIndex,
    gz: +getComputedStyle(document.querySelector(".gloss-win")).zIndex,
  }));
  check("the viewer plays the video, not an image", vv.tag === "IFRAME" && vv.img === 0, vv.tag);
  check("...autoplaying the embed it built", /youtube-nocookie\.com\/embed\/dQw4w9WgXcQ.*autoplay=1/.test(vv.src || ""), vv.src);
  check("the caption bar carries title + source", vv.t === "A short film" && vv.c === "https://example.org/channel", vv.t + " " + vv.c);
  check("the viewer stacks above the popup it opened from", vv.z > vv.gz, vv.z + " > " + vv.gz);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  check("Escape closes the video viewer", await page.locator(".img-viewer").count() === 0);
  check("...leaving the popup open underneath", await page.locator(".gloss-win").count() === 1);

  /* ---------- 5. a community deck: study a card with a video, in the image's exact frame ---------- */
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "folio-vid-"));
  const deckFile = path.join(dir, "d.folio-deck.json");
  fs.writeFileSync(deckFile, JSON.stringify({
    folioDeck: 1,
    meta: { id: "viddeck1", title: "Video deck", glossMode: "own", language: "en", version: 1 },
    cards: [{
      id: "u_viddeck1_1",
      question: 'A <span class="blank">_____</span> is knapped from flint.',
      answer: "Handaxe", answerText: "Handaxe",
      abstract: "A handaxe is a shaped stone tool.",
      // an https URL, not the inline PNG: community content is held to http/https, data: is refused
      image: { src: "https://example.org/plate.png", title: "Plate", desc: "A plate.", credit: "Someone" },
    }, {
      id: "u_viddeck1_2",
      question: 'A <span class="blank">_____</span> strikes the core.',
      answer: "Hammerstone", answerText: "Hammerstone",
      abstract: "A hammerstone is the percussor.",
      video: { src: MP4, title: "Knapping", desc: "How it is made.", credit: "An archive" },
    }, {
      id: "u_viddeck1_3",
      question: 'A <span class="blank">_____</span> is struck from the core.',
      answer: "Flake", answerText: "Flake",
      abstract: "A flake is the piece removed.",
      // both at once: one frame per card, so the picture wins and the video is dropped at ingest
      image: { src: "https://example.org/flake.png", title: "Flake", desc: "d", credit: "c" },
      video: { src: MP4, title: "Dropped", desc: "d", credit: "c" },
    }, {
      id: "u_viddeck1_4",
      question: 'A <span class="blank">_____</span> follows the herd.',
      answer: "Band", answerText: "Band",
      abstract: 'Hostile: <video src="x.mp4" onerror="window.__vidPwned=1"></video><iframe src="https://evil.example"></iframe> and prose.',
      video: { src: "javascript:alert(1)", title: "Nope" },
    }],
    gloss: {
      Flint: { title: "Flint", desc: "A hard stone.", tags: ["object"], video: { src: YT, title: "Flint", desc: "d", credit: "c" } },
      Evil: { title: "Evil", desc: "Nope.", video: { src: "javascript:alert(1)", title: "x" } },
    },
  }));
  await page.goto(base + "#studio", { waitUntil: "load" });
  await page.waitForTimeout(900);
  const chooser = page.waitForEvent("filechooser");
  await page.click("#stImport");
  (await chooser).setFiles(deckFile);
  await page.waitForTimeout(1200);

  await page.goto(base + "#decks", { waitUntil: "load" });
  await page.waitForTimeout(900);
  await page.evaluate(() => document.querySelector(".collection.udeck [data-udeck]").click());
  await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelector("#reveal-btn").click());
  await page.waitForTimeout(500);

  // the frames are measured one card apart, in the same column, so they are directly comparable
  const measure = () => page.evaluate(() => {
    const fig = document.querySelector(".reveal .card-img");
    if (!fig) return null;
    const cs = getComputedStyle(fig), r = fig.getBoundingClientRect(), inner = fig.querySelector(".cv-media");
    const slot = fig.closest(".card-imgslot");
    return {
      // the CHROME the two frames share. `aspectRatio` is deliberately NOT in this list since Aug 2026:
      // a picture's frame takes the picture's own shape and a video's stays 16:9, which is asserted
      // separately below — an iframe has no intrinsic size to shrink to.
      style: ["borderRadius", "borderTopWidth", "borderTopColor", "overflow", "boxShadow", "marginTop", "marginBottom"].map((p) => cs[p]).join("|"),
      aspect: cs.aspectRatio,
      float: slot ? getComputedStyle(slot).float : null,
      w: Math.round(r.width), h: Math.round(r.height),
      innerW: Math.round(document.querySelector(".reveal .bg-collapse-inner").getBoundingClientRect().width),
      isVid: fig.classList.contains("card-vid"),
      frames: document.querySelectorAll(".reveal .card-img").length,
      order: [...document.querySelectorAll(".reveal .bg-collapse-inner > *")].map((e) => e.className.split(" ")[0]).join(","),
      tag: inner ? inner.tagName.toLowerCase() : null,
      src: inner ? inner.getAttribute("src") : null,
      role: fig.getAttribute("role"),
    };
  });
  const imgCard = await measure();
  check("a card with a picture renders one frame", imgCard && imgCard.frames === 1 && !imgCard.isVid, JSON.stringify(imgCard).slice(0, 120));
  const next = async () => { await page.evaluate(() => { const g = document.querySelector(".grade.good"); if (g) g.click(); }); await page.waitForTimeout(700); await page.evaluate(() => { const b = document.querySelector("#reveal-btn"); if (b) b.click(); }); await page.waitForTimeout(500); };
  await next();
  const vidCard = await measure();
  check("a card with a video renders one frame", vidCard && vidCard.frames === 1 && vidCard.isVid === true, JSON.stringify(vidCard).slice(0, 120));
  check("...in the image's frame, chrome for chrome", vidCard && vidCard.style === imgCard.style, (vidCard || {}).style + "  vs  " + imgCard.style);
  // ...and never wider than the slot allows, which is what leaves the prose a column to run down. The two
  // are no longer the same SIZE — an image sizes to itself and a video to the slot — so the shared bound
  // is what there is to compare (both files here are unreachable by design, so neither ever paints).
  check("...neither wider than the slot allows", vidCard && vidCard.w <= vidCard.innerW * 0.46 && imgCard.w <= imgCard.innerW * 0.46,
    (vidCard || {}).w + " / " + (imgCard || {}).w + " of " + imgCard.innerW);
  // the one place the two shapes part company (Aug 2026): a picture's frame shrinks to the picture, so it
  // can never letterbox it; a video has no intrinsic size to shrink to and keeps the band it always had
  check("a picture's frame takes the picture's own shape", imgCard && imgCard.aspect === "auto", (imgCard || {}).aspect);
  check("...while a video keeps 16:9", vidCard && /^16\s*\/\s*9$/.test(vidCard.aspect || ""), (vidCard || {}).aspect);
  check("...both in the slot floated to the top-right of the prose", vidCard && vidCard.float === "right" && imgCard.float === "right",
    (vidCard || {}).float + " / " + (imgCard || {}).float);
  check("...which is FIRST in the background, or the prose cannot wrap it",
    /^card-imgslot,abstract$/.test((vidCard || {}).order || ""), (vidCard || {}).order);
  check("...as a <video> for a direct file link", vidCard && vidCard.tag === "video" && vidCard.src === MP4, (vidCard || {}).tag + " " + (vidCard || {}).src);
  check("the video figure is not itself a button (the player owns its clicks)", vidCard && !vidCard.role, String((vidCard || {}).role));

  await next();
  const bothCard = await measure();
  check("a card given both renders ONE frame", bothCard && bothCard.frames === 1, JSON.stringify(bothCard).slice(0, 120));
  check("...and it is the picture", bothCard && bothCard.isVid === false);

  await page.evaluate(() => { const g = document.querySelector(".grade.good"); if (g) g.click(); });
  await page.waitForTimeout(700);
  const hostile = await page.evaluate(() => ({
    pwned: !!window.__vidPwned,
    media: document.querySelectorAll(".reveal video, .reveal iframe").length,
  }));
  check("the hostile card renders no video at all", hostile.media === 0, String(hostile.media));
  check("nothing in a stranger's prose executed", !hostile.pwned);

  /* ---------- 6. the Studio's own video fields ---------- */
  await page.goto(base + "#studio", { waitUntil: "load" });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const b = document.querySelector("[data-open]"); if (b) b.click(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const rows = document.querySelectorAll(".studio-cardrow .scr-open"); if (rows[1]) rows[1].click(); });   // the video card
  await page.waitForTimeout(700);
  // ONE panel and ONE slot: the pasted URL decides which of the two stores it goes to, so there is no video
  // box to find and no second empty frame beside the one in use
  check("the Studio card editor offers one media panel", await page.locator('[data-mediafield="src"]').count() === 1);
  check("...and no separate video panel to pick between", await page.locator('[data-vidfield="src"]').count() === 0);
  check("...showing the card's existing video in the slot", await page.locator("#cesMediaSlot .card-vid .cv-media").count() === 1);
  check("...as the only frame, with no empty box beside it",
    await page.locator("#cesMediaSlot .card-img").count() === 1 && await page.locator("#cesMediaSlot .ces-img-ph").count() === 0);
  await page.evaluate(() => { const b = document.querySelector("#cesMediaSlot .ces-vid-edit"); if (b) b.click(); });
  await page.waitForTimeout(300);
  await page.fill('[data-mediafield="src"]', YT);
  await page.waitForTimeout(700);
  const st = await page.evaluate(() => {
    const el = document.querySelector("#cesMediaSlot .card-vid .cv-media");
    return { tag: el ? el.tagName.toLowerCase() : null, src: el ? el.getAttribute("src") : null, note: (document.querySelector("#cesMediaNote") || {}).textContent || "" };
  });
  check("editing the URL re-renders the player live", st.tag === "iframe" && /youtube-nocookie/.test(st.src || ""), st.tag + " " + st.src);
  check("...and reports what it recognised", /YouTube/.test(st.note), st.note);

  // one frame per card: pasting a PICTURE url into the same box must retire the video, in the store AND on
  // screen — and it must be recognised as a picture without the author saying so
  await page.fill('[data-mediafield="src"]', "https://example.org/swap.png");
  await creditMedia(page, "mediafield", "A museum");
  await page.waitForTimeout(800);
  const swapped = await page.evaluate(() => ({
    vidFrames: document.querySelectorAll("#cesMediaSlot .card-vid").length,
    imgFrames: document.querySelectorAll("#cesMediaSlot .card-img img").length,
    note: (document.querySelector("#cesMediaNote") || {}).textContent || "",
  }));
  check("a picture URL in the same box replaces the video on screen", swapped.imgFrames === 1 && swapped.vidFrames === 0, JSON.stringify(swapped));
  check("...recognised as an image without being told", /image/i.test(swapped.note), swapped.note);

  await page.evaluate(() => { const b = document.querySelector('[data-tab="gloss"]'); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => { const b = document.querySelector("[data-topen]"); if (b) b.click(); });
  await page.waitForTimeout(500);
  const hasGvid = await page.locator('[data-gvid="src"]').count();
  check("the Studio term form offers a video URL field", hasGvid === 1, String(hasGvid));

  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1200);
  const survived = await page.evaluate(() => {
    // read it back the way the app does: the Library row's deck study path re-mounts from IndexedDB
    return new Promise((res) => {
      const req = indexedDB.open("folio-community");
      req.onsuccess = () => {
        const db = req.result;
        const all = db.transaction("decks").objectStore("decks").getAll();
        all.onsuccess = () => {
          const d = all.result.find((x) => x.id === "viddeck1") || {};
          const cs = d.cards || [];
          res({
            src: ((cs[1] || {}).image || {}).src,             // the video card, now swapped to a picture
            vid: !!(cs[1] || {}).video,
            both: !!(cs[2] || {}).video, bothImg: !!(cs[2] || {}).image,   // the card given both at once
            bad: !!(cs[3] || {}).video, abstract: (cs[3] || {}).abstract || "",
            gloss: !!((d.gloss || {}).Flint || {}).video, evil: !!((d.gloss || {}).Evil || {}).video,
          });
        };
      };
      req.onerror = () => res(null);
    });
  });
  check("the swap persisted to the deck store", survived && /swap\.png/.test(survived.src || ""), JSON.stringify(survived));
  check("...with the video gone, not merely hidden", survived && survived.vid === false);
  check("a card given both keeps only the picture", survived && survived.both === false && survived.bothImg === true);
  check("a term's video survives ingest", survived && survived.gloss === true);
  check("a javascript: term video does not", survived && survived.evil === false);
  check("a javascript: card video does not", survived && survived.bad === false);
  check("inline <video>/<iframe> in a stranger's prose is stripped on ingest",
    survived && !/<video|<iframe/i.test(survived.abstract) && /and prose/.test(survived.abstract), (survived || {}).abstract);

  /* ---------- 7. the curated card editor: its own delta, and reverting ---------- */
  await page.goto(base + "#admin", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  // the editor remembers the tab it was left on (folio_admin_ui_v1) — section 1 left it on the glossary
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /^cards$/i.test(x.textContent.trim()));
    if (b) b.click();
  });
  await page.waitForTimeout(500);
  // wh-046 (Paleolithic) is the one shipped card carrying an image, which is exactly the interesting case:
  // pasting a VIDEO link into the one media box must be recognised as a video and must retire the shipped
  // picture. Opened BY ID rather than by taking the first row — the list's order is the collection's, and
  // the collection was renumbered once already (2026-08-04, docs/world-history-card-plan.md).
  await page.evaluate(() => { const r = document.querySelector('[data-open="wh-046"]'); if (r) r.click(); });
  await page.waitForTimeout(800);
  check("the card editor offers one media panel", await page.locator('[data-mediafield="src"]').count() === 1);
  check("a card with a picture shows one frame and no empty box",
    await page.locator("#cesMediaSlot .card-img").count() === 1 && await page.locator("#cesMediaSlot .ces-img-ph").count() === 0);
  check("...and the panel is closed until asked for", await page.evaluate(() =>
    !document.querySelector("#cesMediaPanel").checkVisibility()));

  await page.click("#cesMediaSlot .card-img");
  await page.waitForTimeout(300);
  check("clicking the frame opens the media panel", await page.evaluate(() => document.querySelector("#cesMediaPanel").checkVisibility()));
  await page.fill('[data-mediafield="src"]', MP4);
  await creditMedia(page, "mediafield", "An archive");
  await page.fill('[data-mediafield="title"]', "A demonstration");
  await page.waitForTimeout(800);
  const cardDelta = await page.evaluate(() => {
    const o = JSON.parse(localStorage.getItem("folio_admin_v1") || "{}");
    const id = Object.keys(o.cards || {}).find((k) => o.cards[k].video);
    const d = id ? o.cards[id] : {};
    return {
      id: id, v: d.video, imgDelta: d.image,
      player: document.querySelectorAll("#cesMediaSlot .card-vid video").length,
      imgFrames: document.querySelectorAll("#cesMediaSlot .card-img img").length,
      note: (document.querySelector("#cesMediaNote") || {}).textContent || "",
    };
  });
  check("a video link in the one box is filed as a card VIDEO delta", !!(cardDelta.v && cardDelta.v.title === "A demonstration"), JSON.stringify(cardDelta.v));
  check("...and the editor shows the player in place", cardDelta.player === 1);
  check("...saying which kind it decided on", /video file/i.test(cardDelta.note), cardDelta.note);
  check("the shipped image is retired by a null tombstone", cardDelta.imgDelta === null, JSON.stringify(cardDelta.imgDelta));
  check("...and its frame is gone, leaving exactly one", cardDelta.imgFrames === 0);

  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1000);
  const afterReload = await page.evaluate((id) => {
    const d = JSON.parse(localStorage.getItem("folio_admin_v1") || "{}").cards[id] || {};
    return {
      delta: !!d.video, tombstone: d.image,
      // the shipped card object after the overlay has been applied — the tombstone should have blanked it
      liveImage: !!((window.CARD_DATA.find((c) => c.id === id) || {}).image || {}).src,
    };
  }, cardDelta.id);
  check("the card video survives a reload", afterReload.delta);
  // the regression this pins: the tombstone was written on the first keystroke and erased by the second,
  // so the retired picture came back the moment the page reloaded and the card showed two frames again
  check("...and the retired picture stays retired", afterReload.tombstone === null && afterReload.liveImage === false,
    JSON.stringify(afterReload));
  await page.waitForTimeout(400);
  // reverting must put the shipped picture back and take the video away — one frame, as it started
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /^cards$/i.test(x.textContent.trim()));
    if (b) b.click();
  });
  await page.waitForTimeout(500);
  /* …opened BY ID, exactly as it was opened above and for the same reason. This step used to take the
     FIRST row of the list and revert that, which is a different card (wh-001) — so it was asserting that
     wh-046's delta had gone after reverting somebody else's, and only passed while the two happened to
     coincide. The list's order is the collection's, and that collection has been renumbered once already. */
  await page.evaluate(() => { const r = document.querySelector('[data-open="wh-046"]'); if (r) r.click(); });
  await page.waitForTimeout(700);
  await page.evaluate(() => { const b = document.querySelector("#adminRevert"); if (b) b.click(); });
  await page.waitForTimeout(700);
  const reverted = await page.evaluate((id) => ({
    delta: (JSON.parse(localStorage.getItem("folio_admin_v1") || "{}").cards || {})[id],
    imgFrames: document.querySelectorAll("#cesMediaSlot .card-img img").length,
    vidFrames: document.querySelectorAll("#cesMediaSlot .card-vid").length,
  }), cardDelta.id);
  check("Revert card drops the video with everything else", !reverted.delta, JSON.stringify(reverted.delta));
  check("...and the shipped picture comes back as the one frame",
    reverted.imgFrames === 1 && reverted.vidFrames === 0, JSON.stringify(reverted));

  /* ---------- 7b. a link that will not load ----------
     There is deliberately no upload path, so every picture and clip in Folio is somebody else's URL and link
     rot is a certainty rather than an edge case. Before this was handled, a 404 left a full 16:9 grey hole in
     the middle of the prose wearing a "click to enlarge" cursor, and the viewer it opened was empty.
     The rule is not "hide it": a READER gets nothing, because a broken illustration is worse than none and
     they cannot fix it, while an AUTHOR keeps the frame and is told, being the only one who can. Both halves
     have to be asserted — hiding it everywhere would leave the author with no way to notice. */
  const DEAD = base + "this-file-does-not-exist.png";   // same-origin, so the server answers 404 with no network
  await page.evaluate(() => { const t = document.querySelector("#cesMediaSlot .card-img, #cesMediaSlot .ces-img-ph"); if (t) t.click(); });
  await page.waitForTimeout(300);
  await page.fill('[data-mediafield="src"]', DEAD);
  await creditMedia(page, "mediafield", "A museum");
  await page.waitForTimeout(1200);   // the error event is async
  const authorSide = await page.evaluate(() => {
    const f = document.querySelector("#cesMediaSlot .card-img");
    return { dead: !!f && f.classList.contains("media-dead"), shown: !!f && f.checkVisibility(), says: !!f && /doesn|load/i.test(getComputedStyle(f, "::after").content || "") };
  });
  check("a dead link is marked as dead", authorSide.dead, JSON.stringify(authorSide));
  check("...and the AUTHOR still sees the frame", authorSide.shown);
  check("...told in words that the link doesn't load", authorSide.says);

  // Preview renders the card as a reader meets it — question first, the background only once revealed
  await page.evaluate(() => { const b = document.querySelector("#adminPreview"); if (b) b.click(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
  await page.waitForTimeout(1200);
  const readerSide = await page.evaluate(() => {
    const f = document.querySelector(".admin-pv-card .card-img");
    return { present: !!f, dead: !!f && f.classList.contains("media-dead"), shown: !!f && f.checkVisibility(), h: f ? Math.round(f.getBoundingClientRect().height) : -1 };
  });
  check("...but a READER is shown nothing where it would have been", readerSide.present && readerSide.dead && !readerSide.shown, JSON.stringify(readerSide));
  check("...with the 16:9 hole gone from the flow, not merely blank", readerSide.h === 0, String(readerSide.h));
  // the delegated viewer listener refuses a dead figure — dispatched by hand, since a hidden element
  // cannot be clicked, and that refusal is what stops an empty viewer opening from a stale render
  const viewer = await page.evaluate(() => {
    const f = document.querySelector(".admin-pv-card .card-img");
    if (f) f.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return !!document.querySelector(".img-viewer");
  });
  check("...and a click on it opens no empty viewer", !viewer);

  /* ---------- 8. no console errors anywhere in the above ---------- */
  check("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));

  console.log("\n" + pass + " passed, " + fail + " failed");
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
