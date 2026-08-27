# Card difficulty, and terms that do not happen at a time

**Read this before touching `cardDifficulty` / `difficultyOK` / `gameCardIdSet` / `GAME_MAX_DIFFICULTY`
/ `cardUndatable` / `chronoPool` / `cardStartYear`, `.claude/add-card-difficulty.js`,
`.claude/mark-undatable.js`, or before rating a batch of cards.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary — the 1–5 scale, that it rates the
WORD rather than the card, `gameCardIdSet()` as the one door every card-fed game goes through, and
`undatable` as Timeline's own second filter. This file carries the rest: the scale's five rungs with
their examples, why an unrated card is treated as too obscure, the community rating that supersedes the
editorial one once a card has enough answers, the stars and the two `body.hc` findings they forced, the
crossword draw cap that had to scale with the pool, and the test that could not see the study card at
all.

- **CARDS CARRY A DIFFICULTY, AND THE MINIGAMES DRAW UNDER IT** (`card.difficulty`,
  `CARD_DIFFICULTY_MIN/MAX`, `GAME_MAX_DIFFICULTY`, `cardDifficulty()`, `difficultyOK()`, `gameCardIdSet()`;
  Aug 2026, on request). An integer **1–5 rating HOW WELL KNOWN THE ANSWER TERM IS to the general
  population** — not how hard the card is, which is a different question and conflating the two is the one
  way this scale stops meaning anything. **Every shipped card is rated** (29 / 63 / 129 / 141 / 138 across
  the five rungs at 500 cards, so 92 sit at or below the games' bar — **count them rather than quoting
  that**, which said 409 and 58 for months: `node .claude/test-difficulty.js` prints the distribution).
  · **THE SCALE** (stated identically in app.js, `.claude/add-card-difficulty.js`, `add-card.js` and here —
    keep the four in step): **1** household name, almost any adult would recognise it (Stone Age, Homer,
    Sparta, Neanderthal); **2** generally familiar, an ordinary secondary education reaches it (Neolithic,
    Knossos, phalanx, Lascaux); **3** known to the interested, a reader who follows history (Linear B,
    hoplite, helots, Clovis culture); **4** specialist, mostly met inside the subject (Gravettian, megaron,
    bucchero, Kamares ware); **5** highly obscure, named in the scholarship and almost nowhere else
    (`qa-si-re-u`, Nichoria, Howiesons Poort, Iguvine Tables). **Rate the WORD a stranger would be shown**:
    a subtle card about `Homer` is still a 1, and a beautifully clear one about `qa-si-re-u` is still a 5,
    because a reader who has never met a word cannot be eased into recognising it by prose.
  · **WHAT IT IS FOR is the daily games, and STUDY IS UNTOUCHED.** A study card arrives with three hundred
    words of background behind it and comes back tomorrow if you miss it, so an obscure term there is the
    point of studying. A minigame deals the term COLD — four options, a crossword square, a picture — and a
    pool holding `qa-si-re-u` and `Howiesons Poort` deals unanswerable rounds. Every card is studiable, in
    every deck, at every rating; `availableCardIdSet` knows nothing about difficulty and must not learn.
  · **`gameCardIdSet()` IS THE ONE DOOR, and that is the point of it being a function.** It is
    `availableCardIdSet()` narrowed by `difficultyOK`, and **every card-fed game goes through it** —
    Multiple Choice, Timeline, the Crossword and the card half of the Picture round. A sixth game added
    later reaches for this instead of `availableCardIdSet` and is covered without anybody remembering the
    rule; `test-difficulty.js` reads each pool function out of app.js and asserts there is no other path.
    It filters the **distractors** as well as the answers: a round whose wrong options are `lawagetas`,
    `qa-si-re-u` and `damos` is answerable by elimination and teaches nothing.
  · **AN UNRATED CARD IS TREATED AS TOO OBSCURE, deliberately.** Erring the other way would let one unrated
    card deal a round nobody can answer, silently. The cost is that the failure is silent in the other
    direction too — a card arriving unrated simply stops appearing in the games, with nothing on screen to
    say so — which is why `add-card.js` REFUSES a new card without a rating rather than defaulting one, and
    why `test-difficulty.js` asserts the whole corpus is rated on every run.
  · **THE PICTURE ROUND IS PARTLY FILTERED and the limit is stated rather than hidden**: its pool reaches
    past the cards into the glossary and the artefacts, and `difficulty` is a card field, so those two enter
    as they always did. Rating the 836 glossary terms is a separate content pass.
  · **What year? is NOT on this filter — it left the cards entirely** (see the `whatyear.js` bullet in the
    File map). Under the bar exactly one year kept five cards, so the game would have asked the same
    question every day; it has an event pool of its own now.
  · **THE CROSSWORD'S DRAW CAP HAD TO SCALE WITH THE POOL** (`dailyCrossword`), found by the 730-day sweep
    the day the filter landed. It was a flat `slice(0, 40)`, which samples nothing once the pool is smaller
    than 40: every day drew the whole pool, the length sort put it in the same order, and only the layout
    RNG differed — **730 distinct grids became 60**, a repeat every fortnight. Nothing throws and every grid
    is still full; the game just quietly stops being daily. Taking a fraction restored it to 577, and a
    pool of 40+ still draws 40, so the large-pool behaviour is exactly what it was.
  · **THE READER SEES IT, AS FIVE STARS IN THE CARD'S TOP RIGHT** (`cardStarsHTML` / `.card-stars`, Aug
    2026, on request). Three decisions. It renders as **NOTHING at 0** — every community-deck card and any
    curated card not yet rated — because five empty stars claim a rating of zero, which is not on the
    scale. It is **DECORATIVE to a screen reader**: one `aria-label` on the row says the rating in words
    (the `CARD_DIFFICULTY_LABELS` wording, so the star row and the tooltip cannot disagree), where five
    identical glyphs read out one at a time say nothing. And the colour is the QUESTION/ANSWER label's own
    `--indigo` at the same `.5` opacity, on request, so the corner reads as the card's own furniture rather
    than as a second kind of mark; an unearned star is the same colour at a fraction of the opacity, which
    reads as an outline without needing a second glyph. It is absolutely positioned so it costs the
    question no width, and it steps left of `.tts-mute`, which holds that corner when read-aloud is on.
    **AND THE WHOLE HEAD LINE IS TWO FLEX ROWS, NOT ONE** (Aug 2026, on a bug report that the dot, the
    word QUESTION, the phrasing counter, the DIFFICULTY label and the stars sat at four different heights).
    `.q-head` centred the two BOXES and inside `.label` the parts were still INLINE, so each aligned by its
    own rule — the dot on the BASELINE (a 7px circle sitting on it has its centre well above the text's),
    the counter on `middle`, the play triangle on the baseline again — and the stars, being a box rather
    than text, centred against none of them. `.q-head .label` is `display:flex; align-items:center` now, so
    every part of the label centres on one line and that line centres against the stars, at every text size
    and with no offset anywhere; the per-part `vertical-align` rules are inert in flex and are left as they
    are for any other context that ever renders them. **The dot went to `opacity:1` in the same pass, also
    on request** — it is the one mark on the card saying where this card stands, and the `.85` it wore was
    holding the strongest of the three signals back for no reason.
  · **THERE ARE TWO RATINGS AND THE CARD SHOWS WHICHEVER IT HAS EVIDENCE FOR** (`CARD_STATS` /
    `CARD_STATS_MIN` / `CARD_GRADE_WEIGHT` / `cardStatsFor` / `cardDifficultyShown`, Aug 2026, on request).
    `card.difficulty` is an EDITORIAL judgement about how well known the answer term is, made once when the
    card is written; what a reader actually wants to know is how hard the card is to answer, which only the
    answers can say. So every grade is counted (`bump_card_grades`, an RPC in section 13 of
    `.claude/supabase-schema.sql` — **the user must run it once**; it clamps each increment to 0–50, caps a
    batch at 500 rows and validates the id, since anyone with the publishable key can call it), and once a
    card has **`CARD_STATS_MIN` (20)** answers the stars show the community figure instead. Four decisions.
    **It is ANONYMOUS AND AGGREGATE** — four counters per card, no reader attached — which is what makes it
    safe to publish and to read without a session. **The threshold is what stops one bad morning becoming a
    rating**: below it the card keeps the editorial one, so a new card is never rated by three people.
    **`pct` is null on the editorial rating**, deliberately: it is a judgement rather than a measurement and
    printing it as a figure out of a hundred would dress it up as one, which is why only the community
    rating carries `.cs-pct`. And **the rank is derived from the percentage** (`floor(pct / 20) + 1`) rather
    than stored, so the two ratings share one five-star scale and one row of markup.
    **ONLY A READER'S FIRST THREE ANSWERS TO A CARD COUNT** (`CARD_STATS_SIGHTINGS` (3) / `c.seen` /
    `cardStatsUndo`, Aug 2026, on request: "this way we actually rate how hard it is to LEARN the card, not
    just how well-known it is when it first appears to them"). Every grade used to be counted, and a card is
    graded for as long as it is studied — so a well-scheduled card converges on Easy whatever it cost to
    learn, and the figure slowly stopped measuring difficulty at all and started measuring how long the deck
    had been in use. Three sightings is where the learning happens.
    **THE COUNTER IS ON THE CARD RECORD (`c.seen`), which is what makes an undo free**: it rides in the
    synced blob with the rest of `S.cards`, needs no field of its own and no migration (an absent key reads
    as 0, so every existing card starts its three from today), and `resetProgress` clears it with the
    schedule it belongs to. **`schedForget` deliberately does NOT reset it** — forgetting is a statement
    about the SCHEDULE, and a reader who has already met a card three times cannot un-meet it.
    **AND THE UNDO READS THE SNAPSHOT, NEVER THE REVIEW LOG.** `doGrade` records `snap.g = g` and
    `undoGrade` withdraws that vote, because `REV_GRADE_NAME` is CAPITALISED where `CARD_GRADE_KEY` is not:
    a grade recovered from the log would not match a stats key, the withdrawal would quietly do nothing, and
    a mis-graded card would keep a vote it never earned — with nothing on the page to say the rating is one
    answer too heavy. Guarded by `.claude/test-spelling.js`, which reads all five lines out of `app.js`.
    **THE WORD "Difficulty" IS PRINTED BESIDE THE STARS** (same request): five small stars in a corner say
    that something is being rated and not what. Set small and thin, so it labels the row rather than
    competing with the question beside it. **AND IT IS THE FIRST TEXT IN THAT ROW, SO IT NEEDED A
    `body.hc` RULE** — the stars are SVG and `test-a11y.js` measures text, so until the row gained words
    there was nothing there to measure. Both the word and the community figure are `--indigo` held down by
    opacity, which over the six themes in both modes is **1.77–3.28** and **2.06–4.70** — quiet on purpose,
    short of the bar in all twelve, and correctly REPORTED rather than failed in the default mode. Opacity
    is not the rescue: at full strength the indigo is still 3.32 on gazette's dark card. So with the mode on
    they become ordinary `--ink`, which is what the re-tone does for every other quiet token. **A row that
    gains its first text node gains an accessibility surface it did not have.**
    **AND `test-a11y.js` COULD NOT SEE IT, WHICH IS THE HALF WORTH CARRYING**: its high-contrast sweep
    walks `ROUTES`, and `study` is deliberately not a restorable hash — so it visited every page a reader
    can type and none of the one they spend their time on, and the assertion "nothing falls short" was
    passing on a set that excluded the whole study card. It reaches one now, the way a reader does, with a
    guard asserting the card and the difficulty row are actually THERE: a sweep that reached no card would
    report clean for the worst possible reason.
    **AND THE FIRST THING IT SAW THERE WAS NOT THIS ROW BUT THE GRADE BAR**, failing in all twelve
    combinations — which is the argument for widening a sweep even when you are widening it to check your
    own change. Its three text runs are white at 1, .82 and .6 over four saturated backgrounds, and
    measured they are 2.25–4.56 for the label, 1.97–3.64 for the interval and 1.66–2.69 for the key: the
    site's most-used control, wrong since the bar was built, and unreported because nothing had ever
    looked. **The fix is the BACKGROUND rather than the ink**, and that follows from what the colours are
    for — the four hues ARE the four answers, so re-toning the text to a common dark would take the bar's
    whole language away, while darkening each background by a factor of .67–.99 keeps every hue and simply
    stops it being a pastel. Solved per colour and per mode with all three runs at full-strength white;
    every one lands 4.61–4.71. **The rules are written `body.hc:not(.night)` / `body.hc.night` (0,4,0),
    not `body.hc` (0,3,0)** — `.night .grade.again` is (0,3,0) and sits a thousand lines below the
    CONTRAST block, so at equal specificity source order would win and the night bar would be untouched.
    **The RPC degrades rather than breaking** — a database without
    section 13 answers 404 and the card simply keeps its editorial rating, which is the standing rule that a
    later schema block is never a prerequisite.
  · Written by `.claude/add-card-difficulty.js` in batches, editable per card in Admin → Cards (a select in
    the meta row beside the chronology — it offers the five ratings and **no "unrated" row**, since an
    undefined delta does not survive JSON round-tripping and a control whose only use is to drop a card out
    of the games by accident is not worth having). Carried by `serializeCardData` and restored by
    `revertCard` — **a serializer that forgot it would strip every rating from data.js on the next admin
    keystroke**, which is why that is asserted rather than assumed.
- **SOME TERMS DO NOT HAPPEN AT A TIME, AND TIMELINE MUST NOT ASK** (`card.undatable`, `cardUndatable()`,
  the filter in `chronoPool()`; Aug 2026, on a bug report — "there are some answers which really shouldn't
  have a specific starting date, e.g. human evolution"). The sibling of the difficulty rule above: a second
  editorial fact about the ANSWER TERM that decides whether a game may deal it. **14 of the 500 cards carry
  it**, all of them inside the games' pool, leaving Timeline 78 of its 92.
  · **THE TEST IS WHETHER THE SORT YEAR IS A DATE THE TERM IS CONVENTIONALLY GIVEN**, and it fails two
    ways. A term may not be **located in time at all** — a physical feature (`Tiber`, `Apennines`,
    `Dardanelles`), a material (`Ochre`), a condition (`Ice age`), a way of life (`Hunter-gatherer`), a
    category (`zoonotic disease`), a question (`origins of social inequality`) or a modern method
    (`ancient DNA`, which sorts a prehistory card at 2010 CE). Or it may be a **process so diffuse that
    the earliest figure on its date line is one arbitrary moment inside it**: `human evolution` sorts at
    8 Mya because that is where the ape line split, which is not when human evolution happened — it is one
    end of the span the term names as a whole, and the same card prints the other end.
  · **A LONG PROCESS IS NOT AUTOMATICALLY UNDATABLE, which is the half that keeps the game worth playing.**
    `domestication`, `animal domestication` and the `Neolithic Revolution` each ran for millennia and each
    sorts at the onset a reader would give it, which is about the precision a Timeline round is answered
    to. Flagging those would empty the game of exactly the terms it is for. **Two of the flagged cards
    argue the case in their own opening sentence** — `Ice age` is "not a slice of time but a climate
    condition" and `Hunter-gatherer` "names a subsistence strategy rather than a period of the past" —
    which is the shape to look for.
  · **IT IS TIMELINE'S RULE AND NOTHING ELSE'S.** Multiple Choice, the Crossword, the Picture round and
    Common Thread ask what a term IS, which a process answers perfectly well; only this game asks WHEN. So
    the filter is in `chronoPool` rather than in `gameCardIdSet`, and `test-difficulty.js` asserts it is
    absent from every other pool as well as present in this one.
  · **THE DECK'S OWN ORDER IS UNTOUCHED**, and that is why this could not be done with the existing
    "timeless" machinery (`ADMIN_EDITS.chrono[id] = "none"`, which `cardStartYear` reads): human evolution
    belongs at 8 Mya among its neighbours in the study deck, and setting it timeless would file a
    prehistory card in the middle of the Roman ones. `cardStartYear` therefore knows nothing about the
    flag — asserted, since a later tidy-up would naturally put the two together.
  · **THREE OF THE FOURTEEN ARE FLAGGED BELT-AND-BRACES.** `Apennines`, `Tiber` and `origins of social
    inequality` carry no date line, so they were already out of the game for want of a year; the flag is
    what stops a date line added later walking them silently back into it. (`Dardanelles` is not one of
    them — it has a year, off graves beside the strait, so flagging it really does remove it.)
  · **IT ONLY BITES ON A CARD THE GAMES CAN REACH**, i.e. rated at or below `GAME_MAX_DIFFICULTY`, so the
    pass that applied it went over those 92 and not the whole corpus. **A card RE-RATED down into the pool
    needs the judgement made about it** — that is the one way the corpus can quietly regrow an unflagged
    process, and nothing can detect it, since no rule can read an onset off a date line and tell it from
    one end of a span.
  · Written by `.claude/mark-undatable.js` in batches (which demands a reason naming the kind of thing the
    term is, refuses the batch outright rather than half-applying it, and prints the pool it leaves),
    accepted on a new card by `add-card.js` (optional, and type-checked — `true` or nothing), and editable
    per card in Admin → Cards as a **"no single date" tick** beside the difficulty select. Carried by
    `serializeCardData` and restored by `revertCard`, for the reason the rating is: a serializer that
    forgot it would strip all fourteen flags on the next admin keystroke and put a river back in the game.
