/* ============================================================
   Folio service worker

   Makes the site installable and usable offline. Registered by app.js — and NOT on dev origins
   (file:// or localhost), because a file-watching dev server's live-reload plus a caching worker
   is a reliable way to spend an afternoon debugging a file you already fixed. Test it on the
   deployed site.

   Two strategies, chosen to suit how Folio ships:

     · navigations (the HTML)  — network first, cache as fallback. A deploy is picked up on the
       next load, and the app still opens with no connection.

     · same-origin JS / CSS / JSON / images — stale-while-revalidate. The cached copy is served
       immediately (so a cold Atlas visit is instant on the second look) while a fresh copy is
       fetched in the background for next time. Content files therefore land ONE reload late.
       That's the deliberate trade: near-instant loads against same-visit freshness for files that
       change on deploy. Live admin edits are unaffected — they arrive through the Supabase
       content_overrides overlay at runtime, not through these files.

   To force every client onto fresh copies immediately, bump VERSION. The old cache is deleted on
   activate, so the next load of each asset goes to the network.

   The multi-megabyte lazy bundles (the Atlas's topology and water files, glossary-extra.js…) are deliberately NOT
   precached — that would undo the lazy split. They enter the cache when a page actually requests
   them, so visiting the Atlas once makes it available offline afterwards — or when a reader switches
   on "Available offline" for a collection, which saves its files into OFFLINE (below), on request.
   ============================================================ */

const VERSION = "v7";              // bump to invalidate every cached file on the next load (v7: Atlas v2 Phase 5 — v1's world.js, timeline.js, polities.js, the heightmaps and the rest leave readers' caches)
const CACHE = "folio-" + VERSION;
/* Two caches that are NOT a generation, and so survive a VERSION bump (Nov 2026):
     · OFFLINE — the collections a reader chose to keep for offline study (app.js OFFLINE_CACHE: the
       collection's data-extra files, glossary-extra.js, the shell). Filled and emptied by the page, read
       by the fetch handler as a fallback, and refreshed here whenever the network answers for one of them.
     · REMIND — one JSON entry, the study-reminder snapshot the page writes (app.js remindWrite), read by
       the periodicsync handler below. */
const OFFLINE = "folio-offline";
const REMIND = "folio-reminder";
const KEEP = [CACHE, OFFLINE, REMIND];

// the app shell: everything index.html loads eagerly, ~1.4 MB
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./data.js",
  "./glossary.js",
  // the daily games' pools are lazy bundles since Nov 2026 (off the eager path), but small: precached so the games still open offline
  "./truefalse.js",
  "./quotes.js",
  "./crossword.js",
  "./whatyear.js",
  "./changelog.js",
  "./mission.js",
  "./manifest.json",
  "./icon.svg",
  "./wikipedia-logo.png",
];

self.addEventListener("install", (e) => {
  // addAll fails the whole install if any single file 404s — add them individually so one
  // renamed file can't leave the site with no worker at all
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// app.js can ask the waiting worker to take over immediately
// …and, while it is open in the background, ask for the reminder check (the path with no periodic sync)
self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
  else if (e.data && e.data.type === "folio-reminder-check") e.waitUntil(remindCheck().catch(() => false));
});

/* STUDY REMINDERS (Nov 2026). There is no push server: the page leaves a snapshot of its schedule in the
   REMIND cache and this decides, on Chromium's Periodic Background Sync (an installed app only, as often
   as the browser allows), whether to say "N cards are due in Folio" — at most once a local day, only
   after the reader's chosen time, only if something is due by the snapshot's own due times. Nothing is
   fetched or sent. */
const remindKey = () => new URL("__folio/reminder.json", self.registration.scope).href;
const localDay = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
async function remindCheck() {
  const cache = await caches.open(REMIND);
  const hit = await cache.match(remindKey());
  if (!hit) return false;
  const s = await hit.json().catch(() => null);
  if (!s || !s.on) return false;
  const now = new Date(), today = localDay(now);
  if (s.lastNotifiedDay === today) return false;
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.reminderTime || "");
  if (!m || now.getHours() * 60 + now.getMinutes() < (+m[1]) * 60 + (+m[2])) return false;
  const due = (s.dueCount | 0) + (Array.isArray(s.dueTimes) ? s.dueTimes.filter((t) => t <= now.getTime()).length : 0);
  if (due < 1) return false;
  if (self.Notification && self.Notification.permission !== "granted") return false;
  await self.registration.showNotification("Folio", {
    body: due === 1 ? "1 card is due in Folio" : due + " cards are due in Folio",
    icon: "icon.svg",
    tag: "folio-reminder",
    data: { url: new URL("./#home", self.registration.scope).href },
  });
  s.lastNotifiedDay = today;
  await cache.put(remindKey(), new Response(JSON.stringify(s), { headers: { "Content-Type": "application/json" } }));
  return true;
}
self.addEventListener("periodicsync", (e) => {
  if (e.tag === "folio-reminder") e.waitUntil(remindCheck().catch(() => false));
});
// a click focuses an open Folio and sends it home (by message, so a study session is not reloaded away),
// or opens one at #home
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || new URL("./#home", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    const open = list.find((c) => new URL(c.url).origin === self.location.origin);
    if (open) { open.postMessage({ type: "folio-route", to: "home" }); return open.focus(); }
    return self.clients.openWindow(url);
  }));
});

const CACHEABLE = /\.(js|css|json|svg|png|jpg|jpeg|webp|woff2?|bin)$/i;   // bin: the Atlas v2 topology (atlas/data/*.bin), Oct 2026

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // let the network own everything else: Google Fonts, the Supabase API, the audio CDN
  if (url.origin !== self.location.origin) return;

  // navigations — network first, so a deploy is picked up straight away
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  if (!CACHEABLE.test(url.pathname)) return;

  // assets — stale-while-revalidate. A file a saved collection keeps (OFFLINE) answers when this
  // generation's cache has none, and is refreshed there too whenever the network answers.
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(req).then((own) => own || caches.match(req, { cacheName: OFFLINE })).then((hit) => {
        const net = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              c.put(req, res.clone());
              const kept = res.clone();
              // caches.match with a cacheName never creates the cache, so a reader who saved nothing gets none
              caches.match(req, { cacheName: OFFLINE }).then((was) => (was ? caches.open(OFFLINE).then((o) => o.put(req, kept)) : null)).catch(() => {});
            }
            return res;
          })
          .catch(() => hit);            // offline: the cached copy is the answer
        return hit || net;              // cached copy now, fresh copy for next time
      })
    )
  );
});
