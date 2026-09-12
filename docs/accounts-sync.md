# Accounts, sync and the cloud content overlay

## The account, moved out of `CLAUDE.md` (2026-09-11)

**READ BEFORE TOUCHING SIGN-IN, THE PROGRESS BLOB, THE RECONCILE OR THE CONTENT OVERLAY.** These
bullets stood in `CLAUDE.md`'s Environment section until they were moved here verbatim: the schema
blocks and their policies, the reconcile's own bug report and why a slow link made it hit every time,
the ownership gate that stopped a second account inheriting the first's levels, the three silent
account-creation faults, the dev-origin guards and the empty overlay that was published over a live
edit, and the renumbering that silently repointed every delta. The RULES stay in `CLAUDE.md`.

- **Online accounts + sync (Supabase)** — LIVE in app.js (the `/* Supabase */` module after the legacy accounts block).
Static hosting on Cloudflare Pages fed by GitHub pushes (`git push` = deploy; content files like `data.js` ship with deploys).
Schema + RLS: `.claude/supabase-schema.sql` (applied; tables `profiles` / `progress` / `friends`, plus the later blocks'
`user_*` / `deck_*` / `feedback` / `content_overrides` / `review_log`, and — **still to be run once each** —
**section 11 `user_decks.color`**, **section 12 `login_email()`** and **section 13 `card_stats` +
`bump_card_grades()`**, the deck's default colour, username sign-in and the community difficulty rating;
signup trigger creates the
profile + empty progress row). **A LATER BLOCK IS NEVER A PREREQUISITE**: every feature that needs one
degrades to a sentence rather than an error (`colorColumnMissing`, the `login_email` 404 → "use your email
address"), so the site works on a database that has only the first block. **Keep it that way** — a block
the owner has not run yet is the normal case, not the broken one. **WHICH of the optional blocks a
given database already has is answered by `.claude/schema-check.sql`** — read-only, pasted into the
Supabase SQL editor, one true/false row per block. It is worth having because blocks 8–15 are each
written `if not exists` / `create or replace` / `drop … if exists`, so re-running one that is already
there is safe and the only real question is which are missing. Plain `fetch()` (no SDK — zero-dependency rule); the publishable key in app.js is safe to ship
(security = RLS). **Offline-first**: localStorage stays the working copy; `save()` → `supaQueuePush()` (6s debounce, skips
no-ops) PATCHes the whole `PROGRESS_FIELDS` blob into `progress.data`; boot (`supaBoot`) refreshes the session, pulls, and
reconciles — server wins when its `updated_at` ≠ the device's `S._supaTs` baseline (another device wrote), else local pushes.
**`progressBlob()` is what it sends, and that is NOT `extractProgress()`** — the per-review log has a table of its own
(`review_log`, block 10; see the `revlog` bullet) precisely because this blob is PATCHed whole, so anything that must grow
without bound belongs beside it rather than in it. `extractProgress()` still includes the log, since the guest stash is a
whole device state; **if you add a field that grows per review, give it a table and keep it out of PROGRESS_FIELDS.**
**…AND THE RECONCILE MUST COMPARE THE BLOB IT ACTUALLY SENDS** (Aug 2026, on a bug report that deck settings "won't
save"). It compared `extractProgress()` against `row.data`, and since the former appends `revlog` while the latter can
never carry it, **the two could not be equal**: the "in sync, do nothing" branch was unreachable and every signed-in
boot re-uploaded the whole blob — a wasted upload per launch on exactly the slow links that can least afford one, and
worse, each push bumps `updated_at`, so for a two-device reader "another device wrote" was true on essentially every
launch. **The pull is also a NETWORK ROUND TRIP the reader is not waiting for**, and `applyProgress` replaces every
progress field, `deckOpts` among them — so a reader who pressed Save on a deck's Daily limits while it was in flight
had the change overwritten the moment the row landed, silently, having just been toasted "Daily limits saved". A slow
link does not CAUSE that; it only holds the window open long enough to hit every time, which is why it was reported as
a connectivity fault. The blob is now snapshotted before the wait and compared after it: **a write made in the meantime
is the newer write and wins outright**, and is pushed rather than merged, so the other device converges on its next
pull. **An idle device still adopts**, which is the half a guard like this most easily breaks — asserted both ways in
`test-account-switch.js` section 6.
**THE ADOPT IS A THREE-WAY MERGE PER FIELD, NOT AN ALL-OR-NOTHING SKIP** — what was local when the pull
started, what is local now, and what the server holds: a PROGRESS_FIELD the reader did not touch takes the
server's copy and one they did is theirs. The first cut skipped the adopt outright whenever anything had
moved, and that is wrong for a reason only visible once `friendCount` joined the blob: **`setFriendCount`
writes from the friends list**, so a reader sitting on the account page at boot can have a BACKGROUND write
suppress the adopt and push a stale blob over the other device's — the very fault this closes, through a
different door. Merging per field needs no list of "fields a reader may edit" and so **cannot rot as more
background writers arrive**; it is not the arithmetic merge refused above, which was merging WITHIN one field.
Sign-in adopts server progress (or MIGRATES local progress up if the server row is empty); the pre-sign-in device state is
stashed (`folio_supa_guest_v1`) and restored on sign-out. **That migration is OWNERSHIP-GATED by `S._supaOwner`** —
the account id the progress currently in localStorage belongs to (device-local like `_supaTs`, so it never syncs
itself). Migrating up is right for a guest who studied before ever making an account and WRONG for every account
after the first: without the gate, creating a second account on a device silently adopted — and then permanently
owned, since we push it up — the previous account's levels, badges, streak and heatmap. So `supaAfterSignIn` migrates
only when the local progress is unclaimed or already this account's, and otherwise **wipes to `emptyProgress()`**;
`supaClaimGuestStash()` marks the stash claimed at the moment it migrates (or signing out and into a THIRD account
would inherit it again), the stash carries its `owner` back on sign-out, and `supaBoot` back-fills ownership for
sessions signed in before the field existed. Guarded by `.claude/test-account-switch.js`. Auth = email+password (`/auth/v1/*`); emailed links (confirm/reset)
land with tokens in the URL hash → `supaBoot` adopts them (requires the Supabase **Site URL** to point at the deployed app).
The account page (auth/self/friends views) is fully server-backed; friends use the `friends` table (request → accept, RLS lets
accepted friends read each other's `progress` for the badges view). **Admin gating** (`adminEligible()` / `isAdmin()`): a
signed-in user is admin-eligible iff `profiles.role === 'admin'` (set via the dashboard Table Editor); a signed-in non-admin is
NEVER eligible; a signed-out guest is eligible only on a **dev origin** (`isDevOrigin()`: `file://` or
localhost/127./10./192.168.) with no legacy local accounts — so the dev machine keeps its editor, while first-time visitors and
non-admin accounts on the live site see no Edit tab. `isAdmin()` additionally honours `S.settings.adminMode === false` →
visitor view — **but nothing writes that false any more**: the **Editor / Visitor chip was removed from the menu bar in Aug
2026, on request**, along with the **Project W tab** (both copies, top bar and phone). `.mode-switch` and `setMode` are
DELETED rather than left unreachable, and `load()` back-fills a stored `adminMode === false` to true, since the chip was the
only way to set it and its removal would otherwise strand an editor in the visitor view with no control to return with. The
**route survives**: `PAGES.warofages`, its `PAGE_META` row, `ADMIN_ROUTES` and the `valid` entry are untouched (the request
was about the menu bar and said "for now", the page is admin-gated, and `test-layout.js`'s cold-load `#warofages` guard needs
a route to resolve), so putting the tab back is one markup block in `index.html`.
The old local accounts (`folio_acct_v1`) remain only as legacy code (guest stash helpers); their admin-page
user-manager went with the Accounts tab when the reader-feedback queue replaced it.


## Signing in with a username, switching accounts, changing your email — moved out of `CLAUDE.md`

- **SIGNING IN WITH A USERNAME, SWITCHING ACCOUNTS, AND CHANGING YOUR EMAIL (Aug 2026, on request).**
Three things about the same account, and the first two each needed a decision that is not obvious.
· **A USERNAME IS RESOLVED BY A PASSWORD-VERIFYING RPC, NEVER BY A LOOKUP** (`supaEmailForUsername` /
`looksLikeEmail` / `supaSignIn(idOrEmail, pw)`; `public.login_email(uname, pw)` in section 12 of
`.claude/supabase-schema.sql` — **the user must run it once**). GoTrue signs in with an email, so a
username has to become one — and the obvious implementation, selecting the email out of `profiles`,
is an **email-enumeration oracle**: anybody with the publishable key could walk the usernames and
read off addresses. The RPC is `security definer`, takes the PASSWORD as well as the name, checks it
with pgcrypto's `crypt()` against `auth.users.encrypted_password`, and returns the address only on a
match — so it tells a caller nothing they could not have learned by signing in anyway. Wrong password,
wrong username and no such user are one answer.
**It degrades rather than breaking**: a 404 (the function not yet created) is turned into "use your
email address", so a database without section 12 still signs everybody in. The field is
`type="text" autocomplete="username"` and labelled **Email or username** — `type="email"` would have
the browser refuse a username before the form was ever submitted.
· **SWITCHING ACCOUNTS KEEPS THE OTHER TOKEN, WHICH IS WHY IT IS NOT A SIGN-OUT** (`SUPA_ACCTS_KEY` /
`supaAccounts` / `supaRemember` / `supaForget` / `supaSwitchTo` / `supaSignOut({keepToken})`). GoTrue's
`/logout` **revokes the refresh token globally**, so signing out and back in is the only way to reach
another account — which is exactly the friction the request is about. `supaSwitchTo` therefore tears the
session down LOCALLY, keeping the outgoing account's tokens in `folio_supa_accts_v1` (device-local, like
the guest stash — never synced, since which accounts this browser remembers is a fact about the browser),
and installs the incoming one's. **A plain Sign out FORGETS that account**, because its token has just
been revoked and a remembered row pointing at a dead token would offer a switch that cannot work.
The progress side needs no new machinery at all: `_supaOwner` already gates the guest-progress migration
(see the bullet above), so a switch adopts the incoming account's progress and can never carry the
outgoing one's levels, badges or streak across — which is the failure this feature would otherwise have
industrialised. `.claude/test-account-switch.js` is what guards it.
· **THE EMAIL ADDRESS IS SHOWN AND CHANGEABLE** (`supaSetEmail`, `#emPanel` / `#emToggle`). A PATCH to
`/auth/v1/user`; with confirmations on, Supabase emails the NEW address and the change lands when that
link is followed, so the panel says so rather than reporting a change that has not happened yet.
`openPanel(want)` keeps the email, password and switch panels mutually exclusive — three folds open at
once on a phone is the whole account page.


## Creating an account — the three silent faults, moved out of `CLAUDE.md`

- **CREATING AN ACCOUNT — three faults, all silent (Sep 2026, on a bug report).** They are one bullet
because the report was one sentence and they compound: the form could refuse a sign-up, say nothing
about it, and leave a button that still looked as though it were working.
· **THE AUTH BUTTONS' LABEL WAS EATEN BY THE FIRST PRESS.** `busy(f, on)` wrote `"…"` into the button
and only THEN asked whether it had a stored label — so the first press stored `"…"` AS the label, and
every restore afterwards put `"…"` back. All three forms (sign in, create, forgot) read `"…"` for the
rest of the visit. **Stash the label BEFORE overwriting it**; `.auth-btn:disabled` now dims too, since
a busy button that looks exactly like an idle one was the other half of the illusion.
· **A TAKEN USERNAME RENAMES THE ACCOUNT AND NOBODY WAS TOLD.** `handle_new_user` catches the
`unique_violation` and signs the reader up under `scholar_<8 hex>` — the right call, since refusing a
whole sign-up over a handle would be worse — but the form said "Account created — welcome!", signing
in by the chosen username then failed, and no friend could find them by it. `supaSignUp` hands back
the handle the profile ACTUALLY got (it has just loaded it) and the form says so, on a long toast.
**A pre-flight availability check is impossible anyway**: `profiles` is readable `to authenticated`,
and the reader creating the account is nobody yet.
· **…AND THERE WAS NO WAY BACK FROM IT** (`supaSetUsername`, `#unPanel` / `#unToggle` / `#unShown`).
The account page's field edits the DISPLAY NAME; `username` was written once by the signup trigger and
never again, so a reader could be permanently landed with a handle they never chose. The schema has
granted `update (username, name, avatar)` since the first block and nothing had ever used the first
column. **The uniqueness stays the DATABASE's answer** — a look-up first would be a race AND a second,
weaker copy of the rule in the client, so this reads the 409 and says it in words.
· **AND A THROW ON THE AUTH PATH NOW REPORTS ITSELF** (`authThrewMsg`, plus a `finally` round every
`busy`). `supaSignUp` awaits `supaAfterSignIn`, which loads a profile, pulls progress, applies it and
remounts the community decks — any of which can raise on odd stored state, and every one of those
threw straight out of the submit handler as an unhandled rejection. The account had been CREATED, so
the reader's next attempt met "User already registered" over a form that had told them nothing.
· Guarded by **`.claude/test-account-switch.js` sections 7 and 8**, whose mock had to learn three things
the real backend does and the old mock did not: the trigger's `scholar_<hex>` fallback, the unique and
check constraints on a `profiles` PATCH, and `login_email` — **a mock that always grants the handle
asked for cannot see any of this.**


## Live content editing (cloud overrides) — moved out of `CLAUDE.md`

- **Live content editing (cloud overrides)** — the `/* cloud content overrides */` module in app.js + the `content_overrides`
table (single row `id=1`, in `.claude/supabase-schema.sql`; **the user must run the SQL once** — until then every fetch 404s and
the module degrades silently). The row's `data` holds an admin-edit overlay in the exact `folio_admin_v1` delta format. Every
visitor (anonymous included, RLS select = public) runs `cloudBootOverrides()` after `supaBoot`: if the row's `updated_at` differs
from the device's baseline (`localStorage["folio_cloud_ts_v1"]`), the overlay is adopted via `reapplyAdminOverlay(row.data)` +
persisted, so live-site edits reach all visitors within seconds of their next load. A **signed-in admin** publishes automatically:
`writeAdminEdits()` (the single overlay write choke-point) calls `cloudQueuePush()` (4s debounce, skips no-ops) which PATCHes
`ADMIN_EDITS` into the row (RLS update = admins only). **Dev origins neither publish nor adopt, signed-in or not**
(`cloudBootOverrides` returns early on `isDevOrigin()`; `cloudCanPublish()` requires `!isDevOrigin()`): the dev machine's
in-flight local overlay is never clobbered by the cloud copy, and it never publishes — a dev overlay empties whenever it's
baked into the data files, so publishing it would wipe live edits (this actually happened in testing: a signed-in localhost
tab auto-published its empty overlay over a fresh live edit; don't weaken these guards). Live editing is therefore
live-site-only. Adopted/loaded overlays pass through `normalizeAdminEdits()` (used by `loadAdminEdits` +
`reapplyAdminOverlay`), which guarantees every overlay section exists whatever the input (a bare `{}` row can't crash
`applyAdminEdits`) and **must list every overlay key — `mission` was once missing from the load path, silently dropping
Mission-page edits on reload**. **Hygiene:** after baking the overlay into `data.js`/`glossary.js`/`timeline.js` and
deploying, reset `content_overrides.data` to `{}` (Table Editor) so a stale cloud overlay can't shadow the newer shipped files.
· **AN OVERLAY DELTA IS KEYED BY ID, SO RENUMBERING IDS SILENTLY REPOINTS EVERY EDIT** (Aug 2026, on a bug
report: "some cards in the World History collection are getting their background sections mixed up with
those of other cards"). The key is the ONLY thing joining an edit to its subject, and it lives in a
Supabase row that no repo operation touches — so the day an id changes meaning, the delta goes on being
applied and paints its content onto whoever inherited the number. The **2026-08-04 World History
renumbering** moved 89 cards into their planned slots and left the previous week's live edits on the old
numbers: seven cards spent the next fortnight showing another card's background, and the mapping was
exact both ways — old `wh-001` is now `wh-046`, so `wh-001` (Prehistory) served the Paleolithic card's
prose, while `wh-014` and `wh-017`, which map to themselves in the table, stayed correct. **Nothing threw
and no count could see it**: the question, answer, date line, difficulty and star rating are all read
from `data.js` and were right, and only the prose inside the Background fold was wrong — which is why it
took a reader to notice. **Renumber the overlay in the same pass as the cards, or clear it**;
`docs/world-history-card-plan.md` holds the old→new table.
**AND THE SAME ROW ACCUMULATES DAMAGE NOBODY IS WATCHING.** Audited at the same time, that overlay was
also **deleting `col-41` and `col-42`** — the live United States and Russia collections, gone from the
Collections page for every visitor — re-creating decks retired in the same replan, **shadowing the fixed
1900 map** with the pre-fix one (no Ottoman Empire, no Greece; see `build-era.js`'s `SUP_MIN`), and
carrying eleven further timeline eras byte-identical to the shipped ones as dead weight. Of 4 MB, three
things were worth keeping. **`node .claude/check-overlay.js` is the audit** — it reads the live row
against the shipped files and reports a delta whose prose belongs to another card, a delta pointing at a
dead id, a live collection the overlay deletes, timeline eras that differ, footnote markers or licence
attributions an edit has dropped, and what the row costs every visitor. **Run it after any renumbering
and after baking.**
· **A CONTENTEDITABLE ROUND TRIP IS NOT LOSSLESS, and what it drops is the apparatus.** Several edits in
  that row had lost **every** `<sup class="fn">` marker while the prose stayed word-for-word identical
  (both artefacts, four glossary descriptions, one abstract) — so the citations were still listed and
  nothing pointed at them, which `add-sources.js` refuses and no render-time check can see. Others moved
  a space inside the opening `<b>` (`The<b> Minoan`), dropped an image's `alt`, or dropped the licence
  line out of a picture's `desc` — losing a required CC BY-SA attribution. Ordinary typing is safe
  (verified in a browser); it is select-all, paste and heavy restructuring that strip them. **Check the
  marker count after editing prose that carries citations**, which is what `check-overlay.js` does.


---

## The Supabase bullet's own account, moved out of CLAUDE.md (2026-09-11)

**Read this before changing the reconcile, the guest stash or the ownership gate.** CLAUDE.md's
"Environment" section carries the rules; this is the bullet as it stood there, verbatim, with the
measurements and the faults behind each.

- **Online accounts + sync (Supabase)** — LIVE in app.js (the `/* Supabase */` module after the legacy
accounts block). Static hosting on Cloudflare Pages fed by GitHub pushes (`git push` = deploy). Schema
+ RLS: `.claude/supabase-schema.sql` (applied; tables `profiles` / `progress` / `friends`, plus the
later blocks' `user_*` / `deck_*` / `feedback` / `content_overrides` / `review_log`, and — **still to
be run once each** — **section 11 `user_decks.color`**, **section 12 `login_email()`** and **section
13 `card_stats` + `bump_card_grades()`**). **A LATER BLOCK IS NEVER A PREREQUISITE**: every feature
that needs one degrades to a sentence rather than an error, so the site works on a database that has
only the first block — **keep it that way**, a block the owner has not run yet being the normal case
rather than the broken one. **Which blocks a given database already has is answered by
`.claude/schema-check.sql`**, read-only, one true/false row per block. Plain `fetch()` (no SDK — the
zero-dependency rule); the publishable key in app.js is safe to ship, security being RLS.
**Offline-first**: localStorage stays the working copy; `save()` → `supaQueuePush()` (6s debounce,
skips no-ops) PATCHes the whole `PROGRESS_FIELDS` blob into `progress.data`; boot (`supaBoot`)
refreshes the session, pulls, and reconciles — server wins when its `updated_at` ≠ the device's
`S._supaTs` baseline, else local pushes.
**`progressBlob()` is what it sends, and that is NOT `extractProgress()`** — the per-review log has a
table of its own precisely because this blob is PATCHed whole, so **anything that must grow without
bound belongs beside it rather than in it: if you add a field that grows per review, give it a table
and keep it out of `PROGRESS_FIELDS`.**
**…AND THE RECONCILE MUST COMPARE THE BLOB IT ACTUALLY SENDS.** Comparing `extractProgress()` against
`row.data` made the "in sync, do nothing" branch UNREACHABLE, so every signed-in boot re-uploaded the
whole blob and bumped `updated_at`, which for a two-device reader made "another device wrote" true on
essentially every launch. **The pull is also a NETWORK ROUND TRIP the reader is not waiting for**, and
`applyProgress` replaces every progress field — so the blob is snapshotted before the wait and compared
after it: **a write made in the meantime is the newer write and wins outright**, and is pushed rather
than merged, so the other device converges on its next pull. **THE ADOPT IS A THREE-WAY MERGE PER
FIELD, NOT AN ALL-OR-NOTHING SKIP** — what was local when the pull started, what is local now, and what
the server holds — so a field the reader did not touch takes the server's copy and one they did is
theirs. Skipping the adopt outright whenever anything had moved is wrong because **background writers
exist** (`setFriendCount` writes from the friends list), and merging per field needs no list of "fields
a reader may edit" and so **cannot rot as more background writers arrive**.
Sign-in adopts server progress, or MIGRATES local progress up if the server row is empty; the
pre-sign-in device state is stashed (`folio_supa_guest_v1`) and restored on sign-out. **That migration
is OWNERSHIP-GATED by `S._supaOwner`** — the account id the progress in localStorage belongs to,
device-local like `_supaTs` so it never syncs itself. Migrating up is right for a guest who studied
before ever making an account and **WRONG for every account after the first**: without the gate,
creating a second account on a device silently adopted — and then permanently owned, since we push it
up — the previous account's levels, badges, streak and heatmap. `supaClaimGuestStash()` marks the stash
claimed at the moment it migrates, the stash carries its `owner` back on sign-out, and `supaBoot`
back-fills ownership for sessions signed in before the field existed. Guarded by
`.claude/test-account-switch.js`.
Auth = email+password (`/auth/v1/*`); emailed links land with tokens in the URL hash → `supaBoot`
adopts them (requires the Supabase **Site URL** to point at the deployed app). Friends use the
`friends` table (request → accept, RLS lets accepted friends read each other's `progress`).
**Admin gating** (`adminEligible()` / `isAdmin()`): a signed-in user is admin-eligible iff
`profiles.role === 'admin'`; a signed-in non-admin is NEVER eligible; a signed-out guest is eligible
only on a **dev origin** (`isDevOrigin()`) with no legacy local accounts. `isAdmin()` additionally
honours `S.settings.adminMode === false` — **but nothing writes that false any more**, the Editor /
Visitor chip having been removed on request, so `load()` back-fills a stored `false` to true; `setMode`
and `.mode-switch` are DELETED rather than left unreachable. The **Project W route survives**
(`PAGES.warofages`, its `PAGE_META` row, `ADMIN_ROUTES` and the `valid` entry are untouched), so
putting its tab back is one markup block in `index.html`.
**📖 `docs/accounts-sync.md` — READ BEFORE TOUCHING SIGN-IN, THE PROGRESS BLOB OR THE RECONCILE.**
