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
  return { decks: [], cards: [], installs: [], reports: [], seq: 0 };
}
function uuid(n) { return "00000000-0000-4000-8000-" + String(100000000000 + n).slice(0, 12); }

function handleSupa(db, url, method, body, asUser) {
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
        price_cents: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }, body);
      db.decks.push(row);
      return [201, [row]];
    }
    if (method === "PATCH") {
      const id = eqOf("id");
      const row = db.decks.find((d) => d.id === id);
      if (!row) return [404, { message: "not found" }];
      if (row.owner !== asUser.id && asUser.role !== "admin") return [403, { message: "row-level security" }];   // mirrors the RLS policy
      Object.assign(row, body, { updated_at: new Date().toISOString() });
      return [200, [row]];
    }
    // GET
    const id = eqOf("id"), slug = eqOf("slug"), status = eqOf("status");
    const inIds = (u.searchParams.get("id") || "").startsWith("in.")
      ? (u.searchParams.get("id") || "").slice(4, -1).split(",") : null;
    let rows = db.decks.slice();
    // the select policy: published, or your own, or admin
    rows = rows.filter((d) => d.status === "published" || d.owner === asUser.id || asUser.role === "admin");
    if (id) rows = rows.filter((d) => d.id === id);
    if (inIds) rows = rows.filter((d) => inIds.indexOf(d.id) >= 0);
    if (slug) rows = rows.filter((d) => d.slug === slug);
    if (status) rows = rows.filter((d) => d.status === status);
    const or = u.searchParams.get("or");
    if (or) {
      const m = /ilike\.\*([^*)]*)\*/.exec(or);
      if (m) { const t = decodeURIComponent(m[1]).toLowerCase(); rows = rows.filter((d) => ((d.title || "") + " " + (d.subtitle || "") + " " + (d.description || "")).toLowerCase().includes(t)); }
    }
    const order = u.searchParams.get("order") || "";
    if (order.startsWith("title.asc")) rows.sort((a, b) => a.title.localeCompare(b.title));
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
    return [200, db.cards.filter((c) => c.deck_id === id).sort((a, b) => a.ord - b.ord)];
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
    try { out = handleSupa(db, req.url(), req.method(), body, userRef.user); }
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
  check("browse shows the title", /Byzantine Emperors/.test(await B.page.textContent(".cdeck-grid")));

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

  // ================= exports never carry publish state =================
  await A.page.bringToFront();
  // reload, not goto: Alice is already on #studio inside a deck, and a same-URL goto is a fragment
  // navigation that would leave the deck editor open instead of returning to the list
  await A.page.reload({ waitUntil: "load" });
  await A.page.waitForTimeout(1100);
  const [dl] = await Promise.all([A.page.waitForEvent("download"), A.page.click("[data-export]")]);
  const f = path.join(require("os").tmpdir(), dl.suggestedFilename());
  await dl.saveAs(f);
  const exported = JSON.parse(fs.readFileSync(f, "utf8"));
  check("export omits the publish state", !exported.meta.remoteId && !exported.meta.slug && !exported.meta.origin,
    JSON.stringify(Object.keys(exported.meta)));

  const errs = [...A.errs, ...B.errs, ...M.errs];
  check("no console/page errors", errs.length === 0, [...new Set(errs)].join(" | "));

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
