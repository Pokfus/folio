#!/usr/bin/env node
/* Folio — the SIGNED-IN account page, and the Edit dashboard's account figures.
   =============================================================================
   Both need a session, and neither can be reached without one — which is why they are not in
   test-layout.js or test-admin-editor.js. Supabase is a page.route stand-in, deliberately and for the same
   reason as test-publish.js's mock: the publishable key in app.js points at the REAL project, so a test
   that really signed in would touch it. Like that mock, this is a stand-in for the policies, never a proof
   that the row-level security is right.

   What it guards:
     · Change password sits beside Sign out inside the profile card, with the sync line under the two of
       them (Aug 2026, on request). A button that drifts back down among the photo controls breaks nothing
       and throws nothing.
     · The dashboard's People panel is filled from the database, and says in prose what row-level security
       will not let it count — there is no site-wide "cards studied" figure, and none may be invented.
     · The Content-Range header the counts arrive in is NOT CORS-safelisted: it is readable only because
       Supabase names it in Access-Control-Expose-Headers. A mock that forgets that header reports a
       connection failure that is really a CORS one, so the mock here sends it on purpose.
     · The Profile showcase's "See all" button (Aug 2026, on request), which lives here rather than in
       test-artefacts.js because the SIGNED-OUT account page has no showcase — a showcase is four artefacts
       chosen to be seen, and there is nobody to see a guest's. It opens the whole collection, it is absent
       when the reader holds nothing, and — the half that fails silently — it opens THEIR collection on a
       friend's profile rather than yours.

   Run:  NODE_PATH=<playwright>/node_modules node .claude/test-account-page.js
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

const UID = "00000000-0000-4000-8000-100000000001";
const PROFILE = { id: UID, username: "scholar", name: "Scholar", role: "admin", joined: "2026-01-01T00:00:00Z" };

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const errs = [];
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !/net::ERR_/.test(t)) errs.push(t); });
  page.on("pageerror", (e) => errs.push(String(e)));

  await page.route(/supabase\.co/, async (route) => {
    const url = new URL(route.request().url()), p = url.pathname;
    const json = (body, status) => route.fulfill({ status: status || 200, contentType: "application/json", headers: { "content-range": "0-0/7", "access-control-expose-headers": "content-range" }, body: JSON.stringify(body) });
    if (p === "/auth/v1/token") return json({ access_token: "tok", refresh_token: "ref", expires_in: 3600, user: { id: UID, email: "a@b.c" } });
    if (p === "/auth/v1/user") return json({ id: UID, email: "a@b.c" });
    if (p === "/rest/v1/profiles") return json([PROFILE]);
    if (p === "/rest/v1/progress") return json([{ user_id: UID, data: {}, updated_at: "2026-01-02T00:00:00Z" }]);
    if (p === "/rest/v1/friends") return json([]);
    if (p === "/rest/v1/content_overrides") return json([]);
    return json([]);
  });

  await page.goto(base, { waitUntil: "load" });
  await page.evaluate((uid) => {
    localStorage.setItem("folio_supa_v1", JSON.stringify({ access_token: "tok", refresh_token: "ref", expires_at: Date.now() + 3600000, user: { id: uid, email: "a@b.c" } }));
  }, UID);
  // a goto that differs only in the #fragment is a SAME-DOCUMENT navigation — the app never reboots and
  // never reads the session just planted. Reload is what makes it a fresh start (see CLAUDE.md, Testing).
  await page.evaluate(() => { location.hash = "account"; });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(2600);

  /* THE FOUR ACCOUNT ACTIONS ARE A 2×2 GRID, not the one row they were until Aug 2026 — four buttons side
     by side ran to the width of the card and squeezed the name and handle beside them into what was left.
     So what is asserted is the GRID: two columns, four buttons of ONE width (the columns are `1fr` exactly
     so the four are the same size rather than four different label widths), and Change password above Sign
     out in the same block. Reading "are they on one row" would now pass only on a regression. */
  const a = await page.evaluate(() => {
    const pw = document.querySelector("#pwToggle"), so = document.querySelector("#signout"), note = document.querySelector(".acct-syncnote"), stats = document.querySelector(".ph-stats");
    if (!pw || !so || !note) return { missing: !pw ? "pwToggle" : !so ? "signout" : "note" };
    const box = pw.parentElement;
    const btns = [...box.querySelectorAll(".ghost-btn")];
    const p = pw.getBoundingClientRect(), s = so.getBoundingClientRect(), n = note.getBoundingClientRect(), st = stats.getBoundingClientRect();
    const cols = getComputedStyle(box).gridTemplateColumns.trim().split(/\s+/).length;
    const w = btns.map((b) => Math.round(b.getBoundingClientRect().width));
    return {
      cols, buttons: btns.length,
      oneWidth: w.length > 1 && Math.max(...w) - Math.min(...w) < 2,
      siblings: pw.parentElement === so.parentElement,
      stacked: s.top > p.top + 4,
      inProfile: !!pw.closest(".profile"),
      noteBelowButtons: n.top >= Math.min(p.bottom, s.bottom) - 1,
      noteAboveStats: n.bottom <= st.top + 1,
      order: pw.compareDocumentPosition(so) & Node.DOCUMENT_POSITION_FOLLOWING ? "pw,signout" : "signout,pw",
    };
  });
  check("the four account actions are a 2×2 grid", a.cols === 2 && a.buttons === 4 && a.siblings, JSON.stringify(a));
  check("…with the four buttons one size rather than four", a.oneWidth, JSON.stringify(a));
  check("…inside the profile card", a.inProfile, JSON.stringify(a));
  check("the sync note sits directly below them", a.noteBelowButtons && a.noteAboveStats, JSON.stringify(a));
  check("nothing else was left in the old tools row", await page.evaluate(() => !document.querySelector(".acct-tools #pwToggle, .acct-tools .auth-note")));

  await page.evaluate(() => document.querySelector("#pwToggle").click());
  await page.waitForTimeout(250);
  check("Change password still opens its panel", await page.evaluate(() => { const p = document.querySelector("#pwPanel"); return !!p && !p.hidden; }));

  // …and the glossary meter is a link on your OWN record
  check("the glossary meter links to the discovered list", await page.evaluate(() => !!document.querySelector('[data-exgo="glossary"]')));

  /* ---- the Profile showcase's way in to the whole collection ----
     With nothing collected there must be no button: "See all 0" is a control that does nothing. Then two
     artefacts are planted and the page re-rendered, which is also the cheapest proof that the label counts
     what the reader actually holds rather than the size of the pool. */
  check("an empty collection carries no 'See all'", await page.evaluate(() => !document.querySelector("#showcase [data-arall]")));
  const owned = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("folio_v1"));
    const ids = (window.ARTEFACTS || []).slice(0, 2).map((a) => a.id);
    s.artefacts = {}; ids.forEach((id, i) => { s.artefacts[id] = Date.now() - i * 1000; });
    localStorage.setItem("folio_v1", JSON.stringify(s));
    return ids;
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(2200);
  /* The button reads "See Reliquary" since Aug 2026 and the COUNT moved into its title — the label names
     the place it opens, which a reader can act on, where a bare figure named only a quantity. So the count
     is read off the title; asserting it in the text would be pinning the label the button no longer has. */
  const all = (await page.evaluate(() => { const b = document.querySelector("#showcase [data-arall]"); return b && { text: b.textContent.trim(), title: b.getAttribute("title") || "" }; })) || {};
  check("…and a collection of two carries one", /\b2 artefacts\b/.test(all.title || ""), JSON.stringify(all) + " (" + owned.join(", ") + ")");
  await page.evaluate(() => document.querySelector("#showcase [data-arall]").click());
  await page.waitForTimeout(400);
  const coll = await page.evaluate(() => {
    const w = document.querySelector(".collection-pop .ar-collwin");
    return { open: !!w, tiles: w ? w.querySelectorAll(".ar-tile").length : -1, head: w ? w.querySelector(".ar-collhead").textContent : "" };
  });
  check("…which opens the collection", coll.open && coll.tiles === 2, JSON.stringify(coll));
  check("…headed as the reader's own", /your/i.test(coll.head), coll.head);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);
  check("…and Escape closes it", await page.evaluate(() => !document.querySelector(".ar-collwin")));

  // the Edit page's dashboard reaches the account database through the same mock
  await page.evaluate(() => { location.hash = "admin"; });
  await page.waitForTimeout(2500);
  const d = await page.evaluate(() => ({
    dash: !!document.querySelector(".dsh-wrap"),
    people: [...document.querySelectorAll(".dsh-card")].map((c) => c.querySelector("h3").textContent),
    remoteTiles: [...document.querySelectorAll(".dsh-card")].filter((c) => /People/.test(c.querySelector("h3").textContent)).map((c) => [...c.querySelectorAll(".dsh-tile b")].map((b) => b.textContent))[0],
    note: [...document.querySelectorAll(".dsh-note")].some((n) => /readable only by that reader/.test(n.textContent)),
  }));
  check("the dashboard opens the editor", d.dash, JSON.stringify(d.people));
  check("…and fills its People panel from the database", d.remoteTiles && d.remoteTiles.length === 7 && d.remoteTiles.every((v) => v === "7"), JSON.stringify(d.remoteTiles));
  check("…and says plainly what it cannot count", d.note);

  check("no console errors", errs.length === 0, errs.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
