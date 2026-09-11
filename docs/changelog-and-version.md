# The changelog and the version line — why each rule is shaped that way

**READ BEFORE CHANGING HOW THE CHANGELOG OR THE VERSION LINE WORKS.** This is the golden rule's own
reasoning as it stood in `CLAUDE.md` until it was moved here verbatim on 2026-09-11: the days that
carried the same kind of entry two to seven times over, the 1,216-character item and the 300-character
day title that forced the one-sentence rule, what the whole-file cut cost (127 KB → 54 KB, on the eager
load path), the measured band the 72-character title ceiling was set from, the two Spanish-deck lines
written and removed the same day, and the escaped tags a reader reported as "bold text doesn't display
properly". The RULES stay in `CLAUDE.md`.

- **Keep the changelog current.** Whenever a user-requested change ships to the live site (committed/pushed),
append a one-line plain-English summary to TODAY's entry in `changelog.js` (create the day if missing; newest
day first). Reader-facing wording — what changed for the user, not how. **Card/glossary content changes are
summarized by count + deck only, never naming specific cards or terms** (e.g. "Three new cards in the Western
Zhou deck"). **One line per kind of change per day** — if the day already has a "N new cards" or "N more
glossary terms" line, RAISE ITS COUNT and fold in the new subject rather than adding a second line; several
days once carried the same kind of entry two to seven times over. The same holds for **"now in your language"
lines**: a day gets ONE localisation line per area (the daily games, the Atlas, the site chrome), extended as
more of that area lands — 2026-07-27/28 once carried eight and five of them, each announcing another corner of
the same rollout. The Mission page renders it.
**A COMMUNITY DECK IS NOT A CHANGE TO FOLIO AND DOES NOT GO IN IT** (on request, 2026-08-10). The changelog
is Folio's own record; the decks under `decks/` — the DELE Spanish set, the HSK Mandarin set — are
USER-UPLOADED content that nothing on the site links to or serves, so announcing one there posts it as
though it were official. Two lines about the Spanish decks were written and removed the same day. What DOES
belong is a change to the APP that a deck happened to force — the import caps have been raised twice by
decks that would not fit — worded as a fact about deck files rather than about any deck. The same test
settles a fault found in a deck FILE: a card-id collision between two of them was a bug in the generator's
output, not in Folio, and gets no line.
**ONE SENTENCE PER ITEM, AND ONE SENTENCE PER DAY TITLE** (Aug 2026, on request, after a reader met this
page on a phone). Items had grown back into whole paragraphs — the longest ran to 1,216 characters and one
day title to 300 — which on a narrow screen is a wall of prose where a list of changes should be. The whole
file was cut to each line's own FIRST SENTENCE and the ones still long were rewritten by hand; it went
127 KB → 54 KB, which every visitor pays for, this file being in the eager load path. **Aim for about 120
characters and treat 200 as the ceiling**; a line that wants a second sentence wants to be two items, or to
be shorter. The counts and the finding belong here; the per-card detail belongs in the batch log in `docs/`.
**A DAY TITLE IS AT MOST 72 CHARACTERS, and that is a rule with a checker** (Aug 2026, on request:
"the daily titles have grown to extensive summaries rather than compact titles"). The sentence rule above
did not say how LONG, so the titles drifted the way the items had: measured over the whole file, the first
thirty-two days run 13–72 characters and read as titles ("After the ice", "A Library of books, and World
History replanned") while nine recent ones had grown to 100–194 and were three- and four-item lists — a
contents page rather than a heading, and on a phone a wall of prose above the list it introduces. The nine
were rewritten into the older band and the ceiling is the longest of the ones that were always right.
**Enforced by rule 5 of `check-style.js`**, over `changelog.js`, REPORT-ONLY and deliberately absent from
`--fix`: shortening a title is a judgement about which of the day's changes LED, which is the one thing a
regex cannot make, and a truncated title is a sentence fragment rather than a heading. **Name the day's
leading change and stop**; the rest of the day is the list underneath.
(This supersedes an earlier "anything past ~1,000 characters is a transcript", which two 12,000- and
15,000-character citation entries had already broken once, in 2026-08-01.)
**An item is rendered as HTML, not escaped** (through `sanitizeHTML`), so `<b>` and `<i>` work and bold
marks the thing that changed. It was escaped until Aug 2026, which printed the tags themselves on the page
— reported as "bold text doesn't display properly".
**ENGLISH ONLY, for now (Aug 2026, on request): a new line does NOT need its nine translations.** The site
ships in English while the work is on making the English as good as it can be — see the `MULTILANG` bullet
under "How the app is wired". Write the line, ship it, move on. The rest of this paragraph is the rule to
resume when translations do: part of the changelog is already live in es/fr/de/it/nl/ru/ar/zh/ja as
`chrome.exact` rows in `i18n/ui-<lang>.js` (the one-sentence rewrite retired 93 rows per language, so the
coverage is thinner than it was). An item is now an HTML block rather than a plain text node, so a
translated one belongs in `chrome.html` rather than `chrome.exact` wherever it carries a tag. They must NOT
go inline into `changelog.js`, which is in the eager
load path (the `quotes.js` mistake: 27 KB → 312 KB for every visitor). Add them with `.claude/add-lang.js`
chrome batches, and **if you reword or merge an existing line, retire the old translations** in the same pass
via the `chrome.remove` list, or nine files keep a dead row that matches nothing and reads like coverage.
A line added while English-only simply has no translated rows to retire.
The changelog **dates follow the site language** (`fmtDay` → `dayLocale()`, en-GB for English), not the
browser's.
