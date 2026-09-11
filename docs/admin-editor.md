# The admin editor's tabs

**Read this before adding a tab to the admin area or a figure to the Dashboard.** `CLAUDE.md`'s "How the
app is wired" carries the rules each tab is held to — the ≤860px panel-cap exception list, the pair of
colour rules every `data-atab` needs, and what the database may and may not be asked. This file carries
the accounts behind them, moved out of CLAUDE.md verbatim.

## Admin → Dashboard (2026-09-11)

- **Admin → Dashboard: Folio in numbers (Aug 2026, on request).** The editor's FIRST tab and the one a fresh
session opens on (`adminState.tab` defaults to `"dashboard"`; a session interrupted mid-edit still comes back
to the card it was on — `restoreAdminUI` exists because auto-save can live-reload the page between
keystrokes, and losing that would be a worse regression than gaining this). It takes over the admin area the
way Feedback and Timeline do (`.dash-mode`, the same hide list). **Its tab is PURPLE and spans both columns
of `.admin-tabs`** (Aug 2026, on request) — it is the only one of the five that describes the whole site
rather than a kind of content, so it sits above the four as a header rather than beside them as a fifth
peer. `grid-column:1 / -1`, not `span 2`, so it stays full width if the grid ever gains a third column.
**Two halves, and the split is not cosmetic.** `dashContentStats()` is derived from the shipped data files
and the admin overlay on top of them, so it is exact, instant and works offline — it is the same data the
site is rendering. `dashLoadRemote()` has to ASK, and what it can ask is bounded by the RLS in
`.claude/supabase-schema.sql`: `profiles` is readable by any signed-in user and the published-deck tables are
public, but **`progress` is readable only by its owner and their accepted friends — an admin included**. So
there is no honest site-wide "cards studied" figure and **none is invented**; the panel says so in prose
rather than leaving a reader to read a missing number as a zero. **If you add a figure here, check the policy
before the query.**
Counting uses PostgREST's `Prefer: count=exact`, whose total arrives in **Content-Range** — which `supaFetch`
now parses into `r.count`. Two things about that header: it is not a CORS-safelisted response header, so it
is readable only because Supabase names it in `Access-Control-Expose-Headers` (a proxy in front of it might
not, which is why `count()` also asks for up to `DASH_CAP` ids and falls back to counting them, flagged with
a `+` if it filled the page — an honest floor beats a row of em dashes that looks like a broken panel); and
**a mock must send the expose header too**, or every figure comes back null and the panel reports a
connection failure that is really a CORS one.
**A THIRD HALF SINCE AUG 2026 — THE DEV FIGURES** (`dashDelivery` / `fmtBytes`, on request: "list some
dev-side statistics such as server file size, connection speeds, where users are connecting from"). Folio
has no server to ask, so every figure here is MEASURED on the page rather than asserted: the browser's own
**Resource Timing** gives each request's `encodedBodySize` (what was sent over the wire), its
`transferSize` (**0** for a file the cache or the service worker already had) and its duration, so the
card reports what a reader on this machine really paid rather than what the files weigh on disk, and the
eight biggest same-origin files are listed with a row reading **cached** where nothing was fetched. It is
same-origin only — a font from Google is not Folio's weight — and `navigator.connection` supplies the
connection class, downlink and round trip **where it exists**, which is Chromium and not Safari or
Firefox, so those tiles read an em dash rather than a guess. **WHERE READERS CONNECT FROM IS NOT
COLLECTED AND IS NOT GUESSED AT**, which is the People card's own rule about RLS applied to a question no
policy could answer either way: the only geography on the page is THIS machine's `Intl` time zone and
browser language, both labelled as such and neither sent anywhere.
