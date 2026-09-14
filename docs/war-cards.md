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

## The five decisions

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
named places with known coordinates rather than looked at — **26 extents, and 620 assertions once composed
per side** — each one "this city must be inside" or "this city must be outside". That is the only way to
catch a ring whose interior is on the wrong side of an edge, which draws a beautiful map of somewhere
else.

**IT IS A REFUSAL RATHER THAN ADVICE.** A batch entry may carry a `places` block beside its `war`, and
`add-card-wars.js` refuses the whole batch if any assertion is wrong; `test-war-cards.js` pins a readable
subset — three places inside each side and two outside — so a shipped extent edited later fails too.

Four findings from doing it:

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
- **Several rings are one side.** `locRings` reads a flat ring or a list of rings, so Carthage in 218 BCE
  is Africa and Barcid Spain, and the Athenian empire is Attica, Euboea and the Aegean.

---

## It rides in the LIGHT half of `data.js`, and has to

`war` is on the eager load path, beside `locator`, `map` and `facts` rather than in `data-extra/`. That is
not an oversight and it is not free: **17 blocks cost the eager path about 10 KB gzipped**, roughly 600
bytes a card, most of it authored coordinates.

It has to be there because **the personal atlas reads it**. `atlasUnlocks` walks every card the reader has
studied and asks it for its places; the heavy half is fetched per collection when a card in that collection
is revealed, so a `war` living there would put a war on the globe only when its collection's extra file
happened to be loaded — a register that is right some of the time and silently thin the rest of it. It is
exactly why `locator` is light, and the same answer.

**Measure it after a big batch** (`node .claude/check-sizes.js`): a hundred war blocks would be a real
figure on a path every visitor pays for, and at that point the honest move is to split the `area` rings
off rather than to let it grow quietly.

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

**`ww2-001` is the sharpest case of it.** "The countries of the two sides" of the Second World War is
some sixty states and two coalitions; what is shaded is the principal Allied and Axis powers, and the
sides are named **Allied powers** and **Axis powers** rather than listing them, because the coalition is
what the colour stands for. Finland, Romania and Bulgaria are left off both sides under rule 4.

---

## Coverage

Eighteen cards carry a block as the feature ships — the three Punic Wars and the umbrella card, the
Greco-Persian Wars, the Peloponnesian War in both the collections that card it and its Decelean phase,
the Gallic Wars in both, the Second and Third Macedonian Wars, the Third Mithridatic War, the Jugurthine
War, the Han–Xiongnu wars, and three from the Second World War collection. **Run
`node .claude/add-card-wars.js --check` for the figure rather than quoting that**: it prints every block,
both sides and the years each will draw in.

Two of them are worth knowing about before writing the next. **`cnh-224` and `rm-333` carry a locator as
well**, and the combination is the best thing this format does: the two washes say who fought and the
gold dot says where the thing the card is about happened — Mayi on the Han frontier, Chalcedon on the
Bosphorus. **And `wh-354` is the theatre rule in its clearest form**: Rome in 58 BCE held Spain, Africa,
Macedonia and Asia as well, and what is shaded is Italy with the two Gauls it already had, which is the
map the war was fought from.

**`rm-350` — the Rome collection's own card for that same war — is what found the third mark to stand
down.** It carries a `region` locator whose `area` IS Gaul, washed in the answer's gold; with a war block
the same shape would have been gold and red at once. A locator's area wash now stands down on a war
window, for the reason the red marks do: the two sides are already saying what the card is about, in two
colours. Its dot and its name are untouched, and "Gaul" still sits over the red.

### What is left, and what is deliberately not

Measured over the 3,215 shipped cards, **68 answer terms contain "war" or "wars"**. Eighteen carry a
block; the other fifty break down like this, and three of the four groups are the rules working rather
than a backlog.

| | count | why |
|---|---|---|
| **not a war at all** | 3 | `rm-212` war elephant, `wh-403` Art of War, `ww2-148` declaration of war — the reason a card DECLARES a block rather than a pattern reading the title. |
| **no decided outcome** | 6 | `gr-198` Lelantine (unknown), `gr-475` First Peloponnesian (Thirty Years' Peace), `gr-529` Archidamian (Peace of Nicias), `gr-657` Corinthian (the King's Peace, whose beneficiary was not a belligerent on the field), `rm-238` First Macedonian (Peace of Phoenice), `ww2-149` Phoney War (no fighting). Rule 3: a drawn war is one that was decided. |
| **both sides on one ground** | 14 | Nothing for two colours to say. The four Servile Wars (`rm-280`, `rm-303`, `rm-328`, `wh-352`); the Roman civil wars (`rm-316`, `rm-324`, `rm-360`, `rm-364`, `wh-355`); the two Social Wars (`rm-305`, `gr-676`), each a hegemon against its own allies, interleaved at 30 km; `rm-203` Carthage against its own mercenaries; `jp-073` Jinshin; `ww2-111` Spanish Civil War. |
| **open — authorable, not done** | 27 | The real remainder. |

The 27 open ones, and what each needs:

- **Six Greek** — `gr-235` / `gr-236` / `gr-237` / `gr-461` the Messenian Wars (Laconia against Messenia,
  two adjacent regions of the Peloponnese ~50 km apart), `gr-698` Third Sacred War (Phocis against the
  Amphictyony and Philip), `gr-755` Lamian War (Macedon against an Athenian-Aetolian coalition, which is
  NOT the Hellenic League's shape and needs its own).
- **Twelve Roman** — `rm-142` Latin War and `rm-151`–`rm-156` the Samnite Wars (early Rome and Latium
  against Samnium, the hardest of the set: the two interleave at 30 km and `rm-013` Samnium's own
  authored area is the place to start); `rm-237` Illyrian Wars, `rm-245` Roman-Seleucid War, `rm-255`
  Achaean War (the League is the NORTHERN Peloponnese, not `PELOPONNESE` — Sparta was hostile, so reusing
  that extent would be an over-claim), `rm-262` / `rm-263` / `rm-265` the Spanish wars, `rm-310` First
  Mithridatic War (the extents `rm-333` already carries).
- **Seven American** — `us-051` through `us-082`. Every one is a Native nation or confederacy against a
  colony or the United States, and none of those nations has a shape on any map Folio holds, so all of
  them need authored extents. They also want the collection's own scope decisions read first: the plan
  opens with Native America as a deck rather than a prologue, and a two-colour "victors / defeated" over
  a continent being taken is a claim to make carefully or not at all.
- **`wh-518` Hundred Years' War** — England against France, 1337–1453. The trap is that `world.js` has
  **United Kingdom** and not England, and Scotland was France's ally, so `keys` would shade the wrong
  island; it needs authored extents. And its years fall before 1500, so the personal atlas has no era map
  for it — the authored extents are what would draw there.
- **`ww2-159` Winter War** — the one that could be `keys` tomorrow (USSR and Finland are both on the 1938
  map and on `world.js`). It is not done because **the card's own prose does not name a victor**: it says
  Finland held out and that the peace cost it territory. Rule 5 is that the block rests on the card's own
  cited prose, so this one wants the card to settle the outcome first.

The rest of the corpus's wars are open ground. Adding one is a batch through
`node .claude/add-card-wars.js <batch.json>`; `--names=<year>` prints every territory name that era's map
carries, which is the commonest thing to get wrong — the 1938 map has no "Nazi Germany" and no "Soviet
Union", it has **Germany** and **USSR**.
