# Study reminders — Web Push, end to end (Oct 2026)

**Status: built; switched on for readers once the owner has done the one-time setup in §2.** Until then the
Settings switch says *"Reminders are not switched on for the site yet"* and nothing else changes.

Asked for on 2026-10-24 ("the app should be able to send reminders so people don't forget studying"), with
**8 p.m. as the default time** and reminders for **guests as well as signed-in readers**. The reasoning for
the design is `docs/downloadable-app-plan.md` §6; this file is how it works and how to run it.

## 1. How a reminder travels

1. **The reader switches it on** (Settings → App → Study reminders). The tap asks for notification
   permission (it must be the tap that asks: iOS refuses a prompt from anywhere else), subscribes the
   browser to Web Push with the public key from `GET /api/vapid`, and writes one row with `push_save`.
2. **The row** (`push_subscriptions`, `.claude/supabase-schema.sql` block 18) holds the subscription, the
   reader's clock — time zone, the time they chose (minutes past midnight, 1200 by default), where their
   day ends (Settings → Study, the same boundary as `dayKey`) — and three facts the reminder is worded
   from: the last day studied, that run's streak, the cards due by the reminder. A guest's row is guarded
   by a random secret only that browser holds (`folio_push_secret` in localStorage); a signed-in reader's
   row also carries `user_id`.
3. **The app keeps the row current** (`remindSync` in app.js): at boot, when the app goes to the
   background, and on the first study of the day (`bumpStreak`). An unchanged row is not re-sent.
4. **Every fifteen minutes** Supabase's `pg_cron` calls `POST https://folio.study/api/remind` with the
   shared secret (block 18b).
5. **The sender** (`functions/api/remind.js`, a Cloudflare Pages Function in this repo — it deploys with
   the site on merge) asks `push_candidates()` for the rows not yet reminded today, keeps those whose time
   has passed (`dueDay` in `server/reminders.js`), **claims** them (`push_claim`, which marks them reminded
   before anything is sent, so two overlapping runs send once), and sends each an encrypted push
   (`server/webpush.js`). A push service's 404 / 410 deletes the row (`push_gone`).
6. **The phone** wakes `sw.js` (`push`), which shows the notification and sets the icon's count; a tap
   opens or focuses Folio on its decks (`notificationclick`).

**The rules a reader can rely on** (all in `server/reminders.js`, all tested):

- never before the time they chose, and never more than three hours after it (a sender that was down
  until midnight does not ping at midnight);
- never on a day they have already studied — on any device, when signed in (`push_candidates` takes the
  later of the device's and the account's last study day);
- never twice in one day; a reader who switches reminders on after tonight's time starts tomorrow;
- the words are the sharpest true thing: *"Your 9-day streak ends tonight. 3 cards are due."*, *"12 cards
  are due for review."*, or *"Ready for today's study?"*.

## 2. One-time setup (the owner, about ten minutes)

Nothing here can be done from a cloud session: each step puts a secret into a dashboard.

1. **Make a key pair.** In a cloud session or on any machine with Node 20+: `node .claude/make-vapid-keys.js`.
   It prints `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`. Keep the private key out of the repo and out of chat.
2. **Make a shared secret**: any long random string (for example `openssl rand -hex 32`). Call it the
   REMIND_SECRET below.
3. **Cloudflare** → Workers & Pages → the Folio project → Settings → Variables and secrets → Production →
   add, each as a **Secret**:
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` from step 1
   - `VAPID_SUBJECT` — `mailto:` followed by a contact address the push services may write to
   - `SUPABASE_SERVICE_KEY` — Supabase → Project Settings → API Keys → a **secret** key (`sb_secret_…`;
     a legacy `service_role` key also works). It never leaves Cloudflare.
   - `REMIND_SECRET` from step 2

   Then redeploy (Deployments → the latest → Retry), since secrets apply to new deployments.
4. **Supabase** → SQL Editor: run block **18** of `.claude/supabase-schema.sql` (the table and its five
   functions). Then, once, with your own value from step 2:

       select vault.create_secret('<REMIND_SECRET>', 'folio_remind_secret');

   and then block **18b** (it enables `pg_cron` and `pg_net` and schedules the call every fifteen minutes).
5. **Check it**: open https://folio.study/api/vapid — it should answer `{"key":"B…"}`. In Supabase,
   `select * from cron.job_run_details order by start_time desc limit 5;` shows the calls, and
   `select status_code, content from net._http_response order by created desc limit 5;` the answers
   (`{"candidates":…,"due":…,"sent":…}`).

**Rotating the keys** later: make a new pair, replace both secrets, redeploy. Every reader's old
subscription stops working; each re-subscribes the next time they open Folio with reminders on
(`remindSubscription` sees the key changed).

## 3. Where it works

| | reminders | how |
|---|---|---|
| Android, Chrome / Edge / Samsung Internet / Firefox | yes | in the browser or installed |
| Windows, macOS, Linux, Chrome / Edge / Firefox | yes | while the browser is running |
| macOS Safari 16+ | yes | |
| **iPhone / iPad (iOS 16.4+)** | **only when Folio is on the Home Screen** | Safari's Share → Add to Home Screen, then open it from the icon; Settings says exactly this to a reader in a Safari tab |
| `file://`, localhost, a private address | no | no service worker on a dev origin; Settings says so |

Re-check this table against the browsers' current documentation before changing anything that relies on it.

## 4. What is tested, and how

- `node .claude/test-reminders.js` (no browser, no network; in CI's fast job): the encryption reproduces
  **RFC 8291's own worked example byte for byte**; the VAPID JWT verifies under its public key; the
  endpoint allowlist; `dueDay` across time zones, a half-hour offset, a DST change, a day that ends after
  midnight, studied / already sent / too late; every wording; and `functions/api/remind.js` end to end
  against a fake Supabase and a fake push service (401 without the secret, 503 without the keys, the
  claim, a 410 deleted). **Re-run after touching `server/webpush.js`, `server/reminders.js` or
  `functions/api/remind.js`.**
- `node .claude/test-pwa.js` (Playwright, full Chromium): the Settings switch at 8 p.m. by default, the
  row it writes, a new time, switching off, and a push delivered through DevTools showing its
  notification. **Re-run after touching `remindEnable` / `remindSync` / `remindDisable` / the push
  handlers in `sw.js`.**
- Block 18's SQL was run against Postgres (PGlite) with Supabase's `auth` schema stubbed when it was
  written: a guest row is written, another secret cannot overwrite it, a foreign endpoint is refused, a bad
  zone or time is defaulted, the account's later study day wins, a claim is granted once, a row reminded
  today is not a candidate. That check is not in CI (it needs a Postgres); repeat it by hand after changing
  block 18.

## 5. Limits, plainly

- A reader who blocks notifications in the operating system sees the switch succeed and nothing arrive;
  Settings shows the browser's own permission where it can read it.
- The due count is the phone's count at its last sync, so a reader who has not opened Folio for a week is
  told the count from a week ago. It is never higher than the truth.
- Each device a reader switched on is reminded; studying on any one of them (signed in) silences all.
- A guest who clears site data loses the row with the rest of their progress; the push service then
  answers 410 and the sender deletes it.
