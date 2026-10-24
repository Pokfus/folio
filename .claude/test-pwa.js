/* test-pwa.js — the installed app, end to end in Chromium (Oct 2026, docs/downloadable-app-plan.md, docs/reminders.md).

     node .claude/test-pwa.js            (Playwright; FOLIO_SHOTS=1 also saves the Settings card)

   A service worker never runs on a dev origin (isDevOrigin: file://, localhost, private addresses), so this suite
   serves the repo on http://folio.localhost:<port>: Chromium resolves every *.localhost name to the loopback and
   counts it a secure context, while app.js's dev-origin test matches only a bare "localhost". The server sends strong ETags and answers If-None-Match with 304, as Cloudflare
   Pages does, and can change a file's content or delay it on demand.

   Re-run after touching sw.js, the "THE INSTALLED APP" block of app.js (appUpdateStrip, appAdopt, installOfferHTML,
   keepSet, remindEnable / remindSync / remindDisable, appSettingsHTML), manifest.json or the icons.

     1. the worker installs, claims the page, and holds every SHELL file in one folio-shell-* set
     2. the old worker's folio-v7 cache is folded into folio-assets and deleted
     3. OFFLINE: a reload opens Folio from the phone, with every eager script
     4. SAME MOMENT: two shell files changed on the server are BOTH new on the very next open
     5. ATOMIC: a release slower than the wait opens on the old set, whole, then offers "Reload"; the reload is new
     6. a lazy file cached under an older release is confirmed with its ETag and arrives new
     7. Keep on this device: the card details are fetched with progress, sized, and dropped again
     8. reminders: 8 p.m. by default, the permission asked on the tap, the row written (push_save) with the reader's
        clock, a new time re-saved, switched off (push_delete)
     9. a push shows the notification the payload describes; a payload-less push still shows one
    10. the install button appears when Chrome offers an install */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const ROOT = path.resolve(__dirname, "..");
const LAUNCH_EXTRA = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".bin": "application/octet-stream", ".mp3": "audio/mpeg" };
const VAPID_PUBLIC = "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4";   // any P-256 point will do

const override = new Map();   // "/mission.js" → Buffer
const delay = new Map();      // "/mission.js" → ms
const hits = [];
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  hits.push(p);
  if (p === "/api/vapid") { res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ key: VAPID_PUBLIC })); return; }
  if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  const send = (body) => {
    const etag = '"' + crypto.createHash("sha1").update(body).digest("hex") + '"';
    const go = () => {
      if (req.headers["if-none-match"] === etag) { res.writeHead(304, { ETag: etag }); res.end(); return; }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", ETag: etag, "Cache-Control": "public, max-age=0, must-revalidate" });
      res.end(req.method === "HEAD" ? undefined : body);
    };
    const d = delay.get(p);
    d ? setTimeout(go, d) : go();
  };
  if (override.has(p)) { send(override.get(p)); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } send(data); });
});

let fails = 0, passes = 0;
const ok = (c, m) => { if (c) { passes++; console.log("  ok    " + m); } else { fails++; console.log("  \x1b[31mFAIL\x1b[0m  " + m); } };
const fs_rivers = fs.readFileSync(path.join(ROOT, "rivers.js"), "utf8");
const append = (f, line) => Buffer.concat([override.get(f) || fs.readFileSync(path.join(ROOT, f)), Buffer.from("\n" + line + "\n")]);

(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const BASE = "http://folio.localhost:" + port + "/";
  // the FULL Chromium in its new headless mode (`channel: "chromium"`): the lighter headless shell has no notifications
  // at all (Notification.permission is always "denied" and showNotification fails), which section 8 and 9 need
  const browser = await chromium.launch(Object.assign({ channel: "chromium" }, LAUNCH_EXTRA));
  const context = await browser.newContext({ viewport: { width: 420, height: 900 } });
  // granted before the first load: headless Chromium reads Notification.permission once per page, so a grant made
  // later is answered "granted" by requestPermission while Notification.permission still says "denied"
  await context.grantPermissions(["notifications"], { origin: BASE.slice(0, -1) });
  const supa = [];
  await context.route(/supabase\.co/, (route) => {
    const u = route.request().url();
    if (/rpc\/push_save/.test(u)) { supa.push({ fn: "push_save", body: JSON.parse(route.request().postData() || "{}") }); return route.fulfill({ status: 200, contentType: "application/json", body: "true" }); }
    if (/rpc\/push_delete/.test(u)) { supa.push({ fn: "push_delete", body: JSON.parse(route.request().postData() || "{}") }); return route.fulfill({ status: 204, body: "" }); }
    return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  // a push service is not reachable from a test browser: subscribe answers with a fixed subscription
  await context.addInitScript((key) => {
    if (!window.PushManager) return;
    const fake = { endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint", options: { applicationServerKey: Uint8Array.from(atob(key.replace(/-/g, "+").replace(/_/g, "/") + "="), (c) => c.charCodeAt(0)).buffer },
      toJSON() { return { endpoint: this.endpoint, keys: { p256dh: key, auth: "BTBZMqHH6r4Tts7J_aSIgg" } }; }, unsubscribe: async () => { window.__unsubscribed = true; return true; } };
    let subbed = false;
    PushManager.prototype.subscribe = async function () { subbed = true; return fake; };
    PushManager.prototype.getSubscription = async function () { return subbed ? fake : null; };
  }, VAPID_PUBLIC);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text()) && !/Failed to load resource|net::ERR_INTERNET_DISCONNECTED/.test(m.text())) errors.push("console: " + m.text().slice(0, 300)); });
  const waitFor = (fn, ms, arg) => page.waitForFunction(fn, arg, { timeout: ms || 20000 }).then(() => true, () => false);
  const marks = () => page.evaluate(() => ({ m: window.__T_MISSION || 0, q: window.__T_QUOTES || 0 }));

  console.log("\n1) install");
  await page.goto(BASE, { waitUntil: "load" });
  // the old worker's cache, as a reader of v7 would have it, before the new worker activates
  await page.evaluate(async () => { const c = await caches.open("folio-v7"); await c.put("rivers.js", new Response("/* legacy */", { headers: { "Content-Type": "text/javascript" } })); });
  ok(await waitFor(() => navigator.serviceWorker && navigator.serviceWorker.controller, 30000), "the worker registers and takes the page");
  const sets = await page.evaluate(async () => {
    const keys = await caches.keys();
    const shell = keys.filter((k) => k.startsWith("folio-shell-"));
    const c = shell.length ? await caches.open(shell[0]) : null;
    return { keys, shell, n: c ? (await c.keys()).length : 0 };
  });
  const SHELL = /const SHELL = \[([\s\S]*?)\];/.exec(fs.readFileSync(path.join(ROOT, "sw.js"), "utf8"))[1].match(/"[^"]+"/g).length;
  ok(sets.shell.length === 1 && sets.n === SHELL, "one shell set holding all " + SHELL + " files (" + sets.n + ")");

  console.log("2) the legacy cache");
  const legacy = await page.evaluate(async () => {
    const keys = await caches.keys();
    const a = await caches.open("folio-assets");
    const r = await a.match(new URL("rivers.js", location.href).href);
    return { gone: !keys.includes("folio-v7"), kept: r ? await r.text() : null };
  });
  ok(legacy.gone && legacy.kept === "/* legacy */", "folio-v7 folded into folio-assets and deleted");

  console.log("3) offline");
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1500);
  await context.setOffline(true);
  await page.reload({ waitUntil: "load" });
  ok(await waitFor(() => window.CARD_DATA && window.CARD_DATA.length > 100 && window.GLOSSARY && window.FOLIO_VERSION && document.querySelector("#view") && document.querySelector("#view").children.length > 0, 15000), "offline, Folio opens with its data and draws a page");
  const fontsOk = await page.evaluate(() => [...document.styleSheets].some((s) => (s.href || "").endsWith("fonts.css")));
  ok(fontsOk, "offline, fonts.css is applied");
  await context.setOffline(false);

  console.log("4) a release lands on the next open");
  override.set("/mission.js", append("mission.js", "window.__T_MISSION = 1;"));
  override.set("/quotes.js", append("quotes.js", "window.__T_QUOTES = 1;"));
  await page.reload({ waitUntil: "load" });
  let mk = await marks();
  ok(mk.m === 1 && mk.q === 1, "both changed files are new on the very next open (" + JSON.stringify(mk) + ")");
  const one = await page.evaluate(async () => (await caches.keys()).filter((k) => k.startsWith("folio-shell-")).length);
  ok(one <= 2, "at most the current and the previous set are kept (" + one + ")");

  console.log("5) a slow release opens whole on the old set, then offers Reload");
  override.set("/mission.js", append("mission.js", "window.__T_MISSION = 2;"));
  override.set("/quotes.js", append("quotes.js", "window.__T_QUOTES = 2;"));
  delay.set("/quotes.js", 6500);
  await page.reload({ waitUntil: "load" });
  mk = await marks();
  ok(mk.m === 1 && mk.q === 1, "the open is the OLD set, whole — never one new file and one old (" + JSON.stringify(mk) + ")");
  ok(await waitFor(() => document.querySelector(".app-update"), 15000), "the “a new version is ready” strip appears once the new set is in");
  delay.clear();
  await page.reload({ waitUntil: "load" });
  mk = await marks();
  ok(mk.m === 2 && mk.q === 2, "Reload opens the new set (" + JSON.stringify(mk) + ")");

  console.log("6) a lazy file arrives with the release that changed it");
  // the legacy copy carries no generation, so its first use confirms it (it differs, so the real file replaces it)
  const lazyBefore = await page.evaluate(async () => (await fetch("rivers.js")).text());
  ok(lazyBefore === fs_rivers, "an untagged legacy copy is confirmed on first use and replaced");
  override.set("/rivers.js", Buffer.from("/* rivers v2 */"));
  override.set("/mission.js", append("mission.js", "window.__T_MISSION = 3;"));
  await page.reload({ waitUntil: "load" });
  const lazyAfter = await page.evaluate(async () => (await fetch("rivers.js")).text());
  ok(lazyAfter === "/* rivers v2 */", "after a release, the lazy file is confirmed and arrives new");
  hits.length = 0;
  const again = await page.evaluate(async () => (await fetch("rivers.js")).text());
  ok(again === "/* rivers v2 */" && !hits.includes("/rivers.js"), "and is then served from the phone with no request");
  override.delete("/rivers.js");

  console.log("7) keep on this device");
  await page.goto(BASE + "#settings", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  ok(await waitFor(() => document.querySelector("#sw-keep-cards"), 15000), "the App card has the keep switches");
  await page.click("#sw-keep-cards");
  const t0 = Date.now();
  const keptShown = await waitFor(() => /Kept on this device: [\d.]+ MB/.test((document.querySelector("#keepNote-cards") || {}).textContent || ""), 240000);
  ok(keptShown, "the card details download and their size is shown: \u201c" + await page.evaluate(() => document.querySelector("#keepNote-cards").textContent) + "\u201d (" + Math.round((Date.now() - t0) / 1000) + " s)");
  const kept = await page.evaluate(async () => !!(await (await caches.open("folio-assets")).match(new URL("data-extra/gr.js", location.href).href)));
  ok(kept, "data-extra/gr.js is on the phone");
  await page.click("#sw-keep-cards");
  await page.waitForTimeout(1500);
  const dropped = await page.evaluate(async () => !(await (await caches.open("folio-assets")).match(new URL("data-extra/gr.js", location.href).href)));
  ok(dropped, "switched off, the files are dropped again");

  console.log("8) reminders");
  ok(await page.evaluate(() => document.querySelector("#remindAt").value) === "20:00", "the time defaults to 8 p.m.");
  await page.click("#sw-remind");
  ok(await waitFor(() => /^On: every day at/.test(document.querySelector("#remindNote").textContent), 20000), "switched on: " + await page.evaluate(() => document.querySelector("#remindNote").textContent));
  const saved = supa.filter((x) => x.fn === "push_save").pop();
  const row = saved && saved.body.p;
  ok(row && row.remind_at === 1200 && row.endpoint === "https://fcm.googleapis.com/fcm/send/test-endpoint" && row.p256dh && row.auth && row.secret && row.secret.length >= 16 && row.tz && typeof row.due === "number", "push_save carries the subscription, the reader's clock and 8 p.m.");
  await page.fill("#remindAt", "07:30");
  await page.dispatchEvent("#remindAt", "change");
  ok(await waitFor(() => /7:30|07:30/.test(document.querySelector("#remindNote").textContent), 10000), "a new time is shown");
  ok(supa.filter((x) => x.fn === "push_save").pop().body.p.remind_at === 450, "a new time is saved (07:30 = 450)");
  await page.click("#sw-remind");
  ok(await waitFor(() => window.__unsubscribed === true, 10000), "switched off: unsubscribed");
  const del = supa.filter((x) => x.fn === "push_delete").pop();
  ok(del && del.body.ep === "https://fcm.googleapis.com/fcm/send/test-endpoint" && del.body.sec === row.secret, "push_delete removes this device's row with its secret");

  console.log("9) a push shows a reminder");
  const cdp = await context.newCDPSession(page);
  let regId = null;
  cdp.on("ServiceWorker.workerRegistrationUpdated", (e) => { for (const r of e.registrations) if (!r.isDeleted && r.scopeURL === BASE) regId = r.registrationId; });
  await cdp.send("ServiceWorker.enable");
  for (let i = 0; i < 20 && !regId; i++) await page.waitForTimeout(200);
  ok(!!regId, "the registration is found");
  if (regId) {
    await cdp.send("ServiceWorker.deliverPushMessage", { origin: BASE.slice(0, -1), registrationId: regId, data: JSON.stringify({ title: "Folio", body: "12 cards are due for review.", url: "./#decks", due: 12, tag: "folio-remind" }) });
    ok(await waitFor(async () => { const r = await navigator.serviceWorker.ready; const n = await r.getNotifications(); return n.some((x) => x.body === "12 cards are due for review." && x.title === "Folio"); }, 10000), "the notification shows the payload's words");
    await cdp.send("ServiceWorker.deliverPushMessage", { origin: BASE.slice(0, -1), registrationId: regId, data: "" });
    ok(await waitFor(async () => { const r = await navigator.serviceWorker.ready; const n = await r.getNotifications(); return n.some((x) => x.body === "Ready for today's study?"); }, 10000), "a push with no payload still shows a reminder");
  }

  console.log("10) install");
  await page.evaluate(() => { const e = new Event("beforeinstallprompt"); e.prompt = () => { window.__prompted = true; }; e.userChoice = Promise.resolve({ outcome: "accepted" }); window.dispatchEvent(e); });
  ok(await waitFor(() => document.querySelector("#appInstallRow [data-install]"), 5000), "Settings offers an Install button");
  await page.click("#appInstallRow [data-install]");
  ok(await page.evaluate(() => window.__prompted === true), "the button shows Chrome's own prompt");
  if (process.env.FOLIO_SHOTS) {
    const shotDir = path.join(ROOT, ".claude", "shots");
    fs.mkdirSync(shotDir, { recursive: true });
    await page.locator(".set-app").screenshot({ path: path.join(shotDir, "pwa-settings.png") });
    console.log("  saved .claude/shots/pwa-settings.png");
  }

  ok(errors.length === 0, "no page errors" + (errors.length ? ":\n      " + errors.slice(0, 5).join("\n      ") : ""));
  await browser.close();
  server.close();
  console.log("\n" + passes + " passed, " + fails + " failed");
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
