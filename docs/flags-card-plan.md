# Flags — the card plan

**Flags is a DECK of World Geography** (`flags-world`, titled *The flags*, the third deck of
`geo-world` beside *The countries and territories* and *The capitals*). It is **233 cards**, `fl-001`–`fl-233`, and it asks one
question: the card shows a flag and nothing else, and the reader names the country or territory it
belongs to.

**IT SHIPPED AS A COLLECTION OF ITS OWN AND WAS MOVED ON REQUEST** (Sep 2026: "Flags should be a subdeck
of the World geography collection"), which is the right place for it and is worth recording as a shape
rather than as a correction: the cards ARE World Geography's cards asked a second way, so a sibling deck
says what a sibling collection did not. What the move cost, all of it mechanical: the `flags` rows in
`COLLECTION_SECTION`, `COLLECTION_ICON`, `COLLECTION_TARGET` and `COLL_THEME`, which a deck does not have
— it inherits `geo-world`'s deep green, and a deck inside a collection carries no icon (`adIconKey`) —
`geo-world`'s target grown from 471 to 704, and **`test-card-plans.js` rekeyed by PLAN SLUG rather than
by collection id**, since a collection may now carry two plans and keyed the old way the two could not
both be declared. **The measured sage grey `#6F7866` went with the collection**; the measurement is kept
in the batch log below, because the next collection that needs a hue will want it.

**It is the twin of the World Geography countries deck, id for id.** `fl-NNN` is the same entity as
`gw-NNN`, in the same running order, and **its whole answer side is `gw-NNN`'s** — the term, the date
line, the facts grid, the background and the citations — which is what the request asked for ("the answer
side of the card can be directly the same as the ones in the World geography collection"). A card here
therefore costs a flag file, a licence, an authored description of the flag, and a copy. **It costs no
research and no new glossary work at all**, and that is the whole reason a 233-card collection is
affordable in twelve batches rather than sixty.

📖 **`docs/world-geography-card-plan.md` is where the answer side comes from, and `docs/geography-card-plan.md`
describes the map card whose `answerFlag` field this collection reuses. Read the "What is in the list"
and "The background is the country's HISTORY" sections of the first before writing anything here** — this
plan inherits both and re-derives neither.

The next card to write is the lowest `fl-NNN` not yet in `data.js`:

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='fl-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

**F0 to F6 have shipped** (Sep 2026): the format is built, the deck is on the shelf under World
Geography, and `fl-001`–`fl-120` are live **less the deferred `fl-036`** — 119 cards, so the lowest
unused number is not the next card. The next card is `fl-121`. **THE TRIM-AND-COPY RANGE IS FINISHED**:
every flag already on a twin has been used, and from here every batch fetches. **114 twins still need a
flag** (`gw-121`–`gw-233` plus the deferred `gw-036`), and each batch back-fills the ones it uses, which
closes World Geography's own gap as a by-product.

**NO TWO CARDS MAY CARRY THE SAME DESCRIPTION**, which is this deck's own form of a duplicate question
and which nothing else in the pipeline can see: for a reader who cannot see the flags the alt IS the
question, so two cards sharing one are two identical questions with different answers, and both cards
render perfectly. `test-flag-cards.js` sweeps it, folded on case and punctuation. It has fired once — see
F4's Chad and Romania below.

---

## The format — a FLAG CARD

The question side shows the flag, large, and one short line of prose. The answer side is the World
Geography card's answer side unchanged, with the flag still on screen inside the answer box where a
`gw-` card already draws it.

**IT REUSES `answerFlag` RATHER THAN ADDING A FIELD, and that is the decision this format turns on.**
`answerFlag: { src, credit, alt }` has existed since Aug 2026, is what every `gw-` country card already
carries, and already does four things this format needs: it **refuses a `src` with no `credit`** (in
`answerFlag()` and again in `add-card.js`), it rides through `serializeCardData`, the cloud overlay and
`revertCard`, it **enlarges** into the site's own fullscreen viewer, and it is a `TIP_SEL` target so the
tap still lands with the marker down. A second field for the same picture would be a second copy of all
four, and the one that goes stale is the one nobody editing a flag has reason to open.

So a flag card is **`answerFlag` plus one boolean**:

```json
{ "id": "fl-001", "flagCard": true,
  "answerFlag": { "src": "https://upload.wikimedia.org/…/Flag_of_India.svg",
                  "credit": "Government of India, public domain, via Wikimedia Commons (…)",
                  "alt": "Three horizontal bands of saffron, white and green, with a navy-blue wheel of 24 spokes at the centre of the white band." },
  "question": "The country or territory whose flag is shown is <span class=\"blank\">_____</span>.",
  "questions": [] }
```

**THE BOOLEAN IS `flagCard`, NOT `flag`, AND THE NAMES MUST STAY APART.** A card already has a FLAG in
another sense — the reader's own 1–7 marker, `S.flags[id]`, read by `cardFlag(id)` — and `answerFlag`'s
own comment in app.js records what happened when a second module-scope `cardFlag` shipped for an hour:
the later declaration won for the whole file and every reader flag silently read as unflagged, with
nothing thrown. The accessor here is **`cardFlagSpec(c)`**, beside `cardMapSpec` and `cardArtSpec`, and
the field is `flagCard` so that neither name can be read as the other.

Seven things about the format are decisions rather than plumbing.

- **THE FRONT DRAWS THE FLAG AT ITS OWN SHAPE AND NEVER CROPS IT.** Flags run from 1:1 (Switzerland,
  Vatican City) through 2:3 and 1:2 to Qatar's 11:28, and Nepal's is not a rectangle at all. A fixed
  frame with `cover` would cut the canton off the one that most needs it, so the frame is a MAXIMUM and
  the picture is `object-fit: contain` inside it — the glossary image's own rule, for the same reason.
  **`.card-img` is deliberately not reused**, exactly as `answerFlagHTML` refuses it: that class carries
  a fixed 16:9 box and a `height:100%`, which would reshape the very thing being asked about.
- **A FLAG IS DRAWN ON A GROUND, BECAUSE SEVERAL FLAGS HAVE WHITE AT THE EDGE.** Japan, Qatar's hoist,
  the Nordic crosses and every flag with a white border vanish into a light card and are cut in half by a
  dark one. The frame carries a hairline in `--rule` and the same paper the card's other frames use, so
  the flag's own edge is always visible. **Look at Japan and Switzerland at both light and dark before
  calling the frame finished** — those two are the whole test.
- **THE PROMPT IS ELEVEN WORDS AND ENDS ON THE BLANK, which is the map card's exemption applied here.**
  "The country or territory whose flag is shown is ____." is deliberately the same sentence
  `gw-001`–`gw-233` use with *shaded on the map* swapped out, because the two decks are the same question
  asked two ways and the reader should hear that. `add-card.js` and `check-questions.js` both exempt a
  map card from the 20–34-word rule and from the blank-mid-sentence rule; a flag card takes the same
  exemption from both, and is still held to the first two question rules (one sentence, understandable on
  its own).
- **IT CARRIES NO EXTRA PHRASINGS.** `"questions": []`, for the map card's reason: the picture is the
  clue, and three ways of saying "name this flag" are three ways of saying nothing.
- **THE ALT TEXT DESCRIBES THE FLAG AND MAY NOT NAME THE ANSWER**, which makes this format as accessible
  as the artwork card and more so than the map card. A shape on a globe cannot be described without
  answering the question; **a flag can** — *"three horizontal bands of saffron, white and green, with a
  navy-blue wheel of 24 spokes"* is a real question for a reader who cannot see it, and an honest one.
  `add-card.js` refuses a `flagCard` whose `answerFlag.alt` contains the answer term, the artwork card's
  own guard.
- **IT IS KEPT OUT OF THE TEXT-ONLY MINIGAMES BY CONSTRUCTION.** `gameCardIdSet` tests `cardFlagSpec`
  beside `cardMapSpec` and `cardArtSpec`: the games deal a term cold with no picture, and a flag card's
  whole question is the picture. Like those two this needs no editorial judgement and therefore no field,
  and for the same reason **`undatable` must not be set on one** — Timeline is behind the same filter
  already.
- **IT IS NOT A COMMUNITY-DECK FIELD.** `CARD_FIELDS` does not carry `answerFlag` and must not learn to,
  so a stranger's deck cannot ship a flag card and nothing has to sanitize one.
- **THE CREDIT IS IN THE VIEWER AND NOT ON THE CARD** (Sep 2026, on request: "the image box should not
  show the image source or link on the card, only when it is clicked to enlarge should it say the source
  info"). `cardFlagReveal` wrote a `figcaption` under the frame for a day, which put two lines of Commons
  URL under every flag — on a card whose whole front is one picture. The figure carries the `data-img-*`
  attributes and no caption instead, and `openMediaViewer` draws the credit under the ENLARGED picture.
  **It is the picture round's own trade**: the attribution the licence asks for is one press away rather
  than in front of the reader before the picture has done its job, and the press is real —
  `.flag-shot.revealed` is in `IMG_OPEN_SEL`. **The enlargement and the credit are gated TOGETHER, on
  the reveal**, because the viewer is what says the source: opened from the question side it would print
  the country's name. `test-flag-cards.js` opens the viewer and reads the credit out of it rather than
  trusting the attribute, and asserts the same press does nothing on an unrevealed card.
- **ONE LEAK IS ACCEPTED, AND IT IS STATED RATHER THAN PAPERED OVER.** Commons names every national flag
  `Flag_of_<Country>.svg`, and a `src` is copied from the API and never composed or rewritten, so **the
  answer is in the URL on all 233 cards.** Measured: 20 of 20 flag cards have it against 0 of 10 artwork
  cards, whose file names happen not to match their titles, so it is this format's property rather than
  the site's. What follows is narrow — no reader is SHOWN a src: it is not rendered as text and a screen
  reader reads the authored `alt`, so the answer is reachable only by opening devtools, viewing source,
  or long-pressing the picture on a phone to read its file name, all of which are going looking for the
  answer. **`test-flag-cards.js` asserts the country appears in the `src` AND NOWHERE ELSE on the
  front**, so the accepted leak cannot quietly widen into a title, a credit or a caption.

### The one open option: the country's shape on the answer side

The best version of this card shows the flag, takes the reader's answer, and then draws the country on a
globe beside its name — the two geography decks teaching each other. It is nearly free in data terms,
since `gw-NNN` already carries the `map` block that would do it, and the machinery exists
(`mountCardMaps` / `cardMapReveal` already draw and reveal a map window).

**It is NOT part of F0 and it is the one piece of real app.js work here**, because a card carrying `map`
today IS a map card — the window goes on the FRONT and shades the answer — so this needs a way of saying
*draw this window on the BACK, named from the first frame*, which is what `locator` means for a place and
what a country has no authored `area` for. Two candidates, both stated so the next session does not
re-derive them: teach `mountCardBack` to draw a `map` block as an annotation when the card is a flag
card, or give the flag card a `locator` whose `kind` is a new `shape` reading the `world.js` key. **Decide
it before F1 if it is wanted**, because retrofitting it means touching 233 shipped cards; ship without it
and the collection is complete and honest either way.

## What is in the list, and what is not

**The 233 are World Geography's 233, inherited rather than re-derived.** That plan's three rules — an ISO
3166-1 code of its own, a shape in `world.js`, a settled population and an administrative seat — settle
the membership, and they are not re-argued here. Rule 2 is inherited **even though this deck draws no
shape**, and that is deliberate: an entity with no `gw-` twin would have no answer side to copy, so
keeping the two decks identical id for id is worth more than a membership list of this deck's own. The
deck is called *The countries and territories* and every question asks for "the country or territory",
which is true of all 233 and asserts nothing about the sovereignty of any.

**A FOURTH RULE IS THIS DECK'S OWN: Commons must host a free file that is simply that entity's flag.**
It has exactly one failure and it is already recorded in the World Geography plan:

**`fl-036` AFGHANISTAN IS DEFERRED, and it is the Afghanistan decision one collection over.** Commons
redirects `Flag_of_Afghanistan.svg` to `Flag_of_the_Taliban.svg`, whose own file page calls it the flag
of the Islamic Emirate; drawn unlabelled, that shape asserts who legitimately governs, and drawing the
2004–2021 republic's instead asserts the opposite. `gw-036` ships with no flag at all for that reason,
which a map card can do because its question is the shape. **A flag card cannot: the flag IS the
question**, so there is no card to write and the number is reserved and left unused, exactly as
`gw-596` Jerusalem, `gw-624` Palestine's seat and `gw-695` Saint Helier are. **The deck is therefore 232
of 233 writable, with one deferral and no gaps.** If it is ever revisited, the two candidate files are
named in the World Geography plan and either is one line of JSON.

**And the Syrian flag is the same test with the opposite answer** — `Flag_of_Syria.svg` redirects to a
dated filename whose own description says it is the flag of Syria, so the file is the country's flag and
`fl-057` carries it. **Read the file page before treating a redirect as a refusal**, and record the
reading in the batch log either way.

## How the running order was chosen

**By population, largest first — because `gw-` is.** It is also the right order for this subject on its
own merits, which is what makes the inheritance costless: a learner meets India, China and the United
States, whose flags they half-know already, and works down towards the atolls and the overseas
territories, which is where a flag deck earns its keep. Alphabetical would open on Afghanistan (deferred),
Albania and Algeria.

**THE ORDER IS FIXED AT PLANNING TIME AND IS NOT RE-SORTED**, for World Geography's own reason and one
more. A card id is a permanent address — what `data.js` files the card under, what `flags-world`'s
`cardIds` lists, what a reader's schedule is keyed by and what a shared study link points at — so
re-sorting would repoint every one of those. And here it would break the twin rule as well: the pairing
`fl-NNN` = `gw-NNN` is what `check-flag-twins.js` checks and what makes the copy mechanical.

**A continent tree was considered and rejected.** Ordered study deals in the order of appearance in the
TREE, so decks by continent would deal Africa's 54 flags before Europe's and lose the familiar-first
order the population sort gives. A reader who wants one continent reaches it through the card browser's
`tag:` search — the Visual Art plan's own answer to the same trade — and **the tags are load-bearing here
for that reason**: every card copies its twin's continent and country tags, so `tag:africa` and
`tag:asia` work on the day the collection ships.

**One deck, and the section has room for more of them.** `flags-world` is the only deck this plan
numbers. The natural extension is subnational flags — the fifty state flags of the United States and the
thirty-one of mainland China — and those belong in `geo-us` and `geo-china` beside the shapes they go
with rather than here, each as a third deck of its own collection on the pattern this one now follows.
**Nothing is declared now**: the Politics plan's rule is to widen a registered numbering as work lands
rather than to declare a range and leave it full of holes.

## What a card copies, and what it does not

From `gw-NNN`, verbatim: **`answer`, `answerText`, `answerDate`, `abstract`, `sources`, `facts`, `tags`,
`difficulty`, `category`**. The abstract carries its footnote markers and the source list carries its
citations, so a flag card ships at the five-source bar the day it is written, with nothing to research.

Not copied, each for a reason:

- **`image`** — the landmark photograph. The flag is this card's picture and satisfies the picture rule on
  its own; copying 233 photographs across two collections would make 233 deliberate duplicate pairs, which
  is exactly the noise `check-cards.js` rule 3 reports. ⚠ **That rule's "a card with no picture" check
  (rule 5, reported and never failed) does not know about `answerFlag`**, so it will report all 233 unless
  it is taught the field in F0. Teach it.
- **`map`** — a `map` block makes a map card, whose window goes on the front and shades the answer. See
  the open option above.
- **`questions`** — `[]`, per the format.
- **`locator`**, **`war`**, **`quote`**, **`why`**, **`leadsTo`** — none of the 233 twins carries any of
  them.

**`difficulty` IS COPIED, AND THAT IS AN APPLICATION OF THE HOUSE RULE RATHER THAN LAZINESS.** The scale
rates **how well known the ANSWER TERM is to the general population**, and the answer term is the same
country, so the number is the same number. It does **not** rate how hard the flag is to recognise —
Chad's and Romania's are famously hard to tell apart and both countries are ordinary 3s — and conflating
the two is the one way that scale stops meaning anything. If a *flag recognisability* rating is ever
wanted it is a second field, not a re-use of this one.

**`tags` gains one row: `flag`.** Tag 1 stays `place`, which is the KIND its twin leads with and a kind
233 other cards also lead with (`tagKinship` caps a card whose leading kind is unique at 2 against
everything in the corpus). `flag` goes in among the subject areas, where it is shared by all 233 and so
groups.

## The alt text is authored, and the 115 that exist need trimming rather than writing

**115 of the 233 `gw-` country cards already carry `answerFlag` with a written description**, and every
one of the 115 begins *"The flag of ⟨country⟩: "* — which is right on a card whose answer is already on
screen and wrong here, where it hands over the answer. The transformation is: **cut the prefix, capitalise
the first letter, read the rest.**

**It must be READ and not swept, and one case in 115 proves it.** `gw-074` Zimbabwe's description names
the **Zimbabwe Bird**, which is the emblem's own name, so the trim leaves the answer standing in the
middle of the sentence; it becomes *"a soapstone bird emblem"* or similar. Measured over all 115, that is
the only one — but the measurement is the reason to look, not a licence to skip looking. `add-card.js`'s
answer-term guard catches exactly this class and is the backstop rather than the check.

The other **118 need the description written**, and they are `gw-036` Afghanistan (deferred) plus
`gw-117`–`gw-233` contiguous: the World Geography flag pass simply stopped at `gw-116`. Each is three or
four clauses — the field division, the colours in hoist-to-fly or top-to-bottom order, the charge — in
about twenty words, which is what the shipped 115 average.

**The fetch serves both decks, so each batch back-fills its twin.** A batch that fetches a flag for
`fl-150` writes the same `{ src, credit, alt }` onto `gw-150`, whose own `alt` keeps the *"The flag of
X: "* prefix that belongs there. That closes a real gap in World Geography — half its country cards have
no flag — as a by-product of building this collection.

### Fetching a flag

- **The `src` is COPIED FROM THE API, NEVER BUILT BY HAND.** An upload URL carries a two-character shard
  that is the head of the file name's MD5 and cannot be guessed. Ask `api.php` for `imageinfo` with
  `iiprop=url` and take `url`. **Do not grep for a host either**: `thumburl` now answers
  `thumb.wikimedia.org` where it used to answer `upload.wikimedia.org`, both resolve, and nothing is
  rewritten on a consistency preference.
- **The shipped 115 all use the `.svg` file directly**, not a PNG thumbnail, and that is the convention
  to keep: an SVG in an `<img>` cannot run script, it scales to any frame, and a flag is exactly the
  picture a vector serves best.
- **A national flag on Commons is almost always public domain** — a government work, or below the
  threshold of originality — and the file page states it. `credit` is required and the licence bar is the
  pipeline's: PD, CC BY or CC BY-SA, never NC or ND.
- **Check the page URL for `'` and `()` before choosing the file.** `SRC_URL_RX` stops at a closing
  parenthesis and at an apostrophe, and two shipped flag credits already carry parentheses
  (`File:Flag_of_Belgium_(civil).svg`, `File:Flag_of_the_United_Kingdom_(3-5).svg`). Percent-encode:
  `%27`, `%28`, `%29` carry none of the stopped characters, resolve on Commons and match the regex whole.
- **`upload.wikimedia.org`'s `api.php` can be 429 while the files serve perfectly**, and the World
  Geography batches measured the useful asymmetry: **flag SVGs returned 200 in the same seconds that
  every JPEG and PNG returned 429.** `Special:FilePath/<FILE>?width=N` (with `curl -L`) fetches the
  picture and `/wiki/File:<FILE>` serves the description page carrying the author and the licence.
- **LOOK AT EVERY FLAG.** `.claude/contact-sheet.py` tiles a fetched batch into one image, which is how
  twenty of them are read at a glance. The faults to expect are a **historical** flag under a current
  name, a **civil vs state** variant (Belgium and the United Kingdom are already in the corpus as
  parenthesised variants), a **naval ensign**, and a file that is a coat of arms rather than a flag.

## Sourcing — there is none, and that is the point

A flag card's claims are its twin's claims, already cited at `SRC_TARGET` and already checked. **Do not
open a research pass here.** Two consequences:

- **`node .claude/check-citations.js --card=fl-NNN` will report exactly what it reports for `gw-NNN`**,
  which is the correct answer and not a second opinion worth collecting.
- **A CORRECTION TO A `gw-` BACKGROUND MUST BE CARRIED TO ITS `fl-` TWIN IN THE SAME COMMIT.** This is
  the one real maintenance cost the collection creates and the only one, and nothing on the page can see
  a drift: both cards render perfectly while saying different things about the same country. **`node
  .claude/check-flag-twins.js` is the answer** (F0): it asserts every shipped `fl-NNN`'s copied fields
  are byte-identical to `gw-NNN`'s, names each field that has drifted, and is report-only so a
  deliberate divergence can be declared rather than fought. Run it after any batch that touches either
  deck.

## The glossary — nothing to write

**All 233 countries and territories are already cited glossary terms**, from batches C0–D3 of the
glossary citation pass, every one at the two-source bar and inside the 100-word band. The pairing rule is
discharged by a term that already exists, so a flag card needs no glossary work at all.

⚠ **Do NOT run `add-glossary.js` for one of these terms.** It overwrites in silence and answers
`updated glossary term` rather than `added` — which is how a four-source description of the Phoenician
alphabet was replaced by a two-source one, with every audit still reporting a fully cited glossary.
**Check before running it.**

## Why-questions — out, for geography's reason

The Think-it-through pass covers the History and Science sections and excludes Geography, because a map
card's back is a figures grid with no prose to draw an answer from. A flag card's back **does** carry
prose — its twin's background — so it could carry a `why` set, and that is worth stating rather than
leaving as an apparent oversight. It is still **out**: the twin does not carry one, 233 authored sets is
a pass of its own, and if it were ever wanted both twins would want the same set, written once and
copied in the direction everything else here travels.

## The minigames

**Excluded from the text-only games by construction** (`gameCardIdSet`, above). **Not added to the
picture round in the first pass**, and that is a decision: the picture round draws from the artefacts and
the artwork cards, whose pictures ARE their subjects, and a flag qualifies on exactly that test — but a
flag round is a change to a GAME rather than to a collection, it wants its own decoy ranking (four flags
of similar design rather than four tag-near countries), and the round is already fed by two pools. **If
it is wanted, it is one entry in `picturePool` and a decoy rule, and it should be its own request.**

---

## The batches

**Twelve batches of twenty, and the work is front-loaded easy.** F1–F6 cover `fl-001`–`fl-120`, where
115 of the flags are already fetched and licensed on their twins and the work is the alt trim, the copy
and the read-through. F7–F12 cover `fl-121`–`fl-233`, where every flag has to be fetched, looked at and
described — and where each batch also back-fills its twin, closing World Geography's own gap.

**Per batch, in order:**

1. **Fetch** any flag in range whose twin has none (`.claude/add-flags.js`, F0), reading each file page
   for its licence and author and for the redirect test above.
2. **Contact-sheet the batch** and look at every flag. Reject a historical flag, a variant, an ensign or
   a coat of arms, and record the rejection.
3. **Back-fill the twin** — write `{ src, credit, alt }` onto `gw-NNN` with the *"The flag of X: "* alt
   that belongs there.
4. **Write the description** for the flag card: trim the twin's where it exists, author it where it does
   not, and read each one against its own flag.
5. **Build the cards** (`.claude/add-flag-cards.js`, F0) — it copies the answer half from the twin,
   writes the prompt, the boolean and the trimmed alt, and refuses a card whose alt names its answer.
6. **Check**: `node .claude/check-flag-twins.js`, `node .claude/test-flag-cards.js`,
   `node .claude/test-card-plans.js`, `node .claude/check-questions.js`,
   `node .claude/check-style.js`, `node .claude/check-cards.js --prefix=fl- --report`.
7. **Look at three cards in a browser** — front and back, light and dark, at phone width. A flag deck is
   the one collection whose every card is a picture, so the frame is the feature and it is not finished
   until it has been looked at.
8. **Bump the version and write the changelog line**, one line per day, counted rather than named
   ("Twenty new cards in the Flags collection").

### F0 — the format, the collection and the tooling (no cards)

Everything below ships together, because none of it is testable alone.

**In `data.js`** — `flags-world` ("The flags") as a third child of the `geo-world` collection node.
**ITS TITLE MAY NOT BE "The countries and territories"**, which is what it shipped as while it was a
collection of its own and which is its new SIBLING's title — two decks of one collection under one name.
Found by reading a card's own breadcrumb, which no checker looks at. **Edit the tree as TEXT**: `writeCards` splices the collection tree back verbatim and
ignores the `tree` it was handed, so a helper that mutates the tree reports success and writes none of
it. Afterwards sweep for a registered id with no card behind it, and for an `fl-` card that is not
placed in the tree at all.

**In `app.js`** — `cardFlagSpec(c)` beside `cardMapSpec`; the front-side renderer and its frame in
`styles.css`; `cardFlagReveal`, which credits the front's flag once the answer is out; `cardFlagSpec` in
`gameCardIdSet`; `flagCard` through `serializeCardData` and `revertCard`; the answer-box drop in
`showAnswer`; `.flag-shot.revealed` in `IMG_OPEN_SEL`; and `COLLECTION_TARGET["geo-world"]` raised by
this deck's 233. **A DECK NEEDS NO HUE, NO SECTION ROW AND NO ICON** — it inherits its collection's.

⚠ **The icon is the READER'S PICKER MARK AND NO COLLECTION'S, now that Flags is a deck** — a deck
inside a collection draws no icon — so what follows is the record of drawing one rather than a step.
**A mark has to be DRAWN and LOOKED AT.** `ICON_SYMBOLS` has no flag mark — the 44 keys are pagoda,
globe, column, wreath, star, dome, lotus, pyramid, plane, torii, head, owl, helix, sauropod, taegeuk,
wall, compass and the rest — so this collection needs a new one (a pennant on a staff: a vertical stroke
and a triangle, which is the kind of mark that survives 28px on a deck row). **A collection with no
`COLLECTION_ICON` row falls through to a stack of cards**, which is honest and says nothing about the
subject, so shipping without the mark is a real option and shipping an unlooked-at mark is not. The
laurel-wreath note in app.js records what happens at 28px to a mark with one detail too many.

**In `.claude/`** —

- **`add-flags.js`** — fetch a flag from Commons and write `answerFlag` onto a card that already exists.
  Nothing today can do this: the 115 shipped ones were written inline by `add-card.js` at card creation,
  so there is no batch writer for the field at all. It refuses a `src` with no `credit`, refuses a
  non-free licence, and writes through `card-io.js` like every other helper.
- **`add-flag-cards.js`** — build `fl-NNN` from `gw-NNN` plus a supplied alt. It validates the whole
  batch before writing anything, splices lines rather than re-serialising `data.js`, and goes through
  `.claude/card-io.js`.
- **`check-flag-twins.js`** — the drift check described above. Report-only, exits 0.
- **`test-flag-cards.js`** — the format's own suite, on `test-artwork-cards.js`'s model. **Every fault
  this format can have renders perfectly**, so the assertions are: the front draws the flag and **no**
  title, description or credit (a Commons credit line routinely names the country, which would hand over
  the answer); the front draws no extra phrasings and no prose but the prompt; the flag is CONTAINED and
  not cropped, measured against its own intrinsic ratio; the answer side draws the term, the facts grid
  and the date line; the alt names nothing; and the card is absent from `gameCardIdSet`. **Serve the flag
  file itself** — an artwork suite that did not learned that an unreachable picture fires the dead-media
  path and reads as the format being broken.
- **`add-card.js`** — the `flagCard` guards: requires `answerFlag` with `src`, `credit` and `alt`;
  refuses `map` and `artwork` alongside it; refuses an alt containing the answer term; takes the map
  card's word-count and blank-position exemptions; requires `"questions": []`.
- **`check-questions.js`** — the same two exemptions, sliced from `add-card.js` rather than copied.
- **`check-cards.js`** — teach rule 5 (a card with no picture) that a flag card's picture is its
  `answerFlag`, or it reports all 233.
- **`test-card-plans.js`** — a `PLANS` row: `flags: ["flags", "fl-", [[1, 233]]]`.

**In the docs** — this file, its `📖` pointer in `CLAUDE.md` and its line in `docs/README.md` are
already written. What is NOT yet written, and belongs in this batch, is **the row in CLAUDE.md's index
table, the count in that table's heading and the `PLANS` entry in `test-card-plans.js`** — all three
assert that the collection exists in `data.js`, so all three go in with the tree node and not before.
`node .claude/check-docs.js` and `node .claude/test-card-plans.js` check both directions.

---

# The batch log

Each batch appends its own entry here: which flags had to be rejected and why, which redirects were read
and which way they were decided, which alts needed a hand edit, and which hosts answered.

## F0 — the format, the collection and the tooling (Sep 2026)

Built as specified above, with four things worth recording because the plan did not predict them.

**THE `why` REQUIREMENT HAD TO BE EXEMPTED AND THE PLAN HAD ONLY SAID SO IN PROSE.** `add-card.js`
refuses a card with no Think-it-through set and exempted only `card.map`, so the very first card was
turned away. The plan's "Why-questions — out, for geography's reason" was a decision that had never been
translated into a guard, which is the shape to watch for when a plan says a rule does not apply: **the
tools do not read the plan.** `whyExempt` in `.claude/card-links.js` now covers `flagCard` — with its own
argument beside the map card's rather than folded into it, because the reasons genuinely differ: a map
card's back is a figures grid with no prose to draw an answer from, and a flag card's back is its twin's
background, from which a set COULD be written and which is out because both twins would want the same
three questions written once and copied.

**AND `add-card.js` WARNED ABOUT THE FIGURES GRID ON EVERY CARD.** `facts` without `map` draws a
"check it was meant" warning, which is right on an ordinary card and would have been 233 lines of noise
about the format working. Exempted beside the artwork card, which was already exempt for its own reason.

**THE HUE IS THE FIRST ON THIS SHELF WHERE APTNESS COULD NOT DECIDE AT ALL**, and that is worth stating
because the next collection may be in the same position. Every other hue has a colour to argue from — a
malachite, an Aegean blue, a Morrison sandstone; a flag collection has 233 palettes and no hue that is
its subject's rather than one member's. So separation decided: the whole wheel's best regions are the
magenta (#BA4BA5, ΔE 28.3 — **rejected for the eighth time**, still the loudest thing that could go on a
muted shelf) and the olive-brass (#5D5700, 22.0 — **rejected for the fifth time** as another member of
the crowded yellow-green-brown quarter). Outside those the best region left is the sage grey **#6F7866**,
23.6 from the Second World War's dark iron, 23.6 from Egypt's malachite and 24.0 from the Italian deck's
green — three different families, which is what keeps it from being a fourth green. At chroma 11 the
banner wash is very quiet; that is the shelf's own register and the trade is stated rather than hidden.

**THE ICON WAS DRAWN AND LOOKED AT**, which the laurel-wreath note in app.js says cannot be skipped and
which a session with no browser cannot do. Four candidates were rendered at 28px and 34px: a plain
rectangle is legible but reads as a bookmark, a **swallowtail's notch closes into a filled wedge** at
28px, a triangular pennant is clean and is not what a national flag is, and the **wave** survives — the
shallow curve on both edges is still visible — and is the one that says "flag" at a glance.

## F1 — `fl-001` to `fl-020` (Sep 2026)

Twenty cards, India to Thailand. **No flag had to be fetched**: all twenty twins already carried one, so
the batch was the alt trim, the copy and the read-through, which is what the first six batches are.

**ALL TWENTY ALTS DERIVED CLEANLY** — the prefix cut and the first letter capitalised — and all twenty
were read. Nothing needed a hand edit, which is the expected result in this range and not a reason to
stop reading: `gw-074` Zimbabwe, in F4, is the one case in 115 that the trim cannot fix.

**ONE REAL LIMITATION FOUND BY READING, AND IT IS A FACT ABOUT THE FLAGS RATHER THAN THE CARDS.**
`fl-004` Indonesia's description is "Two equal horizontal bands, red above white", which is **also
Monaco's flag** (`fl-215`) — the two differ only in proportion, 2:3 against 4:5. A reader who cannot see
the picture therefore cannot separate those two cards, and neither can a reader who can: it is a real
property of the two flags. It is left as it stands rather than padded with a ratio, and recorded here so
that **F11 reads `fl-215` against this entry** rather than discovering it a second time. Poland's is the
same pair the other way up (white above red) and is distinguishable by the description.

**WHAT A FLAG CARD COSTS THE EAGER PATH, MEASURED: 3,321 bytes gzipped for twenty, or 166 bytes a
card** — so the finished 233 will be about 38 KB. The light half of a flag card is the prompt, the
`answerFlag` (a URL, a credit and a description) and the copied `facts`, date line and tags; the
background and the citations are in `data-extra/fl.js` and are fetched when a reader reveals a card.
**MEASURE IT BY GZIPPING `data.js` BEFORE AND AFTER, NOT OFF `check-sizes.js`**, whose display is
rounded to hundredths of a megabyte — the war-card bullet's own lesson, where a 2 KB change showed as
0.01 MB and was written up as a figure five times too big.

**THE CARDS WERE LOOKED AT**, front and back, light and dark, at phone width — Japan, Thailand and
Germany. Japan is the ruled-ground test and it passes in both directions: the white field is bounded by
the frame's paper letterbox by day and by the dark card at night, so the flag keeps its own edge either
way. The flag being on screen twice after the reveal — large on the front as the question, small and
credited beside the name — reads as confirmation rather than duplication, which settles a question the
plan had left open in favour of keeping both.

**Two notes for whoever screenshots the next batch.** Chromium under Playwright does NOT honour
`HTTPS_PROXY`, so the Commons flags do not load and the card's own dead-file path fires, which reads as
the format being broken; passing `proxy: { server: process.env.HTTPS_PROXY }` did not fix it either.
What works is downloading the SVGs with curl and fulfilling the route from disk — which is also what
`test-flag-cards.js` does, and for the reason its header gives.

## F2 — `fl-021` to `fl-040` (Sep 2026)

Nineteen cards, the United Kingdom to Angola. **`fl-036` Afghanistan is the deck's one deferral** and was
simply left out of the batch; the number stays reserved and the plan's running order carries it as
`DEFERRED`, so `test-card-plans.js` fails if a card ever ships there. **The deck is therefore 39 cards
over a range of 40, and the lowest unused number is not the next card** — the shape `cnh-070` already has
one collection over.

**No flag had to be fetched and all nineteen alts derived cleanly.** All nineteen were read. Two findings,
both about the FLAGS rather than the cards:

**A DESCRIPTION MAY NAME AN EMBLEM, and three of these do** — South Korea's *taegeuk*, Kenya's *Maasai
shield*, Uganda's *crested crane*, beside F1's *eagle of Saladin*. None names its country, so
`add-card.js`'s guard passes them and they are right: the alt's job is to describe what is ON the flag,
and the emblem's own name is the accurate description. A reader who knows the word has the answer —
and so does a reader who can SEE the emblem, which is the trade this format makes everywhere.

**THE PLAIN MEMBER OF A FAMILY IS THE EASIEST ONE TO DESCRIBE, which is worth knowing because it reads
like a fault.** `fl-038` Yemen is "three equal horizontal bands of red, white and black" and nothing
else — the same field as Egypt's (`fl-013`, plus an eagle), Iraq's (`fl-034`, plus script) and Syria's
(plus stars). The bare description is therefore UNIQUELY Yemen among them, and the family is
distinguishable to a reader who cannot see any of them. The same holds for `fl-025` Italy against
`fl-011` Mexico, whose alt carries the coat of arms.

**THREE FAULTS WERE FOUND BY LOOKING AT A CARD, AND NOT ONE OF THEM BY A CHECKER.** The deck had kept
the title it shipped with as a collection, *The countries and territories*, which is its new SIBLING's
title — so a card's breadcrumb read "WORLD GEOGRAPHY · THE COUNTRIES AND TERRITORI…" and named the wrong
deck; it is *The flags* now. The revealed flag's credit ends in its Commons URL, which contains no break
opportunity, so the address ran out past the frame's rounded edge — `.flag-cap` takes
`overflow-wrap:anywhere`, and only a long file name shows it (`fl-029`'s did; the shorter credits hid
it). And the answer box's flag had to go with the credit moved to the front, which is the request this
batch shipped under and is described in the format section above.

## F3 — `fl-041` to `fl-060` (Sep 2026)

Twenty cards, Ukraine to Taiwan. No flag had to be fetched. **Eighteen alts derived cleanly; two were
authored**, and both for the same reason:

**A DERIVED ALT CAN CARRY A WORD FROM INSIDE THE FIELD, AND AN ALT CANNOT GLOSS IT.** CLAUDE.md holds
every card field to an upper-secondary vocabulary, where genuinely specialist vocabulary earns a brief
gloss on first use — and an alt has nowhere to put one. `fl-043` Uzbekistan derived "separated by thin
red **fimbriations**", which is the correct vexillological word and is not English a general reader
meets; it says "separated by narrow red stripes" instead. `fl-045` Saudi Arabia derived "the **shahada**
in white **Thuluth** script above a white sword" and says "a white Arabic inscription above a white
sword" — what a viewer actually sees, and one specialist term fewer than the emblem names F2 kept
(a *taegeuk* and a *Maasai shield* are the NAMES of things on the flag; a *fimbriation* is a word for a
stripe). **Their `gw-` twins carry the same words**, where the alt is a caption beside an answer rather
than the question itself; those are left alone, and are recorded here rather than swept.

**FOUR NEAR-PAIRS IN THIS RANGE, EACH DISTINGUISHED BY ONE CLAUSE, which is the thing to preserve when a
later batch reaches the other half.** `fl-042` Poland (white above red) against F1's `fl-004` Indonesia
and `fl-215` Monaco (red above white) — the same family the other way up. `fl-050` Côte d'Ivoire
(orange, white, green) against `fl-121` Ireland (green, white, orange) — **the same three colours in the
opposite order, which is the only difference there is**, so both alts must state the order hoist to fly.
`fl-058` Mali (green, yellow, red) against `fl-068` Senegal, which adds a green star, and `fl-075`
Guinea, which reverses it. And `fl-048` Peru (red, white, red vertical) against `fl-037` Canada, which
adds the maple leaf. **In every case the plain member is the one that describes most easily**, which is
F2's Yemen finding again.

**`fl-057` SYRIA IS THE AFGHANISTAN TEST WITH THE OPPOSITE ANSWER**, as the World Geography plan records:
Commons redirects `Flag_of_Syria.svg` to a dated filename whose own description calls it the flag of
Syria, so the file is the country's flag and the card carries it — where Afghanistan's redirect lands on
a file named for a faction and `fl-036` is deferred. The card carries the three-starred flag adopted in
December 2024.

## F4 — `fl-061` to `fl-080` (Sep 2026)

Twenty cards, Sri Lanka to Tunisia, and the last of the range where the flags are already on their
twins. No flag had to be fetched. **Seventeen alts derived cleanly and three were authored**, and the
three are three different reasons.

**`fl-074` ZIMBABWE IS THE CASE THE PLAN NAMED IN ADVANCE, and the tool refused it rather than shipping
it.** The emblem the flag bears is called the **Zimbabwe Bird**, so the country's name sits in the middle
of the sentence where the trim only cuts a prefix — `add-flag-cards.js` stopped the batch and printed the
derived text. It is described by what it IS instead: *a soapstone bird*, which is the carving from Great
Zimbabwe and names nothing. **One case in 115, as measured when the pass opened**, and the refusal is
what makes the other 114 safe to derive.

**`fl-065` CHAD AND `fl-067` ROMANIA DERIVED BYTE-IDENTICAL ALTS, WHICH IS A FAULT NO CHECKER HAD.** Both
are "three vertical bands, blue, yellow and red", because that is what both flags are — and for a reader
who cannot see them that is two identical questions with different answers. **Measured off the two SVGs
rather than asserted**: the blues differ by ΔE 14.1 (Chad `#002664` at L 17 and chroma 43, Romania
`#002B7F` at L 21 and chroma 56), where the yellows differ by 4.2 and the reds by 8.4. So the BLUE is the
one describable difference and each alt names its own — *dark indigo* against *cobalt blue*, which are
also the conventional names for these two flags' blues. **A duplicate-description sweep is now in the
suite**, which is the general answer; this pair is the particular one.

**THREE MORE NEAR-PAIRS HELD, and one is still owed.** F3 predicted `fl-069` Senegal against `fl-058`
Mali and `fl-075` Guinea — all three shipped in this range or the last, and the star and the order
separate them, as predicted. `fl-079` Bolivia against `fl-047` Ghana is the same shape (the star). **What
is still owed is `fl-072` NETHERLANDS against LUXEMBOURG** (`fl-166`, in F9): red-white-blue horizontal
against red-white-light-blue, differing only in the blue — the Chad/Romania case exactly, one pair
apart. **Measure Luxembourg's blue against `#21468B` when F9 reaches it** and give each alt its own,
rather than discovering the collision when the sweep fires.

## F5 — `fl-081` to `fl-100` (Sep 2026)

Twenty cards, South Sudan to Switzerland. No flag had to be fetched and **all twenty alts derived
cleanly** — the only batch so far that needed no authoring at all.

**FOUR NEAR-PAIRS ARE OWED TO LATER BATCHES, and this is the list to read before writing them**, since
in each case the clause that separates them has to be in BOTH alts:
· `fl-084` **Jordan** is black-white-green with a red hoist triangle bearing a **seven-pointed star** —
  `fl-124` **Palestine** (F7) is the same flag WITHOUT the star, so Palestine's alt must not invent one.
· `fl-087` **Cuba** is five **blue** and white stripes with a **red** triangle — `fl-135` **Puerto Rico**
  (F7) swaps the two colours, so both alts must state them.
· `fl-098` **Austria** is red-white-red horizontal — `fl-152` **Latvia** (F8) is the same in a darker
  carmine with a narrower white band, which is all the difference there is.
· `fl-093` **Sweden** is a yellow Nordic cross on blue; `fl-119` Norway and `fl-115` Denmark shipped in
  F6 and are distinguishable, but **`fl-177` Iceland** (F9) reverses Norway's colours and is owed the
  same care.

## F6 — `fl-101` to `fl-120` (Sep 2026)

Twenty cards, Sierra Leone to Slovakia, and **the first batch to FETCH**: `fl-117` Finland, `fl-118`
Liberia, `fl-119` Norway and `fl-120` Slovakia had no flag on their twins, so this batch built
`.claude/add-flags.js` and used it. All four came back **public domain**, were looked at on a contact
sheet, and their descriptions were written from the pictures and back-filled onto `gw-117`–`gw-120` in
the house form.

**THE FETCHER'S OWN TWO FINDINGS, both measured on its first run.**
**A 429 IS A BUSY HOST AND NOT A SHUT ONE** — `check-reach.js`'s finding, met here: at 350ms between
calls, two of four files returned `HTTP 429` and both resolved on a retry. The tool backs off and tries
three times before calling it an error, and the gap between files is 1.2s. **A fetcher that treats a 429
as a refusal reports a working Commons as blocked**, which is the worst answer this tool can give.
**AND THE PROXY IS WHY IT WORKS AT ALL**: Node's built-in `fetch` does not honour `HTTPS_PROXY` where
curl does, so the tool re-execs itself once with `NODE_USE_ENV_PROXY=1` — the same guard
`check-reach.js` carries, for the same reason, and without it every request would go direct and the
egress policy would answer for Commons.

**`fl-109` NICARAGUA AND `fl-112` EL SALVADOR DERIVED IDENTICAL ALTS — the Chad and Romania case a second
time, and the sweep this deck now carries is what caught it.** Both flags are blue-white-blue with a
central coat of arms, so both derived exactly that sentence. **Looked at side by side** they are plainly
different: Nicaragua bears a BARE gold-edged triangle — five volcanoes, a rainbow, a red cap — where El
Salvador's triangle stands among **five flags on staves inside a green wreath**. The bands differ too,
measured off the two files at **ΔE 14.9** (`#0067c6` at L 44 against `#004bb3` at L 35), the same
magnitude as Chad against Romania. Each alt now names both differences. **Neither description quotes the
gold lettering**, which on both flags names the country.

**TWO PREDICTED PAIRS HELD.** F5 flagged `fl-111` Bulgaria against `fl-097` Hungary — white-green-red
against red-white-green, separated by the order, as predicted — and Honduras against these two Central
American flags, separated by its five stars. **The prediction is worth making**: it is cheaper to write
the distinguishing clause into both alts than to find the collision afterwards, and twice now the sweep
has fired on a pair nobody predicted rather than one that was.

---

# The list

**The bracket on each line says where its flag stands today** — `[on gw-NNN]` for the 115 already
fetched, licensed and described on their twins, `[fetch]` for the 118 that are not. It is also what
makes `test-card-plans.js` check the NAME as well as the number: this plan names the ANSWER rather than
a subject to research, so a card shipping at the wrong id is a fault that suite can see, which on the
geography plans it could not until eight capitals had already drifted.

## The flags — `flags-world`

### Batch F1 — fl-001 to fl-020 — 20 cards, 0 flags to fetch

  fl-001  India  [on gw-001]
  fl-002  China  [on gw-002]
  fl-003  United States  [on gw-003]
  fl-004  Indonesia  [on gw-004]
  fl-005  Pakistan  [on gw-005]
  fl-006  Nigeria  [on gw-006]
  fl-007  Brazil  [on gw-007]
  fl-008  Bangladesh  [on gw-008]
  fl-009  Russia  [on gw-009]
  fl-010  Ethiopia  [on gw-010]
  fl-011  Mexico  [on gw-011]
  fl-012  Japan  [on gw-012]
  fl-013  Egypt  [on gw-013]
  fl-014  Philippines  [on gw-014]
  fl-015  Democratic Republic of the Congo  [on gw-015]
  fl-016  Vietnam  [on gw-016]
  fl-017  Iran  [on gw-017]
  fl-018  Turkey  [on gw-018]
  fl-019  Germany  [on gw-019]
  fl-020  Thailand  [on gw-020]

### Batch F2 — fl-021 to fl-040 — 20 cards, 1 flags to fetch

  fl-021  United Kingdom  [on gw-021]
  fl-022  Tanzania  [on gw-022]
  fl-023  France  [on gw-023]
  fl-024  South Africa  [on gw-024]
  fl-025  Italy  [on gw-025]
  fl-026  Kenya  [on gw-026]
  fl-027  Myanmar  [on gw-027]
  fl-028  Colombia  [on gw-028]
  fl-029  South Korea  [on gw-029]
  fl-030  Sudan  [on gw-030]
  fl-031  Uganda  [on gw-031]
  fl-032  Spain  [on gw-032]
  fl-033  Algeria  [on gw-033]
  fl-034  Iraq  [on gw-034]
  fl-035  Argentina  [on gw-035]
  fl-036  DEFERRED  [Afghanistan — Commons resolves the flag to the Taliban’s; see above]
  fl-037  Canada  [on gw-037]
  fl-038  Yemen  [on gw-038]
  fl-039  Morocco  [on gw-039]
  fl-040  Angola  [on gw-040]

### Batch F3 — fl-041 to fl-060 — 20 cards, 0 flags to fetch

  fl-041  Ukraine  [on gw-041]
  fl-042  Poland  [on gw-042]
  fl-043  Uzbekistan  [on gw-043]
  fl-044  Malaysia  [on gw-044]
  fl-045  Saudi Arabia  [on gw-045]
  fl-046  Mozambique  [on gw-046]
  fl-047  Ghana  [on gw-047]
  fl-048  Peru  [on gw-048]
  fl-049  Madagascar  [on gw-049]
  fl-050  Côte d'Ivoire  [on gw-050]
  fl-051  Nepal  [on gw-051]
  fl-052  Cameroon  [on gw-052]
  fl-053  Venezuela  [on gw-053]
  fl-054  Australia  [on gw-054]
  fl-055  Niger  [on gw-055]
  fl-056  North Korea  [on gw-056]
  fl-057  Syria  [on gw-057]
  fl-058  Mali  [on gw-058]
  fl-059  Burkina Faso  [on gw-059]
  fl-060  Taiwan  [on gw-060]

### Batch F4 — fl-061 to fl-080 — 20 cards, 0 flags to fetch

  fl-061  Sri Lanka  [on gw-061]
  fl-062  Malawi  [on gw-062]
  fl-063  Zambia  [on gw-063]
  fl-064  Kazakhstan  [on gw-064]
  fl-065  Chad  [on gw-065]
  fl-066  Chile  [on gw-066]
  fl-067  Romania  [on gw-067]
  fl-068  Somalia  [on gw-068]
  fl-069  Senegal  [on gw-069]
  fl-070  Guatemala  [on gw-070]
  fl-071  Ecuador  [on gw-071]
  fl-072  Netherlands  [on gw-072]
  fl-073  Cambodia  [on gw-073]
  fl-074  Zimbabwe  [on gw-074]
  fl-075  Guinea  [on gw-075]
  fl-076  Benin  [on gw-076]
  fl-077  Rwanda  [on gw-077]
  fl-078  Burundi  [on gw-078]
  fl-079  Bolivia  [on gw-079]
  fl-080  Tunisia  [on gw-080]

### Batch F5 — fl-081 to fl-100 — 20 cards, 0 flags to fetch

  fl-081  South Sudan  [on gw-081]
  fl-082  Belgium  [on gw-082]
  fl-083  Haiti  [on gw-083]
  fl-084  Jordan  [on gw-084]
  fl-085  Dominican Republic  [on gw-085]
  fl-086  United Arab Emirates  [on gw-086]
  fl-087  Cuba  [on gw-087]
  fl-088  Czechia  [on gw-088]
  fl-089  Honduras  [on gw-089]
  fl-090  Portugal  [on gw-090]
  fl-091  Tajikistan  [on gw-091]
  fl-092  Papua New Guinea  [on gw-092]
  fl-093  Sweden  [on gw-093]
  fl-094  Greece  [on gw-094]
  fl-095  Azerbaijan  [on gw-095]
  fl-096  Israel  [on gw-096]
  fl-097  Hungary  [on gw-097]
  fl-098  Austria  [on gw-098]
  fl-099  Belarus  [on gw-099]
  fl-100  Switzerland  [on gw-100]

### Batch F6 — fl-101 to fl-120 — 20 cards, 4 flags to fetch

  fl-101  Sierra Leone  [on gw-101]
  fl-102  Togo  [on gw-102]
  fl-103  Laos  [on gw-103]
  fl-104  Hong Kong  [on gw-104]
  fl-105  Turkmenistan  [on gw-105]
  fl-106  Libya  [on gw-106]
  fl-107  Kyrgyzstan  [on gw-107]
  fl-108  Paraguay  [on gw-108]
  fl-109  Nicaragua  [on gw-109]
  fl-110  Serbia  [on gw-110]
  fl-111  Bulgaria  [on gw-111]
  fl-112  El Salvador  [on gw-112]
  fl-113  Republic of the Congo  [on gw-113]
  fl-114  Singapore  [on gw-114]
  fl-115  Denmark  [on gw-115]
  fl-116  Lebanon  [on gw-116]
  fl-117  Finland  [fetch]
  fl-118  Liberia  [fetch]
  fl-119  Norway  [fetch]
  fl-120  Slovakia  [fetch]

### Batch F7 — fl-121 to fl-140 — 20 cards, 20 flags to fetch

  fl-121  Ireland  [fetch]
  fl-122  Central African Republic  [fetch]
  fl-123  New Zealand  [fetch]
  fl-124  Palestine  [fetch]
  fl-125  Oman  [fetch]
  fl-126  Mauritania  [fetch]
  fl-127  Costa Rica  [fetch]
  fl-128  Kuwait  [fetch]
  fl-129  Panama  [fetch]
  fl-130  Croatia  [fetch]
  fl-131  Georgia  [fetch]
  fl-132  Eritrea  [fetch]
  fl-133  Mongolia  [fetch]
  fl-134  Uruguay  [fetch]
  fl-135  Puerto Rico  [fetch]
  fl-136  Bosnia and Herzegovina  [fetch]
  fl-137  Armenia  [fetch]
  fl-138  Namibia  [fetch]
  fl-139  Lithuania  [fetch]
  fl-140  Qatar  [fetch]

### Batch F8 — fl-141 to fl-160 — 20 cards, 20 flags to fetch

  fl-141  Jamaica  [fetch]
  fl-142  Gambia  [fetch]
  fl-143  Gabon  [fetch]
  fl-144  Botswana  [fetch]
  fl-145  Moldova  [fetch]
  fl-146  Albania  [fetch]
  fl-147  Lesotho  [fetch]
  fl-148  Guinea-Bissau  [fetch]
  fl-149  Slovenia  [fetch]
  fl-150  Equatorial Guinea  [fetch]
  fl-151  Latvia  [fetch]
  fl-152  North Macedonia  [fetch]
  fl-153  Kosovo  [fetch]
  fl-154  Bahrain  [fetch]
  fl-155  Timor-Leste  [fetch]
  fl-156  Estonia  [fetch]
  fl-157  Trinidad and Tobago  [fetch]
  fl-158  Cyprus  [fetch]
  fl-159  Mauritius  [fetch]
  fl-160  Eswatini  [fetch]

### Batch F9 — fl-161 to fl-180 — 20 cards, 20 flags to fetch

  fl-161  Djibouti  [fetch]
  fl-162  Fiji  [fetch]
  fl-163  Comoros  [fetch]
  fl-164  Guyana  [fetch]
  fl-165  Solomon Islands  [fetch]
  fl-166  Bhutan  [fetch]
  fl-167  Macau  [fetch]
  fl-168  Luxembourg  [fetch]
  fl-169  Suriname  [fetch]
  fl-170  Montenegro  [fetch]
  fl-171  Western Sahara  [fetch]
  fl-172  Malta  [fetch]
  fl-173  Maldives  [fetch]
  fl-174  Cabo Verde  [fetch]
  fl-175  Brunei  [fetch]
  fl-176  Belize  [fetch]
  fl-177  Bahamas  [fetch]
  fl-178  Iceland  [fetch]
  fl-179  Vanuatu  [fetch]
  fl-180  New Caledonia  [fetch]

### Batch F10 — fl-181 to fl-200 — 20 cards, 20 flags to fetch

  fl-181  Barbados  [fetch]
  fl-182  French Polynesia  [fetch]
  fl-183  São Tomé and Príncipe  [fetch]
  fl-184  Samoa  [fetch]
  fl-185  Saint Lucia  [fetch]
  fl-186  Guam  [fetch]
  fl-187  Curaçao  [fetch]
  fl-188  Kiribati  [fetch]
  fl-189  Seychelles  [fetch]
  fl-190  Grenada  [fetch]
  fl-191  Micronesia  [fetch]
  fl-192  Aruba  [fetch]
  fl-193  United States Virgin Islands  [fetch]
  fl-194  Tonga  [fetch]
  fl-195  Jersey  [fetch]
  fl-196  Saint Vincent and the Grenadines  [fetch]
  fl-197  Antigua and Barbuda  [fetch]
  fl-198  Isle of Man  [fetch]
  fl-199  Andorra  [fetch]
  fl-200  Cayman Islands  [fetch]

### Batch F11 — fl-201 to fl-220 — 20 cards, 20 flags to fetch

  fl-201  Guernsey  [fetch]
  fl-202  Dominica  [fetch]
  fl-203  Bermuda  [fetch]
  fl-204  Greenland  [fetch]
  fl-205  Faroe Islands  [fetch]
  fl-206  Saint Kitts and Nevis  [fetch]
  fl-207  American Samoa  [fetch]
  fl-208  Turks and Caicos Islands  [fetch]
  fl-209  Northern Mariana Islands  [fetch]
  fl-210  Sint Maarten  [fetch]
  fl-211  Liechtenstein  [fetch]
  fl-212  British Virgin Islands  [fetch]
  fl-213  Gibraltar  [fetch]
  fl-214  Monaco  [fetch]
  fl-215  Marshall Islands  [fetch]
  fl-216  San Marino  [fetch]
  fl-217  Åland  [fetch]
  fl-218  Saint Martin  [fetch]
  fl-219  Anguilla  [fetch]
  fl-220  Palau  [fetch]

### Batch F12 — fl-221 to fl-233 — 13 cards, 13 flags to fetch

  fl-221  Cook Islands  [fetch]
  fl-222  Nauru  [fetch]
  fl-223  Wallis and Futuna  [fetch]
  fl-224  Saint Barthélemy  [fetch]
  fl-225  Tuvalu  [fetch]
  fl-226  Saint Pierre and Miquelon  [fetch]
  fl-227  Saint Helena  [fetch]
  fl-228  Montserrat  [fetch]
  fl-229  Falkland Islands  [fetch]
  fl-230  Norfolk Island  [fetch]
  fl-231  Niue  [fetch]
  fl-232  Vatican City  [fetch]
  fl-233  Pitcairn Islands  [fetch]
