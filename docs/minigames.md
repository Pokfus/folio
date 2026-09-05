# The nine daily minigames

**Read this before adding a game, changing a pool, or touching `gameCardIdSet` / `markGamePlayed`.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary: the nine games, the six places a
new one has to be wired, the one-play-a-day gate, the pool filters and which suites guard them. This
file carries the rest — why each game is built the way it is, the several generators that were flawless
on the day they were written and degenerate on a date nobody tried, and the pools that quietly starved.

The five bullets below are as they stood in CLAUDE.md, verbatim.

- **Home minigames** (game-grid tiles → `PAGES.*`). **Four of the nine are fed by the cards and all four draw
  through `gameCardIdSet()`, not `availableCardIdSet()`** — the well-known terms only, at or below
  `GAME_MAX_DIFFICULTY`; see the card-difficulty bullet above, and reach for that function rather than the
  wider one when adding a tenth game. **What year? left the cards entirely in Aug 2026** and has its own
  event pool in `whatyear.js`; True or False, Who said it and Find it never used them. The games:
  **Multiple Choice** (`PAGES.challenge`, formerly "Daily Challenge" — the
  rival bots + timer were removed; it's now a plain 5-question quiz whose 3 wrong options are the cards most AKIN
  to the answer, by `cardKinship` — see the card-tags bullet below. **It always asks a card's FIRST phrasing**
  (`firstQ` in `buildChallengeQuestions`, Aug 2026, on request): a card carries three ways of asking the same
  thing and the study page deals one at random, which is right there and wrong here, where the round is
  answered from four options rather than from recall — so the phrasing has to be the one written to stand on
  its own, and `question` is that one while the extras are angles on it. It also makes the day's quiz
  reproducible, which the results summary and the score both read better for. `firstQ` CUTS the pool rather
  than pinning an index, the study page's own move for a deck with question variety off), **Timeline** (`chrono` — **the FIRST "Check order" of the day is the answer that counts**, Aug 2026, on
  request: checking used to record the BEST of any number of tries, and since a check reveals every event's
  date a reader could check once, read the years off the rows and reorder to a perfect score every day. Later
  checks still mark the rows and show the dates — the puzzle stays usable for learning the order — they just
  no longer rewrite the score, and the result says so.
  **It is the one game with a SECOND pool filter** (`card.undatable`, Aug 2026, on a bug report): it is
  also the only one that asks WHEN rather than what, so a term that does not happen at a time — `human
  evolution`, `Tiber`, `Ice age` — is kept out of it and out of nothing else. See "SOME TERMS DO NOT
  HAPPEN AT A TIME" above.
  **Its DRAG was rewritten in Aug 2026, on a report that it felt unpleasant** (`setupChronoDrag`). The old
  one called `insertBefore` on every `pointermove` and did nothing else, so the row being dragged never
  went anywhere under the finger — it was re-inserted at the new index and appeared there — and every other
  row CUT to its new place, a reorder being a reflow. The two are now held apart: the dragged row is moved
  by **transform** and follows the pointer exactly, and its siblings are reordered in the DOM and then
  **FLIPped** around it. Four things are load-bearing. The row **stays in the flow** — never absolutely
  positioned, no placeholder — so the list's height never changes, the DOM order is the answer at every
  instant, and an interrupted drag cannot leave the puzzle in a state the reader did not choose. Reordering
  moves the dragged row's own layout slot out from under it, so its transform is **recomputed against the
  new layout on every reorder** (`pinToPointer`), or it jumps by exactly one row's height at the moment it
  swaps. The target index is measured against the siblings' **LAYOUT** positions (`chronoLayoutTop`), never
  their painted ones — a sibling mid-FLIP is painted somewhere it is not, and reading that makes the list
  flicker between two orders. And `.chrono-item.dragging` must NOT set `transform` (the JS owns it) or a
  `transition` on it (the row would lag the finger by its own duration); it lifts with shadow and z-index
  instead. The ‹ › arrows FLIP the same way, or they would be the one remaining way to reorder with a cut),
  **True or False** (`truefalse`),
  **Who said it?** (`whosaid`, from `quotes.js`), **Find it** (`findit`, renamed from "Find it on the map" Aug 2026 on request — see `docs/atlas.md`
  below; 5 date-seeded locate-on-the-globe rounds, score = first-try finds), **Common Thread**
  (`thread` — see its own bullet below), and the three added on 2026-08-09 on request — **Crossword**
  (`crossword`), **Picture round** (`picture`) and **What year?** (`whatyear`), each with a bullet of its
  own below. The rival-bot race is **gone, not merely unreachable**: `drawRace`
  and the podium had already been deleted, and `BOTS` plus the write-only `S.daily.podiums` field followed on
  2026-08-08 (nothing read either; `S.daily.wins` stays, since the Victor/Champion badges read it).
  Each of the 9 games records a per-day result in `S.games[key] = { date, played, won }` (`markGamePlayed(key, won)` at each
  game's end; `won` = a perfect run, or `solved` for Timeline).
  **A NEW GAME IS WIRED IN SIX PLACES AND FIVE OF THEM FAIL SILENTLY**: `PAGES.<key>`, the `valid` route
  list (a deep link that is not there simply goes home), `PAGE_META` (a missing row inherits the HOME page's
  title into the browser tab and every link preview), `DAILY_GAMES` (a game on the grid but not in that list
  is one the Clean Sweep badge and the daily chest claim without measuring), `GAME_NAMES` + `GAME_SET_WORD`
  (the played-today placard), and the tile plus its click handler in `PAGES.home`. `.claude/test-minigames.js`
  asserts all six, and asserts the sweep against **the tiles the home page actually paints** rather than
  against a list copied into the test, so a tenth game fails on the rule rather than on a stale copy of it.
  **ONE PLAY A DAY, AND THE GATE IS `gameLockedToday(root, key)`** (Aug 2026, on request). Every one of the
  nine is a DAILY game — its rounds are drawn once for today, its score is today's on the tile, the tile turns
  gold for a perfect run — and a **Play again** button under the results contradicted all of it: the set had
  been revealed answer by answer, so a second run was a run with the answers in hand, and the tile's figure
  came from whichever attempt went best. The three "Play again" buttons are gone, each results screen carries
  a `.tf-tomorrow` line saying when the next set arrives instead, and **each of the six `PAGES.*` calls the
  gate as its first act** — `challenge`, `truefalse`, `whosaid`, `chrono`, `thread`, and `findit`, where it
  goes in `PAGES.findit` rather than inside `PAGES.map` (that is the whole Atlas and knows nothing about
  daily games, and it is the only route into game mode). It renders an `emptyPlacard` naming today's score.
  **ITS MARK IS THE GAME'S OWN TILE ICON, NOT A HAN GLYPH** (Aug 2026, on a report: "the 'Played today'
  screen should not contain a Chinese character"). `GAME_NAMES` carried 选 / 真 / 言 / 序 / 紐 / 地 — the
  glyphs the game TILES wore back when Folio was a China deck, and which the tiles gave up for the
  line-drawn `ICON` marks when the site stopped being one. This placard kept its copy, and because it is
  what a reader meets EVERY day once they have played it was the last place on the site regularly showing
  a Chinese character to a reader of an English page — one that says nothing whatever about Timeline or
  Find it. **`ICON` therefore moved out of `PAGES.home` to module scope** rather than being copied: two
  tables of the same SVGs is how a tile and its placard come to disagree about which mark a game wears.
  `.placard .big` sizes an inline SVG to the same 54px square a character occupied and **thins the stroke
  from the tiles' 2 to 1.5** — at this size a 24-viewBox stroke of 2 draws 4.5px, which reads as a logo.
  The OTHER placards still carry Han glyphs (`emptyPlacard`'s "Coming soon" / "Not enough cards" branches
  inside the games); they are states a reader effectively never reaches, and they were deliberately left
  rather than swept up with this — say so if one is ever seen.
  **TWO GAMES HAD GROWN THEIR OWN LOCAL VERSION OF THIS RULE AND BOTH ARE NOW RETIRED**, which is the shape
  of a rule that wants stating once rather than six times: Timeline recorded the FIRST check and ignored
  later ones (it now takes ONE check — `.chrono-done` on the list stops the grips and the arrows, in JS as
  well as in CSS, and the check button is removed), and Find it called a same-day replay "practice" and
  recorded nothing (`gamePractice` is **deleted**, not left unreachable). **The cost is real and worth
  naming**: a reader can no longer re-read today's Timeline order or walk today's five places again. What is
  bought is that the figure on the tile is the answer they gave when they did not know the answers.
  Two smaller things went with it: the four "…try again" closing lines no longer invite a replay there
  isn't, and **`gameCapFirst`** capitalises Multiple Choice's options, its revealed answer and its summary
  (on request). That is DISPLAY only — `options`/`correct` are matched by identity elsewhere in the round —
  and it is `\p{L}`-anchored so a term opening on a numeral or a Han character is passed through rather than
  sliced through a surrogate pair. The study card makes the same move for the same reason and makes it in
  CSS (`.answer .val::first-letter`), which is not available to a text node inside a button.
  **TIMELINE'S ROWS TAKE IT TOO** (Aug 2026, on request): a row of that list is a heading naming the thing,
  not a word inside a sentence, and a good half of the deck's answers are common nouns stored lower-case.
  Applied at the one DISPLAY site (`.ci-name`) rather than in `chronoPool`, so the row is still tracked and
  compared by its card id and nothing downstream ever sees the capital.
  The home tile has **three daily states** (state classes set by
  `tile()`) — playing EARNS the colour: **unplayed** = a whisper of the tile's hue (a ~10% wash + hue-tinted title,
  theme colour only in the left bar, faint corner icon — `button.game-tile:not(.done):not(.won)`); **played today** (`done`, via
  `gamePlayedToday` — challenge/chrono still also derive it from `S.daily.lastPlayed` / `S.chrono.date`) = the tile FILLS with
  its theme colour (bright top-left → darkened far corner, dark icon, white text) + the green **✓ checkmark**; **perfect score
  today** (`won`, via `gameWonToday`) = a **shining gold** tile (`gt-gold-shine` sweeps a white band across the gold via
  animated `background-position`; icon/text darken; check stays). In **light mode** the filled (non-gold) tile skips the
  darkened far corner (`body:not(.night)` override). A played tile's tagline becomes **today's best score** ("4/5 correct!",
  chrono: "in order!") — `markGamePlayed(key, won, score, total)` stores `{s, n}` per day, `gameSub()` renders it. The
  Daily-review banner's CTA sits at the **bottom-left inside `.body`** (below the full-width xp bar), on mobile too. The **"Clean Sweep" achievement**
  (`sweep`, 🎯) unlocks when **every game on the grid is `won` on the same day** — nine of them since
  2026-08-09, `DAILY_GAMES` being the list and `allGamesWonToday` → `progStats().dailySweep` the test.
  **`won` IS A PERFECT SCORE, NOT A PLAY, AND THE BADGE'S OWN DESCRIPTION SAID OTHERWISE** until Aug 2026
  (on a report): `gameWonToday` documents `won` as a perfect run and `markGamePlayed(key, won, …)` is
  called with it, so the rule was always the stricter one — only the badge's `desc` and
  `maybeSweepChest`'s toast said "win". Both now say a perfect score, and **no scoring changed**. Check
  what a rule actually tests before changing it to match a description that misstates it. **The
  badge gets harder each time the grid grows, and that is deliberate**: it is the honest reading of "every
  game today", and the alternative is a sweep that means less every year. Nobody loses one they already
  hold, `checkAchievements` only ever adding. A perfect Multiple-choices run also increments `S.daily.wins`, which **revived
  the previously-dead `win1`/`win10` (Victor/Champion) badges** (`wins` was never written after the bot race was removed).
  `S.games` is in `defaultState()` (back-fills old saves) and `PROGRESS_FIELDS` (mirrors to the account).
  The grid is **3 × 3 since 2026-08-09**, Common Thread having taken the sixth slot earlier that month and
  the crossword, the picture round and What year? the last three; **`blankTile` survives unused** (a tenth
  game would leave a hole again) and reads "Coming soon / More games", having once been
  "Coming soon / —", which names nothing and looks like a tile that failed to load. Below 430px the
  tile type shrinks, or "Multiple Choice" breaks across two lines and its tagline across two more. The **Card-of-the-day tile carries the card's DECK** in its head
  row (`.cod-where` ← `cardLeaves(id)[0]` → `nodeWhere`) — the tile is a fixed height, so a short question left
  a band of nothing under it. Deliberately the deck and **not** the era: on a prehistory card the era is most
  of the answer.
- **COMMON THREAD — the sixth daily game, and the first built on the GLOSSARY** (`PAGES.thread` at `#thread`,
  the `PAGE: COMMON THREAD` block in app.js; Aug 2026, on request). Sixteen glossary terms in a 4×4 grid,
  four hidden groups of four, four mistakes to spare. It fills two gaps at once: the glossary is ~680 cited
  terms and was the largest curated body of content on the site that no game touched, and CATEGORISATION is
  the one study task the other five (recall, ordering, judgement, attribution, place) leave out.
  · **The puzzle is GENERATED from `GLOSSARY_TAGS`, so the game ships no content of its own** — and a tag set
    that groups well for the editor's filter bar does NOT automatically make a solvable puzzle. Three of the
    four rules exist because the naive version produced puzzles that cannot be solved while every group was,
    on the data, correct. **The broad tags cannot be groups** (`THREAD_BROAD` — `history` is on 427 terms and
    `place` on 314; a group indistinguishable from the rest of the grid is not a group). **One tag per family**
    (`THREAD_FAMILY`) — the first version paired an `africa` group with a `tanzania` one, which are disjoint
    tags and an unsolvable puzzle, because Laetoli is in Tanzania which is in Africa and nothing tells a
    solver which group wants it: **disjoint is not the same as distinguishable**, and only geography and
    period nest that way, which is why those are the two families declared. **A term may not be its own group
    label** (`Africa` inside `africa` gives the row away). **No two terms may share a word stem**
    (`threadStems`) — `Swabia` beside `Swabian Jura` reads as a pair whatever groups they are in.
  · **The disjointness is CHECKED, not assumed**: a term joins a group only if it carries none of the other
    three groups' tags, so all sixteen provably belong to exactly one group. Measured over 365 days before it
    shipped — **0 days fail to generate, 31 distinct group tags across the year, no duplicate or ambiguous
    term in any puzzle**. Re-run that sweep after a batch of glossary terms or a tag rename: the pool is
    derived, so new content silently changes what the game can build.
  · **A term needs ≥2 tags to enter the pool.** One with a single tag can be a red herring for nothing, and a
    grid of those is four obvious rows.
  · **…AND, SINCE AUG 2026 ON REQUEST, IT MUST BE A CARD'S ANSWER TERM RATED 1 OR 2** (`threadEasyKeys` —
    "it's currently too challenging"). The glossary is 836 terms and most of them are specialist, so a grid
    could ask a reader to group four words they had never met — which is a vocabulary test rather than a
    categorisation puzzle. `card.difficulty` is the rating that already exists for exactly this question and
    the pairing rule already gives every card's answer a term, so the pool is those answers resolved through
    `glossIndexFor("site")`'s **`byAnySurface`** (an answer is often the plural of its key) at or below
    `GAME_MAX_DIFFICULTY` — the same bar the other card-fed games draw under, read from the same constant.
    **THE RESTRICTION NEARLY BROKE THE GENERATOR AND THE FIX IS THE FINDING.** The pool falls from ~680 terms
    to ~90, so the four groups have far fewer tags to choose from: measured over 730 days, **271 of them
    produced no puzzle at all** — a blank page, silently, on more than a third of days. Two changes together
    took it to **0 blank days and 726 of 730 distinct grids**: `THREAD_GROUP_MIN`, the number of terms a tag
    needs before it can be a group, came down from 6 to **5** (measured at 6, 5 and 4 — 4 admits tags with no
    slack at all, and 5 is where the category count stops falling), and `dailyThreadPuzzle` **retries the
    seeded shuffle up to `THREAD_TRIES` (40) times** rather than giving up on the first arrangement that will
    not seat four disjoint groups. **A generator that works on a large pool can fail on a third of days when
    the pool is narrowed, and nothing on the page says so.** `test-minigames.js` guards the starved case on
    TODAY's grid (see its entry under Testing — and note that a 730-day sweep of this game is deliberately
    not committed, the resolution being the thing under test); the sweep quoted above was run against a
    browser page while the restriction was tuned, and is the check to repeat by hand after a change to the
    pool or a batch of glossary terms.
  · **Both the groups AND the grid order are date-seeded** (`hashStr`/`mulberry32`/`seededShuffle`, as the
    other games seed their rounds), so a reload cannot reshuffle a puzzle the reader is half way through.
    Shuffle is the reader's own control and is deliberately unseeded.
  · **A solved term opens its glossary popup.** The reader has just been shown a word they may not know, and
    the definition is the point of playing on the glossary — which also means playing genuinely counts terms
    towards the account page's "Glossary terms opened" meter, since `openGlossWin` marks them seen.
  · **"One away"** is counted over the four submitted, so it can only ever report a genuine 3-of-4. Without it
    a wrong guess teaches nothing, which is most of the texture of a grouping puzzle.
  · `won` (the gold tile) is **solved with NO mistakes**; `score` is groups found, out of 4.
- **CROSSWORD — the seventh daily game, and the first whose CLUE IS A CARD'S OWN QUESTION** (`PAGES.crossword`
  at `#crossword`, the `PAGE: CROSSWORD` block in app.js; 2026-08-09, on request). Nine entries clued from
  the cards' answer terms. It needed no authored content at all, and that is the point of it: a Folio
  question is already a fill-in-the-blank clue with the answer taken out of the middle, so the crossword is
  the study deck read sideways — the same 28-word clue the study card asks, answered a letter at a time.
  · **FOUR RULES DECIDE WHAT MAY BE AN ENTRY, and three are about the ANSWER rather than the clue.**
    **ONE WORD ONLY** — a crossword entry is an unbroken run of letters, so `cist grave` and `control of
    fire` would have to be run together into CISTGRAVE and CONTROLOFFIRE, which a solver cannot enumerate
    and would not recognise as the term they studied. Measured over the shipped deck: **134 of the 381
    answers are single words of a usable length**, far more than a nine-word grid needs. **FOUR TO ELEVEN
    LETTERS** (under four there is nothing to cross; over eleven the grid outgrows a 390px phone).
    **THE ENUMERATION IS SHOWN** — `(9)` beside each clue — because `xwNorm` drops diacritics and hyphens,
    so `Cro-Magnon` is entered CROMAGNON; that is the ordinary crossword convention and it is what makes
    the dropped punctuation honest rather than a trap. And **THE LETTERS KEY THE POOL, NOT THE ID**, or two
    answers normalising alike would be two clues to one entry.
  · **`repeat(N, minmax(0,1fr))`, NEVER a bare `1fr`.** A grid item's automatic minimum is its content's,
    and the content of a square is an `<input>` — about 150px of intrinsic width — so with `1fr` the
    thirteen tracks each claim that much, the board runs to some 2,000px and hangs off the side of a phone.
    It reads as a board too big for the screen rather than as a sizing rule that never fired, and it
    shipped that way for an hour. `.xw-sq` / `.xw-block` / `.xw-cell` carry `min-width:0` with it.
  · **IT MARKS ITSELF AS IT IS FILLED, AND THERE IS NO CHECK BUTTON** (Aug 2026, on request — it was a
    single "Check the grid" that scored the board, filled every wrong square in and locked the lot). The
    moment an entry's last square is typed it is judged: right, it turns green and its squares lock;
    wrong, it turns red and every square of it can be typed over. Since nothing is ever revealed, nothing
    is spent by coming back — so **THE GRID STAYS OPEN ALL DAY** (`gameLockedToday(…, {untilSolved:true})`,
    the letters kept in `XW_KEY`, device-local like the marker's position) and **the only way to lose is
    for the day to end with an answer still missing**, which is the whole shape of the request. Four
    things hold it up and each fails silently.
    **THE MARKS ARE DERIVED FROM THE WHOLE BOARD, never toggled square by square.** A crossing square
    belongs to TWO entries, so anything marking one entry at a time has to answer for both at once and the
    square ends up carrying whichever verdict ran last; `evaluate()` recomputes every square from the
    letters on the board instead, so a crossing shared by a solved entry and a wrong one is GREEN — the
    letter is right, and it is the other entry's remaining letters that are not. (The old check had the
    same fault in its worst form: it marked and filled in one pass, compared each crossing against the
    letter it had just written itself, and every crossing came out marked wrong AND right at once — 65
    squares yielding 65 `bad` and 10 `ok` — **with the SCORE correct throughout**, since that ran in an
    earlier pass.)
    **A SOLVED ENTRY'S SQUARES ARE LOCKED** (`readOnly`), which is what stops a reader typing away a
    crossing letter they have already earned and is also what makes the marking stable: a green entry can
    never become ungreen, so the derivation cannot oscillate.
    **THE SCORE IS WRITTEN UP AS IT RISES**, through `markGamePlayed`'s new `progress` flag — a grid
    abandoned at four still reads four on the tile, and the flag is what keeps the LIFETIME tally at one
    play and one win for the day however many times the score changes.
    And **"Clear the wrong letters" is not a shortcut for anything** — a red square can simply be typed
    over — but it says outright that red is erasable, which the old check (whose red squares were the
    final verdict, filled in and locked) had taught a reader it was not. It appears only while there is
    something red to clear, and touches nothing else.
  · **A SOLVED SQUARE IS OUT OF THE TYPING PATH ENTIRELY, AND THE CARET JUMPS ON** (`xwLocked` / `nextOpen`,
    Aug 2026, on request). Locking a square stopped it being TYPED into and left it a tab stop the caret
    still walked through, so filling a crossing word meant stepping over letters already earned; and
    finishing an entry left the caret sitting on its last square, so the reader picked the next clue by
    hand every time. **One predicate answers both** — `xwLocked(r,c)` is consulted by `step`, by `go`, by
    `focusEntry` and by a `focusin` redirect (a CLICK is the one path no movement rule can intercept), so a
    fifth way of reaching a square added later is covered by the same rule rather than by a fifth copy of
    it; a locked cell also gets `tabIndex = -1`, which is what takes it out of the keyboard order as well as
    out of the arrows. Completing an entry then calls `nextOpen`, which finds the next entry still holding
    an unsolved square **and wraps**, so the last clue on the board leads back to the first rather than
    stopping dead.
  · **A REVEALED LETTER IS RED, NOT GREEN** (Aug 2026, on request). Green is what a solved entry paints and
    what locks a square against being typed over — it means "you got this" — so painting the whole board
    green on a give-up told the reader they had answered a grid they in fact gave up on, and took away the
    one thing they want to see afterwards: which letters were theirs. What each square WAS is read BEFORE the
    answers are written over it, so a square whose own letter already matched stays green and every square
    that was empty or wrong turns red; the clue rows keep their tick only where the reader earned it. The
    whole square goes red for free, `.xw-sq:has(.xw-cell.bad)` already washing it.
  · **AND A GIVE-UP BUTTON REVEALS THE ANSWERS, WHICH HAD TO BE RECORDED** (`xwGaveUpToday` / `xwMarkGaveUp`,
    same request). The letters go into the very store the grid is restored from, so a revealed board reads
    back on the next visit as a board somebody filled in — a perfect score, a gold tile and a lifetime win.
    The flag therefore lives in the day-stamped record beside the letters, `markGamePlayed` is called with
    the score as it stood, and `PAGES.crossword` turns the day away at the top with a placard rather than
    letting a solved-looking grid be reopened. **A reveal is not a score, and nothing but a flag can tell
    the two apart afterwards.**
  · The layout is the ordinary greedy crossing search under a seeded RNG, best of `XW_TRIES` word orders,
    scored on **most words placed and then tightest bounding box** — a grid that crosses once per word
    strings out into a chain, which is a word list rather than a crossword. Its adjacency rule (an empty
    square may not touch anything sideways) is what stops parallel entries forming words nobody clued;
    `.claude/test-minigames.js` re-derives every maximal run on the board and demands each one be a clue,
    which is the only check that can see that rule going.
  · **MEASURED OVER 730 DAYS BEFORE IT SHIPPED, and the check is committed rather than thrown away**
    (`simulate` in `.claude/test-minigames.js`, which slices the generator out of app.js and stands it on
    the real `data.js` with no browser at all): **not one blank day, all nine entries every day, no grid
    over 13 squares a side, 730 distinct grids, and no unclued run or unnumbered entry anywhere.** A
    generator can be flawless on the day it is written and degenerate on a date nobody tried, which is what
    a one-day browser test cannot see.
- **PICTURE ROUND — the eighth daily game** (`PAGES.picture` at `#picture`; 2026-08-09, on request). Five
  pictures, four options each, drawn **from the ARTEFACTS and from nothing else** since Sep 2026.
  · **IT WAS EVERY ILLUSTRATION FOLIO HOLDS UNTIL THEN** — a card's `image`, a glossary term's
    `GLOSSARY_IMAGES` entry, an artefact's — and the request that narrowed it ("The game 'Picture round'
    should only use pictures from artefacts") settles an argument the game had been having with itself
    since it shipped. A card's or a term's picture ILLUSTRATES its subject; it does not necessarily DEPICT
    it. A hand-axe under `Acheulean`, a temple under `Classical antiquity`, a flag under a country: each
    is a perfectly good illustration and none of them is a question. Two filters had grown up around that
    — `PIC_ABSTRACT_KINDS`, a declared list of kinds whose pictures can only exemplify, and the difficulty
    bar reaching past the cards into the glossary through `threadEasyKeys()` — and both are **deleted**
    with the halves they were guarding. An artefact needs neither: it is a photograph of one object, the
    object is the answer, and there is nothing to rate or to except. "Does this picture depict its
    subject?" is now answered by which table it came out of.
    **What it costs is the pool's size**, 157 subjects to 99 — an order above `PIC_MIN_POOL` (8) — and
    what it buys is a game where every round is the same kind of question.
    **The decoys had to be re-derived**, since an artefact is filed under no tags at all. Two are built
    from what it does carry: an ERA bucket off `artefactYear` (prehistory / antiquity / medieval /
    modern), which does the work — a Roman sword is answered against other objects of antiquity rather
    than against a medieval crown — and its `origin`, which matches only where two objects really share
    one, most origins being a find-spot and a museum and so unique. That costs nothing and is honest;
    inventing a taxonomy for a hundred objects would not be.
  · **THE REVEAL IS THE ARTEFACT'S OWN PLATE, MINUS THE PLATE** (Sep 2026, same request: "below it should
    show that Artefacts background paragraph with citations"). The paragraph used to be the same prose
    with every `<sup class="fn">` stripped out, because the reveal had nowhere to put the works they point
    at. It carries its `sources` beside it now and the reveal renders `sourcesHTML` under the prose with
    `wireFootnotes` over it — so the markers number themselves, the works link, the access chips show and
    the jump works both ways, with no wiring of this game's own.
    **The SUMMARY screen strips them** (`picNoteBare`). There is no source list there — five artefacts'
    lists under a score would BE the page — and a marker with no entry behind it prints its own digit
    through `sup.fn:empty::before`, so leaving them in would set stray numerals through five paragraphs
    pointing at nothing. `wireFootnotes` removes such a marker where it runs; this is the same answer one
    step earlier.
  · **AND THE PICTURE ENLARGES, BUT NOT BEFORE THE ANSWER IS OUT** (same request). It calls
    `openImageViewer` directly rather than earning the `.card-img` class the delegated listener watches
    for, and that is not a shortcut: `.card-img` carries a fixed 16:9 frame and a `height:100%` on the
    picture inside it, so adopting it at the reveal would RESHAPE the picture the reader is looking at — a
    crop and a jump at the exact moment they are told what they were looking at. The frame keeps
    `.pic-frame`'s own shape and gains only `.pic-open`: a cursor, the zoom mark and a tab stop.
    It is held back for the same reason the caption is, rather than for tidiness — the viewer's meta bar
    carries the title and the credit, and both name the subject, so a frame that opened before the guess
    would hand the answer over in one tap.
  · **A ROUND ANSWERED STAYS ANSWERED** (Sep 2026, on a bug report: "halfway through the minigame i could
    go back to the home page, re enter the game, and start from the first question again and get it right
    this time"). Every daily game is played once, and this one held its place in a CLOSURE — so leaving the
    page threw it away, and the one-play lock, which is only set when a run FINISHES, had nothing to say
    about a run abandoned half way. `setGameProgress` writes the answered rounds to `S.games.picture.prog`
    — the row that already holds today's date, score and lock, is already a `PROGRESS_FIELD` and so
    already syncs. Four decisions in it: it is written **before the reader can press Next**, since the
    reader who never presses it is the whole case; it holds the **outcomes rather than an index**, so the
    round to resume at and the score already earned cannot come apart; the row's **own `date`** scopes it,
    so yesterday's can never be read as today's; and it is **cleared when the run ends**, where the lock
    takes over — a `prog` left behind would be a resume point inside a finished run. A reader who answers
    all five and never presses "See results" comes back to the results, which is `renderEnd` on a resume
    index that has run past the last round.
    The helpers are general (`gameProgress` / `setGameProgress`, beside `gameLockedToday`); only the
    picture round uses them so far, and a second game adopts them in three lines.
  · **THE CORPUS GAP IT SHIPPED INTO IS CLOSED** (2026-08-09, later the same day). It went out with one
    picture in the whole of Folio — `data.js` had a single card image, `glossary.js` had no
    `GLOSSARY_IMAGES` table at all — so the game could only show its placard, which was recorded here as a
    CONTENT gap rather than a wiring one. The picture pass (see `.claude/fetch-images.js` and friends in the
    File map) took it to **300 card images, 684 glossary images and 92 artefact images**, far past
    `PIC_MIN_POOL` (8), so the game now deals real rounds from all three kinds. The lesson worth keeping is
    that the game was built BEFORE the content and the gap was written down — which is why closing it
    needed no change to the game at all.
    **ITS TEST HAD TO LEARN THE SAME THING**: the planted pool used to be ten entries ADDED to the table,
    which was only ever the whole pool because the table was empty. It now REPLACES `GLOSSARY_IMAGES` and
    clears the card and artefact pictures, so the seeded draw is deterministic at any corpus size.
  · **THE TITLE, DESCRIPTION AND CREDIT ARE HELD BACK UNTIL THE GUESS IS IN.** Every one of them names the
    subject and the credit is usually a URL that spells it out, so showing any of them early leaves a game
    that works perfectly and teaches nothing — the one failure here nobody would report. The `alt` is
    deliberately generic for the same reason. `test-minigames.js` asserts the page contains none of the
    three before a choice is made.
  · The decoys are other real subjects from the same pool, which is Who said it?'s rule: three plausible
    wrong answers teach something, three obvious ones teach nothing.
  · **…AND SINCE AUG 2026, ON REQUEST, THEY ARE RANKED BY KINSHIP RATHER THAN DRAWN AT RANDOM** ("ensure the
    answers are as much as possible of the same categories, like in multiple choice, so increase the
    difficulty"). Multiple Choice has scored its distractors on shared tags since the card-tags pass, and
    that scorer is now `tagKinship(ta, tb)`, lifted out of `cardKinship` so both games read one
    implementation — the kind is worth four subject areas, and the score is capped when the kinds differ.
    A picture therefore carries its subject's TAGS into the pool and the three decoys are the closest
    three, so a stone industry was answered against three stone industries rather than against a cave, an
    ice age and a fossil. (Written when the pool was cards and glossary terms, whose tags come from
    `card.tags` and `GLOSSARY_TAGS`; since Sep 2026 the pool is the artefacts, whose tags are derived —
    see the era bucket above. The scorer is unchanged.)
    **WHO SAID IT? TAKES THE SAME RULE ON ITS OWN AXIS** (`buildWhoSaidRounds`, same request), which is a
    `cat` field added to all 64 entries in `quotes.js` — five families (philosophy, statecraft, science,
    reform, letters). A speaker is not a card and has no tags, so kinship there is simply the category, and
    the round prefers three speakers of the same one before falling back to the rest of the pool. **The
    categories are read off the RAW `window.QUOTEGAME`**, not off the localised copy: `quoteLocalized` may
    return a translated entry with no `cat` on it, so keying on the localised object would silently drop
    every round back to a random draw the day translations resume.
  · **`mediaCreditHTML` is shared with the fullscreen viewer** rather than copied, or the two would come to
    disagree about whether a credit is a link. A dead `src` marks its frame (`.pic-dead`) instead of asking
    the reader to name an empty box — a certainty rather than an edge case, there being no upload path.
- **WHAT YEAR? — the ninth daily game** (`PAGES.whatyear` at `#whatyear`; 2026-08-09, on request). Five
  events from one year, and a timeline to put that year on. It is worth saying how it differs from Timeline:
  **that one gives five different years and asks for their ORDER, this one gives five things from ONE year
  and asks what the year was.** Ordering needs no absolute knowledge at all — a Timeline puzzle is solvable
  knowing only which came first — and this cannot be solved without it.
  · **IT LEFT THE CARDS IN AUG 2026, on request** (`wyPool`, `whatyear.js` — the reasoning is in that file's
    map entry). It was built on `chronoPool` and the cards were the wrong material twice over: a card names
    a TERM where this wants an EVENT, and the game needs five things sharing one exact year, which a corpus
    of terms almost never supplies — 19 years of 409 cards carried five, and once the minigames were
    narrowed to well-known terms **exactly one** did. `wyPool` hands back `chronoPool`'s own
    `{ id, name, year }` shape, so nothing downstream of it changed.
  · **THE RAIL IS A LATTICE, NOT A CONTINUUM**, and the whole game turns on it. The pool reaches back to
    conventional round figures rather than calendar dates, and a free-dragging picker over a range
    running from 3.3 Mya to the present would be a pixel lottery in which no guess is ever exactly right. So
    the rail carries `WY_TICKS` (33) ticks a round `step` apart, the answer sits on one, and a guess is right
    or wrong with nothing in between.
  · **`wyStep` CAPS THE SPAN, and the first cut did not.** It took the largest divisor leaving four ticks,
    which for a Late Bronze Age puzzle gave a step of 100 and therefore a rail running **1600 BCE to 1600
    CE** — every clue naming a Mycenaean palace and half the rail the Renaissance. Capping at `|year|` keeps
    the rail as precise as the date it asks about: 800 years around 1200 BCE, 1.6 My around 2.6 Mya, 32
    years around a date given to the year. It also means **a BCE answer's rail can never reach across 0**,
    which is what stops a tick reading "0 CE", a year the calendar has not got.
  · **The answer is NOT at the centre** — its tick is seeded, `WY_EDGE` in from either end — or the midpoint
    would be the answer every day.
  · **It is a native `<input type="range">`**, which snaps to the lattice for nothing and is the one control
    the browser already gives arrow keys, Home/End and a drag to. The same call the Text size setting makes
    about the same problem.
  · **A WRONG GUESS NARROWS THE RAIL** rather than merely being marked: told "too early", the range's own
    `min` moves past the guess, so three tries are a real search. The ruled-out span stays DRAWN, greyed
    (`.wy-out`), so the scale does not silently change under the reader between guesses.
  · **THE ANSWER ROTATES; IT IS NOT DRAWN AT RANDOM** (`wyRotation`), and this is the subtlest thing in
    the three games. The pool holds only so many years carrying five events — 15 — so a year WILL come round
    again; what a random draw adds is clumping — measured over 365 days, one answer landed 28 times against
    another's 16, with nothing to stop two falling in the same week. The years therefore lie on a ring and
    the day walks one place along it. **The ring is TURNED between cycles rather than reshuffled**, because
    a fresh shuffle bounds nothing: the year closing one cycle can open the next or fall second in it, and
    a first attempt that guarded only the JOIN still let a repeat land **two days apart**. Turning by `r`
    moves every year exactly `n - r` days later than last time, so capping `r` at `n - ceil(n/2)` floors
    every gap at half a cycle while the order still changes. `wyRotation` is cumulative for that reason
    (cycle c's ring is defined against c-1's) — a few hundred short hashes, once per page open. **Measured
    over 730 days: 48–49 turns each on the 15-year pool, and the closest repeat 8 days apart.** A rule
    about a WINDOW cannot be enforced by a rule about one boundary — `quoteRunningOrder`'s lesson in
    miniature.
  · **THE HONEST LIMIT, visible to a reader who plays for a fortnight**: **15 years** is the whole pool, so
    a year comes round about that often. The five events are drawn separately from however many that year
    has, so a repeat is at least a different puzzle — which is why a year already carrying five is still
    worth a sixth and a seventh — and the cycle lengthens with every year added to `whatyear.js`.
  · `score` is the guesses left when it landed (3/2/1, `total` 3 — Common Thread's precedent for a total
    that is not 5); `won`, and the gold tile, is first go.

## The day's draw is the same draw for everyone (Aug 2026, on a bug report)

> "When playing the True or False minigame, I'm seeing different questions than another user. Every user
> should see the same minigame questions every day in the same order so comparing stats actually makes
> sense."

Six of the nine were already seeded off the day — Timeline, Common Thread, Find it, the crossword, the
picture round and What year? all build their set from `mulberry32(hashStr("<game>-" + todayStr()))`.
**Multiple Choice, True or False and Who said it? drew through `pick`, which is `Math.random`**, so every
reader got a private quiz. That is fine for a game played for its own sake and wrong for these three,
because the whole surrounding apparatus treats the result as comparable: the score is written to the tile
as TODAY'S, the tile's own record card shows it beside a site-wide average for the day, and a friend's
account shows theirs beside yours. Two readers comparing 4/5 against 3/5 were comparing two different
tests, and nothing on either screen said so.

**`dayPick(key, arr, n)` is `pick`'s seeded twin** — same signature, same Fisher–Yates, with the day
standing in for the entropy — so each call site changed by the name of the function and a key. It lives in
the ONE PLAY A DAY block beside `gameLockedToday`, which is where the rest of the daily-game plumbing is;
`hashStr` / `mulberry32` / `seededShuffle` are function declarations further down the same IIFE and hoist,
so the three games above them can call it.

Four things about it are decisions rather than plumbing.

**The key names the DRAW, not the game.** A round draws its questions and then its options, and two draws
handed the same seed shuffle in step — which on a four-option round means the right answer lands in the
same position in every round of the day. So every draw carries its own suffix (`challenge`,
`challenge-d-<id>`, `challenge-o-<id>`).

**A per-round key carries something stable about that round, never its position.** `challenge-o-<card id>`
and `whosaid-o-<pool index>`, not the round number: a key built on position moves every later round's
options the day an earlier card drops out of `gameCardIdSet`, which would look like the seeding not
working rather than like the pool changing. Who said it? draws its rounds as POOL INDICES for exactly this
reason — `it.who` is the LOCALISED speaker name, so keying on it would deal a Spanish reader different
decoys from an English one, which is the same bug one language over.

**Day-to-day variety is kept; reader-to-reader variety is what goes.** Multiple Choice deliberately
shuffles its distractor candidates before the stable kinship sort, so a card with several equally-close
siblings does not offer the same three every day. Seeding that shuffle on the day keeps all of it — the
draw still turns over at midnight, it just turns over identically for everybody.

**It is seeded on the READER'S own day** (`todayStr` → `dayKey`), not on UTC. That is the same boundary the
one-play-a-day lock, the streak and every other per-day record use, so a reader whose day rolls at 3am gets
yesterday's set until then and gets it consistently with their own lock — rather than being shut out by the
gate from a set they had never been shown. The consequence to state plainly: two readers on opposite sides
of the date line are a day apart, as they are on every other daily thing on the site. What the fix
guarantees is that **everyone sharing a date shares a quiz**, not that the planet turns over at once.

One thing was NOT seeded and should not be: Common Thread's **Shuffle** button (`tiles = pick(tiles)`). That
is the player jumbling their own board mid-puzzle, not a draw.

The failure is silent from every angle — each reader's game works perfectly, deals five well-formed rounds
and scores them correctly — so nothing but two people talking to each other could have found it, and
nothing but a check that the same date twice yields the same set can keep it fixed.

## Find it: a tap selects, a button commits (Aug 2026, on request)

> "In the Find It minigame, clicking a country shouldn't immediately guess, but only selected before the
> user should click a confirmation button. At the end of that minigame it says x/5 questions correct, but
> it only counts answers that were correct first-try — second and third guesses should still count if they
> were correct."

Two faults in one report, and they compound: a guess could be spent by accident, and the score then
punished you for it.

**The tap was the answer, and a tap on a globe is not a confident gesture.** The reader has spent the
whole round dragging and pinching that same surface; the target may be four pixels wide at the zoom they
happen to be at; and there was no way to look closely at a place, because the tap that brought you to it
was your guess. `gameTap` now only ever PICKS — it lights the place in a blue that is none of the game's
three verdict colours, names it on the button ("Guess Chad"), and waits. `gameCommit` is the old function
from the judging line down.

Four things about the split:

- **A pick is replaceable and withdrawable.** Tapping elsewhere moves it; **Clear** takes it off. A mis-tap
  therefore costs nothing at all, which is the entire point.
- **It is a `gameMarks` entry, not a fourth highlight mechanism.** The pending mark is painted, replaced and
  cleared by the same list that already carries the wrong guesses and the revealed answer, so nothing had to
  learn a new kind of mark and a pick can never outlive its round. `gameClearPick` is the one function that
  knows what clearing means — the polygon mark, the point pin and both buttons.
- **A capital round needs a pin rather than a tint**, since a point guess has no polygon to fill. Drawn
  hollow in the pick blue: a crosshair, not a mark.
- **From the keyboard, Enter picks and Enter again confirms.** Aiming with the arrows and then having to Tab
  out of the globe to reach a button would make the accessible route the slow one; two presses of one key is
  what the mouse does with two clicks.

**And `gameFound` is the score now, where `gameFirstTry` was.** "4 / 5 found on the first try" is a true
sentence about a figure nobody could see being computed that way while they played — the running counter
beside the round number just said "points", so a reader who found four places and was told they scored two
read it as the game losing an answer. The headline is what was FOUND, at whichever attempt; the first-try
tally survives as a second line on the results, said only when it differs from the score, since "5 found,
5 of them first try" is the same sentence twice. A perfect run is now five found rather than five found
cold, which is a real loosening and the one the request asks for.

**Note the round still allows two tries, not three.** The report says "second and third guesses", which
describes what it counts rather than how many there are; nothing was asked about the number of attempts and
it is unchanged. With a mis-tap no longer able to spend one, two is a more forgiving allowance than it was.

**Its test section is the first coverage this game has ever had**, which is how a score that disagreed with
the reader's own arithmetic went unremarked. The target has to be HUNTED rather than computed — the rounds
are built inside the Atlas closure and turning a lon/lat into a screen point needs the globe's rotation and
zoom, neither reachable from outside — so the board is swept and the confirm button read, it being exactly
the readout this change added. About 850 clicks sweep a hemisphere in eleven seconds, and the globe is spun
a quarter turn and swept again when the day's target is on the far side. It fails rather than skipping when
the target is never found: a hunt that quietly gives up is a test that passes on the day the feature breaks.

## A round ends on something learned (Aug 2026, on request)

> "The games Picture Round and Multiple Choice don't offer any explanation for why that answer is correct
> or about the answer, so the user doesn't learn from it."

True of both, and it is the one complaint a quiz game cannot shrug off. True or False has printed a `why`
since it shipped, Find it opens the place's own Atlas panel, Timeline reveals every date, the crossword's
clues are the cards' own questions — those two named the answer and moved on.

**The explanation is the answer term's glossary entry**, and reaching for that rather than authoring a new
field is the whole of the design. It is three sentences, impartial, self-contained and written to be read
away from any particular card — which is exactly the brief here — it is already cited at the bar, it is what
a reader meets by tapping the term anywhere else on the site, and the card→glossary pairing rule guarantees a
card ships with one for its own answer. Nothing to author, nothing to keep in step: a term corrected in the
glossary is corrected here.

**A card's own abstract was the obvious alternative and is the wrong one.** Ten sentences and about 300 words
is a wall of prose between a guess and the next round, so it would have to be cut to its first sentence — and
splitting a sentence off English prose is what `split-abstract.js` exists for and needed a dozen guards to get
right (initials, `c. 2600 BCE`, abbreviated binomials, a sentence closing on a quotation). A three-sentence
field that needs no splitting beats a 300-word one that does.

**Where there is no term, nothing is shown** — never a manufactured sentence. `fallbackSentence` would
happily produce *"X is a person, place, or concept referenced in this card's background"*, which teaches less
than silence while reading as though the site had something to say. Measured over the shipped corpus: 223 of
the 231 cards the games can deal carry a term, so the silent case is about 3% and shrinks as the pairing rule
is applied.

**The Picture round had a description all along and it describes the PICTURE, not the subject** — which is
why the complaint is right about a game that already printed a paragraph. `desc` is the image's own caption
("Delineations on pieces of antler. Public domain, via Wikimedia Commons."): it says what is in the
photograph and nothing whatever about what the thing is. The reveal now reads *what it is called* → *what it
IS* → *what this picture shows*, the third line quieter than the first, since a caption set as loud as the
title reads as a second title. An **artefact** resolves to no glossary term and gets its own plate
description instead, that being three to five sentences about the object already.

`gameAnswerNote` lives beside `dayPick` in the daily-game plumbing and resolves through `byAnySurface`, the
map built for the question "which term is this card's answer?" — the same door Common Thread and the picture
pool already use, so a deck's own term is excluded here as it is there. It emits HTML through `sanitizeHTML`
rather than escaping (a description carries `<i>` on a work's title) and strips footnote markers, a
superscript number with no list under it pointing nowhere.

## A tile turns over to its record (Aug 2026, on request)

> "When long-pressing a minigame tile on the home page, the tile should flip around and reveal the user's
> general stats and site-wide average statistics for that minigame that day."

**The gesture was free.** `wireHoldMenu` already classifies a hold and is used by the deck rows and the
review banner, so a hold here is classified exactly as a hold there — and a tap still opens the game,
because the document-level guard that swallows the click after a hold is the same one. The tiles are wired
in ONE walk over `.game-tile[data-game]` rather than nine `querySelector` lines, so a tenth game is wired
by putting it in the grid and nothing else.

**The back is an element inside the button, not a second button.** The tile is already a `<button>`, and a
control inside a control is exactly what forced the review banner's own "+ New group" out of it.

### What the site-wide half can say, and why it needed a schema block

`S.games[key]` is device-local and `progress` is RLS-scoped to its owner and their accepted friends, so
**there is no way to average across readers from the tables the site already had** — the same wall the
Edit page's Dashboard states in prose about site-wide study figures. Section 15 of
`.claude/supabase-schema.sql` adds a pooled counter of exactly the shape the community card rating uses:

- `game_stats` — `(day, game)` primary key, four integers, **public to select and with no write policy at
  all**, so RLS's deny-by-default makes it read-only to every client;
- `bump_game_score(g, score, rounds, won)` — `security definer`, which clamps the score to the round count,
  the win to 0 or 1 and the game key to `^[a-z]{3,16}$`, and stamps the SERVER's UTC day. The worst a
  client can do is add one honest-shaped play.

**The day is the server's UTC day, not the reader's.** A reader sets their own boundary (`dayKey`), so two
people finishing the same daily game can disagree by up to twelve hours about which day it was — and a
counter that took the caller's date could be moved onto any day by a client that lied. The tile says
"Everyone, today" without claiming it is the reader's own day, which is what makes it honest.

**A project that has not run the block says so in a sentence.** `_gameStatsOff` latches on a 404, exactly
as the card statistics do, and the column reads "Site-wide figures aren't collected on this site." rather
than showing a zero, which would read as "nobody played". A fetch that merely FAILED gets a **different**
sentence — claiming a site does not collect a figure because a connection dropped is a claim made out of a
dropped connection.

Only a FINISHED run is posted: `opts.progress` marks a game reporting itself mid-play, and counting those
would make "plays" a count of rounds.

### The flip is 2D, and that is forced rather than preferred

The badges' flip is a 3D `rotateY` between `.badge-front` and `.badge-back`, and it cannot be reused here:
`.game-tile` carries `overflow:hidden`, and **an element with a clipped overflow is flattened to
`transform-style:flat`** — so the back would paint mirrored and unreadable. Two `scaleX` squashes about
opposite origins (the face collapsing to its left edge, the back opening from its right) read as one card
turning, at one duration and one easing.

**The two halves swap `aria-hidden`.** The face is hidden by a transform, which a screen reader cannot see,
so without that a flipped tile would read out its front and never the record it had just been turned over
to show.

Two smaller things. The back is filled **before** the class lands, so nothing is seen half-drawn
mid-rotation, and the site figures are dropped in when the fetch settles — guarded on the tile still being
flipped and still in the document, since a reader can turn it back or leave the page. And wrapping the
front in `.gt-face` broke two theme rules that used `>` on the tile's children; both now match the wrapped
and the unwrapped form, because `blankTile` (the grid's spare slot, unused since Common Thread took the
sixth tile) still puts them directly on the tile.
