# Community decks — design plan

**Status:** **Phases 0 and 1 shipped** (2026-07-27) — see §12. Phases 2–5 are still proposal.
Decision taken with the project owner: build free-only first; the paid tier (§9) comes last.
**Scope:** users create their own decks, cards and (optionally) their own glossary; publish them; other
users browse, install, study and rate them; creators may put part of a deck behind a paywall from which
Folio takes a percentage.

This is the largest feature Folio has taken on. It changes the project from *a static study site with an
admin editor* into *a user-generated-content platform with payments*. That is a product and legal step, not
only an engineering one, so the plan below phases the money last and says plainly where the current
architecture stops working.

---

## 1. What the existing code forces on the design

Findings from reading `app.js`, `data.js` and `.claude/supabase-schema.sql`:

| Existing behaviour | Consequence for this feature |
|---|---|
| `serializeCardData()` maps over the live `CARDS` array | Anything merged into `CARDS` gets baked into `data.js` by Save-to-project / auto-save. Community cards must not live there. |
| `applyAdminEdits()` rebuilds the whole tree from `SHIPPED_NODES` on every admin edit | Community nodes injected into `TREE` would be wiped on each edit unless re-mounted, like the lazy-bundle `after` hooks. |
| `adminUndo` → `reapplyAdminOverlay` rebuilds `CARDS` from `PRISTINE_CARDS` restricted to `BASE_CARD_IDS` | Same problem: community cards would silently disappear on Ctrl+Z. |
| `availableCardIdSet()` sweeps every non-coming-soon collection into daily review, games and card-of-the-day | Unvetted user cards would appear in the daily games unless explicitly excluded. |
| `buildGlossIndex()` builds **one** global index off `window.GLOSSARY` | A user's terms would auto-link inside curated cards. The index has to become scope-aware. |
| `content_overrides` is a **single global row**, admin-write | It is the wrong transport for per-user decks. Community content needs its own tables. |
| Card fields are rich HTML rendered with `innerHTML` (`buildBack`, `abstract`, `question`) | Publishing user HTML is **stored XSS**. There is currently no sanitizer in the codebase. Blocking prerequisite — see §4. |
| `CARD_BY_ID` is referenced only 43 times | A `cardById()` shim is a contained, reviewable change. |
| `index.html` has **no inline scripts** | A strict `script-src 'self'` CSP is cheap to add as defence in depth. |
| `route()` sets `location.hash = name`; only `#map/<year>/<slug>` parses sub-paths | Deck deep links need the same treatment `parseMapHash` already models. |

**Core architectural decision: community content lives in its own namespace and never enters `CARDS`,
`TREE`, `window.GLOSSARY` or `ADMIN_EDITS`.** Every row in the table above is a reason.

---

## 2. Data model in the client

New module in `app.js` (community layer), with its own globals:

```js
const UDECKS = {};   // deckId -> { id, slug, title, subtitle, desc, author, version,
                     //             glossMode, price, demoCount, cardIds:[], rating, ... }
const UCARDS = {};   // cardId -> card object (the same 13 fields + image + optional i18n)
const UGLOSS = {};   // deckId -> { slug -> { desc, date, title, tags[], aliases[] } }

function cardById(id) { return CARD_BY_ID[id] || UCARDS[id] || null; }
function deckOfCard(id) { ... }        // for glossary scoping and XP attribution
function isCommunityCard(id) { return /^u_/.test(id); }
```

Card ids are `u_<deck8>_<n>` — the `u_` prefix makes "is this community content" a cheap string test and
cannot collide with `cnh-001` / `wh-…`. Ids are **stable across deck edits** so a learner's scheduling
survives a creator's update.

**Integration points** (small, enumerable):

- `cardById()` replaces direct `CARD_BY_ID[...]` reads on the study / scheduling / preview path. The admin
  editor keeps reading `CARD_BY_ID` directly — it must only ever see curated cards.
- `availableCardIdSet()` gains installed community decks, so the **daily review** can mix them in.
- The **daily games** (`challenge`, `chrono`, `truefalse`, `whosaid`, card-of-the-day) stay curated-only.
  Their whole premise is fact-checked content; a settings toggle can opt in later.
- **XP**: community cards count toward the general Folio level (it is "distinct cards studied"). Each
  installed deck gets its own level badge in the Library, Western digits (no `COLLECTION_NUMERALS` entry).
- **Progress** (`S.cards[id]`) works unchanged because ids are globally unique. Uninstalling keeps progress
  for ~90 days then prunes it, so reinstalling does not lose a streak and the synced blob cannot grow
  forever.
- `serializeCardData()` / `serializeGlossary()` / `build-tts.js` / `check-style.js` all skip `u_` content.

**Storage:** installed deck payloads go in **IndexedDB** (`folio-community`), not localStorage — a large
deck with images would blow the ~5 MB quota, and there is already IDB precedent (`folio-fs`). What syncs
through `PROGRESS_FIELDS` is only the small list `S.installed = [{ id, version, installedAt }]`; each
device refetches the payload itself. Payloads are **not** service-worker precached (same rule as the lazy
data bundles) but are cached in IDB on install, so a community deck studies offline like everything else.

---

## 3. Database schema (Supabase)

Additive to `.claude/supabase-schema.sql`. RLS is the entire security model, exactly as it is today.

```
user_decks         id, owner, slug, title, subtitle, description, cover, language, tags[],
                   gloss_mode('site'|'own'|'both'), status('draft'|'pending'|'published'|'hidden'|'removed'),
                   visibility('private'|'unlisted'|'public'), price_cents, currency, demo_card_count,
                   version, card_count, install_count, rating_avg, rating_count, timestamps

user_cards         id, deck_id, ord, is_demo, data jsonb, timestamps
user_gloss         deck_id, slug, data jsonb            (pk deck_id+slug)
deck_ratings       deck_id, user_id, stars 1..5, body, timestamps   (pk deck_id+user_id)
deck_entitlements  deck_id, user_id, source('free'|'purchase'|'gift'|'creator'), order_id, granted_at
deck_reports       id, deck_id, reporter, reason, note, status, created_at
```

Policies that matter:

- **`user_cards` select is the paywall.** `is_demo OR owner OR deck is free+published OR
  exists(entitlement)`. This is why cards are **rows, not one JSON blob** — you cannot partially gate a
  blob, and any client-side filtering is defeated by devtools.
- **`deck_entitlements` has no client insert policy at all.** Only the payment webhook (service role)
  grants them.
- `deck_ratings` insert/update requires `user_id = auth.uid()`, and for a paid deck also an entitlement.
- Browse reads go through a `public_decks` view filtered to `status='published' AND visibility='public'`;
  direct-by-slug reads also match `unlisted`, so a shared link works without listing the deck.
- Triggers maintain `rating_avg`, `rating_count`, `card_count`, `install_count` — PostgREST does aggregates
  badly, and denormalised columns are what you want to sort and index on anyway.

---

## 4. Security — the blocking prerequisite

Today only an admin authors the HTML that `innerHTML` renders. The moment a stranger's HTML renders in
another user's browser, Folio has **stored XSS**, and the Supabase access token lives in localStorage:
account takeover for a learner, and for an admin, the ability to write `content_overrides` and deface the
entire live site.

Required before any user content is displayed:

1. **`sanitizeHTML(html)` in `app.js`**, zero-dependency, `DOMParser` + allowlist:
   - tags: `b i em strong u sub sup br p div span ul ol li blockquote h3 h4 a img figure figcaption`
   - attributes: `class` (from a fixed list of Folio class names — `blank`, `dt`, `dt-k`, `dt-v`,
     `tr-pinline`, `tr-pin`, `ttip`, `data-k`), `href` (http/https only), `src`, `alt`, `title`
   - stripped unconditionally: every `on*` handler, `style`, `srcset`, `<script>`, `<style>`, `<iframe>`,
     `<object>`, `<svg>`, and `javascript:` / `data:` URLs
   - **applied on ingest**, as a payload enters `UCARDS`/`UGLOSS`, so every downstream render is safe by
     construction; applied again on save in the Studio as a courtesy. Never trust the stored copy.
2. **CSP** via a Cloudflare Pages `_headers` file — `script-src 'self'` is achievable today because
   `index.html` carries no inline scripts (verified).
3. **Images**: only Supabase Storage URLs (bucket `deck-images`, per-user folder, size cap, client-side
   downscale — the avatar code already downsizes to a 128px JPEG and is the pattern to copy). Arbitrary
   remote `src` leaks viewers' IPs to third parties and rots.
4. **Rate limits in the database, not the client**: decks per account, publishes per day, cards per deck
   (~500), payload size.

---

## 5. Glossary scoping

Per-deck `gloss_mode`:

- **`site`** — the deck's cards auto-link against `window.GLOSSARY`, exactly like curated cards.
- **`own`** — only the deck's own terms link; nothing from the site glossary.
- **`both`** — deck terms win on a collision, the site glossary fills the rest.

Implementation:

- `buildGlossIndex()` → `glossIndexFor(scope)` with a cache keyed `"site"` / `"deck:<id>"`, invalidated on
  a deck version bump.
- `autoLinkGlossary(rootEl, answerText, offKeys, scope)` gains a trailing `scope` argument defaulting to
  `"site"`, so **every existing call site is unchanged**.
- Deck terms carry namespaced keys `u:<deckId>:<slug>` in `data-k`. `openGlossWin`, `glossText`,
  `glossTitle`, `glossDates` and `glossTags` each get a two-line branch: `u:` prefix reads `UGLOSS`,
  otherwise `window.GLOSSARY`. Nested links inside a popup inherit the popup's scope.
- Deck terms never appear on the site glossary page or in the admin glossary editor.

---

## 6. Creator Studio

New route `#studio` (`#studio/<deckId>`), open to any signed-in user.

**Do not reuse `PAGES.admin`** — it is welded to the global overlay, `SHIPPED_NODES`, `adminUndo` and
Save-to-project. **Do** reuse its presentational parts. The one refactor of existing code worth doing is
extracting `renderLiveCardEditor(container, card, { onChange })` out of `adminRenderEditor`, so the
`.admin-live-card` contenteditable surface, the formatting ribbon and the image panel serve both editors.
`buildBack`, `renderCardPreviewInto` and `cardImageHTML` are reused as-is.

Studio flow: deck list → deck settings (title, subtitle, description, tags, cover, language, glossary mode,
price + demo size) → card list (drag reorder, mark demo) → card editor → glossary editor (only when mode is
`own`/`both`) → publish panel (a readiness checklist and a "preview as a visitor" view).

Persistence is a debounced PATCH straight to Supabase, mirroring the `supaQueuePush` pattern, with a
localStorage/IDB mirror for offline drafting — **not** through `ADMIN_EDITS`. Signed-out users can create
decks locally in IDB and are prompted to sign in to publish, which keeps the offline-first character.

---

## 7. Library and discovery UI

Below "All decks" and "Coming soon", a third section: **From the community**.

- The user's **installed** community decks render as ordinary collection rows (so they study identically),
  each with a small community badge.
- Below them a shelf/grid of published decks: cover or initial, title, creator handle, star rating and
  count, card count, price chip (`Free` / `£3` / `Free demo`), install state.
- Controls: search, sort (Top rated / Newest / Most studied), tag chips, language filter, Free-only.
- `#community` — the full browse page with pagination.
- `#deck/<slug>` — detail page: hero (title, subtitle, creator, rating, counts), description, **a real
  sample card you can flip**, a contents list (demo cards named, paid ones locked), reviews, Install / Buy /
  Update, and a Report link.

Routing: extend the boot parser and the `hashchange` handler the way `#map/<year>/<slug>` already is, add
`community`, `studio` and `deck` to the `valid` list, and add a `PAGE_META` row for each — the CLAUDE.md
rule, or they inherit the home page's title.

**Community decks must look visibly different from curated ones** and carry a line to the effect of
"Community deck — not fact-checked by Folio". Folio's content rules (10 sentences, 270–330 words,
adversarial fact-checking) cannot be imposed on strangers, and the project's core value is that its
content is trustworthy. That distinction has to be in the UI, not buried in a policy page.

---

## 8. Ratings

- 1–5 stars plus an optional review of ≤500 characters, one per user per deck, editable and removable.
- **Gated**: rating unlocks after studying ≥5 of the deck's cards (checked client-side against `S.cards`),
  and for a paid deck after purchase (enforced in RLS). This kills drive-by ratings.
- Detail page shows a distribution bar chart and the most recent reviews.
- Browse ranks by a **Bayesian-adjusted** average — `(v/(v+m))·R + (m/(v+m))·C` with `m ≈ 10` and `C` the
  site mean — not the raw mean, or one 5-star review tops the chart forever.

---

## 9. Payments — where the architecture stops working

A static page cannot take money safely. This phase needs server code, and it is the reason to do it last.

1. **Server code**: Supabase Edge Functions (Deno, deployed with the Supabase CLI) — the natural fit since
   Supabase is already the backend. Three functions: `create-checkout`, `payment-webhook`,
   `connect-onboard`. This does not violate the site's zero-dependency rule any more than
   `.claude/build-*.js` does; it is a separate deployment artifact, not something the browser loads.
2. **Processor** — two roads:
   - **Stripe Connect (Express)**: most control, the standard marketplace setup; Folio's cut is
     `application_fee_amount` on a destination charge, and Stripe handles creator KYC and payouts.
     **But Folio becomes merchant of record, so Folio is liable for EU/UK VAT and US sales tax on digital
     goods in every jurisdiction it sells into.** That is a permanent compliance burden.
   - **Paddle or Lemon Squeezy (merchant of record)**: they are the seller, they handle VAT and sales tax
     worldwide, and both support paying third-party creators. Higher fees, less control, far less legal
     exposure. **Recommended.**
3. **Entitlements are granted only by the webhook** using the service-role key, which never touches the
   client. The client never decides what it is allowed to read — it asks for the cards and RLS answers.
4. Also required, and easy to underestimate: creator payout onboarding, a payout threshold, a refund policy
   and window (with an EU right-of-withdrawal waiver at purchase for digital goods), visible fee disclosure
   ("Folio keeps X%"), tax forms for creators, a price floor and ceiling, and currency handling.
5. **Legal**: Terms of Service, a content licence from creators letting Folio host / display / sell their
   work, a copyright and DMCA takedown process (history decks are exactly the content people copy out of
   textbooks), an acceptable-use policy, and a privacy policy update. Not optional once money moves.

**Recommendation: ship phases 1–4 free-only and add money only once decks exist that people would pay
for.** A zero-liability intermediate step is a "tip the creator" link pointing at the creator's own
Ko-fi/Stripe page — Folio takes nothing, needs no server, and tests whether the demand is real.

---

## 10. Moderation and abuse

- `status` workflow: a creator's first deck goes to `pending` for admin review; trusted creators
  auto-publish afterwards.
- A moderation queue as a new tab on the existing `#admin` page: pending decks, reports, hide/remove.
- A Report control on every community deck and review.
- Database-enforced rate limits (§4.4).
- Copyright is the likeliest real-world problem: a takedown route needs to exist from day one of publishing.

---

## 11. Further ideas worth folding in

- **Deck export/import as a JSON file.** The cheapest possible v0 of "share a deck": no accounts, no
  server, works from `file://`, and doubles as the backup and migration path. Also the on-ramp for an
  Anki/CSV importer later. Worth building in Phase 1 regardless of everything else.
- **Share by link** for unlisted decks (`#deck/<slug>?k=<token>`) — share with a class without publishing.
- **Fork / remix** with an attribution chain ("based on X by Y"), so a good deck can be corrected and
  extended rather than duplicated badly.
- **Creator profile page**, reusing the account page shell: their decks, installs, average rating.
- **Staff pick / verified badge** for decks an admin has actually checked — the main quality lever, and the
  answer to "how does a good deck get found".
- **Creator stats**: installs, cards studied, retention, where learners drop out.
- **Deck collections ("courses")** and **co-authors** — later; the latter needs a `deck_collaborators`
  table.
- **Out of scope, deliberately**: user-authored Atlas eras or timeline maps. A much larger surface.
- **Localisation**: user decks are single-language. Show a language chip and filter by it; the 8-language
  requirement stays a curated-content rule.
- Every phase that ships needs its line in `changelog.js`, and CLAUDE.md needs a new "community layer"
  section — the golden rule.

---

## 12. Phasing

| Phase | Content | Size |
|---|---|---|
| **0 — foundations** ✅ | Shipped: `sanitizeHTML()`/`sanitizePlain()` (42 XSS vectors tested), the `UCARDS`/`cardById()` shim on the study path, scope-aware glossary indexes (`glossIndexFor`/`invalidateGlossIndex`, verified behaviourally identical), and the CSP `_headers` (0 violations across every route). **Deferred:** extracting `renderLiveCardEditor` — ~14 collaborators and only one caller today, so the seam is cut in Phase 1 against a real second caller rather than guessed at now. | S |
| **1 — local decks + file sharing** ✅ | Shipped: the Studio (`#studio`), the `UDECKS`/`UCARDS` store on IndexedDB with a localStorage fallback for `file://`, `.folio-deck.json` export/import with fresh ids on collision, a "Your decks" Library section, and community decks studying through the normal scheduler and daily review. The card surface was extracted out of the admin editor here, against the Studio as a real second caller. Sanitizing happens at one ingest choke point (`uDeckNormalize`) plus on write. 40 end-to-end assertions in `.claude/test-community.js`. **Not included:** the per-deck glossary UI — `glossMode` is stored and exported, but every card links against the curated glossary until Phase 4. | L |
| **2 — publish & discover** | Supabase tables + RLS, publish flow, `#community`, `#deck/<slug>`, install/update, moderation queue, reports. | L |
| **3 — ratings & social** | Ratings, reviews, Bayesian ranking, creator profiles, staff picks, fork/remix. | M |
| **4 — own glossary** | Per-deck glossary editor and the `site`/`own`/`both` modes. Independent — could slide earlier. | M |
| **5 — money** | MoR integration, Edge Functions, entitlements, demo/full split, payouts, ToS/tax/refunds. | L + legal |

**Note on file size:** this adds perhaps 60–100 KB to `app.js`, which is already ~684 KB and eager. The
`DATA_BUNDLES` machinery is for data, not code, so a lazy `community.js` would need a `window.__folio`
bridge out of the IIFE. Recommendation: keep it in `app.js` for now and revisit if first paint suffers.
