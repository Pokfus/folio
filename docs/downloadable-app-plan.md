# Folio as a downloadable app — the investigation (Oct 2026)

**Status: built 2026-10-24, except the app stores.** The owner asked (2026-10-24) to look into turning the
site into a downloadable app that (1) updates at the exact moment the website does, so content is never
maintained twice, (2) keeps some of the page files on the phone so it opens faster, and (3) sends
reminders so people do not forget to study. This file was the answer; the owner then chose: **no Google
Play and no App Store for now — downloadable from the website only**, reminders at **8 p.m. by default**,
and the recommendations below on everything else (guests get reminders too; the sender is a Pages
Function woken by `pg_cron`). The rules are in `CLAUDE.md`; the reminders have their own file,
`docs/reminders.md`.

## 0. As built — where the build differs from the plan below

- **No version probe (§4).** The plan had app.js read `FOLIO_VERSION` and ask the worker to refresh.
  The build is simpler and does not lean on the changelog rule: on **every open** the worker asks the
  site for each shell file's ETag at once (an unchanged file is a 304 with no body), and when any
  changed it writes the new set whole before serving the open. Past `NAV_WAIT_MS` (4 s) the old set opens
  whole and the page shows "A new version of Folio is ready — Reload" when the new set is in. The page
  also asks for the check when the app returns to the foreground (at most every five minutes). sw.js's
  hand-bumped `VERSION` is gone.
- **Lazy files land with their release, too.** Each is stored with the release it was confirmed under
  (`X-Folio-Gen`) and confirmed with its ETag on its first use after a new one — so the old "content
  files land one reload late" trade is gone everywhere, not only for the shell.
- **The first visit's files are adopted.** Besides fixing `SHELL` (§5), the page hands the worker the list
  of files it fetched before the worker controlled it (`adopt`), so the fonts and the warmed bundles are
  on the phone from the second open.
- **Keep on this device** (§5) has three switches: *Card details and the glossary* (every
  `data-extra/` file, `glossary-extra.js`, `artefacts-extra.js`), *The Atlas* (its scripts, the world-level
  topology, water, history, relief; finer tiles as visited) and *Books you have opened*. Sizes are
  measured after download, never quoted in advance.
- **PNG icons** were added (`.claude/build-icons.js`): iOS ignores an SVG `apple-touch-icon`, and Android's
  notification badge must be a bitmap.
- **The iPhone install hint** is on Home (after ten cards studied, dismissable for good) and in Settings →
  App; Chrome's own Install prompt is offered in both places when the browser makes one available.
- **Tests**: `check-sw-shell.js` and `test-reminders.js` in CI's fast job; `test-pwa.js` (full Chromium,
  on `folio.localhost`) in the card-window job, the four shards being at their cap.

## 1. The short answer

- **Folio is already an installable app.** It has been a Progressive Web App (PWA) since the service
  worker (`sw.js`) and `manifest.json` landed: on Android Chrome, desktop Chrome and Edge it can be
  installed from the browser menu, and on an iPhone from Safari's Share sheet ("Add to Home Screen").
  Installed, it opens full-screen with its own icon, works offline, and **is the website** — a merge to
  `main` reaches the installed app the same way it reaches a browser tab. Wish (1) is therefore the
  cheapest of the three; it is mostly a matter of telling readers the app exists and tightening how
  fast an installed copy picks a deploy up (§4).
- **Wish (2) is half done.** The worker already keeps the app shell on the device and serves every
  cached file instantly. The precache list has drifted (four eager scripts and the fonts are missing,
  §5), and nothing lets a reader choose to keep the heavy bundles (the glossary's definitions, the
  Atlas) on the phone. Both are small changes to `sw.js` and a Settings switch.
- **Wish (3) needs a server clock.** A web app cannot wake itself at 7 pm to post a notification; the
  only dependable route is Web Push: the phone's push service wakes the worker, which shows the
  reminder. Someone has to *send* that push once a day, which means a scheduled job outside the
  browser. Folio has no server code today. The cheapest honest arrangement (§6) is a Cloudflare Pages
  Function kept in this repo (it deploys with the site on merge) woken hourly by Supabase's `pg_cron`,
  reading a new `push_subscriptions` table. Reminders work on Android, on desktop, and on an iPhone
  **only when Folio has been added to the Home Screen** (iOS 16.4 and later) — Safari's tab cannot
  receive push. That last point is the one real limit and should be stated to readers in the switch
  that turns reminders on.
- **A store listing is optional, and the two stores are not equal.** Google Play accepts the PWA as it
  is through a Trusted Web Activity (TWA): a thin signed wrapper that opens the live site in Chrome
  with no browser chrome, updating with every deploy, push included. Apple's App Store has no such
  path; an iOS listing means a native shell around a web view, Apple's review of "just a website"
  apps, and no Web Push inside the shell (the shell would schedule its own local notifications).
  Recommendation: **ship the PWA properly first, then Play via TWA if the owner wants a store badge,
  and leave the App Store alone** — an iPhone reader gets everything, reminders included, from "Add to
  Home Screen".

## 2. What Folio already is

Read off the repo on 2026-10-24:

- `manifest.json`: `display: standalone`, `start_url ./`, scope `./`, an SVG icon and a maskable one,
  two shortcuts (Study → `#decks`, Atlas → `#map`), categories education/books. `index.html` links it,
  sets `apple-mobile-web-app-capable` and the Apple title, and two `theme-color` metas (light/dark).
- `sw.js` (`VERSION = "v7"`), registered by app.js on `load` and **never on a dev origin** (`isDevOrigin`:
  `file:`, localhost, private ranges — `docs/reference.md` "PWA"). Two strategies: navigations are
  network-first with the cached `index.html` as the offline fallback; same-origin JS / CSS / JSON /
  images / `.bin` are stale-while-revalidate (cached copy now, fresh copy for next time). The
  multi-megabyte lazy bundles are not precached by design (`docs/eager-path.md`); they enter the cache
  the first time a page asks for them, so one Atlas visit makes the Atlas available offline.
- `_headers`: the CSP allows `worker-src 'self'`, `manifest-src 'self'`, `connect-src` the one Supabase
  host. Nothing here needs to change for install or caching; a push *sender* on the same origin
  (`/api/...`) is covered by `'self'`.
- Fonts are self-hosted (`fonts.css` + `fonts/`, 582 `@font-face` subsets, 7.7 MB in all — a browser
  fetches only the subsets a page uses), so the offline shell does not depend on Google.
- The eager path is 11 files, 10.9 MB raw / 2.7 MB gzipped (`node .claude/check-sizes.js`), of which
  `data.js` is 5.95 MB and `app.js` 3.25 MB. That is the size of "the app" a phone keeps.
- State is `localStorage["folio_v1"]`; a signed-in reader's progress is PATCHed whole to the `progress`
  table (`progressBlob()`, `PROGRESS_FIELDS`, `docs/accounts-sync.md`). `reviewDay`, `streak` and
  `studyTime` are in it, so a server can already tell whether an account studied today. Nothing on the
  server knows a *guest*.
- No notification code of any kind exists in `app.js` (grepped for `Notification`, `pushManager`,
  `showNotification`, `periodicSync`, `beforeinstallprompt`: none). There is no install prompt either —
  readers find "Install" only in the browser menu.
- Supabase has fourteen tables (`.claude/supabase-schema.sql`), every one with RLS; there are no Edge
  Functions and no cron jobs. The site has no server code: `functions/` does not exist and CI
  (`.github/workflows/checks.yml`) runs checks only; Cloudflare Pages deploys the static tree.

## 3. Three ways to be "downloadable", and which to pick

| | PWA from the browser (today) | Google Play via TWA | Apple App Store via a shell |
|---|---|---|---|
| What the reader installs | the site itself | a 1 MB signed Android app that opens the site in Chrome, full-screen | a native app whose window is a web view of the site |
| Content updates with the site | yes, instantly (§4) | yes, instantly — the wrapper is never rebuilt for content | the web view loads the live site, so yes; the shell itself updates through App Store review |
| Offline, cached files | the worker (§5) | the same worker | the web view's own cache — the worker runs in WKWebView but it cannot be installed from a store build without care |
| Reminders | Web Push (§6); iPhone only when installed from Safari | Web Push, through Chrome — works fully | **no Web Push in a web view**; the shell must schedule local notifications itself, which means native code and a bridge from app.js |
| Cost to build | small: an in-app install button, an iOS how-to, the §4/§5 fixes | an afternoon with Bubblewrap or PWABuilder, a $25 one-off developer account, a signing key to keep for ever, `/.well-known/assetlinks.json` in the repo | days; $99 a year; Apple guideline 4.2 ("minimum functionality") rejects thin web wrappers often enough that the outcome is uncertain |
| Keeps the golden rules (vanilla JS, no build step, no npm in the site) | yes | yes — the wrapper lives outside the site; the repo only gains one static JSON file | no — a Capacitor or Swift project with its own toolchain |

**Recommendation.** Do the PWA work (§4–§6). Offer Play through a TWA afterwards if a store badge
matters for discovery; it costs almost nothing and changes no behaviour. Do not pursue the App Store
now: an iPhone reader who taps "Add to Home Screen" gets the icon, offline use, and (since iOS 16.4)
push reminders, which is everything the store would have given them, without the review risk and
without a second code base to maintain.

Two facts about the TWA worth knowing before the owner decides: Chrome verifies the wrapper against
`https://folio.study/.well-known/assetlinks.json` (the signing certificate's SHA-256 fingerprint, a
static file this repo would ship — Pages serves `.well-known/` as-is); and since Chrome 86 a TWA whose
site fails the PWA installability criteria (served over HTTPS, a manifest, a worker that answers
offline) crashes rather than falling back to a browser tab, so the §5 precache fix is a prerequisite,
not a nicety.

## 4. "Updates at the exact same time as the website"

What happens today when `main` is merged while Folio is installed on a phone:

1. The next open goes network-first for `index.html`, so the new shell is read at once.
2. Every script it names is served **from the cache** (stale-while-revalidate) while the fresh copy is
   fetched in the background. So the reader runs the *previous* `app.js` and `data.js` on this open and
   the new ones on the next. `docs/reference.md` calls this "content files land one reload late" and
   it was the deliberate trade for instant loads.
3. Live admin edits are not affected: they arrive through the `content_overrides` row at runtime
   (`docs/admin-editor.md`), so a fix the owner publishes from the phone is instant already.

Two faults hide in step 2. A deploy that changes `app.js` and `data.js` together can be picked up
*half*: a tab opened while the background refetches are in flight gets the new `app.js` with the old
`data.js` (each file is revalidated on its own). And a reader who opens Folio once a day is always a
day behind without knowing it.

**The fix is a version probe, not a new strategy.** Every reader-facing release already bumps
`window.FOLIO_VERSION` at the top of `changelog.js` in the same commit (the golden rule), and Cloudflare
sends an `ETag` for every file. So:

- On each launch (and on `visibilitychange` to visible, since an installed app is rarely closed),
  app.js fetches `changelog.js` with `cache: "no-store"` and `Range: bytes=0-511` — the first line, a
  few hundred bytes — and compares the version it finds against the one it booted with.
- If it differs, it tells the worker (`postMessage({type:"refresh", version})`): the worker refetches
  the shell list into a **new cache named after the version** and, once every file is in, posts back
  "ready"; app.js then shows the existing moved-strip style of toast, *"Folio N.M is ready — tap to
  reload"*. Nothing swaps under a study session; the reader chooses the moment, as the current
  `reg.waiting` handling already intends.
- A deploy therefore becomes an **atomic switch**: either the whole old set or the whole new set,
  never a mix, and never more than a minute behind the website once the app is open. Readers who never
  tap still get the new set on their next cold start, because the cache they boot from is the new one.

This changes `sw.js` (a version-named cache instead of a hand-bumped `VERSION`; the refresh message)
and adds one probe plus one toast to app.js. `sw.js`'s `VERSION` would then be derived from
`FOLIO_VERSION` rather than bumped by hand — a rule change for `docs/changelog-and-version.md`, read it
before building. Test on the deployed site: the worker never runs on a dev origin, so a Playwright
suite can only cover the probe and the toast, not the cache swap.

## 5. "Download some of the page files to the phone"

**What is kept today.** On install the worker precaches its `SHELL` list (`./`, `index.html`,
`styles.css`, `app.js`, `data.js`, `glossary.js`, `truefalse.js`, `quotes.js`, `changelog.js`,
`mission.js`, `manifest.json`, `icon.svg`, `wikipedia-logo.png`). After that, anything a page requests
is cached on use.

**Finding: the list has drifted.** `index.html` now loads eleven scripts and two stylesheets; `SHELL`
is missing `whatyear.js`, `crossword.js`, `artefacts.js`, `lang-decks.js`, `fonts.css` and the font
files, and `icon-maskable.svg`. The worker is registered after `load`, so the first visit's own
requests are not cached by it; a reader who installs Folio and goes offline **before a second online
open** gets an `index.html` that cannot find four of its scripts and renders with the system font. From
the second open on, the stale-while-revalidate path has filled the gaps and offline works. The fix is
to make `SHELL` the real eager list (`node .claude/check-sizes.js` prints it) plus the font subsets the
default theme uses in the Latin range, and to add a check in CI that the two lists agree — the same
shape as `check-credits.js`.

**What a reader should be able to choose.** The eager shell is 2.7 MB over the wire and is what makes
the home page open instantly; it should always be kept. Beyond it, three things are worth a switch:

| bundle | gzipped | why keep it on the phone |
|---|---|---|
| `glossary-extra.js` (the definitions) | 3.0 MB | every glossary popup and card term; today it loads on first use and is then cached |
| the Atlas (`atlas/` scripts, `topology.bin` + tiles, `water.bin`, relief, `history-wars.bin`) | tens of MB in all; the land files alone a few MB at the first level | the globe is the slowest cold start on the site; `docs/atlas.md` §4 has the measured steps |
| the books a reader has opened (`books/<id>.js`) | 0.1–2 MB each | reading on a train |

Proposal: a **"Keep Folio on this device"** section in Settings with three switches — *Glossary*,
*Atlas*, *Books I have opened* — that ask the worker to fetch those files into the cache now (a
progress line, cancellable) and to keep them fresh with the same version probe as §4. The switch is
off by default and greyed with a sentence under `saveData` (the existing setting) and on a cellular
connection (`navigator.connection.saveData` / `effectiveType`), exactly as the Atlas's idle warm-up
already skips those cases. `navigator.storage.estimate()` gives the figure to print beside each switch;
`navigator.storage.persist()` asks the browser not to evict the cache under pressure, which an
installed PWA is granted on Android and iOS without a prompt. Nothing here touches `DATA_BUNDLES` /
`ensureData` — the lazy split stays; the cache just happens to be warm.

What not to do: precache the Atlas for everyone (it would undo the lazy split that `docs/eager-path.md`
exists to protect, and burn a reader's data plan without asking), or keep `glossary-extra.js` eager.

## 6. Reminders

### What the platforms allow (verify against the current browser notes before building)

- **Web Push** (`PushManager.subscribe` with a VAPID public key; the worker's `push` event calls
  `registration.showNotification`): Chrome and Edge on Android, Windows, macOS and Linux; Firefox;
  Safari on macOS 16+; **Safari on iOS and iPadOS only for a web app added to the Home Screen** (iOS
  16.4, March 2023 — a Safari tab cannot subscribe). On iOS the permission prompt must come from a tap
  (a user gesture), never from boot. A tap on the notification opens the app at a URL of our choosing
  (`notificationclick` → `clients.openWindow("./#decks")`).
- **Badging** (`navigator.setAppBadge(n)`) puts the due count on the icon — Chrome on Android/desktop,
  iOS 16.4+ Home Screen apps. Cheap and worth doing beside the reminder.
- **Not a route**: the Notification Triggers API (a notification scheduled for a future time with no
  server) was dropped from Chrome and never shipped elsewhere; Periodic Background Sync is Chrome-only,
  runs at the browser's discretion (at most a few times a day on an engaged site, never on iOS) and
  cannot promise a 7 pm reminder; and a plain `setTimeout` dies with the tab. **A reminder that arrives
  when Folio is closed needs a push sent from a server.**

### The design

**Who sends it.** Three places could hold the daily job; the one that fits Folio's shape best:

| | Cloudflare Pages Function in this repo | Supabase Edge Function | a separate Cloudflare Worker |
|---|---|---|---|
| deploys with a merge to `main` | **yes** — `functions/api/remind.js` ships with the site, no new tool | no: `supabase functions deploy` from a machine with the CLI | no: `wrangler deploy` |
| has a clock of its own | no — Pages Functions have no cron; `pg_cron` in Supabase calls it | yes, with `pg_cron` + `pg_net` | yes (Cron Triggers) |
| secrets (VAPID private key, service-role key) | Pages project settings | Supabase secrets | Worker secrets |
| new vendor account | none | none | none, but a second Cloudflare product |

Pick the **Pages Function + `pg_cron`** pair: the code lives beside the site and follows the merge-to-
deploy habit the owner already has from the phone, and the clock is one `cron.schedule` line in
`.claude/supabase-schema.sql`, which is already how every table reached the live project. (One nuance
for the builder: Cloudflare bundles `functions/` server-side; nothing of it is served to readers, so the
"no build step" rule, which governs the site, is intact — but write this down in `CLAUDE.md` when it
lands, since it is the first server code in the repo.) Web Push on the Cloudflare runtime means signing
the VAPID JWT and encrypting the payload (`aes128gcm`) with WebCrypto — a few hundred lines, or one of
the small Workers-compatible push libraries, vendored into `functions/` with its licence like anything
under `vendor/`.

**The table.** A new `push_subscriptions` table — its own table, never a `PROGRESS_FIELDS` entry
(`docs/accounts-sync.md`: the blob is PATCHed whole and a subscription is per device, not per account):

    id            uuid primary key
    user_id       uuid null references auth.users  -- null for a guest
    secret        text not null                     -- a guest's only key to its own row
    endpoint      text unique not null
    p256dh, auth  text not null                     -- the subscription's keys
    tz            text not null                     -- IANA zone from Intl.DateTimeFormat().resolvedOptions()
    remind_at     smallint not null                 -- minutes past local midnight, the reader's pick
    day_end       smallint not null default 0       -- S.settings.dayEnd, so "today" agrees with the app
    last_study    date null                         -- the client writes its reviewDay on every visit
    due_count     int not null default 0            -- the client's dueCountNow() at its last visit
    last_sent     date null
    created_at, updated_at timestamptz

A signed-in reader's rows are RLS-scoped by `user_id`; a guest's row is written and updated through a
small RPC that takes the `secret` (no sign-in required, no reading anybody else's row). The client
refreshes `last_study`, `due_count`, `tz`, `remind_at` on `pagehide` and after every grade — one cheap
upsert, nothing that grows per review.

**The rule for sending.** Every hour the job selects rows where, in the row's own `tz`, the local time
has passed `remind_at` today, `last_study` is before today (the day cut at `day_end`, the same arithmetic
as `dayKey`), `last_sent` is before today, and `due_count > 0` or the reader has a live streak to lose.
It sends one push per row — *"12 cards are waiting"*, or *"Your 9-day streak ends at midnight"* when
that is the sharper truth — with the URL `./#decks`. A `404`/`410` from the push service deletes the
row (the reader revoked it or reinstalled). Never more than one reminder a day, never when the reader
studied, never before the hour they chose.

**The client.** A *Reminders* block in Settings: an "every day at ⟨time⟩" picker and one switch. The
switch calls `Notification.requestPermission()` inside the tap handler, subscribes with the VAPID
public key (a constant in app.js — it is public), and upserts the row. On an iPhone in Safari (not
installed: `!window.matchMedia("(display-mode: standalone)").matches` and `navigator.standalone` false)
the switch is replaced by the sentence *"On an iPhone, add Folio to your Home Screen first (Share →
Add to Home Screen); reminders work from the app icon."* — the same honesty the accounts code shows a
database missing a block. The worker gains `push` and `notificationclick` handlers, ten lines. Signing
out keeps the device's row (it is a device setting, like the theme); "Turn reminders off" deletes it.

**Also worth it, free:** the icon badge (`setAppBadge(dueCountNow())` after every grade and at boot,
cleared when zero) and an in-app "Install Folio" button on the home page that appears when
`beforeinstallprompt` fires (Android and desktop Chrome/Edge), with the Share-sheet sentence on iOS.

**What this does not give.** A guest who clears site data loses the row (their progress too — same as
today). Firefox on Android supports push but not install prompts. A reader with notifications blocked
at the OS level sees the switch succeed and nothing arrive; the Settings block should show
`Notification.permission` plainly. And the first reminder a reader ever gets is the one they asked for
in Settings — Folio must never request the permission at boot, which browsers punish by hiding the
prompt and readers punish by uninstalling.

## 7. Build order and cost

| step | changes | tests | size |
|---|---|---|---|
| 1. Precache the real shell, add a CI check that `SHELL` equals the eager list; `icon-maskable.svg` | `sw.js`, `.claude/check-sw-shell.js`, `checks.yml` | the new check | an hour |
| 2. The version probe, atomic cache swap and "ready — tap to reload" toast | `sw.js`, app.js, `docs/changelog-and-version.md` rule | `test-version-toast.js` (the probe and toast only) | half a day; test on folio.study |
| 3. Install button + iOS how-to on Home; badge | app.js, `styles.css` | `test-layout.js` screenshot | half a day |
| 4. "Keep Folio on this device" switches | `sw.js` message protocol, Settings, `docs/reader-settings.md` | `test-settings.js` addition | a day |
| 5. Reminders: table + RPC + cron in `supabase-schema.sql`, `functions/api/remind.js`, VAPID keys as Pages secrets, Settings block, worker handlers | all of the above; `CLAUDE.md` gains the server-code rule and a `docs/reminders.md` | a Node test of the sending rule's arithmetic (pure, like the scheduler); a Playwright test of the Settings block with permission mocked | two to three days |
| 6. (optional) Google Play via TWA | `.well-known/assetlinks.json` in the repo; the wrapper and its key outside it | none in CI | an afternoon + review time |

Steps 1–3 need no decision and no new account. Steps 4–6 are the owner's calls below.

## 8. Decisions for the owner

1. **Reminders for guests too, or sign-in only?** Guests are most of the readers a reminder would help;
   the guest row costs one RPC and one secret. Recommended: both.
2. **Where the push sender runs.** Recommended above: a Pages Function in this repo, woken by `pg_cron`.
   The alternative with the fewest moving parts if the owner is happy to run one CLI command per
   change is a Supabase Edge Function. Either way two secrets have to be created once (a VAPID key
   pair, `npx web-push generate-vapid-keys` on any machine) and pasted into the host's settings — a
   cloud session cannot do that.
3. **Google Play, yes or no, and whose developer account.** The signing key must be kept for ever and
   never in the repo.
4. **The App Store**: recommended no, for the reasons in §3. Reopen only if iPhone readers who refuse
   the Home Screen route turn out to be many.
5. **Default reminder hour.** The sender needs one; 19:00 local, adjustable, is the proposal.

## 9. Sources to re-check before building

The platform facts in §6 are from the browsers' own documentation as of this model's knowledge (iOS
16.4 Web Push for Home Screen web apps; Badging on the same; the Notification Triggers API withdrawn;
Chrome 86's TWA quality criteria; Cloudflare Pages Functions without cron). Each should be confirmed
against the current MDN compatibility table and Cloudflare's Pages Functions page on the day the step
is built, since all five have moved in the last three years and may move again.
