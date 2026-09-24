# Middle-earth — a 1000-card running order

The plan for `middleearth`, a new collection: every card's number, topic and deck, fixed in advance so
the collection can be grown one card at a time over many sessions without anyone having to remember
what was intended.

It is the twenty-seventh of these and **the first whose subject is a work of fiction**. Read
`docs/greece-card-plan.md` first if this is the first plan you have met; the mechanics are identical
and are not repeated here. What is NOT identical is what a card is allowed to assert, and that is the
first thing below.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `mid-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='mid-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them.

The padding above is right for every id but the last: the ids are `mid-001` … `mid-999`, then
`mid-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer
term. `mid-436 The problem of Orc origins` is a question about what the drafts say, and the card's
actual answer — the word that gets blanked — is chosen while writing it, from what the sources will
support.

Where the research says the line is wrong, **change the line here in the same commit as the card**,
and say so. The house rule stands, and in this collection it has a particular form: never invent a
date, a name, a definition **or a passage**.

---

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue, a new `ICON_SYMBOLS` mark and its `COLLECTION_SECTION` row all ship with the file.

**The id is `middleearth` and the card prefix is `mid-`.** The obvious prefix `me-` is taken by
Ancient Mesopotamia, which is exactly the collision `test-card-plans.js` checks for; `mid-` is a
prefix of nothing on the shelf and nothing on the shelf is a prefix of it. The deck ids are also
`mid-…`.

**IT NEEDS A `COLLECTION_SECTION` ROW AND THE ROW IS `middleearth: "The Arts"`.** `sectionOf` returns
History for anything the table does not name, which would be wrong twice over here. The Visual Art
plan created that heading on the reasoning that "music, architecture, theatre and literature are the
siblings a heading is for" — this is literature, and film, and games, which is as plainly The Arts as
anything on the shelf. It is the third collection under that heading, after Visual Art and
Architecture.

### The hue: `#7B8C1F`, the green of a leaf — and gold was refused on a standing note

**The apt families were swept in CIELAB against the 33 hues now on the shelf.** The shelf's median
nearest-neighbour distance is **20.1**, its tightest existing pair is **12.9** (China's vermilion
against Russia's lacquer), and its density — hues within ΔE 30 — runs a median of 6 and a maximum
of 9.

**GOLD IS THE OBVIOUS COLOUR AND IT IS REFUSED TWICE OVER.** The Ring is gold, the mallorn leaves are
gold, and "all that is gold does not glitter" is the book's best-known line; a reader asked to name
the colour of this franchise would say gold and nothing else. The first refusal is the numbers: the
best metallic gold inside the shelf's own contrast band measures **17.7** with **five** hues inside
ΔE 30, sitting between India's saffron and Dinosaurs' dark gold, and the best dark gold measures 19.9
with six. The second refusal is a **standing note already in `COLL_THEME`**: the olive-brass band
beside it scored 21.5 for the Architecture sweep and was refused there as "the sixth thing in the
yellow-green-brown quarter", with an instruction not to measure it again. Gold is that quarter. **Do
not re-run the gold sweep.**

**WHAT IS TAKEN IS THE OTHER EMBLEM, WHICH IS THE LEAF.** `#7B8C1F` is a spring leaf — the green of
the Shire, of the leaf-brooches of Lórien, and of the round door that opens the whole thing. It
scores **21.5**, which is **above the shelf's median of 20.1** and the best figure available on the
whole wheel outside the two bands under standing notes, with **density 3 against a median of 6** —
only three hues anywhere near it. It stands 21.5 from Geography: United States' dark green, 21.8 from
Dinosaurs' dark gold and 27.6 from the Italian deck's sage. L 55, chroma 56, and 3.7:1 against white,
which is the light end of the shelf's own 3.7–10.4 band, level with India's ochre and Architecture's
cyanotype.

**IT IS A SEVENTH GREEN AND NEEDS BIOLOGY'S FIFTH-GREEN ARGUMENT.** The others are Biology's dark
forest (L 27), Geography: United States' olive (L 40), World Geography's emerald (L 38), the
Portuguese deck's green (L 54 but a true green at hue 158), the Italian deck's sage (L 54, chroma 30)
and the First World War's field grey (chroma 13). **This is the bright, high-chroma, yellow-leaning
end of the band and nothing else is within twenty points of it there.** Rendered as a banner and as
its 20% wash beside all six on the real Collections page, it is plainly a different colour from each;
the swatch comparison is the one to repeat if it ever needs moving.

**Two regions that score better were NOT re-measured, on the standing notes in `COLL_THEME`.** The
magenta around `#c057b1` came top of the unconstrained sweep again — the ninth time — and the
olive-brass beside it is the gold refusal above. Neither is going to be chosen; do not run either
sweep again. **The only region that outscores this one and is not under a note is a bright rose at
20.5, which means nothing here.**

### The icon: a plain ring

**`ring`, drawn as a single unadorned circle.** Fifty marks are already in `ICON_SYMBOLS` and none of
them is a bare circle: `coin` is two concentric circles, `globe` is a circle with three meridians,
`sun` a small disc with rays, `ringed` a disc inside one ellipse, `atom` a nucleus inside three, and
`moon` a crescent. Rendered at 24, 28 and 34px beside all six, the plain ring is unmistakable against
every one of them.

**IT IS THE PLAINEST MARK ON THE SHELF AND THAT IS THE POINT.** The Ring is described in the book as
plain and unadorned, the franchise is named after it three times over, and a geometric circle is not
anybody's intellectual property — which matters more here than elsewhere, since every distinctive
visual design associated with this subject belongs to somebody.

**A ROUND HOBBIT DOOR WAS TRIED AND REFUSED**, drawn as a circle with a centred knob on a ground
line: at 24px the knob reads as `coin`'s inner circle and the ground line disappears, so the more
elaborate mark is the more confusable one. **Keep the circle empty.**
---

## The one thing to read before writing anything

**FOLIO'S CONTENT RULES WERE WRITTEN FOR HISTORY AND SCIENCE, AND THIS COLLECTION IS NEITHER.** It is
worth saying plainly what that changes and what it does not, because the answer is not obvious and
getting it wrong would produce a thousand cards that look exactly like the rest of the site while
asserting things nothing can check.

**WHAT CHANGES IS WHAT A CARD IS ABOUT. A card here is about a TEXT, never about a world.** "Beren
cut a Silmaril from Morgoth's crown" is not a fact; "the *Quenta Silmarillion* as Christopher Tolkien
published it in 1977 says that Beren cut a Silmaril from Morgoth's crown" is one, and it is
checkable, because the chapter exists and anyone can open it. Every in-world card is a claim of the
second kind wearing the grammar of the first, and **where the texts disagree the card must say which
text it is following** — see the next section, which is the whole of this collection's difficulty.

**WHAT DOES NOT CHANGE IS ANYTHING ELSE.** The citation bar is still five works per card with
markers pointing at them, the glossary pairing rule still applies, the abstract is still ten
sentences in two blocks of five at 270–330 words, the date line is still a list of dates, and
`add-card.js` still refuses a card that breaks any of it. **A fiction collection is not a licence to
write loosely**; if anything it is the opposite, because the primary sources are all in print and a
reader can catch you in a minute.

---

## The canon problem, which is this collection's spine

**TOLKIEN PUBLISHED FOUR BOOKS OF THE LEGENDARIUM IN HIS LIFETIME AND LEFT SIXTY YEARS OF DRAFTS.**
*The Hobbit* (1937), *The Lord of the Rings* (1954–55), *The Adventures of Tom Bombadil* (1962) and
*The Road Goes Ever On* (1967) are his own published work. Everything else a reader is likely to
quote — *The Silmarillion*, *Unfinished Tales*, the twelve volumes of *The History of Middle-earth*,
*The Children of Húrin*, *The Nature of Middle-earth* — was assembled and published after his death
by Christopher Tolkien, out of manuscripts that contradict one another and that his father was still
rewriting when he died.

**SO THERE IS NO SUCH THING AS "WHAT HAPPENS IN THE SILMARILLION" IN THE SENSE A READER EXPECTS.**
The 1977 book is an edited construction: its editor chose between drafts, harmonised names, and in
places wrote connective material himself. He said so, at length, in the foreword and then across
twelve further volumes that publish the alternatives. `mid-190 The 1977 text as a construction rather
than a work` and `mid-220 Reading a draft as evidence` are the cards that carry this, and **every
other card in decks 3, 4 and 5 inherits them.**

Four rules follow and they are not negotiable.

**1. A CARD NAMES THE TEXT IT IS FOLLOWING** whenever the texts differ, in the prose rather than only
in the citation. "In the published *Silmarillion*…", "In the latest of the drafts…", "*The Lord of
the Rings* says X; a note published in *Unfinished Tales* says Y."

**2. A LATE DRAFT IS NOT A CORRECTION AND AN EARLY ONE IS NOT AN ERROR.** Tolkien's last thoughts are
often the least worked out and were never published by him; the *Athrabeth* and *Myths Transformed*
are late and are also the least settled things he wrote. **Date the draft, do not rank it.**

**3. WHERE THE ANSWER IS GENUINELY OPEN, THE CARD SAYS SO AND DOES NOT PICK.** The origin of Orcs,
what Tom Bombadil is, whether Balrogs have wings, whether the flat world was ever meant to survive
the round one — these are carded AS open questions (`mid-436`, `mid-450`, `mid-187`), which is the
same rule Astronomy applies to the Hubble tension. A card may say the question is open; it may not
settle one the drafts do not.

**4. AN ADAPTATION'S INVENTION IS NEVER THE BOOK'S.** Arwen does not ride to the Ford in the book,
Faramir does not take Frodo to Osgiliath, Tauriel does not exist, the Army of the Dead does not
arrive at the Pelennor, Sauron does not appear as an eye on a tower. Every one of those is in a film
that a great many readers met first, and **`mid-827 How the films changed what readers imagine` is
the card about exactly this.** Deck 8 cards the changes as changes, with what the makers said about
each; decks 2 to 5 card the books and say nothing about the films at all.

---

## What this collection is about

**It is about Tolkien's legendarium and everything that grew out of it** — the man and his sources,
the books he wrote and the books his son made out of his papers, the world those books describe, the
languages that came before the world, the arguments about all of it, and the films, games, shows and
fandom that a century of readers have built on top.

It is deliberately **not just The Lord of the Rings**, and it is deliberately **not just Tolkien**.
Decks 8 and 9 give 230 cards — nearly a quarter of the collection — to adaptation and franchise,
because for most people alive now the films are the way in, the games are how the world is
inhabited, and the legal history of who owns Middle-earth is the reason the shelf looks the way it
does.

---

## Is there a thousand cards in this?

Yes, and the honest answer has to survive the obvious objection, which is that a thousand cards about
one author's invented world is a thousand cards about nothing.

**THE ANSWER IS THAT ONLY ABOUT A THIRD OF IT IS THE INVENTED WORLD.** Counted from the running
order: 350 cards (decks 3, 4 and part of 5) describe Arda; 220 are Tolkien's life, his reading, his
scholarship and how the books were made; 95 are the languages, which is a real subject in linguistics
and has its own refereed journals; 105 are criticism and reception; 230 are adaptation and franchise.
**The largest single strand is not the world but the making and the reading of it**, which is a
subject with archives, court records, sales figures, manuscripts and eighty years of peer-reviewed
argument behind it.

**AND ONLY ABOUT A QUARTER OF THE THOUSAND NAMES A PERSON.** That is the Dinosaurs plan's genus rule
transposed: a character earns a slot by teaching something the card above it does not. Fëanor is here
because the Oath is the engine of the First Age; Beorn is here because he is the one place *The
Hobbit* touches Old Norse shape-changing directly; a great many named Elves are not here at all.

**THE LANGUAGES GET 95 CARDS AND THAT IS THE PLAN'S MOST DELIBERATE ALLOCATION.** Tolkien said
repeatedly that the languages came first and the stories were made to give them a world to be spoken
in, and most general treatments give this two paragraphs. A deck that does the same would be carding
the least Tolkien thing about Tolkien.

---

## Six scope decisions

**1. THE TEXTS ARE THE SUBJECT, NOT THE WORLD.** Stated above. It is first because it decides what
every card in decks 3, 4 and 5 may say.

**2. THE CRITICISM IS CARDED, INCLUDING THE CRITICISM THAT IS HOSTILE.** Thirty cards in deck 7 are
the arguments about the books — Edmund Wilson's review, Moorcock's *Epic Pooh*, the race criticism,
the argument about women, the argument about class, the argument about whether any of it is any good.
**They are carded as arguments with evidence on each side, not as charges to be answered**, and the
hardest of them get their own cards rather than a clause: `mid-708 Race and Tolkien's peoples`,
`mid-709 Orcs and the question of irredeemable evil`, `mid-710 The Haradrim and the portrayal of the
East`, `mid-711 Women in Tolkien`. A collection that gave a thousand cards to a beloved author and
never mentioned that serious readers have found serious faults would be advertising.

**AND THE SAME RULE RUNS THE OTHER WAY.** `mid-734 Tolkien on Nazi race theory` and `mid-735 The 1938
letter to Rütten & Loening` exist because the documentary record on that point is specific and open,
and leaving it out to keep the criticism deck tidy would be the same fault from the other side. The
card gives what the letter says and what it does not settle.

**3. THE ADAPTATIONS ARE CARDED AS WORKS IN THEIR OWN RIGHT.** 120 cards. Not as a coda about how
close they got: the Jackson trilogy is one of the largest production efforts in film history, its
technical inventions (performance capture, crowd simulation, the digital-and-practical hybrid) are
documented at length by the people who made them, and `mid-798`–`mid-806` card those as filmmaking.
**The fidelity cards are a subset and are labelled as such.**

**4. THE BUSINESS AND THE LAW ARE NOT AN APPENDIX.** Twenty-five cards on the Estate, the 1969 sale
of the film rights, Saul Zaentz, Middle-earth Enterprises, the Embracer sale of 2022, the Ace Books
affair, the trademark disputes, the 2012 suit and the 2017 settlement, and when the copyright
actually expires. **This is the best-documented part of the whole subject** — court filings are
public, long and specific — and it is the part that explains why some adaptations exist and others
cannot.

**5. THE LANGUAGES ARE CARDED AS LINGUISTICS.** Deck 6 is written for a reader who has never met a
sound law. `mid-581 Sound change as a design method` is the card the deck turns on: Tolkien did not
invent two languages, he invented one and then aged it, which is why Quenya and Sindarin are related
the way Latin and Welsh are. **The deck cites the published corpus** — *Parma Eldalamberon*, *Vinyar
Tengwar*, the *Etymologies* — **and is careful to say what is Tolkien's and what is reconstruction**
(`mid-586 Neo-Elvish`, `mid-619 What the published corpus actually contains`).

**6. FANDOM IS CARDED WITHOUT CONTEMPT AND WITHOUT FLATTERY.** Twenty cards. The Tolkien Society is
sixty years old and publishes a refereed journal; fan scholarship has produced real textual work; and
the fandom has also produced organised racist harassment of the cast of a television programme
(`mid-866`). All three are true and all three are carded.

---

## The overlaps, measured

**There are none, and this is the first collection on the shelf of which that is true.** It was
measured rather than assumed:

    grep -rilE "tolkien|middle-earth|hobbit|beowulf|kalevala" docs/*-card-plan.md
    node -e "global.window={};require('./data.js');console.log(window.CARD_DATA.filter(c=>/tolkien|middle-earth|beowulf|kalevala/i.test((c.answerText||'')+' '+(c.question||''))).length)"

Both return nothing. No plan names Tolkien, no shipped card's answer term touches the subject, and
none of the 3,838 glossary terms is a Middle-earth term.

**THE TWO PLACES A FUTURE OVERLAP COULD APPEAR ARE WORTH NAMING NOW.** The First World War collection
covers the Somme, where Tolkien served, and if it ever wants a card on the war's literary aftermath
the division of labour is the usual one — `ww1-` cards the war, `mid-726`–`mid-730` card what the war
did to this writer. And Philosophy holds the moral arguments about power and evil in the abstract;
`mid-676` and `mid-709` card what one novel does with them. Neither pair exists yet.

---

## The Library, which this collection can actually use

**FIVE OF TOLKIEN'S OWN SOURCES ARE ALREADY ON FOLIO'S SHELF, AND ONE OF THEM HAS ITS ORIGINAL
COLUMN.** `beowulf` ships with `beowulf.ang` — the Old English beside the translation — and the
`poetic-edda`, `prose-edda`, `morte-darthur`, `song-of-roland` (with Old French) and `virgil-aeneid`
are all there. So the cards of `mid-sources` can carry `card.quote`, which puts the actual line of
*Beowulf* on the back of the card with a link into the reading room, and for a collection about a
philologist that is the best feature this site has.

**IT IS THE ONLY SUBDECK THAT CAN.** `card.quote` requires the book to be in the Library and the
Library takes only work whose copyright has expired, so no card in decks 2 to 5 may carry one — see
the next section. **Do not write a `quote` block naming a Tolkien text; `add-card.js` will refuse it,
and it is right to.**

**WHAT THE LIBRARY HASN'T GOT, and what would be worth importing before deck 1 is written**: the
*Kalevala* (Crawford's 1888 translation is public domain), the *Völsunga saga* (Morris and Magnússon,
1870), *Sir Gawain and the Green Knight* in a pre-1930 translation, and the *Mabinogion* (Guest). All
four are out of copyright and all four are named in the running order. That is a note, not a promise.

---

## Pictures: the honest answer is mostly no

**THIS IS THE FIRST COLLECTION IN WHICH MOST CARDS CANNOT CARRY AN ILLUSTRATION, AND THE REASON IS
COPYRIGHT RATHER THAN EFFORT.** Tolkien died in 1973, so his writing, his paintings, his maps and his
calligraphy are in copyright in life-plus-seventy countries until 2044 and cannot be linked from
Commons. Film stills, production art, book covers, game screenshots and publicity photographs are all
in copyright too. **Folio links pictures and the bar is PD / CC BY / CC BY-SA**, which rules out
essentially everything a reader would expect to see.

CLAUDE.md's rule is that a card ships with a picture **or with a stated reason why not**. This is
that reason, stated once for the whole collection so it does not have to be restated a thousand
times. **Do not go looking for a Tolkien illustration; it is not there, and anything that looks like
it is on Commons is very likely a mis-licensed upload.**

**WHAT CAN CARRY ONE, and it is a real list rather than a consolation.** Deck 1 is largely free:
Sarehole Mill, Perrott's Folly, King Edward's School, Exeter and Merton, the Eagle and Child, the
Wolvercote grave, the blue plaques, the Somme battlefield and the Thiepval Memorial. The sources
subdeck is free and rich: the *Beowulf* manuscript, the Exeter Book, the Codex Regius, the Franks
Casket, the Sutton Hoo helmet, Gallen-Kallela's *Kalevala* paintings, the Ramsund carving, Rackham
and Dulac. Deck 8 can show filming country — New Zealand has freedom of panorama and its landscapes
are freely photographed — and the Hobbiton set with it. **Expect somewhere between eighty and a
hundred and twenty of the thousand to carry a picture, and check Commons before promising one on any
card outside deck 1.**

**THE ADAPTATION DECKS HAVE ONE THING THE REST DO NOT: `card.video`.** A rights-holder's own official
trailer on YouTube is a legitimate link and the player accepts it (`videoSource`, and the CSP allows
`youtube-nocookie.com`). **A clip is still someone else's work and is linked rather than uploaded**,
exactly as a picture is, and it is worth a card only where the card is about the thing in the clip.

---

## Sourcing

**THIS SUBJECT IS UNUSUALLY WELL SERVED AND TWO OF ITS THREE MAIN JOURNALS ARE OPEN ACCESS.**
*Mythlore* (Mythopoeic Society) and the *Journal of Tolkien Research* (Valparaiso) publish their
whole archives free; *Tolkien Studies* (West Virginia University Press) is refereed and paywalled but
its contents are indexed and many of its authors post preprints; *Mallorn* is the Tolkien Society's
journal. The standard reference works are Hammond and Scull's *Reader's Guide* and *Chronology*, and
the standard critical works are Shippey, Flieger, Garth and Carpenter.

**THE PRIMARY TEXTS ARE THE SOURCE FOR IN-WORLD CLAIMS, CITED BY THE BOOK'S OWN DIVISIONS** — the
Philosophy plan's Stephanus rule in another subject. Cite *The Lord of the Rings* by book and
chapter, not by the page of one printing, because the pagination differs between every edition there
has ever been; cite *The Silmarillion* by chapter; cite *The History of Middle-earth* by volume and
page, which is stable; cite the *Letters* by letter number, which is also stable and survives the
2023 expanded edition. `mid-768 Citing Tolkien` and `mid-769 Standard abbreviations for the texts`
are the cards about this and should be written early.

**A FAN WIKI IS NOT A SOURCE.** Tolkien Gateway and the One Wiki to Rule Them All are the first two
results for nearly every term in this running order, they are largely uncited, and they routinely
present film material as though it were Tolkien's. They are where the research starts, exactly as
Wikipedia is; **follow them to the chapter and cite the chapter.**

**A MAKER'S COMMENTARY IS A SOURCE FOR WHAT THE MAKER SAYS, NOT FOR WHAT THE WORK DOES.** This is the
Architecture plan's manifesto rule in another medium. The Jackson appendices are hundreds of hours of
people explaining their intentions; that is excellent evidence about intention and no evidence at all
about whether the result works, which is a separate question with separate sources (contemporary
reviews, box office, the scholarship on the films, which is now considerable).

**THE BUSINESS AND LEGAL CARDS REST ON DOCUMENTS RATHER THAN REPORTING.** *The Tolkien Trust v. New
Line Cinema* (2008) and *Fourth Age Ltd v. Warner Bros.* (2012, settled 2017) are on the public
docket; the Embracer acquisition of Middle-earth Enterprises (2022) has company filings behind it.
**Prefer the filing to the trade-press summary of the filing.**

---

## Dates, names and spellings

**AN IN-WORLD DATE IS A DATE IN A FICTIONAL CALENDAR AND THE DATE LINE MUST NOT PRETEND OTHERWISE.**
`cardYears` reads `answerDate` to sort the deck, and "T.A. 3019" is not a year it can parse — nor
should it be, because sorting a fictional chronology into Folio's real one would put the War of the
Ring in the third millennium. **An in-world card takes the date of its TEXT**, which is a real date:
the card on the Battle of the Pelennor Fields is dated by *The Return of the King*, 1955. Where the
in-world date is worth stating it goes in the card's prose or as an unlabelled row, never as the
thing the collection is sorted by. **Read the sort year back after writing any date line in decks 3
to 5.**

**THE NAMES CARRY DIACRITICS AND `answerText` IS WHAT A READER TYPES.** Fëanor, Lúthien, Húrin,
Éowyn, Númenor, Ainulindalë, Akallabêth, Khazad-dûm, Namárië. `gradeCloze`'s near-miss tolerance
forgives accents, so a reader typing "Feanor" is marked correct — **but check it rather than assuming
it**, and prefer the form a general reader meets for an answer term with several (Sméagol over
Trahald, Gandalf over Mithrandir, unless the card is about the name).

**A NAME WITH SEVERAL FORMS NEEDS THE OTHERS AS GLOSSARY ALIASES**, which is the same machinery the
Rome collection uses for a Roman with three names. Mithrandir, Olórin, Tharkûn and Incánus are one
person; Aragorn, Strider, Elessar and Thorongil are one person; Sauron, Annatar, Gorthaur and the
Necromancer are one person, and `mid-492 Annatar` and `mid-528 Dol Guldur and the Necromancer` both
depend on the reader knowing it.

**AND THE ADAPTATION DECKS DATE BY RELEASE.** A film's date line is the release year and the
territory, a game's is the release year and the platform, and a television season's is its first
transmission.

---

## The glossary

**IT STARTS FROM NOTHING, AND THAT IS MEASURED.** Of the 3,838 shipped glossary terms, not one is a
Middle-earth term. Expect the glossary to grow faster here than anywhere since Korea, and expect
almost every card to need a new entry for its own answer term under the pairing rule.

**THE TRAP IS THE OPPOSITE OF ECONOMICS'.** There the vocabulary is ordinary English words used
technically; here most of it is invented proper nouns that claim no English surface at all — Gondor,
Númenor, Silmaril, Tengwar, Khuzdul, Eucatastrophe. Those are the easy ones.

**THE HARD ONES ARE THE GENERAL FANTASY WORDS, AND THEY MUST NOT CLAIM THEIR BARE SURFACES.** `Elf`,
`Dwarf`, `Orc`, `Troll`, `Wizard`, `Dragon`, `Ring`, `Shire` and `Mark` are ordinary English words
with folkloric or technical senses elsewhere in the corpus, and `Dwarf` is the sharpest: Astronomy's
running order contains white dwarfs and dwarf planets, and Biology's contains dwarfism. Key them
`Elf_(Middle-earth)`, `Dwarf_(Middle-earth)`, `Orc_(Middle-earth)` on `Life_(biology)`'s rule, reach
them by a narrower alias and a hand-written `data-k`, and **measure the bare word over the shipped
corpus before deciding**, exactly as `Cell_(biology)` was measured twice and answered differently the
second time. `Ring` is keyed `One_Ring`, which is the real article title and claims nothing.

**`Ent` IS THREE CHARACTERS AND `buildGlossIndex` SKIPS A SURFACE UNDER THREE**, so it is reachable
but only just; give it `Ents` as its working alias, as `pH` is given `pH scale`.

**FIVE GENERAL TERMS THE COLLECTION WILL LINK TO ALREADY EXIST AND MUST BE WIDENED RATHER THAN
RE-KEYED** — `Middle_Ages`, `Foundation_myth`, `Norman_Conquest`, `Homeric_Question` and
`Epic_of_Gilgamesh`. `add-glossary.js` overwrites in silence; check before running it.

---

## Difficulty, and why this collection is unusual in the minigames

**MORE OF THIS COLLECTION WILL REACH THE DAILY GAMES THAN OF ANY OTHER ON THE SHELF.** `difficulty`
rates how well known an answer term is to the general population, and Gandalf, Frodo, Mordor, the
Shire, Gollum and the One Ring are household names in a way that almost nothing in Ancient
Mesopotamia is. Expect a great many 1s and 2s in decks 2, 4 and 8, and 4s and 5s through decks 3, 5
and 6 — Nirnaeth Arnoediad and Iglishmêk are as obscure as anything Folio holds.

**`undatable` IS THE FLAG TO WATCH HERE AND IT WILL BE SET OFTEN.** Timeline asks a reader to place
an answer term in real time, and an in-world place, people or event has no real date at all, so
nearly every card in decks 3, 4 and 5 that the games can reach should carry `undatable: true`. A card
about a BOOK, a FILM or a PERSON does not: those happened.

---

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| The man and the making | Tolkien's life | 30 | mid-001–030 |
|  | Philology and the day job | 25 | mid-031–055 |
|  | What he read | 30 | mid-056–085 |
|  | Writing and publishing | 25 | mid-086–110 |
| The books | The Hobbit | 25 | mid-111–135 |
|  | The Lord of the Rings | 35 | mid-136–170 |
|  | The Silmarillion | 28 | mid-171–198 |
|  | The posthumous volumes | 22 | mid-199–220 |
| The world | Creation and the Valar | 25 | mid-221–245 |
|  | The shape of Arda and its Ages | 25 | mid-246–270 |
|  | Beleriand and the drowned West | 22 | mid-271–292 |
|  | The lands of the Third Age | 28 | mid-293–320 |
|  | Maps, calendars and measure | 15 | mid-321–335 |
| The peoples | Elves | 28 | mid-336–363 |
|  | Men | 26 | mid-364–389 |
|  | Dwarves | 20 | mid-390–409 |
|  | Hobbits | 20 | mid-410–429 |
|  | Ents, Orcs and the other kindreds | 21 | mid-430–450 |
| The histories | The First Age | 35 | mid-451–485 |
|  | The Second Age | 25 | mid-486–510 |
|  | The Third Age | 25 | mid-511–535 |
|  | The War of the Ring | 35 | mid-536–570 |
| The languages | Inventing a language | 20 | mid-571–590 |
|  | Quenya and Sindarin | 30 | mid-591–620 |
|  | The other tongues | 20 | mid-621–640 |
|  | Scripts, names and inscriptions | 25 | mid-641–665 |
| Reading Tolkien | The themes | 30 | mid-666–695 |
|  | The arguments about the books | 30 | mid-696–725 |
|  | Tolkien and his century | 25 | mid-726–750 |
|  | Tolkien studies | 20 | mid-751–770 |
| The adaptations | Before Jackson | 22 | mid-771–792 |
|  | The Jackson trilogy | 35 | mid-793–827 |
|  | The Hobbit films | 22 | mid-828–849 |
|  | The Rings of Power | 22 | mid-850–871 |
|  | Radio, stage and music | 19 | mid-872–890 |
| The franchise | Games on the table | 22 | mid-891–912 |
|  | Video games | 25 | mid-913–937 |
|  | Publishing, the Estate and the law | 25 | mid-938–962 |
|  | Fandom | 20 | mid-963–982 |
|  | What came after | 18 | mid-983–mid-1000 |

Nine decks, forty subdecks, one thousand cards.

---

# The list

## The man and the making

### Tolkien's life — `mid-life`

    mid-001  J. R. R. Tolkien
    mid-002  Bloemfontein and the family's return to England
    mid-003  Mabel Tolkien
    mid-004  Sarehole and the Warwickshire countryside
    mid-005  Birmingham and King Edward's School
    mid-006  Mabel Tolkien's conversion and death
    mid-007  Father Francis Morgan
    mid-008  The T.C.B.S.
    mid-009  Edith Bratt
    mid-010  Exeter College, Oxford
    mid-011  Tolkien's First World War service
    mid-012  The Somme and the Lancashire Fusiliers
    mid-013  Trench fever
    mid-014  Great Haywood and the first Lost Tales
    mid-015  The Oxford English Dictionary
    mid-016  Leeds and the first chair
    mid-017  Rawlinson and Bosworth Professor of Anglo-Saxon
    mid-018  Oxford between the wars
    mid-019  The Inklings
    mid-020  C. S. Lewis
    mid-021  Tolkien's Catholicism
    mid-022  Tolkien's marriage and household
    mid-023  Christopher Tolkien
    mid-024  Tolkien's letters
    mid-025  Merton Professor of English Language and Literature
    mid-026  Retirement and the fame of the 1960s
    mid-027  Bournemouth and the last years
    mid-028  Tolkien's death and the Wolvercote grave
    mid-029  Humphrey Carpenter's biography and its limits
    mid-030  What a biography cannot tell you about the books

### Philology and the day job — `mid-philology`

    mid-031  Philology
    mid-032  Comparative philology in the nineteenth century
    mid-033  Grimm's law
    mid-034  Old English
    mid-035  Middle English
    mid-036  The Gothic language
    mid-037  Old Norse
    mid-038  Finnish and what Tolkien took from it
    mid-039  Welsh and what Tolkien took from it
    mid-040  The Ancrene Wisse
    mid-041  Tolkien and Gordon's Sir Gawain edition
    mid-042  A Middle English Vocabulary
    mid-043  Beowulf: The Monsters and the Critics
    mid-044  Tolkien's Beowulf translation
    mid-045  Sellic Spell
    mid-046  On Fairy-Stories as a lecture
    mid-047  Tolkien as a teacher
    mid-048  The Oxford English syllabus and the Lang-Lit quarrel
    mid-049  Tolkien's lexicography
    mid-050  Reconstructing a lost word
    mid-051  The asterisk-word
    mid-052  Place-name study
    mid-053  The Name Nodens
    mid-054  Tolkien's scholarly output and its size
    mid-055  What a philologist does with a poem

### What he read — `mid-sources`

    mid-056  Beowulf
    mid-057  The Beowulf manuscript
    mid-058  Grendel and the monster as a literary problem
    mid-059  The dragon in Beowulf
    mid-060  The Old English elegies
    mid-061  Éarendel in Cynewulf's Crist
    mid-062  The Exeter Book
    mid-063  The Poetic Edda
    mid-064  The Prose Edda
    mid-065  The Dvergatal
    mid-066  Völsunga saga
    mid-067  Sigurd and Fáfnir
    mid-068  Wagner's Ring and whether Tolkien owed it anything
    mid-069  The Nibelungenlied
    mid-070  The Kalevala
    mid-071  Kullervo
    mid-072  The Mabinogion
    mid-073  The Celtic question
    mid-074  Arthurian romance
    mid-075  Sir Gawain and the Green Knight
    mid-076  The Fall of Arthur
    mid-077  Faërie and the fairy-tale tradition
    mid-078  George MacDonald
    mid-079  William Morris
    mid-080  Andrew Lang's Fairy Books
    mid-081  H. Rider Haggard
    mid-082  Catholic theology in Tolkien's reading
    mid-083  Genesis and the creation story
    mid-084  Atlantis and the drowning of a land
    mid-085  Which sources Tolkien actually acknowledged

### Writing and publishing — `mid-writing`

    mid-086  The Book of Lost Tales
    mid-087  The Fall of Gondolin as the first story
    mid-088  The Lay of Leithian
    mid-089  The Lays of Beleriand
    mid-090  The 1937 Quenta Silmarillion
    mid-091  The rejection of the Silmarillion in 1937
    mid-092  Stanley Unwin
    mid-093  Rayner Unwin
    mid-094  Writing The Lord of the Rings, 1937 to 1949
    mid-095  The false starts of Book I
    mid-096  Trotter becomes Strider
    mid-097  The typescripts and the manuscripts
    mid-098  Tolkien's handwriting and its problems
    mid-099  The Marquette manuscripts
    mid-100  The Bodleian Tolkien archive
    mid-101  Tolkien's own illustrations
    mid-102  Tolkien's maps
    mid-103  Tolkien's calligraphy and the dust-jacket designs
    mid-104  The Allen and Unwin edition of 1954 to 1955
    mid-105  Why the book came out in three volumes
    mid-106  The appendices and what nearly went into them
    mid-107  The second edition of 1965
    mid-108  The Ace Books affair
    mid-109  The paperback boom and the American campus
    mid-110  Tolkien's unfinished last work

## The books

### The Hobbit — `mid-hobbit`

    mid-111  The Hobbit
    mid-112  In a hole in the ground there lived a hobbit
    mid-113  Bilbo Baggins
    mid-114  Thorin Oakenshield
    mid-115  Thorin's company
    mid-116  Gandalf in The Hobbit
    mid-117  The trolls
    mid-118  Rivendell in The Hobbit
    mid-119  Gollum and the riddle-game
    mid-120  The 1951 revision of Riddles in the Dark
    mid-121  Beorn
    mid-122  Mirkwood
    mid-123  The Elvenking's halls
    mid-124  Lake-town
    mid-125  Smaug
    mid-126  The Arkenstone
    mid-127  Bard the Bowman
    mid-128  The Battle of Five Armies
    mid-129  The Hobbit's narrator
    mid-130  The Hobbit as a children's book
    mid-131  The Hobbit's illustrations
    mid-132  The first edition of 1937
    mid-133  The Hobbit's reception
    mid-134  How The Hobbit was drawn into the legendarium
    mid-135  The 1960 rewriting Tolkien abandoned

### The Lord of the Rings — `mid-lotr`

    mid-136  The Lord of the Rings
    mid-137  Why it is one book and not three
    mid-138  The Fellowship of the Ring
    mid-139  The Two Towers
    mid-140  The Return of the King
    mid-141  Concerning Hobbits
    mid-142  The Shire chapters and their pace
    mid-143  The Bombadil chapters
    mid-144  The Council of Elrond
    mid-145  The breaking of the Fellowship
    mid-146  Interlace
    mid-147  The two strands of Book III and Book IV
    mid-148  The Scouring of the Shire
    mid-149  The Grey Havens and the ending
    mid-150  The appendices
    mid-151  Appendix A and the annals of the kings
    mid-152  Appendix B and the Tale of Years
    mid-153  Appendix F and the note on translation
    mid-154  The found-manuscript frame
    mid-155  The Red Book of Westmarch
    mid-156  Tolkien as translator rather than author
    mid-157  The maps of The Lord of the Rings
    mid-158  Chapter titles as signposts
    mid-159  Verse in The Lord of the Rings
    mid-160  The songs and who sings them
    mid-161  The style and its critics
    mid-162  Archaism in the prose
    mid-163  The absence of religion on the page
    mid-164  Dreams, foresight and the working of the plot
    mid-165  The first reviews
    mid-166  Sales and the long tail
    mid-167  The American editions of 1965 and their covers
    mid-168  Translating The Lord of the Rings
    mid-169  The Guide to the Names
    mid-170  The Reader's Companion

### The Silmarillion — `mid-silm`

    mid-171  The Silmarillion
    mid-172  What the Silmarillion meant to Tolkien
    mid-173  The Ainulindalë
    mid-174  The Valaquenta
    mid-175  The Quenta Silmarillion
    mid-176  The Akallabêth
    mid-177  Of the Rings of Power and the Third Age
    mid-178  Christopher Tolkien as editor
    mid-179  Guy Gavriel Kay's part in the 1977 edition
    mid-180  The choices the 1977 edition had to make
    mid-181  Where the 1977 text departs from its sources
    mid-182  The Silmarillion's reception in 1977
    mid-183  The Silmarillion's style
    mid-184  The annalistic mode
    mid-185  Why the Silmarillion has no hobbits
    mid-186  The problem of the Sun and the Moon
    mid-187  The flat world and the round world
    mid-188  The Athrabeth Finrod ah Andreth
    mid-189  Myths Transformed
    mid-190  The 1977 text as a construction rather than a work
    mid-191  Reading the Silmarillion as scripture-shaped
    mid-192  The genealogies
    mid-193  The index and the pronunciation guide
    mid-194  The Silmarillion's map
    mid-195  What a canonical Silmarillion would even be
    mid-196  Later editions and corrections
    mid-197  The illustrated editions
    mid-198  How to cite the Silmarillion

### The posthumous volumes — `mid-posthumous`

    mid-199  Unfinished Tales
    mid-200  The Disaster of the Gladden Fields
    mid-201  The Quest of Erebor
    mid-202  Aldarion and Erendis
    mid-203  The History of Middle-earth
    mid-204  The Book of Lost Tales I and II
    mid-205  The Lost Road and Other Writings
    mid-206  The Shaping of Middle-earth
    mid-207  The Notion Club Papers
    mid-208  The Return of the Shadow
    mid-209  The Treason of Isengard
    mid-210  The War of the Ring in the History of Middle-earth
    mid-211  Sauron Defeated
    mid-212  Morgoth's Ring
    mid-213  The War of the Jewels
    mid-214  The Peoples of Middle-earth
    mid-215  The Children of Húrin
    mid-216  Beren and Lúthien as a book
    mid-217  The Fall of Gondolin as a book
    mid-218  The Nature of Middle-earth
    mid-219  Christopher Tolkien's editorial method
    mid-220  Reading a draft as evidence

## The world

### Creation and the Valar — `mid-cosmology`

    mid-221  Eru Ilúvatar
    mid-222  The Ainur
    mid-223  The Music of the Ainur
    mid-224  Melkor's discord
    mid-225  The Vision and the Making
    mid-226  Eä
    mid-227  The Valar
    mid-228  Manwë
    mid-229  Varda
    mid-230  Ulmo
    mid-231  Aulë
    mid-232  Yavanna
    mid-233  Mandos and the Halls of Waiting
    mid-234  Nienna
    mid-235  Oromë
    mid-236  Tulkas
    mid-237  Melkor
    mid-238  The Maiar
    mid-239  Sauron as a Maia
    mid-240  The Balrogs
    mid-241  The Istari
    mid-242  Olórin
    mid-243  Valinor
    mid-244  The Two Trees
    mid-245  Fate and free will in Arda

### The shape of Arda and its Ages — `mid-ages`

    mid-246  Arda
    mid-247  The Years of the Lamps
    mid-248  Almaren
    mid-249  The Years of the Trees
    mid-250  The awakening of the Elves at Cuiviénen
    mid-251  The Great Journey
    mid-252  The Darkening of Valinor
    mid-253  The first rising of the Sun
    mid-254  The Long Night and the kindling of the stars
    mid-255  The Sun and the Moon as vessels
    mid-256  The Elder Days
    mid-257  The Fourth Age
    mid-258  The Changing of the World
    mid-259  The Straight Road
    mid-260  The Circles of the World
    mid-261  Death as the Gift of Men
    mid-262  The fate of Elves
    mid-263  Rebirth and the Halls of Mandos
    mid-264  Time and its reckoning in Valinor
    mid-265  The Ban of the Valar
    mid-266  The Dominion of Men
    mid-267  After the Fourth Age
    mid-268  The Dagor Dagorath
    mid-269  Arda Marred and Arda Healed
    mid-270  Why Tolkien kept rewriting the cosmology

### Beleriand and the drowned West — `mid-beleriand`

    mid-271  Beleriand
    mid-272  Menegroth and Doriath
    mid-273  The Girdle of Melian
    mid-274  Nargothrond
    mid-275  Gondolin
    mid-276  Hithlum
    mid-277  Himring and the March of Maedhros
    mid-278  Angband
    mid-279  Thangorodrim
    mid-280  Nan Elmoth
    mid-281  The Falas and the Havens
    mid-282  Tol Sirion
    mid-283  The Ered Gorgoroth
    mid-284  Ossiriand and the Green-elves
    mid-285  The drowning of Beleriand
    mid-286  Lindon
    mid-287  Númenor
    mid-288  Armenelos and the Meneltarma
    mid-289  The Downfall of Númenor
    mid-290  Tol Eressëa
    mid-291  Aman after the Change
    mid-292  Reading a drowned map

### The lands of the Third Age — `mid-lands`

    mid-293  Middle-earth
    mid-294  Eriador
    mid-295  The Shire
    mid-296  Bree
    mid-297  The Old Forest
    mid-298  The Barrow-downs
    mid-299  Weathertop
    mid-300  Rivendell
    mid-301  The Misty Mountains
    mid-302  Moria
    mid-303  The Redhorn Pass
    mid-304  Lothlórien
    mid-305  The Anduin
    mid-306  Fangorn
    mid-307  Isengard
    mid-308  Rohan
    mid-309  Edoras
    mid-310  Helm's Deep
    mid-311  Gondor
    mid-312  Minas Tirith
    mid-313  Osgiliath
    mid-314  Ithilien
    mid-315  Mordor
    mid-316  Barad-dûr
    mid-317  Mount Doom
    mid-318  The Dead Marshes
    mid-319  Rhûn and Harad
    mid-320  What the map does not show

### Maps, calendars and measure — `mid-reckoning`

    mid-321  The maps of Middle-earth
    mid-322  Christopher Tolkien's map of 1954
    mid-323  Pauline Baynes's poster map
    mid-324  Scale and distance in Middle-earth
    mid-325  The Shire Reckoning
    mid-326  The Stewards' Reckoning
    mid-327  The Tale of Years
    mid-328  Dating the War of the Ring
    mid-329  Measures, coins and weights
    mid-330  The seasons and the climate of Middle-earth
    mid-331  Whether Arda's geology works
    mid-332  Middle-earth as the real Earth
    mid-333  The latitude of the Shire
    mid-334  The distances the characters actually walk
    mid-335  Where the internal chronology fails

## The peoples

### Elves — `mid-elves`

    mid-336  The Elves
    mid-337  The Firstborn
    mid-338  The Sundering of the Elves
    mid-339  The Vanyar
    mid-340  The Noldor
    mid-341  The Teleri
    mid-342  The Sindar
    mid-343  The Avari
    mid-344  The Silvan Elves
    mid-345  Fëanor
    mid-346  The Silmarils
    mid-347  The Oath of Fëanor
    mid-348  The Kinslaying at Alqualondë
    mid-349  Fingolfin
    mid-350  Finrod Felagund
    mid-351  Maedhros
    mid-352  Galadriel
    mid-353  Celeborn
    mid-354  Elrond
    mid-355  Elu Thingol
    mid-356  Melian
    mid-357  Lúthien
    mid-358  Eärendil
    mid-359  Legolas
    mid-360  Elvish immortality and weariness
    mid-361  Elvish craft and the making of things
    mid-362  The fading of the Elves
    mid-363  Where Tolkien's Elves came from

### Men — `mid-men`

    mid-364  Men in Middle-earth
    mid-365  The Awakening of Men
    mid-366  The Edain
    mid-367  The Three Houses of the Edain
    mid-368  Bëor
    mid-369  Hador
    mid-370  Haleth
    mid-371  Beren
    mid-372  Húrin
    mid-373  Túrin Turambar
    mid-374  Tuor
    mid-375  The Númenóreans
    mid-376  Elros
    mid-377  Ar-Pharazôn
    mid-378  The Faithful
    mid-379  Elendil
    mid-380  Isildur
    mid-381  The Dúnedain of the North
    mid-382  Aragorn
    mid-383  The Kings of Gondor
    mid-384  The Stewards of Gondor
    mid-385  Denethor
    mid-386  Boromir
    mid-387  Faramir
    mid-388  The Rohirrim
    mid-389  Éowyn

### Dwarves — `mid-dwarves`

    mid-390  The Dwarves
    mid-391  Aulë and the making of the Dwarves
    mid-392  The Seven Fathers
    mid-393  Durin the Deathless
    mid-394  Khazad-dûm
    mid-395  The Longbeards
    mid-396  Erebor
    mid-397  The Iron Hills
    mid-398  The Blue Mountains
    mid-399  Dwarvish craft
    mid-400  Mithril
    mid-401  The Nauglamír
    mid-402  The Dwarves and the ruin of Doriath
    mid-403  The War of the Dwarves and Orcs
    mid-404  The Battle of Azanulbizar
    mid-405  Balin's colony in Moria
    mid-406  Gimli
    mid-407  Dwarf-women and the secrecy of the Dwarves
    mid-408  The Dwarves and the Rings of Power
    mid-409  Where Tolkien's Dwarves came from

### Hobbits — `mid-hobbits`

    mid-410  Hobbits
    mid-411  The word hobbit
    mid-412  Harfoots, Stoors and Fallohides
    mid-413  The Shire's institutions
    mid-414  The Mayor, the Thain and the Master
    mid-415  Hobbit food and hospitality
    mid-416  Hobbit-holes
    mid-417  Hobbit names and family
    mid-418  The Sackville-Bagginses
    mid-419  Frodo Baggins
    mid-420  Samwise Gamgee
    mid-421  Meriadoc Brandybuck
    mid-422  Peregrin Took
    mid-423  Sméagol
    mid-424  Sméagol's two voices
    mid-425  The Old Took and Bilbo's oddity
    mid-426  Pipe-weed
    mid-427  Hobbits and the English countryside
    mid-428  Hobbits as the reader's way in
    mid-429  Why the small people are the heroes

### Ents, Orcs and the other kindreds — `mid-kindreds`

    mid-430  Ents
    mid-431  Treebeard
    mid-432  The Entwives
    mid-433  Huorns
    mid-434  Orcs
    mid-435  Where Orcs came from
    mid-436  The problem of Orc origins
    mid-437  Uruk-hai
    mid-438  Trolls
    mid-439  Dragons
    mid-440  Glaurung
    mid-441  Ancalagon
    mid-442  Smaug as a character
    mid-443  Eagles
    mid-444  Gwaihir and the eagle question
    mid-445  Wargs
    mid-446  Ungoliant
    mid-447  Shelob
    mid-448  The Nazgûl
    mid-449  The Witch-king of Angmar
    mid-450  Tom Bombadil

## The histories

### The First Age — `mid-firstage`

    mid-451  The First Age
    mid-452  The Awakening at Cuiviénen
    mid-453  The Chaining of Melkor
    mid-454  The Noldor in Valinor
    mid-455  The unchaining of Melkor and his lies
    mid-456  The making of the Silmarils
    mid-457  Ungoliant and the poisoning of the Trees
    mid-458  The theft of the Silmarils
    mid-459  The Flight of the Noldor
    mid-460  The burning of the ships at Losgar
    mid-461  The Helcaraxë
    mid-462  Dagor-nuin-Giliath
    mid-463  The Siege of Angband
    mid-464  Dagor Aglareb
    mid-465  The coming of Men to Beleriand
    mid-466  Dagor Bragollach
    mid-467  The death of Fingolfin
    mid-468  Beren and Lúthien
    mid-469  Huan the Hound of Valinor
    mid-470  The quest for the Silmaril
    mid-471  Carcharoth
    mid-472  Nirnaeth Arnoediad
    mid-473  The curse of Húrin
    mid-474  The ruin of the house of Hador
    mid-475  The fall of Nargothrond
    mid-476  The fall of Doriath
    mid-477  The Nauglamír and the ruin of Menegroth
    mid-478  Tuor and the fall of Gondolin
    mid-479  Eärendil's voyage
    mid-480  The sack of the Havens of Sirion
    mid-481  The War of Wrath
    mid-482  The fate of the Silmarils
    mid-483  The casting out of Morgoth
    mid-484  The First Age as tragedy
    mid-485  Why the First Age reads like a chronicle

### The Second Age — `mid-secondage`

    mid-486  The Second Age
    mid-487  The founding of Númenor
    mid-488  The reward of the Edain
    mid-489  Númenórean ships and empire
    mid-490  Gil-galad and Lindon
    mid-491  Eregion and Celebrimbor
    mid-492  Annatar
    mid-493  The forging of the Rings of Power
    mid-494  The One Ring
    mid-495  What the Ring does
    mid-496  The War of the Elves and Sauron
    mid-497  Khazad-dûm at its height
    mid-498  The Númenórean colonies
    mid-499  Ar-Pharazôn and the capture of Sauron
    mid-500  The corruption of Númenor
    mid-501  The Temple of Melkor
    mid-502  The persecution of the Faithful
    mid-503  The Great Armament
    mid-504  The Downfall
    mid-505  The founding of Arnor and Gondor
    mid-506  The Last Alliance
    mid-507  The Battle of Dagorlad
    mid-508  The Siege of Barad-dûr
    mid-509  Isildur and the Ring
    mid-510  The Gladden Fields

### The Third Age — `mid-thirdage`

    mid-511  The Third Age
    mid-512  The Watchful Peace
    mid-513  The division and fall of Arnor
    mid-514  Angmar and the Witch-king
    mid-515  Fornost and the end of the North-kingdom
    mid-516  The Rangers of the North
    mid-517  The Kin-strife of Gondor
    mid-518  The Great Plague
    mid-519  The Wainriders
    mid-520  Gondor's decline and the rule of the Stewards
    mid-521  The coming of the Istari
    mid-522  Saruman
    mid-523  Radagast
    mid-524  The Blue Wizards
    mid-525  The waking of Durin's Bane
    mid-526  The abandonment of Moria
    mid-527  Eorl the Young and the founding of Rohan
    mid-528  Dol Guldur and the Necromancer
    mid-529  The White Council
    mid-530  Déagol, Sméagol and the finding of the Ring
    mid-531  Gollum's long years under the mountains
    mid-532  Bilbo's finding of the Ring
    mid-533  Gandalf's reasons for the Erebor expedition
    mid-534  Gandalf's investigation of the Ring
    mid-535  The seventeen years in the Shire

### The War of the Ring — `mid-warofring`

    mid-536  The War of the Ring
    mid-537  The flight to Bree
    mid-538  The Black Riders
    mid-539  The attack at Weathertop
    mid-540  The Ford of Bruinen
    mid-541  What the Council of Elrond decided
    mid-542  Caradhras and the choice of Moria
    mid-543  The Bridge of Khazad-dûm
    mid-544  Gandalf's fall and return
    mid-545  Lothlórien and the Mirror of Galadriel
    mid-546  The temptation of Boromir
    mid-547  Amon Hen
    mid-548  The Riders of Rohan
    mid-549  Théoden
    mid-550  Éomer
    mid-551  Saruman's war
    mid-552  The Battle of the Hornburg
    mid-553  The Ents march on Isengard
    mid-554  The palantíri
    mid-555  The Voice of Saruman
    mid-556  Frodo, Sam and Gollum on the road
    mid-557  The Black Gate and the choice of Cirith Ungol
    mid-558  Faramir in Ithilien
    mid-559  Shelob's lair
    mid-560  The siege of Minas Tirith
    mid-561  The lighting of the beacons
    mid-562  The Ride of the Rohirrim
    mid-563  The Battle of the Pelennor Fields
    mid-564  The death of the Witch-king
    mid-565  The Paths of the Dead
    mid-566  The Houses of Healing
    mid-567  The Black Gate opens
    mid-568  The Cracks of Doom
    mid-569  The Field of Cormallen and the crowning
    mid-570  What the victory cost

## The languages

### Inventing a language — `mid-glossopoeia`

    mid-571  Glossopoeia
    mid-572  A Secret Vice
    mid-573  The language came first
    mid-574  What a constructed language is
    mid-575  Phonaesthetics
    mid-576  Naffarin and the boyhood languages
    mid-577  Animalic and Nevbosh
    mid-578  The Elvish family tree
    mid-579  Primitive Quendian
    mid-580  Common Eldarin
    mid-581  Sound change as a design method
    mid-582  Why the languages were never finished
    mid-583  The Etymologies
    mid-584  Vinyar Tengwar and Parma Eldalamberon
    mid-585  The Elvish Linguistic Fellowship
    mid-586  Neo-Elvish
    mid-587  Whether Tolkien's languages can be spoken
    mid-588  Language and history in the legendarium
    mid-589  Names as evidence
    mid-590  A language needs a people

### Quenya and Sindarin — `mid-elvish`

    mid-591  Quenya
    mid-592  Quenya phonology
    mid-593  Quenya and Finnish
    mid-594  Quenya grammar
    mid-595  The Quenya cases
    mid-596  Namárië
    mid-597  Quenya as a book-language
    mid-598  Sindarin
    mid-599  Sindarin and Welsh
    mid-600  Sindarin mutation
    mid-601  The sound history of Sindarin
    mid-602  A Elbereth Gilthoniel
    mid-603  Telerin
    mid-604  Nandorin
    mid-605  Doriathrin
    mid-606  Quenya and Sindarin compared
    mid-607  Elvish word-formation
    mid-608  Elvish numerals
    mid-609  The vocabulary of the Elvish calendar
    mid-610  Elvish verse and metre
    mid-611  The Markirya poem
    mid-612  The praise at Cormallen
    mid-613  Elvish personal names
    mid-614  Mother-names and father-names
    mid-615  Elvish place-names
    mid-616  Elvish in the films
    mid-617  David Salo and the film dialogue
    mid-618  Learning Elvish
    mid-619  What the published corpus actually contains
    mid-620  Why the two languages keep changing

### The other tongues — `mid-tongues`

    mid-621  Khuzdul
    mid-622  The secret language of the Dwarves
    mid-623  Iglishmêk
    mid-624  Khuzdul and the Semitic languages
    mid-625  The Black Speech
    mid-626  The Ring-inscription
    mid-627  Orkish
    mid-628  Adûnaic
    mid-629  Adûnaic grammar
    mid-630  Westron
    mid-631  The Common Speech as a translation
    mid-632  Hobbit dialect
    mid-633  Rohirric
    mid-634  Why Rohan speaks Old English
    mid-635  The language of Dale
    mid-636  Valarin
    mid-637  Entish
    mid-638  The tongues of Men in the East
    mid-639  Translation inside the fiction
    mid-640  Language and the found-manuscript conceit

### Scripts, names and inscriptions — `mid-scripts`

    mid-641  Tengwar
    mid-642  The Fëanorian letters
    mid-643  Tengwar modes
    mid-644  The mode of Beleriand
    mid-645  The Cirth
    mid-646  The Angerthas
    mid-647  Runes in The Hobbit
    mid-648  Sarati
    mid-649  Moon-letters
    mid-650  The Doors of Durin
    mid-651  The Ring-inscription as an artefact
    mid-652  The Book of Mazarbul pages
    mid-653  Tolkien's calligraphy
    mid-654  Tengwar on the title pages
    mid-655  Tengwar in the films
    mid-656  Tengwar and Unicode
    mid-657  Writing English in tengwar
    mid-658  Naming conventions and diacritics
    mid-659  The accents in Tolkien's names
    mid-660  How to pronounce the names
    mid-661  The pronunciation appendix
    mid-662  Anglicised spellings across the editions
    mid-663  Reading an invented inscription
    mid-664  Forgeries and fan inscriptions
    mid-665  Why the scripts matter to the fiction

## Reading Tolkien

### The themes — `mid-themes`

    mid-666  Sub-creation
    mid-667  The Secondary World
    mid-668  Eucatastrophe
    mid-669  On Fairy-Stories as a manifesto
    mid-670  Recovery, Escape and Consolation
    mid-671  Mythopoeia
    mid-672  The Addison's Walk conversation
    mid-673  Providence in the plot
    mid-674  Pity and mercy
    mid-675  Gollum's part in the ending
    mid-676  The temptation of power
    mid-677  The Ring as an addiction
    mid-678  Free will and the will of the Ring
    mid-679  Death and deathlessness
    mid-680  The Machine
    mid-681  Industry and the Shire
    mid-682  Trees and the natural world
    mid-683  Courage without hope
    mid-684  The northern theory of courage
    mid-685  Friendship and fellowship
    mid-686  Hierarchy and kingship
    mid-687  Estel and amdir, two kinds of hope
    mid-688  Fate and doom
    mid-689  Music as the foundation of the world
    mid-690  Light as a moral image
    mid-691  Names and true naming
    mid-692  Memory and loss
    mid-693  The long defeat
    mid-694  An ending that is not happy
    mid-695  Applicability, not allegory

### The arguments about the books — `mid-criticism`

    mid-696  Edmund Wilson's Oo, Those Awful Orcs
    mid-697  The early hostile reviews
    mid-698  W. H. Auden's defence
    mid-699  C. S. Lewis's review
    mid-700  The critical establishment and fantasy
    mid-701  Tolkien and modernism
    mid-702  Is The Lord of the Rings escapist?
    mid-703  The charge of nostalgia
    mid-704  The argument about the prose
    mid-705  Michael Moorcock's Epic Pooh
    mid-706  The Waterstone's poll of 1997
    mid-707  Germaine Greer and the reaction to that poll
    mid-708  Race and Tolkien's peoples
    mid-709  Orcs and the question of irredeemable evil
    mid-710  The Haradrim and the portrayal of the East
    mid-711  Women in Tolkien
    mid-712  Éowyn and the critics
    mid-713  Galadriel and the critics
    mid-714  Class and the Shire
    mid-715  The absence of ordinary politics
    mid-716  Tolkien and empire
    mid-717  Tolkien and the environment
    mid-718  Christian readings
    mid-719  Tolkien's own view of allegory
    mid-720  Tolkien and Jung
    mid-721  Psychoanalytic readings
    mid-722  Narratological readings
    mid-723  Fantasy as a genre after Tolkien
    mid-724  The canon question
    mid-725  How to argue about a book like this

### Tolkien and his century — `mid-century`

    mid-726  Tolkien and the First World War
    mid-727  John Garth's argument
    mid-728  The T.C.B.S. and the war dead
    mid-729  The Somme in the legendarium
    mid-730  The Dead Marshes and no man's land
    mid-731  Tolkien and the Second World War
    mid-732  Tolkien's wartime letters
    mid-733  The atomic bomb and the Ring
    mid-734  Tolkien on Nazi race theory
    mid-735  The 1938 letter to Rütten and Loening
    mid-736  Tolkien's politics
    mid-737  Tolkien on machines and motor-cars
    mid-738  A mythology for England
    mid-739  Tolkien's Catholicism in a secular century
    mid-740  Tolkien and the Oxford of his day
    mid-741  The Inklings as a literary group
    mid-742  Tolkien and Lewis estranged
    mid-743  Owen Barfield
    mid-744  Charles Williams
    mid-745  Tolkien and the counterculture
    mid-746  Frodo Lives
    mid-747  Tolkien's discomfort with his fame
    mid-748  The beginnings of modern fandom
    mid-749  The Shire and the environmental movement
    mid-750  Reading a book of the 1950s now

### Tolkien studies — `mid-scholarship`

    mid-751  Tolkien studies as a field
    mid-752  Tom Shippey
    mid-753  The Road to Middle-earth
    mid-754  Verlyn Flieger
    mid-755  Splintered Light
    mid-756  John Garth
    mid-757  Wayne Hammond and Christina Scull
    mid-758  The Chronology and the Reader's Guide
    mid-759  Mythlore
    mid-760  The journal Tolkien Studies
    mid-761  Journal of Tolkien Research
    mid-762  Mallorn and the Tolkien Society's press
    mid-763  The Bodleian's Tolkien collection
    mid-764  The Marquette collection
    mid-765  Editing the drafts as textual scholarship
    mid-766  What counts as evidence in Tolkien studies
    mid-767  The fan-wiki problem
    mid-768  Citing Tolkien
    mid-769  Standard abbreviations for the texts
    mid-770  Where the scholarship still disagrees

## The adaptations

### Before Jackson — `mid-early`

    mid-771  Adapting Tolkien before 1978
    mid-772  The BBC radio Lord of the Rings of 1955
    mid-773  Morton Grady Zimmerman's film treatment
    mid-774  Tolkien's reply to the 1957 treatment
    mid-775  The Beatles' proposed film
    mid-776  The 1966 Gene Deitch Hobbit
    mid-777  The 1967 Hobbit stage play
    mid-778  The 1977 Rankin/Bass Hobbit
    mid-779  The 1978 Ralph Bakshi film
    mid-780  Rotoscoping and Bakshi's method
    mid-781  Why Bakshi's film stops where it does
    mid-782  The 1980 Rankin/Bass Return of the King
    mid-783  The 1981 BBC radio dramatisation
    mid-784  Brian Sibley and Michael Bakewell
    mid-785  The 1985 Soviet television Hobbit
    mid-786  Khraniteli
    mid-787  Hobitit
    mid-788  Animated Tolkien outside the English-speaking world
    mid-789  What the early adaptations got right
    mid-790  What the early adaptations could not do
    mid-791  Adaptation before digital effects
    mid-792  The rights behind each of these

### The Jackson trilogy — `mid-jackson`

    mid-793  Peter Jackson's The Lord of the Rings
    mid-794  How the films were financed
    mid-795  Miramax, New Line and the two-film problem
    mid-796  Fran Walsh and Philippa Boyens
    mid-797  Shooting three films at once
    mid-798  New Zealand as Middle-earth
    mid-799  Weta Workshop
    mid-800  Weta Digital
    mid-801  Massive and the battle crowds
    mid-802  Gollum and performance capture
    mid-803  Andy Serkis
    mid-804  Forced perspective and scale
    mid-805  Bigatures
    mid-806  Alan Lee and John Howe
    mid-807  Ngila Dickson and the costumes
    mid-808  Howard Shore's score
    mid-809  The leitmotif system in the score
    mid-810  The Fellowship of the Ring (2001)
    mid-811  The Two Towers (2002)
    mid-812  The Return of the King (2003)
    mid-813  The extended editions
    mid-814  Cutting Tom Bombadil
    mid-815  Arwen at the Ford
    mid-816  Faramir and Osgiliath
    mid-817  Denethor on screen
    mid-818  Cutting the Scouring of the Shire
    mid-819  Aragorn's reluctance
    mid-820  Gimli on screen
    mid-821  The films' battles against the book's
    mid-822  The 2004 Academy Awards
    mid-823  The box office and its effect on the industry
    mid-824  The films' effect on New Zealand
    mid-825  The appendices documentaries
    mid-826  Fan reaction at the time
    mid-827  How the films changed what readers imagine

### The Hobbit films — `mid-hobbitfilms`

    mid-828  The Hobbit film trilogy
    mid-829  Guillermo del Toro's version
    mid-830  Why del Toro left
    mid-831  Turning one book into three films
    mid-832  An Unexpected Journey
    mid-833  The Desolation of Smaug
    mid-834  The Battle of the Five Armies
    mid-835  Tauriel
    mid-836  Legolas in the Hobbit films
    mid-837  Azog
    mid-838  The White Council material
    mid-839  Material taken from the appendices
    mid-840  Forty-eight frames a second
    mid-841  The digital Smaug
    mid-842  The production's troubles
    mid-843  The Hobbit films' reception
    mid-844  The Hobbit films' box office
    mid-845  Making a prequel to a film that already exists
    mid-846  The Estate and the Hobbit films
    mid-847  The 2012 lawsuit
    mid-848  The Hobbit films as adaptation
    mid-849  The fan re-edits

### The Rings of Power — `mid-rop`

    mid-850  The Rings of Power
    mid-851  Amazon's rights deal
    mid-852  What rights Amazon actually bought
    mid-853  Adapting the appendices
    mid-854  Compressing the Second Age
    mid-855  Season one
    mid-856  Season two
    mid-857  The Stranger
    mid-858  Galadriel in The Rings of Power
    mid-859  The show's Númenor
    mid-860  Original characters in an adapted world
    mid-861  The show's design and its debt to the films
    mid-862  Bear McCreary's score
    mid-863  Filming in New Zealand and then in Britain
    mid-864  What the show cost and what that bought
    mid-865  The reception
    mid-866  Review-bombing and the racist backlash
    mid-867  The Estate's role in the show
    mid-868  The canon arguments the show provoked
    mid-869  What the show cannot use
    mid-870  Adapting a summary rather than a story
    mid-871  Where the show goes next

### Radio, stage and music — `mid-stage`

    mid-872  Tolkien on stage
    mid-873  The 2006 Toronto musical
    mid-874  The 2007 London production
    mid-875  The 2023 Watermill production
    mid-876  Tolkien in opera
    mid-877  The Hobbit as an opera
    mid-878  Tolkien and popular music
    mid-879  Led Zeppelin and Tolkien
    mid-880  Bo Hansson's Lord of the Rings
    mid-881  Tolkien in metal
    mid-882  Nightfall in Middle-earth
    mid-883  The Tolkien Ensemble
    mid-884  Donald Swann's The Road Goes Ever On
    mid-885  Tolkien's own recordings
    mid-886  Audiobooks of Tolkien
    mid-887  Rob Inglis and Andy Serkis as readers
    mid-888  The 2019 Tolkien biopic
    mid-889  Documentaries about Tolkien
    mid-890  Tolkien in comics and illustration

## The franchise

### Games on the table — `mid-tabletop`

    mid-891  Tolkien and tabletop games
    mid-892  What Dungeons and Dragons owes Tolkien
    mid-893  The 1977 cease-and-desist
    mid-894  Why D&D has halflings and not hobbits
    mid-895  Middle-earth Role Playing
    mid-896  Iron Crown Enterprises
    mid-897  What MERP had to invent
    mid-898  The Decipher roleplaying game
    mid-899  The One Ring roleplaying game
    mid-900  Adventures in Middle-earth
    mid-901  War of the Ring as a board game
    mid-902  Knizia's The Lord of the Rings
    mid-903  Cooperative board games after Knizia
    mid-904  The Lord of the Rings Living Card Game
    mid-905  The Middle-earth Strategy Battle Game
    mid-906  Miniatures and the film licence
    mid-907  Middle-earth Collectible Card Game
    mid-908  The Lord of the Rings set in Magic: The Gathering
    mid-909  The one-of-a-kind Ring card
    mid-910  Licensing a world to game designers
    mid-911  What a game is forced to invent
    mid-912  Fan-made games and the Estate

### Video games — `mid-videogames`

    mid-913  Tolkien video games
    mid-914  The Hobbit (1982)
    mid-915  Text adventures in Middle-earth
    mid-916  Lord of the Rings: Game One
    mid-917  Interplay's Middle-earth games
    mid-918  The Lord of the Rings, Vol. I (1990)
    mid-919  The film-licence games of 2002 to 2004
    mid-920  The Two Towers and The Return of the King as games
    mid-921  The Battle for Middle-earth
    mid-922  Real-time strategy in Middle-earth
    mid-923  The Lord of the Rings Online
    mid-924  LOTRO and canon
    mid-925  LOTRO's longevity
    mid-926  Guardians of Middle-earth
    mid-927  Shadow of Mordor
    mid-928  The Nemesis system
    mid-929  Shadow of War
    mid-930  The invented story of the Shadow games
    mid-931  The Estate and the video-game licence
    mid-932  Lego The Lord of the Rings
    mid-933  The Lord of the Rings: Gollum
    mid-934  Tales of the Shire
    mid-935  Return to Moria
    mid-936  Why so many Tolkien games fail
    mid-937  What a game can do that a film cannot

### Publishing, the Estate and the law — `mid-estate`

    mid-938  The Tolkien Estate
    mid-939  Christopher Tolkien as literary executor
    mid-940  The Tolkien Trust
    mid-941  The 1969 sale of the film rights
    mid-942  What the 1969 sale included
    mid-943  Saul Zaentz
    mid-944  Tolkien Enterprises
    mid-945  Middle-earth Enterprises
    mid-946  The 2022 sale to Embracer
    mid-947  Copyright in Tolkien's works
    mid-948  When Tolkien's works enter the public domain
    mid-949  The Ace Books copyright loophole
    mid-950  Trademark and the word hobbit
    mid-951  The Hobbit trademark disputes
    mid-952  The 2012 Estate lawsuit
    mid-953  The 2017 settlement
    mid-954  Christopher Tolkien's resignation
    mid-955  The Estate's change of posture after 2020
    mid-956  HarperCollins and Houghton Mifflin
    mid-957  The illustrated and deluxe editions
    mid-958  The ethics of posthumous publication
    mid-959  What is still unpublished
    mid-960  Access to the archives
    mid-961  Fan works and the law
    mid-962  Where the money goes

### Fandom — `mid-fandom`

    mid-963  Tolkien fandom
    mid-964  The first fan letters
    mid-965  The Tolkien Society
    mid-966  Oxonmoot
    mid-967  The Mythopoeic Society
    mid-968  Fanzines and the early fan press
    mid-969  Tolkien fandom online
    mid-970  TheOneRing.net
    mid-971  Fan wikis and their reliability
    mid-972  Tolkien fan fiction
    mid-973  Fan art and its conventions
    mid-974  Cosplay and reenactment
    mid-975  Tolkien tourism
    mid-976  Hobbiton as a destination
    mid-977  Tolkien's Oxford today
    mid-978  Tolkien Reading Day
    mid-979  Fan translations and unofficial editions
    mid-980  Where fan scholarship meets the academy
    mid-981  Gatekeeping in the fandom
    mid-982  What fandom has contributed to the texts

### What came after — `mid-legacy`

    mid-983  Tolkien's influence on fantasy
    mid-984  The commercial fantasy genre after 1965
    mid-985  Terry Brooks and the imitators
    mid-986  Ursula K. Le Guin's answer
    mid-987  Terry Pratchett's answer
    mid-988  George R. R. Martin's answer
    mid-989  The secondary world as a convention
    mid-990  The invented map as a genre marker
    mid-991  The constructed language as a genre marker
    mid-992  What Tolkien did to the English fantasy vocabulary
    mid-993  World-building as a practice
    mid-994  Tolkien's influence outside fantasy
    mid-995  Middle-earth in ordinary speech
    mid-996  Tolkien in education
    mid-997  Tolkien's place in the twentieth-century canon
    mid-998  Why the books have not dated as expected
    mid-999  What is left to say about Tolkien
    mid-1000  Reading Tolkien after a hundred years
