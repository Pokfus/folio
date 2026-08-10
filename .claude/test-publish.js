// End-to-end test for community deck PUBLISHING (phase 2), against a mock Supabase.
//
// The mock is not a nicety: the publishable key in app.js points at the real project, and a test that
// really published would write rows into it. Everything below runs against an in-memory stand-in for the
// REST endpoints the app uses, so the test is hermetic and safe to run anywhere.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-publish.js
//   FOLIO_CHROMIUM=<path to chrome>   if Chromium lives outside the playwright package
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const SUPA = /^https:\/\/[a-z0-9]+\.supabase\.co/;

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

// ---------------------------------------------------------------- the mock backend
function makeDb() {
  return { decks: [], cards: [], installs: [], reports: [], ratings: [], seq: 0 };
}
// stand-in for sync_deck_rating() + the rank_score generated column
function syncRatings(db, deckId) {
  const d = db.decks.find((x) => x.id === deckId);
  if (!d) return;
  const rs = db.ratings.filter((r) => r.deck_id === deckId);
  d.rating_count = rs.length;
  d.rating_avg = rs.length ? Math.round((rs.reduce((a, r) => a + r.stars, 0) / rs.length) * 100) / 100 : 0;
  for (let i = 1; i <= 5; i++) d["rating_" + i] = rs.filter((r) => r.stars === i).length;
  d.rank_score = (d.rating_count / (d.rating_count + 10)) * d.rating_avg + (10 / (d.rating_count + 10)) * 3.5;
}
// columns a non-admin client may never set: maintained by triggers or reserved for editors
const GUARDED = ["owner", "card_count", "install_count", "rating_avg", "rating_count",
  "rating_1", "rating_2", "rating_3", "rating_4", "rating_5", "staff_pick", "created_at"];
function uuid(n) { return "00000000-0000-4000-8000-" + String(100000000000 + n).slice(0, 12); }

/* PostgREST hands back at most `db-max-rows` rows and says nothing about the ones it dropped, so a client
   that does not ask for a range gets a silently truncated array — a short deck and a truncated one look
   exactly alike. That is what this simulates, and the shape of the simulation matters:

   a request WITH a Range is served in full, up to the window it asked for; a request WITHOUT one is
   truncated to MOCK_PAGE. It is deliberately NOT a cap below the client's own page size, which would be a
   server no client could page correctly at all — asking for 1,000 and being given 3 is indistinguishable
   from a table that holds 3, so the loop would stop and be right to. What is under test is therefore the
   thing that was actually wrong: whether the client asks for a range at all. Range is `first-last`
   inclusive, as PostgREST reads it. */
const MOCK_PAGE = 3;
function pageRows(rows, headers) {
  const r = /^(\d+)-(\d+)$/.exec(String((headers && (headers.range || headers.Range)) || ""));
  if (!r) return rows.slice(0, MOCK_PAGE);
  return rows.slice(+r[1], +r[1] + (+r[2] - +r[1] + 1));
}

function handleSupa(db, url, method, body, asUser, headers) {
  const u = new URL(url);
  const p = u.pathname;
  const eqOf = (param) => { const v = u.searchParams.get(param); return v && v.startsWith("eq.") ? v.slice(3) : null; };

  if (p === "/auth/v1/user") return [200, { id: asUser.id, email: asUser.email }];
  if (p.startsWith("/rest/v1/profiles")) return [200, [{ id: asUser.id, username: asUser.username, name: asUser.name, role: asUser.role, joined: "2026-01-01" }]];
  if (p.startsWith("/rest/v1/progress")) return method === "GET" ? [200, [{ data: {}, updated_at: "2026-01-01T00:00:00Z" }]] : [200, [{ updated_at: "2026-01-01T00:00:00Z" }]];
  if (p.startsWith("/rest/v1/content_overrides")) return [200, [{ data: {}, updated_at: "2026-01-01T00:00:00Z" }]];
  if (p.startsWith("/rest/v1/friends")) return [200, []];

  if (p === "/rest/v1/user_decks") {
    if (method === "POST") {
      if (db.decks.some((d) => d.slug === body.slug)) return [409, { message: "duplicate key value violates unique constraint" }];
      const row = Object.assign({
        id: uuid(++db.seq), owner: asUser.id, card_count: 0, install_count: 0, rating_avg: 0, rating_count: 0,
        rating_1: 0, rating_2: 0, rating_3: 0, rating_4: 0, rating_5: 0, rank_score: 3.5,
        staff_pick: false, forked_from: null,
        price_cents: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }, (function () { const b = Object.assign({}, body); if (asUser.role !== "admin") GUARDED.forEach((k) => delete b[k]); return b; })());
      row.owner = asUser.role === "admin" && body.owner ? body.owner : asUser.id;
      db.decks.push(row);
      return [201, [row]];
    }
    if (method === "PATCH") {
      const id = eqOf("id");
      const row = db.decks.find((d) => d.id === id);
      if (!row) return [404, { message: "not found" }];
      if (row.owner !== asUser.id && asUser.role !== "admin") return [403, { message: "row-level security" }];   // mirrors the RLS policy
      const patch = Object.assign({}, body);
      if (asUser.role !== "admin") GUARDED.forEach((k) => delete patch[k]);   // mirrors guard_user_deck_columns()
      Object.assign(row, patch, { updated_at: new Date().toISOString() });
      return [200, [row]];
    }
    /* The "delete your own decks" policy, and the cascades hanging off it. Two things here are the whole
       point of the test that uses it. RLS picks ROWS, so a DELETE that matches none is not an error: it
       answers 204 having removed nothing, exactly as a delete by a non-owner does — which is why the app
       asks for the rows back instead of trusting the status. And the cards, installs, ratings and reports
       go with the deck because their foreign keys say `on delete cascade`; a mock that kept them would let
       an orphaned-row bug pass unnoticed here. */
    if (method === "DELETE") {
      const id = eqOf("id");
      const gone = db.decks.filter((d) => d.id === id && (d.owner === asUser.id || asUser.role === "admin"));
      db.decks = db.decks.filter((d) => gone.indexOf(d) < 0);
      gone.forEach((d) => {
        db.cards = db.cards.filter((c) => c.deck_id !== d.id);
        db.installs = db.installs.filter((i) => i.deck_id !== d.id);
        db.ratings = db.ratings.filter((r) => r.deck_id !== d.id);
        db.reports = db.reports.filter((r) => r.deck_id !== d.id);
      });
      const wants = /return=representation/.test(String((headers && (headers.prefer || headers.Prefer)) || ""));
      return wants ? [200, gone] : [204, null];
    }
    // GET
    const id = eqOf("id"), slug = eqOf("slug"), status = eqOf("status"), owner = eqOf("owner");
    const inIds = (u.searchParams.get("id") || "").startsWith("in.")
      ? (u.searchParams.get("id") || "").slice(4, -1).split(",") : null;
    let rows = db.decks.slice();
    // the select policy: published, or your own, or admin
    rows = rows.filter((d) => d.status === "published" || d.owner === asUser.id || asUser.role === "admin");
    if (id) rows = rows.filter((d) => d.id === id);
    if (inIds) rows = rows.filter((d) => inIds.indexOf(d.id) >= 0);
    if (owner) rows = rows.filter((d) => d.owner === owner);
    if (slug) rows = rows.filter((d) => d.slug === slug);
    if (status) rows = rows.filter((d) => d.status === status);
    const or = u.searchParams.get("or");
    if (or) {
      const m = /ilike\.\*([^*)]*)\*/.exec(or);
      if (m) { const t = decodeURIComponent(m[1]).toLowerCase(); rows = rows.filter((d) => ((d.title || "") + " " + (d.subtitle || "") + " " + (d.description || "")).toLowerCase().includes(t)); }
    }
    const order = u.searchParams.get("order") || "";
    if (u.searchParams.get("staff_pick") === "is.true") rows = rows.filter((d) => d.staff_pick);
    if (order.startsWith("rank_score.desc")) rows.sort((a, b) => (b.rank_score - a.rank_score) || (b.rating_count - a.rating_count));
    else if (order.startsWith("title.asc")) rows.sort((a, b) => a.title.localeCompare(b.title));
    else if (order.startsWith("install_count.desc")) rows.sort((a, b) => b.install_count - a.install_count);
    else rows.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
    return [200, rows];
  }

  if (p === "/rest/v1/user_cards") {
    if (method === "POST") {
      const rows = Array.isArray(body) ? body : [body];
      const deck = db.decks.find((d) => d.id === rows[0] && rows[0].deck_id);
      rows.forEach((r) => db.cards.push(r));
      const dk = db.decks.find((d) => d.id === rows[0].deck_id);
      if (dk) dk.card_count = db.cards.filter((c) => c.deck_id === dk.id).length;   // the count trigger
      return [201, rows];
    }
    if (method === "DELETE") {
      const id = eqOf("deck_id");
      db.cards = db.cards.filter((c) => c.deck_id !== id);
      const dk = db.decks.find((d) => d.id === id);
      if (dk) dk.card_count = 0;
      return [204, null];
    }
    const id = eqOf("deck_id");
    return [200, pageRows(db.cards.filter((c) => c.deck_id === id).sort((a, b) => a.ord - b.ord), headers)];
  }

  if (p === "/rest/v1/deck_installs") {
    if (method === "POST") {
      if (!db.installs.some((i) => i.deck_id === body.deck_id && i.user_id === body.user_id)) db.installs.push(body);
      const dk = db.decks.find((d) => d.id === body.deck_id);
      if (dk) dk.install_count = db.installs.filter((i) => i.deck_id === dk.id).length;
      return [201, [body]];
    }
    if (method === "DELETE") {
      const d = eqOf("deck_id"), usr = eqOf("user_id");
      db.installs = db.installs.filter((i) => !(i.deck_id === d && i.user_id === usr));
      const dk = db.decks.find((x) => x.id === d);
      if (dk) dk.install_count = db.installs.filter((i) => i.deck_id === dk.id).length;
      return [204, null];
    }
    return [200, db.installs.filter((i) => i.user_id === asUser.id)];
  }

  if (p === "/rest/v1/deck_ratings") {
    if (method === "POST") {
      const deck = db.decks.find((x) => x.id === body.deck_id);
      // mirrors the insert policy: published deck, not your own, rating as yourself
      if (!deck || deck.status !== "published" || deck.owner === asUser.id || body.user_id !== asUser.id) return [403, { message: "row-level security" }];
      const ex = db.ratings.find((r) => r.deck_id === body.deck_id && r.user_id === body.user_id);
      if (ex) Object.assign(ex, body, { updated_at: new Date().toISOString() });
      else db.ratings.push(Object.assign({ created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, body));
      syncRatings(db, body.deck_id);
      return [201, [body]];
    }
    if (method === "DELETE") {
      const d = eqOf("deck_id"), usr = eqOf("user_id");
      if (usr !== asUser.id) return [403, { message: "row-level security" }];
      db.ratings = db.ratings.filter((r) => !(r.deck_id === d && r.user_id === usr));
      syncRatings(db, d);
      return [204, null];
    }
    const d = eqOf("deck_id"), usr = eqOf("user_id");
    let rows = db.ratings.filter((r) => r.deck_id === d);
    if (usr) rows = rows.filter((r) => r.user_id === usr);
    return [200, rows];
  }

  if (p === "/rest/v1/deck_reports") {
    if (method === "POST") { const row = Object.assign({ id: uuid(900 + db.reports.length), status: "open", created_at: new Date().toISOString() }, body); db.reports.push(row); return [201, [row]]; }
    if (method === "PATCH") { const id = eqOf("id"); const r = db.reports.find((x) => x.id === id); if (r) Object.assign(r, body); return [200, r ? [r] : []]; }
    if (asUser.role !== "admin") return [200, db.reports.filter((r) => r.reporter === asUser.id && r.status === "open")];
    return [200, db.reports.filter((r) => r.status === "open")];
  }

  return [404, { message: "mock: unhandled " + method + " " + p }];
}

async function attachMock(ctx, db, userRef) {
  await ctx.route((url) => SUPA.test(url.toString()), async (routeObj) => {
    const req = routeObj.request();
    let body = null;
    try { const pd = req.postData(); if (pd) body = JSON.parse(pd); } catch (e) {}
    let out;
    try { out = handleSupa(db, req.url(), req.method(), body, userRef.user, req.headers()); }
    catch (e) { out = [500, { message: "mock error: " + e.message }]; }
    await routeObj.fulfill({
      status: out[0],
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: out[1] === null ? "" : JSON.stringify(out[1]),
    });
  });
}

const ALICE = { id: "aaaaaaaa-0000-4000-8000-000000000001", email: "alice@test", username: "alice", name: "Alice", role: "user" };
const BOB = { id: "bbbbbbbb-0000-4000-8000-000000000002", email: "bob@test", username: "bob", name: "Bob", role: "user" };
const ADMIN = { id: "cccccccc-0000-4000-8000-000000000003", email: "root@test", username: "root", name: "Root", role: "admin" };

async function newSession(browser, db, who, base) {
  const ctx = await browser.newContext({ acceptDownloads: true });
  const ref = { user: who };
  await attachMock(ctx, db, ref);
  await ctx.addInitScript((u) => {
    localStorage.setItem("folio_supa_v1", JSON.stringify({
      access_token: "mock-token", refresh_token: "mock-refresh",
      expires_at: Date.now() + 3600e3, user: { id: u.id, email: u.email },
    }));
  }, who);
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|ERR_/.test(m.text())) errs.push("console: " + m.text().slice(0, 200)); });
  return { ctx, page, errs, ref };
}

// goto() to the URL the page is already on is a fragment-only navigation and does NOT reload — the app
// keeps running with its old state. Use this wherever a test means "load this page fresh".
async function gotoFresh(page, url) {
  if (page.url() === url) await page.reload({ waitUntil: "load" });
  else await page.goto(url, { waitUntil: "load" });
}
// open a named deck in the Studio, allowing for the fact that goto() to a fragment-only difference is a
// same-document navigation and may land in whatever view studioState already held
async function openDeckInStudio(page, base, title) {
  await page.goto(base + "#studio", { waitUntil: "load" });
  await page.waitForTimeout(1100);
  if (await page.evaluate(() => !!document.querySelector("#stAll"))) {
    const right = await page.evaluate((t) => ((document.querySelector(".studio-title") || {}).textContent || "") === t, title);
    if (right) return;
    await page.click("#stAll");
    await page.waitForTimeout(400);
  }
  await page.evaluate((t) => {
    const hit = [...document.querySelectorAll(".studio-deck-open")].find((r) => ((r.querySelector(".sd-title") || {}).textContent || "") === t);
    if (hit) hit.click();
  }, title);
  await page.waitForTimeout(600);
}
async function typeField(page, field, text) {
  const sel = '.studio-editor [data-field="' + field + '"]';
  await page.dblclick(sel);
  await page.click(sel);
  await page.keyboard.type(text, { delay: 3 });
  await page.click(".studio-title");
  await page.waitForTimeout(100);
}

(async () => {
  await new Promise((r) => server.listen(5630, r));
  const base = "http://127.0.0.1:5630/";
  const browser = await chromium.launch(LAUNCH);
  const db = makeDb();

  // ================= Alice writes and publishes a deck =================
  const A = await newSession(browser, db, ALICE, base);
  await A.page.goto(base + "#studio", { waitUntil: "load" });
  await A.page.waitForTimeout(1000);
  await A.page.click("#stNew");
  await A.page.waitForTimeout(400);
  await A.page.click(".studio-settings > summary");
  await A.page.fill('[data-meta="title"]', "Byzantine Emperors");
  await A.page.fill('[data-meta="subtitle"]', "From Constantine to 1453");
  await A.page.fill('[data-meta="desc"]', "The emperors who mattered, in order.");
  await A.page.waitForTimeout(200);
  await A.page.click("#stAddCard");
  await A.page.waitForTimeout(300);
  await typeField(A.page, "question", "The emperor who founded Constantinople was ___ the Great.");
  await typeField(A.page, "answer", "Constantine");
  await typeField(A.page, "abstract", "He moved the capital east in 330.");
  await A.page.waitForTimeout(300);

  check("publish strip shows unshared state", /Not shared/.test(await A.page.textContent(".sp-state")));
  await A.page.click("#stPublish");
  await A.page.waitForTimeout(900);
  check("deck row created on the server", db.decks.length === 1, JSON.stringify(db.decks.map((d) => d.slug)));
  check("cards uploaded as rows", db.cards.length === 1, "cards=" + db.cards.length);
  check("published status + version 1", db.decks[0].status === "published" && db.decks[0].version === 1,
    db.decks[0] ? db.decks[0].status + " v" + db.decks[0].version : "");
  check("card_count maintained", db.decks[0].card_count === 1, "count=" + db.decks[0].card_count);
  check("publish strip flips to shared", /Shared/.test(await A.page.textContent(".sp-state")));
  const aliceSlug = db.decks[0].slug;
  check("slug derived from the title", /^byzantine-emperors-/.test(aliceSlug), aliceSlug);

  // an edit after publishing should be reported as unpublished changes
  await typeField(A.page, "abstract", " He died in 337.");
  await A.page.waitForTimeout(400);
  await A.page.reload({ waitUntil: "load" });
  await A.page.waitForTimeout(1000);
  await A.page.click(".studio-deck-open");
  await A.page.waitForTimeout(500);

  // ================= Bob discovers and installs it =================
  const B = await newSession(browser, db, BOB, base);
  await B.page.goto(base + "#community", { waitUntil: "load" });
  await B.page.waitForTimeout(1200);
  check("browse lists the published deck", await B.page.evaluate(() => document.querySelectorAll(".cdeck").length === 1));
  // `.cdeck-list` since Aug 2026 — the shelf is a list of rows rather than a grid of tiles (on request)
  check("browse shows the title", /Byzantine Emperors/.test(await B.page.textContent(".cdeck-list")));

  await B.page.fill("#cq", "nothing-matches-this");
  await B.page.waitForTimeout(900);
  check("search filters", await B.page.evaluate(() => document.querySelectorAll(".cdeck").length === 0));
  await B.page.fill("#cq", "byzantine");
  await B.page.waitForTimeout(900);
  check("search finds by title", await B.page.evaluate(() => document.querySelectorAll(".cdeck").length === 1));

  await B.page.click(".cdeck");
  await B.page.waitForTimeout(900);
  check("deck page opens", await B.page.evaluate(() => !!document.querySelector(".ddetail-actions")));
  check("deck page URL is shareable", /#deck\//.test(B.page.url()), B.page.url());
  check("deck page warns it is not fact-checked", /not.*fact-check/i.test(await B.page.textContent(".ddetail-warn")));
  check("deck page shows a sample card", await B.page.evaluate(() => {
    const s = document.querySelector("#ddSample");
    return !!s && /Constantinople/.test(s.textContent || "");
  }));
  /* EVERYTHING ABOUT THE DECK IS ON ITS OWN PAGE (Aug 2026, on request): its information, the author's own
     description, a way to download the file, and other people's comments. Each is asserted for PRESENCE —
     the failure they share is a section quietly not rendering, which on a page of stacked blocks looks
     exactly like a deck that has nothing to say. */
  const dpage = await B.page.evaluate(() => ({
    desc: !!document.querySelector(".ddetail-desc h2"),
    // …and it says so when the author wrote nothing, rather than leaving a gap that reads as a load failure
    noDesc: !!document.querySelector(".ddetail-nodesc"),
    download: !!document.querySelector("#ddDownload"),
    comments: /comment/i.test((document.querySelector(".ddetail-reviews") || {}).textContent || ""),
  }));
  check("...the author's description has a place of its own, filled or not", dpage.desc, JSON.stringify(dpage));
  check("...a download link for the deck file", dpage.download, JSON.stringify(dpage));
  check("...and other people's comments, named as comments", dpage.comments, JSON.stringify(dpage));

  await B.page.click("#ddInstall");
  await B.page.waitForTimeout(1000);
  check("install recorded on the server", db.installs.length === 1, JSON.stringify(db.installs));
  check("install_count bumped", db.decks[0].install_count === 1);
  check("installed deck is local now", await B.page.evaluate(() => !!document.querySelector("#ddStudy")));

  await B.page.goto(base + "#decks", { waitUntil: "load" });
  await B.page.waitForTimeout(1100);
  const bobLib = await B.page.evaluate(() => ({
    row: !!document.querySelector(".collection.udeck-installed"),
    title: (document.querySelector(".collection.udeck .collection-title") || {}).textContent,
    tag: (document.querySelector(".collection.udeck .udeck-tag") || {}).textContent,
  }));
  check("installed deck in Bob's Library", bobLib.row && bobLib.title === "Byzantine Emperors", JSON.stringify(bobLib));
  check("marked as installed", bobLib.tag === "installed", bobLib.tag || "");

  await B.page.evaluate(() => document.querySelector(".collection.udeck [data-udeck]").click());
  await B.page.waitForTimeout(800);
  check("Bob can study the installed deck", await B.page.evaluate(() => !!document.querySelector("#reveal-btn")));

  await B.page.goto(base + "#studio", { waitUntil: "load" });
  await B.page.waitForTimeout(1000);
  await B.page.click(".studio-deck-open");
  await B.page.waitForTimeout(600);
  check("installed deck is read-only in the Studio", await B.page.evaluate(() =>
    !document.querySelector("#stAddCard") && !!document.querySelector("#stFork")));

  // ================= Alice ships an update; Bob picks it up =================
  await A.page.bringToFront();
  await A.page.click("#stPublish");
  await A.page.waitForTimeout(900);
  check("republish bumps the version", db.decks[0].version === 2, "v" + db.decks[0].version);
  check("republish replaces the cards", db.cards.length === 1 && /died in 337/.test(db.cards[0].data.abstract),
    db.cards.length + " cards");

  await B.page.goto(base + "#deck/" + aliceSlug, { waitUntil: "load" });
  await B.page.waitForTimeout(1200);
  check("deep link opens the deck page", await B.page.evaluate(() => !!document.querySelector(".ddetail-actions")));
  check("update is offered", await B.page.evaluate(() => !!document.querySelector("#ddUpdate")));
  await B.page.click("#ddUpdate");
  await B.page.waitForTimeout(1000);
  const updated = await B.page.evaluate(() => {
    const d = Object.keys(window).length; return d;
  });
  await B.page.goto(base + "#decks", { waitUntil: "load" });
  await B.page.waitForTimeout(1100);
  check("updated content reached Bob", await B.page.evaluate(async () => {
    const rows = [...document.querySelectorAll(".collection.udeck [data-udeck]")];
    if (!rows.length) return false;
    rows[0].click();
    await new Promise((r) => setTimeout(r, 700));
    const rb = document.querySelector("#reveal-btn");
    if (rb) rb.click();
    await new Promise((r) => setTimeout(r, 400));
    const ab = document.querySelector(".abstract");
    return !!ab && /died in 337/.test(ab.textContent || "");
  }));

  // ================= permissions: Bob cannot edit Alice's published row =================
  const forbidden = await B.page.evaluate(async (args) => {
    const r = await fetch(args.url + "/rest/v1/user_decks?id=eq." + args.id, {
      method: "PATCH",
      headers: { apikey: "k", "Content-Type": "application/json", Authorization: "Bearer mock-token" },
      body: JSON.stringify({ title: "hijacked" }),
    });
    return r.status;
  }, { url: "https://qnrnjjcjeggzndgxtyqx.supabase.co", id: db.decks[0].id });
  check("a stranger cannot patch someone's deck", forbidden === 403, "status=" + forbidden);
  check("title unchanged after the attempt", db.decks[0].title === "Byzantine Emperors", db.decks[0].title);

  // ================= reporting + moderation =================
  await B.page.goto(base + "#deck/" + aliceSlug, { waitUntil: "load" });
  await B.page.waitForTimeout(1100);
  await B.page.click("#ddReport");
  await B.page.waitForTimeout(300);
  await B.page.selectOption("#rpReason", "inaccurate");
  await B.page.fill("#rpNote", "Constantine founded it in 330, not 320.");
  await B.page.click(".ip-ok");
  await B.page.waitForTimeout(700);
  check("report reaches the server", db.reports.length === 1 && db.reports[0].reason === "inaccurate", JSON.stringify(db.reports.map((r) => r.reason)));

  const M = await newSession(browser, db, ADMIN, base);
  await M.page.goto(base + "#community", { waitUntil: "load" });
  await M.page.waitForTimeout(1400);
  check("admin sees the reports queue", await M.page.evaluate(() => !!document.querySelector(".creports")));
  check("report names the deck", /Byzantine Emperors/.test((await M.page.textContent(".creports")) || ""));
  await M.page.click("[data-hide]");
  await M.page.waitForTimeout(900);
  check("admin can hide a deck", db.decks[0].status === "hidden", db.decks[0].status);

  await B.page.goto(base + "#community", { waitUntil: "load" });
  await B.page.waitForTimeout(1200);
  check("hidden deck leaves the public list", await B.page.evaluate(() => document.querySelectorAll(".cdeck").length === 0));

  // ================= ratings (phase 3) =================
  // Bob has installed and studied nothing yet, so the form must stay locked
  await gotoFresh(B.page, base + "#deck/" + aliceSlug);
  await B.page.waitForTimeout(1300);
  await M.page.bringToFront();
  await gotoFresh(M.page, base + "#deck/" + aliceSlug);
  await M.page.waitForTimeout(1300);
  await M.page.evaluate(() => { const b = document.querySelector("#ddUnhide"); if (b) b.click(); });
  await M.page.waitForTimeout(800);
  check("admin restored the deck for the rating tests", db.decks[0].status === "published", db.decks[0].status);

  await B.page.bringToFront();
  await gotoFresh(B.page, base + "#deck/" + aliceSlug);
  await B.page.waitForTimeout(1400);
  const gate = await B.page.evaluate(() => ({
    note: (document.querySelector("#rvMine .rv-note") || {}).textContent || "",
    form: !!document.querySelector(".rv-form"),
  }));
  check("rating is gated until you have studied enough", !gate.form && /more card/i.test(gate.note), JSON.stringify(gate).slice(0, 120));

  // study five cards of the deck so the gate opens (the deck has one card, so grade it five times)
  await B.page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("folio_v1"));
    // mark every card of the installed deck as seen, the same shape grade() writes
    const ids = Object.keys(st.cards);
    return ids.length;
  });
  await B.page.evaluate((min) => {
    const st = JSON.parse(localStorage.getItem("folio_v1"));
    // seed "studied" records for this deck's cards so the gate's condition is genuinely met
    const keys = Object.keys(st.cards).filter((k) => k.slice(0, 2) === "u_");
    for (let i = 0; i < min; i++) {
      const id = "u_seed_" + i;
      st.cards[id] = { reps: 1, lapses: 0, ease: 2.5, interval: 1, due: Date.now() + 86400000, status: "review", last: Date.now() };
    }
    localStorage.setItem("folio_v1", JSON.stringify(st));
  }, 5);
  // the seeded ids are not in the deck, so the gate must STILL be closed — it counts this deck's cards
  await B.page.reload({ waitUntil: "load" });
  await B.page.waitForTimeout(1400);
  check("the gate counts THIS deck's cards, not any cards", await B.page.evaluate(() => !document.querySelector(".rv-form")));

  // now genuinely study the deck's own cards
  await B.page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("folio_v1"));
    const rec = { reps: 1, lapses: 0, ease: 2.5, interval: 1, due: Date.now() + 86400000, status: "review", last: Date.now() };
    (JSON.parse(localStorage.getItem("folio_community_v1") || "[]") || []).forEach(() => {});
    window.__deckCardIds.forEach((id) => { st.cards[id] = rec; });
    localStorage.setItem("folio_v1", JSON.stringify(st));
  }).catch(() => {});
  const seeded = await B.page.evaluate(async () => {
    // read the installed deck's card ids out of IndexedDB, then mark them all studied
    const ids = await new Promise((resolve) => {
      /* No version: the store has been at 2 since a deck's cards moved into a `notes` store of their own,
         and asking for 1 is a DOWNGRADE, which fails outright and hands back no ids at all. The ids now
         come from the deck's INDEX, which is what the record carries in place of its cards. */
      const rq = indexedDB.open("folio-community");
      rq.onsuccess = () => {
        const tx = rq.result.transaction("decks", "readonly").objectStore("decks").getAll();
        tx.onsuccess = () => resolve((tx.result || []).flatMap((r) => (r.index || r.cards || []).map((c) => c.id)));
        tx.onerror = () => resolve([]);
      };
      rq.onerror = () => resolve([]);
    });
    const st = JSON.parse(localStorage.getItem("folio_v1"));
    ids.forEach((id, i) => { st.cards[id] = { reps: 1, lapses: 0, ease: 2.5, interval: 1, due: Date.now() + 86400000, status: "review", last: Date.now() }; });
    localStorage.setItem("folio_v1", JSON.stringify(st));
    return ids.length;
  });
  check("seeded study records for the deck", seeded > 0, "cards=" + seeded);

  // with only one card in the deck the threshold can never be met, so lower it the honest way:
  // publish four more cards, then re-install so Bob has them.
  await A.page.bringToFront();
  await openDeckInStudio(A.page, base, "Byzantine Emperors");
  for (let i = 0; i < 4; i++) {
    await A.page.click("#stAddCard");
    await A.page.waitForTimeout(250);
    await typeField(A.page, "answer", "Emperor " + (i + 2));
    await typeField(A.page, "abstract", "Another ruler of the empire.");
  }
  await A.page.click("#stPublish");
  await A.page.waitForTimeout(1100);
  check("deck now has five cards", db.decks[0].card_count === 5, "count=" + db.decks[0].card_count);

  await B.page.bringToFront();
  await gotoFresh(B.page, base + "#deck/" + aliceSlug);
  await B.page.waitForTimeout(1400);
  await B.page.evaluate(() => { const b = document.querySelector("#ddUpdate") || document.querySelector("#ddInstall"); if (b) b.click(); });
  await B.page.waitForTimeout(1300);
  await B.page.evaluate(async () => {
    const ids = await new Promise((resolve) => {
      /* No version: the store has been at 2 since a deck's cards moved into a `notes` store of their own,
         and asking for 1 is a DOWNGRADE, which fails outright and hands back no ids at all. The ids now
         come from the deck's INDEX, which is what the record carries in place of its cards. */
      const rq = indexedDB.open("folio-community");
      rq.onsuccess = () => {
        const tx = rq.result.transaction("decks", "readonly").objectStore("decks").getAll();
        tx.onsuccess = () => resolve((tx.result || []).flatMap((r) => (r.index || r.cards || []).map((c) => c.id)));
        tx.onerror = () => resolve([]);
      };
      rq.onerror = () => resolve([]);
    });
    const st = JSON.parse(localStorage.getItem("folio_v1"));
    ids.forEach((id) => { st.cards[id] = { reps: 1, lapses: 0, ease: 2.5, interval: 1, due: Date.now() + 86400000, status: "review", last: Date.now() }; });
    localStorage.setItem("folio_v1", JSON.stringify(st));
  });
  await B.page.reload({ waitUntil: "load" });
  await B.page.waitForTimeout(1500);
  check("rating form unlocks once the deck is studied", await B.page.evaluate(() => !!document.querySelector(".rv-form")));

  await B.page.click('.rv-star[data-star="4"]');
  await B.page.waitForTimeout(200);
  await B.page.fill("#rvBody", "Clear and well ordered. A couple of dates I would double-check.");
  await B.page.click("#rvSend");
  await B.page.waitForTimeout(1200);
  check("rating stored", db.ratings.length === 1 && db.ratings[0].stars === 4, JSON.stringify(db.ratings.map((r) => r.stars)));
  check("summary columns updated", db.decks[0].rating_count === 1 && Number(db.decks[0].rating_avg) === 4, db.decks[0].rating_count + " / " + db.decks[0].rating_avg);
  check("per-star distribution updated", db.decks[0].rating_4 === 1 && db.decks[0].rating_5 === 0);
  check("rank_score pulled toward the prior", db.decks[0].rank_score > 3.5 && db.decks[0].rank_score < 4,
    "score=" + Number(db.decks[0].rank_score).toFixed(3));

  await B.page.reload({ waitUntil: "load" });
  await B.page.waitForTimeout(1500);
  const shown = await B.page.evaluate(() => ({
    avg: (document.querySelector(".rv-avg") || {}).textContent,
    review: (document.querySelector(".rv-body") || {}).textContent,
    mineHighlighted: !!document.querySelector(".rv-item.own"),
    prefilled: document.querySelectorAll(".rv-star.on").length,
  }));
  check("deck page shows the average", shown.avg === "4.0", JSON.stringify(shown.avg));
  check("the written review is listed", /well ordered/.test(shown.review || ""));
  check("your own review is marked", shown.mineHighlighted);
  check("the form pre-fills your existing rating", shown.prefilled === 4, "stars=" + shown.prefilled);

  // an author cannot rate their own deck
  await A.page.bringToFront();
  await gotoFresh(A.page, base + "#deck/" + aliceSlug);
  await A.page.waitForTimeout(1400);
  check("an author cannot rate their own deck", await A.page.evaluate(() =>
    !document.querySelector(".rv-form") && /your deck/i.test((document.querySelector("#rvMine .rv-note") || {}).textContent || "")));
  const selfRate = await A.page.evaluate(async (args) => {
    const r = await fetch(args.url + "/rest/v1/deck_ratings", {
      method: "POST",
      headers: { apikey: "k", "Content-Type": "application/json", Authorization: "Bearer mock-token" },
      body: JSON.stringify({ deck_id: args.id, user_id: args.uid, stars: 5, body: "mine is great" }),
    });
    return r.status;
  }, { url: "https://qnrnjjcjeggzndgxtyqx.supabase.co", id: db.decks[0].id, uid: ALICE.id });
  check("the server also refuses a self-rating", selfRate === 403, "status=" + selfRate);
  check("no self-rating stored", db.ratings.length === 1);

  // withdrawing a rating puts the summary back
  await B.page.bringToFront();
  await B.page.reload({ waitUntil: "load" });
  await B.page.waitForTimeout(1500);
  await B.page.click("#rvClear");
  await B.page.waitForTimeout(1100);
  check("rating withdrawn", db.ratings.length === 0);
  check("summary reset", db.decks[0].rating_count === 0 && Number(db.decks[0].rating_avg) === 0);

  // ================= staff picks =================
  await M.page.bringToFront();
  await gotoFresh(M.page, base + "#deck/" + aliceSlug);
  await M.page.waitForTimeout(1400);
  await M.page.click("#ddPick");
  await M.page.waitForTimeout(1000);
  check("admin can mark a staff pick", db.decks[0].staff_pick === true);
  await B.page.bringToFront();
  await gotoFresh(B.page, base + "#community");
  await B.page.waitForTimeout(1400);
  check("staff pick badge shows in browse", await B.page.evaluate(() => !!document.querySelector(".cdeck-pick")));
  await B.page.click("#cpicks");
  await B.page.waitForTimeout(1300);
  check("staff-pick filter keeps it", await B.page.evaluate(() => document.querySelectorAll(".cdeck").length === 1));
  const notAdmin = await B.page.evaluate(async (args) => {
    const r = await fetch(args.url + "/rest/v1/user_decks?id=eq." + args.id, {
      method: "PATCH", headers: { apikey: "k", "Content-Type": "application/json", Authorization: "Bearer mock-token" },
      body: JSON.stringify({ staff_pick: true }),
    });
    return r.status;
  }, { url: "https://qnrnjjcjeggzndgxtyqx.supabase.co", id: db.decks[0].id });
  check("a reader cannot award a staff pick", notAdmin === 403, "status=" + notAdmin);

  // ================= an owner cannot write the columns the server maintains =================
  // RLS controls which ROWS you may write, not which COLUMNS, so this is enforced by a trigger. Alice owns
  // this deck and may legitimately PATCH it — the point is that these particular fields are ignored.
  const beforeCheat = {
    installs: db.decks[0].install_count, avg: db.decks[0].rating_avg,
    count: db.decks[0].rating_count, pick: db.decks[0].staff_pick, owner: db.decks[0].owner,
  };
  const cheatStatus = await A.page.evaluate(async (args) => {
    const r = await fetch(args.url + "/rest/v1/user_decks?id=eq." + args.id, {
      method: "PATCH",
      headers: { apikey: "k", "Content-Type": "application/json", Authorization: "Bearer mock-token" },
      body: JSON.stringify({ subtitle: "a legitimate edit", install_count: 9999, rating_avg: 5,
                             rating_count: 500, rating_5: 500, staff_pick: true, owner: args.other }),
    });
    return r.status;
  }, { url: "https://qnrnjjcjeggzndgxtyqx.supabase.co", id: db.decks[0].id, other: BOB.id });
  check("an owner's own PATCH is accepted", cheatStatus >= 200 && cheatStatus < 300, "status=" + cheatStatus);
  check("the legitimate field did change", db.decks[0].subtitle === "a legitimate edit", db.decks[0].subtitle);
  check("install_count cannot be faked", db.decks[0].install_count === beforeCheat.installs, String(db.decks[0].install_count));
  check("rating_avg cannot be faked", Number(db.decks[0].rating_avg) === Number(beforeCheat.avg), String(db.decks[0].rating_avg));
  check("rating_count cannot be faked", db.decks[0].rating_count === beforeCheat.count, String(db.decks[0].rating_count));
  check("staff_pick cannot be self-awarded", db.decks[0].staff_pick === beforeCheat.pick, String(db.decks[0].staff_pick));
  check("owner cannot be reassigned", db.decks[0].owner === beforeCheat.owner);

  // ================= fork attribution =================
  await B.page.bringToFront();
  await gotoFresh(B.page, base + "#studio");
  await B.page.waitForTimeout(1200);
  if (await B.page.evaluate(() => !!document.querySelector("#stAll"))) { await B.page.click("#stAll"); await B.page.waitForTimeout(400); }
  await B.page.evaluate(() => {
    const hit = [...document.querySelectorAll(".studio-deck-open")].find((r) => /Byzantine/.test(r.textContent || ""));
    if (hit) hit.click();
  });
  await B.page.waitForTimeout(700);
  check("installed deck offers a duplicate", await B.page.evaluate(() => !!document.querySelector("#stFork")));
  await B.page.click("#stFork");
  await B.page.waitForTimeout(900);
  const forked = await B.page.evaluate(async () => {
    const rows = await new Promise((resolve) => {
      const rq = indexedDB.open("folio-community");   // no version — asking for 1 is now a downgrade
      rq.onsuccess = () => {
        const tx = rq.result.transaction("decks", "readonly").objectStore("decks").getAll();
        tx.onsuccess = () => resolve(tx.result || []);
        tx.onerror = () => resolve([]);
      };
      rq.onerror = () => resolve([]);
    });
    const copy = rows.map((r) => r.meta).find((m) => m && m.origin !== "installed" && m.forkedFrom);
    return copy ? { title: copy.title, from: copy.forkedFrom, origin: copy.origin } : null;
  });
  check("the duplicate records what it came from", !!forked && forked.from && /Byzantine/.test(forked.from.title || ""), JSON.stringify(forked));
  check("the duplicate is mine, not installed", !!forked && forked.origin === "mine", forked ? forked.origin : "");

  /* ================= a deck bigger than one page =================
     PostgREST caps a response at db-max-rows and says nothing about what it dropped, so an unpaged install
     returns a truncated deck that is indistinguishable from a small one — nothing throws, the deck opens,
     and the missing cards are found weeks later by a reader who cannot find a word. The mock's cap is 3
     (see MOCK_PAGE), so this deck of 7 crosses it twice in each direction: the upload has to batch and the
     download has to page, and either one failing loses cards silently. */
  const PAGED_N = 7;
  const pagedFile = path.join(require("os").tmpdir(), "paged.folio-deck.json");
  fs.writeFileSync(pagedFile, JSON.stringify({
    folioDeck: 1,
    meta: { id: "pagedeck", title: "Paged Deck", subtitle: "", desc: "", author: "", language: "en", tags: [], version: 1 },
    cards: Array.from({ length: PAGED_N }, (_, i) => ({
      id: "u_pagedeck_" + (i + 1),
      question: "Card number ___ of the paged deck.",
      answer: String(i + 1), answerText: String(i + 1),
      answerDate: "", abstract: "Card " + (i + 1) + " exists.", num: "", category: "",
      traditional: "", hanzi: "", pinyin: "", translations: "", citation: "",
    })),
  }));
  await A.page.bringToFront();
  await gotoFresh(A.page, base + "#studio");
  await A.page.waitForTimeout(1100);
  if (await A.page.evaluate(() => !!document.querySelector("#stAll"))) { await A.page.click("#stAll"); await A.page.waitForTimeout(400); }
  const pagedChooser = A.page.waitForEvent("filechooser");
  await A.page.click("#stImport");
  (await pagedChooser).setFiles(pagedFile);
  await A.page.waitForTimeout(1200);
  // open it and publish
  const opened = await A.page.evaluate((title) => {
    const rows = [...document.querySelectorAll(".sd-title")];
    const hit = rows.find((e) => (e.textContent || "").indexOf(title) >= 0);
    if (hit) (hit.closest("button") || hit).click();
    return !!hit;
  }, "Paged Deck");
  check("the paged deck imported", opened);
  await A.page.waitForTimeout(700);
  await A.page.click("#stPublish");
  await A.page.waitForTimeout(1500);
  const pagedRow = db.decks.find((d) => d.title === "Paged Deck");
  check("a deck larger than one page uploads every card", !!pagedRow && db.cards.filter((c) => c.deck_id === pagedRow.id).length === PAGED_N,
    "uploaded=" + (pagedRow ? db.cards.filter((c) => c.deck_id === pagedRow.id).length : "no deck") + " want=" + PAGED_N);

  await B.page.bringToFront();
  await gotoFresh(B.page, base + "#deck/" + (pagedRow ? pagedRow.slug : "missing"));
  await B.page.waitForTimeout(1300);
  await B.page.click("#ddInstall");
  await B.page.waitForTimeout(1500);
  /* Counted off the STORE rather than the Studio's rows: what is under test is how many cards came down
     the wire, and a UI count would fail the same way whether the install truncated or the list simply had
     not painted yet. The deck's index is exactly the list of notes it holds. */
  const installedN = await B.page.evaluate((title) => new Promise((res) => {
    const rq = indexedDB.open("folio-community");
    rq.onsuccess = () => {
      const db = rq.result;
      const g = db.transaction("decks", "readonly").objectStore("decks").getAll();
      g.onsuccess = () => {
        const d = (g.result || []).find((r) => r.meta && r.meta.title === title);
        db.close();
        res(d ? (d.index || d.cards || []).length : -1);
      };
      g.onerror = () => { db.close(); res(-2); };
    };
    rq.onerror = () => res(-3);
  }), "Paged Deck");
  check("...and installing it brings every card back", installedN === PAGED_N, "installed=" + installedN + " want=" + PAGED_N);

  // ================= exports never carry publish state =================
  await A.page.bringToFront();
  await gotoFresh(A.page, base + "#studio");
  await A.page.waitForTimeout(1100);
  if (await A.page.evaluate(() => !!document.querySelector("#stAll"))) {   // land on the deck LIST, where [data-export] lives
    await A.page.click("#stAll");
    await A.page.waitForTimeout(500);
  }
  const [dl] = await Promise.all([A.page.waitForEvent("download"), A.page.click("[data-export]")]);
  const f = path.join(require("os").tmpdir(), dl.suggestedFilename());
  await dl.saveAs(f);
  const exported = JSON.parse(fs.readFileSync(f, "utf8"));
  check("export omits the publish state", !exported.meta.remoteId && !exported.meta.slug && !exported.meta.origin,
    JSON.stringify(Object.keys(exported.meta)));

  /* ================= deleting a published deck takes the shared copy with it =================
     The bug this is for (Aug 2026): `uDeckDelete` only ever removed the LOCAL record, so a deck the author
     published and then deleted stayed on the shared page for ever — and unreachably, the Studio's Unpublish
     button reading `remoteId` off the local deck that had just been thrown away. Every assertion below
     fails silently on a real site: the deck vanishes from the author's Studio either way, and only somebody
     ELSE browsing the shared page ever sees what was left behind. */
  async function studioDeleteByTitle(page, title) {
    await page.evaluate((t) => {
      const row = [...document.querySelectorAll(".studio-deck")].find((r) => ((r.querySelector(".sd-title") || {}).textContent || "") === t);
      const b = row && row.querySelector("[data-del]");
      if (b) b.click();
    }, title);
    await page.waitForTimeout(300);
    await page.click(".ip-ok");
    await page.waitForTimeout(1800);
  }
  /* Landing on the deck LIST is not automatic and the reason is a house gotcha worth repeating: `goto` to a
     URL that differs only in its #fragment is a SAME-DOCUMENT navigation, so the app keeps running and
     `studioState.deck` survives — the Studio then opens on whichever deck was last edited. */
  async function studioListView(page) {
    await page.waitForTimeout(1200);
    if (await page.evaluate(() => !!document.querySelector("#stAll"))) {
      await page.click("#stAll");
      await page.waitForTimeout(500);
    }
    await page.waitForSelector(".studio-list, .studio-empty", { timeout: 15000 }).catch(() => {});
  }
  await A.page.bringToFront();
  await gotoFresh(A.page, base + "#studio");
  await studioListView(A.page);
  const pagedId = pagedRow && pagedRow.id;
  await studioDeleteByTitle(A.page, "Paged Deck");
  check("deleting a published deck removes the shared row", !db.decks.some((d) => d.id === pagedId));
  check("...and its cards go with it", !db.cards.some((c) => c.deck_id === pagedId), "left=" + db.cards.filter((c) => c.deck_id === pagedId).length);
  check("...and the reader's install record with it", !db.installs.some((i) => i.deck_id === pagedId));

  /* A REAL reload, not a hash change. Bob was last on a deck page, so `goto` here is same-document: the app
     keeps running and PAGES.community paints the browse results it already had — a list fetched before this
     deck was ever published. The assertion then passes whatever the server says, which is worse than not
     making it. Verified by reintroducing the bug: stale, it passes; reloaded, it fails. */
  await B.page.bringToFront();
  await B.page.goto(base + "#community", { waitUntil: "load" });
  await B.page.reload({ waitUntil: "load" });
  await B.page.waitForTimeout(1800);
  check("...so it is off the shared decks page", !(await B.page.evaluate(() => document.body.textContent.includes("Paged Deck"))));
  // …while the person who installed it keeps their own copy: a delete takes the deck off the shelf, it does
  // not reach into anybody's device.
  await gotoFresh(B.page, base + "#studio");
  await studioListView(B.page);
  check("...but an installed copy survives on its reader's device", await B.page.evaluate(() => document.body.textContent.includes("Paged Deck")));

  /* ================= the Studio lists shared decks this device has no copy of =================
     The other half. An orphan is planted straight into the mock's store — which is exactly what one IS: a
     row this account owns with nothing local pointing at it, whether it was left by the old bug, by a
     delete on another device, or by one made while signed out. */
  db.decks.push({
    id: uuid(700), owner: ALICE.id, slug: "ghost-deck-x9", title: "Ghost Deck", subtitle: "", description: "",
    author: "Alice", language: "en", tags: [], status: "published", version: 1, card_count: 12, install_count: 0,
    rating_avg: 0, rating_count: 0, rating_1: 0, rating_2: 0, rating_3: 0, rating_4: 0, rating_5: 0,
    rank_score: 3.5, staff_pick: false, forked_from: null, price_cents: 0,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  });
  await A.page.bringToFront();
  await gotoFresh(A.page, base + "#studio");
  await studioListView(A.page);
  await A.page.waitForTimeout(900);   // the owned-decks request lands after the first paint
  const orph = await A.page.evaluate(() => [...document.querySelectorAll(".orphan-deck .sd-title")].map((e) => e.textContent));
  check("a published deck with no local copy is listed", orph.indexOf("Ghost Deck") >= 0, JSON.stringify(orph));
  // the negative, and the one that matters: a deck that IS on this device must never be offered for removal
  check("...and a deck this device does hold is not", orph.indexOf("Byzantine Emperors") < 0, JSON.stringify(orph));
  await A.page.click("[data-orphdel]");
  await A.page.waitForTimeout(300);
  await A.page.click(".ip-ok");
  await A.page.waitForTimeout(1800);
  check("removing it deletes the shared row", !db.decks.some((d) => d.slug === "ghost-deck-x9"));
  check("...and the section goes with the last orphan", await A.page.evaluate(() => !document.querySelector(".studio-orphans")));

  const errs = [...A.errs, ...B.errs, ...M.errs];
  check("no console/page errors", errs.length === 0, [...new Set(errs)].join(" | "));

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
