// Regression test: switching accounts on one device must not carry levels, badges or streaks across.
//
// The bug this guards: signing in when the server row is empty MIGRATED whatever progress was in
// localStorage up into that account. That is right for a guest who studied before ever making an account,
// and wrong for every account after the first — a newly created account inherited (and then permanently
// owned, since we push it up) the previous account's history.
//
// Runs against an in-memory mock of the Supabase auth + REST endpoints: the publishable key in app.js
// points at the real project, so a test that really signed up would create users in it.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-account-switch.js
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
function makeDb() { return { users: [], progress: {}, seq: 0 }; }
function uuid(n) { return "00000000-0000-4000-8000-" + String(100000000000 + n).slice(0, 12); }
function stamp(db) { return new Date(Date.UTC(2026, 0, 1, 0, 0, ++db.seq)).toISOString(); }
function userByToken(db, auth) {
  const m = /^Bearer tok-(.+)$/.exec(auth || "");
  return m ? db.users.find((u) => u.id === m[1]) || null : null;
}

function handleSupa(db, url, method, body, headers) {
  const u = new URL(url);
  const p = u.pathname;
  const me = userByToken(db, headers.authorization || headers.Authorization);
  const eqOf = (param) => { const v = u.searchParams.get(param); return v && v.startsWith("eq.") ? v.slice(3) : null; };
  const session = (usr) => ({ access_token: "tok-" + usr.id, refresh_token: "ref-" + usr.id, expires_in: 3600, user: { id: usr.id, email: usr.email } });

  /* ---- auth ---- */
  if (p === "/auth/v1/signup") {
    if (db.users.some((x) => x.email === body.email)) return [400, { msg: "User already registered" }];
    const usr = {
      id: uuid(db.users.length + 1), email: body.email,
      password: body.password, username: (body.data || {}).username, name: (body.data || {}).name, role: "user",
    };
    db.users.push(usr);
    db.progress[usr.id] = { data: {}, updated_at: null };   // the signup trigger seeds an empty row
    return [200, session(usr)];
  }
  if (p === "/auth/v1/token") {
    if (u.searchParams.get("grant_type") === "refresh_token") {
      const usr = db.users.find((x) => "ref-" + x.id === body.refresh_token);
      return usr ? [200, session(usr)] : [400, { msg: "Invalid refresh token" }];
    }
    const usr = db.users.find((x) => x.email === body.email && x.password === body.password);
    return usr ? [200, session(usr)] : [400, { error_description: "Invalid login credentials" }];
  }
  if (p === "/auth/v1/logout") return [204, null];
  if (p === "/auth/v1/user") {
    if (method === "PUT") return [200, me ? { id: me.id, email: me.email } : {}];
    return me ? [200, { id: me.id, email: me.email }] : [401, { msg: "no session" }];
  }

  /* ---- rest ---- */
  if (p.startsWith("/rest/v1/profiles")) {
    const id = eqOf("id"), usr = db.users.find((x) => x.id === id);
    if (method === "PATCH") { if (usr) Object.assign(usr, body); return [200, usr ? [usr] : []]; }
    return [200, usr ? [{ id: usr.id, username: usr.username, name: usr.name, role: usr.role, joined: "2026-01-01", avatar: null }] : []];
  }
  if (p.startsWith("/rest/v1/progress")) {
    const id = eqOf("user_id") || (body && body.user_id);
    if (method === "GET") { const row = db.progress[id]; return [200, row ? [{ data: row.data, updated_at: row.updated_at }] : []]; }
    if (method === "POST") { if (!db.progress[id]) db.progress[id] = { data: {}, updated_at: null }; return [201, [db.progress[id]]]; }
    if (method === "PATCH") {
      if (!me || me.id !== id) return [403, { message: "row-level security" }];   // mirrors the RLS policy
      db.progress[id] = { data: body.data, updated_at: stamp(db) };
      return [200, [{ updated_at: db.progress[id].updated_at }]];
    }
  }
  if (p.startsWith("/rest/v1/content_overrides")) return [200, [{ data: {}, updated_at: "2026-01-01T00:00:00Z" }]];
  if (p.startsWith("/rest/v1/friends")) return [200, []];
  if (p.startsWith("/rest/v1/deck_installs")) return [200, []];
  if (p.startsWith("/rest/v1/user_decks")) return [200, []];

  return [404, { message: "mock: unhandled " + method + " " + p }];
}

async function attachMock(ctx, db) {
  await ctx.route((url) => SUPA.test(url.toString()), async (routeObj) => {
    const req = routeObj.request();
    let body = null;
    try { const pd = req.postData(); if (pd) body = JSON.parse(pd); } catch (e) {}
    let out;
    try { out = handleSupa(db, req.url(), req.method(), body, req.headers()); }
    catch (e) { out = [500, { message: "mock error: " + e.message }]; }
    await routeObj.fulfill({
      status: out[0], contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: out[1] === null ? "" : JSON.stringify(out[1]),
    });
  });
}

// ---------------------------------------------------------------- helpers
// three studied cards + two unlocked badges + a streak: the "old account" history that must not travel
function guestProgress() {
  const day = 86400000, cards = {};
  ["cnh-001", "wh-p-001", "wh-p-002"].forEach((id, i) => {
    cards[id] = { reps: 4 + i, lapses: 0, ease: 2.5, interval: 30, due: Date.now() + day * (i + 1), status: "review", last: Date.now() - day };
  });
  return {
    user: { name: "Scholar", joined: Date.now() - day * 40 },
    cards, achievements: { seen1: Date.now() - day * 5, streak3: Date.now() - day * 2 },
    streak: { count: 6, last: new Date().toISOString().slice(0, 10) },
    reviewLog: { "2026-07-20": [12, 8, 10] },
  };
}

async function newPage(browser, db, seed) {
  const ctx = await browser.newContext();
  await attachMock(ctx, db);
  // Seed EXACTLY once per context. addInitScript runs on every navigation, and this test is entirely about
  // what survives a reload and a sign-out — re-seeding would silently restore the starting state each time
  // (including a session the test had just signed out of).
  if (seed) await ctx.addInitScript((s) => {
    if (localStorage.getItem("__folio_test_seeded")) return;
    localStorage.setItem("__folio_test_seeded", "1");
    Object.keys(s).forEach((k) => localStorage.setItem(k, s[k]));
  }, seed);
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|ERR_/.test(m.text())) errs.push("console: " + m.text().slice(0, 200)); });
  return { ctx, page, errs };
}

// goto() to a URL differing only in the #fragment is a same-document navigation — the app keeps running.
async function gotoFresh(page, url) {
  if (page.url() === url) await page.reload({ waitUntil: "load" });
  else await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(900);   // supaBoot is async
}
async function openAccount(page, base) { await gotoFresh(page, base + "#account"); }

async function register(page, email, username, pw) {
  await page.click('.auth-tab[data-av="register"]');
  await page.fill('[data-form="register"] [name="e"]', email);
  await page.fill('[data-form="register"] [name="u"]', username);
  await page.fill('[data-form="register"] [name="p"]', pw);
  await page.fill('[data-form="register"] [name="p2"]', pw);
  await page.click('[data-form="register"] .auth-btn');
  await page.waitForTimeout(900);
}
async function signIn(page, email, pw) {
  await page.fill('[data-form="signin"] [name="u"]', email);
  await page.fill('[data-form="signin"] [name="p"]', pw);
  await page.click('[data-form="signin"] .auth-btn');
  await page.waitForTimeout(900);
}
async function signOut(page) { await page.click("#signout"); await page.waitForTimeout(900); }

const local = (page) => page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
  return {
    cards: Object.keys(s.cards || {}).length,
    achievements: Object.keys(s.achievements || {}).length,
    streak: (s.streak || {}).count || 0,
    reviewDays: Object.keys(s.reviewLog || {}).length,
    owner: s._supaOwner || null,
    signedIn: !!JSON.parse(localStorage.getItem("folio_supa_v1") || "null"),
  };
});
const badgeCount = (page) => page.evaluate(() => {
  const el = document.querySelector(".badges-count");
  return el ? parseInt(el.textContent, 10) : -1;
});
const homeState = async (page, base) => {
  await gotoFresh(page, base + "#home");
  return page.evaluate(() => ({
    hero: !!document.querySelector(".banner.hero"),
    level: (document.querySelector(".banner .lb-num") || {}).textContent || "",
  }));
};

// ---------------------------------------------------------------- the run
(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch(LAUNCH);
  const db = makeDb();
  const PW = "hunter2!";

  // ============ 1. a guest with study history creates their FIRST account ============
  const A = await newPage(browser, db, { folio_v1: JSON.stringify(guestProgress()) });
  await openAccount(A.page, base);
  await register(A.page, "alice@test", "alice", PW);

  let st = await local(A.page);
  check("first account adopts unclaimed guest progress", st.cards === 3 && st.achievements === 2, JSON.stringify(st));
  check("first account: streak carried up", st.streak === 6);
  check("first account: progress is claimed on the device", !!st.owner);
  const aliceId = st.owner;
  check("alice's server row holds the migrated progress",
    Object.keys(((db.progress[aliceId] || { data: {} }).data.cards) || {}).length === 3);

  let home = await homeState(A.page, base);
  check("first account: home shows a level banner, not the first-run hero", !home.hero && home.level !== "");
  await openAccount(A.page, base);
  check("first account: badges are shown", (await badgeCount(A.page)) === 2, "badges=" + (await badgeCount(A.page)));

  // ============ 2. sign out, then create a SECOND, brand-new account ============
  await signOut(A.page);
  st = await local(A.page);
  check("sign-out restores the device's own progress", st.cards === 3 && !st.signedIn, JSON.stringify(st));

  await openAccount(A.page, base);
  await register(A.page, "bob@test", "bob", PW);
  st = await local(A.page);
  const bobId = st.owner;

  check("NEW account starts with no studied cards", st.cards === 0, "cards=" + st.cards);
  check("NEW account starts with no badges", st.achievements === 0, "achievements=" + st.achievements);
  check("NEW account starts with no streak", st.streak === 0, "streak=" + st.streak);
  check("NEW account starts with no review history", st.reviewDays === 0, "days=" + st.reviewDays);
  check("NEW account claims the device", bobId && bobId !== aliceId);
  check("NEW account's server row is empty of alice's cards",
    Object.keys(((db.progress[bobId] || { data: {} }).data.cards) || {}).length === 0);
  check("alice's server row is untouched",
    Object.keys(((db.progress[aliceId] || { data: {} }).data.cards) || {}).length === 3);

  check("NEW account: badges page reads 0 unlocked", (await badgeCount(A.page)) === 0, "badges=" + (await badgeCount(A.page)));
  home = await homeState(A.page, base);
  check("NEW account: home shows the first-run hero, no level banner", home.hero, JSON.stringify(home));

  // ============ 3. signing back into the first account restores ITS progress ============
  await openAccount(A.page, base);
  await signOut(A.page);
  await openAccount(A.page, base);
  await signIn(A.page, "alice@test", PW);
  st = await local(A.page);
  check("signing back into the first account restores its progress", st.cards === 3 && st.achievements === 2, JSON.stringify(st));
  check("…and re-claims the device for it", st.owner === aliceId);

  // ============ 4. …and back to the second account, which is still empty ============
  await openAccount(A.page, base);
  await signOut(A.page);
  await openAccount(A.page, base);
  await signIn(A.page, "bob@test", PW);
  st = await local(A.page);
  check("switching back to the new account keeps it empty", st.cards === 0 && st.achievements === 0, JSON.stringify(st));

  // ============ 5. a session that predates _supaOwner is claimed at boot ============
  // Older saves have no ownership marker, so their progress would read as "unclaimed guest progress"
  // and be inherited by the next account created on that device.
  const legacy = Object.assign(guestProgress(), {});
  const C = await newPage(browser, db, {
    folio_v1: JSON.stringify(legacy),
    folio_supa_v1: JSON.stringify({ access_token: "tok-" + aliceId, refresh_token: "ref-" + aliceId, expires_at: Date.now() + 3600e3, user: { id: aliceId, email: "alice@test" } }),
  });
  await gotoFresh(C.page, base + "#account");
  st = await local(C.page);
  check("a pre-existing session claims the local progress at boot", st.owner === aliceId, JSON.stringify(st));
  await signOut(C.page);
  await openAccount(C.page, base);
  await register(C.page, "carol@test", "carol", PW);
  st = await local(C.page);
  check("an account created after a legacy session starts clean", st.cards === 0 && st.achievements === 0, JSON.stringify(st));

  const errs = A.errs.concat(C.errs);
  check("no console errors", errs.length === 0, errs.slice(0, 3).join(" | "));

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
