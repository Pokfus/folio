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
const { isNoise } = require("./test-noise.js");

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
  return { decks: [], cards: [], installs: [], reports: [], ratings: [], progress: {}, seq: 0 };
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
  /* The progress row is STATEFUL, which matters for one thing only and matters a lot for it: the reader's
     added-decks list rides in this blob, so a mock that always answered with an empty one would wipe it on
     every boot and no cross-device claim about `S.active` could be tested at all. */
  if (p.startsWith("/rest/v1/progress")) {
    const cur = db.progress[asUser.id] || (db.progress[asUser.id] = { data: {}, updated_at: "2026-01-01T00:00:00Z" });
    if (method === "GET") return [200, [cur]];
    if (body && body.data) cur.data = body.data;
    cur.updated_at = new Date().toISOString();
    return [200, [{ updated_at: cur.updated_at }]];
  }
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
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push("console: " + t.slice(0, 300)); });
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
  await B.page.goto(base + "#decks", { waitUntil: "load" });
  await B.page.waitForTimeout(1200);
  check("browse lists the published deck", await B.page.evaluate(() => document.querySelectorAll(".sd-row").length === 1));
  // `.sd-table` since Aug 2026 — the browse list is a SORTABLE TABLE at the foot of the Collections page,
  // where `#community` was a page of its own (on request). The old route still redirects here, which the
  // last section of this file asserts; everything else addresses the section where it now lives.
  check("browse shows the title", /Byzantine Emperors/.test(await B.page.textContent(".sd-table")));

  /* THE RETIRED ROUTE STILL LANDS SOMEWHERE SENSIBLE. `#community` was a page of its own for a year, so
     every link anybody ever shared points at it; it is out of `valid` now and TWO SEPARATE READERS map it
     to the collections — boot's `initName` and the `hashchange` handler. Both are asserted, because they
     fail in opposite circumstances: a reader following an old link from outside the site takes the first
     and one already on the site takes the second, and either alone looks like the redirect working. */
  await B.page.goto(base + "#community", { waitUntil: "load" });   // fragment-only ⇒ hashchange
  await B.page.waitForTimeout(1200);
  check("the retired #community route redirects to the collections (hashchange)", /#decks$/.test(B.page.url()), B.page.url());
  check("...landing on the shelf that now carries the shared decks",
    await B.page.evaluate(() => !!document.querySelector("#sharedDecks")));
  /* A QUERY STRING is what makes the next line a cross-document load: `goto` to a URL differing only in
     the fragment is same-document, so boot would never run. Deliberately NOT a hop through `about:blank`,
     which has an opaque origin — the harness's own init script runs there too and dies on localStorage,
     and a SecurityError on about:blank then fails the end-of-run "no page errors" watcher for the whole
     file. The app ignores unknown query parameters. */
  await B.page.goto(base + "?coldboot=1#community", { waitUntil: "load" });
  await B.page.waitForTimeout(1400);
  check("...and on a cold load of the old link too (boot)", /#decks$/.test(B.page.url()), B.page.url());
  check("...with the shared decks section on it",
    await B.page.evaluate(() => !!document.querySelector("#sharedDecks")));

  await B.page.fill("#sdq", "nothing-matches-this");
  await B.page.waitForTimeout(900);
  check("search filters", await B.page.evaluate(() => document.querySelectorAll(".sd-row").length === 0));
  await B.page.fill("#sdq", "byzantine");
  await B.page.waitForTimeout(900);
  check("search finds by title", await B.page.evaluate(() => document.querySelectorAll(".sd-row").length === 1));

  await B.page.click(".sd-row");
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
  await M.page.goto(base + "#decks", { waitUntil: "load" });
  await M.page.waitForTimeout(1400);
  check("admin sees the reports queue", await M.page.evaluate(() => !!document.querySelector(".creports")));
  check("report names the deck", /Byzantine Emperors/.test((await M.page.textContent(".creports")) || ""));
  await M.page.click("[data-hide]");
  await M.page.waitForTimeout(900);
  check("admin can hide a deck", db.decks[0].status === "hidden", db.decks[0].status);

  await B.page.goto(base + "#decks", { waitUntil: "load" });
  await B.page.waitForTimeout(1200);
  check("hidden deck leaves the public list", await B.page.evaluate(() => document.querySelectorAll(".sd-row").length === 0));

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
  await gotoFresh(B.page, base + "#decks");
  await B.page.waitForTimeout(1400);
  check("staff pick badge shows in browse", await B.page.evaluate(() => !!document.querySelector(".sd-row .cdeck-pick")));
  await B.page.click("#sdpicks");
  await B.page.waitForTimeout(1300);
  check("staff-pick filter keeps it", await B.page.evaluate(() => document.querySelectorAll(".sd-row").length === 1));
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

  /* ================= A TYPED DECK SURVIVES THE ROUND TRIP =================
     Everything the Aug 2026 deck features rest on lives on the CARD (`type`, `fields`) or on the DECK
     (`types`, and `sub` for the subdeck tree) — and a publish that drops any of it is invisible from the
     author's side: their own copy is perfect, the upload succeeds, and only somebody who INSTALLS the deck
     ever sees the damage. That is the worst shape a bug here can take, so the assertions are made on the
     INSTALLED copy, read out of the store rather than off the page.
     The deck is deliberately the shape the Mandarin decks are: one type with TWO templates (which is what
     gives a deck its direction rows), a <details> in the back, CSS of its own, and cards filed in nested
     subdecks. */
  const TY_CSS = ".uc-simp { font-size: 30px; }\n.uc-exst { font-size: 9px; font-weight: 400; }";
  const TY_BACK = "{{FrontSide}}<hr><div class=\"uc-field\">{{English}}</div>" +
    "<details class=\"uc-ex\"><summary>In a sentence</summary><div class=\"uc-exs\">{{Example}}</div></details>";
  const TY_SUBS = ["Level 1", "Level 1::Extra", "Level 2", "Level 2"];
  const typedFile = path.join(require("os").tmpdir(), "typed.folio-deck.json");
  fs.writeFileSync(typedFile, JSON.stringify({
    folioDeck: 1,
    meta: {
      id: "typedeck", title: "Typed Deck", subtitle: "", desc: "", author: "", language: "en",
      tags: [], glossMode: "site", version: 1,
      types: { vt: {
        id: "vt", name: "Vocab", fields: ["Word", "English", "Example"], css: TY_CSS,
        cards: [
          { name: "Forward", front: "<div class=\"uc-simp\">{{Word}}</div>", back: TY_BACK },
          { name: "Reverse", front: "<div class=\"uc-field\">{{English}}</div>", back: TY_BACK },
        ],
      } },
    },
    cards: TY_SUBS.map((sub, i) => ({
      id: "u_typedeck_" + (i + 1), sub: sub, type: "vt",
      fields: { Word: "word" + (i + 1), English: "meaning " + (i + 1), Example: "sentence " + (i + 1) },
    })),
  }));

  await A.page.bringToFront();
  await gotoFresh(A.page, base + "#studio");
  await A.page.waitForTimeout(1100);
  if (await A.page.evaluate(() => !!document.querySelector("#stAll"))) { await A.page.click("#stAll"); await A.page.waitForTimeout(400); }
  const typedChooser = A.page.waitForEvent("filechooser");
  await A.page.click("#stImport");
  (await typedChooser).setFiles(typedFile);
  await A.page.waitForTimeout(1400);
  const typedOpened = await A.page.evaluate((title) => {
    const hit = [...document.querySelectorAll(".sd-title")].find((e) => (e.textContent || "").indexOf(title) >= 0);
    if (hit) (hit.closest("button") || hit).click();
    return !!hit;
  }, "Typed Deck");
  check("the typed deck imported", typedOpened);
  await A.page.waitForTimeout(800);
  await A.page.click("#stPublish");
  await A.page.waitForTimeout(1800);

  const typedRow = db.decks.find((d) => d.title === "Typed Deck");
  check("a typed deck publishes", !!typedRow, typedRow ? typedRow.slug : "no row");
  // the TEMPLATES ride on the deck row — without them an installed copy renders its fields as raw prose
  const upTypes = typedRow && typedRow.types && typedRow.types.vt;
  check("...carrying its card type", !!upTypes, JSON.stringify(upTypes && Object.keys(upTypes)));
  check("...with BOTH of its templates, which is what a direction row is made of",
    !!upTypes && Array.isArray(upTypes.cards) && upTypes.cards.length === 2,
    upTypes ? JSON.stringify((upTypes.cards || []).map((c) => c.name)) : "");
  check("...and the type's own CSS", !!upTypes && String(upTypes.css || "").indexOf("uc-exst") >= 0);
  // …and the per-card half: a typed card carries `type` + `fields` INSTEAD of the Basic 13, so a payload
  // built from CARD_FIELDS alone uploads twelve empty strings and nothing else
  const upCards = typedRow ? db.cards.filter((c) => c.deck_id === typedRow.id) : [];
  check("every card is uploaded", upCards.length === TY_SUBS.length, "n=" + upCards.length);
  check("...each naming the type it uses", upCards.length > 0 && upCards.every((c) => c.data && c.data.type === "vt"),
    JSON.stringify(upCards.map((c) => c.data && c.data.type)));
  check("...and carrying its field VALUES, without which the card is blank",
    upCards.length > 0 && upCards.every((c) => c.data && c.data.fields && c.data.fields.Word),
    JSON.stringify(upCards.map((c) => c.data && c.data.fields && c.data.fields.Word)));
  check("...and the subdeck it sits in, nested path and all",
    upCards.length > 0 && upCards.some((c) => c.data && c.data.sub === "Level 1::Extra"),
    JSON.stringify(upCards.map((c) => c.data && c.data.sub)));

  // ---- and now the half that matters: what a STRANGER gets when they install it
  await B.page.bringToFront();
  await gotoFresh(B.page, base + "#deck/" + (typedRow ? typedRow.slug : "missing"));
  await B.page.waitForTimeout(1400);
  await B.page.click("#ddInstall");
  await B.page.waitForTimeout(1800);

  const got = await B.page.evaluate((title) => new Promise((res) => {
    const rq = indexedDB.open("folio-community");
    rq.onsuccess = () => {
      const idb = rq.result;
      const tx = idb.transaction(["decks", "notes"], "readonly");
      const gd = tx.objectStore("decks").getAll();
      gd.onsuccess = () => {
        const d = (gd.result || []).find((r) => r.meta && r.meta.title === title);
        if (!d) { idb.close(); res({ missing: true }); return; }
        const gn = tx.objectStore("notes").getAll();
        gn.onsuccess = () => {
          /* THE STORE IS SPLIT, and the two halves hold different things — reading the wrong one reports a
             perfectly good deck as broken. A note record is `{ k, deckId, c }` with the card nested under
             `c`, and the SUBDECK and TYPE live in the deck record's own `index` (that is the whole point of
             the index: what a card IS, without its content). So `fields` comes off the note and `sub`/`type`
             off the index. */
          const notes = (gn.result || []).filter((n) => n && n.deckId === d.id).map((n) => n.c || {});
          const index = d.index || d.cards || [];
          idb.close();
          const ty = (d.meta.types || {}).vt;
          res({
            templates: ty ? (ty.cards || []).map((c) => c.name) : null,
            css: ty ? String(ty.css || "").indexOf("uc-exst") >= 0 : false,
            hasDetails: ty ? (ty.cards || []).some((c) => /<details/.test(c.back || "")) : false,
            notes: notes.length,
            typed: index.filter((e) => e.type === "vt").length,
            withFields: notes.filter((n) => n.fields && n.fields.Word).length,
            subs: [...new Set(index.map((e) => e.sub))].sort(),
          });
        };
        gn.onerror = () => { idb.close(); res({ noteReadFailed: true }); };
      };
      gd.onerror = () => { idb.close(); res({ deckReadFailed: true }); };
    };
    rq.onerror = () => res({ openFailed: true });
  }), "Typed Deck");
  console.log("      installed: " + JSON.stringify(got));
  check("the installed copy keeps both templates", JSON.stringify(got.templates) === JSON.stringify(["Forward", "Reverse"]),
    JSON.stringify(got.templates));
  check("...its type's CSS, so the card is styled as its author set it", got.css === true);
  check("...the disclosure fold in the back template", got.hasDetails === true);
  check("...every card typed", got.typed === TY_SUBS.length, "typed=" + got.typed + " want=" + TY_SUBS.length);
  check("...every card's field values, so a reader sees words rather than a blank card",
    got.withFields === TY_SUBS.length, "withFields=" + got.withFields + " want=" + TY_SUBS.length);
  check("...and the nested subdeck tree", JSON.stringify(got.subs) === JSON.stringify(["Level 1", "Level 1::Extra", "Level 2"]),
    JSON.stringify(got.subs));

  /* …and it RENDERS: a two-template type is what gives a level its direction rows, so an installed deck
     that lost its templates would draw the subdecks and no directions — which looks like a deck that
     simply has none. Read off the Collections page, where the reader picks them. */
  await gotoFresh(B.page, base + "#decks");
  await B.page.waitForTimeout(900);
  const dirRows = await B.page.evaluate((title) => {
    const d = [...document.querySelectorAll(".udeck")].find((e) => (e.textContent || "").indexOf(title) >= 0);
    if (!d) return null;
    /* the row's LABEL, not its data-usubname — that attribute is the subdeck PATH, which a direction row
       shares with the level it hangs off; the template's own name is what the reader is shown. */
    return [...d.querySelectorAll(".udeck-subrow")].map((e) => ({
      name: (e.querySelector(".node-title") || {}).textContent || "",
      sub: (e.getAttribute("data-usubname") || "").split("::").pop(),
      tpl: e.getAttribute("data-usubtpl"),
    }));
  }, "Typed Deck");
  const dirNames = (dirRows || []).filter((r) => r.tpl !== "-1").map((r) => r.name);
  check("the installed deck draws its direction rows", dirNames.length > 0, JSON.stringify(dirRows));
  check("...named by the author's own templates", dirNames.indexOf("Forward") >= 0 && dirNames.indexOf("Reverse") >= 0,
    JSON.stringify([...new Set(dirNames)]));

  /* …and an INSTALLED deck is offered a colour like any other of the reader's own. It is the same code
     path as an imported one (both are in UDECKS), but "imported and user-shared" was the ask, and a rule
     keyed on `origin` rather than on the store is exactly the kind of thing that would split the two. */
  const instColour = await B.page.evaluate(async (title) => {
    const d = [...document.querySelectorAll(".udeck")].find((e) => (e.textContent || "").indexOf(title) >= 0);
    const add = d && d.querySelector("[data-uadd]");
    if (!add) return { noDeck: true };
    if (!/added/.test(add.className)) { add.click(); await new Promise((r) => setTimeout(r, 500)); }
    location.hash = "#home";
    await new Promise((r) => setTimeout(r, 900));
    const row = [...document.querySelectorAll(".active-deck[data-drag]")]
      .find((x) => decodeURIComponent(x.dataset.drag) === "u:" + add.getAttribute("data-uadd"));
    if (!row) return { noRow: true };
    row.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    await new Promise((r) => setTimeout(r, 320));
    const ov = document.querySelector(".deck-menu");
    const out = { hasColour: !!(ov && ov.querySelector(".dm-colors")),
                  hasX: !!(ov && ov.querySelector(".dm-x")) };
    if (ov && ov.querySelector(".dm-x")) ov.querySelector(".dm-x").click();
    return out;
  }, "Typed Deck");
  check("an installed deck is offered a colour, like any of the reader's own", instColour.hasColour === true,
    JSON.stringify(instColour));
  check("...and its options sheet carries the close button", instColour.hasX === true, JSON.stringify(instColour));

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
     keeps running and the collections page paints the browse results it already had — a list fetched before
     this deck was ever published. The assertion then passes whatever the server says, which is worse than
     not making it. Verified by reintroducing the bug: stale, it passes; reloaded, it fails. */
  await B.page.bringToFront();
  await B.page.goto(base + "#decks", { waitUntil: "load" });
  await B.page.reload({ waitUntil: "load" });
  await B.page.waitForTimeout(1800);
  /* SCOPED TO THE SHARED SECTION, not to the whole page — and that is not pedantry since Aug 2026, when the
     browse list moved onto the collections page (on request). Bob has this deck INSTALLED, so its title is
     legitimately on this page under "Your decks"; a body-wide search therefore contradicts the very next
     assertion, which requires the installed copy to survive. What is being checked is that the deck is off
     the SHARED shelf, and that is the element to look in. */
  check("...so it is off the shared decks page",
    !(await B.page.evaluate(() => ((document.querySelector("#sharedDecks") || {}).textContent || "").includes("Paged Deck"))));
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

  /* ================= a shared deck reaches EVERY device the account is signed in on =================
     `deck_installs` recorded the row from the day publishing shipped and nothing ever read it back, so
     adding a deck reached the device it was added on and no other. Every assertion here fails SILENTLY on
     a real site: a deck that never arrives on the second device is indistinguishable from a deck nobody
     installed, which is precisely how this went unnoticed.

     A fresh browser context IS a second device — its own IndexedDB and its own localStorage, against the
     same account and the same server. */
  const bobInstalls = () => db.installs.filter((i) => i.user_id === BOB.id).map((i) => i.deck_id).sort();
  const bobHas = bobInstalls();
  check("the account lists the decks Bob installed", bobHas.length === 2, JSON.stringify(bobHas));

  const B2 = await newSession(browser, db, BOB, base);
  await B2.page.goto(base + "#decks", { waitUntil: "load" });
  // boot → session → the idle sync → one deck fetch and one store write apiece
  await B2.page.waitForFunction(() => document.querySelectorAll(".collection.udeck").length >= 2, null, { timeout: 25000 }).catch(() => {});
  // every community deck row on the Collections page, with the local id the row is filed under
  const shelfOf = (page) => page.evaluate(() => [...document.querySelectorAll(".collection.udeck")].map((r) => {
    const hit = r.querySelector("[data-udeck]");
    return { title: ((r.querySelector(".collection-title") || {}).textContent || "").trim(), id: hit ? hit.getAttribute("data-udeck") : "" };
  }));
  const arrived = await shelfOf(B2.page);
  const idOf = (list, t) => (list.find((d) => d.title === t) || {}).id || "";
  const titles = arrived.map((d) => d.title).sort();
  check("the account's shared decks arrive on a device that never installed one",
    titles.indexOf("Byzantine Emperors") >= 0 && titles.indexOf("Typed Deck") >= 0, JSON.stringify(titles));
  /* …and ONLY those, which is the half that says the list is the account's rather than the shelf's. "Paged
     Deck" is on the first device and is deliberately absent here: its shared row was deleted a section ago,
     taking Bob's install record with it. */
  check("...and only those — a deck the account no longer lists is not pulled down", titles.length === 2, JSON.stringify(titles));

  /* The cards came with the title. A deck row over an empty store reads as a working feature until
     somebody taps it, so this reads the STORE rather than studying the deck: a session can honestly deal
     nothing (the account's schedule travels too, and these cards may not be due), which would make a
     study-path check report a healthy deck as an empty one. */
  const b2Cards = await B2.page.evaluate((want) => new Promise((res) => {
    const rq = indexedDB.open("folio-community");
    rq.onsuccess = () => {
      const idb = rq.result;
      const tx = idb.transaction(["decks", "notes"], "readonly");
      const notes = tx.objectStore("notes").getAll();
      tx.oncomplete = () => {
        idb.close();
        res((notes.result || []).filter((n) => n && n.deckId === want).map((n) => JSON.stringify(n.c || {})).join(" "));
      };
      tx.onerror = () => { idb.close(); res(""); };
    };
    rq.onerror = () => res("");
  }), idOf(arrived, "Byzantine Emperors"));
  check("...with their cards, not just their titles", /died in 337/.test(b2Cards), b2Cards.slice(0, 80));

  /* THE SAME DECK CARRIES THE SAME LOCAL ID ON BOTH DEVICES, which is what makes the account's own synced
     settings land: `S.active`'s `u:<id>` entries, the per-deck limits, the scheduler, the colour, the
     review's order and groups are all keyed by it and by nothing else. Minted at random — as every install
     was until Aug 2026 — the deck arrived and every decision the reader had made about it did not. */
  await B.page.bringToFront();
  await gotoFresh(B.page, base + "#decks");
  await B.page.waitForTimeout(1500);
  const first = await shelfOf(B.page);
  check("both devices file the deck under the same local id",
    idOf(first, "Byzantine Emperors") && idOf(first, "Byzantine Emperors") === idOf(arrived, "Byzantine Emperors"),
    idOf(first, "Byzantine Emperors") + " / " + idOf(arrived, "Byzantine Emperors"));

  // a second boot must not install what is already here — `localDeckForRemote` is the whole guard, and
  // without it the account's decks would arrive again on every load, each copy with its own schedule
  // …a REAL boot rather than a hash change, which is same-document and would repaint the shelf this page
  // already holds instead of running the sync again
  await B2.page.bringToFront();
  await B2.page.goto(base + "#decks", { waitUntil: "load" });
  await B2.page.reload({ waitUntil: "load" });
  await B2.page.waitForTimeout(3500);
  const again = await shelfOf(B2.page);
  check("...and a second boot adds nothing a second time", again.length === 2, JSON.stringify(again.map((d) => d.title)));
  check("...nor writes a duplicate install row", bobInstalls().length === 2, JSON.stringify(bobInstalls()));

  /* A REMOVAL TRAVELS TOO, and it is the destructive half, so it is asserted from both sides. Dropping the
     row straight out of the mock's store is exactly what removing the deck on another device leaves
     behind: the deck must go here as well, and it must NOT be pushed back up (which would resurrect it on
     the device the reader removed it from). */
  const typedId = typedRow && typedRow.id;
  db.installs = db.installs.filter((i) => !(i.user_id === BOB.id && i.deck_id === typedId));
  await B.page.bringToFront();
  await B.page.goto(base + "#decks", { waitUntil: "load" });
  await B.page.reload({ waitUntil: "load" });
  await B.page.waitForTimeout(4000);
  const afterRemoval = await shelfOf(B.page);
  const hasTitle = (list, t) => list.some((d) => d.title === t);
  check("a deck removed on another device goes from this one too", !hasTitle(afterRemoval, "Typed Deck"), JSON.stringify(afterRemoval.map((d) => d.title)));
  check("...and is not pushed back up by the device that still had it",
    !db.installs.some((i) => i.user_id === BOB.id && i.deck_id === typedId), JSON.stringify(bobInstalls()));
  /* …WHILE AN AUTHOR'S DELETE STILL REACHES NOBODY'S DEVICE. It cascades the install rows away, so from
     here it looks exactly like a removal — and mirroring it would take a reader's deck and their progress
     with it for something they never did. "Paged Deck" was deleted by Alice several sections ago and Bob's
     copy has survived every sync since. */
  check("...but a deck its author deleted is left alone on the reader's device", hasTitle(afterRemoval, "Paged Deck"),
    JSON.stringify(afterRemoval.map((d) => d.title)));
  check("...and is not announced back to the account either",
    !db.installs.some((i) => i.user_id === BOB.id && i.deck_id === pagedId), JSON.stringify(bobInstalls()));

  /* THE PUSH: a deck added while SIGNED OUT joins the account when the reader signs in, which is the half
     that makes the two lists converge from either end (`uDeckInstall` writes the row itself whenever there
     is a session). A third context with no session IS a signed-out device; adding the session and
     reloading is signing in on it. */
  const G = await browser.newContext({ acceptDownloads: true });
  await attachMock(G, db, { user: BOB });   // never consulted until there is a session to consult it for
  const gp = await G.newPage();
  const gerrs = [];
  gp.on("pageerror", (e) => gerrs.push("pageerror: " + String(e).slice(0, 200)));
  await gp.goto(base + "#deck/" + (typedRow ? typedRow.slug : "missing"), { waitUntil: "load" });
  await gp.waitForTimeout(1400);
  await gp.click("#ddInstall");
  await gp.waitForTimeout(1600);
  check("a signed-out install tells the account nothing", !db.installs.some((i) => i.deck_id === typedId), JSON.stringify(db.installs.map((i) => i.deck_id)));
  /* Signing in, on the device that already holds the deck. The session is written into the page's own
     localStorage rather than through `addInitScript`, which only reaches pages opened AFTER it is added —
     this page already exists, so the script would never run and the "sign-in" would silently not happen. */
  await gp.evaluate((u) => {
    localStorage.setItem("folio_supa_v1", JSON.stringify({
      access_token: "mock-token", refresh_token: "mock-refresh",
      expires_at: Date.now() + 3600e3, user: { id: u.id, email: u.email },
    }));
  }, BOB);
  await gp.bringToFront();
  await gp.goto(base + "#decks", { waitUntil: "load" });
  await gp.reload({ waitUntil: "load" });
  await gp.waitForTimeout(5000);
  check("...and signing in announces it", db.installs.some((i) => i.user_id === BOB.id && i.deck_id === typedId), JSON.stringify(bobInstalls()));
  check("...without the account's own decks being taken off this device",
    hasTitle(await shelfOf(gp), "Typed Deck"));

  /* ================= an older install comes onto the id every device agrees on =================
     Until Aug 2026 an installed deck's local id was random, so the same deck sat under a different id on
     each device — and since `S.active`, the per-deck limits, the scheduler, the colour, the review's order
     and its groups are all keyed by that id, the reader's arrangement stopped at the device it was made
     on. A deck in the old shape is planted here, under a random id and with settings pointing at it, and
     what is asserted is that the rename takes those settings WITH it: renaming the deck and leaving the
     entries behind would look, on the page, exactly like a reader who had never added the deck.
     Planted while SIGNED OUT so that nothing syncs before the plant — signed in, the boot would install
     its own copy first and the id the rename wants would be taken. */
  const byzRow = db.decks.find((d) => d.slug === aliceSlug);
  const Dctx = await browser.newContext();
  await attachMock(Dctx, db, { user: BOB });
  const dp = await Dctx.newPage();
  const derrs = [];
  dp.on("pageerror", (e) => derrs.push("pageerror: " + String(e).slice(0, 200)));
  await dp.bringToFront();
  await dp.goto(base + "#decks", { waitUntil: "load" });
  await dp.waitForTimeout(1200);
  /* The entries live in the ACCOUNT's progress blob, which the boot after this will pull down and apply
     over whatever is on the device — so they are seeded there rather than in localStorage, which is also
     the honest shape: this is the arrangement the reader made on the device that installed the deck. */
  db.progress[BOB.id] = {
    data: Object.assign({}, (db.progress[BOB.id] || {}).data, {
      active: ["u:zz9random"], deckOpts: { "u:zz9random": { newPerDay: 7 } }, deckGroups: { "u:zz9random": { color: "#123456" } },
    }),
    updated_at: new Date().toISOString(),
  };
  const planted = await dp.evaluate((args) => new Promise((res) => {
    localStorage.setItem("folio_supa_v1", JSON.stringify({   // signed in, for the boot after this
      access_token: "mock-token", refresh_token: "mock-refresh",
      expires_at: Date.now() + 3600e3, user: { id: args.user.id, email: args.user.email },
    }));
    /* …AND THE PLANTED RECORD IS CLAIMED FOR THAT ACCOUNT, which is what an install does for itself.
       `communityBoot` mounts only the decks this reader owns (Aug 2026, "downloaded decks are only visible
       to the user who downloaded them"), so an unclaimed plant never mounts and is never renamed onto the
       shared id -- and the failure does not look like that: the account's own install row then arrives as
       a FRESH copy under the shared id, so "renamed onto the shared id" passes while the review entry, the
       daily limits, the colour and the planted card's own prose are all left behind on the old id. The
       rename is the thing this section is about, and without the claim it never runs at all. */
    try {
      const own = JSON.parse(localStorage.getItem("folio_deck_own_v1") || "null") || { v: 1, own: {} };
      (own.own[args.user.id] = own.own[args.user.id] || {})["zz9random"] = Date.now();
      localStorage.setItem("folio_deck_own_v1", JSON.stringify(own));
    } catch (e) {}
    const rq = indexedDB.open("folio-community");
    rq.onsuccess = () => {
      const idb = rq.result;
      const tx = idb.transaction("decks", "readwrite");
      tx.objectStore("decks").put({
        id: "zz9random",
        meta: {
          id: "zz9random", title: "Byzantine Emperors", subtitle: "", desc: "", author: "Alice",
          language: "en", tags: [], glossMode: "site", types: {}, version: 1, createdAt: 1, updatedAt: 1,
          remoteId: args.remote, slug: args.slug, origin: "installed", remoteStatus: "published",
          installedVersion: args.version, ownerName: "Alice",
        },
        cards: [{ id: "u_zz9random_1", question: "The planted ___ card", answer: "old", answerText: "old", abstract: "Planted by the test under a random id." }],
        gloss: {},
      });
      tx.oncomplete = () => { idb.close(); res(1); };
      tx.onerror = () => { idb.close(); res(0); };
    };
    rq.onerror = () => res(0);
  }), { remote: byzRow.id, slug: aliceSlug, version: byzRow.version, user: BOB });
  check("an old-shape install can be planted", planted === 1);
  // straight to the reload: the seeded `folio_v1` is only safe until the next `save()`, which writes the
  // app's own in-memory state over it — a navigation in between was enough to lose the planted entries
  await dp.reload({ waitUntil: "load" });
  await dp.waitForTimeout(6000);
  const dShelf = await shelfOf(dp);
  const want = idOf(arrived, "Byzantine Emperors");   // the id the other two devices file it under
  check("an older install is renamed onto the shared id", idOf(dShelf, "Byzantine Emperors") === want,
    JSON.stringify(dShelf));
  // …and it is the same deck, not a second copy installed alongside it
  check("...rather than a second copy arriving beside it",
    dShelf.filter((d) => d.title === "Byzantine Emperors").length === 1, JSON.stringify(dShelf.map((d) => d.title)));
  const moved = await dp.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    return { active: st.active || [], opts: Object.keys(st.deckOpts || {}), groups: Object.keys(st.deckGroups || {}) };
  });
  check("...and the review entry pointing at it moved with the rename",
    moved.active.indexOf("u:" + want) >= 0 && moved.active.indexOf("u:zz9random") < 0, JSON.stringify(moved.active));
  check("...as did its daily limits and its colour",
    moved.opts.indexOf("u:" + want) >= 0 && moved.groups.indexOf("u:" + want) >= 0 &&
    moved.opts.indexOf("u:zz9random") < 0 && moved.groups.indexOf("u:zz9random") < 0, JSON.stringify(moved));
  /* …and the rewrite goes back UP, which is the point of the whole exercise: the account's own list now
     names the id every device files this deck under, so the next device to boot resolves it. The wait is
     the progress push's own debounce — it is deliberately not instant, and checking before it fires would
     read a device that had not spoken yet as one that never does. */
  await dp.waitForTimeout(9000);
  const upstream = ((db.progress[BOB.id] || {}).data || {}).active || [];
  check("...and the account's own list is rewritten with it",
    upstream.indexOf("u:" + want) >= 0 && upstream.indexOf("u:zz9random") < 0, JSON.stringify(upstream));
  // the CARDS came through the rename: they are written under the deck's key, and a rekey that wrote the
  // index without warming them first would leave a deck of blank cards behind
  const kept = await dp.evaluate(async () => {
    const row = [...document.querySelectorAll(".collection.udeck [data-udeck]")][0];
    if (!row) return "no row";
    row.click();
    await new Promise((r) => setTimeout(r, 900));
    const rb = document.querySelector("#reveal-btn");
    if (!rb) return "no card";
    rb.click();
    await new Promise((r) => setTimeout(r, 500));
    return ((document.querySelector(".abstract") || {}).textContent || "").trim();
  });
  check("...and its cards survived it", /Planted by the test/.test(kept), kept.slice(0, 60));

  /* ================= TWO ACCOUNTS ON ONE DEVICE (Aug 2026, on a bug report) =================
     A deck imported and shared under one account, then added from the Shared decks list under a SECOND
     account on the same device, reached no other device of that second account.

     Every earlier section here gives each account a device of its own, which is the case the sync was
     written against and is not how a phone is used. Community decks are DEVICE-local and shared by every
     account signing in on it, so the second account meets the first's decks already present — and the deck
     page read that presence as "your account has this", showed Study/Remove, and offered no way in. No
     `deck_installs` row was ever written, so the account's list never mentioned the deck and no other
     device could learn of it. The reader had the deck on the phone and nothing on the PC, with nothing
     anywhere saying why.

     EVERY ASSERTION BELOW FAILS SILENTLY on a real site: the deck is genuinely present and studiable on the
     device it was added on, so the only symptom is on a DIFFERENT device, where a deck that never arrives
     looks exactly like a deck nobody added. The last two are the reader's actual complaint — it is the
     DAILY STUDY the deck has to reach, which additionally requires both devices to file it under the same
     local id. */
  /* Deliberately NOT newSession: its addInitScript is fixed at add time and re-writes THAT account's
     session on every single load, so a device switched to the second account is silently switched back on
     the next navigation — the app stays signed in as the first while the mock answers as the second, and
     the page then reads as the author looking at their own deck. The session is written by hand instead. */
  const oneDevice = await (async () => {
    const ctx = await browser.newContext({ acceptDownloads: true });
    const ref = { user: ALICE };
    await attachMock(ctx, db, ref);
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push("pageerror: " + String(e).slice(0, 200)));
    page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push("console: " + t.slice(0, 300)); });
    // a fresh page sits on about:blank, whose origin is opaque — reading localStorage there is a
    // SecurityError, and one thrown here fails the whole file's error watcher
    await page.goto(base, { waitUntil: "load" });
    return { ctx, page, errs, ref };
  })();
  async function deviceSignsInAs(who) {
    oneDevice.ref.user = who;
    await oneDevice.page.evaluate((u) => {
      localStorage.setItem("folio_supa_v1", JSON.stringify({
        access_token: "mock-token", refresh_token: "mock-refresh",
        expires_at: Date.now() + 3600e3, user: { id: u.id, email: u.email },
      }));
    }, who);
    // a query string, so this is a cross-document load and boot actually runs — see the note on #community
    await oneDevice.page.goto(base + "?as=" + who.username + "#home", { waitUntil: "load" });
    await oneDevice.page.waitForTimeout(2200);
  }
  await deviceSignsInAs(ALICE);
  await oneDevice.page.goto(base + "#studio", { waitUntil: "load" });
  await oneDevice.page.waitForTimeout(1200);
  await oneDevice.page.click("#stNew");
  await oneDevice.page.waitForTimeout(400);
  await oneDevice.page.click(".studio-settings > summary");
  await oneDevice.page.fill('[data-meta="title"]', "Shared On One Device");
  await oneDevice.page.waitForTimeout(200);
  await oneDevice.page.click("#stAddCard");
  await oneDevice.page.waitForTimeout(300);
  await typeField(oneDevice.page, "question", "The word for water is ___.");
  await typeField(oneDevice.page, "answer", "shui");
  await oneDevice.page.waitForTimeout(300);
  await oneDevice.page.click("#stPublish");
  await oneDevice.page.waitForTimeout(1200);
  const sharedRow = db.decks.find((d) => d.title === "Shared On One Device");
  check("a deck shared by the first account on this device", !!sharedRow, JSON.stringify(db.decks.map((d) => d.title)));

  await deviceSignsInAs(BOB);
  await oneDevice.page.goto(base + "#deck/" + sharedRow.slug, { waitUntil: "load" });
  await oneDevice.page.waitForTimeout(1600);
  /* WHAT THE SECOND ACCOUNT IS OFFERED, and this section was written before the answer changed. It used
     to be an adopt: the device held a copy, so BOB was shown "Add to my account" over Alice's deck, with
     her Study and Remove left in place and a `.ddetail-adopt` note explaining the state. The ownership
     register (Aug 2026, on request: "downloaded decks are only visible to the user who downloaded them,
     even on the same device") makes that the wrong offer -- Alice's deck is not Bob's to see, let alone to
     study or to remove -- so what he gets is the ordinary install, and installing gives him his own copy
     beside hers rather than adopting hers. Asserted in the negative as well as the positive, since a
     Study button appearing here would be the isolation quietly failing. */
  const acts = await oneDevice.page.textContent(".ddetail-actions");
  check("the second account is offered a plain install, not somebody else's copy", /Add to my decks/.test(acts), acts);
  check("...and neither Study nor Remove over a deck that is not its own",
    !/Study/.test(acts) && !/Remove from this device/.test(acts), acts);
  check("...nor the adopt note, there being nothing here it can see",
    await oneDevice.page.evaluate(() => !document.querySelector(".ddetail-adopt")));
  await oneDevice.page.click("#ddInstall");
  await oneDevice.page.waitForTimeout(2200);
  check("adding it records the install on the second account",
    db.installs.some((i) => i.user_id === BOB.id && i.deck_id === sharedRow.id),
    JSON.stringify(db.installs.filter((i) => i.deck_id === sharedRow.id).map((i) => i.user_id.slice(0, 6))));
  /* …and the AUTHOR's own record survives it. Re-mounting the server's copy over it would take the
     `origin: "mine"` away and with it the only handle on the published row — uDeckPublish PATCHes by
     remoteId, so an author left without one publishes a second, separate deck instead of updating theirs. */
  const stillMine = await oneDevice.page.evaluate((t) => {
    return new Promise((res) => {
      const rq = indexedDB.open("folio-community");
      rq.onsuccess = () => {
        const d2 = rq.result;
        const q = d2.transaction("decks", "readonly").objectStore("decks").getAll();
        q.onsuccess = () => {
          /* THE AUTHOR'S record, not merely the first with this title. Since the register, Bob's install
             is a SECOND record beside Alice's rather than a rewrite of it, so a find-by-title picks
             whichever the store hands back first -- which reported her authorship as lost while it was
             sitting intact in the next row. Hers is the one that is not an install. */
          const hits = q.result.filter((x) => (x.meta || {}).title === t);
          const hit = hits.find((x) => (x.meta || {}).origin !== "installed") || hits[0];
          d2.close(); res(hit ? { origin: hit.meta.origin, remoteId: !!hit.meta.remoteId,
            copies: hits.length } : null);
        };
        q.onerror = () => { d2.close(); res(null); };
      };
      rq.onerror = () => res(null);
    });
  }, "Shared On One Device");
  check("...leaving the author's own record intact, so they can still publish updates from this device",
    !!stillMine && stillMine.origin !== "installed" && stillMine.remoteId, JSON.stringify(stillMine));
  check("...as a copy of its own beside hers, rather than over the top of it",
    !!stillMine && stillMine.copies === 2, JSON.stringify(stillMine));

  // the reader's actual complaint: it is the DAILY STUDY the deck has to reach on the other device
  await oneDevice.page.goto(base + "#decks", { waitUntil: "load" });
  await oneDevice.page.waitForTimeout(1600);
  await oneDevice.page.evaluate(() => { const b = document.querySelector("[data-uadd]"); if (b) b.click(); });
  await oneDevice.page.waitForTimeout(1200);
  const phoneActive = await oneDevice.page.evaluate(() =>
    (JSON.parse(localStorage.getItem("folio_v1") || "{}").active || []).filter((x) => String(x).startsWith("u:")));
  // THIS deck's entry, not a count: the account already studies a deck from an earlier section, and its
  // S.active came down with the progress blob the moment this device signed in as it
  const localIdHere = await oneDevice.page.evaluate((t) => {
    return new Promise((res) => {
      const rq = indexedDB.open("folio-community");
      rq.onsuccess = () => {
        const d2 = rq.result;
        const q = d2.transaction("decks", "readonly").objectStore("decks").getAll();
        q.onsuccess = () => { const hit = q.result.find((x) => (x.meta || {}).title === t); d2.close(); res(hit ? hit.id : ""); };
        q.onerror = () => { d2.close(); res(""); };
      };
      rq.onerror = () => res("");
    });
  }, "Shared On One Device");
  check("the second account puts it in the daily study here", !!localIdHere && phoneActive.indexOf("u:" + localIdHere) >= 0,
    "id=" + localIdHere + " active=" + JSON.stringify(phoneActive));

  const otherDevice = await newSession(browser, db, BOB, base);
  await otherDevice.page.goto(base + "#home", { waitUntil: "load" });
  await otherDevice.page.waitForTimeout(3600);
  const landed = await otherDevice.page.evaluate(() => {
    return new Promise((res) => {
      const rq = indexedDB.open("folio-community");
      rq.onsuccess = () => {
        const d2 = rq.result;
        const q = d2.transaction("decks", "readonly").objectStore("decks").getAll();
        q.onsuccess = () => { const r = q.result.map((x) => (x.meta || {}).title); d2.close(); res(r); };
        q.onerror = () => { d2.close(); res([]); };
      };
      rq.onerror = () => res([]);
    });
  });
  check("THE SECOND ACCOUNT'S OTHER DEVICE RECEIVES THE DECK", landed.indexOf("Shared On One Device") >= 0, JSON.stringify(landed));
  const otherActive = await otherDevice.page.evaluate(() =>
    (JSON.parse(localStorage.getItem("folio_v1") || "{}").active || []).filter((x) => String(x).startsWith("u:")));
  check("...under the same local id, so the reader's arrangement of it came too",
    JSON.stringify(otherActive) === JSON.stringify(phoneActive), "other=" + JSON.stringify(otherActive) + " first=" + JSON.stringify(phoneActive));
  await otherDevice.page.goto(base + "#home", { waitUntil: "load" });
  await otherDevice.page.waitForTimeout(2500);
  const inReview = await otherDevice.page.evaluate(() =>
    [...document.querySelectorAll(".active-deck .dk-title")].map((e) => e.textContent.trim()));
  check("...AND IT IS IN THE DAILY STUDY THERE", inReview.some((t) => /Shared On One Device/.test(t)), JSON.stringify(inReview));

  const errs = [...A.errs, ...B.errs, ...M.errs, ...B2.errs, ...gerrs, ...derrs, ...oneDevice.errs, ...otherDevice.errs];
  check("no console/page errors", errs.length === 0, [...new Set(errs)].join(" | "));

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
