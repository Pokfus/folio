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
  const stored = await page.evaluate(() => {
    const o = JSON.parse(localStorage.getItem("folio_admin_v1") || "{}");
    const k = Object.keys(o.glossaryVideos || {})[0];
    return { k: k, v: k ? o.glossaryVideos[k] : null };
  });
  check("the edit is recorded as a glossaryVideos overlay delta", !!(stored.v && stored.v.title === "A short film"), JSON.stringify(stored.v));
  check("the term counts as edited (Revert is offered)", await page.locator("#adminRevert").isVisible());

  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => !!window.GLOSSARY);
  check("the overlay re-applies on reload",
    await page.evaluate((k) => (window.GLOSSARY_VIDEOS[k] || {}).title, stored.k) === "A short film");

  /* ---------- 3. the popup renders it, in the image's frame ---------- */
  await page.goto(base, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.GLOSSARY && Object.keys(window.GLOSSARY).length > 0);
  await page.evaluate((args) => {
    Object.keys(window.GLOSSARY).forEach((k) => {
      window.GLOSSARY_IMAGES[k] = { src: args.png, title: "Plate", desc: "A plate.", credit: "Someone" };
      window.GLOSSARY_VIDEOS[k] = { src: args.yt, title: "A short film", desc: "What it shows.", credit: "https://example.org/channel" };
    });
  }, { png: PNG, yt: YT });
  await closeGloss(page);
  await page.click("#exp-term");
  await page.waitForTimeout(400);
  check("the popup carries the term's video", await page.locator(".gloss-win .gloss-imgslot .card-vid").count() === 1);
  check("...alongside the image, both in the same slot", await page.locator(".gloss-win .gloss-imgslot .card-img").count() === 2);
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
      video: { src: MP4, title: "Knapping", desc: "How it is made.", credit: "An archive" },
    }, {
      id: "u_viddeck1_2",
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

  const frame = await page.evaluate(() => {
    const img = document.querySelector(".reveal .card-img:not(.card-vid)");
    const vid = document.querySelector(".reveal .card-vid");
    if (!img || !vid) return { img: !!img, vid: !!vid };
    const a = getComputedStyle(img), b = getComputedStyle(vid);
    const inner = vid.querySelector(".cv-media");
    return {
      img: true, vid: true,
      same: ["borderRadius", "aspectRatio", "borderTopWidth", "borderTopColor", "overflow", "boxShadow"].every((p) => a[p] === b[p]),
      radius: a.borderRadius + " / " + b.borderRadius,
      widthEq: Math.abs(img.getBoundingClientRect().width - vid.getBoundingClientRect().width) < 1,
      heightEq: Math.abs(img.getBoundingClientRect().height - vid.getBoundingClientRect().height) < 1,
      order: [...document.querySelectorAll(".reveal .bg-collapse-inner > *")].map((e) => e.className.split(" ")[0]).join(","),
      tag: inner ? inner.tagName.toLowerCase() : null,
      src: inner ? inner.getAttribute("src") : null,
      isButton: vid.getAttribute("role"),
    };
  });
  check("a community card's video renders when studied", frame.vid === true, JSON.stringify(frame).slice(0, 140));
  check("...in the image's exact frame", frame.same === true, frame.radius);
  check("...at the image's exact size", frame.widthEq && frame.heightEq);
  check("...below the image, above the prose", /card-img,card-img,abstract/.test(frame.order || ""), frame.order);
  check("...as a <video> for a direct file link", frame.tag === "video" && frame.src === "https://example.org/clips/handaxe.mp4", frame.tag + " " + frame.src);
  check("the video figure is not itself a button (the player owns its clicks)", !frame.isButton, String(frame.isButton));

  await page.evaluate(() => { const g = document.querySelector(".grade.good"); if (g) g.click(); });
  await page.waitForTimeout(700);
  const second = await page.evaluate(() => ({
    pwned: !!window.__vidPwned,
    media: document.querySelectorAll(".reveal video, .reveal iframe").length,
  }));
  check("the hostile card renders no video at all", second.media === 0, String(second.media));
  check("nothing in a stranger's prose executed", !second.pwned);

  /* ---------- 6. the Studio's own video fields ---------- */
  await page.goto(base + "#studio", { waitUntil: "load" });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const b = document.querySelector("[data-open]"); if (b) b.click(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const b = document.querySelector(".studio-cardrow .scr-open"); if (b) b.click(); });
  await page.waitForTimeout(700);
  check("the Studio card editor offers a video panel", await page.locator('[data-vidfield="src"]').count() === 1);
  check("...showing the card's existing video in the slot", await page.locator("#cesVidSlot .card-vid .cv-media").count() === 1);
  await page.fill('[data-vidfield="src"]', YT);
  await page.waitForTimeout(700);
  const st = await page.evaluate(() => {
    const el = document.querySelector("#cesVidSlot .card-vid .cv-media");
    return { tag: el ? el.tagName.toLowerCase() : null, src: el ? el.getAttribute("src") : null, note: (document.querySelector("#cesVidNote") || {}).textContent || "" };
  });
  check("editing the URL re-renders the player live", st.tag === "iframe" && /youtube-nocookie/.test(st.src || ""), st.tag + " " + st.src);
  check("...and reports what it recognised", /YouTube/.test(st.note), st.note);

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
          const c = (d.cards || [])[0] || {}, c2 = (d.cards || [])[1] || {};
          res({ src: (c.video || {}).src, title: (c.video || {}).title, bad: !!c2.video, abstract: c2.abstract || "",
            gloss: !!((d.gloss || {}).Flint || {}).video, evil: !!((d.gloss || {}).Evil || {}).video });
        };
      };
      req.onerror = () => res(null);
    });
  });
  check("the video persists to the deck store", survived && /youtube\.com/.test(survived.src || ""), JSON.stringify(survived));
  check("...keeping its title", survived && survived.title === "Knapping", survived && survived.title);
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
  await page.evaluate(() => { const r = document.querySelector(".admin-card-row .acr-open"); if (r) r.click(); });
  await page.waitForTimeout(800);
  check("the card editor offers a video panel", await page.locator('[data-vidfield="src"]').count() === 1);
  check("...with an add-a-video placeholder while empty", await page.locator("#cesVidSlot .ces-vid-ph").count() === 1);
  await page.fill('[data-vidfield="src"]', MP4);
  await page.fill('[data-vidfield="title"]', "A demonstration");
  await page.waitForTimeout(800);
  const cardDelta = await page.evaluate(() => {
    const o = JSON.parse(localStorage.getItem("folio_admin_v1") || "{}");
    const id = Object.keys(o.cards || {}).find((k) => o.cards[k].video);
    return { id: id, v: id ? o.cards[id].video : null, player: document.querySelectorAll("#cesVidSlot .card-vid video").length };
  });
  check("the edit is recorded as a card video delta", !!(cardDelta.v && cardDelta.v.title === "A demonstration"), JSON.stringify(cardDelta.v));
  check("...and the editor shows the player in place", cardDelta.player === 1);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1000);
  check("the card video survives a reload",
    await page.evaluate((id) => (window.CARD_DATA, (function () { const o = JSON.parse(localStorage.getItem("folio_admin_v1") || "{}"); return !!(o.cards[id] || {}).video; })()), cardDelta.id));
  await page.waitForTimeout(400);
  await page.evaluate(() => { const b = document.querySelector("#adminRevert"); if (b) b.click(); });
  await page.waitForTimeout(600);
  check("Revert card drops the video with everything else",
    await page.evaluate((id) => { const o = JSON.parse(localStorage.getItem("folio_admin_v1") || "{}"); return !(o.cards || {})[id]; }, cardDelta.id));

  /* ---------- 8. no console errors anywhere in the above ---------- */
  check("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));

  console.log("\n" + pass + " passed, " + fail + " failed");
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
