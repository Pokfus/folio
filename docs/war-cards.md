# War cards — who fought, and who won

The reasoning behind `card.war`, the block that shades the two sides of a war on a card's atlas window
and on the reader's own atlas. **The rules are in CLAUDE.md; this is why each of them is what it is**, plus
the measurements, the things that were tried and abandoned, and the limitation the feature ships with.

Built Sep 2026, on request:

> Cards in which the main answer term is a war, should in their atlas window highlight the countries of
> the two different sides in the conflict in two different colors — the victors green, the losers red. In
> the relevant years on the personal atlas it should also highlight countries involved in war in a similar
> way.

---

## What a war block is

```js
"war": {
  "victors": { "name": "Rome",     "area": [[12.4, 41.9], …] },
  "losers":  { "name": "Carthage", "area": [[[10.3, 36.8], …], [[-6.3, 36.5], …]] },
  "years":   [-264, -146],
  "zoom":    3.4
}
```

A side carries a `name` — what the legend calls it — and **either** `keys` **or** `area`, never both.
`years` and `zoom` are overrides; neither is needed by an ordinary card.

---

## The six decisions

### 1. A card declares it. Nothing sniffs the answer term for "war"

The obvious rule is to shade any card whose answer contains the word, and it is confidently wrong on the
corpus as it stands. Measured over the 3,215 shipped cards, **68 answer terms contain "war" or "wars"**,
and among them are `rm-212` **war elephant**, `wh-403` the **Art of War**, and a run of treaties and
doctrines named after one. Declared blocks are this repository's standing answer to exactly that shape of
problem — `CROSSREF_WRONG`, `NOT_A_SCHOLAR`, `SPELL_PAIRS` are all declared tables for the same reason.

It is also the only thing that could work: **no pattern can read an outcome off a title.** The block says
who won, and that is a historical claim somebody has to make.

### 2. A side is named on a map Folio has, or drawn as an authored extent — never both

`keys` is a list of the names a belligerent goes by **across Folio's own maps**, and every one of them the
map in front of the reader carries is shaded. The card's own window draws `world.js`, so the Second
Sino-Japanese War shades present-day China and Japan; the personal atlas draws the era map for the year on
the rail, and the same card's `Empire of Japan` is what resolves there. **One list matched against
whatever map is up**, rather than a table per surface — which is `map.key`'s own rule, where the three
Cyprus polygons are named together because the map files them apart.

`area` is the other half, and it exists because **Folio's era maps begin at 1500**. Rome and Carthage are
on no map anywhere, so an ancient war's sides are authored the way a civilisation's extent is, and drawn
the way that one is: **dashed**, because an authored extent is an approximation and a crisp line would
assert a frontier nobody surveyed.

The card window makes the distinction visible without a word: **a named side is stroked solid and an
authored one dashed.**

### 3. Both sides or neither, and a drawn war is one that was decided

The block says who won. A war that ended in stalemate, or whose outcome the sources dispute, **carries no
block at all** rather than half of one. That is a narrower feature than "shade every war" and it is the
honest one: two colours can say victor and defeated, and they cannot say "nobody agrees".

The standing examples in the corpus are `gr-198` the **Lelantine War**, whose outcome is genuinely
unknown; `gr-475` the **First Peloponnesian War** and `gr-529` the **Archidamian War**, each ended by a
treaty rather than a victory; and `gr-657` the **Corinthian War**, settled by the King's Peace, where the
power that came out ahead was not one of the belligerents on the field.

### 4. A name may not stand on both sides

A shape cannot be two colours. Italy was an Axis power until 1943 and a co-belligerent after it; Romania,
Bulgaria and Finland all changed sides. Which side such a country is filed under is an editorial
judgement about what the card is about, so it is **refused at the point of writing** rather than resolved
at the draw.

### 5. The years come off the card's own date line, and `years` is an override

`cardSpanYears` reads the date line, which for `rm-209` gives 218–201 BCE outright. It fails only where
the line counts something other than the war: **`wh-345` "Punic Wars" names one treaty year (241 BCE)**,
and without an override a 118-year subject would appear on the personal atlas for a single year. That is
`map.zoom`'s bargain exactly — an override no ordinary card needs.

---

### 6. …and two cards' blocks may not contradict each other

The five rules above are all about ONE card, and there is a sixth fault none of them can see because it
needs two. The personal atlas draws every war a reader has studied on one globe, so two blocks whose
years overlap and whose opposing sides claim the same ground shade it green and red at once, and
whichever is painted second wins. Nothing on either card is wrong.

`node .claude/add-card-wars.js --check` sweeps every pair, and `add-card-wars.js` reports what a batch
would introduce before it writes. It found **seven pairs on the day it was written**, and all seven were
one fault: `wh-345` the Punic Wars runs 264–146 BCE with Carthage's extent AS IT STOOD IN 264 — Africa,
western Sicily and Sardinia — while `rm-209`, `rm-234`, `rm-237`, `rm-240`, `rm-245`, `rm-249` and
`rm-255` all correctly put Sicily and Sardinia on ROME's side in years inside that span, Rome having
taken them in 241 and 238. Carthage's extent is now its African territory alone, which is the one ground
it held from the first war to the last.

It is a REPORT rather than a refusal, because the fix is a judgement about which of the two to narrow and
a batch is sometimes the thing that corrects one. The test is per side-PAIR and only the opposing ones
matter — two cards agreeing that Carthage is the defeated power is the corpus working. A `keys` clash is
a name on A's victors and B's losers, which is rule 4 across two cards; an `area` clash is the same grid
sweep rule 4's geometric half uses. **A `keys` side and an `area` side are not compared**, being drawn on
different surfaces, and that is stated rather than papered over: such a pair can still contradict each
other and only the eye will catch it.

---

## What was looked at on the page, and changed because of it

**A war window spends red on the defeated side, so the collection's own red marks stand down on it.** The
locator window's sibling dots and its collection anchor are drawn "in a red that is nobody else's mark on
this map" — the comment in `app.js` says so — and on a war card that premise stops being true. Looked at
on the page, the Second Punic War drew a **solid red square labelled ROME in the middle of a green
Italy**: the one mark on the map whose colour said the opposite of what the map did. A war's marks are its
two sides.

**The frame needed an override for exactly one card.** The automatic fit frames the union of both sides,
which is right for a war between comparable powers. The Greco-Persian Wars opened on a view from the
Atlantic to the Indus, with the Achaemenid Empire correctly filling the middle of it and the Greek allies
a green speck at the edge — a true map, and not a map of the war. `war.zoom` frames the theatre and the
reader zooms out for the rest; **nothing about what is shaded changes.**

**The green needed a stronger fill than the selection gold.** `TINT_SEL` reads at 24% because gold is the
lightest thing on the map; a green and a red are darker than the paper land and lighter than the night
one, so at the same alpha the green all but vanished on the day theme. They are 0.34 and 0.32, and the
**line** is what carries the shape either way.

---

## Green and red is the one pair 8% of men cannot separate

The request asks for it by name, and the answer here is not a third colour but the **legend**, which names
the two sides in words under the map. It is HTML rather than a caption painted on the canvas, so a screen
reader reads it, every theme re-colours it and the reader's own text setting re-sizes it — none of which a
canvas caption would do. The canvas's own `aria-label` says the same thing in a sentence.

Two details make the legend worth having rather than decorative:

- **Its swatches are built from `TINT_WIN` / `TINT_LOSE` in JS, not from a CSS rule.** A key that states
  its own colours is a key that will one day disagree with the map it explains. `test-war-cards.js`
  asserts the stylesheet carries no colour for `.war-key` at all.
- **It sits OUTSIDE `.card-loc`.** The personal atlas's popup draws the card back with `noLocator`, which
  removes the whole locator block — rightly, since that panel IS a globe. The key is the one part of that
  block which is not a globe, and it is exactly what a reader who has just clicked a green shape needs.

On the personal atlas there is no room for a legend beside every war, so the tab's own first-visit card
carries the sentence instead, and clicking either side opens the war's card with the key on it.

---

## Authoring an extent

**A hand-drawn polygon renders perfectly while being wrong**, so every extent shipped was checked against
named places with known coordinates rather than looked at — **49 extents, and 1,485 assertions once
composed per side** — each one "this city must be inside" or "this city must be outside". That is the only way to
catch a ring whose interior is on the wrong side of an edge, which draws a beautiful map of somewhere
else.

**IT IS A REFUSAL RATHER THAN ADVICE.** A batch entry may carry a `places` block beside its `war`, and
`add-card-wars.js` refuses the whole batch if any assertion is wrong; `test-war-cards.js` pins a readable
subset — three places inside each side and two outside — so a shipped extent edited later fails too.

Six findings from doing it:

- **A "must be outside" list composed from per-extent tables has to be built GEOMETRICALLY, not by
  name.** The first cut dropped a place from a side's "out" list only when some extent NAMED it in its
  own "in" list, which misses every place that simply falls inside a ring without being one of the
  handful somebody chose to assert: Catania is in Sicily and nobody wrote it down, so Rome in 218 BCE —
  which held Sicily — was asserted not to cover Catania. The checker refused the batch, which is what it
  is for.

- **The toe of Italy cannot be separated from the north-east corner of Sicily by an approximate polygon.**
  Reggio (15.65 °E, 38.11 °N) and Messina (15.55, 38.19) are 0.1° apart in longitude and 0.08° in
  latitude, and the strait between them runs diagonally, so a boundary that puts Reggio inside and Messina
  outside has a margin of about a kilometre either side. On a dashed extent that is false precision. The
  boundary runs mid-strait and the last few kilometres of Calabria are left unshaded — which is what
  "approximate" means, and Messana being Carthaginian-adjacent in 264 BCE is exactly the thing the map
  must not get wrong.
- **An extent is the belligerent's territory in and around the theatre the card frames** — an atlas
  plate of that war. Rome in 112 BCE held Spain, Macedonia and Asia as well as Italy, and drawing all of
  it on the Jugurthine War card would frame three continents and lose the war.
- **TWO AUTHORED EXTENTS MAY NOT OVERLAP, and the eye does not catch it.** It is the `keys` rule — a
  name may not stand on both sides — in geometry rather than in a list, and `checkWar` sweeps a grid for
  it now. It found three the day it was written: Roman Hispania against Lusitania over the Alentejo,
  Laconia against Messenia at the head of the Eurotas, and Rome against Samnium along the Volturno. The
  first showed on the page as a muddy brown patch; the other two were invisible. **Where the frontier is
  uncertain, leave a GAP rather than an overlap** — a few unshaded kilometres read as a frontier zone,
  which is what it was, and two colours over one ground read as a mistake.
- **Several rings are one side.** `locRings` reads a flat ring or a list of rings, so Carthage in 218 BCE
  is Africa and Barcid Spain, and the Athenian empire is Attica, Euboea and the Aegean.
- **A GAP is a place too, and it can swallow a town.** The Hundred Years' War needed a frontier between
  the kingdom of France and English Gascony, and the safe way to draw one is to stand France's edge off
  Gascony's by a tenth of a degree or so. Pau fell in that gap: Béarn's northern boundary is about 10 km
  south of the duchy's, so there was no room for a 12 km stand-off and an assertion either way. The
  answer was to assert Pau NEITHER way and let the gap have it, because a viscounty that did homage to
  Edward III while claiming sovereignty is precisely what a dashed approximation may not adjudicate.
  **When an assertion will not resolve, drop the assertion rather than moving the line to satisfy it.**
- **An institution's own extent moves, so date it.** See "An extent is dated as well as drawn" below —
  Carthage in 480 is not Carthage in 264, and reusing the later ring got the history wrong AND framed the
  card on the wrong sea.

---

## It rides in the LIGHT half of `data.js`, and has to

`war` is on the eager load path, beside `locator`, `map` and `facts` rather than in `data-extra/`. That is
not an oversight, and the cost is small: **43 blocks cost the eager path about 7 KB gzipped**, roughly
170 bytes each — authored coordinates compress well. The nine added in the third batch cost 1,857 bytes
between them, and two extents NARROWED in the same batch gave some of that back.

It has to be there because **the personal atlas reads it**. `atlasUnlocks` walks every card the reader has
studied and asks it for its places; the heavy half is fetched per collection when a card in that collection
is revealed, so a `war` living there would put a war on the globe only when its collection's extra file
happened to be loaded — a register that is right some of the time and silently thin the rest of it. It is
exactly why `locator` is light, and the same answer.

**MEASURE IT BY GZIPPING `data.js`, NOT OFF `check-sizes.js`.** That tool prints hundredths of a
megabyte, so the first batch was written up here as "about 10 KB" when the real change was nearer two —
a figure five times too big, taken off a tool that was right and read at the wrong resolution. The
command is `gzip -9 -c data.js | wc -c`, against the same on `git show <base>:data.js`.

At 155 bytes a block the field could carry every war in the corpus for under a kilobyte more. If it ever
stops being small, the honest move is to split the `area` rings off rather than let it grow quietly.

---

## The limitation, stated rather than papered over

**On a card's own window a named side is drawn in PRESENT-DAY borders.** `world.js` is the only shape
layer a locator window loads, so the Second World War card shades modern Russia for the USSR and leaves
Ukraine, Belarus and the Baltic states grey. The personal atlas does not have this problem — it resolves
the same card's `USSR` against the 1938 map and draws the real thing — so the accurate picture is one tab
away, and the card's window is a modern-borders sketch of who fought.

The alternative was to teach the card window to load `timeline.js` and resolve against the era for the
war's own years. It was rejected for three reasons: the era maps ride in the `atlas` bundle, which a
locator window only WARMS at idle, so the sides would paint a beat after the map; the era-resolution
machinery lives inside the Atlas's own closure and would have to be duplicated; and an era territory's
polygon is simplified to its own tolerance, so filling one over `world.js`'s land shows slivers at the
coast. **Where the modern border misleads, the honest answer is an authored `area`.**

**A war between a very small state and a very large one frames the large one, and `zoom` cannot fix it.**
The `ww2-159` Winter War card shades the whole of Russia green against a red Finland, and the automatic
fit opens on northern Eurasia with the globe's own limb in view. The `zoom` override moves the SCALE and
not the CENTRE — `homeZoom = clampN(zoomAttr || z, …)` leaves `homeLon`/`homeLat` at the union's own
middle — so zooming in on a Russia-and-Finland union centres on Siberia and takes Finland off the screen
altogether. That is the opposite of `wh-319`, where the Greek allies and the Achaemenid empire have
Anatolia between them and a tighter frame lands on the theatre. What is drawn is true, both sides are
legible, and the disparity is arguably what the card is about: the honest answer is to leave it and say
so here.

**`ww2-001` is the sharpest case of it.** "The countries of the two sides" of the Second World War is
some sixty states and two coalitions; what is shaded is the principal Allied and Axis powers, and the
sides are named **Allied powers** and **Axis powers** rather than listing them, because the coalition is
what the colour stands for. Finland, Romania and Bulgaria are left off both sides under rule 4.

---

## Coverage

Forty-three cards carry a block. **Run `node .claude/add-card-wars.js --check` for the figure rather than
quoting that**: it prints every block, both sides, the years each will draw in, and whether any two of
them contradict each other.

**A card need not have "war" in its answer term to carry one**, and six do not: the Norman Conquest, the
Qin conquest of the six states, the Roman conquests of Greece and of Cisalpine Gaul, the Carthaginian
invasion of Sicily and the Sicilian Expedition. A conquest, an invasion and an expedition are all wars
between two polities, and the question to ask a card is the one in CLAUDE.md — is its ANSWER TERM a war —
rather than whether the word is in it. The pool is therefore much wider than the 68 answer terms that
contain "war" or "wars"; **37 conflict-shaped terms carry no block yet**, most of them revolts and
campaigns rather than wars between states.

Three of them are worth knowing about before writing the next. **`cnh-224`, `rm-333` and `rm-162` carry a
locator as well**, and the combination is the best thing this format does: the two washes say who fought
and the gold dot says where the thing the card is about happened — Mayi on the Han frontier, Chalcedon on
the Bosphorus, Mediolanum in the middle of a red Po valley. **`wh-504` does it with a `battle` locator**,
so the Norman Conquest draws a red England, a green Normandy and crossed swords at Hastings. **And
`wh-354` is the theatre rule in its clearest form**: Rome in 58 BCE held Spain, Africa, Macedonia and Asia
as well, and what is shaded is Italy with the two Gauls it already had, which is the map the war was
fought from.

**`rm-350` — the Rome collection's own card for that same war — is what found the third mark to stand
down.** It carries a `region` locator whose `area` IS Gaul, washed in the answer's gold; with a war block
the same shape would have been gold and red at once. A locator's area wash now stands down on a war
window, for the reason the red marks do: the two sides are already saying what the card is about, in two
colours. Its dot and its name are untouched, and "Gaul" still sits over the red.

### An extent is dated as well as drawn

**`gr-448` is the case that made this a rule rather than an observation.** The Carthaginian invasion of
Sicily is 480 BCE, and the first draft gave Carthage the extent the Punic War cards use — which is
Carthage in 264, after a century and a half of expansion into the Libyan interior and along the
Tripolitanian coast. It was wrong twice over: it claims ground Carthage did not hold in 480, and because
the automatic fit frames the union of the two sides, it opened the card on North Africa with Sicily a
strip at the top. `CARTH_AFRICA_480` is the city, the Cap Bon and the Medjerda, and the card now opens on
the Sicilian channel, which is where the war was.

The same rule shaped three more extents in that batch. Wei is the **Daliang rump** and not the Wei of the
period's opening, Qin having taken Anyi in 286; Chu has moved east to **Shouchun**, Ying having fallen in
278; and **Luoyang is Qin's**, the Zhou royal domain having gone in 249. And `rm-162`'s Cisalpina stands
off peninsular Italy's own northern edge, where `wh-354` has the two on ONE side and the Apennine crest
can belong to both.

### What is left, and what is deliberately not

Measured over the 3,215 shipped cards, **68 answer terms contain "war" or "wars"**. Thirty-seven carry a
block, and **not one of the other thirty-one is work waiting to be done** — for the first time since the
feature shipped, every one of them is a rule doing its job.

| | count | why |
|---|---|---|
| **not a war at all** | 3 | `rm-212` war elephant, `wh-403` Art of War, `ww2-148` declaration of war — the reason a card DECLARES a block rather than a pattern reading the title. |
| **no decided outcome** | 9 | `gr-198` Lelantine (unknown), `gr-475` First Peloponnesian (Thirty Years' Peace), `gr-529` Archidamian (Peace of Nicias), `gr-657` Corinthian (the King's Peace, whose beneficiary was not a belligerent on the field), `rm-238` First Macedonian (Peace of Phoenice), `ww2-149` Phoney War (no fighting), and three American — `us-051` Beaver Wars (a general peace at Montreal in 1701), `us-067` Pontiac's War (the Crown restored the gifts and the Proclamation line, and neither side won), `us-082` Seminole Wars (the card's own question is that the last ended with no treaty signed, and some Seminole were never defeated). Rule 3: a drawn war is one that was decided. |
| **both sides on one ground** | 17 | Nothing for two colours to say. The four Servile Wars (`rm-280`, `rm-303`, `rm-328`, `wh-352`); the Roman civil wars (`rm-316`, `rm-324`, `rm-360`, `rm-364`, `wh-355`); the two Social Wars (`rm-305`, `gr-676`), each a hegemon against its own allies; `rm-203` Carthage against its own mercenaries; `jp-073` Jinshin; `ww2-111` Spanish Civil War; and three American — `us-060` King Philip's War, `us-063` Yamasee War and `us-064` Tuscarora War, on which see below. |
| **too interleaved to draw** | 2 | `rm-142` Latin War and `gr-698` Third Sacred War. |

**The open ground is the WIDER pool**, the one the word "war" does not reach: **37 conflict-shaped answer
terms carry no block** — conquests, invasions, campaigns, revolts and crusades. Most are revolts inside a
single polity and fall under "both sides on one ground" as surely as the Servile Wars do; the ones worth
writing next are `gr-383` the Persian conquest of Lydia, `gr-384` the conquest of Ionia, `gr-391` Darius'
Scythian campaign, `gr-478` the Athenian Egyptian expedition, `rm-159` the conquest of Umbria and Picenum,
and `gr-417`, on which see below. **Two of the 37 are refused rather than pending** — `ww2-124` the
Italian invasion of Albania and `ww2-146` the Soviet invasion of Poland — for the reason immediately
below.

#### The seven American wars, resolved

They were carried as one block of open work for two batches and they are not one thing. **`us-072` the
Northwest Indian War is written**, and it is the best of them: the card's own prose says the confederacy
held that the Ohio was the boundary, says it was beaten at Fallen Timbers, and says what it gave up at
Greenville — so the frontier, the outcome and the two sides are all on the card, and the map draws the
United States green along the seaboard and into Kentucky against a red Ohio Country. Carding a Native
defeat as a defeat is the point rather than the difficulty; the alternative is the papering-over this
project's rules forbid, and the card already tells the story honestly, Little Turtle's advice and his
reluctant signature included.

**Three of the other six have no decided outcome** and are in the table above. **The last three are the
Latin War at a different scale.** `us-060` King Philip's War, `us-063` the Yamasee War and `us-064` the
Tuscarora War each set a colony against Native nations whose towns stood among the colony's own farms:
Swansea and Rehoboth are ten to twenty kilometres from Wampanoag ground and Providence is inside
Narragansett country; the Tuscarora villages and the settlements at Bath and New Bern are on the same two
rivers; and the Yamasee rising drew in the Creek, Choctaw, Catawba and Apalachee across the whole interior
while the Lower Cherokee changed sides in the middle of it. A dashed extent says *about here*; it cannot
say *this village and not the next one*, and two washes drawn at that scale would be a picture somebody
invented.

#### A war inside a war may not contradict the war it is inside

This is the finding the cross-card check was built on, and it is the reason `ww2-124` and `ww2-146` are
not written. `ww2-001`'s block is the alignment of the whole Second World War over 1937–1945: Italy is an
Axis power and Poland an Allied one, which is right about the war. The Italian invasion of Albania and the
Soviet invasion of Poland are both 1939, and both have a belligerent on the opposite side from the one
`ww2-001` puts it on — Italy the victor of a war it won, Poland the defeated of a war it lost. A reader
who studied the umbrella card and either constituent would see that country drawn twice in the same year,
and whichever was painted second would win.

So the test for a constituent card of a larger war is: **both its sides must be on the same sides the
umbrella puts them.** `ww2-096` the Second Sino-Japanese War passes it — China green and Japan red on
both cards — which is why it has a block and these two do not. `ww2-159` the Winter War passes it for a
different reason: the Soviet Union is green on both, and Finland is on neither of `ww2-001`'s lists, being
one of the three states rule 4 leaves off.

#### The card has to say who won, not only history

**`gr-417` "invasion of 480" is the standing example, and it is open rather than refused.** The second
Persian invasion of Greece is as decided as a war gets and `wh-319` already draws it with these exact two
sides. But `gr-417`'s own ten sentences are about the SIZE of Xerxes' army — Herodotus' 1,700,000, the
counting pen at Doriscus, Xerxes weeping at Abydos — and the nearest they come to an outcome is
Thucydides calling the Median war the greatest achievement of past times and saying it was decided in two
actions by sea and two by land. The rule is that the block rests on the card's own cited prose, so this
one wants a sentence on the card before it wants a block. **`ww2-159` is the same question answered the
other way**: its prose says the peace cost Finland territory, and `ww2-160` beside it says the terms were
Moscow's and were dictated, so the territorial outcome is on the cards and the block follows it.

#### The two that cannot be drawn

This is the Strait of Messina finding at a different scale, and it is the honest reason rather than a
backlog. **`rm-142` the Latin War** sets Rome against the Latin League, whose cities — Tibur, Praeneste,
Aricia, Lanuvium, Tusculum, Ardea — sit inside and around the ager Romanus at ten to twenty kilometres.
**`gr-698` the Third Sacred War** sets Phocis against the Amphictyony, and the Phocis-Boeotia frontier is
about fifteen kilometres from Chaeronea. A dashed extent says *about here*; it cannot say *this village
and not the next one*, and two washes drawn at that scale would be a picture somebody invented.

**And the strait itself came back a third time.** `gr-448` wanted the Greek cities of Sicily against
Carthage, and Rhegium — which the card says helped Carthage — is 12 km from Messana across the water.
Neither can be separated from the other by an approximate polygon, so `SICILY_GREEK_480` stops short of
the strait and leaves both Messana and the toe of Italy unshaded. That is the right way round: Rhegium
shaded green would say the opposite of what the card says.

The rest of the corpus's wars are open ground. Adding one is a batch through
`node .claude/add-card-wars.js <batch.json>`; `--names=<year>` prints every territory name that era's map
carries, which is the commonest thing to get wrong — the 1938 map has no "Nazi Germany" and no "Soviet
Union", it has **Germany** and **USSR**.
