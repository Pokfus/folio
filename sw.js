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

   The multi-megabyte lazy bundles (world.js, timeline.js, the heightmaps…) are deliberately NOT
   precached — that would undo the lazy split. They enter the cache when a page actually requests
   them, so visiting the Atlas once makes it available offline afterwards.
   ============================================================ */

const VERSION = "v4";              // bump to invalidate every cached file on the next load
const CACHE = "folio-" + VERSION;

// the app shell: everything index.html loads eagerly, ~1.4 MB
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./data.js",
  "./glossary.js",
  "./glossary-wikipedia.js",
  "./truefalse.js",
  "./quotes.js",
  "./changelog.js",
  "./mission.js",
  "./manifest.json",
  "./icon.svg",
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
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// app.js can ask the waiting worker to take over immediately
self.addEventListener("message", (e) => { if (e.data === "skipWaiting") self.skipWaiting(); });

const CACHEABLE = /\.(js|css|json|svg|png|jpg|jpeg|webp|woff2?)$/i;

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

  // assets — stale-while-revalidate
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(req).then((hit) => {
        const net = fetch(req)
          .then((res) => { if (res && res.ok) c.put(req, res.clone()); return res; })
          .catch(() => hit);            // offline: the cached copy is the answer
        return hit || net;              // cached copy now, fresh copy for next time
      })
    )
  );
});
