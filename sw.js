/* ============================================================
   Folio service worker

   Makes the site installable, usable offline, and current. Registered by app.js — and NOT on dev
   origins (file:// or localhost), because a file-watching dev server's live-reload plus a caching
   worker is a reliable way to spend an afternoon debugging a file you already fixed. Test it on the
   deployed site, or with `.claude/test-pwa.js`, which serves the repo on a made-up host.

   THE INSTALLED APP IS THE WEBSITE, AT THE SAME MOMENT (Oct 2026, on request: "updates at the exact
   same time as the website itself"). docs/downloadable-app-plan.md §4 has the reasoning; in short:

     · THE SHELL — `SHELL` below, every file index.html loads before the first card can flip — is
       kept as ONE SET in a cache named `folio-shell-<time>`. On every open of the app (a navigation
       to the root) the worker asks the network whether any of those files changed, all at once, as
       conditional requests on the ETags it holds (`If-None-Match`; an unchanged file costs a 304 and
       no body). Nothing changed, or no answer within NAV_WAIT_MS (offline, a slow train): the open is
       served from the set on the phone, instantly. Something changed: the changed files are fetched,
       a NEW set is written whole, and only then is the open served — from the new set. So a reader
       never runs a new app.js against an old data.js, and never runs yesterday's Folio when today's
       is a few hundred milliseconds away. If the new set is not complete within NAV_WAIT_MS the open
       is served from the old set and the page is told when the new one is ready
       (`{type:"updated"}` → app.js offers "Reload").
     · The page also asks for the same check when the app comes back to the foreground
       (`{type:"check"}`), since an installed app is rarely closed.
     · EVERYTHING ELSE that is same-origin and cacheable (the lazy bundles, the Atlas, the books, the
       fonts, images) lives in `folio-assets`, tagged with the shell generation it was last confirmed
       under (`X-Folio-Gen`). Under the same generation it is served from the phone; the first time
       it is asked for after a new generation it is revalidated with its ETag (a 304 is a few hundred
       bytes), so content files land with the release that changed them rather than one reload late.
       Offline, the copy on the phone is the answer.

   Other messages from app.js:
     {type:"adopt", urls}         cache the files this page already loaded before the worker controlled
                                  it (the first visit's fonts and warmed bundles), so offline works from
                                  the second open with no gaps
     {type:"keep", urls}          Settings → "Keep on this device": fetch these now (progress on the
                                  message port), and keep them fresh by the same ETag rule
     {type:"unkeep", urls}        drop them again
     {type:"kept", urls}          how many of these are on the phone, and their size
     {type:"skipWaiting"}         take over now (a new sw.js)

   STUDY REMINDERS arrive as Web Push (`push`), sent by functions/api/remind.js — see docs/reminders.md.

   The legacy caches of the old worker (`folio-v1` … `folio-v7`) are folded into `folio-assets` on
   activate, so a reader who visited the Atlas keeps it, and then deleted.
   ============================================================ */

const SHELL_PREFIX = "folio-shell-";
const ASSETS = "folio-assets";
const META = "folio-meta";
const META_KEY = "./__folio-meta.json";
const NAV_WAIT_MS = 4000;          // the longest an open waits for the network before the phone's copy answers
const ASSET_WAIT_MS = 2500;        // the same, for a lazy file being confirmed after a release
const ASSET_MAX_AGE_MS = 7 * 86400000;   // a lazy file not confirmed for a week is confirmed in the background

// The app shell: every file index.html loads before the first paint, plus the manifest and icons.
// `node .claude/check-sw-shell.js` (CI) fails when this list and index.html disagree.
const SHELL = [
  "./",
  "fonts.css",
  "styles.css",
  "data.js",
  "truefalse.js",
  "quotes.js",
  "whatyear.js",
  "crossword.js",
  "changelog.js",
  "mission.js",
  "glossary.js",
  "artefacts.js",
  "lang-decks.js",
  "app.js",
  "manifest.json",
  "icon.svg",
  "icon-maskable.svg",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "icon-180.png",
  "badge-96.png",
  "wikipedia-logo.png",
];
const SCOPE = new URL("./", self.location).href;
const SHELL_URLS = new Set(SHELL.map((u) => new URL(u, self.location).href));
const CACHEABLE = /\.(js|css|json|svg|png|jpg|jpeg|webp|gif|woff2?|bin|txt)$/i;

/* ---------------- the record of which shell set is current ---------------- */
let metaMemo = null;
async function getMeta() {
  if (metaMemo) return metaMemo;
  try {
    const c = await caches.open(META);
    const r = await c.match(META_KEY);
    metaMemo = r ? await r.json() : null;
  } catch (e) { metaMemo = null; }
  return metaMemo;
}
async function setMeta(m) {
  metaMemo = m;
  const c = await caches.open(META);
  await c.put(META_KEY, new Response(JSON.stringify(m), { headers: { "Content-Type": "application/json" } }));
}

/* A response fit to be stored and later served to a navigation: a redirected response cannot answer
   a navigation ("a redirected response was used for a request whose redirect mode is not follow"), so
   it is rebuilt from its body. `extra` adds headers (the generation tag, the size). */
async function storable(res, extra) {
  if (!res.redirected && !extra) return res;
  const headers = new Headers(res.headers);
  let body = await res.blob();
  if (extra) for (const k in extra) headers.set(k, String(k === "X-Folio-Bytes" ? body.size : extra[k]));
  return new Response(body, { status: res.status, statusText: res.statusText, headers });
}
function sameBytes(a, b) {
  if (a.byteLength !== b.byteLength) return false;
  const x = new Uint8Array(a), y = new Uint8Array(b);
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
  return true;
}
function timeout(ms) { return new Promise((r) => setTimeout(() => r(TIMEOUT), ms)); }
const TIMEOUT = { timeout: true };

/* Ask the network about one file we hold. Resolves { url, res, changed } where `res` is what the new set
   should hold. An ETag (or Last-Modified) makes it a conditional request, so an unchanged file is a 304
   with no body; a host that sends neither is compared byte for byte, so it never reads as a change it is
   not. Rejects when the network does not answer usefully. */
async function revalidate(url, hit) {
  const headers = {};
  const etag = hit && hit.headers.get("ETag");
  const lm = hit && hit.headers.get("Last-Modified");
  if (etag) headers["If-None-Match"] = etag;
  else if (lm) headers["If-Modified-Since"] = lm;
  const res = await fetch(url, { headers, cache: "no-store", credentials: "same-origin" });
  if (res.status === 304 && hit) return { url, res: hit, changed: false };
  if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
  if (hit && !etag && !lm) {
    const [a, b] = await Promise.all([hit.clone().arrayBuffer(), res.clone().arrayBuffer()]);
    if (sameBytes(a, b)) return { url, res: hit, changed: false };
  }
  return { url, res, changed: true };
}

/* ---------------- the shell: check, and commit a new set whole ---------------- */
let checking = null;   // one check at a time: a second open during a check waits on the same answer
function checkShell() {
  if (!checking) checking = doCheckShell().finally(() => { checking = null; });
  return checking;
}
// → { changed: bool, committed: Promise<boolean> }. `committed` resolves once the new set (if any) is current.
async function doCheckShell() {
  const meta = await getMeta();
  const cur = meta && (await caches.has(meta.shell)) ? await caches.open(meta.shell) : null;
  // each file on its own: one that will not load keeps the copy on the phone (or is left out of a first
  // set) rather than freezing every later update; ALL failing is "offline"
  const settled = await Promise.allSettled(SHELL.map(async (u) => {
    const url = new URL(u, self.location).href;
    const hit = cur ? await cur.match(url) : undefined;
    try { return await revalidate(url, hit); }
    catch (err) { if (hit) return { url, res: hit, changed: false, failed: true }; throw err; }
  }));
  const results = settled.filter((r) => r.status === "fulfilled").map((r) => r.value);
  if (!results.length || results.every((r) => r.failed)) throw new Error("offline");
  const changed = !cur || results.some((r) => r.changed);
  if (!changed) return { changed: false, committed: Promise.resolve(false) };
  return { changed: true, committed: commitShell(results, meta) };
}
async function commitShell(results, meta) {
  const name = SHELL_PREFIX + Date.now();
  const c = await caches.open(name);
  await Promise.all(results.map(async (r) => c.put(r.url, await storable(r.res))));
  const gen = Date.now();
  await setMeta({ shell: name, gen, prev: meta ? meta.shell : null });
  // keep the set the pages already open were served from until the next commit; delete anything older
  const keep = new Set([name, meta && meta.shell].filter(Boolean));
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => k.startsWith(SHELL_PREFIX) && !keep.has(k)).map((k) => caches.delete(k)));
  return true;
}
async function tellClients(msg, exceptId) {
  const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  all.forEach((cl) => { if (cl.id !== exceptId) cl.postMessage(msg); });
}

/* ---------------- install / activate ---------------- */
self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const meta = await getMeta();
    if (!(meta && (await caches.has(meta.shell)))) {
      // first install: fetch the whole set. One file that will not load does not leave the site with no
      // worker at all — it is simply fetched from the network until the next successful check.
      const results = (await Promise.all(SHELL.map((u) => {
        const url = new URL(u, self.location).href;
        return revalidate(url, undefined).catch(() => null);
      }))).filter(Boolean);
      await commitShell(results, null);
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    // fold the old worker's caches (`folio-v7` and before) into folio-assets, untagged, so each entry is
    // confirmed with its ETag the first time it is next asked for; then delete them
    const keys = await caches.keys();
    const legacy = keys.filter((k) => /^folio-v\d+$/.test(k));
    if (legacy.length) {
      const assets = await caches.open(ASSETS);
      for (const k of legacy) {
        const old = await caches.open(k);
        for (const req of await old.keys()) {
          const u = new URL(req.url);
          if (SHELL_URLS.has(u.href) || u.pathname.endsWith("/index.html")) continue;
          const r = await old.match(req);
          if (r && r.ok && !(await assets.match(req))) await assets.put(req, r).catch(() => {});
        }
        await caches.delete(k);
      }
    }
    await self.clients.claim();
  })());
});

/* ---------------- fetch ---------------- */
// which shell set each page was served from, so a page that opened on the old set while a new one was
// being written keeps reading the old one (clientId → cache name). Lost if the worker is stopped, which
// it is not in the seconds a page takes to load.
const clientShell = new Map();

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // let the network own everything else: the Supabase API, the audio CDN, /api (the reminder sender)
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (req.headers.has("range")) return;

  if (req.mode === "navigate") {
    // only the app itself is the app: a navigation anywhere else in scope (a data file opened by hand) is
    // the network's
    if (url.href.split(/[?#]/)[0] !== SCOPE && !url.pathname.endsWith("/index.html")) return;
    // the check starts here, synchronously, so the work it does outlives the response (waitUntil)
    const check = checkShell();
    const ctx = { fresh: false };
    const nav = navigate(e, check, ctx);
    e.respondWith(nav);
    // pages already open are told a new set is in; the page this open serves is told too unless it was
    // served from the new set itself
    e.waitUntil(nav.then(() => check).then((r) => r.committed).then((did) => {
      if (did) return tellClients({ type: "updated" }, ctx.fresh ? e.resultingClientId : null);
    }).catch(() => {}));
    return;
  }
  const href = url.href.split("#")[0];
  if (SHELL_URLS.has(href)) { e.respondWith(shellFile(e, href)); return; }
  if (!CACHEABLE.test(url.pathname)) return;
  e.respondWith(asset(e, req));
});

async function navigate(e, check, ctx) {
  const meta = await getMeta();
  const curName = meta && (await caches.has(meta.shell)) ? meta.shell : null;
  const fromSet = async (name) => {
    const hit = name && (await (await caches.open(name)).match(SCOPE));
    if (hit && e.resultingClientId) clientShell.set(e.resultingClientId, name);
    return hit;
  };
  const answer = await Promise.race([
    check.then((r) => r.committed.then(() => "fresh")).catch(() => "offline"),
    timeout(NAV_WAIT_MS),
  ]);
  if (answer === "fresh") {
    const m = await getMeta();
    const hit = await fromSet(m && m.shell);
    if (hit) { ctx.fresh = true; return hit; }
  }
  // unchanged, offline, or still downloading: the set on the phone answers now
  const hit = await fromSet(curName);
  if (hit) return hit;
  try { return await fetch(e.request); }
  catch (err) { return new Response("Folio is offline and this device has not stored it yet.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }); }
}

async function shellFile(e, href) {
  // a page reads the set it was opened on; otherwise the current one; otherwise the network
  let name = clientShell.get(e.clientId);
  if (!name || !(await caches.has(name))) { const m = await getMeta(); name = m && m.shell; }
  if (name) {
    const hit = await (await caches.open(name)).match(href);
    if (hit) return hit;
  }
  return fetch(e.request);
}

async function asset(e, req) {
  const assets = await caches.open(ASSETS);
  const hit = await assets.match(req);
  const meta = await getMeta();
  const gen = meta ? meta.gen : 0;
  if (hit) {
    const tag = Number(hit.headers.get("X-Folio-Gen") || 0);
    const at = Number(hit.headers.get("X-Folio-At") || 0);
    if (tag === gen && Date.now() - at < ASSET_MAX_AGE_MS) return hit;
    // `spare`: the page may be reading `hit` while the confirmation runs, and a body can be read once
    const fresh = confirm(assets, req.url, hit.clone(), gen);
    if (tag === gen) { e.waitUntil(fresh.catch(() => {})); return hit; }   // merely old: confirm in the background
    const got = await Promise.race([fresh.catch(() => null), timeout(ASSET_WAIT_MS)]);
    if (got && got !== TIMEOUT) return got;
    e.waitUntil(fresh.catch(() => {}));
    return hit;   // offline or slow: the copy on the phone
  }
  const res = await fetch(req);
  if (res && res.ok && res.type === "basic") {
    const copy = res.clone();
    e.waitUntil(storable(copy, tagFor(gen)).then((r) => assets.put(req, r)).catch(() => {}));
  }
  return res;
}
function tagFor(gen) { return { "X-Folio-Gen": gen, "X-Folio-At": Date.now(), "X-Folio-Bytes": 0 }; }   // Bytes: filled with the body's size
// confirm one stored lazy file against the network and store the answer, re-tagged; resolves the response to serve
async function confirm(assets, url, hit, gen) {
  const r = await revalidate(url, hit);
  const stored = await storable(r.res, tagFor(gen));
  await assets.put(url, stored.clone());
  return stored;
}

/* ---------------- messages from the page ---------------- */
self.addEventListener("message", (e) => {
  const d = e.data;
  const port = e.ports && e.ports[0];
  const reply = (m) => { try { (port || e.source).postMessage(m); } catch (err) {} };
  if (d === "skipWaiting" || (d && d.type === "skipWaiting")) { self.skipWaiting(); return; }
  if (!d || typeof d !== "object") return;
  if (d.type === "check") {
    e.waitUntil(checkShell().then((r) => r.committed).then((did) => {
      reply({ type: "checked", changed: !!did });
      if (did) return tellClients({ type: "updated" });
    }).catch(() => reply({ type: "checked", changed: false, offline: true })));
  } else if (d.type === "adopt" && Array.isArray(d.urls)) {
    e.waitUntil(keepUrls(d.urls, null, true));
  } else if (d.type === "keep" && Array.isArray(d.urls)) {
    e.waitUntil(keepUrls(d.urls, reply, false));
  } else if (d.type === "unkeep" && Array.isArray(d.urls)) {
    e.waitUntil((async () => {
      const assets = await caches.open(ASSETS);
      await Promise.all(sameOrigin(d.urls).map((u) => assets.delete(u)));
      reply({ type: "unkept" });
    })());
  } else if (d.type === "kept" && Array.isArray(d.urls)) {
    e.waitUntil(keptSize(d.urls).then((s) => reply(Object.assign({ type: "kept" }, s))));
  }
});
function sameOrigin(urls) {
  return urls.map((u) => { try { return new URL(u, self.location).href; } catch (e) { return null; } })
    .filter((u) => u && new URL(u).origin === self.location.origin && !SHELL_URLS.has(u));
}
async function keptSize(urls) {
  const assets = await caches.open(ASSETS);
  let have = 0, bytes = 0;
  const list = sameOrigin(urls);
  for (const u of list) {
    const r = await assets.match(u);
    if (r) { have++; bytes += Number(r.headers.get("X-Folio-Bytes") || 0); }
  }
  return { have, total: list.length, bytes };
}
/* Fetch a list of files into folio-assets, four at a time. `quiet` (adopt) skips what is already held at
   all; otherwise a file held under an older generation is confirmed with its ETag. Progress goes back on
   the port after each file: { type:"keep-progress", done, total, bytes, failed }. */
async function keepUrls(urls, reply, quiet) {
  const assets = await caches.open(ASSETS);
  const meta = await getMeta();
  const gen = meta ? meta.gen : 0;
  const list = sameOrigin(urls).filter((u) => CACHEABLE.test(new URL(u).pathname));
  let done = 0, bytes = 0, failed = 0, i = 0;
  const one = async (u) => {
    try {
      const hit = await assets.match(u);
      let r = hit;
      if (hit && (quiet || Number(hit.headers.get("X-Folio-Gen") || 0) === gen)) r = hit;
      else if (hit) r = await confirm(assets, u, hit, gen);
      else {
        const res = await fetch(u, { credentials: "same-origin" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        r = await storable(res, tagFor(gen));
        await assets.put(u, r.clone());
      }
      bytes += Number(r.headers.get("X-Folio-Bytes") || 0);
    } catch (err) { failed++; }
    done++;
    if (reply) reply({ type: "keep-progress", done, total: list.length, bytes, failed });
  };
  const lanes = Array.from({ length: Math.min(4, list.length) }, async () => { while (i < list.length) await one(list[i++]); });
  await Promise.all(lanes);
  if (reply) reply({ type: "keep-done", done, total: list.length, bytes, failed });
}

/* ---------------- study reminders (Web Push) ---------------- */
// The payload is JSON from functions/api/remind.js: { title, body, url, due, tag }. A push with no
// payload still shows a reminder, so a sender fault never yields a silent push (which Chrome punishes
// by showing its own "This site has been updated in the background" notice).
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = {}; }
  const show = self.registration.showNotification(d.title || "Folio", {
    body: d.body || "Ready for today's study?",
    icon: "icon-192.png",
    badge: "badge-96.png",
    tag: d.tag || "folio-remind",
    data: { url: d.url || "./#decks" },
  });
  const badge = typeof d.due === "number" && self.navigator.setAppBadge
    ? (d.due > 0 ? self.navigator.setAppBadge(d.due) : self.navigator.clearAppBadge()).catch(() => {})
    : null;
  e.waitUntil(Promise.all([show, badge]));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || "./#decks", self.location).href;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const open = all.find((c) => c.url.split("#")[0] === target.split("#")[0]);
    if (open) {
      await open.focus();
      open.postMessage({ type: "route", hash: target.split("#")[1] || "" });
      return;
    }
    await self.clients.openWindow(target);
  })());
});
