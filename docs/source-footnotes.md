# Source footnotes — the citation apparatus, on all four surfaces

**Read this before touching the `SOURCE FOOTNOTES` block, `wireFootnotes`, `sourcesHTML`,
`normSources`, `linkifySrcItem`, the editors' sources boxes, or the `fn` / `data-fn` allowlists.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary: the marker contract, where the
numbering happens, the fold's default per surface, and which suites guard it. This file carries the
rest — why the marker is written empty, why the numbering and the linking are delegated rather than
wired per render, and the several times an apparatus reached a reader as bare superscripts over a fold
that would not open.

The bullet below is as it stood in CLAUDE.md, verbatim.

- **Source footnotes (July 2026)** — the `SOURCE FOOTNOTES` block in app.js, just above `buildBack`. Three surfaces
  say things about the past — a card's background, a glossary description, an Atlas place panel — and each can now
  name the scholarship behind them. Each carries a **`sources` list of Chicago note-form citations** (card:
  `card.sources`; term: `window.GLOSSARY_SOURCES[slug]` or a deck term's `entry.sources`; place:
  `country-sources.js`), rendered as a **numbered fold at the foot of the surface**, `sourcesHTML()` /
  `sourceListHTML()` for the Atlas panel, which owns its own `.cp-sec` fold.
  · **Prose points INTO the list with an EMPTY marker** — `<sup class="fn" data-fn="2"></sup>`. **The digit is
    written by `wireFootnotes()`, never by the author**, so re-ordering a source list can never leave a stale number
    sitting in a sentence — the one failure mode of hand-numbered footnotes. A bare `<sup class="fn"></sup>` takes
    the next number in reading order. A marker whose number has **no entry behind it is REMOVED**, not shown: a dead
    superscript claims a citation the reader cannot check, which is worse than no marker.
    **If that pass never runs the marker still prints its number**: `sup.fn:empty::before{content:attr(data-fn)}`
    (once `wireFootnotes` has written the digit the marker is no longer `:empty`, so the two can't both print).
    A phone once showed a whole card of blank gaps mid-sentence over a fold that would not open, which is what
    an unwired surface looks like — and it looks like nothing, so nobody reports it as a wiring failure.
  · **…and the ENTRY points back at the prose** (`srcNumHTML` / `jumpToMarker` / `markerForNumber` / `.src-n` /
    `.src-back`, Aug 2026, on request). The jump down had worked since the apparatus shipped and the return had
    no way in at all, because the entry's number was a **`::marker`** — which takes no `tabindex`, carries no
    accessible name and swallows no click of its own. So `list-style` is off and the number is an ELEMENT that
    both producers write (`sourceListHTML` and the book's `bookNotesHTML`), with the hanging indent coming from
    a flex row rather than each variant's own padding arithmetic.
    **Only a number some marker actually points at becomes a control.** `wireFootnotes` is the one pass that can
    see both ends — it has just numbered the markers and dropped the over-range ones — so it collects the numbers
    that survived and promotes those entries, leaving an uncited one a plain number. That is the dead-header
    lesson one level along: a surface that never gets the pass shows **no control** rather than a dead one, which
    is exactly the Atlas panel, whose prose carries no markers and which never calls `wireFootnotes`.
    **It returns to the marker the reader LEFT FROM**, recorded on the entry by `jumpToFootnote` as `_fnFrom`:
    a note may be cited several times over — Seneca's letter 114 cites one note four times — and coming back to
    the first citation when the reader jumped from the fourth lands them in the wrong sentence. Falling back to
    the first is the only other honest answer, and `markerForNumber` climbs the way `noteForNode` does, stopping
    at `<body>`, so a book's notes can never send the reader into a gloss popup open over them. Both ends reuse
    `scrollNoteIntoView` (it clears the same furniture either way) and the same `.src-flash`, so the reader is
    told which one at both ends. Guarded by `test-sources.js` and `test-library.js`.
  · **The fold header and the markers are DELEGATED** (one capture-phase document listener each for click and
    Enter/Space, beside `wireFootnotes`), never wired per render — the `.card-img` pattern. Everything a click
    needs is derivable from the DOM at click time, and a per-render listener is one render path away from a
    header that looks like a control and isn't. **Capture phase** so a surface that stops propagation on its own
    clicks (a gloss popup) can't swallow it; `noteForNode` climbs to the nearest ancestor holding a `.src-note`
    and **stops at `<body>`**, so a marker whose own surface has no list finds nothing rather than jumping into
    whatever other panel is open. Don't re-add a per-element listener — it would fire alongside the delegated
    one and toggle the fold twice, i.e. not at all. `wireFootnotes` still does the numbering and the a11y
    attributes, with `wireSourceLinks` in a try/catch: the links are decoration over text this code didn't
    write, the numbering is the join between the prose and the list, and one must not be able to take the
    other down.
  · **A BOOK'S MARKERS TAKE THE CARD'S VERMILION** (Aug 2026, on request — they wore a teal of their own,
    `--bknote`, for a fortnight). The argument for separating them was that a card's marker points at a
    work Folio is citing while a book's points at the TRANSLATOR's own note, which is a different kind of
    thing; the argument against, and the one that won, is that a reader meets both and **one apparatus is
    easier to learn than two**. So there is **no `.bk-page` override at all** — the reader inherits
    `sup.fn` and `.src-n.src-back` unchanged — and the token moved rather than being deleted: it is
    `--newterm` now, and it marks an undiscovered glossary term (see the discovery-marks bullet, which is
    where the reasoning that chose the hue lives). `test-artefacts.js` asserts both ends of the swap, and
    it compares a book's marker against a CARD's rather than against a hex literal, so a re-toned `--zh`
    moves both together.
  · **A card's, the Atlas panel's and a BOOK's folds are OPEN by default; a GLOSS POPUP's is always SHUT.** On
    the big surfaces a citation the reader has to go looking for is one they will not check, and checking is the
    whole point of shipping the apparatus (July 2026, on request — they were collapsed before; the book's notes
    joined them Aug 2026, also on request). **A reader who
    shuts one there is remembered**: `S.settings.srcCollapsed` (in `defaultState`, so old saves back-fill; a
    device setting, not synced) is written by the **delegated header handler only** — a marker jump force-opens
    the fold for one look and deliberately does NOT change the preference. The Atlas section follows the same
    setting and additionally **hides outright when empty** (unlike its neighbours, which show a shut header): an
    empty "Description" header still tells the reader the panel has that part, but a "Sources" header over
    nothing reads as a claim to have cited something.
    **The gloss popup (`sourcesHTML`'s `opts.compact`) is the exception on both counts** (August 2026, on
    request): it renders `collapsed` unconditionally, ignoring `srcCollapsed` rather than sharing it, and the
    header handler **skips the write when the note carries `.src-compact`** — so expanding one term's sources
    is not remembered, and the next popup opens shut again. A popup is a glance at a word met mid-sentence and
    the fold is a third of its height; expanding one says something about that term, not about every term
    opened afterwards. A marker jump still force-opens it, there as everywhere. Guarded by `test-sources.js`.
  · **A MARKER JUMP MUST CLEAR THE FURNITURE, AND MUST MEASURE A FOLD THAT IS ALREADY OPEN**
    (`openFootnote` / `scrollNoteIntoView`, Aug 2026, on a bug report: on a phone the jump "doesn't quite go
    far enough to see the actual note"). Two faults compounded, and each is invisible to a test that only
    asks whether the note is in the viewport.
    · `scrollIntoView({block:"nearest"})` brings the item's bottom flush with the **scrollport's**, and the
      scrollport is the whole viewport — which on a phone has a 58px tab bar fixed over the foot of it. So
      the note arrived UNDERNEATH the bar: in view by the browser's reckoning, unreadable by the reader's.
      Measured on a 390×844 phone, the note landed at 807–844 with the bar starting at 786.
    · `.src-collapse` opens over .38s (`grid-template-rows` 0fr → 1fr), and the scroll was issued in the
      same tick — so it was computed against a list still zero pixels tall and stopped short by however
      tall the list was about to become. Same phone, fold shut: the note landed at **850–887, entirely
      below an 844px viewport**. Worst exactly where it was noticed, at the foot of a long chapter, where
      the notes are the last thing in the document and the page cannot scroll that far until they exist.
    The fold is now expanded WITHOUT its animation before anything is measured (animating would only mean
    scrolling to a moving target; the scroll IS the movement asked for), and `scrollNoteIntoView` reads the
    bars off the custom properties that position them (`--bar-h`, `--tabbar-h` — both 0 on the side of the
    breakpoint where they do not exist, so this cannot drift out of step with them). Already clear of both →
    **nothing moves**, since a note the reader can see should not jolt; otherwise it is placed in the middle
    of what is genuinely visible, except when the note is taller than that band, where it is aligned to its
    top — centring a long note lands the reader mid-sentence. A note inside its OWN scroller (a gloss popup's
    body, the Atlas panel's columns — `noteScrollParent`) has no fixed furniture over it and keeps
    `scrollIntoView`. Guarded by `test-library.js`, which asserts against the tab bar's own rendered box
    rather than a hard-coded 58, from an open fold and from a shut one.
  · **A citation ends in its URL, written as plain text**, and `linkifySrcItem` turns it into an anchor —
    **inside `sourceListHTML`, so the list is serialized already wired** rather than fixed up by a pass over the
    rendered page. That was the second half of the same lesson the fold header learned: a list that depends on a
    caller remembering `wireSourceLinks` will, on some render path, reach a reader as a bare `[Open access]` and a
    URL that is not a link — which looks like nothing went wrong, so it gets reported as "the labels reverted",
    not as a wiring failure (it was, in July 2026). It still walks TEXT NODES, so a URL already inside an
    attribute is untouchable, and `wireSourceLinks` stays as an idempotent safety net for markup that arrives
    some other way: the URL pass skips text inside an anchor, and the chip pattern needs brackets that are gone
    once a chip exists. Building the anchor here rather than asking an author for `<a href="…">…</a>` is what
    keeps the href and the visible text from ever disagreeing — a mismatched anchor would quietly send a reader
    somewhere the citation does not name. Links open in a new tab, or following one would end the study session.
  · **A citation also ends in an access label** — `[Open access]` or `[Paywalled]`, stored as plain bracketed
    text after the final period, and lifted into a **chip** by the same `linkifySrcItem` pass
    (`SRC_ACCESS_RX`, `.src-access-open` in `--good` green / `.src-access-pay` in `--ochre` amber, both theme
    tokens so the chip follows every theme and both modes). A paywall is a fact about the link, **not an error,
    so it must not be styled as a warning** — amber, never red. The URL pattern already excludes `[` and stops before
    the closing period, so the two passes can't collide; `replaceInSrcText` is the shared text-node walk.
    Unlike the citation itself the four chip strings ARE localised, through **`t()` at build time** rather
    than `localizeTree`, which can't reach inside `.src-list`'s `notranslate`. **Write the label in English
    in the data.** A citation with no label renders exactly as before — most don't have one yet.
    The rule the label enforces: a **paywalled work is citable only when it is the landmark defining paper**
    for the claim, and the majority of any card's list must be open (`docs/citation-plan.md`, "The bar").
  · **Citations are NOT translated**, and for the reason image credits are not — a citation names an edition that
    exists in one language, and rendering "Cambridge University Press" in nine is fabrication, not translation. Hence
    `notranslate` on every list, and hence `sources` lives on the base card and NOT in the `i18n` blocks. Only the
    **"Sources" label**, its aria-label and the `^Source (\d+)$` rule are localised (all 9 languages).
  · **Deltas + serialization**: `setCardSourcesEdit` (a `sources` delta with a null tombstone, exactly like
    `questions`/`image`), `setGlossSourcesEdit` (`ADMIN_EDITS.glossarySources`, `PRISTINE_GLOSS_SOURCES`,
    `glossaryResetToPristine` / `revertGloss` / `deleteGloss`); baked by `serializeCardData` / `serializeGlossary`.
    Community decks get `uCardSetSources` / `uGlossSet(…, "sources", …)`, sanitized on ingest by `uCardSanitize` /
    `uGlossSanitize` (rich HTML — a citation italicises a title) and carried through export/publish/install.
  · **Editing**: the shared card surface's `sourcesPanel` (so the admin editor's EN view AND the Studio), and a
    `sources` textarea in the curated glossary editor's EN view + the Studio's term form. **One citation per LINE**,
    never comma-separated as tags and aliases are — a Chicago note is full of commas.
    On the CARD surface the panel is no longer a textarea (Aug 2026, on request): each citation is its own
    **rich contenteditable row** (`#cesSrcList` → `.ces-srcitem[data-rich]`, numbered by an `<ol>` exactly as the
    card numbers them), so a Chicago note — which is mostly italicised title — is written **as it reads** rather
    than as `<i>…</i>` in a text box, and the ribbon's italic button applies to it. `srcItems` is the working
    list, like the question pool: blanks survive editing and `normSources` drops them on the way to the store.
    Everything is DELEGATED on the list (input / keydown / paste / the row's ×) because the rows are rebuilt
    whenever one is added or removed, and **`wireRichEditor` now picks up the active field by a delegated
    `focusin` on the host** rather than a listener per element — without that, every row created after it ran
    would be unreachable from the ribbon. The URL and the `[Open access]` / `[Paywalled]` label deliberately stay
    PLAIN TEXT in the row: the card builds the link and the chip at render time, and showing them already
    converted would leave nothing to edit.
  · **The ribbon's `+Source` button** (`#rtFootnote`, added by `rtRibbonHtml({footnote:true})`, so only where a
    sources list exists — a glossary description has none). One press does both halves of a footnote: an EMPTY
    `<sup class="fn" data-fn="N">` at the caret in the background (or at its end if the caret is elsewhere) and a
    blank citation row waiting below, focused. The `N` is a starting value only — the card draws the real number
    from the list, which is the whole point of writing the marker empty. It never stacks two blank rows: a second
    press lands in the one already waiting. Shown only while the background is the active field (`.rt-fn` follows
    the ribbon's existing `.on-bg` class, like `.rt-link`).
  · **The ribbon is sticky, and which scrollport it pins to depends on the surface.** The desktop `.admin-editor`
    pane scrolls inside itself (`top:0`); the Studio and the phone scroll the whole PAGE, where it has to clear
    the sticky top bar (`top:calc(var(--bar-h) + 6px)`, z-index 30 — under the bar's 50). **On ≤860px
    `.admin-editor` is given `overflow:visible`**: it stops scrolling inside itself there, and a scroll container
    that never scrolls is a scrollport its sticky child can never leave, which is why the ribbon used to scroll
    away on a phone.
  · **How many, and the red mark** (July 2026, on request). **`SRC_TARGET` (5) is the editorial bar** a curated
    card is held to — a target the Edit page reports against, never a validity rule, and community decks are not
    held to it. The card list paints each row's id line with a coverage chip (`cardSourceState` → `.acr-src`):
    **nothing** at 5+, **amber `3/5`** under the bar, **red `0/5`** under it *and* carrying `card.sourcesBlocked`
    — a string reason recording that a batch went looking and came back short. The amber/red distinction is the
    point: amber is a to-do, red is a finding. **A card earns red only when a batch concludes it**, written by
    `.claude/mark-sources-blocked.js` (which demands a reason saying what was searched) and retired
    automatically by `add-sources.js` the moment the card reaches 5. Flagging a card unsourceable before
    searching is the failure the apparatus exists to prevent, one level up — and batch 8b is the standing
    warning, having cited two cards a previous session had written off. The flag is `data.js`-level, carried by
    `serializeCardData` beside `sources`, and **never shown to a reader**: the fold shows the sources a card has.
    A "Fewest sources" sort and an "N under-cited, M blocked" tally in the list head let the pass be worked
    straight down the list. Deliberately NOT the same channel as the right-click `cardColor` mark (a left
    stripe): one is derived from the data, the other is an editor's private marker.
  · `sup` + `class="fn"` + `data-fn` are in the sanitizer allowlists, so a community deck can use markers too.
  · **The Atlas table still ships EMPTY; the glossary has begun.** `country-sources.js` has no entries at all.
    **`GLOSSARY_SOURCES` carries ALL 401 terms** (batches G1–G11, P1–P7, C0–C12, D1–D3, N1–N10, 2026-08-01/03 — the genus, species, specimen,
    stone-industry, three-age, periodisation, geological-time, type-site, way-of-life and discipline terms, plus the
    Indigenous-peoples group, its odds and ends, the poles / desert / ocean / two historiographic names, the six
    continents with `Sicily`, `Equator` and the two hemispheres — which completes Phase 1 — and the first six
    US presidents, Jackson to Polk, Taylor to Andrew Johnson, Grant to McKinley, Theodore Roosevelt to
    Hoover, Franklin D. Roosevelt to Nixon, and Ford to Biden — **all 45** — plus C0's six pilot
    countries, C1–C2's twenty-five EU member states, C3's four non-EU European states and C4's seven
    Commonwealth states in Asia, C5's four more, C6's thirteen African Commonwealth states, C7's eleven — the rest of Commonwealth Africa plus the first terms carried by the Office of the Historian's recognition guide — C8's fourteen non-Commonwealth African states and C9's last fourteen, which COMPLETE AFRICA at 56 of 56, C10's thirteen, which COMPLETE OCEANIA, C11's twenty across North and Central America and the Caribbean, C12's twelve in South America, D1's nineteen, which clear the European deferral list, D2's thirty-one, which clear the Asian one, and D3's last four), against
    a bar of **`GLOSS_SRC_TARGET` (2)**, which is lower than a card's five because a description is three sentences
    where an abstract is ten; `docs/glossary-citation-plan.md` is the plan for the rest and
    `node .claude/gloss-source-audit.js` says where it stands. The UI, the deltas and the pipeline are in place;
    the rest is a content job (see "Citing the existing content" below). Guarded by `.claude/test-sources.js`
    (74 assertions).
    **Batches 0–22 shipped 2026-07-31/08-01**: **all 109 prehistory cards now carry sources.** **Against the
    5-source bar, ALL 109 are there** — batches 0–26 are complete, and
    the audit that says which is `node .claude/source-audit.js`. **Every list is majority-open**, `wh-045`
    Jebel Irhoud having been taken to six sources in batch 24 to clear the last exception. See `docs/citation-plan.md` — its Pilot log records how the
    definitional cards were solved, its Batch 1 log the factual errors the exercise turns up (21 so far) and
    the gotcha that a matching sentence COUNT across languages does not prove a matching sentence MAPPING, and
    its Batch 2 log the finding that reshapes the rest of the pass: **the batches are grouped by subject, and
    subject does not predict whether the sources are reachable.** Cards built on a published *result* — a
    genome, a date, a measurement, a model — go through easily; cards built on a discovery history or a naming
    history turn on founding announcements and historiography that are closed with no open deposit, and 14
    such cards are now deferred. Re-cut the remaining batches by source type before working them.
    Two working rules from Batch 3: **an index saying a paper is closed is not evidence that it is** — fetch
    it before labelling it, in both directions (Europe PMC marks Wood et al. 2013 closed and its PMC full text
    is free; the Auckland deposit of Sutikna et al. 2016 is indexed open and sits behind a JS challenge) — and
    **a card reporting an argument in progress has a shelf life**, so expect corrections caused by time rather
    than carelessness (`wh-037`'s *naledi* burial papers reached Versions of Record in 2025 with mixed
    verdicts, where the card said the reviewers were unanimously against and the papers still in revision).
    From Batch 8: **a correction is not finished when the abstract is fixed — check the QUESTION POOL too.**
    Each card carries three phrasings that repeat the abstract's figures exactly as the date line does, and
    `wh-075`'s third phrasing restated the very error being corrected, which would have shipped as the cloze
    question above a corrected background. Patch the extras with `add-questions.js` and the main `question`
    with `fix-field.js` (it reaches any string field, so `question` yes, the `questions` array no).
    From Batch 8b, and it reversed a deferral: **search the holding institution before concluding a card
    cannot be cited.** `wh-067`/`wh-068` were written off when every Swabian Jura paper proved closed, then
    went through on museum and government records — Museum Ulm's catalogue entry for the Lion Man (with its
    inventory number, its measurements and its sex), the Blaubeuren state museum's object record for the
    Hohle Fels flute, and the World Heritage property's official portal, which is openable where
    `whc.unesco.org` is not. For a card **about an object**, the museum record is often the better source
    anyway: it is kept by the people holding the thing and it states the measurements a journal article
    assumed its readers knew. It also carries what the literature quietly updated — the Lion Man's sex is
    settled in the catalogue and was still "disputed" on the card.
    From Batch 13, the limit of that method: **it works where a museum runs a CATALOGUE, and a catalogue is
    not the same thing as a website.** The Georgian National Museum, Naturalis, the Fundación Atapuerca and
    the Moravian Museum all have sites and none publishes per-object records, so Dmanisi, Java Man,
    Atapuerca and Dolní Věstonice were not unblocked the way the Swabian cards were. Check whether a
    catalogue exists before planning a batch around one.
    From Batch 14, the first batch cut by SOURCE TYPE rather than subject, as Batch 2 said the rest should
    be: **a supervolcano, an island species and two Levantine caves went through in one sitting because
    every claim on them is a published RESULT** — a modelled climate, a dated bone bed, a measured genome, a
    thermoluminescence age. Results are deposited, indexed and openable; discovery histories are not. Two
    corollaries worth carrying. **A figure can be right when written and wrong now**: `wh-042` gave Toba's
    2,800 km³ (Rose & Chesner) while the paper its own last sentence rests on opens with ∼5,300 km³, and it
    had Ambrose proposing a six-year volcanic winter he never proposed — that is Rampino & Self's, repeated
    into him by retellings, and his abstract gives a thousand years of cold instead. **Read the abstract of
    the paywalled landmark before paraphrasing it**; PubMed carries it even where the text is closed.
    And **budget for the length rule**: a citation pass makes prose longer, so a card already near the
    330-word ceiling (`wh-049` sat at 329) needs several trimming passes across all ten languages before it
    lands back inside it.
    From Batch 15, two rules that between them reopened a set the plan had written off. **When the
    discovery paper is closed, look for the REVIEW that restates it** — the southern African Middle Stone
    Age was deferred because Henshilwood and Marean are closed, which is true of the founding
    announcements and false of the syntheses built on them; one open review carried six of `wh-057`'s ten
    sentences. And **fetch the FILE, not the landing page**: `hal.science/hal-XXXXXX` sits behind an
    Anubis wall while `hal.science/hal-XXXXXX/document` serves the PDF, which reversed a Batch 14 call —
    Détroit et al. 2019 shipped as [Paywalled] and is open. A wrong access label is a real error, not a
    cosmetic one: it tells a reader not to bother following a link they could have followed.
    From Batch 16: **when a card narrates an ARGUMENT, look for the review that narrates it, and cite the
    originals alongside rather than instead.** `wh-033`'s middle five sentences are the Bordes–Binford
    debate and Dibble's reduction thesis, none of whose primary statements is open; one 2024 review states
    all three in an openable page, and Bordes 1961 and Binford & Binford 1966 sit beside it as the
    paywalled landmarks they are. Also **narrow a naming history to what a source actually says** — "the
    1860s and 1870s" for Levallois-Perret became "the 19th century", which is as precise as the open
    literature gets.
    From Batch 18: **when a card is about an object, an institution or an act of state, look for the body
    responsible before looking for a paper.** Three of its four cards were carried by sources that are not
    journal articles — a Dutch state commission's 2025 advice on the Dubois collection, the ministry's record
    of the handover, and the Smithsonian's Human Origins fossil and species records — none of which has an
    equivalent in the literature. Its other finding is a limit on the batch's own premise: **a founding
    monograph answers the questions its author asked**, so Dubois 1894 and Weidenreich 1943 settle the
    discovery sequences precisely and carry almost nothing else, and five claims across the four cards were
    dropped outright rather than sourced — including Binford & Ho 1985, which could not be opened at all, so
    the card no longer names it.
    From Batch 19: **a museum's catalogue IS the open review that restates the closed founding paper.** Batch
    15's rule — when the discovery paper is shut, find the review — worked on exactly one of its five cards
    (Kimbel & Villmoare 2016 carried the whole of `wh-016`'s second half). What carried the other four was
    batch 18's rule generalised: seven of the batch's 21 works are Smithsonian Human Origins records, and
    between them they supply the dates, body sizes, discoverers, discovery years, type-specimen status and
    cranial capacities that Dart 1925, Leakey/Tobias/Napier 1964 and Brown et al. 1985 hold behind paywalls.
    A catalogue is open **by policy** rather than by luck. Its other finding: **a discovery card is not the
    same as a card that can only be sourced from the discovery paper** — `wh-046` Herto, which the plan
    expected to come back short, reached the bar because the find has been re-examined three times in open
    venues since 2003, and every re-examination restates it before disputing it.
    From Batch 20, the move that reopened a set batch 5 and batch 15 had both walked away from:
    **when the paper that announced a find is shut, look for the paper that CITES it as a comparison.**
    This is not batch 15's rule — a review restates a field and may not exist, whereas a comparison
    restates one rival site and is much easier to find, because you can search the site's own NAME inside
    the open-access corpus. Every famous Blombos find came in that way: Bouzouggar et al. 2007 give the 41
    pierced *Nassarius* shells, their ≈75,000-year age, the two engraved ochres and the 400 Still Bay
    points because they are comparing Blombos with Taforalt, and Rosso et al. 2016 give the 100 ka ochre
    toolkits because they are comparing them with Porc-Epic. Its second finding is simpler and was missed
    twice: **check who is excavating a site NOW, not only who published the landmark.** Klasies River had
    been deferred on Marean's closed papers while Sarah Wurz's current team publishes in *Frontiers*, which
    is open by policy. Third, **old conference proceedings are often the most openable thing in a naming
    history** — the whole 440-page 1957 volume of the 1955 Pan-African Congress is OCR'd on the Internet
    Archive, and it corrected two claims at once: the term is Goodwin's alone from 1928 (1929 is the joint
    volume), and the Congress did not endorse the three-stage scheme but recommended a five-part frame,
    over objections. And the sibling check the plan puts on definitional cards paid twice: `wh-031` had a
    Still Bay date no other card used and an end-date 10,000 years off three of its own siblings.
    From Batch 21, a correction to batch 8b's rule rather than a new one: **the institution to ask is not
    always a museum, and its record is not always a catalogue.** Lascaux and Atapuerca — two of the three
    cards the plan called the hardest — were carried almost entirely by a **government ministry's scholarly
    portal** and a **foundation's year-by-year dig timeline**, eleven citations between them, covering the
    discovery dates, the sector count, the dating, the World Heritage years and even a fossil's nickname.
    Batch 13's "a website is not a catalogue" has a converse worth holding onto. Two hard findings go with
    it. **The `/document` trick is dead on hal.science and journals.openedition.org**, which now serve an
    Anubis proof-of-work wall on the file path as well as the landing page — Ducasse & Langlais 2019 is
    genuinely open and unreadable from here, so it is NOT cited and NOT labelled paywalled, because a bot
    wall is a different fact. And **the uncalibrated-radiocarbon error is the pass's most common find**:
    Lascaux's "17,000 years ago" and Dolní Věstonice's "29,000 to 25,000" are both raw BP read as calendar
    years (21,500–21,000 and 31,270–29,260 cal BP respectively). When a prehistory card carries a round age
    in the twenties or thirties of thousands, check BP against cal BP before anything else.
    From Batch 22, on the pair the plan expected to end red and which did not: **before searching for a
    definitional card, read the register.** Batch 12's finding at full strength — Marchal 2002, Walker 2012,
    Walker 2018 and Walanus & Nalepka 2010 were already deposited for `wh-102`/`wh-105`/`wh-106` and between
    them carry the entire chronozone framework. Its second finding: **when a regional scheme is named for one
    country's bogs, check the neighbours' journals** — the plan looked to Scandinavia, and the Preboreal
    vegetation is open in the *Netherlands Journal of Geosciences*, one country west. Third, a new route to a
    closed paper: **`api.crossref.org/works/<doi>` serves publisher-deposited abstracts**, and returned Groß
    et al. 2019 on Duvensee where PubMed has no record at all. And the arithmetic rule these two produced:
    **when a card gives an age both in ¹⁴C years and in "years ago", check that the second is the calibration
    of the first** — the Boreal's stated end of "8,000 years ago" was neither the calibration of 8,000 ¹⁴C BP
    (that is ~8,950 cal BP) nor consistent with `wh-105`, which already had the Atlantic starting at 7000 BC.
    From Batch 12: **the register pays for itself late.** The three framework cards (`wh-001`, `wh-002`,
    `wh-004`) took 25 citation slots and needed **no new sources at all** — every claim a definitional card
    makes is a claim some other card already makes, so the whole job was mapping sentences to entries
    already in `.claude/sources-register.md`. It also produced the first corrections of a new kind: the
    cards were not wrong against the literature but **against each other** (`wh-001` and `wh-004` ended the
    Palaeolithic at 12,000 years ago where five other cards and `wh-004`'s own date line said 11,700). Run
    the sibling-consistency check FIRST on any card that summarises a whole period.
    From Batch 23, the first TOP-UP batch, and its lesson governs the three that follow: **a top-up is
    where the errors are.** A first pass only has to stand behind the sentences it marked; the bare ones
    are exactly where an unchecked claim survives, and a top-up goes looking at them. Four of its ten
    cards changed prose and every wrong figure sat in an unmarked sentence — `wh-022`'s Acheulean end
    date (a 170–130 ka range no source in front of the card carried, against de la Torre's 0.125 Myr),
    `wh-023`'s "June 1797" and jawbone (both in Frere's own letter, which is paywalled on Cambridge
    Core with no abstract), `wh-008`'s antler pressure-flaker (the study that demonstrates the technique
    used a pointed BONE compressor) and `wh-098`'s 1.9 Ma for Wrangham, which Gowlett puts at 1.7. That
    last card also carried the pass's first **wrong marker**: its Wrangham sentence pointed at Berna et
    al. 2012, the Wonderwerk fire microstratigraphy, which says nothing about cooking — **a marker
    pointing at the wrong work is worse than no marker**, and only a top-up would ever have looked.
    Three tools findings go with it. **`https://www.ebi.ac.uk/europepmc/webservices/rest/PMC<id>/fullTextXML`
    is the way past the PMC captcha** that appeared partway through this batch; resolve the PMCID with the
    `search?query=DOI:"…"` endpoint rather than guessing it. **`split-abstract.js` could not see a dozen
    Chinese abstracts at all**: its CJK clause demanded that `。` carry no following space, so the twelve
    zh and four ja abstracts written with one came back as a SINGLE sentence per block — silently, which
    would have scattered markers anywhere. `\s?` on the CJK terminator took the deck's 5+5 failures from
    48 to 22; **the remaining 22 are real and not this batch's** — `wh-039` and `wh-063` split 6+5 and 7+5
    **in English** — and batch 24 should clear them before marking any of those cards. And
    **`check-style.js` was applying the house rules to `sources`**, reporting a real paper's title as a
    century-word violation; in `--fix` mode it would have renamed the paper. Citations are now masked out
    before any rule runs. **THAT MASK ONLY EVER COVERED HALF THE CORPUS, and the other half was found on
    2026-08-08**: it matches the CARD shape `"sources":[…]`, and glossary citations live in a TOP-LEVEL
    `window.GLOSSARY_SOURCES` block with no such key, so nothing in the glossary was ever masked. Reproduced
    before fixing by running `--fix` on a throwaway copy: it renamed **six real published works across twelve
    citations** (Lemos's *…Late Eleventh and Tenth Centuries B.C.* → *…Late 11th and 10th Centuries B.C.*,
    Camp's *A Drought in the Late Eighth Century B.C.*, Dickinson's *…Twelfth and Eighth Centuries BC*). The
    whole block is masked now, and so is the **`COLLECTION_TREE`** — a deck title is neither a card field nor a
    glossary description, so it is outside the rules' stated scope, and the checker had been reporting
    `gr-fourth-century` and `ru-nineteenth` on every run. It now reports both files clean and `--fix` applies
    0 changes. **The lesson is that a mask keyed on one file's SHAPE is not a rule about
    citations** — when a checker grows a second corpus, re-derive what it is meant to skip there rather than
    assuming the existing guard travels. Where a language's sentence split diverges from English (zh on `wh-022`), **repair
    the split rather than routing round it with a per-language marker map** — `add-sources.js` catches the
    divergence as a marker-count mismatch, and rejoining the sentences restores parity claim for claim.
    From Batch 24: **where a batch's cards share a DEBATE rather than a site, one review can carry
    most of it.** Two open reviews — Harvati & Reyes-Centeno 2022 on the Middle Pleistocene and
    Scerri et al. 2018 on whether *H. sapiens* has one birthplace — filled eleven of its sixteen
    slots across four and three cards respectively. Batch 2 found that subject does not predict
    reachability; this is the exception that sharpens it, since an argument attracts reviews and
    reviews are what open venues publish. It also produced the pass's **first clean re-check**:
    `wh-047` and `wh-048` were expected to have drifted and had not (Karmin's Y-MRCA "254 (95% CI
    192–307) kya", Rito's mtDNA ancestor "~180 ka"), and it retired the last not-majority-open list
    by giving `wh-045` two open sources instead of one. Two tooling notes: **PMC's browser check now
    covers the article HTML as well as search**, so the Europe PMC `fullTextXML` route from batch 23
    is the only one left here, and it 404s for author manuscripts with no deposited text; and
    **`isOpenAccess: N` in a Europe PMC record means not OA-LICENSED, not unreadable** — check for
    full text before writing a work off.
    Batch 24 also cleared the **5+5 residue** batch 23 left, and the three causes are worth keeping:
    the splitter held an initial only when another followed, so the LAST of a run was exposed and
    "R. P. Soejono" / "Frank H. H. Roberts Jr." each split a sentence in eight languages (it now
    holds whole runs in Latin, Cyrillic and Arabic, plus `Jr.`/`Dr.`/`St.`); **a sentence ending on
    the era abbreviation** has no terminator left and swallows the next one, which `wh-063` did in
    six languages at once — an AUTHORING rule, not a tooling gap, and the splitter's header has
    always said so; and nine translations had turned one English sentence into two. **The deck now
    splits 5+5 in all ten languages with identical marker counts** — the state batches 25–26 can
    rely on, and worth re-asserting after any prose edit.
    From Batch 25, a route the pass had not used: **where a card describes a nineteenth-century
    idea, the idea's own author is often the openable source — because he is out of copyright.**
    Batch 23 found that a founding paper of 1800 can still be paywalled (Frere on Cambridge Core);
    Blytt's 1886 statement of his theory is the other case, OCR'd in full on the Internet Archive,
    and it settled two of `wh-106`'s sentences and **disproved a third**: the card had Blytt naming
    the Atlantic and the Boreal, and his own paper uses neither word as a phase name. Nothing
    openable settles who coined which of the five names — Sernander is not on the Internet Archive,
    no open history of the scheme exists in the palynology journals, and Walker et al. 2012's open
    deposit has 404'd — so that clause and its companion about Sernander were **withdrawn rather
    than re-sourced**. Treat a "who named it" clause as a claim needing its own source. Its other
    finding is the register's, again: **six of the batch's eleven slots needed no new reading at
    all**, which is what a well-kept register buys late in a pass. And a caution for batch 26: two
    correctly-recorded open entries could not be RE-read this time (the Marchal 2002 WHOI PDF uses
    an encoding the extractor cannot decode; Walker 2012's deposit has moved), so a top-up wanting
    to extend what an old entry supports may find it cannot, and should say so rather than guess.
    From Batch 26, which finished the pass at **109 of 109 with nothing blocked**: the plan's own
    advice held — five of its thirteen citations are heritage-agency records (the French culture
    ministry for Lascaux and Chauvet, the Blaubeuren museum, Cosquer Méditerranée, the Fundação Côa
    Parque) — but its finding is a correction to the pass's own method. **A correction does not
    travel between cards on its own.** Batch 21 stripped three Lascaux claims from `wh-086` (the
    17,000-year date, ~1,500 engravings, the five-metre bull) and `wh-083`, which mentions Lascaux
    in one sentence, still carried all three five batches later — in its abstract AND on its date
    line, in ten languages. **Grep the deck for the FIGURE, not just for the card it belongs to**,
    and sweep every language before a batch closes. Two smaller notes: the batch-22
    `api.crossref.org/works/<doi>` abstract route paid for the only paywalled work added across
    batches 23–26 (Villa et al. 2012, the landmark for where the LSA begins at Border Cave); and
    **an agency record can disagree with the paper a card follows** — the Chauvet portal dates the
    occupations to ~36,500 and 30–31,000 where Quiles et al. give 37,000–33,500 and 31,000–28,000,
    so the discrepancy is recorded in the register and the card keeps its Quiles marker rather than
    being silently re-dated.
