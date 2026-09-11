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

---

## Admin → Quotes, and the two rules every later tab is held to (2026-09-11)

**Read this before adding a tab to the admin area.** CLAUDE.md keeps both rules — lift the ≤860px panel cap
and give the tab a colour pair. This is the bullet as it stood there, with both bug reports in full.

- **Admin → Quotes: the home page's daily quote, seen, edited and PLANNED (Aug 2026, on request).**
`adminRenderQuotes`, a fifth tab taking over the admin area the way Feedback, Timeline and the Dashboard
do (`.quotes-mode`, the same hide list). The data layer is the `SHIPPED_QUOTES` + overlay design described
under the Home page bullet; three things about the TAB are decisions rather than plumbing.
· **It lists in RUNNING ORDER, not array order, and dates every row.** The order is solved from the pool
(no author two days running, none more than twice a week), so where a quote sits in the source says
nothing about when a reader will meet it — and when they will meet it is exactly what an editor adding
a fifth Confucius line needs to know. Today's is marked; the rest carry "tomorrow", "in N days" and the
date. That is the whole of what "plan" means here, and it is a question nothing else on the site answers.
· **The form covers the English AND the original-language block** (`o`: lang, text, speaker, source),
which is what a reader actually flips the quote over to see. An `o` is written only when the language
and the words are both filled in — an empty one would make the home page offer a flip that turns the
quote into nothing. The nine-language chrome translations are not editable here: they are `chrome.exact`
rows managed by `.claude/add-lang.js`, and the site is English-only behind `MULTILANG` anyway.
· **"Copy as JS" hands the whole pool back as the `SHIPPED_QUOTES` literal**, for pasting into app.js when
a batch is settled. It is the bake path this tab has instead of `autoSaveFiles`, which writes data files
and must never be pointed at app.js.
**A TAB THAT TAKES OVER THE ADMIN AREA MUST LIFT THE ≤860px PANEL CAP, and TWO of the four had not**
(Aug 2026, on a bug report). `.admin-list-items` is capped at `max-height:300px` on a phone, which is right
for the Cards and Glossary lists — they are one column of a two-column layout — and traps a whole page in a
300px scroll box for a tab that owns the screen: the Quotes tab's edit form filled the box, its Save button
sat at the fold, the running order beneath was cut off mid-row and the rest of the screen was left empty.
Timeline and Feedback were in that rule's exception list from the day they were built; the **Dashboard and
Quotes arrived later and were not**, which is the whole of the bug. All FIVE are listed now (Artefacts
joined in Aug 2026) — **keep the list in step with the `*-mode` classes `adminRefresh()` sets**, or the next
tab added will look broken the same way. Guarded by `test-layout.js`, which reads the cap back and checks the
pane is not clipped, and by `test-artefacts.js` for the Artefacts tab's own copy of it.
**AND A TAB NEEDS A COLOUR, for the same reason and with the same failure mode** (Aug 2026, on a bug
report). `.admin-tab` on its own is transparent in the inherited ink, so **Quotes and Artefacts — the two
that arrived after the colours were placed — read as DISABLED beside five that are lit**, which is what a
tab with no rule of its own looks like rather than what it is. Both hues are placed rather than picked:
the original four took blue (cards), green (glossary), amber (timeline) and red (feedback) with purple
spanning both columns above them (dashboard), so what was free was TEAL and MAGENTA — Quotes takes the
teal (`#118e96`) and Artefacts the magenta (`#a8478f`), which also puts the two tabs that write back into
app.js's own literals at opposite ends of the wheel. **Every `data-atab` needs a pair of rules** (the rest
state and `.active`); adding a tab and not adding them is invisible in code review and obvious on screen.
