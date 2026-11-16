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
const { isNoise } = require("./test-noise.js");
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
const del = { calls: 0, live: false, after: [] }, namePatches = [];   // the delete RPC: a 404 until `live` (a database without section 18)
const PROFILE = { id: UID, username: "scholar", name: "Scholar", role: "admin", joined: "2026-01-01T00:00:00Z" };

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const errs = [];
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
  page.on("pageerror", (e) => errs.push(String(e)));

  await page.route(/supabase\.co/, async (route) => {
    const url = new URL(route.request().url()), p = url.pathname;
    const json = (body, status) => route.fulfill({ status: status || 200, contentType: "application/json", headers: { "content-range": "0-0/7", "access-control-expose-headers": "content-range" }, body: JSON.stringify(body) });
    if (p === "/auth/v1/token") return json({ access_token: "tok", refresh_token: "ref", expires_in: 3600, user: { id: UID, email: "a@b.c" } });
    if (p === "/auth/v1/user") return json({ id: UID, email: "a@b.c" });
    if (del.live && (p === "/auth/v1/logout" || (p === "/rest/v1/progress" && route.request().method() !== "GET"))) del.after.push(p);
    if (p === "/rest/v1/rpc/delete_my_account") { del.calls++; return del.live ? json(true) : json({ message: "Could not find the function public.delete_my_account" }, 404); }
    if (p === "/rest/v1/profiles" && route.request().method() === "PATCH") { try { const b = JSON.parse(route.request().postData() || "{}"); if ("name" in b) namePatches.push(b.name); } catch (e) {} return json([PROFILE]); }
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

  /* THE ACCOUNT'S CONTROLS ARE BEHIND ONE BUTTON (Nov 2026, out of the page audit). They were five buttons
     in the hero — a third of it on a phone, for things done a few times a year — and are now a fold that
     "Manage account" opens: the grid of actions, the sync line under it, and the panel each action owns.
     What is asserted is the SHAPE, as before: a grid of `1fr` columns, so the buttons are one size rather
     than six sized by their own words, pinned BY NAME so a missing control is named when it goes. */
  const hero = await page.evaluate(() => ({
    toggle: !!document.querySelector(".profile #mgToggle"),
    heroButtons: document.querySelectorAll(".profile .ghost-btn").length,
    shut: !!document.querySelector("#mgPanel") && document.querySelector("#mgPanel").hidden,
    stray: !!document.querySelector(".profile #signout, .profile #pwToggle"),
  }));
  check("the hero carries one account button, Manage account", hero.toggle && hero.heroButtons === 1 && !hero.stray, JSON.stringify(hero));
  check("…and its fold starts shut", hero.shut, JSON.stringify(hero));
  await page.evaluate(() => document.querySelector("#mgToggle").click());
  await page.waitForTimeout(200);
  const a = await page.evaluate(() => {
    const pw = document.querySelector("#pwToggle"), so = document.querySelector("#signout"), note = document.querySelector(".acct-syncnote"), stats = document.querySelector(".ph-stats");
    if (!pw || !so || !note) return { missing: !pw ? "pwToggle" : !so ? "signout" : "note" };
    const box = pw.parentElement;
    const btns = [...box.querySelectorAll(".ghost-btn")];
    const p = pw.getBoundingClientRect(), n = note.getBoundingClientRect(), st = stats.getBoundingClientRect();
    const cols = getComputedStyle(box).gridTemplateColumns.trim().split(/\s+/).length;
    const w = btns.map((b) => Math.round(b.getBoundingClientRect().width));
    const last = btns[btns.length - 1].getBoundingClientRect();
    return {
      cols, buttons: btns.length, ids: btns.map((b) => b.id).join(","),
      oneWidth: w.length > 1 && Math.max(...w) - Math.min(...w) < 2 && w[0] > 0,
      open: !document.querySelector("#mgPanel").hidden,
      inFold: !!pw.closest("#mgPanel") && !!note.closest("#mgPanel"),
      noteBelowButtons: n.top >= last.bottom - 1,
      noteAboveStats: n.bottom <= st.top + 1,
      expanded: document.querySelector("#mgToggle").getAttribute("aria-expanded"),
    };
  });
  check("Manage account opens a grid of equal buttons", a.open && a.cols === 3 && a.oneWidth && a.expanded === "true", JSON.stringify(a));
  check("...carrying every action the account has", a.ids === "unToggle,emToggle,pwToggle,swToggle,signout,delToggle", a.ids);
  check("the sync note sits directly below them, inside the fold", a.inFold && a.noteBelowButtons && a.noteAboveStats, JSON.stringify(a));

  await page.evaluate(() => document.querySelector("#pwToggle").click());
  await page.waitForTimeout(250);
  check("Change password still opens its panel", await page.evaluate(() => { const p = document.querySelector("#pwPanel"); return !!p && !p.hidden; }));
  check("…whose field is labelled above it, like the sign-in form's", await page.evaluate(() => getComputedStyle(document.querySelector("#pwPanel label")).flexDirection === "column"));

  /* DELETING THE ACCOUNT, ON A DATABASE THAT HAS NOT RUN SECTION 18. The mock answers the RPC with a 404
     until `del.live` is set (the last block of this file), so this is the degraded half: the username must
     be typed, and a missing function is a sentence rather than a silent failure or a deleted session. */
  await page.evaluate(() => document.querySelector("#delToggle").click());
  await page.fill("#delPw", "hunter2!");
  await page.fill("#delName", "somebody_else");
  await page.click("#delSave");
  await page.waitForTimeout(300);
  const d1 = await page.evaluate(() => ({ msg: document.querySelector("#delMsg").textContent, pwShut: document.querySelector("#pwPanel").hidden }));
  check("Delete account refuses until the username is typed", /type your username/i.test(d1.msg) && del.calls === 0, JSON.stringify(d1) + " calls=" + del.calls);
  check("…and opening it closed the password panel", d1.pwShut);
  await page.fill("#delName", "scholar");
  await page.click("#delSave");
  await page.waitForTimeout(600);
  const d2 = await page.evaluate(() => ({ msg: document.querySelector("#delMsg").textContent, session: !!localStorage.getItem("folio_supa_v1"), btn: document.querySelector("#delSave").disabled }));
  check("…and says so in a sentence where the database has no such function", /isn't set up/i.test(d2.msg) && del.calls === 1 && d2.session && !d2.btn, JSON.stringify(d2));

  /* ONE ROW OF FIGURES. The page carried a second grid further down that repeated three of the hero's
     tiles under other names; Due now and Mature moved up and that grid is gone. */
  const tiles = await page.evaluate(() => ({ labels: [...document.querySelectorAll(".ph-stats .ph-stat span")].map((x) => x.textContent.trim()).join("|"), second: !!document.querySelector("#statWrap, .statgrid") }));
  check("the figures are one row of six", tiles.labels === "Cards studied|Day streak|Due now|Mature|Badges|Quiz wins" && !tiles.second, JSON.stringify(tiles));

  /* THE FOUR TABS. Every panel is in the document and one is shown; the Statistics panel's contents are
     drawn the first time it is opened. */
  const t0 = await page.evaluate(() => ({
    tabs: [...document.querySelectorAll('.acct-tabs [role="tab"]')].map((t) => t.dataset.atab + ":" + t.getAttribute("aria-selected")).join(","),
    shown: [...document.querySelectorAll("[data-apanel]")].filter((p) => !p.hidden).map((p) => p.dataset.apanel).join(","),
    statsDrawn: !!document.querySelector("#reviewStats .rs-card"),
    links: [...document.querySelectorAll(".acct-links [data-exgo]")].map((b) => b.dataset.exgo + ":" + Math.round(b.getBoundingClientRect().width)),
  }));
  check("the page is four tabs, Overview first", t0.tabs === "overview:true,stats:false,badges:false,friends:false" && t0.shown === "overview", JSON.stringify(t0));
  check("…with the statistics not drawn until they are asked for", !t0.statsDrawn);
  check("the three ways into your cards are one row of one width", t0.links.length === 3 && new Set(t0.links.map((l) => l.split(":")[1])).size === 1 && t0.links.map((l) => l.split(":")[0]).join(",") === "browse,weak,year", t0.links.join(" "));
  await page.evaluate(() => document.querySelector('[data-atab="stats"]').click());
  await page.waitForTimeout(400);
  const t1 = await page.evaluate(() => ({
    shown: [...document.querySelectorAll("[data-apanel]")].filter((p) => !p.hidden).map((p) => p.dataset.apanel).join(","),
    sel: document.querySelector('[data-atab="stats"]').getAttribute("aria-selected"),
    heat: !!document.querySelector("#reviewStats .rs-heat"),
    folds: [...document.querySelectorAll('[data-apanel="stats"] .suspbox-head')].map((h) => h.querySelector(".suspbox-title").textContent.replace(/\s+/g, " ").trim() + ":" + h.getAttribute("aria-expanded")).join("|"),
    labels: [...document.querySelectorAll('[data-apanel="stats"] .section-label')].map((l) => l.textContent.trim()).join("|"),
  }));
  check("Statistics shows its panel and draws it", t1.shown === "stats" && t1.sel === "true" && t1.heat, JSON.stringify(t1));
  check("…with Progress by deck and Suspended cards folded shut, each under one name", /^Progress by deck \(\d+\):false\|Suspended cards \(\d+\):false$/.test(t1.folds) && !/progress by deck|suspended/i.test(t1.labels), JSON.stringify(t1));
  // …and the glossary meter is a link on your OWN record
  check("the glossary meter links to the discovered list", await page.evaluate(() => !!document.querySelector('[data-exgo="glossary"]')));
  await page.evaluate(() => document.querySelector('[data-atab="stats"]').dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
  await page.waitForTimeout(200);
  const t2 = await page.evaluate(() => ({
    shown: [...document.querySelectorAll("[data-apanel]")].filter((p) => !p.hidden).map((p) => p.dataset.apanel).join(","),
    focus: document.activeElement && document.activeElement.dataset.atab,
    all: document.querySelectorAll("#badgesBox .badge").length, up: document.querySelectorAll("#badgesBox .badges:not(.badges-rest) .badge").length,
    restShut: !!document.querySelector("#badgesBox .badges-rest") && document.querySelector("#badgesBox .badges-rest").hidden,
    more: (document.querySelector("#badgesBox .more-btn") || {}).textContent || "",
  }));
  check("the right arrow moves to Badges", t2.shown === "badges" && t2.focus === "badges", JSON.stringify(t2));
  check("…which shows what is earned and the nearest few, the rest behind one button", t2.up < t2.all && t2.up <= 12 && t2.restShut && new RegExp("^Show the other " + (t2.all - t2.up) + " badges$").test(t2.more), JSON.stringify(t2));
  await page.evaluate(() => document.querySelector("#badgesBox .more-btn").click());
  check("…that opens them", await page.evaluate(() => !document.querySelector("#badgesBox .badges-rest").hidden && document.querySelector("#badgesBox .more-btn").getAttribute("aria-expanded") === "true"));
  await page.evaluate(() => document.querySelector('[data-atab="overview"]').click());
  const cl = await page.evaluate(() => ({
    rows: document.querySelectorAll("#collLevels > .cl-row").length, rest: document.querySelectorAll("#collLevels .cl-rest .cl-row").length,
    restShut: (document.querySelector("#collLevels .cl-rest") || {}).hidden, empty: !!document.querySelector("#collLevels > .cl-empty"),
    twins: [...document.querySelectorAll("#collLevels .cl-name")].filter((n) => /^United States/.test(n.textContent)).map((n) => n.textContent.trim()).join("|"),
  }));
  check("Collection progress lists only what has been started", cl.rows === 0 && cl.empty && cl.rest > 10 && cl.restShut === true, JSON.stringify(cl));
  check("…and two collections of one name say which they are", cl.twins === "United States|United StatesGeography", cl.twins);

  /* A NAME IN ANY ALPHABET. The filter kept a-z and 0-9 and dropped the rest in silence, so "José" was
     saved as "Jos"; and it wrote on `change` and again on the `blur` behind it. */
  const patches0 = namePatches.length;
  await page.fill("#name", "José Ωmega 李");
  await page.evaluate(() => { const n = document.querySelector("#name"); n.dispatchEvent(new Event("change", { bubbles: true })); n.dispatchEvent(new Event("blur")); n.dispatchEvent(new Event("blur")); });
  await page.waitForTimeout(400);
  const nm = await page.evaluate(() => ({ field: document.querySelector("#name").value, stored: JSON.parse(localStorage.getItem("folio_v1")).user.name }));
  check("a name keeps its letters in any script", nm.field === "José Ωmega 李" && nm.stored === "José Ωmega 李", JSON.stringify(nm));
  check("…and is sent to the account once", namePatches.length - patches0 === 1 && namePatches[namePatches.length - 1] === "José Ωmega 李", JSON.stringify(namePatches.slice(patches0)));

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
  /* IT ROUTES NOW RATHER THAN RAISING AN OVERLAY (Aug 2026, on request: "the Reliquary should be its own
     page"). Your own collection is a page — an address, a back button and a sort you can leave set; a
     FRIEND'S is still `openCollectionWin`, because a route carries a name and nothing else and there is
     nowhere for somebody else's progress to ride. So what this asserts is that pressing the button LEAVES
     this page for that one, and that no overlay is raised over it on the way — an overlay left behind
     would sit over the page and look exactly like the page having failed to draw. */
  const coll = await page.evaluate(() => ({
    hash: location.hash,
    tiles: document.querySelectorAll("#rqGrid .ar-tile").length,
    head: (document.querySelector(".page-head h1") || {}).textContent || "",
    overlay: !!document.querySelector(".collection-pop"),
  }));
  check("…which goes to the Reliquary's own page", coll.hash === "#reliquary" && coll.tiles === 2, JSON.stringify(coll));
  check("…headed as such, with no overlay left over it", /reliquary/i.test(coll.head) && !coll.overlay, JSON.stringify(coll));
  await page.evaluate(() => { location.hash = "account"; });
  await page.waitForTimeout(600);
  check("…and going back leaves nothing behind", await page.evaluate(() => !document.querySelector(".ar-collwin") && !!document.querySelector("#showcase")));

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

  /* …AND THE DELETE THAT WORKS, last, because it ends the session everything above needed. The function
     answers `true`; the device is signed out WITHOUT a final push or a logout call (there is no account
     left to send either to) and the page is the sign-in form again. */
  del.live = true;
  await page.evaluate(() => { location.hash = "account"; });
  await page.waitForTimeout(900);
  await page.evaluate(() => { document.querySelector("#mgToggle").click(); document.querySelector("#delToggle").click(); });
  await page.fill("#delPw", "hunter2!");
  await page.fill("#delName", "@Scholar");
  await page.click("#delSave");
  await page.waitForTimeout(1500);
  const gone = await page.evaluate(() => ({ form: !!document.querySelector(".auth-card"), session: !!localStorage.getItem("folio_supa_v1") }));
  check("Delete account, confirmed, ends at the sign-in form with no session", gone.form && !gone.session, JSON.stringify(gone));
  check("…without pushing to, or logging out of, an account that is gone", del.calls === 2 && del.after.length === 0, "calls=" + del.calls + " " + del.after.join(","));
  const so = await page.evaluate(() => ({
    tabs: [...document.querySelectorAll('.auth-tabs [role="tab"]')].map((t) => t.dataset.av + ":" + t.getAttribute("aria-selected")).join(","),
    forgot: !!document.querySelector('.auth-form[data-form="signin"] [data-av="forgot"]'),
  }));
  check("signed out, the form is two tabs with Forgot password under the password", so.tabs === "signin:true,register:false" && so.forgot, JSON.stringify(so));
  await page.click('.auth-form[data-form="signin"] [data-av="forgot"]');
  const fg = await page.evaluate(() => ({ shown: [...document.querySelectorAll(".auth-form")].filter((f) => !f.hidden).map((f) => f.dataset.form).join(","), back: !!document.querySelector('.auth-form[data-form="forgot"] [data-av="signin"]') }));
  check("…which opens the reset form, with a way back", fg.shown === "forgot" && fg.back, JSON.stringify(fg));

  check("no console errors", errs.length === 0, errs.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
