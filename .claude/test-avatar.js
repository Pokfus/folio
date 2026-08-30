/* Folio — the profile photo: choosing its crop, and enlarging someone else's (Aug 2026, on request)

   > "When uploading a profile picture, it should be possible to move/crop it."
   > "When visiting someone else's profile, I should be able to click their profile picture to enlarge it."

   THREE THINGS HERE FAIL SILENTLY, which is why this is a suite of its own rather than a look at the page.

   · **A HOLE IN THE CROP BECOMES BLACK.** The canvas is encoded as a JPEG, which has no alpha, so a pan
     that brings an edge inside the round window does not show as a gap — it shows as a black wedge in
     somebody's face, on every surface of the site, and only they will ever see it. `minScale` and the
     clamp are what prevent it, and neither is visible in the markup.
   · **A CROP THAT DOES NOT MOVE LOOKS LIKE A CROP.** If the drag were wired to nothing the dialog would
     still open, still show the picture, still save — and would save the centre crop it always saved. So
     the test reads PIXELS out of the canvas and off the saved image, and uses a picture whose left edge
     and middle are different colours: a centre crop keeps the middle, and the whole point of the control
     is to reach the edge.
   · **THE SAVED SQUARE IS RE-RENDERED FROM THE ORIGINAL**, not scaled out of the preview, so its size is
     `AVATAR_PX` whatever the screen was.

   THE CROPPER IS REACHED THROUGH A PATCHED app.js, and that is deliberate: it lives behind a Supabase
   sign-in, and mocking auth to reach one dialog would test the mock. `test-i18n-lang.js` serves a
   modified app.js for the same reason. The patch appends ONE line inside the IIFE and the suite fails if
   the tail it appends to is not found, so a refactor cannot leave it quietly testing nothing.

   Run:  NODE_PATH=<playwright>/node_modules node .claude/test-avatar.js
   Env:  FOLIO_CHROMIUM=<path to chrome> if Chromium lives outside the playwright package. */

const path = require("path");
const http = require("http");
const fs = require("fs");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.join(__dirname, "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const HOOK = "\n  window.__folioCrop = openAvatarCropper;\n  window.__folioAvatarView = openAvatarViewer;\n";

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
}

let patched = false;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(ROOT, p);
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); res.end(""); return; }
    if (p === "/app.js") {
      const t = data.toString("utf8");
      const at = t.lastIndexOf("})();");
      if (at >= 0) { data = Buffer.from(t.slice(0, at) + HOOK + t.slice(at), "utf8"); patched = true; }
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
    res.end(data);
  });
});

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM || undefined });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => { if (!isNoise(String(e.message || e))) errs.push(String(e.message || e)); });
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errs.push(m.text()); });

  await page.goto(base + "#home", { waitUntil: "load" });
  await page.waitForTimeout(900);
  check("the patched build exposes the cropper", patched && (await page.evaluate(() => typeof window.__folioCrop)) === "function");

  /* A 400x200 picture: a RED band down the far left, GREEN through the middle, dark blue elsewhere. The
     centre crop of a landscape image keeps the green and cannot see the red at all, so "did the drag do
     anything" is answerable by colour rather than by trusting the transform. */
  await page.evaluate(async () => {
    const c = document.createElement("canvas"); c.width = 400; c.height = 200;
    const g = c.getContext("2d");
    g.fillStyle = "#102030"; g.fillRect(0, 0, 400, 200);
    g.fillStyle = "#ff0000"; g.fillRect(0, 0, 90, 200);
    g.fillStyle = "#00ff00"; g.fillRect(155, 0, 90, 200);
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    window.__result = null;
    window.__folioCrop(new File([blob], "t.png", { type: "image/png" }), (uri) => { window.__result = uri; });
  });
  await page.waitForTimeout(600);

  const up = await page.evaluate(() => ({
    overlay: !!document.querySelector(".av-crop"),
    canvas: !!document.querySelector(".avc-canvas"),
    ring: !!document.querySelector(".avc-ring"),
    zoom: !!document.querySelector(".avc-range"),
    square: (() => { const c = document.querySelector(".avc-canvas"); const r = c && c.getBoundingClientRect(); return r ? Math.abs(r.width - r.height) < 2 : false; })(),
    ringInert: (() => { const r = document.querySelector(".avc-ring"); return r ? getComputedStyle(r).pointerEvents === "none" : false; })(),
  }));
  check("the dialog opens with a square canvas, a round mask and a zoom", up.overlay && up.canvas && up.ring && up.zoom && up.square, JSON.stringify(up));
  check("...and the mask does not swallow the drag it describes", up.ringInert, JSON.stringify(up));

  const sample = () => page.evaluate(() => {
    const c = document.querySelector(".avc-canvas"), g = c.getContext("2d");
    const px = (fx, fy) => { const d = g.getImageData(Math.round(c.width * fx), Math.round(c.height * fy), 1, 1).data; return [d[0], d[1], d[2]]; };
    return { left: px(0.12, 0.5), mid: px(0.5, 0.5) };
  });
  const red = (p) => p[0] > 200 && p[1] < 60 && p[2] < 60;
  const green = (p) => p[1] > 200 && p[0] < 60 && p[2] < 60;

  const opened = await sample();
  check("it opens on the centre crop, which cannot see the left edge", green(opened.mid) && !red(opened.left), JSON.stringify(opened));

  const cb = await page.locator(".avc-canvas").boundingBox();
  await page.mouse.move(cb.x + cb.width * 0.3, cb.y + cb.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(cb.x + cb.width * 0.9, cb.y + cb.height * 0.5, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  const dragged = await sample();
  check("dragging right brings the picture's far left into the window — the request", red(dragged.left), JSON.stringify(dragged));

  /* The guarantee the JPEG makes necessary. Asserted AFTER a drag that pushes hard against the edge,
     which is the only state that can produce one. */
  const holes = await page.evaluate(() => {
    const c = document.querySelector(".avc-canvas"), g = c.getContext("2d");
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] < 250) n++;
    return n;
  });
  check("no gesture can open a hole in the crop — a hole is BLACK in a JPEG", holes === 0, holes + " transparent px");

  await page.click(".avc-ok");
  await page.waitForTimeout(500);
  const saved = await page.evaluate(() => {
    const uri = window.__result;
    if (!uri) return null;
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement("canvas"); c.width = im.width; c.height = im.height;
        const g = c.getContext("2d"); g.drawImage(im, 0, 0);
        const px = (fx, fy) => { const d = g.getImageData(Math.round(im.width * fx), Math.round(im.height * fy), 1, 1).data; return [d[0], d[1], d[2]]; };
        resolve({ w: im.width, h: im.height, jpeg: /^data:image\/jpeg/.test(uri), kb: Math.round(uri.length / 1024), left: px(0.12, 0.5), closed: !document.querySelector(".av-crop") });
      };
      im.onerror = () => resolve(null);
      im.src = uri;
    });
  });
  check("Use photo hands back a square JPEG at the stored size", !!saved && saved.jpeg && saved.w === 128 && saved.h === 128, JSON.stringify(saved));
  check("...carrying the crop the reader chose, not the one they were given", !!saved && red(saved.left), JSON.stringify(saved && saved.left));
  check("...small enough to live on a profiles row", !!saved && saved.kb <= 24, (saved && saved.kb) + " KB");
  check("...and the dialog closes behind it", !!saved && saved.closed);

  /* Cancel must hand back nothing at all — a dialog that saves on the way out is worse than one that
     cannot be dismissed, since the reader sees a photo they explicitly declined. */
  await page.evaluate(async () => {
    const c = document.createElement("canvas"); c.width = 300; c.height = 300;
    c.getContext("2d").fillStyle = "#345"; c.getContext("2d").fillRect(0, 0, 300, 300);
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    window.__result2 = "untouched";
    window.__folioCrop(new File([blob], "u.png", { type: "image/png" }), (uri) => { window.__result2 = uri; });
  });
  await page.waitForTimeout(500);
  await page.click(".avc-cancel");
  await page.waitForTimeout(300);
  const cancelled = await page.evaluate(() => ({ r: window.__result2, gone: !document.querySelector(".av-crop") }));
  check("Cancel closes without saving anything", cancelled.gone && cancelled.r === "untouched", JSON.stringify(cancelled));

  /* ---- enlarging someone else's photo ---- */
  const tiny = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
  await page.evaluate((src) => window.__folioAvatarView(src, "Ada"), tiny);
  await page.waitForTimeout(400);
  const viewer = await page.evaluate(() => {
    const im = document.querySelector(".img-viewer .iv-img");
    if (!im) return null;
    const cs = getComputedStyle(im);
    return { open: true, avatarClass: im.classList.contains("iv-avatar"), round: /50%/.test(cs.borderRadius), w: Math.round(im.getBoundingClientRect().width), alt: im.getAttribute("alt") };
  });
  check("a friend's photo opens in the site's own image viewer", !!viewer && viewer.open, JSON.stringify(viewer));
  check("...drawn round, the shape it was cropped in", !!viewer && viewer.avatarClass && viewer.round, JSON.stringify(viewer));
  check("...larger than the row it was tapped in, rather than at its stored 128px", !!viewer && viewer.w > 200, JSON.stringify(viewer));
  check("...and named for whoever it belongs to", !!viewer && /Ada/.test(viewer.alt || ""), JSON.stringify(viewer && viewer.alt));

  // a monogram is a letter and is deliberately NOT worth enlarging — the caller passes no src
  await page.evaluate(() => { const v = document.querySelector(".iv-close"); if (v) v.click(); });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.__folioAvatarView("", "Ada"));
  await page.waitForTimeout(250);
  check("a reader with no photo opens no viewer", !(await page.evaluate(() => !!document.querySelector(".img-viewer"))));

  check("no page errors anywhere", errs.length === 0, errs.slice(0, 3).join(" | "));

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
